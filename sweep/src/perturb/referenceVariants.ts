/**
 * Verse-reference variants (MS-4): after Phase 5's reference grammar and
 * cited correction, prove them at POPULATION scale. Every anchored verse
 * plus seeded coverage across all 66 books × the format matrix
 * (canonical / lowercase / space / compact / separators / ranges /
 * ordinals / misspellings / chapter-only).
 *
 * Expectations are derived from the SOURCES the runtime itself uses:
 * bookAliasRows() decides whether a book-name variant resolves (the sweep
 * probes exactly the set the engine resolves), and anything outside it
 * expects the TYPED invalid-reference outcome — the §5 typed-kind
 * commitment, verified at population scale.
 */
import { BOOKS, bookAliasRows } from '../../../pipeline/src/books.js';
import { normalizeBookKey } from '../../../pipeline/src/normalize.js';
import { sha256Hex } from '../canonical.js';
import { decisionStream } from '../prng.js';
import type { Expectation, UniverseLine } from '../universe/types.js';

export interface BookNameVariant {
  /** Canonical book name (or its numbered stem), null for a fake book. */
  readonly book: string | null;
  readonly variant: string;
  /** Stem applies to every numbered sibling (1/2 Corinthians, …). */
  readonly numbered?: boolean;
}

export interface ReferenceSpecimen {
  readonly text: string;
  readonly expectedReference: string;
  readonly batteryId?: string;
}

export interface ReferenceVariantOptions {
  readonly seed: string;
  /** Concept anchor references ("Hebrews 11:6", "Matthew 6:25-34"). */
  readonly anchors: readonly string[];
  readonly bookNameVariants: readonly BookNameVariant[];
  /** Battery specimens carried verbatim (ref1–ref8, ms4). */
  readonly specimens: readonly ReferenceSpecimen[];
  /** Seeded format-matrix rows per book (plan sizing: ~2,000 total / 66). */
  readonly perBook: number;
}

const GENERATOR = 'reference-variants';

function lineFor(query: string, expectation: Expectation): UniverseLine {
  return {
    queryId: `${GENERATOR}:${sha256Hex(query).slice(0, 16)}`,
    query,
    generator: GENERATOR,
    category: 'reference-adjacent',
    expectation,
    confidence: 'generated',
  };
}

const FORMATS = [
  'canonical',
  'lowercase',
  'space',
  'compact',
  'separator',
  'range',
  'ordinal',
  'chapter-only',
] as const;

export function generateReferenceVariants(options: ReferenceVariantOptions): UniverseLine[] {
  const aliasKeys = new Set(bookAliasRows().map((row) => row.aliasKey));
  const byId = new Map<string, UniverseLine>();
  const add = (line: UniverseLine): void => {
    if (!byId.has(line.queryId)) byId.set(line.queryId, line);
  };

  // 1. Battery specimens verbatim.
  for (const specimen of options.specimens) {
    add(lineFor(specimen.text, { kind: 'verse-ref', expectedReference: specimen.expectedReference }));
  }

  // 2. Every anchored verse: canonical + lowercase + space + compact forms.
  for (const anchor of [...options.anchors].sort()) {
    add(lineFor(anchor, { kind: 'verse-ref', expectedReference: anchor }));
    add(lineFor(anchor.toLowerCase(), { kind: 'verse-ref', expectedReference: anchor }));
    add(
      lineFor(anchor.replace(/:/g, ' '), { kind: 'verse-ref', expectedReference: anchor }),
    );
    add(
      lineFor(anchor.toLowerCase().replace(/ /g, ''), {
        kind: 'verse-ref',
        expectedReference: anchor,
      }),
    );
  }

  // 3. Seeded format matrix across all 66 books. Verse numbers stay in
  // {1,2} — present in every chapter of the canon — so validity depends
  // only on the format under test, never on verse-count trivia.
  for (const book of BOOKS) {
    for (let counter = 0; counter < options.perBook; counter += 1) {
      const stream = decisionStream(options.seed, 'ref-matrix', book.id, counter);
      const chapter = 1 + stream.nextBelow(book.chapterCount);
      const verse = 1 + stream.nextBelow(2);
      const format = FORMATS[stream.nextBelow(FORMATS.length)]!;
      const canonical = `${book.name} ${chapter}:${verse}`;
      switch (format) {
        case 'canonical':
          add(lineFor(canonical, { kind: 'verse-ref', expectedReference: canonical }));
          break;
        case 'lowercase':
          add(
            lineFor(canonical.toLowerCase(), { kind: 'verse-ref', expectedReference: canonical }),
          );
          break;
        case 'space':
          add(
            lineFor(`${book.name} ${chapter} ${verse}`, {
              kind: 'verse-ref',
              expectedReference: canonical,
            }),
          );
          break;
        case 'compact': {
          const abbreviation = book.abbreviations[stream.nextBelow(Math.max(1, book.abbreviations.length))];
          if (abbreviation === undefined) break;
          add(
            lineFor(`${abbreviation.toLowerCase().replace(/ /g, '')}${chapter}:${verse}`, {
              kind: 'verse-ref',
              expectedReference: canonical,
            }),
          );
          break;
        }
        case 'separator':
          add(
            lineFor(`${book.name} ${chapter}.${verse}`, {
              kind: 'verse-ref',
              expectedReference: canonical,
            }),
          );
          break;
        case 'range': {
          const endVerse = verse + 1 + stream.nextBelow(3);
          add(
            lineFor(`${book.name} ${chapter}:1-${endVerse}`, {
              kind: 'verse-ref',
              expectedReference: `${book.name} ${chapter}:1-${endVerse}`,
            }),
          );
          break;
        }
        case 'ordinal': {
          const match = /^([123]) (.+)$/.exec(book.name);
          if (match === null) {
            add(lineFor(canonical, { kind: 'verse-ref', expectedReference: canonical }));
            break;
          }
          const ordinal = match[1] === '1' ? '1st' : match[1] === '2' ? '2nd' : '3rd';
          add(
            lineFor(`${ordinal} ${match[2]} ${chapter}:${verse}`, {
              kind: 'verse-ref',
              expectedReference: canonical,
            }),
          );
          break;
        }
        case 'chapter-only':
          add(
            lineFor(`${book.name} ${chapter}`, {
              kind: 'verse-ref',
              expectedReference: `${book.name} ${chapter}`,
            }),
          );
          break;
      }
      // Out-of-range chapter: the typed invalid-reference contract.
      if (counter === 0) {
        add(
          lineFor(`${book.name} ${book.chapterCount + 40}:1`, {
            kind: 'verse-ref',
            expectInvalid: true,
          }),
        );
      }
    }
  }

  // 4. Book-name variants: the alias table IS the oracle.
  for (const row of options.bookNameVariants) {
    const targets =
      row.numbered === true
        ? BOOKS.filter((book) => book.name.endsWith(` ${row.book ?? ''}`))
        : row.book !== null
          ? BOOKS.filter((book) => book.name === row.book)
          : [null];
    for (const target of targets) {
      const variantName =
        row.numbered === true && target !== null
          ? `${target.name.split(' ')[0]} ${row.variant}`
          : row.variant;
      const stream = decisionStream(options.seed, 'book-variant', variantName);
      const chapter = target === null ? 1 + stream.nextBelow(20) : 1 + stream.nextBelow(target.chapterCount);
      const verse = 1 + stream.nextBelow(2);
      const query = `${variantName} ${chapter}:${verse}`;
      const resolves = aliasKeys.has(normalizeBookKey(variantName));
      if (resolves && target !== null) {
        add(
          lineFor(query, {
            kind: 'verse-ref',
            expectedReference: `${target.name} ${chapter}:${verse}`,
          }),
        );
      } else {
        add(lineFor(query, { kind: 'verse-ref', expectInvalid: true }));
      }
    }
  }

  const lines = [...byId.values()];
  lines.sort((a, b) => (a.queryId < b.queryId ? -1 : a.queryId > b.queryId ? 1 : 0));
  return lines;
}
