/**
 * E5 — rankQuality threshold discipline: null-until-real-baseline.
 *
 * Three alarm surfaces, each watched ringing:
 *  - null honesty: a null threshold is measured-and-reported, never a pass
 *    and never a fail, and the report says so in words;
 *  - the honoring gate: a non-null threshold is enforced exactly (integer
 *    cross-multiplication — display rounding can never decide), and a
 *    threshold that cannot be measured must not pass;
 *  - the rank-metrics approval: every tamper on the hand-authored record
 *    rings a named finding. No approval is authored here or anywhere —
 *    the fixtures are synthetic by construction.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  computeRankMetrics,
  evaluateBatteryAcceptance,
  evaluateRankQuality,
  validateBattery,
  validateRankMetricsBaselineDocuments,
  validateRankQualityBlock,
  withRankEvidence,
  BATTERY_ACCEPTANCE_NULL_MARKER,
  RANK_METRICS_APPROVAL_SCHEMA_V2,
  RANK_METRICS_BASELINE_SCHEMA,
  RANK_QUALITY_NULL_MARKER,
  type BatteryQueryOutcome,
  type RankMetricsReport,
  type RankQualityThresholds,
  type RankQueryInput,
  type ValidatedBattery,
} from '../src/gates/rankMetrics.js';
import { buildReport } from '../src/report.js';
import { canonicalJsonSha256 } from '../src/gates/probes.js';
import { pass } from '../src/gates/types.js';

const EVAL_ROOT = fileURLToPath(new URL('..', import.meta.url));

function committedBudgets(): Record<string, unknown> {
  return JSON.parse(readFileSync(join(EVAL_ROOT, 'budgets.json'), 'utf8')) as Record<string, unknown>;
}

const FLOORS = {
  'felt-need': 14,
  'single-word': 12,
  'remembered-phrase': 12,
  'theological-term': 8,
  'reference-adjacent': 8,
  'misspelling': 6,
  'adversarial': 14,
  'multi-concept': 6,
  'worship-leader': 4,
} as const;

function allNullBlock(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ndcg10: {
      overall: null,
      perCategory: Object.fromEntries(Object.keys(FLOORS).map((category) => [category, null])),
    },
    mrr10: null,
    goodOrBetterTop3Rate: null,
    battery: { categoryFloors: { ...FLOORS } },
    // QR-8 acceptance criteria (P5.7): null until baselined, like every
    // quality threshold above.
    spelling: { noSilentEmpty: null },
    references: { grammarCoverage: null },
    ...overrides,
  };
}

function thresholdsOf(block: Record<string, unknown>, established = false): RankQualityThresholds {
  const { thresholds, findings } = validateRankQualityBlock(block, { rankBaselineEstablished: established });
  expect(findings).toEqual([]);
  expect(thresholds).not.toBeNull();
  return thresholds!;
}

function blockFindings(block: unknown, established = false): string {
  return validateRankQualityBlock(block, { rankBaselineEstablished: established })
    .findings.map((finding) => finding.message)
    .join('\n');
}

/** grade-3 pin claimed at #1: nDCG 1, MRR 1, good@3, recall 1/1. */
function perfectQuery(id: string, category: string): RankQueryInput {
  const judged = [{
    ref: 'Philippians 4:6', grade: 3 as const, provisional: false,
    range: { start: 57004006, end: 57004006 },
  }];
  const top = [{ start: 57004006, end: 57004006 }];
  return { id, category, judged, top10: top, top50: top };
}

/** grade-2 row that the engine never surfaced: nDCG 0, no good@3. */
function missedQuery(id: string, category: string): RankQueryInput {
  const judged = [{
    ref: 'Psalms 23:1', grade: 2 as const, provisional: false,
    range: { start: 19023001, end: 19023001 },
  }];
  return { id, category, judged, top10: [], top50: [] };
}

describe('committed rankQuality block', () => {
  it('exists, validates cleanly, and floors match the nine seed counts', () => {
    const { thresholds, findings } = validateRankQualityBlock(committedBudgets()['rankQuality'], {
      rankBaselineEstablished: false,
    });
    expect(findings).toEqual([]);
    expect(thresholds?.battery.categoryFloors).toEqual(FLOORS);
  });

  it('carries only null quality thresholds at introduction (a flip is a protocol PR that updates this pin)', () => {
    const thresholds = thresholdsOf(committedBudgets()['rankQuality'] as Record<string, unknown>);
    expect(thresholds.ndcg10.overall).toBeNull();
    expect(Object.values(thresholds.ndcg10.perCategory).every((value) => value === null)).toBe(true);
    expect(thresholds.mrr10).toBeNull();
    expect(thresholds.goodOrBetterTop3Rate).toBeNull();
    // QR-8 acceptance criteria land null at gate-landing (P5.7 Group 7);
    // the flip is a separate reviewed PR quoting a real >=3-run history (J42).
    expect(thresholds.spelling.noSilentEmpty).toBeNull();
    expect(thresholds.references.grammarCoverage).toBeNull();
  });
});

describe('rankQuality block validation', () => {
  it('rings when the block is missing entirely', () => {
    expect(blockFindings(undefined)).toContain('rankQuality');
  });

  it('rings on an unknown field', () => {
    expect(blockFindings(allNullBlock({ ndcg5: null }))).toContain('ndcg5');
  });

  it('rings on a float threshold — micro-integers only', () => {
    const block = allNullBlock({ mrr10: 0.9 });
    expect(blockFindings(block, true)).toContain('micro');
  });

  it('rings on an out-of-range threshold', () => {
    const block = allNullBlock({ mrr10: 1000001 });
    expect(blockFindings(block, true).length).toBeGreaterThan(0);
    const zero = allNullBlock({ mrr10: 0 });
    expect(blockFindings(zero, true).length).toBeGreaterThan(0);
  });

  it('rings on a non-null threshold while no approved rank baseline exists — the protocol is structural', () => {
    const block = allNullBlock({ mrr10: 500000 });
    const text = blockFindings(block, false);
    expect(text).toContain('mrr10');
    expect(text).toContain('baseline');
    // The same value with an established baseline is accepted.
    expect(blockFindings(block, true)).toBe('');
  });

  it('a premature threshold never poisons the valid parts: floors survive, the value is coerced to null', () => {
    const { thresholds, findings } = validateRankQualityBlock(allNullBlock({ mrr10: 500000 }), {
      rankBaselineEstablished: false,
    });
    // Exactly the one premature finding — nothing about the floors, which are
    // present and valid; a finding that misstates the reviewed file is itself
    // a defect (explanations are part of the contract).
    expect(findings.length).toBe(1);
    expect(findings[0]!.message).toContain('mrr10');
    expect(thresholds).not.toBeNull();
    expect(thresholds!.battery.categoryFloors).toEqual(FLOORS);
    // The prohibited value must not enforce on this run.
    expect(thresholds!.mrr10).toBeNull();
    expect(thresholds!.ndcg10.overall).toBeNull();
  });

  it('a shape problem still nullifies the thresholds — a gate must not enforce a malformed document', () => {
    const { thresholds, findings } = validateRankQualityBlock(allNullBlock({ mrr10: 0.9 }), {
      rankBaselineEstablished: true,
    });
    expect(thresholds).toBeNull();
    expect(findings.length).toBeGreaterThan(0);
  });

  it('rings on floors missing a category, carrying an extra one, or non-positive', () => {
    const missing = allNullBlock({ battery: { categoryFloors: { ...FLOORS, adversarial: undefined } } });
    expect(blockFindings(missing)).toContain('adversarial');
    const extra = allNullBlock({ battery: { categoryFloors: { ...FLOORS, extra: 1 } } });
    expect(blockFindings(extra)).toContain('extra');
    const zero = allNullBlock({ battery: { categoryFloors: { ...FLOORS, 'worship-leader': 0 } } });
    expect(blockFindings(zero)).toContain('worship-leader');
  });
});

describe('null honesty — a null threshold never passes and never fails', () => {
  const metrics = computeRankMetrics([
    perfectQuery('fn1', 'felt-need'),
    missedQuery('sw1', 'single-word'),
  ]);

  it('every all-null evaluation reports no-threshold with zero failures', () => {
    const { evaluations, failures } = evaluateRankQuality(thresholdsOf(allNullBlock()), metrics);
    expect(failures).toEqual([]);
    expect(evaluations.length).toBeGreaterThan(0);
    expect(evaluations.every((entry) => entry.outcome === 'no-threshold')).toBe(true);
    expect(evaluations.every((entry) => entry.thresholdMicro === null)).toBe(true);
  });

  it('withRankEvidence never flips a row on null thresholds and never claims one met', () => {
    const quality = evaluateRankQuality(thresholdsOf(allNullBlock()), metrics);
    const row = withRankEvidence(
      pass('G12-battery', 'Pastoral battery', 'base'),
      metrics, [], quality,
    );
    expect(row.status).toBe('pass');
    expect(row.summary).toContain('none set');
    expect(row.summary).not.toMatch(/\bmet\b|\bMET\b|\bFAILED\b/);
  });

  it('the Admission Report prints each value with the no-threshold marker, never pass/fail', () => {
    const quality = evaluateRankQuality(thresholdsOf(allNullBlock()), metrics);
    const report = buildReport({
      gates: [pass('G12-battery', 'Pastoral battery', 'base')],
      rankMetrics: metrics,
      rankQuality: quality.evaluations,
    });
    expect(report.markdown).toContain(`(${RANK_QUALITY_NULL_MARKER})`);
    expect(RANK_QUALITY_NULL_MARKER).toBe('no threshold — baseline not yet established');
    const thresholdLines = report.markdown
      .split('\n')
      .filter((line) => line.includes(RANK_QUALITY_NULL_MARKER));
    expect(thresholdLines.length).toBe(quality.evaluations.length);
    for (const line of thresholdLines) {
      expect(line).not.toMatch(/\bMET\b|\bNOT MET\b|\bpass\b|\bfail\b/);
    }
  });
});

describe('the honoring gate — non-null thresholds enforce exactly', () => {
  it('a met threshold reports met and does not flip the row', () => {
    const metrics = computeRankMetrics([perfectQuery('fn1', 'felt-need')]);
    const block = allNullBlock({ mrr10: 500000 });
    const quality = evaluateRankQuality(thresholdsOf(block, true), metrics);
    expect(quality.failures).toEqual([]);
    expect(quality.evaluations.find((entry) => entry.metric === 'mrr10')?.outcome).toBe('met');
    const row = withRankEvidence(pass('G12-battery', 'Pastoral battery', 'base'), metrics, [], quality);
    expect(row.status).toBe('pass');
  });

  it('an unmet threshold fails the row with a named finding', () => {
    const metrics = computeRankMetrics([perfectQuery('fn1', 'felt-need'), missedQuery('fn2', 'felt-need')]);
    const block = allNullBlock({
      ndcg10: { overall: 900000, perCategory: allNullBlock()['ndcg10']!['perCategory' as never] },
    });
    const quality = evaluateRankQuality(thresholdsOf(block, true), metrics);
    expect(quality.failures.length).toBe(1);
    expect(quality.evaluations.find(
      (entry) => entry.metric === 'ndcg10' && entry.scope === 'overall',
    )?.outcome).toBe('not-met');
    const row = withRankEvidence(pass('G12-battery', 'Pastoral battery', 'base'), metrics, [], quality);
    expect(row.status).toBe('fail');
    expect((row.findings ?? []).map((finding) => finding.message).join('\n')).toContain('ndcg10');
  });

  it('display rounding can never decide: exact 2/3 fails a 666667-micro threshold its display equals', () => {
    // Three scoreable queries, two with a good-or-better hit in the top 3.
    const metrics = computeRankMetrics([
      perfectQuery('fn1', 'felt-need'),
      perfectQuery('fn2', 'felt-need'),
      missedQuery('fn3', 'felt-need'),
    ]);
    expect(metrics.overall.goodOrBetterTop3Rate.micro).toBe(666667);
    const block = allNullBlock({ goodOrBetterTop3Rate: 666667 });
    const quality = evaluateRankQuality(thresholdsOf(block, true), metrics);
    expect(quality.evaluations.find((entry) => entry.metric === 'goodOrBetterTop3Rate')?.outcome).toBe('not-met');
  });

  it('a threshold that cannot be measured must not pass: unmeasurable scope fails loudly', () => {
    const metrics = computeRankMetrics([perfectQuery('fn1', 'felt-need')]);
    const perCategory = {
      ...(allNullBlock()['ndcg10'] as { perCategory: Record<string, null> })['perCategory'],
      'worship-leader': 700000,
    };
    const block = allNullBlock({ ndcg10: { overall: null, perCategory } });
    const quality = evaluateRankQuality(thresholdsOf(block, true), metrics);
    const entry = quality.evaluations.find(
      (candidate) => candidate.metric === 'ndcg10' && candidate.scope === 'worship-leader',
    );
    expect(entry?.outcome).toBe('unmeasurable');
    expect(quality.failures.map((finding) => finding.message).join('\n')).toContain('worship-leader');
  });
});

// ---------------------------------------------------------------------------
// QR-8 (P5.7): the ms/ref acceptance criteria — null honesty, fail-closed
// enforcement, and the documented mutation shape (disable OOV substitution
// -> ms rows go bare-empty -> enforced noSilentEmpty flips the row).
// ---------------------------------------------------------------------------

function acceptanceBattery(): ValidatedBattery {
  const query = (id: string, text: string, category: string) => ({
    id, query: text, category: category as never, addedAt: '2026-08-22', origin: 'test',
    judged: [], harmful: [], legitimatelyEmpty: true,
  });
  return {
    batteryVersion: 1,
    queries: [
      query('ms1', 'forgivness', 'misspelling'),
      query('ms2', 'stregnth', 'misspelling'),
      query('ref1', 'John 3 16', 'reference-adjacent'),
      query('ref2', 'psalm 23', 'reference-adjacent'),
    ],
    activeQueries: 4, judgedRows: 0, harmfulRows: 0, provisionalRows: 0, findings: [],
  };
}

function discoveryOutcome(id: string, text: string, results: number): BatteryQueryOutcome {
  return {
    id, query: text, kind: 'discovery',
    top: Array.from({ length: results }, (_, index) => ({
      rank: index + 1, targetId: `WEB:6200100${index + 1}`, reference: `1 John 1:${index + 1}`,
      score: 10 - index, families: ['concept_anchor'],
    })),
  };
}

function referenceOutcome(id: string, text: string, label: string): BatteryQueryOutcome {
  return { id, query: text, kind: 'reference', top: [], passageReference: label };
}

const ACCEPTANCE_PINS = [{ query: 'John 3 16', expectedReference: 'John 3:16' }];

function healthyOutcomes(): BatteryQueryOutcome[] {
  return [
    discoveryOutcome('ms1', 'forgivness', 3),
    discoveryOutcome('ms2', 'stregnth', 2),
    referenceOutcome('ref1', 'John 3 16', 'John 3:16'),
    referenceOutcome('ref2', 'psalm 23', 'Psalms 23'),
  ];
}

function acceptanceOf(
  block: Record<string, unknown>,
  outcomes: readonly BatteryQueryOutcome[],
  established = false,
  pins: readonly { query: string; expectedReference: string }[] | null = ACCEPTANCE_PINS,
) {
  return evaluateBatteryAcceptance({
    thresholds: thresholdsOf(block, established),
    validated: acceptanceBattery(),
    outcomes,
    referenceGrammarPins: pins,
  });
}

describe('QR-8 acceptance criteria — reviewed-data validation', () => {
  it('rings when the spelling or references sub-block is missing or misshapen', () => {
    expect(blockFindings(allNullBlock({ spelling: undefined }))).toContain('spelling');
    expect(blockFindings(allNullBlock({ references: {} }))).toContain('references');
    expect(blockFindings(allNullBlock({ spelling: { noSilentEmpty: null, extra: 1 } }))).toContain('spelling');
  });

  it('rings on any value that is not null or literally true — false is a tombstone rollback, not a value', () => {
    const text = blockFindings(allNullBlock({ spelling: { noSilentEmpty: false } }), true);
    expect(text).toContain('noSilentEmpty');
    expect(text).toContain('null-with-tombstone');
    expect(blockFindings(allNullBlock({ references: { grammarCoverage: 1 } }), true)).toContain('grammarCoverage');
  });

  it('rings on a premature true while no approved rank baseline exists, and coerces it to null', () => {
    const { thresholds, findings } = validateRankQualityBlock(
      allNullBlock({ spelling: { noSilentEmpty: true } }),
      { rankBaselineEstablished: false },
    );
    expect(findings.length).toBe(1);
    expect(findings[0]!.message).toContain('noSilentEmpty');
    expect(findings[0]!.message).toContain('baseline');
    expect(thresholds!.spelling.noSilentEmpty).toBeNull();
    // The same value with an established baseline is accepted.
    expect(blockFindings(allNullBlock({ spelling: { noSilentEmpty: true } }), true)).toBe('');
  });
});

describe('QR-8 acceptance criteria — null honesty', () => {
  it('null criteria report no-threshold with the plan-stated marker, measured and reported, zero failures', () => {
    const outcome = acceptanceOf(allNullBlock(), healthyOutcomes());
    expect(outcome.failures).toEqual([]);
    expect(outcome.evaluations.map((entry) => entry.outcome)).toEqual(['no-threshold', 'no-threshold']);
    expect(outcome.evaluations[0]!.holds).toBe(true);
    expect(outcome.evaluations[1]!.holds).toBe(true);
    expect(BATTERY_ACCEPTANCE_NULL_MARKER).toBe('not-applicable — thresholds unset');
  });

  it('a bare-empty ms row under a NULL criterion is reported, never failed — and never passed', () => {
    const outcomes = [...healthyOutcomes()];
    outcomes[0] = discoveryOutcome('ms1', 'forgivness', 0);
    const outcome = acceptanceOf(allNullBlock(), outcomes);
    expect(outcome.failures).toEqual([]);
    expect(outcome.evaluations[0]!.outcome).toBe('no-threshold');
    expect(outcome.evaluations[0]!.holds).toBe(false);
    expect(outcome.evaluations[0]!.detail).toContain('ms1');
  });

  it('withRankEvidence prints the marker on the row and never flips it on null criteria', () => {
    const metrics = computeRankMetrics([perfectQuery('fn1', 'felt-need')]);
    const quality = evaluateRankQuality(thresholdsOf(allNullBlock()), metrics);
    const acceptance = acceptanceOf(allNullBlock(), healthyOutcomes());
    const row = withRankEvidence(
      pass('G12-battery', 'Pastoral battery', 'base'), metrics, [], quality, acceptance,
    );
    expect(row.status).toBe('pass');
    expect(row.summary).toContain(BATTERY_ACCEPTANCE_NULL_MARKER);
    expect(row.summary).toContain('spelling.noSilentEmpty');
    expect(row.summary).toContain('references.grammarCoverage');
    expect(row.summary).not.toMatch(/\bmet\b|\bMET\b|\bFAILED\b/);
  });
});

describe('QR-8 acceptance criteria — fail-closed enforcement', () => {
  it('healthy outcomes under enforced criteria report met and do not flip the row', () => {
    const block = allNullBlock({
      spelling: { noSilentEmpty: true }, references: { grammarCoverage: true },
    });
    const outcome = acceptanceOf(block, healthyOutcomes(), true);
    expect(outcome.failures).toEqual([]);
    expect(outcome.evaluations.map((entry) => entry.outcome)).toEqual(['met', 'met']);
  });

  it('the documented mutation shape: a bare-empty ms row fails the enforced criterion and the row', () => {
    // Disabling OOV substitution empties the misspelling rows — exactly this
    // outcome shape. The enforced criterion must flip the run to REJECT.
    const outcomes = [...healthyOutcomes()];
    outcomes[0] = discoveryOutcome('ms1', 'forgivness', 0);
    const block = allNullBlock({ spelling: { noSilentEmpty: true } });
    const outcome = acceptanceOf(block, outcomes, true);
    expect(outcome.evaluations[0]!.outcome).toBe('not-met');
    expect(outcome.failures.map((entry) => entry.message).join('\n')).toContain('ms1');
    const metrics = computeRankMetrics([perfectQuery('fn1', 'felt-need')]);
    const row = withRankEvidence(
      pass('G12-battery', 'Pastoral battery', 'base'), metrics, [],
      evaluateRankQuality(thresholdsOf(allNullBlock()), metrics), outcome,
    );
    expect(row.status).toBe('fail');
  });

  it('an enforced criterion that cannot be verified must not pass: unmeasurable fails loudly', () => {
    // The battery evidence does not record suggestion presence on an
    // invalid-reference outcome, so the enforced criterion cannot certify it.
    const outcomes = [...healthyOutcomes()];
    outcomes[0] = { id: 'ms1', query: 'forgivness', kind: 'invalid-reference', top: [] };
    const block = allNullBlock({ spelling: { noSilentEmpty: true } });
    const outcome = acceptanceOf(block, outcomes, true);
    expect(outcome.evaluations[0]!.outcome).toBe('unmeasurable');
    expect(outcome.failures.length).toBe(1);
  });

  it('grammarCoverage: an unresolved ref row or a pinned-label mismatch fails; missing pins are unmeasurable', () => {
    const block = allNullBlock({ references: { grammarCoverage: true } });
    const unresolved = [...healthyOutcomes()];
    unresolved[2] = discoveryOutcome('ref1', 'John 3 16', 2);
    expect(acceptanceOf(block, unresolved, true).evaluations[1]!.outcome).toBe('not-met');
    const mislabeled = [...healthyOutcomes()];
    mislabeled[2] = referenceOutcome('ref1', 'John 3 16', 'John 16');
    const mislabelOutcome = acceptanceOf(block, mislabeled, true);
    expect(mislabelOutcome.evaluations[1]!.outcome).toBe('not-met');
    expect(mislabelOutcome.failures.map((entry) => entry.message).join('\n')).toContain('John 16');
    expect(acceptanceOf(block, healthyOutcomes(), true, null).evaluations[1]!.outcome).toBe('unmeasurable');
  });
});

describe('battery floors come from reviewed data', () => {
  it('validateBattery without floors reports the gap instead of certifying structure', () => {
    const queries = {
      batteryVersion: 1,
      queries: [{
        id: 'fn1', query: "I'm anxious", category: 'felt-need',
        status: 'active', addedAt: '2026-08-20', origin: 'test',
      }],
    };
    const judgments = {
      batteryVersion: 1,
      judgments: {
        fn1: {
          judged: [{
            ref: 'Philippians 4:6', grade: 3, basis: 'test', judgedBy: 'test', judgedAt: '2026-08-20',
          }],
        },
      },
    };
    const withFloors = validateBattery(queries, judgments, FLOORS);
    expect(withFloors.findings.some((finding) => finding.message.includes('floor'))).toBe(true);
    const without = validateBattery(queries, judgments, null);
    expect(without.findings.map((finding) => finding.message).join('\n')).toContain('unavailable');
  });
});

// ---------------------------------------------------------------------------
// Rank-metrics approval validation. All records below are SYNTHETIC test
// fixtures — no real approval exists yet and none may be authored by this
// repository's tooling; the first real one is an independent reviewer's act.
// ---------------------------------------------------------------------------

const BASELINE = {
  schema: RANK_METRICS_BASELINE_SCHEMA,
  engineVersion: '0.11.0-test',
  corpusFingerprint: 'a'.repeat(64),
  layerFingerprint: 'b'.repeat(64),
  overall: computeRankMetrics([]).overall,
  perCategory: {},
};

function syntheticApproval(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schema: RANK_METRICS_APPROVAL_SCHEMA_V2,
    baselineSha256: canonicalJsonSha256(BASELINE),
    batteryQueriesSha256: 'c'.repeat(64),
    batteryJudgmentsSha256: 'd'.repeat(64),
    engine: {
      engineVersion: '0.11.0-test',
      corpusFingerprint: 'a'.repeat(64),
      layerFingerprint: 'b'.repeat(64),
    },
    reviewerName: 'Example Reviewer',
    reviewerContact: 'reviewer@example.com',
    independence: 'Did not author the rank baseline, the battery, or any change in the PR under review.',
    evidence: { path: 'docs/reviews/2026-09-01-rank-baseline.md', sha256: 'e'.repeat(64) },
    reviewPacketSha256: 'f'.repeat(64),
    reviewedAt: '2026-09-01',
    rationale: 'Synthetic test record.',
    priorProvenance: null,
    bootstrap: 'First rank-metrics baseline; no prior exists to chain.',
    ...overrides,
  };
}

function documentFindings(input: {
  baseline?: unknown;
  approval?: unknown;
  evidenceSha256?: string | null;
}): string {
  return validateRankMetricsBaselineDocuments({
    baseline: 'baseline' in input ? input.baseline : BASELINE,
    approval: 'approval' in input ? input.approval : syntheticApproval(),
    batteryQueriesSha256: 'c'.repeat(64),
    batteryJudgmentsSha256: 'd'.repeat(64),
    evidenceSha256: input.evidenceSha256 !== undefined ? input.evidenceSha256 : 'e'.repeat(64),
  }).map((finding) => finding.message).join('\n');
}

describe('rank-metrics approval validation — every tamper rings', () => {
  it('accepts the well-formed synthetic record', () => {
    expect(documentFindings({})).toBe('');
  });

  it('accepts the pre-protocol state: neither baseline nor approval exists', () => {
    expect(documentFindings({ baseline: null, approval: null })).toBe('');
  });

  it('rings when the baseline exists without an approval', () => {
    expect(documentFindings({ approval: null })).toContain('approval');
  });

  it('rings on an approval with no baseline beside it', () => {
    expect(documentFindings({ baseline: null })).toContain('orphan');
  });

  it('rings on a malformed baseline document', () => {
    expect(documentFindings({ baseline: { schema: 'wrong' } })).toContain('baseline');
  });

  it('rings on a tampered baseline digest', () => {
    const tampered = syntheticApproval({ baselineSha256: '0'.repeat(64) });
    expect(documentFindings({ approval: tampered })).toContain('digest');
  });

  it('rings on a battery digest mismatch — the judgments the metrics read are bound', () => {
    const tampered = syntheticApproval({ batteryJudgmentsSha256: '0'.repeat(64) });
    expect(documentFindings({ approval: tampered })).toContain('judgments');
  });

  it('rings on an unsupported schema', () => {
    const wrong = syntheticApproval({ schema: 'scripture-search-engine/rank-metrics-approval/v1' });
    expect(documentFindings({ approval: wrong })).toContain('schema');
  });

  it('rings on a blank independence attestation', () => {
    const blank = syntheticApproval({ independence: '   ' });
    expect(documentFindings({ approval: blank })).toContain('independence');
  });

  it('rings on an unidentifiable reviewer', () => {
    const blank = syntheticApproval({ reviewerName: '' });
    expect(documentFindings({ approval: blank })).toContain('reviewer');
  });

  it('rings on evidence bytes that do not match the approved digest, or a missing evidence file', () => {
    expect(documentFindings({ evidenceSha256: '9'.repeat(64) })).toContain('evidence');
    expect(documentFindings({ evidenceSha256: null })).toContain('evidence');
  });

  it('rings on an engine identity that does not match the baseline', () => {
    const mismatched = syntheticApproval({
      engine: {
        engineVersion: '0.11.0-test',
        corpusFingerprint: 'a'.repeat(64),
        layerFingerprint: '1'.repeat(64),
      },
    });
    expect(documentFindings({ approval: mismatched })).toContain('identity');
  });

  it('rings on null priorProvenance without a bootstrap explanation', () => {
    const record = syntheticApproval();
    delete record['bootstrap'];
    expect(documentFindings({ approval: record })).toContain('bootstrap');
  });

  it('rings on an unknown field', () => {
    const extra = syntheticApproval({ approvedBy: 'machine' });
    expect(documentFindings({ approval: extra })).toContain('approvedBy');
  });
});

describe('rank metrics report shape used by the evaluations', () => {
  it('evaluates one row per threshold surface: ndcg overall + nine categories + mrr + good@3', () => {
    const metrics: RankMetricsReport = computeRankMetrics([perfectQuery('fn1', 'felt-need')]);
    const { evaluations } = evaluateRankQuality(thresholdsOf(allNullBlock()), metrics);
    expect(evaluations.length).toBe(12);
  });
});
