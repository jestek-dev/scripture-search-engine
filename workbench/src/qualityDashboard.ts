import { createHash } from 'node:crypto';

/**
 * Milestone 13's deterministic, audit-first quality dashboard. This module
 * deliberately has no persistence, UI, telemetry import, or proposal-writing
 * concerns. Its only job is to turn already-approved records into traceable
 * metrics without collapsing them into an overall quality value.
 */

export const QUALITY_DASHBOARD_SCHEMA_VERSION = 1;
export const DEFAULT_SPARSE_SAMPLE_THRESHOLD = 20;

export type BenchmarkPartition = 'calibration' | 'holdout';
export type RankedArtifact = 'current' | 'candidate';
export type BlindOutcome = 'candidate-win' | 'current-win' | 'tie' | 'both-wrong';
export type CoverageKind = 'concept' | 'fixture';
export type CoverageState = 'active' | 'pending' | 'uncovered' | 'stale';
export type CaseResolution = 'admitted' | 'rejected' | 'no-effect' | 'unresolved';

export interface ArtifactIdentity {
  readonly artifactId: string;
  readonly descriptorSha256: string;
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

export interface ReviewCycleIdentity {
  readonly cycleId: string;
}

interface ScopedQualityRecord {
  readonly artifact: ArtifactIdentity;
  readonly reviewCycleId: string;
}

export interface BenchmarkObservation extends ScopedQualityRecord {
  readonly recordId: string;
  readonly caseId: string;
  readonly partition: BenchmarkPartition;
  readonly essentialTargetIds: readonly string[];
  readonly irrelevantTargetIds: readonly string[];
  readonly currentTop10TargetIds: readonly string[];
  readonly candidateTop10TargetIds: readonly string[];
}

export interface BlindComparison extends ScopedQualityRecord {
  readonly recordId: string;
  readonly caseId: string;
  readonly partition: BenchmarkPartition;
  readonly outcome: BlindOutcome;
}

export interface TelemetryAggregate extends ScopedQualityRecord {
  readonly aggregateId: string;
  /** Immutable identifier of the upstream approval/audit that authorized it. */
  readonly approvalId: string;
  readonly partition: BenchmarkPartition;
  readonly artifactRole: RankedArtifact;
  readonly totalSearches: number;
  readonly zeroResultSearches: number;
  readonly weakConversionSearches: number;
  readonly convertedRankCounts: readonly { readonly convertedRank: number; readonly count: number }[];
}

export interface CoverageRecord extends ScopedQualityRecord {
  readonly recordId: string;
  readonly kind: CoverageKind;
  readonly entityId: string;
  readonly state: CoverageState;
}

export interface CaseLifecycleRecord extends ScopedQualityRecord {
  readonly recordId: string;
  readonly caseId: string;
  readonly opened: boolean;
  readonly resolution: CaseResolution | null;
}

export interface AdmissionRecord extends ScopedQualityRecord {
  readonly recordId: string;
  readonly admissionId: string;
  readonly changedProbeCaseIds: readonly string[];
  readonly acceptedRegressionCaseIds: readonly string[];
}

export interface RequiredGateEvaluation extends ScopedQualityRecord {
  readonly recordId: string;
  readonly gateId: string;
  readonly partition: BenchmarkPartition;
  readonly required: true;
  readonly currentPass: boolean;
  readonly candidatePass: boolean;
}

export interface ArtifactGenealogyNode {
  readonly artifact: ArtifactIdentity;
  readonly reviewCycleId: string;
  readonly observedAt: string;
  readonly parent: {
    readonly artifact: ArtifactIdentity;
    readonly reviewCycleId: string;
  } | null;
}

/** A prior, individually auditable metric point. It is never a composite. */
export interface ArtifactTrendRecord {
  readonly recordId: string;
  readonly artifact: ArtifactIdentity;
  readonly reviewCycleId: string;
  readonly observedAt: string;
  readonly partition: BenchmarkPartition;
  readonly metricKey: string;
  readonly numerator: number;
  readonly denominator: number;
  readonly sourceRecordIds: readonly string[];
}

export interface QualityDashboardInput {
  readonly schemaVersion: 1;
  /** The artifact whose candidate results and operational data are reported. */
  readonly artifact: ArtifactIdentity;
  /** The exact artifact used for the paired current results. */
  readonly referenceArtifact: ArtifactIdentity;
  readonly reviewCycle: ReviewCycleIdentity;
  readonly observedAt: string;
  readonly sparseSampleThreshold?: number;
  readonly benchmarkObservations: readonly BenchmarkObservation[];
  readonly blindComparisons: readonly BlindComparison[];
  readonly telemetryAggregates: readonly TelemetryAggregate[];
  readonly coverageRecords: readonly CoverageRecord[];
  readonly caseLifecycles: readonly CaseLifecycleRecord[];
  readonly admissions: readonly AdmissionRecord[];
  readonly requiredGateEvaluations: readonly RequiredGateEvaluation[];
  /** One unbranched ancestry ending exactly at artifact/reviewCycle. */
  readonly artifactGenealogy: readonly ArtifactGenealogyNode[];
  readonly trendHistory: readonly ArtifactTrendRecord[];
}

interface NormalizedQualityDashboardInput extends Omit<QualityDashboardInput, 'sparseSampleThreshold'> {
  readonly sparseSampleThreshold: number;
}

export interface EvidenceSourceLinks {
  readonly recordIds: readonly string[];
  readonly caseIds: readonly string[];
  readonly aggregateIds: readonly string[];
}

/** Exact contributors are kept separate when a numerator is a subset. */
export interface EvidenceLinks {
  readonly numerator: EvidenceSourceLinks;
  readonly denominator: EvidenceSourceLinks;
}

export interface RateMetric {
  readonly metricKey: string;
  readonly numerator: number;
  readonly denominator: number;
  readonly sampleSize: number;
  readonly rate: number | null;
  readonly sparse: boolean;
  readonly sparseSampleThreshold: number;
  readonly context: string;
  readonly precision: 'exact' | 'rounded' | 'unavailable';
  readonly display: string;
  readonly evidence: EvidenceLinks;
}

export interface CountMetric {
  readonly metricKey: string;
  readonly count: number;
  readonly sampleSize: number;
  readonly context: string;
  readonly evidence: EvidenceLinks;
}

export interface RedactedCountProjection {
  readonly metricKey: string;
  readonly count: number;
  readonly sampleSize: number;
  readonly context: string;
}

export type RedactedDashboardMetric = RedactedMetricProjection | RedactedCountProjection;

export interface PartitionBenchmarkMetrics {
  readonly essentialSuccess: Readonly<Record<RankedArtifact, Readonly<Record<'top1' | 'top3' | 'top5' | 'top10', RateMetric>>>>;
  readonly irrelevantRate: Readonly<Record<RankedArtifact, Readonly<Record<'top3' | 'top10', RateMetric>>>>;
  readonly blindOutcomes: Readonly<Record<BlindOutcome, CountMetric>>;
}

export interface ArtifactTelemetryMetrics {
  readonly zeroResultRate: RateMetric;
  readonly weakConversionRate: RateMetric;
  readonly convertedRankDistribution: readonly RateMetric[];
  readonly convertedWithinRank: Readonly<Record<'top1' | 'top3' | 'top5' | 'top10', RateMetric>>;
}

export type TelemetryMetrics = Readonly<Record<BenchmarkPartition, Readonly<Record<RankedArtifact, ArtifactTelemetryMetrics>>>>;

export interface CoverageMetrics {
  readonly concepts: Readonly<Record<CoverageState, CountMetric>>;
  readonly fixtures: Readonly<Record<CoverageState, CountMetric>>;
}

export interface CaseMetrics {
  readonly opened: CountMetric;
  readonly admitted: CountMetric;
  readonly rejected: CountMetric;
  readonly noEffect: CountMetric;
  readonly unresolved: CountMetric;
}

export interface AdmissionMetrics {
  readonly admissionId: string;
  readonly changedProbes: CountMetric;
  readonly acceptedRegressions: CountMetric;
}

export interface RequiredGateMetrics {
  readonly passed: CountMetric;
  readonly repaired: CountMetric;
  readonly regressed: CountMetric;
  readonly unresolved: CountMetric;
}

export interface TrendPoint {
  readonly artifact: ArtifactIdentity;
  readonly reviewCycleId: string;
  readonly observedAt: string;
  readonly numerator: number;
  readonly denominator: number;
  readonly sampleSize: number;
  readonly rate: number | null;
  readonly sparse: boolean;
  readonly sourceRecordIds: readonly string[];
}

export interface MetricTrend {
  readonly partition: BenchmarkPartition;
  readonly metricKey: string;
  readonly points: readonly TrendPoint[];
  /** Null intentionally suppresses a precise change where either endpoint is sparse. */
  readonly latestDeltaPercentagePoints: number | null;
  readonly precision: 'available' | 'suppressed-sparse' | 'unavailable';
  readonly context: string;
}

export interface CandidateImprovementVerdict {
  readonly verdict: 'improved' | 'unchanged' | 'not-demonstrated' | 'blocked-holdout-degradation' | 'blocked-required-regression' | 'review-required';
  readonly calibrationGainMetricKeys: readonly string[];
  readonly holdoutGainMetricKeys: readonly string[];
  readonly calibrationDegradationMetricKeys: readonly string[];
  readonly holdoutDegradationMetricKeys: readonly string[];
  readonly insufficientEvidenceMetricKeys: readonly string[];
  readonly requiredGateRegressionIds: readonly string[];
  readonly context: string;
}

export interface QualityDashboardReport {
  readonly schemaVersion: 1;
  readonly artifact: ArtifactIdentity;
  readonly referenceArtifact: ArtifactIdentity;
  readonly reviewCycle: ReviewCycleIdentity;
  readonly observedAt: string;
  readonly sparseSampleThreshold: number;
  readonly partitions: Readonly<Record<BenchmarkPartition, PartitionBenchmarkMetrics>>;
  readonly telemetry: TelemetryMetrics;
  readonly requiredGateRegressions: Readonly<Record<BenchmarkPartition, CountMetric>>;
  readonly requiredGates: Readonly<Record<BenchmarkPartition, RequiredGateMetrics>>;
  readonly coverage: CoverageMetrics;
  readonly cases: CaseMetrics;
  readonly admissions: readonly AdmissionMetrics[];
  readonly trends: readonly MetricTrend[];
  readonly artifactGenealogy: readonly ArtifactGenealogyNode[];
  readonly candidateImprovement: CandidateImprovementVerdict;
  /** Full authorized digest; never copied into a redacted projection. */
  readonly authorizedReportDigest: string;
}

export interface RedactedMetricProjection {
  readonly metricKey: string;
  readonly numerator: number;
  readonly denominator: number;
  readonly sampleSize: number;
  readonly rate: number | null;
  readonly sparse: boolean;
  readonly context: string;
}

export interface QualityDashboardAdmissionProjection {
  readonly schemaVersion: 1;
  readonly artifact: ArtifactIdentity;
  readonly reviewCycleId: string;
  readonly candidateImprovement: {
    readonly verdict: CandidateImprovementVerdict['verdict'];
    readonly context: string;
  };
  readonly calibration: readonly RedactedDashboardMetric[];
  readonly holdout: readonly RedactedDashboardMetric[];
  readonly telemetry: Readonly<Record<BenchmarkPartition, readonly RedactedMetricProjection[]>>;
  readonly requiredGates: Readonly<Record<BenchmarkPartition, readonly RedactedCountProjection[]>>;
  /** Canonical digest of this projection's visible fields only. */
  readonly redactedDigest: string;
}

export type ProposalGenerationQualityDashboardView = {
  readonly schemaVersion: 1;
  readonly artifact: ArtifactIdentity;
  readonly reviewCycleId: string;
  readonly calibration: readonly RedactedMetricProjection[];
  readonly holdout: { readonly opaqueMembership: true };
  /** Canonical digest of this projection's visible fields only. */
  readonly redactedDigest: string;
};

export class QualityDashboardValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QualityDashboardValidationError';
  }
}

export class QualityDashboardPublicError extends Error {
  constructor() {
    super('Quality dashboard projection unavailable.');
    this.name = 'QualityDashboardPublicError';
  }
}

const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const PARTITIONS: readonly BenchmarkPartition[] = ['calibration', 'holdout'];
const RANKS = [1, 3, 5, 10] as const;
const COVERAGE_STATES: readonly CoverageState[] = ['active', 'pending', 'uncovered', 'stale'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

function hash(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function immutable<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) immutable(child);
    Object.freeze(value);
  }
  return value;
}

function fail(message: string): never {
  throw new QualityDashboardValidationError(message);
}

function exactKeys(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
  if (!isRecord(value)) fail(`${label} must be an object.`);
  const allowed = new Set(keys);
  for (const key of Object.keys(value)) if (!allowed.has(key)) fail(`${label} has unknown field "${key}".`);
  for (const key of keys) if (!Object.hasOwn(value, key)) fail(`${label} is missing field "${key}".`);
  return value;
}

function requireText(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '' || value !== value.trim()) fail(`${label} must be canonical non-empty text.`);
  return value;
}

function requireIdentifier(value: unknown, label: string): string {
  const text = requireText(value, label);
  if (!IDENTIFIER.test(text)) fail(`${label} must be a stable identifier.`);
  return text;
}

function requireCount(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) fail(`${label} must be a non-negative integer.`);
  return value as number;
}

function requireTimestamp(value: unknown, label: string): string {
  const timestamp = requireText(value, label);
  if (!ISO_TIMESTAMP.test(timestamp) || Number.isNaN(Date.parse(timestamp))) fail(`${label} must be an ISO UTC timestamp.`);
  return timestamp;
}

function orderedIdentifiers(value: unknown, label: string): readonly string[] {
  if (!Array.isArray(value)) fail(`${label} must be an array.`);
  const normalized = value.map((entry, index) => requireIdentifier(entry, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) fail(`${label} must not contain duplicate identifiers.`);
  return normalized;
}

function identifierSet(value: unknown, label: string): readonly string[] {
  return [...orderedIdentifiers(value, label)].sort((left, right) => left.localeCompare(right));
}

function assertIdentity(value: unknown, label: string): ArtifactIdentity {
  const record = exactKeys(value, ['artifactId', 'descriptorSha256', 'engineVersion', 'corpusFingerprint', 'layerFingerprint'], label);
  const descriptorSha256 = requireText(record.descriptorSha256, `${label}.descriptorSha256`);
  if (!SHA256.test(descriptorSha256)) fail(`${label}.descriptorSha256 must be a SHA-256 digest.`);
  return immutable({
    artifactId: requireIdentifier(record.artifactId, `${label}.artifactId`), descriptorSha256,
    engineVersion: requireText(record.engineVersion, `${label}.engineVersion`),
    corpusFingerprint: requireText(record.corpusFingerprint, `${label}.corpusFingerprint`),
    layerFingerprint: requireText(record.layerFingerprint, `${label}.layerFingerprint`),
  });
}

function sameIdentity(left: ArtifactIdentity, right: ArtifactIdentity): boolean {
  return canonicalJson(left) === canonicalJson(right);
}

function assertScope(record: ScopedQualityRecord, artifact: ArtifactIdentity, cycleId: string, label: string): void {
  if (!sameIdentity(record.artifact, artifact)) fail(`${label} is tied to a different artifact identity.`);
  if (record.reviewCycleId !== cycleId) fail(`${label} is tied to a different review cycle.`);
}

function evidenceSource(recordIds: readonly string[] = [], caseIds: readonly string[] = [], aggregateIds: readonly string[] = []): EvidenceSourceLinks {
  return immutable({
    recordIds: immutable([...new Set(recordIds)].sort((left, right) => left.localeCompare(right))),
    caseIds: immutable([...new Set(caseIds)].sort((left, right) => left.localeCompare(right))),
    aggregateIds: immutable([...new Set(aggregateIds)].sort((left, right) => left.localeCompare(right))),
  });
}

function evidence(numeratorRecordIds: readonly string[] = [], numeratorCaseIds: readonly string[] = [], numeratorAggregateIds: readonly string[] = [], denominatorRecordIds: readonly string[] = numeratorRecordIds, denominatorCaseIds: readonly string[] = numeratorCaseIds, denominatorAggregateIds: readonly string[] = numeratorAggregateIds): EvidenceLinks {
  return immutable({ numerator: evidenceSource(numeratorRecordIds, numeratorCaseIds, numeratorAggregateIds), denominator: evidenceSource(denominatorRecordIds, denominatorCaseIds, denominatorAggregateIds) });
}

function displayRate(rate: number | null, sparse: boolean): string {
  if (rate === null) return 'No denominator';
  if (sparse) return `${Math.round(rate * 20) * 5}% (sparse)`;
  return `${(rate * 100).toFixed(1)}%`;
}

function rateMetric(metricKey: string, numerator: number, denominator: number, threshold: number, context: string, links: EvidenceLinks): RateMetric {
  if (numerator > denominator) fail(`${metricKey} numerator exceeds denominator.`);
  const rate = denominator === 0 ? null : numerator / denominator;
  const sparse = denominator > 0 && denominator < threshold;
  return immutable({ metricKey, numerator, denominator, sampleSize: denominator, rate, sparse, sparseSampleThreshold: threshold, context,
    precision: rate === null ? 'unavailable' : sparse ? 'rounded' : 'exact', display: displayRate(rate, sparse), evidence: links });
}

function countMetric(metricKey: string, count: number, context: string, links: EvidenceLinks, sampleSize = count): CountMetric {
  return immutable({ metricKey, count, sampleSize, context, evidence: links });
}

function dedupeById<T extends { readonly recordId: string }>(records: readonly T[], label: string): readonly T[] {
  const output = new Map<string, T>();
  for (const record of records) {
    const existing = output.get(record.recordId);
    if (existing !== undefined && canonicalJson(existing) !== canonicalJson(record)) fail(`${label} has contradictory duplicate recordId "${record.recordId}".`);
    output.set(record.recordId, record);
  }
  return [...output.values()].sort((left, right) => left.recordId.localeCompare(right.recordId));
}

function assertRoot(input: unknown): NormalizedQualityDashboardInput {
  if (!isRecord(input)) fail('Quality dashboard input must be an object.');
  const allowed = new Set(['schemaVersion', 'artifact', 'referenceArtifact', 'reviewCycle', 'observedAt', 'sparseSampleThreshold', 'benchmarkObservations', 'blindComparisons', 'telemetryAggregates', 'coverageRecords', 'caseLifecycles', 'admissions', 'requiredGateEvaluations', 'artifactGenealogy', 'trendHistory']);
  const required = ['schemaVersion', 'artifact', 'referenceArtifact', 'reviewCycle', 'observedAt', 'benchmarkObservations', 'blindComparisons', 'telemetryAggregates', 'coverageRecords', 'caseLifecycles', 'admissions', 'requiredGateEvaluations', 'artifactGenealogy', 'trendHistory'];
  for (const key of Object.keys(input)) if (!allowed.has(key)) fail(`Quality dashboard input has unknown field "${key}".`);
  for (const key of required) if (!Object.hasOwn(input, key)) fail(`Quality dashboard input is missing field "${key}".`);
  const record = input;
  if (record.schemaVersion !== 1) fail('Quality dashboard input schemaVersion must be 1.');
  const reviewCycle = exactKeys(record.reviewCycle, ['cycleId'], 'reviewCycle');
  const sparseSampleThreshold = record.sparseSampleThreshold === undefined ? DEFAULT_SPARSE_SAMPLE_THRESHOLD : requireCount(record.sparseSampleThreshold, 'sparseSampleThreshold');
  if (sparseSampleThreshold < 2) fail('sparseSampleThreshold must be at least 2.');
  const lists = ['benchmarkObservations', 'blindComparisons', 'telemetryAggregates', 'coverageRecords', 'caseLifecycles', 'admissions', 'requiredGateEvaluations', 'artifactGenealogy', 'trendHistory'] as const;
  for (const list of lists) if (!Array.isArray(record[list])) fail(`${list} must be an array.`);
  return {
    schemaVersion: 1, artifact: assertIdentity(record.artifact, 'artifact'), referenceArtifact: assertIdentity(record.referenceArtifact, 'referenceArtifact'),
    reviewCycle: immutable({ cycleId: requireIdentifier(reviewCycle.cycleId, 'reviewCycle.cycleId') }), observedAt: requireTimestamp(record.observedAt, 'observedAt'), sparseSampleThreshold,
    benchmarkObservations: record.benchmarkObservations as BenchmarkObservation[], blindComparisons: record.blindComparisons as BlindComparison[],
    telemetryAggregates: record.telemetryAggregates as TelemetryAggregate[], coverageRecords: record.coverageRecords as CoverageRecord[],
    caseLifecycles: record.caseLifecycles as CaseLifecycleRecord[], admissions: record.admissions as AdmissionRecord[], requiredGateEvaluations: record.requiredGateEvaluations as RequiredGateEvaluation[], artifactGenealogy: record.artifactGenealogy as ArtifactGenealogyNode[], trendHistory: record.trendHistory as ArtifactTrendRecord[],
  };
}

function parseObservation(value: unknown, artifact: ArtifactIdentity, cycleId: string): BenchmarkObservation {
  const record = exactKeys(value, ['recordId', 'caseId', 'partition', 'essentialTargetIds', 'irrelevantTargetIds', 'currentTop10TargetIds', 'candidateTop10TargetIds', 'artifact', 'reviewCycleId'], 'Benchmark observation');
  if (record.partition !== 'calibration' && record.partition !== 'holdout') fail('Benchmark observation partition is invalid.');
  const parsed: BenchmarkObservation = {
    recordId: requireIdentifier(record.recordId, 'Benchmark observation.recordId'), caseId: requireIdentifier(record.caseId, 'Benchmark observation.caseId'), partition: record.partition,
    essentialTargetIds: identifierSet(record.essentialTargetIds, 'Benchmark observation.essentialTargetIds'), irrelevantTargetIds: identifierSet(record.irrelevantTargetIds, 'Benchmark observation.irrelevantTargetIds'),
    currentTop10TargetIds: orderedIdentifiers(record.currentTop10TargetIds, 'Benchmark observation.currentTop10TargetIds'), candidateTop10TargetIds: orderedIdentifiers(record.candidateTop10TargetIds, 'Benchmark observation.candidateTop10TargetIds'),
    artifact: assertIdentity(record.artifact, 'Benchmark observation.artifact'), reviewCycleId: requireIdentifier(record.reviewCycleId, 'Benchmark observation.reviewCycleId'),
  };
  if (parsed.currentTop10TargetIds.length > 10 || parsed.candidateTop10TargetIds.length > 10) fail('Benchmark observation ranked targets must contain at most 10 entries.');
  const overlap = parsed.essentialTargetIds.filter((id) => parsed.irrelevantTargetIds.includes(id));
  if (overlap.length > 0) fail('Benchmark observation cannot mark the same target essential and irrelevant.');
  assertScope(parsed, artifact, cycleId, `Benchmark observation ${parsed.recordId}`);
  return immutable(parsed);
}

function parseBlind(value: unknown, artifact: ArtifactIdentity, cycleId: string): BlindComparison {
  const record = exactKeys(value, ['recordId', 'caseId', 'partition', 'outcome', 'artifact', 'reviewCycleId'], 'Blind comparison');
  if (record.partition !== 'calibration' && record.partition !== 'holdout') fail('Blind comparison partition is invalid.');
  if (record.outcome !== 'candidate-win' && record.outcome !== 'current-win' && record.outcome !== 'tie' && record.outcome !== 'both-wrong') fail('Blind comparison outcome is invalid.');
  const parsed: BlindComparison = { recordId: requireIdentifier(record.recordId, 'Blind comparison.recordId'), caseId: requireIdentifier(record.caseId, 'Blind comparison.caseId'), partition: record.partition, outcome: record.outcome,
    artifact: assertIdentity(record.artifact, 'Blind comparison.artifact'), reviewCycleId: requireIdentifier(record.reviewCycleId, 'Blind comparison.reviewCycleId') };
  assertScope(parsed, artifact, cycleId, `Blind comparison ${parsed.recordId}`);
  return immutable(parsed);
}

function parseTelemetry(value: unknown, candidateArtifact: ArtifactIdentity, referenceArtifact: ArtifactIdentity, cycleId: string): TelemetryAggregate {
  const record = exactKeys(value, ['aggregateId', 'approvalId', 'partition', 'artifactRole', 'totalSearches', 'zeroResultSearches', 'weakConversionSearches', 'convertedRankCounts', 'artifact', 'reviewCycleId'], 'Telemetry aggregate');
  if (record.partition !== 'calibration' && record.partition !== 'holdout') fail('Telemetry aggregate partition is invalid.');
  if (record.artifactRole !== 'current' && record.artifactRole !== 'candidate') fail('Telemetry aggregate artifactRole is invalid.');
  if (!Array.isArray(record.convertedRankCounts)) fail('Telemetry aggregate.convertedRankCounts must be an array.');
  const convertedRankCounts = record.convertedRankCounts.map((entry, index) => {
    const bucket = exactKeys(entry, ['convertedRank', 'count'], `Telemetry aggregate.convertedRankCounts[${index}]`);
    const convertedRank = requireCount(bucket.convertedRank, `Telemetry aggregate.convertedRankCounts[${index}].convertedRank`);
    if (convertedRank < 1) fail('Converted rank must be at least 1.');
    return immutable({ convertedRank, count: requireCount(bucket.count, `Telemetry aggregate.convertedRankCounts[${index}].count`) });
  }).sort((left, right) => left.convertedRank - right.convertedRank);
  if (new Set(convertedRankCounts.map((bucket) => bucket.convertedRank)).size !== convertedRankCounts.length) fail('Telemetry aggregate converted ranks must be unique.');
  const parsed: TelemetryAggregate = { aggregateId: requireIdentifier(record.aggregateId, 'Telemetry aggregate.aggregateId'), approvalId: requireIdentifier(record.approvalId, 'Telemetry aggregate.approvalId'), partition: record.partition, artifactRole: record.artifactRole, totalSearches: requireCount(record.totalSearches, 'Telemetry aggregate.totalSearches'), zeroResultSearches: requireCount(record.zeroResultSearches, 'Telemetry aggregate.zeroResultSearches'), weakConversionSearches: requireCount(record.weakConversionSearches, 'Telemetry aggregate.weakConversionSearches'), convertedRankCounts,
    artifact: assertIdentity(record.artifact, 'Telemetry aggregate.artifact'), reviewCycleId: requireIdentifier(record.reviewCycleId, 'Telemetry aggregate.reviewCycleId') };
  if (parsed.zeroResultSearches > parsed.totalSearches || parsed.weakConversionSearches > parsed.totalSearches || convertedRankCounts.reduce((sum, bucket) => sum + bucket.count, 0) > parsed.totalSearches) fail(`Telemetry aggregate ${parsed.aggregateId} has contradictory counts.`);
  assertScope(parsed, parsed.artifactRole === 'candidate' ? candidateArtifact : referenceArtifact, cycleId, `Telemetry aggregate ${parsed.aggregateId}`);
  return immutable(parsed);
}

function parseCoverage(value: unknown, artifact: ArtifactIdentity, cycleId: string): CoverageRecord {
  const record = exactKeys(value, ['recordId', 'kind', 'entityId', 'state', 'artifact', 'reviewCycleId'], 'Coverage record');
  if ((record.kind !== 'concept' && record.kind !== 'fixture') || !COVERAGE_STATES.includes(record.state as CoverageState)) fail('Coverage record kind or state is invalid.');
  const parsed: CoverageRecord = { recordId: requireIdentifier(record.recordId, 'Coverage record.recordId'), kind: record.kind, entityId: requireIdentifier(record.entityId, 'Coverage record.entityId'), state: record.state as CoverageState,
    artifact: assertIdentity(record.artifact, 'Coverage record.artifact'), reviewCycleId: requireIdentifier(record.reviewCycleId, 'Coverage record.reviewCycleId') };
  assertScope(parsed, artifact, cycleId, `Coverage record ${parsed.recordId}`);
  return immutable(parsed);
}

function parseLifecycle(value: unknown, artifact: ArtifactIdentity, cycleId: string): CaseLifecycleRecord {
  const record = exactKeys(value, ['recordId', 'caseId', 'opened', 'resolution', 'artifact', 'reviewCycleId'], 'Case lifecycle');
  if (typeof record.opened !== 'boolean') fail('Case lifecycle.opened must be boolean.');
  if (record.resolution !== null && record.resolution !== 'admitted' && record.resolution !== 'rejected' && record.resolution !== 'no-effect' && record.resolution !== 'unresolved') fail('Case lifecycle.resolution is invalid.');
  const parsed: CaseLifecycleRecord = { recordId: requireIdentifier(record.recordId, 'Case lifecycle.recordId'), caseId: requireIdentifier(record.caseId, 'Case lifecycle.caseId'), opened: record.opened, resolution: record.resolution,
    artifact: assertIdentity(record.artifact, 'Case lifecycle.artifact'), reviewCycleId: requireIdentifier(record.reviewCycleId, 'Case lifecycle.reviewCycleId') };
  assertScope(parsed, artifact, cycleId, `Case lifecycle ${parsed.recordId}`);
  return immutable(parsed);
}

function parseAdmission(value: unknown, artifact: ArtifactIdentity, cycleId: string): AdmissionRecord {
  const record = exactKeys(value, ['recordId', 'admissionId', 'changedProbeCaseIds', 'acceptedRegressionCaseIds', 'artifact', 'reviewCycleId'], 'Admission record');
  const parsed: AdmissionRecord = { recordId: requireIdentifier(record.recordId, 'Admission record.recordId'), admissionId: requireIdentifier(record.admissionId, 'Admission record.admissionId'), changedProbeCaseIds: identifierSet(record.changedProbeCaseIds, 'Admission record.changedProbeCaseIds'), acceptedRegressionCaseIds: identifierSet(record.acceptedRegressionCaseIds, 'Admission record.acceptedRegressionCaseIds'),
    artifact: assertIdentity(record.artifact, 'Admission record.artifact'), reviewCycleId: requireIdentifier(record.reviewCycleId, 'Admission record.reviewCycleId') };
  if (!parsed.acceptedRegressionCaseIds.every((caseId) => parsed.changedProbeCaseIds.includes(caseId))) fail(`Admission record ${parsed.recordId} accepts a regression that was not a changed probe.`);
  assertScope(parsed, artifact, cycleId, `Admission record ${parsed.recordId}`);
  return immutable(parsed);
}

function parseRequiredGate(value: unknown, artifact: ArtifactIdentity, cycleId: string): RequiredGateEvaluation {
  const record = exactKeys(value, ['recordId', 'gateId', 'partition', 'required', 'currentPass', 'candidatePass', 'artifact', 'reviewCycleId'], 'Required gate evaluation');
  if (record.partition !== 'calibration' && record.partition !== 'holdout') fail('Required gate evaluation partition is invalid.');
  if (record.required !== true) fail('Required gate evaluation.required must be true.');
  if (typeof record.currentPass !== 'boolean' || typeof record.candidatePass !== 'boolean') fail('Required gate evaluation pass values must be boolean.');
  const parsed: RequiredGateEvaluation = {
    recordId: requireIdentifier(record.recordId, 'Required gate evaluation.recordId'), gateId: requireIdentifier(record.gateId, 'Required gate evaluation.gateId'), partition: record.partition,
    required: true, currentPass: record.currentPass, candidatePass: record.candidatePass,
    artifact: assertIdentity(record.artifact, 'Required gate evaluation.artifact'), reviewCycleId: requireIdentifier(record.reviewCycleId, 'Required gate evaluation.reviewCycleId'),
  };
  assertScope(parsed, artifact, cycleId, `Required gate evaluation ${parsed.recordId}`);
  return immutable(parsed);
}

function parseGenealogyNode(value: unknown): ArtifactGenealogyNode {
  const record = exactKeys(value, ['artifact', 'reviewCycleId', 'observedAt', 'parent'], 'Artifact genealogy node');
  let parent: ArtifactGenealogyNode['parent'] = null;
  if (record.parent !== null) {
    const parentRecord = exactKeys(record.parent, ['artifact', 'reviewCycleId'], 'Artifact genealogy parent');
    parent = immutable({ artifact: assertIdentity(parentRecord.artifact, 'Artifact genealogy parent.artifact'), reviewCycleId: requireIdentifier(parentRecord.reviewCycleId, 'Artifact genealogy parent.reviewCycleId') });
  }
  return immutable({ artifact: assertIdentity(record.artifact, 'Artifact genealogy node.artifact'), reviewCycleId: requireIdentifier(record.reviewCycleId, 'Artifact genealogy node.reviewCycleId'), observedAt: requireTimestamp(record.observedAt, 'Artifact genealogy node.observedAt'), parent });
}

function genealogyKey(artifact: ArtifactIdentity, reviewCycleId: string): string {
  return `${hash(artifact)}:${reviewCycleId}`;
}

function validateGenealogy(nodes: readonly ArtifactGenealogyNode[], root: NormalizedQualityDashboardInput): readonly ArtifactGenealogyNode[] {
  if (nodes.length === 0) fail('Artifact genealogy must contain the current report endpoint.');
  const byKey = new Map<string, ArtifactGenealogyNode>();
  for (const node of nodes) {
    const key = genealogyKey(node.artifact, node.reviewCycleId);
    if (byKey.has(key)) fail('Artifact genealogy contains a duplicate artifact/review-cycle node.');
    if (node.observedAt > root.observedAt) fail('Artifact genealogy contains a future observation.');
    byKey.set(key, node);
  }
  const endpointKey = genealogyKey(root.artifact, root.reviewCycle.cycleId);
  const endpoint = byKey.get(endpointKey);
  if (endpoint === undefined || endpoint.observedAt !== root.observedAt) fail('Artifact genealogy must end exactly at the current artifact, review cycle, and observedAt.');
  const reversed: ArtifactGenealogyNode[] = [];
  const visited = new Set<string>();
  let cursor: ArtifactGenealogyNode | undefined = endpoint;
  while (cursor !== undefined) {
    const key = genealogyKey(cursor.artifact, cursor.reviewCycleId);
    if (visited.has(key)) fail('Artifact genealogy contains a cycle.');
    visited.add(key); reversed.push(cursor);
    if (cursor.parent === null) break;
    const parent = byKey.get(genealogyKey(cursor.parent.artifact, cursor.parent.reviewCycleId));
    if (parent === undefined) fail('Artifact genealogy references a missing parent.');
    if (parent.observedAt >= cursor.observedAt) fail('Artifact genealogy observedAt values must increase strictly from parent to child.');
    cursor = parent;
  }
  if (visited.size !== nodes.length) fail('Artifact genealogy contains an unrelated branch or fork.');
  return immutable(reversed.reverse());
}

function parseTrend(value: unknown): ArtifactTrendRecord {
  const record = exactKeys(value, ['recordId', 'artifact', 'reviewCycleId', 'observedAt', 'partition', 'metricKey', 'numerator', 'denominator', 'sourceRecordIds'], 'Artifact trend record');
  if (record.partition !== 'calibration' && record.partition !== 'holdout') fail('Artifact trend record partition is invalid.');
  const numerator = requireCount(record.numerator, 'Artifact trend record.numerator');
  const denominator = requireCount(record.denominator, 'Artifact trend record.denominator');
  if (numerator > denominator) fail('Artifact trend record numerator exceeds denominator.');
  return immutable({ recordId: requireIdentifier(record.recordId, 'Artifact trend record.recordId'), artifact: assertIdentity(record.artifact, 'Artifact trend record.artifact'), reviewCycleId: requireIdentifier(record.reviewCycleId, 'Artifact trend record.reviewCycleId'), observedAt: requireTimestamp(record.observedAt, 'Artifact trend record.observedAt'), partition: record.partition, metricKey: requireText(record.metricKey, 'Artifact trend record.metricKey'), numerator, denominator, sourceRecordIds: identifierSet(record.sourceRecordIds, 'Artifact trend record.sourceRecordIds') });
}

function parseInput(input: QualityDashboardInput): {
  readonly root: NormalizedQualityDashboardInput;
  readonly observations: readonly BenchmarkObservation[];
  readonly blinds: readonly BlindComparison[];
  readonly telemetry: readonly TelemetryAggregate[];
  readonly coverage: readonly CoverageRecord[];
  readonly lifecycles: readonly CaseLifecycleRecord[];
  readonly admissions: readonly AdmissionRecord[];
  readonly gates: readonly RequiredGateEvaluation[];
  readonly genealogy: readonly ArtifactGenealogyNode[];
  readonly trends: readonly ArtifactTrendRecord[];
} {
  const root = assertRoot(input);
  const observations = dedupeById(root.benchmarkObservations.map((entry) => parseObservation(entry, root.artifact, root.reviewCycle.cycleId)), 'Benchmark observations');
  const blinds = dedupeById(root.blindComparisons.map((entry) => parseBlind(entry, root.artifact, root.reviewCycle.cycleId)), 'Blind comparisons');
  const telemetry = root.telemetryAggregates.map((entry) => parseTelemetry(entry, root.artifact, root.referenceArtifact, root.reviewCycle.cycleId));
  const coverage = dedupeById(root.coverageRecords.map((entry) => parseCoverage(entry, root.artifact, root.reviewCycle.cycleId)), 'Coverage records');
  const lifecycles = dedupeById(root.caseLifecycles.map((entry) => parseLifecycle(entry, root.artifact, root.reviewCycle.cycleId)), 'Case lifecycles');
  const admissions = dedupeById(root.admissions.map((entry) => parseAdmission(entry, root.artifact, root.reviewCycle.cycleId)), 'Admission records');
  const gates = dedupeById(root.requiredGateEvaluations.map((entry) => parseRequiredGate(entry, root.artifact, root.reviewCycle.cycleId)), 'Required gate evaluations');
  const genealogy = validateGenealogy(root.artifactGenealogy.map(parseGenealogyNode), root);
  const trends = root.trendHistory.map(parseTrend).sort((left, right) => left.recordId.localeCompare(right.recordId));
  const trendRecordIds = new Set<string>();
  for (const trend of trends) {
    if (trendRecordIds.has(trend.recordId)) fail(`Artifact trend records contain duplicate recordId "${trend.recordId}".`);
    trendRecordIds.add(trend.recordId);
  }
  const recordIds = new Set<string>();
  for (const record of [...observations, ...blinds, ...coverage, ...lifecycles, ...admissions, ...gates, ...trends]) {
    if (recordIds.has(record.recordId)) fail(`Source record id "${record.recordId}" is reused across record kinds.`);
    recordIds.add(record.recordId);
  }
  for (const aggregate of telemetry) {
    if (recordIds.has(aggregate.aggregateId)) fail(`Source record id "${aggregate.aggregateId}" is reused across record kinds.`);
    recordIds.add(aggregate.aggregateId);
  }
  const observationByCase = new Map<string, BenchmarkObservation>();
  for (const observation of observations) {
    if (observationByCase.has(observation.caseId)) fail(`Benchmark caseId "${observation.caseId}" occurs more than once or crosses partitions.`);
    observationByCase.set(observation.caseId, observation);
  }
  const blindCases = new Set<string>();
  for (const blind of blinds) {
    const observation = observationByCase.get(blind.caseId);
    if (observation === undefined || observation.partition !== blind.partition) fail(`Blind comparison ${blind.recordId} does not bind to a benchmark case in the same partition.`);
    if (blindCases.has(blind.caseId)) fail(`Blind comparison caseId "${blind.caseId}" occurs more than once.`);
    blindCases.add(blind.caseId);
  }
  const coverageEntities = new Set<string>();
  for (const record of coverage) {
    const key = `${record.kind}:${record.entityId}`;
    if (coverageEntities.has(key)) fail(`Coverage record duplicates ${key}.`);
    coverageEntities.add(key);
  }
  const lifecycleCases = new Set<string>();
  for (const lifecycle of lifecycles) {
    if (lifecycleCases.has(lifecycle.caseId)) fail(`Case lifecycle caseId "${lifecycle.caseId}" occurs more than once.`);
    lifecycleCases.add(lifecycle.caseId);
  }
  const admissionIds = new Set<string>();
  for (const admission of admissions) {
    if (admissionIds.has(admission.admissionId)) fail(`Admission id "${admission.admissionId}" occurs more than once.`);
    admissionIds.add(admission.admissionId);
    for (const caseId of admission.changedProbeCaseIds) if (!observationByCase.has(caseId)) fail(`Admission ${admission.admissionId} links unknown changed probe case "${caseId}".`);
  }
  const gateIds = new Set<string>();
  for (const gate of gates) {
    const key = `${gate.partition}:${gate.gateId}`;
    if (gateIds.has(key)) fail(`Required gate "${key}" occurs more than once.`);
    gateIds.add(key);
  }
  const genealogyByKey = new Map(genealogy.map((node, index) => [genealogyKey(node.artifact, node.reviewCycleId), { node, index }]));
  const trendPoints = new Set<string>();
  const endpointKey = genealogyKey(root.artifact, root.reviewCycle.cycleId);
  for (const trend of trends) {
    const genealogyEntry = genealogyByKey.get(genealogyKey(trend.artifact, trend.reviewCycleId));
    if (genealogyEntry === undefined) fail(`Trend record ${trend.recordId} is from a foreign or unrelated artifact branch.`);
    if (genealogyEntry.node.observedAt !== trend.observedAt) fail(`Trend record ${trend.recordId} observedAt does not match its genealogy node.`);
    if (genealogyKey(trend.artifact, trend.reviewCycleId) === endpointKey) fail(`Trend record ${trend.recordId} duplicates the current report endpoint.`);
    const key = `${trend.partition}:${trend.metricKey}:${genealogyKey(trend.artifact, trend.reviewCycleId)}`;
    if (trendPoints.has(key)) fail(`Trend history contains a duplicate metric point for ${trend.metricKey}.`);
    trendPoints.add(key);
  }
  return immutable({ root, observations, blinds, telemetry, coverage, lifecycles, admissions, gates, genealogy, trends });
}

function rawPartition(value: unknown): unknown {
  return isRecord(value) ? value.partition : undefined;
}

function opaqueHoldoutInput(input: QualityDashboardInput): QualityDashboardInput {
  const withoutHoldout = <T>(values: readonly T[]): readonly T[] => values.filter((entry) => rawPartition(entry) !== 'holdout');
  return {
    ...input,
    benchmarkObservations: withoutHoldout(input.benchmarkObservations),
    blindComparisons: withoutHoldout(input.blindComparisons),
    telemetryAggregates: withoutHoldout(input.telemetryAggregates),
    requiredGateEvaluations: withoutHoldout(input.requiredGateEvaluations),
    /** Admissions can bind hidden cases, so they are opaque at this diagnostic boundary. */
    admissions: [],
    trendHistory: withoutHoldout(input.trendHistory),
  };
}

function collectHoldoutTokens(input: QualityDashboardInput): readonly string[] {
  const records: unknown[] = [];
  for (const values of [input.benchmarkObservations, input.blindComparisons, input.telemetryAggregates, input.requiredGateEvaluations, input.trendHistory]) {
    for (const entry of values) if (rawPartition(entry) === 'holdout') records.push(entry);
  }
  const tokens = new Set<string>();
  const identityFields = ['recordId', 'caseId', 'gateId', 'aggregateId', 'sourceRecordIds', 'essentialTargetIds', 'irrelevantTargetIds', 'currentTop10TargetIds', 'candidateTop10TargetIds'];
  const add = (value: unknown): void => {
    if (typeof value === 'string' && value.length > 2) tokens.add(value);
    else if (Array.isArray(value)) for (const entry of value) add(entry);
  };
  for (const record of records) if (isRecord(record)) for (const field of identityFields) add(record[field]);
  return [...tokens];
}

function parseAuthorizedInput(input: QualityDashboardInput): ReturnType<typeof parseInput> {
  try {
    return parseInput(input);
  } catch (error) {
    if (!(error instanceof QualityDashboardValidationError)) throw error;
    const partitionedLists = [input.benchmarkObservations, input.blindComparisons, input.telemetryAggregates, input.requiredGateEvaluations, input.trendHistory];
    if (!partitionedLists.every(Array.isArray) || !Array.isArray(input.admissions)) throw error;
    let opaqueIsValid = false;
    try {
      parseInput(opaqueHoldoutInput(input));
      opaqueIsValid = true;
    } catch {
      // A non-holdout validation problem remains eligible for its precise error.
    }
    const mentionsHiddenToken = collectHoldoutTokens(input).some((token) => error.message.includes(token));
    if (opaqueIsValid || mentionsHiddenToken || error.message.toLowerCase().includes('holdout evidence')) {
      throw new QualityDashboardValidationError('holdout evidence invalid.');
    }
    throw error;
  }
}

function benchmarkMetrics(partition: BenchmarkPartition, observations: readonly BenchmarkObservation[], blinds: readonly BlindComparison[], threshold: number): PartitionBenchmarkMetrics {
  const partitionObservations = observations.filter((entry) => entry.partition === partition);
  const essentialObservations = partitionObservations.filter((entry) => entry.essentialTargetIds.length > 0);
  const essentialFor = (artifact: RankedArtifact, rank: number): RateMetric => {
    const successes = essentialObservations.filter((entry) => entry[artifact === 'current' ? 'currentTop10TargetIds' : 'candidateTop10TargetIds'].slice(0, rank).some((target) => entry.essentialTargetIds.includes(target)));
    return rateMetric(`benchmark.${partition}.${artifact}.essential.top${rank}`, successes.length, essentialObservations.length, threshold, `Case-level essential-target success within top ${rank}; cases without an essential expectation are excluded.`, evidence(successes.map((entry) => entry.recordId), successes.map((entry) => entry.caseId), [], essentialObservations.map((entry) => entry.recordId), essentialObservations.map((entry) => entry.caseId)));
  };
  const irrelevantFor = (artifact: RankedArtifact, rank: 3 | 10): RateMetric => {
    const lists = partitionObservations.map((entry) => ({ entry, targets: entry[artifact === 'current' ? 'currentTop10TargetIds' : 'candidateTop10TargetIds'].slice(0, rank) }));
    const irrelevant = lists.filter((item) => item.targets.some((target) => item.entry.irrelevantTargetIds.includes(target)));
    return rateMetric(`benchmark.${partition}.${artifact}.irrelevant.top${rank}`, irrelevant.reduce((sum, item) => sum + item.targets.filter((target) => item.entry.irrelevantTargetIds.includes(target)).length, 0), lists.reduce((sum, item) => sum + item.targets.length, 0), threshold,
      `Result-level irrelevant-target rate among observed top ${rank} result slots.`, evidence(irrelevant.map((item) => item.entry.recordId), irrelevant.map((item) => item.entry.caseId), [], partitionObservations.map((entry) => entry.recordId), partitionObservations.map((entry) => entry.caseId)));
  };
  const partitionBlinds = blinds.filter((entry) => entry.partition === partition);
  const blindOutcomes = Object.fromEntries((['candidate-win', 'current-win', 'tie', 'both-wrong'] as const).map((outcome) => {
    const matches = partitionBlinds.filter((entry) => entry.outcome === outcome);
    return [outcome, countMetric(`benchmark.${partition}.blind.${outcome}`, matches.length, 'Blind paired judgments; each case is judged once.', evidence(matches.map((entry) => entry.recordId), matches.map((entry) => entry.caseId), [], partitionBlinds.map((entry) => entry.recordId), partitionBlinds.map((entry) => entry.caseId)), partitionBlinds.length)];
  })) as Readonly<Record<BlindOutcome, CountMetric>>;
  return immutable({
    essentialSuccess: immutable({ current: immutable({ top1: essentialFor('current', 1), top3: essentialFor('current', 3), top5: essentialFor('current', 5), top10: essentialFor('current', 10) }), candidate: immutable({ top1: essentialFor('candidate', 1), top3: essentialFor('candidate', 3), top5: essentialFor('candidate', 5), top10: essentialFor('candidate', 10) }) }),
    irrelevantRate: immutable({ current: immutable({ top3: irrelevantFor('current', 3), top10: irrelevantFor('current', 10) }), candidate: immutable({ top3: irrelevantFor('candidate', 3), top10: irrelevantFor('candidate', 10) }) }),
    blindOutcomes: immutable(blindOutcomes),
  });
}

function artifactTelemetryMetrics(partition: BenchmarkPartition, artifactRole: RankedArtifact, records: readonly TelemetryAggregate[], threshold: number): ArtifactTelemetryMetrics {
  const aggregateIds = records.map((entry) => entry.aggregateId);
  const allLinks = (matching: readonly TelemetryAggregate[], denominatorRecords: readonly TelemetryAggregate[] = records) => evidence(matching.map((entry) => entry.aggregateId), [], matching.map((entry) => entry.aggregateId), denominatorRecords.map((entry) => entry.aggregateId), [], denominatorRecords.map((entry) => entry.aggregateId));
  const total = records.reduce((sum, entry) => sum + entry.totalSearches, 0);
  const converted = records.reduce((sum, entry) => sum + entry.convertedRankCounts.reduce((inner, bucket) => inner + bucket.count, 0), 0);
  const ranks = [...new Set(records.flatMap((entry) => entry.convertedRankCounts.map((bucket) => bucket.convertedRank)))].sort((left, right) => left - right);
  const prefix = `telemetry.${partition}.${artifactRole}`;
  const convertedRecords = records.filter((entry) => entry.convertedRankCounts.reduce((sum, bucket) => sum + bucket.count, 0) > 0);
  const withinRank = (rank: number): RateMetric => {
    const matching = convertedRecords.filter((entry) => entry.convertedRankCounts.some((bucket) => bucket.convertedRank <= rank && bucket.count > 0));
    const numerator = matching.reduce((sum, entry) => sum + entry.convertedRankCounts.filter((bucket) => bucket.convertedRank <= rank).reduce((inner, bucket) => inner + bucket.count, 0), 0);
    return rateMetric(`${prefix}.converted-within.top${rank}`, numerator, converted, threshold, `Approved converted searches observed within rank ${rank}.`, allLinks(matching, convertedRecords));
  };
  return immutable({
    zeroResultRate: rateMetric(`${prefix}.zero-result-rate`, records.reduce((sum, entry) => sum + entry.zeroResultSearches, 0), total, threshold, 'Approved telemetry aggregate searches with zero results.', allLinks(records.filter((entry) => entry.zeroResultSearches > 0))),
    weakConversionRate: rateMetric(`${prefix}.weak-conversion-rate`, records.reduce((sum, entry) => sum + entry.weakConversionSearches, 0), total, threshold, 'Approved telemetry aggregate searches classified as weak conversions.', allLinks(records.filter((entry) => entry.weakConversionSearches > 0))),
    convertedRankDistribution: immutable(ranks.map((rank) => {
      const matching = convertedRecords.filter((entry) => (entry.convertedRankCounts.find((bucket) => bucket.convertedRank === rank)?.count ?? 0) > 0);
      return rateMetric(`${prefix}.converted-rank.${rank}`, matching.reduce((sum, entry) => sum + (entry.convertedRankCounts.find((bucket) => bucket.convertedRank === rank)?.count ?? 0), 0), converted, threshold, `Approved converted searches observed at rank ${rank}.`, allLinks(matching, convertedRecords));
    })),
    convertedWithinRank: immutable({ top1: withinRank(1), top3: withinRank(3), top5: withinRank(5), top10: withinRank(10) }),
  });
}

function telemetryMetrics(records: readonly TelemetryAggregate[], threshold: number): TelemetryMetrics {
  const forScope = (partition: BenchmarkPartition, artifactRole: RankedArtifact) => artifactTelemetryMetrics(partition, artifactRole, records.filter((entry) => entry.partition === partition && entry.artifactRole === artifactRole), threshold);
  return immutable({
    calibration: immutable({ current: forScope('calibration', 'current'), candidate: forScope('calibration', 'candidate') }),
    holdout: immutable({ current: forScope('holdout', 'current'), candidate: forScope('holdout', 'candidate') }),
  });
}

function coverageMetrics(records: readonly CoverageRecord[]): CoverageMetrics {
  const build = (kind: CoverageKind): Readonly<Record<CoverageState, CountMetric>> => {
    const scoped = records.filter((entry) => entry.kind === kind);
    return immutable(Object.fromEntries(COVERAGE_STATES.map((state) => {
      const entries = scoped.filter((entry) => entry.state === state);
      return [state, countMetric(`coverage.${kind}.${state}`, entries.length, `${kind} records in ${state} state.`, evidence(entries.map((entry) => entry.recordId)))];
    })) as Record<CoverageState, CountMetric>);
  };
  return immutable({ concepts: build('concept'), fixtures: build('fixture') });
}

function caseMetrics(records: readonly CaseLifecycleRecord[]): CaseMetrics {
  const linksFor = (entries: readonly CaseLifecycleRecord[]) => evidence(entries.map((entry) => entry.recordId), entries.map((entry) => entry.caseId));
  const open = records.filter((entry) => entry.opened);
  const status = (resolution: CaseResolution): readonly CaseLifecycleRecord[] => records.filter((entry) => entry.resolution === resolution);
  return immutable({ opened: countMetric('cases.opened', open.length, 'Cases with an opened lifecycle record.', linksFor(open)), admitted: countMetric('cases.admitted', status('admitted').length, 'Cases resolved as admitted.', linksFor(status('admitted'))), rejected: countMetric('cases.rejected', status('rejected').length, 'Cases resolved as rejected.', linksFor(status('rejected'))), noEffect: countMetric('cases.no-effect', status('no-effect').length, 'Cases resolved with no effect.', linksFor(status('no-effect'))), unresolved: countMetric('cases.unresolved', status('unresolved').length, 'Cases explicitly unresolved at this review cycle.', linksFor(status('unresolved'))) });
}

function admissionMetrics(records: readonly AdmissionRecord[]): readonly AdmissionMetrics[] {
  return immutable(records.slice().sort((left, right) => left.admissionId.localeCompare(right.admissionId)).map((entry) => immutable({ admissionId: entry.admissionId,
    changedProbes: countMetric(`admission.${entry.admissionId}.changed-probes`, entry.changedProbeCaseIds.length, 'Changed probes linked to this admission.', evidence([entry.recordId], entry.changedProbeCaseIds)),
    acceptedRegressions: countMetric(`admission.${entry.admissionId}.accepted-regressions`, entry.acceptedRegressionCaseIds.length, 'Accepted regressions linked to changed probes for this admission.', evidence([entry.recordId], entry.acceptedRegressionCaseIds)),
  })));
}

function gateRegressionMetrics(records: readonly RequiredGateEvaluation[]): Readonly<Record<BenchmarkPartition, CountMetric>> {
  return immutable(Object.fromEntries(PARTITIONS.map((partition) => {
    const scoped = records.filter((entry) => entry.partition === partition);
    const regressions = scoped.filter((entry) => entry.currentPass && !entry.candidatePass);
    return [partition, countMetric(`gates.${partition}.required-regressions`, regressions.length, 'Required gates that passed current and failed candidate.', evidence(regressions.map((entry) => entry.recordId), [], [], scoped.map((entry) => entry.recordId)), scoped.length)];
  })) as Record<BenchmarkPartition, CountMetric>);
}

function requiredGateMetrics(records: readonly RequiredGateEvaluation[]): Readonly<Record<BenchmarkPartition, RequiredGateMetrics>> {
  return immutable(Object.fromEntries(PARTITIONS.map((partition) => {
    const scoped = records.filter((entry) => entry.partition === partition);
    const metric = (status: 'passed' | 'repaired' | 'regressed' | 'unresolved', predicate: (entry: RequiredGateEvaluation) => boolean): CountMetric => {
      const matching = scoped.filter(predicate);
      return countMetric(`gates.${partition}.${status}`, matching.length, `Required ${partition} gates classified as ${status}.`, evidence(matching.map((entry) => entry.recordId), [], [], scoped.map((entry) => entry.recordId)), scoped.length);
    };
    return [partition, immutable({
      passed: metric('passed', (entry) => entry.currentPass && entry.candidatePass),
      repaired: metric('repaired', (entry) => !entry.currentPass && entry.candidatePass),
      regressed: metric('regressed', (entry) => entry.currentPass && !entry.candidatePass),
      unresolved: metric('unresolved', (entry) => !entry.currentPass && !entry.candidatePass),
    })];
  })) as Record<BenchmarkPartition, RequiredGateMetrics>);
}

interface DimensionAssessment {
  readonly gains: readonly string[];
  readonly degradations: readonly string[];
  readonly insufficient: readonly string[];
}

function assessDimensions(partition: BenchmarkPartition, metrics: PartitionBenchmarkMetrics, telemetry: Readonly<Record<RankedArtifact, ArtifactTelemetryMetrics>>, gates: readonly RequiredGateEvaluation[], threshold: number): DimensionAssessment {
  const pairs: readonly (readonly [RateMetric, RateMetric, 'higher' | 'lower'])[] = [
    ...RANKS.map((rank) => [metrics.essentialSuccess.current[`top${rank}` as const], metrics.essentialSuccess.candidate[`top${rank}` as const], 'higher'] as const),
    [metrics.irrelevantRate.current.top3, metrics.irrelevantRate.candidate.top3, 'lower'],
    [metrics.irrelevantRate.current.top10, metrics.irrelevantRate.candidate.top10, 'lower'],
    [telemetry.current.zeroResultRate, telemetry.candidate.zeroResultRate, 'lower'],
    [telemetry.current.weakConversionRate, telemetry.candidate.weakConversionRate, 'lower'],
    ...RANKS.map((rank) => [telemetry.current.convertedWithinRank[`top${rank}` as const], telemetry.candidate.convertedWithinRank[`top${rank}` as const], 'higher'] as const),
  ];
  const gains: string[] = []; const degradations: string[] = []; const insufficient: string[] = [];
  for (const [current, candidate, desired] of pairs) {
    if (current.denominator < threshold || candidate.denominator < threshold || current.rate === null || candidate.rate === null) {
      insufficient.push(candidate.metricKey); continue;
    }
    const difference = candidate.rate - current.rate;
    if ((desired === 'higher' && difference > 0) || (desired === 'lower' && difference < 0)) gains.push(candidate.metricKey);
    if ((desired === 'higher' && difference < 0) || (desired === 'lower' && difference > 0)) degradations.push(candidate.metricKey);
  }
  const blindSample = metrics.blindOutcomes.tie.sampleSize;
  if (blindSample < threshold) insufficient.push(`benchmark.${partition}.blind`);
  else {
    if (metrics.blindOutcomes['candidate-win'].count > 0) gains.push(metrics.blindOutcomes['candidate-win'].metricKey);
    if (metrics.blindOutcomes['current-win'].count > 0) degradations.push(metrics.blindOutcomes['current-win'].metricKey);
    if (metrics.blindOutcomes['both-wrong'].count > 0) insufficient.push(metrics.blindOutcomes['both-wrong'].metricKey);
  }
  for (const gate of gates.filter((entry) => entry.partition === partition)) {
    const key = `gate.${partition}.${gate.gateId}`;
    if (gate.currentPass && !gate.candidatePass) degradations.push(key);
    else if (!gate.currentPass && gate.candidatePass) gains.push(key);
    else if (!gate.currentPass && !gate.candidatePass) insufficient.push(key);
  }
  return immutable({ gains: [...new Set(gains)].sort(), degradations: [...new Set(degradations)].sort(), insufficient: [...new Set(insufficient)].sort() });
}

function improvementVerdict(partitions: Readonly<Record<BenchmarkPartition, PartitionBenchmarkMetrics>>, telemetry: TelemetryMetrics, gates: readonly RequiredGateEvaluation[], threshold: number): CandidateImprovementVerdict {
  const calibration = assessDimensions('calibration', partitions.calibration, telemetry.calibration, gates, threshold);
  const holdout = assessDimensions('holdout', partitions.holdout, telemetry.holdout, gates, threshold);
  const insufficientEvidenceMetricKeys = [...new Set([...calibration.insufficient, ...holdout.insufficient])].sort();
  const requiredGateRegressionIds = gates.filter((entry) => entry.currentPass && !entry.candidatePass).map((entry) => `${entry.partition}:${entry.gateId}`).sort();
  const anyGain = calibration.gains.length > 0 || holdout.gains.length > 0;
  let verdict: CandidateImprovementVerdict['verdict'] = 'unchanged';
  let context = 'All required evidence is comparable and no measured candidate movement was found.';
  if (insufficientEvidenceMetricKeys.length > 0) {
    verdict = 'review-required'; context = 'Improvement cannot be claimed because required partition evidence is sparse, missing, or unresolved.';
  } else if (requiredGateRegressionIds.length > 0) {
    verdict = 'blocked-required-regression'; context = 'Candidate improvement is blocked because a required gate regressed.';
  } else if (holdout.degradations.length > 0) {
    verdict = 'blocked-holdout-degradation'; context = 'Candidate improvement is blocked because at least one holdout quality dimension degraded.';
  } else if (anyGain && holdout.gains.length > 0) {
    verdict = 'improved'; context = 'Comparable non-sparse evidence includes a holdout gain and no holdout degradation; this is descriptive, not a significance claim.';
  } else if (anyGain) {
    verdict = 'not-demonstrated'; context = 'Comparable gains are limited to calibration and therefore do not support an improvement claim.';
  }
  return immutable({ verdict, calibrationGainMetricKeys: calibration.gains, holdoutGainMetricKeys: holdout.gains, calibrationDegradationMetricKeys: calibration.degradations, holdoutDegradationMetricKeys: holdout.degradations, insufficientEvidenceMetricKeys, requiredGateRegressionIds, context });
}

function currentTrendPoint(metric: RateMetric, partition: BenchmarkPartition, root: NormalizedQualityDashboardInput): TrendPoint {
  return immutable({ artifact: root.artifact, reviewCycleId: root.reviewCycle.cycleId, observedAt: root.observedAt, numerator: metric.numerator, denominator: metric.denominator, sampleSize: metric.sampleSize, rate: metric.rate, sparse: metric.sparse, sourceRecordIds: immutable([...new Set([...metric.evidence.numerator.recordIds, ...metric.evidence.denominator.recordIds])].sort((left, right) => left.localeCompare(right))) });
}

function trendPoint(record: ArtifactTrendRecord, threshold: number): TrendPoint {
  const rate = record.denominator === 0 ? null : record.numerator / record.denominator;
  return immutable({ artifact: record.artifact, reviewCycleId: record.reviewCycleId, observedAt: record.observedAt, numerator: record.numerator, denominator: record.denominator, sampleSize: record.denominator, rate, sparse: record.denominator > 0 && record.denominator < threshold, sourceRecordIds: record.sourceRecordIds });
}

function buildTrends(root: NormalizedQualityDashboardInput, partitions: Readonly<Record<BenchmarkPartition, PartitionBenchmarkMetrics>>, history: readonly ArtifactTrendRecord[], genealogy: readonly ArtifactGenealogyNode[]): readonly MetricTrend[] {
  const output: MetricTrend[] = [];
  const genealogyOrder = new Map(genealogy.map((node, index) => [genealogyKey(node.artifact, node.reviewCycleId), index]));
  for (const partition of PARTITIONS) {
    const selected = [partitions[partition].essentialSuccess.candidate.top1, partitions[partition].essentialSuccess.candidate.top3, partitions[partition].essentialSuccess.candidate.top5, partitions[partition].essentialSuccess.candidate.top10, partitions[partition].irrelevantRate.candidate.top3, partitions[partition].irrelevantRate.candidate.top10];
    for (const metric of selected) {
      const historicalPoints = history.filter((entry) => entry.partition === partition && entry.metricKey === metric.metricKey)
        .sort((left, right) => genealogyOrder.get(genealogyKey(left.artifact, left.reviewCycleId))! - genealogyOrder.get(genealogyKey(right.artifact, right.reviewCycleId))!)
        .map((entry) => trendPoint(entry, root.sparseSampleThreshold));
      const points = [...historicalPoints, currentTrendPoint(metric, partition, root)];
      const previous = points.length > 1 ? points[points.length - 2] : undefined;
      const latest = points[points.length - 1]!;
      const suppressed = previous !== undefined && (previous.sparse || latest.sparse);
      const delta = previous === undefined || previous.rate === null || latest.rate === null || suppressed ? null : Math.round((latest.rate - previous.rate) * 10_000) / 100;
      output.push(immutable({ partition, metricKey: metric.metricKey, points: immutable(points), latestDeltaPercentagePoints: delta, precision: previous === undefined || previous.rate === null || latest.rate === null ? 'unavailable' : suppressed ? 'suppressed-sparse' : 'available', context: previous === undefined ? 'No prior artifact point for this metric.' : suppressed ? 'Trend precision suppressed because at least one endpoint is sparse.' : 'Artifact-to-artifact descriptive change; no significance claim.' }));
    }
  }
  return immutable(output.sort((left, right) => left.partition.localeCompare(right.partition) || left.metricKey.localeCompare(right.metricKey)));
}

function digestProjection(report: Omit<QualityDashboardReport, 'authorizedReportDigest'>): unknown {
  return report;
}

/** Builds a fully linked, partitioned report from one validated review cycle. */
export function buildQualityDashboard(input: QualityDashboardInput): QualityDashboardReport {
  const parsed = parseAuthorizedInput(input);
  const partitions = immutable({ calibration: benchmarkMetrics('calibration', parsed.observations, parsed.blinds, parsed.root.sparseSampleThreshold), holdout: benchmarkMetrics('holdout', parsed.observations, parsed.blinds, parsed.root.sparseSampleThreshold) });
  const telemetry = telemetryMetrics(parsed.telemetry, parsed.root.sparseSampleThreshold);
  const requiredGateRegressions = gateRegressionMetrics(parsed.gates);
  const requiredGates = requiredGateMetrics(parsed.gates);
  const withoutDigest = { schemaVersion: 1 as const, artifact: parsed.root.artifact, referenceArtifact: parsed.root.referenceArtifact, reviewCycle: parsed.root.reviewCycle, observedAt: parsed.root.observedAt, sparseSampleThreshold: parsed.root.sparseSampleThreshold, partitions,
    telemetry, requiredGateRegressions, requiredGates, coverage: coverageMetrics(parsed.coverage), cases: caseMetrics(parsed.lifecycles), admissions: admissionMetrics(parsed.admissions), trends: buildTrends(parsed.root, partitions, parsed.trends, parsed.genealogy), artifactGenealogy: parsed.genealogy, candidateImprovement: improvementVerdict(partitions, telemetry, parsed.gates, parsed.root.sparseSampleThreshold) };
  return immutable({ ...withoutDigest, authorizedReportDigest: hash(digestProjection(withoutDigest)) });
}

export function calculateAuthorizedQualityDashboardDigest(report: QualityDashboardReport): string {
  if (!isRecord(report) || report.schemaVersion !== 1) fail('Quality dashboard report shape is invalid.');
  const { authorizedReportDigest: _authorizedReportDigest, ...content } = report;
  return hash(digestProjection(content));
}

export function assertQualityDashboardIntegrity(report: QualityDashboardReport): void {
  if (!SHA256.test(report.authorizedReportDigest) || calculateAuthorizedQualityDashboardDigest(report) !== report.authorizedReportDigest) fail('Authorized quality dashboard digest does not match deterministic content.');
}

function redacted(metric: RateMetric): RedactedMetricProjection {
  return immutable({ metricKey: metric.metricKey, numerator: metric.numerator, denominator: metric.denominator, sampleSize: metric.sampleSize, rate: metric.rate, sparse: metric.sparse, context: metric.context });
}

function redactedCount(metric: CountMetric): RedactedCountProjection {
  return immutable({ metricKey: metric.metricKey, count: metric.count, sampleSize: metric.sampleSize, context: metric.context });
}

function redactedPartition(metrics: PartitionBenchmarkMetrics): readonly RedactedMetricProjection[] {
  return immutable([metrics.essentialSuccess.candidate.top1, metrics.essentialSuccess.candidate.top3, metrics.essentialSuccess.candidate.top5, metrics.essentialSuccess.candidate.top10, metrics.irrelevantRate.candidate.top3, metrics.irrelevantRate.candidate.top10].map(redacted));
}

function redactedAdmissionPartition(metrics: PartitionBenchmarkMetrics): readonly RedactedDashboardMetric[] {
  return immutable([
    ...RANKS.flatMap((rank) => [redacted(metrics.essentialSuccess.current[`top${rank}` as const]), redacted(metrics.essentialSuccess.candidate[`top${rank}` as const])]),
    redacted(metrics.irrelevantRate.current.top3), redacted(metrics.irrelevantRate.candidate.top3), redacted(metrics.irrelevantRate.current.top10), redacted(metrics.irrelevantRate.candidate.top10),
    redactedCount(metrics.blindOutcomes['candidate-win']), redactedCount(metrics.blindOutcomes['current-win']), redactedCount(metrics.blindOutcomes.tie), redactedCount(metrics.blindOutcomes['both-wrong']),
  ]);
}

function redactedTelemetry(metrics: Readonly<Record<RankedArtifact, ArtifactTelemetryMetrics>>): readonly RedactedMetricProjection[] {
  return immutable((['current', 'candidate'] as const).flatMap((role) => [
    redacted(metrics[role].zeroResultRate), redacted(metrics[role].weakConversionRate),
    ...metrics[role].convertedRankDistribution.map(redacted),
    ...RANKS.map((rank) => redacted(metrics[role].convertedWithinRank[`top${rank}` as const])),
  ]));
}

function redactedGates(metrics: RequiredGateMetrics): readonly RedactedCountProjection[] {
  return immutable([redactedCount(metrics.passed), redactedCount(metrics.repaired), redactedCount(metrics.regressed), redactedCount(metrics.unresolved)]);
}

function reportForPublicProjection(source: QualityDashboardReport | QualityDashboardInput): QualityDashboardReport {
  try {
    if (isRecord(source) && Object.hasOwn(source, 'authorizedReportDigest')) {
      const report = source as QualityDashboardReport;
      assertQualityDashboardIntegrity(report);
      return report;
    }
    return buildQualityDashboard(source as QualityDashboardInput);
  } catch {
    throw new QualityDashboardPublicError();
  }
}

/** UI and admission material: values are visible, record and case identities are not. */
export function qualityDashboardAdmissionProjection(source: QualityDashboardReport | QualityDashboardInput): QualityDashboardAdmissionProjection {
  const report = reportForPublicProjection(source);
  const visible = { schemaVersion: 1 as const, artifact: report.artifact, reviewCycleId: report.reviewCycle.cycleId, candidateImprovement: immutable({ verdict: report.candidateImprovement.verdict, context: report.candidateImprovement.context }),
    calibration: redactedAdmissionPartition(report.partitions.calibration), holdout: redactedAdmissionPartition(report.partitions.holdout), telemetry: immutable({ calibration: redactedTelemetry(report.telemetry.calibration), holdout: redactedTelemetry(report.telemetry.holdout) }), requiredGates: immutable({ calibration: redactedGates(report.requiredGates.calibration), holdout: redactedGates(report.requiredGates.holdout) }) };
  return immutable({ ...visible, redactedDigest: hash(visible) });
}

/** Proposal generation receives calibration summaries only; all holdout membership stays opaque. */
export function proposalGenerationQualityDashboardView(source: QualityDashboardReport | QualityDashboardInput): ProposalGenerationQualityDashboardView {
  const report = reportForPublicProjection(source);
  const visible = { schemaVersion: 1 as const, artifact: report.artifact, reviewCycleId: report.reviewCycle.cycleId, calibration: redactedPartition(report.partitions.calibration), holdout: immutable({ opaqueMembership: true as const }) };
  return immutable({ ...visible, redactedDigest: hash(visible) });
}

export function calculateAdmissionRedactedDigest(projection: QualityDashboardAdmissionProjection): string {
  const { redactedDigest: _redactedDigest, ...visible } = projection;
  return hash(visible);
}

export function calculateProposalGenerationRedactedDigest(projection: ProposalGenerationQualityDashboardView): string {
  const { redactedDigest: _redactedDigest, ...visible } = projection;
  return hash(visible);
}

/** Authorized audit callers retain every source link and partition-specific detail. */
export function qualityDashboardAuthorizedAuditProjection(report: QualityDashboardReport): QualityDashboardReport {
  assertQualityDashboardIntegrity(report);
  return report;
}
