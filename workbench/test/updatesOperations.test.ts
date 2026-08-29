/**
 * D6 — the Updates endpoints' operations seam (plan §03.5 steps 1–2).
 *
 * derive is read-only and repeatable; decide validates the PER-CARD pin
 * (`cardRevision`, never the global derivation digest), appends through the
 * fail-closed store — lazily drafting the card on first decide — and 409s
 * exactly when THIS card changed. Decides on other cards never invalidate
 * a pending decide.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { fixtureContentDigest, THEME_ANSWER_NONE, type MainGoldenHistoryEntry } from '../src/deriveUpdates.js';
import type { JudgmentRecordV2 } from '../src/judgments.js';
import { createTrainOperations } from '../src/trainRunner.js';
import { createUpdatesOperations, readGoldenMainHistoryFromGit, UpdatesOperationsError, type TrainGoldenHistoryWindow } from '../src/updatesOperations.js';

const CURRENT = {
  engineVersion: '0.14.0-test',
  corpusFingerprint: 'corpus-current',
  layerFingerprint: 'layer-current',
};

function stableUuid(label: string): string {
  const hex = createHash('sha256').update(label).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
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
    ...CURRENT,
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
      artifact: CURRENT,
    }))
    .map((line) => `${line}\n`)
    .join('');
}

const ONTOLOGY_YAML = [
  'id: gods-incomparability',
  "label: \"God's incomparability\"",
  'lexicon:',
  '  - who is like the lord',
  'anchors:',
  '  - ref: Exodus 15:11',
  '    sources: [openbible]',
  '',
].join('\n');

const SUBSET = JSON.stringify({
  $schema: 'verse-array-subset/1',
  selection: [
    { book: 'Psalms', chapters: [46], why: 'test' },
    { book: 'Exodus', chapters: [15], why: 'test' },
    { book: 'Deuteronomy', chapters: [3], why: 'test' },
  ],
  verses: [],
}, null, 2);

describe('updates operations (derive + decide)', () => {
  let repo: string;
  let clock: number;
  // The §03.6 live anchor's test double: main's append-only golden history.
  // Every digest here lands AFTER the single test train's seal, so it sits in
  // that train's post-base window; the double answers each train's window
  // with the same appended history (base-epoch modelling lives in the
  // trainRunner reversal-chain tests, where bases actually differ).
  let mainHistory: Record<string, string[]>;
  const readTestMainHistory = async (_repoRoot: string, windows: readonly TrainGoldenHistoryWindow[]): Promise<MainGoldenHistoryEntry[]> =>
    windows.flatMap((window) =>
      window.goldenPaths
        .filter((goldenPath) => mainHistory[goldenPath] !== undefined)
        .map((goldenPath) => ({ trainId: window.trainId, path: goldenPath, fixtureDigests: mainHistory[goldenPath]! })));

  const records = (): JudgmentRecordV2[] => [
    v2({ judgmentId: 'op-guard', query: 'who is like the lord', action: 'irrelevant', at: '2026-08-12T10:00:00.000Z', diagnosis: 'lexical-noise', targetId: 'WEB:19046001' }),
    v2({ judgmentId: 'op-missing', query: 'who is like the lord', action: 'missing', at: '2026-08-12T10:01:00.000Z', reference: 'Deuteronomy 3:24', withinTop: 10, note: 'uses that exact wording' }),
  ];

  beforeEach(async () => {
    repo = await mkdtemp(path.join(os.tmpdir(), 'updates-operations-'));
    clock = Date.parse('2026-08-13T09:00:00.000Z');
    mainHistory = {};
    await mkdir(path.join(repo, 'ontology', 'concepts'), { recursive: true });
    await mkdir(path.join(repo, 'eval', 'golden'), { recursive: true });
    await mkdir(path.join(repo, 'pipeline', 'fixtures'), { recursive: true });
    await mkdir(path.join(repo, 'workbench'), { recursive: true });
    await writeFile(path.join(repo, 'ontology', 'concepts', 'gods-incomparability.yaml'), ONTOLOGY_YAML);
    await writeFile(path.join(repo, 'pipeline', 'fixtures', 'web-subset.json'), SUBSET);
    const rows = records();
    await writeFile(path.join(repo, 'workbench', 'judgments.jsonl'), rows.map((row) => `${JSON.stringify(row)}\n`).join(''));
    await writeFile(path.join(repo, 'workbench', 'cases.jsonl'), casesFor(rows));
  });

  afterEach(async () => {
    await rm(repo, { recursive: true, force: true });
  });

  function operations() {
    return createUpdatesOperations({
      repoRoot: repo,
      reviewer: 'jesse',
      now: () => new Date((clock += 60_000)),
      readGoldenMainHistory: readTestMainHistory,
    });
  }

  it('derive is read-only and repeatable: identical output, no updates.jsonl write', async () => {
    const ops = operations();
    const one = await ops.derive(CURRENT);
    const two = await ops.derive(CURRENT);
    expect(JSON.stringify(two)).toBe(JSON.stringify(one));
    expect(one.cards.length).toBeGreaterThan(0);
    await expect(readFile(path.join(repo, 'workbench', 'updates.jsonl'), 'utf8')).rejects.toThrow();
  });

  it('decide drafts lazily, appends the decision, and returns the re-rendered card', async () => {
    const ops = operations();
    const { cards } = await ops.derive(CURRENT);
    const guard = cards.find((card) => card.kind === 'guard')!;
    const decided = await ops.decide(guard.cardId, { decision: 'approve', cardRevision: guard.cardRevision }, CURRENT);
    expect(decided.state.decision).toBe('approved');
    expect(decided.cardRevision).toBe(guard.cardRevision);
    const raw = await readFile(path.join(repo, 'workbench', 'updates.jsonl'), 'utf8');
    const lines = raw.trimEnd().split('\n').map((line) => JSON.parse(line) as { kind: string; cardId: string });
    expect(lines.map((line) => line.kind)).toEqual(['card-drafted', 'card-approved']);
    expect(lines.every((line) => line.cardId === guard.cardId)).toBe(true);
    // A changed mind is a new line, never an edit: park after approve folds
    // latest-wins and the log keeps both.
    const parked = await ops.decide(guard.cardId, { decision: 'park', cardRevision: guard.cardRevision }, CURRENT);
    expect(parked.state.decision).toBe('parked');
    const afterRaw = await readFile(path.join(repo, 'workbench', 'updates.jsonl'), 'utf8');
    expect(afterRaw.startsWith(raw)).toBe(true);
    expect(afterRaw.trimEnd().split('\n')).toHaveLength(3);
  });

  it('decides on other cards never invalidate a pending decide (per-card pin)', async () => {
    const ops = operations();
    const { cards } = await ops.derive(CURRENT);
    const guard = cards.find((card) => card.kind === 'guard')!;
    const missing = cards.find((card) => card.kind === 'missing-passage')!;
    await ops.decide(guard.cardId, { decision: 'approve', cardRevision: guard.cardRevision }, CURRENT);
    // The missing-passage card still decides against its ORIGINAL revision.
    const decided = await ops.decide(missing.cardId, { decision: 'approve', answers: { theme: 'gods-incomparability' }, cardRevision: missing.cardRevision }, CURRENT);
    expect(decided.state.decision).toBe('approved');
  });

  it('409s exactly when this card changed: stale revision or an id that no longer derives', async () => {
    const ops = operations();
    const { cards } = await ops.derive(CURRENT);
    const guard = cards.find((card) => card.kind === 'guard')!;
    await expect(ops.decide(guard.cardId, { decision: 'approve', cardRevision: 'c'.repeat(64) }, CURRENT))
      .rejects.toMatchObject({ code: 'stale_card_revision', status: 409 });
    await expect(ops.decide('d'.repeat(64), { decision: 'approve', cardRevision: guard.cardRevision }, CURRENT))
      .rejects.toMatchObject({ code: 'card_not_derived', status: 409 });
    await expect(readFile(path.join(repo, 'workbench', 'updates.jsonl'), 'utf8')).rejects.toThrow();
  });

  it('requires the one-line decline reason and a human answer before approving a question card', async () => {
    const ops = operations();
    const { cards } = await ops.derive(CURRENT);
    const guard = cards.find((card) => card.kind === 'guard')!;
    const missing = cards.find((card) => card.kind === 'missing-passage')!;
    expect(missing.question).toBeDefined();
    await expect(ops.decide(guard.cardId, { decision: 'decline', cardRevision: guard.cardRevision }, CURRENT))
      .rejects.toMatchObject({ code: 'decline_reason_required' });
    await expect(ops.decide(guard.cardId, { decision: 'decline', reason: 'two\nlines', cardRevision: guard.cardRevision }, CURRENT))
      .rejects.toMatchObject({ code: 'decline_reason_required' });
    await expect(ops.decide(missing.cardId, { decision: 'approve', cardRevision: missing.cardRevision }, CURRENT))
      .rejects.toMatchObject({ code: 'answer_required' });
    await expect(ops.decide(missing.cardId, { decision: 'approve', answers: { theme: 'not-an-option' }, cardRevision: missing.cardRevision }, CURRENT))
      .rejects.toMatchObject({ code: 'answer_required' });
    // The routed exit is an acceptable human answer (V3).
    const routed = await ops.decide(missing.cardId, { decision: 'approve', answers: { theme: THEME_ANSWER_NONE }, cardRevision: missing.cardRevision }, CURRENT);
    expect(routed.state.decision).toBe('approved');
    // Nothing invalid ever reached the log.
    const raw = await readFile(path.join(repo, 'workbench', 'updates.jsonl'), 'utf8');
    expect(raw.trimEnd().split('\n')).toHaveLength(2);
  });

  it('a conflict card accepts only Not now — the pick itself is a superseding vote in Review', async () => {
    const rows = [
      v2({ judgmentId: 'c-yes', query: 'who is like the lord', action: 'essential', at: '2026-08-12T10:00:00.000Z', targetId: 'WEB:19046001', withinTop: 5 }),
      v2({ judgmentId: 'c-no', query: 'who is like the lord', action: 'irrelevant', at: '2026-08-12T10:01:00.000Z', diagnosis: 'lexical-noise', targetId: 'WEB:19046001' }),
    ];
    await writeFile(path.join(repo, 'workbench', 'judgments.jsonl'), rows.map((row) => `${JSON.stringify(row)}\n`).join(''));
    await writeFile(path.join(repo, 'workbench', 'cases.jsonl'), casesFor(rows));
    const ops = operations();
    const { cards } = await ops.derive(CURRENT);
    const conflict = cards.find((card) => card.kind === 'conflict')!;
    expect(conflict).toBeDefined();
    await expect(ops.decide(conflict.cardId, { decision: 'approve', cardRevision: conflict.cardRevision }, CURRENT))
      .rejects.toMatchObject({ code: 'conflict_requires_vote', status: 409 });
    const parked = await ops.decide(conflict.cardId, { decision: 'park', cardRevision: conflict.cardRevision }, CURRENT);
    expect(parked.state.decision).toBe('parked');
  });

  it('a V6 re-confirmation card accepts only Not now — "Look again" is a hand-off, never a decide', async () => {
    // An identity-moved prefer vote derives the non-legacy re-confirmation
    // card (§03.5's observation-bound remainder). The UI renders its
    // two-button form (§4.3 example 3: Look again + Not now); the endpoint
    // enforces the same shape — only §07.2's legacy card takes A/D.
    const rows = [
      v2({ judgmentId: 'v6-prefer', query: 'who is like the lord', action: 'prefer', at: '2026-08-12T10:00:00.000Z', preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:19046001', layerFingerprint: 'layer-old' }),
    ];
    await writeFile(path.join(repo, 'workbench', 'judgments.jsonl'), rows.map((row) => `${JSON.stringify(row)}\n`).join(''));
    await writeFile(path.join(repo, 'workbench', 'cases.jsonl'), casesFor(rows));
    const ops = operations();
    const { cards } = await ops.derive(CURRENT);
    const reconfirm = cards.find((card) => card.kind === 're-confirmation')!;
    expect(reconfirm).toBeDefined();
    expect(reconfirm.legacy).toBeUndefined();
    await expect(ops.decide(reconfirm.cardId, { decision: 'approve', cardRevision: reconfirm.cardRevision }, CURRENT))
      .rejects.toMatchObject({ code: 'reconfirmation_requires_fresh_look', status: 409 });
    await expect(ops.decide(reconfirm.cardId, { decision: 'decline', reason: 'checked by hand', cardRevision: reconfirm.cardRevision }, CURRENT))
      .rejects.toMatchObject({ code: 'reconfirmation_requires_fresh_look', status: 409 });
    // Nothing invalid reached the log; Not now still records normally.
    await expect(readFile(path.join(repo, 'workbench', 'updates.jsonl'), 'utf8')).rejects.toThrow();
    const parked = await ops.decide(reconfirm.cardId, { decision: 'park', cardRevision: reconfirm.cardRevision }, CURRENT);
    expect(parked.state.decision).toBe('parked');
  });

  it('refuses malformed decide bodies before touching anything', async () => {
    const ops = operations();
    const { cards } = await ops.derive(CURRENT);
    const guard = cards.find((card) => card.kind === 'guard')!;
    for (const body of [
      null,
      { decision: 'shred', cardRevision: guard.cardRevision },
      { decision: 'approve' },
      { decision: 'approve', cardRevision: 'short' },
      { decision: 'approve', cardRevision: guard.cardRevision, extra: true },
      { decision: 'park', cardRevision: guard.cardRevision, answers: { theme: 'x' } },
    ]) {
      await expect(ops.decide(guard.cardId, body, CURRENT)).rejects.toBeInstanceOf(UpdatesOperationsError);
    }
    await expect(readFile(path.join(repo, 'workbench', 'updates.jsonl'), 'utf8')).rejects.toThrow();
  });

  it('refuses every decide on a seal-frozen card 409 card_sealed — the fold would ignore it (§02.6)', async () => {
    const ops = operations();
    const { cards } = await ops.derive(CURRENT);
    const guard = cards.find((card) => card.kind === 'guard')!;
    await ops.decide(guard.cardId, { decision: 'approve', cardRevision: guard.cardRevision }, CURRENT);
    const trains = createTrainOperations({
      repoRoot: repo,
      reviewer: 'jesse',
      now: () => new Date((clock += 60_000)),
      readMain: async () => 'a'.repeat(40),
      readGoldenMainHistory: readTestMainHistory,
    });
    const { derivationDigest } = await ops.derive(CURRENT);
    await trains.seal(CURRENT, derivationDigest);

    const sealed = (await ops.derive(CURRENT)).cards.find((card) => card.cardId === guard.cardId)!;
    expect(sealed.state.sealedInTrain).toBe('train-0001');
    for (const decision of [
      { decision: 'decline', reason: 'changed my mind', cardRevision: sealed.cardRevision },
      { decision: 'park', cardRevision: sealed.cardRevision },
    ]) {
      await expect(ops.decide(guard.cardId, decision, CURRENT)).rejects.toMatchObject({ code: 'card_sealed', status: 409 });
    }
    // The frozen decision stands untouched.
    const after = (await ops.derive(CURRENT)).cards.find((card) => card.cardId === guard.cardId)!;
    expect(after.state.decision).toBe('approved');
    expect(after.state.sealedInTrain).toBe('train-0001');
  });

  it('a card consumed by a finished (live) update rests as achieved: out of the approved tally, decide refused with the finished sentence (§03.6)', async () => {
    const ops = operations();
    const { cards } = await ops.derive(CURRENT);
    const guard = cards.find((card) => card.kind === 'guard')!;
    await ops.decide(guard.cardId, { decision: 'approve', cardRevision: guard.cardRevision }, CURRENT);
    const trains = createTrainOperations({
      repoRoot: repo,
      reviewer: 'jesse',
      now: () => new Date((clock += 60_000)),
      readMain: async () => 'a'.repeat(40),
      readGoldenMainHistory: readTestMainHistory,
    });
    const { derivationDigest } = await ops.derive(CURRENT);
    await trains.seal(CURRENT, derivationDigest);

    // While the train merely rides, the card still counts as approved and
    // renders riding — the freeze copy is true.
    const riding = await ops.derive(CURRENT);
    expect(riding.tally.approved).toBe(1);
    expect(riding.cards.find((card) => card.cardId === guard.cardId)!.state.sealedTrainLive).toBeUndefined();

    // Observe the merge: the sealed manifest's fixture content lands on
    // main — recorded in main's history (the §03.6/§5.2 anchor), with the
    // post-merge checkout's working-tree file written alongside.
    const registry = JSON.parse(await readFile(path.join(repo, 'workbench', 'review-data', 'admission-evidence.json'), 'utf8')) as {
      admissions: { reviewId: string; proposal: { operations: { type: string; goldenFixtureId: string; fixture: unknown }[] } }[];
    };
    for (const operation of registry.admissions[0]!.proposal.operations) {
      if (operation.type !== 'golden-fixture-upsert') continue;
      const goldenPath = `eval/golden/${operation.goldenFixtureId}.json`;
      mainHistory[goldenPath] = [...(mainHistory[goldenPath] ?? []), fixtureContentDigest(operation.fixture)];
      await writeFile(path.join(repo, 'eval', 'golden', `${operation.goldenFixtureId}.json`), `${JSON.stringify(operation.fixture, null, 2)}\n`);
    }

    // The card now rests as achieved: flagged live, out of the approved
    // tally (§4.2's "approved for the next update" must not overcount).
    const live = await ops.derive(CURRENT);
    const shipped = live.cards.find((card) => card.cardId === guard.cardId)!;
    expect(shipped.state.sealedInTrain).toBe('train-0001');
    expect(shipped.state.sealedTrainLive).toBe(true);
    expect(live.tally.approved).toBe(0);

    // The freeze never lifts (consumed), and the refusal says what is true.
    await expect(ops.decide(guard.cardId, { decision: 'park', cardRevision: shipped.cardRevision }, CURRENT))
      .rejects.toMatchObject({
        code: 'card_sealed',
        status: 409,
        message: expect.stringContaining('rode an update that finished'),
      });
  });
});

describe('readGoldenMainHistoryFromGit (§03.6/§5.2 live anchor, per-train post-base windows)', () => {
  let repo: string;

  beforeEach(async () => {
    repo = await mkdtemp(path.join(os.tmpdir(), 'golden-main-history-'));
  });

  afterEach(async () => {
    await rm(repo, { recursive: true, force: true });
  });

  function git(args: readonly string[]): string {
    const result = spawnSync('git', [...args], { cwd: repo, encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
    return result.stdout.trim();
  }

  const goldenPath = 'eval/golden/hope.json';
  const v1 = { id: 'hope', query: 'hope', mustNotRank: [{ ref: 'Psalms 46:1', why: 'test' }] };
  const v2Content = { ...v1, mustNotRank: [...v1.mustNotRank, { ref: 'James 1:22', why: 'merged later' }] };

  /** C0 (no golden file) → C1 (v1) → C2 (v2). Returns the three commits. */
  async function seedMainHistory(): Promise<{ c0: string; c1: string; c2: string }> {
    git(['init', '--quiet', '--initial-branch=main']);
    git(['config', 'user.email', 'workbench-test@example.invalid']);
    git(['config', 'user.name', 'Workbench Test']);
    await mkdir(path.join(repo, 'eval', 'golden'), { recursive: true });
    await writeFile(path.join(repo, 'README.md'), 'seed\n');
    git(['add', '.']);
    git(['commit', '--quiet', '--message', 'seed (train base)']);
    const c0 = git(['rev-parse', 'HEAD']);
    await writeFile(path.join(repo, goldenPath), `${JSON.stringify(v1, null, 2)}\n`);
    git(['add', '.']);
    git(['commit', '--quiet', '--message', 'first merge']);
    const c1 = git(['rev-parse', 'HEAD']);
    await writeFile(path.join(repo, goldenPath), `${JSON.stringify(v2Content, null, 2)}\n`);
    git(['add', '.']);
    git(['commit', '--quiet', '--message', 'second merge rewrites the file']);
    const c2 = git(['rev-parse', 'HEAD']);
    return { c0, c1, c2 };
  }

  it('returns every post-base content version — history, so a later rewrite keeps earlier versions', async () => {
    const { c0 } = await seedMainHistory();
    const entries = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0001', baseCommit: c0, goldenPaths: [goldenPath, 'eval/golden/never-merged.json'] },
    ]);
    expect(entries.map((entry) => [entry.trainId, entry.path])).toEqual([
      ['train-0001', 'eval/golden/hope.json'],
      ['train-0001', 'eval/golden/never-merged.json'],
    ]);
    const hope = entries.find((entry) => entry.path === goldenPath)!;
    // BOTH versions landed after this train's base — the first train's
    // content remains observed merged after the second train rewrote the
    // file (monotonic within the window).
    expect(hope.fixtureDigests).toContain(fixtureContentDigest(v1));
    expect(hope.fixtureDigests).toContain(fixtureContentDigest(v2Content));
    // A working-tree-only edit is NOT history: it changes nothing observed.
    await writeFile(path.join(repo, goldenPath), `${JSON.stringify({ id: 'hope' }, null, 2)}\n`);
    const after = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0001', baseCommit: c0, goldenPaths: [goldenPath] },
    ]);
    expect(after[0]!.fixtureDigests).toEqual(hope.fixtureDigests);
    // A path never merged observes no versions (fail-closed to riding).
    expect(entries.find((entry) => entry.path === 'eval/golden/never-merged.json')!.fixtureDigests).toEqual([]);
  });

  it('excludes versions merged at or before the train\'s own base — a re-land after the base counts, ancestor content never does', async () => {
    const { c1, c2 } = await seedMainHistory();
    // A train based at C1 sees only what landed after C1: v2, never v1.
    const afterC1 = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0002', baseCommit: c1, goldenPaths: [goldenPath] },
    ]);
    expect(afterC1[0]!.fixtureDigests).toEqual([fixtureContentDigest(v2Content)]);
    // A train based at C2 (main's tip) sees NOTHING — v1 sitting in
    // ancestor history is exactly the reversal-chain content collision the
    // window exists to exclude: a sealed train re-deriving v1's bytes stays
    // riding until its own merge lands.
    const beforeReland = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0003', baseCommit: c2, goldenPaths: [goldenPath] },
    ]);
    expect(beforeReland[0]!.fixtureDigests).toEqual([]);
    // The reversal train's own merge re-lands v1's exact content post-base:
    // NOW its window holds the digest and the train goes live.
    await writeFile(path.join(repo, goldenPath), `${JSON.stringify(v1, null, 2)}\n`);
    git(['add', '.']);
    git(['commit', '--quiet', '--message', 'reversal merge re-lands the first content']);
    const afterReland = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0003', baseCommit: c2, goldenPaths: [goldenPath] },
    ]);
    expect(afterReland[0]!.fixtureDigests).toEqual([fixtureContentDigest(v1)]);
  });

  it('a train with no usable base observes NOTHING — never unscoped history', async () => {
    const { c0 } = await seedMainHistory();
    const entries = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0001', baseCommit: null, goldenPaths: [goldenPath] },
      { trainId: 'train-0002', baseCommit: 'f'.repeat(40), goldenPaths: [goldenPath] },
      { trainId: 'train-0003', baseCommit: c0, goldenPaths: [goldenPath] },
    ]);
    // The null base and the unresolvable base contribute no entries at all
    // (fail-closed to riding); the valid window still reads.
    expect(entries.map((entry) => entry.trainId)).toEqual(['train-0003']);
  });

  it('observes nothing outside a git repository or with no main ref — never an error', async () => {
    await expect(readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0001', baseCommit: 'a'.repeat(40), goldenPaths: ['eval/golden/hope.json'] },
    ])).resolves.toEqual([]);
    await expect(readGoldenMainHistoryFromGit(repo, [])).resolves.toEqual([]);
  });

  /**
   * A squash merge lands on `refs/remotes/origin/main` first — pure plumbing
   * (a fetch): a new commit chain grows under the remote-tracking ref while
   * the working tree and local main never move.
   */
  async function commitOnOrigin(content: unknown, message: string): Promise<string> {
    const probe = spawnSync('git', ['rev-parse', '--verify', '--quiet', 'refs/remotes/origin/main'], { cwd: repo, encoding: 'utf8' });
    const parent = probe.status === 0 && probe.stdout.trim() !== '' ? probe.stdout.trim() : git(['rev-parse', 'HEAD']);
    const blobPath = path.join(repo, '.origin-blob.json');
    await writeFile(blobPath, `${JSON.stringify(content, null, 2)}\n`);
    const blob = git(['hash-object', '-w', blobPath]);
    const env = { ...process.env, GIT_INDEX_FILE: path.join(repo, '.origin-index') };
    const gitIdx = (args: readonly string[]): string => {
      const result = spawnSync('git', [...args], { cwd: repo, encoding: 'utf8', env });
      if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
      return result.stdout.trim();
    };
    gitIdx(['read-tree', `${parent}^{tree}`]);
    gitIdx(['update-index', '--add', '--cacheinfo', `100644,${blob},${goldenPath}`]);
    const tree = gitIdx(['write-tree']);
    const commit = git(['commit-tree', tree, '-p', parent, '-m', message]);
    git(['update-ref', 'refs/remotes/origin/main', commit]);
    return commit;
  }

  it('the recorded seal-time origin base bounds the window: already-fetched origin history is outside, a post-seal origin merge is inside', async () => {
    // Local main lags at C0 forever (the checkout only fetches); merges are
    // reachable only from refs/remotes/origin/main.
    git(['init', '--quiet', '--initial-branch=main']);
    git(['config', 'user.email', 'workbench-test@example.invalid']);
    git(['config', 'user.name', 'Workbench Test']);
    await writeFile(path.join(repo, 'README.md'), 'seed\n');
    git(['add', '.']);
    git(['commit', '--quiet', '--message', 'seed (lagging local main)']);
    const c0 = git(['rev-parse', 'HEAD']);
    const o1 = await commitOnOrigin(v1, 'first merge, fetched before this train sealed');

    // Sealed with base C0 AND the seal-time origin tip O1: O1's version is
    // history this train could not have produced — outside its window.
    const preSeal = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0002', baseCommit: c0, originBaseCommit: o1, goldenPaths: [goldenPath] },
    ]);
    expect(preSeal).toEqual([{ trainId: 'train-0002', path: goldenPath, fixtureDigests: [] }]);

    // The train's OWN merge lands on origin/main after seal: inside.
    await commitOnOrigin(v2Content, 'second merge, after this train sealed');
    const postSeal = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0002', baseCommit: c0, originBaseCommit: o1, goldenPaths: [goldenPath] },
    ]);
    expect(postSeal[0]!.fixtureDigests).toEqual([fixtureContentDigest(v2Content)]);

    // originBaseCommit null records that NO origin ref existed at seal —
    // every origin commit is then post-seal history, inside the window.
    const nullRecorded = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0001', baseCommit: c0, originBaseCommit: null, goldenPaths: [goldenPath] },
    ]);
    expect(nullRecorded[0]!.fixtureDigests).toContain(fixtureContentDigest(v1));
    expect(nullRecorded[0]!.fixtureDigests).toContain(fixtureContentDigest(v2Content));

    // An unresolvable recorded origin base leaves the window unboundable:
    // observe NOTHING (fail-closed to riding), never a fall-back to the
    // local base alone.
    const unresolvable = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0003', baseCommit: c0, originBaseCommit: 'f'.repeat(40), goldenPaths: [goldenPath] },
    ]);
    expect(unresolvable).toEqual([]);
  });

  it('a legacy window (no recorded seal-time origin state) observes only while origin/main trails local main — an ahead or divergent origin/main observes NOTHING', async () => {
    const { c1, c2 } = await seedMainHistory();
    // No origin ref at all (a D11-sandbox-shaped repo): the local base
    // bounds everything the tips can see — the legacy window keeps
    // observing.
    const noOrigin = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0001', baseCommit: c1, goldenPaths: [goldenPath] },
    ]);
    expect(noOrigin[0]!.fixtureDigests).toEqual([fixtureContentDigest(v2Content)]);

    // origin/main as an ANCESTOR of the base holds no history the base
    // misses: still observing.
    git(['update-ref', 'refs/remotes/origin/main', c1]);
    const ancestorOfBase = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0001', baseCommit: c1, goldenPaths: [goldenPath] },
    ]);
    expect(ancestorOfBase[0]!.fixtureDigests).toEqual([fixtureContentDigest(v2Content)]);

    // origin/main BETWEEN the base and the local tip (the D11 sandbox's
    // geometry — the sandbox pushes main after merging, so origin trails):
    // the tips see nothing beyond local main, the window reduces to
    // `rev-list <localTip> ^<base>` — still observing.
    git(['update-ref', 'refs/remotes/origin/main', c2]);
    const trailingOrigin = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0001', baseCommit: c1, goldenPaths: [goldenPath] },
    ]);
    expect(trailingOrigin[0]!.fixtureDigests).toEqual([fixtureContentDigest(v2Content)]);

    // An origin/main AHEAD of (or divergent from) local main could have
    // been ahead at seal too, and the legacy entry cannot say what the
    // seal could already see — the window is unboundable, so the train
    // observes nothing (fail-closed to riding) while a window that
    // RECORDED its seal-time origin base still reads.
    git(['update-ref', 'refs/remotes/origin/main', c1]);
    const aheadOrigin = await commitOnOrigin(v1, 'merge fetched at an unknown time');
    const withDivergence = await readGoldenMainHistoryFromGit(repo, [
      { trainId: 'train-0001', baseCommit: c1, goldenPaths: [goldenPath] },
      { trainId: 'train-0002', baseCommit: c1, originBaseCommit: aheadOrigin, goldenPaths: [goldenPath] },
    ]);
    expect(withDivergence.map((entry) => entry.trainId)).toEqual(['train-0002']);
    expect(withDivergence[0]!.fixtureDigests).toEqual([fixtureContentDigest(v2Content)]);
  });
});
