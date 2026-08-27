/**
 * Generates the committed dev fixture corpus from a full translation export.
 *
 * Why a fixture exists at all: CI must run the noise probes (G8) and latency
 * gate (G11) on every PR, and it cannot rebuild a 31,103-verse corpus from
 * network sources on each run without making the gauntlet slow and dependent
 * on a third party being up. So a small, real, public-domain subset is
 * committed, and CI gates against it.
 *
 * Why a SUBSET and not synthetic text: probe metrics measured against made-up
 * verses would be measuring nothing. These are the actual WEB verses for the
 * passages our golden fixtures name, plus enough surrounding breadth that
 * distinctiveness and churn numbers mean something.
 *
 * Usage:
 *   npx tsx scripts/generateFixture.ts <path-to-full-web-json>
 *
 * The output is deterministic: same input, same bytes out.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BOOKS, findBook } from '../src/books.js';
import { importVpl } from '../src/importers/vplImporter.js';
import type { VerseArrayEntry, VerseArraySource } from '../src/importers/verseArrayImporter.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(HERE, '..', 'fixtures', 'web-subset.json');

/**
 * Passage selection, with the reason each is present. A fixture whose
 * contents nobody can justify becomes impossible to prune later.
 *
 * FULL-BIBLE SELECTION (2026-08-26). Jesse ruled that the search corpus
 * carries the whole Bible — all 66 books, every chapter, every verse — so
 * any searched word surfaces its verses even when no curated layer names
 * them. The selection is therefore derived from the canonical book table
 * rather than hand-enumerated: one entry per book, all chapters. The
 * incremental per-passage selection this constant carried from 2026-07-29
 * to 2026-08-26 (213 chapters, each with its recorded reason — golden
 * anchors, probes, pastoral harm gates, QR-3 verse-level targets) is
 * preserved in the git history of this file; every chapter it justified is
 * contained in this superset, so no recorded rationale loses its verses.
 */
export const SELECTION: readonly {
  book: string;
  chapters?: readonly number[];
  /**
   * Single-verse selections as "chapter:verse" strings, for targets where a
   * whole chapter would be unjustified weight (P5.2/QR-3 added two verses,
   * not two chapters). Unused while the selection is the whole Bible; the
   * mechanism stays for any future scoped fixture.
   */
  verses?: readonly string[];
  why: string;
}[] = BOOKS.map((book) => ({
  book: book.name,
  chapters: Array.from({ length: book.chapterCount }, (_, index) => index + 1),
  why: 'full-Bible corpus (Jesse 2026-08-26): every chapter ships so any searched word surfaces its verses, tagged or not',
}));


/**
 * Adapts eBible's verse-per-line export into the flat verse-array shape the
 * committed fixture uses. Keeps the fixture format stable across a change of
 * upstream distribution format, so nothing downstream of the fixture had to
 * change when WEB was re-admitted from a reachable URL.
 */
function vplAsVerseArray(contents: string): VerseArraySource {
  const { verses } = importVpl(contents);
  return {
    verses: verses.map((verse) => {
      const book = BOOKS.find((candidate) => candidate.id === verse.bookId);
      if (!book) throw new Error(`generateFixture: unknown book id ${verse.bookId}`);
      return {
        book_name: book.name,
        book: verse.bookId,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
      };
    }),
  };
}

interface FixtureFile {
  readonly $schema: string;
  readonly generatedFrom: {
    readonly translation: string;
    readonly sourceSha256: string;
    readonly note: string;
  };
  readonly selection: typeof SELECTION;
  readonly verses: readonly VerseArrayEntry[];
}

function main(): void {
  const sourcePath = process.argv[2];
  if (!sourcePath) {
    process.stderr.write('usage: tsx scripts/generateFixture.ts <path-to-full-web-json>\n');
    process.exit(2);
    return;
  }

  // The checksum recorded in the fixture must be the one in the MANIFEST, so
  // buildFixtureDb's provenance check compares like with like. For the VPL
  // route that is the zip's checksum, not the extracted text's — the zip is
  // what carries the rights record and what anyone else can re-download.
  const raw = readFileSync(sourcePath);
  const source: VerseArraySource = sourcePath.endsWith('.txt')
    ? vplAsVerseArray(readFileSync(sourcePath, 'utf8'))
    : (JSON.parse(raw.toString('utf8')) as VerseArraySource);
  const sourceSha256 = sourcePath.endsWith('.txt')
    ? createHash('sha256').update(readFileSync(join(HERE, '..', 'sources', 'engwebp_vpl.zip'))).digest('hex')
    : createHash('sha256').update(raw).digest('hex');

  // Chapters MERGE across selection entries. A book may legitimately appear
  // more than once — the reason a chapter is in the fixture is worth
  // recording per passage, not flattened into one row per book — and an
  // assigning `set` here would silently drop the earlier entry's chapters.
  // Adding "Matthew 17 — mustard seed" would have deleted Matthew 5-7 and
  // with them golden fixture #1's anchor, with nothing reporting a loss.
  const wanted = new Map<number, Set<number>>();
  const wantedVerses = new Map<number, Set<string>>();
  for (const entry of SELECTION) {
    const book = findBook(entry.book);
    if (!book) throw new Error(`generateFixture: unknown book "${entry.book}"`);
    if (!entry.chapters && !entry.verses) {
      throw new Error(`generateFixture: selection entry for "${entry.book}" names no chapters and no verses`);
    }
    // MERGE chapters across entries for the same book. This used to be
    // `wanted.set(book.id, new Set(entry.chapters))`, which silently discarded
    // every earlier entry for the book — the 2026-07-30 "Isaiah 53" addition
    // overwrote "Isaiah 40, 43", so the committed fixture lacked chapters its
    // own selection record claimed (including the fear-not anchor Isa 43:1-3).
    const bucket = wanted.get(book.id) ?? new Set<number>();
    for (const chapter of entry.chapters ?? []) bucket.add(chapter);
    if (bucket.size > 0) wanted.set(book.id, bucket);
    // Single-verse selections merge the same way, keyed "chapter:verse".
    const verseBucket = wantedVerses.get(book.id) ?? new Set<string>();
    for (const locator of entry.verses ?? []) {
      if (!/^\d{1,3}:\d{1,3}$/.test(locator)) {
        throw new Error(`generateFixture: bad verse locator "${locator}" for "${entry.book}" (want "chapter:verse")`);
      }
      verseBucket.add(locator);
    }
    if (verseBucket.size > 0) wantedVerses.set(book.id, verseBucket);
  }

  const verses = source.verses
    .filter(
      (verse) =>
        (wanted.get(verse.book)?.has(verse.chapter) ?? false) ||
        (wantedVerses.get(verse.book)?.has(`${verse.chapter}:${verse.verse}`) ?? false),
    )
    // Canonical order makes the output byte-stable regardless of source order.
    .sort((a, b) =>
      a.book !== b.book
        ? a.book - b.book
        : a.chapter !== b.chapter
          ? a.chapter - b.chapter
          : a.verse - b.verse,
    );

  if (verses.length === 0) {
    throw new Error('generateFixture: selection matched no verses — is this the right file?');
  }

  const fixture: FixtureFile = {
    $schema: 'verse-array-subset/1',
    generatedFrom: {
      translation: 'WEB',
      sourceSha256,
      note:
        'World English Bible (public domain). Subset generated by ' +
        'scripts/generateFixture.ts; see pipeline/manifests/web.json for rights.',
    },
    selection: SELECTION,
    verses,
  };

  writeFileSync(OUTPUT, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
  process.stdout.write(
    `Wrote ${verses.length} verses to ${OUTPUT}\nSource SHA-256: ${sourceSha256}\n`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
