/**
 * Parses the doctrinal-guardrail review data:
 *
 *  - `ontology/doctrinal-reviews.yaml` — one human review record per source
 *    manifest. The row is the citable form of a review that already happened;
 *    merging the PR that adds or edits it is the review act.
 *  - `ontology/flagged-pairings.yaml` — the §3 proof-text watchlist plus the
 *    material-frame vocabulary that scopes the pairing scan.
 *
 * Parsing is deliberately strict and error-returning, never throwing and
 * never guessing: an unreadable review record must surface as a loud gate
 * finding (eval/src/gates/doctrinalGuardrail.ts), because a guardrail that
 * silently skips its own data is decoration. Verdicts are a closed
 * mechanical vocabulary — presence and cross-reference are checkable by
 * machine; the theology never is (CLAUDE.md #6).
 */

import { parse as parseYaml } from 'yaml';

import { parseAnchorRef } from './ontologyImporter.js';

export const DOCTRINAL_REVIEW_VERDICTS = [
  'compatible',
  'not-applicable-lineage-only',
  'not-applicable-scripture-text',
  'admissible-with-bound',
] as const;

export type DoctrinalReviewVerdict = (typeof DOCTRINAL_REVIEW_VERDICTS)[number];

export interface DoctrinalReviewRecord {
  readonly source: string;
  readonly reviewedAt: string;
  readonly reviewer: string;
  readonly verdict: DoctrinalReviewVerdict;
  readonly criteria: readonly string[];
  readonly bound?: string;
  readonly notes?: string;
}

export interface WatchlistEntry {
  readonly ref: string;
  readonly concern: string;
  readonly range: { readonly start: number; readonly end: number };
}

export interface FlaggedPairings {
  readonly materialFrameKeywords: readonly string[];
  readonly watchlist: readonly WatchlistEntry[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function safeParseYaml(contents: string, errors: string[]): unknown {
  try {
    return parseYaml(contents);
  } catch (error) {
    errors.push(`not valid YAML: ${error instanceof Error ? error.message : 'parse error'}`);
    return undefined;
  }
}

export function parseDoctrinalReviews(contents: string): {
  readonly reviews: readonly DoctrinalReviewRecord[];
  readonly errors: readonly string[];
} {
  const errors: string[] = [];
  const parsed = safeParseYaml(contents, errors);
  if (errors.length > 0) return { reviews: [], errors };
  if (!isRecord(parsed) || !Array.isArray(parsed['reviews'])) {
    return { reviews: [], errors: ['doctrinal-reviews.yaml must contain a top-level `reviews` list'] };
  }

  const reviews: DoctrinalReviewRecord[] = [];
  const seen = new Set<string>();
  for (const [index, row] of parsed['reviews'].entries()) {
    const location = `reviews[${index}]`;
    if (!isRecord(row)) {
      errors.push(`${location}: must be an object`);
      continue;
    }
    const source = row['source'];
    if (!nonEmptyString(source)) {
      errors.push(`${location}: source must be a non-empty string`);
      continue;
    }
    if (seen.has(source)) {
      errors.push(`${location}: duplicate review row for source "${source}"`);
      continue;
    }
    seen.add(source);
    if (!nonEmptyString(row['reviewedAt']) || !/^\d{4}-\d{2}-\d{2}$/.test(row['reviewedAt'] as string)) {
      errors.push(`${location} (${source}): reviewedAt must be a YYYY-MM-DD date`);
      continue;
    }
    if (!nonEmptyString(row['reviewer'])) {
      errors.push(`${location} (${source}): reviewer must be a non-empty string`);
      continue;
    }
    const verdict = row['verdict'];
    if (!(DOCTRINAL_REVIEW_VERDICTS as readonly unknown[]).includes(verdict)) {
      errors.push(
        `${location} (${source}): verdict must be one of ${DOCTRINAL_REVIEW_VERDICTS.join(', ')} — ` +
          'a closed mechanical vocabulary, never a theology score',
      );
      continue;
    }
    const criteria = row['criteria'];
    if (!Array.isArray(criteria) || criteria.length === 0 || !criteria.every(nonEmptyString)) {
      errors.push(`${location} (${source}): criteria must be a non-empty list of citation strings`);
      continue;
    }
    if (verdict === 'admissible-with-bound' && !nonEmptyString(row['bound'])) {
      errors.push(
        `${location} (${source}): verdict admissible-with-bound requires a stated bound — ` +
          'the bound is the part of the verdict that does the work',
      );
      continue;
    }
    if (row['bound'] !== undefined && !nonEmptyString(row['bound'])) {
      errors.push(`${location} (${source}): bound, when present, must be a non-empty string`);
      continue;
    }
    if (row['notes'] !== undefined && !nonEmptyString(row['notes'])) {
      errors.push(`${location} (${source}): notes, when present, must be a non-empty string`);
      continue;
    }
    reviews.push({
      source,
      reviewedAt: row['reviewedAt'] as string,
      reviewer: row['reviewer'] as string,
      verdict: verdict as DoctrinalReviewVerdict,
      criteria: criteria as string[],
      ...(nonEmptyString(row['bound']) ? { bound: row['bound'] } : {}),
      ...(nonEmptyString(row['notes']) ? { notes: row['notes'] } : {}),
    });
  }
  return { reviews, errors };
}

export function parseFlaggedPairings(contents: string): {
  readonly pairings: FlaggedPairings | null;
  readonly errors: readonly string[];
} {
  const errors: string[] = [];
  const parsed = safeParseYaml(contents, errors);
  if (errors.length > 0) return { pairings: null, errors };
  if (!isRecord(parsed)) {
    return { pairings: null, errors: ['flagged-pairings.yaml must be a mapping'] };
  }

  const keywordsRaw = parsed['materialFrameKeywords'];
  const keywords: string[] = [];
  if (!Array.isArray(keywordsRaw) || keywordsRaw.length === 0) {
    errors.push('materialFrameKeywords must be a non-empty list');
  } else {
    for (const [index, keyword] of keywordsRaw.entries()) {
      if (!nonEmptyString(keyword) || !/^[a-z][a-z0-9]*$/.test(keyword)) {
        errors.push(`materialFrameKeywords[${index}]: must be a single lowercase word`);
        continue;
      }
      if (keywords.includes(keyword)) {
        errors.push(`materialFrameKeywords[${index}]: duplicate keyword "${keyword}"`);
        continue;
      }
      keywords.push(keyword);
    }
  }

  const watchlistRaw = parsed['watchlist'];
  const watchlist: WatchlistEntry[] = [];
  if (!Array.isArray(watchlistRaw) || watchlistRaw.length === 0) {
    errors.push('watchlist must be a non-empty list');
  } else {
    const seenRanges = new Set<string>();
    for (const [index, entry] of watchlistRaw.entries()) {
      const location = `watchlist[${index}]`;
      if (!isRecord(entry)) {
        errors.push(`${location}: must be an object`);
        continue;
      }
      if (!nonEmptyString(entry['ref'])) {
        errors.push(`${location}: ref must be a non-empty reference string`);
        continue;
      }
      const ref = (entry['ref'] as string).trim();
      const range = parseAnchorRef(ref);
      if (!range) {
        errors.push(`${location}: "${ref}" is not a canonical scripture range`);
        continue;
      }
      if (!nonEmptyString(entry['concern'])) {
        errors.push(`${location} (${ref}): concern must state the framing risk in one sentence`);
        continue;
      }
      const key = `${range.start}:${range.end}`;
      if (seenRanges.has(key)) {
        errors.push(`${location}: duplicate watchlist range for "${ref}"`);
        continue;
      }
      seenRanges.add(key);
      watchlist.push({ ref, concern: (entry['concern'] as string).trim(), range });
    }
  }

  if (errors.length > 0) return { pairings: null, errors };
  return { pairings: { materialFrameKeywords: keywords, watchlist }, errors };
}
