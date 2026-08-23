/**
 * The inter-grader agreement gate (MS-9): the numbers that decide whether
 * ANY AI grade is believed.
 *
 * Trust gate, verbatim from the plan (all must hold): weighted κ ≥ 0.75;
 * AI harmful-recall ≥ 95% of human-harmful AND 100% of seeded harmful
 * canaries; ZERO AI-excellent-vs-human-harmful inversions (one instance
 * fails — the one unforgivable grader error); canary accuracy ≥ 90%.
 * Fail ⇒ new rubric version, re-grade, re-measure on a FRESH sample —
 * never re-fit.
 *
 * Every threshold lives in sweep/config/sweep-budgets.json as reviewed data
 * and is NULL until J43 signs it. A null clause reports
 * `not-applicable — threshold unset (J43)` and the gate as a whole can then
 * never report pass (CLAUDE.md gate discipline: an unrun check never reads
 * as protection).
 */
import { readFileSync } from 'node:fs';

import { SWEEP_BUDGETS_PATH } from '../perturb/deriveRepoRing2.js';
import type { GradeValue } from '../grade/layer2.js';
import { weightedKappa, type KappaWeighting } from './kappa.js';
import type { CanaryScore } from './canary.js';

export interface TrustThresholds {
  readonly weightedKappa: number | null;
  readonly harmfulRecall: number | null;
  readonly excellentVsHarmfulInversions: number | null;
  readonly canaryAccuracy: number | null;
}

export interface GraderWorkloadBudget {
  readonly ceilingRowsPerEpisode: number | null;
  readonly tierBSample: number | null;
}

/** Read the J43 trust thresholds — nulls come back as nulls, never defaults. */
export function readGraderTrust(): TrustThresholds {
  const parsed = JSON.parse(readFileSync(SWEEP_BUDGETS_PATH, 'utf8')) as {
    graderTrust?: Partial<TrustThresholds>;
  };
  return {
    weightedKappa: parsed.graderTrust?.weightedKappa ?? null,
    harmfulRecall: parsed.graderTrust?.harmfulRecall ?? null,
    excellentVsHarmfulInversions: parsed.graderTrust?.excellentVsHarmfulInversions ?? null,
    canaryAccuracy: parsed.graderTrust?.canaryAccuracy ?? null,
  };
}

/** Read the J43 workload numbers — nulls come back as nulls, never defaults. */
export function readGraderWorkload(): GraderWorkloadBudget {
  const parsed = JSON.parse(readFileSync(SWEEP_BUDGETS_PATH, 'utf8')) as {
    graderWorkload?: Partial<GraderWorkloadBudget>;
  };
  return {
    ceilingRowsPerEpisode: parsed.graderWorkload?.ceilingRowsPerEpisode ?? null,
    tierBSample: parsed.graderWorkload?.tierBSample ?? null,
  };
}

export interface AgreementMetrics {
  /** κ over the dual-graded human overlap. */
  readonly weightedKappa: number;
  readonly kappaWeighting: KappaWeighting;
  readonly dualOverlap: number;
  /** AI harmful-recall against human-harmful rows. */
  readonly humanHarmful: number;
  readonly aiCaughtHarmful: number;
  readonly harmfulRecall: number;
  /** AI said excellent where a human said harmful — one instance fails. */
  readonly excellentVsHarmfulInversions: number;
  /** AI canary performance (accuracy + seeded-harmful recall). */
  readonly canary: CanaryScore;
}

export function computeAgreementMetrics(options: {
  /** queryId → [graderA, graderB] over the dual overlap. */
  readonly dualPairs: ReadonlyMap<string, readonly [GradeValue, GradeValue]>;
  /** queryId → resolved human grade (post-resolution, Jesse-final rows included). */
  readonly humanFinal: ReadonlyMap<string, GradeValue>;
  /** queryId → AI grade. */
  readonly aiGrades: ReadonlyMap<string, GradeValue>;
  readonly canary: CanaryScore;
  readonly kappaWeighting: KappaWeighting;
}): AgreementMetrics {
  const pairs = [...options.dualPairs.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([, pair]) => pair);
  const kappa = weightedKappa(pairs, options.kappaWeighting);

  let humanHarmful = 0;
  let aiCaughtHarmful = 0;
  let inversions = 0;
  for (const [queryId, human] of [...options.humanFinal.entries()].sort(([a], [b]) =>
    a < b ? -1 : 1,
  )) {
    if (human !== 'harmful') continue;
    humanHarmful += 1;
    const ai = options.aiGrades.get(queryId);
    if (ai === 'harmful') aiCaughtHarmful += 1;
    if (ai === 'excellent') inversions += 1;
  }
  return {
    weightedKappa: kappa,
    kappaWeighting: options.kappaWeighting,
    dualOverlap: pairs.length,
    humanHarmful,
    aiCaughtHarmful,
    harmfulRecall: humanHarmful === 0 ? 0 : aiCaughtHarmful / humanHarmful,
    excellentVsHarmfulInversions: inversions,
    canary: options.canary,
  };
}

export interface GateClause {
  readonly name: string;
  readonly status: 'pass' | 'fail' | 'not-applicable';
  readonly detail: string;
}

export interface TrustGateResult {
  /** Never 'pass' while any clause is not-applicable — no vacuous trust. */
  readonly status: 'pass' | 'fail' | 'not-applicable';
  readonly clauses: readonly GateClause[];
}

export function evaluateTrustGate(
  metrics: AgreementMetrics,
  thresholds: TrustThresholds,
): TrustGateResult {
  const clauses: GateClause[] = [];
  const clause = (
    name: string,
    threshold: number | null,
    evaluate: (signed: number) => { pass: boolean; detail: string },
  ): void => {
    if (threshold === null) {
      clauses.push({
        name,
        status: 'not-applicable',
        detail: 'not-applicable — threshold unset (J43); measured and reported, never pass',
      });
      return;
    }
    const { pass, detail } = evaluate(threshold);
    clauses.push({ name, status: pass ? 'pass' : 'fail', detail });
  };

  clause('weighted-kappa', thresholds.weightedKappa, (signed) => ({
    pass: metrics.weightedKappa >= signed,
    detail: `κ(${metrics.kappaWeighting}) = ${metrics.weightedKappa.toFixed(4)} vs ≥ ${signed} over ${metrics.dualOverlap} dual pairs`,
  }));
  clause('harmful-recall', thresholds.harmfulRecall, (signed) => {
    const seededOk = metrics.canary.harmfulSeeded === metrics.canary.harmfulCaught;
    return {
      pass: metrics.harmfulRecall >= signed && seededOk,
      detail:
        `AI caught ${metrics.aiCaughtHarmful}/${metrics.humanHarmful} human-harmful ` +
        `(${(metrics.harmfulRecall * 100).toFixed(1)}% vs ≥ ${signed * 100}%) and ` +
        `${metrics.canary.harmfulCaught}/${metrics.canary.harmfulSeeded} seeded harmful canaries (100% required)`,
    };
  });
  clause('excellent-vs-harmful-inversions', thresholds.excellentVsHarmfulInversions, (signed) => ({
    pass: metrics.excellentVsHarmfulInversions <= signed,
    detail: `${metrics.excellentVsHarmfulInversions} inversions vs ≤ ${signed} — one instance fails; the one unforgivable grader error`,
  }));
  clause('canary-accuracy', thresholds.canaryAccuracy, (signed) => ({
    pass: metrics.canary.accuracy >= signed && metrics.canary.ungraded.length === 0,
    detail:
      `${metrics.canary.correct}/${metrics.canary.total} canaries correct ` +
      `(${(metrics.canary.accuracy * 100).toFixed(1)}% vs ≥ ${signed * 100}%), ` +
      `${metrics.canary.ungraded.length} ungraded`,
  }));

  const status: TrustGateResult['status'] = clauses.some((c) => c.status === 'fail')
    ? 'fail'
    : clauses.some((c) => c.status === 'not-applicable')
      ? 'not-applicable'
      : 'pass';
  return { status, clauses };
}
