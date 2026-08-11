import { describe, expect, it } from 'vitest';

import type { ResearchResult, ScriptureEngine } from '@jestek-dev/scripture-engine';
import { ComparisonValidationError, buildComparisonUniverse, compareEngines, type ComparisonUniverseInput } from '../src/comparison.js';

type Fixture = Record<string, readonly Result[]>;
interface Result { readonly targetId: string; readonly reference: string; readonly score: number; readonly reasons: readonly Reason[]; }
interface Reason { readonly family: string; readonly label?: string; readonly points?: number; readonly uncappedPoints?: number; readonly provenance?: { readonly sourceId: string; readonly label?: string; readonly locator?: string; readonly weight?: number }; }

const IDENTITY = { engineVersion: 'test-engine', corpusFingerprint: 'corpus', layerFingerprint: 'layer' };

function result(targetId: string, score: number, reason: Partial<Reason> = {}): Result {
  return { targetId, reference: targetId, score, reasons: [{ family: 'concept_anchor', label: 'Anchor', points: 1, ...reason }] };
}

function engine(fixture: Fixture, identity = IDENTITY): ScriptureEngine {
  return {
    ...identity,
    async research(query: string): Promise<ResearchResult> {
      return { kind: 'discovery', query, results: fixture[query] ?? [], ...identity } as ResearchResult;
    },
    async themes() { return []; }, async passage() { throw new Error('not used'); }, async related() { throw new Error('not used'); }, async forSong() { throw new Error('not used'); }, async close() {},
  };
}

function delayedEngine(fixture: Fixture): ScriptureEngine {
  const base = engine(fixture);
  return {
    ...base,
    async research(query: string): Promise<ResearchResult> {
      await new Promise<void>((resolve) => setTimeout(resolve, 3));
      return base.research(query);
    },
  };
}

function universe(overrides: Partial<ComparisonUniverseInput> = {}): ComparisonUniverseInput {
  return {
    linkedCases: [{ sourceId: 'case-a', query: 'alpha', expected: { targetId: 'A', withinTop: 3, requiredReasonFamilies: ['concept_anchor'] } }],
    fixtureQueries: [{ sourceId: 'fixture-a-primary', fixtureId: 'fixture-a', state: 'active' as const, queryRole: 'primary' as const, query: 'beta' }, { sourceId: 'fixture-a-additional', fixtureId: 'fixture-a', state: 'pending' as const, queryRole: 'additional' as const, query: 'beta extra' }],
    g8Probes: [{ sourceId: 'probe-a', query: 'gamma' }],
    calibrationQueries: [{ sourceId: 'cal-a', query: 'delta' }],
    holdoutQueries: [{ sourceId: 'hold-a', query: 'epsilon' }],
    affectedConceptCases: [{ sourceId: 'affected-a', conceptId: 'hope', query: 'zeta' }],
    ...overrides,
  };
}

describe('M8 deterministic comparison and blast radius', () => {
  it('builds the complete, deduplicated declared universe with every membership preserved', () => {
    const built = buildComparisonUniverse(universe({
      g8Probes: [{ sourceId: 'probe-a', query: 'gamma' }, { sourceId: 'probe-beta', query: 'beta' }],
    }));
    expect(built.map((entry) => entry.query)).toEqual(['alpha', 'beta', 'beta extra', 'delta', 'epsilon', 'gamma', 'zeta']);
    expect(built.find((entry) => entry.query === 'beta')!.memberships.map((member) => member.kind)).toEqual(['fixture-active', 'g8-probe']);
    expect(Object.isFrozen(built)).toBe(true);
  });

  it('fails closed on malformed sources and contradictory duplicate ids', () => {
    expect(() => buildComparisonUniverse({ ...universe(), g8Probes: [{ sourceId: 'case-a', query: 'different' }] })).toThrow(ComparisonValidationError);
    expect(() => buildComparisonUniverse({ ...universe(), holdoutQueries: [{ sourceId: 'x', query: 'ok', unexpected: true }] as never })).toThrow(/unknown field/);
    expect(() => buildComparisonUniverse({ ...universe(), g8Probes: [{ sourceId: 'x', query: '   ' }] })).toThrow(/non-empty/);
  });

  it('is deterministic under shuffled inputs and excludes measured latency from the digest', async () => {
    const fixture = Object.fromEntries(['alpha', 'beta', 'beta extra', 'gamma', 'delta', 'epsilon', 'zeta'].map((query) => [query, [result('A', 1)]]));
    const calls: string[] = [];
    const current = engine(fixture);
    const trackingCurrent: ScriptureEngine = { ...current, async research(query: string): Promise<ResearchResult> { calls.push(query); return current.research(query); } };
    const first = await compareEngines(universe(), trackingCurrent, engine(fixture));
    const second = await compareEngines({ ...universe(), linkedCases: [...universe().linkedCases].reverse(), fixtureQueries: [...universe().fixtureQueries].reverse() }, delayedEngine(fixture), delayedEngine(fixture));
    expect(first.digest).toBe(second.digest);
    expect(first.queries.map((query) => query.query)).toEqual(['alpha', 'beta', 'beta extra', 'delta', 'epsilon', 'gamma', 'zeta']);
    expect(calls).toEqual(['alpha', 'beta', 'beta extra', 'delta', 'epsilon', 'gamma', 'zeta']);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.queries[0]!.reference.top10)).toBe(true);
    expect(second.queries.every((query) => query.reference.latencyMs >= 2)).toBe(true);
  });

  it('records additions/removals/rank/reason/provenance/score/cap movement independently', async () => {
    const reference = engine({ alpha: [result('A', 5, { provenance: { sourceId: 'old', label: 'Old' }, uncappedPoints: 4, points: 2 }), result('B', 4), result('D', 3)], beta: [], 'beta extra': [], gamma: [], delta: [], epsilon: [], zeta: [] });
    const candidate = engine({ alpha: [result('D', 9), result('A', 7, { provenance: { sourceId: 'new', label: 'New' }, uncappedPoints: 2, points: 2 }), result('C', 4)], beta: [], 'beta extra': [], gamma: [], delta: [], epsilon: [], zeta: [] });
    const report = await compareEngines(universe(), reference, candidate);
    const movement = report.queries.find((query) => query.query === 'alpha')!.movement;
    expect(movement.added).toEqual(['C']); expect(movement.removed).toEqual(['B']);
    expect(movement.rankMoved).toEqual([{ targetId: 'A', referenceRank: 1, candidateRank: 2, delta: -1 }, { targetId: 'D', referenceRank: 3, candidateRank: 1, delta: 2 }]); expect(movement.reasonChanged).toEqual(['A']);
    expect(movement.provenanceChanged).toEqual(['A']); expect(movement.scoreChanged).toEqual(['A', 'D']); expect(movement.capChanged).toEqual(['A']);
  });

  it('treats the right passage with a missing required reason as a regression', async () => {
    const ref = engine({ alpha: [result('A', 2)], beta: [], 'beta extra': [], gamma: [], delta: [], epsilon: [], zeta: [] });
    const candidate = engine({ alpha: [result('A', 3, { family: 'token_overlap' })], beta: [], 'beta extra': [], gamma: [], delta: [], epsilon: [], zeta: [] });
    const report = await compareEngines(universe(), ref, candidate);
    const alpha = report.queries.find((query) => query.query === 'alpha')!;
    expect(alpha.verdict).toBe('regressed');
    expect(alpha.expectedReferenceOutcomes.candidate[0]!.requiredReasonFamiliesMissing).toEqual(['concept_anchor']);
  });

  it('keeps identical pre-existing expectation failures unchanged while exposing their admission block', async () => {
    const identical = engine({ alpha: [result('B', 2)], beta: [], 'beta extra': [], gamma: [], delta: [], epsilon: [], zeta: [] });
    const report = await compareEngines(universe(), identical, engine({ alpha: [result('B', 2)], beta: [], 'beta extra': [], gamma: [], delta: [], epsilon: [], zeta: [] }));
    const alpha = report.queries.find((query) => query.query === 'alpha')!;
    expect(alpha.verdict).toBe('unchanged');
    expect(alpha.expectationStatus).toEqual({ referencePasses: false, candidatePasses: false, referenceFailureCount: 1, candidateFailureCount: 1 });
    expect(report.referenceExpectationFailureQueryIds).toEqual(['alpha']);
    expect(report.candidateExpectationFailureQueryIds).toEqual(['alpha']);
    expect(report.summary.candidateAdmissionBlocked).toBe(true);
    expect(report.summary.verdictCounts.regressed).toBe(0);
  });

  it('classifies repaired expectations as improved and explicitly approved movement as expected-change', async () => {
    const source = universe({
      linkedCases: [{ sourceId: 'case-a', query: 'alpha', expected: { targetId: 'A', withinTop: 1 } }],
      g8Probes: [{ sourceId: 'probe-a', query: 'gamma', expectedChange: true }],
    });
    const current = engine({ alpha: [result('B', 1)], beta: [], 'beta extra': [], gamma: [result('X', 1)], delta: [], epsilon: [], zeta: [] });
    const candidate = engine({ alpha: [result('A', 1)], beta: [], 'beta extra': [], gamma: [result('Y', 1)], delta: [], epsilon: [], zeta: [] });
    const report = await compareEngines(source, current, candidate);
    expect(report.queries.find((query) => query.query === 'alpha')!.verdict).toBe('improved');
    expect(report.queries.find((query) => query.query === 'gamma')!.verdict).toBe('expected-change');
  });

  it('enrolls every changed query outside linked cases in regression review and accounts for every changed top ten', async () => {
    const current = engine({ alpha: [result('A', 1)], beta: [result('B', 1)], 'beta extra': [result('C', 1)], gamma: [result('D', 1)], delta: [], epsilon: [], zeta: [] });
    const candidate = engine({ alpha: [result('A', 1)], beta: [result('X', 1)], 'beta extra': [result('Y', 1)], gamma: [result('Z', 1)], delta: [], epsilon: [], zeta: [] });
    const report = await compareEngines(universe(), current, candidate);
    expect(report.regressionSessionQueryIds).toEqual(['beta', 'beta extra', 'gamma']);
    expect(report.summary.changedTop10QueryCount).toBe(3);
    expect(report.summary.changedTop10ResultCount).toBe(6);
    expect(report.summary.executedQueryCount).toBe(report.summary.declaredUniverseSize);
  });

  it('fails closed on non-discovery responses, engine identity drift, repeated targets, and non-finite results', async () => {
    const valid = engine({ alpha: [result('A', 1)], beta: [], 'beta extra': [], gamma: [], delta: [], epsilon: [], zeta: [] });
    const nonDiscovery = { ...valid, async research() { return { kind: 'invalid-reference', query: 'alpha', ...IDENTITY }; } } as ScriptureEngine;
    await expect(compareEngines(universe(), nonDiscovery, valid)).rejects.toThrow(/discovery is required/);
    const drift = engine({ alpha: [result('A', 1)], beta: [], 'beta extra': [], gamma: [], delta: [], epsilon: [], zeta: [] }, { ...IDENTITY, layerFingerprint: 'declared' });
    drift.research = async (query: string) => ({ kind: 'discovery', query, results: [], ...IDENTITY }) as ResearchResult;
    await expect(compareEngines(universe(), drift, valid)).rejects.toThrow(/identity changed/);
    const duplicates = engine({ alpha: [result('A', 1), result('A', 0)], beta: [], 'beta extra': [], gamma: [], delta: [], epsilon: [], zeta: [] });
    await expect(compareEngines(universe(), duplicates, valid)).rejects.toThrow(/repeat targetId/);
    const badScore = engine({ alpha: [{ ...result('A', 1), score: Number.NaN }], beta: [], 'beta extra': [], gamma: [], delta: [], epsilon: [], zeta: [] });
    await expect(compareEngines(universe(), badScore, valid)).rejects.toThrow(/finite/);
    const unstable = engine({ alpha: [result('A', 1), result('B', 2)], beta: [], 'beta extra': [], gamma: [], delta: [], epsilon: [], zeta: [] });
    await expect(compareEngines(universe(), unstable, valid)).rejects.toThrow(/stable descending/);
  });

  it('passes the trimmed declared query exactly and rejects either engine when discovery.query differs', async () => {
    const normalizedUniverse = universe({ linkedCases: [{ sourceId: 'case-a', query: '  alpha  ' }] });
    const calls: string[] = [];
    const base = engine({ alpha: [result('A', 1)], beta: [], 'beta extra': [], gamma: [], delta: [], epsilon: [], zeta: [] });
    const recording = { ...base, async research(query: string): Promise<ResearchResult> { calls.push(query); return base.research(query); } };
    await compareEngines(normalizedUniverse, recording, base);
    expect(calls[0]).toBe('alpha');

    const mismatchedCurrent = { ...base, async research(query: string): Promise<ResearchResult> { return { kind: 'discovery', query: `${query} `, results: [], ...IDENTITY }; } };
    await expect(compareEngines(universe(), mismatchedCurrent, base)).rejects.toThrow(/exact discovery\.query match/);
    const mismatchedCandidate = { ...base, async research(query: string): Promise<ResearchResult> { return { kind: 'discovery', query: query.toUpperCase(), results: [], ...IDENTITY }; } };
    await expect(compareEngines(universe(), base, mismatchedCandidate)).rejects.toThrow(/exact discovery\.query match/);
  });
});
