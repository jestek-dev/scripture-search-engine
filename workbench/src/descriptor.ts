/**
 * The committed descriptor (`artifacts/content-artifact.json`) is the single
 * source of truth for what the workbench may serve: it names the release tag
 * to download from, the sha256 the database must hash to, and the identities
 * the running engine must report. Everything here is a lookup against that
 * reviewed file — nothing is inferred from the database itself.
 *
 * The verification logic itself (descriptor validation, `releaseTagFor`,
 * file hashing) was EXTRACTED to `@jestek-dev/scripture-artifact-client`
 * (plan P7.3 / CO-6) so consumer apps run the exact code the workbench does
 * — this module re-exports it and keeps only the workbench's repo-locations.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  validateArtifactDescriptor,
  type ArtifactDescriptor,
} from '@jestek-dev/scripture-artifact-client';

export {
  releaseTagFor,
  validateArtifactDescriptor,
  type ArtifactDescriptor,
} from '@jestek-dev/scripture-artifact-client';
export { sha256OfFile } from '@jestek-dev/scripture-artifact-client';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const descriptorPath = path.join(repoRoot, 'artifacts', 'content-artifact.json');
export const artifactDir = path.join(repoRoot, 'workbench', '.artifact');
export const databasePath = path.join(artifactDir, 'content.db');

export async function readDescriptor(): Promise<ArtifactDescriptor> {
  const runtimePath = process.env.WORKBENCH_DESCRIPTOR_PATH ?? descriptorPath;
  return validateArtifactDescriptor(JSON.parse(await readFile(runtimePath, 'utf8')) as unknown);
}
