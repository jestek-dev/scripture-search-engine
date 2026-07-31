/**
 * G3, corpus half: golden fixtures expressed as real queries.
 *
 * The ranking-invariant fixtures test the ranker in isolation. These test the
 * whole engine against actual scripture, which is the only way to grade the
 * question that started this project: does "hearing and doing" find James 1?
 *
 * Both halves check REASONS, not just positions. A fixture that only asserted
 * "James 1:22 appears" would have passed in Phase 1 on token overlap alone,
 * and would have told us the concept layer worked when it did not exist.
 */

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';

import { parseAnchorRef } from '../../../pipeline/src/importers/ontologyImporter.js';
import { fail, pass, type GateFinding, type GateResult } from './types.js';

export interface CorpusFixture {
  readonly id: string;
  readonly status: 'active' | 'pending';
  readonly query?: string;
  readonly expectedTop?: readonly { reference: string; requiredReasonFamily?: string }[];
  readonly expectedWithinTop?: number;
  readonly mustNotRank?: readonly { reference: string; why?: string }[];
}

/** Verse id encoded in a target id like "WEB:59001022". */
function verseIdOf(targetId: string): number | null {
  const numeric = targetId.split(':')[1];
  if (!numeric) return null;
  const value = Number(numeric);
  return Number.isFinite(value) ? value : null;
}

export async function runCorpusFixture(
  engine: ScriptureEngine,
  fixture: CorpusFixture,
): Promise<string[]> {
  if (!fixture.query) return [];
  const problems: string[] = [];

  const result = await engine.research(fixture.query);
  const results = result.kind === 'discovery' ? result.results : [];
  const withinTop = fixture.expectedWithinTop ?? 10;
  const top = results.slice(0, withinTop);

  for (const expectation of fixture.expectedTop ?? []) {
    const range = parseAnchorRef(expectation.reference);
    if (!range) {
      problems.push(
        `${fixture.id}: fixture references "${expectation.reference}" which cannot be parsed`,
      );
      continue;
    }
    const hits = top.filter((entry) => {
      const verseId = verseIdOf(entry.targetId);
      return verseId !== null && verseId >= range.start && verseId <= range.end;
    });
    if (hits.length === 0) {
      problems.push(
        `${fixture.id}: expected ${expectation.reference} within the top ${withinTop} for ` +
          `"${fixture.query}", but it is absent`,
      );
      continue;
    }
    if (
      expectation.requiredReasonFamily &&
      !hits.some((hit) =>
        hit.reasons.some((reason) => reason.family === expectation.requiredReasonFamily),
      )
    ) {
      // The Phase 1 trap, made explicit: right verse, wrong evidence.
      problems.push(
        `${fixture.id}: ${expectation.reference} ranks for "${fixture.query}" but carries no ` +
          `'${expectation.requiredReasonFamily}' reason (has: ` +
          `${[...new Set(hits.flatMap((hit) => hit.reasons.map((r) => r.family)))].join(', ')}). ` +
          'The right passage for the wrong reason is still a failure.',
      );
    }
  }

  for (const forbidden of fixture.mustNotRank ?? []) {
    const range = parseAnchorRef(forbidden.reference);
    if (!range) continue;
    const offender = top.find((entry) => {
      const verseId = verseIdOf(entry.targetId);
      return verseId !== null && verseId >= range.start && verseId <= range.end;
    });
    if (offender) {
      problems.push(
        `${fixture.id}: ${forbidden.reference} must not rank for "${fixture.query}" but appears ` +
          `at position ${top.indexOf(offender) + 1}. ${forbidden.why ?? ''}`.trim(),
      );
    }
  }

  return problems;
}

export async function corpusGoldenGate(
  engine: ScriptureEngine,
  fixtures: readonly CorpusFixture[],
): Promise<GateResult> {
  const active = fixtures.filter((fixture) => fixture.status === 'active' && fixture.query);
  const pending = fixtures.filter((fixture) => fixture.status === 'pending' && fixture.query);

  const findings: GateFinding[] = [];
  for (const fixture of active) {
    const problems = await runCorpusFixture(engine, fixture);
    for (const problem of problems) findings.push({ message: problem, subjects: [fixture.id] });
  }

  if (findings.length > 0) {
    return fail(
      'G3-golden',
      'Golden regression (corpus)',
      `${findings.length} corpus fixture expectation(s) failed`,
      findings,
    );
  }

  // Pending fixtures are RUN even though they cannot fail the build, because
  // a pending fixture that has started passing is exactly the signal that it
  // should be promoted — and nobody would notice if it were never executed.
  const nowPassing: string[] = [];
  for (const fixture of pending) {
    const problems = await runCorpusFixture(engine, fixture);
    if (problems.length === 0) nowPassing.push(fixture.id);
  }

  const promote =
    nowPassing.length > 0
      ? ` — PENDING FIXTURES NOW PASSING, promote to active: ${nowPassing.join(', ')}`
      : '';
  return pass(
    'G3-golden',
    'Golden regression (corpus)',
    `${active.length} corpus fixture(s) hold; ${pending.length} pending${promote}`,
    { activeCorpusFixtures: active.length, pendingCorpusFixtures: pending.length },
  );
}
