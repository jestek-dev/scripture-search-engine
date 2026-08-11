import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { constants, rmSync } from 'node:fs';
import {
  lstat,
  mkdtemp,
  mkdir,
  open,
  readFile,
  readdir,
  realpath,
  rename,
  rmdir,
  unlink,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

export const APPLY_JOURNAL_SCHEMA_VERSION = 2 as const;

export type AfterAction =
  | { readonly kind: 'bytes'; readonly base64: string }
  | { readonly kind: 'delete' };

export interface MutationPlanEntry {
  readonly path: string;
  readonly beforeSha256: string | null;
  readonly after: AfterAction;
}

export interface MutationPlan {
  readonly schemaVersion: typeof APPLY_JOURNAL_SCHEMA_VERSION;
  readonly mutations: readonly MutationPlanEntry[];
  readonly digest: string;
}

export type MutationAfterInput =
  | Uint8Array
  | string
  | null
  | { readonly kind: 'bytes'; readonly base64: string }
  | { readonly kind: 'delete' };

export interface MutationInput {
  readonly path: string;
  readonly beforeSha256?: string | null;
  readonly after: MutationAfterInput;
}

export type ApplyPhase =
  | 'validated'
  | 'journal-created'
  | 'staged'
  | 'backed-up'
  | 'commit-marked'
  | 'file-replaced'
  | 'committed'
  | 'recovered-before'
  | 'recovered-after';

export interface ApplyOptions {
  /** Journal storage is fixed to workbench/.state/journals. */
  readonly journalDirectory?: string;
  readonly operationId?: string;
  readonly onPhase?: (phase: ApplyPhase, operationId: string) => void | Promise<void>;
  /** Test and fault-injection hook. The exception is deliberately not cleaned up. */
  readonly crashAt?: ApplyPhase;
}

export interface ApplyResult {
  readonly operationId: string;
  readonly digest: string;
  readonly paths: readonly string[];
  readonly afterSha256: readonly { readonly path: string; readonly sha256: string | null }[];
}

export interface LockedApplyValidation {
  /** Runs after journal recovery while the mutation lock is held. */
  readonly beforeApply: (scope: MutationJournalReadScope) => 'apply' | 'skip' | Promise<'apply' | 'skip'>;
  /** Runs after the all-after state is durable and while the same lock is held. */
  readonly afterCommit?: (scope: MutationJournalReadScope) => void | Promise<void>;
  /** Test-only scheduling hook for path replacement race coverage. */
  readonly onReadPhase?: MutationJournalReadOptions['onReadPhase'];
  /** Bounded wait used by idempotent publishers contending for this lock. */
  readonly waitTimeoutMs?: number;
}

export type MutationJournalReadPhase =
  | 'path-validated'
  | 'handle-opened'
  | 'pre-read-validated'
  | 'post-read-validated';

export interface MutationJournalReadOptions {
  readonly waitTimeoutMs?: number;
  /** Test-only scheduling hook. Production callers should leave this unset. */
  readonly onReadPhase?: (phase: MutationJournalReadPhase, relativePath: string) => void | Promise<void>;
}

export interface MutationJournalReadScope {
  /** Read a confined regular file from its already-opened, identity-verified handle. */
  readFile(relativePath: string, expectedSha256?: string | null): Promise<Buffer | null>;
}

export type LockedApplyResult =
  | { readonly status: 'APPLIED'; readonly result: ApplyResult }
  | { readonly status: 'SKIPPED' };

export interface RecoveryResult {
  readonly recovered: readonly { readonly operationId: string; readonly outcome: 'before' | 'after' }[];
}

export class ApplyJournalError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApplyJournalError';
    this.code = code;
  }
}

export class InjectedCrashError extends Error {
  readonly phase: ApplyPhase;
  readonly operationId: string;

  constructor(phase: ApplyPhase, operationId: string) {
    super(`Injected crash at apply phase ${phase} for operation ${operationId}.`);
    this.name = 'InjectedCrashError';
    this.phase = phase;
    this.operationId = operationId;
  }
}

interface JournalEntry extends MutationPlanEntry {
  readonly stageName: string | null;
  readonly stageSha256: string | null;
  readonly backupName: string | null;
  readonly backupSha256: string | null;
}

interface Journal {
  readonly schemaVersion: typeof APPLY_JOURNAL_SCHEMA_VERSION;
  readonly operationId: string;
  readonly plan: MutationPlan;
  readonly entries: readonly JournalEntry[];
  readonly state: 'prepared' | 'committing' | 'committed';
}

interface JournalLayout {
  readonly root: string;
  readonly stateDirectory: string;
  readonly journalDirectory: string;
  readonly lockDirectory: string;
  readonly lockFile: string;
}

interface LockOwner {
  readonly schemaVersion: 1;
  readonly ownerId: string;
  readonly pid: number;
  readonly createdAtMs: number;
}

interface HeldLock {
  readonly file: string;
  readonly owner: LockOwner;
  readonly handle: Awaited<ReturnType<typeof open>>;
  readonly identity?: FileIdentity;
}

interface RecoveryWork {
  readonly journal: Journal;
  readonly outcome: 'before' | 'after';
}

const SHA256 = /^[a-f0-9]{64}$/;
const OPERATION_ID = /^[0-9a-f-]{36}$/;
const JOURNAL_NAME = /^[0-9a-f-]{36}\.json$/;
const JOURNAL_NAME_ALIAS = /^[0-9a-f-]{36}\.json$/i;
const ARTIFACT_DIRECTORY = /^[0-9a-f-]{36}\.(staging|backups)$/;
const ARTIFACT_DIRECTORY_ALIAS = /^[0-9a-f-]{36}\.(staging|backups)$/i;
const JOURNAL_TEMP = /^[0-9a-f-]{36}\.json\.[0-9a-f-]{36}\.tmp$/;
const JOURNAL_TEMP_ALIAS = /^[0-9a-f-]{36}\.json\.[0-9a-f-]{36}\.tmp$/i;
const ARTIFACT_TEMP = /^\d+\.(?:bin|bak)\.[0-9a-f-]{36}\.tmp$/;
const WINDOWS_DEVICE_NAME = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;
const LOCK_FILE_NAME = 'mutation-apply.lock';
const RECLAIM_GUARD_NAME = 'mutation-apply.reclaim-guard';
const LOCK_STALE_AFTER_MS = 5 * 60 * 1000;
const TEST_SYNC_FAILURE_ENV = 'SCRIPTURE_APPLY_JOURNAL_TEST_SYNC_FAILURE';
const TEST_RECLAIM_PAUSE_DIR_ENV = 'SCRIPTURE_APPLY_JOURNAL_TEST_RECLAIM_PAUSE_DIR';
const TEST_GUARD_RACE_PAUSE_DIR_ENV = 'SCRIPTURE_APPLY_JOURNAL_TEST_GUARD_RACE_PAUSE_DIR';
const TEST_GUARD_PUBLISH_PAUSE_DIR_ENV = 'SCRIPTURE_APPLY_JOURNAL_TEST_GUARD_PUBLISH_PAUSE_DIR';
const TEST_GUARD_WITHDRAW_PAUSE_DIR_ENV = 'SCRIPTURE_APPLY_JOURNAL_TEST_GUARD_WITHDRAW_PAUSE_DIR';
const TEST_GUARD_SYNC_FAILURE_ENV = 'SCRIPTURE_APPLY_JOURNAL_TEST_GUARD_SYNC_FAILURE';
const TEST_TARGET_TEMP_PAUSE_DIR_ENV = 'SCRIPTURE_APPLY_JOURNAL_TEST_TARGET_TEMP_PAUSE_DIR';
const execFileAsync = promisify(execFile);
const WINDOWS_MOVE_HELPER_SOURCE = `
using System;
using System.Runtime.InteropServices;
public static class Program {
  [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
  private static extern bool MoveFileEx(string source, string target, int flags);
  public static int Main(string[] args) {
    if (args.Length != 2) return 64;
    if (MoveFileEx(args[0], args[1], 9)) return 0;
    Console.Error.WriteLine("MoveFileEx WRITE_THROUGH failed with Win32 error " + Marshal.GetLastWin32Error());
    return 1;
  }
}`;
let windowsMoveHelperPromise: Promise<string> | null = null;

function fail(code: string, message: string): never {
  throw new ApplyJournalError(code, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[], label: string, code: string): void {
  const allowed = new Set(keys);
  for (const key of keys) {
    if (!Object.hasOwn(value, key)) fail(code, `${label} is missing required field ${key}.`);
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail(code, `${label} has unknown field ${key}.`);
  }
}

function canonical(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('invalid_plan', 'Plan contains a non-finite number.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (!isRecord(value)) fail('invalid_plan', 'Plan contains a non-JSON value.');
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
}

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function digestInput(plan: Pick<MutationPlan, 'schemaVersion' | 'mutations'>): string {
  return sha256(Buffer.from(canonical({ schemaVersion: plan.schemaVersion, mutations: plan.mutations }), 'utf8'));
}

function pathKey(relativePath: string): string {
  // Rejecting Windows-only aliases keeps plans portable even when authored elsewhere.
  return relativePath.toLocaleLowerCase('en-US');
}

function normalizeBefore(value: unknown, code: string, label: string, allowUndefined = false): string | null | undefined {
  if (value === undefined && allowUndefined) return undefined;
  if (value !== null && (typeof value !== 'string' || !SHA256.test(value))) {
    fail(code, `${label} must be null or a lowercase SHA-256 digest.`);
  }
  return value as string | null;
}

function normalizeAfter(value: MutationAfterInput | unknown, code: string, label: string): AfterAction {
  if (value === null) return { kind: 'delete' };
  if (value instanceof Uint8Array) return { kind: 'bytes', base64: Buffer.from(value).toString('base64') };
  if (typeof value === 'string') return { kind: 'bytes', base64: Buffer.from(value, 'utf8').toString('base64') };
  if (!isRecord(value)) fail(code, `${label} must be bytes or delete.`);
  if (value.kind === 'delete') {
    hasExactKeys(value, ['kind'], label, code);
    return { kind: 'delete' };
  }
  if (value.kind !== 'bytes') fail(code, `${label} has an unknown action kind.`);
  hasExactKeys(value, ['kind', 'base64'], label, code);
  if (typeof value.base64 !== 'string') fail(code, `${label} byte payload must be a base64 string.`);
  const bytes = Buffer.from(value.base64, 'base64');
  if (bytes.toString('base64') !== value.base64) fail(code, `${label} byte payload is not canonical base64.`);
  return { kind: 'bytes', base64: value.base64 };
}

function afterSha256(after: AfterAction): string | null {
  return after.kind === 'bytes' ? sha256(Buffer.from(after.base64, 'base64')) : null;
}

/** Validate a portable repo-relative mutation path without touching the filesystem. */
export function validateRepoRelativePath(relativePath: string): string {
  if (typeof relativePath !== 'string' || relativePath.length === 0 || relativePath.includes('\0')) {
    fail('path_invalid', 'Mutation paths must be non-empty repo-relative strings.');
  }
  if (relativePath.includes('\\') || path.posix.isAbsolute(relativePath) || /^[a-zA-Z]:/.test(relativePath)) {
    fail('path_invalid', `Mutation path is not a portable repo-relative path: ${relativePath}`);
  }
  const normalized = path.posix.normalize(relativePath);
  if (normalized === '.' || normalized === '..' || normalized.startsWith('../') || normalized.includes('/../') || normalized !== relativePath) {
    fail('path_invalid', `Mutation path must be normalized and repo-relative: ${relativePath}`);
  }
  for (const segment of normalized.split('/')) {
    if (segment.length === 0 || /[<>:"|?*\u0000-\u001f]/.test(segment) || segment.endsWith('.') || segment.endsWith(' ') || WINDOWS_DEVICE_NAME.test(segment)) {
      fail('path_invalid', `Mutation path is unsafe on Windows: ${relativePath}`);
    }
  }
  const key = pathKey(normalized);
  if (key === 'workbench/.state' || key.startsWith('workbench/.state/')) {
    fail('path_reserved', `Mutation path is reserved for journal state: ${relativePath}`);
  }
  return normalized;
}

function parseMutation(raw: unknown, index: number, code: string): MutationPlanEntry {
  if (!isRecord(raw)) fail(code, `Mutation ${index} must be an object.`);
  hasExactKeys(raw, ['path', 'beforeSha256', 'after'], `Mutation ${index}`, code);
  if (typeof raw.path !== 'string') fail(code, `Mutation ${index} path must be a string.`);
  let mutationPath: string;
  try {
    mutationPath = validateRepoRelativePath(raw.path);
  } catch (error) {
    if (code === 'journal_invalid' && error instanceof ApplyJournalError) {
      fail('journal_invalid', `Journal mutation ${index} has an invalid path.`);
    }
    throw error;
  }
  return {
    path: mutationPath,
    beforeSha256: normalizeBefore(raw.beforeSha256, code, `Mutation ${index} beforeSha256`) as string | null,
    after: normalizeAfter(raw.after, code, `Mutation ${index} after`),
  };
}

function parsePlan(value: unknown, code: string): MutationPlan {
  if (!isRecord(value)) fail(code, 'Mutation plan must be an object.');
  hasExactKeys(value, ['schemaVersion', 'mutations', 'digest'], 'Mutation plan', code);
  if (value.schemaVersion !== APPLY_JOURNAL_SCHEMA_VERSION) fail(code, 'Unsupported mutation plan version.');
  if (!Array.isArray(value.mutations)) fail(code, 'Mutation plan mutations must be an array.');
  if (typeof value.digest !== 'string' || !SHA256.test(value.digest)) fail(code, 'Mutation plan digest is invalid.');
  const seen = new Set<string>();
  const mutations = value.mutations.map((mutation, index) => {
    const parsed = parseMutation(mutation, index, code);
    const key = pathKey(parsed.path);
    if (seen.has(key)) fail(code, `Mutation path is repeated or aliases another path: ${parsed.path}`);
    seen.add(key);
    return parsed;
  });
  const plan: MutationPlan = {
    schemaVersion: APPLY_JOURNAL_SCHEMA_VERSION,
    mutations,
    digest: value.digest,
  };
  if (digestInput(plan) !== plan.digest) fail(code, 'Mutation plan digest does not match its canonical contents.');
  return plan;
}

export function digestMutationPlan(plan: Pick<MutationPlan, 'schemaVersion' | 'mutations'>): string {
  if (!isRecord(plan)) fail('invalid_plan', 'Mutation plan must be an object.');
  const content = { ...plan, digest: '0'.repeat(64) };
  return parsePlan({ ...content, digest: digestInput(content) }, 'invalid_plan').digest;
}

export function validateMutationPlan(plan: unknown): MutationPlan {
  return parsePlan(plan, 'invalid_plan');
}

async function realRepoRoot(repoRoot: string): Promise<string> {
  const root = path.resolve(repoRoot);
  let stats;
  try {
    stats = await lstat(root);
  } catch {
    fail('repo_invalid', `Repository root does not exist: ${repoRoot}`);
  }
  if (!stats.isDirectory() || stats.isSymbolicLink()) fail('repo_invalid', 'Repository root must be a real directory.');
  return realpath(root);
}

function inside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function sameFilesystemPath(left: string, right: string): boolean {
  const normalizedLeft = path.resolve(left);
  const normalizedRight = path.resolve(right);
  return process.platform === 'win32'
    ? normalizedLeft.toLocaleLowerCase('en-US') === normalizedRight.toLocaleLowerCase('en-US')
    : normalizedLeft === normalizedRight;
}

async function assertNoSymlinkPath(root: string, candidate: string, allowMissingFinal: boolean): Promise<void> {
  let rootStats;
  try {
    rootStats = await lstat(root);
  } catch {
    fail('repo_invalid', 'Repository root disappeared during the mutation transaction.');
  }
  if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) {
    fail('path_escape', 'Repository root was replaced during the mutation transaction.');
  }
  if (!sameFilesystemPath(await realpath(root), root)) {
    fail('path_escape', 'Repository root no longer resolves to its locked path.');
  }
  const absolute = path.resolve(candidate);
  if (!inside(root, absolute)) fail('path_escape', `Path escapes the repository: ${candidate}`);
  const relative = path.relative(root, absolute);
  const parts = relative === '' ? [] : relative.split(path.sep);
  let current = root;
  for (let index = 0; index < parts.length; index += 1) {
    current = path.join(current, parts[index]!);
    try {
      const stats = await lstat(current);
      if (stats.isSymbolicLink()) fail('path_escape', `Symlink path component is not allowed: ${candidate}`);
      if (index < parts.length - 1 && !stats.isDirectory()) fail('path_invalid', `Parent is not a directory: ${candidate}`);
      if (index === parts.length - 1 && !allowMissingFinal && !stats.isFile() && !stats.isDirectory()) {
        fail('path_invalid', `Path is neither a regular file nor directory: ${candidate}`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT' && (allowMissingFinal || index < parts.length - 1)) continue;
      throw error;
    }
  }
}

async function ensureSafeDirectory(root: string, directory: string, label: string): Promise<void> {
  if (!inside(root, directory)) fail('path_escape', `${label} must be inside the repository.`);
  await assertNoSymlinkPath(root, directory, true);
  await mkdir(directory, { recursive: true });
  await assertNoSymlinkPath(root, directory, false);
  const stats = await lstat(directory);
  if (!stats.isDirectory() || stats.isSymbolicLink()) fail('path_invalid', `${label} must be a real directory.`);
  await syncDirectory(directory);
  if (inside(root, path.dirname(directory))) await syncDirectory(path.dirname(directory));
}

async function safeTarget(root: string, relativePath: string, allowMissing: boolean): Promise<string> {
  const normalized = validateRepoRelativePath(relativePath);
  const target = path.resolve(root, ...normalized.split('/'));
  await assertNoSymlinkPath(root, target, allowMissing);
  return target;
}

async function captureDirectoryIdentity(directory: string, label: string): Promise<FileIdentity> {
  let stats;
  try {
    stats = await lstat(directory);
  } catch {
    fail('path_escape', `${label} disappeared while the mutation lock was held.`);
  }
  if (!stats.isDirectory() || stats.isSymbolicLink() || !sameFilesystemPath(await realpath(directory), directory)) {
    fail('path_escape', `${label} was replaced while the mutation lock was held.`);
  }
  return { dev: stats.dev, ino: stats.ino };
}

async function assertDirectoryIdentity(directory: string, expected: FileIdentity, label: string): Promise<void> {
  const actual = await captureDirectoryIdentity(directory, label);
  if (!sameFileIdentity(actual, expected)) fail('path_escape', `${label} identity changed while the mutation lock was held.`);
}

async function readLockedFile(
  root: string,
  rootIdentity: FileIdentity,
  relativePath: string,
  expectedSha256: string | null | undefined,
  onReadPhase: MutationJournalReadOptions['onReadPhase'],
): Promise<Buffer | null> {
  const normalized = validateRepoRelativePath(relativePath);
  await assertDirectoryIdentity(root, rootIdentity, 'Repository root');
  const target = await safeTarget(root, normalized, true);
  let before;
  try {
    before = await lstat(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    await assertDirectoryIdentity(root, rootIdentity, 'Repository root');
    await assertNoSymlinkPath(root, path.dirname(target), true);
    if (expectedSha256 !== undefined && expectedSha256 !== null) {
      fail('read_precondition', `Locked file is missing at ${normalized}.`);
    }
    return null;
  }
  if (!before.isFile() || before.isSymbolicLink()) fail('path_escape', `Locked path is not a confined regular file: ${normalized}`);
  await onReadPhase?.('path-validated', normalized);
  await assertDirectoryIdentity(root, rootIdentity, 'Repository root');

  const noFollow = 'O_NOFOLLOW' in constants ? constants.O_NOFOLLOW : 0;
  let handle;
  try {
    handle = await open(target, constants.O_RDONLY | noFollow);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') fail('path_escape', `Locked path changed before open: ${normalized}`);
    throw error;
  }
  try {
    const opened = await handle.stat();
    if (!opened.isFile() || !sameFileIdentity(opened, before)) fail('path_escape', `Locked path identity changed while opening: ${normalized}`);
    await onReadPhase?.('handle-opened', normalized);

    const validateOpenedPath = async (): Promise<void> => {
      await assertDirectoryIdentity(root, rootIdentity, 'Repository root');
      await assertNoSymlinkPath(root, target, false);
      if (!sameFilesystemPath(await realpath(target), target)) fail('path_escape', `Locked path resolves outside its expected location: ${normalized}`);
      const current = await lstat(target);
      if (!current.isFile() || current.isSymbolicLink() || !sameFileIdentity(current, opened)) {
        fail('path_escape', `Locked path identity changed while reading: ${normalized}`);
      }
      const handleNow = await handle.stat();
      if (!handleNow.isFile() || !sameFileIdentity(handleNow, opened)) fail('path_escape', `Locked handle identity changed: ${normalized}`);
    };

    await validateOpenedPath();
    await onReadPhase?.('pre-read-validated', normalized);
    // The hook may replace an already validated directory. Recheck before any bytes are read.
    await validateOpenedPath();
    const bytes = await handle.readFile();
    await validateOpenedPath();
    await onReadPhase?.('post-read-validated', normalized);
    await validateOpenedPath();
    if (expectedSha256 !== undefined) {
      const actual = sha256(bytes);
      if (expectedSha256 === null || actual !== expectedSha256) {
        fail('read_precondition', `Locked file digest does not match at ${normalized}.`);
      }
    }
    return bytes;
  } finally {
    await handle.close();
  }
}

async function createMutationJournalReadScope(
  root: string,
  onReadPhase?: MutationJournalReadOptions['onReadPhase'],
): Promise<MutationJournalReadScope> {
  const rootIdentity = await captureDirectoryIdentity(root, 'Repository root');
  return {
    readFile: (relativePath, expectedSha256) => readLockedFile(root, rootIdentity, relativePath, expectedSha256, onReadPhase),
  };
}

async function fileDigest(root: string, relativePath: string): Promise<string | null> {
  const target = await safeTarget(root, relativePath, true);
  try {
    const stats = await lstat(target);
    if (stats.isSymbolicLink()) fail('path_escape', `Symlink target is not allowed: ${relativePath}`);
    if (!stats.isFile()) fail('path_invalid', `Mutation target is not a regular file: ${relativePath}`);
    return sha256(await readFile(target));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

async function journalLayout(root: string, configured?: string): Promise<JournalLayout> {
  const stateDirectory = path.join(root, 'workbench', '.state');
  const journalDirectory = path.join(stateDirectory, 'journals');
  if (configured !== undefined && !sameFilesystemPath(configured, journalDirectory)) {
    fail('path_invalid', 'Journal storage is fixed to workbench/.state/journals.');
  }
  const lockDirectory = path.join(stateDirectory, 'locks');
  await ensureSafeDirectory(root, stateDirectory, 'Journal state directory');
  await ensureSafeDirectory(root, journalDirectory, 'Journal directory');
  await ensureSafeDirectory(root, lockDirectory, 'Journal lock directory');
  return { root, stateDirectory, journalDirectory, lockDirectory, lockFile: path.join(lockDirectory, LOCK_FILE_NAME) };
}

async function syncFile(file: string): Promise<void> {
  if (process.env[TEST_SYNC_FAILURE_ENV] === 'file') throw new Error('Injected file sync failure.');
  const handle = await open(file, 'r+');
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function syncDirectory(directory: string): Promise<void> {
  if (process.env[TEST_SYNC_FAILURE_ENV] === 'directory') throw new Error('Injected directory sync failure.');
  if (process.platform === 'win32') {
    // File publication uses MoveFileEx with WRITE_THROUGH below. Node cannot
    // open Windows directory handles with FILE_FLAG_BACKUP_SEMANTICS.
    return;
  }
  const handle = await open(directory, 'r');
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function windowsMoveHelper(): Promise<string> {
  if (windowsMoveHelperPromise !== null) return windowsMoveHelperPromise;
  windowsMoveHelperPromise = (async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'scripture-workbench-move-'));
    const executable = path.join(directory, 'move-write-through.exe');
    const powershell = path.join(process.env['SystemRoot'] ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    await execFileAsync(
      powershell,
      ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command',
        'Add-Type -TypeDefinition $env:SCRIPTURE_MOVE_HELPER_SOURCE -OutputAssembly $env:SCRIPTURE_MOVE_HELPER_EXE -OutputType ConsoleApplication'],
      {
        windowsHide: true,
        env: {
          ...process.env,
          SCRIPTURE_MOVE_HELPER_SOURCE: WINDOWS_MOVE_HELPER_SOURCE,
          SCRIPTURE_MOVE_HELPER_EXE: executable,
        },
      },
    );
    process.once('exit', () => {
      try {
        rmSync(directory, { recursive: true, force: true });
      } catch {
        // The OS temp cleaner is the fallback after forced process death.
      }
    });
    return executable;
  })();
  return windowsMoveHelperPromise;
}

async function durableRename(source: string, target: string): Promise<void> {
  if (process.platform !== 'win32') {
    await rename(source, target);
    return;
  }
  await execFileAsync(await windowsMoveHelper(), [source, target], { windowsHide: true });
}

async function removeRegularFileIfPresent(file: string, label: string): Promise<void> {
  try {
    const stats = await lstat(file);
    if (stats.isSymbolicLink() || !stats.isFile()) fail('path_invalid', `${label} must be a regular file.`);
    await unlink(file);
    await syncDirectory(path.dirname(file));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
}

async function atomicWrite(file: string, bytes: Uint8Array): Promise<void> {
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, bytes, { flag: 'wx', mode: 0o600 });
  await syncFile(temporary);
  await replaceWithTemp(file, temporary);
}

async function replaceWithTemp(target: string, temporary: string): Promise<void> {
  try {
    await durableRename(temporary, target);
    await syncDirectory(path.dirname(target));
    return;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'EEXIST' && code !== 'EPERM') throw error;
  }
  const stats = await lstat(target);
  if (stats.isSymbolicLink() || !stats.isFile()) fail('path_invalid', `Replacement target must be a regular file: ${target}`);
  throw new ApplyJournalError('durability_failed', `Write-through replacement failed for ${target}.`);
}

function targetTemporaryPath(target: string, operationId: string): string {
  return `${target}.${operationId}.apply-tmp`;
}

function targetTombstonePath(target: string, operationId: string): string {
  return `${target}.${operationId}.apply-delete`;
}

async function inspectTargetTemporary(
  target: string,
  operationId: string,
  expectedSha256: string,
  discardInvalid: boolean,
): Promise<boolean> {
  const temporary = targetTemporaryPath(target, operationId);
  try {
    const stats = await lstat(temporary);
    if (stats.isSymbolicLink() || !stats.isFile()) fail('journal_invalid', `Target temporary must be a regular file: ${temporary}`);
    if (sha256(await readFile(temporary)) !== expectedSha256) {
      if (discardInvalid) {
        await removeRegularFileIfPresent(temporary, 'Partial target temporary');
        return false;
      }
      fail('journal_invalid', `Target temporary hash does not match its journal: ${temporary}`);
    }
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

async function installBytes(target: string, bytes: Uint8Array, operationId: string): Promise<void> {
  const temporary = targetTemporaryPath(target, operationId);
  if (await inspectTargetTemporary(target, operationId, sha256(bytes), true)) {
    await removeRegularFileIfPresent(temporary, 'Interrupted target temporary');
  }
  const pauseDirectory = process.env[TEST_TARGET_TEMP_PAUSE_DIR_ENV];
  if (pauseDirectory !== undefined) {
    const partialLength = Math.max(1, Math.floor(bytes.byteLength / 2));
    await writeFile(temporary, bytes.subarray(0, partialLength), { flag: 'wx', mode: 0o600 });
    await syncFile(temporary);
    await writeFile(path.join(pauseDirectory, 'target-temp-partial'), operationId, { flag: 'wx' });
    await new Promise<never>(() => undefined);
  }
  await writeFile(temporary, bytes, { flag: 'wx', mode: 0o600 });
  await syncFile(temporary);
  await replaceWithTemp(target, temporary);
}

async function inspectTargetTombstone(
  target: string,
  operationId: string,
  expectedSha256: string | null,
): Promise<boolean> {
  const tombstone = targetTombstonePath(target, operationId);
  try {
    const stats = await lstat(tombstone);
    if (stats.isSymbolicLink() || !stats.isFile()) fail('journal_invalid', `Target tombstone must be a regular file: ${tombstone}`);
    if (expectedSha256 === null || sha256(await readFile(tombstone)) !== expectedSha256) {
      fail('journal_invalid', `Target tombstone hash does not match its journal: ${tombstone}`);
    }
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

async function deleteTarget(
  root: string,
  relativePath: string,
  operationId: string,
  beforeSha256: string | null,
): Promise<void> {
  const target = await safeTarget(root, relativePath, true);
  const tombstone = targetTombstonePath(target, operationId);
  await inspectTargetTombstone(target, operationId, beforeSha256);
  try {
    const stats = await lstat(target);
    if (stats.isSymbolicLink() || !stats.isFile()) fail('path_invalid', `Mutation target ${relativePath} must be a regular file.`);
    if (beforeSha256 === null || sha256(await readFile(target)) !== beforeSha256) {
      fail('recovery_conflict', `Mutation delete target changed at ${relativePath}.`);
    }
    await durableRename(target, tombstone);
    await syncDirectory(path.dirname(target));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
}

async function phase(options: ApplyOptions, name: ApplyPhase, operationId: string): Promise<void> {
  await options.onPhase?.(name, operationId);
  if (options.crashAt === name) throw new InjectedCrashError(name, operationId);
}

function journalFile(layout: JournalLayout, operationId: string): string {
  return path.join(layout.journalDirectory, `${operationId}.json`);
}

function artifactDirectory(layout: JournalLayout, operationId: string, kind: 'staging' | 'backups'): string {
  return path.join(layout.journalDirectory, `${operationId}.${kind}`);
}

function artifactFile(layout: JournalLayout, operationId: string, kind: 'staging' | 'backups', name: string): string {
  return path.join(artifactDirectory(layout, operationId, kind), name);
}

function journalEntry(entry: MutationPlanEntry, index: number): JournalEntry {
  const stageSha256 = afterSha256(entry.after);
  return {
    ...entry,
    stageName: entry.after.kind === 'bytes' ? `${index}.bin` : null,
    stageSha256,
    backupName: entry.beforeSha256 === null ? null : `${index}.bak`,
    backupSha256: entry.beforeSha256,
  };
}

async function writeJournal(file: string, journal: Journal): Promise<void> {
  await atomicWrite(file, Buffer.from(`${JSON.stringify(journal)}\n`, 'utf8'));
}

function parseJournal(value: unknown): Journal {
  if (!isRecord(value)) fail('journal_invalid', 'Journal must be an object.');
  hasExactKeys(value, ['schemaVersion', 'operationId', 'plan', 'entries', 'state'], 'Journal', 'journal_invalid');
  if (value.schemaVersion !== APPLY_JOURNAL_SCHEMA_VERSION || typeof value.operationId !== 'string' || !OPERATION_ID.test(value.operationId)) {
    fail('journal_invalid', 'Journal identity or schema is invalid.');
  }
  const plan = parsePlan(value.plan, 'journal_invalid');
  if (!Array.isArray(value.entries) || value.entries.length !== plan.mutations.length) {
    fail('journal_invalid', 'Journal entries do not match its plan.');
  }
  if (value.state !== 'prepared' && value.state !== 'committing' && value.state !== 'committed') fail('journal_invalid', 'Journal state is invalid.');
  const entries = value.entries.map((raw, index) => {
    if (!isRecord(raw)) fail('journal_invalid', `Journal entry ${index} is invalid.`);
    hasExactKeys(
      raw,
      ['path', 'beforeSha256', 'after', 'stageName', 'stageSha256', 'backupName', 'backupSha256'],
      `Journal entry ${index}`,
      'journal_invalid',
    );
    const parsed = parseMutation({
      path: raw.path,
      beforeSha256: raw.beforeSha256,
      after: raw.after,
    }, index, 'journal_invalid');
    const expected = journalEntry(plan.mutations[index]!, index);
    if (
      parsed.path !== expected.path
      || parsed.beforeSha256 !== expected.beforeSha256
      || canonical(parsed.after) !== canonical(expected.after)
      || raw.stageName !== expected.stageName
      || raw.stageSha256 !== expected.stageSha256
      || raw.backupName !== expected.backupName
      || raw.backupSha256 !== expected.backupSha256
    ) {
      fail('journal_invalid', `Journal entry ${index} does not match its mutation plan or artifact identity.`);
    }
    return expected;
  });
  return {
    schemaVersion: APPLY_JOURNAL_SCHEMA_VERSION,
    operationId: value.operationId,
    plan,
    entries,
    state: value.state,
  };
}

async function readJournal(file: string, expectedName: string): Promise<Journal> {
  try {
    const journal = parseJournal(JSON.parse(await readFile(file, 'utf8')) as unknown);
    if (expectedName !== `${journal.operationId}.json`) fail('journal_invalid', `Journal filename does not match operation id: ${expectedName}`);
    return journal;
  } catch (error) {
    if (error instanceof ApplyJournalError) throw error;
    fail('journal_invalid', `Could not read journal ${expectedName}: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

function expectedArtifacts(journal: Journal, kind: 'staging' | 'backups'): Map<string, string> {
  const expected = new Map<string, string>();
  for (const entry of journal.entries) {
    const name = kind === 'staging' ? entry.stageName : entry.backupName;
    const digest = kind === 'staging' ? entry.stageSha256 : entry.backupSha256;
    if (name !== null && digest !== null) expected.set(name, digest);
  }
  return expected;
}

async function inspectArtifacts(layout: JournalLayout, journal: Journal, kind: 'staging' | 'backups', required: boolean): Promise<void> {
  const directory = artifactDirectory(layout, journal.operationId, kind);
  let names: readonly string[];
  try {
    await assertNoSymlinkPath(layout.root, directory, false);
    const stats = await lstat(directory);
    if (stats.isSymbolicLink() || !stats.isDirectory()) fail('journal_invalid', `Journal ${kind} directory is invalid.`);
    names = await readdir(directory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' && !required) return;
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') fail('journal_invalid', `Journal ${kind} directory is missing.`);
    throw error;
  }
  const expected = expectedArtifacts(journal, kind);
  for (const name of names) {
    const digest = expected.get(name);
    if (digest === undefined) {
      if (!required && ARTIFACT_TEMP.test(name)) {
        await removeRegularFileIfPresent(path.join(directory, name), `Interrupted ${kind} temporary artifact`);
        continue;
      }
      fail('journal_invalid', `Journal has an unexpected ${kind} artifact: ${name}`);
    }
    const file = artifactFile(layout, journal.operationId, kind, name);
    await assertNoSymlinkPath(layout.root, file, false);
    const stats = await lstat(file);
    if (stats.isSymbolicLink() || !stats.isFile()) fail('journal_invalid', `Journal ${kind} artifact is not a regular file: ${name}`);
    if (sha256(await readFile(file)) !== digest) fail('journal_invalid', `Journal ${kind} artifact hash does not match: ${name}`);
  }
  if (required) {
    for (const name of expected.keys()) {
      if (!names.includes(name)) fail('journal_invalid', `Journal ${kind} artifact is missing: ${name}`);
    }
  }
}

async function readVerifiedStage(layout: JournalLayout, journal: Journal, entry: JournalEntry): Promise<Buffer> {
  if (entry.stageName === null || entry.stageSha256 === null) fail('journal_invalid', `Journal entry has no staged bytes: ${entry.path}`);
  const file = artifactFile(layout, journal.operationId, 'staging', entry.stageName);
  await assertNoSymlinkPath(layout.root, file, false);
  const stats = await lstat(file);
  if (stats.isSymbolicLink() || !stats.isFile()) fail('journal_invalid', `Staged artifact is not a regular file: ${entry.stageName}`);
  const bytes = await readFile(file);
  if (sha256(bytes) !== entry.stageSha256) fail('journal_invalid', `Staged artifact hash does not match: ${entry.stageName}`);
  return bytes;
}

async function assertAllBefore(root: string, plan: MutationPlan, code: string): Promise<void> {
  for (const entry of plan.mutations) {
    const actual = await fileDigest(root, entry.path);
    if (actual !== entry.beforeSha256) {
      fail(code, `Mutation plan is stale at ${entry.path}: expected ${entry.beforeSha256 ?? 'missing'}, found ${actual ?? 'missing'}.`);
    }
  }
}

async function targetIsAfter(root: string, entry: MutationPlanEntry): Promise<boolean> {
  const actual = await fileDigest(root, entry.path);
  return entry.after.kind === 'delete' ? actual === null : actual === afterSha256(entry.after);
}

async function assertAllAfter(root: string, plan: MutationPlan, code: string): Promise<void> {
  for (const entry of plan.mutations) {
    if (!await targetIsAfter(root, entry)) fail(code, `Mutation after state does not match at ${entry.path}.`);
  }
}

function desiredDigest(entry: MutationPlanEntry, outcome: 'before' | 'after'): string | null {
  return outcome === 'before' ? entry.beforeSha256 : afterSha256(entry.after);
}

async function preflightJournal(root: string, layout: JournalLayout, journal: Journal): Promise<RecoveryWork> {
  for (const entry of journal.entries) {
    const target = await safeTarget(root, entry.path, true);
    if (entry.after.kind === 'bytes') {
      const hasTemporary = await inspectTargetTemporary(
        target,
        journal.operationId,
        afterSha256(entry.after)!,
        journal.state !== 'prepared',
      );
      if (hasTemporary && journal.state === 'prepared') {
        fail('journal_invalid', `Prepared journal has a target-install temporary for ${entry.path}.`);
      }
    } else {
      const hasTombstone = await inspectTargetTombstone(target, journal.operationId, entry.beforeSha256);
      if (hasTombstone && journal.state === 'prepared') {
        fail('journal_invalid', `Prepared journal has a target-delete tombstone for ${entry.path}.`);
      }
    }
  }
  if (journal.state === 'prepared') {
    await assertAllBefore(root, journal.plan, 'recovery_conflict');
    // Prepared journals never roll targets back. Any partial artifact is checked before cleanup.
    await inspectArtifacts(layout, journal, 'staging', false);
    await inspectArtifacts(layout, journal, 'backups', false);
    return { journal, outcome: 'before' };
  }
  if (journal.state === 'committing') {
    // Commit markers are only written after staging and backup have completed.
    await inspectArtifacts(layout, journal, 'staging', true);
    await inspectArtifacts(layout, journal, 'backups', true);
    for (const entry of journal.entries) {
      const actual = await fileDigest(root, entry.path);
      const recoverableReplacementGap = actual === null && entry.after.kind === 'bytes';
      if (!await targetIsAfter(root, entry) && actual !== entry.beforeSha256 && !recoverableReplacementGap) {
        fail('recovery_conflict', `Cannot finish ${entry.path}; it is neither before nor after.`);
      }
    }
    return { journal, outcome: 'after' };
  }
  for (const entry of journal.entries) {
    if (await targetIsAfter(root, entry)) continue;
    const actual = await fileDigest(root, entry.path);
    if (entry.after.kind !== 'delete' || actual !== entry.beforeSha256) {
      fail('recovery_conflict', `Committed mutation state changed at ${entry.path}.`);
    }
  }
  return { journal, outcome: 'after' };
}

function assertCompatibleRecovery(work: readonly RecoveryWork[]): void {
  const desired = new Map<string, string | null>();
  for (const item of work) {
    for (const entry of item.journal.entries) {
      const key = pathKey(entry.path);
      const target = desiredDigest(entry, item.outcome);
      if (desired.has(key) && desired.get(key) !== target) {
        fail('recovery_conflict', `Recovery journals disagree about the required final state for ${entry.path}.`);
      }
      desired.set(key, target);
    }
  }
}

async function removeKnownArtifactDirectory(layout: JournalLayout, journal: Journal, kind: 'staging' | 'backups'): Promise<void> {
  const directory = artifactDirectory(layout, journal.operationId, kind);
  try {
    await assertNoSymlinkPath(layout.root, directory, false);
    const stats = await lstat(directory);
    if (stats.isSymbolicLink() || !stats.isDirectory()) fail('journal_invalid', `Journal ${kind} directory is invalid during cleanup.`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
  for (const name of expectedArtifacts(journal, kind).keys()) {
    await removeRegularFileIfPresent(artifactFile(layout, journal.operationId, kind, name), `Journal ${kind} artifact`);
  }
  const remaining = await readdir(directory);
  if (remaining.length > 0) fail('journal_invalid', `Journal ${kind} directory contains unexpected artifacts during cleanup.`);
  await rmdir(directory);
  await syncDirectory(path.dirname(directory));
}

async function cleanupOperation(layout: JournalLayout, journal: Journal): Promise<void> {
  for (const entry of journal.entries) {
    const target = await safeTarget(layout.root, entry.path, true);
    if (entry.after.kind === 'bytes') {
      if (await inspectTargetTemporary(target, journal.operationId, afterSha256(entry.after)!, true)) {
        await removeRegularFileIfPresent(targetTemporaryPath(target, journal.operationId), 'Target temporary');
      }
    } else if (await inspectTargetTombstone(target, journal.operationId, entry.beforeSha256)) {
      await removeRegularFileIfPresent(targetTombstonePath(target, journal.operationId), 'Target tombstone');
    }
  }
  await removeKnownArtifactDirectory(layout, journal, 'staging');
  await removeKnownArtifactDirectory(layout, journal, 'backups');
  await removeRegularFileIfPresent(journalFile(layout, journal.operationId), 'Journal file');
}

async function cleanupOrphanArtifactDirectory(layout: JournalLayout, name: string): Promise<void> {
  const directory = path.join(layout.journalDirectory, name);
  await assertNoSymlinkPath(layout.root, directory, false);
  const stats = await lstat(directory);
  if (stats.isSymbolicLink() || !stats.isDirectory()) fail('journal_invalid', `Orphan journal artifact is not a directory: ${name}`);
  for (const child of await readdir(directory)) {
    if (!/^\d+\.(bin|bak)$/.test(child) && !ARTIFACT_TEMP.test(child)) {
      fail('journal_invalid', `Orphan journal artifact contains an unsafe entry: ${child}`);
    }
    await removeRegularFileIfPresent(path.join(directory, child), 'Orphan journal artifact');
  }
  await rmdir(directory);
  await syncDirectory(path.dirname(directory));
}

async function collectJournals(layout: JournalLayout): Promise<readonly Journal[]> {
  const names = (await readdir(layout.journalDirectory)).sort();
  const journals: Journal[] = [];
  const operationIds = new Set<string>();
  for (const name of names) {
    if (!JOURNAL_NAME_ALIAS.test(name)) {
      if (name.endsWith('.json')) fail('journal_invalid', `Journal filename is invalid: ${name}`);
      continue;
    }
    if (!JOURNAL_NAME.test(name)) fail('journal_invalid', `Journal filename is not canonical: ${name}`);
    const operationId = name.slice(0, -'.json'.length);
    if (operationIds.has(operationId)) fail('journal_invalid', `Journal filename aliases operation ${operationId}.`);
    operationIds.add(operationId);
    const file = path.join(layout.journalDirectory, name);
    await assertNoSymlinkPath(layout.root, file, false);
    const stats = await lstat(file);
    if (stats.isSymbolicLink() || !stats.isFile()) fail('journal_invalid', `Journal is not a regular file: ${name}`);
    journals.push(await readJournal(file, name));
  }
  return journals;
}

async function cleanupOrphanArtifacts(layout: JournalLayout, journals: readonly Journal[]): Promise<void> {
  const live = new Set(journals.map((journal) => journal.operationId));
  for (const name of (await readdir(layout.journalDirectory)).sort()) {
    if (JOURNAL_NAME_ALIAS.test(name)) continue;
    if (JOURNAL_TEMP_ALIAS.test(name)) {
      if (!JOURNAL_TEMP.test(name)) fail('journal_invalid', `Journal temporary filename is not canonical: ${name}`);
      await removeRegularFileIfPresent(path.join(layout.journalDirectory, name), 'Journal temporary file');
      continue;
    }
    if (ARTIFACT_DIRECTORY_ALIAS.test(name)) {
      if (!ARTIFACT_DIRECTORY.test(name)) fail('journal_invalid', `Journal artifact directory is not canonical: ${name}`);
      const operationId = name.slice(0, name.lastIndexOf('.'));
      if (!live.has(operationId)) await cleanupOrphanArtifactDirectory(layout, name);
      continue;
    }
    fail('journal_invalid', `Reserved journal directory contains an unexpected entry: ${name}`);
  }
}

async function recoverLocked(root: string, layout: JournalLayout): Promise<RecoveryResult> {
  const journals = await collectJournals(layout);
  const work: RecoveryWork[] = [];
  // Every target and artifact is checked before recovery mutates any target.
  for (const journal of journals) work.push(await preflightJournal(root, layout, journal));
  assertCompatibleRecovery(work);

  for (const item of work) {
    if (item.outcome !== 'after') continue;
    for (const entry of item.journal.entries) {
      if (await targetIsAfter(root, entry)) continue;
      const target = await safeTarget(root, entry.path, true);
      if (entry.after.kind === 'delete') await deleteTarget(root, entry.path, item.journal.operationId, entry.beforeSha256);
      else await installBytes(target, await readVerifiedStage(layout, item.journal, entry), item.journal.operationId);
    }
    await assertAllAfter(root, item.journal.plan, 'recovery_conflict');
    await writeJournal(journalFile(layout, item.journal.operationId), { ...item.journal, state: 'committed' });
  }

  // This is immediately before cleanup; cooperative callers hold the same lock.
  for (const item of work) {
    if (item.outcome === 'after') await assertAllAfter(root, item.journal.plan, 'recovery_conflict');
    else await assertAllBefore(root, item.journal.plan, 'recovery_conflict');
  }
  for (const item of work) await cleanupOperation(layout, item.journal);
  await cleanupOrphanArtifacts(layout, []);
  return { recovered: work.map(({ journal, outcome }) => ({ operationId: journal.operationId, outcome })) };
}

function parseLockOwner(value: unknown): LockOwner {
  if (!isRecord(value)) fail('lock_invalid', 'Journal lock is not an object.');
  hasExactKeys(value, ['schemaVersion', 'ownerId', 'pid', 'createdAtMs'], 'Journal lock', 'lock_invalid');
  if (
    value.schemaVersion !== 1
    || typeof value.ownerId !== 'string'
    || !OPERATION_ID.test(value.ownerId)
    || typeof value.pid !== 'number'
    || !Number.isSafeInteger(value.pid)
    || value.pid <= 0
    || typeof value.createdAtMs !== 'number'
    || !Number.isFinite(value.createdAtMs)
  ) fail('lock_invalid', 'Journal lock owner is invalid.');
  return {
    schemaVersion: 1,
    ownerId: value.ownerId as string,
    pid: value.pid as number,
    createdAtMs: value.createdAtMs as number,
  };
}

async function readLockOwner(layout: JournalLayout): Promise<LockOwner> {
  return readOwnerFile(layout, layout.lockFile, 'Journal lock');
}

async function readOwnerFile(layout: JournalLayout, file: string, label: string): Promise<LockOwner> {
  await assertNoSymlinkPath(layout.root, file, false);
  const stats = await lstat(file);
  if (stats.isSymbolicLink() || !stats.isFile()) fail('lock_invalid', `${label} is not a regular file.`);
  try {
    return parseLockOwner(JSON.parse(await readFile(file, 'utf8')) as unknown);
  } catch (error) {
    if (error instanceof ApplyJournalError) throw error;
    fail('lock_invalid', `${label} could not be read: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

function pidIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code === 'EPERM';
  }
}

async function reclaimStaleLock(layout: JournalLayout, owner: LockOwner): Promise<boolean> {
  if (pidIsAlive(owner.pid)) return false;
  const claim = path.join(layout.lockDirectory, `${LOCK_FILE_NAME}.${owner.ownerId}.${randomUUID()}.reclaim`);
  try {
    await rename(layout.lockFile, claim);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return true;
    if ((error as NodeJS.ErrnoException).code === 'EPERM' || (error as NodeJS.ErrnoException).code === 'EACCES') return false;
    throw error;
  }
  const pauseDirectory = process.env[TEST_RECLAIM_PAUSE_DIR_ENV];
  if (pauseDirectory !== undefined) {
    await writeFile(path.join(pauseDirectory, 'claimed'), owner.ownerId, { flag: 'wx' });
    const deadline = Date.now() + 10_000;
    while (true) {
      try {
        await readFile(path.join(pauseDirectory, 'release'));
        break;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        if (Date.now() >= deadline) fail('lock_busy', 'Timed out waiting for the reclaim fault-injection release.');
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
  }
  try {
    const claimed = parseLockOwner(JSON.parse(await readFile(claim, 'utf8')) as unknown);
    if (claimed.ownerId !== owner.ownerId) {
      // Owner A may release and owner B may acquire between our read and
      // rename. Restore B instead of stealing the live lock (the ABA case).
      try {
        await rename(claim, layout.lockFile);
        await syncDirectory(layout.lockDirectory);
      } catch (restoreError) {
        if ((restoreError as NodeJS.ErrnoException).code !== 'EEXIST') throw restoreError;
      }
      return false;
    }
    await removeRegularFileIfPresent(claim, 'Stale journal lock claim');
    return true;
  } catch (error) {
    if (error instanceof ApplyJournalError) throw error;
    fail('lock_invalid', `Stale journal lock claim could not be read: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

function reclaimGuardFile(layout: JournalLayout): string {
  return path.join(layout.lockDirectory, RECLAIM_GUARD_NAME);
}

function reclaimGuardClaimName(ownerId: string): string {
  return `${RECLAIM_GUARD_NAME}.${ownerId}.${randomUUID()}.claim`;
}

function isReclaimBarrierName(name: string): boolean {
  return name === RECLAIM_GUARD_NAME || name.startsWith(`${RECLAIM_GUARD_NAME}.`);
}

async function reclaimBarrierPresent(layout: JournalLayout): Promise<boolean> {
  const names = (await readdir(layout.lockDirectory)).filter(isReclaimBarrierName);
  let removed = false;
  for (const name of names) {
    const candidate = path.join(layout.lockDirectory, name);
    const probe = path.join(layout.lockDirectory, `${RECLAIM_GUARD_NAME}.probe.${randomUUID()}.claim`);
    try {
      await rename(candidate, probe);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw error;
    }

    let active = true;
    try {
      const owner = await readOwnerFile(layout, probe, 'Reclaim barrier');
      active = pidIsAlive(owner.pid);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      // A malformed record may still belong to a live publisher suspended
      // mid-write. Without a fence on its open handle, age cannot prove death.
      return true;
    }
    if (active) return true;
    try {
      await unlink(probe);
      removed = true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  if (removed) await syncDirectory(layout.lockDirectory);
  return (await readdir(layout.lockDirectory)).some(isReclaimBarrierName);
}

async function removeOwnedFile(file: string, owner: LockOwner, label: string): Promise<void> {
  try {
    const current = parseLockOwner(JSON.parse(await readFile(file, 'utf8')) as unknown);
    if (current.ownerId === owner.ownerId) await removeRegularFileIfPresent(file, label);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    if (error instanceof ApplyJournalError) return;
    throw error;
  }
}

interface FileIdentity {
  readonly dev: number;
  readonly ino: number;
}

function sameFileIdentity(left: FileIdentity, right: FileIdentity): boolean {
  return left.dev === right.dev && left.ino === right.ino;
}

async function testPause(directory: string | undefined, marker: string): Promise<void> {
  if (directory === undefined) return;
  await writeFile(path.join(directory, marker), marker, { flag: 'wx' });
  const release = path.join(directory, `${marker}.release`);
  const deadline = Date.now() + 10_000;
  while (true) {
    try {
      await readFile(release);
      return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      if (Date.now() >= deadline) fail('lock_busy', `Timed out waiting for ${marker} fault-injection release.`);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}

async function withdrawReclaimGuard(
  layout: JournalLayout,
  owner: LockOwner,
  identity?: FileIdentity,
): Promise<void> {
  const withdrawCandidate = async (candidate: string, pauseAfterClaim = false): Promise<'absent' | 'removed' | 'preserved'> => {
    const withdrawal = path.join(
      layout.lockDirectory,
      `${RECLAIM_GUARD_NAME}.${owner.ownerId}.${randomUUID()}.withdraw`,
    );
    try {
      await rename(candidate, withdrawal);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 'absent';
      throw error;
    }
    if (pauseAfterClaim) {
      await testPause(process.env[TEST_GUARD_WITHDRAW_PAUSE_DIR_ENV], 'canonical-claimed');
    }

    let owned = false;
    try {
      const stats = await lstat(withdrawal);
      owned = identity !== undefined && sameFileIdentity(stats, identity);
      if (!owned) {
        const current = parseLockOwner(JSON.parse(await readFile(withdrawal, 'utf8')) as unknown);
        owned = current.ownerId === owner.ownerId;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 'absent';
      if (!(error instanceof ApplyJournalError) && !(error instanceof SyntaxError)) throw error;
    }

    if (!owned) return 'preserved';
    try {
      await unlink(withdrawal);
      return 'removed';
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 'absent';
      throw error;
    }
  };

  // Claiming the canonical path first closes the snapshot-to-rename window:
  // either withdrawal wins, or the contender's atomic rename has already
  // published the displaced claim that the scan below must observe.
  await withdrawCandidate(reclaimGuardFile(layout), true);

  while (true) {
    const names = (await readdir(layout.lockDirectory)).filter((name) =>
      name.startsWith(`${RECLAIM_GUARD_NAME}.`),
    );
    let removed = false;
    let raced = false;
    for (const name of names) {
      const candidate = path.join(layout.lockDirectory, name);
      const result = await withdrawCandidate(candidate);
      removed ||= result === 'removed';
      raced ||= result === 'absent';
      // A non-owned entry remains a barrier under its withdrawal name. Its
      // actual owner identifies it by record or file identity and retires it.
    }
    if (!removed && !raced) break;
  }
  try {
    await syncDirectory(layout.lockDirectory);
  } catch {
    // Withdrawal is best-effort durability cleanup after another failure. The
    // original publication error remains authoritative and must not be masked.
  }
}

async function acquireReclaimGuard(layout: JournalLayout): Promise<HeldLock> {
  const file = reclaimGuardFile(layout);
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const claims = (await readdir(layout.lockDirectory)).filter((name) =>
      name.startsWith(`${RECLAIM_GUARD_NAME}.`),
    );
    for (const name of claims) {
      const claim = path.join(layout.lockDirectory, name);
      const claimedOwner = await readOwnerFile(layout, claim, 'Reclaim guard claim');
      if (pidIsAlive(claimedOwner.pid)) fail('lock_busy', 'Mutation lock reclamation is already running.');
      await removeRegularFileIfPresent(claim, 'Stale reclaim guard claim');
    }

    const owner: LockOwner = { schemaVersion: 1, ownerId: randomUUID(), pid: process.pid, createdAtMs: Date.now() };
    await testPause(process.env[TEST_GUARD_RACE_PAUSE_DIR_ENV], 'before-create');
    try {
      const handle = await open(file, 'wx', 0o600);
      const identity = await handle.stat();
      try {
        await handle.writeFile(`${JSON.stringify(owner)}\n`, 'utf8');
        await testPause(process.env[TEST_GUARD_PUBLISH_PAUSE_DIR_ENV], 'owner-written');
        if (process.env[TEST_GUARD_SYNC_FAILURE_ENV] === '1') throw new Error('Injected reclaim guard sync failure.');
        await handle.sync();
        await syncDirectory(layout.lockDirectory);
      } catch (error) {
        await handle.close();
        await withdrawReclaimGuard(layout, owner, identity);
        throw error;
      }
      const competingClaims = (await readdir(layout.lockDirectory)).filter((name) =>
        name.startsWith(`${RECLAIM_GUARD_NAME}.`),
      );
      if (competingClaims.length > 0) {
        await handle.close();
        await withdrawReclaimGuard(layout, owner, identity);
        fail('lock_busy', 'Another reclaim guard won the acquisition race.');
      }
      return { file, owner, handle, identity };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }

    const existing = await readOwnerFile(layout, file, 'Reclaim guard');
    await testPause(process.env[TEST_GUARD_RACE_PAUSE_DIR_ENV], 'stale-read');
    if (pidIsAlive(existing.pid)) fail('lock_busy', 'Mutation lock reclamation is already running.');
    const claim = path.join(layout.lockDirectory, reclaimGuardClaimName(existing.ownerId));
    try {
      await rename(file, claim);
      await syncDirectory(layout.lockDirectory);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw error;
    }
    let claimed: LockOwner;
    try {
      claimed = await readOwnerFile(layout, claim, 'Stale reclaim guard claim');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw error;
    }
    if (claimed.ownerId !== existing.ownerId) {
      // Keep the claim as the barrier. Its actual owner retires it either in
      // the post-create check or when its protected callback exits. Restoring
      // by rename would consume the only barrier and could overwrite owner C.
      fail('lock_busy', 'Reclaim guard owner changed during stale cleanup.');
    }
    await removeRegularFileIfPresent(claim, 'Stale reclaim guard claim');
  }
  fail('lock_busy', 'Mutation reclaim guard could not be acquired.');
}

async function withReclaimGuard<T>(layout: JournalLayout, action: () => Promise<T>): Promise<T> {
  const guard = await acquireReclaimGuard(layout);
  try {
    return await action();
  } finally {
    await guard.handle.close();
    await withdrawReclaimGuard(layout, guard.owner, guard.identity);
  }
}

async function canReclaimInvalidLock(layout: JournalLayout): Promise<boolean> {
  try {
    const stats = await lstat(layout.lockFile);
    return !stats.isSymbolicLink() && stats.isFile() && Date.now() - stats.mtimeMs >= LOCK_STALE_AFTER_MS;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return true;
    throw error;
  }
}

async function reclaimInvalidLock(layout: JournalLayout): Promise<boolean> {
  const claim = path.join(layout.lockDirectory, `${LOCK_FILE_NAME}.${randomUUID()}.reclaim`);
  try {
    await rename(layout.lockFile, claim);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return true;
    return false;
  }
  await removeRegularFileIfPresent(claim, 'Stale invalid journal lock claim');
  return true;
}

async function acquireRepositoryLock(layout: JournalLayout): Promise<HeldLock> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (await reclaimBarrierPresent(layout)) {
      fail('lock_busy', 'Mutation lock reclamation is in progress.');
    }
    const owner: LockOwner = { schemaVersion: 1, ownerId: randomUUID(), pid: process.pid, createdAtMs: Date.now() };
    try {
      const handle = await open(layout.lockFile, 'wx', 0o600);
      try {
        await handle.writeFile(`${JSON.stringify(owner)}\n`, 'utf8');
        await handle.sync();
      } catch (error) {
        await handle.close();
        await removeOwnedFile(layout.lockFile, owner, 'Journal lock');
        throw error;
      }
      // A reclaimer may have installed its barrier after our first check.
      // Withdraw this lock before any protected action can begin.
      if (await reclaimBarrierPresent(layout)) {
        await handle.close();
        await removeOwnedFile(layout.lockFile, owner, 'Journal lock');
        fail('lock_busy', 'Mutation lock reclamation won the acquisition race.');
      }
      await syncDirectory(layout.lockDirectory);
      return { file: layout.lockFile, owner, handle };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
    const reclaimed = await withReclaimGuard(layout, async () => {
      try {
        const current = await readLockOwner(layout);
        return reclaimStaleLock(layout, current);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return true;
        if (!(error instanceof ApplyJournalError) || error.code !== 'lock_invalid') throw error;
        return await canReclaimInvalidLock(layout) && await reclaimInvalidLock(layout);
      }
    });
    if (!reclaimed) fail('lock_busy', 'Mutation journal is busy while its owner record is active.');
  }
  fail('lock_busy', 'Mutation journal lock could not be acquired.');
}

async function releaseRepositoryLock(lock: HeldLock): Promise<void> {
  await lock.handle.close();
  try {
    const current = JSON.parse(await readFile(lock.file, 'utf8')) as unknown;
    if (parseLockOwner(current).ownerId === lock.owner.ownerId) await removeRegularFileIfPresent(lock.file, 'Journal lock');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    if (error instanceof ApplyJournalError) return;
    throw error;
  }
}

async function withRepositoryLock<T>(layout: JournalLayout, action: () => Promise<T>): Promise<T> {
  const lock = await acquireRepositoryLock(layout);
  try {
    return await action();
  } finally {
    await releaseRepositoryLock(lock);
  }
}

async function withRepositoryLockWaiting<T>(layout: JournalLayout, action: () => Promise<T>, waitTimeoutMs: number): Promise<T> {
  const deadline = Date.now() + waitTimeoutMs;
  let lock: HeldLock;
  while (true) {
    try {
      lock = await acquireRepositoryLock(layout);
      break;
    } catch (error) {
      if (!(error instanceof ApplyJournalError) || error.code !== 'lock_busy' || Date.now() >= deadline) throw error;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
  try {
    return await action();
  } finally {
    await releaseRepositoryLock(lock);
  }
}

async function assertOperationNamespaceAvailable(layout: JournalLayout, operationId: string): Promise<void> {
  const prefix = `${operationId}.`;
  for (const name of await readdir(layout.journalDirectory)) {
    if (name.toLocaleLowerCase('en-US').startsWith(prefix)) {
      fail('invalid_operation', `Operation namespace already exists: ${operationId}`);
    }
  }
}

export async function createMutationPlan(repoRoot: string, mutations: readonly MutationInput[]): Promise<MutationPlan> {
  const root = await realRepoRoot(repoRoot);
  if (!Array.isArray(mutations)) fail('invalid_plan', 'Mutation plan mutations must be an array.');
  const seen = new Set<string>();
  const normalized: MutationPlanEntry[] = [];
  for (const [index, mutation] of mutations.entries()) {
    if (!isRecord(mutation)) fail('invalid_plan', `Mutation ${index} must be an object.`);
    if (!Object.hasOwn(mutation, 'path') || !Object.hasOwn(mutation, 'after')) fail('invalid_plan', `Mutation ${index} is missing required fields.`);
    if (Object.keys(mutation).some((key) => key !== 'path' && key !== 'beforeSha256' && key !== 'after')) {
      fail('invalid_plan', `Mutation ${index} has unknown fields.`);
    }
    if (typeof mutation.path !== 'string') fail('invalid_plan', `Mutation ${index} path must be a string.`);
    const relativePath = validateRepoRelativePath(mutation.path);
    const key = pathKey(relativePath);
    if (seen.has(key)) fail('invalid_plan', `Mutation path is repeated or aliases another path: ${relativePath}`);
    seen.add(key);
    await safeTarget(root, relativePath, true);
    const beforeSha256 = mutation.beforeSha256 === undefined
      ? await fileDigest(root, relativePath)
      : normalizeBefore(mutation.beforeSha256, 'invalid_plan', `Mutation ${index} beforeSha256`) as string | null;
    normalized.push({ path: relativePath, beforeSha256, after: normalizeAfter(mutation.after, 'invalid_plan', `Mutation ${index} after`) });
  }
  normalized.sort((left, right) => left.path.localeCompare(right.path));
  const content: Pick<MutationPlan, 'schemaVersion' | 'mutations'> = {
    schemaVersion: APPLY_JOURNAL_SCHEMA_VERSION,
    mutations: normalized,
  };
  return { ...content, digest: digestInput(content) };
}

async function applyMutationPlanLocked(
  root: string,
  layout: JournalLayout,
  plan: MutationPlan,
  operationId: string,
  options: ApplyOptions,
  afterCommit?: () => void | Promise<void>,
): Promise<ApplyResult> {
  await assertOperationNamespaceAvailable(layout, operationId);
  await assertAllBefore(root, plan, 'stale_plan');
  for (const entry of plan.mutations) {
    if (entry.after.kind !== 'bytes') continue;
    const target = path.resolve(root, ...entry.path.split('/'));
    await ensureSafeDirectory(root, path.dirname(target), 'Mutation target parent');
  }
  await assertAllBefore(root, plan, 'stale_plan');

  const staging = artifactDirectory(layout, operationId, 'staging');
  const backups = artifactDirectory(layout, operationId, 'backups');
  await mkdir(staging);
  await syncDirectory(layout.journalDirectory);
  await mkdir(backups);
  await syncDirectory(layout.journalDirectory);
  await assertNoSymlinkPath(root, staging, false);
  await assertNoSymlinkPath(root, backups, false);
  const entries = plan.mutations.map(journalEntry);
  let journal: Journal = { schemaVersion: APPLY_JOURNAL_SCHEMA_VERSION, operationId, plan, entries, state: 'prepared' };
  await writeJournal(journalFile(layout, operationId), journal);
  await phase(options, 'journal-created', operationId);

  for (const entry of entries) {
    if (entry.stageName === null || entry.stageSha256 === null) continue;
    const stage = artifactFile(layout, operationId, 'staging', entry.stageName);
    const bytes = Buffer.from(entry.after.kind === 'bytes' ? entry.after.base64 : '', 'base64');
    await atomicWrite(stage, bytes);
    if (sha256(await readFile(stage)) !== entry.stageSha256) fail('journal_invalid', `Staged bytes changed for ${entry.path}.`);
  }
  await phase(options, 'staged', operationId);

  for (const entry of entries) {
    if (entry.backupName === null || entry.backupSha256 === null) continue;
    const target = await safeTarget(root, entry.path, false);
    const backup = artifactFile(layout, operationId, 'backups', entry.backupName);
    await atomicWrite(backup, await readFile(target));
    if (sha256(await readFile(backup)) !== entry.backupSha256) fail('journal_invalid', `Backup bytes changed for ${entry.path}.`);
  }
  await phase(options, 'backed-up', operationId);

  // The commit marker is the point of no return, so every before image is checked again here.
  await assertAllBefore(root, plan, 'stale_plan');
  journal = { ...journal, state: 'committing' };
  await writeJournal(journalFile(layout, operationId), journal);
  await phase(options, 'commit-marked', operationId);

  for (const entry of entries) {
    const target = await safeTarget(root, entry.path, true);
    if (entry.after.kind === 'delete') await deleteTarget(root, entry.path, journal.operationId, entry.beforeSha256);
    else await installBytes(target, await readVerifiedStage(layout, journal, entry), journal.operationId);
    await phase(options, 'file-replaced', operationId);
  }
  await assertAllAfter(root, plan, 'apply_conflict');
  journal = { ...journal, state: 'committed' };
  await writeJournal(journalFile(layout, operationId), journal);
  await phase(options, 'committed', operationId);
  await assertAllAfter(root, plan, 'apply_conflict');
  await afterCommit?.();
  await cleanupOperation(layout, journal);
  return {
    operationId,
    digest: plan.digest,
    paths: plan.mutations.map((entry) => entry.path),
    afterSha256: await Promise.all(plan.mutations.map(async (entry) => ({ path: entry.path, sha256: await fileDigest(root, entry.path) }))),
  };
}

export async function applyMutationPlan(repoRoot: string, input: MutationPlan, options: ApplyOptions = {}): Promise<ApplyResult> {
  const root = await realRepoRoot(repoRoot);
  const plan = validateMutationPlan(input);
  const operationId = options.operationId ?? randomUUID();
  if (!OPERATION_ID.test(operationId)) fail('invalid_operation', 'Operation id must be a lowercase UUID.');
  await phase(options, 'validated', operationId);
  const layout = await journalLayout(root, options.journalDirectory);
  return withRepositoryLock(layout, async () => {
    await recoverLocked(root, layout);
    return applyMutationPlanLocked(root, layout, plan, operationId, options);
  });
}

/** Apply or idempotently skip a plan with caller validation inside the journal lock. */
export async function applyMutationPlanWithLockedValidation(
  repoRoot: string,
  input: MutationPlan,
  validation: LockedApplyValidation,
  options: ApplyOptions = {},
): Promise<LockedApplyResult> {
  const root = await realRepoRoot(repoRoot);
  const plan = validateMutationPlan(input);
  const operationId = options.operationId ?? randomUUID();
  if (!OPERATION_ID.test(operationId)) fail('invalid_operation', 'Operation id must be a lowercase UUID.');
  await phase(options, 'validated', operationId);
  const layout = await journalLayout(root, options.journalDirectory);
  const waitTimeoutMs = validation.waitTimeoutMs ?? 10_000;
  if (!Number.isSafeInteger(waitTimeoutMs) || waitTimeoutMs < 0) fail('invalid_operation', 'Lock wait timeout must be a non-negative safe integer.');
  return withRepositoryLockWaiting(layout, async () => {
    await recoverLocked(root, layout);
    const scope = await createMutationJournalReadScope(root, validation.onReadPhase);
    if (await validation.beforeApply(scope) === 'skip') return { status: 'SKIPPED' };
    const result = await applyMutationPlanLocked(
      root,
      layout,
      plan,
      operationId,
      options,
      validation.afterCommit === undefined ? undefined : () => validation.afterCommit!(scope),
    );
    return { status: 'APPLIED', result };
  }, waitTimeoutMs);
}

export async function recoverMutationJournals(repoRoot: string, options: Pick<ApplyOptions, 'journalDirectory'> = {}): Promise<RecoveryResult> {
  const root = await realRepoRoot(repoRoot);
  const layout = await journalLayout(root, options.journalDirectory);
  return withRepositoryLock(layout, () => recoverLocked(root, layout));
}

/**
 * Read under the same repository lock used by apply and recovery.
 * Separate filesystem replacements cannot be atomically visible to readers that
 * ignore this protocol; cooperative readers see recovered all-before/all-after state.
 */
export async function withMutationJournalLock<T>(
  repoRoot: string,
  reader: () => T | Promise<T>,
  options: Pick<ApplyOptions, 'journalDirectory'> = {},
): Promise<T> {
  const root = await realRepoRoot(repoRoot);
  const layout = await journalLayout(root, options.journalDirectory);
  return withRepositoryLock(layout, async () => {
    await recoverLocked(root, layout);
    return reader();
  });
}

/**
 * Recover and read confined repository files while holding the mutation lock.
 * Reads use an already-opened no-follow handle and revalidate the root and path
 * identities before and after access, so path replacement cannot redirect bytes.
 */
export async function withMutationJournalReadLock<T>(
  repoRoot: string,
  reader: (scope: MutationJournalReadScope) => T | Promise<T>,
  options: MutationJournalReadOptions & Pick<ApplyOptions, 'journalDirectory'> = {},
): Promise<T> {
  const root = await realRepoRoot(repoRoot);
  const layout = await journalLayout(root, options.journalDirectory);
  const waitTimeoutMs = options.waitTimeoutMs ?? 10_000;
  if (!Number.isSafeInteger(waitTimeoutMs) || waitTimeoutMs < 0) fail('invalid_operation', 'Lock wait timeout must be a non-negative safe integer.');
  return withRepositoryLockWaiting(layout, async () => {
    await recoverLocked(root, layout);
    const scope = await createMutationJournalReadScope(root, options.onReadPhase);
    return reader(scope);
  }, waitTimeoutMs);
}

export const createPlan = createMutationPlan;
export const applyPlan = applyMutationPlan;
export const recoverJournals = recoverMutationJournals;
