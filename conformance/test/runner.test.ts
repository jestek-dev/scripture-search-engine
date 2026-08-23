/**
 * The conformance runner, end to end on the hermetic fixture bed (plan
 * P7.5 / CO-8): a generated slice replays green in the same runtime
 * (determinism), a SEEDED ordering mutation makes it fail (the alarm proof
 * the plan demands), and the runs that cannot judge conformance report
 * not-applicable WITH a reason — never pass (gate discipline, CLAUDE.md).
 *
 * The real-consumer-runtime leg (Hermes/JSC over OP-SQLite in Maskil,
 * against the terminus artifact) is BLOCKED until the P7.6 terminus release
 * exists and is recorded via the release checklist — it is deliberately not
 * simulated here, and a Node run never claims to be it: the `runtime` label
 * in every report says what actually executed.
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createEngine, type ScriptureEngine } from '@jestek-dev/scripture-engine';

import { buildFixtureDatabase } from '../../pipeline/src/buildFixtureDb.js';
import { openCorpus } from '../../eval/src/nodeSqlitePort.js';
import { canonicalJson } from '../src/canonical.js';
import { sha256Hex } from '../src/sha256.js';
import {
  runConformance,
  sliceSeal,
  type ExpectedSlice,
  type ExpectedSliceEntry,
} from '../src/runner.js';

let engine: ScriptureEngine;
let fixtureDirectory: string;
let slice: ExpectedSlice;

/** A small pinned slice: representative query shapes from the battery. */
const SLICE_QUERIES: readonly { id: string; query: string }[] = [
  { id: 'fixture-concept', query: 'hearing and doing' },
  { id: 'fixture-reference', query: 'James 1:22' },
  { id: 'fixture-felt-need', query: 'shepherd' },
  { id: 'fixture-phrase', query: 'be doers of the word' },
];

async function generateSlice(over: ScriptureEngine): Promise<ExpectedSlice> {
  const entries: ExpectedSliceEntry[] = [];
  let identity: ExpectedSlice['identity'] | undefined;
  for (const row of SLICE_QUERIES) {
    const outcome = await over.research(row.query);
    identity ??= {
      engineVersion: outcome.engineVersion,
      corpusFingerprint: outcome.corpusFingerprint,
      layerFingerprint: outcome.layerFingerprint,
    };
    const canonical = canonicalJson(outcome);
    entries.push({ id: row.id, query: row.query, canonical, sha256: sha256Hex(canonical) });
  }
  return {
    formatVersion: 1,
    kind: 'scripture-search-conformance-slice',
    identity: identity!,
    queries: entries,
    sliceSha256: sliceSeal({ identity: identity!, queries: entries }),
  };
}

beforeAll(async () => {
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'conformance-kit-'));
  const built = buildFixtureDatabase(join(fixtureDirectory, 'fixture.db'));
  engine = await createEngine(openCorpus(built.path));
  slice = await generateSlice(engine);
});

afterAll(async () => {
  await engine?.close();
  rmSync(fixtureDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
});

describe('runConformance', () => {
  it('replays the slice green on the generating runtime (byte-agreement)', async () => {
    const report = await runConformance(engine, slice, 'node (kit self-test)');
    expect(report.status).toBe('conformant');
    expect(report.agreed).toBe(SLICE_QUERIES.length);
    expect(report.diverged).toBe(0);
    expect(report.observedIdentity).toEqual(slice.identity);
    expect(report.queries.every((entry) => entry.status === 'agree')).toBe(true);
  });

  it('ALARM PROOF: a seeded ordering mutation fails, naming the query and the first differing byte', async () => {
    // Swap the first two results of one query's expected serialization —
    // exactly the class of divergence the kit exists to catch.
    const target = slice.queries[0]!;
    const parsed = JSON.parse(target.canonical) as { results: unknown[] };
    expect(parsed.results.length).toBeGreaterThan(1);
    [parsed.results[0], parsed.results[1]] = [parsed.results[1], parsed.results[0]];
    const mutatedCanonical = canonicalJson(parsed);
    expect(mutatedCanonical).not.toBe(target.canonical);
    const mutatedEntry: ExpectedSliceEntry = {
      ...target,
      canonical: mutatedCanonical,
      sha256: sha256Hex(mutatedCanonical),
    };
    const mutatedQueries = [mutatedEntry, ...slice.queries.slice(1)];
    const mutated: ExpectedSlice = {
      ...slice,
      queries: mutatedQueries,
      sliceSha256: sliceSeal({ identity: slice.identity, queries: mutatedQueries }),
    };

    const report = await runConformance(engine, mutated, 'node (kit self-test)');
    expect(report.status).toBe('divergent');
    expect(report.diverged).toBe(1);
    const divergence = report.queries.find((entry) => entry.status === 'diverged');
    expect(divergence?.id).toBe(target.id);
    expect(divergence?.observedSha256).toBe(target.sha256); // the runtime still produces the TRUE bytes
    expect(divergence?.firstDifference?.offset).toBeGreaterThanOrEqual(0);
    expect(divergence?.firstDifference?.expected).not.toBe(divergence?.firstDifference?.observed);
  });

  it('NOT-APPLICABLE with reason: identity triple mismatch (never pass, never fail)', async () => {
    const foreign: ExpectedSlice = {
      ...slice,
      identity: { ...slice.identity, layerFingerprint: '0'.repeat(64) },
      sliceSha256: sliceSeal({
        identity: { ...slice.identity, layerFingerprint: '0'.repeat(64) },
        queries: slice.queries,
      }),
    };
    const report = await runConformance(engine, foreign, 'node (kit self-test)');
    expect(report.status).toBe('not-applicable');
    expect(report.reason).toContain('identity triple mismatch');
    expect(report.queries).toHaveLength(0);
  });

  it('NOT-APPLICABLE with reason: corrupted slice (integrity seal)', async () => {
    const corrupted: ExpectedSlice = { ...slice, sliceSha256: 'f'.repeat(64) };
    const report = await runConformance(engine, corrupted, 'node (kit self-test)');
    expect(report.status).toBe('not-applicable');
    expect(report.reason).toContain('integrity seal mismatch');
  });

  it('NOT-APPLICABLE with reason: tampered entry body', async () => {
    const target = slice.queries[0]!;
    const tamperedQueries = [
      { ...target, canonical: `${target.canonical} ` }, // body edited, recorded sha256 kept
      ...slice.queries.slice(1),
    ];
    const tampered: ExpectedSlice = {
      ...slice,
      queries: tamperedQueries,
      // Seal recomputed so ONLY the body/hash mismatch can be the finding.
      sliceSha256: sliceSeal({ identity: slice.identity, queries: tamperedQueries }),
    };
    const report = await runConformance(engine, tampered, 'node (kit self-test)');
    expect(report.status).toBe('not-applicable');
    expect(report.reason).toContain('does not hash to its recorded sha256');
  });
});
