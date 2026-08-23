/**
 * OpenBible.info importers — topical votes and cross-references (CC BY 4.0).
 *
 * Both files are reference + score only; neither contains verse text of any
 * translation, which is what makes them usable at all (the site DISPLAYS
 * ESV, but the downloads do not embed it).
 *
 * Rows that fail to resolve are counted and reported, never silently
 * dropped: a rejected-row count is how you notice a source changed format
 * under you, and OpenBible publishes to a rolling URL with no versioning.
 */

import { parseOsisRange } from '../osis.js';

export interface TopicAnchorRow {
  readonly topic: string;
  readonly startVerseId: number;
  readonly endVerseId: number;
  /** Quality score: percentage-of-votes for the passage, 0-100ish. */
  readonly score: number;
}

export interface CrossReferenceRow {
  readonly fromVerseId: number;
  readonly toStartVerseId: number;
  readonly toEndVerseId: number;
  readonly votes: number;
}

export interface ImportReport {
  readonly accepted: number;
  readonly rejected: number;
  readonly rejectionSamples: readonly string[];
}

const MAX_SAMPLES = 5;

function splitLines(contents: string): string[] {
  return contents.split(/\r?\n/).filter((line) => line.length > 0);
}

/** `Topic \t OSIS \t Quality Score` with one header line. */
export function importTopicScores(contents: string): {
  readonly rows: readonly TopicAnchorRow[];
  readonly report: ImportReport;
} {
  const rows: TopicAnchorRow[] = [];
  const samples: string[] = [];
  let rejected = 0;

  for (const line of splitLines(contents).slice(1)) {
    const parts = line.split('\t');
    if (parts.length < 3) {
      rejected += 1;
      if (samples.length < MAX_SAMPLES) samples.push(line.slice(0, 80));
      continue;
    }
    const range = parseOsisRange(parts[1]!);
    const score = Number(parts[2]);
    if (!range || !Number.isFinite(score)) {
      rejected += 1;
      if (samples.length < MAX_SAMPLES) samples.push(line.slice(0, 80));
      continue;
    }
    rows.push({
      topic: parts[0]!.trim().toLowerCase(),
      startVerseId: range.startVerseId,
      endVerseId: range.endVerseId,
      score,
    });
  }
  return { rows, report: { accepted: rows.length, rejected, rejectionSamples: samples } };
}

/** `From Verse \t To Verse \t Votes` with one header line. */
export function importCrossReferences(
  contents: string,
  minVotes = 1,
): { readonly rows: readonly CrossReferenceRow[]; readonly report: ImportReport } {
  const rows: CrossReferenceRow[] = [];
  const samples: string[] = [];
  let rejected = 0;

  for (const line of splitLines(contents).slice(1)) {
    const parts = line.split('\t');
    if (parts.length < 3) {
      rejected += 1;
      if (samples.length < MAX_SAMPLES) samples.push(line.slice(0, 80));
      continue;
    }
    const from = parseOsisRange(parts[0]!);
    const to = parseOsisRange(parts[1]!);
    const votes = Number(parts[2]);
    if (!from || !to || !Number.isFinite(votes)) {
      rejected += 1;
      if (samples.length < MAX_SAMPLES) samples.push(line.slice(0, 80));
      continue;
    }
    // Negative and zero vote counts exist in the source — the community
    // actively downvoted those edges. Importing them would be importing a
    // judgment that the edge is BAD as though it were evidence it is good.
    if (votes < minVotes) continue;
    rows.push({
      fromVerseId: from.startVerseId,
      toStartVerseId: to.startVerseId,
      toEndVerseId: to.endVerseId,
      votes,
    });
  }
  return { rows, report: { accepted: rows.length, rejected, rejectionSamples: samples } };
}

/**
 * One candidate section span with its translation count (P5.6/CO-3).
 *
 * IMPORTANT DERIVATION RULE: `votes` is the per-row count for this EXACT
 * span. The number the artifact stores and the engine cites is the summed
 * boundary vote at a section's start verse — the sum over rows sharing that
 * start verse (see buildPericopes.ts). The two numbers must never be
 * conflated: James 1:19's summed boundary vote is 16 while the per-row vote
 * for the exact span 1:19-27 is 13.
 */
export interface SectionSpanRow {
  readonly startVerseId: number;
  readonly endVerseId: number;
  readonly votes: number;
}

/**
 * `Start OSIS \t End OSIS \t Verse-after-end OSIS \t Count` with one
 * `#`-prefixed header line (bible-section-counts.txt). The third column
 * exists for the site's Sankey rendering and is deliberately ignored here.
 * Counts are "how many of 20 surveyed translations mark this span as a
 * section" — a countable structural fact, never a relevance score. Rows
 * with a non-positive or non-integer count are rejected loudly: the source
 * publishes to a rolling URL, and a rejected-row count is how a silent
 * upstream format change fails the build instead of thinning the data.
 */
export function importSectionCounts(contents: string): {
  readonly rows: readonly SectionSpanRow[];
  readonly report: ImportReport;
} {
  const rows: SectionSpanRow[] = [];
  const samples: string[] = [];
  let rejected = 0;

  for (const line of splitLines(contents)) {
    if (line.startsWith('#')) continue;
    const parts = line.split('\t');
    if (parts.length < 4) {
      rejected += 1;
      if (samples.length < MAX_SAMPLES) samples.push(line.slice(0, 80));
      continue;
    }
    const start = parseOsisRange(parts[0]!);
    const end = parseOsisRange(parts[1]!);
    const votes = Number(parts[3]);
    if (!start || !end || !Number.isInteger(votes) || votes < 1) {
      rejected += 1;
      if (samples.length < MAX_SAMPLES) samples.push(line.slice(0, 80));
      continue;
    }
    rows.push({
      startVerseId: start.startVerseId,
      endVerseId: end.startVerseId,
      votes,
    });
  }
  return { rows, report: { accepted: rows.length, rejected, rejectionSamples: samples } };
}

/**
 * Normalizes an OpenBible quality score into a 0..1 prior.
 *
 * Explicitly a PRIOR, not a probability: it reflects what visitors to one
 * website voted for, which is useful signal about what people find relevant
 * and no signal at all about what is correct. The ranker consumes it under
 * the concept_anchor budget like any other bounded input.
 */
export function scoreToWeight(score: number): number {
  if (!Number.isFinite(score) || score <= 0) return 0;
  return Math.min(1, score / 100);
}
