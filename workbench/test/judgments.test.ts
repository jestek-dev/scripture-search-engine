import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createJudgmentLog,
  validateJudgment,
  type JudgmentLogOptions,
  type JudgmentRecord,
} from '../src/judgments.js';

// Everything situational is injected, so these tests need no engine and no
// artifact: a fake identity, a fake reference resolver, a fixed clock.
const IDENTITY = {
  engineVersion: '0.7.1-test',
  corpusFingerprint: 'corpus-test-fingerprint',
  layerFingerprint: 'layer-test-fingerprint',
};

function options(overrides: Partial<JudgmentLogOptions> = {}): JudgmentLogOptions {
  return {
    logPath: '/dev/null',
    reviewer: 'test-reviewer',
    identity: IDENTITY,
    // The fake engine.passage(): only James resolves.
    isValidReference: async (reference) => reference.startsWith('James'),
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
  return result.record;
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
    for (const field of ['at', 'reviewer', 'engineVersion', 'corpusFingerprint', 'layerFingerprint']) {
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
  it('accepts a validated reference with a note', async () => {
    const record = await expectAccepted({
      query: 'faith without works',
      verdict: 'missing',
      reference: 'James 2:14-26',
      note: 'The whole passage argues faith apart from works is dead.',
    });
    expect(record.reference).toBe('James 2:14-26');
  });

  it('requires a reference', async () => {
    await expectRejected({ query: 'q', verdict: 'missing', note: 'why' }, /reference/);
  });

  it('requires a note — no bare clicks', async () => {
    await expectRejected(
      { query: 'q', verdict: 'missing', reference: 'James 1:22' },
      /no bare clicks/,
    );
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
});
