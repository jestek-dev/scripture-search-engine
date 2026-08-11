import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  applyFixturePromotion,
  FixturePromotionError,
  previewFixturePromotion,
  type PromotionEvidenceVerifier,
} from '../src/fixturePromotion.js';
import { InjectedCrashError, recoverMutationJournals } from '../src/applyJournal.js';

let root: string;

const passingEvidence: PromotionEvidenceVerifier = async () => ({
  reportPath: 'eval/.runs/test-report.json',
  reportSha256: 'a'.repeat(64),
  finishedAt: '2026-08-11T12:00:00.000Z',
  gateSummary: 'PENDING FIXTURES NOW PASSING, promote to active: hearing-and-doing',
});

const preview = (fixtureId = 'hearing-and-doing') =>
  previewFixturePromotion(root, fixtureId, { evidenceVerifier: passingEvidence });

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function fixtureText(status: 'pending' | 'active' = 'pending'): string {
  return `${JSON.stringify({
    id: 'hearing-and-doing',
    generatedBy: 'workbench',
    status,
    query: 'hearing and doing',
    expectedTop: [
      { reference: 'James 1:22', requiredReasonFamily: 'concept_anchor' },
      { reference: 'James 2:14-26' },
    ],
    expectedWithinTop: 10,
    mustNotRank: [
      { reference: 'Genesis 5:1', why: 'Genealogy; no thematic relation to hearing or doing.' },
    ],
  }, null, 2)}\n`;
}

async function writeFixture(text: string): Promise<void> {
  await mkdir(path.join(root, 'eval', 'golden'), { recursive: true });
  await writeFile(path.join(root, 'eval', 'golden', 'hearing-and-doing.json'), text, 'utf8');
}

beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'fixture-promotion-'));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('fixture promotion preview', () => {
  it('plans a pending workbench fixture as a single status-only replacement', async () => {
    const beforeBytes = fixtureText('pending');
    await writeFixture(beforeBytes);

    const result = await preview();
    const afterBytes = fixtureText('active');

    expect(result.schemaVersion).toBe(1);
    expect(result.fixtureId).toBe('hearing-and-doing');
    expect(result.fixturePath).toBe('eval/golden/hearing-and-doing.json');
    expect(result.fromStatus).toBe('pending');
    expect(result.toStatus).toBe('active');
    expect(result.before).toEqual({ text: beforeBytes, base64: Buffer.from(beforeBytes).toString('base64'), sha256: sha256(beforeBytes) });
    expect(result.after).toEqual({ text: afterBytes, base64: Buffer.from(afterBytes).toString('base64'), sha256: sha256(afterBytes) });
    expect(result.mutationPlan.mutations).toEqual([{
      path: 'eval/golden/hearing-and-doing.json',
      beforeSha256: sha256(beforeBytes),
      after: { kind: 'bytes', base64: Buffer.from(afterBytes).toString('base64') },
    }]);
    expect(result.digest).toMatch(/^[0-9a-f]{64}$/);
    expect(await preview()).toEqual(result);

    const before = JSON.parse(beforeBytes) as Record<string, unknown>;
    const after = JSON.parse(afterBytes) as Record<string, unknown>;
    expect(after).toEqual({ ...before, status: 'active' });
    expect(JSON.parse(result.after.text)).toEqual({ ...JSON.parse(result.before.text), status: 'active' });
  });

  it('rejects traversal attempts before reading any file', async () => {
    await expect(preview('../outside')).rejects.toThrow(FixturePromotionError);
    await expect(preview('../outside')).rejects.toThrow(/lowercase filename slug/);
    await expect(preview('nested/escape')).rejects.toThrow(/lowercase filename slug/);
  });

  it('rejects hand-written, active, and malformed fixture files', async () => {
    await mkdir(path.join(root, 'eval', 'golden'), { recursive: true });

    await writeFile(
      path.join(root, 'eval', 'golden', 'hearing-and-doing.json'),
      `${JSON.stringify({ id: 'hearing-and-doing', status: 'pending', query: 'hearing and doing' }, null, 2)}\n`,
      'utf8',
    );
    await expect(preview()).rejects.toThrow(/authoritative fixture schema|owned/);

    await writeFixture(fixtureText('active'));
    await expect(preview()).rejects.toThrow(/not pending/);

    await writeFile(
      path.join(root, 'eval', 'golden', 'hearing-and-doing.json'),
      '{\n  "id": "hearing-and-doing",\n  "generatedBy": "workbench",\n  "status": "pending",\n',
      'utf8',
    );
    await expect(preview()).rejects.toThrow(/valid UTF-8 JSON/);
  });

  it('rejects noncanonical and malformed UTF-8 bytes instead of normalizing them', async () => {
    await writeFixture(JSON.stringify(JSON.parse(fixtureText())));
    await expect(preview()).rejects.toThrow(/canonical compiler output/);

    await writeFixture(fixtureText().replaceAll('\n', '\r\n'));
    await expect(preview()).rejects.toThrow(/canonical compiler output/);

    await mkdir(path.join(root, 'eval', 'golden'), { recursive: true });
    await writeFile(
      path.join(root, 'eval', 'golden', 'hearing-and-doing.json'),
      Buffer.from([0x7b, 0x22, 0x80, 0x22, 0x3a, 0x31, 0x7d]),
    );
    await expect(preview()).rejects.toThrow(/valid UTF-8 JSON/);
  });

  it('rejects final-file links without disclosing external bytes', async () => {
    const outside = await mkdtemp(path.join(os.tmpdir(), 'fixture-promotion-outside-'));
    try {
      await mkdir(path.join(root, 'eval', 'golden'), { recursive: true });
      const external = path.join(outside, 'secret.json');
      await writeFile(external, fixtureText());
      try {
        await symlink(external, path.join(root, 'eval', 'golden', 'hearing-and-doing.json'), 'file');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'EPERM') return;
        throw error;
      }
      await expect(preview()).rejects.toThrow(/links or junctions/);
      await expect(preview()).rejects.not.toThrow(/hearing and doing/);
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  });

  it('applies only the reviewed status change and rejects stale or tampered previews', async () => {
    await writeFixture(fixtureText());
    const otherPath = path.join(root, 'eval', 'golden', 'other.json');
    await writeFile(otherPath, 'untouched');
    const plan = await preview();

    await expect(applyFixturePromotion(root, 'hearing-and-doing', '0'.repeat(64), {
      evidenceVerifier: passingEvidence,
    })).rejects.toThrow(/stale/);
    expect(await readFile(path.join(root, plan.fixturePath), 'utf8')).toBe(plan.before.text);

    const applied = await applyFixturePromotion(root, 'hearing-and-doing', plan.digest, {
      evidenceVerifier: passingEvidence,
    });
    expect(applied.result.paths).toEqual([plan.fixturePath]);
    expect(await readFile(path.join(root, plan.fixturePath), 'utf8')).toBe(plan.after.text);
    expect(await readFile(otherPath, 'utf8')).toBe('untouched');

    await writeFixture(fixtureText());
    const stale = await preview();
    await writeFile(path.join(root, stale.fixturePath), `${fixtureText()} `);
    await expect(applyFixturePromotion(root, 'hearing-and-doing', stale.digest, {
      evidenceVerifier: passingEvidence,
    })).rejects.toThrow(/canonical|stale/);
  });

  it('revalidates promotion evidence under the journal lock before changing fixture bytes', async () => {
    await writeFixture(fixtureText());
    let evidenceRevision = 'a'.repeat(64);
    const changingEvidence: PromotionEvidenceVerifier = async () => ({
      reportPath: 'eval/.runs/gauntlet-report.json',
      reportSha256: evidenceRevision,
      finishedAt: '2026-08-11T12:00:00.000Z',
      gateSummary: 'G3 passed',
    });
    const plan = await previewFixturePromotion(root, 'hearing-and-doing', { evidenceVerifier: changingEvidence });
    await expect(applyFixturePromotion(root, 'hearing-and-doing', plan.digest, {
      evidenceVerifier: changingEvidence,
      apply: {
        onPhase: (phase) => {
          if (phase === 'validated') evidenceRevision = 'b'.repeat(64);
        },
      },
    })).rejects.toThrow(/stale.*waiting for the repository lock/i);
    expect(await readFile(path.join(root, plan.fixturePath), 'utf8')).toBe(plan.before.text);
  });

  it('recovers an interrupted promotion to the all-after state', async () => {
    await writeFixture(fixtureText());
    const plan = await preview();
    await expect(applyFixturePromotion(root, 'hearing-and-doing', plan.digest, {
      evidenceVerifier: passingEvidence,
      apply: { crashAt: 'commit-marked' },
    })).rejects.toBeInstanceOf(InjectedCrashError);

    await recoverMutationJournals(root);
    expect(await readFile(path.join(root, plan.fixturePath), 'utf8')).toBe(plan.after.text);
  });

  it('requires explicit passing evidence', async () => {
    await writeFixture(fixtureText());
    await expect(previewFixturePromotion(root, 'hearing-and-doing', {
      evidenceVerifier: async () => { throw new FixturePromotionError('not proven passing'); },
    })).rejects.toThrow(/not proven passing/);
  });
});
