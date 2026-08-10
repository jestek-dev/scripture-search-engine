import { describe, expect, it } from 'vitest';

import {
  checkProvenance,
  correlationGroups,
  permitsTier,
  retrievalUrls,
  rollingSourcesWithoutArchive,
  type ManifestSet,
  type SourceManifest,
} from '../src/provenance/manifest.js';

function source(overrides: Partial<SourceManifest> & { id: string }): SourceManifest {
  return {
    label: overrides.id,
    rightsClass: 'public_domain',
    licenseRecord: 'PD by age (published before 1930)',
    sourceUrl: 'https://example.invalid/artifact',
    sha256: 'a'.repeat(64),
    bytes: 1234,
    maxTier: 'public_distribution',
    ...overrides,
  };
}

describe('provenance gate (G1)', () => {
  it('rejects a row citing a source with no manifest entry', () => {
    const manifests: ManifestSet = { sources: [source({ id: 'nave' })] };
    const failures = checkProvenance({
      manifests,
      citedSourceIds: ['nave', 'mystery-corpus'],
      tier: 'public_distribution',
    });
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('mystery-corpus');
  });

  it('rejects a source with an empty license record', () => {
    const manifests: ManifestSet = { sources: [source({ id: 'nave', licenseRecord: '  ' })] };
    const failures = checkProvenance({
      manifests,
      citedSourceIds: ['nave'],
      tier: 'public_distribution',
    });
    expect(failures[0]).toContain('licenseRecord');
  });

  it('blocks a claimed-transcription source from a public build', () => {
    // The CCEL case: the underlying text is PD, but their files carry a
    // non-commercial claim, so the source is capped below public tier.
    const manifests: ManifestSet = {
      sources: [
        source({
          id: 'ccel-scan',
          rightsClass: 'pd_text_claimed_transcription',
          maxTier: 'private_local',
        }),
      ],
    };
    const failures = checkProvenance({
      manifests,
      citedSourceIds: ['ccel-scan'],
      tier: 'public_distribution',
    });
    expect(failures[0]).toContain('caps this source');
  });

  it('allows editorial entries without a checksum but still requires a license record', () => {
    const manifests: ManifestSet = {
      sources: [
        source({
          id: 'editorial',
          rightsClass: 'editorial',
          sha256: '',
          licenseRecord: 'Authored for this dataset; LH holds all rights',
        }),
      ],
    };
    expect(
      checkProvenance({
        manifests,
        citedSourceIds: ['editorial'],
        tier: 'public_distribution',
      }),
    ).toEqual([]);
  });

  it('reports every failure at once rather than stopping at the first', () => {
    const manifests: ManifestSet = { sources: [source({ id: 'ok' })] };
    const failures = checkProvenance({
      manifests,
      citedSourceIds: ['ok', 'missing-a', 'missing-b'],
      tier: 'public_distribution',
    });
    expect(failures).toHaveLength(2);
  });

  it('honors tier ranking', () => {
    const fixture = source({ id: 'fixture', maxTier: 'dev_fixture' });
    expect(permitsTier(fixture, 'dev_fixture')).toBe(true);
    expect(permitsTier(fixture, 'public_distribution')).toBe(false);
  });
});

describe('correlation groups (G7 input)', () => {
  it('groups sources transitively through declared lineage', () => {
    const manifests: ManifestSet = {
      sources: [
        source({ id: 'tsk' }),
        source({ id: 'openbible-xrefs', derivedFrom: ['tsk'] }),
        source({ id: 'sermon-co-citations', derivedFrom: ['tsk'] }),
        source({ id: 'nave' }),
      ],
    };
    expect(correlationGroups(manifests)).toEqual([
      ['openbible-xrefs', 'sermon-co-citations', 'tsk'],
    ]);
  });

  it('returns no group for independent sources', () => {
    const manifests: ManifestSet = {
      sources: [source({ id: 'nave' }), source({ id: 'web-bible' })],
    };
    expect(correlationGroups(manifests)).toEqual([]);
  });
});

describe('rolling sources and durable archives (G1)', () => {
  it('names a rolling source that has no archive of the pinned bytes', () => {
    const manifests: ManifestSet = {
      sources: [
        source({ id: 'rolling-no-archive', rollingSourceUrl: true }),
        source({ id: 'stable' }),
      ],
    };
    expect(rollingSourcesWithoutArchive(manifests)).toEqual(['rolling-no-archive']);
  });

  it('accepts a rolling source once an archive is recorded', () => {
    const manifests: ManifestSet = {
      sources: [
        source({
          id: 'rolling',
          rollingSourceUrl: true,
          archiveUrl: 'https://example.invalid/releases/snapshot.zip',
        }),
      ],
    };
    expect(rollingSourcesWithoutArchive(manifests)).toEqual([]);
  });

  it('treats a blank archiveUrl as absent rather than as a record', () => {
    const manifests: ManifestSet = {
      sources: [source({ id: 'rolling', rollingSourceUrl: true, archiveUrl: '   ' })],
    };
    expect(rollingSourcesWithoutArchive(manifests)).toEqual(['rolling']);
  });

  it('leaves a non-rolling source alone even without an archive', () => {
    const manifests: ManifestSet = { sources: [source({ id: 'stable' })] };
    expect(rollingSourcesWithoutArchive(manifests)).toEqual([]);
  });

  it('tries the authoritative URL before the archive', () => {
    const withArchive = source({
      id: 'rolling',
      sourceUrl: 'https://example.invalid/latest.zip',
      archiveUrl: 'https://example.invalid/pinned.zip',
    });
    expect(retrievalUrls(withArchive)).toEqual([
      'https://example.invalid/latest.zip',
      'https://example.invalid/pinned.zip',
    ]);
    expect(retrievalUrls(source({ id: 'plain' }))).toEqual(['https://example.invalid/artifact']);
  });
});
