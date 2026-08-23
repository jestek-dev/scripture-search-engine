/**
 * Layer-1 deterministic grading (MS-7). At 10^5 queries most grading must
 * be free and exact: every check below yields pass / defect /
 * needs-ai-grade from the snapshot and the expectation alone. The audit's
 * key insight is wired in — the #1-evidence-family predicts quality, so
 * junk is machine-detectable — and covenant #5 makes a wrong reason a
 * FAIL even at the right rank. Residue no check can decide routes to
 * needs-ai-grade, never to a silent pass.
 */
import type { SnapshotRecord, SnapshotResult } from '../snapshot.js';
import type { UniverseLine } from '../universe/types.js';
import type { WatchlistRow } from './watchlist.js';

export type DefectClass =
  | 'wrong-verse'
  | 'poor-prioritization'
  | 'missing-verse'
  | 'wrong-explanation'
  | 'parse-failure'
  | 'zero-results';

/** Harmful is absolute, not proportional (MS-10). */
export type Severity = 'theologically-harmful' | 'wrong' | 'degraded' | 'incomplete' | 'cosmetic';

export interface Layer1Defect {
  readonly defectClass: DefectClass;
  readonly severity: Severity;
  readonly suspectedCause: string;
  /** The reason-chip signature or check output that evidences the cause. */
  readonly causeEvidence: string;
  /** Watchlist hits are auto-escalated: the tooling flags, Jesse rules. */
  readonly autoEscalate?: true;
}

export interface Layer1Verdict {
  readonly queryId: string;
  readonly check: string;
  readonly verdict: 'pass' | 'defect' | 'needs-ai-grade';
  readonly defect?: Layer1Defect;
  readonly note?: string;
}

const WEAK_FAMILIES = new Set([
  'concept_lexicon',
  'token_overlap',
  'translation_variant',
  'proximity',
  'passage_terms',
  'cross_reference',
  'co_citation',
]);

const REFERENCE_PATTERN = /^(.+?) (\d+)(?::(\d+)(?:-(\d+))?)?$/;

interface ParsedRef {
  readonly book: string;
  readonly chapter: number;
  readonly verseStart: number | null;
  readonly verseEnd: number | null;
}

function parseRef(reference: string): ParsedRef | null {
  const match = REFERENCE_PATTERN.exec(reference);
  if (match === null) return null;
  return {
    book: match[1]!,
    chapter: Number(match[2]),
    verseStart: match[3] !== undefined ? Number(match[3]) : null,
    verseEnd: match[4] !== undefined ? Number(match[4]) : match[3] !== undefined ? Number(match[3]) : null,
  };
}

/** Anchor matches a surfaced reference when equal, or when either range covers the other. */
export function referenceMatches(anchor: string, surfaced: string): boolean {
  if (anchor === surfaced) return true;
  const a = parseRef(anchor);
  const s = parseRef(surfaced);
  if (a === null || s === null) return false;
  if (a.book !== s.book || a.chapter !== s.chapter) return false;
  if (a.verseStart === null || s.verseStart === null) return true; // chapter-level
  return a.verseStart <= s.verseEnd! && s.verseStart <= a.verseEnd!;
}

function anchorRank(anchors: readonly string[], results: readonly SnapshotResult[]): number | null {
  for (const result of results) {
    if (anchors.some((anchor) => referenceMatches(anchor, result.reference))) return result.rank;
  }
  return null;
}

function anchorResult(
  anchors: readonly string[],
  results: readonly SnapshotResult[],
): SnapshotResult | null {
  for (const result of results) {
    if (anchors.some((anchor) => referenceMatches(anchor, result.reference))) return result;
  }
  return null;
}

export interface Layer1Context {
  readonly watchlist: readonly WatchlistRow[];
  /** Live concept labels ("Theme: Faith" chips must resolve here). */
  readonly conceptLabels: ReadonlySet<string>;
  /** Base snapshots from THE SAME RUN, for the correction oracle. */
  readonly baseSnapshots: ReadonlyMap<string, SnapshotRecord>;
}

function reasonsOf(result: SnapshotResult): { family?: string; label?: string; points?: number }[] {
  return result.reasons as unknown as { family?: string; label?: string; points?: number }[];
}

/** Grade one query line. Returns every check verdict that applies. */
export function gradeLine(
  line: UniverseLine,
  record: SnapshotRecord,
  context: Layer1Context,
): Layer1Verdict[] {
  const verdicts: Layer1Verdict[] = [];
  const results = record.kind === 'discovery' ? (record.results ?? []) : [];
  const top1 = results[0];

  // (2) rank-of-expected-verse: reference kinds must resolve or type correctly.
  if (line.expectation.kind === 'verse-ref') {
    if (line.expectation.expectInvalid === true) {
      verdicts.push(
        record.kind === 'invalid-reference'
          ? { queryId: line.queryId, check: 'reference-typed-kind', verdict: 'pass' }
          : {
              queryId: line.queryId,
              check: 'reference-typed-kind',
              verdict: 'defect',
              defect: {
                defectClass: 'parse-failure',
                severity: 'wrong',
                suspectedCause: 'reference-grammar',
                causeEvidence: `expected typed invalid-reference, got ${record.kind}${
                  record.kind === 'reference' ? ` (${record.passage?.reference})` : ''
                }`,
              },
            },
      );
    } else {
      const expected = line.expectation.expectedReference!;
      if (record.kind === 'reference' && record.passage?.reference === expected) {
        verdicts.push({ queryId: line.queryId, check: 'reference-resolution', verdict: 'pass' });
      } else {
        verdicts.push({
          queryId: line.queryId,
          check: 'reference-resolution',
          verdict: 'defect',
          defect: {
            defectClass: 'parse-failure',
            severity: 'wrong',
            suspectedCause: 'reference-grammar',
            causeEvidence:
              record.kind === 'reference'
                ? `resolved to "${record.passage?.reference}", expected exactly "${expected}"`
                : `expected reference "${expected}", got ${record.kind}`,
          },
        });
      }
    }
    return verdicts; // reference lines take no discovery checks
  }

  // (4) zero-results with expectations.
  if (record.kind === 'discovery' && results.length === 0) {
    if (line.expectation.kind !== 'none') {
      verdicts.push({
        queryId: line.queryId,
        check: 'zero-results',
        verdict: 'defect',
        defect: {
          defectClass: 'zero-results',
          severity: 'wrong',
          suspectedCause: 'coverage-gap',
          causeEvidence: 'expectation-carrying query returned an empty result set',
        },
      });
    } else {
      verdicts.push({
        queryId: line.queryId,
        check: 'zero-results',
        verdict: 'needs-ai-grade',
        note: 'empty result set on an exploratory query — measured-gap feed',
      });
    }
    return verdicts;
  }

  // (5) correction-cited oracle (Ring 2) and correction-cited expectations.
  if (line.expectation.kind === 'base-query-oracle') {
    const base = context.baseSnapshots.get(line.expectation.baseQueryId);
    if (base === undefined) {
      verdicts.push({
        queryId: line.queryId,
        check: 'correction-oracle',
        verdict: 'needs-ai-grade',
        note: `base snapshot ${line.expectation.baseQueryId} not in run — cannot apply oracle`,
      });
      return verdicts;
    }
    const baseTop3 = (base.kind === 'discovery' ? (base.results ?? []) : [])
      .slice(0, 3)
      .map((result) => result.targetId);
    const top3 = results.slice(0, 3).map((result) => result.targetId);
    const cited = (record.corrections?.length ?? 0) > 0;
    const sameTop3 = JSON.stringify(top3) === JSON.stringify(baseTop3);
    if (results.length === 0 && baseTop3.length > 0) {
      verdicts.push({
        queryId: line.queryId,
        check: 'correction-oracle',
        verdict: 'defect',
        defect: {
          defectClass: 'zero-results',
          severity: 'wrong',
          suspectedCause: 'spelling-correction',
          causeEvidence: 'perturbed query empty while base query answers',
        },
      });
    } else if (cited && sameTop3) {
      verdicts.push({ queryId: line.queryId, check: 'correction-oracle', verdict: 'pass' });
    } else if (!cited && sameTop3) {
      verdicts.push({
        queryId: line.queryId,
        check: 'correction-oracle',
        verdict: 'pass',
        note: 'edit landed in-vocabulary; results identical to base with nothing to cite',
      });
    } else if (!cited && !sameTop3) {
      verdicts.push({
        queryId: line.queryId,
        check: 'correction-oracle',
        verdict: 'needs-ai-grade',
        note: 'results diverged from base with no citation — silent rewrite or real vocabulary shift',
      });
    } else {
      verdicts.push({
        queryId: line.queryId,
        check: 'correction-oracle',
        verdict: 'defect',
        defect: {
          defectClass: 'poor-prioritization',
          severity: 'degraded',
          suspectedCause: 'spelling-correction',
          causeEvidence: `corrected top-3 ${JSON.stringify(top3)} != base top-3 ${JSON.stringify(baseTop3)}`,
        },
      });
    }
    return verdicts;
  }
  if (line.expectation.kind === 'correction-cited') {
    if (record.kind === 'discovery' && (record.corrections?.length ?? 0) > 0 && results.length > 0) {
      verdicts.push({ queryId: line.queryId, check: 'correction-cited', verdict: 'pass' });
    } else if (record.kind === 'reference') {
      verdicts.push({ queryId: line.queryId, check: 'correction-cited', verdict: 'pass' });
    } else {
      verdicts.push({
        queryId: line.queryId,
        check: 'correction-cited',
        verdict: 'defect',
        defect: {
          defectClass: results.length === 0 ? 'zero-results' : 'wrong-explanation',
          severity: 'wrong',
          suspectedCause: 'spelling-correction',
          causeEvidence:
            results.length === 0
              ? 'misspelled query returned bare empty (the ms1 signature)'
              : 'results present but no correction cited for a planted misspelling',
        },
      });
    }
  }

  // (3) known-junk detectors on #1.
  if (top1 !== undefined) {
    const families = reasonsOf(top1)
      .map((reason) => reason.family)
      .filter((family): family is string => typeof family === 'string');
    const allWeak = families.length > 0 && families.every((family) => WEAK_FAMILIES.has(family));
    const soleWeak = allWeak && new Set(families).size === 1;
    if (soleWeak) {
      verdicts.push({
        queryId: line.queryId,
        check: 'junk-sole-weak-evidence',
        verdict: 'defect',
        defect: {
          defectClass: 'wrong-verse',
          severity: 'wrong',
          suspectedCause: 'engine-scoring',
          causeEvidence: `#1 rests on a sole weak family: ${families[0]} (the ad7 signature)`,
        },
      });
    }
    const lineClasses = new Set<string>(
      [
        line.category,
        line.expectation.kind === 'concept-anchors' ? line.expectation.conceptId : undefined,
        ...(line.expectation.kind === 'concept-anchors' ? (line.expectation.alsoAcceptable ?? []) : []),
      ].filter((value): value is string => typeof value === 'string'),
    );
    const watchHit = context.watchlist.find(
      (row) =>
        referenceMatches(row.ref, top1.reference) &&
        (row.matchClasses.some((cls) => lineClasses.has(cls)) ||
          (line.mustNotLead ?? []).some((ref) => referenceMatches(ref, top1.reference))),
    );
    const mustNotLeadHit =
      watchHit === undefined &&
      (line.mustNotLead ?? []).some((ref) => referenceMatches(ref, top1.reference));
    if (watchHit !== undefined || mustNotLeadHit) {
      verdicts.push({
        queryId: line.queryId,
        check: 'junk-watchlist',
        verdict: 'defect',
        defect: {
          defectClass: 'wrong-verse',
          severity: 'theologically-harmful',
          suspectedCause: 'negative-context-surfacing',
          causeEvidence:
            watchHit !== undefined
              ? `watchlisted ${watchHit.ref} leads for a matching class (${watchHit.status}): ${watchHit.senseInContext.slice(0, 120)}`
              : `must-not-lead reference ${top1.reference} at #1`,
          autoEscalate: true,
        },
      });
    }
  }

  // (6) flat-tie detector (the P4 signature).
  if (results.length >= 8) {
    const topEight = results.slice(0, 8);
    const allEqual = topEight.every((result) => result.score === topEight[0]!.score);
    const canonical = topEight.every(
      (result, index) => index === 0 || topEight[index - 1]!.targetId <= result.targetId,
    );
    if (allEqual && canonical) {
      verdicts.push({
        queryId: line.queryId,
        check: 'flat-tie',
        verdict: 'defect',
        defect: {
          defectClass: 'poor-prioritization',
          severity: 'degraded',
          suspectedCause: 'engine-scoring',
          causeEvidence: 'top-8 scores equal in canonical order (the th2 signature)',
        },
      });
    }
  }

  // (7) explanation-integrity (F22's S-tier clause at sweep scale).
  for (const result of results) {
    const reasons = reasonsOf(result);
    if (reasons.length === 0) {
      verdicts.push({
        queryId: line.queryId,
        check: 'explanation-integrity',
        verdict: 'defect',
        defect: {
          defectClass: 'wrong-explanation',
          severity: 'wrong',
          suspectedCause: 'display-pipeline',
          causeEvidence: `${result.reference} carries zero reasons`,
        },
      });
      break;
    }
    const badChip = reasons.find(
      (reason) =>
        typeof reason.family !== 'string' ||
        typeof reason.label !== 'string' ||
        typeof reason.points !== 'number' ||
        reason.points < 0,
    );
    if (badChip !== undefined) {
      verdicts.push({
        queryId: line.queryId,
        check: 'explanation-integrity',
        verdict: 'defect',
        defect: {
          defectClass: 'wrong-explanation',
          severity: 'wrong',
          suspectedCause: 'display-pipeline',
          causeEvidence: `${result.reference} carries a malformed chip ${JSON.stringify(badChip)}`,
        },
      });
      break;
    }
    const unresolvedTheme = reasons.find(
      (reason) =>
        reason.family === 'concept_anchor' &&
        reason.label !== undefined &&
        reason.label.startsWith('Theme: ') &&
        !context.conceptLabels.has(reason.label.slice('Theme: '.length)),
    );
    if (unresolvedTheme !== undefined) {
      verdicts.push({
        queryId: line.queryId,
        check: 'explanation-integrity',
        verdict: 'defect',
        defect: {
          defectClass: 'wrong-explanation',
          severity: 'wrong',
          suspectedCause: 'stale-label',
          causeEvidence: `chip label "${unresolvedTheme.label}" resolves to no live concept`,
        },
      });
      break;
    }
  }

  // (1) curated-anchor agreement, incl. the covenant-#5 reason check.
  if (line.expectation.kind === 'concept-anchors') {
    const rank = anchorRank(line.expectation.anchors, results);
    if (rank === null) {
      verdicts.push({
        queryId: line.queryId,
        check: 'curated-anchor-agreement',
        verdict: 'defect',
        defect: {
          defectClass: 'missing-verse',
          severity: line.confidence === 'inherited' ? 'incomplete' : 'wrong',
          suspectedCause: 'ranking-or-coverage',
          causeEvidence: `no curated anchor of ${line.expectation.conceptId} in the top-10`,
        },
      });
    } else {
      const surfaced = anchorResult(line.expectation.anchors, results)!;
      const hasAnchorReason = reasonsOf(surfaced).some(
        (reason) => reason.family === 'concept_anchor',
      );
      if (!hasAnchorReason) {
        // Wrong reason = fail even at the right rank (covenant #5).
        verdicts.push({
          queryId: line.queryId,
          check: 'curated-anchor-agreement',
          verdict: 'defect',
          defect: {
            defectClass: 'wrong-explanation',
            severity: 'wrong',
            suspectedCause: 'anchor-attribution',
            causeEvidence: `${surfaced.reference} ranks #${rank} without its concept_anchor chip — right verse, wrong reason`,
          },
        });
      } else if (rank <= 3) {
        verdicts.push({ queryId: line.queryId, check: 'curated-anchor-agreement', verdict: 'pass' });
      } else {
        verdicts.push({
          queryId: line.queryId,
          check: 'curated-anchor-agreement',
          verdict: 'needs-ai-grade',
          note: `anchor at #${rank} (top-10 but not top-3) — borderline, graded not guessed`,
        });
      }
    }
  } else if (line.expectation.kind === 'none' && verdicts.length === 0) {
    // No machine expectation and no detector fired: the residue.
    verdicts.push({
      queryId: line.queryId,
      check: 'residue',
      verdict: 'needs-ai-grade',
      note: 'no machine-checkable expectation — Layer-2 grades it',
    });
  }

  return verdicts;
}

export interface Layer1Summary {
  readonly verdicts: Layer1Verdict[];
  /** queryIds whose residue needs Layer-2 AI grading. */
  readonly queue: string[];
  readonly counts: { pass: number; defect: number; needsAiGrade: number };
  readonly autoEscalated: string[];
}

export function gradeLayer1(
  lines: readonly UniverseLine[],
  records: ReadonlyMap<string, SnapshotRecord>,
  context: Layer1Context,
): Layer1Summary {
  const verdicts: Layer1Verdict[] = [];
  const queue = new Set<string>();
  const autoEscalated = new Set<string>();
  const counts = { pass: 0, defect: 0, needsAiGrade: 0 };
  for (const line of lines) {
    const record = records.get(line.queryId);
    if (record === undefined) {
      verdicts.push({
        queryId: line.queryId,
        check: 'snapshot-presence',
        verdict: 'defect',
        defect: {
          defectClass: 'parse-failure',
          severity: 'wrong',
          suspectedCause: 'harness',
          causeEvidence: 'universe line has no snapshot in this run',
        },
      });
      counts.defect += 1;
      continue;
    }
    const lineVerdicts = gradeLine(line, record, context);
    for (const verdict of lineVerdicts) {
      verdicts.push(verdict);
      if (verdict.verdict === 'pass') counts.pass += 1;
      else if (verdict.verdict === 'defect') {
        counts.defect += 1;
        if (verdict.defect?.autoEscalate === true) autoEscalated.add(verdict.queryId);
      } else {
        counts.needsAiGrade += 1;
        queue.add(verdict.queryId);
      }
    }
  }
  return { verdicts, queue: [...queue].sort(), counts, autoEscalated: [...autoEscalated].sort() };
}
