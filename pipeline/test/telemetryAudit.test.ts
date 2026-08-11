import { describe, expect, it } from 'vitest';

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';

import {
  analyzeTelemetryAudit,
  telemetryAuditDigest,
  TelemetryAuditValidationError,
  validateSelectedDistillates,
  type SelectedDistillateBytes,
} from '../src/telemetry/audit.js';
import type { SensitiveCategories } from '../src/telemetry/categories.js';
import type { Distillate, TelemetryBudgets } from '../src/telemetry/types.js';

const CORPUS = 'a'.repeat(64);
const LAYER = 'b'.repeat(64);
const IDENTITY = { engineVersion: 'audit-engine', corpusFingerprint: CORPUS, layerFingerprint: LAYER };
const BUDGETS: TelemetryBudgets = { minDistinctDevices: 3, rawRetentionDays: 90, weakConvertedRank: 3 };
const CATEGORIES: SensitiveCategories = {
  v: 1,
  categories: [{ id: 'test-sensitive', entries: [{ phrase: 'privacy sensitive canary' }] }],
};

function row(query: string, overrides: Partial<Distillate['queries'][number]> = {}): Distillate['queries'][number] {
  return {
    query,
    identity: IDENTITY,
    outcomes: { empty: 0, abandoned: 1, converted: 0 },
    conversions: [],
    ...overrides,
  };
}

function distillate(token: string, queries: Distillate['queries'], period = '2026-Q3'): Distillate {
  return { v: 1, app: 'maskil', period, token, queries, pairs: [] };
}

function selected(filename: string, value: unknown): SelectedDistillateBytes {
  return { filename, bytes: Buffer.from(JSON.stringify(value)) };
}

function engine(): ScriptureEngine {
  return {
    ...IDENTITY,
    async research(query: string) {
      return {
        kind: 'discovery',
        query,
        ...IDENTITY,
        results: query === 'approved aggregate canary'
          ? [{ targetId: 'WEB:43003016', reference: 'John 3:16', excerpt: '', score: 1, reasons: [] }]
          : [],
      } as Awaited<ReturnType<ScriptureEngine['research']>>;
    },
    async themes() { return []; },
    async passage() { throw new Error('not used'); },
    async related() { throw new Error('not used'); },
    async forSong() { throw new Error('not used'); },
    async close() {},
  } as ScriptureEngine;
}

describe('telemetry audit boundary', () => {
  it('accepts only the closed distillate schema and rejects raw or unknown nested fields', () => {
    const valid = distillate('token-audit-a', [row('approved aggregate canary')]);
    expect(validateSelectedDistillates([selected('a.json', valid)])).toHaveLength(1);
    expect(() => validateSelectedDistillates([selected('a.json', { ...valid, events: [] })]))
      .toThrowError(TelemetryAuditValidationError);
    expect(() => validateSelectedDistillates([selected('a.json', {
      ...valid,
      queries: [{ ...valid.queries[0], identity: { ...IDENTITY, session: 'raw-canary' } }],
    })])).toThrow(/forbidden telemetry field/);
    expect(() => validateSelectedDistillates([selected('a.json', {
      ...valid,
      queries: [{ ...valid.queries[0], debug: 'private-canary' }],
    })])).toThrow(/unknown field/);
    const duplicateToken = JSON.stringify(valid).replace('"token":"token-audit-a"', '"token":"token-audit-a","token":"attacker-token"');
    expect(() => validateSelectedDistillates([{ filename: 'a.json', bytes: Buffer.from(duplicateToken) }]))
      .toThrow(/duplicate object field/);
  });

  it('fails closed on path-like names, duplicate names, duplicate content, tokens, and periods', () => {
    const a = distillate('token-audit-a', [row('approved aggregate canary')]);
    const b = distillate('token-audit-b', [row('different')]);
    expect(() => validateSelectedDistillates([selected('../a.json', a)])).toThrow(/safe JSON basename/);
    expect(() => validateSelectedDistillates([selected('A.json', a), selected('a.json', b)])).toThrow(/filenames collide/);
    expect(() => validateSelectedDistillates([selected('a.json', a), selected('b.json', a)])).toThrow(/duplicate content/);
    expect(() => validateSelectedDistillates([selected('a.json', a), selected('b.json', { ...b, token: a.token })])).toThrow(/token appears/);
    expect(() => validateSelectedDistillates([selected('a.json', a), selected('b.json', { ...b, period: '2026-Q4' })])).toThrow(/mixed audit periods/);
  });

  it('keys an audit by selected content, independent of harmless source filenames', () => {
    const a = distillate('token-audit-a', [row('approved aggregate canary')]);
    const first = telemetryAuditDigest(validateSelectedDistillates([selected('first.json', a)]), [engine()], BUDGETS, CATEGORIES);
    expect(first).toBe(telemetryAuditDigest(validateSelectedDistillates([selected('renamed.json', a)]), [engine()], BUDGETS, CATEGORIES));
    expect(first).not.toBe(telemetryAuditDigest(
      validateSelectedDistillates([selected('renamed.json', a)]),
      [engine()],
      { ...BUDGETS, minDistinctDevices: 4 },
      CATEGORIES,
    ));
  });

  it('reports only aggregate-safe candidates and excludes rank mismatches and unreplayable rows from evidence', async () => {
    const files = validateSelectedDistillates([
      selected('a.json', distillate('token-audit-a', [
        row('approved aggregate canary', {
          outcomes: { empty: 0, abandoned: 0, converted: 1 },
          conversions: [{ target: 'WEB:43003016', rank: 2, count: 1 }],
        }),
        row('below threshold private canary'),
        row('privacy sensitive canary'),
      ])),
      selected('b.json', distillate('token-audit-b', [row('approved aggregate canary')])),
      selected('c.json', distillate('token-audit-c', [row('approved aggregate canary')])),
      selected('d.json', distillate('token-audit-d', [row('approved aggregate canary')])),
    ]);
    const result = await analyzeTelemetryAudit(files, [engine()], BUDGETS, CATEGORIES, null);
    const serialized = JSON.stringify(result);
    expect(result.summary.distinctAuditTokens).toBe(4);
    expect(result.summary.suppression).toEqual({ belowThreshold: 1, sensitiveExcluded: 1 });
    expect(result.summary.excludedEvidence.rankMismatch).toBe(1);
    expect(result.summary.candidateCases.map((candidate) => candidate.query)).toEqual(['approved aggregate canary']);
    expect(serialized).not.toContain('below threshold private canary');
    expect(serialized).not.toContain('privacy sensitive canary');
    expect(serialized).not.toContain('token-audit-a');
  });

  it('converts replay exceptions into excluded evidence without echoing a suppressed query', async () => {
    const canary = 'engine exception below threshold canary';
    const files = validateSelectedDistillates([
      selected('a.json', distillate('token-audit-a', [row('approved aggregate canary'), row(canary, {
        outcomes: { empty: 0, abandoned: 0, converted: 1 },
        conversions: [{ target: 'WEB:43003016', rank: 1, count: 1 }],
      })])),
      selected('b.json', distillate('token-audit-b', [row('approved aggregate canary')])),
      selected('c.json', distillate('token-audit-c', [row('approved aggregate canary')])),
    ]);
    const base = engine();
    const throwing = {
      ...base,
      async research(query: string) {
        if (query === canary) throw new Error(`engine leaked ${query}`);
        return base.research(query);
      },
    } as ScriptureEngine;
    const result = await analyzeTelemetryAudit(files, [throwing], BUDGETS, CATEGORIES, null);
    expect(result.summary.excludedEvidence.unreplayable).toBe(1);
    expect(JSON.stringify(result)).not.toContain(canary);
  });

  it('retains admitted cluster names that overlap JavaScript prototype properties', async () => {
    const files = validateSelectedDistillates([
      selected('a.json', distillate('token-audit-a', [row('constructor')])),
      selected('b.json', distillate('token-audit-b', [row('constructor')])),
      selected('c.json', distillate('token-audit-c', [row('constructor')])),
    ]);
    const result = await analyzeTelemetryAudit(files, [engine()], BUDGETS, CATEGORIES, null);
    expect(Object.hasOwn(result.nextMasterRecord.clusters, 'constructor')).toBe(true);
  });

  it('does not let a one-device uppercase form piggyback on an admitted normalized cluster', async () => {
    const privateVariant = 'APPROVED AGGREGATE CANARY';
    const files = validateSelectedDistillates([
      selected('a.json', distillate('token-audit-a', [row('approved aggregate canary'), row(privateVariant)])),
      selected('b.json', distillate('token-audit-b', [row('approved aggregate canary')])),
      selected('c.json', distillate('token-audit-c', [row('approved aggregate canary')])),
    ]);
    const result = await analyzeTelemetryAudit(files, [engine()], BUDGETS, CATEGORIES, null);
    const serialized = JSON.stringify(result);
    expect(result.summary.suppression.belowThreshold).toBe(1);
    expect(result.summary.candidateCases.map((candidate) => candidate.query)).toEqual(['approved aggregate canary']);
    expect(serialized).not.toContain(privateVariant);
  });

  it('excludes unavailable-identity rows with and without conversions before any evidence is accumulated', async () => {
    const withoutConversion = 'unavailable identity without conversion canary';
    const withConversion = 'unavailable identity with conversion canary';
    const foreign = { engineVersion: 'foreign-engine', corpusFingerprint: 'c'.repeat(64), layerFingerprint: 'd'.repeat(64) };
    const queries = [
      row(withoutConversion, { identity: foreign }),
      row(withConversion, {
        identity: foreign,
        outcomes: { empty: 0, abandoned: 0, converted: 1 },
        conversions: [{ target: 'WEB:43003016', rank: 1, count: 1 }],
      }),
    ];
    const files = validateSelectedDistillates([
      selected('a.json', distillate('token-audit-a', queries)),
      selected('b.json', distillate('token-audit-b', queries)),
      selected('c.json', distillate('token-audit-c', queries)),
    ]);
    const result = await analyzeTelemetryAudit(files, [engine()], BUDGETS, CATEGORIES, null);
    expect(result.summary.excludedEvidence.unreplayable).toBe(6);
    expect(result.summary.candidateCases).toEqual([]);
    expect(JSON.stringify(result)).not.toContain('unavailable identity');
  });

  it('invalidates the whole row when any one of multiple conversion claims has a rank mismatch', async () => {
    const canary = 'rank mismatch false miss canary';
    const badRow = row(canary, {
      outcomes: { empty: 0, abandoned: 0, converted: 2 },
      conversions: [
        { target: 'WEB:43003016', rank: 1, count: 1 },
        { target: 'WEB:45008028', rank: 1, count: 1 },
      ],
    });
    const files = validateSelectedDistillates([
      selected('a.json', distillate('token-audit-a', [badRow])),
      selected('b.json', distillate('token-audit-b', [badRow])),
      selected('c.json', distillate('token-audit-c', [badRow])),
    ]);
    const base = engine();
    const ranked = {
      ...base,
      async research(query: string) {
        return {
          kind: 'discovery', query, ...IDENTITY,
          results: [
            { targetId: 'WEB:43003016', reference: 'John 3:16', excerpt: '', score: 2, reasons: [] },
            { targetId: 'WEB:45008028', reference: 'Romans 8:28', excerpt: '', score: 1, reasons: [] },
          ],
        } as Awaited<ReturnType<ScriptureEngine['research']>>;
      },
    } as ScriptureEngine;
    const result = await analyzeTelemetryAudit(files, [ranked], BUDGETS, CATEGORIES, null);
    expect(result.summary.excludedEvidence.rankMismatch).toBe(3);
    expect(result.summary.candidateCases).toEqual([]);
    expect(JSON.stringify(result)).not.toContain(canary);
  });

  it('excludes discovery responses with a wrong query echo or wrong result identity', async () => {
    const wrongQuery = 'wrong query echo canary';
    const wrongIdentity = 'wrong result identity canary';
    const queries = [row(wrongQuery), row(wrongIdentity)];
    const files = validateSelectedDistillates([
      selected('a.json', distillate('token-audit-a', queries)),
      selected('b.json', distillate('token-audit-b', queries)),
      selected('c.json', distillate('token-audit-c', queries)),
    ]);
    const base = engine();
    const lying = {
      ...base,
      async research(query: string) {
        return {
          kind: 'discovery',
          query: query === wrongQuery ? 'different query' : query,
          ...IDENTITY,
          layerFingerprint: query === wrongIdentity ? 'c'.repeat(64) : LAYER,
          results: [],
        } as Awaited<ReturnType<ScriptureEngine['research']>>;
      },
    } as ScriptureEngine;
    const result = await analyzeTelemetryAudit(files, [lying], BUDGETS, CATEGORIES, null);
    expect(result.summary.excludedEvidence.unreplayable).toBe(6);
    expect(result.summary.candidateCases).toEqual([]);
    expect(JSON.stringify(result)).not.toContain('wrong query echo');
    expect(JSON.stringify(result)).not.toContain('wrong result identity');
  });
});
