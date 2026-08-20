/**
 * Compiles the curated ontology (YAML) into artifact rows.
 *
 * Two provenance paths meet here and are deliberately kept separate:
 *
 *  - `sources: [editorial]` anchors are LH's own theological judgment. They
 *    say so, in the artifact and in the result chip.
 *  - `openbibleTopics:` pulls community-voted anchors from OpenBible under
 *    CC BY. Those carry vote-derived weights and cite OpenBible, never us.
 *
 * Collapsing the two would be the single most dishonest thing this pipeline
 * could do — it would let editorial opinion wear the authority of community
 * data, or vice versa.
 */

import { parse as parseYaml } from 'yaml';

import { significantWords } from '@jestek-dev/scripture-engine';
import { findBook } from '../books.js';
import { makeVerseId } from '../verseId.js';

export interface ConceptSource {
  readonly id: string;
  readonly label: string;
  readonly lexicon: readonly string[];
  readonly anchors?: readonly {
    readonly ref: string;
    readonly sources: readonly string[];
    readonly weight?: number;
  }[];
  readonly openbibleTopics?: readonly string[];
  readonly related?: readonly string[];
}

export interface CompiledAnchor {
  readonly conceptId: string;
  readonly startVerseId: number;
  readonly endVerseId: number;
  readonly sourceId: string;
  readonly weight: number;
  readonly locator: string | null;
}

export interface CompiledLexiconEntry {
  readonly conceptId: string;
  readonly phrase: string;
  readonly normalized: string;
  readonly tokenCount: number;
}

export interface CompiledOntology {
  readonly concepts: readonly { id: string; label: string }[];
  readonly lexicon: readonly CompiledLexiconEntry[];
  readonly anchors: readonly CompiledAnchor[];
  readonly related: readonly { conceptId: string; relatedId: string }[];
  /** Topic names each concept subscribes to, for the OpenBible join. */
  readonly topicSubscriptions: readonly { conceptId: string; topic: string }[];
  readonly citedSourceIds: readonly string[];
}

/**
 * Parses "James 1:22-25" / "Psalms 46:1-3" / "Joshua 1:9" into a verse-id
 * range. Deliberately strict: an anchor we cannot resolve exactly is a
 * curation error to be surfaced, never a range to be guessed at.
 */
export function parseAnchorRef(ref: string): { start: number; end: number } | null {
  const match = /^(.+?)\s+(\d{1,3})(?::(\d{1,3}))?(?:\s*-\s*(?:(\d{1,3}):)?(\d{1,3}))?$/.exec(
    ref.trim(),
  );
  if (!match) return null;
  const book = findBook(match[1]!.trim());
  if (!book) return null;

  const startChapter = Number(match[2]);
  const startVerse = match[3] === undefined ? 1 : Number(match[3]);
  const endChapter = match[4] === undefined ? startChapter : Number(match[4]);
  const endVerse = match[5] === undefined ? (match[3] === undefined ? 999 : startVerse) : Number(match[5]);

  try {
    const start = makeVerseId(book.id, startChapter, startVerse);
    const end = makeVerseId(book.id, endChapter, endVerse);
    return end < start ? null : { start, end };
  } catch {
    return null;
  }
}

export function compileOntology(files: readonly { name: string; contents: string }[]): {
  readonly ontology: CompiledOntology;
  readonly errors: readonly string[];
} {
  const errors: string[] = [];
  const concepts: { id: string; label: string }[] = [];
  const lexicon: CompiledLexiconEntry[] = [];
  const anchors: CompiledAnchor[] = [];
  const related: { conceptId: string; relatedId: string }[] = [];
  const topicSubscriptions: { conceptId: string; topic: string }[] = [];
  const citedSourceIds = new Set<string>();
  const seenIds = new Set<string>();

  // Files sorted by name so compilation order — and therefore row order in
  // the artifact — is identical on every machine.
  for (const file of [...files].sort((a, b) => (a.name < b.name ? -1 : 1))) {
    let parsed: ConceptSource;
    try {
      parsed = parseYaml(file.contents) as ConceptSource;
    } catch (error) {
      errors.push(`${file.name}: YAML parse failed — ${(error as Error).message}`);
      continue;
    }
    if (!parsed?.id || !parsed.label) {
      errors.push(`${file.name}: missing required 'id' or 'label'`);
      continue;
    }
    if (seenIds.has(parsed.id)) {
      errors.push(`${file.name}: duplicate concept id '${parsed.id}'`);
      continue;
    }
    seenIds.add(parsed.id);
    concepts.push({ id: parsed.id, label: parsed.label });

    for (const phrase of parsed.lexicon ?? []) {
      const tokens = significantWords(phrase);
      if (tokens.length === 0) {
        errors.push(
          `${parsed.id}: lexicon phrase "${phrase}" normalizes to nothing (all stopwords), ` +
            'so no query could ever match it',
        );
        continue;
      }
      lexicon.push({
        conceptId: parsed.id,
        phrase,
        normalized: tokens.join(' '),
        tokenCount: tokens.length,
      });
    }

    // One anchor ENTRY per range. The engine sums anchor rows, so a concept
    // listing the same range twice double-counts it — exactly how a duplicate
    // 1 Peter 5:7 outranked peace-of-god's own 1.0 anchor. Multiple sources on
    // a single entry (`sources: [torrey, editorial]`) stay legal: that is
    // provenance, not duplication. Overlapping-but-not-identical ranges are a
    // separate reporting concern that lands with `ranking-fixes`.
    const seenAnchorRanges = new Map<string, string>();
    for (const anchor of parsed.anchors ?? []) {
      const range = parseAnchorRef(anchor.ref);
      if (!range) {
        errors.push(`${parsed.id}: could not resolve anchor reference "${anchor.ref}"`);
        continue;
      }
      if (!anchor.sources?.length) {
        errors.push(`${parsed.id}: anchor "${anchor.ref}" declares no sources`);
        continue;
      }
      const rangeKey = `${range.start}:${range.end}`;
      const firstRef = seenAnchorRanges.get(rangeKey);
      if (firstRef !== undefined) {
        errors.push(
          `${parsed.id}: anchor "${anchor.ref}" resolves to the same range as anchor ` +
            `"${firstRef}" — the engine sums duplicate anchors, so a second entry ` +
            'double-counts the passage. Cite every source on one entry instead ' +
            '(sources: [a, b]).',
        );
        continue;
      }
      seenAnchorRanges.set(rangeKey, anchor.ref);
      for (const sourceId of anchor.sources) {
        citedSourceIds.add(sourceId);
        anchors.push({
          conceptId: parsed.id,
          startVerseId: range.start,
          endVerseId: range.end,
          sourceId,
          weight: anchor.weight ?? 1,
          locator: anchor.ref,
        });
      }
    }

    for (const topic of parsed.openbibleTopics ?? []) {
      topicSubscriptions.push({ conceptId: parsed.id, topic: topic.trim().toLowerCase() });
    }
    for (const relatedId of parsed.related ?? []) {
      related.push({ conceptId: parsed.id, relatedId });
    }
  }

  // Related-concept edges must point at concepts that exist, or the graph
  // quietly develops dangling links that no query will ever traverse.
  for (const edge of related) {
    if (!seenIds.has(edge.relatedId)) {
      errors.push(`${edge.conceptId}: related concept '${edge.relatedId}' does not exist`);
    }
  }

  return {
    ontology: {
      concepts,
      lexicon,
      anchors,
      related,
      topicSubscriptions,
      citedSourceIds: [...citedSourceIds].sort(),
    },
    errors,
  };
}
