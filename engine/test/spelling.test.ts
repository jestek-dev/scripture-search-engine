import { describe, expect, it } from 'vitest';

import {
  deleteVariants,
  dictionaryDeleteDepth,
  pickCorrection,
  SPELLING_EDIT1_MAX_TOKEN_LENGTH,
  SPELLING_MIN_TOKEN_LENGTH,
  spellingEditBudget,
  type SpellingCandidate,
} from '../src/intents/spelling.js';
import {
  damerauLevenshtein,
  editDistanceBudget,
  SUGGESTION_EDIT1_MAX_KEY_LENGTH,
  SUGGESTION_MIN_KEY_LENGTH,
} from '../src/reference/reference.js';

describe('the ONE edit-policy table', () => {
  it('is the SAME table the reference did-you-mean uses — imported, not copied', () => {
    expect(SPELLING_MIN_TOKEN_LENGTH).toBe(SUGGESTION_MIN_KEY_LENGTH);
    expect(SPELLING_EDIT1_MAX_TOKEN_LENGTH).toBe(SUGGESTION_EDIT1_MAX_KEY_LENGTH);
    for (let length = 0; length <= 20; length += 1) {
      expect(spellingEditBudget(length)).toBe(editDistanceBudget(length));
    }
  });

  it('holds the policy edges at lengths 4/5/8/9', () => {
    expect(spellingEditBudget(4)).toBe(0); // <5 → never
    expect(spellingEditBudget(5)).toBe(1); // 5–8 → ED 1
    expect(spellingEditBudget(8)).toBe(1);
    expect(spellingEditBudget(9)).toBe(2); // ≥9 → ED 2
  });
});

describe('dictionaryDeleteDepth', () => {
  it('derives depth from the typed-side policy, never guesses', () => {
    // budget 2 needs typed ≥ 9 within distance 2 → term ≥ 7;
    // budget 1 needs typed 5–8 within distance 1 → term 4–9;
    // below 4 no in-policy typed token can ever reach the term.
    expect(dictionaryDeleteDepth(3)).toBe(0);
    expect(dictionaryDeleteDepth(4)).toBe(1);
    expect(dictionaryDeleteDepth(6)).toBe(1);
    expect(dictionaryDeleteDepth(7)).toBe(2);
    expect(dictionaryDeleteDepth(14)).toBe(2);
  });
});

describe('deleteVariants', () => {
  it('includes the identity (0 deletions) so query-side-only deletions can match', () => {
    expect(deleteVariants('pray', 1)).toContain('pray');
  });

  it('produces exactly the single-deletion set at depth 1', () => {
    expect(deleteVariants('abc', 1)).toEqual(['ab', 'abc', 'ac', 'bc']);
  });

  it('is sorted (code-unit order) for byte-deterministic pipeline insertion', () => {
    const variants = deleteVariants('strength', 2);
    expect([...variants].sort()).toEqual([...variants]);
  });

  it('never deletes below one character', () => {
    expect(deleteVariants('ab', 2)).toEqual(['a', 'ab', 'b']);
  });

  it('shares a key between a transposition pair at depth 1 each side (the SymSpell guarantee under Damerau)', () => {
    const typed = new Set(deleteVariants('stregnth', 1));
    const term = new Set(deleteVariants('strength', 1));
    expect([...typed].some((key) => term.has(key))).toBe(true);
  });

  it('reaches a term shorter by one purely from the query side (identity row)', () => {
    // "prayy" → delete one y → "pray", which is the term's own identity key.
    expect(deleteVariants('prayy', 1)).toContain('pray');
    expect(deleteVariants('pray', 1)).toContain('pray');
  });
});

describe('pickCorrection', () => {
  const candidates: SpellingCandidate[] = [
    { term: 'strength', documentCount: 37 },
    { term: 'strengths', documentCount: 2 },
    { term: 'stretch', documentCount: 5 },
  ];

  it('verifies every candidate with the bounded Damerau DP — the index only proposes', () => {
    // "stregnth" → "strength" is a transposition: distance 1 under Damerau.
    const winner = pickCorrection('stregnth', candidates, 1);
    expect(winner).toEqual({ term: 'strength', distance: 1, documentCount: 37 });
    // "stretch" is beyond the bound and must never win regardless of df.
    expect(pickCorrection('stregnth', [{ term: 'stretch', documentCount: 9999 }], 1)).toBeNull();
  });

  it('never returns a distance-0 match (in-vocabulary is the caller-side gate)', () => {
    expect(pickCorrection('strength', [{ term: 'strength', documentCount: 37 }], 2)).toBeNull();
  });

  it('returns null with bound 0 or no in-bound candidate — no correction beats a wrong one', () => {
    expect(pickCorrection('pray', candidates, 0)).toBeNull();
    expect(pickCorrection('zzzzzzz', candidates, 1)).toBeNull();
  });

  it('orders by distance, then document_count desc, then term lexicographic — a total order', () => {
    // Both at distance 1; higher df wins.
    const byDf = pickCorrection('graze', [
      { term: 'grace', documentCount: 78 },
      { term: 'gaze', documentCount: 90 },
    ], 1);
    // "graze"→"grace" is distance 1 (z→c); "graze"→"gaze" is distance 1 (delete r).
    expect(byDf!.term).toBe('gaze');
    // Equal distance, equal df: lexicographic ascending decides.
    const byLex = pickCorrection('graze', [
      { term: 'grace', documentCount: 10 },
      { term: 'gaze', documentCount: 10 },
    ], 1);
    expect(byLex!.term).toBe('gaze');
    // Distance beats df: a distance-1 match outranks a distance-... none here;
    // verify a closer, rarer candidate beats a farther, commoner one at bound 2.
    const byDistance = pickCorrection('salvasion', [
      { term: 'salvation', documentCount: 1 },
      { term: 'salvations', documentCount: 9999 },
    ], 2);
    expect(byDistance).toEqual({ term: 'salvation', distance: 1, documentCount: 1 });
  });

  it('is row-order independent across 100 shuffles (candidate SET decides)', () => {
    let state = 0x5eedba5e;
    const random = (): number => {
      state |= 0;
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const pool: SpellingCandidate[] = [
      { term: 'grace', documentCount: 78 },
      { term: 'gaze', documentCount: 78 },
      { term: 'graze', documentCount: 3 },
      { term: 'trace', documentCount: 78 },
      { term: 'brace', documentCount: 78 },
    ];
    const baseline = pickCorrection('grade', pool, 1);
    expect(baseline).not.toBeNull();
    for (let round = 0; round < 100; round += 1) {
      const shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
      }
      expect(pickCorrection('grade', shuffled, 1)).toEqual(baseline);
    }
  });

  it('cross-checks the winner against a brute-force scan of the policy', () => {
    // For a handful of typed tokens, the delete-index path must find exactly
    // what an exhaustive bounded-DP scan of the dictionary finds.
    const dictionary: SpellingCandidate[] = [
      { term: 'forgiveness', documentCount: 4 },
      { term: 'forgive', documentCount: 16 },
      { term: 'faithfulness', documentCount: 8 },
      { term: 'believ', documentCount: 56 },
      { term: 'believe', documentCount: 60 },
      { term: 'anoint', documentCount: 21 },
    ];
    for (const typed of ['forgivness', 'fathfulness', 'beleiv', 'annoint']) {
      const bound = spellingEditBudget(typed.length);
      const winner = pickCorrection(typed, dictionary, bound);
      // Simulate the SymSpell lookup: dictionary terms whose delete keys
      // (at their derived depth) intersect the typed token's keys.
      const typedKeys = new Set(deleteVariants(typed, bound));
      const proposed = dictionary.filter((candidate) =>
        deleteVariants(candidate.term, dictionaryDeleteDepth(candidate.term.length)).some((key) =>
          typedKeys.has(key),
        ),
      );
      expect(pickCorrection(typed, proposed, bound)).toEqual(winner);
      // And every in-bound dictionary term was actually proposed.
      for (const candidate of dictionary) {
        const distance = damerauLevenshtein(typed, candidate.term, bound);
        if (distance !== null && distance >= 1) {
          expect(proposed.map((entry) => entry.term)).toContain(candidate.term);
        }
      }
    }
  });
});
