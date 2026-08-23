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
import type { SpellingCorrection } from '../types.js';

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
/**
 * The correction citation a chip label carries for one corrected token —
 * shared between tokenEvidence's decoration and the display-level pin below,
 * so "is this correction visibly cited?" is checked against the exact string
 * that renders it.
 */
export function correctionCitation(typed: string): string {
  return `corrected from "${typed}"`;
}

/**
 * Guarantee every correction is VISIBLY cited on a result of a corrected
 * query (0.12.0/QR-5 round-2, J31: "every correction shown"; covenant 5:
 * explanations are the contract).
 *
 * The token-chip decoration (`Shared word: hell (corrected from "hello")`)
 * only exists on results whose evidence includes the corrected token's
 * token_overlap chip. Exactly the harm-class corrections tend to surface
 * results through concept/passage evidence instead — `hello` → "hell" ranks
 * pages of `Theme: Hell` rows with no visible trace that the query was
 * rewritten. A citation the user cannot see is not a citation, so this pin
 * runs LAST (after polish, like the last-chip rule) and decorates the
 * strongest chip of any result whose displayed chips do not already carry
 * every correction: `Theme: Hell (query corrected from "hello")`.
 *
 * The wording is query-level on purpose: on a mixed query ("gods forgivness")
 * a result may rank on the UNcorrected tokens alone, so claiming the result
 * matched via the correction would be false — what is always true, for every
 * result of the response, is that the QUERY was corrected. Display-only by
 * construction: points, scores, order and the page are already decided;
 * labels change, families and points never do.
 *
 * Returns the input array unchanged (same reference) when every correction
 * is already visible, so untouched results stay byte-identical.
 */
export function pinCorrectionCitations(
  reasons: readonly Reason[],
  corrections: readonly SpellingCorrection[],
): readonly Reason[] {
  if (reasons.length === 0 || corrections.length === 0) return reasons;
  const missing = corrections.filter(
    (correction) =>
      !reasons.some((reason) => reason.label.includes(correctionCitation(correction.typed))),
  );
  if (missing.length === 0) return reasons;
  const cited = missing.map((correction) => `"${correction.typed}"`).join(', ');
  const [strongest, ...rest] = reasons;
  return [{ ...strongest!, label: `${strongest!.label} (query corrected from ${cited})` }, ...rest];
}

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
