import { Buffer } from 'node:buffer';
import { execFile, spawn as nodeSpawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  closeSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { repoRoot } from './descriptor.js';
import { withMutationJournalLock } from './applyJournal.js';

export const JOB_IDS = ['typecheck', 'test', 'gauntlet', 'verify'] as const;
export type JobId = (typeof JOB_IDS)[number];
export type JobState = 'queued' | 'running' | 'passed' | 'failed' | 'timed-out' | 'cancelled' | 'interrupted';
export type JobStopReason = Extract<JobState, 'timed-out' | 'cancelled'>;
type TerminalJobState = Exclude<JobState, 'queued' | 'running'>;

export interface JobOriginInput {
  readonly source: string;
  readonly requestedBy?: string | null;
  readonly requestId?: string | null;
  readonly note?: string | null;
}

export interface JobOrigin extends JobOriginInput {
  readonly requestedBy: string | null;
  readonly requestId: string | null;
  readonly note: string | null;
  readonly requestedAt: string;
}

export interface JobOutputSnapshot {
  readonly stdout: string;
  readonly stderr: string;
  readonly stdoutBytes: number;
  readonly stderrBytes: number;
  readonly stdoutTruncated: boolean;
  readonly stderrTruncated: boolean;
}

export interface JobRecord {
  readonly runId: string;
  readonly jobId: JobId;
  readonly state: JobState;
  readonly origin: JobOrigin;
  readonly cwd: string;
  readonly command: string;
  readonly args: readonly string[];
  readonly timeoutMs: number;
  readonly queuedAt: string;
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly failureReason: string | null;
  readonly output: JobOutputSnapshot;
}

export interface JobHandle {
  readonly runId: string;
  snapshot(): JobRecord;
  cancel(): boolean;
  readonly result: Promise<JobRecord>;
}

export interface JobRunner {
  /** Resolve after persisted work from a dead runner has been stopped and marked interrupted. */
  ready(): Promise<void>;
  enqueue(request: JobRequest): JobHandle;
  cancel(runId: string): boolean;
  get(runId: string): JobRecord | null;
  getActive(): JobRecord | null;
  list(): readonly JobRecord[];
  /** Cancel a live tree and wait for confirmed close before process exit. */
  shutdown(): Promise<boolean>;
}

export interface JobRequest {
  readonly jobId: JobId;
  readonly origin: JobOriginInput;
  readonly timeoutMs?: number;
}

export interface JobDefinition {
  readonly command: string;
  readonly args: readonly string[];
  readonly defaultTimeoutMs: number;
  readonly maxTimeoutMs: number;
}

export interface JobSpawnOptions {
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
  readonly detached: boolean;
  readonly stdio: readonly ['ignore', 'pipe', 'pipe'];
}

export interface JobOutputStream {
  on(event: 'data', listener: (chunk: string | Buffer) => void): unknown;
}

export interface JobChildProcess {
  readonly pid: number;
  readonly stdout: JobOutputStream | null;
  readonly stderr: JobOutputStream | null;
  on(event: 'close', listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
}

export type JobSpawn = (command: string, args: readonly string[], options: JobSpawnOptions) => JobChildProcess;
export type ProcessTreeKiller = (pid: number) => Promise<void>;
export interface OwnedProcessIdentity {
  readonly formatVersion: 1;
  readonly nonce: string;
  readonly platform: 'win32-job' | 'linux-proc' | 'posix-ps';
  readonly creationId: string;
  readonly executablePath: string;
}
export type ProcessIdentityCapture = (pid: number, nonce: string) => OwnedProcessIdentity | Promise<OwnedProcessIdentity>;
export type PersistedProcessRecoverer = (pid: number, identity: OwnedProcessIdentity) => Promise<'terminated' | 'missing' | 'unproven'>;

export interface JobRunnerOptions {
  readonly now?: () => Date;
  readonly queueMicrotask?: (task: () => void) => void;
  readonly setTimeout?: (task: () => void, delayMs: number) => unknown;
  readonly clearTimeout?: (handle: unknown) => void;
  readonly spawn?: JobSpawn;
  readonly killProcessTree?: ProcessTreeKiller;
  readonly maxOutputBytes?: number;
  readonly maxHistory?: number;
  readonly closeConfirmationMs?: number;
  readonly idFactory?: () => string;
  readonly withRepositoryLock?: <T>(task: () => T | Promise<T>) => Promise<T>;
  readonly stateDirectory?: string;
  readonly mutationRepoRoot?: string;
  readonly repoCwd?: string;
  /** Focused tests may replace commands; production callers never accept definitions from requests. */
  readonly definitions?: Readonly<Record<JobId, JobDefinition>>;
  readonly captureProcessIdentity?: ProcessIdentityCapture;
  readonly recoverPersistedProcess?: PersistedProcessRecoverer;
  /** Test-only persisted owner override; launchers still monitor the real process. */
  readonly persistenceOwnerPid?: number;
}

export const JOB_RUNNER_REPO_CWD = repoRoot;
export const JOB_OUTPUT_LIMIT_BYTES = 16 * 1024;
export const JOB_HISTORY_LIMIT = 64;
export const JOB_CLOSE_CONFIRMATION_MS = 10_000;
const JOB_STDIO = ['ignore', 'pipe', 'pipe'] as const;
const POSITIVE_INTEGER = /^[1-9]\d*$/;
const RUN_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const ORIGIN_SOURCE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;
const MAX_ORIGIN_REQUESTED_BY = 128;
const MAX_ORIGIN_REQUEST_ID = 128;
const MAX_ORIGIN_NOTE = 512;
export const JOB_STATE_SCHEMA_VERSION = 2 as const;
const JOB_STATE_FILE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}\.json$/;
const JOB_STATE_TEMP = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}\.json\.(\d+)\.[0-9a-f-]{36}\.tmp$/;
const execFileAsync = promisify(execFile);

// Invoking npm.cmd directly requires a shell on Windows. Run the npm CLI through
// the current Node executable instead; both paths are computed locally, never from a request.
function validatedCliPath(candidate: string | undefined): string | null {
  if (candidate === undefined || candidate.length === 0 || !path.isAbsolute(candidate)) return null;
  try {
    const resolved = realpathSync(candidate);
    const stats = lstatSync(resolved);
    if (!stats.isFile() || path.basename(resolved).toLowerCase() !== 'npm-cli.js') return null;
    return resolved;
  } catch {
    return null;
  }
}

export function resolveNpmCliPath(baseEnv: NodeJS.ProcessEnv = process.env): string {
  const executableDirectory = path.dirname(process.execPath);
  const candidates = [
    baseEnv['WORKBENCH_NPM_CLI_PATH'],
    baseEnv['npm_execpath'],
    path.resolve(executableDirectory, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.resolve(executableDirectory, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    '/usr/share/nodejs/npm/bin/npm-cli.js',
    '/usr/lib/node_modules/npm/bin/npm-cli.js',
    '/usr/local/lib/node_modules/npm/bin/npm-cli.js',
    path.resolve(JOB_RUNNER_REPO_CWD, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
  const resolved = candidates.map(validatedCliPath).find((candidate) => candidate !== null);
  if (resolved === undefined) throw new Error('Could not resolve the local npm CLI for allowlisted jobs.');
  return resolved;
}

function definition(args: readonly string[], defaultTimeoutMs: number): JobDefinition {
  return Object.freeze({
    command: process.execPath,
    args: Object.freeze([resolveNpmCliPath(), ...args]),
    defaultTimeoutMs,
    maxTimeoutMs: defaultTimeoutMs,
  });
}

export const JOB_DEFINITIONS: Readonly<Record<JobId, JobDefinition>> = Object.freeze({
  typecheck: definition(['run', 'typecheck'], 5 * 60_000),
  test: definition(['run', 'test'], 15 * 60_000),
  gauntlet: definition(['run', 'gauntlet'], 20 * 60_000),
  verify: definition(['run', 'verify'], 30 * 60_000),
});

export const JOB_ENV_ALLOWLIST = Object.freeze([
  'PATH', 'Path', 'PATHEXT', 'SystemRoot', 'SYSTEMROOT', 'ComSpec', 'COMSPEC',
  'TEMP', 'TMP', 'TMPDIR', 'HOME', 'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH',
  'LANG', 'LC_ALL', 'LC_CTYPE', 'TERM', 'NUMBER_OF_PROCESSORS',
  'PROCESSOR_ARCHITECTURE', 'PROCESSOR_IDENTIFIER', 'OS',
] as const);

interface OutputAccumulator {
  readonly maxBytes: number;
  totalBytes: number;
  storedBytes: number;
  truncated: boolean;
  chunks: Buffer[];
}

interface MutableRun {
  readonly runId: string;
  readonly jobId: JobId;
  readonly origin: JobOrigin;
  readonly definition: JobDefinition;
  readonly cwd: string;
  readonly timeoutMs: number;
  readonly queuedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  state: JobState;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  failureReason: string | null;
  readonly stdout: OutputAccumulator;
  readonly stderr: OutputAccumulator;
  readonly result: Promise<JobRecord>;
  readonly resolve: (record: JobRecord) => void;
  readonly processResult: Promise<TerminalJobState>;
  readonly resolveProcess: (state: TerminalJobState) => void;
  child: JobChildProcess | null;
  persistedChildPid: number | null;
  persistedChildIdentity: OwnedProcessIdentity | null;
  timerHandle: unknown;
  closeConfirmationHandle: unknown;
  stopReason: JobStopReason | null;
  terminalRequested: TerminalJobState | null;
  processError: boolean;
  settled: boolean;
}

interface PersistedJobState {
  readonly schemaVersion: typeof JOB_STATE_SCHEMA_VERSION;
  readonly ownerPid: number;
  readonly childPid: number | null;
  readonly childIdentity: OwnedProcessIdentity | null;
  readonly record: JobRecord;
}

function assertPlainObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function assertExactKeys(value: Record<string, unknown>, allowed: readonly string[], label: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new Error(`${label} contains unsupported field: ${key}.`);
  }
}

function assertString(value: unknown, label: string, maxLength: number, pattern?: RegExp): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > maxLength || (pattern !== undefined && !pattern.test(value))) {
    throw new Error(`${label} is invalid.`);
  }
  return value;
}

function assertNullableString(value: unknown, label: string, maxLength: number): string | null {
  if (value === undefined || value === null) return null;
  return assertString(value, label, maxLength);
}

function assertPositiveInteger(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${label} must be a positive safe integer.`);
  return value;
}

function normalizeRequest(request: JobRequest, requestedAt: string): { readonly jobId: JobId; readonly origin: JobOrigin; readonly timeoutMs: number } {
  const input = assertPlainObject(request, 'Job request');
  assertExactKeys(input, ['jobId', 'origin', 'timeoutMs'], 'Job request');
  if (!JOB_IDS.includes(input.jobId as JobId)) throw new Error(`Unsupported job id: ${String(input.jobId)}.`);
  if (input.timeoutMs !== undefined && typeof input.timeoutMs !== 'number') throw new Error('timeoutMs must be a number.');
  const jobId = input.jobId as JobId;
  const originInput = assertPlainObject(input.origin, 'origin');
  assertExactKeys(originInput, ['source', 'requestedBy', 'requestId', 'note'], 'origin');
  const origin = Object.freeze({
    source: assertString(originInput.source, 'origin.source', 64, ORIGIN_SOURCE),
    requestedBy: assertNullableString(originInput.requestedBy, 'origin.requestedBy', MAX_ORIGIN_REQUESTED_BY),
    requestId: assertNullableString(originInput.requestId, 'origin.requestId', MAX_ORIGIN_REQUEST_ID),
    note: assertNullableString(originInput.note, 'origin.note', MAX_ORIGIN_NOTE),
    requestedAt,
  });
  const configured = JOB_DEFINITIONS[jobId];
  const timeoutMs = input.timeoutMs === undefined
    ? configured.defaultTimeoutMs
    : Math.min(assertPositiveInteger(input.timeoutMs, 'timeoutMs'), configured.maxTimeoutMs);
  return { jobId, origin, timeoutMs };
}

export function buildJobEnvironment(baseEnv: NodeJS.ProcessEnv = process.env): Readonly<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const key of JOB_ENV_ALLOWLIST) {
    const value = baseEnv[key];
    if (typeof value === 'string' && value.length > 0) result[key] = value;
  }
  return Object.freeze(result);
}

function createAccumulator(maxBytes: number): OutputAccumulator {
  return { maxBytes, totalBytes: 0, storedBytes: 0, truncated: false, chunks: [] };
}

function appendOutput(accumulator: OutputAccumulator, chunk: string | Buffer): void {
  const buffer = typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : Buffer.from(chunk);
  accumulator.totalBytes += buffer.length;
  if (accumulator.storedBytes >= accumulator.maxBytes) {
    accumulator.truncated = true;
    return;
  }
  const copied = Buffer.from(buffer.subarray(0, accumulator.maxBytes - accumulator.storedBytes));
  if (copied.length > 0) {
    accumulator.chunks.push(copied);
    accumulator.storedBytes += copied.length;
  }
  if (copied.length < buffer.length) accumulator.truncated = true;
}

function renderOutput(accumulator: OutputAccumulator): { readonly text: string; readonly totalBytes: number; readonly truncated: boolean } {
  const stored = Buffer.concat(accumulator.chunks);
  let end = stored.length;
  let text = '';
  while (end > 0) {
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(stored.subarray(0, end));
      break;
    } catch {
      end -= 1;
    }
  }
  return {
    text,
    totalBytes: accumulator.totalBytes,
    truncated: accumulator.truncated || accumulator.totalBytes > accumulator.storedBytes || end < stored.length,
  };
}

function defaultSpawn(command: string, args: readonly string[], options: JobSpawnOptions): JobChildProcess {
  const child = nodeSpawn(command, args, {
    cwd: options.cwd,
    env: options.env,
    detached: options.detached,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  if (!Number.isSafeInteger(child.pid) || child.pid === undefined || child.pid <= 0) throw new Error('Spawned process did not expose a valid pid.');
  const adapted: JobChildProcess = {
    pid: child.pid,
    stdout: child.stdout,
    stderr: child.stderr,
    on(event, listener) {
      child.on(event, listener);
      return adapted;
    },
  };
  return adapted;
}

const WINDOWS_JOB_HELPER_SOURCE = String.raw`
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;

public static class Program {
  const uint CREATE_SUSPENDED = 0x00000004;
  const uint STARTF_USESTDHANDLES = 0x00000100;
  const uint INFINITE = 0xffffffff;
  const uint JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x00002000;
  const uint SYNCHRONIZE = 0x00100000;
  const uint PROCESS_QUERY_LIMITED_INFORMATION = 0x00001000;
  const uint PROCESS_TERMINATE = 0x00000001;
  const uint WAIT_OBJECT_0 = 0;
  const int ERROR_ALREADY_EXISTS = 183;

  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  struct STARTUPINFO {
    public int cb; public string lpReserved; public string lpDesktop; public string lpTitle;
    public uint dwX; public uint dwY; public uint dwXSize; public uint dwYSize;
    public uint dwXCountChars; public uint dwYCountChars; public uint dwFillAttribute;
    public uint dwFlags; public short wShowWindow; public short cbReserved2;
    public IntPtr lpReserved2; public IntPtr hStdInput; public IntPtr hStdOutput; public IntPtr hStdError;
  }
  [StructLayout(LayoutKind.Sequential)]
  struct PROCESS_INFORMATION { public IntPtr hProcess; public IntPtr hThread; public uint dwProcessId; public uint dwThreadId; }
  [StructLayout(LayoutKind.Sequential)] struct FILETIME { public uint Low; public uint High; }
  [StructLayout(LayoutKind.Sequential)]
  struct JOBOBJECT_BASIC_LIMIT_INFORMATION {
    public long PerProcessUserTimeLimit; public long PerJobUserTimeLimit; public uint LimitFlags;
    public UIntPtr MinimumWorkingSetSize; public UIntPtr MaximumWorkingSetSize; public uint ActiveProcessLimit;
    public UIntPtr Affinity; public uint PriorityClass; public uint SchedulingClass;
  }
  [StructLayout(LayoutKind.Sequential)]
  struct IO_COUNTERS { public ulong ReadOperationCount; public ulong WriteOperationCount; public ulong OtherOperationCount; public ulong ReadTransferCount; public ulong WriteTransferCount; public ulong OtherTransferCount; }
  [StructLayout(LayoutKind.Sequential)]
  struct JOBOBJECT_EXTENDED_LIMIT_INFORMATION { public JOBOBJECT_BASIC_LIMIT_INFORMATION BasicLimitInformation; public IO_COUNTERS IoInfo; public UIntPtr ProcessMemoryLimit; public UIntPtr JobMemoryLimit; public UIntPtr PeakProcessMemoryUsed; public UIntPtr PeakJobMemoryUsed; }

  [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] static extern IntPtr CreateJobObject(IntPtr attributes, string name);
  [DllImport("kernel32.dll", SetLastError = true)] static extern bool SetInformationJobObject(IntPtr job, int infoClass, ref JOBOBJECT_EXTENDED_LIMIT_INFORMATION info, uint length);
  [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] static extern bool CreateProcess(string application, StringBuilder commandLine, IntPtr processAttributes, IntPtr threadAttributes, bool inheritHandles, uint flags, IntPtr environment, string cwd, ref STARTUPINFO startup, out PROCESS_INFORMATION process);
  [DllImport("kernel32.dll", SetLastError = true)] static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
  [DllImport("kernel32.dll", SetLastError = true)] static extern uint ResumeThread(IntPtr thread);
  [DllImport("kernel32.dll", SetLastError = true)] static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);
  [DllImport("kernel32.dll", SetLastError = true)] static extern bool GetExitCodeProcess(IntPtr process, out uint code);
  [DllImport("kernel32.dll", SetLastError = true)] static extern bool TerminateProcess(IntPtr process, uint code);
  [DllImport("kernel32.dll", SetLastError = true)] static extern bool CloseHandle(IntPtr handle);
  [DllImport("kernel32.dll", SetLastError = true)] static extern IntPtr GetStdHandle(int id);
  [DllImport("kernel32.dll", SetLastError = true)] static extern IntPtr OpenProcess(uint access, bool inheritHandle, uint processId);
  [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] static extern IntPtr CreateMutex(IntPtr attributes, bool initialOwner, string name);
  [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] static extern IntPtr OpenMutex(uint access, bool inheritHandle, string name);
  [DllImport("kernel32.dll", SetLastError = true)] static extern bool GetProcessTimes(IntPtr process, out FILETIME creation, out FILETIME exit, out FILETIME kernel, out FILETIME user);
  [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] static extern bool QueryFullProcessImageName(IntPtr process, uint flags, StringBuilder path, ref uint size);

  static string Quote(string value) {
    if (value.Length > 0 && value.IndexOfAny(new [] {' ', '\t', '\n', '\v', '"'}) < 0) return value;
    var result = new StringBuilder("\""); int slashes = 0;
    foreach (char ch in value) {
      if (ch == '\\') { slashes++; continue; }
      if (ch == '"') result.Append('\\', slashes * 2 + 1); else result.Append('\\', slashes);
      slashes = 0; result.Append(ch);
    }
    result.Append('\\', slashes * 2); result.Append('"'); return result.ToString();
  }
  static Exception Win32(string operation) { return new Win32Exception(Marshal.GetLastWin32Error(), operation); }
  static string MarkerName(string nonce) { return "Local\\ScriptureWorkbenchJobOwner-" + nonce; }
  static ulong Ticks(FILETIME value) { return ((ulong)value.High << 32) | value.Low; }
  static string Describe(uint pid, string nonce, bool terminate, string expectedCreation, string expectedPathBase64) {
    IntPtr marker = IntPtr.Zero; IntPtr process = IntPtr.Zero;
    try {
      marker = OpenMutex(SYNCHRONIZE, false, MarkerName(nonce));
      if (marker == IntPtr.Zero) return "UNPROVEN";
      process = OpenProcess(SYNCHRONIZE | PROCESS_QUERY_LIMITED_INFORMATION | (terminate ? PROCESS_TERMINATE : 0), false, pid);
      if (process == IntPtr.Zero) return Marshal.GetLastWin32Error() == 87 ? "MISSING" : "UNPROVEN";
      FILETIME creation, exit, kernel, user;
      if (!GetProcessTimes(process, out creation, out exit, out kernel, out user)) return "UNPROVEN";
      var image = new StringBuilder(32768); uint imageLength = (uint)image.Capacity;
      if (!QueryFullProcessImageName(process, 0, image, ref imageLength)) return "UNPROVEN";
      string creationText = Ticks(creation).ToString();
      string pathBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(image.ToString()));
      if (!terminate) return "DESCRIBED|" + creationText + "|" + pathBase64;
      if (creationText != expectedCreation || pathBase64 != expectedPathBase64) return "UNPROVEN";
      return TerminateProcess(process, 137) ? "TERMINATED" : "UNPROVEN";
    } finally { if (process != IntPtr.Zero) CloseHandle(process); if (marker != IntPtr.Zero) CloseHandle(marker); }
  }

  public static int Main(string[] args) {
    if (args.Length >= 3 && args[0] == "--describe") {
      uint pid; if (!UInt32.TryParse(args[1], out pid)) return 64;
      Console.WriteLine(Describe(pid, args[2], false, "", "")); return 0;
    }
    if (args.Length >= 5 && args[0] == "--terminate-if-match") {
      uint pid; if (!UInt32.TryParse(args[1], out pid)) return 64;
      Console.WriteLine(Describe(pid, args[2], true, args[3], args[4])); return 0;
    }
    if (args.Length < 4) { Console.Error.WriteLine("usage: job-owner <cwd> <parent-pid> <nonce> <command> [args...]"); return 64; }
    IntPtr job = IntPtr.Zero; IntPtr parent = IntPtr.Zero; IntPtr marker = IntPtr.Zero; PROCESS_INFORMATION child = new PROCESS_INFORMATION();
    try {
      uint parentPid; if (!UInt32.TryParse(args[1], out parentPid)) { Console.Error.WriteLine("invalid parent pid"); return 64; }
      parent = OpenProcess(SYNCHRONIZE, false, parentPid); if (parent == IntPtr.Zero) throw Win32("OpenProcess(parent) failed");
      marker = CreateMutex(IntPtr.Zero, false, MarkerName(args[2]));
      if (marker == IntPtr.Zero || Marshal.GetLastWin32Error() == ERROR_ALREADY_EXISTS) throw Win32("CreateMutex(owner marker) failed");
      job = CreateJobObject(IntPtr.Zero, null); if (job == IntPtr.Zero) throw Win32("CreateJobObject failed");
      var limits = new JOBOBJECT_EXTENDED_LIMIT_INFORMATION(); limits.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
      if (!SetInformationJobObject(job, 9, ref limits, (uint)Marshal.SizeOf(limits))) throw Win32("SetInformationJobObject failed");
      var commandLine = new StringBuilder();
      for (int i = 3; i < args.Length; i++) { if (i > 3) commandLine.Append(' '); commandLine.Append(Quote(args[i])); }
      var startup = new STARTUPINFO(); startup.cb = Marshal.SizeOf(startup); startup.dwFlags = STARTF_USESTDHANDLES;
      startup.hStdInput = GetStdHandle(-10); startup.hStdOutput = GetStdHandle(-11); startup.hStdError = GetStdHandle(-12);
      if (!CreateProcess(args[3], commandLine, IntPtr.Zero, IntPtr.Zero, true, CREATE_SUSPENDED, IntPtr.Zero, args[0], ref startup, out child)) throw Win32("CreateProcess failed");
      if (!AssignProcessToJobObject(job, child.hProcess)) { TerminateProcess(child.hProcess, 125); throw Win32("AssignProcessToJobObject failed"); }
      if (ResumeThread(child.hThread) == 0xffffffff) { TerminateProcess(child.hProcess, 125); throw Win32("ResumeThread failed"); }
      while (WaitForSingleObject(child.hProcess, 100) != WAIT_OBJECT_0) {
        if (WaitForSingleObject(parent, 0) == WAIT_OBJECT_0) return 124;
      }
      uint exitCode; if (!GetExitCodeProcess(child.hProcess, out exitCode)) throw Win32("GetExitCodeProcess failed");
      return unchecked((int)exitCode);
    } catch (Exception error) { Console.Error.WriteLine(error.ToString()); return 125; }
    finally { if (child.hThread != IntPtr.Zero) CloseHandle(child.hThread); if (child.hProcess != IntPtr.Zero) CloseHandle(child.hProcess); if (job != IntPtr.Zero) CloseHandle(job); if (marker != IntPtr.Zero) CloseHandle(marker); if (parent != IntPtr.Zero) CloseHandle(parent); }
  }
}`;
let windowsJobHelperPromise: Promise<string> | null = null;

async function windowsJobHelper(): Promise<string> {
  if (windowsJobHelperPromise !== null) return windowsJobHelperPromise;
  windowsJobHelperPromise = (async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'scripture-workbench-job-'));
    const executable = path.join(directory, 'job-owner.exe');
    const powershell = path.join(process.env['SystemRoot'] ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    await execFileAsync(powershell, [
      '-NoLogo', '-NoProfile', '-NonInteractive', '-Command',
      'Add-Type -TypeDefinition $env:SCRIPTURE_JOB_HELPER_SOURCE -OutputAssembly $env:SCRIPTURE_JOB_HELPER_EXE -OutputType ConsoleApplication',
    ], {
      windowsHide: true,
      env: { ...process.env, SCRIPTURE_JOB_HELPER_SOURCE: WINDOWS_JOB_HELPER_SOURCE, SCRIPTURE_JOB_HELPER_EXE: executable },
    });
    process.once('exit', () => { try { rmSync(directory, { recursive: true, force: true }); } catch { /* best effort */ } });
    return executable;
  })();
  return windowsJobHelperPromise;
}

async function ownedSpawn(command: string, args: readonly string[], options: JobSpawnOptions, nonce: string): Promise<JobChildProcess> {
  if (process.platform === 'win32') {
    const helper = await windowsJobHelper();
    return defaultSpawn(helper, [options.cwd, String(process.pid), nonce, command, ...args], { ...options, detached: false });
  }
  const ownerScript = String.raw`
const { spawn } = require('node:child_process');
const [marker, parentText, nonce, cwd, command, ...args] = process.argv.slice(1);
if (marker !== 'scripture-workbench-owned-process-v1' || !/^[0-9a-f-]{36}$/.test(nonce)) process.exit(64);
const parentPid = Number(parentText);
let finished = false;
let child;
function killChildGroup() {
  if (!child || !Number.isSafeInteger(child.pid)) return;
  try { process.kill(-child.pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') console.error(error); }
}
function finish(code) {
  if (finished) return;
  finished = true;
  clearInterval(parentWatch);
  killChildGroup();
  process.exitCode = code;
}
function parentAlive() {
  try { process.kill(parentPid, 0); return true; } catch (error) { return error.code !== 'ESRCH'; }
}
if (!Number.isSafeInteger(parentPid) || parentPid <= 0 || !parentAlive()) process.exit(124);
try {
  child = spawn(command, args, { cwd, env: process.env, detached: true, shell: false, stdio: ['ignore', 'inherit', 'inherit'] });
} catch (error) { console.error(error); process.exit(125); }
const parentWatch = setInterval(() => { if (!parentAlive()) finish(124); }, 100);
process.once('SIGTERM', () => finish(143));
process.once('SIGINT', () => finish(130));
child.once('error', (error) => { console.error(error); finish(125); });
child.once('close', (code, signal) => finish(Number.isInteger(code) ? code : signal ? 1 : 0));`;
  return defaultSpawn(process.execPath, ['-e', ownerScript, 'scripture-workbench-owned-process-v1', String(process.pid), nonce, options.cwd, command, ...args], { ...options, detached: true });
}

async function defaultKillProcessTree(pid: number): Promise<void> {
  if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error('Invalid child pid.');
  if (process.platform === 'win32') {
    try { process.kill(pid, 'SIGKILL'); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ESRCH') return;
      throw new Error(`Windows Job Object owner ${pid} could not be terminated: ${formatError(error)}.`);
    }
    return;
  }
  try {
    process.kill(pid, 'SIGTERM');
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ESRCH') return;
    if (nodeError.code !== 'EINVAL' && nodeError.code !== 'EPERM') throw error;
    try {
      process.kill(-pid, 'SIGKILL');
    } catch (fallback) {
      if ((fallback as NodeJS.ErrnoException).code !== 'ESRCH') throw fallback;
    }
  }
}

function parseWindowsDescription(output: string, nonce: string): OwnedProcessIdentity | null {
  const parts = output.trim().split('|');
  if (parts.length !== 3 || parts[0] !== 'DESCRIBED' || !/^\d+$/.test(parts[1]!)) return null;
  let executablePath: string;
  try { executablePath = Buffer.from(parts[2]!, 'base64').toString('utf8'); } catch { return null; }
  if (executablePath.length === 0 || !path.isAbsolute(executablePath)) return null;
  return { formatVersion: 1, nonce, platform: 'win32-job', creationId: parts[1]!, executablePath };
}

function linuxProcessIdentity(pid: number, nonce: string): OwnedProcessIdentity {
  const commandLine = readFileSync(`/proc/${pid}/cmdline`).toString('utf8').split('\0').filter(Boolean);
  if (!commandLine.includes('scripture-workbench-owned-process-v1') || !commandLine.includes(nonce)) {
    throw new Error('Owned POSIX launcher command marker is absent.');
  }
  const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
  const close = stat.lastIndexOf(')');
  const fields = close < 0 ? [] : stat.slice(close + 2).trim().split(/\s+/);
  const creationId = fields[19];
  if (creationId === undefined || !/^\d+$/.test(creationId)) throw new Error('Owned POSIX launcher creation identity is unavailable.');
  return {
    formatVersion: 1,
    nonce,
    platform: 'linux-proc',
    creationId,
    executablePath: realpathSync(`/proc/${pid}/exe`),
  };
}

async function defaultCaptureProcessIdentity(pid: number, nonce: string): Promise<OwnedProcessIdentity> {
  if (!Number.isSafeInteger(pid) || pid <= 0 || !/^[0-9a-f-]{36}$/.test(nonce)) throw new Error('Owned process identity request is invalid.');
  if (process.platform === 'win32') {
    const helper = await windowsJobHelper();
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const result = await execFileAsync(helper, ['--describe', String(pid), nonce], { windowsHide: true });
      const identity = parseWindowsDescription(result.stdout, nonce);
      if (identity !== null) return identity;
      if (result.stdout.trim() === 'MISSING') throw new Error('Owned Windows launcher exited before its identity was captured.');
      await new Promise((resolve) => globalThis.setTimeout(resolve, 20));
    }
    throw new Error('Owned Windows launcher marker could not be verified.');
  }
  if (process.platform === 'linux') return linuxProcessIdentity(pid, nonce);
  const marker = 'scripture-workbench-owned-process-v1';
  const result = await execFileAsync('ps', ['-p', String(pid), '-o', 'lstart=', '-o', 'command=']);
  const description = result.stdout.trim();
  if (!description.includes(marker) || !description.includes(nonce)) throw new Error('Owned POSIX launcher command marker is absent.');
  return { formatVersion: 1, nonce, platform: 'posix-ps', creationId: description, executablePath: process.execPath };
}

function sameIdentity(left: OwnedProcessIdentity, right: OwnedProcessIdentity): boolean {
  return left.formatVersion === right.formatVersion
    && left.nonce === right.nonce
    && left.platform === right.platform
    && left.creationId === right.creationId
    && (process.platform === 'win32'
      ? left.executablePath.toLowerCase() === right.executablePath.toLowerCase()
      : left.executablePath === right.executablePath);
}

async function defaultRecoverPersistedProcess(pid: number, identity: OwnedProcessIdentity): Promise<'terminated' | 'missing' | 'unproven'> {
  if (!processExists(pid)) return 'missing';
  if (identity.platform === 'win32-job' && process.platform === 'win32') {
    const helper = await windowsJobHelper();
    const encodedPath = Buffer.from(identity.executablePath, 'utf8').toString('base64');
    const result = await execFileAsync(helper, [
      '--terminate-if-match', String(pid), identity.nonce, identity.creationId, encodedPath,
    ], { windowsHide: true });
    const status = result.stdout.trim();
    return status === 'TERMINATED' ? 'terminated' : status === 'MISSING' ? 'missing' : 'unproven';
  }
  if ((identity.platform === 'linux-proc' && process.platform !== 'linux') || (identity.platform === 'posix-ps' && (process.platform === 'win32' || process.platform === 'linux'))) return 'unproven';
  try {
    const current = await defaultCaptureProcessIdentity(pid, identity.nonce);
    if (!sameIdentity(current, identity)) return 'unproven';
  } catch {
    return processExists(pid) ? 'unproven' : 'missing';
  }
  await defaultKillProcessTree(pid);
  return 'terminated';
}

function snapshotOf(run: MutableRun): JobRecord {
  const stdout = renderOutput(run.stdout);
  const stderr = renderOutput(run.stderr);
  return Object.freeze({
    runId: run.runId, jobId: run.jobId, state: run.state, origin: run.origin,
    cwd: run.cwd, command: run.definition.command, args: run.definition.args,
    timeoutMs: run.timeoutMs, queuedAt: run.queuedAt, startedAt: run.startedAt, finishedAt: run.finishedAt,
    exitCode: run.exitCode, signal: run.signal, failureReason: run.failureReason,
    output: Object.freeze({
      stdout: stdout.text, stderr: stderr.text, stdoutBytes: stdout.totalBytes, stderrBytes: stderr.totalBytes,
      stdoutTruncated: stdout.truncated, stderrTruncated: stderr.truncated,
    }),
  });
}

function formatError(error: unknown): string {
  return error instanceof Error && error.message.length > 0 ? error.message : typeof error === 'string' && error.length > 0 ? error : 'unknown error';
}

function terminalState(state: JobState): state is TerminalJobState {
  return state !== 'queued' && state !== 'running';
}

function syncDirectory(directory: string): void {
  if (process.platform === 'win32') return;
  const descriptor = openSync(directory, 'r');
  try { fsyncSync(descriptor); } finally { closeSync(descriptor); }
}

function ensureStateDirectory(directory: string): string {
  const resolved = path.resolve(directory);
  mkdirSync(resolved, { recursive: true });
  const stats = lstatSync(resolved);
  if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error('Job state directory must be a real directory.');
  return realpathSync(resolved);
}

function stateFile(directory: string, runId: string): string {
  if (!RUN_ID.test(runId)) throw new Error('Persisted job run id is invalid.');
  return path.join(directory, `${runId}.json`);
}

function persistState(directory: string, ownerPid: number, run: MutableRun): void {
  const target = stateFile(directory, run.runId);
  const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
  const body: PersistedJobState = {
    schemaVersion: JOB_STATE_SCHEMA_VERSION,
    ownerPid,
    childPid: run.persistedChildPid,
    childIdentity: run.persistedChildIdentity,
    record: snapshotOf(run),
  };
  let descriptor: number | null = null;
  try {
    descriptor = openSync(temporary, 'wx', 0o600);
    writeFileSync(descriptor, `${JSON.stringify(body, null, 2)}\n`, 'utf8');
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = null;
    renameSync(temporary, target);
    syncDirectory(directory);
  } finally {
    if (descriptor !== null) closeSync(descriptor);
    try { unlinkSync(temporary); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  }
}

function parsePersistedState(file: string): PersistedJobState {
  const stats = lstatSync(file);
  if (!stats.isFile() || stats.isSymbolicLink()) throw new Error(`Persisted job state must be a regular file: ${file}`);
  let value: unknown;
  try { value = JSON.parse(readFileSync(file, 'utf8')); }
  catch { throw new Error(`Persisted job state is not valid JSON: ${file}`); }
  const root = assertPlainObject(value, 'Persisted job state');
  const legacy = root['schemaVersion'] === 1;
  assertExactKeys(root, legacy
    ? ['schemaVersion', 'ownerPid', 'childPid', 'record']
    : ['schemaVersion', 'ownerPid', 'childPid', 'childIdentity', 'record'], 'Persisted job state');
  if (!legacy && root['schemaVersion'] !== JOB_STATE_SCHEMA_VERSION) throw new Error(`Unsupported persisted job state version: ${file}`);
  if (!Number.isSafeInteger(root['ownerPid']) || (root['ownerPid'] as number) <= 0) throw new Error(`Persisted owner pid is invalid: ${file}`);
  if (root['childPid'] !== null && (!Number.isSafeInteger(root['childPid']) || (root['childPid'] as number) <= 0)) throw new Error(`Persisted child pid is invalid: ${file}`);
  let childIdentity: OwnedProcessIdentity | null = null;
  if (!legacy && root['childIdentity'] !== null) {
    const identity = assertPlainObject(root['childIdentity'], 'Persisted child identity');
    assertExactKeys(identity, ['formatVersion', 'nonce', 'platform', 'creationId', 'executablePath'], 'Persisted child identity');
    if (
      identity['formatVersion'] !== 1
      || typeof identity['nonce'] !== 'string' || !/^[0-9a-f-]{36}$/.test(identity['nonce'])
      || (identity['platform'] !== 'win32-job' && identity['platform'] !== 'linux-proc' && identity['platform'] !== 'posix-ps')
      || typeof identity['creationId'] !== 'string' || identity['creationId'].length === 0 || identity['creationId'].length > 4096
      || typeof identity['executablePath'] !== 'string' || !path.isAbsolute(identity['executablePath'])
    ) throw new Error(`Persisted child identity is invalid: ${file}`);
    childIdentity = identity as unknown as OwnedProcessIdentity;
  }
  if (!legacy && (root['childPid'] === null) !== (childIdentity === null)) throw new Error(`Persisted child pid and identity must be present together: ${file}`);
  const record = assertPlainObject(root['record'], 'Persisted job record');
  assertExactKeys(record, [
    'runId', 'jobId', 'state', 'origin', 'cwd', 'command', 'args', 'timeoutMs', 'queuedAt', 'startedAt', 'finishedAt',
    'exitCode', 'signal', 'failureReason', 'output',
  ], 'Persisted job record');
  if (typeof record['runId'] !== 'string' || !RUN_ID.test(record['runId'])) throw new Error(`Persisted run id is invalid: ${file}`);
  if (!JOB_IDS.includes(record['jobId'] as JobId)) throw new Error(`Persisted job id is invalid: ${file}`);
  if (!['queued', 'running', 'passed', 'failed', 'timed-out', 'cancelled', 'interrupted'].includes(String(record['state']))) throw new Error(`Persisted job state is invalid: ${file}`);
  if (typeof record['cwd'] !== 'string' || typeof record['command'] !== 'string' || !Array.isArray(record['args']) || !record['args'].every((item) => typeof item === 'string')) throw new Error(`Persisted command is invalid: ${file}`);
  const origin = assertPlainObject(record['origin'], 'Persisted origin');
  assertExactKeys(origin, ['source', 'requestedBy', 'requestId', 'note', 'requestedAt'], 'Persisted origin');
  const output = assertPlainObject(record['output'], 'Persisted output');
  assertExactKeys(output, ['stdout', 'stderr', 'stdoutBytes', 'stderrBytes', 'stdoutTruncated', 'stderrTruncated'], 'Persisted output');
  if (typeof output['stdout'] !== 'string' || typeof output['stderr'] !== 'string' || !Number.isSafeInteger(output['stdoutBytes']) || (output['stdoutBytes'] as number) < 0 || !Number.isSafeInteger(output['stderrBytes']) || (output['stderrBytes'] as number) < 0 || typeof output['stdoutTruncated'] !== 'boolean' || typeof output['stderrTruncated'] !== 'boolean') throw new Error(`Persisted output is invalid: ${file}`);
  if (Buffer.byteLength(output['stdout'] as string, 'utf8') > (output['stdoutBytes'] as number) || Buffer.byteLength(output['stderr'] as string, 'utf8') > (output['stderrBytes'] as number)) throw new Error(`Persisted output byte counts are invalid: ${file}`);
  if (typeof origin['source'] !== 'string' || typeof origin['requestedAt'] !== 'string' || Number.isNaN(Date.parse(origin['requestedAt'] as string))) throw new Error(`Persisted origin is invalid: ${file}`);
  for (const field of ['requestedBy', 'requestId', 'note'] as const) if (origin[field] !== null && typeof origin[field] !== 'string') throw new Error(`Persisted origin ${field} is invalid: ${file}`);
  if (!Number.isSafeInteger(record['timeoutMs']) || (record['timeoutMs'] as number) <= 0 || typeof record['queuedAt'] !== 'string' || Number.isNaN(Date.parse(record['queuedAt'] as string))) throw new Error(`Persisted timing is invalid: ${file}`);
  for (const field of ['startedAt', 'finishedAt'] as const) if (record[field] !== null && (typeof record[field] !== 'string' || Number.isNaN(Date.parse(record[field] as string)))) throw new Error(`Persisted ${field} is invalid: ${file}`);
  if (record['exitCode'] !== null && !Number.isSafeInteger(record['exitCode'])) throw new Error(`Persisted exit code is invalid: ${file}`);
  if (record['signal'] !== null && typeof record['signal'] !== 'string') throw new Error(`Persisted signal is invalid: ${file}`);
  if (record['failureReason'] !== null && typeof record['failureReason'] !== 'string') throw new Error(`Persisted failure reason is invalid: ${file}`);
  const state = record['state'] as JobState;
  if (state === 'queued' && (root['childPid'] !== null || childIdentity !== null || record['startedAt'] !== null || record['finishedAt'] !== null)) throw new Error(`Queued persisted job has inconsistent lifecycle fields: ${file}`);
  if (state === 'running' && (root['childPid'] === null || (!legacy && childIdentity === null) || record['startedAt'] === null || record['finishedAt'] !== null)) throw new Error(`Running persisted job has inconsistent lifecycle fields: ${file}`);
  if (terminalState(state) && (root['childPid'] !== null || record['finishedAt'] === null)) throw new Error(`Terminal persisted job has inconsistent lifecycle fields: ${file}`);
  return { ...(root as unknown as PersistedJobState), schemaVersion: JOB_STATE_SCHEMA_VERSION, childIdentity };
}

function processTreeExists(pid: number): boolean {
  try { process.kill(process.platform === 'win32' ? pid : -pid, 0); return true; }
  catch (error) { return (error as NodeJS.ErrnoException).code !== 'ESRCH'; }
}

function processExists(pid: number): boolean {
  try { process.kill(pid, 0); return true; }
  catch (error) { return (error as NodeJS.ErrnoException).code !== 'ESRCH'; }
}

export function createJobRunner(options: JobRunnerOptions = {}): JobRunner {
  const now = options.now ?? (() => new Date());
  const queueTask = options.queueMicrotask ?? queueMicrotask;
  const scheduleTimeout = options.setTimeout ?? ((task, delay) => globalThis.setTimeout(task, delay));
  const clearScheduledTimeout = options.clearTimeout ?? ((handle) => globalThis.clearTimeout(handle as ReturnType<typeof globalThis.setTimeout>));
  const spawn = options.spawn;
  const killProcessTree = options.killProcessTree ?? defaultKillProcessTree;
  const maxOutputBytes = assertPositiveInteger(options.maxOutputBytes ?? JOB_OUTPUT_LIMIT_BYTES, 'maxOutputBytes');
  const maxHistory = assertPositiveInteger(options.maxHistory ?? JOB_HISTORY_LIMIT, 'maxHistory');
  const closeConfirmationMs = assertPositiveInteger(options.closeConfirmationMs ?? JOB_CLOSE_CONFIRMATION_MS, 'closeConfirmationMs');
  const idFactory = options.idFactory ?? (() => crypto.randomUUID());
  const mutationRepoRoot = path.resolve(options.mutationRepoRoot ?? JOB_RUNNER_REPO_CWD);
  const repoCwd = path.resolve(options.repoCwd ?? JOB_RUNNER_REPO_CWD);
  const definitions = options.definitions ?? JOB_DEFINITIONS;
  const captureProcessIdentity = options.captureProcessIdentity ?? defaultCaptureProcessIdentity;
  const recoverPersistedProcess = options.recoverPersistedProcess ?? defaultRecoverPersistedProcess;
  const persistenceOwnerPid = assertPositiveInteger(options.persistenceOwnerPid ?? process.pid, 'persistenceOwnerPid');
  const withRepositoryLock = options.withRepositoryLock ?? (
    <T>(task: () => T | Promise<T>) => withMutationJournalLock(mutationRepoRoot, task)
  );
  const stateDirectory = ensureStateDirectory(options.stateDirectory ?? path.join(mutationRepoRoot, 'workbench', '.state', 'jobs'));
  const jobEnv = buildJobEnvironment();
  const runs = new Map<string, MutableRun>();
  let activeRunId: string | null = null;
  let accepting = true;

  function isoNow(): string { return now().toISOString(); }

  function pruneHistory(): void {
    while (runs.size > maxHistory + (activeRunId === null ? 0 : 1)) {
      const candidate = [...runs.values()].find((run) => run.runId !== activeRunId && run.settled);
      if (candidate === undefined) return;
      runs.delete(candidate.runId);
      try {
        unlinkSync(stateFile(stateDirectory, candidate.runId));
        syncDirectory(stateDirectory);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }
  }

  function clearTimers(run: MutableRun): void {
    if (run.timerHandle !== null) clearScheduledTimeout(run.timerHandle);
    if (run.closeConfirmationHandle !== null) clearScheduledTimeout(run.closeConfirmationHandle);
    run.timerHandle = null;
    run.closeConfirmationHandle = null;
  }

  function publishTerminal(run: MutableRun, state: TerminalJobState): void {
    if (run.settled) return;
    run.settled = true;
    run.state = state;
    run.finishedAt = isoNow();
    run.persistedChildPid = null;
    run.persistedChildIdentity = null;
    clearTimers(run);
    persistState(stateDirectory, persistenceOwnerPid, run);
    if (activeRunId === run.runId) activeRunId = null;
    const snapshot = snapshotOf(run);
    run.resolve(snapshot);
    pruneHistory();
  }

  function signalProcessResult(run: MutableRun, state: TerminalJobState): void {
    if (run.terminalRequested !== null) return;
    run.terminalRequested = state;
    clearTimers(run);
    run.resolveProcess(state);
  }

  function bindOutput(stream: JobOutputStream | null, target: OutputAccumulator): void {
    stream?.on('data', (chunk) => appendOutput(target, chunk));
  }

  function requestStop(run: MutableRun, reason: JobStopReason): void {
    if (run.settled || run.stopReason !== null) return;
    run.stopReason = reason;
    run.failureReason = reason === 'timed-out' ? `Job exceeded timeout of ${run.timeoutMs}ms.` : 'Job cancelled by request.';
    if (run.child === null) {
      signalProcessResult(run, reason);
      persistState(stateDirectory, persistenceOwnerPid, run);
      return;
    }
    run.closeConfirmationHandle = scheduleTimeout(() => {
      run.processError = true;
      run.failureReason = `${run.failureReason ?? 'Job stop requested.'} Process close was not confirmed within ${closeConfirmationMs}ms; admission remains locked.`;
      persistState(stateDirectory, persistenceOwnerPid, run);
    }, closeConfirmationMs);
    void killProcessTree(run.child.pid).catch((error: unknown) => {
      if (!run.settled) {
        run.processError = true;
        run.failureReason = `Failed to stop process tree: ${formatError(error)}. Admission remains locked until close is observed.`;
        persistState(stateDirectory, persistenceOwnerPid, run);
      }
    });
  }

  async function startLocked(run: MutableRun): Promise<TerminalJobState> {
    if (run.terminalRequested !== null) return run.terminalRequested;
    if (run.settled || activeRunId !== run.runId) return 'interrupted';
    let child: JobChildProcess;
    const nonce = randomUUID();
    try {
      child = spawn === undefined
        ? await ownedSpawn(run.definition.command, run.definition.args, { cwd: repoCwd, env: jobEnv, detached: process.platform !== 'win32', stdio: JOB_STDIO }, nonce)
        : spawn(run.definition.command, run.definition.args, { cwd: repoCwd, env: jobEnv, detached: process.platform !== 'win32', stdio: JOB_STDIO });
    } catch (error) {
      run.failureReason = `Failed to spawn job: ${formatError(error)}.`;
      signalProcessResult(run, 'failed');
      return run.processResult;
    }
    run.child = child;
    bindOutput(run.child.stdout, run.stdout);
    bindOutput(run.child.stderr, run.stderr);
    run.child.on('error', (error) => {
      if (!run.settled) {
        run.processError = true;
        run.failureReason = `Job process error: ${formatError(error)}. Admission remains locked until close is observed.`;
        persistState(stateDirectory, persistenceOwnerPid, run);
      }
    });
    run.child.on('close', (code, signal) => {
      run.exitCode = code;
      run.signal = signal;
      run.child = null;
      if (run.processError) signalProcessResult(run, 'failed');
      else if (run.stopReason === 'timed-out') signalProcessResult(run, 'timed-out');
      else if (run.stopReason === 'cancelled') signalProcessResult(run, 'cancelled');
      else if (code === 0) signalProcessResult(run, 'passed');
      else {
        run.failureReason = run.failureReason ?? `Job exited with code ${code ?? 'null'}.`;
        signalProcessResult(run, 'failed');
      }
    });
    let identity: OwnedProcessIdentity;
    try {
      const captured = captureProcessIdentity(child.pid, nonce);
      identity = captured instanceof Promise ? await captured : captured;
    } catch (error) {
      if (run.terminalRequested !== null) return run.terminalRequested;
      run.processError = true;
      run.failureReason = `Failed to bind owned process identity: ${formatError(error)}.`;
      void killProcessTree(child.pid).catch((killError: unknown) => {
        run.failureReason = `${run.failureReason} Failed to stop unbound process: ${formatError(killError)}.`;
      });
      return run.processResult;
    }
    if (run.terminalRequested !== null) return run.terminalRequested;
    run.persistedChildPid = child.pid;
    run.persistedChildIdentity = identity;
    run.state = 'running';
    run.startedAt = isoNow();
    persistState(stateDirectory, persistenceOwnerPid, run);
    run.timerHandle = scheduleTimeout(() => requestStop(run, 'timed-out'), run.timeoutMs);
    return run.processResult;
  }

  async function start(run: MutableRun): Promise<void> {
    let outcome: TerminalJobState;
    try {
      outcome = await withRepositoryLock(() => startLocked(run));
    } catch (error) {
      run.failureReason = `Could not acquire repository mutation lock: ${formatError(error)}.`;
      outcome = 'failed';
    }
    publishTerminal(run, outcome);
  }

  function restoreRun(persisted: PersistedJobState): MutableRun {
    const record = persisted.record;
    let resolveResult!: (value: JobRecord) => void;
    let resolveProcess!: (value: TerminalJobState) => void;
    const result = new Promise<JobRecord>((resolve) => { resolveResult = resolve; });
    const processResult = new Promise<TerminalJobState>((resolve) => { resolveProcess = resolve; });
    const stdoutBytes = Buffer.from(record.output.stdout, 'utf8');
    const stderrBytes = Buffer.from(record.output.stderr, 'utf8');
    const run: MutableRun = {
      runId: record.runId, jobId: record.jobId, origin: record.origin,
      definition: { command: record.command, args: record.args, defaultTimeoutMs: record.timeoutMs, maxTimeoutMs: record.timeoutMs },
      cwd: record.cwd, timeoutMs: record.timeoutMs, queuedAt: record.queuedAt, startedAt: record.startedAt, finishedAt: record.finishedAt,
      state: record.state, exitCode: record.exitCode, signal: record.signal, failureReason: record.failureReason,
      stdout: { maxBytes: maxOutputBytes, totalBytes: record.output.stdoutBytes, storedBytes: stdoutBytes.length, truncated: record.output.stdoutTruncated, chunks: [stdoutBytes] },
      stderr: { maxBytes: maxOutputBytes, totalBytes: record.output.stderrBytes, storedBytes: stderrBytes.length, truncated: record.output.stderrTruncated, chunks: [stderrBytes] },
      result, resolve: resolveResult, processResult, resolveProcess, child: null, persistedChildPid: persisted.childPid,
      persistedChildIdentity: persisted.childIdentity,
      timerHandle: null, closeConfirmationHandle: null, stopReason: null, terminalRequested: terminalState(record.state) ? record.state : null,
      processError: false, settled: terminalState(record.state),
    };
    if (run.settled) { resolveResult(snapshotOf(run)); resolveProcess(record.state as TerminalJobState); }
    return run;
  }

  const activePersisted: { run: MutableRun; ownerPid: number }[] = [];
  const persistedStates: { readonly name: string; readonly persisted: PersistedJobState }[] = [];
  for (const name of readdirSync(stateDirectory).sort()) {
    const file = path.join(stateDirectory, name);
    const temporaryMatch = JOB_STATE_TEMP.exec(name);
    if (temporaryMatch !== null) {
      const stats = lstatSync(file);
      if (!stats.isFile() || stats.isSymbolicLink()) throw new Error(`Job state temporary must be a regular file: ${name}`);
      if (processExists(Number(temporaryMatch[1]))) throw new Error(`Job state is being published by active process ${temporaryMatch[1]}.`);
      unlinkSync(file);
      continue;
    }
    if (!JOB_STATE_FILE.test(name)) throw new Error(`Unexpected job state filename: ${name}`);
    persistedStates.push({ name, persisted: parsePersistedState(file) });
  }
  syncDirectory(stateDirectory);
  persistedStates.sort((left, right) => left.persisted.record.queuedAt.localeCompare(right.persisted.record.queuedAt) || left.persisted.record.runId.localeCompare(right.persisted.record.runId));
  for (const { name, persisted } of persistedStates) {
    if (`${persisted.record.runId}.json` !== name) throw new Error(`Persisted job filename does not match its run id: ${name}`);
    const run = restoreRun(persisted);
    if (runs.has(run.runId)) throw new Error(`Duplicate persisted job run id: ${run.runId}`);
    runs.set(run.runId, run);
    if (!run.settled) activePersisted.push({ run, ownerPid: persisted.ownerPid });
  }
  if (activePersisted.length > 1) throw new Error('Multiple persisted jobs claim active repository admission.');
  if (activePersisted.length === 1) activeRunId = activePersisted[0]!.run.runId;
  pruneHistory();

  const recovery = (async () => {
    const candidate = activePersisted[0];
    if (candidate === undefined) return;
    const { run, ownerPid } = candidate;
    if (processExists(ownerPid)) throw new Error(`Persisted job ${run.runId} is owned by active workbench process ${ownerPid}.`);
    const recoveryOutcome = await withRepositoryLock(async (): Promise<'terminated' | 'missing' | 'unproven'> => {
      if (run.persistedChildPid !== null && processTreeExists(run.persistedChildPid)) {
        const outcome = run.persistedChildIdentity === null
          ? 'unproven'
          : await recoverPersistedProcess(run.persistedChildPid, run.persistedChildIdentity);
        if (outcome === 'terminated') {
          const deadline = Date.now() + closeConfirmationMs;
          while (processTreeExists(run.persistedChildPid) && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 25));
          if (processTreeExists(run.persistedChildPid)) throw new Error(`Interrupted job ${run.runId} owned process tree could not be confirmed stopped.`);
        }
        return outcome;
      }
      return 'missing';
    });
    run.failureReason = recoveryOutcome === 'unproven'
      ? 'Interrupted by a prior workbench process; persisted child ownership could not be proven, so the live PID was left untouched.'
      : recoveryOutcome === 'terminated'
        ? 'Interrupted by a prior workbench process; its identity-verified owned process tree was stopped during startup recovery.'
        : 'Interrupted by a prior workbench process; its persisted owned process was already absent.';
    publishTerminal(run, 'interrupted');
  })();

  return {
    ready: () => recovery,
    enqueue(request: JobRequest): JobHandle {
      if (!accepting) throw new Error('The job runner is shutting down and is not accepting checks.');
      if (activePersisted.length > 0 && activeRunId !== null && !runs.get(activeRunId)!.settled) throw new Error('Persisted job recovery is still in progress.');
      if (activeRunId !== null) throw new Error('A repository check is already active or awaiting process-close confirmation.');
      const queuedAt = isoNow();
      const normalized = normalizeRequest(request, queuedAt);
      const runId = assertString(idFactory(), 'runId', 128, RUN_ID);
      if (runs.has(runId)) throw new Error(`Duplicate job run id: ${runId}.`);
      let resolveResult!: (record: JobRecord) => void;
      let resolveProcess!: (state: TerminalJobState) => void;
      const result = new Promise<JobRecord>((resolve) => { resolveResult = resolve; });
      const processResult = new Promise<TerminalJobState>((resolve) => { resolveProcess = resolve; });
      const run: MutableRun = {
        runId, jobId: normalized.jobId, origin: normalized.origin, definition: definitions[normalized.jobId], cwd: repoCwd, timeoutMs: normalized.timeoutMs,
        queuedAt, startedAt: null, finishedAt: null, state: 'queued', exitCode: null, signal: null, failureReason: null,
        stdout: createAccumulator(maxOutputBytes), stderr: createAccumulator(maxOutputBytes), result, resolve: resolveResult, processResult, resolveProcess,
        child: null, persistedChildPid: null, persistedChildIdentity: null, timerHandle: null, closeConfirmationHandle: null, stopReason: null,
        terminalRequested: null, processError: false, settled: false,
      };
      runs.set(runId, run);
      activeRunId = runId;
      try { persistState(stateDirectory, persistenceOwnerPid, run); }
      catch (error) {
        activeRunId = null;
        runs.delete(runId);
        throw error;
      }
      queueTask(() => { void start(run); });
      return Object.freeze({
        runId,
        snapshot: () => snapshotOf(run),
        cancel: () => {
          if (run.settled) return false;
          if (run.state === 'queued') run.failureReason = 'Job cancelled before start.';
          requestStop(run, 'cancelled');
          return true;
        },
        result,
      });
    },
    cancel(runId: string): boolean {
      const run = runs.get(runId);
      if (run === undefined || run.settled) return false;
      if (run.state === 'queued') run.failureReason = 'Job cancelled before start.';
      requestStop(run, 'cancelled');
      return true;
    },
    get(runId: string): JobRecord | null {
      const run = runs.get(runId);
      return run === undefined ? null : snapshotOf(run);
    },
    getActive(): JobRecord | null {
      return activeRunId === null ? null : snapshotOf(runs.get(activeRunId)!);
    },
    list(): readonly JobRecord[] {
      return [...runs.values()].map(snapshotOf);
    },
    async shutdown(): Promise<boolean> {
      accepting = false;
      const runIdBeforeRecovery = activePersisted.length === 0 ? activeRunId : null;
      if (runIdBeforeRecovery !== null) this.cancel(runIdBeforeRecovery);
      await recovery;
      const runId = runIdBeforeRecovery ?? activeRunId;
      if (runId === null) return true;
      if (runIdBeforeRecovery === null) this.cancel(runId);
      const deadline = Date.now() + closeConfirmationMs + 1_000;
      while (activeRunId === runId && Date.now() < deadline) {
        await new Promise((resolve) => globalThis.setTimeout(resolve, 25));
      }
      return activeRunId !== runId;
    },
  };
}

export function createJobRunId(seed: string): string {
  if (!POSITIVE_INTEGER.test(seed)) throw new Error('Job run id seed must be a positive integer string.');
  return `job-${seed}`;
}
