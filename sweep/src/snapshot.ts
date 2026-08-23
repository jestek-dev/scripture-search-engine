/**
 * Snapshot records (MS-1): what one executed query becomes on disk.
 *
 * One JSONL line per query, canonical key order, top-10 results with FULL
 * reasons — covenant #5 makes the reasons part of what is graded, so a
 * snapshot that dropped them could never support a wrong-explanation defect.
 * `elapsedMs` is recorded for the latency envelope but excluded from the
 * canonical hash (see canonical.ts).
 */
import type { ResearchResult } from '@jestek-dev/scripture-engine';

import { canonicalJson, canonicalLineHash, type JsonValue } from './canonical.js';

/** How many results a snapshot line keeps. Graders grade this window. */
export const SNAPSHOT_TOP_N = 10;

export interface SnapshotRecord {
  readonly queryId: string;
  readonly query: string;
  readonly kind: 'reference' | 'invalid-reference' | 'discovery';
  /** Present on discovery outcomes: the top-10 window, full reasons. */
  readonly results?: readonly SnapshotResult[];
  /** Present on discovery outcomes that substituted corrections. */
  readonly corrections?: readonly JsonValue[];
  /** Present on reference outcomes: the resolved passage label + verse ids. */
  readonly passage?: { readonly reference: string; readonly verseIds: readonly number[] };
  /** Present on invalid-reference outcomes that carry a did-you-mean. */
  readonly suggestion?: JsonValue;
  /** Total discovery results BEFORE the top-10 cut (0 for non-discovery). */
  readonly totalResults: number;
  /** Wall-clock execution time. NEVER part of the canonical hash. */
  readonly elapsedMs: number;
}

export interface SnapshotResult {
  readonly rank: number;
  readonly targetId: string;
  readonly reference: string;
  readonly score: number;
  readonly reasons: readonly JsonValue[];
  readonly verses?: readonly JsonValue[];
  readonly grouping?: JsonValue;
}

/** Build the snapshot record for one executed query. */
export function buildSnapshotRecord(
  queryId: string,
  query: string,
  outcome: ResearchResult,
  elapsedMs: number,
): SnapshotRecord {
  if (outcome.kind === 'reference') {
    return {
      queryId,
      query,
      kind: 'reference',
      passage: {
        reference: outcome.passage.reference,
        verseIds: outcome.passage.verses.map((verse) => verse.verseId),
      },
      totalResults: 0,
      elapsedMs,
    };
  }
  if (outcome.kind === 'invalid-reference') {
    const record: SnapshotRecord = {
      queryId,
      query,
      kind: 'invalid-reference',
      totalResults: 0,
      elapsedMs,
      ...(outcome.suggestion !== undefined
        ? { suggestion: outcome.suggestion as unknown as JsonValue }
        : {}),
    };
    return record;
  }
  const results: SnapshotResult[] = outcome.results.slice(0, SNAPSHOT_TOP_N).map((result, index) => ({
    rank: index + 1,
    targetId: result.targetId,
    reference: result.reference,
    score: result.score,
    reasons: result.reasons as unknown as JsonValue[],
    ...(result.verses !== undefined ? { verses: result.verses as unknown as JsonValue[] } : {}),
    ...(result.grouping !== undefined ? { grouping: result.grouping as unknown as JsonValue } : {}),
  }));
  return {
    queryId,
    query,
    kind: 'discovery',
    results,
    ...(outcome.corrections !== undefined
      ? { corrections: outcome.corrections as unknown as JsonValue[] }
      : {}),
    totalResults: outcome.results.length,
    elapsedMs,
  };
}

/** Serialize one record as its canonical JSONL line (keys sorted). */
export function snapshotLine(record: SnapshotRecord): string {
  return canonicalJson(record as unknown as JsonValue);
}

/** Canonical (elapsedMs-stripped) hash of one record. */
export function snapshotRecordHash(record: SnapshotRecord): string {
  return canonicalLineHash(record as unknown as JsonValue);
}
