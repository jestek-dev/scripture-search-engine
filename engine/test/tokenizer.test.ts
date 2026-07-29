import { describe, expect, it } from 'vitest';

import { normalizeToken, significantWords, tokenStream } from '../src/tokenizer/index.js';

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
