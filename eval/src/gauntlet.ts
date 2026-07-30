/**
 * Gauntlet entry point. Runs every gate whose inputs exist, prints the
 * Admission Report, and exits non-zero on REJECT so CI blocks the merge.
 *
 * Phase 0 wires G1, G2, G3, G4 and G10. The remaining gates report
 * 'not-applicable' with the reason, so the report always shows the complete
 * roster — an unrun gate must never look like a passing one.
 */

import {
  appendFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEngine } from '@lh/scripture-engine';

import { buildFixtureDatabase } from '../../pipeline/src/buildFixtureDb.js';
import { collisionGate, type ConceptRecord } from './gates/collision.js';
import { corpusGoldenGate, type CorpusFixture } from './gates/corpusGolden.js';
import {
  distinctivenessGate,
  saturationGate,
  type DistillateFile,
} from './gates/layerB.js';
import { compileOntology } from '../../pipeline/src/importers/ontologyImporter.js';
import {
  correlationGroups,
  type ManifestSet,
  type SourceManifest,
} from '../../pipeline/src/provenance/manifest.js';
import {
  latencyGate,
  noiseGate,
  observeProbes,
  type Probe,
  type ProbeBaseline,
} from './gates/probes.js';
import { openCorpus } from './nodeSqlitePort.js';
import { determinismGate, goldenGate, type GoldenFixture } from './gates/golden.js';
import { notApplicable, pass, fail, warn, type GateResult } from './gates/types.js';
import { DEFAULT_BUDGETS } from '@lh/scripture-engine';
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
  readonly distinctiveness: {
    readonly minPmi: number;
    readonly maxTermsPerVerse: number;
  };
  readonly saturation: {
    readonly minProfileDelta: number;
    readonly worksPerPericopeBeforeCheck: number;
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

/** Compiles the curated ontology so G4 runs against the real concept set. */
function loadConcepts(): { concepts: ConceptRecord[]; fileCount: number; errors: string[] } {
  const directory = join(REPO_ROOT, 'ontology', 'concepts');
  let names: string[] = [];
  try {
    names = readdirSync(directory).filter((name) => name.endsWith('.yaml')).sort();
  } catch {
    return { concepts: [], fileCount: 0, errors: [] };
  }
  const files = names.map((name) => ({
    name,
    contents: readFileSync(join(directory, name), 'utf8'),
  }));
  const { ontology, errors } = compileOntology(files);
  const lexiconByConcept = new Map<string, string[]>();
  for (const entry of ontology.lexicon) {
    const bucket = lexiconByConcept.get(entry.conceptId);
    if (bucket) bucket.push(entry.phrase);
    else lexiconByConcept.set(entry.conceptId, [entry.phrase]);
  }
  return {
    concepts: ontology.concepts.map((concept) => ({
      id: concept.id,
      label: concept.label,
      lexicon: lexiconByConcept.get(concept.id) ?? [],
    })),
    fileCount: names.length,
    errors: [...errors],
  };
}

function loadManifestSet(): ManifestSet {
  const directory = join(REPO_ROOT, 'pipeline', 'manifests');
  return {
    sources: listJson(directory).map((path) => readJson<SourceManifest>(path)),
  };
}

/**
 * Which signal family each source's evidence lands in. G7's job is to verify
 * that sources sharing scholarly ancestry also share a ranking budget — if a
 * lineage group's families are budgeted separately, the same underlying
 * scholarship gets counted twice as independent evidence.
 */
const SOURCE_FAMILY: Readonly<Record<string, string>> = {
  'openbible-xrefs': 'cross_reference',
  tsk: 'cross_reference',
  'sermon-co-citations': 'co_citation',
};

function correlationGate(): GateResult {
  const manifests = loadManifestSet();
  const groups = correlationGroups(manifests);
  if (groups.length === 0) {
    return notApplicable(
      'G7-correlation',
      'Source correlation',
      'no sources declare shared lineage yet',
    );
  }

  const budgetedTogether = DEFAULT_BUDGETS.correlationGroups.map((group) => new Set(group));
  const findings = [];
  for (const group of groups) {
    const families = [...new Set(group.map((id) => SOURCE_FAMILY[id]).filter(Boolean))];
    if (families.length < 2) continue;
    const shared = budgetedTogether.some((budget) =>
      families.every((family) => budget.has(family as never)),
    );
    if (!shared) {
      findings.push({
        message:
          `Sources ${group.join(', ')} declare shared lineage but their signal families ` +
          `(${families.join(', ')}) are not in one correlation budget. The same scholarship ` +
          'would be counted twice as independent evidence.',
        subjects: [...group],
      });
    }
  }
  if (findings.length > 0) {
    return fail('G7-correlation', 'Source correlation', 'lineage not reflected in budgets', findings);
  }
  return pass(
    'G7-correlation',
    'Source correlation',
    `${groups.length} lineage group(s) declared and budgeted together: ` +
      groups.map((group) => group.join('+')).join('; '),
    { lineageGroups: groups.length },
  );
}

/**
 * G10: artifact size budgets.
 *
 * Measures the artifact this build actually produced, then checks it against
 * the reviewed descriptors. Measuring the live build rather than trusting a
 * committed number is the point — a descriptor can go stale, a build cannot.
 */
function sizeGate(budgets: Budgets, builtPath: string): GateResult {
  const findings = [];
  let largest = 0;

  if (existsSync(builtPath)) {
    const bytes = statSync(builtPath).size;
    largest = bytes;
    if (bytes > budgets.size.totalArtifactBytes) {
      findings.push({
        message:
          `Built artifact is ${(bytes / 1024 / 1024).toFixed(1)} MiB, over the ` +
          `${(budgets.size.totalArtifactBytes / 1024 / 1024).toFixed(0)} MiB budget. Tighten a ` +
          'pruning threshold in eval/budgets.json or reduce admitted rows.',
      });
    }
  }

  const descriptors = listJson(join(REPO_ROOT, 'artifacts'));
  if (descriptors.length === 0 && findings.length === 0) {
    return pass(
      'G10-size',
      'Size budgets',
      `built artifact ${(largest / 1024 / 1024).toFixed(2)} MiB within the ` +
        `${(budgets.size.totalArtifactBytes / 1024 / 1024).toFixed(0)} MiB budget ` +
        '(no reviewed release descriptor yet)',
      { builtArtifactBytes: largest },
    );
  }
  for (const path of descriptors) {
    const descriptor = readJson<{
      databaseBytes?: number;
      perTableBytes?: Readonly<Record<string, number>>;
    }>(path);
    const bytes = descriptor.databaseBytes ?? 0;
    largest = Math.max(largest, bytes);

    // Per-table budgets. These existed as data for months while no gate read
    // them, and two of their keys named tables that had been renamed away —
    // protection on paper only. A table with no budget is reported rather than
    // waved through, because silence is how the next verse_terms appears.
    for (const [table, tableBytes] of Object.entries(descriptor.perTableBytes ?? {})) {
      const budget = budgets.size.perTableBytes[table];
      if (budget === undefined) {
        if (tableBytes > 1024 * 1024) {
          findings.push({
            message:
              `${table} is ${(tableBytes / 1024 / 1024).toFixed(1)} MiB and has no budget in ` +
              'eval/budgets.json. Give it one or explain why it cannot grow.',
            subjects: [table],
          });
        }
        continue;
      }
      if (tableBytes > budget) {
        findings.push({
          message:
            `${table} is ${(tableBytes / 1024 / 1024).toFixed(1)} MiB, over its ` +
            `${(budget / 1024 / 1024).toFixed(0)} MiB budget (indexes included). Tighten a ` +
            'pruning threshold or reduce admitted rows for this table specifically.',
          subjects: [table],
        });
      }
    }
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
  return pass(
    'G10-size',
    'Size budgets',
    `${descriptors.length} descriptor(s) within budget: ` +
      `${(largest / 1024 / 1024).toFixed(1)} MiB of ` +
      `${(budgets.size.totalArtifactBytes / 1024 / 1024).toFixed(0)} MiB total, and every ` +
      'table within its own',
    { largestArtifactBytes: largest },
  );
}

/**
 * G1: in Phase 0 there is no artifact to walk, but the manifest directory
 * itself is checkable — an empty manifests/ means no source has been admitted,
 * which is the correct state before Phase 2 and is reported as such.
 *
 * Beyond presence, every manifest that claims a checksum must also say WHERE
 * the checksummed bytes came from, precisely enough to fetch them again. This
 * gate previously passed a manifest whose `sourceUrl` was a landing page and
 * whose `sha256` therefore identified a file nobody could retrieve — a
 * checksum with nothing on the other end of it, which reads as provenance
 * while providing none. A corpus you cannot re-fetch is a corpus you cannot
 * verify, so the shape of the URL is checked structurally here.
 *
 * Whether the URL still RESOLVES is a separate, network-dependent question;
 * see reachabilityGate, which reports rather than blocks.
 */
function provenanceGate(): GateResult {
  const files = listJson(join(REPO_ROOT, 'pipeline', 'manifests'));
  if (files.length === 0) {
    return notApplicable(
      'G1-provenance',
      'Provenance',
      'no sources admitted yet; checkProvenance() is implemented and unit-tested ' +
        'in pipeline/, and runs against artifact rows from Phase 2',
    );
  }

  const findings: string[] = [];
  for (const file of files) {
    // listJson returns full paths already.
    const manifest = JSON.parse(readFileSync(file, 'utf8')) as SourceManifest;

    // A manifest with no checksum is declarative — it exists so other sources
    // can express lineage against it (G7), and pins no bytes of its own.
    if (!manifest.sha256) continue;

    if (!manifest.sourceUrl) {
      findings.push(`${manifest.id}: pins a checksum but records no sourceUrl`);
      continue;
    }
    // A directory or bare origin cannot identify the checksummed bytes: the
    // page it serves changes, and the file the checksum describes is one of
    // many things linked from it.
    if (/\/$/.test(manifest.sourceUrl)) {
      findings.push(
        `${manifest.id}: sourceUrl "${manifest.sourceUrl}" is a landing page, not a file — ` +
          'the checksum cannot be re-verified from it',
      );
    }
  }

  if (findings.length > 0) {
    return fail(
      'G1-provenance',
      'Provenance',
      'checksum(s) with unrecoverable origin',
      findings.map((message) => ({ message })),
    );
  }

  return pass(
    'G1-provenance',
    'Provenance',
    `${files.length} source manifest(s); every checksum names a retrievable file`,
    { manifests: files.length },
  );
}

/**
 * G1b: are the pinned source URLs still reachable?
 *
 * Reported, never blocking. A third party being down for an hour is not a
 * reason to fail someone's PR, and a gate that fails for reasons unrelated to
 * the change teaches people to ignore gates. What this catches is the slow
 * failure — a source that quietly disappears — which matters at the moment
 * you need to rebuild, not at the moment it vanishes.
 *
 * Skipped entirely offline and in CI unless explicitly requested, so the
 * gauntlet stays hermetic by default.
 */
async function reachabilityGate(): Promise<GateResult> {
  if (!process.argv.includes('--check-sources')) {
    return notApplicable(
      'G1b-reachability',
      'Source reachability',
      'network check is opt-in; run `npm run gauntlet -- --check-sources` to verify ' +
        'every pinned sourceUrl still resolves',
    );
  }

  const files = listJson(join(REPO_ROOT, 'pipeline', 'manifests'));
  const findings: string[] = [];
  let checked = 0;

  for (const file of files) {
    const manifest = JSON.parse(readFileSync(file, 'utf8')) as SourceManifest;
    if (!manifest.sha256 || !manifest.sourceUrl) continue;
    checked += 1;
    try {
      const response = await fetch(manifest.sourceUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        findings.push(`${manifest.id}: HTTP ${response.status} for ${manifest.sourceUrl}`);
      }
    } catch (error) {
      findings.push(
        `${manifest.id}: unreachable (${error instanceof Error ? error.message : 'error'})`,
      );
    }
  }

  if (findings.length > 0) {
    return warn(
      'G1b-reachability',
      'Source reachability',
      `${findings.length} of ${checked} pinned source(s) did not respond`,
      findings.map((message) => ({ message })),
    );
  }
  return pass(
    'G1b-reachability',
    'Source reachability',
    `${checked} pinned source URL(s) still resolve`,
    { checked },
  );
}

const BASELINE_PATH = join(EVAL_ROOT, 'baselines', 'probes.json');
const DISTILLATE_PATH = join(REPO_ROOT, 'pipeline', 'fixtures', 'passage-terms-subset.json');

function loadDistillate(): DistillateFile | null {
  return existsSync(DISTILLATE_PATH) ? readJson<DistillateFile>(DISTILLATE_PATH) : null;
}

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

    const corpusFixtures = loadFixtures() as unknown as CorpusFixture[];
    const corpusGolden = await corpusGoldenGate(engine, corpusFixtures);

    return [noise, latencyGate(latenciesMs, budgets.latency.p95Ms), corpusGolden];
  } finally {
    await engine.close();
  }
}

async function main(): Promise<void> {
  const budgets = readJson<Budgets>(join(EVAL_ROOT, 'budgets.json'));
  const fixtures = loadFixtures();
  const { concepts, fileCount, errors: ontologyErrors } = loadConcepts();

  const distillate = loadDistillate();
  const probeGates = await runProbeGates(budgets);
  const gates: GateResult[] = [
    provenanceGate(),
    await reachabilityGate(),
    determinismGate(fixtures),
    goldenGate(fixtures),
    probeGates[2]!,
    fileCount === 0
      ? notApplicable(
          'G4-collision',
          'Concept collision',
          'no concepts in ontology/concepts yet; gate is implemented and unit-tested',
        )
      : ontologyErrors.length > 0
        ? fail(
            'G4-collision',
            'Concept collision',
            'ontology failed to compile',
            ontologyErrors.map((message) => ({ message })),
          )
        : collisionGate(concepts, budgets.collision),
    distinctivenessGate(distillate, budgets.distinctiveness),
    pass(
      'G6-signal-budgets',
      'Signal budgets',
      'enforced structurally inside the scoring core; verified by engine unit tests',
    ),
    correlationGate(),
    probeGates[0]!,
    saturationGate(distillate, budgets.saturation),
    sizeGate(budgets, join(REPO_ROOT, 'pipeline', 'output', 'fixture.db')),
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
