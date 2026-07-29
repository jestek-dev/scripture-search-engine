/**
 * The Admission Report.
 *
 * This is the answer to "I wouldn't know from the outside whether what I'm
 * adding is harmful." A PR author reads a verdict and a short table; they
 * never have to inspect the dataset to know whether it helped.
 *
 * The four verdicts are deliberate. NO_MEASURABLE_EFFECT exists because
 * "nothing broke" is not a reason to merge: an addition that changes no
 * fixture outcome and moves no metric is weight without value, and merging it
 * is how a corpus silently bloats past the point of diminishing returns.
 */

import type { GateResult } from './gates/types.js';

export type Verdict =
  | 'ADMIT'
  | 'ADMIT_WITH_WARNINGS'
  | 'REJECT'
  | 'NO_MEASURABLE_EFFECT';

export interface AdmissionReport {
  readonly verdict: Verdict;
  readonly headline: string;
  readonly gates: readonly GateResult[];
  readonly markdown: string;
}

const STATUS_ICON: Readonly<Record<GateResult['status'], string>> = {
  pass: '✅',
  fail: '❌',
  warn: '⚠️',
  'not-applicable': '⊘',
};

export interface ReportInput {
  readonly gates: readonly GateResult[];
  /**
   * True when this run changed at least one measurable outcome versus the
   * committed baseline. Phase 0 has no baseline to compare against, so the
   * caller passes undefined and the verdict simply omits the
   * NO_MEASURABLE_EFFECT branch rather than guessing.
   */
  readonly changedOutcomes?: boolean;
}

export function decideVerdict(input: ReportInput): Verdict {
  if (input.gates.some((gate) => gate.status === 'fail')) return 'REJECT';
  if (input.changedOutcomes === false) return 'NO_MEASURABLE_EFFECT';
  if (input.gates.some((gate) => gate.status === 'warn')) return 'ADMIT_WITH_WARNINGS';
  return 'ADMIT';
}

function headlineFor(verdict: Verdict, gates: readonly GateResult[]): string {
  const failed = gates.filter((gate) => gate.status === 'fail');
  switch (verdict) {
    case 'REJECT':
      return `Rejected by ${failed.length} gate(s): ${failed
        .map((gate) => gate.gate)
        .join(', ')}`;
    case 'NO_MEASURABLE_EFFECT':
      return 'Every gate passed, but no fixture outcome or metric changed — this ' +
        'addition carries weight without measurable value. Merging is not recommended.';
    case 'ADMIT_WITH_WARNINGS':
      return 'Admissible. Warnings below are worth reading before merge.';
    case 'ADMIT':
      return 'Admissible. All applicable gates passed.';
  }
}

export function buildReport(input: ReportInput): AdmissionReport {
  const verdict = decideVerdict(input);
  const headline = headlineFor(verdict, input.gates);

  const lines: string[] = [];
  lines.push('# Admission Report');
  lines.push('');
  lines.push(`**Verdict: ${verdict.replace(/_/g, ' ')}**`);
  lines.push('');
  lines.push(headline);
  lines.push('');
  lines.push('| Gate | Status | Result |');
  lines.push('|---|---|---|');
  for (const gate of input.gates) {
    lines.push(
      `| ${gate.gate} — ${gate.title} | ${STATUS_ICON[gate.status]} ${gate.status} | ${gate.summary} |`,
    );
  }

  const withFindings = input.gates.filter((gate) => (gate.findings?.length ?? 0) > 0);
  if (withFindings.length > 0) {
    lines.push('');
    lines.push('## Findings');
    for (const gate of withFindings) {
      lines.push('');
      lines.push(`### ${gate.gate} — ${gate.title}`);
      for (const finding of gate.findings ?? []) {
        const subjects = finding.subjects?.length
          ? ` _(${finding.subjects.join(', ')})_`
          : '';
        lines.push(`- ${finding.message}${subjects}`);
      }
    }
  }

  const skipped = input.gates.filter((gate) => gate.status === 'not-applicable');
  if (skipped.length > 0) {
    lines.push('');
    lines.push('## Not yet running');
    lines.push('');
    lines.push(
      'These gates have no inputs yet. They are listed so an absent check is ' +
        'never mistaken for a passing one.',
    );
    for (const gate of skipped) {
      lines.push(`- **${gate.gate}** — ${gate.summary}`);
    }
  }

  lines.push('');
  return { verdict, headline, gates: input.gates, markdown: lines.join('\n') };
}
