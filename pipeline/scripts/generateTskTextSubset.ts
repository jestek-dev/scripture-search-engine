/**
 * Cuts a committed, corpus-scoped subset of the mined TSK phrase triples
 * (P6.3/B3 Phase A) — the sibling of generateSectionCountsSubset.ts. The
 * fixture build always reads this committed subset, never the gitignored
 * TSK.zip: CI has no sources/, and a fixture bed that differs between
 * machines measures nothing.
 *
 * Cut rule: keep every mined triple whose FROM verse is in the fixture
 * corpus AND whose target range touches it (the same presence filtering
 * buildConceptLayer applies at insert time), so the committed subset is
 * exactly what the fixture artifact ships — the numbers a reviewer reads
 * here are the numbers the layer fingerprint feeds.
 *
 * The subset is redistributable: TSK is public domain by age (CrossWire
 * DistributionLicense=Public Domain; see manifests/tsk-text.json), and the
 * rows carry only verse ids and tokenizer-normalized phrase keys.
 *
 * Usage: npx tsx scripts/generateTskTextSubset.ts
 * (requires sources/TSK.zip — run fetch:sources first; the archive is
 * checksum-verified against the manifest before anything is mined.)
 */

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findBook } from '../src/books.js';
import { importTskText } from '../src/importers/tskImporter.js';
import { makeVerseId } from '../src/verseId.js';
import type { VerseArrayEntry, VerseArraySource } from '../src/importers/verseArrayImporter.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, 'fixtures', 'tsk-text-subset.json');
const SWORD_ARCHIVE_GLOB = 'modules/comments/*/*/*';

function fixtureVerseIds(): Set<number> {
  const fixture = JSON.parse(
    readFileSync(join(ROOT, 'fixtures', 'web-subset.json'), 'utf8'),
  ) as VerseArraySource;
  const ids = new Set<number>();
  for (const verse of fixture.verses as VerseArrayEntry[]) {
    const book = findBook(verse.book_name);
    if (book) ids.add(makeVerseId(book.id, verse.chapter, verse.verse));
  }
  return ids;
}

/** Mirror of buildConceptLayer's bounded range-presence scan. */
function rangeIsPresent(start: number, end: number, present: ReadonlySet<number>): boolean {
  if (present.has(start) || present.has(end)) return true;
  for (let id = start; id <= end && id - start < 400; id += 1) {
    if (present.has(id)) return true;
  }
  return false;
}

function main(): void {
  const manifest = JSON.parse(
    readFileSync(join(ROOT, 'manifests', 'tsk-text.json'), 'utf8'),
  ) as { sha256: string };
  const archivePath = join(ROOT, 'sources', 'TSK.zip');
  const archive = readFileSync(archivePath);
  const sha256 = createHash('sha256').update(archive).digest('hex');
  if (sha256 !== manifest.sha256) {
    throw new Error(
      `generateTskTextSubset: sources/TSK.zip is ${sha256}, not the pinned ` +
        `${manifest.sha256}. Re-fetch or re-admit before regenerating.`,
    );
  }

  const directory = mkdtempSync(join(tmpdir(), 'tsk-subset-'));
  try {
    execFileSync('unzip', ['-o', '-q', '-j', archivePath, SWORD_ARCHIVE_GLOB, '-d', directory]);
    const files = (name: string) => ({
      bzs: readFileSync(join(directory, `${name}.bzs`)),
      bzv: readFileSync(join(directory, `${name}.bzv`)),
      bzz: readFileSync(join(directory, `${name}.bzz`)),
    });
    const result = importTskText({ ot: files('ot'), nt: files('nt') });

    const present = fixtureVerseIds();
    const rows = result.rows.filter(
      (row) =>
        present.has(row.fromVerseId) &&
        rangeIsPresent(row.toStartVerseId, row.toEndVerseId, present),
    );

    const payload = {
      $schema: 'tsk-text-subset/1',
      generatedFrom: { sourceId: 'tsk-text', sourceSha256: manifest.sha256 },
      attribution:
        'Treasury of Scripture Knowledge (public domain by age; CrossWire ' +
        'DistributionLicense=Public Domain). Verse ids and tokenizer-normalized phrase keys ' +
        'only — no TSK prose.',
      note:
        'Corpus-scoped subset of the mined phrase triples, cut to rows whose from-verse is in ' +
        'web-subset.json and whose target range touches it, so the fixture build is hermetic ' +
        'and identical in CI. Full-module census at the pinned snapshot: ' +
        `${result.rows.length} triples, ${result.rejected.length} rejected fragments. ` +
        'Regenerate with scripts/generateTskTextSubset.ts.',
      rows,
    };
    writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
    process.stdout.write(
      `wrote ${OUT}\n  phrase triples: ${rows.length} (of ${result.rows.length} in the full module)\n`,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

main();
