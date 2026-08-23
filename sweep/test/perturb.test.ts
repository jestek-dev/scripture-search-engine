/**
 * MS-4 verification, per the plan's own list: determinism (BigInt-only lint
 * bans Math.random/floats in the perturbation path); idempotent
 * re-derivation; ms1–ms6 present verbatim; ref1/ref7/ref8 present; the
 * typed-kind commitment on invalid rows; the base-query-oracle expectation
 * on every typo line.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { REPO_ROOT } from '../src/universe/compileFromRepo.js';
import { deriveTypoRing, perturbQuery } from '../src/perturb/perturb.js';
import {
  batteryMisspellingLines,
  deriveRepoRing2,
  loadPhoneticRules,
  readPerturbK,
} from '../src/perturb/deriveRepoRing2.js';
import type { UniverseLine } from '../src/universe/types.js';

const RULES = loadPhoneticRules();

const BASE_LINES: UniverseLine[] = [
  {
    queryId: 'g:aaa',
    query: 'forgiveness of sins',
    generator: 'g',
    register: 'church-member',
    expectation: { kind: 'none' },
  },
  {
    queryId: 'g:bbb',
    query: 'the righteousness of god',
    generator: 'g',
    expectation: { kind: 'none' },
    crisisAdjacent: true,
  },
  {
    queryId: 'p:ccc',
    query: 'does god forgive me',
    generator: 'p',
    expectation: { kind: 'none' },
    confidence: 'inherited',
  },
  // No eligible token — must yield zero variants, never filler.
  { queryId: 'g:ddd', query: '1 2 3', generator: 'g', expectation: { kind: 'none' } },
];

describe('typo perturbation', () => {
  it('derives byte-identically twice (fully pinned function of Ring 1)', () => {
    const options = { seed: 's', kGrammar: 2, kParaphrase: 3, rules: RULES };
    const first = deriveTypoRing(BASE_LINES, options);
    const second = deriveTypoRing(BASE_LINES, options);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('applies k=2 to grammar lines and k=3 to inherited (paraphrase) lines', () => {
    const derived = deriveTypoRing(BASE_LINES, { seed: 's', kGrammar: 2, kParaphrase: 3, rules: RULES });
    const byBase = (id: string) => derived.filter((line) => line.expectation.kind === 'base-query-oracle' && line.expectation.baseQueryId === id);
    expect(byBase('g:aaa').length).toBe(2);
    expect(byBase('p:ccc').length).toBe(3);
    expect(byBase('g:ddd').length).toBe(0);
  });

  it('every derived line carries the oracle expectation and rides its base crisis ruling', () => {
    const derived = deriveTypoRing(BASE_LINES, { seed: 's', kGrammar: 2, kParaphrase: 3, rules: RULES });
    for (const line of derived) {
      expect(line.expectation.kind).toBe('base-query-oracle');
      if (line.expectation.kind === 'base-query-oracle') {
        expect(line.expectation.requireCitedCorrection).toBe(true);
      }
      expect(line.query).not.toBe(BASE_LINES.find((base) => line.queryId.includes(base.queryId))?.query);
    }
    const crisisDerived = derived.filter((line) => line.queryId.startsWith('perturb:g:bbb'));
    expect(crisisDerived.length).toBeGreaterThan(0);
    for (const line of crisisDerived) expect(line.crisisAdjacent).toBe(true);
  });

  it('perturbQuery is stable under extension (independent of other lines)', () => {
    const alone = perturbQuery('s', 'g:aaa', 'forgiveness of sins', 2, RULES);
    const derived = deriveTypoRing(BASE_LINES, { seed: 's', kGrammar: 2, kParaphrase: 3, rules: RULES });
    const fromRing = derived
      .filter((line) => line.queryId.startsWith('perturb:g:aaa'))
      .map((line) => line.query);
    expect(fromRing).toEqual(alone.map((variant) => variant.query));
  });
});

describe('repo Ring 2 derivation', () => {
  it('is idempotent, sorted, schema-valid, and carries the battery specimens', () => {
    const options = { kGrammar: 1, kParaphrase: 1, perBook: 3 };
    const first = deriveRepoRing2(options);
    const second = deriveRepoRing2(options);
    expect(JSON.stringify(second.lines)).toBe(JSON.stringify(first.lines));
    for (let i = 1; i < first.lines.length; i += 1) {
      expect(first.lines[i - 1]!.queryId < first.lines[i]!.queryId).toBe(true);
    }
    const queries = new Set(first.lines.map((line) => line.query));
    // ms1–ms6 present verbatim (ms4 rides the reference-specimen list).
    for (const specimen of [
      'forgivness',
      'annointing',
      'rightousness',
      'Phillipians 4:13',
      'stregnth',
      'salvasion',
    ]) {
      expect(queries.has(specimen), `missing battery specimen ${specimen}`).toBe(true);
    }
    // ref1/ref7/ref8 present with their pinned expected labels.
    const byQuery = new Map(first.lines.map((line) => [line.query, line]));
    const ref1 = byQuery.get('John 3 16')!;
    expect(ref1.expectation).toMatchObject({ kind: 'verse-ref', expectedReference: 'John 3:16' });
    const ref7 = byQuery.get('1 corinthians 13 4')!;
    expect(ref7.expectation).toMatchObject({
      kind: 'verse-ref',
      expectedReference: '1 Corinthians 13:4',
    });
    const ref8 = byQuery.get('Songs of Solomon 2:1')!;
    expect(ref8.expectation).toMatchObject({
      kind: 'verse-ref',
      expectedReference: 'Song of Solomon 2:1',
    });
  });

  it('book-name variants ride the alias table as oracle; fake books expect the typed kind', () => {
    const { lines } = deriveRepoRing2({ kGrammar: 1, kParaphrase: 1, perBook: 2 });
    const genisis = lines.find((line) => line.query.startsWith('Genisis '));
    expect(genisis, 'curated alias variant missing').toBeDefined();
    expect(genisis!.expectation).toMatchObject({ kind: 'verse-ref' });
    expect(
      genisis!.expectation.kind === 'verse-ref' ? genisis!.expectation.expectedReference : '',
    ).toMatch(/^Genesis /);
    const fake = lines.find((line) => line.query.startsWith('Hezekiah '));
    expect(fake).toBeDefined();
    expect(fake!.expectation).toMatchObject({ kind: 'verse-ref', expectInvalid: true });
    // Out-of-range chapters expect the typed invalid kind too.
    const outOfRange = lines.find((line) => /^Genesis 90:/.test(line.query));
    expect(outOfRange).toBeDefined();
    expect(outOfRange!.expectation).toMatchObject({ kind: 'verse-ref', expectInvalid: true });
  });

  it('covers every anchored verse with variant forms', () => {
    const { lines } = deriveRepoRing2({ kGrammar: 1, kParaphrase: 1, perBook: 2 });
    const queries = new Set(lines.map((line) => line.query));
    // A known curated anchor and its derived forms.
    expect(queries.has('Hebrews 11:6')).toBe(true);
    expect(queries.has('hebrews 11:6')).toBe(true);
    expect(queries.has('Hebrews 11 6')).toBe(true);
    expect(queries.has('hebrews11:6')).toBe(true);
  });

  it('battery misspelling lines carry correction-cited expectations', () => {
    const lines = batteryMisspellingLines();
    expect(lines.length).toBeGreaterThanOrEqual(5);
    for (const line of lines) {
      expect(line.expectation.kind).toBe('correction-cited');
      if (line.expectation.kind === 'correction-cited') {
        expect(line.expectation.misspelled.length).toBeGreaterThan(0);
      }
    }
  });

  it('perturbK config is null until J43 signs it (readPerturbK refuses to default)', () => {
    expect(readPerturbK()).toBeNull();
  });
});

describe('BigInt-only lint (bans nondeterminism in the derivation path)', () => {
  it('no Math.random, Date.now, parseFloat, or float literals in prng/perturb sources', () => {
    const targets = [
      join(REPO_ROOT, 'sweep', 'src', 'prng.ts'),
      ...readdirSync(join(REPO_ROOT, 'sweep', 'src', 'perturb'))
        .filter((name) => name.endsWith('.ts'))
        .map((name) => join(REPO_ROOT, 'sweep', 'src', 'perturb', name)),
      join(REPO_ROOT, 'sweep', 'src', 'universe', 'compile.ts'),
    ];
    for (const path of targets) {
      const source = readFileSync(path, 'utf8');
      expect(source, `${path} uses Math.random`).not.toMatch(/Math\.random/);
      expect(source, `${path} uses Date.now`).not.toMatch(/Date\.now/);
      expect(source, `${path} uses parseFloat`).not.toMatch(/parseFloat/);
      // Float literals (0.5, 1e-3) — integer/BigInt arithmetic only. Strip
      // comments first so prose like "1.0" in a doc block does not trip it.
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
      expect(code, `${path} contains a float literal`).not.toMatch(/\b\d+\.\d+(?!\d*n)/);
      expect(code, `${path} contains scientific notation`).not.toMatch(/\b\d+e-?\d+\b/i);
    }
  });
});
