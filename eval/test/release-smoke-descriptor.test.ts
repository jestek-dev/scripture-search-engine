/**
 * The smoke script's committed-descriptor cross-check (plan P2.3 / RH-2).
 *
 * Hole this closes: release-smoke.mjs downloaded BOTH content.db and
 * content-artifact.json from the release URL and verified them against each
 * other — self-consistency. A post-promotion swap of both assets passed smoke;
 * only a consumer holding the committed descriptor would have caught it.
 * (Before the fix, this file failed at import: the script exported no
 * comparison at all — the check could not fail because it did not exist.)
 *
 * The fix chains: committed descriptor (reviewed in a PR) ⇒ release-served
 * descriptor ⇒ release-served bytes. No link self-referential. This test pins
 * the middle link: field-list equality on the identity-bearing fields, with
 * both values reported on any mismatch (the repo's established
 * both-halves-of-the-comparison convention).
 *
 * Field-list rather than full-file equality, deliberately: a re-serialized
 * copy attached to release notes (whitespace, key order, an added comment
 * field) must not fail the release, but a single identity field differing
 * must.
 */

import { describe, expect, it } from 'vitest';

import {
  IDENTITY_FIELDS,
  compareDescriptorIdentity,
} from '../../.github/scripts/release-smoke.mjs';

/** A fully-populated descriptor whose identity fields are all distinct. */
function descriptor(): Record<string, unknown> {
  return {
    formatVersion: 1,
    schemaVersion: '6',
    engineVersion: '0.9.0',
    tokenizerVersion: '1.0.0',
    corpusFingerprint: 'a'.repeat(64),
    layerFingerprint: 'b'.repeat(64),
    manifestFingerprint: 'c'.repeat(64),
    databaseSha256: 'd'.repeat(64),
    databaseBytes: 137412608,
    release: { tag: 'v0.9.0' },
    builtAt: '2026-08-21T00:00:00.000Z',
  };
}

describe('IDENTITY_FIELDS', () => {
  it('covers exactly the identity-bearing fields RH-2 names', () => {
    expect([...IDENTITY_FIELDS].sort()).toEqual(
      [
        'databaseSha256',
        'databaseBytes',
        'schemaVersion',
        'engineVersion',
        'tokenizerVersion',
        'corpusFingerprint',
        'layerFingerprint',
        'manifestFingerprint',
        'release.tag',
      ].sort(),
    );
  });
});

describe('compareDescriptorIdentity', () => {
  it('reports no mismatches for a matching pair', () => {
    expect(compareDescriptorIdentity(descriptor(), descriptor())).toEqual([]);
  });

  it('ignores non-identity differences (re-serialized copies must not fail a release)', () => {
    const served = descriptor();
    served.builtAt = '2026-08-22T12:34:56.000Z';
    served.perTableBytes = { verses: 4096 };
    expect(compareDescriptorIdentity(descriptor(), served)).toEqual([]);
  });

  it('fails a databaseSha256-only mismatch, naming the field with both values', () => {
    const served = descriptor();
    served.databaseSha256 = 'e'.repeat(64);
    const mismatches = compareDescriptorIdentity(descriptor(), served);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]).toEqual({
      field: 'databaseSha256',
      committed: 'd'.repeat(64),
      served: 'e'.repeat(64),
    });
  });

  it('compares release.tag through the nested path', () => {
    const served = descriptor();
    (served.release as { tag: string }).tag = 'v9.9.9';
    const mismatches = compareDescriptorIdentity(descriptor(), served);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]?.field).toBe('release.tag');
    expect(mismatches[0]?.committed).toBe('v0.9.0');
    expect(mismatches[0]?.served).toBe('v9.9.9');
  });

  it('treats a missing release block as a mismatch when the committed side names a tag', () => {
    const served = descriptor();
    delete served.release;
    const mismatches = compareDescriptorIdentity(descriptor(), served);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]?.field).toBe('release.tag');
    expect(mismatches[0]?.served).toBeUndefined();
  });

  it('treats release.tag absent on BOTH sides as equal (pre-release.tag descriptors)', () => {
    const committed = descriptor();
    const served = descriptor();
    delete committed.release;
    delete served.release;
    expect(compareDescriptorIdentity(committed, served)).toEqual([]);
  });

  it('reports every differing field, not just the first', () => {
    const served = descriptor();
    served.databaseSha256 = 'e'.repeat(64);
    served.databaseBytes = 1;
    served.corpusFingerprint = 'f'.repeat(64);
    const fields = compareDescriptorIdentity(descriptor(), served).map((m) => m.field);
    expect(fields.sort()).toEqual(['corpusFingerprint', 'databaseBytes', 'databaseSha256'].sort());
  });
});
