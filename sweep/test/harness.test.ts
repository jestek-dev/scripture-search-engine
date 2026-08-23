/**
 * MS-1 verification, per the plan's own list: identity-mismatch abort; shard
 * purity; canonicalization byte-identity over the fixture DB; replay
 * byte-compares — plus positive controls (a seeded defect must make the
 * detector fire, or the guardrail is decoration).
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { canonicalJson, canonicalLineHash, stripSnapshotBody, sha256Hex } from '../src/canonical.js';
import { IdentityMismatchError } from '../src/identity.js';
import { mergeShards, runSweep } from '../src/harness.js';
import { replayQueries } from '../src/replay.js';
import { shardOf } from '../src/shard.js';
import { parseUniverse, UniverseSchemaError } from '../src/universe/types.js';
import { buildFixtureArtifact, writeSmallUniverse, type FixtureArtifact } from './helpers/fixtureArtifact.js';

let bed: FixtureArtifact;
let universePath: string;

beforeAll(async () => {
  bed = await buildFixtureArtifact('sweep-harness-');
  universePath = writeSmallUniverse(bed.directory);
});

afterAll(() => {
  rmSync(bed.directory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
});

describe('canonicalization', () => {
  it('serializes with sorted keys regardless of insertion order', () => {
    const a = canonicalJson({ b: 1, a: { d: 2, c: [3, { f: 4, e: 5 }] } });
    const b = canonicalJson({ a: { c: [3, { e: 5, f: 4 }], d: 2 }, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":{"c":[3,{"e":5,"f":4}],"d":2},"b":1}');
  });

  it('excludes elapsedMs from the canonical hash, and ONLY elapsedMs', () => {
    const base = { queryId: 'q', query: 'faith', kind: 'discovery', elapsedMs: 12.5 };
    const differentTiming = { ...base, elapsedMs: 99.9 };
    const differentContent = { ...base, query: 'hope' };
    expect(canonicalLineHash(base)).toBe(canonicalLineHash(differentTiming));
    expect(canonicalLineHash(base)).not.toBe(canonicalLineHash(differentContent));
  });
});

describe('universe schema (fail-closed)', () => {
  it('rejects an unsorted universe', () => {
    const body =
      JSON.stringify({ queryId: 'b', query: 'x', generator: 'g', expectation: { kind: 'none' } }) +
      '\n' +
      JSON.stringify({ queryId: 'a', query: 'y', generator: 'g', expectation: { kind: 'none' } }) +
      '\n';
    expect(() => parseUniverse(body)).toThrow(UniverseSchemaError);
  });

  it('rejects a line without an expectation block', () => {
    const body = JSON.stringify({ queryId: 'a', query: 'x', generator: 'g' }) + '\n';
    expect(() => parseUniverse(body)).toThrow(/expectation/);
  });
});

describe('identity probe', () => {
  it('ABORTS on a descriptor whose triple does not match, writing nothing', async () => {
    const doctoredDir = join(bed.directory, 'doctored-triple');
    mkdirSync(doctoredDir, { recursive: true });
    const doctored = join(doctoredDir, 'descriptor.json');
    writeFileSync(
      doctored,
      JSON.stringify({ ...bed.identity, layerFingerprint: 'f'.repeat(64) }, null, 2),
    );
    const outDir = join(doctoredDir, 'out');
    await expect(
      runSweep({ artifactPath: bed.artifactPath, universePath, outDir, descriptorPath: doctored }),
    ).rejects.toThrow(IdentityMismatchError);
    expect(existsSync(join(outDir, 'snapshot-0-of-1.jsonl'))).toBe(false);
  });

  it('refuses a byte-flipped artifact by hash BEFORE any query runs', async () => {
    const tamperedDir = join(bed.directory, 'tampered-bytes');
    mkdirSync(tamperedDir, { recursive: true });
    const tamperedDb = join(tamperedDir, 'content.db');
    const bytes = Buffer.from(readFileSync(bed.artifactPath));
    // Flip one byte deep in the file — past the header, inside page data.
    const offset = Math.floor(bytes.length / 2);
    bytes[offset] = (bytes[offset]! ^ 0xff) & 0xff;
    writeFileSync(tamperedDb, bytes);
    const descriptor = join(tamperedDir, 'descriptor.json');
    writeFileSync(descriptor, JSON.stringify(bed.identity, null, 2));
    await expect(
      runSweep({
        artifactPath: tamperedDb,
        universePath,
        outDir: join(tamperedDir, 'out'),
        descriptorPath: descriptor,
      }),
    ).rejects.toThrow(/databaseSha256 mismatch/);
  });
});

describe('sharding and merge', () => {
  it('sha256(queryId) mod N is a pure partition', () => {
    const ids = Array.from({ length: 500 }, (_, i) => `query-${i}`);
    for (const ofShards of [1, 3, 8]) {
      const seen = new Map<string, number>();
      for (let shard = 0; shard < ofShards; shard += 1) {
        for (const id of ids) {
          if (shardOf(id, ofShards) === shard) {
            expect(seen.has(id)).toBe(false);
            seen.set(id, shard);
          }
        }
      }
      expect(seen.size).toBe(ids.length);
    }
  });

  it('merging a 3-shard run is byte-identical (post-elapsedMs strip) to a 1-shard run', async () => {
    const singleDir = join(bed.directory, 'run-single');
    const shardedDir = join(bed.directory, 'run-sharded');
    const single = await runSweep({
      artifactPath: bed.artifactPath,
      universePath,
      outDir: singleDir,
      descriptorPath: bed.descriptorPath,
    });
    let shardedTotal = 0;
    for (let shard = 0; shard < 3; shard += 1) {
      const result = await runSweep({
        artifactPath: bed.artifactPath,
        universePath,
        outDir: shardedDir,
        shard,
        ofShards: 3,
        descriptorPath: bed.descriptorPath,
      });
      shardedTotal += result.lineCount;
    }
    const merged = mergeShards(shardedDir, 3);
    expect(shardedTotal).toBe(single.lineCount);
    expect(merged.lineCount).toBe(single.lineCount);
    // Canonical byte identity: identical content hash from both topologies.
    expect(merged.canonicalSnapshotSha256).toBe(single.canonicalSnapshotSha256);
    // And a second 1-shard run reproduces the same canonical bytes (the
    // determinism the whole sweep is built to measure).
    const repeatDir = join(bed.directory, 'run-repeat');
    const repeat = await runSweep({
      artifactPath: bed.artifactPath,
      universePath,
      outDir: repeatDir,
      descriptorPath: bed.descriptorPath,
    });
    expect(repeat.canonicalSnapshotSha256).toBe(single.canonicalSnapshotSha256);
  });

  it('mergeShards detects a shard-purity violation (positive control)', async () => {
    const dir = join(bed.directory, 'run-impure');
    for (let shard = 0; shard < 2; shard += 1) {
      await runSweep({
        artifactPath: bed.artifactPath,
        universePath,
        outDir: dir,
        shard,
        ofShards: 2,
        descriptorPath: bed.descriptorPath,
      });
    }
    // Seed the defect: move one line from shard 0 into shard 1's file.
    const zero = readFileSync(join(dir, 'snapshot-0-of-2.jsonl'), 'utf8');
    const firstLine = zero.split('\n')[0]!;
    const onePath = join(dir, 'snapshot-1-of-2.jsonl');
    writeFileSync(onePath, readFileSync(onePath, 'utf8') + firstLine + '\n');
    expect(() => mergeShards(dir, 2)).toThrow(/shard purity violation/);
  });
});

describe('snapshots and replay', () => {
  it('snapshot lines carry the top-10 window with full reasons', async () => {
    const outDir = join(bed.directory, 'run-content');
    await runSweep({
      artifactPath: bed.artifactPath,
      universePath,
      outDir,
      descriptorPath: bed.descriptorPath,
    });
    const body = readFileSync(join(outDir, 'snapshot-0-of-1.jsonl'), 'utf8');
    const records = body
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    expect(records.length).toBe(12);
    const discovery = records.find((r) => r.queryId === 'u-004') as {
      kind: string;
      results: { reasons: unknown[]; rank: number }[];
    };
    expect(discovery.kind).toBe('discovery');
    expect(discovery.results.length).toBeGreaterThan(0);
    expect(discovery.results.length).toBeLessThanOrEqual(10);
    for (const result of discovery.results) {
      expect(Array.isArray(result.reasons)).toBe(true);
      expect(result.reasons.length).toBeGreaterThan(0);
    }
    const reference = records.find((r) => r.queryId === 'u-005') as { kind: string };
    expect(reference.kind).toBe('reference');
    // Every line hashes stably after the elapsedMs strip.
    const canonical = stripSnapshotBody(body);
    expect(sha256Hex(canonical)).toBe(sha256Hex(stripSnapshotBody(body)));
  });

  it('replay reproduces snapshot lines byte-identically', async () => {
    const outDir = join(bed.directory, 'run-replay');
    await runSweep({
      artifactPath: bed.artifactPath,
      universePath,
      outDir,
      descriptorPath: bed.descriptorPath,
    });
    const outcomes = await replayQueries({
      artifactPath: bed.artifactPath,
      descriptorPath: bed.descriptorPath,
      universePath,
      snapshotPath: join(outDir, 'snapshot-0-of-1.jsonl'),
      queryIds: ['u-001', 'u-004', 'u-005', 'u-008', 'u-010', 'u-012'],
    });
    for (const outcome of outcomes) {
      expect(outcome.match, `replay diff on ${outcome.queryId}`).toBe(true);
    }
  });

  it('replay FLAGS a doctored snapshot line (positive control)', async () => {
    const outDir = join(bed.directory, 'run-doctored');
    await runSweep({
      artifactPath: bed.artifactPath,
      universePath,
      outDir,
      descriptorPath: bed.descriptorPath,
    });
    const snapshotPath = join(outDir, 'snapshot-0-of-1.jsonl');
    const lines = readFileSync(snapshotPath, 'utf8').split('\n');
    const doctored = lines.map((line) => {
      if (line.length === 0) return line;
      const record = JSON.parse(line) as { queryId: string; results?: { score: number }[] };
      if (record.queryId === 'u-004' && record.results?.[0] !== undefined) {
        record.results[0].score += 1; // the seeded defect
        return JSON.stringify(record);
      }
      return line;
    });
    writeFileSync(snapshotPath, doctored.join('\n'));
    const outcomes = await replayQueries({
      artifactPath: bed.artifactPath,
      descriptorPath: bed.descriptorPath,
      universePath,
      snapshotPath,
      queryIds: ['u-004'],
    });
    expect(outcomes[0]!.match).toBe(false);
  });
});
