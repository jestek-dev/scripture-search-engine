/**
 * Corpus schema for the shared engine.
 *
 * Derived from Maskil's proven `content-pipeline/src/schema.ts` (verse id
 * encoding, FTS5 external-content mirror, database-owned book aliases), but
 * versioned independently: this repo's artifact carries concept and
 * homiletical tables Maskil's never had, and Maskil's carries language data
 * (rhymes, thesaurus) that belongs to Maskil, not to Scripture search.
 *
 * Bump SCHEMA_VERSION for ANY shape change. The engine refuses to open an
 * artifact whose schema version it does not recognize, so a stale artifact
 * fails loudly instead of returning quietly wrong results.
 *
 * v1 — Phase 1: scripture corpus + FTS. Concept tables land in v2 (Phase 2),
 * pericopes and homiletical evidence in v3 (Phase 3).
 */
export const SCHEMA_VERSION = '1';

/**
 * `verses.id` (plain rowid) is the true primary key, NOT `verse_id`. The
 * BBCCCVVV `verse_id` is unique only WITHIN a translation — WEB and KJV share
 * a verse_id for the same verse by design — so uniqueness is enforced by
 * `UNIQUE(verse_id, translation_id)`. FTS5 external-content tables require a
 * genuine unique rowid, which is why the mirror keys on `id`.
 */
export const SCHEMA_SQL = `
CREATE TABLE meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE translations (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  source_id TEXT NOT NULL,
  attribution_text TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  imported_at TEXT NOT NULL
);

CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  testament TEXT NOT NULL,
  chapter_count INTEGER NOT NULL
);

CREATE TABLE book_aliases (
  alias_key TEXT PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id)
);

CREATE INDEX idx_book_aliases_book ON book_aliases(book_id);

CREATE TABLE verses (
  id INTEGER PRIMARY KEY,
  verse_id INTEGER NOT NULL,
  translation_id INTEGER NOT NULL REFERENCES translations(id),
  book_id INTEGER NOT NULL REFERENCES books(id),
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  -- Token lengths, for the precision term in token scoring. Without them a
  -- long verse that merely contains every query token ties with a short
  -- verse that is genuinely ABOUT them.
  token_count INTEGER NOT NULL,
  distinct_token_count INTEGER NOT NULL,
  UNIQUE(verse_id, translation_id)
);

CREATE INDEX idx_verses_lookup ON verses(translation_id, book_id, chapter, verse);
CREATE INDEX idx_verses_verse_id ON verses(verse_id);

CREATE VIRTUAL TABLE verses_fts USING fts5(
  text,
  content='verses',
  content_rowid='id',
  tokenize='unicode61'
);

/*
 * Precomputed token postings.
 *
 * FTS5 gives us phrase and bm25 search over the RAW text, which is exactly
 * right for exact-phrase intent. It cannot serve the token intent, because
 * FTS5's unicode61 tokenizer knows nothing about our stopwords, archaic
 * folding, or irregular lemmas — "hearing and doing" would never reach
 * "heareth ... doeth" through it.
 *
 * So token search runs over OUR tokenizer's output, precomputed here. The
 * artifact records TOKENIZER_VERSION and the engine refuses to open an
 * artifact tokenized by a different version, because a runtime that stems
 * differently than the build would compare mismatched vocabularies and
 * silently mis-rank.
 *
 * The position column is the index into the raw word sequence, so proximity scoring
 * measures real distance rather than distance-after-stopword-removal.
 */
CREATE TABLE verse_tokens (
  verse_row_id INTEGER NOT NULL REFERENCES verses(id),
  token TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE INDEX idx_verse_tokens_token ON verse_tokens(token, verse_row_id);
CREATE INDEX idx_verse_tokens_verse ON verse_tokens(verse_row_id);

/*
 * Document frequency per token, per translation. Precomputed so IDF is an
 * indexed lookup rather than a COUNT(DISTINCT) over the postings at query
 * time. This is also what makes it safe to keep common words like "do" as
 * tokens: their IDF contribution collapses toward zero automatically, rather
 * than requiring a stopword list to guess in advance which words matter.
 */
CREATE TABLE token_stats (
  token TEXT NOT NULL,
  translation_id INTEGER NOT NULL REFERENCES translations(id),
  document_count INTEGER NOT NULL,
  PRIMARY KEY (token, translation_id)
);
`;

/**
 * Populates the FTS mirror, excluding empty rows (an empty document in FTS is
 * noise, not a match target). One-shot batch insert rather than
 * trigger-maintained: the artifact is built fresh and shipped read-only, so
 * there is no ongoing mutation stream for triggers to intercept.
 */
export const POPULATE_FTS_SQL = `
INSERT INTO verses_fts(rowid, text)
SELECT id, text FROM verses WHERE trim(text) <> '';
`;

/** Derives token_stats from verse_tokens once all verses are imported. */
export const POPULATE_TOKEN_STATS_SQL = `
INSERT INTO token_stats(token, translation_id, document_count)
SELECT vt.token, v.translation_id, COUNT(DISTINCT vt.verse_row_id)
FROM verse_tokens vt
JOIN verses v ON v.id = vt.verse_row_id
GROUP BY vt.token, v.translation_id;
`;
