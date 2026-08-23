/**
 * WEB re-pin delta tool: verse-level diff between the pinned payload and a
 * candidate snapshot (plan P2.1 / RH-3; process: docs/source-repins.md §2).
 *
 * "Typography-only is a claim the diff proves or disproves, never an
 * assumption." This script is what proves it. Given an old witness (the
 * committed `pipeline/fixtures/web-subset.json`, or a full VPL export of the
 * old revision if the archive search recovers one) and a candidate snapshot
 * (the errand's captured zip or its unpacked `engwebp_vpl.txt`), it reports
 * every verse that was added, removed, or changed, splits changes into
 * typography-only vs genuine revisions using the ONE tokenizer (CLAUDE.md #4
 * — the same `tokenStream` the pipeline and runtime index with, so
 * "typography-only" means precisely "no precomputed term profile can move"),
 * and assigns the re-pin's pre-declared outcome class. Limitation, stated
 * where the label is defined: "typography-only" is operationally TOKEN
 * IDENTITY, which is broader than typography — stopword swaps (he→she) and
 * inflection folds (obeys→obeyed) also tokenize identically. The report
 * prints both halves of every such change and its class-(a) line says to skim
 * them; the failure direction is conservative (anything the tokenizer cannot
 * prove identical is GENUINE, never the reverse). The classes:
 *
 *   (a) typography-only        -> proceed with the re-pin;
 *   (b) genuine revisions in   -> list goes to Jesse for review (J52/A5c)
 *       non-fixture verses        before the re-pin PR merges;
 *   (c) genuine revisions in   -> STOP. A finding for Jesse, never a
 *       fixture-asserted verses   fixture edit (source-repins.md §5).
 *
 * "Fixture-asserted" means named by a golden fixture in `eval/golden/` —
 * the refs in expectedTop / alsoAcceptable / mustNotRank / mustNotLead /
 * preferredOrder / referenceExpectations. A removed fixture verse is class
 * (c) too: an assertion whose verse vanished is not reviewable, it is broken.
 * Fixtures are collected regardless of status (retired included) — more
 * sensitive, never less.
 *
 * The report is deterministic (sorted by verse id, both halves of every
 * changed text printed) so it can be attached to the re-pin PR as evidence
 * BEFORE the manifest edit — it is that PR's "fixture". This script performs
 * NO network I/O and never edits a manifest.
 *
 * Usage:
 *   npx tsx scripts/webDelta.ts --old fixtures/web-subset.json \
 *     --new /path/to/engwebp_vpl-2026-08.zip [--out delta.md] [--check]
 *
 * `--old` / `--new` each accept a verse-array-subset JSON, a VPL .txt, or a
 * .zip containing one. When the old witness is a subset, comparison is
 * restricted to the witness's verses (a subset cannot measure adds) — and the
 * report then states which golden-fixture-asserted verses lie OUTSIDE the
 * witness, so an IDENTICAL/(a)/(b) verdict over a subset is never mistaken
 * for full-fixture-scope proof.
 * `--check` makes the exit code machine-readable: 0 identical, 1 any
 * difference (class a/b), 2 class (c). Without `--check` the exit code is
 * always 0 — the report is the product.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { tokenStream } from '@jestek-dev/scripture-engine/internal';

import { BOOKS, findBook } from '../src/books.js';
import { importVpl } from '../src/importers/vplImporter.js';
import { makeVerseId, parseVerseId } from '../src/verseId.js';
import { KJV_VERSES_PER_CHAPTER } from '../src/versification/kjv.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

const BOOK_NAME = new Map(BOOKS.map((book) => [book.id, book.name]));

/** The minimal shape the diff needs; both payload kinds normalize to it. */
export interface PayloadVerse {
  readonly verseId: number;
  readonly text: string;
}

export interface DeltaEntry {
  readonly verseId: number;
  readonly ref: string;
  readonly text: string;
}

export interface DeltaChange {
  readonly verseId: number;
  readonly ref: string;
  readonly oldText: string;
  readonly newText: string;
  /** True when the one tokenizer emits the identical token sequence. */
  readonly tokenIdentical: boolean;
}

export interface VerseDelta {
  /** True when comparison was restricted to the old witness's verse set. */
  readonly restricted: boolean;
  /** Verses present on both sides (the compared population). */
  readonly compared: number;
  readonly added: readonly DeltaEntry[];
  readonly removed: readonly DeltaEntry[];
  readonly typographyOnly: readonly DeltaChange[];
  readonly genuineRevisions: readonly DeltaChange[];
}

export function formatRef(verseId: number): string {
  const { bookId, chapter, verse } = parseVerseId(verseId);
  const name = BOOK_NAME.get(bookId);
  if (!name) throw new Error(`formatRef: no book ${bookId}`);
  return `${name} ${chapter}:${verse}`;
}

/**
 * Token-sequence identity under the one tokenizer. Positions are compared
 * too: a typography change that shifted word positions would move proximity
 * statistics even with the vocabulary unchanged, and calling that
 * "typography-only" would be a false pass.
 */
function tokensIdentical(oldText: string, newText: string): boolean {
  const serialize = (text: string): string =>
    tokenStream(text)
      .map((entry) => `${entry.position}:${entry.token}`)
      .join(' ');
  return serialize(oldText) === serialize(newText);
}

export function computeVerseDelta(
  oldVerses: readonly PayloadVerse[],
  newVerses: readonly PayloadVerse[],
  options: { restrictToOldWitness?: boolean } = {},
): VerseDelta {
  const restricted = options.restrictToOldWitness === true;
  const oldById = new Map(oldVerses.map((entry) => [entry.verseId, entry.text]));
  const newById = new Map(newVerses.map((entry) => [entry.verseId, entry.text]));
  if (oldById.size !== oldVerses.length || newById.size !== newVerses.length) {
    // importVpl already rejects duplicates; a duplicate here means a
    // hand-built payload double-counts a verse and every number below lies.
    throw new Error('computeVerseDelta: duplicate verse id in a payload');
  }

  const added: DeltaEntry[] = [];
  const removed: DeltaEntry[] = [];
  const typographyOnly: DeltaChange[] = [];
  const genuineRevisions: DeltaChange[] = [];
  let compared = 0;

  const ids = [...new Set([...oldById.keys(), ...newById.keys()])].sort((a, b) => a - b);
  for (const verseId of ids) {
    const oldText = oldById.get(verseId);
    const newText = newById.get(verseId);
    if (oldText === undefined) {
      // Out of a subset witness's sight there is no old text to compare, so
      // "added" would really mean "not in the witness" — out of scope.
      if (newText !== undefined && !restricted) {
        added.push({ verseId, ref: formatRef(verseId), text: newText });
      }
      continue;
    }
    if (newText === undefined) {
      // A removal is reportable under ANY witness: the witness carries the
      // verse, the candidate does not. Hiding shrinkage is never an option.
      removed.push({ verseId, ref: formatRef(verseId), text: oldText });
      continue;
    }
    compared += 1;
    if (oldText === newText) continue;
    const change: DeltaChange = {
      verseId,
      ref: formatRef(verseId),
      oldText,
      newText,
      tokenIdentical: tokensIdentical(oldText, newText),
    };
    (change.tokenIdentical ? typographyOnly : genuineRevisions).push(change);
  }

  return { restricted, compared, added, removed, typographyOnly, genuineRevisions };
}

// ---------------------------------------------------------------------------
// Golden fixture scope (what makes a revision class (c))
// ---------------------------------------------------------------------------

export interface FixtureScope {
  /** Exact verse ids named by golden fixtures. */
  readonly verses: ReadonlySet<number>;
  /** Whole chapters named by chapter-only refs, as "bookId:chapter". */
  readonly chapters: ReadonlySet<string>;
}

export function refInScope(verseId: number, scope: FixtureScope): boolean {
  if (scope.verses.has(verseId)) return true;
  const { bookId, chapter } = parseVerseId(verseId);
  return scope.chapters.has(`${bookId}:${chapter}`);
}

export interface ParsedHumanRef {
  readonly bookId: number;
  readonly chapter: number;
  /** Explicit verse list, or null for a chapter-only ref (whole chapter). */
  readonly verses: readonly number[] | null;
}

/** "John 15:4", "Matt 12:22-24" (one chapter), or chapter-only "Psalms 23". */
export function parseHumanRef(ref: string): ParsedHumanRef {
  const match = /^(.+?)\s+(\d+)(?::(\d+)(?:\s*-\s*(\d+))?)?$/.exec(ref.trim());
  const book = match ? findBook(match[1]!) : undefined;
  if (!match || !book) {
    throw new Error(`parseHumanRef: unparseable reference "${ref}"`);
  }
  const chapter = Number(match[2]);
  if (match[3] === undefined) return { bookId: book.id, chapter, verses: null };
  const first = Number(match[3]);
  const last = match[4] === undefined ? first : Number(match[4]);
  if (last < first) throw new Error(`parseHumanRef: backwards range "${ref}"`);
  const verses: number[] = [];
  for (let v = first; v <= last; v += 1) verses.push(v);
  return { bookId: book.id, chapter, verses };
}

/**
 * The golden-fixture fields that carry verse references. Written out rather
 * than inferred by shape-sniffing: a new ref-bearing field must be added
 * here deliberately, and the list is auditable against `eval/golden/`.
 */
const GOLDEN_REF_FIELDS: readonly { list: string; fields: readonly (string | null)[] }[] = [
  { list: 'expectedTop', fields: ['reference'] },
  { list: 'alsoAcceptable', fields: [null] }, // array of plain ref strings
  { list: 'mustNotRank', fields: ['reference'] },
  { list: 'mustNotLead', fields: ['ref', 'reference'] },
  { list: 'preferredOrder', fields: ['above', 'below'] },
  { list: 'referenceExpectations', fields: ['expectedPassage'] },
];

export interface GoldenScope {
  readonly scope: FixtureScope;
  readonly fileCount: number;
  readonly refCount: number;
}

export function collectGoldenScope(dir: string): GoldenScope {
  const verses = new Set<number>();
  const chapters = new Set<string>();
  let refCount = 0;

  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort();
  for (const name of files) {
    const fixture = JSON.parse(readFileSync(join(dir, name), 'utf8')) as Record<string, unknown>;
    for (const { list, fields } of GOLDEN_REF_FIELDS) {
      const rows = fixture[list];
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        for (const field of fields) {
          const value = field === null ? row : (row as Record<string, unknown>)[field];
          if (typeof value !== 'string') continue;
          let parsed: ParsedHumanRef;
          try {
            parsed = parseHumanRef(value);
          } catch (error) {
            // Loud, with the file named: a silently skipped ref is a fixture
            // verse the class-(c) stop can no longer see.
            throw new Error(
              `collectGoldenScope: ${name} ${list}${field ? `.${field}` : ''}: ` +
                `${error instanceof Error ? error.message : String(error)}`,
            );
          }
          refCount += 1;
          if (parsed.verses === null) {
            chapters.add(`${parsed.bookId}:${parsed.chapter}`);
          } else {
            for (const v of parsed.verses) verses.add(makeVerseId(parsed.bookId, parsed.chapter, v));
          }
        }
      }
    }
  }

  return { scope: { verses, chapters }, fileCount: files.length, refCount };
}

// ---------------------------------------------------------------------------
// Witness coverage of the golden scope
// ---------------------------------------------------------------------------

export interface PartialChapter {
  /** "bookId:chapter" key, as stored in FixtureScope.chapters. */
  readonly key: string;
  /** Human form, e.g. "Psalms 23". */
  readonly ref: string;
  /** Verses of the chapter the witness carries with text. */
  readonly witnessed: number;
  /** Verses the chapter has under KJV versification. */
  readonly expected: number;
}

export interface WitnessCoverage {
  /** Golden-scope exact verses the witness does not carry, sorted by id. */
  readonly unwitnessedVerses: readonly number[];
  /** Golden whole-chapter refs the witness carries only partially (or not at all). */
  readonly partialChapters: readonly PartialChapter[];
}

/**
 * Which golden-fixture-asserted verses a subset witness CANNOT compare.
 * Under a subset witness the delta verdict is proven only over the verses the
 * witness carries; a fixture-asserted verse outside the witness was never
 * compared, so an IDENTICAL/(a)/(b) verdict says nothing about it. The report
 * must name those refs, or the verdict invites the reading "no fixture-
 * asserted verse changed" — the same misreading shape the null-scope path
 * already guards against. Chapter-only refs are checked against KJV
 * versification (the repo's canonical verse-count table); both counts are
 * printed so a versification mismatch would be visible, never silent.
 */
export function computeWitnessCoverage(
  scope: FixtureScope,
  witnessIds: ReadonlySet<number>,
): WitnessCoverage {
  const unwitnessedVerses = [...scope.verses]
    .filter((verseId) => !witnessIds.has(verseId))
    .sort((a, b) => a - b);

  const witnessedPerChapter = new Map<string, number>();
  for (const verseId of witnessIds) {
    const { bookId, chapter } = parseVerseId(verseId);
    const key = `${bookId}:${chapter}`;
    if (scope.chapters.has(key)) {
      witnessedPerChapter.set(key, (witnessedPerChapter.get(key) ?? 0) + 1);
    }
  }
  const partialChapters: PartialChapter[] = [];
  for (const key of [...scope.chapters].sort()) {
    const [bookId, chapter] = key.split(':').map(Number) as [number, number];
    const expected = KJV_VERSES_PER_CHAPTER[bookId - 1]?.[chapter - 1];
    if (expected === undefined) {
      throw new Error(`computeWitnessCoverage: no KJV verse count for ${key}`);
    }
    const witnessed = witnessedPerChapter.get(key) ?? 0;
    if (witnessed < expected) {
      const name = BOOK_NAME.get(bookId);
      if (!name) throw new Error(`computeWitnessCoverage: no book ${bookId}`);
      partialChapters.push({ key, ref: `${name} ${chapter}`, witnessed, expected });
    }
  }

  return { unwitnessedVerses, partialChapters };
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

export type OutcomeClass =
  | 'identical'
  | 'a-typography-only'
  | 'b-genuine-outside-fixtures'
  | 'c-genuine-inside-fixtures';

export interface Classification {
  readonly outcome: OutcomeClass;
  /** The genuine revisions and removals inside fixture scope (the class-(c) evidence). */
  readonly fixtureHits: readonly (DeltaChange | DeltaEntry)[];
}

/**
 * Assigns the re-pin's outcome class. `scope === null` means no golden scope
 * was supplied; genuine changes then cap at class (b), and the REPORT states
 * the scope was absent so a (b) without fixture knowledge is never mistaken
 * for a proven not-(c).
 */
export function classifyDelta(delta: VerseDelta, scope: FixtureScope | null): Classification {
  const genuine = [...delta.genuineRevisions, ...delta.removed, ...delta.added];
  if (genuine.length === 0 && delta.typographyOnly.length === 0) {
    return { outcome: 'identical', fixtureHits: [] };
  }
  // Adds cannot revise an existing fixture verse; removals and revisions can.
  const fixtureHits =
    scope === null
      ? []
      : [...delta.genuineRevisions, ...delta.removed].filter((entry) =>
          refInScope(entry.verseId, scope),
        );
  if (fixtureHits.length > 0) return { outcome: 'c-genuine-inside-fixtures', fixtureHits };
  if (genuine.length > 0) return { outcome: 'b-genuine-outside-fixtures', fixtureHits: [] };
  return { outcome: 'a-typography-only', fixtureHits: [] };
}

// ---------------------------------------------------------------------------
// Payload loading
// ---------------------------------------------------------------------------

export interface LoadedPayload {
  readonly kind: 'vpl' | 'verse-array-subset' | 'zip';
  readonly verses: readonly PayloadVerse[];
  readonly sha256: string;
  readonly path: string;
  /**
   * References the payload carries with NO text — the WEB's footnoted
   * verses (Luke 17:36 etc.). The VPL importer drops them as omittedVerses;
   * web-subset.json carries them with empty text. Excluded from the diff on
   * BOTH sides (comparing "" against absence is a format artifact, not a
   * removal) but counted, so the exclusion is visible in the report.
   */
  readonly textlessReferences: number;
}

interface VerseArraySubsetFile {
  readonly $schema?: string;
  readonly verses: readonly { book: number; chapter: number; verse: number; text: string }[];
}

export function loadPayload(path: string): LoadedPayload {
  const bytes = readFileSync(path);
  const sha256 = createHash('sha256').update(bytes).digest('hex');

  if (path.endsWith('.json')) {
    const parsed = JSON.parse(bytes.toString('utf8')) as VerseArraySubsetFile;
    if (!Array.isArray(parsed.verses)) {
      throw new Error(`loadPayload: ${path} is JSON but has no verses array`);
    }
    const rows = parsed.verses;
    const verses = rows
      .filter((row) => row.text !== '')
      .map((row) => ({ verseId: makeVerseId(row.book, row.chapter, row.verse), text: row.text }));
    return {
      kind: 'verse-array-subset',
      verses,
      sha256,
      path,
      textlessReferences: rows.length - verses.length,
    };
  }

  if (path.endsWith('.zip')) {
    // Same unzip the fetch/drift scripts use; extracted to a throwaway dir.
    const scratch = mkdtempSync(join(tmpdir(), 'web-delta-zip-'));
    try {
      execFileSync('unzip', ['-o', '-q', path, '-d', scratch]);
      const candidates = readdirSync(scratch).filter((name) => name.endsWith('_vpl.txt'));
      const vpl = candidates.includes('engwebp_vpl.txt') ? 'engwebp_vpl.txt' : candidates[0];
      if (!vpl) {
        throw new Error(`loadPayload: ${path} contains no *_vpl.txt (found: ${readdirSync(scratch).join(', ')})`);
      }
      const imported = importVpl(readFileSync(join(scratch, vpl), 'utf8'));
      return {
        kind: 'zip',
        verses: imported.verses.map(({ verseId, text }) => ({ verseId, text })),
        sha256,
        path,
        textlessReferences: imported.omittedVerses.length,
      };
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  }

  const imported = importVpl(bytes.toString('utf8'));
  return {
    kind: 'vpl',
    verses: imported.verses.map(({ verseId, text }) => ({ verseId, text })),
    sha256,
    path,
    textlessReferences: imported.omittedVerses.length,
  };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const OUTCOME_LINES: Readonly<Record<OutcomeClass, string>> = {
  identical: 'IDENTICAL — the candidate carries the witness\'s exact verse text.',
  'a-typography-only':
    '(a) typography-only — every changed verse tokenizes identically under the one ' +
    'tokenizer. The re-pin may proceed (docs/source-repins.md §2). Caveat: token ' +
    'identity is broader than typography — stopword swaps and inflection folds ' +
    '(e.g. obeys→obeyed) also tokenize identically. Both halves of every such ' +
    'change are listed below; skim the pairs before proceeding.',
  'b-genuine-outside-fixtures':
    '(b) genuine revisions outside fixture-asserted verses — the list below goes to ' +
    'Jesse for review (J52/A5c) BEFORE the re-pin PR merges.',
  'c-genuine-inside-fixtures':
    '(c) genuine revisions inside fixture-asserted verses — STOP. This is a finding ' +
    'for Jesse, never a fixture edit (docs/source-repins.md §5).',
};

export interface ReportContext {
  readonly oldLabel: string;
  readonly newLabel: string;
  /** Extra scope line (e.g. golden ref counts), or null when scope was absent. */
  readonly scopeNote: string | null;
  /**
   * Under a subset witness with a golden scope: which fixture-asserted verses
   * the witness cannot compare. Omitted/null when the comparison is
   * unrestricted (full payloads compare everything) or no scope was supplied
   * (the no-golden line already warns).
   */
  readonly witnessCoverage?: WitnessCoverage | null;
}

export function renderReport(
  delta: VerseDelta,
  classification: Classification,
  context: ReportContext,
): string {
  const lines: string[] = [];
  const changed = delta.typographyOnly.length + delta.genuineRevisions.length;
  lines.push('# WEB verse-level delta report');
  lines.push('');
  lines.push(`- old witness: ${context.oldLabel}`);
  lines.push(`- candidate: ${context.newLabel}`);
  lines.push(
    delta.restricted
      ? '- comparison scope: the old witness\'s verse set (subset witness — verses the ' +
          'witness does not carry are OUT OF SCOPE; adds are not measurable, removals still are)'
      : '- comparison scope: full payloads on both sides',
  );
  lines.push(
    context.scopeNote ??
      '- golden fixture scope: no golden fixture scope supplied — class (c) CANNOT be ' +
        'ruled out by this report; re-run with --golden before treating (b) as final',
  );
  const coverage = context.witnessCoverage;
  if (coverage) {
    const uncovered = coverage.unwitnessedVerses;
    lines.push(
      uncovered.length === 0
        ? '- fixture-scope verses NOT carried by this witness: none — every golden-' +
            'fixture-asserted exact verse was compared'
        : `- fixture-scope verses NOT carried by this witness: ${uncovered.length} — ` +
            `${uncovered.map((verseId) => formatRef(verseId)).join('; ')}. ` +
            'These golden-fixture-asserted verses were NEVER COMPARED: the verdict ' +
            'below is proven only over the witnessed scope and says nothing about ' +
            'them — an IDENTICAL/(a)/(b) verdict here is NOT full-fixture-scope proof.',
    );
    if (coverage.partialChapters.length > 0) {
      lines.push(
        '- fixture-scope chapters only PARTIALLY carried by this witness: ' +
          coverage.partialChapters
            .map((entry) => `${entry.ref} (${entry.witnessed}/${entry.expected} verses)`)
            .join('; '),
      );
    }
  }
  lines.push('');
  lines.push('## Verdict');
  lines.push('');
  lines.push(`- outcome class: ${OUTCOME_LINES[classification.outcome]}`);
  lines.push(
    `- verses compared: ${delta.compared}; changed: ${changed} ` +
      `(typography-only: ${delta.typographyOnly.length}, genuine: ${delta.genuineRevisions.length}); ` +
      `added: ${delta.added.length}; removed: ${delta.removed.length}`,
  );
  if (classification.fixtureHits.length > 0) {
    lines.push(
      `- fixture-asserted verses hit: ${classification.fixtureHits.map((hit) => hit.ref).join('; ')}`,
    );
  }

  const changeSection = (title: string, changes: readonly DeltaChange[]): void => {
    lines.push('', `## ${title} (${changes.length})`, '');
    if (changes.length === 0) {
      lines.push('(none)');
      return;
    }
    for (const change of changes) {
      lines.push(`- ${change.ref}`);
      lines.push(`  - old: ${change.oldText}`);
      lines.push(`  - new: ${change.newText}`);
    }
  };
  const entrySection = (title: string, entries: readonly DeltaEntry[]): void => {
    lines.push('', `## ${title} (${entries.length})`, '');
    if (entries.length === 0) {
      lines.push('(none)');
      return;
    }
    for (const entry of entries) lines.push(`- ${entry.ref}: ${entry.text}`);
  };

  changeSection('Genuine revisions', delta.genuineRevisions);
  changeSection('Typography-only changes', delta.typographyOnly);
  entrySection('Added verses', delta.added);
  entrySection('Removed verses', delta.removed);
  lines.push('');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export interface RunOptions {
  readonly oldPath: string;
  readonly newPath: string;
  /** Golden fixture dir; null = deliberately none; undefined = repo default. */
  readonly goldenDir?: string | null;
  readonly check?: boolean;
}

export interface RunResult {
  readonly report: string;
  readonly exitCode: number;
  readonly delta: VerseDelta;
  readonly classification: Classification;
  /** Non-null exactly when the report carries the coverage lines (subset witness + golden scope). */
  readonly witnessCoverage: WitnessCoverage | null;
}

export function runWebDelta(options: RunOptions): RunResult {
  const oldPayload = loadPayload(options.oldPath);
  const newPayload = loadPayload(options.newPath);

  const goldenDir =
    options.goldenDir === undefined ? join(ROOT, '..', 'eval', 'golden') : options.goldenDir;
  const golden = goldenDir === null ? null : collectGoldenScope(goldenDir);

  const restricted = oldPayload.kind === 'verse-array-subset';
  const delta = computeVerseDelta(oldPayload.verses, newPayload.verses, {
    restrictToOldWitness: restricted,
  });
  const classification = classifyDelta(delta, golden?.scope ?? null);
  const witnessCoverage =
    restricted && golden
      ? computeWitnessCoverage(
          golden.scope,
          new Set(oldPayload.verses.map((entry) => entry.verseId)),
        )
      : null;

  const label = (payload: LoadedPayload): string =>
    `\`${basename(payload.path)}\` — ${payload.kind}, ${payload.verses.length} verses` +
    (payload.textlessReferences > 0
      ? ` (+${payload.textlessReferences} textless reference${payload.textlessReferences === 1 ? '' : 's'} excluded, matching the VPL importer's omitted-verse rule)`
      : '') +
    `, sha256 \`${payload.sha256}\``;
  const report = renderReport(delta, classification, {
    oldLabel: label(oldPayload),
    newLabel: label(newPayload),
    scopeNote: golden
      ? `- golden fixture scope: ${golden.refCount} refs across ${golden.fileCount} fixtures ` +
        `(${goldenDir}) — ${golden.scope.verses.size} exact verses + ${golden.scope.chapters.size} whole chapters`
      : null,
    witnessCoverage,
  });

  let exitCode = 0;
  if (options.check === true && classification.outcome !== 'identical') {
    exitCode = classification.outcome === 'c-genuine-inside-fixtures' ? 2 : 1;
  }
  return { report, exitCode, delta, classification, witnessCoverage };
}

function parseArgs(argv: readonly string[]): RunOptions & { out?: string } {
  const get = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const oldPath = get('--old');
  const newPath = get('--new');
  if (!oldPath || !newPath) {
    throw new Error(
      'Usage: npx tsx scripts/webDelta.ts --old <witness> --new <candidate> ' +
        '[--golden <dir>|--no-golden] [--out <file>] [--check]',
    );
  }
  return {
    oldPath: resolve(oldPath),
    newPath: resolve(newPath),
    goldenDir: argv.includes('--no-golden') ? null : get('--golden') ?? undefined,
    check: argv.includes('--check'),
    out: get('--out'),
  };
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const result = runWebDelta(options);
  if (options.out) {
    writeFileSync(options.out, result.report);
    process.stdout.write(`report written to ${options.out}\n`);
    process.stdout.write(`outcome: ${result.classification.outcome}\n`);
  } else {
    process.stdout.write(result.report);
  }
  process.exitCode = result.exitCode;
}

// Only run when invoked as a script; tests import the pure functions and
// importing must never read the filesystem or exit.
if (process.argv[1] && process.argv[1].endsWith('webDelta.ts')) {
  main();
}
