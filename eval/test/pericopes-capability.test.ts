/**
 * P5.6 / CO-3 — pericopes end to end against the hermetic fixture artifact
 * (schema v8; engine 0.14.0 consumes the tiling since PR 2).
 *
 * What this file pins:
 * 1. the v8 artifact opens and carries a pericope tiling the engine can
 *    read (hasPericopes / pericopesContaining), with the James 1 golden
 *    tiling and its SUMMED boundary votes intact end to end;
 * 2. the PR 2 behavior is REAL and attributable: the Psalm 136 refrain
 *    query surfaces ONE passage-level row whose grouping cites
 *    'openbible-sections' and the artifact's own stored boundary vote;
 * 3. the rollback story: dropping (or emptying) the pericopes table
 *    reverts the pericope path exactly — grouped pericope rows fall back
 *    to individual verses, queries the pericope path never touched stay
 *    byte-identical, and no grouping cites 'openbible-sections' anywhere.
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

const JAS = (verse: number): number => 59_001_000 + verse;

beforeAll(() => {
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'scripture-pericopes-'));
  const built = buildFixtureDatabase(join(fixtureDirectory, `fixture-${process.pid}.db`));
  fixturePath = built.path;
});

afterAll(() => {
  rmSync(fixtureDirectory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
});

describe('schema v8 artifact carries a readable pericope tiling', () => {
  it('hasPericopes is true and the James 1 golden tiling round-trips with SUMMED votes', async () => {
    const port = openCorpus(fixturePath);
    const repository = new CorpusRepository(port);
    try {
      expect(await repository.hasPericopes()).toBe(true);
      const spans = await repository.pericopesContaining([JAS(1), JAS(10), JAS(27)]);
      expect(spans).toEqual([
        { startVerseId: JAS(1), endVerseId: JAS(1), boundaryVotes: 13, sourceId: 'openbible-sections' },
        { startVerseId: JAS(2), endVerseId: JAS(18), boundaryVotes: 19, sourceId: 'openbible-sections' },
        { startVerseId: JAS(19), endVerseId: JAS(27), boundaryVotes: 16, sourceId: 'openbible-sections' },
      ]);
    } finally {
      await port.close();
    }
  });

  it('the min..max batch window never returns a pericope containing none of the asked verses', async () => {
    const port = openCorpus(fixturePath);
    const repository = new CorpusRepository(port);
    try {
      // 1:1 and 1:27 span the whole chapter, but 1:2-18 contains neither.
      const spans = await repository.pericopesContaining([JAS(1), JAS(27)]);
      expect(spans.map((span) => span.startVerseId)).toEqual([JAS(1), JAS(19)]);
    } finally {
      await port.close();
    }
  });

  it('an empty ask is answered without touching the database', async () => {
    const port = openCorpus(fixturePath);
    const repository = new CorpusRepository(port);
    try {
      expect(await repository.pericopesContaining([])).toEqual([]);
    } finally {
      await port.close();
    }
  });
});

describe('PR 2 behavior + the drop-the-table rollback', () => {
  const strip = (result: ResearchResult): unknown =>
    JSON.parse(JSON.stringify(result));

  it('the Psalm 136 refrain groups into one passage row citing openbible-sections and the stored vote', async () => {
    const engine = await createEngine(openCorpus(fixturePath));
    try {
      const result = await engine.research('his loving kindness endures forever');
      expect(result.kind).toBe('discovery');
      if (result.kind !== 'discovery') return;
      const merged = result.results.find((row) => row.reference === 'Psalms 136:1-26');
      expect(merged).toBeDefined();
      // The measured-effect attribution instance the plan demands: grouping
      // produced by the pericope path ITSELF, not the anchor collapse.
      expect(merged!.grouping?.provenance.sourceId).toBe('openbible-sections');
      // The cited number is the SUMMED boundary vote the artifact stores at
      // 136:1 — explanation and shipped data cannot disagree.
      expect(merged!.grouping?.provenance.boundaryVotes).toBe(12);
      expect(merged!.grouping?.section).toEqual({
        reference: 'Psalms 136:1-26',
        startVerseId: 19_136_001,
        endVerseId: 19_136_026,
      });
      // Every verse's own evidence stays visible, and no OTHER row spends a
      // slot on a Psalm 136 fragment.
      expect(merged!.verses).toHaveLength(26);
      expect(
        result.results.filter((row) => row.reference.startsWith('Psalms 136')),
      ).toHaveLength(1);
      // Grouping contributes zero points: the merged score is the max of the
      // members (a whole-query exact-phrase hit), never a sum above it.
      expect(merged!.score).toBe(Math.max(...merged!.verses!.map((v) => v.score)));
    } finally {
      await engine.close();
    }
  });

  it('dropping the pericopes table reverts the pericope path exactly (the rollback)', async () => {
    const doctoredPath = join(fixtureDirectory, `doctored-no-pericopes-${process.pid}.db`);
    copyFileSync(fixturePath, doctoredPath);
    const doctored = new DatabaseSync(doctoredPath);
    try {
      doctored.exec('DROP INDEX idx_pericopes_range; DROP TABLE pericopes;');
    } finally {
      doctored.close();
    }

    // Queries the pericope path structurally cannot touch — reference
    // short-circuits before discovery; the alias-keyed query's page is
    // anchor-governed — must stay byte-identical across the drop. Ordinary
    // discovery queries are NOT in this list on purpose: on this bed most
    // top-50 windows contain some adjacent same-pericope pair, so the drop
    // legitimately reverts their grouping (asserted below), and pinning
    // byte-identity there would claim the feature does nothing.
    const untouched = ['it is well with my soul', 'John 3:16'];

    const withTable = await createEngine(openCorpus(fixturePath));
    const withoutTable = await createEngine(openCorpus(doctoredPath));
    try {
      for (const query of untouched) {
        expect(strip(await withoutTable.research(query)), query).toEqual(
          strip(await withTable.research(query)),
        );
      }
      // Anchor grouping survives the drop untouched — only the pericope arm
      // reverts. The James 1:22-25 merge and its 'editorial' provenance are
      // identical with and without the table.
      const anchorBefore = await withTable.research('hearing and doing');
      const anchorAfter = await withoutTable.research('hearing and doing');
      if (anchorBefore.kind === 'discovery' && anchorAfter.kind === 'discovery') {
        const mergedBefore = anchorBefore.results.find((row) => row.reference === 'James 1:22-25');
        const mergedAfter = anchorAfter.results.find((row) => row.reference === 'James 1:22-25');
        expect(strip({ ...mergedAfter } as ResearchResult)).toEqual(
          strip({ ...mergedBefore } as ResearchResult),
        );
        expect(mergedAfter!.grouping?.provenance.sourceId).toBe('editorial');
      }
      // The pericope-grouped query falls back to individual verses: no row
      // cites openbible-sections grouping, and the Psalm 136 fragments
      // reappear as separate results — pre-0.14.0 output, no engine change.
      const reverted = await withoutTable.research('his loving kindness endures forever');
      expect(reverted.kind).toBe('discovery');
      if (reverted.kind === 'discovery') {
        expect(
          reverted.results.every(
            (row) => row.grouping?.provenance.sourceId !== 'openbible-sections',
          ),
        ).toBe(true);
        expect(
          reverted.results.filter((row) => row.reference.startsWith('Psalms 136')).length,
        ).toBeGreaterThan(1);
      }
    } finally {
      await withTable.close();
      await withoutTable.close();
    }

    const port = openCorpus(doctoredPath);
    const repository = new CorpusRepository(port);
    try {
      expect(await repository.hasPericopes()).toBe(false);
      // pericopesContaining is deliberately NOT graceful about a missing
      // table: the probe is the guard (hasCuratedAliases precedent), and a
      // caller that skips it should fail loudly, not read silence.
      expect(await repository.pericopesContaining([])).toEqual([]);
      await expect(repository.pericopesContaining([JAS(1)])).rejects.toThrow(/pericopes/);
    } finally {
      await port.close();
    }
  });

  it('an emptied table also reads as "no pericopes" — the presence-and-rows probe', async () => {
    const doctoredPath = join(fixtureDirectory, `doctored-empty-pericopes-${process.pid}.db`);
    copyFileSync(fixturePath, doctoredPath);
    const doctored = new DatabaseSync(doctoredPath);
    try {
      doctored.exec('DELETE FROM pericopes;');
    } finally {
      doctored.close();
    }
    const port = openCorpus(doctoredPath);
    const repository = new CorpusRepository(port);
    try {
      expect(await repository.hasPericopes()).toBe(false);
    } finally {
      await port.close();
    }
  });
});
