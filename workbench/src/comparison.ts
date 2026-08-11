import { createHash } from 'node:crypto';

import type { Reason, ScriptureEngine } from '@jestek-dev/scripture-engine';

/**
 * M8's deliberately closed comparison contract.  This is a domain module,
 * rather than a UI model: callers must declare every query they want to make
 * a claim about and the report records the complete resulting universe.
 */

export const COMPARISON_TOP_LIMIT = 10;

export type ComparisonSourceKind =
  | 'linked-case'
  | 'fixture-active'
  | 'fixture-pending'
  | 'g8-probe'
  | 'calibration'
  | 'holdout'
  | 'affected-concept-case';

export interface ExpectedReferenceOutcome {
  readonly targetId: string;
  readonly withinTop?: 1 | 3 | 5 | 10;
  readonly requiredReasonFamilies?: readonly string[];
  readonly requiredProvenanceSourceIds?: readonly string[];
}

export interface ComparisonQueryDeclaration {
  /** Stable source-owned identifier. Duplicate ids must carry identical data. */
  readonly sourceId: string;
  readonly query: string;
  readonly expected?: ExpectedReferenceOutcome;
  /** A human recorded this as intentional movement before the comparison. */
  readonly expectedChange?: boolean;
}

export interface FixtureComparisonDeclaration extends ComparisonQueryDeclaration {
  readonly fixtureId: string;
  readonly state: 'active' | 'pending';
  readonly queryRole: 'primary' | 'additional';
}

export interface AffectedConceptCaseDeclaration extends ComparisonQueryDeclaration {
  readonly conceptId: string;
}

export interface ComparisonUniverseInput {
  readonly linkedCases: readonly ComparisonQueryDeclaration[];
  readonly fixtureQueries: readonly FixtureComparisonDeclaration[];
  readonly g8Probes: readonly ComparisonQueryDeclaration[];
  readonly calibrationQueries: readonly ComparisonQueryDeclaration[];
  readonly holdoutQueries: readonly ComparisonQueryDeclaration[];
  readonly affectedConceptCases: readonly AffectedConceptCaseDeclaration[];
}

export interface ComparisonMembership {
  readonly kind: ComparisonSourceKind;
  readonly sourceId: string;
  readonly fixtureId?: string;
  readonly queryRole?: 'primary' | 'additional';
  readonly conceptId?: string;
  readonly expected?: ExpectedReferenceOutcome;
  readonly expectedChange: boolean;
}

export interface ComparisonUniverseQuery {
  readonly query: string;
  readonly memberships: readonly ComparisonMembership[];
}

export interface ComparableReason {
  readonly family: string;
  readonly label: string;
  readonly points: number;
  readonly uncappedPoints: number | null;
  readonly capped: boolean;
  readonly provenance: {
    readonly sourceId: string;
    readonly label: string;
    readonly locator: string | null;
    readonly weight: number | null;
  } | null;
}

export interface ComparableResult {
  readonly targetId: string;
  readonly reference: string;
  readonly score: number;
  readonly reasons: readonly ComparableReason[];
}

export interface EngineSnapshot {
  readonly identity: EngineIdentity;
  readonly top10: readonly ComparableResult[];
  /** Measured at execution time and intentionally excluded from report digest. */
  readonly latencyMs: number;
}

export interface EngineIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

export interface ExpectedOutcomeEvaluation {
  readonly expected: ExpectedReferenceOutcome;
  readonly found: boolean;
  readonly rank: number | null;
  readonly reasonFamiliesPresent: readonly string[];
  readonly provenanceSourceIdsPresent: readonly string[];
  readonly requiredReasonFamiliesMissing: readonly string[];
  readonly requiredProvenanceSourceIdsMissing: readonly string[];
  readonly passes: boolean;
}

export interface RankMovement {
  readonly targetId: string;
  readonly referenceRank: number;
  readonly candidateRank: number;
  readonly delta: number;
}

export interface ResultMovement {
  readonly added: readonly string[];
  readonly removed: readonly string[];
  readonly rankMoved: readonly RankMovement[];
  /** A target may hold rank while its evidence changes. */
  readonly reasonChanged: readonly string[];
  readonly provenanceChanged: readonly string[];
  readonly scoreChanged: readonly string[];
  readonly capChanged: readonly string[];
}

export type ComparisonVerdict = 'improved' | 'unchanged' | 'expected-change' | 'ambiguous' | 'regressed';

export interface ComparisonQueryReport {
  readonly query: string;
  readonly memberships: readonly ComparisonMembership[];
  readonly reference: EngineSnapshot;
  readonly candidate: EngineSnapshot;
  readonly expectedReferenceOutcomes: {
    readonly reference: readonly ExpectedOutcomeEvaluation[];
    readonly candidate: readonly ExpectedOutcomeEvaluation[];
  };
  /** Independent gate state; verdict describes movement, not baseline health. */
  readonly expectationStatus: {
    readonly referencePasses: boolean;
    readonly candidatePasses: boolean;
    readonly referenceFailureCount: number;
    readonly candidateFailureCount: number;
  };
  readonly movement: ResultMovement;
  readonly top10Changed: boolean;
  readonly verdict: ComparisonVerdict;
}

export interface ComparisonSummary {
  readonly declaredUniverseSize: number;
  readonly executedQueryCount: number;
  readonly changedTop10QueryCount: number;
  readonly changedTop10ResultCount: number;
  readonly regressionSessionQueryCount: number;
  readonly referenceExpectationFailureQueryCount: number;
  readonly candidateExpectationFailureQueryCount: number;
  readonly candidateAdmissionBlocked: boolean;
  readonly verdictCounts: Readonly<Record<ComparisonVerdict, number>>;
  readonly text: string;
}

export interface ComparisonReport {
  readonly schemaVersion: 1;
  readonly universe: readonly ComparisonUniverseQuery[];
  readonly referenceIdentity: EngineIdentity;
  readonly candidateIdentity: EngineIdentity;
  readonly queries: readonly ComparisonQueryReport[];
  /** All changed queries that were not originally linked cases. */
  readonly regressionSessionQueryIds: readonly string[];
  /** Explicit gate input, including failures inherited unchanged from current. */
  readonly referenceExpectationFailureQueryIds: readonly string[];
  readonly candidateExpectationFailureQueryIds: readonly string[];
  readonly summary: ComparisonSummary;
  /** SHA-256 of canonical report data with timing data excluded. */
  readonly digest: string;
}

export class ComparisonValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ComparisonValidationError';
  }
}

const SOURCE_ORDER: Readonly<Record<ComparisonSourceKind, number>> = {
  'linked-case': 0,
  'fixture-active': 1,
  'fixture-pending': 2,
  'g8-probe': 3,
  calibration: 4,
  holdout: 5,
  'affected-concept-case': 6,
};

function plainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

function digest(value: unknown): string {
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
  if (typeof value !== 'string' || value.trim() === '') throw new ComparisonValidationError(`${label} must be non-empty text.`);
  return value.trim();
}

/**
 * Declared-query normalization is intentionally minimal and explicit: remove
 * leading and trailing whitespace once, then pass that exact string to
 * research(). The engine must echo that exact string in discovery.query.
 */
export function normalizeComparisonQuery(value: unknown, label = 'query'): string {
  return requireText(value, label);
}

function requireFinite(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new ComparisonValidationError(`${label} must be finite.`);
  return value;
}

function normalizedStringSet(values: unknown, label: string): readonly string[] {
  if (values === undefined) return [];
  if (!Array.isArray(values)) throw new ComparisonValidationError(`${label} must be an array.`);
  const normalized = values.map((value, index) => requireText(value, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) throw new ComparisonValidationError(`${label} must not contain duplicates.`);
  return normalized.sort((left, right) => left.localeCompare(right));
}

function normalizeExpected(value: unknown, label: string): ExpectedReferenceOutcome | undefined {
  if (value === undefined) return undefined;
  if (!plainObject(value)) throw new ComparisonValidationError(`${label} must be an object.`);
  const allowed = new Set(['targetId', 'withinTop', 'requiredReasonFamilies', 'requiredProvenanceSourceIds']);
  for (const key of Object.keys(value)) if (!allowed.has(key)) throw new ComparisonValidationError(`${label} has unknown field "${key}".`);
  const targetId = requireText(value.targetId, `${label}.targetId`);
  const withinTop = value.withinTop;
  if (withinTop !== undefined && withinTop !== 1 && withinTop !== 3 && withinTop !== 5 && withinTop !== 10) {
    throw new ComparisonValidationError(`${label}.withinTop must be 1, 3, 5, or 10.`);
  }
  return immutable({
    targetId,
    ...(withinTop === undefined ? {} : { withinTop }),
    ...(value.requiredReasonFamilies === undefined ? {} : { requiredReasonFamilies: normalizedStringSet(value.requiredReasonFamilies, `${label}.requiredReasonFamilies`) }),
    ...(value.requiredProvenanceSourceIds === undefined ? {} : { requiredProvenanceSourceIds: normalizedStringSet(value.requiredProvenanceSourceIds, `${label}.requiredProvenanceSourceIds`) }),
  });
}

function normalizeMembership(kind: ComparisonSourceKind, entry: unknown, index: number): { query: string; membership: ComparisonMembership; sourceFingerprint: string } {
  if (!plainObject(entry)) throw new ComparisonValidationError(`${kind}[${index}] must be an object.`);
  const base = new Set(['sourceId', 'query', 'expected', 'expectedChange']);
  const fixture = kind === 'fixture-active' || kind === 'fixture-pending';
  const affected = kind === 'affected-concept-case';
  if (fixture) { base.add('fixtureId'); base.add('state'); base.add('queryRole'); }
  if (affected) base.add('conceptId');
  for (const key of Object.keys(entry)) if (!base.has(key)) throw new ComparisonValidationError(`${kind}[${index}] has unknown field "${key}".`);
  const sourceId = requireText(entry.sourceId, `${kind}[${index}].sourceId`);
  const query = normalizeComparisonQuery(entry.query, `${kind}[${index}].query`);
  if (entry.expectedChange !== undefined && entry.expectedChange !== true && entry.expectedChange !== false) {
    throw new ComparisonValidationError(`${kind}[${index}].expectedChange must be boolean.`);
  }
  let fixtureId: string | undefined;
  let queryRole: 'primary' | 'additional' | undefined;
  let conceptId: string | undefined;
  if (fixture) {
    fixtureId = requireText(entry.fixtureId, `${kind}[${index}].fixtureId`);
    const expectedState = kind === 'fixture-active' ? 'active' : 'pending';
    if (entry.state !== expectedState) throw new ComparisonValidationError(`${kind}[${index}].state must be ${expectedState}.`);
    if (entry.queryRole !== 'primary' && entry.queryRole !== 'additional') throw new ComparisonValidationError(`${kind}[${index}].queryRole must be primary or additional.`);
    queryRole = entry.queryRole;
  }
  if (affected) conceptId = requireText(entry.conceptId, `${kind}[${index}].conceptId`);
  const expected = normalizeExpected(entry.expected, `${kind}[${index}].expected`);
  const membership = immutable({
    kind, sourceId,
    ...(fixtureId === undefined ? {} : { fixtureId }),
    ...(queryRole === undefined ? {} : { queryRole }),
    ...(conceptId === undefined ? {} : { conceptId }),
    ...(expected === undefined ? {} : { expected }),
    expectedChange: entry.expectedChange === true,
  });
  // Source IDs are global so a stale producer cannot quietly replace a source
  // declaration with another kind or expectation.
  return { query, membership, sourceFingerprint: canonicalJson({ query, membership }) };
}

/** Validates, deduplicates, and stable-orders every declared M8 universe member. */
export function buildComparisonUniverse(input: ComparisonUniverseInput): readonly ComparisonUniverseQuery[] {
  if (!plainObject(input)) throw new ComparisonValidationError('Comparison universe must be an object.');
  const allowed = new Set(['linkedCases', 'fixtureQueries', 'g8Probes', 'calibrationQueries', 'holdoutQueries', 'affectedConceptCases']);
  for (const key of Object.keys(input)) if (!allowed.has(key)) throw new ComparisonValidationError(`Comparison universe has unknown field "${key}".`);
  const lists: readonly [ComparisonSourceKind, unknown][] = [
    ['linked-case', input.linkedCases],
    ['g8-probe', input.g8Probes],
    ['calibration', input.calibrationQueries],
    ['holdout', input.holdoutQueries],
    ['affected-concept-case', input.affectedConceptCases],
  ];
  if (!Array.isArray(input.fixtureQueries)) throw new ComparisonValidationError('fixtureQueries must be an array.');
  const records: { query: string; membership: ComparisonMembership }[] = [];
  const sourceIds = new Map<string, string>();
  for (const [kind, list] of lists) {
    if (!Array.isArray(list)) throw new ComparisonValidationError(`${kind} declarations must be an array.`);
    for (const [index, entry] of list.entries()) {
      const normalized = normalizeMembership(kind, entry, index);
      const previous = sourceIds.get(normalized.membership.sourceId);
      if (previous !== undefined && previous !== normalized.sourceFingerprint) throw new ComparisonValidationError(`Duplicate sourceId "${normalized.membership.sourceId}" has contradictory declarations.`);
      sourceIds.set(normalized.membership.sourceId, normalized.sourceFingerprint);
      if (previous === undefined) records.push(normalized);
    }
  }
  for (const [index, entry] of input.fixtureQueries.entries()) {
    if (!plainObject(entry) || (entry.state !== 'active' && entry.state !== 'pending')) throw new ComparisonValidationError(`fixtureQueries[${index}].state must be active or pending.`);
    const kind: ComparisonSourceKind = entry.state === 'active' ? 'fixture-active' : 'fixture-pending';
    const normalized = normalizeMembership(kind, entry, index);
    const previous = sourceIds.get(normalized.membership.sourceId);
    if (previous !== undefined && previous !== normalized.sourceFingerprint) throw new ComparisonValidationError(`Duplicate sourceId "${normalized.membership.sourceId}" has contradictory declarations.`);
    sourceIds.set(normalized.membership.sourceId, normalized.sourceFingerprint);
    if (previous === undefined) records.push(normalized);
  }
  const byQuery = new Map<string, ComparisonMembership[]>();
  for (const record of records) byQuery.set(record.query, [...(byQuery.get(record.query) ?? []), record.membership]);
  return immutable([...byQuery.entries()].map(([query, memberships]) => ({
    query,
    memberships: memberships.sort((left, right) => SOURCE_ORDER[left.kind] - SOURCE_ORDER[right.kind] || left.sourceId.localeCompare(right.sourceId)),
  })).sort((left, right) => left.query.localeCompare(right.query)));
}

function identityOf(engine: ScriptureEngine): EngineIdentity {
  const identity = {
    engineVersion: requireText(engine.engineVersion, 'engine.engineVersion'),
    corpusFingerprint: requireText(engine.corpusFingerprint, 'engine.corpusFingerprint'),
    layerFingerprint: requireText(engine.layerFingerprint, 'engine.layerFingerprint'),
  };
  return immutable(identity);
}

function sameIdentity(left: EngineIdentity, right: EngineIdentity): boolean {
  return left.engineVersion === right.engineVersion && left.corpusFingerprint === right.corpusFingerprint && left.layerFingerprint === right.layerFingerprint;
}

function normalizeReason(reason: Reason, label: string): ComparableReason {
  if (!plainObject(reason)) throw new ComparisonValidationError(`${label} must be an object.`);
  const points = requireFinite(reason.points, `${label}.points`);
  const uncappedPoints = reason.uncappedPoints === undefined ? null : requireFinite(reason.uncappedPoints, `${label}.uncappedPoints`);
  const provenance = reason.provenance === undefined ? null : immutable({
    sourceId: requireText(reason.provenance.sourceId, `${label}.provenance.sourceId`),
    label: requireText(reason.provenance.label, `${label}.provenance.label`),
    locator: reason.provenance.locator === undefined ? null : requireText(reason.provenance.locator, `${label}.provenance.locator`),
    weight: reason.provenance.weight === undefined ? null : requireFinite(reason.provenance.weight, `${label}.provenance.weight`),
  });
  return immutable({
    family: requireText(reason.family, `${label}.family`), label: requireText(reason.label, `${label}.label`), points,
    uncappedPoints, capped: uncappedPoints !== null && uncappedPoints !== points, provenance,
  });
}

async function capture(engine: ScriptureEngine, expectedIdentity: EngineIdentity, query: string): Promise<EngineSnapshot> {
  const started = performance.now();
  const response = await engine.research(query);
  const latencyMs = performance.now() - started;
  if (!Number.isFinite(latencyMs)) throw new ComparisonValidationError(`Latency for "${query}" is not finite.`);
  const resultIdentity: EngineIdentity = {
    engineVersion: requireText(response.engineVersion, `result identity for "${query}".engineVersion`),
    corpusFingerprint: requireText(response.corpusFingerprint, `result identity for "${query}".corpusFingerprint`),
    layerFingerprint: requireText(response.layerFingerprint, `result identity for "${query}".layerFingerprint`),
  };
  if (!sameIdentity(expectedIdentity, resultIdentity)) throw new ComparisonValidationError(`Engine identity changed while running "${query}".`);
  if (response.kind !== 'discovery') throw new ComparisonValidationError(`Comparison query "${query}" returned ${response.kind}; discovery is required.`);
  if (response.query !== query) throw new ComparisonValidationError(`Comparison query "${query}" was echoed as ${JSON.stringify(response.query)}; an exact discovery.query match is required.`);
  if (!Array.isArray(response.results)) throw new ComparisonValidationError(`Discovery results for "${query}" must be an array.`);
  const seen = new Set<string>();
  let precedingScore = Number.POSITIVE_INFINITY;
  const normalized = response.results.map((result, index) => {
    if (!plainObject(result)) throw new ComparisonValidationError(`result ${index} for "${query}" must be an object.`);
    const targetId = requireText(result.targetId, `result ${index} for "${query}".targetId`);
    if (seen.has(targetId)) throw new ComparisonValidationError(`Discovery results for "${query}" repeat targetId "${targetId}".`);
    seen.add(targetId);
    const score = requireFinite(result.score, `result ${index} for "${query}".score`);
    if (score > precedingScore) throw new ComparisonValidationError(`Discovery results for "${query}" are not in stable descending score order.`);
    precedingScore = score;
    if (!Array.isArray(result.reasons)) throw new ComparisonValidationError(`result ${index} for "${query}".reasons must be an array.`);
    return immutable({
      targetId,
      reference: requireText(result.reference, `result ${index} for "${query}".reference`),
      score,
      reasons: immutable((result.reasons as readonly Reason[]).map((reason: Reason, reasonIndex: number) => normalizeReason(reason, `result ${index} reason ${reasonIndex} for "${query}"`))),
    });
  });
  const top10 = normalized.slice(0, COMPARISON_TOP_LIMIT);
  return immutable({ identity: expectedIdentity, top10: immutable(top10), latencyMs });
}

function rankMap(results: readonly ComparableResult[]): ReadonlyMap<string, number> {
  return new Map(results.map((result, index) => [result.targetId, index + 1]));
}

function reasonShape(reasons: readonly ComparableReason[]): string {
  return canonicalJson(reasons.map(({ family, label, points, uncappedPoints, capped, provenance }) => ({ family, label, points, uncappedPoints, capped, provenance })));
}

function provenanceShape(reasons: readonly ComparableReason[]): string {
  return canonicalJson(reasons.map(({ family, provenance }) => ({ family, provenance })));
}

function capShape(reasons: readonly ComparableReason[]): string {
  return canonicalJson(reasons.map(({ family, capped, points, uncappedPoints }) => ({ family, capped, points, uncappedPoints })));
}

function movementFor(reference: EngineSnapshot, candidate: EngineSnapshot): ResultMovement {
  const refRanks = rankMap(reference.top10);
  const candidateRanks = rankMap(candidate.top10);
  const byRef = new Map(reference.top10.map((result) => [result.targetId, result]));
  const byCandidate = new Map(candidate.top10.map((result) => [result.targetId, result]));
  const shared = [...refRanks.keys()].filter((targetId) => candidateRanks.has(targetId)).sort((left, right) => left.localeCompare(right));
  return immutable({
    added: immutable([...candidateRanks.keys()].filter((targetId) => !refRanks.has(targetId)).sort((left, right) => left.localeCompare(right))),
    removed: immutable([...refRanks.keys()].filter((targetId) => !candidateRanks.has(targetId)).sort((left, right) => left.localeCompare(right))),
    rankMoved: immutable(shared.flatMap((targetId) => {
      const referenceRank = refRanks.get(targetId)!;
      const candidateRank = candidateRanks.get(targetId)!;
      return referenceRank === candidateRank ? [] : [{ targetId, referenceRank, candidateRank, delta: referenceRank - candidateRank }];
    })),
    reasonChanged: immutable(shared.filter((targetId) => reasonShape(byRef.get(targetId)!.reasons) !== reasonShape(byCandidate.get(targetId)!.reasons))),
    provenanceChanged: immutable(shared.filter((targetId) => provenanceShape(byRef.get(targetId)!.reasons) !== provenanceShape(byCandidate.get(targetId)!.reasons))),
    scoreChanged: immutable(shared.filter((targetId) => byRef.get(targetId)!.score !== byCandidate.get(targetId)!.score)),
    capChanged: immutable(shared.filter((targetId) => capShape(byRef.get(targetId)!.reasons) !== capShape(byCandidate.get(targetId)!.reasons))),
  });
}

function evaluateExpected(snapshot: EngineSnapshot, expected: ExpectedReferenceOutcome): ExpectedOutcomeEvaluation {
  const rank = snapshot.top10.findIndex((result) => result.targetId === expected.targetId);
  const result = rank === -1 ? undefined : snapshot.top10[rank];
  const reasonFamiliesPresent = result === undefined ? [] : [...new Set(result.reasons.map((reason) => reason.family))].sort((left, right) => left.localeCompare(right));
  const provenanceSourceIdsPresent = result === undefined ? [] : [...new Set(result.reasons.flatMap((reason) => reason.provenance === null ? [] : [reason.provenance.sourceId]))].sort((left, right) => left.localeCompare(right));
  const requiredReasonFamiliesMissing = (expected.requiredReasonFamilies ?? []).filter((family) => !reasonFamiliesPresent.includes(family));
  const requiredProvenanceSourceIdsMissing = (expected.requiredProvenanceSourceIds ?? []).filter((sourceId) => !provenanceSourceIdsPresent.includes(sourceId));
  const position = rank === -1 ? null : rank + 1;
  return immutable({
    expected, found: result !== undefined, rank: position,
    reasonFamiliesPresent: immutable(reasonFamiliesPresent), provenanceSourceIdsPresent: immutable(provenanceSourceIdsPresent),
    requiredReasonFamiliesMissing: immutable(requiredReasonFamiliesMissing),
    requiredProvenanceSourceIdsMissing: immutable(requiredProvenanceSourceIdsMissing),
    passes: result !== undefined && (expected.withinTop === undefined || position! <= expected.withinTop) && requiredReasonFamiliesMissing.length === 0 && requiredProvenanceSourceIdsMissing.length === 0,
  });
}

function distinctExpectations(memberships: readonly ComparisonMembership[]): readonly ExpectedReferenceOutcome[] {
  const byValue = new Map<string, ExpectedReferenceOutcome>();
  for (const membership of memberships) if (membership.expected !== undefined) byValue.set(canonicalJson(membership.expected), membership.expected);
  return immutable([...byValue.values()].sort((left, right) => canonicalJson(left).localeCompare(canonicalJson(right))));
}

function isChanged(movement: ResultMovement): boolean {
  return movement.added.length > 0 || movement.removed.length > 0 || movement.rankMoved.length > 0 || movement.reasonChanged.length > 0 || movement.scoreChanged.length > 0;
}

function classify(memberships: readonly ComparisonMembership[], movement: ResultMovement, referenceExpected: readonly ExpectedOutcomeEvaluation[], candidateExpected: readonly ExpectedOutcomeEvaluation[]): ComparisonVerdict {
  if (!isChanged(movement)) return 'unchanged';
  // Required explanations are correctness, not presentation. A regression is
  // candidate deterioration, including losing a reason while retaining the
  // right passage; an unchanged inherited failure remains a separate gate.
  if (candidateExpected.some((candidate, index) => expectationDeteriorated(referenceExpected[index]!, candidate))) return 'regressed';
  if (referenceExpected.some((outcome) => !outcome.passes) && candidateExpected.every((outcome) => outcome.passes)) return 'improved';
  if (memberships.some((membership) => membership.expectedChange)) return 'expected-change';
  return 'ambiguous';
}

function strictSuperset(candidate: readonly string[], reference: readonly string[]): boolean {
  return reference.every((value) => candidate.includes(value)) && candidate.some((value) => !reference.includes(value));
}

function expectationDeteriorated(reference: ExpectedOutcomeEvaluation, candidate: ExpectedOutcomeEvaluation): boolean {
  if (reference.passes && !candidate.passes) return true;
  if (reference.found && !candidate.found) return true;
  if (reference.rank !== null && candidate.rank !== null && candidate.rank > reference.rank) return true;
  return strictSuperset(candidate.requiredReasonFamiliesMissing, reference.requiredReasonFamiliesMissing)
    || strictSuperset(candidate.requiredProvenanceSourceIdsMissing, reference.requiredProvenanceSourceIdsMissing);
}

function changedTargetCount(movement: ResultMovement): number {
  return new Set([
    ...movement.added, ...movement.removed, ...movement.rankMoved.map((change) => change.targetId),
    ...movement.reasonChanged, ...movement.scoreChanged, ...movement.capChanged,
  ]).size;
}

function digestProjection(report: Omit<ComparisonReport, 'digest'>): unknown {
  return {
    ...report,
    queries: report.queries.map((query) => ({
      ...query,
      reference: { identity: query.reference.identity, top10: query.reference.top10 },
      candidate: { identity: query.candidate.identity, top10: query.candidate.top10 },
    })),
  };
}

/**
 * Executes the entire declared universe, in lexical query order. It accepts no
 * sample limit or filter by design: omission is a data-contract error, not an
 * optimization knob hidden in the comparison path.
 */
export async function compareEngines(input: ComparisonUniverseInput, referenceEngine: ScriptureEngine, candidateEngine: ScriptureEngine): Promise<ComparisonReport> {
  const universe = buildComparisonUniverse(input);
  const referenceIdentity = identityOf(referenceEngine);
  const candidateIdentity = identityOf(candidateEngine);
  const queries: ComparisonQueryReport[] = [];
  for (const universeQuery of universe) {
    const reference = await capture(referenceEngine, referenceIdentity, universeQuery.query);
    const candidate = await capture(candidateEngine, candidateIdentity, universeQuery.query);
    const expected = distinctExpectations(universeQuery.memberships);
    const referenceExpected = immutable(expected.map((outcome) => evaluateExpected(reference, outcome)));
    const candidateExpected = immutable(expected.map((outcome) => evaluateExpected(candidate, outcome)));
    const movement = movementFor(reference, candidate);
    const expectationStatus = immutable({
      referencePasses: referenceExpected.every((outcome) => outcome.passes),
      candidatePasses: candidateExpected.every((outcome) => outcome.passes),
      referenceFailureCount: referenceExpected.filter((outcome) => !outcome.passes).length,
      candidateFailureCount: candidateExpected.filter((outcome) => !outcome.passes).length,
    });
    queries.push(immutable({
      query: universeQuery.query, memberships: universeQuery.memberships, reference, candidate,
      expectedReferenceOutcomes: immutable({ reference: referenceExpected, candidate: candidateExpected }),
      expectationStatus, movement, top10Changed: isChanged(movement),
      verdict: classify(universeQuery.memberships, movement, referenceExpected, candidateExpected),
    }));
  }
  const regressionSessionQueryIds = immutable(queries
    .filter((query) => query.top10Changed && !query.memberships.some((membership) => membership.kind === 'linked-case'))
    .map((query) => query.query));
  const referenceExpectationFailureQueryIds = immutable(queries.filter((query) => !query.expectationStatus.referencePasses).map((query) => query.query));
  const candidateExpectationFailureQueryIds = immutable(queries.filter((query) => !query.expectationStatus.candidatePasses).map((query) => query.query));
  const verdictCounts: Record<ComparisonVerdict, number> = { improved: 0, unchanged: 0, 'expected-change': 0, ambiguous: 0, regressed: 0 };
  for (const query of queries) verdictCounts[query.verdict] += 1;
  const changed = queries.filter((query) => query.top10Changed);
  const summary = immutable({
    declaredUniverseSize: universe.length,
    executedQueryCount: queries.length,
    changedTop10QueryCount: changed.length,
    changedTop10ResultCount: changed.reduce((sum, query) => sum + changedTargetCount(query.movement), 0),
    regressionSessionQueryCount: regressionSessionQueryIds.length,
    referenceExpectationFailureQueryCount: referenceExpectationFailureQueryIds.length,
    candidateExpectationFailureQueryCount: candidateExpectationFailureQueryIds.length,
    candidateAdmissionBlocked: candidateExpectationFailureQueryIds.length > 0,
    verdictCounts: immutable(verdictCounts),
    text: `Compared ${queries.length}/${universe.length} declared queries; ${changed.length} changed top-10 lists (${changed.reduce((sum, query) => sum + changedTargetCount(query.movement), 0)} changed targets); ${verdictCounts.improved} improved, ${verdictCounts.unchanged} unchanged, ${verdictCounts['expected-change']} expected-change, ${verdictCounts.ambiguous} ambiguous, ${verdictCounts.regressed} regressed; ${candidateExpectationFailureQueryIds.length} candidate expectation failures; ${regressionSessionQueryIds.length} outside linked cases require regression review.`,
  });
  const withoutDigest = {
    schemaVersion: 1 as const, universe, referenceIdentity, candidateIdentity, queries: immutable(queries),
    regressionSessionQueryIds, referenceExpectationFailureQueryIds, candidateExpectationFailureQueryIds, summary,
  };
  return immutable({ ...withoutDigest, digest: digest(digestProjection(withoutDigest)) });
}

/** Recomputes the deterministic digest after removing only latency fields. */
export function calculateComparisonReportDigest(report: ComparisonReport): string {
  if (!plainObject(report) || report.schemaVersion !== 1 || !Array.isArray(report.queries)) {
    throw new ComparisonValidationError('Comparison report shape is invalid.');
  }
  const { digest: _storedDigest, ...content } = report;
  return digest(digestProjection(content));
}

export function assertComparisonReportIntegrity(report: ComparisonReport): void {
  if (!/^[a-f0-9]{64}$/.test(report.digest) || calculateComparisonReportDigest(report) !== report.digest) {
    throw new ComparisonValidationError('Comparison report digest does not match its deterministic content.');
  }
}
