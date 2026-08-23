/**
 * End-to-end tests against the real fixture corpus.
 *
 * These are the first tests in the repo that exercise the whole stack —
 * tokenizer, postings, IDF, intents, budgets, ranker — against actual
 * scripture text rather than synthetic evidence.
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
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'scripture-engine-e2e-'));
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

describe('reference intent', () => {
  it('resolves a reference and short-circuits discovery', async () => {
    const result = await engine.research('Ps 46');
    expect(result.kind).toBe('reference');
    if (result.kind !== 'reference') return;
    expect(result.passage.reference).toBe('Psalms 46');
    expect(result.passage.verses.length).toBeGreaterThan(1);
    expect(result.passage.verses[0]!.text).toContain('refuge');
  });

  it('resolves verse ranges', async () => {
    const result = await engine.research('James 1:22-25');
    expect(result.kind).toBe('reference');
    if (result.kind !== 'reference') return;
    expect(result.passage.verses).toHaveLength(4);
  });

  it('returns a typed error for an out-of-range reference, never a wrong passage', async () => {
    const result = await engine.research('James 9:99');
    expect(result.kind).toBe('invalid-reference');
  });

  it('carries reproducibility identities on every result', async () => {
    const result = await engine.research('Ps 46');
    expect(result.engineVersion).toBeTruthy();
    expect(result.corpusFingerprint).toHaveLength(64);
  });
});

describe('exact phrase intent', () => {
  it('finds a verbatim phrase and explains itself as one', async () => {
    const results = await discover('a very present help in trouble');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.reference).toBe('Psalms 46:1');
    expect(results[0]!.reasons.some((r) => r.family === 'exact_phrase')).toBe(true);
  });
});

describe('token intent — the case that motivated the engine', () => {
  it('reaches archaic text from a modern theme query', async () => {
    // "hearing and doing" must find "heareth ... doeth" (Matt 7) and
    // "doers of the word" (James 1) purely lexically, before any concept
    // layer exists. This is the Phase 1 half of golden fixture #1.
    const results = await discover('hearing and doing');
    const references = results.map((result) => result.reference);

    expect(references.some((ref) => ref.startsWith('James 1:'))).toBe(true);
    expect(references.some((ref) => ref.startsWith('Matthew 7:'))).toBe(true);
  });

  it('ranks the doers-of-the-word verse for a paraphrase', async () => {
    const results = await discover('be doers of the word not hearers only');
    // Since the 0.10.0 stage-7 span collapse, James 1:22 leads as the best
    // member of its curated passage row.
    expect(results[0]!.reference).toBe('James 1:22-25');
  });

  it('weights distinctive words above common ones', async () => {
    // "refuge" is rare in the corpus; "do" is everywhere. A query with both
    // must be dominated by the rare term.
    const results = await discover('refuge do');
    expect(results[0]!.excerpt.toLowerCase()).toContain('refuge');
  });

  it('explains token matches without claiming interpretation', async () => {
    const results = await discover('hearing and doing');
    const reasons = results.flatMap((result) => result.reasons);
    expect(reasons.every((reason) => reason.points >= 0)).toBe(true);
    // Reasons state what matched, never what it means.
    expect(reasons.some((reason) => reason.label.startsWith('Shared word'))).toBe(true);
  });
});

describe('determinism end to end', () => {
  it('returns identical ordering and scores for repeated identical queries', async () => {
    const first = await discover('hearing and doing');
    const second = await discover('hearing and doing');
    expect(second.map((r) => [r.targetId, r.score])).toEqual(
      first.map((r) => [r.targetId, r.score]),
    );
  });

  it('orders equal-scoring results in canonical scripture order', async () => {
    // Diversification is deliberately disabled here. With it on, results
    // deferred by the per-chapter cap are appended after the rest, which
    // legitimately breaks global ascending order — so this test isolates the
    // tie-break rule rather than fighting a different rule that also applies.
    // Built to its own path: the shared fixture database is still open by the
    // suite-level engine, and Windows will not let us unlink an open file.
    const separateDirectory = mkdtempSync(join(tmpdir(), 'scripture-engine-undiversified-'));
    const separate = buildFixtureDatabase(join(separateDirectory, `fixture-${process.pid}.db`));
    const undiversified = await createEngine(openCorpus(separate.path), {
      rankOptions: { maxPerGroup: Number.MAX_SAFE_INTEGER },
    });
    try {
      const result = await undiversified.research('the word');
      if (result.kind !== 'discovery') throw new Error('expected discovery');
      const results = result.results;
      const ids = results.map((entry) => entry.targetId);
      // Zero-padded target ids mean lexicographic order IS canonical order,
      // so any equal-score run must already be ascending.
      for (let i = 1; i < results.length; i += 1) {
        if (results[i]!.score === results[i - 1]!.score) {
          expect(ids[i]! > ids[i - 1]!).toBe(true);
        }
      }
    } finally {
      await undiversified.close();
      rmSync(separateDirectory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
    }
  });
});
