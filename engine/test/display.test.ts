/**
 * Chip display polish (0.10.0 CO-2/F22) — one test per rendering rule.
 *
 * These rules are display-only by contract: they never touch points, scores
 * or ordering, so the unit surface is small and exact. The orchestrator-side
 * twin (eval/test/chip-display.test.ts) guards the discover() call site on a
 * live bed, where none of the shipped data currently produces a withheld
 * chip — which is why the rules are pinned here at the boundary values.
 */

import { describe, expect, it } from 'vitest';

import {
  CHIP_DISPLAY_MIN_POINTS,
  correctionCitation,
  PASSAGE_TERM_CHIP_DISPLAY_FLOOR,
  pinCorrectionCitations,
  polishChipsForDisplay,
} from '../src/internal.js';
import type { Reason, SpellingCorrection } from '../src/internal.js';

const chip = (family: Reason['family'], points: number, label = `${family} chip`): Reason => ({
  family,
  label,
  points,
});

describe('polishChipsForDisplay', () => {
  it('withholds a passage_terms chip below the display floor and keeps one at the floor', () => {
    const out = polishChipsForDisplay([
      chip('concept_anchor', 22),
      chip('passage_terms', PASSAGE_TERM_CHIP_DISPLAY_FLOOR, 'at floor'),
      chip('passage_terms', 0.69, 'below floor'),
    ]);
    expect(out.map((reason) => reason.label)).toEqual(['concept_anchor chip', 'at floor']);
  });

  it('the passage_terms floor is family-scoped: other weak chips between 0.05 and the floor stay', () => {
    const out = polishChipsForDisplay([
      chip('concept_anchor', 22),
      chip('cross_reference', 0.4),
      chip('proximity', 0.06),
    ]);
    expect(out).toHaveLength(3);
  });

  it('suppresses any chip whose points round to 0.0 at one display decimal', () => {
    const out = polishChipsForDisplay([
      chip('token_overlap', 7),
      chip('cross_reference', 0.049, 'rounds to 0.0'),
      chip('co_citation', CHIP_DISPLAY_MIN_POINTS, 'rounds to 0.1'),
    ]);
    expect(out.map((reason) => reason.label)).toEqual(['token_overlap chip', 'rounds to 0.1']);
  });

  it('never strips a result of its last chip: when every chip fails, the strongest stays', () => {
    // Explanations are contract (covenant 5): a ranked result with no chip
    // at all would be an unexplained result. The strongest failing chip
    // stays, honestly showing how little the result rests on.
    const out = polishChipsForDisplay([
      chip('passage_terms', 0.04, 'strongest'),
      chip('cross_reference', 0.01, 'weaker'),
    ]);
    expect(out).toEqual([chip('passage_terms', 0.04, 'strongest')]);
  });

  it('is display-only plumbing: points and relative order of kept chips are untouched', () => {
    const input = [
      chip('exact_phrase', 60),
      chip('concept_anchor', 22),
      chip('passage_terms', 0.3, 'withheld'),
      chip('token_overlap', 4),
    ];
    const out = polishChipsForDisplay(input);
    expect(out).toEqual([chip('exact_phrase', 60), chip('concept_anchor', 22), chip('token_overlap', 4)]);
  });

  it('returns the input array unchanged (same reference) when nothing is withheld', () => {
    const input = [chip('concept_anchor', 22), chip('token_overlap', 4)];
    expect(polishChipsForDisplay(input)).toBe(input);
    expect(polishChipsForDisplay([])).toEqual([]);
  });

  it('is deterministic across repeated runs', () => {
    const input = [
      chip('concept_anchor', 22),
      chip('passage_terms', 0.3),
      chip('cross_reference', 0.01),
    ];
    const once = JSON.stringify(polishChipsForDisplay(input));
    for (let i = 0; i < 5; i += 1) {
      expect(JSON.stringify(polishChipsForDisplay(input))).toBe(once);
    }
  });
});

describe('pinCorrectionCitations (0.12.0/QR-5 round-2 — every correction visibly cited)', () => {
  const correction = (typed: string, corrected: string): SpellingCorrection => ({
    typed,
    corrected,
    distance: 1,
  });

  it('decorates the strongest chip when no displayed chip carries the citation', () => {
    // The harm case: hello -> "hell" surfaces Theme: Hell rows whose evidence
    // is concept-anchor only — no decorated token chip anywhere the user
    // looks. The strongest chip must carry the query-level citation.
    const out = pinCorrectionCitations(
      [chip('concept_anchor', 22, 'Theme: Hell'), chip('cross_reference', 2)],
      [correction('hello', 'hell')],
    );
    expect(out.map((reason) => reason.label)).toEqual([
      'Theme: Hell (query corrected from "hello")',
      'cross_reference chip',
    ]);
    // Labels only: families, points and order are untouched.
    expect(out.map((reason) => [reason.family, reason.points])).toEqual([
      ['concept_anchor', 22],
      ['cross_reference', 2],
    ]);
  });

  it('leaves a result untouched (same reference) when a token chip already cites the correction', () => {
    const input = [
      chip('concept_anchor', 22, 'Theme: Grace, not earned'),
      chip('token_overlap', 4, `Shared word: grace (${correctionCitation('grade')})`),
    ];
    expect(pinCorrectionCitations(input, [correction('grade', 'grace')])).toBe(input);
  });

  it('cites every missing correction, and only the missing ones', () => {
    // Two corrections; the displayed chips cite one of them — the pin adds
    // exactly the other. J31 says every correction shown, not one of them.
    const out = pinCorrectionCitations(
      [
        chip('token_overlap', 4, `Shared word: grace (${correctionCitation('grade')})`),
        chip('concept_anchor', 2, 'Theme: Hell'),
      ],
      [correction('grade', 'grace'), correction('hello', 'hell')],
    );
    expect(out.map((reason) => reason.label)).toEqual([
      `Shared word: grace (${correctionCitation('grade')}) (query corrected from "hello")`,
      'Theme: Hell',
    ]);
  });

  it('no-ops on empty corrections, empty reasons, and is idempotent', () => {
    const input = [chip('concept_anchor', 22)];
    expect(pinCorrectionCitations(input, [])).toBe(input);
    expect(pinCorrectionCitations([], [correction('hello', 'hell')])).toEqual([]);
    const once = pinCorrectionCitations(input, [correction('hello', 'hell')]);
    // The pinned label itself satisfies the citation check on a second pass.
    expect(pinCorrectionCitations(once, [correction('hello', 'hell')])).toBe(once);
  });

  it('shares its citation string with the token-chip decoration (one wording to review)', () => {
    expect(correctionCitation('beleived')).toBe('corrected from "beleived"');
  });
});
