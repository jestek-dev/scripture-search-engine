/**
 * Download + verify against a local HTTP server (plan P7.3 / CO-6).
 *
 * Hermetic on purpose: the wire mechanics (streaming hash, partial-file
 * atomicity, mismatch deletion, 404 typing) are provable without the
 * network. The against-a-REAL-release integration leg is deliberately
 * deferred: the plan words it "against the v0.9.0+ release" and no such
 * release exists yet (only v0.7.1 is published; the terminus release is
 * P7.6) — that leg lands with the terminus, it is not faked here.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { validateArtifactDescriptor } from '../src/descriptor.js';
import {
  ArtifactDigestMismatchError,
  ArtifactNotPublishedError,
  downloadArtifact,
  sha256OfFile,
} from '../src/download.js';

const payload = Buffer.from('deterministic artifact bytes — the reviewed identity or nothing\n');
const payloadSha = createHash('sha256').update(payload).digest('hex');

let server: Server;
let baseUrl: string;
let scratch: string;

function descriptorFor(sha256: string, bytes = payload.length) {
  return validateArtifactDescriptor({
    schemaVersion: '6',
    engineVersion: '0.7.1',
    corpusFingerprint: 'a'.repeat(64),
    layerFingerprint: 'b'.repeat(64),
    databaseSha256: sha256,
    databaseBytes: bytes,
    translations: [],
  });
}

beforeAll(async () => {
  scratch = mkdtempSync(join(tmpdir(), 'artifact-client-download-'));
  server = createServer((req, res) => {
    if (req.url === '/content.db') {
      res.writeHead(200, { 'content-type': 'application/octet-stream' });
      res.end(payload);
    } else if (req.url === '/err500') {
      res.writeHead(500);
      res.end('boom');
    } else {
      res.writeHead(404);
      res.end('not found');
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('no port');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  rmSync(scratch, { recursive: true, force: true });
});

describe('downloadArtifact', () => {
  it('downloads, verifies and lands the file atomically', async () => {
    const destination = join(scratch, 'ok', 'content.db');
    const progress: number[] = [];
    const received = await downloadArtifact(descriptorFor(payloadSha), destination, {
      url: `${baseUrl}/content.db`,
      onProgress: (bytes) => progress.push(bytes),
    });
    expect(received).toBe(payload.length);
    expect(readFileSync(destination)).toEqual(payload);
    expect(existsSync(`${destination}.partial`)).toBe(false);
    expect(progress.at(-1)).toBe(payload.length);
    await expect(sha256OfFile(destination)).resolves.toBe(payloadSha);
  });

  it('SEEDED VIOLATION: wrong descriptor digest — download deleted, typed error', async () => {
    const destination = join(scratch, 'bad', 'content.db');
    await expect(
      downloadArtifact(descriptorFor('d'.repeat(64)), destination, {
        url: `${baseUrl}/content.db`,
      }),
    ).rejects.toBeInstanceOf(ArtifactDigestMismatchError);
    // Nothing usable left behind — neither the final path nor the partial.
    expect(existsSync(destination)).toBe(false);
    expect(existsSync(`${destination}.partial`)).toBe(false);
  });

  it('types the unpublished-release case (404)', async () => {
    await expect(
      downloadArtifact(descriptorFor(payloadSha), join(scratch, 'missing', 'content.db'), {
        url: `${baseUrl}/absent.db`,
      }),
    ).rejects.toBeInstanceOf(ArtifactNotPublishedError);
  });

  it('surfaces other HTTP failures loudly (non-404 is not "unpublished")', async () => {
    await expect(
      downloadArtifact(descriptorFor(payloadSha), join(scratch, 'x', 'content.db'), {
        url: `${baseUrl}/err500`,
      }),
    ).rejects.toThrow('HTTP 500');
  });
});
