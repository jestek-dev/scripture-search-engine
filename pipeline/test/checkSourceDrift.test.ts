/**
 * The drift sentinel's verdicts.
 *
 * Each verdict authorizes a different human action — `DRIFTED` demands a
 * reviewed re-pin PR, `repacked` demands nothing, `unreachable` is somebody
 * else's outage — so a wrong verdict does not just mislabel, it misdirects.
 * The expensive wrong verdicts are tested by name: wrong bytes behind an
 * HTTP 200 (the 2026-08 failure the old reachability grep waved through),
 * a repack reported as drift (teaches checksum-editing), and an outage
 * reported as drift (teaches alarm-ignoring). The fetcher is injected so
 * every branch runs without network access.
 */

import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  checkSource,
  fatalFindings,
  REPIN_INSTRUCTION,
  type SourceDrift,
} from '../scripts/checkSourceDrift.js';
import { cachedCopyIsCurrent } from '../scripts/fetchSources.js';
import type { SourceManifest } from '../src/provenance/manifest.js';

const PINNED = Buffer.from('the pinned bytes');
const PINNED_SHA = createHash('sha256').update(PINNED).digest('hex');
const DRIFTED = Buffer.from('some later revision');
const DRIFTED_SHA = createHash('sha256').update(DRIFTED).digest('hex');
const CONTENT_FP = 'a'.repeat(64);

function manifest(overrides: Partial<SourceManifest> = {}): SourceManifest {
  return {
    id: 'rolling',
    label: 'Rolling source',
    rightsClass: 'cc_by',
    licenseRecord: 'CC BY 4.0',
    sourceUrl: 'https://example.invalid/latest.zip',
    sha256: PINNED_SHA,
    bytes: PINNED.length,
    maxTier: 'public_distribution',
    ...overrides,
  };
}

/** A fetcher scripted per URL: Buffer = 200 with body, number = status, Error = throw. */
function fetcherFor(script: Record<string, Buffer | number | Error>): typeof fetch {
  return (async (input: string | URL | Request) => {
    const url = String(input);
    const outcome = script[url];
    if (outcome === undefined) throw new Error(`unscripted URL: ${url}`);
    if (outcome instanceof Error) throw outcome;
    if (typeof outcome === 'number') return { ok: false, status: outcome } as Response;
    return {
      ok: true,
      status: 200,
      arrayBuffer: async () =>
        outcome.buffer.slice(outcome.byteOffset, outcome.byteOffset + outcome.byteLength),
    } as Response;
  }) as unknown as typeof fetch;
}

describe('drift sentinel verdicts', () => {
  it('reports pinned when upstream serves the pinned bytes', async () => {
    const report = await checkSource(manifest(), {
      fetcher: fetcherFor({ 'https://example.invalid/latest.zip': PINNED }),
    });
    expect(report.status).toBe('pinned');
    expect(fatalFindings([report])).toEqual([]);
  });

  it('reports DRIFTED, naming both hashes, when upstream serves different bytes over HTTP 200', async () => {
    // The case the old reachability grep waved through: right status code,
    // wrong bytes. Both hashes must appear so the alarm is actionable
    // without opening the manifest.
    const report = await checkSource(manifest(), {
      fetcher: fetcherFor({ 'https://example.invalid/latest.zip': DRIFTED }),
    });
    expect(report.status).toBe('DRIFTED');
    expect(report.detail).toContain(PINNED_SHA);
    expect(report.detail).toContain(DRIFTED_SHA);
    expect(fatalFindings([report])).toHaveLength(1);
  });

  it('reports repacked, not DRIFTED, when only the packaging changed on a content-pinned source', async () => {
    const report = await checkSource(manifest({ contentSha256: CONTENT_FP }), {
      fetcher: fetcherFor({ 'https://example.invalid/latest.zip': DRIFTED }),
      fingerprintArchive: () => CONTENT_FP,
    });
    expect(report.status).toBe('repacked');
    expect(fatalFindings([report])).toEqual([]);
  });

  it('reports DRIFTED when a content-pinned source changed payload, naming both fingerprints', async () => {
    const report = await checkSource(manifest({ contentSha256: CONTENT_FP }), {
      fetcher: fetcherFor({ 'https://example.invalid/latest.zip': DRIFTED }),
      fingerprintArchive: () => 'b'.repeat(64),
    });
    expect(report.status).toBe('DRIFTED');
    expect(report.detail).toContain(CONTENT_FP);
    expect(report.detail).toContain('b'.repeat(64));
    expect(fatalFindings([report])).toHaveLength(1);
  });

  it('reports DRIFTED when a content-pinned source serves bytes that will not unpack', async () => {
    const report = await checkSource(manifest({ contentSha256: CONTENT_FP }), {
      fetcher: fetcherFor({ 'https://example.invalid/latest.zip': DRIFTED }),
      fingerprintArchive: () => {
        throw new Error('End-of-central-directory signature not found');
      },
    });
    expect(report.status).toBe('DRIFTED');
    expect(fatalFindings([report])).toHaveLength(1);
  });

  it('reports unreachable — never DRIFTED — for network errors and HTTP failures', async () => {
    // An outage is a reachability finding, not evidence the bytes changed.
    // Conflating them would ring the re-pin alarm for somebody else's downtime
    // and teach people to ignore it.
    for (const outcome of [new Error('ECONNREFUSED'), 503, 404]) {
      const report = await checkSource(manifest(), {
        fetcher: fetcherFor({ 'https://example.invalid/latest.zip': outcome }),
      });
      expect(report.status).toBe('unreachable');
      expect(fatalFindings([report])).toEqual([]);
    }
  });
});

describe('archive rot', () => {
  const withArchive = manifest({ archiveUrl: 'https://example.invalid/snapshot.zip' });

  it('reports the archive pinned when it serves the exact pinned bytes', async () => {
    const report = await checkSource(withArchive, {
      fetcher: fetcherFor({
        'https://example.invalid/latest.zip': PINNED,
        'https://example.invalid/snapshot.zip': PINNED,
      }),
    });
    expect(report.archive?.status).toBe('pinned');
    expect(fatalFindings([report])).toEqual([]);
  });

  it('reports archive-rotted, fatally, when the archive serves different bytes', async () => {
    // No repack tolerance for archives: the asset is a snapshot WE uploaded
    // of the exact pinned bytes, and anything else means the only durable
    // copy is gone.
    const report = await checkSource(withArchive, {
      fetcher: fetcherFor({
        'https://example.invalid/latest.zip': PINNED,
        'https://example.invalid/snapshot.zip': DRIFTED,
      }),
    });
    expect(report.status).toBe('pinned');
    expect(report.archive?.status).toBe('archive-rotted');
    expect(report.archive?.detail).toContain(PINNED_SHA);
    expect(report.archive?.detail).toContain(DRIFTED_SHA);
    expect(fatalFindings([report])).toHaveLength(1);
  });

  it('reports archive-rotted when the host authoritatively says the asset is gone', async () => {
    const report = await checkSource(withArchive, {
      fetcher: fetcherFor({
        'https://example.invalid/latest.zip': PINNED,
        'https://example.invalid/snapshot.zip': 404,
      }),
    });
    expect(report.archive?.status).toBe('archive-rotted');
    expect(fatalFindings([report])).toHaveLength(1);
  });

  it('gives the archive the same grace as any host that fails to answer', async () => {
    for (const outcome of [new Error('ETIMEDOUT'), 503]) {
      const report = await checkSource(withArchive, {
        fetcher: fetcherFor({
          'https://example.invalid/latest.zip': PINNED,
          'https://example.invalid/snapshot.zip': outcome,
        }),
      });
      expect(report.archive?.status).toBe('unreachable');
      expect(fatalFindings([report])).toEqual([]);
    }
  });
});

describe('the alarm text', () => {
  it('forbids the in-place checksum edit and points at the documented process', () => {
    // The instruction is the sentinel's whole point: a red run that does not
    // say what NOT to do invites the one action that defeats it.
    expect(REPIN_INSTRUCTION).toContain('do NOT edit the checksum in place');
    expect(REPIN_INSTRUCTION).toContain('reviewed re-pin PR');
    expect(REPIN_INSTRUCTION).toContain('docs/source-repins.md');
  });

  it('collects one fatal line per drifted source and rotted archive', () => {
    const reports: SourceDrift[] = [
      { id: 'ok', status: 'pinned', detail: '' },
      { id: 'moved', status: 'DRIFTED', detail: 'sha mismatch' },
      {
        id: 'lost',
        status: 'pinned',
        detail: '',
        archive: { status: 'archive-rotted', detail: 'HTTP 404' },
      },
    ];
    expect(fatalFindings(reports)).toEqual(['moved: sha mismatch', 'lost (archive): HTTP 404']);
  });
});

describe('cached-copy verification (the hole the 2026-08 drift walked through)', () => {
  it('accepts a byte-identical cached copy without unpacking it', () => {
    let fingerprinted = false;
    const current = cachedCopyIsCurrent(manifest(), PINNED_SHA, () => {
      fingerprinted = true;
      return '';
    });
    expect(current).toBe(true);
    expect(fingerprinted).toBe(false);
  });

  it('rejects a byte-pinned cached copy whose bytes differ', () => {
    expect(cachedCopyIsCurrent(manifest(), DRIFTED_SHA, () => '')).toBe(false);
  });

  it('no longer treats contentSha256 presence alone as a pass', () => {
    // Regression: the old check was `sha matches OR contentSha256 exists`,
    // so a content-pinned cache slot holding ANY bytes reported `cached` —
    // which is how drifted downloads replaced the pinned July snapshots on
    // disk without a word.
    const pinned = manifest({ contentSha256: CONTENT_FP });
    expect(cachedCopyIsCurrent(pinned, DRIFTED_SHA, () => 'b'.repeat(64))).toBe(false);
  });

  it('still accepts a repacked cached archive whose payload fingerprint matches', () => {
    const pinned = manifest({ contentSha256: CONTENT_FP });
    expect(cachedCopyIsCurrent(pinned, DRIFTED_SHA, () => CONTENT_FP)).toBe(true);
  });
});
