import { describe, expect, it } from 'vitest';

import {
  conceptAnchorEvidence,
  conceptCueEvidence,
  isBareWordConceptCue,
  isThinBareWordConceptCue,
  MIN_AUTHORITATIVE_BARE_CUE_IDF_SHARE,
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
