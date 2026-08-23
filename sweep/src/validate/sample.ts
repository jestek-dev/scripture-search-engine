/**
 * Layer-3 seeded stratified sampler + workload ceiling (MS-9).
 *
 * The strata, verbatim from the plan (volume-grounded first):
 *   (a) 100% of AI-harmful and escalate rows — DUAL-graded, never sampled,
 *       never shrunk;
 *   (b) crisisAdjacent TIERED — Tier A (crisis ∧ defect/weak/escalate/
 *       watchlist-adjacent) 100% dual-graded; Tier B (clean-looking) a
 *       seeded single-graded sample (size = graderWorkload.tierBSample,
 *       null until J43); any concern promotes to Tier A. The tier BOUNDARY
 *       is Jesse's ratified choice (J67), never this tooling's — the
 *       predicate below implements the plan's stated boundary PENDING J67;
 *   (c) 25 rows per battery-category×grade cell (plan protocol constant);
 *   (d) flat random 1,500 — the exit-bar estimation sample (MS-14 cites
 *       this exact sample);
 *   (e) blind seeded canaries with known ground truth (canary.ts).
 *
 * Workload is priced and capped: hard ceiling rows/grader/episode
 * (graderWorkload.ceilingRowsPerEpisode, null until J43) with a defined
 * shrink order — cells first, then Tier B — that NEVER shrinks strata (a),
 * Tier A, canaries, or exit-singles. If the never-shrink set alone exceeds
 * the ceiling the episode HALTS and escalates: this tooling does not
 * silently sample harmful or crisis rows to fit a budget.
 *
 * Determinism: every draw uses a counter-based decision stream keyed by the
 * sampling site, so the plan is byte-identical across runs and STABLE UNDER
 * EXTENSION (adding rows never reshuffles unrelated decisions).
 */
import { decisionStream } from '../prng.js';
import type { GradeValue } from '../grade/layer2.js';

/** Plan protocol constants (MS-9 approach text; the episode itself NEEDS
 *  JESSE, so these ride the protocol he runs, not a silent tooling choice). */
export const PER_CELL_QUOTA = 25;
export const EXIT_SAMPLE_SIZE = 1500;
export const CANARY_COUNT = 40;

/** One graded row as the sampler sees it (joined from Layer-1/Layer-2). */
export interface ValidationRow {
  readonly queryId: string;
  readonly category: string;
  readonly register: string;
  readonly crisisAdjacent: boolean;
  readonly layer1: 'pass' | 'defect' | 'needs-ai-grade';
  /** Sole-weak-evidence signal from Layer-1. */
  readonly weakEvidence?: boolean;
  /** Result set touches the negative-context watchlist. */
  readonly watchlistAdjacent?: boolean;
  /** Present when the row was Layer-2 AI-graded. */
  readonly aiGrade?: GradeValue;
  readonly aiEscalate?: boolean;
}

export type StratumName = 'harmful-escalate' | 'tier-a' | 'tier-b' | 'cell' | 'exit';

export interface PlannedRow {
  readonly queryId: string;
  readonly strata: readonly StratumName[];
  /** dual = both graders, blind to each other and to the AI. */
  readonly mode: 'dual' | 'single';
  /** Single rows only: which grader's queue carries it. */
  readonly assignedTo?: 0 | 1;
}

export interface SamplerConfig {
  readonly seed: string;
  /** graderWorkload.tierBSample — J43-signed (or an explicit shakedown value). */
  readonly tierBSample: number;
  /** graderWorkload.ceilingRowsPerEpisode — J43-signed (or explicit shakedown). */
  readonly ceilingRowsPerEpisode: number;
  readonly perCellQuota?: number;
  readonly exitSampleSize?: number;
  /** Canaries ride BOTH graders' queues blind; they count against the ceiling. */
  readonly canaryCount?: number;
}

export type EpisodePlan =
  | {
      readonly halted: false;
      readonly rows: readonly PlannedRow[];
      readonly workload: { readonly grader0: number; readonly grader1: number };
      readonly shrink: { readonly cellsDropped: number; readonly tierBDropped: number };
      readonly counts: Record<StratumName, number>;
    }
  | { readonly halted: true; readonly reason: string };

/** Stratum (a): 100% of AI-harmful and escalate rows. */
export function isHarmfulOrEscalate(row: ValidationRow): boolean {
  return row.aiGrade === 'harmful' || row.aiEscalate === true;
}

/**
 * Tier A boundary — the plan's stated predicate, PENDING J67 (Jesse
 * ratifies the tiers; tooling never redraws this line on its own):
 * crisis ∧ (defect ∨ weak ∨ escalate ∨ watchlist-adjacent).
 */
export function isTierA(row: ValidationRow): boolean {
  return (
    row.crisisAdjacent &&
    (row.layer1 === 'defect' ||
      row.weakEvidence === true ||
      row.aiEscalate === true ||
      row.watchlistAdjacent === true)
  );
}

function byQueryId(a: { queryId: string }, b: { queryId: string }): number {
  return a.queryId < b.queryId ? -1 : a.queryId > b.queryId ? 1 : 0;
}

/** Grade axis for the category×grade cells: AI grade when present, else the
 *  Layer-1 outcome (pass rows have no AI grade by design). */
export function gradeKeyOf(row: ValidationRow): string {
  return row.aiGrade ?? `layer1-${row.layer1}`;
}

export function planEpisode(rows: readonly ValidationRow[], config: SamplerConfig): EpisodePlan {
  const perCellQuota = config.perCellQuota ?? PER_CELL_QUOTA;
  const exitSampleSize = config.exitSampleSize ?? EXIT_SAMPLE_SIZE;
  const canaryCount = config.canaryCount ?? CANARY_COUNT;
  const sorted = [...rows].sort(byQueryId);
  const seen = new Set<string>();
  for (const row of sorted) {
    if (seen.has(row.queryId)) throw new Error(`duplicate queryId in sampler input: ${row.queryId}`);
    seen.add(row.queryId);
  }

  const strataOf = new Map<string, Set<StratumName>>();
  const claim = (queryId: string, stratum: StratumName): void => {
    const existing = strataOf.get(queryId) ?? new Set<StratumName>();
    existing.add(stratum);
    strataOf.set(queryId, existing);
  };

  // (a) — 100%, dual, never shrunk.
  const stratumA = sorted.filter(isHarmfulOrEscalate);
  for (const row of stratumA) claim(row.queryId, 'harmful-escalate');

  // (b) Tier A — 100%, dual, never shrunk. Rows already in (a) stay in (a).
  const tierA = sorted.filter((row) => !strataOf.has(row.queryId) && isTierA(row));
  for (const row of tierA) claim(row.queryId, 'tier-a');

  // (b) Tier B — clean-looking crisis rows, seeded single-graded sample.
  const tierBPool = sorted.filter((row) => !strataOf.has(row.queryId) && row.crisisAdjacent);
  const tierB = decisionStream(config.seed, 'layer3', 'tier-b').sample(tierBPool, config.tierBSample);
  for (const row of tierB) claim(row.queryId, 'tier-b');

  // (c) category×grade cells — seeded per-cell so cells are independent.
  const cellPools = new Map<string, ValidationRow[]>();
  for (const row of sorted) {
    if (strataOf.has(row.queryId)) continue;
    const cellKey = `${row.category}×${gradeKeyOf(row)}`;
    const pool = cellPools.get(cellKey) ?? [];
    pool.push(row);
    cellPools.set(cellKey, pool);
  }
  for (const [cellKey, pool] of [...cellPools.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const picked = decisionStream(config.seed, 'layer3', 'cell', cellKey).sample(pool, perCellQuota);
    for (const row of picked) claim(row.queryId, 'cell');
  }

  // (d) flat random exit sample over the WHOLE population (it estimates the
  // population rate, so it may overlap other strata; overlapped rows are
  // graded once and reported in both roles).
  const exit = decisionStream(config.seed, 'layer3', 'exit').sample(sorted, exitSampleSize);
  for (const row of exit) claim(row.queryId, 'exit');

  // Materialize planned rows; dual wherever a dual stratum claims the row.
  const planned = new Map<string, { strata: Set<StratumName>; mode: 'dual' | 'single'; assignedTo?: 0 | 1 }>();
  for (const [queryId, strata] of strataOf) {
    const mode: 'dual' | 'single' =
      strata.has('harmful-escalate') || strata.has('tier-a') ? 'dual' : 'single';
    const entry: { strata: Set<StratumName>; mode: 'dual' | 'single'; assignedTo?: 0 | 1 } = {
      strata,
      mode,
    };
    if (mode === 'single') {
      entry.assignedTo = decisionStream(config.seed, 'layer3', 'assign', queryId).nextBelow(2) as 0 | 1;
    }
    planned.set(queryId, entry);
  }

  const workload = (): { grader0: number; grader1: number } => {
    let grader0 = canaryCount;
    let grader1 = canaryCount;
    for (const entry of planned.values()) {
      if (entry.mode === 'dual') {
        grader0 += 1;
        grader1 += 1;
      } else if (entry.assignedTo === 0) grader0 += 1;
      else grader1 += 1;
    }
    return { grader0, grader1 };
  };

  // Never-shrink load: duals + canaries + exit-singles. If that alone
  // exceeds the ceiling, HALT — never silently sample harmful/crisis rows.
  const neverShrink = { grader0: canaryCount, grader1: canaryCount };
  for (const entry of planned.values()) {
    const isShrinkable =
      entry.mode === 'single' &&
      !entry.strata.has('exit') &&
      (entry.strata.has('cell') || entry.strata.has('tier-b'));
    if (isShrinkable) continue;
    if (entry.mode === 'dual') {
      neverShrink.grader0 += 1;
      neverShrink.grader1 += 1;
    } else if (entry.assignedTo === 0) neverShrink.grader0 += 1;
    else neverShrink.grader1 += 1;
  }
  if (Math.max(neverShrink.grader0, neverShrink.grader1) > config.ceilingRowsPerEpisode) {
    return {
      halted: true,
      reason:
        `HALT: the never-shrink set (harmful/escalate duals, Tier A duals, canaries, exit-singles) ` +
        `alone needs ${Math.max(neverShrink.grader0, neverShrink.grader1)} rows/grader against a ceiling of ` +
        `${config.ceilingRowsPerEpisode}. The episode escalates to Jesse — the tooling does not silently ` +
        `sample harmful or crisis rows to fit a budget (J67).`,
    };
  }

  // Defined shrink order: per-cell quota rows first, then Tier B; only rows
  // NOT also in the exit sample are eligible.
  const shrink = { cellsDropped: 0, tierBDropped: 0 };
  const shrinkable = (stratum: 'cell' | 'tier-b', grader: 0 | 1): string | undefined => {
    const candidates = [...planned.entries()]
      .filter(
        ([, entry]) =>
          entry.mode === 'single' &&
          entry.assignedTo === grader &&
          !entry.strata.has('exit') &&
          entry.strata.has(stratum),
      )
      .map(([queryId]) => queryId)
      .sort();
    return candidates[candidates.length - 1];
  };
  for (;;) {
    const load = workload();
    if (Math.max(load.grader0, load.grader1) <= config.ceilingRowsPerEpisode) break;
    const overloaded: 0 | 1 = load.grader0 >= load.grader1 ? 0 : 1;
    const cellDrop = shrinkable('cell', overloaded);
    if (cellDrop !== undefined) {
      planned.delete(cellDrop);
      shrink.cellsDropped += 1;
      continue;
    }
    const tierBDrop = shrinkable('tier-b', overloaded);
    if (tierBDrop !== undefined) {
      planned.delete(tierBDrop);
      shrink.tierBDropped += 1;
      continue;
    }
    /* istanbul ignore next -- guarded by the never-shrink pre-check above */
    return {
      halted: true,
      reason: 'HALT: over ceiling with nothing shrinkable left — escalate to Jesse (J67).',
    };
  }

  const counts: Record<StratumName, number> = {
    'harmful-escalate': 0,
    'tier-a': 0,
    'tier-b': 0,
    cell: 0,
    exit: 0,
  };
  const outRows: PlannedRow[] = [...planned.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([queryId, entry]) => {
      for (const stratum of entry.strata) counts[stratum] += 1;
      return {
        queryId,
        strata: [...entry.strata].sort(),
        mode: entry.mode,
        ...(entry.assignedTo !== undefined ? { assignedTo: entry.assignedTo } : {}),
      };
    });
  return { halted: false, rows: outRows, workload: workload(), shrink, counts };
}
