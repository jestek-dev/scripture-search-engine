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

import { normalizedPhrase, significantWords } from '@jestek-dev/scripture-engine/internal';
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

/**
 * A compiled concept-lexicon phrase, as the ontology importer emits it:
 * `normalized` is the space-joined significant-token form. Structurally
 * compatible with `CompiledLexiconEntry`, so callers pass
 * `ontology.lexicon` straight through.
 */
export interface ConceptLexiconPhrase {
  readonly conceptId: string;
  readonly normalized: string;
}

/** Order-insensitive significant-token-set key for the double-chip guard. */
function tokenSetKey(tokens: readonly string[]): string {
  return [...tokens].sort().join(' ');
}

export function compileHymnAliases(
  files: readonly { name: string; contents: string }[],
  knownConceptIds: ReadonlySet<string>,
  conceptLexicon: readonly ConceptLexiconPhrase[],
): CompiledAliases {
  const errors: string[] = [];
  const rows: CompiledAliasRow[] = [];
  const citedSourceIds = new Set<string>();
  const seenKeys = new Map<string, string>();

  // Alias+lexicon double-chip guard (P5.5 critique defect 1; superset
  // extension per the P5.6-round critique), indexed up front: for each
  // concept, the significant-token SETS of its lexicon phrases. A query
  // that equals an alias phrase tokenizes to significantWords(phrase); when
  // that set CONTAINS a lexicon phrase's set for the SAME concept (equality
  // included), the concept-match step hands the concept an authoritative
  // concept_anchor chip — full-parity when the sets are equal (40 points),
  // coverage-discounted when the alias tokens are a strict superset (~23–36
  // points) — AND the alias step files a second full-strength chip under
  // the same family for the same curated fact: 62–80 same-family points on
  // one claim, clearing exact_phrase's 60-point ceiling either way
  // (demonstrated live: the set-equal doctored row at 80.00, the strict-
  // superset "great is thy faithfulness tonight" at 62.86). The evidence
  // hierarchy's bound must hold by construction, not by editorial memory,
  // so such a row is refused here, fail-closed. Overlap that is NOT
  // containment (the lexicon phrase has a token the alias lacks) stays
  // accepted: the lexicon phrase then cannot fully match the alias-equal
  // query, so no second authoritative chip lands on the same fact. (Static
  // by necessity: a spelling-corrected token stream is bed-dependent and
  // out of an importer's reach; the shipped rule covers the direct-token
  // path the hazard was demonstrated on.)
  const lexiconTokenSetsByConcept = new Map<
    string,
    { readonly tokens: ReadonlySet<string>; readonly normalized: string }[]
  >();
  for (const entry of conceptLexicon) {
    const tokens = new Set(entry.normalized.split(' ').filter(Boolean));
    if (tokens.size === 0) continue;
    const perConcept = lexiconTokenSetsByConcept.get(entry.conceptId) ?? [];
    perConcept.push({ tokens, normalized: entry.normalized });
    lexiconTokenSetsByConcept.set(entry.conceptId, perConcept);
  }

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
        // The double-chip guard (see the index above): a concept-arm phrase
        // whose significant-token set CONTAINS a lexicon phrase of its OWN
        // target concept stacks two authoritative chips on one fact. Set
        // equality is the full-parity worst case (40 + 40 points); a strict
        // superset still stacks the full-strength alias chip on top of a
        // coverage-discounted same-family concept chip (40 + ~23–36); a
        // one-token lexicon twin inside the alias is the same hole (40 + 22).
        // Same fact, same stacking, same structural refusal.
        if (conceptId !== null) {
          const aliasTokens = new Set(significantWords(phrase));
          const contained =
            aliasTokens.size > 0
              ? lexiconTokenSetsByConcept
                  .get(conceptId)
                  ?.find((entry) => [...entry.tokens].every((token) => aliasTokens.has(token)))
              : undefined;
          if (contained !== undefined) {
            const relation = contained.tokens.size === aliasTokens.size ? 'equal' : 'contain';
            errors.push(
              `${file.name}: "${title}" phrase "${phrase}" double-chips concept ` +
                `'${conceptId}': its significant tokens (\`${tokenSetKey([...aliasTokens])}\`) ` +
                `${relation} the concept's own lexicon phrase (\`${contained.normalized}\`), so ` +
                'one query would stack an authoritative Theme chip AND a hymn chip on the ' +
                'same curated fact — breaking the evidence-hierarchy bound by construction. ' +
                'Drop the alias phrase (the lexicon already claims it) or retarget it.',
            );
            continue;
          }
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
