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
