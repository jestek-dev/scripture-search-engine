/**
 * Compiles the curated phrase/hymn alias packs (ontology/aliases/*.yaml)
 * into `curated_aliases` rows (QR-6, 0.13.0).
 *
 * Deliberately strict, like the ontology importer: every failure below is a
 * BUILD ERROR, because an alias row that silently does nothing (dangling
 * concept, unparsable range) or silently does too much (a bare-word
 * trigger, a duplicate key) is worse than one that loudly does not exist.
 *
 * The normalized key is computed with the ENGINE's `normalizedPhrase` —
 * imported, never mirrored — so the build-side key and the query-side key
 * cannot drift (the same one-tokenizer discipline the spelling index uses).
 */

import { parse as parseYaml } from 'yaml';

import { normalizedPhrase } from '@jestek-dev/scripture-engine';
import { parseAnchorRef } from './ontologyImporter.js';

export interface HymnAliasPackSource {
  readonly sourceId: string;
  readonly hymns?: readonly {
    readonly title?: string;
    readonly author?: string;
    readonly year?: number;
    readonly provenance?: string;
    /** XOR with `range`. */
    readonly concept?: string;
    /** XOR with `concept`; a canonical reference range like "1 Peter 2:4-7". */
    readonly range?: string;
    readonly phrases?: readonly { readonly phrase?: string; readonly weight?: number }[];
  }[];
}

/** One compiled curated_aliases row, pre-insertion. */
export interface CompiledAliasRow {
  readonly normalizedRaw: string;
  readonly title: string;
  readonly conceptId: string | null;
  readonly startVerseId: number | null;
  readonly endVerseId: number | null;
  readonly sourceId: string;
  readonly weight: number;
  /** Attribution surfaced in the chip: `Author, "Title" (year)`. */
  readonly locator: string;
}

export interface CompiledAliases {
  /** Rows sorted by normalizedRaw (code units) — the deterministic insert order. */
  readonly rows: readonly CompiledAliasRow[];
  readonly citedSourceIds: readonly string[];
  readonly errors: readonly string[];
}

export function compileHymnAliases(
  files: readonly { name: string; contents: string }[],
  knownConceptIds: ReadonlySet<string>,
): CompiledAliases {
  const errors: string[] = [];
  const rows: CompiledAliasRow[] = [];
  const citedSourceIds = new Set<string>();
  const seenKeys = new Map<string, string>();

  for (const file of [...files].sort((a, b) => (a.name < b.name ? -1 : 1))) {
    let parsed: HymnAliasPackSource;
    try {
      parsed = parseYaml(file.contents) as HymnAliasPackSource;
    } catch (error) {
      errors.push(`${file.name}: YAML parse failed — ${(error as Error).message}`);
      continue;
    }
    if (!parsed?.sourceId || typeof parsed.sourceId !== 'string') {
      errors.push(`${file.name}: missing required 'sourceId'`);
      continue;
    }

    for (const hymn of parsed.hymns ?? []) {
      const title = typeof hymn.title === 'string' ? hymn.title.trim() : '';
      if (!title) {
        errors.push(`${file.name}: hymn entry missing required 'title'`);
        continue;
      }
      // Public-domain discipline: provenance is per-row DATA, not folklore.
      if (typeof hymn.author !== 'string' || !hymn.author.trim()) {
        errors.push(`${file.name}: "${title}" missing required 'author'`);
        continue;
      }
      if (typeof hymn.year !== 'number' || !Number.isInteger(hymn.year)) {
        errors.push(`${file.name}: "${title}" missing required integer 'year'`);
        continue;
      }
      if (typeof hymn.provenance !== 'string' || !hymn.provenance.trim()) {
        errors.push(`${file.name}: "${title}" missing required 'provenance'`);
        continue;
      }

      // Exactly one target — the schema XOR, enforced before any row exists.
      const hasConcept = hymn.concept !== undefined;
      const hasRange = hymn.range !== undefined;
      if (hasConcept === hasRange) {
        errors.push(
          `${file.name}: "${title}" must target exactly one of 'concept' or 'range' ` +
            `(has ${hasConcept ? 'both' : 'neither'})`,
        );
        continue;
      }
      let conceptId: string | null = null;
      let startVerseId: number | null = null;
      let endVerseId: number | null = null;
      if (hasConcept) {
        conceptId = String(hymn.concept);
        if (!knownConceptIds.has(conceptId)) {
          errors.push(`${file.name}: "${title}" targets unknown concept '${conceptId}'`);
          continue;
        }
      } else {
        const range = parseAnchorRef(String(hymn.range));
        if (!range) {
          errors.push(
            `${file.name}: "${title}" range "${String(hymn.range)}" is not a canonical ` +
              'scripture range',
          );
          continue;
        }
        startVerseId = range.start;
        endVerseId = range.end;
      }

      if (!hymn.phrases?.length) {
        errors.push(`${file.name}: "${title}" declares no phrases`);
        continue;
      }
      for (const entry of hymn.phrases) {
        const phrase = typeof entry.phrase === 'string' ? entry.phrase : '';
        const normalizedRaw = normalizedPhrase(phrase);
        if (!normalizedRaw) {
          errors.push(`${file.name}: "${title}" phrase "${phrase}" normalizes to nothing`);
          continue;
        }
        // An alias may never become a bare-word trigger (the F5 class): a
        // one-word key would silently claim every future typed word equal to
        // it, which is the concept lexicon's job under its thin-cue rules,
        // not this table's.
        if (normalizedRaw.split(' ').length < 2) {
          errors.push(
            `${file.name}: "${title}" phrase "${phrase}" has fewer than two raw words — ` +
              'an alias may never be a bare-word trigger',
          );
          continue;
        }
        const previous = seenKeys.get(normalizedRaw);
        if (previous !== undefined) {
          errors.push(
            `${file.name}: "${title}" phrase "${phrase}" duplicates the normalized key ` +
              `"${normalizedRaw}" (first defined by ${previous}) — one key, one claim`,
          );
          continue;
        }
        const weight = entry.weight ?? 1;
        if (typeof weight !== 'number' || !(weight > 0) || weight > 1) {
          errors.push(
            `${file.name}: "${title}" phrase "${phrase}" weight must be in (0, 1], got ` +
              `${String(entry.weight)}`,
          );
          continue;
        }
        seenKeys.set(normalizedRaw, `${title} (${file.name})`);
        citedSourceIds.add(parsed.sourceId);
        rows.push({
          normalizedRaw,
          title,
          conceptId,
          startVerseId,
          endVerseId,
          sourceId: parsed.sourceId,
          weight,
          locator: `${hymn.author.trim()}, "${title}" (${hymn.year})`,
        });
      }
    }
  }

  return {
    // Code-unit sorted: the deterministic insert (and rowid) order.
    rows: [...rows].sort((a, b) => (a.normalizedRaw < b.normalizedRaw ? -1 : 1)),
    citedSourceIds: [...citedSourceIds].sort(),
    errors,
  };
}
