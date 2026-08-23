/**
 * Shared test bed: build the committed fixture corpus into a temp dir with a
 * REAL descriptor (identity read from the engine over the built bytes), plus
 * a small sorted universe. Every MS suite runs against this — the same
 * fixture DB the gauntlet gates against, so harness behavior is exercised on
 * real engine output, not mocks.
 */
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createEngine } from '@jestek-dev/scripture-engine';

import { buildFixtureDatabase } from '../../../pipeline/src/buildFixtureDb.js';
import { sha256Hex } from '../../src/canonical.js';
import { openCorpus } from '../../src/port.js';
import type { UniverseLine } from '../../src/universe/types.js';

export interface FixtureArtifact {
  readonly directory: string;
  readonly artifactPath: string;
  readonly descriptorPath: string;
  readonly identity: {
    readonly engineVersion: string;
    readonly corpusFingerprint: string;
    readonly layerFingerprint: string;
    readonly databaseSha256: string;
  };
}

export async function buildFixtureArtifact(prefix: string): Promise<FixtureArtifact> {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  const artifactPath = join(directory, 'content.db');
  buildFixtureDatabase(artifactPath);
  const engine = await createEngine(openCorpus(artifactPath));
  const identity = {
    engineVersion: engine.engineVersion,
    corpusFingerprint: engine.corpusFingerprint,
    layerFingerprint: engine.layerFingerprint,
    databaseSha256: sha256Hex(readFileSync(artifactPath)),
  };
  await engine.close();
  const descriptorPath = join(directory, 'candidate-artifact.json');
  writeFileSync(descriptorPath, `${JSON.stringify({ formatVersion: 1, ...identity }, null, 2)}\n`);
  return { directory, artifactPath, descriptorPath, identity };
}

/** A small, sorted, schema-valid universe drawn from real battery queries. */
export function writeSmallUniverse(directory: string, name = 'universe.jsonl'): string {
  const queries: readonly (readonly [string, string])[] = [
    ['u-001', "I'm anxious"],
    ['u-002', 'grief'],
    ['u-003', 'does God forgive me'],
    ['u-004', 'faith without works'],
    ['u-005', 'John 3:16'],
    ['u-006', 'be still and know'],
    ['u-007', 'love is patient'],
    ['u-008', 'forgivness'],
    ['u-009', 'fear not'],
    ['u-010', 'Phillipians 4:13'],
    ['u-011', 'baptism'],
    ['u-012', 'the prodigal son'],
  ];
  const lines: UniverseLine[] = queries.map(([queryId, query]) => ({
    queryId,
    query,
    generator: 'test-fixture',
    expectation: { kind: 'none' },
  }));
  const path = join(directory, name);
  writeFileSync(path, lines.map((line) => JSON.stringify(line)).join('\n') + '\n');
  return path;
}
