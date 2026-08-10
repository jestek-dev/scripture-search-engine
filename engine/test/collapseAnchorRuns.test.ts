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

  it('does NOT collapse across a gap in verse ids', () => {
    // :23 and :25 are both the anchor's, but :24 is missing from the results,
    // so merging them would silently claim a passage that was not returned.
    const { verses, spans, results } = fixture(
      [46_011_023, 46_011_025],
      'lords-supper:46011023-46011026',
    );
    expect(collapseAnchorRuns(results, verses, spans)).toHaveLength(2);
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
