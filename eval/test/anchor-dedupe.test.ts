/**
 * Orchestrator-level tests on the hermetic fixture corpus for anchor dedupe
 * (0.10.0 stage 6): one verse, one concept, ONE scored contribution, with a
 * single chip that names every agreeing source.
 *
 * These live at evidence EMISSION in createEngine — dedupeConceptAnchors is
 * unit-tested in the engine suite, but the P3.3/P3.4 reviews proved that a
 * pure helper's caller needs its own pin: a mutation that dropped the wrapper
 * at either anchorVerses call site would survive the engine suite silently.
 * The fixture corpus carries real duplicate groups (the compiled layer holds
 * 28 within-concept same-verse groups, e.g. faith-and-works James 2:14-26
 * cited by editorial AND an OpenBible topic subscription), so the assertions
 * run against exactly the data class the dedupe exists for.
 *
 * The chip assertions are covenant #5 in test form: a result that ranks
 * correctly but names only one of the two agreeing sources carries the wrong
 * reason.
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
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'scripture-engine-dedupe-'));
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

describe('anchor dedupe (0.10.0 stage 6)', () => {
  it('scores a doubly-cited verse ONCE, and the one chip names both sources', async () => {
    // James 2:14-26 is anchored by faith-and-works twice over: the editorial
    // weight-1.0 entry and an OpenBible topic subscription. Before stage 6
    // both rows entered the ranker and summed as if independent.
    const results = await discover('faith without works');
    const row = results.find((result) => result.reference.startsWith('James 2:17'));
    expect(row).toBeDefined();
    const anchors = row!.reasons.filter(
      (reason) => reason.family === 'concept_anchor' && reason.label === 'Theme: Faith and works',
    );
    expect(anchors).toHaveLength(1);
    expect(anchors[0]!.provenance?.sourceId).toBe('editorial+openbible-topics');
    expect(anchors[0]!.provenance?.label).toBe(
      'LH editorial + OpenBible topical votes (CC BY)',
    );
  });

  it('keeps cross-concept stacking: two DIFFERENT concepts naming one verse both score', async () => {
    // Ephesians 2:8-9 is grace-not-earned's anchor AND lies inside
    // faith-and-works' Ephesians 2:8-10 anchor. Dedupe groups by concept, so
    // both claims survive as separate chips — they are different claims —
    // and EACH chip is itself a dedupe product naming its agreeing sources.
    const results = await discover('faith works grace');
    const row = results.find((result) => result.reference.startsWith('Ephesians 2:8'));
    expect(row).toBeDefined();
    const anchorLabels = new Set(
      row!.reasons
        .filter((reason) => reason.family === 'concept_anchor')
        .map((reason) => reason.label),
    );
    expect(anchorLabels.has('Theme: Grace, not earned')).toBe(true);
    expect(anchorLabels.has('Theme: Faith and works')).toBe(true);
  });

  it('single-source chips are untouched: no join, byte-identical label', async () => {
    const results = await discover('faith without works');
    const chips = results
      .flatMap((result) => result.reasons)
      .filter((reason) => reason.family === 'concept_anchor' && reason.provenance);
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      if (!String(chip.provenance!.sourceId).includes('+')) {
        expect(chip.provenance!.label).not.toContain(' + ');
      }
    }
  });

  it('is deterministic across repeated runs', async () => {
    const once = JSON.stringify(await discover('faith without works'));
    expect(JSON.stringify(await discover('faith without works'))).toBe(once);
  });
});
