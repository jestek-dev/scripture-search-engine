/**
 * The WEB re-pin delta tool's verdicts (plan P2.1 / RH-3, prep item W-D).
 *
 * The tool exists so that "typography-only is a claim the diff proves or
 * disproves, never an assumption" (docs/source-repins.md §2). Each outcome
 * class authorizes a different human action — (a) typography-only proceeds,
 * (b) genuine revisions go to Jesse's review list, (c) revisions inside
 * fixture-asserted verses are a full stop — so a wrong classification does
 * not just mislabel, it misdirects the re-pin. The expensive wrong verdicts
 * are tested by name: a genuine word change reported as typography (would
 * skip Jesse's review), a fixture-verse revision reported as class (b)
 * (would turn a STOP into a checklist item), and an add/remove silently
 * dropped under a subset witness (would hide corpus shrinkage).
 *
 * Everything runs on synthetic payloads written to a temp dir; no network,
 * no committed fixtures touched.
 */

import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import {
  classifyDelta,
  collectGoldenScope,
  computeVerseDelta,
  formatRef,
  parseHumanRef,
  refInScope,
  renderReport,
  runWebDelta,
  type FixtureScope,
  type PayloadVerse,
} from '../scripts/webDelta.js';
import { makeVerseId } from '../src/verseId.js';

const TMP = mkdtempSync(join(tmpdir(), 'web-delta-test-'));
afterAll(() => rmSync(TMP, { recursive: true, force: true }));

function verse(bookId: number, chapter: number, v: number, text: string): PayloadVerse {
  return { verseId: makeVerseId(bookId, chapter, v), text };
}

// Genesis 1:1-2, Psalm 23:1, John 15:4 — realistic shapes, synthetic content.
const OLD: readonly PayloadVerse[] = [
  verse(1, 1, 1, 'In the beginning, God created the heavens and the earth.'),
  verse(1, 1, 2, 'The earth was formless and empty. God’s Spirit was hovering.'),
  verse(19, 23, 1, 'Yahweh is my shepherd: I shall lack nothing.'),
  verse(43, 15, 4, 'Remain in me, and I in you.'),
];

describe('computeVerseDelta', () => {
  it('reports adds, removes, and changes with correct references', () => {
    const NEW: readonly PayloadVerse[] = [
      OLD[0]!, // identical
      verse(1, 1, 2, 'The earth was formless and empty. God’s Spirit was moving.'), // changed
      verse(43, 15, 4, 'Remain in me, and I in you.'), // identical
      verse(43, 15, 5, 'I am the vine. You are the branches.'), // added
      // Psalm 23:1 removed
    ];
    const delta = computeVerseDelta(OLD, NEW);
    expect(delta.added.map((entry) => entry.ref)).toEqual(['John 15:5']);
    expect(delta.removed.map((entry) => entry.ref)).toEqual(['Psalms 23:1']);
    expect(delta.genuineRevisions.map((change) => change.ref)).toEqual(['Genesis 1:2']);
    expect(delta.typographyOnly).toEqual([]);
    // Both halves of every changed comparison are carried, per the repo's
    // both-values-printed convention.
    expect(delta.genuineRevisions[0]!.oldText).toContain('hovering');
    expect(delta.genuineRevisions[0]!.newText).toContain('moving');
    expect(delta.compared).toBe(3); // verses present on both sides
  });

  it('classifies curly-vs-straight punctuation as typography-only (token streams identical)', () => {
    const NEW = [
      OLD[0]!,
      // Curly apostrophe -> straight, colon -> semicolon: the one tokenizer
      // discards both, so the token stream is unchanged.
      verse(1, 1, 2, "The earth was formless and empty. God's Spirit was hovering."),
      verse(19, 23, 1, 'Yahweh is my shepherd; I shall lack nothing.'),
      OLD[3]!,
    ];
    const delta = computeVerseDelta(OLD, NEW);
    expect(delta.typographyOnly.map((change) => change.ref)).toEqual([
      'Genesis 1:2',
      'Psalms 23:1',
    ]);
    expect(delta.genuineRevisions).toEqual([]);
    expect(delta.added).toEqual([]);
    expect(delta.removed).toEqual([]);
  });

  it('never lets a genuine word change pass as typography', () => {
    // The historical example from web.json's provenance note: 'put forth
    // grass' -> 'yield grass'. Reporting this as typography would skip the
    // human review that is the whole point of the delta step.
    const old = [verse(1, 1, 11, 'Let the earth put forth grass.')];
    const next = [verse(1, 1, 11, 'Let the earth yield grass.')];
    const delta = computeVerseDelta(old, next);
    expect(delta.genuineRevisions).toHaveLength(1);
    expect(delta.typographyOnly).toEqual([]);
  });

  it('restricts to the old witness when asked: out-of-witness verses are out of scope, not adds', () => {
    const NEW = [
      ...OLD,
      verse(18, 16, 2, 'Miserable comforters are you all!'), // outside the witness
    ];
    const delta = computeVerseDelta(OLD, NEW, { restrictToOldWitness: true });
    expect(delta.restricted).toBe(true);
    expect(delta.added).toEqual([]);
    expect(delta.removed).toEqual([]);
    expect(delta.compared).toBe(OLD.length);
  });

  it('still reports removals under a subset witness — corpus shrinkage is never hidden', () => {
    const NEW = OLD.slice(0, 3); // John 15:4 gone
    const delta = computeVerseDelta(OLD, NEW, { restrictToOldWitness: true });
    expect(delta.removed.map((entry) => entry.ref)).toEqual(['John 15:4']);
  });
});

describe('reference parsing and fixture scope', () => {
  it('parses single verses, ranges, and chapter-only refs', () => {
    expect(parseHumanRef('John 15:4')).toEqual({ bookId: 43, chapter: 15, verses: [4] });
    expect(parseHumanRef('Matt 12:22-24')).toEqual({ bookId: 40, chapter: 12, verses: [22, 23, 24] });
    expect(parseHumanRef('1 Corinthians 13')).toEqual({ bookId: 46, chapter: 13, verses: null });
  });

  it('throws loudly on an unparseable ref instead of skipping it', () => {
    expect(() => parseHumanRef('not a reference')).toThrow(/not a reference/);
    expect(() => parseHumanRef('Opinions 3:16')).toThrow(/Opinions/);
  });

  it('chapter-only refs cover every verse of that chapter', () => {
    const scope: FixtureScope = {
      verses: new Set([makeVerseId(43, 15, 4)]),
      chapters: new Set(['19:23']),
    };
    expect(refInScope(makeVerseId(43, 15, 4), scope)).toBe(true);
    expect(refInScope(makeVerseId(43, 15, 5), scope)).toBe(false);
    expect(refInScope(makeVerseId(19, 23, 1), scope)).toBe(true);
    expect(refInScope(makeVerseId(19, 23, 6), scope)).toBe(true);
    expect(refInScope(makeVerseId(19, 24, 1), scope)).toBe(false);
  });

  it('collectGoldenScope reads every ref-bearing golden field shape', () => {
    const dir = join(TMP, 'golden');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'synthetic.json'),
      JSON.stringify({
        id: 'synthetic',
        query: 'anything',
        expectedTop: [{ reference: 'John 15:4' }],
        alsoAcceptable: ['John 15:5', 'Genesis 1:1'],
        mustNotRank: [{ reference: 'Genesis 5:1' }],
        mustNotLead: [{ ref: 'Job 16:2' }, { reference: 'Ecclesiastes 1:9' }],
        preferredOrder: [{ above: 'Psalms 23:1', below: 'Psalms 23:2' }],
        referenceExpectations: [{ query: 'psalm 23', expectedPassage: 'Psalms 23' }],
      }),
    );
    const collected = collectGoldenScope(dir);
    expect(collected.fileCount).toBe(1);
    const { scope } = collected;
    for (const [bookId, chapter, v] of [
      [43, 15, 4],
      [43, 15, 5],
      [1, 1, 1],
      [1, 5, 1],
      [18, 16, 2],
      [21, 1, 9],
      [19, 23, 1],
      [19, 23, 2],
    ] as const) {
      expect(refInScope(makeVerseId(bookId, chapter, v), scope)).toBe(true);
    }
    expect(scope.chapters.has('19:23')).toBe(true); // the chapter-only expectedPassage
    expect(refInScope(makeVerseId(40, 5, 3), scope)).toBe(false);
  });

  it('collectGoldenScope names the file and value when a golden ref does not parse', () => {
    const dir = join(TMP, 'golden-bad');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'broken.json'),
      JSON.stringify({ id: 'broken', expectedTop: [{ reference: 'Nonsense 99' }] }),
    );
    expect(() => collectGoldenScope(dir)).toThrow(/broken\.json.*Nonsense 99/s);
  });
});

describe('classifyDelta', () => {
  const scope: FixtureScope = { verses: new Set([makeVerseId(43, 15, 4)]), chapters: new Set() };

  it('identical payloads classify as identical', () => {
    const delta = computeVerseDelta(OLD, OLD);
    expect(classifyDelta(delta, scope).outcome).toBe('identical');
  });

  it('typography-only differences classify as class (a) even inside fixture verses', () => {
    const NEW = OLD.map((entry) =>
      entry.verseId === makeVerseId(43, 15, 4)
        ? { ...entry, text: 'Remain in me; and I in you.' }
        : entry,
    );
    const verdict = classifyDelta(computeVerseDelta(OLD, NEW), scope);
    expect(verdict.outcome).toBe('a-typography-only');
    expect(verdict.fixtureHits).toEqual([]);
  });

  it('genuine revisions outside fixture verses classify as class (b)', () => {
    const NEW = OLD.map((entry) =>
      entry.verseId === makeVerseId(19, 23, 1)
        ? { ...entry, text: 'Yahweh is my shepherd: I shall want nothing.' }
        : entry,
    );
    const verdict = classifyDelta(computeVerseDelta(OLD, NEW), scope);
    expect(verdict.outcome).toBe('b-genuine-outside-fixtures');
    expect(verdict.fixtureHits).toEqual([]);
  });

  it('a genuine revision inside a fixture verse is class (c), the STOP', () => {
    const NEW = OLD.map((entry) =>
      entry.verseId === makeVerseId(43, 15, 4)
        ? { ...entry, text: 'Abide in me, and I in you.' }
        : entry,
    );
    const verdict = classifyDelta(computeVerseDelta(OLD, NEW), scope);
    expect(verdict.outcome).toBe('c-genuine-inside-fixtures');
    expect(verdict.fixtureHits.map((hit) => hit.ref)).toEqual(['John 15:4']);
  });

  it('a REMOVED fixture verse is also class (c)', () => {
    const NEW = OLD.filter((entry) => entry.verseId !== makeVerseId(43, 15, 4));
    const verdict = classifyDelta(computeVerseDelta(OLD, NEW), scope);
    expect(verdict.outcome).toBe('c-genuine-inside-fixtures');
    expect(verdict.fixtureHits.map((hit) => hit.ref)).toEqual(['John 15:4']);
  });

  it('with no golden scope supplied, genuine changes cap at class (b) and the report must say scope was absent', () => {
    const NEW = OLD.map((entry) =>
      entry.verseId === makeVerseId(43, 15, 4)
        ? { ...entry, text: 'Abide in me, and I in you.' }
        : entry,
    );
    const delta = computeVerseDelta(OLD, NEW);
    expect(classifyDelta(delta, null).outcome).toBe('b-genuine-outside-fixtures');
    expect(renderReport(delta, classifyDelta(delta, null), { oldLabel: 'x', newLabel: 'y', scopeNote: null })).toContain(
      'no golden fixture scope',
    );
  });
});

describe('runWebDelta (file-level CLI behavior)', () => {
  const goldenDir = join(TMP, 'golden-cli');
  mkdirSync(goldenDir, { recursive: true });
  writeFileSync(
    join(goldenDir, 'fixture.json'),
    JSON.stringify({ id: 'fixture', expectedTop: [{ reference: 'John 15:4' }] }),
  );

  const OLD_VPL = [
    'GEN 1:1 In the beginning, God created the heavens and the earth.',
    'PSA 23:1 Yahweh is my shepherd: I shall lack nothing.',
    'JOH 15:4 Remain in me, and I in you.',
    '',
  ].join('\n');

  function write(name: string, contents: string): string {
    const path = join(TMP, name);
    writeFileSync(path, contents);
    return path;
  }

  it('exits 0 on identical payloads, with or without --check', () => {
    const oldPath = write('old-a.txt', OLD_VPL);
    const newPath = write('new-a.txt', OLD_VPL);
    expect(runWebDelta({ oldPath, newPath, goldenDir, check: true }).exitCode).toBe(0);
    expect(runWebDelta({ oldPath, newPath, goldenDir, check: false }).exitCode).toBe(0);
  });

  it('exits nonzero on differences only when --check is set, and the report carries both texts', () => {
    const oldPath = write('old-b.txt', OLD_VPL);
    const newPath = write(
      'new-b.txt',
      OLD_VPL.replace('shepherd: I', 'shepherd; I'), // typography-only
    );
    const unchecked = runWebDelta({ oldPath, newPath, goldenDir, check: false });
    expect(unchecked.exitCode).toBe(0);
    const checked = runWebDelta({ oldPath, newPath, goldenDir, check: true });
    expect(checked.exitCode).toBe(1);
    expect(checked.report).toContain('shepherd: I');
    expect(checked.report).toContain('shepherd; I');
    expect(checked.report).toContain('(a) typography-only');
  });

  it('exits 2 under --check on a class (c) fixture-verse revision', () => {
    const oldPath = write('old-c.txt', OLD_VPL);
    const newPath = write('new-c.txt', OLD_VPL.replace('Remain in me', 'Abide in me'));
    const result = runWebDelta({ oldPath, newPath, goldenDir, check: true });
    expect(result.exitCode).toBe(2);
    expect(result.report).toContain('(c)');
    expect(result.report).toContain('John 15:4');
  });

  it('accepts a verse-array-subset JSON witness and restricts scope to it', () => {
    const subset = {
      $schema: 'verse-array-subset/1',
      generatedFrom: { translation: 'WEB', sourceSha256: 'f'.repeat(64), note: 'synthetic' },
      selection: [],
      verses: [
        { book_name: 'John', book: 43, chapter: 15, verse: 4, text: 'Remain in me, and I in you.' },
      ],
    };
    const oldPath = write('old-subset.json', JSON.stringify(subset));
    // Candidate carries an extra verse the witness does not: out of scope.
    const newPath = write('new-subset.txt', OLD_VPL);
    const result = runWebDelta({ oldPath, newPath, goldenDir, check: true });
    expect(result.exitCode).toBe(0);
    expect(result.report).toContain('subset witness');
    expect(result.delta.added).toEqual([]);
  });

  it('treats a textless witness reference like the VPL importer does: excluded, counted, never a removal', () => {
    // The WEB relegates five verses to footnotes (Luke 17:36 among them);
    // the VPL importer drops them as omittedVerses while web-subset.json
    // carries them with empty text. Reporting that mismatch as a REMOVED
    // verse would put a false class-(b) finding in front of Jesse on every
    // run against the committed subset.
    const subset = {
      $schema: 'verse-array-subset/1',
      generatedFrom: { translation: 'WEB', sourceSha256: 'f'.repeat(64), note: 'synthetic' },
      selection: [],
      verses: [
        { book_name: 'John', book: 43, chapter: 15, verse: 4, text: 'Remain in me, and I in you.' },
        { book_name: 'Luke', book: 42, chapter: 17, verse: 36, text: '' },
      ],
    };
    const oldPath = write('old-textless.json', JSON.stringify(subset));
    const newPath = write('new-textless.txt', OLD_VPL);
    const result = runWebDelta({ oldPath, newPath, goldenDir, check: true });
    expect(result.exitCode).toBe(0);
    expect(result.delta.removed).toEqual([]);
    expect(result.report).toContain('1 textless reference');
  });

  it('under a subset witness the report names every fixture-asserted verse the witness does not carry', () => {
    // The dangerous misreading this pins against: a subset witness compares
    // only what it carries, so an IDENTICAL verdict printed under a "golden
    // fixture scope: N refs" line invites "no fixture-asserted verse
    // changed" — when fixture-asserted verses outside the witness were never
    // compared at all. The report must name them, right next to the verdict.
    const dir = join(TMP, 'golden-coverage');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'fixture.json'),
      JSON.stringify({
        id: 'fixture',
        expectedTop: [{ reference: 'John 15:4' }],
        alsoAcceptable: ['Genesis 1:1', 'Job 16:2'], // neither is in the witness
      }),
    );
    const subset = {
      $schema: 'verse-array-subset/1',
      generatedFrom: { translation: 'WEB', sourceSha256: 'f'.repeat(64), note: 'synthetic' },
      selection: [],
      verses: [
        { book_name: 'John', book: 43, chapter: 15, verse: 4, text: 'Remain in me, and I in you.' },
      ],
    };
    const oldPath = write('old-coverage.json', JSON.stringify(subset));
    const newPath = write('new-coverage.txt', 'JOH 15:4 Remain in me, and I in you.\n');
    const result = runWebDelta({ oldPath, newPath, goldenDir: dir, check: true });
    // The verdict is IDENTICAL over the witnessed scope...
    expect(result.exitCode).toBe(0);
    expect(result.classification.outcome).toBe('identical');
    // ...and the report says exactly which fixture-asserted verses that
    // verdict does NOT cover, by name, with the never-compared warning.
    expect(result.report).toContain('fixture-scope verses NOT carried by this witness: 2');
    expect(result.report).toContain('Genesis 1:1');
    expect(result.report).toContain('Job 16:2');
    expect(result.report).toContain('NEVER COMPARED');
    expect(result.report).toContain('NOT full-fixture-scope proof');
    expect(result.witnessCoverage?.unwitnessedVerses.map((id) => formatRef(id))).toEqual([
      'Genesis 1:1',
      'Job 16:2',
    ]);
  });

  it('flags a golden whole-chapter ref the subset witness carries only partially', () => {
    const dir = join(TMP, 'golden-coverage-chapter');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'fixture.json'),
      JSON.stringify({
        id: 'fixture',
        referenceExpectations: [{ query: 'psalm 23', expectedPassage: 'Psalms 23' }],
      }),
    );
    const subset = {
      $schema: 'verse-array-subset/1',
      generatedFrom: { translation: 'WEB', sourceSha256: 'f'.repeat(64), note: 'synthetic' },
      selection: [],
      verses: [
        // Only 1 of Psalm 23's 6 verses: the chapter-scope assertion is
        // witnessed at one-sixth strength and the report must say so.
        { book_name: 'Psalms', book: 19, chapter: 23, verse: 1, text: 'Yahweh is my shepherd.' },
      ],
    };
    const oldPath = write('old-coverage-ch.json', JSON.stringify(subset));
    const newPath = write('new-coverage-ch.txt', 'PSA 23:1 Yahweh is my shepherd.\n');
    const result = runWebDelta({ oldPath, newPath, goldenDir: dir, check: true });
    expect(result.report).toContain('PARTIALLY carried');
    expect(result.report).toContain('Psalms 23 (1/6 verses)');
    expect(result.witnessCoverage?.partialChapters).toEqual([
      { key: '19:23', ref: 'Psalms 23', witnessed: 1, expected: 6 },
    ]);
  });

  it('prints no witness-coverage lines for a full-payload comparison', () => {
    // Full payloads compare everything; a coverage disclaimer there would be
    // noise that trains readers to skip the real one.
    const oldPath = write('old-full.txt', OLD_VPL);
    const newPath = write('new-full.txt', OLD_VPL);
    const result = runWebDelta({ oldPath, newPath, goldenDir, check: false });
    expect(result.witnessCoverage).toBeNull();
    expect(result.report).not.toContain('NOT carried by this witness');
  });

  it('report names both payloads by sha256 so it can stand as PR evidence', () => {
    const oldPath = write('old-d.txt', OLD_VPL);
    const newPath = write('new-d.txt', OLD_VPL);
    const sha = createHash('sha256').update(OLD_VPL).digest('hex');
    const { report } = runWebDelta({ oldPath, newPath, goldenDir, check: false });
    expect(report).toContain(sha);
  });
});

describe('formatRef', () => {
  it('round-trips a verse id into the human form the report uses', () => {
    expect(formatRef(makeVerseId(43, 15, 4))).toBe('John 15:4');
    expect(formatRef(makeVerseId(19, 23, 1))).toBe('Psalms 23:1');
  });
});
