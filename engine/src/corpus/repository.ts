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

/** The longest verbatim fragment of a query that occurs in the corpus. */
export interface PhraseFragmentResult {
  /** The fragment that matched, as the user wrote it. */
  readonly fragment: string;
  /** Words in the fragment. */
  readonly fragmentWords: number;
  /** Words in the whole query — the denominator for partial-match strength. */
  readonly queryWords: number;
  readonly matches: readonly PhraseMatch[];
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
  /**
   * Identity of the curated layers. Empty string when an artifact has no
   * concept layer, which is a legitimate state (a v1 lexical-only artifact),
   * not a missing value.
   */
  readonly layerFingerprint: string;
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
      layerFingerprint: map.get('layer_fingerprint') ?? '',
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

/** Longest fragment length worth searching; below this, phrases are noise. */
const MIN_FRAGMENT_WORDS = 3;
/** Queries longer than this skip fragment search to bound query cost. */
const MAX_FRAGMENT_QUERY_WORDS = 14;

/**
 * Finds the LONGEST verbatim fragment of the query present in the corpus.
 *
 * Users paraphrase. "be doers of the word not hearers only" is nobody's
 * translation verbatim, but "doers of the word" is exactly James 1:22 — and
 * a search that only tries the whole query throws that away, leaving the
 * decision to weaker signals.
 *
 * Longest-first with early exit: the first fragment length that matches wins,
 * so we never pay for shorter, vaguer fragments once a strong one is found.
 * Strength is computed by the caller as fragmentWords / queryWords, which
 * makes partial verbatim evidence proportional to how much of the question it
 * actually answers — a full verbatim match still earns full authority.
 */
export async function searchLongestFragment(
  repository: CorpusRepository,
  query: string,
  limit = MAX_CANDIDATES,
): Promise<PhraseFragmentResult | null> {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length < MIN_FRAGMENT_WORDS || words.length > MAX_FRAGMENT_QUERY_WORDS) return null;

  for (let size = words.length; size >= MIN_FRAGMENT_WORDS; size -= 1) {
    for (let start = 0; start + size <= words.length; start += 1) {
      const fragment = words.slice(start, start + size).join(' ');
      const matches = await repository.searchPhrase(fragment, limit);
      if (matches.length > 0) {
        return { fragment, fragmentWords: size, queryWords: words.length, matches };
      }
    }
  }
  return null;
}

/** A concept whose lexicon matched the query. */
export interface ConceptMatchRow {
  readonly conceptId: string;
  readonly label: string;
  /** The author's original phrase that matched — shown, not the normalized form. */
  readonly matchedPhrase: string;
  /** Tokens in the matched phrase; longer phrases are more specific evidence. */
  readonly matchedTokenCount: number;
}

/** A verse named by a concept, with the source that named it. */
export interface ConceptAnchorRow extends ScriptureVerse {
  readonly conceptId: string;
  readonly conceptLabel: string;
  readonly sourceId: string;
  readonly weight: number;
  readonly locator: string | null;
  /**
   * The curated anchor's OWN span, carried through so results can be presented
   * as the passage a human named rather than as N separate verses.
   *
   * A ranged anchor emits one candidate per verse, and authoritative results
   * are exempt from group diversification by design — so `communion` returned
   * 1 Cor 11:23, :24, :25 and :26 as four identical-scoring results occupying
   * the whole top of the list. The span is the natural unit here because a
   * human chose it; nothing has to be inferred.
   */
  readonly anchorStartVerseId: number;
  readonly anchorEndVerseId: number;
}

/** A verse reached by a curated cross-reference edge. */
export interface CrossReferenceRow extends ScriptureVerse {
  readonly fromVerseId: number;
  readonly sourceId: string;
  readonly votes: number;
}

/**
 * Concept lookup and anchor expansion — Layer A at query time.
 *
 * Kept in the repository (not the intents module) because it is SQL; the
 * scoring decisions live in `intents/concept.ts` so they stay pure.
 */
export class ConceptRepository {
  constructor(private readonly database: ContentQueryPort) {}

  /**
   * Concepts whose lexicon phrase is fully contained in the query's tokens.
   *
   * Containment, not similarity: "hearing and doing" (tokens hear, do) fires
   * the concept because every token of the lexicon phrase is present. A
   * fuzzy threshold here would be a second, hidden ranking system competing
   * with the real one — the lexicon is curated precisely so matching can be
   * exact and explainable.
   */
  async matchConcepts(queryTokens: readonly string[]): Promise<readonly ConceptMatchRow[]> {
    const tokens = [...new Set(queryTokens)];
    if (tokens.length === 0) return [];
    const result = await this.database.execute(
      `SELECT cl.concept_id AS conceptId, c.label AS label,
              cl.phrase AS phrase, cl.normalized AS normalized, cl.token_count AS tokenCount
       FROM concept_lexicon cl
       JOIN concepts c ON c.id = cl.concept_id`,
    );
    const present = new Set(tokens);
    const best = new Map<string, ConceptMatchRow>();
    for (const row of result.rows) {
      const phraseTokens = str(row, 'normalized').split(' ').filter(Boolean);
      if (phraseTokens.length === 0) continue;
      if (!phraseTokens.every((token) => present.has(token))) continue;
      const candidate: ConceptMatchRow = {
        conceptId: str(row, 'conceptId'),
        label: str(row, 'label'),
        matchedPhrase: str(row, 'phrase'),
        matchedTokenCount: num(row, 'tokenCount'),
      };
      // Keep the most specific matching phrase per concept: a three-token
      // phrase matching is stronger evidence than a one-token one.
      const existing = best.get(candidate.conceptId);
      if (!existing || candidate.matchedTokenCount > existing.matchedTokenCount) {
        best.set(candidate.conceptId, candidate);
      }
    }
    return [...best.values()].sort((a, b) =>
      a.conceptId < b.conceptId ? -1 : a.conceptId > b.conceptId ? 1 : 0,
    );
  }

  /** Verses anchored by the given concepts. */
  async anchorVerses(conceptIds: readonly string[]): Promise<readonly ConceptAnchorRow[]> {
    const unique = [...new Set(conceptIds)];
    if (unique.length === 0) return [];
    const placeholders = unique.map(() => '?').join(', ');
    const result = await this.database.execute(
      `SELECT v.id AS id, v.verse_id AS verseId,
              v.translation_id AS translationId, t.code AS translationCode,
              v.book_id AS bookId, b.name AS bookName,
              v.chapter AS chapter, v.verse AS verse, v.text AS text,
              a.concept_id AS conceptId, c.label AS conceptLabel,
              a.source_id AS sourceId, a.weight AS weight, a.locator AS locator,
              a.start_verse_id AS anchorStartVerseId, a.end_verse_id AS anchorEndVerseId
       FROM concept_anchors a
       JOIN concepts c ON c.id = a.concept_id
       JOIN verses v ON v.verse_id BETWEEN a.start_verse_id AND a.end_verse_id
       JOIN translations t ON t.id = v.translation_id
       JOIN books b ON b.id = v.book_id
       WHERE a.concept_id IN (${placeholders})
       ORDER BY a.concept_id, v.verse_id, t.code`,
      unique,
    );
    return result.rows.map((row) => ({
      ...mapVerse(row),
      conceptId: str(row, 'conceptId'),
      conceptLabel: str(row, 'conceptLabel'),
      sourceId: str(row, 'sourceId'),
      weight: num(row, 'weight'),
      locator: typeof row['locator'] === 'string' ? row['locator'] : null,
      anchorStartVerseId: num(row, 'anchorStartVerseId'),
      anchorEndVerseId: num(row, 'anchorEndVerseId'),
    }));
  }

  /**
   * The reverse of anchorVerses: which curated concepts name THIS passage?
   *
   * Powers `related()`, whose contract is "what did a human connect to this
   * text", not "what resembles it". An anchor overlapping the passage at all
   * counts, because a concept anchored to James 1:22-25 is about James 1:23
   * even though it does not name that verse alone.
   */
  async conceptsAnchoring(
    startVerseId: number,
    endVerseId: number,
  ): Promise<readonly { conceptId: string; label: string }[]> {
    const result = await this.database.execute(
      `SELECT DISTINCT a.concept_id AS conceptId, c.label AS label
       FROM concept_anchors a
       JOIN concepts c ON c.id = a.concept_id
       WHERE a.start_verse_id <= ? AND a.end_verse_id >= ?
       ORDER BY a.concept_id`,
      [endVerseId, startVerseId],
    );
    return result.rows.map((row) => ({
      conceptId: str(row, 'conceptId'),
      label: str(row, 'label'),
    }));
  }

  /** Concepts one hop away in the curated graph. */
  async relatedConcepts(conceptIds: readonly string[]): Promise<readonly string[]> {
    const unique = [...new Set(conceptIds)];
    if (unique.length === 0) return [];
    const placeholders = unique.map(() => '?').join(', ');
    const result = await this.database.execute(
      `SELECT DISTINCT related_id AS relatedId FROM concept_related
       WHERE concept_id IN (${placeholders}) ORDER BY related_id`,
      unique,
    );
    return result.rows
      .map((row) => str(row, 'relatedId'))
      .filter((id) => !unique.includes(id));
  }

  /**
   * Verses reached by cross-reference from the given seed verses.
   *
   * Bounded per seed: an unbounded expansion would let one well-connected
   * verse flood the candidate set, which is precision erosion by another
   * name.
   */
  async expandCrossReferences(
    fromVerseIds: readonly number[],
    perSeedLimit = 5,
  ): Promise<readonly CrossReferenceRow[]> {
    const unique = [...new Set(fromVerseIds)];
    if (unique.length === 0) return [];
    const placeholders = unique.map(() => '?').join(', ');
    const result = await this.database.execute(
      `WITH ranked AS (
         SELECT x.from_verse_id AS fromVerseId, x.to_start_verse_id AS toStart,
                x.to_end_verse_id AS toEnd, x.source_id AS sourceId, x.votes AS votes,
                ROW_NUMBER() OVER (
                  PARTITION BY x.from_verse_id ORDER BY x.votes DESC, x.to_start_verse_id
                ) AS rn
         FROM cross_references x
         WHERE x.from_verse_id IN (${placeholders})
       )
       SELECT v.id AS id, v.verse_id AS verseId,
              v.translation_id AS translationId, t.code AS translationCode,
              v.book_id AS bookId, b.name AS bookName,
              v.chapter AS chapter, v.verse AS verse, v.text AS text,
              r.fromVerseId AS fromVerseId, r.sourceId AS sourceId, r.votes AS votes
       FROM ranked r
       JOIN verses v ON v.verse_id BETWEEN r.toStart AND r.toEnd
       JOIN translations t ON t.id = v.translation_id
       JOIN books b ON b.id = v.book_id
       WHERE r.rn <= ?
       ORDER BY r.votes DESC, v.verse_id, t.code`,
      [...unique, perSeedLimit],
    );
    return result.rows.map((row) => ({
      ...mapVerse(row),
      fromVerseId: num(row, 'fromVerseId'),
      sourceId: str(row, 'sourceId'),
      votes: num(row, 'votes'),
    }));
  }

  /** Highest observed vote count, used to normalize vote-derived strength. */
  async maxCrossReferenceVotes(): Promise<number> {
    const result = await this.database.execute(
      'SELECT COALESCE(MAX(votes), 0) AS maxVotes FROM cross_references',
    );
    return num(result.rows[0] ?? { maxVotes: 0 }, 'maxVotes');
  }

  /**
   * Verses whose pericope profile contains query terms (Layer B).
   *
   * Weak evidence by design and by budget: a preacher using a word while
   * expounding a passage is real signal about what the passage is ABOUT, but
   * it is a long way from the passage saying it. G6 caps it so no volume of
   * homiletical vocabulary can outrank a curated anchor or a verbatim quote.
   */
  async searchPassageTerms(
    terms: readonly string[],
    limit = 60,
  ): Promise<readonly (ScriptureVerse & {
    matchedTerms: readonly string[];
    pmiSum: number;
    sourceIds: string;
    minSpanVerses: number;
    locator: string;
  })[]> {
    const unique = [...new Set(terms)];
    if (unique.length === 0) return [];
    const placeholders = unique.map(() => '?').join(', ');
    const result = await this.database.execute(
      `WITH hits AS (
         SELECT vt.verse_id AS vid,
                group_concat(vt.term, ' ') AS terms,
                SUM(vt.pmi) AS pmiSum,
                MIN(vt.min_span_verses) AS minSpan,
                MIN(vt.source_ids) AS sourceIds,
                MIN(vt.locator) AS locator
         FROM verse_terms vt
         WHERE vt.term IN (${placeholders})
         GROUP BY vt.verse_id
       )
       SELECT v.id AS id, v.verse_id AS verseId,
              v.translation_id AS translationId, t.code AS translationCode,
              v.book_id AS bookId, b.name AS bookName,
              v.chapter AS chapter, v.verse AS verse, v.text AS text,
              h.terms AS terms, h.pmiSum AS pmiSum, h.minSpan AS minSpan,
              h.sourceIds AS sourceIds, h.locator AS locator
       FROM hits h
       JOIN verses v ON v.verse_id = h.vid
       JOIN translations t ON t.id = v.translation_id
       JOIN books b ON b.id = v.book_id
       ORDER BY h.pmiSum DESC, v.verse_id, t.code
       LIMIT ?`,
      [...unique, limit],
    );
    return result.rows.map((row) => ({
      ...mapVerse(row),
      matchedTerms: [...new Set(str(row, 'terms').split(' ').filter(Boolean))].sort(),
      pmiSum: num(row, 'pmiSum'),
      sourceIds: str(row, 'sourceIds'),
      minSpanVerses: num(row, 'minSpan'),
      locator: str(row, 'locator'),
    }));
  }

  async hasPassageTerms(): Promise<boolean> {
    const result = await this.database.execute(
      "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='verse_terms'",
    );
    return num(result.rows[0] ?? { n: 0 }, 'n') > 0;
  }

  async hasConceptLayer(): Promise<boolean> {
    const result = await this.database.execute(
      "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='concepts'",
    );
    return num(result.rows[0] ?? { n: 0 }, 'n') > 0;
  }
}
