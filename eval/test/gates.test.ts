import { describe, expect, it } from 'vitest';

import {
  collisionGate,
  singleTokenCollapses,
  type ConceptRecord,
} from '../src/gates/collision.js';
import {
  conceptCoverageGate,
  corpusGoldenGate,
  runCorpusFixture,
  type CorpusFixture,
} from '../src/gates/corpusGolden.js';
import { determinismGate, goldenGate, type GoldenFixture } from '../src/gates/golden.js';
import { latencyGate } from '../src/gates/probes.js';
import { buildReport, decideVerdict } from '../src/report.js';
import { fail, pass, notApplicable } from '../src/gates/types.js';

const THRESHOLDS = {
  maxSharedPhraseRatio: 0.34,
  maxSharedTokenRatio: 0.6,
  minLexiconEntries: 2,
};

function concept(id: string, lexicon: string[]): ConceptRecord {
  return { id, label: id, lexicon };
}

describe('G4 concept collision', () => {
  it('catches the near-duplicate concept that would dilute anchors', () => {
    const result = collisionGate(
      [
        concept('obedience-to-the-word', [
          'hearing and doing',
          'doers of the word',
          'obey the word',
        ]),
        concept('hearing-and-doing', [
          'hearing and doing',
          'doers of the word',
          'practice what you hear',
        ]),
      ],
      THRESHOLDS,
    );
    expect(result.status).toBe('fail');
    expect(result.findings?.[0]?.message).toContain('MERGING');
  });

  it('tells you how to resolve, not just that something is wrong', () => {
    const result = collisionGate(
      [
        concept('a', ['hearing and doing', 'doers of the word']),
        concept('b', ['hearing and doing', 'doers of the word']),
      ],
      THRESHOLDS,
    );
    const message = result.findings?.[0]?.message ?? '';
    expect(message).toContain('hearing and doing');
    expect(message).toMatch(/MERGING|distinct phrasing/);
  });

  it('passes genuinely distinct concepts', () => {
    const result = collisionGate(
      [
        concept('obedience-to-the-word', ['hearing and doing', 'doers of the word']),
        concept('refuge-in-trouble', ['God is our refuge', 'shelter in the storm']),
      ],
      THRESHOLDS,
    );
    expect(result.status).toBe('pass');
  });

  it('rejects a lexicon too thin to be reachable', () => {
    const result = collisionGate([concept('thin', ['only phrase'])], THRESHOLDS);
    expect(result.status).toBe('fail');
    expect(result.findings?.[0]?.message).toContain('minimum is 2');
  });
});

describe('G3 golden regression', () => {
  const fixture = (cases: GoldenFixture['cases']): GoldenFixture => ({
    id: 'test',
    status: 'active',
    cases,
  });

  it('fails a result that ranks correctly but for the wrong reason', () => {
    const result = goldenGate([
      fixture([
        {
          id: 'wrong-reason',
          rule: 'explanations are part of the contract',
          candidates: [
            {
              targetId: 'a',
              groupId: 'g',
              evidence: [{ family: 'token_overlap', label: 'Shared words', strength: 1 }],
            },
          ],
          expectedOrder: ['a'],
          requiredReasons: { a: 'exact_phrase' },
        },
      ]),
    ]);
    expect(result.status).toBe('fail');
    expect(result.findings?.[0]?.message).toContain('ranked correctly but carries no');
  });

  it('does not fail the build on pending fixtures', () => {
    const result = goldenGate([
      { id: 'hearing-and-doing', status: 'pending', pendingUntilPhase: 2 },
    ]);
    expect(result.status).toBe('pass');
    expect(result.summary).toContain('pending');
  });
});

describe('G2 determinism', () => {
  it('replays identical output for identical input', () => {
    const result = determinismGate([
      {
        id: 'test',
        status: 'active',
        cases: [
          {
            id: 'stable',
            rule: 'stable',
            candidates: [
              {
                targetId: 'b',
                groupId: 'g',
                evidence: [{ family: 'token_overlap', label: 'x', strength: 0.5 }],
              },
              {
                targetId: 'a',
                groupId: 'g',
                evidence: [{ family: 'token_overlap', label: 'x', strength: 0.5 }],
              },
            ],
            expectedOrder: ['a', 'b'],
          },
        ],
      },
    ]);
    expect(result.status).toBe('pass');
  });
});

describe('Admission Report', () => {
  it('rejects when any gate fails', () => {
    expect(
      decideVerdict({
        gates: [pass('G2-determinism', 'D', 'ok'), fail('G4-collision', 'C', 'bad', [])],
      }),
    ).toBe('REJECT');
  });

  it('does not infer product impact that the gauntlet does not measure', () => {
    expect(
      decideVerdict({
        gates: [pass('G2-determinism', 'D', 'ok')],
      }),
    ).toBe('ADMIT');
  });

  it('lists not-applicable gates so an unrun check is never mistaken for a pass', () => {
    const report = buildReport({
      gates: [notApplicable('G8-noise-probes', 'Noise probes', 'no artifact yet')],
    });
    expect(report.markdown).toContain('Unavailable gates');
    expect(report.markdown).toContain('G8-noise-probes');
  });
});

describe('G3 concept fixture coverage', () => {
  const coveredConcept = (id: string, label = id) => ({ id, label });
  const fixture = (
    id: string,
    overrides: Partial<CorpusFixture> = {},
  ): CorpusFixture => ({
    id,
    status: 'active',
    query: `query for ${id}`,
    expectedTop: [{
      reference: 'John 3:16',
      requiredReasonFamily: 'concept_anchor',
      requiredReasonLabel: `Theme: ${id}`,
    }],
    ...overrides,
  });

  it('fails when a concept has no fixture at all', () => {
    const result = conceptCoverageGate([coveredConcept('worship'), coveredConcept('praise')], [fixture('worship')]);
    expect(result.status).toBe('fail');
    expect(result.findings?.[0]?.subjects).toEqual(['praise']);
  });

  it('names every uncovered concept at once rather than the first', () => {
    const result = conceptCoverageGate([coveredConcept('a'), coveredConcept('b'), coveredConcept('c')], [fixture('b')]);
    expect(result.status).toBe('fail');
    expect(result.findings?.map((finding) => finding.subjects?.[0])).toEqual(['a', 'c']);
  });

  it('accepts coverage declared through coversConcepts under a different name', () => {
    const result = conceptCoverageGate(
      [coveredConcept('obedience-to-the-word', 'Hearing and doing')],
      [fixture('hearing-and-doing', {
        coversConcepts: ['obedience-to-the-word'],
        expectedTop: [{
          reference: 'James 1:22',
          requiredReasonFamily: 'concept_anchor',
          requiredReasonLabel: 'Theme: Hearing and doing',
        }],
      })],
    );
    expect(result.status).toBe('pass');
  });

  it('does not count a PENDING fixture as coverage', () => {
    // A pending fixture cannot fail, so treating it as coverage would let a
    // concept ship measured by a test that never grades it.
    const result = conceptCoverageGate([coveredConcept('worship')], [fixture('worship', { status: 'pending' })]);
    expect(result.status).toBe('fail');
  });

  it('does not count a fixture with no query as coverage', () => {
    const result = conceptCoverageGate([coveredConcept('worship')], [fixture('worship', { query: undefined })]);
    expect(result.status).toBe('fail');
  });

  it('reports a fixture claiming a concept that no longer exists', () => {
    const result = conceptCoverageGate(
      [coveredConcept('worship')],
      [fixture('worship'), fixture('old', { coversConcepts: ['renamed-away'] })],
    );
    expect(result.status).toBe('fail');
    expect(result.findings?.[0]?.message).toContain('no concept "renamed-away" exists');
  });

  it('ignores unrelated fixture ids unless coversConcepts explicitly claims them', () => {
    const result = conceptCoverageGate(
      [coveredConcept('worship')],
      [fixture('worship'), fixture('ranking-invariants')],
    );
    expect(result.status).toBe('pass');
  });

  it('is not-applicable rather than passing when no concepts exist', () => {
    // An unrun check must never look like a passing one.
    expect(conceptCoverageGate([], []).status).toBe('not-applicable');
  });

  it('rejects a declaration without the exact covered concept anchor label', () => {
    const result = conceptCoverageGate(
      [coveredConcept('grace-not-earned', 'Grace, not earned')],
      [fixture('grace-not-earned', {
        expectedTop: [{
          reference: 'Ephesians 2:8',
          requiredReasonFamily: 'concept_anchor',
          requiredReasonLabel: 'Theme: Salvation',
        }],
      })],
    );
    expect(result.status).toBe('fail');
    expect(result.findings?.[0]?.message).toContain('exact label');
  });
});

describe('G3 fixtures must measure their OWN concept', () => {
  /** Minimal engine stub: one result carrying a neighbour concept's anchor. */
  const engineWith = (label: string) =>
    ({
      research: async () => ({
        kind: 'discovery' as const,
        results: [
          {
            targetId: 'WEB:49002008',
            reference: 'Ephesians 2:8',
            reasons: [{ family: 'concept_anchor', label, points: 22 }],
          },
        ],
      }),
    }) as never;

  const fixture = {
    id: 'grace-not-earned',
    status: 'active' as const,
    query: 'saved by grace not by works',
    expectedTop: [
      {
        reference: 'Ephesians 2:8',
        requiredReasonFamily: 'concept_anchor',
        requiredReasonLabel: 'Theme: Grace, not earned',
      },
    ],
  };

  it('passes when the covered concept supplies the anchor', async () => {
    const problems = await runCorpusFixture(engineWith('Theme: Grace, not earned'), fixture);
    expect(problems).toEqual([]);
  });

  it('FAILS when a neighbouring concept supplies the anchor instead', async () => {
    // The real hole this closed: `salvation` also anchors Ephesians 2:8, so
    // requiredReasonFamily alone kept passing with grace-not-earned deleted.
    const problems = await runCorpusFixture(engineWith('Theme: Salvation'), fixture);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('measuring a different concept');
  });
});

describe('G3 reference-intent fixtures', () => {
  /**
   * Minimal engine stub keyed by query. Reference-intent fixtures assert the
   * research() outcome KIND, so the stub returns whole outcomes, not result
   * lists.
   */
  const engineAnswering = (byQuery: Record<string, unknown>) =>
    ({
      research: async (query: string) =>
        byQuery[query] ?? { kind: 'discovery', query, results: [] },
    }) as never;

  const psalmEngine = engineAnswering({
    'psalm 23': { kind: 'reference', passage: { reference: 'Psalms 23' } },
    'john 3 16': { kind: 'reference', passage: { reference: 'John 3:16' } },
    'xyzzy 9': { kind: 'invalid-reference', query: 'xyzzy 9' },
  });

  const referenceFixture = (
    entries: readonly Record<string, unknown>[],
    overrides: Record<string, unknown> = {},
  ): CorpusFixture =>
    ({
      id: 'ref-test',
      status: 'active',
      referenceExpectations: entries,
      ...overrides,
    }) as unknown as CorpusFixture;

  it('passes a reference entry whose exact passage label matches', async () => {
    const problems = await runCorpusFixture(
      psalmEngine,
      referenceFixture([
        { query: 'psalm 23', expectedKind: 'reference', expectedPassage: 'Psalms 23' },
      ]),
    );
    expect(problems).toEqual([]);
  });

  it('fails a reference entry whose query falls through to discovery', async () => {
    const problems = await runCorpusFixture(
      psalmEngine,
      referenceFixture([
        { query: 'unmapped words', expectedKind: 'reference', expectedPassage: 'Psalms 23' },
      ]),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('expected "unmapped words" to resolve as reference');
    expect(problems[0]).toContain('discovery');
  });

  it('fails on a passage-label mismatch even when the kind is right', async () => {
    const problems = await runCorpusFixture(
      psalmEngine,
      referenceFixture([
        { query: 'psalm 23', expectedKind: 'reference', expectedPassage: 'Psalm 23' },
      ]),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('"Psalms 23"');
    expect(problems[0]).toContain('"Psalm 23"');
  });

  it('rejects a reference entry missing expectedPassage as malformed', async () => {
    // A kind-only "reference" assertion is a hollow guard; the schema refuses it.
    const problems = await runCorpusFixture(
      psalmEngine,
      referenceFixture([{ query: 'psalm 23', expectedKind: 'reference' }]),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('expectedPassage is required');
  });

  it('asserts each entry independently, so one fixture can pin different passages', async () => {
    const problems = await runCorpusFixture(
      psalmEngine,
      referenceFixture([
        { query: 'psalm 23', expectedKind: 'reference', expectedPassage: 'Psalms 23' },
        { query: 'john 3 16', expectedKind: 'reference', expectedPassage: 'John 3:17' },
      ]),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('john 3 16');
  });

  it('passes and fails invalid-reference kind assertions', async () => {
    const good = await runCorpusFixture(
      psalmEngine,
      referenceFixture([{ query: 'xyzzy 9', expectedKind: 'invalid-reference' }]),
    );
    const bad = await runCorpusFixture(
      psalmEngine,
      referenceFixture([{ query: 'psalm 23', expectedKind: 'invalid-reference' }]),
    );
    expect(good).toEqual([]);
    expect(bad).toHaveLength(1);
    expect(bad[0]).toContain('expected "psalm 23" to resolve as invalid-reference');
  });

  it('passes and fails discovery guard assertions', async () => {
    const good = await runCorpusFixture(
      psalmEngine,
      referenceFixture([{ query: 'plans for hope', expectedKind: 'discovery' }]),
    );
    const bad = await runCorpusFixture(
      psalmEngine,
      referenceFixture([{ query: 'john 3 16', expectedKind: 'discovery' }]),
    );
    expect(good).toEqual([]);
    expect(bad).toHaveLength(1);
  });

  it('fails an expectedSuggestion assertion until the engine grows the field', async () => {
    // The suggestion field does not exist yet; the assertion must FAIL
    // against its absence, never pass vacuously, so a pending fixture keeps
    // specifying the unlanded work honestly.
    const problems = await runCorpusFixture(
      psalmEngine,
      referenceFixture([
        { query: 'xyzzy 9', expectedKind: 'invalid-reference', expectedSuggestion: 'Psalms' },
      ]),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('no suggestion');
  });

  it('passes an expectedSuggestion assertion once the engine cites the book', async () => {
    const suggesting = engineAnswering({
      phillipians: {
        kind: 'invalid-reference',
        query: 'phillipians',
        suggestion: { book: 'Philippians', reference: 'Philippians' },
      },
    });
    const problems = await runCorpusFixture(
      suggesting,
      referenceFixture([
        { query: 'phillipians', expectedKind: 'invalid-reference', expectedSuggestion: 'Philippians' },
      ]),
    );
    expect(problems).toEqual([]);
  });

  it('rejects expectedPassage and expectedSuggestion outside their kinds', async () => {
    const wrongPassage = await runCorpusFixture(
      psalmEngine,
      referenceFixture([
        { query: 'xyzzy 9', expectedKind: 'invalid-reference', expectedPassage: 'Psalms 23' },
      ]),
    );
    const wrongSuggestion = await runCorpusFixture(
      psalmEngine,
      referenceFixture([
        { query: 'plans for hope', expectedKind: 'discovery', expectedSuggestion: 'Psalms' },
      ]),
    );
    expect(wrongPassage).toHaveLength(1);
    expect(wrongPassage[0]).toContain('only valid with expectedKind "reference"');
    expect(wrongSuggestion).toHaveLength(1);
    expect(wrongSuggestion[0]).toContain('only valid with expectedKind "invalid-reference"');
  });

  it('rejects mixing referenceExpectations with any discovery field', async () => {
    for (const mixed of [
      { query: 'psalm 23' },
      { expectedTop: [{ ref: 'John 3:16' }] },
      { expectedWithinTop: 3 },
      { preferredOrder: [{ above: 'John 3:16', below: 'John 3:17' }] },
      { mustNotRank: [{ ref: 'John 3:16' }] },
      { additionalQueries: ['also'] },
      { coversConcepts: ['worship'] },
    ]) {
      const problems = await runCorpusFixture(
        psalmEngine,
        referenceFixture(
          [{ query: 'psalm 23', expectedKind: 'reference', expectedPassage: 'Psalms 23' }],
          mixed,
        ),
      );
      expect(problems.some((message) => message.includes('never both'))).toBe(true);
    }
  });

  it('rejects malformed entries: bad kind, empty list, unknown field, duplicate query', async () => {
    const badKind = await runCorpusFixture(
      psalmEngine,
      referenceFixture([{ query: 'psalm 23', expectedKind: 'passage' }]),
    );
    const empty = await runCorpusFixture(psalmEngine, referenceFixture([]));
    const unknownField = await runCorpusFixture(
      psalmEngine,
      referenceFixture([
        {
          query: 'psalm 23',
          expectedKind: 'reference',
          expectedPassage: 'Psalms 23',
          within: 1,
        },
      ]),
    );
    const duplicate = await runCorpusFixture(
      psalmEngine,
      referenceFixture([
        { query: 'psalm 23', expectedKind: 'reference', expectedPassage: 'Psalms 23' },
        { query: 'psalm 23', expectedKind: 'reference', expectedPassage: 'Psalms 23' },
      ]),
    );
    expect(badKind[0]).toContain('expectedKind must be');
    expect(empty[0]).toContain('at least one entry');
    expect(unknownField[0]).toContain('unknown field "within"');
    expect(duplicate[0]).toContain('duplicates');
  });

  it('runs active reference fixtures through the gate and fails on a miss', async () => {
    const result = await corpusGoldenGate(psalmEngine, [
      referenceFixture([
        { query: 'psalm 23', expectedKind: 'reference', expectedPassage: 'Psalms 24' },
      ]),
    ]);
    expect(result.status).toBe('fail');
    expect(result.findings?.[0]?.categoryCode).toBe('G3_REFERENCE_PASSAGE_LABEL');
    expect(result.metrics?.['activeCorpusFixtures']).toBe(1);
  });

  it('treats a failing pending reference fixture as a warn, not a silent skip', async () => {
    const result = await corpusGoldenGate(psalmEngine, [
      referenceFixture(
        [{ query: 'xyzzy 9', expectedKind: 'invalid-reference', expectedSuggestion: 'Psalms' }],
        { id: 'ref-pending', status: 'pending' },
      ),
    ]);
    expect(result.status).toBe('warn');
    expect(result.summary).toContain('1 of 1 still failing');
  });
});

describe('single-token collapse detection', () => {
  it('finds a multi-word phrase whose real width is one token', () => {
    // The exact case that hid for weeks: four words, three of them stopwords.
    const found = singleTokenCollapses([
      { id: 'presence-of-god', label: 'Presence', lexicon: ['god with us'] },
    ]);
    expect(found).toEqual([
      { conceptId: 'presence-of-god', phrase: 'god with us', token: 'god' },
    ]);
  });

  it('does not report a deliberate one-word entry', () => {
    // "communion" is one word AND one token — the curator can see its width.
    expect(
      singleTokenCollapses([{ id: 'lords-supper', label: 'Supper', lexicon: ['communion'] }]),
    ).toEqual([]);
  });

  it('does not report a phrase that keeps two or more tokens', () => {
    expect(
      singleTokenCollapses([{ id: 'worship', label: 'Worship', lexicon: ['worship the lord'] }]),
    ).toEqual([]);
  });

  it('is deterministic in ordering', () => {
    const input = [
      { id: 'b-concept', label: 'B', lexicon: ['be holy', 'a rock of refuge here'] },
      { id: 'a-concept', label: 'A', lexicon: ['fear not'] },
    ];
    expect(singleTokenCollapses(input).map((entry) => entry.conceptId)).toEqual([
      'a-concept',
      'b-concept',
    ]);
  });
});

describe('G11 latency', () => {
  it('reports not-applicable, never pass, when no probe was timed', () => {
    // The pass-without-running edge: an empty probe file used to earn a green
    // G11 row. A gate that is not running must look different from a gate
    // that is running and finding nothing.
    const result = latencyGate([], 150);
    expect(result.status).toBe('not-applicable');
    expect(result.applicability).toBe('required');
    expect(result.summary).toContain('no probes were timed');
  });

  it('REJECTs the run on an empty probe file, because G11 is required', () => {
    expect(decideVerdict({ gates: [latencyGate([], 150)] })).toBe('REJECT');
  });

  it('passes when the measured p95 is within budget', () => {
    expect(latencyGate([5, 6, 7], 150).status).toBe('pass');
  });

  it('fails when the measured p95 exceeds budget', () => {
    expect(latencyGate([500], 150).status).toBe('fail');
  });
});
