/**
 * Audit runner — turns a directory of device distillates into the Gap
 * Report and updates the master analyzed record.
 *
 * Usage:
 *   npx tsx scripts/mineSearchLog.ts --dump <dir-of-distillates> \
 *     --artifact <content.db> [--artifact <older.db> ...] \
 *     [--out <report.md>] [--master <master-record.json>]
 *
 * The dump directory is the AUDIT DUMP: delete it when the audit closes
 * (docs/telemetry-and-gap-mining.md §6b). The master record is the document
 * that is kept — pass --master to update it in place.
 *
 * Artifacts are matched to each logged identity by ALL THREE identities
 * (engine version, corpus fingerprint, layer fingerprint); pass one
 * --artifact per artifact version represented in the dump. Conversions
 * whose identity no artifact reproduces are counted `unreplayable` and
 * excluded from evidence rather than half-trusted.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEngine, ENGINE_VERSION, type ScriptureEngine, type ContentQueryPort, type ContentQueryResult, type ContentScalar } from '@jestek-dev/scripture-engine';
import { DatabaseSync } from 'node:sqlite';

import { buildSensitiveMatcher, loadSensitiveCategories } from '../src/telemetry/categories.js';
import { mine, updateMasterRecord, type MasterRecord } from '../src/telemetry/mine.js';
import type { Distillate, TelemetryBudgets } from '../src/telemetry/types.js';
import { validateDistillate } from '../src/telemetry/validate.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const BUDGETS_PATH = join(HERE, '..', '..', 'eval', 'budgets.json');

function openPort(path: string): ContentQueryPort {
  const database = new DatabaseSync(path, { readOnly: true });
  return {
    async execute(query: string, params: readonly ContentScalar[] = []): Promise<ContentQueryResult> {
      const rows = database.prepare(query).all(...(params as never[])) as Record<string, ContentScalar>[];
      return { rows };
    },
    async close(): Promise<void> {
      database.close();
    },
  };
}

function argValues(flag: string): string[] {
  const values: string[] = [];
  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] === flag && process.argv[index + 1]) values.push(process.argv[index + 1]!);
  }
  return values;
}

async function main(): Promise<void> {
  const dumpDir = argValues('--dump')[0];
  const artifactPaths = argValues('--artifact');
  const outPath = argValues('--out')[0];
  const masterPath = argValues('--master')[0];
  if (!dumpDir || artifactPaths.length === 0) {
    process.stderr.write(
      'usage: tsx scripts/mineSearchLog.ts --dump <dir> --artifact <content.db> [--artifact ...] [--out report.md] [--master master-record.json]\n',
    );
    process.exit(2);
    return;
  }

  const budgets = (JSON.parse(readFileSync(BUDGETS_PATH, 'utf8')) as { telemetry: TelemetryBudgets }).telemetry;
  const sensitive = buildSensitiveMatcher(loadSensitiveCategories());

  // ---- read and validate the dump; refuse-and-name, never repair --------
  const distillates: Distillate[] = [];
  const rejected: string[] = [];
  for (const name of readdirSync(dumpDir).filter((entry) => entry.endsWith('.json')).sort()) {
    const parsed: unknown = JSON.parse(readFileSync(join(dumpDir, name), 'utf8'));
    const result = validateDistillate(parsed);
    if (result.ok) distillates.push(parsed as Distillate);
    else rejected.push(`${name}: ${result.errors.join('; ')}`);
  }
  if (rejected.length > 0) {
    process.stderr.write(`rejected ${rejected.length} distillate(s):\n${rejected.map((line) => `  ${line}`).join('\n')}\n`);
  }
  if (distillates.length === 0) {
    process.stderr.write('no valid distillates — nothing to audit.\n');
    process.exit(1);
    return;
  }

  const engines: ScriptureEngine[] = [];
  try {
    for (const path of artifactPaths) {
      engines.push(await createEngine(openPort(path)));
    }
    process.stdout.write(
      `auditing ${distillates.length} distillate(s) against ${engines.length} artifact(s) ` +
        `(miner engine ${ENGINE_VERSION})\n`,
    );

    const { report, markdown } = await mine(distillates, engines, budgets, sensitive);

    if (outPath) {
      writeFileSync(outPath, markdown);
      process.stdout.write(`report  : ${outPath}\n`);
    } else {
      process.stdout.write(`\n${markdown}`);
    }

    if (masterPath) {
      const previous: MasterRecord | null = existsSync(masterPath)
        ? (JSON.parse(readFileSync(masterPath, 'utf8')) as MasterRecord)
        : null;
      const next = updateMasterRecord(previous, report);
      writeFileSync(masterPath, `${JSON.stringify(next, null, 2)}\n`);
      process.stdout.write(`master  : ${masterPath} (${Object.keys(next.clusters).length} cluster(s), ${next.audits.length} audit(s))\n`);
    }

    process.stdout.write(
      '\nAudit complete. The dump directory is now disposable — delete it (§6b: the\n' +
        'master record is the document that is kept; the dump is the one that dies).\n',
    );
  } finally {
    for (const engine of engines) await engine.close();
  }
}

await main();
