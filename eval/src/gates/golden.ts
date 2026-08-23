/**
 * G3 — golden regression, and G2 — determinism.
 *
 * G3 checks BOTH ordering and explanations. A result that holds its rank for
 * the wrong reason is a failure here, because the explanation is part of the
 * product contract: "every result has at least one machine-verifiable reason
 * matching its actual evidence" (2026-07-20 quality gates).
 *
 * G2 runs the same fixtures twice and compares byte-for-byte. Two runs in one
 * process catch nondeterminism from Map/Set iteration and unstable sorts; CI
 * additionally runs the whole suite on a second OS to catch platform-dependent
 * collation.
 */

import { rank, type Candidate, type Evidence } from '@jestek-dev/scripture-engine/internal';

import { fail, notApplicable, pass, type GateFinding, type GateResult } from './types.js';

interface RankingCase {
  readonly id: string;
  readonly rule: string;
  readonly candidates: readonly {
    readonly targetId: string;
    readonly groupId: string;
    readonly evidence: readonly Evidence[];
  }[];
  readonly expectedOrder: readonly string[];
  readonly requiredReasons?: Readonly<Record<string, string>>;
}

export interface GoldenFixture {
  readonly id: string;
  readonly status: 'active' | 'pending';
  readonly pendingUntilPhase?: number;
  readonly query?: string;
  readonly cases?: readonly RankingCase[];
}

function runCase(testCase: RankingCase): string[] {
  const candidates: Candidate[] = testCase.candidates.map((candidate) => ({
    targetId: candidate.targetId,
    groupId: candidate.groupId,
    evidence: candidate.evidence,
  }));
  const results = rank(candidates);
  const problems: string[] = [];

  const actualOrder = results.map((result) => result.targetId);
  const expected = [...testCase.expectedOrder];
  if (actualOrder.join(' > ') !== expected.join(' > ')) {
    problems.push(
      `${testCase.id}: expected order [${expected.join(', ')}] but got ` +
        `[${actualOrder.join(', ')}] — rule: ${testCase.rule}`,
    );
  }

  for (const [targetId, family] of Object.entries(testCase.requiredReasons ?? {})) {
    const result = results.find((candidate) => candidate.targetId === targetId);
    if (!result) {
      problems.push(`${testCase.id}: ${targetId} is missing from results entirely`);
      continue;
    }
    if (!result.reasons.some((reason) => reason.family === family)) {
      // Ranked correctly but explained wrongly — still a failure.
      problems.push(
        `${testCase.id}: ${targetId} ranked correctly but carries no '${family}' ` +
          `reason (has: ${result.reasons.map((reason) => reason.family).join(', ')})`,
      );
    }
  }
  return problems;
}

export function goldenGate(fixtures: readonly GoldenFixture[]): GateResult {
  const active = fixtures.filter((fixture) => fixture.status === 'active');
  const pending = fixtures.filter((fixture) => fixture.status === 'pending');

  const findings: GateFinding[] = [];
  let caseCount = 0;

  for (const fixture of active) {
    for (const testCase of fixture.cases ?? []) {
      caseCount += 1;
      const problems = runCase(testCase);
      if (problems.length > 0) {
        findings.push({ message: problems.join('; '), subjects: [fixture.id] });
      }
    }
  }

  const metrics = {
    activeFixtures: active.length,
    cases: caseCount,
    pendingFixtures: pending.length,
  };

  if (findings.length > 0) {
    return fail('G3-golden', 'Golden regression', `${findings.length} case(s) regressed`, findings);
  }

  const pendingNote =
    pending.length > 0
      ? ` (${pending.length} pending fixture(s) awaiting a later phase: ` +
        `${pending.map((fixture) => fixture.id).join(', ')})`
      : '';
  return pass(
    'G3-golden',
    'Golden regression',
    `${caseCount} case(s) across ${active.length} fixture(s) hold ordering and reasons${pendingNote}`,
    metrics,
  );
}

/** G2: the same inputs must produce identical output across repeated runs. */
export function determinismGate(fixtures: readonly GoldenFixture[]): GateResult {
  const active = fixtures.filter((fixture) => fixture.status === 'active');
  const cases = active.flatMap((fixture) => fixture.cases ?? []);
  if (cases.length === 0) {
    return notApplicable('G2-determinism', 'Determinism', 'no active ranking cases to replay');
  }

  const snapshot = (): string =>
    JSON.stringify(
      cases.map((testCase) =>
        rank(
          testCase.candidates.map((candidate) => ({
            targetId: candidate.targetId,
            groupId: candidate.groupId,
            evidence: candidate.evidence,
          })),
        ).map((result) => ({
          targetId: result.targetId,
          score: result.score,
          reasons: result.reasons.map((reason) => [reason.family, reason.points]),
        })),
      ),
    );

  const first = snapshot();
  const second = snapshot();
  if (first !== second) {
    return fail('G2-determinism', 'Determinism', 'repeated runs disagreed', [
      {
        message:
          'Identical inputs produced different output across two runs in one process. ' +
          'Usual cause: iteration over a Map/Set whose insertion order varies, or a ' +
          'comparator that returns 0 for distinct items.',
      },
    ]);
  }
  return pass('G2-determinism', 'Determinism', `${cases.length} case(s) replayed identically`, {
    replayedCases: cases.length,
  });
}
