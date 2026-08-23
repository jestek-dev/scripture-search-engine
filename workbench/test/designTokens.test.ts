import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { CASE_STATES } from '../src/cases.js';
import { REVIEW_CASE_SOURCES } from '../src/judgments.js';

// The token names in Jesse's prototype v2 token block — commit 5ba1096,
// `prototype/Scripture Workbench/Curation Workbench.dc.html` lines 14–38
// (`:root` + `[data-theme="dark"]`). The DESIGN.md table must carry every one
// of these with a value in BOTH theme columns. The check is over token
// *names*: the plan's four pre-approved deviations change values only, and
// the added `--control-border` is a superset entry a name-coverage check
// does not forbid.
const PROTOTYPE_TOKEN_NAMES = [
  '--ground',
  '--surface',
  '--panel',
  '--hairline',
  '--hairline-strong',
  '--ink',
  '--text-2',
  '--text-3',
  '--text-faint',
  '--accent',
  '--accent-hover',
  '--on-accent',
  '--accent-wash',
  '--v-affirm',
  '--v-notrel',
  '--v-missing',
  '--v-affirm-wash',
  '--v-notrel-wash',
  '--v-missing-wash',
  '--highlight',
  '--kbd-bg',
  '--kbd-border',
  '--sel-bg',
  '--caret',
  '--shadow',
  '--r-ctl',
  '--r-panel',
] as const;

// The four main-flow judgment actions. `prefer` exists in the API
// (JUDGMENT_ACTIONS) but is deliberately not a main-flow vote, so the verdict
// rename table carries exactly these four.
const MAIN_FLOW_ACTIONS = ['essential', 'helpful', 'irrelevant', 'missing'] as const;

const designMd = readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');

interface TableRow {
  readonly cells: readonly string[];
}

/** Every markdown table in the document, as trimmed cell arrays without the separator row. */
function markdownTables(source: string): TableRow[][] {
  const tables: TableRow[][] = [];
  let current: TableRow[] = [];
  for (const line of source.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|')) {
      const cells = trimmed
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim());
      if (cells.every((cell) => /^:?-+:?$/.test(cell))) continue;
      current.push({ cells });
    } else if (current.length > 0) {
      tables.push(current);
      current = [];
    }
  }
  if (current.length > 0) tables.push(current);
  return tables;
}

const tables = markdownTables(designMd);

function tableWithHeader(...header: readonly string[]): TableRow[] {
  const found = tables.find((table) =>
    table[0] !== undefined
    && table[0].cells.length === header.length
    && header.every((cell, index) => table[0]!.cells[index] === cell));
  expect(found, `DESIGN.md table with header ${header.join(' | ')}`).toBeDefined();
  return found!.slice(1);
}

describe('DESIGN.md token sheet', () => {
  const rows = tableWithHeader('Token', 'Light', 'Dark');
  const byName = new Map(rows.map((row) => [row.cells[0]!, row]));

  it('carries every prototype token name with a value in both theme columns', () => {
    for (const name of PROTOTYPE_TOKEN_NAMES) {
      const row = byName.get(name);
      expect(row, `token ${name} present in DESIGN.md`).toBeDefined();
      expect(row!.cells[1], `${name} light value`).toBeTruthy();
      expect(row!.cells[2], `${name} dark value`).toBeTruthy();
    }
  });

  it('lists the added --control-border token in both columns', () => {
    const row = byName.get('--control-border');
    expect(row, 'token --control-border present in DESIGN.md').toBeDefined();
    expect(row!.cells[1]).toBeTruthy();
    expect(row!.cells[2]).toBeTruthy();
  });
});

describe('DESIGN.md rename tables', () => {
  it('names exactly the 7 server case sources', () => {
    const rows = tableWithHeader('Source', 'Plain language');
    expect(rows.map((row) => row.cells[0])).toEqual([...REVIEW_CASE_SOURCES]);
    expect(REVIEW_CASE_SOURCES).toHaveLength(7);
    for (const row of rows) expect(row.cells[1], `plain language for ${row.cells[0]}`).toBeTruthy();
  });

  it('names exactly the 11 server case states', () => {
    const rows = tableWithHeader('State', 'Plain language');
    expect(rows.map((row) => row.cells[0])).toEqual([...CASE_STATES]);
    expect(CASE_STATES).toHaveLength(11);
    for (const row of rows) expect(row.cells[1], `plain language for ${row.cells[0]}`).toBeTruthy();
  });

  it('names exactly the 4 main-flow verdict actions', () => {
    const rows = tableWithHeader('Action', 'Plain language');
    expect(rows.map((row) => row.cells[0])).toEqual([...MAIN_FLOW_ACTIONS]);
    for (const row of rows) expect(row.cells[1], `plain language for ${row.cells[0]}`).toBeTruthy();
  });
});

describe('DESIGN.md reason-pill mapping', () => {
  it('covers exactly the nine non-reference SignalFamily values from the engine', () => {
    const familySource = readFileSync(new URL('../../engine/src/reasons/types.ts', import.meta.url), 'utf8');
    const unionBlock = /export type SignalFamily =([\s\S]*?);/.exec(familySource);
    expect(unionBlock, 'SignalFamily union found in engine/src/reasons/types.ts').not.toBeNull();
    const families = [...unionBlock![1]!.matchAll(/'([a-z_]+)'/g)].map((match) => match[1]!);
    expect(families).toContain('reference');
    const nonReference = families.filter((family) => family !== 'reference');
    expect(nonReference).toHaveLength(9);

    const rows = tableWithHeader('Family', 'Pill');
    expect([...rows.map((row) => row.cells[0])].sort()).toEqual([...nonReference].sort());
    const allowedPills = new Set(['Matched the meaning', 'Shares key words', 'Close in meaning']);
    for (const row of rows) {
      expect(allowedPills.has(row.cells[1]!), `pill for ${row.cells[0]} is one of the three strings`).toBe(true);
    }
  });
});
