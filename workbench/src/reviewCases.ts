import { randomUUID } from 'node:crypto';
import { appendFile, readFile } from 'node:fs/promises';

import type { ResearchResult, ScriptureEngine } from '@jestek-dev/scripture-engine';

import {
  CASE_SOURCES,
  foldCaseEvents,
  readFoldedCaseEventLog,
  serializeCaseEventLog,
  type CaseArtifactIdentity,
  type CaseCreated,
  type CaseSnapshot,
  type CaseSource,
  type CaseState,
  type CaseStateChanged,
} from './cases.js';
import {
  createJudgmentV2Context,
  parseJudgmentRecord,
  type JudgmentV2Context,
  type ParsedJudgmentRecord,
} from './judgments.js';

export const REVIEW_WINDOW = 10;
export const REVIEW_SNAPSHOT_LIMIT = 128;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface CaseCreateRequest {
  readonly query: string;
  readonly source: CaseSource;
}

export interface CaseLogOptions {
  readonly path: string;
  readonly reviewer: string;
  readonly artifact: CaseArtifactIdentity;
}

export interface CapturedReviewSnapshot {
  readonly token: string;
  readonly caseId: string;
  readonly query: string;
  readonly source: CaseSource;
  readonly observedWindow: number;
  /** The immutable, server-produced engine response shown to the reviewer. */
  readonly result: ResearchResult;
  readonly context: JudgmentV2Context;
}

export interface ReviewSnapshotView {
  readonly token: string;
  readonly caseId: string;
  readonly query: string;
  readonly source: CaseSource;
  readonly observedWindow: number;
  readonly resultSetDigest: string;
  readonly displayedWindowDigest: string;
  readonly result: ResearchResult;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMissingFile(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT';
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function immutableJson<T>(value: T): T {
  return deepFreeze(JSON.parse(JSON.stringify(value)) as T);
}

function visibleResult(result: ResearchResult): ResearchResult {
  if (result.kind !== 'discovery') return immutableJson(result);
  return immutableJson({ ...result, results: result.results.slice(0, REVIEW_WINDOW) });
}

export function isCaseId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/** Parses the deliberately small POST /cases contract before any write occurs. */
export function parseCaseCreateRequest(value: unknown): CaseCreateRequest {
  if (!isPlainObject(value)) throw new Error('A case request must be a JSON object.');
  const allowed = new Set(['query', 'source']);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`Unknown case request field "${key}".`);
  }
  if (typeof value.query !== 'string' || value.query.trim() === '') {
    throw new Error('Case query must be non-empty text.');
  }
  if (typeof value.source !== 'string' || !(CASE_SOURCES as readonly string[]).includes(value.source)) {
    throw new Error('Case source must be a known case source.');
  }
  return { query: value.query.trim(), source: value.source as CaseSource };
}

/** Reads all JSONL rows before returning derived state; a missing new log is empty. */
export async function readCases(path: string): Promise<readonly CaseSnapshot[]> {
  try {
    return await readFoldedCaseEventLog(path);
  } catch (error) {
    if (isMissingFile(error)) return [];
    throw error;
  }
}

/** Parses every persisted judgment row before exposing history; a missing new log is empty. */
export async function readJudgments(path: string): Promise<readonly ParsedJudgmentRecord[]> {
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch (error) {
    if (isMissingFile(error)) return [];
    throw error;
  }
  const records: ParsedJudgmentRecord[] = [];
  for (const [index, line] of raw.split('\n').entries()) {
    if (line.trim() === '') continue;
    let input: unknown;
    try {
      input = JSON.parse(line) as unknown;
    } catch {
      throw new Error(`judgments.jsonl line ${index + 1} is not valid JSON.`);
    }
    const parsed = parseJudgmentRecord(input);
    if (!parsed.ok) throw new Error(`judgments.jsonl line ${index + 1} is invalid: ${parsed.reason}`);
    records.push(parsed.record);
  }
  return records;
}

/**
 * Serializes case appends inside one process and validates the complete log
 * before each append. The strict case module validates the new row again as
 * part of its canonical single-row serialization.
 */
export class CaseLog {
  private tail: Promise<void> = Promise.resolve();

  constructor(private readonly options: CaseLogOptions) {}

  read(): Promise<readonly CaseSnapshot[]> {
    return readCases(this.options.path);
  }

  create(input: CaseCreateRequest): Promise<{ readonly event: CaseCreated; readonly case: CaseSnapshot }> {
    const run = this.tail.then(async () => {
      await this.read();
      const event: CaseCreated = {
        schemaVersion: 2,
        eventId: randomUUID(),
        caseId: randomUUID(),
        at: new Date().toISOString(),
        reviewer: this.options.reviewer,
        sequence: 1,
        kind: 'case-created',
        query: input.query,
        source: input.source,
        artifact: this.options.artifact,
      };
      await appendFile(this.options.path, serializeCaseEventLog([event]), 'utf8');
      const [snapshot] = foldCaseEvents([event]);
      if (snapshot === undefined) throw new Error('Created case did not fold to a snapshot.');
      return { event, case: snapshot };
    });
    this.tail = run.then(() => undefined, () => undefined);
    return run;
  }

  transition(caseId: string, state: CaseState): Promise<{ readonly event: CaseStateChanged; readonly case: CaseSnapshot }> {
    const run = this.tail.then(async () => {
      const cases = await this.read();
      const current = cases.find((entry) => entry.caseId === caseId);
      if (current === undefined) throw new Error(`Unknown review case "${caseId}".`);
      const parent = current.events.at(-1);
      if (parent === undefined) throw new Error(`Review case "${caseId}" has no causal root.`);
      const at = new Date(Math.max(Date.now(), Date.parse(parent.at) + 1)).toISOString();
      const event: CaseStateChanged = {
        schemaVersion: 2,
        eventId: randomUUID(),
        caseId,
        at,
        reviewer: this.options.reviewer,
        sequence: parent.sequence + 1,
        kind: 'case-state-changed',
        parentEventId: parent.eventId,
        state,
      };
      const allEvents = cases.flatMap((entry) => entry.events);
      const nextCases = foldCaseEvents([...allEvents, event]);
      const next = nextCases.find((entry) => entry.caseId === caseId);
      if (next === undefined) throw new Error(`Transitioned case "${caseId}" did not fold to a snapshot.`);
      await appendFile(this.options.path, `${JSON.stringify(event)}\n`, 'utf8');
      return { event, case: next };
    });
    this.tail = run.then(() => undefined, () => undefined);
    return run;
  }
}

/** Captures the displayed engine response and reduces it through the strict judgment helper. */
export async function captureReviewSnapshot(
  engine: ScriptureEngine,
  caseId: string,
  query: string,
  source: CaseSource,
): Promise<CapturedReviewSnapshot> {
  const result = visibleResult(await engine.research(query));
  const displayed = result.kind === 'discovery' ? result.results : [];
  const context = createJudgmentV2Context({
    caseId,
    query,
    source,
    observedWindow: REVIEW_WINDOW,
    results: displayed.map((item, index) => ({
      targetId: item.targetId,
      rank: index + 1,
      reason: item.reasons,
    })),
  });
  return Object.freeze({
    token: randomUUID(),
    caseId,
    query,
    source,
    observedWindow: REVIEW_WINDOW,
    result,
    context,
  });
}

export function reviewSnapshotView(snapshot: CapturedReviewSnapshot): ReviewSnapshotView {
  return {
    token: snapshot.token,
    caseId: snapshot.caseId,
    query: snapshot.query,
    source: snapshot.source,
    observedWindow: snapshot.observedWindow,
    resultSetDigest: snapshot.context.resultSetDigest,
    displayedWindowDigest: snapshot.context.displayedWindowDigest,
    result: snapshot.result,
  };
}

/** Bounded snapshots are deliberately process-local: restart requires a fresh GET /case review. */
export class ReviewSnapshotStore {
  private readonly byToken = new Map<string, CapturedReviewSnapshot>();
  private readonly tokenByCase = new Map<string, string>();

  constructor(private readonly limit = REVIEW_SNAPSHOT_LIMIT) {
    if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('Review snapshot limit must be positive.');
  }

  put(snapshot: CapturedReviewSnapshot): void {
    const priorToken = this.tokenByCase.get(snapshot.caseId);
    if (priorToken !== undefined) this.byToken.delete(priorToken);
    this.byToken.set(snapshot.token, snapshot);
    this.tokenByCase.set(snapshot.caseId, snapshot.token);
    while (this.byToken.size > this.limit) {
      const oldestToken = this.byToken.keys().next().value as string | undefined;
      if (oldestToken === undefined) return;
      const oldest = this.byToken.get(oldestToken);
      this.byToken.delete(oldestToken);
      if (oldest !== undefined && this.tokenByCase.get(oldest.caseId) === oldestToken) {
        this.tokenByCase.delete(oldest.caseId);
      }
    }
  }

  get(caseId: string, token: string): CapturedReviewSnapshot | undefined {
    const snapshot = this.byToken.get(token);
    if (snapshot === undefined || snapshot.caseId !== caseId) return undefined;
    this.byToken.delete(token);
    this.byToken.set(token, snapshot);
    return snapshot;
  }

  getForCase(caseId: string): CapturedReviewSnapshot | undefined {
    const token = this.tokenByCase.get(caseId);
    return token === undefined ? undefined : this.get(caseId, token);
  }
}
