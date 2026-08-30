/**
 * D5 — the votes-to-engine lifecycle store (plan §02.6, V5).
 *
 * `workbench/updates.jsonl` is an append-only JSONL log committed to git,
 * under exactly the judgment log's covenant: corrections are new lines;
 * editing or deleting lines is off-limits — history is part of the record.
 * It records ONLY human decisions and train membership — card
 * drafted/approved/declined/parked events and train opened/sealed/stopped
 * events. Every downstream state (built, measured, admitted, pr-open, live)
 * is derived from artifacts that already exist and is never written here;
 * V5's anti-17-state-machine rule.
 *
 * Reading is fail-closed: any line that does not strictly parse as a schema-v1
 * event — including a duplicated eventId, an out-of-order timestamp, or a
 * decide event naming a card the log has never seen drafted — refuses the
 * whole read, the same posture the judgment log takes. An edited or deleted
 * line surfaces as one of those violations rather than being silently folded.
 *
 * The fold rule (§02.6, exactly): events fold in log order; for a given
 * cardId the LATEST decide event written before the `train-sealed` event that
 * binds the card is the effective decision. Earlier decide events stay in the
 * log as history. After a `train-stopped` event releases a seal, later decide
 * events count again (latest overall wins until the next seal).
 */

import { appendFile, readFile } from 'node:fs/promises';

export const UPDATES_SCHEMA_VERSION = 1 as const;

export const CARD_EVENT_KINDS = ['card-drafted', 'card-approved', 'card-declined', 'card-parked'] as const;
export const TRAIN_EVENT_KINDS = ['train-opened', 'train-sealed', 'train-stopped'] as const;

export const TRAIN_FLAVORS = ['guard', 'data'] as const;
export type TrainFlavor = (typeof TRAIN_FLAVORS)[number];

/** The closed stop-reason enum (V5; recovery copy owned by plan §06.2). */
export const TRAIN_STOP_REASONS = [
  'conflicting-judgments',
  'stale-artifact-identity',
  'protected-expectation-regressed',
  'unreviewed-top10-movement',
  'outside-allowlist',
  'provenance-ambiguity',
  'engineering-required',
  'g8-baseline-moved-needs-independent-approval',
  'no-measurable-effect',
  'main-moved',
  'source-drift',
  'verify-failed',
  'required-check-failed',
  'github-unavailable',
] as const;
export type TrainStopReason = (typeof TRAIN_STOP_REASONS)[number];

export interface UpdatesEventBase {
  readonly schemaVersion: typeof UPDATES_SCHEMA_VERSION;
  readonly eventId: string;
  readonly at: string;
  readonly reviewer: string;
}

export interface CardDraftedEvent extends UpdatesEventBase {
  readonly kind: 'card-drafted';
  readonly cardId: string;
  /**
   * Contributing judgment UUIDs — or, for the single legacy re-confirmation
   * card, the migration manifest's 64-hex per-line hashes (plan §07.2, the
   * one sanctioned exception to the UUID shape).
   */
  readonly judgmentIds: readonly string[];
}

export interface CardApprovedEvent extends UpdatesEventBase {
  readonly kind: 'card-approved';
  readonly cardId: string;
  /** The human's answer to the card's at-most-one question, when asked. */
  readonly answers?: Readonly<Record<string, string>>;
}

export interface CardDeclinedEvent extends UpdatesEventBase {
  readonly kind: 'card-declined';
  readonly cardId: string;
  /** One line, required — a declined card always records why. */
  readonly reason: string;
}

export interface CardParkedEvent extends UpdatesEventBase {
  readonly kind: 'card-parked';
  readonly cardId: string;
}

export interface TrainOpenedEvent extends UpdatesEventBase {
  readonly kind: 'train-opened';
  readonly trainId: string;
  readonly flavor: TrainFlavor;
}

export interface TrainSealedEvent extends UpdatesEventBase {
  readonly kind: 'train-sealed';
  readonly trainId: string;
  readonly sealDigest: string;
  readonly cardIds: readonly string[];
  readonly judgmentIds: readonly string[];
  readonly replayIdentity: {
    readonly engineVersion: string;
    readonly corpusFingerprint: string;
    readonly layerFingerprint: string;
  };
}

export interface TrainStoppedEvent extends UpdatesEventBase {
  readonly kind: 'train-stopped';
  readonly trainId: string;
  readonly reason: TrainStopReason;
  /** sha256 of the verified report a report-bearing stop rests on. */
  readonly reportDigest?: string;
  /** Operation ids an outside-allowlist/engineering-required stop refused. */
  readonly refusedOperationIds?: readonly string[];
}

export type UpdatesEvent =
  | CardDraftedEvent
  | CardApprovedEvent
  | CardDeclinedEvent
  | CardParkedEvent
  | TrainOpenedEvent
  | TrainSealedEvent
  | TrainStoppedEvent;

export type CardDecision = 'approved' | 'declined' | 'parked';

export interface EffectiveCardDecision {
  readonly cardId: string;
  readonly decision: CardDecision;
  readonly decidedAt: string;
  readonly reviewer: string;
  readonly answers?: Readonly<Record<string, string>>;
  readonly reason?: string;
  /** Set when the decision was frozen by a live (unstopped) seal. */
  readonly sealedInTrain?: string;
}

export interface TrainSnapshot {
  readonly trainId: string;
  readonly flavor: TrainFlavor;
  readonly openedAt: string;
  /** 'open' | 'sealed' | 'stopped' — downstream states are observed, not stored. */
  readonly state: 'open' | 'sealed' | 'stopped';
  readonly sealed?: TrainSealedEvent;
  readonly stopped?: TrainStoppedEvent;
}

export interface UpdatesLogFold {
  readonly events: readonly UpdatesEvent[];
  /** Every cardId the log has seen drafted, with its drafted judgmentIds. */
  readonly drafted: ReadonlyMap<string, CardDraftedEvent>;
  /** Effective decision per cardId under the §02.6 fold rule. */
  readonly decisions: ReadonlyMap<string, EffectiveCardDecision>;
  readonly trains: readonly TrainSnapshot[];
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalText(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.trim() === value;
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

function requireExactKeys(
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

export type ParseUpdatesEventResult =
  | { readonly ok: true; readonly event: UpdatesEvent }
  | { readonly ok: false; readonly reason: string };

/** A contributing id: a v2 judgment UUID or a legacy 64-hex line hash. */
function isContributingId(value: unknown): value is string {
  return typeof value === 'string' && (UUID_PATTERN.test(value) || SHA256_PATTERN.test(value));
}

function idArray(value: unknown, label: string): string | undefined {
  if (!Array.isArray(value) || value.length === 0) return `${label} must be a non-empty array.`;
  if (value.some((entry) => !isContributingId(entry))) return `${label} entries must be judgment UUIDs or 64-hex line hashes.`;
  if (new Set(value).size !== value.length) return `${label} must not contain duplicates.`;
  return undefined;
}

/** Strictly parses one persisted updates.jsonl line. */
export function parseUpdatesEvent(value: unknown): ParseUpdatesEventResult {
  if (!isRecord(value)) return { ok: false, reason: 'An updates event must be a JSON object.' };
  if (value.schemaVersion !== UPDATES_SCHEMA_VERSION) {
    return { ok: false, reason: `An updates event schemaVersion must be ${UPDATES_SCHEMA_VERSION}.` };
  }
  const kind = value.kind;
  const allKinds: readonly string[] = [...CARD_EVENT_KINDS, ...TRAIN_EVENT_KINDS];
  if (typeof kind !== 'string' || !allKinds.includes(kind)) {
    return { ok: false, reason: 'An updates event needs a known kind.' };
  }
  const base = ['schemaVersion', 'eventId', 'at', 'reviewer', 'kind'] as const;
  const byKind: Record<string, { required: readonly string[]; optional: readonly string[] }> = {
    'card-drafted': { required: [...base, 'cardId', 'judgmentIds'], optional: [] },
    'card-approved': { required: [...base, 'cardId'], optional: ['answers'] },
    'card-declined': { required: [...base, 'cardId', 'reason'], optional: [] },
    'card-parked': { required: [...base, 'cardId'], optional: [] },
    'train-opened': { required: [...base, 'trainId', 'flavor'], optional: [] },
    'train-sealed': { required: [...base, 'trainId', 'sealDigest', 'cardIds', 'judgmentIds', 'replayIdentity'], optional: [] },
    'train-stopped': { required: [...base, 'trainId', 'reason'], optional: ['reportDigest', 'refusedOperationIds'] },
  };
  const keys = requireExactKeys(value, byKind[kind]!.required, byKind[kind]!.optional, `${kind} event`);
  if (keys !== undefined) return { ok: false, reason: keys };
  if (typeof value.eventId !== 'string' || !UUID_PATTERN.test(value.eventId)) {
    return { ok: false, reason: `${kind} event needs a UUID eventId.` };
  }
  if (!isCanonicalTimestamp(value.at)) return { ok: false, reason: `${kind} event.at must be a canonical UTC ISO timestamp.` };
  if (!canonicalText(value.reviewer)) return { ok: false, reason: `${kind} event needs a canonical reviewer.` };

  if (kind === 'card-drafted' || kind === 'card-approved' || kind === 'card-declined' || kind === 'card-parked') {
    if (!isSha256(value.cardId)) return { ok: false, reason: `${kind} event cardId must be a sha256 content address.` };
    if (kind === 'card-drafted') {
      const ids = idArray(value.judgmentIds, `${kind} event.judgmentIds`);
      if (ids !== undefined) return { ok: false, reason: ids };
    }
    if (kind === 'card-approved' && value.answers !== undefined) {
      if (!isRecord(value.answers)) return { ok: false, reason: 'card-approved event.answers must be an object.' };
      for (const [questionId, answer] of Object.entries(value.answers)) {
        if (!canonicalText(questionId) || !canonicalText(answer)) {
          return { ok: false, reason: 'card-approved event.answers must map question ids to non-empty answers.' };
        }
      }
    }
    if (kind === 'card-declined') {
      if (!canonicalText(value.reason) || value.reason.includes('\n')) {
        return { ok: false, reason: 'card-declined event needs a one-line reason.' };
      }
    }
    return { ok: true, event: value as unknown as UpdatesEvent };
  }

  if (!canonicalText(value.trainId) || !ID_PATTERN.test(value.trainId)) {
    return { ok: false, reason: `${kind} event trainId must be a kebab-case id.` };
  }
  if (kind === 'train-opened') {
    if (value.flavor !== 'guard' && value.flavor !== 'data') {
      return { ok: false, reason: 'train-opened event flavor must be "guard" or "data".' };
    }
  }
  if (kind === 'train-sealed') {
    if (!isSha256(value.sealDigest)) return { ok: false, reason: 'train-sealed event needs a sha256 sealDigest.' };
    if (!Array.isArray(value.cardIds) || value.cardIds.length === 0 || value.cardIds.some((entry) => !isSha256(entry))) {
      return { ok: false, reason: 'train-sealed event.cardIds must be a non-empty array of card content addresses.' };
    }
    if (new Set(value.cardIds).size !== value.cardIds.length) {
      return { ok: false, reason: 'train-sealed event.cardIds must not contain duplicates.' };
    }
    const ids = idArray(value.judgmentIds, 'train-sealed event.judgmentIds');
    if (ids !== undefined) return { ok: false, reason: ids };
    if (!isRecord(value.replayIdentity)) return { ok: false, reason: 'train-sealed event needs a replayIdentity.' };
    const identityKeys = requireExactKeys(
      value.replayIdentity,
      ['engineVersion', 'corpusFingerprint', 'layerFingerprint'],
      [],
      'train-sealed event.replayIdentity',
    );
    if (identityKeys !== undefined) return { ok: false, reason: identityKeys };
    for (const field of ['engineVersion', 'corpusFingerprint', 'layerFingerprint'] as const) {
      if (!canonicalText(value.replayIdentity[field])) {
        return { ok: false, reason: `train-sealed event.replayIdentity.${field} must be non-empty text.` };
      }
    }
  }
  if (kind === 'train-stopped') {
    if (typeof value.reason !== 'string' || !(TRAIN_STOP_REASONS as readonly string[]).includes(value.reason)) {
      return { ok: false, reason: 'train-stopped event needs a reason from the closed stop-reason enum.' };
    }
    if (value.reportDigest !== undefined && !isSha256(value.reportDigest)) {
      return { ok: false, reason: 'train-stopped event.reportDigest must be a sha256 digest when present.' };
    }
    if (value.refusedOperationIds !== undefined) {
      if (!Array.isArray(value.refusedOperationIds) || value.refusedOperationIds.length === 0 ||
        value.refusedOperationIds.some((entry) => !canonicalText(entry) || !ID_PATTERN.test(entry as string))) {
        return { ok: false, reason: 'train-stopped event.refusedOperationIds must be a non-empty array of operation ids when present.' };
      }
    }
  }
  return { ok: true, event: value as unknown as UpdatesEvent };
}

/**
 * Parses a whole updates.jsonl body fail-closed: strict per-line schema,
 * unique eventIds, non-decreasing timestamps, decide events only on drafted
 * cards, and train events in a legal order per train. Any violation refuses
 * the read — the same posture the judgment log takes toward a tampered line.
 */
export function parseUpdatesLog(raw: string): readonly UpdatesEvent[] {
  const events: UpdatesEvent[] = [];
  const eventIds = new Set<string>();
  const draftedCards = new Set<string>();
  const trainStates = new Map<string, 'open' | 'sealed' | 'stopped'>();
  let previousAt: number | null = null;
  const lines = raw.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!.trim();
    if (line === '') continue;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch {
      throw new Error(`updates.jsonl line ${index + 1} is not valid JSON.`);
    }
    const parsed = parseUpdatesEvent(value);
    if (!parsed.ok) throw new Error(`updates.jsonl line ${index + 1} is invalid: ${parsed.reason}`);
    const event = parsed.event;
    if (eventIds.has(event.eventId)) {
      throw new Error(`updates.jsonl line ${index + 1} repeats eventId "${event.eventId}".`);
    }
    eventIds.add(event.eventId);
    const at = Date.parse(event.at);
    if (previousAt !== null && at < previousAt) {
      throw new Error(`updates.jsonl line ${index + 1} is timestamped before the line above it — the log is append-only.`);
    }
    previousAt = at;
    if (event.kind === 'card-drafted') {
      draftedCards.add(event.cardId);
    } else if (event.kind === 'card-approved' || event.kind === 'card-declined' || event.kind === 'card-parked') {
      if (!draftedCards.has(event.cardId)) {
        throw new Error(`updates.jsonl line ${index + 1} decides card "${event.cardId}" that was never drafted in this log.`);
      }
    } else if (event.kind === 'train-opened') {
      if (trainStates.has(event.trainId)) {
        throw new Error(`updates.jsonl line ${index + 1} re-opens train "${event.trainId}".`);
      }
      trainStates.set(event.trainId, 'open');
    } else if (event.kind === 'train-sealed') {
      if (trainStates.get(event.trainId) !== 'open') {
        throw new Error(`updates.jsonl line ${index + 1} seals train "${event.trainId}" that is not open.`);
      }
      for (const cardId of event.cardIds) {
        if (!draftedCards.has(cardId)) {
          throw new Error(`updates.jsonl line ${index + 1} seals card "${cardId}" that was never drafted in this log.`);
        }
      }
      trainStates.set(event.trainId, 'sealed');
    } else {
      const state = trainStates.get(event.trainId);
      if (state === undefined || state === 'stopped') {
        throw new Error(`updates.jsonl line ${index + 1} stops train "${event.trainId}" that is not running.`);
      }
      trainStates.set(event.trainId, 'stopped');
    }
    events.push(event);
  }
  return events;
}

/** Folds a validated event list into effective decisions and train snapshots. */
export function foldUpdatesEvents(events: readonly UpdatesEvent[]): UpdatesLogFold {
  const drafted = new Map<string, CardDraftedEvent>();
  interface DecideRecord { readonly event: CardApprovedEvent | CardDeclinedEvent | CardParkedEvent; readonly index: number }
  const decidesByCard = new Map<string, DecideRecord[]>();
  const trains = new Map<string, { flavor: TrainFlavor; openedAt: string; sealed?: TrainSealedEvent; stopped?: TrainStoppedEvent; sealIndex?: number }>();

  for (const [index, event] of events.entries()) {
    if (event.kind === 'card-drafted') {
      if (!drafted.has(event.cardId)) drafted.set(event.cardId, event);
    } else if (event.kind === 'card-approved' || event.kind === 'card-declined' || event.kind === 'card-parked') {
      const list = decidesByCard.get(event.cardId) ?? [];
      list.push({ event, index });
      decidesByCard.set(event.cardId, list);
    } else if (event.kind === 'train-opened') {
      trains.set(event.trainId, { flavor: event.flavor, openedAt: event.at });
    } else if (event.kind === 'train-sealed') {
      const train = trains.get(event.trainId)!;
      train.sealed = event;
      train.sealIndex = index;
    } else {
      trains.get(event.trainId)!.stopped = event;
    }
  }

  // A card is frozen by the latest LIVE (sealed, not stopped) seal binding it.
  const liveSealByCard = new Map<string, { trainId: string; sealIndex: number }>();
  for (const [trainId, train] of trains) {
    if (train.sealed === undefined || train.stopped !== undefined) continue;
    for (const cardId of train.sealed.cardIds) {
      const existing = liveSealByCard.get(cardId);
      if (existing === undefined || train.sealIndex! > existing.sealIndex) {
        liveSealByCard.set(cardId, { trainId, sealIndex: train.sealIndex! });
      }
    }
  }

  const decisions = new Map<string, EffectiveCardDecision>();
  for (const [cardId, decides] of decidesByCard) {
    const seal = liveSealByCard.get(cardId);
    const eligible = seal === undefined ? decides : decides.filter((entry) => entry.index < seal.sealIndex);
    const latest = eligible.at(-1);
    if (latest === undefined) continue;
    const event = latest.event;
    decisions.set(cardId, {
      cardId,
      decision: event.kind === 'card-approved' ? 'approved' : event.kind === 'card-declined' ? 'declined' : 'parked',
      decidedAt: event.at,
      reviewer: event.reviewer,
      ...(event.kind === 'card-approved' && event.answers !== undefined ? { answers: event.answers } : {}),
      ...(event.kind === 'card-declined' ? { reason: event.reason } : {}),
      ...(seal === undefined ? {} : { sealedInTrain: seal.trainId }),
    });
  }

  const trainSnapshots: TrainSnapshot[] = [...trains.entries()].map(([trainId, train]) => ({
    trainId,
    flavor: train.flavor,
    openedAt: train.openedAt,
    state: train.stopped !== undefined ? 'stopped' as const : train.sealed !== undefined ? 'sealed' as const : 'open' as const,
    ...(train.sealed === undefined ? {} : { sealed: train.sealed }),
    ...(train.stopped === undefined ? {} : { stopped: train.stopped }),
  }));

  return { events, drafted, decisions, trains: trainSnapshots };
}

/** Parses and folds a raw updates.jsonl body in one fail-closed step. */
export function foldUpdatesLog(raw: string): UpdatesLogFold {
  return foldUpdatesEvents(parseUpdatesLog(raw));
}

export interface UpdatesStoreOptions {
  readonly logPath: string;
}

export interface UpdatesStore {
  /** Reads and validates the whole log; a missing file is an empty log. */
  read(): Promise<UpdatesLogFold>;
  /**
   * Validates the events against the CURRENT log content plus the batch so
   * far, then appends them — one JSON line each, never a rewrite. The batch
   * is appended atomically in order (a decide may ride with the drafted
   * event that legalizes it).
   */
  append(events: readonly UpdatesEvent[]): Promise<UpdatesLogFold>;
}

/** Serializes appends so two concurrent decides cannot interleave torn lines. */
export function createUpdatesStore(options: UpdatesStoreOptions): UpdatesStore {
  let tail: Promise<void> = Promise.resolve();

  async function readRaw(): Promise<string> {
    try {
      return await readFile(options.logPath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return '';
      throw error;
    }
  }

  async function appendInOrder(events: readonly UpdatesEvent[]): Promise<UpdatesLogFold> {
    const raw = await readRaw();
    const lines = events.map((event) => `${JSON.stringify(event)}\n`).join('');
    // Validate the combined log BEFORE writing, so an invalid append is
    // refused instead of poisoning the file for every later read.
    const fold = foldUpdatesLog(raw + lines);
    await appendFile(options.logPath, lines, 'utf8');
    return fold;
  }

  return {
    async read(): Promise<UpdatesLogFold> {
      return foldUpdatesLog(await readRaw());
    },
    append(events: readonly UpdatesEvent[]): Promise<UpdatesLogFold> {
      const run = tail.then(() => appendInOrder(events));
      tail = run.then(() => undefined, () => undefined);
      return run;
    },
  };
}
