/**
 * P6.4 (B5) S1 — TVTMS build-time versification guard.
 *
 * TVTMS (STEPBible's "Translators Versification Traditions with Methodology
 * for Standardisation", CC BY 4.0, credit "STEP Bible" — www.STEPBible.org)
 * catalogues every locus where Bible versifications disagree, with
 * machine-checkable tests per tradition. This module uses it as an
 * INDEPENDENT VERSIFICATION WITNESS: at every locus TVTMS knows about, the
 * corpus's verse-ID shape must match a recognized English-tradition stanza
 * (or a reviewed, named exception below). A silent off-by-one in the corpus
 * import — the "connects concepts to the WRONG passage" failure class — is
 * exactly what this catches, and no other gate can see it.
 *
 * ZERO SHIPPED BYTES: nothing from TVTMS enters the artifact. The build runs
 * the check and prints the declared-null admission line ("zero-row guard
 * source: NO MEASURABLE EFFECT expected and accepted") — a declared
 * exception class, never a silent lean on the re-pin precedent.
 *
 * WHAT IS TAKEN vs EXCLUDED (covenant #1): only TVTMS's structural columns
 * (SourceType, SourceRef, StandardRef, Action, Tests) are ingested — the
 * note/prose columns are dropped at parse time. From the wider STEPBible-Data
 * repository NOTHING else is ingested: TIPNR is excluded outright because its
 * per-person descriptions are "created by Claude 3 AI" (AI-authored content
 * never reaches the artifact), TBCWG is excluded entirely, and TTESV (which
 * tags Crossway's copyrighted ESV) is never pinned. J56 asks Jesse to ratify
 * these exclusions and issue the per-source verdict.
 */

import { KJV_VERSES_PER_CHAPTER } from './versification/kjv.js';

/** TVTMS's USFM-style book codes → canonical book id (66-book canon only). */
const TVTMS_BOOKS: ReadonlyMap<string, number> = new Map([
  ['gen', 1], ['exo', 2], ['lev', 3], ['num', 4], ['deu', 5], ['jos', 6], ['jdg', 7], ['rut', 8],
  ['1sa', 9], ['2sa', 10], ['1ki', 11], ['2ki', 12], ['1ch', 13], ['2ch', 14], ['ezr', 15],
  ['neh', 16], ['est', 17], ['job', 18], ['psa', 19], ['pro', 20], ['ecc', 21], ['sng', 22],
  ['isa', 23], ['jer', 24], ['lam', 25], ['ezk', 26], ['dan', 27],
  ['hos', 28], ['jol', 29], ['amo', 30], ['oba', 31], ['jon', 32], ['mic', 33], ['nam', 34],
  ['hab', 35], ['zep', 36], ['hag', 37], ['zec', 38], ['mal', 39],
  ['mat', 40], ['mrk', 41], ['luk', 42], ['jhn', 43], ['act', 44],
  ['rom', 45], ['1co', 46], ['2co', 47], ['gal', 48], ['eph', 49], ['php', 50], ['col', 51],
  ['1th', 52], ['2th', 53], ['1ti', 54], ['2ti', 55], ['tit', 56], ['phm', 57],
  ['heb', 58], ['jas', 59], ['1pe', 60], ['2pe', 61], ['1jn', 62], ['2jn', 63], ['3jn', 64],
  ['jud', 65], ['rev', 66],
]);

/** One structural TVTMS row: the five non-prose columns, nothing else. */
export interface TvtmsRow {
  readonly sourceType: string;
  readonly sourceRef: string;
  readonly standardRef: string;
  readonly action: string;
  readonly tests: string;
}

/** One locus: a blank-line-delimited group of alternative tradition rows. */
export interface TvtmsLocus {
  readonly id: string;
  readonly rows: readonly TvtmsRow[];
}

export interface VersificationGuardReport {
  /** Loci with at least one English-tradition row. */
  readonly engLoci: number;
  readonly passed: number;
  /** Passed only via a REVIEWED_EXCEPTIONS entry, by exception locus id. */
  readonly passedViaException: readonly string[];
  /** Locus ids skipped, by reason. */
  readonly skipped: ReadonlyMap<string, readonly string[]>;
  /** Human-readable mismatch descriptions — non-empty means FAIL the build. */
  readonly mismatches: readonly string[];
}

/**
 * Reviewed exceptions: loci where the corpus legitimately does NOT follow the
 * English (KJV) tradition, resolved to the NAMED tradition it follows
 * instead. An exception never blanket-skips — the locus must still match the
 * named tradition's stanza exactly, so drift there stays as loud as
 * anywhere else. Adding an entry is a reviewed act: name the tradition,
 * cite the evidence, and let the PR record it.
 */
export const REVIEWED_EXCEPTIONS: ReadonlyMap<string, { readonly matchInstead: string; readonly reason: string }> =
  new Map([
    [
      'Rom.14:22',
      {
        matchInstead: 'Greek2',
        reason:
          'The WEB places the Romans doxology at 14:24-26 and ends chapter 16 at ' +
          'v.24 (16:25 prints empty, 16:26-27 absent) — the Majority Text order ' +
          'TVTMS labels Greek2, not the KJV placement at 16:25-27. Verified against ' +
          'the full pinned WEB corpus, 2026-08-22.',
      },
    ],
  ]);

/**
 * Parses the raw TVTMS file's expanded section into English-relevant loci.
 * Used by scripts/generateTvtmsDistillate.ts (against the sha-verified
 * download) — the committed distillate is what builds consume, so
 * `npm run verify` stays hermetic. Keeps, per locus with >= 1 Eng row:
 * every English-tradition row, plus the rows of any tradition named by a
 * reviewed exception for that locus. All prose columns are dropped here,
 * at parse time.
 */
export function parseTvtmsExpanded(contents: string): TvtmsLocus[] {
  const lines = contents.split('\n');
  const start = lines.findIndex((line) => line.startsWith('#DataStart(Expanded)'));
  const end = lines.findIndex((line) => line.startsWith('#DataEnd(Expanded)'));
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('versificationGuard: TVTMS expanded section markers not found');
  }
  const groups: TvtmsRow[][] = [];
  let current: TvtmsRow[] = [];
  for (const line of lines.slice(start + 1, end)) {
    const cells = line.split('\t').map((cell) => cell.trim());
    const isRow = cells.length >= 9 && cells[0] !== '' && !cells[0]!.startsWith("'==");
    if (!isRow) {
      if (current.length > 0) {
        groups.push(current);
        current = [];
      }
      continue;
    }
    current.push({
      sourceType: cells[0]!,
      sourceRef: cells[1] ?? '',
      standardRef: cells[2] ?? '',
      action: cells[3] ?? '',
      tests: cells[8] ?? '',
    });
  }
  if (current.length > 0) groups.push(current);

  const seen = new Map<string, number>();
  const loci: TvtmsLocus[] = [];
  for (const group of groups) {
    const engRows = group.filter((row) => row.sourceType.includes('Eng'));
    if (engRows.length === 0) continue;
    const base = engRows[0]!.sourceRef;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    const id = count === 1 ? base : `${base}#${count}`;
    const exception = REVIEWED_EXCEPTIONS.get(id);
    const rows = group.filter(
      (row) =>
        row.sourceType.includes('Eng') ||
        (exception !== undefined && row.sourceType === exception.matchInstead),
    );
    loci.push({ id, rows });
  }
  return loci;
}

const VERSE_RE = /^([1-4]?[A-Za-z]+)\.(\d+):(\d+)$/;
const PREDICATE_RE = /^(.+)=(Exist|NotExist|Last)$/;

type Predicate = boolean | 'skip';

function verseIdOf(reference: string): number | 'skip' {
  const match = VERSE_RE.exec(reference);
  // Subverse refs (Gen.5:31.2), letter chapters (Est.C:7), TextBeforeV1 and
  // similar shapes carry claims about text segmentation, not verse IDs —
  // not evaluable against a verse-ID set, so they are SKIPPED, never
  // guessed true or false.
  if (!match) return 'skip';
  const bookId = TVTMS_BOOKS.get(match[1]!.toLowerCase());
  // Apocrypha (Tob, Wis, Sir, 1Es, ...) are outside the 66-book canon.
  if (bookId === undefined) return 'skip';
  const chapter = Number(match[2]);
  const verse = Number(match[3]);
  if (chapter < 1 || chapter > 999 || verse < 1 || verse > 999) return 'skip';
  return bookId * 1_000_000 + chapter * 1_000 + verse;
}

/**
 * Runs the guard over the corpus's verse-ID set.
 *
 * mode 'full': every English locus is evaluated (the real witness — the
 * complete corpus is on hand, so every claim is checkable).
 * mode 'fixture': a locus is evaluated only when every chapter it references
 * is COMPLETE against KJV extents in the given verse set — the fixture bed
 * carries partial chapters, and a truncated chapter is indistinguishable
 * from a versification deviation without that reference point. Skips are
 * reported, never silent.
 */
export function runVersificationGuard(
  loci: readonly TvtmsLocus[],
  presentVerseIds: ReadonlySet<number>,
  mode: 'full' | 'fixture',
): VersificationGuardReport {
  // Last-verse lookup: highest present verse per (book, chapter).
  const chapterMax = new Map<number, number>();
  for (const verseId of presentVerseIds) {
    const chapterKey = Math.floor(verseId / 1000);
    const verse = verseId % 1000;
    if ((chapterMax.get(chapterKey) ?? 0) < verse) chapterMax.set(chapterKey, verse);
  }

  const evaluate = (predicate: string): Predicate => {
    const match = PREDICATE_RE.exec(predicate);
    // Comparisons (Gen.6:1<Gen.6:2 — relative verse length) and any other
    // shape are text claims, not verse-ID claims: skipped.
    if (!match) return 'skip';
    const verseId = verseIdOf(match[1]!.trim());
    if (verseId === 'skip') return 'skip';
    if (match[2] === 'Exist') return presentVerseIds.has(verseId);
    if (match[2] === 'NotExist') return !presentVerseIds.has(verseId);
    return (
      presentVerseIds.has(verseId) && chapterMax.get(Math.floor(verseId / 1000)) === verseId % 1000
    );
  };

  const chapterComplete = (chapterKey: number): boolean => {
    const bookId = Math.floor(chapterKey / 1000);
    const chapter = chapterKey % 1000;
    const extent = KJV_VERSES_PER_CHAPTER[bookId - 1]?.[chapter - 1];
    if (extent === undefined) return false;
    for (let verse = 1; verse <= extent; verse++) {
      if (!presentVerseIds.has(chapterKey * 1000 + verse)) return false;
    }
    return true;
  };

  let engLoci = 0;
  let passed = 0;
  const passedViaException: string[] = [];
  const skipped = new Map<string, string[]>();
  const mismatches: string[] = [];
  const skip = (reason: string, id: string): void => {
    const list = skipped.get(reason);
    if (list === undefined) skipped.set(reason, [id]);
    else list.push(id);
  };

  for (const locus of loci) {
    engLoci += 1;
    const rowPredicates = locus.rows.map((row) =>
      row.tests
        .split('&')
        .map((predicate) => predicate.trim())
        .filter((predicate) => predicate !== ''),
    );

    if (mode === 'fixture') {
      const chapters = new Set<number>();
      for (const predicates of rowPredicates) {
        for (const predicate of predicates) {
          const match = PREDICATE_RE.exec(predicate);
          if (!match) continue;
          const verseId = verseIdOf(match[1]!.trim());
          if (verseId !== 'skip') chapters.add(Math.floor(verseId / 1000));
        }
      }
      if (![...chapters].every(chapterComplete)) {
        skip('incomplete-chapter', locus.id);
        continue;
      }
    }

    const verdictFor = (wantEng: boolean, exceptionType: string | undefined): boolean | 'vacuous' => {
      let anyEvaluable = false;
      for (let index = 0; index < locus.rows.length; index++) {
        const row = locus.rows[index]!;
        const isEng = row.sourceType.includes('Eng');
        if (wantEng ? !isEng : row.sourceType !== exceptionType) continue;
        const results = rowPredicates[index]!.map(evaluate);
        const evaluable = results.filter((result) => result !== 'skip');
        // A row whose every predicate is skipped proves nothing; it must
        // never count as a pass.
        if (evaluable.length === 0) continue;
        anyEvaluable = true;
        if (evaluable.every((result) => result === true)) return true;
      }
      return anyEvaluable ? false : 'vacuous';
    };

    const engVerdict = verdictFor(true, undefined);
    if (engVerdict === 'vacuous') {
      skip('non-evaluable', locus.id);
      continue;
    }
    if (engVerdict === true) {
      passed += 1;
      continue;
    }
    const exception = REVIEWED_EXCEPTIONS.get(locus.id);
    if (exception !== undefined && verdictFor(false, exception.matchInstead) === true) {
      passed += 1;
      passedViaException.push(locus.id);
      continue;
    }
    const detail = locus.rows
      .filter((row) => row.sourceType.includes('Eng'))
      .map((row) => `${row.sourceType} ${row.sourceRef} :: ${row.tests}`)
      .join(' | ');
    mismatches.push(
      `locus ${locus.id}: corpus verse shape matches no English-tradition stanza` +
        `${exception === undefined ? '' : ` (nor the reviewed exception '${exception.matchInstead}')`}` +
        ` — ${detail}`,
    );
  }

  return { engLoci, passed, passedViaException, skipped, mismatches };
}

/** The declared-null admission line the plan mandates, printed by builds. */
export function declaredNullLine(report: VersificationGuardReport): string {
  const skippedTotal = [...report.skipped.values()].reduce((sum, ids) => sum + ids.length, 0);
  const via =
    report.passedViaException.length === 0
      ? ''
      : ` (${report.passedViaException.length} via reviewed exception: ${report.passedViaException.join(', ')})`;
  return (
    `versification guard (stepbible-tvtms): ${report.engLoci} English loci, ` +
    `${report.passed} matched${via}, ${skippedTotal} skipped as non-evaluable; ` +
    `zero-row guard source: NO MEASURABLE EFFECT expected and accepted`
  );
}
