/**
 * Identifies what an archive CONTAINS, independently of how it was packed.
 *
 * Why this exists: CrossWire regenerates its module zips periodically. The
 * files inside are byte-identical; only the archive's embedded timestamps
 * change. Checksumming the archive therefore reports a source as altered when
 * nothing about it has altered — and a provenance gate that fires on a repack
 * teaches people to update checksums without reading them, which is worse than
 * having no gate at all.
 *
 * Verified rather than assumed: JFB's archive checksum changed between
 * 2026-07-29 and 2026-07-30 while all six of its data files hashed identically.
 *
 * So archives get TWO identities:
 *   sha256          — the bytes retrieved on `retrievedAt`. A snapshot. Useful
 *                     for saying exactly what was downloaded, not for gating.
 *   contentSha256   — the payload. Stable across repacking, and the thing
 *                     admission actually cares about.
 *
 * Sources that are a single plain file need only the first: there is no
 * packaging to vary.
 */

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/**
 * Canonical stream: every file's path and bytes, sorted by path and
 * length-delimited.
 *
 * Length prefixes matter for the same reason they do in the corpus
 * fingerprint — without them, two different sets of files can serialize to the
 * same stream, and a fingerprint that collides on rearranged content is not
 * evidence of anything.
 *
 * Path separators are normalized so a Windows build and a Linux build of the
 * same source agree; the reproducibility contract promises identical results
 * on every platform, and this is upstream of it.
 */
export function fingerprintDirectory(directory: string): string {
  const files: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current).sort()) {
      const path = join(current, entry);
      if (statSync(path).isDirectory()) walk(path);
      else files.push(path);
    }
  };
  walk(directory);

  const hash = createHash('sha256');
  for (const path of files.sort()) {
    const name = relative(directory, path).split(sep).join('/');
    const bytes = readFileSync(path);
    hash.update(String(name.length));
    hash.update(' ');
    hash.update(name);
    hash.update(' ');
    hash.update(String(bytes.length));
    hash.update(' ');
    hash.update(bytes);
  }
  return hash.digest('hex');
}
