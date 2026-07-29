/**
 * The pure scoring core. Pattern ported from LH Worship Setlist's
 * `src/lib/reco/engine.ts`: this module imports no database and no corpus
 * module, takes fully pre-extracted evidence, and is therefore unit-testable
 * in isolation. Only the orchestrator (`engine/src/index.ts`) touches I/O.
 *
 * Determinism is the product here. Same engine version + same corpus
 * fingerprint + same query MUST yield byte-identical ordering on every
 * platform, which is why every comparison below ends in a total-order
 * tie-break and no step depends on input order or Map iteration order.
 */

import type { Evidence, Reason } from '../reasons/types.js';
import { isAuthoritative } from '../reasons/types.js';
import { applyBudgets, DEFAULT_BUDGETS, type SignalBudgets } from './budgets.js';

export interface Candidate {
  /** Stable target id — the final tie-break, so ordering never wobbles. */
  readonly targetId: string;
  /** Pericope or passage grouping key, used for diversification. */
  readonly groupId: string;
  readonly evidence: readonly Evidence[];
}

export interface RankedResult {
  readonly targetId: string;
  readonly groupId: string;
  readonly score: number;
  readonly reasons: readonly Reason[];
  readonly capped: boolean;
}

export interface RankOptions {
  readonly budgets?: SignalBudgets;
  readonly limit?: number;
  /**
   * Most results allowed from one passage group, applied ONLY to results
   * carrying no authoritative evidence. Per the 2026-07-20 rule, results
   * "diversify by passage context only after high-confidence direct matches
   * are protected" — a genuine 6-verse exact-phrase hit in one chapter must
   * never be thinned for the sake of variety.
   */
  readonly maxPerGroup?: number;
}

export const DEFAULT_LIMIT = 25;
export const DEFAULT_MAX_PER_GROUP = 3;

/**
 * Total order over scored results: score desc, then authoritative-first (so a
 * direct match outranks an equal-scoring pile of hints), then targetId asc.
 * targetId is the documented final tie-break and is unique, so this comparator
 * never returns 0 for distinct results — no reliance on sort stability.
 */
function compareResults(a: RankedResult, b: RankedResult): number {
  if (b.score !== a.score) return b.score - a.score;
  const aAuth = a.reasons.some((reason) => isAuthoritative(reason.family));
  const bAuth = b.reasons.some((reason) => isAuthoritative(reason.family));
  if (aAuth !== bAuth) return aAuth ? -1 : 1;
  return a.targetId < b.targetId ? -1 : a.targetId > b.targetId ? 1 : 0;
}

export function rank(
  candidates: readonly Candidate[],
  options: RankOptions = {},
): readonly RankedResult[] {
  const budgets = options.budgets ?? DEFAULT_BUDGETS;
  const limit = options.limit ?? DEFAULT_LIMIT;
  const maxPerGroup = options.maxPerGroup ?? DEFAULT_MAX_PER_GROUP;

  const scored: RankedResult[] = candidates.map((candidate) => {
    const { score, reasons, capped } = applyBudgets(candidate.evidence, budgets);
    return {
      targetId: candidate.targetId,
      groupId: candidate.groupId,
      score,
      reasons,
      capped,
    };
  });

  // Drop zero-evidence candidates rather than ranking them arbitrarily.
  const surviving = scored.filter((result) => result.reasons.length > 0);
  surviving.sort(compareResults);

  const groupCounts = new Map<string, number>();
  const output: RankedResult[] = [];
  const deferred: RankedResult[] = [];

  for (const result of surviving) {
    if (output.length >= limit) break;
    const authoritative = result.reasons.some((reason) => isAuthoritative(reason.family));
    const used = groupCounts.get(result.groupId) ?? 0;
    if (!authoritative && used >= maxPerGroup) {
      deferred.push(result);
      continue;
    }
    groupCounts.set(result.groupId, used + 1);
    output.push(result);
  }

  // Diversification thins, it never discards: if the capped groups left room
  // under the limit, deferred results return in their original total order.
  for (const result of deferred) {
    if (output.length >= limit) break;
    output.push(result);
  }

  return output;
}
