import {
  closeSync,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

import { headlineFor, type AdmissionReport, type Verdict } from './report.js';
import { DOCTRINAL_REVIEWS_PATH, FLAGGED_PAIRINGS_PATH } from './gates/doctrinalGuardrail.js';
import {
  gateApplicability,
  type GateApplicability,
  type GateFinding,
  type GateId,
  type GateResult,
  type GateStatus,
} from './gates/types.js';

export const GAUNTLET_MACHINE_REPORT_SCHEMA = 'scripture-search-engine/gauntlet-report/v1';
export const GAUNTLET_RUNNING_MARKER_SCHEMA = 'scripture-search-engine/gauntlet-running/v1';
export const GAUNTLET_FINDING_CATEGORY_SCHEMA = 'scripture-search-engine/gauntlet-finding-category/v1';
export const DEFAULT_MACHINE_REPORT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface GauntletGateDefinition {
  readonly id: GateId;
  readonly title: string;
  readonly applicability: GateApplicability;
}

/** The report is an attestation for this exact, ordered roster. */
export const GAUNTLET_GATE_ROSTER: readonly GauntletGateDefinition[] = [
  { id: 'G1-provenance', title: 'Provenance', applicability: 'required' },
  { id: 'G1b-reachability', title: 'Source reachability', applicability: 'optional-advisory' },
  { id: 'G2-determinism', title: 'Determinism', applicability: 'required' },
  { id: 'G3-golden', title: 'Golden regression', applicability: 'required' },
  { id: 'G4-collision', title: 'Concept collision', applicability: 'required' },
  { id: 'G5-distinctiveness', title: 'Distinctiveness floor', applicability: 'required' },
  { id: 'G6-signal-budgets', title: 'Signal budgets', applicability: 'required' },
  { id: 'G7-correlation', title: 'Source correlation', applicability: 'required' },
  { id: 'G8-noise-probes', title: 'Noise probes', applicability: 'required' },
  { id: 'G9-saturation', title: 'Saturation', applicability: 'required' },
  { id: 'G10-size', title: 'Size budgets', applicability: 'required' },
  { id: 'G11-latency', title: 'Latency', applicability: 'required' },
];

export type MachineGateVerdict =
  | 'pass'
  | 'reject'
  | 'advisory'
  | 'optional-not-applicable'
  | 'required-not-applicable';

export interface GauntletOptions {
  readonly checkSources: boolean;
  readonly updateBaseline: boolean;
  /**
   * Regenerates eval/baselines/ordering.snapshot.json. Optional and present
   * only when true so recorded flag identities from before the flag existed
   * stay valid; it can never appear in a machine report because it is
   * mutually exclusive with --json.
   */
  readonly updateOrderingSnapshot?: boolean;
  readonly requireAdmit: boolean;
  readonly jsonPath?: string;
  readonly candidateDescriptorPath?: string;
  readonly candidateDatabasePath?: string;
  readonly releaseDatabasePath?: string;
  /** Preserves the exact accepted CLI tokens as part of report identity. */
  readonly argv: readonly string[];
}

export interface EngineIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

export interface RepositoryRunIdentity {
  readonly gitCommitSha: string;
  readonly dirtyTreeSha256: string;
  readonly descriptor: {
    readonly path: string;
    readonly sha256: string;
  };
  readonly budgetsSha256: string;
  readonly fixtureInputSha256: string;
  readonly flags: GauntletOptions;
}

export interface GauntletRunIdentity extends RepositoryRunIdentity {
  readonly engine: EngineIdentity;
  readonly target?: GauntletTargetIdentity;
}

export interface GauntletTargetFileIdentity {
  readonly path: string;
  readonly sha256: string;
}

export interface ReleaseGauntletTargetIdentity {
  readonly kind: 'release';
  readonly descriptor: GauntletTargetFileIdentity & { readonly kind: 'scripture-search-release' };
  readonly database: GauntletTargetFileIdentity;
  readonly engine: EngineIdentity;
}

export interface CandidateGauntletTargetIdentity {
  readonly kind: 'candidate';
  readonly descriptor: GauntletTargetFileIdentity & { readonly kind: 'scripture-search-candidate' };
  readonly database: GauntletTargetFileIdentity;
  readonly engine: EngineIdentity;
  readonly baseEngine: EngineIdentity;
  readonly cacheKey: string;
  readonly proposalDigest: string;
  readonly sourceSnapshotDigest: string;
}

export type GauntletTargetIdentity = ReleaseGauntletTargetIdentity | CandidateGauntletTargetIdentity;

export interface ResolvedGauntletTarget {
  readonly identity: GauntletTargetIdentity;
  readonly descriptorPath: string;
  readonly databasePath: string;
}

export interface MachineFinding {
  /** Stable semantic category; never derived from human wording. */
  readonly categoryCode: string;
  /** Instance key may change as the concrete evidence changes. */
  readonly instanceId: string;
  readonly gateId: GateId;
  readonly gateTitle: string;
  readonly gateStatus: GateStatus;
  readonly gateVerdict: MachineGateVerdict;
  readonly message: string;
  readonly subjects: readonly string[];
  readonly params: Readonly<Record<string, string | number | boolean | readonly string[]>>;
  readonly metrics: Readonly<Record<string, number>>;
  readonly compatibility: {
    readonly categorySchema: 'scripture-search-engine/gauntlet-finding-category/v1';
    readonly categoryVersion: 1;
    readonly paramsPolicy: 'additive-only';
  };
}

export interface MachineGate {
  readonly gate: GateId;
  readonly code: string;
  readonly title: string;
  readonly status: GateStatus;
  readonly applicability: GateApplicability;
  readonly verdict: MachineGateVerdict;
  readonly summary: string;
  readonly findings: readonly MachineFinding[];
  readonly metrics: Readonly<Record<string, number>>;
  readonly promotionCandidates: readonly string[];
}

export interface GauntletMachineReport {
  readonly schema: typeof GAUNTLET_MACHINE_REPORT_SCHEMA;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly identity: GauntletRunIdentity;
  readonly payload: {
    readonly verdict: Verdict;
    readonly headline: string;
    readonly gates: readonly MachineGate[];
  };
  /** SHA-256 of canonical JSON for `payload`, not the enclosing report. */
  readonly payloadSha256: string;
  /** SHA-256 of the complete, canonical report body excluding this field. */
  readonly reportSha256: string;
}

const USAGE =
  'Usage: npm run gauntlet -- [--check-sources] [--update-baseline] [--update-ordering-snapshot] ' +
  '[--require-admit] [--json <path>] ' +
  '[--candidate-descriptor <path> --candidate-database <path> | --release-database <path>]';

export function parseGauntletOptions(argv: readonly string[]): GauntletOptions {
  let checkSources = false;
  let updateBaseline = false;
  let updateOrderingSnapshot = false;
  let requireAdmit = false;
  let jsonPath: string | undefined;
  let candidateDescriptorPath: string | undefined;
  let candidateDatabasePath: string | undefined;
  let releaseDatabasePath: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--check-sources':
        if (checkSources) throw new Error(`Duplicate --check-sources.\n${USAGE}`);
        checkSources = true;
        break;
      case '--update-baseline':
        if (updateBaseline) throw new Error(`Duplicate --update-baseline.\n${USAGE}`);
        updateBaseline = true;
        break;
      case '--update-ordering-snapshot':
        if (updateOrderingSnapshot) throw new Error(`Duplicate --update-ordering-snapshot.\n${USAGE}`);
        updateOrderingSnapshot = true;
        break;
      case '--require-admit':
        if (requireAdmit) throw new Error(`Duplicate --require-admit.\n${USAGE}`);
        requireAdmit = true;
        break;
      case '--json': {
        if (jsonPath !== undefined) throw new Error(`Duplicate --json.\n${USAGE}`);
        const path = argv[index + 1];
        if (!path || path.startsWith('--')) throw new Error(`--json requires a path.\n${USAGE}`);
        jsonPath = path;
        index += 1;
        break;
      }
      case '--candidate-descriptor':
      case '--candidate-database':
      case '--release-database': {
        const value = argv[index + 1];
        if (!value || value.startsWith('--')) throw new Error(`${arg} requires a path.\n${USAGE}`);
        if (arg === '--candidate-descriptor') {
          if (candidateDescriptorPath !== undefined) throw new Error(`Duplicate ${arg}.\n${USAGE}`);
          candidateDescriptorPath = value;
        } else if (arg === '--candidate-database') {
          if (candidateDatabasePath !== undefined) throw new Error(`Duplicate ${arg}.\n${USAGE}`);
          candidateDatabasePath = value;
        } else {
          if (releaseDatabasePath !== undefined) throw new Error(`Duplicate ${arg}.\n${USAGE}`);
          releaseDatabasePath = value;
        }
        index += 1;
        break;
      }
      default:
        throw new Error(`Unknown gauntlet argument: ${arg}\n${USAGE}`);
    }
  }

  if (updateBaseline && (requireAdmit || jsonPath !== undefined)) {
    throw new Error('--update-baseline cannot be combined with --require-admit or --json; review the new baseline separately.');
  }
  if (updateOrderingSnapshot && (requireAdmit || jsonPath !== undefined)) {
    throw new Error('--update-ordering-snapshot cannot be combined with --require-admit or --json; review the new snapshot separately.');
  }

  const hasCandidate = candidateDescriptorPath !== undefined || candidateDatabasePath !== undefined;
  if (hasCandidate && (candidateDescriptorPath === undefined || candidateDatabasePath === undefined)) {
    throw new Error(`Candidate target requires both --candidate-descriptor and --candidate-database.\n${USAGE}`);
  }
  if (hasCandidate && releaseDatabasePath !== undefined) {
    throw new Error(`Candidate and release targets are mutually exclusive.\n${USAGE}`);
  }
  if (updateBaseline && (hasCandidate || releaseDatabasePath !== undefined)) {
    throw new Error('--update-baseline cannot evaluate an explicit candidate or release target.');
  }
  if (updateOrderingSnapshot && (hasCandidate || releaseDatabasePath !== undefined)) {
    throw new Error('--update-ordering-snapshot cannot evaluate an explicit candidate or release target.');
  }

  return {
    checkSources, updateBaseline, requireAdmit,
    ...(updateOrderingSnapshot ? { updateOrderingSnapshot } : {}),
    ...(jsonPath ? { jsonPath } : {}),
    ...(candidateDescriptorPath ? { candidateDescriptorPath } : {}),
    ...(candidateDatabasePath ? { candidateDatabasePath } : {}),
    ...(releaseDatabasePath ? { releaseDatabasePath } : {}),
    argv: [...argv],
  };
}

export function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const SAFE_REPOSITORY_PATH = /^(?![a-zA-Z]:)(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9._\/-]+$/;
const CANDIDATE_DESCRIPTOR_KEYS = [
  'formatVersion', 'kind', 'cacheKey', 'proposalDigest', 'sourceSnapshotDigest',
  'provenancePolicyFingerprint', 'base', 'schemaVersion', 'engineVersion', 'tokenizerVersion',
  'corpusFingerprint', 'layerFingerprint', 'manifestFingerprint', 'databaseSha256', 'databaseBytes',
  'logicalTableDigest', 'tableDigests', 'counts',
] as const;

function requireTargetDigest(value: unknown, field: string): string {
  if (typeof value !== 'string' || !SHA256_PATTERN.test(value)) {
    throw new Error(`Gauntlet target ${field} must be a lowercase SHA-256 digest.`);
  }
  return value;
}

function repositoryTargetPath(repoRoot: string, configuredPath: string, expected: RegExp, label: string): string {
  const normalized = configuredPath.replaceAll('\\', '/');
  if (!SAFE_REPOSITORY_PATH.test(normalized) || !expected.test(normalized)) {
    throw new Error(`${label} is outside the supported repository target layout.`);
  }
  const root = realpathSync(repoRoot);
  const absolute = resolve(root, ...normalized.split('/'));
  const fromRoot = relative(root, absolute);
  if (fromRoot.startsWith(`..${sep}`) || fromRoot === '..' || isAbsolute(fromRoot)) {
    throw new Error(`${label} escaped the repository.`);
  }
  const real = realpathSync(absolute);
  if (real !== absolute || lstatSync(real).isSymbolicLink() || !lstatSync(real).isFile()) {
    throw new Error(`${label} must be a regular file with no link or junction components.`);
  }
  return real;
}

function readDescriptor(path: string, label: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  } catch {
    throw new Error(`${label} is not valid UTF-8 JSON.`);
  }
  if (!isRecord(parsed)) throw new Error(`${label} must be a JSON object.`);
  return parsed;
}

function descriptorEngine(descriptor: Record<string, unknown>, label: string): EngineIdentity {
  const engineVersion = descriptor['engineVersion'];
  if (typeof engineVersion !== 'string' || engineVersion.length === 0) {
    throw new Error(`${label}.engineVersion is invalid.`);
  }
  return {
    engineVersion,
    corpusFingerprint: requireTargetDigest(descriptor['corpusFingerprint'], `${label}.corpusFingerprint`),
    layerFingerprint: requireTargetDigest(descriptor['layerFingerprint'], `${label}.layerFingerprint`),
  };
}

function validateDatabaseBinding(
  descriptor: Record<string, unknown>,
  databasePath: string,
  label: string,
): string {
  const expectedSha = requireTargetDigest(descriptor['databaseSha256'], `${label}.databaseSha256`);
  const expectedBytes = descriptor['databaseBytes'];
  if (!Number.isSafeInteger(expectedBytes) || (expectedBytes as number) <= 0) {
    throw new Error(`${label}.databaseBytes is invalid.`);
  }
  const stats = lstatSync(databasePath);
  const actualSha = hashFile(databasePath);
  if (stats.size !== expectedBytes || actualSha !== expectedSha) {
    throw new Error(`${label} does not match the exact database bytes.`);
  }
  return actualSha;
}

/** Resolves and validates the exact database artifact selected by fixed CLI/API inputs. */
export function resolveGauntletTarget(repoRoot: string, options: GauntletOptions): ResolvedGauntletTarget | null {
  if (options.candidateDescriptorPath !== undefined) {
    const descriptorPath = repositoryTargetPath(
      repoRoot,
      options.candidateDescriptorPath,
      /^workbench\/\.state\/candidates\/([0-9a-f]{64})\/candidate-artifact\.json$/,
      'Candidate descriptor path',
    );
    const databasePath = repositoryTargetPath(
      repoRoot,
      options.candidateDatabasePath!,
      /^workbench\/\.state\/candidates\/([0-9a-f]{64})\/content\.db$/,
      'Candidate database path',
    );
    if (dirname(descriptorPath) !== dirname(databasePath)) {
      throw new Error('Candidate descriptor and database must be in the same content-addressed directory.');
    }
    const descriptor = readDescriptor(descriptorPath, 'Candidate descriptor');
    if (!exactKeys(descriptor, CANDIDATE_DESCRIPTOR_KEYS) || descriptor['formatVersion'] !== 1
        || descriptor['kind'] !== 'scripture-search-candidate') {
      throw new Error('Candidate descriptor does not use the supported strict schema.');
    }
    const directoryKey = basename(dirname(descriptorPath));
    if (descriptor['cacheKey'] !== directoryKey) throw new Error('Candidate descriptor cacheKey does not match its directory.');
    const databaseSha256 = validateDatabaseBinding(descriptor, databasePath, 'Candidate descriptor');
    const engine = descriptorEngine(descriptor, 'Candidate descriptor');
    const cacheKey = requireTargetDigest(descriptor['cacheKey'], 'candidate.cacheKey');
    const proposalDigest = requireTargetDigest(descriptor['proposalDigest'], 'candidate.proposalDigest');
    const sourceSnapshotDigest = requireTargetDigest(descriptor['sourceSnapshotDigest'], 'candidate.sourceSnapshotDigest');
    requireTargetDigest(descriptor['provenancePolicyFingerprint'], 'candidate.provenancePolicyFingerprint');
    requireTargetDigest(descriptor['manifestFingerprint'], 'candidate.manifestFingerprint');
    requireTargetDigest(descriptor['logicalTableDigest'], 'candidate.logicalTableDigest');
    if (!isRecord(descriptor['base']) || !isRecord(descriptor['tableDigests']) || !isRecord(descriptor['counts'])) {
      throw new Error('Candidate descriptor nested measurements are invalid.');
    }
    if (!exactKeys(descriptor['base'], [
      'databaseSha256', 'schemaVersion', 'engineVersion', 'tokenizerVersion', 'corpusFingerprint',
      'layerFingerprint', 'manifestFingerprint', 'provenancePolicyFingerprint',
    ])) {
      throw new Error('Candidate descriptor base identity does not use the strict schema.');
    }
    for (const field of ['schemaVersion', 'tokenizerVersion'] as const) {
      if (typeof descriptor[field] !== 'string' || descriptor[field].length === 0
          || typeof descriptor['base'][field] !== 'string' || descriptor['base'][field].length === 0) {
        throw new Error(`Candidate descriptor ${field} is invalid.`);
      }
    }
    for (const field of ['databaseSha256', 'corpusFingerprint', 'layerFingerprint', 'manifestFingerprint', 'provenancePolicyFingerprint'] as const) {
      requireTargetDigest(descriptor['base'][field], `candidate.base.${field}`);
    }
    for (const digest of Object.values(descriptor['tableDigests'])) requireTargetDigest(digest, 'candidate.tableDigests[]');
    for (const count of Object.values(descriptor['counts'])) {
      if (!Number.isSafeInteger(count) || (count as number) < 0) throw new Error('Candidate descriptor counts are invalid.');
    }
    return {
      descriptorPath,
      databasePath,
      identity: {
        kind: 'candidate',
        descriptor: {
          kind: 'scripture-search-candidate',
          path: relative(realpathSync(repoRoot), descriptorPath).replaceAll('\\', '/'),
          sha256: hashFile(descriptorPath),
        },
        database: {
          path: relative(realpathSync(repoRoot), databasePath).replaceAll('\\', '/'),
          sha256: databaseSha256,
        },
        engine,
        baseEngine: descriptorEngine(descriptor['base'], 'Candidate descriptor.base'),
        cacheKey,
        proposalDigest,
        sourceSnapshotDigest,
      },
    };
  }
  if (options.releaseDatabasePath !== undefined) {
    const descriptorPath = repositoryTargetPath(
      repoRoot,
      'artifacts/content-artifact.json',
      /^artifacts\/content-artifact\.json$/,
      'Release descriptor path',
    );
    const databasePath = repositoryTargetPath(
      repoRoot,
      options.releaseDatabasePath,
      /^workbench\/\.artifact\/content\.db$/,
      'Release database path',
    );
    const descriptor = readDescriptor(descriptorPath, 'Release descriptor');
    if (descriptor['formatVersion'] !== 1 || typeof descriptor['schemaVersion'] !== 'string') {
      throw new Error('Release descriptor header is invalid.');
    }
    const databaseSha256 = validateDatabaseBinding(descriptor, databasePath, 'Release descriptor');
    return {
      descriptorPath,
      databasePath,
      identity: {
        kind: 'release',
        descriptor: {
          kind: 'scripture-search-release',
          path: 'artifacts/content-artifact.json',
          sha256: hashFile(descriptorPath),
        },
        database: { path: 'workbench/.artifact/content.db', sha256: databaseSha256 },
        engine: descriptorEngine(descriptor, 'Release descriptor'),
      },
    };
  }
  return null;
}

/** CLI report paths are repository-root-relative and confined to eval/.runs. */
export function resolveMachineReportPath(repoRoot: string, configuredPath: string): string {
  const runsRoot = resolve(repoRoot, 'eval', '.runs');
  const outputPath = resolve(repoRoot, configuredPath);
  const fromRunsRoot = relative(runsRoot, outputPath);
  const isInsideRuns = fromRunsRoot.length > 0 &&
    !fromRunsRoot.startsWith(`..${sep}`) && fromRunsRoot !== '..' && !fromRunsRoot.includes(`..${sep}`) &&
    !isAbsolute(fromRunsRoot);
  if (!isInsideRuns || !outputPath.endsWith('.json')) {
    throw new Error('--json must name a .json file inside the repository eval/.runs directory.');
  }
  return outputPath;
}

/** JSON.stringify does not promise key order for objects assembled by callers. */
export function canonicalJson(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value !== 'object') {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new TypeError('Canonical JSON does not support undefined values.');
    return serialized;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

function hashFile(path: string): string {
  return sha256(readFileSync(path));
}

/** Fixture inputs are parsed text, so CRLF and LF are the same evaluated input. */
function fixtureFileSha256(path: string): string {
  return sha256(readFileSync(path, 'utf8').replace(/\r\n/g, '\n'));
}

function listFilesRecursively(root: string): string[] {
  if (!existsSync(root)) return [];
  const entries: string[] = [];
  const visit = (directory: string): void => {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      if (lstatSync(path).isDirectory()) visit(path);
      else entries.push(path);
    }
  };
  visit(root);
  return entries;
}

function git(repoRoot: string, args: readonly string[]): string {
  return execFileSync('git', [...args], { cwd: repoRoot, encoding: 'utf8', windowsHide: true }).trim();
}

interface DirtyPath {
  readonly status: string;
  readonly path: string;
  readonly sha256: string | null;
}

/**
 * Hash the visible worktree state, including every nonignored untracked file.
 * Git's porcelain list gives us the relevant repository paths; hashing their
 * current bytes prevents a timestamp-only or path-only "dirty" identity.
 */
export function dirtyTreeSha256(
  repoRoot: string,
  excludedAbsolutePaths: readonly string[] = [],
): string {
  const excluded = new Set(excludedAbsolutePaths.map((path) => resolve(path)));
  const raw = execFileSync(
    'git',
    ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignored=no'],
    { cwd: repoRoot, encoding: 'buffer', windowsHide: true },
  ) as Buffer;
  const records = raw.toString('utf8').split('\0');
  const paths: DirtyPath[] = [];

  for (let index = 0; index < records.length - 1; index += 1) {
    const record = records[index]!;
    if (record.length < 4) continue;
    const status = record.slice(0, 2);
    const path = record.slice(3);
    // In porcelain -z rename/copy records are followed by their source path.
    if (status.includes('R') || status.includes('C')) index += 1;
    const absolutePath = resolve(repoRoot, path);
    if (excluded.has(absolutePath)) continue;
    const insideRepo = absolutePath === repoRoot || absolutePath.startsWith(`${repoRoot}${sep}`);
    paths.push({
      status,
      path,
      sha256: insideRepo && existsSync(absolutePath) && !lstatSync(absolutePath).isDirectory()
        ? hashFile(absolutePath)
        : null,
    });
  }

  return sha256(canonicalJson(paths.sort((left, right) => left.path.localeCompare(right.path))));
}

/**
 * The fixture-input roster. Every reviewed data file that can change what the
 * gauntlet evaluates must appear here, either under an enumerated root or as a
 * named file — an edit that cannot move fixtureInputSha256 is invisible to the
 * input-identity check. Directory roots are hashed recursively; named files
 * cover reviewed data living outside those roots (the doctrinal guardrail's
 * review and flagged-pairing tables sit beside, not inside, ontology/concepts).
 */
function fixtureInputs(repoRoot: string): string[] {
  const roots = [
    join(repoRoot, 'eval', 'golden'),
    join(repoRoot, 'eval', 'probes'),
    join(repoRoot, 'eval', 'baselines'),
    join(repoRoot, 'ontology', 'concepts'),
    join(repoRoot, 'pipeline', 'fixtures'),
    join(repoRoot, 'pipeline', 'manifests'),
  ];
  // Named files come from the guardrail gate's own path constants, so a
  // move/rename through those constants carries gate and roster together.
  const files = [DOCTRINAL_REVIEWS_PATH, FLAGGED_PAIRINGS_PATH].map((path) =>
    join(repoRoot, path),
  );
  return [...roots.flatMap(listFilesRecursively), ...files.filter(existsSync)].sort();
}

export function fixtureInputSha256(repoRoot: string): string {
  const entries = fixtureInputs(repoRoot).map((path) => ({
    path: relative(repoRoot, path).replaceAll('\\', '/'),
    sha256: fixtureFileSha256(path),
  }));
  return sha256(canonicalJson(entries));
}

export function captureRepositoryIdentity(
  repoRoot: string,
  options: GauntletOptions,
): RepositoryRunIdentity {
  const descriptorPath = join(repoRoot, 'artifacts', 'content-artifact.json');
  if (!existsSync(descriptorPath)) {
    throw new Error('Gauntlet machine report requires artifacts/content-artifact.json.');
  }
  return {
    gitCommitSha: git(repoRoot, ['rev-parse', 'HEAD']),
    // A report may be written to a nonignored in-repo path. It cannot be part
    // of the identity it records, or the next run would attest to the prior
    // report rather than the inputs it actually evaluated. The exact raw path
    // remains in `flags`, so this exclusion is explicit and auditable.
    dirtyTreeSha256: dirtyTreeSha256(
      repoRoot,
      options.jsonPath === undefined ? [] : [resolveMachineReportPath(repoRoot, options.jsonPath)],
    ),
    descriptor: {
      path: relative(repoRoot, descriptorPath).replaceAll('\\', '/'),
      sha256: hashFile(descriptorPath),
    },
    budgetsSha256: hashFile(join(repoRoot, 'eval', 'budgets.json')),
    fixtureInputSha256: fixtureInputSha256(repoRoot),
    flags: options,
  };
}

export function captureRunIdentity(
  repoRoot: string,
  options: GauntletOptions,
  engine: EngineIdentity,
  repositoryIdentity: RepositoryRunIdentity = captureRepositoryIdentity(repoRoot, options),
  target?: GauntletTargetIdentity,
): GauntletRunIdentity {
  return {
    ...repositoryIdentity,
    engine: {
      engineVersion: engine.engineVersion,
      corpusFingerprint: engine.corpusFingerprint,
      layerFingerprint: engine.layerFingerprint,
    },
    ...(target === undefined ? {} : { target }),
  };
}

export function repositoryIdentitiesMatch(
  left: RepositoryRunIdentity,
  right: RepositoryRunIdentity,
): boolean {
  return canonicalJson(left) === canonicalJson(right);
}

function machineGateVerdict(status: GateStatus, applicability: GateApplicability): MachineGateVerdict {
  if (status === 'fail') return 'reject';
  if (status === 'warn') return 'advisory';
  if (status === 'not-applicable') {
    return applicability === 'optional-advisory'
      ? 'optional-not-applicable'
      : 'required-not-applicable';
  }
  return 'pass';
}

function findingCategoryPattern(gate: GateId): RegExp {
  return new RegExp(`^sse\\.gauntlet\\.v1\\.finding\\.${gate.toLowerCase()}\\.[a-z][a-z0-9-]*$`);
}

function isSemanticFindingCategory(gate: GateId, value: unknown): value is string {
  return typeof value === 'string' && findingCategoryPattern(gate).test(value);
}

function categoryCode(gate: AdmissionReport['gates'][number], finding: GateFinding): string {
  const category = finding.categoryCode ?? `sse.gauntlet.v1.finding.${gate.gate.toLowerCase()}.reported`;
  if (!isSemanticFindingCategory(gate.gate, category)) {
    throw new Error(`Invalid semantic category for ${gate.gate}: ${category}`);
  }
  return category;
}

function findingCompatibility(): MachineFinding['compatibility'] {
  return {
    categorySchema: GAUNTLET_FINDING_CATEGORY_SCHEMA,
    categoryVersion: 1,
    paramsPolicy: 'additive-only',
  };
}

function findingInstanceId(input: {
  readonly category: string;
  readonly gate: GateId;
  readonly status: GateStatus;
  readonly params: Readonly<Record<string, string | number | boolean | readonly string[]>>;
  readonly metrics: Readonly<Record<string, number>>;
  readonly message: string;
}): string {
  return `sse.gauntlet.v1.finding-instance.${sha256(
    canonicalJson(input),
  ).slice(0, 16)}`;
}

function toMachineFinding(
  gate: AdmissionReport['gates'][number],
  finding: NonNullable<AdmissionReport['gates'][number]['findings']>[number],
): MachineFinding {
  const category = categoryCode(gate, finding);
  const subjects = [...(finding.subjects ?? [])];
  const params = { ...(finding.params ?? {}), subjects };
  const metrics = { ...(finding.metrics ?? gate.metrics ?? {}) };
  const instanceId = findingInstanceId({
    category,
    gate: gate.gate,
    status: gate.status,
    params,
    metrics,
    message: finding.message,
  });
  return {
    categoryCode: category,
    instanceId,
    gateId: gate.gate,
    gateTitle: gate.title,
    gateStatus: gate.status,
    gateVerdict: machineGateVerdict(gate.status, gate.applicability),
    message: finding.message,
    subjects,
    params,
    metrics,
    compatibility: findingCompatibility(),
  };
}

function toMachineGate(gate: AdmissionReport['gates'][number]): MachineGate {
  const prefix = `sse.gauntlet.v1.${gate.gate.toLowerCase()}`;
  return {
    gate: gate.gate,
    code: `${prefix}.${gate.status}`,
    title: gate.title,
    status: gate.status,
    applicability: gate.applicability,
    verdict: machineGateVerdict(gate.status, gate.applicability),
    summary: gate.summary,
    findings: (gate.findings ?? []).map((finding) => toMachineFinding(gate, finding)),
    metrics: { ...(gate.metrics ?? {}) },
    promotionCandidates: [...(gate.promotionCandidates ?? [])].sort(),
  };
}

export function buildMachineReport(input: {
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly identity: GauntletRunIdentity;
  readonly report: AdmissionReport;
}): GauntletMachineReport {
  const payload = {
    verdict: input.report.verdict,
    headline: input.report.headline,
    gates: input.report.gates.map(toMachineGate),
  };
  const unsigned: Omit<GauntletMachineReport, 'reportSha256'> = {
    schema: GAUNTLET_MACHINE_REPORT_SCHEMA,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    identity: input.identity,
    payload,
    payloadSha256: sha256(canonicalJson(payload)),
  };
  return { ...unsigned, reportSha256: sha256(canonicalJson(unsigned)) };
}

export interface FreshnessMismatch {
  readonly code: string;
  readonly message: string;
  readonly expected?: string;
  readonly actual?: string;
}

export interface MachineReportFreshness {
  readonly fresh: boolean;
  readonly mismatches: readonly FreshnessMismatch[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isDigest(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
}

function isCommit(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{40}$/.test(value);
}

function addShapeMismatch(mismatches: FreshnessMismatch[], condition: boolean, field: string): void {
  if (!condition) mismatches.push({
    code: 'sse.gauntlet.v1.freshness.invalid-shape',
    message: `Machine report field ${field} is missing or malformed.`,
  });
}

function exactKeys(record: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(record).sort();
  return actual.length === keys.length && actual.every((key, index) => key === [...keys].sort()[index]);
}

function isIsoInstant(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

function isFiniteMetrics(value: unknown): value is Record<string, number> {
  return isRecord(value) && Object.values(value).every((metric) => typeof metric === 'number' && Number.isFinite(metric));
}

function isParams(value: unknown): value is Record<string, string | number | boolean | readonly string[]> {
  return isRecord(value) && Object.values(value).every((entry) =>
    typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean' ||
    (Array.isArray(entry) && entry.every((item) => typeof item === 'string')),
  );
}

function expectedMachineVerdict(status: GateStatus, applicability: GateApplicability): MachineGateVerdict {
  return machineGateVerdict(status, applicability);
}

function expectedPayloadVerdict(gates: readonly Record<string, unknown>[]): Verdict {
  if (gates.some((gate) => gate['status'] === 'fail' || gate['verdict'] === 'required-not-applicable')) {
    return 'REJECT';
  }
  if (gates.some((gate) => gate['status'] === 'warn')) return 'ADMIT_WITH_WARNINGS';
  return 'ADMIT';
}

function expectedPayloadHeadline(gates: readonly Record<string, unknown>[]): string {
  const reportGates = gates.map((gate) => ({
    gate: gate['gate'],
    title: gate['title'],
    status: gate['status'],
    applicability: gate['applicability'],
    summary: '',
  })) as GateResult[];
  return headlineFor(expectedPayloadVerdict(gates), reportGates);
}

function validEngineIdentity(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && exactKeys(value, ['engineVersion', 'corpusFingerprint', 'layerFingerprint'])
    && typeof value['engineVersion'] === 'string' && value['engineVersion'].length > 0
    && isDigest(value['corpusFingerprint']) && isDigest(value['layerFingerprint']);
}

function validTargetIdentity(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value) || (value['kind'] !== 'release' && value['kind'] !== 'candidate')
      || !isRecord(value['descriptor']) || !isRecord(value['database']) || !validEngineIdentity(value['engine'])) {
    return false;
  }
  const descriptor = value['descriptor'];
  const database = value['database'];
  const fileValid = (file: Record<string, unknown>) => typeof file['path'] === 'string' && file['path'].length > 0
    && isDigest(file['sha256']);
  if (!exactKeys(database, ['path', 'sha256']) || !fileValid(database)) return false;
  if (!exactKeys(descriptor, ['kind', 'path', 'sha256']) || !fileValid(descriptor)) return false;
  if (value['kind'] === 'release') {
    return exactKeys(value, ['kind', 'descriptor', 'database', 'engine'])
      && descriptor['kind'] === 'scripture-search-release'
      && descriptor['path'] === 'artifacts/content-artifact.json'
      && database['path'] === 'workbench/.artifact/content.db';
  }
  return exactKeys(value, [
    'kind', 'descriptor', 'database', 'engine', 'baseEngine', 'cacheKey', 'proposalDigest', 'sourceSnapshotDigest',
  ]) && descriptor['kind'] === 'scripture-search-candidate'
    && validEngineIdentity(value['baseEngine'])
    && isDigest(value['cacheKey']) && isDigest(value['proposalDigest']) && isDigest(value['sourceSnapshotDigest'])
    && descriptor['path'] === `workbench/.state/candidates/${value['cacheKey']}/candidate-artifact.json`
    && database['path'] === `workbench/.state/candidates/${value['cacheKey']}/content.db`;
}

function reportShapeMismatches(parsed: Record<string, unknown>, nowMs: number, maxAgeMs: number): FreshnessMismatch[] {
  const mismatches: FreshnessMismatch[] = [];
  addShapeMismatch(mismatches, exactKeys(parsed, ['schema', 'startedAt', 'finishedAt', 'identity', 'payload', 'payloadSha256', 'reportSha256']), 'report keys');
  addShapeMismatch(mismatches, parsed['schema'] === GAUNTLET_MACHINE_REPORT_SCHEMA, 'schema');
  addShapeMismatch(mismatches, isIsoInstant(parsed['startedAt']), 'startedAt');
  addShapeMismatch(mismatches, isIsoInstant(parsed['finishedAt']), 'finishedAt');
  addShapeMismatch(mismatches, isRecord(parsed['identity']), 'identity');
  addShapeMismatch(mismatches, isRecord(parsed['payload']), 'payload');
  addShapeMismatch(mismatches, isDigest(parsed['payloadSha256']), 'payloadSha256');
  addShapeMismatch(mismatches, isDigest(parsed['reportSha256']), 'reportSha256');
  if (mismatches.length > 0 || !isRecord(parsed['identity']) || !isRecord(parsed['payload'])) return mismatches;

  const identity = parsed['identity'];
  const payload = parsed['payload'];
  const descriptor = identity['descriptor'];
  const engine = identity['engine'];
  const flags = identity['flags'];
  const target = identity['target'];
  const hasTarget = Object.hasOwn(identity, 'target');
  addShapeMismatch(mismatches, exactKeys(identity, [
    'gitCommitSha', 'dirtyTreeSha256', 'descriptor', 'engine', 'budgetsSha256', 'fixtureInputSha256', 'flags',
    ...(hasTarget ? ['target'] : []),
  ]), 'identity keys');
  addShapeMismatch(mismatches, isCommit(identity['gitCommitSha']), 'identity.gitCommitSha');
  addShapeMismatch(mismatches, isDigest(identity['dirtyTreeSha256']), 'identity.dirtyTreeSha256');
  addShapeMismatch(mismatches, isRecord(descriptor) && exactKeys(descriptor, ['path', 'sha256']) && descriptor['path'] === 'artifacts/content-artifact.json' && isDigest(descriptor['sha256']), 'identity.descriptor');
  addShapeMismatch(mismatches, validEngineIdentity(engine), 'identity.engine');
  addShapeMismatch(mismatches, !hasTarget || (validTargetIdentity(target) && canonicalJson((target as Record<string, unknown>)['engine']) === canonicalJson(engine)), 'identity.target');
  addShapeMismatch(mismatches, isDigest(identity['budgetsSha256']), 'identity.budgetsSha256');
  addShapeMismatch(mismatches, isDigest(identity['fixtureInputSha256']), 'identity.fixtureInputSha256');
  addShapeMismatch(mismatches, isRecord(flags) && typeof flags['checkSources'] === 'boolean'
    && typeof flags['updateBaseline'] === 'boolean' && typeof flags['requireAdmit'] === 'boolean'
    && typeof flags['jsonPath'] === 'string' && flags['jsonPath'].length > 0
    && Array.isArray(flags['argv']) && flags['argv'].every((value) => typeof value === 'string'), 'identity.flags');
  addShapeMismatch(mismatches, exactKeys(payload, ['verdict', 'headline', 'gates']) && typeof payload['headline'] === 'string' && payload['headline'].length > 0 && Array.isArray(payload['gates']) && payload['gates'].length === GAUNTLET_GATE_ROSTER.length, 'payload');
  if (mismatches.length > 0 || !isRecord(engine) || !isRecord(flags) || !Array.isArray(payload['gates'])) return mismatches;

  try {
    const reparsed = parseGauntletOptions(flags['argv'] as string[]);
    const flagsMatch = canonicalJson(reparsed) === canonicalJson(flags);
    addShapeMismatch(mismatches, flagsMatch, 'identity.flags.argv consistency');
  } catch {
    addShapeMismatch(mismatches, false, 'identity.flags.argv consistency');
  }

  const seen = new Set<string>();
  for (const [index, candidate] of payload['gates'].entries()) {
    const expected = GAUNTLET_GATE_ROSTER[index];
    if (!isRecord(candidate) || !expected) {
      addShapeMismatch(mismatches, false, `payload.gates[${index}]`);
      continue;
    }
    const status = candidate['status'];
    const applicability = candidate['applicability'];
    const findings = candidate['findings'];
    const validStatus: GateStatus[] = ['pass', 'fail', 'warn', 'not-applicable'];
    const hasPromotionCandidates = Object.hasOwn(candidate, 'promotionCandidates');
    const promotionCandidates = hasPromotionCandidates ? candidate['promotionCandidates'] : [];
    const validPromotionCandidates = Array.isArray(promotionCandidates) &&
      promotionCandidates.every((value) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) &&
      canonicalJson(promotionCandidates) === canonicalJson([...new Set(promotionCandidates)].sort()) &&
      (expected.id === 'G3-golden' || promotionCandidates.length === 0);
    const validKeys = exactKeys(candidate, [
      'gate', 'code', 'title', 'status', 'applicability', 'verdict', 'summary', 'findings', 'metrics',
      ...(hasPromotionCandidates ? ['promotionCandidates'] : []),
    ]);
    const valid = validKeys &&
      candidate['gate'] === expected.id && !seen.has(expected.id) && candidate['title'] === expected.title && applicability === expected.applicability && applicability === gateApplicability(expected.id) && typeof status === 'string' && validStatus.includes(status as GateStatus) && candidate['code'] === `sse.gauntlet.v1.${expected.id.toLowerCase()}.${status}` && candidate['verdict'] === expectedMachineVerdict(status as GateStatus, applicability as GateApplicability) && typeof candidate['summary'] === 'string' && candidate['summary'].length > 0 && Array.isArray(findings) && isFiniteMetrics(candidate['metrics']) && validPromotionCandidates && !((status === 'fail' || status === 'warn') && findings.length === 0) && !(status === 'not-applicable' && findings.length > 0);
    addShapeMismatch(mismatches, valid, `payload.gates[${index}]`);
    seen.add(expected.id);
    if (!Array.isArray(findings)) continue;
    for (const [findingIndex, finding] of findings.entries()) {
      const compatibility = isRecord(finding) ? finding['compatibility'] : undefined;
      const params = isRecord(finding) && isParams(finding['params']) ? finding['params'] : undefined;
      const metrics = isRecord(finding) && isFiniteMetrics(finding['metrics']) ? finding['metrics'] : undefined;
      const message = isRecord(finding) && typeof finding['message'] === 'string' ? finding['message'] : undefined;
      const category = isRecord(finding) && isSemanticFindingCategory(expected.id, finding['categoryCode'])
        ? finding['categoryCode']
        : undefined;
      const expectedInstance = category && params && metrics && message && typeof status === 'string'
        ? findingInstanceId({
          category,
          gate: expected.id,
          status: status as GateStatus,
          params,
          metrics,
          message,
        })
        : undefined;
      const validFinding = isRecord(finding) && exactKeys(finding, ['categoryCode', 'instanceId', 'gateId', 'gateTitle', 'gateStatus', 'gateVerdict', 'message', 'subjects', 'params', 'metrics', 'compatibility']) && category !== undefined && finding['instanceId'] === expectedInstance && finding['gateId'] === expected.id && finding['gateTitle'] === expected.title && finding['gateStatus'] === status && finding['gateVerdict'] === candidate['verdict'] && message !== undefined && message.length > 0 && Array.isArray(finding['subjects']) && finding['subjects'].every((subject) => typeof subject === 'string') && params !== undefined && canonicalJson(params['subjects']) === canonicalJson(finding['subjects']) && metrics !== undefined && isRecord(compatibility) && canonicalJson(compatibility) === canonicalJson(findingCompatibility());
      addShapeMismatch(mismatches, validFinding, `payload.gates[${index}].findings[${findingIndex}]`);
    }
  }

  const started = Date.parse(parsed['startedAt'] as string);
  const finished = Date.parse(parsed['finishedAt'] as string);
  addShapeMismatch(mismatches, started <= finished, 'timestamp ordering');
  addShapeMismatch(mismatches, finished <= nowMs, 'finishedAt future time');
  addShapeMismatch(mismatches, nowMs - finished <= maxAgeMs, 'report maximum age');
  const verdict = payload['verdict'];
  const gates = payload['gates'] as Record<string, unknown>[];
  const expectedVerdict = expectedPayloadVerdict(gates);
  addShapeMismatch(mismatches, typeof verdict === 'string' && verdict === expectedVerdict, 'payload verdict consistency');
  addShapeMismatch(mismatches, payload['headline'] === expectedPayloadHeadline(gates), 'payload headline consistency');
  return mismatches;
}

/**
 * Verifies a parsed report without writing files or throwing on untrusted JSON.
 *
 * It intentionally recomputes only repository-observable values. The
 * gauntlet's fixture database is deliberately smaller than the release
 * artifact, so its corpus/layer fingerprints must remain the measured values
 * recorded in the report. Only engineVersion is compared to the reviewed
 * descriptor; fixture-input and dirty-tree digests bind the fixture corpus
 * and layer that actually ran.
 */
export function verifyMachineReportFreshness(
  repoRoot: string,
  reportPath: string,
  parsed: unknown,
  options: { readonly now?: Date | number; readonly maxAgeMs?: number } = {},
): MachineReportFreshness {
  if (!isRecord(parsed)) {
    return {
      fresh: false,
      mismatches: [{
        code: 'sse.gauntlet.v1.freshness.invalid-shape',
        message: 'Machine report must be a JSON object.',
      }],
    };
  }
  const nowMs = options.now instanceof Date ? options.now.valueOf() : options.now ?? Date.now();
  const maxAgeMs = options.maxAgeMs ?? DEFAULT_MACHINE_REPORT_MAX_AGE_MS;
  const mismatches = reportShapeMismatches(parsed, nowMs, maxAgeMs);
  if (mismatches.length > 0) return { fresh: false, mismatches };
  const identity = parsed['identity'] as Record<string, unknown>;
  const payload = parsed['payload'] as Record<string, unknown>;
  const descriptor = identity['descriptor'] as Record<string, unknown>;
  const engine = identity['engine'] as Record<string, unknown>;
  const flags = identity['flags'] as Record<string, unknown>;
  const target = identity['target'] as Record<string, unknown> | undefined;

  const expectedPayloadDigest = sha256(canonicalJson(payload));
  if (parsed['payloadSha256'] !== expectedPayloadDigest) {
    mismatches.push({
      code: 'sse.gauntlet.v1.freshness.payload-digest-mismatch',
      message: 'Machine report payload digest does not match its payload.',
      expected: expectedPayloadDigest,
      actual: String(parsed['payloadSha256']),
    });
  }
  const { reportSha256, ...unsigned } = parsed;
  const expectedReportDigest = sha256(canonicalJson(unsigned));
  if (reportSha256 !== expectedReportDigest) {
    mismatches.push({
      code: 'sse.gauntlet.v1.freshness.report-digest-mismatch',
      message: 'Machine report digest does not match its enclosing report.',
      expected: expectedReportDigest,
      actual: String(reportSha256),
    });
  }

  try {
    const resolvedReportPath = resolve(reportPath);
    if (resolveMachineReportPath(repoRoot, flags['jsonPath'] as string) !== resolvedReportPath) {
      mismatches.push({
        code: 'sse.gauntlet.v1.freshness.report-path-mismatch',
        message: 'Machine report path does not match the bound --json flag.',
        expected: resolvedReportPath,
        actual: resolveMachineReportPath(repoRoot, flags['jsonPath'] as string),
      });
    }
    const actualCommit = git(repoRoot, ['rev-parse', 'HEAD']);
    if (identity['gitCommitSha'] !== actualCommit) {
      mismatches.push({
        code: 'sse.gauntlet.v1.freshness.commit-mismatch',
        message: 'Machine report was generated from a different Git commit.',
        expected: actualCommit,
        actual: String(identity['gitCommitSha']),
      });
    }
    const actualDirtyTree = dirtyTreeSha256(repoRoot, [resolvedReportPath]);
    if (identity['dirtyTreeSha256'] !== actualDirtyTree) {
      mismatches.push({
        code: 'sse.gauntlet.v1.freshness.dirty-tree-mismatch',
        message: 'Repository changes no longer match the machine report identity.',
        expected: actualDirtyTree,
        actual: String(identity['dirtyTreeSha256']),
      });
    }
    const descriptorPath = join(repoRoot, 'artifacts', 'content-artifact.json');
    const actualDescriptorSha = hashFile(descriptorPath);
    if (descriptor['sha256'] !== actualDescriptorSha) {
      mismatches.push({
        code: 'sse.gauntlet.v1.freshness.descriptor-mismatch',
        message: 'Reviewed artifact descriptor bytes changed after this report.',
        expected: actualDescriptorSha,
        actual: String(descriptor['sha256']),
      });
    }
    if (target !== undefined) {
      const resolvedTarget = resolveGauntletTarget(repoRoot, parseGauntletOptions(flags['argv'] as string[]));
      if (resolvedTarget === null || canonicalJson(resolvedTarget.identity) !== canonicalJson(target)) {
        mismatches.push({
          code: 'sse.gauntlet.v1.freshness.target-mismatch',
          message: 'Evaluated target descriptor, database, or identity changed after this report.',
          expected: resolvedTarget === null ? 'explicit target' : canonicalJson(resolvedTarget.identity),
          actual: canonicalJson(target),
        });
      }
    }
    const actualBudgetsSha = hashFile(join(repoRoot, 'eval', 'budgets.json'));
    if (identity['budgetsSha256'] !== actualBudgetsSha) {
      mismatches.push({
        code: 'sse.gauntlet.v1.freshness.budgets-mismatch',
        message: 'Gauntlet budgets changed after this report.',
        expected: actualBudgetsSha,
        actual: String(identity['budgetsSha256']),
      });
    }
    const actualFixtureSha = fixtureInputSha256(repoRoot);
    if (identity['fixtureInputSha256'] !== actualFixtureSha) {
      mismatches.push({
        code: 'sse.gauntlet.v1.freshness.fixture-input-mismatch',
        message: 'Fixture or ontology inputs changed after this report.',
        expected: actualFixtureSha,
        actual: String(identity['fixtureInputSha256']),
      });
    }
    const baselinePath = join(repoRoot, 'eval', 'baselines', 'probes.json');
    // Legacy fixture reports attest that the fixture and baseline identities
    // are identical. Explicit targets intentionally measure a new artifact
    // against that independently approved baseline; their exact identity is
    // instead revalidated from target descriptor and database bytes above.
    if (target === undefined && existsSync(baselinePath)) {
      const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as Record<string, unknown>;
      const baselineTriple = [
        ['engineVersion', baseline['engineVersion'], engine['engineVersion']],
        ['corpusFingerprint', baseline['corpusFingerprint'], engine['corpusFingerprint']],
        ['layerFingerprint', baseline['layerFingerprint'], engine['layerFingerprint']],
      ] as const;
      for (const [field, expected, actual] of baselineTriple) {
        if (typeof expected !== 'string' || expected.length === 0 || expected !== actual) {
          mismatches.push({
            code: 'sse.gauntlet.v1.freshness.baseline-engine-identity-mismatch',
            message: `Fixture ${field} does not match the reviewed probe baseline.`,
            expected: String(expected),
            actual: String(actual),
          });
        }
      }
    }
  } catch (error) {
    mismatches.push({
      code: 'sse.gauntlet.v1.freshness.verification-error',
      message: `Could not recompute report freshness: ${error instanceof Error ? error.message : 'unknown error'}`,
    });
  }
  return { fresh: mismatches.length === 0, mismatches };
}

function writeJsonAtomically(path: string, value: unknown): void {
  const outputPath = resolve(path);
  const directory = dirname(outputPath);
  mkdirSync(directory, { recursive: true });
  const tempPath = join(
    directory,
    `.${basename(outputPath)}.${process.pid}.${randomBytes(8).toString('hex')}.tmp`,
  );
  try {
    const descriptor = openSync(tempPath, 'wx', 0o600);
    try {
      writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    } finally {
      closeSync(descriptor);
    }
    renameSync(tempPath, outputPath);
  } catch (error) {
    try {
      rmSync(tempPath, { force: true });
    } catch {
      // The original failure is more useful than cleanup trouble.
    }
    throw error;
  }
}

/** Writes a completed report by same-directory temp file then atomic rename. */
export function writeMachineReportAtomically(path: string, report: GauntletMachineReport): void {
  writeJsonAtomically(path, report);
}

export interface GauntletRunMarker {
  readonly schema: typeof GAUNTLET_RUNNING_MARKER_SCHEMA;
  readonly pid: number;
  readonly startedAt: string;
  readonly identity: RepositoryRunIdentity;
}

export interface GauntletRunMarkerState {
  readonly path: string;
  readonly marker: GauntletRunMarker | null;
  readonly state: 'running' | 'stale' | 'invalid';
}

export function writeGauntletRunMarker(
  repoRoot: string,
  startedAt: string,
  identity: RepositoryRunIdentity,
): string {
  const path = join(repoRoot, 'eval', '.runs', `gauntlet-running-${process.pid}.json`);
  writeJsonAtomically(path, {
    schema: GAUNTLET_RUNNING_MARKER_SCHEMA,
    pid: process.pid,
    startedAt,
    identity,
  } satisfies GauntletRunMarker);
  return path;
}

export function removeGauntletRunMarker(path: string): void {
  rmSync(path, { force: true });
}

export function inspectGauntletRunMarkers(
  repoRoot: string,
  options: {
    readonly now?: Date | number;
    readonly maxAgeMs?: number;
    readonly isProcessAlive?: (pid: number) => boolean;
  } = {},
): readonly GauntletRunMarkerState[] {
  const directory = join(repoRoot, 'eval', '.runs');
  if (!existsSync(directory)) return [];
  const nowMs = options.now instanceof Date ? options.now.valueOf() : options.now ?? Date.now();
  const maxAgeMs = options.maxAgeMs ?? DEFAULT_MACHINE_REPORT_MAX_AGE_MS;
  const alive = options.isProcessAlive ?? ((pid: number) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return (error as NodeJS.ErrnoException).code === 'EPERM';
    }
  });
  return readdirSync(directory)
    .filter((name) => /^gauntlet-running-\d+\.json$/.test(name))
    .sort()
    .map((name) => {
      const path = join(directory, name);
      try {
        const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown;
        if (!isRecord(parsed) || parsed['schema'] !== GAUNTLET_RUNNING_MARKER_SCHEMA || !Number.isInteger(parsed['pid']) || !isIsoInstant(parsed['startedAt']) || !isRecord(parsed['identity'])) {
          return { path, marker: null, state: 'invalid' };
        }
        const marker = parsed as unknown as GauntletRunMarker;
        const stale = nowMs - Date.parse(marker.startedAt) > maxAgeMs || !alive(marker.pid);
        return { path, marker, state: stale ? 'stale' : 'running' };
      } catch {
        return { path, marker: null, state: 'invalid' };
      }
    });
}

export function gauntletExitCode(verdict: Verdict, requireAdmit: boolean): number {
  if (requireAdmit) return verdict === 'ADMIT' ? 0 : 1;
  return verdict === 'REJECT' ? 1 : 0;
}
