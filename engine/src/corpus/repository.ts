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
  type BookAliasEntry,
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

/**
 * One derived pericope (schema v8, CO-3 PR 1). `boundaryVotes` is the
 * summed boundary vote at `startVerseId` — a countable structural fact
 * (how many of the 20 surveyed translations start a section there), never
 * a relevance score.
 */
export interface PericopeRow {
  readonly startVerseId: number;
  readonly endVerseId: number;
  readonly boundaryVotes: number;
  readonly sourceId: string;
}

/**
 * One mined cross-reference phrase triple (schema v9, B3 Phase A). The
 * `normalizedPhrase` is the tokenizer-normalized key of the TSK entry
 * fragment under which the reference was printed — a lookup key, never
 * displayed prose. Structural lineage only: the row says a curated source
 * printed this link under that phrase; it scores nothing by itself.
 */
export interface CrossReferencePhraseRow {
  readonly fromVerseId: number;
  readonly normalizedPhrase: string;
  readonly toStartVerseId: number;
  readonly toEndVerseId: number;
  readonly sourceId: string;
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

  /**
   * The alias vocabulary for the reference did-you-mean (0.11.0/QR-4),
   * fetched through the port once per repository instance and cached: ~270
   * rows that cannot change under a running engine (the artifact is
   * immutable), so re-reading them per query would be waste, and caching
   * keeps the engine's no-I/O covenant intact — the ONE read still goes
   * through ContentQueryPort.
   */
  private bookAliasCache: readonly BookAliasEntry[] | null = null;

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

  async listBookAliases(): Promise<readonly BookAliasEntry[]> {
    if (this.bookAliasCache) return this.bookAliasCache;
    const result = await this.database.execute(
      `SELECT a.alias_key AS aliasKey, b.id AS bookId, b.name AS bookName,
              b.chapter_count AS chapterCount
       FROM book_aliases a JOIN books b ON b.id = a.book_id
       ORDER BY a.alias_key`,
    );
    this.bookAliasCache = result.rows.map((row) => ({
      aliasKey: str(row, 'aliasKey'),
      bookId: num(row, 'bookId'),
      bookName: str(row, 'bookName'),
      chapterCount: num(row, 'chapterCount'),
    }));
    return this.bookAliasCache;
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

  /**
   * Whether this artifact carries the precomputed spelling index
   * (schema v7, 0.12.0/QR-5). Presence-probed like the other optional
   * layers: a v6 artifact simply has no tables, the probe returns false, and
   * the engine gracefully does not correct — behaving exactly as the
   * pre-spelling engine did. That probe IS the rollback story: rebuild the
   * artifact without the tables and behavior reverts with no engine change.
   */
  async hasSpellingIndex(): Promise<boolean> {
    try {
      const result = await this.database.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'spelling_terms'",
      );
      return result.rows.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Whether this artifact carries the derived pericope tiling (schema v8,
   * CO-3 PR 1). Presence-and-rows probed like the other optional layers: a
   * v7 artifact has no table, an emptied table disables the (future)
   * grouping step silently, and behavior reverts to pre-pericope output
   * with no engine change — the probe IS the rollback story.
   */
  async hasPericopes(): Promise<boolean> {
    try {
      const table = await this.database.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'pericopes'",
      );
      if (table.rows.length === 0) return false;
      const rows = await this.database.execute('SELECT 1 AS present FROM pericopes LIMIT 1');
      return rows.rows.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * The pericopes containing any of the given verse ids, batched as ONE
   * bounded query over the ranked window (G11): the window's min..max verse
   * span overlaps few pericopes, and the caller maps verses to rows. Rows
   * come back ordered by start verse for platform-stable iteration.
   *
   * NO CALL SITES in discover() yet (CO-3 PR 1 capability): the grouping
   * behavior that consumes this lands with the PR 2 ENGINE_VERSION bump.
   * boundaryVotes is the summed boundary vote at the pericope's start verse
   * — the countable fact the artifact stores, so a future explanation and
   * the shipped data cannot disagree.
   */
  async pericopesContaining(verseIds: readonly number[]): Promise<readonly PericopeRow[]> {
    const unique = [...new Set(verseIds)];
    if (unique.length === 0) return [];
    const result = await this.database.execute(
      `SELECT start_verse_id AS startVerseId, end_verse_id AS endVerseId,
              boundary_votes AS boundaryVotes, source_id AS sourceId
       FROM pericopes
       WHERE end_verse_id >= ? AND start_verse_id <= ?
       ORDER BY start_verse_id`,
      [Math.min(...unique), Math.max(...unique)],
    );
    const spans = result.rows.map((row) => ({
      startVerseId: num(row, 'startVerseId'),
      endVerseId: num(row, 'endVerseId'),
      boundaryVotes: num(row, 'boundaryVotes'),
      sourceId: str(row, 'sourceId'),
    }));
    // The min..max window can overlap pericopes containing none of the
    // asked-for verses; keep only real containers so the caller's mapping
    // stays honest.
    return spans.filter((span) =>
      unique.some((verseId) => verseId >= span.startVerseId && verseId <= span.endVerseId),
    );
  }

  /**
   * Whether this artifact carries the mined TSK cross-reference phrase keys
   * (schema v9, B3 Phase A). Presence-and-rows probed like pericopes: a v8
   * artifact has no table, an emptied table reads false, and (future)
   * phrase-labeled behavior reverts to plain cross_references output with no
   * engine change — the probe IS the rollback story.
   */
  async hasCrossReferencePhrases(): Promise<boolean> {
    try {
      const table = await this.database.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'cross_reference_phrases'",
      );
      if (table.rows.length === 0) return false;
      const rows = await this.database.execute(
        'SELECT 1 AS present FROM cross_reference_phrases LIMIT 1',
      );
      return rows.rows.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * The cross-reference phrase triples whose FROM verse is one of the given
   * verse ids, batched as ONE bounded query over the window's min..max span
   * (G11) and filtered back to the asked-for verses. Rows come back ordered
   * by (from, phrase, start, end, source) for platform-stable iteration —
   * sorted HERE, in engine code, by UTF-16 code units (the same comparison
   * buildConceptLayer's fingerprint feed uses), never by the port's SQL
   * collation: SQLite's BINARY collation compares UTF-8 bytes, which
   * disagrees with JS on some non-ASCII strings, and the ordering contract
   * must not depend on which side compares.
   *
   * NO CALL SITES in discover() yet (B3 Phase A capability): the labeling
   * and off-phrase-discount behavior that consumes this lands with the
   * Phase B ENGINE_VERSION bump behind J26/J55.
   */
  async crossReferencePhrasesFor(
    verseIds: readonly number[],
  ): Promise<readonly CrossReferencePhraseRow[]> {
    const unique = [...new Set(verseIds)];
    if (unique.length === 0) return [];
    const asked = new Set(unique);
    const result = await this.database.execute(
      `SELECT from_verse_id AS fromVerseId, normalized_phrase AS normalizedPhrase,
              to_start_verse_id AS toStartVerseId, to_end_verse_id AS toEndVerseId,
              source_id AS sourceId
       FROM cross_reference_phrases
       WHERE from_verse_id >= ? AND from_verse_id <= ?
       ORDER BY from_verse_id`,
      [Math.min(...unique), Math.max(...unique)],
    );
    // The min..max window can include from-verses nobody asked about; keep
    // only the asked-for ones so the caller's mapping stays honest.
    return result.rows
      .map((row) => ({
        fromVerseId: num(row, 'fromVerseId'),
        normalizedPhrase: str(row, 'normalizedPhrase'),
        toStartVerseId: num(row, 'toStartVerseId'),
        toEndVerseId: num(row, 'toEndVerseId'),
        sourceId: str(row, 'sourceId'),
      }))
      .filter((row) => asked.has(row.fromVerseId))
      // source_id joins the tie-break so two sources naming the same
      // (from, phrase, target) triple can never come back in
      // platform-unspecified order once a second phrase source exists.
      .sort(
        (a, b) =>
          a.fromVerseId - b.fromVerseId ||
          (a.normalizedPhrase < b.normalizedPhrase ? -1 : a.normalizedPhrase > b.normalizedPhrase ? 1 : 0) ||
          a.toStartVerseId - b.toStartVerseId ||
          a.toEndVerseId - b.toEndVerseId ||
          (a.sourceId < b.sourceId ? -1 : a.sourceId > b.sourceId ? 1 : 0),
      );
  }

  /**
   * Which of the given tokens exist in the artifact's spelling vocabulary
   * (corpus tokens ∪ book aliases ∪ lexicon tokens ∪ translation tokens ∪
   * Layer B verse terms).
   * This is the OOV gate's second half: a token with corpus df 0 that is
   * still a known name or curated word is IN vocabulary and never corrected.
   */
  async spellingTermsPresent(tokens: readonly string[]): Promise<ReadonlySet<string>> {
    const unique = [...new Set(tokens)];
    if (unique.length === 0) return new Set();
    const placeholders = unique.map(() => '?').join(', ');
    const result = await this.database.execute(
      `SELECT term FROM spelling_terms WHERE term IN (${placeholders})`,
      unique,
    );
    return new Set(result.rows.map((row) => str(row, 'term')));
  }

  /**
   * Dictionary terms whose precomputed delete variants intersect the given
   * keys — the SymSpell candidate lookup (0.12.0/QR-5). Proposes only: every
   * candidate is re-verified with the bounded Damerau DP before it may win
   * (see intents/spelling.ts). ORDER BY term for a platform-stable row order,
   * though the picker is proven row-order independent anyway.
   */
  async spellingCandidates(
    deleteKeys: readonly string[],
  ): Promise<readonly { term: string; documentCount: number }[]> {
    const unique = [...new Set(deleteKeys)];
    if (unique.length === 0) return [];
    const placeholders = unique.map(() => '?').join(', ');
    const result = await this.database.execute(
      `SELECT DISTINCT d.term AS term, t.document_count AS documentCount
       FROM spelling_deletes d
       JOIN spelling_terms t ON t.term = d.term
       WHERE d.delete_key IN (${placeholders})
       ORDER BY d.term`,
      unique,
    );
    return result.rows.map((row) => ({
      term: str(row, 'term'),
      documentCount: num(row, 'documentCount'),
    }));
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
 * One curated phrase/hymn alias (0.13.0/QR-6): a whole-query key mapping to
 * exactly one of a curated concept or an explicit verse range (the schema's
 * XOR CHECK). `title` and `locator` surface verbatim in the explanation chip
 * — the attribution IS the product here (covenant 6: the engine reports that
 * a named source connects this phrase to this target; it adjudicates
 * nothing).
 */
export interface CuratedAliasRow {
  readonly id: number;
  readonly title: string;
  readonly conceptId: string | null;
  /** Label of the target concept; null exactly when conceptId is null. */
  readonly conceptLabel: string | null;
  readonly startVerseId: number | null;
  readonly endVerseId: number | null;
  readonly sourceId: string;
  readonly weight: number;
  readonly locator: string | null;
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
  /**
   * Verses whose CROSS-TRANSLATION vocabulary matches the query.
   *
   * This is what lets someone search in the translation they learned a verse
   * in. The stems here appear in some English translation of the verse but not
   * in the one shipped, so a query using that wording reaches the verse
   * anyway. See pipeline/src/schema.ts for what is and is not stored.
   *
   * Ranked by how MANY query stems a verse accounts for, then by verse id. No
   * IDF weighting: these stems are already the residue after the shipped
   * wording is subtracted, so a stem appearing here is by construction
   * something the shipped text does not say.
   */
  async searchTranslationTokens(
    tokens: readonly string[],
    limit = 60,
  ): Promise<readonly (ScriptureVerse & { matchedTokens: readonly string[] })[]> {
    const unique = [...new Set(tokens)];
    if (unique.length === 0) return [];
    const placeholders = unique.map(() => '?').join(', ');
    const result = await this.database.execute(
      `WITH hits AS (
         SELECT vtt.verse_id AS vid,
                group_concat(vtt.token, ' ') AS tokens,
                COUNT(*) AS matched
         FROM verse_translation_tokens vtt
         WHERE vtt.token IN (${placeholders})
         GROUP BY vtt.verse_id
       )
       SELECT v.id AS id, v.verse_id AS verseId,
              v.translation_id AS translationId, t.code AS translationCode,
              v.book_id AS bookId, b.name AS bookName,
              v.chapter AS chapter, v.verse AS verse, v.text AS text,
              h.tokens AS tokens, h.matched AS matched
       FROM hits h
       JOIN verses v ON v.verse_id = h.vid
       JOIN translations t ON t.id = v.translation_id
       JOIN books b ON b.id = v.book_id
       ORDER BY h.matched DESC, v.verse_id, t.code
       LIMIT ?`,
      [...unique, limit],
    );
    return result.rows.map((row) => ({
      ...mapVerse(row),
      matchedTokens: [...new Set(str(row, 'tokens').split(' ').filter(Boolean))].sort(),
    }));
  }

  /** How many verses carry each stem — the df for weighting alternate wording. */
  async translationTokenDocumentCounts(
    tokens: readonly string[],
  ): Promise<ReadonlyMap<string, number>> {
    const unique = [...new Set(tokens)];
    if (unique.length === 0) return new Map();
    const placeholders = unique.map(() => '?').join(', ');
    const result = await this.database.execute(
      `SELECT token, COUNT(DISTINCT verse_id) AS n
       FROM verse_translation_tokens
       WHERE token IN (${placeholders})
       GROUP BY token`,
      unique,
    );
    return new Map(result.rows.map((row) => [str(row, 'token'), num(row, 'n')]));
  }

  /** Whether the artifact carries cross-translation vocabulary at all. */
  async hasTranslationTokens(): Promise<boolean> {
    try {
      const result = await this.database.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'verse_translation_tokens'",
      );
      return result.rows.length > 0;
    } catch {
      return false;
    }
  }

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

  /**
   * Whether this artifact carries any curated phrase/hymn aliases
   * (0.13.0/QR-6). Presence-AND-ROWS probed, deliberately stricter than the
   * other layer probes: schema v7 ships the table EMPTY (QR-5), and an
   * engine that ran the alias step against an empty table would pay a query
   * per research() call for nothing — and, more importantly, the rollback
   * story is "rebuild without alias rows", which must restore pre-QR-6
   * behavior exactly. No table, or an empty one, and 0.13.0 behaves as
   * 0.12.0 did.
   */
  async hasCuratedAliases(): Promise<boolean> {
    try {
      const table = await this.database.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'curated_aliases'",
      );
      if (table.rows.length === 0) return false;
      const rows = await this.database.execute('SELECT 1 AS present FROM curated_aliases LIMIT 1');
      return rows.rows.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * The curated aliases whose whole-query key equals the given normalized
   * phrase. EQUALITY, never containment — the line that keeps a curated
   * phrase table from becoming a hidden second ranking system; brittleness
   * to extra words is accepted BY DESIGN. `normalized_raw` is UNIQUE, so
   * this returns at most one row; it is typed as a list so the caller does
   * not encode that schema fact.
   */
  async matchAliases(normalizedQuery: string): Promise<readonly CuratedAliasRow[]> {
    if (!normalizedQuery) return [];
    const result = await this.database.execute(
      `SELECT a.id AS id, a.title AS title, a.concept_id AS conceptId,
              c.label AS conceptLabel,
              a.start_verse_id AS startVerseId, a.end_verse_id AS endVerseId,
              a.source_id AS sourceId, a.weight AS weight, a.locator AS locator
       FROM curated_aliases a
       LEFT JOIN concepts c ON c.id = a.concept_id
       WHERE a.normalized_raw = ?
       ORDER BY a.id`,
      [normalizedQuery],
    );
    return result.rows.map((row) => ({
      id: num(row, 'id'),
      title: str(row, 'title'),
      conceptId: typeof row['conceptId'] === 'string' ? row['conceptId'] : null,
      conceptLabel: typeof row['conceptLabel'] === 'string' ? row['conceptLabel'] : null,
      startVerseId: typeof row['startVerseId'] === 'number' ? row['startVerseId'] : null,
      endVerseId: typeof row['endVerseId'] === 'number' ? row['endVerseId'] : null,
      sourceId: str(row, 'sourceId'),
      weight: num(row, 'weight'),
      locator: typeof row['locator'] === 'string' ? row['locator'] : null,
    }));
  }

  /**
   * Verses of an explicit alias verse range (the XOR's other arm). A range
   * absent from this corpus returns no rows — the alias then contributes
   * nothing, honestly, rather than being guessed at.
   */
  async aliasRangeVerses(
    startVerseId: number,
    endVerseId: number,
  ): Promise<readonly ScriptureVerse[]> {
    const result = await this.database.execute(
      `SELECT v.id AS id, v.verse_id AS verseId,
              v.translation_id AS translationId, t.code AS translationCode,
              v.book_id AS bookId, b.name AS bookName,
              v.chapter AS chapter, v.verse AS verse, v.text AS text
       FROM verses v
       JOIN translations t ON t.id = v.translation_id
       JOIN books b ON b.id = v.book_id
       WHERE v.verse_id BETWEEN ? AND ?
       ORDER BY v.verse_id, t.code`,
      [startVerseId, endVerseId],
    );
    return result.rows.map(mapVerse);
  }

  async hasConceptLayer(): Promise<boolean> {
    const result = await this.database.execute(
      "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='concepts'",
    );
    return num(result.rows[0] ?? { n: 0 }, 'n') > 0;
  }
}
