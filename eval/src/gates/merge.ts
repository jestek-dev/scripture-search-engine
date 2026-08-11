import { gateApplicability, type GateResult, type GateStatus } from './types.js';

export function mergeGateResults(title: string, results: readonly GateResult[]): GateResult {
  if (results.length === 0) throw new Error('Cannot merge an empty gate result list.');
  const statuses: readonly GateStatus[] = results.map((result) => result.status);
  const status: GateStatus = statuses.includes('fail')
    ? 'fail'
    : statuses.includes('warn')
      ? 'warn'
      : statuses.every((value) => value === 'not-applicable')
        ? 'not-applicable'
        : 'pass';
  const metrics = Object.assign({}, ...results.map((result) => result.metrics ?? {}));
  const hasActiveRegression = results.some(
    (result) => result.status === 'fail' && result.title !== 'Concept fixture coverage',
  );
  const promotionCandidates = hasActiveRegression
    ? []
    : [...new Set(results.flatMap((result) => result.promotionCandidates ?? []))].sort();
  return {
    gate: results[0]!.gate,
    title,
    status,
    applicability: gateApplicability(results[0]!.gate),
    summary: results.map((result) => result.summary).join(' | '),
    findings: results.flatMap((result) => result.findings ?? []),
    metrics,
    promotionCandidates,
  };
}
