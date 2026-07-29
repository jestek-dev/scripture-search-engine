/**
 * G8 — noise probes, and G11 — latency.
 *
 * G8 is the mush detector. Every other gate asks "is this row allowed?"; this
 * one asks "did the result LISTS get worse?" It runs a fixed question set
 * against the new artifact and diffs it against the committed baseline.
 *
 * Three measurements, each aimed at a specific way growth degrades quality:
 *
 *  - **top-10 churn** — how much each list changed. A little churn is the
 *    point of adding data. Massive churn on a broad query means the new data
 *    displaced established results wholesale, which is rarely an improvement
 *    and always worth a human look.
 *  - **weak-reason share** — what fraction of the score came from weak
 *    families. Signal budgets bound this per result; this measures it across
 *    the whole list. Climbing share means thematic hints are crowding out
 *    direct evidence — precision erosion, visible before anyone complains.
 *  - **adversarial silence** — queries that must return NOTHING. As weak
 *    signals accumulate, the first thing to break is the engine's ability to
 *    say "I have nothing for you", and a system that always answers is a
 *    system that has stopped discriminating.
 */

import type { ScriptureEngine } from '@lh/scripture-engine';
import { isAuthoritative } from '@lh/scripture-engine';

import { fail, pass, type GateFinding, type GateResult } from './types.js';

export interface Probe {
  readonly id: string;
  readonly query: string;
  readonly kind: string;
  readonly expectNoResults?: boolean;
  readonly why?: string;
}

export interface ProbeObservation {
  readonly id: string;
  readonly top: readonly string[];
  readonly resultCount: number;
  readonly weakReasonShare: number;
  readonly meanTopScore: number;
}

export interface ProbeBaseline {
  readonly corpusFingerprint: string;
  readonly engineVersion: string;
  readonly observations: readonly ProbeObservation[];
}

export interface NoiseThresholds {
  readonly maxTop10ChurnRatio: number;
  readonly maxWeakReasonShareIncrease: number;
  readonly minMeanDistinctiveness: number | null;
}

const TOP_N = 10;

function round(value: number): number {
  // Rounded so a baseline file does not churn on floating-point noise, while
  // staying precise enough that a real shift is still visible.
  return Number(value.toFixed(6));
}

export async function observeProbes(
  engine: ScriptureEngine,
  probes: readonly Probe[],
): Promise<{ observations: ProbeObservation[]; latenciesMs: number[] }> {
  const observations: ProbeObservation[] = [];
  const latenciesMs: number[] = [];

  for (const probe of probes) {
    const started = performance.now();
    const result = await engine.research(probe.query);
    latenciesMs.push(performance.now() - started);

    const results = result.kind === 'discovery' ? result.results : [];
    const top = results.slice(0, TOP_N);

    let weakPoints = 0;
    let totalPoints = 0;
    for (const entry of top) {
      for (const reason of entry.reasons) {
        totalPoints += reason.points;
        if (!isAuthoritative(reason.family)) weakPoints += reason.points;
      }
    }

    observations.push({
      id: probe.id,
      top: top.map((entry) => entry.targetId),
      resultCount: results.length,
      weakReasonShare: totalPoints > 0 ? round(weakPoints / totalPoints) : 0,
      meanTopScore: top.length > 0
        ? round(top.reduce((sum, entry) => sum + entry.score, 0) / top.length)
        : 0,
    });
  }
  return { observations, latenciesMs };
}

/** Fraction of the previous top-10 no longer present in the new top-10. */
function churn(previous: readonly string[], current: readonly string[]): number {
  if (previous.length === 0) return current.length > 0 ? 1 : 0;
  const now = new Set(current);
  const dropped = previous.filter((id) => !now.has(id)).length;
  return dropped / previous.length;
}

export function noiseGate(options: {
  readonly probes: readonly Probe[];
  readonly observations: readonly ProbeObservation[];
  readonly baseline: ProbeBaseline | null;
  readonly thresholds: NoiseThresholds;
}): GateResult {
  const findings: GateFinding[] = [];
  const byId = new Map(options.observations.map((observation) => [observation.id, observation]));

  // Adversarial silence is checked with or without a baseline: it is an
  // absolute property, not a comparison.
  for (const probe of options.probes) {
    const observation = byId.get(probe.id);
    if (!observation) continue;
    if (probe.expectNoResults && observation.resultCount > 0) {
      findings.push({
        message:
          `${probe.id} ("${probe.query}") returned ${observation.resultCount} result(s) but must ` +
          `return none. ${probe.why ?? ''}`.trim(),
        subjects: [probe.id],
      });
    }
  }

  if (!options.baseline) {
    if (findings.length > 0) {
      return fail('G8-noise-probes', 'Noise probes', 'absolute probe checks failed', findings);
    }
    return pass(
      'G8-noise-probes',
      'Noise probes',
      `${options.observations.length} probe(s) recorded; no committed baseline yet, so churn ` +
        'is not measured this run',
      { probes: options.observations.length },
    );
  }

  const previous = new Map(options.baseline.observations.map((entry) => [entry.id, entry]));
  let maxChurn = 0;
  for (const observation of options.observations) {
    const before = previous.get(observation.id);
    if (!before) continue;
    const ratio = churn(before.top, observation.top);
    maxChurn = Math.max(maxChurn, ratio);

    // Precision erosion: weak signals taking over a list they did not
    // previously dominate. Measured as a rise, because the absolute level is
    // a property of what evidence the query can even have.
    const weakRise = observation.weakReasonShare - before.weakReasonShare;
    if (weakRise > options.thresholds.maxWeakReasonShareIncrease) {
      findings.push({
        message:
          `${observation.id}: weak-signal share of the top-${TOP_N} rose from ` +
          `${(before.weakReasonShare * 100).toFixed(0)}% to ` +
          `${(observation.weakReasonShare * 100).toFixed(0)}% ` +
          `(+${(weakRise * 100).toFixed(0)} points, limit ` +
          `+${(options.thresholds.maxWeakReasonShareIncrease * 100).toFixed(0)}). ` +
          'Thematic hints are crowding out direct evidence.',
        subjects: [observation.id],
      });
    }
    if (ratio > options.thresholds.maxTop10ChurnRatio) {
      const now = new Set(observation.top);
      findings.push({
        message:
          `${observation.id}: ${(ratio * 100).toFixed(0)}% of the top-${TOP_N} was displaced ` +
          `(limit ${(options.thresholds.maxTop10ChurnRatio * 100).toFixed(0)}%). Dropped: ` +
          `${before.top.filter((id) => !now.has(id)).join(', ')}`,
        subjects: [observation.id],
      });
    }
  }

  if (findings.length > 0) {
    return fail(
      'G8-noise-probes',
      'Noise probes',
      `${findings.length} probe(s) degraded versus baseline`,
      findings,
    );
  }
  return pass(
    'G8-noise-probes',
    'Noise probes',
    `${options.observations.length} probe(s) stable versus baseline (max churn ` +
      `${(maxChurn * 100).toFixed(0)}%)`,
    { probes: options.observations.length, maxChurnRatio: round(maxChurn) },
  );
}

export function latencyGate(latenciesMs: readonly number[], budgetMs: number): GateResult {
  if (latenciesMs.length === 0) {
    return pass('G11-latency', 'Latency', 'no probes to time');
  }
  const sorted = [...latenciesMs].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1);
  const p95 = sorted[Math.max(0, index)]!;
  if (p95 > budgetMs) {
    return fail('G11-latency', 'Latency', `p95 ${p95.toFixed(1)}ms exceeds ${budgetMs}ms`, [
      {
        message:
          `Probe p95 is ${p95.toFixed(1)}ms against a ${budgetMs}ms budget. Note this is the CI ` +
          'runner against the fixture corpus, not target hardware — it catches algorithmic ' +
          'regressions, not device performance.',
      },
    ]);
  }
  return pass('G11-latency', 'Latency', `p95 ${p95.toFixed(1)}ms within ${budgetMs}ms`, {
    p95Ms: round(p95),
    maxMs: round(sorted[sorted.length - 1]!),
  });
}
