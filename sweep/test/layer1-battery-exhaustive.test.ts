/**
 * MS-7 exhaustive battery canary (plan P8.7 verification clause):
 * "target 100% of the battery's 20 wrong-or-empty + 3 harmful A-rows
 * correctly classified from published evidence."
 *
 * This suite iterates ALL 23 known-bad rows — not a sample. Inputs are
 * machine-built from committed, published data:
 *   - the roster (20 X + 3 H, Config A) is the A-column of
 *     search-quality-report-2026-08-20 §6, transcribed verbatim below and
 *     cross-checked against committed files (every id must exist in
 *     eval/battery/queries.json with the transcribed query string, and the
 *     3 H rows must be EXACTLY the rows carrying a `harmful` list in
 *     eval/battery/judgments.json);
 *   - expectations come from committed eval/battery/judgments.json
 *     (grade ≥ 2 judged refs as anchors; `harmful` lists as mustNotLead)
 *     and, for the three reference-shaped rows, from the committed
 *     sweep/perturb/reference-specimens.yaml expectedReference labels;
 *   - each row's Config-A outcome is the report's published one: the
 *     quoted #1 where the report names it (fn5 Luke 22:5 §2; fn13
 *     Genesis 3:4 §2; ph11 Luke 18:5 §2; ad13 Psalms 68:19 §2; ad5/ad6/ad7
 *     the three harmful #1s §2; fn14 Ezekiel 14:4 and ad10 Judges 9:24 per
 *     docs/research/2026-08-21-audit-gap-verification.md Bed F; fn11 sole
 *     translation_variant per §3 attribution), zero results where published
 *     (fn7, ms1/ms2/ms3/ms5/ms6 §2), invalid-reference where published
 *     (ref1, ms4 §2; ref7 rides the same space-separated form, §5 A4).
 *     Four rows (fn4, fn6, fn12, ph12) publish only "junk — no judged-good
 *     ref surfaced": their filler #1 is REPRESENTATIVE (asserted to be
 *     outside the row's judged set); the classification under test depends
 *     only on the published miss, never on the filler's identity.
 *
 * "Correctly classified" is asserted per the published verdict: X rows
 * yield a defect (zero-results / parse-failure / missing-verse /
 * wrong-verse) and never a pass; H rows yield the watchlist's
 * theologically-harmful defect with autoEscalate (the tooling flags,
 * Jesse rules).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { gradeLayer1, gradeLine, type Layer1Context, type Layer1Verdict } from '../src/grade/layer1.js';
import { loadWatchlist } from '../src/grade/watchlist.js';
import {
  batteryMisspellingLines,
  loadReferenceSpecimens,
} from '../src/perturb/deriveRepoRing2.js';
import { REPO_ROOT } from '../src/universe/compileFromRepo.js';
import type { SnapshotRecord, SnapshotResult } from '../src/snapshot.js';
import type { UniverseLine } from '../src/universe/types.js';

// ---------------------------------------------------------------------------
// The published roster: Config-A verdict column of
// search-quality-report-2026-08-20 §6, X and H rows only, transcribed
// verbatim (id → query). 20 + 3 = 23.
// ---------------------------------------------------------------------------

const WRONG_OR_EMPTY_A: readonly (readonly [string, string])[] = [
  ['fn4', 'I feel alone'],
  ['fn5', 'worried about money'],
  ['fn6', 'my marriage is struggling'],
  ['fn7', 'burnout'],
  ['fn11', 'guilt and shame'],
  ['fn12', 'tempted to give up'],
  ['fn13', 'caring for a dying parent'],
  ['fn14', 'I keep falling into the same sin'],
  ['ph11', 'come to me all who are weary'],
  ['ph12', 'no weapon formed against me shall prosper'],
  ['ref1', 'John 3 16'],
  ['ref7', '1 corinthians 13 4'],
  ['ms1', 'forgivness'],
  ['ms2', 'annointing'],
  ['ms3', 'rightousness'],
  ['ms4', 'Phillipians 4:13'],
  ['ms5', 'stregnth'],
  ['ms6', 'salvasion'],
  ['ad10', 'God helps those who help themselves'],
  ['ad13', 'rapture'],
];

const HARMFUL_A: readonly (readonly [string, string])[] = [
  ['ad5', 'new beginnings'],
  ['ad6', 'comforter'],
  ['ad7', 'it is well with my soul'],
];

/** Per-row published Config-A outcome (see the header for the citations). */
type PublishedOutcome =
  | { readonly kind: 'empty' }
  | { readonly kind: 'invalid-reference' }
  | {
      readonly kind: 'wrong-top';
      readonly top1: string;
      /** True when the report publishes only the miss, not the ref. */
      readonly representative?: true;
    }
  | { readonly kind: 'sole-translation-variant'; readonly top1: string; readonly representative?: true }
  | { readonly kind: 'harmful-top'; readonly top1: string; readonly soleTranslationVariant?: true };

const PUBLISHED_A: Readonly<Record<string, PublishedOutcome>> = {
  fn4: { kind: 'wrong-top', top1: 'Ecclesiastes 10:9', representative: true },
  fn5: { kind: 'wrong-top', top1: 'Luke 22:5' },
  fn6: { kind: 'wrong-top', top1: 'Ecclesiastes 10:9', representative: true },
  fn7: { kind: 'empty' },
  fn11: { kind: 'sole-translation-variant', top1: 'Ecclesiastes 10:9', representative: true },
  fn12: { kind: 'wrong-top', top1: 'Ecclesiastes 10:9', representative: true },
  fn13: { kind: 'wrong-top', top1: 'Genesis 3:4' },
  fn14: { kind: 'sole-translation-variant', top1: 'Ezekiel 14:4' },
  ph11: { kind: 'wrong-top', top1: 'Luke 18:5' },
  ph12: { kind: 'wrong-top', top1: 'Ecclesiastes 10:9', representative: true },
  ref1: { kind: 'invalid-reference' },
  ref7: { kind: 'invalid-reference' },
  ms1: { kind: 'empty' },
  ms2: { kind: 'empty' },
  ms3: { kind: 'empty' },
  ms4: { kind: 'invalid-reference' },
  ms5: { kind: 'empty' },
  ms6: { kind: 'empty' },
  ad10: { kind: 'sole-translation-variant', top1: 'Judges 9:24' },
  ad13: { kind: 'wrong-top', top1: 'Psalms 68:19' },
  ad5: { kind: 'harmful-top', top1: 'Ecclesiastes 1:9' },
  ad6: { kind: 'harmful-top', top1: 'Job 16:2' },
  ad7: { kind: 'harmful-top', top1: 'Jeremiah 4:10', soleTranslationVariant: true },
};

// ---------------------------------------------------------------------------
// Committed inputs.
// ---------------------------------------------------------------------------

interface JudgedRef {
  readonly ref: string;
  readonly grade: number;
}
interface JudgmentRow {
  readonly judged?: readonly JudgedRef[];
  readonly harmful?: readonly { readonly ref: string }[];
}

const BATTERY = JSON.parse(
  readFileSync(join(REPO_ROOT, 'eval', 'battery', 'queries.json'), 'utf8'),
) as { queries: { id: string; query: string; category: string; status: string }[] };

const JUDGMENTS = JSON.parse(
  readFileSync(join(REPO_ROOT, 'eval', 'battery', 'judgments.json'), 'utf8'),
) as { judgments: Readonly<Record<string, JudgmentRow>> };

const SPECIMENS = new Map(loadReferenceSpecimens().map((row) => [row.batteryId, row]));
const MISSPELLING_LINES = new Map(
  batteryMisspellingLines().map((line) => [line.queryId.replace('battery-misspelling:', ''), line]),
);

const CONTEXT: Layer1Context = {
  watchlist: loadWatchlist(),
  conceptLabels: new Set<string>(),
  baseSnapshots: new Map(),
};

function goodRefs(id: string): string[] {
  return (JUDGMENTS.judgments[id]?.judged ?? [])
    .filter((entry) => entry.grade >= 2)
    .map((entry) => entry.ref);
}

function harmfulRefs(id: string): string[] {
  return (JUDGMENTS.judgments[id]?.harmful ?? []).map((entry) => entry.ref);
}

/** Build the universe line for one battery row from committed data only. */
function lineFor(id: string): UniverseLine {
  const row = BATTERY.queries.find((query) => query.id === id)!;
  const specimen = SPECIMENS.get(id);
  if (specimen !== undefined) {
    return {
      queryId: `battery:${id}`,
      query: row.query,
      generator: 'battery-exhaustive',
      category: row.category,
      expectation: { kind: 'verse-ref', expectedReference: specimen.expectedReference },
    };
  }
  const misspelling = MISSPELLING_LINES.get(id);
  if (misspelling !== undefined) return misspelling;
  const mustNotLead = harmfulRefs(id);
  return {
    queryId: `battery:${id}`,
    query: row.query,
    generator: 'battery-exhaustive',
    category: row.category,
    expectation: { kind: 'concept-anchors', conceptId: `battery:${id}`, anchors: goodRefs(id) },
    ...(mustNotLead.length > 0 ? { mustNotLead } : {}),
  };
}

const JUNK_REASONS = [
  { family: 'token_overlap', label: 'Shared word', points: 4 },
  { family: 'passage_terms', label: 'Passage vocabulary', points: 3 },
];
const SOLE_TV_REASONS = [{ family: 'translation_variant', label: 'Other translations read…', points: 14 }];

function junkResult(reference: string, soleTranslationVariant: boolean): SnapshotResult {
  return {
    rank: 1,
    targetId: 'verse:junk-1',
    reference,
    excerpt: 'excerpt of the surfaced verse…',
    score: 14,
    reasons: (soleTranslationVariant ? SOLE_TV_REASONS : JUNK_REASONS) as never,
  };
}

/** Build the snapshot record carrying the row's PUBLISHED Config-A outcome. */
function recordFor(id: string, line: UniverseLine): SnapshotRecord {
  const outcome = PUBLISHED_A[id]!;
  const base = { queryId: line.queryId, query: line.query, elapsedMs: 1 };
  switch (outcome.kind) {
    case 'empty':
      return { ...base, kind: 'discovery', results: [], totalResults: 0 };
    case 'invalid-reference':
      return { ...base, kind: 'invalid-reference', totalResults: 0 };
    case 'wrong-top':
      return {
        ...base,
        kind: 'discovery',
        results: [junkResult(outcome.top1, false)],
        totalResults: 1,
      };
    case 'sole-translation-variant':
      return {
        ...base,
        kind: 'discovery',
        results: [junkResult(outcome.top1, true)],
        totalResults: 1,
      };
    case 'harmful-top':
      return {
        ...base,
        kind: 'discovery',
        results: [junkResult(outcome.top1, outcome.soleTranslationVariant === true)],
        totalResults: 1,
      };
  }
}

const ALL_ROWS = [...WRONG_OR_EMPTY_A, ...HARMFUL_A];

// ---------------------------------------------------------------------------
// Roster integrity: the transcription must agree with committed data.
// ---------------------------------------------------------------------------

describe('the published roster (20 X + 3 H) agrees with committed data', () => {
  it('carries exactly 20 wrong-or-empty and 3 harmful rows, all distinct', () => {
    expect(WRONG_OR_EMPTY_A).toHaveLength(20);
    expect(HARMFUL_A).toHaveLength(3);
    expect(new Set(ALL_ROWS.map(([id]) => id)).size).toBe(23);
  });

  it('every id exists in the committed battery with the transcribed query, active', () => {
    for (const [id, query] of ALL_ROWS) {
      const row = BATTERY.queries.find((candidate) => candidate.id === id);
      expect(row, `battery row ${id} missing`).toBeDefined();
      expect(row!.query, `query drift on ${id}`).toBe(query);
      expect(row!.status).toBe('active');
    }
  });

  it('the 3 H rows are EXACTLY the rows carrying a harmful list in committed judgments', () => {
    const judged = Object.entries(JUDGMENTS.judgments)
      .filter(([, row]) => (row.harmful?.length ?? 0) > 0)
      .map(([id]) => id)
      .sort();
    expect(judged).toEqual(HARMFUL_A.map(([id]) => id).sort());
  });

  it('each harmful-top outcome quotes the row\'s committed harmful ref verbatim', () => {
    for (const [id] of HARMFUL_A) {
      const outcome = PUBLISHED_A[id]!;
      expect(outcome.kind).toBe('harmful-top');
      expect(harmfulRefs(id)).toContain((outcome as { top1: string }).top1);
    }
  });

  it('representative fillers never collide with a judged ref (honesty guard)', () => {
    for (const [id] of ALL_ROWS) {
      const outcome = PUBLISHED_A[id]!;
      if (('representative' in outcome && outcome.representative === true) === false) continue;
      const judged = (JUDGMENTS.judgments[id]?.judged ?? []).map((entry) => entry.ref);
      expect(judged).not.toContain((outcome as { top1: string }).top1);
    }
  });
});

// ---------------------------------------------------------------------------
// The exhaustive assertion: every one of the 23 rows is classified.
// ---------------------------------------------------------------------------

function defects(verdicts: Layer1Verdict[]): Layer1Verdict[] {
  return verdicts.filter((verdict) => verdict.verdict === 'defect');
}

describe('MS-7 classifies ALL 23 known-bad A-rows from published evidence', () => {
  for (const [id, query] of ALL_ROWS) {
    it(`${id} ("${query}") → classified, never passed`, () => {
      const line = lineFor(id);
      const verdicts = gradeLine(line, recordFor(id, line), CONTEXT);
      expect(defects(verdicts).length, `no defect verdict for ${id}`).toBeGreaterThan(0);
      expect(
        verdicts.filter((verdict) => verdict.verdict === 'pass'),
        `a check passed a published known-bad row (${id})`,
      ).toHaveLength(0);

      const outcome = PUBLISHED_A[id]!;
      switch (outcome.kind) {
        case 'empty': {
          const zero = verdicts.find((verdict) => verdict.check === 'zero-results');
          expect(zero?.verdict).toBe('defect');
          expect(zero?.defect?.defectClass).toBe('zero-results');
          break;
        }
        case 'invalid-reference': {
          const ref = verdicts.find((verdict) => verdict.check === 'reference-resolution');
          expect(ref?.verdict).toBe('defect');
          expect(ref?.defect?.defectClass).toBe('parse-failure');
          expect(ref?.defect?.suspectedCause).toBe('reference-grammar');
          break;
        }
        case 'wrong-top': {
          const anchor = verdicts.find((verdict) => verdict.check === 'curated-anchor-agreement');
          expect(anchor?.verdict).toBe('defect');
          expect(anchor?.defect?.defectClass).toBe('missing-verse');
          expect(anchor?.defect?.severity).toBe('wrong');
          break;
        }
        case 'sole-translation-variant': {
          const junk = verdicts.find((verdict) => verdict.check === 'junk-sole-weak-evidence');
          expect(junk?.verdict).toBe('defect');
          expect(junk?.defect?.causeEvidence).toContain('translation_variant');
          const anchor = verdicts.find((verdict) => verdict.check === 'curated-anchor-agreement');
          expect(anchor?.verdict).toBe('defect');
          break;
        }
        case 'harmful-top': {
          const watch = verdicts.find((verdict) => verdict.check === 'junk-watchlist');
          expect(watch?.verdict).toBe('defect');
          expect(watch?.defect?.severity).toBe('theologically-harmful');
          expect(watch?.defect?.autoEscalate).toBe(true);
          expect(watch?.defect?.causeEvidence).toContain(outcome.top1);
          if (outcome.soleTranslationVariant === true) {
            // ad7's published #1 evidence: translation_variant(14.0) as SOLE evidence.
            const junk = verdicts.find((verdict) => verdict.check === 'junk-sole-weak-evidence');
            expect(junk?.verdict).toBe('defect');
          }
          break;
        }
      }
    });
  }

  it('gradeLayer1 over all 23: every row defective; the 3 H rows are the auto-escalated set', () => {
    const lines = ALL_ROWS.map(([id]) => lineFor(id));
    const records = new Map(
      ALL_ROWS.map(([id], index) => {
        const line = lines[index]!;
        return [line.queryId, recordFor(id, line)] as const;
      }),
    );
    const summary = gradeLayer1(lines, records, CONTEXT);
    expect(summary.counts.pass).toBe(0);

    const defective = new Set(
      summary.verdicts.filter((verdict) => verdict.verdict === 'defect').map((verdict) => verdict.queryId),
    );
    for (const line of lines) {
      expect(defective.has(line.queryId), `${line.queryId} produced no defect`).toBe(true);
    }

    expect(summary.autoEscalated).toEqual(HARMFUL_A.map(([id]) => `battery:${id}`).sort());
  });
});
