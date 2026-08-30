import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Type-only import: proves at compile time that what the compiler writes is
// the exact shape G3 parses. Erased at runtime, so no eval code executes.
import type { CorpusFixture } from '../../eval/src/gates/corpusGolden.js';

import {
  applyJudgmentCompilationPlan,
  compileJudgments,
  planJudgmentCompilation,
} from '../src/compileJudgments.js';
import type { JudgmentRecord, JudgmentRecordV2 } from '../src/judgments.js';

// The compiler is a pure function of the log with an injectable repo root, so
// every test runs against a temp copy of the tree and the real working tree
// is never touched.
let root: string;

const SNAPSHOT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

const CURRENT_ENGINE = '0.7.1-test';
const CURRENT_CORPUS = 'corpus-test';
const CURRENT_LAYER = 'layer-current';

function stableUuid(label: string): string {
  const hex = createHash('sha256').update(label).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

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
    engineVersion: CURRENT_ENGINE,
    corpusFingerprint: CURRENT_CORPUS,
    layerFingerprint: CURRENT_LAYER,
    ...partial,
  } as JudgmentRecord;
}

function v2Judgment(
  partial: Partial<JudgmentRecordV2> & Pick<JudgmentRecordV2, 'judgmentId' | 'query' | 'action'>,
): JudgmentRecordV2 {
  return {
    schemaVersion: 2,
    at: '2026-08-03T10:00:00.000Z',
    reviewer: 'test-reviewer',
    observedWindow: 10,
    resultSetDigest: 'a'.repeat(64),
    displayedWindowDigest: 'b'.repeat(64),
    source: 'manual',
    engineVersion: CURRENT_ENGINE,
    corpusFingerprint: CURRENT_CORPUS,
    layerFingerprint: CURRENT_LAYER,
    ...partial,
    judgmentId: stableUuid(partial.judgmentId),
    caseId: stableUuid(`case:${partial.query}`),
    ...(partial.supersedes === undefined ? {} : { supersedes: stableUuid(partial.supersedes) }),
    observedRank: partial.action === 'missing' ? null : 1,
  } as JudgmentRecordV2;
}

async function writeV2History(
  records: readonly JudgmentRecordV2[],
  legacy: readonly JudgmentRecord[] = [],
): Promise<void> {
  const baseTime = Date.parse('2026-08-03T10:00:00.000Z');
  const chronological = records.map((record, index) => ({
    ...record,
    at: new Date(baseTime + index * 1_000).toISOString(),
  }));
  await writeFile(
    path.join(root, 'workbench', 'judgments.jsonl'),
    [...legacy, ...chronological].map((record) => `${JSON.stringify(record)}\n`).join(''),
  );
  const byCase = new Map(chronological.map((record) => [record.caseId, record]));
  const events = [...byCase.values()].map((record) => ({
    schemaVersion: 2,
    eventId: stableUuid(`event:${record.caseId}`),
    caseId: record.caseId,
    at: new Date(baseTime - 1_000).toISOString(),
    reviewer: record.reviewer,
    sequence: 1,
    kind: 'case-created',
    query: record.query,
    source: record.source,
    artifact: {
      engineVersion: record.engineVersion,
      corpusFingerprint: record.corpusFingerprint,
      layerFingerprint: record.layerFingerprint,
    },
  }));
  await writeFile(
    path.join(root, 'workbench', 'cases.jsonl'),
    events.map((event) => `${JSON.stringify(event)}\n`).join(''),
  );
}

// A synthetic log covering every routing-table row (§5): superseded ✗, plain
// ✓ (log-only), anchor-affecting ✗, lexical-noise ✗ without note, missing,
// pinned ✓ with reasonFamily — plus a second query judged under stale layers
// and a note-less missing defended by its server-attached excerpt (§4 v1.1).
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
  judgment({
    at: '2026-08-02T09:01:00.000Z',
    query: 'shelter in the storm',
    verdict: 'missing',
    reference: 'Psalms 46:1', // no note: the server-attached excerpt defends it
    excerpt: 'God is our refuge and strength, a very present help in trouble.',
  }),
];

async function scaffold(log: readonly JudgmentRecord[]): Promise<void> {
  await mkdir(path.join(root, 'artifacts'), { recursive: true });
  await mkdir(path.join(root, 'eval', 'golden'), { recursive: true });
  await mkdir(path.join(root, 'pipeline', 'fixtures'), { recursive: true });
  await mkdir(path.join(root, 'workbench'), { recursive: true });
  await writeFile(
    path.join(root, 'artifacts', 'content-artifact.json'),
    `${JSON.stringify({
      engineVersion: CURRENT_ENGINE,
      corpusFingerprint: CURRENT_CORPUS,
      layerFingerprint: CURRENT_LAYER,
    }, null, 2)}\n`,
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
    // ✗ routes to mustNotRank; why is the note, or the plain-language
    // fallback when a lexical-noise ✗ carries no note (never the jargon
    // token). The superseded ✗ on James 1:22 is gone.
    expect(fixture.mustNotRank).toEqual([
      { reference: 'Genesis 5:1', why: 'Genealogy; no thematic relation to hearing or doing.' },
      { reference: 'Psalms 46:1', why: 'matched words, not meaning; judged not a fit for this query' },
    ]);

    const shelter = await readGolden('shelter-in-the-storm');
    expect(shelter.status).toBe('pending');
    // The excerpt-backed missing judgment pins the reference like any other.
    expect(shelter.expectedTop).toEqual([{ reference: 'Psalms 46:1' }]);
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

  it('tolerates verse-level subset selections without granting chapter membership', async () => {
    // The real pipeline/fixtures/web-subset.json carries verse-level entries
    // (P5.2/QR-3, e.g. Song of Solomon `verses: ["2:1"]`) that have no
    // `chapters` array at all; the compiler used to crash on them
    // ("TypeError: selection.chapters is not iterable", flagged in PR #49).
    // A verse-level sample of Psalms 46:1 also must not count as chapter
    // membership — only that one verse is in the fixture corpus, so the
    // chapter-granular proposal for the judged passage still stands.
    const subset = {
      ...SUBSET,
      selection: [
        ...SUBSET.selection,
        { book: 'Psalms', verses: ['46:1'], why: 'P5.2/QR-3: single-verse sample' },
        { book: 'Song of Solomon', verses: ['2:1'], why: 'P5.2/QR-3: single-verse sample' },
      ],
    };
    await writeFile(
      path.join(root, 'pipeline', 'fixtures', 'web-subset.json'),
      `${JSON.stringify(subset, null, 2)}\n`,
    );

    const outcome = await compileJudgments(root);
    expect(outcome.proposedSelections).toEqual([
      { book: 'Genesis', chapters: [5], why: 'workbench judgment: hearing and doing (2026-08-01)' },
      { book: 'Psalms', chapters: [46], why: 'workbench judgment: hearing and doing (2026-08-01)' },
      { book: 'John', chapters: [3], why: 'workbench judgment: shelter in the storm (2026-08-02)' },
    ]);

    // The verse-level entries round-trip untouched; proposals append after them.
    const written = JSON.parse(
      await readFile(path.join(root, 'pipeline', 'fixtures', 'web-subset.json'), 'utf8'),
    ) as typeof subset;
    expect(written.selection.slice(0, subset.selection.length)).toEqual(subset.selection);
    expect(written.selection.slice(subset.selection.length)).toEqual(outcome.proposedSelections);
  });

  it('warns per judgment made under a layerFingerprint that is no longer current', async () => {
    const outcome = await compileJudgments(root);
    expect(outcome.warnings).toHaveLength(1);
    expect(outcome.warnings[0]).toContain('shelter in the storm');
    expect(outcome.warnings[0]).toContain('layerFingerprint');
    expect(outcome.warnings[0]).toContain('layer-old');
    expect(outcome.warnings[0]).toContain(CURRENT_LAYER);
  });

  // Votes-to-engine plan D1: staleness warnings cover the full identity
  // triple, each warning naming the exact dimension that moved — a judgment
  // made under an older engineVersion or corpusFingerprint must not compile
  // silently just because the layers happen to match.
  it('warns per moved identity dimension — engine, corpus, and layer each pin a warning', async () => {
    await scaffold([
      judgment({
        at: '2026-08-01T10:00:00.000Z',
        query: 'hearing and doing',
        verdict: 'missing',
        reference: 'James 2:14-26',
        note: 'Faith without works is dead.',
        engineVersion: 'engine-old',
      }),
      judgment({
        at: '2026-08-01T10:01:00.000Z',
        query: 'shelter in the storm',
        verdict: 'missing',
        reference: 'Psalms 46:1',
        excerpt: 'God is our refuge and strength, a very present help in trouble.',
        corpusFingerprint: 'corpus-old',
      }),
      judgment({
        at: '2026-08-01T10:02:00.000Z',
        query: 'strength renewed',
        verdict: 'missing',
        reference: 'Isaiah 40:31',
        excerpt: 'But those who wait for Yahweh will renew their strength.',
        layerFingerprint: 'layer-old',
      }),
    ]);
    const outcome = await compileJudgments(root);
    expect(outcome.warnings).toHaveLength(3);
    const [engineWarning, corpusWarning, layerWarning] = outcome.warnings;

    expect(engineWarning).toContain('"hearing and doing"');
    expect(engineWarning).toContain('engineVersion');
    expect(engineWarning).toContain('engine-old');
    expect(engineWarning).toContain(CURRENT_ENGINE);
    expect(engineWarning).toContain('the engine has changed since');

    expect(corpusWarning).toContain('"shelter in the storm"');
    expect(corpusWarning).toContain('corpusFingerprint');
    expect(corpusWarning).toContain('corpus-old');
    expect(corpusWarning).toContain(CURRENT_CORPUS);
    expect(corpusWarning).toContain('the scripture text has changed since');

    expect(layerWarning).toContain('"strength renewed"');
    expect(layerWarning).toContain('layerFingerprint');
    expect(layerWarning).toContain('layer-old');
    expect(layerWarning).toContain(CURRENT_LAYER);
    expect(layerWarning).toContain('the layers have changed since');

    for (const warning of outcome.warnings) {
      expect(warning).toContain('re-confirm rather than trust it.');
    }
  });

  it('warns once per moved dimension when a single judgment is stale on all three', async () => {
    await scaffold([
      judgment({
        at: '2026-08-01T10:00:00.000Z',
        query: 'hearing and doing',
        verdict: 'missing',
        reference: 'James 2:14-26',
        note: 'Faith without works is dead.',
        engineVersion: 'engine-old',
        corpusFingerprint: 'corpus-old',
        layerFingerprint: 'layer-old',
      }),
    ]);
    const outcome = await compileJudgments(root);
    expect(outcome.warnings).toHaveLength(3);
    expect(outcome.warnings.filter((warning) => warning.includes('engineVersion'))).toHaveLength(1);
    expect(outcome.warnings.filter((warning) => warning.includes('corpusFingerprint'))).toHaveLength(1);
    expect(outcome.warnings.filter((warning) => warning.includes('layerFingerprint'))).toHaveLength(1);
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
      // A note-less missing judgment defends itself with the attached text.
      '[ ] missing: "shelter in the storm" should surface Psalms 46:1 — ' +
        'text: "God is our refuge and strength, a very present help in trouble."',
    ]);
    expect(outcome.report).toContain('concept-curation');
    // The standing closer: the compiler's job ends at the working tree.
    expect(outcome.report).toContain('review with `git diff`');
    expect(outcome.report).toContain('npm run verify');
  });
});

describe('compile-judgments — determinism and ownership', () => {
  it('keeps the legacy v1 fixture bytes exactly compatible', async () => {
    await compileJudgments(root);
    for (const slug of ['hearing-and-doing', 'shelter-in-the-storm']) {
      const [actual, expected] = await Promise.all([
        readFile(goldenPath(slug)),
        readFile(path.join(SNAPSHOT_DIR, `legacy-${slug}.json`)),
      ]);
      expect(actual.equals(expected), `${slug} must remain byte-for-byte compatible`).toBe(true);
    }
  });

  it('compiles active v2 windows, irrelevant, and preferred order', async () => {
    const v2 = [
      v2Judgment({ judgmentId: 'old', query: 'v2 ranking', action: 'irrelevant', targetId: 'WEB:59001022', diagnosis: 'lexical-noise' }),
      v2Judgment({ judgmentId: 'new', query: 'v2 ranking', action: 'helpful', targetId: 'WEB:59001022', supersedes: 'old' }),
      v2Judgment({ judgmentId: 'essential', query: 'v2 ranking', action: 'essential', targetId: 'WEB:59001022', withinTop: 1 }),
      v2Judgment({
        judgmentId: 'missing',
        query: 'v2 ranking',
        action: 'missing',
        reference: 'James 2:14-26',
        withinTop: 10,
        note: 'Faith expressed through action belongs in these results.',
      }),
      v2Judgment({ judgmentId: 'irrelevant', query: 'v2 ranking', action: 'irrelevant', targetId: 'WEB:1005001', diagnosis: 'lexical-noise' }),
      v2Judgment({ judgmentId: 'prefer', query: 'v2 ranking', action: 'prefer', preferredTargetId: 'WEB:59001022', otherTargetId: 'WEB:45003016' }),
    ];
    await writeV2History(v2, LOG);
    await compileJudgments(root);
    const fixture = await readGolden('v2-ranking') as CorpusFixture & {
      expectedTop: { ref?: string; reference?: string; withinTop?: number }[];
      preferredOrder?: { above: string; below: string; withinTop: number }[];
    };
    expect(fixture.expectedTop).toEqual([
      { ref: 'James 1:22', withinTop: 1 },
      { ref: 'James 2:14-26', withinTop: 10 },
    ]);
    expect(fixture.expectedWithinTop).toBeUndefined();
    expect(fixture.mustNotRank).toEqual([{ ref: 'Genesis 5:1', why: 'matched words, not meaning; judged not a fit for this query' }]);
    expect(fixture.preferredOrder).toEqual([{ above: 'James 1:22', below: 'Romans 3:16', withinTop: 10 }]);
    const before = await readFile(goldenPath('v2-ranking'), 'utf8');
    await compileJudgments(root);
    expect(await readFile(goldenPath('v2-ranking'), 'utf8')).toBe(before);
  });

  it('rejects contradictory and malformed v2 histories', async () => {
    const base = v2Judgment({ judgmentId: 'one', query: 'conflict', action: 'essential', targetId: 'WEB:59001022', withinTop: 1 });
    const opposite = v2Judgment({ judgmentId: 'two', query: 'conflict', action: 'irrelevant', targetId: 'WEB:59001022', diagnosis: 'lexical-noise' });
    await writeV2History([base, opposite]);
    await expect(compileJudgments(root)).rejects.toThrow(/both expects and forbids/);
    await writeV2History([
      { ...base, judgmentId: stableUuid('bad'), supersedes: stableUuid('absent') },
    ]);
    await expect(compileJudgments(root)).rejects.toThrow(/unknown judgment/);

    const prior = v2Judgment({ judgmentId: 'time-prior', query: 'backdated correction', action: 'helpful', targetId: 'WEB:59001022' });
    const correction = v2Judgment({ judgmentId: 'time-correction', query: 'backdated correction', action: 'helpful', targetId: 'WEB:59001022', supersedes: 'time-prior' });
    await writeV2History([prior, correction]);
    const judgmentsPath = path.join(root, 'workbench', 'judgments.jsonl');
    const rows = (await readFile(judgmentsPath, 'utf8')).trim().split('\n').map((line) => JSON.parse(line) as Record<string, unknown>);
    rows[1]!.at = '2026-08-03T09:59:59.000Z';
    await writeFile(judgmentsPath, `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`);
    await expect(compileJudgments(root)).rejects.toThrow(/timestamped after/);
  });

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

  it('demotes an active generated fixture when its assertions materially change', async () => {
    const original = v2Judgment({
      judgmentId: 'original-window',
      query: 'changing assertion',
      action: 'essential',
      targetId: 'WEB:59001022',
      withinTop: 1,
    });
    await writeV2History([original]);
    await compileJudgments(root);
    const active = { ...(await readGolden('changing-assertion')), status: 'active' };
    await writeFile(goldenPath('changing-assertion'), `${JSON.stringify(active, null, 2)}\n`);

    const correction = v2Judgment({
      judgmentId: 'corrected-window',
      query: 'changing assertion',
      action: 'essential',
      targetId: 'WEB:59001022',
      withinTop: 3,
      supersedes: 'original-window',
    });
    await writeV2History([original, correction]);
    await compileJudgments(root);
    expect((await readGolden('changing-assertion')).status).toBe('pending');
  });

  it('removes an obsolete workbench fixture when corrections leave no assertions', async () => {
    const irrelevant = v2Judgment({
      judgmentId: 'remove-old',
      query: 'remove obsolete fixture',
      action: 'irrelevant',
      targetId: 'WEB:59001022',
      diagnosis: 'lexical-noise',
    });
    await writeV2History([irrelevant]);
    await compileJudgments(root);
    const helpful = v2Judgment({
      judgmentId: 'remove-new',
      query: 'remove obsolete fixture',
      action: 'helpful',
      targetId: 'WEB:59001022',
      supersedes: 'remove-old',
    });
    await writeV2History([irrelevant, helpful]);
    const outcome = await compileJudgments(root);
    expect(outcome.fixturesRemoved).toEqual([path.join('eval', 'golden', 'remove-obsolete-fixture.json')]);
    await expect(readFile(goldenPath('remove-obsolete-fixture'))).rejects.toThrow();
  });

  it('accepts an explicit reverse-pair correction and emits only the surviving direction', async () => {
    const first = v2Judgment({
      judgmentId: 'pair-first',
      query: 'reverse pair',
      action: 'prefer',
      preferredTargetId: 'WEB:59001022',
      otherTargetId: 'WEB:45003016',
    });
    const reverse = v2Judgment({
      judgmentId: 'pair-reverse',
      query: 'reverse pair',
      action: 'prefer',
      preferredTargetId: 'WEB:45003016',
      otherTargetId: 'WEB:59001022',
      supersedes: 'pair-first',
    });
    await writeV2History([first, reverse]);
    await compileJudgments(root);
    expect((await readGolden('reverse-pair')).preferredOrder).toEqual([
      { above: 'Romans 3:16', below: 'James 1:22', withinTop: 10 },
    ]);
  });

  it('rejects conflicting windows, overlapping ranges, and case/query mismatches', async () => {
    const tight = v2Judgment({ judgmentId: 'tight', query: 'window conflict', action: 'missing', reference: 'James 2:14-26', withinTop: 1, note: 'Expected.' });
    const broad = v2Judgment({ judgmentId: 'broad', query: 'window conflict', action: 'missing', reference: 'James 2:14-26', withinTop: 3, note: 'Expected.' });
    await writeV2History([tight, broad]);
    await expect(compileJudgments(root)).rejects.toThrow(/conflicting rank windows/);

    const expected = v2Judgment({ judgmentId: 'range', query: 'range conflict', action: 'missing', reference: 'James 2:14-26', withinTop: 10, note: 'Expected.' });
    const forbidden = v2Judgment({ judgmentId: 'verse', query: 'range conflict', action: 'irrelevant', targetId: 'WEB:59002020', diagnosis: 'lexical-noise' });
    await writeV2History([expected, forbidden]);
    await expect(compileJudgments(root)).rejects.toThrow(/both expects and forbids overlapping/);

    const mismatch = v2Judgment({ judgmentId: 'mismatch', query: 'judgment query', action: 'helpful', targetId: 'WEB:59001022' });
    await writeV2History([mismatch]);
    const casesPath = path.join(root, 'workbench', 'cases.jsonl');
    const event = JSON.parse(await readFile(casesPath, 'utf8')) as Record<string, unknown>;
    event.query = 'different case query';
    await writeFile(casesPath, `${JSON.stringify(event)}\n`);
    await expect(compileJudgments(root)).rejects.toThrow(/query does not match case/);
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

describe('compile-judgments — closed legacy log recovery', () => {
  // The real committed legacy trio: judgments.jsonl, cases.jsonl, and the
  // closed migration manifest, copied verbatim into the temp root.
  async function scaffoldRealLegacy(): Promise<{ judgmentsPath: string; rawJudgments: string }> {
    const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
    const judgmentsPath = path.join(root, 'workbench', 'judgments.jsonl');
    const rawJudgments = await readFile(path.join(repo, 'workbench', 'judgments.jsonl'), 'utf8');
    await mkdir(path.join(root, 'workbench', 'legacy'), { recursive: true });
    await writeFile(judgmentsPath, rawJudgments);
    await writeFile(
      path.join(root, 'workbench', 'cases.jsonl'),
      await readFile(path.join(repo, 'workbench', 'cases.jsonl'), 'utf8'),
    );
    await writeFile(
      path.join(root, 'workbench', 'legacy', 'migration-manifest.json'),
      await readFile(path.join(repo, 'workbench', 'legacy', 'migration-manifest.json'), 'utf8'),
    );
    return { judgmentsPath, rawJudgments };
  }

  it('fails loud on a stray legacy append — naming the file line to delete — and recovers once it is gone', async () => {
    const { judgmentsPath, rawJudgments } = await scaffoldRealLegacy();
    // Compilation of the intact committed history works.
    await expect(planJudgmentCompilation(root)).resolves.toBeDefined();

    const strayRecord = { ...JSON.parse(rawJudgments.split('\n')[0]!) as object, note: 'a stray legacy append' };
    await writeFile(judgmentsPath, `${rawJudgments}${JSON.stringify(strayRecord)}\n`);
    let failure: Error | null = null;
    try {
      await planJudgmentCompilation(root);
    } catch (error) {
      failure = error as Error;
    }
    expect(failure).not.toBeNull();
    expect(failure!.message).toContain('line(s) 4');
    expect(failure!.message).toContain('delete the stray line(s)');

    // Recoverable, not a permanent brick: deleting the stray restores compilation.
    await writeFile(judgmentsPath, rawJudgments);
    await expect(planJudgmentCompilation(root)).resolves.toBeDefined();
  });

  it('reports the true file line number when the stray sits after v2 lines', async () => {
    const { judgmentsPath, rawJudgments } = await scaffoldRealLegacy();
    const v2 = v2Judgment({ judgmentId: 'stray-suffix', query: 'Who is like the Lord?', action: 'helpful', targetId: 'WEB:2015011' });
    const caseIdMatch = /"caseId":"([0-9a-f-]+)"/.exec(await readFile(path.join(root, 'workbench', 'cases.jsonl'), 'utf8'));
    const stray = { ...JSON.parse(rawJudgments.split('\n')[0]!) as object, note: 'a stray after v2 history' };
    await writeFile(
      judgmentsPath,
      `${rawJudgments}${JSON.stringify({ ...v2, caseId: caseIdMatch![1]! })}\n${JSON.stringify(stray)}\n`,
    );
    await expect(planJudgmentCompilation(root)).rejects.toThrow(/line\(s\) 5/);
  });
});

describe('compile-judgments preview/apply', () => {
  it('previews exact mutations without touching the repository', async () => {
    const subsetBefore = await readFile(path.join(root, 'pipeline', 'fixtures', 'web-subset.json'), 'utf8');
    const plan = await planJudgmentCompilation(root);

    expect(plan.schemaVersion).toBe(1);
    expect(plan.digest).toMatch(/^[a-f0-9]{64}$/);
    expect(plan.operations.length).toBeGreaterThan(0);
    await expect(readFile(goldenPath('hearing-and-doing'), 'utf8')).rejects.toThrow();
    expect(await readFile(path.join(root, 'pipeline', 'fixtures', 'web-subset.json'), 'utf8')).toBe(subsetBefore);

    await applyJudgmentCompilationPlan(root, plan, plan.digest);
    expect(await readFile(goldenPath('hearing-and-doing'), 'utf8')).toBe(
      plan.operations.find((operation) => operation.path.endsWith('hearing-and-doing.json'))!.afterText,
    );
  });

  it('rejects stale inputs before writing any operation', async () => {
    const plan = await planJudgmentCompilation(root);
    await writeFile(path.join(root, 'workbench', 'judgments.jsonl'), '');

    await expect(applyJudgmentCompilationPlan(root, plan, plan.digest)).rejects.toThrow(/stale/);
    await expect(readFile(goldenPath('hearing-and-doing'), 'utf8')).rejects.toThrow();
  });

  it('revalidates judgment inputs inside the same journal transaction before applying', async () => {
    const plan = await planJudgmentCompilation(root);
    const judgmentsPath = path.join(root, 'workbench', 'judgments.jsonl');
    await expect(applyJudgmentCompilationPlan(root, plan, plan.digest, {
      apply: {
        onPhase: async (phase) => {
          if (phase === 'validated') await writeFile(judgmentsPath, '');
        },
      },
    })).rejects.toThrow(/stale.*waiting for the repository lock/i);
    await expect(readFile(goldenPath('hearing-and-doing'), 'utf8')).rejects.toThrow();
  });

  it('rejects a tampered operation even when the caller reuses the preview digest', async () => {
    const plan = await planJudgmentCompilation(root);
    const tampered = {
      ...plan,
      operations: plan.operations.map((operation, index) =>
        index === 0 ? { ...operation, afterText: '{"tampered":true}\n' } : operation,
      ),
    };

    await expect(applyJudgmentCompilationPlan(root, tampered, plan.digest)).rejects.toThrow(/digest/);
    await expect(readFile(goldenPath('hearing-and-doing'), 'utf8')).rejects.toThrow();
  });
});
