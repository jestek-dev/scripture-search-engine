import type { CaseArtifactIdentity, CaseSource, CaseState } from './cases.js';

export type InboxSensitivity = 'standard' | 'sensitive';
export type InboxJudgmentFreshness = 'fresh' | 'stale';
export type InboxConceptCoverage = 'covered' | 'uncovered';
export type InboxPriorityFlag =
  | 'blocking-gate-finding'
  | 'sensitive-case-review'
  | 'missing-or-zero-result'
  | 'stale-judgment'
  | 'uncovered-concept';

export interface InboxCaseSnapshot {
  readonly caseId: string;
  readonly query: string;
  readonly source: CaseSource;
  readonly state: CaseState;
  readonly reviewer: string | null;
  readonly artifact: CaseArtifactIdentity;
  readonly sensitivity: InboxSensitivity;
  readonly ageDays: number;
  readonly resultCount: number | null;
  readonly blockingGateFinding: boolean;
  readonly judgmentFreshness: InboxJudgmentFreshness;
  readonly conceptCoverage: InboxConceptCoverage;
}

export interface InboxPriorityScore {
  readonly blockingGateFinding: 0 | 1;
  readonly sensitiveCaseReview: 0 | 1;
  readonly missingOrZeroResult: 0 | 1;
  readonly staleJudgment: 0 | 1;
  readonly uncoveredConcept: 0 | 1;
}

export interface InboxScore {
  readonly priority: InboxPriorityScore;
  readonly ageDays: number;
  readonly tieBreaker: string;
}

export interface InboxRankedCase {
  readonly item: InboxCaseSnapshot;
  readonly score: InboxScore;
  readonly explanation: string;
}

export interface InboxAgeFilter {
  readonly minDays?: number;
  readonly maxDays?: number;
}

export type InboxFilter = (item: InboxCaseSnapshot) => boolean;

function requireFiniteNumber(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must be a finite number.`);
  return value;
}

function requireNonNegativeNumber(value: number, label: string): number {
  const number = requireFiniteNumber(value, label);
  if (number < 0) throw new Error(`${label} must be zero or greater.`);
  return number;
}

function isSensitive(item: InboxCaseSnapshot): boolean {
  return item.sensitivity === 'sensitive';
}

function hasMissingOrZeroResult(item: InboxCaseSnapshot): boolean {
  return item.resultCount === null || item.resultCount <= 0;
}

function isBlocking(item: InboxCaseSnapshot): boolean {
  return item.blockingGateFinding;
}

function isStale(item: InboxCaseSnapshot): boolean {
  return item.judgmentFreshness === 'stale';
}

function isUncovered(item: InboxCaseSnapshot): boolean {
  return item.conceptCoverage === 'uncovered';
}

function tieBreakerKey(item: InboxCaseSnapshot): string {
  return [
    item.artifact.engineVersion,
    item.artifact.corpusFingerprint,
    item.artifact.layerFingerprint,
    item.source,
    item.state,
    item.reviewer ?? '',
    item.caseId,
    item.query,
  ].join('\u0001');
}

function compareStrings(left: string, right: string): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function compareNumbersDescending(left: number, right: number): number {
  if (left === right) return 0;
  return left > right ? -1 : 1;
}

function comparePriority(left: InboxPriorityScore, right: InboxPriorityScore): number {
  return (
    right.blockingGateFinding - left.blockingGateFinding ||
    right.sensitiveCaseReview - left.sensitiveCaseReview ||
    right.missingOrZeroResult - left.missingOrZeroResult ||
    right.staleJudgment - left.staleJudgment ||
    right.uncoveredConcept - left.uncoveredConcept
  );
}

export function scoreInboxCase(item: InboxCaseSnapshot): InboxScore {
  requireNonNegativeNumber(item.ageDays, 'ageDays');
  if (item.resultCount !== null) requireNonNegativeNumber(item.resultCount, 'resultCount');
  return Object.freeze({
    priority: Object.freeze({
      blockingGateFinding: isBlocking(item) ? 1 : 0,
      sensitiveCaseReview: isSensitive(item) ? 1 : 0,
      missingOrZeroResult: hasMissingOrZeroResult(item) ? 1 : 0,
      staleJudgment: isStale(item) ? 1 : 0,
      uncoveredConcept: isUncovered(item) ? 1 : 0,
    }),
    ageDays: item.ageDays,
    tieBreaker: tieBreakerKey(item),
  });
}

export function explainInboxCase(item: InboxCaseSnapshot, score: InboxScore = scoreInboxCase(item)): string {
  const reasons: string[] = [];
  if (score.priority.blockingGateFinding) reasons.push('blocking gate finding');
  if (score.priority.sensitiveCaseReview) reasons.push('sensitive-case review');
  if (score.priority.missingOrZeroResult) reasons.push('missing or zero result');
  if (score.priority.staleJudgment) reasons.push('stale judgment');
  if (score.priority.uncoveredConcept) reasons.push('uncovered concept');
  reasons.push(`${score.ageDays.toFixed(1)} days old`);
  return reasons.map((reason) => reason[0]!.toUpperCase() + reason.slice(1)).join(' • ');
}

export function compareInboxCases(left: InboxCaseSnapshot, right: InboxCaseSnapshot): number {
  const leftScore = scoreInboxCase(left);
  const rightScore = scoreInboxCase(right);
  return (
    comparePriority(leftScore.priority, rightScore.priority) ||
    compareNumbersDescending(leftScore.ageDays, rightScore.ageDays) ||
    compareStrings(leftScore.tieBreaker, rightScore.tieBreaker)
  );
}

export function rankInboxCases(items: readonly InboxCaseSnapshot[]): readonly InboxRankedCase[] {
  return [...items]
    .sort(compareInboxCases)
    .map((item) => {
      const score = scoreInboxCase(item);
      return Object.freeze({
        item,
        score,
        explanation: explainInboxCase(item, score),
      });
    });
}

export function filterBySource(...sources: readonly CaseSource[]): InboxFilter {
  const allowed = new Set(sources);
  return (item) => allowed.has(item.source);
}

export function filterByState(...states: readonly CaseState[]): InboxFilter {
  const allowed = new Set(states);
  return (item) => allowed.has(item.state);
}

export function filterByReviewer(...reviewers: readonly (string | null)[]): InboxFilter {
  const allowed = new Set(reviewers);
  return (item) => allowed.has(item.reviewer);
}

export function filterByArtifactIdentity(identity: CaseArtifactIdentity): InboxFilter {
  return (item) =>
    item.artifact.engineVersion === identity.engineVersion &&
    item.artifact.corpusFingerprint === identity.corpusFingerprint &&
    item.artifact.layerFingerprint === identity.layerFingerprint;
}

export function filterByAge(range: InboxAgeFilter): InboxFilter {
  const minDays = range.minDays === undefined ? Number.NEGATIVE_INFINITY : requireNonNegativeNumber(range.minDays, 'minDays');
  const maxDays = range.maxDays === undefined ? Number.POSITIVE_INFINITY : requireNonNegativeNumber(range.maxDays, 'maxDays');
  if (minDays > maxDays) throw new Error('minDays must not be greater than maxDays.');
  return (item) => item.ageDays >= minDays && item.ageDays <= maxDays;
}

export function filterBySensitivity(...sensitivities: readonly InboxSensitivity[]): InboxFilter {
  const allowed = new Set(sensitivities);
  return (item) => allowed.has(item.sensitivity);
}

export function combineInboxFilters(...filters: readonly InboxFilter[]): InboxFilter {
  return (item) => filters.every((filter) => filter(item));
}
