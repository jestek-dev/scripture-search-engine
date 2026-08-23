/**
 * The identity triple the sweep is pinned to (MS-1).
 *
 * Every snapshot, manifest, and defect record names
 * `(engineVersion, corpusFingerprint, layerFingerprint)` — the three
 * independent reasons results change (covenant #2) — plus the artifact's
 * `databaseSha256` so a byte-tampered database can never masquerade as the
 * identity it claims.
 *
 * The startup probe asserts the identity the ENGINE reports over the opened
 * artifact matches the descriptor manifest, or ABORTS before the first query
 * line is executed. The audit's caveat — working files evaporating, results
 * against ad-hoc reconstructions — is what this kills.
 */
import { readFileSync } from 'node:fs';

export interface IdentityTriple {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

export interface ArtifactIdentity extends IdentityTriple {
  readonly databaseSha256: string;
}

/** The descriptor fields the sweep reads. Extra fields are ignored. */
interface DescriptorShape {
  readonly engineVersion?: unknown;
  readonly corpusFingerprint?: unknown;
  readonly layerFingerprint?: unknown;
  readonly databaseSha256?: unknown;
}

export class IdentityMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IdentityMismatchError';
  }
}

function requireString(value: unknown, field: string, path: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new IdentityMismatchError(`descriptor ${path} is missing a usable "${field}"`);
  }
  return value;
}

/** Read the identity an artifact DESCRIPTOR claims. */
export function readDescriptorIdentity(descriptorPath: string): ArtifactIdentity {
  const parsed = JSON.parse(readFileSync(descriptorPath, 'utf8')) as DescriptorShape;
  return {
    engineVersion: requireString(parsed.engineVersion, 'engineVersion', descriptorPath),
    corpusFingerprint: requireString(parsed.corpusFingerprint, 'corpusFingerprint', descriptorPath),
    layerFingerprint: requireString(parsed.layerFingerprint, 'layerFingerprint', descriptorPath),
    databaseSha256: requireString(parsed.databaseSha256, 'databaseSha256', descriptorPath),
  };
}

/**
 * Abort unless the engine-reported triple equals the descriptor's claim.
 * Called by the harness BEFORE the first query line.
 */
export function assertIdentityMatches(claimed: IdentityTriple, observed: IdentityTriple): void {
  const mismatches: string[] = [];
  if (claimed.engineVersion !== observed.engineVersion) {
    mismatches.push(`engineVersion claimed=${claimed.engineVersion} observed=${observed.engineVersion}`);
  }
  if (claimed.corpusFingerprint !== observed.corpusFingerprint) {
    mismatches.push(
      `corpusFingerprint claimed=${claimed.corpusFingerprint} observed=${observed.corpusFingerprint}`,
    );
  }
  if (claimed.layerFingerprint !== observed.layerFingerprint) {
    mismatches.push(
      `layerFingerprint claimed=${claimed.layerFingerprint} observed=${observed.layerFingerprint}`,
    );
  }
  if (mismatches.length > 0) {
    throw new IdentityMismatchError(
      `identity probe FAILED — the artifact is not the identity the manifest claims; ` +
        `no query will run. ${mismatches.join('; ')}`,
    );
  }
}
