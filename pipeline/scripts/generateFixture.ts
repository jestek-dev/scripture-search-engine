/**
 * Generates the committed dev fixture corpus from a full translation export.
 *
 * Why a fixture exists at all: CI must run the noise probes (G8) and latency
 * gate (G11) on every PR, and it cannot rebuild a 31,103-verse corpus from
 * network sources on each run without making the gauntlet slow and dependent
 * on a third party being up. So a small, real, public-domain subset is
 * committed, and CI gates against it.
 *
 * Why a SUBSET and not synthetic text: probe metrics measured against made-up
 * verses would be measuring nothing. These are the actual WEB verses for the
 * passages our golden fixtures name, plus enough surrounding breadth that
 * distinctiveness and churn numbers mean something.
 *
 * Usage:
 *   npx tsx scripts/generateFixture.ts <path-to-full-web-json>
 *
 * The output is deterministic: same input, same bytes out.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BOOKS, findBook } from '../src/books.js';
import { importVpl } from '../src/importers/vplImporter.js';
import type { VerseArrayEntry, VerseArraySource } from '../src/importers/verseArrayImporter.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(HERE, '..', 'fixtures', 'web-subset.json');

/**
 * Passage selection, with the reason each is present. A fixture whose
 * contents nobody can justify becomes impossible to prune later.
 */
export const SELECTION: readonly { book: string; chapters: readonly number[]; why: string }[] = [
  { book: 'James', chapters: [1, 2], why: 'golden fixture #1 anchor: hearers and doers' },
  { book: 'Matthew', chapters: [5, 6, 7], why: 'fixture #1 anchor (7:24-27) + dense teaching text' },
  { book: 'Luke', chapters: [6], why: 'fixture #1 anchor (6:46-49)' },
  { book: 'Ezekiel', chapters: [33], why: 'fixture #1 acceptable (33:31-32)' },
  { book: 'Romans', chapters: [2, 8], why: 'fixture #1 acceptable (2:13); Rom 8 is high-traffic' },
  { book: 'John', chapters: [1, 13], why: 'fixture #1 acceptable (13:17); John 1 for prologue vocabulary' },
  { book: 'Psalms', chapters: [1, 23, 46, 91, 121], why: 'refuge/shelter probes; Ps 46 reference tests' },
  { book: 'Genesis', chapters: [1, 2, 3, 5], why: 'Gen 5:1 is fixture #1 mustNotRank; Gen 1-3 adds breadth' },
  { book: 'Isaiah', chapters: [40, 43], why: 'refuge/comfort probes; distinct prophetic register' },
  { book: 'Ephesians', chapters: [2], why: 'grace probes' },
  { book: 'Galatians', chapters: [1], why: 'grace probes' },
  { book: 'Hebrews', chapters: [10, 11], why: 'faith/obedience vocabulary' },
  { book: '1 John', chapters: [1, 2], why: 'obedience + walking in light vocabulary' },
  { book: 'Deuteronomy', chapters: [6], why: 'hear/obey vocabulary (Shema) — archaic-fold test material' },
  { book: 'Joshua', chapters: [1], why: 'observe/do vocabulary' },

  // --- Old Testament breadth, added 2026-07-30 ---
  // Layer B went from Psalms-only to 99% of the Bible, but every probe still
  // sat in Psalms and the New Testament. A noise detector aimed away from
  // where the data landed reports quiet whatever happens. These chapters give
  // the probe set something to measure in the genres the OT commentators
  // actually cover: law, narrative, histories, wisdom and prophecy.
  { book: 'Exodus', chapters: [20], why: 'law: the Decalogue — dense legal register' },
  { book: 'Leviticus', chapters: [19], why: 'law: holiness code, the worst-covered genre before KD' },
  { book: 'Numbers', chapters: [6], why: 'law/liturgy: Aaronic blessing; Numbers was the least-covered book' },
  { book: 'Ruth', chapters: [1], why: 'narrative: kinsman-redeemer vocabulary' },
  { book: '1 Kings', chapters: [19], why: 'histories: Elijah at Horeb — narrative with strong imagery' },
  { book: '2 Chronicles', chapters: [7], why: 'histories: "if my people" — Chronicles was 32% covered before KD' },
  { book: 'Nehemiah', chapters: [8], why: 'histories: reading the law; still the weakest OT book' },
  { book: 'Proverbs', chapters: [3], why: 'wisdom: trust/lean-not — distinct sapiential register' },
  { book: 'Ecclesiastes', chapters: [3], why: 'wisdom: a time for everything' },
  { book: 'Isaiah', chapters: [53], why: 'prophets: the suffering servant' },
  { book: 'Jeremiah', chapters: [29], why: 'prophets: plans to prosper you — high-traffic, easily mis-surfaced' },
  { book: 'Micah', chapters: [6], why: 'minor prophets: do justly, love mercy' },
  { book: 'Malachi', chapters: [3], why: 'minor prophets: tithes and the refiner' },

  // --- Torrey/Miller topical admission, added 2026-08-06 ---
  // Chapters carrying the anchors and fixture passages of the 24 first-batch
  // concepts (and the torrey-sourced anchors added to existing concepts).
  // Committed verses were extended from eBible.org's canonical USFM sources
  // (hosted verbatim in github.com/jogomu/webc, GPG-signed upstream 2026-07-24),
  // fidelity-checked char-for-char against all 1,077 pre-existing fixture
  // verses before use. Re-running this script against the pinned engwebp VPL
  // reproduces the same subset.
  { book: 'Exodus', chapters: [14], why: 'victory-in-christ: the LORD fights for you (14:13-14)' },
  { book: 'Deuteronomy', chapters: [7, 33], why: 'gods-faithfulness (7:9); refuge torrey anchor (33:27)' },
  { book: '1 Samuel', chapters: [15], why: 'obedience torrey anchor: to obey is better than sacrifice (15:22)' },
  { book: 'Job', chapters: [1], why: 'surrender torrey anchor: the LORD gave and has taken away (1:21)' },
  { book: 'Psalms', chapters: [9, 16, 19, 24, 27, 30, 32, 33, 34, 37, 39, 51, 62, 65, 86, 92, 95, 100, 103, 139, 146, 147, 150], why: 'worship/praise/thanksgiving/joy/hope/trust/presence/forgiveness/creation anchors across the Psalter' },
  { book: 'Proverbs', chapters: [28], why: 'repentance torrey anchor: whoever confesses and renounces (28:13)' },
  { book: 'Isaiah', chapters: [1, 26, 40, 41, 43, 55], why: 'forgiveness (1:18, 55:7); peace (26:3); fear-not torrey anchor (41:10); trust anchor (40:31); 40 + 43 also RESTORE chapters the committed selection already claimed - generateFixture duplicate-book entries overwrote instead of merging, so Isaiah 40/43 (incl. the fear-not anchor 43:1-3) were silently absent' },
  { book: 'Jeremiah', chapters: [10, 31, 33], why: 'creation (10:12); gods-love (31:3); prayer (33:3)' },
  { book: 'Lamentations', chapters: [3], why: 'gods-faithfulness classic (3:22-23); trust/waiting (3:25-26)' },
  { book: 'Ezekiel', chapters: [18], why: 'repentance: turn and live (18:30-32)' },
  { book: 'Micah', chapters: [7], why: 'forgiveness (7:18); trust/waiting (7:7)' },
  { book: 'Nahum', chapters: [1], why: 'refuge torrey anchor: stronghold in the day of trouble (1:7)' },
  { book: 'Habakkuk', chapters: [3], why: 'joy under calamity (3:17-18)' },
  { book: 'Matthew', chapters: [16, 18, 22, 24, 26, 28], why: 'surrender (16:24); forgiving-others (18:21-22); loving-others (22:39); second-coming (24); lords-supper (26:26-28); resurrection (28:5-6)' },
  { book: 'Mark', chapters: [11], why: 'forgiving-others torrey anchor (11:25)' },
  { book: 'Luke', chapters: [9, 11, 15, 17, 18, 22, 24], why: 'surrender (9:23, 22:42); obedience (11:28); repentance (15:7); forgiving-others (17:3-4); prayer + self-deception (18); lords-supper (22:19-20); resurrection (24:5-6)' },
  { book: 'John', chapters: [3, 4, 14, 15, 16], why: 'salvation + gods-love (3:16); worship (4:23-24); peace + presence + second-coming (14); joy + gods-love (15); peace (16:33)' },
  { book: 'Acts', chapters: [1, 2, 3, 4, 13, 16, 17, 20], why: 'second-coming (1:11); resurrection + lords-supper (2); repentance (3:19, 17:30); salvation (4:12, 16:30-31); forgiveness (13:38-39); lords-supper (20:7)' },
  { book: 'Romans', chapters: [1, 5, 10, 11, 12, 13, 15], why: 'salvation (1:16, 10:9); the-cross + peace + gods-love + hope (5); grace torrey anchor (11:6); surrender (12:1); loving-others (13:8-10); hope (15:13)' },
  { book: '1 Corinthians', chapters: [1, 6, 10, 11, 13, 15], why: 'gods-faithfulness (1:9); surrender (6:19-20); lords-supper (10:16, 11:23-28); loving-others (13); resurrection + victory (15)' },
  { book: '2 Corinthians', chapters: [1, 5, 7, 10], why: 'gods-faithfulness (1:20); the-cross (5:21); repentance + holiness (7); victory (10:4-5)' },
  { book: 'Galatians', chapters: [3], why: 'the-cross torrey anchor (3:13)' },
  { book: 'Ephesians', chapters: [1, 3, 4, 5, 6], why: 'forgiveness (1:7); gods-love (3:19); forgiving-others (4:32); thanksgiving (5:20, makes the existing 5:8 anchor live); victory (6:11-12)' },
  { book: 'Philippians', chapters: [4], why: 'peace classic (4:6-7); joy (4:4); thanksgiving + prayer (4:6)' },
  { book: 'Colossians', chapters: [1, 3], why: 'creation (1:16); walking torrey anchor (1:10); forgiving-others (3:13); thanksgiving (3:17)' },
  { book: '1 Thessalonians', chapters: [4, 5], why: 'second-coming (4:16-17); thanksgiving (5:18); prayer (5:17); gods-faithfulness (5:24)' },
  { book: '1 Timothy', chapters: [6], why: 'victory torrey anchor: fight the good fight (6:12)' },
  { book: '2 Timothy', chapters: [1, 2], why: 'grace torrey anchor (1:9); gods-faithfulness (2:13)' },
  { book: 'Titus', chapters: [2, 3], why: 'salvation (2:11); second-coming (2:13); faith-and-works torrey anchor (3:8, makes the existing 3:5 anchor live)' },
  { book: 'Hebrews', chapters: [6, 12, 13], why: 'hope classic (6:19); holiness (12:14); praise + presence + fear-not (13)' },
  { book: 'James', chapters: [4, 5], why: 'presence classic (4:8); prayer (5:16)' },
  { book: '1 Peter', chapters: [1, 2, 4, 5], why: 'holiness classic (1:15-16); hope (1:3); the-cross (1:18-19, 2:24); loving-others (4:8); peace (5:7)' },
  { book: '1 John', chapters: [3, 4, 5], why: 'gods-love (3:1, 4:9-10); loving-others (3:18, 4:11); victory (5:4); makes the existing 4:18 fear-not anchor live' },
  { book: 'Revelation', chapters: [1, 3], why: 'second-coming (1:7); self-deception torrey anchor (3:17); presence (3:20)' },

  // --- Remembered-phrasing targets, added 2026-07-31 ---
  // These chapters make the remembered-wording fixtures capable of proving
  // that their curated anchors work against the WEB corpus.
  { book: 'Hebrews', chapters: [12], why: 'remembered: "fixing our eyes on Jesus" (12:2)' },
  { book: 'Colossians', chapters: [3], why: 'remembered: "work at it with all your heart" (3:23)' },
  { book: 'Acts', chapters: [1], why: 'remembered: "you will be my witnesses" (1:8)' },
  { book: 'Philippians', chapters: [4], why: 'remembered: "do not be anxious about anything" (4:6-7)' },
  { book: '1 Corinthians', chapters: [10], why: 'remembered: "tempted beyond what you can bear" (10:13)' },
  { book: 'Matthew', chapters: [17], why: 'remembered: "faith as small as a mustard seed" (17:20)' },
  { book: 'Romans', chapters: [12], why: 'remembered: "do not conform to the pattern of this world" (12:2)' },
  { book: 'Ephesians', chapters: [6], why: 'remembered: "put on the full armor of God" (6:11)' },
  { book: 'Galatians', chapters: [5], why: 'remembered: "fruit of the spirit" (5:22-23)' },
  { book: 'Ephesians', chapters: [5], why: 'remembered competitor: Ephesians 5:9 for fruit-of-the-spirit searches' },
  { book: 'Romans', chapters: [13], why: 'remembered competitor: Romans 13:12 for armor searches' },

  // --- Pastoral-care packs, added 2026-07-31 ---
  // Anchor chapters and dangerous near-misses arrive together. A mustNotRank
  // assertion for a verse outside the fixture corpus is vacuous protection.
  { book: 'Psalms', chapters: [9, 10, 11, 13, 27, 34, 40, 42, 51, 55, 56, 73, 82, 88, 101, 103, 139, 147], why: 'pastoral anchors: justice, lament, grief, betrayal, restoration, weakness, purity, healing, and child loss' },
  { book: 'Genesis', chapters: [16], why: 'pastoral anchor: Hagar names the God who sees (16:13)' },
  { book: 'Exodus', chapters: [3], why: 'pastoral anchor: I have surely seen the affliction (3:7)' },
  { book: '2 Samuel', chapters: [12], why: 'pastoral anchor: David after his infant death (12:22-23)' },
  { book: 'Job', chapters: [31], why: 'pastoral anchor: covenant with my eyes (31:1)' },
  { book: 'Proverbs', chapters: [27], why: 'pastoral anchor: the prudent sees danger and takes refuge (27:12)' },
  { book: 'Isaiah', chapters: [1, 25, 54, 61], why: 'pastoral anchors: justice, death defeated, abandonment, and the brokenhearted' },
  { book: 'Jeremiah', chapters: [17], why: 'pastoral anchor: heal me and I will be healed (17:14)' },
  { book: 'Lamentations', chapters: [3], why: 'pastoral anchor: hope lost, then mercies new every morning (3:17-26)' },
  { book: 'Micah', chapters: [7], why: 'pastoral anchor: when I fall, I will arise (7:8)' },
  { book: 'Malachi', chapters: [2], why: 'pastoral anchor: divorce teaching, textually contested and weighted low (2:13-16)' },
  { book: 'Matthew', chapters: [11, 19], why: 'pastoral anchors: rest for the burdened, divorce teaching, and child loss' },
  { book: 'Mark', chapters: [1], why: 'pastoral anchor: Jesus is willing to heal the leper (1:40-42)' },
  { book: 'John', chapters: [8, 11, 14], why: 'pastoral anchors: free indeed, grief and resurrection, and many rooms' },
  { book: 'Romans', chapters: [6, 7, 14], why: 'pastoral anchors: freedom from sin, the war within, and belonging in life and death' },
  { book: '1 Corinthians', chapters: [6, 7, 15], why: 'pastoral anchors: freedom from bondage, marriage, and resurrection victory' },
  { book: '2 Corinthians', chapters: [1, 4, 12], why: 'pastoral anchors: despair, inward renewal, and sufficient grace' },
  { book: 'Galatians', chapters: [6], why: 'pastoral anchor: restore gently and bear burdens (6:1-2)' },
  { book: 'Philippians', chapters: [1], why: 'pastoral anchor and harm gate: good work begun; desire to depart must not answer despair' },
  { book: '1 Thessalonians', chapters: [4], why: 'pastoral anchors: sanctification and grief with hope' },
  { book: '2 Timothy', chapters: [2], why: 'pastoral anchor: flee youthful lusts (2:22)' },
  { book: 'Titus', chapters: [2], why: 'pastoral anchor: grace trains us to renounce sin (2:11-14)' },
  { book: 'Hebrews', chapters: [4], why: 'pastoral anchor: a high priest touched by our weakness (4:15-16)' },
  { book: 'James', chapters: [5], why: 'pastoral anchor: prayer for the sick (5:13-16)' },
  { book: 'Revelation', chapters: [21], why: 'pastoral anchor: every tear wiped away (21:3-5)' },
  { book: 'Matthew', chapters: [18, 27], why: 'pastoral harm gates: cut-it-off sayings, forgiveness, and Judas death' },
  { book: 'Mark', chapters: [5, 6, 9], why: 'pastoral harm gates: self-injury and cut-it-off passages' },
  { book: '1 Samuel', chapters: [31], why: 'pastoral harm gate: Saul falls on his sword (31:4-5)' },
  { book: '2 Samuel', chapters: [13, 17], why: 'pastoral harm gates: sexual violence and Ahithophel death' },
  { book: 'Judges', chapters: [16], why: 'pastoral harm gate: Samson pulls down the house (16:30)' },
  { book: '1 Kings', chapters: [16, 18], why: 'pastoral harm gates: Zimri death and prophets cutting themselves' },
  { book: 'Deuteronomy', chapters: [14, 22], why: 'pastoral harm gates: cuttings for the dead and sexual-violence case law' },
  { book: 'Zechariah', chapters: [13], why: 'pastoral harm gate: strike the shepherd (13:7)' },
  { book: 'Psalms', chapters: [116], why: 'pastoral harm gate: death of the saints must not answer despair or grief' },
  { book: '1 Peter', chapters: [2, 3], why: 'pastoral harm gates: submission passages must not answer abuse disclosures' },
];

/**
 * Adapts eBible's verse-per-line export into the flat verse-array shape the
 * committed fixture uses. Keeps the fixture format stable across a change of
 * upstream distribution format, so nothing downstream of the fixture had to
 * change when WEB was re-admitted from a reachable URL.
 */
function vplAsVerseArray(contents: string): VerseArraySource {
  const { verses } = importVpl(contents);
  return {
    verses: verses.map((verse) => {
      const book = BOOKS.find((candidate) => candidate.id === verse.bookId);
      if (!book) throw new Error(`generateFixture: unknown book id ${verse.bookId}`);
      return {
        book_name: book.name,
        book: verse.bookId,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
      };
    }),
  };
}

interface FixtureFile {
  readonly $schema: string;
  readonly generatedFrom: {
    readonly translation: string;
    readonly sourceSha256: string;
    readonly note: string;
  };
  readonly selection: readonly { book: string; chapters: readonly number[]; why: string }[];
  readonly verses: readonly VerseArrayEntry[];
}

function main(): void {
  const sourcePath = process.argv[2];
  if (!sourcePath) {
    process.stderr.write('usage: tsx scripts/generateFixture.ts <path-to-full-web-json>\n');
    process.exit(2);
    return;
  }

  // The checksum recorded in the fixture must be the one in the MANIFEST, so
  // buildFixtureDb's provenance check compares like with like. For the VPL
  // route that is the zip's checksum, not the extracted text's — the zip is
  // what carries the rights record and what anyone else can re-download.
  const raw = readFileSync(sourcePath);
  const source: VerseArraySource = sourcePath.endsWith('.txt')
    ? vplAsVerseArray(readFileSync(sourcePath, 'utf8'))
    : (JSON.parse(raw.toString('utf8')) as VerseArraySource);
  const sourceSha256 = sourcePath.endsWith('.txt')
    ? createHash('sha256').update(readFileSync(join(HERE, '..', 'sources', 'engwebp_vpl.zip'))).digest('hex')
    : createHash('sha256').update(raw).digest('hex');

  // Chapters MERGE across selection entries. A book may legitimately appear
  // more than once — the reason a chapter is in the fixture is worth
  // recording per passage, not flattened into one row per book — and an
  // assigning `set` here would silently drop the earlier entry's chapters.
  // Adding "Matthew 17 — mustard seed" would have deleted Matthew 5-7 and
  // with them golden fixture #1's anchor, with nothing reporting a loss.
  const wanted = new Map<number, Set<number>>();
  for (const entry of SELECTION) {
    const book = findBook(entry.book);
    if (!book) throw new Error(`generateFixture: unknown book "${entry.book}"`);
    // MERGE chapters across entries for the same book. This used to be
    // `wanted.set(book.id, new Set(entry.chapters))`, which silently discarded
    // every earlier entry for the book — the 2026-07-30 "Isaiah 53" addition
    // overwrote "Isaiah 40, 43", so the committed fixture lacked chapters its
    // own selection record claimed (including the fear-not anchor Isa 43:1-3).
    const bucket = wanted.get(book.id) ?? new Set<number>();
    for (const chapter of entry.chapters) bucket.add(chapter);
    wanted.set(book.id, bucket);
  }

  const verses = source.verses
    .filter((verse) => wanted.get(verse.book)?.has(verse.chapter) ?? false)
    // Canonical order makes the output byte-stable regardless of source order.
    .sort((a, b) =>
      a.book !== b.book
        ? a.book - b.book
        : a.chapter !== b.chapter
          ? a.chapter - b.chapter
          : a.verse - b.verse,
    );

  if (verses.length === 0) {
    throw new Error('generateFixture: selection matched no verses — is this the right file?');
  }

  const fixture: FixtureFile = {
    $schema: 'verse-array-subset/1',
    generatedFrom: {
      translation: 'WEB',
      sourceSha256,
      note:
        'World English Bible (public domain). Subset generated by ' +
        'scripts/generateFixture.ts; see pipeline/manifests/web.json for rights.',
    },
    selection: SELECTION,
    verses,
  };

  writeFileSync(OUTPUT, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
  process.stdout.write(
    `Wrote ${verses.length} verses to ${OUTPUT}\nSource SHA-256: ${sourceSha256}\n`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
