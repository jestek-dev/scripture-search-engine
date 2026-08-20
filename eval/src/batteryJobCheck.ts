/**
 * CLI for the `battery (full artifact)` CI job.
 *
 * `check <report.json>` — the job's SOLE success criterion: exits non-zero
 * unless the machine report exists, parses, carries a G12-battery row with
 * status pass and applicability required, and includes the battery evidence
 * section. A missing report (the gauntlet's early-abort path writes none)
 * is red, never green. The tolerated non-G12 rows and the run verdict are
 * always printed under an advisory banner so the REJECT this job tolerates
 * stays visible.
 *
 * `compare <left.json> <right.json>` — byte-compares the two OS legs' G12 +
 * battery sections via canonical JSON.
 */

import { appendFileSync, existsSync, readFileSync } from 'node:fs';

import { batteryComparableSection, checkBatteryJobReport } from './gates/rankMetrics.js';

const ADVISORY_BANNER =
  'advisory in this job — these rows are merge-enforced by the verify job on the fixture identity';

function parseReport(path: string): unknown {
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as unknown;
  } catch {
    return undefined;
  }
}

function emit(lines: readonly string[]): void {
  const text = `${lines.join('\n')}\n`;
  process.stdout.write(text);
  const summaryPath = process.env['GITHUB_STEP_SUMMARY'];
  if (summaryPath) {
    try {
      appendFileSync(summaryPath, `\n${text}`);
    } catch {
      // The check verdict must never be masked by a summary-write failure.
    }
  }
}

function runCheck(path: string): number {
  const check = checkBatteryJobReport(parseReport(path));
  const lines = [`## Battery checker — ${path}`, '', `### ${ADVISORY_BANNER}`, ...check.advisory, ''];
  if (check.ok) {
    lines.push('G12-battery: pass (required) — checker green');
  } else {
    lines.push('### Checker failures');
    lines.push(...check.problems.map((problem) => `- ${problem}`));
  }
  emit(lines);
  return check.ok ? 0 : 1;
}

function runCompare(leftPath: string, rightPath: string): number {
  const left = batteryComparableSection(parseReport(leftPath));
  const right = batteryComparableSection(parseReport(rightPath));
  if (left === right && left !== 'missing-report' && left !== 'malformed-report') {
    emit([`Battery sections byte-identical across legs (${leftPath} vs ${rightPath}).`]);
    return 0;
  }
  emit([
    'Battery cross-leg comparison FAILED.',
    `left  (${leftPath}): ${left.slice(0, 400)}`,
    `right (${rightPath}): ${right.slice(0, 400)}`,
  ]);
  return 1;
}

const [mode, ...paths] = process.argv.slice(2);
if (mode === 'check' && paths.length === 1) {
  process.exitCode = runCheck(paths[0]!);
} else if (mode === 'compare' && paths.length === 2) {
  process.exitCode = runCompare(paths[0]!, paths[1]!);
} else {
  process.stderr.write('Usage: battery-check check <report.json> | compare <left.json> <right.json>\n');
  process.exitCode = 2;
}
