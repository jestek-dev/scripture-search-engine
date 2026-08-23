/**
 * Weighted Cohen's kappa over the battery's 5-point ordinal scale (MS-9).
 *
 * The trust gate's headline number: agreement between the two human graders
 * over the dual-graded overlap (and, separately, human-vs-AI). Implemented
 * with integer-count accumulation and a single final division so the value
 * is a plain deterministic function of the confusion matrix.
 *
 * κ_w = 1 − (Σ w_ij · o_ij) / (Σ w_ij · e_ij), disagreement weights
 * w_ij = |i−j|/(k−1) (linear) or ((i−j)/(k−1))² (quadratic), e from the
 * marginals. Verified against hand-computed fixtures in layer3.test.ts.
 * The weighting used for the signed gate is part of what J43 ratifies;
 * both standard forms are provided.
 */
import { GRADE_VALUES, type GradeValue } from '../grade/layer2.js';

export type KappaWeighting = 'linear' | 'quadratic';

function gradeIndex(grade: GradeValue): number {
  const index = GRADE_VALUES.indexOf(grade);
  if (index === -1) throw new Error(`unknown grade "${grade}"`);
  return index;
}

/**
 * Weighted kappa over paired grades [graderA, graderB]. Returns 1 for
 * perfect agreement (including the degenerate all-one-category case, where
 * expected disagreement is 0 and there is nothing to disagree about).
 */
export function weightedKappa(
  pairs: readonly (readonly [GradeValue, GradeValue])[],
  weighting: KappaWeighting,
): number {
  if (pairs.length === 0) throw new Error('weightedKappa over zero pairs is undefined');
  const k = GRADE_VALUES.length;
  const observed: number[][] = Array.from({ length: k }, () => Array.from({ length: k }, () => 0));
  for (const [a, b] of pairs) {
    observed[gradeIndex(a)]![gradeIndex(b)]! += 1;
  }
  const n = pairs.length;
  const marginalA = observed.map((row) => row.reduce((sum, count) => sum + count, 0));
  const marginalB = Array.from({ length: k }, (_, j) =>
    observed.reduce((sum, row) => sum + row[j]!, 0),
  );
  const weight = (i: number, j: number): number => {
    const distance = Math.abs(i - j) / (k - 1);
    return weighting === 'linear' ? distance : distance * distance;
  };
  let observedDisagreement = 0;
  let expectedDisagreement = 0;
  for (let i = 0; i < k; i += 1) {
    for (let j = 0; j < k; j += 1) {
      observedDisagreement += weight(i, j) * observed[i]![j]!;
      expectedDisagreement += (weight(i, j) * marginalA[i]! * marginalB[j]!) / n;
    }
  }
  if (expectedDisagreement === 0) return 1;
  return 1 - observedDisagreement / expectedDisagreement;
}
