/**
 * Stage 2 — the judgment log (plan §4).
 *
 * One judgment is one JSON line appended to `workbench/judgments.jsonl` — an
 * append-only file committed to git, so the judgment history is reviewable
 * data with the same lineage discipline as everything else. Corrections are
 * new lines; a later judgment on the same query + target supersedes an
 * earlier one at compile time, by `at` order. Editing or deleting lines is
 * off-limits — history is part of the record.
 *
 * Everything situational is injected (reviewer, identities, the reference
 * resolver, the clock, the log path) so validation and append logic unit-test
 * without an engine or a real artifact. The server wires in the real values.
 */

import { createHash, randomUUID } from 'node:crypto';
import { appendFile, readFile } from 'node:fs/promises';

export const VERDICTS = ['fits', 'doesnt-fit', 'missing'] as const;
export type Verdict = (typeof VERDICTS)[number];

export const CAUSES = ['wrong-anchor', 'concept-misfire', 'lexical-noise'] as const;
export type Cause = (typeof CAUSES)[number];

export const JUDGMENT_ACTIONS = ['essential', 'helpful', 'irrelevant', 'missing', 'prefer'] as const;
export type JudgmentAction = (typeof JUDGMENT_ACTIONS)[number];

export const WITHIN_TOP_VALUES = [1, 3, 5, 10] as const;
export type WithinTop = (typeof WITHIN_TOP_VALUES)[number];

export const REVIEW_CASE_SOURCES = [
  'manual',
  'gauntlet',
  'coverage',
  'stale-judgment',
  'telemetry',
  'calibration',
  'regression',
] as const;
export type ReviewCaseSource = (typeof REVIEW_CASE_SOURCES)[number];

/** The causes that imply ontology work, and therefore demand a note. */
export const ANCHOR_AFFECTING_CAUSES: readonly Cause[] = ['wrong-anchor', 'concept-misfire'];

/** The three identities every judgment is stamped with, from the running engine. */
export interface JudgmentIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

/** One line of `judgments.jsonl`. Field order here is the field order on disk. */
export interface JudgmentRecord {
  readonly at: string;
  readonly reviewer: string;
  readonly query: string;
  readonly verdict: Verdict;
  readonly targetId?: string;
  readonly reference?: string;
  readonly pin?: true;
  readonly reasonFamily?: string;
  readonly cause?: Cause;
  /**
   * True when the workbench classified the cause instead of the reviewer:
   * a ✗ on a result with no concept evidence is lexical-noise by
   * construction, and the UI records it in one click. Transparency only —
   * the compile step routes inferred and hand-judged causes identically.
   */
  readonly causeInferred?: true;
  readonly conceptId?: string;
  readonly note?: string;
  /**
   * Server-attached passage text for a `missing` judgment. This is what lets
   * the note be optional: the defend-it-from-the-text rule is satisfied by
   * the text itself, which the server fetched while validating the reference.
   */
  readonly excerpt?: string;
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

/** Explicit name for the unchanged v1 line shape. */
export type JudgmentRecordV1 = JudgmentRecord;

/** One v2 line of `judgments.jsonl`; ids and review evidence are server-stamped. */
export interface JudgmentRecordV2 extends JudgmentIdentity {
  readonly schemaVersion: 2;
  readonly judgmentId: string;
  readonly caseId: string;
  readonly at: string;
  readonly reviewer: string;
  readonly query: string;
  readonly action: JudgmentAction;
  readonly targetId?: string;
  readonly reference?: string;
  readonly withinTop?: WithinTop;
  readonly observedRank?: number | null;
  readonly observedWindow: number;
  readonly resultSetDigest: string;
  readonly reasonDigest?: string;
  readonly displayedWindowDigest: string;
  readonly preferredTargetId?: string;
  readonly otherTargetId?: string;
  readonly diagnosis?: Cause;
  readonly diagnosisInferred?: true;
  readonly conceptId?: string;
  readonly note?: string;
  readonly excerpt?: string;
  readonly source: ReviewCaseSource;
  readonly supersedes?: string;
}

/** A parsed history line can be either immutable legacy v1 or v2. */
export type ParsedJudgmentRecord = JudgmentRecordV1 | JudgmentRecordV2;

/** A result in the server's immutable review snapshot. */
export interface ObservedJudgmentResult {
  readonly targetId: string;
  readonly rank: number;
  readonly reasonDigest?: string;
}

/** One server-captured result before its evidence is reduced to digests. */
export interface JudgmentReviewSnapshotResult {
  readonly targetId: string;
  readonly rank: number;
  /** The exact server-owned reason payload shown to the reviewer, when any. */
  readonly reason?: unknown;
}

/**
 * Immutable server-side input for a v2 review. `results` is the displayed
 * result set, so every rank must be inside `observedWindow`.
 */
export interface JudgmentReviewSnapshot {
  readonly caseId: string;
  readonly query: string;
  readonly source: ReviewCaseSource;
  readonly observedWindow: number;
  readonly results: readonly JudgmentReviewSnapshotResult[];
}

/**
 * Server-owned evidence for the search response currently being judged.
 * Client payloads name a target but never supply ranks, digests, case identity,
 * source, or the query the case owns.
 */
export interface JudgmentV2Context {
  readonly caseId: string;
  readonly query: string;
  readonly source: ReviewCaseSource;
  readonly observedWindow: number;
  readonly resultSetDigest: string;
  readonly displayedWindowDigest: string;
  readonly results: readonly ObservedJudgmentResult[];
}

/** The fields a client may send. Everything else is stamped server-side. */
const CLIENT_FIELDS = new Set([
  'query',
  'verdict',
  'targetId',
  'reference',
  'pin',
  'reasonFamily',
  'cause',
  'causeInferred',
  'conceptId',
  'note',
]);

const V2_CLIENT_FIELDS = new Set([
  'action',
  'targetId',
  'reference',
  'withinTop',
  'diagnosis',
  'diagnosisInferred',
  'conceptId',
  'note',
  'preferredTargetId',
  'otherTargetId',
  'supersedes',
]);

const SERVER_STAMPED_V2_FIELDS = new Set([
  'schemaVersion',
  'judgmentId',
  'caseId',
  'at',
  'reviewer',
  'query',
  'observedRank',
  'observedWindow',
  'resultSetDigest',
  'reasonDigest',
  'displayedWindowDigest',
  'excerpt',
  'source',
  'engineVersion',
  'corpusFingerprint',
  'layerFingerprint',
]);

export interface JudgmentLogOptions {
  readonly logPath: string;
  /** Static reviewer string; the server reads WORKBENCH_REVIEWER, default "jesse". */
  readonly reviewer: string;
  /** Stamped by the server from the running engine, never from the client. */
  readonly identity: JudgmentIdentity;
  /**
   * Resolves a human-typed reference for a `missing` judgment to the passage
   * text (an excerpt), or null when the reference does not resolve. The
   * server backs this with `engine.passage()`, whose typed result makes an
   * invalid reference a value, not an exception. The excerpt is what lets a
   * `missing` note be optional: the text defends the judgment by itself.
   */
  readonly resolveReference: (reference: string) => Promise<string | null>;
  /**
   * Resolves a valid reference to its exact target identity for v2 missing
   * judgments. This lets the server reject a claimed miss already displayed.
   */
  readonly resolveReferenceTargetId?: (reference: string) => Promise<string | null>;
  /** Required when accepting v2 actions; supplied from the server's review case/search snapshot. */
  readonly v2Context?: JudgmentV2Context;
  /**
   * History lookup for correction/reconfirmation validation. `createJudgmentLog`
   * reads the log itself when this is omitted; tests may inject records directly.
   */
  readonly getExistingJudgments?: () => Promise<readonly ParsedJudgmentRecord[]>;
  /** Injectable only for deterministic tests; production defaults to crypto.randomUUID(). */
  readonly createJudgmentId?: () => string;
  /** Injectable clock, for tests. Defaults to the real one. */
  readonly now?: () => Date;
}

export type SubmitResult =
  | { readonly ok: true; readonly record: ParsedJudgmentRecord }
  | { readonly ok: false; readonly reason: string };

export type ParseJudgmentResult =
  | { readonly ok: true; readonly record: ParsedJudgmentRecord }
  | { readonly ok: false; readonly reason: string };

function isV2Record(record: ParsedJudgmentRecord): record is JudgmentRecordV2 {
  return 'schemaVersion' in record && record.schemaVersion === 2;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

function isCanonicalTimestamp(value: unknown): value is string {
  return typeof value === 'string' &&
    ISO_TIMESTAMP_PATTERN.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString() === value;
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && SHA256_PATTERN.test(value);
}

/** Stable JSON for evidence digests: object key order never changes a hash. */
function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Evidence contains a non-finite number.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  throw new Error('Evidence must be JSON data.');
}

function sha256Of(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function hasContiguousObservedResults(
  results: unknown,
  observedWindow: number,
): results is readonly ObservedJudgmentResult[] {
  if (!Array.isArray(results)) return false;
  const targetIds = new Set<string>();
  const ranks = new Set<number>();
  for (const result of results) {
    if (!isPlainObject(result) || !nonEmptyString(result.targetId) || !isDecodableTargetId(result.targetId)) return false;
    if (!isPositiveInteger(result.rank) || result.rank > observedWindow) return false;
    if (targetIds.has(result.targetId) || ranks.has(result.rank)) return false;
    if (result.reasonDigest !== undefined && !isSha256(result.reasonDigest)) return false;
    targetIds.add(result.targetId);
    ranks.add(result.rank);
  }
  for (let rank = 1; rank <= results.length; rank += 1) {
    if (!ranks.has(rank)) return false;
  }
  return true;
}

function orderedObservedResults(results: readonly ObservedJudgmentResult[]): readonly ObservedJudgmentResult[] {
  return [...results].sort((left, right) => left.rank - right.rank || left.targetId.localeCompare(right.targetId));
}

function resultSetDigestOf(results: readonly ObservedJudgmentResult[]): string {
  return sha256Of(orderedObservedResults(results));
}

function displayedWindowDigestOf(observedWindow: number, results: readonly ObservedJudgmentResult[]): string {
  return sha256Of({ observedWindow, results: orderedObservedResults(results) });
}

/**
 * A target id like "WEB:59001022" must decode to a real verse location
 * (BBCCCVVV: book 1-66, chapter and verse at least 1) or the compiler could
 * never turn it back into a reference. Checked with plain arithmetic so this
 * module needs no import from the pipeline.
 */
function isDecodableTargetId(value: string): boolean {
  const match = /^[A-Z][A-Z0-9]*:(\d{7,8})$/.exec(value);
  if (!match) return false;
  const verseId = Number(match[1]);
  const bookId = Math.floor(verseId / 1_000_000);
  const chapter = Math.floor((verseId % 1_000_000) / 1_000);
  const verse = verseId % 1_000;
  return bookId >= 1 && bookId <= 66 && chapter >= 1 && verse >= 1;
}

/** Rejects with a plain-English reason; never throws for bad input. */
async function validateV1Judgment(
  body: unknown,
  options: JudgmentLogOptions,
): Promise<SubmitResult> {
  if (!isPlainObject(body)) {
    return { ok: false, reason: 'A judgment must be a JSON object.' };
  }

  for (const key of Object.keys(body)) {
    if (!CLIENT_FIELDS.has(key)) {
      const stamped = ['at', 'reviewer', 'excerpt', 'engineVersion', 'corpusFingerprint', 'layerFingerprint'];
      return {
        ok: false,
        reason: stamped.includes(key)
          ? `"${key}" is stamped by the server, never sent by the client.`
          : `Unknown field "${key}".`,
      };
    }
  }

  if (!nonEmptyString(body.query)) {
    return { ok: false, reason: 'Every judgment needs the query as typed ("query").' };
  }
  const verdict = body.verdict;
  if (typeof verdict !== 'string' || !(VERDICTS as readonly string[]).includes(verdict)) {
    return { ok: false, reason: 'Verdict must be "fits", "doesnt-fit", or "missing".' };
  }

  if (body.note !== undefined && !nonEmptyString(body.note)) {
    return { ok: false, reason: 'A note, when present, must be non-empty text.' };
  }

  // Per-verdict field rules, straight from the plan's schema table (§4).
  let attachedExcerpt: string | undefined;
  if (verdict === 'missing') {
    for (const [field, hint] of [
      ['targetId', 'a "missing" judgment names a reference, not a result'],
      ['cause', 'causes belong to "doesnt-fit" judgments'],
      ['causeInferred', 'causeInferred belongs to "doesnt-fit" judgments'],
      ['conceptId', 'conceptId belongs to "doesnt-fit" judgments'],
      ['pin', 'pin belongs to "fits" judgments'],
      ['reasonFamily', 'reasonFamily belongs to pinned "fits" judgments'],
    ] as const) {
      if (body[field] !== undefined) {
        return { ok: false, reason: `"${field}" does not belong on a "missing" judgment — ${hint}.` };
      }
    }
    if (!nonEmptyString(body.reference)) {
      return {
        ok: false,
        reason: 'A "missing" judgment needs the reference that should have surfaced.',
      };
    }
    const excerpt = await options.resolveReference(body.reference);
    if (excerpt === null) {
      return {
        ok: false,
        reason: `"${body.reference}" is not a reference the engine can resolve.`,
      };
    }
    // The defend-it-from-the-text rule (§4). A note still satisfies it, but
    // so does the text itself: when the server can attach the passage
    // excerpt, that IS the defense, and no hand-written note is required.
    if (!nonEmptyString(body.note)) {
      if (!nonEmptyString(excerpt)) {
        return {
          ok: false,
          reason:
            'A "missing" judgment needs a note defending it from the text — the passage ' +
            'text could not be attached, so no bare clicks.',
        };
      }
      attachedExcerpt = excerpt.trim();
    }
  } else {
    // fits / doesnt-fit: judged against a result the engine actually returned.
    if (body.reference !== undefined) {
      return { ok: false, reason: '"reference" belongs to "missing" judgments only.' };
    }
    if (!nonEmptyString(body.targetId)) {
      return { ok: false, reason: `A "${verdict}" judgment needs the result's targetId.` };
    }
    if (!isDecodableTargetId(body.targetId)) {
      return {
        ok: false,
        reason: `"${body.targetId}" is not a target id like "WEB:59001022" (translation:verse-id).`,
      };
    }
  }

  if (verdict === 'fits') {
    for (const [field, hint] of [
      ['cause', 'causes belong to "doesnt-fit" judgments'],
      ['causeInferred', 'causeInferred belongs to "doesnt-fit" judgments'],
      ['conceptId', 'conceptId belongs to "doesnt-fit" judgments'],
    ] as const) {
      if (body[field] !== undefined) {
        return { ok: false, reason: `"${field}" does not belong on a "fits" judgment — ${hint}.` };
      }
    }
    if (body.pin !== undefined && body.pin !== true) {
      return { ok: false, reason: 'Omit "pin" for a plain ✓; send pin: true only to pin.' };
    }
    if (body.reasonFamily !== undefined) {
      if (body.pin !== true) {
        return {
          ok: false,
          reason: '"reasonFamily" only makes sense on a pinned ✓ — it compiles into the fixture.',
        };
      }
      if (!nonEmptyString(body.reasonFamily)) {
        return { ok: false, reason: 'A reasonFamily, when present, must be non-empty text.' };
      }
    }
  }

  if (verdict === 'doesnt-fit') {
    for (const [field, hint] of [
      ['pin', 'pin belongs to "fits" judgments'],
      ['reasonFamily', 'reasonFamily belongs to pinned "fits" judgments'],
    ] as const) {
      if (body[field] !== undefined) {
        return {
          ok: false,
          reason: `"${field}" does not belong on a "doesnt-fit" judgment — ${hint}.`,
        };
      }
    }
    const cause = body.cause;
    if (typeof cause !== 'string' || !(CAUSES as readonly string[]).includes(cause)) {
      return {
        ok: false,
        reason: 'A ✗ needs a cause: "wrong-anchor", "concept-misfire", or "lexical-noise".',
      };
    }
    if (body.causeInferred !== undefined && body.causeInferred !== true) {
      return {
        ok: false,
        reason:
          'Omit "causeInferred" for a reviewer-judged cause; send causeInferred: true only ' +
          'when the workbench classified it.',
      };
    }
    if (ANCHOR_AFFECTING_CAUSES.includes(cause as Cause)) {
      if (!nonEmptyString(body.conceptId)) {
        return {
          ok: false,
          reason: `A "${cause}" judgment must name the concept that produced the bad evidence.`,
        };
      }
      if (!nonEmptyString(body.note)) {
        return {
          ok: false,
          reason:
            `A "${cause}" judgment implies ontology work, so it needs a note defending it ` +
            'from the text — no bare clicks.',
        };
      }
    } else if (body.conceptId !== undefined) {
      return {
        ok: false,
        reason: '"conceptId" only belongs on "wrong-anchor" or "concept-misfire" judgments.',
      };
    }
  }

  const now = options.now ?? (() => new Date());
  const record: JudgmentRecord = {
    at: now().toISOString(),
    reviewer: options.reviewer,
    query: (body.query as string).trim(),
    verdict: verdict as Verdict,
    ...(body.targetId !== undefined ? { targetId: body.targetId as string } : {}),
    ...(body.reference !== undefined ? { reference: (body.reference as string).trim() } : {}),
    ...(body.pin === true ? { pin: true as const } : {}),
    ...(body.reasonFamily !== undefined ? { reasonFamily: body.reasonFamily as string } : {}),
    ...(body.cause !== undefined ? { cause: body.cause as Cause } : {}),
    ...(body.causeInferred === true ? { causeInferred: true as const } : {}),
    ...(body.conceptId !== undefined ? { conceptId: body.conceptId as string } : {}),
    ...(body.note !== undefined ? { note: (body.note as string).trim() } : {}),
    ...(attachedExcerpt !== undefined ? { excerpt: attachedExcerpt } : {}),
    engineVersion: options.identity.engineVersion,
    corpusFingerprint: options.identity.corpusFingerprint,
    layerFingerprint: options.identity.layerFingerprint,
  };
  return { ok: true, record };
}

function isKnownSource(value: unknown): value is ReviewCaseSource {
  return typeof value === 'string' && (REVIEW_CASE_SOURCES as readonly string[]).includes(value);
}

function isKnownAction(value: unknown): value is JudgmentAction {
  return typeof value === 'string' && (JUDGMENT_ACTIONS as readonly string[]).includes(value);
}

function isWithinTop(value: unknown): value is WithinTop {
  return typeof value === 'number' && (WITHIN_TOP_VALUES as readonly number[]).includes(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1;
}

/**
 * Reduces a captured, server-owned review snapshot to the immutable evidence
 * the judgment log persists. The returned data is detached and frozen so a
 * later mutation of a response object cannot change what gets stamped.
 */
export function createJudgmentV2Context(snapshot: JudgmentReviewSnapshot): JudgmentV2Context {
  if (!isUuid(snapshot.caseId)) throw new Error('Review snapshot caseId must be a UUID.');
  if (!nonEmptyString(snapshot.query)) throw new Error('Review snapshot query must be non-empty text.');
  if (!isKnownSource(snapshot.source)) throw new Error('Review snapshot source must be known.');
  if (!isPositiveInteger(snapshot.observedWindow)) throw new Error('Review snapshot observedWindow must be a positive integer.');
  if (!hasContiguousObservedResults(snapshot.results, snapshot.observedWindow)) {
    throw new Error('Review snapshot results need unique, contiguous ranks and unique targets inside the observed window.');
  }

  const results = orderedObservedResults(snapshot.results).map((result) => {
    if (!isPlainObject(result)) throw new Error('Review snapshot result must be an object.');
    let reasonDigest: string | undefined;
    if (Object.hasOwn(result, 'reason') && result.reason !== undefined) {
      reasonDigest = sha256Of(result.reason);
    }
    return Object.freeze({
      targetId: result.targetId,
      rank: result.rank,
      ...(reasonDigest === undefined ? {} : { reasonDigest }),
    });
  });
  const immutableResults = Object.freeze(results);
  return Object.freeze({
    caseId: snapshot.caseId,
    query: snapshot.query,
    source: snapshot.source,
    observedWindow: snapshot.observedWindow,
    resultSetDigest: resultSetDigestOf(immutableResults),
    displayedWindowDigest: displayedWindowDigestOf(snapshot.observedWindow, immutableResults),
    results: immutableResults,
  });
}

function v2TargetKey(record: Pick<JudgmentRecordV2, 'action' | 'targetId' | 'reference' | 'preferredTargetId' | 'otherTargetId'>): string {
  if (record.action === 'missing') return `reference:${record.reference ?? ''}`;
  if (record.action === 'prefer') {
    const pair = [record.preferredTargetId ?? '', record.otherTargetId ?? ''].sort();
    return `pair:${pair[0]}\u0000${pair[1]}`;
  }
  return `target:${record.targetId ?? ''}`;
}

function matchingSupersessionTarget(
  record: ParsedJudgmentRecord,
  query: string,
  caseId: string,
  targetKey: string,
): boolean {
  return isV2Record(record) &&
    record.query === query &&
    record.caseId === caseId &&
    v2TargetKey(record) === targetKey;
}

function hasUsableV2Context(context: JudgmentV2Context): boolean {
  if (!isUuid(context.caseId) || !nonEmptyString(context.query) || !isKnownSource(context.source)) return false;
  if (!isPositiveInteger(context.observedWindow)) return false;
  if (!isSha256(context.resultSetDigest) || !isSha256(context.displayedWindowDigest)) return false;
  if (!hasContiguousObservedResults(context.results, context.observedWindow)) return false;
  return context.resultSetDigest === resultSetDigestOf(context.results) &&
    context.displayedWindowDigest === displayedWindowDigestOf(context.observedWindow, context.results);
}

function resultForTarget(context: JudgmentV2Context, targetId: string): ObservedJudgmentResult | undefined {
  return context.results.find((result) => result.targetId === targetId);
}

async function validateSupersession(
  supersedes: unknown,
  record: Pick<JudgmentRecordV2, 'action' | 'targetId' | 'reference' | 'preferredTargetId' | 'otherTargetId'>,
  context: JudgmentV2Context,
  options: JudgmentLogOptions,
  at: string,
): Promise<{ readonly ok: true; readonly at: string } | { readonly ok: false; readonly reason: string }> {
  if (supersedes === undefined) return { ok: true, at };
  if (!isUuid(supersedes)) {
    return { ok: false, reason: '"supersedes", when present, must name a prior UUID judgment id.' };
  }
  const records = options.getExistingJudgments === undefined ? [] : await options.getExistingJudgments();
  const prior = records.find(
    (candidate): candidate is JudgmentRecordV2 => isV2Record(candidate) && candidate.judgmentId === supersedes,
  );
  if (prior === undefined) {
    return { ok: false, reason: `"supersedes" names no existing v2 judgment: "${supersedes}".` };
  }
  const targetKey = v2TargetKey(record);
  if (!matchingSupersessionTarget(prior, context.query, context.caseId, targetKey)) {
    return { ok: false, reason: 'A correction or reconfirmation must supersede the same query, case, and target.' };
  }
  const activeSuperseder = records.find(
    (candidate): candidate is JudgmentRecordV2 => isV2Record(candidate) && candidate.supersedes === supersedes,
  );
  if (activeSuperseder !== undefined) {
    return { ok: false, reason: `Judgment "${supersedes}" is already superseded by an active correction.` };
  }
  return {
    ok: true,
    at: new Date(Math.max(Date.parse(at), Date.parse(prior.at) + 1)).toISOString(),
  };
}

async function validateV2Judgment(body: Record<string, unknown>, options: JudgmentLogOptions): Promise<SubmitResult> {
  for (const key of Object.keys(body)) {
    if (SERVER_STAMPED_V2_FIELDS.has(key)) {
      return { ok: false, reason: `"${key}" is stamped by the server, never sent by the client.` };
    }
    if (!V2_CLIENT_FIELDS.has(key)) return { ok: false, reason: `Unknown field "${key}".` };
  }

  const action = body.action;
  if (!isKnownAction(action)) {
    return { ok: false, reason: 'Action must be "essential", "helpful", "irrelevant", "missing", or "prefer".' };
  }
  if (body.note !== undefined && !nonEmptyString(body.note)) {
    return { ok: false, reason: 'A note, when present, must be non-empty text.' };
  }
  const context = options.v2Context;
  if (context === undefined) {
    return { ok: false, reason: 'This server has no review-case snapshot for a v2 judgment.' };
  }
  if (!hasUsableV2Context(context)) {
    return { ok: false, reason: 'The server review-case snapshot is incomplete or invalid.' };
  }

  const requiresTarget = action === 'essential' || action === 'helpful' || action === 'irrelevant';
  const supportsWindow = action === 'essential' || action === 'missing';
  if (supportsWindow) {
    if (!isWithinTop(body.withinTop)) {
      return { ok: false, reason: 'Essential and missing judgments need withinTop: 1, 3, 5, or 10.' };
    }
  } else if (body.withinTop !== undefined) {
    return { ok: false, reason: '"withinTop" belongs to essential and missing judgments only.' };
  }

  let target: ObservedJudgmentResult | undefined;
  let attachedExcerpt: string | undefined;
  if (requiresTarget) {
    for (const field of ['reference', 'preferredTargetId', 'otherTargetId'] as const) {
      if (body[field] !== undefined) return { ok: false, reason: `"${field}" does not belong on a "${action}" judgment.` };
    }
    if (!nonEmptyString(body.targetId)) return { ok: false, reason: `A "${action}" judgment needs the result's targetId.` };
    if (!isDecodableTargetId(body.targetId)) {
      return { ok: false, reason: `"${body.targetId}" is not a target id like "WEB:59001022" (translation:verse-id).` };
    }
    target = resultForTarget(context, body.targetId);
    if (target === undefined) return { ok: false, reason: `"${body.targetId}" was not in the judged result set.` };
  } else if (action === 'missing') {
    for (const field of ['targetId', 'preferredTargetId', 'otherTargetId'] as const) {
      if (body[field] !== undefined) return { ok: false, reason: `"${field}" does not belong on a "missing" judgment.` };
    }
    if (!nonEmptyString(body.reference)) {
      return { ok: false, reason: 'A "missing" judgment needs the reference that should have surfaced.' };
    }
    const excerpt = await options.resolveReference(body.reference);
    if (excerpt === null) return { ok: false, reason: `"${body.reference}" is not a reference the engine can resolve.` };
    if (options.resolveReferenceTargetId === undefined) {
      return { ok: false, reason: 'This server cannot verify whether the missing reference was already displayed.' };
    }
    const referenceTargetId = await options.resolveReferenceTargetId(body.reference);
    if (referenceTargetId === null || !isDecodableTargetId(referenceTargetId)) {
      return { ok: false, reason: `"${body.reference}" could not be resolved to an exact target identity.` };
    }
    if (resultForTarget(context, referenceTargetId) !== undefined) {
      return { ok: false, reason: `"${body.reference}" was already present in the judged result set.` };
    }
    if (!nonEmptyString(body.note)) {
      if (!nonEmptyString(excerpt)) {
        return { ok: false, reason: 'A "missing" judgment needs a note defending it from the text when no passage text can be attached.' };
      }
      attachedExcerpt = excerpt.trim();
    }
  } else {
    for (const field of ['targetId', 'reference'] as const) {
      if (body[field] !== undefined) return { ok: false, reason: `"${field}" does not belong on a "prefer" judgment.` };
    }
    if (!nonEmptyString(body.preferredTargetId) || !nonEmptyString(body.otherTargetId)) {
      return { ok: false, reason: 'A "prefer" judgment needs preferredTargetId and otherTargetId.' };
    }
    if (body.preferredTargetId === body.otherTargetId) {
      return { ok: false, reason: 'Pairwise targets must be distinct.' };
    }
    for (const targetId of [body.preferredTargetId, body.otherTargetId]) {
      if (!isDecodableTargetId(targetId)) {
        return { ok: false, reason: `"${targetId}" is not a target id like "WEB:59001022" (translation:verse-id).` };
      }
      if (resultForTarget(context, targetId) === undefined) {
        return { ok: false, reason: `Pairwise target "${targetId}" was not in the judged result set.` };
      }
    }
    target = resultForTarget(context, body.preferredTargetId);
  }

  if (action === 'irrelevant') {
    const diagnosis = body.diagnosis;
    if (typeof diagnosis !== 'string' || !(CAUSES as readonly string[]).includes(diagnosis)) {
      return { ok: false, reason: 'An irrelevant judgment needs a diagnosis: "wrong-anchor", "concept-misfire", or "lexical-noise".' };
    }
    if (body.diagnosisInferred !== undefined && body.diagnosisInferred !== true) {
      return { ok: false, reason: 'Omit "diagnosisInferred" or send diagnosisInferred: true only.' };
    }
    if (ANCHOR_AFFECTING_CAUSES.includes(diagnosis as Cause)) {
      if (!nonEmptyString(body.conceptId)) {
        return { ok: false, reason: `A "${diagnosis}" judgment must name the concept that produced the bad evidence.` };
      }
      if (!nonEmptyString(body.note)) {
        return { ok: false, reason: `A "${diagnosis}" judgment implies ontology work, so it needs a note defending it from the text.` };
      }
    } else if (body.conceptId !== undefined) {
      return { ok: false, reason: '"conceptId" only belongs on wrong-anchor or concept-misfire judgments.' };
    }
  } else {
    for (const field of ['diagnosis', 'diagnosisInferred', 'conceptId'] as const) {
      if (body[field] !== undefined) return { ok: false, reason: `"${field}" belongs to irrelevant judgments only.` };
    }
  }

  const candidate = {
    action,
    ...(requiresTarget ? { targetId: body.targetId as string } : {}),
    ...(action === 'missing' ? { reference: (body.reference as string).trim() } : {}),
    ...(action === 'prefer'
      ? { preferredTargetId: body.preferredTargetId as string, otherTargetId: body.otherTargetId as string }
      : {}),
  };
  const now = options.now ?? (() => new Date());
  const at = now().toISOString();
  const supersession = await validateSupersession(body.supersedes, candidate, context, options, at);
  if (!supersession.ok) return supersession;

  const judgmentId = (options.createJudgmentId ?? randomUUID)();
  if (!isUuid(judgmentId)) {
    return { ok: false, reason: 'The server generated an invalid judgment UUID.' };
  }
  const record: JudgmentRecordV2 = {
    schemaVersion: 2,
    judgmentId,
    caseId: context.caseId,
    at: supersession.at,
    reviewer: options.reviewer,
    query: context.query,
    ...candidate,
    ...(supportsWindow ? { withinTop: body.withinTop as WithinTop } : {}),
    ...(action === 'missing' ? { observedRank: null } : { observedRank: target!.rank }),
    observedWindow: context.observedWindow,
    resultSetDigest: context.resultSetDigest,
    ...(target?.reasonDigest === undefined ? {} : { reasonDigest: target.reasonDigest }),
    displayedWindowDigest: context.displayedWindowDigest,
    ...(action === 'irrelevant' ? { diagnosis: body.diagnosis as Cause } : {}),
    ...(body.diagnosisInferred === true ? { diagnosisInferred: true as const } : {}),
    ...(body.conceptId === undefined ? {} : { conceptId: body.conceptId as string }),
    ...(body.note === undefined ? {} : { note: (body.note as string).trim() }),
    ...(attachedExcerpt === undefined ? {} : { excerpt: attachedExcerpt }),
    source: context.source,
    ...(body.supersedes === undefined ? {} : { supersedes: body.supersedes as string }),
    engineVersion: options.identity.engineVersion,
    corpusFingerprint: options.identity.corpusFingerprint,
    layerFingerprint: options.identity.layerFingerprint,
  };
  return { ok: true, record };
}

/** Validates either legacy v1 input or a v2 action, preserving v1 semantics exactly. */
export async function validateJudgment(body: unknown, options: JudgmentLogOptions): Promise<SubmitResult> {
  if (isPlainObject(body) && Object.hasOwn(body, 'action')) return validateV2Judgment(body, options);
  return validateV1Judgment(body, options);
}

function exactPersistedKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[],
  label: string,
): string | undefined {
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) return `${label} has unknown field "${key}".`;
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) return `${label} is missing required field "${key}".`;
  }
  return undefined;
}

function validatePersistedCommon(value: Record<string, unknown>, label: string): string | undefined {
  if (!isCanonicalTimestamp(value.at)) return `${label}.at must be a canonical UTC ISO timestamp.`;
  if (!canonicalText(value.reviewer) || !canonicalText(value.query)) {
    return `${label} needs canonical non-empty reviewer and query text.`;
  }
  if (!canonicalText(value.engineVersion) || !canonicalText(value.corpusFingerprint) || !canonicalText(value.layerFingerprint)) {
    return `${label} needs canonical non-empty engine, corpus, and layer identities.`;
  }
  return undefined;
}

function canonicalText(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.trim() === value;
}

function validateOptionalText(value: Record<string, unknown>, field: 'note' | 'excerpt', label: string): string | undefined {
  return value[field] !== undefined && !canonicalText(value[field])
    ? `${label}.${field}, when present, must be canonical non-empty text.`
    : undefined;
}

function parsePersistedV1(value: Record<string, unknown>): ParseJudgmentResult {
  const base = ['at', 'reviewer', 'query', 'verdict', 'engineVersion', 'corpusFingerprint', 'layerFingerprint'] as const;
  if (typeof value.verdict !== 'string' || !(VERDICTS as readonly string[]).includes(value.verdict)) {
    return { ok: false, reason: 'A v1 judgment record needs a known verdict.' };
  }

  const verdict = value.verdict as Verdict;
  const byVerdict: Record<Verdict, { required: readonly string[]; optional: readonly string[] }> = {
    fits: {
      required: [...base, 'targetId'],
      optional: ['pin', 'reasonFamily', 'note'],
    },
    'doesnt-fit': {
      required: [...base, 'targetId', 'cause'],
      optional: ['causeInferred', 'conceptId', 'note'],
    },
    missing: {
      required: [...base, 'reference'],
      optional: ['note', 'excerpt'],
    },
  };
  const keys = exactPersistedKeys(value, byVerdict[verdict].required, byVerdict[verdict].optional, `v1 ${verdict} judgment`);
  if (keys !== undefined) return { ok: false, reason: keys };
  const common = validatePersistedCommon(value, 'v1 judgment');
  if (common !== undefined) return { ok: false, reason: common };
  const note = validateOptionalText(value, 'note', 'v1 judgment');
  if (note !== undefined) return { ok: false, reason: note };

  if (verdict === 'fits') {
    if (!nonEmptyString(value.targetId) || !isDecodableTargetId(value.targetId)) {
      return { ok: false, reason: 'A v1 fits record needs a decodable targetId.' };
    }
    if (value.pin !== undefined && value.pin !== true) return { ok: false, reason: 'v1 fits pin must be true when present.' };
    if (value.reasonFamily !== undefined && !canonicalText(value.reasonFamily)) {
      return { ok: false, reason: 'v1 fits reasonFamily must be canonical non-empty text.' };
    }
    if (value.reasonFamily !== undefined && value.pin !== true) {
      return { ok: false, reason: 'v1 fits reasonFamily requires pin: true.' };
    }
  } else if (verdict === 'doesnt-fit') {
    if (!nonEmptyString(value.targetId) || !isDecodableTargetId(value.targetId)) {
      return { ok: false, reason: 'A v1 doesnt-fit record needs a decodable targetId.' };
    }
    if (!isKnownCause(value.cause)) return { ok: false, reason: 'A v1 doesnt-fit record needs a known cause.' };
    if (value.causeInferred !== undefined && value.causeInferred !== true) {
      return { ok: false, reason: 'v1 doesnt-fit causeInferred must be true when present.' };
    }
    if (ANCHOR_AFFECTING_CAUSES.includes(value.cause)) {
      if (!canonicalText(value.conceptId) || !canonicalText(value.note)) {
        return { ok: false, reason: 'Anchor-affecting v1 doesnt-fit records need conceptId and note.' };
      }
    } else if (value.conceptId !== undefined) {
      return { ok: false, reason: 'v1 doesnt-fit conceptId belongs to anchor-affecting causes only.' };
    }
  } else {
    const excerpt = validateOptionalText(value, 'excerpt', 'v1 missing judgment');
    if (excerpt !== undefined) return { ok: false, reason: excerpt };
    if (!canonicalText(value.reference)) return { ok: false, reason: 'A v1 missing record needs a canonical reference.' };
    if (!canonicalText(value.note) && !canonicalText(value.excerpt)) {
      return { ok: false, reason: 'A v1 missing record needs a note or excerpt.' };
    }
  }
  return { ok: true, record: value as unknown as JudgmentRecordV1 };
}

function isKnownCause(value: unknown): value is Cause {
  return typeof value === 'string' && (CAUSES as readonly string[]).includes(value);
}

function parsePersistedV2(value: Record<string, unknown>): ParseJudgmentResult {
  const base = [
    'schemaVersion', 'judgmentId', 'caseId', 'at', 'reviewer', 'query', 'action', 'observedRank', 'observedWindow',
    'resultSetDigest', 'displayedWindowDigest', 'source', 'engineVersion', 'corpusFingerprint', 'layerFingerprint',
  ] as const;
  if (value.schemaVersion !== 2) return { ok: false, reason: 'A v2 judgment record schemaVersion must be 2.' };
  if (!isKnownAction(value.action)) return { ok: false, reason: 'A v2 judgment record needs a known action.' };

  const action = value.action;
  const byAction: Record<JudgmentAction, { required: readonly string[]; optional: readonly string[] }> = {
    essential: { required: [...base, 'targetId', 'withinTop'], optional: ['reasonDigest', 'note', 'supersedes'] },
    helpful: { required: [...base, 'targetId'], optional: ['reasonDigest', 'note', 'supersedes'] },
    irrelevant: { required: [...base, 'targetId', 'diagnosis'], optional: ['reasonDigest', 'diagnosisInferred', 'conceptId', 'note', 'supersedes'] },
    missing: { required: [...base, 'reference', 'withinTop'], optional: ['note', 'excerpt', 'supersedes'] },
    prefer: { required: [...base, 'preferredTargetId', 'otherTargetId'], optional: ['reasonDigest', 'note', 'supersedes'] },
  };
  const keys = exactPersistedKeys(value, byAction[action].required, byAction[action].optional, `v2 ${action} judgment`);
  if (keys !== undefined) return { ok: false, reason: keys };
  const common = validatePersistedCommon(value, 'v2 judgment');
  if (common !== undefined) return { ok: false, reason: common };
  if (!isUuid(value.judgmentId) || !isUuid(value.caseId)) {
    return { ok: false, reason: 'A v2 judgment record needs UUID judgmentId and caseId.' };
  }
  if (!isPositiveInteger(value.observedWindow) || !isSha256(value.resultSetDigest) || !isSha256(value.displayedWindowDigest) || !isKnownSource(value.source)) {
    return { ok: false, reason: 'A v2 judgment record has invalid server-stamped review evidence.' };
  }
  if (value.supersedes !== undefined && !isUuid(value.supersedes)) {
    return { ok: false, reason: 'v2 supersedes must be a UUID when present.' };
  }
  const note = validateOptionalText(value, 'note', 'v2 judgment');
  if (note !== undefined) return { ok: false, reason: note };
  if (value.reasonDigest !== undefined && !isSha256(value.reasonDigest)) {
    return { ok: false, reason: 'v2 reasonDigest must be a SHA-256 digest when present.' };
  }

  if (action === 'missing') {
    if (!canonicalText(value.reference) || value.observedRank !== null || !isWithinTop(value.withinTop)) {
      return { ok: false, reason: 'A v2 missing record needs reference, withinTop, and observedRank: null.' };
    }
    const excerpt = validateOptionalText(value, 'excerpt', 'v2 missing judgment');
    if (excerpt !== undefined) return { ok: false, reason: excerpt };
    if (!canonicalText(value.note) && !canonicalText(value.excerpt)) {
      return { ok: false, reason: 'A v2 missing record needs a note or excerpt.' };
    }
  } else {
    if (!isPositiveInteger(value.observedRank) || value.observedRank > value.observedWindow) {
      return { ok: false, reason: 'A v2 result judgment needs observedRank inside observedWindow.' };
    }
    if (action === 'essential' && !isWithinTop(value.withinTop)) {
      return { ok: false, reason: 'A v2 essential record needs withinTop: 1, 3, 5, or 10.' };
    }
    if (action === 'prefer') {
      if (!nonEmptyString(value.preferredTargetId) || !nonEmptyString(value.otherTargetId) ||
        !isDecodableTargetId(value.preferredTargetId) || !isDecodableTargetId(value.otherTargetId) ||
        value.preferredTargetId === value.otherTargetId) {
        return { ok: false, reason: 'A v2 prefer record needs distinct decodable pairwise targets.' };
      }
    } else {
      if (!nonEmptyString(value.targetId) || !isDecodableTargetId(value.targetId)) {
        return { ok: false, reason: 'A v2 result judgment needs a decodable targetId.' };
      }
    }
  }

  if (action === 'irrelevant') {
    if (!isKnownCause(value.diagnosis)) return { ok: false, reason: 'A v2 irrelevant record needs a known diagnosis.' };
    if (value.diagnosisInferred !== undefined && value.diagnosisInferred !== true) {
      return { ok: false, reason: 'v2 irrelevant diagnosisInferred must be true when present.' };
    }
    if (ANCHOR_AFFECTING_CAUSES.includes(value.diagnosis)) {
      if (!canonicalText(value.conceptId) || !canonicalText(value.note)) {
        return { ok: false, reason: 'Anchor-affecting v2 irrelevant records need conceptId and note.' };
      }
    } else if (value.conceptId !== undefined) {
      return { ok: false, reason: 'v2 irrelevant conceptId belongs to anchor-affecting diagnoses only.' };
    }
  }
  return { ok: true, record: value as unknown as JudgmentRecordV2 };
}

/** Parses and strictly validates one persisted v1 or v2 history line. */
export function parseJudgmentRecord(value: unknown): ParseJudgmentResult {
  if (!isPlainObject(value)) return { ok: false, reason: 'A judgment record must be a JSON object.' };
  return Object.hasOwn(value, 'schemaVersion') ? parsePersistedV2(value) : parsePersistedV1(value);
}

async function readExistingJudgments(logPath: string): Promise<readonly ParsedJudgmentRecord[]> {
  let raw: string;
  try {
    raw = await readFile(logPath, 'utf8');
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const records: ParsedJudgmentRecord[] = [];
  for (const [index, line] of raw.split('\n').entries()) {
    if (line.trim() === '') continue;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch {
      throw new Error(`judgments.jsonl line ${index + 1} is not valid JSON.`);
    }
    const parsed = parseJudgmentRecord(value);
    if (!parsed.ok) throw new Error(`judgments.jsonl line ${index + 1} is invalid: ${parsed.reason}`);
    records.push(parsed.record);
  }
  return records;
}

export interface JudgmentLog {
  /** Validates, stamps, and appends exactly one line. Never rewrites. */
  submit(body: unknown): Promise<SubmitResult>;
}

export function createJudgmentLog(options: JudgmentLogOptions): JudgmentLog {
  const appendedDuringLifetime: ParsedJudgmentRecord[] = [];
  const getExistingJudgments = options.getExistingJudgments === undefined
    ? () => readExistingJudgments(options.logPath)
    : async () => [...await options.getExistingJudgments!(), ...appendedDuringLifetime];
  const validationOptions: JudgmentLogOptions = { ...options, getExistingJudgments };
  let tail: Promise<void> = Promise.resolve();

  async function submitInOrder(body: unknown): Promise<SubmitResult> {
    const result = await validateJudgment(body, validationOptions);
    if (!result.ok) return result;
    await appendFile(options.logPath, `${JSON.stringify(result.record)}\n`, 'utf8');
    if (options.getExistingJudgments !== undefined) appendedDuringLifetime.push(result.record);
    return result;
  }

  return {
    submit(body: unknown): Promise<SubmitResult> {
      const run = tail.then(() => submitInOrder(body));
      // A failed append must not strand later submissions behind a rejected tail.
      tail = run.then(() => undefined, () => undefined);
      return run;
    },
  };
}
