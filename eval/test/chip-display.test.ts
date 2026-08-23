/**
 * Orchestrator-level pins for the chip display polish (0.10.0 CO-2/F22).
 *
 * The rendering rules are unit-tested in engine/test/display.test.ts; these
 * guard the discover() CALL SITE — the P3.3/P3.4 caller-unguarded lesson. No
 * shipped data currently produces a withheld chip (measured at introduction:
 * weakest passage_terms chip in the battery's full windows is 0.896 against
 * a floor of 0.7, and no chip anywhere rounds to 0.0), so a mutation that
 * drops the polish call would survive every live-data suite. This bed is
 * therefore DOCTORED after building: a diffuse high-PMI passage term (chip
 * ≈ 0.475 points, below the 0.7 floor) and a weight-0.005 related-concept
 * anchor (chip 0.03 points, rounds to 0.0) are attached to John 16:33,
 * which ranks for `peace` on its own real evidence. If the call is dropped,
 * both chips surface and these tests ring.
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { beforeAll, afterAll, describe, expect, it } from 'vitest';

import {
  CHIP_DISPLAY_MIN_POINTS,
  createEngine,
  PASSAGE_TERM_CHIP_DISPLAY_FLOOR,
  type ScriptureEngine,
} from '@jestek-dev/scripture-engine/internal';
import { buildFixtureDatabase } from '../../pipeline/src/buildFixtureDb.js';

import { openCorpus } from '../src/nodeSqlitePort.js';

let engine: ScriptureEngine;
let fixtureDirectory: string;

beforeAll(async () => {
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'scripture-engine-chip-'));
  const built = buildFixtureDatabase(join(fixtureDirectory, `fixture-${process.pid}.db`));
  const db = new DatabaseSync(built.path);
  // A single diffuse term: PMI 12 keeps it inside the pmiSum-ordered
  // retrieval window, min_span_verses 4096 dilutes the chip to
  // 8 × log1p(1)/log1p(6) × 1/(1+0.25×12) × 12/18 ≈ 0.475 points — real
  // evidence, below the display floor.
  db.prepare(
    `INSERT INTO verse_terms (verse_id, term, pmi, count, source_ids, author_count, min_span_verses, locator)
     VALUES (43016033, 'peace', 12, 2, 'mhc', 1, 4096, '43.16.33')`,
  ).run();
  // A related-concept anchor at weight 0.005: the 'Related theme' chip earns
  // 12 × 0.005 × 0.5 = 0.03 points — rounds to 0.0 at the display decimal.
  db.prepare("INSERT INTO concepts (id, label) VALUES ('zz-chip-display-test', 'Chip display test')").run();
  db.prepare(
    "INSERT INTO concept_related (concept_id, related_id) VALUES ('peace-of-god', 'zz-chip-display-test')",
  ).run();
  db.prepare(
    `INSERT INTO concept_anchors (concept_id, start_verse_id, end_verse_id, source_id, weight, locator)
     VALUES ('zz-chip-display-test', 43016033, 43016033, 'editorial', 0.005, NULL)`,
  ).run();
  db.close();
  engine = await createEngine(openCorpus(built.path));
});

afterAll(async () => {
  await engine?.close();
  rmSync(fixtureDirectory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
});

describe('chip display polish at the discover() call site (0.10.0 CO-2/F22)', () => {
  it('withholds the sub-floor passage_terms chip and the 0.0-rounding chip, while their points still count', async () => {
    const result = await engine.research('peace');
    if (result.kind !== 'discovery') throw new Error(`expected discovery, got ${result.kind}`);
    const row = result.results.find((item) => item.targetId === 'WEB:43016033');
    expect(row).toBeDefined();

    // Display rules hold on the final surface.
    expect(row!.reasons.some((reason) => reason.family === 'passage_terms')).toBe(false);
    for (const reason of row!.reasons) {
      expect(reason.points).toBeGreaterThanOrEqual(CHIP_DISPLAY_MIN_POINTS);
    }

    // The result still explains itself — the honest chips survive.
    const anchor = row!.reasons.find((reason) => reason.family === 'concept_anchor');
    expect(anchor?.label).toBe('Theme: Peace of God');

    // Display-only: the withheld chips' points still count. The doctored
    // evidence is worth 0.475 + 0.03 ≈ 0.505 points, so the score exceeds
    // the sum of displayed chips by exactly that margin — a dropped polish
    // call collapses the margin to 0 and fails here.
    const displayed = row!.reasons.reduce((sum, reason) => sum + reason.points, 0);
    expect(row!.score - displayed).toBeGreaterThan(0.45);
    expect(row!.score - displayed).toBeLessThan(0.56);
    expect(0.45).toBeLessThan(PASSAGE_TERM_CHIP_DISPLAY_FLOOR);
  });

  it('is deterministic: repeated queries return byte-identical polished rows', async () => {
    const first = await engine.research('peace');
    const second = await engine.research('peace');
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });
});
