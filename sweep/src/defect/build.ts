/**
 * Build sweep-defect/v1 records from a run's Layer-1 verdicts + merged
 * snapshot + universe (MS-10). One record per (queryId, defectClass) — a
 * query failing two different checks the same way is one defect; failing
 * two different ways is two.
 */
import type { Layer1Verdict } from '../grade/layer1.js';
import type { SnapshotRecord } from '../snapshot.js';
import type { UniverseLine } from '../universe/types.js';
import {
  anchorSignature,
  clusterKeyOf,
  defectId,
  DEFECT_SCHEMA,
  type DefectRecord,
  type DefectTopResult,
} from './schema.js';

export interface BuildDefectsOptions {
  readonly runId: string;
  readonly identity: {
    readonly engineVersion: string;
    readonly corpusFingerprint: string;
    readonly layerFingerprint: string;
  };
  /** e.g. "runs/<runId>/snapshot-merged.jsonl". */
  readonly snapshotRef: string;
  /** Paths substituted into the replay command a reader can run verbatim. */
  readonly replay: {
    readonly artifactPath: string;
    readonly descriptorPath: string;
    readonly universePath: string;
    readonly snapshotPath: string;
  };
}

export function replayCommand(options: BuildDefectsOptions, queryId: string): string {
  const { artifactPath, descriptorPath, universePath, snapshotPath } = options.replay;
  return (
    `npm run replay --workspace sweep -- --artifact ${artifactPath} ` +
    `--descriptor ${descriptorPath} --universe ${universePath} ` +
    `--snapshot ${snapshotPath} --query-id ${queryId}`
  );
}

export function topFive(snapshot: SnapshotRecord | undefined): DefectTopResult[] {
  if (snapshot?.results === undefined) return [];
  return snapshot.results.slice(0, 5).map((result) => ({
    rank: result.rank,
    reference: result.reference,
    score: result.score,
    reasonFamilies: [
      ...new Set(
        result.reasons.map((reason) => (reason as { family?: string })?.family ?? 'unknown'),
      ),
    ].sort(),
  }));
}

export function buildDefectRecords(
  verdicts: readonly Layer1Verdict[],
  universe: ReadonlyMap<string, UniverseLine>,
  snapshots: ReadonlyMap<string, SnapshotRecord>,
  options: BuildDefectsOptions,
): DefectRecord[] {
  const byKey = new Map<string, DefectRecord>();
  const ordered = [...verdicts].sort((a, b) =>
    a.queryId < b.queryId ? -1 : a.queryId > b.queryId ? 1 : a.check < b.check ? -1 : 1,
  );
  for (const verdict of ordered) {
    if (verdict.verdict !== 'defect' || verdict.defect === undefined) continue;
    const line = universe.get(verdict.queryId);
    if (line === undefined) {
      throw new Error(`defect verdict for ${verdict.queryId} has no universe line`);
    }
    const top5 = topFive(snapshots.get(verdict.queryId));
    const signature = anchorSignature(top5);
    const key = `${verdict.queryId}‖${verdict.defect.defectClass}`;
    if (byKey.has(key)) continue; // first check wins; same class = same defect
    byKey.set(key, {
      schema: DEFECT_SCHEMA,
      id: defectId(options.runId, verdict.queryId, verdict.defect.defectClass),
      runId: options.runId,
      queryId: verdict.queryId,
      query: line.query,
      generator: line.generator,
      category: line.category ?? 'unknown',
      register: line.register ?? 'church-member',
      crisisAdjacent: line.crisisAdjacent === true,
      identity: options.identity,
      expectation: line.expectation,
      got: {
        top5,
        snapshotRef: options.snapshotRef,
        replayCmd: replayCommand(options, verdict.queryId),
      },
      defectClass: verdict.defect.defectClass,
      severity: verdict.defect.severity,
      gradedBy: 'layer1',
      suspectedCause: verdict.defect.suspectedCause,
      causeEvidence: verdict.defect.causeEvidence,
      clusterKey: clusterKeyOf(verdict.defect.defectClass, verdict.defect.suspectedCause, signature),
      status: 'open',
    });
  }
  return [...byKey.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
}
