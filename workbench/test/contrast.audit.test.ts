import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

// WCAG contrast audit for The Study's token sheet (plan D5, extended by D35).
// This is the text-contrast half: every foreground/background pairing named
// in the reviewed workbench/test/pairs.json is checked against its per-entry
// AA threshold, for BOTH theme columns, with rgba tokens composited over
// their named base token. D35 extends this file with the non-text (1.4.11)
// checks and the ARIA role assertions.
//
// The `.test.ts` name is load-bearing: vitest's default include pattern is
// what makes `npm test` actually run this audit.

const studyHtml = readFileSync(new URL('../static/study.html', import.meta.url), 'utf8');

interface PairEntry {
  readonly fg: string;
  readonly bg: string;
  readonly compositeBase?: string;
  readonly minRatio?: number;
  readonly use: string;
  readonly exempt?: boolean;
}

const pairs = JSON.parse(readFileSync(new URL('./pairs.json', import.meta.url), 'utf8')) as PairEntry[];

function tokenBlock(source: string, selectorPattern: RegExp): Map<string, string> {
  const match = selectorPattern.exec(source);
  expect(match, `token block ${selectorPattern} found in study.html`).not.toBeNull();
  const body = match![1]!;
  const tokens = new Map<string, string>();
  for (const declaration of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(declaration[1]!, declaration[2]!.trim());
  }
  return tokens;
}

const lightTokens = tokenBlock(studyHtml, /:root\{([\s\S]*?)\}/);
const darkTokens = tokenBlock(studyHtml, /\[data-theme="dark"\]\{([\s\S]*?)\}/);

type Rgb = readonly [number, number, number];
type Rgba = readonly [number, number, number, number];

function parseColor(value: string): Rgba | null {
  const hex = /^#([0-9a-fA-F]{6})$/.exec(value);
  if (hex !== null) {
    const n = parseInt(hex[1]!, 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, 1];
  }
  const rgba = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\.?\d*\.?\d*)\s*\)$/.exec(value);
  if (rgba !== null) {
    return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), Number(rgba[4])];
  }
  return null;
}

function composite(fg: Rgba, base: Rgb): Rgb {
  const alpha = fg[3];
  return [
    Math.round(fg[0] * alpha + base[0] * (1 - alpha)),
    Math.round(fg[1] * alpha + base[1] * (1 - alpha)),
    Math.round(fg[2] * alpha + base[2] * (1 - alpha)),
  ];
}

function luminance(rgb: Rgb): number {
  const channel = (value: number): number => {
    const scaled = value / 255;
    return scaled <= 0.04045 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter! + 0.05) / (darker! + 0.05);
}

function resolveOpaque(tokens: Map<string, string>, name: string, compositeBase: string | undefined, theme: string): Rgb {
  const raw = tokens.get(name);
  expect(raw, `${theme}: token ${name} defined in study.html`).toBeDefined();
  const color = parseColor(raw!);
  expect(color, `${theme}: token ${name} (${raw}) parses as a color`).not.toBeNull();
  if (color![3] === 1) return [color![0], color![1], color![2]];
  // An rgba token must name its compositing base in pairs.json — a ratio
  // computed against raw rgba is undefined.
  expect(compositeBase, `${theme}: alpha token ${name} names a compositeBase in pairs.json`).toBeDefined();
  const baseRaw = tokens.get(compositeBase!);
  expect(baseRaw, `${theme}: compositeBase ${compositeBase} defined`).toBeDefined();
  const base = parseColor(baseRaw!);
  expect(base, `${theme}: compositeBase ${compositeBase} parses`).not.toBeNull();
  expect(base![3], `${theme}: compositeBase ${compositeBase} is opaque`).toBe(1);
  return composite(color!, [base![0], base![1], base![2]]);
}

// The roster every reviewed pairs.json must cover: deleting an entry fails
// this count assertion against the token sheet.
const REQUIRED_PAIR_KEYS = [
  '--ink/--ground@4.5', '--ink/--surface@4.5', '--ink/--panel@4.5',
  '--text-2/--ground@4.5', '--text-2/--surface@4.5', '--text-2/--panel@4.5',
  '--text-3/--ground@4.5', '--text-3/--surface@4.5', '--text-3/--panel@4.5',
  '--text-faint/--ground@exempt', '--text-faint/--surface@exempt', '--text-faint/--panel@exempt',
  '--accent/--surface@4.5', '--accent/--accent-wash@4.5', '--on-accent/--accent@4.5',
  '--text-2/--kbd-bg@4.5', '--ink/--highlight@4.5',
  '--v-affirm/--panel@3', '--v-affirm/--panel@4.5',
  '--v-notrel/--panel@3', '--v-notrel/--panel@4.5',
  '--v-missing/--panel@3', '--v-missing/--panel@4.5',
  '--v-affirm/--v-affirm-wash@4.5', '--v-notrel/--v-notrel-wash@4.5', '--v-missing/--v-missing-wash@4.5',
  '--ink/--v-affirm-wash@4.5', '--text-2/--v-affirm-wash@4.5',
  '--ink/--v-notrel-wash@4.5', '--text-2/--v-notrel-wash@4.5',
  '--ink/--v-missing-wash@4.5', '--text-2/--v-missing-wash@4.5',
];

function pairKey(entry: PairEntry): string {
  return `${entry.fg}/${entry.bg}@${entry.exempt === true ? 'exempt' : String(entry.minRatio)}`;
}

describe('pairs.json schema and coverage', () => {
  it('every entry names fg, bg, a use, and either a threshold or an exemption', () => {
    for (const entry of pairs) {
      expect(entry.fg, JSON.stringify(entry)).toMatch(/^--/);
      expect(entry.bg, JSON.stringify(entry)).toMatch(/^--/);
      expect(typeof entry.use === 'string' && entry.use.length > 0, `use stated for ${pairKey(entry)}`).toBe(true);
      if (entry.exempt === true) continue;
      expect(
        entry.minRatio === 4.5 || entry.minRatio === 3,
        `minRatio 4.5 or 3 (or exempt: true) required for ${entry.fg}/${entry.bg}`,
      ).toBe(true);
    }
  });

  it('covers the full reviewed roster (deleting a pair fails this count)', () => {
    const keys = pairs.map(pairKey);
    for (const required of REQUIRED_PAIR_KEYS) {
      expect(keys, `pairs.json contains ${required}`).toContain(required);
    }
    expect(pairs).toHaveLength(REQUIRED_PAIR_KEYS.length);
  });
});

describe.each([
  ['light', lightTokens],
  ['dark', darkTokens],
] as const)('WCAG AA text contrast — %s theme', (theme, tokens) => {
  for (const entry of pairs) {
    if (entry.exempt === true) continue;
    it(`${entry.fg} on ${entry.bg}${entry.compositeBase !== undefined ? ` (over ${entry.compositeBase})` : ''} ≥ ${entry.minRatio}:1 — ${entry.use}`, () => {
      const fg = resolveOpaque(tokens, entry.fg, entry.compositeBase, theme);
      const bg = resolveOpaque(tokens, entry.bg, entry.compositeBase, theme);
      const ratio = contrastRatio(fg, bg);
      expect(
        ratio,
        `${theme}: ${entry.fg} on ${entry.bg} measures ${ratio.toFixed(3)}:1, below ${entry.minRatio}:1 (${entry.use})`,
      ).toBeGreaterThanOrEqual(entry.minRatio!);
    });
  }
});
