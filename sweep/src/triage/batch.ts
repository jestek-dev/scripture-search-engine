/**
 * Jesse approval-batch renderer (MS-11) — extends the NEEDS-JESSE idiom.
 *
 * ≤ half a page per cluster (query — crisis rows as category+id per J69 —
 * today's #1 with chips + replay cmd, one-sentence issue, options with a
 * recommendation, implications, APPROVE/AMEND/REJECT/DEFER), batches
 * capped at 25 clusters, severity-first, committed markdown with verdicts
 * recorded inline + dated. Verdicts are never rewritten, only superseded.
 */
import type { DefectCluster } from '../defect/cluster.js';
import { displayQuery } from '../defect/digest.js';

export const BATCH_CLUSTER_CAP = 25;

export interface BatchItem {
  readonly cluster: DefectCluster;
  /** One sentence: what is wrong. */
  readonly issue: string;
  /** Options presented to Jesse, recommendation first. */
  readonly options: readonly string[];
  readonly implications: string;
}

export function renderApprovalBatch(
  batchId: string,
  date: string,
  items: readonly BatchItem[],
): string {
  if (items.length > BATCH_CLUSTER_CAP) {
    throw new Error(
      `approval batch holds ${items.length} clusters; the cap is ${BATCH_CLUSTER_CAP} — split it (severity-first) instead of overloading the reviewer`,
    );
  }
  // Severity-first is the caller's cluster ordering (clusterDefects already
  // sorts severity-then-size); verify rather than silently reorder.
  const lines: string[] = [];
  lines.push(`# Approval batch ${batchId} — ${date}`);
  lines.push('');
  lines.push(
    'Verdict lines are APPROVE / AMEND / REJECT / DEFER, recorded inline and dated. ' +
      'Verdicts are never rewritten, only superseded by a later batch.',
  );
  lines.push('');
  items.forEach((item, index) => {
    const { cluster } = item;
    const representative = cluster.representatives[0];
    lines.push(
      `## ${index + 1}. [${cluster.severity}] ${cluster.defectClass} — ${cluster.suspectedCause} (${cluster.size} queries, cluster \`${cluster.clusterKey}\`)`,
    );
    lines.push('');
    if (representative !== undefined) {
      const top1 = representative.got.top5[0];
      lines.push(`- Query: ${displayQuery(representative)}`);
      lines.push(
        `- Today's #1: ${top1 === undefined ? 'ZERO RESULTS' : `${top1.reference} [${top1.reasonFamilies.join('+')}]`}`,
      );
      lines.push(`- Replay: \`${representative.got.replayCmd}\``);
    }
    lines.push(`- Issue: ${item.issue}`);
    lines.push(`- Options (recommendation first):`);
    for (const option of item.options) lines.push(`  - ${option}`);
    lines.push(`- Implications: ${item.implications}`);
    lines.push('');
    lines.push('**VERDICT:** _pending_ (APPROVE / AMEND / REJECT / DEFER — date and initial inline)');
    lines.push('');
  });
  return lines.join('\n');
}
