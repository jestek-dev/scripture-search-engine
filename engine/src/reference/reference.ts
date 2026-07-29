export interface ResolvedBook {
  readonly id: number;
  readonly name: string;
  readonly chapterCount: number;
}

export interface ResolvedReference {
  readonly book: ResolvedBook;
  readonly startChapter: number;
  readonly startVerse: number;
  readonly endChapter: number;
  readonly endVerse: number;
  readonly startId: number;
  readonly endId: number;
  readonly label: string;
}

export interface ReferenceResolver {
  resolveBookAlias(aliasKey: string): Promise<ResolvedBook | null>;
  getChapterVerseCount(bookId: number, chapter: number): Promise<number | null>;
  verseExists(bookId: number, chapter: number, verse: number): Promise<boolean>;
}

export type ReferenceResolutionAttempt =
  | { readonly kind: 'not-reference' }
  | { readonly kind: 'invalid-reference' }
  | { readonly kind: 'resolved'; readonly reference: ResolvedReference };

interface ParsedSyntax {
  readonly bookText: string;
  readonly startNumber: number;
  readonly startVerse: number | null;
  readonly endChapter: number | null;
  readonly endNumber: number | null;
}

const COMPACT_DOT_RE = /^([1-3]?\s?[A-Za-z]+)\.(\d{1,3})\.(\d{1,3})$/;
const BOOK_LOCATOR_RE =
  /^(.*?)\s*\.?\s*(\d{1,3}(?:\s*[:.]\s*\d{1,3})?(?:\s*-\s*(?:\d{1,3}\s*[:.]\s*)?\d{1,3})?)$/;
const LOCATOR_RE =
  /^(\d{1,3})(?:\s*[:.]\s*(\d{1,3}))?(?:\s*-\s*(?:(\d{1,3})\s*[:.]\s*)?(\d{1,3}))?$/;
const DASH_CHARS_RE = /[‒–—―−]/g;
const ROMAN_PREFIX_RE = /^(iii|ii|i)(?=\s|$)/;
const ROMAN_TO_ARABIC: Readonly<Record<string, string>> = {
  i: '1',
  ii: '2',
  iii: '3',
};

export function normalizeBookAlias(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(ROMAN_PREFIX_RE, (value) => ROMAN_TO_ARABIC[value]!)
    .replace(/[^a-z0-9]/g, '');
}

function parseSyntax(input: string): ParsedSyntax | null {
  const trimmed = input.trim().replace(DASH_CHARS_RE, '-');
  if (!trimmed) return null;
  const compact = COMPACT_DOT_RE.exec(trimmed);
  if (compact) {
    return {
      bookText: compact[1]!,
      startNumber: Number(compact[2]),
      startVerse: Number(compact[3]),
      endChapter: null,
      endNumber: null,
    };
  }
  const split = BOOK_LOCATOR_RE.exec(trimmed);
  if (!split || !split[1]?.trim()) return null;
  const locator = LOCATOR_RE.exec(split[2]!);
  if (!locator) return null;
  return {
    bookText: split[1]!,
    startNumber: Number(locator[1]),
    startVerse: locator[2] === undefined ? null : Number(locator[2]),
    endChapter: locator[3] === undefined ? null : Number(locator[3]),
    endNumber: locator[4] === undefined ? null : Number(locator[4]),
  };
}

function verseId(bookId: number, chapter: number, verse: number): number {
  return bookId * 1_000_000 + chapter * 1_000 + verse;
}

function labelFor(
  book: ResolvedBook,
  startChapter: number,
  startVerse: number,
  endChapter: number,
  endVerse: number,
): string {
  if (startChapter === endChapter && startVerse === 1) {
    return startVerse === endVerse
      ? `${book.name} ${startChapter}:${startVerse}`
      : `${book.name} ${startChapter}`;
  }
  if (startChapter === endChapter) {
    return startVerse === endVerse
      ? `${book.name} ${startChapter}:${startVerse}`
      : `${book.name} ${startChapter}:${startVerse}-${endVerse}`;
  }
  return `${book.name} ${startChapter}:${startVerse}-${endChapter}:${endVerse}`;
}

export async function resolveReferenceAttempt(
  input: string,
  resolver: ReferenceResolver,
): Promise<ReferenceResolutionAttempt> {
  const syntax = parseSyntax(input);
  if (!syntax) return { kind: 'not-reference' };
  const aliasKey = normalizeBookAlias(syntax.bookText);
  if (!aliasKey) return { kind: 'not-reference' };
  const book = await resolver.resolveBookAlias(aliasKey);
  if (!book) return { kind: 'invalid-reference' };

  let startChapter: number;
  let startVerse: number;
  let endChapter: number;
  let endVerse: number;

  if (book.chapterCount === 1 && syntax.startVerse === null) {
    startChapter = 1;
    startVerse = syntax.startNumber;
    endChapter = 1;
    endVerse = syntax.endNumber ?? syntax.startNumber;
  } else if (syntax.startVerse === null) {
    if (syntax.endNumber !== null) return { kind: 'invalid-reference' };
    startChapter = syntax.startNumber;
    startVerse = 1;
    endChapter = startChapter;
    const count = await resolver.getChapterVerseCount(book.id, startChapter);
    if (count === null) return { kind: 'invalid-reference' };
    endVerse = count;
  } else {
    startChapter = syntax.startNumber;
    startVerse = syntax.startVerse;
    endChapter = syntax.endChapter ?? startChapter;
    endVerse = syntax.endNumber ?? startVerse;
  }

  if (
    startChapter < 1 ||
    endChapter < 1 ||
    startChapter > book.chapterCount ||
    endChapter > book.chapterCount ||
    startVerse < 1 ||
    endVerse < 1 ||
    !(await resolver.verseExists(book.id, startChapter, startVerse)) ||
    !(await resolver.verseExists(book.id, endChapter, endVerse))
  ) {
    return { kind: 'invalid-reference' };
  }
  const startId = verseId(book.id, startChapter, startVerse);
  const endId = verseId(book.id, endChapter, endVerse);
  if (endId < startId) return { kind: 'invalid-reference' };
  return {
    kind: 'resolved',
    reference: {
      book,
      startChapter,
      startVerse,
      endChapter,
      endVerse,
      startId,
      endId,
      label: labelFor(book, startChapter, startVerse, endChapter, endVerse),
    },
  };
}

export async function resolveReference(
  input: string,
  resolver: ReferenceResolver,
): Promise<ResolvedReference | null> {
  const attempt = await resolveReferenceAttempt(input, resolver);
  return attempt.kind === 'resolved' ? attempt.reference : null;
}
