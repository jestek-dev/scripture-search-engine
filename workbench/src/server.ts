/**
 * Stages 1 and 2 — the viewer and the judgment log.
 *
 * Node's built-in `http`, bound to 127.0.0.1, zero dependencies beyond the
 * engine. `/api/search` returns the awaited `engine.research()` result
 * JSON-serialized VERBATIM — the three identities ride on every response
 * because `ResearchResult` is `ResearchOutcome & ResultIdentity`, and no
 * reshaping happens here: what the API returns is byte-for-byte what any
 * consumer would compute.
 *
 * Every write goes through `/api/v2/` against a captured review snapshot.
 * The retired v1 `POST /api/judgment` answers 410 for every method — the v1
 * log is closed, and no route can append a v1 line to
 * `workbench/judgments.jsonl`. The artifact stays read-only.
 *
 * Startup re-verifies the artifact's sha256 against the committed descriptor
 * every time. The workbench judges the reviewed artifact or nothing.
 */

import http from 'node:http';
import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { createEngine, targetIdFor, type ContentQueryPort } from '@jestek-dev/scripture-engine/internal';

import { databasePath, readDescriptor, repoRoot, type ArtifactDescriptor } from './descriptor.js';
import { aggregateHealth, identityOfDescriptor } from './health.js';
import {
  readGauntletHealth,
  readGitHealth,
  readGoldenAndCoverage,
  readJudgmentHealth,
  readLegacyLogHealth,
} from './healthSources.js';
import { createJudgmentLog } from './judgments.js';
import { rankInboxCases, type InboxCaseSnapshot } from './inbox.js';
import { buildInboxSeeds } from './inboxSources.js';
import { openCorpus } from './nodeSqlitePort.js';
import {
  CaseLog,
  ReviewSnapshotStore,
  captureReviewSnapshot,
  isCaseId,
  parseCaseCreateRequest,
  readCases,
  readJudgments,
  reviewSnapshotView,
} from './reviewCases.js';
import {
  applyJudgmentCompilationPlan,
  planJudgmentCompilation,
} from './compileJudgments.js';
import { recoverMutationJournals } from './applyJournal.js';
import { applyFixturePromotion, previewFixturePromotion } from './fixturePromotion.js';
import { createJobRunner, JOB_IDS, type JobId, type JobRecord } from './jobRunner.js';
import { resolveStaticSnapshot, StaticSnapshotError, type StaticAsset } from './staticSnapshot.js';
import { loadFontAssets } from './fontAssets.js';
import { loadSecondaryPages, SECONDARY_PAGES, writeSecondaryResponse } from './secondaryPages.js';
import {
  StartupListenError,
  issue as startupIssue,
  listenOnLoopback,
  preflightArtifactFile,
  preflightLog,
  startupFailureJson,
  startupState,
  type StartupIssue,
} from './startupPreflight.js';
import {
  BlindComparisonError,
  BlindComparisonStore,
  parseBlindJudgmentInput,
  parseMissingPassageInput,
  parseStartBlindSessionInput,
  readBlindFixturesFile,
} from './blindComparison.js';
import {
  StudioOperations,
  StudioOperationsError,
} from './studioOperations.js';
import {
  AdmissionPublishOperations,
  AdmissionPublishOperationsError,
} from './admissionPublishOperations.js';
import { REVIEW_PRIORITY_FORMULA, type ReviewSessionCase } from './reviewSessions.js';
import type { QualityDashboardReport } from './qualityDashboard.js';
import type { SensitiveCategories, TelemetryBudgets } from '../../pipeline/src/telemetry/index.js';

const PORT = Number(process.env.WORKBENCH_PORT ?? 8787);
const STATIC_PAGE = process.env.WORKBENCH_STATIC_PAGE_PATH ?? path.join(repoRoot, 'workbench', 'static', 'index.html');
const JUDGMENTS_PATH = process.env.WORKBENCH_JUDGMENTS_PATH ?? path.join(repoRoot, 'workbench', 'judgments.jsonl');
const CASES_PATH = process.env.WORKBENCH_CASES_PATH ?? path.join(repoRoot, 'workbench', 'cases.jsonl');
const RUNTIME_DATABASE_PATH = process.env.WORKBENCH_DATABASE_PATH ?? databasePath;
const GAUNTLET_REPORT_PATH = process.env.WORKBENCH_GAUNTLET_REPORT_PATH ?? path.join(repoRoot, 'eval', '.runs', 'gauntlet-report.json');
const MUTATION_REPO_ROOT = process.env.WORKBENCH_REPO_ROOT ?? repoRoot;
const REVIEWER = process.env.WORKBENCH_REVIEWER ?? 'jesse';
const CANDIDATES_ROOT = process.env.WORKBENCH_CANDIDATES_ROOT ?? path.join(MUTATION_REPO_ROOT, 'workbench', '.state', 'candidates');
const BLIND_EVENTS_PATH = process.env.WORKBENCH_BLIND_EVENTS_PATH ?? path.join(MUTATION_REPO_ROOT, 'workbench', 'review-data', 'blind-comparison.jsonl');
const BLIND_LOCK_ROOT = process.env.WORKBENCH_BLIND_LOCK_ROOT ?? MUTATION_REPO_ROOT;
const BLIND_FIXTURES_PATH = process.env.WORKBENCH_BLIND_FIXTURES_PATH;
const STUDIO_SESSION_CASES_PATH = process.env.WORKBENCH_STUDIO_SESSION_CASES_PATH;
const STUDIO_QUALITY_REPORT_PATH = process.env.WORKBENCH_STUDIO_QUALITY_REPORT_PATH ?? path.join(MUTATION_REPO_ROOT, 'workbench', 'review-data', 'quality-dashboard.json');
const STUDIO_AUDIT_POLICY_PATH = process.env.WORKBENCH_STUDIO_AUDIT_POLICY_PATH;
const SENSITIVE_CATEGORIES_PATH = process.env.WORKBENCH_SENSITIVE_CATEGORIES_PATH ?? path.join(repoRoot, 'pipeline', 'telemetry', 'sensitive-categories.json');
const ADMISSION_EVIDENCE_PATH = process.env.WORKBENCH_ADMISSION_EVIDENCE_PATH ?? path.join(MUTATION_REPO_ROOT, 'workbench', 'review-data', 'admission-evidence.json');
const FALLBACK_PAGE = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Workbench unavailable</title></head><body><main><h1>Workbench unavailable</h1><p>The workbench is in safe fallback mode. Health diagnostics remain available at /api/v2/health.</p></main></body></html>';

/** Judgment posts are small; anything bigger than this is not a judgment. */
const MAX_BODY_BYTES = 64 * 1024;
const MAX_AUDIT_BODY_BYTES = 6 * 1024 * 1024;

function readJsonBody(request: http.IncomingMessage, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytes = 0;
    let tooLarge = false;
    request
      .on('data', (chunk: Buffer) => {
        if (tooLarge) return;
        bytes += chunk.length;
        if (bytes > maxBytes) {
          tooLarge = true;
          reject(new Error('Request body too large.'));
          return;
        }
        chunks.push(chunk);
      })
      .on('error', reject)
      .on('end', () => {
        if (tooLarge) return;
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch {
          reject(new Error('Request body is not valid JSON.'));
        }
      });
  });
}

function sendJson(response: http.ServerResponse, status: number, body: string): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(body);
}

function sendError(response: http.ServerResponse, status: number, message: string): void {
  sendJson(response, status, JSON.stringify({ error: message }));
}

function sendV2Success(response: http.ServerResponse, status: number, data: unknown): void {
  sendJson(response, status, JSON.stringify({ ok: true, data }));
}

function sendV2Error(
  response: http.ServerResponse,
  status: number,
  code: string,
  message: string,
  details?: unknown,
): void {
  sendJson(response, status, JSON.stringify({
    ok: false,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  }));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isJobId(value: unknown): value is JobId {
  return typeof value === 'string' && JOB_IDS.includes(value as JobId);
}

function jobIsFinished(record: JobRecord): boolean {
  return record.state !== 'queued' && record.state !== 'running';
}

function trustedMutationRequest(request: http.IncomingMessage): boolean {
  const contentType = request.headers['content-type'];
  if (typeof contentType !== 'string' || contentType.split(';', 1)[0]!.trim().toLowerCase() !== 'application/json') return false;
  const host = request.headers.host;
  if (typeof host !== 'string') return false;
  let hostUrl: URL;
  try { hostUrl = new URL(`http://${host}`); } catch { return false; }
  const hostName = hostUrl.hostname.toLowerCase();
  if ((hostName !== '127.0.0.1' && hostName !== 'localhost') || hostUrl.host.toLowerCase() !== host.toLowerCase()) return false;
  const origin = request.headers.origin;
  if (origin === undefined) return true;
  try {
    const parsed = new URL(origin);
    return (
      parsed.protocol === 'http:' &&
      parsed.username === '' && parsed.password === '' &&
      parsed.pathname === '/' && parsed.search === '' && parsed.hash === '' &&
      parsed.host.toLowerCase() === hostUrl.host.toLowerCase()
    );
  } catch {
    return false;
  }
}

function requiresTrustedJson(pathname: string): boolean {
  return (
    pathname === '/api/v2/checks' ||
    pathname === '/api/v2/compile/preview' ||
    pathname === '/api/v2/compile/apply' ||
    pathname === '/api/v2/cases' ||
    pathname === '/api/v2/judgments' ||
    /^\/api\/v2\/cases\/[^/]+\/state$/.test(pathname) ||
    /^\/api\/v2\/jobs\/[^/]+\/cancel$/.test(pathname) ||
    /^\/api\/v2\/fixtures\/[^/]+\/promotion\/(preview|apply)$/.test(pathname) ||
    /^\/api\/v2\/candidates\/[^/]+\/blind-sessions(?:\/[^/]+\/(?:judgments|missing-passages))?$/.test(pathname) ||
    pathname === '/api/v2/audits/preview' ||
    pathname === '/api/v2/audits/apply' ||
    pathname === '/api/v2/audits/close' ||
    pathname === '/api/v2/sessions' ||
    /^\/api\/v2\/sessions\/[^/]+\/(?:complete-item|skip-item|complete-session)$/.test(pathname) ||
    /^\/api\/v2\/admissions\/[^/]+\/admit$/.test(pathname) ||
    /^\/api\/v2\/publish\/[^/]+\/prepare$/.test(pathname)
  );
}

function sendStudioError(response: http.ServerResponse, error: unknown): void {
  response.setHeader('cache-control', 'no-store');
  if (error instanceof StudioOperationsError) {
    sendV2Error(response, error.status, error.code, error.message);
    return;
  }
  sendV2Error(response, 500, 'studio_operation_failed', 'Studio operation failed. Reload and retry.');
}

function sendAdmissionPublishError(response: http.ServerResponse, error: unknown): void {
  response.setHeader('cache-control', 'no-store');
  if (error instanceof AdmissionPublishOperationsError) {
    sendV2Error(response, error.status, error.code, error.message);
    return;
  }
  sendV2Error(response, 500, 'admission_publish_failed', 'Admission or publish preparation failed. Reload and retry.');
}

function digestJson(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function sendBlindError(response: http.ServerResponse, error: unknown): void {
  response.setHeader('cache-control', 'no-store');
  if (error instanceof BlindComparisonError) {
    sendV2Error(response, error.status, error.code, error.message);
    return;
  }
  sendV2Error(response, 500, 'blind_comparison_failed', error instanceof Error ? error.message : 'Blind comparison request failed.');
}

function sendBlindSuccess(response: http.ServerResponse, status: number, data: unknown): void {
  response.setHeader('cache-control', 'no-store');
  sendV2Success(response, status, data);
}

function decodeSegment(value: string): string | null {
  try {
    const decoded = decodeURIComponent(value);
    return decoded.includes('/') || decoded.includes('\\') ? null : decoded;
  } catch {
    return null;
  }
}

/**
 * The stored excerpt for a `missing` judgment: the passage's own words,
 * bounded so a whole-chapter reference cannot bloat a log line. 280
 * characters holds any single verse and enough of a longer passage to defend
 * the judgment.
 */
const EXCERPT_MAX_CHARS = 280;

function passageExcerpt(verses: readonly { text: string }[]): string {
  const text = verses.map((verse) => verse.text.trim()).join(' ');
  return text.length <= EXCERPT_MAX_CHARS ? text : `${text.slice(0, EXCERPT_MAX_CHARS - 1).trimEnd()}…`;
}

async function conceptList(port: ContentQueryPort): Promise<unknown> {
  const { rows } = await port.execute('SELECT id, label FROM concepts ORDER BY id');
  return rows;
}

async function conceptDetail(port: ContentQueryPort, conceptId: string): Promise<unknown | null> {
  const concept = await port.execute('SELECT id, label FROM concepts WHERE id = ?', [conceptId]);
  if (concept.rows.length === 0) return null;
  const [lexicon, anchors, related] = await Promise.all([
    port.execute(
      'SELECT phrase, normalized, token_count FROM concept_lexicon WHERE concept_id = ?',
      [conceptId],
    ),
    port.execute(
      'SELECT start_verse_id, end_verse_id, source_id, weight, locator FROM concept_anchors WHERE concept_id = ?',
      [conceptId],
    ),
    port.execute('SELECT related_id FROM concept_related WHERE concept_id = ?', [conceptId]),
  ]);
  return {
    ...concept.rows[0],
    lexicon: lexicon.rows,
    anchors: anchors.rows,
    related: related.rows.map((row) => row.related_id),
  };
}

function engineIdentityMismatchFields(
  descriptor: ArtifactDescriptor,
  engine: Awaited<ReturnType<typeof createEngine>>,
): readonly string[] {
  return [
    ...(engine.engineVersion === descriptor.engineVersion ? [] : ['engineVersion']),
    ...(engine.corpusFingerprint === descriptor.corpusFingerprint ? [] : ['corpusFingerprint']),
    ...(engine.layerFingerprint === descriptor.layerFingerprint ? [] : ['layerFingerprint']),
  ];
}

async function closeArtifact(
  engine: Awaited<ReturnType<typeof createEngine>> | null,
  port: ReturnType<typeof openCorpus> | null,
): Promise<void> {
  try {
    if (engine !== null) {
      await engine.close();
      return;
    }
    if (port !== null) await port.close();
  } catch {
    // The process remains available for diagnostics even if SQLite cleanup fails.
  }
}

async function main(): Promise<void> {
  const startupIssues: StartupIssue[] = [];
  try {
    await recoverMutationJournals(MUTATION_REPO_ROOT);
  } catch (error) {
    startupIssues.push(startupIssue(
      'recovery_failed',
      'recovery',
      `Interrupted repository apply could not be recovered: ${error instanceof Error ? error.message : 'unknown error'}`,
      'Resolve the journal error under workbench/.state before making repository changes.',
    ));
  }
  let staticAssets: ReadonlyMap<string, StaticAsset> = new Map([
    ['/', { body: Buffer.from(FALLBACK_PAGE), contentType: 'text/html; charset=utf-8', sha256: '' }],
  ]);
  let staticSnapshotAvailable = false;
  try {
    staticAssets = (await resolveStaticSnapshot(STATIC_PAGE)).assets;
    staticSnapshotAvailable = true;
  } catch (error) {
    const snapshotError = error instanceof StaticSnapshotError ? error : null;
    startupIssues.push(startupIssue(
      snapshotError?.code ?? 'static_snapshot_stale',
      'static',
      `Workbench static page is unavailable: ${error instanceof Error ? error.message : 'unknown error'}`,
      'Restore a complete compatible workbench static snapshot, then restart the workbench.',
      snapshotError?.details,
    ));
  }

  // The two additive static mechanisms (plan §4.2). Both load independently
  // of preflight and serve in degraded startup mode; a missing secondary
  // file or font directory is not a startup issue.
  const secondaryPages = await loadSecondaryPages(path.join(repoRoot, 'workbench'), SECONDARY_PAGES);
  const fontAssets = await loadFontAssets(path.join(repoRoot, 'workbench', 'static', 'fonts'));

  let descriptor: ArtifactDescriptor | null = null;
  let artifactFailure = 'The reviewed artifact is unavailable.';
  try {
    descriptor = await readDescriptor();
  } catch (error) {
    artifactFailure = `Release descriptor is unavailable: ${error instanceof Error ? error.message : 'unknown error'}`;
    startupIssues.push(startupIssue(
      'descriptor_unavailable',
      'descriptor',
      artifactFailure,
      'Restore a valid artifacts/content-artifact.json release descriptor, then restart.',
    ));
  }

  let port: ReturnType<typeof openCorpus> | null = null;
  let engine: Awaited<ReturnType<typeof createEngine>> | null = null;
  if (descriptor !== null) {
    try {
      const artifactIssue = await preflightArtifactFile(RUNTIME_DATABASE_PATH, descriptor);
      if (artifactIssue !== null) {
        artifactFailure = artifactIssue.message;
        startupIssues.push(artifactIssue);
      } else {
        port = openCorpus(RUNTIME_DATABASE_PATH);
        engine = await createEngine(port);
        const mismatchFields = engineIdentityMismatchFields(descriptor, engine);
        if (mismatchFields.length > 0) {
          artifactFailure =
            `Artifact identity mismatch: opened engine disagrees with the release descriptor on ` +
            `${mismatchFields.join(', ')}.`;
          startupIssues.push(startupIssue(
            'artifact_identity_mismatch',
            'artifact',
            artifactFailure,
            'Fetch the artifact named by the current descriptor and restart the workbench.',
            { mismatchFields },
          ));
          await closeArtifact(engine, port);
          port = null;
          engine = null;
        }
      }
    } catch (error) {
      artifactFailure = `Reviewed artifact preflight failed: ${error instanceof Error ? error.message : 'unknown error'}`;
      startupIssues.push(startupIssue(
        'artifact_open_failed',
        'artifact',
        artifactFailure,
        'Re-fetch the reviewed artifact; if the problem remains, verify SQLite and engine compatibility.',
      ));
      await closeArtifact(engine, port);
      port = null;
      engine = null;
    }
  }

  const [caseLogIssue, judgmentLogIssue] = await Promise.all([
    preflightLog('case', CASES_PATH, () => readCases(CASES_PATH)),
    preflightLog('judgment', JUDGMENTS_PATH, () => readJudgments(JUDGMENTS_PATH)),
  ]);
  if (caseLogIssue !== null) startupIssues.push(caseLogIssue);
  if (judgmentLogIssue !== null) startupIssues.push(judgmentLogIssue);

  let blindComparisons: BlindComparisonStore | null = null;
  try {
    const fixtures = BLIND_FIXTURES_PATH === undefined ? undefined : await readBlindFixturesFile(BLIND_FIXTURES_PATH);
    blindComparisons = new BlindComparisonStore({
      eventLogPath: BLIND_EVENTS_PATH,
      reviewer: REVIEWER,
      lockRoot: BLIND_LOCK_ROOT,
      ...(fixtures === undefined ? { candidatesRoot: CANDIDATES_ROOT } : { fixtures }),
      ...(fixtures === undefined && engine !== null ? { expectedReferenceIdentity: {
        engineVersion: engine.engineVersion,
        corpusFingerprint: engine.corpusFingerprint,
        layerFingerprint: engine.layerFingerprint,
      } } : {}),
    });
    await blindComparisons.ready();
  } catch (error) {
    startupIssues.push(startupIssue(
      'recovery_failed',
      'recovery',
      `Candidate comparison state is invalid: ${error instanceof Error ? error.message : 'unknown error'}`,
      'Restore a verified comparison publication and append-only blind review log, then restart.',
    ));
    blindComparisons = null;
  }

  const machineStartup = startupState(startupIssues);
  const startupDiagnostics = startupIssues.map((entry) => `${entry.message} ${entry.remediation}`);
  const degradedReadOnly = machineStartup.mode === 'degraded-read-only';
  if (degradedReadOnly && !staticSnapshotAvailable) {
    staticAssets = new Map([
      ['/', { body: Buffer.from(FALLBACK_PAGE), contentType: 'text/html; charset=utf-8', sha256: '' }],
    ]);
  }

  // Every judging session starts by seeing exactly what it is judging.
  if (engine !== null) {
    console.log(`engineVersion:     ${engine.engineVersion}`);
    console.log(`corpusFingerprint: ${engine.corpusFingerprint}`);
    console.log(`layerFingerprint:  ${engine.layerFingerprint}`);
  } else {
    console.warn(`Workbench started in degraded read-only mode. ${artifactFailure}`);
  }

  // Reviewer is a static string (plan decision 5); identities are stamped
  // from the running engine, never taken from the client.
  const reviewer = REVIEWER;
  console.log(`reviewer:          ${reviewer}`);
  const caseLog = engine === null || degradedReadOnly ? null : new CaseLog({
    path: CASES_PATH,
    reviewer,
    artifact: {
      engineVersion: engine.engineVersion,
      corpusFingerprint: engine.corpusFingerprint,
      layerFingerprint: engine.layerFingerprint,
    },
  });
  let studioOperations: StudioOperations | null = null;
  const admissionPublishOperations = new AdmissionPublishOperations({
    repoRoot: MUTATION_REPO_ROOT,
    evidencePath: ADMISSION_EVIDENCE_PATH,
    reviewer: REVIEWER,
    signingKey: process.env.WORKBENCH_ADMISSION_SIGNING_KEY,
  });
  if (engine !== null && caseLog !== null) {
    try {
      let budgets: TelemetryBudgets = { minDistinctDevices: 3, rawRetentionDays: 90, weakConvertedRank: 3 };
      let categories = JSON.parse(await readFile(SENSITIVE_CATEGORIES_PATH, 'utf8')) as SensitiveCategories;
      if (STUDIO_AUDIT_POLICY_PATH !== undefined) {
        const policy = JSON.parse(await readFile(STUDIO_AUDIT_POLICY_PATH, 'utf8')) as { budgets?: TelemetryBudgets; categories?: SensitiveCategories };
        if (policy.budgets !== undefined) budgets = policy.budgets;
        if (policy.categories !== undefined) categories = policy.categories;
      }
      const studioCases = async (): Promise<readonly ReviewSessionCase[]> => {
        if (STUDIO_SESSION_CASES_PATH !== undefined) {
          const parsed = JSON.parse(await readFile(STUDIO_SESSION_CASES_PATH, 'utf8')) as unknown;
          if (!Array.isArray(parsed)) throw new Error('Studio session fixture must be an array.');
          return parsed as readonly ReviewSessionCase[];
        }
        return (await caseLog.read()).map((entry) => {
          const createdAt = entry.events[0]?.at ?? new Date(0).toISOString();
          const outcomeClass = entry.source === 'regression' ? 'regressed'
            : entry.source === 'stale-judgment' ? 'stale'
              : entry.source === 'calibration' ? 'calibration'
                : entry.state === 'rejected' || entry.state === 'needs-engineering' ? 'failure'
                  : entry.state === 'admitted' || entry.state === 'merged' || entry.state === 'monitored' ? 'healthy'
                    : 'ambiguous';
          return {
            caseId: entry.caseId,
            query: entry.query,
            source: entry.source,
            outcomeClass,
            deviceCount: 0,
            convertedRank: null,
            recurrence: Math.max(1, entry.events.length),
            createdAt,
            ...(entry.source === 'stale-judgment' ? { stale: true } : {}),
            ...(entry.source === 'regression' ? { candidateRegression: true } : {}),
            ...(entry.source === 'calibration' ? { calibration: true } : {}),
          } satisfies ReviewSessionCase;
        });
      };
      studioOperations = new StudioOperations({
        repoRoot: MUTATION_REPO_ROOT,
        engines: [engine],
        budgets,
        categories,
        cases: studioCases,
        qualityReport: async () => JSON.parse(await readFile(STUDIO_QUALITY_REPORT_PATH, 'utf8')) as QualityDashboardReport,
        repositoryStateDigest: async () => digestJson(await studioCases()),
        artifactStateDigest: () => digestJson({ engineVersion: engine!.engineVersion, corpusFingerprint: engine!.corpusFingerprint, layerFingerprint: engine!.layerFingerprint }),
      });
      await studioOperations.ready();
    } catch (error) {
      console.warn(`Studio operations unavailable: ${error instanceof Error ? error.message : 'unknown error'}`);
      studioOperations = null;
    }
  }
  const reviewSnapshots = new ReviewSnapshotStore();
  const jobRunner = createJobRunner({ mutationRepoRoot: MUTATION_REPO_ROOT });
  await jobRunner.ready();
  let activeRepositoryMutation: { readonly kind: string; readonly id: string } | null = null;
  const inboxResultCountByQuery = new Map<string, number>();
  let v2JudgmentTail: Promise<void> = Promise.resolve();

  async function submitV2Judgment(
    caseId: string,
    snapshotToken: string,
    body: Record<string, unknown>,
  ): Promise<{ readonly ok: true; readonly record: unknown } | { readonly ok: false; readonly code: string; readonly message: string }> {
    const run = v2JudgmentTail.then(async () => {
      if (engine === null || caseLog === null) {
        return { ok: false as const, code: 'artifact_unavailable', message: artifactFailure };
      }
      const cases = await caseLog.read();
      if (!cases.some((entry) => entry.caseId === caseId)) {
        return { ok: false as const, code: 'case_not_found', message: 'The review case no longer exists.' };
      }
      const snapshot = reviewSnapshots.get(caseId, snapshotToken);
      if (snapshot === undefined) {
        return { ok: false as const, code: 'review_snapshot_required', message: 'Open this case and submit against its current review snapshot.' };
      }
      const history = await readJudgments(JUDGMENTS_PATH);
      const log = createJudgmentLog({
        logPath: JUDGMENTS_PATH,
        reviewer,
        identity: {
          engineVersion: engine.engineVersion,
          corpusFingerprint: engine.corpusFingerprint,
          layerFingerprint: engine.layerFingerprint,
        },
        v2Context: snapshot.context,
        getExistingJudgments: async () => history,
        resolveReference: async (reference) => {
          const outcome = await engine.passage(reference);
          return outcome.kind === 'passage' ? passageExcerpt(outcome.passage.verses) : null;
        },
        resolveReferenceTargetId: async (reference) => {
          const outcome = await engine.passage(reference);
          return outcome.kind === 'passage' && outcome.passage.verses.length === 1
            ? targetIdFor(outcome.passage.verses[0]!)
            : null;
        },
      });
      const result = await log.submit(body);
      return result.ok
        ? { ok: true as const, record: result.record }
        : { ok: false as const, code: 'validation_failed', message: result.reason };
    });
    v2JudgmentTail = run.then(() => undefined, () => undefined);
    try {
      return await run;
    } catch (error) {
      return {
        ok: false,
        code: 'review_data_invalid',
        message: error instanceof Error ? error.message : 'Review data is invalid.',
      };
    }
  }

  const meta = engine === null || descriptor === null ? null : {
    engineVersion: engine.engineVersion,
    corpusFingerprint: engine.corpusFingerprint,
    layerFingerprint: engine.layerFingerprint,
    schemaVersion: descriptor.schemaVersion,
    translations: descriptor.translations,
  };

  // The page is read ONCE, here, not per request. The page and the judgment
  // validator must come from the same checkout: when the page was re-read
  // from disk on every GET, a `git pull` under a running server silently
  // swapped in a newer page whose payloads the older in-memory validator
  // rejected (v1.1's causeInferred came back `Unknown field` that way, and
  // every ✗ was refused until the process restarted). One snapshot per
  // process keeps UI and validation in lockstep; restart to pick up changes.
  let shuttingDown = false;
  const server = http.createServer((request, response) => {
    void (async () => {
      const url = new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`);
      const isV2Request = url.pathname.startsWith('/api/v2/');

      if (request.method === 'POST' && requiresTrustedJson(url.pathname) && !trustedMutationRequest(request)) {
        if (isV2Request) {
          sendV2Error(response, 403, 'untrusted_request', 'Workbench writes require same-origin JSON from localhost.');
        } else {
          sendError(response, 403, 'Workbench writes require same-origin JSON from localhost.');
        }
        return;
      }

      if (request.method === 'POST' && requiresTrustedJson(url.pathname) && degradedReadOnly) {
        if (isV2Request) {
          sendV2Error(
            response,
            503,
            'startup_degraded_read_only',
            'Workbench startup preflight failed; all mutations are disabled.',
            machineStartup,
          );
        } else {
          sendError(response, 503, 'Workbench startup preflight failed; all mutations are disabled.');
        }
        return;
      }

      if (url.pathname === '/api/v2/health') {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed for /api/v2/health.');
          return;
        }
        const [{ golden, coverage }, judgmentRows, gauntlet, git, legacyLog] = await Promise.all([
          readGoldenAndCoverage(),
          readJudgmentHealth(),
          readGauntletHealth(),
          readGitHealth(),
          readLegacyLogHealth(),
        ]);
        const artifactIdentity =
          engine === null
            ? null
            : {
                engineVersion: engine.engineVersion,
                corpusFingerprint: engine.corpusFingerprint,
                layerFingerprint: engine.layerFingerprint,
              };
        const health = aggregateHealth({
          release: descriptor === null ? null : identityOfDescriptor(descriptor),
          artifact: artifactIdentity,
          golden,
          coverage,
          judgments: judgmentRows,
          gauntlet,
          git,
          startup: { diagnostics: startupDiagnostics },
          legacyLog,
        });
        sendV2Success(response, 200, {
          ...health,
          startup: { ...health.startup, ...machineStartup },
        });
        return;
      }

      if (url.pathname === '/api/v2/context') {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed for /api/v2/context.');
          return;
        }
        if (engine === null) {
          sendV2Error(response, 503, 'artifact_unavailable', artifactFailure);
          return;
        }
        const reference = url.searchParams.get('ref')?.trim() ?? '';
        if (reference === '') {
          sendV2Error(response, 400, 'bad_request', 'A passage reference is required.');
          return;
        }
        const exact = await engine.passage(reference);
        if (exact.kind !== 'passage' || exact.passage.verses.length === 0) {
          sendV2Error(response, 400, 'invalid_reference', `"${reference}" is not a reference the engine can resolve.`);
          return;
        }
        const first = exact.passage.verses[0]!;
        const last = exact.passage.verses.at(-1)!;
        let context = exact;
        if (first.bookId === last.bookId && first.chapter === last.chapter) {
          const start = Math.max(1, first.verse - 2);
          const end = last.verse + 2;
          const expanded = await engine.passage(`${first.bookName} ${first.chapter}:${start}-${end}`);
          if (expanded.kind === 'passage' && expanded.passage.verses.length > 0) context = expanded;
        }
        sendV2Success(response, 200, { requestedReference: reference, context });
        return;
      }

      if (url.pathname === '/api/v2/inbox') {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed for /api/v2/inbox.');
          return;
        }
        if (engine === null || caseLog === null) {
          sendV2Error(response, 503, 'artifact_unavailable', artifactFailure);
          return;
        }
        try {
          const [{ coverage }, judgmentRows, cases, gauntletState] = await Promise.all([
            readGoldenAndCoverage(),
            readJudgmentHealth(),
            caseLog.read(),
            readGauntletHealth(GAUNTLET_REPORT_PATH),
          ]);
          let gauntletReport: unknown;
          try {
            if (gauntletState.fresh !== true) throw new Error('Gauntlet report is not current.');
            gauntletReport = JSON.parse(await readFile(GAUNTLET_REPORT_PATH, 'utf8')) as unknown;
          } catch {
            gauntletReport = undefined;
          }
          const now = new Date();
          const identity = {
            engineVersion: engine.engineVersion,
            corpusFingerprint: engine.corpusFingerprint,
            layerFingerprint: engine.layerFingerprint,
          };
          const seeds = buildInboxSeeds({
            cases,
            coverage,
            judgments: judgmentRows,
            currentArtifact: identity,
            gauntletReport,
            now,
          }).filter((seed) => seed.state === 'new' || seed.state === 'reviewing');
          const scored: { readonly seed: (typeof seeds)[number]; readonly item: InboxCaseSnapshot }[] = [];
          for (const seed of seeds) {
            let resultCount = inboxResultCountByQuery.get(seed.query);
            if (resultCount === undefined) {
              const result = await engine.research(seed.query);
              resultCount = result.kind === 'discovery'
                ? result.results.length
                : result.kind === 'reference'
                  ? result.passage.verses.length
                  : 0;
              inboxResultCountByQuery.set(seed.query, resultCount);
            }
            scored.push({
              seed,
              item: {
                caseId: seed.id,
                query: seed.query,
                source: seed.source,
                state: seed.state,
                reviewer: seed.reviewer,
                artifact: seed.artifact,
                sensitivity: seed.sensitive ? 'sensitive' : 'standard',
                ageDays: Math.max(0, (now.getTime() - Date.parse(seed.createdAt)) / 86_400_000),
                resultCount,
                blockingGateFinding: seed.blockingGateFinding,
                judgmentFreshness: seed.staleJudgment ? 'stale' : 'fresh',
                conceptCoverage: seed.uncoveredConcept ? 'uncovered' : 'covered',
              },
            });
          }
          const seedById = new Map(scored.map(({ seed }) => [seed.id, seed]));
          const items = rankInboxCases(scored.map(({ item }) => item)).slice(0, 100).map((ranked) => {
            const seed = seedById.get(ranked.item.caseId)!;
            return {
              kind: seed.kind,
              ...(seed.case === undefined ? {
                suggestion: { id: seed.id, query: seed.query, source: seed.source },
              } : { case: seed.case }),
              reason: `${ranked.explanation}. ${seed.reason}`,
              resultCount: ranked.item.resultCount,
              score: ranked.score,
              meta: {
                source: ranked.item.source,
                state: ranked.item.state,
                sensitivity: ranked.item.sensitivity,
                reviewer: ranked.item.reviewer,
                artifact: ranked.item.artifact,
                ageDays: ranked.item.ageDays,
              },
            };
          });
          sendV2Success(response, 200, { items });
        } catch (error) {
          sendV2Error(response, 500, 'inbox_unavailable', error instanceof Error ? error.message : 'Inbox could not be built.');
        }
        return;
      }

      if (url.pathname === '/api/v2/quality') {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed for /api/v2/quality.');
          return;
        }
        if ([...url.searchParams].length > 0) {
          sendV2Error(response, 400, 'invalid_route', 'Quality does not accept query parameters.');
          return;
        }
        if (studioOperations === null) {
          sendV2Error(response, 503, 'studio_unavailable', 'Studio quality data is unavailable.');
          return;
        }
        try {
          response.setHeader('cache-control', 'no-store');
          sendV2Success(response, 200, { quality: await studioOperations.quality(), readOnly: degradedReadOnly });
        } catch (error) { sendStudioError(response, error); }
        return;
      }

      if (url.pathname === '/api/v2/sessions') {
        if (request.method !== 'GET' && request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET and POST are allowed for /api/v2/sessions.');
          return;
        }
        if (studioOperations === null) {
          sendV2Error(response, 503, 'studio_unavailable', 'Studio session data is unavailable.');
          return;
        }
        try {
          response.setHeader('cache-control', 'no-store');
          if (request.method === 'GET') {
            const scope = url.searchParams.get('scope');
            if ([...url.searchParams].length > (scope === null ? 0 : 1) || (scope !== null && scope !== 'authorized-review')) {
              throw new StudioOperationsError('invalid_route', 'Session scope is invalid.');
            }
            sendV2Success(response, 200, { sessions: await studioOperations.listSessions(scope === 'authorized-review'), priorityFormula: REVIEW_PRIORITY_FORMULA, readOnly: degradedReadOnly });
          } else {
            if ([...url.searchParams].length > 0) throw new StudioOperationsError('invalid_route', 'Session creation does not accept query parameters.');
            sendV2Success(response, 201, { session: await studioOperations.startSession(await readJsonBody(request)), readOnly: degradedReadOnly });
          }
        } catch (error) { sendStudioError(response, error); }
        return;
      }

      const studioSessionMatch = /^\/api\/v2\/sessions\/([^/]+)$/.exec(url.pathname);
      if (studioSessionMatch !== null) {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed to resume a Studio session.');
          return;
        }
        if (studioOperations === null) {
          sendV2Error(response, 503, 'studio_unavailable', 'Studio session data is unavailable.');
          return;
        }
        const sessionId = decodeSegment(studioSessionMatch[1]!);
        const scope = url.searchParams.get('scope');
        if (sessionId === null || [...url.searchParams].length > (scope === null ? 0 : 1) || (scope !== null && scope !== 'authorized-review')) {
          sendV2Error(response, 400, 'invalid_route', 'Studio session route is invalid.');
          return;
        }
        try {
          response.setHeader('cache-control', 'no-store');
          sendV2Success(response, 200, { session: await studioOperations.getSession(sessionId, scope === 'authorized-review'), readOnly: degradedReadOnly });
        } catch (error) { sendStudioError(response, error); }
        return;
      }

      const studioSessionMutationMatch = /^\/api\/v2\/sessions\/([^/]+)\/(complete-item|skip-item|complete-session)$/.exec(url.pathname);
      if (studioSessionMutationMatch !== null) {
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only POST is allowed for Studio session actions.');
          return;
        }
        if (studioOperations === null) {
          sendV2Error(response, 503, 'studio_unavailable', 'Studio session data is unavailable.');
          return;
        }
        const sessionId = decodeSegment(studioSessionMutationMatch[1]!);
        const scope = url.searchParams.get('scope');
        if (sessionId === null || [...url.searchParams].length > (scope === null ? 0 : 1) || (scope !== null && scope !== 'authorized-review')) {
          sendV2Error(response, 400, 'invalid_route', 'Studio session action route is invalid.');
          return;
        }
        try {
          response.setHeader('cache-control', 'no-store');
          sendV2Success(response, 201, { session: await studioOperations.mutateSession(
            sessionId,
            studioSessionMutationMatch[2] as 'complete-item' | 'skip-item' | 'complete-session',
            await readJsonBody(request),
            scope === 'authorized-review',
          ), readOnly: degradedReadOnly });
        } catch (error) { sendStudioError(response, error); }
        return;
      }

      if (url.pathname === '/api/v2/audits/preview' || url.pathname === '/api/v2/audits/apply' || url.pathname === '/api/v2/audits/close') {
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only POST is allowed for Studio audit lifecycle actions.');
          return;
        }
        if (studioOperations === null) {
          sendV2Error(response, 503, 'studio_unavailable', 'Studio audit services are unavailable.');
          return;
        }
        if ([...url.searchParams].length > 0) {
          sendV2Error(response, 400, 'invalid_route', 'Audit lifecycle routes do not accept query parameters.');
          return;
        }
        try {
          response.setHeader('cache-control', 'no-store');
          const input = await readJsonBody(request, url.pathname.endsWith('/preview') ? MAX_AUDIT_BODY_BYTES : MAX_BODY_BYTES);
          const audit = url.pathname.endsWith('/preview') ? await studioOperations.previewAudit(input)
            : url.pathname.endsWith('/apply') ? await studioOperations.applyAudit(input)
              : await studioOperations.closeAudit(input);
          sendV2Success(response, url.pathname.endsWith('/preview') ? 200 : 201, { audit, readOnly: degradedReadOnly });
        } catch (error) { sendStudioError(response, error); }
        return;
      }

      const studioAuditMatch = /^\/api\/v2\/audits\/([0-9a-f]{64})$/.exec(url.pathname);
      if (studioAuditMatch !== null) {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed to recover an audit preview.');
          return;
        }
        if (studioOperations === null) {
          sendV2Error(response, 503, 'studio_unavailable', 'Studio audit services are unavailable.');
          return;
        }
        try {
          response.setHeader('cache-control', 'no-store');
          sendV2Success(response, 200, { audit: studioOperations.getAudit(studioAuditMatch[1]!), readOnly: degradedReadOnly });
        } catch (error) { sendStudioError(response, error); }
        return;
      }

      if (url.pathname === '/api/v2/admissions') {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed for admission discovery.');
          return;
        }
        if ([...url.searchParams].length > 0) {
          sendV2Error(response, 400, 'invalid_route', 'Admission discovery does not accept query parameters.');
          return;
        }
        try {
          response.setHeader('cache-control', 'no-store');
          sendV2Success(response, 200, { admissions: await admissionPublishOperations.list(degradedReadOnly), readOnly: degradedReadOnly });
        } catch (error) { sendAdmissionPublishError(response, error); }
        return;
      }

      const admissionMatch = /^\/api\/v2\/admissions\/([^/]+)$/.exec(url.pathname);
      if (admissionMatch !== null) {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed to inspect an admission.');
          return;
        }
        if ([...url.searchParams].length > 0) {
          sendV2Error(response, 400, 'invalid_route', 'Admission inspection does not accept query parameters.');
          return;
        }
        const reviewId = decodeSegment(admissionMatch[1]!);
        if (reviewId === null) {
          sendV2Error(response, 400, 'invalid_route', 'Admission identifier is invalid.');
          return;
        }
        try {
          response.setHeader('cache-control', 'no-store');
          sendV2Success(response, 200, { admission: await admissionPublishOperations.admission(reviewId, degradedReadOnly), readOnly: degradedReadOnly });
        } catch (error) { sendAdmissionPublishError(response, error); }
        return;
      }

      const admissionApplyMatch = /^\/api\/v2\/admissions\/([^/]+)\/admit$/.exec(url.pathname);
      if (admissionApplyMatch !== null) {
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only POST is allowed to admit reviewed evidence.');
          return;
        }
        if (activeRepositoryMutation !== null || jobRunner.getActive() !== null) {
          sendV2Error(response, 409, 'mutation_running', 'Another repository operation is already running.');
          return;
        }
        const reviewId = decodeSegment(admissionApplyMatch[1]!);
        if (reviewId === null || [...url.searchParams].length > 0) {
          sendV2Error(response, 400, 'invalid_route', 'Admission route is invalid.');
          return;
        }
        const mutationId = randomUUID();
        activeRepositoryMutation = { kind: 'admission', id: mutationId };
        try {
          const admission = await admissionPublishOperations.admit(reviewId, await readJsonBody(request));
          sendV2Success(response, 201, { admission });
        } catch (error) { sendAdmissionPublishError(response, error); }
        finally {
          if (activeRepositoryMutation?.id === mutationId) activeRepositoryMutation = null;
        }
        return;
      }

      if (url.pathname === '/api/v2/publish') {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed for publish discovery.');
          return;
        }
        if ([...url.searchParams].length > 0) {
          sendV2Error(response, 400, 'invalid_route', 'Publish discovery does not accept query parameters.');
          return;
        }
        try {
          response.setHeader('cache-control', 'no-store');
          sendV2Success(response, 200, { admissions: await admissionPublishOperations.list(degradedReadOnly), readOnly: degradedReadOnly });
        } catch (error) { sendAdmissionPublishError(response, error); }
        return;
      }

      const publishPreflightMatch = /^\/api\/v2\/publish\/([^/]+)\/preflight$/.exec(url.pathname);
      if (publishPreflightMatch !== null) {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed for publish preflight.');
          return;
        }
        if ([...url.searchParams].length > 0) {
          sendV2Error(response, 400, 'invalid_route', 'Publish preflight does not accept query parameters.');
          return;
        }
        const reviewId = decodeSegment(publishPreflightMatch[1]!);
        if (reviewId === null) {
          sendV2Error(response, 400, 'invalid_route', 'Publish identifier is invalid.');
          return;
        }
        try {
          response.setHeader('cache-control', 'no-store');
          sendV2Success(response, 200, { publish: await admissionPublishOperations.publish(reviewId), readOnly: degradedReadOnly });
        } catch (error) { sendAdmissionPublishError(response, error); }
        return;
      }

      const publishPrepareMatch = /^\/api\/v2\/publish\/([^/]+)\/prepare$/.exec(url.pathname);
      if (publishPrepareMatch !== null) {
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only POST is allowed to prepare an isolated branch.');
          return;
        }
        if (activeRepositoryMutation !== null || jobRunner.getActive() !== null) {
          sendV2Error(response, 409, 'mutation_running', 'Another repository operation is already running.');
          return;
        }
        const reviewId = decodeSegment(publishPrepareMatch[1]!);
        if (reviewId === null || [...url.searchParams].length > 0) {
          sendV2Error(response, 400, 'invalid_route', 'Publish preparation route is invalid.');
          return;
        }
        const mutationId = randomUUID();
        activeRepositoryMutation = { kind: 'publish-preparation', id: mutationId };
        try {
          const publication = await admissionPublishOperations.prepare(reviewId, await readJsonBody(request));
          sendV2Success(response, 201, { publication });
        } catch (error) { sendAdmissionPublishError(response, error); }
        finally {
          if (activeRepositoryMutation?.id === mutationId) activeRepositoryMutation = null;
        }
        return;
      }

      if (url.pathname === '/api/v2/candidates') {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed for /api/v2/candidates.');
          return;
        }
        if (blindComparisons === null) {
          sendV2Error(response, 503, 'blind_comparison_unavailable', 'Candidate comparison state is unavailable.');
          return;
        }
        sendBlindSuccess(response, 200, { reviews: blindComparisons.list(), readOnly: degradedReadOnly });
        return;
      }

      const blindStartMatch = /^\/api\/v2\/candidates\/([^/]+)\/blind-sessions$/.exec(url.pathname);
      if (blindStartMatch !== null) {
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only POST is allowed to start or resume a blind session.');
          return;
        }
        if (blindComparisons === null) {
          sendV2Error(response, 503, 'blind_comparison_unavailable', 'Candidate comparison state is unavailable.');
          return;
        }
        const reviewId = decodeSegment(blindStartMatch[1]!);
        if (reviewId === null) {
          sendV2Error(response, 400, 'invalid_route', 'Comparison review identifier is invalid.');
          return;
        }
        try {
          const input = parseStartBlindSessionInput(await readJsonBody(request));
          sendBlindSuccess(response, 201, { session: await blindComparisons.start(reviewId, input.requestId) });
        } catch (error) {
          sendBlindError(response, error);
        }
        return;
      }

      const blindSessionMatch = /^\/api\/v2\/candidates\/([^/]+)\/blind-sessions\/([^/]+)$/.exec(url.pathname);
      if (blindSessionMatch !== null) {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed to load a blind session.');
          return;
        }
        if (blindComparisons === null) {
          sendV2Error(response, 503, 'blind_comparison_unavailable', 'Candidate comparison state is unavailable.');
          return;
        }
        const reviewId = decodeSegment(blindSessionMatch[1]!);
        const sessionId = decodeSegment(blindSessionMatch[2]!);
        if (reviewId === null || sessionId === null) {
          sendV2Error(response, 400, 'invalid_route', 'Blind session route is invalid.');
          return;
        }
        try { sendBlindSuccess(response, 200, { session: blindComparisons.get(reviewId, sessionId) }); }
        catch (error) { sendBlindError(response, error); }
        return;
      }

      const blindPassageMatch = /^\/api\/v2\/candidates\/([^/]+)\/blind-sessions\/([^/]+)\/passages$/.exec(url.pathname);
      if (blindPassageMatch !== null) {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed for blind passage context.');
          return;
        }
        if (blindComparisons === null || engine === null) {
          sendV2Error(response, 503, 'blind_comparison_unavailable', 'Blind passage context is unavailable.');
          return;
        }
        const reviewId = decodeSegment(blindPassageMatch[1]!);
        const sessionId = decodeSegment(blindPassageMatch[2]!);
        const queryId = url.searchParams.get('queryId');
        const passageId = url.searchParams.get('passageId');
        const parameterEntries = [...url.searchParams.entries()];
        if (reviewId === null || sessionId === null || queryId === null || passageId === null
            || parameterEntries.length !== 2
            || parameterEntries.filter(([key]) => key === 'queryId').length !== 1
            || parameterEntries.filter(([key]) => key === 'passageId').length !== 1) {
          sendV2Error(response, 400, 'invalid_route', 'Blind passage route requires only queryId and passageId.');
          return;
        }
        try {
          const reference = blindComparisons.passageReference(reviewId, sessionId, queryId, passageId);
          const exact = await engine.passage(reference);
          if (exact.kind !== 'passage' || exact.passage.verses.length === 0) {
            sendV2Error(response, 409, 'passage_unavailable', 'The selected comparison passage is unavailable in the reviewed corpus.');
            return;
          }
          const first = exact.passage.verses[0]!;
          const last = exact.passage.verses.at(-1)!;
          let context = exact;
          if (first.bookId === last.bookId && first.chapter === last.chapter) {
            const expanded = await engine.passage(`${first.bookName} ${first.chapter}:${Math.max(1, first.verse - 2)}-${last.verse + 2}`);
            if (expanded.kind === 'passage' && expanded.passage.verses.length > 0) context = expanded;
          }
          sendBlindSuccess(response, 200, {
            passageId,
            reference,
            contextReference: context.passage.reference,
            verses: context.passage.verses.map((verse) => ({
              translationCode: verse.translationCode,
              bookName: verse.bookName,
              chapter: verse.chapter,
              verse: verse.verse,
              text: verse.text,
            })),
          });
        } catch (error) {
          sendBlindError(response, error);
        }
        return;
      }

      const blindMutationMatch = /^\/api\/v2\/candidates\/([^/]+)\/blind-sessions\/([^/]+)\/(judgments|missing-passages)$/.exec(url.pathname);
      if (blindMutationMatch !== null) {
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only POST is allowed for blind review mutations.');
          return;
        }
        if (blindComparisons === null) {
          sendV2Error(response, 503, 'blind_comparison_unavailable', 'Candidate comparison state is unavailable.');
          return;
        }
        const reviewId = decodeSegment(blindMutationMatch[1]!);
        const sessionId = decodeSegment(blindMutationMatch[2]!);
        if (reviewId === null || sessionId === null) {
          sendV2Error(response, 400, 'invalid_route', 'Blind mutation route is invalid.');
          return;
        }
        try {
          const body = await readJsonBody(request);
          let session: unknown;
          if (blindMutationMatch[3] === 'judgments') {
            session = await blindComparisons.judge(reviewId, sessionId, parseBlindJudgmentInput(body));
          } else {
            const input = parseMissingPassageInput(body);
            if (engine === null) throw new BlindComparisonError('artifact_unavailable', artifactFailure, 503);
            const outcome = await engine.passage(input.reference);
            if (outcome.kind !== 'passage' || outcome.passage.verses.length === 0) {
              throw new BlindComparisonError('invalid_reference', 'Missing passage reference is not resolvable in the reviewed corpus.');
            }
            session = await blindComparisons.recordMissing(reviewId, sessionId, input);
          }
          sendBlindSuccess(response, 201, { session });
        } catch (error) {
          sendBlindError(response, error);
        }
        return;
      }

      if (url.pathname === '/api/v2/checks') {
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only POST is allowed for /api/v2/checks.');
          return;
        }
        if (shuttingDown) {
          sendV2Error(response, 503, 'server_shutting_down', 'Workbench shutdown has started; new checks are not accepted.');
          return;
        }
        let body: unknown;
        try {
          body = await readJsonBody(request);
        } catch (error) {
          sendV2Error(response, 400, 'bad_request', error instanceof Error ? error.message : 'Bad check request.');
          return;
        }
        if (
          !isPlainObject(body) ||
          !isJobId(body['jobId']) ||
          Object.keys(body).some((key) => key !== 'jobId')
        ) {
          sendV2Error(response, 400, 'bad_request', `Expected exactly one allowlisted jobId: ${JOB_IDS.join(', ')}.`);
          return;
        }
        if (activeRepositoryMutation !== null || jobRunner.getActive() !== null) {
          sendV2Error(response, 409, 'job_running', 'A repository check is already running.');
          return;
        }
        try {
          const mutationId = randomUUID();
          activeRepositoryMutation = { kind: `check:${body['jobId']}`, id: mutationId };
          const handle = jobRunner.enqueue({
            jobId: body['jobId'],
            origin: {
              source: 'workbench-api',
              requestId: randomUUID(),
              requestedBy: reviewer,
            },
          });
          void handle.result.finally(() => {
            if (activeRepositoryMutation?.id === mutationId) activeRepositoryMutation = null;
          });
          sendV2Success(response, 202, { job: handle.snapshot() });
        } catch (error) {
          activeRepositoryMutation = null;
          sendV2Error(response, 409, 'job_rejected', error instanceof Error ? error.message : 'Check was rejected.');
        }
        return;
      }

      const jobEventsMatch = /^\/api\/v2\/jobs\/([^/]+)\/events$/.exec(url.pathname);
      if (jobEventsMatch !== null) {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed for job events.');
          return;
        }
        const runId = decodeURIComponent(jobEventsMatch[1]!);
        if (jobRunner.get(runId) === null) {
          sendV2Error(response, 404, 'job_not_found', 'Check job was not found.');
          return;
        }
        response.writeHead(200, {
          'content-type': 'text/event-stream; charset=utf-8',
          'cache-control': 'no-cache, no-transform',
          connection: 'keep-alive',
        });
        let last = '';
        const emit = (): void => {
          const record = jobRunner.get(runId);
          if (record === null) return;
          const serialized = JSON.stringify(record);
          if (serialized !== last) {
            response.write(`event: status\ndata: ${serialized}\n\n`);
            last = serialized;
          }
          if (jobIsFinished(record)) {
            clearInterval(interval);
            response.end();
          }
        };
        const interval = setInterval(emit, 250);
        response.once('close', () => clearInterval(interval));
        emit();
        return;
      }

      const jobCancelMatch = /^\/api\/v2\/jobs\/([^/]+)\/cancel$/.exec(url.pathname);
      if (jobCancelMatch !== null) {
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only POST is allowed to cancel a job.');
          return;
        }
        const runId = decodeURIComponent(jobCancelMatch[1]!);
        const before = jobRunner.get(runId);
        if (before === null) {
          sendV2Error(response, 404, 'job_not_found', 'Check job was not found.');
          return;
        }
        if (!jobRunner.cancel(runId)) {
          sendV2Error(response, 409, 'job_finished', 'This check has already finished.');
          return;
        }
        sendV2Success(response, 202, { job: jobRunner.get(runId) });
        return;
      }

      const jobMatch = /^\/api\/v2\/jobs\/([^/]+)$/.exec(url.pathname);
      if (jobMatch !== null) {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed for /api/v2/jobs/:id.');
          return;
        }
        const record = jobRunner.get(decodeURIComponent(jobMatch[1]!));
        if (record === null) {
          sendV2Error(response, 404, 'job_not_found', 'Check job was not found.');
          return;
        }
        sendV2Success(response, 200, { job: record });
        return;
      }

      if (url.pathname === '/api/v2/compile/preview') {
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only POST is allowed for /api/v2/compile/preview.');
          return;
        }
        try {
          const plan = await planJudgmentCompilation(MUTATION_REPO_ROOT);
          sendV2Success(response, 200, { plan });
        } catch (error) {
          sendV2Error(
            response,
            422,
            'compile_preview_failed',
            error instanceof Error ? error.message : 'Fixture preview could not be created.',
          );
        }
        return;
      }

      if (url.pathname === '/api/v2/compile/apply') {
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only POST is allowed for /api/v2/compile/apply.');
          return;
        }
        if (engine === null) {
          sendV2Error(response, 503, 'artifact_unavailable', artifactFailure);
          return;
        }
        if (activeRepositoryMutation !== null || jobRunner.getActive() !== null) {
          sendV2Error(response, 409, 'mutation_running', 'Another repository operation is already running.');
          return;
        }
        const compileMutationId = randomUUID();
        activeRepositoryMutation = { kind: 'compile-apply', id: compileMutationId };
        let body: unknown;
        try {
          body = await readJsonBody(request);
        } catch (error) {
          if (activeRepositoryMutation?.id === compileMutationId) activeRepositoryMutation = null;
          sendV2Error(response, 400, 'bad_request', error instanceof Error ? error.message : 'Bad apply request.');
          return;
        }
        if (
          !isPlainObject(body) ||
          typeof body['digest'] !== 'string' ||
          Object.keys(body).some((key) => key !== 'digest')
        ) {
          if (activeRepositoryMutation?.id === compileMutationId) activeRepositoryMutation = null;
          sendV2Error(response, 400, 'bad_request', 'Expected exactly one string field: digest.');
          return;
        }
        try {
          const plan = await planJudgmentCompilation(MUTATION_REPO_ROOT);
          if (plan.digest !== body['digest']) {
            sendV2Error(response, 409, 'stale_preview', 'The repository changed. Create and review a fresh preview.');
            return;
          }
          const outcome = await applyJudgmentCompilationPlan(MUTATION_REPO_ROOT, plan, body['digest']);
          sendV2Success(response, 200, { digest: plan.digest, outcome });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Fixture plan could not be applied.';
          sendV2Error(
            response,
            /stale|digest|changed|busy|lock/i.test(message) ? 409 : 422,
            /stale|digest|changed/i.test(message)
              ? 'stale_preview'
              : /busy|lock/i.test(message)
                ? 'mutation_running'
                : 'compile_apply_failed',
            message,
          );
        } finally {
          if (activeRepositoryMutation?.id === compileMutationId) activeRepositoryMutation = null;
        }
        return;
      }

      const promotionMatch = /^\/api\/v2\/fixtures\/([^/]+)\/promotion\/(preview|apply)$/.exec(url.pathname);
      if (promotionMatch !== null) {
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only POST is allowed for fixture promotion.');
          return;
        }
        const fixtureId = decodeURIComponent(promotionMatch[1]!);
        const action = promotionMatch[2]!;
        if (action === 'preview') {
          try {
            sendV2Success(response, 200, {
              plan: await previewFixturePromotion(MUTATION_REPO_ROOT, fixtureId, {
                reportPath: GAUNTLET_REPORT_PATH,
              }),
            });
          } catch (error) {
            sendV2Error(
              response,
              422,
              'promotion_preview_failed',
              error instanceof Error ? error.message : 'Promotion preview could not be created.',
            );
          }
          return;
        }
        if (engine === null) {
          sendV2Error(response, 503, 'artifact_unavailable', artifactFailure);
          return;
        }
        if (activeRepositoryMutation !== null || jobRunner.getActive() !== null) {
          sendV2Error(response, 409, 'mutation_running', 'Another repository operation is already running.');
          return;
        }
        const promotionMutationId = randomUUID();
        activeRepositoryMutation = { kind: 'fixture-promotion', id: promotionMutationId };
        let body: unknown;
        try {
          body = await readJsonBody(request);
        } catch (error) {
          if (activeRepositoryMutation?.id === promotionMutationId) activeRepositoryMutation = null;
          sendV2Error(response, 400, 'bad_request', error instanceof Error ? error.message : 'Bad promotion request.');
          return;
        }
        if (
          !isPlainObject(body) ||
          typeof body['digest'] !== 'string' ||
          Object.keys(body).some((key) => key !== 'digest')
        ) {
          if (activeRepositoryMutation?.id === promotionMutationId) activeRepositoryMutation = null;
          sendV2Error(response, 400, 'bad_request', 'Expected exactly one string field: digest.');
          return;
        }
        try {
          const applied = await applyFixturePromotion(
            MUTATION_REPO_ROOT,
            fixtureId,
            body['digest'],
            { reportPath: GAUNTLET_REPORT_PATH },
          );
          sendV2Success(response, 200, { digest: applied.plan.digest, result: applied.result });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Fixture could not be promoted.';
          sendV2Error(
            response,
            /stale|digest|changed|busy|lock/i.test(message) ? 409 : 422,
            /stale|digest|changed/i.test(message)
              ? 'stale_preview'
              : /busy|lock/i.test(message)
                ? 'mutation_running'
                : 'promotion_apply_failed',
            message,
          );
        } finally {
          if (activeRepositoryMutation?.id === promotionMutationId) activeRepositoryMutation = null;
        }
        return;
      }

      if (url.pathname === '/api/v2/cases') {
        if (request.method === 'GET') {
          try {
            const cases = caseLog === null ? await readCases(CASES_PATH) : await caseLog.read();
            sendV2Success(response, 200, { cases });
          } catch (error) {
            sendV2Error(response, 500, 'case_log_invalid', error instanceof Error ? error.message : 'Case log is invalid.');
          }
          return;
        }
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET and POST are allowed for /api/v2/cases.');
          return;
        }
        if (engine === null || caseLog === null) {
          sendV2Error(response, 503, 'artifact_unavailable', artifactFailure);
          return;
        }
        let input: ReturnType<typeof parseCaseCreateRequest>;
        try {
          input = parseCaseCreateRequest(await readJsonBody(request));
        } catch (error) {
          sendV2Error(response, 400, 'bad_request', error instanceof Error ? error.message : 'Bad case request.');
          return;
        }
        try {
          const created = await caseLog.create(input);
          const snapshot = await captureReviewSnapshot(engine, created.case.caseId, created.case.query, created.case.source);
          reviewSnapshots.put(snapshot);
          sendV2Success(response, 201, {
            case: created.case,
            event: created.event,
            review: { freshness: 'fresh', ...reviewSnapshotView(snapshot) },
          });
        } catch (error) {
          sendV2Error(
            response,
            500,
            'case_log_invalid',
            error instanceof Error ? error.message : 'Case creation failed.',
          );
        }
        return;
      }

      const caseStateMatch = /^\/api\/v2\/cases\/([^/]+)\/state$/.exec(url.pathname);
      if (caseStateMatch !== null) {
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only POST is allowed for /api/v2/cases/:id/state.');
          return;
        }
        if (engine === null || caseLog === null) {
          sendV2Error(response, 503, 'artifact_unavailable', artifactFailure);
          return;
        }
        const caseId = decodeURIComponent(caseStateMatch[1]!);
        if (!isCaseId(caseId)) {
          sendV2Error(response, 400, 'invalid_case_id', 'Case id must be a UUID.');
          return;
        }
        let body: unknown;
        try {
          body = await readJsonBody(request);
        } catch (error) {
          sendV2Error(response, 400, 'bad_request', error instanceof Error ? error.message : 'Bad request body.');
          return;
        }
        if (!isPlainObject(body) || Object.keys(body).length !== 1 ||
          (body.state !== 'reviewing' && body.state !== 'judged')) {
          sendV2Error(response, 400, 'bad_request', 'Case state must be "reviewing" or "judged".');
          return;
        }
        try {
          const transitioned = await caseLog.transition(caseId, body.state);
          sendV2Success(response, 200, transitioned);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Case transition failed.';
          if (message.startsWith('Unknown review case')) {
            sendV2Error(response, 404, 'case_not_found', message);
          } else if (message.includes('Illegal state transition')) {
            sendV2Error(response, 409, 'invalid_case_transition', message);
          } else {
            sendV2Error(response, 500, 'case_log_invalid', message);
          }
        }
        return;
      }

      const caseMatch = /^\/api\/v2\/cases\/([^/]+)$/.exec(url.pathname);
      if (caseMatch !== null) {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is allowed for /api/v2/cases/:id.');
          return;
        }
        const caseId = decodeURIComponent(caseMatch[1]!);
        if (!isCaseId(caseId)) {
          sendV2Error(response, 400, 'invalid_case_id', 'Case id must be a UUID.');
          return;
        }
        try {
          const cases = caseLog === null ? await readCases(CASES_PATH) : await caseLog.read();
          const reviewCase = cases.find((entry) => entry.caseId === caseId);
          if (reviewCase === undefined) {
            sendV2Error(response, 404, 'case_not_found', 'Unknown review case.');
            return;
          }
          let snapshot = reviewSnapshots.getForCase(caseId);
          let freshness: 'fresh' | 'reused' | undefined = snapshot === undefined ? undefined : 'reused';
          if (snapshot === undefined && engine !== null) {
            snapshot = await captureReviewSnapshot(engine, reviewCase.caseId, reviewCase.query, reviewCase.source);
            reviewSnapshots.put(snapshot);
            freshness = 'fresh';
          }
          sendV2Success(response, 200, {
            case: reviewCase,
            review: snapshot === undefined ? null : { freshness, ...reviewSnapshotView(snapshot) },
          });
        } catch (error) {
          sendV2Error(response, 500, 'case_log_invalid', error instanceof Error ? error.message : 'Case log is invalid.');
        }
        return;
      }

      if (url.pathname === '/api/v2/judgments') {
        if (request.method === 'GET') {
          const caseId = url.searchParams.get('caseId');
          if (caseId === null || !isCaseId(caseId)) {
            sendV2Error(response, 400, 'invalid_case_id', 'caseId must be a UUID.');
            return;
          }
          try {
            const records = await readJudgments(JUDGMENTS_PATH);
            const judgmentsForCase = records.filter(
              (record) => 'schemaVersion' in record && record.schemaVersion === 2 && record.caseId === caseId,
            );
            sendV2Success(response, 200, { caseId, judgments: judgmentsForCase });
          } catch (error) {
            sendV2Error(response, 500, 'judgment_log_invalid', error instanceof Error ? error.message : 'Judgment log is invalid.');
          }
          return;
        }
        if (request.method !== 'POST') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET and POST are allowed for /api/v2/judgments.');
          return;
        }
        if (engine === null || caseLog === null) {
          sendV2Error(response, 503, 'artifact_unavailable', artifactFailure);
          return;
        }
        let body: unknown;
        try {
          body = await readJsonBody(request);
        } catch (error) {
          sendV2Error(response, 400, 'bad_request', error instanceof Error ? error.message : 'Bad request body.');
          return;
        }
        if (!isPlainObject(body) || !isCaseId(typeof body.caseId === 'string' ? body.caseId : '') ||
          !isCaseId(typeof body.snapshotToken === 'string' ? body.snapshotToken : '')) {
          sendV2Error(response, 400, 'bad_request', 'A v2 judgment needs UUID caseId and snapshotToken routing fields.');
          return;
        }
        const { caseId, snapshotToken, ...judgmentBody } = body;
        const result = await submitV2Judgment(caseId as string, snapshotToken as string, judgmentBody);
        if (!result.ok) {
          const status = result.code === 'artifact_unavailable' ? 503
            : result.code === 'case_not_found' ? 404
              : result.code === 'review_snapshot_required' ? 409
                : result.code === 'validation_failed' ? 400 : 500;
          sendV2Error(response, status, result.code, result.message);
          return;
        }
        sendV2Success(response, 201, { judgment: result.record });
        return;
      }

      if (isV2Request) {
        if (request.method !== 'GET') {
          sendV2Error(response, 405, 'method_not_allowed', 'Only GET is supported by /api/v2/.');
          return;
        }
        sendV2Error(response, 404, 'not_found', 'Unknown /api/v2/ endpoint.');
        return;
      }

      // Method-agnostic tombstone: one stray v1 append could brick
      // compile-judgments forever, so the retired endpoint fails loud
      // instead of half-working for some verbs.
      if (url.pathname === '/api/judgment') {
        sendError(
          response,
          410,
          'POST /api/judgment is gone; the v1 judgment log is closed. Submit judgments through POST /api/v2/judgments.',
        );
        return;
      }

      if (request.method !== 'GET') {
        sendError(response, 405, 'All writes go through /api/v2/; everything else is GET.');
        return;
      }

      const staticAsset = staticAssets.get(url.pathname);
      if (staticAsset !== undefined) {
        response.writeHead(200, {
          'content-type': staticAsset.contentType,
          ...(staticAsset.sha256 === '' ? {} : { etag: `"${staticAsset.sha256}"` }),
          'x-content-type-options': 'nosniff',
        });
        response.end(staticAsset.body);
        return;
      }

      const secondaryPage = secondaryPages.get(url.pathname);
      if (secondaryPage !== undefined) {
        writeSecondaryResponse(response, secondaryPage);
        return;
      }

      if (url.pathname.startsWith('/fonts/')) {
        const font = fontAssets.get(url.pathname);
        if (font === undefined) {
          sendError(response, 404, 'Not found.');
          return;
        }
        response.writeHead(200, {
          'content-type': font.contentType,
          etag: `"${font.sha256}"`,
          'cache-control': 'no-cache',
          'x-content-type-options': 'nosniff',
        });
        response.end(font.body);
        return;
      }

      if (url.pathname === '/api/search') {
        if (engine === null) {
          sendError(response, 503, artifactFailure);
          return;
        }
        const query = url.searchParams.get('q');
        if (query === null || query.trim() === '') {
          sendError(response, 400, 'Missing query: /api/search?q=...');
          return;
        }
        // Verbatim: no reshaping, no augmentation.
        sendJson(response, 200, JSON.stringify(await engine.research(query)));
        return;
      }

      if (url.pathname === '/api/passage') {
        if (engine === null) {
          sendError(response, 503, artifactFailure);
          return;
        }
        const reference = url.searchParams.get('ref');
        if (reference === null || reference.trim() === '') {
          sendError(response, 400, 'Missing reference: /api/passage?ref=...');
          return;
        }
        // Verbatim `engine.passage()` result, same discipline as /api/search.
        // The UI uses this to validate a missing-passage reference as it is
        // typed and to pre-fill the note with the verse's own words.
        sendJson(response, 200, JSON.stringify(await engine.passage(reference)));
        return;
      }

      if (url.pathname === '/api/concepts') {
        if (port === null) {
          sendError(response, 503, artifactFailure);
          return;
        }
        sendJson(response, 200, JSON.stringify(await conceptList(port)));
        return;
      }

      const conceptMatch = /^\/api\/concepts\/([^/]+)$/.exec(url.pathname);
      if (conceptMatch !== null) {
        if (port === null) {
          sendError(response, 503, artifactFailure);
          return;
        }
        const detail = await conceptDetail(port, decodeURIComponent(conceptMatch[1]!));
        if (detail === null) {
          sendError(response, 404, 'Unknown concept id.');
          return;
        }
        sendJson(response, 200, JSON.stringify(detail));
        return;
      }

      if (url.pathname === '/api/meta') {
        if (meta === null) {
          sendError(response, 503, artifactFailure);
          return;
        }
        sendJson(response, 200, JSON.stringify(meta));
        return;
      }

      sendError(response, 404, 'Not found.');
    })().catch((error: unknown) => {
      console.error(error);
      if (!response.headersSent) {
        const requestPath = new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`).pathname;
        if (requestPath.startsWith('/api/v2/')) {
          sendV2Error(response, 500, 'internal_error', 'Internal server error.');
        } else {
          sendError(response, 500, error instanceof Error ? error.message : 'Internal error.');
        }
      } else {
        response.end();
      }
    });
  });

  const shutdown = async (): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    const listenerClosed = new Promise<void>((resolve) => server.close(() => resolve()));
    const jobStopped = await jobRunner.shutdown();
    await closeArtifact(engine, port);
    await listenerClosed;
    if (!jobStopped) process.exitCode = 1;
  };
  process.once('SIGINT', () => { void shutdown(); });
  process.once('SIGTERM', () => { void shutdown(); });

  try {
    const actualPort = await listenOnLoopback(server, PORT);
    console.log(`Workbench viewer at http://127.0.0.1:${actualPort}/`);
  } catch (error) {
    await jobRunner.shutdown();
    await closeArtifact(engine, port);
    throw error;
  }
}

main().catch((error) => {
  if (error instanceof StartupListenError) {
    console.error(startupFailureJson(error));
    console.error(`${error.startupIssue.message} ${error.startupIssue.remediation}`);
  } else {
    console.error(error);
  }
  process.exit(1);
});
