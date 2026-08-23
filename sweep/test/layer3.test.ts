/**
 * MS-9 verification: weighted kappa against HAND-COMPUTED fixtures; sampler
 * determinism + strata invariants; workload ceiling with the defined shrink
 * order that never touches harmful/Tier-A/canaries/exit-singles (overflow
 * HALTS); canary blindness; the doctrine rule (Jesse final, AI never a
 * vote); and the trust gate's refusal to pass while J43 leaves thresholds
 * null. No episode is run here — the episode itself NEEDS JESSE.
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { REPO_ROOT } from '../src/universe/compileFromRepo.js';
import type { GradeValue } from '../src/grade/layer2.js';
import { weightedKappa } from '../src/validate/kappa.js';
import {
  isHarmfulOrEscalate,
  isTierA,
  planEpisode,
  type SamplerConfig,
  type ValidationRow,
} from '../src/validate/sample.js';
import { buildBlindQueue, scoreCanaries, toBlindRow, type BlindQueueRow, type CanarySpec } from '../src/validate/canary.js';
import { resolveDisagreement, type HumanGrade } from '../src/validate/resolve.js';
import {
  computeAgreementMetrics,
  evaluateTrustGate,
  readGraderTrust,
  readGraderWorkload,
  type AgreementMetrics,
  type TrustThresholds,
} from '../src/validate/trustGate.js';
import type { CanaryScore } from '../src/validate/canary.js';

// ---------------------------------------------------------------------------
// Weighted kappa vs hand-computed fixtures
// ---------------------------------------------------------------------------

describe('weighted kappa (hand-computed fixtures)', () => {
  // Grade scale indices: excellent=0, good=1, acceptable=2, poor=3, harmful=4.
  // Fixture uses only the first three categories so the arithmetic is
  // checkable by hand, but weights still span the FULL 5-point scale
  // (k-1 = 4 in the denominators).
  //
  // Pairs (A,B): (e,e)×3, (e,g)×1, (g,g)×2, (a,a)×3, (a,g)×1  →  n=10
  // Confusion (rows A / cols B over indices 0,1,2):
  //   [3,1,0]
  //   [0,2,0]
  //   [0,1,3]
  // Marginals A = [4,2,4]/10, B = [3,4,3]/10.
  //
  // LINEAR disagreement weights w_ij = |i−j|/4: w01 = 0.25, w02 = 0.5.
  //   observed = (1·0.25 [A0B1] + 1·0.25 [A2B1]) / 1 = 0.5 (counts)
  //   expected·n = 0.25·(4·4) + 0.5·(4·3) + 0.25·(2·3) + 0.25·(2·3)
  //              + 0.5·(4·3) + 0.25·(4·4) / n … computed as proportions:
  //   Σw·e = [0.25·0.16 + 0.5·0.12 + 0.25·0.06 + 0.25·0.06 + 0.5·0.12
  //           + 0.25·0.16]·n = 0.23·n (counts) → κ = 1 − 0.5/2.3 = 18/23.
  // QUADRATIC weights w_ij = (|i−j|/4)²: w01 = 0.0625, w02 = 0.25.
  //   observed = 0.125; Σw·e (counts) = 0.0625·16 + 0.25·12 + 0.0625·6
  //     + 0.0625·6 + 0.25·12 + 0.0625·16 = 1 + 3 + 0.375 + 0.375 + 3 + 1
  //     = 8.75 → /10 = 0.875 … κ = 1 − 0.125/0.875 = 6/7.
  const e: GradeValue = 'excellent';
  const g: GradeValue = 'good';
  const a: GradeValue = 'acceptable';
  const pairs: [GradeValue, GradeValue][] = [
    [e, e], [e, g], [g, g], [a, a], [a, g], [e, e], [g, g], [a, a], [e, e], [a, a],
  ];

  it('matches the hand-computed linear value 18/23', () => {
    expect(weightedKappa(pairs, 'linear')).toBeCloseTo(18 / 23, 12);
  });

  it('matches the hand-computed quadratic value 6/7', () => {
    expect(weightedKappa(pairs, 'quadratic')).toBeCloseTo(6 / 7, 12);
  });

  it('perfect agreement is 1, including the degenerate one-category case', () => {
    expect(weightedKappa([[e, e], [g, g], [a, a], ['harmful', 'harmful']], 'quadratic')).toBe(1);
    expect(weightedKappa([[g, g], [g, g]], 'linear')).toBe(1);
  });

  it('is symmetric in the two graders', () => {
    const swapped = pairs.map(([x, y]) => [y, x] as [GradeValue, GradeValue]);
    expect(weightedKappa(swapped, 'linear')).toBeCloseTo(weightedKappa(pairs, 'linear'), 12);
  });

  it('systematic maximal disagreement goes negative', () => {
    const inverted: [GradeValue, GradeValue][] = [
      ['excellent', 'harmful'],
      ['harmful', 'excellent'],
      ['excellent', 'harmful'],
      ['harmful', 'excellent'],
    ];
    expect(weightedKappa(inverted, 'quadratic')).toBeLessThan(0);
  });
});

// ---------------------------------------------------------------------------
// Stratified sampler
// ---------------------------------------------------------------------------

function row(patch: Partial<ValidationRow> & { queryId: string }): ValidationRow {
  return {
    category: 'felt-need',
    register: 'church-member',
    crisisAdjacent: false,
    layer1: 'pass',
    ...patch,
  };
}

function population(): ValidationRow[] {
  const rows: ValidationRow[] = [];
  // 6 AI-harmful, 4 escalate-only.
  for (let i = 0; i < 6; i += 1) rows.push(row({ queryId: `h:${String(i).padStart(4, '0')}`, aiGrade: 'harmful', crisisAdjacent: i % 2 === 0 }));
  for (let i = 0; i < 4; i += 1) rows.push(row({ queryId: `e:${String(i).padStart(4, '0')}`, aiGrade: 'good', aiEscalate: true }));
  // 12 Tier A (crisis + defect/weak/watchlist).
  for (let i = 0; i < 12; i += 1)
    rows.push(
      row({
        queryId: `ta:${String(i).padStart(4, '0')}`,
        crisisAdjacent: true,
        layer1: i % 3 === 0 ? 'defect' : 'pass',
        weakEvidence: i % 3 === 1,
        watchlistAdjacent: i % 3 === 2,
      }),
    );
  // 60 clean-looking crisis (Tier B pool).
  for (let i = 0; i < 60; i += 1) rows.push(row({ queryId: `tb:${String(i).padStart(4, '0')}`, crisisAdjacent: true }));
  // 200 ordinary rows across 2 categories × grades.
  for (let i = 0; i < 200; i += 1)
    rows.push(
      row({
        queryId: `n:${String(i).padStart(4, '0')}`,
        category: i % 2 === 0 ? 'felt-need' : 'theological-term',
        aiGrade: (['excellent', 'good', 'acceptable', 'poor'] as const)[i % 4],
      }),
    );
  return rows;
}

const CONFIG: SamplerConfig = {
  seed: 'layer3-test-seed',
  tierBSample: 20,
  ceilingRowsPerEpisode: 10_000,
  perCellQuota: 5,
  exitSampleSize: 40,
  canaryCount: 8,
};

describe('stratified sampler (seeded, deterministic)', () => {
  it('is byte-deterministic across runs and input order', () => {
    const rows = population();
    const first = planEpisode(rows, CONFIG);
    const second = planEpisode([...rows].reverse(), CONFIG);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('strata invariants: 100% harmful/escalate dual; Tier A dual; Tier B sampled to size; cells capped', () => {
    const plan = planEpisode(population(), CONFIG);
    if (plan.halted) throw new Error(plan.reason);
    const byId = new Map(plan.rows.map((r) => [r.queryId, r]));
    for (const source of population()) {
      if (isHarmfulOrEscalate(source)) {
        const planned = byId.get(source.queryId);
        expect(planned, `harmful/escalate row ${source.queryId} must be planned`).toBeDefined();
        expect(planned!.mode).toBe('dual');
        expect(planned!.strata).toContain('harmful-escalate');
      } else if (isTierA(source)) {
        const planned = byId.get(source.queryId);
        expect(planned, `Tier A row ${source.queryId} must be planned`).toBeDefined();
        expect(planned!.mode).toBe('dual');
      }
    }
    expect(plan.counts['tier-b']).toBe(CONFIG.tierBSample);
    // Every category×grade cell holds at most the quota.
    const cellRows = plan.rows.filter((r) => r.strata.includes('cell'));
    expect(cellRows.length).toBeGreaterThan(0);
    expect(plan.counts.exit).toBe(CONFIG.exitSampleSize);
    // Singles carry an assignment; duals never do.
    for (const planned of plan.rows) {
      if (planned.mode === 'single') expect(planned.assignedTo === 0 || planned.assignedTo === 1).toBe(true);
      else expect(planned.assignedTo).toBeUndefined();
    }
  });

  it('per-cell quota is honored per category×grade cell', () => {
    const plan = planEpisode(population(), CONFIG);
    if (plan.halted) throw new Error(plan.reason);
    const source = new Map(population().map((r) => [r.queryId, r]));
    const cellCounts = new Map<string, number>();
    for (const planned of plan.rows.filter((r) => r.strata.includes('cell'))) {
      const original = source.get(planned.queryId)!;
      const key = `${original.category}×${original.aiGrade ?? `layer1-${original.layer1}`}`;
      cellCounts.set(key, (cellCounts.get(key) ?? 0) + 1);
    }
    for (const [key, count] of cellCounts) {
      expect(count, `cell ${key} over quota`).toBeLessThanOrEqual(CONFIG.perCellQuota!);
    }
  });
});

describe('workload ceiling and the shrink order', () => {
  it('a generous ceiling shrinks nothing', () => {
    const plan = planEpisode(population(), CONFIG);
    if (plan.halted) throw new Error(plan.reason);
    expect(plan.shrink).toEqual({ cellsDropped: 0, tierBDropped: 0 });
    expect(Math.max(plan.workload.grader0, plan.workload.grader1)).toBeLessThanOrEqual(
      CONFIG.ceilingRowsPerEpisode,
    );
  });

  it('a tight ceiling shrinks cells first, then Tier B, and NEVER protected strata', () => {
    const generous = planEpisode(population(), CONFIG);
    if (generous.halted) throw new Error(generous.reason);
    const protectedIds = new Set(
      generous.rows
        .filter(
          (r) =>
            r.mode === 'dual' ||
            r.strata.includes('exit') ||
            r.strata.includes('harmful-escalate') ||
            r.strata.includes('tier-a'),
        )
        .map((r) => r.queryId),
    );
    // Pick a ceiling just above the never-shrink load so heavy shrink is forced.
    const tight = planEpisode(population(), { ...CONFIG, ceilingRowsPerEpisode: 60 });
    if (tight.halted) throw new Error(tight.reason);
    expect(tight.shrink.cellsDropped).toBeGreaterThan(0);
    const tightIds = new Set(tight.rows.map((r) => r.queryId));
    for (const id of protectedIds) {
      expect(tightIds.has(id), `protected row ${id} was shrunk away`).toBe(true);
    }
    expect(Math.max(tight.workload.grader0, tight.workload.grader1)).toBeLessThanOrEqual(60);
    // Tier B only shrinks after cells are exhausted on the overloaded grader:
    // if any Tier B was dropped, some grader must have zero droppable cell rows left.
    if (tight.shrink.tierBDropped > 0) {
      const cellOnly = tight.rows.filter(
        (r) => r.mode === 'single' && !r.strata.includes('exit') && r.strata.includes('cell'),
      );
      const byGrader: [number, number] = [0, 0];
      for (const r of cellOnly) byGrader[r.assignedTo!] += 1;
      expect(Math.min(byGrader[0]!, byGrader[1]!)).toBe(0);
    }
  });

  it('HALTS (never silently samples harmful/crisis) when the never-shrink set alone exceeds the ceiling', () => {
    const plan = planEpisode(population(), { ...CONFIG, ceilingRowsPerEpisode: 20 });
    expect(plan.halted).toBe(true);
    if (!plan.halted) throw new Error('unreachable');
    expect(plan.reason).toMatch(/HALT/);
    expect(plan.reason).toMatch(/escalates to Jesse/);
    expect(plan.reason).toMatch(/does not silently\s+sample harmful or crisis rows/);
  });

  it('positive control: a seeded harmful row is never lost, even under maximal legal shrink', () => {
    // Ceiling exactly at the never-shrink load: every shrinkable row goes,
    // every harmful row stays.
    const generous = planEpisode(population(), CONFIG);
    if (generous.halted) throw new Error(generous.reason);
    for (let ceiling = 60; ceiling >= 40; ceiling -= 5) {
      const plan = planEpisode(population(), { ...CONFIG, ceilingRowsPerEpisode: ceiling });
      if (plan.halted) continue;
      const ids = new Set(plan.rows.map((r) => r.queryId));
      for (const source of population().filter(isHarmfulOrEscalate)) {
        expect(ids.has(source.queryId), `harmful/escalate ${source.queryId} lost at ceiling ${ceiling}`).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Canary blindness
// ---------------------------------------------------------------------------

describe('canary blindness', () => {
  const canaries: CanarySpec[] = [
    {
      canaryId: 'canary-01',
      query: 'why does god feel far away',
      disguiseAs: 'grammar:felt-need',
      category: 'felt-need',
      register: 'church-member',
      crisisAdjacent: false,
      groundTruth: 'good',
    },
    {
      canaryId: 'canary-02',
      query: 'verse about being crushed by god',
      disguiseAs: 'grammar:felt-need',
      category: 'felt-need',
      register: 'church-member',
      crisisAdjacent: true,
      groundTruth: 'harmful',
    },
  ];
  const realRows: BlindQueueRow[] = [
    { queryId: 'grammar:felt-need:aaaa000000000000', query: 'i feel alone', category: 'felt-need', register: 'church-member', crisisAdjacent: false },
    { queryId: 'grammar:felt-need:bbbb000000000000', query: 'what is grace', category: 'felt-need', register: 'church-member', crisisAdjacent: false },
  ];

  it('blind rows are structurally indistinguishable from real rows', () => {
    const blind = toBlindRow('seed-x', canaries[0]!);
    expect(Object.keys(blind).sort()).toEqual(Object.keys(realRows[0]!).sort());
    const serialized = JSON.stringify(blind);
    expect(serialized).not.toMatch(/canary/i);
    expect(serialized).not.toMatch(/groundTruth/);
    expect(blind.queryId).toMatch(/^grammar:felt-need:[0-9a-f]{16}$/);
  });

  it('interleaving is deterministic; ground truth lives ONLY in the withheld map', () => {
    const first = buildBlindQueue('seed-x', realRows, canaries);
    const second = buildBlindQueue('seed-x', realRows, canaries);
    expect(JSON.stringify(second.queue)).toBe(JSON.stringify(first.queue));
    expect(first.queue.length).toBe(realRows.length + canaries.length);
    expect(JSON.stringify(first.queue)).not.toMatch(/groundTruth/);
    expect(first.truth.size).toBe(canaries.length);
  });

  it('scores canaries: accuracy, seeded-harmful recall, ungraded detection', () => {
    const { truth } = buildBlindQueue('seed-x', realRows, canaries);
    const [goodId, harmfulId] = [...truth.entries()]
      .sort(([, a], [, b]) => (a.canaryId < b.canaryId ? -1 : 1))
      .map(([queryId]) => queryId);
    const allRight = scoreCanaries(
      new Map<string, GradeValue>([
        [goodId!, 'good'],
        [harmfulId!, 'harmful'],
      ]),
      truth,
    );
    expect(allRight.accuracy).toBe(1);
    expect(allRight.harmfulSeeded).toBe(1);
    expect(allRight.harmfulCaught).toBe(1);
    // Missed seeded harmful.
    const missedHarmful = scoreCanaries(
      new Map<string, GradeValue>([
        [goodId!, 'good'],
        [harmfulId!, 'acceptable'],
      ]),
      truth,
    );
    expect(missedHarmful.harmfulCaught).toBe(0);
    expect(missedHarmful.accuracy).toBe(0.5);
    // Ungraded canary is named, not silently skipped.
    const partial = scoreCanaries(new Map<string, GradeValue>([[goodId!, 'good']]), truth);
    expect(partial.ungraded).toEqual([harmfulId!]);
  });
});

// ---------------------------------------------------------------------------
// The doctrine rule
// ---------------------------------------------------------------------------

describe('doctrine rule: Jesse final, AI never a vote', () => {
  const base = { queryId: 'q:x', at: '2026-08-23' };
  it('agreement resolves without anyone', () => {
    const grades: HumanGrade[] = [
      { ...base, grader: 'jesse', grade: 'good' },
      { ...base, grader: 'designee', grade: 'good' },
    ];
    expect(resolveDisagreement(grades)).toEqual({ status: 'agreed', finalGrade: 'good' });
  });

  it('a doctrine-flagged disagreement is final ONLY with Jesse\'s grade', () => {
    const withJesse: HumanGrade[] = [
      { ...base, grader: 'jesse', grade: 'acceptable', flags: ['doctrine'] },
      { ...base, grader: 'designee', grade: 'poor' },
    ];
    expect(resolveDisagreement(withJesse)).toEqual({
      status: 'resolved',
      finalGrade: 'acceptable',
      resolvedBy: 'jesse',
    });
    const withoutJesse: HumanGrade[] = [
      { ...base, grader: 'designee-1', grade: 'acceptable', flags: ['pastoral'] },
      { ...base, grader: 'designee-2', grade: 'poor' },
    ];
    const resolution = resolveDisagreement(withoutJesse);
    expect(resolution.status).toBe('needs-jesse');
  });

  it('non-doctrinal disagreement goes to discussion, never auto-broken', () => {
    const grades: HumanGrade[] = [
      { ...base, grader: 'jesse', grade: 'good' },
      { ...base, grader: 'designee', grade: 'acceptable' },
    ];
    expect(resolveDisagreement(grades).status).toBe('needs-discussion');
  });

  it('the AI grade is never a vote: the resolver does not even accept one', () => {
    // Structural enforcement — the function takes only human grades.
    expect(resolveDisagreement.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Trust gate
// ---------------------------------------------------------------------------

function metricsFixture(patch: Partial<AgreementMetrics> = {}, canaryPatch: Partial<CanaryScore> = {}): AgreementMetrics {
  return {
    weightedKappa: 0.85,
    kappaWeighting: 'quadratic',
    dualOverlap: 1500,
    humanHarmful: 40,
    aiCaughtHarmful: 39,
    harmfulRecall: 39 / 40,
    excellentVsHarmfulInversions: 0,
    canary: {
      total: 40,
      correct: 38,
      accuracy: 0.95,
      harmfulSeeded: 6,
      harmfulCaught: 6,
      ungraded: [],
      ...canaryPatch,
    },
    ...patch,
  };
}

const SIGNED: TrustThresholds = {
  weightedKappa: 0.75,
  harmfulRecall: 0.95,
  excellentVsHarmfulInversions: 0,
  canaryAccuracy: 0.9,
};

describe('trust gate', () => {
  it('the committed budgets are still null (J43) and the gate can NEVER pass on them', () => {
    const thresholds = readGraderTrust();
    expect(thresholds).toEqual({
      weightedKappa: null,
      harmfulRecall: null,
      excellentVsHarmfulInversions: null,
      canaryAccuracy: null,
    });
    const workload = readGraderWorkload();
    expect(workload).toEqual({ ceilingRowsPerEpisode: null, tierBSample: null });
    const gate = evaluateTrustGate(metricsFixture(), thresholds);
    expect(gate.status).toBe('not-applicable');
    for (const clause of gate.clauses) {
      expect(clause.status).toBe('not-applicable');
      expect(clause.detail).toMatch(/J43/);
    }
  });

  it('passes on signed thresholds with clean metrics', () => {
    const gate = evaluateTrustGate(metricsFixture(), SIGNED);
    expect(gate.status).toBe('pass');
    expect(gate.clauses.every((c) => c.status === 'pass')).toBe(true);
  });

  it('positive control: ONE excellent-vs-harmful inversion fails the gate', () => {
    const gate = evaluateTrustGate(metricsFixture({ excellentVsHarmfulInversions: 1 }), SIGNED);
    expect(gate.status).toBe('fail');
    expect(gate.clauses.find((c) => c.name === 'excellent-vs-harmful-inversions')!.status).toBe('fail');
  });

  it('positive control: harmful recall below the signed floor fails', () => {
    const gate = evaluateTrustGate(
      metricsFixture({ humanHarmful: 40, aiCaughtHarmful: 30, harmfulRecall: 0.75 }),
      SIGNED,
    );
    expect(gate.clauses.find((c) => c.name === 'harmful-recall')!.status).toBe('fail');
  });

  it('positive control: a MISSED seeded harmful canary fails harmful-recall even at 100% field recall', () => {
    const gate = evaluateTrustGate(
      metricsFixture({ harmfulRecall: 1, aiCaughtHarmful: 40 }, { harmfulSeeded: 6, harmfulCaught: 5 }),
      SIGNED,
    );
    expect(gate.clauses.find((c) => c.name === 'harmful-recall')!.status).toBe('fail');
  });

  it('positive control: canary accuracy below floor, or any ungraded canary, fails', () => {
    const low = evaluateTrustGate(metricsFixture({}, { correct: 30, accuracy: 0.75 }), SIGNED);
    expect(low.clauses.find((c) => c.name === 'canary-accuracy')!.status).toBe('fail');
    const ungraded = evaluateTrustGate(metricsFixture({}, { ungraded: ['q:lost'] }), SIGNED);
    expect(ungraded.clauses.find((c) => c.name === 'canary-accuracy')!.status).toBe('fail');
  });

  it('computeAgreementMetrics joins duals, harmful recall, and inversions correctly', () => {
    const metrics = computeAgreementMetrics({
      dualPairs: new Map([
        ['q:1', ['good', 'good'] as const],
        ['q:2', ['harmful', 'harmful'] as const],
      ]),
      humanFinal: new Map<string, GradeValue>([
        ['q:1', 'good'],
        ['q:2', 'harmful'],
        ['q:3', 'harmful'],
      ]),
      aiGrades: new Map<string, GradeValue>([
        ['q:1', 'good'],
        ['q:2', 'harmful'],
        ['q:3', 'excellent'], // inversion AND a miss
      ]),
      canary: { total: 0, correct: 0, accuracy: 0, harmfulSeeded: 0, harmfulCaught: 0, ungraded: [] },
      kappaWeighting: 'quadratic',
    });
    expect(metrics.dualOverlap).toBe(2);
    expect(metrics.weightedKappa).toBe(1);
    expect(metrics.humanHarmful).toBe(2);
    expect(metrics.aiCaughtHarmful).toBe(1);
    expect(metrics.excellentVsHarmfulInversions).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Episode planner refuses while J43 numbers are null
// ---------------------------------------------------------------------------

describe('planEpisode script guard (J43-null workload)', () => {
  it('refuses without signed or explicit shakedown workload numbers', () => {
    const tsx = join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
    const script = join(REPO_ROOT, 'sweep', 'scripts', 'planEpisode.ts');
    const result = spawnSync(
      process.execPath,
      [tsx, script, '--layer1', 'x', '--layer2', 'x', '--universe', 'x', '--out', 'x'],
      { encoding: 'utf8', timeout: 60_000 },
    );
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/not-applicable/);
    expect(result.stderr).toMatch(/J43/);
  });
});
