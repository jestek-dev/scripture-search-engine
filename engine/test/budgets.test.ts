import { describe, expect, it } from 'vitest';

import { applyBudgets, DEFAULT_BUDGETS } from '../src/ranking/budgets.js';
import type { Evidence } from '../src/reasons/types.js';

function ev(
  family: Evidence['family'],
  strength: number,
  label = family,
  sourceId = 'test',
): Evidence {
  return { family, label, strength, provenance: { sourceId, label: sourceId } };
}

describe('signal budgets (guardrail G6)', () => {
  it('lets an exact phrase outrank every weak signal firing at full strength', () => {
    const everyWeakSignal = applyBudgets([
      ev('concept_lexicon', 1),
      ev('concept_lexicon', 1, 'second lexicon hit'),
      ev('token_overlap', 1),
      ev('proximity', 1),
      ev('passage_terms', 1),
      ev('passage_terms', 1, 'second term'),
      ev('cross_reference', 1),
      ev('co_citation', 1),
    ]);
    const oneExactPhrase = applyBudgets([ev('exact_phrase', 1)]);

    expect(everyWeakSignal.score).toBeLessThan(oneExactPhrase.score);
    expect(everyWeakSignal.capped).toBe(true);
  });

  it('bounds weak evidence no matter how much data is admitted', () => {
    // Simulates the failure mode the guardrail exists for: a future corpus
    // 100x larger producing a flood of weak evidence for one passage.
    const flood: Evidence[] = [];
    for (let i = 0; i < 500; i += 1) {
      flood.push(ev('passage_terms', 1, `term ${i}`, `sermon-${i}`));
      flood.push(ev('co_citation', 1, `citation ${i}`, `sermon-${i}`));
    }
    const flooded = applyBudgets(flood);

    expect(flooded.score).toBeLessThanOrEqual(DEFAULT_BUDGETS.weakAggregateCap);
    expect(flooded.score).toBeLessThan(applyBudgets([ev('exact_phrase', 1)]).score);
  });

  it('caps the number of reasons per family so repetition is not evidence', () => {
    const repeated = applyBudgets(
      Array.from({ length: 20 }, (_, i) => ev('passage_terms', 1, `term ${i}`, `src-${i}`)),
    );
    expect(repeated.reasons.filter((r) => r.family === 'passage_terms')).toHaveLength(
      DEFAULT_BUDGETS.families.passage_terms.maxReasons,
    );
  });

  it('shares one budget across correlated families (guardrail G7)', () => {
    const correlated = applyBudgets([ev('cross_reference', 1), ev('co_citation', 1)]);
    const groupCap = Math.max(
      DEFAULT_BUDGETS.families.cross_reference.maxPoints,
      DEFAULT_BUDGETS.families.co_citation.maxPoints,
    );
    expect(correlated.score).toBeLessThanOrEqual(groupCap);
    expect(correlated.capped).toBe(true);
  });

  it('reports capped points alongside what they would have been', () => {
    const result = applyBudgets([ev('cross_reference', 1), ev('co_citation', 1)]);
    const reduced = result.reasons.find((reason) => reason.uncappedPoints !== undefined);
    expect(reduced).toBeDefined();
    expect(reduced!.points).toBeLessThan(reduced!.uncappedPoints!);
  });

  it('leaves authoritative evidence uncapped in aggregate', () => {
    const result = applyBudgets([
      ev('reference', 1),
      ev('exact_phrase', 1),
      ev('concept_anchor', 1),
    ]);
    const expected =
      DEFAULT_BUDGETS.families.reference.maxPoints +
      DEFAULT_BUDGETS.families.exact_phrase.maxPoints +
      DEFAULT_BUDGETS.families.concept_anchor.maxPoints;
    expect(result.score).toBeCloseTo(expected);
  });

  it('is order-independent: shuffled evidence yields the identical score and reasons', () => {
    const evidence = [
      ev('concept_anchor', 0.8, 'anchor', 'nave'),
      ev('passage_terms', 0.6, 'terms', 'maclaren'),
      ev('cross_reference', 0.5, 'xref', 'openbible'),
      ev('token_overlap', 0.9, 'overlap'),
    ];
    const forward = applyBudgets(evidence);
    const backward = applyBudgets([...evidence].reverse());

    expect(backward.score).toBeCloseTo(forward.score);
    expect(backward.reasons.map((r) => r.label)).toEqual(forward.reasons.map((r) => r.label));
  });
});
