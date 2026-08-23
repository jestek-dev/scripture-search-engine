/**
 * The versioned sweep defect record — `sweep-defect/v1` (MS-10).
 *
 * "Every wrong/incomplete result documented" needs a consumable structure:
 * 10^4 raw defects are unreadable; clustered, deduplicated, evidence-linked
 * records are actionable (the audit's notable-query table format, scaled).
 * Every record carries enough to re-run the experiment: the identity triple,
 * the expectation VERBATIM, the top-5 it got, a snapshot reference, and the
 * exact replay command.
 */
import { canonicalJson, sha256Hex, type JsonValue } from '../canonical.js';
import type { DefectClass, Severity } from '../grade/layer1.js';
import type { Expectation } from '../universe/types.js';

export const DEFECT_SCHEMA = 'scripture-search-engine/sweep-defect/v1';

export type TriageDecision = 'confident-fix' | 'needs-jesse' | 'wontfix-with-rationale';

/** Append-only lifecycle; verdicts are never rewritten, only superseded. */
export type DefectStatus =
  | 'open'
  | 'triaged'
  | 'fix-in-wave'
  | 'fixed'
  | 'verified-fixed'
  | 'wontfix'
  | 'superseded';

export const DEFECT_STATUSES: readonly DefectStatus[] = [
  'open',
  'triaged',
  'fix-in-wave',
  'fixed',
  'verified-fixed',
  'wontfix',
  'superseded',
];

export const SEVERITY_ORDER: readonly Severity[] = [
  'theologically-harmful',
  'wrong',
  'degraded',
  'incomplete',
  'cosmetic',
];

export interface DefectTopResult {
  readonly rank: number;
  readonly reference: string;
  readonly score: number;
  /** Sorted reason families for the result — the chip signature. */
  readonly reasonFamilies: readonly string[];
}

export interface DefectTriage {
  readonly decision: TriageDecision;
  /** wontfix ALWAYS carries one; needs-jesse fixes cite a batch verdict. */
  readonly rationale?: string;
  /** docs/reviews/sweep/approvals/<batch>#<cluster> once a verdict lands. */
  readonly batchRef?: string;
  readonly decidedBy: string;
  readonly at: string;
}

export interface DefectRecord {
  readonly schema: typeof DEFECT_SCHEMA;
  /** defect:<sha16 of runId‖queryId‖defectClass> — stable per run+query+class. */
  readonly id: string;
  readonly runId: string;
  readonly queryId: string;
  /** Verbatim query text. Committed DIGESTS redact this for crisis rows
   *  (J69); the per-run defect file keeps it — replay needs it. */
  readonly query: string;
  readonly generator: string;
  readonly category: string;
  readonly register: string;
  readonly crisisAdjacent: boolean;
  readonly identity: {
    readonly engineVersion: string;
    readonly corpusFingerprint: string;
    readonly layerFingerprint: string;
  };
  /** The universe line's expectation, VERBATIM. */
  readonly expectation: Expectation;
  readonly got: {
    readonly top5: readonly DefectTopResult[];
    /** Which snapshot file (and shard) holds the full record. */
    readonly snapshotRef: string;
    /** The exact command that re-runs this one query as an experiment. */
    readonly replayCmd: string;
  };
  readonly defectClass: DefectClass;
  /** Harmful is ABSOLUTE, not proportional. */
  readonly severity: Severity;
  readonly gradedBy: 'layer1' | 'layer2-ai' | 'human';
  readonly suspectedCause: string;
  /** The reason-chip signature or check output evidencing the cause. */
  readonly causeEvidence: string;
  /** sha16(class‖cause‖anchorSignature) — one cluster = one candidate fix. */
  readonly clusterKey: string;
  readonly triage?: DefectTriage;
  readonly status: DefectStatus;
  readonly notes?: readonly string[];
}

/** The #1 result's chip signature — e.g. "sole translation_variant #1"
 *  groups ad7+ad10+fn11+ph11 exactly as the audit did by hand. */
export function anchorSignature(top5: readonly DefectTopResult[]): string {
  const first = top5[0];
  if (first === undefined) return 'zero-results';
  return [...first.reasonFamilies].sort().join('+') || 'no-reasons';
}

export function clusterKeyOf(
  defectClass: DefectClass,
  suspectedCause: string,
  signature: string,
): string {
  return sha256Hex(`${defectClass}‖${suspectedCause}‖${signature}`).slice(0, 16);
}

export function defectId(runId: string, queryId: string, defectClass: DefectClass): string {
  return `defect:${sha256Hex(`${runId}‖${queryId}‖${defectClass}`).slice(0, 16)}`;
}

const DEFECT_CLASSES = new Set([
  'wrong-verse',
  'poor-prioritization',
  'missing-verse',
  'wrong-explanation',
  'parse-failure',
  'zero-results',
]);

/** Fail-closed structural validation; returns the record typed, or throws. */
export function validateDefectRecord(value: unknown): DefectRecord {
  const record = value as Partial<DefectRecord>;
  const fail = (reason: string): never => {
    throw new Error(`invalid sweep-defect/v1 record: ${reason}`);
  };
  if (record.schema !== DEFECT_SCHEMA) fail(`schema must be ${DEFECT_SCHEMA}`);
  for (const field of [
    'id',
    'runId',
    'queryId',
    'query',
    'generator',
    'category',
    'register',
    'suspectedCause',
    'causeEvidence',
    'clusterKey',
  ] as const) {
    if (typeof record[field] !== 'string' || record[field]!.length === 0) {
      fail(`${field} must be a non-empty string`);
    }
  }
  if (typeof record.crisisAdjacent !== 'boolean') fail('crisisAdjacent must be boolean');
  const identity = record.identity;
  if (
    identity === undefined ||
    typeof identity.engineVersion !== 'string' ||
    typeof identity.corpusFingerprint !== 'string' ||
    typeof identity.layerFingerprint !== 'string'
  ) {
    fail('identity triple must carry engineVersion/corpusFingerprint/layerFingerprint');
  }
  if (record.expectation === undefined || typeof record.expectation.kind !== 'string') {
    fail('expectation must be carried verbatim');
  }
  const got = record.got;
  if (
    got === undefined ||
    !Array.isArray(got.top5) ||
    got.top5.length > 5 ||
    typeof got.snapshotRef !== 'string' ||
    typeof got.replayCmd !== 'string' ||
    !got.replayCmd.includes('--query-id')
  ) {
    fail('got must carry top5 (≤5 inline), snapshotRef, and a replayCmd citing --query-id');
  }
  if (!DEFECT_CLASSES.has(record.defectClass as string)) fail(`unknown defectClass ${String(record.defectClass)}`);
  if (!SEVERITY_ORDER.includes(record.severity as Severity)) fail(`unknown severity ${String(record.severity)}`);
  if (!['layer1', 'layer2-ai', 'human'].includes(record.gradedBy as string)) {
    fail(`unknown gradedBy ${String(record.gradedBy)}`);
  }
  if (!DEFECT_STATUSES.includes(record.status as DefectStatus)) fail(`unknown status ${String(record.status)}`);
  if (record.triage !== undefined) {
    const triage = record.triage;
    if (!['confident-fix', 'needs-jesse', 'wontfix-with-rationale'].includes(triage.decision)) {
      fail(`unknown triage decision ${String(triage.decision)}`);
    }
    if (triage.decision === 'wontfix-with-rationale' && !triage.rationale) {
      fail('wontfix-with-rationale requires a rationale — the name is the contract');
    }
    if (typeof triage.decidedBy !== 'string' || typeof triage.at !== 'string') {
      fail('triage must carry decidedBy and at');
    }
  }
  const expectedId = defectId(record.runId!, record.queryId!, record.defectClass as DefectClass);
  if (record.id !== expectedId) fail(`id ${record.id} does not match derivation ${expectedId}`);
  const expectedKey = clusterKeyOf(
    record.defectClass as DefectClass,
    record.suspectedCause!,
    anchorSignature(got!.top5 as DefectTopResult[]),
  );
  if (record.clusterKey !== expectedKey) {
    fail(`clusterKey ${record.clusterKey} does not match derivation ${expectedKey}`);
  }
  return record as DefectRecord;
}

/** Canonical serialization — sorted keys, one line, round-trip stable. */
export function defectLine(record: DefectRecord): string {
  return canonicalJson(JSON.parse(JSON.stringify(record)) as JsonValue);
}

export function parseDefects(body: string): DefectRecord[] {
  return body
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => validateDefectRecord(JSON.parse(line)));
}
