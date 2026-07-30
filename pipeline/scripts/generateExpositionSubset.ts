/**
 * Distils passage-keyed exposition volumes into committed term profiles.
 *
 * The source texts (megabytes of prose) are gitignored and NEVER ship. What
 * lands in the repo is the distillate: term, PMI, count, and provenance — a
 * few bytes per row. That asymmetry is the whole Layer B thesis made concrete.
 *
 * Multi-source by design, because the interesting question is not "does one
 * commentator help" but "does a SECOND commentator on the same passages raise
 * the theological signal, or just add weight?" A single-author corpus surfaces
 * that author's idiolect — PMI faithfully reporting that `mellow` really is
 * distinctive of Maclaren's prose on that psalm. Only vocabulary shared across
 * authors is evidence about the PASSAGE.
 *
 * So this script reports per-source marginal contribution and how many terms
 * more than one source attests, not just a total.
 *
 * Usage: npx tsx scripts/generateExpositionSubset.ts
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findBook } from '../src/books.js';
import { EXPOSITION_SOURCES, type ExpositionSourceSpec } from '../src/expositionSources.js';
import {
  importExpositions,
  importPsalmVerseHeadings,
  stripGutenbergBoilerplate,
} from '../src/importers/expositionImporter.js';
import {
  buildTermProfiles,
  profileDelta,
  type ExpositionDocument,
  type VerseTerm,
} from '../src/stats/passageTerms.js';
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

interface LoadedSource {
  readonly spec: ExpositionSourceSpec;
  readonly documents: ExpositionDocument[];
  readonly sha256: string;
  readonly parsed: number;
  readonly rejected: number;
}

function loadSource(spec: ExpositionSourceSpec): LoadedSource | null {
  const path = join(ROOT, 'sources', spec.file);
  if (!existsSync(path)) return null;

  const raw = readFileSync(path);
  const sha256 = createHash('sha256').update(raw).digest('hex');
  const text = stripGutenbergBoilerplate(raw.toString('utf8'));

  const result =
    spec.strategy === 'citation-suffix'
      ? importExpositions(text, {
          bookId: spec.bookId,
          citationWord: spec.citationWord ?? 'PSALM',
        })
      : importPsalmVerseHeadings(text, { bookId: spec.bookId });

  return {
    spec,
    documents: result.sections.map((section) => ({
      startVerseId: section.startVerseId,
      endVerseId: section.endVerseId,
      sourceId: spec.id,
      authorId: spec.authorId,
      locator: section.citation,
      body: section.body,
    })),
    sha256,
    parsed: result.sections.length,
    rejected: result.rejected,
  };
}

function inFixtureCorpus(terms: readonly VerseTerm[], present: Set<number>): VerseTerm[] {
  return terms.filter((term) => present.has(term.verseId));
}

function main(): void {
  const budgets = JSON.parse(readFileSync(BUDGETS, 'utf8')) as {
    distinctiveness: { minPmi: number; maxTermsPerVerse: number };
  };
  const options = {
    minPmi: budgets.distinctiveness.minPmi,
    maxTermsPerVerse: budgets.distinctiveness.maxTermsPerVerse,
    minCount: 2,
    // Corroboration required when we have more than one expositor. With a
    // single source there is nothing to corroborate against, so the floor
    // drops to 1 rather than silently emptying the layer.
    minSources: 1,
  };
  const present = fixtureVerseIds();

  const loaded: LoadedSource[] = [];
  const missing: string[] = [];
  for (const spec of EXPOSITION_SOURCES) {
    const source = loadSource(spec);
    if (source) loaded.push(source);
    else missing.push(spec.file);
  }
  if (loaded.length === 0) {
    throw new Error(
      'generateExpositionSubset: no source texts found under pipeline/sources/ ' +
        `(looked for ${missing.join(', ')})`,
    );
  }

  const allDocuments = loaded.flatMap((entry) => entry.documents);
  // AUTHORS, not volumes: six volumes of one commentary are one voice, and a
  // reprint is not a second opinion.
  const distinctAuthors = new Set(allDocuments.map((document) => document.authorId)).size;
  const admissionOptions = { ...options, minSources: distinctAuthors > 1 ? 2 : 1 };
  const combined = buildTermProfiles(allDocuments, admissionOptions);
  const combinedInCorpus = inFixtureCorpus(combined.terms, present);

  // Per-source marginal contribution: profiles WITHOUT this source versus with
  // everything. A near-zero delta means the source is redundant given the
  // others — the multi-author form of the saturation question.
  const perSource = loaded.map((entry) => {
    const without = allDocuments.filter((document) => document.sourceId !== entry.spec.id);
    const alone = buildTermProfiles(entry.documents, { ...options, minSources: 1 });
    const marginal =
      without.length > 0
        ? profileDelta(buildTermProfiles(without, admissionOptions).terms, combined.terms)
        : 1;
    return {
      sourceId: entry.spec.id,
      sha256: entry.sha256,
      sectionsParsed: entry.parsed,
      sectionsRejected: entry.rejected,
      termsAloneAdmitted: alone.termsAdmitted,
      marginalProfileDelta: Number(marginal.toFixed(6)),
    };
  });

  // Terms attested by MORE THAN ONE source. These are the rows that are
  // evidence about the PASSAGE rather than about an author's habits, so the
  // count is the headline number for "is adding authors working?"
  const multiAttested = combined.terms.filter((term) => term.sourceCount > 1).length;

  // Saturation on the combined corpus. Reported, never enforced (see G9).
  const half = Math.floor(allDocuments.length / 2);
  const halfDelta =
    half > 0
      ? profileDelta(
          buildTermProfiles(allDocuments.slice(0, half), admissionOptions).terms,
          combined.terms,
        )
      : 1;

  writeFileSync(
    OUT,
    `${JSON.stringify(
      {
        $schema: 'passage-terms-subset/3',
        note:
          'Distilled term profiles from passage-keyed expositions. The source prose is NOT ' +
          'included and never ships; see pipeline/manifests/*.json for rights and method.',
        sources: perSource,
        missingSources: missing,
        stats: {
          documents: allDocuments.length,
          termsConsidered: combined.termsConsidered,
          termsAdmitted: combined.termsAdmitted,
          termsInFixtureCorpus: combinedInCorpus.length,
          minSourcesRequired: admissionOptions.minSources,
          multiSourceAttestedTerms: multiAttested,
          halfCorpusProfileDelta: Number(halfDelta.toFixed(6)),
        },
        terms: combinedInCorpus,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  const lines = [
    `Distilled ${allDocuments.length} exposition(s) from ${loaded.length} source(s)`,
    ...perSource.map(
      (source) =>
        `  ${source.sourceId}: ${source.sectionsParsed} parsed, ` +
        `${source.sectionsRejected} rejected, ${source.termsAloneAdmitted} terms alone, ` +
        `marginal delta ${source.marginalProfileDelta.toFixed(4)}`,
    ),
    `  minSources required: ${admissionOptions.minSources}`,
    `  terms admitted (PMI >= ${options.minPmi}): ${combined.termsAdmitted}`,
    `  terms within fixture corpus: ${combinedInCorpus.length}`,
    `  terms attested by >1 source: ${multiAttested}`,
    `  half-corpus profile delta: ${halfDelta.toFixed(4)}`,
  ];
  if (missing.length > 0) lines.push(`  MISSING source files: ${missing.join(', ')}`);
  process.stdout.write(`${lines.join('\n')}\n`);
}

main();
