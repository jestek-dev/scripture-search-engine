/**
 * E6 — measurable A-tier / S-tier definitions: the tier report.
 *
 * Every criterion is a predicate over raw evidence, and every predicate gets
 * a boundary test here: the exact input where it flips MET/NOT MET
 * (including the micro-integer cross-multiplication edge a float comparison
 * would get wrong), NOT EVALUABLE propagation (one unmeasurable criterion
 * means the tier is not attained), and the DISABLED-by-decision distinction
 * (an explicit dated editorial decision does not block; a measurement gap
 * always does). The committed-state test pins today's honest answer so the
 * report can never drift into optimism silently.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  computeTierReport,
  renderTierReport,
  tierAttained,
  validateFlagship,
  validateTiersBlock,
  TIER_REPORT_SCHEMA,
  type TierComputationInput,
  type TierCriterionResult,
  type TierGateEvidence,
  type TierReportSection,
  type TiersConfig,
} from '../src/tierReport.js';
import {
  validateBattery,
  type BatteryQueryOutcome,
  type RankMetricsReport,
  type RankQualityThresholds,
  type ValidatedBattery,
  type ValidatedBatteryQuery,
} from '../src/gates/rankMetrics.js';
import { GUARD_VACUOUS_CATEGORY, type CorpusFixture } from '../src/gates/corpusGolden.js';

const EVAL_ROOT = fileURLToPath(new URL('..', import.meta.url));

function committedJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(EVAL_ROOT, '..', ...relativePath.split('/')), 'utf8')) as unknown;
}

function committedBudgets(): Record<string, unknown> {
  return committedJson('eval/budgets.json') as Record<string, unknown>;
}

function committedFixtures(): CorpusFixture[] {
  const directory = join(EVAL_ROOT, 'golden');
  return readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(directory, name), 'utf8')) as CorpusFixture);
}

// ---------------------------------------------------------------------------
// Synthetic input builders. Verse ids are opaque integers to the tier
// report, so small literals keep the fixtures readable.
// ---------------------------------------------------------------------------

function config(overrides: Partial<TiersConfig> = {}): TiersConfig {
  return {
    aTierGoodOrBetterTop3RateMicro: 900000,
    sTierGoodOrBetterTop3RateMicro: 980000,
    referenceGrammar: [{ query: 'John 3 16', expectedReference: 'John 3:16' }],
    correctives: { enabled: null, decidedAt: null },
    batteryGrowthWaiver: null,
    ...overrides,
  };
}

interface QuerySpec {
  readonly id: string;
  readonly category?: string;
  readonly query?: string;
  readonly judged?: readonly { start: number; grade: 0 | 1 | 2 | 3; provisional?: boolean }[];
  readonly harmful?: readonly { start: number; provisional?: boolean }[];
  readonly origin?: string;
}

function batteryOf(specs: readonly QuerySpec[]): ValidatedBattery {
  const queries: ValidatedBatteryQuery[] = specs.map((spec) => ({
    id: spec.id,
    query: spec.query ?? `query ${spec.id}`,
    category: (spec.category ?? 'felt-need') as ValidatedBatteryQuery['category'],
    addedAt: '2026-08-20',
    origin: spec.origin ?? 'search-quality-report-2026-08-20 §6',
    judged: (spec.judged ?? []).map((row) => ({
      ref: `Ref ${row.start}`,
      grade: row.grade,
      provisional: row.provisional ?? false,
      range: { start: row.start, end: row.start },
    })),
    harmful: (spec.harmful ?? []).map((row) => ({
      ref: `Harmful ${row.start}`,
      why: 'synthetic harmful judgment',
      provisional: row.provisional ?? false,
      range: { start: row.start, end: row.start },
    })),
    legitimatelyEmpty: false,
  }));
  return {
    batteryVersion: 1,
    queries,
    activeQueries: queries.length,
    judgedRows: queries.reduce((sum, query) => sum + query.judged.length, 0),
    harmfulRows: queries.reduce((sum, query) => sum + query.harmful.length, 0),
    provisionalRows: 0,
    findings: [],
  };
}

function outcomeOf(id: string, verseIds: readonly number[], query = `query ${id}`): BatteryQueryOutcome {
  return {
    id,
    query,
    kind: 'discovery',
    top: verseIds.map((verseId, index) => ({
      rank: index + 1,
      targetId: `WEB:${verseId}`,
      reference: `Ref ${verseId}`,
      score: 1,
      families: ['token_overlap'],
    })),
  };
}

function referenceOutcomeOf(id: string, query: string, passageReference: string): BatteryQueryOutcome {
  return { id, query, kind: 'reference', top: [], passageReference };
}

/** Simulates the typed cited-correction field the 0.12.0 schema will carry. */
function withCitation(outcome: BatteryQueryOutcome): BatteryQueryOutcome {
  return { ...outcome, citedCorrection: { corrected: 'simulated' } } as unknown as BatteryQueryOutcome;
}

function cleanGates(overrides: Partial<Record<string, Partial<TierGateEvidence>>> = {}): TierGateEvidence[] {
  const base: TierGateEvidence[] = [
    { gate: 'G2-determinism', status: 'pass', findings: [] },
    { gate: 'G3-golden', status: 'pass', findings: [] },
    {
      gate: 'G12-battery',
      status: 'pass',
      metrics: { vacuousHarmfulGuards: 0, unprobedHarmfulGuards: 0 },
      findings: [],
    },
  ];
  return base.map((gate) => ({ ...gate, ...(overrides[gate.gate] ?? {}) }));
}

const NULL_THRESHOLDS: RankQualityThresholds = {
  ndcg10: {
    overall: null,
    perCategory: {
      'felt-need': null,
      'single-word': null,
      'remembered-phrase': null,
      'theological-term': null,
      'reference-adjacent': null,
      'misspelling': null,
      'adversarial': null,
      'multi-concept': null,
      'worship-leader': null,
    },
  },
  mrr10: null,
  goodOrBetterTop3Rate: null,
  battery: {
    categoryFloors: {
      'felt-need': 1,
      'single-word': 1,
      'remembered-phrase': 1,
      'theological-term': 1,
      'reference-adjacent': 1,
      'misspelling': 1,
      'adversarial': 1,
      'multi-concept': 1,
      'worship-leader': 1,
    },
  },
  spelling: { noSilentEmpty: null },
  references: { grammarCoverage: null },
};

function metricsOf(overallNdcgExact: string | null, perCategoryExact: Record<string, string> = {}): RankMetricsReport {
  const aggregate = (exact: string | null) => ({
    scoreableQueries: exact === null ? 0 : 1,
    excludedQueries: 0,
    ndcg10: exact === null
      ? { exact: null, micro: null }
      : { exact, micro: 500000 },
    mrr10: { exact: null, micro: null },
    goodOrBetterTop3Rate: { exact: null, micro: null },
    recallAt50: { exact: null, micro: null },
  });
  return {
    gainScale: 'linear-0-1-2-3',
    overall: aggregate(overallNdcgExact),
    perCategory: Object.fromEntries(
      Object.entries(perCategoryExact).map(([category, exact]) => [category, aggregate(exact)]),
    ),
    queries: [],
  };
}

function input(overrides: Partial<TierComputationInput> = {}): TierComputationInput {
  return {
    tiersConfig: config(),
    flagship: [],
    battery: batteryOf([]),
    thresholds: NULL_THRESHOLDS,
    fixtures: [],
    evidence: { batteryResults: [], gates: cleanGates(), rankMetrics: null },
    ...overrides,
  };
}

function criterion(section: TierReportSection, id: string): TierCriterionResult {
  const found = section.tiers
    .flatMap((tier) => tier.criteria)
    .find((row) => row.id === id);
  if (found === undefined) throw new Error(`criterion ${id} missing from tier report`);
  return found;
}

// ---------------------------------------------------------------------------
// Reviewed-data validation
// ---------------------------------------------------------------------------

describe('validateTiersBlock', () => {
  it('accepts the committed eval/budgets.json tiers block with the proposed 90/98 bars', () => {
    const { config: parsed, problems } = validateTiersBlock(committedBudgets()['tiers']);
    expect(problems).toEqual([]);
    expect(parsed?.aTierGoodOrBetterTop3RateMicro).toBe(900000);
    expect(parsed?.sTierGoodOrBetterTop3RateMicro).toBe(980000);
    expect(parsed?.referenceGrammar.length).toBe(4);
    // Correctives land UNDECIDED — the decision is Jesse's (J9), and the
    // committed neutral state must be the no-decision one.
    expect(parsed?.correctives).toEqual({ enabled: null, decidedAt: null });
    expect(parsed?.batteryGrowthWaiver).toBeNull();
  });

  it('rejects a missing block, non-integer bars, and an S bar below the A bar', () => {
    expect(validateTiersBlock(undefined).config).toBeNull();
    const bad = (bars: Record<string, unknown>) =>
      validateTiersBlock({
        goodOrBetterTop3RateMicro: bars,
        referenceGrammar: [{ query: 'q', expectedReference: 'R 1:1' }],
        correctives: { enabled: null, decidedAt: null },
        batteryGrowth: { waiver: null },
      });
    expect(bad({ aTier: 0.9, sTier: 980000 }).config).toBeNull();
    expect(bad({ aTier: 0, sTier: 980000 }).config).toBeNull();
    expect(bad({ aTier: 900000, sTier: 1000001 }).config).toBeNull();
    const inverted = bad({ aTier: 980000, sTier: 900000 });
    expect(inverted.config).toBeNull();
    expect(inverted.problems.join(' ')).toMatch(/sTier/);
  });

  it('requires a decision date exactly when the correctives decision exists', () => {
    const block = (correctives: Record<string, unknown>) =>
      validateTiersBlock({
        goodOrBetterTop3RateMicro: { aTier: 900000, sTier: 980000 },
        referenceGrammar: [{ query: 'q', expectedReference: 'R 1:1' }],
        correctives,
        batteryGrowth: { waiver: null },
      });
    expect(block({ enabled: true, decidedAt: '2026-09-01' }).problems).toEqual([]);
    expect(block({ enabled: false, decidedAt: '2026-09-01' }).problems).toEqual([]);
    expect(block({ enabled: true, decidedAt: null }).config).toBeNull();
    expect(block({ enabled: null, decidedAt: '2026-09-01' }).config).toBeNull();
    expect(block({ enabled: 'yes', decidedAt: '2026-09-01' }).config).toBeNull();
  });

  it('rejects malformed grammar rows and waivers', () => {
    const withRows = (referenceGrammar: unknown, waiver: unknown = null) =>
      validateTiersBlock({
        goodOrBetterTop3RateMicro: { aTier: 900000, sTier: 980000 },
        referenceGrammar,
        correctives: { enabled: null, decidedAt: null },
        batteryGrowth: { waiver },
      });
    expect(withRows([]).config).toBeNull();
    expect(withRows([{ query: 'q' }]).config).toBeNull();
    expect(withRows([{ query: '', expectedReference: 'R 1:1' }]).config).toBeNull();
    expect(withRows([{ query: 'q', expectedReference: 'R 1:1' }], { grantedAt: '2026-09-01' }).config).toBeNull();
    const waived = withRows(
      [{ query: 'q', expectedReference: 'R 1:1' }],
      { grantedAt: '2026-09-01', note: 'sweep window slipped one release' },
    );
    expect(waived.problems).toEqual([]);
    expect(waived.config?.batteryGrowthWaiver?.grantedAt).toBe('2026-09-01');
  });
});

describe('validateFlagship', () => {
  it('accepts the committed flagship list, pending J4 ratification, matching battery rows verbatim', () => {
    const { queries, problems } = validateFlagship(committedJson('eval/battery/flagship.json'));
    expect(problems).toEqual([]);
    expect(queries?.map((row) => row.id)).toEqual(['ph2', 'ph3', 'ph4', 'ph6', 'ph9', 'ph10']);
    const batteryFile = committedJson('eval/battery/queries.json') as {
      queries: readonly { id: string; query: string; status: string }[];
    };
    for (const row of queries ?? []) {
      const specimen = batteryFile.queries.find((entry) => entry.id === row.id);
      expect(specimen?.status).toBe('active');
      expect(specimen?.query).toBe(row.query);
    }
  });

  it('rejects an empty list, duplicate ids, and missing fields', () => {
    const file = (queries: unknown) => validateFlagship({ flagshipVersion: 1, ratification: 'pending', queries });
    expect(file([]).queries).toBeNull();
    expect(file([{ id: 'ph2', query: 'q', quotedVerse: 'John 3:16' },
      { id: 'ph2', query: 'q2', quotedVerse: 'John 3:16' }]).queries).toBeNull();
    expect(file([{ id: 'ph2', query: 'q' }]).queries).toBeNull();
    expect(validateFlagship({ flagshipVersion: 2, ratification: 'pending', queries: [] }).queries).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// A1 — zero harmful #1s, every guard able to fire
// ---------------------------------------------------------------------------

describe('A1', () => {
  const oneHarmful = (provisional: boolean) => batteryOf([
    { id: 'ad1', harmful: [{ start: 100, provisional }], judged: [{ start: 200, grade: 3 }] },
  ]);

  it('is MET when the harmful ref sits below #1 and every guard can fire', () => {
    const report = computeTierReport(input({
      battery: oneHarmful(false),
      evidence: { batteryResults: [outcomeOf('ad1', [200, 100])], gates: cleanGates(), rankMetrics: null },
    }));
    expect(criterion(report, 'A1').status).toBe('MET');
  });

  it('is NOT MET on a ratified harmful #1, naming the query', () => {
    const report = computeTierReport(input({
      battery: oneHarmful(false),
      evidence: { batteryResults: [outcomeOf('ad1', [100, 200])], gates: cleanGates(), rankMetrics: null },
    }));
    const row = criterion(report, 'A1');
    expect(row.status).toBe('NOT_MET');
    expect(row.detail).toContain('ad1');
  });

  it('is NOT MET on a provisional harmful #1 — an unratified judgment cannot certify a tier', () => {
    const report = computeTierReport(input({
      battery: oneHarmful(true),
      evidence: { batteryResults: [outcomeOf('ad1', [100, 200])], gates: cleanGates(), rankMetrics: null },
    }));
    const row = criterion(report, 'A1');
    expect(row.status).toBe('NOT_MET');
    expect(row.detail).toContain('ad1');
    expect(row.detail).toContain('provisional');
  });

  it('is NOT MET when a battery harmful guard is vacuous', () => {
    const report = computeTierReport(input({
      battery: oneHarmful(false),
      evidence: {
        batteryResults: [outcomeOf('ad1', [200])],
        gates: cleanGates({ 'G12-battery': { metrics: { vacuousHarmfulGuards: 1, unprobedHarmfulGuards: 0 } } }),
        rankMetrics: null,
      },
    }));
    const row = criterion(report, 'A1');
    expect(row.status).toBe('NOT_MET');
    expect(row.detail).toMatch(/vacuous/i);
  });

  it('is NOT MET when an ACTIVE fixture mustNotLead guard is vacuous, and unaffected by a pending one', () => {
    const vacuity = (fixtureStatus: string) => cleanGates({
      'G3-golden': {
        findings: [{
          categoryCode: GUARD_VACUOUS_CATEGORY,
          subjects: ['holy-spirit-the-comforter'],
          params: { field: 'mustNotLead', ref: 'Job 16:2', fixtureStatus },
        }],
      },
    });
    const active = computeTierReport(input({
      battery: oneHarmful(false),
      evidence: { batteryResults: [outcomeOf('ad1', [200])], gates: vacuity('active'), rankMetrics: null },
    }));
    expect(criterion(active, 'A1').status).toBe('NOT_MET');
    expect(criterion(active, 'A1').detail).toContain('holy-spirit-the-comforter');
    const pending = computeTierReport(input({
      battery: oneHarmful(false),
      evidence: { batteryResults: [outcomeOf('ad1', [200])], gates: vacuity('pending'), rankMetrics: null },
    }));
    expect(criterion(pending, 'A1').status).toBe('MET');
  });

  it('is NOT EVALUABLE when guards were not probed, when the battery did not run, and when G12 evidence is missing', () => {
    const unprobed = computeTierReport(input({
      battery: oneHarmful(false),
      evidence: {
        batteryResults: [outcomeOf('ad1', [200])],
        gates: cleanGates({ 'G12-battery': { metrics: { vacuousHarmfulGuards: 0, unprobedHarmfulGuards: 2 } } }),
        rankMetrics: null,
      },
    }));
    expect(criterion(unprobed, 'A1').status).toBe('NOT_EVALUABLE');
    const noRun = computeTierReport(input({
      battery: oneHarmful(false),
      evidence: { batteryResults: null, gates: null, rankMetrics: null },
    }));
    expect(criterion(noRun, 'A1').status).toBe('NOT_EVALUABLE');
    const noG12 = computeTierReport(input({
      battery: oneHarmful(false),
      evidence: {
        batteryResults: [outcomeOf('ad1', [200])],
        gates: cleanGates().filter((gate) => gate.gate !== 'G12-battery'),
        rankMetrics: null,
      },
    }));
    expect(criterion(noG12, 'A1').status).toBe('NOT_EVALUABLE');
  });

  it('cannot certify over an all-provisional harmful set — trivial truth is not certification', () => {
    const report = computeTierReport(input({
      battery: oneHarmful(true),
      evidence: { batteryResults: [outcomeOf('ad1', [200])], gates: cleanGates(), rankMetrics: null },
    }));
    expect(criterion(report, 'A1').status).toBe('NOT_EVALUABLE');
    expect(criterion(report, 'A1').detail).toMatch(/provisional/);
    expect(criterion(report, 'S2a').status).toBe('NOT_EVALUABLE');
  });
});

// ---------------------------------------------------------------------------
// A2 / S1 — good-or-better@3 bars, exact integer comparison
// ---------------------------------------------------------------------------

describe('A2 and S1', () => {
  const nineOfTen = () => {
    const specs: QuerySpec[] = [];
    const outcomes: BatteryQueryOutcome[] = [];
    for (let index = 0; index < 10; index += 1) {
      const id = `fn${index + 1}`;
      specs.push({ id, judged: [{ start: 1000 + index, grade: 3 }] });
      // Query fn10 misses its judged passage entirely; the other nine hit at #1.
      outcomes.push(outcomeOf(id, index === 9 ? [9999] : [1000 + index]));
    }
    return { specs, outcomes };
  };

  it('meets the 90% bar and misses the 98% bar on the same 9/10 evidence', () => {
    const { specs, outcomes } = nineOfTen();
    const report = computeTierReport(input({
      battery: batteryOf(specs),
      evidence: { batteryResults: outcomes, gates: cleanGates(), rankMetrics: null },
    }));
    expect(criterion(report, 'A2').status).toBe('MET');
    expect(criterion(report, 'A2').detail).toContain('9/10');
    expect(criterion(report, 'S1').status).toBe('NOT_MET');
  });

  it('compares by integer cross-multiplication at the 1/3 edge where floats mislead', () => {
    const oneOfThree = {
      battery: batteryOf([
        { id: 'fn1', judged: [{ start: 1, grade: 3 }] },
        { id: 'fn2', judged: [{ start: 2, grade: 3 }] },
        { id: 'fn3', judged: [{ start: 3, grade: 3 }] },
      ]),
      evidence: {
        batteryResults: [outcomeOf('fn1', [1]), outcomeOf('fn2', [999]), outcomeOf('fn3', [999])],
        gates: cleanGates(),
        rankMetrics: null,
      },
    };
    const below = computeTierReport(input({
      ...oneOfThree,
      tiersConfig: config({ aTierGoodOrBetterTop3RateMicro: 333334 }),
    }));
    expect(criterion(below, 'A2').status).toBe('NOT_MET');
    const at = computeTierReport(input({
      ...oneOfThree,
      tiersConfig: config({ aTierGoodOrBetterTop3RateMicro: 333333 }),
    }));
    expect(criterion(at, 'A2').status).toBe('MET');
  });

  it('pins the numerator predicate boundaries: grade 2 counts, grade 1 alone does not, the window ends at rank 3', () => {
    // Bar at 100% over a single scoreable query, so MET is exactly "this
    // query counted" — each case isolates one edge of good-or-better@3.
    const oneQuery = (grade: 1 | 2 | 3, hitRank: 1 | 3 | 4) => {
      const filler = [901, 902, 903].slice(0, hitRank - 1);
      const report = computeTierReport(input({
        battery: batteryOf([{ id: 'fn1', judged: [{ start: 1, grade }] }]),
        tiersConfig: config({ aTierGoodOrBetterTop3RateMicro: 1000000 }),
        evidence: { batteryResults: [outcomeOf('fn1', [...filler, 1])], gates: cleanGates(), rankMetrics: null },
      }));
      return criterion(report, 'A2');
    };
    // A good (grade-2) passage in the top 3 counts — the predicate is
    // gain >= 2, not gain >= 3.
    expect(oneQuery(2, 3).status).toBe('MET');
    expect(oneQuery(2, 3).detail).toContain('1/1');
    // A merely-relevant (grade-1) #1 keeps the query scoreable but never
    // counts as good-or-better: 0/1, not excluded from the denominator.
    expect(oneQuery(1, 1).status).toBe('NOT_MET');
    expect(oneQuery(1, 1).detail).toContain('0/1');
    // The window is exactly @3: an excellent hit at rank 4 does not count.
    expect(oneQuery(3, 4).status).toBe('NOT_MET');
    expect(oneQuery(3, 4).detail).toContain('0/1');
    expect(oneQuery(3, 3).status).toBe('MET');
  });

  it('is NOT EVALUABLE with zero scoreable queries — provisional judgments never enter the rate', () => {
    const report = computeTierReport(input({
      battery: batteryOf([{ id: 'fn1', judged: [{ start: 1, grade: 3, provisional: true }] }]),
      evidence: { batteryResults: [outcomeOf('fn1', [1])], gates: cleanGates(), rankMetrics: null },
    }));
    expect(criterion(report, 'A2').status).toBe('NOT_EVALUABLE');
    expect(criterion(report, 'A2').detail).toMatch(/provisional|scoreable/);
    expect(criterion(report, 'S1').status).toBe('NOT_EVALUABLE');
  });
});

// ---------------------------------------------------------------------------
// A3 / S4 — misspelling correction cited + reference grammar
// ---------------------------------------------------------------------------

describe('A3 and S4', () => {
  const msBattery = () => batteryOf([
    { id: 'ms1', category: 'misspelling', query: 'forgivness', judged: [{ start: 1, grade: 3 }] },
    { id: 'ref1', category: 'reference-adjacent', query: 'John 3 16', judged: [{ start: 2, grade: 3 }] },
  ]);

  it('is NOT EVALUABLE while no outcome carries the typed cited-correction field (rung unlanded)', () => {
    const report = computeTierReport(input({
      battery: msBattery(),
      evidence: {
        batteryResults: [outcomeOf('ms1', [1], 'forgivness'), referenceOutcomeOf('ref1', 'John 3 16', 'John 3:16')],
        gates: cleanGates(),
        rankMetrics: null,
      },
    }));
    const row = criterion(report, 'A3');
    expect(row.status).toBe('NOT_EVALUABLE');
    expect(row.detail).toMatch(/unlanded|0\.12\.0/);
    // S4 is A3 at the same standard — always the same status.
    expect(criterion(report, 'S4').status).toBe(row.status);
  });

  it('evaluates once the field lands: MET when every ms query cites and every grammar row parses', () => {
    const cited = withCitation(outcomeOf('ms1', [1], 'forgivness'));
    const report = computeTierReport(input({
      battery: msBattery(),
      evidence: {
        batteryResults: [cited, referenceOutcomeOf('ref1', 'John 3 16', 'John 3:16')],
        gates: cleanGates(),
        rankMetrics: null,
      },
    }));
    expect(criterion(report, 'A3').status).toBe('MET');
  });

  it('is NOT MET when a grammar row resolves to the wrong passage or an ms query returns empty', () => {
    const cited = withCitation(outcomeOf('ms1', [1], 'forgivness'));
    const wrongPassage = computeTierReport(input({
      battery: msBattery(),
      evidence: {
        batteryResults: [cited, referenceOutcomeOf('ref1', 'John 3 16', 'John 3:17')],
        gates: cleanGates(),
        rankMetrics: null,
      },
    }));
    expect(criterion(wrongPassage, 'A3').status).toBe('NOT_MET');
    expect(criterion(wrongPassage, 'A3').detail).toContain('John 3 16');

    const emptyMs = computeTierReport(input({
      battery: batteryOf([
        { id: 'ms1', category: 'misspelling', query: 'forgivness', judged: [{ start: 1, grade: 3 }] },
        { id: 'ms2', category: 'misspelling', query: 'salvasion', judged: [{ start: 2, grade: 3 }] },
      ]),
      tiersConfig: config({ referenceGrammar: [] as never }),
      evidence: {
        batteryResults: [cited, withCitation(outcomeOf('ms2', [], 'salvasion'))],
        gates: cleanGates(),
        rankMetrics: null,
      },
    }));
    expect(criterion(emptyMs, 'A3').status).toBe('NOT_MET');
  });

  it('is NOT EVALUABLE when a grammar row is not among the battery outcomes', () => {
    const cited = withCitation(outcomeOf('ms1', [1], 'forgivness'));
    const report = computeTierReport(input({
      battery: msBattery(),
      tiersConfig: config({ referenceGrammar: [{ query: 'Not In Battery 1:1', expectedReference: 'X 1:1' }] }),
      evidence: { batteryResults: [cited], gates: cleanGates(), rankMetrics: null },
    }));
    expect(criterion(report, 'A3').status).toBe('NOT_EVALUABLE');
    expect(criterion(report, 'A3').detail).toContain('Not In Battery 1:1');
  });
});

// ---------------------------------------------------------------------------
// A4 — rank instruments armed
// ---------------------------------------------------------------------------

describe('A4', () => {
  it('A4a is NOT MET while the overall nDCG threshold is null, MET once set and met, NOT MET once set and missed', () => {
    const nullThreshold = computeTierReport(input({}));
    expect(criterion(nullThreshold, 'A4a').status).toBe('NOT_MET');
    expect(criterion(nullThreshold, 'A4a').detail).toMatch(/null|not yet established/);

    const armed = (thresholdMicro: number) => computeTierReport(input({
      thresholds: { ...NULL_THRESHOLDS, ndcg10: { ...NULL_THRESHOLDS.ndcg10, overall: thresholdMicro } },
      evidence: { batteryResults: [], gates: cleanGates(), rankMetrics: metricsOf('1/2') },
    }));
    expect(criterion(armed(500000), 'A4a').status).toBe('MET');
    expect(criterion(armed(500001), 'A4a').status).toBe('NOT_MET');
  });

  it('A4a is NOT EVALUABLE when a set threshold has no computed metrics to read', () => {
    const report = computeTierReport(input({
      thresholds: { ...NULL_THRESHOLDS, ndcg10: { ...NULL_THRESHOLDS.ndcg10, overall: 500000 } },
      evidence: { batteryResults: [], gates: cleanGates(), rankMetrics: null },
    }));
    expect(criterion(report, 'A4a').status).toBe('NOT_EVALUABLE');
  });

  it('A4b follows the G2 row: pass is MET, fail is NOT MET, absence is NOT EVALUABLE', () => {
    expect(criterion(computeTierReport(input({})), 'A4b').status).toBe('MET');
    const failing = computeTierReport(input({
      evidence: { batteryResults: [], gates: cleanGates({ 'G2-determinism': { status: 'fail' } }), rankMetrics: null },
    }));
    expect(criterion(failing, 'A4b').status).toBe('NOT_MET');
    const absent = computeTierReport(input({
      evidence: { batteryResults: [], gates: [], rankMetrics: null },
    }));
    expect(criterion(absent, 'A4b').status).toBe('NOT_EVALUABLE');
  });

  it('A4c demands an ACTIVE same-query fixture with a preferredOrder or a withinTop:1 pin for every flagship row', () => {
    const flagship = [{ id: 'ph2', query: 'for I know the plans I have for you', quotedVerse: 'Jeremiah 29:11' }];
    const battery = batteryOf([
      { id: 'ph2', category: 'remembered-phrase', query: 'for I know the plans I have for you', judged: [{ start: 1, grade: 3 }] },
    ]);
    const covered = (fixture: Partial<CorpusFixture>) => criterion(computeTierReport(input({
      flagship,
      battery,
      fixtures: [{ id: 'fx', status: 'active', query: flagship[0]!.query, ...fixture } as CorpusFixture],
    })), 'A4c');
    expect(covered({ preferredOrder: [{ above: 'Jeremiah 29:11', below: 'Romans 15:13' }] }).status).toBe('MET');
    expect(covered({ expectedTop: [{ reference: 'Jeremiah 29:11', withinTop: 1 }] }).status).toBe('MET');
    expect(covered({ expectedTop: [{ reference: 'Jeremiah 29:11' }], expectedWithinTop: 1 }).status).toBe('MET');
    expect(covered({ expectedTop: [{ reference: 'Jeremiah 29:11', withinTop: 3 }] }).status).toBe('NOT_MET');
    expect(covered({ status: 'pending', preferredOrder: [{ above: 'Jeremiah 29:11', below: 'Romans 15:13' }] }).status)
      .toBe('NOT_MET');
    const uncovered = covered({ query: 'a different query', preferredOrder: [{ above: 'A 1:1', below: 'B 1:1' }] });
    expect(uncovered.status).toBe('NOT_MET');
    expect(uncovered.detail).toContain('ph2');
  });

  it('A4c is NOT EVALUABLE when a flagship row does not match an active battery specimen', () => {
    const report = computeTierReport(input({
      flagship: [{ id: 'zz9', query: 'not a battery query', quotedVerse: 'X 1:1' }],
      battery: batteryOf([{ id: 'fn1', judged: [{ start: 1, grade: 3 }] }]),
    }));
    expect(criterion(report, 'A4c').status).toBe('NOT_EVALUABLE');
    expect(criterion(report, 'A4c').detail).toContain('zz9');
  });
});

// ---------------------------------------------------------------------------
// S2 — harmful top-10, prosperity fixtures, correctives toggle
// ---------------------------------------------------------------------------

describe('S2', () => {
  it('S2a flips exactly at rank 10', () => {
    const battery = batteryOf([{ id: 'ad1', harmful: [{ start: 100 }], judged: [{ start: 200, grade: 3 }] }]);
    const filler = Array.from({ length: 9 }, (_, index) => 300 + index);
    const atTen = computeTierReport(input({
      battery,
      evidence: { batteryResults: [outcomeOf('ad1', [...filler, 100])], gates: cleanGates(), rankMetrics: null },
    }));
    expect(criterion(atTen, 'S2a').status).toBe('NOT_MET');
    const outside = computeTierReport(input({
      battery,
      evidence: {
        batteryResults: [outcomeOf('ad1', [...filler, 310])],
        gates: cleanGates(),
        rankMetrics: null,
      },
    }));
    expect(criterion(outside, 'S2a').status).toBe('MET');
  });

  it('S2b requires every prosperity-* fixture active with no G3 finding naming it', () => {
    const prosperity = (status: 'active' | 'pending'): CorpusFixture[] => [
      { id: 'prosperity-riches', status, query: 'riches', mustNotRank: [{ reference: 'X 1:1', why: 'w' }] } as CorpusFixture,
    ];
    expect(criterion(computeTierReport(input({ fixtures: prosperity('active') })), 'S2b').status).toBe('MET');
    expect(criterion(computeTierReport(input({ fixtures: prosperity('pending') })), 'S2b').status).toBe('NOT_MET');
    const vacuous = computeTierReport(input({
      fixtures: prosperity('active'),
      evidence: {
        batteryResults: [],
        gates: cleanGates({
          'G3-golden': {
            findings: [{
              categoryCode: GUARD_VACUOUS_CATEGORY,
              subjects: ['prosperity-riches'],
              params: { field: 'mustNotRank', ref: 'X 1:1', fixtureStatus: 'active' },
            }],
          },
        }),
        rankMetrics: null,
      },
    }));
    expect(criterion(vacuous, 'S2b').status).toBe('NOT_MET');
    expect(criterion(vacuous, 'S2b').detail).toContain('prosperity-riches');
    const none = computeTierReport(input({ fixtures: [] }));
    expect(criterion(none, 'S2b').status).toBe('NOT_EVALUABLE');
  });

  it('S2c distinguishes DISABLED-by-decision from NOT EVALUABLE', () => {
    const withCorrectives = (enabled: boolean | null, decidedAt: string | null) =>
      criterion(computeTierReport(input({
        tiersConfig: config({ correctives: { enabled, decidedAt } }),
      })), 'S2c');
    const undecided = withCorrectives(null, null);
    expect(undecided.status).toBe('NOT_EVALUABLE');
    expect(undecided.detail).toMatch(/undecided/i);
    const disabled = withCorrectives(false, '2026-09-01');
    expect(disabled.status).toBe('DISABLED');
    expect(disabled.detail).toContain('2026-09-01');
    // Enabled but the measurement instrument is unbuilt: still a gap, not a pass.
    expect(withCorrectives(true, '2026-09-01').status).toBe('NOT_EVALUABLE');
  });
});

// ---------------------------------------------------------------------------
// S3 / S5
// ---------------------------------------------------------------------------

describe('S3 and S5', () => {
  it('S3 is NOT EVALUABLE until the explanation-faithfulness audit (E7) exists', () => {
    const row = criterion(computeTierReport(input({})), 'S3');
    expect(row.status).toBe('NOT_EVALUABLE');
    expect(row.detail).toMatch(/E7|explanation/i);
  });

  it('S5a needs every per-category threshold non-null and met', () => {
    expect(criterion(computeTierReport(input({})), 'S5a').status).toBe('NOT_MET');
    const allSet = (thresholdMicro: number) => {
      const perCategory = Object.fromEntries(
        Object.keys(NULL_THRESHOLDS.ndcg10.perCategory).map((category) => [category, thresholdMicro]),
      ) as Record<keyof typeof NULL_THRESHOLDS.ndcg10.perCategory, number>;
      const perCategoryExact = Object.fromEntries(
        Object.keys(NULL_THRESHOLDS.ndcg10.perCategory).map((category) => [category, '1/2']),
      );
      return criterion(computeTierReport(input({
        thresholds: { ...NULL_THRESHOLDS, ndcg10: { overall: null, perCategory } },
        evidence: { batteryResults: [], gates: cleanGates(), rankMetrics: metricsOf('1/2', perCategoryExact) },
      })), 'S5a');
    };
    expect(allSet(500000).status).toBe('MET');
    expect(allSet(500001).status).toBe('NOT_MET');
  });

  it('S5b needs a mega-sweep / gap-mining addition or a dated waiver', () => {
    expect(criterion(computeTierReport(input({})), 'S5b').status).toBe('NOT_MET');
    const grown = computeTierReport(input({
      battery: batteryOf([{ id: 'fn1', judged: [{ start: 1, grade: 3 }], origin: 'mega-sweep 2026-11' }]),
    }));
    expect(criterion(grown, 'S5b').status).toBe('MET');
    const waived = computeTierReport(input({
      tiersConfig: config({ batteryGrowthWaiver: { grantedAt: '2026-09-01', note: 'sweep starts next release' } }),
    }));
    expect(criterion(waived, 'S5b').status).toBe('MET');
    expect(criterion(waived, 'S5b').detail).toContain('2026-09-01');
  });
});

// ---------------------------------------------------------------------------
// Attainment: NOT EVALUABLE propagation and the DISABLED distinction
// ---------------------------------------------------------------------------

describe('tier attainment', () => {
  it('never attains on an empty criterion list and never counts NOT EVALUABLE as satisfied', () => {
    expect(tierAttained([])).toBe(false);
    expect(tierAttained([{ status: 'MET' }, { status: 'NOT_EVALUABLE' }])).toBe(false);
    expect(tierAttained([{ status: 'MET' }, { status: 'NOT_MET' }])).toBe(false);
    expect(tierAttained([{ status: 'MET' }, { status: 'MET' }])).toBe(true);
    // DISABLED is an explicit dated decision, not a measurement gap: it does
    // not block the tier. That asymmetry is the whole point of the status.
    expect(tierAttained([{ status: 'MET' }, { status: 'DISABLED' }])).toBe(true);
    expect(tierAttained([{ status: 'DISABLED' }])).toBe(false);
  });

  it('report-level attainment agrees with tierAttained over the emitted criteria', () => {
    const report = computeTierReport(input({}));
    for (const tier of report.tiers) {
      expect(tier.attained).toBe(tierAttained(tier.criteria));
    }
    expect(report.schema).toBe(TIER_REPORT_SCHEMA);
    expect(report.tiers.map((tier) => tier.tier)).toEqual(['A', 'S']);
  });

  it('attains A-tier on a fully green synthetic run', () => {
    const flagship = [{ id: 'ph2', query: 'plans', quotedVerse: 'Jeremiah 29:11' }];
    const battery = batteryOf([
      // One RATIFIED harmful guard ranking outside the window: A1 cannot
      // certify over an all-provisional (or empty) harmful set.
      { id: 'ph2', category: 'remembered-phrase', query: 'plans', judged: [{ start: 1, grade: 3 }], harmful: [{ start: 500 }] },
      { id: 'ms1', category: 'misspelling', query: 'forgivness', judged: [{ start: 2, grade: 3 }] },
      // Reference-kind outcomes carry no ranked list; an unjudged specimen
      // keeps this synthetic battery's A2 denominator honest.
      { id: 'ref1', category: 'reference-adjacent', query: 'John 3 16' },
    ]);
    const report = computeTierReport(input({
      flagship,
      battery,
      tiersConfig: config(),
      thresholds: { ...NULL_THRESHOLDS, ndcg10: { ...NULL_THRESHOLDS.ndcg10, overall: 500000 } },
      fixtures: [{
        id: 'fx', status: 'active', query: 'plans',
        preferredOrder: [{ above: 'Jeremiah 29:11', below: 'Romans 15:13' }],
      } as CorpusFixture],
      evidence: {
        batteryResults: [
          outcomeOf('ph2', [1], 'plans'),
          withCitation(outcomeOf('ms1', [2], 'forgivness')),
          referenceOutcomeOf('ref1', 'John 3 16', 'John 3:16'),
        ],
        gates: cleanGates(),
        rankMetrics: metricsOf('1/2'),
      },
    }));
    const aTier = report.tiers.find((tier) => tier.tier === 'A')!;
    expect(aTier.criteria.map((row) => [row.id, row.status])).toEqual([
      ['A1', 'MET'], ['A2', 'MET'], ['A3', 'MET'], ['A4a', 'MET'], ['A4b', 'MET'], ['A4c', 'MET'],
    ]);
    expect(aTier.attained).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Today's honest committed state — computable without any run evidence
// ---------------------------------------------------------------------------

describe('committed reviewed data', () => {
  it('pins the honest static state: instruments unarmed, flagship unpinned, audits unbuilt, nothing attained', () => {
    const budgets = committedBudgets();
    const { config: tiersConfig } = validateTiersBlock(budgets['tiers']);
    const { queries: flagship } = validateFlagship(committedJson('eval/battery/flagship.json'));
    const battery = validateBattery(
      committedJson('eval/battery/queries.json'),
      committedJson('eval/battery/judgments.json'),
      null,
    );
    const report = computeTierReport({
      tiersConfig: tiersConfig ?? null,
      flagship: flagship ?? null,
      battery: { ...battery, findings: [] },
      thresholds: NULL_THRESHOLDS,
      fixtures: committedFixtures(),
      evidence: { batteryResults: null, gates: null, rankMetrics: null },
    });
    expect(criterion(report, 'A1').status).toBe('NOT_EVALUABLE');
    expect(criterion(report, 'A3').status).toBe('NOT_EVALUABLE');
    expect(criterion(report, 'A4a').status).toBe('NOT_MET');
    // Flagship pins are Phase-3 work: every row must currently be uncovered.
    expect(criterion(report, 'A4c').status).toBe('NOT_MET');
    expect(criterion(report, 'S2c').status).toBe('NOT_EVALUABLE');
    expect(criterion(report, 'S3').status).toBe('NOT_EVALUABLE');
    expect(criterion(report, 'S5b').status).toBe('NOT_MET');
    for (const tier of report.tiers) expect(tier.attained).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('renderTierReport', () => {
  it('prints every criterion with its plain-words status and the identity header', () => {
    const rendered = renderTierReport(computeTierReport(input({})), {
      engineVersion: '0.9.0',
      corpusFingerprint: 'a'.repeat(64),
      layerFingerprint: 'b'.repeat(64),
    });
    expect(rendered).toContain('0.9.0');
    expect(rendered).toContain('A-tier: NOT ATTAINED');
    expect(rendered).toContain('S-tier: NOT ATTAINED');
    expect(rendered).toContain('NOT EVALUABLE');
    for (const id of ['A1', 'A2', 'A3', 'A4a', 'A4b', 'A4c', 'S1', 'S2a', 'S2b', 'S2c', 'S3', 'S4', 'S5a', 'S5b']) {
      expect(rendered).toContain(id);
    }
    const noIdentity = renderTierReport(computeTierReport(input({})), null);
    expect(noIdentity).toMatch(/no artifact run evidence/i);
  });
});
