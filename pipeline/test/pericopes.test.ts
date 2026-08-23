/**
 * P5.6 (CO-3) PR 1 — importSectionCounts + buildPericopes.
 *
 * The golden slices below are VERBATIM rows from the pinned
 * bible-section-counts.txt snapshot (sha256 5e9e838d…, 2026-08-14 pin,
 * re-verified byte-identical 2026-08-22) — real data, kept hermetic by
 * embedding, because the full download is gitignored. They pin the exact
 * worked examples the 08-14 plan §7.9 names, including the sum-vs-per-row
 * distinction the explanation contract depends on.
 */

import { describe, expect, it } from 'vitest';

import {
  importSectionCounts,
  type SectionSpanRow,
} from '../src/importers/openbibleImporter.js';
import {
  BOUNDARY_VOTE_THRESHOLD,
  boundaryVotes,
  derivePericopes,
} from '../src/buildPericopes.js';

const HEADER =
  '#Start verse of section\tEnd verse of section\tVerse after end verse\tNumber of translations (20 possible) with this section\n';

/** Verbatim James 1 slice from the pinned snapshot. */
const JAMES_1 = `${HEADER}Jas.1.1\tJas.1.1\tJas.1.2\t12
Jas.1.1\tJas.1.27\tJas.2.1\t1
Jas.1.2\tJas.1.4\tJas.1.5\t1
Jas.1.2\tJas.1.8\tJas.1.9\t6
Jas.1.2\tJas.1.11\tJas.1.12\t2
Jas.1.2\tJas.1.12\tJas.1.13\t2
Jas.1.2\tJas.1.18\tJas.1.19\t6
Jas.1.2\tJas.1.27\tJas.2.1\t2
Jas.1.5\tJas.1.8\tJas.1.9\t1
Jas.1.9\tJas.1.11\tJas.1.12\t7
Jas.1.12\tJas.1.15\tJas.1.16\t2
Jas.1.12\tJas.1.18\tJas.1.19\t7
Jas.1.13\tJas.1.18\tJas.1.19\t2
Jas.1.16\tJas.1.18\tJas.1.19\t1
Jas.1.16\tJas.1.27\tJas.2.1\t1
Jas.1.19\tJas.1.20\tJas.1.21\t1
Jas.1.19\tJas.1.25\tJas.1.26\t2
Jas.1.19\tJas.1.27\tJas.2.1\t13
Jas.1.21\tJas.1.27\tJas.2.1\t1
Jas.1.26\tJas.1.27\tJas.2.1\t2
`;

/** Verbatim Psalm 136 and Genesis 11 slices from the pinned snapshot. */
const PSALM_136 = `${HEADER}Ps.136.1\tPs.136.26\tPs.137.1\t12\n`;
const GENESIS_11 = `${HEADER}Gen.11.1\tGen.11.9\tGen.11.10\t19
Gen.11.10\tGen.11.25\tGen.11.26\t1
Gen.11.10\tGen.11.26\tGen.11.27\t14
Gen.11.10\tGen.11.32\tGen.12.1\t4
Gen.11.26\tGen.11.32\tGen.12.1\t1
Gen.11.27\tGen.11.32\tGen.12.1\t14
`;

const verseId = (book: number, chapter: number, verse: number): number =>
  book * 1_000_000 + chapter * 1_000 + verse;

const chapterVerses = (book: number, chapter: number, count: number): Set<number> =>
  new Set(Array.from({ length: count }, (_, index) => verseId(book, chapter, index + 1)));

describe('importSectionCounts', () => {
  it('parses the real format with an asserted accepted-row count (a silent upstream change fails loudly)', () => {
    const { rows, report } = importSectionCounts(JAMES_1);
    expect(report).toEqual({ accepted: 20, rejected: 0, rejectionSamples: [] });
    expect(rows[0]).toEqual({
      startVerseId: verseId(59, 1, 1),
      endVerseId: verseId(59, 1, 1),
      votes: 12,
    });
    // End column is the END verse, never the Sankey verse-after-end.
    expect(rows[1]).toEqual({
      startVerseId: verseId(59, 1, 1),
      endVerseId: verseId(59, 1, 27),
      votes: 1,
    });
  });

  it('rejects and reports malformed rows: short rows, bad OSIS, non-positive and non-integer counts', () => {
    const bad = `${HEADER}Jas.1.1\tJas.1.2
NotABook.1.1\tJas.1.2\tJas.1.3\t5
Jas.1.1\tJas.1.2\tJas.1.3\t0
Jas.1.1\tJas.1.2\tJas.1.3\t-3
Jas.1.1\tJas.1.2\tJas.1.3\t2.5
Jas.1.1\tJas.1.2\tJas.1.3\tten
Jas.1.1\tJas.1.2\tJas.1.3\t7
`;
    const { rows, report } = importSectionCounts(bad);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.votes).toBe(7);
    expect(report.rejected).toBe(6);
    expect(report.rejectionSamples.length).toBeGreaterThan(0);
  });
});

describe('boundaryVotes — the sum, never the per-row vote', () => {
  it('James 1: summed boundary votes are 1:1→13, 1:2→19, 1:19→16 while the 1:19-27 ROW carries 13', () => {
    const { rows } = importSectionCounts(JAMES_1);
    const sums = boundaryVotes(rows);
    expect(sums.get(verseId(59, 1, 1))).toBe(13);
    expect(sums.get(verseId(59, 1, 2))).toBe(19);
    expect(sums.get(verseId(59, 1, 19))).toBe(16);
    const exactSpanRow = rows.find(
      (row) => row.startVerseId === verseId(59, 1, 19) && row.endVerseId === verseId(59, 1, 27),
    );
    expect(exactSpanRow?.votes).toBe(13);
  });
});

describe('derivePericopes — real-data golden slices', () => {
  it('pins the reviewed threshold: 10, a majority of the 20 surveyed translations', () => {
    expect(BOUNDARY_VOTE_THRESHOLD).toBe(10);
  });

  it('James 1 tiles [1:1, 1:2-18, 1:19-27] with summed votes 13/19/16', () => {
    const { rows } = importSectionCounts(JAMES_1);
    expect(derivePericopes(rows, chapterVerses(59, 1, 27))).toEqual([
      { startVerseId: verseId(59, 1, 1), endVerseId: verseId(59, 1, 1), boundaryVotes: 13 },
      { startVerseId: verseId(59, 1, 2), endVerseId: verseId(59, 1, 18), boundaryVotes: 19 },
      { startVerseId: verseId(59, 1, 19), endVerseId: verseId(59, 1, 27), boundaryVotes: 16 },
    ]);
  });

  it('Psalm 136 derives as a single pericope [136:1-26] at 12 — the fixture-guaranteed pericope-path instance', () => {
    const { rows } = importSectionCounts(PSALM_136);
    expect(derivePericopes(rows, chapterVerses(19, 136, 26))).toEqual([
      { startVerseId: verseId(19, 136, 1), endVerseId: verseId(19, 136, 26), boundaryVotes: 12 },
    ]);
  });

  it('Genesis 11 tiles [11:1-9, 11:10-26, 11:27-32] with 19/19/14 — the 14-vote break at v.27 most print Bibles make', () => {
    const { rows } = importSectionCounts(GENESIS_11);
    expect(derivePericopes(rows, chapterVerses(1, 11, 32))).toEqual([
      { startVerseId: verseId(1, 11, 1), endVerseId: verseId(1, 11, 9), boundaryVotes: 19 },
      { startVerseId: verseId(1, 11, 10), endVerseId: verseId(1, 11, 26), boundaryVotes: 19 },
      { startVerseId: verseId(1, 11, 27), endVerseId: verseId(1, 11, 32), boundaryVotes: 14 },
    ]);
  });

  it('threshold sensitivity: raising the threshold re-tiles (James 1 at 17 loses the 1:1 and 1:19 boundaries)', () => {
    const { rows } = importSectionCounts(JAMES_1);
    const tiled = derivePericopes(rows, chapterVerses(59, 1, 27), 17);
    // Only 1:2 (19) clears 17; 1:1 remains solely as the forced book start.
    expect(tiled).toEqual([
      { startVerseId: verseId(59, 1, 1), endVerseId: verseId(59, 1, 1), boundaryVotes: 13 },
      { startVerseId: verseId(59, 1, 2), endVerseId: verseId(59, 1, 27), boundaryVotes: 19 },
    ]);
  });

  it('forces a book start even when no translation marks it, carrying an honest zero', () => {
    const rows: SectionSpanRow[] = [
      { startVerseId: verseId(59, 1, 19), endVerseId: verseId(59, 1, 27), votes: 13 },
    ];
    const present = new Set([...chapterVerses(59, 1, 27)]);
    const tiled = derivePericopes(rows, present);
    expect(tiled[0]).toEqual({
      startVerseId: verseId(59, 1, 1),
      endVerseId: verseId(59, 1, 18),
      boundaryVotes: 0,
    });
  });

  it('never crosses a book even when votes are silent at the next book start', () => {
    const present = new Set([verseId(59, 1, 26), verseId(59, 1, 27), verseId(60, 1, 1)]);
    const tiled = derivePericopes([], present);
    expect(tiled).toEqual([
      { startVerseId: verseId(59, 1, 26), endVerseId: verseId(59, 1, 27), boundaryVotes: 0 },
      { startVerseId: verseId(60, 1, 1), endVerseId: verseId(60, 1, 1), boundaryVotes: 0 },
    ]);
  });

  it('tiles a PARTIAL chapter (fixture-corpus shape): boundaries at absent verses do not open pericopes', () => {
    const { rows } = importSectionCounts(JAMES_1);
    // Only 1:19-27 present: 1:19 is both the forced start and a live boundary.
    const present = new Set(
      Array.from({ length: 9 }, (_, index) => verseId(59, 1, 19 + index)),
    );
    expect(derivePericopes(rows, present)).toEqual([
      { startVerseId: verseId(59, 1, 19), endVerseId: verseId(59, 1, 27), boundaryVotes: 16 },
    ]);
  });

  it('is deterministic and row-order independent', () => {
    const { rows } = importSectionCounts(GENESIS_11);
    const present = chapterVerses(1, 11, 32);
    const forward = derivePericopes(rows, present);
    const reversed = derivePericopes([...rows].reverse(), present);
    const again = derivePericopes(rows, new Set([...present].reverse()));
    expect(reversed).toEqual(forward);
    expect(again).toEqual(forward);
  });

  it('an empty present set derives no pericopes and an empty row set still tiles', () => {
    expect(derivePericopes([], new Set())).toEqual([]);
    const present = chapterVerses(19, 136, 26);
    const tiled = derivePericopes([], present);
    expect(tiled).toEqual([
      { startVerseId: verseId(19, 136, 1), endVerseId: verseId(19, 136, 26), boundaryVotes: 0 },
    ]);
  });
});

// ---- Layer wiring: insertion, per-record fingerprint feed, G1 citation ----

import { DatabaseSync } from 'node:sqlite';

import { buildConceptLayer } from '../src/buildConceptLayer.js';
import type { SqliteDatabase } from '../src/buildCorpus.js';
import type { PericopeRow } from '../src/buildPericopes.js';
import { compileOntology } from '../src/importers/ontologyImporter.js';
import { SCHEMA_SQL } from '../src/schema.js';
import type { ManifestSet } from '../src/provenance/manifest.js';

const MANIFESTS: ManifestSet = {
  sources: [
    {
      id: 'editorial',
      label: 'LH editorial',
      rightsClass: 'editorial',
      licenseRecord: 'authored in-repo',
      sourceUrl: 'https://example.invalid/editorial',
      sha256: 'e'.repeat(64),
      bytes: 1,
      maxTier: 'public_distribution',
    },
    {
      id: 'openbible-sections',
      label: 'OpenBible.info Bible Section Counts',
      rightsClass: 'cc_by',
      licenseRecord: 'CC BY 4.0',
      sourceUrl: 'https://example.invalid/sections',
      sha256: 'a'.repeat(64),
      bytes: 1,
      maxTier: 'public_distribution',
    },
  ],
};

const PETER_5_7 = 60_005_007;

function tinyLayer(
  pericopes: readonly PericopeRow[] | undefined,
  manifests: ManifestSet = MANIFESTS,
): { fingerprint: string; pericopeRows: unknown[]; count: number } {
  const { ontology, errors } = compileOntology([
    {
      name: 'peace.yaml',
      contents: `id: peace-test
label: Peace Test
lexicon:
  - peace
anchors:
  - ref: 1 Peter 5:7
    sources: [editorial]
    weight: 0.85
`,
    },
  ]);
  expect(errors).toEqual([]);
  const database = new DatabaseSync(':memory:');
  try {
    database.exec(SCHEMA_SQL);
    const result = buildConceptLayer(database as unknown as SqliteDatabase, {
      ontology,
      topicRows: [],
      crossReferences: [],
      ...(pericopes === undefined ? {} : { pericopes }),
      manifests,
      presentVerseIds: new Set([PETER_5_7]),
    });
    const pericopeRows = database
      .prepare('SELECT start_verse_id, end_verse_id, boundary_votes, source_id FROM pericopes ORDER BY start_verse_id')
      .all();
    return { fingerprint: result.layerFingerprint, pericopeRows, count: result.pericopes };
  } finally {
    database.close();
  }
}

describe('buildConceptLayer pericope wiring (CO-3 PR 1)', () => {
  const ROW: PericopeRow = { startVerseId: PETER_5_7, endVerseId: PETER_5_7, boundaryVotes: 12 };

  it('inserts derived rows citing openbible-sections and reports the count', () => {
    const { pericopeRows, count } = tinyLayer([ROW]);
    expect(count).toBe(1);
    expect(pericopeRows).toEqual([
      { start_verse_id: PETER_5_7, end_verse_id: PETER_5_7, boundary_votes: 12, source_id: 'openbible-sections' },
    ]);
  });

  it('feeds pericopes into the layer fingerprint PER-RECORD: build-twice identical, one vote changed moves it', () => {
    const first = tinyLayer([ROW]);
    const second = tinyLayer([ROW]);
    expect(second.fingerprint).toBe(first.fingerprint);
    const perturbed = tinyLayer([{ ...ROW, boundaryVotes: 13 }]);
    expect(perturbed.fingerprint).not.toBe(first.fingerprint);
  });

  it('treats an omitted pericope input exactly as an empty one', () => {
    expect(tinyLayer(undefined).fingerprint).toBe(tinyLayer([]).fingerprint);
  });

  it('fails closed at G1 when pericope rows would ship without the openbible-sections manifest', () => {
    const withoutSections: ManifestSet = {
      sources: MANIFESTS.sources.filter((source) => source.id !== 'openbible-sections'),
    };
    expect(() => tinyLayer([ROW], withoutSections)).toThrow(/provenance|openbible-sections/);
    // And an EMPTY pericope set must not demand the manifest.
    expect(() => tinyLayer([], withoutSections)).not.toThrow();
  });
});
