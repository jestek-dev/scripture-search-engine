/**
 * The retrieval-candidate loop.
 *
 * This is the only branching logic in fetchSources and the place a silent
 * failure would be most expensive: a loop that accepts wrong bytes makes every
 * checksum in the repo decorative. The fetcher is injected so the branches are
 * testable without network access.
 */

import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { selectCandidate } from '../scripts/fetchSources.js';
import type { SourceManifest } from '../src/provenance/manifest.js';

const PINNED = Buffer.from('the pinned bytes');
const PINNED_SHA = createHash('sha256').update(PINNED).digest('hex');
const OTHER = Buffer.from('some later revision');

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

describe('retrieval candidate selection', () => {
  it('accepts the authoritative URL when its bytes match', async () => {
    const result = await selectCandidate(
      manifest(),
      fetcherFor({ 'https://example.invalid/latest.zip': PINNED }),
    );
    expect(result.bytes?.equals(PINNED)).toBe(true);
    expect(result.usedFallback).toBe(false);
  });

  it('falls back to the archive when the authoritative URL has drifted', async () => {
    const result = await selectCandidate(
      manifest({ archiveUrl: 'https://example.invalid/pinned.zip' }),
      fetcherFor({
        'https://example.invalid/latest.zip': OTHER,
        'https://example.invalid/pinned.zip': PINNED,
      }),
    );
    expect(result.bytes?.equals(PINNED)).toBe(true);
    // The caller reports drift off this flag; without it a republish upstream
    // would pass silently.
    expect(result.usedFallback).toBe(true);
  });

  it('falls back when the authoritative URL is unreachable or errors', async () => {
    for (const outcome of [503, new Error('ECONNREFUSED')]) {
      const result = await selectCandidate(
        manifest({ archiveUrl: 'https://example.invalid/pinned.zip' }),
        fetcherFor({
          'https://example.invalid/latest.zip': outcome,
          'https://example.invalid/pinned.zip': PINNED,
        }),
      );
      expect(result.bytes?.equals(PINNED)).toBe(true);
      expect(result.usedFallback).toBe(true);
    }
  });

  it('REJECTS an archive whose bytes are not the pinned ones', async () => {
    // The failure that would make the whole mechanism a lie: a "durable
    // archive" of the wrong week's download.
    const result = await selectCandidate(
      manifest({ archiveUrl: 'https://example.invalid/pinned.zip' }),
      fetcherFor({
        'https://example.invalid/latest.zip': OTHER,
        'https://example.invalid/pinned.zip': OTHER,
      }),
    );
    expect(result.bytes).toBeNull();
  });

  it('reports both expected and actual checksums so the operator can act', async () => {
    const result = await selectCandidate(
      manifest(),
      fetcherFor({ 'https://example.invalid/latest.zip': OTHER }),
    );
    const otherSha = createHash('sha256').update(OTHER).digest('hex');
    expect(result.attempts.join('\n')).toContain(PINNED_SHA);
    expect(result.attempts.join('\n')).toContain(otherSha);
  });

  it('names every candidate tried, in order', async () => {
    const result = await selectCandidate(
      manifest({ archiveUrl: 'https://example.invalid/pinned.zip' }),
      fetcherFor({
        'https://example.invalid/latest.zip': 404,
        'https://example.invalid/pinned.zip': 500,
      }),
    );
    expect(result.bytes).toBeNull();
    expect(result.attempts).toHaveLength(2);
    expect(result.attempts[0]).toContain('latest.zip');
    expect(result.attempts[1]).toContain('pinned.zip');
  });

  it('accepts a repacked archive for a content-fingerprinted source', async () => {
    // Publishers repack; for these the payload fingerprint is the admission
    // test, checked after unpacking, so byte equality must NOT gate here.
    const result = await selectCandidate(
      manifest({ contentSha256: 'f'.repeat(64) }),
      fetcherFor({ 'https://example.invalid/latest.zip': OTHER }),
    );
    expect(result.bytes?.equals(OTHER)).toBe(true);
  });

  it('trims a padded archiveUrl rather than fetching whitespace', async () => {
    const result = await selectCandidate(
      manifest({ archiveUrl: '  https://example.invalid/pinned.zip  ' }),
      fetcherFor({
        'https://example.invalid/latest.zip': 404,
        'https://example.invalid/pinned.zip': PINNED,
      }),
    );
    expect(result.bytes?.equals(PINNED)).toBe(true);
  });
});
