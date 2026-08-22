/**
 * Deterministic cited spelling correction (0.12.0/QR-5) — the pure half.
 *
 * The pipeline precomputes a SymSpell-style delete-variant index over the
 * artifact's whole vocabulary (corpus tokens ∪ book aliases ∪ lexicon tokens
 * ∪ translation tokens); at query time an out-of-vocabulary token's own
 * delete variants are looked up through the port and every candidate is
 * verified with the bounded integer Damerau DP before one may substitute.
 * Everything in this module is a pure function — no I/O, no floats in
 * decisions, no locale, no randomness — so the winning correction is a
 * function of (typed token, candidate SET) alone.
 *
 * ONE edit-policy table (Phase 5 design invariant): the budgets here are the
 * SAME constants the reference did-you-mean uses (imported, not copied —
 * there is exactly one table to review, J31/J35 review it once). The pipeline
 * imports these same exports when it builds the delete index, and eval
 * cross-checks that the shipped table matches a recomputation from them.
 *
 * Correction is a query-time-only rung: the corpus is sacred input, the query
 * is fallible input, and only the fallible side gets the fallback. The
 * pipeline never "corrects" scripture text, and the tokenizer is untouched
 * (TOKENIZER_VERSION stays 1.0.0) — correction lives HERE, in the intent
 * layer.
 */

import {
  damerauLevenshtein,
  editDistanceBudget,
  SUGGESTION_EDIT1_MAX_KEY_LENGTH,
  SUGGESTION_MIN_KEY_LENGTH,
} from '../reference/reference.js';

/**
 * The ONE policy table, re-exported under the spelling surface so QR-5's
 * reviewers see the same numbers QR-4's did (J31 = J35's edit bounds):
 * typed length <5 → never correct; 5–8 → edit distance 1; ≥9 → edit
 * distance 2; a transposition counts as 1 (Damerau). Keyed on the TYPED
 * token's length — the stricter, safer reading.
 */
export const SPELLING_MIN_TOKEN_LENGTH = SUGGESTION_MIN_KEY_LENGTH;
export const SPELLING_EDIT1_MAX_TOKEN_LENGTH = SUGGESTION_EDIT1_MAX_KEY_LENGTH;

/** Edit budget for a typed token — the same function the book did-you-mean uses. */
export function spellingEditBudget(typedLength: number): number {
  return editDistanceBudget(typedLength);
}

/**
 * How many delete variants the PIPELINE must precompute for a dictionary
 * term, derived from the typed-side policy table rather than guessed:
 * a term of length m can be within budgeted distance of some typed token
 * only when a typed length t exists with |t − m| ≤ budget(t), and the depth
 * needed is the largest such budget.
 *
 *   budget 2 requires t ≥ 9 and |t − m| ≤ 2  → m ≥ 7
 *   budget 1 requires 5 ≤ t ≤ 8 and |t − m| ≤ 1 → 4 ≤ m ≤ 9
 *
 * So: length ≥ 7 → depth 2; length 4–6 → depth 1; below 4 → 0 (no typed
 * token in policy can ever reach it — such terms ship in spelling_terms for
 * the vocabulary gate but contribute no delete rows). Exported for the
 * pipeline and for the eval cross-check.
 */
export function dictionaryDeleteDepth(termLength: number): number {
  if (termLength >= 7) return 2;
  return termLength >= 4 ? 1 : 0;
}

/**
 * All strings reachable from `word` by deleting up to `depth` characters —
 * INCLUDING the word itself (0 deletions), so a candidate reachable purely by
 * deleting from the other side matches on the identity row. Returned sorted
 * (code-unit order) so pipeline insertion order is byte-deterministic.
 */
export function deleteVariants(word: string, depth: number): readonly string[] {
  const seen = new Set<string>([word]);
  let frontier = [word];
  for (let round = 0; round < depth; round += 1) {
    const next: string[] = [];
    for (const value of frontier) {
      if (value.length <= 1) continue;
      for (let index = 0; index < value.length; index += 1) {
        const variant = value.slice(0, index) + value.slice(index + 1);
        if (!seen.has(variant)) {
          seen.add(variant);
          next.push(variant);
        }
      }
    }
    frontier = next;
  }
  return [...seen].sort();
}

/** One dictionary term surfaced by the delete-variant lookup. */
export interface SpellingCandidate {
  readonly term: string;
  /** Corpus document frequency; 0 for vocabulary-only origins (books, lexicon, translations). */
  readonly documentCount: number;
}

export interface PickedCorrection {
  readonly term: string;
  /** Verified integer Damerau distance from the typed token — the citation. */
  readonly distance: number;
  readonly documentCount: number;
}

/**
 * Chooses the winning correction for an out-of-vocabulary typed token.
 *
 * Every candidate is re-verified with the bounded Damerau DP (the delete
 * index only proposes; it never decides), then the winner is selected under
 * a TOTAL order: distance ascending → document_count descending → term
 * lexicographic ascending. Total means row-order independent: the outcome is
 * a pure function of the candidate SET. Distance 0 is skipped by
 * construction — a token equal to a vocabulary term is in-vocabulary and the
 * caller never asks about it — and an empty or fully out-of-bound candidate
 * list yields null: no correction beats a wrong correction.
 */
export function pickCorrection(
  typed: string,
  candidates: readonly SpellingCandidate[],
  bound: number,
): PickedCorrection | null {
  if (bound <= 0) return null;
  let best: PickedCorrection | null = null;
  for (const candidate of candidates) {
    const distance = damerauLevenshtein(typed, candidate.term, bound);
    if (distance === null || distance === 0) continue;
    if (
      best === null ||
      distance < best.distance ||
      (distance === best.distance &&
        (candidate.documentCount > best.documentCount ||
          (candidate.documentCount === best.documentCount && candidate.term < best.term)))
    ) {
      best = { term: candidate.term, distance, documentCount: candidate.documentCount };
    }
  }
  return best;
}
