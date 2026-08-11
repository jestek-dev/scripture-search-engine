import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createJudgmentV2Context,
  createJudgmentLog,
  parseJudgmentRecord,
  validateJudgment,
  type JudgmentLogOptions,
  type JudgmentRecord,
  type JudgmentRecordV2,
  type JudgmentV2Context,
  type ParsedJudgmentRecord,
} from '../src/judgments.js';

// Everything situational is injected, so these tests need no engine and no
// artifact: a fake identity, a fake reference resolver, a fixed clock.
const IDENTITY = {
  engineVersion: '0.7.1-test',
  corpusFingerprint: 'corpus-test-fingerprint',
  layerFingerprint: 'layer-test-fingerprint',
};

const JAMES_EXCERPT = 'But be doers of the word, and not only hearers, deluding your own selves.';

const CASE_ID = '11111111-1111-4111-8111-111111111111';
const JUDGMENT_NEW = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const JUDGMENT_OLD_ESSENTIAL = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const JUDGMENT_OLD_HELPFUL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const JUDGMENT_OLD_IRRELEVANT = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const JUDGMENT_OLD_MISSING = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const JUDGMENT_OLD_PREFER = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const JUDGMENT_OLD = '12345678-1234-4123-8123-123456789abc';
const JUDGMENT_CORRECTION = '23456789-1234-4123-8123-123456789abc';
const JUDGMENT_PARSED = '34567890-1234-4123-8123-123456789abc';
const JUDGMENT_BAD = '45678901-1234-4123-8123-123456789abc';

const V2_CONTEXT: JudgmentV2Context = createJudgmentV2Context({
  caseId: CASE_ID,
  query: 'hearing and doing',
  source: 'manual',
  observedWindow: 3,
  results: [
    { targetId: 'WEB:59001022', rank: 1, reason: { family: 'concept', id: 'hearing-and-doing' } },
    { targetId: 'WEB:45003016', rank: 2, reason: { family: 'lexical', terms: ['hearing', 'doing'] } },
    { targetId: 'WEB:1005001', rank: 3 },
  ],
});

function options(overrides: Partial<JudgmentLogOptions> = {}): JudgmentLogOptions {
  return {
    logPath: '/dev/null',
    reviewer: 'test-reviewer',
    identity: IDENTITY,
    // The fake engine.passage(): only James resolves, to a fixed excerpt.
    resolveReference: async (reference) => (reference.startsWith('James') ? JAMES_EXCERPT : null),
    resolveReferenceTargetId: async (reference) => {
      if (reference === 'James 1:22') return 'WEB:59001022';
      return reference.startsWith('James') ? 'WEB:59002014' : null;
    },
    now: () => new Date('2026-08-06T12:00:00.000Z'),
    ...overrides,
  };
}

async function expectRejected(body: unknown, reasonPattern: RegExp): Promise<void> {
  const result = await validateJudgment(body, options());
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toMatch(reasonPattern);
}

async function expectAccepted(body: unknown): Promise<JudgmentRecord> {
  const result = await validateJudgment(body, options());
  expect(result.ok, JSON.stringify(result)).toBe(true);
  if (!result.ok) throw new Error('unreachable');
  if ('schemaVersion' in result.record) throw new Error('expected a v1 record');
  return result.record;
}

async function expectV2Accepted(
  body: unknown,
  overrides: Partial<JudgmentLogOptions> = {},
): Promise<JudgmentRecordV2> {
  const result = await validateJudgment(body, options({
    v2Context: V2_CONTEXT,
    createJudgmentId: () => JUDGMENT_NEW,
    ...overrides,
  }));
  expect(result.ok, JSON.stringify(result)).toBe(true);
  if (!result.ok || !('schemaVersion' in result.record)) throw new Error('expected a v2 record');
  return result.record;
}

async function expectV2Rejected(body: unknown, reasonPattern: RegExp): Promise<void> {
  const result = await validateJudgment(body, options({ v2Context: V2_CONTEXT }));
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toMatch(reasonPattern);
}

function v2Record(partial: Partial<JudgmentRecordV2> & Pick<JudgmentRecordV2, 'judgmentId' | 'action'>): JudgmentRecordV2 {
  const { judgmentId, action, ...overrides } = partial;
  return {
    schemaVersion: 2,
    judgmentId,
    caseId: V2_CONTEXT.caseId,
    at: '2026-08-01T10:00:00.000Z',
    reviewer: 'test-reviewer',
    query: V2_CONTEXT.query,
    action,
    observedWindow: V2_CONTEXT.observedWindow,
    resultSetDigest: V2_CONTEXT.resultSetDigest,
    displayedWindowDigest: V2_CONTEXT.displayedWindowDigest,
    source: V2_CONTEXT.source,
    ...IDENTITY,
    ...overrides,
  };
}

describe('judgment validation — record-level rules (§4)', () => {
  it('rejects non-object bodies in plain English', async () => {
    await expectRejected('fits', /JSON object/);
    await expectRejected(null, /JSON object/);
    await expectRejected([1], /JSON object/);
  });

  it('rejects unknown fields', async () => {
    await expectRejected(
      { query: 'q', verdict: 'fits', targetId: 'WEB:59001022', capped: true },
      /Unknown field "capped"/,
    );
  });

  it('rejects client attempts to supply server-stamped fields', async () => {
    for (const field of ['at', 'reviewer', 'excerpt', 'engineVersion', 'corpusFingerprint', 'layerFingerprint']) {
      await expectRejected(
        { query: 'q', verdict: 'fits', targetId: 'WEB:59001022', [field]: 'spoofed' },
        /stamped by the server/,
      );
    }
  });

  it('requires the query as typed', async () => {
    await expectRejected({ verdict: 'fits', targetId: 'WEB:59001022' }, /query/);
    await expectRejected({ query: '   ', verdict: 'fits', targetId: 'WEB:59001022' }, /query/);
  });

  it('requires a known verdict', async () => {
    await expectRejected({ query: 'q', verdict: 'perfect' }, /"fits", "doesnt-fit", or "missing"/);
    await expectRejected({ query: 'q' }, /"fits", "doesnt-fit", or "missing"/);
  });

  it('rejects an empty note on any verdict', async () => {
    await expectRejected(
      { query: 'q', verdict: 'fits', targetId: 'WEB:59001022', note: '  ' },
      /non-empty/,
    );
  });
});

describe('judgment validation — fits', () => {
  it('accepts a plain ✓ and stamps reviewer, identities, and time', async () => {
    const record = await expectAccepted({ query: 'hearing and doing', verdict: 'fits', targetId: 'WEB:59001022' });
    expect(record).toEqual({
      at: '2026-08-06T12:00:00.000Z',
      reviewer: 'test-reviewer',
      query: 'hearing and doing',
      verdict: 'fits',
      targetId: 'WEB:59001022',
      ...IDENTITY,
    });
  });

  it('accepts a pinned ✓ with a reasonFamily', async () => {
    const record = await expectAccepted({
      query: 'q',
      verdict: 'fits',
      targetId: 'WEB:59001022',
      pin: true,
      reasonFamily: 'concept_anchor',
    });
    expect(record.pin).toBe(true);
    expect(record.reasonFamily).toBe('concept_anchor');
  });

  it('requires a targetId', async () => {
    await expectRejected({ query: 'q', verdict: 'fits' }, /targetId/);
  });

  it('rejects a targetId that does not decode to a verse location', async () => {
    // book 99 does not exist; chapter 0 and verse 0 are not verse locations.
    for (const bad of ['59001022', 'WEB:99001001', 'WEB:59000001', 'WEB:59001000', 'WEB:notanid']) {
      await expectRejected({ query: 'q', verdict: 'fits', targetId: bad }, /target id/);
    }
  });

  it('rejects pin values other than true', async () => {
    await expectRejected(
      { query: 'q', verdict: 'fits', targetId: 'WEB:59001022', pin: false },
      /pin: true/,
    );
  });

  it('rejects reasonFamily without pin — it compiles into the fixture', async () => {
    await expectRejected(
      { query: 'q', verdict: 'fits', targetId: 'WEB:59001022', reasonFamily: 'concept_anchor' },
      /pinned/,
    );
  });

  it('rejects doesnt-fit fields on a ✓', async () => {
    await expectRejected(
      { query: 'q', verdict: 'fits', targetId: 'WEB:59001022', cause: 'lexical-noise' },
      /does not belong on a "fits" judgment/,
    );
    await expectRejected(
      { query: 'q', verdict: 'fits', targetId: 'WEB:59001022', conceptId: 'obedience' },
      /does not belong on a "fits" judgment/,
    );
  });

  it('rejects a reference on a ✓ — that belongs to missing', async () => {
    await expectRejected(
      { query: 'q', verdict: 'fits', targetId: 'WEB:59001022', reference: 'James 1:22' },
      /"missing" judgments only/,
    );
  });
});

describe('judgment validation — doesnt-fit', () => {
  it('requires a cause', async () => {
    await expectRejected({ query: 'q', verdict: 'doesnt-fit', targetId: 'WEB:59001022' }, /cause/);
    await expectRejected(
      { query: 'q', verdict: 'doesnt-fit', targetId: 'WEB:59001022', cause: 'vibes' },
      /wrong-anchor.*concept-misfire.*lexical-noise/,
    );
  });

  it('requires conceptId AND note for the anchor-affecting causes', async () => {
    for (const cause of ['wrong-anchor', 'concept-misfire']) {
      await expectRejected(
        { query: 'q', verdict: 'doesnt-fit', targetId: 'WEB:59001022', cause, note: 'why' },
        /name the concept/,
      );
      await expectRejected(
        { query: 'q', verdict: 'doesnt-fit', targetId: 'WEB:59001022', cause, conceptId: 'obedience' },
        /no bare clicks/,
      );
      const record = await expectAccepted({
        query: 'q',
        verdict: 'doesnt-fit',
        targetId: 'WEB:59001022',
        cause,
        conceptId: 'obedience',
        note: 'The passage is about genealogy, not obedience.',
      });
      expect(record.cause).toBe(cause);
    }
  });

  it('accepts lexical-noise without a note, but not with a conceptId', async () => {
    const record = await expectAccepted({
      query: 'q',
      verdict: 'doesnt-fit',
      targetId: 'WEB:1005001',
      cause: 'lexical-noise',
    });
    expect(record.note).toBeUndefined();
    await expectRejected(
      { query: 'q', verdict: 'doesnt-fit', targetId: 'WEB:1005001', cause: 'lexical-noise', conceptId: 'x' },
      /wrong-anchor.*concept-misfire/,
    );
  });

  it('accepts causeInferred: true on any cause — transparency for the auto-classified ✗', async () => {
    const record = await expectAccepted({
      query: 'q',
      verdict: 'doesnt-fit',
      targetId: 'WEB:1005001',
      cause: 'lexical-noise',
      causeInferred: true,
    });
    expect(record.causeInferred).toBe(true);
    const answered = await expectAccepted({
      query: 'q',
      verdict: 'doesnt-fit',
      targetId: 'WEB:1005001',
      cause: 'wrong-anchor',
      conceptId: 'obedience',
      note: 'The anchor names a genealogy.',
      causeInferred: true,
    });
    expect(answered.causeInferred).toBe(true);
  });

  it('rejects causeInferred values other than true, and causeInferred without a cause', async () => {
    await expectRejected(
      { query: 'q', verdict: 'doesnt-fit', targetId: 'WEB:1005001', cause: 'lexical-noise', causeInferred: false },
      /causeInferred: true only/,
    );
    await expectRejected(
      { query: 'q', verdict: 'doesnt-fit', targetId: 'WEB:1005001', causeInferred: true },
      /needs a cause/,
    );
  });

  it('rejects causeInferred on the other verdicts', async () => {
    await expectRejected(
      { query: 'q', verdict: 'fits', targetId: 'WEB:59001022', causeInferred: true },
      /does not belong on a "fits" judgment/,
    );
    await expectRejected(
      { query: 'q', verdict: 'missing', reference: 'James 1:22', causeInferred: true },
      /does not belong on a "missing" judgment/,
    );
  });

  it('rejects pin and reasonFamily on a ✗', async () => {
    await expectRejected(
      { query: 'q', verdict: 'doesnt-fit', targetId: 'WEB:59001022', cause: 'lexical-noise', pin: true },
      /does not belong on a "doesnt-fit" judgment/,
    );
    await expectRejected(
      { query: 'q', verdict: 'doesnt-fit', targetId: 'WEB:59001022', cause: 'lexical-noise', reasonFamily: 'x' },
      /does not belong on a "doesnt-fit" judgment/,
    );
  });
});

describe('judgment validation — missing', () => {
  it('accepts a validated reference with a note, and attaches no excerpt then', async () => {
    const record = await expectAccepted({
      query: 'faith without works',
      verdict: 'missing',
      reference: 'James 2:14-26',
      note: 'The whole passage argues faith apart from works is dead.',
    });
    expect(record.reference).toBe('James 2:14-26');
    expect(record.excerpt).toBeUndefined();
  });

  it('accepts a validated reference WITHOUT a note, attaching the passage excerpt (§4 v1.1)', async () => {
    const record = await expectAccepted({
      query: 'hearing and doing',
      verdict: 'missing',
      reference: 'James 1:22',
    });
    expect(record.note).toBeUndefined();
    // The defend-it-from-the-text rule is satisfied by the text itself.
    expect(record.excerpt).toBe(JAMES_EXCERPT);
  });

  it('requires a reference', async () => {
    await expectRejected({ query: 'q', verdict: 'missing', note: 'why' }, /reference/);
  });

  it('still requires a note when no passage text can be attached', async () => {
    const result = await validateJudgment(
      { query: 'q', verdict: 'missing', reference: 'James 1:22' },
      options({ resolveReference: async () => '   ' }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/no bare clicks/);
  });

  it('rejects a reference the engine cannot resolve', async () => {
    await expectRejected(
      { query: 'q', verdict: 'missing', reference: 'Hezekiah 3:16', note: 'why' },
      /not a reference the engine can resolve/,
    );
  });

  it('rejects result-judgment fields on a missing judgment', async () => {
    for (const extra of [
      { targetId: 'WEB:59001022' },
      { cause: 'lexical-noise' },
      { causeInferred: true },
      { conceptId: 'obedience' },
      { pin: true },
      { reasonFamily: 'concept_anchor' },
    ]) {
      await expectRejected(
        { query: 'q', verdict: 'missing', reference: 'James 1:22', note: 'why', ...extra },
        /does not belong on a "missing" judgment/,
      );
    }
  });
});

describe('v2 judgment validation - server-stamped review evidence', () => {
  it('builds deterministic, immutable evidence from a server-owned review snapshot', () => {
    const first = createJudgmentV2Context({
      caseId: CASE_ID,
      query: 'hearing and doing',
      source: 'manual',
      observedWindow: 3,
      results: [
        { targetId: 'WEB:59001022', rank: 1, reason: { family: 'concept', id: 'hearing-and-doing' } },
        { targetId: 'WEB:45003016', rank: 2, reason: { family: 'lexical', terms: ['hearing', 'doing'] } },
      ],
    });
    const reordered = createJudgmentV2Context({
      caseId: CASE_ID,
      query: 'hearing and doing',
      source: 'manual',
      observedWindow: 3,
      results: [
        { targetId: 'WEB:45003016', rank: 2, reason: { terms: ['hearing', 'doing'], family: 'lexical' } },
        { targetId: 'WEB:59001022', rank: 1, reason: { id: 'hearing-and-doing', family: 'concept' } },
      ],
    });

    expect(reordered).toEqual(first);
    expect(first.resultSetDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(first.displayedWindowDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(first.results[0]?.reasonDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.results)).toBe(true);
  });

  it('rejects snapshots with duplicate targets/ranks, gaps, or ranks beyond the visible window', () => {
    const base = { caseId: CASE_ID, query: 'q', source: 'manual' as const, observedWindow: 3 };
    for (const results of [
      [{ targetId: 'WEB:59001022', rank: 1 }, { targetId: 'WEB:45003016', rank: 1 }],
      [{ targetId: 'WEB:59001022', rank: 1 }, { targetId: 'WEB:45003016', rank: 3 }],
      [{ targetId: 'WEB:59001022', rank: 4 }],
      [{ targetId: 'WEB:59001022', rank: 1 }, { targetId: 'WEB:59001022', rank: 2 }],
    ]) {
      expect(() => createJudgmentV2Context({ ...base, results })).toThrow(/unique, contiguous ranks|unique targets/);
    }
  });

  it('stamps the v2 identity, case, source, result digests, rank, and reason digest', async () => {
    const record = await expectV2Accepted({ action: 'essential', targetId: 'WEB:59001022', withinTop: 3 });
    expect(record).toMatchObject({
      schemaVersion: 2, judgmentId: JUDGMENT_NEW, caseId: V2_CONTEXT.caseId, query: V2_CONTEXT.query,
      source: V2_CONTEXT.source, observedRank: 1, observedWindow: 3,
      resultSetDigest: V2_CONTEXT.resultSetDigest, displayedWindowDigest: V2_CONTEXT.displayedWindowDigest,
      reasonDigest: V2_CONTEXT.results[0]?.reasonDigest, ...IDENTITY,
    });
  });

  it('rejects all v2 fields the server owns', async () => {
    for (const field of [
      'schemaVersion', 'judgmentId', 'caseId', 'at', 'reviewer', 'query', 'observedRank', 'observedWindow',
      'resultSetDigest', 'reasonDigest', 'displayedWindowDigest', 'excerpt', 'source', 'engineVersion',
      'corpusFingerprint', 'layerFingerprint',
    ]) {
      await expectV2Rejected({ action: 'helpful', targetId: 'WEB:59001022', [field]: 'spoofed' }, /stamped by the server/);
    }
  });

  it('rejects a context whose digest no longer proves its results', async () => {
    const result = await validateJudgment(
      { action: 'helpful', targetId: 'WEB:59001022' },
      options({ v2Context: { ...V2_CONTEXT, resultSetDigest: '0'.repeat(64) } }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/snapshot is incomplete or invalid/);
  });
});

describe('v2 judgment validation - actions', () => {
  it('accepts essential and rejects missing, invalid, or unobserved placement evidence', async () => {
    const record = await expectV2Accepted({ action: 'essential', targetId: 'WEB:59001022', withinTop: 1 });
    expect(record.withinTop).toBe(1);
    await expectV2Rejected({ action: 'essential', targetId: 'WEB:59001022' }, /withinTop/);
    await expectV2Rejected({ action: 'essential', targetId: 'WEB:59001022', withinTop: 2 }, /1, 3, 5, or 10/);
    await expectV2Rejected({ action: 'essential', targetId: 'WEB:43003016', withinTop: 5 }, /judged result set/);
  });

  it('accepts helpful and rejects placement or a target outside the reviewed results', async () => {
    const record = await expectV2Accepted({ action: 'helpful', targetId: 'WEB:45003016' });
    expect(record.observedRank).toBe(2);
    await expectV2Rejected({ action: 'helpful', targetId: 'WEB:45003016', withinTop: 5 }, /essential and missing/);
    await expectV2Rejected({ action: 'helpful', targetId: 'WEB:43003016' }, /judged result set/);
  });

  it('accepts irrelevant with v1-equivalent diagnosis rules and rejects malformed diagnoses', async () => {
    const record = await expectV2Accepted({
      action: 'irrelevant', targetId: 'WEB:1005001', diagnosis: 'wrong-anchor', conceptId: 'obedience',
      note: 'This is a genealogy, not a teaching about obedience.', diagnosisInferred: true,
    });
    expect(record.diagnosis).toBe('wrong-anchor');
    expect(record.diagnosisInferred).toBe(true);
    await expectV2Rejected({ action: 'irrelevant', targetId: 'WEB:1005001' }, /needs a diagnosis/);
    await expectV2Rejected(
      { action: 'irrelevant', targetId: 'WEB:1005001', diagnosis: 'concept-misfire', conceptId: 'obedience' }, /needs a note/,
    );
    await expectV2Rejected(
      { action: 'irrelevant', targetId: 'WEB:1005001', diagnosis: 'lexical-noise', conceptId: 'obedience' }, /only belongs/,
    );
  });

  it('accepts missing with a per-judgment window and rejects result fields or invalid windows', async () => {
    const record = await expectV2Accepted({ action: 'missing', reference: 'James 2:14', withinTop: 10 });
    expect(record).toMatchObject({ withinTop: 10, observedRank: null, excerpt: JAMES_EXCERPT });
    await expectV2Rejected({ action: 'missing', withinTop: 5 }, /reference/);
    await expectV2Rejected(
      { action: 'missing', reference: 'James 2:14', withinTop: 5, targetId: 'WEB:59001022' }, /does not belong/,
    );
    await expectV2Rejected({ action: 'missing', reference: 'James 2:14', withinTop: 4 }, /1, 3, 5, or 10/);
  });

  it('rejects a missing reference that was already in the observed result set', async () => {
    await expectV2Rejected(
      { action: 'missing', reference: 'James 1:22', withinTop: 3 },
      /already present in the judged result set/,
    );
    const unavailable = await validateJudgment(
      { action: 'missing', reference: 'James 2:14', withinTop: 3 },
      options({ v2Context: V2_CONTEXT, resolveReferenceTargetId: undefined }),
    );
    expect(unavailable.ok).toBe(false);
    if (!unavailable.ok) expect(unavailable.reason).toMatch(/cannot verify/);
  });

  it('accepts prefer only for distinct reviewed pairwise targets', async () => {
    const record = await expectV2Accepted({
      action: 'prefer', preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:45003016',
    });
    expect(record).toMatchObject({ preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:45003016', observedRank: 1 });
    await expectV2Rejected(
      { action: 'prefer', preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:59001022' }, /distinct/,
    );
    await expectV2Rejected(
      { action: 'prefer', preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:43003016' }, /judged result set/,
    );
  });
});

describe('v2 judgment validation - corrections and reconfirmations', () => {
  const corrections = [
    {
      name: 'essential',
      prior: v2Record({ judgmentId: JUDGMENT_OLD_ESSENTIAL, action: 'essential', targetId: 'WEB:59001022', withinTop: 5, observedRank: 1 }),
      body: { action: 'essential', targetId: 'WEB:59001022', withinTop: 1, supersedes: JUDGMENT_OLD_ESSENTIAL },
    },
    {
      name: 'helpful',
      prior: v2Record({ judgmentId: JUDGMENT_OLD_HELPFUL, action: 'helpful', targetId: 'WEB:45003016', observedRank: 2 }),
      body: { action: 'helpful', targetId: 'WEB:45003016', supersedes: JUDGMENT_OLD_HELPFUL },
    },
    {
      name: 'irrelevant',
      prior: v2Record({ judgmentId: JUDGMENT_OLD_IRRELEVANT, action: 'irrelevant', targetId: 'WEB:1005001', observedRank: 3, diagnosis: 'lexical-noise' }),
      body: { action: 'irrelevant', targetId: 'WEB:1005001', diagnosis: 'lexical-noise', supersedes: JUDGMENT_OLD_IRRELEVANT },
    },
    {
      name: 'missing',
      prior: v2Record({ judgmentId: JUDGMENT_OLD_MISSING, action: 'missing', reference: 'James 2:14', withinTop: 5, observedRank: null }),
      body: { action: 'missing', reference: 'James 2:14', withinTop: 3, supersedes: JUDGMENT_OLD_MISSING },
    },
    {
      name: 'prefer',
      prior: v2Record({ judgmentId: JUDGMENT_OLD_PREFER, action: 'prefer', preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:45003016', observedRank: 1 }),
      body: { action: 'prefer', preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:45003016', supersedes: JUDGMENT_OLD_PREFER },
    },
  ] as const;

  it.each(corrections)('appends a $name correction/reconfirmation without altering history', async ({ prior, body }) => {
    const record = await expectV2Accepted(body, { getExistingJudgments: async () => [prior] });
    expect(record.supersedes).toBe(prior.judgmentId);
  });

  it('rejects unknown, mismatched, and already-active supersessions', async () => {
    await expectV2Rejected({ action: 'helpful', targetId: 'WEB:59001022', supersedes: JUDGMENT_CORRECTION }, /no existing v2 judgment/);
    const prior = v2Record({ judgmentId: JUDGMENT_OLD, action: 'helpful', targetId: 'WEB:59001022', observedRank: 1 });
    const mismatched = await validateJudgment(
      { action: 'helpful', targetId: 'WEB:45003016', supersedes: JUDGMENT_OLD },
      options({ v2Context: V2_CONTEXT, getExistingJudgments: async () => [prior] }),
    );
    expect(mismatched.ok).toBe(false);
    if (!mismatched.ok) expect(mismatched.reason).toMatch(/same query, case, and target/);
    const correction = v2Record({ judgmentId: JUDGMENT_CORRECTION, action: 'helpful', targetId: 'WEB:59001022', observedRank: 1, supersedes: JUDGMENT_OLD });
    const alreadySuperseded = await validateJudgment(
      { action: 'helpful', targetId: 'WEB:59001022', supersedes: JUDGMENT_OLD },
      options({ v2Context: V2_CONTEXT, getExistingJudgments: async () => [prior, correction] }),
    );
    expect(alreadySuperseded.ok).toBe(false);
    if (!alreadySuperseded.ok) expect(alreadySuperseded.reason).toMatch(/already superseded/);

    const futurePrior = v2Record({
      judgmentId: JUDGMENT_OLD_HELPFUL,
      action: 'helpful',
      targetId: 'WEB:59001022',
      observedRank: 1,
      at: '2026-08-07T12:00:00.000Z',
    });
    const monotonic = await validateJudgment(
      { action: 'helpful', targetId: 'WEB:59001022', supersedes: JUDGMENT_OLD_HELPFUL },
      options({ v2Context: V2_CONTEXT, getExistingJudgments: async () => [futurePrior] }),
    );
    expect(monotonic.ok).toBe(true);
    if (!monotonic.ok || !('schemaVersion' in monotonic.record)) throw new Error('expected a v2 correction');
    expect(Date.parse(monotonic.record.at)).toBeGreaterThan(Date.parse(futurePrior.at));
  });

  it('accepts a reversed pairwise preference as a correction to the same unordered pair', async () => {
    const prior = v2Record({
      judgmentId: JUDGMENT_OLD_PREFER,
      action: 'prefer',
      preferredTargetId: 'WEB:59001022',
      otherTargetId: 'WEB:45003016',
      observedRank: 1,
    });
    const correction = await expectV2Accepted({
      action: 'prefer',
      preferredTargetId: 'WEB:45003016',
      otherTargetId: 'WEB:59001022',
      supersedes: JUDGMENT_OLD_PREFER,
    }, { getExistingJudgments: async () => [prior] });
    expect(correction.observedRank).toBe(2);
    expect(correction.supersedes).toBe(JUDGMENT_OLD_PREFER);
  });
});

describe('mixed v1/v2 judgment parsing', () => {
  it('parses valid legacy and v2 history records without rewriting either schema', () => {
    const legacy: JudgmentRecord = {
      at: '2026-08-01T10:00:00.000Z', reviewer: 'reviewer', query: 'q', verdict: 'fits', targetId: 'WEB:59001022', ...IDENTITY,
    };
    const v2 = v2Record({ judgmentId: JUDGMENT_PARSED, action: 'essential', targetId: 'WEB:59001022', withinTop: 1, observedRank: 1 });
    const parsed: ParsedJudgmentRecord[] = [legacy, v2].map((record) => {
      const result = parseJudgmentRecord(record);
      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error(result.reason);
      return result.record;
    });
    expect(parsed).toEqual([legacy, v2]);
  });

  it('rejects malformed v2 persisted records', () => {
    const result = parseJudgmentRecord(v2Record({ judgmentId: JUDGMENT_BAD, action: 'essential', targetId: 'WEB:59001022', observedRank: 1 }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/withinTop/);
  });

  it('rejects malformed persisted keys, ids, timestamps, evidence, and action combinations', () => {
    const legacy: JudgmentRecord = {
      at: '2026-08-01T10:00:00.000Z', reviewer: 'reviewer', query: 'q', verdict: 'fits', targetId: 'WEB:59001022', ...IDENTITY,
    };
    const validV2 = v2Record({
      judgmentId: JUDGMENT_PARSED,
      action: 'essential',
      targetId: 'WEB:59001022',
      withinTop: 1,
      observedRank: 1,
    });
    const missingWithoutEvidence = v2Record({
      judgmentId: JUDGMENT_OLD_MISSING,
      action: 'missing',
      reference: 'James 2:14',
      withinTop: 3,
      observedRank: null,
    });
    const { targetId: _legacyTargetId, ...legacyWithoutTarget } = legacy;
    const cases: readonly [unknown, RegExp][] = [
      [{ ...legacy, unexpected: true }, /unknown field/],
      [{ ...legacy, at: '2026-08-01T10:00:00Z' }, /canonical UTC ISO timestamp/],
      [{ ...legacy, query: 'q ' }, /canonical non-empty reviewer and query/],
      [{ ...legacyWithoutTarget, verdict: 'missing', reference: 'James 1:22' }, /note or excerpt/],
      [{ ...validV2, judgmentId: 'not-a-uuid' }, /UUID/],
      [{ ...validV2, caseId: 'not-a-uuid' }, /UUID/],
      [{ ...validV2, at: '2026-08-01T10:00:00Z' }, /canonical UTC ISO timestamp/],
      [{ ...validV2, resultSetDigest: 'not-a-sha256' }, /review evidence/],
      [{ ...validV2, observedRank: 4 }, /inside observedWindow/],
      [{ ...validV2, reference: 'James 1:22' }, /unknown field/],
      [{ ...missingWithoutEvidence, reference: 'James 2:14 ', note: 'evidence' }, /reference/],
      [missingWithoutEvidence, /note or excerpt/],
    ];
    for (const [record, pattern] of cases) {
      const result = parseJudgmentRecord(record);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toMatch(pattern);
    }
  });
});

describe('judgment log — append', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), 'workbench-judgments-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('appends exactly one JSON line per accepted judgment, in order', async () => {
    const logPath = path.join(directory, 'judgments.jsonl');
    const log = createJudgmentLog(options({ logPath }));

    const first = await log.submit({ query: 'q', verdict: 'fits', targetId: 'WEB:59001022' });
    const second = await log.submit({
      query: 'q',
      verdict: 'missing',
      reference: 'James 2:14',
      note: 'why, from the text',
    });
    const rejected = await log.submit({ query: 'q', verdict: 'doesnt-fit', targetId: 'WEB:59001022' });
    expect(first.ok && second.ok).toBe(true);
    expect(rejected.ok).toBe(false);

    const lines = (await readFile(logPath, 'utf8')).split('\n').filter((line) => line !== '');
    expect(lines).toHaveLength(2); // the rejection appended nothing
    const parsed = lines.map((line) => JSON.parse(line) as JudgmentRecord);
    expect(parsed[0]?.verdict).toBe('fits');
    expect(parsed[1]?.verdict).toBe('missing');
    for (const record of parsed) {
      expect(record.reviewer).toBe('test-reviewer');
      expect(record.engineVersion).toBe(IDENTITY.engineVersion);
      expect(record.corpusFingerprint).toBe(IDENTITY.corpusFingerprint);
      expect(record.layerFingerprint).toBe(IDENTITY.layerFingerprint);
    }
  });

  it('serializes concurrent corrections so only one can supersede a judgment', async () => {
    const logPath = path.join(directory, 'judgments.jsonl');
    const ids = [JUDGMENT_OLD, JUDGMENT_NEW, JUDGMENT_CORRECTION];
    const log = createJudgmentLog(options({
      logPath,
      v2Context: V2_CONTEXT,
      createJudgmentId: () => ids.shift() ?? '56789012-1234-4123-8123-123456789abc',
    }));

    const prior = await log.submit({ action: 'helpful', targetId: 'WEB:59001022' });
    expect(prior.ok).toBe(true);
    if (!prior.ok || !('schemaVersion' in prior.record)) throw new Error('expected a v2 prior');

    const results = await Promise.all([
      log.submit({ action: 'helpful', targetId: 'WEB:59001022', supersedes: prior.record.judgmentId }),
      log.submit({ action: 'helpful', targetId: 'WEB:59001022', supersedes: prior.record.judgmentId }),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.find((result) => !result.ok)).toMatchObject({ ok: false, reason: expect.stringMatching(/already superseded/) });

    const lines = (await readFile(logPath, 'utf8')).trim().split('\n');
    expect(lines).toHaveLength(2);
  });
});
