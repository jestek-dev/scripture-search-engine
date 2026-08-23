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
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { batteryComparableSection, checkBatteryJobReport } from './gates/rankMetrics.js';

const ADVISORY_BANNER =
  'advisory in this job — these rows are merge-enforced by the verify job on the fixture identity';

// `npm run battery:check --workspace eval` executes with cwd = <repo>/eval,
// while the workflow and the docs pass repository-root-relative report paths
// (`eval/.runs/...`, `reports/linux/...`). Relative arguments therefore
// resolve against the repository root — the same convention gauntlet.ts uses
// via REPO_ROOT — never against process.cwd(). Absolute paths pass through.
const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));

function resolveReportPath(path: string): string {
  return isAbsolute(path) ? path : resolve(REPO_ROOT, path);
}

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
  const resolved = resolveReportPath(path);
  const check = checkBatteryJobReport(parseReport(resolved));
  const lines = [`## Battery checker — ${path}`, `reading ${resolved}`, '', `### ${ADVISORY_BANNER}`, ...check.advisory, ''];
  if (check.ok) {
    const tolerated = check.advisory.some((line) => line.startsWith('G12-battery warn'));
    lines.push(
      tolerated
        ? 'G12-battery: warn (required, tolerated — read the vacuity advisory above) — checker green'
        : 'G12-battery: pass (required) — checker green',
    );
  } else {
    lines.push('### Checker failures');
    lines.push(...check.problems.map((problem) => `- ${problem}`));
  }
  emit(lines);
  return check.ok ? 0 : 1;
}

function runCompare(leftPath: string, rightPath: string): number {
  const leftResolved = resolveReportPath(leftPath);
  const rightResolved = resolveReportPath(rightPath);
  const left = batteryComparableSection(parseReport(leftResolved));
  const right = batteryComparableSection(parseReport(rightResolved));
  if (left === right && left !== 'missing-report' && left !== 'malformed-report') {
    emit([`Battery sections byte-identical across legs (${leftPath} vs ${rightPath}).`]);
    return 0;
  }
  // The resolved absolute paths are printed so a missing-report failure
  // points at the exact file the checker read, not just the argument text.
  emit([
    'Battery cross-leg comparison FAILED.',
    `left  (${leftPath} -> ${leftResolved}): ${left.slice(0, 400)}`,
    `right (${rightPath} -> ${rightResolved}): ${right.slice(0, 400)}`,
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
