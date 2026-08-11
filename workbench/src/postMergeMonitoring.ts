import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, realpath, stat } from 'node:fs/promises';
import { promisify } from 'node:util';

import { foldCaseEvents, parseCaseEvent, type CaseSnapshot, type CaseStateChanged } from './cases.js';
import { validateArtifactDescriptor, type ArtifactDescriptor } from './descriptor.js';
import {
  assertQualityDashboardIntegrity,
  type QualityDashboardReport,
} from './qualityDashboard.js';
import { foldReviewSessionEvents, type ReviewSession } from './reviewSessions.js';

const execFileAsync = promisify(execFile);
const SHA256 = /^[0-9a-f]{64}$/;
const COMMIT = /^[0-9a-f]{40,64}$/;
const GIT_OBJECT = /^[0-9a-f]{40,64}$/;
const SAFE_REMOTE = /^[A-Za-z0-9._-]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SAFE_ENGINE_VERSION = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const AUDIT_PERIOD = /^\d{4}-Q[1-4]$/;
const PRIVATE_CANARY = /(?:hidden|canary|raw[ _-]*query|suppressed[ _-]*query)/i;

export const POST_MERGE_MONITORING_SCHEMA_VERSION = 1;
export const DEFAULT_STABILIZATION_SPARSE_THRESHOLD = 20;

export class PostMergeMonitoringError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'PostMergeMonitoringError';
  }
}

function fail(code: string, message: string): never {
  throw new PostMergeMonitoringError(code, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonical(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('NON_CANONICAL_NUMBER', 'Canonical records cannot contain non-finite numbers.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  fail('NON_CANONICAL_VALUE', 'Canonical records cannot contain undefined, functions, symbols, or bigint values.');
}

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function digest(value: unknown): string {
  return sha256(canonical(value));
}

function deterministicUuid(value: unknown): string {
  const hex = sha256(canonical(value)).slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20)}`;
}

function exactIso(value: string, label: string): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) || new Date(value).toISOString() !== value) {
    fail('INVALID_TIMESTAMP', `${label} must be a canonical UTC ISO timestamp.`);
  }
  return value;
}

function exactText(value: string, label: string): string {
  if (typeof value !== 'string' || value.length === 0 || value !== value.trim()) {
    fail('INVALID_TEXT', `${label} must be canonical non-empty text.`);
  }
  return value;
}

function exactSha(value: string, label: string): string {
  if (!SHA256.test(value)) fail('INVALID_DIGEST', `${label} must be a lowercase SHA-256 digest.`);
  return value;
}

function exactCommit(value: string, label: string): string {
  if (!COMMIT.test(value)) fail('INVALID_COMMIT', `${label} must be a full lowercase commit id.`);
  return value;
}

function exactGitObject(value: string, label: string): string {
  if (!GIT_OBJECT.test(value)) fail('INVALID_GIT_OBJECT', `${label} must be a full lowercase Git object id.`);
  return value;
}

function exactUuid(value: string, label: string): string {
  if (!UUID.test(value)) fail('INVALID_OPAQUE_ID', `${label} must be a canonical UUID.`);
  return value;
}

function exactEngineVersion(value: string): string {
  if (!SAFE_ENGINE_VERSION.test(value)) fail('INVALID_TELEMETRY_IDENTITY', 'Telemetry engine identity is not canonical.');
  return value;
}

function exactAuditPeriod(value: string): string {
  if (!AUDIT_PERIOD.test(value)) fail('INVALID_AUDIT_PERIOD', 'Telemetry period must use the canonical YYYY-Qn form.');
  return value;
}

function requireExactKeys(value: Record<string, unknown>, expected: readonly string[], code = 'INVALID_PRIVATE_AGGREGATE'): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (canonical(actual) !== canonical(wanted)) fail(code, 'Privacy-safe aggregate evidence has an invalid shape.');
}

function rejectPrivateCanary(value: unknown): void {
  if (typeof value === 'string') {
    if (PRIVATE_CANARY.test(value)) fail('PRIVATE_TELEMETRY_VALUE', 'Private telemetry content is not accepted.');
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) rejectPrivateCanary(entry);
    return;
  }
  if (isRecord(value)) {
    for (const [key, entry] of Object.entries(value)) {
      if (PRIVATE_CANARY.test(key)) fail('PRIVATE_TELEMETRY_FIELD', 'Private telemetry fields are not accepted.');
      rejectPrivateCanary(entry);
    }
  }
}

function equalIdentity(
  left: Pick<ArtifactDescriptor, 'engineVersion' | 'corpusFingerprint' | 'layerFingerprint'>,
  right: Pick<ArtifactDescriptor, 'engineVersion' | 'corpusFingerprint' | 'layerFingerprint'>,
): boolean {
  return left.engineVersion === right.engineVersion
    && left.corpusFingerprint === right.corpusFingerprint
    && left.layerFingerprint === right.layerFingerprint;
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  const normalize = (values: readonly string[]) => [...new Set(values)].sort();
  return canonical(normalize(left)) === canonical(normalize(right));
}

export interface ReadOnlyRepositoryInspection {
  readonly repoRoot: string;
  readonly remote: string;
  readonly remoteUrl: string;
  readonly mainRef: string;
  readonly mainCommit: string;
  readonly mainTree: string;
  readonly preparedCommit: string;
  readonly preparedTree: string;
  readonly preparedReachableFromMain: boolean;
}

export interface ReadOnlyGitInspector {
  inspect(input: {
    readonly repoRoot: string;
    readonly remote: string;
    readonly mainRef: string;
    readonly preparedCommit: string;
  }): Promise<ReadOnlyRepositoryInspection>;
}

async function gitRead(repoRoot: string, args: readonly string[]): Promise<string> {
  try {
    const result = await execFileAsync('git', ['-C', repoRoot, ...args], {
      encoding: 'utf8',
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });
    return result.stdout.trim();
  } catch (error) {
    const code = isRecord(error) && typeof error['code'] === 'number' ? error['code'] : null;
    if (args[0] === 'merge-base' && code === 1) return 'NOT_ANCESTOR';
    fail('GIT_READ_FAILED', `Read-only git inspection failed for ${args.join(' ')}.`);
  }
}

export const DEFAULT_READ_ONLY_GIT_INSPECTOR: ReadOnlyGitInspector = {
  async inspect(input) {
    const repoRoot = await realpath(input.repoRoot);
    const topLevel = await realpath(await gitRead(repoRoot, ['rev-parse', '--show-toplevel']));
    if (topLevel !== repoRoot) fail('REPOSITORY_MISMATCH', 'Git top-level does not match the requested repository root.');
    const mainCommit = exactCommit(await gitRead(repoRoot, ['rev-parse', `${input.mainRef}^{commit}`]), 'resolved main commit');
    const preparedCommit = exactCommit(await gitRead(repoRoot, ['rev-parse', `${input.preparedCommit}^{commit}`]), 'resolved prepared commit');
    const mainTree = exactGitObject(await gitRead(repoRoot, ['rev-parse', `${mainCommit}^{tree}`]), 'main tree');
    const preparedTree = exactGitObject(await gitRead(repoRoot, ['rev-parse', `${preparedCommit}^{tree}`]), 'prepared tree');
    const ancestor = await gitRead(repoRoot, ['merge-base', '--is-ancestor', preparedCommit, mainCommit]);
    return {
      repoRoot,
      remote: input.remote,
      remoteUrl: exactText(await gitRead(repoRoot, ['config', '--get', `remote.${input.remote}.url`]), 'remote URL'),
      mainRef: input.mainRef,
      mainCommit,
      mainTree,
      preparedCommit,
      preparedTree,
      preparedReachableFromMain: ancestor !== 'NOT_ANCESTOR',
    };
  },
};

export interface ReadOnlyReleaseResolution {
  readonly repoRoot: string;
  readonly releaseCommit: string;
  readonly releaseTree: string;
  readonly admittedMainCommit: string;
  readonly preparedCommit: string;
  readonly descendsFromAdmittedMain: boolean;
  readonly containsPreparedCommit: boolean;
}

export interface ReadOnlyReleaseGitResolver {
  resolve(input: {
    readonly repoRoot: string;
    readonly releaseCommit: string;
    readonly admittedMainCommit: string;
    readonly preparedCommit: string;
  }): Promise<ReadOnlyReleaseResolution>;
}

export const DEFAULT_READ_ONLY_RELEASE_GIT_RESOLVER: ReadOnlyReleaseGitResolver = {
  async resolve(input) {
    const repoRoot = await realpath(input.repoRoot);
    const topLevel = await realpath(await gitRead(repoRoot, ['rev-parse', '--show-toplevel']));
    if (topLevel !== repoRoot) fail('REPOSITORY_MISMATCH', 'Release Git repository does not match the requested root.');
    const releaseCommit = exactCommit(await gitRead(repoRoot, ['rev-parse', `${input.releaseCommit}^{commit}`]), 'resolved release commit');
    const admittedMainCommit = exactCommit(await gitRead(repoRoot, ['rev-parse', `${input.admittedMainCommit}^{commit}`]), 'resolved admitted-main commit');
    const preparedCommit = exactCommit(await gitRead(repoRoot, ['rev-parse', `${input.preparedCommit}^{commit}`]), 'resolved prepared commit');
    const releaseTree = exactGitObject(await gitRead(repoRoot, ['rev-parse', `${releaseCommit}^{tree}`]), 'resolved release tree');
    const fromMain = await gitRead(repoRoot, ['merge-base', '--is-ancestor', admittedMainCommit, releaseCommit]);
    const containsPrepared = await gitRead(repoRoot, ['merge-base', '--is-ancestor', preparedCommit, releaseCommit]);
    return {
      repoRoot,
      releaseCommit,
      releaseTree,
      admittedMainCommit,
      preparedCommit,
      descendsFromAdmittedMain: fromMain !== 'NOT_ANCESTOR',
      containsPreparedCommit: containsPrepared !== 'NOT_ANCESTOR',
    };
  },
};

export interface PreparedDraftPrEvidence {
  readonly status: 'LOCAL_READY' | 'PUSHED' | 'DRAFT_PR_OPENED' | 'ALREADY_PREPARED';
  readonly branch: string;
  readonly commit: string;
  readonly treeHash: string;
  readonly manifestDigest: string;
  readonly sourceDigest: string;
  readonly fixtureDigest: string;
  readonly telemetryAuditDigest: string;
  readonly judgmentDigest: string;
  readonly proposalDigest: string;
  readonly candidateDigest: string;
  readonly comparisonDigest: string;
  readonly admissionDigest: string;
  readonly linkedCaseIds: readonly string[];
  readonly caseLineage: RefinementCaseLineage;
  readonly draftPrUrl: string | null;
  readonly remote: string;
}

export interface RefinementCaseLineage {
  readonly schemaVersion: 1;
  readonly telemetryAudit: { readonly digest: string; readonly caseIds: readonly string[] };
  readonly judgments: { readonly digest: string; readonly caseIds: readonly string[] };
  readonly proposal: { readonly digest: string; readonly caseIds: readonly string[] };
  readonly candidate: { readonly digest: string; readonly caseIds: readonly string[] };
  readonly comparison: { readonly digest: string; readonly caseIds: readonly string[] };
  readonly admission: { readonly digest: string; readonly caseIds: readonly string[] };
  readonly digest: string;
}

export function calculateRefinementCaseLineageDigest(value: Omit<RefinementCaseLineage, 'digest'>): string {
  return digest(value);
}

function validateRefinementCaseLineage(value: RefinementCaseLineage, expectedCaseIds: readonly string[]): void {
  if (value.schemaVersion !== 1) fail('CASE_LINEAGE_INVALID', 'Refinement case lineage has an unsupported schema.');
  const stages = [value.telemetryAudit, value.judgments, value.proposal, value.candidate, value.comparison, value.admission];
  for (const stage of stages) {
    exactSha(stage.digest, 'lineage stage digest');
    const caseIds = stage.caseIds.map((caseId) => exactUuid(caseId, 'lineage caseId'));
    if (!sameStrings(caseIds, expectedCaseIds)) fail('CASE_LINEAGE_MISMATCH', 'The same telemetry cases must be linked through every refinement stage.');
  }
  const { digest: lineageDigest, ...basis } = value;
  if (lineageDigest !== calculateRefinementCaseLineageDigest(basis)) fail('CASE_LINEAGE_TAMPERED', 'Refinement case lineage digest is invalid.');
}

export interface VerifiedMainEvidence {
  readonly remote: string;
  readonly remoteUrl: string;
  readonly mainRef: string;
  readonly commit: string;
  readonly tree: string;
  readonly verifiedAt: string;
  readonly verificationDigest: string;
}

export interface MergeDetectionInput {
  readonly repoRoot: string;
  readonly prepared: PreparedDraftPrEvidence;
  readonly verifiedMain: VerifiedMainEvidence;
  readonly auditReceipt: ClosedTelemetryAuditReceipt;
  readonly approvedAuditIds: ApprovedTelemetryAuditIds;
  readonly linkedCases: readonly CaseSnapshot[];
  readonly linkedCaseIds: readonly string[];
  readonly reviewer: string;
  readonly observedAt: string;
  readonly git?: ReadOnlyGitInspector;
}

export interface MergeDetection {
  readonly schemaVersion: 1;
  readonly status: 'MERGED' | 'NOT_MERGED';
  readonly reason: 'PREPARED_COMMIT_REACHABLE' | 'PREPARED_COMMIT_NOT_REACHABLE';
  readonly repository: ReadOnlyRepositoryInspection;
  readonly prepared: PreparedDraftPrEvidence;
  readonly auditReceiptDigest: string;
  readonly approvedAuditIdsDigest: string;
  readonly linkedCaseIds: readonly string[];
  readonly events: readonly CaseStateChanged[];
  readonly observedAt: string;
  readonly digest: string;
}

export function calculateMergeDetectionDigest(value: Omit<MergeDetection, 'events' | 'digest'>): string {
  return digest(value);
}

function assertVerifiedMain(evidence: VerifiedMainEvidence): void {
  exactText(evidence.remote, 'verifiedMain.remote');
  exactText(evidence.remoteUrl, 'verifiedMain.remoteUrl');
  exactText(evidence.mainRef, 'verifiedMain.mainRef');
  exactCommit(evidence.commit, 'verifiedMain.commit');
  exactGitObject(evidence.tree, 'verifiedMain.tree');
  exactIso(evidence.verifiedAt, 'verifiedMain.verifiedAt');
  const expected = digest({
    remote: evidence.remote,
    remoteUrl: evidence.remoteUrl,
    mainRef: evidence.mainRef,
    commit: evidence.commit,
    tree: evidence.tree,
    verifiedAt: evidence.verifiedAt,
  });
  if (evidence.verificationDigest !== expected) fail('MAIN_EVIDENCE_TAMPERED', 'Verified-main evidence digest does not match its fields.');
}

export function calculateVerifiedMainDigest(evidence: Omit<VerifiedMainEvidence, 'verificationDigest'>): string {
  return digest(evidence);
}

function caseTransitionEvents(
  cases: readonly CaseSnapshot[],
  caseIds: readonly string[],
  targetState: 'merged' | 'monitored',
  reviewer: string,
  at: string,
  evidenceDigest: string,
): readonly CaseStateChanged[] {
  const byId = new Map(cases.map((entry) => [entry.caseId, entry] as const));
  if (byId.size !== cases.length) fail('DUPLICATE_CASE', 'Case snapshots contain duplicate case ids.');
  return [...new Set(caseIds)].sort().flatMap((caseId) => {
    const entry = byId.get(caseId);
    if (!entry) fail('MISSING_LINKED_CASE', 'A linked case is not present in the supplied snapshots.');
    let folded: CaseSnapshot;
    try {
      const snapshots = foldCaseEvents(entry.events);
      if (snapshots.length !== 1) fail('INVALID_CASE_CHAIN', 'A linked case snapshot must contain exactly one complete causal chain.');
      folded = snapshots[0]!;
    } catch {
      fail('INVALID_CASE_CHAIN', 'A linked case snapshot failed canonical event validation.');
    }
    if (folded.caseId !== entry.caseId || folded.state !== entry.state) {
      fail('INVALID_CASE_SNAPSHOT', 'Linked case snapshot does not match its canonical event fold.');
    }
    if (entry.state === targetState || (targetState === 'merged' && entry.state === 'monitored')) return [];
    const requiredState = targetState === 'merged' ? 'pr-prepared' : 'merged';
    if (entry.state !== requiredState) fail('INVALID_CASE_STATE', `Linked case is not eligible for the ${targetState} transition.`);
    const parent = entry.events.at(-1);
    if (!parent) fail('INVALID_CASE_CHAIN', 'Linked case has no causal parent event.');
    const sequence = parent.sequence + 1;
    const event = {
      schemaVersion: 2 as const,
      kind: 'case-state-changed' as const,
      eventId: deterministicUuid({ caseId, targetState, sequence, evidenceDigest }),
      caseId,
      parentEventId: parent.eventId,
      at,
      reviewer,
      sequence,
      state: targetState,
    };
    return [parseCaseEvent(event) as CaseStateChanged];
  });
}

export async function detectPreparedCommitOnMain(input: MergeDetectionInput): Promise<MergeDetection> {
  if (!SAFE_REMOTE.test(input.prepared.remote) || input.prepared.remote !== input.verifiedMain.remote) {
    fail('REMOTE_MISMATCH', 'Prepared and verified-main evidence must name the same safe remote.');
  }
  assertVerifiedMain(input.verifiedMain);
  exactCommit(input.prepared.commit, 'prepared.commit');
  exactGitObject(input.prepared.treeHash, 'prepared.treeHash');
  exactSha(input.prepared.manifestDigest, 'prepared.manifestDigest');
  exactSha(input.prepared.sourceDigest, 'prepared.sourceDigest');
  exactSha(input.prepared.fixtureDigest, 'prepared.fixtureDigest');
  exactSha(input.prepared.telemetryAuditDigest, 'prepared.telemetryAuditDigest');
  exactSha(input.prepared.judgmentDigest, 'prepared.judgmentDigest');
  exactSha(input.prepared.proposalDigest, 'prepared.proposalDigest');
  exactSha(input.prepared.candidateDigest, 'prepared.candidateDigest');
  exactSha(input.prepared.comparisonDigest, 'prepared.comparisonDigest');
  exactSha(input.prepared.admissionDigest, 'prepared.admissionDigest');
  const preparedCaseIds = [...new Set(input.prepared.linkedCaseIds.map((caseId) => exactUuid(caseId, 'prepared linkedCaseId')))].sort();
  validateRefinementCaseLineage(input.prepared.caseLineage, preparedCaseIds);
  if (input.prepared.caseLineage.telemetryAudit.digest !== input.prepared.telemetryAuditDigest
    || input.prepared.caseLineage.judgments.digest !== input.prepared.judgmentDigest
    || input.prepared.caseLineage.proposal.digest !== input.prepared.proposalDigest
    || input.prepared.caseLineage.candidate.digest !== input.prepared.candidateDigest
    || input.prepared.caseLineage.comparison.digest !== input.prepared.comparisonDigest
    || input.prepared.caseLineage.admission.digest !== input.prepared.admissionDigest) {
    fail('CASE_LINEAGE_MISMATCH', 'Draft-PR evidence digests conflict with its case lineage.');
  }
  validateClosedTelemetryAuditReceipt(input.auditReceipt);
  if (input.auditReceipt.status !== 'closed') fail('AUDIT_NOT_CLOSED', 'Merge monitoring requires a closed M11 audit receipt.');
  const approvedAuditIds = validateApprovedTelemetryAuditIds(input.approvedAuditIds);
  const auditReceiptDigest = calculateClosedTelemetryAuditReceiptDigest(input.auditReceipt);
  const linkedCaseIds = [...new Set(input.linkedCaseIds.map((caseId) => exactUuid(caseId, 'linkedCaseId')))].sort();
  if (linkedCaseIds.length === 0) fail('NO_LINKED_CASES', 'At least one linked case is required.');
  if (approvedAuditIds.auditDigest !== input.auditReceipt.auditDigest
    || approvedAuditIds.auditDigest !== input.prepared.telemetryAuditDigest
    || approvedAuditIds.receiptDigest !== auditReceiptDigest
    || approvedAuditIds.generatedTelemetryCaseIds.length !== input.auditReceipt.candidateCaseCount
    || !sameStrings(approvedAuditIds.generatedTelemetryCaseIds, linkedCaseIds)) {
    fail('TELEMETRY_CASE_LINEAGE_MISMATCH', 'Merge case links are not the generated cases from the closed M11 receipt.');
  }
  if (!['DRAFT_PR_OPENED', 'ALREADY_PREPARED'].includes(input.prepared.status) || !input.prepared.draftPrUrl) {
    fail('DRAFT_PR_NOT_VERIFIED', 'Post-merge detection requires a verified draft-PR preparation record.');
  }
  const inspector = input.git ?? DEFAULT_READ_ONLY_GIT_INSPECTOR;
  const repository = await inspector.inspect({
    repoRoot: input.repoRoot,
    remote: input.prepared.remote,
    mainRef: input.verifiedMain.mainRef,
    preparedCommit: input.prepared.commit,
  });
  const expectedRoot = await realpath(input.repoRoot);
  if (repository.repoRoot !== expectedRoot
    || repository.remote !== input.verifiedMain.remote
    || repository.remoteUrl !== input.verifiedMain.remoteUrl
    || repository.mainRef !== input.verifiedMain.mainRef
    || repository.mainCommit !== input.verifiedMain.commit
    || repository.mainTree !== input.verifiedMain.tree) {
    fail('MAIN_MOVED_OR_UNVERIFIED', 'Current main no longer matches the independently verified main evidence.');
  }
  if (repository.preparedCommit !== input.prepared.commit || repository.preparedTree !== input.prepared.treeHash) {
    fail('FALSE_COMMIT_MATCH', 'Resolved prepared commit or tree does not match the preparation record.');
  }
  if (!sameStrings(preparedCaseIds, linkedCaseIds)) fail('DRAFT_PR_CASE_MISMATCH', 'Prepared draft-PR case links do not match merge monitoring links.');
  const observedAt = exactIso(input.observedAt, 'observedAt');
  const basis = {
    schemaVersion: 1 as const,
    status: repository.preparedReachableFromMain ? 'MERGED' as const : 'NOT_MERGED' as const,
    reason: repository.preparedReachableFromMain ? 'PREPARED_COMMIT_REACHABLE' as const : 'PREPARED_COMMIT_NOT_REACHABLE' as const,
    repository,
    prepared: input.prepared,
    auditReceiptDigest,
    approvedAuditIdsDigest: approvedAuditIds.digest,
    linkedCaseIds,
    observedAt,
  };
  const reportDigest = calculateMergeDetectionDigest(basis);
  const events = repository.preparedReachableFromMain
    ? caseTransitionEvents(input.linkedCases, linkedCaseIds, 'merged', exactText(input.reviewer, 'reviewer'), observedAt, reportDigest)
    : [];
  return { ...basis, events, digest: reportDigest };
}

export interface AdmittedReleaseBinding {
  readonly admissionDigest: string;
  readonly sourceDigest: string;
  readonly preparedCommit: string;
  readonly preparedTree: string;
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  readonly databaseSha256: string;
}

export interface ReleaseProvenance {
  readonly schemaVersion: 1;
  readonly status: 'RELEASED' | 'NOT_RUN' | 'BLOCKED';
  readonly machineReason: string;
  readonly independentlyReviewed: boolean;
  readonly reviewer: string | null;
  readonly reviewedAt: string | null;
  readonly releaseCommit: string | null;
  readonly releaseTree: string | null;
  readonly preparedCommit: string;
  readonly preparedTree: string;
  readonly admissionDigest: string;
  readonly sourceDigest: string;
  readonly descriptorSha256: string | null;
  readonly databaseSha256: string | null;
  readonly engineVersion: string | null;
  readonly corpusFingerprint: string | null;
  readonly layerFingerprint: string | null;
  readonly digest: string;
}

export function calculateReleaseProvenanceDigest(provenance: Omit<ReleaseProvenance, 'digest'>): string {
  const { digest: _ignored, ...basis } = provenance as ReleaseProvenance;
  return digest(basis);
}

export interface ReleaseVerificationInput {
  readonly repoRoot: string;
  readonly merge: MergeDetection;
  readonly admitted: AdmittedReleaseBinding;
  readonly provenance: ReleaseProvenance;
  readonly descriptorPath: string;
  readonly databasePath: string;
  readonly linkedCases: readonly CaseSnapshot[];
  readonly reviewer: string;
  readonly observedAt: string;
  readonly git?: ReadOnlyReleaseGitResolver;
}

export interface ReleaseMonitoringResult {
  readonly schemaVersion: 1;
  readonly status: 'MONITORED' | 'BLOCKED' | 'NOT_RUN';
  readonly machineReason: string;
  readonly descriptor: ArtifactDescriptor | null;
  readonly descriptorSha256: string | null;
  readonly databaseSha256: string | null;
  readonly repository: ReadOnlyReleaseResolution | null;
  readonly release: ReleaseProvenance;
  readonly mergeDigest: string;
  readonly linkedCaseIds: readonly string[];
  readonly events: readonly CaseStateChanged[];
  readonly observedAt: string;
  readonly digest: string;
}

export function calculateReleaseMonitoringDigest(value: Omit<ReleaseMonitoringResult, 'events' | 'digest'>): string {
  return digest(value);
}

async function hashFile(file: string): Promise<string> {
  return sha256(await readFile(file));
}

export async function verifyReleasedArtifact(input: ReleaseVerificationInput): Promise<ReleaseMonitoringResult> {
  if (input.merge.status !== 'MERGED') fail('MERGE_NOT_VERIFIED', 'A prepared commit must be verified on main before release monitoring.');
  const { events: _mergeEvents, digest: _mergeDigest, ...mergeBasis } = input.merge;
  if (input.merge.digest !== calculateMergeDetectionDigest(mergeBasis)) fail('MERGE_EVIDENCE_TAMPERED', 'Merge evidence digest does not match its fields.');
  if (input.provenance.digest !== calculateReleaseProvenanceDigest(input.provenance)) {
    fail('RELEASE_PROVENANCE_TAMPERED', 'Release provenance digest does not match its fields.');
  }
  const observedAt = exactIso(input.observedAt, 'observedAt');
  const commonBindings = input.provenance.preparedCommit === input.merge.prepared.commit
    && input.provenance.preparedTree === input.merge.prepared.treeHash
    && input.provenance.preparedCommit === input.admitted.preparedCommit
    && input.provenance.preparedTree === input.admitted.preparedTree
    && input.provenance.admissionDigest === input.admitted.admissionDigest
    && input.provenance.sourceDigest === input.admitted.sourceDigest;
  if (!commonBindings) fail('RELEASE_PROVENANCE_MISMATCH', 'Release status is not bound to the admitted source and prepared tree.');
  if (input.provenance.status !== 'RELEASED') {
    if (input.provenance.independentlyReviewed || input.provenance.reviewer !== null || input.provenance.reviewedAt !== null
      || input.provenance.releaseCommit !== null || input.provenance.releaseTree !== null
      || input.provenance.descriptorSha256 !== null || input.provenance.databaseSha256 !== null
      || input.provenance.engineVersion !== null || input.provenance.corpusFingerprint !== null || input.provenance.layerFingerprint !== null) {
      fail('INVALID_UNAVAILABLE_RELEASE', 'Unavailable release evidence must not carry reviewed artifact claims.');
    }
    const status = input.provenance.status === 'NOT_RUN' ? 'NOT_RUN' as const : 'BLOCKED' as const;
    const basis = {
      schemaVersion: 1 as const,
      status,
      machineReason: exactText(input.provenance.machineReason, 'release machineReason'),
      descriptor: null,
      descriptorSha256: null,
      databaseSha256: null,
      repository: null,
      release: input.provenance,
      mergeDigest: input.merge.digest,
      linkedCaseIds: input.merge.linkedCaseIds,
      events: [] as readonly CaseStateChanged[],
      observedAt,
    };
    const { events: _events, ...digestBasis } = basis;
    return { ...basis, digest: calculateReleaseMonitoringDigest(digestBasis) };
  }
  if (!input.provenance.independentlyReviewed || !input.provenance.reviewer || !input.provenance.reviewedAt) {
    fail('RELEASE_NOT_INDEPENDENTLY_REVIEWED', 'Released provenance requires an independent reviewer and review timestamp.');
  }
  exactIso(input.provenance.reviewedAt, 'release reviewedAt');
  const resolver = input.git ?? DEFAULT_READ_ONLY_RELEASE_GIT_RESOLVER;
  const repository = await resolver.resolve({
    repoRoot: input.repoRoot,
    releaseCommit: exactCommit(input.provenance.releaseCommit ?? '', 'releaseCommit'),
    admittedMainCommit: input.merge.repository.mainCommit,
    preparedCommit: input.merge.prepared.commit,
  });
  const expectedRoot = await realpath(input.repoRoot);
  if (repository.repoRoot !== expectedRoot
    || repository.releaseCommit !== input.provenance.releaseCommit
    || repository.releaseTree !== input.provenance.releaseTree
    || repository.admittedMainCommit !== input.merge.repository.mainCommit
    || repository.preparedCommit !== input.merge.prepared.commit
    || !repository.descendsFromAdmittedMain
    || !repository.containsPreparedCommit) {
    fail('UNRELATED_RELEASE_COMMIT', 'Release commit is not the verified descendant containing the admitted change.');
  }
  const descriptorBytes = await readFile(input.descriptorPath);
  let descriptor: ArtifactDescriptor;
  try {
    descriptor = validateArtifactDescriptor(JSON.parse(descriptorBytes.toString('utf8')) as unknown);
  } catch {
    fail('INVALID_RELEASE_DESCRIPTOR', 'Released descriptor failed the normal schema path.');
  }
  if (descriptor.stale?.blocksRelease === true) fail('UNRELEASED_DESCRIPTOR', 'Descriptor explicitly blocks release.');
  const descriptorSha256 = sha256(descriptorBytes);
  const databaseSha256 = await hashFile(input.databasePath);
  const databaseStats = await stat(input.databasePath);
  if (databaseStats.size !== descriptor.databaseBytes || databaseSha256 !== descriptor.databaseSha256) {
    fail('RELEASE_ARTIFACT_HASH_MISMATCH', 'Released database does not match descriptor hash and byte count.');
  }
  const admitted = input.admitted;
  const release = input.provenance;
  const exactBindings = release.preparedCommit === input.merge.prepared.commit
    && release.preparedTree === input.merge.prepared.treeHash
    && release.preparedCommit === admitted.preparedCommit
    && release.preparedTree === admitted.preparedTree
    && release.admissionDigest === admitted.admissionDigest
    && release.sourceDigest === admitted.sourceDigest
    && release.descriptorSha256 === descriptorSha256
    && release.databaseSha256 === databaseSha256
    && release.engineVersion === admitted.engineVersion
    && release.corpusFingerprint === admitted.corpusFingerprint
    && release.layerFingerprint === admitted.layerFingerprint
    && admitted.databaseSha256 === databaseSha256
    && equalIdentity(descriptor, admitted)
    && equalIdentity(descriptor, {
      engineVersion: release.engineVersion ?? '',
      corpusFingerprint: release.corpusFingerprint ?? '',
      layerFingerprint: release.layerFingerprint ?? '',
    });
  if (!exactBindings) fail('RELEASE_IDENTITY_MISMATCH', 'Shipped descriptor or release provenance differs from admitted source, tree, or identities.');
  exactGitObject(release.releaseTree ?? '', 'releaseTree');
  const basisWithoutEvents = {
    schemaVersion: 1 as const,
    status: 'MONITORED' as const,
    machineReason: 'RELEASE_ARTIFACT_VERIFIED',
    descriptor,
    descriptorSha256,
    databaseSha256,
    repository,
    release,
    mergeDigest: input.merge.digest,
    linkedCaseIds: input.merge.linkedCaseIds,
    observedAt,
  };
  const evidenceDigest = digest(basisWithoutEvents);
  const events = caseTransitionEvents(
    input.linkedCases,
    input.merge.linkedCaseIds,
    'monitored',
    exactText(input.reviewer, 'reviewer'),
    observedAt,
    evidenceDigest,
  );
  const basis = { ...basisWithoutEvents, events };
  return { ...basis, digest: evidenceDigest };
}

export interface PrivacySafeTelemetryCluster {
  readonly aggregateId: string;
  readonly approvalId: string;
  readonly auditDigest: string;
  readonly period: string;
  readonly artifact: {
    readonly engineVersion: string;
    readonly corpusFingerprint: string;
    readonly layerFingerprint: string;
  };
  readonly aboveThreshold: true;
  readonly totalSearches: number;
  readonly zeroResultSearches: number;
  readonly weakConversionSearches: number;
  readonly convertedRankCounts: readonly { readonly convertedRank: number; readonly count: number }[];
}

export interface ApprovedTelemetryAuditIds {
  readonly schemaVersion: 1;
  readonly auditDigest: string;
  readonly receiptDigest: string;
  readonly aggregateIds: readonly string[];
  readonly approvalIds: readonly string[];
  readonly generatedTelemetryCaseIds: readonly string[];
  readonly digest: string;
}

export function calculateApprovedTelemetryAuditIdsDigest(value: Omit<ApprovedTelemetryAuditIds, 'digest'>): string {
  return digest(value);
}

function validateApprovedTelemetryAuditIds(value: ApprovedTelemetryAuditIds): ApprovedTelemetryAuditIds {
  rejectPrivateCanary(value);
  requireExactKeys(value as unknown as Record<string, unknown>, [
    'schemaVersion', 'auditDigest', 'receiptDigest', 'aggregateIds', 'approvalIds', 'generatedTelemetryCaseIds', 'digest',
  ], 'INVALID_AUDIT_ALLOWLIST');
  if (value.schemaVersion !== 1) fail('INVALID_AUDIT_ALLOWLIST', 'Approved telemetry identity roster has an unsupported schema.');
  exactSha(value.auditDigest, 'auditDigest');
  exactSha(value.receiptDigest, 'receiptDigest');
  const aggregateIds = value.aggregateIds.map((id) => exactSha(id, 'aggregateId'));
  const approvalIds = value.approvalIds.map((id) => exactSha(id, 'approvalId'));
  const generatedTelemetryCaseIds = value.generatedTelemetryCaseIds.map((id) => exactUuid(id, 'telemetryCaseId'));
  if (new Set(aggregateIds).size !== aggregateIds.length
    || new Set(approvalIds).size !== approvalIds.length
    || new Set(generatedTelemetryCaseIds).size !== generatedTelemetryCaseIds.length) {
    fail('INVALID_AUDIT_ALLOWLIST', 'Approved telemetry identity roster contains duplicate identities.');
  }
  const { digest: rosterDigest, ...basis } = value;
  if (rosterDigest !== calculateApprovedTelemetryAuditIdsDigest(basis)) fail('AUDIT_ALLOWLIST_TAMPERED', 'Approved telemetry identity roster digest is invalid.');
  return value;
}

export interface TelemetryClusterOutcome {
  readonly aggregateId: string;
  readonly pre: TelemetryOutcomeSnapshot;
  readonly post: TelemetryOutcomeSnapshot;
  readonly deltas: {
    readonly zeroResultRate: number;
    readonly weakConversionRate: number;
    readonly convertedWithinTop1Rate: number;
    readonly convertedWithinTop3Rate: number;
    readonly convertedWithinTop5Rate: number;
    readonly convertedWithinTop10Rate: number;
  };
  readonly sparse: boolean;
  readonly context: string;
}

export interface TelemetryOutcomeSnapshot {
  readonly aggregateId: string;
  readonly approvalId: string;
  readonly auditDigest: string;
  readonly period: string;
  readonly artifact: PrivacySafeTelemetryCluster['artifact'];
  readonly denominator: number;
  readonly zeroResults: number;
  readonly zeroResultRate: number;
  readonly weakConversions: number;
  readonly weakConversionRate: number;
  readonly convertedRankCounts: readonly { readonly convertedRank: number; readonly count: number }[];
  readonly convertedWithinTop1Rate: number;
  readonly convertedWithinTop3Rate: number;
  readonly convertedWithinTop5Rate: number;
  readonly convertedWithinTop10Rate: number;
}

export interface TelemetryOutcomeComparison {
  readonly schemaVersion: 1;
  readonly preAuditDigest: string;
  readonly postAuditDigest: string;
  readonly preAllowlistDigest: string;
  readonly postAllowlistDigest: string;
  readonly preReceiptDigest: string;
  readonly postReceiptDigest: string;
  readonly sparseThreshold: number;
  readonly aggregateIds: readonly string[];
  readonly outcomes: readonly TelemetryClusterOutcome[];
  readonly digest: string;
}

export function calculateTelemetryOutcomeComparisonDigest(value: Omit<TelemetryOutcomeComparison, 'digest'>): string {
  return digest(value);
}

function telemetrySnapshot(value: PrivacySafeTelemetryCluster): TelemetryOutcomeSnapshot {
  rejectPrivateCanary(value);
  requireExactKeys(value as unknown as Record<string, unknown>, [
    'aggregateId', 'approvalId', 'auditDigest', 'period', 'artifact', 'aboveThreshold', 'totalSearches',
    'zeroResultSearches', 'weakConversionSearches', 'convertedRankCounts',
  ]);
  requireExactKeys(value.artifact as unknown as Record<string, unknown>, ['engineVersion', 'corpusFingerprint', 'layerFingerprint']);
  exactSha(value.aggregateId, 'aggregateId');
  exactSha(value.approvalId, 'approvalId');
  exactSha(value.auditDigest, 'auditDigest');
  exactAuditPeriod(value.period);
  exactEngineVersion(value.artifact.engineVersion);
  exactSha(value.artifact.corpusFingerprint, 'artifact.corpusFingerprint');
  exactSha(value.artifact.layerFingerprint, 'artifact.layerFingerprint');
  if (value.aboveThreshold !== true) fail('BELOW_THRESHOLD_TELEMETRY', 'Only explicitly above-threshold aggregate evidence is accepted.');
  for (const [name, count] of Object.entries({
    totalSearches: value.totalSearches,
    zeroResultSearches: value.zeroResultSearches,
    weakConversionSearches: value.weakConversionSearches,
  })) {
    if (!Number.isSafeInteger(count) || count < 0) fail('INVALID_TELEMETRY_COUNT', `${name} must be a non-negative safe integer.`);
  }
  if (value.totalSearches === 0 || value.zeroResultSearches > value.totalSearches || value.weakConversionSearches > value.totalSearches) {
    fail('INVALID_TELEMETRY_DENOMINATOR', 'Telemetry counts must fit a positive aggregate denominator.');
  }
  const ranks = [...value.convertedRankCounts].sort((a, b) => a.convertedRank - b.convertedRank);
  const seen = new Set<number>();
  for (const row of ranks) {
    requireExactKeys(row as unknown as Record<string, unknown>, ['convertedRank', 'count']);
    if (!Number.isSafeInteger(row.convertedRank) || row.convertedRank < 1 || !Number.isSafeInteger(row.count) || row.count < 0 || seen.has(row.convertedRank)) {
      fail('INVALID_CONVERTED_RANK', 'Converted-rank rows require unique positive ranks and non-negative counts.');
    }
    seen.add(row.convertedRank);
  }
  if (ranks.reduce((sum, row) => sum + row.count, 0) > value.totalSearches) {
    fail('INVALID_CONVERTED_RANK_TOTAL', 'Converted-rank counts cannot exceed the aggregate denominator.');
  }
  const within = (limit: number): number => ranks.filter((entry) => entry.convertedRank <= limit).reduce((sum, entry) => sum + entry.count, 0) / value.totalSearches;
  return {
    aggregateId: value.aggregateId,
    approvalId: value.approvalId,
    auditDigest: value.auditDigest,
    period: value.period,
    artifact: value.artifact,
    denominator: value.totalSearches,
    zeroResults: value.zeroResultSearches,
    zeroResultRate: value.zeroResultSearches / value.totalSearches,
    weakConversions: value.weakConversionSearches,
    weakConversionRate: value.weakConversionSearches / value.totalSearches,
    convertedRankCounts: ranks,
    convertedWithinTop1Rate: within(1),
    convertedWithinTop3Rate: within(3),
    convertedWithinTop5Rate: within(5),
    convertedWithinTop10Rate: within(10),
  };
}

export function compareAffectedTelemetryClusters(input: {
  readonly pre: readonly PrivacySafeTelemetryCluster[];
  readonly post: readonly PrivacySafeTelemetryCluster[];
  readonly affectedAggregateIds: readonly string[];
  readonly preReceipt: ClosedTelemetryAuditReceipt;
  readonly postReceipt: ClosedTelemetryAuditReceipt;
  readonly preApprovedIds: ApprovedTelemetryAuditIds;
  readonly postApprovedIds: ApprovedTelemetryAuditIds;
  readonly sparseThreshold?: number;
}): TelemetryOutcomeComparison {
  rejectPrivateCanary(input);
  validateClosedTelemetryAuditReceipt(input.preReceipt);
  validateClosedTelemetryAuditReceipt(input.postReceipt);
  if (input.preReceipt.status !== 'closed' || input.postReceipt.status !== 'closed') {
    fail('AUDIT_NOT_CLOSED', 'Telemetry comparison requires two closed M11 audit receipts.');
  }
  const preApprovedIds = validateApprovedTelemetryAuditIds(input.preApprovedIds);
  const postApprovedIds = validateApprovedTelemetryAuditIds(input.postApprovedIds);
  const preReceiptDigest = calculateClosedTelemetryAuditReceiptDigest(input.preReceipt);
  const postReceiptDigest = calculateClosedTelemetryAuditReceiptDigest(input.postReceipt);
  if (preApprovedIds.auditDigest !== input.preReceipt.auditDigest
    || postApprovedIds.auditDigest !== input.postReceipt.auditDigest
    || preApprovedIds.receiptDigest !== preReceiptDigest
    || postApprovedIds.receiptDigest !== postReceiptDigest
    || preApprovedIds.generatedTelemetryCaseIds.length !== input.preReceipt.candidateCaseCount
    || postApprovedIds.generatedTelemetryCaseIds.length !== input.postReceipt.candidateCaseCount) {
    fail('AUDIT_ALLOWLIST_RECEIPT_MISMATCH', 'Telemetry identity rosters are not bound to their closed M11 receipts.');
  }
  const sparseThreshold = input.sparseThreshold ?? DEFAULT_STABILIZATION_SPARSE_THRESHOLD;
  if (!Number.isSafeInteger(sparseThreshold) || sparseThreshold < 1) fail('INVALID_SPARSE_THRESHOLD', 'Sparse threshold must be a positive safe integer.');
  const load = (entries: readonly PrivacySafeTelemetryCluster[], approved: ApprovedTelemetryAuditIds): Map<string, TelemetryOutcomeSnapshot> => {
    const result = new Map<string, TelemetryOutcomeSnapshot>();
    const approvedAggregates = new Set(approved.aggregateIds);
    const approvedApprovals = new Set(approved.approvalIds);
    for (const entry of entries) {
      const snapshot = telemetrySnapshot(entry);
      if (snapshot.auditDigest !== approved.auditDigest
        || !approvedAggregates.has(snapshot.aggregateId)
        || !approvedApprovals.has(snapshot.approvalId)) {
        fail('AUDIT_IDENTITY_MISMATCH', 'Telemetry aggregate is not present in the approved receipt identity roster.');
      }
      if (result.has(snapshot.aggregateId)) fail('DUPLICATE_AGGREGATE', 'Telemetry audit contains a duplicate aggregate id.');
      result.set(snapshot.aggregateId, snapshot);
    }
    return result;
  };
  const pre = load(input.pre, preApprovedIds);
  const post = load(input.post, postApprovedIds);
  const aggregateIds = [...new Set(input.affectedAggregateIds.map((id) => exactSha(id, 'affectedAggregateId')))].sort();
  if (aggregateIds.length === 0) fail('NO_AFFECTED_AGGREGATES', 'At least one affected aggregate id is required.');
  if (aggregateIds.some((id) => !preApprovedIds.aggregateIds.includes(id) || !postApprovedIds.aggregateIds.includes(id))) {
    fail('AUDIT_IDENTITY_MISMATCH', 'Affected aggregate is not approved in both audit identity rosters.');
  }
  const outcomes = aggregateIds.map((aggregateId): TelemetryClusterOutcome => {
    const before = pre.get(aggregateId);
    const after = post.get(aggregateId);
    if (!before || !after) fail('MISSING_AGGREGATE_PERIOD', 'Every affected aggregate must exist in both approved audits.');
    if (before.period === after.period) fail('DUPLICATE_AUDIT_PERIOD', 'Pre and post aggregates must come from different periods.');
    const sparse = before.denominator < sparseThreshold || after.denominator < sparseThreshold;
    return {
      aggregateId,
      pre: before,
      post: after,
      deltas: {
        zeroResultRate: after.zeroResultRate - before.zeroResultRate,
        weakConversionRate: after.weakConversionRate - before.weakConversionRate,
        convertedWithinTop1Rate: after.convertedWithinTop1Rate - before.convertedWithinTop1Rate,
        convertedWithinTop3Rate: after.convertedWithinTop3Rate - before.convertedWithinTop3Rate,
        convertedWithinTop5Rate: after.convertedWithinTop5Rate - before.convertedWithinTop5Rate,
        convertedWithinTop10Rate: after.convertedWithinTop10Rate - before.convertedWithinTop10Rate,
      },
      sparse,
      context: sparse
        ? `Directional context only: one or both aggregate denominators are below ${sparseThreshold}.`
        : 'Approved above-threshold aggregate comparison.',
    };
  });
  const basis = {
    schemaVersion: 1 as const,
    preAuditDigest: preApprovedIds.auditDigest,
    postAuditDigest: postApprovedIds.auditDigest,
    preAllowlistDigest: preApprovedIds.digest,
    postAllowlistDigest: postApprovedIds.digest,
    preReceiptDigest,
    postReceiptDigest,
    sparseThreshold,
    aggregateIds,
    outcomes,
  };
  return { ...basis, digest: calculateTelemetryOutcomeComparisonDigest(basis) };
}

export const RECOVERY_OPERATIONS = [
  'audit-import',
  'candidate-build',
  'source-apply-admission',
  'worktree-preparation',
  'push',
  'server-restart',
] as const;
export type RecoveryOperation = (typeof RECOVERY_OPERATIONS)[number];
export type RecoveryAction = 'RESUME' | 'REBUILD_REVIEW_REQUIRED' | 'RECOVER_JOURNAL' | 'ALREADY_COMPLETE' | 'HUMAN_CONFIRMATION_REQUIRED' | 'RESTART_DEGRADED';

export interface RecoveryCheckpoint {
  readonly schemaVersion: 1;
  readonly operation: RecoveryOperation;
  readonly operationId: string;
  readonly phase: string;
  readonly expectedMainCommit: string;
  readonly evidenceDigest: string;
  readonly preconditionsDigest: string;
  readonly targetIdentityDigest: string;
  readonly expectedRemoteCommit: string;
  readonly irreversibleAttempted: boolean;
}

export interface RecoveryObservation {
  readonly currentMainCommit: string;
  readonly currentMainVerified: boolean;
  readonly evidenceDigest: string;
  readonly evidenceRevalidated: boolean;
  readonly preconditionsDigest: string;
  readonly preconditionsRevalidated: boolean;
  readonly preconditionsValid: boolean;
  readonly targetIdentityDigest: string;
  readonly targetIdentityVerified: boolean;
  readonly journalRecoverable: boolean;
  readonly remoteIdempotencyProof: {
    readonly checked: true;
    readonly branchCommit: string | null;
    readonly draftPrHeadCommit: string | null;
  };
  readonly descriptorAvailable: boolean;
  readonly descriptorVerified: boolean;
}

export interface RecoveryOutcome {
  readonly schemaVersion: 1;
  readonly operation: RecoveryOperation;
  readonly operationId: string;
  readonly action: RecoveryAction;
  readonly machineReason: string;
  readonly mayRepeatIrreversibleAction: false;
  readonly requiresHumanApproval: boolean;
  readonly digest: string;
}

export function recoverInterruptedOperation(checkpoint: RecoveryCheckpoint, observation: RecoveryObservation): RecoveryOutcome {
  if (!RECOVERY_OPERATIONS.includes(checkpoint.operation)) fail('UNKNOWN_RECOVERY_OPERATION', 'Unknown recovery operation.');
  exactText(checkpoint.operationId, 'operationId');
  exactText(checkpoint.phase, 'phase');
  exactCommit(checkpoint.expectedMainCommit, 'expectedMainCommit');
  exactCommit(observation.currentMainCommit, 'currentMainCommit');
  exactSha(checkpoint.evidenceDigest, 'checkpoint evidenceDigest');
  exactSha(checkpoint.preconditionsDigest, 'checkpoint preconditionsDigest');
  exactSha(checkpoint.targetIdentityDigest, 'checkpoint targetIdentityDigest');
  exactCommit(checkpoint.expectedRemoteCommit, 'checkpoint expectedRemoteCommit');
  exactSha(observation.evidenceDigest, 'observation evidenceDigest');
  exactSha(observation.preconditionsDigest, 'observation preconditionsDigest');
  exactSha(observation.targetIdentityDigest, 'observation targetIdentityDigest');

  let action: RecoveryAction;
  let machineReason: string;
  let requiresHumanApproval = false;
  const mainMoved = checkpoint.expectedMainCommit !== observation.currentMainCommit;
  const remoteProof = observation.remoteIdempotencyProof;
  const remoteChecked = isRecord(remoteProof) && remoteProof['checked'] === true
    && (remoteProof['branchCommit'] === null || (typeof remoteProof['branchCommit'] === 'string' && COMMIT.test(remoteProof['branchCommit'])))
    && (remoteProof['draftPrHeadCommit'] === null || (typeof remoteProof['draftPrHeadCommit'] === 'string' && COMMIT.test(remoteProof['draftPrHeadCommit'])));
  const stale = !observation.currentMainVerified
    || !observation.evidenceRevalidated
    || !observation.preconditionsRevalidated
    || !observation.targetIdentityVerified
    || !remoteChecked
    || !observation.preconditionsValid
    || checkpoint.evidenceDigest !== observation.evidenceDigest
    || checkpoint.preconditionsDigest !== observation.preconditionsDigest
    || checkpoint.targetIdentityDigest !== observation.targetIdentityDigest;

  // This ordering is intentional: no journal or remote completion claim can
  // outrank independently revalidated main, evidence, preconditions, targets,
  // and remote state.
  if (mainMoved || stale) {
    action = 'REBUILD_REVIEW_REQUIRED';
    machineReason = mainMoved ? 'MAIN_MOVED_REBUILD_REVIEW_REQUIRED' : 'STALE_EVIDENCE_REBUILD_REVIEW_REQUIRED';
    requiresHumanApproval = true;
  } else if (checkpoint.operation === 'push') {
    const proof = observation.remoteIdempotencyProof;
    const requiresDraftProof = checkpoint.phase === 'draft-pr' || checkpoint.phase === 'draft-pr-opened';
    const branchExact = proof.branchCommit === checkpoint.expectedRemoteCommit;
    const draftExact = proof.draftPrHeadCommit === checkpoint.expectedRemoteCommit;
    if (branchExact && (!requiresDraftProof || draftExact)) {
      action = 'ALREADY_COMPLETE';
      machineReason = draftExact ? 'EXACT_REMOTE_COMMIT_AND_DRAFT_PR_PROVEN' : 'EXACT_REMOTE_COMMIT_PROVEN';
    } else if (checkpoint.irreversibleAttempted) {
      action = 'HUMAN_CONFIRMATION_REQUIRED';
      machineReason = 'IRREVERSIBLE_REMOTE_OUTCOME_UNPROVEN';
      requiresHumanApproval = true;
    } else {
      action = 'HUMAN_CONFIRMATION_REQUIRED';
      machineReason = 'PUSH_REQUIRES_EXPLICIT_HUMAN_APPROVAL';
      requiresHumanApproval = true;
    }
  } else if (checkpoint.operation === 'candidate-build') {
    action = 'RESUME';
    machineReason = 'CANDIDATE_PRECONDITIONS_REVALIDATED';
  } else if (checkpoint.operation === 'worktree-preparation') {
    action = 'RESUME';
    machineReason = 'WORKTREE_PRECONDITIONS_REVALIDATED';
  } else if (checkpoint.operation === 'source-apply-admission' || checkpoint.operation === 'audit-import') {
    if (observation.journalRecoverable) {
      action = 'RECOVER_JOURNAL';
      machineReason = 'JOURNAL_RECOVERY_REQUIRED';
    } else {
      action = 'RESUME';
      machineReason = 'TRANSACTION_PRECONDITIONS_REVALIDATED';
    }
  } else {
    if (!observation.descriptorAvailable || !observation.descriptorVerified) {
      action = 'RESTART_DEGRADED';
      machineReason = observation.descriptorAvailable ? 'DESCRIPTOR_VERIFICATION_FAILED' : 'DESCRIPTOR_UNAVAILABLE';
    } else {
      action = 'RESUME';
      machineReason = 'SERVER_RESTART_PRECONDITIONS_REVALIDATED';
    }
  }
  const basis = {
    schemaVersion: 1 as const,
    operation: checkpoint.operation,
    operationId: checkpoint.operationId,
    action,
    machineReason,
    mayRepeatIrreversibleAction: false as const,
    requiresHumanApproval,
  };
  return { ...basis, digest: digest(basis) };
}

export interface ClosedDumpProof {
  readonly auditDigest: string;
  readonly checkedAt: string;
  readonly selectedDumpCount: number;
  readonly remainingDumpCount: 0;
  readonly proofDigest: string;
}

/** Stable M11 receipt shape consumed without importing its orchestration implementation. */
export interface ClosedTelemetryAuditReceipt {
  readonly schemaVersion: 1;
  readonly auditDigest: string;
  readonly status: 'applied' | 'closed';
  readonly contentDigests: readonly string[];
  readonly distillateCount: number;
  readonly schemaVersions: readonly number[];
  readonly period: string;
  readonly distinctAuditTokens: number;
  readonly suppression: { readonly belowThreshold: number; readonly sensitiveExcluded: number };
  readonly excludedEvidence: { readonly rankMismatch: number; readonly unreplayable: number };
  readonly candidateCaseCount: number;
  readonly masterBeforeSha256: string | null;
  readonly masterAfterSha256: string;
  readonly casesBeforeSha256: string | null;
  readonly casesAfterSha256: string;
}

function validateClosedTelemetryAuditReceipt(receipt: ClosedTelemetryAuditReceipt): void {
  rejectPrivateCanary(receipt);
  if (receipt.schemaVersion !== 1) fail('INVALID_AUDIT_RECEIPT', 'Closed telemetry audit receipt has an unsupported schema.');
  exactSha(receipt.auditDigest, 'receipt.auditDigest');
  exactAuditPeriod(receipt.period);
  receipt.contentDigests.forEach((entry) => exactSha(entry, 'receipt.contentDigest'));
  for (const value of [receipt.masterBeforeSha256, receipt.masterAfterSha256, receipt.casesBeforeSha256, receipt.casesAfterSha256]) {
    if (value !== null) exactSha(value, 'receipt state digest');
  }
  const counts = [
    receipt.distillateCount, receipt.distinctAuditTokens, receipt.suppression.belowThreshold,
    receipt.suppression.sensitiveExcluded, receipt.excludedEvidence.rankMismatch,
    receipt.excludedEvidence.unreplayable, receipt.candidateCaseCount,
  ];
  if (counts.some((value) => !Number.isSafeInteger(value) || value < 0)) fail('INVALID_AUDIT_RECEIPT', 'Closed telemetry audit receipt contains an invalid count.');
  if (receipt.schemaVersions.some((value) => !Number.isSafeInteger(value) || value < 1)) fail('INVALID_AUDIT_RECEIPT', 'Closed telemetry audit receipt contains an invalid schema version.');
}

export function calculateClosedTelemetryAuditReceiptDigest(receipt: ClosedTelemetryAuditReceipt): string {
  validateClosedTelemetryAuditReceipt(receipt);
  return digest(receipt);
}

/** Stable M10 projection used by stabilization; no admission implementation dependency. */
export interface StabilizationAdmissionRecord {
  readonly digest: string;
  readonly sourceDigest: string;
  readonly telemetryAuditDigest: string;
  readonly judgmentDigest: string;
  readonly proposalDigest: string;
  readonly candidateDigest: string;
  readonly comparisonDigest: string;
  readonly linkedCaseIds: readonly string[];
  readonly baseCommit: string;
  readonly worktreeTreeHash: string;
}

export interface ExternalGate {
  readonly gate: 'merge' | 'release' | 'consumer-update' | 'real-telemetry-audit';
  readonly status: 'PASSED' | 'NOT_RUN' | 'BLOCKED';
  readonly machineReason: string;
}

export interface StabilizationReportInput {
  readonly generatedAt: string;
  readonly merge: MergeDetection;
  readonly release: ReleaseMonitoringResult;
  readonly telemetry: TelemetryOutcomeComparison | null;
  readonly auditReceipt: ClosedTelemetryAuditReceipt;
  readonly approvedAuditIds: ApprovedTelemetryAuditIds;
  readonly closedDumpProof: ClosedDumpProof;
  readonly calibrationSession: ReviewSession;
  readonly holdoutSession: ReviewSession;
  readonly dashboard: QualityDashboardReport;
  readonly admission: StabilizationAdmissionRecord;
  readonly draftPr: PreparedDraftPrEvidence;
  readonly recoveryOutcomes: readonly RecoveryOutcome[];
  readonly externalGates: readonly ExternalGate[];
}

export interface StabilizationReport {
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly repository: {
    readonly mergeDigest: string;
    readonly preparedCommit: string;
    readonly preparedTree: string;
    readonly mainCommit: string;
    readonly mainTree: string;
  };
  readonly release: {
    readonly status: ReleaseMonitoringResult['status'];
    readonly digest: string;
    readonly descriptorSha256: string | null;
    readonly databaseSha256: string | null;
  };
  readonly telemetry: { readonly status: 'COMPARED'; readonly digest: string } | { readonly status: 'NOT_RUN'; readonly machineReason: string };
  readonly partitions: {
    readonly calibration: { readonly sessionId: string; readonly definitionDigest: string; readonly digest: string; readonly status: ReviewSession['status'] };
    readonly holdout: { readonly sessionId: string; readonly definitionDigest: string; readonly digest: string; readonly status: ReviewSession['status']; readonly opaqueMembership: true };
  };
  readonly audit: {
    readonly receiptDigest: string;
    readonly approvedIdsDigest: string;
    readonly status: ClosedTelemetryAuditReceipt['status'];
    readonly closedDumpProofDigest: string;
  };
  readonly dashboard: { readonly authorizedReportDigest: string; readonly reviewCycleId: string };
  readonly admission: StabilizationReportInput['admission'];
  readonly draftPr: PreparedDraftPrEvidence;
  readonly recoveryOutcomes: readonly RecoveryOutcome[];
  readonly externalGates: readonly ExternalGate[];
  readonly releaseReady: boolean;
  readonly digest: string;
}

export function calculateClosedDumpProofDigest(proof: Omit<ClosedDumpProof, 'proofDigest'>): string {
  const { proofDigest: _ignored, ...basis } = proof as ClosedDumpProof;
  return digest(basis);
}

export function calculateMonitoringRepositoryStateDigest(merge: MergeDetection): string {
  return digest({
    repoRoot: merge.repository.repoRoot,
    remote: merge.repository.remote,
    remoteUrl: merge.repository.remoteUrl,
    mainCommit: merge.repository.mainCommit,
    mainTree: merge.repository.mainTree,
    preparedCommit: merge.repository.preparedCommit,
    preparedTree: merge.repository.preparedTree,
  });
}

export function calculateMonitoringArtifactStateDigest(report: QualityDashboardReport): string {
  return digest(report.artifact);
}

export function calculateMonthlyReviewBindingDigest(input: {
  readonly reviewCycleId: string;
  readonly repositoryStateDigest: string;
  readonly artifactStateDigest: string;
}): string {
  return digest(input);
}

function assertCompletedMonthlySession(
  session: ReviewSession,
  expectedKind: 'calibration' | 'holdout',
  repositoryStateDigest: string,
  artifactStateDigest: string,
  cycleBindingDigest: string,
): void {
  let verified: ReviewSession;
  try {
    verified = foldReviewSessionEvents(session, session.events);
  } catch {
    fail('SESSION_INTEGRITY_INVALID', 'Monthly review session failed canonical M12 integrity validation.');
  }
  if (canonical(verified) !== canonical(session)) fail('SESSION_INTEGRITY_INVALID', 'Monthly review session state is not its canonical event fold.');
  if (session.kind !== expectedKind
    || session.definition.kind !== expectedKind
    || session.status !== 'completed'
    || session.repositoryStateDigest !== repositoryStateDigest
    || session.definition.repositoryStateDigest !== repositoryStateDigest
    || session.artifactStateDigest !== artifactStateDigest
    || session.definition.artifactStateDigest !== artifactStateDigest
    || session.definition.sessionFilter.externalDigest !== cycleBindingDigest) {
    fail('SESSION_BINDING_MISMATCH', 'Monthly review session does not match its partition, repository, artifact, and review cycle.');
  }
}

export function buildStabilizationReport(input: StabilizationReportInput): StabilizationReport {
  exactIso(input.generatedAt, 'generatedAt');
  validateClosedTelemetryAuditReceipt(input.auditReceipt);
  if (input.auditReceipt.status !== 'closed') fail('AUDIT_NOT_CLOSED', 'Stabilization requires a closed telemetry audit receipt.');
  const { events: _mergeEvents, digest: _mergeDigest, ...mergeBasis } = input.merge;
  if (input.merge.digest !== calculateMergeDetectionDigest(mergeBasis)) fail('MERGE_EVIDENCE_TAMPERED', 'Merge evidence failed report-time integrity validation.');
  const { events: _releaseEvents, digest: _releaseDigest, ...releaseBasis } = input.release;
  if (input.release.digest !== calculateReleaseMonitoringDigest(releaseBasis)) fail('RELEASE_EVIDENCE_TAMPERED', 'Release evidence failed report-time integrity validation.');
  const approvedAuditIds = validateApprovedTelemetryAuditIds(input.approvedAuditIds);
  const receiptDigest = calculateClosedTelemetryAuditReceiptDigest(input.auditReceipt);
  if (approvedAuditIds.auditDigest !== input.auditReceipt.auditDigest || approvedAuditIds.receiptDigest !== receiptDigest) {
    fail('AUDIT_ALLOWLIST_RECEIPT_MISMATCH', 'Approved telemetry identity roster is not bound to the closed M11 receipt.');
  }
  if (input.merge.auditReceiptDigest !== receiptDigest || input.merge.approvedAuditIdsDigest !== approvedAuditIds.digest) {
    fail('AUDIT_ALLOWLIST_RECEIPT_MISMATCH', 'Stabilization audit evidence differs from the receipt verified at merge detection.');
  }
  if (canonical(input.merge.prepared) !== canonical(input.draftPr)) {
    fail('DRAFT_PR_BINDING_MISMATCH', 'Draft-PR record does not match merge evidence.');
  }
  if (input.admission.digest !== input.draftPr.manifestDigest
    || input.admission.digest !== input.draftPr.admissionDigest
    || input.admission.digest !== input.release.release.admissionDigest
    || input.admission.sourceDigest !== input.draftPr.sourceDigest
    || input.admission.sourceDigest !== input.release.release.sourceDigest
    || input.admission.telemetryAuditDigest !== input.auditReceipt.auditDigest
    || input.admission.telemetryAuditDigest !== input.draftPr.telemetryAuditDigest
    || input.admission.judgmentDigest !== input.draftPr.judgmentDigest
    || input.admission.proposalDigest !== input.draftPr.proposalDigest
    || input.admission.candidateDigest !== input.draftPr.candidateDigest
    || input.admission.comparisonDigest !== input.draftPr.comparisonDigest
    || input.admission.worktreeTreeHash !== input.draftPr.treeHash
    || !sameStrings(input.admission.linkedCaseIds, input.merge.linkedCaseIds)
    || !sameStrings(input.admission.linkedCaseIds, input.draftPr.linkedCaseIds)) {
    fail('ADMISSION_BINDING_MISMATCH', 'Admission record does not match prepared source tree.');
  }
  if (input.auditReceipt.candidateCaseCount < 1
    || input.auditReceipt.candidateCaseCount !== approvedAuditIds.generatedTelemetryCaseIds.length
    || !sameStrings(approvedAuditIds.generatedTelemetryCaseIds, input.admission.linkedCaseIds)) {
    fail('TELEMETRY_CASE_LINEAGE_MISMATCH', 'Closed audit telemetry cases are not linked unchanged through admission and draft-PR preparation.');
  }
  if (input.auditReceipt.auditDigest !== input.closedDumpProof.auditDigest
    || input.closedDumpProof.remainingDumpCount !== 0
    || input.closedDumpProof.proofDigest !== calculateClosedDumpProofDigest(input.closedDumpProof)) {
    fail('AUDIT_DELETION_UNPROVEN', 'Closed audit dump deletion proof is missing or invalid.');
  }
  exactIso(input.closedDumpProof.checkedAt, 'closedDumpProof.checkedAt');
  if (!Number.isSafeInteger(input.closedDumpProof.selectedDumpCount) || input.closedDumpProof.selectedDumpCount < 1) {
    fail('AUDIT_DELETION_UNPROVEN', 'Closed dump proof must cover at least one selected audit dump.');
  }
  const repositoryStateDigest = calculateMonitoringRepositoryStateDigest(input.merge);
  const artifactStateDigest = calculateMonitoringArtifactStateDigest(input.dashboard);
  const cycleBindingDigest = calculateMonthlyReviewBindingDigest({
    reviewCycleId: input.dashboard.reviewCycle.cycleId,
    repositoryStateDigest,
    artifactStateDigest,
  });
  assertCompletedMonthlySession(input.calibrationSession, 'calibration', repositoryStateDigest, artifactStateDigest, cycleBindingDigest);
  assertCompletedMonthlySession(input.holdoutSession, 'holdout', repositoryStateDigest, artifactStateDigest, cycleBindingDigest);
  if (input.calibrationSession.sessionId === input.holdoutSession.sessionId) fail('SESSION_ID_COLLISION', 'Calibration and holdout sessions must have distinct identities.');
  assertQualityDashboardIntegrity(input.dashboard);
  if (input.release.status === 'MONITORED' && (!input.release.descriptor || !equalIdentity(input.dashboard.artifact, input.release.descriptor))) {
    fail('DASHBOARD_RELEASE_MISMATCH', 'Dashboard artifact identity does not match the monitored release.');
  }
  if (input.telemetry) {
    const { digest: telemetryDigest, ...telemetryBasis } = input.telemetry;
    if (telemetryDigest !== calculateTelemetryOutcomeComparisonDigest(telemetryBasis)) {
      fail('TELEMETRY_COMPARISON_TAMPERED', 'Telemetry comparison digest does not match its evidence.');
    }
    if (input.auditReceipt.auditDigest !== input.telemetry.postAuditDigest) {
      fail('TELEMETRY_AUDIT_RECEIPT_MISMATCH', 'Post-change telemetry comparison does not belong to the closed audit receipt.');
    }
    if (input.telemetry.postReceiptDigest !== receiptDigest
      || input.telemetry.postAllowlistDigest !== approvedAuditIds.digest
      || !sameStrings(input.telemetry.aggregateIds, approvedAuditIds.aggregateIds.filter((id) => input.telemetry!.aggregateIds.includes(id)))) {
      fail('TELEMETRY_AUDIT_RECEIPT_MISMATCH', 'Post-change telemetry comparison is not bound to the approved receipt aggregate roster.');
    }
    if (input.release.status === 'MONITORED' && input.release.descriptor
      && input.telemetry.outcomes.some((outcome) => !equalIdentity(outcome.post.artifact, input.release.descriptor!))) {
      fail('TELEMETRY_RELEASE_IDENTITY_MISMATCH', 'Post-change telemetry evidence does not describe the monitored release identity.');
    }
  }
  const recoveryOutcomes = [...input.recoveryOutcomes].sort((a, b) => `${a.operation}:${a.operationId}`.localeCompare(`${b.operation}:${b.operationId}`));
  const seenOperations = new Set(recoveryOutcomes.map((entry) => entry.operation));
  for (const operation of RECOVERY_OPERATIONS) {
    if (!seenOperations.has(operation)) fail('RECOVERY_COVERAGE_INCOMPLETE', 'Stabilization report must cover every interruption class.');
  }
  if (recoveryOutcomes.length !== RECOVERY_OPERATIONS.length) fail('RECOVERY_COVERAGE_DUPLICATE', 'Every interruption class must appear exactly once.');
  for (const outcome of recoveryOutcomes) {
    const { digest: outcomeDigest, ...outcomeBasis } = outcome;
    if (outcomeDigest !== digest(outcomeBasis) || outcome.mayRepeatIrreversibleAction !== false) {
      fail('RECOVERY_OUTCOME_TAMPERED', 'Recovery outcome integrity validation failed.');
    }
  }
  const externalGates = [...input.externalGates].sort((a, b) => a.gate.localeCompare(b.gate));
  const gateNames = new Set(externalGates.map((entry) => entry.gate));
  if (gateNames.size !== 4 || externalGates.length !== 4) fail('EXTERNAL_GATE_ROSTER_INCOMPLETE', 'All four explicit external gates must be reported exactly once.');
  for (const gate of externalGates) exactText(gate.machineReason, `${gate.gate}.machineReason`);
  const basis = {
    schemaVersion: 1 as const,
    generatedAt: input.generatedAt,
    repository: {
      mergeDigest: input.merge.digest,
      preparedCommit: input.merge.prepared.commit,
      preparedTree: input.merge.prepared.treeHash,
      mainCommit: input.merge.repository.mainCommit,
      mainTree: input.merge.repository.mainTree,
    },
    release: {
      status: input.release.status,
      digest: input.release.digest,
      descriptorSha256: input.release.descriptorSha256,
      databaseSha256: input.release.databaseSha256,
    },
    telemetry: input.telemetry
      ? { status: 'COMPARED' as const, digest: input.telemetry.digest }
      : { status: 'NOT_RUN' as const, machineReason: 'NEXT_APPROVED_AUDIT_NOT_AVAILABLE' },
    partitions: {
      calibration: {
        sessionId: input.calibrationSession.sessionId,
        definitionDigest: input.calibrationSession.definitionDigest,
        digest: input.calibrationSession.digest,
        status: input.calibrationSession.status,
      },
      holdout: {
        sessionId: input.holdoutSession.sessionId,
        definitionDigest: input.holdoutSession.definitionDigest,
        digest: input.holdoutSession.digest,
        status: input.holdoutSession.status,
        opaqueMembership: true as const,
      },
    },
    audit: {
      receiptDigest,
      approvedIdsDigest: approvedAuditIds.digest,
      status: input.auditReceipt.status,
      closedDumpProofDigest: input.closedDumpProof.proofDigest,
    },
    dashboard: {
      authorizedReportDigest: input.dashboard.authorizedReportDigest,
      reviewCycleId: input.dashboard.reviewCycle.cycleId,
    },
    admission: input.admission,
    draftPr: input.draftPr,
    recoveryOutcomes,
    externalGates,
    releaseReady: input.merge.status === 'MERGED'
      && input.release.status === 'MONITORED'
      && input.telemetry !== null
      && input.auditReceipt.candidateCaseCount > 0
      && approvedAuditIds.generatedTelemetryCaseIds.length > 0
      && externalGates.every((gate) => gate.status === 'PASSED'),
  };
  return { ...basis, digest: digest(basis) };
}
