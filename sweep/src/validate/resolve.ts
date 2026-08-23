/**
 * Disagreement resolution — the doctrine rule (MS-9).
 *
 * Any human disagreement flagged doctrine or pastoral → Jesse's grade is
 * final (resolvedBy: 'jesse'); tooling NEVER breaks such ties, and the AI's
 * grade is NEVER a vote — this function does not even accept it as input,
 * so no future edit can quietly count it.
 */
import type { GradeValue } from '../grade/layer2.js';

export type DisagreementFlag = 'doctrine' | 'pastoral';

export interface HumanGrade {
  readonly queryId: string;
  /** 'jesse' is load-bearing: only his grade resolves doctrine-flagged rows. */
  readonly grader: string;
  readonly grade: GradeValue;
  readonly flags?: readonly DisagreementFlag[];
  readonly at: string;
}

export type Resolution =
  | { readonly status: 'agreed'; readonly finalGrade: GradeValue }
  | {
      readonly status: 'resolved';
      readonly finalGrade: GradeValue;
      readonly resolvedBy: 'jesse';
    }
  | { readonly status: 'needs-jesse'; readonly reason: string }
  | { readonly status: 'needs-discussion'; readonly reason: string };

/**
 * Resolve one dual-graded row from its human grades alone. Deliberately no
 * AI-grade parameter: the AI's grade is attached to Jesse's list as INPUT
 * elsewhere, never counted here.
 */
export function resolveDisagreement(grades: readonly HumanGrade[]): Resolution {
  if (grades.length < 2) {
    throw new Error('resolveDisagreement is for dual-graded rows (need two human grades)');
  }
  const distinct = new Set(grades.map((grade) => grade.grade));
  if (distinct.size === 1) {
    return { status: 'agreed', finalGrade: grades[0]!.grade };
  }
  const doctrineFlagged = grades.some((grade) =>
    (grade.flags ?? []).some((flag) => flag === 'doctrine' || flag === 'pastoral'),
  );
  if (doctrineFlagged) {
    const jesse = grades.find((grade) => grade.grader === 'jesse');
    if (jesse !== undefined) {
      return { status: 'resolved', finalGrade: jesse.grade, resolvedBy: 'jesse' };
    }
    return {
      status: 'needs-jesse',
      reason:
        'doctrine/pastoral-flagged disagreement — Jesse\'s grade is final and no grade of his is present; ' +
        'tooling never breaks this tie and the AI grade is never a vote',
    };
  }
  return {
    status: 'needs-discussion',
    reason:
      'non-doctrinal disagreement — the graders reconcile it themselves (or flag it doctrine/pastoral, ' +
      'which routes it to Jesse); tooling only records the outcome',
  };
}
