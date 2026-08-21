/**
 * Property suite for guardrail G6's substance: the caps in `ranking/budgets.ts`
 * hold for ARBITRARY evidence, not just the hand-picked examples in
 * `budgets.test.ts`, and ordering never depends on input order. The eval
 * gauntlet runs the same properties against the built package
 * (`eval/src/gates/budgetsProperty.ts`); this file is the engine-side twin so
 * a cap regression fails `npm test` here before a gauntlet ever runs.
 *
 * Seed and run count are fixed and committed: a property run that cannot be
 * reproduced is not evidence. fast-check is a devDependency only — the engine
 * ships with zero runtime dependencies.
 */

import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { applyBudgets, DEFAULT_BUDGETS, type BudgetedScore } from '../src/ranking/budgets.js';
import { rank, type Candidate, type RankOptions } from '../src/ranking/rank.js';
import { isAuthoritative, type Evidence, type SignalFamily } from '../src/reasons/types.js';
import { normalizeToken, significantWords, tokenStream } from '../src/tokenizer/index.js';

const SEED = 20260820;
const NUM_RUNS = 250;

const FAMILIES = Object.keys(DEFAULT_BUDGETS.families).sort() as SignalFamily[];

/**
 * Strengths on a dyadic grid (multiples of 0.25): products with the integer
 * maxPoints are exact in IEEE 754, so permutation-invariance mismatches are
 * always logic bugs, never float-summation noise. The cap properties below
 * use free doubles instead, because the caps must hold for any strength.
 */
const gridStrengthArb = fc.constantFrom(0, 0.25, 0.5, 0.75, 1);
const freeStrengthArb = fc.oneof(
  fc.constantFrom(0, 0.5, 1),
  fc.double({ min: -0.25, max: 1.25, noNaN: true }),
);

const labelArb = fc.constantFrom('alpha', 'beta', 'shared', 'gamma');
const provenanceArb = fc.option(
  fc.record({
    sourceId: fc.constantFrom('src-a', 'src-b'),
    label: fc.constant('Source'),
    locator: fc.constantFrom('loc-1', 'loc-2'),
  }),
  { nil: undefined },
);

function evidenceArb(strengthArb: fc.Arbitrary<number>): fc.Arbitrary<Evidence> {
  return fc
    .record({
      family: fc.constantFrom(...FAMILIES),
      label: labelArb,
      strength: strengthArb,
      provenance: provenanceArb,
    })
    .map(({ provenance, ...rest }) => (provenance ? { ...rest, provenance } : rest));
}

const gridEvidenceListArb = fc.array(evidenceArb(gridStrengthArb), { maxLength: 12 });
const freeEvidenceListArb = fc.array(evidenceArb(freeStrengthArb), { maxLength: 12 });

function permutationOf<T>(items: readonly T[]): fc.Arbitrary<readonly T[]> {
  return items.length === 0
    ? fc.constant([] as readonly T[])
    : fc.shuffledSubarray(items as T[], { minLength: items.length, maxLength: items.length });
}

/**
 * Structural equality with a float tolerance on points. Correlation-group and
 * weak-aggregate scaling divide by an order-summed total, so two permutations
 * of the same evidence may differ in the last ulp of a scaled contribution;
 * anything past the tolerance is a genuine order dependence.
 */
function expectSameBudgetedScore(actual: BudgetedScore, expected: BudgetedScore): void {
  expect(actual.capped).toBe(expected.capped);
  expect(actual.reasons.map((r) => [r.family, r.label, r.provenance?.sourceId ?? ''])).toEqual(
    expected.reasons.map((r) => [r.family, r.label, r.provenance?.sourceId ?? '']),
  );
  actual.reasons.forEach((reason, index) => {
    const other = expected.reasons[index]!;
    expect(reason.points).toBeCloseTo(other.points, 7);
    expect(reason.uncappedPoints === undefined).toBe(other.uncappedPoints === undefined);
    if (reason.uncappedPoints !== undefined) {
      expect(reason.uncappedPoints).toBeCloseTo(other.uncappedPoints ?? Number.NaN, 7);
    }
  });
  expect(actual.score).toBeCloseTo(expected.score, 7);
}

describe('applyBudgets properties (guardrail G6)', () => {
  it('is invariant under evidence permutation', () => {
    fc.assert(
      fc.property(
        gridEvidenceListArb.chain((items) => fc.tuple(fc.constant(items), permutationOf(items))),
        ([original, shuffled]) => {
          expectSameBudgetedScore(applyBudgets(shuffled), applyBudgets(original));
        },
      ),
      { seed: SEED, numRuns: NUM_RUNS },
    );
  });

  it('never keeps more reasons per family than maxReasons', () => {
    fc.assert(
      fc.property(freeEvidenceListArb, (evidence) => {
        const counts = new Map<SignalFamily, number>();
        for (const reason of applyBudgets(evidence).reasons) {
          counts.set(reason.family, (counts.get(reason.family) ?? 0) + 1);
        }
        for (const [family, count] of counts) {
          expect(count).toBeLessThanOrEqual(DEFAULT_BUDGETS.families[family].maxReasons);
        }
      }),
      { seed: SEED, numRuns: NUM_RUNS },
    );
  });

  it('never awards a single reason more than its family maxPoints', () => {
    fc.assert(
      fc.property(freeEvidenceListArb, (evidence) => {
        for (const reason of applyBudgets(evidence).reasons) {
          expect(reason.points).toBeLessThanOrEqual(
            DEFAULT_BUDGETS.families[reason.family].maxPoints + 1e-9,
          );
          expect(reason.points).toBeGreaterThanOrEqual(0);
        }
      }),
      { seed: SEED, numRuns: NUM_RUNS },
    );
  });

  it('keeps the weak-family sum at or under weakAggregateCap', () => {
    fc.assert(
      fc.property(freeEvidenceListArb, (evidence) => {
        const weakTotal = applyBudgets(evidence)
          .reasons.filter((reason) => !isAuthoritative(reason.family))
          .reduce((sum, reason) => sum + reason.points, 0);
        expect(weakTotal).toBeLessThanOrEqual(DEFAULT_BUDGETS.weakAggregateCap + 1e-9);
      }),
      { seed: SEED, numRuns: NUM_RUNS },
    );
  });

  it('reports capped truthfully: flagged iff a reason was dropped or scaled', () => {
    fc.assert(
      fc.property(freeEvidenceListArb, (evidence) => {
        const { reasons, capped } = applyBudgets(evidence);
        const dropped = reasons.length < evidence.length;
        const scaled = reasons.some((reason) => reason.uncappedPoints !== undefined);
        expect(capped).toBe(dropped || scaled);
      }),
      { seed: SEED, numRuns: NUM_RUNS },
    );
  });
});

describe('rank properties (guardrail G6 / determinism)', () => {
  // A pool of identical evidence lists guarantees frequent score ties, which
  // is exactly where a broken comparator would fall back to input order.
  const tiedEvidencePool: readonly (readonly Evidence[])[] = [
    [{ family: 'token_overlap', label: 'alpha', strength: 1 }],
    [{ family: 'exact_phrase', label: 'alpha', strength: 1 }],
    [
      { family: 'concept_lexicon', label: 'alpha', strength: 0.5 },
      { family: 'proximity', label: 'beta', strength: 0.5 },
    ],
  ];

  const candidatesArb: fc.Arbitrary<readonly Candidate[]> = fc
    .array(
      fc.record({
        groupId: fc.constantFrom('g1', 'g2', 'g3'),
        evidence: fc.oneof(
          fc.constantFrom(...tiedEvidencePool),
          fc.array(evidenceArb(gridStrengthArb), { maxLength: 6 }),
        ),
      }),
      { maxLength: 15 },
    )
    .map((specs) =>
      specs.map((spec, index) => ({
        targetId: `t${String(index).padStart(2, '0')}`,
        groupId: spec.groupId,
        evidence: spec.evidence,
      })),
    );

  const optionsArb: fc.Arbitrary<RankOptions> = fc.constantFrom(
    {},
    { limit: 5 },
    { limit: 10, maxPerGroup: 1 },
  );

  it('is invariant under candidate permutation', () => {
    fc.assert(
      fc.property(
        candidatesArb.chain((cands) => fc.tuple(fc.constant(cands), permutationOf(cands))),
        optionsArb,
        ([original, shuffled], options) => {
          // Each candidate's evidence list travels intact, so the outputs
          // must match exactly — bit-identical scores included.
          expect(rank(shuffled, options)).toEqual(rank(original, options));
        },
      ),
      { seed: SEED, numRuns: NUM_RUNS },
    );
  });
});

describe('tokenizer properties (one-tokenizer covenant)', () => {
  // Vowel-free words: provably absent from the stopword, archaic, and lemma
  // tables (every entry there contains a vowel or y), so these exercise the
  // bare stemmer with no table interference.
  const consonantWordArb = fc
    .array(fc.constantFrom('b', 'c', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'p', 'r', 't'), {
      minLength: 1,
      maxLength: 8,
    })
    .map((letters) => letters.join(''));

  // A committed sample across the stopword list's categories; the property
  // asserts none of these ever survive into tokenizer output.
  const SAMPLE_STOPWORDS = [
    'the', 'and', 'of', 'to', 'a', 'is', 'that', 'it',
    'thou', 'thee', 'thy', 'hath', 'unto', 'shall', 'wherefore',
  ] as const;

  const textArb = fc
    .array(
      fc.oneof(
        consonantWordArb,
        fc.constantFrom(...SAMPLE_STOPWORDS),
        fc.constantFrom('love', 'mercy', 'covenant', 'blessings', 'doeth', 'hearing', 'doers'),
        fc.string({ maxLength: 6 }),
      ),
      { maxLength: 20 },
    )
    .map((words) => words.join(' '));

  it('emits only well-formed, deduplicated, stopword-free tokens', () => {
    fc.assert(
      fc.property(textArb, (text) => {
        const tokens = significantWords(text);
        expect(new Set(tokens).size).toBe(tokens.length);
        for (const token of tokens) {
          expect(token).toMatch(/^[\p{L}\p{N}]+$/u);
          expect(token.length).toBeGreaterThanOrEqual(2);
          expect(SAMPLE_STOPWORDS).not.toContain(token);
        }
        // Purity: no hidden state between calls.
        expect(significantWords(text)).toEqual(tokens);
        // significantWords is exactly the deduplicated tokenStream.
        expect([...new Set(tokenStream(text).map((entry) => entry.token))]).toEqual(tokens);
      }),
      { seed: SEED, numRuns: NUM_RUNS },
    );
  });

  it('strips a suffix iff the remaining stem keeps at least 4 characters', () => {
    fc.assert(
      fc.property(consonantWordArb, fc.constantFrom('s', 'ing'), (base, suffix) => {
        const word = base + suffix;
        const token = normalizeToken(word);
        if (base.length >= 4) expect(token).toBe(base);
        else if (word.length >= 3) expect(token).toBe(word);
        else expect(token).toBeNull();
      }),
      { seed: SEED, numRuns: NUM_RUNS },
    );
  });

  it('documents why re-normalization idempotence is NOT a contract', () => {
    // Single-pass suffix stripping is deliberate: 'blessings' stems to
    // 'blessing' (one -s), and only re-tokenizing that OUTPUT would reach
    // 'bless'. Idempotence never matters in practice because build and query
    // paths both tokenize raw surface text exactly once with this same
    // function — asserting it as a property would misstate the contract.
    expect(significantWords('blessings')).toEqual(['blessing']);
    expect(significantWords('blessing')).toEqual(['bless']);
  });
});
