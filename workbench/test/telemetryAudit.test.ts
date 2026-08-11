import { lstat, mkdtemp, mkdir, readFile, readdir, rename, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';
import type { Distillate, SensitiveCategories, TelemetryBudgets } from '../../pipeline/src/telemetry/index.js';
import { InjectedCrashError } from '../src/applyJournal.js';
import {
  applyTelemetryAudit,
  closeTelemetryAudit,
  previewTelemetryAudit,
} from '../src/telemetryAudit.js';

const CORPUS = 'a'.repeat(64);
const LAYER = 'b'.repeat(64);
const IDENTITY = { engineVersion: 'audit-engine', corpusFingerprint: CORPUS, layerFingerprint: LAYER };
const BUDGETS: TelemetryBudgets = { minDistinctDevices: 3, rawRetentionDays: 90, weakConvertedRank: 3 };
const CATEGORIES: SensitiveCategories = {
  v: 1,
  categories: [{ id: 'test-sensitive', entries: [{ phrase: 'sensitive privacy canary' }] }],
};
const CRITIC_CANARIES = [
  'APPROVED AGGREGATE CANARY',
  'unavailable identity without conversion canary',
  'unavailable identity with conversion canary',
  'rank mismatch false miss canary',
  'wrong query echo canary',
  'wrong result identity canary',
] as const;

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function row(query: string, overrides: Partial<Distillate['queries'][number]> = {}): Distillate['queries'][number] {
  return { query, identity: IDENTITY, outcomes: { empty: 0, abandoned: 1, converted: 0 }, conversions: [], ...overrides };
}

function distillate(token: string, extra: readonly Distillate['queries'][number][] = []): Distillate {
  return {
    v: 1,
    app: 'maskil',
    period: '2026-Q3',
    token,
    queries: [row('approved aggregate canary'), ...extra],
    pairs: [],
  };
}

function engine(): ScriptureEngine {
  return {
    ...IDENTITY,
    async research(query: string) {
      const results = query === 'rank mismatch false miss canary'
        ? [
            { targetId: 'WEB:43003016', reference: 'John 3:16', excerpt: '', score: 2, reasons: [] },
            { targetId: 'WEB:45008028', reference: 'Romans 8:28', excerpt: '', score: 1, reasons: [] },
          ]
        : [];
      return {
        kind: 'discovery',
        query: query === 'wrong query echo canary' ? 'different query' : query,
        ...IDENTITY,
        layerFingerprint: query === 'wrong result identity canary' ? 'c'.repeat(64) : LAYER,
        results,
      } as Awaited<ReturnType<ScriptureEngine['research']>>;
    },
    async themes() { return []; },
    async passage() { throw new Error('not used'); },
    async related() { throw new Error('not used'); },
    async forSong() { throw new Error('not used'); },
    async close() {},
  } as ScriptureEngine;
}

async function fixture(): Promise<{ repo: string; source: string; selected: string[] }> {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'telemetry-audit-test-'));
  roots.push(parent);
  const repo = path.join(parent, 'repo');
  const source = path.join(parent, 'selected');
  await mkdir(repo);
  await mkdir(source);
  const foreign = { engineVersion: 'foreign-engine', corpusFingerprint: 'c'.repeat(64), layerFingerprint: 'd'.repeat(64) };
  const rejectedEverywhere = [
    row('rank mismatch false miss canary', {
      outcomes: { empty: 0, abandoned: 0, converted: 1 },
      conversions: [{ target: 'WEB:45008028', rank: 1, count: 1 }],
    }),
    row('wrong query echo canary'),
    row('wrong result identity canary'),
  ];
  const values = [
    distillate('token-private-a', [
      row('APPROVED AGGREGATE CANARY'),
      row('below threshold private canary'),
      row('sensitive privacy canary'),
      row('unavailable identity without conversion canary', { identity: foreign }),
      row('unavailable identity with conversion canary', {
        identity: foreign,
        outcomes: { empty: 0, abandoned: 0, converted: 1 },
        conversions: [{ target: 'WEB:43003016', rank: 1, count: 1 }],
      }),
      ...rejectedEverywhere,
    ]),
    distillate('token-private-b', rejectedEverywhere),
    distillate('token-private-c', rejectedEverywhere),
  ];
  const selected = await Promise.all(values.map(async (value, index) => {
    const file = path.join(source, index === 0 ? 'sensitive-privacy-canary.json' : `${index + 1}.json`);
    await writeFile(file, JSON.stringify(value));
    return file;
  }));
  return { repo, source, selected };
}

async function retainedText(repo: string): Promise<string> {
  const retained = [
    'workbench/.telemetry-audits/master-record.json',
    'workbench/cases.jsonl',
  ];
  const receiptDirectory = path.join(repo, 'workbench/.telemetry-audits/receipts');
  const receipts = await readdir(receiptDirectory);
  retained.push(...receipts.map((name) => `workbench/.telemetry-audits/receipts/${name}`));
  return (await Promise.all(retained.map((relative) => readFile(path.join(repo, relative), 'utf8')))).join('\n');
}

async function allRepositoryBytes(directory: string): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) chunks.push(await allRepositoryBytes(target));
    else if (entry.isFile()) chunks.push(await readFile(target));
  }
  return Buffer.concat(chunks);
}

describe('telemetry audit lifecycle', () => {
  it('previews, atomically applies, closes, and re-imports idempotently without retained privacy leaks', async () => {
    const { repo, selected } = await fixture();
    const preview = await previewTelemetryAudit({ repoRoot: repo, selectedFiles: selected, engines: [engine()], budgets: BUDGETS, categories: CATEGORIES });
    const previewDump = JSON.stringify(preview);
    expect(preview.status).toBe('ready');
    expect(preview.summary.candidateCaseCount).toBe(1);
    expect(previewDump).toContain('approved aggregate canary');
    expect(previewDump).not.toContain('below threshold private canary');
    expect(previewDump).not.toContain('sensitive privacy canary');
    expect(previewDump).not.toContain('token-private-a');
    for (const canary of CRITIC_CANARIES) expect(previewDump).not.toContain(canary);

    const applied = await applyTelemetryAudit(preview, [engine()], BUDGETS, CATEGORIES);
    expect(applied.idempotent).toBe(false);
    expect(JSON.stringify(applied)).not.toContain('private canary');
    const retained = await retainedText(repo);
    for (const canary of [
      'below threshold private canary',
      'sensitive privacy canary',
      'token-private-a',
      ...CRITIC_CANARIES,
    ]) expect(retained).not.toContain(canary);

    const repeatedApply = await applyTelemetryAudit(preview, [engine()], BUDGETS, CATEGORIES);
    expect(repeatedApply.idempotent).toBe(true);
    const closed = await closeTelemetryAudit(repo, preview.summary.auditDigest);
    expect(closed.receipt.status).toBe('closed');
    const repeatedClose = await closeTelemetryAudit(repo, preview.summary.auditDigest);
    expect(repeatedClose.idempotent).toBe(true);

    const repeatedPreview = await previewTelemetryAudit({ repoRoot: repo, selectedFiles: selected, engines: [engine()], budgets: BUDGETS, categories: CATEGORIES });
    expect(repeatedPreview.status).toBe('already-closed');
    expect(repeatedPreview.summary.candidateCaseCount).toBe(1);
    expect(repeatedPreview.summary.candidateCases).toEqual([]);
    const returned = JSON.stringify({ preview, applied, repeatedApply, closed, repeatedClose, repeatedPreview });
    const repositoryBytes = (await allRepositoryBytes(repo)).toString('utf8');
    for (const canary of ['below threshold private canary', 'sensitive privacy canary', 'token-private-a', ...CRITIC_CANARIES]) {
      expect(returned).not.toContain(canary);
      expect(repositoryBytes).not.toContain(canary);
    }
  });

  it('recovers interrupted apply and close transactions to a complete all-after state', async () => {
    const { repo, selected } = await fixture();
    const preview = await previewTelemetryAudit({ repoRoot: repo, selectedFiles: selected, engines: [engine()], budgets: BUDGETS, categories: CATEGORIES });
    await expect(applyTelemetryAudit(preview, [engine()], BUDGETS, CATEGORIES, { crashAt: 'file-replaced' }))
      .rejects.toBeInstanceOf(InjectedCrashError);
    const recoveredApply = await applyTelemetryAudit(preview, [engine()], BUDGETS, CATEGORIES);
    expect(recoveredApply.receipt.status).toBe('applied');

    await expect(closeTelemetryAudit(repo, preview.summary.auditDigest, { crashAt: 'file-replaced' }))
      .rejects.toBeInstanceOf(InjectedCrashError);
    const recoveredClose = await closeTelemetryAudit(repo, preview.summary.auditDigest);
    expect(recoveredClose.receipt.status).toBe('closed');
    expect(JSON.stringify(recoveredClose)).not.toContain('private canary');
  });

  it('publishes one immutable pending record idempotently under concurrency and recovers an interrupted publication', async () => {
    const { repo, selected } = await fixture();
    const request = { repoRoot: repo, selectedFiles: selected, engines: [engine()], budgets: BUDGETS, categories: CATEGORIES };
    const [left, right] = await Promise.all([previewTelemetryAudit(request), previewTelemetryAudit(request)]);
    expect(left.status).toBe('ready');
    expect(right.status).toBe('ready');
    expect(left.pendingRecordPath).toBe(right.pendingRecordPath);
    expect(left.pendingRecordSha256).toBe(right.pendingRecordSha256);
    expect((await readdir(path.dirname(path.join(repo, left.pendingRecordPath)))).filter((name) => name.endsWith('.json'))).toEqual([
      path.basename(left.pendingRecordPath),
    ]);
    const applies = await Promise.all([
      applyTelemetryAudit(left, [engine()], BUDGETS, CATEGORIES),
      applyTelemetryAudit(right, [engine()], BUDGETS, CATEGORIES),
    ]);
    expect(applies.map((result) => result.idempotent).sort()).toEqual([false, true]);
    const closes = await Promise.all([
      closeTelemetryAudit(repo, left.summary.auditDigest),
      closeTelemetryAudit(repo, left.summary.auditDigest),
    ]);
    expect(closes.map((result) => result.idempotent).sort()).toEqual([false, true]);
    await expect(lstat(path.join(repo, left.pendingRecordPath))).rejects.toMatchObject({ code: 'ENOENT' });

    const second = await fixture();
    await expect(previewTelemetryAudit({
      repoRoot: second.repo,
      selectedFiles: second.selected,
      engines: [engine()],
      budgets: BUDGETS,
      categories: CATEGORIES,
      stagingCrashAt: 'file-replaced',
    })).rejects.toBeInstanceOf(InjectedCrashError);
    const recovered = await previewTelemetryAudit({
      repoRoot: second.repo,
      selectedFiles: second.selected,
      engines: [engine()],
      budgets: BUDGETS,
      categories: CATEGORIES,
    });
    expect(recovered.status).toBe('ready');
    expect(await readFile(path.join(second.repo, recovered.pendingRecordPath))).not.toHaveLength(0);
  }, 120_000);

  it('detects pending-directory replacement at the old validation/open gap without outside reads or apply', async () => {
    const { repo, selected } = await fixture();
    const preview = await previewTelemetryAudit({ repoRoot: repo, selectedFiles: selected, engines: [engine()], budgets: BUDGETS, categories: CATEGORIES });
    const pendingDirectory = path.dirname(path.join(repo, preview.pendingRecordPath));
    const movedDirectory = `${pendingDirectory}.moved`;
    const outside = await mkdtemp(path.join(os.tmpdir(), 'telemetry-audit-outside-'));
    roots.push(outside);
    const outsideRecord = path.join(outside, path.basename(preview.pendingRecordPath));
    const outsideCanary = 'OUTSIDE READ MUST NEVER OCCUR';
    await writeFile(outsideRecord, outsideCanary);
    let replaced = false;
    try {
      await expect(applyTelemetryAudit(preview, [engine()], BUDGETS, CATEGORIES, {
        async onReadPhase(phase, relativePath) {
          if (replaced || phase !== 'path-validated' || relativePath !== preview.pendingRecordPath) return;
          await rename(pendingDirectory, movedDirectory);
          await symlink(outside, pendingDirectory, process.platform === 'win32' ? 'junction' : 'dir');
          replaced = true;
        },
      })).rejects.toMatchObject({ code: 'path_escape' });
      expect(await readFile(outsideRecord, 'utf8')).toBe(outsideCanary);
      await expect(lstat(path.join(repo, 'workbench/.telemetry-audits/master-record.json'))).rejects.toMatchObject({ code: 'ENOENT' });
      await expect(lstat(path.join(repo, `workbench/.telemetry-audits/receipts/${preview.summary.auditDigest}.json`))).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      if (replaced) {
        await unlink(pendingDirectory);
        await rename(movedDirectory, pendingDirectory);
      }
    }
  });

  it('rejects symlink selections and staging replacement attacks', async () => {
    const { repo, source, selected } = await fixture();
    const link = path.join(source, 'linked.json');
    try {
      const { symlink } = await import('node:fs/promises');
      await symlink(selected[0]!, link, 'file');
      await expect(previewTelemetryAudit({ repoRoot: repo, selectedFiles: [link], engines: [engine()], budgets: BUDGETS, categories: CATEGORIES }))
        .rejects.toThrow(/regular file|symbolic link/);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EPERM') throw error;
    }

    const preview = await previewTelemetryAudit({ repoRoot: repo, selectedFiles: selected, engines: [engine()], budgets: BUDGETS, categories: CATEGORIES });
    const staged = path.join(repo, preview.pendingRecordPath);
    await writeFile(staged, JSON.stringify(distillate('attacker-token')));
    await expect(applyTelemetryAudit(preview, [engine()], BUDGETS, CATEGORIES)).rejects.toMatchObject({ code: 'read_precondition' });
  });

  it('does not call a changed retained state idempotent merely because a receipt exists', async () => {
    const { repo, selected } = await fixture();
    const preview = await previewTelemetryAudit({ repoRoot: repo, selectedFiles: selected, engines: [engine()], budgets: BUDGETS, categories: CATEGORIES });
    await applyTelemetryAudit(preview, [engine()], BUDGETS, CATEGORIES);
    const master = path.join(repo, 'workbench/.telemetry-audits/master-record.json');
    await writeFile(master, '{}\n');
    await expect(applyTelemetryAudit(preview, [engine()], BUDGETS, CATEGORIES)).rejects.toThrow(/no longer matches/);
  });
});
