/**
 * Distils a passage-keyed exposition volume into committed term profiles.
 *
 * The source text (1.3 MB of Victorian prose) is gitignored and NEVER
 * shipped. What lands in the repo is this distillate: term, PMI, count, and
 * provenance — a few bytes per row. That asymmetry is the whole Layer B
 * thesis, made concrete: centuries of preaching compressed into a lookup
 * table, with nothing to read at query time.
 *
 * Usage: npx tsx scripts/generateExpositionSubset.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findBook } from '../src/books.js';
import {
  importExpositions,
  stripGutenbergBoilerplate,
} from '../src/importers/expositionImporter.js';
import { buildTermProfiles, profileDelta } from '../src/stats/passageTerms.js';
import { makeVerseId } from '../src/verseId.js';
import type { VerseArrayEntry, VerseArraySource } from '../src/importers/verseArrayImporter.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, 'fixtures', 'passage-terms-subset.json');
const BUDGETS = join(ROOT, '..', 'eval', 'budgets.json');

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
  const sourcePath = join(ROOT, 'sources', 'maclaren-psalms.txt');
  const raw = readFileSync(sourcePath);
  const sha256 = createHash('sha256').update(raw).digest('hex');
  const text = stripGutenbergBoilerplate(raw.toString('utf8'));

  const psalms = findBook('Psalms');
  if (!psalms) throw new Error('Psalms not found in book table');

  const { sections, rejected } = importExpositions(text, {
    bookId: psalms.id,
    citationWord: 'PSALM',
  });

  const budgets = JSON.parse(readFileSync(BUDGETS, 'utf8')) as {
    distinctiveness: { minPmi: number; maxTermsPerPericope: number };
  };

  const documents = sections.map((section) => ({
    startVerseId: section.startVerseId,
    endVerseId: section.endVerseId,
    sourceId: 'maclaren-psalms',
    locator: section.citation,
    body: section.body,
  }));

  const profiles = buildTermProfiles(documents, {
    minPmi: budgets.distinctiveness.minPmi,
    maxTermsPerPericope: budgets.distinctiveness.maxTermsPerPericope,
    minCount: 2,
  });

  // Keep only profiles whose pericope overlaps the fixture corpus. The full
  // artifact build keeps everything; the committed fixture stays small.
  const present = fixtureVerseIds();
  const inCorpus = profiles.terms.filter((term) => {
    for (let id = term.startVerseId; id <= term.endVerseId && id - term.startVerseId < 400; id += 1) {
      if (present.has(id)) return true;
    }
    return false;
  });

  // Demonstrate the saturation measure on real data: how much does the
  // second half of the corpus move profiles built from the first half?
  const half = Math.floor(documents.length / 2);
  const firstHalf = buildTermProfiles(documents.slice(0, half), {
    minPmi: budgets.distinctiveness.minPmi,
    maxTermsPerPericope: budgets.distinctiveness.maxTermsPerPericope,
    minCount: 2,
  });
  const delta = profileDelta(firstHalf.terms, profiles.terms);

  writeFileSync(
    OUT,
    `${JSON.stringify(
      {
        $schema: 'passage-terms-subset/1',
        generatedFrom: { sourceId: 'maclaren-psalms', sha256 },
        note:
          'Distilled term profiles. The source prose is NOT included and never ships; ' +
          'see pipeline/manifests/maclaren-psalms.json for rights and method.',
        stats: {
          sectionsParsed: sections.length,
          sectionsRejected: rejected,
          termsConsidered: profiles.termsConsidered,
          termsAdmitted: profiles.termsAdmitted,
          termsInFixtureCorpus: inCorpus.length,
          halfCorpusProfileDelta: Number(delta.toFixed(6)),
        },
        terms: inCorpus,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  process.stdout.write(
    `Parsed ${sections.length} expositions (${rejected} rejected)\n` +
      `  terms considered: ${profiles.termsConsidered}\n` +
      `  terms admitted (PMI >= ${budgets.distinctiveness.minPmi}): ${profiles.termsAdmitted}\n` +
      `  terms within fixture corpus: ${inCorpus.length}\n` +
      `  half-corpus profile delta: ${delta.toFixed(4)}\n` +
      `  source SHA-256: ${sha256}\n`,
  );
}

main();
