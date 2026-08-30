/**
 * D8/D10 — the train runner over real files (votes-to-engine plan §8.4).
 *
 * Coverage per the D8/D10 AC blocks: seal appends `train-opened` +
 * `train-sealed` with the V8 seal digest; sealing twice returns 409
 * (single-flight); a vote cast after seal joins the next train and the sealed
 * digest is immutable; the D10 evidence entry round-trips `previewAdmission`
 * without hand edits; the fixture-lane Update Report ships §4.6's verbatim
 * lead with a stable digest and no hex jargon; a data-flavored approval set
 * refuses (Phase 2 scope); stops come only from the closed enum, carry their
 * pins, and feed §03.8's stop conversion through the prior-train artifact
 * join; the V4 seal-time validator refuses an unmeasured layer-affecting
 * operation (synthetic — deriver-built guard manifests cannot produce one).
 */
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { previewAdmission } from '../src/admission.js';
import type { AdmissionEvidenceEntry } from '../src/admissionPublishOperations.js';
import {
  fixtureContentDigest,
  unmeasuredLayerAffectingOperations,
  THEME_ANSWER_NONE,
  type MainGoldenHistoryEntry,
  type ReplayIdentity,
} from '../src/deriveUpdates.js';
import type { JudgmentRecordV2 } from '../src/judgments.js';
import { parseProposalManifest, proposalManifestDigest } from '../src/proposals.js';
import {
  buildGuardUpdateReport,
  createTrainOperations,
  GUARD_REPORT_LEAD,
  stopReasonForFailure,
  TrainOperationsError,
  type TrainOperations,
} from '../src/trainRunner.js';
import { createUpdatesOperations, type UpdatesOperations } from '../src/updatesOperations.js';

const temporary: string[] = [];
const BASE_COMMIT = 'a'.repeat(40);

const CURRENT: ReplayIdentity = {
  engineVersion: '0.14.0-test',
  corpusFingerprint: 'corpus-current',
  layerFingerprint: 'layer-current',
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableUuid(label: string): string {
  const hex = createHash('sha256').update(label).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

const T0 = Date.parse('2026-08-10T10:00:00.000Z');
let atCounter = 0;
function nextAt(): string {
  atCounter += 1;
  return new Date(T0 + atCounter * 60_000).toISOString();
}

let clockCounter = 0;
function testNow(): Date {
  clockCounter += 1;
  return new Date(Date.parse('2026-08-12T10:00:00.000Z') + clockCounter * 60_000);
}

interface V2Options extends Partial<JudgmentRecordV2> {
  readonly judgmentId: string;
  readonly query: string;
  readonly action: JudgmentRecordV2['action'];
  readonly at: string;
}

function v2(options: V2Options): JudgmentRecordV2 {
  return {
    schemaVersion: 2,
    reviewer: 'jesse',
    observedWindow: 10,
    resultSetDigest: 'a'.repeat(64),
    displayedWindowDigest: 'b'.repeat(64),
    source: 'manual',
    caseId: stableUuid(`case:${options.query}`),
    observedRank: options.action === 'missing' ? null : 1,
    engineVersion: CURRENT.engineVersion,
    corpusFingerprint: CURRENT.corpusFingerprint,
    layerFingerprint: CURRENT.layerFingerprint,
    ...options,
    judgmentId: stableUuid(options.judgmentId),
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

const ONTOLOGY_OBEDIENCE = [
  'id: obedience-to-the-word',
  'label: Obedience to the word',
  'lexicon:',
  '  - hearing and doing',
  '  - doers of the word',
  'anchors:',
  '  - ref: James 1:22',
  '    sources: [editorial]',
  '',
].join('\n');

const SUBSET = `${JSON.stringify({
  $schema: 'verse-array-subset/1',
  selection: [
    { book: 'James', chapters: [1, 2], why: 'test' },
    { book: 'Psalms', chapters: [46], why: 'test' },
  ],
  verses: [],
}, null, 2)}\n`;

async function makeRepo(records: readonly JudgmentRecordV2[]): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'train-runner-'));
  temporary.push(root);
  await mkdir(path.join(root, 'ontology', 'concepts'), { recursive: true });
  await mkdir(path.join(root, 'eval', 'golden'), { recursive: true });
  await mkdir(path.join(root, 'pipeline', 'fixtures'), { recursive: true });
  await mkdir(path.join(root, 'workbench'), { recursive: true });
  await writeFile(path.join(root, 'ontology', 'concepts', 'obedience-to-the-word.yaml'), ONTOLOGY_OBEDIENCE);
  await writeFile(path.join(root, 'pipeline', 'fixtures', 'web-subset.json'), SUBSET);
  await writeFile(path.join(root, 'workbench', 'judgments.jsonl'), records.map((record) => `${JSON.stringify(record)}\n`).join(''));
  await writeFile(path.join(root, 'workbench', 'cases.jsonl'), casesFor(records));
  return root;
}

/**
 * The test double for main's golden history (§03.6's live anchor): a JSON
 * file `markTrainLive` appends each merged version's content digest to —
 * append-only, like the real git history it stands in for. Absent file =
 * nothing ever merged.
 */
function historyPathOf(root: string): string {
  return path.join(root, 'workbench', '.test-main-history.json');
}

async function readTestMainHistory(root: string, goldenPaths: readonly string[]): Promise<MainGoldenHistoryEntry[]> {
  let recorded: Record<string, readonly string[]>;
  try {
    recorded = JSON.parse(await readFile(historyPathOf(root), 'utf8')) as Record<string, readonly string[]>;
  } catch {
    return [];
  }
  return goldenPaths
    .filter((goldenPath) => recorded[goldenPath] !== undefined)
    .map((goldenPath) => ({ path: goldenPath, fixtureDigests: recorded[goldenPath]! }));
}

function operationsFor(root: string): { updates: UpdatesOperations; trains: TrainOperations } {
  const shared = {
    repoRoot: root,
    reviewer: 'jesse',
    now: testNow,
    readGoldenMainHistory: (repoRoot: string, goldenPaths: readonly string[]) => readTestMainHistory(repoRoot, goldenPaths),
  };
  return {
    updates: createUpdatesOperations(shared),
    trains: createTrainOperations({ ...shared, readMain: async () => BASE_COMMIT }),
  };
}

/** Seals against the freshly derived digest — the §03.5 step-3 pin. */
async function sealNow(updates: UpdatesOperations, trains: TrainOperations) {
  const derivation = await updates.derive(CURRENT);
  return trains.seal(CURRENT, derivation.derivationDigest);
}

async function approveEveryCard(updates: UpdatesOperations, answers?: Record<string, string>): Promise<string[]> {
  const derivation = await updates.derive(CURRENT);
  const approved: string[] = [];
  for (const card of derivation.cards) {
    if (card.state.decision !== 'drafted') continue;
    await updates.decide(card.cardId, {
      decision: 'approve',
      cardRevision: card.cardRevision,
      ...(card.question === undefined ? {} : { answers: answers ?? { theme: THEME_ANSWER_NONE } }),
    }, CURRENT);
    approved.push(card.cardId);
  }
  return approved;
}

function guardRecord(): JudgmentRecordV2 {
  return v2({
    judgmentId: 'g1', query: 'hearing and doing', action: 'irrelevant', at: nextAt(),
    targetId: 'WEB:19046001', diagnosis: 'lexical-noise',
  });
}

/**
 * Observes the merge for a sealed guard train: appends every fixture its
 * registry manifest upserts to the append-only main-history double (the
 * squash merge landing the content on main), and writes the working-tree
 * golden files exactly as a post-merge checkout would hold them — the runner
 * then derives `live` (V5, never stored). Liveness reads ONLY the history:
 * later rewrites of the working-tree file never regress it.
 */
async function markTrainLive(root: string, trainId: string): Promise<void> {
  const registry = JSON.parse(await readFile(path.join(root, 'workbench', 'review-data', 'admission-evidence.json'), 'utf8')) as {
    admissions: { reviewId: string; proposal: { operations: { type: string; goldenFixtureId?: string; fixture?: unknown }[] } }[];
  };
  const entry = registry.admissions.find((candidate) => candidate.reviewId === trainId);
  if (entry === undefined) throw new Error(`No registry entry for ${trainId}.`);
  let history: Record<string, string[]>;
  try {
    history = JSON.parse(await readFile(historyPathOf(root), 'utf8')) as Record<string, string[]>;
  } catch {
    history = {};
  }
  for (const operation of entry.proposal.operations) {
    if (operation.type !== 'golden-fixture-upsert') continue;
    const goldenPath = `eval/golden/${operation.goldenFixtureId!}.json`;
    history[goldenPath] = [...(history[goldenPath] ?? []), fixtureContentDigest(operation.fixture)];
    await writeFile(
      path.join(root, 'eval', 'golden', `${operation.goldenFixtureId!}.json`),
      `${JSON.stringify(operation.fixture, null, 2)}\n`,
    );
  }
  await writeFile(historyPathOf(root), `${JSON.stringify(history, null, 2)}\n`);
}

afterEach(async () => {
  for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true });
});

describe('train seal (D8) and the evidence writer (D10)', () => {
  it('seals approved guard cards into train-0001: ready state, verbatim report lead, D10 entry that round-trips previewAdmission', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    const approved = await approveEveryCard(updates);
    expect(approved).toHaveLength(1);

    const view = await sealNow(updates, trains);
    expect(view.trainId).toBe('train-0001');
    expect(view.flavor).toBe('guard');
    // Guard trains never enter built/measured: the assembled report IS ready.
    expect(view.state).toBe('ready');
    expect(view.sealDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(view.cardIds).toEqual(approved);
    expect(view.report).not.toBeNull();
    expect(view.report!.lead).toBe(GUARD_REPORT_LEAD);
    expect(view.report!.lines.some((line) => line.includes('Psalms 46:1') && line.includes('must not rank'))).toBe(true);
    // D28: nothing hex-shaped and no digest jargon in the rendered report text.
    const rendered = [view.report!.lead, ...view.report!.lines].join('\n');
    expect(rendered).not.toMatch(/[0-9a-f]{8}-/);
    expect(rendered).not.toMatch(/sha256/i);

    // D10: the registry entry exists, is train-scoped, and carries the
    // fixture-lane evidence shape (candidate/comparison/binding/gauntlet null
    // together; the base identity is the identity the rebuild must reproduce).
    const registry = JSON.parse(await readFile(path.join(root, 'workbench', 'review-data', 'admission-evidence.json'), 'utf8')) as {
      admissions: AdmissionEvidenceEntry[];
    };
    expect(registry.admissions).toHaveLength(1);
    const entry = registry.admissions[0]!;
    expect(entry.reviewId).toBe('train-0001');
    expect(entry.candidate).toBeNull();
    expect(entry.comparison).toBeNull();
    expect(entry.comparisonBinding).toBeNull();
    expect(entry.gauntlet).toBeNull();
    expect(entry.baseIdentity).toEqual(CURRENT);
    expect(entry.reviewedComparisonQueries).toEqual([]);
    expect(entry.provenance).toContain('train:train-0001');

    // The entry round-trips previewAdmission without hand edits (D10 AC).
    const preview = await previewAdmission({
      repoRoot: root,
      admittedBaseCommit: entry.admittedBaseCommit,
      expectedMainCommit: entry.expectedMainCommit,
      proposal: entry.proposal,
      candidate: entry.candidate,
      comparison: entry.comparison,
      comparisonBinding: entry.comparisonBinding,
      gauntlet: entry.gauntlet,
      baseIdentity: entry.baseIdentity,
      reviewedComparisonQueries: entry.reviewedComparisonQueries,
    });
    expect(preview.candidate).toBeNull();
    expect(preview.fixtureLane).toEqual({ operationTypes: ['golden-fixture-upsert'] });
    expect(preview.effectExemption?.lane).toBe('fixture-lane');
    expect(preview.diffs.map((diff) => diff.path)).toEqual(['eval/golden/hearing-and-doing.json']);
  });

  it('refuses a second seal while a train is non-terminal, and the sealed digest is immutable under later votes', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);
    const first = await sealNow(updates, trains);

    await expect(sealNow(updates, trains)).rejects.toMatchObject({ code: 'train_running', status: 409 });

    // A vote cast after seal joins the NEXT train: the sealed digest and card
    // set never move (V8 — the train cannot silently change under him).
    const log = path.join(root, 'workbench', 'judgments.jsonl');
    const late = v2({
      judgmentId: 'g2', query: 'doers of the word', action: 'irrelevant', at: nextAt(),
      targetId: 'WEB:19046001', diagnosis: 'lexical-noise',
    });
    await writeFile(log, `${await readFile(log, 'utf8')}${JSON.stringify(late)}\n`);
    await writeFile(path.join(root, 'workbench', 'cases.jsonl'), casesFor([guardRecord(), late]));
    const lateCards = await approveEveryCard(updates);
    expect(lateCards).toHaveLength(1);

    const after = await trains.train('train-0001', CURRENT);
    expect(after.sealDigest).toBe(first.sealDigest);
    expect(after.cardIds).toEqual(first.cardIds);
    expect(after.cardIds).not.toContain(lateCards[0]);
  });

  it('refuses an all-parked or empty approval set instead of sealing weight without value', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await expect(sealNow(updates, trains)).rejects.toMatchObject({ code: 'nothing_to_seal', status: 409 });
  });

  it('refuses to seal a data-flavored approval set (Phase 2 scope) with the approvals kept', async () => {
    const missing = v2({
      judgmentId: 'm1', query: 'love your enemies', action: 'missing', at: nextAt(),
      reference: 'Matthew 5:44', withinTop: 10, note: 'uses that exact wording',
    });
    const root = await makeRepo([missing]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);
    await expect(sealNow(updates, trains)).rejects.toMatchObject({ code: 'data_train_waiting', status: 409 });
    // Nothing was sealed and the approvals survive for Phase 3's machinery.
    const derivation = await updates.derive(CURRENT);
    expect(derivation.trains).toHaveLength(0);
    expect(derivation.cards.every((card) => card.state.decision === 'approved')).toBe(true);
  });

  it('V4 (synthetic): a layer-affecting operation with no same-manifest fixture measuring it is named unmeasured', () => {
    const provenance = {
      source: 'editorial', confirmed: true, reviewer: 'Jesse',
      evidence: 'The cited passage directly names the reviewed theme.',
    };
    const manifest = parseProposalManifest({
      schemaVersion: 1, proposalId: 'synthetic-train', fixtureId: 'hope', caseIds: [stableUuid('case:v4')],
      sourcePreconditions: [{ path: 'ontology/concepts/hope.yaml', sha256: 'a'.repeat(64) }],
      operations: [{
        operationId: 'unpaired-anchor', type: 'editorial-anchor-add', conceptId: 'hope',
        anchor: { locator: 'Psalms 42:5', weight: 1, sources: ['editorial'] },
        sourcePaths: ['ontology/concepts/hope.yaml'], provenance,
        reason: 'A layer-affecting change with no measuring fixture.',
      }],
    });
    const unmeasured = unmeasuredLayerAffectingOperations(manifest);
    expect(unmeasured.map((operation) => operation.operationId)).toEqual(['unpaired-anchor']);

    // The paired form is measured: a fixture asserting an overlapping range.
    const paired = parseProposalManifest({
      schemaVersion: 1, proposalId: 'synthetic-train', fixtureId: 'hope', caseIds: [stableUuid('case:v4')],
      sourcePreconditions: [
        { path: 'ontology/concepts/hope.yaml', sha256: 'a'.repeat(64) },
        { path: 'eval/golden/hope.json', sha256: 'b'.repeat(64) },
      ],
      operations: [
        {
          operationId: 'paired-anchor', type: 'editorial-anchor-add', conceptId: 'hope',
          anchor: { locator: 'Psalms 42:5', weight: 1, sources: ['editorial'] },
          sourcePaths: ['ontology/concepts/hope.yaml'], provenance,
          reason: 'A layer-affecting change measured by the fixture below.',
        },
        {
          operationId: 'golden-fixture-upsert-hope', type: 'golden-fixture-upsert', goldenFixtureId: 'hope',
          fixture: { id: 'hope', query: 'hope', status: 'pending', expectedTop: [{ ref: 'Psalms 42:5', withinTop: 3 }] },
          sourcePaths: ['eval/golden/hope.json'], provenance,
          reason: 'Measures the anchor change on the same manifest.',
        },
      ],
    });
    expect(unmeasuredLayerAffectingOperations(paired)).toEqual([]);
  });
});

describe('§03.6 consumed cards: a live (merged) train never re-boards', () => {
  it('excludes consumed cards from the next seal, and refuses nothing_to_seal when only frozen cards remain', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    const firstCards = await approveEveryCard(updates);
    await sealNow(updates, trains);
    await markTrainLive(root, 'train-0001');
    expect((await trains.train('train-0001', CURRENT)).state).toBe('live');

    // Only the consumed card remains approved: the next seal refuses
    // honestly instead of re-boarding it forever.
    await expect(sealNow(updates, trains)).rejects.toMatchObject({ code: 'nothing_to_seal', status: 409 });

    // A new approval on a DIFFERENT search seals a train that carries ONLY
    // the new card's lines — summary, report, and manifest agree.
    const log = path.join(root, 'workbench', 'judgments.jsonl');
    const late = v2({
      judgmentId: 'g-late', query: 'doers of the word', action: 'irrelevant', at: nextAt(),
      targetId: 'WEB:19046001', diagnosis: 'lexical-noise',
    });
    await writeFile(log, `${await readFile(log, 'utf8')}${JSON.stringify(late)}\n`);
    await writeFile(path.join(root, 'workbench', 'cases.jsonl'), casesFor([guardRecord(), late]));
    const lateCards = await approveEveryCard(updates);
    expect(lateCards).toHaveLength(1);

    const second = await sealNow(updates, trains);
    expect(second.trainId).toBe('train-0002');
    expect(second.cardIds).toEqual(lateCards);
    expect(second.cardIds).not.toContain(firstCards[0]);
    expect(second.report!.lines).toHaveLength(1);
    expect(second.report!.lines[0]).toContain('For "doers of the word"');
    // The sealed manifest touches only the new fixture: the shipped line is
    // not presented as a change of this update.
    const registry = JSON.parse(await readFile(path.join(root, 'workbench', 'review-data', 'admission-evidence.json'), 'utf8')) as {
      admissions: { reviewId: string; proposal: { operations: { operationId: string }[] } }[];
    };
    const entry = registry.admissions.find((candidate) => candidate.reviewId === 'train-0002')!;
    expect(entry.proposal.operations.map((operation) => operation.operationId)).toEqual(['golden-fixture-upsert-doers-of-the-word']);
  });

  it('keeps the §03.6 row merge: a new call on the same search carries shipped rows forward without the consumed card riding again', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);
    await sealNow(updates, trains);
    await markTrainLive(root, 'train-0001');

    const log = path.join(root, 'workbench', 'judgments.jsonl');
    const late = v2({
      judgmentId: 'g-same', query: 'hearing and doing', action: 'irrelevant', at: nextAt(),
      targetId: 'WEB:59001022', diagnosis: 'lexical-noise',
    });
    await writeFile(log, `${await readFile(log, 'utf8')}${JSON.stringify(late)}\n`);
    const lateCards = await approveEveryCard(updates);
    expect(lateCards).toHaveLength(1);

    const second = await sealNow(updates, trains);
    expect(second.cardIds).toEqual(lateCards);
    const registry = JSON.parse(await readFile(path.join(root, 'workbench', 'review-data', 'admission-evidence.json'), 'utf8')) as {
      admissions: { reviewId: string; proposal: { operations: { operationId: string; fixture?: { mustNotRank: { ref: string }[] } }[] } }[];
    };
    const entry = registry.admissions.find((candidate) => candidate.reviewId === 'train-0002')!;
    expect(entry.proposal.operations.map((operation) => operation.operationId)).toEqual(['golden-fixture-upsert-hearing-and-doing']);
    // The rewritten fixture keeps the shipped guard row beside the new one.
    expect(entry.proposal.operations[0]!.fixture!.mustNotRank.map((row) => row.ref)).toEqual(['Psalms 46:1', 'James 1:22']);
  });

  it('liveness is monotonic (§5.2): a second same-search merge never regresses the first train — it stays live, its card rests, and a third seal departs', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);
    await sealNow(updates, trains);
    await markTrainLive(root, 'train-0001');

    // A second approved call on the same search: its sealed fixture merges
    // the shipped row with the new one (§03.6's row merge), and its merge
    // REWRITES the golden file — the system's own normal operation. Under
    // the old working-tree-equality observation this destroyed train-0001's
    // liveness; anchored to main's history it cannot.
    const log = path.join(root, 'workbench', 'judgments.jsonl');
    const late = v2({
      judgmentId: 'g-same-2', query: 'hearing and doing', action: 'irrelevant', at: nextAt(),
      targetId: 'WEB:59001022', diagnosis: 'lexical-noise',
    });
    await writeFile(log, `${await readFile(log, 'utf8')}${JSON.stringify(late)}\n`);
    await approveEveryCard(updates);
    await sealNow(updates, trains);
    await markTrainLive(root, 'train-0002');

    // (a) The first train is still live — never re-presented as "ready".
    expect((await trains.train('train-0001', CURRENT)).state).toBe('live');
    expect((await trains.train('train-0002', CURRENT)).state).toBe('live');

    // (b) Both consumed cards rest as achieved: neither re-enters the
    // approved tally, and the derivation lists both trains live.
    const derivation = await updates.derive(CURRENT);
    expect(derivation.liveTrainIds).toEqual(['train-0001', 'train-0002']);
    expect(derivation.tally.approved).toBe(0);
    expect(derivation.cards.filter((card) => card.state.sealedTrainLive === true)).toHaveLength(2);

    // (c) A third seal on an unrelated search departs — both prior trains
    // are terminal, so single-flight admits it; no eternal train_running.
    const third = v2({
      judgmentId: 'g-third', query: 'doers of the word', action: 'irrelevant', at: nextAt(),
      targetId: 'WEB:19046001', diagnosis: 'lexical-noise',
    });
    await writeFile(log, `${await readFile(log, 'utf8')}${JSON.stringify(third)}\n`);
    await writeFile(path.join(root, 'workbench', 'cases.jsonl'), casesFor([guardRecord(), late, third]));
    const thirdCards = await approveEveryCard(updates);
    expect(thirdCards).toHaveLength(1);
    const view = await sealNow(updates, trains);
    expect(view.trainId).toBe('train-0003');
    expect(view.state).toBe('ready');
  });

  it('a hand edit or promotion rewriting a merged fixture never regresses the train (history, not the working tree, is the anchor)', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);
    await sealNow(updates, trains);
    await markTrainLive(root, 'train-0001');

    // The §8.4 gate-wiring promotion trigger (or a hand edit) rewrites the
    // file AFTER the merge. The merged content remains in main's history.
    await writeFile(
      path.join(root, 'eval', 'golden', 'hearing-and-doing.json'),
      `${JSON.stringify({ id: 'hearing-and-doing', query: 'hearing and doing', status: 'active', mustNotRank: [] }, null, 2)}\n`,
    );
    expect((await trains.train('train-0001', CURRENT)).state).toBe('live');
    expect((await updates.derive(CURRENT)).liveTrainIds).toEqual(['train-0001']);
  });
});

describe('stops (§03.8) and the closed reason enum', () => {
  it('maps only terminal failure codes onto the closed enum', () => {
    expect(stopReasonForFailure('verify_failed')).toBe('verify-failed');
    // FM-8: a non-inherited red stops the train verify-failed.
    expect(stopReasonForFailure('blocking_gauntlet')).toBe('verify-failed');
    expect(stopReasonForFailure('stale_main')).toBe('main-moved');
    expect(stopReasonForFailure('source_drift')).toBe('source-drift');
    expect(stopReasonForFailure('probe_approval_missing')).toBe('g8-baseline-moved-needs-independent-approval');
    expect(stopReasonForFailure('remote_unavailable')).toBe('github-unavailable');
    // Transient refusals never stop the train.
    expect(stopReasonForFailure('mutation_running')).toBeNull();
    expect(stopReasonForFailure('invalid_request')).toBeNull();
  });

  it('stops a sealed train once with its pins, then frees the cards for the next seal — deterministically', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);
    const first = await sealNow(updates, trains);

    // An unmapped code leaves the train sealed and retryable.
    expect(await trains.stopFromFailure('train-0001', 'mutation_running')).toBeNull();
    expect((await trains.train('train-0001', CURRENT)).state).toBe('ready');

    expect(await trains.stopFromFailure('train-0001', 'verify_failed')).toBe('verify-failed');
    const stopped = await trains.train('train-0001', CURRENT);
    expect(stopped.state).toBe('stopped');
    expect(stopped.stopped).toEqual({ reason: 'verify-failed' });

    // Stopping twice is a no-op through the failure path and a refusal directly.
    expect(await trains.stopFromFailure('train-0001', 'verify_failed')).toBeNull();
    await expect(trains.recordStop('train-0001', 'verify-failed')).rejects.toMatchObject({ code: 'train_already_stopped' });
    await expect(trains.recordStop('train-0001', 'made-up-reason' as never)).rejects.toMatchObject({ code: 'invalid_stop_reason' });

    // The stop released the seal: the cards fold back to approved and the next
    // seal produces the SAME digest over the same votes and identity (seal
    // determinism), under the next train id.
    const second = await sealNow(updates, trains);
    expect(second.trainId).toBe('train-0002');
    expect(second.sealDigest).toBe(first.sealDigest);
  });

  it('carries the reportDigest pin into §03.8 stop conversion through the prior-train artifact join', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);
    await sealNow(updates, trains);

    // The verified report a verify-failed stop pins (shape per §03.8's reader).
    const report = `${JSON.stringify({
      payload: {
        gates: [{
          gate: 'G3-golden', status: 'fail',
          findings: [{ message: 'Fixture hearing-and-doing still failing.', subjects: ['hearing-and-doing'] }],
        }],
      },
    })}\n`;
    await mkdir(path.join(root, 'eval', '.runs'), { recursive: true });
    await writeFile(path.join(root, 'eval', '.runs', 'train-0001.json'), report);
    await trains.recordStop('train-0001', 'verify-failed', { reportDigest: sha256(report) });

    const derivation = await updates.derive(CURRENT);
    // The join verified: the stopped train is NOT listed unverifiable, and the
    // guard card converted to needs-engineering with the stop's evidence.
    expect(derivation.unverifiablePriorTrains).toEqual([]);
    const converted = derivation.cards.find((card) => card.kind === 'needs-engineering');
    expect(converted).toBeDefined();
    expect(converted!.engineering).toMatchObject({
      trainId: 'train-0001',
      stopReason: 'verify-failed',
      reportDigest: sha256(report),
    });
  });

  it('records refused-operation pins on the stop event', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);
    await sealNow(updates, trains);
    await trains.recordStop('train-0001', 'outside-allowlist', { refusedOperationIds: ['golden-fixture-upsert-hearing-and-doing'] });
    const view = await trains.train('train-0001', CURRENT);
    expect(view.stopped).toEqual({
      reason: 'outside-allowlist',
      refusedOperationIds: ['golden-fixture-upsert-hearing-and-doing'],
    });
  });
});

describe('§8.4 measured timing: the view carries the whole verified admit leg’s wall time', () => {
  it('is null before any admission, then admittedAt − the sign act’s decidedAt — never the gauntlet subprocess span alone', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);
    const sealed = await sealNow(updates, trains);
    expect(sealed.checksDurationMs).toBeNull();

    // The admit act records the whole leg it ran — the sign act
    // (decisions[].decidedAt) through admittedAt: provisioning, the
    // identity-verified rebuild, verify, the release gauntlet, and the
    // control run. The view prints THAT measured wall time — never an
    // estimate, and never the release-gauntlet subprocess alone (live: a
    // 26m26s leg whose gauntlet span was 74s printed as "1 minute").
    const registry = JSON.parse(await readFile(path.join(root, 'workbench', 'review-data', 'admission-evidence.json'), 'utf8')) as {
      admissions: { proposal: unknown }[];
    };
    const digest = proposalManifestDigest(parseProposalManifest(registry.admissions[0]!.proposal));
    await mkdir(path.join(root, 'workbench', 'admissions'), { recursive: true });
    await writeFile(path.join(root, 'workbench', 'admissions', `${'ab'.repeat(32)}.json`), `${JSON.stringify({
      proposalDigest: digest,
      admittedAt: '2026-08-12T10:26:26.000Z',
      decisions: [{ subject: 'hearing-and-doing', decidedAt: '2026-08-12T10:00:00.000Z' }],
      releaseGauntlet: { startedAt: '2026-08-12T10:23:05.000Z', finishedAt: '2026-08-12T10:24:19.000Z' },
    })}\n`);
    const view = await trains.train('train-0001', CURRENT);
    expect(view.state).toBe('admitted');
    expect(view.checksDurationMs).toBe(26 * 60_000 + 26_000);

    // Unreadable timestamps degrade to null, never to a made-up number.
    await writeFile(path.join(root, 'workbench', 'admissions', `${'ab'.repeat(32)}.json`), `${JSON.stringify({
      proposalDigest: digest,
      admittedAt: '2026-08-12T10:26:26.000Z',
      decisions: [{ subject: 'hearing-and-doing', decidedAt: 'not-a-time' }],
    })}\n`);
    expect((await trains.train('train-0001', CURRENT)).checksDurationMs).toBeNull();

    // So does a manifest recording no decisions at all.
    await writeFile(path.join(root, 'workbench', 'admissions', `${'ab'.repeat(32)}.json`), `${JSON.stringify({
      proposalDigest: digest,
      admittedAt: '2026-08-12T10:26:26.000Z',
      decisions: [],
    })}\n`);
    expect((await trains.train('train-0001', CURRENT)).checksDurationMs).toBeNull();
  });
});

describe('the fixture-lane Update Report (§4.6)', () => {
  it('is digest-stable across reads and recomputation', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);
    const sealed = await sealNow(updates, trains);
    const readBack = await trains.train('train-0001', CURRENT);
    expect(readBack.report).toEqual(sealed.report);

    const registry = JSON.parse(await readFile(path.join(root, 'workbench', 'review-data', 'admission-evidence.json'), 'utf8')) as {
      admissions: { proposal: unknown }[];
    };
    const recomputed = buildGuardUpdateReport('train-0001', parseProposalManifest(registry.admissions[0]!.proposal));
    expect(recomputed).toEqual(sealed.report);
  });

  it('reads an unknown train as 404 and an invalid id as a route error', async () => {
    const root = await makeRepo([guardRecord()]);
    const { trains } = operationsFor(root);
    await expect(trains.train('train-9', CURRENT)).rejects.toMatchObject({ code: 'train_not_found', status: 404 });
    await expect(trains.train('Not A Train', CURRENT)).rejects.toBeInstanceOf(TrainOperationsError);
  });
});

describe('seal hardening: the admissions-surface id, the §03.5 digest pin, and FM-7 reclaim', () => {
  // The exact shape admissionPublishOperations enforces on every review id
  // (REVIEW_ID, admissionPublishOperations.ts) — minimum 8 characters. A
  // minted id below it would 400 the admission routes and 500 the registry.
  const REVIEW_ID = /^[a-z0-9][a-z0-9-]{7,79}$/;

  it('mints train ids that satisfy the admissions REVIEW_ID shape (zero-padded)', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);
    const view = await sealNow(updates, trains);
    expect(view.trainId).toBe('train-0001');
    expect(REVIEW_ID.test(view.trainId)).toBe(true);
  });

  it('refuses a stale or missing derivation digest 409/400 before anything is written (§03.5 step 3)', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);

    await expect(trains.seal(CURRENT, 'f'.repeat(64))).rejects.toMatchObject({ code: 'stale_preview', status: 409 });
    await expect(trains.seal(CURRENT, '')).rejects.toMatchObject({ code: 'invalid_request', status: 400 });
    // Nothing was sealed and no evidence entry was written by the refusals.
    const derivation = await updates.derive(CURRENT);
    expect(derivation.trains).toHaveLength(0);
    expect((await readFile(path.join(root, 'workbench', 'review-data', 'admission-evidence.json'), 'utf8').catch(() => null))).toBeNull();

    // The true pin seals.
    const view = await trains.seal(CURRENT, derivation.derivationDigest);
    expect(view.trainId).toBe('train-0001');
  });

  it('reclaims a dangling evidence entry left by a crash between the registry write and the seal events (FM-7)', async () => {
    const root = await makeRepo([guardRecord()]);
    const { updates, trains } = operationsFor(root);
    await approveEveryCard(updates);

    // Simulate the crash window: the registry entry exists for the id the
    // next seal will mint, but no train event was ever appended.
    const evidencePath = path.join(root, 'workbench', 'review-data', 'admission-evidence.json');
    await mkdir(path.dirname(evidencePath), { recursive: true });
    await writeFile(evidencePath, `${JSON.stringify({
      schemaVersion: 1,
      admissions: [{
        reviewId: 'train-0001',
        admittedBaseCommit: BASE_COMMIT,
        expectedMainCommit: BASE_COMMIT,
        proposal: { crashed: true },
        candidate: null,
        comparison: null,
        comparisonBinding: null,
        gauntlet: null,
        baseIdentity: CURRENT,
        reviewedComparisonQueries: [],
        provenance: ['train:train-0001'],
      }],
    }, null, 2)}\n`, 'utf8');

    // The next seal reclaims the dangling entry instead of wedging 409.
    const view = await sealNow(updates, trains);
    expect(view.trainId).toBe('train-0001');
    const registry = JSON.parse(await readFile(evidencePath, 'utf8')) as { admissions: { reviewId: string; proposal: unknown }[] };
    expect(registry.admissions).toHaveLength(1);
    expect(registry.admissions[0]!.proposal).not.toEqual({ crashed: true });
  });
});
