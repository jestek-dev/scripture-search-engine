/**
 * The Admission Report.
 *
 * This is the answer to "I wouldn't know from the outside whether what I'm
 * adding is harmful." A PR author reads a verdict and a short table; they
 * never have to inspect the dataset to know whether it helped.
 *
 * A report only makes claims that the gauntlet actually measures. Whether a
 * change has product value needs an explicit comparison policy; until that
 * policy exists, admission is determined by the gates below — plus the one
 * anti-claim CLAUDE.md pins: an addition that claims value but measurably
 * moves nothing is NO_MEASURABLE_EFFECT, and "NO MEASURABLE EFFECT means
 * don't merge".
 */

import type { GateResult } from './gates/types.js';
import {
  RANK_QUALITY_NULL_MARKER,
  type NoEffectDetection,
  type RankAggregate,
  type RankMetricValue,
  type RankMetricsReport,
  type RankThresholdEvaluation,
} from './gates/rankMetrics.js';

export type Verdict = 'ADMIT' | 'ADMIT_WITH_WARNINGS' | 'REJECT' | 'NO_MEASURABLE_EFFECT';

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
  /** Present only on runs that executed the battery (explicit targets). */
  readonly rankMetrics?: RankMetricsReport;
  /** Per-surface threshold evaluations from the reviewed rankQuality block. */
  readonly rankQuality?: readonly RankThresholdEvaluation[];
  /** The anchored no-effect detection outcome, when it was attempted. */
  readonly noMeasurableEffect?: NoEffectDetection;
}

export function decideVerdict(input: ReportInput): Verdict {
  if (
    input.gates.some(
      (gate) => gate.status === 'fail' || (gate.status === 'not-applicable' && gate.applicability === 'required'),
    )
  ) return 'REJECT';
  // A REJECT outranks it (a broken gate is worse news than a useless
  // addition); it outranks warnings (a warning is still mergeable, a
  // no-effect addition is not).
  if (input.noMeasurableEffect?.fired) return 'NO_MEASURABLE_EFFECT';
  if (input.gates.some((gate) => gate.status === 'warn')) return 'ADMIT_WITH_WARNINGS';
  return 'ADMIT';
}

/** The machine report recomputes this instead of trusting serialized text. */
export function headlineFor(
  verdict: Verdict,
  gates: readonly GateResult[],
  noMeasurableEffect?: { readonly expectNoEffect: string | null },
): string {
  const failed = gates.filter((gate) => gate.status === 'fail');
  const unavailable = gates.filter(
    (gate) => gate.status === 'not-applicable' && gate.applicability === 'required',
  );
  switch (verdict) {
    case 'REJECT':
      return `Rejected by ${failed.length + unavailable.length} required gate(s): ${[...failed, ...unavailable]
        .map((gate) => gate.gate)
        .join(', ')}`;
    case 'NO_MEASURABLE_EFFECT': {
      const reason = noMeasurableEffect?.expectNoEffect ?? null;
      return reason === null
        ? 'Curated layers changed but no anchored comparison moved. ' +
          '"NO MEASURABLE EFFECT means don\'t merge" (CLAUDE.md) — weight without value.'
        : 'Curated layers changed and no anchored comparison moved — the expected outcome for ' +
          `this run (--expect-no-effect ${reason}): a re-pin claims no value.`;
    }
    case 'ADMIT_WITH_WARNINGS':
      return 'Admissible. Warnings below are worth reading before merge.';
    case 'ADMIT':
      return 'Admissible. All applicable gates passed.';
  }
}

function displayMetric(value: RankMetricValue): string {
  return value.micro === null ? 'n/a' : (value.micro / 1000000).toFixed(6);
}

const METRIC_LABEL: Readonly<Record<RankThresholdEvaluation['metric'], string>> = {
  ndcg10: 'nDCG@10',
  mrr10: 'MRR@10',
  goodOrBetterTop3Rate: 'good-or-better@3',
};

function displayMicro(micro: number | null): string {
  return micro === null ? 'n/a' : (micro / 1000000).toFixed(6);
}

/**
 * One line per threshold surface. The null case carries the exact marker
 * wording and no verdict word at all: a null threshold never passes and
 * never fails — that sentence is the whole point of this section.
 */
function thresholdLine(evaluation: RankThresholdEvaluation): string {
  const name = `${METRIC_LABEL[evaluation.metric]} ${evaluation.scope}`;
  const value = displayMicro(evaluation.valueMicro);
  switch (evaluation.outcome) {
    case 'no-threshold':
      return `- ${name}: ${value} (${RANK_QUALITY_NULL_MARKER})`;
    case 'met':
      return `- ${name}: ${value} — MET (threshold ${displayMicro(evaluation.thresholdMicro)})`;
    case 'not-met':
      return `- ${name}: ${value} — NOT MET (threshold ${displayMicro(evaluation.thresholdMicro)}; G12 fails)`;
    case 'unmeasurable':
      return `- ${name}: ${value} — threshold ${displayMicro(evaluation.thresholdMicro)} is set but no ` +
        'scoreable queries exist (G12 fails; a threshold that cannot be measured must not pass)';
  }
}

function rankMetricsRow(label: string, aggregate: RankAggregate): string {
  return `| ${label} | ${displayMetric(aggregate.ndcg10)} | ${displayMetric(aggregate.mrr10)} | ` +
    `${displayMetric(aggregate.goodOrBetterTop3Rate)} | ${displayMetric(aggregate.recallAt50)} | ` +
    `${aggregate.scoreableQueries} | ${aggregate.excludedQueries} |`;
}

export function buildReport(input: ReportInput): AdmissionReport {
  const verdict = decideVerdict(input);
  const headline = headlineFor(verdict, input.gates, input.noMeasurableEffect);

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

  if (input.rankMetrics !== undefined) {
    lines.push('');
    lines.push('## Rank metrics');
    lines.push('');
    lines.push(
      'Graded gains (linear 0-1-2-3, human judgments only) over the battery plus the ' +
        'golden-derived pins. Thresholds are reviewed data (eval/budgets.json `rankQuality`) ' +
        'and enforce only where set; a null threshold is measured and reported, never a ' +
        'pass and never a fail.',
    );
    lines.push('');
    lines.push('| Category | nDCG@10 | MRR@10 | good-or-better@3 | Recall@50 | Scoreable | Excluded (IDCG=0) |');
    lines.push('|---|---|---|---|---|---|---|');
    lines.push(rankMetricsRow('overall', input.rankMetrics.overall));
    for (const [category, aggregate] of Object.entries(input.rankMetrics.perCategory)) {
      lines.push(rankMetricsRow(category, aggregate));
    }
    if (input.rankQuality !== undefined) {
      lines.push('');
      lines.push('### Thresholds');
      lines.push('');
      for (const evaluation of input.rankQuality) {
        lines.push(thresholdLine(evaluation));
      }
    }
  }

  if (input.noMeasurableEffect !== undefined) {
    const detection = input.noMeasurableEffect;
    lines.push('');
    lines.push('## No-measurable-effect detection');
    lines.push('');
    for (const comparison of detection.comparisons) {
      lines.push(comparison.state === 'compared'
        ? `- ${comparison.anchor}: compared — ${comparison.moved ? 'MOVED' : 'no movement'}`
        : `- ${comparison.anchor}: skipped — ${comparison.reason}`);
    }
    lines.push(detection.evaluated
      ? `- outcome: ${detection.fired ? 'FIRED' : 'not fired'} (layerFingerprint ${detection.layerMoved ? 'moved' : 'unchanged'})`
      : '- outcome: not evaluated — precondition failures above (skipped, never silently passed)');
    if (detection.expectNoEffect !== null) {
      lines.push(`- expected: --expect-no-effect ${detection.expectNoEffect} (recorded verbatim; audited against the PR diff shape)`);
    }
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
