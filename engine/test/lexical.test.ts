import { describe, expect, it } from 'vitest';

import { isMeaningfulPhraseFragment } from '../src/intents/lexical.js';

describe('isMeaningfulPhraseFragment', () => {
  it('rejects stopword-heavy fragments with only one meaningful word', () => {
    expect(isMeaningfulPhraseFragment('is close to', 'God is close to the brokenhearted')).toBe(false);
  });

  it('accepts fallback fragments carrying at least two meaningful words', () => {
    expect(isMeaningfulPhraseFragment('close to the brokenhearted', 'God is close to the brokenhearted')).toBe(
      true,
    );
  });

  it('uses raw words when a query contains only function words', () => {
    expect(isMeaningfulPhraseFragment('to the', 'to the and')).toBe(true);
    expect(isMeaningfulPhraseFragment('the', 'to the and')).toBe(false);
  });
});
