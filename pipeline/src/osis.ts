/**
 * OSIS reference parsing.
 *
 * OpenBible's datasets address verses as `Gen.1.1` and ranges as
 * `Exod.20.1-Exod.20.26`. Our canonical identity is the BBCCCVVV integer, so
 * every imported edge passes through here.
 *
 * Unresolvable references are REJECTED, never guessed. A cross-reference
 * pointing at a book we cannot identify is a row we cannot attribute, and G1
 * exists to keep exactly that out of the artifact.
 */

import { makeVerseId } from './verseId.js';

/** OSIS book codes in canonical order; index + 1 is our book id. */
const OSIS_BOOKS: readonly string[] = [
  'Gen', 'Exod', 'Lev', 'Num', 'Deut', 'Josh', 'Judg', 'Ruth',
  '1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr', 'Ezra', 'Neh', 'Esth',
  'Job', 'Ps', 'Prov', 'Eccl', 'Song',
  'Isa', 'Jer', 'Lam', 'Ezek', 'Dan',
  'Hos', 'Joel', 'Amos', 'Obad', 'Jonah', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal',
  'Matt', 'Mark', 'Luke', 'John', 'Acts',
  'Rom', '1Cor', '2Cor', 'Gal', 'Eph', 'Phil', 'Col',
  '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Phlm',
  'Heb', 'Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude', 'Rev',
];

const OSIS_BOOK_IDS: ReadonlyMap<string, number> = new Map(
  OSIS_BOOKS.map((code, index) => [code.toLowerCase(), index + 1]),
);

export interface OsisRange {
  readonly startVerseId: number;
  readonly endVerseId: number;
}

const SINGLE_RE = /^([1-3]?[A-Za-z]+)\.(\d{1,3})\.(\d{1,3})$/;

function parseSingle(token: string): number | null {
  const match = SINGLE_RE.exec(token.trim());
  if (!match) return null;
  const bookId = OSIS_BOOK_IDS.get(match[1]!.toLowerCase());
  if (bookId === undefined) return null;
  try {
    return makeVerseId(bookId, Number(match[2]), Number(match[3]));
  } catch {
    // Out-of-range chapter/verse: reject rather than clamp. A clamped
    // reference would silently attribute evidence to the wrong verse.
    return null;
  }
}

/**
 * Parses `Gen.1.1` or `Col.1.16-Col.1.17`. Returns null for anything we
 * cannot resolve exactly — including reversed ranges, which indicate a
 * malformed source row rather than something to normalize.
 */
export function parseOsisRange(input: string): OsisRange | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const dash = trimmed.indexOf('-');
  if (dash === -1) {
    const verseId = parseSingle(trimmed);
    return verseId === null ? null : { startVerseId: verseId, endVerseId: verseId };
  }

  const startVerseId = parseSingle(trimmed.slice(0, dash));
  const endVerseId = parseSingle(trimmed.slice(dash + 1));
  if (startVerseId === null || endVerseId === null) return null;
  if (endVerseId < startVerseId) return null;
  return { startVerseId, endVerseId };
}

export function osisBookId(code: string): number | undefined {
  return OSIS_BOOK_IDS.get(code.trim().toLowerCase());
}

export const OSIS_BOOK_COUNT = OSIS_BOOKS.length;
