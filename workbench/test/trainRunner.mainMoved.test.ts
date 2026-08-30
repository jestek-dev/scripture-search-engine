/**
 * D17/FM-14 — a train stalled at `pr-open` does not rot silently (votes-to-
 * engine plan §06 FM-14 "the C3 case", §8.6 D17): every observation
 * revalidates the train's base against main; when main has moved past the
 * expected base commit — and the train's own content is NOT what moved it —
 * the train stops `main-moved` rather than pretending freshness or merging
 * stale (the frozen-queue behavior A1 depends on). The re-derived seal
 * against the new main carries the same decisions, re-attached by `cardId`.
 */
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import type { JudgmentRecordV2 } from '../src/judgments.js';
import { fixtureContentDigest, type MainGoldenHistoryEntry, type ReplayIdentity } from '../src/deriveUpdates.js';
import { createTrainOperations, type TrainOperations } from '../src/trainRunner.js';
import { createUpdatesOperations, type TrainGoldenHistoryWindow, type UpdatesOperations } from '../src/updatesOperations.js';

const temporary: string[] = [];

const CURRENT: ReplayIdentity = {
  engineVersion: '0.14.0-test',
  corpusFingerprint: 'corpus-current',
  layerFingerprint: 'layer-current',
};

function stableUuid(label: string): string {
  const hex = createHash('sha256').update(label).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

let clockCounter = 0;
function testNow(): Date {
  clockCounter += 1;
  return new Date(Date.parse('2026-08-12T10:00:00.000Z') + clockCounter * 60_000);
}

function guardRecord(): JudgmentRecordV2 {
  return {
    schemaVersion: 2,
    reviewer: 'jesse',
    observedWindow: 10,
    resultSetDigest: 'a'.repeat(64),
    displayedWindowDigest: 'b'.repeat(64),
    source: 'manual',
    caseId: stableUuid('case:hearing and doing'),
    observedRank: 1,
    engineVersion: CURRENT.engineVersion,
    corpusFingerprint: CURRENT.corpusFingerprint,
    layerFingerprint: CURRENT.layerFingerprint,
    judgmentId: stableUuid('fm14-g1'),
    query: 'hearing and doing',
    action: 'irrelevant',
    at: '2026-08-10T10:01:00.000Z',
    targetId: 'WEB:19046001',
    diagnosis: 'lexical-noise',
  } as JudgmentRecordV2;
}

function casesFor(records: readonly JudgmentRecordV2[]): string {
  const byCase = new Map(records.map((record) => [record.caseId, record]));
  return [...byCase.values()]
    .map((record) => JSON.stringify({
      schemaVersion: 2,
      eventId: stableUuid(`event:${record.caseId}`),
      caseId: record.caseId,
      at: '2026-08-10T09:00:00.000Z',
      reviewer: 'jesse',
      sequence: 1,
      kind: 'case-created',
      query: record.query,
      source: record.source,
      artifact: {
        engineVersion: record.engineVersion,
        corpusFingerprint: record.corpusFingerprint,
        layerFingerprint: record.layerFingerprint,
      },
    }))
    .map((line) => `${line}\n`)
    .join('');
}

async function makeRepo(records: readonly JudgmentRecordV2[]): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'train-main-moved-'));
  temporary.push(root);
  await mkdir(path.join(root, 'ontology', 'concepts'), { recursive: true });
  await mkdir(path.join(root, 'eval', 'golden'), { recursive: true });
  await mkdir(path.join(root, 'pipeline', 'fixtures'), { recursive: true });
  await mkdir(path.join(root, 'workbench'), { recursive: true });
  await writeFile(path.join(root, 'pipeline', 'fixtures', 'web-subset.json'), `${JSON.stringify({
    $schema: 'verse-array-subset/1',
    selection: [{ book: 'Psalms', chapters: [46], why: 'test' }],
    verses: [],
  }, null, 2)}\n`);
  await writeFile(path.join(root, 'workbench', 'judgments.jsonl'), records.map((record) => `${JSON.stringify(record)}\n`).join(''));
  await writeFile(path.join(root, 'workbench', 'cases.jsonl'), casesFor(records));
  return root;
}

// The epoch double for main (mirrors trainRunner.test.ts): readMain reports
// the current epoch as a 40-hex commit; advancing the epoch is "other work
// merged"; markTrainLive advances it AND records the train's own content.
function epochPathOf(root: string): string {
  return path.join(root, 'workbench', '.test-main-epoch');
}
function historyPathOf(root: string): string {
  return path.join(root, 'workbench', '.test-main-history.json');
}
function epochCommit(epoch: number): string {
  return epoch.toString(16).padStart(40, '0');
}
async function currentEpoch(root: string): Promise<number> {
  try {
    return JSON.parse(await readFile(epochPathOf(root), 'utf8')) as number;
  } catch {
    return 0;
  }
}
async function advanceMain(root: string): Promise<void> {
  await writeFile(epochPathOf(root), `${JSON.stringify((await currentEpoch(root)) + 1)}\n`);
}

interface RecordedVersion { readonly digest: string; readonly epoch: number }

async function readTestMainHistory(root: string, windows: readonly TrainGoldenHistoryWindow[]): Promise<MainGoldenHistoryEntry[]> {
  let recorded: Record<string, readonly RecordedVersion[]>;
  try {
    recorded = JSON.parse(await readFile(historyPathOf(root), 'utf8')) as Record<string, readonly RecordedVersion[]>;
  } catch {
    return [];
  }
  const entries: MainGoldenHistoryEntry[] = [];
  for (const window of windows) {
    if (window.baseCommit === null) continue;
    const baseEpoch = Number.parseInt(window.baseCommit, 16);
    if (Number.isNaN(baseEpoch)) continue;
    for (const goldenPath of window.goldenPaths) {
      const versions = recorded[goldenPath];
      if (versions === undefined) continue;
      entries.push({
        trainId: window.trainId,
        path: goldenPath,
        fixtureDigests: versions.filter((version) => version.epoch > baseEpoch).map((version) => version.digest),
      });
    }
  }
  return entries;
}

async function markTrainLive(root: string, trainId: string): Promise<void> {
  const registry = JSON.parse(await readFile(path.join(root, 'workbench', 'review-data', 'admission-evidence.json'), 'utf8')) as {
    admissions: { reviewId: string; proposal: { operations: { type: string; goldenFixtureId?: string; fixture?: unknown }[] } }[];
  };
  const entry = registry.admissions.find((candidate) => candidate.reviewId === trainId);
  if (entry === undefined) throw new Error(`No registry entry for ${trainId}.`);
  let history: Record<string, RecordedVersion[]>;
  try {
    history = JSON.parse(await readFile(historyPathOf(root), 'utf8')) as Record<string, RecordedVersion[]>;
  } catch {
    history = {};
  }
  const mergedAtEpoch = (await currentEpoch(root)) + 1;
  await writeFile(epochPathOf(root), `${JSON.stringify(mergedAtEpoch)}\n`);
  for (const operation of entry.proposal.operations) {
    if (operation.type !== 'golden-fixture-upsert') continue;
    const goldenPath = `eval/golden/${operation.goldenFixtureId!}.json`;
    history[goldenPath] = [...(history[goldenPath] ?? []), { digest: fixtureContentDigest(operation.fixture), epoch: mergedAtEpoch }];
  }
  await writeFile(historyPathOf(root), `${JSON.stringify(history, null, 2)}\n`);
}

async function openDraftPr(root: string, trainId: string): Promise<void> {
  const directory = path.join(root, 'workbench', '.state', 'publish-journals');
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, `${trainId}.json`), `${JSON.stringify({
    phase: 'draft-pr-opened',
    draftPrUrl: 'https://github.example/pull/1',
  }, null, 2)}\n`);
}

function operationsFor(root: string): { updates: UpdatesOperations; trains: TrainOperations } {
  const shared = {
    repoRoot: root,
    reviewer: 'jesse',
    now: testNow,
    readGoldenMainHistory: (repoRoot: string, windows: readonly TrainGoldenHistoryWindow[]) => readTestMainHistory(repoRoot, windows),
  };
  return {
    updates: createUpdatesOperations(shared),
    trains: createTrainOperations({ ...shared, readMain: async () => epochCommit(await currentEpoch(root)) }),
  };
}

async function approveAndSeal(updates: UpdatesOperations, trains: TrainOperations): Promise<{ trainId: string; cardIds: readonly string[] }> {
  const derivation = await updates.derive(CURRENT);
  for (const card of derivation.cards) {
    if (card.state.decision !== 'drafted') continue;
    await updates.decide(card.cardId, { decision: 'approve', cardRevision: card.cardRevision }, CURRENT);
  }
  const fresh = await updates.derive(CURRENT);
  const view = await trains.seal(CURRENT, fresh.derivationDigest);
  return { trainId: view.trainId, cardIds: view.cardIds };
}

afterEach(async () => {
  for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true });
});

describe('FM-14: a stalled pr-open train revalidates its base', () => {
  it('main moving past the expected base stops the train main-moved — never a stale merge wait', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    const { trainId, cardIds } = await approveAndSeal(updates, trains);
    await openDraftPr(root, trainId);

    // Main unchanged: the observation is an honest pr-open.
    const before = await trains.train(trainId, CURRENT);
    expect(before.state).toBe('pr-open');
    expect(before.draftPrUrl).toBe('https://github.example/pull/1');

    // Other work merges (main advances); this train's content did not land.
    await advanceMain(root);
    const after = await trains.train(trainId, CURRENT);
    expect(after.state).toBe('stopped');
    expect(after.stopped).toEqual({ reason: 'main-moved' });

    // The stop is a recorded event from the closed enum — observed state and
    // stored state agree on the next read, and nothing double-appends.
    const log = await readFile(path.join(root, 'workbench', 'updates.jsonl'), 'utf8');
    const stops = log.split('\n').filter((line) => line.includes('"train-stopped"'));
    expect(stops).toHaveLength(1);
    expect(JSON.parse(stops[0]!)).toMatchObject({ trainId, reason: 'main-moved' });
    const again = await trains.train(trainId, CURRENT);
    expect(again.state).toBe('stopped');
    expect((await readFile(path.join(root, 'workbench', 'updates.jsonl'), 'utf8'))
      .split('\n').filter((line) => line.includes('"train-stopped"'))).toHaveLength(1);

    // §5.6/V10 recovery: the seal re-derives from the log against the new
    // main — the released cards carry their logged approvals (re-attached by
    // cardId; the release writes no decide event) and re-seal cleanly.
    const released = await updates.derive(CURRENT);
    expect(released.cards.some((card) => card.state.decision === 'approved' && card.state.sealedInTrain === undefined)).toBe(true);
    const resealed = await trains.seal(CURRENT, released.derivationDigest);
    expect(resealed.trainId).not.toBe(trainId);
    expect(resealed.cardIds).toEqual(cardIds);
  });

  it('a train whose own merge moved main is live, never main-moved', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    const { trainId } = await approveAndSeal(updates, trains);
    await openDraftPr(root, trainId);

    // The train's own content lands on main (advancing it) — liveness wins.
    await markTrainLive(root, trainId);
    const view = await trains.train(trainId, CURRENT);
    expect(view.state).toBe('live');
    const log = await readFile(path.join(root, 'workbench', 'updates.jsonl'), 'utf8');
    expect(log).not.toContain('"train-stopped"');
  });
});
