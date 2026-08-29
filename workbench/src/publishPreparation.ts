import { execFile } from 'node:child_process';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, mkdir, open, readFile, realpath, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  applyMutationPlan,
  createMutationPlan,
  validateRepoRelativePath,
  withMutationJournalLock,
  type ApplyOptions,
} from './applyJournal.js';
import { probeApprovalBindingIssues, type AdmissionDecision, type AdmissionFileDiff, type AdmissionManifest, type AdmissionPreview, type CommandOutcome } from './admission.js';
import { assertComparisonReportIntegrity, type ComparisonQueryReport, type ComparisonReport } from './comparison.js';
import { resolveNpmCliPath } from './jobRunner.js';
import { parseProposalManifest, proposalManifestDigest, type ProposalManifest } from './proposals.js';

const execFileAsync = promisify(execFile);
const SHA256 = /^[0-9a-f]{64}$/;
const COMMIT = /^[0-9a-f]{40,64}$/;
const SAFE_REMOTE = /^[A-Za-z0-9._-]+$/;
const SAFE_PROPOSAL = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_LOG_BYTES = 16 * 1024;
const STATE_ROOT = 'workbench/.state/publish-journals';
const WORKTREE_ROOT = 'workbench/.state/worktrees';
const ALLOWED_SOURCE_PATHS = [
  /^ontology\/concepts\/[a-z0-9][a-z0-9-]*\.ya?ml$/,
  /^eval\/golden\/[a-z0-9][a-z0-9-]*\.json$/,
  /^eval\/baselines\/probes\.json$/,
  /^eval\/baselines\/probes\.approval\.json$/,
  /^pipeline\/fixtures\/web-subset\.json$/,
] as const;
const FORBIDDEN_PATH = /(^|\/)(?:\.git|\.github\/workflows|workbench\/(?:\.state|\.artifact)|artifacts|telemetry(?:\/|$)|[^/]*\.db(?:$|[.-]))/i;

export type PublishPhase =
  | 'worktree-created'
  | 'files-applied'
  | 'verified'
  | 'committed'
  | 'pushed'
  | 'draft-pr-opened';

export type PublishPreparationStatus = 'LOCAL_READY' | 'PUSHED' | 'DRAFT_PR_OPENED' | 'ALREADY_PREPARED';

export interface SafeCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

export interface SafeCommandRunner {
  run(command: string, args: readonly string[], cwd: string): Promise<SafeCommandResult>;
}

export interface PublishPreparationDependencies {
  readonly runner?: SafeCommandRunner;
  readonly now?: () => Date;
  readonly apply?: ApplyOptions;
  readonly onPhase?: (phase: PublishPhase, context: { readonly branch: string; readonly worktree: string; readonly commit?: string }) => void | Promise<void>;
}

export interface TrustedPublishEvidence {
  readonly admissionPreview: AdmissionPreview;
  /** Null exactly for fixture-lane admissions, which admit no comparison. */
  readonly comparisonReport: ComparisonReport | null;
}

export interface PreparePublishInput {
  readonly repoRoot: string;
  readonly admissionManifestPath: string;
  readonly expectedAdmissionDigest: string;
  readonly proposal: unknown;
  readonly admissionSigningKey: string;
  readonly evidence: TrustedPublishEvidence;
  readonly remote?: string;
  readonly push?: boolean;
  readonly openDraftPr?: boolean;
  readonly dependencies?: PublishPreparationDependencies;
}

export interface PublishLog {
  readonly command: string;
  readonly args: readonly string[];
  readonly exitCode: number;
  readonly stdoutTail: string;
  readonly stderrTail: string;
}

export interface PublishPreparationResult {
  readonly status: PublishPreparationStatus;
  readonly branch: string;
  readonly commit: string;
  readonly worktree: string;
  readonly manifestDigest: string;
  readonly sourceDigest: string;
  readonly fixtureDigest: string;
  readonly treeHash: string;
  readonly prBody: string;
  readonly draftPrUrl: string | null;
  readonly safeNextActions: readonly string[];
  readonly logs: readonly PublishLog[];
}

interface PublishJournal {
  readonly schemaVersion: 2;
  readonly kind: 'scripture-search-publish-preparation';
  readonly proposalId: string;
  readonly manifestDigest: string;
  readonly originMain: string;
  readonly branch: string;
  readonly worktree: string;
  readonly phase: PublishPhase;
  readonly commit: string | null;
  readonly verification: PublishVerificationRun | PublishVerificationEvidence | null;
  readonly draftPrUrl: string | null;
  readonly digest: string;
}

interface PublishVerificationRun {
  readonly schemaVersion: 1;
  readonly manifestDigest: string;
  readonly treeHash: string;
  readonly command: string;
  readonly args: readonly string[];
  readonly stdoutSha256: string;
  readonly stderrSha256: string;
  readonly digest: string;
}

interface PublishVerificationEvidence {
  readonly schemaVersion: 2;
  readonly manifestDigest: string;
  readonly treeHash: string;
  readonly commit: string;
  readonly preCommit: PublishVerificationRun;
  readonly committed: PublishVerificationRun;
  readonly digest: string;
}

export class PublishPreparationError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'PublishPreparationError';
  }
}

function fail(code: string, message: string): never {
  throw new PublishPreparationError(code, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonical(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) fail('invalid_manifest', 'Admission evidence contains an unsupported primitive.');
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (!isRecord(value)) fail('invalid_manifest', 'Admission evidence must be JSON-compatible.');
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
}

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function digest(value: unknown): string {
  return sha256(canonical(value));
}

function requireDigest(value: unknown, label: string): string {
  if (typeof value !== 'string' || !SHA256.test(value)) fail('invalid_manifest', `${label} must be a lowercase SHA-256 digest.`);
  return value;
}

function requireCommit(value: unknown, label: string): string {
  if (typeof value !== 'string' || !COMMIT.test(value)) fail('invalid_manifest', `${label} must be a full lowercase commit id.`);
  return value;
}

function safeRepoPath(value: string): string {
  try {
    return validateRepoRelativePath(value);
  } catch {
    fail('unsafe_path', 'Repository-relative path is invalid or escapes confinement.');
  }
}

function within(parent: string, child: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function samePath(left: string, right: string): boolean {
  const normalize = (value: string) => process.platform === 'win32'
    ? path.resolve(value).toLocaleLowerCase('en-US')
    : path.resolve(value);
  return normalize(left) === normalize(right);
}

function tail(value: string): string {
  const redacted = value
    .replace(/(?:https?:\/\/)([^\s/@:]+):([^\s/@]+)@/gi, 'https://[REDACTED]@')
    .replace(/\b(?:gh[oprsu]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g, '[REDACTED_TOKEN]')
    .replace(/\b(token|password|authorization)\s*[:=]\s*\S+/gi, '$1=[REDACTED]');
  const bytes = Buffer.from(redacted);
  return bytes.length <= MAX_LOG_BYTES ? redacted : bytes.subarray(bytes.length - MAX_LOG_BYTES).toString('utf8');
}

const defaultRunner: SafeCommandRunner = {
  async run(command, args, cwd) {
    try {
      const result = await execFileAsync(command, [...args], {
        cwd,
        windowsHide: true,
        maxBuffer: 8 * 1024 * 1024,
        env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never', GH_PROMPT_DISABLED: '1' },
      });
      return { exitCode: 0, stdout: result.stdout, stderr: result.stderr };
    } catch (error) {
      const failure = error as Error & { code?: number | string; stdout?: string; stderr?: string };
      return {
        exitCode: typeof failure.code === 'number' ? failure.code : 127,
        stdout: failure.stdout ?? '',
        stderr: failure.stderr ?? failure.message,
      };
    }
  },
};

class Commands {
  readonly logs: PublishLog[] = [];

  constructor(private readonly runner: SafeCommandRunner) {}

  async raw(command: string, args: readonly string[], cwd: string): Promise<SafeCommandResult> {
    const result = await this.runner.run(command, args, cwd);
    this.logs.push({
      command: path.basename(command),
      args: args.map((entry) => tail(entry)),
      exitCode: result.exitCode,
      stdoutTail: tail(result.stdout),
      stderrTail: tail(result.stderr),
    });
    return result;
  }

  async must(command: string, args: readonly string[], cwd: string, code = 'command_failed'): Promise<string> {
    const result = await this.raw(command, args, cwd);
    if (result.exitCode !== 0) fail(code, `${path.basename(command)} ${args[0] ?? ''} failed: ${tail(result.stderr || result.stdout)}`);
    return result.stdout.trim();
  }

  git(args: readonly string[], cwd: string, code?: string): Promise<string> {
    return this.must('git', args, cwd, code);
  }
}

async function realDirectory(directory: string, label: string): Promise<string> {
  const resolved = path.resolve(directory);
  const stats = await lstat(resolved).catch(() => null);
  if (stats === null || !stats.isDirectory() || stats.isSymbolicLink()) fail('unsafe_path', `${label} must be a real directory.`);
  const real = await realpath(resolved);
  if (!samePath(real, resolved)) fail('unsafe_path', `${label} may not traverse a link or junction.`);
  return real;
}

async function ensureRealDirectoryChain(root: string, relative: string): Promise<string> {
  let cursor = root;
  for (const piece of relative.split('/')) {
    cursor = path.join(cursor, piece);
    const stats = await lstat(cursor).catch((error: NodeJS.ErrnoException) => error.code === 'ENOENT' ? null : Promise.reject(error));
    if (stats === null) await mkdir(cursor);
    const current = await lstat(cursor);
    if (!current.isDirectory() || current.isSymbolicLink()) fail('unsafe_path', `${relative} contains a link or non-directory.`);
  }
  const resolved = await realpath(cursor);
  if (!within(root, resolved)) fail('unsafe_path', `${relative} escaped the repository.`);
  return resolved;
}

async function readConfinedFile(root: string, relativePath: string): Promise<Buffer> {
  const normalized = safeRepoPath(relativePath);
  const target = path.resolve(root, ...normalized.split('/'));
  if (!within(root, target)) fail('unsafe_path', `${relativePath} escapes the repository.`);
  let cursor = root;
  for (const piece of normalized.split('/')) {
    cursor = path.join(cursor, piece);
    const stats = await lstat(cursor).catch(() => fail('missing_evidence', `${relativePath} is missing.`));
    if (stats.isSymbolicLink()) fail('unsafe_path', `${relativePath} contains a link or junction.`);
  }
  const before = await lstat(target);
  if (!before.isFile()) fail('unsafe_path', `${relativePath} must be a regular file.`);
  const noFollow = 'O_NOFOLLOW' in constants ? constants.O_NOFOLLOW : 0;
  const handle = await open(target, constants.O_RDONLY | noFollow).catch(() => fail('unsafe_path', `${relativePath} changed before open.`));
  try {
    const opened = await handle.stat();
    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino) fail('unsafe_path', `${relativePath} changed during open.`);
    const bytes = await handle.readFile();
    const after = await lstat(target);
    if (after.isSymbolicLink() || after.dev !== opened.dev || after.ino !== opened.ino) fail('unsafe_path', `${relativePath} changed during read.`);
    return bytes;
  } finally {
    await handle.close();
  }
}

async function readOwnedStateFile(root: string, relativePath: string, allowMissing = false): Promise<Buffer | null> {
  if (!relativePath.startsWith(`${STATE_ROOT}/`) || !/^[a-z0-9./-]+\.json$/.test(relativePath)) {
    fail('unsafe_path', 'Publish journal path is outside its owned state namespace.');
  }
  const target = path.resolve(root, ...relativePath.split('/'));
  if (!within(root, target)) fail('unsafe_path', 'Publish journal path escaped the repository.');
  let cursor = root;
  for (const piece of relativePath.split('/')) {
    cursor = path.join(cursor, piece);
    const stats = await lstat(cursor).catch((error: NodeJS.ErrnoException) => error.code === 'ENOENT' ? null : Promise.reject(error));
    if (stats === null) {
      if (allowMissing) return null;
      fail('journal_conflict', 'Publish journal is missing.');
    }
    if (stats.isSymbolicLink()) fail('unsafe_path', 'Publish journal path contains a link or junction.');
  }
  const before = await lstat(target);
  if (!before.isFile()) fail('unsafe_path', 'Publish journal must be a regular file.');
  const noFollow = 'O_NOFOLLOW' in constants ? constants.O_NOFOLLOW : 0;
  const handle = await open(target, constants.O_RDONLY | noFollow).catch(() => fail('unsafe_path', 'Publish journal changed before open.'));
  try {
    const opened = await handle.stat();
    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino) fail('unsafe_path', 'Publish journal changed during open.');
    const bytes = await handle.readFile();
    const after = await lstat(target);
    if (after.isSymbolicLink() || after.dev !== opened.dev || after.ino !== opened.ino) fail('unsafe_path', 'Publish journal changed during read.');
    return bytes;
  } finally {
    await handle.close();
  }
}

function validateCommandOutcome(value: CommandOutcome, label: string): void {
  if (!isRecord(value) || value.exitCode !== 0 || typeof value.command !== 'string' || !Array.isArray(value.args)
      || typeof value.cwd !== 'string' || !SHA256.test(value.stdoutSha256) || !SHA256.test(value.stderrSha256)
      || typeof value.stdoutTail !== 'string' || typeof value.stderrTail !== 'string') {
    fail('invalid_manifest', `${label} is not successful command evidence.`);
  }
}

function validateDecision(decision: AdmissionDecision, signingKey: string): void {
  if (!isRecord(decision) || decision.schemaVersion !== 1 || typeof decision.decisionDigest !== 'string'
      || typeof decision.signature !== 'string') fail('invalid_signature', 'Admission decision is malformed.');
  const { decisionDigest, signature, ...body } = decision;
  const expectedDigest = digest(body);
  const expectedSignature = createHmac('sha256', signingKey).update(expectedDigest).digest();
  const actual = SHA256.test(signature) ? Buffer.from(signature, 'hex') : Buffer.alloc(0);
  if (decisionDigest !== expectedDigest || actual.length !== expectedSignature.length || !timingSafeEqual(actual, expectedSignature)) {
    fail('invalid_signature', 'Admission decision digest or signature is invalid.');
  }
}

function allowedPath(relativePath: string): string {
  const normalized = safeRepoPath(relativePath);
  if (FORBIDDEN_PATH.test(normalized) || !ALLOWED_SOURCE_PATHS.some((pattern) => pattern.test(normalized))) {
    fail('unapproved_path', `Admission path ${normalized} is outside the publish allowlist.`);
  }
  return normalized;
}

function validateDiff(value: AdmissionFileDiff): AdmissionFileDiff {
  if (!isRecord(value) || typeof value.path !== 'string' || typeof value.kind !== 'string'
      || !Array.isArray(value.operationIds) || typeof value.changed !== 'boolean' || !isRecord(value.before) || !isRecord(value.after)) {
    fail('invalid_manifest', 'Admission source change is malformed.');
  }
  if (!['yaml', 'fixture', 'selection', 'fixture-promotion', 'probe-baseline', 'probe-approval'].includes(value.kind)) {
    fail('unapproved_path', 'Admission source change kind is not publishable.');
  }
  if (value.operationIds.some((entry) => typeof entry !== 'string' || entry.length === 0)) {
    fail('invalid_manifest', 'Admission source change operation ids are malformed.');
  }
  const relativePath = allowedPath(value.path);
  for (const side of ['before', 'after'] as const) {
    const image = value[side];
    if (typeof image.sha256 !== 'string' || typeof image.base64 !== 'string' || typeof image.text !== 'string'
        || sha256(Buffer.from(image.base64, 'base64')) !== image.sha256
        || Buffer.from(image.base64, 'base64').toString('base64') !== image.base64
        || Buffer.from(image.base64, 'base64').toString('utf8') !== image.text) {
      fail('invalid_manifest', `${relativePath} ${side} image does not match its bytes and digest.`);
    }
  }
  const { digest: stored, ...body } = value;
  if (!SHA256.test(stored) || stored !== digest(body)) fail('invalid_manifest', `${relativePath} diff digest is invalid.`);
  if (value.changed !== (value.before.sha256 !== value.after.sha256)) fail('invalid_manifest', `${relativePath} changed flag is invalid.`);
  return value;
}

function validateManifest(value: unknown, expectedDigest: string, proposal: ProposalManifest, signingKey: string): AdmissionManifest {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.kind !== 'scripture-search-admission') {
    fail('invalid_manifest', 'Admission manifest kind or schema is invalid.');
  }
  const { digest: stored, ...body } = value;
  if (stored !== requireDigest(expectedDigest, 'expectedAdmissionDigest') || stored !== digest(body)) {
    fail('invalid_manifest', 'Admission manifest digest does not match the reviewed immutable manifest.');
  }
  const manifest = value as unknown as AdmissionManifest;
  requireDigest(manifest.admissionKey, 'admissionKey');
  requireDigest(manifest.previewDigest, 'previewDigest');
  requireDigest(manifest.proposalDigest, 'proposalDigest');
  requireCommit(manifest.baseCommit, 'baseCommit');
  requireCommit(manifest.expectedMainCommit, 'expectedMainCommit');
  requireCommit(manifest.worktreeTreeHash, 'worktreeTreeHash');
  if (manifest.baseCommit !== manifest.expectedMainCommit) fail('stale_main', 'Admission base and reviewed main are not identical.');
  // Fixture-lane admissions (all-golden-fixture-upsert manifests) carry no
  // candidate artifact: the four candidate-evidence fields are null together,
  // the recorded exemption names the fixture lane, and the base identity pins
  // what the rebuild reproduced (identity neutrality). Anything else with a
  // null candidate is a forged manifest.
  const fixtureLaneManifest = manifest.candidate === null;
  if (fixtureLaneManifest && (manifest.comparison !== null || manifest.gauntlet !== null
      || manifest.effectExemption === null || manifest.effectExemption.lane !== 'fixture-lane'
      || manifest.baseIdentity === null || !isRecord(manifest.baseIdentity))) {
    fail('invalid_manifest', 'A fixture-lane admission must record its effect exemption and base identity and carry no candidate evidence.');
  }
  if (!fixtureLaneManifest && (manifest.comparison === null || manifest.gauntlet === null)) {
    fail('invalid_manifest', 'A candidate-bearing admission must carry its comparison and gauntlet evidence.');
  }
  if (proposalManifestDigest(proposal) !== manifest.proposalDigest
      || (manifest.candidate !== null && manifest.candidate.proposalDigest !== manifest.proposalDigest)
      || (manifest.comparison !== null && manifest.comparison.binding.proposalDigest !== manifest.proposalDigest)) fail('proposal_mismatch', 'Proposal is not the admitted proposal.');
  const cases = [...proposal.caseIds].sort();
  if (canonical(cases) !== canonical([...manifest.linkedCaseIds].sort())) fail('proposal_mismatch', 'Linked cases do not match the admitted proposal.');
  if (!Array.isArray(manifest.decisions) || manifest.decisions.length === 0 || typeof signingKey !== 'string' || signingKey.length < 32) {
    fail('invalid_signature', 'A trusted signing key and admission decisions are required.');
  }
  manifest.decisions.forEach((decision) => validateDecision(decision, signingKey));
  if (manifest.decisions.some((decision) => decision.previewDigest !== manifest.previewDigest)) {
    fail('invalid_signature', 'Admission decision was signed for a different preview.');
  }
  const sourceDecisions = manifest.decisions.filter((decision) => decision.kind === 'source-proposal');
  if (sourceDecisions.length !== 1) {
    fail('invalid_signature', 'Exactly one signed source-proposal decision is required.');
  }
  const decisionDigests = [...manifest.decisions].sort((a, b) => a.kind.localeCompare(b.kind) || a.subjectDigest.localeCompare(b.subjectDigest)).map((entry) => entry.decisionDigest);
  if (manifest.admissionKey !== digest({ previewDigest: manifest.previewDigest, decisions: decisionDigests })) {
    fail('invalid_manifest', 'Admission key is not bound to the preview and signed decisions.');
  }
  if (manifest.rebuiltCandidate.status !== 'REBUILT') fail('invalid_manifest', 'Admission did not use a fresh rebuild.');
  validateCommandOutcome(manifest.rebuiltCandidate.command, 'rebuiltCandidate.command');
  if (manifest.candidate !== null && manifest.comparison !== null && manifest.gauntlet !== null) {
    const { digest: gauntletDigest, ...gauntletBody } = manifest.gauntlet;
    if (gauntletDigest !== digest(gauntletBody) || manifest.gauntlet.gatesDigest !== digest(manifest.gauntlet.gates)
        || manifest.gauntlet.blocking || !['ADMIT', 'ADMIT_WITH_WARNINGS'].includes(manifest.gauntlet.verdict)
        || manifest.gauntlet.gates.some((entry) => entry.status === 'fail'
          || (entry.applicability === 'required' && entry.status !== 'pass'))) {
      fail('blocked_admission', 'Admission contains a blocking or non-passing gate.');
    }
    if (manifest.gauntlet.baseCommit !== manifest.baseCommit
        || manifest.gauntlet.proposalDigest !== manifest.proposalDigest
        || manifest.gauntlet.sourceSnapshotDigest !== manifest.candidate.sourceSnapshotDigest
        || manifest.gauntlet.candidateDescriptorSha256 !== manifest.candidate.descriptorSha256
        || manifest.gauntlet.candidateDatabaseSha256 !== manifest.candidate.databaseSha256
        || manifest.gauntlet.comparisonDigest !== manifest.comparison.digest
        || canonical(manifest.gauntlet.baseIdentity) !== canonical(manifest.comparison.binding.referenceIdentity)
        || canonical(manifest.gauntlet.candidateIdentity) !== canonical(manifest.comparison.binding.candidateIdentity)) {
      fail('invalid_manifest', 'Verified gauntlet is not bound to the admitted base, proposal, candidate, and comparison.');
    }
    if (manifest.comparison.digest !== manifest.comparison.binding.comparisonDigest
        || manifest.comparison.binding.cacheKey !== manifest.candidate.cacheKey
        || manifest.comparison.binding.databaseSha256 !== manifest.candidate.databaseSha256
        || manifest.comparison.binding.descriptorSha256 !== manifest.candidate.descriptorSha256) {
      fail('invalid_manifest', 'Comparison and candidate bindings disagree.');
    }
  } else {
    // Fixture lane: the release gauntlet run against the rebuilt (identical)
    // release artifact is the only gauntlet evidence. It must be recorded,
    // digest-bound, run at the admitted base, on the recorded base identity —
    // and any red must be the classified inherited standing red (a verified
    // control run at the base commit reproduced every finding).
    const release = manifest.releaseGauntlet;
    if (release === undefined) fail('invalid_manifest', 'A fixture-lane admission must record its verified release gauntlet.');
    const { digest: releaseDigest, ...releaseBody } = release;
    if (releaseDigest !== digest(releaseBody) || release.gatesDigest !== digest(release.gates)
        || release.targetKind !== 'release'
        || release.baseCommit !== manifest.baseCommit
        || canonical(release.engineIdentity) !== canonical(manifest.baseIdentity)) {
      fail('invalid_manifest', 'Verified release gauntlet is not bound to the admitted base and identity.');
    }
    const clean = !release.blocking && ['ADMIT', 'ADMIT_WITH_WARNINGS'].includes(release.verdict);
    const inherited = manifest.releaseGauntletClassification !== null
      && manifest.releaseGauntletClassification.kind === 'inherited-standing-red';
    if (!clean && !inherited) {
      fail('blocked_admission', 'Admission contains a blocking or non-passing gate.');
    }
  }
  if (!manifest.commands.some((command) => {
    validateCommandOutcome(command, 'commands[]');
    return path.resolve(command.command) === path.resolve(process.execPath)
      && command.args.length >= 3
      && /npm-cli\.js$/i.test(command.args.at(-3)!)
      && command.args.at(-2) === 'run'
      && command.args.at(-1) === 'verify';
  })) fail('verify_missing', 'Admission manifest lacks successful fixed full verification evidence.');
  const changes = manifest.sourceChanges.map(validateDiff);
  if (changes.length === 0 || changes.every((entry) => !entry.changed)) fail('invalid_manifest', 'Admission contains no publishable source change.');
  const unique = new Set(changes.map((entry) => entry.path));
  if (unique.size !== changes.length) fail('unapproved_path', 'Admission contains duplicate or aliased source paths.');
  const proposalPaths = new Set(proposal.sourcePreconditions.map((entry) => allowedPath(entry.path)));
  for (const proposalPath of proposalPaths) {
    if (!unique.has(proposalPath)) fail('proposal_mismatch', `Admitted source changes omit ${proposalPath}.`);
  }
  for (const change of changes) {
    if (!proposalPaths.has(change.path) && change.kind !== 'fixture-promotion' && change.kind !== 'probe-baseline' && change.kind !== 'probe-approval') {
      fail('unapproved_path', `${change.path} is not owned by the admitted proposal.`);
    }
  }
  const expectedSourceSubject = digest({
    proposalDigest: manifest.proposalDigest,
    diffs: changes.filter((entry) => entry.kind !== 'fixture-promotion' && entry.kind !== 'probe-baseline' && entry.kind !== 'probe-approval').map((entry) => entry.digest),
  });
  if (sourceDecisions[0]!.subjectDigest !== expectedSourceSubject) {
    fail('invalid_signature', 'Signed source decision is not bound to the admitted source diffs.');
  }
  const rollback = new Map(manifest.rollback.map((entry) => [entry.path, entry]));
  if (rollback.size !== changes.filter((entry) => entry.changed).length || rollback.size !== manifest.rollback.length) {
    fail('invalid_manifest', 'Rollback evidence does not exactly cover changed files.');
  }
  for (const change of changes.filter((entry) => entry.changed)) {
    const entry = rollback.get(change.path);
    if (entry === undefined || entry.restoreSha256 !== change.before.sha256 || entry.restoreBase64 !== change.before.base64
        || entry.admittedSha256 !== change.after.sha256) fail('invalid_manifest', `Rollback evidence for ${change.path} is invalid.`);
  }
  return manifest;
}

function validateTrustedEvidence(
  evidence: TrustedPublishEvidence,
  manifest: AdmissionManifest,
  proposal: ProposalManifest,
): { readonly preview: AdmissionPreview; readonly comparison: ComparisonReport | null } {
  const preview = evidence.admissionPreview;
  const comparison = evidence.comparisonReport;
  // Fixture-lane admissions have no comparison: the trusted evidence must be
  // null exactly when the immutable manifest recorded none, and vice versa.
  if ((comparison === null) !== (manifest.comparison === null)) {
    fail('comparison_evidence_invalid', 'Trusted comparison evidence disagrees with the immutable admission manifest.');
  }
  if (comparison !== null) {
    try { assertComparisonReportIntegrity(comparison); }
    catch { fail('comparison_evidence_invalid', 'Trusted comparison report failed deterministic integrity validation.'); }
  }
  if (!isRecord(preview) || preview.schemaVersion !== 1 || typeof preview.digest !== 'string') {
    fail('preview_evidence_invalid', 'Trusted admission preview is malformed.');
  }
  const { digest: previewDigest, ...previewBody } = preview;
  if (previewDigest !== manifest.previewDigest || previewDigest !== digest(previewBody)) {
    fail('preview_evidence_invalid', 'Trusted admission preview is not the exact digest-bound M10 preview.');
  }
  if (proposalManifestDigest(preview.proposal) !== manifest.proposalDigest
      || canonical(preview.proposal) !== canonical(proposal)
      || preview.proposalDigest !== manifest.proposalDigest
      || preview.admittedBaseCommit !== manifest.baseCommit
      || preview.expectedMainCommit !== manifest.expectedMainCommit
      || canonical(preview.candidate) !== canonical(manifest.candidate)
      || preview.comparisonDigest !== (manifest.comparison === null ? null : manifest.comparison.digest)
      || preview.gauntletDigest !== (manifest.gauntlet === null ? null : manifest.gauntlet.digest)
      || canonical(preview.gauntlet) !== canonical(manifest.gauntlet)
      || canonical(preview.diffs) !== canonical(manifest.sourceChanges)
      || canonical(preview.probeMovements) !== canonical(manifest.probeMovements)) {
    fail('preview_evidence_invalid', 'Trusted admission preview disagrees with the immutable admission manifest.');
  }
  if (comparison !== null && manifest.comparison !== null) {
    if (comparison.digest !== manifest.comparison.digest
        || canonical(comparison.referenceIdentity) !== canonical(manifest.comparison.binding.referenceIdentity)
        || canonical(comparison.candidateIdentity) !== canonical(manifest.comparison.binding.candidateIdentity)
        || preview.comparisonUniverseDigest !== digest(comparison.universe)) {
      fail('comparison_evidence_invalid', 'Trusted comparison report is not bound to the admitted comparison and identities.');
    }
    const changedQueries = comparison.queries.filter((entry) => entry.top10Changed).map((entry) => entry.query).sort();
    const reviewedQueries = [...preview.reviewedComparisonQueries].sort();
    if (preview.comparisonReviewDigest !== digest({
      reviewedQueries,
      changedQueries,
      regressionSessionQueryIds: comparison.regressionSessionQueryIds,
    })) fail('comparison_evidence_invalid', 'Comparison review coverage is not digest-bound to the admitted preview.');
    if (canonical(reviewedQueries) !== canonical(changedQueries)) {
      fail('comparison_evidence_invalid', 'Every changed comparison query must have exact reviewed coverage.');
    }
  } else if (preview.reviewedComparisonQueries.length > 0 || preview.comparisonUniverseDigest !== null
      || preview.comparisonReviewDigest !== null) {
    fail('comparison_evidence_invalid', 'A fixture-lane admission carries no comparison review to attest.');
  }

  const changedDiffs = preview.diffs.filter((entry) => entry.changed);
  const sourceSubject = digest({
    proposalDigest: manifest.proposalDigest,
    diffs: preview.diffs.filter((entry) => entry.kind !== 'fixture-promotion' && entry.kind !== 'probe-baseline' && entry.kind !== 'probe-approval').map((entry) => entry.digest),
  });
  if (preview.sourceDecisionSubject !== sourceSubject) fail('decision_slot_invalid', 'Source decision slot does not bind the complete source diff set.');
  const allFixtureDiffs = preview.diffs.filter((entry) => entry.kind === 'fixture-promotion');
  if (allFixtureDiffs.some((entry) => !entry.changed)) {
    fail('decision_slot_invalid', 'Every fixture promotion must be a changed diff with its own approved subject.');
  }
  const fixtureDiffs = changedDiffs.filter((entry) => entry.kind === 'fixture-promotion');
  const fixtureSubjects = [...preview.fixtureDecisionSubjects].sort((a, b) => a.fixtureId.localeCompare(b.fixtureId));
  if (fixtureDiffs.length !== fixtureSubjects.length) fail('decision_slot_invalid', 'Every fixture promotion requires one separate approved fixture subject.');
  for (const subject of fixtureSubjects) {
    requireDigest(subject.digest, `fixture decision ${subject.fixtureId}`);
    const expectedPath = `eval/golden/${subject.fixtureId}.json`;
    const matching = fixtureDiffs.filter((entry) => entry.path === expectedPath);
    if (matching.length !== 1) fail('decision_slot_invalid', `Fixture ${subject.fixtureId} does not map to exactly one admitted fixture diff.`);
  }
  for (const entry of fixtureDiffs) {
    const fixtureId = path.posix.basename(entry.path, '.json');
    if (!fixtureSubjects.some((subject) => subject.fixtureId === fixtureId)) {
      fail('decision_slot_invalid', `Fixture path ${entry.path} has no approved fixture decision subject.`);
    }
  }
  const allProbeDiffs = preview.diffs.filter((entry) => entry.kind === 'probe-baseline');
  if (allProbeDiffs.some((entry) => !entry.changed)) {
    fail('decision_slot_invalid', 'A baseline diff without an actual reviewed movement is not publishable.');
  }
  const probeDiffs = changedDiffs.filter((entry) => entry.kind === 'probe-baseline');
  if (probeDiffs.length > 1 || (probeDiffs[0] !== undefined && probeDiffs[0].path !== 'eval/baselines/probes.json')) {
    fail('decision_slot_invalid', 'Probe baseline evidence must use the single owned baseline path.');
  }
  const expectedProbeSubject = probeDiffs.length === 0
    ? null
    : digest({ movements: preview.probeMovements, diff: probeDiffs[0]!.digest });
  if (preview.probeDecisionSubject !== expectedProbeSubject) fail('decision_slot_invalid', 'Probe baseline slot is not bound to every admitted movement.');
  const allApprovalDiffs = preview.diffs.filter((entry) => entry.kind === 'probe-approval');
  if (allApprovalDiffs.some((entry) => !entry.changed)) {
    fail('probe_approval_orphaned', 'An unchanged probe approval diff is not publishable evidence.');
  }
  const approvalDiffs = changedDiffs.filter((entry) => entry.kind === 'probe-approval');
  if (approvalDiffs.length > 1 || (approvalDiffs[0] !== undefined && approvalDiffs[0].path !== 'eval/baselines/probes.approval.json')) {
    fail('probe_approval_mismatch', 'Probe approval evidence must use the single owned approval path.');
  }
  if (probeDiffs.length > 0 && approvalDiffs.length === 0) {
    fail('probe_approval_missing', 'A moved probe baseline is publishable only with its re-issued independent approval in the same batch.');
  }
  if (approvalDiffs.length > 0 && probeDiffs.length === 0) {
    fail('probe_approval_orphaned', 'An updated probe approval without a moved baseline has nothing it can attest to.');
  }
  if (approvalDiffs.length === 1) {
    const issues = probeApprovalBindingIssues(probeDiffs[0]!.after.text, approvalDiffs[0]!.after.text);
    if (issues.length > 0) fail('probe_approval_mismatch', issues.join(' '));
  }
  const expectedSlots = [
    { kind: 'source-proposal' as const, slotId: 'source-proposal', subjectDigest: sourceSubject },
    ...fixtureSubjects.map((entry) => ({ kind: 'fixture-promotion' as const, slotId: entry.fixtureId, subjectDigest: entry.digest })),
    ...(expectedProbeSubject === null ? [] : [{ kind: 'probe-baseline' as const, slotId: 'probe-baseline', subjectDigest: expectedProbeSubject }]),
  ];
  if (canonical(preview.decisionSlots) !== canonical(expectedSlots)) fail('decision_slot_invalid', 'M10 decision slot roster is incomplete or reordered.');
  if (manifest.decisions.length !== expectedSlots.length) fail('decision_slot_invalid', 'Signed decisions do not exactly fill every M10 decision slot.');
  for (const slot of expectedSlots) {
    const matching = manifest.decisions.filter((decision) => decision.kind === slot.kind
      && decision.subjectDigest === slot.subjectDigest && decision.previewDigest === preview.digest);
    if (matching.length !== 1) fail('decision_slot_invalid', `Decision slot ${slot.slotId} is missing or duplicated.`);
  }
  const probeDecision = manifest.decisions.find((decision) => decision.kind === 'probe-baseline');
  if (expectedProbeSubject === null) {
    if (probeDecision !== undefined || preview.probeMovements.length > 0) fail('decision_slot_invalid', 'Unexpected probe decision or movement exists without a baseline diff.');
  } else {
    const rationales = probeDecision?.probeRationales ?? [];
    const projected = rationales.map(({ probeId, beforeSha256, afterSha256 }) => ({ probeId, beforeSha256, afterSha256 })).sort((a, b) => a.probeId.localeCompare(b.probeId));
    if (canonical(projected) !== canonical([...preview.probeMovements].sort((a, b) => a.probeId.localeCompare(b.probeId)))
        || rationales.some((entry) => entry.rationale.trim().length < 8)) {
      fail('decision_slot_invalid', 'Probe decision must rationalize every baseline movement exactly once.');
    }
  }
  if (comparison !== null) {
    const linkedMembershipIds = new Set(comparison.queries.flatMap((entry) => entry.memberships
      .filter((membership) => membership.kind === 'linked-case').map((membership) => membership.sourceId)));
    if (manifest.linkedCaseIds.some((caseId) => !linkedMembershipIds.has(caseId))) {
      fail('comparison_evidence_invalid', 'Trusted comparison omits an admitted linked case.');
    }
  }
  return { preview, comparison };
}

async function loadAdmission(input: PreparePublishInput, root: string, proposal: ProposalManifest): Promise<AdmissionManifest> {
  const relativePath = safeRepoPath(input.admissionManifestPath);
  const expectedPrefix = 'workbench/admissions/';
  if (!relativePath.startsWith(expectedPrefix) || !relativePath.endsWith('.json')) fail('invalid_manifest', 'Admission manifest path is not canonical.');
  const bytes = await readConfinedFile(root, relativePath);
  let parsed: unknown;
  try { parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { fail('invalid_manifest', 'Admission manifest is not valid UTF-8 JSON.'); }
  const manifest = validateManifest(parsed, input.expectedAdmissionDigest, proposal, input.admissionSigningKey);
  if (relativePath !== `${expectedPrefix}${manifest.admissionKey}.json`) fail('invalid_manifest', 'Admission manifest filename does not match its admission key.');
  return manifest;
}

function journalBody(value: Omit<PublishJournal, 'digest'>): Omit<PublishJournal, 'digest'> {
  return value;
}

function parseJournalBytes(bytes: Buffer | null): PublishJournal | null {
  if (bytes === null) return null;
  let value: unknown;
  try { value = JSON.parse(bytes.toString('utf8')); } catch { fail('journal_conflict', 'Publish journal is invalid JSON.'); }
  if (!isRecord(value) || value.schemaVersion !== 2 || value.kind !== 'scripture-search-publish-preparation' || typeof value.digest !== 'string') {
    fail('journal_conflict', 'Publish journal has an invalid contract.');
  }
  const { digest: stored, ...body } = value;
  if (stored !== digest(body)) fail('journal_conflict', 'Publish journal digest is invalid.');
  const journal = value as unknown as PublishJournal;
  if (journal.verification !== null && !structurallyValidVerification(journal.verification)) {
    fail('journal_conflict', 'Publish verification evidence is invalid.');
  }
  return journal;
}

async function readJournal(root: string, relativePath: string): Promise<PublishJournal | null> {
  return parseJournalBytes(await readOwnedStateFile(root, relativePath, true));
}

async function writeJournal(root: string, relativePath: string, body: Omit<PublishJournal, 'digest'>): Promise<PublishJournal> {
  const value: PublishJournal = { ...body, digest: digest(body) };
  return withMutationJournalLock(root, async () => {
    const target = path.join(root, ...relativePath.split('/'));
    const existingBytes = await readFile(target).catch((error: NodeJS.ErrnoException) => error.code === 'ENOENT' ? null : Promise.reject(error));
    const existing = parseJournalBytes(existingBytes);
    if (existing?.digest === value.digest) return existing;
    if (existing !== null && (existing.manifestDigest !== value.manifestDigest || existing.branch !== value.branch
        || existing.worktree !== value.worktree)) fail('journal_conflict', 'Publish journal changed ownership.');
    const parent = await ensureRealDirectoryChain(root, path.posix.dirname(relativePath));
    const parentIdentity = await lstat(parent);
    const temporary = path.join(parent, `.${path.basename(target)}.${randomUUID()}.tmp`);
    const handle = await open(temporary, 'wx', 0o600);
    try {
      await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
      await handle.sync();
      const currentParent = await lstat(parent);
      if (currentParent.isSymbolicLink() || currentParent.dev !== parentIdentity.dev || currentParent.ino !== parentIdentity.ino) {
        fail('unsafe_path', 'Publish journal directory changed during write.');
      }
    } finally {
      await handle.close();
    }
    await rename(temporary, target);
    const published = parseJournalBytes(await readOwnedStateFile(root, relativePath));
    if (published?.digest !== value.digest) fail('journal_conflict', 'Publish journal changed during commit.');
    return published;
  });
}

function sourceDigests(manifest: AdmissionManifest): { sourceDigest: string; fixtureDigest: string } {
  const changed = manifest.sourceChanges.filter((entry) => entry.changed).sort((a, b) => a.path.localeCompare(b.path));
  return {
    sourceDigest: digest(changed.filter((entry) => entry.kind !== 'fixture' && entry.kind !== 'fixture-promotion').map((entry) => entry.digest)),
    fixtureDigest: digest(changed.filter((entry) => entry.kind === 'fixture' || entry.kind === 'fixture-promotion').map((entry) => entry.digest)),
  };
}

async function remoteMain(commands: Commands, root: string, remote: string): Promise<string> {
  await commands.git(['fetch', '--prune', remote, 'main'], root, 'remote_unavailable');
  return requireCommit(await commands.git(['rev-parse', '--verify', `refs/remotes/${remote}/main^{commit}`], root), 'origin/main');
}

async function assertMain(commands: Commands, root: string, remote: string, expected: string): Promise<void> {
  const current = await remoteMain(commands, root, remote);
  if (current !== expected) fail('main_moved', 'origin/main moved; rebuild and review are required.');
  const local = requireCommit(await commands.git(['rev-parse', '--verify', 'refs/heads/main^{commit}'], root), 'local main');
  if (local !== expected) fail('main_moved', 'Local main moved or diverged; rebuild and review are required.');
}

async function refExists(commands: Commands, root: string, ref: string): Promise<boolean> {
  return (await commands.raw('git', ['show-ref', '--verify', '--quiet', ref], root)).exitCode === 0;
}

async function remoteBranch(commands: Commands, root: string, remote: string, branch: string): Promise<string | null> {
  const result = await commands.raw('git', ['ls-remote', '--exit-code', '--heads', remote, `refs/heads/${branch}`], root);
  if (result.exitCode === 2) return null;
  if (result.exitCode !== 0) fail('remote_unavailable', `Remote branch preflight failed: ${tail(result.stderr || result.stdout)}`);
  const commit = result.stdout.trim().split(/\s+/)[0];
  return requireCommit(commit, 'remote branch commit');
}

async function primarySnapshot(commands: Commands, root: string): Promise<string> {
  const indexPathText = await commands.git(['rev-parse', '--git-path', 'index'], root);
  const indexPath = path.isAbsolute(indexPathText) ? indexPathText : path.resolve(root, indexPathText);
  const indexBytes = await readFile(indexPath).catch((error: NodeJS.ErrnoException) => error.code === 'ENOENT' ? Buffer.alloc(0) : Promise.reject(error));
  const status = await commands.git(['--no-optional-locks', 'status', '--porcelain=v2', '-z', '--branch', '--untracked-files=all'], root);
  const index = await commands.git(['write-tree'], root);
  return digest({ status, index, indexBytes: sha256(indexBytes) });
}

async function assertWorktree(parent: string, worktree: string): Promise<void> {
  const realParent = await realDirectory(parent, 'Publish worktree parent');
  const real = await realDirectory(worktree, 'Publish worktree');
  if (!within(realParent, real)) fail('unsafe_path', 'Publish worktree escaped its confined parent.');
}

async function assertNoSubmodule(commands: Commands, worktree: string, relativePath: string): Promise<void> {
  const output = await commands.git(['ls-files', '--stage', '--', relativePath], worktree);
  if (output.startsWith('160000 ')) fail('submodule_rejected', `${relativePath} is a submodule.`);
}

async function fileState(worktree: string, changes: readonly AdmissionFileDiff[]): Promise<'before' | 'after' | 'mixed'> {
  let before = true;
  let after = true;
  for (const change of changes) {
    // A CREATE — the fixture lane's primary operation — has no file in its
    // before state: the admission manifest records `before` as the empty
    // marker and the publish worktree at the base commit has nothing to
    // read, so a missing file IS the before state (mirrors admission.ts's
    // sourceMutations; found by the D11 shakedown).
    const bytes = await readConfinedFile(worktree, change.path).catch((error: unknown) => {
      if (error instanceof PublishPreparationError && error.code === 'missing_evidence' && change.before.text === '') return null;
      throw error;
    });
    const current = bytes === null ? change.before.sha256 : sha256(bytes);
    before &&= current === change.before.sha256;
    after &&= current === change.after.sha256;
  }
  return before ? 'before' : after ? 'after' : 'mixed';
}

async function applyAdmittedFiles(worktree: string, manifest: AdmissionManifest, options: ApplyOptions | undefined): Promise<void> {
  const changes = manifest.sourceChanges.filter((entry) => entry.changed);
  const state = await fileState(worktree, changes);
  if (state === 'after') return;
  if (state !== 'before') fail('digest_mismatch', 'Worktree contains a mixed or stale admitted patch.');
  const plan = await createMutationPlan(worktree, changes.map((entry) => ({
    path: entry.path,
    // null is the plan's must-not-exist precondition: a create's before is
    // the empty marker and the worktree has no file (mirrors admission.ts).
    beforeSha256: entry.before.text === '' ? null : entry.before.sha256,
    after: Buffer.from(entry.after.base64, 'base64'),
  })));
  await applyMutationPlan(worktree, plan, options);
  if (await fileState(worktree, changes) !== 'after') fail('digest_mismatch', 'Applied files do not match admission bytes.');
}

async function inspectIndex(commands: Commands, worktree: string, allowed: readonly string[]): Promise<string> {
  const names = (await commands.git(['diff', '--cached', '--name-only', '-z'], worktree)).split('\0').filter(Boolean).sort();
  const expected = [...allowed].sort();
  if (canonical(names) !== canonical(expected)) fail('unapproved_index', 'The publish index contains missing or unapproved paths.');
  await commands.git(['diff', '--cached', '--check'], worktree, 'unapproved_index');
  const status = await commands.git(['status', '--porcelain=v1', '-z', '--untracked-files=all'], worktree);
  for (const record of status.split('\0').filter(Boolean)) {
    const file = record.slice(3).replaceAll('\\', '/');
    if (!expected.includes(file)) fail('unapproved_file', `Worktree contains unapproved path ${file}.`);
  }
  const ignored = await commands.git(['status', '--porcelain=v1', '-z', '--ignored=matching', '--untracked-files=all'], worktree);
  for (const record of ignored.split('\0').filter(Boolean)) {
    const file = record.slice(3).replaceAll('\\', '/').replace(/\/$/, '');
    if (FORBIDDEN_PATH.test(file) || /(?:^|\/)[^/]*\.db(?:$|[.-])/i.test(file)) {
      fail('forbidden_output', `Worktree contains forbidden ignored path ${file}.`);
    }
  }
  return requireCommit(await commands.git(['write-tree'], worktree), 'prepared tree hash');
}

/**
 * Removes the operational exhaust the fixed verification itself
 * legitimately recreates inside the publish worktree — the workbench's own
 * server integration tests run real jobs against the checkout root and
 * write workbench/.state/jobs records (D11 finding: the old existence
 * assertion refused every real `npm run verify`, doubly so because
 * pipeline/telemetry also holds TRACKED schema files, so its mere existence
 * check could never pass on a real checkout). `git clean` removes only
 * untracked and ignored content under these paths — tracked files are
 * untouched — and that exhaust can never reach the commit anyway:
 * inspectIndex runs right after, pins the index to exactly the reviewed
 * paths, refuses any unapproved worktree file, and refuses forbidden
 * ignored leftovers outside these directories — the guard stays live, only
 * verification's own expected exhaust is cleaned instead of refused.
 */
async function removeVerificationState(commands: Commands, worktree: string): Promise<void> {
  await commands.git(['clean', '-ffdx', '--',
    'workbench/.state',
    'workbench/.artifact',
    'pipeline/telemetry',
    'telemetry',
  ], worktree);
}

async function runFixedVerify(
  commands: Commands,
  worktree: string,
  manifest: AdmissionManifest,
  treeHash: string,
): Promise<PublishVerificationRun> {
  const args = [resolveNpmCliPath(), 'run', 'verify'] as const;
  const result = await commands.raw(process.execPath, args, worktree);
  if (result.exitCode !== 0) fail('verify_failed', `Fixed full verification failed: ${tail(result.stderr || result.stdout)}`);
  const body = {
    schemaVersion: 1 as const,
    manifestDigest: manifest.digest,
    treeHash,
    command: process.execPath,
    args,
    stdoutSha256: sha256(result.stdout),
    stderrSha256: sha256(result.stderr),
  };
  return { ...body, digest: digest(body) };
}

function commitMessage(proposal: ProposalManifest, manifest: AdmissionManifest, verification: PublishVerificationRun): string {
  return [
    `refinement: ${proposal.proposalId}`,
    '',
    `Admission-Digest: ${manifest.digest}`,
    `Admission-Preview-Digest: ${manifest.previewDigest}`,
    ...(manifest.comparison === null ? [] : [`Comparison-Digest: ${manifest.comparison.digest}`]),
    `Verification-Digest: ${verification.digest}`,
  ].join('\n');
}

function structurallyValidVerificationRun(value: unknown): value is PublishVerificationRun {
  if (!isRecord(value) || value.schemaVersion !== 1) return false;
  const { digest: stored, ...body } = value;
  return stored === digest(body)
    && SHA256.test(value.manifestDigest as string)
    && COMMIT.test(value.treeHash as string)
    && typeof value.command === 'string'
    && Array.isArray(value.args) && value.args.every((entry) => typeof entry === 'string')
    && SHA256.test(value.stdoutSha256 as string)
    && SHA256.test(value.stderrSha256 as string);
}

function structurallyValidVerification(value: unknown): value is PublishVerificationRun | PublishVerificationEvidence {
  if (structurallyValidVerificationRun(value)) return true;
  if (!isRecord(value) || value.schemaVersion !== 2) return false;
  const { digest: stored, ...body } = value;
  return stored === digest(body)
    && SHA256.test(value.manifestDigest as string)
    && COMMIT.test(value.treeHash as string)
    && COMMIT.test(value.commit as string)
    && structurallyValidVerificationRun(value.preCommit)
    && structurallyValidVerificationRun(value.committed);
}

function validVerificationRun(verification: PublishVerificationRun, manifest: AdmissionManifest): boolean {
  return structurallyValidVerificationRun(verification)
    && verification.manifestDigest === manifest.digest
    && verification.treeHash === manifest.worktreeTreeHash
    && path.resolve(verification.command) === path.resolve(process.execPath)
    && canonical(verification.args) === canonical([resolveNpmCliPath(), 'run', 'verify']);
}

function validVerificationEvidence(
  verification: PublishVerificationRun | PublishVerificationEvidence | null,
  manifest: AdmissionManifest,
  commit: string,
): verification is PublishVerificationEvidence {
  if (verification === null || verification.schemaVersion !== 2) return false;
  const { digest: stored, ...body } = verification;
  return stored === digest(body)
    && verification.manifestDigest === manifest.digest
    && verification.treeHash === manifest.worktreeTreeHash
    && verification.commit === commit
    && validVerificationRun(verification.preCommit, manifest)
    && validVerificationRun(verification.committed, manifest);
}

async function proveAdmittedCommit(
  commands: Commands,
  worktree: string,
  branch: string,
  commit: string,
  manifest: AdmissionManifest,
  proposal: ProposalManifest,
  verification: PublishVerificationRun | PublishVerificationEvidence | null,
): Promise<boolean> {
  if (!validVerificationEvidence(verification, manifest, commit)) return false;
  const branchCommit = await commands.raw('git', ['rev-parse', '--verify', `refs/heads/${branch}^{commit}`], worktree);
  if (branchCommit.exitCode !== 0 || branchCommit.stdout.trim() !== commit) return false;
  const parents = await commands.git(['rev-list', '--parents', '-n', '1', commit], worktree);
  const parentParts = parents.split(/\s+/);
  if (parentParts.length !== 2 || parentParts[0] !== commit || parentParts[1] !== manifest.baseCommit) return false;
  const tree = await commands.git(['rev-parse', `${commit}^{tree}`], worktree);
  if (tree !== manifest.worktreeTreeHash || verification.treeHash !== tree) return false;
  const changedPaths = manifest.sourceChanges.filter((entry) => entry.changed).map((entry) => entry.path).sort();
  const committedPaths = (await commands.git(['diff-tree', '--no-commit-id', '--name-only', '-r', manifest.baseCommit, commit], worktree))
    .split(/\r?\n/).filter(Boolean).sort();
  if (canonical(committedPaths) !== canonical(changedPaths)) return false;
  const statuses = (await commands.git(['diff-tree', '--no-commit-id', '--name-status', '-r', manifest.baseCommit, commit], worktree))
    .split(/\r?\n/).filter(Boolean);
  if (statuses.length !== changedPaths.length) return false;
  // A CREATE (before is the empty marker; the file was absent at base and the
  // apply used the must-not-exist precondition) proves as an addition; every
  // other change proves as exactly a modification (D11 finding).
  const statusByPath = new Map(statuses.map((entry) => {
    const [code = '', ...rest] = entry.split('\t');
    return [rest.join('\t'), code] as const;
  }));
  for (const change of manifest.sourceChanges.filter((entry) => entry.changed)) {
    if (statusByPath.get(change.path) !== (change.before.text === '' ? 'A' : 'M')) return false;
  }
  for (const change of manifest.sourceChanges.filter((entry) => entry.changed)) {
    const mode = await commands.git(['ls-tree', commit, '--', change.path], worktree);
    if (!/^100644 blob [0-9a-f]{40,64}\t/.test(mode) && !/^100755 blob [0-9a-f]{40,64}\t/.test(mode)) return false;
    const content = await commands.raw('git', ['show', `${commit}:${change.path}`], worktree);
    if (content.exitCode !== 0 || sha256(Buffer.from(content.stdout)) !== change.after.sha256) return false;
  }
  const message = await commands.git(['show', '-s', '--format=%B', commit], worktree);
  if (message.trimEnd() !== commitMessage(proposal, manifest, verification.preCommit)) return false;
  const status = await commands.git(['status', '--porcelain=v1', '-z', '--untracked-files=all'], worktree);
  if (status !== '') return false;
  return true;
}

async function recreateOwnedWorktree(
  commands: Commands,
  root: string,
  parent: string,
  worktree: string,
  branch: string,
  expectedMain: string,
): Promise<void> {
  await assertWorktree(parent, worktree);
  const currentBranch = await commands.git(['branch', '--show-current'], worktree);
  if (currentBranch !== branch) fail('branch_conflict', 'Only the journal-owned refinement branch may be recreated.');
  await commands.git(['worktree', 'remove', '--force', worktree], root, 'recovery_failed');
  if (await refExists(commands, root, `refs/heads/${branch}`)) {
    await commands.git(['branch', '-D', branch], root, 'recovery_failed');
  }
  await commands.git(['worktree', 'add', '--detach', worktree, expectedMain], root, 'recovery_failed');
  await assertWorktree(parent, worktree);
  await commands.git(['switch', '-c', branch], worktree, 'recovery_failed');
}

async function assertRemotePublished(
  commands: Commands,
  root: string,
  remote: string,
  branch: string,
  expectedCommit: string,
): Promise<void> {
  const remoteRef = `refs/remotes/${remote}/${branch}`;
  await commands.git(['fetch', '--force', remote, `refs/heads/${branch}:${remoteRef}`], root, 'remote_branch_moved');
  const fetched = requireCommit(await commands.git(['rev-parse', '--verify', `${remoteRef}^{commit}`], root, 'remote_branch_moved'), 'remote refinement commit');
  if (fetched !== expectedCommit) fail('remote_branch_moved', 'Published refinement branch moved; rebuild and review are required.');
}

function parseVerifiedPr(value: string, branch: string, commit: string): { readonly url: string } {
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { fail('pr_verification_failed', 'Draft PR adapter did not return verifiable JSON.'); }
  if (!isRecord(parsed) || typeof parsed.url !== 'string' || parsed.url.length === 0 || parsed.isDraft !== true
      || parsed.headRefName !== branch || parsed.headRefOid !== commit) {
    fail('pr_verification_failed', 'Draft PR head, commit, draft state, or URL does not match the verified refinement branch.');
  }
  return { url: parsed.url };
}

function resultLines(label: string, query: ComparisonQueryReport['reference']): string[] {
  return [
    `**${label} top results**`,
    ...(query.top10.length === 0 ? ['- None'] : query.top10.map((result, index) => {
      const reasons = result.reasons.length === 0 ? 'no reasons' : result.reasons.map((reason) => {
        const provenance = reason.provenance === null ? '' : `; source=${reason.provenance.sourceId}; locator=${reason.provenance.locator ?? 'none'}; weight=${reason.provenance.weight ?? 'none'}`;
        return `${reason.family}/${reason.label}=${reason.points} (uncapped=${reason.uncappedPoints ?? 'none'}; capped=${reason.capped}${provenance})`;
      }).join(' | ');
      return `- ${index + 1}. \`${result.targetId}\` ${result.reference}; score=${result.score}; ${reasons}`;
    })),
  ];
}

function comparisonLines(manifest: AdmissionManifest, comparison: ComparisonReport): string[] {
  const linkedIds = new Set(manifest.linkedCaseIds);
  const linked = comparison.queries.filter((entry) => entry.memberships.some((membership) => membership.kind === 'linked-case' && linkedIds.has(membership.sourceId)));
  return linked.flatMap((entry) => {
    const cases = entry.memberships.filter((membership) => membership.kind === 'linked-case' && linkedIds.has(membership.sourceId)).map((membership) => membership.sourceId).sort();
    return [
      `#### Query: ${entry.query}`,
      `- Linked cases: ${cases.map((caseId) => `\`${caseId}\``).join(', ')}`,
      `- Verdict: **${entry.verdict}**; top-10 changed=${entry.top10Changed}; reference expectations=${entry.expectationStatus.referencePasses}; candidate expectations=${entry.expectationStatus.candidatePasses}`,
      ...resultLines('Current', entry.reference),
      ...resultLines('Candidate', entry.candidate),
      `- Added: ${entry.movement.added.map((value) => `\`${value}\``).join(', ') || 'none'}`,
      `- Removed: ${entry.movement.removed.map((value) => `\`${value}\``).join(', ') || 'none'}`,
      `- Rank changes: ${entry.movement.rankMoved.map((value) => `\`${value.targetId}\` ${value.referenceRank}->${value.candidateRank} (${value.delta})`).join(', ') || 'none'}`,
      `- Reason changes: ${entry.movement.reasonChanged.map((value) => `\`${value}\``).join(', ') || 'none'}`,
      `- Provenance changes: ${entry.movement.provenanceChanged.map((value) => `\`${value}\``).join(', ') || 'none'}`,
      `- Score changes: ${entry.movement.scoreChanged.map((value) => `\`${value}\``).join(', ') || 'none'}`,
      `- Cap changes: ${entry.movement.capChanged.map((value) => `\`${value}\``).join(', ') || 'none'}`,
      '',
    ];
  });
}

function probeLines(manifest: AdmissionManifest): string[] {
  const decision = manifest.decisions.find((entry) => entry.kind === 'probe-baseline');
  const rationales = new Map((decision?.probeRationales ?? []).map((entry) => [entry.probeId, entry.rationale]));
  if (manifest.probeMovements.length === 0) return ['- No probe baseline movement.'];
  const baseline = manifest.sourceChanges.find((entry) => entry.kind === 'probe-baseline')!;
  const approval = manifest.sourceChanges.find((entry) => entry.kind === 'probe-approval');
  return [
    `- Baseline file \`${baseline.path}\`: \`${baseline.before.sha256}\` -> \`${baseline.after.sha256}\``,
    ...(approval === undefined ? [] : [`- Approval file \`${approval.path}\`: \`${approval.before.sha256}\` -> \`${approval.after.sha256}\``]),
    '**Baseline before**',
    '```json',
    baseline.before.text.trimEnd(),
    '```',
    '**Baseline after**',
    '```json',
    baseline.after.text.trimEnd(),
    '```',
    ...manifest.probeMovements.map((entry) => `- \`${entry.probeId}\`: \`${entry.beforeSha256 ?? 'absent'}\` -> \`${entry.afterSha256 ?? 'absent'}\`; rationale: ${rationales.get(entry.probeId)}`),
  ];
}

function gateLines(gates: NonNullable<AdmissionManifest['gauntlet']>['gates']): string[] {
  return gates.flatMap((gate) => [
    `#### ${gate.gate}: ${gate.title}`,
    `- Code: \`${gate.code}\`; status=${gate.status}; applicability=${gate.applicability}; verdict=${gate.verdict}`,
    `- Summary: ${gate.summary}`,
    `- Metrics: \`${canonical(gate.metrics)}\``,
    `- Promotion candidates: ${gate.promotionCandidates.map((entry) => `\`${entry}\``).join(', ') || 'none'}`,
    ...(gate.findings.length === 0 ? ['- Findings: none'] : gate.findings.map((finding) =>
      `- Finding \`${finding.categoryCode}\`/\`${finding.instanceId}\`: ${finding.message}; subjects=${finding.subjects.map((entry) => `\`${entry}\``).join(', ') || 'none'}; params=\`${canonical(finding.params)}\`; metrics=\`${canonical(finding.metrics)}\``)),
    '',
  ]);
}

function outcomeLines(manifest: AdmissionManifest, comparison: ComparisonReport | null): string[] {
  if (manifest.comparison !== null && comparison !== null) {
    return [
      `- Comparison digest: \`${manifest.comparison.digest}\``,
      `- Comparison summary: ${comparison.summary.text}`,
      ...comparisonLines(manifest, comparison),
    ];
  }
  // Guard (fixture-lane) variant: the fixtures ARE the measured claim — the
  // release artifact is byte-identical, so there is no comparison to show.
  return [
    '- Fixture-lane update: golden fixtures only. The release artifact is unchanged, so no current/candidate comparison exists.',
    ...(manifest.effectExemption === null ? [] : [`- Recorded exemption: ${manifest.effectExemption.rationale}`]),
    '',
  ];
}

function identityLines(manifest: AdmissionManifest, comparison: ComparisonReport | null): string[] {
  if (manifest.candidate !== null && comparison !== null) {
    return [
      `- Current: engine=\`${comparison.referenceIdentity.engineVersion}\`; corpus=\`${comparison.referenceIdentity.corpusFingerprint}\`; layer=\`${comparison.referenceIdentity.layerFingerprint}\``,
      `- Candidate: engine=\`${manifest.candidate.engineVersion}\`; corpus=\`${manifest.candidate.corpusFingerprint}\`; layer=\`${manifest.candidate.layerFingerprint}\``,
      `- Database: \`${manifest.rebuiltCandidate.databaseSha256}\``,
      `- Candidate descriptor: \`${manifest.candidate.descriptorSha256}\``,
      `- Candidate source snapshot: \`${manifest.candidate.sourceSnapshotDigest}\``,
    ];
  }
  const identity = manifest.baseIdentity!;
  return [
    `- Unchanged: engine=\`${identity.engineVersion}\`; corpus=\`${identity.corpusFingerprint}\`; layer=\`${identity.layerFingerprint}\``,
    `- Database: \`${manifest.rebuiltCandidate.databaseSha256}\` (rebuilt and identical to the live release)`,
  ];
}

function gateSection(manifest: AdmissionManifest): string[] {
  if (manifest.gauntlet !== null) {
    return [
      `- Gauntlet digest: \`${manifest.gauntlet.digest}\`; report: \`${manifest.gauntlet.reportSha256}\`; payload: \`${manifest.gauntlet.payloadSha256}\``,
      ...gateLines(manifest.gauntlet.gates),
    ];
  }
  const release = manifest.releaseGauntlet;
  if (release === undefined) return ['- No gauntlet evidence recorded.'];
  return [
    `- Release gauntlet digest: \`${release.digest}\`; report: \`${release.reportSha256}\`; payload: \`${release.payloadSha256}\``,
    ...gateLines(release.gates),
  ];
}

function triageLines(manifest: AdmissionManifest): string[] {
  const classification = manifest.releaseGauntletClassification;
  if (classification === null || classification === undefined) return [];
  if (classification.kind === 'inherited-standing-red') {
    return [
      '### Standing findings triage',
      'The release gauntlet reported findings, and every one of them also reproduces at the base commit with no train operations applied (verified control run). They are standing findings of the current release, inherited — not introduced — by this change.',
      `- Control report: \`${classification.controlReportPath}\` (digest \`${classification.controlReportDigest}\`)`,
      ...classification.trainFindings.map((finding) => `- Inherited \`${finding.gateId}\`/\`${finding.categoryCode}\`; subjects=${finding.subjects.map((entry) => `\`${entry}\``).join(', ') || 'none'}`),
      '',
    ];
  }
  return [
    '### Deferred signing triage',
    'The release gauntlet findings are exactly the approval findings predicted by the recorded deferred-signing marker (merge-first-sign-once): the post-merge identity is signed once after this merge lands.',
    ...classification.findings.map((finding) => `- Predicted \`${finding.gateId}\`/\`${finding.categoryCode}\`; subjects=${finding.subjects.map((entry) => `\`${entry}\``).join(', ') || 'none'}`),
    '',
  ];
}

function buildPrBody(
  manifest: AdmissionManifest,
  proposal: ProposalManifest,
  branch: string,
  sourceDigest: string,
  fixtureDigest: string,
  comparison: ComparisonReport | null,
): string {
  const files = manifest.sourceChanges.filter((entry) => entry.changed).sort((a, b) => a.path.localeCompare(b.path));
  const exactFiles = files.map((entry) => `- \`${entry.path}\`: \`${entry.before.sha256}\` -> \`${entry.after.sha256}\``).join('\n');
  const rollback = manifest.rollback.map((entry) => `- Restore \`${entry.path}\` to \`${entry.restoreSha256}\`.`).join('\n');
  return [
    `## Refinement: ${proposal.proposalId}`,
    '',
    `Draft branch: \`${branch}\``,
    '',
    '### Linked cases',
    ...manifest.linkedCaseIds.map((entry) => `- \`${entry}\``),
    '',
    '### Current / candidate outcomes',
    ...outcomeLines(manifest, comparison),
    '### Probe and baseline movement',
    ...probeLines(manifest),
    '',
    '### Provenance',
    ...manifest.provenance.map((entry) => `- ${entry}`),
    ...manifest.decisions.map((entry) => `- Signed ${entry.kind} decision by ${entry.reviewer} at ${entry.decidedAt}: ${entry.rationale} (\`${entry.decisionDigest}\`)`),
    '',
    '### Gates',
    ...gateSection(manifest),
    '',
    ...triageLines(manifest),
    '### Artifact identity',
    ...identityLines(manifest, comparison),
    '',
    '### Exact files and digests',
    exactFiles,
    `- Source digest: \`${sourceDigest}\``,
    `- Fixture digest: \`${fixtureDigest}\``,
    `- Tree: \`${manifest.worktreeTreeHash}\``,
    `- Admission preview: \`${manifest.previewDigest}\``,
    `- Admission: \`${manifest.digest}\``,
    '',
    '### Rollback',
    rollback,
    '',
    'This draft preparation does not merge, release, publish an artifact, or dispatch a workflow.',
    '',
  ].join('\n');
}

async function updatePhase(
  root: string,
  journalPath: string,
  base: Omit<PublishJournal, 'phase' | 'commit' | 'verification' | 'draftPrUrl' | 'digest'>,
  phase: PublishPhase,
  commit: string | null,
  verification: PublishVerificationRun | PublishVerificationEvidence | null,
  draftPrUrl: string | null,
  onPhase: PublishPreparationDependencies['onPhase'],
): Promise<PublishJournal> {
  const journal = await writeJournal(root, journalPath, journalBody({ ...base, phase, commit, verification, draftPrUrl }));
  await onPhase?.(phase, { branch: journal.branch, worktree: journal.worktree, ...(commit === null ? {} : { commit }) });
  return journal;
}

export async function prepareDraftPublication(input: PreparePublishInput): Promise<PublishPreparationResult> {
  const root = await realDirectory(input.repoRoot, 'Repository root');
  const proposal = parseProposalManifest(input.proposal);
  if (!SAFE_PROPOSAL.test(proposal.proposalId)) fail('invalid_proposal', 'proposalId must be a lowercase hyphenated slug.');
  const manifest = await loadAdmission(input, root, proposal);
  const trusted = validateTrustedEvidence(input.evidence, manifest, proposal);
  const remote = input.remote ?? 'origin';
  if (!SAFE_REMOTE.test(remote)) fail('invalid_remote', 'Configured remote name is invalid.');
  const dependencies = input.dependencies ?? {};
  const commands = new Commands(dependencies.runner ?? defaultRunner);
  const gitRoot = await commands.git(['rev-parse', '--show-toplevel'], root, 'not_repository');
  if (!samePath(gitRoot, root)) fail('not_repository', 'repoRoot is not the Git repository root.');
  const remoteUrl = await commands.git(['remote', 'get-url', remote], root, 'remote_unavailable');
  if (remoteUrl.length === 0) fail('remote_unavailable', 'Configured remote has no URL.');
  let ghReady = false;
  if (input.openDraftPr === true) {
    const version = await commands.raw('gh', ['--version'], root);
    const auth = version.exitCode === 0 ? await commands.raw('gh', ['auth', 'status'], root) : version;
    ghReady = version.exitCode === 0 && auth.exitCode === 0;
  }
  const expectedMain = manifest.expectedMainCommit;
  await assertMain(commands, root, remote, expectedMain);
  if (manifest.baseCommit !== expectedMain) fail('stale_main', 'Admitted base is not current reviewed main.');
  const primaryBefore = await primarySnapshot(commands, root);
  const date = manifest.admittedAt.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('invalid_manifest', 'Admission timestamp is invalid.');
  const branch = `refinement/${date}-${proposal.proposalId}`;
  await commands.git(['check-ref-format', '--branch', branch], root, 'invalid_branch');
  const worktreeParent = await ensureRealDirectoryChain(root, WORKTREE_ROOT);
  const worktree = path.join(worktreeParent, proposal.proposalId);
  if (!within(worktreeParent, worktree)) fail('unsafe_path', 'Publish worktree path escaped confinement.');
  const journalPath = `${STATE_ROOT}/${proposal.proposalId}.json`;
  let journal = await readJournal(root, journalPath);
  const baseJournal = {
    schemaVersion: 2 as const,
    kind: 'scripture-search-publish-preparation' as const,
    proposalId: proposal.proposalId,
    manifestDigest: manifest.digest,
    originMain: expectedMain,
    branch,
    worktree,
  };
  if (journal !== null && (journal.manifestDigest !== manifest.digest || journal.originMain !== expectedMain
      || journal.branch !== branch || !samePath(journal.worktree, worktree))) fail('journal_conflict', 'Existing publish journal belongs to different reviewed evidence.');
  const localExists = await refExists(commands, root, `refs/heads/${branch}`);
  const remoteExisting = await remoteBranch(commands, root, remote, branch);
  if (journal === null && (localExists || remoteExisting !== null)) fail('branch_conflict', `Branch ${branch} already exists locally or remotely.`);
  const worktreeExists = await lstat(worktree).then(() => true, () => false);
  if (journal === null && worktreeExists) fail('worktree_conflict', 'Publish worktree destination is not clean.');

  if (journal === null) {
    await commands.git(['worktree', 'add', '--detach', worktree, expectedMain], root);
    await assertWorktree(worktreeParent, worktree);
    await commands.git(['switch', '-c', branch], worktree);
    journal = await updatePhase(root, journalPath, baseJournal, 'worktree-created', null, null, null, dependencies.onPhase);
  } else {
    if (!worktreeExists) fail('journal_conflict', 'Owned interrupted worktree is missing.');
    await assertWorktree(worktreeParent, worktree);
    const branchName = await commands.git(['branch', '--show-current'], worktree);
    if (branchName !== branch) fail('branch_conflict', 'Interrupted worktree no longer owns the expected branch.');
    const head = requireCommit(await commands.git(['rev-parse', 'HEAD'], worktree), 'recovered branch head');
    const candidateCommit = journal.commit ?? (head === expectedMain ? null : head);
    if (candidateCommit !== null) {
      const proven = candidateCommit === head && await proveAdmittedCommit(
        commands, worktree, branch, candidateCommit, manifest, proposal, journal.verification,
      );
      if (proven) {
        if (journal.commit !== candidateCommit) {
          journal = await updatePhase(root, journalPath, baseJournal, 'committed', candidateCommit, journal.verification, null, dependencies.onPhase);
        }
      } else {
        if (journal.phase === 'pushed' || journal.phase === 'draft-pr-opened') {
          fail('recovery_review_required', 'Published local commit cannot be independently proven as the admitted verified commit.');
        }
        await recreateOwnedWorktree(commands, root, worktreeParent, worktree, branch, expectedMain);
        journal = await updatePhase(root, journalPath, baseJournal, 'worktree-created', null, null, null, dependencies.onPhase);
      }
    } else if (journal.commit !== null) {
      fail('recovery_review_required', 'Journal commit is absent from the owned refinement branch.');
    }
  }

  const changed = manifest.sourceChanges.filter((entry) => entry.changed).sort((a, b) => a.path.localeCompare(b.path));
  const changedPaths = changed.map((entry) => entry.path);
  for (const entry of changed) await assertNoSubmodule(commands, worktree, entry.path);

  if ((journal!.phase === 'pushed' || journal!.phase === 'draft-pr-opened') && journal!.commit !== null) {
    await assertRemotePublished(commands, root, remote, branch, journal!.commit);
  }

  if (journal!.commit === null) {
    await assertMain(commands, root, remote, expectedMain);
    await applyAdmittedFiles(worktree, manifest, dependencies.apply);
    await rm(path.join(worktree, 'workbench', '.state'), { recursive: true, force: true });
    journal = await updatePhase(root, journalPath, baseJournal, 'files-applied', null, null, null, dependencies.onPhase);
    await commands.git(['reset'], worktree);
    await commands.git(['add', '--', ...changedPaths], worktree);
    const preVerifyTree = await inspectIndex(commands, worktree, changedPaths);
    if (preVerifyTree !== manifest.worktreeTreeHash) fail('tree_mismatch', 'Prepared tree does not match the admitted tree.');
    await assertMain(commands, root, remote, expectedMain);
    const preCommitVerification = await runFixedVerify(commands, worktree, manifest, preVerifyTree);
    await removeVerificationState(commands, worktree);
    await commands.git(['reset'], worktree);
    await commands.git(['add', '--', ...changedPaths], worktree);
    const verifiedTree = await inspectIndex(commands, worktree, changedPaths);
    if (verifiedTree !== manifest.worktreeTreeHash) fail('tree_mismatch', 'Verification changed the admitted tree.');
    journal = await updatePhase(root, journalPath, baseJournal, 'verified', null, preCommitVerification, null, dependencies.onPhase);
    await assertMain(commands, root, remote, expectedMain);
    const message = commitMessage(proposal, manifest, preCommitVerification);
    const [subject, _blank, ...trailers] = message.split('\n');
    await commands.git([
      '-c', 'user.name=Scripture Refinement Workbench',
      '-c', 'user.email=workbench@localhost.invalid',
      'commit', '-m', subject!, '-m', trailers.join('\n'),
    ], worktree, 'commit_failed');
    const commit = requireCommit(await commands.git(['rev-parse', 'HEAD'], worktree), 'publish commit');
    const committedTree = requireCommit(await commands.git(['rev-parse', 'HEAD^{tree}'], worktree), 'committed tree');
    if (committedTree !== manifest.worktreeTreeHash) fail('tree_mismatch', 'Committed tree differs from admission.');
    const committedVerificationRun = await runFixedVerify(commands, worktree, manifest, committedTree);
    await removeVerificationState(commands, worktree);
    const verificationBody = {
      schemaVersion: 2 as const,
      manifestDigest: manifest.digest,
      treeHash: committedTree,
      commit,
      preCommit: preCommitVerification,
      committed: committedVerificationRun,
    };
    const verification: PublishVerificationEvidence = { ...verificationBody, digest: digest(verificationBody) };
    if (!await proveAdmittedCommit(commands, worktree, branch, commit, manifest, proposal, verification)) {
      fail('commit_proof_failed', 'New refinement commit failed independent admission proof.');
    }
    await assertMain(commands, root, remote, expectedMain);
    journal = await updatePhase(root, journalPath, baseJournal, 'committed', commit, verification, null, dependencies.onPhase);
  }

  const commit = journal!.commit!;
  const { sourceDigest, fixtureDigest } = sourceDigests(manifest);
  const prBody = buildPrBody(manifest, proposal, branch, sourceDigest, fixtureDigest, trusted.comparison);
  let draftPrUrl = journal!.draftPrUrl;
  let status: PublishPreparationStatus = journal!.phase === 'committed' ? 'LOCAL_READY'
    : journal!.phase === 'pushed' ? 'PUSHED'
      : journal!.phase === 'draft-pr-opened' ? 'ALREADY_PREPARED'
        : 'LOCAL_READY';
  const next: string[] = [];

  if (input.push === true && journal!.phase === 'committed') {
    await assertMain(commands, root, remote, expectedMain);
    const conflict = await remoteBranch(commands, root, remote, branch);
    if (conflict !== null && conflict !== commit) fail('branch_conflict', 'Remote branch appeared or moved before push.');
    if (conflict === commit) {
      await assertRemotePublished(commands, root, remote, branch, commit);
      journal = await updatePhase(root, journalPath, baseJournal, 'pushed', commit, journal!.verification, null, dependencies.onPhase);
      status = 'PUSHED';
    } else {
      const pushResult = await commands.raw('git', [
        'push', '--set-upstream', `--force-with-lease=refs/heads/${branch}:`, remote,
        `refs/heads/${branch}:refs/heads/${branch}`,
      ], worktree);
      if (pushResult.exitCode === 0) {
        await assertRemotePublished(commands, root, remote, branch, commit);
        journal = await updatePhase(root, journalPath, baseJournal, 'pushed', commit, journal!.verification, null, dependencies.onPhase);
        status = 'PUSHED';
      } else {
        next.push(`git -C "${worktree}" push --set-upstream ${remote} "refs/heads/${branch}:refs/heads/${branch}"`);
      }
    }
  } else if (input.push !== true && journal!.phase === 'committed') {
    next.push(`git -C "${worktree}" push --set-upstream ${remote} "refs/heads/${branch}:refs/heads/${branch}"`);
  }

  if (input.openDraftPr === true && (journal!.phase === 'pushed' || journal!.phase === 'draft-pr-opened')) {
    await assertRemotePublished(commands, root, remote, branch, commit);
    if (ghReady) {
      const existing = await commands.raw('gh', ['pr', 'view', branch, '--json', 'url,isDraft,headRefName,headRefOid'], root);
      if (existing.exitCode === 0 && existing.stdout.trim() !== '') {
        draftPrUrl = parseVerifiedPr(existing.stdout, branch, commit).url;
      } else {
        const created = await commands.raw('gh', [
          'pr', 'create', '--draft', '--base', 'main', '--head', branch,
          '--title', `Refinement: ${proposal.proposalId}`, '--body', prBody,
        ], root);
        if (created.exitCode === 0) {
          const verified = await commands.raw('gh', ['pr', 'view', branch, '--json', 'url,isDraft,headRefName,headRefOid'], root);
          if (verified.exitCode !== 0) fail('pr_verification_failed', 'Created draft PR could not be independently re-read.');
          draftPrUrl = parseVerifiedPr(verified.stdout, branch, commit).url;
        } else next.push(`gh pr create --draft --base main --head "${branch}"`);
      }
      if (draftPrUrl !== null) {
        journal = await updatePhase(root, journalPath, baseJournal, 'draft-pr-opened', commit, journal!.verification, draftPrUrl, dependencies.onPhase);
        status = 'DRAFT_PR_OPENED';
      }
    } else {
      next.push(`gh pr create --draft --base main --head "${branch}"`);
    }
  } else if (input.openDraftPr === true && journal!.phase === 'committed') {
    next.push(`gh pr create --draft --base main --head "${branch}"`);
  }

  await assertMain(commands, root, remote, expectedMain);
  if (!await proveAdmittedCommit(commands, worktree, branch, commit, manifest, proposal, journal!.verification)) {
    fail('recovery_review_required', 'Final local refinement commit proof failed.');
  }
  if (journal!.phase === 'pushed' || journal!.phase === 'draft-pr-opened') {
    await assertRemotePublished(commands, root, remote, branch, commit);
  }
  if (await primarySnapshot(commands, root) !== primaryBefore) fail('primary_changed', 'Primary worktree or index changed during isolated preparation.');
  return {
    status,
    branch,
    commit,
    worktree,
    manifestDigest: manifest.digest,
    sourceDigest,
    fixtureDigest,
    treeHash: manifest.worktreeTreeHash,
    prBody,
    draftPrUrl,
    safeNextActions: next,
    logs: commands.logs,
  };
}
