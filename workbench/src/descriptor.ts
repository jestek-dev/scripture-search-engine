/**
 * The committed descriptor (`artifacts/content-artifact.json`) is the single
 * source of truth for what the workbench may serve: it names the release tag
 * to download from, the sha256 the database must hash to, and the identities
 * the running engine must report. Everything here is a lookup against that
 * reviewed file — nothing is inferred from the database itself.
 */

import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const descriptorPath = path.join(repoRoot, 'artifacts', 'content-artifact.json');
export const artifactDir = path.join(repoRoot, 'workbench', '.artifact');
export const databasePath = path.join(artifactDir, 'content.db');

/** The descriptor fields the workbench reads. The file carries more; these are the load-bearing ones. */
export interface ArtifactDescriptor {
  readonly schemaVersion: string;
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  readonly databaseSha256: string;
  readonly databaseBytes: number;
  readonly translations: readonly {
    readonly code: string;
    readonly name: string;
    readonly verseCount: number;
  }[];
}

export async function readDescriptor(): Promise<ArtifactDescriptor> {
  return JSON.parse(await readFile(descriptorPath, 'utf8')) as ArtifactDescriptor;
}

export function sha256OfFile(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    createReadStream(file)
      .on('data', (chunk) => hash.update(chunk))
      .on('error', reject)
      .on('end', () => resolve(hash.digest('hex')));
  });
}
