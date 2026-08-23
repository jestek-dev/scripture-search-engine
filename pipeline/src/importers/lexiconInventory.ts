/**
 * Parses `ontology/lexicon-inventory.yaml` — the reviewed acknowledgment
 * record for lexicon phrases whose real matching width is one token.
 *
 * A stopword-heavy phrase normalizing to one common token is a different
 * object than a deliberate bare-word trigger; this file is where a human
 * says, per phrase, that the collapse is intended. Every entry under
 * `collapses:` acknowledges one live `singleTokenCollapses` finding
 * (eval/src/gates/collision.ts) — the gate turns unacknowledged or stale
 * collapses into G4 failures, so the acknowledgment can never silently
 * drift from the lexicon it describes.
 *
 * The file is shared reviewed data: future bare-word inventory sections
 * (per-concept admitted/skipped rows — one file, one gate, two consumers)
 * add their own top-level keys, so unknown top-level keys are tolerated
 * here; the `collapses` list itself is validated strictly. Parsing is
 * error-returning, never throwing and never guessing, for the same reason
 * as doctrinalReviews.ts: an unreadable acknowledgment record must surface
 * as a loud gate finding, not vanish.
 */

import { parse as parseYaml } from 'yaml';

export interface LexiconCollapseAcknowledgment {
  readonly conceptId: string;
  readonly phrase: string;
  readonly token: string;
  /** Literally `true` — an unintended collapse is fixed in the lexicon, not recorded here. */
  readonly intended: true;
  readonly reviewedBy: string;
  readonly date: string;
  readonly note: string;
}

/**
 * Canonical (conceptId, phrase) key. Shared by this parser's duplicate check
 * and the G4 deny-list's acknowledgment matching (eval/src/gates/collision.ts)
 * — they are two halves of one mechanism, so they must join identically.
 * NUL cannot occur inside a YAML scalar, so the joined key is unambiguous;
 * written as an escape, never a raw byte, so this file stays text to git and
 * the mechanism stays reviewable in a PR diff.
 */
export function collapseAcknowledgmentKey(conceptId: string, phrase: string): string {
  return `${conceptId}\u0000${phrase}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function parseLexiconInventory(contents: string): {
  readonly collapses: readonly LexiconCollapseAcknowledgment[];
  readonly errors: readonly string[];
} {
  const errors: string[] = [];
  let parsed: unknown;
  try {
    parsed = parseYaml(contents);
  } catch (error) {
    return {
      collapses: [],
      errors: [`not valid YAML: ${error instanceof Error ? error.message : 'parse error'}`],
    };
  }
  if (!isRecord(parsed) || !Array.isArray(parsed['collapses'])) {
    return {
      collapses: [],
      errors: ['lexicon-inventory.yaml must contain a top-level `collapses` list'],
    };
  }

  const collapses: LexiconCollapseAcknowledgment[] = [];
  const seen = new Set<string>();
  for (const [index, row] of parsed['collapses'].entries()) {
    const location = `collapses[${index}]`;
    if (!isRecord(row)) {
      errors.push(`${location}: must be an object`);
      continue;
    }
    if (!nonEmptyString(row['conceptId'])) {
      errors.push(`${location}: conceptId must be a non-empty string`);
      continue;
    }
    const conceptId = (row['conceptId'] as string).trim();
    if (!nonEmptyString(row['phrase'])) {
      errors.push(`${location} (${conceptId}): phrase must be the lexicon phrase verbatim`);
      continue;
    }
    const phrase = row['phrase'] as string;
    const key = collapseAcknowledgmentKey(conceptId, phrase);
    if (seen.has(key)) {
      errors.push(`${location}: duplicate acknowledgment for ${conceptId} "${phrase}"`);
      continue;
    }
    seen.add(key);
    if (!nonEmptyString(row['token'])) {
      errors.push(`${location} (${conceptId} "${phrase}"): token must be the collapsed token`);
      continue;
    }
    if (row['intended'] !== true) {
      errors.push(
        `${location} (${conceptId} "${phrase}"): intended must be literally true — ` +
          'an acknowledgment records a deliberate collapse; a phrase that should not ' +
          'collapse is rephrased or removed in the lexicon, never recorded as unintended',
      );
      continue;
    }
    if (!nonEmptyString(row['reviewedBy'])) {
      errors.push(`${location} (${conceptId} "${phrase}"): reviewedBy must name the reviewer`);
      continue;
    }
    if (!nonEmptyString(row['date']) || !/^\d{4}-\d{2}-\d{2}$/.test(row['date'] as string)) {
      errors.push(`${location} (${conceptId} "${phrase}"): date must be a YYYY-MM-DD date`);
      continue;
    }
    if (!nonEmptyString(row['note'])) {
      errors.push(
        `${location} (${conceptId} "${phrase}"): note must say why the collapse is intended — ` +
          'an empty reason is decoration, not a decision',
      );
      continue;
    }
    collapses.push({
      conceptId,
      phrase,
      token: (row['token'] as string).trim(),
      intended: true,
      reviewedBy: (row['reviewedBy'] as string).trim(),
      date: row['date'] as string,
      note: (row['note'] as string).trim(),
    });
  }
  return { collapses, errors };
}

// ---------------------------------------------------------------------------
// Bare-word inventory section (top-level `concepts:` list) — merged from the
// lexicon-concepts PR 2 mechanism (#33). Same file, second consumer:
// eval/src/gates/lexiconInventory.ts. Both parsers tolerate each other's
// top-level key by design.

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

/** A bare word is one typed word: no whitespace, so a phrase cannot hide in a token slot. */
function isBareWord(value: unknown): value is string {
  return nonEmptyString(value) && /^\S+$/.test(value.trim());
}

export function parseBareWordInventory(contents: string): {
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
