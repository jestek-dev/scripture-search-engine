/** A verse normalized to this project's canonical identity. */
export interface NormalizedVerse {
  /** BBCCCVVV encoding — sortable, stable, cheap to index. */
  readonly verseId: number;
  readonly bookId: number;
  readonly chapter: number;
  readonly verse: number;
  readonly text: string;
}

export interface TranslationImport {
  readonly code: string;
  readonly name: string;
  /** Manifest source id — the provenance link G1 verifies. */
  readonly sourceId: string;
  readonly attributionText: string;
  readonly sha256: string;
  readonly verses: readonly NormalizedVerse[];
}
