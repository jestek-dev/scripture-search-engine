import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';
import { afterEach, describe, expect, it } from 'vitest';

import type { Distillate } from '../../pipeline/src/telemetry/index.js';
import { buildQualityDashboard, type QualityDashboardInput } from '../src/qualityDashboard.js';
import { StudioOperations, StudioOperationsError } from '../src/studioOperations.js';
import type { ReviewSessionCase } from '../src/reviewSessions.js';

const roots: string[] = [];
const identity = { engineVersion: 'studio-engine', corpusFingerprint: 'a'.repeat(64), layerFingerprint: 'b'.repeat(64) };
const candidate = { artifactId: 'candidate', descriptorSha256: 'c'.repeat(64), ...identity };
const current = { artifactId: 'current', descriptorSha256: 'd'.repeat(64), engineVersion: 'studio-engine-old', corpusFingerprint: 'e'.repeat(64), layerFingerprint: 'f'.repeat(64) };

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function engine(): ScriptureEngine {
  return {
    ...identity,
    async research(query: string) { return { kind: 'discovery', query, ...identity, results: [] }; },
    async themes() { return []; },
    async passage() { throw new Error('not used'); },
    async related() { throw new Error('not used'); },
    async forSong() { throw new Error('not used'); },
    async close() {},
  } as ScriptureEngine;
}

function cases(): ReviewSessionCase[] {
  return [
    { caseId: 'case-a', query: 'hope in God', source: 'manual', outcomeClass: 'failure', deviceCount: 3, convertedRank: 4, recurrence: 2, createdAt: '2026-07-01T12:00:00.000Z' },
    { caseId: 'case-b', query: 'refuge in trouble', source: 'coverage', outcomeClass: 'ambiguous', deviceCount: 1, convertedRank: null, recurrence: 1, createdAt: '2026-07-02T12:00:00.000Z' },
    { caseId: 'case-c', query: 'hearing and doing', source: 'gauntlet', outcomeClass: 'regressed', deviceCount: 5, convertedRank: 8, recurrence: 3, createdAt: '2026-07-03T12:00:00.000Z', sensitivityCategory: 'pastoral' },
    { caseId: 'holdout-secret-a', query: 'private benchmark alpha', source: 'manual', outcomeClass: 'failure', deviceCount: 0, convertedRank: null, recurrence: 1, createdAt: '2026-07-04T12:00:00.000Z', holdout: true },
    { caseId: 'holdout-secret-b', query: 'private benchmark beta', source: 'manual', outcomeClass: 'failure', deviceCount: 0, convertedRank: null, recurrence: 1, createdAt: '2026-07-05T12:00:00.000Z', holdout: true },
  ];
}

function qualityInput(): QualityDashboardInput {
  const scope = { artifact: candidate, reviewCycleId: 'cycle-1' };
  const observation = (recordId: string, caseId: string, partition: 'calibration' | 'holdout') => ({
    recordId, caseId, partition, essentialTargetIds: ['A'], irrelevantTargetIds: ['X'], currentTop10TargetIds: ['A'], candidateTop10TargetIds: ['A'], ...scope,
  });
  const telemetry = (partition: 'calibration' | 'holdout', artifactRole: 'current' | 'candidate') => ({
    aggregateId: `aggregate-${partition}-${artifactRole}`, approvalId: `audit-${partition}-${artifactRole}`, partition, artifactRole,
    totalSearches: 10, zeroResultSearches: 1, weakConversionSearches: 1, convertedRankCounts: [{ convertedRank: 1, count: 4 }],
    artifact: artifactRole === 'candidate' ? candidate : current, reviewCycleId: 'cycle-1',
  });
  return {
    schemaVersion: 1,
    artifact: candidate,
    referenceArtifact: current,
    reviewCycle: { cycleId: 'cycle-1' },
    observedAt: '2026-08-11T12:00:00.000Z',
    sparseSampleThreshold: 20,
    benchmarkObservations: [observation('cal-record', 'cal-case', 'calibration'), observation('hold-record', 'holdout-secret-a', 'holdout')],
    blindComparisons: [],
    telemetryAggregates: [telemetry('calibration', 'current'), telemetry('calibration', 'candidate'), telemetry('holdout', 'current'), telemetry('holdout', 'candidate')],
    coverageRecords: [{ recordId: 'coverage-a', kind: 'concept', entityId: 'hope', state: 'active', ...scope }],
    caseLifecycles: [{ recordId: 'life-a', caseId: 'cal-case', opened: true, resolution: 'unresolved', ...scope }],
    admissions: [],
    requiredGateEvaluations: [{ recordId: 'gate-hold', gateId: 'holdout-gate', partition: 'holdout', required: true, currentPass: true, candidatePass: false, ...scope }],
    artifactGenealogy: [
      { artifact: current, reviewCycleId: 'cycle-0', observedAt: '2026-08-01T12:00:00.000Z', parent: null },
      { artifact: candidate, reviewCycleId: 'cycle-1', observedAt: '2026-08-11T12:00:00.000Z', parent: { artifact: current, reviewCycleId: 'cycle-0' } },
    ],
    trendHistory: [],
  };
}

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'studio-operations-'));
  roots.push(root);
  let sessionIndex: any = { schemaVersion: 1, sessions: [] };
  let auditStatus: 'applied' | 'closed' = 'applied';
  const auditDigest = '9'.repeat(64);
  const auditPreview: any = {
    schemaVersion: 1, repoRoot: root, status: 'ready', pendingRecordPath: 'workbench/.telemetry-audits/pending.json', pendingRecordSha256: '8'.repeat(64), masterRecordPath: 'workbench/.telemetry-audits/master-record.json', caseEventsPath: 'workbench/cases.jsonl', preconditions: { masterSha256: null, casesSha256: null, receiptSha256: null },
    summary: { auditDigest, distillateCount: 1, schemaVersions: [1], period: '2026-Q3', distinctAuditTokens: 1, suppression: { belowThreshold: 1, sensitiveExcluded: 1 }, excludedEvidence: { rankMismatch: 0, unreplayable: 0 }, candidateCaseCount: 1, candidateCases: [{ candidateKey: 'safe-candidate', query: 'approved aggregate query', verdict: 'MISS', devices: 3 }] },
  };
  const operations = new StudioOperations({
    repoRoot: root,
    engines: [engine()],
    budgets: { minDistinctDevices: 3, rawRetentionDays: 90, weakConvertedRank: 3 },
    categories: { v: 1, categories: [{ id: 'sensitive', entries: [{ phrase: 'private sensitive canary' }] }] },
    cases,
    qualityReport: () => buildQualityDashboard(qualityInput()),
    repositoryStateDigest: () => '1'.repeat(64),
    artifactStateDigest: () => '2'.repeat(64),
    now: () => '2026-08-11T12:00:00.000Z',
    persistence: {
      recoverAudits: async () => {}, previewAudit: async () => auditPreview,
      applyAudit: async () => ({ receipt: { auditDigest, status: auditStatus }, idempotent: false } as any),
      closeAudit: async () => { auditStatus = 'closed'; return { receipt: { auditDigest, status: auditStatus }, idempotent: false } as any; },
      readSessions: async () => sessionIndex,
      writeSessions: async (before, after) => { if (before !== sessionIndex) throw new Error('session conflict'); sessionIndex = after; },
    },
  });
  await operations.ready();
  return { root, operations };
}

function auditFile(): { filename: string; size: number; contentBase64: string } {
  const row = (query: string): Distillate['queries'][number] => ({ query, identity, outcomes: { empty: 0, abandoned: 1, converted: 0 }, conversions: [] });
  const value: Distillate = {
    v: 1,
    app: 'maskil',
    period: '2026-Q3',
    token: 'opaque-private-token',
    queries: [row('approved aggregate query'), row('below threshold private canary'), row('private sensitive canary')],
    pairs: [],
  };
  const bytes = Buffer.from(JSON.stringify(value), 'utf8');
  return { filename: 'distillate-a.json', size: bytes.length, contentBase64: bytes.toString('base64') };
}

describe('StudioOperations', () => {
  it('previews, applies, and closes M11 audits without returning paths, tokens, or suppressed strings', async () => {
    const { root, operations } = await fixture();
    const preview = await operations.previewAudit({ files: [auditFile()] });
    const previewText = JSON.stringify(preview);
    expect(preview).toMatchObject({ status: 'ready', revision: 0, opaqueTokenCount: 1, dumpDeleted: false });
    expect(previewText).not.toContain(root);
    expect(previewText).not.toContain('opaque-private-token');
    expect(previewText).not.toContain('below threshold private canary');
    expect(previewText).not.toContain('private sensitive canary');

    const applied = await operations.applyAudit({ auditDigest: preview.auditDigest, previewDigest: preview.previewDigest, expectedRevision: 0 });
    expect(applied).toMatchObject({ status: 'applied', revision: 1 });
    const closed = await operations.closeAudit({ auditDigest: applied.auditDigest, previewDigest: applied.previewDigest, expectedRevision: 1 });
    expect(closed).toMatchObject({ status: 'closed', revision: 2, dumpDeleted: true });
    expect(JSON.stringify(closed)).not.toContain('private canary');
  });

  it('rejects malformed browser file envelopes before creating an audit preview', async () => {
    const { operations } = await fixture();
    await expect(operations.previewAudit({ files: [{ ...auditFile(), filename: '../raw.json' }] })).rejects.toMatchObject({ code: 'invalid_upload' });
    await expect(operations.previewAudit({ files: [{ ...auditFile(), size: 1 }] })).rejects.toMatchObject({ code: 'invalid_upload' });
    await expect(operations.previewAudit({ files: [auditFile()], path: 'C:\\secret' })).rejects.toBeInstanceOf(StudioOperationsError);
  });

  it('persists deterministic session order and enforces skip, resume, and completion preconditions', async () => {
    const { operations } = await fixture();
    let session = await operations.startSession({ kind: 'weekly-triage', reviewedSize: 3, seed: 'seed-one', reviewer: 'reviewer:lee', qualifiedReviewer: true });
    expect(session.progress).toEqual({ handled: 0, total: 3, remaining: 3 });
    const order = session.queue!.map((item) => item.itemId);
    session = await operations.mutateSession(session.sessionId!, 'skip-item', {
      requestId: 'skip:00000000-0000-4000-8000-000000000001', expectedRevision: session.revision, expectedDigest: session.digest,
      itemId: order[0], reason: 'needs-context', requeue: 'next-session',
    });
    expect(session.queue![0]).toMatchObject({ state: 'skipped', skip: { requeue: 'next-session' } });
    session = await operations.mutateSession(session.sessionId!, 'complete-item', {
      requestId: 'complete:00000000-0000-4000-8000-000000000002', expectedRevision: session.revision, expectedDigest: session.digest, itemId: order[1],
    });
    session = await operations.mutateSession(session.sessionId!, 'complete-item', {
      requestId: 'complete:00000000-0000-4000-8000-000000000003', expectedRevision: session.revision, expectedDigest: session.digest, itemId: order[2],
    });
    session = await operations.mutateSession(session.sessionId!, 'complete-session', {
      requestId: 'finish:00000000-0000-4000-8000-000000000004', expectedRevision: session.revision, expectedDigest: session.digest,
    });
    expect(session.status).toBe('completed');
    expect((await operations.getSession(session.sessionId!)).queue!.map((item) => item.itemId)).toEqual(order);
  });

  it('keeps holdout membership opaque unless the explicit authorized review flow is used', async () => {
    const { operations } = await fixture();
    await expect(operations.startSession({ kind: 'holdout', reviewedSize: 2, seed: 'holdout-seed', reviewer: 'reviewer:lee', qualifiedReviewer: true })).rejects.toMatchObject({ code: 'holdout_authorization_required' });
    const authorized = await operations.startSession({ kind: 'holdout', reviewedSize: 2, seed: 'holdout-seed', reviewer: 'reviewer:lee', qualifiedReviewer: true, authorizedHoldoutReview: true });
    expect(authorized.queue).toHaveLength(2);
    expect(JSON.stringify(authorized)).not.toContain('holdout-secret-');
    const publicView = await operations.getSession(authorized.sessionId!, false);
    expect(publicView).toEqual(expect.objectContaining({ kind: 'holdout', opaqueMembership: true }));
    expect(publicView).not.toHaveProperty('sessionId');
    expect(publicView).not.toHaveProperty('progress');
  });

  it('returns every M13 family while withholding holdout identities and full authorized digests', async () => {
    const { operations } = await fixture();
    const quality = await operations.quality();
    const text = JSON.stringify(quality);
    expect(quality.candidateImprovement).toMatchObject({ verdict: 'review-required', blocked: true });
    expect(quality.partitions.calibration.length).toBeGreaterThan(0);
    expect(quality.partitions.holdout.length).toBeGreaterThan(0);
    expect(quality.telemetry.calibration.length).toBeGreaterThan(0);
    expect(quality.requiredGates.holdout.length).toBeGreaterThan(0);
    expect(quality).toHaveProperty('coverage');
    expect(quality).toHaveProperty('cases');
    expect(quality).toHaveProperty('trends');
    expect(text).toContain('cal-case');
    expect(text).not.toContain('holdout-secret-a');
    expect(text).not.toContain('authorizedReportDigest');
    expect(quality.holdout).toEqual({ membershipOpaque: true, drillLinksAvailable: false });
  });
});
