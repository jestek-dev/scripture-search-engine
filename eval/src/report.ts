/**
 * The Admission Report.
 *
 * This is the answer to "I wouldn't know from the outside whether what I'm
 * adding is harmful." A PR author reads a verdict and a short table; they
 * never have to inspect the dataset to know whether it helped.
 *
 * A report only makes claims that the gauntlet actually measures. Whether a
 * change has product value needs an explicit comparison policy; until that
 * policy exists, admission is determined by the gates below.
 */

import type { GateResult } from './gates/types.js';

export type Verdict = 'ADMIT' | 'ADMIT_WITH_WARNINGS' | 'REJECT';

export interface AdmissionReport {
  readonly verdict: Verdict;
  readonly headline: string;
  readonly gates: readonly GateResult[];
  readonly markdown: string;
}

const STATUS_ICON: Readonly<Record<GateResult['status'], string>> = {
  pass: 'PASS',
  fail: 'FAIL',
  warn: 'WARN',
  'not-applicable': 'N/A',
};

export interface ReportInput {
  readonly gates: readonly GateResult[];
}

export function decideVerdict(input: ReportInput): Verdict {
  if (
    input.gates.some(
      (gate) => gate.status === 'fail' || (gate.status === 'not-applicable' && gate.applicability === 'required'),
    )
  ) return 'REJECT';
  if (input.gates.some((gate) => gate.status === 'warn')) return 'ADMIT_WITH_WARNINGS';
  return 'ADMIT';
}

/** The machine report recomputes this instead of trusting serialized text. */
export function headlineFor(verdict: Verdict, gates: readonly GateResult[]): string {
  const failed = gates.filter((gate) => gate.status === 'fail');
  const unavailable = gates.filter(
    (gate) => gate.status === 'not-applicable' && gate.applicability === 'required',
  );
  switch (verdict) {
    case 'REJECT':
      return `Rejected by ${failed.length + unavailable.length} required gate(s): ${[...failed, ...unavailable]
        .map((gate) => gate.gate)
        .join(', ')}`;
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
      `| ${gate.gate} - ${gate.title} | ${STATUS_ICON[gate.status]} ${gate.status} | ${gate.summary} |`,
    );
  }

  const withFindings = input.gates.filter((gate) => (gate.findings?.length ?? 0) > 0);
  if (withFindings.length > 0) {
    lines.push('');
    lines.push('## Findings');
    for (const gate of withFindings) {
      lines.push('');
      lines.push(`### ${gate.gate} - ${gate.title}`);
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
    lines.push('## Unavailable gates');
    lines.push('');
    lines.push(
      'Required gates make the run reject; optional advisory gates are explicitly allowed ' +
        'to be unavailable and never count as a pass.',
    );
    for (const gate of skipped) {
      lines.push(`- **${gate.gate}** - ${gate.summary}`);
    }
  }

  lines.push('');
  return { verdict, headline, gates: input.gates, markdown: lines.join('\n') };
}
