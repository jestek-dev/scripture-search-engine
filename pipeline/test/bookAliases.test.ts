/**
 * P5.2 / QR-3 — the grown book-alias table: collision guard and the
 * standing admission rule's machine-checkable half.
 *
 * The curated misspelling + ordinal rows land under the J33 standing rule
 * (unambiguous across all 66 books; never an English word / plausible
 * discovery query — the `Jud` doctrine). The human half of that rule is
 * Jesse's row-by-row review in the PR; THIS suite pins the machine half:
 * no cross-book key collisions ever ship, the specific rows the fixtures
 * rely on exist, and the doctrine's canonical exclusion stays excluded.
 */

import { describe, expect, it } from 'vitest';

import { BOOKS, bookAliasRows, findBook } from '../src/books.js';
import { normalizeBookKey } from '../src/normalize.js';

describe('book alias table (post-QR-3)', () => {
  it('builds without cross-book collisions over the grown set', () => {
    // bookAliasRows throws on any alias whose normalized key maps to two
    // books — this call IS the collision guard over every shipped row.
    const rows = bookAliasRows();
    expect(rows.length).toBeGreaterThanOrEqual(270);
    const keys = rows.map((row) => row.aliasKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('ships the ordinal rows for all 17 numbered books', () => {
    const cases: readonly (readonly [string, string])[] = [
      ['1st Samuel', '1 Samuel'],
      ['First Samuel', '1 Samuel'],
      ['2nd Samuel', '2 Samuel'],
      ['1st Kings', '1 Kings'],
      ['2nd Kings', '2 Kings'],
      ['1st Chronicles', '1 Chronicles'],
      ['2nd Chronicles', '2 Chronicles'],
      ['1st Corinthians', '1 Corinthians'],
      ['First Corinthians', '1 Corinthians'],
      ['2nd Corinthians', '2 Corinthians'],
      ['1st Thessalonians', '1 Thessalonians'],
      ['2nd Thessalonians', '2 Thessalonians'],
      ['1st Timothy', '1 Timothy'],
      ['2nd Timothy', '2 Timothy'],
      ['2nd Tim', '2 Timothy'],
      ['1st Peter', '1 Peter'],
      ['2nd Peter', '2 Peter'],
      ['1st John', '1 John'],
      ['2nd John', '2 John'],
      ['3rd John', '3 John'],
      ['Third John', '3 John'],
    ];
    for (const [typed, canonical] of cases) {
      expect(findBook(typed)?.name, typed).toBe(canonical);
    }
  });

  it('ships the curated misspelling rows the battery/fixtures name', () => {
    const cases: readonly (readonly [string, string])[] = [
      ['Phillipians', 'Philippians'],
      ['Philipians', 'Philippians'],
      ['Phillippians', 'Philippians'],
      ['Songs of Solomon', 'Song of Solomon'],
      ['Pslam', 'Psalms'],
      ['Pslams', 'Psalms'],
      ['Galations', 'Galatians'],
      ['Collosians', 'Colossians'],
      ['Duetoronomy', 'Deuteronomy'],
      ['Isiah', 'Isaiah'],
      ['Habbakuk', 'Habakkuk'],
    ];
    for (const [typed, canonical] of cases) {
      expect(findBook(typed)?.name, typed).toBe(canonical);
    }
  });

  it('keeps the Jud doctrine: ambiguous or word-like strings resolve to nothing', () => {
    // "Jud" could be Jude or Judges — the ambiguous input returns nothing
    // rather than guessing (the doctrine the J33 standing rule generalizes).
    for (const typed of ['Jud', 'jud', 'Songs', 'Palms', 'Second', 'First']) {
      expect(findBook(typed), typed).toBeUndefined();
    }
  });

  it('every alias string registered on BOOKS emits a fixed-point normalized key', () => {
    for (const book of BOOKS) {
      for (const alias of [book.name, ...book.abbreviations]) {
        const key = normalizeBookKey(alias);
        expect(key.length, `alias ${JSON.stringify(alias)}`).toBeGreaterThan(0);
        expect(normalizeBookKey(key)).toBe(key);
      }
    }
  });
});
