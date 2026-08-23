/**
 * CLI for the E7 faithfulness sampler (plan P7.4):
 *
 *   npm run faithfulness-sample --workspace eval -- \
 *     --database path/to/content.db \
 *     --out docs/reviews/<date>-faithfulness-<identity>.json \
 *     [--sample-size 50] [--queries eval/battery/queries.json]
 *
 * Emits the deterministic audit packet for the artifact's identity triple —
 * every chip with its underlying evidence rows and a `verdict: null` slot.
 * THE TOOL STOPS THERE: the audit itself (marking FAITHFUL/MISSTATED,
 * committing the record) is a human act gated on J45; nothing here fills a
 * verdict or writes into docs/reviews/ on its own.
 *
 * --sample-size defaults to 50, the plan's number; the parameter exists
 * because J45 reserves the number to Jesse.
 */

import { readFileSync, writeFileSync } from 'node:fs';

import { createEngine } from '@jestek-dev/scripture-engine';

import {
  buildFaithfulnessSample,
  renderFaithfulnessSample,
  type BatteryQueryRow,
} from './faithfulnessSample.js';
import { openCorpus } from './nodeSqlitePort.js';

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const databasePath = argValue('--database');
  const outPath = argValue('--out');
  if (!databasePath || !outPath) {
    console.error(
      'usage: faithfulnessSampleCli --database <content.db> --out <packet.json> [--sample-size N] [--queries <queries.json>]',
    );
    process.exit(2);
  }
  const sampleSizeRaw = argValue('--sample-size');
  const sampleSize = sampleSizeRaw === undefined ? undefined : Number.parseInt(sampleSizeRaw, 10);
  const queriesPath = argValue('--queries') ?? 'battery/queries.json';
  const battery = JSON.parse(readFileSync(queriesPath, 'utf8')) as {
    queries: readonly BatteryQueryRow[];
  };

  const port = openCorpus(databasePath);
  const engine = await createEngine(port);
  try {
    const sample = await buildFaithfulnessSample(engine, port, battery.queries, {
      ...(sampleSize === undefined ? {} : { sampleSize }),
    });
    writeFileSync(outPath, renderFaithfulnessSample(sample));
    console.log(
      `wrote ${outPath}: ${sample.entries.length} pairs (pool ${sample.poolSize}, ` +
        `shortfall ${sample.shortfall}) under (${sample.identity.engineVersion}, ` +
        `${sample.identity.corpusFingerprint.slice(0, 12)}…, ` +
        `${sample.identity.layerFingerprint.slice(0, 12)}…), seed ${sample.seed.slice(0, 12)}…`,
    );
    if (sample.shortfall > 0) {
      console.log(
        `NOTE: pool smaller than the requested sample — shortfall ${sample.shortfall} recorded in the packet, not padded.`,
      );
    }
  } finally {
    await engine.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
