import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

/**
 * Append-only v2 review-case events (plan sections 3.1 and 4.2).
 *
 * Events are validated as a causal chain before they are folded. Nothing is
 * repaired, reordered in place, or silently dropped: an invalid log has no
 * derived case state.
 */

export const CASE_SOURCES = [
  'manual',
  'gauntlet',
  'coverage',
  'stale-judgment',
  'telemetry',
  'calibration',
  'regression',
] as const;
export type CaseSource = (typeof CASE_SOURCES)[number];

export const CASE_STATES = [
  'new',
  'reviewing',
  'judged',
  'proposed',
  'candidate-ready',
  'admitted',
  'pr-prepared',
  'merged',
  'monitored',
  'rejected',
  'needs-engineering',
] as const;
export type CaseState = (typeof CASE_STATES)[number];

const STATE_TRANSITIONS: Readonly<Record<CaseState, readonly CaseState[]>> = {
  new: ['reviewing'],
  reviewing: ['judged'],
  judged: ['proposed', 'needs-engineering'],
  proposed: ['candidate-ready'],
  'candidate-ready': ['admitted', 'rejected'],
  admitted: ['pr-prepared'],
  'pr-prepared': ['merged'],
  merged: ['monitored'],
  monitored: [],
  rejected: [],
  'needs-engineering': [],
};

const LINK_STATE_PRECONDITIONS = {
  'proposal-linked': 'proposed',
  'candidate-linked': 'candidate-ready',
  'admission-recorded': 'admitted',
  'pull-request-linked': 'pr-prepared',
} as const;

export interface CaseArtifactIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

interface CaseEventBase {
  readonly schemaVersion: 2;
  readonly eventId: string;
  readonly caseId: string;
  readonly at: string;
  readonly reviewer: string;
  readonly sequence: number;
}

export interface CaseCreated extends CaseEventBase {
  readonly kind: 'case-created';
  /** A created event is the only root of a case's causal chain. */
  readonly parentEventId?: never;
  readonly query: string;
  readonly source: CaseSource;
  readonly artifact: CaseArtifactIdentity;
}

interface DescendantCaseEvent extends CaseEventBase {
  readonly parentEventId: string;
}

export interface CaseAssignedToSession extends DescendantCaseEvent {
  readonly kind: 'case-assigned-to-session';
  readonly sessionId: string;
}

export interface CaseStateChanged extends DescendantCaseEvent {
  readonly kind: 'case-state-changed';
  readonly state: CaseState;
}

export interface ProposalLinked extends DescendantCaseEvent {
  readonly kind: 'proposal-linked';
  readonly proposalId: string;
}

export interface CandidateLinked extends DescendantCaseEvent {
  readonly kind: 'candidate-linked';
  readonly candidateId: string;
}

export interface AdmissionRecorded extends DescendantCaseEvent {
  readonly kind: 'admission-recorded';
  readonly admissionId: string;
}

export interface PullRequestLinked extends DescendantCaseEvent {
  readonly kind: 'pull-request-linked';
  readonly pullRequestUrl: string;
}

/** Every v2 event kind planned in section 4.2. */
export type CaseEvent =
  | CaseCreated
  | CaseAssignedToSession
  | CaseStateChanged
  | ProposalLinked
  | CandidateLinked
  | AdmissionRecorded
  | PullRequestLinked;

export interface CaseSnapshot {
  readonly caseId: string;
  readonly query: string;
  readonly source: CaseSource;
  readonly artifact: CaseArtifactIdentity;
  readonly state: CaseState;
  readonly events: readonly CaseEvent[];
  readonly sessionIds: readonly string[];
  readonly proposalIds: readonly string[];
  readonly candidateIds: readonly string[];
  readonly admissionIds: readonly string[];
  readonly pullRequestUrls: readonly string[];
}

export class CaseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CaseValidationError';
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireExactKeys(value: Record<string, unknown>, keys: readonly string[], label: string): void {
  const allowed = new Set(keys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new CaseValidationError(`${label} has unknown field "${key}".`);
  }
  for (const key of keys) {
    if (!(key in value)) throw new CaseValidationError(`${label} is missing required field "${key}".`);
  }
}

function requireNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new CaseValidationError(`${label} must be non-empty text.`);
  }
  return value;
}

function requireUuid(value: unknown, label: string): string {
  const uuid = requireNonEmptyString(value, label);
  if (!UUID_PATTERN.test(uuid)) throw new CaseValidationError(`${label} must be a UUID.`);
  return uuid;
}

function requireTimestamp(value: unknown, label: string): string {
  const timestamp = requireNonEmptyString(value, label);
  if (!ISO_TIMESTAMP_PATTERN.test(timestamp) || Number.isNaN(Date.parse(timestamp)) || new Date(timestamp).toISOString() !== timestamp) {
    throw new CaseValidationError(`${label} must be a canonical UTC ISO timestamp.`);
  }
  return timestamp;
}

function requireIdentifier(value: unknown, label: string): string {
  return requireUuid(value, label);
}

function parseArtifact(value: unknown): CaseArtifactIdentity {
  if (!isPlainObject(value)) throw new CaseValidationError('case-created.artifact must be an object.');
  requireExactKeys(value, ['engineVersion', 'corpusFingerprint', 'layerFingerprint'], 'case-created.artifact');
  return {
    engineVersion: requireNonEmptyString(value.engineVersion, 'case-created.artifact.engineVersion'),
    corpusFingerprint: requireNonEmptyString(value.corpusFingerprint, 'case-created.artifact.corpusFingerprint'),
    layerFingerprint: requireNonEmptyString(value.layerFingerprint, 'case-created.artifact.layerFingerprint'),
  };
}

function parseBase(value: Record<string, unknown>, label: string): CaseEventBase {
  if (value.schemaVersion !== 2) throw new CaseValidationError(`${label}.schemaVersion must be 2.`);
  if (!Number.isSafeInteger(value.sequence) || (value.sequence as number) < 1) {
    throw new CaseValidationError(`${label}.sequence must be a positive safe integer.`);
  }
  return {
    schemaVersion: 2,
    eventId: requireUuid(value.eventId, `${label}.eventId`),
    caseId: requireUuid(value.caseId, `${label}.caseId`),
    at: requireTimestamp(value.at, `${label}.at`),
    reviewer: requireNonEmptyString(value.reviewer, `${label}.reviewer`),
    sequence: value.sequence as number,
  };
}

/** Parses one event with an intentionally closed schema. */
export function parseCaseEvent(input: unknown): CaseEvent {
  if (!isPlainObject(input)) throw new CaseValidationError('A case event must be a JSON object.');
  const kind = input.kind;
  if (typeof kind !== 'string') throw new CaseValidationError('A case event needs a known "kind".');

  const baseKeys = ['schemaVersion', 'eventId', 'caseId', 'at', 'reviewer', 'sequence', 'kind'] as const;
  switch (kind) {
    case 'case-created': {
      requireExactKeys(input, [...baseKeys, 'query', 'source', 'artifact'], 'case-created');
      const base = parseBase(input, 'case-created');
      if (input.parentEventId !== undefined) throw new CaseValidationError('case-created must not have parentEventId.');
      if (base.sequence !== 1) throw new CaseValidationError('case-created.sequence must be 1.');
      if (typeof input.source !== 'string' || !(CASE_SOURCES as readonly string[]).includes(input.source)) {
        throw new CaseValidationError('case-created.source must be a known case source.');
      }
      return {
        ...base,
        kind,
        query: requireNonEmptyString(input.query, 'case-created.query'),
        source: input.source as CaseSource,
        artifact: parseArtifact(input.artifact),
      };
    }
    case 'case-assigned-to-session': {
      requireExactKeys(input, [...baseKeys, 'parentEventId', 'sessionId'], kind);
      const base = parseBase(input, kind);
      return { ...base, kind, parentEventId: requireUuid(input.parentEventId, `${kind}.parentEventId`), sessionId: requireIdentifier(input.sessionId, `${kind}.sessionId`) };
    }
    case 'case-state-changed': {
      requireExactKeys(input, [...baseKeys, 'parentEventId', 'state'], kind);
      const base = parseBase(input, kind);
      if (typeof input.state !== 'string' || !(CASE_STATES as readonly string[]).includes(input.state)) {
        throw new CaseValidationError('case-state-changed.state must be a known case state.');
      }
      return { ...base, kind, parentEventId: requireUuid(input.parentEventId, `${kind}.parentEventId`), state: input.state as CaseState };
    }
    case 'proposal-linked': {
      requireExactKeys(input, [...baseKeys, 'parentEventId', 'proposalId'], kind);
      const base = parseBase(input, kind);
      return { ...base, kind, parentEventId: requireUuid(input.parentEventId, `${kind}.parentEventId`), proposalId: requireIdentifier(input.proposalId, `${kind}.proposalId`) };
    }
    case 'candidate-linked': {
      requireExactKeys(input, [...baseKeys, 'parentEventId', 'candidateId'], kind);
      const base = parseBase(input, kind);
      return { ...base, kind, parentEventId: requireUuid(input.parentEventId, `${kind}.parentEventId`), candidateId: requireIdentifier(input.candidateId, `${kind}.candidateId`) };
    }
    case 'admission-recorded': {
      requireExactKeys(input, [...baseKeys, 'parentEventId', 'admissionId'], kind);
      const base = parseBase(input, kind);
      return { ...base, kind, parentEventId: requireUuid(input.parentEventId, `${kind}.parentEventId`), admissionId: requireIdentifier(input.admissionId, `${kind}.admissionId`) };
    }
    case 'pull-request-linked': {
      requireExactKeys(input, [...baseKeys, 'parentEventId', 'pullRequestUrl'], kind);
      const base = parseBase(input, kind);
      const pullRequestUrl = requireNonEmptyString(input.pullRequestUrl, `${kind}.pullRequestUrl`);
      let url: URL;
      try {
        url = new URL(pullRequestUrl);
      } catch {
        throw new CaseValidationError('pull-request-linked.pullRequestUrl must be an absolute HTTPS URL.');
      }
      if (url.protocol !== 'https:') throw new CaseValidationError('pull-request-linked.pullRequestUrl must be an absolute HTTPS URL.');
      return { ...base, kind, parentEventId: requireUuid(input.parentEventId, `${kind}.parentEventId`), pullRequestUrl };
    }
    default:
      throw new CaseValidationError(`Unknown case event kind "${kind}".`);
  }
}

/** Strict JSONL parser. A blank line in a non-empty log is data corruption. */
export function parseCaseEventLog(jsonl: string): readonly CaseEvent[] {
  if (jsonl === '') return [];
  const lines = jsonl.split('\n');
  if (lines.at(-1) === '') lines.pop();
  return lines.map((line, index) => {
    if (line.trim() === '') throw new CaseValidationError(`cases.jsonl line ${index + 1} is blank.`);
    try {
      return parseCaseEvent(JSON.parse(line) as unknown);
    } catch (error) {
      if (error instanceof CaseValidationError) throw new CaseValidationError(`cases.jsonl line ${index + 1}: ${error.message}`);
      throw new CaseValidationError(`cases.jsonl line ${index + 1} is not valid JSON.`);
    }
  });
}

function eventParent(event: CaseEvent): string | undefined {
  return event.kind === 'case-created' ? undefined : event.parentEventId;
}

function validateCaseChain(caseEvents: readonly CaseEvent[]): readonly CaseEvent[] {
  const caseId = caseEvents[0]?.caseId;
  if (caseId === undefined) return [];
  const byId = new Map<string, CaseEvent>();
  const childCounts = new Map<string, number>();
  const childByParent = new Map<string, CaseEvent>();
  const sequences = new Set<number>();
  let created: CaseCreated | undefined;

  for (const event of caseEvents) {
    if (byId.has(event.eventId)) throw new CaseValidationError(`Duplicate eventId "${event.eventId}".`);
    if (sequences.has(event.sequence)) throw new CaseValidationError(`Case "${caseId}" repeats sequence ${event.sequence}.`);
    byId.set(event.eventId, event);
    sequences.add(event.sequence);
    if (event.kind === 'case-created') {
      if (created !== undefined) throw new CaseValidationError(`Case "${caseId}" has more than one case-created event.`);
      created = event;
    }
  }
  if (created === undefined) throw new CaseValidationError(`Case "${caseId}" is missing its case-created event.`);

  for (const event of caseEvents) {
    const parentId = eventParent(event);
    if (parentId === undefined) continue;
    const parent = byId.get(parentId);
    if (parent === undefined) {
      throw new CaseValidationError(`Event "${event.eventId}" names missing parentEventId "${parentId}".`);
    }
    if (parent.caseId !== event.caseId) {
      throw new CaseValidationError(`Event "${event.eventId}" links to a parent in another case.`);
    }
    const childCount = (childCounts.get(parentId) ?? 0) + 1;
    if (childCount > 1) throw new CaseValidationError(`Event "${parentId}" has multiple children; case history must not fork.`);
    childCounts.set(parentId, childCount);
    childByParent.set(parentId, event);
  }

  // Diagnose cycles directly, even though a cycle also violates monotonicity.
  for (const event of caseEvents) {
    const seenInWalk = new Set<string>();
    let current: CaseEvent | undefined = event;
    while (current !== undefined) {
      if (seenInWalk.has(current.eventId)) throw new CaseValidationError(`Case "${caseId}" contains a parent cycle.`);
      seenInWalk.add(current.eventId);
      const parentId = eventParent(current);
      current = parentId === undefined ? undefined : byId.get(parentId);
    }
  }
  for (const event of caseEvents) {
    const parentId = eventParent(event);
    if (parentId === undefined) continue;
    const parent = byId.get(parentId)!;
    if (parent.sequence >= event.sequence) {
      throw new CaseValidationError(`Event "${event.eventId}" must have a sequence greater than its parent.`);
    }
    if (event.sequence !== parent.sequence + 1) {
      throw new CaseValidationError(`Event "${event.eventId}" must use the next deterministic sequence after its parent.`);
    }
    if (event.at < parent.at) {
      throw new CaseValidationError(`Event "${event.eventId}" cannot be earlier than its parent timestamp.`);
    }
  }

  const ordered: CaseEvent[] = [];
  const seen = new Set<string>();
  let current: CaseEvent | undefined = created;
  while (current !== undefined) {
    if (seen.has(current.eventId)) throw new CaseValidationError(`Case "${caseId}" contains a parent cycle.`);
    seen.add(current.eventId);
    ordered.push(current);
    current = childByParent.get(current.eventId);
  }
  if (seen.size !== caseEvents.length) {
    const disconnected = caseEvents.find((event) => !seen.has(event.eventId));
    throw new CaseValidationError(`Case "${caseId}" has a disconnected chain or parent cycle at event "${disconnected?.eventId}".`);
  }
  let state: CaseState = 'new';
  for (const event of ordered) {
    if (event.kind === 'case-state-changed') {
      if (!STATE_TRANSITIONS[state].includes(event.state)) {
        throw new CaseValidationError(`Illegal state transition for case "${caseId}": ${state} -> ${event.state}.`);
      }
      state = event.state;
      continue;
    }
    if (event.kind in LINK_STATE_PRECONDITIONS) {
      const requiredState = LINK_STATE_PRECONDITIONS[event.kind as keyof typeof LINK_STATE_PRECONDITIONS];
      if (state !== requiredState) {
        throw new CaseValidationError(`Event "${event.kind}" for case "${caseId}" requires state "${requiredState}", not "${state}".`);
      }
    }
  }
  return ordered;
}

/**
 * Validates all causal invariants and returns events in deterministic causal
 * order. Input file order has no bearing on the result.
 */
export function validateCaseEvents(input: readonly unknown[]): readonly CaseEvent[] {
  const events = input.map(parseCaseEvent);
  const globalById = new Map<string, CaseEvent>();
  for (const event of events) {
    if (globalById.has(event.eventId)) throw new CaseValidationError(`Duplicate eventId "${event.eventId}".`);
    globalById.set(event.eventId, event);
  }
  for (const event of events) {
    const parentId = eventParent(event);
    const parent = parentId === undefined ? undefined : globalById.get(parentId);
    if (parent !== undefined && parent.caseId !== event.caseId) {
      throw new CaseValidationError(`Event "${event.eventId}" links to a parent in another case.`);
    }
  }
  const byCase = new Map<string, CaseEvent[]>();
  for (const event of events) {
    const bucket = byCase.get(event.caseId);
    if (bucket === undefined) byCase.set(event.caseId, [event]);
    else bucket.push(event);
  }
  return [...byCase.entries()]
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .flatMap(([, caseEvents]) => validateCaseChain(caseEvents));
}

function appendUnique(items: string[], value: string): void {
  if (!items.includes(value)) items.push(value);
}

/** Folds only a validated chain, making state an immutable derived value. */
export function foldCaseEvents(input: readonly unknown[]): readonly CaseSnapshot[] {
  const events = validateCaseEvents(input);
  const byCase = new Map<string, CaseEvent[]>();
  for (const event of events) {
    const bucket = byCase.get(event.caseId);
    if (bucket === undefined) byCase.set(event.caseId, [event]);
    else bucket.push(event);
  }

  return [...byCase.entries()].map(([caseId, chain]) => {
    const created = chain[0];
    if (created?.kind !== 'case-created') throw new CaseValidationError(`Case "${caseId}" does not start with case-created.`);
    let state: CaseState = 'new';
    const sessionIds: string[] = [];
    const proposalIds: string[] = [];
    const candidateIds: string[] = [];
    const admissionIds: string[] = [];
    const pullRequestUrls: string[] = [];
    for (const event of chain) {
      switch (event.kind) {
        case 'case-state-changed':
          if (!STATE_TRANSITIONS[state].includes(event.state)) {
            throw new CaseValidationError(`Illegal state transition for case "${caseId}": ${state} -> ${event.state}.`);
          }
          state = event.state;
          break;
        case 'case-assigned-to-session':
          appendUnique(sessionIds, event.sessionId);
          break;
        case 'proposal-linked':
          appendUnique(proposalIds, event.proposalId);
          break;
        case 'candidate-linked':
          appendUnique(candidateIds, event.candidateId);
          break;
        case 'admission-recorded':
          appendUnique(admissionIds, event.admissionId);
          break;
        case 'pull-request-linked':
          appendUnique(pullRequestUrls, event.pullRequestUrl);
          break;
        case 'case-created':
          break;
      }
    }
    return {
      caseId,
      query: created.query,
      source: created.source,
      artifact: created.artifact,
      state,
      events: chain,
      sessionIds,
      proposalIds,
      candidateIds,
      admissionIds,
      pullRequestUrls,
    };
  });
}

const SHA256_HEX_PATTERN = /^[0-9a-f]{64}$/;
const CHECKED_V1_RECORD_COUNT = 3;

/**
 * The whole parsed v1 line. The manifest compares this object exactly, while
 * the line digest also protects field order, whitespace, and every byte.
 */
export type LegacyJudgmentIdentity = Readonly<Record<string, unknown>> & {
  readonly at: string;
  readonly reviewer: string;
  readonly query: string;
  readonly verdict: string;
  readonly reference?: string;
  readonly targetId?: string;
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
};

export interface LegacyJudgmentLine {
  readonly lineNumber: number;
  readonly lineSha256: string;
  readonly judgment: LegacyJudgmentIdentity;
}

export interface LegacyMigrationEntry {
  readonly eventId: string;
  readonly parentEventId: string | null;
  readonly sequence: number;
  readonly lineSha256: string;
  readonly judgment: LegacyJudgmentIdentity;
}

export interface LegacyCaseMigration {
  readonly caseId: string;
  readonly source: CaseSource;
  readonly entries: readonly LegacyMigrationEntry[];
}

export interface LegacyMigrationManifest {
  readonly schemaVersion: 1;
  readonly cases: readonly LegacyCaseMigration[];
}

export interface LegacyCaseLogPaths {
  readonly casesPath: string;
  readonly manifestPath: string;
  readonly judgmentsPath: string;
}

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function requireSha256(value: unknown, label: string): string {
  const digest = requireNonEmptyString(value, label);
  if (!SHA256_HEX_PATTERN.test(digest)) throw new CaseValidationError(`${label} must be a lowercase SHA-256 hex digest.`);
  return digest;
}

function parseLegacyJudgmentIdentity(input: unknown, label: string): LegacyJudgmentIdentity {
  if (!isPlainObject(input)) throw new CaseValidationError(`${label} must be an object.`);
  const identity: Record<string, unknown> = { ...input };
  identity.at = requireTimestamp(input.at, `${label}.at`);
  identity.reviewer = requireNonEmptyString(input.reviewer, `${label}.reviewer`);
  identity.query = requireNonEmptyString(input.query, `${label}.query`);
  identity.verdict = requireNonEmptyString(input.verdict, `${label}.verdict`);
  identity.engineVersion = requireNonEmptyString(input.engineVersion, `${label}.engineVersion`);
  identity.corpusFingerprint = requireNonEmptyString(input.corpusFingerprint, `${label}.corpusFingerprint`);
  identity.layerFingerprint = requireNonEmptyString(input.layerFingerprint, `${label}.layerFingerprint`);
  if (input.reference !== undefined) identity.reference = requireNonEmptyString(input.reference, `${label}.reference`);
  if (input.targetId !== undefined) identity.targetId = requireNonEmptyString(input.targetId, `${label}.targetId`);
  return identity as LegacyJudgmentIdentity;
}

function sameJsonIdentity(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => sameJsonIdentity(value, right[index]));
  }
  if (!isPlainObject(left) || !isPlainObject(right)) return false;
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length && leftKeys.every((key, index) => key === rightKeys[index] && sameJsonIdentity(left[key], right[key]));
}

/** Parses immutable v1 JSONL lines while retaining their per-line SHA-256. */
export function parseLegacyJudgmentLog(raw: string | Uint8Array): readonly LegacyJudgmentLine[] {
  const bytes = typeof raw === 'string' ? Buffer.from(raw, 'utf8') : Buffer.from(raw);
  if (bytes.length === 0) throw new CaseValidationError('judgments.jsonl is empty.');
  const lines: Buffer[] = [];
  let start = 0;
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] === 0x0a) {
      lines.push(bytes.subarray(start, index));
      start = index + 1;
    }
  }
  if (start < bytes.length) lines.push(bytes.subarray(start));

  return lines.map((line, index) => parseLegacyJudgmentLine(line, index + 1));
}

/**
 * Parses one immutable v1 line under its true file line number, so callers
 * that filter a mixed v1/v2 log can still report positions in the real file.
 */
export function parseLegacyJudgmentLine(line: string | Uint8Array, lineNumber: number): LegacyJudgmentLine {
  const bytes = typeof line === 'string' ? Buffer.from(line, 'utf8') : Buffer.from(line);
  if (bytes.length === 0) throw new CaseValidationError(`judgments.jsonl line ${lineNumber} is blank.`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(bytes.toString('utf8')) as unknown;
  } catch {
    throw new CaseValidationError(`judgments.jsonl line ${lineNumber} is not valid JSON.`);
  }
  return {
    lineNumber,
    lineSha256: sha256(bytes),
    judgment: parseLegacyJudgmentIdentity(parsed, `judgments.jsonl line ${lineNumber}`),
  };
}

/** Safe, read-only loader for the committed v1 judgment log. */
export async function readLegacyJudgmentLog(judgmentsPath: string): Promise<readonly LegacyJudgmentLine[]> {
  return parseLegacyJudgmentLog(await readFile(judgmentsPath));
}

/** Parses the closed migration manifest before it can influence derived state. */
export function validateLegacyMigrationManifest(input: unknown): LegacyMigrationManifest {
  if (!isPlainObject(input)) throw new CaseValidationError('migration manifest must be an object.');
  requireExactKeys(input, ['schemaVersion', 'cases'], 'migration manifest');
  if (input.schemaVersion !== 1) throw new CaseValidationError('migration manifest.schemaVersion must be 1.');
  if (!Array.isArray(input.cases)) throw new CaseValidationError('migration manifest.cases must be an array.');

  const caseIds = new Set<string>();
  const eventIds = new Set<string>();
  let entryCount = 0;
  const cases = input.cases.map((caseInput, caseIndex): LegacyCaseMigration => {
    if (!isPlainObject(caseInput)) throw new CaseValidationError(`migration manifest.cases[${caseIndex}] must be an object.`);
    requireExactKeys(caseInput, ['caseId', 'source', 'entries'], `migration manifest.cases[${caseIndex}]`);
    const caseId = requireUuid(caseInput.caseId, `migration manifest.cases[${caseIndex}].caseId`);
    if (caseIds.has(caseId)) throw new CaseValidationError(`migration manifest repeats caseId "${caseId}".`);
    caseIds.add(caseId);
    if (typeof caseInput.source !== 'string' || !(CASE_SOURCES as readonly string[]).includes(caseInput.source)) {
      throw new CaseValidationError('migration manifest has an unknown case source.');
    }
    const entriesInput = caseInput.entries;
    if (!Array.isArray(entriesInput) || entriesInput.length === 0) {
      throw new CaseValidationError(`Legacy case "${caseId}" has no entries.`);
    }
    const entries = entriesInput.map((entryInput, entryIndex): LegacyMigrationEntry => {
      const label = `migration manifest.cases[${caseIndex}].entries[${entryIndex}]`;
      if (!isPlainObject(entryInput)) throw new CaseValidationError(`${label} must be an object.`);
      requireExactKeys(entryInput, ['eventId', 'parentEventId', 'sequence', 'lineSha256', 'judgment'], label);
      const eventId = requireUuid(entryInput.eventId, `${label}.eventId`);
      if (eventIds.has(eventId)) throw new CaseValidationError(`migration manifest repeats eventId "${eventId}".`);
      eventIds.add(eventId);
      if (!Number.isSafeInteger(entryInput.sequence) || (entryInput.sequence as number) !== entryIndex + 1) {
        throw new CaseValidationError('migration manifest sequences must start at 1 and be contiguous.');
      }
      const parentEventId = entryInput.parentEventId;
      if ((entryIndex === 0 && parentEventId !== null) ||
        (entryIndex > 0 && parentEventId !== entriesInput[entryIndex - 1]?.eventId)) {
        throw new CaseValidationError('migration manifest parent ordering is not a single causal chain.');
      }
      entryCount += 1;
      return {
        eventId,
        parentEventId: parentEventId === null ? null : requireUuid(parentEventId, `${label}.parentEventId`),
        sequence: entryInput.sequence as number,
        lineSha256: requireSha256(entryInput.lineSha256, `${label}.lineSha256`),
        judgment: parseLegacyJudgmentIdentity(entryInput.judgment, `${label}.judgment`),
      };
    });
    return { caseId, source: caseInput.source as CaseSource, entries };
  });
  if (entryCount !== CHECKED_V1_RECORD_COUNT) {
    throw new CaseValidationError(`migration manifest must bind exactly ${CHECKED_V1_RECORD_COUNT} checked v1 records.`);
  }
  return { schemaVersion: 1, cases };
}

// No count precheck here: the manifest binds exactly CHECKED_V1_RECORD_COUNT
// entries, each entry must consume one line, and unconsumed lines throw with
// their line numbers — equally strict, but the error names the stray lines.
function validateLegacyJudgmentLines(input: readonly LegacyJudgmentLine[]): readonly LegacyJudgmentLine[] {
  const lineNumbers = new Set<number>();
  return input.map((line, index) => {
    if (!Number.isSafeInteger(line.lineNumber) || line.lineNumber < 1 || lineNumbers.has(line.lineNumber)) {
      throw new CaseValidationError(`legacy judgment ${index + 1} has an invalid or duplicate line number.`);
    }
    lineNumbers.add(line.lineNumber);
    return {
      lineNumber: line.lineNumber,
      lineSha256: requireSha256(line.lineSha256, `legacy judgment ${line.lineNumber}.lineSha256`),
      judgment: parseLegacyJudgmentIdentity(line.judgment, `legacy judgment ${line.lineNumber}`),
    };
  });
}

/**
 * Produces stable v2 events from the three immutable v1 records. Matching is
 * by both raw-line digest and full parsed identity, never by line number.
 */
export function deriveLegacyCaseEvents(
  manifestInput: LegacyMigrationManifest,
  judgmentsInput: readonly LegacyJudgmentLine[],
): readonly CaseEvent[] {
  const manifest = validateLegacyMigrationManifest(manifestInput);
  const remaining = [...validateLegacyJudgmentLines(judgmentsInput)];
  const events: CaseEvent[] = [];
  for (const legacyCase of manifest.cases) {
    for (const [index, entry] of legacyCase.entries.entries()) {
      const matchedIndex = remaining.findIndex((line) => line.lineSha256 === entry.lineSha256);
      if (matchedIndex < 0) {
        throw new CaseValidationError(`migration manifest entry "${entry.eventId}" does not match a legacy line SHA-256.`);
      }
      const judgmentLine = remaining[matchedIndex]!;
      if (!sameJsonIdentity(entry.judgment, judgmentLine.judgment)) {
        throw new CaseValidationError(`migration manifest entry "${entry.eventId}" does not match a legacy judgment's full identity.`);
      }
      remaining.splice(matchedIndex, 1);
      const judgment = judgmentLine.judgment;
      if (index === 0) {
        events.push({
          schemaVersion: 2,
          eventId: entry.eventId,
          caseId: legacyCase.caseId,
          at: judgment.at,
          reviewer: judgment.reviewer,
          sequence: entry.sequence,
          kind: 'case-created',
          query: judgment.query,
          source: legacyCase.source,
          artifact: {
            engineVersion: judgment.engineVersion,
            corpusFingerprint: judgment.corpusFingerprint,
            layerFingerprint: judgment.layerFingerprint,
          },
        });
      } else {
        events.push({
          schemaVersion: 2,
          eventId: entry.eventId,
          caseId: legacyCase.caseId,
          at: judgment.at,
          reviewer: judgment.reviewer,
          sequence: entry.sequence,
          parentEventId: entry.parentEventId!,
          kind: 'case-state-changed',
          state: index === 1 ? 'reviewing' : 'judged',
        });
      }
    }
  }
  if (remaining.length !== 0) {
    const strays = remaining.map((line) => line.lineNumber).sort((left, right) => left - right);
    throw new CaseValidationError(
      `judgments.jsonl line(s) ${strays.join(', ')} hold legacy v1 record(s) outside the closed migration manifest. ` +
      'The v1 log is closed: delete the stray line(s) from workbench/judgments.jsonl and re-enter each judgment ' +
      `through the v2 workbench — the ${CHECKED_V1_RECORD_COUNT} manifested lines stay untouched.`,
    );
  }
  return validateCaseEvents(events);
}

/** Serializes a validated event set in deterministic causal JSONL order. */
export function serializeCaseEventLog(input: readonly unknown[]): string {
  const events = validateCaseEvents(input);
  return events.length === 0 ? '' : `${events.map((event) => JSON.stringify(event)).join('\n')}\n`;
}

/** Safe, read-only loader for a case log before any state is derived. */
export async function readCaseEventLogFile(casesPath: string): Promise<readonly CaseEvent[]> {
  return parseCaseEventLog(await readFile(casesPath, 'utf8'));
}

/** Reads and validates a case log before returning causal events. */
export async function readValidatedCaseEventLog(casesPath: string): Promise<readonly CaseEvent[]> {
  return validateCaseEvents(await readCaseEventLogFile(casesPath));
}

/** Reads, validates, and folds a case log without exposing partial state. */
export async function readFoldedCaseEventLog(casesPath: string): Promise<readonly CaseSnapshot[]> {
  return foldCaseEvents(await readCaseEventLogFile(casesPath));
}

/**
 * Confirms that `cases.jsonl` STARTS with the byte-canonical migration
 * output for the committed manifest and immutable v1 judgment lines.
 *
 * Prefix, not whole-file equality: the closed migration wrote the log's
 * opening bytes once, and the live workbench (the second writer, §5.1)
 * appends v2 case events after them — a whole-file pin would brick every
 * derivation the moment the first live case lands (found in anger by the
 * D11 shakedown). The legacy prefix stays byte-pinned and identity-checked;
 * everything appended after it is validated as ordinary case events by
 * `validateCaseEvents` above, exactly like a log with no legacy history.
 */
export function validateCanonicalLegacyCaseLog(
  casesJsonl: string,
  manifest: LegacyMigrationManifest,
  judgments: readonly LegacyJudgmentLine[],
): readonly CaseEvent[] {
  const actual = validateCaseEvents(parseCaseEventLog(casesJsonl));
  const expected = deriveLegacyCaseEvents(manifest, judgments);
  if (
    !casesJsonl.startsWith(serializeCaseEventLog(expected))
    || !sameJsonIdentity(actual.slice(0, expected.length), expected)
  ) {
    throw new CaseValidationError('cases.jsonl is not the canonical deterministic legacy migration output.');
  }
  return actual;
}

/** Reads and validates the closed manifest, v1 log, and canonical derived log. */
export async function readCanonicalLegacyCaseEvents(paths: LegacyCaseLogPaths): Promise<readonly CaseEvent[]> {
  const [casesJsonl, manifestRaw, judgments] = await Promise.all([
    readFile(paths.casesPath, 'utf8'),
    readFile(paths.manifestPath, 'utf8'),
    readLegacyJudgmentLog(paths.judgmentsPath),
  ]);
  let manifestInput: unknown;
  try {
    manifestInput = JSON.parse(manifestRaw) as unknown;
  } catch {
    throw new CaseValidationError('migration manifest is not valid JSON.');
  }
  return validateCanonicalLegacyCaseLog(casesJsonl, validateLegacyMigrationManifest(manifestInput), judgments);
}

/** Reads, validates, and folds the canonical migrated case history. */
export async function readFoldedCanonicalLegacyCases(paths: LegacyCaseLogPaths): Promise<readonly CaseSnapshot[]> {
  return foldCaseEvents(await readCanonicalLegacyCaseEvents(paths));
}
