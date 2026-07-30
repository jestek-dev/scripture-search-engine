/**
 * Importer for SWORD `zcom` commentary modules.
 *
 * Why this format at all: these modules are **verse-keyed by construction**.
 * Treasury of David cost us a bespoke parser for printed psalm headings, plus
 * the standing risk that a corrupted roman numeral attaches commentary to the
 * wrong psalm — a silent, unrecoverable error. Here the module itself says
 * which entry belongs to which verse, so alignment stops being inference. One
 * importer then serves every module rather than one parser per volume.
 *
 * FORMAT (per testament, three files):
 *   .bzs  block index — 12 bytes/block: uint32 offset, uint32 compressed size,
 *         uint32 uncompressed size
 *   .bzv  entry index — 10 bytes/entry: uint32 block, uint32 offset in the
 *         inflated block, uint16 length
 *   .bzz  the zlib-compressed blocks themselves
 *
 * ENTRY ORDER is KJV versification, and this is the part that must be exactly
 * right:
 *
 *   [0]  module heading
 *   [1]  testament heading
 *        then, for each book:  book heading
 *          then, for each chapter:  chapter heading
 *            then one entry per verse
 *
 * Verified against both testaments of Adam Clarke: 2 + 27 + 260 + 7957 = 8246
 * NT entries, and 2 + 39 + 929 + 23145 = 24115 OT entries, both matching the
 * index files byte-for-byte. A layout that were off by one would still parse
 * and would still produce plausible-looking commentary — attached to the wrong
 * verse throughout. Hence `verifyVerseNumbers` below.
 */

import { inflateSync } from 'node:zlib';

import { BOOKS } from '../books.js';
import { normalizeWhitespace } from '../text.js';
import { KJV_VERSES_PER_CHAPTER } from '../versification/kjv.js';
import { makeVerseId } from '../verseId.js';

export interface SwordEntry {
  readonly verseId: number;
  readonly bookId: number;
  readonly chapter: number;
  readonly verse: number;
  /** Plain text, OSIS markup stripped. */
  readonly body: string;
}

export interface SwordTestamentFiles {
  readonly bzs: Buffer;
  readonly bzv: Buffer;
  readonly bzz: Buffer;
}

export interface SwordImportResult {
  readonly entries: readonly SwordEntry[];
  /** Index slots that carried no commentary — most verses, in most modules. */
  readonly emptyEntries: number;
  /**
   * Entries whose own printed "Verse N" prefix disagreed with the verse the
   * index placed them at. Any value above zero means the versification walk
   * is wrong and the import must not be trusted.
   */
  readonly verseNumberMismatches: readonly string[];
}

/** Which books belong to each testament file, as SWORD splits them. */
const OT_BOOK_IDS = BOOKS.filter((book) => book.testament === 'OT').map((book) => book.id);
const NT_BOOK_IDS = BOOKS.filter((book) => book.testament === 'NT').map((book) => book.id);

/**
 * OSIS markup to plain text. Deliberately blunt: we want tokens, not
 * structure, and every tag in these modules is presentational or referential.
 * Entity decoding is limited to the handful these modules actually emit.
 */
function stripOsis(xml: string): string {
  return normalizeWhitespace(
    xml
      .replace(/<[^>]*>/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
      .replace(/&amp;/g, '&'),
  );
}

/**
 * Reads the printed verse number a commentator put at the head of their own
 * note, when there is one.
 *
 * This is the check that makes the versification walk falsifiable. Clarke and
 * Barnes both open a note with "Verse 17" or "Verses 3-5"; if the index says
 * we are at verse 4 and the commentator says 17, one of us is wrong and it is
 * not the commentator.
 */
function printedVerseNumber(body: string): number | null {
  const match = /^Verses?\s+(\d+)/.exec(body);
  return match ? Number(match[1]) : null;
}

export interface SwordImportOptions {
  /**
   * Fail rather than warn when printed verse numbers disagree with the index.
   * Default true: a mismatch means every entry after it is suspect, and
   * shipping mis-attributed commentary is worse than shipping none.
   */
  readonly strict?: boolean;
  /**
   * How many mismatches to tolerate before concluding the walk is broken
   * rather than the source being untidy. OCR-free modules should have zero;
   * a handful can be genuine editorial quirks.
   */
  readonly mismatchTolerance?: number;
}

function readTestament(
  files: SwordTestamentFiles,
  bookIds: readonly number[],
  options: SwordImportOptions,
  entries: SwordEntry[],
  mismatches: string[],
): number {
  const { bzs, bzv, bzz } = files;
  const entryCount = Math.floor(bzv.length / 10);
  const blocks = new Map<number, Buffer>();

  const block = (index: number): Buffer => {
    const cached = blocks.get(index);
    if (cached) return cached;
    const offset = bzs.readUInt32LE(index * 12);
    const compressed = bzs.readUInt32LE(index * 12 + 4);
    const inflated = inflateSync(bzz.subarray(offset, offset + compressed));
    blocks.set(index, inflated);
    return inflated;
  };

  const textAt = (index: number): string => {
    const length = bzv.readUInt16LE(index * 10 + 8);
    if (length === 0) return '';
    const blockIndex = bzv.readUInt32LE(index * 10);
    const offset = bzv.readUInt32LE(index * 10 + 4);
    return stripOsis(block(blockIndex).subarray(offset, offset + length).toString('utf8'));
  };

  // Predict the index size before walking it. If the arithmetic disagrees with
  // the file, the layout assumption is wrong and every mapping below would be
  // silently offset — so this is a precondition, not a diagnostic.
  let expected = 2 + bookIds.length;
  for (const bookId of bookIds) {
    const chapters = KJV_VERSES_PER_CHAPTER[bookId - 1]!;
    expected += chapters.length;
    for (const verses of chapters) expected += verses;
  }
  if (expected !== entryCount) {
    throw new Error(
      `importSwordZcom: index has ${entryCount} entries but KJV versification predicts ` +
        `${expected}. The entry layout assumption is wrong; refusing to map entries to ` +
        'verses, because a wrong mapping produces plausible commentary on the wrong text.',
    );
  }

  let empty = 0;
  let cursor = 2; // skip module heading and testament heading
  for (const bookId of bookIds) {
    cursor += 1; // book heading
    const chapters = KJV_VERSES_PER_CHAPTER[bookId - 1]!;
    for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex += 1) {
      cursor += 1; // chapter heading
      const verseCount = chapters[chapterIndex]!;
      for (let verse = 1; verse <= verseCount; verse += 1) {
        const body = textAt(cursor);
        cursor += 1;
        if (body === '') {
          empty += 1;
          continue;
        }
        const chapter = chapterIndex + 1;
        const printed = printedVerseNumber(body);
        if (printed !== null && printed !== verse) {
          mismatches.push(
            `${BOOKS[bookId - 1]!.name} ${chapter}:${verse} — entry says "Verse ${printed}"`,
          );
        }
        entries.push({
          verseId: makeVerseId(bookId, chapter, verse),
          bookId,
          chapter,
          verse,
          body,
        });
      }
    }
  }

  void options;
  return empty;
}

export function importSwordZcom(
  testaments: { readonly ot?: SwordTestamentFiles; readonly nt?: SwordTestamentFiles },
  options: SwordImportOptions = {},
): SwordImportResult {
  const entries: SwordEntry[] = [];
  const mismatches: string[] = [];
  let emptyEntries = 0;

  if (testaments.ot) {
    emptyEntries += readTestament(testaments.ot, OT_BOOK_IDS, options, entries, mismatches);
  }
  if (testaments.nt) {
    emptyEntries += readTestament(testaments.nt, NT_BOOK_IDS, options, entries, mismatches);
  }

  const strict = options.strict ?? true;
  const tolerance = options.mismatchTolerance ?? 0;
  if (strict && mismatches.length > tolerance) {
    throw new Error(
      `importSwordZcom: ${mismatches.length} entries disagree with their own printed verse ` +
        `number (tolerance ${tolerance}). The versification walk is wrong.\n  ` +
        mismatches.slice(0, 10).join('\n  '),
    );
  }

  return { entries, emptyEntries, verseNumberMismatches: mismatches };
}
