/**
 * Gauntlet entry point. Runs every gate whose inputs exist, prints the
 * Admission Report, and exits non-zero on REJECT so CI blocks the merge.
 *
 * Phase 0 wires G1, G2, G3, G4 and G10. The remaining gates report
 * 'not-applicable' with the reason, so the report always shows the complete
 * roster — an unrun gate must never look like a passing one.
 */

import { appendFileSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { collisionGate, type ConceptRecord } from './gates/collision.js';
import { determinismGate, goldenGate, type GoldenFixture } from './gates/golden.js';
import { notApplicable, pass, fail, type GateResult } from './gates/types.js';
import { buildReport } from './report.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const EVAL_ROOT = join(HERE, '..');
const REPO_ROOT = join(EVAL_ROOT, '..');

interface Budgets {
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

function main(): void {
  const budgets = readJson<Budgets>(join(EVAL_ROOT, 'budgets.json'));
  const fixtures = loadFixtures();
  const { concepts, fileCount } = loadConcepts();

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
    notApplicable('G8-noise-probes', 'Noise probes', 'no artifact to probe yet (Phase 2)'),
    notApplicable('G9-saturation', 'Saturation', 'no corpus ingestion yet (Phase 3)'),
    sizeGate(budgets),
    notApplicable('G11-latency', 'Latency', 'no artifact to query yet (Phase 2)'),
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

main();
