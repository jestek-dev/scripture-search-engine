/**
 * The consumer contract — the surface Maskil, LH Worship Setlist and Versed
 * pin against.
 *
 * These are not incidental tests. Three apps will encode assumptions about
 * these shapes, and the cost of changing one later is three coordinated
 * releases. What is asserted here is the part consumers are entitled to rely
 * on: kinds are typed rather than thrown, identities travel with every
 * result, and `related()` returns curated links rather than similarity.
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
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'sse-consumer-api-'));
  const built = buildFixtureDatabase(join(fixtureDirectory, `fixture-${process.pid}.db`));
  engine = await createEngine(openCorpus(built.path));
});

afterAll(async () => {
  await engine?.close();
  rmSync(fixtureDirectory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
});

describe('themes()', () => {
  it('resolves a phrase to the concept a human curated for it', async () => {
    const themes = await engine.themes('hearing and doing');
    expect(themes.length).toBeGreaterThan(0);
    const obedience = themes.find((theme) => theme.conceptId === 'obedience-to-the-word');
    expect(obedience).toBeDefined();
    // The matched phrase is reported as the author wrote it, so a UI can say
    // WHY the concept fired rather than showing a normalized token soup.
    expect(obedience!.matchedOn).toBe('hearing and doing');
    expect(obedience!.anchors.length).toBeGreaterThan(0);
  });

  it('returns nothing rather than guessing when no concept matches', async () => {
    expect(await engine.themes('quantum photosynthesis algorithm')).toEqual([]);
  });

  it('orders more specific matches first', async () => {
    const themes = await engine.themes('hearing and doing the word');
    const counts = themes.map((theme) => theme.matchedOn.split(/\s+/).length);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
  });
});

describe('passage()', () => {
  it('fetches a range', async () => {
    const result = await engine.passage('James 1:22-25');
    expect(result.kind).toBe('passage');
    if (result.kind !== 'passage') return;
    expect(result.passage.reference).toBe('James 1:22-25');
    expect(result.passage.verses).toHaveLength(4);
  });

  it('types an impossible reference instead of throwing', async () => {
    // Consumers render this; an exception would make every caller wrap a
    // try/catch to handle a case the type system can express.
    const result = await engine.passage('James 9:99');
    expect(result.kind).toBe('invalid-reference');
  });

  it('carries both identities, so a result is reproducible', async () => {
    const result = await engine.passage('Psalm 46:1');
    expect(result.corpusFingerprint).toHaveLength(64);
    expect(result.layerFingerprint).toBeTruthy();
    expect(result.engineVersion).toBe(engine.engineVersion);
  });
});

describe('reference suggestion surface (0.11.0/QR-4)', () => {
  it('resolves the space-separated phone-typed form as an ordinary reference', async () => {
    const result = await engine.research('John 3 16');
    expect(result.kind).toBe('reference');
    if (result.kind !== 'reference') return;
    expect(result.passage.reference).toBe('John 3:16');
  });

  it('cites a did-you-mean on an un-curated misspelling — suggestion only, never auto-resolve', async () => {
    const result = await engine.research('filipians 4:13');
    // The typed kind stays invalid-reference: an edit-distance guess must
    // never silently open a passage. The suggestion is the citation.
    expect(result.kind).toBe('invalid-reference');
    if (result.kind !== 'invalid-reference') return;
    expect(result.suggestion).toEqual({
      book: 'Philippians',
      reference: 'Philippians 4:13',
      distance: 2,
    });
  });

  it('falls through to discovery for bare-number memory queries', async () => {
    const result = await engine.research('plans 29 11');
    expect(result.kind).toBe('discovery');
  });

  it('carries the suggestion on passage() lookups too', async () => {
    const result = await engine.passage('filipians 4:13');
    expect(result.kind).toBe('invalid-reference');
    if (result.kind !== 'invalid-reference') return;
    expect(result.suggestion?.book).toBe('Philippians');
    // Lookups never fall through: there is no discovery to fall to.
    const bare = await engine.passage('plans 29 11');
    expect(bare.kind).toBe('invalid-reference');
  });
});

describe('related()', () => {
  it('reports the concepts whose curated anchors include the passage', async () => {
    const result = await engine.related('Psalm 46:1');
    expect(result.kind).toBe('related');
    if (result.kind !== 'related') return;
    expect(result.concepts.map((concept) => concept.conceptId)).toContain('refuge-in-trouble');
  });

  it('never returns the passage itself', async () => {
    const result = await engine.related('Psalm 46:1');
    if (result.kind !== 'related') throw new Error('expected related');
    expect(result.results.map((entry) => entry.reference)).not.toContain('Psalms 46:1');
  });

  it('every result carries a curated reason, never a similarity score alone', async () => {
    const result = await engine.related('Psalm 46:1');
    if (result.kind !== 'related') throw new Error('expected related');
    for (const entry of result.results) {
      expect(entry.reasons.length).toBeGreaterThan(0);
    }
  });
});

describe('forSong()', () => {
  it('combines stated themes with a title', async () => {
    const result = await engine.forSong({
      themes: ['hearing and doing'],
      title: 'Doers of the Word',
    });
    expect(result.kind).toBe('discovery');
    if (result.kind !== 'discovery') return;
    // The 0.10.0 stage-7 span collapse presents James 1:22 inside its
    // curated obedience-to-the-word passage row.
    expect(
      result.results.some((entry) => entry.reference.startsWith('James 1:22')),
    ).toBe(true);
  });

  it('is deterministic regardless of input key order', async () => {
    // Field order must come from the engine, not from how a caller happened
    // to build the object — otherwise two consumers passing the same data get
    // different rankings and the reproducibility contract is false.
    const a = await engine.forSong({ title: 'Doers of the Word', themes: ['hearing and doing'] });
    const b = await engine.forSong({ themes: ['hearing and doing'], title: 'Doers of the Word' });
    if (a.kind !== 'discovery' || b.kind !== 'discovery') throw new Error('expected discovery');
    expect(a.results.map((entry) => entry.targetId)).toEqual(
      b.results.map((entry) => entry.targetId),
    );
  });

  it('admits a foundational reference without letting it crowd out discovery', async () => {
    const withRef = await engine.forSong({
      themes: ['hearing and doing'],
      foundationalRef: 'James 1:22',
    });
    const without = await engine.forSong({ themes: ['hearing and doing'] });
    if (withRef.kind !== 'discovery' || without.kind !== 'discovery') {
      throw new Error('expected discovery');
    }
    expect(withRef.results.length).toBeGreaterThanOrEqual(without.results.length);
  });

  it('returns empty rather than everything when given nothing', async () => {
    const result = await engine.forSong({});
    if (result.kind !== 'discovery') throw new Error('expected discovery');
    expect(result.results).toEqual([]);
  });
});

describe('related() regression', () => {
  it('returns each concept with its anchors populated, not an empty array', async () => {
    // Found in review: this was hard-coded to []. An empty array here reads as
    // "this concept anchors nothing" rather than as data we declined to fetch,
    // and no test noticed because nothing asserted on it.
    const result = await engine.related('Psalm 46:1');
    if (result.kind !== 'related') throw new Error('expected related');
    const refuge = result.concepts.find((c) => c.conceptId === 'refuge-in-trouble');
    expect(refuge).toBeDefined();
    expect(refuge!.anchors.length).toBeGreaterThan(0);
    expect(refuge!.anchors).toContain('Psalms 46:1');
  });
});
