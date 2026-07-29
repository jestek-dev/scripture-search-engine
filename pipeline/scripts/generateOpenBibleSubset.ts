/**
 * Cuts a committed, corpus-scoped subset of the OpenBible datasets.
 *
 * Why this exists: the full downloads are gitignored (rolling URLs, ~14 MB),
 * so CI has no access to them. Without a committed subset, the fixture build
 * would produce different results locally and in CI, and the probe baseline
 * could not mean anything in either place.
 *
 * So the FIXTURE build always uses this subset — hermetic, deterministic,
 * identical everywhere. The full downloads are for real artifact builds.
 *
 * The subset is redistributable: OpenBible's data is CC BY 4.0 and the
 * attribution travels in pipeline/manifests/openbible-*.json and in the
 * header written below.
 *
 * Usage: npx tsx scripts/generateOpenBibleSubset.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findBook } from '../src/books.js';
import { importCrossReferences, importTopicScores } from '../src/importers/openbibleImporter.js';
import { compileOntology } from '../src/importers/ontologyImporter.js';
import { makeVerseId } from '../src/verseId.js';
import type { VerseArrayEntry, VerseArraySource } from '../src/importers/verseArrayImporter.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, 'fixtures', 'openbible-subset.json');

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

function subscribedTopics(): Set<string> {
  const files = ['obedience-to-the-word', 'faith-and-works', 'grace-not-earned',
    'refuge-in-trouble', 'fear-not', 'building-on-the-rock', 'self-deception',
    'walking-in-the-light'].map((name) => ({
    name: `${name}.yaml`,
    contents: readFileSync(join(ROOT, '..', 'ontology', 'concepts', `${name}.yaml`), 'utf8'),
  }));
  const { ontology } = compileOntology(files);
  return new Set(ontology.topicSubscriptions.map((entry) => entry.topic));
}

function main(): void {
  const present = fixtureVerseIds();
  const topics = subscribedTopics();

  const topicRows = importTopicScores(
    readFileSync(join(ROOT, 'sources', 'topic-scores.txt'), 'utf8'),
  ).rows.filter((row) => topics.has(row.topic) && present.has(row.startVerseId));

  const xrefRows = importCrossReferences(
    readFileSync(join(ROOT, 'sources', 'cross_references.txt'), 'utf8'),
  ).rows.filter((row) => present.has(row.fromVerseId) && present.has(row.toStartVerseId));

  const payload = {
    $schema: 'openbible-subset/1',
    attribution:
      'Topical and cross-reference data by OpenBible.info, used under CC BY 4.0. ' +
      'https://www.openbible.info/topics/ and https://www.openbible.info/labs/cross-references/. ' +
      'References and vote scores only; contains no verse text of any translation.',
    note:
      'Corpus-scoped subset of the sources named in pipeline/manifests/openbible-*.json, ' +
      'cut to the verses in web-subset.json so the fixture build is hermetic and identical ' +
      'in CI. Regenerate with scripts/generateOpenBibleSubset.ts.',
    topicRows: [...topicRows].sort((a, b) =>
      a.topic !== b.topic ? (a.topic < b.topic ? -1 : 1) : a.startVerseId - b.startVerseId,
    ),
    crossReferences: [...xrefRows].sort((a, b) =>
      a.fromVerseId !== b.fromVerseId
        ? a.fromVerseId - b.fromVerseId
        : b.votes - a.votes || a.toStartVerseId - b.toStartVerseId,
    ),
  };

  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  process.stdout.write(
    `Wrote ${payload.topicRows.length} topic rows and ${payload.crossReferences.length} ` +
      `cross-references to ${OUT}\n`,
  );
}

main();
