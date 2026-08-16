/**
 * Drift sentinel: compares what upstream serves TODAY against every manifest
 * pin, byte for byte.
 *
 * Reachability is not identity. The scheduled G1b job greps for "did not
 * respond", so an upstream that republishes under the same URL answers HTTP
 * 200 with the wrong bytes and the check stays green — which is exactly how
 * all three rolling sources (WEB text, OpenBible topics, OpenBible xrefs)
 * drifted for weeks in 2026-08 while "Source reachability" succeeded. By the
 * time anyone noticed, the pinned July bytes no longer existed anywhere we
 * could reach.
 *
 * This script downloads each pinned source, hashes it, and fails LOUDLY on a
 * mismatch — but it runs only on the schedule (and by hand), never on push or
 * PR, so a third party republishing can never block unrelated work. The red
 * scheduled run is the alarm.
 *
 * What a red run means is a reviewed decision, not a script's: see
 * REPIN_INSTRUCTION below and docs/source-repins.md.
 *
 * Usage:
 *   npm run check:drift --workspace pipeline
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fingerprintDirectory } from '../src/provenance/contentFingerprint.js';
import type { SourceManifest } from '../src/provenance/manifest.js';
import { SWORD_ARCHIVE_GLOB, UNPACK } from './fetchSources.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

/**
 * The one action a red run authorizes. Edited checksums are the failure mode
 * this sentinel exists to prevent: a checksum updated to make the alarm stop
 * is a rights record and identity claim rewritten without review.
 */
export const REPIN_INSTRUCTION =
  'Re-admit via a reviewed re-pin PR — do NOT edit the checksum in place. ' +
  'A pinned source whose bytes changed is a NEW revision of that source. The ' +
  'process is documented in docs/source-repins.md: archive the new snapshot ' +
  'first, diff the payload, re-pin the manifest with provenance, re-baseline, ' +
  'and land it through a human merge.';

/**
 * `DRIFTED` is the only fatal source status. `unreachable` is deliberately
 * not: a host being down is a reachability finding (the `check` job's beat),
 * not evidence the bytes changed, and conflating them would teach people to
 * ignore the alarm on the day it matters.
 */
export type SourceStatus = 'pinned' | 'repacked' | 'DRIFTED' | 'unreachable';

/** `archive-rotted` is fatal: the archive holds our ONLY durable copy. */
export type ArchiveStatus = 'pinned' | 'archive-rotted' | 'unreachable';

export interface SourceDrift {
  readonly id: string;
  readonly status: SourceStatus;
  /** Names BOTH identities on a mismatch, so the alarm is actionable as-is. */
  readonly detail: string;
  /** Present only when the manifest declares an archiveUrl. */
  readonly archive?: { readonly status: ArchiveStatus; readonly detail: string };
}

export interface DriftCheckDeps {
  readonly fetcher?: typeof fetch;
  /** Unpacks archive bytes and fingerprints the payload; null = not an archive we know how to unpack. */
  readonly fingerprintArchive?: (manifest: SourceManifest, bytes: Buffer) => string | null;
}

/**
 * Unpacks a downloaded archive into a throwaway directory and fingerprints
 * its CONTENT, mirroring the unpack rules fetchSources uses so the two
 * scripts can never disagree about what a source's payload is.
 *
 * This is what lets a repack-without-change report `repacked` instead of
 * `DRIFTED`: CrossWire regenerates zips whose files are byte-identical, and a
 * sentinel that fires on a repack teaches people to update checksums without
 * reading them — worse than no sentinel at all.
 */
export function fingerprintArchiveBytes(manifest: SourceManifest, bytes: Buffer): string | null {
  const rule = UNPACK[manifest.id];
  if (!rule || rule.kind === 'plain') return null;

  // Canonicalized at creation (team memory: windows-ci-tmpdir-gotcha) so any
  // downstream realpath comparison sees the same path we created.
  const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'source-drift-')));
  try {
    const archivePath = join(scratch, 'archive.zip');
    writeFileSync(archivePath, bytes);
    const content = join(scratch, 'content');
    mkdirSync(content);
    if (rule.kind === 'zip-flat') {
      execFileSync('unzip', ['-o', '-q', archivePath, '-d', content]);
    } else {
      execFileSync('unzip', ['-o', '-q', '-j', archivePath, SWORD_ARCHIVE_GLOB, '-d', content]);
    }
    return fingerprintDirectory(content);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function sha256Of(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

type Fetched = { readonly bytes: Buffer } | { readonly failure: string };

async function download(url: string, fetcher: typeof fetch): Promise<Fetched> {
  let response: Response;
  try {
    response = await fetcher(url, { redirect: 'follow' });
  } catch (error) {
    return { failure: `${url}: ${error instanceof Error ? error.message : 'network error'}` };
  }
  if (!response.ok) return { failure: `${url}: HTTP ${response.status}` };
  return { bytes: Buffer.from(await response.arrayBuffer()) };
}

/** Compares one pinned source (and its archive, if declared) against what its URLs serve today. */
export async function checkSource(
  manifest: SourceManifest,
  deps: DriftCheckDeps = {},
): Promise<SourceDrift> {
  const fetcher = deps.fetcher ?? fetch;
  const fingerprint = deps.fingerprintArchive ?? fingerprintArchiveBytes;

  const source = await checkSourceUrl(manifest, fetcher, fingerprint);
  if (!manifest.archiveUrl) return { id: manifest.id, ...source };
  return {
    id: manifest.id,
    ...source,
    archive: await checkArchiveUrl(manifest, fetcher),
  };
}

async function checkSourceUrl(
  manifest: SourceManifest,
  fetcher: typeof fetch,
  fingerprint: NonNullable<DriftCheckDeps['fingerprintArchive']>,
): Promise<{ status: SourceStatus; detail: string }> {
  const result = await download(manifest.sourceUrl, fetcher);
  if ('failure' in result) return { status: 'unreachable', detail: result.failure };

  const served = sha256Of(result.bytes);
  if (served === manifest.sha256) {
    return { status: 'pinned', detail: 'upstream serves the pinned bytes' };
  }

  if (manifest.contentSha256) {
    let content: string | null;
    try {
      content = fingerprint(manifest, result.bytes);
    } catch {
      // Bytes that will not even unpack are not a repack of anything.
      content = null;
    }
    if (content === manifest.contentSha256) {
      return {
        status: 'repacked',
        detail:
          `archive checksum moved (pinned ${manifest.sha256}, upstream serves ${served}) ` +
          'but the content fingerprint matches — packaging only, payload identical',
      };
    }
    return {
      status: 'DRIFTED',
      detail:
        `content fingerprint pinned ${manifest.contentSha256}, upstream unpacks to ` +
        `${content ?? '(bytes that do not unpack)'}; archive sha256 pinned ${manifest.sha256} ` +
        `(${manifest.bytes} B), upstream serves ${served} (${result.bytes.length} B)`,
    };
  }

  return {
    status: 'DRIFTED',
    detail:
      `sha256 pinned ${manifest.sha256} (${manifest.bytes} B), upstream serves ` +
      `${served} (${result.bytes.length} B)`,
  };
}

async function checkArchiveUrl(
  manifest: SourceManifest,
  fetcher: typeof fetch,
): Promise<{ status: ArchiveStatus; detail: string }> {
  const result = await download(manifest.archiveUrl!.trim(), fetcher);
  if ('failure' in result) {
    // A 4xx is the host answering, authoritatively, that our snapshot is not
    // there — that is rot, and it is fatal because the archive is the ONLY
    // durable copy of the pinned bytes. A transport failure or 5xx is the
    // host failing to answer, which earns the same grace as any unreachable
    // source.
    const authoritativeMiss = /: HTTP 4\d\d$/.test(result.failure);
    return {
      status: authoritativeMiss ? 'archive-rotted' : 'unreachable',
      detail: result.failure,
    };
  }
  const served = sha256Of(result.bytes);
  if (served === manifest.sha256) {
    return { status: 'pinned', detail: 'archive serves the pinned bytes' };
  }
  // No repack tolerance here: the archive is a snapshot WE uploaded of the
  // exact pinned bytes. Anything else in that slot means the durable copy is
  // gone, whatever replaced it.
  return {
    status: 'archive-rotted',
    detail:
      `archive no longer serves the pinned bytes — sha256 pinned ${manifest.sha256} ` +
      `(${manifest.bytes} B), archive serves ${served} (${result.bytes.length} B)`,
  };
}

/**
 * The lines that make a run red: drifted sources and rotted archives.
 * Everything else — pinned, repacked, unreachable — is reported but not
 * fatal, so the alarm only rings for what a re-pin PR can actually fix.
 */
export function fatalFindings(reports: readonly SourceDrift[]): string[] {
  const lines: string[] = [];
  for (const report of reports) {
    if (report.status === 'DRIFTED') lines.push(`${report.id}: ${report.detail}`);
    if (report.archive?.status === 'archive-rotted') {
      lines.push(`${report.id} (archive): ${report.archive.detail}`);
    }
  }
  return lines;
}

function loadManifests(): SourceManifest[] {
  return (
    readdirSync(join(ROOT, 'manifests'))
      .filter((name) => name.endsWith('.json'))
      .sort()
      .map(
        (name) =>
          JSON.parse(readFileSync(join(ROOT, 'manifests', name), 'utf8')) as SourceManifest,
      )
      // A manifest with no checksum pins no bytes — it exists so other
      // sources can declare lineage against it (G7).
      .filter((manifest) => manifest.sha256 && manifest.sourceUrl)
  );
}

async function main(): Promise<void> {
  const reports: SourceDrift[] = [];
  for (const manifest of loadManifests()) {
    const report = await checkSource(manifest);
    reports.push(report);
    process.stdout.write(`  ${report.id.padEnd(24)} ${report.status.padEnd(12)} ${report.detail}\n`);
    if (report.archive) {
      process.stdout.write(
        `  ${''.padEnd(24)} archive: ${report.archive.status} — ${report.archive.detail}\n`,
      );
    }
  }

  const unreachable = reports.filter((report) => report.status === 'unreachable');
  if (unreachable.length > 0) {
    process.stdout.write(
      `\n${unreachable.length} source(s) unreachable — not drift, but the ` +
        'reachability check should be telling the same story.\n',
    );
  }

  const fatal = fatalFindings(reports);
  if (fatal.length === 0) {
    process.stdout.write('\nEvery reachable pin matches what upstream serves.\n');
    return;
  }

  process.stderr.write(
    `\nDRIFT DETECTED — ${fatal.length} finding(s):\n` +
      fatal.map((line) => `  ${line}`).join('\n') +
      `\n\n${REPIN_INSTRUCTION}\n`,
  );
  process.exitCode = 1;
}

// Only run when invoked as a script; tests import the checker directly, and
// importing must not start downloading.
if (process.argv[1] && process.argv[1].endsWith('checkSourceDrift.ts')) {
  void main();
}
