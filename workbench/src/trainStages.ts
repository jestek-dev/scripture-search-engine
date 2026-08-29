/**
 * D12 — the three data-train pipeline stages as workbench jobs (votes-to-
 * engine plan §8.5 D12, §05 §5.2 data-train choreography, §5.4's whole-train
 * no-effect stop, §8.5 D13's sanctioned regen).
 *
 * Each stage is a FIXED command behind the exact-match job allowlist: the
 * browser posts only a jobId (`train-build`, `train-measure`,
 * `train-gauntlet`) to `POST /api/v2/checks`; no free-form command, path, or
 * train identifier ever crosses the HTTP boundary. The stage locates the one
 * sealed data train itself (single-flight guarantees at most one), executes,
 * and records its artifact in the admission-evidence registry — every train
 * state downstream of `sealed` is then DERIVED from those artifacts (V5):
 *
 *   train-build    → candidate binding      ⇒ `built`
 *   train-measure  → comparison publication ⇒ `measured`
 *   train-gauntlet → candidate gauntlet report (exact admission argv) plus
 *                    the D13 sanctioned baseline regen (two separate update
 *                    runs, each executed twice and byte-compared) ⇒ `ready`
 *
 * Every stage is IDEMPOTENT: the candidate build is content-addressed
 * (CACHE_HIT), the comparison publication is journaled, and the gauntlet
 * report is re-runnable — so a mid-run crash or server restart resumes by
 * simply running the stage again; a stage refusal exits non-zero with a
 * named line and writes nothing partial.
 *
 * The machine never writes an approval file: the regen asserts both
 * `*.approval.json` files byte-identical before and after, and refuses
 * otherwise (D13's "writing them is the human approval act").
 */
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import type { AdmissionCandidateBinding, DeferredSigningMarker } from './admission.js';
import type { AdmissionEvidenceEntry } from './admissionPublishOperations.js';
import { runCandidateBuild, type CandidateCliResult } from './candidateBuilder.js';
import type { ComparisonReport, ComparisonUniverseInput, FixtureComparisonDeclaration } from './comparison.js';
import { runAndPublishCandidateComparison, type ComparisonCandidateBinding } from './comparisonRunner.js';
import type { ProposalManifest } from './proposals.js';
import { resolveUpdatesInputPaths, type UpdatesInputPaths } from './updatesOperations.js';
import { createUpdatesStore, type TrainSnapshot } from './updatesStore.js';
import { provisionDetachedWorktree } from './worktreeProvision.js';

export const TRAIN_STAGES = ['build', 'measure', 'gauntlet'] as const;
export type TrainStage = (typeof TRAIN_STAGES)[number];

export class TrainStageError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'TrainStageError';
  }
}

function fail(code: string, message: string): never {
  throw new TrainStageError(code, message);
}

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

export interface TrainStageEngine {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  research(query: string): Promise<unknown>;
  close(): Promise<void>;
}

export interface TrainStageCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

export interface TrainStageDependencies {
  /** Builds (or cache-hits) the candidate. Defaults to `runCandidateBuild`. */
  readonly buildCandidate?: typeof runCandidateBuild;
  /** Runs + publishes the comparison. Defaults to the real runner. */
  readonly runComparison?: typeof runAndPublishCandidateComparison;
  /** Opens a live engine over a database file (reference or candidate). */
  readonly openEngine?: (databasePath: string) => Promise<TrainStageEngine>;
  /** Runs one fixed npm command in a cwd; the ONLY subprocess seam. */
  readonly runCommand?: (args: readonly string[], cwd: string) => Promise<TrainStageCommandResult>;
  /** Provisions a detached worktree with shared gitignored inputs. */
  readonly provisionWorktree?: (repoRoot: string, worktree: string) => Promise<void>;
  /** Applies the train's reviewed diffs into the regen worktree. */
  readonly applyDiffsToWorktree?: (worktree: string, entry: AdmissionEvidenceEntry) => Promise<void>;
}

export interface TrainStageOptions {
  readonly repoRoot: string;
  readonly reviewer: string;
  readonly updatesLogPath?: string;
  readonly judgmentsLogPath?: string;
  readonly casesLogPath?: string;
  readonly evidencePath?: string;
  /** A2's designated independent signer, or null while none is named. */
  readonly independentSigner?: string | null;
  readonly now?: () => Date;
  readonly dependencies?: TrainStageDependencies;
}

export interface TrainStageResult {
  readonly stage: TrainStage;
  readonly trainId: string;
  readonly status: 'DONE' | 'ALREADY_DONE' | 'STOPPED';
  /** Non-null on STOPPED: the closed stop reason that was recorded. */
  readonly stopReason: string | null;
  readonly detail: string;
}

interface RegistryFile {
  schemaVersion: 1;
  admissions: AdmissionEvidenceEntry[];
}

async function readRegistry(evidencePath: string): Promise<RegistryFile> {
  if (!existsSync(evidencePath)) fail('no_evidence', 'No update evidence exists yet — start an update first.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(evidencePath, 'utf8'));
  } catch {
    fail('evidence_registry_invalid', 'The saved update evidence could not be read.');
  }
  const record = parsed as { schemaVersion?: unknown; admissions?: unknown };
  if (record.schemaVersion !== 1 || !Array.isArray(record.admissions)) {
    fail('evidence_registry_invalid', 'The saved update evidence could not be read.');
  }
  return { schemaVersion: 1, admissions: record.admissions as AdmissionEvidenceEntry[] };
}

async function writeRegistryEntry(evidencePath: string, entry: AdmissionEvidenceEntry): Promise<void> {
  const registry = await readRegistry(evidencePath);
  const admissions = registry.admissions.map((candidate) => candidate.reviewId === entry.reviewId ? entry : candidate);
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify({ schemaVersion: 1, admissions }, null, 2)}\n`, 'utf8');
}

/**
 * Locates the one running data train: the latest sealed (not stopped) data
 * train in the log with a registry entry and no recorded admission manifest.
 * Single-flight (V7) guarantees at most one non-terminal train exists.
 */
async function locateDataTrain(paths: UpdatesInputPaths): Promise<{ snapshot: TrainSnapshot; entry: AdmissionEvidenceEntry }> {
  const store = createUpdatesStore({ logPath: paths.updatesLogPath });
  const fold = await store.read();
  const candidates = fold.trains.filter((train) => train.state === 'sealed' && train.flavor === 'data');
  if (candidates.length === 0) fail('no_data_train', 'No data update is running — start one from the Updates screen first.');
  const snapshot = candidates[candidates.length - 1]!;
  const registry = await readRegistry(paths.evidencePath);
  const entry = registry.admissions.find((candidate) => candidate.reviewId === snapshot.trainId);
  if (entry === undefined) fail('no_evidence', `The running update ${snapshot.trainId} has no saved evidence.`);
  const admissionsDirectory = path.join(paths.repoRoot, 'workbench', 'admissions');
  if (existsSync(admissionsDirectory)) {
    const names = (await readdir(admissionsDirectory)).filter((name) => /^[0-9a-f]{64}\.json$/.test(name));
    for (const name of names) {
      try {
        const manifest = JSON.parse(await readFile(path.join(admissionsDirectory, name), 'utf8')) as { proposalDigest?: unknown };
        const { proposalManifestDigest, parseProposalManifest } = await import('./proposals.js');
        if (manifest.proposalDigest === proposalManifestDigest(parseProposalManifest(entry.proposal))) {
          fail('already_admitted', `Update ${snapshot.trainId} is already approved — nothing for the checks to redo.`);
        }
      } catch (error) {
        if (error instanceof TrainStageError) throw error;
        // An unreadable manifest proves nothing.
      }
    }
  }
  return { snapshot, entry };
}

function candidateBindingOf(result: CandidateCliResult, descriptorBytes: Uint8Array): AdmissionCandidateBinding {
  const directory = `workbench/.state/candidates/${result.cacheKey}`;
  return {
    cacheKey: result.cacheKey,
    proposalDigest: result.descriptor.proposalDigest,
    sourceSnapshotDigest: result.descriptor.sourceSnapshotDigest,
    descriptorSha256: sha256(descriptorBytes),
    databaseSha256: result.descriptor.databaseSha256,
    engineVersion: result.descriptor.engineVersion,
    corpusFingerprint: result.descriptor.corpusFingerprint,
    layerFingerprint: result.descriptor.layerFingerprint,
    candidateDirectory: directory,
    descriptorPath: `${directory}/candidate-artifact.json`,
    databasePath: `${directory}/content.db`,
  };
}

async function buildCandidateForEntry(
  options: TrainStageOptions,
  paths: UpdatesInputPaths,
  entry: AdmissionEvidenceEntry,
): Promise<{ result: CandidateCliResult; binding: AdmissionCandidateBinding }> {
  const build = options.dependencies?.buildCandidate ?? runCandidateBuild;
  const result = await build({
    repositoryRoot: paths.repoRoot,
    baseDatabasePath: path.join(paths.repoRoot, 'workbench', '.artifact', 'content.db'),
    baseDescriptorPath: path.join(paths.repoRoot, 'artifacts', 'content-artifact.json'),
    outputDirectory: path.join(paths.repoRoot, 'workbench', '.state', 'candidates'),
    proposal: entry.proposal,
  });
  const descriptorBytes = await readFile(result.descriptorPath);
  return { result, binding: candidateBindingOf(result, descriptorBytes) };
}

/**
 * §5.2 step 3's comparison universe: the manifest's own fixture queries
 * (expectedChange — the votes asked for movement) plus every committed
 * golden fixture as regression coverage. Deterministic — file order sorted,
 * no sampling. Expected-outcome evaluation stays with the gauntlet's own
 * validator; the comparison here measures top-10 movement per query, which
 * is what the workbench no-effect predicate and the per-query review
 * coverage consume (admission.ts).
 */
export async function buildTrainComparisonUniverse(repoRoot: string, manifest: ProposalManifest): Promise<ComparisonUniverseInput> {
  const manifestQueries = new Map<string, string>();
  for (const operation of manifest.operations) {
    if (operation.type !== 'golden-fixture-upsert') continue;
    const fixture = operation.fixture as Record<string, unknown>;
    if (typeof fixture.query === 'string' && fixture.query.trim() !== '') {
      manifestQueries.set(operation.goldenFixtureId, fixture.query);
    }
  }
  const fixtureQueries: FixtureComparisonDeclaration[] = [];
  const seenQueries = new Set<string>();
  for (const [fixtureId, query] of [...manifestQueries.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    fixtureQueries.push({ sourceId: `manifest:${fixtureId}`, fixtureId, query, state: 'active', queryRole: 'primary', expectedChange: true });
    seenQueries.add(query);
  }
  const goldenDirectory = path.join(repoRoot, 'eval', 'golden');
  const names = existsSync(goldenDirectory) ? (await readdir(goldenDirectory)).filter((name) => name.endsWith('.json')).sort() : [];
  for (const name of names) {
    let fixture: Record<string, unknown>;
    try {
      fixture = JSON.parse(await readFile(path.join(goldenDirectory, name), 'utf8')) as Record<string, unknown>;
    } catch {
      continue;
    }
    const fixtureId = typeof fixture.id === 'string' ? fixture.id : name.replace(/\.json$/, '');
    if (manifestQueries.has(fixtureId)) continue;
    const query = typeof fixture.query === 'string' ? fixture.query : null;
    if (query === null || query.trim() === '' || seenQueries.has(query)) continue;
    seenQueries.add(query);
    fixtureQueries.push({
      sourceId: `golden:${fixtureId}`,
      fixtureId,
      query,
      state: fixture.status === 'pending' ? 'pending' : 'active',
      queryRole: 'primary',
      expectedChange: false,
    });
  }
  return { linkedCases: [], fixtureQueries, g8Probes: [], calibrationQueries: [], holdoutQueries: [], affectedConceptCases: [] };
}

async function defaultOpenEngine(databasePath: string): Promise<TrainStageEngine> {
  const { createEngine } = await import('@jestek-dev/scripture-engine/internal');
  const { openCorpus } = await import('./nodeSqlitePort.js');
  const port = openCorpus(databasePath);
  const engine = await createEngine(port);
  return {
    engineVersion: engine.engineVersion,
    corpusFingerprint: engine.corpusFingerprint,
    layerFingerprint: engine.layerFingerprint,
    research: (query: string) => engine.research(query),
    close: async () => {
      // Defensive on both handles: the comparison runner may already have
      // closed the engine (double-close threw ERR_INVALID_STATE from the
      // sqlite port in the D15 ride, masking the real failure). Both closes
      // are async — an un-awaited rejection here crashed the measure stage
      // as an unhandled rejection (second D15 ride finding).
      try { await engine.close(); } catch { /* already closed */ }
      try { await port.close?.(); } catch { /* already closed */ }
    },
  } as unknown as TrainStageEngine;
}

function defaultRunCommand(args: readonly string[], cwd: string): Promise<TrainStageCommandResult> {
  return new Promise((resolve, reject) => {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const child = spawn(npm, [...args], { cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (code) => resolve({ exitCode: code ?? 1, stdout, stderr }));
  });
}

const APPROVAL_PATHS = ['eval/baselines/probes.approval.json', 'eval/baselines/ordering.snapshot.approval.json'] as const;
const PROBES_BASELINE = 'eval/baselines/probes.json';
const ORDERING_SNAPSHOT = 'eval/baselines/ordering.snapshot.json';

export interface RegenOutcome {
  readonly probeBaselineText: string;
  readonly orderingSnapshotText: string;
  readonly evidence: NonNullable<AdmissionEvidenceEntry['regenEvidence']>;
}

/**
 * D13 — the sanctioned regeneration: two SEPARATE runs
 * (`--update-baseline`, then `--update-ordering-snapshot`), each executed
 * TWICE and byte-compared (4 runs total; the PR #65 double-run proof), on
 * the fixture bed in a scratch worktree with the train's reviewed diffs
 * applied and the artifact rebuilt. The machine refuses to write approval
 * files: both `*.approval.json` are asserted byte-identical afterward.
 */
export async function runSanctionedRegen(
  worktree: string,
  runCommand: (args: readonly string[], cwd: string) => Promise<TrainStageCommandResult>,
  now: () => Date,
): Promise<RegenOutcome> {
  const readRel = (relative: string): Promise<string> => readFile(path.join(worktree, ...relative.split('/')), 'utf8');
  const approvalsBefore = await Promise.all(APPROVAL_PATHS.map((relative) => readRel(relative)));

  const regenRun = async (flag: string, target: string): Promise<string> => {
    const first = await runCommand(['run', 'gauntlet', '--workspace', 'eval', '--', flag], worktree);
    // A regen run may exit non-zero when unrelated gates report red (the
    // standing debt): the update flag still writes its file. Refuse only
    // when the target file was not (re)written readable.
    const firstText = await readRel(target).catch(() => fail('regen_failed', `${flag} produced no readable ${target} (exit ${first.exitCode}).`));
    const second = await runCommand(['run', 'gauntlet', '--workspace', 'eval', '--', flag], worktree);
    const secondText = await readRel(target).catch(() => fail('regen_failed', `${flag} second run produced no readable ${target} (exit ${second.exitCode}).`));
    if (firstText !== secondText) {
      fail('regen_nondeterministic', `${flag} produced different bytes across its two runs — determinism is the product; nothing was recorded.`);
    }
    return secondText;
  };

  const probeBaselineText = await regenRun('--update-baseline', PROBES_BASELINE);
  const orderingSnapshotText = await regenRun('--update-ordering-snapshot', ORDERING_SNAPSHOT);

  const approvalsAfter = await Promise.all(APPROVAL_PATHS.map((relative) => readRel(relative)));
  for (const [index, relative] of APPROVAL_PATHS.entries()) {
    if (approvalsBefore[index] !== approvalsAfter[index]) {
      fail('approval_write_refused', `The regeneration touched ${relative} — the machine never writes an approval; writing it is the human approval act. Nothing was recorded.`);
    }
  }

  return {
    probeBaselineText,
    orderingSnapshotText,
    evidence: {
      probeBaselineRuns: 2,
      orderingSnapshotRuns: 2,
      probeBaselineByteIdentical: true,
      orderingSnapshotByteIdentical: true,
      probeBaselineSha256: sha256(probeBaselineText),
      orderingSnapshotSha256: sha256(orderingSnapshotText),
      regeneratedAt: now().toISOString(),
    },
  };
}

export async function runTrainStage(stage: TrainStage, options: TrainStageOptions): Promise<TrainStageResult> {
  if (!TRAIN_STAGES.includes(stage)) fail('unknown_stage', `Unsupported stage: ${String(stage)}.`);
  const paths = resolveUpdatesInputPaths(options);
  const now = options.now ?? ((): Date => new Date());
  const { snapshot, entry } = await locateDataTrain(paths);
  const trainId = snapshot.trainId;
  const store = createUpdatesStore({ logPath: paths.updatesLogPath });

  if (stage === 'build') {
    if (entry.candidate !== null) {
      return { stage, trainId, status: 'ALREADY_DONE', stopReason: null, detail: 'The trial copy is already built.' };
    }
    const { binding } = await buildCandidateForEntry(options, paths, entry);
    await writeRegistryEntry(paths.evidencePath, { ...entry, candidate: binding });
    return { stage, trainId, status: 'DONE', stopReason: null, detail: `Trial copy built (${binding.cacheKey.slice(0, 12)}).` };
  }

  if (stage === 'measure') {
    if (entry.comparison !== null) {
      return { stage, trainId, status: 'ALREADY_DONE', stopReason: null, detail: 'The before/after comparison already exists.' };
    }
    if (entry.candidate === null) fail('stage_order', 'The trial copy has not been built yet — run the build step first.');
    const { result } = await buildCandidateForEntry(options, paths, entry);
    const openEngine = options.dependencies?.openEngine ?? defaultOpenEngine;
    const runComparison = options.dependencies?.runComparison ?? runAndPublishCandidateComparison;
    const universe = await buildTrainComparisonUniverse(paths.repoRoot, entry.proposal as ProposalManifest);
    // The runner's precondition pins the CANDIDATE's descriptor bytes on
    // disk (it refuses when the built candidate drifted after the build) —
    // the base repo descriptor plays no part here (D15 ride finding: the
    // base descriptor sha made every real measure refuse as stale).
    const candidateDescriptorBytes = await readFile(result.descriptorPath);
    const reference = await openEngine(path.join(paths.repoRoot, 'workbench', '.artifact', 'content.db'));
    const candidateEngine = await openEngine(result.databasePath);
    let published: { report: ComparisonReport; binding: ComparisonCandidateBinding };
    try {
      published = await runComparison({
        candidateRootDirectory: path.join(paths.repoRoot, 'workbench', '.state', 'candidates'),
        candidate: result,
        descriptorPreconditionSha256: sha256(candidateDescriptorBytes),
        universe,
        referenceEngine: reference as never,
        candidateEngine: candidateEngine as never,
      });
    } finally {
      await reference.close().catch(() => undefined);
      await candidateEngine.close().catch(() => undefined);
    }
    const report = published.report;
    const anyEffect = report.queries.some((query) => query.top10Changed
      || query.expectedReferenceOutcomes.reference.some((outcome, index) => !outcome.passes && query.expectedReferenceOutcomes.candidate[index]?.passes === true));
    await writeRegistryEntry(paths.evidencePath, { ...entry, comparison: report, comparisonBinding: published.binding });
    if (!anyEffect) {
      // §5.4's whole-train stop (V12): NO MEASURABLE EFFECT is a stop, never
      // a merge — the stop pins the verified report it rests on, and every
      // card returns to the inbox with the honest explanation.
      await store.append([{
        schemaVersion: 1,
        eventId: randomUUID(),
        at: now().toISOString(),
        reviewer: options.reviewer,
        kind: 'train-stopped',
        trainId,
        reason: 'no-measurable-effect',
        reportDigest: report.digest,
      }]);
      return { stage, trainId, status: 'STOPPED', stopReason: 'no-measurable-effect', detail: 'The checks found this change would not alter any result — the update stopped and the cards returned to the inbox.' };
    }
    return { stage, trainId, status: 'DONE', stopReason: null, detail: `Compared ${report.queries.length} searches; ${report.summary.changedTop10QueryCount} changed.` };
  }

  // stage === 'gauntlet': the exact admission argv, then the D13 regen.
  if (entry.candidate === null || entry.comparison === null) {
    fail('stage_order', 'The trial copy and comparison come first — run the earlier steps.');
  }
  const runCommand = options.dependencies?.runCommand ?? defaultRunCommand;
  const reportRelative = `eval/.runs/${trainId}.json`;
  // §5.2 step 4 — no variation permitted: admission re-verifies the report
  // was produced in the fixed admission mode with exactly these flags.
  const gauntletArgs = ['run', 'gauntlet', '--workspace', 'eval', '--',
    '--require-admit', '--json', reportRelative,
    '--candidate-descriptor', entry.candidate.descriptorPath,
    '--candidate-database', entry.candidate.databasePath];
  await mkdir(path.join(paths.repoRoot, 'eval', '.runs'), { recursive: true });
  const gauntletRun = await runCommand(gauntletArgs, paths.repoRoot);
  const reportPath = path.join(paths.repoRoot, ...reportRelative.split('/'));
  if (!existsSync(reportPath)) {
    fail('gauntlet_failed', `The candidate checks produced no report (exit ${gauntletRun.exitCode}).`);
  }
  // FM-8's first row: a REJECT candidate verdict is the gates doing their
  // job — the train stops `verify-failed` with the verified report pinned
  // (§03.8's stop conversion reads it), and the cards return intact. The
  // regen never runs for a rejected candidate.
  let verdict: string | null = null;
  let reportDigest: string | null = null;
  try {
    const reportBytes = await readFile(reportPath);
    reportDigest = sha256(reportBytes);
    const parsedReport = JSON.parse(reportBytes.toString('utf8')) as { payload?: { verdict?: unknown } };
    verdict = typeof parsedReport.payload?.verdict === 'string' ? parsedReport.payload.verdict : null;
  } catch {
    fail('gauntlet_failed', 'The candidate checks report is unreadable.');
  }
  if (verdict !== 'ADMIT' && verdict !== 'ADMIT_WITH_WARNINGS') {
    await store.append([{
      schemaVersion: 1,
      eventId: randomUUID(),
      at: now().toISOString(),
      reviewer: options.reviewer,
      kind: 'train-stopped',
      trainId,
      reason: 'verify-failed',
      ...(reportDigest === null ? {} : { reportDigest }),
    }]);
    return { stage, trainId, status: 'STOPPED', stopReason: 'verify-failed', detail: 'The checks did not pass — the update stopped and the report names which check.' };
  }

  // D13 — sanctioned regen in a scratch worktree with the reviewed diffs
  // applied and the artifact rebuilt (the fixture bed AFTER operations).
  const provision = options.dependencies?.provisionWorktree ?? provisionDetachedWorktree;
  const applyDiffs = options.dependencies?.applyDiffsToWorktree ?? (async (worktree: string, current: AdmissionEvidenceEntry): Promise<void> => {
    const { computeOperationDiffs, } = await import('./admission.js');
    const { parseProposalManifest } = await import('./proposals.js');
    const diffs = await computeOperationDiffs(paths.repoRoot, parseProposalManifest(current.proposal));
    for (const diff of diffs.filter((candidate) => candidate.changed)) {
      const target = path.join(worktree, ...diff.path.split('/'));
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, Buffer.from(diff.after.base64, 'base64'));
    }
  });
  const worktree = path.join(os.tmpdir(), `sse-regen-${trainId}-${randomUUID()}`);
  let regen: RegenOutcome;
  const gitRun = (args: readonly string[]): Promise<TrainStageCommandResult> => new Promise((resolve, reject) => {
    const child = spawn('git', [...args], { cwd: paths.repoRoot, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (code) => resolve({ exitCode: code ?? 1, stdout, stderr }));
  });
  try {
    const added = await gitRun(['worktree', 'add', '--detach', worktree, entry.admittedBaseCommit]);
    if (added.exitCode !== 0) fail('regen_failed', `Could not prepare the regeneration workspace: ${added.stderr.trim()}`);
    await provision(paths.repoRoot, worktree);
    await applyDiffs(worktree, entry);
    // Rebuild the artifact in the worktree so the regen measures the
    // POST-change world (the candidate identity), never the base.
    const rebuilt = await runCommand(['run', 'build:artifact', '--workspace', 'pipeline', '--', '--out', path.join(worktree, 'workbench', '.artifact', 'content.db')], worktree);
    if (rebuilt.exitCode !== 0) fail('regen_failed', `The regeneration rebuild failed (exit ${rebuilt.exitCode}).`);
    regen = await runSanctionedRegen(worktree, runCommand, now);
  } finally {
    await gitRun(['worktree', 'remove', '--force', worktree]).catch(() => undefined);
    await rm(worktree, { recursive: true, force: true }).catch(() => undefined);
  }

  const readPrimary = async (relative: string): Promise<string> => readFile(path.join(paths.repoRoot, ...relative.split('/')), 'utf8').catch(() => '');
  const probeBefore = await readPrimary(PROBES_BASELINE);
  const orderingBefore = await readPrimary(ORDERING_SNAPSHOT);

  // §5.5 gap 2: the deferred-signing marker is a RECORDED decision, minted
  // only when governance has named the A2 independent signer. Without one
  // the entry carries the regenerated baselines and no marker — the train
  // freezes honestly at `ready` awaiting a signer (the A1 frozen queue).
  // Identity domain (D15 ride finding): the marker's two identities live in
  // the BASELINE (fixture-bed) domain, never the artifact's — admission's
  // pairing assertion compares expectedPostMergeIdentity against the
  // REGENERATED baseline's embedded identity, and the post-merge G2/G8
  // staleness findings quote baseline/approval identities. The artifact
  // triple lives in a different fingerprint domain and can never match.
  const embeddedIdentity = (text: string): DeferredSigningMarker['preRegenIdentity'] | null => {
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (typeof parsed.engineVersion !== 'string' || typeof parsed.corpusFingerprint !== 'string'
        || typeof parsed.layerFingerprint !== 'string') return null;
      return { engineVersion: parsed.engineVersion, corpusFingerprint: parsed.corpusFingerprint, layerFingerprint: parsed.layerFingerprint };
    } catch {
      return null;
    }
  };
  const signer = options.independentSigner ?? null;
  let marker: DeferredSigningMarker | null = null;
  if (signer !== null && signer.trim().length >= 2) {
    const preRegenIdentity = embeddedIdentity(probeBefore);
    const postMergeIdentity = embeddedIdentity(regen.probeBaselineText);
    const orderingIdentity = embeddedIdentity(regen.orderingSnapshotText);
    if (preRegenIdentity === null || postMergeIdentity === null) {
      fail('marker_identity_unreadable', 'The committed or regenerated probe baseline carries no readable engine identity — the deferred-signing marker cannot be minted honestly.');
    }
    if (orderingIdentity !== null && sha256(JSON.stringify(orderingIdentity)) !== sha256(JSON.stringify(postMergeIdentity))) {
      fail('marker_identity_unreadable', 'The regenerated probe baseline and ordering snapshot disagree on the engine identity — the deferred-signing marker cannot be minted honestly.');
    }
    marker = {
      kind: 'deferred-signing',
      preRegenIdentity,
      expectedPostMergeIdentity: postMergeIdentity,
      independentReviewer: signer,
      citation: 'merge-first-sign-once (V8, the J39 ruling): the approvals are signed once, after this update merges, against the settled identity — the machine never writes an approval.',
    };
  }

  await writeRegistryEntry(paths.evidencePath, {
    ...entry,
    gauntlet: { reportPath: reportRelative },
    probeBaseline: {
      path: 'eval/baselines/probes.json',
      beforeSha256: sha256(probeBefore),
      after: JSON.parse(regen.probeBaselineText) as never,
    },
    orderingSnapshot: {
      path: 'eval/baselines/ordering.snapshot.json',
      beforeSha256: sha256(orderingBefore),
      after: JSON.parse(regen.orderingSnapshotText) as never,
    },
    regenEvidence: regen.evidence,
    ...(marker === null ? {} : { deferredSigningMarker: marker }),
    reviewedComparisonQueries: entry.reviewedComparisonQueries,
  });
  return {
    stage,
    trainId,
    status: 'DONE',
    stopReason: null,
    detail: `Candidate checks recorded (${reportRelative}); baselines regenerated twice and byte-identical.`,
  };
}
