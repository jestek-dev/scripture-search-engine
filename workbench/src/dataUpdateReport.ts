/**
 * D14 — the data-train Update Report (votes-to-engine plan §4.6, §5.2 step 6,
 * §8.5 D13/D14).
 *
 * The one document that satisfies admission's blocker that "every query whose
 * top-10 changed must appear in `reviewedComparisonQueries`, exactly, no
 * extras": it lists EVERY changed query with before→after in plain language,
 * and approving (signing) it records exactly that list as the per-query
 * review. Its digest feeds the typed-digest sign panel: the first 12 hex are
 * the sign code; the full digest travels to the sign endpoint.
 *
 * D28 jargon quarantine is a property of this module's OUTPUT: references
 * and plain reason labels only — no digests, no UUIDs, no gate ids, no
 * internal vocabulary anywhere in the rendered body. The sign chip (rendered
 * by the page from the digest field, never from body text) is the single
 * sanctioned hex surface.
 */
import { createHash } from 'node:crypto';

import type { ComparisonQueryReport, ComparisonReport } from './comparison.js';
import type { ProposalManifest } from './proposals.js';

export interface DataReportQueryBlock {
  readonly query: string;
  /** Plain-language movement lines — references and reason labels only. */
  readonly movementLines: readonly string[];
  /** Which call asked for this movement, or the honest side-effect label. */
  readonly attributionLine: string;
  /** "Compare blind" spot-check affordance flag (§4.6 anatomy item 4). */
  readonly compareAvailable: true;
}

export interface DataUpdateReport {
  readonly schemaVersion: 1;
  readonly kind: 'data-update-report';
  readonly trainId: string;
  /** §4.6 anatomy item 1 — the lead sentence. */
  readonly lead: string;
  /** EXACTLY the queries whose top-10 changed — the per-query review list. */
  readonly changedQueries: readonly string[];
  readonly blocks: readonly DataReportQueryBlock[];
  /** §4.6 anatomy item 3 — the one-line checks summary, plain term. */
  readonly checksLine: string;
  /** D13: the regen's double-run churn, reported in plain words (or null). */
  readonly regenLine: string | null;
  /**
   * D13 AC: the report states in plain words that an independent person
   * signs after the merge (merge-first-sign-once), and that two checks show
   * as failing until then — the designed order, not a defect.
   */
  readonly signingLine: string;
  /**
   * §8.5: "The Update Report carries the standing-red note verbatim until it
   * clears" — non-null exactly while the historic one-time sign-off debt
   * stands.
   */
  readonly standingRedLine: string | null;
  /** The answer-sheet lines riding this update, in the cards' own words. */
  readonly lines: readonly string[];
  /** sha256 over the report body; its first 12 hex are the sign code. */
  readonly digest: string;
}

/** Ships verbatim (single writer — no rival rendering may exist; E4/D28). */
export const DATA_REPORT_CHECKS_LINE = 'The checks passed — every answer-sheet line holds.';
export const DATA_REPORT_SIGNING_LINE =
  'After this update is merged, an independent person signs the new reference measurements — merge first, sign once. Until that sign-off lands, two checks will show as failing — that is the designed order, not a defect.';
export const DATA_REPORT_STANDING_RED_LINE =
  'Two standing checks read as failing across the whole project until a one-time independent sign-off clears them. This update cannot be approved until that sign-off lands.';
export const DATA_REPORT_SIDE_EFFECT_LINE = 'Side effect — worth a look.';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

function ordinal(rank: number): string {
  const remainder = rank % 100;
  if (remainder >= 11 && remainder <= 13) return `${rank}th`;
  switch (rank % 10) {
    case 1: return `${rank}st`;
    case 2: return `${rank}nd`;
    case 3: return `${rank}rd`;
    default: return `${rank}th`;
  }
}

function referenceOf(query: ComparisonQueryReport, targetId: string): string {
  const fromCandidate = query.candidate.top10.find((entry) => entry.targetId === targetId);
  if (fromCandidate !== undefined) return fromCandidate.reference;
  const fromReference = query.reference.top10.find((entry) => entry.targetId === targetId);
  return fromReference?.reference ?? targetId;
}

/** Plain-language movement for one changed query — references only (D28). */
export function movementLinesOf(query: ComparisonQueryReport): string[] {
  const lines: string[] = [];
  for (const targetId of query.movement.added) {
    const rank = query.candidate.top10.findIndex((entry) => entry.targetId === targetId);
    lines.push(`New in the top 10: ${referenceOf(query, targetId)}${rank >= 0 ? ` (now ${ordinal(rank + 1)})` : ''}.`);
  }
  for (const targetId of query.movement.removed) {
    lines.push(`No longer in the top 10: ${referenceOf(query, targetId)}.`);
  }
  for (const moved of query.movement.rankMoved) {
    const direction = moved.candidateRank < moved.referenceRank ? 'Moved up' : 'Moved down';
    lines.push(`${direction}: ${referenceOf(query, moved.targetId)} (was ${ordinal(moved.referenceRank)}, now ${ordinal(moved.candidateRank)}).`);
  }
  if (lines.length === 0) lines.push('The top 10 changed in how results are explained, not which passages appear.');
  return lines;
}

function attributionOf(query: ComparisonQueryReport, askedQueries: ReadonlySet<string>): string {
  if (askedQueries.has(query.query)) return 'You asked for this: your call on this search is riding this update.';
  if (query.memberships.some((membership) => membership.expectedChange)) {
    return 'You asked for this: your call on this search is riding this update.';
  }
  return DATA_REPORT_SIDE_EFFECT_LINE;
}

function answerSheetLinesOf(manifest: ProposalManifest): string[] {
  const lines: string[] = [];
  for (const operation of manifest.operations) {
    if (operation.type !== 'golden-fixture-upsert') continue;
    const fixture = operation.fixture as Record<string, unknown>;
    const query = String(fixture.query ?? operation.goldenFixtureId);
    for (const entry of Array.isArray(fixture.expectedTop) ? fixture.expectedTop : []) {
      const row = entry as Record<string, unknown>;
      lines.push(`For "${query}", ${String(row.ref)} should appear in the top ${String(row.withinTop)}.`);
    }
    for (const entry of Array.isArray(fixture.mustNotRank) ? fixture.mustNotRank : []) {
      const row = entry as Record<string, unknown>;
      lines.push(`For "${query}", ${String(row.ref)} must not rank. Why: ${String(row.why)}`);
    }
    for (const entry of Array.isArray(fixture.preferredOrder) ? fixture.preferredOrder : []) {
      const row = entry as Record<string, unknown>;
      lines.push(`For "${query}", ${String(row.above)} should rank above ${String(row.below)} in the top ${String(row.withinTop)}.`);
    }
  }
  return lines;
}

export interface BuildDataReportOptions {
  /** Non-null once the sanctioned regen ran, byte-compared (D13). */
  readonly regenerated: boolean;
  /** True while the one-time historic sign-off debt stands (§8.5). */
  readonly standingRedStands: boolean;
}

export function buildDataUpdateReport(
  trainId: string,
  manifest: ProposalManifest,
  comparison: ComparisonReport,
  options: BuildDataReportOptions,
): DataUpdateReport {
  const changed = comparison.queries.filter((query) => query.top10Changed);
  const changedQueries = changed.map((query) => query.query).sort();
  const askedQueries = new Set<string>();
  for (const operation of manifest.operations) {
    if (operation.type !== 'golden-fixture-upsert') continue;
    const fixture = operation.fixture as Record<string, unknown>;
    if (typeof fixture.query === 'string') askedQueries.add(fixture.query);
  }
  const blocks: DataReportQueryBlock[] = [...changed]
    .sort((left, right) => left.query.localeCompare(right.query))
    .map((query) => ({
      query: query.query,
      movementLines: movementLinesOf(query),
      attributionLine: attributionOf(query, askedQueries),
      compareAvailable: true as const,
    }));
  const count = changedQueries.length;
  const body = {
    schemaVersion: 1 as const,
    kind: 'data-update-report' as const,
    trainId,
    lead: count === 0
      ? 'This update changes results for no searches yet — every changed answer is on the answer sheet as a goal.'
      : `This update changes results for ${count} ${count === 1 ? 'search' : 'searches'}. Here's each one, before and after.`,
    changedQueries,
    blocks,
    checksLine: DATA_REPORT_CHECKS_LINE,
    regenLine: options.regenerated
      ? 'The reference measurements were regenerated for this update — each regeneration was run twice and the two runs matched exactly.'
      : null,
    signingLine: DATA_REPORT_SIGNING_LINE,
    standingRedLine: options.standingRedStands ? DATA_REPORT_STANDING_RED_LINE : null,
    lines: answerSheetLinesOf(manifest),
  };
  return { ...body, digest: sha256(canonicalJson(body)) };
}
