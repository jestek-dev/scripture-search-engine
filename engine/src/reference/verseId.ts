/**
 * Verse ids encode book/chapter/verse as a single integer: BBCCCVVV
 * (bookId * 1_000_000 + chapter * 1_000 + verse). This keeps verse ids
 * sortable, stable across imports, and cheap to index in SQLite.
 */

export interface VerseLocation {
  bookId: number;
  chapter: number;
  verse: number;
}

const MIN_BOOK_ID = 1;
const MAX_BOOK_ID = 66;
const MIN_CHAPTER = 1;
const MAX_CHAPTER = 999;
const MIN_VERSE = 1;
const MAX_VERSE = 999;

export function makeVerseId(bookId: number, chapter: number, verse: number): number {
  if (!Number.isInteger(bookId) || bookId < MIN_BOOK_ID || bookId > MAX_BOOK_ID) {
    throw new Error(`makeVerseId: bookId ${bookId} is out of range 1-66`);
  }
  if (!Number.isInteger(chapter) || chapter < MIN_CHAPTER || chapter > MAX_CHAPTER) {
    throw new Error(`makeVerseId: chapter ${chapter} is out of range 1-999`);
  }
  if (!Number.isInteger(verse) || verse < MIN_VERSE || verse > MAX_VERSE) {
    throw new Error(`makeVerseId: verse ${verse} is out of range 1-999`);
  }
  return bookId * 1_000_000 + chapter * 1_000 + verse;
}

export function parseVerseId(verseId: number): VerseLocation {
  if (!Number.isInteger(verseId) || verseId < 1_001_001 || verseId > 66_999_999) {
    throw new Error(`parseVerseId: ${verseId} is not a valid verse id`);
  }
  const bookId = Math.floor(verseId / 1_000_000);
  const chapter = Math.floor((verseId % 1_000_000) / 1_000);
  const verse = verseId % 1_000;
  // Re-validate via makeVerseId so range-checking logic isn't duplicated,
  // and so a value like 1000000 (chapter 0) is rejected rather than
  // silently accepted.
  makeVerseId(bookId, chapter, verse);
  return { bookId, chapter, verse };
}
