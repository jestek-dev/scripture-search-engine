import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it } from 'vitest';

import type { CaseEvent, CaseSnapshot } from '../src/cases.js';
import { buildQualityDashboard, type ArtifactIdentity, type QualityDashboardReport } from '../src/qualityDashboard.js';
import { appendReviewSessionEvent, buildReviewSession, type ReviewSession } from '../src/reviewSessions.js';
import {
  RECOVERY_OPERATIONS,
  buildStabilizationReport,
  calculateApprovedTelemetryAuditIdsDigest,
  calculateClosedDumpProofDigest,
  calculateClosedTelemetryAuditReceiptDigest,
  calculateMonitoringArtifactStateDigest,
  calculateMonitoringRepositoryStateDigest,
  calculateMonthlyReviewBindingDigest,
  calculateRefinementCaseLineageDigest,
  calculateReleaseProvenanceDigest,
  calculateVerifiedMainDigest,
  compareAffectedTelemetryClusters,
  detectPreparedCommitOnMain,
  recoverInterruptedOperation,
  verifyReleasedArtifact,
  type AdmittedReleaseBinding,
  type ApprovedTelemetryAuditIds,
  type ClosedTelemetryAuditReceipt,
  type MergeDetection,
  type PreparedDraftPrEvidence,
  type PrivacySafeTelemetryCluster,
  type ReadOnlyGitInspector,
  type ReadOnlyReleaseGitResolver,
  type RecoveryCheckpoint,
  type RecoveryObservation,
  type ReleaseMonitoringResult,
  type ReleaseProvenance,
  type VerifiedMainEvidence,
} from '../src/postMergeMonitoring.js';

const temporary: string[] = [];
const A = 'a'.repeat(64);
const B = 'b'.repeat(64);
const C = 'c'.repeat(64);
const D = 'd'.repeat(64);
const E = 'e'.repeat(64);
const F = 'f'.repeat(64);
const COMMIT = '1'.repeat(40);
const MAIN = '2'.repeat(40);
const TREE = '3'.repeat(40);
const MAIN_TREE = '4'.repeat(40);
const AT = '2026-08-11T12:00:00.000Z';
const CASE_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_CASE_ID = '22222222-2222-4222-8222-222222222222';
const AGGREGATE_ID = sha('approved-aggregate');
const PRE_APPROVAL_ID = sha('pre-approval');
const POST_APPROVAL_ID = sha('post-approval');
const execFileAsync = promisify(execFile);

function sha(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

async function tempRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'post-merge-monitoring-'));
  temporary.push(root);
  return root;
}

async function git(root: string, args: readonly string[]): Promise<string> {
  const result = await execFileAsync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true });
  return result.stdout.trim();
}

afterEach(async () => {
  await Promise.all(temporary.splice(0).map((entry) => rm(entry, { recursive: true, force: true })));
});

function reviewCase(state: CaseSnapshot['state'] = 'pr-prepared', caseId = CASE_ID): CaseSnapshot {
  const states = ['new', 'reviewing', 'judged', 'proposed', 'candidate-ready', 'admitted', 'pr-prepared', 'merged', 'monitored'] as const;
  const selected = states.slice(0, states.indexOf(state as typeof states[number]) + 1);
  const root = {
    schemaVersion: 2 as const,
    kind: 'case-created' as const,
    eventId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', caseId, at: AT, reviewer: 'reviewer', sequence: 1,
    query: 'approved aggregate display only', source: 'telemetry' as const,
    artifact: { engineVersion: 'engine-1', corpusFingerprint: A, layerFingerprint: B },
  };
  const events: CaseEvent[] = [root];
  for (const [index, nextState] of selected.slice(1).entries()) {
    events.push({
      schemaVersion: 2, kind: 'case-state-changed', eventId: `aaaaaaaa-aaaa-4aaa-8aaa-${String(index + 2).padStart(12, '0')}`, caseId,
      parentEventId: events.at(-1)!.eventId, at: AT, reviewer: 'reviewer', sequence: index + 2, state: nextState,
    });
  }
  return {
    caseId, query: root.query, source: root.source, artifact: root.artifact, state,
    events, sessionIds: [], proposalIds: [], candidateIds: [], admissionIds: [], pullRequestUrls: [],
  };
}

function prepared(): PreparedDraftPrEvidence {
  const lineageBasis = {
    schemaVersion: 1 as const,
    telemetryAudit: { digest: B, caseIds: [CASE_ID] }, judgments: { digest: C, caseIds: [CASE_ID] },
    proposal: { digest: D, caseIds: [CASE_ID] }, candidate: { digest: E, caseIds: [CASE_ID] },
    comparison: { digest: F, caseIds: [CASE_ID] }, admission: { digest: A, caseIds: [CASE_ID] },
  };
  return {
    status: 'DRAFT_PR_OPENED', branch: 'refinement/proposal-1', commit: COMMIT, treeHash: TREE,
    manifestDigest: A, sourceDigest: B, fixtureDigest: C,
    telemetryAuditDigest: B, judgmentDigest: C, proposalDigest: D, candidateDigest: E,
    comparisonDigest: F, admissionDigest: A, linkedCaseIds: [CASE_ID],
    caseLineage: { ...lineageBasis, digest: calculateRefinementCaseLineageDigest(lineageBasis) },
    draftPrUrl: 'https://example.invalid/pr/1', remote: 'origin',
  };
}

function releaseResolver(root: string, overrides: Partial<Awaited<ReturnType<ReadOnlyReleaseGitResolver['resolve']>>> = {}): ReadOnlyReleaseGitResolver {
  return {
    async resolve() {
      return {
        repoRoot: await import('node:fs/promises').then(({ realpath }) => realpath(root)),
        releaseCommit: MAIN, releaseTree: MAIN_TREE, admittedMainCommit: MAIN, preparedCommit: COMMIT,
        descendsFromAdmittedMain: true, containsPreparedCommit: true, ...overrides,
      };
    },
  };
}

function verifiedMain(): VerifiedMainEvidence {
  const basis = {
    remote: 'origin', remoteUrl: 'https://example.invalid/repo.git', mainRef: 'refs/remotes/origin/main',
    commit: MAIN, tree: MAIN_TREE, verifiedAt: AT,
  };
  return { ...basis, verificationDigest: calculateVerifiedMainDigest(basis) };
}

function inspector(overrides: Partial<Awaited<ReturnType<ReadOnlyGitInspector['inspect']>>> = {}): ReadOnlyGitInspector {
  return {
    async inspect(input) {
      return {
        repoRoot: await import('node:fs/promises').then(({ realpath }) => realpath(input.repoRoot)),
        remote: 'origin', remoteUrl: 'https://example.invalid/repo.git', mainRef: 'refs/remotes/origin/main',
        mainCommit: MAIN, mainTree: MAIN_TREE, preparedCommit: COMMIT, preparedTree: TREE,
        preparedReachableFromMain: true,
        ...overrides,
      };
    },
  };
}

function mergeAuditEvidence() {
  const auditReceipt = closedReceipt();
  return {
    auditReceipt,
    approvedAuditIds: approvedIds(B, calculateClosedTelemetryAuditReceiptDigest(auditReceipt)),
  };
}

async function merged(root: string, cases: readonly CaseSnapshot[] = [reviewCase()]): Promise<MergeDetection> {
  return detectPreparedCommitOnMain({
    repoRoot: root, prepared: prepared(), verifiedMain: verifiedMain(), ...mergeAuditEvidence(), linkedCases: cases,
    linkedCaseIds: [CASE_ID], reviewer: 'merge reviewer', observedAt: AT, git: inspector(),
  });
}

function admitted(): AdmittedReleaseBinding {
  return {
    admissionDigest: A, sourceDigest: B, preparedCommit: COMMIT, preparedTree: TREE,
    engineVersion: 'engine-1', corpusFingerprint: A, layerFingerprint: B, databaseSha256: C,
  };
}

function releaseProvenance(overrides: Partial<Omit<ReleaseProvenance, 'digest'>> = {}): ReleaseProvenance {
  const basis: Omit<ReleaseProvenance, 'digest'> = {
    schemaVersion: 1, status: 'RELEASED', machineReason: 'RELEASE_PUBLISHED_AND_INDEPENDENTLY_REVIEWED',
    independentlyReviewed: true, reviewer: 'release reviewer', reviewedAt: AT,
    releaseCommit: MAIN, releaseTree: MAIN_TREE, preparedCommit: COMMIT, preparedTree: TREE,
    admissionDigest: A, sourceDigest: B, descriptorSha256: D, databaseSha256: C,
    engineVersion: 'engine-1', corpusFingerprint: A, layerFingerprint: B,
    ...overrides,
  };
  return { ...basis, digest: calculateReleaseProvenanceDigest(basis) };
}

async function releaseFiles(root: string): Promise<{ descriptorPath: string; databasePath: string; provenance: ReleaseProvenance }> {
  const databasePath = path.join(root, 'content.db');
  const descriptorPath = path.join(root, 'content-artifact.json');
  const bytes = Buffer.from('verified release database');
  await writeFile(databasePath, bytes);
  const descriptor = {
    schemaVersion: '1', engineVersion: 'engine-1', corpusFingerprint: A, layerFingerprint: B,
    databaseSha256: sha(bytes), databaseBytes: bytes.length, translations: [],
  };
  const descriptorBytes = Buffer.from(`${JSON.stringify(descriptor)}\n`);
  await writeFile(descriptorPath, descriptorBytes);
  return {
    descriptorPath,
    databasePath,
    provenance: releaseProvenance({ descriptorSha256: sha(descriptorBytes), databaseSha256: sha(bytes) }),
  };
}

function cluster(
  aggregateId: string,
  auditDigest: string,
  period: string,
  overrides: Partial<PrivacySafeTelemetryCluster> = {},
): PrivacySafeTelemetryCluster {
  return {
    aggregateId, approvalId: auditDigest === A ? PRE_APPROVAL_ID : POST_APPROVAL_ID, auditDigest, period,
    artifact: { engineVersion: 'engine-1', corpusFingerprint: A, layerFingerprint: B },
    aboveThreshold: true, totalSearches: 100, zeroResultSearches: 20, weakConversionSearches: 30,
    convertedRankCounts: [{ convertedRank: 1, count: 20 }, { convertedRank: 3, count: 20 }, { convertedRank: 8, count: 10 }],
    ...overrides,
  };
}

function approvedIds(
  auditDigest: string,
  receiptDigest: string,
  aggregateIds: readonly string[] = [AGGREGATE_ID],
  approvalIds: readonly string[] = [auditDigest === A ? PRE_APPROVAL_ID : POST_APPROVAL_ID],
  generatedTelemetryCaseIds: readonly string[] = [CASE_ID],
): ApprovedTelemetryAuditIds {
  const basis = { schemaVersion: 1 as const, auditDigest, receiptDigest, aggregateIds, approvalIds, generatedTelemetryCaseIds };
  return { ...basis, digest: calculateApprovedTelemetryAuditIdsDigest(basis) };
}

function recovery(operation: typeof RECOVERY_OPERATIONS[number], overrides: Partial<RecoveryObservation> = {}) {
  const checkpoint: RecoveryCheckpoint = {
    schemaVersion: 1, operation, operationId: `${operation}-1`, phase: 'interrupted', expectedMainCommit: MAIN,
    evidenceDigest: A, preconditionsDigest: B, targetIdentityDigest: C, expectedRemoteCommit: COMMIT, irreversibleAttempted: operation === 'push',
  };
  const observation: RecoveryObservation = {
    currentMainCommit: MAIN, currentMainVerified: true, evidenceDigest: A, evidenceRevalidated: true,
    preconditionsDigest: B, preconditionsRevalidated: true, preconditionsValid: true,
    targetIdentityDigest: C, targetIdentityVerified: true,
    journalRecoverable: operation === 'audit-import' || operation === 'source-apply-admission',
    remoteIdempotencyProof: { checked: true, branchCommit: operation === 'push' ? COMMIT : null, draftPrHeadCommit: operation === 'push' ? COMMIT : null },
    descriptorAvailable: true, descriptorVerified: true, ...overrides,
  };
  return recoverInterruptedOperation(checkpoint, observation);
}

function completedSession(kind: 'calibration' | 'holdout', merge: MergeDetection, report: QualityDashboardReport): ReviewSession {
  const repositoryStateDigest = calculateMonitoringRepositoryStateDigest(merge);
  const artifactStateDigest = calculateMonitoringArtifactStateDigest(report);
  const sessionFilterDigest = calculateMonthlyReviewBindingDigest({
    reviewCycleId: report.reviewCycle.cycleId, repositoryStateDigest, artifactStateDigest,
  });
  let current = buildReviewSession({
    kind, seed: `${kind}-seed`, reviewer: 'reviewer', reviewedSize: 1, minimumPoolSize: 1, explorationSize: 0,
    repositoryStateDigest, artifactStateDigest, sessionFilterDigest, now: AT,
    cases: [{
      caseId: kind === 'calibration' ? 'calibration-case' : 'holdout-case',
      query: kind === 'calibration' ? 'calibration wording' : 'opaque holdout wording',
      source: kind, outcomeClass: 'calibration', deviceCount: 0, convertedRank: null, recurrence: 0,
      createdAt: AT, ...(kind === 'calibration' ? { calibration: true as const } : { holdout: true as const }),
    }],
  });
  current = appendReviewSessionEvent(current, {
    kind: 'item-completed', eventId: `${kind}-item-complete`, sessionId: current.sessionId,
    sessionDefinitionDigest: current.definitionDigest, expectedSessionDigest: current.digest,
    expectedRevision: current.revision, caseId: current.orderedCaseIds[0]!, reviewer: current.reviewer, at: AT,
  });
  return appendReviewSessionEvent(current, {
    kind: 'session-completed', eventId: `${kind}-session-complete`, sessionId: current.sessionId,
    sessionDefinitionDigest: current.definitionDigest, expectedSessionDigest: current.digest,
    expectedRevision: current.revision, reviewer: current.reviewer, at: AT,
  });
}

function dashboard(cycleId = '2026-08', layerFingerprint = B): QualityDashboardReport {
  const artifact: ArtifactIdentity = {
    artifactId: 'release-1', descriptorSha256: D, engineVersion: 'engine-1', corpusFingerprint: A, layerFingerprint,
  };
  const referenceArtifact: ArtifactIdentity = {
    artifactId: 'release-0', descriptorSha256: C, engineVersion: 'engine-1', corpusFingerprint: A, layerFingerprint: C,
  };
  return buildQualityDashboard({
    schemaVersion: 1, artifact, referenceArtifact, reviewCycle: { cycleId }, observedAt: AT,
    benchmarkObservations: [], blindComparisons: [], telemetryAggregates: [], coverageRecords: [],
    caseLifecycles: [], admissions: [], requiredGateEvaluations: [],
    artifactGenealogy: [{ artifact, reviewCycleId: cycleId, observedAt: AT, parent: null }], trendHistory: [],
  });
}

function closedReceipt(auditDigest = B, period = '2026-Q3'): ClosedTelemetryAuditReceipt {
  return {
    schemaVersion: 1, auditDigest, status: 'closed', contentDigests: [C], distillateCount: 3,
    schemaVersions: [1], period, distinctAuditTokens: 25,
    suppression: { belowThreshold: 4, sensitiveExcluded: 2 }, excludedEvidence: { rankMismatch: 0, unreplayable: 0 },
    candidateCaseCount: 1, masterBeforeSha256: C, masterAfterSha256: D, casesBeforeSha256: C, casesAfterSha256: D,
  };
}

function stabilizationAdmission() {
  return {
    digest: A, sourceDigest: B, telemetryAuditDigest: B, judgmentDigest: C, proposalDigest: D,
    candidateDigest: E, comparisonDigest: F, linkedCaseIds: [CASE_ID], baseCommit: MAIN, worktreeTreeHash: TREE,
  };
}

describe('read-only post-merge and release monitoring', () => {
  it('binds repo, remote, exact commit and tree before returning merged events without mutation', async () => {
    const root = await tempRoot();
    let calls = 0;
    const git = inspector();
    const result = await detectPreparedCommitOnMain({
      repoRoot: root, prepared: prepared(), verifiedMain: verifiedMain(), ...mergeAuditEvidence(), linkedCases: [reviewCase()],
      linkedCaseIds: [CASE_ID], reviewer: 'merge reviewer', observedAt: AT,
      git: { async inspect(input) { calls += 1; return git.inspect(input); } },
    });
    expect(calls).toBe(1);
    expect(result.status).toBe('MERGED');
    expect(result.events).toMatchObject([{ kind: 'case-state-changed', state: 'merged', sequence: 8 }]);
    expect(Object.keys(git)).toEqual(['inspect']);
  });

  it('performs real Git ancestry inspection without changing HEAD, refs, index, or worktree', async () => {
    const root = await tempRoot();
    await git(root, ['init', '--initial-branch=main']);
    await git(root, ['config', 'user.name', 'M15 Test']);
    await git(root, ['config', 'user.email', 'm15@example.invalid']);
    await git(root, ['remote', 'add', 'origin', 'https://example.invalid/repo.git']);
    await writeFile(path.join(root, 'fixture.txt'), 'approved\n');
    await git(root, ['add', 'fixture.txt']);
    await git(root, ['commit', '-m', 'prepared']);
    const commit = await git(root, ['rev-parse', 'HEAD']);
    const tree = await git(root, ['rev-parse', 'HEAD^{tree}']);
    const mainBasis = {
      remote: 'origin', remoteUrl: 'https://example.invalid/repo.git', mainRef: 'refs/heads/main',
      commit, tree, verifiedAt: AT,
    };
    const before = {
      head: await git(root, ['rev-parse', 'HEAD']),
      refs: await git(root, ['show-ref']),
      status: await git(root, ['status', '--porcelain=v1']),
    };
    const result = await detectPreparedCommitOnMain({
      repoRoot: root,
      prepared: { ...prepared(), commit, treeHash: tree },
      verifiedMain: { ...mainBasis, verificationDigest: calculateVerifiedMainDigest(mainBasis) },
      ...mergeAuditEvidence(),
      linkedCases: [reviewCase()], linkedCaseIds: [CASE_ID], reviewer: 'merge reviewer', observedAt: AT,
    });
    const afterMerge = {
      head: await git(root, ['rev-parse', 'HEAD']), refs: await git(root, ['show-ref']), status: await git(root, ['status', '--porcelain=v1']),
    };
    expect(afterMerge).toEqual(before);
    const files = await releaseFiles(root);
    const provenance = releaseProvenance({
      releaseCommit: commit, releaseTree: tree, preparedCommit: commit, preparedTree: tree,
      descriptorSha256: files.provenance.descriptorSha256, databaseSha256: files.provenance.databaseSha256,
    });
    const beforeRelease = {
      head: await git(root, ['rev-parse', 'HEAD']), refs: await git(root, ['show-ref']), status: await git(root, ['status', '--porcelain=v1']),
    };
    const monitored = await verifyReleasedArtifact({
      repoRoot: root, merge: result,
      admitted: { ...admitted(), preparedCommit: commit, preparedTree: tree, databaseSha256: files.provenance.databaseSha256! },
      provenance, descriptorPath: files.descriptorPath, databasePath: files.databasePath,
      linkedCases: [reviewCase('merged')], reviewer: 'release reviewer', observedAt: AT,
    });
    const afterRelease = {
      head: await git(root, ['rev-parse', 'HEAD']),
      refs: await git(root, ['show-ref']),
      status: await git(root, ['status', '--porcelain=v1']),
    };
    expect(result.status).toBe('MERGED');
    expect(monitored.status).toBe('MONITORED');
    expect(afterRelease).toEqual(beforeRelease);
  });

  it('rejects false commit/tree matches and moved verified main; unreachable commits stay explicit', async () => {
    const root = await tempRoot();
    const common = { repoRoot: root, prepared: prepared(), verifiedMain: verifiedMain(), ...mergeAuditEvidence(), linkedCases: [reviewCase()], linkedCaseIds: [CASE_ID], reviewer: 'r', observedAt: AT };
    await expect(detectPreparedCommitOnMain({ ...common, git: inspector({ preparedTree: '9'.repeat(40) }) })).rejects.toMatchObject({ code: 'FALSE_COMMIT_MATCH' });
    await expect(detectPreparedCommitOnMain({ ...common, git: inspector({ mainCommit: '8'.repeat(40) }) })).rejects.toMatchObject({ code: 'MAIN_MOVED_OR_UNVERIFIED' });
    const notMerged = await detectPreparedCommitOnMain({ ...common, git: inspector({ preparedReachableFromMain: false }) });
    expect(notMerged).toMatchObject({ status: 'NOT_MERGED', events: [] });
  });

  it('rejects draft evidence when any refinement stage links a different case', async () => {
    const root = await tempRoot();
    const draft = prepared();
    const lineageBasis = {
      ...draft.caseLineage,
      proposal: { ...draft.caseLineage.proposal, caseIds: [OTHER_CASE_ID] },
    };
    const { digest: _oldDigest, ...unsigned } = lineageBasis;
    const tampered = { ...draft, caseLineage: { ...unsigned, digest: calculateRefinementCaseLineageDigest(unsigned) } };
    await expect(detectPreparedCommitOnMain({
      repoRoot: root, prepared: tampered, verifiedMain: verifiedMain(), ...mergeAuditEvidence(), linkedCases: [reviewCase()],
      linkedCaseIds: [CASE_ID], reviewer: 'r', observedAt: AT, git: inspector(),
    })).rejects.toMatchObject({ code: 'CASE_LINEAGE_MISMATCH' });
  });

  it('rejects zero-case and receipt-unrelated telemetry case rosters before merge transition', async () => {
    const root = await tempRoot();
    const zeroReceipt = { ...closedReceipt(), candidateCaseCount: 0 };
    await expect(detectPreparedCommitOnMain({
      repoRoot: root, prepared: prepared(), verifiedMain: verifiedMain(), auditReceipt: zeroReceipt,
      approvedAuditIds: approvedIds(B, calculateClosedTelemetryAuditReceiptDigest(zeroReceipt)),
      linkedCases: [reviewCase()], linkedCaseIds: [CASE_ID], reviewer: 'r', observedAt: AT, git: inspector(),
    })).rejects.toMatchObject({ code: 'TELEMETRY_CASE_LINEAGE_MISMATCH' });
    const receipt = closedReceipt();
    await expect(detectPreparedCommitOnMain({
      repoRoot: root, prepared: prepared(), verifiedMain: verifiedMain(), auditReceipt: receipt,
      approvedAuditIds: approvedIds(B, calculateClosedTelemetryAuditReceiptDigest(receipt), [AGGREGATE_ID], [POST_APPROVAL_ID], [OTHER_CASE_ID]),
      linkedCases: [reviewCase()], linkedCaseIds: [CASE_ID], reviewer: 'r', observedAt: AT, git: inspector(),
    })).rejects.toMatchObject({ code: 'TELEMETRY_CASE_LINEAGE_MISMATCH' });
  });

  it('is idempotent for cases already merged or monitored', async () => {
    const root = await tempRoot();
    expect((await merged(root, [reviewCase('merged')])).events).toEqual([]);
    expect((await merged(root, [reviewCase('monitored')])).events).toEqual([]);
  });

  it('uses the normal descriptor/schema/hash/identity path before monitored events', async () => {
    const root = await tempRoot();
    const merge = await merged(root);
    const files = await releaseFiles(root);
    const result = await verifyReleasedArtifact({
      repoRoot: root, merge, admitted: { ...admitted(), databaseSha256: files.provenance.databaseSha256! }, provenance: files.provenance,
      descriptorPath: files.descriptorPath, databasePath: files.databasePath,
      linkedCases: [reviewCase('merged')], reviewer: 'monitor reviewer', observedAt: AT, git: releaseResolver(root),
    });
    expect(result.status).toBe('MONITORED');
    expect(result.events).toMatchObject([{ state: 'monitored' }]);

    const duplicate = await verifyReleasedArtifact({
      repoRoot: root, merge, admitted: { ...admitted(), databaseSha256: files.provenance.databaseSha256! }, provenance: files.provenance,
      descriptorPath: files.descriptorPath, databasePath: files.databasePath,
      linkedCases: [reviewCase('monitored')], reviewer: 'monitor reviewer', observedAt: AT, git: releaseResolver(root),
    });
    expect(duplicate.events).toEqual([]);
    expect(duplicate.digest).toBe(result.digest);
  });

  it('rejects wrong identity and release-blocked descriptors, and reports unavailable release work honestly', async () => {
    const root = await tempRoot();
    const merge = await merged(root);
    const files = await releaseFiles(root);
    await expect(verifyReleasedArtifact({
      repoRoot: root, merge, admitted: { ...admitted(), databaseSha256: files.provenance.databaseSha256!, layerFingerprint: C }, provenance: files.provenance,
      descriptorPath: files.descriptorPath, databasePath: files.databasePath,
      linkedCases: [reviewCase('merged')], reviewer: 'r', observedAt: AT, git: releaseResolver(root),
    })).rejects.toMatchObject({ code: 'RELEASE_IDENTITY_MISMATCH' });

    const descriptor = JSON.parse(await import('node:fs/promises').then(({ readFile }) => readFile(files.descriptorPath, 'utf8')));
    await writeFile(files.descriptorPath, JSON.stringify({ ...descriptor, stale: { since: AT, reason: 'not released', blocksRelease: true } }));
    const blockedBytes = await import('node:fs/promises').then(({ readFile }) => readFile(files.descriptorPath));
    const blockedProvenance = releaseProvenance({ descriptorSha256: sha(blockedBytes), databaseSha256: files.provenance.databaseSha256 });
    await expect(verifyReleasedArtifact({
      repoRoot: root, merge, admitted: { ...admitted(), databaseSha256: files.provenance.databaseSha256! }, provenance: blockedProvenance,
      descriptorPath: files.descriptorPath, databasePath: files.databasePath,
      linkedCases: [reviewCase('merged')], reviewer: 'r', observedAt: AT, git: releaseResolver(root),
    })).rejects.toMatchObject({ code: 'UNRELEASED_DESCRIPTOR' });

    const unavailable = releaseProvenance({
      status: 'NOT_RUN', machineReason: 'REAL_RELEASE_ARTIFACT_UNAVAILABLE', independentlyReviewed: false,
      reviewer: null, reviewedAt: null, releaseCommit: null, releaseTree: null,
      descriptorSha256: null, databaseSha256: null, engineVersion: null, corpusFingerprint: null, layerFingerprint: null,
    });
    const notRun = await verifyReleasedArtifact({
      repoRoot: root, merge, admitted: admitted(), provenance: unavailable, descriptorPath: 'not-read', databasePath: 'not-read',
      linkedCases: [reviewCase('merged')], reviewer: 'r', observedAt: AT,
    });
    expect(notRun).toMatchObject({ status: 'NOT_RUN', machineReason: 'REAL_RELEASE_ARTIFACT_UNAVAILABLE', events: [] });
  });

  it('rejects an unrelated or tree-mismatched well-formed release commit before reading it as shipped evidence', async () => {
    const root = await tempRoot();
    const merge = await merged(root);
    const files = await releaseFiles(root);
    const common = {
      repoRoot: root, merge, admitted: { ...admitted(), databaseSha256: files.provenance.databaseSha256! }, provenance: files.provenance,
      descriptorPath: files.descriptorPath, databasePath: files.databasePath,
      linkedCases: [reviewCase('merged')], reviewer: 'r', observedAt: AT,
    };
    await expect(verifyReleasedArtifact({ ...common, git: releaseResolver(root, { descendsFromAdmittedMain: false }) }))
      .rejects.toMatchObject({ code: 'UNRELATED_RELEASE_COMMIT' });
    await expect(verifyReleasedArtifact({ ...common, git: releaseResolver(root, { releaseTree: '9'.repeat(40) }) }))
      .rejects.toMatchObject({ code: 'UNRELATED_RELEASE_COMMIT' });
  });
});

describe('privacy-safe affected telemetry comparison', () => {
  it('reports pre/post denominators, zero-result, weak-conversion and converted-rank outcomes deterministically', () => {
    const preAudit = A;
    const postAudit = B;
    const preReceipt = closedReceipt(preAudit, '2026-Q2');
    const postReceipt = closedReceipt(postAudit, '2026-Q3');
    const before = cluster(AGGREGATE_ID, preAudit, '2026-Q2');
    const after = cluster(AGGREGATE_ID, postAudit, '2026-Q3', {
      totalSearches: 120, zeroResultSearches: 12, weakConversionSearches: 18,
      convertedRankCounts: [{ convertedRank: 5, count: 10 }, { convertedRank: 1, count: 50 }],
    });
    const first = compareAffectedTelemetryClusters({ pre: [before], post: [after], affectedAggregateIds: [AGGREGATE_ID], preReceipt, postReceipt, preApprovedIds: approvedIds(preAudit, calculateClosedTelemetryAuditReceiptDigest(preReceipt)), postApprovedIds: approvedIds(postAudit, calculateClosedTelemetryAuditReceiptDigest(postReceipt)) });
    const second = compareAffectedTelemetryClusters({ pre: [before], post: [after], affectedAggregateIds: [AGGREGATE_ID], preReceipt, postReceipt, preApprovedIds: approvedIds(preAudit, calculateClosedTelemetryAuditReceiptDigest(preReceipt)), postApprovedIds: approvedIds(postAudit, calculateClosedTelemetryAuditReceiptDigest(postReceipt)) });
    expect(first).toEqual(second);
    expect(first.outcomes[0]).toMatchObject({
      pre: { denominator: 100, zeroResults: 20, weakConversions: 30 },
      post: { denominator: 120, zeroResults: 12, weakConversions: 18 }, sparse: false,
    });
    expect(JSON.stringify(first)).not.toContain('approved aggregate display only');
  });

  it('labels sparse evidence without implying significance', () => {
    const preReceipt = closedReceipt(A, '2026-Q2');
    const postReceipt = closedReceipt(B, '2026-Q3');
    const result = compareAffectedTelemetryClusters({
      pre: [cluster(AGGREGATE_ID, A, '2026-Q2', { totalSearches: 4, zeroResultSearches: 1, weakConversionSearches: 1, convertedRankCounts: [{ convertedRank: 1, count: 2 }] })],
      post: [cluster(AGGREGATE_ID, B, '2026-Q3', { totalSearches: 5, zeroResultSearches: 0, weakConversionSearches: 1, convertedRankCounts: [{ convertedRank: 1, count: 3 }] })],
      affectedAggregateIds: [AGGREGATE_ID], preReceipt, postReceipt,
      preApprovedIds: approvedIds(A, calculateClosedTelemetryAuditReceiptDigest(preReceipt)),
      postApprovedIds: approvedIds(B, calculateClosedTelemetryAuditReceiptDigest(postReceipt)), sparseThreshold: 20,
    });
    expect(result.outcomes[0]?.sparse).toBe(true);
    expect(result.outcomes[0]?.context).toContain('Directional context only');
  });

  it('rejects raw, suppressed, below-threshold, wrong-audit and missing aggregate evidence', () => {
    const preReceipt = closedReceipt(A, '2026-Q2');
    const postReceipt = closedReceipt(B, '2026-Q3');
    const raw = { ...cluster(AGGREGATE_ID, A, '2026-Q2'), rawQuery: 'HIDDEN-CANARY' } as PrivacySafeTelemetryCluster;
    const invoke = (pre: readonly PrivacySafeTelemetryCluster[], post = [cluster(AGGREGATE_ID, B, '2026-Q3')]) => compareAffectedTelemetryClusters({
      pre, post, affectedAggregateIds: [AGGREGATE_ID], preReceipt, postReceipt,
      preApprovedIds: approvedIds(A, calculateClosedTelemetryAuditReceiptDigest(preReceipt)),
      postApprovedIds: approvedIds(B, calculateClosedTelemetryAuditReceiptDigest(postReceipt)),
    });
    expect(() => invoke([raw])).toThrowError(expect.objectContaining({ code: 'PRIVATE_TELEMETRY_FIELD' }));
    expect(() => invoke([{ ...cluster(AGGREGATE_ID, A, '2026-Q2'), aboveThreshold: false } as unknown as PrivacySafeTelemetryCluster])).toThrowError(expect.objectContaining({ code: 'BELOW_THRESHOLD_TELEMETRY' }));
    expect(() => invoke([cluster(AGGREGATE_ID, C, '2026-Q2')])).toThrowError(expect.objectContaining({ code: 'AUDIT_IDENTITY_MISMATCH' }));
    expect(() => invoke([cluster(sha('different'), A, '2026-Q2')])).toThrowError(expect.objectContaining({ code: 'AUDIT_IDENTITY_MISMATCH' }));
    const canaryAggregate = cluster('HIDDEN-CANARY', A, '2026-Q2') as PrivacySafeTelemetryCluster;
    let canaryError = '';
    try { invoke([canaryAggregate]); } catch (error) { canaryError = JSON.stringify(error); }
    expect(canaryError).not.toContain('HIDDEN-CANARY');
    const hiddenApproval = cluster(AGGREGATE_ID, A, '2026-Q2', { approvalId: 'suppressed-query-canary' });
    expect(() => invoke([hiddenApproval])).toThrowError(expect.objectContaining({ code: 'PRIVATE_TELEMETRY_VALUE' }));
    const hiddenRosterBasis = {
      schemaVersion: 1 as const, auditDigest: A, receiptDigest: calculateClosedTelemetryAuditReceiptDigest(preReceipt), aggregateIds: [AGGREGATE_ID],
      approvalIds: [PRE_APPROVAL_ID], generatedTelemetryCaseIds: ['raw-query-canary'],
    };
    const hiddenRoster = { ...hiddenRosterBasis, digest: calculateApprovedTelemetryAuditIdsDigest(hiddenRosterBasis) };
    expect(() => compareAffectedTelemetryClusters({
      pre: [cluster(AGGREGATE_ID, A, '2026-Q2')], post: [cluster(AGGREGATE_ID, B, '2026-Q3')],
      affectedAggregateIds: [AGGREGATE_ID], preReceipt, postReceipt, preApprovedIds: hiddenRoster,
      postApprovedIds: approvedIds(B, calculateClosedTelemetryAuditReceiptDigest(postReceipt)),
    })).toThrowError(expect.objectContaining({ code: 'PRIVATE_TELEMETRY_VALUE' }));
  });
});

describe('interruption recovery orchestration', () => {
  it('covers every interruption and never authorizes repeating an irreversible action', () => {
    const outcomes = RECOVERY_OPERATIONS.map((operation) => recovery(operation));
    expect(outcomes.map((entry) => entry.operation)).toEqual(RECOVERY_OPERATIONS);
    expect(outcomes.every((entry) => entry.mayRepeatIrreversibleAction === false)).toBe(true);
    expect(outcomes.find((entry) => entry.operation === 'push')).toMatchObject({ action: 'ALREADY_COMPLETE' });
    expect(outcomes.filter((entry) => ['audit-import', 'source-apply-admission'].includes(entry.operation)).every((entry) => entry.action === 'RECOVER_JOURNAL')).toBe(true);
  });

  it('forces rebuild/review and worktree re-preparation when main moves', () => {
    for (const operation of RECOVERY_OPERATIONS) {
      expect(recovery(operation, { currentMainCommit: '9'.repeat(40), journalRecoverable: true,
        remoteIdempotencyProof: { checked: true, branchCommit: COMMIT, draftPrHeadCommit: COMMIT } }))
        .toMatchObject({ action: 'REBUILD_REVIEW_REQUIRED', machineReason: 'MAIN_MOVED_REBUILD_REVIEW_REQUIRED' });
    }
  });

  it('places every stale revalidation dimension ahead of every journal/completion claim at every stage', () => {
    const staleVariants: readonly Partial<RecoveryObservation>[] = [
      { currentMainVerified: false }, { evidenceRevalidated: false }, { evidenceDigest: D },
      { preconditionsRevalidated: false }, { preconditionsValid: false }, { preconditionsDigest: D },
      { targetIdentityVerified: false }, { targetIdentityDigest: D },
      { remoteIdempotencyProof: { checked: false, branchCommit: COMMIT, draftPrHeadCommit: COMMIT } as unknown as RecoveryObservation['remoteIdempotencyProof'] },
    ];
    for (const operation of RECOVERY_OPERATIONS) {
      for (const stale of staleVariants) {
        expect(recovery(operation, { ...stale, journalRecoverable: true,
          ...(stale.remoteIdempotencyProof ? {} : { remoteIdempotencyProof: { checked: true, branchCommit: COMMIT, draftPrHeadCommit: COMMIT } }) }))
          .toMatchObject({ action: 'REBUILD_REVIEW_REQUIRED', machineReason: 'STALE_EVIDENCE_REBUILD_REVIEW_REQUIRED' });
      }
    }
  });

  it('requires human confirmation after an unproven push and restarts degraded without a verified descriptor', () => {
    expect(recovery('push', { remoteIdempotencyProof: { checked: true, branchCommit: '9'.repeat(40), draftPrHeadCommit: null } })).toMatchObject({ action: 'HUMAN_CONFIRMATION_REQUIRED', requiresHumanApproval: true, mayRepeatIrreversibleAction: false });
    const draftCheckpoint: RecoveryCheckpoint = {
      schemaVersion: 1, operation: 'push', operationId: 'draft-pr-1', phase: 'draft-pr', expectedMainCommit: MAIN,
      evidenceDigest: A, preconditionsDigest: B, targetIdentityDigest: C, expectedRemoteCommit: COMMIT, irreversibleAttempted: true,
    };
    const draftObservation: RecoveryObservation = {
      currentMainCommit: MAIN, currentMainVerified: true, evidenceDigest: A, evidenceRevalidated: true,
      preconditionsDigest: B, preconditionsRevalidated: true, preconditionsValid: true,
      targetIdentityDigest: C, targetIdentityVerified: true,
      journalRecoverable: false, remoteIdempotencyProof: { checked: true, branchCommit: COMMIT, draftPrHeadCommit: null },
      descriptorAvailable: true, descriptorVerified: true,
    };
    expect(recoverInterruptedOperation(draftCheckpoint, draftObservation)).toMatchObject({ action: 'HUMAN_CONFIRMATION_REQUIRED', machineReason: 'IRREVERSIBLE_REMOTE_OUTCOME_UNPROVEN' });
    expect(recovery('server-restart', { descriptorAvailable: false, descriptorVerified: false })).toMatchObject({ action: 'RESTART_DEGRADED', machineReason: 'DESCRIPTOR_UNAVAILABLE' });
  });
});

describe('v2.5 deterministic stabilization report', () => {
  async function monitoredRelease(root: string): Promise<{ merge: MergeDetection; release: ReleaseMonitoringResult }> {
    const merge = await merged(root);
    const files = await releaseFiles(root);
    const release = await verifyReleasedArtifact({
      repoRoot: root, merge, admitted: { ...admitted(), databaseSha256: files.provenance.databaseSha256! }, provenance: files.provenance,
      descriptorPath: files.descriptorPath, databasePath: files.databasePath,
      linkedCases: [reviewCase('merged')], reviewer: 'monitor reviewer', observedAt: AT, git: releaseResolver(root),
    });
    return { merge, release };
  }

  it('binds the synthetic privacy-safe refinement lifecycle while keeping external human gates explicit', async () => {
    const root = await tempRoot();
    const { merge, release } = await monitoredRelease(root);
    const auditReceipt = closedReceipt();
    const preReceipt = closedReceipt(A, '2026-Q2');
    const approvedAuditIds = approvedIds(B, calculateClosedTelemetryAuditReceiptDigest(auditReceipt));
    const telemetry = compareAffectedTelemetryClusters({
      pre: [cluster(AGGREGATE_ID, A, '2026-Q2')], post: [cluster(AGGREGATE_ID, B, '2026-Q3')],
      affectedAggregateIds: [AGGREGATE_ID], preReceipt, postReceipt: auditReceipt,
      preApprovedIds: approvedIds(A, calculateClosedTelemetryAuditReceiptDigest(preReceipt)), postApprovedIds: approvedAuditIds,
    });
    const proofBasis = { auditDigest: B, checkedAt: AT, selectedDumpCount: 3, remainingDumpCount: 0 as const };
    const closedDumpProof = { ...proofBasis, proofDigest: calculateClosedDumpProofDigest(proofBasis) };
    const externalGates = [
      { gate: 'merge' as const, status: 'PASSED' as const, machineReason: 'HUMAN_MERGE_OBSERVED' },
      { gate: 'release' as const, status: 'PASSED' as const, machineReason: 'INDEPENDENT_RELEASE_VERIFIED' },
      { gate: 'consumer-update' as const, status: 'NOT_RUN' as const, machineReason: 'EXPLICIT_HUMAN_GATE_PENDING' },
      { gate: 'real-telemetry-audit' as const, status: 'BLOCKED' as const, machineReason: 'SYNTHETIC_AUDIT_ONLY' },
    ];
    const quality = dashboard();
    const input = {
      generatedAt: AT, merge, release, telemetry, auditReceipt, approvedAuditIds, closedDumpProof,
      calibrationSession: completedSession('calibration', merge, quality),
      holdoutSession: completedSession('holdout', merge, quality), dashboard: quality,
      admission: stabilizationAdmission(),
      draftPr: prepared(), recoveryOutcomes: RECOVERY_OPERATIONS.map((operation) => recovery(operation)), externalGates,
    };
    const first = buildStabilizationReport(input);
    const second = buildStabilizationReport({ ...input, recoveryOutcomes: [...input.recoveryOutcomes].reverse(), externalGates: [...externalGates].reverse() });
    expect(first).toEqual(second);
    expect(first.releaseReady).toBe(false);
    expect(first.partitions.calibration.sessionId).not.toBe(first.partitions.holdout.sessionId);
    expect(first.partitions.holdout).toMatchObject({ opaqueMembership: true });
    expect(first.externalGates).toEqual(expect.arrayContaining([
      expect.objectContaining({ gate: 'consumer-update', status: 'NOT_RUN' }),
      expect.objectContaining({ gate: 'real-telemetry-audit', status: 'BLOCKED' }),
    ]));
    const serialized = JSON.stringify(first);
    expect(serialized).not.toContain('HIDDEN-CANARY');
    expect(serialized).not.toContain('approved aggregate display only');
    const passed = buildStabilizationReport({
      ...input,
      externalGates: externalGates.map((gate) => ({ ...gate, status: 'PASSED' as const, machineReason: 'INDEPENDENT_HUMAN_GATE_PASSED' })),
    });
    expect(passed.releaseReady).toBe(true);
  });

  it('rejects partition mixing, open audits, missing recovery coverage, and unstable evidence', async () => {
    const root = await tempRoot();
    const { merge, release } = await monitoredRelease(root);
    const auditReceipt = closedReceipt();
    const approvedAuditIds = approvedIds(B, calculateClosedTelemetryAuditReceiptDigest(auditReceipt));
    const proofBasis = { auditDigest: B, checkedAt: AT, selectedDumpCount: 1, remainingDumpCount: 0 as const };
    const base = {
      generatedAt: AT, merge, release, telemetry: null,
      auditReceipt, approvedAuditIds,
      closedDumpProof: { ...proofBasis, proofDigest: calculateClosedDumpProofDigest(proofBasis) },
      calibrationSession: completedSession('calibration', merge, dashboard()), holdoutSession: completedSession('holdout', merge, dashboard()), dashboard: dashboard(),
      admission: stabilizationAdmission(),
      draftPr: prepared(), recoveryOutcomes: RECOVERY_OPERATIONS.map((operation) => recovery(operation)),
      externalGates: [
        { gate: 'merge' as const, status: 'PASSED' as const, machineReason: 'ok' },
        { gate: 'release' as const, status: 'PASSED' as const, machineReason: 'ok' },
        { gate: 'consumer-update' as const, status: 'NOT_RUN' as const, machineReason: 'pending' },
        { gate: 'real-telemetry-audit' as const, status: 'NOT_RUN' as const, machineReason: 'pending' },
      ],
    };
    expect(() => buildStabilizationReport({ ...base, holdoutSession: base.calibrationSession })).toThrowError(expect.objectContaining({ code: 'SESSION_BINDING_MISMATCH' }));
    expect(() => buildStabilizationReport({ ...base, auditReceipt: { ...base.auditReceipt, status: 'applied' as const } })).toThrowError(expect.objectContaining({ code: 'AUDIT_NOT_CLOSED' }));
    expect(() => buildStabilizationReport({ ...base, recoveryOutcomes: base.recoveryOutcomes.slice(1) })).toThrowError(expect.objectContaining({ code: 'RECOVERY_COVERAGE_INCOMPLETE' }));
    expect(() => buildStabilizationReport({ ...base, draftPr: { ...prepared(), treeHash: '9'.repeat(40) } })).toThrowError(expect.objectContaining({ code: 'DRAFT_PR_BINDING_MISMATCH' }));
    expect(() => buildStabilizationReport({ ...base, calibrationSession: { ...base.calibrationSession, digest: D } })).toThrowError(expect.objectContaining({ code: 'SESSION_INTEGRITY_INVALID' }));
    expect(() => buildStabilizationReport({ ...base, calibrationSession: completedSession('calibration', merge, dashboard('2026-09')) })).toThrowError(expect.objectContaining({ code: 'SESSION_BINDING_MISMATCH' }));
    expect(() => buildStabilizationReport({ ...base, holdoutSession: completedSession('holdout', merge, dashboard('2026-08', C)) })).toThrowError(expect.objectContaining({ code: 'SESSION_BINDING_MISMATCH' }));

    const zeroReceipt = { ...auditReceipt, candidateCaseCount: 0 };
    expect(() => buildStabilizationReport({
      ...base, auditReceipt: zeroReceipt,
      approvedAuditIds: approvedIds(B, calculateClosedTelemetryAuditReceiptDigest(zeroReceipt)),
    })).toThrowError(expect.objectContaining({ code: 'AUDIT_ALLOWLIST_RECEIPT_MISMATCH' }));

    const unrelatedRoster = approvedIds(B, calculateClosedTelemetryAuditReceiptDigest(auditReceipt), [AGGREGATE_ID], [POST_APPROVAL_ID], [OTHER_CASE_ID]);
    expect(() => buildStabilizationReport({ ...base, approvedAuditIds: unrelatedRoster }))
      .toThrowError(expect.objectContaining({ code: 'AUDIT_ALLOWLIST_RECEIPT_MISMATCH' }));
    expect(() => buildStabilizationReport({ ...base, admission: { ...stabilizationAdmission(), linkedCaseIds: [OTHER_CASE_ID] } }))
      .toThrowError(expect.objectContaining({ code: 'ADMISSION_BINDING_MISMATCH' }));
  });
});
