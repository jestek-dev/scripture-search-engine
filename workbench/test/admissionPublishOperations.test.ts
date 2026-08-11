import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { parseProposalManifest, proposalManifestDigest } from '../src/proposals.js';

import {
  AdmissionPublishOperations,
  AdmissionPublishOperationsError,
} from '../src/admissionPublishOperations.js';

const temporary: string[] = [];
const CASE_ID = '11111111-1111-4111-8111-111111111111';

async function repository(): Promise<{ readonly root: string; readonly evidence: string }> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'admission-publish-operations-'));
  temporary.push(root);
  const evidence = path.join(root, 'workbench', 'review-data', 'admission-evidence.json');
  await mkdir(path.dirname(evidence), { recursive: true });
  return { root, evidence };
}

function entry() {
  return {
    reviewId: 'review-admission-one',
    admittedBaseCommit: '1'.repeat(40),
    expectedMainCommit: '1'.repeat(40),
    proposal: {
      schemaVersion: 1,
      proposalId: 'hope-gap',
      fixtureId: 'hope-gap',
      caseIds: [CASE_ID],
      sourcePreconditions: [{ path: 'ontology/concepts/hope.yaml', sha256: 'a'.repeat(64) }],
      operations: [{
        operationId: '22222222-2222-4222-8222-222222222222',
        type: 'lexicon-phrase-add', sourcePaths: ['ontology/concepts/hope.yaml'], conceptId: 'hope', phrase: 'hope in God',
        provenance: { source: 'editorial', confirmed: true, reviewer: 'Reviewer', evidence: 'A concrete reviewed case shows this exact lexical gap.' },
        reason: 'Add the narrowly reviewed phrase to the existing concept.',
      }],
    },
    candidate: { cacheKey: 'candidate-cache', descriptorSha256: '2'.repeat(64), databaseSha256: '3'.repeat(64), engineVersion: 'engine', corpusFingerprint: '4'.repeat(64), layerFingerprint: '5'.repeat(64) }, comparison: {}, comparisonBinding: {}, gauntlet: { reportPath: 'eval/.runs/admission-report.json' },
    reviewedComparisonQueries: ['hope'], provenance: ['review:local'],
  };
}

function previewFor(value: ReturnType<typeof entry>) {
  return {
    schemaVersion: 1, digest: '9'.repeat(64), proposalDigest: proposalManifestDigest(parseProposalManifest(value.proposal)),
    expectedMainCommit: value.expectedMainCommit, measurableEffect: true, diffs: [], reviewedComparisonQueries: value.reviewedComparisonQueries,
    candidate: value.candidate,
    decisionSlots: [
      { kind: 'source-proposal', slotId: 'source', subjectDigest: '6'.repeat(64) },
      { kind: 'fixture-promotion', slotId: 'fixture', subjectDigest: '7'.repeat(64) },
      { kind: 'probe-baseline', slotId: 'baseline', subjectDigest: '8'.repeat(64) },
    ],
    probeMovements: [{ probeId: 'probe-one', beforeSha256: null, afterSha256: 'a'.repeat(64) }],
    gauntlet: { verdict: 'ADMIT', blocking: false, gates: [] },
  } as any;
}

function decisions(preview: ReturnType<typeof previewFor>) {
  return {
    previewDigest: preview.digest,
    decisions: [
      { slotId: 'source', rationale: 'Source change independently approved.' },
      { slotId: 'fixture', rationale: 'Fixture movement independently approved.' },
      { slotId: 'baseline', rationale: 'Baseline movement independently approved.', probeRationales: [{ probeId: 'probe-one', rationale: 'Probe movement is intentional and verified.' }] },
    ],
  };
}

afterEach(async () => {
  for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true });
});

describe('AdmissionPublishOperations', () => {
  it('discovers only server-configured candidate ids and fails closed when trusted evidence cannot be previewed', async () => {
    const repo = await repository();
    await writeFile(repo.evidence, `${JSON.stringify({ schemaVersion: 1, admissions: [entry()] }, null, 2)}\n`);
    const operations = new AdmissionPublishOperations({ repoRoot: repo.root, evidencePath: repo.evidence, reviewer: 'local-reviewer' });

    await expect(operations.list(false)).resolves.toEqual([{
      reviewId: 'review-admission-one', proposalId: 'hope-gap', state: 'READY', blockers: [],
    }]);
    await expect(operations.admission('review-admission-one', false)).resolves.toMatchObject({
      reviewId: 'review-admission-one', proposalId: 'hope-gap', state: 'BLOCKED', preview: null,
    });
    await expect(operations.admission('../escape', false)).rejects.toMatchObject({ code: 'invalid_route' });
  });

  it('rejects an evidence registry outside the configured repository', async () => {
    const repo = await repository();
    const operations = new AdmissionPublishOperations({ repoRoot: repo.root, evidencePath: path.join(os.tmpdir(), 'outside-admission-evidence.json'), reviewer: 'local-reviewer' });
    await expect(operations.list(false)).rejects.toBeInstanceOf(AdmissionPublishOperationsError);
  });

  it('rejects an evidence registry reached through a parent directory link', async () => {
    const repo = await repository();
    const outside = await mkdtemp(path.join(os.tmpdir(), 'admission-evidence-outside-'));
    temporary.push(outside);
    await writeFile(path.join(outside, 'evidence.json'), JSON.stringify({ schemaVersion: 1, admissions: [] }));
    const linkedParent = path.join(repo.root, 'workbench', 'linked-evidence');
    await mkdir(path.dirname(linkedParent), { recursive: true });
    await symlink(outside, linkedParent, process.platform === 'win32' ? 'junction' : 'dir');
    const operations = new AdmissionPublishOperations({ repoRoot: repo.root, evidencePath: path.join(linkedParent, 'evidence.json'), reviewer: 'local-reviewer' });
    await expect(operations.list(false)).rejects.toMatchObject({ code: 'unsafe_evidence' });
  });

  it('invokes final admission verification and prepares only an isolated branch', async () => {
    const repo = await repository();
    const evidence = entry();
    const preview = previewFor(evidence);
    await writeFile(repo.evidence, `${JSON.stringify({ schemaVersion: 1, admissions: [evidence] })}\n`);
    let verified = false;
    let prepared: any = null;
    const operations = new AdmissionPublishOperations({
      repoRoot: repo.root, evidencePath: repo.evidence, reviewer: 'local-reviewer', signingKey: 's'.repeat(32), now: () => new Date('2026-08-11T12:00:00.000Z'),
      operations: {
        previewAdmission: async () => preview,
        runAdmission: async () => {
          verified = true;
          const manifest = { schemaVersion: 1, kind: 'scripture-search-admission', digest: 'b'.repeat(64), previewDigest: preview.digest, proposalDigest: preview.proposalDigest, admissionKey: 'c'.repeat(64), admittedAt: '2026-08-11T12:00:00.000Z', expectedMainCommit: evidence.expectedMainCommit, baseCommit: evidence.expectedMainCommit, candidate: preview.candidate };
          const directory = path.join(repo.root, 'workbench', 'admissions'); await mkdir(directory, { recursive: true }); await writeFile(path.join(directory, `${manifest.admissionKey}.json`), JSON.stringify(manifest));
          return manifest as any;
        },
        currentMain: async () => evidence.expectedMainCommit,
        prepareDraftPublication: async (input) => { prepared = input; return { status: 'PREPARED', branch: 'refinement/2026-08-11-hope-gap', commit: 'd'.repeat(40), treeHash: 'e'.repeat(40), draftPrUrl: null } as any; },
      },
    });
    await expect(operations.admit(evidence.reviewId, decisions(preview))).resolves.toMatchObject({ state: 'ADMITTED' });
    expect(verified).toBe(true);
    await expect(operations.publish(evidence.reviewId)).resolves.toMatchObject({ preflight: { ready: true, branch: 'refinement/2026-08-11-hope-gap' } });
    await expect(operations.prepare(evidence.reviewId, { admissionDigest: 'b'.repeat(64), push: true, openDraftPr: true })).resolves.toMatchObject({ status: 'PREPARED', branch: 'refinement/2026-08-11-hope-gap' });
    expect(prepared).toMatchObject({ push: true, openDraftPr: true, admissionManifestPath: `workbench/admissions/${'c'.repeat(64)}.json` });
  });

  it('refuses publish preparation when main moved after admission', async () => {
    const repo = await repository(); const evidence = entry(); const preview = previewFor(evidence);
    await writeFile(repo.evidence, `${JSON.stringify({ schemaVersion: 1, admissions: [evidence] })}\n`);
    const directory = path.join(repo.root, 'workbench', 'admissions'); await mkdir(directory, { recursive: true });
    const manifest = { schemaVersion: 1, kind: 'scripture-search-admission', digest: 'b'.repeat(64), previewDigest: preview.digest, proposalDigest: preview.proposalDigest, admissionKey: 'c'.repeat(64), admittedAt: '2026-08-11T12:00:00.000Z', expectedMainCommit: evidence.expectedMainCommit, baseCommit: evidence.expectedMainCommit, candidate: preview.candidate };
    await writeFile(path.join(directory, `${manifest.admissionKey}.json`), JSON.stringify(manifest));
    let called = false;
    const operations = new AdmissionPublishOperations({ repoRoot: repo.root, evidencePath: repo.evidence, reviewer: 'local-reviewer', signingKey: 's'.repeat(32), operations: { previewAdmission: async () => preview, currentMain: async () => 'f'.repeat(40), prepareDraftPublication: async () => { called = true; return {} as any; } } });
    await expect(operations.publish(evidence.reviewId)).resolves.toMatchObject({ preflight: { ready: false, blockers: [expect.stringContaining('main moved')] } });
    await expect(operations.prepare(evidence.reviewId, { admissionDigest: manifest.digest, push: false, openDraftPr: false })).rejects.toMatchObject({ code: 'main_moved', status: 409 });
    expect(called).toBe(false);
  });
});
