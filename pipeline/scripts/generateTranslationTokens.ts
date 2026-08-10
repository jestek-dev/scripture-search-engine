/**
 * Builds the cross-translation vocabulary index.
 *
 * THE PROBLEM. The artifact ships one translation. People search in whichever
 * translation they learned the verse in, so "plans to prosper you" — NIV
 * wording for Jeremiah 29:11 — finds nothing, because the shipped text reads
 * "thoughts of peace, and not of evil". Measured: of ten commonly remembered
 * phrasings, the public-domain text carries five. Adding KJV fixes none of the
 * other five, because the wordings people remember are from modern copyrighted
 * translations.
 *
 * WHAT THIS SHIPS, AND WHAT IT DOES NOT. For each verse, the set of stemmed
 * word-stems that appear in some translation but not in the shipped one:
 *
 *   19029011  plan prosper hope future harm
 *
 * Unordered. Deduplicated. Stopwords removed. Stemmed, so `prospering`,
 * `prospers` and `prosper` collapse to one entry. Merged across all sources,
 * so which translation contributed which stem is not recoverable. No verse
 * text, no phrases, no word order, no punctuation.
 *
 * The prose is read once, on a machine that holds a licensed copy, and never
 * enters this repository or the artifact. What is committed is this
 * derivative, which cannot be reversed into anyone's translation — a search
 * index over a work, not a copy of it.
 *
 * WHY THE STEMS ARE ENOUGH. The runtime tokenizes queries the same way, so a
 * query in any of these translations' vocabulary reaches the right verse
 * without the verse text ever having been in that translation.
 *
 * Usage:
 *   npx tsx scripts/generateTranslationTokens.ts [--reps <path-to-licensed-json>]
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { significantWords } from '@jestek-dev/scripture-engine';

import { findBook } from '../src/books.js';
import { makeVerseId } from '../src/verseId.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, 'fixtures', 'translation-tokens.json');

/** eBible verse-per-line book codes. */
const VPL_CODES: Readonly<Record<string, number>> = {
  GEN:1,EXO:2,LEV:3,NUM:4,DEU:5,JOS:6,JDG:7,RUT:8,'1SA':9,'2SA':10,'1KI':11,'2KI':12,'1CH':13,
  '2CH':14,EZR:15,NEH:16,EST:17,JOB:18,PSA:19,PRO:20,ECC:21,SOL:22,ISA:23,JER:24,LAM:25,EZE:26,
  DAN:27,HOS:28,JOE:29,AMO:30,OBA:31,JON:32,MIC:33,NAH:34,HAB:35,ZEP:36,HAG:37,ZEC:38,MAL:39,
  MAT:40,MAR:41,LUK:42,JOH:43,ACT:44,ROM:45,'1CO':46,'2CO':47,GAL:48,EPH:49,PHI:50,COL:51,
  '1TH':52,'2TH':53,'1TI':54,'2TI':55,TIT:56,PHM:57,HEB:58,JAM:59,'1PE':60,'2PE':61,'1JO':62,
  '2JO':63,'3JO':64,JUD:65,REV:66,
};

function loadVpl(path: string): Map<number, string> {
  const out = new Map<number, string>();
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = /^([1-3]?[A-Z]{2,3}) (\d+):(\d+)\s+(.*)$/.exec(line.trim());
    if (!match || !match[4]) continue;
    const bookId = VPL_CODES[match[1] as string];
    if (!bookId) continue;
    out.set(makeVerseId(bookId, Number(match[2]), Number(match[3])), match[4]);
  }
  return out;
}

/** `{ Book: { chapter: { verse: text } } }`, the shape the licensed copies use. */
function loadNested(path: string): Map<number, string> {
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as Record<
    string,
    Record<string, Record<string, string>>
  >;
  const out = new Map<number, string>();
  for (const [bookName, chapters] of Object.entries(parsed)) {
    const book = findBook(bookName);
    if (!book) continue;
    for (const [chapter, verses] of Object.entries(chapters)) {
      for (const [verse, text] of Object.entries(verses)) {
        out.set(makeVerseId(book.id, Number(chapter), Number(verse)), text);
      }
    }
  }
  return out;
}

function main(): void {
  const repsIndex = process.argv.indexOf('--reps');
  const reps =
    repsIndex > -1
      ? process.argv[repsIndex + 1]!
      : '/Users/jesse.freeman/Documents/GitHub/scripture-reps';

  const base = loadVpl(join(ROOT, 'sources', 'vpl', 'engwebp_vpl.txt'));
  if (base.size === 0) throw new Error('generateTranslationTokens: shipped translation not found');

  const sources: { id: string; verses: Map<number, string>; sha256: string }[] = [];
  const add = (id: string, path: string, loader: (p: string) => Map<number, string>): void => {
    if (!existsSync(path)) {
      process.stdout.write(`  ${id.padEnd(6)} MISSING at ${path} — skipped\n`);
      return;
    }
    sources.push({
      id,
      verses: loader(path),
      sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
    });
  };

  add('kjv', join(ROOT, 'sources', 'kjv', 'eng-kjv_vpl.txt'), loadVpl);
  add('esv', join(reps, 'ESV_bible.json'), loadNested);
  add('niv', join(reps, 'NIV_bible.json'), loadNested);
  add('nlt', join(reps, 'NLT_bible.json'), loadNested);

  if (sources.length === 0) {
    throw new Error(
      'generateTranslationTokens: no comparison translations found. Pass --reps <path>.',
    );
  }

  // verseId -> stems present in some translation but not in the shipped text.
  const extra = new Map<number, Set<string>>();
  let pairs = 0;
  for (const [verseId, text] of base) {
    const shipped = new Set(significantWords(text));
    let bucket: Set<string> | undefined;
    for (const source of sources) {
      const other = source.verses.get(verseId);
      if (!other) continue;
      for (const token of significantWords(other)) {
        if (shipped.has(token)) continue;
        if (!bucket) {
          bucket = new Set();
          extra.set(verseId, bucket);
        }
        if (!bucket.has(token)) {
          bucket.add(token);
          pairs += 1;
        }
      }
    }
  }

  // Sorted throughout: the file is committed, and a diff should show what
  // changed rather than how the map happened to iterate.
  const tokens: Record<string, string> = {};
  for (const verseId of [...extra.keys()].sort((a, b) => a - b)) {
    tokens[String(verseId)] = [...extra.get(verseId)!].sort().join(' ');
  }

  writeFileSync(
    OUT,
    `${JSON.stringify(
      {
        $comment: [
          'Cross-translation vocabulary. GENERATED by',
          'scripts/generateTranslationTokens.ts — do not hand-edit.',
          '',
          'For each verse: word STEMS that appear in some other translation but',
          'not in the shipped one. Unordered, deduplicated, stopwords removed,',
          'stemmed, and merged across sources so no translation is separable.',
          'No verse text, no phrases, no word order.',
          '',
          'This exists so somebody who learned a verse in one translation can',
          'find it in another. The prose it was derived from is read once, on a',
          'machine holding a licensed copy, and never enters this repository or',
          'the artifact.',
        ],
        derivedFrom: sources.map((source) => ({ id: source.id, sha256: source.sha256 })),
        verseCount: extra.size,
        tokenCount: pairs,
        tokens,
      },
      null,
      0,
    )}\n`,
    'utf8',
  );

  process.stdout.write(
    `Wrote ${OUT}\n` +
      `  comparison translations : ${sources.map((s) => s.id).join(', ')}\n` +
      `  verses with extra vocab : ${extra.size} of ${base.size}\n` +
      `  (verse, stem) pairs     : ${pairs}\n`,
  );
}

main();
