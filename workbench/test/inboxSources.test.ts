import { describe, expect, it } from 'vitest';

import { buildInboxSeeds } from '../src/inboxSources.js';
import type { CaseSnapshot } from '../src/cases.js';

const ARTIFACT = {
  engineVersion: '0.9.0',
  corpusFingerprint: 'corpus-current',
  layerFingerprint: 'layers-current',
};

const CASE: CaseSnapshot = {
  caseId: '11111111-1111-4111-8111-111111111111',
  query: 'abide',
  source: 'manual',
  artifact: ARTIFACT,
  state: 'reviewing',
  events: [{
    schemaVersion: 2,
    eventId: '22222222-2222-4222-8222-222222222222',
    caseId: '11111111-1111-4111-8111-111111111111',
    at: '2026-08-01T10:00:00.000Z',
    reviewer: 'jesse',
    sequence: 1,
    kind: 'case-created',
    query: 'abide',
    source: 'manual',
    artifact: ARTIFACT,
  }],
  sessionIds: [],
  proposalIds: [],
  candidateIds: [],
  admissionIds: [],
  pullRequestUrls: [],
};

describe('inbox source generation', () => {
  it('derives, deduplicates, and labels every currently available source', () => {
    const seeds = buildInboxSeeds({
      cases: [CASE],
      coverage: [
        { id: 'abiding-in-christ', status: 'uncovered' },
        { id: 'hope-in-despair', status: 'uncovered' },
      ],
      judgments: [{
        query: 'old search',
        at: '2026-07-01T00:00:00.000Z',
        engineVersion: '0.8.0',
        corpusFingerprint: 'old-corpus',
        layerFingerprint: 'old-layers',
      }],
      currentArtifact: ARTIFACT,
      gauntletReport: {
        payload: {
          gates: [{
            gate: 'G4-collision',
            status: 'fail',
            verdict: 'fail',
            findings: [{ message: 'The bare query "abide" fires too broadly.', subjects: ['abiding-in-christ'] }],
          }],
        },
      },
      candidateRegressions: [{ id: 'candidate-1', query: 'changed result', at: '2026-08-02T00:00:00.000Z', reason: 'Top result moved.' }],
      now: new Date('2026-08-03T00:00:00.000Z'),
    });

    expect(seeds.map((seed) => seed.query).sort()).toEqual([
      'abide',
      'abide',
      'abiding in christ',
      'changed result',
      'hope in despair',
      'old search',
    ]);
    expect(seeds.find((seed) => seed.query === 'abide')).toMatchObject({
      kind: 'case', reviewer: 'jesse', state: 'reviewing', case: { caseId: CASE.caseId },
    });
    expect(seeds.filter((seed) => seed.query === 'abide').map((seed) => seed.source).sort()).toEqual(['gauntlet', 'manual']);
    expect(seeds.find((seed) => seed.query === 'old search')).toMatchObject({
      source: 'stale-judgment', staleJudgment: true,
    });
    expect(seeds.find((seed) => seed.query === 'hope in despair')).toMatchObject({
      source: 'coverage', uncoveredConcept: true, sensitive: true,
    });
  });

  it('parses untrusted gauntlet input defensively and caps findings', () => {
    expect(buildInboxSeeds({ cases: [], coverage: [], judgments: [], currentArtifact: ARTIFACT, gauntletReport: { payload: { gates: 'bad' } } })).toEqual([]);
    const findings = Array.from({ length: 250 }, (_, index) => ({ query: `query ${index}`, message: `finding ${index}` }));
    const seeds = buildInboxSeeds({
      cases: [], coverage: [], judgments: [], currentArtifact: ARTIFACT,
      gauntletReport: { payload: { gates: [{ gate: 'G3', status: 'warn', findings }] } },
      now: new Date('2026-08-03T00:00:00.000Z'),
    });
    expect(seeds).toHaveLength(200);
    expect(seeds.every((seed) => seed.blockingGateFinding === false)).toBe(true);
  });

  it('is byte-order deterministic for equivalent input orderings', () => {
    const input = {
      cases: [CASE], coverage: [{ id: 'z-concept', status: 'uncovered' as const }], judgments: [],
      currentArtifact: ARTIFACT, now: new Date('2026-08-03T00:00:00.000Z'),
    };
    const forward = buildInboxSeeds(input);
    const reverse = buildInboxSeeds({ ...input, cases: [...input.cases].reverse(), coverage: [...input.coverage].reverse() });
    expect(JSON.stringify(reverse)).toBe(JSON.stringify(forward));
  });
});
