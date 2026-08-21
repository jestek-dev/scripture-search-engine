/**
 * E9 — the gate mutation harness (plan P1.8).
 *
 * Every alarm in eval/src/gates/ (plus the verdict, tier, and CI-checker
 * surfaces they feed) has at least one RINGING case here: a known-bad input
 * that provably produces `fail` — or the documented warn / not-applicable —
 * asserted beside its passing twin, so the failure is pinned to the exact
 * mutation and not to scaffolding. An alarm whose ringing was never
 * demonstrated is how G6 went decorative and F21 went unnoticed; commenting
 * out any single gate check below must make `npm test` fail.
 *
 * Matrix (module → alarm surface → ringing case):
 *
 * | Module / surface                | Cases                                                        |
 * |---------------------------------|--------------------------------------------------------------|
 * | merge.ts                        | fail>warn>pass precedence; all-N/A; empty-list throw;        |
 * |                                 | DOCUMENTED anti-swallow: N/A beside pass merges green — the  |
 * |                                 | proof of why G12 owns its own roster row                     |
 * | types.ts + report.ts (verdict)  | fail→REJECT; required N/A→REJECT (G10-size wiring); advisory |
 * |                                 | N/A never REJECT and never pass; warn→ADMIT_WITH_WARNINGS;   |
 * |                                 | NME fired→NO_MEASURABLE_EFFECT, REJECT outranks;             |
 * |                                 | gateApplicability context matrix (G12/G1b/default-degrade)   |
 * | golden.ts (G3/G2 in-memory)     | order regression rings; right-rank-wrong-reason rings;       |
 * |                                 | determinism N/A-never-pass edge                              |
 * | collision.ts (G4)               | lexicon floor; shared-phrase; shared-token; collapse report  |
 * | layerB.ts (G5/G9)               | PMI floor; per-verse cap; N/A-never-pass; saturation honesty |
 * | orderingSnapshot.ts (G2)        | all 7 decision-table branches (missing snapshot; missing /   |
 * |                                 | malformed approval; binding mismatches; stale identity;      |
 * |                                 | changed-ordering-without-bump; regenerate tripwire; clean    |
 * |                                 | pass) + v2 tampers (blank reviewer/independence, evidence    |
 * |                                 | digest) + v1 grandfather/sunset. Rule 5 owns the ordering    |
 * |                                 | half of the G8 division-of-labor pair (see probes.ts row)    |
 * | probes.ts (G8/G11)              | adversarial silence; top-10 churn; weak-signal rise;         |
 * |                                 | permuted same-set top-10 passes with churn 0 — ordering is   |
 * |                                 | G2's job (failing half: rule-5 permutation, pinned in        |
 * |                                 | ordering-snapshot.test.ts);                                  |
 * |                                 | baseline-approval tampers (missing, malformed v2, digest,    |
 * |                                 | v1 retired/not-grandfathered, blank attestations);           |
 * |                                 | G11 p95 breach + empty-probe N/A-never-pass edge             |
 * | doctrinalGuardrail.ts (G1/G4)   | missing review row; orphaned row; unreadable file warns      |
 * |                                 | loudly (never pass); flagged pairing fires; uncompiled       |
 * |                                 | ontology N/A                                                 |
 * | corpusGolden.ts (G3)            | expectedTop absent; wrong reason family/label; mustNotRank;  |
 * |                                 | mustNotLead leads (and demote-not-suppress twin);            |
 * |                                 | preferredOrder inversion; vacuous-guard warn (named ref,     |
 * |                                 | verdict flip, never silent); pending-warn chain              |
 * |                                 | (still-failing pending → warn → ADMIT_WITH_WARNINGS, never   |
 * |                                 | fail); reference-intent kind/label rings; fixture-form       |
 * |                                 | exclusivity; concept coverage unproven/dangling              |
 * | rankMetrics.ts (G12 battery)    | schema mutations each ring (grade, overlap, unjudged, floor, |
 * |                                 | orphan, provisional literal); structural fail in EVERY       |
 * |                                 | context; harmful-#1-with-perfect-aggregates → REJECT;        |
 * |                                 | provisional harmful non-gating; vacuous / unprobed guard     |
 * |                                 | warns; context applicability matrix (explicit-target unrun   |
 * |                                 | battery → REJECT; fixture run → visible N/A)                 |
 * | rankMetrics.ts (metrics half)   | null-threshold honesty (never pass, never fail); set         |
 * |                                 | threshold not-met fails the row; unmeasurable-set-threshold  |
 * |                                 | fails; premature threshold rings and is not enforced;        |
 * |                                 | NO_MEASURABLE_EFFECT anchor matrix (fired / anchor-missing   |
 * |                                 | skipped-with-finding / confound-skipped / not-fired) and     |
 * |                                 | verdict precedence; rank-baseline document tampers           |
 * | rankMetrics.ts (CI checker)     | missing report red; missing/duplicate G12 row red; N/A red;  |
 * |                                 | fail red; advisory applicability red; missing evidence red;  |
 * |                                 | warn tolerated-but-printed; pass green twin                  |
 * | gauntletMachineReport.ts        | --expect-no-effect grammar audit (missing / spaced reason    |
 * |                                 | rejected); exit-code matrix (NME non-admit under             |
 * |                                 | --require-admit unless expected)                             |
 * | budgetsProperty.ts (G6)         | weakened applyBudgets rings weak-aggregate-cap; order-       |
 * |                                 | sensitive rank rings permutation; leaky tokenizer rings      |
 * |                                 | hygiene; inverted hierarchy rings; reviewed-constants half   |
 * |                                 | is N/A-with-reason, never pass; pass twin states seed+runs   |
 * | tierReport.ts                   | NOT_EVALUABLE blocks attainment (never satisfies); NOT_MET   |
 * |                                 | blocks; all-DISABLED never attains; harmful #1 → A1 NOT MET; |
 * |                                 | unexecuted battery → A1 NOT EVALUABLE                        |
 * |
 * G10-size is the one roster gate not unit-reachable from here: its byte
 * arithmetic lives inline in eval/src/gauntlet.ts (a run-on-import CLI doing
 * real filesystem walks), so this harness rings its VERDICT wiring — a G10
 * fail and a required G10 not-applicable both REJECT — and leaves the
 * arithmetic to the end-to-end gauntlet run. Extracting sizeGate into
 * eval/src/gates/ is Phase-3 refactor territory, noted here so the gap reads
 * as a decision rather than an oversight.
 *
 * Likewise the --expect-no-effect coverage rings the single-token grammar and
 * the exit-code contract; the YAML side that derives the flag from the diff
 * shape lives in .github/workflows/gauntlet.yml and is not unit-reachable —
 * it is exercised only by the workflow itself (E3's verification territory).
 *
 * Every mutation is synthetic and in-test. No committed reviewed data —
 * baselines, approvals, YAMLs, fixtures — is modified or regenerated here.
 */

import { describe, expect, it } from 'vitest';

import {
  DEFAULT_BUDGETS,
  type BudgetedScore,
  type Candidate,
  type DiscoveryResult,
  type Evidence,
  type RankedResult,
  type ResearchResult,
  type ScriptureEngine,
} from '@jestek-dev/scripture-engine';

import { parseAnchorRef } from '../../pipeline/src/importers/ontologyImporter.js';
import { collisionGate, singleTokenCollapses } from '../src/gates/collision.js';
import {
  conceptCoverageGate,
  corpusGoldenGate,
  runCorpusFixture,
  validateCorpusFixture,
  GUARD_VACUOUS_CATEGORY,
  type CorpusFixture,
} from '../src/gates/corpusGolden.js';
import {
  doctrinalReviewRecordsCheck,
  flaggedPairingsCheck,
} from '../src/gates/doctrinalGuardrail.js';
import { determinismGate, goldenGate, type GoldenFixture } from '../src/gates/golden.js';
import { distinctivenessGate, saturationGate, type DistillateFile } from '../src/gates/layerB.js';
import { mergeGateResults } from '../src/gates/merge.js';
import {
  orderingSnapshotGate,
  probeListsSha256,
  ORDERING_SNAPSHOT_APPROVAL_SCHEMA,
  ORDERING_SNAPSHOT_APPROVAL_SCHEMA_V2,
  type OrderingSnapshot,
} from '../src/gates/orderingSnapshot.js';
import {
  canonicalJsonSha256,
  latencyGate,
  noiseGate,
  validateProbeBaselineApproval,
  PROBE_BASELINE_APPROVAL_SCHEMA,
  PROBE_BASELINE_APPROVAL_SCHEMA_V2,
  type Probe,
  type ProbeBaseline,
  type ProbeObservation,
} from '../src/gates/probes.js';
import {
  batteryGate,
  checkBatteryJobReport,
  computeRankMetrics,
  detectNoMeasurableEffect,
  evaluateRankQuality,
  harmfulPresenceKey,
  validateBattery,
  validateRankMetricsBaselineDocuments,
  validateRankQualityBlock,
  withRankEvidence,
  BATTERY_CATEGORIES,
  RANK_METRICS_APPROVAL_SCHEMA_V2,
  RANK_METRICS_BASELINE_SCHEMA,
  type BatteryCategory,
  type BatteryQueryOutcome,
  type RankQualityThresholds,
  type ValidatedBattery,
  type ValidatedBatteryQuery,
} from '../src/gates/rankMetrics.js';
import {
  budgetsPropertyGate,
  reviewedConstantsCheck,
  G6_PROPERTY_NUM_RUNS,
  G6_PROPERTY_SEED,
  type BudgetsPropertySubjects,
} from '../src/gates/budgetsProperty.js';
import {
  gateApplicability,
  fail,
  notApplicable,
  pass,
  warn,
  type GateResult,
} from '../src/gates/types.js';
import { gauntletExitCode, parseGauntletOptions } from '../src/gauntletMachineReport.js';
import { decideVerdict } from '../src/report.js';
import {
  computeTierReport,
  tierAttained,
  type TierComputationInput,
  type TiersConfig,
} from '../src/tierReport.js';

// ---------------------------------------------------------------------------
// Shared scaffolding
// ---------------------------------------------------------------------------

const HEX_A = 'a'.repeat(64);
const HEX_B = 'b'.repeat(64);
const HEX_C = 'c'.repeat(64);
const HEX_D = 'd'.repeat(64);
const HEX_E = 'e'.repeat(64);
const HEX_F = 'f'.repeat(64);

function categories(result: GateResult): (string | undefined)[] {
  return (result.findings ?? []).map((finding) => finding.categoryCode);
}

function messages(result: GateResult): string {
  return (result.findings ?? []).map((finding) => finding.message).join('\n');
}

const IDENTITY = {
  engineVersion: 'test-engine',
  corpusFingerprint: 'test-corpus',
  layerFingerprint: 'test-layer',
} as const;

function johnVerse(verse: number, label = 'Theme: Test'): DiscoveryResult {
  return {
    targetId: `WEB:${43_000_000 + 3_000 + verse}`,
    reference: `John 3:${verse}`,
    excerpt: `John 3:${verse}`,
    score: 100 - verse,
    reasons: [{ family: 'concept_anchor', label, points: 10 }],
  };
}

/**
 * A corpus-golden test engine: discovery results per query, optional
 * reference resolutions per query, and a corpus that "contains" exactly
 * presentRefs (how guard vacuity is detected against the real engine).
 */
function corpusEngine(options: {
  readonly results?: Readonly<Record<string, readonly DiscoveryResult[]>>;
  readonly references?: Readonly<Record<string, string>>;
  readonly presentRefs?: readonly string[];
}): ScriptureEngine {
  const research = async (query: string): Promise<ResearchResult> => {
    const label = options.references?.[query];
    if (label !== undefined) {
      return { kind: 'reference', passage: { reference: label }, ...IDENTITY } as unknown as ResearchResult;
    }
    return { kind: 'discovery', query, results: options.results?.[query] ?? [], ...IDENTITY };
  };
  return {
    research,
    themes: async () => [],
    passage: async (reference) =>
      (options.presentRefs ?? []).includes(reference)
        ? ({
            kind: 'passage',
            passage: { reference, verses: [{ verseId: 43003016, text: 'present' }] },
            ...IDENTITY,
          } as unknown as Awaited<ReturnType<ScriptureEngine['passage']>>)
        : ({ kind: 'invalid-reference', query: reference, ...IDENTITY } as unknown as Awaited<
            ReturnType<ScriptureEngine['passage']>
          >),
    related: async (query) =>
      ({ kind: 'invalid-reference', query, ...IDENTITY } as unknown as Awaited<
        ReturnType<ScriptureEngine['related']>
      >),
    forSong: async () => ({ kind: 'discovery', query: '', results: [], ...IDENTITY }),
    close: async () => undefined,
    ...IDENTITY,
  } as ScriptureEngine;
}

// ---------------------------------------------------------------------------
// merge.ts — status precedence and the documented anti-swallow
// ---------------------------------------------------------------------------

describe('mergeGateResults precedence', () => {
  const g3pass = pass('G3-golden', 'A', 'ok');
  const g3warn = warn('G3-golden', 'B', 'warned', [{ message: 'w' }]);
  const g3fail = fail('G3-golden', 'C', 'failed', [{ message: 'f' }]);
  const g3na = notApplicable('G3-golden', 'D', 'cannot run');

  it('fail beats warn beats pass', () => {
    expect(mergeGateResults('m', [g3pass, g3warn, g3fail]).status).toBe('fail');
    expect(mergeGateResults('m', [g3pass, g3warn]).status).toBe('warn');
  });

  it('all not-applicable stays not-applicable', () => {
    expect(mergeGateResults('m', [g3na, g3na]).status).toBe('not-applicable');
  });

  it('refuses an empty result list', () => {
    expect(() => mergeGateResults('m', [])).toThrow(/empty/i);
  });

  it('DOCUMENTED SWALLOW: a not-applicable beside a pass merges green — the reason G12 must own its roster row', () => {
    // This is the exact "unrun check reports pass" shape CLAUDE.md forbids.
    // The behaviour is correct for sub-results of one logical gate, and
    // catastrophic for a standalone required gate — proven here directly
    // against mergeGateResults so the constraint is mechanical, not lore.
    const batteryNa = notApplicable('G12-battery', 'Pastoral battery', 'battery did not run');
    const merged = mergeGateResults('merged', [batteryNa, pass('G12-battery', 'Sibling', 'ok')]);
    expect(merged.status).toBe('pass');
    // The gauntlet therefore reports the battery as its own row; merged into
    // any passing sibling, its N/A would disappear into a green row.
  });
});

// ---------------------------------------------------------------------------
// types.ts + report.ts — applicability context and the verdict matrix
// ---------------------------------------------------------------------------

describe('gateApplicability context matrix', () => {
  it('G12 is required exactly when the run has an explicit artifact target', () => {
    expect(gateApplicability('G12-battery', { explicitTarget: true })).toBe('required');
    expect(gateApplicability('G12-battery', { explicitTarget: false })).toBe('optional-advisory');
  });

  it('a caller that loses its context degrades G12 to advisory, never upgrades it', () => {
    expect(gateApplicability('G12-battery')).toBe('optional-advisory');
  });

  it('G1b is always advisory; every other gate is required', () => {
    expect(gateApplicability('G1b-reachability', { explicitTarget: true })).toBe('optional-advisory');
    expect(gateApplicability('G10-size')).toBe('required');
    expect(gateApplicability('G2-determinism')).toBe('required');
  });
});

describe('verdict matrix', () => {
  const ok = pass('G3-golden', 'Golden', 'ok');

  it('any failing gate REJECTs — G10-size wiring included', () => {
    const g10 = fail('G10-size', 'Size budgets', 'artifact exceeds its budget', [{ message: 'over' }]);
    expect(decideVerdict({ gates: [ok, g10] })).toBe('REJECT');
  });

  it('a required gate that could not run REJECTs — unrun is never admissible', () => {
    const g10 = notApplicable('G10-size', 'Size budgets', 'no artifact bytes measured');
    expect(decideVerdict({ gates: [ok, g10] })).toBe('REJECT');
  });

  it('an optional-advisory not-applicable stays visible without rejecting — and without passing', () => {
    const g1b = notApplicable('G1b-reachability', 'Reachability', 'network check not requested');
    expect(g1b.status).toBe('not-applicable');
    expect(decideVerdict({ gates: [ok, g1b] })).toBe('ADMIT');
  });

  it('warn admits with warnings; all-pass admits', () => {
    expect(decideVerdict({ gates: [ok, warn('G3-golden', 'W', 's', [{ message: 'w' }])] })).toBe(
      'ADMIT_WITH_WARNINGS',
    );
    expect(decideVerdict({ gates: [ok] })).toBe('ADMIT');
  });

  it('a fired no-effect detection is NO_MEASURABLE_EFFECT, and a REJECT outranks it', () => {
    const fired = {
      evaluated: true,
      fired: true,
      layerMoved: true,
      comparisons: [],
      expectNoEffect: null,
    };
    expect(decideVerdict({ gates: [ok], noMeasurableEffect: fired })).toBe('NO_MEASURABLE_EFFECT');
    const g10 = fail('G10-size', 'Size budgets', 'over', [{ message: 'over' }]);
    expect(decideVerdict({ gates: [ok, g10], noMeasurableEffect: fired })).toBe('REJECT');
  });
});

describe('--expect-no-effect grammar and exit codes', () => {
  it('rejects a missing or multi-word reason token — the CI audit depends on the single-token grammar', () => {
    expect(() => parseGauntletOptions(['--expect-no-effect'])).toThrow(/requires a reason token/);
    expect(() => parseGauntletOptions(['--expect-no-effect', 'two words'])).toThrow(/space-free token/);
    expect(parseGauntletOptions(['--expect-no-effect', 'ci-auto:re-pin-diff-shape:3-files']).expectNoEffect).toBe(
      'ci-auto:re-pin-diff-shape:3-files',
    );
  });

  it('NO_MEASURABLE_EFFECT is non-admit under --require-admit unless the run claimed it', () => {
    expect(gauntletExitCode('NO_MEASURABLE_EFFECT', true, false)).toBe(1);
    expect(gauntletExitCode('NO_MEASURABLE_EFFECT', true, true)).toBe(0);
    expect(gauntletExitCode('NO_MEASURABLE_EFFECT', false, false)).toBe(0);
    expect(gauntletExitCode('REJECT', false, true)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// golden.ts — in-memory G3 ordering + reasons, G2 replay honesty
// ---------------------------------------------------------------------------

describe('goldenGate mutations', () => {
  const strong: Evidence[] = [{ family: 'exact_phrase', label: 'verbatim', strength: 1 }];
  const weak: Evidence[] = [{ family: 'token_overlap', label: 'overlap', strength: 0.1 }];
  const fixtureWith = (
    expectedOrder: readonly string[],
    requiredReasons?: Readonly<Record<string, string>>,
  ): GoldenFixture => ({
    id: 'mutation-case',
    status: 'active',
    cases: [
      {
        id: 'case-1',
        rule: 'exact phrase outranks weak overlap',
        candidates: [
          { targetId: 'A', groupId: 'g1', evidence: strong },
          { targetId: 'B', groupId: 'g2', evidence: weak },
        ],
        expectedOrder,
        ...(requiredReasons ? { requiredReasons } : {}),
      },
    ],
  });

  it('rings on an ordering regression', () => {
    const result = goldenGate([fixtureWith(['B', 'A'])]);
    expect(result.status).toBe('fail');
    expect(messages(result)).toMatch(/expected order \[B, A\] but got \[A, B\]/);
  });

  it('rings on the right rank carried by the wrong reason — explanations are contract', () => {
    const result = goldenGate([fixtureWith(['A', 'B'], { A: 'concept_anchor' })]);
    expect(result.status).toBe('fail');
    expect(messages(result)).toMatch(/ranked correctly but carries no 'concept_anchor'/);
  });

  it('passing twin: correct order and reasons hold', () => {
    expect(goldenGate([fixtureWith(['A', 'B'], { A: 'exact_phrase' })]).status).toBe('pass');
  });

  it('G2 with nothing to replay reports not-applicable, never pass', () => {
    expect(determinismGate([]).status).toBe('not-applicable');
    expect(determinismGate([fixtureWith(['A', 'B'])]).status).toBe('pass');
  });
});

// ---------------------------------------------------------------------------
// collision.ts — G4
// ---------------------------------------------------------------------------

describe('collisionGate mutations', () => {
  const thresholds = { maxSharedPhraseRatio: 0.34, maxSharedTokenRatio: 0.6, minLexiconEntries: 2 };

  it('rings on a lexicon below the entry floor', () => {
    const result = collisionGate([{ id: 'thin', label: 'Thin', lexicon: ['only phrase'] }], thresholds);
    expect(result.status).toBe('fail');
    expect(messages(result)).toMatch(/minimum is 2/);
  });

  it('rings on shared lexicon phrases and names the colliding pair', () => {
    const result = collisionGate(
      [
        { id: 'courage', label: 'Courage', lexicon: ['fear not', 'be strong'] },
        { id: 'steadfast', label: 'Steadfast', lexicon: ['fear not', 'stand firm'] },
      ],
      thresholds,
    );
    expect(result.status).toBe('fail');
    expect(messages(result)).toMatch(/courage and steadfast share 1 lexicon phrase/);
  });

  it('rings on heavy token-vocabulary overlap without shared phrases', () => {
    const result = collisionGate(
      [
        { id: 'mercy-a', label: 'Mercy A', lexicon: ['great mercy', 'tender mercy'] },
        { id: 'mercy-b', label: 'Mercy B', lexicon: ['tender heart', 'great kindness'] },
      ],
      thresholds,
    );
    expect(result.status).toBe('fail');
    expect(messages(result)).toMatch(/share \d+% of their vocabulary/);
  });

  it('passing twin: distinct concepts are mutually distinct', () => {
    const result = collisionGate(
      [
        { id: 'grace', label: 'Grace', lexicon: ['unmerited favor', 'gift freely given'] },
        { id: 'lament', label: 'Lament', lexicon: ['how long lord', 'pour out complaint'] },
      ],
      thresholds,
    );
    expect(result.status).toBe('pass');
  });

  it('singleTokenCollapses reports a multi-word phrase whose real width is one token', () => {
    const collapses = singleTokenCollapses([
      { id: 'presence', label: 'Presence', lexicon: ['god with us', 'abiding presence'] },
    ]);
    expect(collapses).toEqual([{ conceptId: 'presence', phrase: 'god with us', token: 'god' }]);
  });
});

// ---------------------------------------------------------------------------
// layerB.ts — G5 / G9
// ---------------------------------------------------------------------------

describe('layerB gate mutations', () => {
  const term = (verseId: number, pmi: number, name = `term${verseId}-${pmi}`) => ({
    verseId,
    term: name,
    pmi,
    count: 3,
    sourceIds: 'src',
    authorCount: 1,
    minSpanVerses: 1,
    locator: 'loc',
  });
  const thresholds = { minPmi: 3, maxTermsPerVerse: 2 };

  it('rings when a term below the PMI floor was admitted anyway', () => {
    const distillate: DistillateFile = { terms: [term(1, 1.5)] };
    const result = distinctivenessGate(distillate, thresholds);
    expect(result.status).toBe('fail');
    expect(messages(result)).toMatch(/below the PMI floor/);
  });

  it('rings when one verse hoards terms past the cap', () => {
    const distillate: DistillateFile = {
      terms: [term(7, 5, 'a'), term(7, 5, 'b'), term(7, 5, 'c')],
    };
    const result = distinctivenessGate(distillate, thresholds);
    expect(result.status).toBe('fail');
    expect(messages(result)).toMatch(/exceed the 2-term cap/);
  });

  it('reports not-applicable, never pass, when there is nothing to measure', () => {
    expect(distinctivenessGate(null, thresholds).status).toBe('not-applicable');
    expect(saturationGate(null, { minProfileDelta: 0.01, worksPerPericopeBeforeCheck: 3 }).status).toBe(
      'not-applicable',
    );
    expect(
      saturationGate({ terms: [term(1, 5)] }, { minProfileDelta: 0.01, worksPerPericopeBeforeCheck: 3 })
        .status,
    ).toBe('not-applicable');
  });

  it('saturation is loud information, deliberately not a failure', () => {
    const saturated = saturationGate(
      { terms: [term(1, 5)], stats: { halfCorpusProfileDelta: 0.001 } },
      { minProfileDelta: 0.01, worksPerPericopeBeforeCheck: 3 },
    );
    expect(saturated.status).toBe('pass');
    expect(saturated.summary).toMatch(/SATURATED/);
    expect(saturated.metrics?.['saturated']).toBe(1);
  });

  it('passing twin: floor enforced and profiles still moving', () => {
    const clean = distinctivenessGate({ terms: [term(1, 5), term(2, 4)] }, thresholds);
    expect(clean.status).toBe('pass');
  });
});

// ---------------------------------------------------------------------------
// orderingSnapshot.ts — the 7-branch decision table and approval tampers
// ---------------------------------------------------------------------------

describe('orderingSnapshotGate decision table', () => {
  const OS_IDENTITY = { engineVersion: '1.0.0', corpusFingerprint: HEX_A, layerFingerprint: HEX_B };
  const SNAPSHOT: OrderingSnapshot = {
    ...OS_IDENTITY,
    probes: [{ id: 'p1', results: [{ targetId: 'WEB:43003016', score: 1.5 }] }],
  };
  const SNAP_SHA = canonicalJsonSha256(SNAPSHOT);
  const LISTS_SHA = probeListsSha256(SNAPSHOT.probes);
  const EVIDENCE_SHA = HEX_C;

  function v2Approval(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      schema: ORDERING_SNAPSHOT_APPROVAL_SCHEMA_V2,
      snapshotSha256: SNAP_SHA,
      probeListsSha256: LISTS_SHA,
      engine: OS_IDENTITY,
      reviewerName: 'Synthetic Reviewer',
      reviewerContact: 'reviewer@example.test',
      independence: 'did not author the snapshot under review',
      evidence: { path: 'docs/reviews/synthetic-ordering.md', sha256: EVIDENCE_SHA },
      reviewedAt: '2026-08-21',
      rationale: 'synthetic record for the mutation harness',
      priorProvenance: null,
      bootstrap: 'first snapshot in this synthetic history',
      ...overrides,
    };
  }

  function gate(overrides: Partial<Parameters<typeof orderingSnapshotGate>[0]> = {}): GateResult {
    return orderingSnapshotGate({
      snapshot: SNAPSHOT,
      approval: v2Approval(),
      evidenceSha256: EVIDENCE_SHA,
      observed: { identity: OS_IDENTITY, probes: SNAPSHOT.probes },
      ...overrides,
    });
  }

  const cat = (code: string) => `sse.gauntlet.v1.finding.g2-determinism.${code}`;

  it('rule 7 twin: a consistent snapshot + approval passes', () => {
    expect(gate().status).toBe('pass');
  });

  it('rule 1: a deleted snapshot rings — the guard was removed, not unneeded', () => {
    const result = gate({ snapshot: null });
    expect(result.status).toBe('fail');
    expect(categories(result)).toContain(cat('ordering-snapshot-missing'));
  });

  it('rule 2: missing, unknown-schema, and malformed approvals each ring', () => {
    expect(categories(gate({ approval: null }))).toContain(cat('ordering-approval-missing'));
    expect(categories(gate({ approval: { schema: 'something-else' } }))).toContain(
      cat('ordering-approval-malformed'),
    );
    const { reviewedAt: _dropped, ...missingField } = v2Approval();
    const malformed = gate({ approval: missingField });
    expect(categories(malformed)).toContain(cat('ordering-approval-malformed'));
    expect(messages(malformed)).toMatch(/missing field "reviewedAt"/);
  });

  it('rule 3: every binding mismatch rings by name — snapshot digest, probe lists, engine identity', () => {
    expect(categories(gate({ approval: v2Approval({ snapshotSha256: HEX_D }) }))).toContain(
      cat('ordering-approval-snapshot-mismatch'),
    );
    expect(categories(gate({ approval: v2Approval({ probeListsSha256: HEX_D }) }))).toContain(
      cat('ordering-approval-probe-lists-mismatch'),
    );
    expect(
      categories(
        gate({ approval: v2Approval({ engine: { ...OS_IDENTITY, corpusFingerprint: HEX_F } }) }),
      ),
    ).toContain(cat('ordering-approval-engine-mismatch'));
  });

  it('rule 4: an identity that moved without a regenerated snapshot is stale', () => {
    const result = gate({
      observed: {
        identity: { ...OS_IDENTITY, engineVersion: '1.0.1' },
        probes: SNAPSHOT.probes,
      },
    });
    expect(result.status).toBe('fail');
    expect(categories(result)).toContain(cat('ordering-snapshot-stale-identity'));
  });

  it('rule 5: orderings that changed while the identity triple did not are a defect by definition', () => {
    const result = gate({
      observed: {
        identity: OS_IDENTITY,
        probes: [{ id: 'p1', results: [{ targetId: 'WEB:43003017', score: 1.5 }] }],
      },
    });
    expect(result.status).toBe('fail');
    expect(categories(result)).toContain(cat('ordering-changed-without-version-bump'));
    expect(result.metrics?.['changedProbeOrderings']).toBe(1);
  });

  it('rule 6 tripwire: regenerated lists under an unmoved engine identity ring even when rules 1-5 hold', () => {
    const approval = v2Approval({
      priorProvenance: {
        snapshotGitBlobSha1: '1'.repeat(40),
        probeListsSha256: HEX_E, // moved vs the approval's own LISTS_SHA
        engine: OS_IDENTITY, // ...while the identity did not
      },
    });
    delete approval['bootstrap'];
    const result = gate({ approval });
    expect(result.status).toBe('fail');
    expect(categories(result)).toContain(cat('ordering-approval-tripwire'));
  });

  it('v2 tampers: blank reviewer identity, blank independence, and evidence digest each ring', () => {
    expect(categories(gate({ approval: v2Approval({ reviewerName: '   ' }) }))).toContain(
      cat('ordering-approval-reviewer-unidentified'),
    );
    expect(categories(gate({ approval: v2Approval({ independence: ' ' }) }))).toContain(
      cat('ordering-approval-independence-missing'),
    );
    expect(categories(gate({ evidenceSha256: null }))).toContain(
      cat('ordering-approval-evidence-mismatch'),
    );
    expect(categories(gate({ evidenceSha256: HEX_D }))).toContain(
      cat('ordering-approval-evidence-mismatch'),
    );
  });

  it('v1 is closed: a non-grandfathered identity and a post-sunset date each ring', () => {
    const v1 = {
      schema: ORDERING_SNAPSHOT_APPROVAL_SCHEMA,
      snapshotSha256: SNAP_SHA,
      probeListsSha256: LISTS_SHA,
      engine: OS_IDENTITY,
      reviewer: 'someone',
      reviewedAt: '2026-08-21',
      rationale: 'retroactive v1 record',
      priorProvenance: null,
    };
    const result = gate({ approval: v1 });
    expect(result.status).toBe('fail');
    expect(categories(result)).toContain(cat('ordering-approval-v1-not-grandfathered'));
    expect(categories(result)).toContain(cat('ordering-approval-v1-retired'));
  });
});

// ---------------------------------------------------------------------------
// probes.ts — G8 noise measurements, approval tampers, G11 latency edges
// ---------------------------------------------------------------------------

describe('noiseGate mutations', () => {
  const thresholds = { maxTop10ChurnRatio: 0.4, maxWeakReasonShareIncrease: 0.15 };
  const observation = (overrides: Partial<ProbeObservation> & { id: string }): ProbeObservation => ({
    top: [],
    resultCount: 0,
    weakReasonShare: 0,
    meanTopScore: 0,
    ...overrides,
  });

  it('rings when an adversarial probe returns results — with or without a baseline', () => {
    const probes: Probe[] = [
      { id: 'adv1', query: 'nonsense', kind: 'adversarial', expectNoResults: true, why: 'must stay silent' },
    ];
    const result = noiseGate({
      probes,
      observations: [observation({ id: 'adv1', top: ['WEB:1'], resultCount: 3 })],
      baseline: null,
      thresholds,
    });
    expect(result.status).toBe('fail');
    expect(categories(result)).toContain('sse.gauntlet.v1.finding.g8-noise-probes.adversarial-results');
  });

  it('without a baseline, churn is honestly declared unmeasured — not silently green', () => {
    const result = noiseGate({
      probes: [{ id: 'p1', query: 'q', kind: 'broad' }],
      observations: [observation({ id: 'p1', top: ['WEB:1'], resultCount: 1 })],
      baseline: null,
      thresholds,
    });
    expect(result.status).toBe('pass');
    expect(result.summary).toMatch(/churn is not measured this run/);
  });

  it('rings when the top-10 churns past the budget', () => {
    const before = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const baseline: ProbeBaseline = {
      ...{ corpusFingerprint: HEX_A, layerFingerprint: HEX_B, engineVersion: '1.0.0' },
      observations: [observation({ id: 'p1', top: before, resultCount: 10 })],
    };
    const result = noiseGate({
      probes: [{ id: 'p1', query: 'q', kind: 'broad' }],
      observations: [
        observation({ id: 'p1', top: ['x1', 'x2', 'x3', 'x4', 'x5', 'a', 'b', 'c', 'd', 'e'], resultCount: 10 }),
      ],
      baseline,
      thresholds,
    });
    expect(result.status).toBe('fail');
    expect(categories(result)).toContain('sse.gauntlet.v1.finding.g8-noise-probes.top-results-churn');
  });

  it('division of labor: the same top-10 permuted is churn 0 — G8 stays green, ordering is G2 territory', () => {
    // churn() is set-based by design: a reversed-but-identical top-10 drops
    // nothing, so G8 passes with churn 0. The failing half of this pair —
    // the same permutation ringing as a defect — is G2's rule-5 permutation
    // case (ordering-snapshot.test.ts, '#2 and #1 swapped'). Together they
    // pin the division of labor: G8 owns set membership, G2 owns order.
    const before = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const baseline: ProbeBaseline = {
      corpusFingerprint: HEX_A,
      layerFingerprint: HEX_B,
      engineVersion: '1.0.0',
      observations: [observation({ id: 'p1', top: before, resultCount: 10 })],
    };
    const result = noiseGate({
      probes: [{ id: 'p1', query: 'q', kind: 'broad' }],
      observations: [observation({ id: 'p1', top: [...before].reverse(), resultCount: 10 })],
      baseline,
      thresholds,
    });
    expect(result.status).toBe('pass');
    expect(result.metrics?.['maxChurnRatio']).toBe(0);
  });

  it('rings when weak signals rise past the budget — precision erosion made visible', () => {
    const baseline: ProbeBaseline = {
      corpusFingerprint: HEX_A,
      layerFingerprint: HEX_B,
      engineVersion: '1.0.0',
      observations: [observation({ id: 'p1', top: ['a'], resultCount: 1, weakReasonShare: 0.1 })],
    };
    const result = noiseGate({
      probes: [{ id: 'p1', query: 'q', kind: 'broad' }],
      observations: [observation({ id: 'p1', top: ['a'], resultCount: 1, weakReasonShare: 0.9 })],
      baseline,
      thresholds,
    });
    expect(result.status).toBe('fail');
    expect(categories(result)).toContain('sse.gauntlet.v1.finding.g8-noise-probes.weak-signal-rise');
  });

  it('passing twin: stable lists against the baseline', () => {
    const baseline: ProbeBaseline = {
      corpusFingerprint: HEX_A,
      layerFingerprint: HEX_B,
      engineVersion: '1.0.0',
      observations: [observation({ id: 'p1', top: ['a', 'b'], resultCount: 2, weakReasonShare: 0.2 })],
    };
    const result = noiseGate({
      probes: [{ id: 'p1', query: 'q', kind: 'broad' }],
      observations: [observation({ id: 'p1', top: ['a', 'b'], resultCount: 2, weakReasonShare: 0.2 })],
      baseline,
      thresholds,
    });
    expect(result.status).toBe('pass');
  });
});

describe('probe-baseline approval tampers', () => {
  const engine = { engineVersion: '1.0.0', corpusFingerprint: HEX_A, layerFingerprint: HEX_B };
  const baseline: ProbeBaseline = { ...engine, observations: [] };
  const baselineSha256 = canonicalJsonSha256(baseline);
  const probesSha256 = HEX_D;
  const evidenceSha = HEX_C;

  function v2(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      schema: PROBE_BASELINE_APPROVAL_SCHEMA_V2,
      baselineSha256,
      probesSha256,
      engine,
      reviewerName: 'Synthetic Reviewer',
      reviewerContact: 'reviewer@example.test',
      independence: 'did not author the baseline under review',
      evidence: { path: 'docs/reviews/synthetic-probes.md', sha256: evidenceSha },
      reviewPacketSha256: HEX_E,
      reviewedAt: '2026-08-21',
      rationale: 'synthetic record for the mutation harness',
      priorProvenance: null,
      bootstrap: 'first baseline in this synthetic history',
      ...overrides,
    };
  }

  function validate(approval: unknown, evidenceSha256: string | null = evidenceSha) {
    return validateProbeBaselineApproval({
      baseline,
      approval,
      baselineSha256,
      probesSha256,
      engine,
      evidenceSha256,
    }).map((finding) => finding.categoryCode);
  }

  const cat = (code: string) => `sse.gauntlet.v1.finding.g8-noise-probes.${code}`;

  it('twin: a well-formed v2 approval binding the exact documents yields no findings', () => {
    expect(validate(v2())).toEqual([]);
  });

  it('rings on a missing or unrecognised approval', () => {
    expect(validate(null)).toContain(cat('baseline-approval-missing'));
    expect(validate({ schema: 'unsupported' })).toContain(cat('baseline-approval-malformed'));
  });

  it('rings on v2 field tampering — a doctored digest, a blank attestation, missing evidence', () => {
    expect(validate(v2({ baselineSha256: HEX_F }))).toContain(cat('baseline-approval-baseline-mismatch'));
    expect(validate(v2({ probesSha256: HEX_F }))).toContain(cat('baseline-approval-probes-mismatch'));
    expect(validate(v2({ engine: { ...engine, layerFingerprint: HEX_F } }))).toContain(
      cat('baseline-approval-engine-mismatch'),
    );
    expect(validate(v2({ reviewerName: '  ' }))).toContain(cat('baseline-approval-reviewer-unidentified'));
    expect(validate(v2({ independence: '' }))).toContain(cat('baseline-approval-independence-missing'));
    expect(validate(v2(), null)).toContain(cat('baseline-approval-evidence-mismatch'));
  });

  it('rings on a v1 record for a non-grandfathered identity or dated past the sunset', () => {
    const v1 = {
      schema: PROBE_BASELINE_APPROVAL_SCHEMA,
      baselineSha256,
      probesSha256,
      engine,
      reviewer: 'someone',
      reviewedAt: '2026-08-21',
      rationale: 'retroactive v1 record',
      priorProvenance: {
        baselineGitBlobSha1: '1'.repeat(40),
        engine: { engineVersion: '0.9.0', corpusFingerprint: HEX_A, layerFingerprint: null },
      },
    };
    const findings = validate(v1);
    expect(findings).toContain(cat('baseline-approval-v1-not-grandfathered'));
    expect(findings).toContain(cat('baseline-approval-v1-retired'));
  });
});

describe('latencyGate edges (G11)', () => {
  it('rings when p95 exceeds the budget', () => {
    const result = latencyGate([120], 50);
    expect(result.status).toBe('fail');
    expect(result.summary).toMatch(/exceeds 50ms/);
  });

  it('an empty probe run is not-applicable — never a green unmeasured p95', () => {
    expect(latencyGate([], 50).status).toBe('not-applicable');
  });

  it('passing twin: within budget', () => {
    expect(latencyGate([10, 12, 14], 50).status).toBe('pass');
  });
});

// ---------------------------------------------------------------------------
// doctrinalGuardrail.ts — G1/G4 red-flag checks
// ---------------------------------------------------------------------------

describe('doctrinal guardrail mutations', () => {
  const reviewRow = (source: string): string =>
    [
      `  - source: ${source}`,
      '    reviewedAt: "2026-08-15"',
      '    reviewer: "synthetic test reviewer"',
      '    verdict: compatible',
      '    criteria: ["DOCTRINAL-BASIS.md §3"]',
    ].join('\n');

  it('rings when an admitted source has no review row', () => {
    const result = doctrinalReviewRecordsCheck(['covered', 'uncovered'], `reviews:\n${reviewRow('covered')}\n`);
    expect(result.status).toBe('warn');
    expect(messages(result)).toMatch(/"uncovered" has no doctrinal review record/);
  });

  it('rings when a review row is orphaned by a renamed source', () => {
    const result = doctrinalReviewRecordsCheck(
      ['covered'],
      `reviews:\n${reviewRow('covered')}\n${reviewRow('renamed-away')}\n`,
    );
    expect(result.status).toBe('warn');
    expect(messages(result)).toMatch(/"renamed-away" names no manifest/);
  });

  it('a guardrail that cannot read its data warns loudly — never pass', () => {
    const missing = doctrinalReviewRecordsCheck(['covered'], null);
    expect(missing.status).toBe('warn');
    expect(missing.summary).toMatch(/did not run/i);
    const broken = doctrinalReviewRecordsCheck(['covered'], 'reviews: "not a list"');
    expect(broken.status).toBe('warn');
  });

  it('twins: all-reviewed passes; zero manifests is not-applicable', () => {
    expect(doctrinalReviewRecordsCheck(['covered'], `reviews:\n${reviewRow('covered')}\n`).status).toBe('pass');
    expect(doctrinalReviewRecordsCheck([], `reviews:\n${reviewRow('covered')}\n`).status).toBe('not-applicable');
  });

  const watchlistYaml = [
    'materialFrameKeywords:',
    '  - wealth',
    '  - breakthrough',
    'watchlist:',
    '  - ref: "Malachi 3:10"',
    '    concern: "Tithe-transaction proof-text recruited as return-on-giving."',
  ].join('\n');
  const malachiRange = parseAnchorRef('Malachi 3:10');
  if (!malachiRange) throw new Error('test reference did not parse');
  const anchor = {
    conceptId: 'financial-breakthrough',
    startVerseId: malachiRange.start,
    endVerseId: malachiRange.end,
    sourceId: 'editorial',
    weight: 1,
    locator: null,
  };

  it('rings when a material-framed concept anchors a watchlist reference', () => {
    const result = flaggedPairingsCheck({
      concepts: [
        { id: 'financial-breakthrough', label: 'Financial Breakthrough', lexicon: ['wealth transfer'] },
      ],
      anchors: [anchor],
      ontologyCompiled: true,
      watchlistFileContents: watchlistYaml,
    });
    expect(result.status).toBe('warn');
    expect(messages(result)).toMatch(/DOCTRINAL RED FLAG/);
    expect(messages(result)).toMatch(/Malachi 3:10/);
  });

  it('the verse is never the problem: a non-material concept anchoring the same verse stays silent', () => {
    const result = flaggedPairingsCheck({
      concepts: [{ id: 'generosity', label: 'Generosity', lexicon: ['cheerful giver'] }],
      anchors: [{ ...anchor, conceptId: 'generosity' }],
      ontologyCompiled: true,
      watchlistFileContents: watchlistYaml,
    });
    expect(result.status).toBe('pass');
  });

  it('an uncompiled ontology is not-applicable; an unreadable watchlist warns loudly', () => {
    expect(
      flaggedPairingsCheck({
        concepts: [],
        anchors: [],
        ontologyCompiled: false,
        watchlistFileContents: watchlistYaml,
      }).status,
    ).toBe('not-applicable');
    expect(
      flaggedPairingsCheck({
        concepts: [],
        anchors: [],
        ontologyCompiled: true,
        watchlistFileContents: null,
      }).status,
    ).toBe('warn');
  });
});

// ---------------------------------------------------------------------------
// corpusGolden.ts — G3 assertion surfaces, vacuity honesty, the pending chain
// ---------------------------------------------------------------------------

describe('corpusGolden mutations', () => {
  const fixture = (overrides: Record<string, unknown>): CorpusFixture =>
    ({ id: 'mutation-fixture', status: 'active', query: 'guarded query', ...overrides } as CorpusFixture);

  it('rings when an expected reference is absent from its window', async () => {
    const problems = await runCorpusFixture(
      corpusEngine({ results: { 'guarded query': [johnVerse(1)] } }),
      fixture({ expectedTop: [{ ref: 'John 3:16', withinTop: 1 }] }),
    );
    expect(problems.join('\n')).toMatch(/expected John 3:16 within the top 1 .* absent/);
  });

  it('rings on the right verse carried by the wrong reason family or label', async () => {
    const engine = corpusEngine({ results: { 'guarded query': [johnVerse(16)] } });
    const familyProblems = await runCorpusFixture(
      engine,
      fixture({ expectedTop: [{ ref: 'John 3:16', withinTop: 1, requiredReasonFamily: 'exact_phrase' }] }),
    );
    expect(familyProblems.join('\n')).toMatch(/carries no 'exact_phrase' reason/);
    const labelProblems = await runCorpusFixture(
      engine,
      fixture({
        expectedTop: [{ ref: 'John 3:16', withinTop: 1, requiredReasonLabel: 'Theme: Other Concept' }],
      }),
    );
    expect(labelProblems.join('\n')).toMatch(/carries no reason labelled 'Theme: Other Concept'/);
  });

  it('rings when a banned reference ranks, and when a guarded reference leads', async () => {
    const banned = await runCorpusFixture(
      corpusEngine({ results: { 'guarded query': [johnVerse(18)] }, presentRefs: ['John 3:18'] }),
      fixture({ expectedWithinTop: 5, mustNotRank: [{ ref: 'John 3:18', why: 'banned for this query' }] }),
    );
    expect(banned.join('\n')).toMatch(/must not rank .* position 1/);

    const leads = await runCorpusFixture(
      corpusEngine({
        results: { 'guarded query': [johnVerse(18), johnVerse(16)] },
        presentRefs: ['John 3:18'],
      }),
      fixture({ mustNotLead: [{ ref: 'John 3:18', why: 'sense-inverted for this query' }] }),
    );
    expect(leads.join('\n')).toMatch(/must not lead .* position 1/);
  });

  it('demote-not-suppress twin: the guarded reference below the window passes', async () => {
    const problems = await runCorpusFixture(
      corpusEngine({
        results: { 'guarded query': [johnVerse(16), johnVerse(18)] },
        presentRefs: ['John 3:18'],
      }),
      fixture({ mustNotLead: [{ ref: 'John 3:18', why: 'sense-inverted for this query' }] }),
    );
    expect(problems).toEqual([]);
  });

  it('rings on an inverted preferred order', async () => {
    const problems = await runCorpusFixture(
      corpusEngine({ results: { 'guarded query': [johnVerse(17), johnVerse(16)] } }),
      fixture({ preferredOrder: [{ above: 'John 3:16', below: 'John 3:17', withinTop: 5 }] }),
    );
    expect(problems.join('\n')).toMatch(/expected John 3:16 above John 3:17/);
  });

  it('a guard naming an absent reference is VACUOUS: warned by name, verdict flipped, never silent', async () => {
    const result = await corpusGoldenGate(
      corpusEngine({ results: { 'guarded query': [johnVerse(16)] } }), // corpus contains nothing
      [fixture({ mustNotLead: [{ ref: 'John 3:18', why: 'guarded' }] })],
    );
    expect(result.status).toBe('warn');
    const vacuous = (result.findings ?? []).filter((f) => f.categoryCode === GUARD_VACUOUS_CATEGORY);
    expect(vacuous.length).toBe(1);
    expect(vacuous[0]!.message).toMatch(/John 3:18.*VACUOUS/);
    expect(decideVerdict({ gates: [result] })).toBe('ADMIT_WITH_WARNINGS');
  });

  it('pending-warn chain: a still-failing pending fixture warns with detail and never fails the build', async () => {
    const result = await corpusGoldenGate(corpusEngine({ results: {} }), [
      fixture({
        id: 'pending-spec',
        status: 'pending',
        expectedTop: [{ ref: 'John 3:16', withinTop: 1 }],
      }),
    ]);
    expect(result.status).toBe('warn');
    const stillFailing = (result.findings ?? []).filter(
      (f) => f.categoryCode === 'sse.gauntlet.v1.finding.g3-golden.pending-still-failing',
    );
    expect(stillFailing.length).toBe(1);
    expect(stillFailing[0]!.metrics?.['failedExpectations']).toBe(1);
    expect(decideVerdict({ gates: [result] })).toBe('ADMIT_WITH_WARNINGS');
  });

  it('rings on reference-intent kind and exact-label mutations', async () => {
    const engine = corpusEngine({ references: { 'psalm 23': 'Psalms 23' }, results: {} });
    const referenceFixture = (
      expectations: readonly Record<string, unknown>[],
    ): CorpusFixture =>
      ({
        id: 'ref-fixture',
        status: 'active',
        referenceExpectations: expectations,
      } as unknown as CorpusFixture);
    const wrongKind = await runCorpusFixture(
      engine,
      referenceFixture([{ query: 'not a ref', expectedKind: 'reference', expectedPassage: 'Psalms 23' }]),
    );
    expect(wrongKind.join('\n')).toMatch(/expected "not a ref" to resolve as reference/);
    const wrongLabel = await runCorpusFixture(
      engine,
      referenceFixture([{ query: 'psalm 23', expectedKind: 'reference', expectedPassage: 'Psalm 23' }]),
    );
    expect(wrongLabel.join('\n')).toMatch(/resolves to "Psalms 23", expected exactly "Psalm 23"/);
  });

  it('the two fixture forms are structurally exclusive', () => {
    const findings = validateCorpusFixture(
      fixture({
        referenceExpectations: [{ query: 'q', expectedKind: 'discovery' }],
        expectedTop: [{ ref: 'John 3:16' }],
      }),
    );
    expect(findings.length).toBeGreaterThan(0);
  });

  it('concept coverage rings on unproven and dangling claims', () => {
    const concepts = [{ id: 'lament', label: 'Lament' }];
    const unproven = conceptCoverageGate(concepts, [fixture({ id: 'lament', expectedTop: [] })]);
    expect(unproven.status).toBe('fail');
    expect(messages(unproven)).toMatch(/no active fixture demonstrates this concept/);

    const dangling = conceptCoverageGate(concepts, [
      fixture({ id: 'other', coversConcepts: ['renamed-away'] }),
    ]);
    expect(dangling.status).toBe('fail');
    expect(messages(dangling)).toMatch(/no concept "renamed-away" exists/);
  });
});

// ---------------------------------------------------------------------------
// rankMetrics.ts — battery schema, harmful hard-fail, context applicability
// ---------------------------------------------------------------------------

const CATEGORY_PREFIX: Readonly<Record<BatteryCategory, string>> = {
  'felt-need': 'fn',
  'single-word': 'sw',
  'remembered-phrase': 'rp',
  'theological-term': 'th',
  'reference-adjacent': 'ra',
  'misspelling': 'ms',
  'adversarial': 'ad',
  'multi-concept': 'mc',
  'worship-leader': 'wl',
};

const UNIT_FLOORS = Object.fromEntries(BATTERY_CATEGORIES.map((category) => [category, 1])) as Record<
  BatteryCategory,
  number
>;

interface BatteryFiles {
  queriesFile: { batteryVersion: number; queries: Record<string, unknown>[] };
  judgmentsFile: { batteryVersion: number; judgments: Record<string, unknown> };
}

/** One active judged query per category — the minimal floor-satisfying set. */
function goodBatteryFiles(): BatteryFiles {
  const queries = BATTERY_CATEGORIES.map((category) => ({
    id: `${CATEGORY_PREFIX[category]}1`,
    query: `${category} specimen`,
    category,
    status: 'active',
    addedAt: '2026-08-20',
    origin: 'mutation harness synthetic',
  }));
  const judgments = Object.fromEntries(
    queries.map((query) => [
      query.id,
      {
        judged: [
          { ref: 'John 3:16', grade: 3, basis: 'synthetic', judgedBy: 'harness', judgedAt: '2026-08-20' },
        ],
      },
    ]),
  );
  return {
    queriesFile: { batteryVersion: 1, queries },
    judgmentsFile: { batteryVersion: 1, judgments },
  };
}

function batteryCategories(validated: ValidatedBattery): (string | undefined)[] {
  return validated.findings.map((finding) => finding.categoryCode);
}

const g12cat = (code: string) => `sse.gauntlet.v1.finding.g12-battery.${code}`;

describe('battery schema mutations', () => {
  it('twin: the floor-satisfying synthetic battery validates clean', () => {
    const { queriesFile, judgmentsFile } = goodBatteryFiles();
    const validated = validateBattery(queriesFile, judgmentsFile, UNIT_FLOORS);
    expect(validated.findings).toEqual([]);
    expect(validated.activeQueries).toBe(9);
  });

  it('rings on an out-of-scale grade', () => {
    const files = goodBatteryFiles();
    (files.judgmentsFile.judgments['fn1'] as { judged: { grade: number }[] }).judged[0]!.grade = 5;
    const validated = validateBattery(files.queriesFile, files.judgmentsFile, UNIT_FLOORS);
    expect(batteryCategories(validated)).toContain(g12cat('schema'));
    expect(validated.findings.map((f) => f.message).join('\n')).toMatch(/grade must be an integer 0-3/);
  });

  it('rings on overlapping judged ranges — claim-once matching needs disjoint ranges', () => {
    const files = goodBatteryFiles();
    (files.judgmentsFile.judgments['fn1'] as { judged: unknown[] }).judged.push({
      ref: 'John 3:16',
      grade: 1,
      basis: 'duplicate',
      judgedBy: 'harness',
      judgedAt: '2026-08-20',
    });
    const validated = validateBattery(files.queriesFile, files.judgmentsFile, UNIT_FLOORS);
    expect(batteryCategories(validated)).toContain(g12cat('duplicate-range'));
  });

  it('rings on an active query with neither judgments nor a legitimatelyEmpty record', () => {
    const files = goodBatteryFiles();
    delete files.judgmentsFile.judgments['fn1'];
    const validated = validateBattery(files.queriesFile, files.judgmentsFile, UNIT_FLOORS);
    expect(batteryCategories(validated)).toContain(g12cat('unjudged-query'));
  });

  it('rings when a category falls below its structural floor', () => {
    const files = goodBatteryFiles();
    files.queriesFile.queries = files.queriesFile.queries.filter((query) => query['id'] !== 'ad1');
    delete files.judgmentsFile.judgments['ad1'];
    const validated = validateBattery(files.queriesFile, files.judgmentsFile, UNIT_FLOORS);
    expect(batteryCategories(validated)).toContain(g12cat('category-floor'));
  });

  it('rings on an orphaned judgment and on a non-literal provisional flag', () => {
    const files = goodBatteryFiles();
    files.judgmentsFile.judgments['zz9'] = { judged: [] };
    (files.judgmentsFile.judgments['fn1'] as { judged: Record<string, unknown>[] }).judged[0]![
      'provisional'
    ] = 'yes';
    const validated = validateBattery(files.queriesFile, files.judgmentsFile, UNIT_FLOORS);
    expect(batteryCategories(validated)).toContain(g12cat('orphan-judgment'));
    expect(validated.findings.map((f) => f.message).join('\n')).toMatch(/provisional may only be literally true/);
  });

  it('structural failure rings in EVERY context — a fixture run cannot hide a malformed battery', () => {
    const files = goodBatteryFiles();
    (files.judgmentsFile.judgments['fn1'] as { judged: { grade: number }[] }).judged[0]!.grade = 5;
    const validated = validateBattery(files.queriesFile, files.judgmentsFile, UNIT_FLOORS);
    const gate = batteryGate({
      validated,
      outcomes: null,
      harmfulPresence: null,
      context: { explicitTarget: false },
    });
    expect(gate.status).toBe('fail');
  });
});

/** A ValidatedBattery built directly — gate-level cases, schema already vetted. */
function validatedBatteryOf(queries: readonly ValidatedBatteryQuery[]): ValidatedBattery {
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

function batteryQuery(overrides: Partial<ValidatedBatteryQuery> & { id: string }): ValidatedBatteryQuery {
  return {
    query: `query ${overrides.id}`,
    category: 'felt-need',
    addedAt: '2026-08-20',
    origin: 'mutation harness synthetic',
    judged: [],
    harmful: [],
    legitimatelyEmpty: false,
    ...overrides,
  };
}

function outcomeOf(id: string, verseIds: readonly number[]): BatteryQueryOutcome {
  return {
    id,
    query: `query ${id}`,
    kind: 'discovery',
    top: verseIds.map((verseId, index) => ({
      rank: index + 1,
      targetId: `WEB:${verseId}`,
      reference: `Verse ${verseId}`,
      score: 1,
      families: ['token_overlap'],
    })),
  };
}

const JER_4_10 = { start: 24004010, end: 24004010 };
const JOHN_3_16 = { start: 43003016, end: 43003016 };

describe('batteryGate harmful hard-fail and context matrix', () => {
  const harmfulQuery = (provisional: boolean) =>
    batteryQuery({
      id: 'fn1',
      judged: [{ ref: 'John 3:16', grade: 3, provisional: false, range: JOHN_3_16 }],
      harmful: [{ ref: 'Jeremiah 4:10', why: 'sense-inverted comfort', provisional, range: JER_4_10 }],
    });

  it('harmful #1 with otherwise-PERFECT aggregates still REJECTs — nothing outvotes the hard-fail', () => {
    // A companion query whose metrics are perfect (nDCG@10 = 1) proves the
    // aggregates cannot buy the harmful #1 back.
    const metrics = computeRankMetrics([
      {
        id: 'fn2',
        category: 'felt-need',
        judged: [{ ref: 'John 3:16', grade: 3, provisional: false, range: JOHN_3_16 }],
        top10: [JOHN_3_16],
        top50: [JOHN_3_16],
      },
    ]);
    expect(metrics.overall.ndcg10.micro).toBe(1000000);

    const gate = batteryGate({
      validated: validatedBatteryOf([harmfulQuery(false)]),
      outcomes: [outcomeOf('fn1', [24004010, 43003016])],
      harmfulPresence: new Map(),
      context: { explicitTarget: true },
    });
    expect(gate.status).toBe('fail');
    expect(categories(gate)).toContain(g12cat('harmful-at-rank-1'));
    expect(decideVerdict({ gates: [gate], rankMetrics: metrics })).toBe('REJECT');
  });

  it('a provisional harmful judgment at #1 never gates — counted and reported instead', () => {
    const gate = batteryGate({
      validated: validatedBatteryOf([harmfulQuery(true)]),
      outcomes: [outcomeOf('fn1', [24004010, 43003016])],
      harmfulPresence: new Map(),
      context: { explicitTarget: true },
    });
    expect(gate.status).toBe('pass');
    expect(gate.metrics?.['provisionalHarmfulAtRank1']).toBe(1);
    expect(gate.summary).toMatch(/non-gating until ratified/);
  });

  it('a harmful guard that cannot fire is VACUOUS — warned by ref, never a silent pass', () => {
    const gate = batteryGate({
      validated: validatedBatteryOf([harmfulQuery(false)]),
      outcomes: [outcomeOf('fn1', [43003016])],
      harmfulPresence: new Map([[harmfulPresenceKey('fn1', 'Jeremiah 4:10'), false]]),
      context: { explicitTarget: true },
    });
    expect(gate.status).toBe('warn');
    expect(categories(gate)).toContain(g12cat('harmful-guard-vacuous'));
    expect(messages(gate)).toMatch(/Jeremiah 4:10.*VACUOUS/);
  });

  it('an unprobed guard cannot be certified either way — the gap is named, not swallowed', () => {
    const gate = batteryGate({
      validated: validatedBatteryOf([harmfulQuery(false)]),
      outcomes: [outcomeOf('fn1', [43003016])],
      harmfulPresence: null,
      context: { explicitTarget: true },
    });
    expect(gate.status).toBe('warn');
    expect(categories(gate)).toContain(g12cat('harmful-guard-vacuity-unprobed'));
  });

  it('context matrix: an unrun battery REJECTs an explicit-target run and stays visible advisory on fixture runs', () => {
    const unrun = (explicitTarget: boolean) =>
      batteryGate({
        validated: validatedBatteryOf([harmfulQuery(false)]),
        outcomes: null,
        harmfulPresence: null,
        context: { explicitTarget },
      });

    const onArtifact = unrun(true);
    expect(onArtifact.status).toBe('not-applicable');
    expect(onArtifact.applicability).toBe('required');
    expect(decideVerdict({ gates: [pass('G3-golden', 'Golden', 'ok'), onArtifact] })).toBe('REJECT');

    const onFixtures = unrun(false);
    expect(onFixtures.status).toBe('not-applicable');
    expect(onFixtures.applicability).toBe('optional-advisory');
    expect(decideVerdict({ gates: [pass('G3-golden', 'Golden', 'ok'), onFixtures] })).toBe('ADMIT');
  });

  it('anti-swallow proof: merging that same N/A beside a pass would go green — the roster keeps G12 separate', () => {
    const na = batteryGate({
      validated: validatedBatteryOf([harmfulQuery(false)]),
      outcomes: null,
      harmfulPresence: null,
      context: { explicitTarget: true },
    });
    const merged = mergeGateResults('hypothetical merge', [na, pass('G12-battery', 'Sibling', 'ok')]);
    expect(merged.status).toBe('pass'); // the swallow, demonstrated against the real N/A row
  });

  it('passing twin: guards hold, presence proven, judgments clean', () => {
    const gate = batteryGate({
      validated: validatedBatteryOf([harmfulQuery(false)]),
      outcomes: [outcomeOf('fn1', [43003016, 24004010])], // harmful present but NOT leading
      harmfulPresence: new Map(),
      context: { explicitTarget: true },
    });
    expect(gate.status).toBe('pass');
  });
});

// ---------------------------------------------------------------------------
// rankMetrics.ts — null-threshold honesty and NO_MEASURABLE_EFFECT anchors
// ---------------------------------------------------------------------------

const NULL_THRESHOLDS: RankQualityThresholds = {
  ndcg10: {
    overall: null,
    perCategory: Object.fromEntries(BATTERY_CATEGORIES.map((category) => [category, null])) as Record<
      BatteryCategory,
      number | null
    >,
  },
  mrr10: null,
  goodOrBetterTop3Rate: null,
  battery: { categoryFloors: UNIT_FLOORS },
};

describe('rank-quality threshold discipline', () => {
  const perfectMetrics = () =>
    computeRankMetrics([
      {
        id: 'fn1',
        category: 'felt-need',
        judged: [{ ref: 'John 3:16', grade: 3, provisional: false, range: JOHN_3_16 }],
        top10: [JOHN_3_16],
        top50: [JOHN_3_16],
      },
    ]);
  const poorMetrics = () =>
    computeRankMetrics([
      {
        id: 'fn1',
        category: 'felt-need',
        judged: [{ ref: 'John 3:16', grade: 3, provisional: false, range: JOHN_3_16 }],
        top10: [JER_4_10],
        top50: [JER_4_10],
      },
    ]);

  it('null-threshold honesty: measured and reported, never pass, never fail', () => {
    const outcome = evaluateRankQuality(NULL_THRESHOLDS, poorMetrics());
    expect(outcome.failures).toEqual([]);
    expect(outcome.evaluations.every((entry) => entry.outcome === 'no-threshold')).toBe(true);
    // The measured value still prints — null hides the verdict, not the number.
    expect(outcome.evaluations.find((entry) => entry.metric === 'ndcg10' && entry.scope === 'overall')
      ?.valueMicro).toBe(0);
  });

  it('a set threshold that is not met fails the G12 row', () => {
    const thresholds = { ...NULL_THRESHOLDS, goodOrBetterTop3Rate: 900000 };
    const outcome = evaluateRankQuality(thresholds, poorMetrics());
    expect(outcome.failures.length).toBe(1);
    expect(outcome.evaluations.find((entry) => entry.metric === 'goodOrBetterTop3Rate')?.outcome).toBe(
      'not-met',
    );
    const row = withRankEvidence(
      pass('G12-battery', 'Pastoral battery', 'ok', undefined, { explicitTarget: true }),
      poorMetrics(),
      [],
      outcome,
    );
    expect(row.status).toBe('fail');
  });

  it('a set threshold with nothing to measure fails — it must not pass', () => {
    const thresholds = { ...NULL_THRESHOLDS, mrr10: 500000 };
    const outcome = evaluateRankQuality(thresholds, computeRankMetrics([]));
    expect(outcome.evaluations.find((entry) => entry.metric === 'mrr10')?.outcome).toBe('unmeasurable');
    expect(outcome.failures.map((f) => f.categoryCode)).toContain(g12cat('rank-threshold-unmeasurable'));
  });

  it('a met threshold passes cleanly — the enforcement path is symmetric', () => {
    const thresholds = { ...NULL_THRESHOLDS, goodOrBetterTop3Rate: 900000 };
    const outcome = evaluateRankQuality(thresholds, perfectMetrics());
    expect(outcome.failures).toEqual([]);
    expect(outcome.evaluations.find((entry) => entry.metric === 'goodOrBetterTop3Rate')?.outcome).toBe('met');
  });

  it('a premature threshold rings and is never enforced before the approved baseline exists', () => {
    const block = {
      ndcg10: {
        overall: 900000,
        perCategory: Object.fromEntries(BATTERY_CATEGORIES.map((category) => [category, null])),
      },
      mrr10: null,
      goodOrBetterTop3Rate: null,
      battery: { categoryFloors: UNIT_FLOORS },
    };
    const { thresholds, findings } = validateRankQualityBlock(block, { rankBaselineEstablished: false });
    expect(findings.map((f) => f.categoryCode)).toContain(g12cat('rank-quality-premature-threshold'));
    expect(thresholds?.ndcg10.overall).toBeNull(); // coerced: the number cannot enforce
  });
});

describe('NO_MEASURABLE_EFFECT anchor matrix', () => {
  const run = { corpusFingerprint: HEX_A, layerFingerprint: HEX_B };
  const metrics = computeRankMetrics([]);
  const baseline = {
    schema: RANK_METRICS_BASELINE_SCHEMA,
    engineVersion: '1.0.0',
    corpusFingerprint: HEX_A,
    layerFingerprint: HEX_C, // the layer moved vs this anchor
    overall: metrics.overall,
    perCategory: metrics.perCategory,
  };
  const orderingApproval = {
    priorProvenance: {
      snapshotGitBlobSha1: '1'.repeat(40),
      probeListsSha256: HEX_D,
      engine: { engineVersion: '1.0.0', corpusFingerprint: HEX_A, layerFingerprint: HEX_C },
    },
  };
  const detect = (overrides: Partial<Parameters<typeof detectNoMeasurableEffect>[0]> = {}) =>
    detectNoMeasurableEffect({
      run,
      metrics,
      rankBaseline: baseline,
      orderingApproval,
      currentProbeListsSha256: HEX_D,
      probeBaseline: { corpusFingerprint: HEX_A, observationsSha256: HEX_E },
      currentObservationsSha256: HEX_E,
      expectNoEffect: null,
      ...overrides,
    });

  it('fires only when the layer moved and NO anchored comparison did', () => {
    const { detection } = detect();
    expect(detection.evaluated).toBe(true);
    expect(detection.layerMoved).toBe(true);
    expect(detection.fired).toBe(true);
    expect(decideVerdict({ gates: [pass('G3-golden', 'Golden', 'ok')], noMeasurableEffect: detection })).toBe(
      'NO_MEASURABLE_EFFECT',
    );
  });

  it('a missing anchor is skipped-with-finding — never silently evaluated, never fired', () => {
    const { detection, findings } = detect({ rankBaseline: null });
    expect(detection.evaluated).toBe(false);
    expect(detection.fired).toBe(false);
    expect(findings.map((f) => f.categoryCode)).toContain(g12cat('no-effect-skipped'));
    expect(findings.map((f) => f.message).join('\n')).toMatch(/anchor missing/);
  });

  it('a moved corpusFingerprint confounds the comparison and skips it by name', () => {
    const { detection, findings } = detect({
      probeBaseline: { corpusFingerprint: HEX_F, observationsSha256: HEX_E },
    });
    expect(detection.fired).toBe(false);
    expect(findings.map((f) => f.message).join('\n')).toMatch(/corpusFingerprint moved/);
  });

  it('does not fire when an anchored comparison actually moved, or when the layer never moved', () => {
    expect(detect({ currentObservationsSha256: HEX_F }).detection.fired).toBe(false);
    expect(
      detect({ rankBaseline: { ...baseline, layerFingerprint: HEX_B } }).detection.fired,
    ).toBe(false);
  });
});

describe('rank-metrics baseline document tampers', () => {
  const metrics = computeRankMetrics([]);
  const baseline = {
    schema: RANK_METRICS_BASELINE_SCHEMA,
    engineVersion: '1.0.0',
    corpusFingerprint: HEX_A,
    layerFingerprint: HEX_B,
    overall: metrics.overall,
    perCategory: metrics.perCategory,
  };
  const approval = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    schema: RANK_METRICS_APPROVAL_SCHEMA_V2,
    baselineSha256: canonicalJsonSha256(baseline),
    batteryQueriesSha256: HEX_D,
    batteryJudgmentsSha256: HEX_E,
    engine: { engineVersion: '1.0.0', corpusFingerprint: HEX_A, layerFingerprint: HEX_B },
    reviewerName: 'Synthetic Reviewer',
    reviewerContact: 'reviewer@example.test',
    independence: 'did not author the baseline under review',
    evidence: { path: 'docs/reviews/synthetic-rank.md', sha256: HEX_C },
    reviewPacketSha256: HEX_F,
    reviewedAt: '2026-08-21',
    rationale: 'synthetic record for the mutation harness',
    priorProvenance: null,
    bootstrap: 'first rank baseline in this synthetic history',
    ...overrides,
  });
  const validate = (input: { baseline: unknown; approval: unknown }, evidenceSha256: string | null = HEX_C) =>
    validateRankMetricsBaselineDocuments({
      ...input,
      batteryQueriesSha256: HEX_D,
      batteryJudgmentsSha256: HEX_E,
      evidenceSha256,
    }).map((finding) => finding.categoryCode);

  it('absent/absent is the honest pre-protocol state and rings nothing', () => {
    expect(validate({ baseline: null, approval: null })).toEqual([]);
  });

  it('twin: a bound baseline + approval pair validates clean', () => {
    expect(validate({ baseline, approval: approval() })).toEqual([]);
  });

  it('rings on an orphaned approval and an unapproved baseline', () => {
    expect(validate({ baseline: null, approval: approval() })).toContain(
      g12cat('rank-baseline-approval-orphaned'),
    );
    expect(validate({ baseline, approval: null })).toContain(g12cat('rank-baseline-approval-missing'));
  });

  it('rings on digest and identity tampers', () => {
    expect(validate({ baseline, approval: approval({ baselineSha256: HEX_F }) })).toContain(
      g12cat('rank-baseline-approval-baseline-mismatch'),
    );
    expect(validate({ baseline, approval: approval({ batteryJudgmentsSha256: HEX_F }) })).toContain(
      g12cat('rank-baseline-approval-battery-mismatch'),
    );
    expect(
      validate({
        baseline,
        approval: approval({
          engine: { engineVersion: '9.9.9', corpusFingerprint: HEX_A, layerFingerprint: HEX_B },
        }),
      }),
    ).toContain(g12cat('rank-baseline-approval-engine-mismatch'));
    expect(validate({ baseline, approval: approval() }, null)).toContain(
      g12cat('rank-baseline-approval-evidence-mismatch'),
    );
  });
});

// ---------------------------------------------------------------------------
// rankMetrics.ts — the CI battery checker is fail-closed
// ---------------------------------------------------------------------------

describe('checkBatteryJobReport fail-closed matrix', () => {
  const g12Row = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    gate: 'G12-battery',
    status: 'pass',
    applicability: 'required',
    summary: 'battery ran',
    ...overrides,
  });
  const report = (gates: Record<string, unknown>[], battery: unknown = {}): unknown => ({
    payload: { verdict: 'ADMIT', gates, battery },
  });

  it('a missing or unparsable report is red — early abort must never look green', () => {
    const check = checkBatteryJobReport(undefined);
    expect(check.ok).toBe(false);
    expect(check.problems.join('\n')).toMatch(/job-red, never job-green/);
  });

  it('a G12 row that did not run, ran and failed, or is absent entirely is red', () => {
    expect(checkBatteryJobReport(report([g12Row({ status: 'not-applicable' })])).ok).toBe(false);
    expect(checkBatteryJobReport(report([g12Row({ status: 'fail' })])).ok).toBe(false);
    expect(checkBatteryJobReport(report([{ gate: 'G3-golden', status: 'pass', summary: 'ok' }])).ok).toBe(
      false,
    );
  });

  it('an advisory-applicability battery on an artifact run is red — required or nothing', () => {
    expect(checkBatteryJobReport(report([g12Row({ applicability: 'optional-advisory' })])).ok).toBe(false);
  });

  it('a missing battery evidence section is red', () => {
    const parsed = { payload: { verdict: 'ADMIT', gates: [g12Row()] } };
    expect(checkBatteryJobReport(parsed).ok).toBe(false);
  });

  it('warn (vacuity honesty) is tolerated but printed where nobody can miss it', () => {
    const check = checkBatteryJobReport(report([g12Row({ status: 'warn', summary: 'vacuous guards' })]));
    expect(check.ok).toBe(true);
    expect(check.advisory.join('\n')).toMatch(/G12-battery warn \(tolerated, non-blocking\)/);
  });

  it('green twin: pass + required + evidence section', () => {
    expect(checkBatteryJobReport(report([g12Row()])).ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// budgetsProperty.ts — G6 rings against weakened in-test engine copies
// ---------------------------------------------------------------------------

describe('budgetsPropertyGate mutations', () => {
  it('rings when a weakened applyBudgets stops enforcing the caps', () => {
    const uncapped: BudgetsPropertySubjects['applyBudgets'] = (evidence) =>
      ({
        score: evidence.length * 100,
        capped: false,
        reasons: evidence.map((entry) => ({ family: entry.family, label: entry.label, points: 100 })),
      } as unknown as BudgetedScore);
    const result = budgetsPropertyGate({ applyBudgets: uncapped });
    expect(result.status).toBe('fail');
    const falsified = (result.findings ?? []).flatMap((finding) => finding.subjects ?? []);
    expect(falsified).toContain('weak-aggregate-cap');
    expect(falsified).toContain('per-family-point-cap');
  });

  it('rings when rank becomes sensitive to candidate input order', () => {
    const orderSensitive: BudgetsPropertySubjects['rank'] = (candidates: readonly Candidate[]) =>
      candidates.map((candidate, index) => ({
        targetId: candidate.targetId,
        groupId: candidate.groupId,
        score: candidates.length - index,
        reasons: [],
      })) as unknown as readonly RankedResult[];
    const result = budgetsPropertyGate({ rank: orderSensitive });
    expect(result.status).toBe('fail');
    expect((result.findings ?? []).flatMap((finding) => finding.subjects ?? [])).toContain(
      'rank-permutation-invariance',
    );
  });

  it('rings when the tokenizer leaks stopwords and raw text', () => {
    const leaky: BudgetsPropertySubjects['significantWords'] = (text) =>
      text.split(/\s+/).filter((word) => word.length > 0);
    const result = budgetsPropertyGate({ significantWords: leaky });
    expect(result.status).toBe('fail');
    expect((result.findings ?? []).flatMap((finding) => finding.subjects ?? [])).toContain(
      'tokenizer-output-hygiene',
    );
  });

  it('rings when the evidence hierarchy inverts — weak aggregate no longer below one exact phrase', () => {
    const inverted = {
      ...DEFAULT_BUDGETS,
      weakAggregateCap: DEFAULT_BUDGETS.families.exact_phrase.maxPoints,
    };
    const result = budgetsPropertyGate({ budgets: inverted });
    expect(result.status).toBe('fail');
    expect(categories(result)).toContain('hierarchy-inverted');
  });

  it('passing twin states the committed seed and run count — a hidden run count is half-decorative', () => {
    const result = budgetsPropertyGate();
    expect(result.status).toBe('pass');
    expect(result.summary).toContain(`seed ${G6_PROPERTY_SEED}`);
    expect(result.summary).toContain(`${G6_PROPERTY_NUM_RUNS} runs`);
    expect(result.metrics?.['propertySeed']).toBe(G6_PROPERTY_SEED);
  });

  it('the reviewed-constants half reports not-applicable WITH its reason, never a fake pass', () => {
    const result = reviewedConstantsCheck();
    expect(result.status).toBe('not-applicable');
    expect(result.summary).toMatch(/reviewed-constants mirror not yet in budgets\.json/);
  });
});

// ---------------------------------------------------------------------------
// tierReport.ts — NOT EVALUABLE never satisfies
// ---------------------------------------------------------------------------

describe('tier attainment mutations', () => {
  const s = (status: 'MET' | 'NOT_MET' | 'NOT_EVALUABLE' | 'DISABLED') => ({ status });

  it('NOT_EVALUABLE and NOT_MET each block attainment; DISABLED alone never attains', () => {
    expect(tierAttained([s('MET'), s('MET'), s('NOT_EVALUABLE')])).toBe(false);
    expect(tierAttained([s('MET'), s('NOT_MET')])).toBe(false);
    expect(tierAttained([s('DISABLED'), s('DISABLED')])).toBe(false);
    expect(tierAttained([])).toBe(false);
    expect(tierAttained([s('MET'), s('DISABLED')])).toBe(true);
    expect(tierAttained([s('MET'), s('MET')])).toBe(true);
  });

  const tiersConfig: TiersConfig = {
    aTierGoodOrBetterTop3RateMicro: 900000,
    sTierGoodOrBetterTop3RateMicro: 980000,
    referenceGrammar: [],
    correctives: { enabled: null, decidedAt: null },
    batteryGrowthWaiver: null,
  };

  function tierInput(overrides: Partial<TierComputationInput> = {}): TierComputationInput {
    return {
      tiersConfig,
      flagship: [],
      battery: validatedBatteryOf([
        batteryQuery({
          id: 'fn1',
          judged: [{ ref: 'John 3:16', grade: 3, provisional: false, range: JOHN_3_16 }],
          harmful: [{ ref: 'Jeremiah 4:10', why: 'sense-inverted', provisional: false, range: JER_4_10 }],
        }),
      ]),
      thresholds: NULL_THRESHOLDS,
      fixtures: [],
      evidence: {
        batteryResults: [outcomeOf('fn1', [43003016, 24004010])],
        gates: [
          { gate: 'G2-determinism', status: 'pass', findings: [] },
          { gate: 'G3-golden', status: 'pass', findings: [] },
          {
            gate: 'G12-battery',
            status: 'pass',
            metrics: { vacuousHarmfulGuards: 0, unprobedHarmfulGuards: 0 },
            findings: [],
          },
        ],
        rankMetrics: null,
      },
      ...overrides,
    };
  }

  function a1Of(input: TierComputationInput) {
    const section = computeTierReport(input);
    const a1 = section.tiers.flatMap((tier) => tier.criteria).find((row) => row.id === 'A1');
    if (!a1) throw new Error('A1 missing from tier report');
    const aTier = section.tiers.find((tier) => tier.tier === 'A')!;
    return { a1, aTier };
  }

  it('an unexecuted battery makes A1 NOT EVALUABLE — and NOT EVALUABLE blocks the tier', () => {
    const { a1, aTier } = a1Of(
      tierInput({ evidence: { batteryResults: null, gates: null, rankMetrics: null } }),
    );
    expect(a1.status).toBe('NOT_EVALUABLE');
    expect(a1.detail).toMatch(/no artifact run evidence/);
    expect(aTier.attained).toBe(false);
  });

  it('a harmful #1 makes A1 NOT MET with the placement named', () => {
    const { a1, aTier } = a1Of(
      tierInput({
        evidence: {
          batteryResults: [outcomeOf('fn1', [24004010, 43003016])],
          gates: [
            { gate: 'G2-determinism', status: 'pass', findings: [] },
            { gate: 'G3-golden', status: 'pass', findings: [] },
            {
              gate: 'G12-battery',
              status: 'fail',
              metrics: { vacuousHarmfulGuards: 0, unprobedHarmfulGuards: 0 },
              findings: [],
            },
          ],
          rankMetrics: null,
        },
      }),
    );
    expect(a1.status).toBe('NOT_MET');
    expect(a1.detail).toMatch(/Jeremiah 4:10 at #1/);
    expect(aTier.attained).toBe(false);
  });

  it('unprobed guard vacuity makes A1 NOT EVALUABLE — a guard that may be unable to fire cannot certify', () => {
    const { a1 } = a1Of(
      tierInput({
        evidence: {
          batteryResults: [outcomeOf('fn1', [43003016])],
          gates: [
            { gate: 'G2-determinism', status: 'pass', findings: [] },
            { gate: 'G3-golden', status: 'pass', findings: [] },
            {
              gate: 'G12-battery',
              status: 'warn',
              metrics: { vacuousHarmfulGuards: 0, unprobedHarmfulGuards: 1 },
              findings: [],
            },
          ],
          rankMetrics: null,
        },
      }),
    );
    expect(a1.status).toBe('NOT_EVALUABLE');
    expect(a1.detail).toMatch(/not probed for corpus presence/);
  });
});
