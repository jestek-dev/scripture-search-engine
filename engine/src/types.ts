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

export interface DiscoveryResult {
  readonly targetId: string;
  readonly reference: string;
  readonly excerpt: string;
  readonly score: number;
  readonly reasons: readonly Reason[];
}

export type ResearchOutcome =
  | { readonly kind: 'reference'; readonly passage: ScripturePassage }
  | { readonly kind: 'invalid-reference'; readonly query: string }
  | {
      readonly kind: 'discovery';
      readonly query: string;
      readonly results: readonly DiscoveryResult[];
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
  | ({ readonly kind: 'invalid-reference'; readonly query: string } & ResultIdentity);

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
  | ({ readonly kind: 'invalid-reference'; readonly query: string } & ResultIdentity);

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
