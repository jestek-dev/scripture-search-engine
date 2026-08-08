/**
 * The blocklist, and the admission rule that reads it.
 *
 * Written failing-first: before the rule existed, `kite` and `phantom` were
 * admitted terms in the shipped Psalms profiles, corroborated by two volumes
 * of the same scan set mis-reading the same word the same way.
 */

import { describe, expect, it } from 'vitest';

import { isBlockedTerm, OCR_BLOCKLIST } from '../src/stats/ocrBlocklist.js';
import { buildTermProfiles, type ExpositionDocument } from '../src/stats/passageTerms.js';

const doc = (authorId: string, body: string): ExpositionDocument => ({
  startVerseId: 19_091_004,
  endVerseId: 19_091_004,
  sourceId: authorId,
  authorId,
  locator: '91.4',
  body,
});

describe('OCR blocklist', () => {
  it('every entry says what the token actually is', () => {
    // A blocklist without reasons is a place to dispose of inconvenient words.
    for (const entry of OCR_BLOCKLIST) {
      expect(entry.reason.length, `${entry.term} has no reason`).toBeGreaterThan(10);
    }
  });

  it('has no duplicate entries', () => {
    const terms = OCR_BLOCKLIST.map((entry) => entry.term);
    expect(new Set(terms).size).toBe(terms.length);
  });

  it('recognises a blocked term and leaves real vocabulary alone', () => {
    expect(isBlockedTerm('kite')).toBe(true);
    // Words no dictionary carries but Scripture needs must survive.
    expect(isBlockedTerm('selah')).toBe(false);
    expect(isBlockedTerm('buckler')).toBe(false);
  });

  it('keeps a blocked term OUT even when two authors corroborate it', () => {
    // The failing case: corroboration cannot filter this, because two volumes
    // of one scan set mis-read the same word identically.
    const documents = [
      doc('spurgeon', 'kite kite feather wing buckler shield refuge'),
      doc('maclaren', 'kite kite feather wing buckler shield refuge'),
    ];
    const result = buildTermProfiles(documents, {
      minPmi: -100,
      maxTermsPerVerse: 40,
      minCount: 1,
      minSources: 2,
    });
    const admitted = result.terms.map((term) => term.term);
    expect(admitted).not.toContain('kite');
    // and the real vocabulary of Psalm 91:4 still comes through
    expect(admitted).toContain('buckler');
    expect(admitted).toContain('feather');
  });
});
