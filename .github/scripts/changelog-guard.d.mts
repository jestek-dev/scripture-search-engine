/**
 * Hand-written declarations for changelog-guard.mjs, which is plain JS on
 * purpose (it runs standalone in CI with no build step). Only the exported
 * test seams are declared; the script body stays untyped.
 */

export declare function hasChangelogEntry(changelogText: string, version: string): boolean;

export declare function checkChangelog(input: {
  changelogText: string;
  packageVersion: string;
  refName?: string;
}): string[];
