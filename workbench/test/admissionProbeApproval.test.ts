/**
 * Preview-time pairing between a moved probe baseline and its re-issued
 * independent approval (docs/governance/probe-baseline-review.md): the two
 * travel together or the admission preview fails closed with a named code.
 *
 * Lives beside admission.test.ts rather than inside it so its trusted
 * gauntlet reports can carry freshly generated timestamps: these tests must
 * not depend on the wall clock agreeing with a fixture date.
 */

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import type { ResearchResult, ScriptureEngine } from '@jestek-dev/scripture-engine';
import { afterEach, describe, expect, it } from 'vitest';

import { GAUNTLET_GATE_ROSTER, buildMachineReport } from '../../eval/src/gauntletMachineReport.js';
import { pass } from '../../eval/src/gates/types.js';
import { buildReport } from '../../eval/src/report.js';

import {
  previewAdmission,
  probeApprovalBindingIssues,
  type AdmissionCandidateBinding,
  type AdmissionGauntletExpectation,
  type AdmissionPreviewInput,
} from '../src/admission.js';
import { compareEngines, type ComparisonReport, type EngineIdentity } from '../src/comparison.js';
import type { ComparisonCandidateBinding } from '../src/comparisonRunner.js';
import { parseProposalManifest, proposalManifestDigest } from '../src/proposals.js';

const execFileAsync = promisify(execFile);
const temporary: string[] = [];
const CASE_ID = '11111111-1111-4111-8111-111111111111';
const OPERATION_ID = '22222222-2222-4222-8222-222222222222';
const REFERENCE: EngineIdentity = { engineVersion: 'test-engine', corpusFingerprint: 'a'.repeat(64), layerFingerprint: 'b'.repeat(64) };
const CANDIDATE: EngineIdentity = { ...REFERENCE, layerFingerprint: 'c'.repeat(64) };

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function canonical(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`).join(',')}}`;
}

function digest(value: unknown): string {
  return sha256(canonical(value));
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

async function report(): Promise<ComparisonReport> {
  const expected = { targetId: 'A', withinTop: 3 as const };
  return compareEngines({
    linkedCases: [{ sourceId: CASE_ID, query: 'hope', expected, expectedChange: true }],
    fixtureQueries: [], g8Probes: [], calibrationQueries: [], holdoutQueries: [], affectedConceptCases: [],
  }, engine(REFERENCE, ['A', 'B']), engine(CANDIDATE, ['A', 'C']));
}

async function git(cwd: string, args: readonly string[]): Promise<string> {
  const result = await execFileAsync('git', [...args], { cwd, windowsHide: true });
  return result.stdout.trim();
}

const BASELINE_BEFORE = {
  corpusFingerprint: '1'.repeat(64), engineVersion: 'baseline-engine', layerFingerprint: '2'.repeat(64),
  observations: [{ id: 'hope-probe', top: ['B'], resultCount: 2, weakReasonShare: 0, meanTopScore: 8 }],
};
const BASELINE_AFTER = {
  ...BASELINE_BEFORE,
  observations: [{ id: 'hope-probe', top: ['A'], resultCount: 2, weakReasonShare: 0, meanTopScore: 9 }],
};
const APPROVAL_BEFORE = {
  schema: 'scripture-search-engine/probe-baseline-approval/v1',
  baselineSha256: digest(BASELINE_BEFORE), probesSha256: '9'.repeat(64),
  engine: {
    engineVersion: BASELINE_BEFORE.engineVersion,
    corpusFingerprint: BASELINE_BEFORE.corpusFingerprint,
    layerFingerprint: BASELINE_BEFORE.layerFingerprint,
  },
  reviewer: 'Prior Independent Reviewer', reviewedAt: '2026-08-10',
  rationale: 'The prior baseline was reviewed and approved.',
};
const APPROVAL_AFTER = {
  ...APPROVAL_BEFORE,
  baselineSha256: digest(BASELINE_AFTER),
  reviewer: 'Designated Independent Reviewer', reviewedAt: '2026-08-12',
  rationale: 'The moved probe list keeps the anchor and sheds a stale target.',
};

function text(value: unknown): string {
  return `${JSON.stringify(JSON.parse(canonical(value)) as unknown, null, 2)}\n`;
}

async function repository(): Promise<{ root: string; commit: string; sourceText: string }> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'admission-approval-repo-'));
  temporary.push(root);
  await git(root, ['init', '-b', 'main']);
  await git(root, ['config', 'core.autocrlf', 'false']);
  const sourceText = 'id: hope\nlabel: Hope\nlexicon:\n  - hope\n';
  await mkdir(path.join(root, 'ontology', 'concepts'), { recursive: true });
  await mkdir(path.join(root, 'eval', 'baselines'), { recursive: true });
  await writeFile(path.join(root, 'ontology', 'concepts', 'hope.yaml'), sourceText);
  await writeFile(path.join(root, 'eval', 'baselines', 'probes.json'), text(BASELINE_BEFORE));
  await writeFile(path.join(root, 'eval', 'baselines', 'probes.approval.json'), text(APPROVAL_BEFORE));
  await git(root, ['add', '--all']);
  await git(root, ['-c', 'user.name=Approval Test', '-c', 'user.email=approval@example.test', 'commit', '-m', 'base']);
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

async function candidateBinding(root: string, proposalDigest: string): Promise<AdmissionCandidateBinding> {
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

/**
 * Trusted machine reports here carry timestamps generated at test runtime, so
 * the freshness window is honored on any day the suite runs.
 */
function trustedGauntletLoader() {
  return async (_repoRoot: string, reportPath: string, expectation: AdmissionGauntletExpectation): Promise<Uint8Array> => {
    const finished = Date.now() - 1_000;
    const machineReport = buildMachineReport({
      startedAt: new Date(finished - 1_000).toISOString(), finishedAt: new Date(finished).toISOString(),
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
      report: buildReport({ gates: GAUNTLET_GATE_ROSTER.map((gate) => pass(gate.id, gate.title, 'Trusted approval-test gate passed.')) }),
    });
    return Buffer.from(`${JSON.stringify(machineReport, null, 2)}\n`);
  };
}

async function previewInput(root: string, commit: string, sourceText: string): Promise<AdmissionPreviewInput> {
  const comparison = await report();
  const parsedProposal = proposal(sourceText);
  const proposalDigest = proposalManifestDigest(parseProposalManifest(parsedProposal));
  const candidate = await candidateBinding(root, proposalDigest);
  const binding: ComparisonCandidateBinding = {
    cacheKey: candidate.cacheKey, proposalDigest: candidate.proposalDigest, databaseSha256: candidate.databaseSha256,
    descriptorSha256: candidate.descriptorSha256, referenceIdentity: REFERENCE, candidateIdentity: CANDIDATE,
    comparisonDigest: comparison.digest,
  };
  return {
    repoRoot: root, admittedBaseCommit: commit, expectedMainCommit: commit, proposal: parsedProposal,
    candidate, comparison, comparisonBinding: binding,
    gauntlet: { reportPath: 'eval/.runs/admission-report.json' },
    trustedGauntletLoader: trustedGauntletLoader(),
    reviewedComparisonQueries: comparison.queries.filter((query) => query.top10Changed).map((query) => query.query),
  };
}

const PROBE_BASELINE_INPUT = {
  path: 'eval/baselines/probes.json' as const,
  beforeSha256: sha256(text(BASELINE_BEFORE)),
  after: BASELINE_AFTER,
};

const PROBE_APPROVAL_INPUT = {
  path: 'eval/baselines/probes.approval.json' as const,
  beforeSha256: sha256(text(APPROVAL_BEFORE)),
  after: APPROVAL_AFTER,
};

afterEach(async () => {
  for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true });
});

describe('M10 probe approval pairing at preview time', () => {
  it('previews a paired baseline and approval as separate owned diff kinds', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    const preview = await previewAdmission({ ...input, probeBaseline: PROBE_BASELINE_INPUT, probeApproval: PROBE_APPROVAL_INPUT });
    const kinds = preview.diffs.map((entry) => [entry.path, entry.kind]);
    expect(kinds).toContainEqual(['eval/baselines/probes.json', 'probe-baseline']);
    expect(kinds).toContainEqual(['eval/baselines/probes.approval.json', 'probe-approval']);
    expect(preview.probeMovements.map((entry) => entry.probeId)).toEqual(['hope-probe']);
    // The approval carries no decision slot of its own: it is the reviewer's
    // own signed document, validated by binding, and the source subject
    // excludes both probe kinds.
    expect(preview.decisionSlots.map((slot) => slot.kind)).toEqual(['source-proposal', 'probe-baseline']);
    expect(preview.sourceDecisionSubject).toBe(digest({
      proposalDigest: preview.proposalDigest,
      diffs: preview.diffs.filter((entry) => entry.kind === 'yaml').map((entry) => entry.digest),
    }));
  });

  it('fails closed with probe_approval_missing when a moved baseline travels alone', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    await expect(previewAdmission({ ...input, probeBaseline: PROBE_BASELINE_INPUT }))
      .rejects.toMatchObject({ code: 'probe_approval_missing' });
  });

  it('fails closed with probe_approval_orphaned when an approval moves without the baseline', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    await expect(previewAdmission({ ...input, probeApproval: PROBE_APPROVAL_INPUT }))
      .rejects.toMatchObject({ code: 'probe_approval_orphaned' });
  });

  it('fails closed on a no-op approval diff, which publish would reject anyway', async () => {
    // Mirrors publishPreparation: a preview that cannot publish must not be
    // approvable, so the unchanged-approval rejection happens at preview time.
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    const unchanged = { ...PROBE_APPROVAL_INPUT, after: APPROVAL_BEFORE };
    await expect(previewAdmission({ ...input, probeBaseline: PROBE_BASELINE_INPUT, probeApproval: unchanged }))
      .rejects.toMatchObject({ code: 'probe_approval_orphaned' });
    await expect(previewAdmission({ ...input, probeApproval: unchanged }))
      .rejects.toMatchObject({ code: 'probe_approval_orphaned' });
  });

  it('fails closed with probe_approval_mismatch on digest or identity binding drift', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    await expect(previewAdmission({
      ...input, probeBaseline: PROBE_BASELINE_INPUT,
      probeApproval: { ...PROBE_APPROVAL_INPUT, after: { ...APPROVAL_AFTER, baselineSha256: digest(BASELINE_BEFORE) } },
    })).rejects.toMatchObject({ code: 'probe_approval_mismatch' });
    await expect(previewAdmission({
      ...input, probeBaseline: PROBE_BASELINE_INPUT,
      probeApproval: {
        ...PROBE_APPROVAL_INPUT,
        after: { ...APPROVAL_AFTER, engine: { ...APPROVAL_AFTER.engine, layerFingerprint: '0'.repeat(64) } },
      },
    })).rejects.toMatchObject({ code: 'probe_approval_mismatch' });
  });

  it('rejects approval drift on disk after review', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    await writeFile(path.join(repo.root, 'eval', 'baselines', 'probes.approval.json'), `${text(APPROVAL_BEFORE)}\n`);
    await expect(previewAdmission({ ...input, probeBaseline: PROBE_BASELINE_INPUT, probeApproval: PROBE_APPROVAL_INPUT }))
      .rejects.toMatchObject({ code: 'source_drift' });
  });

  it('is schema-version-agnostic: binding consults only fields shared by every approval schema', () => {
    const baselineText = text(BASELINE_AFTER);
    const v2Shaped = {
      schema: 'scripture-search-engine/probe-baseline-approval/v2',
      baselineSha256: digest(BASELINE_AFTER), probesSha256: '9'.repeat(64),
      engine: APPROVAL_AFTER.engine,
      reviewerName: 'Designated Independent Reviewer', reviewerContact: 'reviewer@example.test',
      independence: 'I did not author the change under review.',
      evidence: { path: 'docs/reviews/2026-08-12-probe-baseline-review.md', sha256: '8'.repeat(64) },
    };
    expect(probeApprovalBindingIssues(baselineText, text(APPROVAL_AFTER))).toEqual([]);
    expect(probeApprovalBindingIssues(baselineText, text(v2Shaped))).toEqual([]);
    expect(probeApprovalBindingIssues(baselineText, text({ ...v2Shaped, baselineSha256: '0'.repeat(64) })))
      .toEqual(['Approval baselineSha256 does not bind the admitted baseline document.']);
  });
});
