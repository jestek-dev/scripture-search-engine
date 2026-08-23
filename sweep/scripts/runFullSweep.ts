/**
 * Local full-sweep driver (MS-6): the same universe → sweep → merge →
 * grade-l1 → report pipeline the workflow runs, in one process, for
 * iteration on interim builds.
 *
 *   --artifact <content.db> --descriptor <json> --out <dir>
 *   [--shards n]
 *   [--interim-shakedown --k-grammar n --k-paraphrase n [--per-book n]]
 *
 * Without --interim-shakedown the certified preconditions must hold
 * (terminus identity + J43 numbers) or the run refuses with the
 * not-applicable reasons — fail-closed, never vacuous. Interim shakedown
 * requires the k values EXPLICITLY: an interim run states its numbers, it
 * never inherits unsigned defaults.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { sha256Hex } from '../src/canonical.js';
import { mergeShards, runSweep } from '../src/harness.js';
import { checkCertifiedPreconditions } from '../src/preconditions.js';
import { REPO_ROOT } from '../src/universe/compileFromRepo.js';

function flagValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

const argv = process.argv.slice(2);
const artifactPath = flagValue(argv, '--artifact');
const descriptorPath = flagValue(argv, '--descriptor');
const outDir = flagValue(argv, '--out');
if (!artifactPath || !descriptorPath || !outDir) {
  console.error(
    'usage: runFullSweep --artifact <db> --descriptor <json> --out <dir> [--shards n] ' +
      '[--interim-shakedown --k-grammar n --k-paraphrase n [--per-book n]]',
  );
  process.exit(2);
}
const shards = Number(flagValue(argv, '--shards') ?? '1');
const interim = argv.includes('--interim-shakedown');

if (!interim) {
  const findings = checkCertifiedPreconditions();
  const failures = findings.filter((finding) => !finding.ok);
  if (failures.length > 0) {
    for (const failure of failures) console.error(`${failure.name}: ${failure.reason}`);
    console.error('Refusing a certified-mode run; use --interim-shakedown with explicit k values.');
    process.exit(2);
  }
}

const tsx = join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
function runStep(name: string, script: string, args: readonly string[]): void {
  const result = spawnSync(process.execPath, [tsx, join(REPO_ROOT, 'sweep', script), ...args], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    timeout: 3_600_000,
  });
  if (result.status !== 0) {
    console.error(`step ${name} failed (${result.status})`);
    process.exit(result.status ?? 1);
  }
}

mkdirSync(outDir, { recursive: true });

// 1. Universe freshness, then the full run universe.
runStep('universe-freshness', 'src/universe/freshnessCli.ts', []);
const universePath = join(outDir, 'run-universe.jsonl');
const kArgs = interim
  ? [
      '--k-grammar',
      flagValue(argv, '--k-grammar') ?? '(missing)',
      '--k-paraphrase',
      flagValue(argv, '--k-paraphrase') ?? '(missing)',
      ...(flagValue(argv, '--per-book') !== undefined
        ? ['--per-book', flagValue(argv, '--per-book')!]
        : []),
    ]
  : [];
runStep('build-universe', 'scripts/buildRunUniverse.ts', ['--out', universePath, ...kArgs]);

// 2. Sweep shards + byte-stable merge.
for (let shard = 0; shard < shards; shard += 1) {
  const result = await runSweep({
    artifactPath,
    universePath,
    outDir,
    shard,
    ofShards: shards,
    descriptorPath,
  });
  console.log(`shard ${shard}/${shards}: ${result.lineCount} queries, canonical ${result.canonicalSnapshotSha256.slice(0, 12)}…`);
}
const merged = mergeShards(outDir, shards);
console.log(`merged: ${merged.lineCount} lines, canonical ${merged.canonicalSnapshotSha256}`);

// 3. Layer-1 grading.
runStep('grade-l1', 'src/grade/layer1Cli.ts', [
  '--universe',
  universePath,
  '--snapshot',
  merged.mergedPath,
  '--out',
  outDir,
]);

// 4. Report stub: the run manifest ties everything to the identity.
const summary = JSON.parse(readFileSync(join(outDir, 'layer1-summary.json'), 'utf8')) as object;
writeFileSync(
  join(outDir, 'run-report.json'),
  `${JSON.stringify(
    {
      formatVersion: 1,
      mode: interim ? 'interim-shakedown' : 'certified-preconditions-met',
      universeFingerprint: sha256Hex(readFileSync(universePath, 'utf8')),
      mergedCanonicalSha256: merged.canonicalSnapshotSha256,
      layer1: summary,
    },
    null,
    2,
  )}\n`,
);
console.log(`run report → ${join(outDir, 'run-report.json')}`);
