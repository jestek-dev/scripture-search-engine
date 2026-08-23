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

/**
 * One shipped book-alias row with its canonical book, for the did-you-mean
 * (0.11.0/QR-4). Read through the port exactly once per engine instance and
 * cached by the implementation — the engine does no I/O of its own.
 */
export interface BookAliasEntry {
  readonly aliasKey: string;
  readonly bookId: number;
  readonly bookName: string;
  readonly chapterCount: number;
}

export interface ReferenceResolver {
  resolveBookAlias(aliasKey: string): Promise<ResolvedBook | null>;
  getChapterVerseCount(bookId: number, chapter: number): Promise<number | null>;
  verseExists(bookId: number, chapter: number, verse: number): Promise<boolean>;
  /** Every shipped alias key with its canonical book — the did-you-mean vocabulary. */
  listBookAliases(): Promise<readonly BookAliasEntry[]>;
}

/**
 * A cited did-you-mean on an invalid-reference dead end (0.11.0/QR-4).
 *
 * Suggestion only, NEVER an auto-resolution: curated aliases (human-reviewed)
 * auto-resolve, edit-distance matches only suggest. A machine-guessed book
 * handing reference-level authority to the wrong passage is the one place a
 * spelling error could do maximal theological harm, so the guess is surfaced
 * as a question, with its edit distance as the citation. (J34/J35.)
 */
export interface ReferenceSuggestion {
  /** Canonical name of the unique in-policy book match. */
  readonly book: string;
  /** The full suggested reference label, validated to exist in the corpus. */
  readonly reference: string;
  /** Integer Damerau–Levenshtein distance from the typed book text — the citation. */
  readonly distance: number;
}

export type ReferenceResolutionAttempt =
  | { readonly kind: 'not-reference' }
  | {
      readonly kind: 'invalid-reference';
      /** Present when a unique in-policy near-miss book validated. See ReferenceSuggestion. */
      readonly suggestion?: ReferenceSuggestion;
      /**
       * True for bare-number shapes whose book never resolved and earned no
       * suggestion (J36): "plans 29 11" is a memory query, not a committed
       * reference, and dead-ending it serves nobody. Explicit-separator
       * locators (a colon or dot) state reference intent and stay
       * invalid-reference. Callers with a discovery path honor this flag;
       * lookups (passage(), related()) have nothing to fall through to.
       */
      readonly fallthroughToDiscovery: boolean;
    }
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
/**
 * The space-separated chapter/verse form (0.11.0/QR-4): "John 3 16",
 * "1 corinthians 13 4", "John 3 1-5" — the most common phone-typed shape.
 * The book text must end in a non-digit so an all-numeric query ("3 16")
 * never manufactures a book candidate out of its own leading number.
 */
const SPACE_LOCATOR_RE = /^(.*?[^\s\d])\s+(\d{1,3})\s+(\d{1,3})(?:\s*-\s*(\d{1,3}))?$/;
const DASH_CHARS_RE = /[‒–—―−]/g;
const ROMAN_PREFIX_RE = /^(iii|ii|i)(?=\s|$)/;
const ROMAN_TO_ARABIC: Readonly<Record<string, string>> = {
  i: '1',
  ii: '2',
  iii: '3',
};

/**
 * The ONE edit-policy table (Phase 5 design invariant), keyed by normalized
 * key length: <5 → never suggest; 5–8 → edit distance 1; ≥9 → edit distance 2.
 * A transposition counts as one edit (Damerau). QR-5's token correction
 * mirrors these numbers; eval cross-checks the two stay equal. (J31/J35.)
 */
export const SUGGESTION_MIN_KEY_LENGTH = 5;
export const SUGGESTION_EDIT1_MAX_KEY_LENGTH = 8;

export function editDistanceBudget(keyLength: number): number {
  if (keyLength < SUGGESTION_MIN_KEY_LENGTH) return 0;
  return keyLength <= SUGGESTION_EDIT1_MAX_KEY_LENGTH ? 1 : 2;
}

/**
 * Bounded integer Damerau–Levenshtein (optimal string alignment): unit-cost
 * insert/delete/substitute plus adjacent transposition at cost 1. Pure
 * integer DP — no floats in decisions — and bounded: returns null when the
 * distance exceeds `bound`, so callers never rank on an out-of-policy guess.
 */
export function damerauLevenshtein(a: string, b: string, bound: number): number | null {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > bound) return null;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = [];
  for (let i = 0; i < rows; i += 1) {
    d.push(new Array<number>(cols).fill(0));
    d[i]![0] = i;
  }
  for (let j = 0; j < cols; j += 1) d[0]![j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(
        d[i - 1]![j]! + 1,
        d[i]![j - 1]! + 1,
        d[i - 1]![j - 1]! + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, d[i - 2]![j - 2]! + 1);
      }
      d[i]![j] = value;
    }
  }
  const distance = d[a.length]![b.length]!;
  return distance <= bound ? distance : null;
}

export function normalizeBookAlias(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(ROMAN_PREFIX_RE, (value) => ROMAN_TO_ARABIC[value]!)
    .replace(/[^a-z0-9]/g, '');
}

function syntaxFromLocator(bookText: string, locator: RegExpExecArray): ParsedSyntax {
  return {
    bookText,
    startNumber: Number(locator[1]),
    startVerse: locator[2] === undefined ? null : Number(locator[2]),
    endChapter: locator[3] === undefined ? null : Number(locator[3]),
    endNumber: locator[4] === undefined ? null : Number(locator[4]),
  };
}

interface ParsedCandidates {
  /**
   * Ordered candidate parses. The first entry is exactly the pre-0.11.0
   * grammar's parse, so every input that resolved before resolves identically
   * now — the commit rule (first candidate whose book resolves) can only add
   * outcomes for inputs that previously dead-ended.
   */
  readonly candidates: readonly ParsedSyntax[];
  /**
   * True when the locator used an explicit chapter:verse separator (colon or
   * dot) — committed reference intent, which never falls through to search.
   */
  readonly explicitSeparator: boolean;
}

function parseCandidates(input: string): ParsedCandidates | null {
  const trimmed = input.trim().replace(DASH_CHARS_RE, '-');
  if (!trimmed) return null;
  const compact = COMPACT_DOT_RE.exec(trimmed);
  if (compact) {
    return {
      candidates: [
        {
          bookText: compact[1]!,
          startNumber: Number(compact[2]),
          startVerse: Number(compact[3]),
          endChapter: null,
          endNumber: null,
        },
      ],
      explicitSeparator: true,
    };
  }
  const candidates: ParsedSyntax[] = [];
  let explicitSeparator = false;
  const split = BOOK_LOCATOR_RE.exec(trimmed);
  if (split && split[1]?.trim()) {
    const locator = LOCATOR_RE.exec(split[2]!);
    if (locator) {
      candidates.push(syntaxFromLocator(split[1]!, locator));
      explicitSeparator = /[:.]/.test(split[2]!);
    }
  }
  const spaced = SPACE_LOCATOR_RE.exec(trimmed);
  if (spaced) {
    candidates.push({
      bookText: spaced[1]!,
      startNumber: Number(spaced[2]),
      startVerse: Number(spaced[3]),
      endChapter: null,
      endNumber: spaced[4] === undefined ? null : Number(spaced[4]),
    });
  }
  if (candidates.length === 0) return null;
  return { candidates, explicitSeparator };
}

function verseId(bookId: number, chapter: number, verse: number): number {
  return bookId * 1_000_000 + chapter * 1_000 + verse;
}

/**
 * Renders the label — the explanation surface of a resolved reference
 * (working agreement 5). `wholeChapter` is threaded explicitly from the parse
 * branch that knows it (0.11.0/QR-4): until then the book-and-chapter form
 * was keyed on "starts at verse 1", which mislabeled "John 3:1-5" as
 * "John 3" — the right passage under the wrong name, a contract failure.
 */
function labelFor(
  book: ResolvedBook,
  startChapter: number,
  startVerse: number,
  endChapter: number,
  endVerse: number,
  wholeChapter: boolean,
): string {
  if (wholeChapter) return `${book.name} ${startChapter}`;
  if (startChapter === endChapter) {
    return startVerse === endVerse
      ? `${book.name} ${startChapter}:${startVerse}`
      : `${book.name} ${startChapter}:${startVerse}-${endVerse}`;
  }
  return `${book.name} ${startChapter}:${startVerse}-${endChapter}:${endVerse}`;
}

/**
 * Resolve a parsed locator against a committed book. Null means the locator
 * is invalid for this book (bad chapter, missing verse, inverted range).
 */
async function resolveWithBook(
  book: ResolvedBook,
  syntax: ParsedSyntax,
  resolver: ReferenceResolver,
): Promise<ResolvedReference | null> {
  let startChapter: number;
  let startVerse: number;
  let endChapter: number;
  let endVerse: number;
  let wholeChapter = false;

  if (book.chapterCount === 1 && syntax.startVerse === null) {
    startChapter = 1;
    startVerse = syntax.startNumber;
    endChapter = 1;
    endVerse = syntax.endNumber ?? syntax.startNumber;
  } else if (syntax.startVerse === null) {
    if (syntax.endNumber !== null) return null;
    startChapter = syntax.startNumber;
    startVerse = 1;
    endChapter = startChapter;
    const count = await resolver.getChapterVerseCount(book.id, startChapter);
    if (count === null) return null;
    endVerse = count;
    wholeChapter = true;
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
    return null;
  }
  const startId = verseId(book.id, startChapter, startVerse);
  const endId = verseId(book.id, endChapter, endVerse);
  if (endId < startId) return null;
  return {
    book,
    startChapter,
    startVerse,
    endChapter,
    endVerse,
    startId,
    endId,
    label: labelFor(book, startChapter, startVerse, endChapter, endVerse, wholeChapter),
  };
}

/**
 * The cited did-you-mean (0.11.0/QR-4), run only after every candidate's book
 * failed to resolve. Walks the same candidates in the same order and, for the
 * first one whose typed book text has a UNIQUE in-policy alias match whose
 * locator validates, returns the suggestion.
 *
 * Determinism: the winner is the book at minimum distance; the outcome is a
 * pure function of the typed key and the alias SET (per-book minima and a
 * uniqueness test are row-order independent by construction — pinned by the
 * shuffle test). A tie across books suggests nothing for that candidate: a
 * guess between two books is exactly what this feature refuses to make.
 */
async function suggestForCandidates(
  candidates: readonly ParsedSyntax[],
  resolver: ReferenceResolver,
): Promise<ReferenceSuggestion | null> {
  let aliases: readonly BookAliasEntry[] | null = null;
  for (const syntax of candidates) {
    const typedKey = normalizeBookAlias(syntax.bookText);
    const bound = editDistanceBudget(typedKey.length);
    if (bound === 0) continue;
    aliases ??= await resolver.listBookAliases();
    let min = bound + 1;
    const bestPerBook = new Map<number, { distance: number; name: string; chapterCount: number }>();
    for (const row of aliases) {
      const distance = damerauLevenshtein(typedKey, row.aliasKey, bound);
      if (distance === null) continue;
      const existing = bestPerBook.get(row.bookId);
      if (!existing || distance < existing.distance) {
        bestPerBook.set(row.bookId, {
          distance,
          name: row.bookName,
          chapterCount: row.chapterCount,
        });
      }
      if (distance < min) min = distance;
    }
    if (min > bound) continue;
    const winners = [...bestPerBook.entries()].filter(([, entry]) => entry.distance === min);
    if (winners.length !== 1) continue;
    const [bookId, winner] = winners[0]!;
    const book: ResolvedBook = { id: bookId, name: winner.name, chapterCount: winner.chapterCount };
    // Validate through the exact resolution path the suggestion invites the
    // user to take, so a suggestion never names a passage that cannot exist.
    const reference = await resolveWithBook(book, syntax, resolver);
    if (!reference) continue;
    return { book: book.name, reference: reference.label, distance: min };
  }
  return null;
}

export async function resolveReferenceAttempt(
  input: string,
  resolver: ReferenceResolver,
): Promise<ReferenceResolutionAttempt> {
  const parsed = parseCandidates(input);
  if (!parsed) return { kind: 'not-reference' };

  // Commit rule: the FIRST candidate whose book resolves wins outright. The
  // first candidate is the pre-0.11.0 parse, so every previously-resolving
  // input is preserved bit-for-bit; a committed book with a bad locator is
  // invalid-reference exactly as before, never re-parsed.
  let sawBookText = false;
  for (const syntax of parsed.candidates) {
    const aliasKey = normalizeBookAlias(syntax.bookText);
    if (!aliasKey) continue;
    sawBookText = true;
    const book = await resolver.resolveBookAlias(aliasKey);
    if (!book) continue;
    const reference = await resolveWithBook(book, syntax, resolver);
    return reference
      ? { kind: 'resolved', reference }
      : { kind: 'invalid-reference', fallthroughToDiscovery: false };
  }
  if (!sawBookText) return { kind: 'not-reference' };

  // No candidate's book resolves: cite a did-you-mean if a unique in-policy
  // match validates (J35) …
  const suggestion = await suggestForCandidates(parsed.candidates, resolver);
  if (suggestion) {
    return { kind: 'invalid-reference', suggestion, fallthroughToDiscovery: false };
  }
  // … otherwise explicit-separator queries stay invalid-reference (committed
  // reference intent) and bare-number shapes fall through to discovery (J36).
  return { kind: 'invalid-reference', fallthroughToDiscovery: !parsed.explicitSeparator };
}

export async function resolveReference(
  input: string,
  resolver: ReferenceResolver,
): Promise<ResolvedReference | null> {
  const attempt = await resolveReferenceAttempt(input, resolver);
  return attempt.kind === 'resolved' ? attempt.reference : null;
}
