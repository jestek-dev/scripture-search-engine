/**
 * TSK phrase re-mining importer (P6.3/B3 Phase A).
 *
 * Golden slices are REAL module bytes (test/fixtures/tsk-golden-slices.json,
 * copied verbatim from the pinned CrossWire module) so the parser is tested
 * against what the source actually prints, junk included. The full-module
 * census runs only where the gitignored source archive is on disk and pins
 * exact accepted/rejected counts, so a silent upstream format change fails
 * loudly rather than quietly shrinking the table.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  importTskText,
  parseTskEntryBody,
  type CrossReferencePhraseRow,
} from '../src/importers/tskImporter.js';
import { makeVerseId } from '../src/verseId.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const SLICES = JSON.parse(
  readFileSync(join(HERE, 'fixtures', 'tsk-golden-slices.json'), 'utf8'),
) as { entries: Record<string, string> };
const TSK_ZIP = join(HERE, '..', 'sources', 'TSK.zip');

interface ParseOutcome {
  readonly rows: CrossReferencePhraseRow[];
  readonly rejected: string[];
  readonly referenceLists: number;
  readonly synopsisLinks: number;
}

function parseSlice(key: string): ParseOutcome {
  const [book, chapter, verse] = key.split(':').map(Number) as [number, number, number];
  const rows: CrossReferencePhraseRow[] = [];
  const rejected: string[] = [];
  let referenceLists = 0;
  let synopsisLinks = 0;
  parseTskEntryBody(SLICES.entries[key]!, book, chapter, verse, {
    row: (row) => rows.push(row),
    reject: (reason) => rejected.push(reason),
    referenceList: () => { referenceLists += 1; },
    synopsisLink: () => { synopsisLinks += 1; },
  });
  return { rows, rejected, referenceLists, synopsisLinks };
}

function triple(row: CrossReferencePhraseRow): string {
  return `${row.normalizedPhrase} -> ${row.toStartVerseId}..${row.toEndVerseId}`;
}

describe('parseTskEntryBody (golden slices, real module bytes)', () => {
  it('Jeremiah 29:11 - phrase keys, book/chapter carryover, cross-chapter ranges', () => {
    const { rows, rejected, referenceLists } = parseSlice('24:29:11');
    expect(rejected).toEqual([]);
    expect(referenceLists).toBe(7);
    // 'I know.' normalizes to 'know' (the ONE tokenizer drops the stopword).
    const know = rows.filter((row) => row.normalizedPhrase === 'know');
    expect(know.map(triple)).toEqual([
      'know -> 18023013..18023013',   // Job 23:13
      'know -> 19033011..19033011',   // Ps 33:11
      'know -> 19040005..19040005',   // Ps 40:5 (chapter carryover inside Ps)
      'know -> 23046010..23046010',   // Isa 46:10
      'know -> 23046011..23046011',   // Isa 46:11 (comma verse list)
      'know -> 23055008..23055012',   // Isa 55:8-12 (the pending fixture's edge)
      'know -> 33004012..33004012',   // Mic 4:12
      'know -> 38001006..38001006',   // Zec 1:6
      'know -> 38008014..38008014',   // Zec 8:14 (second scripRef, same phrase)
      'know -> 38008015..38008015',
    ]);
    // 'thoughts.' resets the context to the ENTRY's book: bare '3:12-19'
    // reads as Jeremiah 3, and '31:1-33:26' spans chapters.
    const thoughts = rows.filter((row) => row.normalizedPhrase === 'thought');
    expect(thoughts[0]).toMatchObject({
      toStartVerseId: makeVerseId(24, 3, 12),
      toEndVerseId: makeVerseId(24, 3, 19),
    });
    expect(thoughts.map(triple)).toContain('thought -> 24031001..24033026');
    // 'expected end. Heb. end and expectation.' -> La 3:26 (the off-phrase
    // fixture's edge).
    const expected = rows.filter((row) => row.normalizedPhrase.startsWith('expect'));
    expect(expected.map(triple)).toEqual([
      `${expected[0]!.normalizedPhrase} -> ${makeVerseId(25, 3, 26)}..${makeVerseId(25, 3, 26)}`,
    ]);
    expect(rows.every((row) => row.fromVerseId === makeVerseId(24, 29, 11))).toBe(true);
  });

  it('James 1:22 - a NEW phrase resets the ref context to the entry itself', () => {
    const { rows, rejected } = parseSlice('59:1:22');
    expect(rejected).toEqual([]);
    // '4:17' under 'be.' reads as James 4:17 (entry book context).
    expect(rows[0]).toMatchObject({
      normalizedPhrase: '',
      toStartVerseId: makeVerseId(59, 4, 17),
    });
    // 'deceiving.' begins with bare '26' — James 1:26, NOT Revelation 22
    // where the previous phrase's list ended: the reset rule under test.
    const deceiving = rows.filter((row) => row.normalizedPhrase === 'deceiv');
    expect(deceiving[0]).toMatchObject({
      toStartVerseId: makeVerseId(59, 1, 26),
      toEndVerseId: makeVerseId(59, 1, 26),
    });
  });

  it('Matthew 1:1 - synopsis links are skipped and never become phrase keys', () => {
    const { rows, rejected, synopsisLinks } = parseSlice('40:1:1');
    expect(rejected).toEqual([]);
    expect(synopsisLinks).toBe(3);
    // No phrase key derived from the synopsis prose.
    const phrases = new Set(rows.map((row) => row.normalizedPhrase));
    expect([...phrases].some((phrase) => phrase.includes('genealogy'))).toBe(false);
    // 'the son of David.' resets to Mt: bare '9:27' is Matthew 9:27.
    const david = rows.filter((row) => row.normalizedPhrase === 'son david');
    expect(david[0]).toMatchObject({ toStartVerseId: makeVerseId(40, 9, 27) });
  });

  it('Matthew 1:3 - editorial asides are rejected AND reported, never silent', () => {
    const { rows, rejected } = parseSlice('40:1:3');
    expect(rejected).toHaveLength(1);
    expect(rejected[0]).toContain('editorial aside');
    expect(rejected[0]).toContain('Judah, Pharez, Zarah');
    // The parseable neighbours of the aside still land.
    expect(rows.map(triple)).toContain(`juda -> ${makeVerseId(1, 38, 27)}..${makeVerseId(1, 38, 27)}`);
  });

  it('is deterministic: same bytes, byte-identical triples', () => {
    const first = parseSlice('24:29:11');
    const second = parseSlice('24:29:11');
    expect(JSON.stringify(second.rows)).toBe(JSON.stringify(first.rows));
  });

  it('rejects unknown book tokens and out-of-extent references with named reasons', () => {
    const outcomeSink = (rows: CrossReferencePhraseRow[], rejected: string[]) => ({
      row: (row: CrossReferencePhraseRow) => rows.push(row),
      reject: (reason: string) => rejected.push(reason),
      referenceList: () => {},
      synopsisLink: () => {},
    });
    const rows: CrossReferencePhraseRow[] = [];
    const rejected: string[] = [];
    parseTskEntryBody(
      '<br />test.<br /><scripRef>Xyz 1:1; Ge 51:1; Heb 9:21-15; Ge 1:1</scripRef>',
      1, 1, 1,
      outcomeSink(rows, rejected),
    );
    expect(rejected).toHaveLength(3);
    expect(rejected[0]).toContain('unknown book token "Xyz"');
    expect(rejected[1]).toContain('outside KJV extents');
    expect(rejected[2]).toContain('inverted range');
    expect(rows.map(triple)).toEqual([`test -> ${makeVerseId(1, 1, 1)}..${makeVerseId(1, 1, 1)}`]);
  });
});

// ---- Layer wiring: insertion, per-record fingerprint feed, G1 citation, ----
// ---- and the empty-cross_references dump proof (v9 capability) ----

import { DatabaseSync } from 'node:sqlite';

import { buildConceptLayer } from '../src/buildConceptLayer.js';
import type { SqliteDatabase } from '../src/buildCorpus.js';
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
      id: 'tsk-text',
      label: 'Treasury of Scripture Knowledge (CrossWire module)',
      rightsClass: 'public_domain',
      licenseRecord: 'public domain by age',
      sourceUrl: 'https://example.invalid/tsk',
      sha256: 'a'.repeat(64),
      bytes: 1,
      maxTier: 'public_distribution',
    },
  ],
};

const JER_29_11 = makeVerseId(24, 29, 11);
const ISA_55_8 = makeVerseId(23, 55, 8);
const ISA_55_12 = makeVerseId(23, 55, 12);
const PETER_5_7 = makeVerseId(60, 5, 7);

function tinyLayer(
  phrases: readonly CrossReferencePhraseRow[] | undefined,
  manifests: ManifestSet = MANIFESTS,
  present: ReadonlySet<number> = new Set([PETER_5_7, JER_29_11, ISA_55_8, ISA_55_12]),
): {
  fingerprint: string;
  phraseRows: unknown[];
  crossReferenceDump: string;
  count: number;
  dropped: number;
} {
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
      ...(phrases === undefined ? {} : { crossReferencePhrases: phrases }),
      manifests,
      presentVerseIds: present,
    });
    const phraseRows = database
      .prepare(
        `SELECT from_verse_id, normalized_phrase, to_start_verse_id, to_end_verse_id, source_id
         FROM cross_reference_phrases ORDER BY from_verse_id, normalized_phrase`,
      )
      .all();
    const crossReferenceDump = JSON.stringify(
      database
        .prepare('SELECT * FROM cross_references ORDER BY from_verse_id, to_start_verse_id')
        .all(),
    );
    return {
      fingerprint: result.layerFingerprint,
      phraseRows,
      crossReferenceDump,
      count: result.crossReferencePhrases,
      dropped: result.droppedOutOfCorpus,
    };
  } finally {
    database.close();
  }
}

describe('buildConceptLayer TSK phrase wiring (P6.3/B3 Phase A, schema v9)', () => {
  const ROW: CrossReferencePhraseRow = {
    fromVerseId: JER_29_11,
    normalizedPhrase: 'know',
    toStartVerseId: ISA_55_8,
    toEndVerseId: ISA_55_12,
  };

  it('inserts shipped rows citing tsk-text and reports the count', () => {
    const { phraseRows, count } = tinyLayer([ROW]);
    expect(count).toBe(1);
    expect(phraseRows).toEqual([
      {
        from_verse_id: JER_29_11,
        normalized_phrase: 'know',
        to_start_verse_id: ISA_55_8,
        to_end_verse_id: ISA_55_12,
        source_id: 'tsk-text',
      },
    ]);
  });

  it('applies the cross_references presence filter: absent from-verse or absent target range drops the row', () => {
    const presentFromOnly = new Set([PETER_5_7, JER_29_11]);
    const droppedTarget = tinyLayer([ROW], MANIFESTS, presentFromOnly);
    expect(droppedTarget.count).toBe(0);
    expect(droppedTarget.dropped).toBe(1);
    const presentTargetOnly = new Set([PETER_5_7, ISA_55_8]);
    const droppedFrom = tinyLayer([ROW], MANIFESTS, presentTargetOnly);
    expect(droppedFrom.count).toBe(0);
    expect(droppedFrom.dropped).toBe(1);
  });

  it('feeds shipped phrases into the layer fingerprint PER-RECORD: build-twice identical, one phrase changed moves it', () => {
    const first = tinyLayer([ROW]);
    const second = tinyLayer([ROW]);
    expect(second.fingerprint).toBe(first.fingerprint);
    const perturbed = tinyLayer([{ ...ROW, normalizedPhrase: 'plan' }]);
    expect(perturbed.fingerprint).not.toBe(first.fingerprint);
    // A DROPPED row must not feed: filtering the target range out of the
    // corpus yields the same fingerprint as never offering the row.
    const presentFromOnly = new Set([PETER_5_7, JER_29_11]);
    expect(tinyLayer([ROW], MANIFESTS, presentFromOnly).fingerprint).toBe(
      tinyLayer([], MANIFESTS, presentFromOnly).fingerprint,
    );
  });

  it('is insertion-order independent: the per-record feed is sorted, not caller-ordered', () => {
    const other: CrossReferencePhraseRow = {
      fromVerseId: JER_29_11,
      normalizedPhrase: 'plan',
      toStartVerseId: ISA_55_8,
      toEndVerseId: ISA_55_8,
    };
    expect(tinyLayer([other, ROW]).fingerprint).toBe(tinyLayer([ROW, other]).fingerprint);
  });

  it('treats an omitted phrase input exactly as an empty one', () => {
    expect(tinyLayer(undefined).fingerprint).toBe(tinyLayer([]).fingerprint);
  });

  it('fails closed at G1 when phrase rows would ship without the tsk-text manifest', () => {
    const withoutTsk: ManifestSet = {
      sources: MANIFESTS.sources.filter((source) => source.id !== 'tsk-text'),
    };
    expect(() => tinyLayer([ROW], withoutTsk)).toThrow(/provenance|tsk-text/);
    // And an EMPTY phrase set must not demand the manifest.
    expect(() => tinyLayer([], withoutTsk)).not.toThrow();
  });

  it('EMPTY cross_references dump proof: mining phrases writes NOTHING into cross_references', () => {
    // The engine expands every cross_references row with no source filter,
    // so a tsk-text edge there would change ordering under a Phase A
    // capability-only framing. The dump must be byte-identical with and
    // without the mined rows — the only difference is the new v9 table.
    const withPhrases = tinyLayer([ROW]);
    const withoutPhrases = tinyLayer([]);
    expect(withPhrases.crossReferenceDump).toBe(withoutPhrases.crossReferenceDump);
    expect(withPhrases.phraseRows).toHaveLength(1);
    expect(withoutPhrases.phraseRows).toHaveLength(0);
  });
});

describe('importTskText (full pinned module census)', () => {
  const available = existsSync(TSK_ZIP);
  it.skipIf(!available)(
    'mines the exact census the admission recorded (skip reason: sources/TSK.zip not fetched)',
    () => {
      const directory = mkdtempSync(join(tmpdir(), 'tsk-census-'));
      try {
        execFileSync('unzip', ['-o', '-q', '-j', TSK_ZIP, 'modules/comments/*/*/*', '-d', directory]);
        const files = (name: string) => ({
          bzs: readFileSync(join(directory, `${name}.bzs`)),
          bzv: readFileSync(join(directory, `${name}.bzv`)),
          bzz: readFileSync(join(directory, `${name}.bzz`)),
        });
        const result = importTskText({ ot: files('ot'), nt: files('nt') });
        // Pinned against the admitted snapshot (sha256 6784c709...): any
        // drift in these numbers means the source or the parser changed.
        expect(result.entries).toBe(31090);
        expect(result.rows).toHaveLength(381553);
        expect(result.referenceLists).toBe(80021);
        expect(result.synopsisLinksSkipped).toBe(5289);
        expect(result.rejected).toHaveLength(1213);
        expect(result.duplicatesCollapsed).toBe(315);
        // The reject stream is dominated by TSK's own editorial asides;
        // everything else is a handful of upstream typos, all named.
        const asides = result.rejected.filter((reason) => reason.includes('editorial aside'));
        expect(asides).toHaveLength(1175);
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    },
  );
});
