import { describe, expect, it } from 'vitest';

import { parseAnchorRef } from '../../pipeline/src/importers/ontologyImporter.js';
import {
  DISCOUNT_MICRO,
  RANK_GAIN_SCALE,
  RANK_METRICS_BASELINE_PATH,
  RANK_METRICS_BASELINE_SCHEMA,
  assignGains,
  batteryComparableSection,
  buildRankMetricsBaseline,
  computeRankMetrics,
  deriveGoldenRankJudgments,
  detectNoMeasurableEffect,
  meetsThresholdMicro,
  roundHalfEvenMicro,
  verseRangeOfTargetId,
  withRankEvidence,
  type BatteryJudgedRange,
  type NoEffectInput,
  type RankMetricsReport,
  type RankQueryInput,
} from '../src/gates/rankMetrics.js';
import { buildReport, decideVerdict, headlineFor } from '../src/report.js';
import {
  GAUNTLET_GATE_ROSTER,
  buildMachineReport,
  gauntletExitCode,
  parseGauntletOptions,
  verifyMachineReportFreshness,
  type GauntletRunIdentity,
} from '../src/gauntletMachineReport.js';
import { fail, pass, warn } from '../src/gates/types.js';

const REPO_ROOT = new URL('../..', import.meta.url).pathname;

function judged(
  ref: string,
  grade: 0 | 1 | 2 | 3,
  start: number,
  end = start,
  provisional = false,
): BatteryJudgedRange {
  return { ref, grade, provisional, range: { start, end } };
}

function point(verseId: number): { start: number; end: number } {
  return { start: verseId, end: verseId };
}

function query(input: {
  id: string;
  category?: string;
  judged: readonly BatteryJudgedRange[];
  top10: readonly { start: number; end: number }[];
  top50?: readonly { start: number; end: number }[];
}): RankQueryInput {
  return {
    id: input.id,
    category: input.category ?? 'felt-need',
    judged: input.judged,
    top10: input.top10,
    top50: input.top50 ?? input.top10,
  };
}

describe('DISCOUNT_MICRO', () => {
  it('matches the hand-derived integer table exactly (never recomputed from Math.log2)', () => {
    // floor(10^6 / log2(rank + 1)) for ranks 1..10, transcribed by hand.
    // These literals ARE the contract: runtime code must read the table,
    // never a platform logarithm.
    expect(DISCOUNT_MICRO).toEqual([
      1000000, 630929, 500000, 430676, 386852, 356207, 333333, 315464, 301029, 289064,
    ]);
  });

  it('is strictly decreasing over the ten ranks', () => {
    for (let index = 1; index < DISCOUNT_MICRO.length; index += 1) {
      expect(DISCOUNT_MICRO[index]!).toBeLessThan(DISCOUNT_MICRO[index - 1]!);
    }
  });
});

describe('integer arithmetic helpers', () => {
  it('rounds half-even at the display boundary', () => {
    expect(roundHalfEvenMicro(1n, 2000000n)).toBe(0); // 0.5 micro -> even 0
    expect(roundHalfEvenMicro(3n, 2000000n)).toBe(2); // 1.5 micro -> even 2
    expect(roundHalfEvenMicro(1n, 3n)).toBe(333333);
    expect(roundHalfEvenMicro(2n, 3n)).toBe(666667);
    expect(roundHalfEvenMicro(5n, 8n)).toBe(625000);
    expect(roundHalfEvenMicro(1630929n, 2000000n)).toBe(815464); // 815464.5 -> even
  });

  it('decides thresholds by cross-multiplication, so display rounding can never flip a gate', () => {
    // 6666669/10000000 = 0.6666669 displays as 0.666667 — display equality
    // with the threshold — but the exact value is below it.
    expect(roundHalfEvenMicro(6666669n, 10000000n)).toBe(666667);
    expect(meetsThresholdMicro(6666669n, 10000000n, 666667)).toBe(false);
    expect(meetsThresholdMicro(2n, 3n, 666666)).toBe(true);
    expect(meetsThresholdMicro(1n, 2n, 500000)).toBe(true);
    expect(meetsThresholdMicro(1n, 2n, null)).toBeNull();
  });
});

describe('claim-once gain assignment', () => {
  it('claims each judged range once — a duplicate hit collects nothing', () => {
    const rows = [judged('X 1:1', 3, 100, 110)];
    expect(assignGains([point(102), point(105), point(999)], rows)).toEqual([3, 0, 0]);
  });

  it('a multi-verse result claims the highest-graded overlapped range first', () => {
    const rows = [judged('low', 1, 10, 20), judged('high', 3, 30, 40)];
    expect(assignGains([{ start: 15, end: 35 }], rows)).toEqual([3]);
  });

  it('breaks a same-grade claim tie by lowest start verse id, keeping later gains deterministic', () => {
    const rows = [judged('later', 2, 100, 110), judged('earlier', 2, 50, 60)];
    // The spanning result claims the range starting at 50, leaving 100-110
    // claimable by the second result. The wrong tie-break would zero it.
    expect(assignGains([{ start: 55, end: 105 }, point(105)], rows)).toEqual([2, 2]);
  });
});

describe('computeRankMetrics', () => {
  it('replays th2 "propitiation": the right verse at #8 scores visibly poor nDCG', () => {
    const rom325 = 45003025;
    const top10 = [1, 2, 3, 4, 5, 6, 7, rom325, 9, 10].map(point);
    const report = computeRankMetrics([
      query({ id: 'th2', category: 'theological-term', judged: [judged('Romans 3:25', 3, rom325)], top10 }),
    ]);
    const row = report.queries[0]!;
    expect(row.dcgMicro).toBe(946392); // 3 x 315464
    expect(row.idcgMicro).toBe(3000000);
    expect(row.ndcgMicro).toBe(315464);
    expect(row.mrr).toBe('1/8');
    expect(row.goodOrBetterTop3).toBe(false);
    expect(report.overall.ndcg10.micro).toBe(315464);
  });

  it('replays ph2 "for I know the plans": the quoted verse losing #1 scores imperfect', () => {
    const jer2911 = 24029011;
    const report = computeRankMetrics([
      query({
        id: 'ph2',
        category: 'remembered-phrase',
        judged: [judged('Jeremiah 29:11', 3, jer2911)],
        top10: [point(1), point(jer2911)],
      }),
    ]);
    const row = report.queries[0]!;
    expect(row.dcgMicro).toBe(1892787); // 3 x 630929
    expect(row.ndcgMicro).toBe(630929);
    expect(row.mrr).toBe('1/2');
    expect(row.goodOrBetterTop3).toBe(true);
  });

  it('builds IDCG from all non-provisional gains, descending, hand-computed', () => {
    const rows = [
      judged('a', 1, 500),
      judged('b', 3, 300),
      judged('c', 2, 400),
      judged('d', 2, 200),
    ];
    const report = computeRankMetrics([query({ id: 'q', judged: rows, top10: [] })]);
    // gains [3,2,2,1]: 3x1000000 + 2x630929 + 2x500000 + 1x430676
    expect(report.queries[0]!.idcgMicro).toBe(5692534);
    expect(report.queries[0]!.dcgMicro).toBe(0);
    expect(report.queries[0]!.ndcgMicro).toBe(0);
  });

  it('excludes-and-counts IDCG=0 queries instead of scoring them 0 or 1', () => {
    const report = computeRankMetrics([
      query({ id: 'ad1', category: 'adversarial', judged: [], top10: [point(1)] }),
      query({ id: 'ad2', category: 'adversarial', judged: [judged('x', 0, 5)], top10: [point(5)] }),
    ]);
    expect(report.overall.scoreableQueries).toBe(0);
    expect(report.overall.excludedQueries).toBe(2);
    expect(report.overall.ndcg10.micro).toBeNull();
    expect(report.overall.ndcg10.exact).toBeNull();
    expect(report.queries.map((row) => row.scoreable)).toEqual([false, false]);
  });

  it('never lets a provisional judgment enter any gain, IDCG, or aggregate', () => {
    const report = computeRankMetrics([
      query({ id: 'fn1', judged: [judged('x', 3, 100, 100, true)], top10: [point(100)] }),
    ]);
    expect(report.queries[0]!.scoreable).toBe(false);
    expect(report.queries[0]!.dcgMicro).toBe(0);
    expect(report.overall.excludedQueries).toBe(1);
  });

  it('aggregates per category and overall as exact rationals with one final display rounding', () => {
    const report = computeRankMetrics([
      query({ id: 'a', category: 'x', judged: [judged('a', 3, 100)], top10: [point(100)] }),
      query({ id: 'b', category: 'x', judged: [judged('b', 3, 200)], top10: [point(999), point(200)] }),
    ]);
    const aggregate = report.perCategory['x']!;
    expect(aggregate.scoreableQueries).toBe(2);
    // mean( 1, 630929/1000000 ) = 1630929/2000000 -> 815464.5 -> half-even 815464
    expect(aggregate.ndcg10.exact).toBe('1630929/2000000');
    expect(aggregate.ndcg10.micro).toBe(815464);
    expect(aggregate.mrr10.exact).toBe('3/4');
    expect(aggregate.mrr10.micro).toBe(750000);
    expect(aggregate.goodOrBetterTop3Rate.exact).toBe('1/1');
    expect(aggregate.goodOrBetterTop3Rate.micro).toBe(1000000);
    expect(report.overall.ndcg10.exact).toBe('1630929/2000000');
    expect(report.gainScale).toBe(RANK_GAIN_SCALE);
  });

  it('computes Recall@50 from the limit-50 list with its own claim-once walk', () => {
    const rows = [judged('a', 3, 100), judged('b', 2, 200), judged('c', 1, 300)];
    const top10 = [point(100)];
    const top50 = [point(100), point(1), point(300)];
    const report = computeRankMetrics([query({ id: 'q', judged: rows, top10, top50 })]);
    expect(report.queries[0]!.recallAt50).toBe('2/3');
    expect(report.overall.recallAt50.exact).toBe('2/3');
    expect(report.overall.recallAt50.micro).toBe(666667);
  });

  it('reports per-query judged coverage of the top 10', () => {
    const report = computeRankMetrics([
      query({ id: 'q', judged: [judged('a', 3, 100)], top10: [point(100), point(1), point(2)] }),
    ]);
    expect(report.queries[0]!.judgedCoverageTop10).toBe('1/3');
  });

  it('serializes deterministically regardless of input category order', () => {
    const forward = computeRankMetrics([
      query({ id: 'a', category: 'x', judged: [judged('a', 3, 100)], top10: [point(100)] }),
      query({ id: 'b', category: 'y', judged: [judged('b', 3, 200)], top10: [point(200)] }),
    ]);
    const reversed = computeRankMetrics([
      query({ id: 'b', category: 'y', judged: [judged('b', 3, 200)], top10: [point(200)] }),
      query({ id: 'a', category: 'x', judged: [judged('a', 3, 100)], top10: [point(100)] }),
    ]);
    expect(Object.keys(forward.perCategory)).toEqual(['x', 'y']);
    expect(Object.keys(reversed.perCategory)).toEqual(['x', 'y']);
    expect(forward.overall).toEqual(reversed.overall);
  });
});

describe('golden-derived judgments', () => {
  it('derives expectedTop as grade 3 and alsoAcceptable as grade 1; mustNotRank is never a gain', () => {
    const derived = deriveGoldenRankJudgments([
      {
        id: 'g1',
        status: 'active',
        query: 'hope for the future',
        expectedTop: [{ reference: 'Jeremiah 29:11' }],
        alsoAcceptable: ['Romans 15:13', 'Jeremiah 29:11'],
        mustNotRank: [{ ref: 'Genesis 1:1', why: 'not a gain' }],
      },
      { id: 'g2', status: 'pending', query: 'x', expectedTop: [{ ref: 'John 3:16' }] },
      { id: 'g3', status: 'active', referenceExpectations: [{ query: 'John 3', expectedKind: 'reference', expectedPassage: 'John 3' }] },
      { id: 'g4', status: 'active', query: 'no pins' },
    ]);
    expect(derived).toHaveLength(1);
    expect(derived[0]!.id).toBe('g1');
    expect(derived[0]!.query).toBe('hope for the future');
    const grades = derived[0]!.judged.map((row) => [row.ref, row.grade]);
    expect(grades).toEqual([
      ['Jeremiah 29:11', 3],
      ['Romans 15:13', 1],
    ]);
    expect(derived[0]!.judged[0]!.range).toEqual(parseAnchorRef('Jeremiah 29:11'));
    expect(derived[0]!.judged.every((row) => !row.provisional)).toBe(true);
  });
});

describe('verseRangeOfTargetId', () => {
  it('maps a verse target id to a single-verse range', () => {
    expect(verseRangeOfTargetId('WEB:59001022')).toEqual({ start: 59001022, end: 59001022 });
    expect(verseRangeOfTargetId('nonsense')).toBeNull();
  });
});

const C1 = '1'.repeat(64);
const C2 = '2'.repeat(64);
const L1 = 'a'.repeat(64);
const L2 = 'b'.repeat(64);
const P1 = 'c'.repeat(64);
const O1 = 'd'.repeat(64);

function sampleMetrics(hitRank: 1 | 2 = 1): RankMetricsReport {
  const top10 = hitRank === 1 ? [point(100)] : [point(999), point(100)];
  return computeRankMetrics([
    query({ id: 'a', category: 'x', judged: [judged('a', 3, 100)], top10 }),
  ]);
}

function noEffectInput(overrides: Partial<NoEffectInput> = {}): NoEffectInput {
  const metrics = sampleMetrics();
  return {
    run: { corpusFingerprint: C1, layerFingerprint: L2 },
    metrics,
    rankBaseline: buildRankMetricsBaseline(
      { engineVersion: '0.9.0', corpusFingerprint: C1, layerFingerprint: L1 },
      metrics,
    ),
    orderingApproval: {
      priorProvenance: {
        probeListsSha256: P1,
        engine: { engineVersion: '0.9.0', corpusFingerprint: C1, layerFingerprint: L1 },
      },
    },
    currentProbeListsSha256: P1,
    probeBaseline: { corpusFingerprint: C1, observationsSha256: O1 },
    currentObservationsSha256: O1,
    expectNoEffect: null,
    ...overrides,
  };
}

describe('NO_MEASURABLE_EFFECT detection', () => {
  it('fires only when the layer moved AND all three anchored comparisons show no movement', () => {
    const { detection, findings } = detectNoMeasurableEffect(noEffectInput());
    expect(detection.evaluated).toBe(true);
    expect(detection.layerMoved).toBe(true);
    expect(detection.fired).toBe(true);
    expect(detection.comparisons.map((comparison) => comparison.state)).toEqual([
      'compared', 'compared', 'compared',
    ]);
    expect(findings).toEqual([]);
  });

  it('does not fire when the rank-metrics comparison moved', () => {
    const { detection } = detectNoMeasurableEffect(noEffectInput({ metrics: sampleMetrics(2) }));
    expect(detection.fired).toBe(false);
    expect(detection.comparisons[0]).toMatchObject({ anchor: 'rank-metrics-baseline', moved: true });
  });

  it('does not fire when the probe orderings moved vs the prior provenance', () => {
    const { detection } = detectNoMeasurableEffect(noEffectInput({ currentProbeListsSha256: O1 }));
    expect(detection.fired).toBe(false);
    expect(detection.comparisons[1]).toMatchObject({ anchor: 'prior-probe-orderings', moved: true });
  });

  it('does not fire when the G8 observations moved', () => {
    const { detection } = detectNoMeasurableEffect(noEffectInput({ currentObservationsSha256: P1 }));
    expect(detection.fired).toBe(false);
    expect(detection.comparisons[2]).toMatchObject({ anchor: 'g8-probe-baseline', moved: true });
  });

  it('stays mergeable on a no-op diff: layer unchanged means no firing', () => {
    const { detection } = detectNoMeasurableEffect(noEffectInput({
      run: { corpusFingerprint: C1, layerFingerprint: L1 },
    }));
    expect(detection.evaluated).toBe(true);
    expect(detection.layerMoved).toBe(false);
    expect(detection.fired).toBe(false);
  });

  it('reports skipped-with-finding when the rank-metrics baseline is absent (the honest landing state)', () => {
    const { detection, findings } = detectNoMeasurableEffect(noEffectInput({ rankBaseline: null }));
    expect(detection.evaluated).toBe(false);
    expect(detection.fired).toBe(false);
    expect(detection.comparisons[0]).toMatchObject({ anchor: 'rank-metrics-baseline', state: 'skipped' });
    expect(findings.some((finding) => finding.message.includes(RANK_METRICS_BASELINE_PATH))).toBe(true);
  });

  it('reports skipped-with-finding when the corpus fingerprint moved vs the anchor', () => {
    const metrics = sampleMetrics();
    const { detection, findings } = detectNoMeasurableEffect(noEffectInput({
      rankBaseline: buildRankMetricsBaseline(
        { engineVersion: '0.9.0', corpusFingerprint: C2, layerFingerprint: L1 },
        metrics,
      ),
    }));
    expect(detection.fired).toBe(false);
    expect(detection.comparisons[0]!.state).toBe('skipped');
    expect(findings.some((finding) => finding.message.includes('corpusFingerprint'))).toBe(true);
  });

  it('reports skipped-with-finding on a null priorProvenance (bootstrap approval)', () => {
    const { detection, findings } = detectNoMeasurableEffect(noEffectInput({
      orderingApproval: { priorProvenance: null },
    }));
    expect(detection.fired).toBe(false);
    expect(detection.comparisons[1]!.state).toBe('skipped');
    expect(findings.some((finding) => finding.message.includes('priorProvenance'))).toBe(true);
  });

  it('reports skipped-with-finding when this run computed no rank metrics', () => {
    const { detection, findings } = detectNoMeasurableEffect(noEffectInput({ metrics: null }));
    expect(detection.comparisons[0]!.state).toBe('skipped');
    expect(detection.fired).toBe(false);
    expect(findings.length).toBeGreaterThan(0);
  });

  it('reports skipped-with-finding when the G8 baseline is absent', () => {
    const { detection, findings } = detectNoMeasurableEffect(noEffectInput({ probeBaseline: null }));
    expect(detection.comparisons[2]!.state).toBe('skipped');
    expect(detection.fired).toBe(false);
    expect(findings.length).toBeGreaterThan(0);
  });

  it('records the --expect-no-effect reason verbatim without changing the measurement', () => {
    const token = 'ci-auto:re-pin-diff-shape:3-files';
    const { detection } = detectNoMeasurableEffect(noEffectInput({ expectNoEffect: token }));
    expect(detection.expectNoEffect).toBe(token);
    expect(detection.fired).toBe(true);
  });

  it('gives every skip finding the g12-battery semantic category', () => {
    const { findings } = detectNoMeasurableEffect(noEffectInput({ rankBaseline: null }));
    for (const finding of findings) {
      expect(finding.categoryCode).toMatch(/^sse\.gauntlet\.v1\.finding\.g12-battery\.[a-z][a-z0-9-]*$/);
    }
  });
});

describe('fourth verdict', () => {
  const allPass = GAUNTLET_GATE_ROSTER.map((gate) => pass(gate.id, gate.title, 'ok'));
  const fired = detectNoMeasurableEffect(noEffectInput()).detection;
  const unfired = detectNoMeasurableEffect(noEffectInput({
    run: { corpusFingerprint: C1, layerFingerprint: L1 },
  })).detection;

  it('NO_MEASURABLE_EFFECT exists and is decided by the detection outcome', () => {
    expect(decideVerdict({ gates: allPass, noMeasurableEffect: fired })).toBe('NO_MEASURABLE_EFFECT');
    expect(decideVerdict({ gates: allPass, noMeasurableEffect: unfired })).toBe('ADMIT');
    expect(decideVerdict({ gates: allPass })).toBe('ADMIT');
  });

  it('REJECT outranks NO_MEASURABLE_EFFECT; NO_MEASURABLE_EFFECT outranks warnings', () => {
    const withFail = [...allPass.slice(1), fail('G1-provenance', 'Provenance', 'broken', [{ message: 'x' }])];
    expect(decideVerdict({ gates: withFail, noMeasurableEffect: fired })).toBe('REJECT');
    const withWarn = [...allPass.slice(1), warn('G1-provenance', 'Provenance', 'warned', [{ message: 'x' }])];
    expect(decideVerdict({ gates: withWarn, noMeasurableEffect: fired })).toBe('NO_MEASURABLE_EFFECT');
  });

  it('is non-admit under --require-admit unless --expect-no-effect claims it', () => {
    expect(gauntletExitCode('NO_MEASURABLE_EFFECT', true, false)).toBe(1);
    expect(gauntletExitCode('NO_MEASURABLE_EFFECT', true, true)).toBe(0);
    expect(gauntletExitCode('NO_MEASURABLE_EFFECT', false, false)).toBe(0);
    expect(gauntletExitCode('REJECT', false, true)).toBe(1);
    expect(gauntletExitCode('ADMIT', true, false)).toBe(0);
  });

  it('the headline names the covenant rule, or the expected-outcome downgrade', () => {
    expect(headlineFor('NO_MEASURABLE_EFFECT', allPass, fired)).toContain('NO MEASURABLE EFFECT');
    const expected = detectNoMeasurableEffect(noEffectInput({ expectNoEffect: 'ci-auto:x:1-files' })).detection;
    expect(headlineFor('NO_MEASURABLE_EFFECT', allPass, expected)).toContain('ci-auto:x:1-files');
    expect(headlineFor('NO_MEASURABLE_EFFECT', allPass, expected)).toContain('expected');
  });

  it('renders the verdict and rank metrics in the Admission Report markdown', () => {
    const metrics = sampleMetrics();
    const report = buildReport({ gates: allPass, rankMetrics: metrics, noMeasurableEffect: fired });
    expect(report.verdict).toBe('NO_MEASURABLE_EFFECT');
    expect(report.markdown).toContain('NO MEASURABLE EFFECT');
    expect(report.markdown).toContain('## Rank metrics');
    expect(report.markdown).toContain('nDCG@10');
    expect(report.markdown).toContain('| overall |');
    expect(report.markdown).toContain('| x |');
    expect(report.markdown).toContain('## No-measurable-effect detection');
  });
});

describe('gauntlet flags', () => {
  it('parses --expect-no-effect as a single space-free token', () => {
    const options = parseGauntletOptions(['--expect-no-effect', 'ci-auto:re-pin-diff-shape:3-files']);
    expect(options.expectNoEffect).toBe('ci-auto:re-pin-diff-shape:3-files');
    expect(() => parseGauntletOptions(['--expect-no-effect'])).toThrow('--expect-no-effect requires');
    expect(() => parseGauntletOptions(['--expect-no-effect', '--json'])).toThrow('--expect-no-effect requires');
    expect(() => parseGauntletOptions(['--expect-no-effect', 'two words'])).toThrow('space-free');
    expect(() => parseGauntletOptions([
      '--expect-no-effect', 'a', '--expect-no-effect', 'b',
    ])).toThrow('Duplicate --expect-no-effect');
  });

  it('accepts --update-rank-baseline only against an explicit artifact target, never with attestation flags', () => {
    const options = parseGauntletOptions([
      '--update-rank-baseline', '--release-database', 'workbench/.artifact/content.db',
    ]);
    expect(options.updateRankBaseline).toBe(true);
    expect(() => parseGauntletOptions(['--update-rank-baseline'])).toThrow(
      '--update-rank-baseline requires',
    );
    expect(() => parseGauntletOptions([
      '--update-rank-baseline', '--require-admit', '--release-database', 'workbench/.artifact/content.db',
    ])).toThrow('--update-rank-baseline cannot');
    expect(() => parseGauntletOptions([
      '--update-rank-baseline', '--json', 'eval/.runs/x.json', '--release-database', 'workbench/.artifact/content.db',
    ])).toThrow('--update-rank-baseline cannot');
    expect(() => parseGauntletOptions([
      '--update-rank-baseline', '--update-rank-baseline', '--release-database', 'workbench/.artifact/content.db',
    ])).toThrow('Duplicate --update-rank-baseline');
  });
});

describe('withRankEvidence', () => {
  it('appends the four headline metrics and findings to the G12 row without changing its status', () => {
    const metrics = sampleMetrics();
    const base = pass('G12-battery', 'Pastoral battery', '1 active', { activeQueries: 1 }, { explicitTarget: true });
    const finding = {
      message: 'skip',
      categoryCode: 'sse.gauntlet.v1.finding.g12-battery.no-effect-skipped',
    };
    const merged = withRankEvidence(base, metrics, [finding]);
    expect(merged.status).toBe('pass');
    expect(merged.applicability).toBe('required');
    expect(merged.summary).toContain('nDCG@10');
    expect(merged.metrics).toMatchObject({
      activeQueries: 1,
      rankScoreableQueries: 1,
      rankNdcg10Micro: 1000000,
    });
    expect(merged.findings).toEqual([finding]);
    const failing = fail('G12-battery', 'Pastoral battery', 'bad', [{ message: 'x' }], undefined, { explicitTarget: true });
    expect(withRankEvidence(failing, metrics, []).status).toBe('fail');
  });
});

describe('machine report v2 sections', () => {
  const argv = [
    '--json', 'eval/.runs/report.json',
    '--release-database', 'workbench/.artifact/content.db',
    '--expect-no-effect', 'ci-auto:re-pin-diff-shape:2-files',
  ];
  const engineIdentity = {
    engineVersion: '0.9.0',
    corpusFingerprint: C1,
    layerFingerprint: L2,
  };
  const identity: GauntletRunIdentity = {
    gitCommitSha: 'a'.repeat(40),
    dirtyTreeSha256: 'b'.repeat(64),
    descriptor: { path: 'artifacts/content-artifact.json', sha256: 'c'.repeat(64) },
    engine: engineIdentity,
    budgetsSha256: 'f'.repeat(64),
    fixtureInputSha256: '0'.repeat(64),
    flags: parseGauntletOptions(argv),
    target: {
      kind: 'release',
      descriptor: {
        kind: 'scripture-search-release',
        path: 'artifacts/content-artifact.json',
        sha256: '3'.repeat(64),
      },
      database: { path: 'workbench/.artifact/content.db', sha256: '4'.repeat(64) },
      engine: engineIdentity,
    },
  };
  const batterySection = {
    batteryVersion: 1,
    queriesSha256: '5'.repeat(64),
    judgmentsSha256: '6'.repeat(64),
    activeQueries: 1,
    judgedRows: 1,
    provisionalRows: 0,
    results: [{ id: 'fn1', query: 'q', kind: 'discovery' as const, top: [] }],
  };
  const metrics = sampleMetrics();
  const detection = detectNoMeasurableEffect(
    noEffectInput({ expectNoEffect: 'ci-auto:re-pin-diff-shape:2-files' }),
  ).detection;

  function targetReport() {
    const gates = GAUNTLET_GATE_ROSTER.map((gate) =>
      pass(gate.id, gate.title, 'ok', undefined, { explicitTarget: true }));
    const startedAt = new Date(Date.now() - 1000).toISOString();
    const finishedAt = new Date().toISOString();
    return buildMachineReport({
      startedAt,
      finishedAt,
      identity,
      report: buildReport({ gates, rankMetrics: metrics, noMeasurableEffect: detection }),
      battery: batterySection,
      rankMetrics: metrics,
      noMeasurableEffect: detection,
    });
  }

  function shapeMismatches(parsed: unknown): readonly string[] {
    return verifyMachineReportFreshness(REPO_ROOT, `${REPO_ROOT}eval/.runs/report.json`, parsed, { now: new Date() })
      .mismatches
      .filter((mismatch) => mismatch.code === 'sse.gauntlet.v1.freshness.invalid-shape')
      .map((mismatch) => mismatch.message);
  }

  it('round-trips rankMetrics and noMeasurableEffect through the payload with no shape mismatch', () => {
    const report = targetReport();
    expect(report.payload.verdict).toBe('NO_MEASURABLE_EFFECT');
    expect(report.payload.rankMetrics).toEqual(metrics);
    expect(report.payload.noMeasurableEffect).toEqual(detection);
    expect(shapeMismatches(report)).toEqual([]);
  });

  it('rejects a target report that lost its no-measurable-effect section', () => {
    const report = targetReport();
    const { noMeasurableEffect: _dropped, ...payload } = report.payload;
    expect(shapeMismatches({ ...report, payload }).length).toBeGreaterThan(0);
  });

  it('rejects rankMetrics on a fixture-corpus report', () => {
    const gates = GAUNTLET_GATE_ROSTER.map((gate) => pass(gate.id, gate.title, 'ok'));
    const fixtureIdentity: GauntletRunIdentity = {
      ...identity,
      flags: parseGauntletOptions(['--json', 'eval/.runs/report.json']),
    };
    delete (fixtureIdentity as unknown as Record<string, unknown>)['target'];
    const report = buildMachineReport({
      startedAt: new Date(Date.now() - 1000).toISOString(),
      finishedAt: new Date().toISOString(),
      identity: fixtureIdentity,
      report: buildReport({ gates }),
      rankMetrics: metrics,
    });
    expect(shapeMismatches(report).length).toBeGreaterThan(0);
  });

  it('rejects a report whose recorded flag and no-effect section disagree', () => {
    const report = targetReport();
    const doctored = {
      ...report,
      payload: {
        ...report.payload,
        noMeasurableEffect: { ...detection, expectNoEffect: null },
      },
    };
    expect(shapeMismatches(doctored).length).toBeGreaterThan(0);
  });

  it('byte-binds the rank sections into the cross-leg comparable section', () => {
    const report = targetReport();
    const left = batteryComparableSection(report);
    const changed = {
      ...report,
      payload: { ...report.payload, rankMetrics: sampleMetrics(2) },
    };
    expect(batteryComparableSection(changed)).not.toBe(left);
    expect(left).toContain('rankMetrics');
    expect(left).toContain('noMeasurableEffect');
  });

  it('keeps the baseline writer constants pointed at the reviewed path and schema', () => {
    expect(RANK_METRICS_BASELINE_PATH).toBe('eval/baselines/rank-metrics.json');
    expect(RANK_METRICS_BASELINE_SCHEMA).toBe('scripture-search-engine/rank-metrics-baseline/v1');
    const baseline = buildRankMetricsBaseline(engineIdentity, metrics);
    expect(baseline.schema).toBe(RANK_METRICS_BASELINE_SCHEMA);
    expect(baseline.layerFingerprint).toBe(L2);
    expect(baseline.overall).toEqual(metrics.overall);
  });
});
