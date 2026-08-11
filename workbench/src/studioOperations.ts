import { createHash, randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';
import type { SensitiveCategories, TelemetryBudgets } from '../../pipeline/src/telemetry/index.js';
import {
  applyMutationPlan,
  createMutationPlan,
  withMutationJournalReadLock,
} from './applyJournal.js';
import {
  applyTelemetryAudit,
  closeTelemetryAudit,
  previewTelemetryAudit,
  recoverTelemetryAuditTransactions,
  type TelemetryAuditPreview,
} from './telemetryAudit.js';
import {
  DEFAULT_REVIEWED_SIZE,
  REVIEW_PRIORITY_FORMULA,
  REVIEW_SESSION_KINDS,
  REVIEW_SKIP_REASONS,
  appendReviewSessionEvent,
  buildReviewSession,
  type ReviewSession,
  type ReviewSessionCase,
  type ReviewSessionEvent,
  type ReviewSessionKind,
  type ReviewSkipReason,
  type RequeuePolicy,
} from './reviewSessions.js';
import {
  assertQualityDashboardIntegrity,
  qualityDashboardAdmissionProjection,
  type CountMetric,
  type EvidenceSourceLinks,
  type QualityDashboardReport,
  type RateMetric,
} from './qualityDashboard.js';

const SHA256 = /^[0-9a-f]{64}$/;
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const SAFE_UPLOAD_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,126}\.json$/;
const SESSION_INDEX_PATH = 'workbench/review-data/studio-sessions.json';
const UPLOAD_ROOT = 'workbench/review-data/.studio-uploads';
const MAX_AUDIT_FILES = 20;
const MAX_AUDIT_FILE_BYTES = 1024 * 1024;
const MAX_AUDIT_TOTAL_BYTES = 4 * 1024 * 1024;

export class StudioOperationsError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = 'StudioOperationsError';
    this.code = code;
    this.status = status;
  }
}

export interface AuditUploadFile {
  readonly filename: string;
  readonly size: number;
  readonly contentBase64: string;
}

export interface StudioAuditPreviewView {
  readonly schemaVersion: 1;
  readonly auditDigest: string;
  readonly previewDigest: string;
  readonly status: 'ready' | 'applied' | 'closed';
  readonly revision: 0 | 1 | 2;
  readonly distillateCount: number;
  readonly schemaVersions: readonly number[];
  readonly period: string;
  readonly opaqueTokenCount: number;
  readonly suppression: { readonly belowThreshold: number; readonly sensitiveExcluded: number };
  readonly excludedEvidence: { readonly unreplayable: number; readonly rankMismatch: number };
  readonly candidateCaseCount: number;
  readonly candidateCases: readonly {
    readonly candidateKey: string;
    readonly query: string;
    readonly verdict: string;
    readonly devices: number;
  }[];
  readonly privacyWarnings: readonly string[];
  readonly dumpDeleted: boolean;
  readonly idempotent?: boolean;
}

export interface SessionStartRequest {
  readonly kind: ReviewSessionKind;
  readonly reviewedSize: number;
  readonly seed: string;
  readonly reviewer: string;
  readonly qualifiedReviewer: boolean;
  readonly authorizedHoldoutReview?: boolean;
}

export interface SessionMutationRequest {
  readonly requestId: string;
  readonly expectedRevision: number;
  readonly expectedDigest: string;
  readonly itemId?: string;
  readonly reason?: ReviewSkipReason;
  readonly requeue?: RequeuePolicy;
}

export interface StudioSessionView {
  readonly schemaVersion: 1;
  readonly kind: ReviewSessionKind;
  readonly status: 'open' | 'completed';
  readonly opaqueMembership: boolean;
  readonly priorityFormula: typeof REVIEW_PRIORITY_FORMULA;
  readonly sessionId?: string;
  readonly digest?: string;
  readonly revision?: number;
  readonly reviewer?: string;
  readonly reviewedSize?: number;
  readonly progress?: { readonly handled: number; readonly total: number; readonly remaining: number };
  readonly sourceCounts?: Readonly<Record<string, number>>;
  readonly queue?: readonly {
    readonly itemId: string;
    readonly query: string;
    readonly source: string;
    readonly selection: 'priority' | 'exploration';
    readonly priority: number;
    readonly state: 'queued' | 'completed' | 'skipped';
    readonly skip?: { readonly reason: ReviewSkipReason; readonly requeue: RequeuePolicy };
  }[];
}

export interface StudioQualityView {
  readonly schemaVersion: 1;
  readonly artifact: QualityDashboardReport['artifact'];
  readonly reviewCycleId: string;
  readonly candidateImprovement: {
    readonly verdict: QualityDashboardReport['candidateImprovement']['verdict'];
    readonly context: string;
    readonly blocked: boolean;
  };
  readonly partitions: ReturnType<typeof qualityDashboardAdmissionProjection> extends { calibration: infer C; holdout: infer H }
    ? { readonly calibration: C; readonly holdout: H }
    : never;
  readonly telemetry: ReturnType<typeof qualityDashboardAdmissionProjection>['telemetry'];
  readonly requiredGates: ReturnType<typeof qualityDashboardAdmissionProjection>['requiredGates'];
  readonly coverage: unknown;
  readonly cases: unknown;
  readonly admissions: unknown;
  readonly trends: readonly {
    readonly partition: 'calibration' | 'holdout';
    readonly metricKey: string;
    readonly points: readonly {
      readonly reviewCycleId: string;
      readonly observedAt: string;
      readonly numerator: number;
      readonly denominator: number;
      readonly sparse: boolean;
    }[];
    readonly latestDeltaPercentagePoints: number | null;
    readonly precision: string;
    readonly context: string;
  }[];
  readonly calibrationDrillLinks: readonly {
    readonly metricKey: string;
    readonly caseIds: readonly string[];
    readonly aggregateIds: readonly string[];
  }[];
  readonly holdout: { readonly membershipOpaque: true; readonly drillLinksAvailable: false };
  readonly redactedDigest: string;
}

export interface StudioOperationsOptions {
  readonly repoRoot: string;
  readonly engines: readonly ScriptureEngine[];
  readonly budgets: TelemetryBudgets;
  readonly categories: SensitiveCategories;
  readonly cases: () => readonly ReviewSessionCase[] | Promise<readonly ReviewSessionCase[]>;
  readonly qualityReport: () => QualityDashboardReport | Promise<QualityDashboardReport>;
  readonly repositoryStateDigest: () => string | Promise<string>;
  readonly artifactStateDigest: () => string | Promise<string>;
  readonly now?: () => string;
  readonly persistence?: {
    readonly recoverAudits?: (repoRoot: string) => Promise<void>;
    readonly previewAudit?: typeof previewTelemetryAudit;
    readonly applyAudit?: typeof applyTelemetryAudit;
    readonly closeAudit?: typeof closeTelemetryAudit;
    readonly readSessions?: () => Promise<SessionIndex>;
    readonly writeSessions?: (before: SessionIndex, after: SessionIndex) => Promise<void>;
  };
}

interface SessionIndex {
  readonly schemaVersion: 1;
  readonly sessions: readonly ReviewSession[];
}

function fail(code: string, message: string, status = 400): never {
  throw new StudioOperationsError(code, message, status);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, allowed: readonly string[], label: string): void {
  const expected = new Set(allowed);
  for (const key of Object.keys(value)) if (!expected.has(key)) fail('invalid_request', `${label} contains an unknown field.`);
}

function digest(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

function parseUploads(input: unknown): readonly AuditUploadFile[] {
  if (!isRecord(input)) fail('invalid_upload', 'Audit preview input must be an object.');
  exactKeys(input, ['files'], 'Audit preview input');
  if (!Array.isArray(input['files']) || input['files'].length === 0 || input['files'].length > MAX_AUDIT_FILES) {
    fail('invalid_upload', `Select between 1 and ${MAX_AUDIT_FILES} distillate files.`);
  }
  let total = 0;
  const names = new Set<string>();
  return input['files'].map((entry, index) => {
    if (!isRecord(entry)) fail('invalid_upload', `Audit file ${index + 1} must be an object.`);
    exactKeys(entry, ['filename', 'size', 'contentBase64'], `Audit file ${index + 1}`);
    const filename = entry['filename'];
    const size = entry['size'];
    const contentBase64 = entry['contentBase64'];
    if (typeof filename !== 'string' || !SAFE_UPLOAD_NAME.test(filename) || names.has(filename)) {
      fail('invalid_upload', 'Audit filenames must be unique portable JSON filenames.');
    }
    if (!Number.isInteger(size) || (size as number) < 1 || (size as number) > MAX_AUDIT_FILE_BYTES) {
      fail('invalid_upload', `Each audit file must be between 1 byte and ${MAX_AUDIT_FILE_BYTES} bytes.`);
    }
    if (typeof contentBase64 !== 'string' || contentBase64.length === 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(contentBase64)) {
      fail('invalid_upload', 'Audit file content must be canonical base64.');
    }
    const bytes = Buffer.from(contentBase64, 'base64');
    if (bytes.length !== size || bytes.toString('base64') !== contentBase64) fail('invalid_upload', 'Audit file size or base64 encoding does not match its bytes.');
    total += bytes.length;
    if (total > MAX_AUDIT_TOTAL_BYTES) fail('invalid_upload', `Selected audit files exceed ${MAX_AUDIT_TOTAL_BYTES} total bytes.`);
    names.add(filename);
    return { filename, size: size as number, contentBase64 };
  });
}

function auditView(preview: TelemetryAuditPreview, status?: 'applied' | 'closed', idempotent?: boolean): StudioAuditPreviewView {
  const summary = preview.summary;
  const visibleStatus: StudioAuditPreviewView['status'] = status ?? (
    preview.status === 'already-closed' ? 'closed' : preview.status === 'already-applied' ? 'applied' : 'ready'
  );
  const stable = {
    schemaVersion: 1 as const,
    auditDigest: summary.auditDigest,
    status: visibleStatus,
    revision: (status === 'closed' || preview.status === 'already-closed' ? 2 : status === 'applied' || preview.status === 'already-applied' ? 1 : 0) as 0 | 1 | 2,
    distillateCount: summary.distillateCount,
    schemaVersions: summary.schemaVersions,
    period: summary.period,
    opaqueTokenCount: summary.distinctAuditTokens,
    suppression: summary.suppression,
    excludedEvidence: summary.excludedEvidence,
    candidateCaseCount: summary.candidateCaseCount,
    candidateCases: summary.candidateCases.map((entry) => ({
      candidateKey: entry.candidateKey,
      query: entry.query,
      verdict: entry.verdict,
      devices: entry.devices,
    })),
    privacyWarnings: [
      'Below-threshold query forms are suppressed and are never shown or retained.',
      'Sensitive and unreplayable evidence is counted only; suppressed strings are never returned.',
      'Apply writes approved aggregate cases. Close deletes the temporary distillate dump.',
    ],
    dumpDeleted: status === 'closed' || preview.status === 'already-closed',
  };
  return { ...stable, ...(idempotent === undefined ? {} : { idempotent }), previewDigest: digest(stable) };
}

function parseAuditMutation(input: unknown, expectedRevision: 0 | 1): { auditDigest: string; previewDigest: string; expectedRevision: number } {
  if (!isRecord(input)) fail('invalid_request', 'Audit mutation input must be an object.');
  exactKeys(input, ['auditDigest', 'previewDigest', 'expectedRevision'], 'Audit mutation input');
  if (typeof input['auditDigest'] !== 'string' || !SHA256.test(input['auditDigest'])) fail('invalid_request', 'Audit digest is invalid.');
  if (typeof input['previewDigest'] !== 'string' || !SHA256.test(input['previewDigest'])) fail('invalid_request', 'Audit preview digest is invalid.');
  if (input['expectedRevision'] !== expectedRevision) fail('stale_preview', `Audit mutation requires revision ${expectedRevision}.`, 409);
  return input as unknown as { auditDigest: string; previewDigest: string; expectedRevision: number };
}

function parseSessionStart(input: unknown): SessionStartRequest {
  if (!isRecord(input)) fail('invalid_request', 'Session start input must be an object.');
  exactKeys(input, ['kind', 'reviewedSize', 'seed', 'reviewer', 'qualifiedReviewer', 'authorizedHoldoutReview'], 'Session start input');
  const kind = input['kind'];
  if (typeof kind !== 'string' || !(REVIEW_SESSION_KINDS as readonly string[]).includes(kind)) fail('invalid_request', 'Session kind is invalid.');
  if (!Number.isInteger(input['reviewedSize']) || (input['reviewedSize'] as number) < 1 || (input['reviewedSize'] as number) > 200) fail('invalid_request', 'Reviewed size must be between 1 and 200.');
  if (typeof input['seed'] !== 'string' || !IDENTIFIER.test(input['seed'])) fail('invalid_request', 'Session seed must be a stable identifier.');
  if (typeof input['reviewer'] !== 'string' || !IDENTIFIER.test(input['reviewer'])) fail('invalid_request', 'Reviewer must be a stable identifier.');
  if (typeof input['qualifiedReviewer'] !== 'boolean') fail('invalid_request', 'Pastoral qualification must be explicit.');
  if (input['authorizedHoldoutReview'] !== undefined && typeof input['authorizedHoldoutReview'] !== 'boolean') fail('invalid_request', 'Holdout authorization must be explicit.');
  if (kind === 'holdout' && input['authorizedHoldoutReview'] !== true) fail('holdout_authorization_required', 'Authorized review is required for a holdout session.', 403);
  return input as unknown as SessionStartRequest;
}

function parseSessionMutation(input: unknown): SessionMutationRequest {
  if (!isRecord(input)) fail('invalid_request', 'Session mutation input must be an object.');
  exactKeys(input, ['requestId', 'expectedRevision', 'expectedDigest', 'itemId', 'reason', 'requeue'], 'Session mutation input');
  if (typeof input['requestId'] !== 'string' || !IDENTIFIER.test(input['requestId'])) fail('invalid_request', 'Request identifier is invalid.');
  if (!Number.isInteger(input['expectedRevision']) || (input['expectedRevision'] as number) < 0) fail('invalid_request', 'Expected revision is invalid.');
  if (typeof input['expectedDigest'] !== 'string' || !SHA256.test(input['expectedDigest'])) fail('invalid_request', 'Expected session digest is invalid.');
  if (input['itemId'] !== undefined && (typeof input['itemId'] !== 'string' || !IDENTIFIER.test(input['itemId']))) fail('invalid_request', 'Session item identifier is invalid.');
  if (input['reason'] !== undefined && (typeof input['reason'] !== 'string' || !(REVIEW_SKIP_REASONS as readonly string[]).includes(input['reason']))) fail('invalid_request', 'Skip reason is invalid.');
  if (input['requeue'] !== undefined && input['requeue'] !== 'next-session' && input['requeue'] !== 'do-not-requeue') fail('invalid_request', 'Requeue outcome is invalid.');
  return input as unknown as SessionMutationRequest;
}

function parseSessionIndex(bytes: Buffer | null): SessionIndex {
  if (bytes === null) return { schemaVersion: 1, sessions: [] };
  let parsed: unknown;
  try { parsed = JSON.parse(bytes.toString('utf8')); } catch { fail('session_state_invalid', 'Stored session state is invalid.', 500); }
  if (!isRecord(parsed) || parsed['schemaVersion'] !== 1 || !Array.isArray(parsed['sessions'])) fail('session_state_invalid', 'Stored session state is invalid.', 500);
  return parsed as unknown as SessionIndex;
}

function stripEvidence(metric: CountMetric): Omit<CountMetric, 'evidence'>;
function stripEvidence(metric: RateMetric): Omit<RateMetric, 'evidence'>;
function stripEvidence(metric: CountMetric | RateMetric): Omit<CountMetric, 'evidence'> | Omit<RateMetric, 'evidence'> {
  const { evidence: _evidence, ...visible } = metric;
  return visible;
}

function sourceLinks(metric: RateMetric | CountMetric): EvidenceSourceLinks {
  return {
    recordIds: [...new Set([...metric.evidence.numerator.recordIds, ...metric.evidence.denominator.recordIds])].sort(),
    caseIds: [...new Set([...metric.evidence.numerator.caseIds, ...metric.evidence.denominator.caseIds])].sort(),
    aggregateIds: [...new Set([...metric.evidence.numerator.aggregateIds, ...metric.evidence.denominator.aggregateIds])].sort(),
  };
}

function calibrationMetrics(report: QualityDashboardReport): readonly (RateMetric | CountMetric)[] {
  const partition = report.partitions.calibration;
  const telemetry = report.telemetry.calibration;
  return [
    ...Object.values(partition.essentialSuccess.current), ...Object.values(partition.essentialSuccess.candidate),
    ...Object.values(partition.irrelevantRate.current), ...Object.values(partition.irrelevantRate.candidate),
    ...Object.values(partition.blindOutcomes),
    telemetry.current.zeroResultRate, telemetry.current.weakConversionRate, ...telemetry.current.convertedRankDistribution, ...Object.values(telemetry.current.convertedWithinRank),
    telemetry.candidate.zeroResultRate, telemetry.candidate.weakConversionRate, ...telemetry.candidate.convertedRankDistribution, ...Object.values(telemetry.candidate.convertedWithinRank),
  ];
}

export class StudioOperations {
  readonly #options: StudioOperationsOptions;
  readonly #auditPreviews = new Map<string, TelemetryAuditPreview>();

  constructor(options: StudioOperationsOptions) {
    this.#options = { ...options, repoRoot: path.resolve(options.repoRoot) };
  }

  async ready(): Promise<void> {
    await mkdir(path.join(this.#options.repoRoot, ...UPLOAD_ROOT.split('/')), { recursive: true });
    await (this.#options.persistence?.recoverAudits ?? recoverTelemetryAuditTransactions)(this.#options.repoRoot);
  }

  async previewAudit(input: unknown): Promise<StudioAuditPreviewView> {
    const files = parseUploads(input);
    const uploadRoot = path.join(this.#options.repoRoot, ...UPLOAD_ROOT.split('/'));
    const directory = await mkdtemp(path.join(uploadRoot, 'request-'));
    try {
      const selectedFiles: string[] = [];
      for (const file of files) {
        const target = path.join(directory, file.filename);
        await writeFile(target, Buffer.from(file.contentBase64, 'base64'), { flag: 'wx' });
        selectedFiles.push(target);
      }
      const preview = await (this.#options.persistence?.previewAudit ?? previewTelemetryAudit)({
        repoRoot: this.#options.repoRoot,
        selectedFiles,
        engines: this.#options.engines,
        budgets: this.#options.budgets,
        categories: this.#options.categories,
      });
      this.#auditPreviews.set(preview.summary.auditDigest, preview);
      return auditView(preview);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  async applyAudit(input: unknown): Promise<StudioAuditPreviewView> {
    const request = parseAuditMutation(input, 0);
    const preview = this.#auditPreviews.get(request.auditDigest);
    if (preview === undefined) fail('audit_preview_required', 'Preview this audit again before applying it.', 409);
    const current = auditView({ ...preview, status: 'ready' });
    if (current.previewDigest !== request.previewDigest) fail('stale_preview', 'Audit preview content changed.', 409);
    const applied = await (this.#options.persistence?.applyAudit ?? applyTelemetryAudit)(preview, this.#options.engines, this.#options.budgets, this.#options.categories);
    const next = { ...preview, status: 'already-applied' as const };
    this.#auditPreviews.set(request.auditDigest, next);
    return auditView(next, 'applied', applied.idempotent);
  }

  getAudit(auditDigest: string): StudioAuditPreviewView {
    if (!SHA256.test(auditDigest)) fail('invalid_route', 'Audit digest is invalid.');
    const preview = this.#auditPreviews.get(auditDigest);
    if (preview === undefined) fail('audit_preview_required', 'Reselect the distillate files to recover this audit preview.', 404);
    return auditView(preview);
  }

  async closeAudit(input: unknown): Promise<StudioAuditPreviewView> {
    const request = parseAuditMutation(input, 1);
    const preview = this.#auditPreviews.get(request.auditDigest);
    if (preview === undefined) fail('audit_preview_required', 'Preview this audit again before closing it.', 409);
    const expected = auditView({ ...preview, status: 'already-applied' });
    if (expected.previewDigest !== request.previewDigest) fail('stale_preview', 'Applied audit state changed.', 409);
    const closed = await (this.#options.persistence?.closeAudit ?? closeTelemetryAudit)(this.#options.repoRoot, request.auditDigest);
    const next = { ...preview, status: 'already-closed' as const };
    this.#auditPreviews.set(request.auditDigest, next);
    return auditView(next, 'closed', closed.idempotent);
  }

  async #readSessions(): Promise<SessionIndex> {
    if (this.#options.persistence?.readSessions) return this.#options.persistence.readSessions();
    return withMutationJournalReadLock(this.#options.repoRoot, async (scope) => parseSessionIndex(await scope.readFile(SESSION_INDEX_PATH)));
  }

  async #writeSessions(before: SessionIndex, after: SessionIndex): Promise<void> {
    if (this.#options.persistence?.writeSessions) return this.#options.persistence.writeSessions(before, after);
    const beforeBytes = before.sessions.length === 0 ? null : Buffer.from(`${canonicalJson(before)}\n`, 'utf8');
    const afterBytes = Buffer.from(`${canonicalJson(after)}\n`, 'utf8');
    const existing = await withMutationJournalReadLock(this.#options.repoRoot, (scope) => scope.readFile(SESSION_INDEX_PATH));
    const existingDigest = existing === null ? null : createHash('sha256').update(existing).digest('hex');
    if ((beforeBytes === null && existing !== null) || (beforeBytes !== null && (existing === null || !existing.equals(beforeBytes)))) {
      fail('session_conflict', 'Session state changed. Reload and retry.', 409);
    }
    const plan = await createMutationPlan(this.#options.repoRoot, [{ path: SESSION_INDEX_PATH, beforeSha256: existingDigest, after: afterBytes }]);
    await applyMutationPlan(this.#options.repoRoot, plan);
  }

  async listSessions(authorizedHoldoutReview = false): Promise<readonly StudioSessionView[]> {
    const index = await this.#readSessions();
    const cases = await this.#options.cases();
    return index.sessions.map((session) => this.#sessionView(session, cases, authorizedHoldoutReview));
  }

  async startSession(input: unknown): Promise<StudioSessionView> {
    const request = parseSessionStart(input);
    const cases = await this.#options.cases();
    const session = buildReviewSession({
      kind: request.kind,
      cases,
      seed: request.seed,
      reviewer: request.reviewer,
      ...(request.qualifiedReviewer ? { qualifiedReviewer: true } : {}),
      reviewedSize: request.reviewedSize ?? DEFAULT_REVIEWED_SIZE,
      repositoryStateDigest: await this.#options.repositoryStateDigest(),
      artifactStateDigest: await this.#options.artifactStateDigest(),
      now: (this.#options.now ?? (() => new Date().toISOString()))(),
    });
    const index = await this.#readSessions();
    const existing = index.sessions.find((entry) => entry.sessionId === session.sessionId);
    if (existing === undefined) await this.#writeSessions(index, { schemaVersion: 1, sessions: [...index.sessions, session].sort((left, right) => left.sessionId.localeCompare(right.sessionId)) });
    return this.#sessionView(existing ?? session, cases, request.authorizedHoldoutReview === true);
  }

  async getSession(sessionId: string, authorizedHoldoutReview = false): Promise<StudioSessionView> {
    if (!IDENTIFIER.test(sessionId)) fail('invalid_route', 'Session identifier is invalid.');
    const index = await this.#readSessions();
    const session = index.sessions.find((entry) => entry.sessionId === sessionId);
    if (session === undefined) fail('session_not_found', 'Review session was not found.', 404);
    return this.#sessionView(session, await this.#options.cases(), authorizedHoldoutReview);
  }

  async mutateSession(sessionId: string, action: 'complete-item' | 'skip-item' | 'complete-session', input: unknown, authorizedHoldoutReview = false): Promise<StudioSessionView> {
    const request = parseSessionMutation(input);
    const index = await this.#readSessions();
    const position = index.sessions.findIndex((entry) => entry.sessionId === sessionId);
    if (position < 0) fail('session_not_found', 'Review session was not found.', 404);
    const session = index.sessions[position]!;
    const duplicate = session.events.find((event) => event.eventId === request.requestId);
    if (duplicate !== undefined) {
      const expectedKind = action === 'complete-item' ? 'item-completed' : action === 'skip-item' ? 'item-skipped' : 'session-completed';
      const expectedCaseId = action === 'complete-session' ? undefined : this.#resolveItem(session, request.itemId, authorizedHoldoutReview);
      const same = duplicate.kind === expectedKind
        && (duplicate.kind === 'session-completed' || duplicate.caseId === expectedCaseId)
        && (duplicate.kind !== 'item-skipped' || (duplicate.reason === request.reason && duplicate.requeue === request.requeue));
      if (!same) fail('request_reused', 'Session request identifier was already used for different content.', 409);
      return this.#sessionView(session, await this.#options.cases(), authorizedHoldoutReview);
    }
    if (session.revision !== request.expectedRevision || session.digest !== request.expectedDigest) fail('stale_session', 'Session state changed. Reload and retry.', 409);
    const caseId = action === 'complete-session' ? undefined : this.#resolveItem(session, request.itemId, authorizedHoldoutReview);
    if (action !== 'complete-session' && caseId === undefined) fail('invalid_request', 'A session item is required.');
    if (action === 'skip-item' && (request.reason === undefined || request.requeue === undefined)) fail('invalid_request', 'Skip reason and requeue outcome are required.');
    if (action !== 'skip-item' && (request.reason !== undefined || request.requeue !== undefined)) fail('invalid_request', 'Skip fields are allowed only for skip actions.');
    const binding = {
      eventId: request.requestId,
      sessionId: session.sessionId,
      sessionDefinitionDigest: session.definitionDigest,
      expectedSessionDigest: session.digest,
      expectedRevision: session.revision,
      reviewer: session.reviewer,
      at: (this.#options.now ?? (() => new Date().toISOString()))(),
    };
    let event: ReviewSessionEvent;
    if (action === 'complete-item') event = { kind: 'item-completed', ...binding, caseId: caseId! };
    else if (action === 'skip-item') event = { kind: 'item-skipped', ...binding, caseId: caseId!, reason: request.reason!, requeue: request.requeue! };
    else event = { kind: 'session-completed', ...binding };
    const next = appendReviewSessionEvent(session, event);
    const sessions = [...index.sessions];
    sessions[position] = next;
    await this.#writeSessions(index, { schemaVersion: 1, sessions });
    return this.#sessionView(next, await this.#options.cases(), authorizedHoldoutReview);
  }

  #resolveItem(session: ReviewSession, itemId: string | undefined, authorized: boolean): string | undefined {
    if (itemId === undefined) return undefined;
    if (session.kind !== 'holdout') return session.orderedCaseIds.includes(itemId) ? itemId : undefined;
    if (!authorized) fail('holdout_authorization_required', 'Authorized review is required for holdout details.', 403);
    return session.orderedCaseIds.find((caseId) => this.#opaqueItemId(session, caseId) === itemId);
  }

  #opaqueItemId(session: ReviewSession, caseId: string): string {
    return `holdout-item-${digest([session.definitionDigest, caseId]).slice(0, 24)}`;
  }

  #sessionView(session: ReviewSession, cases: readonly ReviewSessionCase[], authorized: boolean): StudioSessionView {
    if (session.kind === 'holdout' && !authorized) return { schemaVersion: 1, kind: 'holdout', status: session.status, opaqueMembership: true, priorityFormula: REVIEW_PRIORITY_FORMULA };
    const caseMap = new Map(cases.map((entry) => [entry.caseId, entry]));
    const terminal = new Map(session.events.flatMap((event) => event.kind === 'session-completed' ? [] : [[event.caseId, event] as const]));
    const queue = session.items.map((item) => {
      const entry = caseMap.get(item.caseId);
      if (entry === undefined) fail('session_case_missing', 'A session case is no longer available.', 409);
      const event = terminal.get(item.caseId);
      return {
        itemId: session.kind === 'holdout' ? this.#opaqueItemId(session, item.caseId) : item.caseId,
        query: entry.query,
        source: entry.source,
        selection: item.selection,
        priority: item.priority.total,
        state: (event?.kind === 'item-completed' ? 'completed' : event?.kind === 'item-skipped' ? 'skipped' : 'queued') as 'queued' | 'completed' | 'skipped',
        ...(event?.kind === 'item-skipped' ? { skip: { reason: event.reason, requeue: event.requeue } } : {}),
      };
    });
    return {
      schemaVersion: 1,
      kind: session.kind,
      status: session.status,
      opaqueMembership: false,
      priorityFormula: session.priorityFormula,
      sessionId: session.sessionId,
      digest: session.digest,
      revision: session.revision,
      reviewer: session.reviewer,
      reviewedSize: session.definition.reviewedSize,
      progress: {
        handled: session.events.filter((event) => event.kind === 'item-completed' || event.kind === 'item-skipped').length,
        total: session.items.length,
        remaining: session.items.length - session.events.filter((event) => event.kind === 'item-completed' || event.kind === 'item-skipped').length,
      },
      sourceCounts: session.sourceCounts,
      queue,
    };
  }

  async quality(): Promise<StudioQualityView> {
    let report: QualityDashboardReport;
    try {
      report = await this.#options.qualityReport();
      assertQualityDashboardIntegrity(report);
    } catch {
      fail('quality_unavailable', 'Quality dashboard projection unavailable.', 503);
    }
    const admission = qualityDashboardAdmissionProjection(report);
    const coverage = {
      concepts: Object.fromEntries(Object.entries(report.coverage.concepts).map(([key, metric]) => [key, stripEvidence(metric)])),
      fixtures: Object.fromEntries(Object.entries(report.coverage.fixtures).map(([key, metric]) => [key, stripEvidence(metric)])),
    };
    const cases = Object.fromEntries(Object.entries(report.cases).map(([key, metric]) => [key, stripEvidence(metric)]));
    const admissions = report.admissions.map((entry) => ({ admissionId: entry.admissionId, changedProbes: stripEvidence(entry.changedProbes), acceptedRegressions: stripEvidence(entry.acceptedRegressions) }));
    const trends = report.trends.map((trend) => ({
      partition: trend.partition,
      metricKey: trend.metricKey,
      points: trend.points.map((point) => ({ reviewCycleId: point.reviewCycleId, observedAt: point.observedAt, numerator: point.numerator, denominator: point.denominator, sparse: point.sparse })),
      latestDeltaPercentagePoints: trend.latestDeltaPercentagePoints,
      precision: trend.precision,
      context: trend.context,
    }));
    const calibrationDrillLinks = calibrationMetrics(report).map((metric) => ({ metricKey: metric.metricKey, ...sourceLinks(metric) }))
      .filter((entry) => entry.caseIds.length > 0 || entry.aggregateIds.length > 0)
      .map(({ recordIds: _recordIds, ...entry }) => entry);
    const visible = {
      schemaVersion: 1 as const,
      artifact: admission.artifact,
      reviewCycleId: admission.reviewCycleId,
      candidateImprovement: {
        ...admission.candidateImprovement,
        blocked: admission.candidateImprovement.verdict.startsWith('blocked-') || admission.candidateImprovement.verdict === 'review-required',
      },
      partitions: { calibration: admission.calibration, holdout: admission.holdout },
      telemetry: admission.telemetry,
      requiredGates: admission.requiredGates,
      coverage,
      cases,
      admissions,
      trends,
      calibrationDrillLinks,
      holdout: { membershipOpaque: true as const, drillLinksAvailable: false as const },
    };
    return { ...visible, redactedDigest: digest(visible) };
  }
}

export const STUDIO_LIMITS = Object.freeze({
  maxAuditFiles: MAX_AUDIT_FILES,
  maxAuditFileBytes: MAX_AUDIT_FILE_BYTES,
  maxAuditTotalBytes: MAX_AUDIT_TOTAL_BYTES,
  defaultReviewedSize: DEFAULT_REVIEWED_SIZE,
});

export function createStudioRequestId(prefix: string): string {
  if (!/^[a-z][a-z0-9-]{0,31}$/.test(prefix)) fail('invalid_request', 'Request identifier prefix is invalid.');
  return `${prefix}:${randomUUID()}`;
}
