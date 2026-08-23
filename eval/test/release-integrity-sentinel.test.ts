/**
 * The scheduled release-integrity sentinel (plan P2.3 / RH-2, hole 3's
 * tripwire). GitHub's API serves a per-asset sha256 `digest`; the sentinel
 * compares it against the reviewed identity for every published release we
 * have an expectation for — one API call, no 123 MB download. Red = tamper
 * or operational mix-up (the v0.7.1 defect class).
 *
 * These tests feed the pure comparison seam doctored fixtures to prove the
 * alarm rings: a digest mismatch reds naming both hashes; a vanished release
 * or asset reds; a matching set is green. Gate discipline: an expectation
 * the API cannot answer is a failure with a reason, never a silent pass.
 */

import { describe, expect, it } from 'vitest';

import {
  KNOWN_RELEASE_DIGESTS,
  compareReleaseDigests,
  expectationsFromDescriptor,
} from '../../.github/scripts/release-integrity.mjs';

const SHA_A = '1'.repeat(64);
const SHA_B = '2'.repeat(64);

function release(tag: string, sha: string, { draft = false, asset = 'content.db' } = {}) {
  return {
    tag_name: tag,
    draft,
    assets: [{ name: asset, digest: `sha256:${sha}`, size: 100 }],
  };
}

describe('KNOWN_RELEASE_DIGESTS', () => {
  it('pins the two pre-immutability releases to the digest recorded from the live API', () => {
    const byTag = new Map(KNOWN_RELEASE_DIGESTS.map((entry) => [entry.tag, entry.sha256]));
    // Both published releases ship the same schema-5 content.db; digests
    // recorded from the GitHub API on 2026-08-21.
    const published = 'b57d367682ec8e0c63ebcb66ac2ce5114dc2ab91bab360e0021f6391828658ce';
    expect(byTag.get('v0.7.0')).toBe(published);
    expect(byTag.get('v0.7.1')).toBe(published);
  });
});

describe('expectationsFromDescriptor', () => {
  it('yields one expectation when the committed descriptor names a release tag', () => {
    const expectations = expectationsFromDescriptor({
      release: { tag: 'v0.9.0' },
      databaseSha256: SHA_A,
    });
    expect(expectations).toEqual([
      {
        tag: 'v0.9.0',
        asset: 'content.db',
        sha256: SHA_A,
        source: 'committed descriptor',
        allowUnpublished: true,
      },
    ]);
  });

  it('yields nothing for a descriptor without release.tag (pre-v0.9.0 state)', () => {
    expect(expectationsFromDescriptor({ databaseSha256: SHA_A })).toEqual([]);
  });
});

describe('compareReleaseDigests', () => {
  const pin = (overrides = {}) => ({
    tag: 'v1.0.0',
    asset: 'content.db',
    sha256: SHA_A,
    source: 'pinned list',
    ...overrides,
  });

  it('is green when every expected digest matches', () => {
    const { failures, lines } = compareReleaseDigests([pin()], [release('v1.0.0', SHA_A)]);
    expect(failures).toEqual([]);
    expect(lines.join('\n')).toContain('v1.0.0');
    expect(lines.join('\n')).toContain('OK');
  });

  it('reds on a digest mismatch, naming both hashes', () => {
    const { failures } = compareReleaseDigests([pin()], [release('v1.0.0', SHA_B)]);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain(SHA_A);
    expect(failures[0]).toContain(SHA_B);
    expect(failures[0]).toContain('v1.0.0');
  });

  it('reds when a pinned release has vanished', () => {
    const { failures } = compareReleaseDigests([pin()], []);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('v1.0.0');
  });

  it('reds when the asset is missing from the release', () => {
    const { failures } = compareReleaseDigests(
      [pin()],
      [release('v1.0.0', SHA_A, { asset: 'other.bin' })],
    );
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('content.db');
  });

  it('reds when the API serves no digest for the asset (an unanswerable check is a failure, not a pass)', () => {
    const { failures } = compareReleaseDigests(
      [pin()],
      [{ tag_name: 'v1.0.0', draft: false, assets: [{ name: 'content.db', digest: null, size: 1 }] }],
    );
    expect(failures).toHaveLength(1);
  });

  it('treats a descriptor expectation with no published release as pending, not red (the descriptor-merge-to-tag-push window)', () => {
    const { failures, lines } = compareReleaseDigests([pin({ allowUnpublished: true })], []);
    expect(failures).toEqual([]);
    expect(lines.join('\n')).toContain('PENDING');
  });

  it('still verifies a draft-only release digest for an allowUnpublished expectation when the token can see it', () => {
    const { failures } = compareReleaseDigests(
      [pin({ allowUnpublished: true })],
      [release('v1.0.0', SHA_B, { draft: true })],
    );
    expect(failures).toHaveLength(1);
  });
});
