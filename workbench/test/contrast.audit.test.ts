import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

// WCAG contrast audit for The Study's token sheet (plan D5, extended by D35).
// The text-contrast half: every foreground/background pairing named in the
// reviewed workbench/test/pairs.json is checked against its per-entry AA
// threshold, for BOTH theme columns, with rgba tokens composited over their
// named base token. The D35 extension below adds the non-text (WCAG 1.4.11)
// checks — focus outline, verdict dots, and the interactive-boundary token —
// plus the two negative fixtures; the ARIA role assertions live in the D35
// Playwright checks (study-p5.spec.ts).
//
// The `.test.ts` name is load-bearing: vitest's default include pattern is
// what makes `npm test` actually run this audit.

// The Study page lives at static/index.html since the flip (D41).
const studyHtml = readFileSync(new URL('../static/index.html', import.meta.url), 'utf8');

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

/** Pure schema validator so the negative fixture can demonstrate a failure. */
function entrySchemaValid(entry: PairEntry): boolean {
  if (!/^--/.test(entry.fg) || !/^--/.test(entry.bg)) return false;
  if (typeof entry.use !== 'string' || entry.use.length === 0) return false;
  if (entry.exempt === true) return true;
  return entry.minRatio === 4.5 || entry.minRatio === 3;
}

/** Pure roster check so the delete-one-pair negative fixture can run. */
function rosterGaps(list: readonly PairEntry[]): string[] {
  const keys = list.map(pairKey);
  const missing = REQUIRED_PAIR_KEYS.filter((required) => !keys.includes(required));
  if (list.length !== REQUIRED_PAIR_KEYS.length) missing.push(`length ${list.length} !== ${REQUIRED_PAIR_KEYS.length}`);
  return missing;
}

describe('pairs.json schema and coverage', () => {
  it('every entry names fg, bg, a use, and either a threshold or an exemption', () => {
    for (const entry of pairs) {
      expect(entrySchemaValid(entry), `schema valid for ${pairKey(entry)}`).toBe(true);
    }
  });

  it('covers the full reviewed roster (deleting a pair fails this count)', () => {
    expect(rosterGaps(pairs)).toEqual([]);
  });

  it('negative fixture: deleting one pair fails the roster count', () => {
    expect(rosterGaps(pairs.slice(1)).length).toBeGreaterThan(0);
  });

  it('negative fixture: an entry with minRatio absent and no exempt fails the schema', () => {
    expect(entrySchemaValid({ fg: '--ink', bg: '--ground', use: 'threshold forgotten' })).toBe(false);
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

// D35(b): WCAG 1.4.11 non-text contrast (≥3:1). Deliberately-exempt tokens
// are reviewed data with stated reasons, never silent skips:
// - `--hairline-strong` is NOT asserted against 3:1: it stays on decorative
//   dividers and card edges — "not the sole indicator — cards and buttons
//   are identified by fill, text, and the focus ring" (it measures 1.47:1
//   vs --surface in both themes).
// - `--kbd-border` has no 3:1 check: "decorative — the keycap's text carries
//   the information (--text-2 on --kbd-bg measures 6.49:1)" (the border
//   itself measures 1.26:1 light).
const NON_TEXT_EXEMPT = [
  { token: '--hairline-strong', reason: 'not the sole indicator — cards and buttons are identified by fill, text, and the focus ring' },
  { token: '--kbd-border', reason: 'decorative — the keycap’s text carries the information (--text-2 on --kbd-bg measures 6.49:1)' },
] as const;

const NON_TEXT_CHECKS: readonly { fg: string; bg: string; use: string }[] = [
  // The :focus-visible outline (--accent) vs every background it appears
  // over: page ground, chrome surfaces, and the verse panel.
  { fg: '--accent', bg: '--ground', use: 'focus outline over the page ground' },
  { fg: '--accent', bg: '--surface', use: 'focus outline over chrome surfaces' },
  { fg: '--accent', bg: '--panel', use: 'focus outline over the verse panel' },
  // Verdict dot colors vs --surface (the queue rail).
  { fg: '--v-affirm', bg: '--surface', use: 'affirm verdict dot on the queue rail' },
  { fg: '--v-notrel', bg: '--surface', use: 'not-relevant verdict dot on the queue rail' },
  { fg: '--v-missing', bg: '--surface', use: 'missing verdict dot on the queue rail' },
  // The interactive-boundary token: --control-border vs --surface — used
  // only on text inputs and the segmented picker's selected boundary (§3.0).
  { fg: '--control-border', bg: '--surface', use: 'text-input / selected-picker boundary' },
];

describe.each([
  ['light', lightTokens],
  ['dark', darkTokens],
] as const)('WCAG 1.4.11 non-text contrast — %s theme', (theme, tokens) => {
  it('the exempt set is stated with reasons and stays out of the checks', () => {
    for (const exempt of NON_TEXT_EXEMPT) {
      expect(exempt.reason.length).toBeGreaterThan(0);
      expect(NON_TEXT_CHECKS.some((check) => check.fg === exempt.token || check.bg === exempt.token)).toBe(false);
    }
  });
  for (const check of NON_TEXT_CHECKS) {
    it(`${check.fg} vs ${check.bg} ≥ 3:1 — ${check.use}`, () => {
      const fg = resolveOpaque(tokens, check.fg, undefined, theme);
      const bg = resolveOpaque(tokens, check.bg, undefined, theme);
      const ratio = contrastRatio(fg, bg);
      expect(
        ratio,
        `${theme}: ${check.fg} vs ${check.bg} measures ${ratio.toFixed(3)}:1, below 3:1 (${check.use})`,
      ).toBeGreaterThanOrEqual(3);
    });
  }
});
