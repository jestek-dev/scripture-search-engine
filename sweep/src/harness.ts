/**
 * The pinned execution harness (MS-1): `runSweep` executes one shard of a
 * query universe against a pinned artifact identity and writes a replayable
 * JSONL snapshot plus a manifest.
 *
 * Order of operations is a contract:
 *   1. hash the artifact bytes against the descriptor's databaseSha256 —
 *      a flipped byte is refused before the database is even opened;
 *   2. open the engine and assert the observed identity triple equals the
 *      descriptor's claim — mismatch ABORTS before the first query line;
 *   3. only then execute queries.
 *
 * Snapshots are canonical-key-order JSONL (top-10, full reasons); shard
 * membership is the pure `sha256(queryId) mod N` partition, so `mergeShards`
 * is byte-stable: N shards merge to exactly the bytes of a 1-shard run.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { createEngine } from '@jestek-dev/scripture-engine';

import { canonicalJson, sha256Hex, stripSnapshotBody, type JsonValue } from './canonical.js';
import {
  assertIdentityMatches,
  readDescriptorIdentity,
  type ArtifactIdentity,
} from './identity.js';
import { openCorpus } from './port.js';
import { filterToShard, shardOf } from './shard.js';
import { buildSnapshotRecord, snapshotLine } from './snapshot.js';
import { parseUniverse, type UniverseLine } from './universe/types.js';

export const SWEEP_MANIFEST_SCHEMA = 'scripture-search-engine/sweep-run-manifest/v1';

export interface RunSweepOptions {
  /** Path to the artifact database (content.db). */
  readonly artifactPath: string;
  /** Path to the compiled universe JSONL. */
  readonly universePath: string;
  /** Where snapshots and manifests are written. */
  readonly outDir: string;
  /** 0-based shard index. Default 0. */
  readonly shard?: number;
  /** Total shard count. Default 1. */
  readonly ofShards?: number;
  /**
   * Artifact descriptor path. Defaults to `candidate-artifact.json`, then
   * `content-artifact.json`, next to the database.
   */
  readonly descriptorPath?: string;
}

export interface RunSweepResult {
  readonly snapshotPath: string;
  readonly manifestPath: string;
  readonly lineCount: number;
  /** sha256 of the canonical (elapsedMs-stripped) snapshot body. */
  readonly canonicalSnapshotSha256: string;
  readonly identity: ArtifactIdentity;
  readonly universeFingerprint: string;
}

function resolveDescriptorPath(options: RunSweepOptions): string {
  if (options.descriptorPath !== undefined) return options.descriptorPath;
  const dir = dirname(options.artifactPath);
  for (const name of ['candidate-artifact.json', 'content-artifact.json']) {
    try {
      readFileSync(join(dir, name));
      return join(dir, name);
    } catch {
      // try the next conventional name
    }
  }
  throw new Error(
    `no artifact descriptor found next to ${options.artifactPath}; pass descriptorPath explicitly`,
  );
}

export async function runSweep(options: RunSweepOptions): Promise<RunSweepResult> {
  const shard = options.shard ?? 0;
  const ofShards = options.ofShards ?? 1;
  const descriptorPath = resolveDescriptorPath(options);
  const claimed = readDescriptorIdentity(descriptorPath);

  // (1) Byte integrity BEFORE opening: a tampered artifact is refused by
  // hash before any query runs.
  const databaseBytes = readFileSync(options.artifactPath);
  const observedSha = sha256Hex(databaseBytes);
  if (observedSha !== claimed.databaseSha256) {
    throw new Error(
      `artifact refused: databaseSha256 mismatch (descriptor ${claimed.databaseSha256}, ` +
        `file ${observedSha}) — no query will run`,
    );
  }

  // (2) Identity probe BEFORE the first query line.
  const port = openCorpus(options.artifactPath);
  const engine = await createEngine(port);
  try {
    assertIdentityMatches(claimed, {
      engineVersion: engine.engineVersion,
      corpusFingerprint: engine.corpusFingerprint,
      layerFingerprint: engine.layerFingerprint,
    });

    const universeBody = readFileSync(options.universePath, 'utf8');
    const universeFingerprint = sha256Hex(universeBody);
    const universe = parseUniverse(universeBody);
    const mine = filterToShard(universe, shard, ofShards);

    // (3) Execute.
    const lines: string[] = [];
    for (const line of mine) {
      const startedAt = performance.now();
      const outcome = await engine.research(line.query);
      const elapsedMs = performance.now() - startedAt;
      lines.push(snapshotLine(buildSnapshotRecord(line.queryId, line.query, outcome, elapsedMs)));
    }
    const body = lines.length > 0 ? lines.join('\n') + '\n' : '';
    const canonical = body.length > 0 ? stripSnapshotBody(body) : '';

    mkdirSync(options.outDir, { recursive: true });
    const snapshotPath = join(options.outDir, `snapshot-${shard}-of-${ofShards}.jsonl`);
    writeFileSync(snapshotPath, body);

    const manifest = {
      formatVersion: 1,
      schema: SWEEP_MANIFEST_SCHEMA,
      identity: claimed,
      universeFingerprint,
      shard,
      ofShards,
      lineCount: mine.length,
      canonicalSnapshotSha256: sha256Hex(canonical),
      snapshotFile: basename(snapshotPath),
    };
    const manifestPath = join(options.outDir, `manifest-${shard}-of-${ofShards}.json`);
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    return {
      snapshotPath,
      manifestPath,
      lineCount: mine.length,
      canonicalSnapshotSha256: manifest.canonicalSnapshotSha256,
      identity: claimed,
      universeFingerprint,
    };
  } finally {
    await engine.close();
  }
}

/**
 * Byte-stable merge: parse every shard snapshot, sort by queryId, and write
 * the merged JSONL. Because sharding is a pure partition of a sorted
 * universe, the merged bytes equal a 1-shard run's bytes (elapsedMs aside —
 * canonical comparison strips it).
 */
export function mergeShards(outDir: string, ofShards: number): {
  readonly mergedPath: string;
  readonly manifestPath: string;
  readonly lineCount: number;
  readonly canonicalSnapshotSha256: string;
} {
  const records: { queryId: string; line: string }[] = [];
  const shardManifests: JsonValue[] = [];
  for (let shard = 0; shard < ofShards; shard += 1) {
    const body = readFileSync(join(outDir, `snapshot-${shard}-of-${ofShards}.jsonl`), 'utf8');
    const manifest = JSON.parse(
      readFileSync(join(outDir, `manifest-${shard}-of-${ofShards}.json`), 'utf8'),
    ) as JsonValue;
    shardManifests.push(manifest);
    for (const line of body.split('\n')) {
      if (line.length === 0) continue;
      const parsed = JSON.parse(line) as { queryId: string };
      if (shardOf(parsed.queryId, ofShards) !== shard) {
        throw new Error(`shard purity violation: ${parsed.queryId} found in shard ${shard}`);
      }
      records.push({ queryId: parsed.queryId, line });
    }
  }
  records.sort((a, b) => (a.queryId < b.queryId ? -1 : a.queryId > b.queryId ? 1 : 0));
  const body = records.length > 0 ? records.map((r) => r.line).join('\n') + '\n' : '';
  const mergedPath = join(outDir, 'snapshot-merged.jsonl');
  writeFileSync(mergedPath, body);
  const canonicalSnapshotSha256 = sha256Hex(body.length > 0 ? stripSnapshotBody(body) : '');
  const manifestPath = join(outDir, 'manifest-merged.json');
  writeFileSync(
    manifestPath,
    `${canonicalJson({
      formatVersion: 1,
      schema: SWEEP_MANIFEST_SCHEMA,
      merged: true,
      ofShards,
      lineCount: records.length,
      canonicalSnapshotSha256,
      shards: shardManifests,
    })}\n`,
  );
  return { mergedPath, manifestPath, lineCount: records.length, canonicalSnapshotSha256 };
}
