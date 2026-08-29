/**
 * D5 — the append-only updates.jsonl store (plan §02.6, V5).
 *
 * Replaying any prefix of the event log yields a consistent state;
 * corrections are new lines; an edit or delete of an existing line is
 * detected and refused on read — the judgment log's fail-closed posture.
 */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createUpdatesStore,
  foldUpdatesEvents,
  foldUpdatesLog,
  parseUpdatesLog,
  type CardApprovedEvent,
  type UpdatesEvent,
} from '../src/updatesStore.js';

function stableUuid(label: string): string {
  const hex = createHash('sha256').update(label).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function sha(label: string): string {
  return createHash('sha256').update(label).digest('hex');
}

const T0 = Date.parse('2026-08-20T10:00:00.000Z');

function at(minutes: number): string {
  return new Date(T0 + minutes * 60_000).toISOString();
}

function event(partial: Record<string, unknown>, label: string): UpdatesEvent {
  return {
    schemaVersion: 1,
    eventId: stableUuid(label),
    reviewer: 'jesse',
    ...partial,
  } as unknown as UpdatesEvent;
}

const CARD_A = sha('card-a');
const CARD_B = sha('card-b');

/** A representative valid history: drafted → decided → re-decided → sealed → stopped → re-decided. */
function history(): UpdatesEvent[] {
  return [
    event({ at: at(0), kind: 'card-drafted', cardId: CARD_A, judgmentIds: [stableUuid('j1')] }, 'e1'),
    event({ at: at(1), kind: 'card-drafted', cardId: CARD_B, judgmentIds: [sha('legacy-line-1'), sha('legacy-line-2')] }, 'e2'),
    event({ at: at(2), kind: 'card-declined', cardId: CARD_A, reason: 'not this cycle' }, 'e3'),
    event({ at: at(3), kind: 'card-approved', cardId: CARD_A, answers: { theme: 'gods-incomparability' } }, 'e4'),
    event({ at: at(4), kind: 'card-parked', cardId: CARD_B }, 'e5'),
    event({ at: at(5), kind: 'train-opened', trainId: 'train-2026-08-20-a', flavor: 'guard' }, 'e6'),
    event({
      at: at(6),
      kind: 'train-sealed',
      trainId: 'train-2026-08-20-a',
      sealDigest: sha('seal-1'),
      cardIds: [CARD_A],
      judgmentIds: [stableUuid('j1')],
      replayIdentity: { engineVersion: '0.14.0', corpusFingerprint: 'c', layerFingerprint: 'l' },
    }, 'e7'),
    event({ at: at(7), kind: 'card-declined', cardId: CARD_A, reason: 'changed my mind post-seal' }, 'e8'),
    event({ at: at(8), kind: 'train-stopped', trainId: 'train-2026-08-20-a', reason: 'no-measurable-effect', reportDigest: sha('report-1') }, 'e9'),
    event({ at: at(9), kind: 'card-approved', cardId: CARD_A }, 'e10'),
  ];
}

function serialize(events: readonly UpdatesEvent[]): string {
  return events.map((entry) => `${JSON.stringify(entry)}\n`).join('');
}

describe('updates.jsonl parsing and fold', () => {
  it('replays every prefix of a valid log to a consistent state (property)', () => {
    const events = history();
    for (let length = 0; length <= events.length; length += 1) {
      const prefix = events.slice(0, length);
      const raw = serialize(prefix);
      // Every prefix of a valid append-only log is itself a valid log…
      const parsed = parseUpdatesLog(raw);
      expect(parsed).toHaveLength(length);
      // …and the parse+fold path agrees exactly with folding the event list.
      const foldedFromText = foldUpdatesLog(raw);
      const foldedFromEvents = foldUpdatesEvents(prefix);
      expect(JSON.stringify([...foldedFromText.decisions.entries()]))
        .toBe(JSON.stringify([...foldedFromEvents.decisions.entries()]));
      expect(JSON.stringify(foldedFromText.trains)).toBe(JSON.stringify(foldedFromEvents.trains));
    }
  });

  it('folds latest-decide-wins pre-seal, freezes at a live seal, and releases on stop', () => {
    const events = history();
    // Before the seal: the 10:03 approve overrides the 10:02 decline.
    const preSeal = foldUpdatesEvents(events.slice(0, 6));
    expect(preSeal.decisions.get(CARD_A)).toMatchObject({ decision: 'approved', answers: { theme: 'gods-incomparability' } });
    expect(preSeal.decisions.get(CARD_B)).toMatchObject({ decision: 'parked' });
    // While the seal is live: the post-seal decline does NOT change the
    // effective decision — the seal froze the latest pre-seal decide.
    const sealed = foldUpdatesEvents(events.slice(0, 8));
    expect(sealed.decisions.get(CARD_A)).toMatchObject({ decision: 'approved', sealedInTrain: 'train-2026-08-20-a' });
    // After the stop releases the seal: latest decide overall wins again.
    const released = foldUpdatesEvents(events);
    expect(released.decisions.get(CARD_A)!.decision).toBe('approved');
    expect(released.decisions.get(CARD_A)!.decidedAt).toBe(at(9));
    expect(released.decisions.get(CARD_A)!.sealedInTrain).toBeUndefined();
    expect(released.trains).toEqual([
      expect.objectContaining({ trainId: 'train-2026-08-20-a', flavor: 'guard', state: 'stopped' }),
    ]);
    // Earlier decides stay in the log as history — nothing was deleted.
    expect(released.events.filter((entry) => entry.kind === 'card-declined')).toHaveLength(2);
  });

  it('accepts the legacy card exception: 64-hex line hashes in judgmentIds', () => {
    const fold = foldUpdatesEvents(history());
    expect(fold.drafted.get(CARD_B)!.judgmentIds).toEqual([sha('legacy-line-1'), sha('legacy-line-2')]);
  });

  it('refuses a decide on a card the log never saw drafted', () => {
    const stray = event({ at: at(0), kind: 'card-approved', cardId: CARD_A }, 'stray');
    expect(() => parseUpdatesLog(serialize([stray]))).toThrow(/never drafted/);
  });

  it('detects an edited line (invalid field) and refuses the whole read', () => {
    const events = history();
    const raw = serialize(events).replace('"not this cycle"', '""');
    expect(() => parseUpdatesLog(raw)).toThrow(/one-line reason|invalid/);
  });

  it('detects a deleted line through the references it strands', () => {
    const events = history();
    // Deleting the card-drafted line strands every decide on that card.
    const withoutDraft = [events[1]!, ...events.slice(2)];
    expect(() => parseUpdatesLog(serialize(withoutDraft))).toThrow(/never drafted/);
  });

  it('detects a reordered (edited) history through the timestamp ordering rule', () => {
    const events = history();
    const swapped = [...events];
    [swapped[2], swapped[3]] = [swapped[3]!, swapped[2]!];
    expect(() => parseUpdatesLog(serialize(swapped))).toThrow(/append-only/);
  });

  it('refuses a duplicated eventId', () => {
    const events = history();
    expect(() => parseUpdatesLog(serialize([...events, events.at(-1)!]))).toThrow(/repeats eventId/);
  });

  it('refuses unknown kinds, unknown fields, and out-of-enum stop reasons', () => {
    expect(() => parseUpdatesLog(`${JSON.stringify({ schemaVersion: 1, eventId: stableUuid('x'), at: at(0), reviewer: 'jesse', kind: 'card-shredded', cardId: CARD_A })}\n`)).toThrow(/known kind/);
    expect(() => parseUpdatesLog(`${JSON.stringify({ ...history()[0], extra: true })}\n`)).toThrow(/unknown field/);
    const openThenStop = [
      event({ at: at(0), kind: 'train-opened', trainId: 'train-x', flavor: 'data' }, 's1'),
      event({ at: at(1), kind: 'train-stopped', trainId: 'train-x', reason: 'because-reasons' }, 's2'),
    ];
    expect(() => parseUpdatesLog(serialize(openThenStop))).toThrow(/closed stop-reason enum/);
  });

  it('refuses sealing an unopened train and stopping a stopped one', () => {
    const sealUnopened = [
      event({ at: at(0), kind: 'card-drafted', cardId: CARD_A, judgmentIds: [stableUuid('j1')] }, 'u1'),
      event({
        at: at(1), kind: 'train-sealed', trainId: 'train-ghost', sealDigest: sha('s'), cardIds: [CARD_A],
        judgmentIds: [stableUuid('j1')], replayIdentity: { engineVersion: 'e', corpusFingerprint: 'c', layerFingerprint: 'l' },
      }, 'u2'),
    ];
    expect(() => parseUpdatesLog(serialize(sealUnopened))).toThrow(/not open/);
    const doubleStop = [
      event({ at: at(0), kind: 'train-opened', trainId: 'train-y', flavor: 'guard' }, 'd1'),
      event({ at: at(1), kind: 'train-stopped', trainId: 'train-y', reason: 'verify-failed' }, 'd2'),
      event({ at: at(2), kind: 'train-stopped', trainId: 'train-y', reason: 'verify-failed' }, 'd3'),
    ];
    expect(() => parseUpdatesLog(serialize(doubleStop))).toThrow(/not running/);
  });
});

describe('updates store appends', () => {
  let dir: string;
  let logPath: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'updates-store-'));
    logPath = path.join(dir, 'updates.jsonl');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('appends validated events one line each and reads them back', async () => {
    const store = createUpdatesStore({ logPath });
    const events = history();
    await store.append(events.slice(0, 2));
    await store.append(events.slice(2, 5));
    const fold = await store.read();
    expect(fold.events).toHaveLength(5);
    expect(fold.decisions.get(CARD_A)!.decision).toBe('approved');
    const raw = await readFile(logPath, 'utf8');
    expect(raw.trimEnd().split('\n')).toHaveLength(5);
  });

  it('refuses an invalid append and leaves the file untouched', async () => {
    const store = createUpdatesStore({ logPath });
    const events = history();
    await store.append(events.slice(0, 2));
    const before = await readFile(logPath, 'utf8');
    const stray: CardApprovedEvent = {
      schemaVersion: 1,
      eventId: stableUuid('bad'),
      at: at(3),
      reviewer: 'jesse',
      kind: 'card-approved',
      cardId: sha('card-never-drafted'),
    };
    await expect(store.append([stray])).rejects.toThrow(/never drafted/);
    expect(await readFile(logPath, 'utf8')).toBe(before);
  });

  it('never rewrites existing lines: appends only grow the file byte-forward', async () => {
    const store = createUpdatesStore({ logPath });
    const events = history();
    await store.append(events.slice(0, 3));
    const before = await readFile(logPath, 'utf8');
    await store.append(events.slice(3, 6));
    const after = await readFile(logPath, 'utf8');
    expect(after.startsWith(before)).toBe(true);
    expect(after.length).toBeGreaterThan(before.length);
  });

  it('refuses reading a hand-edited log', async () => {
    const store = createUpdatesStore({ logPath });
    await store.append(history().slice(0, 3));
    const raw = await readFile(logPath, 'utf8');
    await writeFile(logPath, raw.replace('"not this cycle"', '"edited\\nreason"'));
    await expect(store.read()).rejects.toThrow(/one-line reason|invalid/);
  });
});
