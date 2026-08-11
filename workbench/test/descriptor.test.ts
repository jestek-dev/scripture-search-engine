import { describe, expect, it } from 'vitest';

import { validateArtifactDescriptor } from '../src/descriptor.js';

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
});
