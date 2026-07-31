/**
 * Typed reason objects. Shape ported from LH Worship Setlist's
 * `RecoReason { kind, label, tone, points }` and extended with the two things
 * Maskil's plan requires: machine-verifiable evidence and provenance.
 *
 * Contract (from the 2026-07-20 ranking rules): every result carries at least
 * one reason, and every reason must correspond to actual scoring evidence.
 * A result whose displayed reason does not match the evidence that produced
 * its score is a gate G3 failure, not a cosmetic bug — the explanation IS the
 * product. "No result claims the application understood or interpreted the
 * lyric": reasons state what matched, never what it means.
 */

/**
 * Signal families, in evidence-strength order. The split into authoritative
 * and weak is not cosmetic — `ranking/budgets.ts` caps the weak families both
 * individually and in aggregate, which is what structurally prevents a large
 * new dataset from outranking an exact match (guardrail G6).
 */
export type SignalFamily =
  // Authoritative: direct, verifiable, uncapped in aggregate.
  | 'reference'         // the query parsed as a scripture reference
  | 'exact_phrase'      // the query text occurs verbatim in the verse
  | 'concept_anchor'    // a curated ontology concept names this passage
  // Weak: helpful, individually capped, collectively capped.
  | 'concept_lexicon'   // query matched a concept's lexicon, not its anchors
  | 'token_overlap'     // distinctive tokens shared with the passage
  | 'translation_variant' // the verse reads this way in another translation
  | 'proximity'         // matched tokens occur near each other
  | 'passage_terms'     // homiletical term profile for this pericope
  | 'cross_reference'   // curated cross-reference edge (OpenBible et al.)
  | 'co_citation';      // verses cited together in preached/written sources

export const AUTHORITATIVE_FAMILIES: readonly SignalFamily[] = [
  'reference',
  'exact_phrase',
  'concept_anchor',
];

export function isAuthoritative(family: SignalFamily): boolean {
  return AUTHORITATIVE_FAMILIES.includes(family);
}

/**
 * Where a piece of evidence came from. Every weak-signal reason must carry
 * one: it is what lets the UI print "Nave 'Obedience'" or "Spurgeon, MTP
 * #1467" instead of an unfalsifiable claim of relevance, and what lets gate
 * G1 prove every shipped row traces to an admitted source.
 */
export interface Provenance {
  /** Manifest source id, e.g. 'openbible-topics', 'nave', 'editorial'. */
  readonly sourceId: string;
  /** Human-facing attribution, e.g. "Nave's Topical Bible". */
  readonly label: string;
  /** Optional locator within the source: topic name, sermon id, work section. */
  readonly locator?: string;
  /** Optional source-defined weight (e.g. OpenBible votes) — a prior, never truth. */
  readonly weight?: number;
}

export interface Reason {
  readonly family: SignalFamily;
  /** Short display label, e.g. "Exact phrase", "Theme: hearing and doing". */
  readonly label: string;
  /** Points this reason actually contributed AFTER caps were applied. */
  readonly points: number;
  /** Points before caps; present only when a cap reduced the contribution. */
  readonly uncappedPoints?: number;
  readonly provenance?: Provenance;
}

/** Raw evidence produced by an intent, before budgets are applied. */
export interface Evidence {
  readonly family: SignalFamily;
  readonly label: string;
  /** Raw strength, typically 0..1 within the family; budgets convert to points. */
  readonly strength: number;
  readonly provenance?: Provenance;
}
