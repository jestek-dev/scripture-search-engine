import { describe, expect, it } from 'vitest';

import {
  applyBudgets,
  DEFAULT_BUDGETS,
  rank,
  type Candidate,
  type RankOptions,
} from '@jestek-dev/scripture-engine';

import {
  budgetsPropertyGate,
  reviewedConstantsCheck,
  G6_PROPERTY_NUM_RUNS,
  G6_PROPERTY_SEED,
} from '../src/gates/budgetsProperty.js';
import { mergeGateResults } from '../src/gates/merge.js';

describe('budgetsPropertyGate (G6 property half)', () => {
  it('passes against the real engine and reports seed + numRuns', () => {
    const result = budgetsPropertyGate();
    expect(result.gate).toBe('G6-signal-budgets');
    expect(result.status).toBe('pass');
    expect(result.applicability).toBe('required');
    // Gate discipline: a property gate that hides its seed or run count is
    // half-decorative — both must be human-visible in the summary line.
    expect(result.summary).toContain(String(G6_PROPERTY_SEED));
    expect(result.summary).toContain(String(G6_PROPERTY_NUM_RUNS));
    expect(result.metrics?.propertySeed).toBe(G6_PROPERTY_SEED);
    expect(result.metrics?.propertyRuns).toBe(G6_PROPERTY_NUM_RUNS);
    expect(result.metrics?.propertiesFalsified).toBe(0);
    expect(result.metrics?.propertiesTotal).toBeGreaterThanOrEqual(8);
  });

  it('is deterministic: two runs produce the identical result', () => {
    expect(budgetsPropertyGate()).toEqual(budgetsPropertyGate());
  });

  it('rings when the engine stops enforcing weakAggregateCap', () => {
    const result = budgetsPropertyGate({
      applyBudgets: (evidence) =>
        applyBudgets(evidence, {
          ...DEFAULT_BUDGETS,
          weakAggregateCap: Number.POSITIVE_INFINITY,
        }),
    });
    expect(result.status).toBe('fail');
    const findings = result.findings ?? [];
    expect(findings.some((f) => f.subjects?.includes('weak-aggregate-cap'))).toBe(true);
    // Every falsification carries its reproduction coordinates.
    for (const finding of findings) {
      expect(finding.params?.seed).toBe(G6_PROPERTY_SEED);
      expect(finding.params?.counterexample).toBeTruthy();
    }
  });

  it('rings when the capped flag lies', () => {
    const result = budgetsPropertyGate({
      applyBudgets: (evidence) => ({ ...applyBudgets(evidence), capped: false }),
    });
    expect(result.status).toBe('fail');
    expect((result.findings ?? []).some((f) => f.subjects?.includes('capped-flag-truthful'))).toBe(
      true,
    );
  });

  it('rings when ranking ties fall back to input order', () => {
    const brokenRank = (candidates: readonly Candidate[], options?: RankOptions) => {
      const inputIndex = new Map(candidates.map((candidate, i) => [candidate.targetId, i]));
      return [...rank(candidates, options)].sort(
        (a, b) =>
          b.score - a.score ||
          (inputIndex.get(a.targetId) ?? 0) - (inputIndex.get(b.targetId) ?? 0),
      );
    };
    const result = budgetsPropertyGate({ rank: brokenRank });
    expect(result.status).toBe('fail');
    expect(
      (result.findings ?? []).some((f) => f.subjects?.includes('rank-permutation-invariance')),
    ).toBe(true);
  });

  it('rings when the tokenizer cuts below the 4-character stem floor', () => {
    const result = budgetsPropertyGate({
      // A regression that stems below the floor: every word truncated to 3.
      normalizeToken: (raw) => (raw.length < 3 ? null : raw.slice(0, 3)),
    });
    expect(result.status).toBe('fail');
    expect((result.findings ?? []).some((f) => f.subjects?.includes('tokenizer-stem-floor'))).toBe(
      true,
    );
  });

  it('rings when the evidence hierarchy inverts (weak cap >= exact phrase)', () => {
    const result = budgetsPropertyGate({
      budgets: { ...DEFAULT_BUDGETS, weakAggregateCap: 60 },
      // Keep applyBudgets consistent with the inverted constants so only the
      // hierarchy invariant, not the cap property, is what rings.
      applyBudgets: (evidence) =>
        applyBudgets(evidence, { ...DEFAULT_BUDGETS, weakAggregateCap: 60 }),
    });
    expect(result.status).toBe('fail');
    expect(
      (result.findings ?? []).some((f) => f.subjects?.includes('weak-cap-below-exact-phrase')),
    ).toBe(true);
  });
});

describe('reviewedConstantsCheck (G6 reviewed-constants half, pre-Phase-3)', () => {
  it('reports not-applicable with the reason, never a fake pass', () => {
    const result = reviewedConstantsCheck();
    expect(result.gate).toBe('G6-signal-budgets');
    expect(result.status).toBe('not-applicable');
    expect(result.summary).toBe(
      'reviewed-constants mirror not yet in budgets.json (ranking-fixes)',
    );
  });
});

describe('merged G6 roster row', () => {
  it('is a single required row: N/A half + passing property half = pass', () => {
    const row = mergeGateResults('Signal budgets', [reviewedConstantsCheck(), budgetsPropertyGate()]);
    expect(row.gate).toBe('G6-signal-budgets');
    expect(row.status).toBe('pass');
    expect(row.applicability).toBe('required');
    expect(row.summary).toContain('reviewed-constants mirror not yet in budgets.json');
    expect(row.summary).toContain(String(G6_PROPERTY_SEED));
  });

  it('a falsified property fails the whole row', () => {
    const row = mergeGateResults('Signal budgets', [
      reviewedConstantsCheck(),
      budgetsPropertyGate({
        applyBudgets: (evidence) => ({ ...applyBudgets(evidence), capped: false }),
      }),
    ]);
    expect(row.status).toBe('fail');
  });
});
