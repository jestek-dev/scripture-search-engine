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
import { dirname, join } from 'node:path';
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
const SELECTION: readonly { book: string; chapters: readonly number[]; why: string }[] = [
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

  // --- remembered-phrasings targets, added 2026-07-31 ---
  // Anchors for the remembered-phrasings packs. Measured against the full
  // artifact, these are the passages a searcher types in NIV/ESV wording and
  // does NOT reach: the WEB renders them differently enough that no lexical
  // rung fires. A golden fixture can only assert that a curated anchor fixed
  // it if the anchor's verse is in the corpus being gated, so the chapters
  // come in with the packs rather than leaving the fixtures pending.
  { book: 'Hebrews', chapters: [12], why: 'remembered: "fixing our eyes on Jesus" (12:2)' },
  { book: 'Colossians', chapters: [3], why: 'remembered: "work at it with all your heart" (3:23)' },
  { book: 'Acts', chapters: [1], why: 'remembered: "you will be my witnesses" (1:8)' },
  { book: 'Philippians', chapters: [4], why: 'remembered: "do not be anxious about anything" (4:6-7)' },
  { book: '1 Corinthians', chapters: [10], why: 'remembered: "tempted beyond what you can bear" (10:13)' },
  { book: 'Matthew', chapters: [17], why: 'remembered: "faith as small as a mustard seed" (17:20)' },
  { book: 'Romans', chapters: [12], why: 'remembered: "do not conform to the pattern of this world" (12:2)' },
  { book: 'Ephesians', chapters: [6], why: 'remembered: "put on the full armor of God" (6:11)' },
  { book: 'Galatians', chapters: [5], why: 'remembered: "fruit of the spirit" (5:22-23)' },
  // Competitors the packs must NOT dislodge. A fixture that adds only the
  // right answer cannot detect an anchor that outranks a better lexical hit,
  // which is the precise failure mode an editorial anchor introduces.
  { book: 'Ephesians', chapters: [5], why: 'competitor: Eph 5:9 outranks Gal 5:22 on "fruit of the spirit"' },
  { book: 'Romans', chapters: [13], why: 'competitor: Rom 13:12 outranks Eph 6:11 on "armor"' },

  // --- pastoral-care packs, added 2026-07-31 ---
  // Two kinds of chapter arrive together, and the second kind is the point.
  //
  // ANCHOR chapters carry the passages the pastoral packs assert (approved
  // by Jesse 2026-07-31 after two external reviews). A golden fixture can
  // only prove an anchor fires if the anchor's verse is in the gated corpus.
  { book: 'Psalms', chapters: [9, 10, 11, 13, 27, 34, 40, 42, 51, 55, 56, 73, 82, 88, 101, 103, 139, 147], why: 'pastoral anchors: justice for the oppressed (9-11, 82), lament (13, 42, 88), brokenhearted (34, 147), pit (40), renewal (51), betrayal (55), tears kept (56), strength when flesh fails (73), pure eyes (101), heals diseases (103), formed in the womb (139)' },
  { book: 'Genesis', chapters: [16], why: 'pastoral anchor: Hagar names the God who sees (16:13)' },
  { book: 'Exodus', chapters: [3], why: 'pastoral anchor: I have surely seen the affliction (3:7)' },
  { book: '2 Samuel', chapters: [12], why: 'pastoral anchor: David after his infant’s death (12:22-23)' },
  { book: 'Job', chapters: [31], why: 'pastoral anchor: covenant with my eyes (31:1)' },
  { book: 'Proverbs', chapters: [27], why: 'pastoral anchor: the prudent sees danger and takes refuge (27:12)' },
  { book: 'Isaiah', chapters: [1, 25, 54, 61], why: 'pastoral anchors: seek justice (1:17), death swallowed up (25:8), the forsaken wife (54), bind up the brokenhearted (61)' },
  { book: 'Jeremiah', chapters: [17], why: 'pastoral anchor: heal me and I will be healed (17:14)' },
  { book: 'Lamentations', chapters: [3], why: 'pastoral anchor: hope lost, then mercies new every morning (3:17-26)' },
  { book: 'Micah', chapters: [7], why: 'pastoral anchor: when I fall, I will arise (7:8)' },
  { book: 'Malachi', chapters: [2], why: 'pastoral anchor: divorce teaching, textually contested, weighted low (2:13-16)' },
  { book: 'Matthew', chapters: [11, 19], why: 'pastoral anchors: come to me, all who labor (11:28-30); divorce teaching + let the children come (19)' },
  { book: 'Mark', chapters: [1], why: 'pastoral anchor: Jesus willing to heal the leper (1:40-42)' },
  { book: 'John', chapters: [8, 11, 14], why: 'pastoral anchors: free indeed (8:36), the resurrection and the life + Jesus wept (11), many rooms (14:1-3)' },
  { book: 'Romans', chapters: [6, 7, 14], why: 'pastoral anchors: no longer slaves of sin (6), the war within (7), whether we live or die (14:8)' },
  { book: '1 Corinthians', chapters: [6, 7, 15], why: 'pastoral anchors: not brought under the power of anything (6:12), marriage instructions (7), resurrection victory (15:51-57)' },
  { book: '2 Corinthians', chapters: [1, 4, 12], why: 'pastoral anchors: despaired even of life (1:8-10), outward decay, inward renewal (4:16-18), grace sufficient in weakness (12:9-10)' },
  { book: 'Galatians', chapters: [6], why: 'pastoral anchor: restore gently, bear burdens (6:1-2)' },
  { book: 'Philippians', chapters: [1], why: 'pastoral anchor: he who began a good work (1:6) — AND harm gate: desire to depart (1:21-23) must never rank for despair queries' },
  { book: '1 Thessalonians', chapters: [4], why: 'pastoral anchors: sanctification (4:3-5) and grief with hope (4:13-18)' },
  { book: '2 Timothy', chapters: [2], why: 'pastoral anchor: flee youthful lusts (2:22)' },
  { book: 'Titus', chapters: [2], why: 'pastoral anchor: grace trains us to renounce (2:11-14)' },
  { book: 'Hebrews', chapters: [4], why: 'pastoral anchor: a high priest touched by our weakness (4:15-16)' },
  { book: 'James', chapters: [5], why: 'pastoral anchor: the prayer of faith for the sick (5:13-16)' },
  { book: 'Revelation', chapters: [21], why: 'pastoral anchor: every tear wiped away (21:3-5)' },

  // HARM chapters exist so mustNotRank assertions BITE. A mustNotRank for a
  // verse absent from the gated corpus passes vacuously — protection that
  // reads as real and is decoration, this repo’s named failure mode. These
  // chapters are the canon’s suicide narratives, self-harm-adjacent wording,
  // and the passages weaponized against abuse victims; the goldens assert
  // they never rank for crisis queries, and that assertion must be falsifiable.
  { book: 'Matthew', chapters: [18, 27], why: 'harm gates: cut-it-off sayings + seventy-times-seven (18); Judas hangs himself (27:5)' },
  { book: 'Mark', chapters: [5, 6, 9], why: 'harm gates: cutting himself (5:5); Herodias asks for a head, the measured worst result for despair (6:25); cut-it-off sayings (9:43-47)' },
  { book: '1 Samuel', chapters: [31], why: 'harm gate: Saul falls on his sword (31:4-5)' },
  { book: '2 Samuel', chapters: [13, 17], why: 'harm gates: Amnon "forced her" — real lexical risk for abuse-disclosure queries (13); Ahithophel hangs himself (17:23)' },
  { book: 'Judges', chapters: [16], why: 'harm gate: Samson pulls the house down (16:30)' },
  { book: '1 Kings', chapters: [16, 18], why: 'harm gates: Zimri burns the house over himself (16:18); prophets of Baal cut themselves (18:28)' },
  { book: 'Deuteronomy', chapters: [14, 22], why: 'harm gates: cuttings for the dead (14:1); "force her" case law, must not answer a disclosure (22:23-29)' },
  { book: 'Zechariah', chapters: [13], why: 'harm gate: strike the shepherd (13:7), the measured worst result for "brokenhearted"' },
  { book: 'Psalms', chapters: [116], why: 'harm gate: precious in the LORD’s sight is the death of his saints (116:15), globally excluded from despair and grief queries' },
  { book: '1 Peter', chapters: [2, 3], why: 'harm gates: submission passages (2:18-3:6) must never answer an abuse disclosure' },
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
    const chapters = wanted.get(book.id) ?? new Set<number>();
    for (const chapter of entry.chapters) chapters.add(chapter);
    wanted.set(book.id, chapters);
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

main();
