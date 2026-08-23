/**
 * Build one Layer-3 validation episode plan (MS-9) from a run's Layer-1
 * grades + Layer-2 AI grades + the run universe.
 *
 * The episode itself NEEDS JESSE (he grades, names the second grader,
 * ratifies the tiers/hours via J67, signs the trust thresholds via J43) —
 * this script only produces the deterministic plan he runs.
 *
 * Workload numbers come from sweep/config/sweep-budgets.json
 * (graderWorkload) and are NULL until J43 signs them: without a signed
 * value this refuses with a not-applicable reason unless BOTH shakedown
 * flags pass explicit values (interim builds only; a shakedown plan is
 * never an episode).
 *
 * usage: planEpisode --layer1 <layer1-grades.jsonl> --layer2 <layer2-grades.jsonl>
 *          --universe <run-universe.jsonl> --out <episode-plan.json>
 *          [--shakedown-tier-b n --shakedown-ceiling n]
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { UNIVERSE_SEED } from '../src/universe/version.js';
import { parseUniverse } from '../src/universe/types.js';
import { planEpisode, type ValidationRow } from '../src/validate/sample.js';
import { readGraderWorkload } from '../src/validate/trustGate.js';
import type { Layer1Verdict } from '../src/grade/layer1.js';
import type { Layer2Grade } from '../src/grade/layer2.js';

function flagValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

const argv = process.argv.slice(2);
const layer1Path = flagValue(argv, '--layer1');
const layer2Path = flagValue(argv, '--layer2');
const universePath = flagValue(argv, '--universe');
const outPath = flagValue(argv, '--out');
if (!layer1Path || !layer2Path || !universePath || !outPath) {
  console.error(
    'usage: planEpisode --layer1 <layer1-grades.jsonl> --layer2 <layer2-grades.jsonl> --universe <jsonl> --out <plan.json> [--shakedown-tier-b n --shakedown-ceiling n]',
  );
  process.exit(2);
}

const signed = readGraderWorkload();
const shakedownTierB = flagValue(argv, '--shakedown-tier-b');
const shakedownCeiling = flagValue(argv, '--shakedown-ceiling');
let tierBSample: number;
let ceilingRowsPerEpisode: number;
if (signed.tierBSample !== null && signed.ceilingRowsPerEpisode !== null) {
  tierBSample = signed.tierBSample;
  ceilingRowsPerEpisode = signed.ceilingRowsPerEpisode;
} else if (shakedownTierB !== undefined && shakedownCeiling !== undefined) {
  tierBSample = Number(shakedownTierB);
  ceilingRowsPerEpisode = Number(shakedownCeiling);
  console.error(
    'SHAKEDOWN plan: explicit workload numbers supplied on the command line; this is not an episode.',
  );
} else {
  console.error(
    'not-applicable — graderWorkload unset in sweep/config/sweep-budgets.json (J43 has not signed the ' +
      'sweep numbers block). Refusing to plan an episode with guessed workload numbers; for interim ' +
      'shakedown builds pass BOTH --shakedown-tier-b and --shakedown-ceiling explicitly.',
  );
  process.exit(2);
}

const universe = new Map(parseUniverse(readFileSync(universePath, 'utf8')).map((line) => [line.queryId, line]));
const verdicts = readFileSync(layer1Path, 'utf8')
  .split('\n')
  .filter((line) => line.length > 0)
  .map((line) => JSON.parse(line) as Layer1Verdict);
const layer2 = new Map(
  readFileSync(layer2Path, 'utf8')
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as Layer2Grade)
    .map((grade) => [grade.queryId, grade]),
);

const byQuery = new Map<string, Layer1Verdict[]>();
for (const verdict of verdicts) {
  const list = byQuery.get(verdict.queryId) ?? [];
  list.push(verdict);
  byQuery.set(verdict.queryId, list);
}
const rows: ValidationRow[] = [...byQuery.entries()].map(([queryId, rowVerdicts]) => {
  const line = universe.get(queryId);
  const layer1: ValidationRow['layer1'] = rowVerdicts.some((v) => v.verdict === 'defect')
    ? 'defect'
    : rowVerdicts.some((v) => v.verdict === 'needs-ai-grade')
      ? 'needs-ai-grade'
      : 'pass';
  const ai = layer2.get(queryId);
  return {
    queryId,
    category: line?.category ?? 'unknown',
    register: line?.register ?? 'church-member',
    crisisAdjacent: line?.crisisAdjacent === true,
    layer1,
    weakEvidence: rowVerdicts.some((v) => v.check === 'junk-sole-weak-evidence' && v.verdict !== 'pass'),
    watchlistAdjacent: rowVerdicts.some((v) => v.check === 'junk-watchlist' && v.verdict !== 'pass'),
    ...(ai !== undefined ? { aiGrade: ai.grade, aiEscalate: ai.escalate } : {}),
  };
});

const plan = planEpisode(rows, { seed: UNIVERSE_SEED, tierBSample, ceilingRowsPerEpisode });
if (plan.halted) {
  console.error(plan.reason);
  writeFileSync(outPath, `${JSON.stringify(plan, null, 2)}\n`);
  process.exit(3);
}
writeFileSync(outPath, `${JSON.stringify(plan, null, 2)}\n`);
console.log(
  `episode plan: ${plan.rows.length} rows (strata ${JSON.stringify(plan.counts)}), ` +
    `workload ${plan.workload.grader0}/${plan.workload.grader1} vs ceiling ${ceilingRowsPerEpisode}, ` +
    `shrink ${JSON.stringify(plan.shrink)} → ${outPath}`,
);
