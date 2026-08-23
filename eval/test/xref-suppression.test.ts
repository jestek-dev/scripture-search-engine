/**
 * Orchestrator-level tests on the hermetic fixture corpus for two mechanisms
 * that live at evidence EMISSION in createEngine — before rank() ever runs —
 * and therefore cannot be expressed as ranker invariants:
 *
 *  1. Same-concept cross-reference suppression (0.10.0 stage 4): within one
 *     concept's anchor set, an edge between two members restates the curated
 *     consensus the concept_anchor chip already carries, and is dropped.
 *     Edges to targets outside the matched concept's anchor set survive, and
 *     related() is untouched.
 *
 *  2. The complete-match subsumption MARKING SITE (0.10.0 stage 3): the P3.3
 *     review proved the pure helper was tested but its caller was not — a
 *     mutation that marked FRAGMENT targets for subsumption, or reverted the
 *     whole-match branch to raw word counts, survived the engine suite
 *     silently. These tests pin the call site.
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
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'scripture-engine-xref-'));
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

describe('same-concept cross-reference suppression (0.10.0 stage 4)', () => {
  // "no weapon formed against me" matches exactly one concept
  // (gods-protection), whose anchors include Psalms 91:9-12, Psalms 91:14-16
  // and Isaiah 54:17 — and the committed OpenBible subset carries an edge
  // from Psalms 91:14 to Psalms 91:9, i.e. between two anchors of the very
  // concept that seeded the expansion. That edge is consensus restated as
  // corroboration and must be dropped at emission.
  it('drops the edge between two anchors of the matched concept', async () => {
    const results = await discover('no weapon formed against me');
    const labels = results.flatMap((result) => result.reasons).map((reason) => reason.label);
    expect(labels).not.toContain('Cross-referenced from Psalms 91:14');

    // The suppressed TARGET never disappears: Psalms 91:9 stays ranked on its
    // own concept_anchor evidence (possibly collapsed into its curated span),
    // just without the restated edge chip.
    const target = results.find((result) => result.reference.startsWith('Psalms 91:9'));
    expect(target).toBeDefined();
    expect(target!.reasons.some((reason) => reason.family === 'concept_anchor')).toBe(true);
    expect(target!.reasons.some((reason) => reason.family === 'cross_reference')).toBe(false);
  });

  it('keeps edges whose target is NOT an anchor of the matched concept', async () => {
    const results = await discover('no weapon formed against me');
    const labelsFor = (reference: string) =>
      results
        .filter((result) => result.reference === reference)
        .flatMap((result) => result.reasons)
        .filter((reason) => reason.family === 'cross_reference')
        .map((reason) => reason.label);

    // Proverbs 3:6 anchors a different (unmatched) concept; Psalms 46:2 and
    // Psalms 121:7 are outside the matched concept's anchor set entirely.
    // Their edges from gods-protection anchors are discovery, not
    // restatement, and must survive untouched.
    expect(labelsFor('Proverbs 3:6')).toContain('Cross-referenced from Psalms 91:11');
    expect(labelsFor('Psalms 46:2')).toContain('Cross-referenced from Psalms 91:5');
    expect(labelsFor('Psalms 121:7')).toContain('Cross-referenced from Psalms 91:10');
  });

  it('leaves related() untouched: the same-concept edge still appears there', async () => {
    // In related() the passage is the input and its edges are exactly what
    // was asked for — no concept consensus is being restated, so the
    // Psalms 91:14 -> 91:9 edge that discovery suppresses must still appear.
    const related = await engine.related('Psalms 91:14');
    expect(related.kind).toBe('related');
    if (related.kind !== 'related') return;
    const target = related.results.find((result) => result.reference === 'Psalms 91:9');
    expect(target).toBeDefined();
    expect(target!.reasons.some((reason) => reason.family === 'cross_reference')).toBe(true);
  });

  it('is deterministic: repeated identical queries return identical ordering and reasons', async () => {
    const first = await discover('no weapon formed against me');
    const second = await discover('no weapon formed against me');
    expect(second.map((result) => [result.targetId, result.score, result.reasons])).toEqual(
      first.map((result) => [result.targetId, result.score, result.reasons]),
    );
  });
});

describe('complete-match subsumption marking site (0.10.0 stage 3 pin)', () => {
  it('a COMPLETE whole-query verbatim match sheds its token_overlap/proximity restatement and nothing else', async () => {
    // "a very present help in trouble" occurs verbatim in Psalms 46:1 with
    // enough significant words for full exact_phrase authority. Its token
    // and proximity chips restate the same fact and are subsumed; families
    // outside the subsumption pair (here passage_terms) must survive.
    const results = await discover('a very present help in trouble');
    const top = results[0]!;
    expect(top.reference).toBe('Psalms 46:1');
    const families = top.reasons.map((reason) => reason.family);
    expect(families).toContain('exact_phrase');
    expect(families).toContain('passage_terms');
    expect(families).not.toContain('token_overlap');
    expect(families).not.toContain('proximity');
  });

  it('fragments never mark for subsumption: a fragment match keeps its honest token credit', async () => {
    // The whole query does not occur verbatim; its longest fragment
    // ("be doers of the word") does, in James 1:22. A fragment leaves room
    // for the REST of the query to earn token credit, so marking fragment
    // targets for subsumption (the mutation the P3.3 review found the suite
    // blind to) must fail here: the exact_phrase fragment chip, the
    // token_overlap chip and the proximity chip all coexist on one result.
    const results = await discover('be doers of the word not hearers only');
    const top = results[0]!;
    // Since the 0.10.0 stage-7 span collapse, the leading row is the curated
    // obedience-to-the-word passage James 1:22-25 (James 1:22 is its best
    // member and carries the fragment chips; reasons merge strongest-per-
    // label, so the chips this test pins are the same chips).
    expect(top.reference).toBe('James 1:22-25');
    const families = top.reasons.map((reason) => reason.family);
    expect(families).toContain('exact_phrase');
    expect(families).toContain('token_overlap');
    expect(families).toContain('proximity');
    const fragmentChip = top.reasons.find((reason) => reason.family === 'exact_phrase')!;
    expect(fragmentChip.label).toContain('Contains');
  });

  it('whole-match authority is measured in SIGNIFICANT words: a one-significant-word whole match never files exact_phrase', async () => {
    // "the word" is two raw words but one significant token. Reverting the
    // whole-match branch to raw counts would re-grant it exact_phrase
    // authority (and mark it for subsumption); the taper files it as
    // token_overlap at the family's full 10 points with its truthful label.
    const results = await discover('the word');
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result.reasons.every((reason) => reason.family !== 'exact_phrase')).toBe(true);
    }
    const wholeMatchChip = results[0]!.reasons.find(
      (reason) => reason.family === 'token_overlap' && reason.label === 'Exact phrase',
    );
    expect(wholeMatchChip).toBeDefined();
    expect(wholeMatchChip!.points).toBe(10);
  });
});
