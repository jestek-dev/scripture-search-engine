/**
 * Chip display polish (0.10.0, CO-2/F22).
 *
 * A result's ordering is decided by applyBudgets and rank(); its CHIPS are
 * what a person reads. These two concerns diverge at the margin: a chip whose
 * points are real but tiny still counts toward the score, yet displaying it
 * claims an explanatory weight the number itself denies. This module is the
 * display seam — it never changes points, scores, or order; it only decides
 * which chips are worth a reader's attention. Both constants are reviewed
 * data, mirrored into `eval/budgets.json` signalBudgets for the G6
 * reviewed-constants check.
 */

import type { Reason } from './types.js';

/**
 * Chips display their points at one decimal. Below this value a chip prints
 * "0.0" — asserting a contribution the display itself denies. Fixed by that
 * display precision (0.05 is the smallest value that rounds to 0.1), not a
 * tuning knob. Measured at introduction (84-query battery, full 25-deep
 * windows, full reconstructed corpus): no current chip is below it — the
 * rule is a structural guard on the display contract, not a tuned
 * suppressor.
 */
export const CHIP_DISPLAY_MIN_POINTS = 0.05;

/**
 * Display floor for passage_terms chips (the homiletical-vocabulary hint).
 *
 * Derived from reviewed data, not tuned: the weakest evidence G5 can admit —
 * a single term at the admission floor (`eval/budgets.json`
 * distinctiveness.minPmi = 2.0) distilled from a one-verse note — earns
 * 8 × log1p(1)/log1p(6) × 2/(2+6) ≈ 0.712 points, and the floor sits just
 * beneath it. Everything that clears admission undiluted still displays;
 * the same evidence diluted below that line (a floor-grade term inherited
 * from a whole-chapter essay, or scaled down by the aggregate caps) is
 * withheld as a chip while its points still count. Measured at introduction:
 * the weakest passage_terms chip anywhere in the battery's full windows is
 * 0.896 — nothing currently withheld; the floor exists so future admitted
 * data cannot decorate results with sub-admission-grade chips.
 */
export const PASSAGE_TERM_CHIP_DISPLAY_FLOOR = 0.7;

/**
 * Withhold chips that fail the display rules. Pure and order-preserving;
 * points, scores and result order are untouched by construction — callers
 * apply this AFTER ranking and collapsing, to the reasons of final results.
 *
 * Covenant guard: explanations are part of the contract, so a result is
 * never stripped of its last chip — when every chip fails the rules, the
 * strongest one stays, honestly showing how little the result rests on.
 *
 * Returns the input array unchanged (same reference) when nothing is
 * withheld, so untouched results stay byte-identical.
 */
export function polishChipsForDisplay(reasons: readonly Reason[]): readonly Reason[] {
  if (reasons.length === 0) return reasons;
  const kept = reasons.filter(
    (reason) =>
      reason.points >= CHIP_DISPLAY_MIN_POINTS &&
      (reason.family !== 'passage_terms' || reason.points >= PASSAGE_TERM_CHIP_DISPLAY_FLOOR),
  );
  if (kept.length === reasons.length) return reasons;
  // reasons arrive strongest-first from applyBudgets / the collapse merge,
  // so [0] is the strongest chip.
  return kept.length > 0 ? kept : [reasons[0]!];
}
