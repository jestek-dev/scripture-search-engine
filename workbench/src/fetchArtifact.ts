/**
 * Downloads the full content artifact from the GitHub Release named by the
 * committed descriptor, verifying the sha256 while streaming. The workbench
 * judges the reviewed artifact or nothing: a wrong artifact is worse than no
 * artifact, so a hash mismatch deletes the download and fails loudly.
 *
 * The download/verify mechanics were EXTRACTED to
 * `@jestek-dev/scripture-artifact-client` (plan P7.3 / CO-6) — consumer apps
 * run the same code; this CLI keeps the workbench-specific paths and the
 * local-build fallback guidance.
 *
 * Uses Node's global fetch. Behind a TLS-intercepting proxy, point
 * NODE_EXTRA_CA_CERTS at the proxy's CA bundle — never disable TLS
 * verification.
 */

import {
  ArtifactNotPublishedError,
  downloadArtifact,
} from '@jestek-dev/scripture-artifact-client';

import { databasePath, readDescriptor, releaseTagFor } from './descriptor.js';

const PROGRESS_EVERY_BYTES = 16 * 1024 * 1024;

async function main(): Promise<void> {
  const descriptor = await readDescriptor();
  const tag = releaseTagFor(descriptor);

  console.log(`Descriptor: engine ${descriptor.engineVersion}, ${descriptor.databaseBytes} bytes expected`);
  console.log(`Downloading release ${tag}`);

  let nextProgress = PROGRESS_EVERY_BYTES;
  try {
    const received = await downloadArtifact(descriptor, databasePath, {
      onProgress: (bytes) => {
        if (bytes >= nextProgress) {
          console.log(`  ${(bytes / 1024 / 1024).toFixed(0)} MB...`);
          nextProgress += PROGRESS_EVERY_BYTES;
        }
      },
    });
    console.log(`sha256 verified: ${descriptor.databaseSha256}`);
    console.log(`Artifact ready at ${databasePath} (${received} bytes)`);
  } catch (error) {
    if (error instanceof ArtifactNotPublishedError) {
      console.error(
        `Release asset not found (404) at ${error.url}.\n` +
          `The descriptor names release ${tag} (engine ${descriptor.engineVersion}) but no such release asset is published yet.\n` +
          `Fallback — build the artifact locally:\n` +
          `  npm run fetch:sources --workspace pipeline\n` +
          `  npm run build:artifact --workspace pipeline\n` +
          `then copy pipeline/output/content.db into workbench/.artifact/.\n` +
          `The server verifies the sha256 against the descriptor at startup either way.`,
      );
      process.exit(1);
    }
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
