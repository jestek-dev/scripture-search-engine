/**
 * The mint workflow drives buildArtifact.ts entirely through its CLI, so the
 * flag contract IS release machinery: a flag that silently mis-parses mints
 * an artifact nobody asked for. Parsing is extracted and tested here without
 * running a build.
 */

import { describe, expect, it } from 'vitest';

import { assertValidReleaseTag, parseBuildArtifactArgv } from '../src/buildArtifact.js';

describe('parseBuildArtifactArgv', () => {
  it('parses every flag the mint workflow uses', () => {
    expect(
      parseBuildArtifactArgv([
        '--out',
        'output/content.db',
        '--built-at',
        '2026-08-15T00:00:00.000Z',
        '--release-tag',
        'v0.9.0',
      ]),
    ).toEqual({
      outPath: 'output/content.db',
      includeLayerB: true,
      builtAt: '2026-08-15T00:00:00.000Z',
      releaseTag: 'v0.9.0',
    });
  });

  it('defaults everything when no flags are given', () => {
    expect(parseBuildArtifactArgv([])).toEqual({
      outPath: undefined,
      includeLayerB: true,
      builtAt: undefined,
      releaseTag: undefined,
    });
  });

  it('turns off Layer B with --no-layer-b', () => {
    expect(parseBuildArtifactArgv(['--no-layer-b']).includeLayerB).toBe(false);
  });

  it('accepts an artifact-only refresh tag with a slash', () => {
    expect(parseBuildArtifactArgv(['--release-tag', 'artifact/2026-08-14']).releaseTag).toBe(
      'artifact/2026-08-14',
    );
  });

  it('refuses a flag whose value is missing or swallowed by the next flag', () => {
    expect(() => parseBuildArtifactArgv(['--release-tag'])).toThrow('--release-tag requires a value');
    expect(() => parseBuildArtifactArgv(['--built-at', '--no-layer-b'])).toThrow(
      '--built-at requires a value',
    );
    expect(() => parseBuildArtifactArgv(['--out'])).toThrow('--out requires a value');
  });

  it('refuses a tag that could not survive a URL or gh invocation', () => {
    expect(() => parseBuildArtifactArgv(['--release-tag', '-v0.9.0'])).toThrow('invalid');
    expect(() => parseBuildArtifactArgv(['--release-tag', 'v0.9.0 beta'])).toThrow('invalid');
  });
});

describe('assertValidReleaseTag', () => {
  it('accepts the two tag shapes the plan names', () => {
    expect(() => assertValidReleaseTag('v0.9.0')).not.toThrow();
    expect(() => assertValidReleaseTag('artifact/2026-08-14')).not.toThrow();
  });

  it('rejects leading punctuation and characters outside the safe set', () => {
    for (const tag of ['', '.hidden', '-flag', 'v0.9.0 beta', 'tag$', 'täg']) {
      expect(() => assertValidReleaseTag(tag), tag).toThrow('invalid');
    }
  });
});
