/**
 * Corpus access. The only module that knows SQL.
 *
 * Ported from Maskil's `ScriptureRepository` and extended with the token
 * postings this engine adds. Everything here returns plain data; scoring
 * lives in `ranking/`, so the ranker stays pure and unit-testable without a
 * database.
 */

import {
  normalizeBookAlias,
  resolveReferenceAttempt,
  type ReferenceResolver,
  type ResolvedBook,
  type ResolvedReference,
} from '../reference/reference.js';
import type {
  ContentQueryPort,
  ContentScalar,
  ScripturePassage,
  ScriptureVerse,
} from '../types.js';

export const MAX_PHRASE_LENGTH = 500;
export const MAX_CANDIDATES = 200;

function num(row: Readonly<Record<string, ContentScalar>>, key: string): number {
  const value = row[key];
  if (typeof value !== 'number') throw new Error(`Corpus returned invalid numeric ${key}`);
  return value;
}

function str(row: Readonly<Record<string, ContentScalar>>, key: string): string {
  const value = row[key];
  if (typeof value !== 'string') throw new Error(`Corpus returned invalid text ${key}`);
  return value;
}

function mapVerse(row: Readonly<Record<string, ContentScalar>>): ScriptureVerse {
  return {
    id: num(row, 'id'),
    verseId: num(row, 'verseId'),
    translationId: num(row, 'translationId'),
    translationCode: str(row, 'translationCode'),
    bookId: num(row, 'bookId'),
    bookName: str(row, 'bookName'),
    chapter: num(row, 'chapter'),
    verse: num(row, 'verse'),
    text: str(row, 'text'),
  };
}

const VERSE_PROJECTION = `
  SELECT v.id AS id, v.verse_id AS verseId,
         v.translation_id AS translationId, t.code AS translationCode,
         v.book_id AS bookId, b.name AS bookName,
         b.chapter_count AS chapterCount,
         v.chapter AS chapter, v.verse AS verse, v.text AS text
  FROM verses v
  JOIN translations t ON t.id = v.translation_id
  JOIN books b ON b.id = v.book_id`;

/** One verse that matched a phrase query, with its bm25 relevance. */
export interface PhraseMatch extends ScriptureVerse {
  /** SQLite bm25: more negative is more relevant. Normalized by the caller. */
  readonly bm25: number;
}

/** One verse that matched at least one query token. */
export interface TokenMatch extends ScriptureVerse {
  /** Distinct query tokens present in this verse. */
  readonly matchedTokens: readonly string[];
  /** Sum of IDF over matched tokens — rare words contribute more. */
  readonly idfSum: number;
  /**
   * Smallest window (in raw word positions) containing all matched tokens.
   * Null when only one token matched, since a single point has no span.
   */
  readonly minSpan: number | null;
  /** Total significant tokens in this verse. */
  readonly tokenCount: number;
  /** Distinct significant tokens in this verse — the precision denominator. */
  readonly distinctTokenCount: number;
}

export interface CorpusMeta {
  readonly schemaVersion: string;
  readonly tokenizerVersion: string;
  readonly corpusFingerprint: string;
  readonly verseCount: number;
  /** Mean significant-token length per verse — the avgdl of length normalization. */
  readonly avgVerseTokens: number;
}

export class CorpusRepository implements ReferenceResolver {
  constructor(private readonly database: ContentQueryPort) {}

  async close(): Promise<void> {
    await this.database.close();
  }

  async readMeta(): Promise<CorpusMeta> {
    const result = await this.database.execute('SELECT key, value FROM meta');
    const map = new Map(result.rows.map((row) => [str(row, 'key'), str(row, 'value')]));
    const required = (key: string): string => {
      const value = map.get(key);
      if (value === undefined) throw new Error(`Corpus meta is missing ${key}`);
      return value;
    };
    return {
      schemaVersion: required('schema_version'),
      tokenizerVersion: required('tokenizer_version'),
      corpusFingerprint: required('corpus_fingerprint'),
      verseCount: Number(required('verse_count')),
      avgVerseTokens: Number(required('avg_verse_tokens')),
    };
  }

  /** Total indexed verses per translation — the N in IDF. */
  async documentCount(): Promise<number> {
    const result = await this.database.execute('SELECT COUNT(*) AS n FROM verses');
    return num(result.rows[0] ?? {}, 'n');
  }

  async resolveBookAlias(aliasKey: string): Promise<ResolvedBook | null> {
    const result = await this.database.execute(
      `SELECT b.id AS id, b.name AS name, b.chapter_count AS chapterCount
       FROM book_aliases a JOIN books b ON b.id = a.book_id
       WHERE a.alias_key = ? LIMIT 1`,
      [normalizeBookAlias(aliasKey)],
    );
    const row = result.rows[0];
    return row
      ? { id: num(row, 'id'), name: str(row, 'name'), chapterCount: num(row, 'chapterCount') }
      : null;
  }

  async getChapterVerseCount(bookId: number, chapter: number): Promise<number | null> {
    const result = await this.database.execute(
      'SELECT max(verse) AS verseCount FROM verses WHERE book_id = ? AND chapter = ?',
      [bookId, chapter],
    );
    const value = result.rows[0]?.verseCount;
    return typeof value === 'number' && value > 0 ? value : null;
  }

  async verseExists(bookId: number, chapter: number, verse: number): Promise<boolean> {
    const result = await this.database.execute(
      'SELECT 1 AS present FROM verses WHERE book_id = ? AND chapter = ? AND verse = ? LIMIT 1',
      [bookId, chapter, verse],
    );
    return result.rows.length > 0;
  }

  async resolveReference(input: string) {
    return await resolveReferenceAttempt(input, this);
  }

  async loadPassage(resolved: ResolvedReference): Promise<ScripturePassage> {
    const result = await this.database.execute(
      `${VERSE_PROJECTION}
       WHERE v.book_id = ? AND v.verse_id BETWEEN ? AND ?
       ORDER BY v.verse_id, t.code`,
      [resolved.book.id, resolved.startId, resolved.endId],
    );
    return {
      reference: resolved.label,
      bookId: resolved.book.id,
      chapterCount: resolved.book.chapterCount,
      startChapter: resolved.startChapter,
      endChapter: resolved.endChapter,
      verses: result.rows.map(mapVerse),
    };
  }

  /**
   * Exact phrase via FTS5, ranked by bm25.
   *
   * Runs against the RAW verse text, not our token stream, because "exact"
   * must mean exact — a user asking for a verbatim phrase does not want
   * stemming or archaic folding applied behind their back. The token intent
   * is where fuzziness is allowed, and it says so in its reason label.
   */
  async searchPhrase(phrase: string, limit = MAX_CANDIDATES): Promise<readonly PhraseMatch[]> {
    const normalized = phrase.trim().replace(/\s+/g, ' ');
    if (!normalized || normalized.length > MAX_PHRASE_LENGTH) return [];
    // Double-quote escaping makes the whole query one FTS5 string literal, so
    // user input can never be interpreted as FTS operators (NEAR, OR, *).
    const ftsPhrase = `"${normalized.replaceAll('"', '""')}"`;
    const result = await this.database.execute(
      `SELECT v.id AS id, v.verse_id AS verseId,
              v.translation_id AS translationId, t.code AS translationCode,
              v.book_id AS bookId, b.name AS bookName,
              v.chapter AS chapter, v.verse AS verse, v.text AS text,
              bm25(verses_fts) AS bm25
       FROM verses_fts f
       JOIN verses v ON v.id = f.rowid
       JOIN translations t ON t.id = v.translation_id
       JOIN books b ON b.id = v.book_id
       WHERE verses_fts MATCH ?
       ORDER BY bm25(verses_fts), v.verse_id, t.code
       LIMIT ?`,
      [ftsPhrase, limit],
    );
    return result.rows.map((row) => ({ ...mapVerse(row), bm25: num(row, 'bm25') }));
  }

  /**
   * Token search over precomputed postings.
   *
   * This is the intent that makes theme-ish queries work before any concept
   * layer exists: query tokens are folded by the same tokenizer the corpus
   * was indexed with, so "hearing and doing" reaches "heareth ... doeth".
   *
   * IDF is computed from stored document counts, which is why keeping common
   * words as tokens is safe — "do" earns a near-zero weight automatically
   * instead of needing a stopword list to predict its unimportance.
   */
  async searchTokens(
    tokens: readonly string[],
    documentCount: number,
    limit = MAX_CANDIDATES,
  ): Promise<readonly TokenMatch[]> {
    const unique = [...new Set(tokens)];
    if (unique.length === 0) return [];

    const placeholders = unique.map(() => '?').join(', ');
    const params: ContentScalar[] = [...unique, ...unique, limit];
    const result = await this.database.execute(
      `WITH matched AS (
         SELECT vt.verse_row_id AS rowId, vt.token AS token,
                MIN(vt.position) AS firstPos, MAX(vt.position) AS lastPos
         FROM verse_tokens vt
         WHERE vt.token IN (${placeholders})
         GROUP BY vt.verse_row_id, vt.token
       ),
       scored AS (
         SELECT m.rowId AS rowId,
                COUNT(*) AS tokenCount,
                MIN(m.firstPos) AS spanStart,
                MAX(m.lastPos) AS spanEnd,
                group_concat(m.token, ' ') AS tokens
         FROM matched m
         GROUP BY m.rowId
       )
       SELECT v.id AS id, v.verse_id AS verseId,
              v.translation_id AS translationId, t.code AS translationCode,
              v.book_id AS bookId, b.name AS bookName,
              v.chapter AS chapter, v.verse AS verse, v.text AS text,
              v.token_count AS verseTokenCount,
              v.distinct_token_count AS verseDistinctTokenCount,
              s.tokenCount AS tokenCount, s.tokens AS tokens,
              s.spanStart AS spanStart, s.spanEnd AS spanEnd,
              (SELECT COALESCE(SUM(ts.document_count), 0)
               FROM token_stats ts
               WHERE ts.translation_id = v.translation_id
                 AND ts.token IN (${placeholders})) AS dfSum
       FROM scored s
       JOIN verses v ON v.id = s.rowId
       JOIN translations t ON t.id = v.translation_id
       JOIN books b ON b.id = v.book_id
       ORDER BY s.tokenCount DESC, v.verse_id, t.code
       LIMIT ?`,
      params,
    );

    // IDF is applied here rather than in SQL: it needs per-token document
    // counts, and doing the arithmetic in TypeScript keeps the weighting
    // formula visible and testable instead of buried in a query.
    const stats = await this.tokenDocumentCounts(unique);
    return result.rows.map((row) => {
      const matchedTokens = str(row, 'tokens').split(' ').filter(Boolean);
      const distinct = [...new Set(matchedTokens)].sort();
      const idfSum = distinct.reduce((sum, token) => {
        const df = stats.get(token) ?? 0;
        // Smoothed IDF; +1 keeps a token appearing in every verse at weight 0
        // rather than negative, so ubiquity is worthless, never harmful.
        return sum + Math.log(1 + documentCount / Math.max(1, df));
      }, 0);
      const spanStart = num(row, 'spanStart');
      const spanEnd = num(row, 'spanEnd');
      return {
        ...mapVerse(row),
        matchedTokens: distinct,
        idfSum,
        minSpan: distinct.length > 1 ? spanEnd - spanStart : null,
        tokenCount: num(row, 'verseTokenCount'),
        distinctTokenCount: num(row, 'verseDistinctTokenCount'),
      };
    });
  }

  async tokenDocumentCounts(tokens: readonly string[]): Promise<ReadonlyMap<string, number>> {
    const unique = [...new Set(tokens)];
    if (unique.length === 0) return new Map();
    const placeholders = unique.map(() => '?').join(', ');
    const result = await this.database.execute(
      `SELECT token, SUM(document_count) AS df
       FROM token_stats WHERE token IN (${placeholders}) GROUP BY token`,
      unique,
    );
    return new Map(result.rows.map((row) => [str(row, 'token'), num(row, 'df')]));
  }
}
