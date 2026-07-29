/**
 * Builds the dev-fixture corpus database that CI gates against.
 *
 * Writes to a gitignored path — the database is a build product, never a Git
 * object. CI rebuilds it from the committed fixture JSON on every run, which
 * means the gates always test the code against data whose provenance is in
 * the repo, with no network dependency and no stale binary.
 */

import { readFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DatabaseSync } from 'node:sqlite';

import { buildCorpus, type SqliteDatabase } from './buildCorpus.js';
import { importVerseArray, type VerseArraySource } from './importers/verseArrayImporter.js';
import type { TranslationImport } from './importers/types.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const PIPELINE_ROOT = join(HERE, '..');

export const FIXTURE_DB_PATH = join(PIPELINE_ROOT, 'output', 'fixture.db');
const FIXTURE_JSON = join(PIPELINE_ROOT, 'fixtures', 'web-subset.json');
const WEB_MANIFEST = join(PIPELINE_ROOT, 'manifests', 'web.json');

interface FixtureFile extends VerseArraySource {
  readonly generatedFrom: { readonly sourceSha256: string };
}

export function buildFixtureDatabase(targetPath: string = FIXTURE_DB_PATH): {
  readonly path: string;
  readonly verseCount: number;
  readonly corpusFingerprint: string;
  readonly distinctTokenCount: number;
} {
  const fixture = JSON.parse(readFileSync(FIXTURE_JSON, 'utf8')) as FixtureFile;
  const manifest = JSON.parse(readFileSync(WEB_MANIFEST, 'utf8')) as {
    sha256: string;
    label: string;
    attributionNote?: string;
    licenseRecord: string;
  };

  // The fixture records the SHA of the full export it was cut from. If that
  // no longer matches the manifest, the fixture and the rights record refer
  // to different artifacts — fail rather than build something whose
  // provenance claim is stale.
  if (fixture.generatedFrom.sourceSha256 !== manifest.sha256) {
    throw new Error(
      'buildFixtureDb: fixture was generated from a different WEB export than ' +
        `manifests/web.json records (fixture ${fixture.generatedFrom.sourceSha256}, ` +
        `manifest ${manifest.sha256}). Regenerate the fixture or update the manifest.`,
    );
  }

  const translation: TranslationImport = {
    code: 'WEB',
    name: manifest.label,
    sourceId: 'web',
    attributionText: `${manifest.licenseRecord}${
      manifest.attributionNote ? ` ${manifest.attributionNote}` : ''
    }`,
    sha256: manifest.sha256,
    verses: importVerseArray(fixture),
  };

  mkdirSync(dirname(targetPath), { recursive: true });
  rmSync(targetPath, { force: true });

  const database = new DatabaseSync(targetPath);
  try {
    database.exec('PRAGMA journal_mode = MEMORY');
    const result = buildCorpus(database as unknown as SqliteDatabase, [translation], {
      // Fixed timestamp: the fixture build must be byte-reproducible, and a
      // wall-clock value would change the corpus identity on every run.
      builtAt: '2026-07-29T00:00:00.000Z',
    });
    return {
      path: targetPath,
      verseCount: result.verseCount,
      corpusFingerprint: result.corpusFingerprint,
      distinctTokenCount: result.distinctTokenCount,
    };
  } finally {
    database.close();
  }
}

// Allow `tsx src/buildFixtureDb.ts` as a CLI, and import from tests/gates.
if (process.argv[1] && process.argv[1].endsWith('buildFixtureDb.ts')) {
  const result = buildFixtureDatabase();
  process.stdout.write(
    `Built ${result.path}\n` +
      `  verses: ${result.verseCount}\n` +
      `  distinct tokens: ${result.distinctTokenCount}\n` +
      `  corpus fingerprint: ${result.corpusFingerprint}\n`,
  );
}
