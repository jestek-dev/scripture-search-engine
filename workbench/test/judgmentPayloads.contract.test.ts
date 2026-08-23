import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import {
  createJudgmentLog,
  createJudgmentV2Context,
  type JudgmentLogOptions,
  type JudgmentRecordV2,
} from '../src/judgments.js';

// D19 (plan §7): the Playwright specs mock every /api/** route, so a
// payload-contract error would otherwise surface only in the manual smoke.
// This test feeds one representative client body per §4.4 row through the
// REAL server validator (`createJudgmentLog(...).submit`) with a stubbed
// snapshot context and stubbed reference resolvers, so a payload the server
// would reject fails `npm test`, not the manual smoke.

const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'sse-judgment-contract-'));
afterAll(() => { rmSync(tempRoot, { recursive: true, force: true }); });

const CASE_ID = '6f9619ff-8b86-4d01-b42d-00cf4fc964ff';

// Decodable target ids (BBCCCVVV): Psalm 85:10 / Psalm 23:1 / Micah 7:18.
const TARGETS = ['KJV:19085010', 'KJV:19023001', 'KJV:33007018'] as const;
// Lamentations 3:22 — the resolvable missing/rescue reference.
const MISSING_TARGET = 'KJV:25003022';
// Psalm 88:3 — the rescue's resolved single verse (outside the window).
const RESCUE_TARGET = 'KJV:19088003';

const context = createJudgmentV2Context({
  caseId: CASE_ID,
  query: 'mercy',
  source: 'manual',
  observedWindow: 10,
  results: TARGETS.map((targetId, index) => ({
    targetId,
    rank: index + 1,
    reason: [{ family: 'token_overlap', label: 'Contains "mercy and truth"', points: 431 }],
  })),
});

let counter = 0;
function makeLog(overrides: Partial<JudgmentLogOptions> = {}) {
  counter += 1;
  return createJudgmentLog({
    logPath: path.join(tempRoot, `judgments-${counter}.jsonl`),
    reviewer: 'jesse',
    identity: { engineVersion: '0.9.0', corpusFingerprint: 'a'.repeat(64), layerFingerprint: 'b'.repeat(64) },
    v2Context: context,
    getExistingJudgments: async () => [],
    resolveReference: async (reference) =>
      reference === 'Lamentations 3:22' || reference === 'Psalm 88:3'
        ? 'excerpt for ' + reference
        : null,
    resolveReferenceTargetId: async (reference) =>
      reference === 'Lamentations 3:22' ? MISSING_TARGET : reference === 'Psalm 88:3' ? RESCUE_TARGET : null,
    ...overrides,
  });
}

describe('§4.4 client payloads validate against the real server validator', () => {
  it('Essential [E] — action, targetId, withinTop', async () => {
    const result = await makeLog().submit({ action: 'essential', targetId: TARGETS[0], withinTop: 3 });
    expect(result).toMatchObject({ ok: true });
  });

  it('Essential at every picker value the UI can send', async () => {
    for (const withinTop of [1, 3, 5, 10]) {
      const result = await makeLog().submit({ action: 'essential', targetId: TARGETS[0], withinTop });
      expect(result, `withinTop ${withinTop}`).toMatchObject({ ok: true });
    }
  });

  it('Helpful [H] — action + targetId only (the bulk row too)', async () => {
    const result = await makeLog().submit({ action: 'helpful', targetId: TARGETS[1] });
    expect(result).toMatchObject({ ok: true });
  });

  it('Not relevant — auto interview: lexical-noise, diagnosisInferred true', async () => {
    const result = await makeLog().submit({
      action: 'irrelevant',
      targetId: TARGETS[0],
      diagnosis: 'lexical-noise',
      diagnosisInferred: true,
    });
    expect(result).toMatchObject({ ok: true });
  });

  it('Not relevant — unresolved-label fallback carries the label as note', async () => {
    const result = await makeLog().submit({
      action: 'irrelevant',
      targetId: TARGETS[0],
      diagnosis: 'lexical-noise',
      diagnosisInferred: true,
      note: 'concept label "shepherd care" (unresolved id)',
    });
    expect(result).toMatchObject({ ok: true });
  });

  it('Not relevant — wrong-anchor: conceptId + note, NO diagnosisInferred key', async () => {
    const result = await makeLog().submit({
      action: 'irrelevant',
      targetId: TARGETS[1],
      diagnosis: 'wrong-anchor',
      conceptId: 'shepherd-care',
      note: 'The verse is about provision, not the named theme.',
    });
    expect(result).toMatchObject({ ok: true });
    const record = (result as { record: JudgmentRecordV2 }).record;
    expect('diagnosisInferred' in record).toBe(false);
  });

  it('Not relevant — concept-misfire: conceptId + note, NO diagnosisInferred key', async () => {
    const result = await makeLog().submit({
      action: 'irrelevant',
      targetId: TARGETS[1],
      diagnosis: 'concept-misfire',
      conceptId: 'shepherd-care',
      note: 'Speaks about the theme but is no answer for this query.',
    });
    expect(result).toMatchObject({ ok: true });
  });

  it('Missing passage [M] — canonical reference + withinTop + note', async () => {
    const result = await makeLog().submit({
      action: 'missing',
      reference: 'Lamentations 3:22',
      withinTop: 3,
      note: 'people also type steadfast love',
    });
    expect(result).toMatchObject({ ok: true });
  });

  it('Missing passage — note omitted: the server attaches the excerpt instead', async () => {
    const result = await makeLog().submit({ action: 'missing', reference: 'Lamentations 3:22', withinTop: 5 });
    expect(result).toMatchObject({ ok: true });
    expect((result as { record: JudgmentRecordV2 }).record.excerpt).toBe('excerpt for Lamentations 3:22');
  });

  it('Tail rescue — missing with withinTop 10 and a resolved single verse', async () => {
    const result = await makeLog().submit({ action: 'missing', reference: 'Psalm 88:3', withinTop: 10 });
    expect(result).toMatchObject({ ok: true });
  });

  it('Change of an existing call — same fields + supersedes, append-only on disk', async () => {
    const logPath = path.join(tempRoot, 'judgments-supersede.jsonl');
    const log = createJudgmentLog({
      logPath,
      reviewer: 'jesse',
      identity: { engineVersion: '0.9.0', corpusFingerprint: 'a'.repeat(64), layerFingerprint: 'b'.repeat(64) },
      v2Context: context,
      getExistingJudgments: async () => [],
      resolveReference: async () => null,
    });
    const first = await log.submit({ action: 'essential', targetId: TARGETS[0], withinTop: 3 });
    expect(first).toMatchObject({ ok: true });
    const firstRecord = (first as { record: JudgmentRecordV2 }).record;
    const second = await log.submit({
      action: 'helpful',
      targetId: TARGETS[0],
      supersedes: firstRecord.judgmentId,
    });
    expect(second).toMatchObject({ ok: true });
    // Append-only: the superseded record is still on disk; nothing rewritten.
    const lines = readFileSync(logPath, 'utf8').split('\n').filter((line) => line.trim() !== '');
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0]!).judgmentId).toBe(firstRecord.judgmentId);
    expect(JSON.parse(lines[1]!).supersedes).toBe(firstRecord.judgmentId);
    // A third correction must supersede the newest id, not the first.
    const staleSupersede = await log.submit({
      action: 'essential',
      targetId: TARGETS[0],
      withinTop: 1,
      supersedes: firstRecord.judgmentId,
    });
    expect(staleSupersede).toMatchObject({ ok: false });
    expect((staleSupersede as { reason: string }).reason).toContain('already superseded');
  });
});

describe('negative fixtures — the rejections the UI rules exist to avoid', () => {
  it('diagnosisInferred: false is rejected (omit it or send true only)', async () => {
    const result = await makeLog().submit({
      action: 'irrelevant',
      targetId: TARGETS[0],
      diagnosis: 'lexical-noise',
      diagnosisInferred: false,
    });
    expect(result).toMatchObject({ ok: false });
    expect((result as { reason: string }).reason).toContain('diagnosisInferred: true only');
  });

  it('a range/multi-verse missing reference is rejected — the §3.1/§4.4 rescue rule', async () => {
    // Stubbed resolveReferenceTargetId returns null for a range: the server
    // resolves a target only when the passage has exactly one verse.
    const result = await makeLog({
      resolveReference: async () => 'joined range excerpt',
      resolveReferenceTargetId: async () => null,
    }).submit({ action: 'missing', reference: 'Psalm 23:1-4', withinTop: 10 });
    expect(result).toMatchObject({ ok: false });
    expect((result as { reason: string }).reason).toContain('could not be resolved to an exact target identity');
  });

  it('a missing reference already displayed in the window is rejected with the §3.3 detection string', async () => {
    const result = await makeLog({
      resolveReference: async () => 'excerpt',
      resolveReferenceTargetId: async () => TARGETS[0],
    }).submit({ action: 'missing', reference: 'Psalm 85:10', withinTop: 10 });
    expect(result).toMatchObject({ ok: false });
    // Coupled string: judgments.ts's rejection, detected by message in the
    // client (§3.3 server-side detection; drift fails this test).
    expect((result as { reason: string }).reason).toContain('already present in the judged result set');
  });

  it('withinTop outside 1/3/5/10 is rejected', async () => {
    const result = await makeLog().submit({ action: 'essential', targetId: TARGETS[0], withinTop: 7 });
    expect(result).toMatchObject({ ok: false });
  });

  it('wrong-anchor without a note is rejected — the required why field is load-bearing', async () => {
    const result = await makeLog().submit({
      action: 'irrelevant',
      targetId: TARGETS[0],
      diagnosis: 'wrong-anchor',
      conceptId: 'shepherd-care',
    });
    expect(result).toMatchObject({ ok: false });
    expect((result as { reason: string }).reason).toContain('needs a note defending it from the text');
  });
});
