import { describe, expect, it } from 'vitest';

import {
  normalizedPhrase,
  normalizeToken,
  significantWords,
  significantWordsWithSurface,
  tokenStream,
} from '../src/tokenizer/index.js';

describe('shared tokenizer', () => {
  it('drops KJV function words that would otherwise match everything', () => {
    expect(significantWords('thou shalt behold the glory unto thee')).toEqual(['glory']);
  });

  it('folds archaic verb forms so modern queries reach archaic text', () => {
    // The motivating case: "hearing and doing" must reach "heareth ... doeth".
    const query = significantWords('hearing and doing');
    const kjvText = significantWords(
      'whosoever heareth these sayings of mine, and doeth them',
    );
    expect(query).toEqual(['hear', 'do']);
    expect(kjvText).toContain('hear');
    expect(kjvText).toContain('do');
  });

  it('collapses paraphrases of one idea onto identical tokens', () => {
    // Agent nouns fold to their verb, so all three phrasings of the James 1
    // idea normalize to the same token set — which is what lets a concept
    // lexicon match them without enumerating every surface form.
    // Compared as sets: token ORDER follows the sentence, but the vocabulary
    // is what concept matching consumes.
    const vocabulary = (text: string) => [...significantWords(text)].sort();
    const expected = ['do', 'hear', 'word'];
    expect(vocabulary('hearers and doers of the word')).toEqual(expected);
    expect(vocabulary('he who hears the word and does it')).toEqual(expected);
    expect(vocabulary('hearing the word and doing it')).toEqual(expected);
  });

  it('does not over-stem short words into collisions', () => {
    expect(normalizeToken('ties')).toBe('ties');
    expect(normalizeToken('cross')).toBe('cross');
    expect(normalizeToken('grace')).toBe('grace');
  });

  it('preserves first-occurrence order and dedupes', () => {
    expect(significantWords('refuge strength refuge trouble')).toEqual([
      'refuge',
      'strength',
      'trouble',
    ]);
  });

  it('keeps raw-word positions for proximity scoring', () => {
    const stream = tokenStream('God is our refuge and strength');
    expect(stream.map((entry) => entry.token)).toEqual(['god', 'refuge', 'strength']);
    // Positions are indices into the raw word sequence, so distance is not
    // compressed by the dropped stopwords between refuge and strength.
    expect(stream.map((entry) => entry.position)).toEqual([0, 3, 5]);
  });

  it('strips punctuation and curly apostrophes identically', () => {
    expect(significantWords("God's refuge!")).toEqual(significantWords('Gods refuge'));
    expect(significantWords('God’s refuge')).toEqual(significantWords('Gods refuge'));
  });
});

describe('surface pairing (significantWordsWithSurface, 0.12.0/QR-5)', () => {
  // The invariance snapshot: the token stream must be byte-identical to what
  // significantWords always produced — the pairing is an annotation, not a
  // second tokenizer, and TOKENIZER_VERSION stays 1.0.0 on its truth.
  const SNAPSHOT = [
    'hearing and doing',
    'whosoever heareth these sayings of mine, and doeth them',
    'thou shalt behold the glory unto thee',
    'refuge strength refuge trouble',
    "God's refuge!",
    'God is our refuge and strength',
    'beleived',
    'forgivness and stregnth',
    'the quick brown-fox 3 16 jumped',
    'doers of the word not hearers only',
  ];

  it('yields byte-identical tokens to significantWords over the snapshot corpus', () => {
    for (const text of SNAPSHOT) {
      expect(significantWordsWithSurface(text).map((entry) => entry.token)).toEqual(
        significantWords(text),
      );
    }
  });

  it('pairs each token with the raw typed word that produced it', () => {
    expect(significantWordsWithSurface('beleived')).toEqual([
      // Stem-divergence: the token is the stem, the surface is what was typed.
      { token: 'beleiv', surface: 'beleived' },
    ]);
    expect(significantWordsWithSurface('Hearing and DOING')).toEqual([
      { token: 'hear', surface: 'hearing' },
      { token: 'do', surface: 'doing' },
    ]);
  });

  it('keeps the FIRST surface for a deduplicated token', () => {
    expect(significantWordsWithSurface('doers doing')).toEqual([
      { token: 'do', surface: 'doers' },
    ]);
  });
});

describe('normalizedPhrase (QR-6 alias key)', () => {
  it('lowercases, strips apostrophes, folds punctuation to spaces, collapses whitespace', () => {
    expect(normalizedPhrase("  It is well,  with my SOUL! ")).toBe('it is well with my soul');
    expect(normalizedPhrase("O' soul — are you weary?")).toBe('o soul are you weary');
  });

  it('KEEPS stopwords and does NOT stem or fold archaic forms', () => {
    // The alias key is the remembered phrase, verbatim: "it", "is", "with",
    // "my" all survive, and "attendeth" stays "attendeth" — brittleness to
    // wording is the design (equality matching, never containment).
    expect(normalizedPhrase('it is well with my soul')).toBe('it is well with my soul');
    expect(normalizedPhrase('when peace like a river attendeth my way')).toBe(
      'when peace like a river attendeth my way',
    );
    // Compare: the search tokenizer would stop/stem most of this away.
    expect(significantWords('it is well with my soul')).toEqual(['well', 'soul']);
  });

  it('distinguishes phrases the stemming tokenizer would collapse', () => {
    expect(normalizedPhrase('hearing and doing')).not.toBe(normalizedPhrase('hearers and doers'));
  });

  it('returns the empty string for punctuation-only input', () => {
    expect(normalizedPhrase('—— !!! ...')).toBe('');
  });

  it('is idempotent (a normalized key re-normalizes to itself)', () => {
    const key = normalizedPhrase("A Mighty Fortress Is Our God");
    expect(normalizedPhrase(key)).toBe(key);
  });

  it('INVARIANCE: adding normalizedPhrase changed no existing tokenizer output', () => {
    // The additive-surface covenant made testable: the search-side outputs
    // for a probe sentence are exactly what they were before QR-6.
    expect(significantWords('thou shalt behold the glory unto thee')).toEqual(['glory']);
    expect(tokenStream('hearing and doing').map((t) => `${t.token}@${t.position}`)).toEqual([
      'hear@0',
      'do@2',
    ]);
  });
});
