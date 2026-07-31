/**
 * The fetch script must save every source under the name the build looks for.
 *
 * This is a regression test for a failure that did not announce itself. The
 * script derived filenames from the URL's last segment, so Gutenberg's
 * `pg7925.txt` and the Archive's `_djvu.txt` suffixes landed on disk under
 * names the registry does not know. The build then skipped six of eleven
 * expositors and produced 20,000 fewer terms — no error, no warning, just a
 * quieter corpus. A missing optional source looks exactly like one that was
 * never registered.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { EXPOSITION_SOURCES } from '../src/expositionSources.js';
import { fileNameFor, UNPACK } from '../scripts/fetchSources.js';
import type { SourceManifest } from '../src/provenance/manifest.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function manifests(): SourceManifest[] {
  return readdirSync(join(ROOT, 'manifests'))
    .filter((name) => name.endsWith('.json'))
    .map(
      (name) => JSON.parse(readFileSync(join(ROOT, 'manifests', name), 'utf8')) as SourceManifest,
    );
}

describe('source registry and manifests agree', () => {
  it('every exposition source has a manifest', () => {
    const ids = new Set(manifests().map((manifest) => manifest.id));
    for (const spec of EXPOSITION_SOURCES) {
      expect(ids, `no manifest for source "${spec.id}"`).toContain(spec.id);
    }
  });

  it('every archive-shaped source has an unpack rule', () => {
    // Without one the archive lands on disk and is never expanded, and the
    // build reports a missing source while the file is plainly there.
    for (const spec of EXPOSITION_SOURCES) {
      if (spec.strategy !== 'sword-zcom') continue;
      expect(Object.keys(UNPACK), `no unpack rule for "${spec.id}"`).toContain(spec.id);
    }
  });

  it('every content-fingerprinted manifest names a real payload location', () => {
    for (const manifest of manifests()) {
      if (!manifest.contentSha256) continue;
      const known =
        manifest.id === 'web' || EXPOSITION_SOURCES.some((spec) => spec.id === manifest.id);
      expect(known, `${manifest.id} pins contentSha256 but nothing knows where it unpacks`).toBe(
        true,
      );
    }
  });

  it('saves each source under the exact name the build reads, case included', () => {
    // Regression: the download name came from the URL's basename, so
    // Clarke.zip landed on disk while buildArtifact looked for clarke.zip.
    // Identical on macOS, fatal on Linux — the class of bug a case-insensitive
    // filesystem hides from every local test run.
    for (const spec of EXPOSITION_SOURCES) {
      const expected = spec.strategy === 'sword-zcom' ? `${spec.file}.zip` : spec.file;
      const manifest = manifests().find((entry) => entry.id === spec.id);
      expect(manifest, `no manifest for ${spec.id}`).toBeDefined();
      expect(fileNameFor(manifest!)).toBe(expected);
    }
  });

  it('sword modules declare a directory, plain sources declare a filename', () => {
    for (const spec of EXPOSITION_SOURCES) {
      if (spec.strategy === 'sword-zcom') {
        expect(spec.file, `${spec.id} is a module directory, not a file`).not.toMatch(/\.\w+$/);
      } else {
        expect(spec.file, `${spec.id} should name a file`).toMatch(/\.\w+$/);
      }
    }
  });
});
