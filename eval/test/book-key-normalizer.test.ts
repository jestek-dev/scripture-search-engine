/**
 * P5.1 / QR-7 — book-key normalizer equivalence guard.
 *
 * `normalizeBookAlias` (engine, engine/src/reference/reference.ts) and
 * `normalizeBookKey` (pipeline, pipeline/src/normalize.ts) are twin
 * functions maintained separately: the pipeline builds the `book_aliases`
 * table with one, the engine matches typed queries with the other. A
 * one-sided edit strands alias rows the runtime can never look up — with
 * every other gate green, because both sides stay internally consistent.
 * This suite is the ONLY thing that compares them, so it must be able to
 * fail: the documented local mutation check (diverge either side in a
 * scratch edit, e.g. stop stripping digits in pipeline/src/normalize.ts)
 * makes every section below fail loudly.
 *
 * eval is the one workspace allowed to import both packages (the engine
 * never imports pipeline — covenant #3's dependency direction is preserved
 * by testing the twins HERE, not in either home).
 */

import { describe, expect, it } from 'vitest';

import { normalizeBookAlias } from '@jestek-dev/scripture-engine/internal';

import { BOOKS, bookAliasRows } from '../../pipeline/src/books.js';
import { normalizeBookKey } from '../../pipeline/src/normalize.js';

describe('book-key normalizer equivalence (engine normalizeBookAlias vs pipeline normalizeBookKey)', () => {
  it('agrees on every registered alias string (name + every abbreviation, data-driven)', () => {
    // Iterating the BOOKS table itself (not a copied list) means QR-3's
    // grown alias set — ordinals, curated misspellings — is covered the
    // commit it lands, with no edit here.
    for (const book of BOOKS) {
      for (const alias of [book.name, ...book.abbreviations]) {
        expect(normalizeBookKey(alias), `alias ${JSON.stringify(alias)} (${book.name})`).toBe(
          normalizeBookAlias(alias),
        );
      }
    }
  });

  it('agrees on the adversarial fixed corpus (roman prefixes, unicode dashes, curly apostrophes, interior periods)', () => {
    const adversarial: readonly string[] = [
      // Roman-numeral prefixes, in every casing and spacing the fold must see.
      'I Chronicles',
      'II Chron',
      'III John',
      'i chron',
      'ii  kings',
      'iii\tjohn',
      ' I Chron ',
      'I', // bare roman prefix, nothing after it
      'II',
      'III',
      'Iii', // not a roman prefix by casing after lowercase: still folds — both must agree
      'IIII John', // NOT a roman prefix (four Is): must not fold
      'Isaiah', // leading "I" inside a word must never fold
      'Immanuel',
      // Unicode dashes (figure dash, en dash, em dash, horizontal bar, minus).
      'Song‒of‒Solomon',
      'Song–of–Solomon',
      'Song—of—Solomon',
      'Song―of―Solomon',
      'Song−of−Solomon',
      '1–Corinthians',
      // Curly apostrophes and quotes.
      'Song of Solomon’s',
      '‘Song of Songs’',
      '“Psalms”',
      "Solomon's Song",
      // Interior periods and mixed punctuation.
      '1 Cor.',
      '1. Cor.',
      'S.o.S.',
      'Gen.',
      'Ps.119',
      '2.Tim',
      // Whitespace shapes.
      '  Psalms  ',
      '\tJude\n',
      'Song  of   Solomon',
      // Digits and ordinal-ish forms (QR-3 data territory).
      '1st Corinthians',
      'First Corinthians',
      '2nd Tim',
      '3rd John',
      // Non-ASCII letters and other strippables.
      'Éxodus',
      'Ｐｓａｌｍｓ',
      'Psalms 119',
      '',
      '   ',
      '...',
    ];
    for (const input of adversarial) {
      expect(normalizeBookKey(input), `adversarial ${JSON.stringify(input)}`).toBe(
        normalizeBookAlias(input),
      );
    }
  });

  it('agrees on 10,000 seeded generator strings', () => {
    // Deterministic PRNG (mulberry32, fixed seed) — the corpus is identical
    // on every run and platform, so a failure here is reproducible by
    // running the same test, never a flake to re-roll.
    function mulberry32(seed: number): () => number {
      let a = seed >>> 0;
      return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const random = mulberry32(0x5eed_ba5e);
    const alphabet: readonly string[] = [
      // Letters in both cases, digits.
      ...'abcdefghijklmnopqrstuvwxyz',
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      ...'0123456789',
      // Whitespace shapes (the roman-prefix lookahead is \s-sensitive).
      ' ',
      ' ',
      ' ',
      '\t',
      '\n',
      ' ',
      // Punctuation both normalizers must strip identically.
      '.',
      ':',
      '-',
      "'",
      // Unicode dashes and curly quotes.
      '‒',
      '–',
      '—',
      '―',
      '−',
      '’',
      '‘',
      '“',
      '”',
      // Non-ASCII letters.
      'é',
      'ß',
      'İ',
      'Ω',
    ];
    // Seed some strings with roman-prefix openers so that branch is hit
    // often, not just by alphabet luck.
    const openers = ['', '', '', 'I ', 'II ', 'III ', 'i ', 'ii ', 'iii ', 'I', 'Iv ', ' I '];
    for (let index = 0; index < 10_000; index += 1) {
      const opener = openers[Math.floor(random() * openers.length)]!;
      const length = Math.floor(random() * 24);
      let body = '';
      for (let position = 0; position < length; position += 1) {
        body += alphabet[Math.floor(random() * alphabet.length)]!;
      }
      const input = opener + body;
      expect(normalizeBookKey(input), `generated #${index} ${JSON.stringify(input)}`).toBe(
        normalizeBookAlias(input),
      );
    }
  });

  it('every emitted alias key is a fixed point of BOTH normalizers', () => {
    // The shipped `book_aliases` keys are exactly what the engine looks up
    // after normalizing user input. If a key were not a fixed point, the
    // pipeline could emit a row the runtime lookup can never produce —
    // stranded data with every gate green.
    const rows = bookAliasRows();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(normalizeBookKey(row.aliasKey), `pipeline fixed point ${row.aliasKey}`).toBe(
        row.aliasKey,
      );
      expect(normalizeBookAlias(row.aliasKey), `engine fixed point ${row.aliasKey}`).toBe(
        row.aliasKey,
      );
    }
  });
});
