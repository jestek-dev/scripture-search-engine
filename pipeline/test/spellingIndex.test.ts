/**
 * P5.4 / QR-5 — the precomputed spelling index (schema v7).
 *
 * What is pinned here: (1) the vocabulary is the stated union with origins
 * and corpus df; (2) the delete table is byte-for-byte a recomputation from
 * the ENGINE's own exported policy functions (one policy table, two sides
 * that cannot drift); (3) the build is byte-deterministic — same rows in,
 * same bytes and same fingerprint out, regardless of source-row order;
 * (4) every term row individually moves the layer fingerprint (the
 * per-record feed — a swap invisible to a count is visible here); and
 * (5) the curated_aliases DDL enforces the concept-XOR-verse-range
 * invariant from day one, while shipping empty.
 */

import { describe, expect, it } from 'vitest';

import { DatabaseSync } from 'node:sqlite';

import {
  deleteVariants,
  dictionaryDeleteDepth,
} from '@jestek-dev/scripture-engine';

import { buildSpellingIndex, type SqliteReadWriteDatabase } from '../src/buildSpellingIndex.js';
import { SCHEMA_SQL, SCHEMA_VERSION } from '../src/schema.js';

interface Seed {
  readonly tokenStats?: readonly (readonly [string, number])[];
  readonly aliases?: readonly string[];
  readonly lexicon?: readonly string[];
  readonly translationTokens?: readonly string[];
  readonly verseTerms?: readonly string[];
  readonly layerFingerprint?: string;
}

function seededDatabase(seed: Seed): DatabaseSync {
  const database = new DatabaseSync(':memory:');
  database.exec(SCHEMA_SQL);
  database.prepare("INSERT INTO translations(id, code, name, source_id, attribution_text, sha256, imported_at) VALUES (1, 'TST', 't', 't', 't', '0', 't')").run();
  for (const [token, df] of seed.tokenStats ?? []) {
    database.prepare('INSERT INTO token_stats(token, translation_id, document_count) VALUES (?, 1, ?)').run(token, df);
  }
  database.prepare("INSERT INTO books(id, name, testament, chapter_count) VALUES (1, 'Genesis', 'OT', 50)").run();
  for (const alias of seed.aliases ?? []) {
    database.prepare('INSERT INTO book_aliases(alias_key, book_id) VALUES (?, 1)').run(alias);
  }
  if ((seed.lexicon ?? []).length > 0) {
    database.prepare("INSERT INTO concepts(id, label) VALUES ('c1', 'C1')").run();
    for (const normalized of seed.lexicon ?? []) {
      database.prepare("INSERT INTO concept_lexicon(concept_id, phrase, normalized, token_count) VALUES ('c1', ?, ?, 1)").run(normalized, normalized);
    }
  }
  for (const token of seed.translationTokens ?? []) {
    database.prepare('INSERT INTO verse_translation_tokens(verse_id, token) VALUES (1001001, ?)').run(token);
  }
  for (const term of seed.verseTerms ?? []) {
    database
      .prepare(
        "INSERT INTO verse_terms(verse_id, term, pmi, count, source_ids, author_count, min_span_verses, locator) VALUES (1001001, ?, 2.5, 1, 's', 1, 1, 'l')",
      )
      .run(term);
  }
  if (seed.layerFingerprint !== undefined) {
    database.prepare("INSERT INTO meta(key, value) VALUES ('layer_fingerprint', ?)").run(seed.layerFingerprint);
  }
  return database;
}

const asPort = (database: DatabaseSync): SqliteReadWriteDatabase =>
  database as unknown as SqliteReadWriteDatabase;

function dumpTables(database: DatabaseSync): string {
  const terms = database.prepare('SELECT term, document_count, origins FROM spelling_terms ORDER BY term').all();
  const deletes = database.prepare('SELECT delete_key, term FROM spelling_deletes ORDER BY delete_key, term').all();
  return JSON.stringify({ terms, deletes });
}

const BASE: Seed = {
  tokenStats: [['strength', 37], ['pray', 60], ['forgiveness', 4], ['sin', 107]],
  aliases: ['genesis', 'gen'],
  lexicon: ['salvation', 'pray'],
  translationTokens: ['prosper'],
  // Layer B homiletical vocabulary — the fifth origin (round-2 fix): a word
  // the engine can answer via verse_terms evidence is IN vocabulary and the
  // OOV gate must never let it be corrected away.
  verseTerms: ['adoration', 'pray'],
  layerFingerprint: 'a'.repeat(64),
};

describe('buildSpellingIndex', () => {
  it('schema is v7', () => {
    expect(SCHEMA_VERSION).toBe('7');
  });

  it('builds the stated vocabulary union with origins and corpus df', () => {
    const database = seededDatabase(BASE);
    const result = buildSpellingIndex(asPort(database));
    const rows = database
      .prepare('SELECT term, document_count AS df, origins FROM spelling_terms ORDER BY term')
      .all() as { term: string; df: number; origins: string }[];
    expect(rows).toEqual([
      { term: 'adoration', df: 0, origins: 'verse_terms' },
      { term: 'forgiveness', df: 4, origins: 'corpus' },
      { term: 'gen', df: 0, origins: 'books' },
      { term: 'genesis', df: 0, origins: 'books' },
      { term: 'pray', df: 60, origins: 'corpus+lexicon+verse_terms' },
      { term: 'prosper', df: 0, origins: 'translations' },
      { term: 'salvation', df: 0, origins: 'lexicon' },
      { term: 'sin', df: 107, origins: 'corpus' },
      { term: 'strength', df: 37, origins: 'corpus' },
    ]);
    expect(result.termCount).toBe(9);
  });

  it('the delete table equals a recomputation from the engine-exported policy — the cross-check', () => {
    const database = seededDatabase(BASE);
    buildSpellingIndex(asPort(database));
    const shipped = database
      .prepare('SELECT delete_key, term FROM spelling_deletes ORDER BY term, delete_key')
      .all() as { delete_key: string; term: string }[];
    const expected: { delete_key: string; term: string }[] = [];
    const terms = database.prepare('SELECT term, origins FROM spelling_terms ORDER BY term').all() as {
      term: string;
      origins: string;
    }[];
    for (const { term, origins } of terms) {
      // Gate-only origins (verse_terms alone) contribute no delete rows: the
      // word is protected FROM correction, never proposed AS one.
      if (origins.split('+').every((origin) => origin === 'verse_terms')) continue;
      const depth = dictionaryDeleteDepth(term.length);
      if (depth === 0) continue;
      for (const key of deleteVariants(term, depth)) expected.push({ delete_key: key, term });
    }
    expected.sort((a, b) =>
      a.term !== b.term ? (a.term < b.term ? -1 : 1) : a.delete_key < b.delete_key ? -1 : 1,
    );
    expect(shipped).toEqual(expected);
    // 'sin' and 'gen' (length 3) contribute no delete rows: no in-policy
    // typed token can ever reach them.
    expect(shipped.some((row) => row.term === 'sin' || row.term === 'gen')).toBe(false);
    // 'adoration' (verse_terms-only, length 9) is GATE-ONLY: in
    // spelling_terms so the OOV gate protects it, but it ships no delete
    // rows — a typo can never be corrected INTO it. 'pray' (corpus+lexicon
    // AND verse_terms) keeps its target status through its other origins.
    expect(shipped.some((row) => row.term === 'adoration')).toBe(false);
    expect(shipped.some((row) => row.term === 'pray')).toBe(true);
  });

  it('is byte-deterministic: same rows in different insertion order, same bytes and fingerprint out', () => {
    const database = seededDatabase(BASE);
    const reversed = seededDatabase({
      ...BASE,
      tokenStats: [...BASE.tokenStats!].reverse(),
      aliases: [...BASE.aliases!].reverse(),
      lexicon: [...BASE.lexicon!].reverse(),
      verseTerms: [...BASE.verseTerms!].reverse(),
    });
    const first = buildSpellingIndex(asPort(database));
    const second = buildSpellingIndex(asPort(reversed));
    expect(dumpTables(database)).toBe(dumpTables(reversed));
    expect(first.layerFingerprint).toBe(second.layerFingerprint);
  });

  it('feeds the layer fingerprint per-record: one changed row moves it', () => {
    const base = seededDatabase(BASE);
    const changedDf = seededDatabase({
      ...BASE,
      tokenStats: [['strength', 38], ['pray', 60], ['forgiveness', 4], ['sin', 107]],
    });
    const extraTerm = seededDatabase({
      ...BASE,
      translationTokens: [...BASE.translationTokens!, 'plans'],
    });
    const baseResult = buildSpellingIndex(asPort(base));
    expect(buildSpellingIndex(asPort(changedDf)).layerFingerprint).not.toBe(
      baseResult.layerFingerprint,
    );
    expect(buildSpellingIndex(asPort(extraTerm)).layerFingerprint).not.toBe(
      baseResult.layerFingerprint,
    );
    // A term switching origin (equal count) is exactly what a count-only feed
    // cannot see — the per-record feed must.
    const swappedOrigin = seededDatabase({
      ...BASE,
      lexicon: ['salvation', 'prosper'],
      translationTokens: ['pray'],
    });
    expect(buildSpellingIndex(asPort(swappedOrigin)).layerFingerprint).not.toBe(
      baseResult.layerFingerprint,
    );
    // The fifth origin is fingerprint-visible too: the same word moving from
    // verse_terms into the lexicon (equal counts) must move the identity.
    const swappedVerseTermOrigin = seededDatabase({
      ...BASE,
      lexicon: ['salvation', 'pray', 'adoration'],
      verseTerms: ['pray'],
    });
    expect(buildSpellingIndex(asPort(swappedVerseTermOrigin)).layerFingerprint).not.toBe(
      baseResult.layerFingerprint,
    );
  });

  it('chains on the previous layer fingerprint and writes the result into meta', () => {
    const one = seededDatabase(BASE);
    const other = seededDatabase({ ...BASE, layerFingerprint: 'b'.repeat(64) });
    const first = buildSpellingIndex(asPort(one));
    const second = buildSpellingIndex(asPort(other));
    expect(first.layerFingerprint).not.toBe(second.layerFingerprint);
    const written = (one
      .prepare("SELECT value FROM meta WHERE key = 'layer_fingerprint'")
      .get() as { value: string }).value;
    expect(written).toBe(first.layerFingerprint);
  });

  it('curated_aliases ships empty and its DDL enforces concept XOR verse-range', () => {
    const database = seededDatabase(BASE);
    expect((database.prepare('SELECT COUNT(*) AS n FROM curated_aliases').get() as { n: number }).n).toBe(0);
    database.prepare("INSERT INTO concepts(id, label) VALUES ('c2', 'C2')").run();
    // Valid: concept target only.
    database
      .prepare("INSERT INTO curated_aliases(title, normalized_raw, concept_id, source_id, weight) VALUES ('t', 'a b', 'c2', 's', 1.0)")
      .run();
    // Valid: verse-range target only.
    database
      .prepare("INSERT INTO curated_aliases(title, normalized_raw, start_verse_id, end_verse_id, source_id, weight) VALUES ('t2', 'c d', 1001001, 1001002, 's', 1.0)")
      .run();
    // Invalid: both targets.
    expect(() =>
      database
        .prepare("INSERT INTO curated_aliases(title, normalized_raw, concept_id, start_verse_id, end_verse_id, source_id, weight) VALUES ('t3', 'e f', 'c2', 1001001, 1001002, 's', 1.0)")
        .run(),
    ).toThrow();
    // Invalid: neither target.
    expect(() =>
      database
        .prepare("INSERT INTO curated_aliases(title, normalized_raw, source_id, weight) VALUES ('t4', 'g h', 's', 1.0)")
        .run(),
    ).toThrow();
    // Invalid: half a range.
    expect(() =>
      database
        .prepare("INSERT INTO curated_aliases(title, normalized_raw, start_verse_id, source_id, weight) VALUES ('t5', 'i j', 1001001, 's', 1.0)")
        .run(),
    ).toThrow();
  });
});
