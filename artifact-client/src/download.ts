/**
 * Node-flavored artifact download + verification (plan P7.3 / CO-6),
 * extracted from the workbench's `fetchArtifact` reference implementation.
 *
 * The client downloads the reviewed artifact or nothing: the sha256 is
 * computed while streaming, a mismatch DELETES the download and throws, and
 * the file only appears at its final path after verification (write to
 * `.partial`, rename on success) — a crashed download can never be mistaken
 * for a verified artifact.
 *
 * Uses Node's global fetch. Behind a TLS-intercepting proxy, point
 * NODE_EXTRA_CA_CERTS at the proxy's CA bundle — never disable TLS
 * verification.
 *
 * React Native consumers: this module needs Node (`node:fs`, streams). Use
 * `artifactDownloadUrl` from `./descriptor.js` with the platform downloader,
 * then verify the digest against `descriptor.databaseSha256` before opening.
 */

import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { artifactDownloadUrl, type ArtifactDescriptor } from './descriptor.js';

/** sha256 of a file on disk, streaming — for re-verifying an existing artifact at startup. */
export function sha256OfFile(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    createReadStream(file)
      .on('data', (chunk) => hash.update(chunk))
      .on('error', reject)
      .on('end', () => resolve(hash.digest('hex')));
  });
}

/** Thrown when the release has no asset at the resolved URL (HTTP 404). */
export class ArtifactNotPublishedError extends Error {
  constructor(
    readonly url: string,
    readonly tag: string,
  ) {
    super(`Release asset not found (404) at ${url} — release ${tag} is not published (yet).`);
    this.name = 'ArtifactNotPublishedError';
  }
}

/** Thrown when the downloaded bytes do not hash to the reviewed descriptor. The download is already deleted. */
export class ArtifactDigestMismatchError extends Error {
  constructor(
    readonly expected: string,
    readonly received: string,
  ) {
    super(
      `sha256 MISMATCH — download deleted.\n  expected ${expected}\n  received ${received}\n` +
        'The release asset does not match the committed descriptor. Do not serve it.',
    );
    this.name = 'ArtifactDigestMismatchError';
  }
}

export interface DownloadArtifactOptions {
  /** GitHub `owner/repo` to download from. */
  readonly repository?: string;
  /** Full URL override (takes precedence over `repository`); for mirrors and tests. */
  readonly url?: string;
  /** Called as bytes arrive, for progress reporting. */
  readonly onProgress?: (receivedBytes: number) => void;
}

/**
 * Download the descriptor's artifact to `destinationPath`, verifying the
 * sha256 while streaming. Resolves to the verified byte count; throws
 * `ArtifactNotPublishedError` (404), `ArtifactDigestMismatchError`
 * (bytes ≠ descriptor, download deleted) or a plain Error on other HTTP
 * failures. On success the file at `destinationPath` IS the reviewed
 * artifact.
 */
export async function downloadArtifact(
  descriptor: ArtifactDescriptor,
  destinationPath: string,
  options: DownloadArtifactOptions = {},
): Promise<number> {
  const url = options.url ?? artifactDownloadUrl(descriptor, options.repository);
  const response = await fetch(url, { redirect: 'follow' });
  if (response.status === 404) {
    const tag = descriptor.release?.tag ?? `v${descriptor.engineVersion}`;
    throw new ArtifactNotPublishedError(url, tag);
  }
  if (!response.ok || response.body === null) {
    throw new Error(`Download failed: HTTP ${response.status} ${response.statusText}`);
  }

  await mkdir(dirname(destinationPath), { recursive: true });
  const partialPath = `${destinationPath}.partial`;
  const hash = createHash('sha256');
  let received = 0;

  await pipeline(
    Readable.fromWeb(response.body as import('node:stream/web').ReadableStream),
    async function* (source: AsyncIterable<Buffer>) {
      for await (const chunk of source) {
        hash.update(chunk);
        received += chunk.length;
        options.onProgress?.(received);
        yield chunk;
      }
    },
    createWriteStream(partialPath),
  );

  const digest = hash.digest('hex');
  if (digest !== descriptor.databaseSha256) {
    await rm(partialPath, { force: true });
    throw new ArtifactDigestMismatchError(descriptor.databaseSha256, digest);
  }
  if (received !== descriptor.databaseBytes) {
    // Unreachable when the digest matched, kept as belt-and-braces from the
    // workbench original: the descriptor states both, so both are enforced.
    await rm(partialPath, { force: true });
    throw new Error(
      `Size mismatch — download deleted. Expected ${descriptor.databaseBytes} bytes, received ${received}.`,
    );
  }
  await rename(partialPath, destinationPath);
  return received;
}
