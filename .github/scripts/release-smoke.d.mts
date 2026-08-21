/**
 * Hand-written declarations for release-smoke.mjs, which is plain JS on
 * purpose (it runs standalone in CI with no build step). Only the exported
 * test seam is declared; the script body stays untyped.
 */

export declare const IDENTITY_FIELDS: readonly string[];

export interface DescriptorIdentityMismatch {
  field: string;
  committed: unknown;
  served: unknown;
}

export declare function compareDescriptorIdentity(
  committed: Record<string, unknown>,
  served: Record<string, unknown>,
): DescriptorIdentityMismatch[];

export declare function coversJames122(reference: string): boolean;
