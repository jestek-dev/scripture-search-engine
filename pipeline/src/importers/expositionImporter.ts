/**
 * Alignment tier 1 — passage-keyed expositions.
 *
 * The cheapest and most reliable way to attach preached/written theology to
 * scripture: works that state their text explicitly. Maclaren's *Expositions
 * of Holy Scripture* ends every scripture quotation with a citation marker
 * (`--PSALM xxiii. 1-6.`), so alignment is parsing, not inference.
 *
 * This is deliberately the FIRST tier implemented. Tier 2 (sermons with
 * separate scripture indexes) and tier 3 (citation mining inside bodies)
 * are progressively less certain, and there is no reason to pay their
 * accuracy cost while tier-1 coverage is still unexploited.
 *
 * Project Gutenberg texts are used rather than Archive.org OCR wherever both
 * exist: proofread text avoids a whole class of long-s and ligature garbage
 * that would otherwise poison every term profile built from it.
 */

import { makeVerseId } from '../verseId.js';

export interface ExpositionSection {
  /** Book id this section expounds. */
  readonly bookId: number;
  readonly startVerseId: number;
  readonly endVerseId: number;
  /** The citation exactly as printed, kept for provenance display. */
  readonly citation: string;
  /** Exposition prose, excluding the quoted scripture itself. */
  readonly body: string;
}

const ROMAN_VALUES: Readonly<Record<string, number>> = {
  i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000,
};

/** Lowercase Roman numeral to integer; null if not a well-formed numeral. */
export function parseRoman(input: string): number | null {
  const text = input.trim().toLowerCase();
  if (!text || !/^[ivxlcdm]+$/.test(text)) return null;
  let total = 0;
  for (let index = 0; index < text.length; index += 1) {
    const value = ROMAN_VALUES[text[index]!]!;
    const next = index + 1 < text.length ? ROMAN_VALUES[text[index + 1]!]! : 0;
    total += value < next ? -value : value;
  }
  return total > 0 ? total : null;
}

/**
 * Parses the verse part of a citation: "1-6", "8, 11", "12".
 *
 * Comma lists are collapsed to their span (8, 11 -> 8..11) rather than kept
 * as separate ranges. The exposition treats them as one unit of thought, and
 * splitting them would attribute the same prose to two pericopes as though
 * they were independent evidence.
 */
function parseVerses(input: string): { start: number; end: number } | null {
  const numbers = [...input.matchAll(/\d{1,3}/g)].map((match) => Number(match[0]));
  if (numbers.length === 0) return null;
  const start = Math.min(...numbers);
  const end = Math.max(...numbers);
  return { start, end };
}

/**
 * Splits a Gutenberg exposition volume into passage-keyed sections.
 *
 * `bookId` is supplied by the caller rather than parsed, because a volume
 * covers a known book: guessing it from the citation would invent a failure
 * mode for no benefit.
 */
export function importExpositions(
  text: string,
  options: { readonly bookId: number; readonly citationWord: string },
): { readonly sections: readonly ExpositionSection[]; readonly rejected: number } {
  const marker = new RegExp(
    `--${options.citationWord}\\s+([ivxlcdm]+)\\.\\s*([0-9,\\s-]*)`,
    'gi',
  );
  const hits = [...text.matchAll(marker)];
  const sections: ExpositionSection[] = [];
  let rejected = 0;

  hits.forEach((hit, index) => {
    const chapter = parseRoman(hit[1] ?? '');
    const verses = parseVerses(hit[2] ?? '');
    if (chapter === null || !verses) {
      rejected += 1;
      return;
    }

    // Body runs from the end of this citation to the start of the next one.
    // The quoted scripture itself sits BEFORE the marker and is therefore
    // excluded — including it would make every profile's most distinctive
    // terms the words of the passage, which we already index directly.
    const bodyStart = (hit.index ?? 0) + hit[0].length;
    const bodyEnd = index + 1 < hits.length ? (hits[index + 1]!.index ?? text.length) : text.length;
    const body = text.slice(bodyStart, bodyEnd).replace(/\s+/g, ' ').trim();
    if (body.length < 200) {
      // Too short to be an exposition — almost certainly a stray citation in
      // a table of contents or an index.
      rejected += 1;
      return;
    }

    try {
      sections.push({
        bookId: options.bookId,
        startVerseId: makeVerseId(options.bookId, chapter, verses.start),
        endVerseId: makeVerseId(options.bookId, chapter, verses.end),
        citation: `${options.citationWord} ${chapter}:${verses.start}${
          verses.end !== verses.start ? `-${verses.end}` : ''
        }`,
        body,
      });
    } catch {
      rejected += 1;
    }
  });

  return { sections, rejected };
}


/**
 * Alignment tier 1, second shape: works organized as a psalm heading followed
 * by per-verse commentary entries.
 *
 * Spurgeon's *Treasury of David* prints "PSALM XXIII." as a section heading and
 * then discusses verses under "Verse 1." / "Verses 1-3." markers. That is a
 * different structure from Maclaren's citation-suffix convention, so it gets
 * its own parser rather than one regex growing warts to cover both.
 *
 * Verse markers are interpreted RELATIVE to the most recent psalm heading. A
 * verse marker with no preceding heading is rejected rather than guessed at:
 * attaching commentary to the wrong psalm is a silent, unrecoverable error.
 */
export function importPsalmVerseHeadings(
  text: string,
  options: { readonly bookId: number },
): { readonly sections: readonly ExpositionSection[]; readonly rejected: number } {
  // Psalm headings: a line that is essentially "PSALM <roman>." and nothing
  // else. OCR frequently mangles the trailing period and adds stray spacing,
  // so both are tolerated — but the roman numeral itself is NOT guessed at: a
  // corrupted numeral yields no heading rather than a wrong psalm.
  const heading = /^[^\S\r\n]*PSALM\s+([IVXLCDM]+)\s*\.?[^\S\r\n]*$/gim;
  // Verse markers: "Verse 1.", "Verses 1-3.", "Verse 1.—" (Treasury of David
  // prints an em-dash after the marker; Maclaren-style works do not).
  const verseMarker =
    /(?:^|\n)[^\S\r\n]*Verses?\s+([0-9]{1,3}(?:\s*[-,]\s*[0-9]{1,3})*)\s*\.\s*[—–-]?/g;

  const headings = [...text.matchAll(heading)]
    .map((match) => ({ index: match.index ?? 0, chapter: parseRoman(match[1] ?? '') }))
    .filter((entry): entry is { index: number; chapter: number } => entry.chapter !== null);

  if (headings.length === 0) return { sections: [], rejected: 0 };

  const chapterAt = (index: number): number | null => {
    let current: number | null = null;
    for (const entry of headings) {
      if (entry.index <= index) current = entry.chapter;
      else break;
    }
    return current;
  };

  const markers = [...text.matchAll(verseMarker)];
  const sections: ExpositionSection[] = [];
  let rejected = 0;

  markers.forEach((marker, index) => {
    const at = marker.index ?? 0;
    const chapter = chapterAt(at);
    const numbers = [...(marker[1] ?? '').matchAll(/\d{1,3}/g)].map((hit) => Number(hit[0]));
    if (chapter === null || numbers.length === 0) {
      rejected += 1;
      return;
    }

    const bodyStart = at + marker[0].length;
    const bodyEnd =
      index + 1 < markers.length ? (markers[index + 1]!.index ?? text.length) : text.length;
    const body = text.slice(bodyStart, bodyEnd).replace(/\s+/g, ' ').trim();
    if (body.length < 200) {
      rejected += 1;
      return;
    }

    try {
      const start = Math.min(...numbers);
      const end = Math.max(...numbers);
      sections.push({
        bookId: options.bookId,
        startVerseId: makeVerseId(options.bookId, chapter, start),
        endVerseId: makeVerseId(options.bookId, chapter, end),
        citation: `PSALM ${chapter}:${start}${end !== start ? `-${end}` : ''}`,
        body,
      });
    } catch {
      rejected += 1;
    }
  });

  return { sections, rejected };
}

/** Strips Project Gutenberg's header and license footer. */
export function stripGutenbergBoilerplate(text: string): string {
  const startMarker = /\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*\*\*/i;
  const endMarker = /\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*\*\*/i;
  const startMatch = startMarker.exec(text);
  const endMatch = endMarker.exec(text);
  const from = startMatch ? startMatch.index + startMatch[0].length : 0;
  const to = endMatch ? endMatch.index : text.length;
  return text.slice(from, to);
}
