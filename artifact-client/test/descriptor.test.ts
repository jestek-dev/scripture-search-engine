/**
 * Descriptor verification — the consumer-side half of the pin
 * (plan P7.3 / CO-6). These mirror and extend the workbench's original
 * descriptor tests at the extraction site, so the shared implementation is
 * pinned where consumers get it from.
 */

import { describe, expect, it } from 'vitest';

import {
  artifactDownloadUrl,
  releaseTagFor,
  validateArtifactDescriptor,
} from '../src/descriptor.js';

const valid = {
  schemaVersion: '6',
  engineVersion: '0.7.1',
  corpusFingerprint: 'a'.repeat(64),
  layerFingerprint: 'b'.repeat(64),
  databaseSha256: 'c'.repeat(64),
  databaseBytes: 123_456,
  translations: [{ code: 'web', name: 'World English Bible', verseCount: 31_098 }],
};

describe('validateArtifactDescriptor', () => {
  it('accepts a well-formed descriptor and preserves the load-bearing fields', () => {
    const descriptor = validateArtifactDescriptor(valid);
    expect(descriptor.engineVersion).toBe('0.7.1');
    expect(descriptor.databaseSha256).toBe('c'.repeat(64));
    expect(descriptor.release).toBeUndefined();
  });

  it('accepts and preserves release.tag and stale', () => {
    const descriptor = validateArtifactDescriptor({
      ...valid,
      release: { tag: 'artifact/2026-08-22' },
      stale: { since: '2026-08-22', reason: 'testing', blocksRelease: true },
    });
    expect(descriptor.release?.tag).toBe('artifact/2026-08-22');
    expect(descriptor.stale?.blocksRelease).toBe(true);
  });

  it('refuses non-objects, bad digests, bad sizes and malformed tags', () => {
    expect(() => validateArtifactDescriptor(null)).toThrow('must be a JSON object');
    expect(() => validateArtifactDescriptor([])).toThrow('must be a JSON object');
    expect(() => validateArtifactDescriptor({ ...valid, databaseSha256: 'C'.repeat(64) })).toThrow(
      'databaseSha256',
    );
    expect(() => validateArtifactDescriptor({ ...valid, databaseBytes: 0 })).toThrow('databaseBytes');
    expect(() => validateArtifactDescriptor({ ...valid, databaseBytes: 1.5 })).toThrow('databaseBytes');
    expect(() => validateArtifactDescriptor({ ...valid, release: { tag: '../evil' } })).toThrow(
      'release.tag',
    );
    expect(() => validateArtifactDescriptor({ ...valid, translations: 'web' })).toThrow(
      'translations',
    );
  });
});

describe('releaseTagFor', () => {
  it('uses release.tag when present', () => {
    expect(releaseTagFor(validateArtifactDescriptor({ ...valid, release: { tag: 'artifact/x' } }))).toBe(
      'artifact/x',
    );
  });

  it('falls back to v{engineVersion} for pre-field descriptors', () => {
    expect(releaseTagFor(validateArtifactDescriptor(valid))).toBe('v0.7.1');
  });
});

describe('artifactDownloadUrl', () => {
  it('resolves the canonical release-asset URL', () => {
    expect(artifactDownloadUrl(validateArtifactDescriptor(valid))).toBe(
      'https://github.com/jestek-dev/scripture-search-engine/releases/download/v0.7.1/content.db',
    );
  });
});
