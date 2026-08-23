/**
 * The consumer-facing contract. Ported from Maskil's
 * `app/src/scripture/types.ts` and generalized so Setlist and Versed can use
 * the same engine without inheriting Maskil-shaped assumptions.
 *
 * `ContentQueryPort` is the ONLY seam to the outside world. Maskil supplies
 * OP-SQLite on device, the pipeline and eval harness supply better-sqlite3 in
 * Node, and a future hosted consumer could supply an HTTP-backed adapter —
 * none of which the engine knows or cares about.
 */

import type { Reason } from './reasons/types.js';
import type { ReferenceSuggestion } from './reference/reference.js';

export type ContentScalar = string | number | boolean | null | ArrayBuffer | ArrayBufferView;

export interface ContentQueryResult {
  readonly rows: readonly Readonly<Record<string, ContentScalar>>[];
}

export interface ContentQueryPort {
  execute(query: string, params?: readonly ContentScalar[]): Promise<ContentQueryResult>;
  close(): Promise<void>;
}

export interface ScriptureVerse {
  readonly id: number;
  readonly verseId: number;
  readonly translationId: number;
  readonly translationCode: string;
  readonly bookId: number;
  readonly bookName: string;
  readonly chapter: number;
  readonly verse: number;
  readonly text: string;
}

export interface ScripturePassage {
  readonly reference: string;
  readonly bookId: number;
  readonly chapterCount: number;
  readonly startChapter: number;
  readonly endChapter: number;
  readonly verses: readonly ScriptureVerse[];
}

/**
 * Every result carries the identities that make it reproducible. A consumer
 * can record `(engineVersion, corpusFingerprint, layerFingerprint, query)`
 * and any other consumer, on any platform, can regenerate the identical
 * ordering. This is the machine-checkable form of the "deterministic" claim.
 */
export interface ResultIdentity {
  readonly engineVersion: string;
  /** Identifies the scripture text. */
  readonly corpusFingerprint: string;
  /**
   * Identifies the curated concept and homiletical layers.
   *
   * Separate from the corpus fingerprint because they change for different
   * reasons and at different rates — and because without it, editing a
   * concept would silently alter rankings while every published identity
   * stayed the same. Reproducing a result requires BOTH.
   */
  readonly layerFingerprint: string;
}

/**
 * One member verse of a grouped (merged) result, its evidence uncollapsed
 * (0.14.0/CO-3 PR 2). The merged row's reasons are strongest-per-label across
 * the group; this is where a consumer finds what EACH verse contributed —
 * "every verse's own evidence still visible" is part of the grouping design,
 * not an optional nicety.
 */
export interface GroupedVerse {
  readonly targetId: string;
  readonly reference: string;
  readonly excerpt: string;
  readonly score: number;
  readonly reasons: readonly Reason[];
}

/**
 * Why a merged result's verses travel together (0.14.0/CO-3 PR 2). A typed
 * field, deliberately NOT a `Reason`: reasons must correspond to scoring
 * evidence, and grouping contributes ZERO points — the merged row's score is
 * the max of its members, never a sum. The grouping cites a countable fact
 * and names its source; nothing theological is adjudicated (covenant 6).
 */
export interface ResultGrouping {
  /**
   * The full span of the grouping unit — the curated anchor span, the alias
   * verse range, or the derived pericope. The result row's own `reference`
   * spans only the verses that actually surfaced (the hits), which may be a
   * subset of this section.
   */
  readonly section: {
    /** Label of the full section span, e.g. "Psalms 136:1-26". */
    readonly reference: string;
    readonly startVerseId: number;
    readonly endVerseId: number;
  };
  readonly provenance: {
    /**
     * Manifest source id the grouping stands on: the anchor's own source(s)
     * for an anchor-span merge ('+'-joined ascending when several agree,
     * e.g. 'editorial'), 'hymn-aliases' for an alias verse range, or
     * 'openbible-sections' for the pericope path. Authority order is fixed:
     * an anchor span is checked first, so pericope provenance never usurps
     * anchor provenance.
     */
    readonly sourceId: string;
    /** Human-facing attribution, e.g. "OpenBible section boundaries (CC BY)". */
    readonly label: string;
    /**
     * Pericope groups only: the summed boundary vote at the section's start
     * verse — the exact number the artifact stores (how many of the 20
     * surveyed translations start a section there). A countable structural
     * fact, never a relevance score; the explanation and the shipped data
     * cannot disagree because this is read from the same row.
     */
    readonly boundaryVotes?: number;
  };
}

export interface DiscoveryResult {
  readonly targetId: string;
  readonly reference: string;
  readonly excerpt: string;
  readonly score: number;
  readonly reasons: readonly Reason[];
  /**
   * Additive (0.14.0/CO-3 PR 2): present exactly when this row is a merged
   * passage-level result — the member verses in canonical order, each with
   * its own uncollapsed evidence. Absent on single-verse rows.
   */
  readonly verses?: readonly GroupedVerse[];
  /**
   * Additive (0.14.0/CO-3 PR 2): present exactly when `verses` is — why the
   * members travel together, citing the source that drew the boundary.
   */
  readonly grouping?: ResultGrouping;
}

/**
 * One cited spelling correction (0.12.0/QR-5). Corrections are never silent:
 * every substituted token is reported with the SURFACE form the user typed
 * (never the stem the tokenizer made of it), the vocabulary term substituted,
 * and the verified integer Damerau distance that justifies it — the same
 * citation the token chips render as `(corrected from "<typed>")`.
 */
export interface SpellingCorrection {
  /** What the user typed (lowercased surface form), e.g. "beleived". */
  readonly typed: string;
  /** The vocabulary term substituted, e.g. "believ". */
  readonly corrected: string;
  /** Verified integer Damerau–Levenshtein distance — the citation. */
  readonly distance: number;
}

export type ResearchOutcome =
  | { readonly kind: 'reference'; readonly passage: ScripturePassage }
  | {
      readonly kind: 'invalid-reference';
      readonly query: string;
      /**
       * Additive (0.11.0/QR-4): a cited did-you-mean on the dead end — the
       * unique in-policy near-miss book, the validated reference it implies,
       * and the edit distance that justifies the guess. Suggestion only:
       * the engine NEVER silently opens a guessed passage; consumers render
       * it as a question ("did you mean Philippians 4:13?").
       */
      readonly suggestion?: ReferenceSuggestion;
    }
  | {
      readonly kind: 'discovery';
      readonly query: string;
      readonly results: readonly DiscoveryResult[];
      /**
       * Additive (0.12.0/QR-5): present iff `research()` substituted
       * corrections for out-of-vocabulary tokens — the machine-readable
       * citation consumers render (J32). Absent means nothing was corrected;
       * a word in ANY vocabulary is never rewritten (the OOV gate).
       * `forSong()` never corrects, so its discovery outcome never carries
       * this field.
       */
      readonly corrections?: readonly SpellingCorrection[];
    };

export type ResearchResult = ResearchOutcome & ResultIdentity;

/** Concept-resolution output for `engine.themes()`. */
export interface ConceptMatch {
  readonly conceptId: string;
  readonly label: string;
  /** Which lexicon entry matched, so the UI can show why this concept fired. */
  readonly matchedOn: string;
  readonly anchors: readonly string[];
}

/** `engine.passage()` — a lookup, with invalid references typed rather than thrown. */
export type PassageResult =
  | ({ readonly kind: 'passage'; readonly passage: ScripturePassage } & ResultIdentity)
  | ({
      readonly kind: 'invalid-reference';
      readonly query: string;
      /** Additive (0.11.0/QR-4): see ResearchOutcome's invalid-reference. */
      readonly suggestion?: ReferenceSuggestion;
    } & ResultIdentity);

/**
 * `engine.related()` — what a curated source connects to a passage.
 *
 * Deliberately NOT "verses that resemble this one". Every entry here exists
 * because a human recorded a link: a cross-reference edge, or a concept whose
 * anchors include this passage. Similarity is what `research()` does.
 */
export type RelatedResult =
  | ({
      readonly kind: 'related';
      readonly reference: string;
      /** Concepts whose curated anchors include this passage. */
      readonly concepts: readonly ConceptMatch[];
      readonly results: readonly DiscoveryResult[];
    } & ResultIdentity)
  | ({
      readonly kind: 'invalid-reference';
      readonly query: string;
      /** Additive (0.11.0/QR-4): see ResearchOutcome's invalid-reference. */
      readonly suggestion?: ReferenceSuggestion;
    } & ResultIdentity);

/**
 * Multi-field input for `engine.forSong()`.
 *
 * Setlist matches a sermon theme to songs; Maskil starts from a song being
 * written. Both need more than one field, and neither wants to pre-concatenate
 * them, because the fields differ in evidential weight — a stated theme is a
 * claim about meaning, a lyric line is raw text that happens to be present.
 */
export interface SongInput {
  readonly title?: string;
  readonly themes?: readonly string[];
  readonly lyrics?: string;
  /** A passage the song is built on. Seeds curated expansion, not text search. */
  readonly foundationalRef?: string;
}
