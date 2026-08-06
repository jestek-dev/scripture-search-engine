/**
 * Downloads the full content artifact from the GitHub Release named by the
 * committed descriptor, verifying the sha256 while streaming. The workbench
 * judges the reviewed artifact or nothing: a wrong artifact is worse than no
 * artifact, so a hash mismatch deletes the download and fails loudly.
 *
 * Uses Node's global fetch. Behind a TLS-intercepting proxy, point
 * NODE_EXTRA_CA_CERTS at the proxy's CA bundle — never disable TLS
 * verification.
 */

import { createHash } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { artifactDir, databasePath, readDescriptor } from './descriptor.js';

const PROGRESS_EVERY_BYTES = 16 * 1024 * 1024;

async function main(): Promise<void> {
  const descriptor = await readDescriptor();
  const tag = `v${descriptor.engineVersion}`;
  const url = `https://github.com/jestek-dev/scripture-search-engine/releases/download/${tag}/content.db`;

  console.log(`Descriptor: engine ${descriptor.engineVersion}, ${descriptor.databaseBytes} bytes expected`);
  console.log(`Downloading ${url}`);

  const response = await fetch(url, { redirect: 'follow' });
  if (response.status === 404) {
    console.error(
      `Release asset not found (404) at ${url}.\n` +
        `The descriptor names engine ${descriptor.engineVersion} but no ${tag} release asset is published yet.\n` +
        `Fallback — build the artifact locally:\n` +
        `  npm run fetch:sources --workspace pipeline\n` +
        `  npm run build:artifact --workspace pipeline\n` +
        `then copy pipeline/output/content.db into workbench/.artifact/.\n` +
        `The server verifies the sha256 against the descriptor at startup either way.`,
    );
    process.exit(1);
  }
  if (!response.ok || response.body === null) {
    console.error(`Download failed: HTTP ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  await mkdir(artifactDir, { recursive: true });
  const partialPath = `${databasePath}.partial`;
  const hash = createHash('sha256');
  let received = 0;
  let nextProgress = PROGRESS_EVERY_BYTES;

  await pipeline(
    Readable.fromWeb(response.body as import('node:stream/web').ReadableStream),
    async function* (source: AsyncIterable<Buffer>) {
      for await (const chunk of source) {
        hash.update(chunk);
        received += chunk.length;
        if (received >= nextProgress) {
          console.log(`  ${(received / 1024 / 1024).toFixed(0)} MB...`);
          nextProgress += PROGRESS_EVERY_BYTES;
        }
        yield chunk;
      }
    },
    createWriteStream(partialPath),
  );

  const digest = hash.digest('hex');
  if (digest !== descriptor.databaseSha256) {
    await rm(partialPath, { force: true });
    console.error(
      `sha256 MISMATCH — download deleted.\n` +
        `  expected ${descriptor.databaseSha256}\n` +
        `  received ${digest}\n` +
        `The release asset does not match the committed descriptor. Do not serve it.`,
    );
    process.exit(1);
  }
  if (received !== descriptor.databaseBytes) {
    await rm(partialPath, { force: true });
    console.error(
      `Size mismatch — download deleted. Expected ${descriptor.databaseBytes} bytes, received ${received}.`,
    );
    process.exit(1);
  }

  await rename(partialPath, databasePath);
  console.log(`sha256 verified: ${digest}`);
  console.log(`Artifact ready at ${databasePath} (${received} bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
