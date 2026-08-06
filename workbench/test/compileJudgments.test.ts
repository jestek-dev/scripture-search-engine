import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Type-only import: proves at compile time that what the compiler writes is
// the exact shape G3 parses. Erased at runtime, so no eval code executes.
import type { CorpusFixture } from '../../eval/src/gates/corpusGolden.js';

import { compileJudgments } from '../src/compileJudgments.js';
import type { JudgmentRecord } from '../src/judgments.js';

// The compiler is a pure function of the log with an injectable repo root, so
// every test runs against a temp copy of the tree and the real working tree
// is never touched.
let root: string;

const CURRENT_LAYER = 'layer-current';

const SUBSET = {
  $schema: 'verse-array-subset/1',
  generatedFrom: { translation: 'WEB', note: 'test skeleton' },
  selection: [
    { book: 'James', chapters: [1, 2], why: 'golden fixture #1 anchor: hearers and doers' },
    { book: 'Matthew', chapters: [5, 6, 7], why: 'fixture #1 anchor (7:24-27) + dense teaching text' },
  ],
  verses: [
    { book_name: 'James', book: 59, chapter: 1, verse: 22, text: 'But be doers of the word…' },
  ],
};

function judgment(partial: Partial<JudgmentRecord> & Pick<JudgmentRecord, 'at' | 'query' | 'verdict'>): JudgmentRecord {
  return {
    reviewer: 'test-reviewer',
    engineVersion: '0.7.1-test',
    corpusFingerprint: 'corpus-test',
    layerFingerprint: CURRENT_LAYER,
    ...partial,
  } as JudgmentRecord;
}

// A synthetic log covering every routing-table row (§5): superseded ✗, plain
// ✓ (log-only), anchor-affecting ✗, lexical-noise ✗ without note, missing,
// pinned ✓ with reasonFamily — plus a second query judged under stale layers.
const LOG: JudgmentRecord[] = [
  judgment({
    at: '2026-08-01T10:00:00.000Z',
    query: 'hearing and doing',
    verdict: 'doesnt-fit',
    targetId: 'WEB:59001022',
    cause: 'lexical-noise',
  }),
  judgment({
    at: '2026-08-01T10:01:00.000Z',
    query: 'hearing and doing',
    verdict: 'fits',
    targetId: 'WEB:40007024', // plain ✓: log-only, must compile to nothing
  }),
  judgment({
    at: '2026-08-01T10:02:00.000Z',
    query: 'hearing and doing',
    verdict: 'doesnt-fit',
    targetId: 'WEB:1005001', // Genesis 5:1 — not in the subset
    cause: 'wrong-anchor',
    conceptId: 'obedience-to-the-word',
    note: 'Genealogy; no thematic relation to hearing or doing.',
  }),
  judgment({
    at: '2026-08-01T10:03:00.000Z',
    query: 'hearing and doing',
    verdict: 'doesnt-fit',
    targetId: 'WEB:19046001', // Psalms 46:1 — not in the subset
    cause: 'lexical-noise', // no note: why falls back to the cause
  }),
  judgment({
    at: '2026-08-01T10:04:00.000Z',
    query: 'hearing and doing',
    verdict: 'missing',
    reference: 'James 2:14-26',
    note: 'Faith without works is dead — the doing of the word.',
  }),
  judgment({
    at: '2026-08-01T10:05:00.000Z',
    query: 'hearing and doing',
    verdict: 'fits',
    targetId: 'WEB:59001022', // supersedes the 10:00 ✗ on the same target
    pin: true,
    reasonFamily: 'concept_anchor',
  }),
  judgment({
    at: '2026-08-02T09:00:00.000Z',
    query: 'shelter in the storm',
    verdict: 'doesnt-fit',
    targetId: 'WEB:43003016', // John 3:16 — not in the subset
    cause: 'concept-misfire',
    conceptId: 'refuge-in-trouble',
    note: 'Not about refuge; the concept lexicon over-matches here.',
    layerFingerprint: 'layer-old', // judged under layers that no longer exist
  }),
];

async function scaffold(log: readonly JudgmentRecord[]): Promise<void> {
  await mkdir(path.join(root, 'artifacts'), { recursive: true });
  await mkdir(path.join(root, 'eval', 'golden'), { recursive: true });
  await mkdir(path.join(root, 'pipeline', 'fixtures'), { recursive: true });
  await mkdir(path.join(root, 'workbench'), { recursive: true });
  await writeFile(
    path.join(root, 'artifacts', 'content-artifact.json'),
    `${JSON.stringify({ layerFingerprint: CURRENT_LAYER }, null, 2)}\n`,
  );
  await writeFile(
    path.join(root, 'pipeline', 'fixtures', 'web-subset.json'),
    `${JSON.stringify(SUBSET, null, 2)}\n`,
  );
  await writeFile(
    path.join(root, 'workbench', 'judgments.jsonl'),
    log.map((record) => `${JSON.stringify(record)}\n`).join(''),
  );
}

function goldenPath(slug: string): string {
  return path.join(root, 'eval', 'golden', `${slug}.json`);
}

async function readGolden(slug: string): Promise<CorpusFixture & { generatedBy?: string }> {
  return JSON.parse(await readFile(goldenPath(slug), 'utf8')) as CorpusFixture & {
    generatedBy?: string;
  };
}

beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'workbench-compile-'));
  await scaffold(LOG);
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('compile-judgments — routing (§5)', () => {
  it('routes every judgment kind into the CorpusFixture shape, pending-first', async () => {
    const outcome = await compileJudgments(root);
    expect(outcome.fixturesWritten.map((written) => written.path).sort()).toEqual([
      path.join('eval', 'golden', 'hearing-and-doing.json'),
      path.join('eval', 'golden', 'shelter-in-the-storm.json'),
    ]);

    const fixture = await readGolden('hearing-and-doing');
    expect(fixture.generatedBy).toBe('workbench');
    expect(fixture.id).toBe('hearing-and-doing');
    expect(fixture.status).toBe('pending');
    expect(fixture.query).toBe('hearing and doing');
    expect(fixture.expectedWithinTop).toBe(10);
    // Pinned ✓ carries its verified reasonFamily; missing pins the reference
    // as typed. The plain ✓ on Matthew 7:24 appears nowhere.
    expect(fixture.expectedTop).toEqual([
      { reference: 'James 1:22', requiredReasonFamily: 'concept_anchor' },
      { reference: 'James 2:14-26' },
    ]);
    // ✗ routes to mustNotRank; why is the note, or the cause when a
    // lexical-noise ✗ carries no note. The superseded ✗ on James 1:22 is gone.
    expect(fixture.mustNotRank).toEqual([
      { reference: 'Genesis 5:1', why: 'Genealogy; no thematic relation to hearing or doing.' },
      { reference: 'Psalms 46:1', why: 'lexical-noise' },
    ]);

    const shelter = await readGolden('shelter-in-the-storm');
    expect(shelter.status).toBe('pending');
    expect(shelter.expectedTop).toEqual([]);
    expect(shelter.mustNotRank).toEqual([
      { reference: 'John 3:16', why: 'Not about refuge; the concept lexicon over-matches here.' },
    ]);
  });

  it('proposes chapter-granular subset additions for passages CI never sampled', async () => {
    const outcome = await compileJudgments(root);
    expect(outcome.proposedSelections).toEqual([
      { book: 'Genesis', chapters: [5], why: 'workbench judgment: hearing and doing (2026-08-01)' },
      { book: 'Psalms', chapters: [46], why: 'workbench judgment: hearing and doing (2026-08-01)' },
      { book: 'John', chapters: [3], why: 'workbench judgment: shelter in the storm (2026-08-02)' },
    ]);

    const subset = JSON.parse(
      await readFile(path.join(root, 'pipeline', 'fixtures', 'web-subset.json'), 'utf8'),
    ) as typeof SUBSET;
    // Original entries and the verses array are untouched; proposals are
    // appended in the file's real entry format.
    expect(subset.selection.slice(0, 2)).toEqual(SUBSET.selection);
    expect(subset.selection.slice(2)).toEqual(outcome.proposedSelections);
    expect(subset.verses).toEqual(SUBSET.verses);
    expect(subset.$schema).toBe(SUBSET.$schema);
    // James 2 (the missing judgment) is already sampled: no proposal for it.
    expect(outcome.proposedSelections.some((entry) => entry.book === 'James')).toBe(false);

    expect(outcome.report).toContain('npm run gauntlet -- --update-baseline');
  });

  it('warns per judgment made under a layerFingerprint that is no longer current', async () => {
    const outcome = await compileJudgments(root);
    expect(outcome.warnings).toHaveLength(1);
    expect(outcome.warnings[0]).toContain('shelter in the storm');
    expect(outcome.warnings[0]).toContain('layer-old');
    expect(outcome.warnings[0]).toContain(CURRENT_LAYER);
  });

  it('prints the manual ontology checklist for missing and anchor-affecting ✗', async () => {
    const outcome = await compileJudgments(root);
    expect(outcome.checklist).toEqual([
      '[ ] wrong-anchor: concept obedience-to-the-word produced bad evidence on Genesis 5:1 ' +
        'for "hearing and doing" — Genealogy; no thematic relation to hearing or doing.',
      '[ ] missing: "hearing and doing" should surface James 2:14-26 — Faith without works ' +
        'is dead — the doing of the word.',
      '[ ] concept-misfire: concept refuge-in-trouble produced bad evidence on John 3:16 ' +
        'for "shelter in the storm" — Not about refuge; the concept lexicon over-matches here.',
    ]);
    expect(outcome.report).toContain('concept-curation');
    // The standing closer: the compiler's job ends at the working tree.
    expect(outcome.report).toContain('review with `git diff`');
    expect(outcome.report).toContain('npm run verify');
  });
});

describe('compile-judgments — determinism and ownership', () => {
  it('re-runs byte-identically on the same log', async () => {
    await compileJudgments(root);
    const files = [
      goldenPath('hearing-and-doing'),
      goldenPath('shelter-in-the-storm'),
      path.join(root, 'pipeline', 'fixtures', 'web-subset.json'),
    ];
    const before = await Promise.all(files.map((file) => readFile(file, 'utf8')));
    await compileJudgments(root);
    const after = await Promise.all(files.map((file) => readFile(file, 'utf8')));
    expect(after).toEqual(before);
  });

  it('preserves a human promotion to active on marked fixtures', async () => {
    await compileJudgments(root);
    const fixture = await readGolden('hearing-and-doing');
    await writeFile(
      goldenPath('hearing-and-doing'),
      `${JSON.stringify({ ...fixture, status: 'active' }, null, 2)}\n`,
    );
    await compileJudgments(root);
    expect((await readGolden('hearing-and-doing')).status).toBe('active');
  });

  it('refuses to touch a fixture without the workbench marker, naming the file', async () => {
    await writeFile(
      goldenPath('hearing-and-doing'),
      `${JSON.stringify({ id: 'hearing-and-doing', status: 'active', query: 'hearing and doing' }, null, 2)}\n`,
    );
    await expect(compileJudgments(root)).rejects.toThrow(/hearing-and-doing\.json/);
    await expect(compileJudgments(root)).rejects.toThrow(/hand-written/);
    // Validate-before-write: nothing else was written either.
    await expect(readFile(goldenPath('shelter-in-the-storm'), 'utf8')).rejects.toThrow();
  });

  it('compiles an empty log to nothing, with the closer still printed', async () => {
    await writeFile(path.join(root, 'workbench', 'judgments.jsonl'), '');
    const outcome = await compileJudgments(root);
    expect(outcome.fixturesWritten).toEqual([]);
    expect(outcome.proposedSelections).toEqual([]);
    expect(outcome.report).toContain('No fixture files to write');
    expect(outcome.report).toContain('review with `git diff`');
  });

  it('fails loudly on a log line that is not valid JSON', async () => {
    await writeFile(path.join(root, 'workbench', 'judgments.jsonl'), '{"broken\n');
    await expect(compileJudgments(root)).rejects.toThrow(/line 1/);
  });
});
