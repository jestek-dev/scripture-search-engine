/**
 * The committed clustered digest (MS-10) — what Jesse actually reads.
 *
 * Clusters severity-then-size with 3 representatives each, plus a tally
 * table MIRRORING the battery judgment format (the 3/2/1/0 gradeMeanings
 * axis + harmful) so B- → A → S movement reads on one axis across sweeps.
 *
 * Crisis-adjacent queries appear in committed digests as category + id,
 * NOT verbatim text — the J69 default is tight; Jesse can tighten or
 * loosen it. The per-run defect file (not committed to docs/) keeps the
 * verbatim text because replay needs it.
 */
import type { GradeValue } from '../grade/layer2.js';
import type { DefectCluster } from './cluster.js';
import type { DefectRecord } from './schema.js';

/** Battery gradeMeanings axis (eval/battery/judgments.json) + harmful. */
const TALLY_GRADES: readonly { key: GradeValue; label: string }[] = [
  { key: 'excellent', label: '3 (primary)' },
  { key: 'good', label: '2 (on-theme)' },
  { key: 'acceptable', label: '1 (related)' },
  { key: 'poor', label: '0 (irrelevant)' },
  { key: 'harmful', label: 'harmful' },
];

export interface TallyRow {
  readonly category: string;
  readonly total: number;
  readonly counts: Readonly<Record<GradeValue, number>>;
  readonly ungraded: number;
}

/** Per-category tally over AI grades, mirroring the battery's grade axis. */
export function buildTally(
  rows: readonly { category: string; aiGrade?: GradeValue }[],
): TallyRow[] {
  const byCategory = new Map<string, { total: number; counts: Record<GradeValue, number>; ungraded: number }>();
  for (const row of rows) {
    const entry =
      byCategory.get(row.category) ??
      ({
        total: 0,
        counts: { excellent: 0, good: 0, acceptable: 0, poor: 0, harmful: 0 },
        ungraded: 0,
      } as { total: number; counts: Record<GradeValue, number>; ungraded: number });
    entry.total += 1;
    if (row.aiGrade === undefined) entry.ungraded += 1;
    else entry.counts[row.aiGrade] += 1;
    byCategory.set(row.category, entry);
  }
  return [...byCategory.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([category, entry]) => ({ category, ...entry }));
}

/** J69 redaction: crisis rows show category + id, never verbatim text. */
export function displayQuery(record: DefectRecord): string {
  if (record.crisisAdjacent) {
    return `[crisis-adjacent ${record.category} query — id ${record.queryId}; text withheld per J69]`;
  }
  return `\`${record.query}\``;
}

export interface DigestOptions {
  readonly runId: string;
  readonly identity: {
    readonly engineVersion: string;
    readonly corpusFingerprint: string;
    readonly layerFingerprint: string;
  };
  readonly totalQueries: number;
  readonly totalDefects: number;
  /** Cap on clusters rendered in full; the rest are tabled. */
  readonly maxClustersInFull?: number;
}

export function renderDigest(
  clusters: readonly DefectCluster[],
  tally: readonly TallyRow[],
  options: DigestOptions,
): string {
  const lines: string[] = [];
  lines.push(`# Sweep defect digest — run ${options.runId}`);
  lines.push('');
  lines.push(
    `Identity: engine ${options.identity.engineVersion} · corpus ${options.identity.corpusFingerprint.slice(0, 12)}… · layers ${options.identity.layerFingerprint.slice(0, 12)}…`,
  );
  lines.push('');
  lines.push(
    `${options.totalDefects} defect records over ${options.totalQueries} queries, in ${clusters.length} clusters (severity-then-size; harmful is absolute, not proportional).`,
  );
  lines.push('');
  lines.push('## Tally (battery grade axis — 3/2/1/0 + harmful)');
  lines.push('');
  lines.push(`| category | queries | ${TALLY_GRADES.map((grade) => grade.label).join(' | ')} | ungraded |`);
  lines.push(`|---|---:|${TALLY_GRADES.map(() => '---:').join('|')}|---:|`);
  for (const row of tally) {
    lines.push(
      `| ${row.category} | ${row.total} | ${TALLY_GRADES.map((grade) => row.counts[grade.key]).join(' | ')} | ${row.ungraded} |`,
    );
  }
  lines.push('');
  lines.push('## Clusters');
  lines.push('');
  const maxFull = options.maxClustersInFull ?? 50;
  clusters.slice(0, maxFull).forEach((cluster, index) => {
    lines.push(
      `### ${index + 1}. [${cluster.severity}] ${cluster.defectClass} — ${cluster.suspectedCause} (${cluster.size} queries, cluster \`${cluster.clusterKey}\`)`,
    );
    lines.push('');
    if (cluster.crisisAdjacentCount > 0) {
      lines.push(`${cluster.crisisAdjacentCount} member(s) crisis-adjacent — texts withheld per J69.`);
      lines.push('');
    }
    for (const representative of cluster.representatives) {
      const top1 = representative.got.top5[0];
      lines.push(
        `- ${displayQuery(representative)} (${representative.queryId}) → #1 ${top1 === undefined ? 'ZERO RESULTS' : `${top1.reference} [${top1.reasonFamilies.join('+')}]`}`,
      );
      lines.push(`  - evidence: ${representative.causeEvidence}`);
      lines.push(`  - replay: \`${representative.got.replayCmd}\``);
    }
    lines.push('');
  });
  if (clusters.length > maxFull) {
    lines.push(`### Remaining ${clusters.length - maxFull} clusters`);
    lines.push('');
    lines.push('| severity | class | cause | size | key |');
    lines.push('|---|---|---|---:|---|');
    for (const cluster of clusters.slice(maxFull)) {
      lines.push(
        `| ${cluster.severity} | ${cluster.defectClass} | ${cluster.suspectedCause} | ${cluster.size} | \`${cluster.clusterKey}\` |`,
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}
