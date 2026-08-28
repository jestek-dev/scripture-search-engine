/**
 * D6 — the Updates endpoints' operations seam (plan §03.5 steps 1–2).
 *
 * derive is read-only and repeatable; decide validates the PER-CARD pin
 * (`cardRevision`, never the global derivation digest), appends through the
 * fail-closed store — lazily drafting the card on first decide — and 409s
 * exactly when THIS card changed. Decides on other cards never invalidate
 * a pending decide.
 */
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { THEME_ANSWER_NONE } from '../src/deriveUpdates.js';
import type { JudgmentRecordV2 } from '../src/judgments.js';
import { createUpdatesOperations, UpdatesOperationsError } from '../src/updatesOperations.js';

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

  const records = (): JudgmentRecordV2[] => [
    v2({ judgmentId: 'op-guard', query: 'who is like the lord', action: 'irrelevant', at: '2026-08-12T10:00:00.000Z', diagnosis: 'lexical-noise', targetId: 'WEB:19046001' }),
    v2({ judgmentId: 'op-missing', query: 'who is like the lord', action: 'missing', at: '2026-08-12T10:01:00.000Z', reference: 'Deuteronomy 3:24', withinTop: 10, note: 'uses that exact wording' }),
  ];

  beforeEach(async () => {
    repo = await mkdtemp(path.join(os.tmpdir(), 'updates-operations-'));
    clock = Date.parse('2026-08-13T09:00:00.000Z');
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
});
