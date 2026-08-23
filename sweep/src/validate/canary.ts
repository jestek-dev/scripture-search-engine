/**
 * Blind seeded canaries (MS-9 stratum e).
 *
 * Canaries are rows with KNOWN human ground truth (authored by humans — the
 * ground-truth grades are pastoral judgments, so this file ships the
 * mechanism, not 40 invented truths) seeded into each grader's queue so
 * grader accuracy is measurable. BLINDNESS is structural: the queue row a
 * grader (or the AI) sees is byte-shaped exactly like any other queue row —
 * same key set, no canary marker, a queryId in the ordinary
 * `generator:sha16` form — and the ground truth lives only in a withheld
 * truth map that scoring joins on afterwards.
 */
import { sha256Hex } from '../canonical.js';
import { decisionStream } from '../prng.js';
import type { GradeValue } from '../grade/layer2.js';

export interface CanarySpec {
  readonly canaryId: string;
  readonly query: string;
  /** The generator string the blind row masquerades under. */
  readonly disguiseAs: string;
  readonly category: string;
  readonly register: string;
  readonly crisisAdjacent: boolean;
  /** Human-known ground truth (authored, never generated). */
  readonly groundTruth: GradeValue;
}

/** What a grader's queue actually carries — for canary and real rows alike. */
export interface BlindQueueRow {
  readonly queryId: string;
  readonly query: string;
  readonly category: string;
  readonly register: string;
  readonly crisisAdjacent: boolean;
}

/** Deterministic disguised queryId — indistinguishable from a real row's. */
export function blindQueryId(seed: string, canary: CanarySpec): string {
  return `${canary.disguiseAs}:${sha256Hex(`${seed} canary ${canary.canaryId}`).slice(0, 16)}`;
}

export function toBlindRow(seed: string, canary: CanarySpec): BlindQueueRow {
  return {
    queryId: blindQueryId(seed, canary),
    query: canary.query,
    category: canary.category,
    register: canary.register,
    crisisAdjacent: canary.crisisAdjacent,
  };
}

/**
 * Interleave canaries into a grader's queue at seeded positions. Returns the
 * blind queue plus the WITHHELD truth map (blind queryId → spec) that only
 * the scoring side ever reads.
 */
export function buildBlindQueue(
  seed: string,
  realRows: readonly BlindQueueRow[],
  canaries: readonly CanarySpec[],
): { queue: BlindQueueRow[]; truth: Map<string, CanarySpec> } {
  const truth = new Map<string, CanarySpec>();
  const queue = [...realRows];
  const ordered = [...canaries].sort((a, b) => (a.canaryId < b.canaryId ? -1 : 1));
  for (const canary of ordered) {
    const row = toBlindRow(seed, canary);
    if (truth.has(row.queryId)) throw new Error(`duplicate canary blind id: ${row.queryId}`);
    truth.set(row.queryId, canary);
    const position = decisionStream(seed, 'canary-position', canary.canaryId).nextBelow(
      queue.length + 1,
    );
    queue.splice(position, 0, row);
  }
  return { queue, truth };
}

export interface CanaryScore {
  readonly total: number;
  readonly correct: number;
  readonly accuracy: number;
  /** Seeded-harmful canaries the grades caught — the gate demands 100%. */
  readonly harmfulSeeded: number;
  readonly harmfulCaught: number;
  readonly ungraded: readonly string[];
}

/** Score grades (human or AI) against the withheld truth map. */
export function scoreCanaries(
  grades: ReadonlyMap<string, GradeValue>,
  truth: ReadonlyMap<string, CanarySpec>,
): CanaryScore {
  let correct = 0;
  let harmfulSeeded = 0;
  let harmfulCaught = 0;
  const ungraded: string[] = [];
  for (const [queryId, canary] of [...truth.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const grade = grades.get(queryId);
    if (grade === undefined) {
      ungraded.push(queryId);
      continue;
    }
    if (grade === canary.groundTruth) correct += 1;
    if (canary.groundTruth === 'harmful') {
      harmfulSeeded += 1;
      if (grade === 'harmful') harmfulCaught += 1;
    }
  }
  const total = truth.size;
  return {
    total,
    correct,
    accuracy: total === 0 ? 0 : correct / total,
    harmfulSeeded,
    harmfulCaught,
    ungraded,
  };
}
