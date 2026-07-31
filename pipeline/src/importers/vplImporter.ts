/**
 * Importer for eBible.org's verse-per-line (VPL) export format:
 *
 *     GEN 1:1 In the beginning, God created the heavens and the earth.
 *
 * One verse per line, a three-letter book code, `chapter:verse`, then the
 * text. This is eBible's own canonical publication format, which is why it is
 * the shape we import: it has a stable, checksummable download URL, so the
 * corpus can be re-fetched and re-verified by anyone. The previous WEB import
 * came from a JSON export whose origin URL was never recorded — a checksum
 * with nothing on the other end of it. See docs/NEEDS-JESSE.md.
 *
 * The book codes are eBible's older three-letter set (JOH, JAM, 1JO, MAR),
 * not the modern USFM set (JHN, JAS, 1JN, MRK). Both are mapped, because the
 * cost of guessing wrong is verses filed under the wrong book — a silent
 * error that survives every downstream gate.
 */

import { BOOKS } from '../books.js';
import { normalizeWhitespace } from '../text.js';
import { makeVerseId } from '../verseId.js';
import type { NormalizedVerse } from './types.js';

/**
 * Book code → canonical book id. Both eBible's legacy codes and the modern
 * USFM codes are listed, so an export in either dialect imports identically.
 *
 * Written out in full rather than derived from `books.ts` abbreviations: the
 * abbreviation lists exist to parse what a USER might type, which is a
 * deliberately forgiving lookup. Corpus import is the opposite problem and
 * wants an exact, auditable table.
 */
const BOOK_CODES: Readonly<Record<string, number>> = {
  GEN: 1, EXO: 2, LEV: 3, NUM: 4, DEU: 5, JOS: 6, JDG: 7, RUT: 8,
  '1SA': 9, '2SA': 10, '1KI': 11, '2KI': 12, '1CH': 13, '2CH': 14,
  EZR: 15, NEH: 16, EST: 17, JOB: 18, PSA: 19, PRO: 20, ECC: 21,
  SOL: 22, SNG: 22, ISA: 23, JER: 24, LAM: 25, EZE: 26, EZK: 26,
  DAN: 27, HOS: 28, JOE: 29, JOL: 29, AMO: 30, OBA: 31, OBD: 31,
  JON: 32, MIC: 33, NAH: 34, HAB: 35, ZEP: 36, HAG: 37, ZEC: 38, MAL: 39,
  MAT: 40, MAR: 41, MRK: 41, LUK: 42, JOH: 43, JHN: 43, ACT: 44,
  ROM: 45, '1CO': 46, '2CO': 47, GAL: 48, EPH: 49, PHI: 50, PHP: 50,
  COL: 51, '1TH': 52, '2TH': 53, '1TI': 54, '2TI': 55, TIT: 56,
  PHM: 57, HEB: 58, JAM: 59, JAS: 59, '1PE': 60, '2PE': 61,
  '1JO': 62, '1JN': 62, '2JO': 63, '2JN': 63, '3JO': 64, '3JN': 64,
  JUD: 65, JDE: 65, REV: 66,
};

// The text group is optional: a textless reference is valid data (see
// `omittedVerses`), and trimming the line removes the separating space, so a
// mandatory `\s+` would reject exactly those five lines.
const LINE = /^([1-3]?[A-Z]{2,3}) (\d+):(\d+)(?:\s+(.*))?$/;

const CHAPTER_COUNT = new Map(BOOKS.map((book) => [book.id, book.chapterCount]));

export interface VplImportResult {
  readonly verses: readonly NormalizedVerse[];
  /** Lines skipped as blank or comment, reported so silence is never assumed. */
  readonly skippedLines: number;
  /**
   * References the export carries with NO text — verses absent from the
   * critical text that WEB relegates to a footnote (Luke 17:36, Acts 8:37,
   * 15:34, 24:7, Rom 16:25). They are real data, not corruption: the
   * reference is numbered so later verses keep their expected numbers.
   *
   * Returned rather than silently dropped because they are the difference
   * between the export's 31,103 lines and the corpus's verse count, and an
   * unexplained gap of five verses is exactly the kind of discrepancy someone
   * later mistakes for a parser bug.
   */
  readonly omittedVerses: readonly string[];
}

export function importVpl(contents: string): VplImportResult {
  const verses: NormalizedVerse[] = [];
  const seen = new Set<number>();
  const omittedVerses: string[] = [];
  let skippedLines = 0;

  const lines = contents.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === undefined) continue;
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      skippedLines += 1;
      continue;
    }

    const match = LINE.exec(trimmed);
    if (!match) {
      throw new Error(`importVpl: unparseable line ${index + 1}: ${trimmed.slice(0, 80)}`);
    }

    const [, code, chapterText, verseText, text] = match;
    const bookId = BOOK_CODES[code as string];
    if (bookId === undefined) {
      throw new Error(`importVpl: unknown book code "${code}" on line ${index + 1}`);
    }

    const chapter = Number(chapterText);
    const verse = Number(verseText);

    // A chapter past the end of the book means the code table and the export
    // disagree about which book this is. Importing anyway files verses under
    // the wrong book, which no downstream gate can detect.
    const chapterCount = CHAPTER_COUNT.get(bookId);
    if (chapterCount === undefined || chapter < 1 || chapter > chapterCount) {
      throw new Error(
        `importVpl: ${code} ${chapter}:${verse} on line ${index + 1} is outside book ` +
          `${bookId} (1-${chapterCount ?? '?'} chapters)`,
      );
    }

    const verseId = makeVerseId(bookId, chapter, verse);

    // A duplicate verse id means the export contains the same reference twice,
    // which would double its token postings and quietly skew every statistic
    // computed from them.
    if (seen.has(verseId)) {
      throw new Error(`importVpl: duplicate verse ${code} ${chapter}:${verse} on line ${index + 1}`);
    }
    seen.add(verseId);

    const normalized = normalizeWhitespace(text ?? '');
    if (normalized === '') {
      omittedVerses.push(`${code} ${chapter}:${verse}`);
      continue;
    }

    verses.push({ verseId, bookId, chapter, verse, text: normalized });
  }

  if (verses.length === 0) {
    throw new Error('importVpl: no verses parsed — refusing to build an empty corpus');
  }

  return { verses, skippedLines, omittedVerses };
}
