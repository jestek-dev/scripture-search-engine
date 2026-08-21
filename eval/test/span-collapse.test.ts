/**
 * Orchestrator-level tests on the hermetic fixture corpus for the
 * span-membership anchor-run collapse (0.10.0 stage 7).
 *
 * The pure rewrite is unit-tested in the engine suite; these pin the
 * behavior through discover() on real compiled data, where the rank-adjacency
 * defect actually presented: `praise` spent five slots on individual verses
 * of Psalm 150 because other evidence interleaved them, and forgiving-others'
 * Matthew 18:21-22 span could not merge across the Matthew 6:14-15 row
 * sitting between its verses.
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { beforeAll, afterAll, describe, expect, it } from 'vitest';

import { createEngine, type ScriptureEngine } from '@jestek-dev/scripture-engine';
import { buildFixtureDatabase } from '../../pipeline/src/buildFixtureDb.js';

import { openCorpus } from '../src/nodeSqlitePort.js';

let engine: ScriptureEngine;
let fixtureDirectory: string;

beforeAll(async () => {
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'scripture-engine-span-'));
  const built = buildFixtureDatabase(join(fixtureDirectory, `fixture-${process.pid}.db`));
  engine = await createEngine(openCorpus(built.path));
});

afterAll(async () => {
  await engine?.close();
  rmSync(fixtureDirectory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
});

async function discover(query: string) {
  const result = await engine.research(query);
  if (result.kind !== 'discovery') throw new Error(`expected discovery, got ${result.kind}`);
  return result.results;
}

describe('span-membership anchor collapse (0.10.0 stage 7)', () => {
  it('Psalm 150 appears once, as the curated passage, never as separate verse rows', async () => {
    const results = await discover('praise');
    const psalm150 = results.filter((result) => result.reference.startsWith('Psalms 150'));
    expect(psalm150).toHaveLength(1);
    expect(psalm150[0]!.reference).toBe('Psalms 150:1-6');
  });

  it('collapses a span whose members ranked non-adjacently, at the best member, with merged reasons', async () => {
    // Matthew 6:14-15 ranks between Matthew 18:21 and 18:22 on this query, so
    // the pre-stage-7 adjacency rule could never merge the 18:21-22 span.
    const results = await discover('forgive others');
    const span = results.filter((result) => result.reference.startsWith('Matthew 18:2'));
    expect(span).toHaveLength(1);
    expect(span[0]!.reference).toBe('Matthew 18:21-22');
    // The merged row's chips explain the passage: the concept claim survives
    // once, strongest-per-label — no duplicated or stale per-verse chips.
    const anchorChips = span[0]!.reasons.filter(
      (reason) => reason.label === 'Theme: Forgiving others',
    );
    expect(anchorChips).toHaveLength(1);
    // Members below the best drop; the row between them keeps its own slot.
    const between = results.find((result) => result.reference === 'Matthew 6:14-15');
    expect(between).toBeDefined();
  });

  it('excerpt of a merged row reads in canonical verse order', async () => {
    const results = await discover('forgive others');
    const span = results.find((result) => result.reference === 'Matthew 18:21-22')!;
    const peter = span.excerpt.indexOf('Peter');
    expect(peter).toBeGreaterThanOrEqual(0);
    // 18:21 (Peter's question) must precede 18:22 (the seventy-times-seven
    // answer) regardless of which verse ranked higher.
    expect(span.excerpt.indexOf('seventy')).toBeGreaterThan(peter);
  });

  it('is deterministic across repeated runs', async () => {
    const once = JSON.stringify(await discover('praise'));
    expect(JSON.stringify(await discover('praise'))).toBe(once);
  });
});
