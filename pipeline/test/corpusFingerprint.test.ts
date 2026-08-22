/**
 * P5.2 / QR-3 (F9 data half) — corpus-fingerprint sensitivity over the
 * book-alias feed.
 *
 * `book_aliases` rows decide which typed strings resolve as references, so
 * they are results-affecting data; before P5.2 they fed NO fingerprint, so
 * an alias edit could change results without moving the identity triple —
 * a silent covenant-2 violation. These tests pin the closed hole from both
 * directions: one changed/added/removed row MUST move the fingerprint, and
 * pure reordering of the same rows MUST NOT (the identity is about content,
 * never about table order or sort locale).
 */

import { describe, expect, it } from 'vitest';

import { bookAliasRows } from '../src/books.js';
import { computeCorpusFingerprint } from '../src/buildCorpus.js';
import type { TranslationImport } from '../src/importers/types.js';

const TRANSLATIONS: readonly TranslationImport[] = [
  {
    code: 'TST',
    name: 'Test Translation',
    sourceId: 'test',
    attributionText: 'test',
    sha256: '0'.repeat(64),
    verses: [
      { verseId: 43003016, bookId: 43, chapter: 3, verse: 16, text: 'For God so loved the world.' },
      { verseId: 43003017, bookId: 43, chapter: 3, verse: 17, text: 'For God did not send his Son to judge.' },
    ],
  },
];

describe('computeCorpusFingerprint book-alias feed', () => {
  it('covers book_aliases: the same verses with and without alias rows fingerprint differently', () => {
    const withAliases = computeCorpusFingerprint(TRANSLATIONS, bookAliasRows());
    const withoutAliases = computeCorpusFingerprint(TRANSLATIONS, []);
    expect(withAliases).not.toBe(withoutAliases);
  });

  it('one changed alias row changes the fingerprint', () => {
    const rows = bookAliasRows();
    const changed = rows.map((row) =>
      row.aliasKey === 'php' ? { aliasKey: 'php', bookId: 57 } : row,
    );
    expect(changed.some((row, index) => row !== rows[index])).toBe(true);
    expect(computeCorpusFingerprint(TRANSLATIONS, changed)).not.toBe(
      computeCorpusFingerprint(TRANSLATIONS, rows),
    );
  });

  it('one added alias row changes the fingerprint', () => {
    const rows = bookAliasRows();
    const grown = [...rows, { aliasKey: 'zzznotabook', bookId: 66 }];
    expect(computeCorpusFingerprint(TRANSLATIONS, grown)).not.toBe(
      computeCorpusFingerprint(TRANSLATIONS, rows),
    );
  });

  it('one removed alias row changes the fingerprint', () => {
    const rows = bookAliasRows();
    const shrunk = rows.slice(0, -1);
    expect(computeCorpusFingerprint(TRANSLATIONS, shrunk)).not.toBe(
      computeCorpusFingerprint(TRANSLATIONS, rows),
    );
  });

  it('reordering alias rows does NOT change the fingerprint', () => {
    const rows = bookAliasRows();
    const reversed = [...rows].reverse();
    // Deterministic shuffle (linear congruential walk) — same rows, third order.
    const shuffled = [...rows];
    let state = 0x1234_5678;
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      const swap = state % (index + 1);
      const held = shuffled[index]!;
      shuffled[index] = shuffled[swap]!;
      shuffled[swap] = held;
    }
    const canonical = computeCorpusFingerprint(TRANSLATIONS, rows);
    expect(computeCorpusFingerprint(TRANSLATIONS, reversed)).toBe(canonical);
    expect(computeCorpusFingerprint(TRANSLATIONS, shuffled)).toBe(canonical);
  });

  it('alias records cannot collide with verse records by concatenation (length-delimited)', () => {
    // A verse whose text ends with something book_alias-shaped must not
    // fingerprint identically to the alias row itself appearing in the
    // alias stream — the length prefix plus the fixed record layout keeps
    // the two streams from bleeding into each other.
    const trickVerse: readonly TranslationImport[] = [
      {
        ...TRANSLATIONS[0]!,
        verses: [
          {
            verseId: 43003016,
            bookId: 43,
            chapter: 3,
            verse: 16,
            text: 'book_alias jn 43',
          },
        ],
      },
    ];
    expect(computeCorpusFingerprint(trickVerse, [])).not.toBe(
      computeCorpusFingerprint(
        [{ ...TRANSLATIONS[0]!, verses: [] }],
        [{ aliasKey: 'jn', bookId: 43 }],
      ),
    );
  });
});
