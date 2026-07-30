/**
 * Turns an exposition source spec into documents, whatever its format.
 *
 * Shared by the committed-subset generator and the full artifact build,
 * because those two must produce term profiles under identical rules — if
 * they drift, CI's measurements describe something other than what ships,
 * and every gate downstream is measuring the wrong artifact.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ExpositionSourceSpec } from './expositionSources.js';
import {
  importExpositions,
  importPsalmVerseHeadings,
  stripGutenbergBoilerplate,
} from './importers/expositionImporter.js';
import { importSwordZcom, type SwordTestamentFiles } from './importers/swordZcomImporter.js';
import type { ExpositionDocument } from './stats/passageTerms.js';

export interface LoadedExposition {
  readonly spec: ExpositionSourceSpec;
  readonly documents: readonly ExpositionDocument[];
  readonly parsed: number;
  readonly rejected: number;
  /** Human-readable notes worth surfacing in a build log or report. */
  readonly notes: readonly string[];
}

/**
 * Clarke's Matthew 23:14 note opens "Verse 13" — a genuine editorial
 * renumbering around a textual variant, not a mapping error. Tolerating a
 * handful of these is safe precisely because the failure we fear is
 * systematic: an off-by-one in the versification walk misaligns thousands of
 * entries, not one.
 */
const VERSE_NUMBER_MISMATCH_TOLERANCE = 10;

function readTestament(directory: string, prefix: string): SwordTestamentFiles | undefined {
  const bzs = join(directory, `${prefix}.bzs`);
  if (!existsSync(bzs)) return undefined;
  return {
    bzs: readFileSync(bzs),
    bzv: readFileSync(join(directory, `${prefix}.bzv`)),
    bzz: readFileSync(join(directory, `${prefix}.bzz`)),
  };
}

export function loadExposition(
  spec: ExpositionSourceSpec,
  sourcesRoot: string,
): LoadedExposition | null {
  const path = join(sourcesRoot, spec.file);
  if (!existsSync(path)) return null;

  if (spec.strategy === 'sword-zcom') {
    const result = importSwordZcom(
      { ot: readTestament(path, 'ot'), nt: readTestament(path, 'nt') },
      { strict: true, mismatchTolerance: VERSE_NUMBER_MISMATCH_TOLERANCE },
    );
    return {
      spec,
      // A verse-keyed note has a span of exactly one verse, which is the
      // tightest evidence Layer B can carry: min_span_verses = 1 everywhere.
      documents: result.entries.map((entry) => ({
        startVerseId: entry.verseId,
        endVerseId: entry.verseId,
        sourceId: spec.id,
        authorId: spec.authorId,
        locator: `${entry.bookId}.${entry.chapter}.${entry.verse}`,
        body: entry.body,
      })),
      parsed: result.entries.length,
      rejected: 0,
      notes: result.verseNumberMismatches.map(
        (message) => `printed verse number disagrees with index: ${message}`,
      ),
    };
  }

  if (spec.bookId === undefined) {
    throw new Error(`loadExposition: ${spec.id} uses ${spec.strategy} but declares no bookId`);
  }

  const text = stripGutenbergBoilerplate(readFileSync(path, 'utf8'));
  const result =
    spec.strategy === 'psalm-verse-headings'
      ? importPsalmVerseHeadings(text, { bookId: spec.bookId })
      : importExpositions(text, {
          bookId: spec.bookId,
          citationWord: spec.citationWord ?? 'PSALM',
        });

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
    parsed: result.sections.length,
    rejected: result.rejected,
    notes: [],
  };
}
