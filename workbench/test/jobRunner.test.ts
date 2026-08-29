import { spawn as nodeSpawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  JOB_DEFINITIONS,
  JOB_ENV_ALLOWLIST,
  JOB_RUNNER_REPO_CWD,
  buildJobEnvironment,
  createJobRunId,
  createJobRunner,
  JOB_STATE_SCHEMA_VERSION,
  resolveNpmCliPath,
  type JobChildProcess,
  type JobRunnerOptions,
  type JobSpawn,
} from '../src/jobRunner.js';
import { withMutationJournalLock } from '../src/applyJournal.js';

const temporaryDirectories: string[] = [];
afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function temporaryDirectory(label: string): string {
  const directory = mkdtempSync(path.join(os.tmpdir(), `sse-${label}-`));
  temporaryDirectories.push(directory);
  return directory;
}

class FakeReadable extends EventEmitter {
  write(chunk: string | Buffer): void { this.emit('data', chunk); }
}

class FakeChildProcess extends EventEmitter implements JobChildProcess {
  readonly stdout = new FakeReadable();
  readonly stderr = new FakeReadable();
  constructor(readonly pid: number) { super(); }
  close(code: number | null, signal: NodeJS.Signals | null = null): void { this.emit('close', code, signal); }
}

class FakeClock {
  private currentMs = Date.parse('2026-08-11T12:00:00.000Z');
  private nextId = 1;
  private readonly microtasks: (() => void)[] = [];
  private readonly timers = new Map<number, { readonly at: number; readonly task: () => void }>();
  now = (): Date => new Date(this.currentMs);
  queueMicrotask = (task: () => void): void => { this.microtasks.push(task); };
  setTimeout = (task: () => void, delay: number): number => {
    const id = this.nextId++;
    this.timers.set(id, { at: this.currentMs + delay, task });
    return id;
  };
  clearTimeout = (id: unknown): void => { this.timers.delete(id as number); };
  flushMicrotasks(): void {
    while (this.microtasks.length > 0) this.microtasks.splice(0).forEach((task) => task());
  }
  advanceBy(milliseconds: number): void {
    this.currentMs += milliseconds;
    while (true) {
      const due = [...this.timers.entries()].filter(([, entry]) => entry.at <= this.currentMs).sort((a, b) => a[1].at - b[1].at);
      if (due.length === 0) return;
      due.forEach(([id, entry]) => { this.timers.delete(id); entry.task(); });
      this.flushMicrotasks();
    }
  }
}

function createHarness(overrides: Partial<JobRunnerOptions> = {}) {
  const clock = new FakeClock();
  const children: FakeChildProcess[] = [];
  const calls: { command: string; args: readonly string[]; cwd: string; detached: boolean }[] = [];
  const kills: number[] = [];
  let nextPid = 1000;
  let nextId = 1;
  const spawn: JobSpawn = (command, args, options) => {
    calls.push({ command, args, cwd: options.cwd, detached: options.detached });
    const child = new FakeChildProcess(nextPid++);
    children.push(child);
    return child;
  };
  const runner = createJobRunner({
    now: clock.now, queueMicrotask: clock.queueMicrotask, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
    spawn, killProcessTree: async (pid) => { kills.push(pid); }, idFactory: () => createJobRunId(String(nextId++)),
    withRepositoryLock: async (task) => task(),
    stateDirectory: temporaryDirectory('job-state'),
    captureProcessIdentity: (pid, nonce) => ({
      formatVersion: 1, nonce, platform: process.platform === 'win32' ? 'win32-job' : 'linux-proc',
      creationId: `fake-${pid}`, executablePath: process.execPath,
    }),
    ...overrides,
  });
  return { clock, children, calls, kills, runner };
}

describe('job runner', () => {
  it('uses Node to run a fixed npm CLI path, without npm.cmd or a shell', () => {
    for (const definition of Object.values(JOB_DEFINITIONS)) {
      expect(definition.command).toBe(process.execPath);
      expect(definition.args[0]).toMatch(/[\\/]npm[\\/]bin[\\/]npm-cli\.js$/);
      expect(definition.args).not.toContain('npm.cmd');
    }
  });

  it('honors a validated declared npm CLI path for nonstandard distributions', () => {
    const directory = temporaryDirectory('declared-npm');
    const cli = path.join(directory, 'npm-cli.js');
    writeFileSync(cli, '// test CLI\n', 'utf8');
    expect(resolveNpmCliPath({ npm_execpath: cli })).toBe(cli);
    expect(resolveNpmCliPath({ npm_execpath: path.join(directory, 'missing', 'npm-cli.js') })).toBe(JOB_DEFINITIONS.test.args[0]);
  });

  it('keeps only the environment allowlist', () => {
    expect(buildJobEnvironment({ PATH: 'C:\\Tools', HOME: 'C:\\Users\\Jeste', GITHUB_TOKEN: 'secret' })).toEqual({ PATH: 'C:\\Tools', HOME: 'C:\\Users\\Jeste' });
    expect(JOB_ENV_ALLOWLIST).toContain('PATH');
    // Operator heap tuning travels (tsx does not forward the parent's
    // --max-old-space-size to its node child — the artifact rebuild OOMs
    // without it); secrets still do not.
    expect(buildJobEnvironment({ NODE_OPTIONS: '--max-old-space-size=8192', GITHUB_TOKEN: 'secret' }))
      .toEqual({ NODE_OPTIONS: '--max-old-space-size=8192' });
  });

  it('D12: the three data-train stages are FIXED allowlisted npm scripts — no free-form command crosses any boundary', () => {
    // The browser posts only a jobId; each definition is a fixed root npm
    // script and the stage CLI locates the sealed train itself.
    expect(JOB_DEFINITIONS['train-build']!.args.slice(1)).toEqual(['run', 'train:build']);
    expect(JOB_DEFINITIONS['train-measure']!.args.slice(1)).toEqual(['run', 'train:measure']);
    expect(JOB_DEFINITIONS['train-gauntlet']!.args.slice(1)).toEqual(['run', 'train:gauntlet']);
    // The sandboxed-state-root knobs the server honors reach the stage jobs
    // through the scrubbed environment (operator trust, like NODE_OPTIONS).
    for (const key of ['WORKBENCH_REPO_ROOT', 'WORKBENCH_REVIEWER', 'WORKBENCH_INDEPENDENT_SIGNER',
      'WORKBENCH_UPDATES_PATH', 'WORKBENCH_JUDGMENTS_PATH', 'WORKBENCH_CASES_PATH', 'WORKBENCH_ADMISSION_EVIDENCE_PATH']) {
      expect(JOB_ENV_ALLOWLIST).toContain(key);
    }
  });

  it('admits exactly one job from enqueue onward instead of creating an unbounded queue', async () => {
    const { clock, children, calls, runner } = createHarness();
    const first = runner.enqueue({ jobId: 'typecheck', origin: { source: 'manual' } });
    expect(() => runner.enqueue({ jobId: 'test', origin: { source: 'manual' } })).toThrow(/already active/);
    expect(first.snapshot().state).toBe('queued');
    clock.flushMicrotasks();
    expect(calls[0]).toMatchObject({ command: process.execPath, cwd: JOB_RUNNER_REPO_CWD, detached: process.platform !== 'win32' });
    children[0]!.close(0);
    await expect(first.result).resolves.toMatchObject({ state: 'passed' });
  });

  it('rejects malformed request and origin fields rather than silently accepting overrides', () => {
    const { runner } = createHarness();
    expect(() => runner.enqueue({ jobId: 'test', origin: { source: 'manual' }, args: ['--unsafe'] } as never)).toThrow(/unsupported field/);
    expect(() => runner.enqueue({ jobId: 'test', origin: { source: 'manual', extra: true } as never })).toThrow(/unsupported field/);
    expect(() => runner.enqueue({ jobId: 'test', origin: { source: 'two words' } })).toThrow(/origin.source is invalid/);
    expect(() => runner.enqueue({ jobId: 'test', origin: { source: 'manual', note: 'x'.repeat(513) } })).toThrow(/origin.note is invalid/);
  });

  it('captures a byte-bounded valid UTF-8 prefix', async () => {
    const { clock, children, runner } = createHarness({ maxOutputBytes: 5 });
    const handle = runner.enqueue({ jobId: 'test', origin: { source: 'api' } });
    clock.flushMicrotasks();
    children[0]!.stdout.write(Buffer.from('ab😀z'));
    children[0]!.close(0);
    await expect(handle.result).resolves.toMatchObject({ output: { stdout: 'ab', stdoutBytes: 7, stdoutTruncated: true } });
  });

  it('never emits replacement text when a code point is split across chunks at the cap', async () => {
    const encoded = Buffer.from('😀');
    for (let split = 1; split < encoded.length; split += 1) {
      const { clock, children, runner } = createHarness({ maxOutputBytes: 2 });
      const handle = runner.enqueue({ jobId: 'test', origin: { source: 'api' } });
      clock.flushMicrotasks();
      children[0]!.stdout.write(encoded.subarray(0, split));
      children[0]!.stdout.write(encoded.subarray(split));
      children[0]!.close(0);
      const result = await handle.result;
      expect(Buffer.byteLength(result.output.stdout, 'utf8')).toBeLessThanOrEqual(2);
      expect(result.output.stdout).not.toContain('�');
      expect(result.output.stdoutTruncated).toBe(true);
    }
  });

  it('waits for confirmed process close during shutdown', async () => {
    const { clock, children, kills, runner } = createHarness();
    runner.enqueue({ jobId: 'test', origin: { source: 'api' } });
    clock.flushMicrotasks();
    const shuttingDown = runner.shutdown();
    expect(kills).toEqual([children[0]!.pid]);
    children[0]!.close(null, 'SIGTERM');
    await expect(shuttingDown).resolves.toBe(true);
    expect(runner.getActive()).toBeNull();
  });

  it('does not admit a successor until cancellation receives close confirmation', async () => {
    const { clock, children, kills, runner } = createHarness({ closeConfirmationMs: 20 });
    const first = runner.enqueue({ jobId: 'test', origin: { source: 'api' } });
    clock.flushMicrotasks();
    expect(first.cancel()).toBe(true);
    expect(kills).toEqual([children[0]!.pid]);
    expect(() => runner.enqueue({ jobId: 'typecheck', origin: { source: 'api' } })).toThrow(/already active/);
    children[0]!.close(null, 'SIGTERM');
    await expect(first.result).resolves.toMatchObject({ state: 'cancelled', signal: 'SIGTERM' });
    expect(() => runner.enqueue({ jobId: 'typecheck', origin: { source: 'api' } })).not.toThrow();
  });

  it('fails closed after bounded stop confirmation and retains the admission lock until close', async () => {
    const { clock, children, runner } = createHarness({ closeConfirmationMs: 20 });
    const first = runner.enqueue({ jobId: 'test', origin: { source: 'api' } });
    clock.flushMicrotasks();
    first.cancel();
    clock.advanceBy(20);
    let resolved = false;
    void first.result.then(() => { resolved = true; });
    await Promise.resolve();
    expect(resolved).toBe(false);
    expect(first.snapshot()).toMatchObject({ state: 'running', failureReason: expect.stringContaining('admission remains locked') });
    expect(runner.getActive()?.runId).toBe(first.runId);
    expect(() => runner.enqueue({ jobId: 'typecheck', origin: { source: 'api' } })).toThrow(/already active/);
    children[0]!.close(null, 'SIGKILL');
    await expect(first.result).resolves.toMatchObject({ state: 'failed', failureReason: expect.stringContaining('admission remains locked') });
    expect(runner.getActive()).toBeNull();
  });

  it('publishes completion only after the outer repository lock has released', async () => {
    let releaseOuter!: () => void;
    const outerReleased = new Promise<void>((resolve) => { releaseOuter = resolve; });
    const { clock, children, runner } = createHarness({
      withRepositoryLock: async (task) => {
        const value = await task();
        await outerReleased;
        return value;
      },
    });
    const first = runner.enqueue({ jobId: 'test', origin: { source: 'api' } });
    clock.flushMicrotasks();
    children[0]!.close(0);
    await Promise.resolve();
    expect(first.snapshot().state).toBe('running');
    expect(runner.getActive()?.runId).toBe(first.runId);
    expect(() => runner.enqueue({ jobId: 'typecheck', origin: { source: 'api' } })).toThrow(/already active/);
    releaseOuter();
    await expect(first.result).resolves.toMatchObject({ state: 'passed' });
    const successor = runner.enqueue({ jobId: 'typecheck', origin: { source: 'api' } });
    clock.flushMicrotasks();
    children[1]!.close(0);
    await expect(successor.result).resolves.toMatchObject({ state: 'passed' });
  });

  it('keeps queued cancellation unresolved until a pending repository lock attempt unwinds', async () => {
    let admit!: () => void;
    const admitted = new Promise<void>((resolve) => { admit = resolve; });
    const { clock, children, runner } = createHarness({
      withRepositoryLock: async (task) => { await admitted; return task(); },
    });
    const handle = runner.enqueue({ jobId: 'test', origin: { source: 'api' } });
    clock.flushMicrotasks();
    expect(handle.cancel()).toBe(true);
    let resolved = false;
    void handle.result.then(() => { resolved = true; });
    await Promise.resolve();
    expect(resolved).toBe(false);
    expect(runner.getActive()?.runId).toBe(handle.runId);
    expect(children).toHaveLength(0);
    admit();
    await expect(handle.result).resolves.toMatchObject({ state: 'cancelled' });
  });

  it('allows an immediate journal transaction after a terminal result is published', async () => {
    const mutationRoot = temporaryDirectory('job-immediate-apply');
    const { clock, children, runner } = createHarness({
      mutationRepoRoot: mutationRoot,
      withRepositoryLock: (task) => withMutationJournalLock(mutationRoot, task),
    });
    const handle = runner.enqueue({ jobId: 'test', origin: { source: 'api' } });
    clock.flushMicrotasks();
    for (let attempt = 0; attempt < 200 && children.length === 0; attempt += 1) await new Promise((resolve) => setTimeout(resolve, 10));
    children[0]!.close(0);
    await expect(handle.result).resolves.toMatchObject({ state: 'passed' });
    await expect(withMutationJournalLock(mutationRoot, async () => 'applied')).resolves.toBe('applied');
  });

  it('bounds retained terminal history and rejects duplicate retained IDs', async () => {
    let id = 'same-id';
    const { clock, children, runner } = createHarness({ maxHistory: 2, idFactory: () => id });
    const first = runner.enqueue({ jobId: 'test', origin: { source: 'api' } });
    clock.flushMicrotasks();
    children[0]!.close(0);
    await first.result;
    expect(() => runner.enqueue({ jobId: 'test', origin: { source: 'api' } })).toThrow(/Duplicate job run id/);
    id = 'second-id';
    const second = runner.enqueue({ jobId: 'test', origin: { source: 'api' } });
    clock.flushMicrotasks();
    children[1]!.close(0);
    await second.result;
    id = 'third-id';
    const third = runner.enqueue({ jobId: 'test', origin: { source: 'api' } });
    clock.flushMicrotasks();
    children[2]!.close(0);
    await third.result;
    expect(runner.list()).toHaveLength(2);
    expect(runner.get('same-id')).toBeNull();
  });

  async function realOwnedTreeCancellation(): Promise<void> {
    const pidFile = path.join(temporaryDirectory('owned-tree'), 'pids.json');
    const script = [
      "const {spawn}=require('node:child_process')",
      "const {writeFileSync}=require('node:fs')",
      "const grand=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore'})",
      "writeFileSync(process.argv[1],JSON.stringify({parent:process.pid,grandchild:grand.pid}))",
      "setInterval(()=>{},1000)",
    ].join(';');
    const runner = createJobRunner({
      definitions: {
        ...JOB_DEFINITIONS,
        test: { command: process.execPath, args: ['-e', script, pidFile], defaultTimeoutMs: 60_000, maxTimeoutMs: 60_000 },
      },
      stateDirectory: temporaryDirectory('owned-tree-state'),
      withRepositoryLock: async (task) => task(),
      closeConfirmationMs: 15_000,
    });
    await runner.ready();
    const handle = runner.enqueue({ jobId: 'test', origin: { source: 'windows-test' } });
    for (let attempt = 0; attempt < 300 && !exists(pidFile); attempt += 1) await new Promise((resolve) => setTimeout(resolve, 25));
    const pids = JSON.parse(readFileSync(pidFile, 'utf8')) as { parent: number; grandchild: number };
    expect(handle.cancel()).toBe(true);
    await expect(handle.result).resolves.toMatchObject({ state: 'cancelled' });
    expect(runner.getActive()).toBeNull();
    await expectProcessDead(pids.parent);
    await expectProcessDead(pids.grandchild);
  }

  it.skipIf(process.platform !== 'win32')('kills a long-lived Windows parent and grandchild through an owned Job Object', realOwnedTreeCancellation, 60_000);
  it.skipIf(process.platform === 'win32')('kills a long-lived POSIX parent and grandchild through its process group', realOwnedTreeCancellation, 30_000);

  it.skipIf(process.platform === 'win32')('launches a real allowlisted npm check on POSIX', async () => {
    const runner = createJobRunner({ stateDirectory: temporaryDirectory('posix-launch'), withRepositoryLock: async (task) => task() });
    await runner.ready();
    const result = await runner.enqueue({ jobId: 'typecheck', origin: { source: 'linux-ci' } }).result;
    expect(result).toMatchObject({ state: 'passed', command: process.execPath });
    expect(result.args[0]).toMatch(/npm-cli\.js$/);
  }, 120_000);

  it('does not kill an unrelated live PID when persisted ownership identity does not match', async () => {
    const stateDirectory = temporaryDirectory('job-recovery-unrelated');
    const child = nodeSpawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], {
      detached: process.platform !== 'win32', stdio: 'ignore', windowsHide: true,
    });
    expect(child.pid).toBeTypeOf('number');
    child.unref();
    const runId = 'job-unrelated-pid';
    const queuedAt = new Date().toISOString();
    writePersistedRunningState(stateDirectory, runId, child.pid!, queuedAt, {
      formatVersion: 1,
      nonce: randomUUID(),
      platform: process.platform === 'win32' ? 'win32-job' : process.platform === 'linux' ? 'linux-proc' : 'posix-ps',
      creationId: 'persisted-identity-does-not-match',
      executablePath: process.execPath,
    });
    try {
      const runner = createJobRunner({ stateDirectory, withRepositoryLock: async (task) => task(), closeConfirmationMs: 5_000 });
      await runner.ready();
      expect(runner.get(runId)).toMatchObject({
        state: 'interrupted',
        failureReason: expect.stringContaining('ownership could not be proven'),
      });
      expectProcessAlive(child.pid!);
      const persisted = JSON.parse(readFileSync(path.join(stateDirectory, `${runId}.json`), 'utf8')) as any;
      expect(persisted).toMatchObject({ schemaVersion: JOB_STATE_SCHEMA_VERSION, childPid: null, childIdentity: null, record: { state: 'interrupted' } });
    } finally {
      try { process.kill(process.platform === 'win32' ? child.pid! : -child.pid!, 'SIGKILL'); } catch { /* already gone */ }
      await expectProcessDead(child.pid!);
    }
  }, 30_000);

  it('terminates a genuinely owned persisted launcher only after its nonce and creation identity verify', async () => {
    const stateDirectory = temporaryDirectory('job-recovery-owned');
    const pidFile = path.join(temporaryDirectory('job-recovery-owned-pids'), 'pids.json');
    const script = [
      "const {spawn}=require('node:child_process')",
      "const {writeFileSync}=require('node:fs')",
      "const grand=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore'})",
      "writeFileSync(process.argv[1],JSON.stringify({parent:process.pid,grandchild:grand.pid}))",
      "setInterval(()=>{},1000)",
    ].join(';');
    const never = new Promise<never>(() => undefined);
    const owner = createJobRunner({
      definitions: {
        ...JOB_DEFINITIONS,
        test: { command: process.execPath, args: ['-e', script, pidFile], defaultTimeoutMs: 60_000, maxTimeoutMs: 60_000 },
      },
      stateDirectory,
      persistenceOwnerPid: 2_000_000_000,
      withRepositoryLock: async (task) => { const value = await task(); await never; return value; },
      closeConfirmationMs: 15_000,
    });
    await owner.ready();
    const handle = owner.enqueue({ jobId: 'test', origin: { source: 'owned-recovery-test' } });
    const statePath = path.join(stateDirectory, `${handle.runId}.json`);
    let persisted: any = null;
    for (let attempt = 0; attempt < 600; attempt += 1) {
      if (exists(statePath)) {
        persisted = JSON.parse(readFileSync(statePath, 'utf8'));
        if (persisted.record.state === 'running' && persisted.childIdentity !== null && exists(pidFile)) break;
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    expect(persisted).toMatchObject({
      schemaVersion: JOB_STATE_SCHEMA_VERSION,
      ownerPid: 2_000_000_000,
      childPid: expect.any(Number),
      childIdentity: { formatVersion: 1, nonce: expect.stringMatching(/^[0-9a-f-]{36}$/), creationId: expect.any(String) },
      record: { state: 'running' },
    });
    const ownedPids = JSON.parse(readFileSync(pidFile, 'utf8')) as { parent: number; grandchild: number };
    const recovery = createJobRunner({ stateDirectory, withRepositoryLock: async (task) => task(), closeConfirmationMs: 15_000 });
    await recovery.ready();
    expect(recovery.get(handle.runId)).toMatchObject({
      state: 'interrupted',
      failureReason: expect.stringContaining('identity-verified owned process tree was stopped'),
    });
    await expectProcessDead(persisted.childPid as number);
    await expectProcessDead(ownedPids.parent);
    await expectProcessDead(ownedPids.grandchild);
    expect(readdirSync(stateDirectory).some((name) => name.endsWith('.tmp'))).toBe(false);
  }, 60_000);
});

function exists(file: string): boolean {
  try { readFileSync(file); return true; } catch { return false; }
}

function writePersistedRunningState(
  stateDirectory: string,
  runId: string,
  childPid: number,
  queuedAt: string,
  childIdentity: Record<string, unknown>,
): void {
  writeFileSync(path.join(stateDirectory, `${runId}.json`), `${JSON.stringify({
    schemaVersion: JOB_STATE_SCHEMA_VERSION,
    ownerPid: 2_000_000_000,
    childPid,
    childIdentity,
    record: {
      runId, jobId: 'test', state: 'running',
      origin: { source: 'recovery-test', requestedBy: null, requestId: null, note: null, requestedAt: queuedAt },
      cwd: JOB_RUNNER_REPO_CWD, command: process.execPath, args: ['-e', 'setInterval(()=>{},1000)'], timeoutMs: 60_000,
      queuedAt, startedAt: queuedAt, finishedAt: null, exitCode: null, signal: null, failureReason: null,
      output: { stdout: '', stderr: '', stdoutBytes: 0, stderrBytes: 0, stdoutTruncated: false, stderrTruncated: false },
    },
  }, null, 2)}\n`, 'utf8');
}

function expectProcessAlive(pid: number): void {
  expect(() => process.kill(pid, 0)).not.toThrow();
}

async function expectProcessDead(pid: number): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    try { process.kill(pid, 0); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ESRCH') return; }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Process ${pid} is still alive.`);
}
