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
import { fail, notApplicable, pass, type GateFinding, type GateResult } from './types.js';

export interface CorpusFixture {
  readonly id: string;
  readonly status: 'active' | 'pending';
  readonly query?: string;
  readonly expectedTop?: readonly {
    reference: string;
    requiredReasonFamily?: string;
    /**
     * Exact reason label that must appear on the matched verse, e.g.
     * "Theme: Grace, not earned".
     *
     * requiredReasonFamily alone proves only that SOME concept anchors this
     * passage. Where two concepts legitimately anchor the same verse —
     * `grace-not-earned` and `salvation` both name Ephesians 2:8 — the
     * fixture would keep passing with its own concept deleted, measuring the
     * neighbour instead. Naming the label is what makes a concept fixture
     * actually test its own concept.
     */
    requiredReasonLabel?: string;
  }[];
  readonly expectedWithinTop?: number;
  readonly mustNotRank?: readonly { reference: string; why?: string }[];
  /**
   * Concept ids this fixture measures, for the coverage check below.
   *
   * Defaults to the fixture's own id, which is the common case (a fixture
   * named `worship` measures the `worship` concept). Declared explicitly when
   * the names diverge — `hearing-and-doing` measures `obedience-to-the-word` —
   * or when one query genuinely covers several tightly-related concepts.
   */
  readonly coversConcepts?: readonly string[];
}

/**
 * G3, structural half: every concept must be measured by some fixture.
 *
 * `ontology/README.md` and CLAUDE.md both state that a concept pack shipping
 * without fixtures "is rejected structurally". It was not: the rule lived only
 * in prose, and eight founding concepts had no fixture at all. A rule nobody
 * enforces is the same shape as a gate that always reports pass — this repo's
 * own words for the thing it refuses to ship.
 *
 * Coverage is deliberately cheap to satisfy and impossible to satisfy
 * accidentally: name the fixture after the concept, or say which concepts it
 * covers. What it buys is that no future pack can be admitted with nothing
 * measuring whether it helped.
 */
export function conceptCoverageGate(
  conceptIds: readonly string[],
  fixtures: readonly CorpusFixture[],
): GateResult {
  if (conceptIds.length === 0) {
    return notApplicable(
      'G3-golden',
      'Concept fixture coverage',
      'no concepts in ontology/concepts yet; the coverage check is implemented and unit-tested',
    );
  }

  // Only fixtures that actually RUN can measure anything. A pending fixture
  // states an intention; it cannot fail, so counting it as coverage would let
  // a concept ship measured by a test that never grades it.
  const covered = new Set<string>();
  for (const fixture of fixtures) {
    if (fixture.status !== 'active' || !fixture.query) continue;
    for (const id of fixture.coversConcepts ?? [fixture.id]) covered.add(id);
  }

  const orphans = conceptIds.filter((id) => !covered.has(id));
  if (orphans.length > 0) {
    return fail(
      'G3-golden',
      'Concept fixture coverage',
      `${orphans.length} concept(s) have no active golden fixture measuring them`,
      orphans.map((id) => ({
        message:
          `${id}: no active fixture covers this concept. Add eval/golden/${id}.json, or add ` +
          `"${id}" to an existing fixture's coversConcepts. A concept with nothing measuring ` +
          'it cannot be shown to help, which is what the fixtures-first rule exists to prevent.',
        subjects: [id],
      })),
    );
  }

  // Fixtures naming a concept that does not exist are reported too: it means
  // a concept was renamed or removed and its fixture now grades nothing.
  const known = new Set(conceptIds);
  const dangling = [
    ...new Set(
      fixtures
        .filter((fixture) => fixture.coversConcepts)
        .flatMap((fixture) => fixture.coversConcepts ?? [])
        .filter((id) => !known.has(id)),
    ),
  ].sort();
  if (dangling.length > 0) {
    return fail(
      'G3-golden',
      'Concept fixture coverage',
      `${dangling.length} fixture(s) claim to cover concepts that do not exist`,
      dangling.map((id) => ({
        message:
          `no concept "${id}" exists, but a fixture declares it in coversConcepts. The concept ` +
          'was renamed or removed and the fixture now measures nothing under that name.',
        subjects: [id],
      })),
    );
  }

  return pass(
    'G3-golden',
    'Concept fixture coverage',
    `all ${conceptIds.length} concept(s) are measured by an active fixture`,
    { concepts: conceptIds.length },
  );
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
      expectation.requiredReasonLabel &&
      !hits.some((hit) =>
        hit.reasons.some((reason) => reason.label === expectation.requiredReasonLabel),
      )
    ) {
      // Two concepts may legitimately anchor one verse; without this the
      // fixture measures whichever of them happens to survive.
      problems.push(
        `${fixture.id}: ${expectation.reference} ranks for "${fixture.query}" but carries no ` +
          `reason labelled '${expectation.requiredReasonLabel}' (has: ` +
          `${[...new Set(hits.flatMap((hit) => hit.reasons.map((r) => r.label)))].join(' | ')}). ` +
          'The fixture is measuring a different concept than the one it covers.',
      );
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
