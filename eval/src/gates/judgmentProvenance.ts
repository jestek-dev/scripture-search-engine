/**
 * Judgment-label provenance lint (P6.5 / B6, label-provenance half).
 *
 * The plan's rule, verbatim: "every label file carries per-grade provenance
 * (openbible-votes sha-pinned | editorial-grade with grader + date)" and the
 * lint "assert[s] every judgment file names a provenance source and, if
 * openbible-votes, a snapshot sha that matches a pinned manifest."
 *
 * What that means against the LANDED judgment format (the plan's
 * `eval/judgments/` directory predates Phase 1's battery-judgments file; the
 * store is `eval/battery/judgments.json` and this lint covers it rather than
 * forking a second store):
 *
 * - EDITORIAL-GRADE rows are the default class. Their provenance is the
 *   grader + date the schema already requires (`judgedBy`, `judgedAt`) plus
 *   the `basis` citation. The lint re-asserts grader + date independently of
 *   the structural schema check, so provenance can never silently become
 *   optional by a validator refactor.
 * - VOTE-SEEDED rows (the P6.1/B1 seeding, J-gated and not yet landed) are
 *   declared by a `judgedBy` beginning with a vote-source id (today exactly
 *   `openbible-votes`). Such a row MUST carry `voteSnapshotSha256` naming
 *   the exact snapshot the grades were derived from, and that sha MUST
 *   match the pinned manifest for the vote source
 *   (`pipeline/manifests/openbible-topics.json`). Fail-closed both ways: a
 *   vote row without a sha, with a malformed sha, with a sha that matches no
 *   pinned manifest, or a NON-vote row carrying the field, all fail — a
 *   provenance mark that cannot be checked is decoration.
 *
 * Findings ride the G12 instrument-findings channel, so a violation fails
 * the battery roster row in EVERY context (fixture CI legs included) — a
 * judgment file whose provenance is broken must not wait for an artifact
 * run to be noticed. The lint adjudicates nothing about the grades
 * themselves (covenant #6): it checks who says so, never whether they are
 * right, and the judgment schema carries no doctrine-scored field for it
 * to read.
 */

import type { GateFinding } from './types.js';

/**
 * Vote-source ids the lint recognises, mapped to the manifest that pins
 * their snapshot. A `judgedBy` naming a vote source outside this roster is
 * itself a finding: an unrecognised vote source has no pinned sha to check
 * against, so it cannot be admitted as provenance.
 */
export const VOTE_SOURCE_MANIFESTS: ReadonlyMap<string, string> = new Map([
  ['openbible-votes', 'pipeline/manifests/openbible-topics.json'],
]);

const SHA256_HEX = /^[0-9a-f]{64}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function category(code: string): string {
  return `sse.gauntlet.v1.finding.g12-battery.${code}`;
}

function finding(code: string, message: string, subjects?: readonly string[]): GateFinding {
  return { message, categoryCode: category(code), ...(subjects ? { subjects: [...subjects] } : {}) };
}

/**
 * The `judgedBy` prefix that declares a vote-seeded row, or null for an
 * editorial-grade row. Prefix, not equality, so a seeding script can write
 * e.g. "openbible-votes (seeded by eval/scripts/seedGradedLabels.ts)" and
 * still be recognised as a vote row.
 */
export function voteSourceOf(judgedBy: string): string | null {
  for (const source of VOTE_SOURCE_MANIFESTS.keys()) {
    if (judgedBy === source || judgedBy.startsWith(`${source} `) || judgedBy.startsWith(`${source}:`)) {
      return source;
    }
  }
  return null;
}

export interface PinnedVoteSnapshots {
  /**
   * Pinned snapshot sha256 per vote source id, or null when the manifest
   * could not be read — in which case every vote-seeded row fails closed
   * (a sha that cannot be verified is not verified).
   */
  readonly shaBySource: ReadonlyMap<string, string | null>;
}

interface RowLocation {
  readonly location: string;
  readonly subject: string;
}

function lintRow(
  row: Record<string, unknown>,
  { location, subject }: RowLocation,
  pinned: PinnedVoteSnapshots,
  findings: GateFinding[],
): void {
  const judgedBy = row['judgedBy'];
  const judgedAt = row['judgedAt'];
  // Grader + date: the editorial-grade provenance floor for every row.
  if (typeof judgedBy !== 'string' || judgedBy.trim().length === 0) {
    findings.push(finding(
      'provenance-unattributed',
      `${location} names no provenance source — judgedBy must carry a grader or a vote-source id`,
      [subject],
    ));
    return;
  }
  if (typeof judgedAt !== 'string' || judgedAt.trim().length === 0) {
    findings.push(finding(
      'provenance-undated',
      `${location} carries no judgedAt date — provenance is grader + date, not grader alone`,
      [subject],
    ));
  }

  const voteSource = voteSourceOf(judgedBy);
  const mark = row['voteSnapshotSha256'];

  if (voteSource === null) {
    if (mark !== undefined) {
      findings.push(finding(
        'provenance-mark-without-claim',
        `${location} carries voteSnapshotSha256 but judgedBy ("${judgedBy}") names no recognised ` +
          'vote source — a snapshot mark on an editorial-grade row is a provenance claim nothing backs',
        [subject],
      ));
    }
    return;
  }

  // Vote-seeded row: the sha is mandatory and must match the pinned manifest.
  if (typeof mark !== 'string' || !SHA256_HEX.test(mark)) {
    findings.push(finding(
      'provenance-vote-sha-missing',
      `${location} is vote-seeded (judgedBy "${judgedBy}") but carries no valid voteSnapshotSha256 — ` +
        'vote sources must name the pinned snapshot their grades were derived from',
      [subject],
    ));
    return;
  }
  const pinnedSha = pinned.shaBySource.get(voteSource);
  if (pinnedSha === undefined) {
    findings.push(finding(
      'provenance-vote-source-unknown',
      `${location} names vote source "${voteSource}" which has no pinned manifest to check against`,
      [subject],
    ));
    return;
  }
  if (pinnedSha === null) {
    findings.push(finding(
      'provenance-vote-manifest-unreadable',
      `${location} is vote-seeded but the pinned manifest for "${voteSource}" ` +
        `(${VOTE_SOURCE_MANIFESTS.get(voteSource)}) could not be read — failing closed, because an ` +
        'unverifiable snapshot mark is not a verified one',
      [subject],
    ));
    return;
  }
  if (mark !== pinnedSha) {
    findings.push(finding(
      'provenance-vote-sha-mismatch',
      `${location} names snapshot ${mark} but the pinned manifest for "${voteSource}" records ` +
        `${pinnedSha} — vote-seeded grades must be re-derived (and re-reviewed) on a re-pin, ` +
        'never carried across one',
      [subject],
    ));
  }
}

/**
 * Lints one judgments file. Tolerant of structural breakage — a malformed
 * file is the structural validator's finding, not this lint's; anything this
 * lint cannot read it skips, because double-reporting one defect as two
 * findings helps nobody. Deterministic: findings come out in file order.
 */
export function lintJudgmentProvenance(
  judgmentsFile: unknown,
  pinned: PinnedVoteSnapshots,
): readonly GateFinding[] {
  const findings: GateFinding[] = [];
  if (!isRecord(judgmentsFile)) return findings;
  const judgments = judgmentsFile['judgments'];
  if (!isRecord(judgments)) return findings;

  for (const [id, entry] of Object.entries(judgments)) {
    if (!isRecord(entry)) continue;
    const judged = entry['judged'];
    for (const [index, row] of (Array.isArray(judged) ? judged : []).entries()) {
      if (!isRecord(row)) continue;
      lintRow(row, { location: `judgments.${id}.judged[${index}]`, subject: id }, pinned, findings);
    }
    const harmful = entry['harmful'];
    for (const [index, row] of (Array.isArray(harmful) ? harmful : []).entries()) {
      if (!isRecord(row)) continue;
      lintRow(row, { location: `judgments.${id}.harmful[${index}]`, subject: id }, pinned, findings);
    }
    const empty = entry['legitimatelyEmpty'];
    if (isRecord(empty)) {
      lintRow(empty, { location: `judgments.${id}.legitimatelyEmpty`, subject: id }, pinned, findings);
    }
  }
  return findings;
}
