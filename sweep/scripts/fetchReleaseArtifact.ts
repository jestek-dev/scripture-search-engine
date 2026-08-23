/**
 * Fetch the committed descriptor's release artifact, sha-verified (MS-6) —
 * obtained exactly as consumers' fetchArtifact does, via
 * @jestek-dev/scripture-artifact-client: streaming sha256, mismatch
 * deletes the download and fails. A flipped byte is refused by hash before
 * any query runs.
 *
 *   --dest <content.db>  [--descriptor <path>]
 */
import { copyFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
  downloadArtifact,
  validateArtifactDescriptor,
} from '@jestek-dev/scripture-artifact-client';

import { REPO_ROOT } from '../src/universe/compileFromRepo.js';

function flagValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

const argv = process.argv.slice(2);
const dest = flagValue(argv, '--dest');
if (dest === undefined) {
  console.error('usage: fetchReleaseArtifact --dest <content.db> [--descriptor <path>]');
  process.exit(2);
}
const descriptorPath =
  flagValue(argv, '--descriptor') ?? join(REPO_ROOT, 'artifacts', 'content-artifact.json');
const descriptor = validateArtifactDescriptor(
  JSON.parse(readFileSync(descriptorPath, 'utf8')),
);
const bytes = await downloadArtifact(descriptor, dest);
copyFileSync(descriptorPath, join(dirname(dest), 'content-artifact.json'));
console.log(`verified ${bytes} bytes → ${dest} (sha256 ${descriptor.databaseSha256})`);
