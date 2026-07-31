/**
 * Corroboration must count AUTHORS, not volumes or editions.
 *
 * This is the rule the whole Layer B thesis rests on: a term is evidence about
 * a passage only if independent expositors used it. Counting source ids
 * instead would let volume 4 of a commentary corroborate volume 5, and — the
 * case that actually forced this — a second edition corroborate the first.
 * The failure is silent and produces confident, wrong profiles.
 */

import { describe, expect, it } from 'vitest';

import { buildTermProfiles, type ExpositionDocument } from '../src/stats/passageTerms.js';
import { makeVerseId } from '../src/verseId.js';

const VERSE = makeVerseId(19, 23, 1);

function document(
  overrides: Partial<ExpositionDocument> & { sourceId: string; authorId: string },
): ExpositionDocument {
  return {
    startVerseId: VERSE,
    endVerseId: VERSE,
    locator: `${overrides.sourceId} loc`,
    body: 'shepherd pasture shepherd pasture shepherd',
    ...overrides,
  };
}

const OPTIONS = { minPmi: 0, maxTermsPerVerse: 40, minCount: 1, minSources: 2 };

describe('corroboration counts authors', () => {
  it('does not let two volumes of one work corroborate each other', () => {
    const result = buildTermProfiles(
      [
        document({ sourceId: 'treasury-of-david-04', authorId: 'spurgeon' }),
        document({ sourceId: 'treasury-of-david-05', authorId: 'spurgeon' }),
      ],
      OPTIONS,
    );
    expect(result.terms).toHaveLength(0);
  });

  it('does not let a second edition corroborate the first', () => {
    // The case that prompted this: the only Treasury volume covering Psalms
    // 111-119 comes from a different edition, which overlaps volume 4 on
    // Psalms 104-110. Two manifest ids, one Spurgeon.
    const result = buildTermProfiles(
      [
        document({ sourceId: 'treasury-of-david-04', authorId: 'spurgeon' }),
        document({ sourceId: 'treasury-of-david-05-alt-edition', authorId: 'spurgeon' }),
      ],
      OPTIONS,
    );
    expect(result.terms).toHaveLength(0);
  });

  it('admits a term two distinct authors both used', () => {
    const result = buildTermProfiles(
      [
        document({ sourceId: 'treasury-of-david-01', authorId: 'spurgeon' }),
        document({ sourceId: 'maclaren-psalms', authorId: 'maclaren' }),
      ],
      OPTIONS,
    );
    expect(result.terms.length).toBeGreaterThan(0);
    const term = result.terms[0]!;
    expect(term.authorCount).toBe(2);
    // Volume-level provenance is still reported, so a result can say which
    // books the evidence came from even though the count is per author. The
    // two fields are named for what they hold: authorCount counts authors,
    // sourceIds lists volumes, and one author can supply several.
    expect(term.sourceIds).toBe('maclaren-psalms+treasury-of-david-01');
  });
});
