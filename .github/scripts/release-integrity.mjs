/**
 * Scheduled release-integrity sentinel (plan P2.3 / RH-2).
 *
 * Published releases created before the immutable-releases setting (v0.7.0,
 * v0.7.1) are mutable at rest, and even after the setting lands this job is
 * the regression check FOR the setting itself. The GitHub API serves a
 * per-asset sha256 `digest`, so the check is one API call per run — no
 * 123 MB download: for every release we hold an expectation about, the
 * API digest of `content.db` must equal the reviewed sha256.
 *
 * Expectations come from two places:
 *   1. KNOWN_RELEASE_DIGESTS — a pinned list of already-published releases,
 *      recorded from the live API (reviewed data; extend it when a release
 *      ships).
 *   2. The committed descriptor's (release.tag, databaseSha256) pair, when
 *      the descriptor names a tag. In the window between the descriptor PR
 *      merging and the tag being pushed, the release may not be published
 *      yet — that reports PENDING, not red; but once ANY release (draft
 *      included, when the token can see it) exists at that tag, its digest
 *      must match.
 *
 * Red = tamper or operational mix-up (the v0.7.1 defect class). The red
 * scheduled run IS the alarm — same discipline as sources.yml's drift job.
 * The one action a red run authorizes is an investigation against git
 * history and the mint run; never an in-place edit of a pin to green it.
 *
 * Importable for tests without side effects; executable as a script.
 */

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const REPO = 'jestek-dev/scripture-search-engine';
const ASSET = 'content.db';

/**
 * Digests recorded from the live GitHub API on 2026-08-21. Both published
 * releases ship the same schema-5 content.db (the byte gap to the committed
 * descriptor is the whole v0.7.1 finding — see docs/NEEDS-JESSE.md §1.9);
 * what this list pins is "the published assets stay the bytes they were",
 * not "the published assets match the committed descriptor".
 */
export const KNOWN_RELEASE_DIGESTS = [
  {
    tag: 'v0.7.0',
    asset: ASSET,
    sha256: 'b57d367682ec8e0c63ebcb66ac2ce5114dc2ab91bab360e0021f6391828658ce',
    source: 'pinned list (API digest recorded 2026-08-21; pre-immutability release)',
  },
  {
    tag: 'v0.7.1',
    asset: ASSET,
    sha256: 'b57d367682ec8e0c63ebcb66ac2ce5114dc2ab91bab360e0021f6391828658ce',
    source: 'pinned list (API digest recorded 2026-08-21; pre-immutability release)',
  },
];

/**
 * The committed descriptor's own expectation: when it names a release tag,
 * that release's content.db must carry the reviewed databaseSha256.
 * `allowUnpublished` covers the descriptor-merge-to-tag-push window.
 */
export function expectationsFromDescriptor(descriptor) {
  const tag = descriptor.release?.tag;
  if (!tag) return [];
  return [
    {
      tag,
      asset: ASSET,
      sha256: descriptor.databaseSha256,
      source: 'committed descriptor',
      allowUnpublished: true,
    },
  ];
}

/**
 * Pure comparison seam. `releases` is the GitHub API shape:
 * [{ tag_name, draft, assets: [{ name, digest, size }] }].
 * Returns { failures, lines }: `lines` is the full human-readable table
 * (both halves of every comparison), `failures` the red subset.
 */
export function compareReleaseDigests(expectations, releases) {
  const byTag = new Map(releases.map((release) => [release.tag_name, release]));
  const failures = [];
  const lines = [];

  for (const expectation of expectations) {
    const { tag, asset, sha256, source, allowUnpublished } = expectation;
    const release = byTag.get(tag);
    if (!release) {
      if (allowUnpublished) {
        lines.push(
          `PENDING  ${tag} ${asset}: no release at this tag yet (${source}); ` +
            'expected between descriptor merge and tag push — verify after the tag lands.',
        );
        continue;
      }
      const failure =
        `${tag} ${asset}: release not found via the API but expected (${source}) — ` +
        'a published release has vanished or been renamed.';
      failures.push(failure);
      lines.push(`RED      ${failure}`);
      continue;
    }
    const found = release.assets?.find((entry) => entry.name === asset);
    if (!found) {
      const failure =
        `${tag} ${asset}: asset missing from the release (${source}) — ` +
        `assets present: ${(release.assets ?? []).map((entry) => entry.name).join(', ') || '(none)'}.`;
      failures.push(failure);
      lines.push(`RED      ${failure}`);
      continue;
    }
    const digest = typeof found.digest === 'string' ? found.digest.replace(/^sha256:/, '') : null;
    if (!digest) {
      const failure =
        `${tag} ${asset}: the API serves no sha256 digest for this asset (${source}) — ` +
        'the check cannot run, which is a failure with a reason, never a pass.';
      failures.push(failure);
      lines.push(`RED      ${failure}`);
      continue;
    }
    if (digest !== sha256) {
      const failure =
        `${tag} ${asset}: digest mismatch (${source})\n` +
        `           expected sha256: ${sha256}\n` +
        `           API      sha256: ${digest}\n` +
        '           The published bytes are not the reviewed bytes — tamper or mix-up; ' +
        'investigate against git history and the mint run; never edit the pin to match.';
      failures.push(failure);
      lines.push(`RED      ${failure}`);
      continue;
    }
    lines.push(`OK       ${tag} ${asset}: sha256 ${digest} (${source}${release.draft ? '; draft' : ''})`);
  }

  return { failures, lines };
}

async function fetchReleases() {
  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': 'release-integrity-sentinel',
  };
  if (process.env.GH_TOKEN) headers.authorization = `Bearer ${process.env.GH_TOKEN}`;
  const response = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`, {
    headers,
  });
  if (!response.ok) {
    throw new Error(`GitHub API HTTP ${response.status} ${response.statusText} listing releases`);
  }
  return response.json();
}

async function main() {
  const descriptorPath =
    process.env.RELEASE_INTEGRITY_DESCRIPTOR_PATH ?? 'artifacts/content-artifact.json';
  const descriptor = JSON.parse(readFileSync(descriptorPath, 'utf8'));
  const expectations = [...KNOWN_RELEASE_DIGESTS, ...expectationsFromDescriptor(descriptor)];
  const releases = await fetchReleases();

  const { failures, lines } = compareReleaseDigests(expectations, releases);
  for (const line of lines) console.log(line);

  if (failures.length > 0) {
    console.error(
      `\nRELEASE INTEGRITY RED: ${failures.length} of ${expectations.length} expectations failed.`,
    );
    process.exit(1);
  }
  console.log(`\nRELEASE INTEGRITY OK: ${expectations.length} expectations verified.`);
}

// Importable for tests without side effects; executable as a script.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
