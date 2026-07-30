/**
 * Tests for the eBible verse-per-line importer.
 *
 * The cases that matter here are the ones that would corrupt the corpus
 * silently: a verse filed under the wrong book, a duplicate reference
 * double-counting its tokens, and the five textless references WEB carries
 * for verses absent from the critical text.
 */

import { describe, expect, it } from 'vitest';

import { importVpl } from '../src/importers/vplImporter.js';
import { makeVerseId } from '../src/verseId.js';

describe('importVpl', () => {
  it('parses a verse into canonical ids', () => {
    const { verses } = importVpl('GEN 1:1 In the beginning, God created the heavens and the earth.');
    expect(verses).toHaveLength(1);
    expect(verses[0]).toMatchObject({
      verseId: makeVerseId(1, 1, 1),
      bookId: 1,
      chapter: 1,
      verse: 1,
      text: 'In the beginning, God created the heavens and the earth.',
    });
  });

  it('accepts both legacy and USFM book codes for the same book', () => {
    const legacy = importVpl('JAM 1:22 But be doers of the word.');
    const usfm = importVpl('JAS 1:22 But be doers of the word.');
    expect(legacy.verses[0]?.verseId).toBe(usfm.verses[0]?.verseId);
    expect(legacy.verses[0]?.bookId).toBe(59);
  });

  it('records textless references instead of dropping or rejecting them', () => {
    // WEB numbers Luke 17:36 but prints no text: the verse is absent from the
    // critical text. Numbering it keeps later verses at their expected
    // numbers, so the line is data, not corruption.
    const { verses, omittedVerses } = importVpl(
      ['LUK 17:35 There will be two grinding grain together.', 'LUK 17:36 ', 'LUK 17:37 They answering, asked him.'].join('\n'),
    );
    expect(verses).toHaveLength(2);
    expect(omittedVerses).toEqual(['LUK 17:36']);
  });

  it('rejects a duplicate reference rather than double-counting its tokens', () => {
    expect(() => importVpl(['GEN 1:1 First.', 'GEN 1:1 Again.'].join('\n'))).toThrow(/duplicate/i);
  });

  it('rejects a chapter beyond the end of its book', () => {
    // Jude has one chapter. A "Jude 2:1" means the code table and the export
    // disagree about which book this is — which would file verses under the
    // wrong book with nothing downstream able to detect it.
    expect(() => importVpl('JUD 2:1 Mercy to you.')).toThrow(/outside book/i);
  });

  it('rejects an unknown book code rather than guessing', () => {
    expect(() => importVpl('ZZZ 1:1 Something.')).toThrow(/unknown book code/i);
  });

  it('refuses to build an empty corpus', () => {
    expect(() => importVpl('# comment only\n\n')).toThrow(/no verses parsed/i);
  });
});
