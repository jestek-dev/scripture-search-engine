/**
 * Guard for the one-click plan's covenant cap (CLAUDE.md #1: nothing
 * auto-merges; every PR lands through Jesse's human merge).
 *
 * The 2026-08-15 amendment capped that document's authority at opening a
 * draft PR. This test keeps the cap from eroding by later edits: the
 * sentinel sentence must stay present, and the withdrawn automation language
 * may appear only inside the amendment changelog block that quotes it as
 * history.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const PLAN_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..', '..', 'docs', 'one-click-review-to-live-implementation-plan.md',
);

const SENTINEL = 'No automation merges to `main`.';
const CHANGELOG_HEADING = '## Amendment changelog';
// Case-insensitive, because §20 previously spelled "Auto-merge" capitalized.
const FORBIDDEN_PHRASES: readonly RegExp[] = [
  /auto-?merge/i,
  /merge through the GitHub API/i,
];

interface SplitPlan {
  readonly changelog: string;
  readonly rest: string;
}

export function splitOutChangelog(markdown: string): SplitPlan {
  const start = markdown.indexOf(CHANGELOG_HEADING);
  if (start < 0) return { changelog: '', rest: markdown };
  const afterHeading = markdown.indexOf('\n## ', start + CHANGELOG_HEADING.length);
  const end = afterHeading < 0 ? markdown.length : afterHeading;
  return {
    changelog: markdown.slice(start, end),
    rest: markdown.slice(0, start) + markdown.slice(end),
  };
}

describe('one-click plan covenant guard', () => {
  it('keeps the sentinel sentence outside the changelog', async () => {
    const { rest } = splitOutChangelog(await readFile(PLAN_PATH, 'utf8'));
    expect(rest).toContain(SENTINEL);
  });

  it('has an amendment changelog block, so the exclusion below is well-defined', async () => {
    const markdown = await readFile(PLAN_PATH, 'utf8');
    const { changelog } = splitOutChangelog(markdown);
    expect(changelog).toContain(CHANGELOG_HEADING);
  });

  it('carries no merge-automation language outside the changelog block', async () => {
    const { rest } = splitOutChangelog(await readFile(PLAN_PATH, 'utf8'));
    for (const phrase of FORBIDDEN_PHRASES) {
      const match = phrase.exec(rest);
      expect({ phrase: String(phrase), match: match?.[0] ?? null }).toEqual({ phrase: String(phrase), match: null });
    }
  });

  it('names the governance stop reasons the cap depends on', async () => {
    const markdown = await readFile(PLAN_PATH, 'utf8');
    expect(markdown).toContain('g8-baseline-moved-needs-independent-approval');
    expect(markdown).toContain('no-measurable-effect');
    // All three required checks, not two.
    expect(markdown).toContain('verify (ubuntu-latest)');
    expect(markdown).toContain('verify (windows-latest)');
    expect(markdown).toContain('cross-platform ordering (G2)');
  });

  it('would catch the withdrawn automation language if it returned', () => {
    const regression = splitOutChangelog(
      '# Plan\n\n## Amendment changelog (x)\n\n- history mentions Auto-merge canary.\n\n## 11\n\nEnable auto-merge or merge through the GitHub API.\n',
    );
    expect(FORBIDDEN_PHRASES.some((phrase) => phrase.test(regression.rest))).toBe(true);
    expect(FORBIDDEN_PHRASES.some((phrase) => phrase.test(regression.changelog))).toBe(true);
  });
});
