/**
 * The reference grammar (0.11.0/QR-4): ordered candidate parses with a
 * decided commit rule, the cited did-you-mean under the ONE edit-policy
 * table, the J36 bare-number fallthrough flag, and the labelFor whole-chapter
 * fix. Everything here runs against a pure mock resolver — no database, no
 * I/O — so the grammar's determinism is tested as arithmetic.
 */

import { describe, expect, it } from 'vitest';

import {
  damerauLevenshtein,
  editDistanceBudget,
  resolveReferenceAttempt,
  type BookAliasEntry,
  type ReferenceResolver,
  type ReferenceResolutionAttempt,
} from '../src/reference/reference.js';

interface MockBook {
  readonly id: number;
  readonly name: string;
  readonly chapterCount: number;
  readonly aliases: readonly string[];
}

/**
 * A miniature canon plus synthetic books whose alias keys sit exactly on the
 * edit-policy band boundaries. Every chapter has 30 verses — enough shape for
 * locator validation without modeling real verse counts.
 */
const MOCK_BOOKS: readonly MockBook[] = [
  { id: 19, name: 'Psalms', chapterCount: 150, aliases: ['psalms', 'psalm', 'ps', 'pslam'] },
  { id: 22, name: 'Song of Solomon', chapterCount: 8, aliases: ['songofsolomon', 'song'] },
  { id: 43, name: 'John', chapterCount: 21, aliases: ['john', 'jn', 'jhn'] },
  { id: 46, name: '1 Corinthians', chapterCount: 16, aliases: ['1corinthians', '1cor', '1co'] },
  { id: 48, name: 'Galatians', chapterCount: 6, aliases: ['galatians', 'gal'] },
  { id: 50, name: 'Philippians', chapterCount: 4, aliases: ['philippians', 'phil', 'php', 'philipians'] },
  { id: 64, name: '3 John', chapterCount: 1, aliases: ['3john', '3jn'] },
  { id: 65, name: 'Jude', chapterCount: 1, aliases: ['jude'] },
  // Synthetic band-boundary books: an 8-char key (edit budget 1) and a
  // 9-char key (edit budget 2), chosen so neither is within distance 2 of
  // the other or of anything else in the table.
  { id: 90, name: 'Octonia', chapterCount: 10, aliases: ['abcdefgh'] },
  { id: 91, name: 'Nononia', chapterCount: 10, aliases: ['qrstuvwxy'] },
  // Synthetic tie pair: both at distance 1 from the typed key "aaaad".
  { id: 92, name: 'Alephia', chapterCount: 10, aliases: ['aaaab'] },
  { id: 93, name: 'Bethia', chapterCount: 10, aliases: ['aaaac'] },
];

const VERSES_PER_CHAPTER = 30;

function aliasRows(books: readonly MockBook[]): BookAliasEntry[] {
  const rows: BookAliasEntry[] = [];
  for (const book of books) {
    for (const aliasKey of book.aliases) {
      rows.push({ aliasKey, bookId: book.id, bookName: book.name, chapterCount: book.chapterCount });
    }
  }
  return rows;
}

function makeResolver(order?: (rows: BookAliasEntry[]) => BookAliasEntry[]): ReferenceResolver {
  const byKey = new Map<string, MockBook>();
  for (const book of MOCK_BOOKS) {
    for (const alias of book.aliases) byKey.set(alias, book);
  }
  return {
    async resolveBookAlias(aliasKey) {
      const book = byKey.get(aliasKey);
      return book ? { id: book.id, name: book.name, chapterCount: book.chapterCount } : null;
    },
    async getChapterVerseCount(bookId, chapter) {
      const book = MOCK_BOOKS.find((entry) => entry.id === bookId);
      if (!book || chapter < 1 || chapter > book.chapterCount) return null;
      return VERSES_PER_CHAPTER;
    },
    async verseExists(bookId, chapter, verse) {
      const book = MOCK_BOOKS.find((entry) => entry.id === bookId);
      return (
        !!book &&
        chapter >= 1 &&
        chapter <= book.chapterCount &&
        verse >= 1 &&
        verse <= VERSES_PER_CHAPTER
      );
    },
    async listBookAliases() {
      const rows = aliasRows(MOCK_BOOKS);
      return order ? order(rows) : rows;
    },
  };
}

const resolver = makeResolver();

async function attempt(input: string): Promise<ReferenceResolutionAttempt> {
  return await resolveReferenceAttempt(input, resolver);
}

async function labelOf(input: string): Promise<string> {
  const result = await attempt(input);
  if (result.kind !== 'resolved') throw new Error(`${input}: expected resolved, got ${result.kind}`);
  return result.reference.label;
}

describe('grammar table — resolution and labels', () => {
  const table: readonly [string, string][] = [
    // Pre-0.11.0 forms, preserved bit-for-bit (the first candidate is the old parse).
    ['John 3:16', 'John 3:16'],
    ['Jn 3:16', 'John 3:16'],
    ['Jn.3.16', 'John 3:16'],
    ['psalm 23', 'Psalms 23'],
    ['1cor13', '1 Corinthians 13'],
    ['Phil 4:6-7', 'Philippians 4:6-7'],
    ['John 3:16-4:2', 'John 3:16-4:2'],
    ['3 John 4', '3 John 1:4'],
    // The 0.11.0 space-separated chapter/verse form.
    ['John 3 16', 'John 3:16'],
    ['john 3 16', 'John 3:16'],
    ['John 3 16-17', 'John 3:16-17'],
    ['1 corinthians 13 4', '1 Corinthians 13:4'],
    ['Song of Solomon 2 1', 'Song of Solomon 2:1'],
    ['ps 23 1', 'Psalms 23:1'],
    // The labelFor whole-chapter fix: a same-chapter range starting at verse
    // 1 is labeled as the range, in both grammars; a genuine whole-chapter
    // parse keeps the Book C form.
    ['John 3:1-5', 'John 3:1-5'],
    ['John 3 1-5', 'John 3:1-5'],
    ['John 3:1', 'John 3:1'],
    ['John 3', 'John 3'],
    // Single-chapter books: same defect class, same fix.
    ['Jude 4', 'Jude 1:4'],
    ['Jude 1-5', 'Jude 1:1-5'],
  ];
  for (const [input, expected] of table) {
    it(`resolves "${input}" as "${expected}"`, async () => {
      expect(await labelOf(input)).toBe(expected);
    });
  }
});

describe('commit rule and invalid locators', () => {
  it('commits to a resolving book even when the locator then fails', async () => {
    // "John 3 99": candidate 2's book resolves, verse 99 does not exist —
    // committed reference intent, typed invalid, no re-parse, no fallthrough.
    const result = await attempt('John 3 99');
    expect(result.kind).toBe('invalid-reference');
    if (result.kind !== 'invalid-reference') return;
    expect(result.suggestion).toBeUndefined();
    expect(result.fallthroughToDiscovery).toBe(false);
  });

  it('still rejects chapter ranges', async () => {
    const result = await attempt('John 3-4');
    expect(result.kind).toBe('invalid-reference');
  });

  it('still types a bad chapter on a resolved book as invalid', async () => {
    const result = await attempt('John 99');
    expect(result.kind).toBe('invalid-reference');
    if (result.kind !== 'invalid-reference') return;
    expect(result.fallthroughToDiscovery).toBe(false);
  });

  it('leaves letter-ending text as not-reference', async () => {
    expect((await attempt('love one another')).kind).toBe('not-reference');
    expect((await attempt('40 days and 40 nights')).kind).toBe('not-reference');
    expect((await attempt('40 days')).kind).toBe('not-reference');
  });
});

describe('cited did-you-mean (J35: suggestion only, never auto-resolve)', () => {
  it('suggests the unique in-policy match, citing its distance — colon form', async () => {
    const result = await attempt('filipians 4:13');
    expect(result.kind).toBe('invalid-reference');
    if (result.kind !== 'invalid-reference') return;
    expect(result.suggestion).toEqual({
      book: 'Philippians',
      reference: 'Philippians 4:13',
      distance: 2,
    });
    expect(result.fallthroughToDiscovery).toBe(false);
  });

  it('suggests in the space-separated form too', async () => {
    const result = await attempt('filipians 4 13');
    expect(result.kind).toBe('invalid-reference');
    if (result.kind !== 'invalid-reference') return;
    expect(result.suggestion).toEqual({
      book: 'Philippians',
      reference: 'Philippians 4:13',
      distance: 2,
    });
  });

  it('a bare-number shape with a suggestion stays invalid-reference (nearly-resolving book, J36)', async () => {
    const result = await attempt('palms 91');
    expect(result.kind).toBe('invalid-reference');
    if (result.kind !== 'invalid-reference') return;
    expect(result.suggestion).toEqual({ book: 'Psalms', reference: 'Psalms 91', distance: 1 });
    expect(result.fallthroughToDiscovery).toBe(false);
  });

  it('never suggests below the 5-char policy floor, even at distance 1', async () => {
    // "jhon" is one transposition from "john", but a 4-char key is below the
    // band where an edit can be told from a different word.
    const result = await attempt('jhon 3:16');
    expect(result.kind).toBe('invalid-reference');
    if (result.kind !== 'invalid-reference') return;
    expect(result.suggestion).toBeUndefined();
  });

  it('band boundary: an 8-char key gets edit distance 1 only', async () => {
    const one = await attempt('abcdefgx 2:3'); // distance 1 from abcdefgh
    expect(one.kind).toBe('invalid-reference');
    if (one.kind === 'invalid-reference') {
      expect(one.suggestion).toEqual({ book: 'Octonia', reference: 'Octonia 2:3', distance: 1 });
    }
    const two = await attempt('abcdefxy 2:3'); // distance 2 — out of policy at length 8
    expect(two.kind).toBe('invalid-reference');
    if (two.kind === 'invalid-reference') expect(two.suggestion).toBeUndefined();
  });

  it('band boundary: a 9-char key gets edit distance 2', async () => {
    const result = await attempt('qrstuvwzz 2:3'); // distance 2 from qrstuvwxy
    expect(result.kind).toBe('invalid-reference');
    if (result.kind !== 'invalid-reference') return;
    expect(result.suggestion).toEqual({ book: 'Nononia', reference: 'Nononia 2:3', distance: 2 });
  });

  it('a tie across books suggests nothing', async () => {
    // "aaaad" is distance 1 from both Alephia's and Bethia's keys.
    const explicit = await attempt('aaaad 2:3');
    expect(explicit.kind).toBe('invalid-reference');
    if (explicit.kind === 'invalid-reference') {
      expect(explicit.suggestion).toBeUndefined();
      expect(explicit.fallthroughToDiscovery).toBe(false);
    }
    const bare = await attempt('aaaad 2 3');
    expect(bare.kind).toBe('invalid-reference');
    if (bare.kind === 'invalid-reference') {
      expect(bare.suggestion).toBeUndefined();
      expect(bare.fallthroughToDiscovery).toBe(true);
    }
  });

  it('validates the suggested locator — an impossible chapter suggests nothing', async () => {
    const result = await attempt('filipians 9:1'); // Philippians has 4 chapters
    expect(result.kind).toBe('invalid-reference');
    if (result.kind !== 'invalid-reference') return;
    expect(result.suggestion).toBeUndefined();
  });

  it('validates the suggested verse via verseExists', async () => {
    const result = await attempt('filipians 4:99');
    expect(result.kind).toBe('invalid-reference');
    if (result.kind !== 'invalid-reference') return;
    expect(result.suggestion).toBeUndefined();
  });
});

describe('bare-number fallthrough flag (J36)', () => {
  it('flags bare-number dead ends for discovery', async () => {
    for (const query of ['plans 29 11', 'plans 29', '3 16']) {
      const result = await attempt(query);
      expect(result.kind).toBe('invalid-reference');
      if (result.kind !== 'invalid-reference') continue;
      expect(result.suggestion).toBeUndefined();
      expect(result.fallthroughToDiscovery).toBe(true);
    }
  });

  it('keeps explicit-separator dead ends committed', async () => {
    for (const query of ['xyzzy 4:13', 'zzz.3.16']) {
      const result = await attempt(query);
      expect(result.kind).toBe('invalid-reference');
      if (result.kind !== 'invalid-reference') continue;
      expect(result.fallthroughToDiscovery).toBe(false);
    }
  });
});

describe('edit policy and distance function', () => {
  it('applies the ONE policy table by key length', () => {
    expect(editDistanceBudget(0)).toBe(0);
    expect(editDistanceBudget(4)).toBe(0);
    expect(editDistanceBudget(5)).toBe(1);
    expect(editDistanceBudget(8)).toBe(1);
    expect(editDistanceBudget(9)).toBe(2);
    expect(editDistanceBudget(20)).toBe(2);
  });

  it('counts a transposition as ONE edit (Damerau, not plain Levenshtein)', () => {
    expect(damerauLevenshtein('jhon', 'john', 2)).toBe(1);
    expect(damerauLevenshtein('pslam', 'psalm', 2)).toBe(1);
  });

  it('is a bounded integer metric', () => {
    expect(damerauLevenshtein('same', 'same', 0)).toBe(0);
    expect(damerauLevenshtein('palms', 'psalms', 1)).toBe(1);
    expect(damerauLevenshtein('filipians', 'philipians', 2)).toBe(2);
    expect(damerauLevenshtein('filipians', 'philippians', 2)).toBeNull();
    expect(damerauLevenshtein('a', 'abcd', 2)).toBeNull();
  });
});

describe('row-order determinism', () => {
  it('returns identical outcomes across 100 shuffles of the alias rows', async () => {
    // mulberry32 with a fixed seed: reproducible on every platform.
    let state = 0x5eedba5e;
    const random = (): number => {
      state |= 0;
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const shuffling = makeResolver((rows) => {
      for (let i = rows.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [rows[i], rows[j]] = [rows[j]!, rows[i]!];
      }
      return rows;
    });
    const queries = ['filipians 4 13', 'palms 91', 'aaaad 2:3', 'qrstuvwzz 2:3', 'John 3 16'];
    const baseline = await Promise.all(
      queries.map((query) => resolveReferenceAttempt(query, resolver)),
    );
    for (let round = 0; round < 100; round += 1) {
      for (let i = 0; i < queries.length; i += 1) {
        const shuffled = await resolveReferenceAttempt(queries[i]!, shuffling);
        expect(shuffled).toEqual(baseline[i]);
      }
    }
  });
});
