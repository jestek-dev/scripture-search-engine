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
  readonly stale?: {
    readonly since: string;
    readonly reason: string;
    readonly blocksRelease?: boolean;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
}

/**
 * Reject malformed release metadata before it can authorize a local artifact.
 * The descriptor has additional release fields, so validation is intentionally
 * strict for every field the workbench consumes while remaining forward-compatible.
 */
export function validateArtifactDescriptor(value: unknown): ArtifactDescriptor {
  if (!isRecord(value)) {
    throw new Error('Artifact descriptor must be a JSON object.');
  }

  const errors: string[] = [];
  const requireString = (field: string): string | null => {
    const candidate = value[field];
    if (!isNonEmptyString(candidate)) {
      errors.push(`${field} must be a non-empty string`);
      return null;
    }
    return candidate;
  };

  const schemaVersion = requireString('schemaVersion');
  const engineVersion = requireString('engineVersion');
  const corpusFingerprint = value['corpusFingerprint'];
  if (!isSha256(corpusFingerprint)) errors.push('corpusFingerprint must be a lowercase SHA-256 digest');
  const layerFingerprint = value['layerFingerprint'];
  if (!isSha256(layerFingerprint)) errors.push('layerFingerprint must be a lowercase SHA-256 digest');
  const databaseSha256 = value['databaseSha256'];
  if (!isSha256(databaseSha256)) errors.push('databaseSha256 must be a lowercase SHA-256 digest');
  const databaseBytes = value['databaseBytes'];
  if (typeof databaseBytes !== 'number' || !Number.isSafeInteger(databaseBytes) || databaseBytes <= 0) {
    errors.push('databaseBytes must be a positive safe integer');
  }

  const translations = value['translations'];
  if (!Array.isArray(translations)) {
    errors.push('translations must be an array');
  } else {
    for (const [index, translation] of translations.entries()) {
      if (!isRecord(translation)) {
        errors.push(`translations[${index}] must be an object`);
        continue;
      }
      if (!isNonEmptyString(translation['code'])) errors.push(`translations[${index}].code must be a non-empty string`);
      if (!isNonEmptyString(translation['name'])) errors.push(`translations[${index}].name must be a non-empty string`);
      const verseCount = translation['verseCount'];
      if (typeof verseCount !== 'number' || !Number.isSafeInteger(verseCount) || verseCount < 0) {
        errors.push(`translations[${index}].verseCount must be a non-negative safe integer`);
      }
    }
  }

  const stale = value['stale'];
  if (stale !== undefined) {
    if (!isRecord(stale)) {
      errors.push('stale must be an object when present');
    } else {
      if (!isNonEmptyString(stale['since'])) errors.push('stale.since must be a non-empty string');
      if (!isNonEmptyString(stale['reason'])) errors.push('stale.reason must be a non-empty string');
      if (stale['blocksRelease'] !== undefined && typeof stale['blocksRelease'] !== 'boolean') {
        errors.push('stale.blocksRelease must be a boolean when present');
      }
    }
  }

  if (errors.length > 0 || schemaVersion === null || engineVersion === null || !Array.isArray(translations)) {
    throw new Error(`Invalid artifact descriptor: ${errors.join('; ')}.`);
  }

  return {
    schemaVersion,
    engineVersion,
    corpusFingerprint: corpusFingerprint as string,
    layerFingerprint: layerFingerprint as string,
    databaseSha256: databaseSha256 as string,
    databaseBytes: databaseBytes as number,
    translations: translations as ArtifactDescriptor['translations'],
    ...(stale === undefined ? {} : { stale: stale as NonNullable<ArtifactDescriptor['stale']> }),
  };
}

export async function readDescriptor(): Promise<ArtifactDescriptor> {
  const runtimePath = process.env.WORKBENCH_DESCRIPTOR_PATH ?? descriptorPath;
  return validateArtifactDescriptor(JSON.parse(await readFile(runtimePath, 'utf8')) as unknown);
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
