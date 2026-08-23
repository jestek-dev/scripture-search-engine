/**
 * Replay (MS-1): re-execute any queryId against the pinned identity and
 * byte-compare the canonical (elapsedMs-stripped) snapshot line — the tool
 * every defect record cites. A defect that cannot be replayed is an
 * anecdote; this makes every one an experiment.
 *
 * CLI: tsx src/replay.ts --artifact <content.db> --universe <universe.jsonl>
 *        --snapshot <snapshot.jsonl> --query-id <id> [--query-id <id> …]
 *        [--descriptor <descriptor.json>]
 */
import { readFileSync } from 'node:fs';

import { createEngine } from '@jestek-dev/scripture-engine';

import { canonicalJson, stripElapsed, type JsonValue } from './canonical.js';
import { assertIdentityMatches, readDescriptorIdentity } from './identity.js';
import { openCorpus } from './port.js';
import { buildSnapshotRecord } from './snapshot.js';
import { parseUniverse } from './universe/types.js';

export interface ReplayOutcome {
  readonly queryId: string;
  readonly match: boolean;
  /** Canonical line from the snapshot under audit. */
  readonly expected: string;
  /** Canonical line from the fresh execution. */
  readonly actual: string;
}

export interface ReplayOptions {
  readonly artifactPath: string;
  readonly universePath: string;
  readonly snapshotPath: string;
  readonly queryIds: readonly string[];
  readonly descriptorPath: string;
}

export async function replayQueries(options: ReplayOptions): Promise<ReplayOutcome[]> {
  const claimed = readDescriptorIdentity(options.descriptorPath);
  const universe = parseUniverse(readFileSync(options.universePath, 'utf8'));
  const byId = new Map(universe.map((line) => [line.queryId, line]));

  const snapshotLines = new Map<string, string>();
  for (const raw of readFileSync(options.snapshotPath, 'utf8').split('\n')) {
    if (raw.length === 0) continue;
    const parsed = JSON.parse(raw) as { queryId: string };
    snapshotLines.set(parsed.queryId, canonicalJson(stripElapsed(JSON.parse(raw) as JsonValue)));
  }

  const engine = await createEngine(openCorpus(options.artifactPath));
  try {
    assertIdentityMatches(claimed, {
      engineVersion: engine.engineVersion,
      corpusFingerprint: engine.corpusFingerprint,
      layerFingerprint: engine.layerFingerprint,
    });
    const outcomes: ReplayOutcome[] = [];
    for (const queryId of options.queryIds) {
      const line = byId.get(queryId);
      if (line === undefined) throw new Error(`queryId ${queryId} not in universe`);
      const expected = snapshotLines.get(queryId);
      if (expected === undefined) throw new Error(`queryId ${queryId} not in snapshot`);
      const outcome = await engine.research(line.query);
      const actual = canonicalJson(
        stripElapsed(
          JSON.parse(
            JSON.stringify(buildSnapshotRecord(line.queryId, line.query, outcome, 0)),
          ) as JsonValue,
        ),
      );
      outcomes.push({ queryId, match: actual === expected, expected, actual });
    }
    return outcomes;
  } finally {
    await engine.close();
  }
}

function parseArgs(argv: readonly string[]): ReplayOptions {
  let artifactPath: string | undefined;
  let universePath: string | undefined;
  let snapshotPath: string | undefined;
  let descriptorPath: string | undefined;
  const queryIds: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (value === undefined) throw new Error(`missing value for ${flag}`);
    switch (flag) {
      case '--artifact':
        artifactPath = value;
        break;
      case '--universe':
        universePath = value;
        break;
      case '--snapshot':
        snapshotPath = value;
        break;
      case '--descriptor':
        descriptorPath = value;
        break;
      case '--query-id':
        queryIds.push(value);
        break;
      default:
        throw new Error(`unknown flag ${flag}`);
    }
    i += 1;
  }
  if (!artifactPath || !universePath || !snapshotPath || !descriptorPath || queryIds.length === 0) {
    throw new Error(
      'usage: replay --artifact <db> --descriptor <json> --universe <jsonl> --snapshot <jsonl> --query-id <id> [...]',
    );
  }
  return { artifactPath, universePath, snapshotPath, descriptorPath, queryIds };
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (invokedDirectly) {
  const outcomes = await replayQueries(parseArgs(process.argv.slice(2)));
  let failed = 0;
  for (const outcome of outcomes) {
    if (outcome.match) {
      console.log(`REPLAY OK   ${outcome.queryId}`);
    } else {
      failed += 1;
      console.log(`REPLAY DIFF ${outcome.queryId}`);
      console.log(`  snapshot: ${outcome.expected}`);
      console.log(`  fresh:    ${outcome.actual}`);
    }
  }
  process.exitCode = failed === 0 ? 0 : 1;
}
