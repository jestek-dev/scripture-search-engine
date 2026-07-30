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
import {
  importSwordZcom,
  type SwordEntry,
  type SwordTestamentFiles,
} from './importers/swordZcomImporter.js';
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

/**
 * Recovers an author's real spans from a verse-indexed module.
 *
 * SWORD modules must supply a body for every verse, so a commentator who
 * writes by section has his one essay stored against each verse it covers.
 * Taken literally that would claim VERSE-LEVEL precision for section-level
 * commentary — Matthew Henry would appear to have written 31,098 verse notes
 * with `min_span_verses: 1`, outranking Clarke's genuinely verse-specific
 * notes on their own ground, and inflating every term count by the length of
 * the run.
 *
 * Collapsing consecutive identical bodies restores what the author actually
 * did. Measured: Henry 31,098 entries -> 4,249 documents at a median span of
 * 6 verses (his sections); Clarke 21,052 -> 21,051 at span 1 (genuinely
 * per-verse). The same rule reads both correctly, which is the test of
 * whether it is describing the sources or flattering one of them.
 *
 * This is the granularity principle from the implementation plan §3.1 applied
 * to a new source shape: authors keep their natural spans, and specificity is
 * scored rather than assumed.
 */
function collapseRepeatedBodies(
  entries: readonly SwordEntry[],
  spec: ExpositionSourceSpec,
): ExpositionDocument[] {
  const documents: ExpositionDocument[] = [];
  let index = 0;
  while (index < entries.length) {
    const first = entries[index]!;
    let end = index + 1;
    // A run never crosses a book boundary: identical text either side of one
    // would be a coincidence, not one essay.
    while (
      end < entries.length &&
      entries[end]!.bookId === first.bookId &&
      entries[end]!.body === first.body
    ) {
      end += 1;
    }
    const last = entries[end - 1]!;
    documents.push({
      startVerseId: first.verseId,
      endVerseId: last.verseId,
      sourceId: spec.id,
      authorId: spec.authorId,
      locator:
        first.verseId === last.verseId
          ? `${first.bookId}.${first.chapter}.${first.verse}`
          : `${first.bookId}.${first.chapter}.${first.verse}-${last.chapter}.${last.verse}`,
      body: first.body,
    });
    index = end;
  }
  return documents;
}

function readTestament(directory: string, prefix: string): SwordTestamentFiles | undefined {
  const bzsPath = join(directory, `${prefix}.bzs`);
  if (!existsSync(bzsPath)) return undefined;
  const bzs = readFileSync(bzsPath);
  const bzz = readFileSync(join(directory, `${prefix}.bzz`));
  // A single-testament module (Keil & Delitzsch is Old Testament only, Barnes
  // New Testament only) still ships a full-size index for the testament it
  // does not cover, with every entry empty and no data blocks behind it.
  // Treat that as absent rather than as a testament of blank commentary.
  if (bzs.length === 0 || bzz.length === 0) return undefined;
  return { bzs, bzv: readFileSync(join(directory, `${prefix}.bzv`)), bzz };
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
    const documents = collapseRepeatedBodies(result.entries, spec);
    return {
      spec,
      documents,
      parsed: documents.length,
      rejected: 0,
      notes: [
        ...result.verseNumberMismatches.map(
          (message) => `printed verse number disagrees with index: ${message}`,
        ),
        `${result.entries.length} index entries -> ${documents.length} documents ` +
          `(mean span ${(
            documents.reduce((sum, d) => sum + (d.endVerseId - d.startVerseId + 1), 0) /
            Math.max(1, documents.length)
          ).toFixed(2)} verses)`,
      ],
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
