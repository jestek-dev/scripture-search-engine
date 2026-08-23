/**
 * The release changelog guard (plan P7.1 / CO-4).
 *
 * Hole this closes: engine/CHANGELOG.md existed and release.yml never read
 * it, so a tagged version with no entry shipped clean — 0.10.0 through
 * 0.14.0 all bumped without entries before the P7.1 backfill. The guard
 * refuses that; these tests prove the refusal actually fires (a guard whose
 * failure mode is untested is decoration, per the gate discipline in
 * CLAUDE.md).
 *
 * Alongside the seeded-violation controls, the live assertions pin the tree
 * itself: the CURRENT engine version has an entry, so an ENGINE_VERSION bump
 * without its changelog entry goes red at PR time here — before the release
 * workflow ever runs.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ENGINE_VERSION } from '@jestek-dev/scripture-engine';

import { checkChangelog, hasChangelogEntry } from '../../.github/scripts/changelog-guard.mjs';

const ROOT = join(import.meta.dirname, '..', '..');
const changelogText = readFileSync(join(ROOT, 'engine', 'CHANGELOG.md'), 'utf8');
const packageVersion = (
  JSON.parse(readFileSync(join(ROOT, 'engine', 'package.json'), 'utf8')) as { version: string }
).version;

describe('hasChangelogEntry', () => {
  const sample = [
    '# Changelog',
    '',
    '## 0.14.0 — 2026-08-22 — unreleased',
    '- something true',
    '',
    '## 0.9.0 — 2026-08-08 — never published',
    '- mentions 0.10.0 mid-prose, which must not count as an entry for it',
    '',
    '## 0.7.1 — 2026-07-31',
  ].join('\n');

  it('matches an entry heading with a trailing date/status', () => {
    expect(hasChangelogEntry(sample, '0.14.0')).toBe(true);
    expect(hasChangelogEntry(sample, '0.9.0')).toBe(true);
    expect(hasChangelogEntry(sample, '0.7.1')).toBe(true);
  });

  it('does not match versions only mentioned in prose', () => {
    expect(hasChangelogEntry(sample, '0.10.0')).toBe(false);
  });

  it('does not match a longer version sharing a prefix', () => {
    expect(hasChangelogEntry('## 0.14.01 — oops', '0.14.0')).toBe(false);
    // Dots are escaped, not wildcards:
    expect(hasChangelogEntry('## 0x14x0', '0.14.0')).toBe(false);
  });

  it('fails closed on non-string / empty input', () => {
    expect(hasChangelogEntry(sample, '')).toBe(false);
    // @ts-expect-error — deliberate bad input: the guard must refuse, not throw.
    expect(hasChangelogEntry(undefined, '0.14.0')).toBe(false);
  });
});

describe('checkChangelog refusals (positive controls — the guard demonstrably fires)', () => {
  it('SEEDED VIOLATION: a version bump without an entry is refused', () => {
    // The real changelog with the current version's own heading struck out —
    // exactly the state the tree was in for 0.10.0–0.14.0 before P7.1.
    const struck = changelogText.replace(new RegExp(`^## ${packageVersion.replace(/\./g, '\\.')}`, 'm'), '## struck-for-test');
    expect(hasChangelogEntry(struck, packageVersion)).toBe(false);
    const failures = checkChangelog({ changelogText: struck, packageVersion });
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain(`no entry for version ${packageVersion}`);
  });

  it('SEEDED VIOLATION: a tag naming an unchangelogged version is refused', () => {
    const failures = checkChangelog({
      changelogText,
      packageVersion,
      refName: 'v99.99.99',
    });
    // Both refusals fire: tag/package mismatch AND the tag's missing entry.
    expect(failures).toHaveLength(2);
    expect(failures[0]).toContain('does not match engine/package.json version');
    expect(failures[1]).toContain('no entry for tagged version 99.99.99');
  });

  it('SEEDED VIOLATION: a malformed package version is refused outright', () => {
    expect(checkChangelog({ changelogText, packageVersion: 'not-a-version' })).toHaveLength(1);
    // @ts-expect-error — deliberate bad input: fail closed, never pass.
    expect(checkChangelog({ changelogText, packageVersion: undefined })).toHaveLength(1);
  });

  it('a non-tag ref (workflow_dispatch, branch build) checks the package version only', () => {
    expect(
      checkChangelog({ changelogText, packageVersion, refName: 'claude/some-branch' }),
    ).toEqual([]);
  });
});

describe('the tree itself (live guard — fires at PR time, before release.yml)', () => {
  it(`the current engine version ${ENGINE_VERSION} has a changelog entry`, () => {
    expect(
      hasChangelogEntry(changelogText, ENGINE_VERSION),
      `engine/CHANGELOG.md has no '## ${ENGINE_VERSION}' entry — an ENGINE_VERSION bump ` +
        'must write its changelog entry in the same train (P7.1; the release guard refuses it too).',
    ).toBe(true);
  });

  it('every shipped or in-train version has an entry (P7.1 DoD)', () => {
    for (const version of ['0.7.0', '0.7.1', '0.8.0', '0.9.0', '0.10.0', '0.11.0', '0.12.0', '0.13.0', '0.14.0']) {
      expect(hasChangelogEntry(changelogText, version), `missing entry for ${version}`).toBe(true);
    }
  });

  it('the guard passes on the real tree with the real tag it would see at the terminus', () => {
    expect(checkChangelog({ changelogText, packageVersion, refName: `v${packageVersion}` })).toEqual(
      [],
    );
  });
});
