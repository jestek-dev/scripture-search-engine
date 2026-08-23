/**
 * Anchor-run collapsing.
 *
 * Adversarial review found this shipped with zero unit tests, and that the
 * golden fixtures could not have caught a defect in it: G3 matches an
 * expectation by parsing its reference into a verse-id RANGE and testing
 * containment, so it never compares the reference string the engine actually
 * displays. A garbled label is invisible to every gate. These tests are that
 * missing check.
 */

import { describe, expect, it } from 'vitest';

import { collapseAnchorRuns, collapseRuns, type GroupingSpanInfo } from '../src/internal.js';
import type { PericopeRow } from '../src/corpus/repository.js';
import type { DiscoveryResult, ScriptureVerse } from '../src/types.js';

const verse = (verseId: number, chapter: number, verseNo: number): ScriptureVerse => ({
  id: verseId,
  verseId,
  translationId: 1,
  translationCode: 'WEB',
  bookId: 46,
  bookName: '1 Corinthians',
  chapter,
  verse: verseNo,
  text: `text ${chapter}:${verseNo}`,
});

const result = (verseId: number, reference: string, score = 22): DiscoveryResult => ({
  targetId: `WEB:${verseId}`,
  reference,
  excerpt: `text ${reference}`,
  score,
  reasons: [{ family: 'concept_anchor', label: "Theme: The Lord's Supper", points: score }],
});

function fixture(verseIds: readonly number[], span: string) {
  const verses = new Map<string, ScriptureVerse>();
  const spans = new Map<string, Set<string>>();
  const results: DiscoveryResult[] = [];
  for (const id of verseIds) {
    const chapter = Math.floor((id % 1_000_000) / 1000);
    const verseNo = id % 1000;
    verses.set(`WEB:${id}`, verse(id, chapter, verseNo));
    spans.set(`WEB:${id}`, new Set([span]));
    results.push(result(id, `1 Corinthians ${chapter}:${verseNo}`));
  }
  return { verses, spans, results };
}

describe('collapseAnchorRuns', () => {
  it('collapses a consecutive run of one anchor into its passage', () => {
    const { verses, spans, results } = fixture(
      [46_011_023, 46_011_024, 46_011_025, 46_011_026],
      'lords-supper:46011023-46011026',
    );
    const out = collapseAnchorRuns(results, verses, spans);
    expect(out).toHaveLength(1);
    expect(out[0]!.reference).toBe('1 Corinthians 11:23-26');
    // The head id is reused, so consumers can still address the passage.
    expect(out[0]!.targetId).toBe('WEB:46011023');
  });

  it('leaves a lone anchor verse untouched', () => {
    const { verses, spans, results } = fixture([46_011_023], 'lords-supper:46011023-46011023');
    expect(collapseAnchorRuns(results, verses, spans)[0]!.reference).toBe('1 Corinthians 11:23');
  });

  it('collapses across a gap in verse ids: span membership, not contiguity (0.10.0 stage 7)', () => {
    // :23 and :25 are both the anchor's; :24 is absent from the results. The
    // curated span is the unit, so the surfaced members merge — the label
    // spans the surfaced members and the excerpt carries ONLY their texts.
    const { verses, spans, results } = fixture(
      [46_011_023, 46_011_025],
      'lords-supper:46011023-46011026',
    );
    const out = collapseAnchorRuns(results, verses, spans);
    expect(out).toHaveLength(1);
    expect(out[0]!.reference).toBe('1 Corinthians 11:23-25');
    expect(out[0]!.excerpt).toBe('text 1 Corinthians 11:23 text 1 Corinthians 11:25');
  });

  it('collapses non-adjacent members separated by an unrelated result (Psalm-150 shape, 0.10.0 stage 7)', () => {
    // The pre-0.10.0 rank-adjacency rule left every member where it ranked
    // whenever anything else landed between them — `praise` filled five slots
    // with individual verses of Psalm 150. Members now merge at the best
    // member's position; the interloper keeps its own slot and shifts up.
    const { verses, spans, results } = fixture(
      [46_011_023, 46_011_024, 46_011_026],
      'lords-supper:46011023-46011026',
    );
    const interloper: DiscoveryResult = {
      targetId: 'WEB:19100004',
      reference: 'Psalms 100:4',
      excerpt: 'unrelated',
      score: 21,
      reasons: [{ family: 'token_overlap', label: 'Shared words', points: 21 }],
    };
    verses.set('WEB:19100004', { ...verse(19100004, 100, 4), bookName: 'Psalms', bookId: 19 });
    const interleaved = [results[0]!, results[1]!, interloper, results[2]!];
    const out = collapseAnchorRuns(interleaved, verses, spans);
    expect(out).toHaveLength(2);
    expect(out[0]!.reference).toBe('1 Corinthians 11:23-26');
    expect(out[0]!.targetId).toBe('WEB:46011023');
    expect(out[1]!.reference).toBe('Psalms 100:4');
  });

  it('anchors the merged row at the best-ranked member and labels it in canonical order', () => {
    // Rank order :25 then :23 — the merged row sits where :25 ranked (its
    // targetId), but the label and excerpt read in canonical verse order.
    const { verses, spans } = fixture(
      [46_011_023, 46_011_025],
      'lords-supper:46011023-46011026',
    );
    const ranked = [
      result(46_011_025, '1 Corinthians 11:25', 30),
      result(46_011_023, '1 Corinthians 11:23', 22),
    ];
    const out = collapseAnchorRuns(ranked, verses, spans);
    expect(out).toHaveLength(1);
    expect(out[0]!.targetId).toBe('WEB:46011025');
    expect(out[0]!.reference).toBe('1 Corinthians 11:23-25');
    expect(out[0]!.excerpt).toBe('text 1 Corinthians 11:23 text 1 Corinthians 11:25');
    expect(out[0]!.score).toBe(30);
  });

  it('merges reasons strongest-per-label across non-adjacent members', () => {
    const { verses, spans } = fixture(
      [46_011_023, 46_011_025],
      'lords-supper:46011023-46011026',
    );
    const a: DiscoveryResult = {
      ...result(46_011_023, '1 Corinthians 11:23', 40),
      reasons: [
        { family: 'concept_anchor', label: "Theme: The Lord's Supper", points: 40 },
        { family: 'token_overlap', label: 'Shared words', points: 3 },
      ],
    };
    const b: DiscoveryResult = {
      ...result(46_011_025, '1 Corinthians 11:25', 38),
      reasons: [{ family: 'concept_anchor', label: "Theme: The Lord's Supper", points: 38 }],
    };
    const out = collapseAnchorRuns([a, b], verses, spans);
    expect(out).toHaveLength(1);
    expect(out[0]!.reasons).toEqual([
      { family: 'concept_anchor', label: "Theme: The Lord's Supper", points: 40 },
      { family: 'token_overlap', label: 'Shared words', points: 3 },
    ]);
  });

  it('governing span: the span covering the most surfaced members wins across overlapping spans', () => {
    // The Ephesians 2:8-10 shape from the live fixture bed (`faith works
    // grace`): verses 8-10 belong to a three-member span, 8-9 also to a
    // two-member one. Every member must join the span that gathers more of
    // this result page, so the page shows ONE merged row covering all three
    // — an inverted count rule splits it into 2:8-9 plus a separate 2:10.
    const { verses, spans, results } = fixture(
      [46_002_008, 46_002_009, 46_002_010],
      'faith-and-works:46002008-46002010',
    );
    spans.set('WEB:46002008', new Set(['faith-and-works:46002008-46002010', 'grace-not-earned:46002008-46002009']));
    spans.set('WEB:46002009', new Set(['faith-and-works:46002008-46002010', 'grace-not-earned:46002008-46002009']));
    const out = collapseAnchorRuns(results, verses, spans);
    expect(out).toHaveLength(1);
    expect(out[0]!.reference).toBe('1 Corinthians 2:8-10');
    expect(out[0]!.targetId).toBe('WEB:46002008');
  });

  it('governing span: at equal surfaced-member counts the tie resolves to the ascending span key', () => {
    // v24 sits in two spans that each cover two surfaced members. The tie
    // must break to the ascending span key ('alpha' < 'beta'), so v24 merges
    // with v23 and v25 stands alone — the key-descending mutation produces
    // the mirror image (v23 alone, v24-25 merged) and must fail here.
    const { verses, spans, results } = fixture(
      [46_011_023, 46_011_024, 46_011_025],
      'alpha:46011023-46011024',
    );
    spans.set('WEB:46011024', new Set(['alpha:46011023-46011024', 'beta:46011024-46011025']));
    spans.set('WEB:46011025', new Set(['beta:46011024-46011025']));
    const out = collapseAnchorRuns(results, verses, spans);
    expect(out).toHaveLength(2);
    expect(out[0]!.reference).toBe('1 Corinthians 11:23-24');
    expect(out[1]!.reference).toBe('1 Corinthians 11:25');
  });

  it('does NOT collapse results from different anchors', () => {
    const { verses, spans, results } = fixture([46_011_023, 46_011_024], 'a:1-2');
    spans.set('WEB:46011024', new Set(['b:3-4']));
    expect(collapseAnchorRuns(results, verses, spans)).toHaveLength(2);
  });

  it('leaves results with no anchor evidence alone', () => {
    const { verses, results } = fixture([46_011_023, 46_011_024], 'x');
    expect(collapseAnchorRuns(results, verses, new Map())).toHaveLength(2);
  });

  it('labels a chapter-crossing run with both chapters', () => {
    // Unreachable while verse ids are bbcccvvv, but the label must not depend
    // on that: "Psalms 22:31-1" is the kind of wrong nobody can produce on
    // demand and everybody ships.
    const verses = new Map<string, ScriptureVerse>([
      ['WEB:1', { ...verse(1, 22, 31), bookName: 'Psalms', bookId: 19 }],
      ['WEB:2', { ...verse(2, 23, 1), bookName: 'Psalms', bookId: 19 }],
    ]);
    const spans = new Map([
      ['WEB:1', new Set(['x:1-2'])],
      ['WEB:2', new Set(['x:1-2'])],
    ]);
    const out = collapseAnchorRuns(
      [result(1, 'Psalms 22:31'), result(2, 'Psalms 23:1')],
      verses,
      spans,
    );
    expect(out[0]!.reference).toBe('Psalms 22:31-23:1');
  });

  it('is deterministic across repeated runs', () => {
    const { verses, spans, results } = fixture(
      [46_011_023, 46_011_024, 46_011_025],
      'lords-supper:46011023-46011026',
    );
    const once = JSON.stringify(collapseAnchorRuns(results, verses, spans));
    for (let i = 0; i < 5; i += 1) {
      expect(JSON.stringify(collapseAnchorRuns(results, verses, spans))).toBe(once);
    }
  });

  it('the 3-argument entry point emits the exact pre-0.14.0 merged shape: no verses, no grouping', () => {
    const { verses, spans, results } = fixture(
      [46_011_023, 46_011_024],
      'lords-supper:46011023-46011026',
    );
    const out = collapseAnchorRuns(results, verses, spans);
    expect(out).toHaveLength(1);
    expect('verses' in out[0]!).toBe(false);
    expect('grouping' in out[0]!).toBe(false);
  });
});

/** Pericope-run collapsing (0.14.0 / CO-3 PR 2) and merged-row explanations. */
describe('collapseRuns', () => {
  const psalmVerse = (verseId: number): ScriptureVerse => ({
    id: verseId,
    verseId,
    translationId: 1,
    translationCode: 'WEB',
    bookId: 19,
    bookName: 'Psalms',
    chapter: Math.floor((verseId % 1_000_000) / 1000),
    verse: verseId % 1000,
    text: `text ${verseId}`,
  });

  const phraseResult = (verseId: number, score = 60): DiscoveryResult => {
    const v = psalmVerse(verseId);
    return {
      targetId: `WEB:${verseId}`,
      reference: `Psalms ${v.chapter}:${v.verse}`,
      excerpt: v.text,
      score,
      reasons: [{ family: 'exact_phrase', label: 'Exact phrase', points: score }],
    };
  };

  const bed = (verseIds: readonly number[]) => {
    const verses = new Map<string, ScriptureVerse>();
    const results: DiscoveryResult[] = [];
    for (const id of verseIds) {
      verses.set(`WEB:${id}`, psalmVerse(id));
      results.push(phraseResult(id));
    }
    return { verses, results };
  };

  const pericope = (start: number, end: number, votes = 12): PericopeRow => ({
    startVerseId: start,
    endVerseId: end,
    boundaryVotes: votes,
    sourceId: 'openbible-sections',
  });

  const pericopeMap = (
    rows: readonly PericopeRow[],
    verseIds: readonly number[],
  ): Map<number, PericopeRow> => {
    const map = new Map<number, PericopeRow>();
    for (const id of verseIds) {
      const row = rows.find((r) => id >= r.startVerseId && id <= r.endVerseId);
      if (row) map.set(id, row);
    }
    return map;
  };

  const NO_SPANS = new Map<string, Set<string>>();
  const NO_INFO = new Map<string, GroupingSpanInfo>();

  it('merges a rank-consecutive, verse-consecutive run inside one pericope, with the full explanation', () => {
    const ids = [19_136_001, 19_136_002, 19_136_003];
    const { verses, results } = bed(ids);
    const rows = [pericope(19_136_001, 19_136_026, 12)];
    const out = collapseRuns(results, verses, NO_SPANS, NO_INFO, pericopeMap(rows, ids));
    expect(out).toHaveLength(1);
    const merged = out[0]!;
    // The reference spans the HITS, never the whole pericope.
    expect(merged.reference).toBe('Psalms 136:1-3');
    expect(merged.targetId).toBe('WEB:19136001');
    // Grouping cites the source and the SUMMED boundary vote the artifact
    // stores; the section names the full pericope span.
    expect(merged.grouping).toEqual({
      section: { reference: 'Psalms 136:1-26', startVerseId: 19_136_001, endVerseId: 19_136_026 },
      provenance: {
        sourceId: 'openbible-sections',
        label: 'OpenBible section boundaries (CC BY)',
        boundaryVotes: 12,
      },
    });
    // Per-verse evidence, uncollapsed, in canonical order.
    expect(merged.verses?.map((v) => v.targetId)).toEqual([
      'WEB:19136001',
      'WEB:19136002',
      'WEB:19136003',
    ]);
    // Score is the max of the members — grouping contributes zero points.
    expect(merged.score).toBe(60);
  });

  it('never merges across a pericope boundary even when every other precondition holds (Terah shape)', () => {
    const ids = [1_011_026, 1_011_027];
    const verses = new Map<string, ScriptureVerse>();
    const results: DiscoveryResult[] = [];
    for (const id of ids) {
      const v: ScriptureVerse = { ...psalmVerse(id), bookId: 1, bookName: 'Genesis' };
      verses.set(`WEB:${id}`, v);
      results.push({ ...phraseResult(id), reference: `Genesis ${v.chapter}:${v.verse}` });
    }
    const rows = [pericope(1_011_010, 1_011_026, 19), pericope(1_011_027, 1_011_032, 14)];
    const out = collapseRuns(results, verses, NO_SPANS, NO_INFO, pericopeMap(rows, ids));
    // Consecutive in rank, verseId-consecutive — but two pericopes. Two rows.
    expect(out.map((r) => r.reference)).toEqual(['Genesis 11:26', 'Genesis 11:27']);
    expect(out.every((r) => r.grouping === undefined)).toBe(true);
  });

  it('an interloper between two section-mates keeps them apart (rank adjacency is required)', () => {
    const ids = [19_136_001, 19_136_002];
    const { verses, results } = bed(ids);
    const interloper: DiscoveryResult = {
      targetId: 'WEB:14007003',
      reference: '2 Chronicles 7:3',
      excerpt: 'unrelated',
      score: 60,
      reasons: [{ family: 'exact_phrase', label: 'Exact phrase', points: 60 }],
    };
    verses.set('WEB:14007003', {
      ...psalmVerse(14_007_003),
      bookId: 14,
      bookName: '2 Chronicles',
    });
    const rows = [pericope(19_136_001, 19_136_026, 12)];
    const out = collapseRuns(
      [results[0]!, interloper, results[1]!],
      verses,
      NO_SPANS,
      NO_INFO,
      pericopeMap(rows, ids),
    );
    expect(out).toHaveLength(3);
    expect(out.every((r) => r.grouping === undefined)).toBe(true);
  });

  it('a verse-id gap breaks the run (2 Chronicles 7:3 / 7:6 shape)', () => {
    const ids = [14_007_003, 14_007_006];
    const { verses, results } = bed(ids);
    const rows = [pericope(14_007_001, 14_007_010, 15)];
    const out = collapseRuns(results, verses, NO_SPANS, NO_INFO, pericopeMap(rows, ids));
    expect(out).toHaveLength(2);
  });

  it('authority order: a verse any anchor span claims never joins a pericope run', () => {
    // Both verses sit in one pericope and rank adjacently, but the first is
    // claimed by a curated anchor (a one-member group). Pericope provenance
    // must not usurp anchor membership: no merge happens at all.
    const ids = [59_001_022, 59_001_023];
    const verses = new Map<string, ScriptureVerse>();
    const results: DiscoveryResult[] = [];
    for (const id of ids) {
      const v: ScriptureVerse = { ...psalmVerse(id), bookId: 59, bookName: 'James' };
      verses.set(`WEB:${id}`, v);
      results.push({ ...phraseResult(id), reference: `James ${v.chapter}:${v.verse}` });
    }
    const spans = new Map([['WEB:59001022', new Set(['obedience:59001022-59001022'])]]);
    const info = new Map<string, GroupingSpanInfo>([
      ['obedience:59001022-59001022', {
        startVerseId: 59_001_022,
        endVerseId: 59_001_022,
        sourceIds: new Set(['editorial']),
      }],
    ]);
    const rows = [pericope(59_001_019, 59_001_027, 16)];
    const out = collapseRuns(results, verses, spans, info, pericopeMap(rows, ids));
    expect(out.map((r) => r.reference)).toEqual(['James 1:22', 'James 1:23']);
    expect(out.every((r) => r.grouping === undefined)).toBe(true);
  });

  it('an anchor-span merge is explained too: section, source, verses — and no boundaryVotes', () => {
    const ids = [59_001_022, 59_001_023, 59_001_024, 59_001_025];
    const verses = new Map<string, ScriptureVerse>();
    const results: DiscoveryResult[] = [];
    const spans = new Map<string, Set<string>>();
    for (const id of ids) {
      const v: ScriptureVerse = { ...psalmVerse(id), bookId: 59, bookName: 'James' };
      verses.set(`WEB:${id}`, v);
      spans.set(`WEB:${id}`, new Set(['obedience-to-the-word:59001022-59001025']));
      results.push({
        targetId: `WEB:${id}`,
        reference: `James ${v.chapter}:${v.verse}`,
        excerpt: v.text,
        score: 40,
        reasons: [{ family: 'concept_anchor', label: 'Theme: Hearing and doing', points: 40 }],
      });
    }
    const info = new Map<string, GroupingSpanInfo>([
      ['obedience-to-the-word:59001022-59001025', {
        startVerseId: 59_001_022,
        endVerseId: 59_001_025,
        sourceIds: new Set(['editorial']),
      }],
    ]);
    const out = collapseRuns(results, verses, spans, info, new Map());
    expect(out).toHaveLength(1);
    expect(out[0]!.reference).toBe('James 1:22-25');
    expect(out[0]!.grouping).toEqual({
      section: { reference: 'James 1:22-25', startVerseId: 59_001_022, endVerseId: 59_001_025 },
      provenance: { sourceId: 'editorial', label: 'LH editorial' },
    });
    expect(out[0]!.verses).toHaveLength(4);
  });

  it('several agreeing anchor sources are ascending-joined in the grouping provenance', () => {
    const ids = [19_100_001, 19_100_002];
    const { verses, results } = bed(ids);
    const spans = new Map<string, Set<string>>([
      ['WEB:19100001', new Set(['praise:19100001-19100002'])],
      ['WEB:19100002', new Set(['praise:19100001-19100002'])],
    ]);
    const info = new Map<string, GroupingSpanInfo>([
      ['praise:19100001-19100002', {
        startVerseId: 19_100_001,
        endVerseId: 19_100_002,
        sourceIds: new Set(['openbible-topics', 'editorial']),
      }],
    ]);
    const out = collapseRuns(results, verses, spans, info, new Map());
    expect(out).toHaveLength(1);
    expect(out[0]!.grouping?.provenance.sourceId).toBe('editorial+openbible-topics');
    expect(out[0]!.grouping?.provenance.label).toBe(
      'LH editorial + OpenBible topical votes (CC BY)',
    );
  });

  it('a descending rank-order run still merges and labels canonically', () => {
    const ids = [19_136_003, 19_136_002, 19_136_001];
    const verses = new Map<string, ScriptureVerse>();
    const results: DiscoveryResult[] = [];
    for (const id of ids) {
      verses.set(`WEB:${id}`, psalmVerse(id));
      results.push(phraseResult(id));
    }
    const rows = [pericope(19_136_001, 19_136_026, 12)];
    const out = collapseRuns(results, verses, NO_SPANS, NO_INFO, pericopeMap(rows, ids));
    expect(out).toHaveLength(1);
    expect(out[0]!.reference).toBe('Psalms 136:1-3');
    // The row sits at (and addresses) the best-ranked member.
    expect(out[0]!.targetId).toBe('WEB:19136003');
  });

  it('is deterministic across repeated runs, pericope arm included', () => {
    const ids = [19_136_001, 19_136_002, 19_136_003, 19_136_004];
    const { verses, results } = bed(ids);
    const rows = [pericope(19_136_001, 19_136_026, 12)];
    const map = pericopeMap(rows, ids);
    const once = JSON.stringify(collapseRuns(results, verses, NO_SPANS, NO_INFO, map));
    for (let i = 0; i < 5; i += 1) {
      expect(JSON.stringify(collapseRuns(results, verses, NO_SPANS, NO_INFO, map))).toBe(once);
    }
  });
});
