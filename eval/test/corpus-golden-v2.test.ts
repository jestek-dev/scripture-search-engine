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
import { mergeGateResults } from '../src/gates/merge.js';
import { pass } from '../src/gates/types.js';
import { decideVerdict } from '../src/report.js';

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

describe('G3 pending fixture status', () => {
  const activeGreen = fixture({
    id: 'act-green',
    query: 'act-green',
    expectedTop: [{ ref: 'John 3:16', withinTop: 1 }],
  });
  const pendingFailing = fixture({
    id: 'pend-fail',
    status: 'pending',
    query: 'pend-fail',
    expectedTop: [{ ref: 'John 3:16', withinTop: 1 }],
  });
  const pendingPassing = fixture({
    id: 'pend-pass',
    status: 'pending',
    query: 'pend-pass',
    expectedTop: [{ ref: 'John 3:16', withinTop: 1 }],
  });
  const engine = mockEngine({
    'act-green': [johnVerse(16)],
    'pend-fail': [johnVerse(17)],
    'pend-pass': [johnVerse(16)],
  });

  it('surfaces a still-failing pending fixture as a warn sub-result with its failure count', async () => {
    const result = await corpusGoldenGate(engine, [activeGreen, pendingFailing, pendingPassing]);

    expect(result.status).toBe('warn');
    expect(result.summary).toContain('Pending fixture status: 1 of 2 still failing');
    expect(result.metrics?.['pendingFailures']).toBe(1);

    const finding = (result.findings ?? []).find(
      (candidate) => candidate.subjects?.includes('pend-fail'),
    );
    expect(finding).toBeDefined();
    expect(finding?.message).toContain('pending fixture pend-fail: currently fails 1 expectation(s)');
    expect(finding?.message).toContain('G3_EXPECTED_TOP_ABSENT John 3:16');
    expect(finding?.message).toContain('full detail in machine report');
    expect(finding?.metrics?.['failedExpectations']).toBe(1);
    expect(finding?.params?.['failedExpectationMessages']).toHaveLength(1);
    // The machine report refuses non-semantic categories; a still-failing
    // pending fixture must never crash report generation on an honest run.
    expect(finding?.categoryCode).toMatch(/^sse\.gauntlet\.v1\.finding\.g3-golden\.[a-z][a-z0-9-]*$/);
  });

  it('flips the run verdict to ADMIT_WITH_WARNINGS through the existing G3 merge', async () => {
    const corpus = await corpusGoldenGate(engine, [activeGreen, pendingFailing]);
    const g3 = mergeGateResults('Golden regression', [
      pass('G3-golden', 'Golden regression (ranking)', 'ranking fixtures hold'),
      corpus,
    ]);

    expect(g3.status).toBe('warn');
    expect(decideVerdict({ gates: [g3] })).toBe('ADMIT_WITH_WARNINGS');
  });

  it('keeps the promotion path alive alongside a still-failing pending fixture', async () => {
    const corpus = await corpusGoldenGate(engine, [activeGreen, pendingFailing, pendingPassing]);
    const g3 = mergeGateResults('Golden regression', [
      pass('G3-golden', 'Golden regression (ranking)', 'ranking fixtures hold'),
      corpus,
    ]);

    expect(corpus.promotionCandidates).toEqual(['pend-pass']);
    expect(g3.promotionCandidates).toEqual(['pend-pass']);
  });

  it('reports a pass sub-result when every pending fixture currently passes', async () => {
    const result = await corpusGoldenGate(engine, [activeGreen, pendingPassing]);

    expect(result.status).toBe('pass');
    expect(result.summary).toContain('Pending fixture status: 1 pending, all currently passing');
    expect(result.metrics?.['pendingFailures']).toBe(0);
    expect(result.promotionCandidates).toEqual(['pend-pass']);
    expect(decideVerdict({ gates: [result] })).toBe('ADMIT');
  });

  it('still hard-fails on an active-fixture failure, without pending noise', async () => {
    const brokenActive = fixture({
      id: 'act-broken',
      query: 'pend-fail', // engine returns the wrong verse for this query
      expectedTop: [{ ref: 'John 3:16', withinTop: 1 }],
    });
    const result = await corpusGoldenGate(engine, [brokenActive, pendingFailing]);

    expect(result.status).toBe('fail');
    expect(codes(result)).toEqual(['G3_EXPECTED_TOP_ABSENT']);
    expect(decideVerdict({ gates: [result] })).toBe('REJECT');
  });
});

describe('G3 mustNotLead and guard vacuity', () => {
  const GUARD_VACUOUS = 'sse.gauntlet.v1.finding.g3-golden.guard-vacuous';

  /**
   * Engine whose corpus "contains" exactly the references listed in
   * presentRefs: passage() answers with verses for those and
   * invalid-reference for everything else, which is how guard vacuity is
   * detected against the real engine.
   */
  function guardEngine(
    resultsByQuery: Readonly<Record<string, readonly DiscoveryResult[]>>,
    presentRefs: readonly string[],
  ): ScriptureEngine {
    const base = mockEngine(resultsByQuery);
    return {
      ...base,
      passage: async (reference) =>
        presentRefs.includes(reference)
          ? {
              kind: 'passage',
              passage: {
                reference,
                bookId: 43,
                chapterCount: 21,
                startChapter: 3,
                endChapter: 3,
                verses: [
                  {
                    id: 1,
                    verseId: 43003016,
                    translationId: 1,
                    translationCode: 'WEB',
                    bookId: 43,
                    bookName: 'John',
                    chapter: 3,
                    verse: 16,
                    text: 'present',
                  },
                ],
              },
              ...IDENTITY,
            }
          : { kind: 'invalid-reference', query: reference, ...IDENTITY },
    };
  }

  const guarded = (overrides: Record<string, unknown> = {}) =>
    fixture({
      query: 'guarded',
      mustNotLead: [{ ref: 'John 3:18', why: 'sense-inverted for this query' }],
      ...overrides,
    });

  it('fails when the guarded reference leads at #1 (default window 1)', async () => {
    const result = await corpusGoldenGate(
      guardEngine({ guarded: [johnVerse(18), johnVerse(16)] }, ['John 3:18']),
      [guarded()],
    );

    expect(result.status).toBe('fail');
    expect(codes(result)).toEqual(['G3_MUST_NOT_LEAD']);
    expect(result.findings?.[0]?.message).toContain('John 3:18');
    expect(result.findings?.[0]?.message).toContain('sense-inverted for this query');
    expect(decideVerdict({ gates: [result] })).toBe('REJECT');
  });

  it('passes when the same reference ranks #2 — demoted, never suppressed', async () => {
    const result = await corpusGoldenGate(
      guardEngine({ guarded: [johnVerse(16), johnVerse(18)] }, ['John 3:18']),
      [guarded()],
    );

    expect(result.status).toBe('pass');
    expect(result.findings ?? []).toEqual([]);
  });

  it('honours withinTop 3: leading at #3 fails, #4 passes', async () => {
    const wide = (query: string) =>
      guarded({ query, mustNotLead: [{ ref: 'John 3:18', why: 'sense-inverted', withinTop: 3 }] });
    const atThree = await corpusGoldenGate(
      guardEngine({ 'at-three': [johnVerse(16), johnVerse(17), johnVerse(18)] }, ['John 3:18']),
      [wide('at-three')],
    );
    const atFour = await corpusGoldenGate(
      guardEngine(
        { 'at-four': [johnVerse(16), johnVerse(17), johnVerse(19), johnVerse(18)] },
        ['John 3:18'],
      ),
      [wide('at-four')],
    );

    expect(atThree.status).toBe('fail');
    expect(codes(atThree)).toEqual(['G3_MUST_NOT_LEAD']);
    expect(atThree.findings?.[0]?.message).toContain('top 3');
    expect(atFour.status).toBe('pass');
  });

  it('requires why, and admits only leadership windows 1 and 3', async () => {
    const missingWhy = await corpusGoldenGate(guardEngine({ q: [] }, []), [
      fixture({ query: 'q', mustNotLead: [{ ref: 'John 3:18' }] }),
    ]);
    const badWindow = await corpusGoldenGate(guardEngine({ q: [] }, []), [
      fixture({ query: 'q', mustNotLead: [{ ref: 'John 3:18', why: 'w', withinTop: 5 }] }),
    ]);
    const both = await corpusGoldenGate(guardEngine({ q: [] }, []), [
      fixture({ query: 'q', mustNotLead: [{ ref: 'John 3:18', reference: 'John 3:18', why: 'w' }] }),
    ]);

    expect(codes(missingWhy)).toContain('G3_FIXTURE_MALFORMED');
    expect(missingWhy.findings?.some((finding) => finding.message.includes('why'))).toBe(true);
    expect(codes(badWindow)).toContain('G3_FIXTURE_INVALID_WINDOW');
    expect(codes(both)).toContain('G3_FIXTURE_MALFORMED');
  });

  it('reports a corpus-absent mustNotLead guard as VACUOUS (warn), naming the ref', async () => {
    const result = await corpusGoldenGate(
      guardEngine({ guarded: [johnVerse(16)] }, []),
      [guarded()],
    );

    expect(result.status).toBe('warn');
    const vacuous = (result.findings ?? []).filter(
      (finding) => finding.categoryCode === GUARD_VACUOUS,
    );
    expect(vacuous).toHaveLength(1);
    expect(vacuous[0]?.message).toContain('John 3:18');
    expect(vacuous[0]?.message).toContain('VACUOUS');
    expect(result.metrics?.['vacuousGuards']).toBe(1);
    expect(decideVerdict({ gates: [result] })).toBe('ADMIT_WITH_WARNINGS');
  });

  it('reports a corpus-absent mustNotRank guard as VACUOUS too', async () => {
    const result = await corpusGoldenGate(guardEngine({ q: [johnVerse(16)] }, []), [
      fixture({ query: 'q', mustNotRank: [{ ref: 'John 3:18', why: 'off-topic' }] }),
    ]);

    expect(result.status).toBe('warn');
    expect(codes(result)).toEqual([GUARD_VACUOUS]);
  });

  it('stays silent about vacuity when the guard reference is in the corpus and holds', async () => {
    const result = await corpusGoldenGate(
      guardEngine({ guarded: [johnVerse(16)] }, ['John 3:18']),
      [guarded()],
    );

    expect(result.status).toBe('pass');
    expect(result.metrics?.['vacuousGuards']).toBe(0);
  });

  it('never reports a violated guard as vacuous, even when passage() denies the ref', async () => {
    // A ref observed in the results is definitionally in the corpus; the
    // violation wins and the vacuity probe must not contradict it.
    const result = await corpusGoldenGate(
      guardEngine({ guarded: [johnVerse(18)] }, []),
      [guarded()],
    );

    expect(result.status).toBe('fail');
    expect(codes(result)).toEqual(['G3_MUST_NOT_LEAD']);
  });

  it('keeps a pending fixture with only a vacuous guard out of promotion, visibly', async () => {
    const pendingVacuous = guarded({ id: 'pend-vacuous', status: 'pending' });
    const result = await corpusGoldenGate(
      guardEngine({ guarded: [johnVerse(16)] }, []),
      [pendingVacuous],
    );

    expect(result.status).toBe('warn');
    expect(result.promotionCandidates).toEqual([]);
    expect(result.summary).not.toContain('still failing');
    const vacuous = (result.findings ?? []).filter(
      (finding) => finding.categoryCode === GUARD_VACUOUS,
    );
    expect(vacuous).toHaveLength(1);
    expect(vacuous[0]?.subjects).toContain('pend-vacuous');
  });

  it('rejects mustNotLead beside referenceExpectations', async () => {
    const result = await corpusGoldenGate(guardEngine({}, []), [
      {
        id: 'ref-mixed',
        status: 'active',
        referenceExpectations: [
          { query: 'john 3 16', expectedKind: 'reference', expectedPassage: 'John 3:16' },
        ],
        mustNotLead: [{ ref: 'John 3:18', why: 'w' }],
      } as unknown as CorpusFixture,
    ]);

    expect(
      result.findings?.some(
        (finding) => finding.message.includes('never both') && finding.message.includes('mustNotLead'),
      ),
    ).toBe(true);
  });
});

describe('G3 requiredGroupingSourceId (P5.6 PR 1 capability — fail-closed until PR 2)', () => {
  const grouped = (
    verse: number,
    sourceId: string,
  ): DiscoveryResult =>
    ({
      ...johnVerse(verse),
      // The PR 2 typed shape (ResultGrouping): section span + provenance.
      grouping: {
        section: {
          reference: `John 3:${verse}`,
          startVerseId: 43_003_000 + verse,
          endVerseId: 43_003_000 + verse,
        },
        provenance: { sourceId, label: sourceId },
      },
    }) as DiscoveryResult;

  it('FAILS an active fixture whose hit carries no grouping — the field can never pass vacuously', async () => {
    const problems = await runCorpusFixture(
      mockEngine({ q: [johnVerse(16)] }),
      fixture({
        query: 'q',
        expectedTop: [
          { ref: 'John 3:16', withinTop: 1, requiredGroupingSourceId: 'openbible-sections' },
        ],
      }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]!).toContain('not a grouped result');
    expect(problems[0]!).toContain("'openbible-sections'");
  });

  it('passes when the hit is grouped citing exactly the named source (the PR 2 shape, structurally)', async () => {
    const problems = await runCorpusFixture(
      mockEngine({ q: [grouped(16, 'openbible-sections')] }),
      fixture({
        query: 'q',
        expectedTop: [
          { ref: 'John 3:16', withinTop: 1, requiredGroupingSourceId: 'openbible-sections' },
        ],
      }),
    );
    expect(problems).toEqual([]);
  });

  it('fails on grouping citing the WRONG source — authority order has teeth', async () => {
    const problems = await runCorpusFixture(
      mockEngine({ q: [grouped(16, 'openbible-sections')] }),
      fixture({
        query: 'q',
        expectedTop: [
          { ref: 'John 3:16', withinTop: 1, requiredGroupingSourceId: 'editorial' },
        ],
      }),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]!).toContain('not a grouped result');
  });

  it('rejects an empty requiredGroupingSourceId at the schema, like the other required* fields', async () => {
    const result = await corpusGoldenGate(mockEngine({ q: [] }), [
      fixture({
        query: 'q',
        expectedTop: [{ ref: 'John 3:16', requiredGroupingSourceId: '   ' }],
      }),
    ]);
    expect(codes(result)).toContain('G3_FIXTURE_MALFORMED');
  });
});

describe('G3 presenceOnly (ruling supplement §3 — fail-closed presence-with-provenance)', () => {
  /** Psalm 136:1 as a grouped row citing the given source, placed at any rank. */
  function groupedPsalm(sourceId: string): DiscoveryResult {
    return {
      targetId: 'WEB:19136001',
      reference: 'Psalms 136:1-26',
      excerpt: 'Psalms 136:1-26',
      score: 60,
      reasons: [{ family: 'exact_phrase', label: 'Exact phrase', points: 60 }],
      grouping: {
        section: { reference: 'Psalms 136:1-26', startVerseId: 19_136_001, endVerseId: 19_136_026 },
        provenance: { sourceId, label: sourceId },
      },
    } as DiscoveryResult;
  }

  /** `count` filler rows that overlap none of the asserted references. */
  function filler(count: number): DiscoveryResult[] {
    return Array.from({ length: count }, (_, index) => johnVerse(index + 1));
  }

  const presenceFixture = (overrides: Record<string, unknown> = {}) =>
    fixture({
      query: 'q',
      expectedTop: [
        { ref: 'Psalms 136:1-26', presenceOnly: true, requiredGroupingSourceId: 'openbible-sections' },
      ],
      ...overrides,
    });

  it('REJECTS presenceOnly combined with withinTop — mutually exclusive by construction', async () => {
    const result = await corpusGoldenGate(mockEngine({ q: [] }), [
      presenceFixture({
        expectedTop: [
          {
            ref: 'Psalms 136:1-26',
            presenceOnly: true,
            withinTop: 10,
            requiredGroupingSourceId: 'openbible-sections',
          },
        ],
      }),
    ]);
    expect(codes(result)).toContain('G3_FIXTURE_MALFORMED');
    expect(
      result.findings?.some((finding) => finding.message.includes('cannot combine presenceOnly with withinTop')),
    ).toBe(true);
  });

  it('REJECTS presenceOnly without requiredGroupingSourceId or a required reason — no vacuous decoration', async () => {
    const result = await corpusGoldenGate(mockEngine({ q: [] }), [
      presenceFixture({
        expectedTop: [{ ref: 'Psalms 136:1-26', presenceOnly: true }],
      }),
    ]);
    expect(codes(result)).toContain('G3_FIXTURE_MALFORMED');
    expect(
      result.findings?.some((finding) => finding.message.includes('requires requiredGroupingSourceId or a required reason')),
    ).toBe(true);
  });

  it('REJECTS presenceOnly: false — a field that asserts nothing', async () => {
    const result = await corpusGoldenGate(mockEngine({ q: [] }), [
      presenceFixture({
        expectedTop: [
          { ref: 'Psalms 136:1-26', presenceOnly: false, requiredGroupingSourceId: 'openbible-sections' },
        ],
      }),
    ]);
    expect(codes(result)).toContain('G3_FIXTURE_MALFORMED');
    expect(result.findings?.some((finding) => finding.message.includes('must be literally true'))).toBe(true);
  });

  it('passes on a grouped row citing the named source anywhere in the limit-50 results — no rank asserted', async () => {
    const presenceEngine = mockEngine({ q: [...filler(12), groupedPsalm('openbible-sections'), ...filler(30)] });
    const result = await corpusGoldenGate(
      // The default (limit-10) engine never surfaces the row; presence is
      // measured against the dedicated limit-50 instance alone.
      mockEngine({ q: filler(10) }),
      [presenceFixture()],
      { presenceEngine },
    );
    expect(result.status).toBe('pass');
    expect(result.findings ?? []).toEqual([]);
  });

  it('fails when the reference is absent from the limit-50 results', async () => {
    const result = await corpusGoldenGate(
      mockEngine({ q: filler(10) }),
      [presenceFixture()],
      { presenceEngine: mockEngine({ q: filler(50) }) },
    );
    expect(result.status).toBe('fail');
    expect(codes(result)).toEqual(['G3_EXPECTED_PRESENCE_ABSENT']);
    expect(result.findings?.[0]?.message).toContain('top 50');
  });

  it('fails when the row is present but cites the wrong grouping source — provenance is the contract', async () => {
    const result = await corpusGoldenGate(
      mockEngine({ q: filler(10) }),
      [presenceFixture()],
      { presenceEngine: mockEngine({ q: [...filler(12), groupedPsalm('editorial')] }) },
    );
    expect(result.status).toBe('fail');
    expect(codes(result)).toEqual(['G3_EXPECTED_TOP_GROUPING_SOURCE']);
  });

  it('FAILS CLOSED when the runner provides no limit-50 instance — unmeasured is never a pass', async () => {
    const result = await corpusGoldenGate(
      mockEngine({ q: [...filler(12), groupedPsalm('openbible-sections')] }),
      [presenceFixture()],
    );
    expect(result.status).toBe('fail');
    expect(codes(result)).toEqual(['G3_PRESENCE_NOT_MEASURED']);
  });

  it('accepts a required reason family as the provenance pin and enforces it over the presence hits', async () => {
    const family = presenceFixture({
      expectedTop: [{ ref: 'Psalms 136:1-26', presenceOnly: true, requiredReasonFamily: 'exact_phrase' }],
    });
    const good = await corpusGoldenGate(
      mockEngine({ q: filler(10) }),
      [family],
      { presenceEngine: mockEngine({ q: [...filler(40), groupedPsalm('openbible-sections')] }) },
    );
    const wrongEvidence = await corpusGoldenGate(
      mockEngine({ q: filler(10) }),
      [family],
      {
        presenceEngine: mockEngine({
          q: [
            ...filler(40),
            {
              ...groupedPsalm('openbible-sections'),
              reasons: [{ family: 'token_overlap', label: 'Shared word: kindness', points: 5 }],
            } as DiscoveryResult,
          ],
        }),
      },
    );
    expect(good.status).toBe('pass');
    expect(wrongEvidence.status).toBe('fail');
    expect(codes(wrongEvidence)).toEqual(['G3_EXPECTED_TOP_REASON_FAMILY']);
  });

  it('never widens the guard window: a presenceOnly entry leaves mustNotRank at the fixture default', async () => {
    // The guarded ref sits at rank 2; the fixture's only rank window is
    // expectedWithinTop 1, so the guard must NOT fire — a presenceOnly
    // entry asserts no rank and must not widen what the guards measure.
    const result = await corpusGoldenGate(
      mockEngine({ q: [johnVerse(1), johnVerse(18)] }),
      [
        presenceFixture({
          expectedWithinTop: 1,
          mustNotRank: [{ ref: 'John 3:18', why: 'accidental trigger' }],
        }),
      ],
      { presenceEngine: mockEngine({ q: [...filler(12), groupedPsalm('openbible-sections')] }) },
    );
    // mockEngine's passage() knows no refs, so the guard also reports
    // vacuity (warn) — the assertion here is only that it never FIRES.
    expect(result.status).not.toBe('fail');
    expect(codes(result)).not.toContain('G3_MUST_NOT_RANK');
  });
});
