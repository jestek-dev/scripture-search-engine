/**
 * D16 — the V6 seal-time staleness replay (votes-to-engine plan §02.5, §8.6).
 *
 * The deriver stays pure: it NAMES what to replay (`replayRequests`, from
 * identity-moved contributing votes) and, when the caller hands the
 * observations back (`replayObservations`), sorts each covered card into one
 * of §02.5's dispositions — 1 already-achieved (drop the data arms, keep the
 * fixture guard, auto-resolve the copy), 2 materially-equivalent (derive
 * fresh, record the machine-supported reconfirmation), 3 materially-changed
 * (derived `stale` flag, route to re-confirmation) — plus the corpus row's
 * resolution failure (FM-2: evidence-only, verbatim sentence).
 *
 * Staleness is the NORMAL path, not an edge case: the layerFingerprint moved
 * 4 times in ~11.5 hours during active curation (r4 §6); the cadence test
 * below encodes exactly that shape.
 */
import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  buildUpdatesManifest,
  deriveUpdates,
  replayAlreadyAchievedReceipt,
  REPLAY_CHANGED_NOTE,
  REPLAY_OFFENDER_GONE_NOTE,
  REPLAY_RECONFIRMED_NOTE,
  REPLAY_UNRESOLVED_REFERENCE_NOTE,
  type DeriveUpdatesInputs,
  type ReplayIdentity,
  type ReplayProbeResult,
  type UpdateCard,
} from '../src/deriveUpdates.js';
import { deriveWithReplay } from '../src/updatesOperations.js';
import type { JudgmentRecordV2 } from '../src/judgments.js';

const CURRENT: ReplayIdentity = {
  engineVersion: '0.14.0-test',
  corpusFingerprint: 'corpus-current',
  layerFingerprint: 'layer-current',
};
const OLD_LAYER = { layerFingerprint: 'layer-old' };
const OLD_CORPUS = { corpusFingerprint: 'corpus-old' };

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
      'anchors:',
      '  - ref: James 1:22',
      '    sources: [editorial]',
      '  - ref: Genesis 5:1',
      '    sources: [editorial]',
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

function observation(query: string, rankedRefs: readonly string[], unresolvedRefs: readonly string[] = []): ReplayProbeResult {
  return { query, rankedRefs: [...rankedRefs], unresolvedRefs: [...unresolvedRefs] };
}

describe('replay requests: the deriver names what to re-run', () => {
  it('requests exactly the identity-moved contributing queries with their judged refs', () => {
    const moved = v2({ judgmentId: 'rq1', query: 'who is like the lord', action: 'missing', at: nextAt(), reference: 'Deuteronomy 3:24', withinTop: 10, note: 'wording', ...OLD_LAYER });
    const current = v2({ judgmentId: 'rq2', query: 'hearing and doing', action: 'essential', at: nextAt(), targetId: 'WEB:59001022', withinTop: 3 });
    const derivation = deriveUpdates(inputs({ records: [moved, current] }));
    expect(derivation.replayRequests).toEqual([
      { query: 'who is like the lord', refs: ['Deuteronomy 3:24'] },
    ]);
  });

  it('an all-current log requests nothing — at an unmoved identity the recorded observation IS the replay', () => {
    const current = v2({ judgmentId: 'rq3', query: 'hearing and doing', action: 'essential', at: nextAt(), targetId: 'WEB:59001022', withinTop: 3 });
    expect(deriveUpdates(inputs({ records: [current] })).replayRequests).toEqual([]);
  });
});

describe('disposition 1 — expectation already achieved (drop the data op, keep the guard)', () => {
  const vote = (): JudgmentRecordV2 => v2({
    judgmentId: 'd1', query: 'who is like the lord', action: 'missing', at: '2026-08-10T10:01:00.000Z',
    reference: 'Deuteronomy 3:24', withinTop: 10, note: 'uses that exact wording', ...OLD_LAYER,
  });

  it('the card AUTO-RESOLVES: data arms drop, the fixture line stays, no decision is demanded', () => {
    const derivation = deriveUpdates(inputs({
      records: [vote()],
      replayObservations: [observation('who is like the lord', ['Exodus 15:11', 'Deuteronomy 3:24'])],
    }));
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('missing-passage');
    // §4.3's plan-fixed receipt, verbatim with the '{query}' substitution.
    expect(card.replay).toEqual({ disposition: 'already-achieved', note: replayAlreadyAchievedReceipt('who is like the lord') });
    expect(card.replay!.note).toBe(
      "Already achieved — your call for 'who is like the lord' is now true in search, so this update just pins it in the answer sheet.",
    );
    // Derived the parkedByDefault way — never stored, no decide event.
    expect(card.autoResolved).toBe(true);
    expect(card.state.decision).toBe('drafted');
    // It never renders as a to-do: it counts in NO tally bucket.
    expect(derivation.tally).toEqual({ drafted: 0, approved: 0, declined: 0, parked: 0 });
    // The fixture guard pinning the win survives; every data arm is dropped.
    expect(card.derived.expectation).toEqual({ ref: 'Deuteronomy 3:24', withinTop: 10 });
    expect(card.derived.chapterAdd).toBeUndefined();
    expect(card.derived.anchorAddOnAnswer).toBeUndefined();
    expect(card.question).toBeUndefined();
    expect(card.stale).toBeUndefined();
  });

  it('the kept fixture pin boards the sealing update WITHOUT a decide event — only the answer-sheet line', () => {
    const base = inputs({
      records: [vote()],
      replayObservations: [observation('who is like the lord', ['Deuteronomy 3:24'])],
    });
    const derivation = deriveUpdates(base);
    expect(derivation.cards[0]!.autoResolved).toBe(true);
    // No approve event, no decide of any kind: the auto-resolved card still
    // rides — "this update just pins it in the answer sheet" (§02.5/§4.3).
    const { manifest, cardIds } = buildUpdatesManifest(derivation, base, { trainId: 'train-0001' });
    expect(cardIds).toEqual([derivation.cards[0]!.cardId]);
    expect(manifest.operations.map((operation) => operation.type)).toEqual(['golden-fixture-upsert']);
  });

  it('once sealed aboard, the auto-resolved card is frozen (sealedInTrain) and never re-boards', () => {
    const base = inputs({
      records: [vote()],
      replayObservations: [observation('who is like the lord', ['Deuteronomy 3:24'])],
    });
    const first = deriveUpdates(base);
    const cardId = first.cards[0]!.cardId;
    const at = '2026-08-11T09:05:00.000Z';
    const sealedLog = [
      // The seal appends the lazy card-drafted line itself (no decide ever
      // ran) — mirrored from trainRunner's seal, which the store requires.
      { schemaVersion: 1, eventId: stableUuid(`draft:${cardId}`), at, reviewer: 'jesse', kind: 'card-drafted', cardId, judgmentIds: first.cards[0]!.judgmentIds },
      { schemaVersion: 1, eventId: stableUuid('open:train-0001'), at, reviewer: 'jesse', kind: 'train-opened', trainId: 'train-0001', flavor: 'guard' },
      { schemaVersion: 1, eventId: stableUuid('seal:train-0001'), at, reviewer: 'jesse', kind: 'train-sealed', trainId: 'train-0001', sealDigest: 'c'.repeat(64), cardIds: [cardId], judgmentIds: first.cards[0]!.judgmentIds, replayIdentity: CURRENT },
    ].map((event) => `${JSON.stringify(event)}\n`).join('');
    const withSeal = { ...base, updatesLog: sealedLog };
    const sealed = deriveUpdates(withSeal);
    const card = sealed.cards.find((candidate) => candidate.cardId === cardId)!;
    // The seal freeze rides the derived card even though NO decide event
    // exists (the fold's decisions map never saw this card).
    expect(card.state.sealedInTrain).toBe('train-0001');
    expect(card.autoResolved).toBe(true);
    expect(() => buildUpdatesManifest(sealed, withSeal, { trainId: 'train-0002' }))
      .toThrowError('No approved cards carry a change to seal.');
  });

  it('a recorded human decline still wins — the derived default never overrides an explicit no', () => {
    const base = inputs({
      records: [vote()],
      replayObservations: [observation('who is like the lord', ['Deuteronomy 3:24'])],
    });
    const first = deriveUpdates(base);
    const cardId = first.cards[0]!.cardId;
    const at = '2026-08-11T09:01:00.000Z';
    const declineLog = [
      { schemaVersion: 1, eventId: stableUuid(`draft:${cardId}`), at, reviewer: 'jesse', kind: 'card-drafted', cardId, judgmentIds: first.cards[0]!.judgmentIds },
      { schemaVersion: 1, eventId: stableUuid(`decline:${cardId}`), at, reviewer: 'jesse', kind: 'card-declined', cardId, reason: 'not this one' },
    ].map((event) => `${JSON.stringify(event)}\n`).join('');
    const withDecline = { ...base, updatesLog: declineLog };
    const declined = deriveUpdates(withDecline);
    const card = declined.cards.find((candidate) => candidate.cardId === cardId)!;
    expect(card.autoResolved).toBeUndefined();
    expect(card.state.decision).toBe('declined');
    expect(() => buildUpdatesManifest(declined, withDecline, { trainId: 'train-0001' }))
      .toThrowError('No approved cards carry a change to seal.');
  });

  it('without the observation the same vote keeps its data arms (the Phase 2–3 substitute)', () => {
    const derivation = deriveUpdates(inputs({ records: [vote()] }));
    const card = derivation.cards[0]!;
    expect(card.replay).toBeUndefined();
    expect(card.derived.chapterAdd).toEqual({ book: 'Deuteronomy', chapter: 3 });
    expect(card.question).toBeDefined();
  });
});

describe('disposition 2 — materially equivalent (derive fresh, reconfirmation recorded)', () => {
  it('the missing target still fails its window: full derive plus the machine-supported reconfirmation', () => {
    const vote = v2({
      judgmentId: 'd2', query: 'who is like the lord', action: 'missing', at: nextAt(),
      reference: 'Deuteronomy 3:24', withinTop: 10, note: 'wording', ...OLD_LAYER,
    });
    const derivation = deriveUpdates(inputs({
      records: [vote],
      replayObservations: [observation('who is like the lord', ['Exodus 15:11', 'Psalms 46:1'])],
    }));
    const card = derivation.cards[0]!;
    expect(card.replay).toEqual({ disposition: 'materially-equivalent', note: REPLAY_RECONFIRMED_NOTE });
    expect(card.derived.expectation).toEqual({ ref: 'Deuteronomy 3:24', withinTop: 10 });
    expect(card.derived.chapterAdd).toEqual({ book: 'Deuteronomy', chapter: 3 });
    expect(card.question).toBeDefined();
    expect(card.stale).toBeUndefined();
  });

  it('the judged offender still ranks: the anchor arm proceeds instead of routing to re-confirmation', () => {
    const vote = v2({
      judgmentId: 'd2g', query: 'hearing and doing', action: 'irrelevant', at: nextAt(), targetId: 'WEB:1005001',
      diagnosis: 'wrong-anchor', conceptId: 'obedience-to-the-word', note: 'Genealogy; no thematic relation.', ...OLD_LAYER,
    });
    const derivation = deriveUpdates(inputs({
      records: [vote],
      replayObservations: [observation('hearing and doing', ['James 1:22', 'Genesis 5:1'])],
    }));
    expect(derivation.cards).toHaveLength(1);
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('guard-and-anchor');
    expect(card.derived.anchorRemove).toEqual({ conceptId: 'obedience-to-the-word', locator: 'Genesis 5:1' });
    expect(card.replay).toEqual({ disposition: 'materially-equivalent', note: REPLAY_RECONFIRMED_NOTE });
  });

  it('a preferred pair that still both rank derives fresh with the reconfirmation, not a re-confirmation card', () => {
    const vote = v2({
      judgmentId: 'd2p', query: 'hearing and doing', action: 'prefer', at: nextAt(),
      preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:19046001', ...OLD_LAYER,
    });
    const derivation = deriveUpdates(inputs({
      records: [vote],
      replayObservations: [observation('hearing and doing', ['James 1:22', 'Psalms 46:1'])],
    }));
    expect(derivation.cards).toHaveLength(1);
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('expectation');
    expect(card.derived.preferredOrder).toEqual({ above: 'James 1:22', below: 'Psalms 46:1', withinTop: 10 });
    expect(card.replay).toEqual({ disposition: 'materially-equivalent', note: REPLAY_RECONFIRMED_NOTE });
  });
});

describe('disposition 3 — materially changed (stale flag, re-confirmation route)', () => {
  it('the judged offender fell out of the ranking: the guard is STILL derived (regression protection), the anchor arm routes stale', () => {
    const vote = v2({
      judgmentId: 'd3', query: 'hearing and doing', action: 'irrelevant', at: nextAt(), targetId: 'WEB:1005001',
      diagnosis: 'wrong-anchor', conceptId: 'obedience-to-the-word', note: 'Genealogy; no thematic relation.', ...OLD_LAYER,
    });
    const derivation = deriveUpdates(inputs({
      records: [vote],
      replayObservations: [observation('hearing and doing', ['James 1:22', 'Psalms 46:1'])],
    }));
    const guard = derivation.cards.find((card) => card.kind === 'guard')!;
    expect(guard.derived.guard).toEqual({ ref: 'Genesis 5:1', why: 'Genealogy; no thematic relation.' });
    expect(guard.derived.anchorRemove).toBeUndefined();
    expect(guard.replay).toEqual({ disposition: 'materially-changed', note: REPLAY_OFFENDER_GONE_NOTE });
    expect(guard.stale).toBeUndefined();
    const reconfirm = derivation.cards.find((card) => card.kind === 're-confirmation')!;
    expect(reconfirm.stale).toBe(true);
    expect(reconfirm.replay).toEqual({ disposition: 'materially-changed', note: REPLAY_CHANGED_NOTE });
  });

  it('a preferred pair that no longer both rank routes to a stale re-confirmation', () => {
    const vote = v2({
      judgmentId: 'd3p', query: 'hearing and doing', action: 'prefer', at: nextAt(),
      preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:19046001', ...OLD_LAYER,
    });
    const derivation = deriveUpdates(inputs({
      records: [vote],
      replayObservations: [observation('hearing and doing', ['James 1:22'])],
    }));
    expect(derivation.cards).toHaveLength(1);
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('re-confirmation');
    expect(card.stale).toBe(true);
    expect(card.replay).toEqual({ disposition: 'materially-changed', note: REPLAY_CHANGED_NOTE });
    expect(card.derived).toEqual({});
  });
});

describe('the §02.5 corpus row — a reference that no longer resolves (FM-2)', () => {
  it('derives NOTHING and routes to re-confirmation naming the failure, verbatim', () => {
    const vote = v2({
      judgmentId: 'u1', query: 'who is like the lord', action: 'missing', at: nextAt(),
      reference: 'Deuteronomy 3:24', withinTop: 10, note: 'wording', ...OLD_CORPUS,
    });
    const derivation = deriveUpdates(inputs({
      records: [vote],
      replayObservations: [observation('who is like the lord', ['Exodus 15:11'], ['Deuteronomy 3:24'])],
    }));
    expect(derivation.cards).toHaveLength(1);
    const card = derivation.cards[0]!;
    expect(card.kind).toBe('re-confirmation');
    expect(card.stale).toBe(true);
    expect(card.derived).toEqual({});
    expect(card.replay).toEqual({ disposition: 'unresolved-reference', note: REPLAY_UNRESOLVED_REFERENCE_NOTE });
    expect(card.replay!.note).toBe(
      "The scripture text behind this call changed, and the passage couldn't be found again in the new text. Nothing was changed — your call is kept on record, and this is back in your inbox to check against the current text.",
    );
    expect(derivation.tally).toEqual({ drafted: 0, approved: 0, declined: 0, parked: 0 });
  });

  it('an unresolved ref under a layer-only move is NOT the corpus row — the ranking dispositions govern', () => {
    // The corpus did not move, so §02.5's re-resolution rule does not fire;
    // the observation's unresolved list is ignored for this vote.
    const vote = v2({
      judgmentId: 'u2', query: 'who is like the lord', action: 'missing', at: nextAt(),
      reference: 'Deuteronomy 3:24', withinTop: 10, note: 'wording', ...OLD_LAYER,
    });
    const derivation = deriveUpdates(inputs({
      records: [vote],
      replayObservations: [observation('who is like the lord', [], ['Deuteronomy 3:24'])],
    }));
    expect(derivation.cards[0]!.kind).toBe('missing-passage');
    expect(derivation.cards[0]!.replay!.disposition).toBe('materially-equivalent');
  });
});

describe('staleness is the normal path — the r4 §6 cadence (4 layer moves in ~11.5 hours)', () => {
  it('four votes under four successive layers, replayed at the fifth, each sort mechanically', () => {
    const day = Date.parse('2026-08-09T08:00:00.000Z');
    const at = (hours: number): string => new Date(day + hours * 3_600_000).toISOString();
    const layers = ['layer-a', 'layer-b', 'layer-c', 'layer-d'];
    const votes = [
      // 08:00 under layer-a: missing, later achieved (disposition 1).
      v2({ judgmentId: 'c1', query: 'who is like the lord', action: 'missing', at: at(0), reference: 'Deuteronomy 3:24', withinTop: 10, note: 'w', layerFingerprint: layers[0]! }),
      // 11:30 under layer-b: missing, still missing (disposition 2).
      v2({ judgmentId: 'c2', query: 'shelter in the storm', action: 'missing', at: at(3.5), reference: 'Psalms 46:1', withinTop: 10, excerpt: 'refuge', layerFingerprint: layers[1]!, caseId: stableUuid('case:c2') }),
      // 15:00 under layer-c: irrelevant, offender since gone (disposition 3 arm).
      v2({ judgmentId: 'c3', query: 'hearing and doing', action: 'irrelevant', at: at(7), targetId: 'WEB:1005001', diagnosis: 'wrong-anchor', conceptId: 'obedience-to-the-word', note: 'genealogy', layerFingerprint: layers[2]!, caseId: stableUuid('case:c3') }),
      // 19:30 under layer-d (~11.5h after the first): prefer, both still rank (disposition 2).
      v2({ judgmentId: 'c4', query: 'doers of the word', action: 'prefer', at: at(11.5), preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:19046001', layerFingerprint: layers[3]!, caseId: stableUuid('case:c4') }),
    ];
    const derivation = deriveUpdates(inputs({
      records: votes,
      replayObservations: [
        observation('who is like the lord', ['Deuteronomy 3:24']),
        observation('shelter in the storm', ['John 3:16']),
        observation('hearing and doing', ['James 1:22']),
        observation('doers of the word', ['James 1:22', 'Psalms 46:1']),
      ],
    }));
    const byQuery = (query: string, kind?: string): UpdateCard =>
      derivation.cards.find((card) => card.query === query && (kind === undefined || card.kind === kind))!;
    expect(byQuery('who is like the lord').replay!.disposition).toBe('already-achieved');
    expect(byQuery('shelter in the storm').replay!.disposition).toBe('materially-equivalent');
    expect(byQuery('hearing and doing', 'guard').replay!.disposition).toBe('materially-changed');
    expect(byQuery('hearing and doing', 're-confirmation').stale).toBe(true);
    expect(byQuery('doers of the word', 'expectation').replay!.disposition).toBe('materially-equivalent');
    // Every moved query was named for replay — staleness is handled, not warned about.
    expect(derivation.replayRequests.map((request) => request.query).sort()).toEqual([
      'doers of the word', 'hearing and doing', 'shelter in the storm', 'who is like the lord',
    ]);
  });
});

describe('determinism and the two-pass helper', () => {
  it('observations are pinned input: the derivation digest moves with them and reproduces byte-identically', () => {
    const record = v2({ judgmentId: 'dd1', query: 'who is like the lord', action: 'missing', at: nextAt(), reference: 'Deuteronomy 3:24', withinTop: 10, note: 'w', ...OLD_LAYER });
    const bare = inputs({ records: [record] });
    const observed = { ...bare, replayObservations: [observation('who is like the lord', ['Deuteronomy 3:24'])] };
    const a = deriveUpdates(observed);
    const b = deriveUpdates(observed);
    expect(a).toEqual(b);
    expect(a.derivationDigest).not.toBe(deriveUpdates(bare).derivationDigest);
  });

  it('deriveWithReplay: pass 1 names the requests, pass 2 derives with the observations pinned', async () => {
    const record = v2({ judgmentId: 'dw1', query: 'who is like the lord', action: 'missing', at: nextAt(), reference: 'Deuteronomy 3:24', withinTop: 10, note: 'w', ...OLD_LAYER });
    const base = inputs({ records: [record] });
    const seen: unknown[] = [];
    const runner = async (requests: readonly { query: string; refs: readonly string[] }[]): Promise<ReplayProbeResult[]> => {
      seen.push(requests);
      return requests.map((request) => observation(request.query, [...request.refs]));
    };
    const { inputs: replayed, derivation } = await deriveWithReplay(base, runner);
    expect(seen).toEqual([[{ query: 'who is like the lord', refs: ['Deuteronomy 3:24'] }]]);
    expect(replayed.replayObservations).toHaveLength(1);
    expect(derivation.cards[0]!.replay!.disposition).toBe('already-achieved');
    // The digest a second identical pass produces is the same — the panel
    // and the seal cover the same observed picture.
    const again = await deriveWithReplay(base, runner);
    expect(again.derivation.derivationDigest).toBe(derivation.derivationDigest);
  });

  it('deriveWithReplay without a runner is exactly the single-pass derivation', async () => {
    const record = v2({ judgmentId: 'dw2', query: 'who is like the lord', action: 'missing', at: nextAt(), reference: 'Deuteronomy 3:24', withinTop: 10, note: 'w', ...OLD_LAYER });
    const base = inputs({ records: [record] });
    const { inputs: unchanged, derivation } = await deriveWithReplay(base, undefined);
    expect(unchanged).toBe(base);
    expect(derivation).toEqual(deriveUpdates(base));
  });
});
