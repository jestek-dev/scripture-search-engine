import { describe, expect, it } from 'vitest';

import {
  ReviewSessionValidationError,
  appendReviewSessionEvent,
  buildReviewSession,
  buildCalibrationSession,
  buildCandidateRegressionSession,
  buildHoldoutSession,
  buildStaleReconfirmationSession,
  buildWeeklyTriageSession,
  proposalGenerationSessionView,
  reviewClusterId,
  type ReviewSessionBuildInput,
  type ReviewSessionCase,
  type ReviewSession,
} from '../src/reviewSessions.js';

const digest = 'a'.repeat(64);
const artifact = 'b'.repeat(64);
const now = '2026-08-11T12:00:00.000Z';

function entry(caseId: string, query: string, source = 'manual', extra: Partial<ReviewSessionCase> = {}): ReviewSessionCase {
  return {
    caseId,
    query,
    source,
    outcomeClass: 'failure',
    deviceCount: 1,
    convertedRank: 4,
    recurrence: 1,
    createdAt: '2026-07-01T12:00:00.000Z',
    ...extra,
  };
}

function input(cases: readonly ReviewSessionCase[], extra: Partial<ReviewSessionBuildInput> = {}): Omit<ReviewSessionBuildInput, 'kind'> {
  return {
    cases,
    seed: 'review-seed-7',
    reviewer: 'reviewer:lee',
    repositoryStateDigest: digest,
    artifactStateDigest: artifact,
    now,
    ...extra,
  };
}

function eventBinding(session: ReviewSession) {
  return {
    sessionId: session.sessionId,
    sessionDefinitionDigest: session.definitionDigest,
    expectedSessionDigest: session.digest,
  };
}

describe('review sessions', () => {
  it('is canonical across shuffled input, exposes a machine-readable priority formula, and excludes popularity', () => {
    const cases = [
      entry('case-a', 'hearing and doing', 'manual'),
      entry('case-b', 'heareth and doeth', 'gauntlet', { deviceCount: 5 }),
      entry('case-c', 'shelter in the storm', 'coverage', { recurrence: 4 }),
      entry('case-d', 'hope in god', 'manual', { outcomeClass: 'ambiguous', deviceCount: 0 }),
    ];
    const left = buildWeeklyTriageSession(input(cases, { reviewedSize: 4 }));
    const right = buildWeeklyTriageSession(input([...cases].reverse(), { reviewedSize: 4 }));

    expect(left).toEqual(right);
    expect(left.priorityFormula.popularityExcluded).toBe(true);
    expect(left.items[0]?.priority).toMatchObject({ outcomeClass: 'failure', deviceCountBand: expect.any(String), convertedRankBand: expect.any(String) });
    expect(left.stateDigest).toHaveLength(64);
    expect(left.eligiblePoolDigest).toHaveLength(64);
  });

  it('clusters tokenizer-equivalent forms before selection so one wording cluster cannot monopolize', () => {
    const cases = [
      entry('case-a', 'hearing and doing', 'manual', { recurrence: 10 }),
      entry('case-b', 'heareth and doeth', 'manual', { recurrence: 9 }),
      entry('case-c', 'doers hear the word', 'manual', { recurrence: 8 }),
      entry('case-d', 'shelter in the storm', 'coverage'),
      entry('case-e', 'hope in god', 'gauntlet'),
    ];
    const session = buildWeeklyTriageSession(input(cases, { reviewedSize: 3 }));
    const clustered = session.items.filter((item) => item.clusterId === reviewClusterId('hearing and doing'));

    expect(clustered).toHaveLength(1);
    expect(new Set(session.items.map((item) => item.source)).size).toBeGreaterThan(1);
  });

  it('adds a small seeded exploration sample for quiet failures without breaking stable source ordering', () => {
    const cases = [
      entry('case-a', 'hearing and doing', 'manual', { outcomeClass: 'regressed', deviceCount: 5 }),
      entry('case-b', 'shelter in the storm', 'coverage', { outcomeClass: 'regressed', deviceCount: 5 }),
      entry('case-c', 'hope in god', 'gauntlet', { outcomeClass: 'regressed', deviceCount: 5 }),
      entry('case-d', 'mercy for the weak', 'manual', { outcomeClass: 'healthy', deviceCount: 0 }),
      entry('case-e', 'faith during trial', 'coverage', { outcomeClass: 'healthy', deviceCount: 0 }),
    ];
    const session = buildWeeklyTriageSession(input(cases, { reviewedSize: 5 }));

    expect(session.items.filter((item) => item.selection === 'exploration')).toHaveLength(1);
    expect(session.items.map((item) => item.caseId)).toEqual(buildWeeklyTriageSession(input([...cases].reverse(), { reviewedSize: 5 })).orderedCaseIds);
    expect(Math.max(...Object.values(session.sourceCounts)) - Math.min(...Object.values(session.sourceCounts))).toBeLessThanOrEqual(1);
  });

  it('builds all five session kinds with strict kind eligibility', () => {
    const cases = [
      entry('case-a', 'weekly review', 'manual'),
      entry('case-b', 'stale review', 'stale-judgment', { stale: true, outcomeClass: 'stale' }),
      entry('case-c', 'candidate regression', 'regression', { candidateRegression: true, outcomeClass: 'regressed' }),
      entry('case-d', 'calibration question', 'calibration', { calibration: true, outcomeClass: 'calibration' }),
      entry('case-e', 'hidden benchmark one', 'manual', { holdout: true }),
      entry('case-f', 'hidden benchmark two', 'manual', { holdout: true }),
    ];
    expect(buildWeeklyTriageSession(input(cases)).kind).toBe('weekly-triage');
    expect(buildStaleReconfirmationSession(input(cases, { minimumPoolSize: 1 })).orderedCaseIds).toEqual(['case-b']);
    expect(buildCandidateRegressionSession(input(cases, { minimumPoolSize: 1 })).orderedCaseIds).toEqual(['case-c']);
    expect(buildCalibrationSession(input(cases, { minimumPoolSize: 1 })).orderedCaseIds).toEqual(['case-d']);
    expect(new Set(buildHoldoutSession(input(cases)).orderedCaseIds)).toEqual(new Set(['case-e', 'case-f']));
  });

  it('routes pastoral cases only with an explicit qualification flag and keeps holdout membership opaque', () => {
    const cases = [
      entry('case-a', 'ordinary concern', 'manual'),
      entry('case-b', 'pastoral concern', 'manual', { sensitivityCategory: 'pastoral' }),
      entry('case-c', 'another ordinary concern', 'coverage'),
    ];
    const unqualified = buildWeeklyTriageSession(input(cases));
    const qualified = buildWeeklyTriageSession(input(cases, { qualifiedReviewer: true }));
    expect(unqualified.orderedCaseIds).not.toContain('case-b');
    expect(unqualified.skippedCases).toContainEqual({ caseId: 'case-b', reason: 'unqualified-pastoral-routing' });
    expect(qualified.orderedCaseIds).toContain('case-b');

    const holdout = buildHoldoutSession(input([
      entry('case-h1', 'private benchmark one', 'manual', { holdout: true }),
      entry('case-h2', 'private benchmark two', 'manual', { holdout: true }),
    ]));
    expect(proposalGenerationSessionView(holdout)).toEqual(expect.objectContaining({ opaqueMembership: true }));
    expect(proposalGenerationSessionView(holdout)).not.toHaveProperty('caseIds');
    expect(proposalGenerationSessionView(holdout)).not.toHaveProperty('sessionId');
    expect(proposalGenerationSessionView(holdout)).not.toHaveProperty('digest');
  });

  it('treats holdout as an exclusive privacy boundary even when a case is also calibration-eligible', () => {
    const visible = [
      entry('case-cal-a', 'calibration alpha', 'calibration', { calibration: true, outcomeClass: 'calibration' }),
      entry('case-cal-b', 'calibration beta', 'calibration', { calibration: true, outcomeClass: 'calibration' }),
    ];
    const hidden = entry('case-holdout-calibration', 'suppressed holdout calibration query', 'calibration', {
      calibration: true,
      holdout: true,
      outcomeClass: 'calibration',
    });
    const withoutHoldout = buildCalibrationSession(input(visible));
    const withHoldout = buildCalibrationSession(input([...visible, hidden]));

    expect(withHoldout).toEqual(withoutHoldout);
    const nonHoldoutLeakSurface = JSON.stringify({ session: withHoldout, view: proposalGenerationSessionView(withHoldout) });
    expect(nonHoldoutLeakSurface).not.toContain(hidden.caseId);
    expect(nonHoldoutLeakSurface).not.toContain(hidden.query);
    expect(withHoldout.skippedCases).not.toContainEqual(expect.objectContaining({ caseId: hidden.caseId }));

    const holdout = buildHoldoutSession(input([hidden], { minimumPoolSize: 1 }));
    const proposalView = JSON.stringify(proposalGenerationSessionView(holdout));
    expect(proposalView).not.toContain(hidden.caseId);
    expect(proposalView).not.toContain(hidden.query);
    expect(proposalView).not.toContain(holdout.sessionId);
    expect(proposalView).not.toContain(holdout.digest);
  });

  it('gives malformed, duplicate, and conflicting holdouts zero observable effect in every non-holdout builder', () => {
    const visible = [
      entry('case-visible-a', 'visible alpha', 'manual', { stale: true, candidateRegression: true, calibration: true }),
      entry('case-visible-b', 'visible beta', 'coverage', { stale: true, candidateRegression: true, calibration: true }),
      entry('case-visible-c', 'visible gamma', 'gauntlet', { stale: true, candidateRegression: true, calibration: true }),
    ];
    let randomState = 0x1a2b3c4d;
    const randomizedInvalidHoldouts = Array.from({ length: 24 }, (_, index) => {
      randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
      return {
        holdout: true,
        caseId: index % 3 === 0 ? '' : `bad holdout id ${randomState}`,
        query: index % 3 === 1 ? '' : null,
        source: index % 3 === 2 ? [] : `bad source ${randomState}`,
        [`invalid_${randomState.toString(16)}`]: { nested: Symbol('invalid') },
      } as unknown as ReviewSessionCase;
    });
    const canaries: readonly ReviewSessionCase[] = [
      { holdout: true, caseId: '', query: 'bad id', source: 'manual' } as unknown as ReviewSessionCase,
      { holdout: true, caseId: 'bad-query', query: '', source: 'manual' } as unknown as ReviewSessionCase,
      { holdout: true, caseId: 'bad-source', query: 'bad source', source: '' } as unknown as ReviewSessionCase,
      { ...visible[0]!, holdout: true, query: 'duplicate visible id must disappear' },
      { holdout: true, caseId: 'conflicting-holdout', query: 'first hidden conflict', source: 'manual' } as unknown as ReviewSessionCase,
      { holdout: true, caseId: 'conflicting-holdout', query: 'second hidden conflict', source: 'coverage' } as unknown as ReviewSessionCase,
      ...randomizedInvalidHoldouts,
    ];
    const builders = [
      buildWeeklyTriageSession,
      buildStaleReconfirmationSession,
      buildCandidateRegressionSession,
      buildCalibrationSession,
    ] as const;

    for (const build of builders) {
      const absent = build(input(visible));
      const injected = build(input([...canaries, ...visible, ...canaries.slice().reverse()]));
      expect(injected).toEqual(absent);
      expect(JSON.stringify(injected)).not.toContain('conflicting-holdout');
      expect(JSON.stringify(injected)).not.toContain('duplicate visible id must disappear');
    }

    const captureError = (run: () => unknown): { name: string; message: string } | null => {
      try {
        run();
        return null;
      } catch (error) {
        return { name: (error as Error).name, message: (error as Error).message };
      }
    };
    for (const build of builders) {
      const insufficient = [visible[0]!];
      expect(captureError(() => build(input([...canaries, ...insufficient]))))
        .toEqual(captureError(() => build(input(insufficient))));
    }
  });

  it('fully validates records selected by the holdout builder', () => {
    const valid = entry('case-holdout-valid', 'valid hidden benchmark', 'manual', { holdout: true });
    expect(() => buildHoldoutSession(input([
      valid,
      { ...entry('case-holdout-extra', 'invalid hidden benchmark'), holdout: true, unexpected: 'reject-me' } as unknown as ReviewSessionCase,
    ]))).toThrow(/unknown field/);
    expect(() => buildHoldoutSession(input([
      valid,
      { ...entry('bad holdout id', 'invalid hidden identity'), holdout: true } as ReviewSessionCase,
    ]))).toThrow(/stable identifier/);
  });

  it('folds append-only completion and skip events, keeps resumable order, and rejects stale or tampered mutations', () => {
    const session = buildWeeklyTriageSession(input([
      entry('case-a', 'hearing and doing', 'manual'),
      entry('case-b', 'shelter in storm', 'coverage'),
    ]));
    const first = appendReviewSessionEvent(session, {
      ...eventBinding(session),
      kind: 'item-skipped', eventId: 'event:one', expectedRevision: 0, caseId: 'case-a', reviewer: 'reviewer:lee', at: now,
      reason: 'needs-context', requeue: 'next-session',
    });
    expect(first.requeuedCaseIds).toEqual(['case-a']);
    expect(first.resumableCaseIds).toEqual(['case-b']);
    expect(() => appendReviewSessionEvent(session, {
      ...eventBinding(session),
      kind: 'item-completed', eventId: 'event:stale', expectedRevision: 1, caseId: 'case-b', reviewer: 'reviewer:lee', at: now,
    })).toThrow(ReviewSessionValidationError);
    expect(() => appendReviewSessionEvent(first, {
      ...eventBinding(first),
      kind: 'session-completed', eventId: 'event:early', expectedRevision: 1, reviewer: 'reviewer:lee', at: now,
    })).toThrow(/only after every item/);
    const finishedItems = appendReviewSessionEvent(first, {
      ...eventBinding(first),
      kind: 'item-completed', eventId: 'event:two', expectedRevision: 1, caseId: 'case-b', reviewer: 'reviewer:lee', at: now,
    });
    const complete = appendReviewSessionEvent(finishedItems, {
      ...eventBinding(finishedItems),
      kind: 'session-completed', eventId: 'event:three', expectedRevision: 2, reviewer: 'reviewer:lee', at: now,
    });
    expect(complete.status).toBe('completed');
    expect(complete.resumableCaseIds).toEqual([]);
    expect(() => appendReviewSessionEvent(complete, {
      ...eventBinding(complete),
      kind: 'item-completed', eventId: 'event:four', expectedRevision: 3, caseId: 'case-a', reviewer: 'reviewer:lee', at: now,
    })).toThrow(ReviewSessionValidationError);
    expect(() => appendReviewSessionEvent({ ...session, orderedCaseIds: [...session.orderedCaseIds].reverse() }, {
      ...eventBinding(session),
      kind: 'item-completed', eventId: 'event:tampered', expectedRevision: 0, caseId: 'case-a', reviewer: 'reviewer:lee', at: now,
    })).toThrow(/digest|order/);

    const other = buildWeeklyTriageSession(input([
      entry('case-a', 'hearing and doing', 'manual'),
      entry('case-b', 'shelter in storm', 'coverage'),
    ], { seed: 'another-seed' }));
    expect(() => appendReviewSessionEvent(other, {
      ...eventBinding(session),
      kind: 'item-completed', eventId: 'event:cross-session', expectedRevision: 0, caseId: 'case-a', reviewer: 'reviewer:lee', at: now,
    })).toThrow(/Cross-session/);
    expect(() => appendReviewSessionEvent(session, {
      ...eventBinding({ ...session, digest: 'c'.repeat(64) }),
      kind: 'item-completed', eventId: 'event:stale-digest', expectedRevision: 0, caseId: 'case-a', reviewer: 'reviewer:lee', at: now,
    })).toThrow(/digest does not match/);
  });

  it('derives session identity from every material normalized configuration field', () => {
    const cases = [
      entry('case-a', 'alpha failure', 'manual', { stale: true, candidateRegression: true, calibration: true }),
      entry('case-b', 'beta failure', 'coverage', { stale: true, candidateRegression: true, calibration: true }),
      entry('case-c', 'gamma failure', 'gauntlet', { stale: true, candidateRegression: true, calibration: true }),
      entry('case-d', 'delta quiet', 'manual', { stale: true, candidateRegression: true, calibration: true, outcomeClass: 'ambiguous', deviceCount: 0 }),
      entry('case-e', 'epsilon quiet', 'coverage', { stale: true, candidateRegression: true, calibration: true, outcomeClass: 'healthy', deviceCount: 0 }),
    ];
    const baselineInput: ReviewSessionBuildInput = {
      ...input(cases, { reviewedSize: 4, minimumPoolSize: 2, explorationSize: 1 }),
      kind: 'weekly-triage',
    };
    const baseline = buildReviewSession(baselineInput);
    const equivalent = buildReviewSession({ ...baselineInput, cases: [...cases].reverse() });
    expect(equivalent.sessionId).toBe(baseline.sessionId);
    expect(equivalent.definitionDigest).toBe(baseline.definitionDigest);
    expect(baseline.definition).toMatchObject({
      reviewedSize: 4,
      minimumPoolSize: 2,
      explorationSize: 1,
      priorityFormulaVersion: 1,
      selectionAlgorithmVersion: 2,
      candidateFilter: { version: 2 },
      sessionFilter: { version: 2 },
    });

    const variants: ReviewSessionBuildInput[] = [
      { ...baselineInput, reviewedSize: 3 },
      { ...baselineInput, minimumPoolSize: 1 },
      { ...baselineInput, reviewer: 'reviewer:kim' },
      { ...baselineInput, qualifiedReviewer: true },
      { ...baselineInput, now: '2026-08-12T12:00:00.000Z' },
      { ...baselineInput, explorationSize: 0 },
      { ...baselineInput, kind: 'calibration' },
      { ...baselineInput, seed: 'different-seed' },
      { ...baselineInput, repositoryStateDigest: 'c'.repeat(64) },
      { ...baselineInput, artifactStateDigest: 'd'.repeat(64) },
      { ...baselineInput, candidateFilterDigest: 'e'.repeat(64) },
      { ...baselineInput, sessionFilterDigest: 'f'.repeat(64) },
      { ...baselineInput, cases: [...cases, entry('case-f', 'zeta unselected', 'manual', { stale: true, candidateRegression: true, calibration: true })] },
    ];
    const ids = variants.map((variant) => buildReviewSession(variant).sessionId);
    expect(new Set([baseline.sessionId, ...ids])).toHaveLength(ids.length + 1);
  });

  it('fails closed on tiny pools, duplicates, invalid lifecycle state, and malformed cases', () => {
    expect(() => buildWeeklyTriageSession(input([entry('case-a', 'one case only')]))).toThrow(/below minimumPoolSize/);
    expect(() => buildWeeklyTriageSession(input([
      entry('case-a', 'hearing and doing'), entry('case-a', 'conflicting wording'),
    ]))).toThrow(/Duplicate or conflicting/);
    expect(() => buildWeeklyTriageSession(input([
      entry('case-a', 'the and of'), entry('case-b', 'hope in god'),
    ]))).toThrow(/no significant tokenizer words/);
  });
});
