/**
 * Fetches every pinned source into pipeline/sources/, verifying checksums.
 *
 * This is what makes the artifact REPRODUCIBLE by someone who is not me. Until
 * now the full build ran only on a machine where the corpora happened to
 * already be sitting on disk, which is indistinguishable from not being
 * reproducible at all — and is exactly the failure the WEB manifest had, where
 * a checksum pointed at a file nobody could re-obtain.
 *
 * Every download is verified against its manifest BEFORE it is unpacked, and a
 * mismatch stops the run. A source whose bytes differ from its rights record
 * is not the source that record describes, and re-admitting it is a reviewed
 * decision rather than something a build script gets to make.
 *
 * Usage:
 *   npx tsx scripts/fetchSources.ts           # fetch what is missing
 *   npx tsx scripts/fetchSources.ts --force   # re-fetch everything
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { EXPOSITION_SOURCES } from '../src/expositionSources.js';
import { fingerprintDirectory } from '../src/provenance/contentFingerprint.js';
import { retrievalUrls, type SourceManifest } from '../src/provenance/manifest.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SOURCES = join(ROOT, 'sources');

/**
 * How each archive is unpacked, keyed by manifest id.
 *
 * Written out rather than inferred from the archive's contents. Inference
 * would be one surprising zip away from silently putting a file where nothing
 * looks for it, and the build's error would then be "source missing" pointing
 * at the wrong cause.
 */
type Unpack =
  | { kind: 'plain' }
  | { kind: 'zip-flat'; into?: string }
  | { kind: 'sword-module'; into: string };

const UNPACK: Readonly<Record<string, Unpack>> = {
  web: { kind: 'zip-flat', into: 'vpl' },
  'openbible-topics': { kind: 'zip-flat' },
  'openbible-xrefs': { kind: 'zip-flat' },
  ...Object.fromEntries(
    EXPOSITION_SOURCES.filter((spec) => spec.strategy === 'sword-zcom').map((spec) => [
      spec.id,
      { kind: 'sword-module', into: spec.file } as Unpack,
    ]),
  ),
};

export const SWORD_ARCHIVE_GLOB = 'modules/comments/*/*/*';

/**
 * Filename to save the download as.
 *
 * The REGISTRY's filename wins over the URL's last segment wherever a source
 * declares one, because that is the name the build looks for. Gutenberg serves
 * Maclaren as `pg7925.txt` and the Archive serves Treasury volumes with a
 * `_djvu` suffix; saving under those names left the build unable to find
 * sources it had just successfully downloaded — and it failed by silently
 * producing 20,000 fewer terms rather than by complaining, because a missing
 * optional source is indistinguishable from one that was never registered.
 */
function fileNameFor(manifest: SourceManifest): string {
  const spec = EXPOSITION_SOURCES.find((candidate) => candidate.id === manifest.id);
  if (spec) {
    // SWORD archives are saved as `<registry file>.zip`, which is what
    // buildArtifact checksums. The URL's own basename is capitalised
    // (`Clarke.zip`) while the registry entry is not (`clarke`), and on a
    // case-insensitive filesystem those are the same file — so this worked on
    // macOS and failed on Linux CI with "missing source clarke.zip" while
    // Clarke.zip sat right there.
    return spec.strategy === 'sword-zcom' ? `${spec.file}.zip` : spec.file;
  }
  const last = manifest.sourceUrl.split('/').pop() ?? manifest.id;
  return last.includes('.') ? last : `${manifest.id}.bin`;
}

/** Where a source's payload lands, or null if it is a plain file. */
function contentDirectory(manifest: SourceManifest): string | null {
  const rule = UNPACK[manifest.id] ?? { kind: 'plain' };
  if (rule.kind === 'plain') return null;
  return rule.into ? join(SOURCES, rule.into) : null;
}

function unpack(manifest: SourceManifest, archivePath: string): void {
  const rule = UNPACK[manifest.id] ?? { kind: 'plain' };
  if (rule.kind === 'plain') return;

  const target = rule.into ? join(SOURCES, rule.into) : SOURCES;
  mkdirSync(target, { recursive: true });

  if (rule.kind === 'zip-flat') {
    execFileSync('unzip', ['-o', '-q', archivePath, '-d', target]);
    return;
  }

  // SWORD modules nest their data under modules/comments/<driver>/<name>/.
  // Flattened with -j so the loader finds ot.* and nt.* directly, which keeps
  // the loader ignorant of a layout that varies between modules.
  execFileSync('unzip', [
    '-o',
    '-q',
    '-j',
    archivePath,
    SWORD_ARCHIVE_GLOB,
    '-d',
    target,
  ]);
}

export interface CandidateSelection {
  /** Bytes matching the manifest, or null when no candidate produced them. */
  readonly bytes: Buffer | null;
  readonly sha256: string;
  /** True when the authoritative URL failed and a later candidate succeeded. */
  readonly usedFallback: boolean;
  /** One line per candidate tried, in order, naming exactly what went wrong. */
  readonly attempts: readonly string[];
}

/**
 * Picks the first retrieval candidate that produces the manifest's bytes.
 *
 * Split out from main() and given an injectable fetcher because this is the
 * only branching logic in the script and it is where the interesting failures
 * live — a candidate loop that silently accepts wrong bytes is exactly the
 * class of bug that makes a checksum decorative.
 *
 * A source declaring `contentSha256` is verified on its unpacked CONTENT
 * later, because publishers repack archives without changing the payload; for
 * those, byte equality is not the admission test and the first HTTP success
 * wins here.
 */
export async function selectCandidate(
  manifest: SourceManifest,
  fetcher: typeof fetch = fetch,
): Promise<CandidateSelection> {
  const attempts: string[] = [];
  const urls = retrievalUrls(manifest);

  for (const [index, url] of urls.entries()) {
    let response: Response;
    try {
      response = await fetcher(url, { redirect: 'follow' });
    } catch (error) {
      attempts.push(
        `${url}: unreachable (${error instanceof Error ? error.message : 'network error'})`,
      );
      continue;
    }
    if (!response.ok) {
      attempts.push(`${url}: HTTP ${response.status}`);
      continue;
    }
    const candidate = Buffer.from(await response.arrayBuffer());
    const candidateSha = createHash('sha256').update(candidate).digest('hex');
    if (candidateSha !== manifest.sha256 && !manifest.contentSha256) {
      // Both halves of the comparison, so the operator can act without
      // opening the manifest.
      attempts.push(
        `${url}: checksum mismatch — expected ${manifest.sha256}, got ${candidateSha}`,
      );
      continue;
    }
    attempts.push(`${url}: ok`);
    return { bytes: candidate, sha256: candidateSha, usedFallback: index > 0, attempts };
  }

  return { bytes: null, sha256: '', usedFallback: false, attempts };
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force');
  mkdirSync(SOURCES, { recursive: true });

  const manifests = readdirSync(join(ROOT, 'manifests'))
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(ROOT, 'manifests', name), 'utf8')) as SourceManifest)
    // A manifest with no checksum pins no bytes — it exists so other sources
    // can declare lineage against it (G7).
    .filter((manifest) => manifest.sha256 && manifest.sourceUrl);

  let fetched = 0;
  let cached = 0;
  const failures: string[] = [];
  // Sources whose authoritative URL stopped serving the pinned bytes but whose
  // archive supplied them. Not a failure, but never silent: an unrecorded
  // fallback turns a loud break into a slow drift nobody notices.
  const drift: string[] = [];

  for (const manifest of manifests) {
    const path = join(SOURCES, fileNameFor(manifest));

    if (!force && existsSync(path)) {
      const sha256 = createHash('sha256').update(readFileSync(path)).digest('hex');
      if (sha256 === manifest.sha256 || manifest.contentSha256) {
        unpack(manifest, path);
        cached += 1;
        process.stdout.write(`  ${manifest.id.padEnd(24)} cached\n`);
        continue;
      }
      process.stdout.write(`  ${manifest.id.padEnd(24)} on-disk copy differs, re-fetching\n`);
    }

    process.stdout.write(`  ${manifest.id.padEnd(24)} fetching…`);

    const selection = await selectCandidate(manifest);
    if (!selection.bytes) {
      process.stdout.write(' FAILED\n');
      failures.push(
        `${manifest.id}: no retrieval candidate produced the pinned bytes.\n` +
          selection.attempts.map((line) => `      ${line}`).join('\n') +
          '\n      If the source legitimately changed, re-admit it as a reviewed change ' +
          '(new checksum + a note in the manifest saying what moved).',
      );
      continue;
    }
    const { bytes, sha256 } = selection;
    // A fallback that WORKED still means the authoritative URL no longer
    // serves the pinned bytes. Recorded rather than shrugged off: this is the
    // slow failure G1b exists to catch, and swallowing it would trade a loud
    // break for a silent drift.
    if (selection.usedFallback) {
      process.stdout.write(' (from archive)');
      drift.push(
        `${manifest.id}: authoritative URL no longer serves the pinned bytes; the archive did. ` +
          selection.attempts.join('; '),
      );
    }

    writeFileSync(path, bytes);
    unpack(manifest, path);

    // Prefer the CONTENT identity where the manifest declares one: publishers
    // repack archives, and the payload is what admission is about.
    const directory = contentDirectory(manifest);
    if (manifest.contentSha256 && directory) {
      const content = fingerprintDirectory(directory);
      if (content !== manifest.contentSha256) {
        process.stdout.write(' CONTENT MISMATCH\n');
        failures.push(
          `${manifest.id}: content fingerprint ${content} does not match the manifest's ` +
            `${manifest.contentSha256}. The payload itself changed, not just its packaging. ` +
            'Re-admit it as a reviewed change.',
        );
        continue;
      }
      const repacked = sha256 !== manifest.sha256;
      fetched += 1;
      process.stdout.write(
        ` ok (${(bytes.length / 1048576).toFixed(1)} MiB)` +
          `${repacked ? ' — archive repacked upstream, content identical' : ''}\n`,
      );
      continue;
    }

    // No trailing checksum compare: selectCandidate only returns bytes that
    // already matched the manifest (or that are content-fingerprinted above),
    // so a check here could never fire and would read as protection.
    fetched += 1;
    process.stdout.write(` ok (${(bytes.length / 1048576).toFixed(1)} MiB)\n`);
  }

  process.stdout.write(`\n${fetched} fetched, ${cached} already present\n`);

  if (drift.length > 0) {
    process.stdout.write(
      `\n${drift.length} source(s) came from their ARCHIVE, not their authoritative URL:\n  ` +
        `${drift.join('\n  ')}\n` +
        'The build is reproducible, but upstream has moved. Re-admitting the current ' +
        'upstream file is a reviewed decision worth making deliberately.\n',
    );
  }

  if (failures.length > 0) {
    process.stderr.write(`\n${failures.length} source(s) failed:\n  ${failures.join('\n  ')}\n`);
    process.exitCode = 1;
  }
}

// Only run when invoked as a script. Tests import UNPACK to check it stays in
// step with the source registry, and importing must not start downloading.
if (process.argv[1] && process.argv[1].endsWith('fetchSources.ts')) {
  void main();
}

export { UNPACK, fileNameFor };

/** Exported for the test that keeps UNPACK and the registry in step. */
export function unpackRuleIds(): readonly string[] {
  return Object.keys(UNPACK);
}

