import { describe, expect, it } from 'vitest';

import { rank, type Candidate } from '../src/ranking/rank.js';
import type { Evidence } from '../src/reasons/types.js';

function candidate(
  targetId: string,
  groupId: string,
  evidence: readonly Evidence[],
): Candidate {
  return { targetId, groupId, evidence };
}

const weak = (strength: number): Evidence[] => [
  { family: 'passage_terms', label: 'term profile', strength },
];

describe('deterministic ranking', () => {
  it('breaks ties by stable target id, never by input order', () => {
    const forward = rank([
      candidate('b', 'g1', weak(0.5)),
      candidate('a', 'g2', weak(0.5)),
      candidate('c', 'g3', weak(0.5)),
    ]);
    const backward = rank([
      candidate('c', 'g3', weak(0.5)),
      candidate('a', 'g2', weak(0.5)),
      candidate('b', 'g1', weak(0.5)),
    ]);

    expect(forward.map((r) => r.targetId)).toEqual(['a', 'b', 'c']);
    expect(backward.map((r) => r.targetId)).toEqual(forward.map((r) => r.targetId));
  });

  it('prefers authoritative evidence when scores tie', () => {
    const results = rank([
      candidate('aaa-weak', 'g1', [
        { family: 'passage_terms', label: 'terms', strength: 1 },
        { family: 'token_overlap', label: 'overlap', strength: 1 },
        { family: 'proximity', label: 'proximity', strength: 1 },
      ]),
      candidate('zzz-authoritative', 'g2', [
        // 0.6 * 40 = 24, exactly the weak candidate's 8 + 10 + 6.
        { family: 'concept_anchor', label: 'anchor', strength: 0.6 },
      ]),
    ]);
    // Tied at 24, so the authoritative rule decides — and it wins despite
    // losing the alphabetical tie-break.
    expect(results[0]!.score).toBeCloseTo(results[1]!.score);
    expect(results[0]!.targetId).toBe('zzz-authoritative');
  });

  it('breaks an exact authoritative tie toward the curated anchor over a bare verbatim match (0.10.0 stage 3)', () => {
    // 0.5 x 60 = 30 = 0.75 x 40, exact in binary. The anchor side loses the
    // alphabetical tie-break, so only the curated tie-break can order it first.
    const results = rank([
      candidate('a-bare-verbatim', 'g1', [
        { family: 'exact_phrase', label: 'Exact phrase', strength: 0.5 },
      ]),
      candidate('b-curated-anchored', 'g2', [
        { family: 'concept_anchor', label: 'Theme: curated', strength: 0.75 },
      ]),
    ]);
    expect(results[0]!.score).toBe(results[1]!.score);
    expect(results.map((r) => r.targetId)).toEqual(['b-curated-anchored', 'a-bare-verbatim']);
  });

  it('never reorders unequal scores: a higher-scoring verbatim match stays above a curated anchor', () => {
    const results = rank([
      candidate('verbatim', 'g1', [
        { family: 'exact_phrase', label: 'Exact phrase', strength: 0.51 },
      ]),
      candidate('anchored', 'g2', [
        { family: 'concept_anchor', label: 'Theme: curated', strength: 0.75 },
      ]),
    ]);
    expect(results.map((r) => r.targetId)).toEqual(['verbatim', 'anchored']);
  });

  it('treats a near-tie as unequal: the curated tie-break fires on EXACT score equality only', () => {
    // 30.01-ish vs exactly 30 — a gap smaller than any plausible epsilon.
    // An approximate-equality comparator (|a - b| < ~0.011 counted as a tie)
    // would call these tied and hand first place to the anchored side via the
    // curated tie-break; the shipped rule fires on exact equality only, so
    // the higher score must lead even though it loses BOTH the curated
    // tie-break and the targetId fallback.
    const results = rank([
      candidate('z-bare-verbatim', 'g1', [
        { family: 'exact_phrase', label: 'Exact phrase', strength: 30.01 / 60 },
      ]),
      candidate('a-curated-anchored', 'g2', [
        { family: 'concept_anchor', label: 'Theme: curated', strength: 0.75 },
      ]),
    ]);
    expect(results[0]!.score).toBeGreaterThan(results[1]!.score);
    expect(results[0]!.score - results[1]!.score).toBeLessThan(0.011);
    expect(results.map((r) => r.targetId)).toEqual(['z-bare-verbatim', 'a-curated-anchored']);
  });

  it('keeps a strict near-tie score ladder strict under every input order (comparator transitivity)', () => {
    // Three results ~0.005 apart with the anchor carrier in the middle. An
    // epsilon comparator is not transitive on this ladder (top ~ middle and
    // middle ~ bottom but top !~ bottom), so its sort output can depend on
    // input order — a determinism hazard, not a styling choice. The exact
    // comparator must produce the same strictly-descending order for every
    // permutation of the input.
    const top = candidate('z-top-verbatim', 'g1', [
      { family: 'exact_phrase', label: 'Exact phrase', strength: 30.01 / 60 },
    ]);
    const middle = candidate('m-middle-anchored', 'g2', [
      { family: 'concept_anchor', label: 'Theme: curated', strength: 30.005 / 40 },
    ]);
    const bottom = candidate('a-bottom-verbatim', 'g3', [
      { family: 'exact_phrase', label: 'Exact phrase', strength: 0.5 },
    ]);
    const permutations: Candidate[][] = [
      [top, middle, bottom],
      [top, bottom, middle],
      [middle, top, bottom],
      [middle, bottom, top],
      [bottom, top, middle],
      [bottom, middle, top],
    ];
    for (const permutation of permutations) {
      const results = rank(permutation);
      expect(results.map((r) => r.targetId)).toEqual([
        'z-top-verbatim',
        'm-middle-anchored',
        'a-bottom-verbatim',
      ]);
      expect(results[0]!.score).toBeGreaterThan(results[1]!.score);
      expect(results[1]!.score).toBeGreaterThan(results[2]!.score);
    }
  });

  it('falls through to targetId when both tied authoritative results carry (or both lack) anchor evidence', () => {
    const bothAnchored = rank([
      candidate('b', 'g1', [{ family: 'concept_anchor', label: 'Theme: one', strength: 0.75 }]),
      candidate('a', 'g2', [{ family: 'concept_anchor', label: 'Theme: two', strength: 0.75 }]),
    ]);
    expect(bothAnchored.map((r) => r.targetId)).toEqual(['a', 'b']);

    const bothVerbatim = rank([
      candidate('d', 'g1', [{ family: 'exact_phrase', label: 'Exact phrase', strength: 0.5 }]),
      candidate('c', 'g2', [{ family: 'exact_phrase', label: 'Exact phrase', strength: 0.5 }]),
    ]);
    expect(bothVerbatim.map((r) => r.targetId)).toEqual(['c', 'd']);
  });

  it('applies the curated tie-break only between authoritative results: weak ties keep the targetId order', () => {
    // Both weak (no authoritative family), equal scores: 0.5 x 12 = 6 = 1 x 6.
    const results = rank([
      candidate('z-lexicon-cue', 'g1', [
        { family: 'concept_lexicon', label: 'Theme cue', strength: 0.5 },
      ]),
      candidate('y-proximity', 'g2', [
        { family: 'proximity', label: 'Close together', strength: 1 },
      ]),
    ]);
    expect(results[0]!.score).toBe(results[1]!.score);
    expect(results.map((r) => r.targetId)).toEqual(['y-proximity', 'z-lexicon-cue']);
  });

  it('keeps the tie-break deterministic regardless of input order', () => {
    const forward = rank([
      candidate('a-bare-verbatim', 'g1', [
        { family: 'exact_phrase', label: 'Exact phrase', strength: 0.5 },
      ]),
      candidate('b-curated-anchored', 'g2', [
        { family: 'concept_anchor', label: 'Theme: curated', strength: 0.75 },
      ]),
    ]);
    const backward = rank([
      candidate('b-curated-anchored', 'g2', [
        { family: 'concept_anchor', label: 'Theme: curated', strength: 0.75 },
      ]),
      candidate('a-bare-verbatim', 'g1', [
        { family: 'exact_phrase', label: 'Exact phrase', strength: 0.5 },
      ]),
    ]);
    expect(forward.map((r) => r.targetId)).toEqual(backward.map((r) => r.targetId));
  });

  it('never thins authoritative matches for diversity', () => {
    const sameChapter = Array.from({ length: 6 }, (_, i) =>
      candidate(`verse-${i}`, 'psalm-46', [
        { family: 'exact_phrase', label: 'Exact phrase', strength: 1 },
      ]),
    );
    const results = rank(sameChapter, { maxPerGroup: 2 });
    expect(results).toHaveLength(6);
  });

  it('diversifies weak results by passage group', () => {
    const crowded = Array.from({ length: 6 }, (_, i) =>
      candidate(`weak-${i}`, 'one-chapter', weak(0.9)),
    );
    const spread = [candidate('other', 'another-chapter', weak(0.5))];
    const results = rank([...crowded, ...spread], { maxPerGroup: 2, limit: 3 });

    const groups = results.map((r) => r.groupId);
    expect(groups.filter((g) => g === 'one-chapter')).toHaveLength(2);
    expect(groups).toContain('another-chapter');
  });

  it('drops candidates with no evidence rather than ranking them arbitrarily', () => {
    const results = rank([candidate('empty', 'g1', []), candidate('real', 'g2', weak(0.4))]);
    expect(results.map((r) => r.targetId)).toEqual(['real']);
  });

  it('returns deferred results when the limit leaves room', () => {
    const crowded = Array.from({ length: 4 }, (_, i) =>
      candidate(`weak-${i}`, 'one-chapter', weak(0.9)),
    );
    const results = rank(crowded, { maxPerGroup: 2, limit: 10 });
    expect(results).toHaveLength(4);
  });
});
