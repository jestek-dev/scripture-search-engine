/**
 * §5.5 gap 1 (Phase 3, D12b) — preview-time pairing between a regenerated
 * ordering snapshot and its re-issued independent approval, mirroring the
 * probes pair exactly: the two travel together or the admission preview
 * fails closed with a named code; the deferred-signing marker (gap 2) is the
 * ONE sanctioned escape, and a forged or wrong marker buys nothing (§06 FM-8
 * case f).
 *
 * Lives beside admissionProbeApproval.test.ts (same harness) so its trusted
 * gauntlet reports can carry freshly generated timestamps.
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
  orderingApprovalBindingIssues,
  previewAdmission,
  type AdmissionCandidateBinding,
  type AdmissionGauntletExpectation,
  type AdmissionPreviewInput,
  type DeferredSigningMarker,
} from '../src/admission.js';
import { compareEngines, type ComparisonReport, type EngineIdentity } from '../src/comparison.js';
import type { ComparisonCandidateBinding } from '../src/comparisonRunner.js';
import { parseProposalManifest, proposalManifestDigest } from '../src/proposals.js';

const execFileAsync = promisify(execFile);
const temporary: string[] = [];
const CASE_ID = '31111111-1111-4111-8111-111111111111';
const OPERATION_ID = '32222222-2222-4222-8222-222222222222';
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

// The ordering snapshot embeds the identity it measured (the same discipline
// as the probes baseline document); the AFTER document is the candidate's.
const SNAPSHOT_BEFORE = {
  ...REFERENCE,
  orderings: [{ query: 'hope', top: ['B', 'A'] }],
};
const SNAPSHOT_AFTER = {
  ...CANDIDATE,
  orderings: [{ query: 'hope', top: ['A', 'C'] }],
};
const ORDERING_APPROVAL_BEFORE = {
  schema: 'scripture-search-engine/ordering-snapshot-approval/v1',
  snapshotSha256: digest(SNAPSHOT_BEFORE),
  engine: { ...REFERENCE },
  reviewer: 'Prior Independent Reviewer', reviewedAt: '2026-08-10',
  rationale: 'The prior ordering snapshot was reviewed and approved.',
};
const ORDERING_APPROVAL_AFTER = {
  ...ORDERING_APPROVAL_BEFORE,
  snapshotSha256: digest(SNAPSHOT_AFTER),
  engine: { ...CANDIDATE },
  reviewer: 'Designated Independent Reviewer', reviewedAt: '2026-08-12',
  rationale: 'The regenerated ordering keeps the anchored answer first.',
};

function text(value: unknown): string {
  return `${JSON.stringify(JSON.parse(canonical(value)) as unknown, null, 2)}\n`;
}

async function repository(): Promise<{ root: string; commit: string; sourceText: string }> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'admission-ordering-repo-'));
  temporary.push(root);
  await git(root, ['init', '-b', 'main']);
  await git(root, ['config', 'core.autocrlf', 'false']);
  const sourceText = 'id: hope\nlabel: Hope\nlexicon:\n  - hope\n';
  await mkdir(path.join(root, 'ontology', 'concepts'), { recursive: true });
  await mkdir(path.join(root, 'eval', 'baselines'), { recursive: true });
  await writeFile(path.join(root, 'ontology', 'concepts', 'hope.yaml'), sourceText);
  await writeFile(path.join(root, 'eval', 'baselines', 'ordering.snapshot.json'), text(SNAPSHOT_BEFORE));
  await writeFile(path.join(root, 'eval', 'baselines', 'ordering.snapshot.approval.json'), text(ORDERING_APPROVAL_BEFORE));
  await git(root, ['add', '--all']);
  await git(root, ['-c', 'user.name=Ordering Test', '-c', 'user.email=ordering@example.test', 'commit', '-m', 'base']);
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
      report: buildReport({ gates: GAUNTLET_GATE_ROSTER.map((gate) => pass(gate.id, gate.title, 'Trusted ordering-test gate passed.', undefined, { explicitTarget: true })) }),
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

const ORDERING_SNAPSHOT_INPUT = {
  path: 'eval/baselines/ordering.snapshot.json' as const,
  beforeSha256: sha256(text(SNAPSHOT_BEFORE)),
  after: SNAPSHOT_AFTER,
};

const ORDERING_APPROVAL_INPUT = {
  path: 'eval/baselines/ordering.snapshot.approval.json' as const,
  beforeSha256: sha256(text(ORDERING_APPROVAL_BEFORE)),
  after: ORDERING_APPROVAL_AFTER,
};

const MARKER: DeferredSigningMarker = {
  kind: 'deferred-signing',
  preRegenIdentity: REFERENCE,
  expectedPostMergeIdentity: CANDIDATE,
  independentReviewer: 'Designated Independent Reviewer',
  citation: 'merge-first-sign-once (V8, the J39 ruling): the approvals are signed after the merge.',
};

afterEach(async () => {
  for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true });
});

describe('D12b ordering-snapshot pairing at preview time (§5.5 gap 1)', () => {
  it('previews a paired snapshot and approval as separate owned diff kinds, excluded from the source subject', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    const preview = await previewAdmission({
      ...input, orderingSnapshot: ORDERING_SNAPSHOT_INPUT, orderingSnapshotApproval: ORDERING_APPROVAL_INPUT,
    });
    const kinds = preview.diffs.map((entry) => [entry.path, entry.kind]);
    expect(kinds).toContainEqual(['eval/baselines/ordering.snapshot.json', 'ordering-snapshot']);
    expect(kinds).toContainEqual(['eval/baselines/ordering.snapshot.approval.json', 'ordering-snapshot-approval']);
    // The ordering pair rides the existing probe-baseline decision slot
    // discipline: no NEW closed decision kind is minted; the source subject
    // excludes both ordering kinds like it excludes the probes pair.
    expect(preview.sourceDecisionSubject).toBe(digest({
      proposalDigest: preview.proposalDigest,
      diffs: preview.diffs.filter((entry) => entry.kind === 'yaml').map((entry) => entry.digest),
    }));
    // The probe decision subject is EXTENDED (backward-stable): with no
    // probe-baseline diff but a moved ordering snapshot, the subject digests
    // the movements plus the ordering diff digest.
    const orderingDiff = preview.diffs.find((entry) => entry.kind === 'ordering-snapshot')!;
    expect(preview.probeDecisionSubject).toBe(digest({
      movements: preview.probeMovements,
      diff: null,
      orderingDiff: orderingDiff.digest,
    }));
  });

  it('fails closed with ordering_approval_missing when a moved snapshot travels alone', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    await expect(previewAdmission({ ...input, orderingSnapshot: ORDERING_SNAPSHOT_INPUT }))
      .rejects.toMatchObject({ code: 'ordering_approval_missing' });
  });

  it('fails closed with ordering_approval_orphaned when an approval moves without the snapshot', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    await expect(previewAdmission({ ...input, orderingSnapshotApproval: ORDERING_APPROVAL_INPUT }))
      .rejects.toMatchObject({ code: 'ordering_approval_orphaned' });
  });

  it('fails closed with ordering_approval_mismatch on digest or identity binding drift', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    await expect(previewAdmission({
      ...input, orderingSnapshot: ORDERING_SNAPSHOT_INPUT,
      orderingSnapshotApproval: { ...ORDERING_APPROVAL_INPUT, after: { ...ORDERING_APPROVAL_AFTER, snapshotSha256: digest(SNAPSHOT_BEFORE) } },
    })).rejects.toMatchObject({ code: 'ordering_approval_mismatch' });
    await expect(previewAdmission({
      ...input, orderingSnapshot: ORDERING_SNAPSHOT_INPUT,
      orderingSnapshotApproval: {
        ...ORDERING_APPROVAL_INPUT,
        after: { ...ORDERING_APPROVAL_AFTER, engine: { ...CANDIDATE, layerFingerprint: '0'.repeat(64) } },
      },
    })).rejects.toMatchObject({ code: 'ordering_approval_mismatch' });
  });

  it('the deferred-signing marker escapes the missing-approval refusal only for the matching identity (FM-8 case f)', async () => {
    const repo = await repository();
    const input = await previewInput(repo.root, repo.commit, repo.sourceText);
    // The matching marker: the snapshot travels without a fresh approval.
    const preview = await previewAdmission({
      ...input, orderingSnapshot: ORDERING_SNAPSHOT_INPUT, deferredSigningMarker: MARKER,
    });
    expect(preview.deferredSigningMarker).not.toBeNull();
    expect(preview.diffs.some((entry) => entry.kind === 'ordering-snapshot')).toBe(true);
    // A forged marker (wrong expected identity) buys nothing.
    await expect(previewAdmission({
      ...input, orderingSnapshot: ORDERING_SNAPSHOT_INPUT,
      deferredSigningMarker: {
        ...MARKER,
        expectedPostMergeIdentity: { ...CANDIDATE, layerFingerprint: '9'.repeat(64) },
      },
    })).rejects.toMatchObject({ code: 'ordering_approval_missing' });
  });

  it('binding consults only fields shared by every approval schema version', () => {
    const snapshotText = text(SNAPSHOT_AFTER);
    expect(orderingApprovalBindingIssues(snapshotText, text(ORDERING_APPROVAL_AFTER))).toEqual([]);
    expect(orderingApprovalBindingIssues(snapshotText, text({ ...ORDERING_APPROVAL_AFTER, snapshotSha256: '0'.repeat(64) })))
      .toEqual(['Approval snapshotSha256 does not bind the admitted snapshot document.']);
    expect(orderingApprovalBindingIssues(snapshotText, text({
      ...ORDERING_APPROVAL_AFTER, engine: { ...CANDIDATE, corpusFingerprint: '0'.repeat(64) },
    }))).toEqual(['Approval engine identity does not match the admitted snapshot identity.']);
  });
});
