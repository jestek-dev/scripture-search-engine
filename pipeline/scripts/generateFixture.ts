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
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BOOKS, findBook } from '../src/books.js';
import { importVpl } from '../src/importers/vplImporter.js';
import type { VerseArrayEntry, VerseArraySource } from '../src/importers/verseArrayImporter.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(HERE, '..', 'fixtures', 'web-subset.json');

/**
 * Passage selection, with the reason each is present. A fixture whose
 * contents nobody can justify becomes impossible to prune later.
 */
const SELECTION: readonly { book: string; chapters: readonly number[]; why: string }[] = [
  { book: 'James', chapters: [1, 2], why: 'golden fixture #1 anchor: hearers and doers' },
  { book: 'Matthew', chapters: [5, 6, 7], why: 'fixture #1 anchor (7:24-27) + dense teaching text' },
  { book: 'Luke', chapters: [6], why: 'fixture #1 anchor (6:46-49)' },
  { book: 'Ezekiel', chapters: [33], why: 'fixture #1 acceptable (33:31-32)' },
  { book: 'Romans', chapters: [2, 8], why: 'fixture #1 acceptable (2:13); Rom 8 is high-traffic' },
  { book: 'John', chapters: [1, 13], why: 'fixture #1 acceptable (13:17); John 1 for prologue vocabulary' },
  { book: 'Psalms', chapters: [1, 23, 46, 91, 121], why: 'refuge/shelter probes; Ps 46 reference tests' },
  { book: 'Genesis', chapters: [1, 2, 3, 5], why: 'Gen 5:1 is fixture #1 mustNotRank; Gen 1-3 adds breadth' },
  { book: 'Isaiah', chapters: [40, 43], why: 'refuge/comfort probes; distinct prophetic register' },
  { book: 'Ephesians', chapters: [2], why: 'grace probes' },
  { book: 'Galatians', chapters: [1], why: 'grace probes' },
  { book: 'Hebrews', chapters: [10, 11], why: 'faith/obedience vocabulary' },
  { book: '1 John', chapters: [1, 2], why: 'obedience + walking in light vocabulary' },
  { book: 'Deuteronomy', chapters: [6], why: 'hear/obey vocabulary (Shema) — archaic-fold test material' },
  { book: 'Joshua', chapters: [1], why: 'observe/do vocabulary' },

  // --- Old Testament breadth, added 2026-07-30 ---
  // Layer B went from Psalms-only to 99% of the Bible, but every probe still
  // sat in Psalms and the New Testament. A noise detector aimed away from
  // where the data landed reports quiet whatever happens. These chapters give
  // the probe set something to measure in the genres the OT commentators
  // actually cover: law, narrative, histories, wisdom and prophecy.
  { book: 'Exodus', chapters: [20], why: 'law: the Decalogue — dense legal register' },
  { book: 'Leviticus', chapters: [19], why: 'law: holiness code, the worst-covered genre before KD' },
  { book: 'Numbers', chapters: [6], why: 'law/liturgy: Aaronic blessing; Numbers was the least-covered book' },
  { book: 'Ruth', chapters: [1], why: 'narrative: kinsman-redeemer vocabulary' },
  { book: '1 Kings', chapters: [19], why: 'histories: Elijah at Horeb — narrative with strong imagery' },
  { book: '2 Chronicles', chapters: [7], why: 'histories: "if my people" — Chronicles was 32% covered before KD' },
  { book: 'Nehemiah', chapters: [8], why: 'histories: reading the law; still the weakest OT book' },
  { book: 'Proverbs', chapters: [3], why: 'wisdom: trust/lean-not — distinct sapiential register' },
  { book: 'Ecclesiastes', chapters: [3], why: 'wisdom: a time for everything' },
  { book: 'Isaiah', chapters: [53], why: 'prophets: the suffering servant' },
  { book: 'Jeremiah', chapters: [29], why: 'prophets: plans to prosper you — high-traffic, easily mis-surfaced' },
  { book: 'Micah', chapters: [6], why: 'minor prophets: do justly, love mercy' },
  { book: 'Malachi', chapters: [3], why: 'minor prophets: tithes and the refiner' },
];

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
  readonly selection: readonly { book: string; chapters: readonly number[]; why: string }[];
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

  const wanted = new Map<number, Set<number>>();
  for (const entry of SELECTION) {
    const book = findBook(entry.book);
    if (!book) throw new Error(`generateFixture: unknown book "${entry.book}"`);
    wanted.set(book.id, new Set(entry.chapters));
  }

  const verses = source.verses
    .filter((verse) => wanted.get(verse.book)?.has(verse.chapter) ?? false)
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

main();
