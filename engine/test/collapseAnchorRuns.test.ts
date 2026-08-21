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

import { collapseAnchorRuns } from '../src/index.js';
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
});
