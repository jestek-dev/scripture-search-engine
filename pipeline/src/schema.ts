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
 * v1 — Phase 1: scripture corpus + FTS + token postings.
 * v2 — Phase 2: curated concept layer + cross-reference edges.
 * v3 — Phase 3: homiletical term profiles keyed by author span.
 * v4 — Layer B resolved to the verse: authors' spans project onto verses and
 *      corroboration is checked per verse, because authors do not chop
 *      Scripture into the same pieces (Maclaren's Psalm 23:1-6 essay vs
 *      Spurgeon's verse-by-verse notes never matched under exact span keys).
 * v7 — Phase 5 (QR-5, 0.12.0): precomputed spelling index
 *      (spelling_terms + spelling_deletes, built by buildSpellingIndex.ts)
 *      and curated_aliases, shipped EMPTY here and populated by QR-6
 *      (0.13.0, no schema bump — the concept-XOR-verse-range invariant lives
 *      in the DDL from day one). Schema slot per the 2026-08-20 plan's §2.2
 *      version-train decision: v7 = spelling, v8 = pericope.
 * v8 — Phase 5 (CO-3 PR 1, capability only): derived pericope tiling
 *      (pericopes table, built by buildPericopes.ts from OpenBible.info
 *      section counts). The engine READS it but nothing in discover() calls
 *      the read yet — ordering is bit-identical to v7 and the grouping
 *      behavior lands with ENGINE_VERSION 0.14.0 in PR 2.
 */
export const SCHEMA_VERSION = '8';

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

/*
 * ---- Layer A: the curated concept spine (schema v2) ----
 *
 * Concepts are reviewed data, authored as YAML in ontology/concepts and
 * compiled here. This is what lets the engine answer "hearing and doing"
 * with James 1:22 and SAY WHY, rather than hoping shared vocabulary happens
 * to land on the right verses.
 */
CREATE TABLE concepts (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

/*
 * Lexicon phrases, stored BOTH as the author wrote them and as normalized
 * tokens. The normalized form is what queries match against, so inflection
 * and archaic forms are handled by the same tokenizer as everything else;
 * the original is what findings and UI show, because a reader should never
 * have to translate 'hear do' back into what they typed.
 */
CREATE TABLE concept_lexicon (
  concept_id TEXT NOT NULL REFERENCES concepts(id),
  phrase TEXT NOT NULL,
  normalized TEXT NOT NULL,
  token_count INTEGER NOT NULL
);

CREATE INDEX idx_concept_lexicon_normalized ON concept_lexicon(normalized);

/*
 * Scripture a concept names. weight is a source-supplied PRIOR (OpenBible
 * vote share, editorial confidence) and is never a correctness label - the
 * ranker treats it as one input to strength, not as truth.
 */
CREATE TABLE concept_anchors (
  concept_id TEXT NOT NULL REFERENCES concepts(id),
  start_verse_id INTEGER NOT NULL,
  end_verse_id INTEGER NOT NULL,
  source_id TEXT NOT NULL,
  weight REAL NOT NULL,
  locator TEXT
);

CREATE INDEX idx_concept_anchors_concept ON concept_anchors(concept_id);
CREATE INDEX idx_concept_anchors_range ON concept_anchors(start_verse_id, end_verse_id);

CREATE TABLE concept_related (
  concept_id TEXT NOT NULL REFERENCES concepts(id),
  related_id TEXT NOT NULL,
  PRIMARY KEY (concept_id, related_id)
);

/*
 * Curated cross-reference edges. Verse-to-range, with the source that
 * asserted the edge and its vote count. Correlated sources share one budget
 * at scoring time (G7), which is why source_id travels with every row.
 */
CREATE TABLE cross_references (
  from_verse_id INTEGER NOT NULL,
  to_start_verse_id INTEGER NOT NULL,
  to_end_verse_id INTEGER NOT NULL,
  source_id TEXT NOT NULL,
  votes INTEGER NOT NULL
);

CREATE INDEX idx_cross_references_from ON cross_references(from_verse_id, votes DESC);

/*
 * ---- Layer B: homiletical evidence (schema v4) ----
 *
 * Distinctive vocabulary that expositors use when handling a verse. The
 * SOURCE PROSE IS NEVER STORED and never ships — only these distilled rows.
 *
 * Verse-keyed, not span-keyed. Each author's natural span was projected onto
 * the verses it covers at build time, and a term was admitted only where
 * enough independent sources covering that verse used it. min_span_verses
 * records the narrowest attesting span so scoring can prefer tight
 * commentary over diffuse commentary.
 */
CREATE TABLE verse_terms (
  verse_id INTEGER NOT NULL,
  term TEXT NOT NULL,
  pmi REAL NOT NULL,
  count INTEGER NOT NULL,
  source_ids TEXT NOT NULL,
  /* Distinct AUTHORS attesting the term — the corroboration count. Named
     for what it holds: source_ids lists volumes, and one author can supply
     several, so a 'source count' beside them would invite the reader to
     assume it counts those. */
  author_count INTEGER NOT NULL,
  min_span_verses INTEGER NOT NULL,
  locator TEXT NOT NULL
);

/*
 * Cross-translation vocabulary: word STEMS that appear in some other English
 * translation of a verse but not in the one shipped here.
 *
 * Why it exists: people search in the translation they learned a verse in.
 * "plans to prosper you" is NIV wording for Jeremiah 29:11 and finds nothing
 * against a text reading "thoughts of peace, and not of evil". This closes
 * that without shipping a second translation.
 *
 * What is stored is deliberately minimal: a stem, unordered, deduplicated,
 * merged across sources so no translation is separable, with no order, no
 * function words and no punctuation. It is an index over those works, not a
 * copy of any of them, and it cannot be reversed into one.
 */
CREATE TABLE verse_translation_tokens (
  verse_id INTEGER NOT NULL,
  token TEXT NOT NULL
);
CREATE INDEX idx_verse_translation_tokens_token ON verse_translation_tokens(token);
CREATE INDEX idx_verse_translation_tokens_verse ON verse_translation_tokens(verse_id);

CREATE INDEX idx_verse_terms_term ON verse_terms(term, pmi DESC);
CREATE INDEX idx_verse_terms_verse ON verse_terms(verse_id);

/*
 * ---- Deterministic cited spelling correction (schema v7, QR-5) ----
 *
 * The artifact's whole known-word vocabulary: corpus tokens ∪ book aliases ∪
 * lexicon tokens ∪ translation tokens ∪ verse terms (Layer B; gate-only —
 * a verse_terms-only word is protected from correction but contributes no
 * delete rows, so it is never proposed AS a correction), each row
 * carrying its origins. Doubles
 * as the runtime's OOV gate — a query token present here is IN vocabulary and
 * is NEVER corrected — and as the candidate roster the delete index proposes
 * from. document_count is the corpus df (summed over translations); 0 for
 * vocabulary-only origins. Built by buildSpellingIndex.ts from rows already
 * in this database: derived data, no new upstream source, fed per-record into
 * the layer fingerprint.
 */
CREATE TABLE spelling_terms (
  term TEXT PRIMARY KEY,
  document_count INTEGER NOT NULL,
  origins TEXT NOT NULL
);

/*
 * SymSpell-style precomputed delete variants: every string reachable from a
 * term by deleting up to dictionaryDeleteDepth(length) characters, INCLUDING
 * the term itself (the identity row is what lets a candidate reachable purely
 * by deleting from the QUERY side match). Depth is derived from the ONE
 * edit-policy table, never guessed — see engine/src/intents/spelling.ts. The
 * index only PROPOSES candidates; the runtime re-verifies every one with the
 * bounded integer Damerau DP before it may substitute.
 */
CREATE TABLE spelling_deletes (
  delete_key TEXT NOT NULL,
  term TEXT NOT NULL REFERENCES spelling_terms(term)
);

CREATE INDEX idx_spelling_deletes_key ON spelling_deletes(delete_key);

/*
 * Curated phrase/hymn aliases — SHIPPED EMPTY at v7, populated by QR-6
 * (0.13.0, no schema bump; the engine guards on a presence-and-rows probe).
 * The concept-XOR-verse-range invariant is in the DDL from day one: an alias
 * targets exactly one of a curated concept or an explicit verse range, never
 * both, never neither. normalized_raw is the whole-query EQUALITY key
 * (stopwords kept); title and locator surface verbatim in explanations, which
 * is why they are first-class columns rather than an opaque blob.
 */
CREATE TABLE curated_aliases (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  normalized_raw TEXT NOT NULL UNIQUE,
  concept_id TEXT REFERENCES concepts(id),
  start_verse_id INTEGER,
  end_verse_id INTEGER,
  source_id TEXT NOT NULL,
  weight REAL NOT NULL,
  locator TEXT,
  CHECK (
    (concept_id IS NOT NULL AND start_verse_id IS NULL AND end_verse_id IS NULL) OR
    (concept_id IS NULL AND start_verse_id IS NOT NULL AND end_verse_id IS NOT NULL)
  )
);

/*
 * Derived pericope tiling (schema v8, CO-3 PR 1). One row per pericope:
 * within each book the rows are disjoint, ordered, and tile every present
 * verse (invariants enforced by buildPericopes.ts, which derives them from
 * OpenBible.info candidate section spans at the reviewed boundary-vote
 * threshold plus forced book starts).
 *
 * boundary_votes is the SUMMED boundary vote at start_verse_id — how many of
 * the 20 surveyed translations' section placements start here, summed over
 * candidate spans sharing this start verse. It is a countable structural
 * fact, NEVER a relevance score, and never the per-row vote of one exact
 * span; it is stored so the engine's grouping explanation and the shipped
 * data cannot disagree.
 */
CREATE TABLE pericopes (
  start_verse_id INTEGER NOT NULL,
  end_verse_id INTEGER NOT NULL,
  boundary_votes INTEGER NOT NULL,
  source_id TEXT NOT NULL
);

CREATE INDEX idx_pericopes_range ON pericopes(start_verse_id, end_verse_id);
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
