import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it } from 'vitest';

import { signAdmissionDecision, type AdmissionManifest, type AdmissionPreview, type CommandOutcome } from '../src/admission.js';
import { calculateComparisonReportDigest, type ComparisonReport } from '../src/comparison.js';
import { resolveNpmCliPath } from '../src/jobRunner.js';
import {
  prepareDraftPublication,
  PublishPreparationError,
  type PublishPhase,
  type SafeCommandResult,
  type SafeCommandRunner,
} from '../src/publishPreparation.js';
import { parseProposalManifest, proposalManifestDigest } from '../src/proposals.js';

const execFileAsync = promisify(execFile);
const temporary: string[] = [];
const SIGNING_KEY = 'publish-preparation-test-signing-key-with-entropy';
const CASE_ID = '11111111-1111-4111-8111-111111111111';
const OPERATION_ID = '22222222-2222-4222-8222-222222222222';

function canonical(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`).join(',')}}`;
}

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function digest(value: unknown): string {
  return sha256(canonical(value));
}

async function command(command: string, args: readonly string[], cwd: string): Promise<SafeCommandResult> {
  try {
    const result = await execFileAsync(command, [...args], { cwd, windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
    return { exitCode: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    const failure = error as Error & { code?: number | string; stdout?: string; stderr?: string };
    return {
      exitCode: typeof failure.code === 'number' ? failure.code : 127,
      stdout: failure.stdout ?? '',
      stderr: failure.stderr ?? failure.message,
    };
  }
}

async function git(cwd: string, args: readonly string[]): Promise<string> {
  const result = await command('git', args, cwd);
  if (result.exitCode !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`);
  return result.stdout.trim();
}

function outcome(commandName: string, args: readonly string[]): CommandOutcome {
  return {
    command: commandName,
    args,
    cwd: 'isolated-admission-worktree',
    exitCode: 0,
    stdoutSha256: sha256(''),
    stderrSha256: sha256(''),
    stdoutTail: '',
    stderrTail: '',
  };
}

function proposal(beforeText: string): unknown {
  return {
    schemaVersion: 1,
    proposalId: 'hope-gap',
    fixtureId: 'hope-gap',
    caseIds: [CASE_ID],
    sourcePreconditions: [{ path: 'ontology/concepts/hope.yaml', sha256: sha256(beforeText) }],
    operations: [{
      operationId: OPERATION_ID,
      type: 'lexicon-phrase-add',
      sourcePaths: ['ontology/concepts/hope.yaml'],
      provenance: {
        source: 'editorial',
        confirmed: true,
        reviewer: 'Publish Reviewer',
        evidence: 'A separately reviewed query demonstrates the exact lexical gap.',
      },
      reason: 'Add the admitted reviewed phrase without touching unrelated sources.',
      conceptId: 'hope',
      phrase: 'hope in God',
    }],
  };
}

interface TestRepository {
  readonly root: string;
  readonly remote: string;
  readonly baseCommit: string;
  readonly beforeText: string;
  readonly afterText: string;
  readonly proposal: unknown;
  readonly manifest: AdmissionManifest;
  readonly preview: AdmissionPreview;
  readonly comparison: ComparisonReport;
  readonly manifestPath: string;
}

async function treeFor(remote: string, afterText: string): Promise<string> {
  return treeForChanges(remote, [{ path: 'ontology/concepts/hope.yaml', text: afterText }]);
}

async function treeForChanges(remote: string, changes: readonly { readonly path: string; readonly text: string }[]): Promise<string> {
  const preview = await mkdtemp(path.join(os.tmpdir(), 'publish-tree-'));
  temporary.push(preview);
  await git(preview, ['clone', '--quiet', remote, '.']);
  for (const change of changes) {
    const target = path.join(preview, ...change.path.split('/'));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, change.text);
  }
  await git(preview, ['add', '--', ...changes.map((entry) => entry.path)]);
  return git(preview, ['write-tree']);
}

async function repository(verifyScript = 'node -e "process.exit(0)"'): Promise<TestRepository> {
  const container = await mkdtemp(path.join(os.tmpdir(), 'publish-preparation-'));
  temporary.push(container);
  const remote = path.join(container, 'remote.git');
  const root = path.join(container, 'primary');
  await mkdir(root);
  await git(container, ['init', '--bare', '--initial-branch=main', remote]);
  await git(root, ['init', '-b', 'main']);
  await git(root, ['config', 'core.autocrlf', 'false']);
  await git(root, ['config', 'user.name', 'Test Author']);
  await git(root, ['config', 'user.email', 'author@example.test']);
  const beforeText = 'id: hope\nlabel: Hope\nlexicon:\n  - hope\n';
  const afterText = 'id: hope\nlabel: Hope\nlexicon:\n  - hope\n  - hope in God\n';
  await mkdir(path.join(root, 'ontology', 'concepts'), { recursive: true });
  await writeFile(path.join(root, 'ontology', 'concepts', 'hope.yaml'), beforeText);
  await writeFile(path.join(root, '.gitignore'), 'workbench/.state/\n');
  await writeFile(path.join(root, 'README.md'), 'base\n');
  await writeFile(path.join(root, 'package.json'), `${JSON.stringify({ private: true, scripts: { verify: verifyScript } }, null, 2)}\n`);
  await git(root, ['add', '--all']);
  await git(root, ['commit', '-m', 'base']);
  await git(root, ['remote', 'add', 'origin', remote]);
  await git(root, ['push', '-u', 'origin', 'main']);
  const baseCommit = await git(root, ['rev-parse', 'HEAD']);
  const parsedProposal = parseProposalManifest(proposal(beforeText));
  const proposalDigest = proposalManifestDigest(parsedProposal);
  const before = { sha256: sha256(beforeText), base64: Buffer.from(beforeText).toString('base64'), text: beforeText };
  const after = { sha256: sha256(afterText), base64: Buffer.from(afterText).toString('base64'), text: afterText };
  const diffBody = {
    path: 'ontology/concepts/hope.yaml',
    kind: 'yaml' as const,
    operationIds: [OPERATION_ID],
    before,
    after,
    changed: true,
  };
  const sourceChange = { ...diffBody, digest: digest(diffBody) };
  const candidate = {
    cacheKey: '3'.repeat(64),
    proposalDigest,
    sourceSnapshotDigest: '4'.repeat(64),
    descriptorSha256: '5'.repeat(64),
    databaseSha256: '6'.repeat(64),
    engineVersion: 'engine-1',
    corpusFingerprint: '7'.repeat(64),
    layerFingerprint: '8'.repeat(64),
    candidateDirectory: `workbench/.state/candidates/${'3'.repeat(64)}`,
    descriptorPath: `workbench/.state/candidates/${'3'.repeat(64)}/candidate-artifact.json`,
    databasePath: `workbench/.state/candidates/${'3'.repeat(64)}/content.db`,
  };
  const identity = {
    engineVersion: candidate.engineVersion,
    corpusFingerprint: candidate.corpusFingerprint,
    layerFingerprint: candidate.layerFingerprint,
  };
  const referenceIdentity = { ...identity, layerFingerprint: 'a'.repeat(64) };
  const memberships = [{
    kind: 'linked-case' as const,
    sourceId: CASE_ID,
    expected: { targetId: 'A', withinTop: 3 as const, requiredReasonFamilies: ['concept_anchor'] },
    expectedChange: true,
  }];
  const referenceTop10 = [
    {
      targetId: 'A', reference: 'Psalm 42:5', score: 10,
      reasons: [{
        family: 'concept_anchor', label: 'Hope anchor', points: 10, uncappedPoints: 10, capped: false,
        provenance: { sourceId: 'ontology:hope', label: 'Hope', locator: 'Psalm 42:5', weight: 1 },
      }],
    },
    {
      targetId: 'B', reference: 'Romans 5:3', score: 8,
      reasons: [{ family: 'lexical', label: 'hope', points: 8, uncappedPoints: 8, capped: false, provenance: null }],
    },
  ];
  const candidateTop10 = [
    {
      targetId: 'A', reference: 'Psalm 42:5', score: 12,
      reasons: [{
        family: 'concept_anchor', label: 'Hope anchor plus phrase', points: 12, uncappedPoints: 12, capped: false,
        provenance: { sourceId: 'ontology:hope', label: 'Hope', locator: 'Psalm 42:5', weight: 1 },
      }],
    },
    {
      targetId: 'C', reference: 'Psalm 71:5', score: 9,
      reasons: [{ family: 'lexical', label: 'hope in God', points: 9, uncappedPoints: 9, capped: false, provenance: null }],
    },
  ];
  const expected = { targetId: 'A', withinTop: 3 as const, requiredReasonFamilies: ['concept_anchor'] };
  const expectedEvaluation = {
    expected, found: true, rank: 1, reasonFamiliesPresent: ['concept_anchor'], provenanceSourceIdsPresent: ['ontology:hope'],
    requiredReasonFamiliesMissing: [], requiredProvenanceSourceIdsMissing: [], passes: true,
  };
  const comparisonBody: Omit<ComparisonReport, 'digest'> = {
    schemaVersion: 1,
    universe: [{ query: 'hope', memberships }],
    referenceIdentity,
    candidateIdentity: identity,
    queries: [{
      query: 'hope', memberships,
      reference: { identity: referenceIdentity, top10: referenceTop10, latencyMs: 2 },
      candidate: { identity, top10: candidateTop10, latencyMs: 3 },
      expectedReferenceOutcomes: { reference: [expectedEvaluation], candidate: [expectedEvaluation] },
      expectationStatus: { referencePasses: true, candidatePasses: true, referenceFailureCount: 0, candidateFailureCount: 0 },
      movement: {
        added: ['C'], removed: ['B'], rankMoved: [], reasonChanged: ['A'], provenanceChanged: [], scoreChanged: ['A'], capChanged: [],
      },
      top10Changed: true,
      verdict: 'expected-change',
    }],
    regressionSessionQueryIds: [],
    referenceExpectationFailureQueryIds: [],
    candidateExpectationFailureQueryIds: [],
    summary: {
      declaredUniverseSize: 1, executedQueryCount: 1, changedTop10QueryCount: 1, changedTop10ResultCount: 3,
      regressionSessionQueryCount: 0, referenceExpectationFailureQueryCount: 0, candidateExpectationFailureQueryCount: 0,
      candidateAdmissionBlocked: false,
      verdictCounts: { improved: 0, unchanged: 0, 'expected-change': 1, ambiguous: 0, regressed: 0 },
      text: 'One linked query changed as separately reviewed and expected.',
    },
  };
  const comparison: ComparisonReport = { ...comparisonBody, digest: calculateComparisonReportDigest({ ...comparisonBody, digest: '' }) };
  const gates = [
    {
      gate: 'G1-provenance' as const,
      code: 'synthetic-g1',
      title: 'Synthetic G1',
      status: 'pass' as const,
      applicability: 'required' as const,
      verdict: 'pass' as const,
      summary: 'The required synthetic gate passed.',
      findings: [{
        categoryCode: 'provenance.complete', instanceId: 'finding-g1', gateId: 'G1-provenance' as const,
        gateTitle: 'Synthetic G1', gateStatus: 'pass' as const, gateVerdict: 'pass' as const,
        message: 'All admitted sources carry complete provenance.', subjects: ['ontology/concepts/hope.yaml'],
        params: { reviewed: true }, metrics: { sources: 1 },
        compatibility: { categorySchema: 'scripture-search-engine/gauntlet-finding-category/v1' as const, categoryVersion: 1 as const, paramsPolicy: 'additive-only' as const },
      }],
      metrics: {},
      promotionCandidates: [],
    },
    {
      gate: 'G8-noise-probes' as const,
      code: 'synthetic-g8',
      title: 'Synthetic G8',
      status: 'pass' as const,
      applicability: 'required' as const,
      verdict: 'pass' as const,
      summary: 'The invariant synthetic gate passed.',
      findings: [],
      metrics: {},
      promotionCandidates: [],
    },
  ];
  const gauntletBody = {
    schemaVersion: 1 as const,
    reportPath: 'eval/.runs/gauntlet-report.json',
    reportSha256: 'b'.repeat(64),
    payloadSha256: 'c'.repeat(64),
    startedAt: '2026-08-11T11:00:00.000Z',
    finishedAt: '2026-08-11T11:10:00.000Z',
    blocking: false,
    verdict: 'ADMIT' as const,
    baseIdentity: referenceIdentity,
    candidateIdentity: identity,
    baseCommit,
    proposalDigest,
    sourceSnapshotDigest: candidate.sourceSnapshotDigest,
    candidateDescriptorSha256: candidate.descriptorSha256,
    candidateDatabaseSha256: candidate.databaseSha256,
    comparisonDigest: comparison.digest,
    gates,
    gatesDigest: digest(gates),
  };
  const gauntlet = { ...gauntletBody, digest: digest(gauntletBody) };
  const treeHash = await treeFor(remote, afterText);
  const sourceDecisionSubject = digest({ proposalDigest, diffs: [sourceChange.digest] });
  const previewBody: Omit<AdmissionPreview, 'digest'> = {
    schemaVersion: 1,
    proposal: parsedProposal,
    proposalDigest,
    admittedBaseCommit: baseCommit,
    expectedMainCommit: baseCommit,
    candidate,
    comparisonDigest: comparison.digest,
    comparisonUniverseDigest: digest(comparison.universe),
    comparisonReviewDigest: digest({ reviewedQueries: ['hope'], changedQueries: ['hope'], regressionSessionQueryIds: [] }),
    gauntletDigest: gauntlet.digest,
    gauntlet,
    reviewedComparisonQueries: ['hope'],
    diffs: [sourceChange],
    fixtureDecisionSubjects: [],
    probeMovements: [],
    probeDecisionSubject: null,
    sourceDecisionSubject,
    decisionSlots: [{ kind: 'source-proposal', slotId: 'source-proposal', subjectDigest: sourceDecisionSubject }],
    measurableEffect: true,
  };
  const preview: AdmissionPreview = { ...previewBody, digest: digest(previewBody) };
  const decision = signAdmissionDecision({
    kind: 'source-proposal',
    subjectDigest: sourceDecisionSubject,
    previewDigest: preview.digest,
    reviewer: 'Independent Reviewer',
    rationale: 'The exact source proposal and observed movement are approved.',
    decidedAt: '2026-08-11T10:30:00.000Z',
  }, SIGNING_KEY);
  const admissionKey = digest({ previewDigest: preview.digest, decisions: [decision.decisionDigest] });
  const body: Omit<AdmissionManifest, 'digest'> = {
    schemaVersion: 1,
    kind: 'scripture-search-admission',
    admissionKey,
    admittedAt: '2026-08-11T12:00:00.000Z',
    previewDigest: preview.digest,
    proposalDigest,
    linkedCaseIds: [CASE_ID],
    provenance: ['case:11111111-1111-4111-8111-111111111111', 'review:independent-reviewer'],
    baseCommit,
    expectedMainCommit: baseCommit,
    worktreeTreeHash: treeHash,
    decisions: [decision],
    candidate,
    rebuiltCandidate: {
      status: 'REBUILT',
      descriptor: { ...identity, databaseSha256: candidate.databaseSha256 },
      descriptorSha256: candidate.descriptorSha256,
      databaseSha256: candidate.databaseSha256,
      command: outcome('node', ['npm', 'run', 'build:artifact']),
    },
    comparison: {
      digest: comparison.digest,
      binding: {
        cacheKey: candidate.cacheKey,
        proposalDigest,
        databaseSha256: candidate.databaseSha256,
        descriptorSha256: candidate.descriptorSha256,
        referenceIdentity,
        candidateIdentity: identity,
        comparisonDigest: comparison.digest,
      },
    },
    gauntlet,
    sourceChanges: [sourceChange],
    probeMovements: [],
    commands: [outcome(process.execPath, [resolveNpmCliPath(), 'run', 'verify'])],
    rollback: [{
      path: sourceChange.path,
      restoreSha256: before.sha256,
      restoreBase64: before.base64,
      admittedSha256: after.sha256,
    }],
  };
  const manifest: AdmissionManifest = { ...body, digest: digest(body) };
  const manifestPath = `workbench/admissions/${admissionKey}.json`;
  await mkdir(path.join(root, 'workbench', 'admissions'), { recursive: true });
  await writeFile(path.join(root, ...manifestPath.split('/')), `${JSON.stringify(manifest, null, 2)}\n`);
  return { root, remote, baseCommit, beforeText, afterText, proposal: parsedProposal, manifest, preview, comparison, manifestPath };
}

function input(repo: TestRepository, extras: Record<string, unknown> = {}) {
  return {
    repoRoot: repo.root,
    admissionManifestPath: repo.manifestPath,
    expectedAdmissionDigest: repo.manifest.digest,
    proposal: repo.proposal,
    admissionSigningKey: SIGNING_KEY,
    evidence: { admissionPreview: repo.preview, comparisonReport: repo.comparison },
    ...extras,
  };
}

async function moveMain(repo: TestRepository, suffix = 'move'): Promise<string> {
  const clone = await mkdtemp(path.join(os.tmpdir(), 'publish-main-move-'));
  temporary.push(clone);
  await git(clone, ['clone', '--quiet', repo.remote, '.']);
  await git(clone, ['config', 'user.name', 'Main Mover']);
  await git(clone, ['config', 'user.email', 'move@example.test']);
  await writeFile(path.join(clone, `${suffix}.txt`), suffix);
  await git(clone, ['add', '--all']);
  await git(clone, ['commit', '-m', suffix]);
  await git(clone, ['push', 'origin', 'main']);
  return git(clone, ['rev-parse', 'HEAD']);
}

async function rewriteManifest(repo: TestRepository, mutate: (value: AdmissionManifest) => AdmissionManifest): Promise<TestRepository> {
  const value = mutate(JSON.parse(JSON.stringify(repo.manifest)) as AdmissionManifest);
  const { digest: _old, ...body } = value;
  const manifest = { ...body, digest: digest(body) } as AdmissionManifest;
  await writeFile(path.join(repo.root, ...repo.manifestPath.split('/')), `${JSON.stringify(manifest, null, 2)}\n`);
  return { ...repo, manifest };
}

async function withFixtureAndProbe(repo: TestRepository): Promise<TestRepository> {
  const fixtureBeforeText = '{\n  "id": "hope-fixture",\n  "status": "pending"\n}\n';
  const fixtureAfterText = '{\n  "id": "hope-fixture",\n  "status": "active"\n}\n';
  const baselineBeforeText = '{\n  "hope-probe": ["B"]\n}\n';
  const baselineAfterText = '{\n  "hope-probe": ["A"]\n}\n';
  await mkdir(path.join(repo.root, 'eval', 'golden'), { recursive: true });
  await mkdir(path.join(repo.root, 'eval', 'baselines'), { recursive: true });
  await writeFile(path.join(repo.root, 'eval', 'golden', 'hope-fixture.json'), fixtureBeforeText);
  await writeFile(path.join(repo.root, 'eval', 'baselines', 'probes.json'), baselineBeforeText);
  await git(repo.root, ['add', '--', 'eval/golden/hope-fixture.json', 'eval/baselines/probes.json']);
  await git(repo.root, ['commit', '-m', 'fixture and probe base']);
  await git(repo.root, ['push', 'origin', 'main']);
  const baseCommit = await git(repo.root, ['rev-parse', 'HEAD']);
  const image = (text: string) => ({ sha256: sha256(text), base64: Buffer.from(text).toString('base64'), text });
  const source = repo.manifest.sourceChanges[0]!;
  const fixtureBody = {
    path: 'eval/golden/hope-fixture.json', kind: 'fixture-promotion' as const, operationIds: [] as readonly string[],
    before: image(fixtureBeforeText), after: image(fixtureAfterText), changed: true,
  };
  const fixture = { ...fixtureBody, digest: digest(fixtureBody) };
  const baselineBody = {
    path: 'eval/baselines/probes.json', kind: 'probe-baseline' as const, operationIds: [] as readonly string[],
    before: image(baselineBeforeText), after: image(baselineAfterText), changed: true,
  };
  const baseline = { ...baselineBody, digest: digest(baselineBody) };
  const diffs = [baseline, fixture, source].sort((left, right) => left.path.localeCompare(right.path));
  const movement = { probeId: 'hope-probe', beforeSha256: sha256('["B"]'), afterSha256: sha256('["A"]') };
  const fixtureSubject = 'f'.repeat(64);
  const probeSubject = digest({ movements: [movement], diff: baseline.digest });
  const sourceSubject = digest({ proposalDigest: repo.manifest.proposalDigest, diffs: [source.digest] });
  const { digest: _gauntletDigest, ...oldGauntletBody } = repo.manifest.gauntlet;
  const gauntletBody = { ...oldGauntletBody, baseCommit };
  const gauntlet = { ...gauntletBody, digest: digest(gauntletBody) };
  const previewBody: Omit<AdmissionPreview, 'digest'> = {
    ...repo.preview,
    admittedBaseCommit: baseCommit,
    expectedMainCommit: baseCommit,
    gauntletDigest: gauntlet.digest,
    gauntlet,
    diffs,
    fixtureDecisionSubjects: [{ fixtureId: 'hope-fixture', digest: fixtureSubject }],
    probeMovements: [movement],
    probeDecisionSubject: probeSubject,
    sourceDecisionSubject: sourceSubject,
    decisionSlots: [
      { kind: 'source-proposal', slotId: 'source-proposal', subjectDigest: sourceSubject },
      { kind: 'fixture-promotion', slotId: 'hope-fixture', subjectDigest: fixtureSubject },
      { kind: 'probe-baseline', slotId: 'probe-baseline', subjectDigest: probeSubject },
    ],
  };
  const { digest: _oldPreviewDigest, ...canonicalPreviewBody } = previewBody as AdmissionPreview;
  const preview: AdmissionPreview = { ...canonicalPreviewBody, digest: digest(canonicalPreviewBody) };
  const decisions = [
    signAdmissionDecision({
      kind: 'source-proposal', subjectDigest: sourceSubject, previewDigest: preview.digest, reviewer: 'Source Reviewer',
      rationale: 'The exact source proposal remains independently approved.', decidedAt: '2026-08-11T10:30:00.000Z',
    }, SIGNING_KEY),
    signAdmissionDecision({
      kind: 'fixture-promotion', subjectDigest: fixtureSubject, previewDigest: preview.digest, reviewer: 'Fixture Reviewer',
      rationale: 'The pending fixture promotion is independently approved.', decidedAt: '2026-08-11T10:31:00.000Z',
    }, SIGNING_KEY),
    signAdmissionDecision({
      kind: 'probe-baseline', subjectDigest: probeSubject, previewDigest: preview.digest, reviewer: 'Probe Reviewer',
      rationale: 'The exact probe baseline movement is independently approved.', decidedAt: '2026-08-11T10:32:00.000Z',
      probeRationales: [{ ...movement, rationale: 'The corrected hope result intentionally replaces the stale target.' }],
    }, SIGNING_KEY),
  ].sort((left, right) => left.kind.localeCompare(right.kind) || left.subjectDigest.localeCompare(right.subjectDigest));
  const admissionKey = digest({ previewDigest: preview.digest, decisions: decisions.map((entry) => entry.decisionDigest) });
  const treeHash = await treeForChanges(repo.remote, [
    { path: source.path, text: source.after.text },
    { path: fixture.path, text: fixture.after.text },
    { path: baseline.path, text: baseline.after.text },
  ]);
  const manifestBody: Omit<AdmissionManifest, 'digest'> = {
    ...repo.manifest,
    admissionKey,
    previewDigest: preview.digest,
    baseCommit,
    expectedMainCommit: baseCommit,
    worktreeTreeHash: treeHash,
    decisions,
    gauntlet,
    sourceChanges: diffs,
    probeMovements: [movement],
    rollback: diffs.map((entry) => ({
      path: entry.path, restoreSha256: entry.before.sha256, restoreBase64: entry.before.base64, admittedSha256: entry.after.sha256,
    })),
  };
  const { digest: _oldManifestDigest, ...canonicalManifestBody } = manifestBody as AdmissionManifest;
  const manifest: AdmissionManifest = { ...canonicalManifestBody, digest: digest(canonicalManifestBody) };
  const manifestPath = `workbench/admissions/${admissionKey}.json`;
  await writeFile(path.join(repo.root, ...manifestPath.split('/')), `${JSON.stringify(manifest, null, 2)}\n`);
  return { ...repo, baseCommit, manifest, preview, manifestPath };
}

async function withoutDecision(repo: TestRepository, kind: 'fixture-promotion' | 'probe-baseline'): Promise<TestRepository> {
  const decisions = repo.manifest.decisions.filter((entry) => entry.kind !== kind);
  const admissionKey = digest({ previewDigest: repo.preview.digest, decisions: decisions.map((entry) => entry.decisionDigest) });
  const body: Omit<AdmissionManifest, 'digest'> = { ...repo.manifest, admissionKey, decisions };
  const { digest: _old, ...canonicalBody } = body as AdmissionManifest;
  const manifest: AdmissionManifest = { ...canonicalBody, digest: digest(canonicalBody) };
  const manifestPath = `workbench/admissions/${admissionKey}.json`;
  await writeFile(path.join(repo.root, ...manifestPath.split('/')), `${JSON.stringify(manifest, null, 2)}\n`);
  return { ...repo, manifest, manifestPath };
}

class RecordingRunner implements SafeCommandRunner {
  readonly calls: { command: string; args: readonly string[]; cwd: string }[] = [];

  constructor(private readonly intercept?: (command: string, args: readonly string[], cwd: string) => Promise<SafeCommandResult | null>) {}

  async run(commandName: string, args: readonly string[], cwd: string): Promise<SafeCommandResult> {
    this.calls.push({ command: commandName, args: [...args], cwd });
    const intercepted = await this.intercept?.(commandName, args, cwd);
    return intercepted ?? command(commandName, args, cwd);
  }
}

afterEach(async () => {
  for (const directory of temporary.splice(0).reverse()) await rm(directory, { recursive: true, force: true }).catch(() => undefined);
});

describe('M14 isolated draft publication preparation', () => {
  it('prepares an exact local branch while preserving dirty, staged, and untracked primary bytes and index', async () => {
    const repo = await repository();
    await writeFile(path.join(repo.root, 'README.md'), 'staged user change\n');
    await git(repo.root, ['add', 'README.md']);
    await writeFile(path.join(repo.root, 'README.md'), 'unstaged user change after staging\n');
    await writeFile(path.join(repo.root, 'user-notes.txt'), 'private untracked note\n');
    const beforeStatus = await git(repo.root, ['status', '--porcelain=v2', '-z', '--untracked-files=all']);
    const beforeIndex = await git(repo.root, ['write-tree']);
    const beforeReadme = await readFile(path.join(repo.root, 'README.md'), 'utf8');

    const result = await prepareDraftPublication(input(repo));

    expect(result.status).toBe('LOCAL_READY');
    expect(result.branch).toBe('refinement/2026-08-11-hope-gap');
    expect(await git(result.worktree, ['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD']))
      .toBe('ontology/concepts/hope.yaml');
    expect(await readFile(path.join(result.worktree, 'ontology', 'concepts', 'hope.yaml'), 'utf8')).toBe(repo.afterText);
    expect(await git(result.worktree, ['rev-parse', 'HEAD^{tree}'])).toBe(repo.manifest.worktreeTreeHash);
    expect(await git(repo.root, ['status', '--porcelain=v2', '-z', '--untracked-files=all'])).toBe(beforeStatus);
    expect(await git(repo.root, ['write-tree'])).toBe(beforeIndex);
    expect(await readFile(path.join(repo.root, 'README.md'), 'utf8')).toBe(beforeReadme);
    expect(result.prBody).toContain('### Linked cases');
    expect(result.prBody).toContain('### Rollback');
    expect(result.prBody).toContain(repo.manifest.digest);
  }, 120_000);

  it('forces rebuild and review when origin/main moves before or during every local preparation phase', async () => {
    const initial = await repository();
    await moveMain(initial, 'before-preflight');
    await expect(prepareDraftPublication(input(initial))).rejects.toMatchObject({ code: 'main_moved' });

    for (const phase of ['worktree-created', 'files-applied', 'verified', 'committed'] as const satisfies readonly PublishPhase[]) {
      const repo = await repository();
      let moved = false;
      await expect(prepareDraftPublication(input(repo, {
        dependencies: {
          async onPhase(current: PublishPhase) {
            if (current === phase && !moved) {
              moved = true;
              await moveMain(repo, `during-${phase}`);
            }
          },
        },
      }))).rejects.toMatchObject({ code: 'main_moved' });
      expect(moved).toBe(true);
    }

    for (const phase of ['pushed', 'draft-pr-opened'] as const satisfies readonly PublishPhase[]) {
      const repo = await repository();
      let moved = false;
      let created = false;
      const runner = new RecordingRunner(async (commandName, args, cwd) => {
        if (path.basename(commandName).toLowerCase() !== 'gh') return null;
        if (args[0] === '--version' || args[0] === 'auth') return { exitCode: 0, stdout: 'available\n', stderr: '' };
        if (args[0] === 'pr' && args[1] === 'view') {
          if (!created) return { exitCode: 1, stdout: '', stderr: 'not found' };
          const headRefName = String(args[2]);
          const headRefOid = await git(cwd, ['rev-parse', `refs/heads/${headRefName}`]);
          return { exitCode: 0, stdout: JSON.stringify({ url: 'https://github.example/pr/moved', isDraft: true, headRefName, headRefOid }), stderr: '' };
        }
        if (args[0] === 'pr' && args[1] === 'create') {
          created = true;
          return { exitCode: 0, stdout: 'https://github.example/pr/moved\n', stderr: '' };
        }
        return { exitCode: 1, stdout: '', stderr: 'unexpected gh command' };
      });
      await expect(prepareDraftPublication(input(repo, {
        push: true,
        openDraftPr: phase === 'draft-pr-opened',
        dependencies: {
          runner,
          async onPhase(current: PublishPhase) {
            if (current === phase && !moved) {
              moved = true;
              await moveMain(repo, `during-${phase}`);
            }
          },
        },
      }))).rejects.toMatchObject({ code: 'main_moved' });
      expect(moved).toBe(true);
    }
  }, 120_000);

  it('rejects local and remote branch conflicts and a dirty destination path', async () => {
    const local = await repository();
    const branch = 'refinement/2026-08-11-hope-gap';
    await git(local.root, ['branch', branch]);
    await expect(prepareDraftPublication(input(local))).rejects.toMatchObject({ code: 'branch_conflict' });

    const remote = await repository();
    await git(remote.root, ['push', 'origin', `refs/heads/main:refs/heads/${branch}`]);
    await expect(prepareDraftPublication(input(remote))).rejects.toMatchObject({ code: 'branch_conflict' });

    const dirty = await repository();
    const destination = path.join(dirty.root, 'workbench', '.state', 'worktrees', 'hope-gap');
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, 'foreign.txt'), 'not owned\n');
    await expect(prepareDraftPublication(input(dirty))).rejects.toMatchObject({ code: 'worktree_conflict' });
  });

  it('rejects unapproved files, artifact databases, state, and telemetry output from verification', async () => {
    const cases = [
      ['unapproved_file', 'node -e "require(\'fs\').writeFileSync(\'rogue.txt\',\'x\')"'],
      ['forbidden_output', 'node -e "require(\'fs\').mkdirSync(\'workbench/.artifact\',{recursive:true});require(\'fs\').writeFileSync(\'workbench/.artifact/content.db\',\'x\')"'],
      ['forbidden_output', 'node -e "require(\'fs\').mkdirSync(\'workbench/.state\',{recursive:true});require(\'fs\').writeFileSync(\'workbench/.state/foreign.json\',\'{}\')"'],
      ['forbidden_output', 'node -e "require(\'fs\').mkdirSync(\'telemetry\',{recursive:true});require(\'fs\').writeFileSync(\'telemetry/dump.json\',\'{}\')"'],
    ] as const;
    for (const [code, script] of cases) {
      const repo = await repository(script);
      await expect(prepareDraftPublication(input(repo))).rejects.toMatchObject({ code });
    }
  }, 60_000);

  it('rejects failed verification, admission digest drift, signature drift, and tree mismatch', async () => {
    const failed = await repository('node -e "process.exit(7)"');
    await expect(prepareDraftPublication(input(failed))).rejects.toMatchObject({ code: 'verify_failed' });

    const digestDrift = await repository();
    await expect(prepareDraftPublication(input(digestDrift, { expectedAdmissionDigest: '0'.repeat(64) })))
      .rejects.toMatchObject({ code: 'invalid_manifest' });

    let signature = await repository();
    signature = await rewriteManifest(signature, (manifest) => ({
      ...manifest,
      decisions: [{ ...manifest.decisions[0]!, signature: '0'.repeat(64) }],
    }));
    await expect(prepareDraftPublication(input(signature))).rejects.toMatchObject({ code: 'invalid_signature' });

    let tree = await repository();
    tree = await rewriteManifest(tree, (manifest) => ({ ...manifest, worktreeTreeHash: '0'.repeat(40) }));
    await expect(prepareDraftPublication(input(tree))).rejects.toMatchObject({ code: 'tree_mismatch' });
  });

  it('resumes interruption after verification and after commit idempotently', async () => {
    for (const crashPhase of ['verified', 'committed'] as const satisfies readonly PublishPhase[]) {
      const repo = await repository();
      let crashed = false;
      await expect(prepareDraftPublication(input(repo, {
        dependencies: {
          onPhase(phase: PublishPhase) {
            if (phase === crashPhase && !crashed) {
              crashed = true;
              throw new Error(`interrupt-${phase}`);
            }
          },
        },
      }))).rejects.toThrow(`interrupt-${crashPhase}`);
      const recovered = await prepareDraftPublication(input(repo));
      const repeated = await prepareDraftPublication(input(repo));
      expect(recovered.commit).toBe(repeated.commit);
      expect(await git(recovered.worktree, ['rev-list', '--count', `${repo.baseCommit}..HEAD`])).toBe('1');
    }
  }, 60_000);

  it('rejects a forged allowed-path commit after a verified crash and recreates from admitted evidence', async () => {
    const repo = await repository();
    let verifyRuns = 0;
    let crashed = false;
    const runner = new RecordingRunner(async (commandName, args) => {
      if (path.resolve(commandName) === path.resolve(process.execPath) && args.at(-2) === 'run' && args.at(-1) === 'verify') verifyRuns += 1;
      return null;
    });
    await expect(prepareDraftPublication(input(repo, {
      dependencies: {
        runner,
        onPhase(phase: PublishPhase) {
          if (phase === 'verified' && !crashed) {
            crashed = true;
            throw new Error('verified-crash');
          }
        },
      },
    }))).rejects.toThrow('verified-crash');
    const worktree = path.join(repo.root, 'workbench', '.state', 'worktrees', 'hope-gap');
    await writeFile(path.join(worktree, 'ontology', 'concepts', 'hope.yaml'), 'id: hope\nlabel: Forged\nlexicon:\n  - forged\n');
    await git(worktree, ['add', '--', 'ontology/concepts/hope.yaml']);
    await git(worktree, ['-c', 'user.name=Forger', '-c', 'user.email=forger@example.test', 'commit', '-m', 'refinement: hope-gap']);
    const forgedCommit = await git(worktree, ['rev-parse', 'HEAD']);

    const recovered = await prepareDraftPublication(input(repo, { dependencies: { runner } }));
    expect(recovered.commit).not.toBe(forgedCommit);
    expect(verifyRuns).toBe(3);
    expect(await git(recovered.worktree, ['rev-parse', 'HEAD^'])).toBe(repo.baseCommit);
    expect(await git(recovered.worktree, ['rev-parse', 'HEAD^{tree}'])).toBe(repo.manifest.worktreeTreeHash);
    expect(await readFile(path.join(recovered.worktree, 'ontology', 'concepts', 'hope.yaml'), 'utf8')).toBe(repo.afterText);
    const message = await git(recovered.worktree, ['show', '-s', '--format=%B', 'HEAD']);
    expect(message).toContain(`Admission-Digest: ${repo.manifest.digest}`);
    expect(message).toContain('Verification-Digest:');
    const journal = JSON.parse(await readFile(path.join(repo.root, 'workbench', '.state', 'publish-journals', 'hope-gap.json'), 'utf8')) as {
      verification: { schemaVersion: number; commit: string; preCommit: { digest: string }; committed: { digest: string } };
    };
    expect(journal.verification).toMatchObject({ schemaVersion: 2, commit: recovered.commit });
    expect(journal.verification.preCommit.digest).toMatch(/^[a-f0-9]{64}$/);
    expect(journal.verification.committed.digest).toMatch(/^[a-f0-9]{64}$/);
  }, 90_000);

  it('fails closed when a previously pushed remote branch is force-moved or a PR reports the wrong head', async () => {
    const moved = await repository();
    const pushed = await prepareDraftPublication(input(moved, { push: true }));
    await git(moved.root, ['push', '--force', 'origin', `refs/heads/main:refs/heads/${pushed.branch}`]);
    await expect(prepareDraftPublication(input(moved, { push: true, openDraftPr: true })))
      .rejects.toMatchObject({ code: 'remote_branch_moved' });

    const wrongPr = await repository();
    const local = await prepareDraftPublication(input(wrongPr, { push: true }));
    const runner = new RecordingRunner(async (commandName, args) => {
      if (path.basename(commandName).toLowerCase() !== 'gh') return null;
      if (args[0] === '--version' || args[0] === 'auth') return { exitCode: 0, stdout: 'available\n', stderr: '' };
      if (args[0] === 'pr' && args[1] === 'view') {
        return { exitCode: 0, stdout: JSON.stringify({ url: 'https://github.example/pr/wrong', isDraft: true, headRefName: local.branch, headRefOid: wrongPr.baseCommit }), stderr: '' };
      }
      return { exitCode: 1, stdout: '', stderr: 'unexpected command' };
    });
    await expect(prepareDraftPublication(input(wrongPr, { push: true, openDraftPr: true, dependencies: { runner } })))
      .rejects.toMatchObject({ code: 'pr_verification_failed' });
  }, 90_000);

  it('requires every fixture and probe decision slot and renders complete digest-bound review evidence', async () => {
    const repo = await withFixtureAndProbe(await repository());
    const result = await prepareDraftPublication(input(repo));
    expect(result.prBody).toContain('#### Query: hope');
    expect(result.prBody).toContain('Psalm 42:5');
    expect(result.prBody).toContain('Psalm 71:5');
    expect(result.prBody).toContain('Hope anchor plus phrase');
    expect(result.prBody).toContain('Reason changes: `A`');
    expect(result.prBody).toContain('`hope-probe`');
    expect(result.prBody).toContain('The corrected hope result intentionally replaces the stale target.');
    expect(result.prBody).toContain('All admitted sources carry complete provenance.');
    expect(result.prBody).toContain('ontology/concepts/hope.yaml');
    expect(result.prBody).toContain('eval/golden/hope-fixture.json');
    expect(result.prBody).toContain('eval/baselines/probes.json');
    expect(result.prBody).toContain(repo.comparison.referenceIdentity.layerFingerprint);
    expect(result.prBody).toContain(repo.manifest.gauntlet.digest);

    const missingFixture = await withoutDecision(repo, 'fixture-promotion');
    await expect(prepareDraftPublication(input(missingFixture))).rejects.toMatchObject({ code: 'decision_slot_invalid' });
    const missingProbe = await withoutDecision(repo, 'probe-baseline');
    await expect(prepareDraftPublication(input(missingProbe))).rejects.toMatchObject({ code: 'decision_slot_invalid' });

    const tamperedComparison = JSON.parse(JSON.stringify(repo.comparison)) as ComparisonReport;
    (tamperedComparison.queries[0]!.candidate.top10[0] as { reference: string }).reference = 'Caller supplied fiction';
    await expect(prepareDraftPublication(input(repo, {
      evidence: { admissionPreview: repo.preview, comparisonReport: tamperedComparison },
    }))).rejects.toMatchObject({ code: 'comparison_evidence_invalid' });
  }, 90_000);

  it('keeps verified local work and returns exact safe actions when push or gh is unavailable', async () => {
    const repo = await repository();
    const runner = new RecordingRunner(async (commandName, args) => {
      if (path.basename(commandName).toLowerCase() === 'git' && args[0] === 'push') {
        return { exitCode: 128, stdout: '', stderr: 'authentication unavailable' };
      }
      if (path.basename(commandName).toLowerCase() === 'gh') return { exitCode: 127, stdout: '', stderr: 'gh unavailable' };
      return null;
    });
    const result = await prepareDraftPublication(input(repo, {
      push: true,
      openDraftPr: true,
      dependencies: { runner },
    }));
    expect(result.status).toBe('LOCAL_READY');
    expect(result.safeNextActions.some((entry) => entry.includes('git -C') && entry.includes('push --set-upstream'))).toBe(true);
    expect(result.safeNextActions.some((entry) => entry.startsWith('gh pr create --draft'))).toBe(true);
    expect(await git(result.worktree, ['rev-parse', 'HEAD'])).toBe(result.commit);
  });

  it('pushes and opens only a draft PR with fixed argv, without TLS weakening, merge, release, or workflow dispatch', async () => {
    const repo = await repository();
    let created = false;
    const runner = new RecordingRunner(async (commandName, args, cwd) => {
      if (path.basename(commandName).toLowerCase() !== 'gh') return null;
      if (args[0] === '--version') return { exitCode: 0, stdout: 'gh version test\n', stderr: '' };
      if (args[0] === 'auth') return { exitCode: 0, stdout: 'authenticated\n', stderr: '' };
      if (args[0] === 'pr' && args[1] === 'view') {
        if (!created) return { exitCode: 1, stdout: '', stderr: 'not found' };
        const headRefName = String(args[2]);
        const headRefOid = await git(cwd, ['rev-parse', `refs/heads/${headRefName}`]);
        return { exitCode: 0, stdout: JSON.stringify({ url: 'https://github.example/pr/42', isDraft: true, headRefName, headRefOid }), stderr: '' };
      }
      if (args[0] === 'pr' && args[1] === 'create') {
        created = true;
        return { exitCode: 0, stdout: 'https://github.example/pr/42\n', stderr: '' };
      }
      throw new Error(`Unexpected gh argv: ${args.join(' ')}`);
    });
    const result = await prepareDraftPublication(input(repo, {
      push: true,
      openDraftPr: true,
      dependencies: { runner },
    }));
    expect(result.status).toBe('DRAFT_PR_OPENED');
    expect(result.draftPrUrl).toBe('https://github.example/pr/42');
    expect(await git(repo.root, ['ls-remote', '--heads', 'origin', `refs/heads/${result.branch}`])).toContain(result.commit);
    const flattened = runner.calls.flatMap((entry) => [entry.command, ...entry.args]).join(' ');
    expect(flattened).toContain('pr create --draft --base main --head');
    const commandArgv = runner.calls.map((entry) => [path.basename(entry.command).toLowerCase(), ...entry.args]);
    expect(commandArgv.some((argv) => argv[0] === 'git' && (argv[1] === 'merge' || (argv[1] === 'reset' && argv[2] === '--hard')))).toBe(false);
    expect(commandArgv.some((argv) => argv[0] === 'gh' && (argv[1] === 'workflow' || argv[1] === 'release'))).toBe(false);
    expect(commandArgv.flat().join(' ')).not.toMatch(/sslverify|schannel|--insecure/i);
    const create = runner.calls.find((entry) => path.basename(entry.command).toLowerCase() === 'gh' && entry.args[0] === 'pr' && entry.args[1] === 'create');
    expect(create?.args).toContain('--body');
    expect(create?.args.join('\n')).toContain('### Probe and baseline movement');
    expect(create?.args.join('\n')).toContain('### Artifact identity');
  }, 60_000);

  it('rejects forbidden artifact paths and path traversal before creating a worktree', async () => {
    const repo = await repository();
    const value = JSON.parse(JSON.stringify(repo.manifest)) as AdmissionManifest;
    const source = value.sourceChanges[0]!;
    const badBody = { ...source, path: 'artifacts/content-artifact.json' };
    const bad = { ...badBody, digest: digest(badBody) };
    const changed = await rewriteManifest(repo, (manifest) => ({
      ...manifest,
      sourceChanges: [bad],
      rollback: [{ ...manifest.rollback[0]!, path: bad.path }],
    }));
    await expect(prepareDraftPublication(input(changed))).rejects.toMatchObject({ code: 'unapproved_path' });

    await expect(prepareDraftPublication(input(repo, { admissionManifestPath: '../outside.json' })))
      .rejects.toBeInstanceOf(PublishPreparationError);
  });

  it('rejects an admitted source path represented by a Git submodule entry', async () => {
    const repo = await repository();
    await expect(prepareDraftPublication(input(repo, {
      dependencies: {
        async onPhase(phase: PublishPhase, context: { readonly worktree: string }) {
          if (phase === 'worktree-created') {
            await git(context.worktree, ['update-index', '--add', '--cacheinfo', `160000,${repo.baseCommit},ontology/concepts/hope.yaml`]);
          }
        },
      },
    }))).rejects.toMatchObject({ code: 'submodule_rejected' });
  });
});
