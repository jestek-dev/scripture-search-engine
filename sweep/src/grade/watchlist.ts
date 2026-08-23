/**
 * Negative-context watchlist loader (MS-7). Sweep-side data, never
 * compiled into the artifact (lint-enforced in tests). A row attributes a
 * documented sense-in-context with a citation; it never scores theology
 * (covenant #6).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parse as parseYaml } from 'yaml';

import { REPO_ROOT } from '../universe/compileFromRepo.js';

export interface WatchlistRow {
  readonly ref: string;
  readonly status: string;
  /** Query classes (concept ids / categories) the negative sense wounds. */
  readonly matchClasses: readonly string[];
  readonly senseInContext: string;
  readonly citation: string;
}

export const WATCHLIST_PATH = join(REPO_ROOT, 'sweep', 'grading', 'negative-context-watchlist.yaml');

export function loadWatchlist(path = WATCHLIST_PATH): WatchlistRow[] {
  const parsed = parseYaml(readFileSync(path, 'utf8')) as { rows?: unknown };
  if (!Array.isArray(parsed.rows)) throw new Error(`${path}: missing rows[]`);
  return parsed.rows.map((row, index) => {
    const r = row as Record<string, unknown>;
    for (const field of ['ref', 'status', 'senseInContext', 'citation']) {
      if (typeof r[field] !== 'string' || (r[field] as string).length === 0) {
        throw new Error(`${path}: row ${index} missing ${field} — a watchlist row without its documented sense is an adjudication, not an attribution`);
      }
    }
    if (!Array.isArray(r.matchClasses) || r.matchClasses.length === 0) {
      throw new Error(`${path}: row ${index} missing matchClasses[]`);
    }
    return r as unknown as WatchlistRow;
  });
}
