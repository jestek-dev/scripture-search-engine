/**
 * The gap miner — distillates in, Gap Report + master-record update out.
 *
 * Everything here is offline analysis. Nothing this module produces feeds
 * any runtime: the report is read by a human, the master record is a
 * committed memory, and the only path from either to a shipped ranking is
 * a hand-written concept pack through the gauntlet
 * (docs/telemetry-and-gap-mining.md §2).
 *
 * Replay is the miner's spine. Because ordering is deterministic, the miner
 * re-runs every logged query against the exact artifact identity the user
 * saw and reconstructs their result list — so conversions can be
 * rank-verified rather than trusted, and a logged rank that disagrees with
 * replay flags the row instead of polluting the evidence. An identity no
 * provided artifact can reproduce (different engine version, different
 * fingerprints) is counted unreplayable and its conversions are never
 * treated as verified: "cannot check" and "checked" stay different numbers.
 */

import { significantWords, type ScriptureEngine } from '@jestek-dev/scripture-engine';

import type { SensitiveMatcher } from './categories.js';
import type {
  Distillate,
  GapCluster,
  GapReport,
  GapVerdict,
  TelemetryApp,
  TelemetryBudgets,
} from './types.js';
import { assertSingleVersion, queryEventCount } from './validate.js';

/** Cluster key: the shared tokenizer's view of the query — one tokenizer, non-negotiable #4. */
export function clusterSignature(query: string): string {
  const tokens = significantWords(query);
  return tokens.length > 0 ? tokens.join(' ') : query.trim().toLowerCase();
}

interface ReplayedList {
  /** targetId → 1-based rank, exactly as a consumer displays it. */
  readonly ranks: ReadonlyMap<string, number>;
  /** targetId → human reference label, for the report. */
  readonly references: ReadonlyMap<string, string>;
  readonly replayable: boolean;
}

async function replay(engines: readonly ScriptureEngine[], identity: { engineVersion: string; corpusFingerprint: string; layerFingerprint: string }, query: string): Promise<ReplayedList> {
  // All three identities must match — an artifact with the right corpus but
  // a different engine version is not guaranteed to reproduce the ordering
  // the user saw, and a replay that might differ silently is worse than none.
  const engine = engines.find(
    (candidate) =>
      candidate.engineVersion === identity.engineVersion &&
      candidate.corpusFingerprint === identity.corpusFingerprint &&
      candidate.layerFingerprint === identity.layerFingerprint,
  );
  if (!engine) return { ranks: new Map(), references: new Map(), replayable: false };

  const result = await engine.research(query);
  if (result.kind !== 'discovery') {
    // The query resolves as a reference (or typed-invalid) on this artifact.
    // Distillates exclude reference outcomes, so this is an oddity worth
    // flagging rather than a list worth ranking.
    return { ranks: new Map(), references: new Map(), replayable: false };
  }
  const ranks = new Map<string, number>();
  const references = new Map<string, string>();
  result.results.forEach((row, index) => {
    ranks.set(row.targetId, index + 1);
    references.set(row.targetId, row.reference);
  });
  return { ranks, references, replayable: true };
}

const VERDICT_ORDER: readonly GapVerdict[] = ['MISS', 'RENAMED', 'WEAK', 'SATISFIED'];

export interface MineResult {
  readonly report: GapReport;
  readonly markdown: string;
}

export async function mine(
  distillates: readonly Distillate[],
  engines: readonly ScriptureEngine[],
  budgets: TelemetryBudgets,
  sensitive: SensitiveMatcher,
): Promise<MineResult> {
  assertSingleVersion(distillates);

  const periods = new Set(distillates.map((distillate) => distillate.period));
  if (periods.size > 1) {
    throw new Error(`one audit, one period: got ${[...periods].sort().join(', ')}. Audit periods separately.`);
  }
  const period = distillates[0]?.period ?? 'unknown';
  const apps = [...new Set(distillates.map((distillate) => distillate.app))].sort() as TelemetryApp[];
  const allTokens = new Set(distillates.map((distillate) => distillate.token));

  // ---- gather, defensively re-filtering categories ----------------------
  // The shim should never have exported these; the miner drops any that
  // arrive anyway, because a device's list may lag the repo's (§4.5).
  let sensitiveDropped = 0;
  let rankMismatch = 0;
  let unreplayable = 0;

  interface ClusterAccumulator {
    signature: string;
    forms: Map<string, { devices: Set<string>; events: number }>;
    devices: Set<string>;
    outcomes: { empty: number; abandoned: number; converted: number };
    conversions: Map<string, { target: string; reference: string; rank: number; count: number }>;
    pairs: Map<string, { from: string; to: string; devices: Set<string>; count: number }>;
  }
  const clusters = new Map<string, ClusterAccumulator>();
  const clusterOf = (signature: string): ClusterAccumulator => {
    let cluster = clusters.get(signature);
    if (!cluster) {
      cluster = {
        signature,
        forms: new Map(),
        devices: new Set(),
        outcomes: { empty: 0, abandoned: 0, converted: 0 },
        conversions: new Map(),
        pairs: new Map(),
      };
      clusters.set(signature, cluster);
    }
    return cluster;
  };

  for (const distillate of distillates) {
    for (const row of distillate.queries) {
      if (sensitive.isSensitive(row.query)) {
        sensitiveDropped += 1;
        continue;
      }
      const cluster = clusterOf(clusterSignature(row.query));
      cluster.devices.add(distillate.token);
      const form = cluster.forms.get(row.query) ?? { devices: new Set<string>(), events: 0 };
      form.devices.add(distillate.token);
      form.events += queryEventCount(row);
      cluster.forms.set(row.query, form);
      cluster.outcomes.empty += row.outcomes.empty;
      cluster.outcomes.abandoned += row.outcomes.abandoned;
      cluster.outcomes.converted += row.outcomes.converted;

      // Replay once per row; verify every claimed conversion against it.
      const replayed = await replay(engines, row.identity, row.query);
      for (const conversion of row.conversions) {
        if (!replayed.replayable) {
          unreplayable += conversion.count;
          continue;
        }
        const replayedRank = replayed.ranks.get(conversion.target);
        if (replayedRank !== conversion.rank) {
          // Consumer bug or identity mismatch — either way, not evidence.
          rankMismatch += conversion.count;
          continue;
        }
        const key = `${conversion.target} ${conversion.rank}`;
        const existing = cluster.conversions.get(key);
        if (existing) existing.count += conversion.count;
        else {
          cluster.conversions.set(key, {
            target: conversion.target,
            reference: replayed.references.get(conversion.target) ?? conversion.target,
            rank: conversion.rank,
            count: conversion.count,
          });
        }
      }
    }

    for (const pair of distillate.pairs) {
      // Both ends screened: a sensitive query must not surface as either
      // half of a pair, which would be the same leak wearing a preposition.
      if (sensitive.isSensitive(pair.from) || sensitive.isSensitive(pair.to)) {
        sensitiveDropped += 1;
        continue;
      }
      const cluster = clusterOf(clusterSignature(pair.from));
      const key = `${pair.from} -> ${pair.to}`;
      const existing = cluster.pairs.get(key);
      if (existing) {
        existing.devices.add(distillate.token);
        existing.count += pair.count;
      } else {
        cluster.pairs.set(key, { from: pair.from, to: pair.to, devices: new Set([distillate.token]), count: pair.count });
      }
    }
  }

  // ---- threshold, verdict, order ---------------------------------------
  const admitted: GapCluster[] = [];
  let belowThreshold = 0;
  for (const cluster of clusters.values()) {
    if (cluster.devices.size < budgets.minDistinctDevices) {
      belowThreshold += 1;
      continue;
    }
    // Pairs are held to the SAME device threshold as query strings: a pair
    // names two query strings, and the suppression rule ("no below-threshold
    // string is ever emitted") would be fiction if a pair could smuggle one.
    const pairs = [...cluster.pairs.values()]
      .filter((pair) => pair.devices.size >= budgets.minDistinctDevices)
      .map((pair) => ({ from: pair.from, to: pair.to, devices: pair.devices.size, count: pair.count }))
      .sort((a, b) => (a.from !== b.from ? (a.from < b.from ? -1 : 1) : a.to < b.to ? -1 : 1));

    const conversions = [...cluster.conversions.values()].sort((a, b) => a.rank - b.rank || (a.target < b.target ? -1 : 1));
    const bestRank = conversions[0]?.rank;
    const verdict: GapVerdict =
      conversions.length > 0
        ? bestRank !== undefined && bestRank <= budgets.weakConvertedRank
          ? 'SATISFIED'
          : 'WEAK'
        : pairs.length > 0
          ? 'RENAMED'
          : 'MISS';

    admitted.push({
      verdict,
      signature: cluster.signature,
      forms: [...cluster.forms.entries()]
        .map(([query, form]) => ({ query, devices: form.devices.size, events: form.events }))
        .sort((a, b) => b.devices - a.devices || (a.query < b.query ? -1 : 1)),
      devices: cluster.devices.size,
      outcomes: { ...cluster.outcomes },
      conversions,
      pairs,
    });
  }

  // Ordered by verdict, then ALPHABETICALLY within it — never by volume.
  // A frequency sort curates the head and starves the tail, which is the
  // editorial form of the feedback loop (§6, "the tail gets a standing
  // section"; research note §3).
  admitted.sort((a, b) => {
    const order = VERDICT_ORDER.indexOf(a.verdict) - VERDICT_ORDER.indexOf(b.verdict);
    return order !== 0 ? order : a.signature < b.signature ? -1 : 1;
  });

  const zeroConversion = admitted.filter((cluster) => cluster.outcomes.converted === 0).length;
  const report: GapReport = {
    period,
    apps,
    devices: allTokens.size,
    clusters: admitted,
    suppressed: { belowThreshold, sensitiveDropped },
    flagged: { rankMismatch, unreplayable },
    zeroConversionRate: admitted.length > 0 ? zeroConversion / admitted.length : 0,
  };

  return { report, markdown: renderMarkdown(report, budgets) };
}

const SUGGESTED_MOVE: Record<GapVerdict, string> = {
  MISS: 'concept pack — fixture first',
  RENAMED: 'lexicon entry anchored where the reformulation converted — fixture first',
  WEAK: 'check anchor weights / concept coverage',
  SATISFIED: 'none — do not touch',
};

function renderMarkdown(report: GapReport, budgets: TelemetryBudgets): string {
  const lines: string[] = [];
  lines.push(`# Gap Report — ${report.period}`);
  lines.push('');
  lines.push(`${report.apps.length} app(s) [${report.apps.join(', ')}], ${report.devices} distinct device(s).`);
  lines.push('');
  lines.push('A verdict names where to look, not what to do: every fix goes fixture-first');
  lines.push('through the admission gauntlet, and `NO MEASURABLE EFFECT` still rejects it.');
  lines.push('');
  lines.push('| Verdict | Query cluster (forms by devices) | Devices | Evidence | Suggested move |');
  lines.push('|---|---|---|---|---|');
  for (const cluster of report.clusters) {
    const forms = cluster.forms.map((form) => `"${form.query}" (${form.devices})`).join(' · ');
    const evidence: string[] = [];
    if (cluster.outcomes.empty > 0) evidence.push(`${cluster.outcomes.empty} empty`);
    if (cluster.outcomes.abandoned > 0) evidence.push(`${cluster.outcomes.abandoned} abandoned`);
    if (cluster.conversions.length > 0) {
      evidence.push(
        `converted: ${cluster.conversions.map((conversion) => `${conversion.reference} @${conversion.rank}×${conversion.count}`).join(', ')}`,
      );
    }
    for (const pair of cluster.pairs) {
      evidence.push(`pair: "${pair.from}" → "${pair.to}" (${pair.devices} devices)`);
    }
    lines.push(
      `| ${cluster.verdict} | ${forms} | ${cluster.devices} | ${evidence.join('; ') || '—'} | ${SUGGESTED_MOVE[cluster.verdict]} |`,
    );
  }
  lines.push('');
  lines.push(
    `Suppressed: ${report.suppressed.belowThreshold} cluster(s) below the ${budgets.minDistinctDevices}-device threshold; ` +
      `${report.suppressed.sensitiveDropped} sensitive-category row(s) dropped defensively. Neither is named, by design.`,
  );
  lines.push(
    `Flagged and excluded from evidence: ${report.flagged.rankMismatch} conversion(s) whose logged rank disagreed with replay; ` +
      `${report.flagged.unreplayable} conversion(s) whose artifact identity no provided artifact reproduces.`,
  );
  lines.push('');
  lines.push('## Metrics');
  lines.push('');
  lines.push(`- zero-conversion rate: **${(report.zeroConversionRate * 100).toFixed(1)}%** of ${report.clusters.length} cluster(s)`);
  const converted = report.clusters.flatMap((cluster) => cluster.conversions);
  const atOne = converted.filter((conversion) => conversion.rank === 1).reduce((sum, conversion) => sum + conversion.count, 0);
  const total = converted.reduce((sum, conversion) => sum + conversion.count, 0);
  lines.push(`- verified conversions: ${total}, of which ${atOne} at rank 1`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

// ---- master analyzed record ---------------------------------------------
// Jesse's two-document model (§6b): this is the one that is KEPT. Every
// string in it already cleared the device threshold and the category filter.

export interface MasterRecord {
  readonly v: 1;
  readonly audits: readonly { period: string; apps: readonly string[]; devices: number; clusters: number; zeroConversionRate: number }[];
  readonly clusters: Readonly<Record<string, {
    readonly forms: Readonly<Record<string, { devices: number; events: number }>>;
    readonly outcomes: { empty: number; abandoned: number; converted: number };
    readonly conversions: readonly { target: string; reference: string; rank: number; count: number }[];
    readonly pairs: readonly { from: string; to: string; count: number }[];
    readonly verdicts: Readonly<Record<string, GapVerdict>>;
  }>>;
}

export function updateMasterRecord(previous: MasterRecord | null, report: GapReport): MasterRecord {
  const base: MasterRecord = previous ?? { v: 1, audits: [], clusters: {} };
  if (base.audits.some((audit) => audit.period === report.period)) {
    throw new Error(
      `master record already holds audit ${report.period} — an audit is recorded once. ` +
        'Re-running it would double-count; if the audit was wrong, revert the record in git first.',
    );
  }

  const clusters: Record<string, {
    forms: Record<string, { devices: number; events: number }>;
    outcomes: { empty: number; abandoned: number; converted: number };
    conversions: { target: string; reference: string; rank: number; count: number }[];
    pairs: { from: string; to: string; count: number }[];
    verdicts: Record<string, GapVerdict>;
  }> = {};
  for (const [signature, cluster] of Object.entries(base.clusters)) {
    clusters[signature] = {
      forms: { ...cluster.forms },
      outcomes: { ...cluster.outcomes },
      conversions: cluster.conversions.map((conversion) => ({ ...conversion })),
      pairs: cluster.pairs.map((pair) => ({ ...pair })),
      verdicts: { ...cluster.verdicts },
    };
  }

  for (const reported of report.clusters) {
    const cluster = clusters[reported.signature] ?? {
      forms: {},
      outcomes: { empty: 0, abandoned: 0, converted: 0 },
      conversions: [],
      pairs: [],
      verdicts: {},
    };
    for (const form of reported.forms) {
      const existing = cluster.forms[form.query] ?? { devices: 0, events: 0 };
      // Devices are per-period tokens and cannot be deduplicated across
      // audits (rotation is the privacy property, §5a), so the master keeps
      // the MAXIMUM single-audit attestation — "at least this many devices
      // in one period" stays true forever — while events accumulate.
      cluster.forms[form.query] = {
        devices: Math.max(existing.devices, form.devices),
        events: existing.events + form.events,
      };
    }
    cluster.outcomes.empty += reported.outcomes.empty;
    cluster.outcomes.abandoned += reported.outcomes.abandoned;
    cluster.outcomes.converted += reported.outcomes.converted;
    for (const conversion of reported.conversions) {
      const existing = cluster.conversions.find((row) => row.target === conversion.target && row.rank === conversion.rank);
      if (existing) existing.count += conversion.count;
      else cluster.conversions.push({ ...conversion });
    }
    for (const pair of reported.pairs) {
      const existing = cluster.pairs.find((row) => row.from === pair.from && row.to === pair.to);
      if (existing) existing.count += pair.count;
      else cluster.pairs.push({ from: pair.from, to: pair.to, count: pair.count });
    }
    cluster.verdicts[report.period] = reported.verdict;
    clusters[reported.signature] = cluster;
  }

  // Canonical ordering throughout, so the committed record diffs cleanly.
  const sortedClusters: MasterRecord['clusters'] = Object.fromEntries(
    Object.entries(clusters)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([signature, cluster]) => [
        signature,
        {
          forms: Object.fromEntries(Object.entries(cluster.forms).sort(([a], [b]) => (a < b ? -1 : 1))),
          outcomes: cluster.outcomes,
          conversions: [...cluster.conversions].sort((a, b) => a.rank - b.rank || (a.target < b.target ? -1 : 1)),
          pairs: [...cluster.pairs].sort((a, b) => (a.from !== b.from ? (a.from < b.from ? -1 : 1) : a.to < b.to ? -1 : 1)),
          verdicts: Object.fromEntries(Object.entries(cluster.verdicts).sort(([a], [b]) => (a < b ? -1 : 1))),
        },
      ]),
  );

  return {
    v: 1,
    audits: [
      ...base.audits,
      {
        period: report.period,
        apps: [...report.apps],
        devices: report.devices,
        clusters: report.clusters.length,
        zeroConversionRate: report.zeroConversionRate,
      },
    ].sort((a, b) => (a.period < b.period ? -1 : 1)),
    clusters: sortedClusters,
  };
}
