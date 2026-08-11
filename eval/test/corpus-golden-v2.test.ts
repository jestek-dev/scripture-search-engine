import { describe, expect, it } from 'vitest';

import type {
  DiscoveryResult,
  ResearchResult,
  ScriptureEngine,
} from '@jestek-dev/scripture-engine';
import {
  corpusGoldenGate,
  runCorpusFixture,
  type CorpusFixture,
} from '../src/gates/corpusGolden.js';

const IDENTITY = {
  engineVersion: 'test-engine',
  corpusFingerprint: 'test-corpus',
  layerFingerprint: 'test-layer',
} as const;

function johnVerse(verse: number, label = 'Theme: Test'): DiscoveryResult {
  return {
    targetId: `WEB:${43_000_000 + 3_000 + verse}`,
    reference: `John 3:${verse}`,
    excerpt: `John 3:${verse}`,
    score: 100 - verse,
    reasons: [{ family: 'concept_anchor', label, points: 10 }],
  };
}

function discovery(query: string, results: readonly DiscoveryResult[]): ResearchResult {
  return { kind: 'discovery', query, results, ...IDENTITY };
}

function mockEngine(resultsByQuery: Readonly<Record<string, readonly DiscoveryResult[]>>): ScriptureEngine {
  const research = async (query: string): Promise<ResearchResult> =>
    discovery(query, resultsByQuery[query] ?? []);

  return {
    research,
    themes: async () => [],
    passage: async (query) => ({ kind: 'invalid-reference', query, ...IDENTITY }),
    related: async (query) => ({ kind: 'invalid-reference', query, ...IDENTITY }),
    forSong: async (input) => discovery(input.title ?? '', []),
    close: async () => undefined,
    ...IDENTITY,
  };
}

function fixture(overrides: Record<string, unknown>): CorpusFixture {
  return {
    id: 'fixture',
    status: 'active',
    query: 'test query',
    ...overrides,
  } as CorpusFixture;
}

function codes(result: Awaited<ReturnType<typeof corpusGoldenGate>>): string[] {
  return (result.findings ?? []).map((finding) => finding.categoryCode ?? '<missing>');
}

describe('G3 corpus golden v2 contract', () => {
  it('keeps legacy reference assertions and fixture-level expectedWithinTop working', async () => {
    const engine = mockEngine({ legacy: [johnVerse(16)] });
    const problems = await runCorpusFixture(
      engine,
      fixture({
        query: 'legacy',
        expectedWithinTop: 1,
        expectedTop: [{ reference: 'John 3:16' }],
      }),
    );

    expect(problems).toEqual([]);
  });

  it('applies mixed top-1 and top-10 windows per reference', async () => {
    const filler = Array.from({ length: 8 }, (_, index) => johnVerse(index + 1));
    const engine = mockEngine({
      mixed: [johnVerse(16), ...filler, johnVerse(17)],
    });

    const problems = await runCorpusFixture(
      engine,
      fixture({
        query: 'mixed',
        expectedTop: [
          { ref: 'John 3:16', withinTop: 1 },
          { ref: 'John 3:17', withinTop: 10 },
        ],
      }),
    );

    expect(problems).toEqual([]);
  });

  it('checks preferred order, including reversed order and absent results', async () => {
    const preferred = [{ above: 'John 3:16', below: 'John 3:17' }];
    const passing = await runCorpusFixture(
      mockEngine({ ordered: [johnVerse(16), johnVerse(17)] }),
      fixture({ query: 'ordered', preferredOrder: preferred }),
    );
    const reversed = await runCorpusFixture(
      mockEngine({ reversed: [johnVerse(17), johnVerse(16)] }),
      fixture({ query: 'reversed', preferredOrder: preferred }),
    );
    const onlyAbove = await runCorpusFixture(
      mockEngine({ 'only-above': [johnVerse(16)] }),
      fixture({ query: 'only-above', preferredOrder: preferred }),
    );
    const onlyBelow = await runCorpusFixture(
      mockEngine({ 'only-below': [johnVerse(17)] }),
      fixture({ query: 'only-below', preferredOrder: preferred }),
    );

    expect(passing).toEqual([]);
    expect(reversed).toHaveLength(1);
    expect(reversed[0]).toContain('expected John 3:16 above John 3:17');
    expect(onlyAbove).toEqual([]);
    expect(onlyBelow).toEqual([]);
  });

  it('grades each preferred pair only inside its declared review window', async () => {
    const ranked = [johnVerse(18), johnVerse(17), johnVerse(16)];
    const outsideWindow = await runCorpusFixture(
      mockEngine({ narrow: ranked }),
      fixture({
        query: 'narrow',
        preferredOrder: [{ above: 'John 3:16', below: 'John 3:17', withinTop: 1 }],
      }),
    );
    const observedReversal = await runCorpusFixture(
      mockEngine({ wide: ranked }),
      fixture({
        query: 'wide',
        preferredOrder: [{ above: 'John 3:16', below: 'John 3:17', withinTop: 3 }],
      }),
    );

    expect(outsideWindow).toEqual([]);
    expect(observedReversal).toHaveLength(1);
    expect(observedReversal[0]).toContain('within the top 3');
  });

  it('reports expectedTop absence independently of preferredOrder', async () => {
    const result = await corpusGoldenGate(
      mockEngine({ absent: [johnVerse(17)] }),
      [
        fixture({
          query: 'absent',
          expectedTop: [{ ref: 'John 3:16', withinTop: 1 }],
          preferredOrder: [{ above: 'John 3:16', below: 'John 3:17' }],
        }),
      ],
    );

    expect(result.status).toBe('fail');
    expect(codes(result)).toEqual(['G3_EXPECTED_TOP_ABSENT']);
    expect(result.findings?.[0]?.message).toContain('John 3:16');
  });

  it('accepts canonical range references through the shared parser', async () => {
    const problems = await runCorpusFixture(
      mockEngine({ range: [johnVerse(17)] }),
      fixture({
        query: 'range',
        expectedTop: [{ ref: 'Jn 3:16-17', withinTop: 1 }],
      }),
    );

    expect(problems).toEqual([]);
  });

  it('rejects malformed shapes, unknown fields, invalid windows, ref+reference, and duplicates', async () => {
    const result = await corpusGoldenGate(
      mockEngine({ invalid: [] }),
      [
        fixture({
          query: 'invalid',
          unexpected: true,
          expectedWithinTop: 2,
          expectedTop: [
            { ref: 'John 3:16' },
            { reference: 'John 3:16' },
            { ref: 'John 3:17', withinTop: 2 },
            { ref: 'John 3:18', reference: 'John 3:19' },
          ],
        }),
        fixture({ id: 'malformed', query: 42, expectedTop: 'not an array' }),
      ],
    );

    expect(result.status).toBe('fail');
    expect(codes(result)).toEqual([
      'G3_FIXTURE_UNKNOWN_FIELD',
      'G3_FIXTURE_INVALID_WINDOW',
      'G3_FIXTURE_DUPLICATE_EXPECTATION',
      'G3_FIXTURE_INVALID_WINDOW',
      'G3_FIXTURE_MALFORMED',
      'G3_FIXTURE_MALFORMED',
      'G3_FIXTURE_MALFORMED',
    ]);
  });

  it('rejects self, duplicate, and reversed preferred-order pairs', async () => {
    const result = await corpusGoldenGate(
      mockEngine({ pairs: [] }),
      [
        fixture({
          query: 'pairs',
          preferredOrder: [
            { above: 'John 3:16', below: 'John 3:16' },
            { above: 'John 3:16', below: 'John 3:17' },
            { above: 'John 3:16', below: 'John 3:17' },
            { above: 'John 3:17', below: 'John 3:16' },
          ],
        }),
      ],
    );

    expect(codes(result)).toEqual([
      'G3_FIXTURE_SELF_PAIR',
      'G3_FIXTURE_DUPLICATE_PAIR',
      'G3_FIXTURE_DUPLICATE_PAIR',
    ]);
  });

  it('rejects ambiguous overlapping ranges and invalid pair windows', async () => {
    const result = await corpusGoldenGate(
      mockEngine({ overlap: [] }),
      [
        fixture({
          query: 'overlap',
          expectedTop: [
            { ref: 'John 3:16-17' },
            { ref: 'John 3:17-18' },
          ],
          preferredOrder: [
            { above: 'John 3:16-17', below: 'John 3:17', withinTop: 2 },
          ],
        }),
      ],
    );

    expect(result.status).toBe('fail');
    expect(codes(result)).toContain('G3_FIXTURE_OVERLAPPING_EXPECTATION');
    expect(codes(result)).toContain('G3_FIXTURE_INVALID_WINDOW');
  });

  it('keeps category codes and results deterministic', async () => {
    const fixtures = [
      fixture({
        id: 'stable',
        query: 'stable',
        expectedTop: [{ ref: 'John 3:16', withinTop: 1 }],
        preferredOrder: [{ above: 'John 3:16', below: 'John 3:17' }],
      }),
    ];
    const first = await corpusGoldenGate(mockEngine({ stable: [johnVerse(17), johnVerse(16)] }), fixtures);
    const second = await corpusGoldenGate(mockEngine({ stable: [johnVerse(17), johnVerse(16)] }), fixtures);

    expect(first).toEqual(second);
    expect(codes(first)).toEqual(['G3_EXPECTED_TOP_ABSENT', 'G3_PREFERRED_ORDER']);
  });
});
