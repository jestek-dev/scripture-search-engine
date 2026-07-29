import { describe, expect, it } from 'vitest';

import { collisionGate, type ConceptRecord } from '../src/gates/collision.js';
import { determinismGate, goldenGate, type GoldenFixture } from '../src/gates/golden.js';
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

  it('flags an addition that changed nothing measurable', () => {
    expect(
      decideVerdict({
        gates: [pass('G2-determinism', 'D', 'ok')],
        changedOutcomes: false,
      }),
    ).toBe('NO_MEASURABLE_EFFECT');
  });

  it('lists not-applicable gates so an unrun check is never mistaken for a pass', () => {
    const report = buildReport({
      gates: [notApplicable('G8-noise-probes', 'Noise probes', 'no artifact yet')],
    });
    expect(report.markdown).toContain('Not yet running');
    expect(report.markdown).toContain('G8-noise-probes');
  });
});
