/**
 * "Sign the baselines" (J39) — the signing flow's covenants, proven:
 *
 *  - every digest matches eval's own functions (imported here and compared),
 *  - the ordering approval is exact-keys v2 WITHOUT reviewPacketSha256 while
 *    the probe approval carries it,
 *  - priorProvenance is derived from git history via the committed approval's
 *    own digest binding — never a hardcoded commit,
 *  - reviewer prose is never prefilled, defaulted, or augmented,
 *  - review records with absolute local paths are refused BEFORE writing
 *    (the committed docs-governance guard would fail them after), and
 *  - writes are confined to the two approval paths plus docs/reviews/.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { canonicalJsonSha256, validateProbeBaselineApproval } from '../../eval/src/gates/probes.js';
import { probeListsSha256, validateOrderingSnapshotApproval } from '../../eval/src/gates/orderingSnapshot.js';
import { reviewPacketSha256 } from '../../eval/src/baselineReviewPacket.js';
import {
  ORDERING_APPROVAL_PATH,
  ORDERING_SNAPSHOT_PATH,
  PROBES_APPROVAL_PATH,
  PROBES_BASELINE_PATH,
  SigningOperations,
  SigningOperationsError,
  absoluteLocalPathFindings,
  guardedRepositoryWriteTarget,
  parseSigningForm,
  type SigningForm,
  type SigningIdentity,
} from '../src/signingOperations.js';

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

const IDENTITY_A: SigningIdentity = {
  engineVersion: '0.1.0',
  corpusFingerprint: 'a'.repeat(64),
  layerFingerprint: 'b'.repeat(64),
};
const IDENTITY_B: SigningIdentity = {
  engineVersion: '0.2.0',
  corpusFingerprint: 'c'.repeat(64),
  layerFingerprint: 'd'.repeat(64),
};

function baselineFor(identity: SigningIdentity, top: readonly string[]) {
  return {
    corpusFingerprint: identity.corpusFingerprint,
    layerFingerprint: identity.layerFingerprint,
    engineVersion: identity.engineVersion,
    observations: [
      { id: 'probe-one', top: [...top], resultCount: top.length, weakReasonShare: 0.1, meanTopScore: 4.5 },
    ],
  };
}

function snapshotFor(identity: SigningIdentity, targetId: string) {
  return {
    engineVersion: identity.engineVersion,
    corpusFingerprint: identity.corpusFingerprint,
    layerFingerprint: identity.layerFingerprint,
    probes: [{ id: 'probe-one', results: [{ targetId, score: 4.5 }] }],
  };
}

function git(root: string, args: readonly string[]): string {
  return execFileSync('git', [...args], { cwd: root }).toString().trim();
}

function writeRepoFile(root: string, relativePath: string, value: unknown): void {
  const target = path.join(root, ...relativePath.split('/'));
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

/**
 * A tiny two-generation repository: generation A committed with approvals
 * binding it, then generation B baselines committed WITHOUT new approvals —
 * exactly the state the signing flow exists to close.
 */
function scaffoldSigningRepo(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), 'sse-signing-test-'));
  temporaryDirectories.push(root);
  git(root, ['init', '--quiet']);
  git(root, ['config', 'user.email', 'signing-test@example.invalid']);
  git(root, ['config', 'user.name', 'Signing Test']);

  const priorBaseline = baselineFor(IDENTITY_A, ['X:1']);
  const priorSnapshot = snapshotFor(IDENTITY_A, 'X:1');
  const probeFile = { probes: [{ id: 'probe-one', query: 'a test query', kind: 'broad' }] };
  writeRepoFile(root, PROBES_BASELINE_PATH, priorBaseline);
  writeRepoFile(root, ORDERING_SNAPSHOT_PATH, priorSnapshot);
  writeRepoFile(root, 'eval/probes/probes.json', probeFile);
  writeRepoFile(root, 'eval/budgets.json', {
    noise: { maxTop10ChurnRatio: 0.4, maxWeakReasonShareIncrease: 0.15 },
  });
  writeRepoFile(root, PROBES_APPROVAL_PATH, {
    schema: 'scripture-search-engine/probe-baseline-approval/v1',
    baselineSha256: canonicalJsonSha256(priorBaseline),
    probesSha256: canonicalJsonSha256(probeFile),
    engine: IDENTITY_A,
    reviewer: 'prior reviewer',
    reviewedAt: '2026-08-01',
    rationale: 'prior approval',
    priorProvenance: null,
  });
  writeRepoFile(root, ORDERING_APPROVAL_PATH, {
    schema: 'scripture-search-engine/ordering-snapshot-approval/v1',
    snapshotSha256: canonicalJsonSha256(priorSnapshot),
    probeListsSha256: probeListsSha256(priorSnapshot.probes as never),
    engine: IDENTITY_A,
    reviewer: 'prior reviewer',
    reviewedAt: '2026-08-01',
    rationale: 'prior approval',
    priorProvenance: null,
  });
  git(root, ['add', '-A']);
  git(root, ['commit', '--quiet', '-m', 'generation A: baselines and approvals']);

  writeRepoFile(root, PROBES_BASELINE_PATH, baselineFor(IDENTITY_B, ['X:2', 'X:1']));
  writeRepoFile(root, ORDERING_SNAPSHOT_PATH, snapshotFor(IDENTITY_B, 'X:2'));
  git(root, ['add', '-A']);
  git(root, ['commit', '--quiet', '-m', 'generation B: regenerated baselines, approvals not yet signed']);
  return root;
}

function operationsFor(root: string, identity: SigningIdentity = IDENTITY_B): SigningOperations {
  return new SigningOperations({ repoRoot: root, deriveIdentity: async () => identity });
}

const FORM: SigningForm = {
  reviewerName: 'A Real Reviewer',
  reviewerContact: 'reviewer@example.invalid',
  independence: 'I did not author the generation-B change: not the data, not the code, not the proposal.',
  rationaleProbes: 'The probe movement adds one anchor at rank 1 and keeps the prior anchor; acceptable.',
  rationaleOrdering: 'The full-page reordering follows from the same reviewed movement; acceptable.',
  reviewNotes: '# J39 signing test record\n\nReviewed eval/.runs/signing-review-packet.md against eval/baselines/probes.json.',
  reviewedAt: '2026-08-27',
};

async function expectSigningError(promise: Promise<unknown>, code: string): Promise<SigningOperationsError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(SigningOperationsError);
    expect((error as SigningOperationsError).code).toBe(code);
    return error as SigningOperationsError;
  }
  throw new Error(`Expected SigningOperationsError ${code}, but the operation succeeded.`);
}

describe('signing status', () => {
  it('reports stale approvals with a plain verdict line naming both versions', async () => {
    const status = await operationsFor(scaffoldSigningRepo()).status();
    expect(status.verdict).toBe('stale');
    expect(status.verdictLine).toContain('bind engine 0.1.0');
    expect(status.verdictLine).toContain('signing will bind 0.2.0');
    expect(status.git?.dirty).toBe(false);
    expect(status.git?.head).toBeTruthy();
  });

  it('reports current approvals and refuses the packet when there is nothing to sign', async () => {
    const root = scaffoldSigningRepo();
    // Reset to generation A, where the approvals bind the committed baselines.
    git(root, ['checkout', '--quiet', 'HEAD~1', '--', PROBES_BASELINE_PATH, ORDERING_SNAPSHOT_PATH]);
    const operations = operationsFor(root, IDENTITY_A);
    const status = await operations.status();
    expect(status.verdict).toBe('current');
    await expectSigningError(operations.reviewPacket(), 'approvals_current');
  });

  it('refuses to sign when the committed baselines lag the derived identity', async () => {
    const operations = operationsFor(scaffoldSigningRepo(), {
      engineVersion: '0.3.0',
      corpusFingerprint: 'e'.repeat(64),
      layerFingerprint: 'f'.repeat(64),
    });
    const status = await operations.status();
    expect(status.verdict).toBe('baselines-behind');
    expect(status.verdictLine).toContain('regenerate them first');
    await expectSigningError(operations.preview(FORM), 'not_signable');
  });
});

describe('review packet and prior derivation', () => {
  it('derives the prior blobs from git via the committed approvals, and the packet digest matches eval', async () => {
    const root = scaffoldSigningRepo();
    const packet = await operationsFor(root).reviewPacket();
    expect(packet.prior.probes.blobSha1).toBe(git(root, ['rev-parse', `HEAD~1:${PROBES_BASELINE_PATH}`]));
    expect(packet.prior.ordering.blobSha1).toBe(git(root, ['rev-parse', `HEAD~1:${ORDERING_SNAPSHOT_PATH}`]));
    expect(packet.packetSha256).toBe(reviewPacketSha256(packet.packetMarkdown));
    // Byte parity with `sha256sum` on the saved packet, the reviewer's own re-check.
    const savedPacket = readFileSync(path.join(root, ...packet.packetPath.split('/')));
    expect(createHash('sha256').update(savedPacket).digest('hex')).toBe(packet.packetSha256);
    expect(packet.orderingDiff.probes).toEqual([
      { id: 'probe-one', changed: true, beforeTop: ['X:1@4.5'], afterTop: ['X:2@4.5'] },
    ]);
    expect(packet.orderingDiff.identityBefore.engineVersion).toBe('0.1.0');
    expect(packet.orderingDiff.identityAfter.engineVersion).toBe('0.2.0');
  });

  it('fails closed when no historical blob reproduces the digest the approval binds', async () => {
    const root = scaffoldSigningRepo();
    const approvalPath = path.join(root, ...PROBES_APPROVAL_PATH.split('/'));
    const approval = JSON.parse(readFileSync(approvalPath, 'utf8')) as Record<string, unknown>;
    approval['baselineSha256'] = '9'.repeat(64);
    writeFileSync(approvalPath, `${JSON.stringify(approval, null, 2)}\n`, 'utf8');
    await expectSigningError(operationsFor(root).reviewPacket(), 'prior_not_found');
  });
});

describe('preview and write', () => {
  it('computes every digest with eval\'s own functions and passes eval\'s own validators', async () => {
    const root = scaffoldSigningRepo();
    const operations = operationsFor(root);
    const preview = await operations.preview(FORM);

    const baseline = JSON.parse(readFileSync(path.join(root, ...PROBES_BASELINE_PATH.split('/')), 'utf8')) as never;
    const snapshot = JSON.parse(readFileSync(path.join(root, ...ORDERING_SNAPSHOT_PATH.split('/')), 'utf8')) as { probes: never };
    const probeFile = JSON.parse(readFileSync(path.join(root, 'eval', 'probes', 'probes.json'), 'utf8')) as never;
    expect(preview.digests.baselineSha256).toBe(canonicalJsonSha256(baseline));
    expect(preview.digests.probesSha256).toBe(canonicalJsonSha256(probeFile));
    expect(preview.digests.snapshotSha256).toBe(canonicalJsonSha256(snapshot));
    expect(preview.digests.probeListsSha256).toBe(probeListsSha256(snapshot.probes));

    await operations.write(FORM, preview.confirmDigest);

    const probesApproval = JSON.parse(readFileSync(path.join(root, ...PROBES_APPROVAL_PATH.split('/')), 'utf8')) as Record<string, unknown>;
    const orderingApproval = JSON.parse(readFileSync(path.join(root, ...ORDERING_APPROVAL_PATH.split('/')), 'utf8')) as Record<string, unknown>;
    const evidencePath = `docs/reviews/${FORM.reviewedAt}-j39-baseline-signing.md`;
    const evidenceBytes = readFileSync(path.join(root, ...evidencePath.split('/')));
    const evidenceSha256 = createHash('sha256').update(evidenceBytes).digest('hex');

    // The review record is the reviewer's text byte-for-byte plus one
    // trailing newline — nothing prefilled, nothing appended.
    expect(evidenceBytes.toString('utf8')).toBe(`${FORM.reviewNotes}\n`);

    // The gauntlet's own validators accept the written documents.
    const engine = IDENTITY_B;
    expect(validateProbeBaselineApproval({
      baseline,
      approval: probesApproval,
      baselineSha256: canonicalJsonSha256(baseline),
      probesSha256: canonicalJsonSha256(probeFile),
      engine,
      evidenceSha256,
    })).toEqual([]);
    expect(validateOrderingSnapshotApproval({
      snapshot: snapshot as never,
      approval: orderingApproval,
      snapshotSha256: canonicalJsonSha256(snapshot),
      probeListsSha256: probeListsSha256(snapshot.probes),
      engine,
      evidenceSha256,
    })).toEqual([]);

    // Probe approval binds the packet digest; the ordering approval is
    // exact-keys v2 and must NOT carry reviewPacketSha256.
    expect(typeof probesApproval['reviewPacketSha256']).toBe('string');
    expect(Object.keys(orderingApproval).sort()).toEqual([
      'engine', 'evidence', 'independence', 'priorProvenance', 'probeListsSha256',
      'rationale', 'reviewedAt', 'reviewerContact', 'reviewerName', 'schema', 'snapshotSha256',
    ]);
    expect(orderingApproval['schema']).toBe('scripture-search-engine/ordering-snapshot-approval/v2');

    // priorProvenance chains the derived git blobs and the prior identity.
    expect(probesApproval['priorProvenance']).toEqual({
      baselineGitBlobSha1: git(root, ['rev-parse', `HEAD~1:${PROBES_BASELINE_PATH}`]),
      engine: IDENTITY_A,
    });
    expect(orderingApproval['priorProvenance']).toEqual({
      snapshotGitBlobSha1: git(root, ['rev-parse', `HEAD~1:${ORDERING_SNAPSHOT_PATH}`]),
      probeListsSha256: probeListsSha256(snapshotFor(IDENTITY_A, 'X:1').probes as never),
      engine: IDENTITY_A,
    });
  });

  it('refuses a write whose confirm digest no longer matches the repository', async () => {
    const operations = operationsFor(scaffoldSigningRepo());
    await operations.preview(FORM);
    await expectSigningError(operations.write(FORM, 'a'.repeat(64)), 'stale_preview');
  });
});

describe('reviewer prose is never machine-authored', () => {
  it('refuses every empty or whitespace prose field', () => {
    for (const field of ['reviewerName', 'reviewerContact', 'independence', 'rationaleProbes', 'rationaleOrdering', 'reviewNotes'] as const) {
      for (const value of ['', '   \n ']) {
        expect(() => parseSigningForm({ ...FORM, [field]: value })).toThrowError(/never fills prose in/);
      }
    }
  });

  it('refuses a malformed review date and unknown fields', () => {
    expect(() => parseSigningForm({ ...FORM, reviewedAt: '2026-02-30' })).toThrowError(/YYYY-MM-DD/);
    expect(() => parseSigningForm({ ...FORM, reviewedAt: 'today' })).toThrowError(/YYYY-MM-DD/);
    expect(() => parseSigningForm({ ...FORM, surprise: 'x' })).toThrowError(/unsupported field/);
  });

  it('refuses review notes carrying absolute local paths, matching the docs-governance guard', () => {
    const machineLocal = [
      'see C:\\Users\\someone\\repo\\eval\\baselines\\probes.json',
      'see /home/someone/repo/eval/baselines/probes.json',
      'see /Users/someone/repo/eval/baselines/probes.json',
      'see /tmp/scratch/probes.json',
      'see file:///anywhere/at/all',
    ];
    for (const line of machineLocal) {
      expect(absoluteLocalPathFindings(line)).toHaveLength(1);
      expect(() => parseSigningForm({ ...FORM, reviewNotes: line })).toThrowError(/absolute local paths/);
    }
    expect(absoluteLocalPathFindings('see eval/.runs/signing-review-packet.md')).toHaveLength(0);
  });
});

describe('write-path guard', () => {
  it('permits exactly the two approval paths and docs/reviews records', async () => {
    const root = scaffoldSigningRepo();
    await expect(guardedRepositoryWriteTarget(root, PROBES_APPROVAL_PATH)).resolves.toContain('probes.approval.json');
    await expect(guardedRepositoryWriteTarget(root, ORDERING_APPROVAL_PATH)).resolves.toContain('ordering.snapshot.approval.json');
    await expect(guardedRepositoryWriteTarget(root, 'docs/reviews/2026-08-27-j39-baseline-signing.md')).resolves.toContain('j39-baseline-signing.md');
    for (const refused of [
      'eval/baselines/probes.json',
      'docs/reviews/../../engine/src/index.ts',
      'docs/reviews/nested/record.md',
      '/etc/passwd',
      'docs/reviews/.hidden.md',
      'CLAUDE.md',
    ]) {
      await expectSigningError(guardedRepositoryWriteTarget(root, refused), 'unsafe_path');
    }
  });

  it('refuses a docs/reviews that is a symlink out of the repository', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'sse-signing-symlink-'));
    temporaryDirectories.push(root);
    const outside = mkdtempSync(path.join(os.tmpdir(), 'sse-signing-outside-'));
    temporaryDirectories.push(outside);
    mkdirSync(path.join(root, 'docs'), { recursive: true });
    try {
      symlinkSync(outside, path.join(root, 'docs', 'reviews'), 'dir');
    } catch {
      // Platforms refusing symlink creation (e.g. Windows without the
      // privilege) cannot express this attack; nothing to prove there.
      return;
    }
    await expectSigningError(
      guardedRepositoryWriteTarget(root, 'docs/reviews/2026-08-27-j39-baseline-signing.md'),
      'unsafe_path',
    );
  });
});
