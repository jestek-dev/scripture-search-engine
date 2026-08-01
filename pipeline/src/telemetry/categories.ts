/**
 * Sensitive-category matcher — the mechanical half of privacy commitment
 * §4.5 (docs/telemetry-and-gap-mining.md): pastoral-crisis queries are never
 * recorded, consent notwithstanding.
 *
 * Two entry kinds, because the shared tokenizer folds pronouns away:
 * "kill myself" tokenizes to just `kill`, and a token match on that would
 * wrongly drop "thou shalt not kill". So distinctive vocabulary matches on
 * normalized tokens (inflection-folded, the same way concepts match), while
 * pronoun phrases match as substrings of the lightly-normalized raw query,
 * where "myself" still exists.
 *
 * The list itself is reviewed data (`pipeline/telemetry/sensitive-categories.json`)
 * — a pastoral judgment, not code. This module takes whatever the file says.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { significantWords } from '@jestek-dev/scripture-engine';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_LIST_PATH = join(HERE, '..', '..', 'telemetry', 'sensitive-categories.json');

export interface CategoryEntry {
  readonly tokens?: readonly string[];
  readonly phrase?: string;
}

export interface SensitiveCategories {
  readonly v: number;
  readonly categories: readonly { readonly id: string; readonly entries: readonly CategoryEntry[] }[];
}

export function loadSensitiveCategories(path: string = DEFAULT_LIST_PATH): SensitiveCategories {
  return JSON.parse(readFileSync(path, 'utf8')) as SensitiveCategories;
}

/** Lowercase, collapse whitespace, strip straight/curly apostrophes so "don't"/"dont" agree. */
function normalizeRaw(query: string): string {
  return query.toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
}

export interface SensitiveMatcher {
  /** True when the query must never be recorded. Reports no reason on purpose: the caller drops and counts, nothing more. */
  isSensitive(query: string): boolean;
}

export function buildSensitiveMatcher(list: SensitiveCategories): SensitiveMatcher {
  const tokenEntries: string[][] = [];
  const phraseEntries: string[] = [];
  for (const category of list.categories) {
    for (const entry of category.entries) {
      if (entry.tokens && entry.tokens.length > 0) tokenEntries.push([...entry.tokens]);
      if (entry.phrase) phraseEntries.push(normalizeRaw(entry.phrase));
    }
  }

  return {
    isSensitive(query: string): boolean {
      const raw = normalizeRaw(query);
      for (const phrase of phraseEntries) {
        if (raw.includes(phrase)) return true;
      }
      const present = new Set(significantWords(query));
      for (const tokens of tokenEntries) {
        if (tokens.every((token) => present.has(token))) return true;
      }
      return false;
    },
  };
}
