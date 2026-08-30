/**
 * D12/D13 — the three data-train stages as self-locating jobs (votes-to-
 * engine plan §8.5 D12, §5.2, §5.4) and the sanctioned regen (D13).
 *
 * Coverage per the AC blocks: each stage locates the single sealed data
 * train itself (no identifier crosses any boundary); stages are idempotent
 * (restart-resume); stage order is enforced; `built`/`measured`/`ready`
 * derive from the recorded artifacts; the §5.4 whole-train no-effect stop
 * records `no-measurable-effect` with the report digest pinned; a REJECT
 * candidate verdict stops `verify-failed` before any regen; the D13 regen
 * runs each update twice and byte-compares, REFUSES to write approval files,
 * and records the double-run evidence; the deferred-signing marker is minted
 * only when an independent signer is named (A1 frozen queue otherwise).
 */
import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import type { ResearchResult, ScriptureEngine } from '@jestek-dev/scripture-engine';
import { afterEach, describe, expect, it } from 'vitest';

import type { AdmissionEvidenceEntry } from '../src/admissionPublishOperations.js';
import type { CandidateCliResult } from '../src/candidateBuilder.js';
import { compareEngines, type ComparisonUniverseInput, type EngineIdentity } from '../src/comparison.js';
import type { ComparisonCandidateBinding } from '../src/comparisonRunner.js';
import {
  buildTrainComparisonUniverse,
  runSanctionedRegen,
  runTrainStage,
  TrainStageError,
  type TrainStageCommandResult,
  type TrainStageDependencies,
  type TrainStageOptions,
} from '../src/trainStages.js';
import {
  createTrainOperations,
  SIGNING_HOLD_DEBT_STANDS,
  SIGNING_HOLD_NO_SIGNER,
  type TrainOperations,
} from '../src/trainRunner.js';
import { createUpdatesStore } from '../src/updatesStore.js';
import { parseProposalManifest } from '../src/proposals.js';

const execFileAsync = promisify(execFile);
const temporary: string[] = [];

const REFERENCE: EngineIdentity = { engineVersion: 'test-engine', corpusFingerprint: 'a'.repeat(64), layerFingerprint: 'b'.repeat(64) };
const CANDIDATE: EngineIdentity = { ...REFERENCE, corpusFingerprint: 'c'.repeat(64) };
const CASE_ID = '41111111-1111-4111-8111-111111111111';

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

async function git(cwd: string, args: readonly string[]): Promise<string> {
  const result = await execFileAsync('git', [...args], { cwd, windowsHide: true });
  return result.stdout.trim();
}

function fakeEngine(identity: EngineIdentity, targetsByQuery: (query: string) => readonly string[]): ScriptureEngine {
  return {
    ...identity,
    async research(query: string): Promise<ResearchResult> {
      return {
        kind: 'discovery', query, ...identity,
        results: targetsByQuery(query).map((targetId, index) => ({
          targetId, reference: targetId, excerpt: targetId, score: 10 - index,
          reasons: [{ family: 'concept_anchor', label: 'Anchor', points: 10 - index }],
        })),
      };
    },
    async themes() { return []; }, async passage() { throw new Error('unused'); },
    async related() { throw new Error('unused'); }, async forSong() { throw new Error('unused'); }, async close() {},
  };
}

const PROVENANCE = {
  source: 'editorial', confirmed: true, reviewer: 'Jesse',
  evidence: 'The cited passage directly names the reviewed theme.',
};

function dataProposal(): unknown {
  return {
    schemaVersion: 1, proposalId: 'train-0001', fixtureId: 'love-your-enemies', caseIds: [CASE_ID],
    sourcePreconditions: [
      { path: 'eval/golden/love-your-enemies.json', sha256: 'b'.repeat(64) },
      { path: 'pipeline/fixtures/web-subset.json', sha256: 'c'.repeat(64) },
    ],
    operations: [
      {
        operationId: 'chapter-add-matthew-5', type: 'fixture-corpus-chapter-add',
        book: 'Matthew', chapter: 5,
        why: 'The voted answer lives in a chapter the test corpus does not carry yet.',
        sourcePaths: ['pipeline/fixtures/web-subset.json'], provenance: PROVENANCE,
        reason: 'Bring the voted chapter into the test corpus so the answer can be checked.',
      },
      {
        operationId: 'golden-love-your-enemies', type: 'golden-fixture-upsert', goldenFixtureId: 'love-your-enemies',
        fixture: { id: 'love-your-enemies', query: 'love your enemies', status: 'pending', expectedTop: [{ ref: 'Matthew 5:44', withinTop: 10 }] },
        sourcePaths: ['eval/golden/love-your-enemies.json'], provenance: PROVENANCE,
        reason: 'Measures the corpus movement on the same manifest.',
      },
    ],
  };
}

const PROBES_TEXT = `${JSON.stringify({ ...REFERENCE, observations: [] }, null, 2)}\n`;
const ORDERING_TEXT = `${JSON.stringify({ ...REFERENCE, orderings: [] }, null, 2)}\n`;
const PROBES_APPROVAL_TEXT = `${JSON.stringify({ schema: 'probe-approval/v1', reviewer: 'Prior' }, null, 2)}\n`;
const ORDERING_APPROVAL_TEXT = `${JSON.stringify({ schema: 'ordering-approval/v1', reviewer: 'Prior' }, null, 2)}\n`;

interface StageRepo {
  readonly root: string;
  readonly commit: string;
  readonly options: (dependencies: TrainStageDependencies, independentSigner?: string | null) => TrainStageOptions;
  readonly registry: () => Promise<{ admissions: AdmissionEvidenceEntry[] }>;
  readonly entry: () => Promise<AdmissionEvidenceEntry>;
  readonly storedState: (trainId: string) => Promise<string>;
}

async function stageRepo(): Promise<StageRepo> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'train-stages-'));
  temporary.push(root);
  await git(root, ['init', '-b', 'main']);
  await git(root, ['config', 'core.autocrlf', 'false']);
  await mkdir(path.join(root, 'eval', 'baselines'), { recursive: true });
  await mkdir(path.join(root, 'eval', 'golden'), { recursive: true });
  await mkdir(path.join(root, 'artifacts'), { recursive: true });
  await mkdir(path.join(root, 'workbench', '.artifact'), { recursive: true });
  await mkdir(path.join(root, 'workbench', 'review-data'), { recursive: true });
  await writeFile(path.join(root, 'eval', 'baselines', 'probes.json'), PROBES_TEXT);
  await writeFile(path.join(root, 'eval', 'baselines', 'probes.approval.json'), PROBES_APPROVAL_TEXT);
  await writeFile(path.join(root, 'eval', 'baselines', 'ordering.snapshot.json'), ORDERING_TEXT);
  await writeFile(path.join(root, 'eval', 'baselines', 'ordering.snapshot.approval.json'), ORDERING_APPROVAL_TEXT);
  // One committed golden fixture on a DIFFERENT query: it must enter the
  // comparison universe as regression coverage (expectedChange: false).
  await writeFile(path.join(root, 'eval', 'golden', 'mercy.json'), `${JSON.stringify({
    id: 'mercy', generatedBy: 'workbench', status: 'active', query: 'mercy',
    expectedTop: [{ ref: 'Psalm 85:10', withinTop: 3 }],
  }, null, 2)}\n`);
  await mkdir(path.join(root, 'pipeline', 'fixtures'), { recursive: true });
  await writeFile(path.join(root, 'pipeline', 'fixtures', 'web-subset.json'), `${JSON.stringify({
    $schema: 'verse-array-subset/1',
    selection: [{ book: 'James', chapters: [1, 2], why: 'test' }],
    verses: [],
  }, null, 2)}\n`);
  await writeFile(path.join(root, 'artifacts', 'content-artifact.json'), `${JSON.stringify({ kind: 'base-descriptor' }, null, 2)}\n`);
  await writeFile(path.join(root, 'workbench', '.artifact', 'content.db'), Buffer.from('reference database'));
  await git(root, ['add', '--all']);
  await git(root, ['-c', 'user.name=Stage Test', '-c', 'user.email=stage@example.test', 'commit', '-m', 'base']);
  const commit = await git(root, ['rev-parse', 'HEAD']);

  const updatesLogPath = path.join(root, 'workbench', 'updates.jsonl');
  const store = createUpdatesStore({ logPath: updatesLogPath });
  const at = '2026-08-28T12:00:00.000Z';
  await store.append([
    { schemaVersion: 1, eventId: randomUUID(), at, reviewer: 'jesse', kind: 'card-drafted', cardId: '11'.repeat(32), judgmentIds: [CASE_ID] },
    { schemaVersion: 1, eventId: randomUUID(), at, reviewer: 'jesse', kind: 'card-approved', cardId: '11'.repeat(32) },
    { schemaVersion: 1, eventId: randomUUID(), at, reviewer: 'jesse', kind: 'train-opened', trainId: 'train-0001', flavor: 'data' },
    {
      schemaVersion: 1, eventId: randomUUID(), at, reviewer: 'jesse', kind: 'train-sealed', trainId: 'train-0001',
      sealDigest: 'a1'.repeat(32), cardIds: ['11'.repeat(32)], judgmentIds: [CASE_ID], replayIdentity: REFERENCE,
    },
  ]);

  const evidencePath = path.join(root, 'workbench', 'review-data', 'admission-evidence.json');
  const entry: AdmissionEvidenceEntry = {
    reviewId: 'train-0001',
    admittedBaseCommit: commit,
    admittedOriginBaseCommit: null,
    expectedMainCommit: commit,
    proposal: dataProposal() as AdmissionEvidenceEntry['proposal'],
    candidate: null,
    comparison: null,
    comparisonBinding: null,
    gauntlet: null,
    baseIdentity: REFERENCE,
    reviewedComparisonQueries: [],
    provenance: ['train:train-0001'],
  };
  await writeFile(evidencePath, `${JSON.stringify({ schemaVersion: 1, admissions: [entry] }, null, 2)}\n`, 'utf8');

  return {
    root,
    commit,
    options: (dependencies, independentSigner = null) => ({
      repoRoot: root,
      reviewer: 'jesse',
      updatesLogPath,
      judgmentsLogPath: path.join(root, 'workbench', 'judgments.jsonl'),
      casesLogPath: path.join(root, 'workbench', 'cases.jsonl'),
      evidencePath,
      independentSigner,
      now: () => new Date('2026-08-28T13:00:00.000Z'),
      dependencies,
    }),
    registry: async () => JSON.parse(await readFile(evidencePath, 'utf8')) as { admissions: AdmissionEvidenceEntry[] },
    entry: async () => {
      const registry = JSON.parse(await readFile(evidencePath, 'utf8')) as { admissions: AdmissionEvidenceEntry[] };
      return registry.admissions.find((candidate) => candidate.reviewId === 'train-0001')!;
    },
    storedState: async (trainId: string) => {
      const fold = await createUpdatesStore({ logPath: updatesLogPath }).read();
      return fold.trains.find((train) => train.trainId === trainId)!.state;
    },
  };
}

/** A fake candidate build that writes real content-addressed files. */
function fakeBuildCandidate(root: string): { build: TrainStageDependencies['buildCandidate']; calls: number[] } {
  const calls: number[] = [];
  const cacheKey = 'e'.repeat(64);
  const build = (async () => {
    calls.push(1);
    const directory = path.join(root, 'workbench', '.state', 'candidates', cacheKey);
    await mkdir(directory, { recursive: true });
    const database = Buffer.from('candidate database');
    const descriptor = {
      formatVersion: 1 as const, kind: 'scripture-search-candidate' as const, cacheKey,
      proposalDigest: 'd2'.repeat(32), sourceSnapshotDigest: 'f'.repeat(64), provenancePolicyFingerprint: '9'.repeat(64),
      base: {
        databaseSha256: sha256('reference database'), schemaVersion: '1', engineVersion: REFERENCE.engineVersion,
        tokenizerVersion: '1', corpusFingerprint: REFERENCE.corpusFingerprint, layerFingerprint: REFERENCE.layerFingerprint,
        manifestFingerprint: '8'.repeat(64), provenancePolicyFingerprint: '9'.repeat(64),
      },
      schemaVersion: '1', engineVersion: CANDIDATE.engineVersion, tokenizerVersion: '1',
      corpusFingerprint: CANDIDATE.corpusFingerprint, layerFingerprint: CANDIDATE.layerFingerprint,
      manifestFingerprint: '8'.repeat(64), databaseSha256: sha256(database), databaseBytes: database.byteLength,
      logicalTableDigest: '7'.repeat(64), tableDigests: {}, counts: {},
    };
    const descriptorPath = path.join(directory, 'candidate-artifact.json');
    const databasePath = path.join(directory, 'content.db');
    await writeFile(descriptorPath, `${JSON.stringify(descriptor, null, 2)}\n`);
    await writeFile(databasePath, database);
    return {
      status: calls.length > 1 ? 'CACHE_HIT' : 'BUILT',
      cacheKey,
      candidateDirectory: directory,
      databasePath,
      descriptorPath,
      descriptor,
    } satisfies CandidateCliResult;
  }) as unknown as NonNullable<TrainStageDependencies['buildCandidate']>;
  return { build, calls };
}

/** The comparison seam: compares the two seam engines over the REAL universe. */
function fakeRunComparison(captured: { universe: ComparisonUniverseInput | null }): NonNullable<TrainStageDependencies['runComparison']> {
  return (async (options) => {
    captured.universe = options.universe;
    // The runner's real precondition pins the CANDIDATE descriptor bytes on
    // disk — a base-descriptor sha here refused every real measure (D15).
    const descriptorBytes = await readFile(options.candidate.descriptorPath);
    if (createHash('sha256').update(descriptorBytes).digest('hex') !== options.descriptorPreconditionSha256) {
      throw new Error('descriptorPreconditionSha256 must pin the CANDIDATE descriptor bytes.');
    }
    const report = await compareEngines(options.universe, options.referenceEngine, options.candidateEngine);
    const binding: ComparisonCandidateBinding = {
      cacheKey: options.candidate.cacheKey,
      proposalDigest: options.candidate.descriptor.proposalDigest,
      databaseSha256: options.candidate.descriptor.databaseSha256,
      descriptorSha256: 'd3'.repeat(32),
      referenceIdentity: REFERENCE,
      candidateIdentity: CANDIDATE,
      comparisonDigest: report.digest,
    };
    return {
      status: 'PUBLISHED' as const,
      directory: 'workbench/.state/comparisons/test',
      commitManifestPath: 'workbench/.state/comparisons/test/commit.json',
      machineReportPath: 'workbench/.state/comparisons/test/machine.json',
      summaryJsonPath: 'workbench/.state/comparisons/test/summary.json',
      summaryMarkdownPath: 'workbench/.state/comparisons/test/summary.md',
      binding,
      report,
    };
  }) as NonNullable<TrainStageDependencies['runComparison']>;
}

function openEngines(movedCandidate: boolean): NonNullable<TrainStageDependencies['openEngine']> {
  return async (databasePath: string) => {
    const isCandidate = databasePath.includes('.state');
    const identity = isCandidate ? CANDIDATE : REFERENCE;
    const targets = (query: string): readonly string[] => {
      if (query === 'love your enemies') return isCandidate && movedCandidate ? ['MAT:5:44', 'B'] : ['B', 'C'];
      return ['P', 'Q'];
    };
    const engine = fakeEngine(identity, targets);
    return {
      engineVersion: identity.engineVersion,
      corpusFingerprint: identity.corpusFingerprint,
      layerFingerprint: identity.layerFingerprint,
      research: (query: string) => engine.research(query),
      close: async () => undefined,
    };
  };
}

afterEach(async () => {
  for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true });
});

describe('D12 — self-locating stage jobs over the sealed data train', () => {
  it('build: locates the train, records the candidate binding (⇒ built), and is idempotent on rerun', async () => {
    const repo = await stageRepo();
    const { build, calls } = fakeBuildCandidate(repo.root);
    const first = await runTrainStage('build', repo.options({ buildCandidate: build }));
    expect(first).toMatchObject({ stage: 'build', trainId: 'train-0001', status: 'DONE' });
    const entry = await repo.entry();
    expect(entry.candidate).not.toBeNull();
    expect(entry.candidate!.cacheKey).toBe('e'.repeat(64));
    expect(entry.candidate!.candidateDirectory).toBe(`workbench/.state/candidates/${'e'.repeat(64)}`);

    // Restart-resume: running the stage again reports ALREADY_DONE and
    // builds nothing new (idempotency is the recovery story).
    const second = await runTrainStage('build', repo.options({ buildCandidate: build }));
    expect(second.status).toBe('ALREADY_DONE');
    expect(calls).toHaveLength(1);
  });

  it('measure before build refuses stage_order; gauntlet before measure refuses stage_order', async () => {
    const repo = await stageRepo();
    await expect(runTrainStage('measure', repo.options({}))).rejects.toMatchObject({ code: 'stage_order' });
    await expect(runTrainStage('gauntlet', repo.options({}))).rejects.toMatchObject({ code: 'stage_order' });
  });

  it('measure: records the comparison (⇒ measured) over the §5.2 universe — manifest queries expectedChange, committed goldens as regression coverage', async () => {
    const repo = await stageRepo();
    const { build } = fakeBuildCandidate(repo.root);
    await runTrainStage('build', repo.options({ buildCandidate: build }));
    const captured: { universe: ComparisonUniverseInput | null } = { universe: null };
    const result = await runTrainStage('measure', repo.options({
      buildCandidate: build,
      runComparison: fakeRunComparison(captured),
      openEngine: openEngines(true),
    }));
    expect(result.status).toBe('DONE');
    expect(captured.universe).not.toBeNull();
    expect(captured.universe!.fixtureQueries.map((entry) => [entry.query, entry.expectedChange])).toEqual([
      ['love your enemies', true],
      ['mercy', false],
    ]);
    const entry = await repo.entry();
    expect(entry.comparison).not.toBeNull();
    expect(entry.comparisonBinding).not.toBeNull();
    // The observed state derives measured from the artifact — never stored.
    expect(await repo.storedState('train-0001')).toBe('sealed');
    const trains = createTrainOperations({
      repoRoot: repo.root, reviewer: 'jesse',
      updatesLogPath: path.join(repo.root, 'workbench', 'updates.jsonl'),
      judgmentsLogPath: path.join(repo.root, 'workbench', 'judgments.jsonl'),
      casesLogPath: path.join(repo.root, 'workbench', 'cases.jsonl'),
      evidencePath: path.join(repo.root, 'workbench', 'review-data', 'admission-evidence.json'),
      readMain: async () => repo.commit,
      readOriginMain: async () => null,
      readGoldenMainHistory: async () => [],
    });
    const view = await trains.train('train-0001', REFERENCE);
    expect(view.state).toBe('measured');
    // The data Update Report exists from measured on — the D12a fallback's
    // honest stopping point ("held at measured with its report generated").
    expect(view.report).not.toBeNull();
    expect(view.report!.kind).toBe('data-update-report');
  });

  it('measure with no measurable effect stops the WHOLE train (§5.4/V12) with the report digest pinned', async () => {
    const repo = await stageRepo();
    const { build } = fakeBuildCandidate(repo.root);
    await runTrainStage('build', repo.options({ buildCandidate: build }));
    const captured: { universe: ComparisonUniverseInput | null } = { universe: null };
    const result = await runTrainStage('measure', repo.options({
      buildCandidate: build,
      runComparison: fakeRunComparison(captured),
      // The candidate answers exactly like the reference: nothing moves.
      openEngine: openEngines(false),
    }));
    expect(result.status).toBe('STOPPED');
    expect(result.stopReason).toBe('no-measurable-effect');
    expect(await repo.storedState('train-0001')).toBe('stopped');
    const entry = await repo.entry();
    const fold = await createUpdatesStore({ logPath: path.join(repo.root, 'workbench', 'updates.jsonl') }).read();
    const stopped = fold.trains.find((train) => train.trainId === 'train-0001')!.stopped!;
    expect(stopped.reason).toBe('no-measurable-effect');
    expect(stopped.reportDigest).toBe((entry.comparison as { digest: string }).digest);
  });

  it('refuses honestly when no sealed data train exists', async () => {
    const repo = await stageRepo();
    // Stop the only train; the locator must refuse rather than guess.
    const store = createUpdatesStore({ logPath: path.join(repo.root, 'workbench', 'updates.jsonl') });
    await store.append([{
      schemaVersion: 1, eventId: randomUUID(), at: '2026-08-28T14:00:00.000Z', reviewer: 'jesse',
      kind: 'train-stopped', trainId: 'train-0001', reason: 'verify-failed',
    }]);
    await expect(runTrainStage('build', repo.options({}))).rejects.toMatchObject({ code: 'no_data_train' });
  });
});

describe('D12/D13 — the gauntlet stage: exact argv, FM-8 reject stop, sanctioned regen', () => {
  interface CommandLogEntry { args: readonly string[]; cwd: string }

  function gauntletRunCommand(repo: StageRepo, behavior: {
    verdict?: string;
    regenBytes?: (flag: string, run: number) => string;
    touchApproval?: boolean;
  }): { run: (args: readonly string[], cwd: string) => Promise<TrainStageCommandResult>; log: CommandLogEntry[] } {
    const log: CommandLogEntry[] = [];
    const regenRuns = new Map<string, number>();
    const run = async (args: readonly string[], cwd: string): Promise<TrainStageCommandResult> => {
      log.push({ args, cwd });
      if (args.includes('--require-admit')) {
        const reportRelative = args[args.indexOf('--json') + 1]!;
        const target = path.join(cwd, ...reportRelative.split('/'));
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, `${JSON.stringify({ schemaVersion: 1, payload: { verdict: behavior.verdict ?? 'ADMIT' } }, null, 2)}\n`);
        return { exitCode: behavior.verdict === 'REJECT' ? 1 : 0, stdout: '', stderr: '' };
      }
      if (args.includes('build:artifact')) {
        const out = args[args.indexOf('--out') + 1]!;
        await mkdir(path.dirname(out), { recursive: true });
        await writeFile(out, Buffer.from('rebuilt candidate database'));
        return { exitCode: 0, stdout: '', stderr: '' };
      }
      const flag = args.includes('--update-baseline') ? '--update-baseline'
        : args.includes('--update-ordering-snapshot') ? '--update-ordering-snapshot' : null;
      if (flag !== null) {
        const runNumber = (regenRuns.get(flag) ?? 0) + 1;
        regenRuns.set(flag, runNumber);
        const target = flag === '--update-baseline' ? 'eval/baselines/probes.json' : 'eval/baselines/ordering.snapshot.json';
        const bytes = behavior.regenBytes?.(flag, runNumber)
          ?? `${JSON.stringify({ ...CANDIDATE, regenerated: target }, null, 2)}\n`;
        await writeFile(path.join(cwd, ...target.split('/')), bytes);
        if (behavior.touchApproval === true) {
          await writeFile(path.join(cwd, 'eval', 'baselines', 'probes.approval.json'), '{"forged":true}\n');
        }
        return { exitCode: 0, stdout: '', stderr: '' };
      }
      return { exitCode: 0, stdout: '', stderr: '' };
    };
    return { run, log };
  }

  async function measured(repo: StageRepo): Promise<TrainStageDependencies> {
    const { build } = fakeBuildCandidate(repo.root);
    await runTrainStage('build', repo.options({ buildCandidate: build }));
    const captured: { universe: ComparisonUniverseInput | null } = { universe: null };
    await runTrainStage('measure', repo.options({
      buildCandidate: build, runComparison: fakeRunComparison(captured), openEngine: openEngines(true),
    }));
    return { buildCandidate: build };
  }

  it('runs the EXACT admission argv, then the D13 regen (2×2 byte-compared) and records evidence; no marker without a signer', async () => {
    const repo = await stageRepo();
    const base = await measured(repo);
    const { run, log } = gauntletRunCommand(repo, {});
    const result = await runTrainStage('gauntlet', repo.options({
      ...base, runCommand: run, provisionWorktree: async () => undefined, applyDiffsToWorktree: async () => undefined,
    }));
    expect(result.status).toBe('DONE');

    // §5.2 step 4 — no variation permitted in the candidate gauntlet argv.
    const gauntletCall = log.find((entry) => entry.args.includes('--require-admit'))!;
    const entry = await repo.entry();
    expect(gauntletCall.args).toEqual(['run', 'gauntlet', '--workspace', 'eval', '--',
      '--require-admit', '--json', 'eval/.runs/train-0001.json',
      '--candidate-descriptor', entry.candidate!.descriptorPath,
      '--candidate-database', entry.candidate!.databasePath]);
    expect(gauntletCall.cwd).toBe(repo.root);

    // D13: each update flag ran TWICE, in the scratch worktree, after the
    // rebuild — 4 regen runs total, and the double-run is recorded.
    const regenCalls = log.filter((call) => call.args.includes('--update-baseline') || call.args.includes('--update-ordering-snapshot'));
    expect(regenCalls).toHaveLength(4);
    expect(new Set(regenCalls.map((call) => call.cwd)).size).toBe(1);
    expect(regenCalls[0]!.cwd).not.toBe(repo.root);
    expect(entry.gauntlet).toEqual({ reportPath: 'eval/.runs/train-0001.json' });
    expect(entry.regenEvidence).toMatchObject({
      probeBaselineRuns: 2, orderingSnapshotRuns: 2,
      probeBaselineByteIdentical: true, orderingSnapshotByteIdentical: true,
    });
    expect(entry.probeBaseline).toMatchObject({ path: 'eval/baselines/probes.json', beforeSha256: sha256(PROBES_TEXT) });
    expect(entry.orderingSnapshot).toMatchObject({ path: 'eval/baselines/ordering.snapshot.json', beforeSha256: sha256(ORDERING_TEXT) });
    // A1 frozen queue: with no independent signer named, NO deferred-signing
    // marker is minted — the train will freeze at ready, honestly.
    expect(entry.deferredSigningMarker).toBeUndefined();

    // The primary worktree's approval files were never touched.
    expect(await readFile(path.join(repo.root, 'eval', 'baselines', 'probes.approval.json'), 'utf8')).toBe(PROBES_APPROVAL_TEXT);
    // The scratch worktree is cleaned up.
    const gitWorktrees = await git(repo.root, ['worktree', 'list', '--porcelain']);
    expect(gitWorktrees.split('\n\n')).toHaveLength(1);
  });

  it('mints the deferred-signing marker only when the independent signer is named, binding the candidate identity', async () => {
    const repo = await stageRepo();
    const base = await measured(repo);
    const { run } = gauntletRunCommand(repo, {});
    await runTrainStage('gauntlet', repo.options({
      ...base, runCommand: run, provisionWorktree: async () => undefined, applyDiffsToWorktree: async () => undefined,
    }, 'Named Independent Signer'));
    const entry = await repo.entry();
    expect(entry.deferredSigningMarker).toMatchObject({
      kind: 'deferred-signing',
      preRegenIdentity: REFERENCE,
      expectedPostMergeIdentity: {
        engineVersion: CANDIDATE.engineVersion,
        corpusFingerprint: CANDIDATE.corpusFingerprint,
        layerFingerprint: CANDIDATE.layerFingerprint,
      },
      independentReviewer: 'Named Independent Signer',
    });
    expect(entry.deferredSigningMarker!.citation).toContain('merge-first-sign-once');
  });

  it('FM-8 first row: a REJECT candidate verdict stops verify-failed with the report pinned, and the regen never runs', async () => {
    const repo = await stageRepo();
    const base = await measured(repo);
    const { run, log } = gauntletRunCommand(repo, { verdict: 'REJECT' });
    const result = await runTrainStage('gauntlet', repo.options({
      ...base, runCommand: run, provisionWorktree: async () => undefined, applyDiffsToWorktree: async () => undefined,
    }));
    expect(result.status).toBe('STOPPED');
    expect(result.stopReason).toBe('verify-failed');
    expect(await repo.storedState('train-0001')).toBe('stopped');
    const fold = await createUpdatesStore({ logPath: path.join(repo.root, 'workbench', 'updates.jsonl') }).read();
    expect(fold.trains[0]!.stopped!.reportDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(log.some((call) => call.args.includes('--update-baseline'))).toBe(false);
    const entry = await repo.entry();
    expect(entry.gauntlet).toBeNull();
  });

  it('D13: a nondeterministic regen refuses regen_nondeterministic and records nothing', async () => {
    const repo = await stageRepo();
    const base = await measured(repo);
    const { run } = gauntletRunCommand(repo, {
      regenBytes: (flag, runNumber) => `${JSON.stringify({ flag, runNumber }, null, 2)}\n`,
    });
    await expect(runTrainStage('gauntlet', repo.options({
      ...base, runCommand: run, provisionWorktree: async () => undefined, applyDiffsToWorktree: async () => undefined,
    }))).rejects.toMatchObject({ code: 'regen_nondeterministic' });
    const entry = await repo.entry();
    expect(entry.gauntlet).toBeNull();
    expect(entry.regenEvidence).toBeUndefined();
  });

  it('D13 AC: the runner REFUSES to write approval files — a touched *.approval.json fails approval_write_refused', async () => {
    const repo = await stageRepo();
    const base = await measured(repo);
    const { run } = gauntletRunCommand(repo, { touchApproval: true });
    await expect(runTrainStage('gauntlet', repo.options({
      ...base, runCommand: run, provisionWorktree: async () => undefined, applyDiffsToWorktree: async () => undefined,
    }))).rejects.toMatchObject({ code: 'approval_write_refused' });
    const entry = await repo.entry();
    expect(entry.regenEvidence).toBeUndefined();
  });
});

describe('runSanctionedRegen (unit)', () => {
  it('refuses when an approval file changes even if targets are deterministic', async () => {
    const worktree = await mkdtemp(path.join(os.tmpdir(), 'regen-unit-'));
    temporary.push(worktree);
    await mkdir(path.join(worktree, 'eval', 'baselines'), { recursive: true });
    await writeFile(path.join(worktree, 'eval', 'baselines', 'probes.json'), PROBES_TEXT);
    await writeFile(path.join(worktree, 'eval', 'baselines', 'probes.approval.json'), PROBES_APPROVAL_TEXT);
    await writeFile(path.join(worktree, 'eval', 'baselines', 'ordering.snapshot.json'), ORDERING_TEXT);
    await writeFile(path.join(worktree, 'eval', 'baselines', 'ordering.snapshot.approval.json'), ORDERING_APPROVAL_TEXT);
    let touched = false;
    const run = async (args: readonly string[], cwd: string): Promise<TrainStageCommandResult> => {
      const target = args.includes('--update-baseline') ? 'eval/baselines/probes.json' : 'eval/baselines/ordering.snapshot.json';
      await writeFile(path.join(cwd, ...target.split('/')), '{"stable":true}\n');
      if (!touched) {
        touched = true;
        await writeFile(path.join(cwd, 'eval', 'baselines', 'ordering.snapshot.approval.json'), '{"machine-signed":true}\n');
      }
      return { exitCode: 0, stdout: '', stderr: '' };
    };
    await expect(runSanctionedRegen(worktree, run, () => new Date('2026-08-28T13:00:00.000Z')))
      .rejects.toMatchObject({ code: 'approval_write_refused' });
  });

  it('records the double-run evidence with the regenerated digests', async () => {
    const worktree = await mkdtemp(path.join(os.tmpdir(), 'regen-unit-'));
    temporary.push(worktree);
    await mkdir(path.join(worktree, 'eval', 'baselines'), { recursive: true });
    await writeFile(path.join(worktree, 'eval', 'baselines', 'probes.json'), PROBES_TEXT);
    await writeFile(path.join(worktree, 'eval', 'baselines', 'probes.approval.json'), PROBES_APPROVAL_TEXT);
    await writeFile(path.join(worktree, 'eval', 'baselines', 'ordering.snapshot.json'), ORDERING_TEXT);
    await writeFile(path.join(worktree, 'eval', 'baselines', 'ordering.snapshot.approval.json'), ORDERING_APPROVAL_TEXT);
    const run = async (args: readonly string[], cwd: string): Promise<TrainStageCommandResult> => {
      const target = args.includes('--update-baseline') ? 'eval/baselines/probes.json' : 'eval/baselines/ordering.snapshot.json';
      await writeFile(path.join(cwd, ...target.split('/')), `{"stable":"${target}"}\n`);
      return { exitCode: 0, stdout: '', stderr: '' };
    };
    const outcome = await runSanctionedRegen(worktree, run, () => new Date('2026-08-28T13:00:00.000Z'));
    expect(outcome.evidence).toEqual({
      probeBaselineRuns: 2,
      orderingSnapshotRuns: 2,
      probeBaselineByteIdentical: true,
      orderingSnapshotByteIdentical: true,
      probeBaselineSha256: sha256('{"stable":"eval/baselines/probes.json"}\n'),
      orderingSnapshotSha256: sha256('{"stable":"eval/baselines/ordering.snapshot.json"}\n'),
      regeneratedAt: '2026-08-28T13:00:00.000Z',
    });
  });
});

describe('buildTrainComparisonUniverse', () => {
  it('is deterministic and never samples: manifest queries sorted first, goldens sorted after, duplicates collapsed', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'universe-'));
    temporary.push(root);
    await mkdir(path.join(root, 'eval', 'golden'), { recursive: true });
    await writeFile(path.join(root, 'eval', 'golden', 'b.json'), JSON.stringify({ id: 'b', query: 'beta', status: 'active' }));
    await writeFile(path.join(root, 'eval', 'golden', 'a.json'), JSON.stringify({ id: 'a', query: 'alpha', status: 'pending' }));
    // The manifest's own fixture also exists on disk: it must not double.
    await writeFile(path.join(root, 'eval', 'golden', 'love-your-enemies.json'), JSON.stringify({ id: 'love-your-enemies', query: 'love your enemies', status: 'pending' }));
    const manifest = parseProposalManifest(dataProposal());
    const universe = await buildTrainComparisonUniverse(root, manifest);
    expect(universe.fixtureQueries.map((entry) => [entry.sourceId, entry.expectedChange, entry.state])).toEqual([
      ['manifest:love-your-enemies', true, 'active'],
      ['golden:a', false, 'pending'],
      ['golden:b', false, 'active'],
    ]);
  });
});

describe('stage errors', () => {
  it('an unknown stage is refused with a named error', async () => {
    await expect(runTrainStage('deploy' as never, { repoRoot: '/nonexistent', reviewer: 'jesse' }))
      .rejects.toBeInstanceOf(TrainStageError);
  });
});

// ---------------------------------------------------------------------------
// D14 + the frozen-awaiting-signer state (A1 frozen queue, open call 4)
// ---------------------------------------------------------------------------

describe('D14 sign act and the frozen-awaiting-signer hold on a ready data train', () => {
  function trainOps(repo: StageRepo, independentSigner: string | null): TrainOperations {
    return createTrainOperations({
      repoRoot: repo.root, reviewer: 'jesse',
      updatesLogPath: path.join(repo.root, 'workbench', 'updates.jsonl'),
      judgmentsLogPath: path.join(repo.root, 'workbench', 'judgments.jsonl'),
      casesLogPath: path.join(repo.root, 'workbench', 'cases.jsonl'),
      evidencePath: path.join(repo.root, 'workbench', 'review-data', 'admission-evidence.json'),
      independentSigner,
      readMain: async () => repo.commit,
      readOriginMain: async () => null,
      readGoldenMainHistory: async () => [],
    });
  }

  async function readyRepo(signer: string | null): Promise<StageRepo> {
    const repo = await stageRepo();
    const { build } = fakeBuildCandidate(repo.root);
    await runTrainStage('build', repo.options({ buildCandidate: build }));
    const captured: { universe: ComparisonUniverseInput | null } = { universe: null };
    await runTrainStage('measure', repo.options({
      buildCandidate: build, runComparison: fakeRunComparison(captured), openEngine: openEngines(true),
    }));
    const log: { args: readonly string[]; cwd: string }[] = [];
    const run = async (args: readonly string[], cwd: string): Promise<TrainStageCommandResult> => {
      log.push({ args, cwd });
      if (args.includes('--require-admit')) {
        const reportRelative = args[args.indexOf('--json') + 1]!;
        const target = path.join(cwd, ...reportRelative.split('/'));
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, `${JSON.stringify({ schemaVersion: 1, payload: { verdict: 'ADMIT' } }, null, 2)}\n`);
        return { exitCode: 0, stdout: '', stderr: '' };
      }
      if (args.includes('build:artifact')) {
        const out = args[args.indexOf('--out') + 1]!;
        await mkdir(path.dirname(out), { recursive: true });
        await writeFile(out, Buffer.from('rebuilt candidate database'));
        return { exitCode: 0, stdout: '', stderr: '' };
      }
      const target = args.includes('--update-baseline') ? 'eval/baselines/probes.json' : 'eval/baselines/ordering.snapshot.json';
      // The regenerated baselines carry their embedded fixture-bed identity
      // stamp — the deferred-signing marker mint reads it, and an unstamped
      // regen is marker_identity_unreadable when a signer is named.
      await writeFile(path.join(cwd, ...target.split('/')), `${JSON.stringify({ ...REFERENCE, stable: target }, null, 2)}\n`);
      return { exitCode: 0, stdout: '', stderr: '' };
    };
    await runTrainStage('gauntlet', repo.options({
      buildCandidate: build, runCommand: run,
      provisionWorktree: async () => undefined, applyDiffsToWorktree: async () => undefined,
    }, signer));
    return repo;
  }

  it('with no signer named, the ready data train freezes: the NO_SIGNER hold renders and the sign act refuses awaiting_signer', async () => {
    const repo = await readyRepo(null);
    const trains = trainOps(repo, null);
    const view = await trains.train('train-0001', REFERENCE);
    expect(view.state).toBe('ready');
    expect(view.signingHold).toBe(SIGNING_HOLD_NO_SIGNER);
    // The frozen state is honest: the report still exists, with the
    // standing-red note carried while the hold stands.
    expect(view.report).not.toBeNull();
    await expect(trains.sign('train-0001', view.report!.digest, REFERENCE))
      .rejects.toMatchObject({ code: 'awaiting_signer', status: 409, message: SIGNING_HOLD_NO_SIGNER });
  });

  it('with a signer named but the historic debt standing, the DEBT_STANDS hold renders and the sign act still refuses', async () => {
    const repo = await readyRepo('Named Independent Signer');
    // The committed approvals do not bind the identities the committed
    // baselines carry (here: no approvals exist at all) — the D12a debt
    // stands and the hold renders even with a signer named.
    const trains = trainOps(repo, 'Named Independent Signer');
    const view = await trains.train('train-0001', REFERENCE);
    expect(view.state).toBe('ready');
    expect(view.signingHold).toBe(SIGNING_HOLD_DEBT_STANDS);
    await expect(trains.sign('train-0001', view.report!.digest, REFERENCE))
      .rejects.toMatchObject({ code: 'awaiting_signer', status: 409 });
  });

  it('with a signer named but the approvals binding an OLDER baseline identity than the committed baselines, the debt still stands', async () => {
    const repo = await readyRepo('Named Independent Signer');
    // Baselines carry today's fixture-bed identity; the approvals bind a
    // 0.9.0-era identity — exactly the real repo's historic J39 debt shape.
    const FIXTURE_BED = { engineVersion: '0.14.0', corpusFingerprint: 'c'.repeat(64), layerFingerprint: 'f'.repeat(64) };
    const STALE = { ...FIXTURE_BED, engineVersion: '0.9.0' };
    const stamped = (identity: Record<string, unknown>, body: Record<string, unknown>): string => `${JSON.stringify({ ...identity, ...body }, null, 2)}\n`;
    await writeFile(path.join(repo.root, 'eval', 'baselines', 'probes.json'), stamped(FIXTURE_BED, { observations: [] }));
    await writeFile(path.join(repo.root, 'eval', 'baselines', 'ordering.snapshot.json'), stamped(FIXTURE_BED, { orderings: [] }));
    await writeFile(path.join(repo.root, 'eval', 'baselines', 'probes.approval.json'), `${JSON.stringify({ engine: STALE }, null, 2)}\n`);
    await writeFile(path.join(repo.root, 'eval', 'baselines', 'ordering.snapshot.approval.json'), `${JSON.stringify({ engine: STALE }, null, 2)}\n`);
    const trains = trainOps(repo, 'Named Independent Signer');
    const view = await trains.train('train-0001', REFERENCE);
    expect(view.state).toBe('ready');
    expect(view.signingHold).toBe(SIGNING_HOLD_DEBT_STANDS);
    await expect(trains.sign('train-0001', view.report!.digest, REFERENCE))
      .rejects.toMatchObject({ code: 'awaiting_signer', status: 409 });
  });

  it('with the signer named and each approval binding its committed baseline identity, signing verifies the digest and records EXACTLY the changed queries', async () => {
    const repo = await readyRepo('Named Independent Signer');
    // Pay the standing debt the way D12a pays it: the committed approvals
    // bind the identity the committed BASELINES carry (the fixture-bed
    // domain — never the train's artifact identity, which lives in a
    // different fingerprint domain).
    const FIXTURE_BED = { engineVersion: '0.14.0', corpusFingerprint: 'c'.repeat(64), layerFingerprint: 'f'.repeat(64) };
    const stamped = (body: Record<string, unknown>): string => `${JSON.stringify({ ...FIXTURE_BED, ...body }, null, 2)}\n`;
    await writeFile(path.join(repo.root, 'eval', 'baselines', 'probes.json'), stamped({ observations: [] }));
    await writeFile(path.join(repo.root, 'eval', 'baselines', 'ordering.snapshot.json'), stamped({ orderings: [] }));
    const approval = (extra: Record<string, unknown>): string => `${JSON.stringify({ engine: { ...FIXTURE_BED }, ...extra }, null, 2)}\n`;
    await writeFile(path.join(repo.root, 'eval', 'baselines', 'probes.approval.json'), approval({ schema: 'probe-approval/v1' }));
    await writeFile(path.join(repo.root, 'eval', 'baselines', 'ordering.snapshot.approval.json'), approval({ schema: 'ordering-approval/v1' }));
    const trains = trainOps(repo, 'Named Independent Signer');
    const view = await trains.train('train-0001', REFERENCE);
    expect(view.state).toBe('ready');
    expect(view.signingHold).toBeNull();
    const report = view.report!;
    expect(report.kind).toBe('data-update-report');

    // A wrong digest is the Finish-up stale semantics — nothing recorded.
    await expect(trains.sign('train-0001', 'f'.repeat(64), REFERENCE))
      .rejects.toMatchObject({ code: 'stale_preview', status: 409 });
    let entry = await repo.entry();
    expect(entry.reviewedComparisonQueries).toEqual([]);

    // The matching FULL digest signs; the per-query review is recorded as
    // EXACTLY the report's changed queries, no extras (the admission
    // coverage blocker's input).
    const signed = await trains.sign('train-0001', report.digest, REFERENCE);
    expect(signed.state).toBe('ready');
    entry = await repo.entry();
    expect(entry.reviewedComparisonQueries).toEqual((report as { changedQueries: readonly string[] }).changedQueries);
    expect(entry.reviewedComparisonQueries.length).toBeGreaterThan(0);
  });

  it('signing anything not at ready refuses not_signable', async () => {
    const repo = await stageRepo();
    const trains = trainOps(repo, 'Named Independent Signer');
    await expect(trains.sign('train-0001', 'a'.repeat(64), REFERENCE))
      .rejects.toMatchObject({ code: 'not_signable', status: 409 });
  });
});
