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

  it('does not demote multi-word remembered phrasings that normalize to one token', () => {
    expect(isBareWordConceptCue('do not be afraid', 4)).toBe(false);
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
