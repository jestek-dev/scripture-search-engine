/**
 * Importer for the Treasury of Scripture Knowledge CrossWire module
 * (`tsk-text`, P6.3 / B3 Phase A).
 *
 * WHAT IS MINED, AND WHY THE MARKUP MATTERS: TSK's native structure keys
 * every reference list to a quoted word/phrase of the verse it annotates.
 * In the module's ThML that structure survives as alternating segments —
 * a phrase segment, then one or more `<scripRef>` lists:
 *
 *   <br />the son of David.<br /><scripRef>9:27; 15:22; 2Sa 7:13,16</scripRef>
 *
 * Re-mining it yields (verse, phrase, refs) triples: term-scoped
 * cross-reference evidence with a checkable explanation ("linked by TSK
 * under the phrase …"). The expositor importer strips markup because it
 * wants tokens; this one preserves it because the tags ARE the structure.
 *
 * PHASE A DISCIPLINE (load-bearing): the rows this importer produces feed
 * ONLY the optional `cross_reference_phrases` table (schema v9). No row
 * ever enters `cross_references` here — the engine expands ALL xref rows
 * with no source filter, so TSK edges in that table would change ordering
 * under a capability-only framing (the P0.1-class approval-hygiene failure
 * the plan names). Edge emission is Phase B, one honestly-framed
 * ENGINE_VERSION-bumped PR, gated on J26/J55.
 *
 * REJECT-AND-REPORT: TSK's reference strings carry editorial debris
 * (`*marg:`, `*Heb:`, `*titles`, prose asides). Anything that does not
 * parse as a reference is rejected and RETURNED, and the tests assert the
 * accepted/rejected counts on golden slices — a silent upstream format
 * change must fail loudly, never shrink the table quietly (the
 * importSectionCounts discipline).
 *
 * CONTEXT RULES, derived from the module and pinned by tests:
 * - an entry's reference context starts at its own (book, chapter);
 * - an explicit book token ("2Sa 7:13") sets book + chapter;
 * - a chapter:verse form ("9:27") sets the chapter, book from context;
 * - a bare verse or verse-range ("26", "13-15") reads in context;
 * - the context RESETS to the entry's own (book, chapter) whenever the
 *   phrase key changes (observed: Jas 1:22 "deceiving." begins "26" =
 *   Jas 1:26 right after a list that ended in Revelation), and persists
 *   across consecutive `<scripRef>` blocks under one phrase;
 * - `<scripRef passage="…">` links are chapter-synopsis navigation, not
 *   reference lists: skipped, and they clear the pending phrase so
 *   synopsis prose can never masquerade as a phrase key.
 */

import { significantWords } from '@jestek-dev/scripture-engine/internal';

import { BOOKS } from '../books.js';
import { KJV_VERSES_PER_CHAPTER } from '../versification/kjv.js';
import { makeVerseId } from '../verseId.js';
import { normalizeWhitespace } from '../text.js';
import {
  importSwordZcom,
  type SwordEntry,
  type SwordTestamentFiles,
} from './swordZcomImporter.js';

/** One mined (verse, phrase, target-range) triple — a schema-v9 table row. */
export interface CrossReferencePhraseRow {
  readonly fromVerseId: number;
  /**
   * The phrase key as the ONE shared tokenizer normalizes it (covenant #4:
   * `significantWords`, the exact import the ontology importer uses), so
   * build-time keys and runtime query tokens share a vocabulary by
   * construction. May be empty when TSK keyed a list to a function word
   * ("be.") — an honest record of the source; such a key can never
   * token-match a query.
   */
  readonly normalizedPhrase: string;
  readonly toStartVerseId: number;
  readonly toEndVerseId: number;
}

export interface TskImportResult {
  readonly rows: readonly CrossReferencePhraseRow[];
  /** Non-empty verse entries the module carried. */
  readonly entries: number;
  /** Plain reference lists parsed (synopsis links excluded). */
  readonly referenceLists: number;
  /** `<scripRef passage=…>` synopsis links skipped. */
  readonly synopsisLinksSkipped: number;
  /** Every rejected fragment, verbatim with its location — never silent. */
  readonly rejected: readonly string[];
  /** Exact duplicate triples collapsed (deterministic first-wins). */
  readonly duplicatesCollapsed: number;
}

/**
 * TSK's book abbreviations, transcribed from a full survey of the pinned
 * module (all 85,312 scripRef blocks; exactly these 66 tokens occur).
 * "Jud" is JUDGES here — Jude is always written "Jude" — the exact
 * two-reading hazard the spelling work's `Jud` doctrine guards against in
 * queries; inside this closed vocabulary it is unambiguous.
 */
const TSK_BOOKS: ReadonlyMap<string, number> = new Map([
  ['Ge', 1], ['Ex', 2], ['Le', 3], ['Nu', 4], ['De', 5], ['Jos', 6], ['Jud', 7], ['Ru', 8],
  ['1Sa', 9], ['2Sa', 10], ['1Ki', 11], ['2Ki', 12], ['1Ch', 13], ['2Ch', 14],
  ['Ezr', 15], ['Ne', 16], ['Es', 17], ['Job', 18], ['Ps', 19], ['Pr', 20], ['Ec', 21],
  ['So', 22], ['Isa', 23], ['Jer', 24], ['La', 25], ['Eze', 26], ['Da', 27], ['Ho', 28],
  ['Joe', 29], ['Am', 30], ['Ob', 31], ['Jon', 32], ['Mic', 33], ['Na', 34], ['Hab', 35],
  ['Zep', 36], ['Hag', 37], ['Zec', 38], ['Mal', 39],
  ['Mt', 40], ['Mr', 41], ['Lu', 42], ['Joh', 43], ['Ac', 44], ['Ro', 45],
  ['1Co', 46], ['2Co', 47], ['Ga', 48], ['Eph', 49], ['Php', 50], ['Col', 51],
  ['1Th', 52], ['2Th', 53], ['1Ti', 54], ['2Ti', 55], ['Tit', 56], ['Phm', 57],
  ['Heb', 58], ['Jas', 59], ['1Pe', 60], ['2Pe', 61], ['1Jo', 62], ['2Jo', 63],
  ['3Jo', 64], ['Jude', 65], ['Re', 66],
]);

/** Entity decoding for the handful these modules emit, then tag removal. */
function plainText(markup: string): string {
  return normalizeWhitespace(
    markup
      .replace(/<[^>]*>/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
      .replace(/&amp;/g, '&'),
  );
}

/** Is (chapter, verse) inside the KJV extents of the book? */
function inKjvExtents(bookId: number, chapter: number, verse: number): boolean {
  const chapters = KJV_VERSES_PER_CHAPTER[bookId - 1];
  if (!chapters || chapter < 1 || chapter > chapters.length) return false;
  return verse >= 1 && verse <= chapters[chapter - 1]!;
}

interface RefContext {
  bookId: number;
  chapter: number;
}

interface ParsedTarget {
  readonly start: { bookId: number; chapter: number; verse: number };
  readonly end: { bookId: number; chapter: number; verse: number };
}

const BOOK_LEAD = /^([1-3]?[A-Za-z]+)\.?\s+(.*)$/;
// C:V with optional range tail; the tail may itself be V, C:V.
const CHAPTER_VERSE = /^(\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/;
const VERSE_ONLY = /^(\d+)(?:-(\d+))?$/;

/**
 * One comma-element inside one semicolon-item, against the running context.
 * Returns null (with a reason pushed) when the fragment is not a reference.
 */
function parseElement(
  element: string,
  context: RefContext,
  reject: (reason: string) => void,
): ParsedTarget | null {
  let rest = element.trim();
  if (rest === '') return null;

  const lead = BOOK_LEAD.exec(rest);
  if (lead) {
    const bookId = TSK_BOOKS.get(lead[1]!);
    if (bookId === undefined) {
      reject(`unknown book token "${lead[1]!}" in "${element.trim()}"`);
      return null;
    }
    context.bookId = bookId;
    rest = lead[2]!.trim();
    const cv = CHAPTER_VERSE.exec(rest);
    if (!cv) {
      reject(`book token without chapter:verse in "${element.trim()}"`);
      return null;
    }
    return finishChapterVerse(cv, context, reject, element);
  }

  const cv = CHAPTER_VERSE.exec(rest);
  if (cv) return finishChapterVerse(cv, context, reject, element);

  const bare = VERSE_ONLY.exec(rest);
  if (bare) {
    const start = Number(bare[1]);
    const end = bare[2] !== undefined ? Number(bare[2]) : start;
    return finishRange(context.bookId, context.chapter, start, context.chapter, end, reject, element);
  }

  reject(`unparsable fragment "${element.trim()}"`);
  return null;
}

function finishChapterVerse(
  cv: RegExpExecArray,
  context: RefContext,
  reject: (reason: string) => void,
  element: string,
): ParsedTarget | null {
  const chapter = Number(cv[1]);
  const verse = Number(cv[2]);
  context.chapter = chapter;
  const endChapter = cv[3] !== undefined ? Number(cv[3]) : chapter;
  const endVerse = cv[4] !== undefined ? Number(cv[4]) : verse;
  // A cross-chapter range end moves the running chapter with it, so a
  // following bare verse reads in the range's ending chapter.
  if (cv[3] !== undefined) context.chapter = endChapter;
  return finishRange(context.bookId, chapter, verse, endChapter, endVerse, reject, element);
}

function finishRange(
  bookId: number,
  startChapter: number,
  startVerse: number,
  endChapter: number,
  endVerse: number,
  reject: (reason: string) => void,
  element: string,
): ParsedTarget | null {
  if (!inKjvExtents(bookId, startChapter, startVerse) || !inKjvExtents(bookId, endChapter, endVerse)) {
    reject(
      `reference outside KJV extents: ${BOOKS[bookId - 1]!.name} ` +
        `${startChapter}:${startVerse}-${endChapter}:${endVerse} (from "${element.trim()}")`,
    );
    return null;
  }
  const start = { bookId, chapter: startChapter, verse: startVerse };
  const end = { bookId, chapter: endChapter, verse: endVerse };
  if (makeVerseId(bookId, endChapter, endVerse) < makeVerseId(bookId, startChapter, startVerse)) {
    reject(`inverted range in "${element.trim()}"`);
    return null;
  }
  return { start, end };
}

const SEGMENT_SPLIT = /<br\s*\/?>/i;
const SCRIP_REF = /^<scripRef([^>]*)>([\s\S]*?)<\/scripRef>([\s\S]*)$/i;

/**
 * Parses one verse entry's raw ThML body into phrase-keyed target ranges.
 * Exported for the golden-slice tests, which pin real module bytes.
 */
export function parseTskEntryBody(
  body: string,
  bookId: number,
  chapter: number,
  verse: number,
  sink: {
    row: (row: CrossReferencePhraseRow) => void;
    reject: (reason: string) => void;
    referenceList: () => void;
    synopsisLink: () => void;
  },
): void {
  const fromVerseId = makeVerseId(bookId, chapter, verse);
  const context: RefContext = { bookId, chapter };
  let phrase = '';
  let normalized = '';

  for (const rawSegment of body.split(SEGMENT_SPLIT)) {
    let segment = rawSegment.trim();
    while (segment !== '') {
      const scripRef = SCRIP_REF.exec(segment);
      if (!scripRef) {
        // A phrase segment: the key for the reference lists that follow.
        const text = plainText(segment);
        if (text !== '') {
          phrase = text;
          normalized = significantWords(text).join(' ');
          context.bookId = bookId;
          context.chapter = chapter;
        }
        break;
      }
      if (/passage\s*=/.test(scripRef[1]!)) {
        // Chapter-synopsis navigation link — not a reference list; and the
        // surrounding synopsis prose must never become a phrase key.
        sink.synopsisLink();
        phrase = '';
        normalized = '';
      } else {
        sink.referenceList();
        for (const item of scripRef[2]!.split(';')) {
          const trimmed = item.trim();
          if (trimmed === '') continue;
          if (trimmed.startsWith('*')) {
            sink.reject(
              `${BOOKS[bookId - 1]!.name} ${chapter}:${verse}: editorial aside "${trimmed.slice(0, 60)}"`,
            );
            continue;
          }
          // The first comma-element may carry the book/chapter lead; the
          // rest are verses or verse-ranges in the running context.
          for (const element of trimmed.split(',')) {
            const parsed = parseElement(element, context, (reason) =>
              sink.reject(`${BOOKS[bookId - 1]!.name} ${chapter}:${verse}: ${reason}`),
            );
            if (!parsed) continue;
            sink.row({
              fromVerseId,
              normalizedPhrase: normalized,
              toStartVerseId: makeVerseId(parsed.start.bookId, parsed.start.chapter, parsed.start.verse),
              toEndVerseId: makeVerseId(parsed.end.bookId, parsed.end.chapter, parsed.end.verse),
            });
          }
        }
      }
      segment = scripRef[3]!.trim();
    }
  }
  void phrase;
}

/**
 * Imports the whole module: SWORD walk (verse-keyed by construction, the
 * zcom index verified against KJV versification) then per-entry parsing.
 * Deterministic: rows come out in module walk order with exact duplicate
 * triples collapsed first-wins.
 */
export function importTskText(testaments: {
  readonly ot?: SwordTestamentFiles;
  readonly nt?: SwordTestamentFiles;
}): TskImportResult {
  const imported = importSwordZcom(testaments, { preserveMarkup: true });

  const rows: CrossReferencePhraseRow[] = [];
  const rejected: string[] = [];
  let referenceLists = 0;
  let synopsisLinksSkipped = 0;
  let duplicatesCollapsed = 0;
  const seen = new Set<string>();

  const parseEntry = (entry: SwordEntry): void => {
    parseTskEntryBody(entry.body, entry.bookId, entry.chapter, entry.verse, {
      row: (row) => {
        const key = `${row.fromVerseId}|${row.normalizedPhrase}|${row.toStartVerseId}|${row.toEndVerseId}`;
        if (seen.has(key)) {
          duplicatesCollapsed += 1;
          return;
        }
        seen.add(key);
        rows.push(row);
      },
      reject: (reason) => rejected.push(reason),
      referenceList: () => { referenceLists += 1; },
      synopsisLink: () => { synopsisLinksSkipped += 1; },
    });
  };

  for (const entry of imported.entries) parseEntry(entry);

  return {
    rows,
    entries: imported.entries.length,
    referenceLists,
    synopsisLinksSkipped,
    rejected,
    duplicatesCollapsed,
  };
}
