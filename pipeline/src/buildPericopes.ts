/**
 * Pericope derivation (P5.6 / CO-3, PR 1 capability) — pure functions only.
 *
 * Input: OpenBible.info candidate section spans with per-row translation
 * counts (importSectionCounts). Output: a deterministic tiling of every
 * PRESENT verse into pericopes, where a pericope starts at each verse whose
 * SUMMED boundary vote clears the reviewed threshold, plus the forced start
 * of every book.
 *
 * The number stored per pericope — and the only number the engine may ever
 * cite — is the summed boundary vote at its start verse: the sum over all
 * candidate rows sharing that start verse. It is a countable structural
 * fact ("how many of 20 surveyed translations start a section here"), never
 * a relevance score, and never the per-row vote for any one exact span
 * (James 1:19 sums to 16 while the row for the exact span 1:19-27 carries
 * 13 — conflating the two would ship an explanation the data contradicts).
 *
 * The derived table is a deterministic function of (source rows, threshold,
 * present verses); changing any of the three moves the layer fingerprint.
 */

import type { SectionSpanRow } from './importers/openbibleImporter.js';

/** One derived pericope row, ready for the `pericopes` table. */
export interface PericopeRow {
  readonly startVerseId: number;
  readonly endVerseId: number;
  /**
   * Summed boundary vote at startVerseId. 0 for a forced book start no
   * translation marks — the tiling invariant needs the row, and an honest
   * zero beats a laundered minimum.
   */
  readonly boundaryVotes: number;
}

/**
 * Reviewed boundary threshold: a verse starts a pericope when at least this
 * many of the 20 surveyed translations' section placements sum to it.
 * Exported so the eval side can pin it — a silent change here re-tiles the
 * whole corpus and MUST move the layer fingerprint through the derived rows.
 * 10 = a majority of the 20 surveyed translations.
 */
export const BOUNDARY_VOTE_THRESHOLD = 10;

/** BBCCCVVV → BB. */
function bookOf(verseId: number): number {
  return Math.floor(verseId / 1_000_000);
}

/**
 * Summed boundary votes per start verse — the derivation's first half,
 * exposed separately so tests can pin the sum/per-row distinction against
 * real source slices.
 */
export function boundaryVotes(rows: readonly SectionSpanRow[]): ReadonlyMap<number, number> {
  const sums = new Map<number, number>();
  for (const row of rows) {
    sums.set(row.startVerseId, (sums.get(row.startVerseId) ?? 0) + row.votes);
  }
  return sums;
}

/**
 * Derives the pericope tiling of the present verses.
 *
 * Within each book, walking present verses in verse-id order: a new
 * pericope opens at the book's first present verse (forced) and at every
 * present verse whose summed boundary vote reaches the threshold; each
 * pericope closes at the last present verse before the next boundary.
 *
 * Invariants — checked, not assumed, because the engine will cite this
 * table as structural fact: within a book the derived pericopes are
 * disjoint, ordered, and tile every present verse. A violation is a build
 * error, never a shrug.
 */
export function derivePericopes(
  rows: readonly SectionSpanRow[],
  presentVerseIds: ReadonlySet<number>,
  threshold: number = BOUNDARY_VOTE_THRESHOLD,
): readonly PericopeRow[] {
  const sums = boundaryVotes(rows);
  const present = [...presentVerseIds].sort((a, b) => a - b);
  const pericopes: PericopeRow[] = [];

  let openStart: number | null = null;
  let openVotes = 0;
  let previous: number | null = null;

  const close = (): void => {
    if (openStart !== null && previous !== null) {
      pericopes.push({ startVerseId: openStart, endVerseId: previous, boundaryVotes: openVotes });
    }
  };

  for (const verseId of present) {
    const bookBoundary = previous === null || bookOf(verseId) !== bookOf(previous);
    const voteSum = sums.get(verseId) ?? 0;
    if (bookBoundary || voteSum >= threshold) {
      close();
      openStart = verseId;
      openVotes = voteSum;
    }
    previous = verseId;
  }
  close();

  // Invariant verification: disjoint, ordered, tiling every present verse.
  let covered = 0;
  let lastEnd: number | null = null;
  for (const pericope of pericopes) {
    if (pericope.startVerseId > pericope.endVerseId) {
      throw new Error(
        `derivePericopes: inverted pericope ${pericope.startVerseId}..${pericope.endVerseId}`,
      );
    }
    if (lastEnd !== null && pericope.startVerseId <= lastEnd) {
      throw new Error(
        `derivePericopes: pericope ${pericope.startVerseId}..${pericope.endVerseId} ` +
          `overlaps or disorders the previous one ending at ${lastEnd}`,
      );
    }
    lastEnd = pericope.endVerseId;
    for (let id = pericope.startVerseId; id <= pericope.endVerseId; id += 1) {
      if (presentVerseIds.has(id)) covered += 1;
    }
  }
  if (covered !== presentVerseIds.size) {
    throw new Error(
      `derivePericopes: tiling covers ${covered} of ${presentVerseIds.size} present verses`,
    );
  }

  return pericopes;
}
