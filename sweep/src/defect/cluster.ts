/**
 * Deterministic defect clustering (MS-10): one cluster = one candidate fix
 * = one fixture = (usually) one approval-list line.
 *
 * Clusters order severity-then-size (harmful is absolute — a 2-row harmful
 * cluster outranks a 500-row cosmetic one), each with 3 representatives.
 */
import type { Severity } from '../grade/layer1.js';
import { SEVERITY_ORDER, type DefectRecord } from './schema.js';

export interface DefectCluster {
  readonly clusterKey: string;
  readonly defectClass: DefectRecord['defectClass'];
  readonly suspectedCause: string;
  /** Worst severity across members — the cluster ranks by its worst row. */
  readonly severity: Severity;
  readonly size: number;
  /** First 3 members by queryId — stable representatives. */
  readonly representatives: readonly DefectRecord[];
  readonly queryIds: readonly string[];
  readonly crisisAdjacentCount: number;
}

function severityRank(severity: Severity): number {
  const rank = SEVERITY_ORDER.indexOf(severity);
  if (rank === -1) throw new Error(`unknown severity ${severity}`);
  return rank;
}

export function clusterDefects(records: readonly DefectRecord[]): DefectCluster[] {
  const byKey = new Map<string, DefectRecord[]>();
  for (const record of [...records].sort((a, b) => (a.queryId < b.queryId ? -1 : 1))) {
    const members = byKey.get(record.clusterKey) ?? [];
    members.push(record);
    byKey.set(record.clusterKey, members);
  }
  const clusters: DefectCluster[] = [...byKey.entries()].map(([clusterKey, members]) => {
    const severity = members
      .map((member) => member.severity)
      .sort((a, b) => severityRank(a) - severityRank(b))[0]!;
    return {
      clusterKey,
      defectClass: members[0]!.defectClass,
      suspectedCause: members[0]!.suspectedCause,
      severity,
      size: members.length,
      representatives: members.slice(0, 3),
      queryIds: members.map((member) => member.queryId),
      crisisAdjacentCount: members.filter((member) => member.crisisAdjacent).length,
    };
  });
  return clusters.sort((a, b) => {
    const bySeverity = severityRank(a.severity) - severityRank(b.severity);
    if (bySeverity !== 0) return bySeverity;
    if (a.size !== b.size) return b.size - a.size;
    return a.clusterKey < b.clusterKey ? -1 : 1;
  });
}
