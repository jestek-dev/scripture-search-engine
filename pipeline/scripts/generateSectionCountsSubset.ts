/**
 * Cuts a committed, corpus-scoped subset of the OpenBible section counts
 * (P5.6/CO-3 PR 1) — the sibling of generateOpenBibleSubset.ts, split into
 * its own script because it needs ONLY sources/bible-section-counts.txt,
 * so it stays runnable on a machine that has fetched just that file.
 *
 * The fixture build always reads this committed subset — never the full
 * gitignored download — for the same hermeticity reason as the topical and
 * cross-reference subsets: CI has no sources/, and a fixture bed that
 * differs between machines measures nothing.
 *
 * Cut rule: keep every candidate span whose START verse is in the fixture
 * corpus. Boundary sums are computed per start verse, so this keeps every
 * row that can contribute to a boundary the derivation can actually use
 * (a boundary at an absent verse never opens a pericope), and nothing else.
 *
 * The subset is redistributable: CC BY 4.0, counts only — no heading text,
 * no verse text of any translation.
 *
 * Usage: npx tsx scripts/generateSectionCountsSubset.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findBook } from '../src/books.js';
import { importSectionCounts } from '../src/importers/openbibleImporter.js';
import { makeVerseId } from '../src/verseId.js';
import type { VerseArrayEntry, VerseArraySource } from '../src/importers/verseArrayImporter.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, 'fixtures', 'openbible-sections-subset.json');

function fixtureVerseIds(): Set<number> {
  const fixture = JSON.parse(
    readFileSync(join(ROOT, 'fixtures', 'web-subset.json'), 'utf8'),
  ) as VerseArraySource;
  const ids = new Set<number>();
  for (const verse of fixture.verses as VerseArrayEntry[]) {
    const book = findBook(verse.book_name);
    if (book) ids.add(makeVerseId(book.id, verse.chapter, verse.verse));
  }
  return ids;
}

function main(): void {
  const present = fixtureVerseIds();
  const { rows, report } = importSectionCounts(
    readFileSync(join(ROOT, 'sources', 'bible-section-counts.txt'), 'utf8'),
  );
  if (report.rejected > 0) {
    throw new Error(
      `generateSectionCountsSubset: source rejected ${report.rejected} row(s) — ` +
        'the upstream format changed; re-admit the source before regenerating.',
    );
  }
  const sectionRows = rows
    .filter((row) => present.has(row.startVerseId))
    .sort((a, b) => a.startVerseId - b.startVerseId || a.endVerseId - b.endVerseId);

  const payload = {
    $schema: 'openbible-sections-subset/1',
    attribution:
      'Section-placement counts by OpenBible.info, used under CC BY 4.0. ' +
      'Counts only; contains no heading text and no verse text of any translation.',
    note:
      'Corpus-scoped subset of pipeline/manifests/openbible-sections.json, cut to spans ' +
      'starting at verses in web-subset.json so the fixture build is hermetic and identical ' +
      'in CI. Each row is a candidate span with its per-row vote; boundary votes are DERIVED ' +
      'as the sum over rows sharing a start verse (buildPericopes.ts). Regenerate with ' +
      'scripts/generateSectionCountsSubset.ts.',
    sectionRows,
  };
  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  process.stdout.write(
    `wrote ${OUT}\n  candidate spans: ${sectionRows.length} (of ${rows.length} in the full file)\n`,
  );
}

main();
