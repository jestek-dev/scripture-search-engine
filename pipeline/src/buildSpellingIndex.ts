/**
 * Builds the precomputed spelling index (schema v7, QR-5/0.12.0) into an
 * artifact whose corpus and layers are already written.
 *
 * Vocabulary = corpus tokens ∪ book aliases ∪ lexicon tokens ∪ translation
 * tokens, every row carrying its origins — read back from THIS database, so
 * the index is a deterministic function of bytes the artifact already ships
 * (no new upstream source, no AI, nothing to admit). The delete-variant
 * table is SymSpell-style, with per-term depth DERIVED from the ONE
 * edit-policy table (engine/src/intents/spelling.ts — the same exports the
 * runtime uses, imported rather than mirrored, so the two sides cannot
 * drift; eval cross-checks the shipped rows against a recomputation).
 *
 * Determinism: terms are inserted in code-unit sorted order and each term's
 * delete keys in code-unit sorted order, so the shipped bytes are a pure
 * function of the vocabulary — build twice, diff nothing.
 *
 * Layer-fingerprint feed: every spelling_terms row individually determines
 * which correction wins, so each row feeds the layer fingerprint as its own
 * length-delimited record (deliberately exceeding the count-only
 * translationTokens precedent — a count cannot see one term swapped for
 * another of equal count). The delete table is a pure function of the terms
 * plus the policy constants, so the policy constants are fed once and the
 * delete rows need no records of their own. The corpus fingerprint is
 * untouched: scripture text did not change.
 *
 * The pieces are exported separately (assemble → fingerprint → write)
 * because the curation workbench's candidate builder must REPRODUCE this
 * chain independently: a candidate mutates the concept lexicon, which feeds
 * this vocabulary, so the candidate rebuild and its reviewed expectation
 * both call these exact functions.
 *
 * The pipeline never "corrects" scripture text: nothing here rewrites a
 * verse, a token, or a posting. This module only PRECOMPUTES the lookup
 * tables; correction happens at query time, in the engine's intent layer,
 * on the fallible side only.
 */

import { createHash } from 'node:crypto';

import {
  deleteVariants,
  dictionaryDeleteDepth,
  SPELLING_EDIT1_MAX_TOKEN_LENGTH,
  SPELLING_MIN_TOKEN_LENGTH,
} from '@jestek-dev/scripture-engine';

/**
 * Minimal read-write SQLite surface. Unlike buildCorpus's write-only shape,
 * this build READS the vocabulary back out of the database it extends.
 */
export interface SqliteReadWriteStatement {
  run(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  get?(...params: unknown[]): unknown;
}
export interface SqliteReadWriteDatabase {
  exec(sql: string): unknown;
  prepare(sql: string): SqliteReadWriteStatement;
}

/** One vocabulary row, exactly as shipped in spelling_terms. */
export interface SpellingTermRow {
  readonly term: string;
  readonly documentCount: number;
  /** '+'-joined sorted origin set, e.g. "corpus+lexicon". */
  readonly origins: string;
}

/** The four vocabulary sources, before assembly. */
export interface SpellingVocabularySources {
  readonly corpusTokens: readonly { readonly term: string; readonly documentCount: number }[];
  readonly aliasKeys: readonly string[];
  /** Normalized lexicon strings; each is split on spaces into tokens. */
  readonly lexiconNormalized: readonly string[];
  readonly translationTokens: readonly string[];
}

export interface SpellingIndexResult {
  readonly termCount: number;
  readonly deleteRowCount: number;
  /** The updated layer fingerprint, already written into meta. */
  readonly layerFingerprint: string;
}

/** Reads the four vocabulary sources out of a built artifact database. */
export function readSpellingVocabularySources(
  database: SqliteReadWriteDatabase,
): SpellingVocabularySources {
  return {
    corpusTokens: (database
      .prepare('SELECT token AS term, SUM(document_count) AS df FROM token_stats GROUP BY token')
      .all() as { term: string; df: number }[]).map((row) => ({
      term: row.term,
      documentCount: Number(row.df),
    })),
    aliasKeys: (database.prepare('SELECT alias_key AS term FROM book_aliases').all() as {
      term: string;
    }[]).map((row) => row.term),
    lexiconNormalized: (database
      .prepare('SELECT DISTINCT normalized FROM concept_lexicon')
      .all() as { normalized: string }[]).map((row) => row.normalized),
    translationTokens: (database
      .prepare('SELECT DISTINCT token AS term FROM verse_translation_tokens')
      .all() as { term: string }[]).map((row) => row.term),
  };
}

/**
 * Assembles the vocabulary union: code-unit sorted term rows with merged,
 * sorted origins and the corpus document frequency (0 for vocabulary-only
 * origins). Pure and order-independent in its inputs.
 */
export function assembleSpellingVocabulary(
  sources: SpellingVocabularySources,
): readonly SpellingTermRow[] {
  const vocabulary = new Map<string, { documentCount: number; origins: Set<string> }>();
  const admit = (term: string, origin: string, documentCount = 0): void => {
    if (!term) return;
    const existing = vocabulary.get(term);
    if (existing) {
      existing.origins.add(origin);
      existing.documentCount = Math.max(existing.documentCount, documentCount);
    } else {
      vocabulary.set(term, { documentCount, origins: new Set([origin]) });
    }
  };
  for (const row of sources.corpusTokens) admit(row.term, 'corpus', row.documentCount);
  for (const key of sources.aliasKeys) admit(key, 'books');
  for (const normalized of sources.lexiconNormalized) {
    for (const token of normalized.split(' ')) admit(token, 'lexicon');
  }
  for (const token of sources.translationTokens) admit(token, 'translations');

  return [...vocabulary.keys()].sort().map((term) => {
    const row = vocabulary.get(term)!;
    return {
      term,
      documentCount: row.documentCount,
      origins: [...row.origins].sort().join('+'),
    };
  });
}

/**
 * The delete rows the policy derives for a term set: identity + deletes up
 * to dictionaryDeleteDepth(length) per term, in (term, key-sorted) insertion
 * order. Terms below length 4 contribute nothing — no in-policy typed token
 * can ever reach them.
 */
export function spellingDeleteRows(
  terms: readonly SpellingTermRow[],
): readonly { readonly deleteKey: string; readonly term: string }[] {
  const rows: { deleteKey: string; term: string }[] = [];
  for (const { term } of terms) {
    const depth = dictionaryDeleteDepth(term.length);
    if (depth === 0) continue;
    for (const key of deleteVariants(term, depth)) rows.push({ deleteKey: key, term });
  }
  return rows;
}

/**
 * Chains the layer fingerprint: previous identity, then the policy the
 * delete table was derived under, then every term record — length-delimited
 * like every other fingerprint feed in this pipeline.
 */
export function spellingLayerFingerprint(
  previousLayerFingerprint: string,
  terms: readonly SpellingTermRow[],
): string {
  const hash = createHash('sha256');
  const feed = (parts: readonly (string | number)[]): void => {
    const record = parts.join(' ');
    hash.update(String(record.length));
    hash.update(' ');
    hash.update(record);
  };
  feed(['spelling-base', previousLayerFingerprint]);
  feed(['spelling-policy', SPELLING_MIN_TOKEN_LENGTH, SPELLING_EDIT1_MAX_TOKEN_LENGTH]);
  for (const row of terms) feed(['s', row.term, row.documentCount, row.origins]);
  return hash.digest('hex');
}

/**
 * Builds (or rebuilds) the spelling tables and chains the layer fingerprint
 * into meta. Deletes any existing rows first so the candidate builder can
 * re-run it over a mutated copy; on a fresh artifact the deletes are no-ops.
 */
export function buildSpellingIndex(database: SqliteReadWriteDatabase): SpellingIndexResult {
  const terms = assembleSpellingVocabulary(readSpellingVocabularySources(database));
  const deletes = spellingDeleteRows(terms);

  const insertTerm = database.prepare(
    'INSERT INTO spelling_terms(term, document_count, origins) VALUES (?, ?, ?)',
  );
  const insertDelete = database.prepare(
    'INSERT INTO spelling_deletes(delete_key, term) VALUES (?, ?)',
  );
  database.exec('BEGIN');
  try {
    database.exec('DELETE FROM spelling_deletes; DELETE FROM spelling_terms;');
    for (const row of terms) insertTerm.run(row.term, row.documentCount, row.origins);
    for (const row of deletes) insertDelete.run(row.deleteKey, row.term);
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }

  const previous = (database
    .prepare("SELECT value FROM meta WHERE key = 'layer_fingerprint'")
    .all() as { value: string }[])[0]?.value ?? '';
  const layerFingerprint = spellingLayerFingerprint(previous, terms);
  database
    .prepare('INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)')
    .run('layer_fingerprint', layerFingerprint);

  return { termCount: terms.length, deleteRowCount: deletes.length, layerFingerprint };
}
