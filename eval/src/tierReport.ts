/**
 * E6 — the tier report: measurable A-tier / S-tier definitions.
 *
 * "Are we A yet?" must be a machine answer. Config A graded C- while the
 * gauntlet said ADMIT, so tier attainment is pinned to objectively
 * computable predicates over the instruments E1-E5 built, and this report
 * is the mega-sweep phase's exit bar: the sweep exits when it prints A-tier
 * MET on the release artifact (S-tier is the standing target, not the
 * sweep's exit condition).
 *
 * Honesty rules, in order of importance:
 *  - every criterion prints MET / NOT MET / NOT EVALUABLE(reason) /
 *    DISABLED; NOT EVALUABLE never satisfies a criterion — the
 *    not-applicable-never-counts-as-pass rule applied to tiers;
 *  - DISABLED is different in kind from NOT EVALUABLE: an explicit, dated
 *    editorial decision recorded in eval/budgets.json removed the criterion,
 *    so it does not block — a measurement gap always does;
 *  - attainment is recomputed from raw evidence (battery outcomes, gate
 *    metrics and findings, rank metrics, committed reviewed data), never
 *    trusted from serialized text — the headlineFor recomputation pattern;
 *  - an unratified (provisional) judgment never fails a gate, but it cannot
 *    CERTIFY a tier either: a provisional harmful #1 prints NOT MET with the
 *    provisional annotation, because certifying "zero harmful #1s" on the
 *    strength of a judgment nobody ratified would be the same self-approval
 *    failure the baselines discipline exists to prevent.
 *
 * The gauntlet embeds this section in the machine report on artifact runs;
 * `npm run tier-report --workspace eval` recomputes and prints it from a
 * machine report plus the committed reviewed data.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  assignGains,
  rangesOverlap,
  verseRangeOfTargetId,
  BATTERY_JUDGMENTS_PATH,
  BATTERY_QUERIES_PATH,
  validateBattery,
  validateRankQualityBlock,
  evaluateRankQuality,
  type BatteryQueryOutcome,
  type RankMetricsReport,
  type RankQualityThresholds,
  type ValidatedBattery,
  type ValidatedBatteryQuery,
  type VerseRange,
} from './gates/rankMetrics.js';
import { GUARD_VACUOUS_CATEGORY, type CorpusFixture } from './gates/corpusGolden.js';

export const TIER_REPORT_SCHEMA = 'scripture-search-engine/tier-report/v1';
export const FLAGSHIP_PATH = 'eval/battery/flagship.json';

/**
 * The typed, cited spelling-correction field the query-robustness aspect's
 * schema lands (0.12.0/0.13.0). A3 reads THIS field, never infers from
 * result presence; until battery outcomes carry it, A3 is NOT EVALUABLE and
 * blocks the tier honestly instead of passing vacuously.
 */
export const CITED_CORRECTION_FIELD = 'citedCorrection';

export type TierCriterionStatus = 'MET' | 'NOT_MET' | 'NOT_EVALUABLE' | 'DISABLED';

export interface TierCriterionResult {
  /** Row id: the plan criterion, split into sub-rows where one carries several conjuncts (A4a-c, S2a-c, S5a-b). */
  readonly id: string;
  /** The plan's criterion this row belongs to (A1..A4, S1..S5). */
  readonly planId: string;
  readonly title: string;
  readonly status: TierCriterionStatus;
  readonly detail: string;
}

export interface TierOutcome {
  readonly tier: 'A' | 'S';
  /** Recomputable from `criteria` via tierAttained — validators must recompute, never trust. */
  readonly attained: boolean;
  readonly criteria: readonly TierCriterionResult[];
}

export interface TierReportSection {
  readonly schema: typeof TIER_REPORT_SCHEMA;
  readonly tiers: readonly TierOutcome[];
}

/**
 * A tier is attained when every criterion is MET or DISABLED-by-decision.
 * NOT EVALUABLE never satisfies; an empty criterion list never attains
 * (a tier with nothing measured is not a tier); a tier consisting only of
 * disabled criteria is not attained either — something must be measured.
 */
export function tierAttained(criteria: readonly { readonly status: TierCriterionStatus }[]): boolean {
  return criteria.some((row) => row.status === 'MET')
    && criteria.every((row) => row.status === 'MET' || row.status === 'DISABLED');
}

// ---------------------------------------------------------------------------
// Reviewed-data validation: eval/budgets.json `tiers` and flagship.json.
// Malformed reviewed data yields null + named problems; criteria that need
// the missing piece then report NOT EVALUABLE — a tier must never be
// computed against a document that failed validation.
// ---------------------------------------------------------------------------

export interface TiersConfig {
  readonly aTierGoodOrBetterTop3RateMicro: number;
  readonly sTierGoodOrBetterTop3RateMicro: number;
  readonly referenceGrammar: readonly { readonly query: string; readonly expectedReference: string }[];
  readonly correctives: { readonly enabled: boolean | null; readonly decidedAt: string | null };
  readonly batteryGrowthWaiver: { readonly grantedAt: string; readonly note: string } | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function contentKeys(record: Record<string, unknown>): string[] {
  return Object.keys(record).filter((key) => !key.startsWith('$comment'));
}

function isMicroBar(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 1000000;
}

function isDay(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateTiersBlock(block: unknown): {
  readonly config: TiersConfig | null;
  readonly problems: readonly string[];
} {
  const problems: string[] = [];
  if (!isRecord(block)) {
    return { config: null, problems: ['eval/budgets.json has no tiers block — tier definitions are reviewed data'] };
  }
  const allowed = ['goodOrBetterTop3RateMicro', 'referenceGrammar', 'correctives', 'batteryGrowth'];
  for (const key of contentKeys(block)) {
    if (!allowed.includes(key)) problems.push(`tiers has unknown field "${key}"`);
  }

  const bars = block['goodOrBetterTop3RateMicro'];
  let aBar = 0;
  let sBar = 0;
  if (!isRecord(bars) || !isMicroBar(bars['aTier']) || !isMicroBar(bars['sTier'])) {
    problems.push('tiers.goodOrBetterTop3RateMicro must carry integer micro bars {aTier, sTier} in 1..1000000');
  } else if ((bars['sTier'] as number) < (bars['aTier'] as number)) {
    problems.push('tiers.goodOrBetterTop3RateMicro.sTier must be at least aTier — S is the harder bar');
  } else {
    aBar = bars['aTier'] as number;
    sBar = bars['sTier'] as number;
  }

  const grammarRaw = block['referenceGrammar'];
  const referenceGrammar: { query: string; expectedReference: string }[] = [];
  if (!Array.isArray(grammarRaw) || grammarRaw.length === 0) {
    problems.push('tiers.referenceGrammar must be a non-empty array of {query, expectedReference} rows');
  } else {
    for (const [index, row] of grammarRaw.entries()) {
      if (!isRecord(row) || contentKeys(row).sort().join(',') !== 'expectedReference,query'
          || !nonEmptyString(row['query']) || !nonEmptyString(row['expectedReference'])) {
        problems.push(`tiers.referenceGrammar[${index}] must be {query, expectedReference} with non-empty strings`);
        continue;
      }
      referenceGrammar.push({ query: row['query'], expectedReference: row['expectedReference'] });
    }
  }

  const correctivesRaw = block['correctives'];
  let correctives: TiersConfig['correctives'] = { enabled: null, decidedAt: null };
  if (!isRecord(correctivesRaw)
      || contentKeys(correctivesRaw).sort().join(',') !== 'decidedAt,enabled'
      || (correctivesRaw['enabled'] !== null && typeof correctivesRaw['enabled'] !== 'boolean')
      || (correctivesRaw['decidedAt'] !== null && !isDay(correctivesRaw['decidedAt']))) {
    problems.push('tiers.correctives must be {enabled: true|false|null, decidedAt: YYYY-MM-DD|null}');
  } else if ((correctivesRaw['enabled'] === null) !== (correctivesRaw['decidedAt'] === null)) {
    // A decision exists exactly when it is dated: an undated decision is not
    // accountable, and a date without a decision is noise.
    problems.push('tiers.correctives.enabled and decidedAt must be null together (undecided) or set together (decided)');
  } else {
    correctives = {
      enabled: correctivesRaw['enabled'] as boolean | null,
      decidedAt: correctivesRaw['decidedAt'] as string | null,
    };
  }

  const growthRaw = block['batteryGrowth'];
  let batteryGrowthWaiver: TiersConfig['batteryGrowthWaiver'] = null;
  if (!isRecord(growthRaw) || contentKeys(growthRaw).join(',') !== 'waiver') {
    problems.push('tiers.batteryGrowth must be {waiver: null | {grantedAt, note}}');
  } else if (growthRaw['waiver'] !== null) {
    const waiver = growthRaw['waiver'];
    if (!isRecord(waiver) || contentKeys(waiver).sort().join(',') !== 'grantedAt,note'
        || !isDay(waiver['grantedAt']) || !nonEmptyString(waiver['note'])) {
      problems.push('tiers.batteryGrowth.waiver must be {grantedAt: YYYY-MM-DD, note} when present');
    } else {
      batteryGrowthWaiver = { grantedAt: waiver['grantedAt'], note: waiver['note'] };
    }
  }

  if (problems.length > 0) return { config: null, problems };
  return {
    config: {
      aTierGoodOrBetterTop3RateMicro: aBar,
      sTierGoodOrBetterTop3RateMicro: sBar,
      referenceGrammar,
      correctives,
      batteryGrowthWaiver,
    },
    problems: [],
  };
}

export interface FlagshipQuery {
  readonly id: string;
  readonly query: string;
  readonly quotedVerse: string;
}

export function validateFlagship(file: unknown): {
  readonly queries: readonly FlagshipQuery[] | null;
  readonly problems: readonly string[];
} {
  const problems: string[] = [];
  if (!isRecord(file)) {
    return { queries: null, problems: [`${FLAGSHIP_PATH} is missing or not a JSON object`] };
  }
  if (file['flagshipVersion'] !== 1) problems.push('flagshipVersion must be 1');
  if (file['ratification'] !== 'pending' && file['ratification'] !== 'ratified') {
    problems.push('ratification must be "pending" (J4 outstanding) or "ratified"');
  }
  for (const key of contentKeys(file)) {
    if (!['flagshipVersion', 'ratification', 'queries'].includes(key)) {
      problems.push(`${FLAGSHIP_PATH} has unknown field "${key}"`);
    }
  }
  const rows = file['queries'];
  const queries: FlagshipQuery[] = [];
  if (!Array.isArray(rows) || rows.length === 0) {
    problems.push('queries must be a non-empty array — an empty flagship list would satisfy A4 vacuously');
  } else {
    const seen = new Set<string>();
    for (const [index, row] of rows.entries()) {
      if (!isRecord(row) || contentKeys(row).sort().join(',') !== 'id,query,quotedVerse'
          || !nonEmptyString(row['id']) || !nonEmptyString(row['query']) || !nonEmptyString(row['quotedVerse'])) {
        problems.push(`queries[${index}] must be {id, query, quotedVerse} with non-empty strings`);
        continue;
      }
      if (seen.has(row['id'])) {
        problems.push(`duplicate flagship id "${row['id']}"`);
        continue;
      }
      seen.add(row['id']);
      queries.push({ id: row['id'], query: row['query'], quotedVerse: row['quotedVerse'] });
    }
  }
  if (problems.length > 0) return { queries: null, problems };
  return { queries, problems: [] };
}

// ---------------------------------------------------------------------------
// Evidence: the raw material criteria are recomputed from. Both GateResult
// (live gauntlet run) and MachineGate (parsed machine report) satisfy
// TierGateEvidence structurally, so one computation serves both callers.
// ---------------------------------------------------------------------------

export interface TierEvidenceFinding {
  readonly categoryCode?: string;
  readonly subjects?: readonly string[];
  readonly params?: Readonly<Record<string, unknown>>;
}

export interface TierGateEvidence {
  readonly gate: string;
  readonly status: string;
  readonly metrics?: Readonly<Record<string, number>>;
  readonly findings?: readonly TierEvidenceFinding[];
}

export interface TierEvidence {
  /** Per-query battery outcomes; null when the battery did not execute. */
  readonly batteryResults: readonly BatteryQueryOutcome[] | null;
  /** The run's gate rows; null when there is no run evidence at all. */
  readonly gates: readonly TierGateEvidence[] | null;
  readonly rankMetrics: RankMetricsReport | null;
}

export interface TierComputationInput {
  readonly tiersConfig: TiersConfig | null;
  readonly flagship: readonly FlagshipQuery[] | null;
  readonly battery: ValidatedBattery;
  readonly thresholds: RankQualityThresholds | null;
  /** Raw golden fixtures as committed (id, status, query, assertion fields). */
  readonly fixtures: readonly CorpusFixture[];
  readonly evidence: TierEvidence;
}

function crit(
  id: string,
  planId: string,
  title: string,
  status: TierCriterionStatus,
  detail: string,
): TierCriterionResult {
  return { id, planId, title, status, detail };
}

function findGate(evidence: TierEvidence, gate: string): TierGateEvidence | null {
  return evidence.gates?.find((row) => row.gate === gate) ?? null;
}

function top10Ranges(outcome: BatteryQueryOutcome): VerseRange[] {
  return outcome.top
    .slice(0, 10)
    .map((entry) => verseRangeOfTargetId(entry.targetId))
    .filter((range): range is VerseRange => range !== null);
}

/** 1-based rank of the first top-10 entry overlapping the range, or null. */
function firstRankOverlapping(outcome: BatteryQueryOutcome, range: VerseRange): number | null {
  for (const entry of outcome.top.slice(0, 10)) {
    const verseRange = verseRangeOfTargetId(entry.targetId);
    if (verseRange !== null && rangesOverlap(verseRange, range)) return entry.rank;
  }
  return null;
}

interface HarmfulPlacement {
  readonly queryId: string;
  readonly ref: string;
  readonly provisional: boolean;
  readonly rank: number;
}

function harmfulPlacements(
  battery: ValidatedBattery,
  outcomes: readonly BatteryQueryOutcome[],
  window: number,
): HarmfulPlacement[] {
  const byId = new Map(outcomes.map((outcome) => [outcome.id, outcome]));
  const placements: HarmfulPlacement[] = [];
  for (const query of battery.queries) {
    const outcome = byId.get(query.id);
    if (outcome === undefined || outcome.kind !== 'discovery') continue;
    for (const harmful of query.harmful) {
      const rank = firstRankOverlapping(outcome, harmful.range);
      if (rank !== null && rank <= window) {
        placements.push({ queryId: query.id, ref: harmful.ref, provisional: harmful.provisional, rank });
      }
    }
  }
  return placements;
}

function describePlacements(placements: readonly HarmfulPlacement[]): string {
  return placements
    .map((placement) =>
      `${placement.queryId} (${placement.ref} at #${placement.rank}` +
      `${placement.provisional ? '; provisional — pending ratification, cannot certify' : ''})`)
    .join(', ');
}

/** Active-fixture guard-vacuity findings for a field, from G3's structured findings. */
function activeGuardVacuities(g3: TierGateEvidence, field: string): string[] {
  return (g3.findings ?? [])
    .filter((finding) => finding.categoryCode === GUARD_VACUOUS_CATEGORY
      && finding.params?.['field'] === field
      && finding.params?.['fixtureStatus'] === 'active')
    .flatMap((finding) => [...(finding.subjects ?? [])]);
}

const NO_RUN_REASON =
  'no artifact run evidence — run the gauntlet against a release/candidate target with --json and pass the report';

function a1(input: TierComputationInput): TierCriterionResult {
  const id = 'A1';
  const title = 'Zero harmful #1s; every harmful and mustNotLead guard able to fire';
  if (input.battery.findings.length > 0) {
    return crit(id, 'A1', title, 'NOT_EVALUABLE', 'battery files failed structural validation');
  }
  const outcomes = input.evidence.batteryResults;
  if (outcomes === null) {
    return crit(id, 'A1', title, 'NOT_EVALUABLE',
      input.evidence.gates === null ? NO_RUN_REASON : 'battery not executed on this run — artifact target required');
  }
  const g12 = findGate(input.evidence, 'G12-battery');
  const g3 = findGate(input.evidence, 'G3-golden');
  const vacuousHarmful = g12?.metrics?.['vacuousHarmfulGuards'];
  const unprobedHarmful = g12?.metrics?.['unprobedHarmfulGuards'];
  if (g12 === null || g3 === null || typeof vacuousHarmful !== 'number' || typeof unprobedHarmful !== 'number') {
    return crit(id, 'A1', title, 'NOT_EVALUABLE',
      'G12/G3 evidence is missing its guard-vacuity accounting — vacuity cannot be certified');
  }
  if (unprobedHarmful > 0) {
    return crit(id, 'A1', title, 'NOT_EVALUABLE',
      `${unprobedHarmful} harmful guard(s) were not probed for corpus presence — a guard that may be ` +
      'unable to fire cannot certify');
  }
  const atRank1 = harmfulPlacements(input.battery, outcomes, 1);
  const vacuousLeads = activeGuardVacuities(g3, 'mustNotLead');
  const problems: string[] = [];
  if (atRank1.length > 0) problems.push(`harmful #1: ${describePlacements(atRank1)}`);
  if (vacuousHarmful > 0) problems.push(`${vacuousHarmful} vacuous battery harmful guard(s)`);
  if (vacuousLeads.length > 0) {
    problems.push(`vacuous active mustNotLead guard(s): ${[...new Set(vacuousLeads)].sort().join(', ')}`);
  }
  if (problems.length > 0) return crit(id, 'A1', title, 'NOT_MET', problems.join('; '));
  const ratifiedGuards = ratifiedHarmfulGuards(input.battery);
  if (ratifiedGuards === 0) {
    // Trivial truth is not certification: with every harmful judgment still
    // provisional (J15/J16 outstanding), "zero harmful #1s" holds over an
    // empty ratified set and says nothing.
    return crit(id, 'A1', title, 'NOT_EVALUABLE',
      'every harmful judgment is provisional (J15/J16 ratification outstanding) — zero-harmful cannot be ' +
      'certified by unratified judgments');
  }
  return crit(id, 'A1', title, 'MET',
    `0 harmful #1s over ${ratifiedGuards} ratified harmful guard(s); every guard able to fire on this corpus`);
}

function ratifiedHarmfulGuards(battery: ValidatedBattery): number {
  return battery.queries.reduce(
    (sum, query) => sum + query.harmful.filter((row) => !row.provisional).length,
    0,
  );
}

interface GoodOrBetterCount {
  readonly good: number;
  readonly scoreable: number;
}

/**
 * Recomputed from raw outcomes and judgments, never read back from the
 * metrics report: provisional judgments never enter (they cannot certify),
 * a query is scoreable when it has at least one ratified judged row with
 * gain >= 1, and good-or-better@3 means a claimed gain >= 2 in the top 3 —
 * the same claim-once matching computeRankMetrics uses, via assignGains.
 */
function goodOrBetterOverBattery(
  battery: ValidatedBattery,
  outcomes: readonly BatteryQueryOutcome[],
): GoodOrBetterCount {
  const byId = new Map(outcomes.map((outcome) => [outcome.id, outcome]));
  let good = 0;
  let scoreable = 0;
  for (const query of battery.queries) {
    const judged = query.judged.filter((row) => !row.provisional);
    if (!judged.some((row) => row.grade >= 1)) continue;
    scoreable += 1;
    const outcome = byId.get(query.id);
    const top10 = outcome !== undefined && outcome.kind === 'discovery' ? top10Ranges(outcome) : [];
    if (assignGains(top10, judged).slice(0, 3).some((gain) => gain >= 2)) good += 1;
  }
  return { good, scoreable };
}

function goodOrBetterCriterion(
  input: TierComputationInput,
  id: string,
  planId: string,
  barMicro: number | null,
  barLabel: string,
): TierCriterionResult {
  const title = `good-or-better@3 ${barLabel} over scoreable battery queries`;
  if (barMicro === null) {
    return crit(id, planId, title, 'NOT_EVALUABLE', 'tiers block unavailable — bar cannot be read');
  }
  if (input.battery.findings.length > 0) {
    return crit(id, planId, title, 'NOT_EVALUABLE', 'battery files failed structural validation');
  }
  const outcomes = input.evidence.batteryResults;
  if (outcomes === null) {
    return crit(id, planId, title, 'NOT_EVALUABLE',
      input.evidence.gates === null ? NO_RUN_REASON : 'battery not executed on this run — artifact target required');
  }
  const { good, scoreable } = goodOrBetterOverBattery(input.battery, outcomes);
  if (scoreable === 0) {
    return crit(id, planId, title, 'NOT_EVALUABLE',
      '0 scoreable battery queries — every battery judgment is provisional pending ratification (J17)');
  }
  // Exact integer cross-multiplication; the display value never decides.
  const met = good * 1000000 >= barMicro * scoreable;
  const detail = `${good}/${scoreable} scoreable queries good-or-better in the top 3 (bar ${barMicro} micro)`;
  return crit(id, planId, title, met ? 'MET' : 'NOT_MET', detail);
}

function grammarHalf(
  config: TiersConfig,
  outcomes: readonly BatteryQueryOutcome[],
): { readonly failures: string[]; readonly unmatched: string[] } {
  const failures: string[] = [];
  const unmatched: string[] = [];
  for (const row of config.referenceGrammar) {
    const outcome = outcomes.find((entry) => entry.query === row.query);
    if (outcome === undefined) {
      unmatched.push(row.query);
      continue;
    }
    if (outcome.kind !== 'reference' || outcome.passageReference !== row.expectedReference) {
      failures.push(
        `"${row.query}" resolved to ${outcome.kind === 'reference' ? `"${outcome.passageReference ?? ''}"` : outcome.kind}, ` +
        `expected "${row.expectedReference}"`,
      );
    }
  }
  return { failures, unmatched };
}

function misspellingAndGrammar(input: TierComputationInput, id: string, planId: string): TierCriterionResult {
  const title = planId === 'S4'
    ? 'Misspelling correction cited + reference grammar parses (= A3, same standard)'
    : 'Misspelling correction cited + reference grammar parses';
  if (input.tiersConfig === null) {
    return crit(id, planId, title, 'NOT_EVALUABLE', 'tiers block unavailable — grammar rows cannot be read');
  }
  if (input.battery.findings.length > 0) {
    return crit(id, planId, title, 'NOT_EVALUABLE', 'battery files failed structural validation');
  }
  const outcomes = input.evidence.batteryResults;
  if (outcomes === null) {
    return crit(id, planId, title, 'NOT_EVALUABLE',
      input.evidence.gates === null ? NO_RUN_REASON : 'battery not executed on this run — artifact target required');
  }
  const byId = new Map(outcomes.map((outcome) => [outcome.id, outcome]));
  const msQueries = input.battery.queries.filter((query) => query.category === 'misspelling');
  const msOutcomes = msQueries
    .map((query) => byId.get(query.id))
    .filter((outcome): outcome is BatteryQueryOutcome => outcome !== undefined);
  const carrying = msOutcomes.filter(
    (outcome) => (outcome as unknown as Record<string, unknown>)[CITED_CORRECTION_FIELD] !== undefined,
  );
  const grammar = grammarHalf(input.tiersConfig, outcomes);
  if (grammar.unmatched.length > 0) {
    return crit(id, planId, title, 'NOT_EVALUABLE',
      `reference-grammar row(s) not present among battery outcomes: ${grammar.unmatched.map((query) => `"${query}"`).join(', ')}`);
  }
  if (carrying.length === 0) {
    return crit(id, planId, title, 'NOT_EVALUABLE',
      `typed cited-correction field ("${CITED_CORRECTION_FIELD}") absent from every misspelling outcome — ` +
      'spelling/alias rung unlanded (0.12.0/0.13.0)' +
      (grammar.failures.length > 0 ? `; grammar half currently failing: ${grammar.failures.join('; ')}` : ''));
  }
  const msFailures = msOutcomes
    .filter((outcome) =>
      (outcome as unknown as Record<string, unknown>)[CITED_CORRECTION_FIELD] === undefined
      || outcome.kind !== 'discovery'
      || outcome.top.length === 0)
    .map((outcome) => outcome.id);
  const problems: string[] = [];
  if (msFailures.length > 0) {
    problems.push(`misspelling quer(ies) without a non-empty cited result set: ${msFailures.join(', ')}`);
  }
  if (grammar.failures.length > 0) problems.push(grammar.failures.join('; '));
  if (problems.length > 0) return crit(id, planId, title, 'NOT_MET', problems.join('; '));
  return crit(id, planId, title, 'MET',
    `${msOutcomes.length} misspelling quer(ies) cite their correction; ` +
    `${input.tiersConfig.referenceGrammar.length} grammar row(s) parse to their expected passage`);
}

function a4a(input: TierComputationInput): TierCriterionResult {
  const title = 'Rank instruments armed: nDCG@10 overall threshold non-null and met';
  if (input.thresholds === null) {
    return crit('A4a', 'A4', title, 'NOT_EVALUABLE', 'rankQuality block unavailable');
  }
  if (input.thresholds.ndcg10.overall === null) {
    return crit('A4a', 'A4', title, 'NOT_MET',
      'rankQuality.ndcg10.overall is null — baseline not yet established (E5 protocol); the instrument is not armed');
  }
  if (input.evidence.rankMetrics === null) {
    return crit('A4a', 'A4', title, 'NOT_EVALUABLE',
      input.evidence.gates === null ? NO_RUN_REASON : 'rank metrics were not computed on this run');
  }
  const evaluation = evaluateRankQuality(input.thresholds, input.evidence.rankMetrics)
    .evaluations
    .find((entry) => entry.metric === 'ndcg10' && entry.scope === 'overall');
  if (evaluation === undefined || evaluation.outcome === 'unmeasurable') {
    return crit('A4a', 'A4', title, 'NOT_MET', 'the set threshold could not be measured (no scoreable queries)');
  }
  return crit('A4a', 'A4', title, evaluation.outcome === 'met' ? 'MET' : 'NOT_MET',
    `nDCG@10 overall ${evaluation.valueMicro ?? 'n/a'} micro vs threshold ${evaluation.thresholdMicro} micro`);
}

function a4b(input: TierComputationInput): TierCriterionResult {
  const title = 'Rank instruments armed: G2 ordering-snapshot approval current';
  if (input.evidence.gates === null) return crit('A4b', 'A4', title, 'NOT_EVALUABLE', NO_RUN_REASON);
  const g2 = findGate(input.evidence, 'G2-determinism');
  if (g2 === null) return crit('A4b', 'A4', title, 'NOT_EVALUABLE', 'no G2 row in the run evidence');
  return g2.status === 'pass'
    ? crit('A4b', 'A4', title, 'MET', 'G2 passes — ordering snapshot and its independent approval are current')
    : crit('A4b', 'A4', title, 'NOT_MET', `G2 status is "${g2.status}" — the ordering approval chain is not green`);
}

/** Effective measurement window of an expectedTop entry (corpusGolden's default rules). */
function expectationWindow(fixture: CorpusFixture, entry: { readonly withinTop?: number }): number {
  return entry.withinTop ?? fixture.expectedWithinTop ?? 10;
}

function a4c(input: TierComputationInput): TierCriterionResult {
  const title = 'Rank instruments armed: every flagship query pinned by an active preferredOrder / withinTop:1 assertion';
  if (input.flagship === null) {
    return crit('A4c', 'A4', title, 'NOT_EVALUABLE', `${FLAGSHIP_PATH} unavailable or malformed`);
  }
  if (input.battery.findings.length > 0) {
    return crit('A4c', 'A4', title, 'NOT_EVALUABLE', 'battery files failed structural validation');
  }
  const activeById = new Map(input.battery.queries.map((query) => [query.id, query]));
  const inconsistent = input.flagship.filter((row) => activeById.get(row.id)?.query !== row.query);
  if (inconsistent.length > 0) {
    return crit('A4c', 'A4', title, 'NOT_EVALUABLE',
      `flagship row(s) do not match an active battery specimen verbatim: ${inconsistent.map((row) => row.id).join(', ')} ` +
      '— reviewed data is inconsistent and cannot certify');
  }
  const uncovered = input.flagship.filter((row) => !input.fixtures.some((fixture) =>
    fixture.status === 'active'
    && fixture.query === row.query
    && ((fixture.preferredOrder?.length ?? 0) > 0
      || (fixture.expectedTop ?? []).some((entry) => expectationWindow(fixture, entry) === 1))));
  if (uncovered.length > 0) {
    return crit('A4c', 'A4', title, 'NOT_MET',
      `${uncovered.length}/${input.flagship.length} flagship quer(ies) lack an active pin: ` +
      `${uncovered.map((row) => row.id).join(', ')} (authoring these pins is ranking-fixes work)`);
  }
  return crit('A4c', 'A4', title, 'MET', `all ${input.flagship.length} flagship queries pinned`);
}

function s2a(input: TierComputationInput): TierCriterionResult {
  const title = 'Zero harmful results in the top 10';
  if (input.battery.findings.length > 0) {
    return crit('S2a', 'S2', title, 'NOT_EVALUABLE', 'battery files failed structural validation');
  }
  const outcomes = input.evidence.batteryResults;
  if (outcomes === null) {
    return crit('S2a', 'S2', title, 'NOT_EVALUABLE',
      input.evidence.gates === null ? NO_RUN_REASON : 'battery not executed on this run — artifact target required');
  }
  const placements = harmfulPlacements(input.battery, outcomes, 10);
  if (placements.length > 0) {
    return crit('S2a', 'S2', title, 'NOT_MET', `harmful in top 10: ${describePlacements(placements)}`);
  }
  const ratifiedGuards = ratifiedHarmfulGuards(input.battery);
  if (ratifiedGuards === 0) {
    return crit('S2a', 'S2', title, 'NOT_EVALUABLE',
      'every harmful judgment is provisional (J15/J16 ratification outstanding) — zero-harmful cannot be ' +
      'certified by unratified judgments');
  }
  return crit('S2a', 'S2', title, 'MET',
    `0 harmful results in any top 10 over ${ratifiedGuards} ratified harmful guard(s)`);
}

function s2b(input: TierComputationInput): TierCriterionResult {
  const title = 'All prosperity-* fixtures active, non-vacuous, and passing';
  const prosperity = input.fixtures.filter((fixture) => fixture.id?.startsWith('prosperity-'));
  if (prosperity.length === 0) {
    return crit('S2b', 'S2', title, 'NOT_EVALUABLE', 'no prosperity-* fixtures found under eval/golden/');
  }
  const inactive = prosperity.filter((fixture) => fixture.status !== 'active').map((fixture) => fixture.id);
  if (inactive.length > 0) {
    return crit('S2b', 'S2', title, 'NOT_MET', `not active: ${inactive.sort().join(', ')}`);
  }
  if (input.evidence.gates === null) return crit('S2b', 'S2', title, 'NOT_EVALUABLE', NO_RUN_REASON);
  const g3 = findGate(input.evidence, 'G3-golden');
  if (g3 === null) return crit('S2b', 'S2', title, 'NOT_EVALUABLE', 'no G3 row in the run evidence');
  const ids = new Set(prosperity.map((fixture) => fixture.id));
  const flagged = [...new Set((g3.findings ?? [])
    .filter((finding) => (finding.subjects ?? []).some((subject) => ids.has(subject)))
    .flatMap((finding) => (finding.subjects ?? []).filter((subject) => ids.has(subject))))].sort();
  if (flagged.length > 0) {
    return crit('S2b', 'S2', title, 'NOT_MET',
      `G3 findings name: ${flagged.join(', ')} — a flagged guard is not cleanly protecting`);
  }
  return crit('S2b', 'S2', title, 'MET', `${prosperity.length} prosperity fixtures active with no G3 findings`);
}

function s2c(input: TierComputationInput): TierCriterionResult {
  const title = 'Prosperity correctives (editorial stance: F14/J9)';
  if (input.tiersConfig === null) {
    return crit('S2c', 'S2', title, 'NOT_EVALUABLE', 'tiers block unavailable — the stance cannot be read');
  }
  const { enabled, decidedAt } = input.tiersConfig.correctives;
  if (enabled === null) {
    return crit('S2c', 'S2', title, 'NOT_EVALUABLE',
      'editorial stance on prosperity correctives is undecided (J9) — awaiting the decision');
  }
  if (enabled === false) {
    return crit('S2c', 'S2', title, 'DISABLED', `by editorial decision ${decidedAt}`);
  }
  return crit('S2c', 'S2', title, 'NOT_EVALUABLE',
    `enabled by editorial decision ${decidedAt}, but the corrective measurement instrument is not yet built ` +
    '(the data-gaps aspect owns the corrective anchors)');
}

function s3(): TierCriterionResult {
  return crit('S3', 'S3', 'Explanation-faithfulness audit: zero misstated reasons for this identity', 'NOT_EVALUABLE',
    'the explanation-faithfulness audit (E7) is not yet built — no audited sample exists in docs/reviews/ for ' +
    'this release identity');
}

function s5a(input: TierComputationInput): TierCriterionResult {
  const title = 'Every per-category nDCG@10 threshold non-null and met';
  if (input.thresholds === null) {
    return crit('S5a', 'S5', title, 'NOT_EVALUABLE', 'rankQuality block unavailable');
  }
  const perCategory = input.thresholds.ndcg10.perCategory;
  const nulls = Object.entries(perCategory)
    .filter(([, threshold]) => threshold === null)
    .map(([category]) => category)
    .sort();
  if (nulls.length > 0) {
    return crit('S5a', 'S5', title, 'NOT_MET',
      `${nulls.length} per-category threshold(s) null — baselines not yet established: ${nulls.join(', ')}`);
  }
  if (input.evidence.rankMetrics === null) {
    return crit('S5a', 'S5', title, 'NOT_EVALUABLE',
      input.evidence.gates === null ? NO_RUN_REASON : 'rank metrics were not computed on this run');
  }
  const evaluations = evaluateRankQuality(input.thresholds, input.evidence.rankMetrics)
    .evaluations
    .filter((entry) => entry.metric === 'ndcg10' && entry.scope !== 'overall');
  const unmet = evaluations.filter((entry) => entry.outcome !== 'met').map((entry) => entry.scope).sort();
  if (unmet.length > 0) {
    return crit('S5a', 'S5', title, 'NOT_MET', `categor(ies) below or unmeasurable: ${unmet.join(', ')}`);
  }
  return crit('S5a', 'S5', title, 'MET', `all ${evaluations.length} per-category thresholds met`);
}

/**
 * S5's process half. The plan's window is "within the last 2 releases";
 * release-cadence metadata does not exist yet, so the mechanical check is
 * additions-exist-or-waiver, and the window sharpens to the 2-release rule
 * when release history becomes machine-readable. Documented, not silent.
 */
function s5b(input: TierComputationInput): TierCriterionResult {
  const title = 'Battery growth alive: mega-sweep / gap-mining additions or a dated waiver';
  if (input.tiersConfig === null) {
    return crit('S5b', 'S5', title, 'NOT_EVALUABLE', 'tiers block unavailable — the waiver state cannot be read');
  }
  const waiver = input.tiersConfig.batteryGrowthWaiver;
  if (waiver !== null) {
    return crit('S5b', 'S5', title, 'MET', `waived ${waiver.grantedAt}: ${waiver.note}`);
  }
  if (input.battery.findings.length > 0) {
    return crit('S5b', 'S5', title, 'NOT_EVALUABLE', 'battery files failed structural validation');
  }
  const grown = input.battery.queries.filter(
    (query: ValidatedBatteryQuery) => /^(mega-sweep|gap-mining)/.test(query.origin),
  );
  if (grown.length === 0) {
    return crit('S5b', 'S5', title, 'NOT_MET',
      'no battery additions from mega-sweep or consented gap-mining beyond the seed transcription, and no waiver ' +
      'recorded in the tiers block');
  }
  return crit('S5b', 'S5', title, 'MET',
    `${grown.length} sweep/gap-mining addition(s): ${grown.map((query) => query.id).sort().join(', ')} ` +
    '(2-release window applies once release history is machine-readable)');
}

export function computeTierReport(input: TierComputationInput): TierReportSection {
  const a3 = misspellingAndGrammar(input, 'A3', 'A3');
  const aCriteria: TierCriterionResult[] = [
    a1(input),
    goodOrBetterCriterion(input, 'A2', 'A2', input.tiersConfig?.aTierGoodOrBetterTop3RateMicro ?? null,
      '>= A bar (proposed 90%, J41)'),
    a3,
    a4a(input),
    a4b(input),
    a4c(input),
  ];
  const sCriteria: TierCriterionResult[] = [
    goodOrBetterCriterion(input, 'S1', 'S1', input.tiersConfig?.sTierGoodOrBetterTop3RateMicro ?? null,
      '>= S bar (proposed 98%, J41)'),
    s2a(input),
    s2b(input),
    s2c(input),
    s3(),
    { ...a3, id: 'S4', planId: 'S4', title: misspellingAndGrammarTitleForS4() },
    s5a(input),
    s5b(input),
  ];
  return {
    schema: TIER_REPORT_SCHEMA,
    tiers: [
      { tier: 'A', attained: tierAttained(aCriteria), criteria: aCriteria },
      { tier: 'S', attained: tierAttained(sCriteria), criteria: sCriteria },
    ],
  };
}

function misspellingAndGrammarTitleForS4(): string {
  return 'Misspelling correction cited + reference grammar parses (= A3, same standard)';
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const STATUS_WORDS: Readonly<Record<TierCriterionStatus, string>> = {
  MET: 'MET',
  NOT_MET: 'NOT MET',
  NOT_EVALUABLE: 'NOT EVALUABLE',
  DISABLED: 'DISABLED',
};

export interface TierReportIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

export function renderTierReport(section: TierReportSection, identity: TierReportIdentity | null): string {
  const lines: string[] = [];
  lines.push('# Tier report');
  lines.push('');
  lines.push(identity === null
    ? 'Identity: no artifact run evidence — criteria needing a run are NOT EVALUABLE below.'
    : `Identity: engine ${identity.engineVersion}, corpus ${identity.corpusFingerprint}, ` +
      `layers ${identity.layerFingerprint}`);
  lines.push('');
  lines.push('NOT EVALUABLE never satisfies a criterion. DISABLED marks an explicit dated editorial');
  lines.push('decision (reviewed data) and does not block — the two are different in kind.');
  for (const tier of section.tiers) {
    lines.push('');
    lines.push(`## ${tier.tier}-tier: ${tier.attained ? 'ATTAINED' : 'NOT ATTAINED'}`);
    lines.push('');
    lines.push('| Criterion | Status | Detail |');
    lines.push('|---|---|---|');
    for (const row of tier.criteria) {
      lines.push(`| ${row.id} — ${row.title} | ${STATUS_WORDS[row.status]} | ${row.detail} |`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// CLI: npm run tier-report --workspace eval -- [--report <machine-report.json>]
//                                              [--require <A|S>]
//
// Recomputes every criterion from the committed reviewed data plus (when
// given) a gauntlet machine report's raw evidence — never from the report's
// own embedded tier section, which is only cross-checked. --require makes
// the exit code the mega-sweep exit bar: nonzero unless the tier is attained.
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');

function readRepoJson(relativePath: string): unknown {
  const path = join(REPO_ROOT, ...relativePath.split('/'));
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}

function loadGoldenFixtures(): CorpusFixture[] {
  const directory = join(REPO_ROOT, 'eval', 'golden');
  return readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(directory, name), 'utf8')) as CorpusFixture);
}

interface ParsedMachineReport {
  readonly identity: TierReportIdentity | null;
  readonly evidence: TierEvidence;
  readonly embedded: unknown;
}

function evidenceFromMachineReport(parsed: unknown): ParsedMachineReport {
  if (!isRecord(parsed) || !isRecord(parsed['payload'])) {
    throw new Error('machine report is not a JSON object with a payload — pass the file --json wrote');
  }
  const payload = parsed['payload'];
  const identityRecord = isRecord(parsed['identity']) ? parsed['identity'] : undefined;
  const engine = identityRecord !== undefined && isRecord(identityRecord['engine']) ? identityRecord['engine'] : undefined;
  const identity: TierReportIdentity | null = engine !== undefined
    && typeof engine['engineVersion'] === 'string'
    && typeof engine['corpusFingerprint'] === 'string'
    && typeof engine['layerFingerprint'] === 'string'
    ? {
      engineVersion: engine['engineVersion'],
      corpusFingerprint: engine['corpusFingerprint'],
      layerFingerprint: engine['layerFingerprint'],
    }
    : null;
  const gates = Array.isArray(payload['gates'])
    ? payload['gates'].filter(isRecord).map((gate) => ({
      gate: String(gate['gate']),
      status: String(gate['status']),
      metrics: isRecord(gate['metrics']) ? gate['metrics'] as Record<string, number> : {},
      findings: Array.isArray(gate['findings'])
        ? gate['findings'].filter(isRecord).map((finding) => ({
          ...(typeof finding['categoryCode'] === 'string' ? { categoryCode: finding['categoryCode'] } : {}),
          subjects: Array.isArray(finding['subjects']) ? finding['subjects'].map(String) : [],
          params: isRecord(finding['params']) ? finding['params'] : {},
        }))
        : [],
    }))
    : null;
  const battery = payload['battery'];
  const batteryResults = isRecord(battery) && Array.isArray(battery['results'])
    ? battery['results'] as unknown as readonly BatteryQueryOutcome[]
    : null;
  const rankMetrics = isRecord(payload['rankMetrics'])
    ? payload['rankMetrics'] as unknown as RankMetricsReport
    : null;
  return {
    identity,
    evidence: { batteryResults, gates, rankMetrics },
    embedded: payload['tiers'],
  };
}

function main(): void {
  const args = process.argv.slice(2);
  let reportPath: string | undefined;
  let requireTier: 'A' | 'S' | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!;
    if (arg === '--report') {
      reportPath = args[index + 1];
      if (reportPath === undefined) throw new Error('--report requires a path to a gauntlet machine report');
      index += 1;
    } else if (arg === '--require') {
      const tier = args[index + 1];
      if (tier !== 'A' && tier !== 'S') throw new Error('--require takes A or S');
      requireTier = tier;
      index += 1;
    } else {
      throw new Error(`Unknown tier-report argument: ${arg}`);
    }
  }

  const budgets = readRepoJson('eval/budgets.json');
  const tiersValidation = validateTiersBlock(isRecord(budgets) ? budgets['tiers'] : undefined);
  const flagshipValidation = validateFlagship(readRepoJson(FLAGSHIP_PATH));
  const rankBaselinePresent = readRepoJson('eval/baselines/rank-metrics.json') !== undefined
    && readRepoJson('eval/baselines/rank-metrics.approval.json') !== undefined;
  const rankQuality = validateRankQualityBlock(
    isRecord(budgets) ? budgets['rankQuality'] : undefined,
    { rankBaselineEstablished: rankBaselinePresent },
  );
  const battery = validateBattery(
    readRepoJson(BATTERY_QUERIES_PATH),
    readRepoJson(BATTERY_JUDGMENTS_PATH),
    rankQuality.thresholds?.battery.categoryFloors ?? null,
  );

  for (const problem of tiersValidation.problems) process.stderr.write(`tiers block: ${problem}\n`);
  for (const problem of flagshipValidation.problems) process.stderr.write(`flagship: ${problem}\n`);

  let parsedReport: ParsedMachineReport | null = null;
  if (reportPath !== undefined) {
    parsedReport = evidenceFromMachineReport(JSON.parse(readFileSync(reportPath, 'utf8')) as unknown);
  }

  const section = computeTierReport({
    tiersConfig: tiersValidation.config,
    flagship: flagshipValidation.queries,
    battery,
    thresholds: rankQuality.thresholds,
    fixtures: loadGoldenFixtures(),
    evidence: parsedReport?.evidence ?? { batteryResults: null, gates: null, rankMetrics: null },
  });
  process.stdout.write(`${renderTierReport(section, parsedReport?.identity ?? null)}\n`);

  // Cross-check, never trust: when the machine report embedded a tier
  // section, its attainment must agree with this recomputation.
  if (parsedReport !== null && parsedReport.embedded !== undefined) {
    const embedded = parsedReport.embedded;
    const recomputed = JSON.stringify(section.tiers.map((tier) => [tier.tier, tier.attained]));
    const claimed = isRecord(embedded) && Array.isArray(embedded['tiers'])
      ? JSON.stringify(embedded['tiers'].filter(isRecord).map((tier) => [tier['tier'], tier['attained']]))
      : 'malformed';
    if (recomputed !== claimed) {
      process.stderr.write(
        `Embedded tier section disagrees with recomputation: embedded ${claimed}, recomputed ${recomputed}.\n`,
      );
      process.exitCode = 1;
      return;
    }
    process.stderr.write('Embedded tier attainment agrees with recomputation from raw evidence.\n');
  }

  if (requireTier !== undefined) {
    const tier = section.tiers.find((entry) => entry.tier === requireTier)!;
    if (!tier.attained) {
      process.stderr.write(`--require ${requireTier}: ${requireTier}-tier NOT ATTAINED — exit 1.\n`);
      process.exitCode = 1;
    }
  }
}

const executedDirectly = process.argv[1] !== undefined
  && import.meta.url === pathToFileURL(process.argv[1]).href;
if (executedDirectly) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  }
}
