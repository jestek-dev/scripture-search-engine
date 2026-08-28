/**
 * D4 — the deriver (votes-to-engine plan §03; Phase-1 AC block §8.3).
 *
 * The deriver is a pure function of the observed-input snapshot: these tests
 * hand it in-memory bytes only. Coverage per the Phase-1 AC list:
 * determinism (byte-identical output twice, and under permuted input-file
 * order, over the full eight-input snapshot including a prior-train outcome
 * set), supersede-chain leaves, every mapping-table row, conflict cards,
 * ownership refusals, v1 exclusion, helpful deriving nothing, provenance
 * round-trip through the strict proposal parser, identity pre-check
 * dispositions, the legacy re-confirmation card and its termination rule,
 * and the needs-engineering stop conversion with FM-5's parked-by-default.
 */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildUpdatesManifest,
  computeCardId,
  computeSealDigest,
  deriveUpdates,
  queryKey,
  THEME_ANSWER_NONE,
  UpdatesManifestError,
  type DeriveUpdatesInputs,
  type ReplayIdentity,
  type UpdateCard,
} from '../src/deriveUpdates.js';
import type { JudgmentRecordV2 } from '../src/judgments.js';
import type { UpdatesEvent } from '../src/updatesStore.js';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const CURRENT: ReplayIdentity = {
  engineVersion: '0.14.0-test',
  corpusFingerprint: 'corpus-current',
  layerFingerprint: 'layer-current',
};
const OLD_LAYER = { ...CURRENT, layerFingerprint: 'layer-old' };

function sha(label: string): string {
  return createHash('sha256').update(label).digest('hex');
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

interface V2Options extends Partial<JudgmentRecordV2> {
  readonly judgmentId: string;
  readonly query: string;
  readonly action: JudgmentRecordV2['action'];
  readonly at: string;
}

function v2(options: V2Options): JudgmentRecordV2 {
  const identity = {
    engineVersion: options.engineVersion ?? CURRENT.engineVersion,
    corpusFingerprint: options.corpusFingerprint ?? CURRENT.corpusFingerprint,
    layerFingerprint: options.layerFingerprint ?? CURRENT.layerFingerprint,
  };
  return {
    schemaVersion: 2,
    reviewer: 'jesse',
    observedWindow: 10,
    resultSetDigest: 'a'.repeat(64),
    displayedWindowDigest: 'b'.repeat(64),
    source: 'manual',
    caseId: stableUuid(`case:${options.query}`),
    observedRank: options.action === 'missing' ? null : 1,
    ...options,
    ...identity,
    judgmentId: stableUuid(options.judgmentId),
    ...(options.supersedes === undefined ? {} : { supersedes: stableUuid(options.supersedes) }),
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

const ONTOLOGY = [
  {
    path: 'ontology/concepts/gods-incomparability.yaml',
    contents: [
      'id: gods-incomparability',
      'label: "God\'s incomparability"',
      'lexicon:',
      '  - who is like the lord',
      '  - none like you',
      'anchors:',
      '  - ref: Exodus 15:11',
      '    sources: [openbible]',
      '',
    ].join('\n'),
  },
  {
    path: 'ontology/concepts/obedience-to-the-word.yaml',
    contents: [
      'id: obedience-to-the-word',
      'label: Obedience to the word',
      'lexicon:',
      '  - hearing and doing',
      '  - doers of the word',
      'anchors:',
      '  - ref: James 1:22',
      '    sources: [editorial]',
      '  - ref: Genesis 5:1',
      '    sources: [editorial]',
      '',
    ].join('\n'),
  },
  {
    path: 'ontology/concepts/refuge-in-trouble.yaml',
    contents: [
      'id: refuge-in-trouble',
      'label: Refuge in trouble',
      'lexicon:',
      '  - refuge',
      '  - shelter in the storm',
      'anchors:',
      '  - ref: Psalms 46:1',
      '    sources: [openbible, editorial]',
      '',
    ].join('\n'),
  },
] as const;

const SUBSET = JSON.stringify({
  $schema: 'verse-array-subset/1',
  selection: [
    { book: 'James', chapters: [1, 2], why: 'test' },
    { book: 'Psalms', chapters: [46], why: 'test' },
    { book: 'Exodus', chapters: [15], why: 'test' },
  ],
  verses: [],
}, null, 2);

function inputs(partial: Partial<DeriveUpdatesInputs> & { records?: readonly JudgmentRecordV2[] }): DeriveUpdatesInputs {
  const records = partial.records ?? [];
  return {
    judgmentsLog: records.map((record) => `${JSON.stringify(record)}\n`).join(''),
    casesLog: records.length === 0 ? null : casesFor(records),
    migrationManifestJson: null,
    updatesLog: '',
    replayIdentity: CURRENT,
    ontologyFiles: ONTOLOGY,
    goldenFixtureFiles: [],
    webSubsetJson: SUBSET,
    ...partial,
  };
}

function decideEvents(cards: readonly Pick<UpdateCard, 'cardId' | 'judgmentIds'>[], decisions: readonly { cardId: string; kind: 'card-approved' | 'card-declined' | 'card-parked'; answers?: Record<string, string>; reason?: string }[]): string {
  let minute = 0;
  const at = (): string => {
    minute += 1;
    return new Date(Date.parse('2026-08-11T09:00:00.000Z') + minute * 60_000).toISOString();
  };
  const lines: UpdatesEvent[] = [];
  for (const card of cards) {
    lines.push({
      schemaVersion: 1,
      eventId: stableUuid(`draft:${card.cardId}`),
      at: at(),
      reviewer: 'jesse',
      kind: 'card-drafted',
      cardId: card.cardId,
      judgmentIds: card.judgmentIds,
    } as UpdatesEvent);
  }
  for (const decision of decisions) {
    lines.push({
      schemaVersion: 1,
      eventId: stableUuid(`decide:${decision.cardId}:${decision.kind}`),
      at: at(),
      reviewer: 'jesse',
      kind: decision.kind,
      cardId: decision.cardId,
      ...(decision.answers === undefined ? {} : { answers: decision.answers }),
      ...(decision.reason === undefined ? {} : { reason: decision.reason }),
    } as UpdatesEvent);
  }
  return lines.map((line) => `${JSON.stringify(line)}\n`).join('');
}

describe('mapping table (V3): what each vote derives', () => {
  it('essential derives a question-free expectation card', () => {
    const record = v2({ judgmentId: 'e1', query: 'hearing and doing', action: 'essential', at: nextAt(), targetId: 'WEB:59001022', withinTop: 3 });
    const derivation = deriveUpdates(inputs({ records: [record] }));
    expect(derivation.cards).toHaveLength(1);
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('expectation');
    expect(card.derived.expectation).toEqual({ ref: 'James 1:22', withinTop: 3 });
    expect(card.question).toBeUndefined();
    expect(card.derived.chapterAdd).toBeUndefined();
    expect(card.state.decision).toBe('drafted');
  });

  it('missing derives an expectation, a chapter-add when outside the subset, and the one theme question', () => {
    const record = v2({ judgmentId: 'm1', query: 'who is like the lord', action: 'missing', at: nextAt(), reference: 'Deuteronomy 3:24', withinTop: 10, note: 'uses that exact wording' });
    const derivation = deriveUpdates(inputs({ records: [record] }));
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('missing-passage');
    expect(card.derived.expectation).toEqual({ ref: 'Deuteronomy 3:24', withinTop: 10 });
    expect(card.derived.chapterAdd).toEqual({ book: 'Deuteronomy', chapter: 3 });
    expect(card.question?.prompt).toBe('Which theme should carry this passage?');
    // Deterministic chips: lexicon token match ranks first.
    expect(card.question!.chips[0]).toMatchObject({ conceptId: 'gods-incomparability' });
  });

  it('missing inside the subset derives no chapter-add, and an anchored concept joins the chips', () => {
    const record = v2({ judgmentId: 'm2', query: 'who is like the lord', action: 'missing', at: nextAt(), reference: 'Exodus 15:11', withinTop: 10, note: 'exact wording' });
    const derivation = deriveUpdates(inputs({ records: [record] }));
    const card = derivation.cards[0]!;
    expect(card.derived.chapterAdd).toBeUndefined();
    const anchored = card.question!.chips.find((chip) => chip.conceptId === 'gods-incomparability');
    expect(anchored).toMatchObject({ alreadyAnchored: true });
  });

  it('a cross-chapter missing reference is routed to curation, never dropped and never a crash', () => {
    const record = v2({ judgmentId: 'm3', query: 'hearing and doing', action: 'missing', at: nextAt(), reference: 'James 1:1-2:5', withinTop: 10, note: 'a pericope' });
    const derivation = deriveUpdates(inputs({ records: [record] }));
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('missing-passage');
    expect(card.routed).toMatchObject({ to: 'concept-curation' });
    expect(card.derived).toEqual({});
  });

  it('irrelevant + lexical-noise derives a guard with the plain-words fallback and no data op', () => {
    const record = v2({ judgmentId: 'i1', query: 'hearing and doing', action: 'irrelevant', at: nextAt(), targetId: 'WEB:19046001', diagnosis: 'lexical-noise' });
    const derivation = deriveUpdates(inputs({ records: [record] }));
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('guard');
    expect(card.derived.guard).toEqual({ ref: 'Psalms 46:1', why: 'matched words, not meaning; judged not a fit for this query' });
    expect(card.derived.anchorRemove).toBeUndefined();
    expect(card.question).toBeUndefined();
  });

  it('irrelevant + wrong-anchor on an editorially-owned row derives guard-and-anchor with the remove', () => {
    const record = v2({
      judgmentId: 'i2', query: 'hearing and doing', action: 'irrelevant', at: nextAt(), targetId: 'WEB:1005001',
      diagnosis: 'wrong-anchor', conceptId: 'obedience-to-the-word', note: 'Genealogy; no thematic relation.',
    });
    const derivation = deriveUpdates(inputs({ records: [record] }));
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('guard-and-anchor');
    expect(card.derived.guard).toEqual({ ref: 'Genesis 5:1', why: 'Genealogy; no thematic relation.' });
    expect(card.derived.anchorRemove).toEqual({ conceptId: 'obedience-to-the-word', locator: 'Genesis 5:1' });
  });

  it('irrelevant + concept-misfire on a source-owned row derives the guard only, with the row explained', () => {
    const record = v2({
      judgmentId: 'i3', query: 'shelter in the storm', action: 'irrelevant', at: nextAt(), targetId: 'WEB:19046001',
      diagnosis: 'concept-misfire', conceptId: 'refuge-in-trouble', note: 'Not an answer for this query.',
    });
    const derivation = deriveUpdates(inputs({ records: [record] }));
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('guard');
    expect(card.derived.guard).toBeDefined();
    expect(card.derived.anchorRemove).toBeUndefined();
    expect(card.derived.sourceOwnedAnchor).toMatchObject({ conceptId: 'refuge-in-trouble', locator: 'Psalms 46:1' });
  });

  it('helpful derives nothing of its own and rides same-target cards as context', () => {
    const essential = v2({ judgmentId: 'h-e', query: 'hearing and doing', action: 'essential', at: nextAt(), targetId: 'WEB:59001022', withinTop: 3 });
    const helpful = v2({ judgmentId: 'h-h', query: 'hearing and doing', action: 'helpful', at: nextAt(), targetId: 'WEB:59001022' });
    const lonelyHelpful = v2({ judgmentId: 'h-l', query: 'hearing and doing', action: 'helpful', at: nextAt(), targetId: 'WEB:40007024' });
    const derivation = deriveUpdates(inputs({ records: [essential, helpful, lonelyHelpful] }));
    expect(derivation.cards).toHaveLength(1);
    const card = derivation.cards[0]!;
    expect(card.judgmentIds).toEqual([essential.judgmentId]);
    expect(card.contextJudgmentIds).toEqual([helpful.judgmentId]);
  });

  it('prefer derives a preferredOrder expectation with the observed window', () => {
    const record = v2({ judgmentId: 'p1', query: 'hearing and doing', action: 'prefer', at: nextAt(), preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:19046001' });
    const derivation = deriveUpdates(inputs({ records: [record] }));
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('expectation');
    expect(card.derived.preferredOrder).toEqual({ above: 'James 1:22', below: 'Psalms 46:1', withinTop: 10 });
  });
});

describe('supersession: only leaves derive', () => {
  it('a superseded judgment derives nothing; the superseding leaf derives a new card', () => {
    const first = v2({ judgmentId: 's1', query: 'hearing and doing', action: 'irrelevant', at: nextAt(), targetId: 'WEB:59001022', diagnosis: 'lexical-noise' });
    const second = v2({ judgmentId: 's2', query: 'hearing and doing', action: 'essential', at: nextAt(), targetId: 'WEB:59001022', withinTop: 3, supersedes: 's1' });
    const before = deriveUpdates(inputs({ records: [first] }));
    const after = deriveUpdates(inputs({ records: [first, second] }));
    expect(before.cards[0]!.kind).toBe('guard');
    expect(after.cards).toHaveLength(1);
    expect(after.cards[0]!.kind).toBe('expectation');
    expect(after.cards[0]!.judgmentIds).toEqual([second.judgmentId]);
    // The old card's content address no longer derives: a decision on it is
    // moot by construction (02.6) — no card in the new set carries its id.
    expect(after.cards.some((card) => card.cardId === before.cards[0]!.cardId)).toBe(false);
  });

  it('re-deriving the same log is idempotent: no duplicate cards, stable ids', () => {
    const records = [
      v2({ judgmentId: 'd1', query: 'hearing and doing', action: 'essential', at: nextAt(), targetId: 'WEB:59001022', withinTop: 3 }),
      v2({ judgmentId: 'd2', query: 'hearing and doing', action: 'irrelevant', at: nextAt(), targetId: 'WEB:19046001', diagnosis: 'lexical-noise' }),
    ];
    const one = deriveUpdates(inputs({ records }));
    const two = deriveUpdates(inputs({ records }));
    expect(two.cards.map((card) => card.cardId)).toEqual(one.cards.map((card) => card.cardId));
    expect(new Set(one.cards.map((card) => card.cardId)).size).toBe(one.cards.length);
  });
});

describe('conflicts (V10): presented, never resolved mechanically, never dropped', () => {
  it('a passage both expected and excluded becomes a conflict card and no ordinary cards', () => {
    const yes = v2({ judgmentId: 'c1', query: 'refuge in trouble', action: 'essential', at: nextAt(), targetId: 'WEB:19046001', withinTop: 3 });
    const no = v2({ judgmentId: 'c2', query: 'refuge in trouble', action: 'irrelevant', at: nextAt(), targetId: 'WEB:19046001', diagnosis: 'lexical-noise', note: 'not a fit' });
    const derivation = deriveUpdates(inputs({ records: [yes, no] }));
    expect(derivation.cards).toHaveLength(1);
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('conflict');
    expect(card.judgmentIds).toEqual([yes.judgmentId, no.judgmentId].sort());
    expect(card.conflict!.sides).toHaveLength(2);
    expect(card.conflict!.sides[0]!.summary).not.toBe(card.conflict!.sides[1]!.summary);
    expect(card.derived).toEqual({});
  });

  it('conflicting rank windows on the same reference conflict; other leaves on the query still derive', () => {
    const three = v2({ judgmentId: 'w1', query: 'refuge in trouble', action: 'missing', at: nextAt(), reference: 'Psalms 91:1', withinTop: 3, note: 'shelter of the Most High' });
    const ten = v2({ judgmentId: 'w2', query: 'refuge in trouble', action: 'missing', at: nextAt(), reference: 'Psalms 91:1', withinTop: 10, note: 'same passage, wider window' });
    const unrelated = v2({ judgmentId: 'w3', query: 'refuge in trouble', action: 'essential', at: nextAt(), targetId: 'WEB:19046001', withinTop: 3 });
    const derivation = deriveUpdates(inputs({ records: [three, ten, unrelated] }));
    const kinds = derivation.cards.map((card) => card.kind).sort();
    expect(kinds).toEqual(['conflict', 'expectation']);
    const conflict = derivation.cards.find((card) => card.kind === 'conflict')!;
    expect(conflict.judgmentIds).toEqual([three.judgmentId, ten.judgmentId].sort());
  });

  it('contradictory prefer pairs conflict', () => {
    const ab = v2({ judgmentId: 'pp1', query: 'refuge in trouble', action: 'prefer', at: nextAt(), preferredTargetId: 'WEB:19046001', otherTargetId: 'WEB:59001022' });
    const ba = v2({ judgmentId: 'pp2', query: 'refuge in trouble', action: 'prefer', at: nextAt(), preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:19046001', caseId: stableUuid('case:other') });
    // Distinct cases so the log accepts both as independent leaves.
    const derivation = deriveUpdates(inputs({ records: [ab, ba], casesLog: casesFor([ab, ba]) }));
    expect(derivation.cards.map((card) => card.kind)).toEqual(['conflict']);
  });
});

describe('ownership (V10): hand-written fixtures route to curation', () => {
  const handWritten = {
    path: 'eval/golden/hearing-and-doing.json',
    contents: `${JSON.stringify({ id: 'hearing-and-doing', query: 'hearing and doing', expectedTop: [], mustNotRank: [] }, null, 2)}\n`,
  };

  it('cards on a hand-written fixture are routed and the manifest builder refuses them', () => {
    const record = v2({ judgmentId: 'o1', query: 'hearing and doing', action: 'essential', at: nextAt(), targetId: 'WEB:59001022', withinTop: 3 });
    const derivation = deriveUpdates(inputs({ records: [record], goldenFixtureFiles: [handWritten] }));
    const card = derivation.cards[0]!;
    expect(card.routed).toMatchObject({ to: 'concept-curation' });
    const withApproval = deriveUpdates(inputs({
      records: [record],
      goldenFixtureFiles: [handWritten],
      updatesLog: decideEvents(derivation.cards, [{ cardId: card.cardId, kind: 'card-approved' }]),
    }));
    expect(() => buildUpdatesManifest(withApproval, inputs({ records: [record], goldenFixtureFiles: [handWritten] }), { trainId: 'train-owned' }))
      .toThrow(UpdatesManifestError);
  });

  it('an owned fixture already carrying the assertion marks the card already-in-place', () => {
    const owned = {
      path: 'eval/golden/hearing-and-doing.json',
      contents: `${JSON.stringify({
        id: 'hearing-and-doing', generatedBy: 'workbench', status: 'pending', query: 'hearing and doing',
        expectedTop: [{ ref: 'James 1:22', withinTop: 3 }], mustNotRank: [],
      }, null, 2)}\n`,
    };
    const record = v2({ judgmentId: 'o2', query: 'hearing and doing', action: 'essential', at: nextAt(), targetId: 'WEB:59001022', withinTop: 3 });
    const derivation = deriveUpdates(inputs({ records: [record], goldenFixtureFiles: [owned] }));
    expect(derivation.cards[0]!.alreadyInPlace).toBe(true);
    expect(derivation.cards[0]!.routed).toBeUndefined();
  });
});

describe('identity pre-check (§03.5): a pure triple comparison, split by what the vote derives', () => {
  it('intent classes derive normally with per-dimension notes', () => {
    const record = v2({ judgmentId: 'id1', query: 'hearing and doing', action: 'essential', at: nextAt(), targetId: 'WEB:59001022', withinTop: 3, ...OLD_LAYER });
    const derivation = deriveUpdates(inputs({ records: [record] }));
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('expectation');
    expect(card.preCheck).toBe('identity-moved');
    expect(card.identityNotes).toEqual([
      { dimension: 'layerFingerprint', recorded: 'layer-old', current: 'layer-current' },
    ]);
    expect(card.derived.expectation).toBeDefined();
  });

  it('an identity-moved prefer vote derives a re-confirmation card only', () => {
    const record = v2({ judgmentId: 'id2', query: 'hearing and doing', action: 'prefer', at: nextAt(), preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:19046001', ...OLD_LAYER });
    const derivation = deriveUpdates(inputs({ records: [record] }));
    expect(derivation.cards.map((card) => card.kind)).toEqual(['re-confirmation']);
    expect(derivation.cards[0]!.derived).toEqual({});
  });

  it('an identity-moved wrong-anchor vote derives TWO cards: the guard and the anchor-arm re-confirmation', () => {
    const record = v2({
      judgmentId: 'id3', query: 'hearing and doing', action: 'irrelevant', at: nextAt(), targetId: 'WEB:1005001',
      diagnosis: 'wrong-anchor', conceptId: 'obedience-to-the-word', note: 'Genealogy; no thematic relation.', ...OLD_LAYER,
    });
    const derivation = deriveUpdates(inputs({ records: [record] }));
    const kinds = derivation.cards.map((card) => card.kind).sort();
    expect(kinds).toEqual(['guard', 're-confirmation']);
    const guard = derivation.cards.find((card) => card.kind === 'guard')!;
    // The guard still derives — never withheld — but the anchor edit waits.
    expect(guard.derived.guard).toBeDefined();
    expect(guard.derived.anchorRemove).toBeUndefined();
    const reconfirm = derivation.cards.find((card) => card.kind === 're-confirmation')!;
    // Distinct kinds, hence distinct content addresses, over one leaf set.
    expect(reconfirm.judgmentIds).toEqual(guard.judgmentIds);
    expect(reconfirm.cardId).not.toBe(guard.cardId);
  });

  it('an identity-moved lexical-noise vote derives the guard card alone', () => {
    const record = v2({ judgmentId: 'id4', query: 'hearing and doing', action: 'irrelevant', at: nextAt(), targetId: 'WEB:19046001', diagnosis: 'lexical-noise', ...OLD_LAYER });
    const derivation = deriveUpdates(inputs({ records: [record] }));
    expect(derivation.cards.map((card) => card.kind)).toEqual(['guard']);
    expect(derivation.cards[0]!.preCheck).toBe('identity-moved');
  });

  it('the pre-check verdict is frozen into cardRevision, and decisions never change it', () => {
    const record = v2({ judgmentId: 'id5', query: 'hearing and doing', action: 'essential', at: nextAt(), targetId: 'WEB:59001022', withinTop: 3 });
    const base = deriveUpdates(inputs({ records: [record] }));
    const card = base.cards[0]!;
    const decided = deriveUpdates(inputs({
      records: [record],
      updatesLog: decideEvents(base.cards, [{ cardId: card.cardId, kind: 'card-approved' }]),
    }));
    // A decide changes decision state only — same cardId, same cardRevision.
    expect(decided.cards[0]!.cardId).toBe(card.cardId);
    expect(decided.cards[0]!.cardRevision).toBe(card.cardRevision);
    expect(decided.cards[0]!.state.decision).toBe('approved');
  });
});

describe('the legacy re-confirmation card (§07.2) — the ONLY surface of the v1 lines', () => {
  async function legacyTrio(): Promise<Pick<DeriveUpdatesInputs, 'judgmentsLog' | 'casesLog' | 'migrationManifestJson'>> {
    return {
      judgmentsLog: await readFile(path.join(REPO, 'workbench', 'judgments.jsonl'), 'utf8'),
      casesLog: await readFile(path.join(REPO, 'workbench', 'cases.jsonl'), 'utf8'),
      migrationManifestJson: await readFile(path.join(REPO, 'workbench', 'legacy', 'migration-manifest.json'), 'utf8'),
    };
  }

  it('the real 3-vote log derives exactly one re-confirmation card and zero operations', async () => {
    const trio = await legacyTrio();
    const derivation = deriveUpdates(inputs({ ...trio }));
    expect(derivation.cards).toHaveLength(1);
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('re-confirmation');
    expect(card.query).toBe('Who is like the Lord?');
    expect(card.targetKey).toBe(queryKey('Who is like the Lord?'));
    // Its address takes the manifest's sorted per-line hashes as judgmentIds.
    const manifest = JSON.parse(trio.migrationManifestJson!) as { cases: { entries: { lineSha256: string }[] }[] };
    const hashes = manifest.cases[0]!.entries.map((entry) => entry.lineSha256).sort();
    expect(card.judgmentIds).toEqual(hashes);
    expect(card.cardId).toBe(computeCardId('re-confirmation', card.query, card.targetKey, hashes));
    expect(card.derived).toEqual({});
    expect(card.votes).toHaveLength(3);
    // No v1 line reaches an operation source: nothing op-bearing derives.
    expect(derivation.tally).toEqual({ drafted: 0, approved: 0, declined: 0, parked: 0 });
  });

  it('terminates on judgment EXISTENCE: any v2 vote on the query ends the card, even a superseded one', async () => {
    const trio = await legacyTrio();
    const legacyCaseId = (JSON.parse(trio.casesLog!.split('\n')[0]!) as { caseId: string }).caseId;
    const fresh = {
      ...v2({ judgmentId: 'fresh1', query: 'Who is like the Lord?', action: 'helpful', at: nextAt(), targetId: 'WEB:2015011' }),
      caseId: legacyCaseId,
    };
    const derivation = deriveUpdates(inputs({
      ...trio,
      judgmentsLog: `${trio.judgmentsLog}${JSON.stringify(fresh)}\n`,
    }));
    expect(derivation.cards.some((card) => card.legacy !== undefined)).toBe(false);
  });

  it('a declined legacy card keeps re-deriving declined (on record, rendered nowhere op-bearing)', async () => {
    const trio = await legacyTrio();
    const base = deriveUpdates(inputs({ ...trio }));
    const card = base.cards[0]!;
    const declined = deriveUpdates(inputs({
      ...trio,
      updatesLog: decideEvents(base.cards, [{ cardId: card.cardId, kind: 'card-declined', reason: 'old suggestions, moving on' }]),
    }));
    expect(declined.cards[0]!.state).toMatchObject({ decision: 'declined', declineReason: 'old suggestions, moving on' });
  });
});

describe('determinism (§03.3): byte-identical output, permuted read order, full snapshot', () => {
  /**
   * The full-snapshot fixture the Phase-1 AC names: real legacy trio, v2
   * votes, decisions in updates.jsonl, and one prior-train outcome set
   * (sealed manifest + pinned verified report) exercising the §03.8
   * stop conversion.
   */
  async function fullSnapshot(): Promise<{ base: DeriveUpdatesInputs; trainId: string }> {
    const trio = {
      judgmentsLog: await readFile(path.join(REPO, 'workbench', 'judgments.jsonl'), 'utf8'),
      casesLog: await readFile(path.join(REPO, 'workbench', 'cases.jsonl'), 'utf8'),
      migrationManifestJson: await readFile(path.join(REPO, 'workbench', 'legacy', 'migration-manifest.json'), 'utf8'),
    };
    // With the closed migration manifest present, cases.jsonl must stay the
    // byte-canonical legacy output — so the v2 votes reuse the legacy case.
    const legacyCaseId = '3d890d77-f551-4e18-9a79-64b5d6f2e3c5';
    const guardVote = v2({ judgmentId: 'full-g', query: 'Who is like the Lord?', caseId: legacyCaseId, action: 'irrelevant', at: '2026-08-12T10:00:00.000Z', diagnosis: 'lexical-noise', targetId: 'WEB:19046001' });
    const essentialVote = v2({ judgmentId: 'full-e', query: 'Who is like the Lord?', caseId: legacyCaseId, action: 'essential', at: '2026-08-12T10:01:00.000Z', targetId: 'WEB:2015011', withinTop: 3 });
    const judgmentsLog = `${trio.judgmentsLog}${JSON.stringify(guardVote)}\n${JSON.stringify(essentialVote)}\n`;
    const casesLog = trio.casesLog;

    // First derivation: draft + approve the guard card, seal it, stop the
    // train verify-failed with a pinned report naming the fixture slug.
    const first = deriveUpdates(inputs({
      judgmentsLog,
      casesLog,
      migrationManifestJson: trio.migrationManifestJson,
    }));
    const guardCard = first.cards.find((card) => card.kind === 'guard')!;
    const expectationCard = first.cards.find((card) => card.kind === 'expectation')!;
    const trainId = 'train-2026-08-12-a';
    const preSeal = decideEvents(first.cards, [
      { cardId: guardCard.cardId, kind: 'card-approved' },
      { cardId: expectationCard.cardId, kind: 'card-approved' },
    ]);
    const sealedDerivation = deriveUpdates(inputs({
      judgmentsLog, casesLog, migrationManifestJson: trio.migrationManifestJson, updatesLog: preSeal,
    }));
    const manifestResult = buildUpdatesManifest(sealedDerivation, inputs({
      judgmentsLog, casesLog, migrationManifestJson: trio.migrationManifestJson,
    }), { trainId });
    const sealDigest = computeSealDigest({
      judgmentIds: manifestResult.judgmentIds,
      cardIds: manifestResult.cardIds,
      operations: manifestResult.manifest.operations,
      replayIdentity: CURRENT,
    });
    const report = JSON.stringify({
      payload: {
        gates: [{
          gate: 'G3',
          status: 'fail',
          findings: [{ message: 'fixture "who-is-like-the-lord" still failing after the train', subjects: ['who-is-like-the-lord'] }],
        }],
      },
    });
    const trainEvents: UpdatesEvent[] = [
      {
        schemaVersion: 1, eventId: stableUuid('full:open'), at: '2026-08-12T11:00:00.000Z', reviewer: 'jesse',
        kind: 'train-opened', trainId, flavor: 'guard',
      },
      {
        schemaVersion: 1, eventId: stableUuid('full:seal'), at: '2026-08-12T11:01:00.000Z', reviewer: 'jesse',
        kind: 'train-sealed', trainId, sealDigest,
        cardIds: manifestResult.cardIds, judgmentIds: manifestResult.judgmentIds, replayIdentity: CURRENT,
      },
      {
        schemaVersion: 1, eventId: stableUuid('full:stop'), at: '2026-08-12T11:30:00.000Z', reviewer: 'jesse',
        kind: 'train-stopped', trainId, reason: 'verify-failed', reportDigest: sha256Text(report),
      },
    ];
    const updatesLog = `${preSeal}${trainEvents.map((event) => `${JSON.stringify(event)}\n`).join('')}`;
    return {
      trainId,
      base: inputs({
        judgmentsLog,
        casesLog,
        migrationManifestJson: trio.migrationManifestJson,
        updatesLog,
        priorTrainArtifacts: [{
          trainId,
          sealedManifestJson: JSON.stringify(manifestResult.manifest),
          verifiedReportJson: report,
        }],
      }),
    };
  }

  function sha256Text(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  it('derives byte-identical cards and an identical manifest digest on repeated runs', async () => {
    const { base, trainId } = await fullSnapshot();
    const one = deriveUpdates(base);
    const two = deriveUpdates(base);
    expect(JSON.stringify(two)).toBe(JSON.stringify(one));
    // The stop conversion fired: a needs-engineering card converted from the
    // guard card's recorded finding, beside the still-deriving guard card.
    const kinds = one.cards.map((card) => card.kind);
    expect(kinds).toContain('needs-engineering');
    expect(kinds).toContain('guard');
    const engineering = one.cards.find((card) => card.kind === 'needs-engineering')!;
    expect(engineering.engineering).toMatchObject({ trainId, stopReason: 'verify-failed' });
    expect(engineering.state.decision).toBe('drafted');
    // Same manifest digest both runs (the guard/expectation cards released by
    // the stop still fold to approved, so a manifest is buildable).
    const digestOne = buildUpdatesManifest(one, base, { trainId: 'train-next' }).digest;
    const digestTwo = buildUpdatesManifest(two, base, { trainId: 'train-next' }).digest;
    expect(digestTwo).toBe(digestOne);
  });

  it('permuting input-file read order changes nothing', async () => {
    const { base } = await fullSnapshot();
    const permuted: DeriveUpdatesInputs = {
      ...base,
      ontologyFiles: [...base.ontologyFiles].reverse(),
      goldenFixtureFiles: [...base.goldenFixtureFiles].reverse(),
      priorTrainArtifacts: [...(base.priorTrainArtifacts ?? [])].reverse(),
    };
    expect(JSON.stringify(deriveUpdates(permuted))).toBe(JSON.stringify(deriveUpdates(base)));
  });

  it('fails closed on an unverifiable prior-train pin: no conversion, reported honestly', async () => {
    const { base, trainId } = await fullSnapshot();
    const tampered: DeriveUpdatesInputs = {
      ...base,
      priorTrainArtifacts: [{
        trainId,
        sealedManifestJson: base.priorTrainArtifacts![0]!.sealedManifestJson,
        verifiedReportJson: '{"payload":{"gates":[]}}',
      }],
    };
    const derivation = deriveUpdates(tampered);
    expect(derivation.cards.some((card) => card.kind === 'needs-engineering')).toBe(false);
    expect(derivation.unverifiablePriorTrains).toEqual([
      { trainId, reason: 'verified report missing or does not match its pinned digest' },
    ]);
  });

  it('a no-measurable-effect stop parks the unchanged card by default; a post-stop approve lifts it', async () => {
    const { base, trainId } = await fullSnapshot();
    const noEffect = base.updatesLog.replace('"reason":"verify-failed"', '"reason":"no-measurable-effect"');
    const derivation = deriveUpdates({ ...base, updatesLog: noEffect });
    const guard = derivation.cards.find((card) => card.kind === 'guard')!;
    // Sealed in the stopped attempt, unchanged operations, same identity, no
    // post-stop decide: parked by default — a DERIVED state; the log still
    // folds to approved.
    expect(guard.parkedByDefault).toBe(true);
    expect(guard.state.decision).toBe('approved');
    // FM-5's explicit human re-approve postdating the stop restores it.
    const reApprove = {
      schemaVersion: 1, eventId: stableUuid('fm5:reapprove'), at: '2026-08-12T12:00:00.000Z', reviewer: 'jesse',
      kind: 'card-approved', cardId: guard.cardId,
    };
    const lifted = deriveUpdates({ ...base, updatesLog: `${noEffect}${JSON.stringify(reApprove)}\n` });
    expect(lifted.cards.find((card) => card.cardId === guard.cardId)!.parkedByDefault).toBeUndefined();
  });
});

describe('manifest emission: approved cards → the pipeline\'s own vocabulary', () => {
  function approvedScenario(answers?: Record<string, string>): { derivation: ReturnType<typeof deriveUpdates>; base: DeriveUpdatesInputs } {
    const missing = v2({ judgmentId: 'mm1', query: 'who is like the lord', action: 'missing', at: nextAt(), reference: 'Deuteronomy 3:24', withinTop: 10, note: 'uses that exact wording' });
    const guard = v2({ judgmentId: 'mm2', query: 'who is like the lord', action: 'irrelevant', at: nextAt(), targetId: 'WEB:19046001', diagnosis: 'lexical-noise' });
    const base = inputs({ records: [missing, guard] });
    const first = deriveUpdates(base);
    const missingCard = first.cards.find((card) => card.kind === 'missing-passage')!;
    const guardCard = first.cards.find((card) => card.kind === 'guard')!;
    const updatesLog = decideEvents(first.cards, [
      { cardId: missingCard.cardId, kind: 'card-approved', ...(answers === undefined ? {} : { answers }) },
      { cardId: guardCard.cardId, kind: 'card-approved' },
    ]);
    return { derivation: deriveUpdates({ ...base, updatesLog }), base };
  }

  it('round-trips through the strict parser with human-confirmed provenance on every operation', () => {
    const { derivation, base } = approvedScenario({ theme: 'gods-incomparability' });
    const result = buildUpdatesManifest(derivation, base, { trainId: 'train-manifest-a' });
    const { manifest } = result;
    expect(manifest.proposalId).toBe('train-manifest-a');
    expect(manifest.fixtureId).toBe('who-is-like-the-lord');
    const types = manifest.operations.map((operation) => operation.type).sort();
    expect(types).toEqual(['editorial-anchor-add', 'fixture-corpus-chapter-add', 'golden-fixture-upsert']);
    for (const operation of manifest.operations) {
      expect(operation.provenance).toMatchObject({ source: 'editorial', confirmed: true, reviewer: 'jesse' });
      expect(operation.provenance.evidence).toContain('judgment');
      expect(operation.reason.length).toBeGreaterThanOrEqual(12);
    }
    // A6: the answered theme upgrades the expectation to assert the reason.
    const upsert = manifest.operations.find((operation) => operation.type === 'golden-fixture-upsert')!;
    const fixture = upsert.fixture as { expectedTop: Record<string, unknown>[]; mustNotRank: Record<string, unknown>[] };
    expect(fixture.expectedTop).toEqual([{
      ref: 'Deuteronomy 3:24', withinTop: 10,
      requiredReasonFamily: 'concept_anchor', requiredReasonLabel: "Theme: God's incomparability",
    }]);
    expect(fixture.mustNotRank).toEqual([{ ref: 'Psalms 46:1', why: 'matched words, not meaning; judged not a fit for this query' }]);
    const anchor = manifest.operations.find((operation) => operation.type === 'editorial-anchor-add')!;
    expect(anchor).toMatchObject({ conceptId: 'gods-incomparability', anchor: { locator: 'Deuteronomy 3:24', weight: 1, sources: ['editorial'] } });
    // caseIds are exactly the votes' review cases.
    expect(manifest.caseIds).toEqual([stableUuid('case:who is like the lord')]);
    expect(result.digest).toMatch(/^[0-9a-f]{64}$/);
  });

  it('"None of these — needs a new theme" ships the answer-sheet line alone: no anchor op', () => {
    const { derivation, base } = approvedScenario({ theme: THEME_ANSWER_NONE });
    const { manifest } = buildUpdatesManifest(derivation, base, { trainId: 'train-manifest-b' });
    expect(manifest.operations.some((operation) => operation.type === 'editorial-anchor-add')).toBe(false);
    // The presence-only expectation asserts no reason the human never judged.
    const upsert = manifest.operations.find((operation) => operation.type === 'golden-fixture-upsert')!;
    const fixture = upsert.fixture as { expectedTop: Record<string, unknown>[] };
    expect(fixture.expectedTop).toEqual([{ ref: 'Deuteronomy 3:24', withinTop: 10 }]);
  });

  it('refuses an approved question card whose answer is missing', () => {
    const { derivation, base } = approvedScenario(undefined);
    expect(() => buildUpdatesManifest(derivation, base, { trainId: 'train-manifest-c' }))
      .toThrow(/must carry its answer/);
  });

  it('refuses a multi-query approval set until the 02.7 amendment (single-query trains)', () => {
    const one = v2({ judgmentId: 'sq1', query: 'hearing and doing', action: 'essential', at: nextAt(), targetId: 'WEB:59001022', withinTop: 3 });
    const two = v2({ judgmentId: 'sq2', query: 'refuge in trouble', action: 'essential', at: nextAt(), targetId: 'WEB:19046001', withinTop: 3 });
    const base = inputs({ records: [one, two] });
    const first = deriveUpdates(base);
    const updatesLog = decideEvents(first.cards, first.cards.map((card) => ({ cardId: card.cardId, kind: 'card-approved' as const })));
    const derivation = deriveUpdates({ ...base, updatesLog });
    expect(() => buildUpdatesManifest(derivation, base, { trainId: 'train-multi' }))
      .toThrow(/one update covers one search at a time/);
  });

  it('declined and parked cards never board; a guard-and-anchor approval emits the remove op', () => {
    const guardAnchor = v2({
      judgmentId: 'ga1', query: 'hearing and doing', action: 'irrelevant', at: nextAt(), targetId: 'WEB:1005001',
      diagnosis: 'wrong-anchor', conceptId: 'obedience-to-the-word', note: 'Genealogy; no thematic relation.',
    });
    const parked = v2({ judgmentId: 'ga2', query: 'hearing and doing', action: 'essential', at: nextAt(), targetId: 'WEB:59001022', withinTop: 3 });
    const base = inputs({ records: [guardAnchor, parked] });
    const first = deriveUpdates(base);
    const anchorCard = first.cards.find((card) => card.kind === 'guard-and-anchor')!;
    const parkedCard = first.cards.find((card) => card.kind === 'expectation')!;
    const updatesLog = decideEvents(first.cards, [
      { cardId: anchorCard.cardId, kind: 'card-approved' },
      { cardId: parkedCard.cardId, kind: 'card-parked' },
    ]);
    const derivation = deriveUpdates({ ...base, updatesLog });
    const { manifest, cardIds } = buildUpdatesManifest(derivation, base, { trainId: 'train-remove' });
    expect(cardIds).toEqual([anchorCard.cardId]);
    const remove = manifest.operations.find((operation) => operation.type === 'editorial-anchor-remove')!;
    expect(remove).toMatchObject({ conceptId: 'obedience-to-the-word', locator: 'Genesis 5:1', currentSources: ['editorial'] });
    const upsert = manifest.operations.find((operation) => operation.type === 'golden-fixture-upsert')!;
    const fixture = upsert.fixture as { expectedTop: unknown[]; mustNotRank: unknown[] };
    // The parked expectation is absent; the approved guard is present.
    expect(fixture.expectedTop).toEqual([]);
    expect(fixture.mustNotRank).toHaveLength(1);
  });
});
