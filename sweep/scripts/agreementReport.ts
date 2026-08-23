/**
 * Compute the MS-9 agreement report + trust gate from committed episode
 * grades. Committed with pass/fail honesty: while J43 leaves the trust
 * thresholds null, every clause reports not-applicable and the gate can
 * never read as pass.
 *
 * Inputs:
 *   --human   human-grades.jsonl (HumanGrade rows; dual rows appear twice,
 *             once per grader)
 *   --ai      layer2-grades.jsonl
 *   --canary-truth canary truth JSON: [{blindQueryId, groundTruth}]
 *             (the WITHHELD map — never part of any grader's queue)
 *   --out     agreement-report.json
 *   [--weighting linear|quadratic]  (default quadratic; the choice J43 signs)
 */
import { readFileSync, writeFileSync } from 'node:fs';

import type { GradeValue, Layer2Grade } from '../src/grade/layer2.js';
import { scoreCanaries, type CanarySpec } from '../src/validate/canary.js';
import { resolveDisagreement, type HumanGrade } from '../src/validate/resolve.js';
import {
  computeAgreementMetrics,
  evaluateTrustGate,
  readGraderTrust,
} from '../src/validate/trustGate.js';
import type { KappaWeighting } from '../src/validate/kappa.js';

function flagValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

const argv = process.argv.slice(2);
const humanPath = flagValue(argv, '--human');
const aiPath = flagValue(argv, '--ai');
const canaryTruthPath = flagValue(argv, '--canary-truth');
const outPath = flagValue(argv, '--out');
if (!humanPath || !aiPath || !canaryTruthPath || !outPath) {
  console.error(
    'usage: agreementReport --human <human-grades.jsonl> --ai <layer2-grades.jsonl> --canary-truth <truth.json> --out <report.json> [--weighting linear|quadratic]',
  );
  process.exit(2);
}
const weighting = (flagValue(argv, '--weighting') ?? 'quadratic') as KappaWeighting;
if (weighting !== 'linear' && weighting !== 'quadratic') {
  console.error(`unknown weighting "${weighting}"`);
  process.exit(2);
}

const humanGrades = readFileSync(humanPath, 'utf8')
  .split('\n')
  .filter((line) => line.length > 0)
  .map((line) => JSON.parse(line) as HumanGrade);
const aiGrades = new Map<string, GradeValue>(
  readFileSync(aiPath, 'utf8')
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as Layer2Grade)
    .map((grade) => [grade.queryId, grade.grade]),
);
const canaryTruth = new Map<string, CanarySpec>(
  (JSON.parse(readFileSync(canaryTruthPath, 'utf8')) as (CanarySpec & { blindQueryId: string })[]).map(
    (row) => [row.blindQueryId, row],
  ),
);

// Group human grades; canary rows are excluded from κ (they measure the
// graders/AI against ground truth, not the graders against each other).
const byQuery = new Map<string, HumanGrade[]>();
for (const grade of humanGrades) {
  if (canaryTruth.has(grade.queryId)) continue;
  const list = byQuery.get(grade.queryId) ?? [];
  list.push(grade);
  byQuery.set(grade.queryId, list);
}
const dualPairs = new Map<string, readonly [GradeValue, GradeValue]>();
const humanFinal = new Map<string, GradeValue>();
const unresolved: { queryId: string; status: string; reason: string }[] = [];
for (const [queryId, grades] of [...byQuery.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
  if (grades.length >= 2) {
    const ordered = [...grades].sort((a, b) => (a.grader < b.grader ? -1 : 1));
    dualPairs.set(queryId, [ordered[0]!.grade, ordered[1]!.grade]);
    const resolution = resolveDisagreement(ordered);
    if (resolution.status === 'agreed' || resolution.status === 'resolved') {
      humanFinal.set(queryId, resolution.finalGrade);
    } else {
      unresolved.push({ queryId, status: resolution.status, reason: resolution.reason });
    }
  } else {
    humanFinal.set(queryId, grades[0]!.grade);
  }
}

// Canary score for the AI grader (each human grader's canary score is a
// per-grader report; the GATE clause is about believing the AI).
const canary = scoreCanaries(aiGrades, canaryTruth);
const metrics = computeAgreementMetrics({
  dualPairs,
  humanFinal,
  aiGrades,
  canary,
  kappaWeighting: weighting,
});
const gate = evaluateTrustGate(metrics, readGraderTrust());

const report = {
  formatVersion: 1,
  metrics,
  gate,
  unresolved,
  note:
    unresolved.length > 0
      ? 'unresolved doctrine/pastoral disagreements are Jesse\'s to rule (resolvedBy: jesse); the AI grade is never a vote'
      : undefined,
};
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  `agreement report → ${outPath}: gate ${gate.status}` +
    (gate.status === 'not-applicable' ? ' (thresholds unset — J43)' : '') +
    (unresolved.length > 0 ? `; ${unresolved.length} disagreements await resolution` : ''),
);
if (gate.status === 'fail') process.exit(1);
