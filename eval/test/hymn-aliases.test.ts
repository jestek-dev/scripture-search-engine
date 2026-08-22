/**
 * P5.5 / QR-6 — curated hymn/phrase aliases, end to end against the hermetic
 * fixture artifact (schema v7 with a populated pack, engine 0.13.0).
 *
 * The golden fixtures own the per-hymn ranking assertions; what lives here is
 * the CONTRACT around them: whole-query EQUALITY matching (never containment
 * — the line keeping a curated phrase table from becoming a hidden second
 * ranking system), the guard set (no partial phrase, shared word, or superset
 * query ever grows a hymn chip), the typed-query rule (the alias key is what
 * the user typed, never the spelling-corrected token stream, while QR-5
 * still cites its corrections independently on the same result), the
 * attribution surface (chip label + provenance, covenant 6: the chip names a
 * source and adjudicates nothing), themes() staying alias-blind, and the
 * rowless-table regression (0.13.0 over an artifact with no alias rows
 * behaves exactly as 0.12.0 — the rollback story, since QR-6 shipped with no
 * schema bump).
 */

import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { DatabaseSync } from 'node:sqlite';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';

import {
  createEngine,
  normalizedPhrase,
  type Reason,
  type ScriptureEngine,
} from '@jestek-dev/scripture-engine';
import { buildFixtureDatabase } from '../../pipeline/src/buildFixtureDb.js';

import { openCorpus } from '../src/nodeSqlitePort.js';

let engine: ScriptureEngine;
let fixtureDirectory: string;
let fixturePath: string;

beforeAll(async () => {
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'scripture-hymn-aliases-'));
  const built = buildFixtureDatabase(join(fixtureDirectory, `fixture-${process.pid}.db`));
  fixturePath = built.path;
  engine = await createEngine(openCorpus(fixturePath));
});

afterAll(async () => {
  await engine?.close();
  rmSync(fixtureDirectory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
});

async function discover(query: string) {
  const result = await engine.research(query);
  if (result.kind !== 'discovery') throw new Error(`expected discovery, got ${result.kind}`);
  return result;
}

function hymnChips(reasons: readonly Reason[]): readonly Reason[] {
  return reasons.filter((reason) => reason.label.startsWith('Hymn:'));
}

async function expectNoHymnChipAnywhere(query: string) {
  const { results } = await discover(query);
  for (const result of results) {
    expect
      .soft(hymnChips(result.reasons), `"${query}" leaked a hymn chip on ${result.reference}`)
      .toEqual([]);
  }
}

describe('whole-query alias match — attribution surface', () => {
  it('answers the remembered line with the curated target, chip naming hymn AND theme', async () => {
    const { results } = await discover('it is well with my soul');
    const top = results[0]!;
    expect(top.reference).toBe('Jeremiah 29:11');
    const chip = hymnChips(top.reasons)[0]!;
    expect(chip.family).toBe('concept_anchor');
    expect(chip.label).toBe('Hymn: "It Is Well with My Soul" → Theme: Hope');
    // Covenant 6 made visible: the chip carries WHO says so, and the per-row
    // provenance names the hymn's author and year — a checkable claim, not a
    // theology score.
    expect(chip.provenance?.sourceId).toBe('hymn-aliases');
    expect(chip.provenance?.label).toBe('LH editorial (public-domain hymn index)');
    expect(chip.provenance?.locator).toBe('Horatio G. Spafford, "It Is Well with My Soul" (1873)');
  });

  it('matches on normalizedPhrase: case, punctuation, and apostrophes cannot break the key', async () => {
    expect(normalizedPhrase('It Is Well — With My SOUL!')).toBe('it is well with my soul');
    const { results } = await discover('It Is Well — With My SOUL!');
    expect(results[0]!.reference).toBe('Jeremiah 29:11');
    expect(hymnChips(results[0]!.reasons)).toHaveLength(1);
  });

  it('scales the concept arm by BOTH weights: the alias never outranks the anchor curation', async () => {
    // "this is my story this is my song" carries pack weight 0.9; the same
    // hymn's 1.0-weight phrase must contribute strictly more points to the
    // same #1 passage.
    const strong = await discover('blessed assurance jesus is mine');
    const weak = await discover('this is my story this is my song');
    expect(strong.results[0]!.reference).toBe('1 John 5:11-13');
    expect(weak.results[0]!.reference).toBe('1 John 5:11-13');
    const strongChip = hymnChips(strong.results[0]!.reasons)[0]!;
    const weakChip = hymnChips(weak.results[0]!.reasons)[0]!;
    expect(weakChip.points).toBeLessThan(strongChip.points);
  });
});

describe('equality, never containment — the guard set', () => {
  it('single shared words never trigger an alias', async () => {
    for (const query of ['well', 'soul', 'fortress', 'assurance', 'rock']) {
      await expectNoHymnChipAnywhere(query);
    }
  });

  it('partial phrases never trigger an alias (brittleness is the design)', async () => {
    for (const query of [
      'my soul',
      'it is well',
      'is well with my soul',
      'peace like a river',
      'solid rock',
      'turn your eyes',
      'this is my story',
      'mighty fortress',
    ]) {
      await expectNoHymnChipAnywhere(query);
    }
  });

  it('SUPERSET queries never trigger an alias — containment is refused in both directions', async () => {
    for (const query of [
      'it is well with my soul today',
      'sing it is well with my soul',
      'the hymn a mighty fortress is our god',
    ]) {
      await expectNoHymnChipAnywhere(query);
    }
  });
});

describe('typed-query rule — QR-5 interplay', () => {
  it('the alias key is the TYPED query: a misspelled line does not match, and corrections stay cited', async () => {
    // "wel" breaks the equality key by design; QR-5 may still correct the
    // token independently, and every correction it makes is cited.
    const outcome = await discover('it is wel with my soul');
    for (const result of outcome.results) {
      expect(hymnChips(result.reasons)).toEqual([]);
    }
    for (const correction of outcome.corrections ?? []) {
      expect(correction.typed).not.toBe('');
    }
  });

  it('an archaic line the pack stores verbatim matches AND carries the correction citation pin', async () => {
    // "attendeth" is out of the fixture vocabulary, so QR-5 corrects the
    // token stream; the alias matched the TYPED query, and the display layer
    // pins the citation onto every chip of the result — hymn chip included.
    const { results, corrections } = await discover('when peace like a river attendeth my way');
    const top = results[0]!;
    expect(top.reference).toBe('Jeremiah 29:11');
    const chip = hymnChips(top.reasons)[0]!;
    expect(chip.label).toContain('Hymn: "It Is Well with My Soul" → Theme: Hope');
    expect(chip.label).toContain('(query corrected from "attendeth")');
    expect((corrections ?? []).map((correction) => correction.typed)).toContain('attendeth');
  });
});

describe('scope — what aliases must NOT touch', () => {
  it('themes() is alias-blind: concept resolution still comes from the lexicon alone', async () => {
    const matches = await engine.themes('it is well with my soul');
    expect(matches.map((match) => match.conceptId)).not.toContain('hope-in-god');
  });

  it('reference queries still short-circuit before the alias step', async () => {
    const result = await engine.research('Psalm 46:1-3');
    expect(result.kind).toBe('reference');
  });
});

describe('rowless regression — 0.13.0 over an artifact with no alias rows behaves as 0.12.0', () => {
  it('presence-and-rows probe: an emptied curated_aliases table disables the step silently', async () => {
    const doctoredPath = join(fixtureDirectory, `doctored-rowless-${process.pid}.db`);
    copyFileSync(fixturePath, doctoredPath);
    const doctored = new DatabaseSync(doctoredPath);
    try {
      doctored.exec('DELETE FROM curated_aliases;');
    } finally {
      doctored.close();
    }
    const rowlessEngine = await createEngine(openCorpus(doctoredPath));
    try {
      const outcome = await rowlessEngine.research('it is well with my soul');
      if (outcome.kind !== 'discovery') throw new Error('expected discovery');
      // Pre-QR-6 behavior: bag-of-words results, no hymn chip anywhere, and
      // nothing throws. (The fingerprint no-op half of the rollback story is
      // pinned pipeline-side in aliasImporter.test.ts.)
      expect(outcome.results.length).toBeGreaterThan(0);
      for (const result of outcome.results) {
        expect(hymnChips(result.reasons)).toEqual([]);
      }
    } finally {
      await rowlessEngine.close();
    }
  });

  it('a DROPPED table (pre-v7 artifact) is equally safe — the probe catches the throw', async () => {
    const doctoredPath = join(fixtureDirectory, `doctored-dropped-${process.pid}.db`);
    copyFileSync(fixturePath, doctoredPath);
    const doctored = new DatabaseSync(doctoredPath);
    try {
      doctored.exec('DROP TABLE curated_aliases;');
    } finally {
      doctored.close();
    }
    const droppedEngine = await createEngine(openCorpus(doctoredPath));
    try {
      const outcome = await droppedEngine.research('blessed assurance');
      if (outcome.kind !== 'discovery') throw new Error('expected discovery');
      for (const result of outcome.results) {
        expect(hymnChips(result.reasons)).toEqual([]);
      }
    } finally {
      await droppedEngine.close();
    }
  });
});
