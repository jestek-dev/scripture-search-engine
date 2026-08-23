import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  applyBudgets,
  DEFAULT_BUDGETS,
  EXACT_PHRASE_FULL_AUTHORITY_WORDS,
  rank,
  type Candidate,
  type RankOptions,
} from '@jestek-dev/scripture-engine/internal';

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

describe('reviewedConstantsCheck (G6 reviewed-constants half)', () => {
  const committedMirror = () =>
    (JSON.parse(readFileSync(new URL('../budgets.json', import.meta.url), 'utf8')) as {
      signalBudgets?: unknown;
    }).signalBudgets;

  it('reports not-applicable with the reason when the mirror block is absent, never a fake pass', () => {
    const result = reviewedConstantsCheck();
    expect(result.gate).toBe('G6-signal-budgets');
    expect(result.status).toBe('not-applicable');
    expect(result.summary).toBe(
      'signalBudgets reviewed-constants mirror absent from budgets.json (0.10.0 stages add it incrementally)',
    );
  });

  it('passes when the committed budgets.json mirror equals the engine constants', () => {
    const result = reviewedConstantsCheck(committedMirror());
    expect(result.status).toBe('pass');
    expect(result.summary).toContain('soleEvidenceMaxPoints');
  });

  it('the committed mirror actually names the sole-evidence floor', () => {
    expect(committedMirror()).toMatchObject({
      soleEvidenceMaxPoints: DEFAULT_BUDGETS.soleEvidenceMaxPoints,
    });
  });

  it('the committed mirror actually names the exact-phrase taper constant (stage 3)', () => {
    expect(committedMirror()).toMatchObject({
      exactPhraseFullAuthorityWords: EXACT_PHRASE_FULL_AUTHORITY_WORDS,
    });
  });

  it('rings on a retuned constant: mirror value differing from the engine fails', () => {
    const result = reviewedConstantsCheck({
      soleEvidenceMaxPoints: { translation_variant: 14 },
    });
    expect(result.status).toBe('fail');
    expect((result.findings ?? []).some((f) => f.categoryCode === 'mirror-mismatch')).toBe(true);
  });

  it('rings on a retuned taper constant: a re-tuned exactPhraseFullAuthorityWords cannot land code-only', () => {
    const result = reviewedConstantsCheck({
      ...(committedMirror() as Record<string, unknown>),
      exactPhraseFullAuthorityWords: 4,
    });
    expect(result.status).toBe('fail');
    expect((result.findings ?? []).some((f) => f.categoryCode === 'mirror-mismatch')).toBe(true);
  });

  it('rings on a stale mirror: a key the engine does not export fails', () => {
    const result = reviewedConstantsCheck({
      ...(committedMirror() as Record<string, unknown>),
      retiredConstant: 3,
    });
    expect(result.status).toBe('fail');
    expect((result.findings ?? []).some((f) => f.categoryCode === 'unknown-constant')).toBe(true);
  });

  it('rings on an empty mirror block - decoration is worse than absence', () => {
    const result = reviewedConstantsCheck({ $comment: ['empty'] });
    expect(result.status).toBe('fail');
    expect((result.findings ?? []).some((f) => f.categoryCode === 'empty-mirror')).toBe(true);
  });

  it('compares by value, not key order', () => {
    const result = reviewedConstantsCheck({
      ...(committedMirror() as Record<string, unknown>),
      soleEvidenceMaxPoints: JSON.parse(
        JSON.stringify(DEFAULT_BUDGETS.soleEvidenceMaxPoints),
      ),
    });
    expect(result.status).toBe('pass');
  });

  it('rings on a deleted mirror key: a registered engine constant absent from the mirror fails (registry ⊆ mirror)', () => {
    const truncated = { ...(committedMirror() as Record<string, unknown>) };
    delete truncated['chipDisplayMinPoints'];
    const result = reviewedConstantsCheck(truncated);
    expect(result.status).toBe('fail');
    expect(
      (result.findings ?? []).some(
        (f) =>
          f.categoryCode === 'unmirrored-constant' &&
          f.subjects?.includes('chipDisplayMinPoints'),
      ),
    ).toBe(true);
  });

  it('the reverse assertion covers every registered constant, not just one', () => {
    const result = reviewedConstantsCheck({ $comment: ['deleted everything'] });
    expect(result.status).toBe('fail');
    const missing = (result.findings ?? [])
      .filter((f) => f.categoryCode === 'unmirrored-constant')
      .flatMap((f) => f.subjects ?? []);
    expect(missing.sort()).toEqual([
      'chipDisplayMinPoints',
      'exactPhraseFullAuthorityWords',
      'passageTermChipDisplayFloor',
      'passageTermPmiHalfSaturation',
      'soleEvidenceMaxPoints',
    ]);
  });
});

describe('merged G6 roster row', () => {
  it('is a single required row: passing constants half + passing property half = pass', () => {
    const mirror = (JSON.parse(
      readFileSync(new URL('../budgets.json', import.meta.url), 'utf8'),
    ) as { signalBudgets?: unknown }).signalBudgets;
    const row = mergeGateResults('Signal budgets', [
      reviewedConstantsCheck(mirror),
      budgetsPropertyGate(),
    ]);
    expect(row.gate).toBe('G6-signal-budgets');
    expect(row.status).toBe('pass');
    expect(row.applicability).toBe('required');
    expect(row.summary).toContain('reviewed-constants mirror matches the engine');
    expect(row.summary).toContain(String(G6_PROPERTY_SEED));
  });

  it('a tampered mirror fails the whole row', () => {
    const row = mergeGateResults('Signal budgets', [
      reviewedConstantsCheck({ soleEvidenceMaxPoints: { translation_variant: 999 } }),
      budgetsPropertyGate(),
    ]);
    expect(row.status).toBe('fail');
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
