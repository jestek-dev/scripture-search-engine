import { createHash } from 'node:crypto';
import { lstat, mkdtemp, mkdir, readFile, readdir, rename, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { ResearchResult, ScriptureEngine } from '@jestek-dev/scripture-engine';
import { afterEach, describe, expect, it } from 'vitest';

import type { CandidateCliDescriptor, CandidateCliResult } from '../src/candidateBuilder.js';
import { compareEngines, type ComparisonReport, type ComparisonUniverseInput, type EngineIdentity } from '../src/comparison.js';
import {
  InjectedComparisonPublicationCrash,
  publishCandidateComparison,
  renderComparisonPublication,
  runAndPublishCandidateComparison,
  type ComparisonCandidateBinding,
} from '../src/comparisonRunner.js';

const temporary: string[] = [];
const REFERENCE_IDENTITY = { engineVersion: 'test-engine', corpusFingerprint: 'corpus', layerFingerprint: 'base-layer' };
const CANDIDATE_IDENTITY = { engineVersion: 'test-engine', corpusFingerprint: 'corpus', layerFingerprint: 'candidate-layer' };

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function engine(identity: EngineIdentity, targetId = 'A'): ScriptureEngine {
  return {
    ...identity,
    async research(query: string): Promise<ResearchResult> {
      return {
        kind: 'discovery', query, ...identity,
        results: [{ targetId, reference: targetId, excerpt: targetId, score: 1, reasons: [{ family: 'concept_anchor', label: 'Anchor', points: 1 }] }],
      };
    },
    async themes() { return []; }, async passage() { throw new Error('not used'); }, async related() { throw new Error('not used'); }, async forSong() { throw new Error('not used'); }, async close() {},
  };
}

function universe(): ComparisonUniverseInput {
  return {
    linkedCases: [], fixtureQueries: [],
    g8Probes: [{ sourceId: 'g8-one', query: 'hope' }],
    calibrationQueries: [], holdoutQueries: [], affectedConceptCases: [],
  };
}

async function makeReport(): Promise<ComparisonReport> {
  return compareEngines(universe(), engine(REFERENCE_IDENTITY), engine(CANDIDATE_IDENTITY));
}

async function makeCandidate(identity = CANDIDATE_IDENTITY, cacheKey = 'a'.repeat(64)): Promise<{
  root: string;
  result: CandidateCliResult;
  descriptorSha256: string;
}> {
  const root = await mkdtemp(path.join(tmpdir(), 'scripture-comparison-'));
  temporary.push(root);
  const directory = path.join(root, cacheKey);
  await mkdir(directory);
  const database = Buffer.from(`candidate-${cacheKey}`);
  const databaseSha256 = sha256(database);
  const descriptor: CandidateCliDescriptor = {
    formatVersion: 1,
    kind: 'scripture-search-candidate',
    cacheKey,
    proposalDigest: 'b'.repeat(64),
    sourceSnapshotDigest: 'c'.repeat(64),
    provenancePolicyFingerprint: 'd'.repeat(64),
    base: {
      databaseSha256: 'e'.repeat(64), schemaVersion: '6', engineVersion: REFERENCE_IDENTITY.engineVersion,
      tokenizerVersion: 'test-tokenizer', corpusFingerprint: REFERENCE_IDENTITY.corpusFingerprint,
      layerFingerprint: REFERENCE_IDENTITY.layerFingerprint, manifestFingerprint: 'f'.repeat(64),
      provenancePolicyFingerprint: 'd'.repeat(64),
    },
    schemaVersion: '6', engineVersion: identity.engineVersion, tokenizerVersion: 'test-tokenizer',
    corpusFingerprint: identity.corpusFingerprint, layerFingerprint: identity.layerFingerprint,
    manifestFingerprint: 'f'.repeat(64), databaseSha256, databaseBytes: database.byteLength,
    logicalTableDigest: '1'.repeat(64), tableDigests: {},
    counts: { concepts: 0, lexiconEntries: 0, editorialAnchors: 0, topicAnchors: 0, crossReferences: 0, verseTerms: 0, translationTokens: 0 },
  };
  const descriptorText = `${JSON.stringify(descriptor, null, 2)}\n`;
  const descriptorPath = path.join(directory, 'candidate-artifact.json');
  const databasePath = path.join(directory, 'content.db');
  await writeFile(descriptorPath, descriptorText);
  await writeFile(databasePath, database);
  return {
    root,
    descriptorSha256: sha256(descriptorText),
    result: { status: 'BUILT', cacheKey, candidateDirectory: directory, descriptorPath, databasePath, descriptor },
  };
}

afterEach(async () => {
  for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true });
});

describe('M8 durable comparison publication', () => {
  it('runs the supported post-build orchestration and publishes a complete atomic report set', async () => {
    const candidate = await makeCandidate();
    const published = await runAndPublishCandidateComparison({
      universe: universe(), referenceEngine: engine(REFERENCE_IDENTITY), candidateEngine: engine(CANDIDATE_IDENTITY),
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256,
    });
    expect(published.status).toBe('PUBLISHED');
    expect(await readdir(published.directory)).toContain('comparison.json');
    expect(published.commitManifestPath).toBe(path.join(published.directory, 'comparison.json'));
    expect(path.dirname(published.machineReportPath)).toBe(published.directory);
    const machine = JSON.parse(await readFile(published.machineReportPath, 'utf8')) as { binding: { comparisonDigest: string }; report: ComparisonReport };
    expect(machine.binding.comparisonDigest).toBe(published.report.digest);
    expect(machine.report.queries).toHaveLength(1);
    expect(machine.report.queries[0]!.reference.latencyMs).toEqual(expect.any(Number));

    const repeated = await publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report: published.report,
    });
    expect(repeated.status).toBe('ALREADY_PUBLISHED');

    const freshTimings = JSON.parse(JSON.stringify(published.report)) as ComparisonReport;
    (freshTimings.queries[0]!.reference as { latencyMs: number }).latencyMs += 1_000;
    (freshTimings.queries[0]!.candidate as { latencyMs: number }).latencyMs += 2_000;
    const originalMachineBytes = await readFile(published.machineReportPath, 'utf8');
    const timingRerun = await publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report: freshTimings,
    });
    expect(timingRerun.status).toBe('ALREADY_PUBLISHED');
    expect(await readFile(published.machineReportPath, 'utf8')).toBe(originalMachineBytes);
  });

  it('leaves no partially visible publication after interruption and permits a clean retry', async () => {
    const candidate = await makeCandidate();
    const report = await makeReport();
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report, crashAt: 'after-machine-write',
    })).rejects.toBeInstanceOf(InjectedComparisonPublicationCrash);
    expect(await readdir(candidate.result.candidateDirectory)).not.toContain('comparison.json');
    expect(await readdir(candidate.result.candidateDirectory)).not.toContain('.comparison-report.json');
    const journalDirectory = path.join(candidate.result.candidateDirectory, 'workbench', '.state', 'journals');
    const journalNames = (await readdir(journalDirectory)).filter((name) => name.endsWith('.json'));
    expect(journalNames).toHaveLength(1);
    const journal = JSON.parse(await readFile(path.join(journalDirectory, journalNames[0]!), 'utf8')) as {
      plan: { mutations: { path: string; beforeSha256: string | null }[] };
    };
    expect(journal.plan.mutations.map(({ path: mutationPath }) => mutationPath)).toEqual([
      '.comparison-commit.json',
      '.comparison-report.json',
      '.comparison-summary.json',
      '.comparison-summary.md',
      'comparison.json',
    ]);
    expect(journal.plan.mutations.every(({ beforeSha256 }) => beforeSha256 === null)).toBe(true);
    const retry = await publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report,
    });
    expect(retry.status).toBe('PUBLISHED');
    expect(await readdir(journalDirectory)).toEqual([]);
  });

  it('rehashes candidate bytes under lock immediately before commit', async () => {
    const candidate = await makeCandidate();
    const report = await makeReport();
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report,
      async onPhase(phase) {
        if (phase === 'before-final-validation') await writeFile(candidate.result.databasePath, 'mutated-between-validation-and-commit');
      },
    })).rejects.toThrow(/database no longer matches/);
    expect(await readdir(candidate.result.candidateDirectory)).not.toContain('comparison');
    expect((await readdir(candidate.result.candidateDirectory)).filter((name) => name.endsWith('.tmp'))).toEqual([]);
  });

  it('leaves a recoverable committed journal when post-commit candidate verification fails', async () => {
    const candidate = await makeCandidate(CANDIDATE_IDENTITY, '5'.repeat(64));
    const originalDatabase = await readFile(candidate.result.databasePath);
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report: await makeReport(),
      async onPhase(phase) {
        if (phase === 'after-commit') await writeFile(candidate.result.databasePath, 'mutated-after-commit');
      },
    })).rejects.toThrow(/database no longer matches/);
    expect(await readdir(candidate.result.candidateDirectory)).toContain('comparison.json');
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report: await makeReport(),
    })).rejects.toThrow(/database no longer matches/);
    await writeFile(candidate.result.databasePath, originalDatabase);
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report: await makeReport(),
    })).resolves.toMatchObject({ status: 'ALREADY_PUBLISHED' });
    expect(await readdir(path.join(candidate.result.candidateDirectory, 'workbench', '.state', 'journals'))).toEqual([]);
  });

  it('serializes concurrent publishers and lets the logical winner satisfy timing-only reruns', async () => {
    const candidate = await makeCandidate();
    const report = await makeReport();
    const freshTimings = JSON.parse(JSON.stringify(report)) as ComparisonReport;
    (freshTimings.queries[0]!.reference as { latencyMs: number }).latencyMs += 500;
    let markLocked!: () => void;
    let releaseFirst!: () => void;
    const locked = new Promise<void>((resolve) => { markLocked = resolve; });
    const release = new Promise<void>((resolve) => { releaseFirst = resolve; });
    const first = publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report,
      async onPhase(phase) { if (phase === 'before-report-open') { markLocked(); await release; } },
    });
    await locked;
    const second = publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report: freshTimings,
    });
    releaseFirst();
    const results = await Promise.all([first, second]);
    expect(results.map((result) => result.status).sort()).toEqual(['ALREADY_PUBLISHED', 'PUBLISHED']);
  });

  it('recovers M4 dead-owner state and orphan journal staging before publication', async () => {
    const candidate = await makeCandidate();
    const lockDirectory = path.join(candidate.result.candidateDirectory, 'workbench', '.state', 'locks');
    const journalDirectory = path.join(candidate.result.candidateDirectory, 'workbench', '.state', 'journals');
    await mkdir(lockDirectory, { recursive: true });
    await mkdir(journalDirectory, { recursive: true });
    await writeFile(path.join(lockDirectory, 'mutation-apply.lock'), `${JSON.stringify({
      schemaVersion: 1, ownerId: '123e4567-e89b-42d3-a456-426614174000', pid: 2_147_483_647, createdAtMs: 1,
    })}\n`);
    const stale = path.join(journalDirectory, '123e4567-e89b-42d3-a456-426614174001.staging');
    await mkdir(stale);
    await writeFile(path.join(stale, '0.bin'), 'partial');
    const result = await publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report: await makeReport(),
    });
    expect(result.status).toBe('PUBLISHED');
    expect(await readdir(journalDirectory)).toEqual([]);
  });

  it('fails closed without overwriting an unjournaled conflicting publication file', async () => {
    const candidate = await makeCandidate();
    const report = await makeReport();
    const partialName = '.comparison-report.json';
    await writeFile(path.join(candidate.result.candidateDirectory, partialName), '{"partial":');
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report,
    })).rejects.toMatchObject({ code: 'stale_plan' });
    expect(await readFile(path.join(candidate.result.candidateDirectory, partialName), 'utf8')).toBe('{"partial":');
    expect(await readdir(candidate.result.candidateDirectory)).not.toContain('comparison.json');
  });

  it('rejects commit-data substitution at the former hard-link boundary and recovers cleanly', async () => {
    const candidate = await makeCandidate(CANDIDATE_IDENTITY, '6'.repeat(64));
    const outside = await mkdtemp(path.join(tmpdir(), 'scripture-comparison-data-outside-'));
    temporary.push(outside);
    await writeFile(path.join(outside, 'sentinel'), 'untouched');
    let substitutedPath = '';
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report: await makeReport(),
      async onPhase(phase, context) {
        if (phase !== 'before-commit-link' || context.targetPath === undefined) return;
        substitutedPath = context.targetPath;
        await symlink(outside, context.targetPath, process.platform === 'win32' ? 'junction' : 'dir');
      },
    })).rejects.toMatchObject({ code: 'path_escape' });
    expect(await readdir(outside)).toEqual(['sentinel']);
    expect(await readdir(candidate.result.candidateDirectory)).not.toContain('comparison.json');
    expect((await lstat(substitutedPath)).isSymbolicLink()).toBe(true);
    await unlink(substitutedPath);
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report: await makeReport(),
    })).resolves.toMatchObject({ status: 'PUBLISHED' });
  });

  it('rejects candidate-root junction replacement at the former commit boundary without an outside write', async () => {
    const candidate = await makeCandidate(CANDIDATE_IDENTITY, '4'.repeat(64));
    const outside = await mkdtemp(path.join(tmpdir(), 'scripture-comparison-root-outside-'));
    temporary.push(outside);
    await writeFile(path.join(outside, 'sentinel'), 'untouched');
    const moved = `${candidate.result.candidateDirectory}.moved`;
    let rootMoved = false;
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report: await makeReport(),
      async onPhase(phase) {
        if (phase !== 'before-commit-link') return;
        await rename(candidate.result.candidateDirectory, moved);
        rootMoved = true;
        await symlink(outside, candidate.result.candidateDirectory, process.platform === 'win32' ? 'junction' : 'dir');
      },
    })).rejects.toThrow();
    expect(await readdir(outside)).toEqual(['sentinel']);
    expect(await readFile(path.join(outside, 'sentinel'), 'utf8')).toBe('untouched');
    expect(await readdir(outside)).not.toContain('comparison.json');
    if (rootMoved) {
      const replacement = await lstat(candidate.result.candidateDirectory).catch(() => null);
      if (replacement?.isSymbolicLink()) await unlink(candidate.result.candidateDirectory);
      await rename(moved, candidate.result.candidateDirectory);
    }
    expect(await readdir(candidate.result.candidateDirectory)).not.toContain('comparison.json');
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report: await makeReport(),
    })).resolves.toMatchObject({ status: 'PUBLISHED' });
  });

  it('rejects stale descriptors and reports bound to a different candidate before publication', async () => {
    const candidate = await makeCandidate();
    const report = await makeReport();
    await writeFile(candidate.result.descriptorPath, `${await readFile(candidate.result.descriptorPath, 'utf8')} `);
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report,
    })).rejects.toThrow(/precondition is stale/);

    const other = await makeCandidate({ ...CANDIDATE_IDENTITY, layerFingerprint: 'other-layer' }, '2'.repeat(64));
    await expect(publishCandidateComparison({
      candidateRootDirectory: other.root, candidate: other.result,
      descriptorPreconditionSha256: other.descriptorSha256, report,
    })).rejects.toThrow(/candidate identity/);
    expect(await readdir(other.result.candidateDirectory)).not.toContain('comparison');

    const sameIdentityOther = await makeCandidate(CANDIDATE_IDENTITY, '3'.repeat(64));
    await expect(publishCandidateComparison({
      candidateRootDirectory: sameIdentityOther.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report,
    })).rejects.toThrow(/cache-key child/);
    expect(await readdir(sameIdentityOther.result.candidateDirectory)).not.toContain('comparison');
  });

  it('never overwrites an existing publication whose bytes differ', async () => {
    const candidate = await makeCandidate();
    const report = await makeReport();
    const first = await publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report,
    });
    await writeFile(first.summaryMarkdownPath, 'tampered\n');
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report,
    })).rejects.toThrow(/do not match|differ/);
    expect(await readFile(first.summaryMarkdownPath, 'utf8')).toBe('tampered\n');
  });

  it('keeps summary bytes deterministic while retaining latency only in the complete machine report', async () => {
    const report = await makeReport();
    const changedLatency = JSON.parse(JSON.stringify(report)) as ComparisonReport;
    (changedLatency.queries[0]!.reference as { latencyMs: number }).latencyMs += 100;
    (changedLatency.queries[0]!.candidate as { latencyMs: number }).latencyMs += 200;
    const binding: ComparisonCandidateBinding = {
      cacheKey: 'a'.repeat(64), proposalDigest: 'b'.repeat(64), databaseSha256: 'c'.repeat(64), descriptorSha256: 'd'.repeat(64),
      referenceIdentity: report.referenceIdentity, candidateIdentity: report.candidateIdentity, comparisonDigest: report.digest,
    };
    const first = renderComparisonPublication(binding, report);
    const second = renderComparisonPublication(binding, changedLatency);
    expect(first.machineJson).not.toBe(second.machineJson);
    expect(first.summaryJson).toBe(second.summaryJson);
    expect(first.summaryMarkdown).toBe(second.summaryMarkdown);
  });

  it('rejects a report whose deterministic content no longer matches its digest', async () => {
    const candidate = await makeCandidate();
    const report = JSON.parse(JSON.stringify(await makeReport())) as ComparisonReport;
    (report.summary as { text: string }).text = 'forged';
    await expect(publishCandidateComparison({
      candidateRootDirectory: candidate.root, candidate: candidate.result,
      descriptorPreconditionSha256: candidate.descriptorSha256, report,
    })).rejects.toThrow(/digest does not match/);
  });
});
