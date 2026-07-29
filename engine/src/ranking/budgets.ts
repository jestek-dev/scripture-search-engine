/**
 * SIGNAL BUDGETS — guardrail G6, the deepest guardrail in the system.
 *
 * Every other gate measures whether a data addition made results worse.
 * This one makes the worst case BOUNDED BY CONSTRUCTION: because these caps
 * are enforced inside the scoring core rather than assumed by convention, an
 * admitted dataset cannot shout down an exact match or a curated anchor no
 * matter how large it is. Adding data changes WHICH candidates surface; it
 * can never change HOW LOUD a signal class is permitted to be.
 *
 * That bound is what makes it safe to keep feeding the system over time: a
 * bad addition can waste space and add mediocre candidates (which G4, G5, G8
 * and G9 catch), but it cannot invert the evidence hierarchy.
 *
 * These numbers are reviewed data. Changing one changes ordering, so gate G2
 * requires an ENGINE_VERSION bump in the same commit, and the golden corpus
 * (G3) plus noise probes (G8) must still pass.
 */

import type { Evidence, Reason, SignalFamily } from '../reasons/types.js';
import { isAuthoritative } from '../reasons/types.js';

export interface FamilyBudget {
  /** Points awarded at strength 1.0. */
  readonly maxPoints: number;
  /**
   * Most reasons of this family that may contribute to a single result.
   * Ten sermons agreeing is not ten independent facts.
   */
  readonly maxReasons: number;
}

export interface SignalBudgets {
  readonly families: Readonly<Record<SignalFamily, FamilyBudget>>;
  /**
   * Ceiling on the SUM of all weak-family points for one result. This is the
   * rule that keeps accumulated weak evidence from ever equalling direct
   * evidence: no pile of thematic hints outranks a verbatim phrase match.
   */
  readonly weakAggregateCap: number;
  /**
   * Families whose evidence derives from overlapping upstream data share one
   * budget (guardrail G7). OpenBible's cross-references derive largely from
   * TSK, and homiletical co-citations overlap both; counting them as
   * independent would inflate confidence for what is substantially one fact.
   */
  readonly correlationGroups: readonly (readonly SignalFamily[])[];
}

export const DEFAULT_BUDGETS: SignalBudgets = {
  families: {
    // Authoritative — these dominate by design.
    reference: { maxPoints: 100, maxReasons: 1 },
    exact_phrase: { maxPoints: 60, maxReasons: 1 },
    concept_anchor: { maxPoints: 40, maxReasons: 3 },
    // Weak — individually modest, collectively capped below.
    concept_lexicon: { maxPoints: 12, maxReasons: 2 },
    token_overlap: { maxPoints: 10, maxReasons: 1 },
    proximity: { maxPoints: 6, maxReasons: 1 },
    passage_terms: { maxPoints: 8, maxReasons: 2 },
    cross_reference: { maxPoints: 6, maxReasons: 2 },
    co_citation: { maxPoints: 5, maxReasons: 2 },
  },
  // Deliberately below exact_phrase.maxPoints: every weak signal in the
  // system, all firing at full strength, still loses to one verbatim match.
  weakAggregateCap: 30,
  correlationGroups: [['cross_reference', 'co_citation']],
};

export interface BudgetedScore {
  readonly score: number;
  readonly reasons: readonly Reason[];
  /** True when any cap actually reduced a contribution — surfaced in gate reports. */
  readonly capped: boolean;
}

function toReason(evidence: Evidence, budget: FamilyBudget): Reason {
  const clampedStrength = Math.min(1, Math.max(0, evidence.strength));
  return {
    family: evidence.family,
    label: evidence.label,
    points: clampedStrength * budget.maxPoints,
    ...(evidence.provenance ? { provenance: evidence.provenance } : {}),
  };
}

/**
 * Deterministic evidence ordering. Sorting by strength alone would let two
 * equal-strength items from different sources swap places between builds,
 * which would break the reproducibility contract; family name then label
 * then locator give a total order over otherwise-tied evidence.
 */
function compareEvidence(a: Evidence, b: Evidence): number {
  if (b.strength !== a.strength) return b.strength - a.strength;
  if (a.family !== b.family) return a.family < b.family ? -1 : 1;
  if (a.label !== b.label) return a.label < b.label ? -1 : 1;
  const aLoc = a.provenance?.locator ?? '';
  const bLoc = b.provenance?.locator ?? '';
  if (aLoc !== bLoc) return aLoc < bLoc ? -1 : 1;
  const aSrc = a.provenance?.sourceId ?? '';
  const bSrc = b.provenance?.sourceId ?? '';
  return aSrc < bSrc ? -1 : aSrc > bSrc ? 1 : 0;
}

/**
 * Apply the budgets to one candidate's raw evidence.
 *
 * Order of operations matters and is fixed:
 *   1. per-family reason count cap (drop the weakest duplicates)
 *   2. per-family point cap (via maxPoints scaling)
 *   3. correlation-group cap (correlated families share the larger budget)
 *   4. weak aggregate cap (scale all weak reasons proportionally)
 *
 * Scaling proportionally rather than truncating keeps the relative ordering
 * of weak reasons intact, so the displayed explanation still ranks the same
 * way the evidence does.
 */
export function applyBudgets(
  evidence: readonly Evidence[],
  budgets: SignalBudgets = DEFAULT_BUDGETS,
): BudgetedScore {
  let capped = false;

  // 1 + 2: per-family caps.
  const byFamily = new Map<SignalFamily, Evidence[]>();
  for (const item of evidence) {
    const bucket = byFamily.get(item.family);
    if (bucket) bucket.push(item);
    else byFamily.set(item.family, [item]);
  }

  const reasons: Reason[] = [];
  for (const [family, items] of byFamily) {
    const budget = budgets.families[family];
    const ordered = [...items].sort(compareEvidence);
    if (ordered.length > budget.maxReasons) capped = true;
    for (const item of ordered.slice(0, budget.maxReasons)) {
      reasons.push(toReason(item, budget));
    }
  }

  // 3: correlation groups — the group's total may not exceed the largest
  // single member budget, so overlapping sources cannot stack.
  for (const group of budgets.correlationGroups) {
    const members = reasons.filter((reason) => group.includes(reason.family));
    if (members.length < 2) continue;
    const groupCap = Math.max(...group.map((family) => budgets.families[family].maxPoints));
    const total = members.reduce((sum, reason) => sum + reason.points, 0);
    if (total <= groupCap || total === 0) continue;
    capped = true;
    const scale = groupCap / total;
    for (const member of members) {
      const index = reasons.indexOf(member);
      reasons[index] = {
        ...member,
        points: member.points * scale,
        uncappedPoints: member.points,
      };
    }
  }

  // 4: weak aggregate cap.
  const weak = reasons.filter((reason) => !isAuthoritative(reason.family));
  const weakTotal = weak.reduce((sum, reason) => sum + reason.points, 0);
  if (weakTotal > budgets.weakAggregateCap && weakTotal > 0) {
    capped = true;
    const scale = budgets.weakAggregateCap / weakTotal;
    for (const member of weak) {
      const index = reasons.indexOf(member);
      reasons[index] = {
        ...member,
        points: member.points * scale,
        uncappedPoints: member.uncappedPoints ?? member.points,
      };
    }
  }

  // Stable presentation order: strongest first, ties broken by family then label.
  const ordered = [...reasons].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (a.family !== b.family) return a.family < b.family ? -1 : 1;
    return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
  });

  const score = ordered.reduce((sum, reason) => sum + reason.points, 0);
  return { score, reasons: ordered, capped };
}
