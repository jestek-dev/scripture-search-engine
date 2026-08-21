/**
 * Hand-written declarations for release-integrity.mjs, which is plain JS on
 * purpose (it runs standalone in CI with no build step). Only the exported
 * test seam is declared; the script body stays untyped.
 */

export interface ReleaseDigestExpectation {
  tag: string;
  asset: string;
  sha256: string;
  source: string;
  allowUnpublished?: boolean;
}

export interface ApiReleaseAsset {
  name: string;
  digest: string | null;
  size?: number;
}

export interface ApiRelease {
  tag_name: string;
  draft: boolean;
  assets: ApiReleaseAsset[];
}

export declare const KNOWN_RELEASE_DIGESTS: readonly ReleaseDigestExpectation[];

export declare function expectationsFromDescriptor(
  descriptor: Record<string, unknown> & { release?: { tag?: string }; databaseSha256?: string },
): ReleaseDigestExpectation[];

export declare function compareReleaseDigests(
  expectations: readonly ReleaseDigestExpectation[],
  releases: readonly ApiRelease[],
): { failures: string[]; lines: string[] };
