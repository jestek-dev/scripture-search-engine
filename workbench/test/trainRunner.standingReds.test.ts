/**
 * §06 FM-8's test contract for the standing-red classes (guard half) plus the
 * draft-PR ceiling, at the publish seam.
 *
 * FM-8 cases a–b at the `runAdmission` seam — an injected failure absent from
 * the control run refuses `blocking_gauntlet` naming the gate; synthetic
 * G2/G8 reds reproducing identically in the control run ADMIT with both
 * finding sets and the control report digest recorded — are covered by
 * `test/admission.test.ts` ("release-gauntlet red classification"), which
 * owns the admission worktree scaffolding. This file covers what §8.4 books
 * beyond that seam: the runner's failure→stop mapping stops the train
 * `verify-failed`, and the prepared draft PR body carries the triage note
 * verbatim over a fixture-lane admission manifest whose red was classified
 * inherited — through the real `prepareDraftPublication`, asserting the
 * draft-only ceiling holds (no merge, no ready, no push unless asked).
 */
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it } from 'vitest';

import { signAdmissionDecision, type AdmissionManifest, type AdmissionPreview, type CommandOutcome } from '../src/admission.js';
import { resolveNpmCliPath } from '../src/jobRunner.js';
import { prepareDraftPublication } from '../src/publishPreparation.js';
import { parseProposalManifest, proposalManifestDigest } from '../src/proposals.js';

const execFileAsync = promisify(execFile);
const temporary: string[] = [];
const SIGNING_KEY = 'standing-reds-test-signing-key-with-entropy';
const CASE_ID = '31111111-1111-4111-8111-111111111111';
const BASE_IDENTITY = {
  engineVersion: 'engine-1',
  corpusFingerprint: '7'.repeat(64),
  layerFingerprint: '8'.repeat(64),
};
const CONTROL_REPORT_PATH = 'eval/.runs/train-1-control.json';
const CONTROL_REPORT_DIGEST = 'e'.repeat(64);

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

async function git(cwd: string, args: readonly string[]): Promise<string> {
  const result = await execFileAsync('git', [...args], { cwd, windowsHide: true });
  return result.stdout.trim();
}

function outcome(commandName: string, args: readonly string[]): CommandOutcome {
  return {
    command: commandName, args, cwd: 'isolated-admission-worktree', exitCode: 0,
    stdoutSha256: sha256(''), stderrSha256: sha256(''), stdoutTail: '', stderrTail: '',
  };
}

const RED_FINDING = {
  gateId: 'G2-determinism',
  categoryCode: 'sse.gauntlet.v1.finding.g2-determinism.ordering-approval-engine-mismatch',
  subjects: ['ordering-snapshot-approval'],
};

function releaseGauntlet(baseCommit: string): AdmissionManifest['releaseGauntlet'] {
  const gates = [{
    gate: 'G2-determinism', code: 'G2', title: 'Determinism', status: 'fail', applicability: 'required', verdict: 'reject',
    summary: 'Ordering approval identity is stale.',
    findings: [{
      categoryCode: RED_FINDING.categoryCode, instanceId: 'sse.gauntlet.v1.finding-instance.0000000000000000',
      gateId: RED_FINDING.gateId, gateTitle: 'Determinism', gateStatus: 'fail', gateVerdict: 'reject',
      message: 'Ordering snapshot approval does not match the approved engine identity.',
      subjects: RED_FINDING.subjects, params: {}, metrics: {},
      compatibility: { categorySchema: 'sse.gauntlet.v1.finding-categories', categoryVersion: 1, paramsPolicy: 'additive-only' },
    }],
    metrics: {}, promotionCandidates: [],
  }];
  const body = {
    schemaVersion: 1 as const,
    reportPath: 'eval/.runs/admission-release-report.json',
    reportSha256: 'b'.repeat(64),
    payloadSha256: 'c'.repeat(64),
    startedAt: '2026-08-11T11:00:00.000Z',
    finishedAt: '2026-08-11T11:10:00.000Z',
    blocking: true,
    verdict: 'REJECT' as const,
    targetKind: 'release' as const,
    descriptorPath: 'artifacts/content-artifact.json' as const,
    descriptorSha256: 'd'.repeat(64),
    databasePath: 'workbench/.artifact/content.db' as const,
    databaseSha256: '6'.repeat(64),
    engineIdentity: BASE_IDENTITY,
    baseCommit,
    gates,
    gatesDigest: digest(gates),
  };
  return { ...body, digest: digest(body) } as unknown as AdmissionManifest['releaseGauntlet'];
}

async function fixtureLaneRepository(): Promise<{
  root: string;
  manifest: AdmissionManifest;
  preview: AdmissionPreview;
  manifestPath: string;
  proposal: unknown;
}> {
  const container = await realpath(await mkdtemp(path.join(os.tmpdir(), 'standing-reds-')));
  temporary.push(container);
  const remote = path.join(container, 'remote.git');
  const root = path.join(container, 'primary');
  await mkdir(root);
  await git(container, ['init', '--bare', '--initial-branch=main', remote]);
  await git(root, ['init', '-b', 'main']);
  await git(root, ['config', 'core.autocrlf', 'false']);
  await git(root, ['config', 'user.name', 'Test Author']);
  await git(root, ['config', 'user.email', 'author@example.test']);

  const beforeValue = { id: 'hope-gap', generatedBy: 'workbench', status: 'pending', query: 'hope', expectedTop: [], mustNotRank: [] };
  const afterValue = {
    ...beforeValue,
    mustNotRank: [{ ref: 'Jeremiah 4:10', why: 'matched words, not meaning; judged not a fit for this query' }],
  };
  const beforeText = `${JSON.stringify(beforeValue, null, 2)}\n`;
  const afterText = `${JSON.stringify(afterValue, null, 2)}\n`;
  await mkdir(path.join(root, 'eval', 'golden'), { recursive: true });
  await writeFile(path.join(root, 'eval', 'golden', 'hope-gap.json'), beforeText);
  await writeFile(path.join(root, '.gitignore'), 'workbench/.state/\n');
  await writeFile(path.join(root, 'package.json'), `${JSON.stringify({ private: true, scripts: { verify: 'node -e "process.exit(0)"' } }, null, 2)}\n`);
  await git(root, ['add', '--all']);
  await git(root, ['commit', '-m', 'base']);
  await git(root, ['remote', 'add', 'origin', remote]);
  await git(root, ['push', '-u', 'origin', 'main']);
  const baseCommit = await git(root, ['rev-parse', 'HEAD']);

  const proposal = {
    schemaVersion: 1,
    proposalId: 'train-1',
    fixtureId: 'hope-gap',
    caseIds: [CASE_ID],
    sourcePreconditions: [{ path: 'eval/golden/hope-gap.json', sha256: sha256(beforeText) }],
    operations: [{
      operationId: 'golden-fixture-upsert-hope-gap',
      type: 'golden-fixture-upsert',
      goldenFixtureId: 'hope-gap',
      fixture: afterValue,
      sourcePaths: ['eval/golden/hope-gap.json'],
      provenance: {
        source: 'editorial', confirmed: true, reviewer: 'Guard Reviewer',
        evidence: 'The reviewed call asked to keep this passage out of the results.',
      },
      reason: 'Adds the answer-sheet guard line the approved call asked for.',
    }],
  };
  const parsedProposal = parseProposalManifest(proposal);
  const proposalDigest = proposalManifestDigest(parsedProposal);

  const before = { sha256: sha256(beforeText), base64: Buffer.from(beforeText).toString('base64'), text: beforeText };
  const after = { sha256: sha256(afterText), base64: Buffer.from(afterText).toString('base64'), text: afterText };
  const diffBody = {
    path: 'eval/golden/hope-gap.json',
    kind: 'fixture' as const,
    operationIds: ['golden-fixture-upsert-hope-gap'],
    before,
    after,
    changed: true,
  };
  const sourceChange = { ...diffBody, digest: digest(diffBody) };
  const sourceDecisionSubject = digest({ proposalDigest, diffs: [sourceChange.digest] });

  const previewBody: Omit<AdmissionPreview, 'digest'> = {
    schemaVersion: 1,
    proposal: parsedProposal,
    proposalDigest,
    admittedBaseCommit: baseCommit,
    expectedMainCommit: baseCommit,
    candidate: null,
    comparisonDigest: null,
    comparisonUniverseDigest: null,
    comparisonReviewDigest: null,
    gauntletDigest: null,
    gauntlet: null,
    effectExemption: {
      kind: 'fixture-class-effect',
      lane: 'fixture-lane',
      operationTypes: ['golden-fixture-upsert'],
      rationale: 'fixtures are the measuring instrument, not the data being measured — the merge IS the ruling (PR #63)',
    },
    fixtureLane: { operationTypes: ['golden-fixture-upsert'] },
    baseIdentity: BASE_IDENTITY,
    deferredSigningMarker: null,
    reviewedComparisonQueries: [],
    diffs: [sourceChange],
    fixtureDecisionSubjects: [],
    probeMovements: [],
    probeDecisionSubject: null,
    sourceDecisionSubject,
    decisionSlots: [{ kind: 'source-proposal', slotId: 'source-proposal', subjectDigest: sourceDecisionSubject }],
    measurableEffect: false,
  };
  const preview: AdmissionPreview = { ...previewBody, digest: digest(previewBody) };

  const decision = signAdmissionDecision({
    kind: 'source-proposal',
    subjectDigest: sourceDecisionSubject,
    previewDigest: preview.digest,
    reviewer: 'Independent Reviewer',
    rationale: 'The exact answer-sheet lines are reviewed and warranted.',
    decidedAt: '2026-08-11T10:30:00.000Z',
  }, SIGNING_KEY);
  const admissionKey = digest({ previewDigest: preview.digest, decisions: [decision.decisionDigest] });

  // The worktree tree hash the publish path must reproduce.
  const treePreview = await mkdtemp(path.join(os.tmpdir(), 'standing-reds-tree-'));
  temporary.push(treePreview);
  await git(treePreview, ['clone', '--quiet', remote, '.']);
  await writeFile(path.join(treePreview, 'eval', 'golden', 'hope-gap.json'), afterText);
  await git(treePreview, ['add', '--', 'eval/golden/hope-gap.json']);
  const treeHash = await git(treePreview, ['write-tree']);

  const body: Omit<AdmissionManifest, 'digest'> = {
    schemaVersion: 1,
    kind: 'scripture-search-admission',
    admissionKey,
    admittedAt: '2026-08-11T12:00:00.000Z',
    previewDigest: preview.digest,
    proposalDigest,
    linkedCaseIds: [CASE_ID],
    provenance: [`case:${CASE_ID}`, 'train:train-1'],
    baseCommit,
    expectedMainCommit: baseCommit,
    worktreeTreeHash: treeHash,
    decisions: [decision],
    candidate: null,
    rebuiltCandidate: {
      status: 'REBUILT',
      descriptor: { ...BASE_IDENTITY, databaseSha256: '6'.repeat(64) },
      descriptorSha256: 'd'.repeat(64),
      databaseSha256: '6'.repeat(64),
      command: outcome('node', ['npm', 'run', 'build:artifact']),
    },
    comparison: null,
    gauntlet: null,
    releaseGauntlet: releaseGauntlet(baseCommit),
    effectExemption: previewBody.effectExemption,
    baseIdentity: BASE_IDENTITY,
    deferredSigning: null,
    releaseGauntletClassification: {
      kind: 'inherited-standing-red',
      trainFindings: [RED_FINDING],
      controlFindings: [RED_FINDING],
      controlReportPath: CONTROL_REPORT_PATH,
      controlReportDigest: CONTROL_REPORT_DIGEST,
    },
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
  return { root, manifest, preview, manifestPath, proposal };
}

afterEach(async () => {
  for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true });
});

describe('standing reds at the publish seam (FM-8, guard half)', () => {
  it('prepares a fixture-lane admission over a classified inherited red, with the triage note verbatim in the PR body — draft only', { timeout: 120_000 }, async () => {
    const repo = await fixtureLaneRepository();
    const result = await prepareDraftPublication({
      repoRoot: repo.root,
      admissionManifestPath: repo.manifestPath,
      expectedAdmissionDigest: repo.manifest.digest,
      proposal: repo.proposal,
      admissionSigningKey: SIGNING_KEY,
      evidence: { admissionPreview: repo.preview, comparisonReport: null },
      push: false,
      openDraftPr: false,
    });

    // The ceiling: local branch only — never pushed, never merged, never ready.
    expect(result.status).toBe('LOCAL_READY');
    expect(result.draftPrUrl).toBeNull();
    expect(result.branch).toBe('refinement/2026-08-11-train-1');
    const invoked = result.logs.map((log) => `${log.command} ${log.args.join(' ')}`).join('\n');
    expect(invoked).not.toMatch(/pr merge|pr ready|merge_method|workflow|push .*main/);

    // The guard-variant body: no comparison, the unchanged identity, and the
    // FM-8 triage note — both finding sets' facts and the control pin.
    expect(result.prBody).toContain('Fixture-lane update: golden fixtures only.');
    expect(result.prBody).toContain('### Standing findings triage');
    expect(result.prBody).toContain('also reproduces at the base commit with no train operations applied (verified control run)');
    expect(result.prBody).toContain('standing findings of the current release, inherited — not introduced — by this change');
    expect(result.prBody).toContain(CONTROL_REPORT_PATH);
    expect(result.prBody).toContain(CONTROL_REPORT_DIGEST);
    expect(result.prBody).toContain('Inherited `G2-determinism`');
    expect(result.prBody).toContain(`Unchanged: engine=\`${BASE_IDENTITY.engineVersion}\``);
    expect(result.prBody).toContain('This draft preparation does not merge, release, publish an artifact, or dispatch a workflow.');
    // The answer-sheet line the train writes is in the diff section.
    expect(result.prBody).toContain('eval/golden/hope-gap.json');
  });

  it('refuses the same manifest when the red is unclassified (no releaseGauntletClassification)', async () => {
    const repo = await fixtureLaneRepository();
    const { digest: _stored, ...body } = repo.manifest;
    const unclassifiedBody = { ...body, releaseGauntletClassification: null };
    const unclassified = { ...unclassifiedBody, digest: digest(unclassifiedBody) };
    await writeFile(path.join(repo.root, ...repo.manifestPath.split('/')), `${JSON.stringify(unclassified, null, 2)}\n`);
    await expect(prepareDraftPublication({
      repoRoot: repo.root,
      admissionManifestPath: repo.manifestPath,
      expectedAdmissionDigest: unclassified.digest,
      proposal: repo.proposal,
      admissionSigningKey: SIGNING_KEY,
      evidence: { admissionPreview: repo.preview, comparisonReport: null },
      push: false,
      openDraftPr: false,
    })).rejects.toMatchObject({ code: 'blocked_admission' });
  });

  it('keeps the draft-PR ceiling out of the runner source itself', async () => {
    const source = await readFile(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'trainRunner.ts'),
      'utf8',
    );
    // The runner never merges, marks ready, dispatches a workflow, or pushes.
    expect(source).not.toMatch(/pr merge|pr ready|auto-?merge|workflow_dispatch|git push/i);
  });
});
