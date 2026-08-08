/**
 * Corroboration softness — where "two authors agree" is thinner than it reads.
 *
 * The corroboration rule counts AUTHORS who used a term in a section covering
 * a verse. It does not ask how tightly that section was aimed. Every author's
 * span projects onto every verse it covers, so a term from Matthew Henry's
 * six-verse essay corroborates Clarke's verse-specific note anywhere inside
 * that essay's range.
 *
 * `minSpanVerses` records the NARROWEST attesting span, and query-time scoring
 * already discounts diffuse evidence with it. What no one has looked at is the
 * DISTRIBUTION: in books where every author writes long sections, "two authors
 * agree about this verse" can mean "two authors wrote overlapping essays that
 * both happened to contain this word". That is materially weaker evidence than
 * the same statement in a book both authors treat verse by verse — and it is
 * currently invisible.
 *
 * This reports; it changes no admission rule. Measure first: if the
 * distribution shows narrative books are soft, tightening admission (say,
 * requiring at least one attesting span under some width) becomes a proposal
 * with a number attached instead of a guess. If it shows softness is rare, the
 * rule is fine as it stands and we have stopped wondering.
 *
 * Usage: npx tsx scripts/reportSpanSoftness.ts [--json]
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BOOKS } from '../src/books.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const DISTILLATE = join(HERE, '..', 'fixtures', 'passage-terms-subset.json');

/** A term admitted at a verse, as the distillate records it. */
interface DistillateTerm {
  readonly verseId: number;
  readonly term: string;
  readonly minSpanVerses: number;
  readonly authorCount: number;
}

/**
 * Verse ids encode book in their leading digits (bbcccvvv), so the book is
 * arithmetic rather than a join — the distillate carries no book column.
 */
function bookIdOf(verseId: number): number {
  return Math.floor(verseId / 1_000_000);
}

export interface BookSoftness {
  readonly bookId: number;
  readonly bookName: string;
  readonly terms: number;
  /** Terms whose narrowest attesting section was a single verse. */
  readonly tightTerms: number;
  /** Terms whose narrowest attesting section spanned more than 12 verses. */
  readonly diffuseTerms: number;
  readonly medianSpan: number;
  readonly meanSpan: number;
  /** Share of terms attested only by wide sections — the softness measure. */
  readonly diffuseShare: number;
}

const DIFFUSE_SPAN_THRESHOLD = 12;

export function measureSoftness(terms: readonly DistillateTerm[]): readonly BookSoftness[] {
  const byBook = new Map<number, number[]>();
  for (const term of terms) {
    const book = bookIdOf(term.verseId);
    const bucket = byBook.get(book);
    if (bucket) bucket.push(term.minSpanVerses);
    else byBook.set(book, [term.minSpanVerses]);
  }

  const names = new Map(BOOKS.map((book) => [book.id, book.name]));
  const rows: BookSoftness[] = [];
  for (const [bookId, spans] of byBook) {
    spans.sort((a, b) => a - b);
    const tight = spans.filter((span) => span === 1).length;
    const diffuse = spans.filter((span) => span > DIFFUSE_SPAN_THRESHOLD).length;
    const middle = spans[Math.floor(spans.length / 2)] ?? 0;
    rows.push({
      bookId,
      bookName: names.get(bookId) ?? `book ${bookId}`,
      terms: spans.length,
      tightTerms: tight,
      diffuseTerms: diffuse,
      medianSpan: middle,
      meanSpan: Number((spans.reduce((sum, s) => sum + s, 0) / spans.length).toFixed(2)),
      diffuseShare: Number((diffuse / spans.length).toFixed(4)),
    });
  }
  // Softest first: that is the list a curator wants to read.
  return rows.sort((a, b) =>
    b.diffuseShare !== a.diffuseShare ? b.diffuseShare - a.diffuseShare : a.bookId - b.bookId,
  );
}

function main(): void {
  const file = JSON.parse(readFileSync(DISTILLATE, 'utf8')) as { terms: DistillateTerm[] };
  const rows = measureSoftness(file.terms);

  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
    return;
  }

  const total = file.terms.length;
  const allTight = file.terms.filter((term) => term.minSpanVerses === 1).length;
  const allDiffuse = file.terms.filter(
    (term) => term.minSpanVerses > DIFFUSE_SPAN_THRESHOLD,
  ).length;

  process.stdout.write(
    `Corroboration softness — ${total} admitted terms\n` +
      `  attested by a one-verse note : ${allTight} (${((allTight / total) * 100).toFixed(1)}%)\n` +
      `  attested only by >${DIFFUSE_SPAN_THRESHOLD}-verse sections : ${allDiffuse} ` +
      `(${((allDiffuse / total) * 100).toFixed(1)}%)\n\n` +
      `${'book'.padEnd(18)}${'terms'.padStart(8)}${'tight%'.padStart(9)}` +
      `${'diffuse%'.padStart(10)}${'median'.padStart(8)}${'mean'.padStart(8)}\n`,
  );
  for (const row of rows) {
    process.stdout.write(
      row.bookName.padEnd(18) +
        String(row.terms).padStart(8) +
        `${((row.tightTerms / row.terms) * 100).toFixed(1)}%`.padStart(9) +
        `${(row.diffuseShare * 100).toFixed(1)}%`.padStart(10) +
        String(row.medianSpan).padStart(8) +
        String(row.meanSpan).padStart(8) +
        '\n',
    );
  }
  process.stdout.write(
    '\nRead this as: a high diffuse% means corroboration in that book rests on\n' +
      'authors writing overlapping wide sections rather than on anyone treating\n' +
      'the verse directly. No admission rule changes on this number alone.\n',
  );
}

if (process.argv[1]?.endsWith('reportSpanSoftness.ts')) main();
