import { describe, expect, it } from 'vitest';

import { releaseTagFor, validateArtifactDescriptor } from '../src/descriptor.js';

const DESCRIPTOR = {
  schemaVersion: '6',
  engineVersion: '0.9.0',
  corpusFingerprint: '1'.repeat(64),
  layerFingerprint: '2'.repeat(64),
  databaseSha256: '3'.repeat(64),
  databaseBytes: 1,
  translations: [{ code: 'WEB', name: 'World English Bible', verseCount: 31_098 }],
};

describe('artifact descriptor validation', () => {
  it('rejects null, arrays, and malformed load-bearing fields', () => {
    expect(() => validateArtifactDescriptor(null)).toThrow('must be a JSON object');
    expect(() => validateArtifactDescriptor([])).toThrow('must be a JSON object');
    expect(() => validateArtifactDescriptor({ ...DESCRIPTOR, databaseSha256: null })).toThrow('databaseSha256');
    expect(() => validateArtifactDescriptor({ ...DESCRIPTOR, translations: [{}] })).toThrow('translations[0].code');
    expect(() => validateArtifactDescriptor({ ...DESCRIPTOR, stale: [] })).toThrow('stale must be an object');
  });

  it('preserves only validated fields the workbench consumes', () => {
    expect(validateArtifactDescriptor({ ...DESCRIPTOR, ignoredReleaseMetadata: { future: true } })).toEqual(DESCRIPTOR);
  });

  it('accepts a well-formed release block and keeps only its tag', () => {
    expect(
      validateArtifactDescriptor({ ...DESCRIPTOR, release: { tag: 'artifact/2026-08-14', mintedBy: 'run-7' } }),
    ).toEqual({ ...DESCRIPTOR, release: { tag: 'artifact/2026-08-14' } });
  });

  it('rejects malformed release blocks — the tag becomes a download URL', () => {
    expect(() => validateArtifactDescriptor({ ...DESCRIPTOR, release: [] })).toThrow('release must be an object');
    expect(() => validateArtifactDescriptor({ ...DESCRIPTOR, release: {} })).toThrow('release.tag');
    expect(() => validateArtifactDescriptor({ ...DESCRIPTOR, release: { tag: '' } })).toThrow('release.tag');
    expect(() => validateArtifactDescriptor({ ...DESCRIPTOR, release: { tag: '-v0.9.0' } })).toThrow('release.tag');
    expect(() => validateArtifactDescriptor({ ...DESCRIPTOR, release: { tag: 'v0.9.0 beta' } })).toThrow('release.tag');
  });
});

describe('releaseTagFor', () => {
  it('uses the descriptor release tag when present', () => {
    expect(releaseTagFor(validateArtifactDescriptor({ ...DESCRIPTOR, release: { tag: 'artifact/2026-08-14' } }))).toBe(
      'artifact/2026-08-14',
    );
  });

  it('falls back to v{engineVersion} for descriptors minted before the field existed', () => {
    expect(releaseTagFor(validateArtifactDescriptor(DESCRIPTOR))).toBe('v0.9.0');
  });
});
