/**
 * Changelog guard — a tagged version without a CHANGELOG entry cannot ship
 * (plan P7.1 / CO-4).
 *
 * The hole this closes: engine/CHANGELOG.md existed and release.yml never
 * read it, so a version could be tagged and published with no entry — which
 * is exactly what happened for 0.10.0–0.14.0 in-tree before the P7.1
 * backfill. A changelog nothing enforces is decoration.
 *
 * What it checks (fail-closed: any unreadable input is a refusal, never a
 * pass):
 *   1. engine/CHANGELOG.md has an entry heading for the version
 *      engine/package.json is about to publish. Heading format is documented
 *      in the CHANGELOG itself: `## <version>` at line start, bare semver,
 *      followed by end-of-line, a space, or ` —`.
 *   2. When a release tag is being pushed (GITHUB_REF_NAME=v*), the tag's
 *      own version has an entry too, and the tag matches the package version
 *      — a tag the changelog does not describe would publish notes nobody
 *      wrote for it.
 *
 * ENGINE_VERSION (the in-code constant) is not read here: eval's
 * release-contract test already pins package.json === ENGINE_VERSION, and
 * `npm run verify -- --require-admit` runs earlier in the same workflow, so
 * the chain tag ⇒ package version ⇒ ENGINE_VERSION ⇒ entry is closed without
 * this script needing a TypeScript build.
 *
 * Importable for tests without side effects; executable as a script
 * (the release-smoke.mjs convention).
 */

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * True when `changelogText` contains an entry heading for `version`.
 *
 * A heading counts only when the line starts with `## ` followed by the
 * exact version and then a boundary (end of line, whitespace, or an em-dash
 * separator) — `## 0.14.0` never matches an `## 0.14.01` entry and never
 * matches a version mentioned mid-prose.
 */
export function hasChangelogEntry(changelogText, version) {
  if (typeof changelogText !== 'string' || typeof version !== 'string' || version.length === 0) {
    return false;
  }
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^## ${escaped}(?=$|\\s)`, 'm').test(changelogText);
}

/**
 * Pure decision core, separated from I/O so the refusal logic is unit-
 * testable. Returns a list of failure messages; empty = pass.
 *
 * @param {{ changelogText: string, packageVersion: string, refName?: string }} input
 */
export function checkChangelog({ changelogText, packageVersion, refName }) {
  const failures = [];
  if (typeof packageVersion !== 'string' || !/^\d+\.\d+\.\d+$/.test(packageVersion)) {
    failures.push(
      `engine/package.json version ${JSON.stringify(packageVersion)} is not a bare semver — refusing.`,
    );
    return failures; // Nothing sensible to look up; fail closed here.
  }
  if (!hasChangelogEntry(changelogText, packageVersion)) {
    failures.push(
      `engine/CHANGELOG.md has no entry for version ${packageVersion} ` +
        `(expected a heading '## ${packageVersion}' — format documented at the top of the changelog). ` +
        'An unchangelogged version cannot ship: write the entry for what actually changed, in this train.',
    );
  }
  if (typeof refName === 'string' && refName.startsWith('v')) {
    const tagVersion = refName.slice(1);
    if (tagVersion !== packageVersion) {
      failures.push(
        `Pushed tag ${refName} does not match engine/package.json version ${packageVersion} — ` +
          'the publish would ship a version the tag does not name.',
      );
    }
    if (!hasChangelogEntry(changelogText, tagVersion)) {
      failures.push(
        `engine/CHANGELOG.md has no entry for tagged version ${tagVersion} (tag ${refName}).`,
      );
    }
  }
  return failures;
}

function fail(message) {
  console.error(`\nCHANGELOG GUARD FAIL: ${message}`);
  process.exit(1);
}

function main() {
  let changelogText;
  let packageVersion;
  try {
    changelogText = readFileSync('engine/CHANGELOG.md', 'utf8');
  } catch (error) {
    fail(`cannot read engine/CHANGELOG.md (${error.message}) — a missing changelog never passes.`);
  }
  try {
    packageVersion = JSON.parse(readFileSync('engine/package.json', 'utf8')).version;
  } catch (error) {
    fail(`cannot read engine/package.json (${error.message}).`);
  }
  const refName = process.env.GITHUB_REF_NAME;
  const failures = checkChangelog({ changelogText, packageVersion, refName });
  if (failures.length > 0) {
    fail(failures.join('\n  '));
  }
  console.log(
    `Changelog entry present for ${packageVersion}` +
      (refName && refName.startsWith('v') ? ` (tag ${refName} consistent).` : '.'),
  );
}

// Importable for tests without side effects; executable as a script.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
