import { describe, expect, it } from 'vitest';

import { mergeGateResults } from '../src/gates/merge.js';
import { fail, pass } from '../src/gates/types.js';

describe('structured fixture promotion candidates', () => {
  const corpusPassing = {
    ...pass('G3-golden', 'Golden regression (corpus)', 'one pending fixture now passes'),
    promotionCandidates: ['pending-proof'],
  };

  it('preserves a passing pending fixture through a concept-coverage-only failure', () => {
    const merged = mergeGateResults('Golden regression', [
      pass('G3-golden', 'Golden regression', 'active ordering holds'),
      corpusPassing,
      fail(
        'G3-golden',
        'Concept fixture coverage',
        'one concept is not demonstrated by an active fixture',
        [{ message: 'pending-proof is complete but is not active', subjects: ['pending-proof'] }],
      ),
    ]);
    expect(merged.status).toBe('fail');
    expect(merged.promotionCandidates).toEqual(['pending-proof']);
  });

  it('suppresses candidates when an active golden regression fails', () => {
    const merged = mergeGateResults('Golden regression', [
      fail('G3-golden', 'Golden regression', 'active ordering failed', [{ message: 'active failure' }]),
      corpusPassing,
      pass('G3-golden', 'Concept fixture coverage', 'coverage holds'),
    ]);
    expect(merged.status).toBe('fail');
    expect(merged.promotionCandidates).toEqual([]);
  });
});
