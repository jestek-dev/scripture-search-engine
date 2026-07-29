import { normalizeBookKey } from "./normalize.js";

export type Testament = "OT" | "NT";

export interface Book {
  /** Canonical book id, 1-66, Genesis = 1, Revelation = 66. */
  id: number;
  /**
   * Canonical display name. Copied verbatim from the source corpora
   * (web_bible.json / KJV_bible.json use identical names for all 66 books)
   * so downstream importers can join on this string exactly.
   */
  name: string;
  testament: Testament;
  /** Number of chapters in this book, derived from the source corpora. */
  chapterCount: number;
  /** Alias strings a user might type to reference this book. */
  abbreviations: string[];
}

// Chapter counts derived from web_bible.json (max chapter number observed
// per book across all 31,103 verses). KJV_bible.json agrees on book set and
// order; only total verse count differs (31,102) due to a small number of
// verse-numbering differences within chapters, not chapter counts.
export const BOOKS: readonly Book[] = [
  { id: 1, name: "Genesis", testament: "OT", chapterCount: 50, abbreviations: ["Gen", "Gn"] },
  { id: 2, name: "Exodus", testament: "OT", chapterCount: 40, abbreviations: ["Exod", "Exo", "Ex"] },
  { id: 3, name: "Leviticus", testament: "OT", chapterCount: 27, abbreviations: ["Lev", "Lv"] },
  { id: 4, name: "Numbers", testament: "OT", chapterCount: 36, abbreviations: ["Num", "Nm", "Nu"] },
  { id: 5, name: "Deuteronomy", testament: "OT", chapterCount: 34, abbreviations: ["Deut", "Dt"] },
  { id: 6, name: "Joshua", testament: "OT", chapterCount: 24, abbreviations: ["Josh", "Jos"] },
  { id: 7, name: "Judges", testament: "OT", chapterCount: 21, abbreviations: ["Judg", "Jdg"] },
  { id: 8, name: "Ruth", testament: "OT", chapterCount: 4, abbreviations: ["Rth", "Ru"] },
  {
    id: 9,
    name: "1 Samuel",
    testament: "OT",
    chapterCount: 31,
    abbreviations: ["1 Sam", "1Sam", "I Samuel", "I Sam", "1Sa"],
  },
  {
    id: 10,
    name: "2 Samuel",
    testament: "OT",
    chapterCount: 24,
    abbreviations: ["2 Sam", "2Sam", "II Samuel", "II Sam", "2Sa"],
  },
  {
    id: 11,
    name: "1 Kings",
    testament: "OT",
    chapterCount: 22,
    abbreviations: ["1 Kgs", "1Kgs", "I Kings", "I Kgs", "1Ki"],
  },
  {
    id: 12,
    name: "2 Kings",
    testament: "OT",
    chapterCount: 25,
    abbreviations: ["2 Kgs", "2Kgs", "II Kings", "II Kgs", "2Ki"],
  },
  {
    id: 13,
    name: "1 Chronicles",
    testament: "OT",
    chapterCount: 29,
    abbreviations: ["1 Chron", "1Chron", "1 Chr", "1Chr", "I Chronicles"],
  },
  {
    id: 14,
    name: "2 Chronicles",
    testament: "OT",
    chapterCount: 36,
    abbreviations: ["2 Chron", "2Chron", "2 Chr", "2Chr", "II Chronicles"],
  },
  { id: 15, name: "Ezra", testament: "OT", chapterCount: 10, abbreviations: ["Ezr"] },
  { id: 16, name: "Nehemiah", testament: "OT", chapterCount: 13, abbreviations: ["Neh"] },
  { id: 17, name: "Esther", testament: "OT", chapterCount: 10, abbreviations: ["Esth", "Est"] },
  { id: 18, name: "Job", testament: "OT", chapterCount: 42, abbreviations: ["Jb"] },
  {
    id: 19,
    name: "Psalms",
    testament: "OT",
    chapterCount: 150,
    abbreviations: ["Psalm", "Ps", "Psa", "Pslm", "Psm"],
  },
  {
    id: 20,
    name: "Proverbs",
    testament: "OT",
    chapterCount: 31,
    // "Pr" (not "Ps", which is Psalms) is a common short form for Proverbs.
    abbreviations: ["Prov", "Prv", "Pr"],
  },
  {
    id: 21,
    name: "Ecclesiastes",
    testament: "OT",
    chapterCount: 12,
    abbreviations: ["Eccles", "Eccl", "Ecc"],
  },
  {
    id: 22,
    name: "Song of Solomon",
    testament: "OT",
    chapterCount: 8,
    abbreviations: ["Song", "SoS", "SS", "Song of Songs", "Canticles"],
  },
  { id: 23, name: "Isaiah", testament: "OT", chapterCount: 66, abbreviations: ["Isa", "Is"] },
  { id: 24, name: "Jeremiah", testament: "OT", chapterCount: 52, abbreviations: ["Jer", "Jr"] },
  {
    id: 25,
    name: "Lamentations",
    testament: "OT",
    chapterCount: 5,
    abbreviations: ["Lam", "La"],
  },
  { id: 26, name: "Ezekiel", testament: "OT", chapterCount: 48, abbreviations: ["Ezek", "Eze"] },
  { id: 27, name: "Daniel", testament: "OT", chapterCount: 12, abbreviations: ["Dan", "Dn"] },
  { id: 28, name: "Hosea", testament: "OT", chapterCount: 14, abbreviations: ["Hos"] },
  { id: 29, name: "Joel", testament: "OT", chapterCount: 3, abbreviations: ["Jl"] },
  { id: 30, name: "Amos", testament: "OT", chapterCount: 9, abbreviations: ["Am"] },
  { id: 31, name: "Obadiah", testament: "OT", chapterCount: 1, abbreviations: ["Obad", "Ob"] },
  { id: 32, name: "Jonah", testament: "OT", chapterCount: 4, abbreviations: ["Jon"] },
  { id: 33, name: "Micah", testament: "OT", chapterCount: 7, abbreviations: ["Mic"] },
  { id: 34, name: "Nahum", testament: "OT", chapterCount: 3, abbreviations: ["Nah"] },
  { id: 35, name: "Habakkuk", testament: "OT", chapterCount: 3, abbreviations: ["Hab"] },
  {
    id: 36,
    name: "Zephaniah",
    testament: "OT",
    chapterCount: 3,
    abbreviations: ["Zeph", "Zep"],
  },
  { id: 37, name: "Haggai", testament: "OT", chapterCount: 2, abbreviations: ["Hag"] },
  {
    id: 38,
    name: "Zechariah",
    testament: "OT",
    chapterCount: 14,
    abbreviations: ["Zech", "Zec"],
  },
  { id: 39, name: "Malachi", testament: "OT", chapterCount: 4, abbreviations: ["Mal"] },
  { id: 40, name: "Matthew", testament: "NT", chapterCount: 28, abbreviations: ["Matt", "Mt"] },
  { id: 41, name: "Mark", testament: "NT", chapterCount: 16, abbreviations: ["Mrk", "Mk"] },
  { id: 42, name: "Luke", testament: "NT", chapterCount: 24, abbreviations: ["Lk"] },
  { id: 43, name: "John", testament: "NT", chapterCount: 21, abbreviations: ["Jn", "Jhn"] },
  { id: 44, name: "Acts", testament: "NT", chapterCount: 28, abbreviations: ["Act"] },
  { id: 45, name: "Romans", testament: "NT", chapterCount: 16, abbreviations: ["Rom", "Rm"] },
  {
    id: 46,
    name: "1 Corinthians",
    testament: "NT",
    chapterCount: 16,
    abbreviations: ["1 Cor", "1Cor", "I Corinthians", "I Cor", "1Co"],
  },
  {
    id: 47,
    name: "2 Corinthians",
    testament: "NT",
    chapterCount: 13,
    abbreviations: ["2 Cor", "2Cor", "II Corinthians", "II Cor", "2Co"],
  },
  { id: 48, name: "Galatians", testament: "NT", chapterCount: 6, abbreviations: ["Gal"] },
  { id: 49, name: "Ephesians", testament: "NT", chapterCount: 6, abbreviations: ["Eph"] },
  {
    id: 50,
    name: "Philippians",
    testament: "NT",
    chapterCount: 4,
    abbreviations: ["Phil", "Php"],
  },
  {
    id: 51,
    name: "Colossians",
    testament: "NT",
    chapterCount: 4,
    abbreviations: ["Col"],
  },
  {
    id: 52,
    name: "1 Thessalonians",
    testament: "NT",
    chapterCount: 5,
    abbreviations: ["1 Thess", "1Thess", "I Thessalonians", "1 Thes", "1Th"],
  },
  {
    id: 53,
    name: "2 Thessalonians",
    testament: "NT",
    chapterCount: 3,
    abbreviations: ["2 Thess", "2Thess", "II Thessalonians", "2 Thes", "2Th"],
  },
  {
    id: 54,
    name: "1 Timothy",
    testament: "NT",
    chapterCount: 6,
    abbreviations: ["1 Tim", "1Tim", "I Timothy", "1Ti"],
  },
  {
    id: 55,
    name: "2 Timothy",
    testament: "NT",
    chapterCount: 4,
    abbreviations: ["2 Tim", "2Tim", "II Timothy", "2Ti"],
  },
  { id: 56, name: "Titus", testament: "NT", chapterCount: 3, abbreviations: ["Tit"] },
  {
    id: 57,
    name: "Philemon",
    testament: "NT",
    chapterCount: 1,
    // "Phlm" is the standard OSIS abbreviation for Philemon.
    abbreviations: ["Philem", "Phm", "Phlm"],
  },
  { id: 58, name: "Hebrews", testament: "NT", chapterCount: 13, abbreviations: ["Heb"] },
  { id: 59, name: "James", testament: "NT", chapterCount: 5, abbreviations: ["Jas", "Jm"] },
  {
    id: 60,
    name: "1 Peter",
    testament: "NT",
    chapterCount: 5,
    abbreviations: ["1 Pet", "1Pet", "I Peter", "1Pe", "1 Pt"],
  },
  {
    id: 61,
    name: "2 Peter",
    testament: "NT",
    chapterCount: 3,
    abbreviations: ["2 Pet", "2Pet", "II Peter", "2Pe", "2 Pt"],
  },
  {
    id: 62,
    name: "1 John",
    testament: "NT",
    chapterCount: 5,
    abbreviations: ["1 Jn", "1Jn", "I John", "1Jo"],
  },
  {
    id: 63,
    name: "2 John",
    testament: "NT",
    chapterCount: 1,
    abbreviations: ["2 Jn", "2Jn", "II John", "2Jo"],
  },
  {
    id: 64,
    name: "3 John",
    testament: "NT",
    chapterCount: 1,
    abbreviations: ["3 Jn", "3Jn", "III John", "3Jo"],
  },
  // "Jud" deliberately omitted: it's a conventional abbreviation for both
  // Jude and Judges, and an ambiguous input should return null (see
  // findBook's doc comment) rather than silently picking a side.
  { id: 65, name: "Jude", testament: "NT", chapterCount: 1, abbreviations: ["Jde"] },
  {
    id: 66,
    name: "Revelation",
    testament: "NT",
    chapterCount: 22,
    abbreviations: ["Rev", "Rv", "Revelations", "Apocalypse"],
  },
];

/** Build the normalized-key -> Book lookup once, at module load. */
const LOOKUP: ReadonlyMap<string, Book> = (() => {
  const map = new Map<string, Book>();
  for (const book of BOOKS) {
    const keys = [book.name, ...book.abbreviations];
    for (const key of keys) {
      map.set(normalizeBookKey(key), book);
    }
  }
  return map;
})();

/**
 * Resolve a user-typed book string (case- and punctuation-insensitive) to
 * its canonical Book entry, or `undefined` if it does not match anything.
 * Never guesses: an unrecognised string returns `undefined`, not a
 * best-effort match.
 */
export function findBook(input: string): Book | undefined {
  return LOOKUP.get(normalizeBookKey(input));
}

export interface BookAliasRow {
  readonly aliasKey: string;
  readonly bookId: number;
}

/**
 * Canonical alias rows shipped to the app. Duplicate spellings that
 * normalise to the same key are collapsed; a cross-book collision is a
 * build defect and never resolved by last-write-wins guessing.
 */
export function bookAliasRows(): readonly BookAliasRow[] {
  const rows = new Map<string, number>();
  for (const book of BOOKS) {
    for (const alias of [book.name, ...book.abbreviations]) {
      const aliasKey = normalizeBookKey(alias);
      const existing = rows.get(aliasKey);
      if (existing !== undefined && existing !== book.id) {
        throw new Error(
          `bookAliasRows: alias "${aliasKey}" maps to both book ${existing} and ${book.id}`,
        );
      }
      rows.set(aliasKey, book.id);
    }
  }
  return [...rows.entries()]
    .map(([aliasKey, bookId]) => ({ aliasKey, bookId }))
    .sort((left, right) => left.aliasKey.localeCompare(right.aliasKey));
}
