import { describe, expect, it } from 'vitest';

import { DiagnosticValidationError, routeDiagnostics, type DiagnosticCase } from '../src/diagnosticRouter.js';

const base = (caseId: string, overrides: Partial<DiagnosticCase> = {}): DiagnosticCase => ({
  caseId,
  fixtureId: 'hope-in-god',
  query: 'where is my hope',
  judgment: 'missing',
  matchedConceptIds: [],
  targetAnchoredConceptIds: [],
  neighboringConceptIds: [],
  triggeredPhrases: [],
  reasonFamilies: ['concept_anchor'],
  evidence: [{ kind: 'result-window', detail: 'Romans 8:24-25 was absent from the reviewed top 10.', subjectIds: ['Romans 8:24-25'] }],
  ...overrides,
});

const A = '00000000-0000-4000-8000-000000000001';
const B = '00000000-0000-4000-8000-000000000002';
const C = '00000000-0000-4000-8000-000000000003';
const D = '00000000-0000-4000-8000-000000000004';
const E = '00000000-0000-4000-8000-000000000005';
const F = '00000000-0000-4000-8000-000000000006';

describe('diagnostic router', () => {
  it('routes missing evidence through anchor, lexicon, neighbor, and draft inspection in order', () => {
    const routes = routeDiagnostics([
      base(D),
      base(C, { neighboringConceptIds: ['refuge-in-trouble'] }),
      base(B, { targetAnchoredConceptIds: ['hope-in-god'] }),
      base(A, { matchedConceptIds: ['hope-in-god'] }),
    ]);
    expect(routes.map((route) => route.kind === 'ontology-suggestion' ? route.operationFamilies : [])).toEqual([
      ['editorial-anchor-add', 'editorial-anchor-adjust'],
      ['lexicon-phrase-add'],
      ['lexicon-phrase-add', 'editorial-anchor-add', 'concept-draft-create'],
      ['concept-draft-create'],
    ]);
  });

  it('routes irrelevant ontology evidence to anchor or lexicon inspection', () => {
    const routes = routeDiagnostics([
      base(A, { judgment: 'irrelevant', diagnosis: 'wrong-anchor', matchedConceptIds: ['hope-in-god'] }),
      base(B, { judgment: 'irrelevant', diagnosis: 'concept-misfire', matchedConceptIds: ['hope-in-god'], triggeredPhrases: [{ conceptId: 'hope-in-god', phrase: 'hope' }] }),
    ]);
    expect(routes.map((route) => route.kind === 'ontology-suggestion' ? route.operationFamilies : [])).toEqual([
      ['editorial-anchor-remove', 'editorial-anchor-adjust'],
      ['lexicon-phrase-remove'],
    ]);
  });

  it('turns lexical noise and every explicit engine area into grouped engineering briefs with fixtures', () => {
    const routes = routeDiagnostics([
      base(F, { engineArea: 'budget' }),
      base(E, { judgment: 'irrelevant', diagnosis: 'lexical-noise', reasonFamilies: ['token_overlap'] }),
      base(D, { judgment: 'irrelevant', diagnosis: 'lexical-noise', reasonFamilies: ['exact_phrase'], normalizationOwner: { path: 'engine/src/tokenizer/index.ts', entry: 'normalizes possessives' } }),
    ]);
    expect(routes.every((route) => route.kind === 'engineering-brief')).toBe(true);
    expect(routes.map((route) => route.kind === 'engineering-brief' ? route.area : '')).toEqual(['budget', 'normalization', 'tokenizer']);
    expect(routes.flatMap((route) => route.kind === 'engineering-brief' ? route.reproducingFixtures : [])).toHaveLength(3);
    expect(JSON.stringify(routes)).not.toContain('lexicon-phrase-add');
  });

  it('always exposes evidence plus explicit confidence and ambiguity language', () => {
    const routes = routeDiagnostics([
      base(A, { matchedConceptIds: ['hope-in-god'] }),
      base(B, { engineArea: 'ranking' }),
    ]);
    for (const route of routes) {
      expect(route.evidence.length).toBeGreaterThan(0);
      expect(route.confidence).not.toBe('high');
      expect(route.confidenceLanguage).toMatch(/not|does not/i);
      expect(route.ambiguityLanguage).toMatch(/ambiguity|interact/i);
    }
  });

  it('is deterministic under case, concept, family, and evidence permutations', () => {
    const first = routeDiagnostics([
      base(B, { engineArea: 'ranking', reasonFamilies: ['proximity', 'token_overlap'], evidence: [
        { kind: 'z', detail: 'second', subjectIds: ['b', 'a'] },
        { kind: 'a', detail: 'first', subjectIds: [] },
      ] }),
      base(A, { neighboringConceptIds: ['refuge-in-trouble', 'hope-in-god'] }),
    ]);
    const second = routeDiagnostics([
      base(A, { neighboringConceptIds: ['hope-in-god', 'refuge-in-trouble'] }),
      base(B, { engineArea: 'ranking', reasonFamilies: ['token_overlap', 'proximity'], evidence: [
        { kind: 'a', detail: 'first', subjectIds: [] },
        { kind: 'z', detail: 'second', subjectIds: ['a', 'b'] },
      ] }),
    ]);
    expect(second).toEqual(first);
  });

  it('fails malformed and duplicate cases instead of guessing', () => {
    expect(() => routeDiagnostics([base('not-a-uuid')])).toThrow(DiagnosticValidationError);
    expect(() => routeDiagnostics([base(C), base(C)])).toThrow(/duplicate caseId/);
    expect(() => routeDiagnostics([base(C, { judgment: 'irrelevant' })])).toThrow(/require a diagnosis/);
    expect(() => routeDiagnostics([base(C, { evidence: [] })])).toThrow(/non-empty array/);
    expect(() => routeDiagnostics([{ ...base(C), surprise: true } as DiagnosticCase])).toThrow(/unknown field/);
    const missing = { ...base(C) } as unknown as Record<string, unknown>;
    delete missing['matchedConceptIds'];
    expect(() => routeDiagnostics([missing as unknown as DiagnosticCase])).toThrow(/missing required field/);
    expect(() => routeDiagnostics([base(C, { judgment: 'irrelevant', diagnosis: 'invented' as never })])).toThrow(DiagnosticValidationError);
    expect(() => routeDiagnostics([base(C, { query: 7 as never })])).toThrow(DiagnosticValidationError);
    expect(() => routeDiagnostics([base(C, { triggeredPhrases: [{ conceptId: 123 as never, phrase: 'hope' }] })])).toThrow(DiagnosticValidationError);
    expect(() => routeDiagnostics([base(C, { evidence: [{ kind: 'result-window', subjectIds: [] } as never] })])).toThrow(DiagnosticValidationError);
  });
});
