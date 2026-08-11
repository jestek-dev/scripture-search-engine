import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, open, realpath } from 'node:fs/promises';
import path from 'node:path';

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';

import {
  analyzeTelemetryAudit,
  parseMasterRecord,
  serializeMasterRecord,
  telemetryAuditDigest,
  validateSelectedDistillates,
  type MasterRecord,
  type SelectedDistillateBytes,
  type SensitiveCategories,
  type TelemetryAuditSummary,
  type TelemetryBudgets,
  type TelemetryCandidateCase,
  type ValidatedDistillateFile,
} from '../../pipeline/src/telemetry/index.js';
import {
  applyMutationPlanWithLockedValidation,
  createMutationPlan,
  recoverMutationJournals,
  validateRepoRelativePath,
  withMutationJournalReadLock,
  type ApplyPhase,
  type MutationJournalReadOptions,
  type MutationJournalReadScope,
} from './applyJournal.js';
import { parseCaseEventLog, serializeCaseEventLog, validateCaseEvents, type CaseEvent } from './cases.js';

const STATE_ROOT = 'workbench/.telemetry-audits';
const PENDING_ROOT = `${STATE_ROOT}/pending`;
const RECEIPT_ROOT = `${STATE_ROOT}/receipts`;
const DEFAULT_MASTER_PATH = `${STATE_ROOT}/master-record.json`;
const DEFAULT_CASES_PATH = 'workbench/cases.jsonl';
const SHA256 = /^[0-9a-f]{64}$/;
const AUDIT_LOCK_WAIT_MS = 60_000;

export class TelemetryAuditLifecycleError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'TelemetryAuditLifecycleError';
    this.code = code;
  }
}

export interface PreviewTelemetryAuditOptions {
  readonly repoRoot: string;
  readonly selectedFiles: readonly string[];
  readonly engines: readonly ScriptureEngine[];
  readonly budgets: TelemetryBudgets;
  readonly categories: SensitiveCategories;
  /** Test-only fault injection for the journal-owned pending publication. */
  readonly stagingCrashAt?: ApplyPhase;
}

export interface TelemetryAuditPreview {
  readonly schemaVersion: 1;
  readonly repoRoot: string;
  readonly status: 'ready' | 'already-applied' | 'already-closed';
  readonly summary: TelemetryAuditSummary;
  readonly pendingRecordPath: string;
  readonly pendingRecordSha256: string | null;
  readonly masterRecordPath: string;
  readonly caseEventsPath: string;
  readonly preconditions: {
    readonly masterSha256: string | null;
    readonly casesSha256: string | null;
    readonly receiptSha256: string | null;
  };
}

export interface TelemetryAuditReceipt {
  readonly schemaVersion: 1;
  readonly auditDigest: string;
  readonly status: 'applied' | 'closed';
  readonly contentDigests: readonly string[];
  readonly distillateCount: number;
  readonly schemaVersions: readonly number[];
  readonly period: string;
  readonly distinctAuditTokens: number;
  readonly suppression: { readonly belowThreshold: number; readonly sensitiveExcluded: number };
  readonly excludedEvidence: { readonly rankMismatch: number; readonly unreplayable: number };
  readonly candidateCaseCount: number;
  readonly masterBeforeSha256: string | null;
  readonly masterAfterSha256: string;
  readonly casesBeforeSha256: string | null;
  readonly casesAfterSha256: string;
}

export interface ApplyTelemetryAuditOptions {
  readonly crashAt?: ApplyPhase;
  /** Test-only scheduling hook inherited from the trusted journal read scope. */
  readonly onReadPhase?: MutationJournalReadOptions['onReadPhase'];
}

export interface ApplyTelemetryAuditResult {
  readonly receipt: TelemetryAuditReceipt;
  readonly idempotent: boolean;
}

interface PendingAuditRecord {
  readonly schemaVersion: 1;
  readonly auditDigest: string;
  readonly files: readonly {
    readonly contentSha256: string;
    readonly base64: string;
  }[];
}

interface LoadedMaster {
  readonly record: MasterRecord | null;
  readonly bytes: Buffer | null;
  readonly digest: string | null;
}

interface LoadedCases {
  readonly events: readonly CaseEvent[];
  readonly bytes: Buffer | null;
  readonly digest: string | null;
}

interface LoadedReceipt {
  readonly receipt: TelemetryAuditReceipt;
  readonly bytes: Buffer;
  readonly sha256: string;
}

function fail(code: string, message: string): never {
  throw new TelemetryAuditLifecycleError(code, message);
}

function sha256(bytes: Uint8Array | string): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[], label: string, code = 'invalid_receipt'): void {
  const expected = new Set(keys);
  for (const key of Object.keys(value)) if (!expected.has(key)) fail(code, `${label} has an unknown field.`);
  for (const key of keys) if (!Object.hasOwn(value, key)) fail(code, `${label} is missing a field.`);
}

function parseCount(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) fail('invalid_receipt', `${label} is not a non-negative count.`);
  return value as number;
}

function parseDigest(value: unknown, label: string, nullable = false): string | null {
  if (nullable && value === null) return null;
  if (typeof value !== 'string' || !SHA256.test(value)) fail('invalid_receipt', `${label} is not a SHA-256 digest.`);
  return value;
}

function parseReceipt(input: unknown, expectedDigest?: string): TelemetryAuditReceipt {
  if (!isRecord(input)) fail('invalid_receipt', 'Telemetry audit receipt must be an object.');
  exactKeys(input, [
    'schemaVersion', 'auditDigest', 'status', 'contentDigests', 'distillateCount', 'schemaVersions', 'period',
    'distinctAuditTokens', 'suppression', 'excludedEvidence', 'candidateCaseCount', 'masterBeforeSha256',
    'masterAfterSha256', 'casesBeforeSha256', 'casesAfterSha256',
  ], 'Telemetry audit receipt');
  if (input.schemaVersion !== 1 || (input.status !== 'applied' && input.status !== 'closed')) {
    fail('invalid_receipt', 'Telemetry audit receipt has an unsupported schema or status.');
  }
  const auditDigest = parseDigest(input.auditDigest, 'receipt.auditDigest')!;
  if (expectedDigest !== undefined && auditDigest !== expectedDigest) fail('invalid_receipt', 'Telemetry audit receipt digest does not match its path.');
  if (!Array.isArray(input.contentDigests) || !input.contentDigests.every((digest) => typeof digest === 'string' && SHA256.test(digest)) ||
      new Set(input.contentDigests).size !== input.contentDigests.length) {
    fail('invalid_receipt', 'Telemetry audit receipt content digests are invalid.');
  }
  if (!Array.isArray(input.schemaVersions) || !input.schemaVersions.every((version) => Number.isSafeInteger(version))) {
    fail('invalid_receipt', 'Telemetry audit receipt schema versions are invalid.');
  }
  if (input.contentDigests.length !== input.distillateCount || new Set(input.schemaVersions).size !== input.schemaVersions.length) {
    fail('invalid_receipt', 'Telemetry audit receipt counts contradict its digest or schema lists.');
  }
  if (typeof input.period !== 'string' || !/^\d{4}-Q[1-4]$/.test(input.period)) fail('invalid_receipt', 'Telemetry audit receipt period is invalid.');
  if (!isRecord(input.suppression) || !isRecord(input.excludedEvidence)) fail('invalid_receipt', 'Telemetry audit receipt counts are malformed.');
  exactKeys(input.suppression, ['belowThreshold', 'sensitiveExcluded'], 'Receipt suppression');
  exactKeys(input.excludedEvidence, ['rankMismatch', 'unreplayable'], 'Receipt excluded evidence');
  return {
    schemaVersion: 1,
    auditDigest,
    status: input.status,
    contentDigests: [...input.contentDigests].sort() as string[],
    distillateCount: parseCount(input.distillateCount, 'receipt.distillateCount'),
    schemaVersions: [...input.schemaVersions] as number[],
    period: input.period,
    distinctAuditTokens: parseCount(input.distinctAuditTokens, 'receipt.distinctAuditTokens'),
    suppression: {
      belowThreshold: parseCount(input.suppression.belowThreshold, 'receipt.suppression.belowThreshold'),
      sensitiveExcluded: parseCount(input.suppression.sensitiveExcluded, 'receipt.suppression.sensitiveExcluded'),
    },
    excludedEvidence: {
      rankMismatch: parseCount(input.excludedEvidence.rankMismatch, 'receipt.excludedEvidence.rankMismatch'),
      unreplayable: parseCount(input.excludedEvidence.unreplayable, 'receipt.excludedEvidence.unreplayable'),
    },
    candidateCaseCount: parseCount(input.candidateCaseCount, 'receipt.candidateCaseCount'),
    masterBeforeSha256: parseDigest(input.masterBeforeSha256, 'receipt.masterBeforeSha256', true),
    masterAfterSha256: parseDigest(input.masterAfterSha256, 'receipt.masterAfterSha256')!,
    casesBeforeSha256: parseDigest(input.casesBeforeSha256, 'receipt.casesBeforeSha256', true),
    casesAfterSha256: parseDigest(input.casesAfterSha256, 'receipt.casesAfterSha256')!,
  };
}

function receiptSummary(receipt: TelemetryAuditReceipt): TelemetryAuditSummary {
  return {
    schemaVersion: 1,
    auditDigest: receipt.auditDigest,
    contentDigests: receipt.contentDigests,
    distillateCount: receipt.distillateCount,
    schemaVersions: receipt.schemaVersions,
    period: receipt.period,
    distinctAuditTokens: receipt.distinctAuditTokens,
    suppression: receipt.suppression,
    excludedEvidence: receipt.excludedEvidence,
    candidateCaseCount: receipt.candidateCaseCount,
    candidateCases: [],
  };
}

function resolveLocations(repoRoot: string): { root: string; master: string; cases: string } {
  return {
    root: path.resolve(repoRoot),
    master: validateRepoRelativePath(DEFAULT_MASTER_PATH),
    cases: validateRepoRelativePath(DEFAULT_CASES_PATH),
  };
}

function receiptPath(digest: string): string {
  if (!SHA256.test(digest)) fail('invalid_digest', 'Telemetry audit digest is invalid.');
  return `${RECEIPT_ROOT}/${digest}.json`;
}

function pendingPath(digest: string): string {
  if (!SHA256.test(digest)) fail('invalid_digest', 'Telemetry audit digest is invalid.');
  return `${PENDING_ROOT}/${digest}.json`;
}

function sameNativePath(left: string, right: string): boolean {
  return process.platform === 'win32'
    ? left.toLocaleLowerCase('en-US') === right.toLocaleLowerCase('en-US')
    : left === right;
}

async function readExplicitRegularFile(inputPath: string): Promise<SelectedDistillateBytes> {
  if (!path.isAbsolute(inputPath)) fail('selection_not_absolute', 'Selected distillate paths must be explicit absolute paths.');
  const absolute = path.resolve(inputPath);
  const before = await lstat(absolute);
  if (!before.isFile() || before.isSymbolicLink()) fail('unsafe_selection', 'A selected distillate is not a regular file.');
  if (!sameNativePath(await realpath(absolute), absolute)) fail('unsafe_selection', 'A selected distillate traverses a symbolic link.');
  const noFollow = 'O_NOFOLLOW' in constants ? constants.O_NOFOLLOW : 0;
  const handle = await open(absolute, constants.O_RDONLY | noFollow);
  try {
    const opened = await handle.stat();
    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino) fail('selection_changed', 'A selected distillate changed while opening.');
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (after.size !== opened.size || after.mtimeMs !== opened.mtimeMs) fail('selection_changed', 'A selected distillate changed while reading.');
    return { filename: path.basename(absolute), bytes };
  } finally {
    await handle.close();
  }
}

function serializePendingRecord(digest: string, files: readonly ValidatedDistillateFile[]): Buffer {
  const record: PendingAuditRecord = {
    schemaVersion: 1,
    auditDigest: digest,
    files: [...files]
      .sort((left, right) => left.contentSha256.localeCompare(right.contentSha256))
      .map((file) => ({ contentSha256: file.contentSha256, base64: Buffer.from(file.canonicalBytes).toString('base64') })),
  };
  return Buffer.from(`${JSON.stringify(record)}\n`, 'utf8');
}

function parsePendingRecord(bytes: Buffer, expectedDigest: string): readonly ValidatedDistillateFile[] {
  let input: unknown;
  try {
    input = JSON.parse(bytes.toString('utf8')) as unknown;
  } catch {
    fail('invalid_pending_record', 'Telemetry audit pending record is not valid JSON.');
  }
  if (!isRecord(input)) fail('invalid_pending_record', 'Telemetry audit pending record must be an object.');
  exactKeys(input, ['schemaVersion', 'auditDigest', 'files'], 'Telemetry audit pending record', 'invalid_pending_record');
  if (input.schemaVersion !== 1 || input.auditDigest !== expectedDigest || !Array.isArray(input.files) || input.files.length === 0) {
    fail('invalid_pending_record', 'Telemetry audit pending record identity is invalid.');
  }
  const selected: SelectedDistillateBytes[] = input.files.map((raw, index) => {
    if (!isRecord(raw)) fail('invalid_pending_record', 'Telemetry audit pending entry is invalid.');
    exactKeys(raw, ['contentSha256', 'base64'], 'Telemetry audit pending entry', 'invalid_pending_record');
    if (typeof raw.contentSha256 !== 'string' || !SHA256.test(raw.contentSha256) || typeof raw.base64 !== 'string') {
      fail('invalid_pending_record', 'Telemetry audit pending entry fields are invalid.');
    }
    const content = Buffer.from(raw.base64, 'base64');
    if (content.toString('base64') !== raw.base64 || sha256(content) !== raw.contentSha256) {
      fail('invalid_pending_record', 'Telemetry audit pending entry digest is invalid.');
    }
    return { filename: `distillate-${String(index + 1).padStart(4, '0')}.json`, bytes: content };
  });
  const files = validateSelectedDistillates(selected);
  const actual = files.map((file) => file.contentSha256).sort();
  const declared = input.files.map((raw) => (raw as Record<string, unknown>).contentSha256).sort();
  if (JSON.stringify(actual) !== JSON.stringify(declared)) fail('invalid_pending_record', 'Telemetry audit pending content set is invalid.');
  return files;
}

function parseJsonBytes(bytes: Buffer, label: string, code: string): unknown {
  try {
    return JSON.parse(bytes.toString('utf8')) as unknown;
  } catch {
    fail(code, `${label} is not valid JSON.`);
  }
}

function loadMasterBytes(bytes: Buffer | null): LoadedMaster {
  if (bytes === null) return { record: null, bytes: null, digest: null };
  return { record: parseMasterRecord(parseJsonBytes(bytes, 'Telemetry master record', 'invalid_master')), bytes, digest: sha256(bytes) };
}

function loadCaseBytes(bytes: Buffer | null): LoadedCases {
  if (bytes === null) return { events: [], bytes: null, digest: null };
  return { events: validateCaseEvents(parseCaseEventLog(bytes.toString('utf8'))), bytes, digest: sha256(bytes) };
}

function loadReceiptBytes(bytes: Buffer | null, digest: string): LoadedReceipt | null {
  if (bytes === null) return null;
  return { receipt: parseReceipt(parseJsonBytes(bytes, 'Telemetry audit receipt', 'invalid_receipt'), digest), bytes, sha256: sha256(bytes) };
}

async function readReceipt(scope: MutationJournalReadScope, digest: string): Promise<LoadedReceipt | null> {
  return loadReceiptBytes(await scope.readFile(receiptPath(digest)), digest);
}

async function assertRetainedReceiptState(scope: MutationJournalReadScope, receipt: TelemetryAuditReceipt): Promise<void> {
  const [master, cases, pending] = await Promise.all([
    scope.readFile(DEFAULT_MASTER_PATH),
    scope.readFile(DEFAULT_CASES_PATH),
    scope.readFile(pendingPath(receipt.auditDigest)),
  ]);
  if (master === null || cases === null || sha256(master) !== receipt.masterAfterSha256 || sha256(cases) !== receipt.casesAfterSha256) {
    fail('retained_state_changed', 'Telemetry audit receipt no longer matches the retained master and case records.');
  }
  if (receipt.status === 'closed') {
    if (pending !== null) fail('close_incomplete', 'Closed telemetry audit still has temporary distillates.');
    return;
  }
  if (pending === null) fail('pending_missing', 'Applied telemetry audit is missing its temporary distillates.');
  const files = parsePendingRecord(pending, receipt.auditDigest);
  if (JSON.stringify(files.map((file) => file.contentSha256).sort()) !== JSON.stringify([...receipt.contentDigests].sort())) {
    fail('pending_changed', 'Temporary telemetry content no longer matches its receipt.');
  }
}

function deterministicUuid(seed: string): string {
  const hex = sha256(seed).slice(0, 32).split('');
  hex[12] = '5';
  hex[16] = ['8', '9', 'a', 'b'][Number.parseInt(hex[16]!, 16) % 4]!;
  return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20).join('')}`;
}

function auditTimestamp(period: string): string {
  const match = /^(\d{4})-Q([1-4])$/.exec(period);
  if (match === null) fail('invalid_period', 'Telemetry audit period is invalid.');
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) * 3, 0)).toISOString();
}

function appendCandidateCases(existing: readonly CaseEvent[], digest: string, period: string, candidates: readonly TelemetryCandidateCase[]): string {
  const eventIds = new Set(existing.map((event) => event.eventId));
  const caseIds = new Set(existing.map((event) => event.caseId));
  const additions: CaseEvent[] = [];
  for (const candidate of candidates) {
    const caseId = deterministicUuid(`telemetry-case\u0000${digest}\u0000${candidate.candidateKey}`);
    const eventId = deterministicUuid(`telemetry-event\u0000${digest}\u0000${candidate.candidateKey}`);
    if (eventIds.has(eventId) || caseIds.has(caseId)) fail('case_collision', 'Telemetry candidate identity collides with existing case history.');
    additions.push({
      schemaVersion: 2,
      eventId,
      caseId,
      at: auditTimestamp(period),
      reviewer: 'telemetry-audit',
      sequence: 1,
      kind: 'case-created',
      query: candidate.query,
      source: 'telemetry',
      artifact: { ...candidate.artifact },
    });
  }
  return serializeCaseEventLog(validateCaseEvents([...existing, ...additions]));
}

function makeReceipt(
  summary: TelemetryAuditSummary,
  status: 'applied' | 'closed',
  masterBefore: string | null,
  masterAfter: string,
  casesBefore: string | null,
  casesAfter: string,
): TelemetryAuditReceipt {
  return {
    schemaVersion: 1,
    auditDigest: summary.auditDigest,
    status,
    contentDigests: [...summary.contentDigests].sort(),
    distillateCount: summary.distillateCount,
    schemaVersions: [...summary.schemaVersions],
    period: summary.period,
    distinctAuditTokens: summary.distinctAuditTokens,
    suppression: { ...summary.suppression },
    excludedEvidence: { ...summary.excludedEvidence },
    candidateCaseCount: summary.candidateCaseCount,
    masterBeforeSha256: masterBefore,
    masterAfterSha256: masterAfter,
    casesBeforeSha256: casesBefore,
    casesAfterSha256: casesAfter,
  };
}

function serializeReceipt(receipt: TelemetryAuditReceipt): Buffer {
  return Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
}

function previewFromReceipt(root: string, master: LoadedMaster, cases: LoadedCases, loaded: LoadedReceipt, pendingSha: string | null): TelemetryAuditPreview {
  return {
    schemaVersion: 1,
    repoRoot: root,
    status: loaded.receipt.status === 'closed' ? 'already-closed' : 'already-applied',
    summary: receiptSummary(loaded.receipt),
    pendingRecordPath: pendingPath(loaded.receipt.auditDigest),
    pendingRecordSha256: pendingSha,
    masterRecordPath: DEFAULT_MASTER_PATH,
    caseEventsPath: DEFAULT_CASES_PATH,
    preconditions: { masterSha256: master.digest, casesSha256: cases.digest, receiptSha256: loaded.sha256 },
  };
}

export async function previewTelemetryAudit(options: PreviewTelemetryAuditOptions): Promise<TelemetryAuditPreview> {
  const locations = resolveLocations(options.repoRoot);
  const selected = await Promise.all(options.selectedFiles.map(readExplicitRegularFile));
  const files = validateSelectedDistillates(selected);
  const digest = telemetryAuditDigest(files, options.engines, options.budgets, options.categories);

  const initial = await withMutationJournalReadLock(locations.root, async (scope) => {
    const [masterBytes, casesBytes, receipt] = await Promise.all([
      scope.readFile(locations.master),
      scope.readFile(locations.cases),
      readReceipt(scope, digest),
    ]);
    const master = loadMasterBytes(masterBytes);
    const cases = loadCaseBytes(casesBytes);
    if (receipt !== null) {
      await assertRetainedReceiptState(scope, receipt.receipt);
      const pending = await scope.readFile(pendingPath(digest));
      return { master, cases, receipt, pendingSha: pending === null ? null : sha256(pending) };
    }
    return { master, cases, receipt: null, pendingSha: null };
  }, { waitTimeoutMs: AUDIT_LOCK_WAIT_MS });
  if (initial.receipt !== null) return previewFromReceipt(locations.root, initial.master, initial.cases, initial.receipt, initial.pendingSha);

  const analysis = await analyzeTelemetryAudit(files, options.engines, options.budgets, options.categories, initial.master.record);
  if (analysis.summary.auditDigest !== digest) fail('analysis_changed', 'Telemetry audit digest changed during preview.');
  const pendingBytes = serializePendingRecord(digest, files);
  const pendingSha = sha256(pendingBytes);
  const pending = pendingPath(digest);
  const plan = await createMutationPlan(locations.root, [{ path: pending, beforeSha256: null, after: pendingBytes }]);
  await applyMutationPlanWithLockedValidation(locations.root, plan, {
    waitTimeoutMs: AUDIT_LOCK_WAIT_MS,
    beforeApply: async (scope) => {
      const receipt = await readReceipt(scope, digest);
      if (receipt !== null) {
        await assertRetainedReceiptState(scope, receipt.receipt);
        return 'skip';
      }
      const existing = await scope.readFile(pending);
      if (existing === null) return 'apply';
      if (sha256(existing) !== pendingSha || !existing.equals(pendingBytes)) fail('staging_conflict', 'Telemetry audit pending record conflicts with selected content.');
      return 'skip';
    },
    afterCommit: async (scope) => { await scope.readFile(pending, pendingSha); },
  }, {
    operationId: deterministicUuid(`telemetry-stage\u0000${digest}`),
    crashAt: options.stagingCrashAt,
  });

  return withMutationJournalReadLock(locations.root, async (scope) => {
    const [masterBytes, casesBytes, receipt] = await Promise.all([
      scope.readFile(locations.master),
      scope.readFile(locations.cases),
      readReceipt(scope, digest),
    ]);
    const master = loadMasterBytes(masterBytes);
    const cases = loadCaseBytes(casesBytes);
    if (receipt !== null) {
      await assertRetainedReceiptState(scope, receipt.receipt);
      const currentPending = await scope.readFile(pending);
      return previewFromReceipt(locations.root, master, cases, receipt, currentPending === null ? null : sha256(currentPending));
    }
    await scope.readFile(pending, pendingSha);
    if (master.digest !== initial.master.digest || cases.digest !== initial.cases.digest) {
      fail('stale_preview', 'Telemetry audit retained state changed while previewing. Retry the preview.');
    }
    return {
      schemaVersion: 1,
      repoRoot: locations.root,
      status: 'ready',
      summary: analysis.summary,
      pendingRecordPath: pending,
      pendingRecordSha256: pendingSha,
      masterRecordPath: locations.master,
      caseEventsPath: locations.cases,
      preconditions: { masterSha256: master.digest, casesSha256: cases.digest, receiptSha256: null },
    };
  }, { waitTimeoutMs: AUDIT_LOCK_WAIT_MS });
}

function validatePreview(preview: TelemetryAuditPreview): void {
  if (preview.schemaVersion !== 1 || !SHA256.test(preview.summary.auditDigest) ||
      preview.pendingRecordPath !== pendingPath(preview.summary.auditDigest) ||
      preview.masterRecordPath !== DEFAULT_MASTER_PATH || preview.caseEventsPath !== DEFAULT_CASES_PATH ||
      (preview.pendingRecordSha256 !== null && !SHA256.test(preview.pendingRecordSha256))) {
    fail('invalid_preview', 'Telemetry audit preview structure is inconsistent.');
  }
}

export async function applyTelemetryAudit(
  preview: TelemetryAuditPreview,
  engines: readonly ScriptureEngine[],
  budgets: TelemetryBudgets,
  categories: SensitiveCategories,
  options: ApplyTelemetryAuditOptions = {},
): Promise<ApplyTelemetryAuditResult> {
  validatePreview(preview);
  const digest = preview.summary.auditDigest;
  const loaded = await withMutationJournalReadLock(preview.repoRoot, async (scope) => {
    const receipt = await readReceipt(scope, digest);
    if (receipt !== null) {
      await assertRetainedReceiptState(scope, receipt.receipt);
      return { receipt, master: null, cases: null, pendingBytes: null, files: null };
    }
    if (preview.status !== 'ready' || preview.pendingRecordSha256 === null) fail('missing_receipt', 'Previously imported telemetry audit has no receipt.');
    const [pendingBytes, masterBytes, casesBytes] = await Promise.all([
      scope.readFile(preview.pendingRecordPath, preview.pendingRecordSha256),
      scope.readFile(preview.masterRecordPath),
      scope.readFile(preview.caseEventsPath),
    ]);
    if (pendingBytes === null) fail('pending_missing', 'Telemetry audit pending record is missing.');
    const master = loadMasterBytes(masterBytes);
    const cases = loadCaseBytes(casesBytes);
    if (master.digest !== preview.preconditions.masterSha256 || cases.digest !== preview.preconditions.casesSha256) {
      fail('stale_preview', 'Telemetry audit preview is stale.');
    }
    const files = parsePendingRecord(pendingBytes, digest);
    if (telemetryAuditDigest(files, engines, budgets, categories) !== digest) fail('analysis_changed', 'Telemetry audit engine or policy identity changed after preview.');
    return { receipt: null, master, cases, pendingBytes, files };
  }, { onReadPhase: options.onReadPhase, waitTimeoutMs: AUDIT_LOCK_WAIT_MS });
  if (loaded.receipt !== null) return { receipt: loaded.receipt.receipt, idempotent: true };
  if (loaded.master === null || loaded.cases === null || loaded.pendingBytes === null || loaded.files === null) {
    fail('invalid_state', 'Telemetry audit apply state is incomplete.');
  }

  const analysis = await analyzeTelemetryAudit(loaded.files, engines, budgets, categories, loaded.master.record);
  if (analysis.summary.auditDigest !== digest || JSON.stringify(analysis.summary) !== JSON.stringify(preview.summary)) {
    fail('analysis_changed', 'Telemetry audit analysis changed after preview.');
  }
  const masterBytes = Buffer.from(serializeMasterRecord(analysis.nextMasterRecord), 'utf8');
  const casesBytes = Buffer.from(appendCandidateCases(loaded.cases.events, digest, analysis.summary.period, analysis.summary.candidateCases), 'utf8');
  const receipt = makeReceipt(
    analysis.summary,
    'applied',
    loaded.master.digest,
    sha256(masterBytes),
    loaded.cases.digest,
    sha256(casesBytes),
  );
  const receiptBytes = serializeReceipt(receipt);
  const pendingSha = sha256(loaded.pendingBytes);
  const plan = await createMutationPlan(preview.repoRoot, [
    { path: preview.pendingRecordPath, beforeSha256: pendingSha, after: loaded.pendingBytes },
    { path: preview.masterRecordPath, beforeSha256: loaded.master.digest, after: masterBytes },
    { path: preview.caseEventsPath, beforeSha256: loaded.cases.digest, after: casesBytes },
    { path: receiptPath(digest), beforeSha256: null, after: receiptBytes },
  ]);
  const result = await applyMutationPlanWithLockedValidation(preview.repoRoot, plan, {
    waitTimeoutMs: AUDIT_LOCK_WAIT_MS,
    onReadPhase: options.onReadPhase,
    beforeApply: async (scope) => {
      const concurrent = await readReceipt(scope, digest);
      if (concurrent !== null) {
        await assertRetainedReceiptState(scope, concurrent.receipt);
        return 'skip';
      }
      await Promise.all([
        scope.readFile(preview.pendingRecordPath, pendingSha),
        scope.readFile(preview.masterRecordPath, loaded.master!.digest),
        scope.readFile(preview.caseEventsPath, loaded.cases!.digest),
        scope.readFile(receiptPath(digest), null),
      ]);
      return 'apply';
    },
    afterCommit: async (scope) => {
      await Promise.all([
        scope.readFile(preview.pendingRecordPath, pendingSha),
        scope.readFile(preview.masterRecordPath, receipt.masterAfterSha256),
        scope.readFile(preview.caseEventsPath, receipt.casesAfterSha256),
        scope.readFile(receiptPath(digest), sha256(receiptBytes)),
      ]);
    },
  }, {
    operationId: deterministicUuid(`telemetry-apply\u0000${digest}`),
    crashAt: options.crashAt,
  });
  if (result.status === 'SKIPPED') {
    const concurrent = await withMutationJournalReadLock(preview.repoRoot, async (scope) => {
      const current = await readReceipt(scope, digest);
      if (current === null) fail('apply_conflict', 'Telemetry audit apply was skipped without a matching receipt.');
      await assertRetainedReceiptState(scope, current.receipt);
      return current;
    }, { waitTimeoutMs: AUDIT_LOCK_WAIT_MS });
    return { receipt: concurrent.receipt, idempotent: true };
  }
  return { receipt, idempotent: false };
}

export async function closeTelemetryAudit(
  repoRoot: string,
  digest: string,
  options: ApplyTelemetryAuditOptions = {},
): Promise<ApplyTelemetryAuditResult> {
  const root = path.resolve(repoRoot);
  const loaded = await withMutationJournalReadLock(root, async (scope) => {
    const receipt = await readReceipt(scope, digest);
    if (receipt === null) fail('missing_receipt', 'Telemetry audit cannot close before it is applied.');
    await assertRetainedReceiptState(scope, receipt.receipt);
    const pendingBytes = await scope.readFile(pendingPath(digest));
    return { receipt, pendingBytes };
  }, { onReadPhase: options.onReadPhase, waitTimeoutMs: AUDIT_LOCK_WAIT_MS });
  if (loaded.receipt.receipt.status === 'closed') return { receipt: loaded.receipt.receipt, idempotent: true };
  if (loaded.pendingBytes === null) fail('close_incomplete', 'Temporary telemetry content disappeared before close.');

  const files = parsePendingRecord(loaded.pendingBytes, digest);
  if (JSON.stringify(files.map((file) => file.contentSha256).sort()) !== JSON.stringify([...loaded.receipt.receipt.contentDigests].sort())) {
    fail('close_incomplete', 'Temporary telemetry content changed before close.');
  }
  const pendingSha = sha256(loaded.pendingBytes);
  const closed = { ...loaded.receipt.receipt, status: 'closed' as const };
  const closedBytes = serializeReceipt(closed);
  const plan = await createMutationPlan(root, [
    { path: pendingPath(digest), beforeSha256: pendingSha, after: null },
    { path: receiptPath(digest), beforeSha256: loaded.receipt.sha256, after: closedBytes },
  ]);
  const result = await applyMutationPlanWithLockedValidation(root, plan, {
    waitTimeoutMs: AUDIT_LOCK_WAIT_MS,
    onReadPhase: options.onReadPhase,
    beforeApply: async (scope) => {
      const concurrent = await readReceipt(scope, digest);
      if (concurrent === null) fail('missing_receipt', 'Telemetry audit receipt disappeared before close.');
      if (concurrent.receipt.status === 'closed') {
        await assertRetainedReceiptState(scope, concurrent.receipt);
        return 'skip';
      }
      await Promise.all([
        scope.readFile(pendingPath(digest), pendingSha),
        scope.readFile(receiptPath(digest), loaded.receipt.sha256),
        scope.readFile(DEFAULT_MASTER_PATH, concurrent.receipt.masterAfterSha256),
        scope.readFile(DEFAULT_CASES_PATH, concurrent.receipt.casesAfterSha256),
      ]);
      return 'apply';
    },
    afterCommit: async (scope) => {
      await Promise.all([
        scope.readFile(pendingPath(digest), null),
        scope.readFile(receiptPath(digest), sha256(closedBytes)),
        scope.readFile(DEFAULT_MASTER_PATH, closed.masterAfterSha256),
        scope.readFile(DEFAULT_CASES_PATH, closed.casesAfterSha256),
      ]);
    },
  }, {
    operationId: deterministicUuid(`telemetry-close\u0000${digest}`),
    crashAt: options.crashAt,
  });
  if (result.status === 'SKIPPED') {
    const concurrent = await withMutationJournalReadLock(root, async (scope) => {
      const current = await readReceipt(scope, digest);
      if (current === null || current.receipt.status !== 'closed') fail('close_incomplete', 'Telemetry audit close was skipped without deletion proof.');
      await assertRetainedReceiptState(scope, current.receipt);
      return current;
    }, { waitTimeoutMs: AUDIT_LOCK_WAIT_MS });
    return { receipt: concurrent.receipt, idempotent: true };
  }
  return { receipt: closed, idempotent: false };
}

export async function recoverTelemetryAuditTransactions(repoRoot: string): Promise<void> {
  await recoverMutationJournals(path.resolve(repoRoot));
}
