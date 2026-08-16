import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import type { ResearchResult, ScriptureEngine } from '@jestek-dev/scripture-engine';
import { afterEach, describe, expect, it } from 'vitest';

import { GAUNTLET_GATE_ROSTER, buildMachineReport, canonicalJson, type GauntletMachineReport } from '../../eval/src/gauntletMachineReport.js';
import { fail, pass } from '../../eval/src/gates/types.js';
import { buildReport } from '../../eval/src/report.js';

import {
  AdmissionError,
  DEFAULT_ADMISSION_GIT_ADAPTER,
  previewAdmission,
  runAdmission,
  signAdmissionDecision,
  type AdmissionCandidateBinding,
  type AdmissionDecision,
  type AdmissionDependencies,
  type AdmissionGauntletExpectation,
  type AdmissionPreview,
  type AdmissionPreviewInput,
  type CommandOutcome,
  type RebuildEvidence,
} from '../src/admission.js';
import { compareEngines, type ComparisonReport, type EngineIdentity } from '../src/comparison.js';
import type { ComparisonCandidateBinding } from '../src/comparisonRunner.js';
import { previewFixturePromotion, type FixturePromotionPlan } from '../src/fixturePromotion.js';

const execFileAsync = promisify(execFile);
const temporary: string[] = [];
const SIGNING_KEY = 'admission-test-signing-key-with-ample-entropy';
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
// Deliberately far-future clock: every fixture timestamp derives from it, so any
// path that leaks back onto the real clock sees future-dated reports and fails
// `stale_gauntlet` the same day it lands, instead of expiring silently later.
const TEST_CLOCK = new Date('2050-06-01T12:00:00.000Z');

function testNow(): Date {
  return new Date(TEST_CLOCK);
}

function at(offsetMs: number): string {
  return new Date(TEST_CLOCK.valueOf() + offsetMs).toISOString();
}
const CASE_ID = '11111111-1111-4111-8111-111111111111';
const OPERATION_ID = '22222222-2222-4222-8222-222222222222';
const REFERENCE: EngineIdentity = { engineVersion: 'test-engine', corpusFingerprint: 'a'.repeat(64), layerFingerprint: 'b'.repeat(64) };
const CANDIDATE: EngineIdentity = { ...REFERENCE, layerFingerprint: 'c'.repeat(64) };

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function outcome(command = 'test'): CommandOutcome {
  return {
    command, args: ['fixed'], cwd: 'isolated', exitCode: 0,
    stdoutSha256: sha256(''), stderrSha256: sha256(''), stdoutTail: '', stderrTail: '',
  };
}

function engine(identity: EngineIdentity, targets: readonly string[]): ScriptureEngine {
  return {
    ...identity,
    async research(query: string): Promise<ResearchResult> {
      return {
        kind: 'discovery', query, ...identity,
        results: targets.map((targetId, index) => ({
          targetId, reference: targetId, excerpt: targetId, score: 10 - index,
          reasons: [{ family: 'concept_anchor', label: 'Anchor', points: 10 - index }],
        })),
      };
    },
    async themes() { return []; }, async passage() { throw new Error('unused'); },
    async related() { throw new Error('unused'); }, async forSong() { throw new Error('unused'); }, async close() {},
  };
}

async function report(kind: 'changed' | 'harmful' | 'noop' | 'inherited' = 'changed'): Promise<ComparisonReport> {
  const expected = { targetId: 'A', withinTop: 3 as const };
  const referenceTargets = kind === 'inherited' ? ['B'] : ['A', 'B'];
  const candidateTargets = kind === 'changed' ? ['A', 'C']
    : kind === 'harmful' ? ['B', 'C']
      : referenceTargets;
  return compareEngines({
    linkedCases: [{ sourceId: CASE_ID, query: 'hope', expected, expectedChange: kind === 'changed' }],
    fixtureQueries: [], g8Probes: [], calibrationQueries: [], holdoutQueries: [], affectedConceptCases: [],
  }, engine(REFERENCE, referenceTargets), engine(CANDIDATE, candidateTargets));
}

async function git(cwd: string, args: readonly string[]): Promise<string> {
  const result = await execFileAsync('git', [...args], { cwd, windowsHide: true });
  return result.stdout.trim();
}

async function repository(): Promise<{ root: string; commit: string; sourceText: string }> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'admission-repo-'));
  temporary.push(root);
  await git(root, ['init', '-b', 'main']);
  await git(root, ['config', 'core.autocrlf', 'false']);
  const sourceText = 'id: hope\nlabel: Hope\nlexicon:\n  - hope\n';
  await mkdir(path.join(root, 'ontology', 'concepts'), { recursive: true });
  await writeFile(path.join(root, 'ontology', 'concepts', 'hope.yaml'), sourceText);
  await writeFile(path.join(root, 'README.md'), 'base\n');
  await git(root, ['add', '--all']);
  await git(root, ['-c', 'user.name=Admission Test', '-c', 'user.email=admission@example.test', 'commit', '-m', 'base']);
  return { root, commit: await git(root, ['rev-parse', 'HEAD']), sourceText };
}

function proposal(sourceText: string): unknown {
  return {
    schemaVersion: 1, proposalId: 'hope-gap', fixtureId: 'hope-gap', caseIds: [CASE_ID],
    sourcePreconditions: [{ path: 'ontology/concepts/hope.yaml', sha256: sha256(sourceText) }],
    operations: [{
      operationId: OPERATION_ID, type: 'lexicon-phrase-add', sourcePaths: ['ontology/concepts/hope.yaml'],
      provenance: { source: 'editorial', confirmed: true, reviewer: 'Test Reviewer', evidence: 'Reviewed case evidence for hope wording.' },
      reason: 'Add a reviewed phrase for the demonstrated search gap.', conceptId: 'hope', phrase: 'hope in God',
    }],
  };
}

async function candidateBinding(root: string, proposalDigest = 'd'.repeat(64)): Promise<AdmissionCandidateBinding> {
  const cacheKey = 'e'.repeat(64);
  const candidateDirectory = `workbench/.state/candidates/${cacheKey}`;
  const database = Buffer.from('candidate database');
  const databaseSha256 = sha256(database);
  const descriptor = {
    cacheKey, proposalDigest, sourceSnapshotDigest: 'f'.repeat(64), databaseSha256,
    engineVersion: CANDIDATE.engineVersion, corpusFingerprint: CANDIDATE.corpusFingerprint, layerFingerprint: CANDIDATE.layerFingerprint,
  };
  const descriptorText = `${JSON.stringify(descriptor, null, 2)}\n`;
  await mkdir(path.join(root, ...candidateDirectory.split('/')), { recursive: true });
  await writeFile(path.join(root, ...candidateDirectory.split('/'), 'candidate-artifact.json'), descriptorText);
  await writeFile(path.join(root, ...candidateDirectory.split('/'), 'content.db'), database);
  return {
    cacheKey, proposalDigest, sourceSnapshotDigest: descriptor.sourceSnapshotDigest, descriptorSha256: sha256(descriptorText),
    databaseSha256, engineVersion: CANDIDATE.engineVersion,
    corpusFingerprint: CANDIDATE.corpusFingerprint, layerFingerprint: CANDIDATE.layerFingerprint,
    candidateDirectory, descriptorPath: `${candidateDirectory}/candidate-artifact.json`, databasePath: `${candidateDirectory}/content.db`,
  };
}

function comparisonBinding(candidate: AdmissionCandidateBinding, comparison: ComparisonReport): ComparisonCandidateBinding {
  return {
    cacheKey: candidate.cacheKey, proposalDigest: candidate.proposalDigest, databaseSha256: candidate.databaseSha256,
    descriptorSha256: candidate.descriptorSha256, referenceIdentity: REFERENCE, candidateIdentity: CANDIDATE,
    comparisonDigest: comparison.digest,
  };
}

async function previewInput(root: string, commit: string, sourceText: string, suppliedComparison?: ComparisonReport): Promise<AdmissionPreviewInput> {
  const comparison = suppliedComparison ?? await report();
  const parsedProposal = proposal(sourceText) as { proposalId: string };
  const proposalDigest = (await import('../src/proposals.js')).proposalManifestDigest(
    (await import('../src/proposals.js')).parseProposalManifest(parsedProposal),
  );
  const candidate = await candidateBinding(root, proposalDigest);
  return {
    repoRoot: root, admittedBaseCommit: commit, expectedMainCommit: commit, proposal: parsedProposal,
    candidate, comparison, comparisonBinding: comparisonBinding(candidate, comparison),
    gauntlet: { reportPath: 'eval/.runs/admission-report.json' },
    trustedGauntletLoader: trustedGauntletLoader(),
    now: testNow,
    reviewedComparisonQueries: comparison.queries.filter((query) => query.top10Changed).map((query) => query.query),
  };
}

function machineReport(expectation: AdmissionGauntletExpectation, reportPath: string, blocking = false, variant = 'primary'): GauntletMachineReport {
  const startedAt = at(-2 * HOUR_MS);
  const finishedAt = at(-2 * HOUR_MS + 1000);
  const gates = GAUNTLET_GATE_ROSTER.map((gate, index) => blocking && index === 0
    ? fail(gate.id, gate.title, 'Deliberate blocking gate.', [{ message: 'Deliberate admission blocker.', subjects: ['candidate'] }])
    : pass(gate.id, gate.title, `Complete trusted test gate passed (${variant}).`));
  return buildMachineReport({
    startedAt, finishedAt,
    identity: {
      gitCommitSha: expectation.baseCommit, dirtyTreeSha256: '1'.repeat(64),
      descriptor: { path: 'artifacts/content-artifact.json', sha256: '4'.repeat(64) },
      engine: expectation.candidateIdentity, budgetsSha256: '2'.repeat(64), fixtureInputSha256: '3'.repeat(64),
      target: {
        kind: 'candidate',
        descriptor: { kind: 'scripture-search-candidate', path: expectation.descriptorPath, sha256: expectation.candidateDescriptorSha256 },
        database: { path: expectation.databasePath, sha256: expectation.candidateDatabaseSha256 },
        engine: expectation.candidateIdentity, baseEngine: expectation.baseIdentity,
        cacheKey: expectation.cacheKey, proposalDigest: expectation.proposalDigest,
        sourceSnapshotDigest: expectation.sourceSnapshotDigest,
      },
      flags: {
        checkSources: false, updateBaseline: false, requireAdmit: true, jsonPath: reportPath,
        candidateDescriptorPath: expectation.descriptorPath, candidateDatabasePath: expectation.databasePath,
        argv: ['--require-admit', '--json', reportPath, '--candidate-descriptor', expectation.descriptorPath,
          '--candidate-database', expectation.databasePath],
      },
    },
    report: buildReport({ gates }),
  });
}

function releaseMachineReport(preview: AdmissionPreview, rebuilt: RebuildEvidence): Uint8Array {
  const reportPath = 'eval/.runs/admission-release-report.json';
  const engineIdentity = {
    engineVersion: preview.candidate.engineVersion,
    corpusFingerprint: preview.candidate.corpusFingerprint,
    layerFingerprint: preview.candidate.layerFingerprint,
  };
  const report = buildMachineReport({
    startedAt: at(-2 * HOUR_MS + 2000), finishedAt: at(-2 * HOUR_MS + 3000),
    identity: {
      gitCommitSha: preview.admittedBaseCommit, dirtyTreeSha256: '5'.repeat(64),
      descriptor: { path: 'artifacts/content-artifact.json', sha256: rebuilt.descriptorSha256 },
      engine: engineIdentity, budgetsSha256: '2'.repeat(64), fixtureInputSha256: '3'.repeat(64),
      target: {
        kind: 'release',
        descriptor: { kind: 'scripture-search-release', path: 'artifacts/content-artifact.json', sha256: rebuilt.descriptorSha256 },
        database: { path: 'workbench/.artifact/content.db', sha256: rebuilt.databaseSha256 },
        engine: engineIdentity,
      },
      flags: {
        checkSources: false, updateBaseline: false, requireAdmit: true, jsonPath: reportPath,
        releaseDatabasePath: 'workbench/.artifact/content.db',
        argv: ['--require-admit', '--json', reportPath, '--release-database', 'workbench/.artifact/content.db'],
      },
    },
    report: buildReport({ gates: GAUNTLET_GATE_ROSTER.map((gate) => pass(gate.id, gate.title, 'Rebuilt release gate passed.')) }),
  });
  return Buffer.from(`${JSON.stringify(report, null, 2)}\n`);
}

function trustedGauntletLoader(options: { blocking?: boolean; variant?: string; mutate?: (report: GauntletMachineReport) => unknown } = {}) {
  return async (_repoRoot: string, reportPath: string, expectation: AdmissionGauntletExpectation): Promise<Uint8Array> => {
    const report = machineReport(expectation, reportPath, options.blocking ?? false, options.variant);
    return Buffer.from(`${JSON.stringify(options.mutate?.(report) ?? report, null, 2)}\n`);
  };
}

function redigestMachineReport(report: GauntletMachineReport): GauntletMachineReport {
  const { reportSha256: _stored, ...unsigned } = report;
  return { ...unsigned, reportSha256: sha256(canonicalJson(unsigned)) };
}

function candidateReportTarget(report: GauntletMachineReport) {
  const target = report.identity.target;
  if (target?.kind !== 'candidate') throw new Error('Expected a candidate-target gauntlet report.');
  return target;
}

function releaseReportTarget(report: GauntletMachineReport) {
  const target = report.identity.target;
  if (target?.kind !== 'release') throw new Error('Expected a release-target gauntlet report.');
  return target;
}

function descriptor(preview: AdmissionPreview) {
  return {
    formatVersion: 1, kind: 'scripture-search-candidate', cacheKey: preview.candidate.cacheKey,
    proposalDigest: preview.proposalDigest, sourceSnapshotDigest: preview.candidate.sourceSnapshotDigest,
    provenancePolicyFingerprint: '6'.repeat(64),
    base: {
      databaseSha256: '7'.repeat(64), schemaVersion: '6', engineVersion: preview.candidate.engineVersion,
      tokenizerVersion: 'test', corpusFingerprint: preview.candidate.corpusFingerprint,
      layerFingerprint: '8'.repeat(64), manifestFingerprint: '9'.repeat(64), provenancePolicyFingerprint: '6'.repeat(64),
    },
    schemaVersion: '6', engineVersion: preview.candidate.engineVersion, tokenizerVersion: 'test',
    corpusFingerprint: preview.candidate.corpusFingerprint, layerFingerprint: preview.candidate.layerFingerprint,
    manifestFingerprint: '9'.repeat(64), databaseSha256: 'a'.repeat(64), databaseBytes: 1,
    logicalTableDigest: 'b'.repeat(64), tableDigests: {},
    counts: { concepts: 1, lexiconEntries: 2, editorialAnchors: 0, topicAnchors: 0, crossReferences: 0, verseTerms: 0, translationTokens: 0 },
  };
}

function dependencies(overrides: Partial<AdmissionDependencies> = {}): AdmissionDependencies {
  return {
    decisionSigningKey: SIGNING_KEY,
    now: testNow,
    async rebuild(_worktree, preview) {
      const built = descriptor(preview);
      return { status: 'REBUILT', descriptor: built, descriptorSha256: 'c'.repeat(64), databaseSha256: built.databaseSha256, command: outcome('build') };
    },
    async verify(_worktree, preview, rebuilt) {
      return {
        status: 'PASSED', command: outcome('verify'),
        releaseGauntlet: {
          reportPath: 'eval/.runs/admission-release-report.json',
          reportBytes: releaseMachineReport(preview, rebuilt), command: outcome('release-gauntlet'),
        },
      };
    },
    ...overrides,
  };
}

function decisions(preview: AdmissionPreview): AdmissionDecision[] {
  const result = [signAdmissionDecision({
    kind: 'source-proposal', subjectDigest: preview.sourceDecisionSubject, previewDigest: preview.digest, reviewer: 'Release Reviewer',
    rationale: 'The exact structured source changes are reviewed and warranted.', decidedAt: at(-HOUR_MS),
  }, SIGNING_KEY)];
  for (const fixture of preview.fixtureDecisionSubjects) result.push(signAdmissionDecision({
    kind: 'fixture-promotion', subjectDigest: fixture.digest, previewDigest: preview.digest, reviewer: 'Fixture Reviewer',
    rationale: `Fixture ${fixture.fixtureId} has independent passing evidence.`, decidedAt: at(-HOUR_MS + 60_000),
  }, SIGNING_KEY));
  if (preview.probeDecisionSubject !== null) result.push(signAdmissionDecision({
    kind: 'probe-baseline', subjectDigest: preview.probeDecisionSubject, previewDigest: preview.digest, reviewer: 'Probe Reviewer',
    rationale: 'Every intentional probe movement has a specific reviewed explanation.', decidedAt: at(-HOUR_MS + 120_000),
    probeRationales: preview.probeMovements.map((movement) => ({ ...movement, rationale: `Reviewed movement for ${movement.probeId}.` })),
  }, SIGNING_KEY));
  return result;
}

async function execute(input: AdmissionPreviewInput, deps = dependencies()) {
  const preview = await previewAdmission(input);
  return runAdmission({
    ...input, expectedPreviewDigest: preview.digest, decisions: decisions(preview), linkedCaseIds: [CASE_ID],
    provenance: ['case:11111111-1111-4111-8111-111111111111', 'review:release-reviewer'], dependencies: deps,
  });
}

afterEach(async () => {
  for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true });
});

describe('M10 controlled source admission', () => {
  it('admits a real gap through a detached synthetic git worktree and leaves primary dirty changes untouched', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    await writeFile(path.join(repo.root, 'README.md'), 'user dirty change\n');

    const result = await execute(input);
    expect(result.status).toBe('ADMITTED');
    expect(result.manifest?.sourceChanges[0]?.after.text).toContain('hope in God');
    expect(result.manifest?.commands.map((entry) => entry.command)).toContain('build');
    expect(result.manifest?.gauntlet.candidateDescriptorSha256).toBe(input.candidate.descriptorSha256);
    expect(result.manifest?.releaseGauntlet?.descriptorSha256).toBe('c'.repeat(64));
    expect(result.manifest?.releaseGauntlet?.descriptorSha256).not.toBe(input.candidate.descriptorSha256);
    expect(result.manifest?.rollback[0]?.restoreSha256).toBe(sha256(repo.sourceText));
    expect(await readFile(path.join(repo.root, 'ontology', 'concepts', 'hope.yaml'), 'utf8')).toBe(repo.sourceText);
    expect(await readFile(path.join(repo.root, 'README.md'), 'utf8')).toBe('user dirty change\n');
    expect(await readdir(path.join(repo.root, 'workbench', '.state', 'admission-worktrees'))).toEqual([]);

    const repeated = await execute(input);
    expect(repeated.status).toBe('ALREADY_ADMITTED');
    expect(repeated.manifest?.digest).toBe(result.manifest?.digest);
  });

  it('returns NO MEASURABLE EFFECT without decisions, worktree creation, or a manifest', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText, await report('noop'));
    const preview = await previewAdmission(input);
    const result = await runAdmission({
      ...input, expectedPreviewDigest: preview.digest, decisions: [], linkedCaseIds: [CASE_ID], provenance: ['review:no-op'],
      dependencies: dependencies({ async rebuild() { throw new Error('must not build'); } }),
    });
    expect(result.status).toBe('NO_MEASURABLE_EFFECT');
    await expect(readdir(path.join(repo.root, 'workbench', 'admissions'))).rejects.toThrow();
  });

  it('rejects harmful and inherited-failure comparisons before source application', async () => {
    const repo = await repository();
    await expect(previewAdmission(await previewInput(repo.root, repo.commit, repo.sourceText, await report('harmful'))))
      .rejects.toMatchObject({ code: 'candidate_expectation_failure' });
    await expect(previewAdmission(await previewInput(repo.root, repo.commit, repo.sourceText, await report('inherited'))))
      .rejects.toMatchObject({ code: 'inherited_expectation_failure' });
  });

  it('rejects stale source, main, base, proposal, candidate, and comparison identities', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    const preview = await previewAdmission(input);
    await writeFile(path.join(repo.root, 'ontology', 'concepts', 'hope.yaml'), `${repo.sourceText}# drift\n`);
    await expect(previewAdmission(input)).rejects.toMatchObject({ code: 'source_drift' });
    await writeFile(path.join(repo.root, 'ontology', 'concepts', 'hope.yaml'), repo.sourceText);

    await writeFile(path.join(repo.root, ...input.candidate.databasePath.split('/')), 'candidate drift');
    await expect(previewAdmission(input)).rejects.toMatchObject({ code: 'stale_candidate' });
    await writeFile(path.join(repo.root, ...input.candidate.databasePath.split('/')), Buffer.from('candidate database'));

    await writeFile(path.join(repo.root, 'moved.txt'), 'main moved');
    await git(repo.root, ['add', 'moved.txt']);
    await git(repo.root, ['-c', 'user.name=Admission Test', '-c', 'user.email=admission@example.test', 'commit', '-m', 'move main']);
    await expect(runAdmission({
      ...input, expectedPreviewDigest: preview.digest, decisions: decisions(preview), linkedCaseIds: [CASE_ID], provenance: ['review:stale-main'], dependencies: dependencies(),
    })).rejects.toMatchObject({ code: 'stale_main' });

    await expect(previewAdmission({ ...input, admittedBaseCommit: '0'.repeat(40) })).resolves.toBeDefined();
    await expect(runAdmission({
      ...input, admittedBaseCommit: '0'.repeat(40), expectedPreviewDigest: (await previewAdmission({ ...input, admittedBaseCommit: '0'.repeat(40) })).digest,
      decisions: decisions(await previewAdmission({ ...input, admittedBaseCommit: '0'.repeat(40) })), linkedCaseIds: [CASE_ID], provenance: ['review:stale-base'], dependencies: dependencies(),
    })).rejects.toBeInstanceOf(AdmissionError);

    await expect(previewAdmission({ ...input, candidate: { ...input.candidate, proposalDigest: '0'.repeat(64) } }))
      .rejects.toMatchObject({ code: 'identity_mismatch' });
    await expect(previewAdmission({ ...input, comparisonBinding: { ...input.comparisonBinding, comparisonDigest: '0'.repeat(64) } }))
      .rejects.toMatchObject({ code: 'identity_mismatch' });
  });

  it('requires exact review of every changed top-10 query and a passing gauntlet', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    await expect(previewAdmission({ ...input, reviewedComparisonQueries: [] })).rejects.toMatchObject({ code: 'unreviewed_comparison' });
    await expect(previewAdmission({ ...input, trustedGauntletLoader: trustedGauntletLoader({ blocking: true }) }))
      .rejects.toMatchObject({ code: 'blocking_gauntlet' });
    await expect(previewAdmission({
      ...input,
      trustedGauntletLoader: trustedGauntletLoader({
        mutate(report) { return { ...report, reportSha256: '0'.repeat(64), payload: { ...report.payload, verdict: 'ADMIT' } }; },
      }),
    })).rejects.toMatchObject({ code: 'invalid_gauntlet' });
  });

  it('rejects candidate reports with the wrong target kind, descriptor, database, or identity', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    const mutations: Array<(report: GauntletMachineReport) => GauntletMachineReport> = [
      (report) => redigestMachineReport({
        ...report,
        identity: { ...report.identity, target: { ...report.identity.target!, kind: 'release' } as never },
      }),
      (report) => {
        const target = candidateReportTarget(report);
        return redigestMachineReport({
          ...report,
          identity: { ...report.identity, target: {
            ...target, descriptor: { ...target.descriptor, sha256: '0'.repeat(64) },
          } },
        });
      },
      (report) => {
        const target = candidateReportTarget(report);
        return redigestMachineReport({
          ...report,
          identity: { ...report.identity, target: {
            ...target, database: { ...target.database, sha256: '0'.repeat(64) },
          } },
        });
      },
      (report) => {
        const target = candidateReportTarget(report);
        return redigestMachineReport({
          ...report,
          identity: { ...report.identity, target: {
            ...target, engine: { ...target.engine, layerFingerprint: '0'.repeat(64) },
          } },
        });
      },
    ];
    for (const mutate of mutations) {
      await expect(previewAdmission({
        ...input,
        trustedGauntletLoader: trustedGauntletLoader({ mutate }),
      })).rejects.toMatchObject({ code: 'gauntlet_identity_mismatch' });
    }
  });

  it('judges gauntlet freshness against the injected clock and rejects both 24h window edges', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    const stamped = (startedAt: string, finishedAt: string) => trustedGauntletLoader({
      mutate(report) { return redigestMachineReport({ ...report, startedAt, finishedAt }); },
    });
    // Exactly at the 24h boundary: inside the window, but only under the injected 2050 clock.
    await expect(previewAdmission({ ...input, trustedGauntletLoader: stamped(at(-DAY_MS), at(-DAY_MS)) })).resolves.toBeDefined();
    // The same fixtures without the injected clock are future-dated on the real clock:
    // any real-clock leak fails loudly here instead of expiring on a calendar date.
    const { now: _injected, ...withoutClock } = input;
    await expect(previewAdmission(withoutClock)).rejects.toMatchObject({ code: 'stale_gauntlet' });
    // One millisecond past the 24h window: stale.
    await expect(previewAdmission({ ...input, trustedGauntletLoader: stamped(at(-DAY_MS - 1), at(-DAY_MS - 1)) }))
      .rejects.toMatchObject({ code: 'stale_gauntlet' });
    // One millisecond in the injected clock's future: rejected as future-dated.
    await expect(previewAdmission({ ...input, trustedGauntletLoader: stamped(at(0), at(1)) }))
      .rejects.toMatchObject({ code: 'stale_gauntlet' });
  });

  it('rejects a final release report not bound to the rebuilt release descriptor', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    const baseDependencies = dependencies();
    await expect(execute(input, dependencies({
      async verify(worktree, preview, rebuilt) {
        const evidence = await baseDependencies.verify!(worktree, preview, rebuilt);
        const parsed = JSON.parse(Buffer.from(evidence.releaseGauntlet.reportBytes).toString('utf8')) as GauntletMachineReport;
        const target = releaseReportTarget(parsed);
        const mutated = redigestMachineReport({
          ...parsed,
          identity: { ...parsed.identity, target: {
            ...target, descriptor: { ...target.descriptor, sha256: input.candidate.descriptorSha256 },
          } },
        });
        return {
          ...evidence,
          releaseGauntlet: { ...evidence.releaseGauntlet, reportBytes: Buffer.from(`${JSON.stringify(mutated, null, 2)}\n`) },
        };
      },
    }))).rejects.toMatchObject({ code: 'gauntlet_identity_mismatch' });
  });

  it('enforces separate fixture and probe decisions and displays every changed probe', async () => {
    const repo = await repository();
    const fixture = {
      id: 'hope-gap', generatedBy: 'workbench', status: 'pending', query: 'hope', expectedTop: [{ reference: 'Psalm 42:5' }], expectedWithinTop: 10,
    };
    await mkdir(path.join(repo.root, 'eval', 'golden'), { recursive: true });
    await writeFile(path.join(repo.root, 'eval', 'golden', 'hope-gap.json'), `${JSON.stringify(fixture, null, 2)}\n`);
    const probes = { corpusFingerprint: 'old', engineVersion: 'old', layerFingerprint: 'old', observations: [{ id: 'one', top: ['A'] }, { id: 'two', top: ['B'] }] };
    await mkdir(path.join(repo.root, 'eval', 'baselines'), { recursive: true });
    const probeText = `${JSON.stringify(probes, null, 2)}\n`;
    await writeFile(path.join(repo.root, 'eval', 'baselines', 'probes.json'), probeText);
    await git(repo.root, ['add', '--all']);
    await git(repo.root, ['-c', 'user.name=Admission Test', '-c', 'user.email=admission@example.test', 'commit', '-m', 'review surfaces']);
    const commit = await git(repo.root, ['rev-parse', 'HEAD']);
    const promotion = await previewFixturePromotion(repo.root, 'hope-gap', { evidenceVerifier: async () => ({
      reportPath: 'eval/.runs/report.json', reportSha256: 'a'.repeat(64), finishedAt: at(-2 * HOUR_MS), gateSummary: 'pending fixture passes',
    }) });
    const input = {
      ...(await previewInput(repo.root, commit, repo.sourceText)), fixturePromotions: [promotion],
      probeBaseline: {
        path: 'eval/baselines/probes.json' as const, beforeSha256: sha256(probeText),
        after: { ...probes, observations: [{ id: 'one', top: ['C'] }, { id: 'two', top: ['D'] }] },
      },
    };
    const preview = await previewAdmission(input);
    expect(preview.probeMovements.map((entry) => entry.probeId)).toEqual(['one', 'two']);
    const sourceOnly = decisions(preview).filter((decision) => decision.kind === 'source-proposal');
    await expect(runAdmission({
      ...input, expectedPreviewDigest: preview.digest, decisions: sourceOnly, linkedCaseIds: [CASE_ID], provenance: ['review:missing-separate-decisions'], dependencies: dependencies(),
    })).rejects.toMatchObject({ code: 'missing_decision' });

    const incompleteProbe = signAdmissionDecision({
      kind: 'probe-baseline', subjectDigest: preview.probeDecisionSubject!, previewDigest: preview.digest, reviewer: 'Probe Reviewer', rationale: 'Review only one movement is deliberately incomplete.',
      decidedAt: at(-HOUR_MS + 120_000), probeRationales: [{ ...preview.probeMovements[0]!, rationale: 'Only one rationale is not sufficient.' }],
    }, SIGNING_KEY);
    await expect(runAdmission({
      ...input, expectedPreviewDigest: preview.digest,
      decisions: [...decisions(preview).filter((decision) => decision.kind !== 'probe-baseline'), incompleteProbe],
      linkedCaseIds: [CASE_ID], provenance: ['review:incomplete-probe'], dependencies: dependencies(),
    })).rejects.toMatchObject({ code: 'missing_decision' });
  });

  it('renders an exact canonical fixture-corpus selection diff', async () => {
    const repo = await repository();
    const selection = {
      $schema: 'verse-array-subset/1',
      generatedFrom: { translation: 'WEB', sourceSha256: 'a'.repeat(64), note: 'Synthetic admission fixture.' },
      selection: [{ book: 'James', chapters: [1], why: 'Existing reviewed coverage.' }],
      verses: [],
    };
    const selectionText = `${JSON.stringify(selection, null, 2)}\n`;
    await mkdir(path.join(repo.root, 'pipeline', 'fixtures'), { recursive: true });
    await writeFile(path.join(repo.root, 'pipeline', 'fixtures', 'web-subset.json'), selectionText);
    await git(repo.root, ['add', '--all']);
    await git(repo.root, ['-c', 'user.name=Admission Test', '-c', 'user.email=admission@example.test', 'commit', '-m', 'selection base']);
    const commit = await git(repo.root, ['rev-parse', 'HEAD']);
    const base = await previewInput(repo.root, commit, repo.sourceText);
    const selectionProposal = {
      schemaVersion: 1, proposalId: 'selection-gap', fixtureId: 'selection-gap', caseIds: [CASE_ID],
      sourcePreconditions: [{ path: 'pipeline/fixtures/web-subset.json', sha256: sha256(selectionText) }],
      operations: [{
        operationId: OPERATION_ID, type: 'fixture-corpus-chapter-add', sourcePaths: ['pipeline/fixtures/web-subset.json'],
        provenance: { source: 'editorial', confirmed: true, reviewer: 'Selection Reviewer', evidence: 'The missing chapter is required by the reviewed fixture.' },
        reason: 'Add the exact missing corpus chapter needed by the reviewed fixture.', book: 'James', chapter: 2,
        why: 'Required for the admitted hearing-and-doing fixture.',
      }],
    };
    const proposalModule = await import('../src/proposals.js');
    const proposalDigest = proposalModule.proposalManifestDigest(proposalModule.parseProposalManifest(selectionProposal));
    const candidate = await candidateBinding(repo.root, proposalDigest);
    const preview = await previewAdmission({
      ...base, proposal: selectionProposal, candidate, comparisonBinding: comparisonBinding(candidate, base.comparison),
    });
    const selectionDiff = preview.diffs.find((entry) => entry.kind === 'selection');
    expect(selectionDiff?.before.text).toBe(selectionText);
    expect(JSON.parse(selectionDiff!.after.text).selection[0]).toEqual({
      book: 'James', chapters: [1, 2],
      why: 'Existing reviewed coverage.; Required for the admitted hearing-and-doing fixture.',
    });
    expect(selectionDiff?.after.sha256).toBe(sha256(selectionDiff!.after.text));
  });

  it('rejects decision replay after any preview evidence changes', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    const first = await previewAdmission(input);
    const replayedDecisions = decisions(first);
    const changedInput = { ...input, trustedGauntletLoader: trustedGauntletLoader({ variant: 'second-valid-run' }) };
    const changed = await previewAdmission(changedInput);
    expect(changed.digest).not.toBe(first.digest);
    await expect(runAdmission({
      ...changedInput, expectedPreviewDigest: changed.digest, decisions: replayedDecisions,
      linkedCaseIds: [CASE_ID], provenance: ['review:replay-attempt'], dependencies: dependencies(),
    })).rejects.toMatchObject({ code: 'decision_replay' });
  });

  it('rejects malicious rebuild and verify mutations outside the exact admission diff', async () => {
    const rebuildRepo = await repository();
    const rebuildInput = await previewInput(rebuildRepo.root, rebuildRepo.commit, rebuildRepo.sourceText);
    await expect(execute(rebuildInput, dependencies({
      async rebuild(worktree, preview) {
        await writeFile(path.join(worktree, 'rogue-untracked.txt'), 'malicious rebuild mutation\n');
        const built = descriptor(preview);
        return { status: 'REBUILT', descriptor: built, descriptorSha256: 'c'.repeat(64), databaseSha256: built.databaseSha256, command: outcome('build') };
      },
    }))).rejects.toMatchObject({ code: 'worktree_mutation' });
    expect(await readFile(path.join(rebuildRepo.root, 'README.md'), 'utf8')).toBe('base\n');

    const verifyRepo = await repository();
    const verifyInput = await previewInput(verifyRepo.root, verifyRepo.commit, verifyRepo.sourceText);
    await expect(execute(verifyInput, dependencies({
      async verify(worktree, preview, rebuilt) {
        await writeFile(path.join(worktree, 'ontology', 'concepts', 'hope.yaml'), 'id: replaced-by-verify\n');
        return dependencies().verify!(worktree, preview, rebuilt);
      },
    }))).rejects.toMatchObject({ code: 'post_verify_source_mismatch' });
    expect(await readFile(path.join(verifyRepo.root, 'ontology', 'concepts', 'hope.yaml'), 'utf8')).toBe(verifyRepo.sourceText);
  }, 120_000);

  it('rejects a worktree adapter that reports the wrong HEAD', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    const wrongHead = {
      ...DEFAULT_ADMISSION_GIT_ADAPTER,
      async inspectWorktree(repoRoot: string, worktree: string) {
        const inspection = await DEFAULT_ADMISSION_GIT_ADAPTER.inspectWorktree(repoRoot, worktree);
        return { ...inspection, head: '0'.repeat(40) };
      },
    };
    await expect(execute(input, dependencies({ git: wrongHead }))).rejects.toMatchObject({ code: 'worktree_head_mismatch' });
    expect(await readFile(path.join(repo.root, 'ontology', 'concepts', 'hope.yaml'), 'utf8')).toBe(repo.sourceText);
  });

  it('recovers interrupted source apply, verify failure, and committed manifest publication', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    const preview = await previewAdmission(input);
    let applies = 0;
    await expect(runAdmission({
      ...input, expectedPreviewDigest: preview.digest, decisions: decisions(preview), linkedCaseIds: [CASE_ID], provenance: ['review:crash'],
      dependencies: dependencies({ apply: { onPhase(phase) { if (phase === 'validated') applies += 1; if (applies === 2 && phase === 'committed') throw new Error('manifest interruption'); } } }),
    })).rejects.toThrow(/manifest interruption/);
    const recovered = await execute(input);
    expect(recovered.status).toBe('ALREADY_ADMITTED');

    const second = await repository();
    const secondInput = await previewInput(second.root, second.commit, second.sourceText);
    await expect(execute(secondInput, dependencies({ async verify() { throw new Error('verify failed'); } }))).rejects.toThrow(/verify failed/);
    expect(await readFile(path.join(second.root, 'ontology', 'concepts', 'hope.yaml'), 'utf8')).toBe(second.sourceText);
    expect(await readdir(path.join(second.root, 'workbench', '.state', 'admission-worktrees'))).toEqual([]);

    const third = await repository();
    const thirdInput = await previewInput(third.root, third.commit, third.sourceText);
    await expect(execute(thirdInput, dependencies({ apply: { crashAt: 'committed' } }))).rejects.toThrow(/Injected crash/);
    expect(await readFile(path.join(third.root, 'ontology', 'concepts', 'hope.yaml'), 'utf8')).toBe(third.sourceText);
    const retry = await execute(thirdInput);
    expect(retry.status).toBe('ADMITTED');
  }, 120_000);

  it('rejects cache substitution and rebuild identity drift', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    await expect(execute(input, dependencies({
      async rebuild(_worktree, preview) {
        return { status: 'CACHE_HIT', descriptor: descriptor(preview), descriptorSha256: 'a'.repeat(64), databaseSha256: 'a'.repeat(64), command: outcome('cache') } as unknown as RebuildEvidence;
      },
    }))).rejects.toMatchObject({ code: 'cache_substitution' });
    await expect(execute(input, dependencies({
      async rebuild(_worktree, preview) {
        const built = descriptor(preview);
        return { status: 'REBUILT', descriptor: { ...built, layerFingerprint: '0'.repeat(64) }, descriptorSha256: 'a'.repeat(64), databaseSha256: built.databaseSha256, command: outcome('build') };
      },
    }))).rejects.toMatchObject({ code: 'rebuild_identity_mismatch' });
  });

  it('rejects source symlinks without reading outside bytes', async () => {
    const repo = await repository();
    const outside = await mkdtemp(path.join(os.tmpdir(), 'admission-outside-'));
    temporary.push(outside);
    const secret = path.join(outside, 'secret.yaml');
    await writeFile(secret, repo.sourceText);
    await rm(path.join(repo.root, 'ontology', 'concepts', 'hope.yaml'));
    try { await symlink(secret, path.join(repo.root, 'ontology', 'concepts', 'hope.yaml'), 'file'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'EPERM') return; throw error; }
    await expect(previewAdmission(await previewInput(repo.root, repo.commit, repo.sourceText))).rejects.toMatchObject({ code: 'unsafe_path' });
  });

  it('serializes concurrent admissions into one immutable manifest', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    const [left, right] = await Promise.all([execute(input), execute(input)]);
    expect([left.status, right.status].sort()).toEqual(['ADMITTED', 'ALREADY_ADMITTED']);
    const names = await readdir(path.join(repo.root, 'workbench', 'admissions'));
    expect(names.filter((name) => name.endsWith('.json'))).toHaveLength(1);
    expect(left.manifest?.digest).toBe(right.manifest?.digest);
  });
});
