/**
 * The softness measure itself, on inputs whose answer is obvious by hand.
 * The report is only worth reading if its arithmetic is right.
 */

import { describe, expect, it } from 'vitest';

import { measureSoftness } from '../scripts/reportSpanSoftness.js';

const term = (verseId: number, minSpanVerses: number) => ({
  verseId,
  term: 't',
  minSpanVerses,
  authorCount: 2,
});

describe('corroboration softness', () => {
  it('separates books by the leading digits of the verse id', () => {
    const rows = measureSoftness([term(1_001_001, 1), term(19_023_001, 1)]);
    expect(rows.map((row) => row.bookName).sort()).toEqual(['Genesis', 'Psalms']);
  });

  it('counts a one-verse attestation as tight', () => {
    const [row] = measureSoftness([term(1_001_001, 1), term(1_001_002, 1)]);
    expect(row!.tightTerms).toBe(2);
    expect(row!.diffuseShare).toBe(0);
  });

  it('counts only spans wider than the threshold as diffuse', () => {
    // 12 is the boundary and must NOT count; 13 must.
    const [row] = measureSoftness([term(1_001_001, 12), term(1_001_002, 13)]);
    expect(row!.diffuseTerms).toBe(1);
    expect(row!.diffuseShare).toBe(0.5);
  });

  it('reports the softest book first, so the list reads as a worry list', () => {
    const rows = measureSoftness([
      term(1_001_001, 1),
      term(19_023_001, 40),
      term(19_023_002, 40),
    ]);
    expect(rows[0]!.bookName).toBe('Psalms');
  });

  it('is deterministic for equal softness, breaking ties by book id', () => {
    const rows = measureSoftness([term(19_023_001, 1), term(1_001_001, 1)]);
    expect(rows.map((row) => row.bookId)).toEqual([1, 19]);
  });
});
