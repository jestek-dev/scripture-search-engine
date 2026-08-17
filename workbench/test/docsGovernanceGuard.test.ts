/**
 * Review records must be reproducible evidence, not artifacts of one specific
 * person's machine. An absolute local path in docs/reviews/*.md (a Windows
 * drive path, a /home or /Users path, or a file:// URL) is how the 2026-08-10
 * probe-baseline review revealed it was performed on the repository owner's
 * own machine — the exact failure mode this guard exists to catch.
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const REVIEWS_DIRECTORY = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'reviews');

const ABSOLUTE_LOCAL_PATH_PATTERNS: readonly RegExp[] = [
  // Windows drive paths, including markdown links of the form (/C:/Users/...).
  /(?:^|[\s("'`[/])[A-Za-z]:[\\/][^\s)"'`\]]+/m,
  // POSIX home directories — the places a personal checkout lives.
  /\/(?:home|Users)\/[^\s)"'`\]]+/,
  // System temp directories: a /tmp scratch file is just as machine-local as
  // a home directory, and the policy says repository-relative paths only —
  // the sanctioned scratch location is the gitignored eval/.runs/.
  /\/(?:tmp|var|private)\/[^\s)"'`\]]+/,
  // file:// URLs are absolute local paths wearing a scheme.
  /file:\/\//i,
];

export function absoluteLocalPathFindings(markdown: string): readonly string[] {
  const findings: string[] = [];
  for (const [index, line] of markdown.split('\n').entries()) {
    for (const pattern of ABSOLUTE_LOCAL_PATH_PATTERNS) {
      const match = pattern.exec(line);
      if (match !== null) {
        findings.push(`line ${index + 1}: ${match[0].trim()}`);
        break;
      }
    }
  }
  return findings;
}

// The exact link shape the un-fixed 2026-08-10 review record carried. Kept as
// a fixture so the guard's bite is proven even after the live doc is fixed.
const UNFIXED_2026_08_10_LINE =
  '- Baseline file: [eval/baselines/probes.json](/C:/Users/Jeste/OneDrive/Documents/GitHub/scripture-search-engine/eval/baselines/probes.json)';

describe('docs/reviews governance guard', () => {
  it('fails on the un-fixed 2026-08-10 review record shape, proving the guard bites', () => {
    const findings = absoluteLocalPathFindings(UNFIXED_2026_08_10_LINE);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toContain('C:/Users/Jeste');
  });

  it('flags POSIX home paths and file URLs too', () => {
    expect(absoluteLocalPathFindings('see /home/someone/repo/eval/probes.json')).toHaveLength(1);
    expect(absoluteLocalPathFindings('see /Users/someone/repo/eval/probes.json')).toHaveLength(1);
    expect(absoluteLocalPathFindings('see file:///anywhere/at/all')).toHaveLength(1);
  });

  it('flags system temp paths — scratch files belong in the gitignored eval/.runs/', () => {
    expect(absoluteLocalPathFindings('git show abc123 > /tmp/probes-before.json')).toHaveLength(1);
    expect(absoluteLocalPathFindings('saved to /var/folders/xy/scratch/probes.json')).toHaveLength(1);
    expect(absoluteLocalPathFindings('saved to /private/tmp/probes.json')).toHaveLength(1);
  });

  it('accepts repository-relative paths and ordinary prose', () => {
    expect(absoluteLocalPathFindings([
      '- Baseline file: `eval/baselines/probes.json`',
      'The review used docs/governance/probe-baseline-review.md and C-level prose.',
      'A ratio of 1:2 and a verse WEB:45005008 are not paths.',
      'git show abc123 > eval/.runs/probes-before.json',
    ].join('\n'))).toEqual([]);
  });

  it('finds no absolute local paths in any committed review record', async () => {
    const names = (await readdir(REVIEWS_DIRECTORY)).filter((name) => name.endsWith('.md')).sort();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const markdown = await readFile(path.join(REVIEWS_DIRECTORY, name), 'utf8');
      expect({ file: name, findings: absoluteLocalPathFindings(markdown) }).toEqual({ file: name, findings: [] });
    }
  });
});
