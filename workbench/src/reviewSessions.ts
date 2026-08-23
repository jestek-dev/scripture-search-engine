import { createHash } from 'node:crypto';

import { significantWords } from '@jestek-dev/scripture-engine/internal';

/**
 * Deterministic review-session planning and event folding (Milestone 12).
 * This is deliberately a pure domain module: callers own persistence and must
 * append only validated events with the current revision as a precondition.
 */

export const REVIEW_SESSION_SCHEMA_VERSION = 1;
export const DEFAULT_REVIEWED_SIZE = 20;
export const DEFAULT_MINIMUM_POOL_SIZE = 2;
export const REVIEW_SELECTION_ALGORITHM_VERSION = 2;
export const REVIEW_CANDIDATE_FILTER_VERSION = 2;
export const REVIEW_SESSION_FILTER_VERSION = 2;

export const REVIEW_SESSION_KINDS = [
  'weekly-triage',
  'stale-reconfirmation',
  'candidate-regression',
  'calibration',
  'holdout',
] as const;
export type ReviewSessionKind = (typeof REVIEW_SESSION_KINDS)[number];

export const REVIEW_OUTCOME_CLASSES = [
  'regressed',
  'failure',
  'stale',
  'ambiguous',
  'healthy',
  'calibration',
] as const;
export type ReviewOutcomeClass = (typeof REVIEW_OUTCOME_CLASSES)[number];

export const REVIEW_SKIP_REASONS = [
  'needs-context',
  'duplicate',
  'pastoral-escalation',
  'technical-blocker',
  'timebox',
] as const;
export type ReviewSkipReason = (typeof REVIEW_SKIP_REASONS)[number];
export type RequeuePolicy = 'next-session' | 'do-not-requeue';

export interface ReviewSessionCase {
  /** Stable source-owned case identity. Duplicate identities always fail closed. */
  readonly caseId: string;
  readonly query: string;
  readonly source: string;
  readonly outcomeClass: ReviewOutcomeClass;
  /** Observed distinct device count, not a theology or popularity proxy. */
  readonly deviceCount: number;
  /** Converted rank from a reproducible comparison, if one was observed. */
  readonly convertedRank: number | null;
  readonly recurrence: number;
  /** Canonical UTC timestamp when the case entered this review pool. */
  readonly createdAt: string;
  readonly stale?: boolean;
  readonly candidateRegression?: boolean;
  readonly calibration?: boolean;
  readonly holdout?: boolean;
  readonly blocked?: boolean;
  /** Explicitly supplied category. The module never infers sensitivity from text. */
  readonly sensitivityCategory?: 'pastoral';
}

export interface ReviewSessionBuildInput {
  readonly kind: ReviewSessionKind;
  readonly cases: readonly ReviewSessionCase[];
  readonly seed: string;
  readonly reviewer: string;
  readonly qualifiedReviewer?: boolean;
  readonly reviewedSize?: number;
  readonly minimumPoolSize?: number;
  /** Defaults to 10% of reviewedSize, bounded to 1..2 (or zero below four items). */
  readonly explorationSize?: number;
  /** Identity of an upstream candidate filter, when cases were pre-filtered. */
  readonly candidateFilterDigest?: string;
  /** Identity of an upstream session filter, when session eligibility was pre-filtered. */
  readonly sessionFilterDigest?: string;
  readonly repositoryStateDigest: string;
  readonly artifactStateDigest: string;
  /** Canonical UTC time makes age scoring reproducible. */
  readonly now: string;
}

export interface PriorityFormula {
  readonly version: 1;
  readonly popularityExcluded: true;
  readonly outcomeClassPoints: Readonly<Record<ReviewOutcomeClass, number>>;
  readonly deviceCountBands: readonly { readonly band: string; readonly points: number }[];
  readonly convertedRankBands: readonly { readonly band: string; readonly points: number }[];
  readonly recurrencePointsPerOccurrence: number;
  readonly maxAgeWeeks: number;
  readonly sourceFactors: readonly { readonly source: string; readonly points: number; readonly appliesTo: readonly ReviewSessionKind[] }[];
  readonly blockerPoints: number;
}

export const REVIEW_PRIORITY_FORMULA: PriorityFormula = Object.freeze({
  version: 1,
  popularityExcluded: true,
  outcomeClassPoints: Object.freeze({ regressed: 80, failure: 65, stale: 50, ambiguous: 35, healthy: 10, calibration: 30 }),
  deviceCountBands: Object.freeze([
    Object.freeze({ band: '0', points: 0 }),
    Object.freeze({ band: '1', points: 2 }),
    Object.freeze({ band: '2-4', points: 4 }),
    Object.freeze({ band: '5+', points: 6 }),
  ]),
  convertedRankBands: Object.freeze([
    Object.freeze({ band: '1', points: 12 }),
    Object.freeze({ band: '2-3', points: 9 }),
    Object.freeze({ band: '4-10', points: 6 }),
    Object.freeze({ band: '11+', points: 3 }),
    Object.freeze({ band: 'unobserved', points: 0 }),
  ]),
  recurrencePointsPerOccurrence: 2,
  maxAgeWeeks: 12,
  sourceFactors: Object.freeze([
    Object.freeze({ source: 'regression', points: 12, appliesTo: Object.freeze(['candidate-regression'] as ReviewSessionKind[]) }),
    Object.freeze({ source: 'calibration', points: 8, appliesTo: Object.freeze(['calibration'] as ReviewSessionKind[]) }),
    Object.freeze({ source: 'stale-judgment', points: 6, appliesTo: Object.freeze(['stale-reconfirmation'] as ReviewSessionKind[]) }),
  ]),
  blockerPoints: 25,
});

export interface ReviewPriorityBreakdown {
  readonly outcomeClass: ReviewOutcomeClass;
  readonly outcomeClassPoints: number;
  readonly deviceCountBand: string;
  readonly deviceCountPoints: number;
  readonly convertedRankBand: string;
  readonly convertedRankPoints: number;
  readonly recurrence: number;
  readonly recurrencePoints: number;
  readonly ageWeeks: number;
  readonly agePoints: number;
  readonly sourceFactorPoints: number;
  readonly blockerPoints: number;
  readonly total: number;
}

export interface ReviewSessionItem {
  readonly caseId: string;
  readonly clusterId: string;
  readonly source: string;
  readonly priority: ReviewPriorityBreakdown;
  readonly selection: 'priority' | 'exploration';
}

export interface SkippedSessionCase {
  readonly caseId: string;
  readonly reason: 'unqualified-pastoral-routing' | 'not-eligible-for-session-kind';
}

export interface ReviewSessionCompletionEvent {
  readonly kind: 'item-completed';
  readonly eventId: string;
  readonly sessionId: string;
  readonly sessionDefinitionDigest: string;
  /** Digest of the complete session state immediately before this append. */
  readonly expectedSessionDigest: string;
  readonly expectedRevision: number;
  readonly caseId: string;
  readonly reviewer: string;
  readonly at: string;
}

export interface ReviewSessionSkipEvent {
  readonly kind: 'item-skipped';
  readonly eventId: string;
  readonly sessionId: string;
  readonly sessionDefinitionDigest: string;
  readonly expectedSessionDigest: string;
  readonly expectedRevision: number;
  readonly caseId: string;
  readonly reviewer: string;
  readonly at: string;
  readonly reason: ReviewSkipReason;
  readonly requeue: RequeuePolicy;
}

export interface ReviewSessionClosedEvent {
  readonly kind: 'session-completed';
  readonly eventId: string;
  readonly sessionId: string;
  readonly sessionDefinitionDigest: string;
  readonly expectedSessionDigest: string;
  readonly expectedRevision: number;
  readonly reviewer: string;
  readonly at: string;
}

export type ReviewSessionEvent = ReviewSessionCompletionEvent | ReviewSessionSkipEvent | ReviewSessionClosedEvent;

export interface ReviewSessionDefinition {
  readonly schemaVersion: 1;
  readonly kind: ReviewSessionKind;
  readonly seed: string;
  readonly reviewer: string;
  readonly reviewerCapabilities: readonly ('pastoral')[];
  readonly now: string;
  readonly reviewedSize: number;
  readonly minimumPoolSize: number;
  readonly explorationSize: number;
  readonly repositoryStateDigest: string;
  readonly artifactStateDigest: string;
  readonly eligiblePoolDigest: string;
  readonly skippedCases: readonly SkippedSessionCase[];
  readonly candidateFilter: {
    readonly version: 2;
    readonly externalDigest: string | null;
    readonly holdoutBoundary: 'exclusive-v1';
  };
  readonly sessionFilter: {
    readonly version: 2;
    readonly externalDigest: string | null;
  };
  readonly selectionAlgorithmVersion: 2;
  readonly priorityFormulaVersion: 1;
}

export interface ReviewSession {
  readonly schemaVersion: 1;
  readonly sessionId: string;
  readonly definitionDigest: string;
  readonly definition: ReviewSessionDefinition;
  readonly kind: ReviewSessionKind;
  readonly repositoryStateDigest: string;
  readonly artifactStateDigest: string;
  readonly stateDigest: string;
  /** Digest of every eligible case, including cases that did not fit today. */
  readonly eligiblePoolDigest: string;
  readonly seed: string;
  readonly reviewer: string;
  readonly qualifiedReviewer: boolean;
  readonly priorityFormula: PriorityFormula;
  readonly orderedCaseIds: readonly string[];
  readonly items: readonly ReviewSessionItem[];
  readonly sourceCounts: Readonly<Record<string, number>>;
  readonly skippedCases: readonly SkippedSessionCase[];
  readonly events: readonly ReviewSessionEvent[];
  readonly completedCaseIds: readonly string[];
  readonly requeuedCaseIds: readonly string[];
  readonly resumableCaseIds: readonly string[];
  readonly status: 'open' | 'completed';
  readonly revision: number;
  readonly digest: string;
}

export type ProposalGenerationSessionView = {
  readonly schemaVersion: 1;
  readonly sessionId: string;
  readonly kind: Exclude<ReviewSessionKind, 'holdout'>;
  readonly digest: string;
  readonly opaqueMembership: false;
  readonly caseIds: readonly string[];
} | {
  readonly schemaVersion: 1;
  readonly kind: 'holdout';
  readonly opaqueMembership: true;
};

export class ReviewSessionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewSessionValidationError';
  }
}

const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

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

function requireText(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '' || value !== value.trim()) {
    throw new ReviewSessionValidationError(`${label} must be canonical non-empty text.`);
  }
  return value;
}

function requireIdentifier(value: unknown, label: string): string {
  const text = requireText(value, label);
  if (!IDENTIFIER.test(text)) throw new ReviewSessionValidationError(`${label} must be a stable identifier.`);
  return text;
}

function requireDigest(value: unknown, label: string): string {
  const digest = requireText(value, label);
  if (!SHA256.test(digest)) throw new ReviewSessionValidationError(`${label} must be a SHA-256 digest.`);
  return digest;
}

function requireTimestamp(value: unknown, label: string): string {
  const timestamp = requireText(value, label);
  if (!ISO_TIMESTAMP.test(timestamp) || Number.isNaN(Date.parse(timestamp)) || new Date(timestamp).toISOString() !== timestamp) {
    throw new ReviewSessionValidationError(`${label} must be a canonical UTC ISO timestamp.`);
  }
  return timestamp;
}

function requireNatural(value: unknown, label: string, allowZero = true): number {
  if (!Number.isSafeInteger(value) || (value as number) < (allowZero ? 0 : 1)) {
    throw new ReviewSessionValidationError(`${label} must be a ${allowZero ? 'non-negative' : 'positive'} safe integer.`);
  }
  return value as number;
}

function assertKnownKind(kind: unknown): asserts kind is ReviewSessionKind {
  if (typeof kind !== 'string' || !(REVIEW_SESSION_KINDS as readonly string[]).includes(kind)) {
    throw new ReviewSessionValidationError('kind must be a known review-session kind.');
  }
}

function assertKnownOutcome(value: unknown): asserts value is ReviewOutcomeClass {
  if (typeof value !== 'string' || !(REVIEW_OUTCOME_CLASSES as readonly string[]).includes(value)) {
    throw new ReviewSessionValidationError('case.outcomeClass must be known.');
  }
}

function validateCase(input: ReviewSessionCase): ReviewSessionCase {
  const allowedKeys = new Set([
    'caseId', 'query', 'source', 'outcomeClass', 'deviceCount', 'convertedRank', 'recurrence', 'createdAt',
    'stale', 'candidateRegression', 'calibration', 'holdout', 'blocked', 'sensitivityCategory',
  ]);
  const unknownKey = Object.keys(input).find((key) => !allowedKeys.has(key));
  if (unknownKey !== undefined) throw new ReviewSessionValidationError(`case has unknown field "${unknownKey}".`);
  const caseId = requireIdentifier(input.caseId, 'case.caseId');
  const query = requireText(input.query, 'case.query');
  const source = requireIdentifier(input.source, 'case.source');
  assertKnownOutcome(input.outcomeClass);
  const deviceCount = requireNatural(input.deviceCount, 'case.deviceCount');
  if (input.convertedRank !== null) requireNatural(input.convertedRank, 'case.convertedRank', false);
  const recurrence = requireNatural(input.recurrence, 'case.recurrence');
  const createdAt = requireTimestamp(input.createdAt, 'case.createdAt');
  for (const field of ['stale', 'candidateRegression', 'calibration', 'holdout', 'blocked'] as const) {
    if (input[field] !== undefined && input[field] !== true) throw new ReviewSessionValidationError(`case.${field}, when present, must be true.`);
  }
  if (input.sensitivityCategory !== undefined && input.sensitivityCategory !== 'pastoral') {
    throw new ReviewSessionValidationError('case.sensitivityCategory must be "pastoral" when present.');
  }
  if (significantWords(query).length === 0) {
    throw new ReviewSessionValidationError(`case "${caseId}" has no significant tokenizer words and cannot be clustered.`);
  }
  return { ...input, caseId, query, source, deviceCount, recurrence, createdAt };
}

function isEligible(kind: ReviewSessionKind, entry: ReviewSessionCase): boolean {
  if (entry.holdout === true) return kind === 'holdout';
  if (kind === 'holdout') return false;
  switch (kind) {
    case 'weekly-triage': return true;
    case 'stale-reconfirmation': return entry.stale === true || entry.outcomeClass === 'stale';
    case 'candidate-regression': return entry.candidateRegression === true || entry.outcomeClass === 'regressed';
    case 'calibration': return entry.calibration === true || entry.outcomeClass === 'calibration';
  }
}

function deviceBand(value: number): { band: string; points: number } {
  if (value === 0) return { band: '0', points: 0 };
  if (value === 1) return { band: '1', points: 2 };
  if (value <= 4) return { band: '2-4', points: 4 };
  return { band: '5+', points: 6 };
}

function rankBand(value: number | null): { band: string; points: number } {
  if (value === null) return { band: 'unobserved', points: 0 };
  if (value === 1) return { band: '1', points: 12 };
  if (value <= 3) return { band: '2-3', points: 9 };
  if (value <= 10) return { band: '4-10', points: 6 };
  return { band: '11+', points: 3 };
}

function sourceFactor(kind: ReviewSessionKind, source: string): number {
  return REVIEW_PRIORITY_FORMULA.sourceFactors
    .filter((factor) => factor.source === source && factor.appliesTo.includes(kind))
    .reduce((sum, factor) => sum + factor.points, 0);
}

export function priorityForReviewCase(entry: ReviewSessionCase, kind: ReviewSessionKind, now: string): ReviewPriorityBreakdown {
  assertKnownKind(kind);
  entry = validateCase(entry);
  const current = Date.parse(requireTimestamp(now, 'now'));
  const created = Date.parse(entry.createdAt);
  if (created > current) throw new ReviewSessionValidationError(`case "${entry.caseId}" is dated after now.`);
  const device = deviceBand(entry.deviceCount);
  const rank = rankBand(entry.convertedRank);
  const ageWeeks = Math.min(REVIEW_PRIORITY_FORMULA.maxAgeWeeks, Math.floor((current - created) / (7 * 24 * 60 * 60 * 1000)));
  const recurrencePoints = entry.recurrence * REVIEW_PRIORITY_FORMULA.recurrencePointsPerOccurrence;
  const sourceFactorPoints = sourceFactor(kind, entry.source);
  const blockerPoints = entry.blocked === true ? REVIEW_PRIORITY_FORMULA.blockerPoints : 0;
  const outcomeClassPoints = REVIEW_PRIORITY_FORMULA.outcomeClassPoints[entry.outcomeClass];
  return immutable({
    outcomeClass: entry.outcomeClass,
    outcomeClassPoints,
    deviceCountBand: device.band,
    deviceCountPoints: device.points,
    convertedRankBand: rank.band,
    convertedRankPoints: rank.points,
    recurrence: entry.recurrence,
    recurrencePoints,
    ageWeeks,
    agePoints: ageWeeks,
    sourceFactorPoints,
    blockerPoints,
    total: outcomeClassPoints + device.points + rank.points + recurrencePoints + ageWeeks + sourceFactorPoints + blockerPoints,
  });
}

export function reviewClusterId(query: string): string {
  const tokens = significantWords(requireText(query, 'query'));
  if (tokens.length === 0) throw new ReviewSessionValidationError('query has no significant tokenizer words and cannot be clustered.');
  return `cluster-${hash(tokens.slice().sort()).slice(0, 16)}`;
}

interface Candidate {
  readonly entry: ReviewSessionCase;
  readonly clusterId: string;
  readonly priority: ReviewPriorityBreakdown;
}

function seededOrder(seed: string, candidate: Candidate): string {
  return hash({ seed, caseId: candidate.entry.caseId, clusterId: candidate.clusterId });
}

function comparePriority(seed: string, left: Candidate, right: Candidate): number {
  return right.priority.total - left.priority.total || seededOrder(seed, left).localeCompare(seededOrder(seed, right)) || left.entry.caseId.localeCompare(right.entry.caseId);
}

function selectBalanced(
  candidates: readonly Candidate[],
  count: number,
  seed: string,
  caps: ReadonlyMap<string, number>,
  selectedByCluster: ReadonlyMap<string, number>,
  exploration: boolean,
  selectedBySource: ReadonlyMap<string, number> = new Map(),
): readonly Candidate[] {
  const remaining = new Map(candidates.map((candidate) => [candidate.entry.caseId, candidate]));
  const result: Candidate[] = [];
  const bySource = new Map(selectedBySource);
  const clusters = new Map(selectedByCluster);
  while (result.length < count && remaining.size > 0) {
    const eligible = [...remaining.values()].filter((candidate) => (clusters.get(candidate.clusterId) ?? 0) < (caps.get(candidate.clusterId) ?? 1));
    if (eligible.length === 0) break;
    const minimumSourceCount = Math.min(...eligible.map((candidate) => bySource.get(candidate.entry.source) ?? 0));
    const sourceCandidates = eligible.filter((candidate) => (bySource.get(candidate.entry.source) ?? 0) === minimumSourceCount);
    sourceCandidates.sort(exploration
      ? (left, right) => seededOrder(seed, left).localeCompare(seededOrder(seed, right)) || left.entry.caseId.localeCompare(right.entry.caseId)
      : (left, right) => comparePriority(seed, left, right));
    const chosen = sourceCandidates[0];
    if (chosen === undefined) break;
    remaining.delete(chosen.entry.caseId);
    result.push(chosen);
    bySource.set(chosen.entry.source, (bySource.get(chosen.entry.source) ?? 0) + 1);
    clusters.set(chosen.clusterId, (clusters.get(chosen.clusterId) ?? 0) + 1);
  }
  return result;
}

function sourceSelectionCounts(candidates: readonly Candidate[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const candidate of candidates) counts.set(candidate.entry.source, (counts.get(candidate.entry.source) ?? 0) + 1);
  return counts;
}

function stateDigest(repositoryStateDigest: string, artifactStateDigest: string): string {
  return hash({ repositoryStateDigest, artifactStateDigest });
}

function digestSession(session: Omit<ReviewSession, 'digest'>): string {
  return hash(session);
}

function itemStates(items: readonly ReviewSessionItem[], events: readonly ReviewSessionEvent[]): {
  completedCaseIds: readonly string[];
  requeuedCaseIds: readonly string[];
  resumableCaseIds: readonly string[];
  status: 'open' | 'completed';
} {
  const completed = new Set<string>();
  const skipped = new Map<string, RequeuePolicy>();
  let closed = false;
  for (const event of events) {
    if (event.kind === 'item-completed') completed.add(event.caseId);
    else if (event.kind === 'item-skipped') skipped.set(event.caseId, event.requeue);
    else closed = true;
  }
  const completedCaseIds = items.filter((item) => completed.has(item.caseId)).map((item) => item.caseId);
  const requeuedCaseIds = items.filter((item) => skipped.get(item.caseId) === 'next-session').map((item) => item.caseId);
  const resumableCaseIds = closed ? [] : items
    .filter((item) => !completed.has(item.caseId) && !skipped.has(item.caseId))
    .map((item) => item.caseId);
  return immutable({ completedCaseIds, requeuedCaseIds, resumableCaseIds, status: closed ? 'completed' : 'open' });
}

/** Builds every M12 session kind with stable input normalization and ordering. */
export function buildReviewSession(input: ReviewSessionBuildInput): ReviewSession {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new ReviewSessionValidationError('A review-session build input must be an object.');
  }
  assertKnownKind(input.kind);
  const seed = requireText(input.seed, 'seed');
  const reviewer = requireIdentifier(input.reviewer, 'reviewer');
  const repositoryStateDigest = requireDigest(input.repositoryStateDigest, 'repositoryStateDigest');
  const artifactStateDigest = requireDigest(input.artifactStateDigest, 'artifactStateDigest');
  const now = requireTimestamp(input.now, 'now');
  if (input.qualifiedReviewer !== undefined && input.qualifiedReviewer !== true) {
    throw new ReviewSessionValidationError('qualifiedReviewer must be true when present.');
  }
  const reviewedSize = input.reviewedSize ?? DEFAULT_REVIEWED_SIZE;
  requireNatural(reviewedSize, 'reviewedSize', false);
  const minimumPoolSize = input.minimumPoolSize ?? DEFAULT_MINIMUM_POOL_SIZE;
  requireNatural(minimumPoolSize, 'minimumPoolSize', false);
  const defaultExplorationSize = reviewedSize >= 4 ? Math.min(2, Math.max(1, Math.floor(reviewedSize / 10))) : 0;
  const explorationSize = input.explorationSize ?? defaultExplorationSize;
  requireNatural(explorationSize, 'explorationSize');
  if (explorationSize > reviewedSize) throw new ReviewSessionValidationError('explorationSize cannot exceed reviewedSize.');
  const candidateFilterDigest = input.candidateFilterDigest === undefined ? null : requireDigest(input.candidateFilterDigest, 'candidateFilterDigest');
  const sessionFilterDigest = input.sessionFilterDigest === undefined ? null : requireDigest(input.sessionFilterDigest, 'sessionFilterDigest');
  if (!Array.isArray(input.cases)) throw new ReviewSessionValidationError('cases must be an array.');

  // This partition is the complete non-holdout privacy boundary. In
  // particular, do not validate, identify, deduplicate, count, sort, hash, or
  // report a record on the opposite side of this single boolean discriminator.
  const routedCases = input.cases.filter((rawEntry) => {
    const explicitlyHoldout = rawEntry !== null && typeof rawEntry === 'object' && !Array.isArray(rawEntry) && rawEntry.holdout === true;
    return input.kind === 'holdout' ? explicitlyHoldout : !explicitlyHoldout;
  });
  const seenCaseIds = new Set<string>();
  for (const rawEntry of routedCases) {
    if (rawEntry === null || typeof rawEntry !== 'object' || Array.isArray(rawEntry)) {
      throw new ReviewSessionValidationError('Each review case must be an object.');
    }
    const caseId = requireIdentifier(rawEntry.caseId, 'case.caseId');
    if (seenCaseIds.has(caseId)) throw new ReviewSessionValidationError(`Duplicate or conflicting caseId "${caseId}".`);
    seenCaseIds.add(caseId);
  }
  const candidates: Candidate[] = [];
  const skippedCases: SkippedSessionCase[] = [];
  for (const rawEntry of routedCases) {
    const entry = validateCase(rawEntry);
    if (entry.sensitivityCategory === 'pastoral' && input.qualifiedReviewer !== true) {
      // Deliberately no query, token, or telemetry-derived detail in routing output.
      skippedCases.push({ caseId: entry.caseId, reason: 'unqualified-pastoral-routing' });
      continue;
    }
    if (!isEligible(input.kind, entry)) {
      skippedCases.push({ caseId: entry.caseId, reason: 'not-eligible-for-session-kind' });
      continue;
    }
    candidates.push({ entry, clusterId: reviewClusterId(entry.query), priority: priorityForReviewCase(entry, input.kind, now) });
  }
  if (candidates.length < minimumPoolSize) {
    throw new ReviewSessionValidationError(`Eligible review pool has ${candidates.length} cases, below minimumPoolSize ${minimumPoolSize}.`);
  }

  const clusters = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    const bucket = clusters.get(candidate.clusterId);
    if (bucket === undefined) clusters.set(candidate.clusterId, [candidate]);
    else bucket.push(candidate);
  }
  for (const bucket of clusters.values()) bucket.sort((left, right) => comparePriority(seed, left, right));
  const capacity = Math.min(reviewedSize, candidates.length);
  const explorationCount = Math.min(explorationSize, capacity);
  const priorityCount = capacity - explorationCount;
  const capPerCluster = Math.max(1, Math.ceil(capacity / clusters.size));
  const caps = new Map([...clusters.keys()].map((clusterId) => [clusterId, capPerCluster]));

  // One strongest representative per cluster enters the balanced pool before
  // any duplicate form can compete, preventing a single wording cluster from
  // monopolizing a review session.
  const representatives = [...clusters.values()].map((bucket) => bucket[0]!).sort((left, right) => comparePriority(seed, left, right));
  const prioritySelection: Candidate[] = [...selectBalanced(representatives, Math.min(priorityCount, representatives.length), seed, caps, new Map(), false)];
  const selectedByCluster = new Map<string, number>();
  for (const candidate of prioritySelection) selectedByCluster.set(candidate.clusterId, (selectedByCluster.get(candidate.clusterId) ?? 0) + 1);
  const selectedIds = new Set(prioritySelection.map((candidate) => candidate.entry.caseId));
  const priorityRemainder = candidates.filter((candidate) => !selectedIds.has(candidate.entry.caseId));
  const morePriority = selectBalanced(priorityRemainder, priorityCount - prioritySelection.length, seed, caps, selectedByCluster, false, sourceSelectionCounts(prioritySelection));
  for (const candidate of morePriority) {
    prioritySelection.push(candidate);
    selectedByCluster.set(candidate.clusterId, (selectedByCluster.get(candidate.clusterId) ?? 0) + 1);
    selectedIds.add(candidate.entry.caseId);
  }
  const quietCandidates = candidates.filter((candidate) => !selectedIds.has(candidate.entry.caseId) &&
    (candidate.entry.deviceCount === 0 || candidate.entry.outcomeClass === 'healthy' || candidate.entry.outcomeClass === 'ambiguous'));
  const explorationSelection = selectBalanced(quietCandidates, explorationCount, `${seed}:exploration`, caps, selectedByCluster, true, sourceSelectionCounts(prioritySelection));
  const selected = [...prioritySelection.map((candidate) => ({ candidate, selection: 'priority' as const })),
    ...explorationSelection.map((candidate) => ({ candidate, selection: 'exploration' as const }))];
  // Exploration can be unavailable in a small/urgent pool. Fill deterministically
  // from remaining candidates while retaining source and cluster caps.
  if (selected.length < capacity) {
    for (const entry of selected) selectedIds.add(entry.candidate.entry.caseId);
    for (const entry of explorationSelection) selectedByCluster.set(entry.clusterId, (selectedByCluster.get(entry.clusterId) ?? 0) + 1);
    const fill = selectBalanced(candidates.filter((candidate) => !selectedIds.has(candidate.entry.caseId)), capacity - selected.length, seed, caps, selectedByCluster, false, sourceSelectionCounts(selected.map((entry) => entry.candidate)));
    selected.push(...fill.map((candidate) => ({ candidate, selection: 'priority' as const })));
  }
  selected.sort((left, right) => (left.selection === right.selection ? 0 : left.selection === 'priority' ? -1 : 1) || comparePriority(seed, left.candidate, right.candidate));
  const items = selected.map(({ candidate, selection }) => immutable({
    caseId: candidate.entry.caseId,
    clusterId: candidate.clusterId,
    source: candidate.entry.source,
    priority: candidate.priority,
    selection,
  }));
  const sourceCounts: Record<string, number> = {};
  for (const item of items) sourceCounts[item.source] = (sourceCounts[item.source] ?? 0) + 1;
  const canonicalSkippedCases = [...skippedCases].sort((left, right) => left.caseId.localeCompare(right.caseId));
  const eligiblePoolDigest = hash(candidates.slice().sort((left, right) => left.entry.caseId.localeCompare(right.entry.caseId)).map((candidate) => candidate.entry));
  const definition: ReviewSessionDefinition = immutable({
    schemaVersion: 1,
    kind: input.kind,
    seed,
    reviewer,
    reviewerCapabilities: input.qualifiedReviewer === true ? ['pastoral'] : [],
    now,
    reviewedSize,
    minimumPoolSize,
    explorationSize,
    repositoryStateDigest,
    artifactStateDigest,
    eligiblePoolDigest,
    skippedCases: canonicalSkippedCases,
    candidateFilter: {
      version: REVIEW_CANDIDATE_FILTER_VERSION,
      externalDigest: candidateFilterDigest,
      holdoutBoundary: 'exclusive-v1',
    },
    sessionFilter: { version: REVIEW_SESSION_FILTER_VERSION, externalDigest: sessionFilterDigest },
    selectionAlgorithmVersion: REVIEW_SELECTION_ALGORITHM_VERSION,
    priorityFormulaVersion: REVIEW_PRIORITY_FORMULA.version,
  });
  const definitionDigest = hash(definition);
  const base = {
    schemaVersion: 1 as const,
    sessionId: `session-${definitionDigest}`,
    definitionDigest,
    definition,
    kind: input.kind,
    repositoryStateDigest,
    artifactStateDigest,
    stateDigest: stateDigest(repositoryStateDigest, artifactStateDigest),
    eligiblePoolDigest,
    seed,
    reviewer,
    qualifiedReviewer: input.qualifiedReviewer === true,
    priorityFormula: REVIEW_PRIORITY_FORMULA,
    orderedCaseIds: items.map((item) => item.caseId),
    items,
    sourceCounts: Object.fromEntries(Object.entries(sourceCounts).sort(([left], [right]) => left.localeCompare(right))),
    skippedCases: canonicalSkippedCases,
    events: [] as readonly ReviewSessionEvent[],
    ...itemStates(items, []),
    revision: 0,
  };
  return immutable({ ...base, digest: digestSession(base) });
}

export function buildWeeklyTriageSession(input: Omit<ReviewSessionBuildInput, 'kind'>): ReviewSession {
  return buildReviewSession({ ...input, kind: 'weekly-triage' });
}
export function buildStaleReconfirmationSession(input: Omit<ReviewSessionBuildInput, 'kind'>): ReviewSession {
  return buildReviewSession({ ...input, kind: 'stale-reconfirmation' });
}
export function buildCandidateRegressionSession(input: Omit<ReviewSessionBuildInput, 'kind'>): ReviewSession {
  return buildReviewSession({ ...input, kind: 'candidate-regression' });
}
export function buildCalibrationSession(input: Omit<ReviewSessionBuildInput, 'kind'>): ReviewSession {
  return buildReviewSession({ ...input, kind: 'calibration' });
}
export function buildHoldoutSession(input: Omit<ReviewSessionBuildInput, 'kind'>): ReviewSession {
  return buildReviewSession({ ...input, kind: 'holdout' });
}

function assertSessionIntegrity(session: ReviewSession): void {
  const { digest, ...unsigned } = session;
  if (digestSession(unsigned) !== digest) throw new ReviewSessionValidationError('Review-session digest does not match its persisted state.');
  if (hash(session.definition) !== session.definitionDigest || session.sessionId !== `session-${session.definitionDigest}`) {
    throw new ReviewSessionValidationError('Review-session identity does not match its immutable definition.');
  }
  if (session.definition.kind !== session.kind || session.definition.seed !== session.seed ||
    session.definition.reviewer !== session.reviewer || session.definition.repositoryStateDigest !== session.repositoryStateDigest ||
    session.definition.artifactStateDigest !== session.artifactStateDigest || session.definition.eligiblePoolDigest !== session.eligiblePoolDigest ||
    session.definition.priorityFormulaVersion !== session.priorityFormula.version) {
    throw new ReviewSessionValidationError('Review-session definition conflicts with its published fields.');
  }
  if (session.stateDigest !== stateDigest(session.repositoryStateDigest, session.artifactStateDigest)) {
    throw new ReviewSessionValidationError('Review-session repository/artifact state digest is inconsistent.');
  }
  if (session.orderedCaseIds.length !== session.items.length ||
    new Set(session.orderedCaseIds).size !== session.orderedCaseIds.length ||
    session.orderedCaseIds.some((caseId, index) => session.items[index]?.caseId !== caseId)) {
    throw new ReviewSessionValidationError('Review-session item order is inconsistent.');
  }
  const expectedSources: Record<string, number> = {};
  for (const item of session.items) expectedSources[item.source] = (expectedSources[item.source] ?? 0) + 1;
  if (canonicalJson(expectedSources) !== canonicalJson(session.sourceCounts)) {
    throw new ReviewSessionValidationError('Review-session source counts are inconsistent.');
  }
}

function validateEvent(
  event: ReviewSessionEvent,
  session: ReviewSession,
  seenIds: ReadonlySet<string>,
  currentRevision: number,
  expectedSessionDigest: string,
  terminal: boolean,
): void {
  if (event === null || typeof event !== 'object' || Array.isArray(event)) throw new ReviewSessionValidationError('A session event must be an object.');
  if (event.kind !== 'item-completed' && event.kind !== 'item-skipped' && event.kind !== 'session-completed') {
    throw new ReviewSessionValidationError('A session event kind must be known.');
  }
  requireIdentifier(event.eventId, 'event.eventId');
  if (seenIds.has(event.eventId)) throw new ReviewSessionValidationError(`Duplicate eventId "${event.eventId}".`);
  requireIdentifier(event.sessionId, 'event.sessionId');
  requireDigest(event.sessionDefinitionDigest, 'event.sessionDefinitionDigest');
  requireDigest(event.expectedSessionDigest, 'event.expectedSessionDigest');
  if (event.sessionId !== session.sessionId || event.sessionDefinitionDigest !== session.definitionDigest) {
    throw new ReviewSessionValidationError('Cross-session event binding does not match this session definition.');
  }
  if (event.expectedSessionDigest !== expectedSessionDigest) {
    throw new ReviewSessionValidationError('Stale session mutation: expected session digest does not match current state.');
  }
  requireNatural(event.expectedRevision, 'event.expectedRevision');
  if (event.expectedRevision !== currentRevision) throw new ReviewSessionValidationError(`Stale session mutation: expected revision ${event.expectedRevision}, current revision is ${currentRevision}.`);
  requireIdentifier(event.reviewer, 'event.reviewer');
  requireTimestamp(event.at, 'event.at');
  if (event.reviewer !== session.reviewer) throw new ReviewSessionValidationError('Session events must use the session reviewer identity.');
  if (terminal) throw new ReviewSessionValidationError('A completed session cannot accept more events.');
  if (event.kind === 'item-completed' || event.kind === 'item-skipped') {
    requireIdentifier(event.caseId, 'event.caseId');
    if (!session.orderedCaseIds.includes(event.caseId)) throw new ReviewSessionValidationError(`Event caseId "${event.caseId}" is not in this session.`);
  }
  if (event.kind === 'item-skipped') {
    if (!(REVIEW_SKIP_REASONS as readonly string[]).includes(event.reason)) throw new ReviewSessionValidationError('item-skipped.reason must be known.');
    if (event.requeue !== 'next-session' && event.requeue !== 'do-not-requeue') throw new ReviewSessionValidationError('item-skipped.requeue must be known.');
    if (event.reason === 'duplicate' && event.requeue !== 'do-not-requeue') {
      throw new ReviewSessionValidationError('A duplicate skip must use do-not-requeue.');
    }
    if (event.reason !== 'duplicate' && event.requeue !== 'next-session') {
      throw new ReviewSessionValidationError('Appropriate non-duplicate skips must return to the future queue.');
    }
  }
}

function unsignedSessionWithEvents(session: ReviewSession, events: readonly ReviewSessionEvent[]): Omit<ReviewSession, 'digest'> {
  return {
    schemaVersion: 1,
    sessionId: session.sessionId,
    definitionDigest: session.definitionDigest,
    definition: session.definition,
    kind: session.kind,
    repositoryStateDigest: session.repositoryStateDigest,
    artifactStateDigest: session.artifactStateDigest,
    stateDigest: session.stateDigest,
    eligiblePoolDigest: session.eligiblePoolDigest,
    seed: session.seed,
    reviewer: session.reviewer,
    qualifiedReviewer: session.qualifiedReviewer,
    priorityFormula: session.priorityFormula,
    orderedCaseIds: session.orderedCaseIds,
    items: session.items,
    sourceCounts: session.sourceCounts,
    skippedCases: session.skippedCases,
    events: [...events],
    ...itemStates(session.items, events),
    revision: events.length,
  };
}

/**
 * Folds an append-only session event stream. The caller must persist only the
 * newly accepted event atomically; expectedRevision is the concurrency CAS.
 */
export function foldReviewSessionEvents(session: ReviewSession, events: readonly ReviewSessionEvent[]): ReviewSession {
  if (session.schemaVersion !== REVIEW_SESSION_SCHEMA_VERSION) throw new ReviewSessionValidationError('Unsupported review-session schema version.');
  assertSessionIntegrity(session);
  if (events.length < session.events.length) throw new ReviewSessionValidationError('Session event log cannot be truncated.');
  for (let index = 0; index < session.events.length; index += 1) {
    if (canonicalJson(events[index]) !== canonicalJson(session.events[index])) throw new ReviewSessionValidationError('Session event log must preserve its append-only prefix.');
  }
  const seenIds = new Set<string>();
  const itemTerminal = new Set<string>();
  let currentRevision = 0;
  let terminal = false;
  for (const event of events) {
    const expectedSessionDigest = digestSession(unsignedSessionWithEvents(session, events.slice(0, currentRevision)));
    validateEvent(event, session, seenIds, currentRevision, expectedSessionDigest, terminal);
    if (event.kind === 'item-completed' || event.kind === 'item-skipped') {
      if (itemTerminal.has(event.caseId)) throw new ReviewSessionValidationError(`Case "${event.caseId}" already has a completion or skip event.`);
      itemTerminal.add(event.caseId);
    } else {
      if (itemTerminal.size !== session.items.length) throw new ReviewSessionValidationError('A session can complete only after every item is completed or skipped.');
      terminal = true;
    }
    seenIds.add(event.eventId);
    currentRevision += 1;
  }
  const base = unsignedSessionWithEvents(session, events);
  return immutable({ ...base, digest: digestSession(base) });
}

export function appendReviewSessionEvent(session: ReviewSession, event: ReviewSessionEvent): ReviewSession {
  return foldReviewSessionEvents(session, [...session.events, event]);
}

/** Hides all holdout membership and query-adjacent identities from proposal generation. */
export function proposalGenerationSessionView(session: ReviewSession): ProposalGenerationSessionView {
  assertSessionIntegrity(session);
  if (session.kind === 'holdout') {
    return immutable({ schemaVersion: 1, kind: session.kind, opaqueMembership: true });
  }
  return immutable({ schemaVersion: 1, sessionId: session.sessionId, kind: session.kind, digest: session.digest, opaqueMembership: false, caseIds: session.orderedCaseIds });
}
