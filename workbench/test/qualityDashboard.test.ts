import { describe, expect, it } from 'vitest';

import {
  QualityDashboardValidationError,
  assertQualityDashboardIntegrity,
  buildQualityDashboard,
  calculateAdmissionRedactedDigest,
  calculateProposalGenerationRedactedDigest,
  proposalGenerationQualityDashboardView,
  qualityDashboardAdmissionProjection,
  qualityDashboardAuthorizedAuditProjection,
  type ArtifactIdentity,
  type BenchmarkObservation,
  type QualityDashboardInput,
  type TelemetryAggregate,
} from '../src/qualityDashboard.js';

const candidate: ArtifactIdentity = { artifactId: 'candidate-a', descriptorSha256: 'a'.repeat(64), engineVersion: 'engine-2', corpusFingerprint: 'corpus-2', layerFingerprint: 'layer-2' };
const current: ArtifactIdentity = { artifactId: 'current-a', descriptorSha256: 'b'.repeat(64), engineVersion: 'engine-1', corpusFingerprint: 'corpus-1', layerFingerprint: 'layer-1' };
const foreign: ArtifactIdentity = { artifactId: 'foreign-a', descriptorSha256: 'c'.repeat(64), engineVersion: 'engine-x', corpusFingerprint: 'corpus-x', layerFingerprint: 'layer-x' };

function candidateScope() { return { artifact: candidate, reviewCycleId: 'cycle-1' }; }

function telemetry(partition: 'calibration' | 'holdout', artifactRole: 'current' | 'candidate', overrides: Partial<TelemetryAggregate> = {}): TelemetryAggregate {
  return {
    aggregateId: `aggregate-${partition}-${artifactRole}`, approvalId: `audit-${partition}-${artifactRole}`, partition, artifactRole,
    totalSearches: 10, zeroResultSearches: 1, weakConversionSearches: 1,
    convertedRankCounts: [{ convertedRank: 1, count: 4 }, { convertedRank: 2, count: 2 }],
    artifact: artifactRole === 'candidate' ? candidate : current, reviewCycleId: 'cycle-1', ...overrides,
  };
}

function input(overrides: Partial<QualityDashboardInput> = {}): QualityDashboardInput {
  return {
    schemaVersion: 1, artifact: candidate, referenceArtifact: current, reviewCycle: { cycleId: 'cycle-1' }, observedAt: '2026-08-11T12:00:00.000Z', sparseSampleThreshold: 2,
    benchmarkObservations: [
      { recordId: 'obs-cal-1', caseId: 'cal-1', partition: 'calibration', essentialTargetIds: ['A'], irrelevantTargetIds: ['X'], currentTop10TargetIds: ['A', 'X'], candidateTop10TargetIds: ['A', 'X'], ...candidateScope() },
      { recordId: 'obs-cal-2', caseId: 'cal-2', partition: 'calibration', essentialTargetIds: ['B'], irrelevantTargetIds: ['Y'], currentTop10TargetIds: ['B', 'Y'], candidateTop10TargetIds: ['B', 'Y'], ...candidateScope() },
      { recordId: 'obs-hold-1', caseId: 'hold-1', partition: 'holdout', essentialTargetIds: ['H'], irrelevantTargetIds: ['X'], currentTop10TargetIds: ['H', 'X'], candidateTop10TargetIds: ['H', 'X'], ...candidateScope() },
      { recordId: 'obs-hold-2', caseId: 'hold-2', partition: 'holdout', essentialTargetIds: ['J'], irrelevantTargetIds: ['Y'], currentTop10TargetIds: ['J', 'Y'], candidateTop10TargetIds: ['J', 'Y'], ...candidateScope() },
    ],
    blindComparisons: [
      { recordId: 'blind-cal-1', caseId: 'cal-1', partition: 'calibration', outcome: 'tie', ...candidateScope() },
      { recordId: 'blind-cal-2', caseId: 'cal-2', partition: 'calibration', outcome: 'tie', ...candidateScope() },
      { recordId: 'blind-hold-1', caseId: 'hold-1', partition: 'holdout', outcome: 'tie', ...candidateScope() },
      { recordId: 'blind-hold-2', caseId: 'hold-2', partition: 'holdout', outcome: 'tie', ...candidateScope() },
    ],
    telemetryAggregates: [telemetry('calibration', 'current'), telemetry('calibration', 'candidate'), telemetry('holdout', 'current'), telemetry('holdout', 'candidate')],
    coverageRecords: [
      { recordId: 'concept-active', kind: 'concept', entityId: 'hope', state: 'active', ...candidateScope() },
      { recordId: 'concept-pending', kind: 'concept', entityId: 'peace', state: 'pending', ...candidateScope() },
      { recordId: 'concept-uncovered', kind: 'concept', entityId: 'joy', state: 'uncovered', ...candidateScope() },
      { recordId: 'fixture-stale', kind: 'fixture', entityId: 'fixture-1', state: 'stale', ...candidateScope() },
    ],
    caseLifecycles: [
      { recordId: 'life-admitted', caseId: 'case-admitted', opened: true, resolution: 'admitted', ...candidateScope() },
      { recordId: 'life-rejected', caseId: 'case-rejected', opened: true, resolution: 'rejected', ...candidateScope() },
      { recordId: 'life-no-effect', caseId: 'case-no-effect', opened: true, resolution: 'no-effect', ...candidateScope() },
      { recordId: 'life-unresolved', caseId: 'case-unresolved', opened: true, resolution: 'unresolved', ...candidateScope() },
    ],
    admissions: [{ recordId: 'admission-record-1', admissionId: 'admission-1', changedProbeCaseIds: ['cal-1', 'hold-1'], acceptedRegressionCaseIds: ['hold-1'], ...candidateScope() }],
    requiredGateEvaluations: [
      { recordId: 'gate-cal', gateId: 'calibration-required', partition: 'calibration', required: true, currentPass: true, candidatePass: true, ...candidateScope() },
      { recordId: 'gate-hold', gateId: 'holdout-required', partition: 'holdout', required: true, currentPass: true, candidatePass: true, ...candidateScope() },
    ],
    artifactGenealogy: [
      { artifact: current, reviewCycleId: 'cycle-0', observedAt: '2026-08-01T12:00:00.000Z', parent: null },
      { artifact: candidate, reviewCycleId: 'cycle-1', observedAt: '2026-08-11T12:00:00.000Z', parent: { artifact: current, reviewCycleId: 'cycle-0' } },
    ],
    trendHistory: [
      { recordId: 'trend-cal-top10', artifact: current, reviewCycleId: 'cycle-0', observedAt: '2026-08-01T12:00:00.000Z', partition: 'calibration', metricKey: 'benchmark.calibration.candidate.essential.top10', numerator: 1, denominator: 2, sourceRecordIds: ['prior-calculation-1'] },
      { recordId: 'trend-hold-top10', artifact: current, reviewCycleId: 'cycle-0', observedAt: '2026-08-01T12:00:00.000Z', partition: 'holdout', metricKey: 'benchmark.holdout.candidate.essential.top10', numerator: 1, denominator: 2, sourceRecordIds: ['prior-calculation-2'] },
    ],
    ...overrides,
  };
}

function replaceObservation(source: QualityDashboardInput, caseId: string, patch: Partial<BenchmarkObservation>): readonly BenchmarkObservation[] {
  return source.benchmarkObservations.map((entry) => entry.caseId === caseId ? { ...entry, ...patch } : entry);
}

function holdoutTelemetry(source: QualityDashboardInput, role: 'current' | 'candidate', patch: Partial<TelemetryAggregate>): readonly TelemetryAggregate[] {
  return source.telemetryAggregates.map((entry) => entry.partition === 'holdout' && entry.artifactRole === role ? { ...entry, ...patch } : entry);
}

describe('M13 deterministic quality dashboard', () => {
  it('preserves ranked result order while canonicalizing only unordered identifier sets', () => {
    const source = input();
    const report = buildQualityDashboard(input({ benchmarkObservations: replaceObservation(source, 'cal-1', { essentialTargetIds: ['A'], irrelevantTargetIds: ['X'], candidateTop10TargetIds: ['Z', 'A'] }) }));
    expect(report.partitions.calibration.essentialSuccess.candidate.top1.numerator).toBe(1);
    expect(report.partitions.calibration.essentialSuccess.candidate.top3.numerator).toBe(2);
    expect(() => buildQualityDashboard(input({ benchmarkObservations: replaceObservation(source, 'cal-1', { candidateTop10TargetIds: ['A', 'A'] }) }))).toThrow(/duplicate identifiers/);
    expect(() => buildQualityDashboard(input({ benchmarkObservations: replaceObservation(source, 'cal-1', { candidateTop10TargetIds: [' A'] }) }))).toThrow(/canonical/);
  });

  it('calculates linked metrics, exact numerator/denominator sources, and paired telemetry distributions', () => {
    const report = buildQualityDashboard(input());
    expect(report.partitions.calibration.essentialSuccess.candidate.top1).toMatchObject({ numerator: 2, denominator: 2, rate: 1, sparse: false });
    expect(report.partitions.calibration.essentialSuccess.candidate.top1.evidence.denominator.caseIds).toEqual(['cal-1', 'cal-2']);
    expect(report.partitions.holdout.blindOutcomes.tie).toMatchObject({ count: 2, sampleSize: 2 });
    expect(report.telemetry.holdout.current.zeroResultRate).toMatchObject({ numerator: 1, denominator: 10, rate: 0.1 });
    expect(report.telemetry.holdout.candidate.convertedRankDistribution.map((metric) => [metric.metricKey, metric.numerator, metric.denominator])).toEqual([
      ['telemetry.holdout.candidate.converted-rank.1', 4, 6], ['telemetry.holdout.candidate.converted-rank.2', 2, 6],
    ]);
    expect(report.telemetry.holdout.candidate.convertedWithinRank.top1).toMatchObject({ numerator: 4, denominator: 6 });
    expect(report.coverage.concepts).toMatchObject({ active: { count: 1 }, pending: { count: 1 }, uncovered: { count: 1 }, stale: { count: 0 } });
    expect(report.cases).toMatchObject({ opened: { count: 4 }, admitted: { count: 1 }, rejected: { count: 1 }, noEffect: { count: 1 }, unresolved: { count: 1 } });
    expect(report.admissions[0]).toMatchObject({ changedProbes: { count: 2 }, acceptedRegressions: { count: 1 } });
    expect(report.candidateImprovement.verdict).toBe('unchanged');
    assertQualityDashboardIntegrity(report);
  });

  it('never claims improvement from sparse calibration or holdout evidence', () => {
    const source = input();
    const gained = { ...source, blindComparisons: source.blindComparisons.map((entry) => entry.recordId === 'blind-hold-1' ? { ...entry, outcome: 'candidate-win' as const } : entry), sparseSampleThreshold: 3 };
    const report = buildQualityDashboard(gained);
    expect(report.candidateImprovement.verdict).toBe('review-required');
    expect(report.candidateImprovement.insufficientEvidenceMetricKeys).toContain('benchmark.calibration.candidate.essential.top1');
    expect(report.candidateImprovement.insufficientEvidenceMetricKeys).toContain('benchmark.holdout.blind');
    expect(report.candidateImprovement.holdoutGainMetricKeys).not.toContain('benchmark.holdout.blind.candidate-win');
  });

  const essentialCases = [
    ['top1', ['H', 'a'], ['a', 'H']],
    ['top3', ['a', 'b', 'H', 'c'], ['a', 'b', 'c', 'H']],
    ['top5', ['a', 'b', 'c', 'd', 'H', 'e'], ['a', 'b', 'c', 'd', 'e', 'H']],
    ['top10', ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'i', 'k', 'H'], ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'i', 'k', 'm']],
  ] as const;
  it.each(essentialCases)('blocks a holdout Essential %s degradation', (rank, currentTop10TargetIds, candidateTop10TargetIds) => {
    const source = input();
    const report = buildQualityDashboard(input({ benchmarkObservations: replaceObservation(source, 'hold-1', { currentTop10TargetIds, candidateTop10TargetIds }) }));
    expect(report.candidateImprovement.verdict).toBe('blocked-holdout-degradation');
    expect(report.candidateImprovement.holdoutDegradationMetricKeys).toContain(`benchmark.holdout.candidate.essential.${rank}`);
  });

  it.each([
    ['top3', ['H', 'a', 'b', 'X'], ['H', 'a', 'X', 'b']],
    ['top10', ['H', 'a', 'b'], ['H', 'a', 'b', 'X']],
  ] as const)('blocks a holdout irrelevant-rate %s degradation', (rank, currentTop10TargetIds, candidateTop10TargetIds) => {
    const source = input();
    const report = buildQualityDashboard(input({ benchmarkObservations: replaceObservation(source, 'hold-1', { currentTop10TargetIds, candidateTop10TargetIds }) }));
    expect(report.candidateImprovement.verdict).toBe('blocked-holdout-degradation');
    expect(report.candidateImprovement.holdoutDegradationMetricKeys).toContain(`benchmark.holdout.candidate.irrelevant.${rank}`);
  });

  it('treats blind candidate wins, current wins, ties, and both-wrong outcomes conservatively', () => {
    const source = input();
    const withOutcome = (outcome: 'candidate-win' | 'current-win' | 'tie' | 'both-wrong') => buildQualityDashboard(input({ blindComparisons: source.blindComparisons.map((entry) => entry.recordId === 'blind-hold-1' ? { ...entry, outcome } : entry) }));
    expect(withOutcome('candidate-win').candidateImprovement.verdict).toBe('improved');
    expect(withOutcome('current-win').candidateImprovement.verdict).toBe('blocked-holdout-degradation');
    expect(withOutcome('tie').candidateImprovement.verdict).toBe('unchanged');
    expect(withOutcome('both-wrong').candidateImprovement.verdict).toBe('review-required');
  });

  it.each([
    ['zero-result-rate', { zeroResultSearches: 2 }],
    ['weak-conversion-rate', { weakConversionSearches: 2 }],
  ] as const)('blocks a holdout telemetry %s degradation', (metric, patch) => {
    const source = input();
    const report = buildQualityDashboard(input({ telemetryAggregates: holdoutTelemetry(source, 'candidate', patch) }));
    expect(report.candidateImprovement.verdict).toBe('blocked-holdout-degradation');
    expect(report.candidateImprovement.holdoutDegradationMetricKeys).toContain(`telemetry.holdout.candidate.${metric}`);
  });

  it('blocks a comparable converted-rank degradation and requires review for missing telemetry', () => {
    const source = input();
    const degraded = buildQualityDashboard(input({ telemetryAggregates: holdoutTelemetry(source, 'candidate', { convertedRankCounts: [{ convertedRank: 1, count: 3 }, { convertedRank: 2, count: 3 }] }) }));
    expect(degraded.candidateImprovement.verdict).toBe('blocked-holdout-degradation');
    expect(degraded.candidateImprovement.holdoutDegradationMetricKeys).toContain('telemetry.holdout.candidate.converted-within.top1');
    const missing = buildQualityDashboard(input({ telemetryAggregates: source.telemetryAggregates.filter((entry) => !(entry.partition === 'holdout' && entry.artifactRole === 'candidate')) }));
    expect(missing.candidateImprovement.verdict).toBe('review-required');
    expect(missing.candidateImprovement.insufficientEvidenceMetricKeys).toContain('telemetry.holdout.candidate.zero-result-rate');
  });

  it('blocks required holdout gate regressions and exposes their linked count', () => {
    const source = input();
    const report = buildQualityDashboard(input({ requiredGateEvaluations: source.requiredGateEvaluations.map((gate) => gate.partition === 'holdout' ? { ...gate, candidatePass: false } : gate) }));
    expect(report.candidateImprovement.verdict).toBe('blocked-required-regression');
    expect(report.candidateImprovement.holdoutDegradationMetricKeys).toContain('gate.holdout.holdout-required');
    expect(report.candidateImprovement.requiredGateRegressionIds).toEqual(['holdout:holdout-required']);
    expect(report.requiredGateRegressions.holdout).toMatchObject({ count: 1, sampleSize: 1 });
  });

  it('binds trends to the declared ancestry and keeps the current report as the exact endpoint', () => {
    const report = buildQualityDashboard(input());
    const trend = report.trends.find((entry) => entry.metricKey === 'benchmark.holdout.candidate.essential.top10')!;
    expect(trend.points.map((point) => [point.artifact.artifactId, point.reviewCycleId])).toEqual([['current-a', 'cycle-0'], ['candidate-a', 'cycle-1']]);
    expect(trend.points.at(-1)).toMatchObject({ artifact: candidate, reviewCycleId: 'cycle-1', observedAt: '2026-08-11T12:00:00.000Z' });
    expect(report.artifactGenealogy.map((node) => node.artifact.artifactId)).toEqual(['current-a', 'candidate-a']);
  });

  it('fails closed on future, foreign, forked, duplicate, out-of-order, and current-endpoint trend ancestry', () => {
    const source = input();
    const futureGenealogy = [{ artifact: current, reviewCycleId: 'cycle-0', observedAt: '2026-08-12T12:00:00.000Z', parent: null }, source.artifactGenealogy[1]!];
    expect(() => buildQualityDashboard(input({ artifactGenealogy: futureGenealogy }))).toThrow(/future|increase strictly/);
    expect(() => buildQualityDashboard(input({ trendHistory: [{ ...source.trendHistory[0]!, artifact: foreign }] }))).toThrow(/foreign|unrelated/);
    const fork = { artifact: foreign, reviewCycleId: 'foreign-cycle', observedAt: '2026-08-05T12:00:00.000Z', parent: { artifact: current, reviewCycleId: 'cycle-0' } };
    expect(() => buildQualityDashboard(input({ artifactGenealogy: [...source.artifactGenealogy, fork] }))).toThrow(/branch|fork/);
    expect(() => buildQualityDashboard(input({ artifactGenealogy: [...source.artifactGenealogy, source.artifactGenealogy[0]!] }))).toThrow(/duplicate/);
    expect(() => buildQualityDashboard(input({ trendHistory: [...source.trendHistory, source.trendHistory[0]!] }))).toThrow(/duplicate recordId/);
    const outOfOrder = [{ ...source.artifactGenealogy[0]!, observedAt: '2026-08-11T12:00:00.000Z' }, source.artifactGenealogy[1]!];
    expect(() => buildQualityDashboard(input({ artifactGenealogy: outOfOrder }))).toThrow(/increase strictly/);
    expect(() => buildQualityDashboard(input({ trendHistory: [{ ...source.trendHistory[0]!, artifact: candidate, reviewCycleId: 'cycle-1', observedAt: source.observedAt }] }))).toThrow(/current report endpoint/);
    expect(() => buildQualityDashboard(input({ artifactGenealogy: [source.artifactGenealogy[0]!] }))).toThrow(/end exactly/);
  });

  it('is deterministic under shuffled input while sparse trends suppress precision', () => {
    const source = input({ sparseSampleThreshold: 3 });
    const shuffled = input({ sparseSampleThreshold: 3, benchmarkObservations: [...source.benchmarkObservations].reverse(), blindComparisons: [...source.blindComparisons].reverse(), telemetryAggregates: [...source.telemetryAggregates].reverse(), coverageRecords: [...source.coverageRecords].reverse(), caseLifecycles: [...source.caseLifecycles].reverse(), admissions: [...source.admissions].reverse(), requiredGateEvaluations: [...source.requiredGateEvaluations].reverse(), artifactGenealogy: [...source.artifactGenealogy].reverse(), trendHistory: [...source.trendHistory].reverse() });
    const first = buildQualityDashboard(source); const second = buildQualityDashboard(shuffled);
    expect(first.authorizedReportDigest).toBe(second.authorizedReportDigest);
    const trend = first.trends.find((entry) => entry.metricKey === 'benchmark.calibration.candidate.essential.top10')!;
    expect(trend).toMatchObject({ latestDeltaPercentagePoints: null, precision: 'suppressed-sparse' });
  });

  it('keeps empty denominators honest and holdout details opaque outside authorized audit', () => {
    const source = input();
    const report = buildQualityDashboard(input({ benchmarkObservations: [], blindComparisons: [], telemetryAggregates: [], admissions: [], trendHistory: [] }));
    expect(report.partitions.calibration.essentialSuccess.candidate.top10).toMatchObject({ numerator: 0, denominator: 0, rate: null, precision: 'unavailable' });
    expect(report.candidateImprovement.verdict).toBe('review-required');
    const admission = qualityDashboardAdmissionProjection(buildQualityDashboard(source));
    const proposal = proposalGenerationQualityDashboardView(buildQualityDashboard(source));
    const audit = qualityDashboardAuthorizedAuditProjection(buildQualityDashboard(source));
    expect(JSON.stringify(admission)).not.toContain('hold-1');
    expect(JSON.stringify(proposal)).not.toContain('hold-1');
    expect(proposal.holdout).toEqual({ opaqueMembership: true });
    expect(Object.keys(proposal)).not.toContain('candidateImprovement');
    expect(audit.partitions.holdout.essentialSuccess.candidate.top10.evidence.denominator.caseIds).toEqual(['hold-1', 'hold-2']);
    expect(audit.authorizedReportDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(Object.keys(audit)).not.toContain('digest');
  });

  it('makes public projections byte-identical when only hidden holdout ids, order, and count differ', () => {
    const firstInput = input();
    const extraOne: BenchmarkObservation = { recordId: 'SECRET-HIDDEN-ONE', caseId: 'SECRET-CASE-ONE', partition: 'holdout', essentialTargetIds: [], irrelevantTargetIds: [], currentTop10TargetIds: [], candidateTop10TargetIds: [], ...candidateScope() };
    const extraTwo: BenchmarkObservation = { recordId: 'SECRET-HIDDEN-TWO', caseId: 'SECRET-CASE-TWO', partition: 'holdout', essentialTargetIds: [], irrelevantTargetIds: [], currentTop10TargetIds: [], candidateTop10TargetIds: [], ...candidateScope() };
    const secondInput = input({ benchmarkObservations: [extraTwo, ...[...firstInput.benchmarkObservations].reverse(), extraOne] });
    const firstReport = buildQualityDashboard(firstInput);
    const secondReport = buildQualityDashboard(secondInput);
    expect(firstReport.authorizedReportDigest).not.toBe(secondReport.authorizedReportDigest);

    const firstAdmission = qualityDashboardAdmissionProjection(firstReport);
    const secondAdmission = qualityDashboardAdmissionProjection(secondReport);
    const firstProposal = proposalGenerationQualityDashboardView(firstReport);
    const secondProposal = proposalGenerationQualityDashboardView(secondReport);
    expect(JSON.stringify(firstAdmission)).toBe(JSON.stringify(secondAdmission));
    expect(JSON.stringify(firstProposal)).toBe(JSON.stringify(secondProposal));
    expect(firstAdmission.redactedDigest).toBe(calculateAdmissionRedactedDigest(firstAdmission));
    expect(firstProposal.redactedDigest).toBe(calculateProposalGenerationRedactedDigest(firstProposal));
    for (const serialized of [JSON.stringify(firstAdmission), JSON.stringify(firstProposal)]) {
      expect(serialized).not.toContain('authorizedReportDigest');
      expect(serialized).not.toMatch(/"digest"/);
      expect(serialized).not.toContain('SECRET-');
      expect(serialized).not.toContain('recordId');
      expect(serialized).not.toContain('caseId');
    }
    expect(Object.keys(firstAdmission)).toContain('redactedDigest');
    expect(Object.keys(firstProposal)).toEqual(['schemaVersion', 'artifact', 'reviewCycleId', 'calibration', 'holdout', 'redactedDigest']);
  });

  it('never leaks an exact secret duplicate canary through authorized or outward validation errors', () => {
    const source = input();
    const secret = 'SECRET_DUPLICATE_CANARY';
    const conflicting: readonly BenchmarkObservation[] = [
      ...source.benchmarkObservations,
      { ...source.benchmarkObservations[2]!, recordId: secret, caseId: 'secret-case-a' },
      { ...source.benchmarkObservations[2]!, recordId: secret, caseId: 'secret-case-b' },
    ];
    const invalid = input({ benchmarkObservations: conflicting });
    let authorizedMessage = '';
    try { buildQualityDashboard(invalid); } catch (error) { authorizedMessage = (error as Error).message; }
    expect(authorizedMessage).toBe('holdout evidence invalid.');
    expect(authorizedMessage).not.toContain(secret);

    const outwardMessages: string[] = [];
    for (const project of [qualityDashboardAdmissionProjection, proposalGenerationQualityDashboardView]) {
      try { project(invalid); } catch (error) { outwardMessages.push((error as Error).message); }
    }
    expect(outwardMessages).toEqual(['Quality dashboard projection unavailable.', 'Quality dashboard projection unavailable.']);
    expect(JSON.stringify(outwardMessages)).not.toContain(secret);

    const opaqueInvalid = { ...input(), schemaVersion: 2 as never, benchmarkObservations: input().benchmarkObservations.filter((entry) => entry.partition !== 'holdout'), blindComparisons: input().blindComparisons.filter((entry) => entry.partition !== 'holdout'), telemetryAggregates: input().telemetryAggregates.filter((entry) => entry.partition !== 'holdout'), requiredGateEvaluations: input().requiredGateEvaluations.filter((entry) => entry.partition !== 'holdout'), trendHistory: input().trendHistory.filter((entry) => entry.partition !== 'holdout'), admissions: [] };
    let opaqueMessage = '';
    try { qualityDashboardAdmissionProjection(opaqueInvalid); } catch (error) { opaqueMessage = (error as Error).message; }
    expect(opaqueMessage).toBe(outwardMessages[0]);
  });

  it('rejects identity and duplicate conflicts and never emits an aggregate quality field', () => {
    const source = input();
    expect(() => buildQualityDashboard(input({ benchmarkObservations: [{ ...source.benchmarkObservations[0]!, artifact: current }] }))).toThrow(/different artifact identity/);
    expect(() => buildQualityDashboard(input({ benchmarkObservations: [...source.benchmarkObservations, { ...source.benchmarkObservations[0]!, caseId: 'other' }] }))).toThrow(/contradictory duplicate/);
    expect(() => buildQualityDashboard({ ...source, schemaVersion: 2 as never })).toThrow(QualityDashboardValidationError);
    const report = buildQualityDashboard(source);
    expect(JSON.stringify(report)).not.toMatch(/"(?:quality)?score"/i);
    expect(Object.keys(report)).not.toContain('score');
  });
});
