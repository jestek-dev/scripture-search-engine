import { execFile } from 'node:child_process';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, mkdir, open, realpath, rename, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  GAUNTLET_GATE_ROSTER,
  GAUNTLET_MACHINE_REPORT_SCHEMA,
  canonicalJson as canonicalGauntletJson,
  verifyMachineReportFreshness,
  type GauntletMachineReport,
  type MachineGate,
} from '../../eval/src/gauntletMachineReport.js';

import {
  applyMutationPlan,
  applyMutationPlanWithLockedValidation,
  createMutationPlan,
  validateRepoRelativePath,
  type ApplyOptions,
  type MutationInput,
} from './applyJournal.js';
import { assertComparisonReportIntegrity, type ComparisonQueryReport, type ComparisonReport } from './comparison.js';
import type { ComparisonCandidateBinding } from './comparisonRunner.js';
import type { FixturePromotionPlan } from './fixturePromotion.js';
import { buildJobEnvironment, resolveNpmCliPath } from './jobRunner.js';
import {
  parseProposalManifest,
  proposalManifestDigest,
  type FixtureCorpusChapterAdd,
  type GoldenFixtureUpsert,
  type JsonValue,
  type ProposalManifest,
  type ProposalOperation,
} from './proposals.js';
import { isStructuredConceptOperation, previewStructuredYamlEdit } from './structuredYaml.js';

const execFileAsync = promisify(execFile);
const SHA256 = /^[0-9a-f]{64}$/;
const COMMIT = /^[0-9a-f]{40,64}$/;
const DECISION_KINDS = ['source-proposal', 'fixture-promotion', 'probe-baseline'] as const;
const ADMISSION_DIRECTORY = 'workbench/admissions';
const WORKTREE_DIRECTORY = 'workbench/.state/admission-worktrees';
const MAX_OUTPUT_BYTES = 64 * 1024;
const ADMISSION_LOCK_WAIT_MS = 60_000;

export type AdmissionDecisionKind = (typeof DECISION_KINDS)[number];
export type AdmissionStatus = 'ADMITTED' | 'ALREADY_ADMITTED' | 'NO_MEASURABLE_EFFECT';

export interface AdmissionCandidateBinding {
  readonly cacheKey: string;
  readonly proposalDigest: string;
  readonly sourceSnapshotDigest: string;
  readonly descriptorSha256: string;
  readonly databaseSha256: string;
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  readonly candidateDirectory: string;
  readonly descriptorPath: string;
  readonly databasePath: string;
}

export interface AdmissionGauntletReference {
  readonly reportPath: string;
}

export interface VerifiedAdmissionGauntlet {
  readonly schemaVersion: 1;
  readonly reportPath: string;
  readonly reportSha256: string;
  readonly payloadSha256: string;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly blocking: boolean;
  readonly verdict: 'ADMIT' | 'ADMIT_WITH_WARNINGS';
  readonly baseIdentity: ComparisonCandidateBinding['referenceIdentity'];
  readonly candidateIdentity: ComparisonCandidateBinding['candidateIdentity'];
  readonly baseCommit: string;
  readonly proposalDigest: string;
  readonly sourceSnapshotDigest: string;
  readonly candidateDescriptorSha256: string;
  readonly candidateDatabaseSha256: string;
  readonly comparisonDigest: string;
  readonly gates: readonly MachineGate[];
  readonly gatesDigest: string;
  readonly digest: string;
}

export interface AdmissionGauntletExpectation {
  readonly baseCommit: string;
  readonly proposalDigest: string;
  readonly sourceSnapshotDigest: string;
  readonly candidateDescriptorSha256: string;
  readonly candidateDatabaseSha256: string;
  readonly comparisonDigest: string;
  readonly baseIdentity: ComparisonCandidateBinding['referenceIdentity'];
  readonly candidateIdentity: ComparisonCandidateBinding['candidateIdentity'];
  readonly cacheKey: string;
  readonly descriptorPath: string;
  readonly databasePath: string;
}

export interface VerifiedReleaseGauntlet {
  readonly schemaVersion: 1;
  readonly targetKind: 'release';
  readonly reportPath: string;
  readonly reportSha256: string;
  readonly payloadSha256: string;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly blocking: false;
  readonly verdict: 'ADMIT' | 'ADMIT_WITH_WARNINGS';
  readonly baseCommit: string;
  readonly descriptorPath: 'artifacts/content-artifact.json';
  readonly descriptorSha256: string;
  readonly databasePath: 'workbench/.artifact/content.db';
  readonly databaseSha256: string;
  readonly engineIdentity: ComparisonCandidateBinding['candidateIdentity'];
  readonly gates: readonly MachineGate[];
  readonly gatesDigest: string;
  readonly digest: string;
}

interface ReleaseGauntletExpectation {
  readonly baseCommit: string;
  readonly descriptorSha256: string;
  readonly databaseSha256: string;
  readonly engineIdentity: ComparisonCandidateBinding['candidateIdentity'];
}

export type TrustedGauntletLoader = (
  repoRoot: string,
  reportPath: string,
  expectation: AdmissionGauntletExpectation,
) => Promise<Uint8Array>;

export interface ProbeBaselineInput {
  readonly path: 'eval/baselines/probes.json';
  readonly beforeSha256: string;
  readonly after: JsonValue;
}

export interface ProbeApprovalInput {
  readonly path: 'eval/baselines/probes.approval.json';
  readonly beforeSha256: string;
  readonly after: JsonValue;
}

export interface AdmissionPreviewInput {
  readonly repoRoot: string;
  readonly admittedBaseCommit: string;
  readonly expectedMainCommit: string;
  readonly proposal: unknown;
  readonly candidate: AdmissionCandidateBinding;
  readonly comparison: ComparisonReport;
  readonly comparisonBinding: ComparisonCandidateBinding;
  readonly gauntlet: AdmissionGauntletReference;
  /** Trusted test/integration boundary. Production callers omit this and use the verified disk loader. */
  readonly trustedGauntletLoader?: TrustedGauntletLoader;
  /** Trusted test/integration clock. Production callers omit this so freshness is judged on the real clock. */
  readonly now?: () => Date;
  readonly reviewedComparisonQueries: readonly string[];
  readonly fixturePromotions?: readonly FixturePromotionPlan[];
  readonly probeBaseline?: ProbeBaselineInput;
  readonly probeApproval?: ProbeApprovalInput;
}

export interface AdmissionFileDiff {
  readonly path: string;
  readonly kind: 'yaml' | 'fixture' | 'selection' | 'fixture-promotion' | 'probe-baseline' | 'probe-approval';
  readonly operationIds: readonly string[];
  readonly before: { readonly sha256: string; readonly base64: string; readonly text: string };
  readonly after: { readonly sha256: string; readonly base64: string; readonly text: string };
  readonly changed: boolean;
  readonly digest: string;
}

export interface ProbeMovement {
  readonly probeId: string;
  readonly beforeSha256: string | null;
  readonly afterSha256: string | null;
}

export interface AdmissionPreview {
  readonly schemaVersion: 1;
  readonly proposal: ProposalManifest;
  readonly proposalDigest: string;
  readonly admittedBaseCommit: string;
  readonly expectedMainCommit: string;
  readonly candidate: AdmissionCandidateBinding;
  readonly comparisonDigest: string;
  readonly comparisonUniverseDigest: string;
  readonly comparisonReviewDigest: string;
  readonly gauntletDigest: string;
  readonly gauntlet: VerifiedAdmissionGauntlet;
  readonly reviewedComparisonQueries: readonly string[];
  readonly diffs: readonly AdmissionFileDiff[];
  readonly fixtureDecisionSubjects: readonly { readonly fixtureId: string; readonly digest: string }[];
  readonly probeMovements: readonly ProbeMovement[];
  readonly probeDecisionSubject: string | null;
  readonly sourceDecisionSubject: string;
  readonly decisionSlots: readonly { readonly kind: AdmissionDecisionKind; readonly slotId: string; readonly subjectDigest: string }[];
  readonly measurableEffect: boolean;
  readonly digest: string;
}

export interface ProbeDecisionRationale extends ProbeMovement {
  readonly rationale: string;
}

export interface AdmissionDecision {
  readonly schemaVersion: 1;
  readonly kind: AdmissionDecisionKind;
  readonly subjectDigest: string;
  readonly previewDigest: string;
  readonly reviewer: string;
  readonly rationale: string;
  readonly decidedAt: string;
  readonly probeRationales?: readonly ProbeDecisionRationale[];
  readonly decisionDigest: string;
  readonly signature: string;
}

export interface CommandOutcome {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly exitCode: 0;
  readonly stdoutSha256: string;
  readonly stderrSha256: string;
  readonly stdoutTail: string;
  readonly stderrTail: string;
}

export interface AdmissionRebuiltDescriptor {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  readonly databaseSha256: string;
  readonly [key: string]: unknown;
}

export interface RebuildEvidence {
  readonly status: 'REBUILT';
  readonly descriptor: AdmissionRebuiltDescriptor;
  readonly descriptorSha256: string;
  readonly databaseSha256: string;
  readonly outputFiles?: readonly { readonly path: 'artifacts/content-artifact.json' | 'workbench/.artifact/content.db'; readonly sha256: string }[];
  readonly command: CommandOutcome;
}

export interface VerifyEvidence {
  readonly status: 'PASSED';
  readonly command: CommandOutcome;
  readonly releaseGauntlet: {
    readonly reportPath: 'eval/.runs/admission-release-report.json';
    readonly reportBytes: Uint8Array;
    readonly command: CommandOutcome;
  };
}

export interface AdmissionManifest {
  readonly schemaVersion: 1;
  readonly kind: 'scripture-search-admission';
  readonly admissionKey: string;
  readonly admittedAt: string;
  readonly previewDigest: string;
  readonly proposalDigest: string;
  readonly linkedCaseIds: readonly string[];
  readonly provenance: readonly string[];
  readonly baseCommit: string;
  readonly expectedMainCommit: string;
  readonly worktreeTreeHash: string;
  readonly decisions: readonly AdmissionDecision[];
  readonly candidate: AdmissionCandidateBinding;
  readonly rebuiltCandidate: RebuildEvidence;
  readonly comparison: { readonly digest: string; readonly binding: ComparisonCandidateBinding };
  readonly gauntlet: VerifiedAdmissionGauntlet;
  readonly releaseGauntlet?: VerifiedReleaseGauntlet;
  readonly sourceChanges: readonly AdmissionFileDiff[];
  readonly probeMovements: readonly ProbeMovement[];
  readonly commands: readonly CommandOutcome[];
  readonly rollback: readonly {
    readonly path: string;
    readonly restoreSha256: string;
    readonly restoreBase64: string;
    readonly admittedSha256: string;
  }[];
  readonly digest: string;
}

export interface GitAdapter {
  resolveCommit(repoRoot: string, revision: string): Promise<string>;
  readMain(repoRoot: string): Promise<string>;
  addWorktree(repoRoot: string, worktree: string, commit: string): Promise<CommandOutcome>;
  inspectWorktree(repoRoot: string, worktree: string): Promise<{
    readonly head: string;
    readonly commonDirectory: string;
    readonly primaryCommonDirectory: string;
    readonly topLevel: string;
    readonly superproject: string;
    readonly submodules: string;
    readonly statusPorcelainZ: string;
    readonly commands: readonly CommandOutcome[];
  }>;
  treeHash(worktree: string): Promise<{ readonly hash: string; readonly commands: readonly CommandOutcome[] }>;
  removeWorktree(repoRoot: string, worktree: string): Promise<CommandOutcome>;
}

export interface AdmissionDependencies {
  readonly git?: GitAdapter;
  readonly rebuild?: (worktree: string, preview: AdmissionPreview) => Promise<RebuildEvidence>;
  readonly verify?: (worktree: string, preview: AdmissionPreview, rebuilt: RebuildEvidence) => Promise<VerifyEvidence>;
  readonly decisionSigningKey?: string;
  readonly now?: () => Date;
  readonly idFactory?: () => string;
  readonly apply?: ApplyOptions;
  readonly onPhase?: (phase: AdmissionPhase, context: { readonly worktree?: string; readonly manifestPath?: string }) => void | Promise<void>;
}

export interface RunAdmissionInput extends AdmissionPreviewInput {
  readonly expectedPreviewDigest: string;
  readonly decisions: readonly AdmissionDecision[];
  readonly linkedCaseIds: readonly string[];
  readonly provenance: readonly string[];
  readonly dependencies?: AdmissionDependencies;
}

export interface AdmissionResult {
  readonly status: AdmissionStatus;
  readonly preview: AdmissionPreview;
  readonly manifestPath: string | null;
  readonly manifest: AdmissionManifest | null;
}

export type AdmissionPhase =
  | 'worktree-created'
  | 'sources-applied'
  | 'rebuilt'
  | 'verified'
  | 'before-manifest'
  | 'manifest-published';

export class AdmissionError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'AdmissionError';
  }
}

function fail(code: string, message: string): never {
  throw new AdmissionError(code, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonical(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) fail('invalid_input', 'Admission data contains an unsupported primitive.');
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (!isRecord(value)) fail('invalid_input', 'Admission data must be JSON-compatible.');
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
}

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function digest(value: unknown): string {
  return sha256(canonical(value));
}

function requireDigest(value: string, label: string): string {
  if (!SHA256.test(value)) fail('invalid_input', `${label} must be a lowercase SHA-256 digest.`);
  return value;
}

function requireCommit(value: string, label: string): string {
  if (!COMMIT.test(value)) fail('invalid_input', `${label} must be a full lowercase commit id.`);
  return value;
}

function requireText(value: string, label: string, minimum = 1): string {
  if (typeof value !== 'string' || value.trim() !== value || value.length < minimum || value.length > 2_000) {
    fail('invalid_input', `${label} is not canonical text.`);
  }
  return value;
}

function canonicalPrettyJson(value: unknown): string {
  return `${JSON.stringify(JSON.parse(canonical(value)) as unknown, null, 2)}\n`;
}

function bytes(text: string): AdmissionFileDiff['before'] {
  return { text, base64: Buffer.from(text).toString('base64'), sha256: sha256(text) };
}

function diffDigest(value: Omit<AdmissionFileDiff, 'digest'>): string {
  return digest(value);
}

function within(parent: string, child: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function realDirectory(directory: string, label: string): Promise<string> {
  const stats = await lstat(path.resolve(directory)).catch(() => null);
  if (stats === null || !stats.isDirectory() || stats.isSymbolicLink()) fail('unsafe_path', `${label} must be a real directory.`);
  return realpath(path.resolve(directory));
}

function sameFileIdentity(left: { dev: number; ino: number; birthtimeMs: number }, right: { dev: number; ino: number; birthtimeMs: number }): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.birthtimeMs === right.birthtimeMs;
}

function samePath(left: string, right: string): boolean {
  const normalize = (value: string) => process.platform === 'win32' ? path.resolve(value).toLocaleLowerCase('en-US') : path.resolve(value);
  return normalize(left) === normalize(right);
}

async function readConfinedRegularFile(repoRoot: string, relativePath: string, allowMissing: boolean): Promise<Buffer | null> {
  const root = await realDirectory(repoRoot, 'Repository root');
  const target = path.join(root, ...relativePath.split('/'));
  let cursor = root;
  for (const [index, piece] of relativePath.split('/').entries()) {
    cursor = path.join(cursor, piece);
    const stats = await lstat(cursor).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (stats === null) {
      if (allowMissing) return null;
      fail('stale_candidate', 'Required evidence file is missing.');
    }
    if (stats.isSymbolicLink()) fail('unsafe_path', `Path ${relativePath} contains a link or junction.`);
    if (index < relativePath.split('/').length - 1 && !stats.isDirectory()) fail('unsafe_path', `Path ${relativePath} has a non-directory ancestor.`);
  }
  const before = await lstat(target);
  if (!before.isFile() || before.isSymbolicLink()) fail('unsafe_path', `Path ${relativePath} is not a regular file.`);
  const noFollow = 'O_NOFOLLOW' in constants ? constants.O_NOFOLLOW : 0;
  const handle = await open(target, constants.O_RDONLY | noFollow).catch(() => fail('unsafe_path', `Path ${relativePath} changed before it could be opened.`));
  try {
    const opened = await handle.stat();
    if (!opened.isFile() || !sameFileIdentity(opened, before)) fail('unsafe_path', `Path ${relativePath} changed while it was opened.`);
    const validate = async (): Promise<void> => {
      const resolved = await realpath(target).catch(() => fail('unsafe_path', `Path ${relativePath} disappeared while it was read.`));
      if (!samePath(resolved, target) || !within(root, resolved)) fail('unsafe_path', `Path ${relativePath} escapes the repository.`);
      const current = await lstat(target);
      if (!current.isFile() || current.isSymbolicLink() || !sameFileIdentity(current, opened)) fail('unsafe_path', `Path ${relativePath} changed while it was read.`);
      if (!sameFileIdentity(await handle.stat(), opened)) fail('unsafe_path', `Open evidence handle for ${relativePath} changed identity.`);
    };
    await validate();
    const value = await handle.readFile();
    await validate();
    return value;
  } finally {
    await handle.close();
  }
}

async function readConfinedSource(repoRoot: string, relativePath: string): Promise<string> {
  const safe = validateRepoRelativePath(relativePath);
  const value = await readConfinedRegularFile(repoRoot, safe, true);
  if (value === null) return '';
  try { return new TextDecoder('utf-8', { fatal: true }).decode(value); }
  catch { fail('invalid_source', `Source path ${safe} is not valid UTF-8.`); }
}

async function readCandidateFile(repoRoot: string, relativePath: string, expectedDirectory: string): Promise<Buffer> {
  if (!/^[a-zA-Z0-9._/-]+$/.test(relativePath) || relativePath.startsWith('/') || /^[a-zA-Z]:/.test(relativePath)
      || relativePath.split('/').some((part) => part === '' || part === '.' || part === '..')) {
    fail('unsafe_path', 'Candidate evidence path is not a safe repository-relative path.');
  }
  if (relativePath !== `${expectedDirectory}/candidate-artifact.json` && relativePath !== `${expectedDirectory}/content.db`) {
    fail('unsafe_path', 'Candidate evidence path is outside its content-addressed directory.');
  }
  return (await readConfinedRegularFile(repoRoot, relativePath, false))!;
}

function sourcePrecondition(proposal: ProposalManifest, sourcePath: string): string {
  const found = proposal.sourcePreconditions.find((entry) => entry.path === sourcePath);
  if (found === undefined) fail('source_precondition', `No source precondition exists for ${sourcePath}.`);
  return requireDigest(found.sha256, `Source precondition for ${sourcePath}`);
}

function fixtureAfter(operation: GoldenFixtureUpsert): string {
  return canonicalPrettyJson(operation.fixture);
}

function selectionAfter(sourceText: string, operation: FixtureCorpusChapterAdd): string {
  let parsed: unknown;
  try { parsed = JSON.parse(sourceText); } catch { fail('invalid_source', 'Fixture corpus selection must be valid JSON.'); }
  if (!isRecord(parsed) || !Array.isArray(parsed.selection)) fail('invalid_source', 'Fixture corpus selection must contain a selection array.');
  const selection: { book: string; chapters: number[]; why: string; readonly [key: string]: unknown }[] = parsed.selection.map((entry, index) => {
    if (!isRecord(entry) || typeof entry.book !== 'string' || !Array.isArray(entry.chapters)
        || !entry.chapters.every((chapter) => Number.isSafeInteger(chapter) && (chapter as number) > 0)
        || typeof entry.why !== 'string') {
      fail('invalid_source', `Fixture corpus selection entry ${index} is invalid.`);
    }
    return { ...entry, book: entry.book, why: entry.why, chapters: [...entry.chapters] as number[] };
  });
  const existing = selection.find((entry) => entry.book === operation.book);
  if (existing === undefined) selection.push({ book: operation.book, chapters: [operation.chapter], why: operation.why });
  else {
    if (existing.chapters.includes(operation.chapter)) fail('no_effect', `${operation.book} ${operation.chapter} already exists in fixture selection.`);
    existing.chapters = [...existing.chapters, operation.chapter].sort((left, right) => left - right);
    existing.why = `${existing.why}; ${operation.why}`;
  }
  return canonicalPrettyJson({ ...parsed, selection });
}

function probeMap(text: string): Map<string, unknown> {
  let value: unknown;
  try { value = JSON.parse(text); } catch { fail('invalid_source', 'Probe baseline must be valid JSON.'); }
  if (!isRecord(value) || !Array.isArray(value.observations)) fail('invalid_source', 'Probe baseline must contain observations.');
  const result = new Map<string, unknown>();
  for (const [index, observation] of value.observations.entries()) {
    if (!isRecord(observation) || typeof observation.id !== 'string' || observation.id.trim() === '') {
      fail('invalid_source', `Probe observation ${index} has no canonical id.`);
    }
    if (result.has(observation.id)) fail('invalid_source', `Probe observation ${observation.id} is duplicated.`);
    result.set(observation.id, observation);
  }
  return result;
}

function probeMovements(beforeText: string, afterText: string): ProbeMovement[] {
  const before = probeMap(beforeText);
  const after = probeMap(afterText);
  return [...new Set([...before.keys(), ...after.keys()])].sort().flatMap((probeId) => {
    const left = before.get(probeId);
    const right = after.get(probeId);
    const beforeSha256 = left === undefined ? null : digest(left);
    const afterSha256 = right === undefined ? null : digest(right);
    return beforeSha256 === afterSha256 ? [] : [{ probeId, beforeSha256, afterSha256 }];
  });
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (canonical(actual) !== canonical(wanted)) fail('invalid_gauntlet', `${label} does not use the exact machine-report schema.`);
}

function gauntletReportPath(value: string): string {
  if (typeof value !== 'string' || !/^eval\/\.runs\/[a-zA-Z0-9._-]+\.json$/.test(value)) {
    fail('invalid_gauntlet', 'Gauntlet report must be a confined JSON path inside eval/.runs.');
  }
  return value;
}

function parseGauntletBytes(
  bytesValue: Uint8Array,
  reportPath: string,
  expectation: AdmissionGauntletExpectation | ReleaseGauntletExpectation,
  targetKind: 'candidate' | 'release' = 'candidate',
  now: Date,
): { readonly parsed: GauntletMachineReport; readonly verified: VerifiedAdmissionGauntlet | VerifiedReleaseGauntlet } {
  let parsedValue: unknown;
  try { parsedValue = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesValue)); }
  catch { fail('invalid_gauntlet', 'Gauntlet report must be valid UTF-8 JSON.'); }
  if (!isRecord(parsedValue)) fail('invalid_gauntlet', 'Gauntlet report must be an object.');
  exactKeys(parsedValue, ['schema', 'startedAt', 'finishedAt', 'identity', 'payload', 'payloadSha256', 'reportSha256'], 'Gauntlet report');
  if (parsedValue.schema !== GAUNTLET_MACHINE_REPORT_SCHEMA || !isRecord(parsedValue.identity) || !isRecord(parsedValue.payload)) {
    fail('invalid_gauntlet', 'Gauntlet report schema or top-level objects are invalid.');
  }
  const identity = parsedValue.identity;
  const payload = parsedValue.payload;
  exactKeys(identity, ['gitCommitSha', 'dirtyTreeSha256', 'descriptor', 'engine', 'target', 'budgetsSha256', 'fixtureInputSha256', 'flags'], 'Gauntlet identity');
  // `battery` (schema v2) is the G12 evidence section; admission verdicts
  // read the G12 roster row, so the section itself is optional here.
  exactKeys(
    payload,
    ['verdict', 'headline', 'gates', ...(isRecord(payload) && 'battery' in payload ? ['battery'] : [])],
    'Gauntlet payload',
  );
  if (!isRecord(identity.descriptor) || !isRecord(identity.engine) || !isRecord(identity.target)
      || !isRecord(identity.flags) || !Array.isArray(payload.gates)) {
    fail('invalid_gauntlet', 'Gauntlet identity, flags, engine, descriptor, or gates are malformed.');
  }
  exactKeys(identity.descriptor, ['path', 'sha256'], 'Gauntlet descriptor identity');
  exactKeys(identity.engine, ['engineVersion', 'corpusFingerprint', 'layerFingerprint'], 'Gauntlet engine identity');
  const flags = identity.flags;
  const target = identity.target;
  const candidateExpectation = targetKind === 'candidate' ? expectation as AdmissionGauntletExpectation : null;
  const releaseExpectation = targetKind === 'release' ? expectation as ReleaseGauntletExpectation : null;
  const expectedArgv = targetKind === 'candidate'
    ? ['--require-admit', '--json', reportPath, '--candidate-descriptor', candidateExpectation!.descriptorPath,
      '--candidate-database', candidateExpectation!.databasePath]
    : ['--require-admit', '--json', reportPath, '--release-database', 'workbench/.artifact/content.db'];
  const expectedFlags = targetKind === 'candidate'
    ? { checkSources: false, updateBaseline: false, requireAdmit: true, jsonPath: reportPath,
      candidateDescriptorPath: candidateExpectation!.descriptorPath,
      candidateDatabasePath: candidateExpectation!.databasePath, argv: expectedArgv }
    : { checkSources: false, updateBaseline: false, requireAdmit: true, jsonPath: reportPath,
      releaseDatabasePath: 'workbench/.artifact/content.db', argv: expectedArgv };
  exactKeys(flags, Object.keys(expectedFlags), 'Gauntlet flags');
  if (canonical(flags) !== canonical(expectedFlags)) {
    fail('invalid_gauntlet', 'Gauntlet report was not produced by the fixed admission-report mode.');
  }
  if (!SHA256.test(String(parsedValue.payloadSha256)) || !SHA256.test(String(parsedValue.reportSha256))
      || parsedValue.payloadSha256 !== sha256(canonicalGauntletJson(payload))) {
    fail('invalid_gauntlet', 'Gauntlet payload digest is invalid.');
  }
  const { reportSha256: storedReportSha256, ...unsigned } = parsedValue;
  if (storedReportSha256 !== sha256(canonicalGauntletJson(unsigned))) fail('invalid_gauntlet', 'Gauntlet report digest is invalid.');
  const startedAt = typeof parsedValue.startedAt === 'string' ? parsedValue.startedAt : '';
  const finishedAt = typeof parsedValue.finishedAt === 'string' ? parsedValue.finishedAt : '';
  const started = Date.parse(startedAt);
  const finished = Date.parse(finishedAt);
  if (!Number.isFinite(started) || !Number.isFinite(finished) || started > finished || finished > now.valueOf()
      || now.valueOf() - finished > 24 * 60 * 60 * 1000) {
    fail('stale_gauntlet', 'Gauntlet report timestamps are invalid, future-dated, or stale.');
  }
  if (identity.gitCommitSha !== expectation.baseCommit || identity.descriptor.path !== 'artifacts/content-artifact.json'
      || !SHA256.test(String(identity.descriptor.sha256))) {
    fail('gauntlet_identity_mismatch', 'Gauntlet repository identity does not match the admitted base commit.');
  }
  if (targetKind === 'candidate') {
    exactKeys(target, ['kind', 'descriptor', 'database', 'engine', 'baseEngine', 'cacheKey', 'proposalDigest', 'sourceSnapshotDigest'], 'Candidate gauntlet target');
    if (!isRecord(target.descriptor) || !isRecord(target.database) || !isRecord(target.engine) || !isRecord(target.baseEngine)) {
      fail('invalid_gauntlet', 'Candidate gauntlet target metadata is malformed.');
    }
    exactKeys(target.descriptor, ['kind', 'path', 'sha256'], 'Candidate target descriptor');
    exactKeys(target.database, ['path', 'sha256'], 'Candidate target database');
    exactKeys(target.engine, ['engineVersion', 'corpusFingerprint', 'layerFingerprint'], 'Candidate target engine');
    exactKeys(target.baseEngine, ['engineVersion', 'corpusFingerprint', 'layerFingerprint'], 'Candidate base engine');
    if (target.kind !== 'candidate' || target.descriptor.kind !== 'scripture-search-candidate'
        || target.descriptor.path !== candidateExpectation!.descriptorPath
        || target.descriptor.sha256 !== candidateExpectation!.candidateDescriptorSha256
        || target.database.path !== candidateExpectation!.databasePath
        || target.database.sha256 !== candidateExpectation!.candidateDatabaseSha256
        || target.cacheKey !== candidateExpectation!.cacheKey
        || target.proposalDigest !== candidateExpectation!.proposalDigest
        || target.sourceSnapshotDigest !== candidateExpectation!.sourceSnapshotDigest
        || canonical(target.engine) !== canonical(candidateExpectation!.candidateIdentity)
        || canonical(target.baseEngine) !== canonical(candidateExpectation!.baseIdentity)
        || canonical(identity.engine) !== canonical(candidateExpectation!.candidateIdentity)) {
      fail('gauntlet_identity_mismatch', 'Candidate gauntlet target does not match the exact admitted descriptor, database, lineage, or engine identities.');
    }
  } else {
    exactKeys(target, ['kind', 'descriptor', 'database', 'engine'], 'Release gauntlet target');
    if (!isRecord(target.descriptor) || !isRecord(target.database) || !isRecord(target.engine)) {
      fail('invalid_gauntlet', 'Release gauntlet target metadata is malformed.');
    }
    exactKeys(target.descriptor, ['kind', 'path', 'sha256'], 'Release target descriptor');
    exactKeys(target.database, ['path', 'sha256'], 'Release target database');
    exactKeys(target.engine, ['engineVersion', 'corpusFingerprint', 'layerFingerprint'], 'Release target engine');
    if (target.kind !== 'release' || target.descriptor.kind !== 'scripture-search-release'
        || target.descriptor.path !== 'artifacts/content-artifact.json'
        || target.descriptor.sha256 !== releaseExpectation!.descriptorSha256
        || target.database.path !== 'workbench/.artifact/content.db'
        || target.database.sha256 !== releaseExpectation!.databaseSha256
        || canonical(target.engine) !== canonical(releaseExpectation!.engineIdentity)
        || canonical(identity.engine) !== canonical(releaseExpectation!.engineIdentity)) {
      fail('gauntlet_identity_mismatch', 'Release gauntlet target does not match the rebuilt release descriptor, database, or engine identity.');
    }
  }
  if (payload.gates.length !== GAUNTLET_GATE_ROSTER.length) fail('invalid_gauntlet', 'Gauntlet report does not contain the complete gate roster.');
  const gates = payload.gates.map((gateValue, index) => {
    if (!isRecord(gateValue)) fail('invalid_gauntlet', `Gauntlet gate ${index} is malformed.`);
    exactKeys(gateValue, ['gate', 'code', 'title', 'status', 'applicability', 'verdict', 'summary', 'findings', 'metrics', 'promotionCandidates'], `Gauntlet gate ${index}`);
    const roster = GAUNTLET_GATE_ROSTER[index]!;
    if (gateValue.gate !== roster.id || gateValue.title !== roster.title || gateValue.applicability !== roster.applicability
        || !['pass', 'fail', 'warn', 'not-applicable'].includes(String(gateValue.status))
        || !Array.isArray(gateValue.findings) || !isRecord(gateValue.metrics) || !Array.isArray(gateValue.promotionCandidates)) {
      fail('invalid_gauntlet', `Gauntlet gate ${roster.id} does not match the authoritative roster or result schema.`);
    }
    for (const [findingIndex, findingValue] of gateValue.findings.entries()) {
      if (!isRecord(findingValue)) fail('invalid_gauntlet', `Gauntlet finding ${roster.id}/${findingIndex} is malformed.`);
      exactKeys(findingValue, ['categoryCode', 'instanceId', 'gateId', 'gateTitle', 'gateStatus', 'gateVerdict', 'message', 'subjects', 'params', 'metrics', 'compatibility'], `Gauntlet finding ${roster.id}/${findingIndex}`);
      if (findingValue.gateId !== roster.id || findingValue.gateStatus !== gateValue.status || findingValue.gateVerdict !== gateValue.verdict) {
        fail('invalid_gauntlet', `Gauntlet finding ${roster.id}/${findingIndex} is detached from its gate status.`);
      }
    }
    return gateValue as unknown as MachineGate;
  });
  const blocking = payload.verdict === 'REJECT' || gates.some((gate, index) =>
    gate.status === 'fail' || (GAUNTLET_GATE_ROSTER[index]!.applicability === 'required' && gate.status !== 'pass'));
  if (blocking || (payload.verdict !== 'ADMIT' && payload.verdict !== 'ADMIT_WITH_WARNINGS')) {
    fail('blocking_gauntlet', 'The verified gauntlet contains a blocking gate or rejection verdict.');
  }
  const gatesDigest = digest(gates);
  const common = {
    schemaVersion: 1 as const, reportPath, reportSha256: String(parsedValue.reportSha256),
    payloadSha256: String(parsedValue.payloadSha256), startedAt, finishedAt, blocking: false as const,
    verdict: payload.verdict as 'ADMIT' | 'ADMIT_WITH_WARNINGS', baseCommit: expectation.baseCommit,
    gates, gatesDigest,
  };
  const evidenceBody = targetKind === 'candidate'
    ? {
      ...common,
      baseIdentity: candidateExpectation!.baseIdentity, candidateIdentity: candidateExpectation!.candidateIdentity,
      proposalDigest: candidateExpectation!.proposalDigest,
      sourceSnapshotDigest: candidateExpectation!.sourceSnapshotDigest,
      candidateDescriptorSha256: candidateExpectation!.candidateDescriptorSha256,
      candidateDatabaseSha256: candidateExpectation!.candidateDatabaseSha256,
      comparisonDigest: candidateExpectation!.comparisonDigest,
    }
    : {
      ...common, targetKind: 'release' as const,
      descriptorPath: 'artifacts/content-artifact.json' as const,
      descriptorSha256: releaseExpectation!.descriptorSha256,
      databasePath: 'workbench/.artifact/content.db' as const,
      databaseSha256: releaseExpectation!.databaseSha256,
      engineIdentity: releaseExpectation!.engineIdentity,
    };
  return {
    parsed: parsedValue as unknown as GauntletMachineReport,
    verified: { ...evidenceBody, digest: digest(evidenceBody) },
  };
}

async function defaultGauntletLoader(repoRoot: string, reportPath: string): Promise<Uint8Array> {
  const bytesValue = await readConfinedRegularFile(repoRoot, gauntletReportPath(reportPath), false);
  let parsed: unknown;
  try { parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesValue!)); }
  catch { fail('invalid_gauntlet', 'Gauntlet report must be valid UTF-8 JSON.'); }
  const freshness = verifyMachineReportFreshness(repoRoot, path.join(repoRoot, ...reportPath.split('/')), parsed);
  if (!freshness.fresh) {
    fail('stale_gauntlet', `Gauntlet report is not fresh: ${freshness.mismatches.map((entry) => entry.code).join(', ')}.`);
  }
  return bytesValue!;
}

async function loadVerifiedGauntlet(
  input: AdmissionPreviewInput,
  proposalDigest: string,
): Promise<VerifiedAdmissionGauntlet> {
  const reportPath = gauntletReportPath(input.gauntlet.reportPath);
  const expectation: AdmissionGauntletExpectation = {
    baseCommit: input.admittedBaseCommit, proposalDigest, sourceSnapshotDigest: input.candidate.sourceSnapshotDigest,
    candidateDescriptorSha256: input.candidate.descriptorSha256, candidateDatabaseSha256: input.candidate.databaseSha256,
    comparisonDigest: input.comparison.digest, baseIdentity: input.comparisonBinding.referenceIdentity,
    candidateIdentity: input.comparisonBinding.candidateIdentity,
    cacheKey: input.candidate.cacheKey, descriptorPath: input.candidate.descriptorPath,
    databasePath: input.candidate.databasePath,
  };
  const loaded = input.trustedGauntletLoader === undefined
    ? await defaultGauntletLoader(input.repoRoot, reportPath)
    : await input.trustedGauntletLoader(input.repoRoot, reportPath, expectation);
  return parseGauntletBytes(loaded, reportPath, expectation, 'candidate', input.now?.() ?? new Date()).verified as VerifiedAdmissionGauntlet;
}

async function validateCandidateEvidence(repoRoot: string, candidate: AdmissionCandidateBinding): Promise<void> {
  const expectedDirectory = `workbench/.state/candidates/${candidate.cacheKey}`;
  if (candidate.candidateDirectory !== expectedDirectory
      || candidate.descriptorPath !== `${expectedDirectory}/candidate-artifact.json`
      || candidate.databasePath !== `${expectedDirectory}/content.db`) {
    fail('unsafe_path', 'Candidate paths do not match the content-addressed admission layout.');
  }
  const [descriptorBytes, databaseBytes] = await Promise.all([
    readCandidateFile(repoRoot, candidate.descriptorPath, expectedDirectory),
    readCandidateFile(repoRoot, candidate.databasePath, expectedDirectory),
  ]);
  if (sha256(descriptorBytes) !== candidate.descriptorSha256 || sha256(databaseBytes) !== candidate.databaseSha256) {
    fail('stale_candidate', 'Candidate descriptor or database bytes changed after comparison.');
  }
  let descriptor: unknown;
  try { descriptor = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(descriptorBytes)); }
  catch { fail('stale_candidate', 'Candidate descriptor is not valid UTF-8 JSON.'); }
  if (!isRecord(descriptor) || descriptor.cacheKey !== candidate.cacheKey
      || descriptor.proposalDigest !== candidate.proposalDigest
      || descriptor.sourceSnapshotDigest !== candidate.sourceSnapshotDigest
      || descriptor.databaseSha256 !== candidate.databaseSha256
      || descriptor.engineVersion !== candidate.engineVersion
      || descriptor.corpusFingerprint !== candidate.corpusFingerprint
      || descriptor.layerFingerprint !== candidate.layerFingerprint) {
    fail('identity_mismatch', 'Candidate descriptor fields do not match the admitted candidate binding.');
  }
}

function validateEvidence(input: AdmissionPreviewInput, proposalDigest: string): void {
  const candidate = input.candidate;
  requireDigest(candidate.cacheKey, 'candidate.cacheKey');
  requireDigest(candidate.proposalDigest, 'candidate.proposalDigest');
  requireDigest(candidate.sourceSnapshotDigest, 'candidate.sourceSnapshotDigest');
  requireDigest(candidate.descriptorSha256, 'candidate.descriptorSha256');
  requireDigest(candidate.databaseSha256, 'candidate.databaseSha256');
  requireText(candidate.engineVersion, 'candidate.engineVersion');
  requireDigest(candidate.corpusFingerprint, 'candidate.corpusFingerprint');
  requireDigest(candidate.layerFingerprint, 'candidate.layerFingerprint');
  if (candidate.proposalDigest !== proposalDigest) fail('identity_mismatch', 'Candidate proposal digest does not match the reviewed proposal.');
  assertComparisonReportIntegrity(input.comparison);
  if (input.comparison.digest !== input.comparisonBinding.comparisonDigest) fail('identity_mismatch', 'Comparison digest does not match its publication binding.');
  const binding = input.comparisonBinding;
  if (binding.cacheKey !== candidate.cacheKey || binding.proposalDigest !== candidate.proposalDigest
      || binding.databaseSha256 !== candidate.databaseSha256 || binding.descriptorSha256 !== candidate.descriptorSha256) {
    fail('identity_mismatch', 'Comparison publication is not bound to the admitted candidate.');
  }
  const expectedCandidateIdentity = {
    engineVersion: candidate.engineVersion,
    corpusFingerprint: candidate.corpusFingerprint,
    layerFingerprint: candidate.layerFingerprint,
  };
  if (canonical(binding.candidateIdentity) !== canonical(expectedCandidateIdentity)
      || canonical(input.comparison.candidateIdentity) !== canonical(expectedCandidateIdentity)
      || canonical(input.comparison.referenceIdentity) !== canonical(binding.referenceIdentity)) {
    fail('identity_mismatch', 'Comparison engine identities do not match the admitted candidate binding.');
  }
}

function comparisonBlockers(report: ComparisonReport, reviewed: readonly string[]): void {
  if (report.referenceExpectationFailureQueryIds.length > 0) fail('inherited_expectation_failure', 'Inherited expectation failures block admission.');
  if (report.candidateExpectationFailureQueryIds.length > 0 || report.summary.candidateAdmissionBlocked) {
    fail('candidate_expectation_failure', 'Candidate expectation failures block admission.');
  }
  if (report.queries.some((query) => query.verdict === 'regressed')) fail('harmful_comparison', 'A regressed comparison result blocks admission.');
  const changed = report.queries.filter((query) => query.top10Changed).map((query) => query.query).sort();
  const exactReviewed = [...new Set(reviewed.map((query) => requireText(query, 'reviewed comparison query')))].sort();
  const missing = changed.filter((query) => !exactReviewed.includes(query));
  const extra = exactReviewed.filter((query) => !changed.includes(query));
  if (missing.length > 0 || extra.length > 0) {
    fail('unreviewed_comparison', `Changed top-10 comparisons require exact review coverage (missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}).`);
  }
}

function measurableEffect(report: ComparisonReport): boolean {
  return report.queries.some((query) => query.top10Changed || expectationImproved(query));
}

function expectationImproved(query: ComparisonQueryReport): boolean {
  return query.expectedReferenceOutcomes.reference.some((reference, index) => !reference.passes && query.expectedReferenceOutcomes.candidate[index]?.passes === true);
}

async function operationDiffs(repoRoot: string, proposal: ProposalManifest): Promise<AdmissionFileDiff[]> {
  const operationsByPath = new Map<string, ProposalOperation[]>();
  for (const operation of proposal.operations) {
    for (const sourcePath of operation.sourcePaths) {
      const list = operationsByPath.get(sourcePath) ?? [];
      list.push(operation);
      operationsByPath.set(sourcePath, list);
    }
  }
  const diffs: AdmissionFileDiff[] = [];
  for (const sourcePath of [...operationsByPath.keys()].sort()) {
    const operations = operationsByPath.get(sourcePath)!;
    const original = await readConfinedSource(repoRoot, sourcePath);
    const expected = sourcePrecondition(proposal, sourcePath);
    if (sha256(original) !== expected) fail('source_drift', `Source ${sourcePath} changed after candidate creation.`);
    let current = original;
    let kind: AdmissionFileDiff['kind'] | null = null;
    for (const operation of operations) {
      if (isStructuredConceptOperation(operation)) {
        if (kind !== null && kind !== 'yaml') fail('operation_collision', `Mixed source owners target ${sourcePath}.`);
        kind = 'yaml';
        current = previewStructuredYamlEdit(sourcePath, current, sha256(current), operation).after.text;
      } else if (operation.type === 'golden-fixture-upsert') {
        if (kind !== null) fail('operation_collision', `Multiple incompatible operations target ${sourcePath}.`);
        kind = 'fixture';
        current = fixtureAfter(operation);
      } else {
        if (kind !== null && kind !== 'selection') fail('operation_collision', `Mixed source owners target ${sourcePath}.`);
        kind = 'selection';
        current = selectionAfter(current, operation);
      }
    }
    const withoutDigest = {
      path: sourcePath,
      kind: kind!,
      operationIds: operations.map((operation) => operation.operationId),
      before: bytes(original), after: bytes(current), changed: original !== current,
    };
    diffs.push({ ...withoutDigest, digest: diffDigest(withoutDigest) });
  }
  return diffs;
}

function validatePromotionPlan(plan: FixturePromotionPlan): void {
  requireDigest(plan.digest, `fixture promotion ${plan.fixtureId} digest`);
  requireDigest(plan.before.sha256, `fixture promotion ${plan.fixtureId} before`);
  requireDigest(plan.after.sha256, `fixture promotion ${plan.fixtureId} after`);
  if (plan.fixturePath !== `eval/golden/${plan.fixtureId}.json` || plan.fromStatus !== 'pending' || plan.toStatus !== 'active') {
    fail('invalid_fixture_promotion', `Fixture promotion ${plan.fixtureId} has an invalid owned path or status transition.`);
  }
  if (sha256(plan.before.text) !== plan.before.sha256 || sha256(plan.after.text) !== plan.after.sha256
      || Buffer.from(plan.before.base64, 'base64').toString('utf8') !== plan.before.text
      || Buffer.from(plan.after.base64, 'base64').toString('utf8') !== plan.after.text) {
    fail('invalid_fixture_promotion', `Fixture promotion ${plan.fixtureId} bytes do not match its hashes.`);
  }
  const { digest: storedDigest, ...content } = plan;
  if (storedDigest !== digest(content)) fail('invalid_fixture_promotion', `Fixture promotion ${plan.fixtureId} digest is invalid.`);
}

async function appendPromotionDiffs(repoRoot: string, diffs: AdmissionFileDiff[], plans: readonly FixturePromotionPlan[]): Promise<void> {
  const paths = new Set(diffs.map((entry) => entry.path));
  const fixtures = new Set<string>();
  for (const plan of [...plans].sort((left, right) => left.fixtureId.localeCompare(right.fixtureId))) {
    validatePromotionPlan(plan);
    if (fixtures.has(plan.fixtureId) || paths.has(plan.fixturePath)) fail('operation_collision', `Fixture promotion ${plan.fixtureId} collides with another source edit.`);
    fixtures.add(plan.fixtureId);
    paths.add(plan.fixturePath);
    const current = await readConfinedSource(repoRoot, plan.fixturePath);
    if (sha256(current) !== plan.before.sha256 || current !== plan.before.text) fail('source_drift', `Pending fixture ${plan.fixtureId} changed after review.`);
    const withoutDigest = {
      path: plan.fixturePath, kind: 'fixture-promotion' as const, operationIds: [] as readonly string[],
      before: bytes(current), after: bytes(plan.after.text), changed: current !== plan.after.text,
    };
    diffs.push({ ...withoutDigest, digest: diffDigest(withoutDigest) });
  }
}

async function appendProbeDiff(repoRoot: string, diffs: AdmissionFileDiff[], input: ProbeBaselineInput | undefined): Promise<ProbeMovement[]> {
  if (input === undefined) return [];
  if (diffs.some((entry) => entry.path === input.path)) fail('operation_collision', 'Probe baseline collides with another source edit.');
  requireDigest(input.beforeSha256, 'probeBaseline.beforeSha256');
  const beforeText = await readConfinedSource(repoRoot, input.path);
  if (sha256(beforeText) !== input.beforeSha256) fail('source_drift', 'Probe baseline changed after review.');
  const afterText = canonicalPrettyJson(input.after);
  const movements = probeMovements(beforeText, afterText);
  const withoutDigest = {
    path: input.path, kind: 'probe-baseline' as const, operationIds: [] as readonly string[],
    before: bytes(beforeText), after: bytes(afterText), changed: beforeText !== afterText,
  };
  diffs.push({ ...withoutDigest, digest: diffDigest(withoutDigest) });
  return movements;
}

async function appendProbeApprovalDiff(repoRoot: string, diffs: AdmissionFileDiff[], input: ProbeApprovalInput | undefined): Promise<void> {
  if (input === undefined) return;
  if (input.path !== 'eval/baselines/probes.approval.json') fail('unsafe_path', 'Probe approval must use the single owned approval path.');
  if (diffs.some((entry) => entry.path === input.path)) fail('operation_collision', 'Probe approval collides with another source edit.');
  requireDigest(input.beforeSha256, 'probeApproval.beforeSha256');
  const beforeText = await readConfinedSource(repoRoot, input.path);
  if (sha256(beforeText) !== input.beforeSha256) fail('source_drift', 'Probe approval changed after review.');
  const afterText = canonicalPrettyJson(input.after);
  const withoutDigest = {
    path: input.path, kind: 'probe-approval' as const, operationIds: [] as readonly string[],
    before: bytes(beforeText), after: bytes(afterText), changed: beforeText !== afterText,
  };
  diffs.push({ ...withoutDigest, digest: diffDigest(withoutDigest) });
}

/**
 * Schema-version-agnostic binding between a probe baseline document and its
 * independent approval: only fields present in BOTH approval schema versions
 * are consulted, so an approval-schema cutover cannot break admission or
 * publish in either direction. Full schema validation belongs to G8.
 */
export function probeApprovalBindingIssues(baselineAfterText: string, approvalAfterText: string): readonly string[] {
  let baseline: unknown;
  let approval: unknown;
  try { baseline = JSON.parse(baselineAfterText); } catch { return ['Probe baseline after-bytes are not valid JSON.']; }
  try { approval = JSON.parse(approvalAfterText); } catch { return ['Probe approval after-bytes are not valid JSON.']; }
  if (!isRecord(baseline)) return ['Probe baseline document must be an object.'];
  if (!isRecord(approval)) return ['Probe approval document must be an object.'];
  const issues: string[] = [];
  if (!SHA256.test(String(approval.baselineSha256)) || approval.baselineSha256 !== digest(baseline)) {
    issues.push('Approval baselineSha256 does not bind the admitted baseline document.');
  }
  if (!SHA256.test(String(approval.probesSha256))) {
    issues.push('Approval probesSha256 is not a canonical digest.');
  }
  const engine = approval.engine;
  if (!isRecord(engine) || engine.engineVersion !== baseline.engineVersion
      || engine.corpusFingerprint !== baseline.corpusFingerprint
      || engine.layerFingerprint !== baseline.layerFingerprint) {
    issues.push('Approval engine identity does not match the admitted baseline identity.');
  }
  return issues;
}

/** A moved baseline and its re-issued approval travel together or not at all. */
function assertProbeApprovalPairing(diffs: readonly AdmissionFileDiff[]): void {
  const baseline = diffs.find((entry) => entry.kind === 'probe-baseline');
  const approval = diffs.find((entry) => entry.kind === 'probe-approval');
  // Publish rejects an unchanged approval diff, so a preview carrying one
  // could be approved yet never published; refuse it at preview time instead.
  if (approval !== undefined && !approval.changed) {
    fail('probe_approval_orphaned', 'An unchanged probe approval diff is not publishable evidence.');
  }
  const baselineChanged = baseline !== undefined && baseline.changed;
  const approvalChanged = approval !== undefined && approval.changed;
  if (baselineChanged && !approvalChanged) {
    fail('probe_approval_missing', 'A moved probe baseline requires its re-issued independent approval in the same batch.');
  }
  if (approvalChanged && !baselineChanged) {
    fail('probe_approval_orphaned', 'An updated probe approval without a moved baseline has nothing it can attest to.');
  }
  if (!baselineChanged || !approvalChanged) return;
  const issues = probeApprovalBindingIssues(baseline!.after.text, approval!.after.text);
  if (issues.length > 0) fail('probe_approval_mismatch', issues.join(' '));
}

export async function previewAdmission(input: AdmissionPreviewInput): Promise<AdmissionPreview> {
  const repoRoot = await realDirectory(input.repoRoot, 'Repository root');
  const admittedBaseCommit = requireCommit(input.admittedBaseCommit, 'admittedBaseCommit');
  const expectedMainCommit = requireCommit(input.expectedMainCommit, 'expectedMainCommit');
  const proposal = parseProposalManifest(input.proposal);
  const proposalDigest = proposalManifestDigest(proposal);
  validateEvidence(input, proposalDigest);
  await validateCandidateEvidence(repoRoot, input.candidate);
  const gauntlet = await loadVerifiedGauntlet(input, proposalDigest);
  comparisonBlockers(input.comparison, input.reviewedComparisonQueries);
  const diffs = await operationDiffs(repoRoot, proposal);
  await appendPromotionDiffs(repoRoot, diffs, input.fixturePromotions ?? []);
  const movements = await appendProbeDiff(repoRoot, diffs, input.probeBaseline);
  await appendProbeApprovalDiff(repoRoot, diffs, input.probeApproval);
  assertProbeApprovalPairing(diffs);
  diffs.sort((left, right) => left.path.localeCompare(right.path));
  const fixtureDecisionSubjects = (input.fixturePromotions ?? []).map((plan) => ({ fixtureId: plan.fixtureId, digest: plan.digest })).sort((a, b) => a.fixtureId.localeCompare(b.fixtureId));
  const probeDiff = diffs.find((entry) => entry.kind === 'probe-baseline');
  const probeDecisionSubject = probeDiff === undefined || !probeDiff.changed ? null : digest({ movements, diff: probeDiff.digest });
  const sourceDecisionSubject = digest({ proposalDigest, diffs: diffs.filter((entry) => entry.kind !== 'fixture-promotion' && entry.kind !== 'probe-baseline' && entry.kind !== 'probe-approval').map((entry) => entry.digest) });
  const decisionSlots = [
    { kind: 'source-proposal' as const, slotId: 'source-proposal', subjectDigest: sourceDecisionSubject },
    ...fixtureDecisionSubjects.map((entry) => ({ kind: 'fixture-promotion' as const, slotId: entry.fixtureId, subjectDigest: entry.digest })),
    ...(probeDecisionSubject === null ? [] : [{ kind: 'probe-baseline' as const, slotId: 'probe-baseline', subjectDigest: probeDecisionSubject }]),
  ];
  const effect = measurableEffect(input.comparison);
  const comparisonUniverseDigest = digest(input.comparison.universe);
  const comparisonReviewDigest = digest({
    reviewedQueries: [...input.reviewedComparisonQueries].sort(),
    changedQueries: input.comparison.queries.filter((entry) => entry.top10Changed).map((entry) => entry.query).sort(),
    regressionSessionQueryIds: input.comparison.regressionSessionQueryIds,
  });
  const withoutDigest = {
    schemaVersion: 1 as const, proposal, proposalDigest, admittedBaseCommit, expectedMainCommit,
    candidate: input.candidate, comparisonDigest: input.comparison.digest, comparisonUniverseDigest, comparisonReviewDigest,
    gauntletDigest: gauntlet.digest, gauntlet,
    reviewedComparisonQueries: [...input.reviewedComparisonQueries].sort(), diffs,
    fixtureDecisionSubjects, probeMovements: movements, probeDecisionSubject, sourceDecisionSubject,
    decisionSlots, measurableEffect: effect,
  };
  return { ...withoutDigest, digest: digest(withoutDigest) };
}

function decisionBody(input: Omit<AdmissionDecision, 'decisionDigest' | 'signature'>): Omit<AdmissionDecision, 'decisionDigest' | 'signature'> {
  if (!DECISION_KINDS.includes(input.kind)) fail('invalid_decision', 'Decision kind is unsupported.');
  requireDigest(input.subjectDigest, 'decision.subjectDigest');
  requireDigest(input.previewDigest, 'decision.previewDigest');
  requireText(input.reviewer, 'decision.reviewer', 2);
  requireText(input.rationale, 'decision.rationale', 8);
  if (Number.isNaN(Date.parse(input.decidedAt))) fail('invalid_decision', 'decision.decidedAt must be an ISO timestamp.');
  return {
    schemaVersion: 1, kind: input.kind, subjectDigest: input.subjectDigest, previewDigest: input.previewDigest, reviewer: input.reviewer,
    rationale: input.rationale, decidedAt: new Date(input.decidedAt).toISOString(),
    ...(input.probeRationales === undefined ? {} : { probeRationales: [...input.probeRationales].sort((a, b) => a.probeId.localeCompare(b.probeId)) }),
  };
}

export function signAdmissionDecision(
  input: Omit<AdmissionDecision, 'schemaVersion' | 'decisionDigest' | 'signature'>,
  signingKey: string,
): AdmissionDecision {
  if (typeof signingKey !== 'string' || signingKey.length < 32) fail('invalid_decision', 'Decision signing key must contain at least 32 characters.');
  const body = decisionBody({ schemaVersion: 1, ...input });
  const decisionDigest = digest(body);
  const signature = createHmac('sha256', signingKey).update(decisionDigest).digest('hex');
  return { ...body, decisionDigest, signature };
}

function verifyDecision(decision: AdmissionDecision, signingKey: string): void {
  const body = decisionBody(decision);
  const expectedDigest = digest(body);
  const expectedSignature = createHmac('sha256', signingKey).update(expectedDigest).digest();
  const actualSignature = SHA256.test(decision.signature) ? Buffer.from(decision.signature, 'hex') : Buffer.alloc(0);
  if (decision.decisionDigest !== expectedDigest || actualSignature.length !== expectedSignature.length
      || !timingSafeEqual(actualSignature, expectedSignature)) {
    fail('invalid_decision', `Decision for ${decision.kind} has an invalid digest or signature.`);
  }
}

function validateDecisions(preview: AdmissionPreview, decisions: readonly AdmissionDecision[], signingKey: string): AdmissionDecision[] {
  const checked = [...decisions];
  checked.forEach((decision) => verifyDecision(decision, signingKey));
  if (checked.some((decision) => decision.previewDigest !== preview.digest)) {
    fail('decision_replay', 'Every decision must be signed for this exact canonical admission preview.');
  }
  const source = checked.filter((decision) => decision.kind === 'source-proposal');
  if (source.length !== 1 || source[0]!.subjectDigest !== preview.sourceDecisionSubject) fail('missing_decision', 'Exactly one digest-bound source proposal decision is required.');
  for (const fixture of preview.fixtureDecisionSubjects) {
    const matching = checked.filter((decision) => decision.kind === 'fixture-promotion' && decision.subjectDigest === fixture.digest);
    if (matching.length !== 1) fail('missing_decision', `Fixture ${fixture.fixtureId} requires its own explicit decision.`);
  }
  if (checked.filter((decision) => decision.kind === 'fixture-promotion').length !== preview.fixtureDecisionSubjects.length) {
    fail('invalid_decision', 'Fixture decisions contain an unreviewed or duplicate subject.');
  }
  const probe = checked.filter((decision) => decision.kind === 'probe-baseline');
  if (preview.probeDecisionSubject === null) {
    if (probe.length > 0) fail('invalid_decision', 'A probe decision is not allowed when no baseline moved.');
  } else {
    if (probe.length !== 1 || probe[0]!.subjectDigest !== preview.probeDecisionSubject) fail('missing_decision', 'Probe baseline movement requires a separate explicit decision.');
    const rationales = probe[0]!.probeRationales ?? [];
    const projected = rationales.map(({ probeId, beforeSha256, afterSha256 }) => ({ probeId, beforeSha256, afterSha256 })).sort((a, b) => a.probeId.localeCompare(b.probeId));
    if (canonical(projected) !== canonical(preview.probeMovements)) fail('missing_decision', 'Probe decision must enumerate every changed probe exactly once.');
    rationales.forEach((entry, index) => requireText(entry.rationale, `probeRationales[${index}].rationale`, 8));
  }
  return checked.sort((a, b) => a.kind.localeCompare(b.kind) || a.subjectDigest.localeCompare(b.subjectDigest));
}

function tail(value: string): string {
  const bytes = Buffer.from(value);
  return bytes.length <= MAX_OUTPUT_BYTES ? value : bytes.subarray(bytes.length - MAX_OUTPUT_BYTES).toString('utf8');
}

async function fixedCommandCapture(
  command: string,
  args: readonly string[],
  cwd: string,
  trustedEnvironment: Readonly<Record<string, string>> = {},
): Promise<{ readonly outcome: CommandOutcome; readonly stdout: string }> {
  const environment = { ...buildJobEnvironment(), ...trustedEnvironment };
  try {
    const result = await execFileAsync(command, [...args], { cwd, env: { ...environment }, windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
    return { stdout: result.stdout, outcome: {
      command, args: [...args], cwd, exitCode: 0, stdoutSha256: sha256(result.stdout), stderrSha256: sha256(result.stderr),
      stdoutTail: tail(result.stdout), stderrTail: tail(result.stderr),
    } };
  } catch (error) {
    const failure = error as Error & { stdout?: string; stderr?: string; code?: number | string };
    fail('command_failed', `${path.basename(command)} ${args[0] ?? ''} failed (${String(failure.code ?? 'unknown')}): ${tail(failure.stderr ?? failure.stdout ?? failure.message)}`);
  }
}

async function fixedCommand(
  command: string,
  args: readonly string[],
  cwd: string,
  trustedEnvironment: Readonly<Record<string, string>> = {},
): Promise<CommandOutcome> {
  return (await fixedCommandCapture(command, args, cwd, trustedEnvironment)).outcome;
}

export const DEFAULT_ADMISSION_GIT_ADAPTER: GitAdapter = {
  async resolveCommit(repoRoot, revision) {
    requireCommit(revision, 'git revision');
    const result = await fixedCommandCapture('git', ['rev-parse', '--verify', `${revision}^{commit}`], repoRoot);
    const commit = result.stdout.trim();
    return requireCommit(commit, 'resolved git commit');
  },
  async readMain(repoRoot) {
    const result = await fixedCommandCapture('git', ['rev-parse', '--verify', 'refs/heads/main^{commit}'], repoRoot);
    return requireCommit(result.stdout.trim(), 'main commit');
  },
  addWorktree(repoRoot, worktree, commit) {
    return fixedCommand('git', ['worktree', 'add', '--detach', worktree, commit], repoRoot);
  },
  async inspectWorktree(repoRoot, worktree) {
    const calls = await Promise.all([
      fixedCommandCapture('git', ['rev-parse', '--verify', 'HEAD^{commit}'], worktree),
      fixedCommandCapture('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], worktree),
      fixedCommandCapture('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], repoRoot),
      fixedCommandCapture('git', ['rev-parse', '--show-toplevel'], worktree),
      fixedCommandCapture('git', ['rev-parse', '--show-superproject-working-tree'], worktree),
      fixedCommandCapture('git', ['submodule', 'status', '--recursive'], worktree),
      fixedCommandCapture('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignored=no'], worktree),
    ]);
    return {
      head: calls[0]!.stdout.trim(), commonDirectory: calls[1]!.stdout.trim(), primaryCommonDirectory: calls[2]!.stdout.trim(),
      topLevel: calls[3]!.stdout.trim(), superproject: calls[4]!.stdout.trim(), submodules: calls[5]!.stdout.trim(),
      statusPorcelainZ: calls[6]!.stdout, commands: calls.map((entry) => entry.outcome),
    };
  },
  async treeHash(worktree) {
    const indexPath = path.join(tmpdir(), `scripture-admission-index-${randomUUID()}`);
    const environment = { GIT_INDEX_FILE: indexPath };
    try {
      const read = await fixedCommand('git', ['read-tree', 'HEAD'], worktree, environment);
      const add = await fixedCommand('git', ['add', '--all'], worktree, environment);
      const write = await fixedCommandCapture('git', ['write-tree'], worktree, environment);
      return { hash: requireCommit(write.stdout.trim(), 'worktree tree hash'), commands: [read, add, write.outcome] };
    } finally {
      await rm(indexPath, { force: true }).catch(() => undefined);
      await rm(`${indexPath}.lock`, { force: true }).catch(() => undefined);
    }
  },
  removeWorktree(repoRoot, worktree) {
    return fixedCommand('git', ['worktree', 'remove', '--force', worktree], repoRoot);
  },
};

const defaultGit = DEFAULT_ADMISSION_GIT_ADAPTER;

async function defaultRebuild(worktree: string): Promise<RebuildEvidence> {
  const npmCli = resolveNpmCliPath();
  const databasePath = path.join(worktree, 'workbench', '.artifact', 'content.db');
  await mkdir(path.dirname(databasePath), { recursive: true });
  const command = await fixedCommand(
    process.execPath,
    [npmCli, 'run', 'build:artifact', '--workspace', 'pipeline', '--', '--out', databasePath],
    worktree,
  );
  const descriptorRelative = 'artifacts/content-artifact.json';
  const databaseRelative = 'workbench/.artifact/content.db';
  const [descriptorBytes, databaseBytes] = await Promise.all([
    readConfinedRegularFile(worktree, descriptorRelative, false),
    readConfinedRegularFile(worktree, databaseRelative, false),
  ]);
  let descriptor: AdmissionRebuiltDescriptor;
  try { descriptor = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(descriptorBytes!)) as AdmissionRebuiltDescriptor; }
  catch { fail('rebuild_failed', 'Rebuild did not produce a valid artifact descriptor.'); }
  const descriptorSha256 = sha256(descriptorBytes!);
  const databaseSha256 = sha256(databaseBytes!);
  return {
    status: 'REBUILT', descriptor, descriptorSha256, databaseSha256, command,
    outputFiles: [
      { path: descriptorRelative, sha256: descriptorSha256 },
      { path: databaseRelative, sha256: databaseSha256 },
    ],
  };
}

async function defaultVerify(worktree: string): Promise<VerifyEvidence> {
  const npmCli = resolveNpmCliPath();
  const command = await fixedCommand(process.execPath, [npmCli, 'run', 'verify'], worktree);
  const reportPath = 'eval/.runs/admission-release-report.json' as const;
  const gauntletCommand = await fixedCommand(
    process.execPath,
    [npmCli, 'run', 'gauntlet', '--workspace', 'eval', '--', '--require-admit', '--json', reportPath,
      '--release-database', 'workbench/.artifact/content.db'],
    worktree,
  );
  const reportBytes = await readConfinedRegularFile(worktree, reportPath, false);
  let parsed: unknown;
  try { parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(reportBytes!)); }
  catch { fail('verify_failed', 'Release gauntlet report is not valid UTF-8 JSON.'); }
  const freshness = verifyMachineReportFreshness(worktree, path.join(worktree, ...reportPath.split('/')), parsed);
  if (!freshness.fresh) {
    fail('verify_failed', `Release gauntlet report is not fresh: ${freshness.mismatches.map((entry) => entry.code).join(', ')}.`);
  }
  await rm(path.join(worktree, ...reportPath.split('/')), { force: true });
  return { status: 'PASSED', command, releaseGauntlet: { reportPath, reportBytes: reportBytes!, command: gauntletCommand } };
}

function sourceMutations(preview: AdmissionPreview): MutationInput[] {
  return preview.diffs.filter((entry) => entry.changed).map((entry) => ({
    path: entry.path, beforeSha256: entry.before.sha256, after: Buffer.from(entry.after.base64, 'base64'),
  }));
}

async function assertWorktree(worktreeParent: string, worktree: string): Promise<void> {
  const parent = await realDirectory(worktreeParent, 'Admission worktree parent');
  const root = await realDirectory(worktree, 'Admission worktree');
  if (!within(parent, root)) fail('unsafe_path', 'Admission worktree escapes its confined parent.');
}

async function assertWorktreeIdentity(
  repoRoot: string,
  worktree: string,
  admittedBaseCommit: string,
  git: GitAdapter,
): Promise<{ readonly statusPorcelainZ: string; readonly commands: readonly CommandOutcome[] }> {
  const inspection = await git.inspectWorktree(repoRoot, worktree);
  if (inspection.head !== admittedBaseCommit) fail('worktree_head_mismatch', 'Admission worktree HEAD is not the exact admitted base commit.');
  if (!samePath(inspection.commonDirectory, inspection.primaryCommonDirectory)
      || !samePath(inspection.topLevel, worktree) || inspection.superproject !== '' || inspection.submodules !== '') {
    fail('worktree_repository_mismatch', 'Admission worktree is detached from the primary repository or contains an alternate repository/submodule.');
  }
  return { statusPorcelainZ: inspection.statusPorcelainZ, commands: inspection.commands };
}

function parsePorcelainStatus(value: string): readonly { readonly status: string; readonly path: string }[] {
  const records = value.split('\0').filter((entry) => entry !== '');
  const parsed: { status: string; path: string }[] = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index]!;
    if (record.length < 4 || record[2] !== ' ') fail('worktree_mutation', 'Git returned malformed worktree status.');
    const status = record.slice(0, 2);
    const relativePath = record.slice(3).replaceAll('\\', '/');
    if (status.includes('R') || status.includes('C')) {
      index += 1;
      fail('worktree_mutation', 'Renamed or copied paths are not allowed during admission.');
    }
    parsed.push({ status, path: relativePath });
  }
  return parsed.sort((left, right) => left.path.localeCompare(right.path));
}

async function auditAppliedWorktree(
  repoRoot: string,
  worktree: string,
  preview: AdmissionPreview,
  rebuilt: RebuildEvidence | null,
  git: GitAdapter,
): Promise<readonly CommandOutcome[]> {
  const inspection = await assertWorktreeIdentity(repoRoot, worktree, preview.admittedBaseCommit, git);
  const changedDiffs = preview.diffs.filter((entry) => entry.changed);
  for (const entry of preview.diffs) {
    const actual = await readConfinedRegularFile(worktree, entry.path, false);
    if (actual === null || sha256(actual) !== entry.after.sha256 || actual.toString('base64') !== entry.after.base64) {
      fail('post_verify_source_mismatch', `Admission source ${entry.path} does not match the exact reviewed after bytes.`);
    }
  }
  const outputFiles = [...(rebuilt?.outputFiles ?? [])];
  const allowedOutputPaths = new Set(['artifacts/content-artifact.json', 'workbench/.artifact/content.db']);
  for (const output of outputFiles) {
    if (!allowedOutputPaths.has(output.path)) fail('worktree_mutation', `Rebuild output ${output.path} is not allowlisted.`);
    requireDigest(output.sha256, `rebuild output ${output.path}`);
    const actual = await readConfinedRegularFile(worktree, output.path, false);
    if (actual === null || sha256(actual) !== output.sha256) fail('worktree_mutation', `Rebuild output ${output.path} changed after it was measured.`);
  }
  const approved = new Map<string, 'existing' | 'new' | 'output'>();
  for (const entry of changedDiffs) approved.set(entry.path, entry.before.text === '' ? 'new' : 'existing');
  for (const output of outputFiles) approved.set(output.path, 'output');
  const status = parsePorcelainStatus(inspection.statusPorcelainZ);
  for (const entry of status) {
    const kind = approved.get(entry.path);
    if (kind === undefined || entry.status.includes('D') || entry.status.includes('R') || entry.status.includes('C')
        || (kind === 'existing' && entry.status !== ' M')
        || (kind === 'new' && entry.status !== '??')
        || (kind === 'output' && entry.status !== ' M' && entry.status !== '??')) {
      fail('worktree_mutation', `Unapproved worktree mutation ${entry.status} ${entry.path}.`);
    }
  }
  for (const entry of changedDiffs) {
    if (!status.some((statusEntry) => statusEntry.path === entry.path)) fail('worktree_mutation', `Expected admission mutation ${entry.path} is absent from worktree status.`);
  }
  return inspection.commands;
}

async function quarantineFailedWorktree(repoRoot: string, parent: string, worktree: string, git: GitAdapter): Promise<void> {
  try {
    await git.removeWorktree(repoRoot, worktree);
    return;
  } catch {
    const stats = await lstat(worktree).catch(() => null);
    if (stats === null) return;
    const quarantine = path.join(parent, 'quarantine');
    await mkdir(quarantine, { recursive: true });
    const target = path.join(quarantine, `${path.basename(worktree)}-${randomUUID()}`);
    if (!within(parent, target)) fail('cleanup_failed', 'Quarantine target escaped the admission root.');
    await rename(worktree, target).catch(() => fail('cleanup_failed', 'Failed worktree could not be removed or quarantined.'));
  }
}

function validateRebuild(preview: AdmissionPreview, rebuilt: RebuildEvidence): void {
  if (rebuilt.status !== 'REBUILT') fail('cache_substitution', 'Candidate cache results cannot substitute for the admission rebuild.');
  requireDigest(rebuilt.descriptorSha256, 'rebuilt descriptor digest');
  requireDigest(rebuilt.databaseSha256, 'rebuilt database digest');
  const outputs = rebuilt.outputFiles ?? [];
  if (new Set(outputs.map((entry) => entry.path)).size !== outputs.length) fail('rebuild_identity_mismatch', 'Rebuild output paths must be unique.');
  outputs.forEach((entry) => requireDigest(entry.sha256, `rebuild output ${entry.path}`));
  const descriptorOutput = outputs.find((entry) => entry.path === 'artifacts/content-artifact.json');
  const databaseOutput = outputs.find((entry) => entry.path === 'workbench/.artifact/content.db');
  if ((descriptorOutput !== undefined && descriptorOutput.sha256 !== rebuilt.descriptorSha256)
      || (databaseOutput !== undefined && databaseOutput.sha256 !== rebuilt.databaseSha256)) {
    fail('rebuild_identity_mismatch', 'Rebuild output hashes do not match its descriptor/database evidence.');
  }
  const descriptor = rebuilt.descriptor;
  if (descriptor.engineVersion !== preview.candidate.engineVersion
      || descriptor.corpusFingerprint !== preview.candidate.corpusFingerprint
      || descriptor.layerFingerprint !== preview.candidate.layerFingerprint
      || descriptor.databaseSha256 !== rebuilt.databaseSha256) {
    fail('rebuild_identity_mismatch', 'The isolated rebuild does not reproduce the admitted candidate identities.');
  }
}

function admissionKey(preview: AdmissionPreview, decisions: readonly AdmissionDecision[]): string {
  return digest({ previewDigest: preview.digest, decisions: decisions.map((entry) => entry.decisionDigest) });
}

function manifestWithoutDigest(input: Omit<AdmissionManifest, 'digest'>): Omit<AdmissionManifest, 'digest'> {
  return input;
}

function parseManifest(text: string, expectedKey: string): AdmissionManifest {
  let value: unknown;
  try { value = JSON.parse(text); } catch { fail('manifest_conflict', 'Existing admission manifest is invalid JSON.'); }
  if (!isRecord(value) || value.schemaVersion !== 1 || value.kind !== 'scripture-search-admission'
      || value.admissionKey !== expectedKey || typeof value.digest !== 'string') {
    fail('manifest_conflict', 'Existing admission manifest does not match this admission.');
  }
  const { digest: stored, ...body } = value;
  if (stored !== digest(body)) fail('manifest_conflict', 'Existing admission manifest digest is invalid.');
  return value as unknown as AdmissionManifest;
}

function manifestFromLockedBytes(value: Buffer | null, key: string): AdmissionManifest | null {
  if (value === null) return null;
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(value); }
  catch { fail('manifest_conflict', 'Existing admission manifest is not valid UTF-8.'); }
  return parseManifest(text, key);
}

async function recoverAndReadManifest(repoRoot: string, manifestPath: string, key: string): Promise<AdmissionManifest | null> {
  let existing: AdmissionManifest | null = null;
  const emptyPlan = await createMutationPlan(repoRoot, []);
  await applyMutationPlanWithLockedValidation(repoRoot, emptyPlan, {
    waitTimeoutMs: ADMISSION_LOCK_WAIT_MS,
    async beforeApply(scope) {
      existing = manifestFromLockedBytes(await scope.readFile(manifestPath), key);
      return 'skip' as const;
    },
  });
  return existing;
}

async function assertAdmissionState(input: AdmissionPreviewInput, preview: AdmissionPreview, git: GitAdapter): Promise<void> {
  if (await git.resolveCommit(input.repoRoot, preview.admittedBaseCommit) !== preview.admittedBaseCommit) fail('stale_base', 'Admitted base commit no longer resolves exactly.');
  if (await git.readMain(input.repoRoot) !== preview.expectedMainCommit) fail('stale_main', 'main moved after admission review.');
  const refreshed = await previewAdmission(input);
  if (refreshed.digest !== preview.digest) fail('stale_preview', 'Admission preview changed after review.');
}

async function assertCleanAdmissionWorktree(
  repoRoot: string,
  worktree: string,
  preview: AdmissionPreview,
  git: GitAdapter,
): Promise<readonly CommandOutcome[]> {
  const inspection = await assertWorktreeIdentity(repoRoot, worktree, preview.admittedBaseCommit, git);
  if (parsePorcelainStatus(inspection.statusPorcelainZ).length > 0) fail('worktree_mutation', 'New admission worktree is not clean at the admitted base commit.');
  return inspection.commands;
}

export async function runAdmission(input: RunAdmissionInput): Promise<AdmissionResult> {
  const dependencies = input.dependencies ?? {};
  const git = dependencies.git ?? defaultGit;
  const signingKey = dependencies.decisionSigningKey ?? process.env['WORKBENCH_ADMISSION_SIGNING_KEY'];
  if (signingKey === undefined || signingKey.length < 32) fail('missing_signing_key', 'A trusted admission decision signing key is required.');
  const previewInput: AdmissionPreviewInput = {
    repoRoot: input.repoRoot, admittedBaseCommit: input.admittedBaseCommit, expectedMainCommit: input.expectedMainCommit,
    proposal: input.proposal, candidate: input.candidate, comparison: input.comparison,
    comparisonBinding: input.comparisonBinding, gauntlet: input.gauntlet,
    trustedGauntletLoader: input.trustedGauntletLoader,
    now: dependencies.now ?? input.now,
    reviewedComparisonQueries: input.reviewedComparisonQueries, fixturePromotions: input.fixturePromotions,
    probeBaseline: input.probeBaseline, probeApproval: input.probeApproval,
  };
  const preview = await previewAdmission(previewInput);
  if (preview.digest !== requireDigest(input.expectedPreviewDigest, 'expectedPreviewDigest')) fail('stale_preview', 'Admission preview digest changed.');
  await assertAdmissionState(previewInput, preview, git);
  if (!preview.measurableEffect) return { status: 'NO_MEASURABLE_EFFECT', preview, manifestPath: null, manifest: null };
  const decisions = validateDecisions(preview, input.decisions, signingKey);
  const linkedCaseIds = [...new Set(input.linkedCaseIds.map((entry) => requireText(entry, 'linkedCaseId')))].sort();
  if (linkedCaseIds.length === 0 || canonical(linkedCaseIds) !== canonical(preview.proposal.caseIds)) fail('invalid_input', 'Linked cases must exactly match the reviewed proposal cases.');
  const provenance = [...new Set(input.provenance.map((entry) => requireText(entry, 'provenance', 4)))].sort();
  if (provenance.length === 0) fail('invalid_input', 'Admission provenance is required.');
  const key = admissionKey(preview, decisions);
  const manifestPath = `${ADMISSION_DIRECTORY}/${key}.json`;
  const already = await recoverAndReadManifest(input.repoRoot, manifestPath, key);
  if (already !== null) return { status: 'ALREADY_ADMITTED', preview, manifestPath, manifest: already };
  await assertAdmissionState(previewInput, preview, git);

  const id = (dependencies.idFactory ?? randomUUID)();
  if (!/^[0-9a-f-]{36}$/.test(id)) fail('invalid_input', 'Admission id must be a lowercase UUID.');
  const parent = path.join(await realDirectory(input.repoRoot, 'Repository root'), ...WORKTREE_DIRECTORY.split('/'));
  await mkdir(parent, { recursive: true });
  await realDirectory(parent, 'Admission worktree parent');
  const worktree = path.join(parent, id);
  if (!within(parent, worktree)) fail('unsafe_path', 'Admission worktree path escaped confinement.');
  const commands: CommandOutcome[] = [];
  let created = false;
  let admitted = false;
  try {
    try {
      commands.push(await git.addWorktree(input.repoRoot, worktree, preview.admittedBaseCommit));
      created = true;
    } catch (error) {
      created = await lstat(worktree).then(() => true, () => false);
      throw error;
    }
    await assertWorktree(parent, worktree);
    await dependencies.onPhase?.('worktree-created', { worktree });
    commands.push(...await assertCleanAdmissionWorktree(input.repoRoot, worktree, preview, git));
    commands.push(...await assertCleanAdmissionWorktree(input.repoRoot, worktree, preview, git));
    const mutationPlan = await createMutationPlan(worktree, sourceMutations(preview));
    await applyMutationPlan(worktree, mutationPlan, dependencies.apply);
    await dependencies.onPhase?.('sources-applied', { worktree });
    commands.push(...await auditAppliedWorktree(input.repoRoot, worktree, preview, null, git));
    commands.push(...await auditAppliedWorktree(input.repoRoot, worktree, preview, null, git));

    const rebuilt = await (dependencies.rebuild ?? defaultRebuild)(worktree, preview);
    validateRebuild(preview, rebuilt);
    commands.push(rebuilt.command);
    await dependencies.onPhase?.('rebuilt', { worktree });
    commands.push(...await auditAppliedWorktree(input.repoRoot, worktree, preview, rebuilt, git));
    commands.push(...await auditAppliedWorktree(input.repoRoot, worktree, preview, rebuilt, git));
    const verified = await (dependencies.verify ?? defaultVerify)(worktree, preview, rebuilt);
    if (verified.status !== 'PASSED') fail('verify_failed', 'The fixed full verification did not pass.');
    commands.push(verified.command);
    commands.push(verified.releaseGauntlet.command);
    const releaseGauntlet = parseGauntletBytes(
      verified.releaseGauntlet.reportBytes,
      verified.releaseGauntlet.reportPath,
      {
        baseCommit: preview.admittedBaseCommit,
        descriptorSha256: rebuilt.descriptorSha256,
        databaseSha256: rebuilt.databaseSha256,
        engineIdentity: {
          engineVersion: preview.candidate.engineVersion,
          corpusFingerprint: preview.candidate.corpusFingerprint,
          layerFingerprint: preview.candidate.layerFingerprint,
        },
      },
      'release',
      dependencies.now?.() ?? new Date(),
    ).verified as VerifiedReleaseGauntlet;
    await dependencies.onPhase?.('verified', { worktree });
    commands.push(...await auditAppliedWorktree(input.repoRoot, worktree, preview, rebuilt, git));
    const tree = await git.treeHash(worktree);
    commands.push(...tree.commands);
    commands.push(...await auditAppliedWorktree(input.repoRoot, worktree, preview, rebuilt, git));
    await assertAdmissionState(previewInput, preview, git);
    await dependencies.onPhase?.('before-manifest', { worktree, manifestPath });
    commands.push(...await auditAppliedWorktree(input.repoRoot, worktree, preview, rebuilt, git));

    const admittedAt = (dependencies.now?.() ?? new Date()).toISOString();
    const body = manifestWithoutDigest({
      schemaVersion: 1, kind: 'scripture-search-admission', admissionKey: key, admittedAt,
      previewDigest: preview.digest, proposalDigest: preview.proposalDigest, linkedCaseIds, provenance,
      baseCommit: preview.admittedBaseCommit, expectedMainCommit: preview.expectedMainCommit,
      worktreeTreeHash: tree.hash, decisions, candidate: preview.candidate, rebuiltCandidate: rebuilt,
      comparison: { digest: input.comparison.digest, binding: input.comparisonBinding }, gauntlet: preview.gauntlet,
      releaseGauntlet,
      sourceChanges: preview.diffs, probeMovements: preview.probeMovements, commands,
      rollback: preview.diffs.filter((entry) => entry.changed).map((entry) => ({
        path: entry.path, restoreSha256: entry.before.sha256, restoreBase64: entry.before.base64, admittedSha256: entry.after.sha256,
      })),
    });
    const manifest: AdmissionManifest = { ...body, digest: digest(body) };
    const manifestText = `${JSON.stringify(JSON.parse(canonical(manifest)) as unknown, null, 2)}\n`;
    const plan = await createMutationPlan(input.repoRoot, [{ path: manifestPath, beforeSha256: null, after: manifestText }]);
    let published = false;
    let existingDuringPublication: AdmissionManifest | null = null;
    const publication = await applyMutationPlanWithLockedValidation(input.repoRoot, plan, {
      waitTimeoutMs: ADMISSION_LOCK_WAIT_MS,
      async beforeApply(scope) {
        await assertAdmissionState(previewInput, preview, git);
        const current = manifestFromLockedBytes(await scope.readFile(manifestPath), key);
        if (current !== null) {
          existingDuringPublication = current;
          return 'skip';
        }
        return 'apply';
      },
      afterCommit() { published = true; },
    }, dependencies.apply);
    const finalManifest = publication.status === 'SKIPPED'
      ? existingDuringPublication!
      : manifest;
    admitted = true;
    await dependencies.onPhase?.('manifest-published', { worktree, manifestPath });
    await auditAppliedWorktree(input.repoRoot, worktree, preview, rebuilt, git);
    return { status: publication.status === 'SKIPPED' && !published ? 'ALREADY_ADMITTED' : 'ADMITTED', preview, manifestPath, manifest: finalManifest };
  } finally {
    if (created) await quarantineFailedWorktree(input.repoRoot, parent, worktree, git);
    if (!admitted) await rm(path.join(parent, `.unused-${id}`), { recursive: true, force: true }).catch(() => undefined);
  }
}
