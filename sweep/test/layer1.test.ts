/**
 * MS-7 verification: the check roster's canaries — every known-wrong
 * signature from the battery era (ad7's sole-variant #1, th2's flat tie,
 * ms1's zero results, wrong-reason-at-right-rank per covenant #5, the
 * watchlist auto-escalation) must be classified correctly from published
 * evidence; plus the lint that keeps the watchlist OUT of the artifact
 * path, and an end-to-end pass over the real fixture engine.
 */
import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Grep } from './helpers/grepStub.js';
import { gradeLayer1, gradeLine, referenceMatches, type Layer1Context } from '../src/grade/layer1.js';
import { loadWatchlist } from '../src/grade/watchlist.js';
import { REPO_ROOT } from '../src/universe/compileFromRepo.js';
import type { SnapshotRecord, SnapshotResult } from '../src/snapshot.js';
import type { UniverseLine } from '../src/universe/types.js';
import { mergeShards, runSweep } from '../src/harness.js';
import { parseUniverse } from '../src/universe/types.js';
import { buildFixtureArtifact, writeSmallUniverse, type FixtureArtifact } from './helpers/fixtureArtifact.js';

const WATCHLIST = loadWatchlist();
const CONTEXT: Layer1Context = {
  watchlist: WATCHLIST,
  conceptLabels: new Set(['Faith', 'Grief and loss', 'Prayer']),
  baseSnapshots: new Map(),
};

function result(partial: Partial<SnapshotResult> & { reference: string; rank: number }): SnapshotResult {
  return {
    targetId: `verse:${partial.rank}`,
    excerpt: 'Without faith it is impossible to be well pleasing to him…',
    score: 50 - partial.rank,
    reasons: [{ family: 'concept_anchor', label: 'Theme: Faith', points: 40 }],
    ...partial,
  } as SnapshotResult;
}

function discovery(queryId: string, results: SnapshotResult[], corrections?: unknown[]): SnapshotRecord {
  return {
    queryId,
    query: 'q',
    kind: 'discovery',
    results,
    ...(corrections !== undefined ? { corrections: corrections as never } : {}),
    totalResults: results.length,
    elapsedMs: 1,
  };
}

const CONCEPT_LINE: UniverseLine = {
  queryId: 'g:1',
  query: 'faith',
  generator: 'g',
  category: 'felt-need',
  expectation: { kind: 'concept-anchors', conceptId: 'faith', anchors: ['Hebrews 11:6'] },
};

describe('reference matching', () => {
  it('matches exact, range-covering, and chapter-level references', () => {
    expect(referenceMatches('Hebrews 11:6', 'Hebrews 11:6')).toBe(true);
    expect(referenceMatches('James 2:17', 'James 2:14-26')).toBe(true);
    expect(referenceMatches('James 2:13', 'James 2:14-26')).toBe(false);
    expect(referenceMatches('Psalms 23', 'Psalms 23:1')).toBe(true);
    expect(referenceMatches('John 3:16', 'John 4:16')).toBe(false);
  });
});

describe('canaries — every seeded defect signature fires', () => {
  it('ad7 signature: sole weak translation_variant at #1 → wrong-verse, cause engine-scoring', () => {
    const record = discovery('g:1', [
      result({
        reference: 'Ecclesiastes 10:9',
        rank: 1,
        reasons: [{ family: 'translation_variant', label: 'NET reads…', points: 6 }] as never,
      }),
      result({ reference: 'Hebrews 11:6', rank: 2 }),
    ]);
    const verdicts = gradeLine(CONCEPT_LINE, record, CONTEXT);
    const junk = verdicts.find((v) => v.check === 'junk-sole-weak-evidence');
    expect(junk?.verdict).toBe('defect');
    expect(junk?.defect?.suspectedCause).toBe('engine-scoring');
  });

  it('watchlist: Job 16:2 leading a comfort-class query → theologically-harmful, AUTO-ESCALATED', () => {
    const line: UniverseLine = {
      queryId: 'g:2',
      query: 'comfort when my mother died',
      generator: 'g',
      category: 'felt-need',
      expectation: { kind: 'concept-anchors', conceptId: 'grief-and-loss', anchors: ['Psalms 34:18'] },
    };
    const record = discovery('g:2', [
      result({ reference: 'Job 16:2', rank: 1 }),
      result({ reference: 'Psalms 34:18', rank: 2 }),
    ]);
    const verdicts = gradeLine(line, record, CONTEXT);
    const hit = verdicts.find((v) => v.check === 'junk-watchlist');
    expect(hit?.verdict).toBe('defect');
    expect(hit?.defect?.severity).toBe('theologically-harmful');
    expect(hit?.defect?.autoEscalate).toBe(true);
    // The tooling flags, Jesse rules: the evidence quotes the documented sense.
    expect(hit?.defect?.causeEvidence).toMatch(/Job 16:2/);
  });

  it('mustNotLead adversarial rows escalate the same way', () => {
    const line: UniverseLine = {
      queryId: 'g:3',
      query: 'does god accept any offering i bring',
      generator: 'adversarial',
      category: 'adversarial',
      expectation: { kind: 'none' },
      mustNotLead: ['Malachi 1:9'],
    };
    const record = discovery('g:3', [result({ reference: 'Malachi 1:9', rank: 1 })]);
    const hit = gradeLine(line, record, CONTEXT).find((v) => v.check === 'junk-watchlist');
    expect(hit?.defect?.severity).toBe('theologically-harmful');
    expect(hit?.defect?.autoEscalate).toBe(true);
  });

  it('th2 signature: top-8 flat tie in canonical order → poor-prioritization', () => {
    const results = Array.from({ length: 8 }, (_, i) =>
      result({ reference: `Psalms ${i + 10}:1`, rank: i + 1, targetId: `verse:${1000 + i}`, score: 10 }),
    );
    const record = discovery('g:1', results);
    const tie = gradeLine(CONCEPT_LINE, record, CONTEXT).find((v) => v.check === 'flat-tie');
    expect(tie?.verdict).toBe('defect');
    expect(tie?.defect?.defectClass).toBe('poor-prioritization');
  });

  it('ms1 signature: misspelled query with bare empty → zero-results defect', () => {
    const line: UniverseLine = {
      queryId: 'bm:ms1',
      query: 'forgivness',
      generator: 'battery-misspelling',
      category: 'misspelling',
      expectation: { kind: 'correction-cited', misspelled: ['forgivness'] },
    };
    const verdicts = gradeLine(line, discovery('bm:ms1', []), CONTEXT);
    const zero = verdicts.find((v) => v.defect?.defectClass === 'zero-results');
    expect(zero, 'empty misspelling row must be a defect, never silence').toBeDefined();
  });

  it('covenant #5: right verse at right rank with the WRONG reason → wrong-explanation', () => {
    const record = discovery('g:1', [
      result({
        reference: 'Hebrews 11:6',
        rank: 1,
        reasons: [{ family: 'token_overlap', label: 'Shared words', points: 10 }] as never,
      }),
    ]);
    const verdict = gradeLine(CONCEPT_LINE, record, CONTEXT).find(
      (v) => v.check === 'curated-anchor-agreement',
    );
    expect(verdict?.verdict).toBe('defect');
    expect(verdict?.defect?.defectClass).toBe('wrong-explanation');
  });

  it('explanation integrity: stale Theme chip label → wrong-explanation, cause stale-label', () => {
    const record = discovery('g:1', [
      result({
        reference: 'Hebrews 11:6',
        rank: 1,
        reasons: [{ family: 'concept_anchor', label: 'Theme: Retired Concept', points: 40 }] as never,
      }),
    ]);
    const verdict = gradeLine(CONCEPT_LINE, record, CONTEXT).find(
      (v) => v.check === 'explanation-integrity',
    );
    expect(verdict?.defect?.suspectedCause).toBe('stale-label');
  });

  it('typed-kind: a fake book resolving as a reference → parse-failure', () => {
    const line: UniverseLine = {
      queryId: 'rv:1',
      query: 'Hezekiah 3:1',
      generator: 'reference-variants',
      category: 'reference-adjacent',
      expectation: { kind: 'verse-ref', expectInvalid: true },
    };
    const resolved: SnapshotRecord = {
      queryId: 'rv:1',
      query: 'Hezekiah 3:1',
      kind: 'reference',
      passage: { reference: 'Hezekiah 3:1', verseIds: [1] },
      totalResults: 0,
      elapsedMs: 1,
    };
    const verdict = gradeLine(line, resolved, CONTEXT).find((v) => v.check === 'reference-typed-kind');
    expect(verdict?.defect?.defectClass).toBe('parse-failure');
  });

  it('correction oracle: cited + same top-3 passes; diverging top-3 with citation is a defect', () => {
    const base = discovery('g:base', [
      result({ reference: 'Psalms 1:1', rank: 1, targetId: 'a' }),
      result({ reference: 'Psalms 2:1', rank: 2, targetId: 'b' }),
      result({ reference: 'Psalms 3:1', rank: 3, targetId: 'c' }),
    ]);
    const context: Layer1Context = { ...CONTEXT, baseSnapshots: new Map([['g:base', base]]) };
    const line: UniverseLine = {
      queryId: 'perturb:g:base~0',
      query: 'perturbed',
      generator: 'perturb',
      category: 'misspelling',
      expectation: { kind: 'base-query-oracle', baseQueryId: 'g:base', requireCitedCorrection: true },
    };
    const good = discovery('perturb:g:base~0', base.results as SnapshotResult[], [
      { typed: 'perturbd', corrected: 'perturb', distance: 1 },
    ]);
    expect(gradeLine(line, good, context)[0]!.verdict).toBe('pass');
    const diverged = discovery(
      'perturb:g:base~0',
      [
        result({ reference: 'Psalms 9:1', rank: 1, targetId: 'z' }),
        result({ reference: 'Psalms 2:1', rank: 2, targetId: 'b' }),
        result({ reference: 'Psalms 3:1', rank: 3, targetId: 'c' }),
      ],
      [{ typed: 'perturbd', corrected: 'perturb', distance: 1 }],
    );
    const bad = gradeLine(line, diverged, context)[0]!;
    expect(bad.verdict).toBe('defect');
    expect(bad.defect?.suspectedCause).toBe('spelling-correction');
  });

  it('residue routes to needs-ai-grade, never to a silent pass', () => {
    const line: UniverseLine = {
      queryId: 'g:none',
      query: 'sanctification',
      generator: 'theological-term',
      category: 'theological-term',
      expectation: { kind: 'none' },
    };
    const verdicts = gradeLine(line, discovery('g:none', [result({ reference: 'Romans 6:19', rank: 1 })]), CONTEXT);
    expect(verdicts.some((v) => v.verdict === 'needs-ai-grade')).toBe(true);
    expect(verdicts.some((v) => v.verdict === 'pass')).toBe(false);
  });
});

describe('watchlist boundary (lint-enforced)', () => {
  it('has the six seed rows, each with documented sense and citation; 1 Cor 11:20 pending J3', () => {
    const refs = WATCHLIST.map((row) => row.ref);
    expect(refs).toEqual([
      'Jeremiah 4:10',
      'Job 16:2',
      'Ecclesiastes 1:9',
      '1 Corinthians 11:20',
      'Luke 18:5',
      'Malachi 1:9',
    ]);
    for (const row of WATCHLIST) {
      expect(row.senseInContext.length).toBeGreaterThan(20);
      expect(row.citation.length).toBeGreaterThan(10);
    }
    expect(WATCHLIST.find((row) => row.ref === '1 Corinthians 11:20')?.status).toBe('pending-J3');
  });

  it('nothing on the artifact path references sweep grading data', () => {
    for (const dir of ['pipeline/src', 'engine/src']) {
      const hits = Grep(join(REPO_ROOT, dir), /sweep\/grading|negative-context-watchlist/);
      expect(hits, `${dir} must never read sweep-side grading data`).toEqual([]);
    }
  });
});

describe('end-to-end over the real fixture engine', () => {
  let bed: FixtureArtifact;

  beforeAll(async () => {
    bed = await buildFixtureArtifact('sweep-layer1-');
  }, 120_000);

  afterAll(() => {
    rmSync(bed.directory, { force: true, recursive: true, maxRetries: 3 });
  });

  it('grades a real run deterministically with a queue and zero uncovered lines', async () => {
    const universePath = writeSmallUniverse(bed.directory);
    const outDir = join(bed.directory, 'run');
    await runSweep({
      artifactPath: bed.artifactPath,
      universePath,
      outDir,
      descriptorPath: bed.descriptorPath,
    });
    mergeShards(outDir, 1);
    const lines = parseUniverse(readFileSync(universePath, 'utf8'));
    const records = new Map<string, SnapshotRecord>();
    for (const raw of readFileSync(join(outDir, 'snapshot-merged.jsonl'), 'utf8').split('\n')) {
      if (raw.length === 0) continue;
      const record = JSON.parse(raw) as SnapshotRecord;
      records.set(record.queryId, record);
    }
    const context: Layer1Context = { ...CONTEXT, baseSnapshots: records };
    const first = gradeLayer1(lines, records, context);
    const second = gradeLayer1(lines, records, context);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    // Every line received at least one verdict.
    const graded = new Set(first.verdicts.map((verdict) => verdict.queryId));
    for (const line of lines) expect(graded.has(line.queryId), line.queryId).toBe(true);
  });
});
