/**
 * Text normalization applied at import time.
 *
 * Deliberately conservative: it repairs transport artifacts (whitespace,
 * BOMs, non-breaking spaces) and NOTHING else. It does not fix spelling,
 * modernize archaic forms, or strip punctuation — those are tokenizer
 * concerns, and doing them here would mean the stored verse text no longer
 * matches the source we checksummed, quietly breaking the corpus fingerprint
 * as evidence of what we actually shipped.
 */

/** Collapse runs of whitespace and trim. Preserves all other characters. */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/﻿/g, '')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
