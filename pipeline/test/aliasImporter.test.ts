/**
 * P5.5 / QR-6 — the curated hymn/phrase alias importer and layer builder.
 *
 * What is pinned here: (1) every importer rejection class is a loud BUILD
 * ERROR (dangling concept, unparsable range, bare-word trigger, duplicate
 * key, missing provenance fields — an alias that silently does nothing or
 * silently does too much may not exist); (2) the normalized key comes from
 * the ENGINE's normalizedPhrase (one tokenizer, two sides that cannot
 * drift); (3) every alias row individually moves the layer fingerprint
 * (per-record feed — a phrase retargeted to another concept is invisible to
 * a count but visible here); (4) the build is byte-deterministic; and
 * (5) an EMPTY pack is a byte-level no-op, fingerprint included — the
 * rollback story for 0.13.0 without a schema bump.
 */

import { describe, expect, it } from 'vitest';

import { DatabaseSync } from 'node:sqlite';

import { normalizedPhrase } from '@jestek-dev/scripture-engine';

import {
  aliasLayerFingerprint,
  buildAliasLayer,
  chainAliasLayerFingerprint,
  readCuratedAliasRows,
} from '../src/buildAliasLayer.js';
import { compileHymnAliases, type CompiledAliasRow } from '../src/importers/aliasImporter.js';
import type { ManifestSet } from '../src/provenance/manifest.js';
import type { SqliteReadWriteDatabase } from '../src/buildSpellingIndex.js';
import { SCHEMA_SQL } from '../src/schema.js';

const KNOWN_CONCEPTS = new Set(['hope-in-god', 'prayer']);
const NO_LEXICON: readonly { conceptId: string; normalized: string }[] = [];

function pack(hymnsYaml: string): { name: string; contents: string } {
  return {
    name: 'test-pack.yaml',
    contents: `sourceId: hymn-aliases\nhymns:\n${hymnsYaml}`,
  };
}

const VALID_HYMN = `  - title: It Is Well with My Soul
    author: Horatio G. Spafford
    year: 1873
    provenance: "Gospel Hymns No. 2 (Biglow & Main, 1876)"
    concept: hope-in-god
    phrases:
      - phrase: it is well with my soul
      - phrase: when peace like a river
        weight: 0.9
`;

describe('compileHymnAliases', () => {
  it('compiles a valid pack: engine-normalized keys, locator format, sorted rows', () => {
    const result = compileHymnAliases([pack(VALID_HYMN)], KNOWN_CONCEPTS, NO_LEXICON);
    expect(result.errors).toEqual([]);
    expect(result.rows.map((row) => row.normalizedRaw)).toEqual([
      // Code-unit sorted, and each key is normalizedPhrase's output.
      'it is well with my soul',
      'when peace like a river',
    ]);
    expect(result.rows[0]!.normalizedRaw).toBe(normalizedPhrase('It is well, with my SOUL!'));
    expect(result.rows[0]!.locator).toBe('Horatio G. Spafford, "It Is Well with My Soul" (1873)');
    expect(result.rows[0]!.conceptId).toBe('hope-in-god');
    expect(result.rows[0]!.weight).toBe(1);
    expect(result.rows[1]!.weight).toBe(0.9);
    expect(result.citedSourceIds).toEqual(['hymn-aliases']);
  });

  it('compiles the verse-range arm through the ontology reference parser', () => {
    const result = compileHymnAliases(
      [
        pack(`  - title: The Solid Rock
    author: Edward Mote
    year: 1834
    provenance: "Hymns of Praise (1836)"
    range: 1 Peter 2:4-7
    phrases:
      - phrase: my hope is built on nothing less
`),
      ],
      KNOWN_CONCEPTS,
      NO_LEXICON,
    );
    expect(result.errors).toEqual([]);
    expect(result.rows[0]!.conceptId).toBeNull();
    expect(result.rows[0]!.startVerseId).toBe(60002004);
    expect(result.rows[0]!.endVerseId).toBe(60002007);
  });

  const rejects = (yaml: string, fragment: string) => {
    const result = compileHymnAliases([pack(yaml)], KNOWN_CONCEPTS, NO_LEXICON);
    expect(result.rows).toEqual([]);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.join('\n')).toContain(fragment);
  };

  it('rejects a missing sourceId', () => {
    const result = compileHymnAliases(
      [{ name: 'p.yaml', contents: 'hymns: []\n' }],
      KNOWN_CONCEPTS,
      NO_LEXICON,
    );
    expect(result.errors.join('\n')).toContain("missing required 'sourceId'");
  });

  it('rejects a hymn with no title', () => {
    rejects(
      `  - author: A\n    year: 1900\n    provenance: p\n    concept: prayer\n    phrases: [{phrase: what a friend we have}]\n`,
      "missing required 'title'",
    );
  });

  it('rejects missing PD provenance fields — author, integer year, provenance', () => {
    rejects(
      `  - title: T\n    year: 1900\n    provenance: p\n    concept: prayer\n    phrases: [{phrase: a b}]\n`,
      "missing required 'author'",
    );
    rejects(
      `  - title: T\n    author: A\n    year: "1900"\n    provenance: p\n    concept: prayer\n    phrases: [{phrase: a b}]\n`,
      "missing required integer 'year'",
    );
    rejects(
      `  - title: T\n    author: A\n    year: 1900\n    concept: prayer\n    phrases: [{phrase: a b}]\n`,
      "missing required 'provenance'",
    );
  });

  it('rejects the target XOR violations: both, and neither', () => {
    rejects(
      `  - title: T\n    author: A\n    year: 1900\n    provenance: p\n    concept: prayer\n    range: John 3:16\n    phrases: [{phrase: a b}]\n`,
      'exactly one of',
    );
    rejects(
      `  - title: T\n    author: A\n    year: 1900\n    provenance: p\n    phrases: [{phrase: a b}]\n`,
      'exactly one of',
    );
  });

  it('rejects an unknown concept — a dangling alias may not exist', () => {
    rejects(
      `  - title: T\n    author: A\n    year: 1900\n    provenance: p\n    concept: nope\n    phrases: [{phrase: a b}]\n`,
      "unknown concept 'nope'",
    );
  });

  it('rejects an unparsable range', () => {
    rejects(
      `  - title: T\n    author: A\n    year: 1900\n    provenance: p\n    range: Hezekiah 3:16\n    phrases: [{phrase: a b}]\n`,
      'not a canonical',
    );
  });

  it('rejects a hymn with no phrases, and a phrase that normalizes to nothing', () => {
    rejects(
      `  - title: T\n    author: A\n    year: 1900\n    provenance: p\n    concept: prayer\n`,
      'declares no phrases',
    );
    rejects(
      `  - title: T\n    author: A\n    year: 1900\n    provenance: p\n    concept: prayer\n    phrases: [{phrase: "!!!"}]\n`,
      'normalizes to nothing',
    );
  });

  it('rejects a bare-word trigger (the F5 class): fewer than two raw words', () => {
    rejects(
      `  - title: T\n    author: A\n    year: 1900\n    provenance: p\n    concept: prayer\n    phrases: [{phrase: fortress}]\n`,
      'fewer than two raw words',
    );
  });

  it('rejects a duplicate normalized key — one key, one claim — even across files', () => {
    const a = pack(VALID_HYMN);
    const b = {
      name: 'z-second.yaml',
      contents: `sourceId: hymn-aliases\nhymns:\n  - title: Another\n    author: B\n    year: 1901\n    provenance: p\n    concept: prayer\n    phrases:\n      - phrase: "It is WELL — with my soul"\n`,
    };
    const result = compileHymnAliases([a, b], KNOWN_CONCEPTS, NO_LEXICON);
    expect(result.errors.join('\n')).toContain('duplicates the normalized key');
    expect(result.errors.join('\n')).toContain('It Is Well with My Soul (test-pack.yaml)');
  });

  it('rejects an alias phrase reaching full lexicon parity with its OWN target concept (the double-chip hazard)', () => {
    // The critique's live-demonstrated worst case: "great is thy
    // faithfulness" aliased to a concept whose lexicon already carries
    // "great is your faithfulness" — thy/your are stopwords, so both
    // collapse to the same significant tokens and one query would stack a
    // full-parity Theme chip AND a hymn chip (80 authoritative points on
    // one curated fact, clearing exact_phrase's 60-point ceiling).
    const doctored = `  - title: Great Is Thy Faithfulness
    author: Thomas O. Chisholm
    year: 1923
    provenance: p
    concept: hope-in-god
    phrases: [{phrase: great is thy faithfulness}]
`;
    const lexicon = [{ conceptId: 'hope-in-god', normalized: 'great faithfulness' }];
    const result = compileHymnAliases([pack(doctored)], KNOWN_CONCEPTS, lexicon);
    expect(result.rows).toEqual([]);
    expect(result.errors.join('\n')).toContain('double-chips concept');
    expect(result.errors.join('\n')).toContain("'hope-in-god'");
    expect(result.errors.join('\n')).toContain('great faithfulness');
  });

  it('the guard is order-insensitive over the token SET, not the joined string', () => {
    const doctored = `  - title: T
    author: A
    year: 1900
    provenance: p
    concept: prayer
    phrases: [{phrase: faithfulness so great}]
`;
    // Lexicon stores `great faithfulness`; the alias tokenizes to
    // `faithfulness great`. Same set, same hazard, same rejection.
    const lexicon = [{ conceptId: 'prayer', normalized: 'great faithfulness' }];
    const result = compileHymnAliases([pack(doctored)], KNOWN_CONCEPTS, lexicon);
    expect(result.rows).toEqual([]);
    expect(result.errors.join('\n')).toContain('double-chips concept');
  });

  it('accepts the same phrase when the parity is with a DIFFERENT concept', () => {
    // Cross-concept stacking is two different claims (the engine's own
    // dedupe rule says so); only same-concept parity is one fact twice.
    const doctored = `  - title: Great Is Thy Faithfulness
    author: Thomas O. Chisholm
    year: 1923
    provenance: p
    concept: hope-in-god
    phrases: [{phrase: great is thy faithfulness}]
`;
    const lexicon = [{ conceptId: 'prayer', normalized: 'great faithfulness' }];
    const result = compileHymnAliases([pack(doctored)], KNOWN_CONCEPTS, lexicon);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
  });

  it('rejects a STRICT-SUPERSET alias too: containing the lexicon phrase still stacks ~63–76 same-family points', () => {
    // The critique's live superset repro: "great is thy faithfulness
    // tonight" tokenizes to a strict superset of the lexicon's
    // `great faithfulness`, so the query stacks the full-strength hymn chip
    // (40.00) on a coverage-discounted same-family Theme chip (22.86) —
    // 62.86 authoritative concept_anchor points on ONE curated fact,
    // clearing exact_phrase's 60-point ceiling. Same hole as set equality,
    // now refused structurally.
    const doctored = `  - title: Great Is Thy Faithfulness
    author: Thomas O. Chisholm
    year: 1923
    provenance: p
    concept: hope-in-god
    phrases: [{phrase: great is thy faithfulness tonight}]
`;
    const lexicon = [{ conceptId: 'hope-in-god', normalized: 'great faithfulness' }];
    const result = compileHymnAliases([pack(doctored)], KNOWN_CONCEPTS, lexicon);
    expect(result.rows).toEqual([]);
    expect(result.errors.join('\n')).toContain('double-chips concept');
    expect(result.errors.join('\n')).toContain('contain');
    expect(result.errors.join('\n')).toContain('great faithfulness');
  });

  it('rejects the real refrain-line superset: "great is thy faithfulness lord unto me"', () => {
    // Not contrived: the hymn's own refrain line is a strict superset of
    // the lexicon phrase — the exact next pack row the old set-equality
    // guard would have waved through.
    const doctored = `  - title: Great Is Thy Faithfulness
    author: Thomas O. Chisholm
    year: 1923
    provenance: p
    concept: prayer
    phrases: [{phrase: great is thy faithfulness lord unto me}]
`;
    const lexicon = [{ conceptId: 'prayer', normalized: 'great faithfulness' }];
    const result = compileHymnAliases([pack(doctored)], KNOWN_CONCEPTS, lexicon);
    expect(result.rows).toEqual([]);
    expect(result.errors.join('\n')).toContain('double-chips concept');
  });

  it('accepts a partial token overlap that is NOT containment — the lexicon phrase must fit inside the alias to double-chip', () => {
    // The lexicon phrase carries a token the alias lacks, so it can never
    // fully match the alias-equal query: the concept match stays a graded
    // independent claim, not the same fact at full authority twice.
    const doctored = `  - title: T
    author: A
    year: 1900
    provenance: p
    concept: prayer
    phrases: [{phrase: great is thy mercy}]
`;
    const lexicon = [{ conceptId: 'prayer', normalized: 'great faithfulness' }];
    const result = compileHymnAliases([pack(doctored)], KNOWN_CONCEPTS, lexicon);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
  });

  it('rejects a ONE-token set equality too: a bare-word lexicon twin still stacks 40 + 22 on one fact', () => {
    const doctored = `  - title: T
    author: A
    year: 1900
    provenance: p
    concept: prayer
    phrases: [{phrase: the assurance}]
`;
    const lexicon = [{ conceptId: 'prayer', normalized: 'assurance' }];
    const result = compileHymnAliases([pack(doctored)], KNOWN_CONCEPTS, lexicon);
    expect(result.rows).toEqual([]);
    expect(result.errors.join('\n')).toContain('double-chips concept');
  });

  it('the guard never touches the verse-range arm: no concept, no same-concept fact to double', () => {
    const doctored = `  - title: T
    author: A
    year: 1900
    provenance: p
    range: John 3:16
    phrases: [{phrase: great is thy faithfulness}]
`;
    const lexicon = [{ conceptId: 'prayer', normalized: 'great faithfulness' }];
    const result = compileHymnAliases([pack(doctored)], KNOWN_CONCEPTS, lexicon);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
  });

  it('rejects weights outside (0, 1]', () => {
    for (const weight of [0, -1, 1.5]) {
      rejects(
        `  - title: T\n    author: A\n    year: 1900\n    provenance: p\n    concept: prayer\n    phrases: [{phrase: a b, weight: ${weight}}]\n`,
        'weight must be in (0, 1]',
      );
    }
  });
});

const ROWS: readonly CompiledAliasRow[] = compileHymnAliases(
  [pack(VALID_HYMN)],
  KNOWN_CONCEPTS,
  NO_LEXICON,
).rows;

const MANIFESTS: ManifestSet = {
  sources: [
    {
      id: 'hymn-aliases',
      label: 'LH editorial (public-domain hymn index)',
      rightsClass: 'editorial',
      licenseRecord: 'test license record',
      sourceUrl: '',
      sha256: '',
      bytes: 0,
      maxTier: 'public_distribution',
    },
  ],
} as unknown as ManifestSet;

function aliasSeededDatabase(): DatabaseSync {
  const database = new DatabaseSync(':memory:');
  database.exec(SCHEMA_SQL);
  database
    .prepare("INSERT INTO concepts(id, label) VALUES ('hope-in-god', 'Hope')")
    .run();
  database
    .prepare("INSERT INTO meta(key, value) VALUES ('layer_fingerprint', 'prev-fp')")
    .run();
  return database;
}

describe('aliasLayerFingerprint', () => {
  it('every row field individually moves the fingerprint (per-record feed)', () => {
    const base = aliasLayerFingerprint('prev', ROWS);
    const mutations: ((row: CompiledAliasRow) => CompiledAliasRow)[] = [
      (row) => ({ ...row, conceptId: 'prayer' }),
      (row) => ({ ...row, weight: 0.5 }),
      (row) => ({ ...row, title: 'Other Title' }),
      (row) => ({ ...row, sourceId: 'other-source' }),
      (row) => ({ ...row, locator: 'Someone Else, "X" (1900)' }),
    ];
    for (const mutate of mutations) {
      const mutated = [mutate(ROWS[0]!), ...ROWS.slice(1)];
      expect(aliasLayerFingerprint('prev', mutated)).not.toBe(base);
    }
    // And the previous link matters: a different upstream identity never
    // collides into the same chained value.
    expect(aliasLayerFingerprint('other-prev', ROWS)).not.toBe(base);
  });
});

describe('buildAliasLayer', () => {
  it('an EMPTY pack is a byte-level no-op: fingerprint unchanged, no rows', () => {
    const database = aliasSeededDatabase();
    const result = buildAliasLayer(database as unknown as SqliteReadWriteDatabase, [], MANIFESTS);
    expect(result.aliasCount).toBe(0);
    expect(result.layerFingerprint).toBe('prev-fp');
    expect(readCuratedAliasRows(database as unknown as SqliteReadWriteDatabase)).toEqual([]);
    database.close();
  });

  it('builds deterministically: same rows in, same rows and fingerprint out, twice', () => {
    const database = aliasSeededDatabase();
    const first = buildAliasLayer(database as unknown as SqliteReadWriteDatabase, ROWS, MANIFESTS);
    const rowsAfterFirst = readCuratedAliasRows(database as unknown as SqliteReadWriteDatabase);
    // Restore the pre-alias fingerprint (the writer chained it) and rebuild
    // from the same inputs in reversed source order.
    database
      .prepare("INSERT OR REPLACE INTO meta(key, value) VALUES ('layer_fingerprint', 'prev-fp')")
      .run();
    const second = buildAliasLayer(
      database as unknown as SqliteReadWriteDatabase,
      [...ROWS].reverse(),
      MANIFESTS,
    );
    expect(second.layerFingerprint).toBe(first.layerFingerprint);
    expect(readCuratedAliasRows(database as unknown as SqliteReadWriteDatabase)).toEqual(
      rowsAfterFirst,
    );
    expect(first.aliasCount).toBe(ROWS.length);
    database.close();
  });

  it('runs G1 BEFORE writing: an uncited source fails the build and ships no rows', () => {
    const database = aliasSeededDatabase();
    expect(() =>
      buildAliasLayer(database as unknown as SqliteReadWriteDatabase, ROWS, { sources: [] }),
    ).toThrow(/provenance check failed/);
    expect(readCuratedAliasRows(database as unknown as SqliteReadWriteDatabase)).toEqual([]);
    expect(
      (database.prepare("SELECT value FROM meta WHERE key = 'layer_fingerprint'").get() as {
        value: string;
      }).value,
    ).toBe('prev-fp');
    database.close();
  });

  it('chainAliasLayerFingerprint reproduces the writer chain and no-ops on a rowless table', () => {
    const database = aliasSeededDatabase();
    // Rowless: the candidate-builder path over a pre-pack v7 base.
    const untouched = chainAliasLayerFingerprint(database as unknown as SqliteReadWriteDatabase);
    expect(untouched).toEqual({ aliasCount: 0, layerFingerprint: 'prev-fp' });

    const written = buildAliasLayer(database as unknown as SqliteReadWriteDatabase, ROWS, MANIFESTS);
    // Reset meta to the pre-alias link and re-chain from the stored rows —
    // exactly what buildCandidate does after buildSpellingIndex rewrites meta.
    database
      .prepare("INSERT OR REPLACE INTO meta(key, value) VALUES ('layer_fingerprint', 'prev-fp')")
      .run();
    const rechained = chainAliasLayerFingerprint(database as unknown as SqliteReadWriteDatabase);
    expect(rechained.layerFingerprint).toBe(written.layerFingerprint);
    expect(rechained.aliasCount).toBe(ROWS.length);
    database.close();
  });
});
