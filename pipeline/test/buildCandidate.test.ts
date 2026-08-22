import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { promisify } from 'node:util';

import {
  createEngine,
  ENGINE_VERSION,
  TOKENIZER_VERSION,
  type ContentQueryPort,
  type ContentQueryResult,
  type ContentScalar,
} from '@jestek-dev/scripture-engine';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  buildCandidate,
  buildCandidateFromRequestFile,
  CandidateBuildError,
  createReviewedSourceSnapshot,
  type CandidateBuildRequest,
  type ReviewedSourceSnapshot,
} from '../src/buildCandidate.js';
import { buildFixtureDatabase } from '../src/buildFixtureDb.js';
import { aliasLayerFingerprint, readCuratedAliasRows } from '../src/buildAliasLayer.js';
import {
  assembleSpellingVocabulary,
  readSpellingVocabularySources,
  spellingLayerFingerprint,
  type SqliteReadWriteDatabase,
} from '../src/buildSpellingIndex.js';
import { compileOntology, type CompiledOntology } from '../src/importers/ontologyImporter.js';
import { manifestFingerprint, type ManifestSet, type SourceManifest } from '../src/provenance/manifest.js';

const REPOSITORY_ROOT = resolve(import.meta.dirname, '..', '..');
const CASE_ID = '123e4567-e89b-42d3-a456-426614174000';
const ONTOLOGY_PATH = 'ontology/concepts/hope-in-god.yaml';
const FIXTURE_PATH = 'eval/golden/hope-in-god.json';
const execFileAsync = promisify(execFile);

let sandbox = '';
let baseDatabasePath = '';
let baseDescriptorPath = '';
let baseDescriptor: Record<string, unknown>;
let reviewedSources: ReviewedSourceSnapshot;
let baseSha = '';

function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`;
}

function proposalDigest(proposal: unknown): string {
  return sha256(stableJson(proposal));
}

function canonicalScalar(value: unknown): string {
  if (value === null) return 'null';
  if (Buffer.isBuffer(value)) return `blob:${value.toString('hex')}`;
  if (typeof value === 'number') return `number:${Object.is(value, -0) ? '-0' : String(value)}`;
  if (typeof value === 'bigint') return `bigint:${value}`;
  if (typeof value === 'string') return `text:${Buffer.byteLength(value)}:${value}`;
  return `other:${String(value)}`;
}

function quoteIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function logicalTableDigests(database: DatabaseSync): Record<string, string> {
  const tables = (database.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  ).all() as { name: string }[]).map((row) => row.name)
    .filter((name) => name === 'verses_fts' || !name.startsWith('verses_fts_'));
  return Object.fromEntries(tables.map((table) => {
    const columns = (database.prepare(`PRAGMA table_info(${quoteIdentifier(table)})`).all() as { name: string }[]).map((row) => row.name);
    const rows = database.prepare(`SELECT * FROM ${quoteIdentifier(table)} ORDER BY ${columns.map(quoteIdentifier).join(', ')}`).iterate() as Iterable<Record<string, unknown>>;
    const hash = createHash('sha256');
    for (const row of rows) {
      const record = stableJson(Object.fromEntries(Object.keys(row).sort().map((key) => [key, canonicalScalar(row[key])])));
      hash.update(String(Buffer.byteLength(record)));
      hash.update(':');
      hash.update(record);
    }
    return [table, hash.digest('hex')];
  }));
}

function policyFingerprint(snapshot: ReviewedSourceSnapshot): string {
  const sources = snapshot.files.filter((file) => file.path.startsWith('pipeline/manifests/')).map((file) => {
    const source = JSON.parse(file.contents) as Record<string, unknown>;
    return {
      id: source.id,
      contentIdentity: source.contentSha256 ?? source.sha256 ?? '',
      rightsClass: source.rightsClass,
      maxTier: source.maxTier,
      licenseAssertionSha256: sha256(String(source.licenseRecord)),
      lineageOnly: source.lineageOnly === true,
      derivedFrom: [...((source.derivedFrom as string[] | undefined) ?? [])].sort(),
    };
  }).sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return sha256(stableJson(sources));
}

async function runCandidateCli(requestPath: string): Promise<Record<string, unknown>> {
  const result = await execFileAsync(process.execPath, [
    '--max-old-space-size=8192',
    join(REPOSITORY_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs'),
    join(REPOSITORY_ROOT, 'pipeline', 'src', 'buildCandidate.ts'),
    '--request',
    requestPath,
  ], { cwd: REPOSITORY_ROOT, windowsHide: true, timeout: 180_000, maxBuffer: 10 * 1024 * 1024 });
  const lines = result.stdout.trim().split(/\r?\n/).filter((line) => line.trim().startsWith('{'));
  expect(lines).toHaveLength(1);
  return JSON.parse(lines[0]!) as Record<string, unknown>;
}

function readMeta(database: DatabaseSync): Map<string, string> {
  return new Map((database.prepare('SELECT key, value FROM meta').all() as { key: string; value: string }[])
    .map((row) => [row.key, row.value]));
}

function rowCount(database: DatabaseSync, table: string): number {
  return Number((database.prepare(`SELECT COUNT(*) AS count FROM "${table}"`).get() as { count: number }).count);
}

function sourceFiles(): { path: string; contents: string }[] {
  const files: { path: string; contents: string }[] = [];
  for (const name of readdirSync(join(REPOSITORY_ROOT, 'ontology', 'concepts')).filter((entry) => entry.endsWith('.yaml')).sort()) {
    files.push({ path: `ontology/concepts/${name}`, contents: readFileSync(join(REPOSITORY_ROOT, 'ontology', 'concepts', name), 'utf8') });
  }
  for (const name of readdirSync(join(REPOSITORY_ROOT, 'pipeline', 'manifests')).filter((entry) => entry.endsWith('.json')).sort()) {
    files.push({ path: `pipeline/manifests/${name}`, contents: readFileSync(join(REPOSITORY_ROOT, 'pipeline', 'manifests', name), 'utf8') });
  }
  files.push({ path: FIXTURE_PATH, contents: readFileSync(join(REPOSITORY_ROOT, ...FIXTURE_PATH.split('/')), 'utf8') });
  return files;
}

function manifests(): ManifestSet {
  return {
    sources: readdirSync(join(REPOSITORY_ROOT, 'pipeline', 'manifests'))
      .filter((entry) => entry.endsWith('.json'))
      .sort()
      .map((entry) => JSON.parse(readFileSync(join(REPOSITORY_ROOT, 'pipeline', 'manifests', entry), 'utf8')) as SourceManifest),
  };
}

function lexiconProposal(phrase = 'candidate quality phrase'): Record<string, unknown> {
  const ontology = reviewedSources.files.find((file) => file.path === ONTOLOGY_PATH)!;
  return {
    schemaVersion: 1,
    proposalId: 'candidate-quality-review',
    fixtureId: 'hope-in-god',
    caseIds: [CASE_ID],
    sourcePreconditions: [{ path: ONTOLOGY_PATH, sha256: ontology.sha256 }],
    operations: [{
      operationId: 'add-candidate-phrase',
      type: 'lexicon-phrase-add',
      sourcePaths: [ONTOLOGY_PATH],
      provenance: {
        source: 'editorial', confirmed: true, reviewer: 'candidate-test',
        evidence: 'Reviewed against the linked case and source snapshot.',
      },
      reason: 'Adds a reviewed phrase that should resolve to the existing hope concept.',
      conceptId: 'hope-in-god',
      phrase,
    }],
  };
}

function ontologyProposal(
  proposalId: string,
  operations: readonly Record<string, unknown>[],
): Record<string, unknown> {
  const ontology = reviewedSources.files.find((file) => file.path === ONTOLOGY_PATH)!;
  return {
    schemaVersion: 1,
    proposalId,
    fixtureId: 'hope-in-god',
    caseIds: [CASE_ID],
    sourcePreconditions: [{ path: ONTOLOGY_PATH, sha256: ontology.sha256 }],
    operations,
  };
}

function commonOntologyOperation(operationId: string): Record<string, unknown> {
  return {
    operationId,
    sourcePaths: [ONTOLOGY_PATH],
    provenance: {
      source: 'editorial', confirmed: true, reviewer: 'candidate-test',
      evidence: 'Reviewed against the exact compiler identity and source snapshot.',
    },
    reason: 'Exercises canonical candidate identity matching against reviewed source rows.',
    conceptId: 'hope-in-god',
  };
}

function noOpProposal(): Record<string, unknown> {
  const fixture = reviewedSources.files.find((file) => file.path === FIXTURE_PATH)!;
  return {
    schemaVersion: 1,
    proposalId: 'fixture-only-review',
    fixtureId: 'hope-in-god',
    caseIds: [CASE_ID],
    sourcePreconditions: [{ path: FIXTURE_PATH, sha256: fixture.sha256 }],
    operations: [{
      operationId: 'upsert-fixture-only',
      type: 'golden-fixture-upsert',
      sourcePaths: [FIXTURE_PATH],
      provenance: {
        source: 'editorial', confirmed: true, reviewer: 'candidate-test',
        evidence: 'Reviewed fixture-only expectation with no artifact-layer edit.',
      },
      reason: 'Updates evaluation evidence but deliberately has no candidate database effect.',
      goldenFixtureId: 'hope-in-god',
      fixture: { id: 'hope-in-god', query: 'hope', status: 'pending' },
    }],
  };
}

function draftProposal(): { proposal: Record<string, unknown>; path: string } {
  const sourcePath = 'ontology/concepts/candidate-patient-hope.yaml';
  return {
    path: sourcePath,
    proposal: {
      schemaVersion: 1,
      proposalId: 'candidate-draft-review',
      fixtureId: 'hope-in-god',
      caseIds: [CASE_ID],
      sourcePreconditions: [{ path: sourcePath, sha256: sha256('') }],
      operations: [{
        operationId: 'create-patient-hope',
        type: 'concept-draft-create',
        sourcePaths: [sourcePath],
        provenance: {
          source: 'editorial', confirmed: true, reviewer: 'candidate-test',
          evidence: 'Reviewed a complete new concept against the linked case.',
        },
        reason: 'Creates a reviewed concept in the isolated candidate layer.',
        draft: {
          id: 'candidate-patient-hope',
          label: 'Candidate patient hope',
          lexicon: ['patient candidate hope'],
          anchors: [{ locator: 'Romans 8:25', sources: ['editorial'], weight: 1 }],
          related: ['hope-in-god'],
        },
      }],
    },
  };
}

function mergeDraftProposal(): {
  proposal: Record<string, unknown>;
  targetPath: string;
  draftFiles: readonly { path: string; contents: string }[];
} {
  const targetPath = 'ontology/concepts/candidate-merged-hope.yaml';
  const drafts = [
    {
      id: 'candidate-patient-draft', label: 'Candidate patient draft', lexicon: ['candidate patient draft phrase'],
      anchors: [{ locator: 'Romans 8:25', sources: ['editorial'], weight: 1 }], related: ['hope-in-god'],
    },
    {
      id: 'candidate-waiting-draft', label: 'Candidate waiting draft', lexicon: ['candidate waiting draft phrase'],
      anchors: [{ locator: 'Romans 8:24', sources: ['editorial'], weight: 1 }], related: ['hope-in-god'],
    },
  ];
  const draftFiles = drafts.map((draft) => ({
    path: `workbench/.state/reviewed-drafts/${draft.id}.json`,
    contents: `${JSON.stringify(draft)}\n`,
  }));
  return {
    targetPath,
    draftFiles,
    proposal: {
      schemaVersion: 1,
      proposalId: 'candidate-reviewed-draft-merge',
      fixtureId: 'hope-in-god',
      caseIds: [CASE_ID],
      sourcePreconditions: [{ path: targetPath, sha256: sha256('') }],
      operations: [{
        operationId: 'merge-candidate-drafts',
        type: 'concept-drafts-merge',
        sourcePaths: [targetPath],
        provenance: {
          source: 'editorial', confirmed: true, reviewer: 'candidate-test',
          evidence: 'Reviewed both hash-bound draft documents before merge.',
        },
        reason: 'Merges two reviewed draft concepts in the isolated candidate layer.',
        draftConceptIds: drafts.map((draft) => draft.id),
        reviewedConcept: {
          id: 'candidate-merged-hope',
          label: 'Candidate merged hope',
          lexicon: ['candidate merged hope phrase'],
          anchors: [{ locator: 'Romans 8:24-25', sources: ['editorial'], weight: 1 }],
          related: ['hope-in-god'],
        },
      }],
    },
  };
}

/**
 * The PRE-v8 concept-layer fingerprint feed, reimplemented verbatim from the
 * pre-CO-3 writer (buildConceptLayer before the pericope wiring): the same
 * c/l/a/r records, NO 'p' records, and the 4-field counts record. This is
 * the independent expectation the mirror's readPericopeRows -> null branch
 * must reproduce byte for byte for older reviewed bases.
 */
function preV8ConceptFingerprint(
  ontology: CompiledOntology,
  counts: {
    topicAnchors: number;
    crossReferences: number;
    verseTerms: number;
    translationTokens: number;
  },
): string {
  const hash = createHash('sha256');
  const feed = (parts: readonly (string | number)[]): void => {
    const record = parts.join(' ');
    hash.update(String(record.length));
    hash.update(' ');
    hash.update(record);
  };
  for (const concept of [...ontology.concepts].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    feed(['c', concept.id, concept.label]);
  }
  for (const entry of [...ontology.lexicon].sort((a, b) =>
    a.conceptId !== b.conceptId ? (a.conceptId < b.conceptId ? -1 : 1) : a.normalized < b.normalized ? -1 : 1)) {
    feed(['l', entry.conceptId, entry.normalized]);
  }
  for (const anchor of [...ontology.anchors].sort((a, b) =>
    a.conceptId !== b.conceptId
      ? (a.conceptId < b.conceptId ? -1 : 1)
      : a.startVerseId - b.startVerseId || (a.sourceId < b.sourceId ? -1 : 1))) {
    feed(['a', anchor.conceptId, anchor.startVerseId, anchor.endVerseId, anchor.sourceId, anchor.weight]);
  }
  for (const edge of [...ontology.related].sort((a, b) =>
    a.conceptId !== b.conceptId ? (a.conceptId < b.conceptId ? -1 : 1) : a.relatedId < b.relatedId ? -1 : 1)) {
    feed(['r', edge.conceptId, edge.relatedId]);
  }
  feed(['counts', counts.topicAnchors, counts.crossReferences, counts.verseTerms, counts.translationTokens]);
  return hash.digest('hex');
}

/**
 * The v8-era concept-layer fingerprint feed, reimplemented verbatim from the
 * CO-3 writer (buildConceptLayer after the pericope wiring, before the v9
 * TSK phrase wiring): c/l/a/r records, 'p' records, NO 'x' records, and the
 * 5-field counts record. This is the independent expectation the mirror's
 * readCrossReferencePhraseRows -> null branch must reproduce byte for byte
 * for v8-era reviewed bases.
 */
function preV9ConceptFingerprint(
  ontology: CompiledOntology,
  counts: {
    topicAnchors: number;
    crossReferences: number;
    verseTerms: number;
    translationTokens: number;
    pericopes: number;
  },
  pericopeRows: readonly { startVerseId: number; endVerseId: number; boundaryVotes: number }[],
): string {
  const hash = createHash('sha256');
  const feed = (parts: readonly (string | number)[]): void => {
    const record = parts.join(' ');
    hash.update(String(record.length));
    hash.update(' ');
    hash.update(record);
  };
  for (const concept of [...ontology.concepts].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    feed(['c', concept.id, concept.label]);
  }
  for (const entry of [...ontology.lexicon].sort((a, b) =>
    a.conceptId !== b.conceptId ? (a.conceptId < b.conceptId ? -1 : 1) : a.normalized < b.normalized ? -1 : 1)) {
    feed(['l', entry.conceptId, entry.normalized]);
  }
  for (const anchor of [...ontology.anchors].sort((a, b) =>
    a.conceptId !== b.conceptId
      ? (a.conceptId < b.conceptId ? -1 : 1)
      : a.startVerseId - b.startVerseId || (a.sourceId < b.sourceId ? -1 : 1))) {
    feed(['a', anchor.conceptId, anchor.startVerseId, anchor.endVerseId, anchor.sourceId, anchor.weight]);
  }
  for (const edge of [...ontology.related].sort((a, b) =>
    a.conceptId !== b.conceptId ? (a.conceptId < b.conceptId ? -1 : 1) : a.relatedId < b.relatedId ? -1 : 1)) {
    feed(['r', edge.conceptId, edge.relatedId]);
  }
  for (const pericope of [...pericopeRows].sort((a, b) => a.startVerseId - b.startVerseId)) {
    feed(['p', pericope.startVerseId, pericope.endVerseId, pericope.boundaryVotes]);
  }
  feed(['counts', counts.topicAnchors, counts.crossReferences, counts.verseTerms, counts.translationTokens, counts.pericopes]);
  return hash.digest('hex');
}

function request(proposal: unknown, outputName: string, snapshot = reviewedSources): CandidateBuildRequest {
  return {
    formatVersion: 1,
    repositoryRoot: REPOSITORY_ROOT,
    baseDatabasePath,
    baseDescriptorPath,
    outputDirectory: join(sandbox, outputName),
    proposalDigest: proposalDigest(proposal),
    proposal,
    reviewedSources: snapshot,
  };
}

function openPort(databasePath: string): ContentQueryPort {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  return {
    async execute(query: string, params: readonly ContentScalar[] = []): Promise<ContentQueryResult> {
      return { rows: database.prepare(query).all(...(params as never[])) as Record<string, ContentScalar>[] };
    },
    async close(): Promise<void> { database.close(); },
  };
}

async function ordering(databasePath: string, query: string): Promise<string[]> {
  const engine = await createEngine(openPort(databasePath));
  try {
    const result = await engine.research(query);
    if (result.kind !== 'discovery') return [`${result.kind}:${query}`];
    return result.results.map((entry) => `${entry.reference}:${entry.score}:${entry.reasons.map((reason) => reason.family).join(',')}`);
  } finally {
    await engine.close();
  }
}

beforeAll(() => {
  sandbox = join(REPOSITORY_ROOT, 'workbench', '.state', `m7-${randomUUID().slice(0, 8)}`);
  mkdirSync(sandbox, { recursive: true });
  baseDatabasePath = join(sandbox, 'reviewed-base.db');
  baseDescriptorPath = join(sandbox, 'reviewed-base.json');
  buildFixtureDatabase(baseDatabasePath);
  const database = new DatabaseSync(baseDatabasePath, { readOnly: true });
  const meta = readMeta(database);
  const manifestSet = manifests();
  baseSha = sha256(readFileSync(baseDatabasePath));
  baseDescriptor = {
    formatVersion: 1,
    distributionTier: 'dev_fixture',
    schemaVersion: meta.get('schema_version'),
    tokenizerVersion: TOKENIZER_VERSION,
    engineVersion: ENGINE_VERSION,
    corpusFingerprint: meta.get('corpus_fingerprint'),
    layerFingerprint: meta.get('layer_fingerprint'),
    manifestFingerprint: manifestFingerprint(manifestSet),
    databaseSha256: baseSha,
    databaseBytes: statSync(baseDatabasePath).size,
    rowCounts: {
      books: rowCount(database, 'books'),
      bookAliases: rowCount(database, 'book_aliases'),
      translations: rowCount(database, 'translations'),
      verses: rowCount(database, 'verses'),
      indexedVerses: rowCount(database, 'verses_fts'),
    },
    sources: manifestSet.sources.filter((source) => source.sha256).map((source) => ({
      id: source.id, sha256: source.sha256, rightsClass: source.rightsClass, maxTier: source.maxTier,
    })),
  };
  database.close();
  writeFileSync(baseDescriptorPath, `${JSON.stringify(baseDescriptor)}\n`);
  reviewedSources = createReviewedSourceSnapshot(sourceFiles());
}, 60_000);

afterAll(() => {
  rmSync(sandbox, { recursive: true, force: true });
});

describe('isolated candidate builder', () => {
  it('builds deterministic logical tables, identities, and engine query ordering', async () => {
    const proposal = lexiconProposal();
    const first = await buildCandidate(request(proposal, 'deterministic-a'));
    const second = await buildCandidate(request(proposal, 'deterministic-b'));

    expect(first.status).toBe('BUILT');
    expect(second.status).toBe('BUILT');
    expect(second.descriptor.logicalTableDigest).toBe(first.descriptor.logicalTableDigest);
    expect(second.descriptor.tableDigests).toEqual(first.descriptor.tableDigests);
    expect(second.descriptor.layerFingerprint).toBe(first.descriptor.layerFingerprint);
    expect(second.descriptor.corpusFingerprint).toBe(first.descriptor.corpusFingerprint);
    expect(await ordering(second.databasePath, 'candidate quality phrase'))
      .toEqual(await ordering(first.databasePath, 'candidate quality phrase'));
    expect(sha256(readFileSync(baseDatabasePath))).toBe(baseSha);
  }, 60_000);

  it('mirrors a pre-v8 base byte-for-byte: readPericopeRows null restores the exact pre-pericope fingerprint feed', async () => {
    // The buildCandidate compatibility story for older reviewed bases
    // (CO-3 PR 1): a base built before schema v8 has no pericopes table
    // (and, before v9, no cross_reference_phrases table either), so the
    // reviewer-side mirror must reproduce the PRE-v8 concept feed —
    // no 'p' records, no 'x' records, 4-field counts record — byte for
    // byte. The expected fingerprint is reimplemented here independently
    // from the pre-change writer's algorithm, so the mirror's null branch
    // is checked against the old bytes, not against itself.
    const preBasePath = join(sandbox, 'pre-v8-base.db');
    copyFileSync(baseDatabasePath, preBasePath);
    const database = new DatabaseSync(preBasePath);
    database.exec('DROP TABLE pericopes; DROP TABLE cross_reference_phrases;');
    const count = (sql: string): number =>
      Number((database.prepare(sql).get() as { count: number }).count);
    const counts = {
      topicAnchors: count("SELECT COUNT(*) AS count FROM concept_anchors WHERE source_id = 'openbible-topics'"),
      crossReferences: count('SELECT COUNT(*) AS count FROM cross_references'),
      verseTerms: count('SELECT COUNT(*) AS count FROM verse_terms'),
      translationTokens: count('SELECT COUNT(*) AS count FROM verse_translation_tokens'),
    };
    const compiled = compileOntology(
      reviewedSources.files
        .filter((file) => file.path.startsWith('ontology/concepts/'))
        .map((file) => ({ name: file.path.split('/').pop()!, contents: file.contents })),
    );
    expect(compiled.errors).toEqual([]);
    const readWrite = database as unknown as SqliteReadWriteDatabase;
    const preV8Fingerprint = aliasLayerFingerprint(
      spellingLayerFingerprint(
        preV8ConceptFingerprint(compiled.ontology, counts),
        assembleSpellingVocabulary(readSpellingVocabularySources(readWrite)),
      ),
      readCuratedAliasRows(readWrite),
    );
    database.prepare('INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)').run('layer_fingerprint', preV8Fingerprint);
    database.prepare('INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)').run('schema_version', '7');
    database.close();
    const preDescriptorPath = join(sandbox, 'pre-v8-base.json');
    writeFileSync(preDescriptorPath, `${JSON.stringify({
      ...baseDescriptor,
      schemaVersion: '7',
      layerFingerprint: preV8Fingerprint,
      databaseSha256: sha256(readFileSync(preBasePath)),
      databaseBytes: statSync(preBasePath).size,
    })}\n`);

    // Positive: the mirror's readPericopeRows -> null branch reproduces the
    // independently computed pre-v8 chain, so the base verifies and the
    // candidate builds — carrying the pre-v8 shape forward.
    const built = await buildCandidate({
      ...request(lexiconProposal('pre v8 mirror phrase'), 'pre-v8-mirror'),
      baseDatabasePath: preBasePath,
      baseDescriptorPath: preDescriptorPath,
    });
    expect(built.status).toBe('BUILT');
    const candidateDatabase = new DatabaseSync(built.databasePath, { readOnly: true });
    expect(Number((candidateDatabase.prepare(
      "SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name = 'pericopes'",
    ).get() as { count: number }).count)).toBe(0);
    candidateDatabase.close();

    // Negative control: the same dropped-tables base still advertising its
    // v9 fingerprint must be REFUSED by the mirror — the 'p'/'x' records
    // and the widened counts fields are load-bearing bytes, not decoration.
    const droppedOnlyPath = join(sandbox, 'pre-v8-dropped-only.db');
    copyFileSync(baseDatabasePath, droppedOnlyPath);
    const droppedOnly = new DatabaseSync(droppedOnlyPath);
    droppedOnly.exec('DROP TABLE pericopes; DROP TABLE cross_reference_phrases;');
    droppedOnly.close();
    const droppedOnlyDescriptorPath = join(sandbox, 'pre-v8-dropped-only.json');
    writeFileSync(droppedOnlyDescriptorPath, `${JSON.stringify({
      ...baseDescriptor,
      databaseSha256: sha256(readFileSync(droppedOnlyPath)),
      databaseBytes: statSync(droppedOnlyPath).size,
    })}\n`);
    await expect(buildCandidate({
      ...request(lexiconProposal('pre v8 mirror phrase'), 'pre-v8-dropped-only'),
      baseDatabasePath: droppedOnlyPath,
      baseDescriptorPath: droppedOnlyDescriptorPath,
    })).rejects.toMatchObject({ code: 'SOURCE_SNAPSHOT_MISMATCH' });
    expect(sha256(readFileSync(baseDatabasePath))).toBe(baseSha);
  }, 120_000);

  it('mirrors a pre-v9 (v8-shaped) base byte-for-byte: readCrossReferencePhraseRows null restores the exact v8 fingerprint feed', async () => {
    // Same compatibility story, one schema era later (P6.3/B3 Phase A): a
    // base built at schema v8 has a pericopes table but no
    // cross_reference_phrases table, so the mirror must reproduce the v8
    // feed — 'p' records, NO 'x' records, 5-field counts — byte for byte.
    const preBasePath = join(sandbox, 'pre-v9-base.db');
    copyFileSync(baseDatabasePath, preBasePath);
    const database = new DatabaseSync(preBasePath);
    database.exec('DROP TABLE cross_reference_phrases');
    const count = (sql: string): number =>
      Number((database.prepare(sql).get() as { count: number }).count);
    const counts = {
      topicAnchors: count("SELECT COUNT(*) AS count FROM concept_anchors WHERE source_id = 'openbible-topics'"),
      crossReferences: count('SELECT COUNT(*) AS count FROM cross_references'),
      verseTerms: count('SELECT COUNT(*) AS count FROM verse_terms'),
      translationTokens: count('SELECT COUNT(*) AS count FROM verse_translation_tokens'),
      pericopes: count('SELECT COUNT(*) AS count FROM pericopes'),
    };
    const pericopeRows = database
      .prepare('SELECT start_verse_id AS startVerseId, end_verse_id AS endVerseId, boundary_votes AS boundaryVotes FROM pericopes ORDER BY start_verse_id')
      .all() as { startVerseId: number; endVerseId: number; boundaryVotes: number }[];
    const compiled = compileOntology(
      reviewedSources.files
        .filter((file) => file.path.startsWith('ontology/concepts/'))
        .map((file) => ({ name: file.path.split('/').pop()!, contents: file.contents })),
    );
    expect(compiled.errors).toEqual([]);
    const readWrite = database as unknown as SqliteReadWriteDatabase;
    const preV9Fingerprint = aliasLayerFingerprint(
      spellingLayerFingerprint(
        preV9ConceptFingerprint(compiled.ontology, counts, pericopeRows),
        assembleSpellingVocabulary(readSpellingVocabularySources(readWrite)),
      ),
      readCuratedAliasRows(readWrite),
    );
    database.prepare('INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)').run('layer_fingerprint', preV9Fingerprint);
    database.prepare('INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)').run('schema_version', '8');
    database.close();
    const preDescriptorPath = join(sandbox, 'pre-v9-base.json');
    writeFileSync(preDescriptorPath, `${JSON.stringify({
      ...baseDescriptor,
      schemaVersion: '8',
      layerFingerprint: preV9Fingerprint,
      databaseSha256: sha256(readFileSync(preBasePath)),
      databaseBytes: statSync(preBasePath).size,
    })}\n`);

    // Positive: the mirror's readCrossReferencePhraseRows -> null branch
    // reproduces the independently computed v8-era chain, so the base
    // verifies and the candidate builds — carrying the v8 shape forward.
    const built = await buildCandidate({
      ...request(lexiconProposal('pre v9 mirror phrase'), 'pre-v9-mirror'),
      baseDatabasePath: preBasePath,
      baseDescriptorPath: preDescriptorPath,
    });
    expect(built.status).toBe('BUILT');
    const candidateDatabase = new DatabaseSync(built.databasePath, { readOnly: true });
    expect(Number((candidateDatabase.prepare(
      "SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name = 'cross_reference_phrases'",
    ).get() as { count: number }).count)).toBe(0);
    candidateDatabase.close();

    // Negative control: the same dropped-table base still advertising its
    // v9 fingerprint must be REFUSED — the 'x' records and the sixth
    // counts field are load-bearing bytes, not decoration.
    const droppedOnlyPath = join(sandbox, 'pre-v9-dropped-only.db');
    copyFileSync(baseDatabasePath, droppedOnlyPath);
    const droppedOnly = new DatabaseSync(droppedOnlyPath);
    droppedOnly.exec('DROP TABLE cross_reference_phrases');
    droppedOnly.close();
    const droppedOnlyDescriptorPath = join(sandbox, 'pre-v9-dropped-only.json');
    writeFileSync(droppedOnlyDescriptorPath, `${JSON.stringify({
      ...baseDescriptor,
      databaseSha256: sha256(readFileSync(droppedOnlyPath)),
      databaseBytes: statSync(droppedOnlyPath).size,
    })}\n`);
    await expect(buildCandidate({
      ...request(lexiconProposal('pre v9 mirror phrase'), 'pre-v9-dropped-only'),
      baseDatabasePath: droppedOnlyPath,
      baseDescriptorPath: droppedOnlyDescriptorPath,
    })).rejects.toMatchObject({ code: 'SOURCE_SNAPSHOT_MISMATCH' });
    expect(sha256(readFileSync(baseDatabasePath))).toBe(baseSha);
  }, 120_000);

  it('returns a verified cache hit and rebuilds a cache whose database bytes were tampered', async () => {
    const proposal = lexiconProposal('cache verification phrase');
    const buildRequest = request(proposal, 'cache');
    const built = await buildCandidate(buildRequest);
    const hit = await buildCandidate(buildRequest);
    expect(hit.status).toBe('CACHE_HIT');
    expect(hit.descriptor.databaseSha256).toBe(built.descriptor.databaseSha256);

    appendFileSync(hit.databasePath, Buffer.from([0]));
    const rebuilt = await buildCandidate(buildRequest);
    expect(rebuilt.status).toBe('BUILT');
    expect(sha256(readFileSync(rebuilt.databasePath))).toBe(rebuilt.descriptor.databaseSha256);
    expect(readdirSync(buildRequest.outputDirectory).some((entry) => entry.startsWith('.invalid-'))).toBe(true);
    expect(sha256(readFileSync(baseDatabasePath))).toBe(baseSha);
  }, 60_000);

  it('serializes identical cross-process builds and makes the publication loser a verified CACHE_HIT', async () => {
    const proposal = lexiconProposal('cross process lock phrase');
    const buildRequest = request(proposal, 'race');
    const requestPath = join(sandbox, 'race-request.json');
    writeFileSync(requestPath, `${JSON.stringify(buildRequest)}\n`);
    const [left, right] = await Promise.all([runCandidateCli(requestPath), runCandidateCli(requestPath)]);
    expect([left.status, right.status].sort()).toEqual(['BUILT', 'CACHE_HIT']);
    expect(left.cacheKey).toBe(right.cacheKey);
    expect(readdirSync(buildRequest.outputDirectory).filter((entry) => entry.startsWith('.incomplete-'))).toEqual([]);
    expect(sha256(readFileSync(baseDatabasePath))).toBe(baseSha);
  }, 180_000);

  it('reclaims only demonstrably stale operation-owned staging', async () => {
    const proposal = lexiconProposal('stale operation lock phrase');
    const buildRequest = request(proposal, 'stale-lock');
    const initial = await buildCandidate(buildRequest);
    rmSync(initial.candidateDirectory, { recursive: true, force: true });
    const operationId = randomUUID();
    const staleName = `.incomplete-${operationId}`;
    const staleDirectory = join(buildRequest.outputDirectory, staleName);
    const unrelatedDirectory = join(buildRequest.outputDirectory, `.incomplete-${randomUUID()}`);
    mkdirSync(staleDirectory);
    mkdirSync(unrelatedDirectory);
    writeFileSync(join(staleDirectory, 'operation.json'), JSON.stringify({
      formatVersion: 1, cacheKey: initial.cacheKey, operationId,
    }));
    writeFileSync(join(unrelatedDirectory, 'operation.json'), JSON.stringify({
      formatVersion: 1, cacheKey: initial.cacheKey, operationId: 'different-operation',
    }));
    const lockPath = join(buildRequest.outputDirectory, '.locks', `${initial.cacheKey}.lock`);
    mkdirSync(lockPath, { recursive: true });
    writeFileSync(join(lockPath, 'owner.json'), JSON.stringify({
      formatVersion: 1,
      cacheKey: initial.cacheKey,
      operationId,
      pid: 2_147_483_647,
      createdAt: '2000-01-01T00:00:00.000Z',
      stagingName: staleName,
    }));
    const old = new Date('2000-01-01T00:00:00.000Z');
    utimesSync(lockPath, old, old);

    const rebuilt = await buildCandidate(buildRequest);
    expect(rebuilt.status).toBe('BUILT');
    expect(existsSync(staleDirectory)).toBe(false);
    expect(existsSync(unrelatedDirectory)).toBe(true);
    expect(existsSync(lockPath)).toBe(false);
  }, 120_000);

  it('rejects internally coherent tampering of non-owned tables and every derived descriptor expectation', async () => {
    const proposal = lexiconProposal('cache contract phrase');
    const buildRequest = request(proposal, 'cache-contract');
    let result = await buildCandidate(buildRequest);

    const tampered = new DatabaseSync(result.databasePath);
    tampered.prepare("UPDATE translations SET name = 'Forged translation policy'").run();
    tampered.exec('VACUUM');
    const tableDigests = logicalTableDigests(tampered);
    tampered.close();
    const descriptor = JSON.parse(readFileSync(result.descriptorPath, 'utf8')) as Record<string, unknown>;
    descriptor.databaseSha256 = sha256(readFileSync(result.databasePath));
    descriptor.databaseBytes = statSync(result.databasePath).size;
    descriptor.tableDigests = tableDigests;
    descriptor.logicalTableDigest = sha256(stableJson(tableDigests));
    writeFileSync(result.descriptorPath, `${JSON.stringify(descriptor, null, 2)}\n`);
    result = await buildCandidate(buildRequest);
    expect(result.status).toBe('BUILT');
    const restored = new DatabaseSync(result.databasePath, { readOnly: true });
    expect((restored.prepare('SELECT name FROM translations').get() as { name: string }).name).not.toBe('Forged translation policy');
    restored.close();

    const descriptorTamper = JSON.parse(readFileSync(result.descriptorPath, 'utf8')) as {
      counts: Record<string, number>;
      base: Record<string, unknown>;
    };
    descriptorTamper.counts.concepts! += 1;
    descriptorTamper.base.engineVersion = 'forged-engine';
    writeFileSync(result.descriptorPath, `${JSON.stringify(descriptorTamper, null, 2)}\n`);
    const rebuilt = await buildCandidate(buildRequest);
    expect(rebuilt.status).toBe('BUILT');
    expect(rebuilt.descriptor.counts).toEqual(result.descriptor.counts);
    expect(rebuilt.descriptor.base.engineVersion).toBe(ENGINE_VERSION);
  }, 120_000);

  it('rejects coherent candidate meta tampering with recomputed database and descriptor digests', async () => {
    const proposal = lexiconProposal('coherent meta contract phrase');
    const buildRequest = request(proposal, 'coherent-meta-contract');
    let result = await buildCandidate(buildRequest);

    const tampered = new DatabaseSync(result.databasePath);
    tampered.prepare("UPDATE meta SET value = '0' WHERE key = 'verse_count'").run();
    tampered.exec('VACUUM');
    const tableDigests = logicalTableDigests(tampered);
    tampered.close();

    const descriptor = JSON.parse(readFileSync(result.descriptorPath, 'utf8')) as Record<string, unknown>;
    descriptor.databaseSha256 = sha256(readFileSync(result.databasePath));
    descriptor.databaseBytes = statSync(result.databasePath).size;
    descriptor.tableDigests = tableDigests;
    descriptor.logicalTableDigest = sha256(stableJson(tableDigests));
    writeFileSync(result.descriptorPath, `${JSON.stringify(descriptor, null, 2)}\n`);

    result = await buildCandidate(buildRequest);
    expect(result.status).toBe('BUILT');
    const restored = new DatabaseSync(result.databasePath, { readOnly: true });
    try {
      expect((restored.prepare("SELECT value FROM meta WHERE key = 'verse_count'").get() as { value: string }).value)
        .toBe(String((baseDescriptor.rowCounts as { verses: number }).verses));
    } finally {
      restored.close();
    }
  }, 120_000);

  it('removes a YAML phrase through the engine significant-token identity', async () => {
    const proposal = ontologyProposal('canonical-phrase-removal', [{
      ...commonOntologyOperation('remove-canonical-phrase'),
      type: 'lexicon-phrase-remove',
      phrase: 'HOPE-IN-GOD',
      currentOwner: 'editorial',
    }]);
    const result = await buildCandidate(request(proposal, 'canonical-phrase-removal'));
    const database = new DatabaseSync(result.databasePath, { readOnly: true });
    try {
      expect(database.prepare("SELECT concept_id FROM concept_lexicon WHERE concept_id = 'hope-in-god' AND normalized = 'hope god'").get())
        .toBeUndefined();
    } finally {
      database.close();
    }
  }, 60_000);

  it('matches padded anchor aliases through their canonical KJV verse range', async () => {
    const proposal = ontologyProposal('canonical-anchor-removal', [{
      ...commonOntologyOperation('remove-canonical-anchor'),
      type: 'editorial-anchor-remove',
      locator: 'jer 029:011',
      currentSources: ['editorial'],
    }]);
    const result = await buildCandidate(request(proposal, 'canonical-anchor-removal'));
    const database = new DatabaseSync(result.databasePath, { readOnly: true });
    try {
      expect(database.prepare("SELECT concept_id FROM concept_anchors WHERE concept_id = 'hope-in-god' AND locator = 'Jeremiah 29:11'").get())
        .toBeUndefined();
    } finally {
      database.close();
    }
  }, 60_000);

  it('adjusts john 01:001 against an existing John 1:1 candidate anchor', async () => {
    const proposal = ontologyProposal('canonical-john-anchor-adjustment', [
      {
        ...commonOntologyOperation('add-john-anchor'),
        type: 'editorial-anchor-add',
        anchor: { locator: 'John 1:1', sources: ['editorial'], weight: 0.8 },
      },
      {
        ...commonOntologyOperation('adjust-john-anchor'),
        type: 'editorial-anchor-adjust',
        current: { locator: 'john 01:001', sources: ['editorial'], weight: 0.8 },
        next: { locator: 'John 1:2', weight: 0.85 },
      },
    ]);
    const result = await buildCandidate(request(proposal, 'canonical-john-anchor-adjustment'));
    const database = new DatabaseSync(result.databasePath, { readOnly: true });
    try {
      expect(database.prepare("SELECT locator, weight FROM concept_anchors WHERE concept_id = 'hope-in-god' AND locator = 'John 1:2'").get())
        .toEqual({ locator: 'John 1:2', weight: 0.85 });
    } finally {
      database.close();
    }
  }, 60_000);

  it('builds a new concept from an explicitly empty, hash-bound source precondition', async () => {
    const draft = draftProposal();
    const snapshot = createReviewedSourceSnapshot([
      ...reviewedSources.files.map((file) => ({ path: file.path, contents: file.contents })),
      { path: draft.path, contents: '' },
    ]);
    const result = await buildCandidate(request(draft.proposal, 'draft', snapshot));
    const database = new DatabaseSync(result.databasePath, { readOnly: true });
    try {
      expect(database.prepare('SELECT label FROM concepts WHERE id = ?').get('candidate-patient-hope'))
        .toEqual({ label: 'Candidate patient hope' });
    } finally {
      database.close();
    }
    expect(await ordering(result.databasePath, 'patient candidate hope')).not.toEqual([]);
    expect(sha256(readFileSync(baseDatabasePath))).toBe(baseSha);
  }, 60_000);

  it('authorizes draft merges only from hash-bound reviewed draft documents', async () => {
    const merge = mergeDraftProposal();
    const snapshot = createReviewedSourceSnapshot([
      ...reviewedSources.files.map((file) => ({ path: file.path, contents: file.contents })),
      { path: merge.targetPath, contents: '' },
      ...merge.draftFiles,
    ]);
    await expect(buildCandidate(request(merge.proposal, 'merge-without-draft-sources', snapshot)))
      .rejects.toMatchObject({ code: 'SOURCE_SNAPSHOT_MISMATCH' });

    const reviewedDraftSources = merge.draftFiles.map((file) => ({ path: file.path, sha256: sha256(file.contents) }));
    const result = await buildCandidate({
      ...request(merge.proposal, 'merge-with-reviewed-draft-sources', snapshot),
      reviewedDraftSources,
    });
    const database = new DatabaseSync(result.databasePath, { readOnly: true });
    try {
      expect(database.prepare("SELECT label FROM concepts WHERE id = 'candidate-merged-hope'").get())
        .toEqual({ label: 'Candidate merged hope' });
    } finally {
      database.close();
    }

    await expect(buildCandidate({
      ...request(merge.proposal, 'merge-with-wrong-draft-source', snapshot),
      reviewedDraftSources: reviewedDraftSources.slice(0, 1),
    })).rejects.toMatchObject({ code: 'SOURCE_SNAPSHOT_MISMATCH' });
  }, 60_000);

  it('rejects fixture-only proposals as NO_MEASURABLE_EFFECT and publishes nothing', async () => {
    const buildRequest = request(noOpProposal(), 'no-op');
    await expect(buildCandidate(buildRequest)).rejects.toMatchObject({ code: 'NO_MEASURABLE_EFFECT' });
    expect(existsSync(buildRequest.outputDirectory)
      ? readdirSync(buildRequest.outputDirectory).filter((entry) => !entry.startsWith('.invalid-'))
      : []).toEqual([]);
    expect(sha256(readFileSync(baseDatabasePath))).toBe(baseSha);
  }, 60_000);

  it.each(['after-copy', 'after-mutation', 'before-publish'] as const)(
    'cleans incomplete output after an interruption at %s and leaves the base untouched',
    async (faultAt) => {
      const buildRequest = request(lexiconProposal(`interruption ${faultAt} phrase`), `crash-${faultAt}`);
      await expect(buildCandidate(buildRequest, { faultAt })).rejects.toMatchObject({ code: 'BUILD_INTERRUPTED' });
      expect(readdirSync(buildRequest.outputDirectory).some((entry) => entry.startsWith('.incomplete-'))).toBe(false);
      expect(sha256(readFileSync(baseDatabasePath))).toBe(baseSha);
    },
    60_000,
  );

  it('fails closed on proposal digest, source precondition, provenance, and base descriptor tampering', async () => {
    const proposal = lexiconProposal('tamper detection phrase');
    const digestRequest = { ...request(proposal, 'bad-digest'), proposalDigest: '0'.repeat(64) };
    await expect(buildCandidate(digestRequest)).rejects.toMatchObject({ code: 'INVALID_PROPOSAL' });

    const ontologyFile = reviewedSources.files.find((file) => file.path === ONTOLOGY_PATH)!;
    const staleProposal = structuredClone(proposal) as { sourcePreconditions: { path: string; sha256: string }[] };
    staleProposal.sourcePreconditions[0]!.sha256 = '1'.repeat(64);
    await expect(buildCandidate(request(staleProposal, 'bad-source'))).rejects.toMatchObject({ code: 'SOURCE_PRECONDITION_FAILED' });

    const changedFiles = reviewedSources.files.map((file) => {
      if (file.path !== 'pipeline/manifests/editorial.json') return { path: file.path, contents: file.contents };
      const manifest = JSON.parse(file.contents) as Record<string, unknown>;
      manifest.licenseRecord = '';
      return { path: file.path, contents: `${JSON.stringify(manifest, null, 2)}\n` };
    });
    const changedSnapshot = createReviewedSourceSnapshot(changedFiles);
    await expect(buildCandidate(request(proposal, 'bad-provenance', changedSnapshot))).rejects.toMatchObject({ code: 'PROVENANCE_FAILED' });

    const tamperedDescriptorPath = join(sandbox, 'tampered-base.json');
    writeFileSync(tamperedDescriptorPath, JSON.stringify({ ...baseDescriptor, databaseSha256: '2'.repeat(64) }));
    await expect(buildCandidate({ ...request(proposal, 'bad-base'), baseDescriptorPath: tamperedDescriptorPath }))
      .rejects.toMatchObject({ code: 'BASE_ARTIFACT_INVALID' });
    expect(sha256(readFileSync(baseDatabasePath))).toBe(baseSha);
    expect(ontologyFile.sha256).toMatch(/^[0-9a-f]{64}$/);
  }, 60_000);

  it('strictly rejects malformed stale metadata and binds rights and license policy identities', async () => {
    const proposal = lexiconProposal('policy identity phrase');
    const malformedDescriptorPath = join(sandbox, 'malformed-stale.json');
    writeFileSync(malformedDescriptorPath, JSON.stringify({
      ...baseDescriptor,
      stale: { since: '2026-08-11', reason: 'malformed test value', blocksRelease: 'true' },
    }));
    await expect(buildCandidate({
      ...request(proposal, 'malformed-stale-output'),
      baseDescriptorPath: malformedDescriptorPath,
    })).rejects.toMatchObject({ code: 'BASE_ARTIFACT_INVALID' });

    const rightsFiles = reviewedSources.files.map((file) => {
      if (file.path !== 'pipeline/manifests/web.json') return { path: file.path, contents: file.contents };
      const manifest = JSON.parse(file.contents) as Record<string, unknown>;
      manifest.rightsClass = 'owned';
      return { path: file.path, contents: `${JSON.stringify(manifest, null, 2)}\n` };
    });
    await expect(buildCandidate(request(
      proposal,
      'rights-policy-output',
      createReviewedSourceSnapshot(rightsFiles),
    ))).rejects.toMatchObject({ code: 'PROVENANCE_FAILED' });

    const licenseFiles = reviewedSources.files.map((file) => {
      if (file.path !== 'pipeline/manifests/editorial.json') return { path: file.path, contents: file.contents };
      const manifest = JSON.parse(file.contents) as Record<string, unknown>;
      manifest.licenseRecord = `${String(manifest.licenseRecord)}; reviewed candidate policy assertion`;
      return { path: file.path, contents: `${JSON.stringify(manifest, null, 2)}\n` };
    });
    const licenseSnapshot = createReviewedSourceSnapshot(licenseFiles);
    const policyBuild = await buildCandidate(request(proposal, 'license-policy-output', licenseSnapshot));
    expect(policyBuild.descriptor.provenancePolicyFingerprint).toBe(policyFingerprint(licenseSnapshot));
    expect(policyBuild.descriptor.base.provenancePolicyFingerprint).toBe(policyFingerprint(licenseSnapshot));
  }, 120_000);

  it('rejects root confusion, external base/request paths, unsafe source paths, and junction escapes before writing', async () => {
    const proposal = lexiconProposal('realpath confinement phrase');
    const safeRequest = request(proposal, 'safe-unused');
    await expect(buildCandidate({ ...safeRequest, repositoryRoot: sandbox }))
      .rejects.toMatchObject({ code: 'UNSAFE_OUTPUT_PATH' });

    const external = mkdtempSync(join(tmpdir(), 'm7-path-escape-'));
    const link = join(sandbox, 'junction-escape');
    try {
      const externalBase = join(external, 'base.db');
      copyFileSync(baseDatabasePath, externalBase);
      await expect(buildCandidate({ ...safeRequest, baseDatabasePath: externalBase }))
        .rejects.toMatchObject({ code: 'UNSAFE_OUTPUT_PATH' });

      const externalRequest = join(external, 'request.json');
      writeFileSync(externalRequest, JSON.stringify(safeRequest));
      await expect(buildCandidateFromRequestFile(externalRequest))
        .rejects.toMatchObject({ code: 'UNSAFE_OUTPUT_PATH' });

      symlinkSync(external, link, process.platform === 'win32' ? 'junction' : 'dir');
      await expect(buildCandidate({ ...safeRequest, outputDirectory: join(link, 'candidate') }))
        .rejects.toMatchObject({ code: 'UNSAFE_OUTPUT_PATH' });
    } finally {
      rmSync(link, { recursive: true, force: true });
      rmSync(external, { recursive: true, force: true });
    }

    expect(() => createReviewedSourceSnapshot([{ path: '.git/config', contents: 'unsafe' }]))
      .toThrow(/outside the reviewed candidate source surfaces/);
    expect(existsSync(safeRequest.outputDirectory)).toBe(false);
  }, 60_000);

  it('refuses candidate output under either protected reviewed-artifact directory', async () => {
    const proposal = lexiconProposal('protected path phrase');
    for (const outputDirectory of [
      join(REPOSITORY_ROOT, 'workbench', '.artifact', 'candidate-test'),
      join(REPOSITORY_ROOT, 'artifacts', 'candidate-test'),
    ]) {
      await expect(buildCandidate({ ...request(proposal, 'unused'), outputDirectory }))
        .rejects.toMatchObject({ code: 'UNSAFE_OUTPUT_PATH' });
    }
    expect(sha256(readFileSync(baseDatabasePath))).toBe(baseSha);
  });
});

describe('candidate error contract', () => {
  it('uses stable machine-readable error codes', () => {
    expect(new CandidateBuildError('NO_MEASURABLE_EFFECT', 'none')).toMatchObject({
      name: 'CandidateBuildError', code: 'NO_MEASURABLE_EFFECT',
    });
  });
});
