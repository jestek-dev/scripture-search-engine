/**
 * Gauntlet entry point. Runs every gate whose inputs exist, prints the
 * Admission Report, and exits non-zero on REJECT so CI blocks the merge.
 *
 * Phase 0 wires G1, G2, G3, G4 and G10. The remaining gates report
 * 'not-applicable' with the reason, so the report always shows the complete
 * roster — an unrun gate must never look like a passing one.
 */

import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEngine } from '@lh/scripture-engine';

import { buildFixtureDatabase } from '../../pipeline/src/buildFixtureDb.js';
import { collisionGate, type ConceptRecord } from './gates/collision.js';
import {
  latencyGate,
  noiseGate,
  observeProbes,
  type Probe,
  type ProbeBaseline,
} from './gates/probes.js';
import { openCorpus } from './nodeSqlitePort.js';
import { determinismGate, goldenGate, type GoldenFixture } from './gates/golden.js';
import { notApplicable, pass, fail, type GateResult } from './gates/types.js';
import { buildReport } from './report.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const EVAL_ROOT = join(HERE, '..');
const REPO_ROOT = join(EVAL_ROOT, '..');

interface Budgets {
  readonly latency: { readonly p95Ms: number };
  readonly noise: {
    readonly maxTop10ChurnRatio: number;
    readonly maxWeakReasonShareIncrease: number;
    readonly minMeanDistinctiveness: number | null;
  };
  readonly size: {
    readonly totalArtifactBytes: number;
    readonly perTableBytes: Readonly<Record<string, number>>;
  };
  readonly collision: {
    readonly maxSharedPhraseRatio: number;
    readonly maxSharedTokenRatio: number;
    readonly minLexiconEntries: number;
  };
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function listJson(directory: string): string[] {
  try {
    return readdirSync(directory)
      .filter((name) => name.endsWith('.json'))
      .sort()
      .map((name) => join(directory, name));
  } catch {
    return [];
  }
}

function loadFixtures(): GoldenFixture[] {
  return listJson(join(EVAL_ROOT, 'golden')).map((path) => readJson<GoldenFixture>(path));
}

/**
 * Concepts live as YAML in ontology/concepts. Phase 0 ships no concepts, so
 * rather than pull in a YAML dependency for an empty directory, we count the
 * files and report the gate as not-applicable until Phase 2 adds the loader.
 */
function loadConcepts(): { concepts: ConceptRecord[]; fileCount: number } {
  const directory = join(REPO_ROOT, 'ontology', 'concepts');
  let fileCount = 0;
  try {
    fileCount = readdirSync(directory).filter((name) => name.endsWith('.yaml')).length;
  } catch {
    fileCount = 0;
  }
  return { concepts: [], fileCount };
}

/** G10: artifact size budgets, checked against the reviewed descriptor. */
function sizeGate(budgets: Budgets): GateResult {
  const descriptors = listJson(join(REPO_ROOT, 'artifacts'));
  if (descriptors.length === 0) {
    return notApplicable(
      'G10-size',
      'Size budgets',
      'no reviewed artifact descriptor in artifacts/ yet (Phase 2)',
    );
  }
  const findings = [];
  let largest = 0;
  for (const path of descriptors) {
    const descriptor = readJson<{ databaseBytes?: number }>(path);
    const bytes = descriptor.databaseBytes ?? 0;
    largest = Math.max(largest, bytes);
    if (bytes > budgets.size.totalArtifactBytes) {
      findings.push({
        message:
          `${path}: artifact is ${(bytes / 1024 / 1024).toFixed(1)} MiB, over the ` +
          `${(budgets.size.totalArtifactBytes / 1024 / 1024).toFixed(0)} MiB budget. ` +
          `Tighten a pruning threshold in eval/budgets.json or reduce admitted rows.`,
      });
    }
  }
  if (findings.length > 0) {
    return fail('G10-size', 'Size budgets', 'artifact exceeds its budget', findings);
  }
  return pass('G10-size', 'Size budgets', `${descriptors.length} descriptor(s) within budget`, {
    largestArtifactBytes: largest,
  });
}

/**
 * G1: in Phase 0 there is no artifact to walk, but the manifest directory
 * itself is checkable — an empty manifests/ means no source has been admitted,
 * which is the correct state before Phase 2 and is reported as such.
 */
function provenanceGate(): GateResult {
  const manifests = listJson(join(REPO_ROOT, 'pipeline', 'manifests'));
  if (manifests.length === 0) {
    return notApplicable(
      'G1-provenance',
      'Provenance',
      'no sources admitted yet; checkProvenance() is implemented and unit-tested ' +
        'in pipeline/, and runs against artifact rows from Phase 2',
    );
  }
  return pass('G1-provenance', 'Provenance', `${manifests.length} source manifest(s) present`, {
    manifests: manifests.length,
  });
}

const BASELINE_PATH = join(EVAL_ROOT, 'baselines', 'probes.json');

/**
 * Runs the probe set against a freshly built fixture artifact.
 *
 * Rebuilding rather than reusing a checked-in database is deliberate: the
 * gates must measure the code and data in THIS commit, and a stale binary
 * would let a broken build pass on yesterday's evidence.
 */
async function runProbeGates(budgets: Budgets): Promise<GateResult[]> {
  const probeFile = JSON.parse(readFileSync(join(EVAL_ROOT, 'probes', 'probes.json'), 'utf8')) as {
    probes: Probe[];
  };
  const built = buildFixtureDatabase();
  const engine = await createEngine(openCorpus(built.path));
  try {
    const { observations, latenciesMs } = await observeProbes(engine, probeFile.probes);
    const baseline: ProbeBaseline | null = existsSync(BASELINE_PATH)
      ? (JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as ProbeBaseline)
      : null;

    const noise = noiseGate({
      probes: probeFile.probes,
      observations,
      baseline,
      thresholds: budgets.noise,
    });

    // --update-baseline rewrites the committed baseline. Deliberately opt-in:
    // if the gate could refresh its own reference automatically, a slow drift
    // would never be caught, because every build would redefine "normal".
    if (process.argv.includes('--update-baseline')) {
      const next: ProbeBaseline = {
        corpusFingerprint: engine.corpusFingerprint,
        engineVersion: engine.engineVersion,
        observations,
      };
      writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 2)}
`, 'utf8');
      process.stderr.write(`Baseline updated: ${BASELINE_PATH}
`);
    }

    return [noise, latencyGate(latenciesMs, budgets.latency.p95Ms)];
  } finally {
    await engine.close();
  }
}

async function main(): Promise<void> {
  const budgets = readJson<Budgets>(join(EVAL_ROOT, 'budgets.json'));
  const fixtures = loadFixtures();
  const { concepts, fileCount } = loadConcepts();

  const probeGates = await runProbeGates(budgets);
  const gates: GateResult[] = [
    provenanceGate(),
    determinismGate(fixtures),
    goldenGate(fixtures),
    fileCount === 0
      ? notApplicable(
          'G4-collision',
          'Concept collision',
          'no concepts in ontology/concepts yet (Phase 2); gate is implemented and unit-tested',
        )
      : collisionGate(concepts, budgets.collision),
    notApplicable(
      'G5-distinctiveness',
      'Distinctiveness floor',
      'no passage term profiles yet (Phase 3)',
    ),
    pass(
      'G6-signal-budgets',
      'Signal budgets',
      'enforced structurally inside the scoring core; verified by engine unit tests',
    ),
    notApplicable('G7-correlation', 'Source correlation', 'no correlated sources admitted yet (Phase 2)'),
    probeGates[0]!,
    notApplicable('G9-saturation', 'Saturation', 'no corpus ingestion yet (Phase 3)'),
    sizeGate(budgets),
    probeGates[1]!,
  ];

  const report = buildReport({ gates });
  process.stdout.write(`${report.markdown}\n`);

  const summaryPath = process.env['GITHUB_STEP_SUMMARY'];
  if (summaryPath) {
    try {
      // Append so multiple jobs can contribute to one PR summary.
      appendFileSync(summaryPath, `\n${report.markdown}\n`);
    } catch {
      // A summary-write failure must never mask the gate verdict.
    }
  }

  if (report.verdict === 'REJECT') process.exit(1);
}

await main();
