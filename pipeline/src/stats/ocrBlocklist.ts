/**
 * Reviewed blocklist of OCR artifacts.
 *
 * *Treasury of David* has no proofread edition — it is absent from Project
 * Gutenberg, and CCEL's transcription carries its own terms — so it enters the
 * corpus as Internet Archive OCR. Scanning noise therefore reaches the term
 * profiles, and corroboration does not filter it: two volumes of the same scan
 * set mis-read the same word the same way, and PMI then reports the misreading
 * as distinctive precisely because it is rare.
 *
 * DATA, not code: reviewed like `eval/budgets.json`. Every entry says what the
 * token actually is, because a blocklist nobody can audit is a place for
 * inconvenient words to be quietly disposed of.
 *
 * Deliberately NOT a dictionary filter. Scripture is full of words no
 * dictionary carries — proper nouns, transliterations, `selah`, `ephah` — so a
 * dictionary check would reject the vocabulary the engine most needs. Suspect
 * tokens are surfaced by a report; admission to this list stays a human act.
 */

export interface BlockedTerm {
  readonly term: string;
  /** What it actually is, and where it came from. */
  readonly reason: string;
}

export const OCR_BLOCKLIST: readonly BlockedTerm[] = [
  { term: 'kite', reason: 'OCR misread in the Treasury scans; not a word of these psalms' },
  { term: 'phantom', reason: 'OCR artifact in the Treasury scans; no attested use here' },
  { term: 'peste', reason: 'truncation of "pestilence" across a line break in the Treasury scans' },
  { term: 'wick', reason: 'truncation of "wicked" across a line break in the Treasury scans' },
  { term: 'guid', reason: 'truncation of "guide" / "guidance" across a line break' },
  { term: 'gorg', reason: 'truncation of "gorgeous"; first seen in the Maclaren-only build' },
];

const BLOCKED = new Set(OCR_BLOCKLIST.map((entry) => entry.term));

/** True when a term is a reviewed scanning artifact and must never be admitted. */
export function isBlockedTerm(term: string): boolean {
  return BLOCKED.has(term);
}
