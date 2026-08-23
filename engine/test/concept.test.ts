import { describe, expect, it } from 'vitest';

import {
  aliasConceptEvidence,
  aliasPassageEvidence,
  conceptAnchorEvidence,
  conceptCueEvidence,
  dedupeConceptAnchors,
  isBareWordConceptCue,
  isThinBareWordConceptCue,
  MIN_AUTHORITATIVE_BARE_CUE_IDF_SHARE,
  PASSAGE_TERM_PMI_HALF_SATURATION,
  passageTermEvidence,
  translationVariantEvidence,
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

describe('translationVariantEvidence chip rendering (CO-2/F22 i)', () => {
  const frequencies = new Map([
    ['plan', 100],
    ['prosper', 10],
    ['hope', 40],
    ['future', 30],
  ]);

  it('names its evidence — the matched stems — and never a translation', () => {
    const evidence = translationVariantEvidence(
      { matchedTokens: ['plan', 'prosper'] },
      10,
      frequencies,
      1000,
    );
    expect(evidence!.label).toBe('Worded this way in another translation: plan, prosper');
    // The stored stems are merged across sources, so naming a translation
    // would invent provenance the data does not carry.
    expect(evidence!.provenance!.label).toBe('Cross-translation vocabulary');
    expect(evidence!.provenance!.sourceId).toBe('translation-variants');
  });

  it('lists at most three stems, in match order', () => {
    const evidence = translationVariantEvidence(
      { matchedTokens: ['plan', 'prosper', 'hope', 'future'] },
      10,
      frequencies,
      1000,
    );
    expect(evidence!.label).toBe('Worded this way in another translation: plan, prosper, hope');
  });
});

describe('dedupeConceptAnchors (0.10.0 stage 6)', () => {
  const row = (over: Partial<typeof anchor>) => ({ ...anchor, ...over });

  it('passes unmerged rows through byte-identical, in input order', () => {
    const input = [
      row({ verseId: 43003016 }),
      row({ verseId: 43003017, sourceId: 'torrey', weight: 0.8 }),
    ];
    const out = dedupeConceptAnchors(input);
    expect(out).toHaveLength(2);
    // Same object references: nothing was copied, nothing reordered.
    expect(out[0]).toBe(input[0]);
    expect(out[1]).toBe(input[1]);
  });

  it('merges same-concept same-verse rows into one, keeping the higher-weight carrier', () => {
    const out = dedupeConceptAnchors([
      row({ sourceId: 'torrey', weight: 0.75, locator: '1 Peter 5:7' }),
      row({ sourceId: 'editorial', weight: 0.85, locator: '1 Peter 5:7' }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]!.weight).toBe(0.85);
    expect(out[0]!.sourceId).toBe('editorial+torrey');
  });

  it("joins the surviving sourceId as the ascending '+' union regardless of input order", () => {
    const a = dedupeConceptAnchors([
      row({ sourceId: 'torrey', weight: 0.7 }),
      row({ sourceId: 'editorial', weight: 0.7 }),
    ]);
    const b = dedupeConceptAnchors([
      row({ sourceId: 'editorial', weight: 0.7 }),
      row({ sourceId: 'torrey', weight: 0.7 }),
    ]);
    expect(a[0]!.sourceId).toBe('editorial+torrey');
    expect(b[0]!.sourceId).toBe('editorial+torrey');
  });

  it('at equal weight the carrier is the sourceId-ascending row (deterministic)', () => {
    const out = dedupeConceptAnchors([
      row({ sourceId: 'torrey', weight: 0.8, locator: 'torrey-loc' }),
      row({ sourceId: 'editorial', weight: 0.8, locator: 'editorial-loc' }),
    ]);
    expect(out[0]!.locator).toBe('editorial-loc');
  });

  it('a single entry citing the same source twice survives with the plain sourceId, no join', () => {
    const out = dedupeConceptAnchors([
      row({ sourceId: 'editorial', weight: 0.9 }),
      row({ sourceId: 'editorial', weight: 0.9 }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]!.sourceId).toBe('editorial');
  });

  it('never merges across concepts: cross-concept stacking is untouched', () => {
    const out = dedupeConceptAnchors([
      row({ conceptId: 'gods-love' }),
      row({ conceptId: 'assurance' }),
    ]);
    expect(out).toHaveLength(2);
  });

  it('never merges across translations', () => {
    const out = dedupeConceptAnchors([
      row({ translationCode: 'WEB' }),
      row({ translationCode: 'KJV' }),
    ]);
    expect(out).toHaveLength(2);
  });

  it('the merged chip names every agreeing source through conceptAnchorEvidence', () => {
    const merged = dedupeConceptAnchors([
      row({ sourceId: 'torrey', weight: 0.75 }),
      row({ sourceId: 'editorial', weight: 0.85 }),
    ])[0]!;
    const evidence = conceptAnchorEvidence(merged, 2, 2);
    expect(evidence.provenance!.sourceId).toBe('editorial+torrey');
    expect(evidence.provenance!.label).toBe(
      'LH editorial + Torrey, New Topical Textbook (public domain)',
    );
    // Scored once, at the carrier weight — not the sum of the two rows.
    expect(evidence.strength).toBe(0.85);
  });

  it('a single-source chip renders byte-identically to the pre-dedupe label', () => {
    const evidence = conceptAnchorEvidence(row({ sourceId: 'editorial' }), 1, 1);
    expect(evidence.provenance!.label).toBe('LH editorial');
  });

  it('is deterministic across repeated calls and permutations', () => {
    const rows = [
      row({ sourceId: 'torrey', weight: 0.75 }),
      row({ sourceId: 'editorial', weight: 0.85 }),
      row({ verseId: 43003017, sourceId: 'nave', weight: 0.6 }),
    ];
    const once = JSON.stringify(dedupeConceptAnchors(rows));
    for (let i = 0; i < 5; i += 1) {
      expect(JSON.stringify(dedupeConceptAnchors(rows))).toBe(once);
    }
  });
});

describe('alias evidence (QR-6)', () => {
  const alias = {
    id: 1,
    title: 'It Is Well with My Soul',
    conceptId: 'hope-in-god',
    conceptLabel: 'Hope',
    startVerseId: null,
    endVerseId: null,
    sourceId: 'hymn-aliases',
    weight: 0.9,
    locator: 'Horatio G. Spafford, "It Is Well with My Soul" (1873)',
  } as const;

  it('concept arm: chip names the hymn AND the curated theme — attribution, never adjudication', () => {
    const evidence = aliasConceptEvidence(alias, { ...anchor, conceptLabel: 'Hope', weight: 0.8 });
    expect(evidence.family).toBe('concept_anchor');
    expect(evidence.label).toBe('Hymn: "It Is Well with My Soul" → Theme: Hope');
    // Strength is the alias weight TIMES the anchor weight: the alias never
    // outranks what the concept's own curation says about a passage.
    expect(evidence.strength).toBeCloseTo(0.9 * 0.8, 10);
    expect(evidence.provenance.sourceId).toBe('hymn-aliases');
    expect(evidence.provenance.label).toBe('LH editorial (public-domain hymn index)');
    expect(evidence.provenance.locator).toBe(
      'Horatio G. Spafford, "It Is Well with My Soul" (1873)',
    );
  });

  it('range arm: chip carries only the hymn attribution (the reference IS the passage)', () => {
    const rangeAlias = {
      ...alias,
      title: 'The Solid Rock',
      conceptId: null,
      conceptLabel: null,
      startVerseId: 60002004,
      endVerseId: 60002007,
      weight: 1,
      locator: 'Edward Mote, "The Solid Rock" (1834)',
    } as const;
    const evidence = aliasPassageEvidence(rangeAlias, {
      verseId: 60002004,
      translationId: 1,
      translationCode: 'WEB',
      bookId: 60,
      bookName: '1 Peter',
      chapter: 2,
      verse: 4,
      text: 'Come to him, a living stone...',
    } as never);
    expect(evidence.family).toBe('concept_anchor');
    expect(evidence.label).toBe('Hymn: "The Solid Rock"');
    expect(evidence.strength).toBe(1);
    expect(evidence.provenance.sourceId).toBe('hymn-aliases');
  });

  it('clamps out-of-range weights into [0, 1] like every other evidence builder', () => {
    const evidence = aliasConceptEvidence({ ...alias, weight: 7 }, { ...anchor, weight: 2 });
    expect(evidence.strength).toBe(1);
  });
});
