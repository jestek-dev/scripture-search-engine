/**
 * P6.3 / B3 Phase A — TSK cross-reference phrase keys end to end against the
 * hermetic fixture artifact (schema v9; capability ONLY, no consuming
 * behavior until the Phase B ENGINE_VERSION bump behind J26/J55).
 *
 * What this file pins:
 * 1. the v9 artifact opens and carries a phrase table the engine can read
 *    (hasCrossReferencePhrases / crossReferencePhrasesFor), with the
 *    Jeremiah 29:11 golden triples intact end to end;
 * 2. the BIT-IDENTICAL proof the plan demands: dropping (or emptying) the
 *    cross_reference_phrases table changes NO research output for ANY query
 *    kind — deep-equal across discovery, alias-keyed, and reference
 *    queries — because Phase A ships zero consuming code paths;
 * 3. the EMPTY cross_references dump proof at artifact level: the shipped
 *    fixture has zero cross_references rows citing tsk-text (the engine
 *    expands every xref row with no source filter, so one such edge would
 *    make Phase A a behavior change), while every cross_reference_phrases
 *    row cites exactly tsk-text.
 */

import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { DatabaseSync } from 'node:sqlite';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';

import {
  CorpusRepository,
  createEngine,
  type ResearchResult,
} from '@jestek-dev/scripture-engine';
import { buildFixtureDatabase } from '../../pipeline/src/buildFixtureDb.js';

import { openCorpus } from '../src/nodeSqlitePort.js';

let fixtureDirectory: string;
let fixturePath: string;

const JER_29_11 = 24_029_011;

beforeAll(() => {
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'scripture-tsk-phrases-'));
  const built = buildFixtureDatabase(join(fixtureDirectory, `fixture-${process.pid}.db`));
  fixturePath = built.path;
});

afterAll(() => {
  rmSync(fixtureDirectory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
});

describe('schema v9 artifact carries a readable phrase table', () => {
  it('hasCrossReferencePhrases is true and the Jeremiah 29:11 golden triples round-trip', async () => {
    const port = openCorpus(fixturePath);
    const repository = new CorpusRepository(port);
    try {
      expect(await repository.hasCrossReferencePhrases()).toBe(true);
      const rows = await repository.crossReferencePhrasesFor([JER_29_11]);
      // Ordered by (from, phrase, start, end) — platform-stable iteration.
      expect(rows).toEqual([
        { fromVerseId: JER_29_11, normalizedPhrase: 'expect end heb expectation', toStartVerseId: 25_003_026, toEndVerseId: 25_003_026, sourceId: 'tsk-text' },
        { fromVerseId: JER_29_11, normalizedPhrase: 'know', toStartVerseId: 19_033_011, toEndVerseId: 19_033_011, sourceId: 'tsk-text' },
        { fromVerseId: JER_29_11, normalizedPhrase: 'know', toStartVerseId: 19_040_005, toEndVerseId: 19_040_005, sourceId: 'tsk-text' },
        { fromVerseId: JER_29_11, normalizedPhrase: 'know', toStartVerseId: 23_055_008, toEndVerseId: 23_055_012, sourceId: 'tsk-text' },
        { fromVerseId: JER_29_11, normalizedPhrase: 'thought', toStartVerseId: 23_040_001, toEndVerseId: 23_046_013, sourceId: 'tsk-text' },
        { fromVerseId: JER_29_11, normalizedPhrase: 'thought', toStartVerseId: 24_031_001, toEndVerseId: 24_033_026, sourceId: 'tsk-text' },
        { fromVerseId: JER_29_11, normalizedPhrase: 'thought', toStartVerseId: 33_007_014, toEndVerseId: 33_007_020, sourceId: 'tsk-text' },
      ]);
    } finally {
      await port.close();
    }
  });

  it('the min..max batch window never returns a from-verse nobody asked about', async () => {
    const port = openCorpus(fixturePath);
    const repository = new CorpusRepository(port);
    try {
      // Jer 29:10 and 29:12 bracket 29:11, whose rows must NOT leak in.
      const rows = await repository.crossReferencePhrasesFor([24_029_010, 24_029_012]);
      expect(rows.every((row) => row.fromVerseId !== JER_29_11)).toBe(true);
    } finally {
      await port.close();
    }
  });

  it('an empty ask is answered without touching the database', async () => {
    const port = openCorpus(fixturePath);
    const repository = new CorpusRepository(port);
    try {
      expect(await repository.crossReferencePhrasesFor([])).toEqual([]);
    } finally {
      await port.close();
    }
  });

  it('ordering is engine-defined: source_id breaks ties and non-ASCII phrases sort by UTF-16 code units, never the port collation', async () => {
    // LOW-1 hardening. Two probes in one doctored artifact:
    // 1. exact duplicates of a committed triple under bracketing source ids
    //    — a second phrase source tying on (from, phrase, start, end) must
    //    come back in source_id order, never platform-unspecified;
    // 2. U+10000 sorts BELOW U+FF01 in UTF-16 code units (surrogate range)
    //    but ABOVE it in UTF-8 bytes, so SQLite's BINARY collation would
    //    return the two non-ASCII rows reversed — pinning that engine code,
    //    not the port's SQL collation, defines the phrase ordering (the
    //    same comparison buildConceptLayer's fingerprint feed uses).
    const doctoredPath = join(fixtureDirectory, `doctored-ordering-${process.pid}.db`);
    copyFileSync(fixturePath, doctoredPath);
    const doctored = new DatabaseSync(doctoredPath);
    try {
      const insert = doctored.prepare(
        `INSERT INTO cross_reference_phrases(from_verse_id, normalized_phrase, to_start_verse_id,
                                             to_end_verse_id, source_id)
         VALUES (?, ?, ?, ?, ?)`,
      );
      insert.run(JER_29_11, 'know', 19_033_011, 19_033_011, 'aa-tie-source');
      insert.run(JER_29_11, 'know', 19_033_011, 19_033_011, 'zz-tie-source');
      insert.run(JER_29_11, '！ collation probe', 19_033_011, 19_033_011, 'tsk-text'); // U+FF01
      insert.run(JER_29_11, '\u{10000} collation probe', 19_033_011, 19_033_011, 'tsk-text');
    } finally {
      doctored.close();
    }
    const port = openCorpus(doctoredPath);
    const repository = new CorpusRepository(port);
    try {
      const rows = await repository.crossReferencePhrasesFor([JER_29_11]);
      expect(rows.map((row) => `${row.normalizedPhrase} | ${row.sourceId}`)).toEqual([
        'expect end heb expectation | tsk-text',
        'know | aa-tie-source',
        'know | tsk-text',
        'know | zz-tie-source',
        'know | tsk-text',
        'know | tsk-text',
        'thought | tsk-text',
        'thought | tsk-text',
        'thought | tsk-text',
        '\u{10000} collation probe | tsk-text',
        '！ collation probe | tsk-text', // U+FF01
      ]);
    } finally {
      await port.close();
    }
  });
});

describe('artifact-level empty cross_references dump proof', () => {
  it('zero cross_references rows cite tsk-text; every cross_reference_phrases row does', () => {
    const database = new DatabaseSync(fixturePath, { readOnly: true });
    try {
      const leaked = database
        .prepare("SELECT COUNT(*) AS n FROM cross_references WHERE source_id = 'tsk-text'")
        .get() as { n: number };
      expect(leaked.n).toBe(0);
      const phrases = database
        .prepare('SELECT COUNT(*) AS n, COUNT(DISTINCT source_id) AS sources FROM cross_reference_phrases')
        .get() as { n: number; sources: number };
      expect(phrases.n).toBeGreaterThan(0);
      const only = database
        .prepare('SELECT DISTINCT source_id AS sourceId FROM cross_reference_phrases')
        .all() as { sourceId: string }[];
      expect(only).toEqual([{ sourceId: 'tsk-text' }]);
    } finally {
      database.close();
    }
  });
});

describe('Phase A bit-identical proof: no query changes across the table drop', () => {
  const strip = (result: ResearchResult): unknown => JSON.parse(JSON.stringify(result));

  // EVERY kind on purpose — unlike the pericopes PR 2 test, Phase A ships
  // zero consuming behavior, so even ordinary discovery queries (including
  // the from-verse itself and its targets) must be deep-equal across the
  // drop. If any of these ever diverges, Phase A has leaked behavior.
  const queries = [
    'for I know the plans I have for you', // the pending fixture's query
    'hope and a future',
    'his loving kindness endures forever', // pericope-grouped discovery
    'peace',
    'it is well with my soul', // alias-keyed
    'John 3:16', // reference short-circuit
    'Jeremiah 29:11', // the from-verse itself
  ];

  it('dropping the cross_reference_phrases table changes NOTHING (the rollback)', async () => {
    const doctoredPath = join(fixtureDirectory, `doctored-no-phrases-${process.pid}.db`);
    copyFileSync(fixturePath, doctoredPath);
    const doctored = new DatabaseSync(doctoredPath);
    try {
      doctored.exec('DROP INDEX idx_cross_reference_phrases_from; DROP TABLE cross_reference_phrases;');
    } finally {
      doctored.close();
    }

    const withTable = await createEngine(openCorpus(fixturePath));
    const withoutTable = await createEngine(openCorpus(doctoredPath));
    try {
      for (const query of queries) {
        expect(strip(await withoutTable.research(query)), query).toEqual(
          strip(await withTable.research(query)),
        );
      }
    } finally {
      await withTable.close();
      await withoutTable.close();
    }

    const port = openCorpus(doctoredPath);
    const repository = new CorpusRepository(port);
    try {
      expect(await repository.hasCrossReferencePhrases()).toBe(false);
      // crossReferencePhrasesFor is deliberately NOT graceful about a
      // missing table: the probe is the guard (pericopesContaining
      // precedent), and a caller that skips it should fail loudly.
      expect(await repository.crossReferencePhrasesFor([])).toEqual([]);
      await expect(repository.crossReferencePhrasesFor([JER_29_11])).rejects.toThrow(
        /cross_reference_phrases/,
      );
    } finally {
      await port.close();
    }
  });

  it('an emptied table also reads as "no phrases" — the presence-and-rows probe', async () => {
    const doctoredPath = join(fixtureDirectory, `doctored-empty-phrases-${process.pid}.db`);
    copyFileSync(fixturePath, doctoredPath);
    const doctored = new DatabaseSync(doctoredPath);
    try {
      doctored.exec('DELETE FROM cross_reference_phrases;');
    } finally {
      doctored.close();
    }
    const port = openCorpus(doctoredPath);
    const repository = new CorpusRepository(port);
    try {
      expect(await repository.hasCrossReferencePhrases()).toBe(false);
    } finally {
      await port.close();
    }
  });
});
