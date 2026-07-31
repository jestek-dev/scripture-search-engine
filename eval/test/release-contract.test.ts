/**
 * The two things a consumer pins: the package version, and the descriptor.
 *
 * Both had drifted before this test existed. `package.json` said 0.1.0 while
 * ENGINE_VERSION said 0.7.0 — consumers are told to pin "engine semver" and
 * there were two candidates. And the descriptor had grown fields Maskil does
 * not read while lacking several it requires, so an artifact this repo called
 * releasable would have been rejected on open.
 *
 * Neither failure is visible from inside this repo: everything here passes
 * regardless. Only a consumer finds out, at integration time.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ENGINE_VERSION } from '@jestek-dev/scripture-engine';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const SHA256 = /^[0-9a-f]{64}$/;

describe('published package version', () => {
  it('matches ENGINE_VERSION', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'engine', 'package.json'), 'utf8')) as {
      version: string;
    };
    expect(
      pkg.version,
      'engine/package.json and ENGINE_VERSION must agree — a consumer pinning ' +
        '"engine semver" has to have exactly one number to pin',
    ).toBe(ENGINE_VERSION);
  });
});

describe('published package metadata', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'engine', 'package.json'), 'utf8')) as {
    repository?: { type?: string; url?: string; directory?: string };
  };

  it('declares the repository it is built from', () => {
    // Trusted publishing signs a provenance statement naming the repository
    // the build came from, and npm REFUSES the publish unless package.json
    // makes the same claim. v0.7.1 failed exactly here — after authenticating
    // and after writing to Sigstore's transparency log — because this field
    // was absent.
    expect(pkg.repository?.url).toBe(
      'git+https://github.com/jestek-dev/scripture-search-engine.git',
    );
    // The package lives in a workspace, not at the repository root.
    expect(pkg.repository?.directory).toBe('engine');
  });
});

describe('release descriptor satisfies the consumer contract', () => {
  const descriptor = JSON.parse(
    readFileSync(join(ROOT, 'artifacts', 'content-artifact.json'), 'utf8'),
  ) as Record<string, unknown>;

  it('declares its own format version, separately from the database schema', () => {
    // A consumer must distinguish "I do not understand this descriptor" from
    // "I do not support that database"; the remedies are different.
    expect(descriptor['formatVersion']).toBe(1);
    expect(typeof descriptor['schemaVersion']).toBe('string');
  });

  it('carries all three supply-chain identities', () => {
    // Which file, which scripture text, which sources. Each can change without
    // the others, and a consumer needs to tell those cases apart.
    expect(descriptor['databaseSha256']).toMatch(SHA256);
    expect(descriptor['corpusFingerprint']).toMatch(SHA256);
    expect(descriptor['manifestFingerprint']).toMatch(SHA256);
  });

  it('carries the layer fingerprint, without which reproducibility is unverifiable', () => {
    // Editing one concept changes rankings while every other identity stays
    // the same. A consumer that cannot see this cannot tell whether a cached
    // result is still valid.
    expect(descriptor['layerFingerprint']).toMatch(SHA256);
  });

  it('states the tier it may be distributed at', () => {
    expect(['public_distribution', 'private_local', 'dev_fixture']).toContain(
      descriptor['distributionTier'],
    );
  });

  it('describes each translation well enough to verify it independently', () => {
    const translations = descriptor['translations'] as {
      code: string;
      name: string;
      sourceSha256: string;
      verseCount: number;
    }[];
    expect(translations.length).toBeGreaterThan(0);
    for (const translation of translations) {
      expect(translation.code).toBeTruthy();
      expect(translation.name).toBeTruthy();
      expect(translation.sourceSha256).toMatch(SHA256);
      expect(translation.verseCount).toBeGreaterThan(0);
    }
  });

  it('publishes row counts a consumer can check on open', () => {
    // A hash proves the file is intact. It cannot prove the file was built
    // from a complete import — these can.
    const counts = descriptor['rowCounts'] as Record<string, number>;
    for (const key of ['books', 'bookAliases', 'translations', 'verses', 'indexedVerses']) {
      expect(counts[key], `rowCounts.${key} missing`).toBeGreaterThan(0);
    }
    expect(counts['books']).toBe(66);
    // Every verse must be searchable; a shortfall means a half-built index,
    // which no checksum would reveal.
    expect(counts['indexedVerses']).toBe(counts['verses']);
  });

  it('reports the engine version it was built by', () => {
    expect(descriptor['engineVersion']).toBe(ENGINE_VERSION);
  });

  it('records the build time, without which the artifact cannot be reproduced', () => {
    // built_at is stamped into the database's meta table, so it lands in the
    // bytes and in databaseSha256. A rebuild can only reproduce the checksum
    // if it knows this value — pass it with `--built-at`. Without it recorded,
    // "rebuild and compare" verifies nothing, which is how the release
    // workflow would have failed on its first real run.
    expect(descriptor['builtAt']).toMatch(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/);
  });
});
