/**
 * Builds the dev-fixture corpus database that CI gates against.
 *
 * Writes to a gitignored path — the database is a build product, never a Git
 * object. CI rebuilds it from the committed fixture JSON on every run, which
 * means the gates always test the code against data whose provenance is in
 * the repo, with no network dependency and no stale binary.
 */

import { existsSync, readdirSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DatabaseSync } from 'node:sqlite';

import {
  buildConceptLayer,
  type ConceptLayerInput,
  type ConceptLayerResult,
} from './buildConceptLayer.js';
import { buildCorpus, type SqliteDatabase } from './buildCorpus.js';
import {
  buildSpellingIndex,
  type SpellingIndexResult,
  type SqliteReadWriteDatabase,
} from './buildSpellingIndex.js';
import { buildAliasLayer, type AliasLayerResult } from './buildAliasLayer.js';
import { compileHymnAliases } from './importers/aliasImporter.js';
import { compileOntology } from './importers/ontologyImporter.js';
import type {
  CrossReferenceRow,
  TopicAnchorRow,
} from './importers/openbibleImporter.js';
import type { ManifestSet, SourceManifest } from './provenance/manifest.js';
import { importVerseArray, type VerseArraySource } from './importers/verseArrayImporter.js';
import type { TranslationImport } from './importers/types.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const PIPELINE_ROOT = join(HERE, '..');

export const FIXTURE_DB_PATH = join(PIPELINE_ROOT, 'output', 'fixture.db');
const FIXTURE_JSON = join(PIPELINE_ROOT, 'fixtures', 'web-subset.json');
const WEB_MANIFEST = join(PIPELINE_ROOT, 'manifests', 'web.json');
const MANIFEST_DIR = join(PIPELINE_ROOT, 'manifests');
const ONTOLOGY_DIR = join(PIPELINE_ROOT, '..', 'ontology', 'concepts');
const ALIASES_DIR = join(PIPELINE_ROOT, '..', 'ontology', 'aliases');
const OPENBIBLE_SUBSET = join(PIPELINE_ROOT, 'fixtures', 'openbible-subset.json');
const PASSAGE_TERMS_SUBSET = join(PIPELINE_ROOT, 'fixtures', 'passage-terms-subset.json');
const TRANSLATION_TOKENS = join(PIPELINE_ROOT, 'fixtures', 'translation-tokens.json');

function loadManifests(): ManifestSet {
  const sources = readdirSync(MANIFEST_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(MANIFEST_DIR, name), 'utf8')) as SourceManifest);
  return { sources };
}

function loadOntologyFiles(): { name: string; contents: string }[] {
  if (!existsSync(ONTOLOGY_DIR)) return [];
  return readdirSync(ONTOLOGY_DIR)
    .filter((name) => name.endsWith('.yaml'))
    .sort()
    .map((name) => ({ name, contents: readFileSync(join(ONTOLOGY_DIR, name), 'utf8') }));
}

function loadAliasFiles(): { name: string; contents: string }[] {
  if (!existsSync(ALIASES_DIR)) return [];
  return readdirSync(ALIASES_DIR)
    .filter((name) => name.endsWith('.yaml'))
    .sort()
    .map((name) => ({ name, contents: readFileSync(join(ALIASES_DIR, name), 'utf8') }));
}

interface FixtureFile extends VerseArraySource {
  readonly generatedFrom: { readonly sourceSha256: string };
}

function uniqueVersesById(verses: readonly TranslationImport['verses'][number][]) {
  const seen = new Set<number>();
  return verses.filter((verse) => {
    if (seen.has(verse.verseId)) return false;
    seen.add(verse.verseId);
    return true;
  });
}

export function buildFixtureDatabase(targetPath: string = FIXTURE_DB_PATH): {
  readonly path: string;
  readonly verseCount: number;
  readonly corpusFingerprint: string;
  readonly distinctTokenCount: number;
  /**
   * NOTE: conceptLayer.layerFingerprint is the PRE-spelling value and
   * spelling.layerFingerprint the PRE-alias value; the artifact's final
   * layer identity (meta layer_fingerprint) is aliases.layerFingerprint,
   * which chains concept → spelling → aliases (QR-6; equal to the spelling
   * value when no alias rows ship).
   */
  readonly conceptLayer: ConceptLayerResult | null;
  readonly spelling: SpellingIndexResult;
  /**
   * QR-6 curated aliases, chained LAST: the artifact's final layer identity
   * is aliases.layerFingerprint (equal to spelling.layerFingerprint exactly
   * when no alias rows shipped — the rollback/empty-pack no-op).
   */
  readonly aliases: AliasLayerResult;
  readonly ontologyErrors: readonly string[];
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
    verses: uniqueVersesById(importVerseArray(fixture)),
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

    // ---- Layer A ----
    const ontologyFiles = loadOntologyFiles();
    const { ontology, errors } = compileOntology(ontologyFiles);
    if (errors.length > 0) {
      // Curation errors fail the build. A dangling anchor or an unparseable
      // reference is a concept that silently does nothing, which is worse
      // than one that loudly does not exist.
      throw new Error(`buildFixtureDb: ontology errors:\n  ${errors.join('\n  ')}`);
    }

    // The fixture build ALWAYS reads the committed, corpus-scoped OpenBible
    // subset — never the full gitignored downloads. Preferring the downloads
    // when present would make the build differ between a developer's machine
    // and CI, and a probe baseline that means different things in different
    // places measures nothing. Full sources are for real artifact builds.
    const subset = JSON.parse(readFileSync(OPENBIBLE_SUBSET, 'utf8')) as {
      topicRows: TopicAnchorRow[];
      crossReferences: CrossReferenceRow[];
    };
    const topicRows = subset.topicRows;
    const crossReferences = subset.crossReferences;

    // Layer B distillate. Committed for the same hermeticity reason as the
    // OpenBible subset: the 1.3 MB source volume is gitignored, so a build
    // that depended on it would differ between a developer's machine and CI.
    const verseTerms = existsSync(PASSAGE_TERMS_SUBSET)
      ? (JSON.parse(readFileSync(PASSAGE_TERMS_SUBSET, 'utf8')) as {
          terms: ConceptLayerInput['verseTerms'];
        }).terms
      : [];

    // Cross-translation vocabulary, scoped to the fixture corpus by the
    // builder's presentVerseIds check.
    const translationTokens = new Map<number, readonly string[]>();
    if (existsSync(TRANSLATION_TOKENS)) {
      const file = JSON.parse(readFileSync(TRANSLATION_TOKENS, 'utf8')) as {
        tokens: Record<string, string>;
      };
      for (const [verseId, tokens] of Object.entries(file.tokens)) {
        translationTokens.set(Number(verseId), tokens.split(' ').filter(Boolean));
      }
    }

    const presentVerseIds = new Set(translation.verses.map((verse) => verse.verseId));
    const conceptLayer =
      ontology.concepts.length > 0
        ? buildConceptLayer(database as unknown as SqliteDatabase, {
            ontology,
            topicRows,
            crossReferences,
            manifests: loadManifests(),
            presentVerseIds,
            verseTerms,
            translationTokens,
          })
        : null;

    // Spelling index next-to-last (schema v7): it reads the vocabulary back
    // out of everything written above and chains the layer fingerprint, so
    // the gauntlet's hermetic artifact carries the same tables a release
    // does.
    const spelling = buildSpellingIndex(database as unknown as SqliteReadWriteDatabase);

    // Curated aliases LAST (QR-6, 0.13.0 — no schema bump): reviewed pack
    // rows compiled against the ontology just written, chained onto the
    // spelling fingerprint. An empty pack set is a byte-level no-op.
    const aliasFiles = loadAliasFiles();
    const compiledAliases = compileHymnAliases(
      aliasFiles,
      new Set(ontology.concepts.map((concept) => concept.id)),
    );
    if (compiledAliases.errors.length > 0) {
      throw new Error(
        `buildFixtureDb: alias pack errors:\n  ${compiledAliases.errors.join('\n  ')}`,
      );
    }
    const aliases = buildAliasLayer(
      database as unknown as SqliteReadWriteDatabase,
      compiledAliases.rows,
      loadManifests(),
    );

    return {
      path: targetPath,
      verseCount: result.verseCount,
      corpusFingerprint: result.corpusFingerprint,
      distinctTokenCount: result.distinctTokenCount,
      conceptLayer,
      spelling,
      aliases,
      ontologyErrors: errors,
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
      `  corpus fingerprint: ${result.corpusFingerprint}\n` +
      (result.conceptLayer
        ? `  concepts: ${result.conceptLayer.concepts}\n` +
          `  lexicon entries: ${result.conceptLayer.lexiconEntries}\n` +
          `  editorial anchors: ${result.conceptLayer.editorialAnchors}\n` +
          `  openbible topic anchors: ${result.conceptLayer.topicAnchors}\n` +
          `  cross references: ${result.conceptLayer.crossReferences}\n` +
          `  verse terms: ${result.conceptLayer.verseTerms}\n` +
          `  translation tokens: ${result.conceptLayer.translationTokens}\n` +
          `  dropped (outside fixture corpus): ${result.conceptLayer.droppedOutOfCorpus}\n`
        : '  concept layer: none\n') +
      `  spelling terms: ${result.spelling.termCount}\n` +
      `  spelling delete rows: ${result.spelling.deleteRowCount}\n` +
      `  curated aliases: ${result.aliases.aliasCount}\n` +
      `  layer fingerprint (final, post-alias): ${result.aliases.layerFingerprint}\n`,
  );
}
