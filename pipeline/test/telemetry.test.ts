/**
 * Telemetry conformance and mining tests.
 *
 * These tests ARE the shim spec: a consumer port of `distill.ts` is
 * conformant when it agrees with every case here. The privacy-critical
 * cases (sensitive strings appear NOWHERE, histories cannot survive
 * distillation, below-threshold strings never print) are structural — they
 * assert on the full serialized output, not on the code path.
 */

import { describe, expect, it } from 'vitest';

import { buildSensitiveMatcher, loadSensitiveCategories } from '../src/telemetry/categories.js';
import { distill } from '../src/telemetry/distill.js';
import { clusterSignature, mine, updateMasterRecord } from '../src/telemetry/mine.js';
import type { Distillate, TelemetryBudgets, TelemetryEvent } from '../src/telemetry/types.js';
import { validateDistillate } from '../src/telemetry/validate.js';

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';

const CORPUS = 'a'.repeat(64);
const LAYER = 'b'.repeat(64);
const IDENTITY = { engineVersion: '0.7.1', corpusFingerprint: CORPUS, layerFingerprint: LAYER };

const BUDGETS: TelemetryBudgets = { minDistinctDevices: 3, rawRetentionDays: 90, weakConvertedRank: 3 };

const sensitive = buildSensitiveMatcher(loadSensitiveCategories());

function event(overrides: Partial<TelemetryEvent> & { query: string }): TelemetryEvent {
  return {
    v: 1,
    app: 'maskil',
    date: '2026-07-15',
    session: 's1',
    ...IDENTITY,
    outcome: 'abandoned',
    ...overrides,
  };
}

function distillate(overrides: Partial<Distillate>): Distillate {
  return {
    v: 1,
    app: 'maskil',
    period: '2026-Q3',
    token: `token-${Math.abs(JSON.stringify(overrides).length)}-${overrides.token ?? 'x'}`.padEnd(8, '0'),
    queries: [],
    pairs: [],
    ...overrides,
  };
}

function queryRow(query: string, outcomes: Partial<Distillate['queries'][number]['outcomes']> = {}, conversions: Distillate['queries'][number]['conversions'] = []) {
  return {
    query,
    identity: IDENTITY,
    outcomes: { empty: 0, abandoned: 1, converted: 0, ...outcomes },
    conversions,
  };
}

/**
 * A fake engine with a scripted result list per query — the miner takes
 * engines by injection precisely so mining logic is testable without a
 * database. One integration test below uses the real fixture instead.
 */
function fakeEngine(listings: Record<string, readonly { targetId: string; reference: string }[]>): ScriptureEngine {
  return {
    engineVersion: IDENTITY.engineVersion,
    corpusFingerprint: CORPUS,
    layerFingerprint: LAYER,
    async research(query: string) {
      const results = (listings[query] ?? []).map((row, index) => ({
        targetId: row.targetId,
        reference: row.reference,
        excerpt: '',
        score: 100 - index,
        reasons: [],
      }));
      return { kind: 'discovery', query, results, ...IDENTITY } as Awaited<ReturnType<ScriptureEngine['research']>>;
    },
    async themes() { return []; },
    async passage() { throw new Error('not used'); },
    async related() { throw new Error('not used'); },
    async forSong() { throw new Error('not used'); },
    async close() { /* nothing to close */ },
  } as ScriptureEngine;
}

describe('sensitive-category matcher', () => {
  it('drops distinctive crisis vocabulary by token, inflection included', () => {
    expect(sensitive.isSensitive('verses about suicide')).toBe(true);
    expect(sensitive.isSensitive('am I beyond hope after my divorce')).toBe(true);
    expect(sensitive.isSensitive('divorcing my husband')).toBe(true);
  });

  it('drops pronoun phrases by raw substring, where the tokenizer would gut them', () => {
    expect(sensitive.isSensitive('I want to kill myself')).toBe(true);
    expect(sensitive.isSensitive("i don't want to live anymore")).toBe(true);
  });

  it('does NOT drop core theological vocabulary sharing a token', () => {
    // 'kill myself' must not shadow the commandment; 'death' is not listed.
    expect(sensitive.isSensitive('thou shalt not kill')).toBe(false);
    expect(sensitive.isSensitive('victory over death')).toBe(false);
    expect(sensitive.isSensitive('do not be anxious')).toBe(false);
  });
});

describe('distill — the shim spec', () => {
  const options = { app: 'maskil' as const, period: '2026-Q3', token: 'token-aaaa', sensitive };

  it('never lets a sensitive query into the distillate, in any field', () => {
    const events = [
      event({ query: 'verses about suicide', session: 's1' }),
      event({ query: 'refuge in trouble', session: 's1', outcome: 'converted', target: 'WEB:19046001', rank: 1 }),
      // A sensitive query that "converts" must not surface as a pair end either.
      event({ query: 'I want to kill myself', session: 's2' }),
      event({ query: 'psalm 34', session: 's2', outcome: 'converted', target: 'WEB:19034008', rank: 1 }),
    ];
    const { distillate: output, sensitiveDropped } = distill(events, options);
    const serialized = JSON.stringify(output);
    expect(serialized).not.toContain('suicide');
    expect(serialized).not.toContain('kill myself');
    expect(sensitiveDropped).toBe(2);
  });

  it('exports no history: no sessions, no dates, no event ordering', () => {
    const events = [
      event({ query: 'hearing and doing', session: 'secret-session', date: '2026-07-04' }),
      event({ query: 'hearing and doing', session: 'secret-session', date: '2026-07-05' }),
    ];
    const { distillate: output } = distill(events, options);
    const serialized = JSON.stringify(output);
    expect(serialized).not.toContain('secret-session');
    expect(serialized).not.toContain('2026-07-04');
    expect(serialized).not.toContain('2026-07-05');
    // Aggregated to one row with counts — the shape cannot express sequence.
    expect(output.queries).toHaveLength(1);
    expect(output.queries[0]!.outcomes.abandoned).toBe(2);
    expect(validateDistillate(output).ok).toBe(true);
  });

  it('mines the abandoned→converted pair within a session', () => {
    const events = [
      event({ query: 'plans to prosper you', session: 's1' }),
      event({ query: 'jeremiah 29 11', session: 's1', outcome: 'converted', target: 'WEB:24029011', rank: 1 }),
    ];
    const { distillate: output } = distill(events, options);
    expect(output.pairs).toEqual([{ from: 'plans to prosper you', to: 'jeremiah 29 11', count: 1 }]);
  });

  it('does NOT mine a false pair across sessions', () => {
    const events = [
      // Different session: not a reformulation, whatever the timing.
      event({ query: 'plans to prosper you', session: 's1' }),
      event({ query: 'jeremiah 29 11', session: 's2', outcome: 'converted', target: 'WEB:24029011', rank: 1 }),
    ];
    const { distillate: output } = distill(events, options);
    expect(output.pairs).toEqual([]);
  });

  it('caps pair distance: near reformulations pair, distant ones do not', () => {
    // One chain: lukewarm → a → b → c(converted). The adjacent retries are
    // textbook reformulations; the head of the chain is past the cap and
    // stays unpaired — precision over recall.
    const events = [
      event({ query: 'lukewarm faith', session: 's3' }),
      event({ query: 'a', session: 's3' }),
      event({ query: 'b', session: 's3' }),
      event({ query: 'c', session: 's3', outcome: 'converted', target: 'WEB:66003016', rank: 2 }),
    ];
    const { distillate: output } = distill(events, options);
    expect(output.pairs).toEqual([
      { from: 'a', to: 'c', count: 1 },
      { from: 'b', to: 'c', count: 1 },
    ]);
    expect(output.pairs.some((pair) => pair.from === 'lukewarm faith')).toBe(false);
  });

  it('is deterministic: same events, byte-identical distillate', () => {
    const events = [
      event({ query: 'zeal', session: 's1' }),
      event({ query: 'anchor of the soul', session: 's1', outcome: 'converted', target: 'WEB:58006019', rank: 2 }),
    ];
    const a = JSON.stringify(distill(events, options).distillate);
    const b = JSON.stringify(distill(events, options).distillate);
    expect(a).toBe(b);
  });
});

describe('validateDistillate', () => {
  it('accepts what distill produces and refuses history-bearing fields', () => {
    const good = distill([event({ query: 'hope' })], { app: 'maskil', period: '2026-Q3', token: 'token-aaaa', sensitive }).distillate;
    expect(validateDistillate(good).ok).toBe(true);
    expect(validateDistillate({ ...good, events: [] }).ok).toBe(false);
    expect(validateDistillate({ ...good, session: 'x' }).ok).toBe(false);
    expect(validateDistillate({ ...good, deviceId: 'x' }).ok).toBe(false);
  });

  it('refuses unknown schema versions outright', () => {
    expect(validateDistillate({ v: 2 }).ok).toBe(false);
  });
});

describe('mine', () => {
  const engine = fakeEngine({
    'lukewarm faith': [],
    'plans to prosper you': [],
    'armor of god': [
      { targetId: 'WEB:45013012', reference: 'Romans 13:12' },
      { targetId: 'WEB:49006011', reference: 'Ephesians 6:11' },
      { targetId: 'WEB:49006013', reference: 'Ephesians 6:13' },
      { targetId: 'WEB:49006014', reference: 'Ephesians 6:14' },
      { targetId: 'WEB:49006015', reference: 'Ephesians 6:15' },
      { targetId: 'WEB:49006016', reference: 'Ephesians 6:16' },
      { targetId: 'WEB:49006017', reference: 'Ephesians 6:17' },
    ],
    'fruit of the spirit': [
      { targetId: 'WEB:48005022', reference: 'Galatians 5:22' },
      { targetId: 'WEB:49005009', reference: 'Ephesians 5:9' },
    ],
  });

  const threeDevices = (query: string, outcomes: Parameters<typeof queryRow>[1] = {}, conversions: Parameters<typeof queryRow>[2] = []) =>
    ['token-aaaa', 'token-bbbb', 'token-cccc'].map((token) =>
      distillate({ token, queries: [queryRow(query, outcomes, conversions)] }),
    );

  it('never prints a below-threshold query string anywhere in the report', async () => {
    const dumps = [
      ...threeDevices('lukewarm faith'),
      // One device only — must be suppressed by name everywhere.
      distillate({ token: 'token-zzzz', queries: [queryRow('rare private phrasing nobody else typed')] }),
    ];
    const { report, markdown } = await mine(dumps, [engine], BUDGETS, sensitive);
    expect(markdown).not.toContain('rare private phrasing');
    expect(JSON.stringify(report.clusters)).not.toContain('rare private phrasing');
    expect(report.suppressed.belowThreshold).toBe(1);
  });

  it('never prints a sensitive query string even if a broken shim exported it', async () => {
    const dumps = threeDevices('verses about suicide');
    const { report, markdown } = await mine(dumps, [engine], BUDGETS, sensitive);
    expect(markdown).not.toContain('suicide');
    expect(JSON.stringify(report)).not.toContain('suicide');
    expect(report.suppressed.sensitiveDropped).toBe(3);
  });

  it('suppresses a pair when either end is sensitive or under-attested', async () => {
    const dumps = [
      ...threeDevices('lukewarm faith'),
      distillate({ token: 'token-pppp', pairs: [{ from: 'lukewarm faith', to: 'I want to kill myself', count: 1 }] }),
      distillate({ token: 'token-qqqq', pairs: [{ from: 'one-device pair', to: 'somewhere', count: 1 }] }),
    ];
    const { markdown } = await mine(dumps, [engine], BUDGETS, sensitive);
    expect(markdown).not.toContain('kill myself');
    expect(markdown).not.toContain('one-device pair');
  });

  it('verdicts: MISS with no conversions, WEAK past the rank threshold, SATISFIED within it, RENAMED on a pair', async () => {
    const dumps = [
      ...threeDevices('lukewarm faith', { abandoned: 2 }),
      ...threeDevices('armor of god', { converted: 1 }, [{ target: 'WEB:49006011', rank: 2, count: 1 }]),
      ...threeDevices('fruit of the spirit', { converted: 1 }, [{ target: 'WEB:48005022', rank: 1, count: 1 }]),
      ...['token-aaaa', 'token-bbbb', 'token-cccc'].map((token) =>
        distillate({
          token,
          queries: [queryRow('plans to prosper you', { abandoned: 1 })],
          pairs: [{ from: 'plans to prosper you', to: 'fruit of the spirit', count: 1 }],
        }),
      ),
    ];
    // weakConvertedRank of 1 makes rank-2 armor WEAK while rank-1 fruit stays SATISFIED.
    const budgets = { ...BUDGETS, weakConvertedRank: 1 };
    const { report } = await mine(dumps, [engine], budgets, sensitive);
    const verdictOf = (query: string) => report.clusters.find((cluster) => cluster.signature === clusterSignature(query))?.verdict;
    expect(verdictOf('lukewarm faith')).toBe('MISS');
    expect(verdictOf('plans to prosper you')).toBe('RENAMED');
    expect(verdictOf('armor of god')).toBe('WEAK');
    expect(verdictOf('fruit of the spirit')).toBe('SATISFIED');
    // Ordered by verdict, never by volume.
    expect(report.clusters.map((cluster) => cluster.verdict)).toEqual(['MISS', 'RENAMED', 'WEAK', 'SATISFIED']);
  });

  it('flags conversions whose logged rank disagrees with deterministic replay', async () => {
    const dumps = threeDevices('fruit of the spirit', { converted: 1 }, [
      { target: 'WEB:48005022', rank: 5, count: 1 }, // replay says rank 1
    ]);
    const { report } = await mine(dumps, [engine], BUDGETS, sensitive);
    expect(report.flagged.rankMismatch).toBe(3);
    const cluster = report.clusters.find((entry) => entry.signature === clusterSignature('fruit of the spirit'));
    expect(cluster?.conversions).toEqual([]); // excluded from evidence, not half-trusted
  });

  it('counts conversions with an unreplayable identity instead of guessing', async () => {
    const foreign = { engineVersion: '0.6.0', corpusFingerprint: 'c'.repeat(64), layerFingerprint: 'd'.repeat(64) };
    const dumps = ['token-aaaa', 'token-bbbb', 'token-cccc'].map((token) =>
      distillate({
        token,
        queries: [{ query: 'fruit of the spirit', identity: foreign, outcomes: { empty: 0, abandoned: 0, converted: 1 }, conversions: [{ target: 'WEB:48005022', rank: 1, count: 1 }] }],
      }),
    );
    const { report } = await mine(dumps, [engine], BUDGETS, sensitive);
    expect(report.flagged.unreplayable).toBe(3);
  });

  it('refuses mixed periods and mixed schema versions', async () => {
    const q3 = distillate({ token: 'token-aaaa' });
    const q4 = distillate({ token: 'token-bbbb', period: '2026-Q4' });
    await expect(mine([q3, q4], [engine], BUDGETS, sensitive)).rejects.toThrow(/one audit, one period/);
  });

  it('is deterministic: same dump, byte-identical markdown', async () => {
    const dumps = threeDevices('lukewarm faith');
    const first = await mine(dumps, [engine], BUDGETS, sensitive);
    const second = await mine(dumps, [engine], BUDGETS, sensitive);
    expect(first.markdown).toBe(second.markdown);
  });
});

describe('updateMasterRecord', () => {
  it('accumulates wording forever and refuses a double-counted audit', async () => {
    const engine = fakeEngine({ 'lukewarm faith': [] });
    const dumps = ['token-aaaa', 'token-bbbb', 'token-cccc'].map((token) =>
      distillate({ token, queries: [queryRow('lukewarm faith')] }),
    );
    const { report } = await mine(dumps, [engine], BUDGETS, sensitive);
    const master = updateMasterRecord(null, report);
    expect(Object.keys(master.clusters)).toContain(clusterSignature('lukewarm faith'));
    expect(master.audits).toHaveLength(1);
    // The one-audit-once rule: re-recording is an error, not a merge.
    expect(() => updateMasterRecord(master, report)).toThrow(/already holds audit/);
  });
});
