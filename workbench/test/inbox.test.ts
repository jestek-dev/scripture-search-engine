import { describe, expect, it } from 'vitest';

import {
  combineInboxFilters,
  compareInboxCases,
  explainInboxCase,
  filterByAge,
  filterByArtifactIdentity,
  filterByReviewer,
  filterBySensitivity,
  filterBySource,
  filterByState,
  rankInboxCases,
  scoreInboxCase,
  type InboxCaseSnapshot,
} from '../src/inbox.js';

const ARTIFACT_A = {
  engineVersion: '0.9.0',
  corpusFingerprint: 'corpus-a',
  layerFingerprint: 'layer-a',
} as const;

const ARTIFACT_B = {
  engineVersion: '0.9.0',
  corpusFingerprint: 'corpus-b',
  layerFingerprint: 'layer-b',
} as const;

const BASE: InboxCaseSnapshot = {
  caseId: '11111111-1111-4111-8111-111111111111',
  query: 'Base inbox case',
  source: 'manual',
  state: 'reviewing',
  reviewer: 'jesse',
  artifact: ARTIFACT_A,
  sensitivity: 'standard',
  ageDays: 2,
  resultCount: 3,
  blockingGateFinding: false,
  judgmentFreshness: 'fresh',
  conceptCoverage: 'covered',
};

function caseWith(overrides: Partial<InboxCaseSnapshot> & Pick<InboxCaseSnapshot, 'caseId'>): InboxCaseSnapshot {
  return { ...BASE, ...overrides };
}

describe('inbox scoring', () => {
  it('ranks the priority ladder before age and never uses popularity', () => {
    const ranked = rankInboxCases([
      caseWith({ caseId: 'a', blockingGateFinding: false, sensitivity: 'standard', resultCount: 1, judgmentFreshness: 'fresh', conceptCoverage: 'covered', ageDays: 99, query: 'later age only' }),
      caseWith({ caseId: 'b', blockingGateFinding: true, sensitivity: 'standard', resultCount: 1, judgmentFreshness: 'fresh', conceptCoverage: 'covered', ageDays: 1, query: 'blocking gate' }),
      caseWith({ caseId: 'c', blockingGateFinding: false, sensitivity: 'sensitive', resultCount: 1, judgmentFreshness: 'fresh', conceptCoverage: 'covered', ageDays: 20, query: 'sensitive review' }),
      caseWith({ caseId: 'd', blockingGateFinding: false, sensitivity: 'standard', resultCount: 0, judgmentFreshness: 'fresh', conceptCoverage: 'covered', ageDays: 10, query: 'missing result' }),
      caseWith({ caseId: 'e', blockingGateFinding: false, sensitivity: 'standard', resultCount: 1, judgmentFreshness: 'stale', conceptCoverage: 'covered', ageDays: 15, query: 'stale judgment' }),
      caseWith({ caseId: 'f', blockingGateFinding: false, sensitivity: 'standard', resultCount: 1, judgmentFreshness: 'fresh', conceptCoverage: 'uncovered', ageDays: 30, query: 'uncovered concept' }),
      caseWith({ caseId: 'g', blockingGateFinding: false, sensitivity: 'standard', resultCount: 1, judgmentFreshness: 'fresh', conceptCoverage: 'covered', ageDays: 40, query: 'oldest' }),
      caseWith({ caseId: 'h', blockingGateFinding: false, sensitivity: 'standard', resultCount: 1, judgmentFreshness: 'fresh', conceptCoverage: 'covered', ageDays: 50, query: 'older and same priority' }),
    ]);

    expect(ranked.map((entry) => entry.item.caseId)).toEqual(['b', 'c', 'd', 'e', 'f', 'a', 'h', 'g']);
    expect(ranked[0]?.score.priority).toEqual({
      blockingGateFinding: 1,
      sensitiveCaseReview: 0,
      missingOrZeroResult: 0,
      staleJudgment: 0,
      uncoveredConcept: 0,
    });
    expect(ranked[0]?.explanation).toContain('Blocking gate finding');
    expect(ranked[0]?.explanation).toContain('1.0 days old');
  });

  it('breaks ties deterministically with artifact identity, reviewer, case id, and query', () => {
    const left = caseWith({
      caseId: 'aaaa',
      reviewer: 'alpha',
      artifact: ARTIFACT_A,
      ageDays: 8,
      query: 'alpha query',
    });
    const right = caseWith({
      caseId: 'bbbb',
      reviewer: 'beta',
      artifact: ARTIFACT_B,
      ageDays: 8,
      query: 'beta query',
    });
    expect(compareInboxCases(left, right)).toBeLessThan(0);
    expect(compareInboxCases(right, left)).toBeGreaterThan(0);
    expect(rankInboxCases([right, left]).map((entry) => entry.item.caseId)).toEqual(['aaaa', 'bbbb']);
  });

  it('produces a stable score object and readable explanation for UI', () => {
    const item = caseWith({
      caseId: 'explain',
      blockingGateFinding: true,
      sensitivity: 'sensitive',
      resultCount: null,
      judgmentFreshness: 'stale',
      conceptCoverage: 'uncovered',
      ageDays: 12.25,
      query: 'Explain this inbox row',
    });
    const score = scoreInboxCase(item);
    expect(score).toEqual({
      priority: {
        blockingGateFinding: 1,
        sensitiveCaseReview: 1,
        missingOrZeroResult: 1,
        staleJudgment: 1,
        uncoveredConcept: 1,
      },
      ageDays: 12.25,
      tieBreaker: '0.9.0\u0001corpus-a\u0001layer-a\u0001manual\u0001reviewing\u0001jesse\u0001explain\u0001Explain this inbox row',
    });
    expect(explainInboxCase(item, score)).toBe('Blocking gate finding • Sensitive-case review • Missing or zero result • Stale judgment • Uncovered concept • 12.3 days old');
  });
});

describe('inbox filters', () => {
  it('filters by source, state, reviewer, artifact identity, age, and sensitivity', () => {
    const filtered = [
      caseWith({ caseId: 'manual-sensitive', source: 'manual', state: 'reviewing', reviewer: 'jesse', sensitivity: 'sensitive', ageDays: 2, artifact: ARTIFACT_A }),
      caseWith({ caseId: 'manual-standard', source: 'manual', state: 'judged', reviewer: 'other', sensitivity: 'standard', ageDays: 12, artifact: ARTIFACT_A }),
      caseWith({ caseId: 'gauntlet-standard', source: 'gauntlet', state: 'reviewing', reviewer: null, sensitivity: 'standard', ageDays: 5, artifact: ARTIFACT_B }),
    ];

    const filter = combineInboxFilters(
      filterBySource('manual'),
      filterByState('reviewing', 'judged'),
      filterByReviewer('jesse', null),
      filterByArtifactIdentity(ARTIFACT_A),
      filterByAge({ minDays: 1, maxDays: 10 }),
      filterBySensitivity('sensitive'),
    );

    expect(filtered.filter(filter).map((entry) => entry.caseId)).toEqual(['manual-sensitive']);
  });

  it('rejects invalid age ranges and preserves empty sets as no matches', () => {
    expect(() => filterByAge({ minDays: 10, maxDays: 5 })).toThrow(/minDays must not be greater than maxDays/);
    expect([BASE].filter(filterBySource('gauntlet'))).toEqual([]);
  });
});
