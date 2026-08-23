/**
 * Parses `ontology/lexicon-inventory.yaml` — the reviewed bare-word decision
 * table, one row per compiled concept id.
 *
 * The 2026-08-08 single-token audit's hard lesson was that bare-word
 * behaviour existed with nobody deciding it: multi-word phrases silently
 * collapsed to one significant token and the broadest queries in the product
 * fired concepts by accident. The inventory makes every bare-word decision an
 * explicit, reviewed row: `admitted` tokens MUST fire the concept, `skipped`
 * tokens MUST NOT, and each skip carries the reason a human gave. The
 * companion gate (eval/src/gates/lexiconInventory.ts) enforces the rows
 * against the compiled ontology with the engine's own tokenizer.
 *
 * Parsing is strict and error-returning, never throwing and never guessing —
 * the same discipline as doctrinalReviews.ts: an unreadable decision table
 * must surface as a loud gate finding, because a guardrail that silently
 * skips its own data is decoration.
 *
 * Keying trap, recorded here because it already bit once: rows are keyed by
 * compiled concept **id**, not by filename. The healing concept's id is
 * `prayer-for-healing` while its file is `pastoral-prayer-for-healing.yaml`.
 */

import { parse as parseYaml } from 'yaml';

export interface SkippedBareWord {
  /** The candidate bare word, as a user would type it. */
  readonly token: string;
  /** Why it must not fire — the human decision, never left empty. */
  readonly reason: string;
}

export interface LexiconInventoryRow {
  /** Compiled concept id (ids ≠ filenames — see module comment). */
  readonly conceptId: string;
  /** Bare words that must fire this concept. */
  readonly admitted: readonly string[];
  /** Bare words deliberately kept from firing, each with its reason. */
  readonly skipped: readonly SkippedBareWord[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** A bare word is one typed word: no whitespace, so a phrase cannot hide in a token slot. */
function isBareWord(value: unknown): value is string {
  return nonEmptyString(value) && /^\S+$/.test(value.trim());
}

export function parseLexiconInventory(contents: string): {
  readonly rows: readonly LexiconInventoryRow[];
  readonly errors: readonly string[];
} {
  const errors: string[] = [];
  let parsed: unknown;
  try {
    parsed = parseYaml(contents);
  } catch (error) {
    return {
      rows: [],
      errors: [`not valid YAML: ${error instanceof Error ? error.message : 'parse error'}`],
    };
  }
  if (!isRecord(parsed) || !Array.isArray(parsed['concepts'])) {
    return {
      rows: [],
      errors: ['lexicon-inventory.yaml must contain a top-level `concepts` list'],
    };
  }

  const rows: LexiconInventoryRow[] = [];
  const seen = new Set<string>();
  for (const [index, row] of parsed['concepts'].entries()) {
    const location = `concepts[${index}]`;
    if (!isRecord(row)) {
      errors.push(`${location}: must be an object`);
      continue;
    }
    const id = row['id'];
    if (!nonEmptyString(id)) {
      errors.push(`${location}: id must be a non-empty concept id`);
      continue;
    }
    const conceptId = id.trim();
    if (seen.has(conceptId)) {
      errors.push(`${location}: duplicate row for concept "${conceptId}" — one row per concept id`);
      continue;
    }
    seen.add(conceptId);

    const unknownKeys = Object.keys(row).filter((key) => !['id', 'admitted', 'skipped'].includes(key));
    if (unknownKeys.length > 0) {
      errors.push(`${location} (${conceptId}): unknown field(s) ${unknownKeys.sort().join(', ')}`);
      continue;
    }

    const admittedRaw = row['admitted'] ?? [];
    if (!Array.isArray(admittedRaw)) {
      errors.push(`${location} (${conceptId}): admitted must be a list of bare words`);
      continue;
    }
    const admitted: string[] = [];
    let rowBroken = false;
    for (const [tokenIndex, token] of admittedRaw.entries()) {
      if (!isBareWord(token)) {
        errors.push(
          `${location} (${conceptId}): admitted[${tokenIndex}] must be one bare word, no whitespace`,
        );
        rowBroken = true;
        continue;
      }
      const word = token.trim().toLowerCase();
      if (admitted.includes(word)) {
        errors.push(`${location} (${conceptId}): duplicate admitted token "${word}"`);
        rowBroken = true;
        continue;
      }
      admitted.push(word);
    }

    const skippedRaw = row['skipped'] ?? [];
    if (!Array.isArray(skippedRaw)) {
      errors.push(`${location} (${conceptId}): skipped must be a list of { token, reason } entries`);
      continue;
    }
    const skipped: SkippedBareWord[] = [];
    for (const [entryIndex, entry] of skippedRaw.entries()) {
      const entryLocation = `${location} (${conceptId}): skipped[${entryIndex}]`;
      if (!isRecord(entry)) {
        errors.push(`${entryLocation}: must be an object with token and reason`);
        rowBroken = true;
        continue;
      }
      if (!isBareWord(entry['token'])) {
        errors.push(`${entryLocation}: token must be one bare word, no whitespace`);
        rowBroken = true;
        continue;
      }
      const word = (entry['token'] as string).trim().toLowerCase();
      if (!nonEmptyString(entry['reason'])) {
        // An empty reason is a decision nobody made. The row exists to carry
        // the "why", and a skip without one reads as protection while
        // recording nothing.
        errors.push(`${entryLocation} ("${word}"): reason must be a non-empty explanation`);
        rowBroken = true;
        continue;
      }
      if (skipped.some((existing) => existing.token === word)) {
        errors.push(`${entryLocation}: duplicate skipped token "${word}"`);
        rowBroken = true;
        continue;
      }
      if (admitted.includes(word)) {
        errors.push(
          `${entryLocation}: "${word}" is both admitted and skipped — the row contradicts itself`,
        );
        rowBroken = true;
        continue;
      }
      skipped.push({ token: word, reason: (entry['reason'] as string).trim() });
    }

    if (!rowBroken) rows.push({ conceptId, admitted, skipped });
  }
  return { rows, errors };
}
