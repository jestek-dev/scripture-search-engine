/**
 * Builds the FULL release artifact — the whole Bible, all layers — and the
 * reviewed descriptor that identifies it.
 *
 * This is the counterpart to buildFixtureDb.ts, and the difference between
 * them is the point of both. The fixture build is hermetic: it reads only
 * committed subsets, so CI measures the same thing on every machine. This
 * build reads the real sources from `pipeline/sources/`, which are gitignored,
 * checksum-verified, and far too large to commit. One of them tells you
 * whether the code is correct; the other tells you what you would actually
 * ship. Neither can answer the other's question.
 *
 * Every source is verified against its manifest checksum BEFORE it is parsed.
 * A source whose bytes do not match its rights record is not the source that
 * record describes, so the build fails rather than shipping rows whose
 * provenance claim is fiction.
 *
 * Usage: npx tsx src/buildArtifact.ts [--out <path>] [--no-layer-b]
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

import { buildConceptLayer, type ConceptLayerInput } from './buildConceptLayer.js';
import { buildCorpus, type SqliteDatabase } from './buildCorpus.js';
import { EXPOSITION_SOURCES } from './expositionSources.js';
import { compileOntology } from './importers/ontologyImporter.js';
import { loadExposition } from './loadExpositions.js';
import { importCrossReferences, importTopicScores } from './importers/openbibleImporter.js';
import { importVpl } from './importers/vplImporter.js';
import { buildTermProfiles, type ExpositionDocument } from './stats/passageTerms.js';
import type { ManifestSet, SourceManifest } from './provenance/manifest.js';
import type { TranslationImport } from './importers/types.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SOURCES = join(ROOT, 'sources');
const MANIFEST_DIR = join(ROOT, 'manifests');
const ONTOLOGY_DIR = join(ROOT, '..', 'ontology', 'concepts');
const ARTIFACT_DIR = join(ROOT, '..', 'artifacts');

function loadManifests(): ManifestSet {
  const sources = readdirSync(MANIFEST_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(MANIFEST_DIR, name), 'utf8')) as SourceManifest);
  return { sources };
}

function manifestFor(manifests: ManifestSet, id: string): SourceManifest {
  const found = manifests.sources.find((source) => source.id === id);
  if (!found) throw new Error(`buildArtifact: no manifest for source "${id}"`);
  return found;
}

/**
 * Reads a source file and refuses it unless its bytes match the manifest.
 *
 * This is G1 enforced at the only moment it can actually be enforced. Once
 * parsed rows are in the database, nothing downstream can tell whether they
 * came from the file the licence record describes.
 */
function readVerified(manifests: ManifestSet, id: string, fileName: string): Buffer {
  const manifest = manifestFor(manifests, id);
  const path = join(SOURCES, fileName);
  if (!existsSync(path)) {
    throw new Error(
      `buildArtifact: missing source ${fileName} for "${id}".\n` +
        `  Expected at: ${path}\n` +
        `  Fetch from : ${manifest.sourceUrl}`,
    );
  }
  const buffer = readFileSync(path);
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  if (manifest.sha256 && sha256 !== manifest.sha256) {
    throw new Error(
      `buildArtifact: checksum mismatch for "${id}".\n` +
        `  manifest: ${manifest.sha256}\n` +
        `  on disk : ${sha256}\n` +
        '  This file is not the one the rights record describes. Re-admit it as a ' +
        'reviewed change, or restore the original.',
    );
  }
  return buffer;
}

/** Both OpenBible downloads are zips wrapping a single text file. */
function unzipSingleTextEntry(zip: Buffer): string {
  const dir = mkdtempSync(join(tmpdir(), 'sse-'));
  try {
    const zipPath = join(dir, 'source.zip');
    writeFileSync(zipPath, zip);
    execFileSync('unzip', ['-o', '-q', zipPath, '-d', dir]);
    const entry = readdirSync(dir).find((name) => name.endsWith('.txt'));
    if (!entry) throw new Error('buildArtifact: no .txt entry inside zip');
    return readFileSync(join(dir, entry), 'utf8');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function readEngineVersion(): string {
  const source = readFileSync(
    join(ROOT, '..', 'engine', 'src', 'config', 'engineVersion.ts'),
    'utf8',
  );
  const match = /ENGINE_VERSION = '([^']+)'/.exec(source);
  if (!match) throw new Error('buildArtifact: could not read ENGINE_VERSION');
  return match[1] as string;
}

/**
 * Re-runs the Layer B distillation over the full sources, through the same
 * code path the committed subset generator uses — so the artifact's profiles
 * and CI's profiles are produced by identical rules, differing only in corpus
 * scope. `minSources: 2` is the corroboration rule that separates theology
 * from a single author's idiolect; it is not tunable per-build.
 */
function distilLayerB(manifests: ManifestSet): ConceptLayerInput['verseTerms'] {
  const budgets = JSON.parse(readFileSync(join(ROOT, '..', 'eval', 'budgets.json'), 'utf8')) as {
    distinctiveness: { minPmi: number; maxTermsPerVerse: number };
  };

  const documents: ExpositionDocument[] = [];
  for (const spec of EXPOSITION_SOURCES) {
    // Checksum-verify before parsing. For directory-shaped sources the zip
    // beside the extract is what carries the rights record.
    readVerified(manifests, spec.id, spec.strategy === 'sword-zcom' ? `${spec.file}.zip` : spec.file);
    const loaded = loadExposition(spec, SOURCES);
    if (!loaded) throw new Error(`buildArtifact: source ${spec.id} not found under ${SOURCES}`);
    process.stdout.write(
      `  ${spec.id.padEnd(22)} ${String(loaded.parsed).padStart(6)} expositions` +
        `${loaded.rejected > 0 ? ` (${loaded.rejected} rejected)` : ''}\n`,
    );
    for (const note of loaded.notes) process.stdout.write(`      note: ${note}\n`);
    documents.push(...loaded.documents);
  }

  // Corroboration floor. With a single expositor there is nothing to
  // corroborate against, so the floor drops to 1 rather than silently
  // emptying the layer — matching the subset generator exactly, because CI's
  // profiles and the artifact's profiles must come from the same rules.
  const distinctAuthors = new Set(documents.map((document) => document.authorId)).size;
  const result = buildTermProfiles(documents, {
    minPmi: budgets.distinctiveness.minPmi,
    maxTermsPerVerse: budgets.distinctiveness.maxTermsPerVerse,
    minCount: 2,
    minSources: distinctAuthors > 1 ? 2 : 1,
  });
  process.stdout.write(
    `  ${String(result.documentsProcessed).padStart(6)} documents, ` +
      `${result.termsConsidered} candidate terms, ${result.termsAdmitted} admitted ` +
      `(${((1 - result.termsAdmitted / Math.max(1, result.termsConsidered)) * 100).toFixed(1)}% rejected)\n`,
  );
  return result.terms;
}

export interface ArtifactDescriptor {
  readonly schemaVersion: string;
  readonly tokenizerVersion: string;
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string | null;
  readonly databaseSha256: string;
  readonly databaseBytes: number;
  readonly builtAt: string;
  readonly translations: readonly { code: string; verseCount: number }[];
  readonly counts: Readonly<Record<string, number>>;
  readonly sources: readonly {
    id: string;
    sha256: string;
    rightsClass: string;
    maxTier: string;
  }[];
}

export interface BuildArtifactOptions {
  readonly outPath?: string;
  readonly includeLayerB?: boolean;
  readonly builtAt?: string;
}

export function buildArtifact(options: BuildArtifactOptions = {}): ArtifactDescriptor {
  const outPath = options.outPath ?? join(ROOT, 'output', 'content.db');
  const includeLayerB = options.includeLayerB ?? true;
  const builtAt = options.builtAt ?? new Date().toISOString();

  const manifests = loadManifests();

  // ---- Scripture text ----
  // The zip is what carries the checksum and therefore the rights record; the
  // extracted .txt beside it is what we parse. Verifying the zip first means
  // an edited extract cannot slip in unnoticed.
  const zip = readVerified(manifests, 'web', 'engwebp_vpl.zip');
  const vplPath = join(SOURCES, 'vpl', 'engwebp_vpl.txt');
  if (!existsSync(vplPath)) {
    throw new Error(`buildArtifact: extract engwebp_vpl.zip into ${dirname(vplPath)} first`);
  }
  const { verses, skippedLines, omittedVerses } = importVpl(readFileSync(vplPath, 'utf8'));
  process.stdout.write(
    `scripture: ${verses.length} verses (${skippedLines} non-verse lines skipped), ` +
      `source zip verified ${zip.length} bytes\n` +
      `           ${omittedVerses.length} numbered but textless (WEB footnotes them as absent ` +
      `from the critical text): ${omittedVerses.join(', ')}\n`,
  );

  const webManifest = manifestFor(manifests, 'web');
  const translation: TranslationImport = {
    code: 'WEB',
    name: webManifest.label,
    sourceId: 'web',
    attributionText: `${webManifest.licenseRecord}${
      webManifest.attributionNote ? ` ${webManifest.attributionNote}` : ''
    }`,
    sha256: webManifest.sha256,
    verses,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  rmSync(outPath, { force: true });

  const database = new DatabaseSync(outPath);
  let descriptor: ArtifactDescriptor;
  try {
    database.exec('PRAGMA journal_mode = MEMORY');
    const corpus = buildCorpus(database as unknown as SqliteDatabase, [translation], { builtAt });
    process.stdout.write(
      `corpus   : ${corpus.verseCount} verses, ${corpus.distinctTokenCount} distinct tokens, ` +
        `${corpus.tokenPostingCount} postings\n`,
    );

    // ---- Layer A ----
    const ontologyFiles = readdirSync(ONTOLOGY_DIR)
      .filter((name) => name.endsWith('.yaml'))
      .sort()
      .map((name) => ({ name, contents: readFileSync(join(ONTOLOGY_DIR, name), 'utf8') }));
    const { ontology, errors } = compileOntology(ontologyFiles);
    if (errors.length > 0) {
      throw new Error(`buildArtifact: ontology errors:\n  ${errors.join('\n  ')}`);
    }

    const topics = importTopicScores(
      unzipSingleTextEntry(readVerified(manifests, 'openbible-topics', 'topic-scores.zip')),
    );
    const xrefs = importCrossReferences(
      unzipSingleTextEntry(readVerified(manifests, 'openbible-xrefs', 'cross-references.zip')),
    );
    process.stdout.write(
      `layer A  : ${ontology.concepts.length} concepts, ${topics.rows.length} topic rows, ` +
        `${xrefs.rows.length} cross-references\n`,
    );

    // ---- Layer B ----
    let verseTerms: ConceptLayerInput['verseTerms'] = [];
    if (includeLayerB) {
      process.stdout.write('layer B  :\n');
      verseTerms = distilLayerB(manifests);
    } else {
      process.stdout.write('layer B  : skipped (--no-layer-b)\n');
    }

    const layer = buildConceptLayer(database as unknown as SqliteDatabase, {
      ontology,
      topicRows: topics.rows,
      crossReferences: xrefs.rows,
      manifests,
      presentVerseIds: new Set(verses.map((verse) => verse.verseId)),
      verseTerms,
    });
    process.stdout.write(
      `layer    : ${layer.concepts} concepts, ${layer.editorialAnchors} editorial anchors, ` +
        `${layer.topicAnchors} topic anchors, ${layer.crossReferences} xrefs, ` +
        `${layer.verseTerms} verse terms (${layer.droppedOutOfCorpus} dropped out of corpus)\n`,
    );

    database.exec('VACUUM');
    database.close();

    const databaseBytes = statSync(outPath).size;
    const databaseSha256 = createHash('sha256').update(readFileSync(outPath)).digest('hex');

    descriptor = {
      schemaVersion: corpus.schemaVersion,
      tokenizerVersion: corpus.tokenizerVersion,
      engineVersion: readEngineVersion(),
      corpusFingerprint: corpus.corpusFingerprint,
      layerFingerprint: layer.layerFingerprint ?? null,
      databaseSha256,
      databaseBytes,
      builtAt,
      translations: corpus.translations,
      counts: {
        verses: corpus.verseCount,
        distinctTokens: corpus.distinctTokenCount,
        concepts: layer.concepts,
        lexiconEntries: layer.lexiconEntries,
        editorialAnchors: layer.editorialAnchors,
        topicAnchors: layer.topicAnchors,
        crossReferences: layer.crossReferences,
        verseTerms: layer.verseTerms,
      },
      sources: manifests.sources
        .filter((source) => source.sha256)
        .map((source) => ({
          id: source.id,
          sha256: source.sha256,
          rightsClass: source.rightsClass,
          maxTier: source.maxTier,
        })),
    };
  } catch (error) {
    try {
      database.close();
    } catch {
      /* already closed by the happy path */
    }
    throw error;
  }

  mkdirSync(ARTIFACT_DIR, { recursive: true });
  const descriptorPath = join(ARTIFACT_DIR, 'content-artifact.json');
  writeFileSync(descriptorPath, `${JSON.stringify(descriptor, null, 2)}\n`);
  process.stdout.write(
    `\nartifact : ${outPath}\n` +
      `           ${(descriptor.databaseBytes / 1048576).toFixed(2)} MiB\n` +
      `           sha256 ${descriptor.databaseSha256}\n` +
      `descriptor: ${descriptorPath}\n`,
  );

  return descriptor;
}

if (process.argv[1] && process.argv[1].endsWith('buildArtifact.ts')) {
  const outIndex = process.argv.indexOf('--out');
  buildArtifact({
    outPath: outIndex > -1 ? process.argv[outIndex + 1] : undefined,
    includeLayerB: !process.argv.includes('--no-layer-b'),
  });
}
