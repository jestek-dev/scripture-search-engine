/**
 * Generate an expected conformance slice from a built artifact (plan
 * P7.5 / CO-8) — the Node-side half of the kit.
 *
 * Run in this repository against the artifact a release will ship:
 *
 *   npx tsx conformance/scripts/generateExpected.ts \
 *     --database path/to/content.db \
 *     --out conformance/expected/<identity>.json
 *
 * The slice pins the identity triple the engine reports over that database
 * plus, per battery query, the canonical serialization (orderings + reasons,
 * verse text excluded — see canonical.ts) and its sha256. Consumers replay
 * the slice on their own runtime with `runConformance`.
 *
 * Queries: every ACTIVE row of eval/battery/queries.json — the reviewed,
 * append-only specimen set. Pass --queries to use another file with the
 * same shape.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { createEngine, type ContentQueryPort } from '@jestek-dev/scripture-engine';

import { canonicalJson } from '../src/canonical.js';
import { sha256Hex } from '../src/sha256.js';
import { sliceSeal, type ExpectedSlice, type ExpectedSliceEntry } from '../src/runner.js';

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

/** Minimal node:sqlite ContentQueryPort — the same seam consumers implement. */
function openPort(path: string): ContentQueryPort {
  const database = new DatabaseSync(path, { readOnly: true });
  return {
    async execute(query, params = []) {
      const rows = database.prepare(query).all(...(params as never[])) as Record<
        string,
        import('@jestek-dev/scripture-engine').ContentScalar
      >[];
      return { rows };
    },
    async close() {
      database.close();
    },
  };
}

async function main(): Promise<void> {
  const databasePath = argValue('--database');
  const outPath = argValue('--out');
  const queriesPath = argValue('--queries') ?? 'eval/battery/queries.json';
  if (!databasePath || !outPath) {
    console.error(
      'usage: tsx conformance/scripts/generateExpected.ts --database <content.db> --out <slice.json> [--queries <queries.json>]',
    );
    process.exit(2);
  }

  const battery = JSON.parse(readFileSync(queriesPath, 'utf8')) as {
    queries: readonly { id: string; query: string; status: string }[];
  };
  const active = battery.queries.filter((row) => row.status === 'active');
  if (active.length === 0) throw new Error(`${queriesPath}: no active queries`);

  const engine = await createEngine(openPort(databasePath));
  try {
    const entries: ExpectedSliceEntry[] = [];
    let identity: ExpectedSlice['identity'] | undefined;
    for (const row of active) {
      const outcome = await engine.research(row.query);
      identity ??= {
        engineVersion: outcome.engineVersion,
        corpusFingerprint: outcome.corpusFingerprint,
        layerFingerprint: outcome.layerFingerprint,
      };
      const canonical = canonicalJson(outcome);
      entries.push({ id: row.id, query: row.query, canonical, sha256: sha256Hex(canonical) });
    }
    const slice: ExpectedSlice = {
      formatVersion: 1,
      kind: 'scripture-search-conformance-slice',
      identity: identity!,
      generatedAt: new Date().toISOString(),
      queries: entries,
      sliceSha256: sliceSeal({ identity: identity!, queries: entries }),
    };
    writeFileSync(outPath, `${JSON.stringify(slice, null, 2)}\n`);
    console.log(
      `wrote ${outPath}: ${entries.length} queries under ` +
        `(${slice.identity.engineVersion}, ${slice.identity.corpusFingerprint.slice(0, 12)}…, ` +
        `${slice.identity.layerFingerprint.slice(0, 12)}…)`,
    );
  } finally {
    await engine.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
