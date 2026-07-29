/**
 * Importer for the flat verse-array corpus shape:
 * `{ metadata?, verses: [{ book_name, book, chapter, verse, text }] }`.
 *
 * Both the WEB and KJV exports use this shape, so one importer serves both —
 * ported from Maskil's `webImporter.ts`, including its most important rule:
 * the source's own numeric `book` field is never trusted on its own. The book
 * NAME is resolved through the same lookup every consumer uses, and a
 * mismatch between the resolved id and the source's number is treated as a
 * corrupt source and throws immediately, rather than silently importing
 * verses under the wrong book.
 */

import { findBook } from '../books.js';
import { normalizeWhitespace } from '../text.js';
import { makeVerseId } from '../verseId.js';
import type { NormalizedVerse } from './types.js';

export interface VerseArraySource {
  readonly metadata?: unknown;
  readonly verses: readonly VerseArrayEntry[];
}

export interface VerseArrayEntry {
  readonly book_name: string;
  readonly book: number;
  readonly chapter: number;
  readonly verse: number;
  readonly text: string;
}

export function importVerseArray(source: VerseArraySource): NormalizedVerse[] {
  if (!Array.isArray(source.verses)) {
    throw new Error('importVerseArray: source.verses is not an array');
  }

  return source.verses.map((raw, index) => {
    const book = findBook(raw.book_name);
    if (!book) {
      throw new Error(
        `importVerseArray: unrecognized book name "${raw.book_name}" at verses[${index}]`,
      );
    }
    if (book.id !== raw.book) {
      throw new Error(
        `importVerseArray: book id mismatch for "${raw.book_name}" at verses[${index}] ` +
          `(resolved id ${book.id}, source said ${raw.book})`,
      );
    }
    return {
      verseId: makeVerseId(book.id, raw.chapter, raw.verse),
      bookId: book.id,
      chapter: raw.chapter,
      verse: raw.verse,
      text: normalizeWhitespace(raw.text),
    };
  });
}
