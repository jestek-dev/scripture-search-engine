import { spawn, type ChildProcess } from 'node:child_process';
import { lstat, mkdtemp, mkdir, readFile, readdir, rename, rm, symlink, unlink, utimes, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  applyMutationPlan,
  applyMutationPlanWithLockedValidation,
  createMutationPlan,
  digestMutationPlan,
  InjectedCrashError,
  recoverMutationJournals,
  validateMutationPlan,
  withMutationJournalLock,
  withMutationJournalReadLock,
  type ApplyPhase,
  type MutationPlan,
} from '../src/applyJournal.js';

const roots: string[] = [];
const children: ChildProcess[] = [];

function journalDirectory(root: string): string {
  return path.join(root, 'workbench', '.state', 'journals');
}

function lockDirectory(root: string): string {
  return path.join(root, 'workbench', '.state', 'locks');
}

async function newRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'apply-journal-'));
  roots.push(root);
  await mkdir(path.join(root, 'workbench'), { recursive: true });
  await mkdir(path.join(root, 'fixtures'), { recursive: true });
  await writeFile(path.join(root, 'fixtures', 'one.txt'), 'before one');
  await writeFile(path.join(root, 'fixtures', 'two.txt'), 'before two');
  return root;
}

async function contents(root: string): Promise<{ one: string; two: string; three: string | null }> {
  const read = async (name: string): Promise<string | null> => {
    try {
      return await readFile(path.join(root, 'fixtures', name), 'utf8');
    } catch {
      return null;
    }
  };
  return {
    one: (await read('one.txt')) ?? '<missing>',
    two: (await read('two.txt')) ?? '<missing>',
    three: await read('three.txt'),
  };
}

async function planFor(root: string): Promise<MutationPlan> {
  return createMutationPlan(root, [
    { path: 'fixtures/three.txt', after: 'after three' },
    { path: 'fixtures/two.txt', after: null },
    { path: 'fixtures/one.txt', after: new TextEncoder().encode('after one') },
  ]);
}

function deferred(): { readonly promise: Promise<void>; readonly resolve: () => void } {
  let resolve: (() => void) | undefined;
  const promise = new Promise<void>((finish) => { resolve = finish; });
  return { promise, resolve: () => resolve?.() };
}

afterEach(async () => {
  for (const child of children.splice(0)) child.kill();
  delete process.env['SCRIPTURE_APPLY_JOURNAL_TEST_SYNC_FAILURE'];
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function childResult(child: ChildProcess): Promise<{ readonly code: number | null; readonly output: string }> {
  return new Promise((resolve) => {
    let output = '';
    child.stdout?.on('data', (chunk: Buffer) => { output += chunk.toString('utf8'); });
    child.stderr?.on('data', (chunk: Buffer) => { output += chunk.toString('utf8'); });
    child.once('exit', (code) => resolve({ code, output }));
  });
}

async function waitForFile(file: string): Promise<void> {
  const deadline = Date.now() + 20_000;
  while (true) {
    try {
      await readFile(file);
      return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      if (Date.now() >= deadline) throw new Error(`Timed out waiting for ${file}.`);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}

describe('versioned mutation plans', () => {
  it('normalizes bytes, sorts paths, and computes a canonical digest', async () => {
    const root = await newRepo();
    const plan = await planFor(root);

    expect(plan.schemaVersion).toBe(2);
    expect(plan.mutations.map((mutation) => mutation.path)).toEqual([
      'fixtures/one.txt',
      'fixtures/three.txt',
      'fixtures/two.txt',
    ]);
    expect(plan.mutations[0]?.after).toEqual({ kind: 'bytes', base64: Buffer.from('after one').toString('base64') });
    expect(plan.mutations[2]?.after).toEqual({ kind: 'delete' });
    expect(plan.digest).toBe(digestMutationPlan(plan));
    expect(validateMutationPlan(JSON.parse(JSON.stringify(plan)))).toEqual(plan);
  });

  it('rejects stale previews before creating a mutation journal', async () => {
    const root = await newRepo();
    const plan = await planFor(root);
    await writeFile(path.join(root, 'fixtures', 'one.txt'), 'changed after preview');

    await expect(applyMutationPlan(root, plan)).rejects.toMatchObject({ code: 'stale_plan' });
    expect(await contents(root)).toEqual({ one: 'changed after preview', two: 'before two', three: null });
  });

  it('requires exact plan fields and rejects tampered payloads', async () => {
    const root = await newRepo();
    const plan = await planFor(root);

    expect(() => validateMutationPlan({ ...plan, digest: '0'.repeat(64) })).toThrow(/digest/);
    expect(() => validateMutationPlan({ ...plan, mutations: plan.mutations.map((mutation, index) => index === 0
      ? { ...mutation, after: { kind: 'bytes', base64: Buffer.from('tampered').toString('base64') } }
      : mutation) })).toThrow(/digest/);
    expect(() => validateMutationPlan({ ...plan, unexpected: true })).toThrow(/unknown field/);
    expect(() => validateMutationPlan({ schemaVersion: plan.schemaVersion, mutations: plan.mutations })).toThrow(/missing required field digest/);
  });
});

describe('crash-safe apply and recovery', () => {
  const phases: readonly { phase: ApplyPhase; outcome: 'before' | 'after' }[] = [
    { phase: 'journal-created', outcome: 'before' },
    { phase: 'staged', outcome: 'before' },
    { phase: 'backed-up', outcome: 'before' },
    { phase: 'commit-marked', outcome: 'after' },
    { phase: 'file-replaced', outcome: 'after' },
    { phase: 'committed', outcome: 'after' },
  ];

  it.each(phases)('recovers an injected crash at $phase to all-$outcome', async ({ phase, outcome }) => {
    const root = await newRepo();
    const plan = await planFor(root);

    await expect(applyMutationPlan(root, plan, { crashAt: phase })).rejects.toBeInstanceOf(InjectedCrashError);
    const recovery = await recoverMutationJournals(root);

    expect(recovery.recovered).toHaveLength(1);
    expect(recovery.recovered[0]?.outcome).toBe(outcome);
    expect(await contents(root)).toEqual(outcome === 'before'
      ? { one: 'before one', two: 'before two', three: null }
      : { one: 'after one', two: '<missing>', three: 'after three' });
    expect(await readdir(journalDirectory(root))).toEqual([]);
  }, 30_000);

  it('applies updates, deletion, and creation with resulting hashes', async () => {
    const root = await newRepo();
    const plan = await planFor(root);
    const result = await applyMutationPlan(root, plan);

    expect(result.digest).toBe(plan.digest);
    expect(result.paths).toEqual(plan.mutations.map((mutation) => mutation.path));
    expect(await contents(root)).toEqual({ one: 'after one', two: '<missing>', three: 'after three' });
    expect(await readdir(journalDirectory(root))).toEqual([]);
  });

  it('runs caller preconditions and postconditions inside the same mutation lock', async () => {
    const root = await newRepo();
    const plan = await planFor(root);
    const events: string[] = [];
    const result = await applyMutationPlanWithLockedValidation(root, plan, {
      async beforeApply() {
        events.push('before');
        await expect(withMutationJournalLock(root, async () => undefined)).rejects.toMatchObject({ code: 'lock_busy' });
        return 'apply' as const;
      },
      async afterCommit() {
        events.push('after');
        await expect(withMutationJournalLock(root, async () => undefined)).rejects.toMatchObject({ code: 'lock_busy' });
      },
    });

    expect(result.status).toBe('APPLIED');
    expect(events).toEqual(['before', 'after']);
    expect(await contents(root)).toEqual({ one: 'after one', two: '<missing>', three: 'after three' });
  });

  it('can idempotently skip after recovery without creating a new journal', async () => {
    const root = await newRepo();
    const plan = await planFor(root);
    let afterCommitCalled = false;
    const result = await applyMutationPlanWithLockedValidation(root, plan, {
      beforeApply: () => 'skip',
      afterCommit: () => { afterCommitCalled = true; },
    });

    expect(result).toEqual({ status: 'SKIPPED' });
    expect(afterCommitCalled).toBe(false);
    expect(await contents(root)).toEqual({ one: 'before one', two: 'before two', three: null });
    expect(await readdir(journalDirectory(root))).toEqual([]);
  });

  it('preflights every recovery entry before changing any target', async () => {
    const root = await newRepo();
    const plan = await planFor(root);

    await expect(applyMutationPlan(root, plan, { crashAt: 'file-replaced' })).rejects.toBeInstanceOf(InjectedCrashError);
    await writeFile(path.join(root, 'fixtures', 'two.txt'), 'third-party change');

    await expect(recoverMutationJournals(root)).rejects.toMatchObject({ code: 'recovery_conflict' });
    expect(await contents(root)).toEqual({ one: 'after one', two: 'third-party change', three: null });
  });

  it('makes repeat recovery a no-op after successful cleanup', async () => {
    const root = await newRepo();
    const plan = await planFor(root);

    await expect(applyMutationPlan(root, plan, { crashAt: 'commit-marked' })).rejects.toBeInstanceOf(InjectedCrashError);
    expect((await recoverMutationJournals(root)).recovered).toHaveLength(1);
    expect((await recoverMutationJournals(root)).recovered).toEqual([]);
    expect(await contents(root)).toEqual({ one: 'after one', two: '<missing>', three: 'after three' });
  });

  it('cleans interrupted atomic stage and backup temporaries without blocking before-state recovery', async () => {
    const root = await newRepo();
    const plan = await planFor(root);
    const operationId = '00000000-0000-4000-8000-000000000099';

    await expect(applyMutationPlan(root, plan, { operationId, crashAt: 'journal-created' })).rejects.toBeInstanceOf(InjectedCrashError);
    await writeFile(
      path.join(journalDirectory(root), `${operationId}.staging`, '0.bin.00000000-0000-4000-8000-000000000097.tmp'),
      'partial stage',
    );
    await writeFile(
      path.join(journalDirectory(root), `${operationId}.backups`, '0.bak.00000000-0000-4000-8000-000000000098.tmp'),
      'partial backup',
    );

    expect(await recoverMutationJournals(root)).toEqual({
      recovered: [{ operationId, outcome: 'before' }],
    });
    expect(await contents(root)).toEqual({ one: 'before one', two: 'before two', three: null });
    expect(await readdir(journalDirectory(root))).toEqual([]);
  });

  it('finishes a committing byte replacement when a Windows-style replace gap left the target missing', async () => {
    const root = await newRepo();
    const plan = await planFor(root);
    const operationId = '00000000-0000-4000-8000-000000000096';

    await expect(applyMutationPlan(root, plan, { operationId, crashAt: 'commit-marked' })).rejects.toBeInstanceOf(InjectedCrashError);
    const targetTemporary = path.join(root, 'fixtures', `one.txt.${operationId}.apply-tmp`);
    await writeFile(targetTemporary, 'after one');
    await unlink(path.join(root, 'fixtures', 'one.txt'));

    await expect(recoverMutationJournals(root)).resolves.toMatchObject({
      recovered: [{ outcome: 'after' }],
    });
    expect(await contents(root)).toEqual({ one: 'after one', two: '<missing>', three: 'after three' });
    await expect(readFile(targetTemporary)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('recovers after a child dies with a partially written operation-owned target temporary', async () => {
    const root = await newRepo();
    const plan = await planFor(root);
    const operationId = '00000000-0000-4000-8000-000000000095';
    const coordination = await mkdtemp(path.join(os.tmpdir(), 'apply-journal-target-temp-'));
    roots.push(coordination);
    const moduleUrl = new URL('../src/applyJournal.ts', import.meta.url).href;
    const code = `
      import { applyMutationPlan } from ${JSON.stringify(moduleUrl)};
      await applyMutationPlan(${JSON.stringify(root)}, ${JSON.stringify(plan)}, { operationId: ${JSON.stringify(operationId)} });
    `;
    const child = spawn(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', code], {
      env: { ...process.env, SCRIPTURE_APPLY_JOURNAL_TEST_TARGET_TEMP_PAUSE_DIR: coordination },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    children.push(child);
    const result = childResult(child);
    await waitForFile(path.join(coordination, 'target-temp-partial'));
    child.kill();
    await result;

    await expect(recoverMutationJournals(root)).resolves.toMatchObject({ recovered: [{ outcome: 'after' }] });
    expect(await contents(root)).toEqual({ one: 'after one', two: '<missing>', three: 'after three' });
    await expect(readFile(path.join(root, 'fixtures', `one.txt.${operationId}.apply-tmp`))).rejects.toMatchObject({ code: 'ENOENT' });
  }, 30_000);

  it('redrives a committed delete when a power-loss model restores the verified before image', async () => {
    const root = await newRepo();
    const plan = await planFor(root);
    const operationId = '00000000-0000-4000-8000-000000000094';

    await expect(applyMutationPlan(root, plan, { operationId, crashAt: 'committed' })).rejects.toBeInstanceOf(InjectedCrashError);
    await writeFile(path.join(root, 'fixtures', 'two.txt'), 'before two');

    await expect(recoverMutationJournals(root)).resolves.toMatchObject({ recovered: [{ outcome: 'after' }] });
    expect(await contents(root)).toEqual({ one: 'after one', two: '<missing>', three: 'after three' });
    await expect(readFile(path.join(root, 'fixtures', `two.txt.${operationId}.apply-delete`))).rejects.toMatchObject({ code: 'ENOENT' });
  }, 30_000);

  it.each(['file', 'directory'] as const)('fails closed when a %s durability flush fails', async (kind) => {
    const root = await newRepo();
    const plan = await planFor(root);
    process.env['SCRIPTURE_APPLY_JOURNAL_TEST_SYNC_FAILURE'] = kind;

    await expect(applyMutationPlan(root, plan)).rejects.toThrow(`Injected ${kind} sync failure.`);
    expect(await contents(root)).toEqual({ one: 'before one', two: 'before two', three: null });
  });

  it('offers cooperative readers only a recovered all-before/all-after state', async () => {
    const root = await newRepo();
    const plan = await planFor(root);

    await expect(applyMutationPlan(root, plan, { crashAt: 'commit-marked' })).rejects.toBeInstanceOf(InjectedCrashError);
    expect(await withMutationJournalLock(root, () => contents(root))).toEqual({ one: 'after one', two: '<missing>', three: 'after three' });
  });
});

describe('lock and reserved state', () => {
  it('reclaims a dead-owner barrier left by a crashed process', async () => {
    const root = await newRepo();
    await recoverMutationJournals(root);
    const guard = path.join(lockDirectory(root), 'mutation-apply.reclaim-guard');
    await writeFile(guard, JSON.stringify({
      schemaVersion: 1,
      ownerId: '00000000-0000-4000-8000-000000000079',
      pid: 2147483647,
      createdAtMs: Date.now() - 600_000,
    }));

    await expect(withMutationJournalLock(root, async () => 'entered')).resolves.toBe('entered');
    expect(await readdir(lockDirectory(root))).toEqual([]);
  });

  it('keeps a malformed reclaim barrier fail-closed regardless of age', async () => {
    const root = await newRepo();
    await recoverMutationJournals(root);
    const guard = path.join(lockDirectory(root), 'mutation-apply.reclaim-guard');
    await writeFile(guard, '{partial-owner');
    const old = new Date(Date.now() - 600_000);
    await utimes(guard, old, old);

    await expect(withMutationJournalLock(root, async () => 'entered')).rejects.toMatchObject({ code: 'lock_busy' });
    expect((await readdir(lockDirectory(root))).some((name) => name.startsWith('mutation-apply.reclaim-guard.'))).toBe(true);
  });

  it('refuses a concurrent apply or recovery while an owner holds the repository lock', async () => {
    const root = await newRepo();
    const plan = await planFor(root);
    const entered = deferred();
    const release = deferred();
    const first = applyMutationPlan(root, plan, {
      onPhase: async (phase) => {
        if (phase === 'journal-created') {
          entered.resolve();
          await release.promise;
        }
      },
    });

    await entered.promise;
    await expect(recoverMutationJournals(root)).rejects.toMatchObject({ code: 'lock_busy' });
    release.resolve();
    await first;
    expect(await contents(root)).toEqual({ one: 'after one', two: '<missing>', three: 'after three' });
  });

  it('reclaims a stale dead-owner lock without touching a live owner lock', async () => {
    const root = await newRepo();
    await mkdir(lockDirectory(root), { recursive: true });
    await writeFile(path.join(lockDirectory(root), 'mutation-apply.lock'), JSON.stringify({
      schemaVersion: 1,
      ownerId: '00000000-0000-4000-8000-000000000001',
      pid: 2147483647,
      createdAtMs: Date.now() - 60_000,
    }));

    await expect(recoverMutationJournals(root)).resolves.toEqual({ recovered: [] });
    expect(await readdir(lockDirectory(root))).toEqual([]);
  });

  it('keeps all contenders out while a stale lock is claimed under the reclaim barrier', async () => {
    const root = await newRepo();
    await recoverMutationJournals(root);
    await writeFile(path.join(lockDirectory(root), 'mutation-apply.lock'), JSON.stringify({
      schemaVersion: 1,
      ownerId: '00000000-0000-4000-8000-000000000091',
      pid: 2147483647,
      createdAtMs: Date.now() - 60_000,
    }));
    const coordination = await mkdtemp(path.join(os.tmpdir(), 'apply-journal-reclaim-'));
    roots.push(coordination);
    const marker = path.join(coordination, 'entered');
    const moduleUrl = new URL('../src/applyJournal.ts', import.meta.url).href;
    const recoverCode = `
      import { recoverMutationJournals } from ${JSON.stringify(moduleUrl)};
      import { writeFile } from 'node:fs/promises';
      await recoverMutationJournals(${JSON.stringify(root)});
      await writeFile(${JSON.stringify(marker)}, 'reclaimer', { flag: 'wx' });
    `;
    const reclaimer = spawn(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', recoverCode], {
      env: { ...process.env, SCRIPTURE_APPLY_JOURNAL_TEST_RECLAIM_PAUSE_DIR: coordination },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    children.push(reclaimer);
    const reclaimerResult = childResult(reclaimer);
    await waitForFile(path.join(coordination, 'claimed'));

    const contenderCode = `
      import { withMutationJournalLock } from ${JSON.stringify(moduleUrl)};
      try {
        await withMutationJournalLock(${JSON.stringify(root)}, async () => {});
        process.exitCode = 0;
      } catch (error) {
        process.exitCode = error?.code === 'lock_busy' ? 23 : 24;
      }
    `;
    const contenders = Array.from({ length: 2 }, () => {
      const child = spawn(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', contenderCode], {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });
      children.push(child);
      return childResult(child);
    });
    const contenderResults = await Promise.all(contenders);
    expect(contenderResults, JSON.stringify(contenderResults)).toEqual([
      { code: 23, output: '' },
      { code: 23, output: '' },
    ]);

    await writeFile(path.join(coordination, 'release'), 'release');
    expect(await reclaimerResult).toEqual({ code: 0, output: '' });
    expect(await readFile(marker, 'utf8')).toBe('reclaimer');
    expect(await readdir(lockDirectory(root))).toEqual([]);
  }, 15_000);

  it('withdraws a displaced guard when publication fails before acquisition returns', async () => {
    const root = await newRepo();
    await recoverMutationJournals(root);
    const locks = lockDirectory(root);
    await writeFile(path.join(locks, 'mutation-apply.lock'), JSON.stringify({
      schemaVersion: 1,
      ownerId: '00000000-0000-4000-8000-000000000081',
      pid: 2147483647,
      createdAtMs: Date.now() - 60_000,
    }));

    const race = await mkdtemp(path.join(os.tmpdir(), 'apply-journal-guard-race-'));
    const publisherPause = await mkdtemp(path.join(os.tmpdir(), 'apply-journal-guard-publish-'));
    roots.push(race, publisherPause);
    const moduleUrl = new URL('../src/applyJournal.ts', import.meta.url).href;
    const contenderCode = `
      import { withMutationJournalLock } from ${JSON.stringify(moduleUrl)};
      try {
        await withMutationJournalLock(${JSON.stringify(root)}, async () => {});
        process.exitCode = 0;
      } catch (error) {
        process.exitCode = error?.code === 'lock_busy' ? 23 : 24;
      }
    `;

    const delayedReclaimer = spawn(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', contenderCode], {
      env: { ...process.env, SCRIPTURE_APPLY_JOURNAL_TEST_GUARD_RACE_PAUSE_DIR: race },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    children.push(delayedReclaimer);
    const delayedResult = childResult(delayedReclaimer);
    await waitForFile(path.join(race, 'before-create'));

    const guard = path.join(locks, 'mutation-apply.reclaim-guard');
    await writeFile(guard, JSON.stringify({
      schemaVersion: 1,
      ownerId: '00000000-0000-4000-8000-000000000082',
      pid: 2147483647,
      createdAtMs: Date.now() - 60_000,
    }));
    await writeFile(path.join(race, 'before-create.release'), 'release');
    await waitForFile(path.join(race, 'stale-read'));
    await unlink(guard);

    const publisherCode = `
      import { withMutationJournalLock } from ${JSON.stringify(moduleUrl)};
      import { readFile, writeFile } from 'node:fs/promises';
      import path from 'node:path';
      try {
        await withMutationJournalLock(${JSON.stringify(root)}, async () => {});
        process.exitCode = 31;
      } catch (error) {
        if (error?.message !== 'Injected reclaim guard sync failure.') process.exitCode = 32;
        await writeFile(path.join(${JSON.stringify(publisherPause)}, 'publication-failed'), 'failed', { flag: 'wx' });
        while (true) {
          try {
            await readFile(path.join(${JSON.stringify(publisherPause)}, 'keepalive.release'));
            break;
          } catch (waitError) {
            if (waitError?.code !== 'ENOENT') throw waitError;
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
        }
      }
    `;
    const publisher = spawn(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', publisherCode], {
      env: {
        ...process.env,
        SCRIPTURE_APPLY_JOURNAL_TEST_GUARD_PUBLISH_PAUSE_DIR: publisherPause,
        SCRIPTURE_APPLY_JOURNAL_TEST_GUARD_WITHDRAW_PAUSE_DIR: publisherPause,
        SCRIPTURE_APPLY_JOURNAL_TEST_GUARD_SYNC_FAILURE: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    children.push(publisher);
    const publisherResult = childResult(publisher);
    await waitForFile(path.join(publisherPause, 'owner-written'));

    await writeFile(path.join(publisherPause, 'owner-written.release'), 'release');
    await waitForFile(path.join(publisherPause, 'canonical-claimed'));
    await writeFile(path.join(race, 'stale-read.release'), 'release');
    expect(await delayedResult).toEqual({ code: 23, output: '' });
    expect((await readdir(locks)).some((name) => name.startsWith('mutation-apply.reclaim-guard.'))).toBe(true);

    await writeFile(path.join(publisherPause, 'canonical-claimed.release'), 'release');
    await waitForFile(path.join(publisherPause, 'publication-failed'));
    expect(await readdir(locks)).toEqual(['mutation-apply.lock']);

    const subsequent = spawn(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', contenderCode], {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    children.push(subsequent);
    expect(await childResult(subsequent)).toEqual({ code: 0, output: '' });

    await writeFile(path.join(publisherPause, 'keepalive.release'), 'release');
    expect(await publisherResult).toEqual({ code: 0, output: '' });
    expect(await readdir(locks)).toEqual([]);
  }, 30_000);

  it('reserves the journal namespace and rejects Windows path aliases', async () => {
    const root = await newRepo();
    await expect(createMutationPlan(root, [{ path: 'workbench/.STATE/journals/attack.txt', after: 'nope' }])).rejects.toMatchObject({ code: 'path_reserved' });
    await expect(createMutationPlan(root, [
      { path: 'fixtures/One.txt', after: 'one' },
      { path: 'fixtures/one.txt', after: 'two' },
    ])).rejects.toMatchObject({ code: 'invalid_plan' });
    for (const unsafe of ['fixtures/trailing.', 'fixtures/trailing ', 'fixtures/CON.txt', 'fixtures/file:stream', 'fixtures/a*.txt']) {
      await expect(createMutationPlan(root, [{ path: unsafe, after: 'nope' }])).rejects.toMatchObject({ code: 'path_invalid' });
    }
  });

  it('cleans recognized orphan artifacts from the reserved journal directory', async () => {
    const root = await newRepo();
    const directory = journalDirectory(root);
    const operationId = '00000000-0000-4000-8000-000000000002';
    await mkdir(path.join(directory, `${operationId}.staging`), { recursive: true });
    await mkdir(path.join(directory, `${operationId}.backups`), { recursive: true });
    await writeFile(path.join(directory, `${operationId}.staging`, '0.bin'), 'orphan stage');
    await writeFile(path.join(directory, `${operationId}.backups`, '0.bak'), 'orphan backup');

    await expect(recoverMutationJournals(root)).resolves.toEqual({ recovered: [] });
    expect(await readdir(directory)).toEqual([]);
  });
});

describe('journal tampering defenses', () => {
  it('does not restore a tampered prepared backup', async () => {
    const root = await newRepo();
    const plan = await planFor(root);
    const operationId = '00000000-0000-4000-8000-000000000003';
    await expect(applyMutationPlan(root, plan, { operationId, crashAt: 'backed-up' })).rejects.toBeInstanceOf(InjectedCrashError);
    await writeFile(path.join(journalDirectory(root), `${operationId}.backups`, '0.bak'), 'tampered backup');

    await expect(recoverMutationJournals(root)).rejects.toMatchObject({ code: 'journal_invalid' });
    expect(await contents(root)).toEqual({ one: 'before one', two: 'before two', three: null });
  });

  it('rejects a tampered journal before it can direct recovery', async () => {
    const root = await newRepo();
    const plan = await planFor(root);
    const operationId = '00000000-0000-4000-8000-000000000004';
    await expect(applyMutationPlan(root, plan, { operationId, crashAt: 'commit-marked' })).rejects.toBeInstanceOf(InjectedCrashError);
    const file = path.join(journalDirectory(root), `${operationId}.json`);
    const journal = JSON.parse(await readFile(file, 'utf8')) as Record<string, unknown>;
    journal.unexpected = true;
    await writeFile(file, JSON.stringify(journal));

    await expect(recoverMutationJournals(root)).rejects.toMatchObject({ code: 'journal_invalid' });
    expect(await contents(root)).toEqual({ one: 'before one', two: 'before two', three: null });
  });
});

describe('path defenses', () => {
  it('fails closed when a validated read parent is replaced before open', async () => {
    const root = await newRepo();
    const outside = await mkdtemp(path.join(os.tmpdir(), 'apply-journal-read-outside-'));
    roots.push(outside);
    await writeFile(path.join(outside, 'one.txt'), 'outside privacy canary');
    const original = path.join(root, 'fixtures');
    const moved = path.join(root, 'fixtures.moved');
    let replaced = false;
    try {
      await expect(withMutationJournalReadLock(root, (scope) => scope.readFile('fixtures/one.txt'), {
        async onReadPhase(phase, relativePath) {
          if (replaced || phase !== 'path-validated' || relativePath !== 'fixtures/one.txt') return;
          await rename(original, moved);
          await symlink(outside, original, process.platform === 'win32' ? 'junction' : 'dir');
          replaced = true;
        },
      })).rejects.toMatchObject({ code: 'path_escape' });
      expect(await readFile(path.join(outside, 'one.txt'), 'utf8')).toBe('outside privacy canary');
      expect(await readdir(outside)).toEqual(['one.txt']);
    } finally {
      if (replaced) {
        await unlink(original);
        await rename(moved, original);
      }
    }
  });

  it('revalidates an opened path after the final pre-read scheduling point', async () => {
    if (process.platform === 'win32') return;
    const root = await newRepo();
    const outside = await mkdtemp(path.join(os.tmpdir(), 'apply-journal-preread-outside-'));
    roots.push(outside);
    await writeFile(path.join(outside, 'one.txt'), 'outside privacy canary');
    const original = path.join(root, 'fixtures');
    const moved = path.join(root, 'fixtures.moved');
    let replaced = false;
    try {
      await expect(withMutationJournalReadLock(root, (scope) => scope.readFile('fixtures/one.txt'), {
        async onReadPhase(phase, relativePath) {
          if (replaced || phase !== 'pre-read-validated' || relativePath !== 'fixtures/one.txt') return;
          await rename(original, moved);
          await symlink(outside, original, 'dir');
          replaced = true;
        },
      })).rejects.toMatchObject({ code: 'path_escape' });
      expect(await readFile(path.join(outside, 'one.txt'), 'utf8')).toBe('outside privacy canary');
    } finally {
      if (replaced) {
        await unlink(original);
        await rename(moved, original);
      }
    }
  });

  it('rejects traversal, absolute, drive-qualified, and backslash paths', async () => {
    const root = await newRepo();
    for (const unsafe of ['../outside.txt', 'fixtures/../outside.txt', '/outside.txt', 'C:/outside.txt', 'fixtures\\outside.txt']) {
      await expect(createMutationPlan(root, [{ path: unsafe, after: 'nope' }])).rejects.toMatchObject({ code: 'path_invalid' });
    }
  });

  it('rejects symlinked parents and symlinked targets even when they point inside or outside', async () => {
    const root = await newRepo();
    const outside = await mkdtemp(path.join(os.tmpdir(), 'apply-journal-outside-'));
    roots.push(outside);
    await mkdir(path.join(outside, 'nested'));
    await writeFile(path.join(outside, 'target.txt'), 'outside');
    try {
      await symlink(path.join(outside, 'nested'), path.join(root, 'fixtures', 'linked-dir'), 'junction');
      await symlink(path.join(outside, 'target.txt'), path.join(root, 'fixtures', 'linked-file'), 'file');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EPERM') return;
      throw error;
    }

    await expect(createMutationPlan(root, [{ path: 'fixtures/linked-dir/escaped.txt', after: 'nope' }])).rejects.toMatchObject({ code: 'path_escape' });
    await expect(createMutationPlan(root, [{ path: 'fixtures/linked-file', after: 'nope' }])).rejects.toMatchObject({ code: 'path_escape' });
    expect(await readFile(path.join(outside, 'target.txt'), 'utf8')).toBe('outside');
  });

  it('detects transaction-root junction replacement before target application', async () => {
    const root = await newRepo();
    const plan = await planFor(root);
    const outside = await mkdtemp(path.join(os.tmpdir(), 'apply-journal-root-outside-'));
    roots.push(outside);
    await writeFile(path.join(outside, 'sentinel'), 'untouched');
    const moved = `${root}.moved`;
    let rootMoved = false;
    await expect(applyMutationPlan(root, plan, {
      async onPhase(phase) {
        if (phase !== 'backed-up') return;
        await rename(root, moved);
        rootMoved = true;
        await symlink(outside, root, process.platform === 'win32' ? 'junction' : 'dir');
      },
    })).rejects.toThrow();

    expect(await readdir(outside)).toEqual(['sentinel']);
    expect(await readFile(path.join(outside, 'sentinel'), 'utf8')).toBe('untouched');
    if (rootMoved) {
      const replacement = await lstat(root).catch(() => null);
      if (replacement?.isSymbolicLink()) await unlink(root);
      await rename(moved, root);
    }
    await expect(recoverMutationJournals(root)).resolves.toMatchObject({
      recovered: [expect.objectContaining({ outcome: 'before' })],
    });
    expect(await contents(root)).toEqual({ one: 'before one', two: 'before two', three: null });
    expect(await readdir(journalDirectory(root))).toEqual([]);
  });
});
