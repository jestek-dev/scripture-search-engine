/**
 * D3 (votes-to-engine plan, V1): the judgment-selection core is extracted
 * into workbench/src/effectiveJudgments.ts and shared by the compiler and
 * the deriver. The golden refactor test pins the compile-plan digest that
 * was computed on the tree BEFORE the extraction: the same judgment log must
 * yield a byte-identical `JudgmentCompilationPlan` digest after it.
 */
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { planJudgmentCompilation } from '../src/compileJudgments.js';
import {
  activeV2Judgments,
  canonicalReferenceOf,
  effectiveJudgments,
  parseJudgmentLog,
  referenceOfTargetId,
  slugOf,
  v2SupersessionKey,
  validateCasesForJudgments,
} from '../src/effectiveJudgments.js';
import type { JudgmentRecord, JudgmentRecordV2 } from '../src/judgments.js';

/**
 * Computed by running `planJudgmentCompilation` over this exact fixture tree
 * at branch state a1e4c6c, BEFORE the D3 extraction. The digest covers the
 * observed input hashes and every planned operation byte, so equality here
 * proves the refactor changed no compiled output.
 */
const PRE_REFACTOR_PLAN_DIGEST = '299402289d425f12e3a03602ee4224e4b880a9cf8ffdd5753ec843c04195bb4e';

const SUBSET = {
  $schema: 'verse-array-subset/1',
  generatedFrom: { translation: 'WEB', note: 'golden refactor fixture' },
  selection: [
    { book: 'James', chapters: [1, 2], why: 'golden fixture #1 anchor: hearers and doers' },
    { book: 'Matthew', chapters: [5, 6, 7], why: 'fixture #1 anchor (7:24-27) + dense teaching text' },
  ],
  verses: [
    { book_name: 'James', book: 59, chapter: 1, verse: 22, text: 'But be doers of the word…' },
  ],
};

const GOLDEN_LOG: readonly JudgmentRecord[] = [
  {
    at: '2026-08-01T10:00:00.000Z',
    reviewer: 'golden-reviewer',
    query: 'hearing and doing',
    verdict: 'doesnt-fit',
    targetId: 'WEB:59001022',
    cause: 'lexical-noise',
    engineVersion: '0.7.1-golden',
    corpusFingerprint: 'corpus-golden',
    layerFingerprint: 'layer-golden',
  },
  {
    at: '2026-08-01T10:01:00.000Z',
    reviewer: 'golden-reviewer',
    query: 'hearing and doing',
    verdict: 'missing',
    reference: 'James 2:14-26',
    note: 'Faith without works is dead — the doing of the word.',
    engineVersion: '0.7.1-golden',
    corpusFingerprint: 'corpus-golden',
    layerFingerprint: 'layer-golden',
  },
  {
    at: '2026-08-01T10:02:00.000Z',
    reviewer: 'golden-reviewer',
    query: 'hearing and doing',
    verdict: 'doesnt-fit',
    targetId: 'WEB:1005001',
    cause: 'wrong-anchor',
    conceptId: 'obedience-to-the-word',
    note: 'Genealogy; no thematic relation to hearing or doing.',
    engineVersion: '0.7.1-golden',
    corpusFingerprint: 'corpus-golden',
    layerFingerprint: 'layer-old',
  },
  {
    at: '2026-08-01T10:03:00.000Z',
    reviewer: 'golden-reviewer',
    query: 'hearing and doing',
    verdict: 'fits',
    targetId: 'WEB:59001022',
    pin: true,
    reasonFamily: 'concept_anchor',
    engineVersion: '0.7.1-golden',
    corpusFingerprint: 'corpus-golden',
    layerFingerprint: 'layer-golden',
  },
];

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'workbench-effective-'));
  await mkdir(path.join(root, 'artifacts'), { recursive: true });
  await mkdir(path.join(root, 'eval', 'golden'), { recursive: true });
  await mkdir(path.join(root, 'pipeline', 'fixtures'), { recursive: true });
  await mkdir(path.join(root, 'workbench'), { recursive: true });
  await writeFile(
    path.join(root, 'artifacts', 'content-artifact.json'),
    `${JSON.stringify({
      engineVersion: '0.7.1-golden',
      corpusFingerprint: 'corpus-golden',
      layerFingerprint: 'layer-golden',
    }, null, 2)}\n`,
  );
  await writeFile(path.join(root, 'pipeline', 'fixtures', 'web-subset.json'), `${JSON.stringify(SUBSET, null, 2)}\n`);
  await writeFile(
    path.join(root, 'workbench', 'judgments.jsonl'),
    GOLDEN_LOG.map((record) => `${JSON.stringify(record)}\n`).join(''),
  );
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

function stableUuid(label: string): string {
  const hex = createHash('sha256').update(label).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function v2(partial: Partial<JudgmentRecordV2> & Pick<JudgmentRecordV2, 'judgmentId' | 'query' | 'action' | 'at'>): JudgmentRecordV2 {
  return {
    schemaVersion: 2,
    reviewer: 'golden-reviewer',
    observedWindow: 10,
    resultSetDigest: 'a'.repeat(64),
    displayedWindowDigest: 'b'.repeat(64),
    source: 'manual',
    engineVersion: '0.7.1-golden',
    corpusFingerprint: 'corpus-golden',
    layerFingerprint: 'layer-golden',
    caseId: stableUuid(`case:${partial.query}`),
    observedRank: partial.action === 'missing' ? null : 1,
    ...partial,
    judgmentId: stableUuid(partial.judgmentId),
    ...(partial.supersedes === undefined ? {} : { supersedes: stableUuid(partial.supersedes) }),
  } as JudgmentRecordV2;
}

describe('D3 golden refactor proof', () => {
  it('the same judgment log yields a byte-identical compile plan digest after the extraction', async () => {
    const plan = await planJudgmentCompilation(root);
    expect(plan.digest).toBe(PRE_REFACTOR_PLAN_DIGEST);
  });

  it('the compile plan digest is stable across repeated planning', async () => {
    const first = await planJudgmentCompilation(root);
    const second = await planJudgmentCompilation(root);
    expect(second.digest).toBe(first.digest);
    expect(JSON.stringify(second.operations)).toBe(JSON.stringify(first.operations));
  });
});

describe('shared selection core', () => {
  it('selects only non-superseded v2 leaves and validates the correction graph', () => {
    const first = v2({ judgmentId: 'j1', query: 'q', action: 'irrelevant', at: '2026-08-01T10:00:00.000Z', targetId: 'WEB:59001022', diagnosis: 'lexical-noise' });
    const second = v2({ judgmentId: 'j2', query: 'q', action: 'essential', at: '2026-08-01T11:00:00.000Z', targetId: 'WEB:59001022', withinTop: 3, supersedes: 'j1' });
    const third = v2({ judgmentId: 'j3', query: 'q', action: 'helpful', at: '2026-08-01T12:00:00.000Z', targetId: 'WEB:59001022', supersedes: 'j2' });
    const leaves = activeV2Judgments([first, second, third]);
    expect(leaves.map((leaf) => leaf.judgmentId)).toEqual([third.judgmentId]);
  });

  it('refuses a forward supersession, a double superseder, and a timestamp inversion', () => {
    const prior = v2({ judgmentId: 'p', query: 'q', action: 'essential', at: '2026-08-01T10:00:00.000Z', targetId: 'WEB:59001022', withinTop: 3 });
    const later = v2({ judgmentId: 'l', query: 'q', action: 'essential', at: '2026-08-01T11:00:00.000Z', targetId: 'WEB:59001022', withinTop: 5, supersedes: 'p' });
    expect(() => activeV2Judgments([later, prior])).toThrow(/must supersede an earlier judgment/);
    const again = v2({ judgmentId: 'a', query: 'q', action: 'essential', at: '2026-08-01T12:00:00.000Z', targetId: 'WEB:59001022', withinTop: 1, supersedes: 'p' });
    expect(() => activeV2Judgments([prior, later, again])).toThrow(/multiple active superseding corrections/);
    const inverted = v2({ judgmentId: 'i', query: 'q', action: 'essential', at: '2026-08-01T09:00:00.000Z', targetId: 'WEB:59001022', withinTop: 1, supersedes: 'p' });
    expect(() => activeV2Judgments([prior, inverted])).toThrow(/timestamped after/);
  });

  it('mixed histories keep the v1 timestamp rule and add v2 leaves', () => {
    const records = parseJudgmentLog(GOLDEN_LOG.map((record) => JSON.stringify(record)).join('\n'));
    const effective = effectiveJudgments(records);
    // The 10:03 pinned fits supersedes the 10:00 doesnt-fit on the same target.
    const james = effective.filter((record) => 'verdict' in record && record.targetId === 'WEB:59001022');
    expect(james).toHaveLength(1);
    expect((james[0] as JudgmentRecord).verdict).toBe('fits');
  });

  it('keys supersession per class exactly as the judgment log does', () => {
    expect(v2SupersessionKey(v2({ judgmentId: 'm', query: 'q', action: 'missing', at: '2026-08-01T10:00:00.000Z', reference: 'James 1:22', withinTop: 10, note: 'n' })))
      .toBe('reference:James 1:22');
    expect(v2SupersessionKey(v2({ judgmentId: 't', query: 'q', action: 'essential', at: '2026-08-01T10:00:00.000Z', targetId: 'WEB:59001022', withinTop: 3 })))
      .toBe('target:WEB:59001022');
    const pair = v2SupersessionKey(v2({ judgmentId: 'pp', query: 'q', action: 'prefer', at: '2026-08-01T10:00:00.000Z', preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:40007024' }));
    expect(pair.startsWith('pair:')).toBe(true);
    expect(pair).toContain('WEB:40007024');
    expect(pair).toContain('WEB:59001022');
  });

  it('canonical reference handling refuses a cross-chapter range and decodes target ids', () => {
    expect(referenceOfTargetId('WEB:59001022')).toBe('James 1:22');
    expect(canonicalReferenceOf('James 2:14-26', 'test')).toBe('James 2:14-26');
    expect(() => canonicalReferenceOf('James 1:1-2:5', 'test')).toThrow(/single-chapter/);
    expect(slugOf('Who is like the Lord?')).toBe('who-is-like-the-lord');
  });

  it('case cross-validation is pure over observed bytes and matches the compiler behavior', () => {
    const record = v2({ judgmentId: 'c1', query: 'q', action: 'essential', at: '2026-08-01T10:00:00.000Z', targetId: 'WEB:59001022', withinTop: 3 });
    // v2 records without a case log refuse.
    expect(() => validateCasesForJudgments([record], {
      rawJudgmentsLog: `${JSON.stringify(record)}\n`,
      casesJsonl: null,
      migrationManifestJson: null,
    })).toThrow(/require a validated workbench\/cases.jsonl/);
    // A case log naming the case with the right query passes.
    const caseEvent = {
      schemaVersion: 2,
      eventId: stableUuid('event:q'),
      caseId: record.caseId,
      at: '2026-08-01T09:00:00.000Z',
      reviewer: 'golden-reviewer',
      sequence: 1,
      kind: 'case-created',
      query: 'q',
      source: 'manual',
      artifact: {
        engineVersion: '0.7.1-golden',
        corpusFingerprint: 'corpus-golden',
        layerFingerprint: 'layer-golden',
      },
    };
    expect(() => validateCasesForJudgments([record], {
      rawJudgmentsLog: `${JSON.stringify(record)}\n`,
      casesJsonl: `${JSON.stringify(caseEvent)}\n`,
      migrationManifestJson: null,
    })).not.toThrow();
    // A mismatched query refuses.
    expect(() => validateCasesForJudgments([{ ...record, query: 'other' }], {
      rawJudgmentsLog: `${JSON.stringify({ ...record, query: 'other' })}\n`,
      casesJsonl: `${JSON.stringify(caseEvent)}\n`,
      migrationManifestJson: null,
    })).toThrow(/query does not match case/);
  });
});
