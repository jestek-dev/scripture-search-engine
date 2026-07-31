/**
 * Tests for the SWORD zcom importer.
 *
 * The property worth protecting is negative: when the entry layout does not
 * match KJV versification, the importer must REFUSE rather than map. A wrong
 * mapping does not look wrong — it produces real commentary attached to the
 * wrong verse, all the way through, and every gate downstream would pass it.
 */

import { deflateSync } from 'node:zlib';

import { describe, expect, it } from 'vitest';

import { importSwordZcom, type SwordTestamentFiles } from '../src/importers/swordZcomImporter.js';
import { KJV_VERSES_PER_CHAPTER } from '../src/versification/kjv.js';

/** Builds a module whose index has `entryCount` slots, all empty. */
function emptyTestament(entryCount: number): SwordTestamentFiles {
  const payload = deflateSync(Buffer.from(''));
  const bzs = Buffer.alloc(12);
  bzs.writeUInt32LE(0, 0);
  bzs.writeUInt32LE(payload.length, 4);
  bzs.writeUInt32LE(0, 8);
  return { bzs, bzv: Buffer.alloc(entryCount * 10), bzz: payload };
}

const NT_BOOKS = 27;
const ntChapters = KJV_VERSES_PER_CHAPTER.slice(39);
const NT_CHAPTER_COUNT = ntChapters.reduce((sum, book) => sum + book.length, 0);
const NT_VERSE_COUNT = ntChapters.reduce(
  (sum, book) => sum + book.reduce((inner, verses) => inner + verses, 0),
  0,
);
/** module heading + testament heading + per book + per chapter + per verse */
const NT_ENTRIES = 2 + NT_BOOKS + NT_CHAPTER_COUNT + NT_VERSE_COUNT;

describe('importSwordZcom', () => {
  it('accepts an index sized exactly as KJV versification predicts', () => {
    expect(NT_ENTRIES).toBe(8246); // the value Clarke's module actually has
    const result = importSwordZcom({ nt: emptyTestament(NT_ENTRIES) });
    expect(result.entries).toHaveLength(0);
    expect(result.emptyEntries).toBe(NT_VERSE_COUNT);
  });

  it('refuses to map when the index is one entry short', () => {
    // The dangerous case: off-by-one still parses, and would shift every
    // comment by a verse while looking entirely plausible.
    expect(() => importSwordZcom({ nt: emptyTestament(NT_ENTRIES - 1) })).toThrow(
      /layout assumption is wrong/i,
    );
  });

  it('refuses to map when the index is one entry long', () => {
    expect(() => importSwordZcom({ nt: emptyTestament(NT_ENTRIES + 1) })).toThrow(
      /refusing to map entries to verses/i,
    );
  });

  it('names both counts so the mismatch is diagnosable', () => {
    expect(() => importSwordZcom({ nt: emptyTestament(9000) })).toThrow(/9000.*8246|8246.*9000/s);
  });
});
