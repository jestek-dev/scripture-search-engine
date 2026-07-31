/**
 * Detects PASSAGE READINGS in sermon captions.
 *
 * ANALYSIS ONLY. Not wired into any build, and no source in the registry uses
 * it. It is kept because it works and because re-deriving it would be wasted
 * effort: any future sermon corpus needs exactly this to become verse-aligned.
 *
 * The corpus it was written against — 423 Lighthouse YouTube caption files —
 * was assessed and NOT admitted. See
 * docs/research/2026-07-30-lh-sermon-corpus-assessment.md for the measurements
 * and the reasoning. In short: the detector succeeds (537 readings, median
 * span 2 verses, 62% of sermons) and the corpus still does not pay, because
 * 535 of those 537 readings land on verses five historical expositors already
 * cover, and corroboration would reject the modern vocabulary that was the
 * point of admitting it.
 *
 * Jesse's observation, and it is the right one: preachers read the text aloud.
 * A reading produces 20-40 words closely tracking a specific verse, and unlike
 * a remembered paraphrase it is CLOSE to the corpus — which is exactly the
 * case token overlap handles well. The spoken citation may say only "Jeremiah
 * 29", but the reading itself pins 29:11.
 *
 * A single matching window is weak evidence: it could be a passing quotation.
 * A RUN of windows tracking consecutive verses is a reading, and that is what
 * this looks for.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { significantWords, tokenStream } from '@jestek-dev/scripture-engine';

// Point at a directory of caption/transcript files. Overridable so this is
// not bound to one machine's download folder.
const SERMONS = process.env.SERMONS ?? '/Users/jesse.freeman/Downloads/LH Sermons json';
const WEB = process.env.WEB_VPL ?? join(process.cwd(), 'sources', 'vpl', 'engwebp_vpl.txt');

const CODES: Record<string, number> = {
  GEN:1,EXO:2,LEV:3,NUM:4,DEU:5,JOS:6,JDG:7,RUT:8,'1SA':9,'2SA':10,'1KI':11,'2KI':12,'1CH':13,
  '2CH':14,EZR:15,NEH:16,EST:17,JOB:18,PSA:19,PRO:20,ECC:21,SOL:22,ISA:23,JER:24,LAM:25,EZE:26,
  DAN:27,HOS:28,JOE:29,AMO:30,OBA:31,JON:32,MIC:33,NAH:34,HAB:35,ZEP:36,HAG:37,ZEC:38,MAL:39,
  MAT:40,MAR:41,LUK:42,JOH:43,ACT:44,ROM:45,'1CO':46,'2CO':47,GAL:48,EPH:49,PHI:50,COL:51,
  '1TH':52,'2TH':53,'1TI':54,'2TI':55,TIT:56,PHM:57,HEB:58,JAM:59,'1PE':60,'2PE':61,'1JO':62,
  '2JO':63,'3JO':64,JUD:65,REV:66,
};
const NAMES = ['','Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];

interface Verse { id: number; ref: string; tokens: string[]; }

const verses: Verse[] = [];
for (const line of readFileSync(WEB, 'utf8').split('\n')) {
  const m = /^([1-3]?[A-Z]{2,3}) (\d+):(\d+)\s+(.*)$/.exec(line.trim());
  if (!m || !m[4]) continue;
  const book = CODES[m[1]!];
  if (!book) continue;
  verses.push({
    id: book * 1_000_000 + Number(m[2]) * 1000 + Number(m[3]),
    ref: `${NAMES[book]} ${m[2]}:${m[3]}`,
    tokens: significantWords(m[4]),
  });
}
const byId = new Map(verses.map((v) => [v.id, v]));
const index = new Map<string, number[]>();
const df = new Map<string, number>();
verses.forEach((v, i) => {
  for (const t of new Set(v.tokens)) {
    const bucket = index.get(t);
    if (bucket) bucket.push(i);
    else index.set(t, [i]);
    df.set(t, (df.get(t) ?? 0) + 1);
  }
});
const N = verses.length;
const idf = (t: string) => Math.log(N / (1 + (df.get(t) ?? 0)));

/** Best-matching verse for a window, by IDF-weighted coverage OF THE VERSE. */
function bestVerse(window: string[]): { id: number; score: number } | null {
  let rarest = window[0]!;
  for (const t of window) if ((df.get(t) ?? 1e9) < (df.get(rarest) ?? 1e9)) rarest = t;
  const postings = index.get(rarest);
  if (!postings || postings.length > 600) return null;
  const set = new Set(window);
  let bestId = -1;
  let best = 0;
  for (const vi of postings) {
    const v = verses[vi]!;
    if (v.tokens.length < 3) continue;
    let hit = 0;
    let total = 0;
    for (const t of new Set(v.tokens)) {
      total += idf(t);
      if (set.has(t)) hit += idf(t);
    }
    const score = total > 0 ? hit / total : 0;
    if (score > best) { best = score; bestId = v.id; }
  }
  return bestId < 0 ? null : { id: bestId, score: best };
}

interface Reading { startId: number; endId: number; verses: number; expositionWords: number; }

const files = readdirSync(SERMONS).filter((f) => f.endsWith('.json3'));
const readings: { file: string; reading: Reading }[] = [];
let sermonsWithReading = 0;

for (const file of files) {
  let parsed: { events?: { segs?: { utf8: string }[] }[] };
  try { parsed = JSON.parse(readFileSync(join(SERMONS, file), 'utf8')); } catch { continue; }
  const text = (parsed.events ?? []).filter((e) => e.segs)
    .map((e) => e.segs!.map((s) => s.utf8).join('')).join('').replace(/\s+/g, ' ');
  const stream = tokenStream(text).map((e) => e.token);

  // Map each window position to its best verse, where the match is strong
  // enough to be a reading rather than a topical resemblance.
  const hits: (number | null)[] = [];
  const W = 8;
  for (let i = 0; i + W <= stream.length; i += 1) {
    const b = bestVerse(stream.slice(i, i + W));
    hits.push(b && b.score >= 0.5 ? b.id : null);
  }

  // A run: consecutive windows landing on the same verse or the next few.
  // Requires at least two DISTINCT verses in sequence — one verse alone is a
  // quotation, several in order is someone reading.
  let i = 0;
  const found: Reading[] = [];
  while (i < hits.length) {
    if (hits[i] === null) { i += 1; continue; }
    let j = i;
    let last = hits[i]!;
    const seen = new Set<number>([last]);
    while (j + 1 < hits.length) {
      const next = hits[j + 1] ?? null;
      if (next === null) {
        // tolerate a short gap inside a reading
        let k = j + 1;
        while (k < hits.length && k - j <= 6 && hits[k] === null) k += 1;
        if (k < hits.length && hits[k] != null && hits[k]! >= last && hits[k]! - last <= 6) {
          j = k; last = hits[k]!; seen.add(last); continue;
        }
        break;
      }
      if (next >= last && next - last <= 6) { j += 1; last = next; seen.add(next); continue; }
      break;
    }
    if (seen.size >= 2) {
      const ids = [...seen].sort((a, b) => a - b);
      found.push({
        startId: ids[0]!,
        endId: ids[ids.length - 1]!,
        verses: seen.size,
        expositionWords: Math.min(stream.length - j, 400),
      });
    }
    i = j + 1;
  }
  if (found.length > 0) sermonsWithReading += 1;
  for (const reading of found) readings.push({ file, reading });
}

const perSermon = readings.length / files.length;
const versesCovered = new Set<number>();
for (const { reading } of readings) {
  for (let id = reading.startId; id <= reading.endId; id += 1) if (byId.has(id)) versesCovered.add(id);
}

console.log(`sermons                    : ${files.length}`);
console.log(`sermons with >=1 reading   : ${sermonsWithReading} (${((sermonsWithReading / files.length) * 100).toFixed(0)}%)`);
console.log(`readings detected          : ${readings.length}  (${perSermon.toFixed(1)} per sermon)`);
console.log(`distinct verses read       : ${versesCovered.size}`);
const spans = readings.map((r) => r.reading.verses).sort((a, b) => a - b);
console.log(`verses per reading         : median ${spans[Math.floor(spans.length / 2)]}, max ${spans[spans.length - 1]}`);

console.log('\nSAMPLE READINGS (first 25):\n');
for (const { file, reading } of readings.slice(0, 25)) {
  const a = byId.get(reading.startId), b = byId.get(reading.endId);
  console.log(`  ${(a?.ref ?? '?').padEnd(20)} -> ${(b?.ref ?? '?').padEnd(20)} ${String(reading.verses).padStart(3)} vv   ${file.slice(0, 34)}`);
}

writeFileSync(
  join(process.env.OUT ?? '.', 'lh-readings.json'),
  JSON.stringify(readings.map((r) => ({
    file: r.file,
    from: byId.get(r.reading.startId)?.ref,
    to: byId.get(r.reading.endId)?.ref,
    verses: r.reading.verses,
  })), null, 2),
);
