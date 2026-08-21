import { describe, expect, it } from 'vitest';

import {
  conceptAnchorEvidence,
  conceptCueEvidence,
  isBareWordConceptCue,
  isThinBareWordConceptCue,
  MIN_AUTHORITATIVE_BARE_CUE_IDF_SHARE,
  PASSAGE_TERM_PMI_HALF_SATURATION,
  passageTermEvidence,
} from '../src/intents/concept.js';

const anchor = {
  conceptId: 'gods-love',
  conceptLabel: 'The love of God',
  sourceId: 'editorial',
  weight: 1,
  locator: null,
  id: 1,
  verseId: 43003016,
  translationId: 1,
  translationCode: 'WEB',
  bookId: 43,
  bookName: 'John',
  chapter: 3,
  verse: 16,
  text: 'For God so loved the world...',
  anchorStartVerseId: 43003016,
  anchorEndVerseId: 43003016,
} as const;

describe('isBareWordConceptCue', () => {
  it('treats a one-word lexicon entry inside a longer query as a weak cue', () => {
    expect(isBareWordConceptCue('love', 5)).toBe(true);
  });

  it('keeps a one-word broad query authoritative', () => {
    expect(isBareWordConceptCue('love', 1)).toBe(false);
  });

  it('measures width in significant tokens: a multi-word phrase that collapses to one token is a bare cue (deliberate reversal of the raw-word-count carve-out)', () => {
    // "forgive others" stores as the single token `forgive`; inside a longer
    // query it must face the same thin-cue gate as a deliberate bare word.
    expect(isBareWordConceptCue('forgive others', 4)).toBe(true);
    expect(isBareWordConceptCue('the will of the lord', 5)).toBe(true);
    expect(isBareWordConceptCue('do not be afraid', 4)).toBe(true);
  });

  it('keeps a whole-query collapse authoritative via the query-width guard', () => {
    // The query "do not be afraid" itself collapses to the lone token
    // `afraid`, so queryTokenCount is 1 and the cue stays authoritative —
    // this is the kept half of the protection for remembered phrasings.
    expect(isBareWordConceptCue('do not be afraid', 1)).toBe(false);
  });

  it('leaves phrases with two or more significant tokens untouched', () => {
    expect(isBareWordConceptCue('hearing and doing', 5)).toBe(false);
    expect(isBareWordConceptCue('still waters', 4)).toBe(false);
  });

  it('treats an all-stopword phrase (zero significant tokens) as a bare cue, never as wide', () => {
    expect(isBareWordConceptCue('with us', 3)).toBe(true);
  });

  it('is deterministic across repeated calls', () => {
    const first = isBareWordConceptCue('forgive others', 4);
    for (let i = 0; i < 3; i += 1) expect(isBareWordConceptCue('forgive others', 4)).toBe(first);
  });
});

describe('isThinBareWordConceptCue', () => {
  it('demotes generic one-word cues when they explain too little of the query', () => {
    expect(isThinBareWordConceptCue('love', 5, 0.121)).toBe(true);
    expect(isThinBareWordConceptCue('love', 5, MIN_AUTHORITATIVE_BARE_CUE_IDF_SHARE)).toBe(false);
  });

  it('keeps distinctive one-word cues authoritative inside longer queries', () => {
    expect(isThinBareWordConceptCue('pornography', 2, 0.5)).toBe(false);
  });

  it('applies the same IDF-share gate to a collapsed multi-word phrase as to a deliberate bare word', () => {
    // Thin: the collapsed token explains too little of the query.
    expect(isThinBareWordConceptCue('the will of the lord', 4, 0.1)).toBe(true);
    // Surviving: a collapsed cue that carries real query meaning stays
    // authoritative — the engine half alone does not demote fn3's `forgive`.
    expect(isThinBareWordConceptCue('forgive others', 4, 0.5)).toBe(false);
    // At the threshold exactly, not thin (same boundary as bare words).
    expect(
      isThinBareWordConceptCue('forgive others', 4, MIN_AUTHORITATIVE_BARE_CUE_IDF_SHARE),
    ).toBe(false);
  });

  it('never demotes a whole-query collapse regardless of IDF share', () => {
    expect(isThinBareWordConceptCue('do not be afraid', 1, 0.0)).toBe(false);
  });
});

describe('full-query parity (0.10.0 stage 3, via conceptAnchorEvidence)', () => {
  const weighted = (weight: number) => ({ ...anchor, weight });

  it('grants specificity 1 when a two-token match accounts for the whole query: strength becomes exactly the anchor weight', () => {
    expect(conceptAnchorEvidence(weighted(1), 2, 2).strength).toBe(1);
    // The measured Acts 2:42 shape: a 0.7-weight co-anchor at parity is
    // worth 0.7 x 40 = 28 points, not 0.7 x 0.7 x 40.
    expect(conceptAnchorEvidence(weighted(0.7), 2, 2).strength).toBeCloseTo(0.7, 10);
  });

  it('grants parity at any width of two or more when matched == query', () => {
    expect(conceptAnchorEvidence(weighted(1), 3, 3).strength).toBe(1);
    expect(conceptAnchorEvidence(weighted(1), 4, 4).strength).toBe(1);
  });

  it('never grants parity to a one-token match, even for a one-token query — the thin-cue design stays intact', () => {
    // specificity 0.55, coverage 1.
    expect(conceptAnchorEvidence(weighted(1), 1, 1).strength).toBeCloseTo(0.55, 10);
  });

  it('keeps graded specificity when the match covers only part of the query', () => {
    // matched 2 of 3: specificity 0.7, coverage sqrt(2/3) — no parity.
    expect(conceptAnchorEvidence(weighted(1), 2, 3).strength).toBeCloseTo(
      0.7 * Math.sqrt(2 / 3),
      10,
    );
  });

  it('applies the same parity to weak cues, keeping the cue/anchor strength formulas identical', () => {
    expect(conceptCueEvidence(weighted(0.7), 2, 2).strength).toBe(
      conceptAnchorEvidence(weighted(0.7), 2, 2).strength,
    );
  });

  it('is deterministic across repeated calls', () => {
    const first = conceptAnchorEvidence(weighted(0.7), 2, 2).strength;
    for (let i = 0; i < 3; i += 1) {
      expect(conceptAnchorEvidence(weighted(0.7), 2, 2).strength).toBe(first);
    }
  });
});

describe('conceptCueEvidence', () => {
  it('uses the weak family while preserving the concept label and provenance', () => {
    const evidence = conceptCueEvidence(anchor, 1, 5);
    expect(evidence.family).toBe('concept_lexicon');
    expect(evidence.label).toBe('Theme cue: The love of God');
    expect(evidence.provenance?.sourceId).toBe('editorial');
  });

  it('keeps the same bounded strength formula as authoritative concept anchors', () => {
    expect(conceptCueEvidence(anchor, 1, 5).strength).toBe(conceptAnchorEvidence(anchor, 1, 5).strength);
  });
});

describe('passageTermEvidence PMI factor (0.10.0 stage 5)', () => {
  const term = (overrides: Partial<Parameters<typeof passageTermEvidence>[0]> = {}) => ({
    matchedTerms: ['propitiation'],
    pmiSum: 6,
    sourceIds: 'clarke',
    minSpanVerses: 1,
    locator: '1 John 2',
    ...overrides,
  });

  it('is strictly monotone in pmiSum: distinct pmiSums never tie', () => {
    const low = passageTermEvidence(term({ pmiSum: 2.02 })).strength;
    const mid = passageTermEvidence(term({ pmiSum: 6.37 })).strength;
    const high = passageTermEvidence(term({ pmiSum: 18.54 })).strength;
    expect(low).toBeLessThan(mid);
    expect(mid).toBeLessThan(high);
  });

  it('stays strictly monotone when every per-term PMI is above the half-saturation constant — the measured failure of the min() form', () => {
    // Every stored `propitiation` row measures per-term PMI 8.52-11.21; the
    // rejected min(1, pmiSum / (terms * 6)) form saturates at 1 across this
    // whole range and leaves the flat tie byte-identical. The asymptotic
    // form must still separate them.
    const terms = ['propitiation', 'mercy', 'seat'];
    const lower = passageTermEvidence(term({ matchedTerms: terms, pmiSum: 3 * 8.52 })).strength;
    const upper = passageTermEvidence(term({ matchedTerms: terms, pmiSum: 3 * 11.21 })).strength;
    expect(lower).toBeLessThan(upper);
    // The min() form scores both rows at factor exactly 1, i.e. strength ==
    // saturating x specificity. Verify this form stays strictly below that
    // saturated ceiling for both, so the regression is detectable.
    const minFormStrength = (Math.log1p(3) / Math.log1p(6)) * 1;
    expect(upper).toBeLessThan(minFormStrength);
  });

  it('is bounded below 1 at any magnitude', () => {
    const evidence = passageTermEvidence(term({ pmiSum: 1e9 }));
    expect(evidence.strength).toBeLessThan(1);
    expect(evidence.strength).toBeGreaterThan(0);
  });

  it('calibration: the G5 admission floor scores factor 0.25 and the half-saturation point scores 0.5', () => {
    // Single term at the distinctiveness.minPmi floor of 2.0:
    // 2 / (2 + 6) = 0.25. saturating(1 term) and specificity(1 verse) are
    // both computed here so the assertion isolates the factor.
    const saturating = Math.log1p(1) / Math.log1p(6);
    const floor = passageTermEvidence(term({ pmiSum: 2.0 }));
    expect(floor.strength).toBeCloseTo(saturating * 0.25, 10);
    const half = passageTermEvidence(term({ pmiSum: PASSAGE_TERM_PMI_HALF_SATURATION }));
    expect(half.strength).toBeCloseTo(saturating * 0.5, 10);
  });

  it('degrades gracefully on zero or negative pmiSum: factor 0, never NaN or negative', () => {
    expect(passageTermEvidence(term({ pmiSum: 0 })).strength).toBe(0);
    expect(passageTermEvidence(term({ pmiSum: -3 })).strength).toBe(0);
  });

  it('leaves the span-specificity interaction unchanged: the factor is independent of span', () => {
    const oneVerse = passageTermEvidence(term({ pmiSum: 8, minSpanVerses: 1 }));
    const sixVerses = passageTermEvidence(term({ pmiSum: 8, minSpanVerses: 6 }));
    const specificityRatio =
      (1 / (1 + 0.25 * Math.log2(6))) / (1 / (1 + 0.25 * Math.log2(1)));
    expect(sixVerses.strength / oneVerse.strength).toBeCloseTo(specificityRatio, 10);
  });

  it('keeps the label and provenance untouched by the factor', () => {
    const evidence = passageTermEvidence(term({ pmiSum: 9 }));
    expect(evidence.family).toBe('passage_terms');
    expect(evidence.label).toBe('Preached vocabulary: propitiation');
    expect(evidence.provenance?.sourceId).toBe('clarke');
  });

  it('is deterministic across repeated calls', () => {
    const first = passageTermEvidence(term({ pmiSum: 7.77 })).strength;
    for (let i = 0; i < 3; i += 1) {
      expect(passageTermEvidence(term({ pmiSum: 7.77 })).strength).toBe(first);
    }
  });
});
