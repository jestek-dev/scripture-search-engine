/**
 * Builds a review candidate without mutating either reviewed artifact.
 *
 * The candidate boundary intentionally accepts a complete, hash-bound source
 * snapshot. It proves that snapshot describes the base artifact's ontology
 * rows before applying the proposal in memory. The resulting owned layer is
 * installed into a copy of the base database and published only after schema,
 * descriptor, logical-content, provenance, and read-only engine checks pass.
 */

import { createHash, randomUUID } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path, { basename, dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  createEngine,
  ENGINE_VERSION,
  significantWords,
  TOKENIZER_VERSION,
  type ContentQueryPort,
  type ContentQueryResult,
  type ContentScalar,
} from '@jestek-dev/scripture-engine';
import { isAlias, parseDocument, visit } from 'yaml';

import {
  assembleSpellingVocabulary,
  buildSpellingIndex,
  readSpellingVocabularySources,
  spellingDeleteRows,
  spellingLayerFingerprint,
  type SqliteReadWriteDatabase,
} from './buildSpellingIndex.js';
import {
  aliasLayerFingerprint,
  chainAliasLayerFingerprint,
  readCuratedAliasRows,
} from './buildAliasLayer.js';
import { compileOntology, parseAnchorRef, type CompiledOntology, type ConceptSource } from './importers/ontologyImporter.js';
import {
  checkProvenance,
  manifestFingerprint,
  type DistributionTier,
  type ManifestSet,
  type SourceManifest,
} from './provenance/manifest.js';
import { kjvVerseCount } from './versification/kjv.js';
import { parseVerseId } from './verseId.js';

const SHA256 = /^[0-9a-f]{64}$/;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_PATH = /^(?![a-zA-Z]:)(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9._/-]+$/;
const ONTOLOGY_PREFIX = 'ontology/concepts/';
const MANIFEST_PREFIX = 'pipeline/manifests/';
const REVIEWED_DRAFT_PREFIX = 'workbench/.state/reviewed-drafts/';
const CANDIDATE_DESCRIPTOR = 'candidate-artifact.json';
const CANDIDATE_DATABASE = 'content.db';
const MODULE_REPOSITORY_ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..', '..'));
const REAL_STATE_ROOT = join(MODULE_REPOSITORY_ROOT, 'workbench', '.state');
const PRODUCTION_DATABASE = join(MODULE_REPOSITORY_ROOT, 'workbench', '.artifact', 'content.db');
const PRODUCTION_DESCRIPTOR = join(MODULE_REPOSITORY_ROOT, 'artifacts', 'content-artifact.json');
const LOCK_STALE_MS = 60_000;
const LOCK_WAIT_MS = 300_000;
const REQUIRED_TABLES = [
  'meta',
  'translations',
  'books',
  'book_aliases',
  'verses',
  'verses_fts',
  'verse_tokens',
  'token_stats',
  'concepts',
  'concept_lexicon',
  'concept_anchors',
  'concept_related',
  'cross_references',
  'verse_terms',
  'verse_translation_tokens',
] as const;
const OWNED_TABLES = ['concepts', 'concept_lexicon', 'concept_anchors', 'concept_related'] as const;
/**
 * Schema-v7 tables the candidate build REGENERATES rather than copies: the
 * spelling vocabulary includes the concept lexicon, so mutating the owned
 * layer legitimately changes these. They are excluded from the
 * "non-owned table unchanged" tamper check and instead verified row-for-row
 * against an independent recomputation from the reviewed proposal.
 */
const DERIVED_SPELLING_TABLES = ['spelling_terms', 'spelling_deletes'] as const;
const REQUIRED_ENGINE_META = [
  'schema_version',
  'tokenizer_version',
  'corpus_fingerprint',
  'layer_fingerprint',
  'verse_count',
  'avg_verse_tokens',
] as const;
const OPERATION_TYPES = [
  'lexicon-phrase-add',
  'lexicon-phrase-remove',
  'editorial-anchor-add',
  'editorial-anchor-remove',
  'editorial-anchor-adjust',
  'related-concept-add',
  'related-concept-remove',
  'concept-draft-create',
  'concept-drafts-merge',
  'golden-fixture-upsert',
  'fixture-corpus-chapter-add',
] as const;
const GOLDEN_FIXTURE_FIELDS = new Set([
  'id', 'status', 'query', 'expectedTop', 'expectedWithinTop', 'preferredOrder', 'additionalQueries',
  'mustNotRank', 'coversConcepts', 'note', 'alsoAcceptable', 'generatedBy',
]);
type OperationType = (typeof OPERATION_TYPES)[number];

export type CandidateFailureCode =
  | 'INVALID_REQUEST'
  | 'INVALID_PROPOSAL'
  | 'BASE_ARTIFACT_INVALID'
  | 'SOURCE_PRECONDITION_FAILED'
  | 'SOURCE_SNAPSHOT_MISMATCH'
  | 'PROVENANCE_FAILED'
  | 'NO_MEASURABLE_EFFECT'
  | 'CANDIDATE_INVALID'
  | 'UNSAFE_OUTPUT_PATH'
  | 'BUILD_INTERRUPTED';

export class CandidateBuildError extends Error {
  constructor(
    readonly code: CandidateFailureCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = 'CandidateBuildError';
  }
}

export interface ReviewedSourceFile {
  readonly path: string;
  readonly sha256: string;
  readonly contents: string;
}

export interface ReviewedSourceSnapshot {
  readonly formatVersion: 1;
  readonly digest: string;
  readonly files: readonly ReviewedSourceFile[];
}

export interface CandidateBuildRequest {
  readonly formatVersion: 1;
  readonly repositoryRoot: string;
  readonly baseDatabasePath: string;
  readonly baseDescriptorPath: string;
  readonly outputDirectory: string;
  readonly proposalDigest: string;
  readonly proposal: unknown;
  readonly reviewedDraftSources?: readonly ReviewedDraftSource[];
  readonly reviewedSources: ReviewedSourceSnapshot;
}

export interface ReviewedDraftSource {
  readonly path: string;
  readonly sha256: string;
}

export interface CandidateArtifactDescriptor {
  readonly formatVersion: 1;
  readonly kind: 'scripture-search-candidate';
  readonly cacheKey: string;
  readonly proposalDigest: string;
  readonly sourceSnapshotDigest: string;
  readonly provenancePolicyFingerprint: string;
  readonly base: {
    readonly databaseSha256: string;
    readonly schemaVersion: string;
    readonly engineVersion: string;
    readonly tokenizerVersion: string;
    readonly corpusFingerprint: string;
    readonly layerFingerprint: string;
    readonly manifestFingerprint: string;
    readonly provenancePolicyFingerprint: string;
  };
  readonly schemaVersion: string;
  readonly engineVersion: string;
  readonly tokenizerVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  readonly manifestFingerprint: string;
  readonly databaseSha256: string;
  readonly databaseBytes: number;
  readonly logicalTableDigest: string;
  readonly tableDigests: Readonly<Record<string, string>>;
  readonly counts: Readonly<Record<string, number>>;
}

export interface CandidateBuildResult {
  readonly status: 'BUILT' | 'CACHE_HIT';
  readonly cacheKey: string;
  readonly candidateDirectory: string;
  readonly databasePath: string;
  readonly descriptorPath: string;
  readonly descriptor: CandidateArtifactDescriptor;
}

export interface CandidateBuildOptions {
  /** Test-only deterministic interruption hook. Staging remains base-isolated. */
  readonly faultAt?: 'after-copy' | 'after-mutation' | 'before-publish';
}

interface BaseArtifactDescriptor {
  readonly formatVersion: 1;
  readonly distributionTier: DistributionTier;
  readonly schemaVersion: string;
  readonly tokenizerVersion: string;
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  readonly manifestFingerprint: string;
  readonly databaseSha256: string;
  readonly databaseBytes: number;
  readonly rowCounts: {
    readonly books: number;
    readonly bookAliases: number;
    readonly translations: number;
    readonly verses: number;
    readonly indexedVerses: number;
  };
  readonly sources: readonly {
    readonly id: string;
    readonly sha256: string;
    readonly rightsClass: string;
    readonly maxTier: string;
  }[];
  readonly stale?: { readonly since: string; readonly reason: string; readonly blocksRelease?: boolean };
}

interface CacheLockOwner {
  readonly formatVersion: 1;
  readonly cacheKey: string;
  readonly operationId: string;
  readonly pid: number;
  readonly createdAt: string;
  readonly stagingName: string;
}

interface CacheLock {
  readonly lockPath: string;
  readonly operationId: string;
  readonly stagingName: string;
}

interface ProposalOperation extends Record<string, unknown> {
  readonly operationId: string;
  readonly type: OperationType;
  readonly sourcePaths: readonly string[];
  readonly provenance: {
    readonly source: 'editorial';
    readonly confirmed: true;
    readonly reviewer: string;
    readonly evidence: string;
  };
  readonly reason: string;
}

interface ProposalManifest {
  readonly schemaVersion: 1;
  readonly proposalId: string;
  readonly fixtureId: string;
  readonly caseIds: readonly string[];
  readonly sourcePreconditions: readonly { readonly path: string; readonly sha256: string }[];
  readonly operations: readonly ProposalOperation[];
}

interface CandidateConcept extends ConceptSource {
  anchors: { ref: string; sources: string[]; weight?: number }[];
  lexicon: string[];
  related: string[];
  openbibleTopics: string[];
}

function fail(code: CandidateFailureCode, message: string): never {
  throw new CandidateBuildError(code, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(
  value: unknown,
  required: readonly string[],
  optional: readonly string[],
  label: string,
  code: CandidateFailureCode = 'INVALID_REQUEST',
): Record<string, unknown> {
  if (!isRecord(value)) fail(code, `${label} must be an object.`);
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail(code, `${label}.${key} is not an allowed field.`);
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) fail(code, `${label}.${key} is required.`);
  }
  return value;
}

function requireText(value: unknown, label: string, code: CandidateFailureCode, minimum = 1): string {
  if (typeof value !== 'string' || value.trim() !== value || value.length < minimum) {
    fail(code, `${label} must be canonical text of at least ${minimum} character${minimum === 1 ? '' : 's'}.`);
  }
  return value;
}

function requireDigest(value: unknown, label: string, code: CandidateFailureCode): string {
  const digest = requireText(value, label, code);
  if (!SHA256.test(digest)) fail(code, `${label} must be a lowercase SHA-256 digest.`);
  return digest;
}

function canonicalRepoPath(value: unknown, label: string, code: CandidateFailureCode): string {
  const candidate = requireText(value, label, code);
  if (
    !SAFE_PATH.test(candidate)
    || candidate.includes('\\')
    || path.posix.normalize(candidate) !== candidate
    || candidate.endsWith('/')
    || candidate.split('/').some((segment) => segment.length === 0)
  ) {
    fail(code, `${label} must be a canonical repository-relative POSIX path.`);
  }
  return candidate;
}

function isAllowedSnapshotPath(sourcePath: string): boolean {
  return (
    (sourcePath.startsWith(ONTOLOGY_PREFIX) && sourcePath.endsWith('.yaml'))
    || (sourcePath.startsWith(MANIFEST_PREFIX) && sourcePath.endsWith('.json'))
    || (sourcePath.startsWith(REVIEWED_DRAFT_PREFIX) && sourcePath.endsWith('.json'))
    || (sourcePath.startsWith('eval/golden/') && sourcePath.endsWith('.json'))
    || sourcePath === 'pipeline/fixtures/web-subset.json'
  );
}

function sha256Bytes(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableJson(entry)).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`;
}

function jsonValue(value: unknown, label: string): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map((entry, index) => jsonValue(entry, `${label}[${index}]`));
  if (isRecord(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, jsonValue(value[key], `${label}.${key}`)]));
  }
  fail('INVALID_PROPOSAL', `${label} must contain JSON-safe values only.`);
}

function snapshotDigest(files: readonly ReviewedSourceFile[]): string {
  const hash = createHash('sha256');
  for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
    const record = `${file.path}\n${file.sha256}\n${file.contents.length}\n${file.contents}`;
    hash.update(String(Buffer.byteLength(record)));
    hash.update(':');
    hash.update(record);
  }
  return hash.digest('hex');
}

export function createReviewedSourceSnapshot(
  files: readonly Omit<ReviewedSourceFile, 'sha256'>[],
): ReviewedSourceSnapshot {
  const normalized = files
    .map((file) => {
      const sourcePath = canonicalRepoPath(file.path, 'reviewedSources.files[].path', 'INVALID_REQUEST');
      if (!isAllowedSnapshotPath(sourcePath)) {
        fail('INVALID_REQUEST', `${sourcePath} is outside the reviewed candidate source surfaces.`);
      }
      return { path: sourcePath, contents: file.contents, sha256: sha256Bytes(file.contents) };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
  if (new Set(normalized.map((file) => file.path)).size !== normalized.length) {
    fail('INVALID_REQUEST', 'reviewed source snapshot contains duplicate paths.');
  }
  return { formatVersion: 1, digest: snapshotDigest(normalized), files: normalized };
}

function validateSnapshot(value: unknown): ReviewedSourceSnapshot {
  const record = exactKeys(value, ['formatVersion', 'digest', 'files'], [], 'reviewedSources');
  if (record.formatVersion !== 1) fail('INVALID_REQUEST', 'reviewedSources.formatVersion must be 1.');
  if (!Array.isArray(record.files) || record.files.length === 0) {
    fail('INVALID_REQUEST', 'reviewedSources.files must be a non-empty array.');
  }
  const files = record.files.map((entry, index) => {
    const file = exactKeys(entry, ['path', 'sha256', 'contents'], [], `reviewedSources.files[${index}]`);
    if (typeof file.contents !== 'string') {
      fail('INVALID_REQUEST', `reviewedSources.files[${index}].contents must be text.`);
    }
    const contents = file.contents;
    const sourcePath = canonicalRepoPath(file.path, `reviewedSources.files[${index}].path`, 'INVALID_REQUEST');
    if (!isAllowedSnapshotPath(sourcePath)) {
      fail('INVALID_REQUEST', `${sourcePath} is outside the reviewed candidate source surfaces.`);
    }
    const digest = requireDigest(file.sha256, `reviewedSources.files[${index}].sha256`, 'INVALID_REQUEST');
    if (sha256Bytes(contents) !== digest) {
      fail('SOURCE_PRECONDITION_FAILED', `${sourcePath} bytes do not match their snapshot SHA-256.`);
    }
    return { path: sourcePath, sha256: digest, contents };
  });
  if (new Set(files.map((file) => file.path)).size !== files.length) {
    fail('INVALID_REQUEST', 'reviewed source snapshot contains duplicate paths.');
  }
  const digest = requireDigest(record.digest, 'reviewedSources.digest', 'INVALID_REQUEST');
  if (snapshotDigest(files) !== digest) fail('SOURCE_PRECONDITION_FAILED', 'reviewed source snapshot digest is invalid.');
  return { formatVersion: 1, digest, files: [...files].sort((a, b) => a.path.localeCompare(b.path)) };
}

function stringArray(value: unknown, label: string, parser: (entry: unknown, label: string) => string): string[] {
  if (!Array.isArray(value) || value.length === 0) fail('INVALID_PROPOSAL', `${label} must be a non-empty array.`);
  const parsed = value.map((entry, index) => parser(entry, `${label}[${index}]`));
  if (new Set(parsed).size !== parsed.length) fail('INVALID_PROPOSAL', `${label} must not contain duplicates.`);
  return parsed;
}

function parseAnchor(value: unknown, label: string): { locator: string; weight: number; sources: ['editorial'] } {
  const record = exactKeys(value, ['locator', 'weight', 'sources'], [], label, 'INVALID_PROPOSAL');
  const locator = requireText(record.locator, `${label}.locator`, 'INVALID_PROPOSAL');
  if (typeof record.weight !== 'number' || !Number.isFinite(record.weight) || record.weight <= 0 || record.weight > 1) {
    fail('INVALID_PROPOSAL', `${label}.weight must be greater than 0 and no greater than 1.`);
  }
  if (!Array.isArray(record.sources) || record.sources.length !== 1 || record.sources[0] !== 'editorial') {
    fail('INVALID_PROPOSAL', `${label}.sources must be exactly ["editorial"].`);
  }
  return { locator, weight: record.weight, sources: ['editorial'] };
}

function parseDraft(value: unknown, label: string): Record<string, unknown> {
  const record = exactKeys(value, ['id', 'label', 'lexicon', 'anchors', 'related'], [], label, 'INVALID_PROPOSAL');
  const id = requireText(record.id, `${label}.id`, 'INVALID_PROPOSAL');
  if (!ID.test(id)) fail('INVALID_PROPOSAL', `${label}.id must be a lowercase kebab-case id.`);
  const lexicon = stringArray(record.lexicon, `${label}.lexicon`, (entry, item) => requireText(entry, item, 'INVALID_PROPOSAL'));
  if (!Array.isArray(record.anchors) || record.anchors.length === 0) fail('INVALID_PROPOSAL', `${label}.anchors must be non-empty.`);
  const anchors = record.anchors.map((entry, index) => parseAnchor(entry, `${label}.anchors[${index}]`));
  const related = Array.isArray(record.related)
    ? record.related.map((entry, index) => {
        const relatedId = requireText(entry, `${label}.related[${index}]`, 'INVALID_PROPOSAL');
        if (!ID.test(relatedId)) fail('INVALID_PROPOSAL', `${label}.related[${index}] must be a lowercase kebab-case id.`);
        return relatedId;
      })
    : fail('INVALID_PROPOSAL', `${label}.related must be an array.`);
  return { id, label: requireText(record.label, `${label}.label`, 'INVALID_PROPOSAL'), lexicon, anchors, related };
}

function parseOperation(value: unknown, index: number): ProposalOperation {
  if (!isRecord(value)) fail('INVALID_PROPOSAL', `operations[${index}] must be an object.`);
  const type = value.type;
  if (typeof type !== 'string' || !(OPERATION_TYPES as readonly string[]).includes(type)) {
    fail('INVALID_PROPOSAL', `operations[${index}].type is unsupported.`);
  }
  const operationType = type as OperationType;
  const fields: Record<OperationType, readonly string[]> = {
    'lexicon-phrase-add': ['conceptId', 'phrase'],
    'lexicon-phrase-remove': ['conceptId', 'phrase', 'currentOwner'],
    'editorial-anchor-add': ['conceptId', 'anchor'],
    'editorial-anchor-remove': ['conceptId', 'locator', 'currentSources'],
    'editorial-anchor-adjust': ['conceptId', 'current', 'next'],
    'related-concept-add': ['conceptId', 'relatedConceptId'],
    'related-concept-remove': ['conceptId', 'relatedConceptId'],
    'concept-draft-create': ['draft'],
    'concept-drafts-merge': ['draftConceptIds', 'reviewedConcept'],
    'golden-fixture-upsert': ['goldenFixtureId', 'fixture'],
    'fixture-corpus-chapter-add': ['book', 'chapter', 'why'],
  };
  const common = ['operationId', 'type', 'sourcePaths', 'provenance', 'reason'];
  const record = exactKeys(value, [...common, ...fields[operationType]], [], `operations[${index}]`, 'INVALID_PROPOSAL');
  const operationId = requireText(record.operationId, `operations[${index}].operationId`, 'INVALID_PROPOSAL');
  if (!ID.test(operationId)) fail('INVALID_PROPOSAL', `operations[${index}].operationId must be a lowercase kebab-case id.`);
  const sourcePaths = stringArray(record.sourcePaths, `operations[${index}].sourcePaths`, (entry, label) => canonicalRepoPath(entry, label, 'INVALID_PROPOSAL'));
  const provenance = exactKeys(record.provenance, ['source', 'confirmed', 'reviewer', 'evidence'], [], `operations[${index}].provenance`, 'INVALID_PROPOSAL');
  if (provenance.source !== 'editorial' || provenance.confirmed !== true) {
    fail('INVALID_PROPOSAL', `operations[${index}].provenance must be reviewer-confirmed editorial provenance.`);
  }
  const parsed: Record<string, unknown> = {
    ...record,
    operationId,
    type: operationType,
    sourcePaths,
    provenance: {
      source: 'editorial',
      confirmed: true,
      reviewer: requireText(provenance.reviewer, `operations[${index}].provenance.reviewer`, 'INVALID_PROPOSAL'),
      evidence: requireText(provenance.evidence, `operations[${index}].provenance.evidence`, 'INVALID_PROPOSAL', 8),
    },
    reason: requireText(record.reason, `operations[${index}].reason`, 'INVALID_PROPOSAL', 12),
  };

  const idField = (name: string): string => {
    const result = requireText(record[name], `operations[${index}].${name}`, 'INVALID_PROPOSAL');
    if (!ID.test(result)) fail('INVALID_PROPOSAL', `operations[${index}].${name} must be a lowercase kebab-case id.`);
    return result;
  };
  switch (operationType) {
    case 'lexicon-phrase-add':
      parsed.conceptId = idField('conceptId');
      parsed.phrase = requireText(record.phrase, `operations[${index}].phrase`, 'INVALID_PROPOSAL');
      break;
    case 'lexicon-phrase-remove':
      parsed.conceptId = idField('conceptId');
      parsed.phrase = requireText(record.phrase, `operations[${index}].phrase`, 'INVALID_PROPOSAL');
      parsed.currentOwner = requireText(record.currentOwner, `operations[${index}].currentOwner`, 'INVALID_PROPOSAL');
      if (parsed.currentOwner !== 'editorial') fail('INVALID_PROPOSAL', 'source-derived lexicon rows cannot be removed editorially.');
      break;
    case 'editorial-anchor-add':
      parsed.conceptId = idField('conceptId');
      parsed.anchor = parseAnchor(record.anchor, `operations[${index}].anchor`);
      break;
    case 'editorial-anchor-remove': {
      parsed.conceptId = idField('conceptId');
      parsed.locator = requireText(record.locator, `operations[${index}].locator`, 'INVALID_PROPOSAL');
      const sources = stringArray(record.currentSources, `operations[${index}].currentSources`, (entry, label) => requireText(entry, label, 'INVALID_PROPOSAL'));
      if (sources.length !== 1 || sources[0] !== 'editorial') fail('INVALID_PROPOSAL', 'only solely editorial anchors may be removed.');
      parsed.currentSources = sources;
      break;
    }
    case 'editorial-anchor-adjust': {
      parsed.conceptId = idField('conceptId');
      parsed.current = parseAnchor(record.current, `operations[${index}].current`);
      const next = exactKeys(record.next, ['locator', 'weight'], [], `operations[${index}].next`, 'INVALID_PROPOSAL');
      parsed.next = {
        locator: requireText(next.locator, `operations[${index}].next.locator`, 'INVALID_PROPOSAL'),
        weight: parseAnchor({ locator: next.locator, weight: next.weight, sources: ['editorial'] }, `operations[${index}].next`).weight,
      };
      break;
    }
    case 'related-concept-add':
    case 'related-concept-remove':
      parsed.conceptId = idField('conceptId');
      parsed.relatedConceptId = idField('relatedConceptId');
      if (parsed.conceptId === parsed.relatedConceptId) fail('INVALID_PROPOSAL', 'a concept cannot relate to itself.');
      break;
    case 'concept-draft-create':
      parsed.draft = parseDraft(record.draft, `operations[${index}].draft`);
      break;
    case 'concept-drafts-merge': {
      const ids = stringArray(record.draftConceptIds, `operations[${index}].draftConceptIds`, (entry, label) => {
        const result = requireText(entry, label, 'INVALID_PROPOSAL');
        if (!ID.test(result)) fail('INVALID_PROPOSAL', `${label} must be a lowercase kebab-case id.`);
        return result;
      });
      if (ids.length !== 2) fail('INVALID_PROPOSAL', `operations[${index}].draftConceptIds must contain two ids.`);
      parsed.draftConceptIds = ids;
      parsed.reviewedConcept = parseDraft(record.reviewedConcept, `operations[${index}].reviewedConcept`);
      break;
    }
    case 'golden-fixture-upsert':
      parsed.goldenFixtureId = idField('goldenFixtureId');
      if (!isRecord(record.fixture) || record.fixture.id !== parsed.goldenFixtureId) {
        fail('INVALID_PROPOSAL', `operations[${index}].fixture must be an object whose id matches goldenFixtureId.`);
      }
      for (const key of Object.keys(record.fixture)) {
        if (!GOLDEN_FIXTURE_FIELDS.has(key)) {
          fail('INVALID_PROPOSAL', `operations[${index}].fixture.${key} is not an allowed golden fixture field.`);
        }
      }
      parsed.fixture = jsonValue(record.fixture, `operations[${index}].fixture`);
      break;
    case 'fixture-corpus-chapter-add':
      parsed.book = requireText(record.book, `operations[${index}].book`, 'INVALID_PROPOSAL');
      if (!Number.isSafeInteger(record.chapter) || (record.chapter as number) < 1 || (record.chapter as number) > 150) {
        fail('INVALID_PROPOSAL', `operations[${index}].chapter must be an integer from 1 through 150.`);
      }
      parsed.chapter = record.chapter;
      parsed.why = requireText(record.why, `operations[${index}].why`, 'INVALID_PROPOSAL', 8);
      break;
  }
  return parsed as ProposalOperation;
}

function normalizeDraft(draft: Record<string, unknown>): Record<string, unknown> {
  const lexicon = [...(draft.lexicon as string[])].sort((a, b) => canonicalPhraseIdentity(a).localeCompare(canonicalPhraseIdentity(b)));
  const anchors = [...(draft.anchors as Record<string, unknown>[])].sort((a, b) =>
    String(a.locator).localeCompare(String(b.locator)) || Number(a.weight) - Number(b.weight));
  return { ...draft, lexicon, anchors, related: [...(draft.related as string[])].sort() };
}

function normalizeProposal(manifest: ProposalManifest): ProposalManifest {
  const operations = manifest.operations.map((operation) => {
    const normalized: Record<string, unknown> = { ...operation, sourcePaths: [...operation.sourcePaths].sort() };
    if (operation.type === 'concept-draft-create') normalized.draft = normalizeDraft(operation.draft as Record<string, unknown>);
    if (operation.type === 'concept-drafts-merge') {
      normalized.draftConceptIds = [...(operation.draftConceptIds as string[])].sort();
      normalized.reviewedConcept = normalizeDraft(operation.reviewedConcept as Record<string, unknown>);
    }
    if (operation.type === 'editorial-anchor-remove') normalized.currentSources = [...(operation.currentSources as string[])].sort();
    return normalized as ProposalOperation;
  }).sort((a, b) => a.operationId.localeCompare(b.operationId) || a.type.localeCompare(b.type));
  return {
    ...manifest,
    caseIds: [...manifest.caseIds].sort(),
    sourcePreconditions: [...manifest.sourcePreconditions].sort((a, b) => a.path.localeCompare(b.path)),
    operations,
  };
}

function expectedOperationPath(operation: ProposalOperation): string {
  if (operation.type === 'golden-fixture-upsert') return `eval/golden/${String(operation.goldenFixtureId)}.json`;
  if (operation.type === 'fixture-corpus-chapter-add') return 'pipeline/fixtures/web-subset.json';
  if (operation.type === 'concept-draft-create') return `ontology/concepts/${String((operation.draft as Record<string, unknown>).id)}.yaml`;
  if (operation.type === 'concept-drafts-merge') return `ontology/concepts/${String((operation.reviewedConcept as Record<string, unknown>).id)}.yaml`;
  return `ontology/concepts/${String(operation.conceptId)}.yaml`;
}

function parseProposal(value: unknown, expectedDigest: string): ProposalManifest {
  const record = exactKeys(value, ['schemaVersion', 'proposalId', 'fixtureId', 'caseIds', 'sourcePreconditions', 'operations'], [], 'proposal', 'INVALID_PROPOSAL');
  if (record.schemaVersion !== 1) fail('INVALID_PROPOSAL', 'proposal.schemaVersion must be 1.');
  const proposalId = requireText(record.proposalId, 'proposal.proposalId', 'INVALID_PROPOSAL');
  const fixtureId = requireText(record.fixtureId, 'proposal.fixtureId', 'INVALID_PROPOSAL');
  if (!ID.test(proposalId) || !ID.test(fixtureId)) fail('INVALID_PROPOSAL', 'proposal ids must be lowercase kebab-case.');
  const caseIds = stringArray(record.caseIds, 'proposal.caseIds', (entry, label) => {
    const id = requireText(entry, label, 'INVALID_PROPOSAL').toLowerCase();
    if (!UUID.test(id)) fail('INVALID_PROPOSAL', `${label} must be a UUID.`);
    return id;
  });
  if (!Array.isArray(record.sourcePreconditions) || record.sourcePreconditions.length === 0) {
    fail('INVALID_PROPOSAL', 'proposal.sourcePreconditions must be non-empty.');
  }
  const sourcePreconditions = record.sourcePreconditions.map((entry, index) => {
    const precondition = exactKeys(entry, ['path', 'sha256'], [], `proposal.sourcePreconditions[${index}]`, 'INVALID_PROPOSAL');
    return {
      path: canonicalRepoPath(precondition.path, `proposal.sourcePreconditions[${index}].path`, 'INVALID_PROPOSAL'),
      sha256: requireDigest(precondition.sha256, `proposal.sourcePreconditions[${index}].sha256`, 'INVALID_PROPOSAL'),
    };
  });
  if (new Set(sourcePreconditions.map((entry) => entry.path)).size !== sourcePreconditions.length) {
    fail('INVALID_PROPOSAL', 'proposal source preconditions contain duplicate paths.');
  }
  if (!Array.isArray(record.operations) || record.operations.length === 0) fail('INVALID_PROPOSAL', 'proposal.operations must be non-empty.');
  const operations = record.operations.map(parseOperation);
  if (new Set(operations.map((entry) => entry.operationId)).size !== operations.length) {
    fail('INVALID_PROPOSAL', 'proposal operation ids must be unique.');
  }
  const preconditions = new Set(sourcePreconditions.map((entry) => entry.path));
  const used = new Set<string>();
  for (const operation of operations) {
    const expectedPath = expectedOperationPath(operation);
    if (operation.sourcePaths.length !== 1 || operation.sourcePaths[0] !== expectedPath) {
      fail('INVALID_PROPOSAL', `${operation.operationId} must own exactly ${expectedPath}.`);
    }
    if (!preconditions.has(expectedPath)) fail('INVALID_PROPOSAL', `${operation.operationId} has no source precondition for ${expectedPath}.`);
    used.add(expectedPath);
    if (operation.type === 'golden-fixture-upsert' && operation.goldenFixtureId !== fixtureId) {
      fail('INVALID_PROPOSAL', `${operation.operationId}.goldenFixtureId must equal proposal.fixtureId.`);
    }
  }
  for (const precondition of sourcePreconditions) {
    if (!used.has(precondition.path)) fail('INVALID_PROPOSAL', `unused source precondition ${precondition.path}.`);
  }
  const manifest = normalizeProposal({ schemaVersion: 1, proposalId, fixtureId, caseIds, sourcePreconditions, operations });
  if (sha256Bytes(stableJson(manifest)) !== expectedDigest) {
    fail('INVALID_PROPOSAL', 'proposal digest does not match the normalized strict manifest.');
  }
  return manifest;
}

function parseRequest(value: unknown): CandidateBuildRequest {
  const record = exactKeys(value, [
    'formatVersion', 'repositoryRoot', 'baseDatabasePath', 'baseDescriptorPath',
    'outputDirectory', 'proposalDigest', 'proposal', 'reviewedSources',
  ], ['reviewedDraftSources'], 'request');
  if (record.formatVersion !== 1) fail('INVALID_REQUEST', 'request.formatVersion must be 1.');
  const proposalDigest = requireDigest(record.proposalDigest, 'request.proposalDigest', 'INVALID_REQUEST');
  const reviewedSources = validateSnapshot(record.reviewedSources);
  const reviewedDraftSources = record.reviewedDraftSources === undefined
    ? []
    : (() => {
        if (!Array.isArray(record.reviewedDraftSources)) fail('INVALID_REQUEST', 'request.reviewedDraftSources must be an array.');
        const sources = record.reviewedDraftSources.map((entry, index) => {
          const source = exactKeys(entry, ['path', 'sha256'], [], `request.reviewedDraftSources[${index}]`);
          return {
            path: canonicalRepoPath(source.path, `request.reviewedDraftSources[${index}].path`, 'INVALID_REQUEST'),
            sha256: requireDigest(source.sha256, `request.reviewedDraftSources[${index}].sha256`, 'INVALID_REQUEST'),
          };
        }).sort((a, b) => a.path.localeCompare(b.path));
        if (new Set(sources.map((source) => source.path)).size !== sources.length) {
          fail('INVALID_REQUEST', 'request.reviewedDraftSources paths must be unique.');
        }
        return sources;
      })();
  return {
    formatVersion: 1,
    repositoryRoot: resolve(requireText(record.repositoryRoot, 'request.repositoryRoot', 'INVALID_REQUEST')),
    baseDatabasePath: resolve(requireText(record.baseDatabasePath, 'request.baseDatabasePath', 'INVALID_REQUEST')),
    baseDescriptorPath: resolve(requireText(record.baseDescriptorPath, 'request.baseDescriptorPath', 'INVALID_REQUEST')),
    outputDirectory: resolve(requireText(record.outputDirectory, 'request.outputDirectory', 'INVALID_REQUEST')),
    proposalDigest,
    proposal: record.proposal,
    reviewedDraftSources,
    reviewedSources,
  };
}

function validateBaseDescriptor(value: unknown): BaseArtifactDescriptor {
  if (!isRecord(value)) fail('BASE_ARTIFACT_INVALID', 'base descriptor must be an object.');
  const textField = (name: string): string => requireText(value[name], `base.${name}`, 'BASE_ARTIFACT_INVALID');
  const digestField = (name: string): string => requireDigest(value[name], `base.${name}`, 'BASE_ARTIFACT_INVALID');
  if (value.formatVersion !== 1) fail('BASE_ARTIFACT_INVALID', 'base descriptor formatVersion must be 1.');
  const tier = value.distributionTier;
  if (tier !== 'public_distribution' && tier !== 'private_local' && tier !== 'dev_fixture') {
    fail('BASE_ARTIFACT_INVALID', 'base descriptor has an invalid distributionTier.');
  }
  if (!Number.isSafeInteger(value.databaseBytes) || (value.databaseBytes as number) <= 0) {
    fail('BASE_ARTIFACT_INVALID', 'base descriptor databaseBytes must be a positive safe integer.');
  }
  const rowCounts = value.rowCounts;
  if (!isRecord(rowCounts)) fail('BASE_ARTIFACT_INVALID', 'base descriptor rowCounts must be an object.');
  const count = (key: string): number => {
    const result = rowCounts[key];
    if (!Number.isSafeInteger(result) || (result as number) < 0) fail('BASE_ARTIFACT_INVALID', `base.rowCounts.${key} is invalid.`);
    return result as number;
  };
  if (!Array.isArray(value.sources)) fail('BASE_ARTIFACT_INVALID', 'base descriptor sources must be an array.');
  const sources = value.sources.map((entry, index) => {
    if (!isRecord(entry)) fail('BASE_ARTIFACT_INVALID', `base.sources[${index}] must be an object.`);
    return {
      id: requireText(entry.id, `base.sources[${index}].id`, 'BASE_ARTIFACT_INVALID'),
      sha256: requireDigest(entry.sha256, `base.sources[${index}].sha256`, 'BASE_ARTIFACT_INVALID'),
      rightsClass: requireText(entry.rightsClass, `base.sources[${index}].rightsClass`, 'BASE_ARTIFACT_INVALID'),
      maxTier: requireText(entry.maxTier, `base.sources[${index}].maxTier`, 'BASE_ARTIFACT_INVALID'),
    };
  });
  let stale: BaseArtifactDescriptor['stale'];
  if (value.stale !== undefined) {
    const staleRecord = exactKeys(value.stale, ['since', 'reason'], ['blocksRelease'], 'base.stale', 'BASE_ARTIFACT_INVALID');
    if (staleRecord.blocksRelease !== undefined && typeof staleRecord.blocksRelease !== 'boolean') {
      fail('BASE_ARTIFACT_INVALID', 'base.stale.blocksRelease must be a boolean when present.');
    }
    stale = {
      since: requireText(staleRecord.since, 'base.stale.since', 'BASE_ARTIFACT_INVALID'),
      reason: requireText(staleRecord.reason, 'base.stale.reason', 'BASE_ARTIFACT_INVALID'),
      ...(staleRecord.blocksRelease === undefined ? {} : { blocksRelease: staleRecord.blocksRelease }),
    };
  }
  if (stale?.blocksRelease === true) {
    fail('BASE_ARTIFACT_INVALID', `base descriptor is release-blocking stale: ${stale.reason}`);
  }
  return {
    formatVersion: 1,
    distributionTier: tier,
    schemaVersion: textField('schemaVersion'),
    tokenizerVersion: textField('tokenizerVersion'),
    engineVersion: textField('engineVersion'),
    corpusFingerprint: digestField('corpusFingerprint'),
    layerFingerprint: digestField('layerFingerprint'),
    manifestFingerprint: digestField('manifestFingerprint'),
    databaseSha256: digestField('databaseSha256'),
    databaseBytes: value.databaseBytes as number,
    rowCounts: {
      books: count('books'), bookAliases: count('bookAliases'), translations: count('translations'),
      verses: count('verses'), indexedVerses: count('indexedVerses'),
    },
    sources,
    ...(stale === undefined ? {} : { stale }),
  };
}

function normalizeAbsolute(value: string): string {
  const resolved = resolve(value);
  return process.platform === 'win32' ? resolved.toLocaleLowerCase('en-US') : resolved;
}

function isWithin(parent: string, child: string): boolean {
  const relative = path.relative(normalizeAbsolute(parent), normalizeAbsolute(child));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function projectedRealPath(target: string): string {
  const suffix: string[] = [];
  let cursor = resolve(target);
  while (!existsSync(cursor)) {
    const parent = dirname(cursor);
    if (parent === cursor) fail('UNSAFE_OUTPUT_PATH', `no existing ancestor for ${target}.`);
    suffix.unshift(basename(cursor));
    cursor = parent;
  }
  return resolve(realpathSync(cursor), ...suffix);
}

function requireRealConfinedPath(
  target: string,
  allowedRoot: string,
  label: string,
  mustExist: boolean,
): string {
  const lexical = resolve(target);
  const realAllowedRoot = projectedRealPath(allowedRoot);
  if (!isWithin(resolve(allowedRoot), lexical)) {
    fail('UNSAFE_OUTPUT_PATH', `${label} is outside ${allowedRoot}.`);
  }
  if (mustExist && !existsSync(lexical)) fail('UNSAFE_OUTPUT_PATH', `${label} does not exist.`);
  const projected = projectedRealPath(lexical);
  if (!isWithin(realAllowedRoot, projected)) {
    fail('UNSAFE_OUTPUT_PATH', `${label} escapes its real allowed root through a link or junction.`);
  }
  if (existsSync(lexical)) {
    const real = realpathSync(lexical);
    if (normalizeAbsolute(real) !== normalizeAbsolute(projected) || lstatSync(lexical).isSymbolicLink()) {
      fail('UNSAFE_OUTPUT_PATH', `${label} resolves through a symbolic link or junction.`);
    }
  }
  return projected;
}

function samePath(left: string, right: string): boolean {
  return normalizeAbsolute(left) === normalizeAbsolute(right);
}

function assertSafeRequestPaths(request: CandidateBuildRequest): void {
  let declaredRoot: string;
  try {
    declaredRoot = realpathSync(request.repositoryRoot);
  } catch {
    fail('UNSAFE_OUTPUT_PATH', 'request.repositoryRoot must be the existing real repository root.');
  }
  if (!samePath(declaredRoot, MODULE_REPOSITORY_ROOT)) {
    fail('UNSAFE_OUTPUT_PATH', 'request.repositoryRoot does not match the pipeline module repository root.');
  }
  requireRealConfinedPath(request.outputDirectory, REAL_STATE_ROOT, 'request.outputDirectory', false);

  const validateBasePath = (target: string, productionPath: string, label: string): void => {
    if (samePath(target, productionPath)) {
      requireRealConfinedPath(target, dirname(productionPath), label, true);
      return;
    }
    requireRealConfinedPath(target, REAL_STATE_ROOT, label, true);
  };
  validateBasePath(request.baseDatabasePath, PRODUCTION_DATABASE, 'request.baseDatabasePath');
  validateBasePath(request.baseDescriptorPath, PRODUCTION_DESCRIPTOR, 'request.baseDescriptorPath');
  if (isWithin(request.outputDirectory, request.baseDatabasePath) || isWithin(request.outputDirectory, request.baseDescriptorPath)) {
    fail('UNSAFE_OUTPUT_PATH', 'candidate output may not contain either base artifact input.');
  }
}

function fileSha256(file: string): string {
  return sha256Bytes(readFileSync(file));
}

function quoteIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function canonicalScalar(value: unknown): string {
  if (value === null) return 'null';
  if (Buffer.isBuffer(value)) return `blob:${value.toString('hex')}`;
  if (typeof value === 'number') return `number:${Object.is(value, -0) ? '-0' : String(value)}`;
  if (typeof value === 'bigint') return `bigint:${value}`;
  if (typeof value === 'string') return `text:${Buffer.byteLength(value)}:${value}`;
  return `other:${String(value)}`;
}

function digestRows(rows: readonly Record<string, unknown>[]): string {
  const records = rows.map((row) => stableJson(Object.fromEntries(Object.keys(row).sort().map((key) => [key, canonicalScalar(row[key])])))).sort();
  const hash = createHash('sha256');
  for (const record of records) {
    hash.update(String(Buffer.byteLength(record)));
    hash.update(':');
    hash.update(record);
  }
  return hash.digest('hex');
}

function tableDigest(database: DatabaseSync, table: string): string {
  const columns = (database.prepare(`PRAGMA table_info(${quoteIdentifier(table)})`).all() as { name: string }[]).map((row) => row.name);
  if (columns.length === 0) fail('CANDIDATE_INVALID', `cannot inspect logical columns for ${table}.`);
  const order = columns.map(quoteIdentifier).join(', ');
  const rows = database.prepare(`SELECT * FROM ${quoteIdentifier(table)} ORDER BY ${order}`).iterate() as Iterable<Record<string, unknown>>;
  const hash = createHash('sha256');
  for (const row of rows) {
    const record = stableJson(Object.fromEntries(Object.keys(row).sort().map((key) => [key, canonicalScalar(row[key])])));
    hash.update(String(Buffer.byteLength(record)));
    hash.update(':');
    hash.update(record);
  }
  return hash.digest('hex');
}

function logicalTableDigests(database: DatabaseSync): Record<string, string> {
  const tables = (database.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  ).all() as { name: string }[])
    .map((row) => row.name)
    .filter((name) => name === 'verses_fts' || !name.startsWith('verses_fts_'));
  return Object.fromEntries(tables.map((table) => [table, tableDigest(database, table)]));
}

function combinedTableDigest(tableDigests: Readonly<Record<string, string>>): string {
  return sha256Bytes(stableJson(tableDigests));
}

/** Presence probe — the same seam the engine uses for pre-v7 artifacts. */
function hasSpellingIndex(database: DatabaseSync): boolean {
  const row = database.prepare(
    "SELECT COUNT(*) AS present FROM sqlite_master WHERE type = 'table' AND name IN ('spelling_terms', 'spelling_deletes')",
  ).get() as { present: number };
  return Number(row.present) === DERIVED_SPELLING_TABLES.length;
}

/** Presence probe for the QR-6 alias table (schema v7; absent pre-v7). */
function hasCuratedAliasTable(database: DatabaseSync): boolean {
  const row = database.prepare(
    "SELECT COUNT(*) AS present FROM sqlite_master WHERE type = 'table' AND name = 'curated_aliases'",
  ).get() as { present: number };
  return Number(row.present) === 1;
}

/** Presence probe for the CO-3 pericopes table (schema v8; absent pre-v8). */
function hasPericopeTable(database: DatabaseSync): boolean {
  const row = database.prepare(
    "SELECT COUNT(*) AS present FROM sqlite_master WHERE type = 'table' AND name = 'pericopes'",
  ).get() as { present: number };
  return Number(row.present) === 1;
}

interface CandidatePericopeRow {
  readonly startVerseId: number;
  readonly endVerseId: number;
  readonly boundaryVotes: number;
}

/**
 * Pericope rows for the independent fingerprint recomputation (schema v8).
 * Non-owned bytes a candidate never touches — like cross_references — but
 * they feed the concept-layer fingerprint per-record, so the reviewer-side
 * mirror must reproduce them. `null` for a pre-v8 base whose fingerprint
 * never carried them (its counts record is also one field shorter).
 */
function readPericopeRows(database: DatabaseSync): readonly CandidatePericopeRow[] | null {
  if (!hasPericopeTable(database)) return null;
  return database.prepare(
    `SELECT start_verse_id AS startVerseId, end_verse_id AS endVerseId,
            boundary_votes AS boundaryVotes
     FROM pericopes ORDER BY start_verse_id`,
  ).all() as unknown as CandidatePericopeRow[];
}

/** Presence probe for the P6.3 phrase table (schema v9; absent pre-v9). */
function hasCrossReferencePhraseTable(database: DatabaseSync): boolean {
  const row = database.prepare(
    "SELECT COUNT(*) AS present FROM sqlite_master WHERE type = 'table' AND name = 'cross_reference_phrases'",
  ).get() as { present: number };
  return Number(row.present) === 1;
}

interface CandidatePhraseRow {
  readonly fromVerseId: number;
  readonly normalizedPhrase: string;
  readonly toStartVerseId: number;
  readonly toEndVerseId: number;
}

/**
 * TSK phrase rows for the independent fingerprint recomputation (schema
 * v9). Non-owned bytes a candidate never touches — like pericopes — but
 * they feed the concept-layer fingerprint per-record, so the reviewer-side
 * mirror must reproduce them. `null` for a pre-v9 base whose fingerprint
 * never carried them (its counts record is also one field shorter).
 */
function readCrossReferencePhraseRows(database: DatabaseSync): readonly CandidatePhraseRow[] | null {
  if (!hasCrossReferencePhraseTable(database)) return null;
  return database.prepare(
    `SELECT from_verse_id AS fromVerseId, normalized_phrase AS normalizedPhrase,
            to_start_verse_id AS toStartVerseId, to_end_verse_id AS toEndVerseId
     FROM cross_reference_phrases
     ORDER BY from_verse_id, normalized_phrase, to_start_verse_id, to_end_verse_id`,
  ).all() as unknown as CandidatePhraseRow[];
}

/** digestRows over the shipped spelling tables, keyed like the expectation. */
function actualSpellingTableDigests(database: DatabaseSync): Record<string, string> {
  return {
    spelling_terms: digestRows(database
      .prepare('SELECT term, document_count, origins FROM spelling_terms')
      .all() as Record<string, unknown>[]),
    spelling_deletes: digestRows(database
      .prepare('SELECT delete_key, term FROM spelling_deletes')
      .all() as Record<string, unknown>[]),
  };
}

function assertSpellingTablesMatchExpectation(
  database: DatabaseSync,
  expectedDigests: Readonly<Record<string, string>>,
  label: string,
): void {
  const actual = actualSpellingTableDigests(database);
  for (const [table, digest] of Object.entries(expectedDigests)) {
    if (actual[table] !== digest) {
      fail('CANDIDATE_INVALID', `${label} ${table} rows do not match the proposal-derived spelling index.`);
    }
  }
}

function openReadOnlyPort(databasePath: string): ContentQueryPort {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  return {
    async execute(query: string, params: readonly ContentScalar[] = []): Promise<ContentQueryResult> {
      return { rows: database.prepare(query).all(...(params as never[])) as Record<string, ContentScalar>[] };
    },
    async close(): Promise<void> {
      database.close();
    },
  };
}

function databaseMeta(database: DatabaseSync): Map<string, string> {
  return new Map((database.prepare('SELECT key, value FROM meta').all() as { key: string; value: string }[]).map((row) => [row.key, row.value]));
}

interface DatabaseMetaRow {
  readonly key: string;
  readonly value: string;
}

function databaseMetaRows(database: DatabaseSync, code: CandidateFailureCode): readonly DatabaseMetaRow[] {
  const rows = database.prepare('SELECT key, value FROM meta ORDER BY key').all() as Record<string, unknown>[];
  for (const row of rows) {
    if (typeof row.key !== 'string' || typeof row.value !== 'string') {
      fail(code, 'database meta rows must contain canonical text keys and values.');
    }
  }
  return rows as unknown as DatabaseMetaRow[];
}

function expectedCandidateMetaRows(
  database: DatabaseSync,
  descriptor: BaseArtifactDescriptor,
  candidateLayerFingerprint: string,
): readonly DatabaseMetaRow[] {
  const rows = databaseMetaRows(database, 'BASE_ARTIFACT_INVALID');
  const meta = new Map(rows.map((row) => [row.key, row.value]));
  for (const key of REQUIRED_ENGINE_META) {
    if (!meta.has(key)) fail('BASE_ARTIFACT_INVALID', `verified base is missing required meta.${key}.`);
  }
  if (meta.get('verse_count') !== String(descriptor.rowCounts.verses)) {
    fail('BASE_ARTIFACT_INVALID', 'verified base meta.verse_count does not match its descriptor row count.');
  }
  const averageVerseTokens = Number(meta.get('avg_verse_tokens'));
  if (!Number.isFinite(averageVerseTokens) || averageVerseTokens < 0) {
    fail('BASE_ARTIFACT_INVALID', 'verified base meta.avg_verse_tokens is invalid.');
  }
  return rows.map((row) => row.key === 'layer_fingerprint'
    ? { key: row.key, value: candidateLayerFingerprint }
    : row);
}

function assertExactCandidateMeta(
  database: DatabaseSync,
  expectedRows: readonly DatabaseMetaRow[],
  label: string,
): void {
  const actualRows = databaseMetaRows(database, 'CANDIDATE_INVALID');
  if (stableJson(actualRows) !== stableJson(expectedRows)) {
    fail('CANDIDATE_INVALID', `${label} meta rows differ from the verified base outside the expected layer_fingerprint replacement.`);
  }
}

function countRows(database: DatabaseSync, table: string): number {
  return Number((database.prepare(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)}`).get() as { count: number }).count);
}

function validateDatabaseSchema(database: DatabaseSync, descriptor: BaseArtifactDescriptor | CandidateArtifactDescriptor): void {
  const integrity = database.prepare('PRAGMA integrity_check').all() as { integrity_check: string }[];
  if (integrity.length !== 1 || integrity[0]?.integrity_check !== 'ok') fail('CANDIDATE_INVALID', 'SQLite integrity_check failed.');
  const foreignKeys = database.prepare('PRAGMA foreign_key_check').all();
  if (foreignKeys.length > 0) fail('CANDIDATE_INVALID', 'SQLite foreign_key_check failed.');
  const available = new Set((database.prepare("SELECT name FROM sqlite_master WHERE type IN ('table','view')").all() as { name: string }[]).map((row) => row.name));
  const missing = REQUIRED_TABLES.filter((table) => !available.has(table));
  if (missing.length > 0) fail('CANDIDATE_INVALID', `database is missing required tables: ${missing.join(', ')}.`);
  const meta = databaseMeta(database);
  if (meta.get('schema_version') !== descriptor.schemaVersion) fail('CANDIDATE_INVALID', 'database schema identity does not match its descriptor.');
  if (meta.get('tokenizer_version') !== descriptor.tokenizerVersion) fail('CANDIDATE_INVALID', 'database tokenizer identity does not match its descriptor.');
  if (meta.get('corpus_fingerprint') !== descriptor.corpusFingerprint) fail('CANDIDATE_INVALID', 'database corpus identity does not match its descriptor.');
  if (meta.get('layer_fingerprint') !== descriptor.layerFingerprint) fail('CANDIDATE_INVALID', 'database layer identity does not match its descriptor.');
}

async function bindVerifiedEngine(databasePath: string, descriptor: BaseArtifactDescriptor | CandidateArtifactDescriptor): Promise<void> {
  const engine = await createEngine(openReadOnlyPort(databasePath));
  try {
    if (
      engine.engineVersion !== descriptor.engineVersion
      || engine.corpusFingerprint !== descriptor.corpusFingerprint
      || engine.layerFingerprint !== descriptor.layerFingerprint
    ) {
      fail('CANDIDATE_INVALID', 'read-only engine identities do not match the validated descriptor.');
    }
  } finally {
    await engine.close();
  }
}

async function verifyBase(databasePath: string, descriptor: BaseArtifactDescriptor): Promise<void> {
  if (!existsSync(databasePath)) fail('BASE_ARTIFACT_INVALID', `base database is missing at ${databasePath}.`);
  if (statSync(databasePath).size !== descriptor.databaseBytes || fileSha256(databasePath) !== descriptor.databaseSha256) {
    fail('BASE_ARTIFACT_INVALID', 'base database bytes do not match the reviewed descriptor.');
  }
  if (descriptor.engineVersion !== ENGINE_VERSION || descriptor.tokenizerVersion !== TOKENIZER_VERSION) {
    fail('BASE_ARTIFACT_INVALID', 'base descriptor is incompatible with the current engine/tokenizer version.');
  }
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    validateDatabaseSchema(database, descriptor);
    const expected = descriptor.rowCounts;
    const actual = {
      books: countRows(database, 'books'),
      bookAliases: countRows(database, 'book_aliases'),
      translations: countRows(database, 'translations'),
      verses: countRows(database, 'verses'),
      indexedVerses: countRows(database, 'verses_fts'),
    };
    if (stableJson(actual) !== stableJson(expected)) fail('BASE_ARTIFACT_INVALID', 'base row counts do not match the reviewed descriptor.');
  } finally {
    database.close();
  }
  await bindVerifiedEngine(databasePath, descriptor);
}

function parseYamlSource(file: ReviewedSourceFile): CandidateConcept {
  const document = parseDocument(file.contents, { prettyErrors: true });
  if (document.errors.length > 0 || document.warnings.length > 0) {
    fail('SOURCE_SNAPSHOT_MISMATCH', `${file.path} is not warning-free valid YAML.`);
  }
  visit(document, (_key, node) => {
    if (isAlias(node)) fail('SOURCE_SNAPSHOT_MISMATCH', `${file.path} contains a YAML alias.`);
    if (typeof node === 'object' && node !== null && 'tag' in node && typeof node.tag === 'string') {
      fail('SOURCE_SNAPSHOT_MISMATCH', `${file.path} contains an explicit YAML tag.`);
    }
  });
  const value = document.toJS({ maxAliasCount: 0 }) as unknown;
  if (!isRecord(value)) fail('SOURCE_SNAPSHOT_MISMATCH', `${file.path} must contain a concept map.`);
  const id = requireText(value.id, `${file.path}.id`, 'SOURCE_SNAPSHOT_MISMATCH');
  if (!ID.test(id)) fail('SOURCE_SNAPSHOT_MISMATCH', `${file.path}.id must be lowercase kebab-case.`);
  const textList = (input: unknown, label: string, optional = false): string[] => {
    if (input === undefined && optional) return [];
    if (!Array.isArray(input)) fail('SOURCE_SNAPSHOT_MISMATCH', `${label} must be an array.`);
    return input.map((entry, index) => requireText(entry, `${label}[${index}]`, 'SOURCE_SNAPSHOT_MISMATCH'));
  };
  const anchors = value.anchors === undefined ? [] : (() => {
    if (!Array.isArray(value.anchors)) fail('SOURCE_SNAPSHOT_MISMATCH', `${file.path}.anchors must be an array.`);
    return value.anchors.map((entry, index) => {
      if (!isRecord(entry)) fail('SOURCE_SNAPSHOT_MISMATCH', `${file.path}.anchors[${index}] must be a map.`);
      const sources = textList(entry.sources, `${file.path}.anchors[${index}].sources`);
      const weight = entry.weight === undefined ? undefined : entry.weight;
      if (weight !== undefined && (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0 || weight > 1)) {
        fail('SOURCE_SNAPSHOT_MISMATCH', `${file.path}.anchors[${index}].weight is invalid.`);
      }
      return {
        ref: requireText(entry.ref, `${file.path}.anchors[${index}].ref`, 'SOURCE_SNAPSHOT_MISMATCH'),
        sources,
        ...(weight === undefined ? {} : { weight }),
      };
    });
  })();
  return {
    id,
    label: requireText(value.label, `${file.path}.label`, 'SOURCE_SNAPSHOT_MISMATCH'),
    lexicon: textList(value.lexicon, `${file.path}.lexicon`, true),
    anchors,
    related: textList(value.related, `${file.path}.related`, true),
    openbibleTopics: textList(value.openbibleTopics, `${file.path}.openbibleTopics`, true),
  };
}

function loadSnapshotInputs(snapshot: ReviewedSourceSnapshot, proposal: ProposalManifest): {
  readonly filesByPath: Map<string, ReviewedSourceFile>;
  readonly ontology: Map<string, CandidateConcept>;
  readonly manifests: ManifestSet;
} {
  const filesByPath = new Map(snapshot.files.map((file) => [file.path, file]));
  const draftPaths = new Set(proposal.operations
    .filter((operation) => operation.type === 'concept-draft-create' || operation.type === 'concept-drafts-merge')
    .map(expectedOperationPath));
  const ontologyFiles = snapshot.files.filter((file) =>
    file.path.startsWith(ONTOLOGY_PREFIX) && file.path.endsWith('.yaml') && file.contents !== '');
  for (const file of snapshot.files.filter((entry) => entry.path.startsWith(ONTOLOGY_PREFIX) && entry.path.endsWith('.yaml') && entry.contents === '')) {
    if (!draftPaths.has(file.path) || file.sha256 !== sha256Bytes('')) {
      fail('SOURCE_SNAPSHOT_MISMATCH', `${file.path} is unexpectedly empty.`);
    }
  }
  const manifestFiles = snapshot.files.filter((file) => file.path.startsWith(MANIFEST_PREFIX) && file.path.endsWith('.json'));
  if (ontologyFiles.length === 0 || manifestFiles.length === 0) {
    fail('SOURCE_SNAPSHOT_MISMATCH', 'snapshot must contain the complete ontology and source manifest inventories.');
  }
  const ontology = new Map<string, CandidateConcept>();
  for (const file of ontologyFiles) {
    const concept = parseYamlSource(file);
    if (ontology.has(concept.id)) fail('SOURCE_SNAPSHOT_MISMATCH', `duplicate concept ${concept.id}.`);
    ontology.set(concept.id, concept);
  }
  const sources = manifestFiles.map((file) => {
    let parsed: unknown;
    try { parsed = JSON.parse(file.contents) as unknown; } catch { fail('SOURCE_SNAPSHOT_MISMATCH', `${file.path} is invalid JSON.`); }
    if (!isRecord(parsed)) fail('SOURCE_SNAPSHOT_MISMATCH', `${file.path} must contain a source manifest object.`);
    const source = parsed as unknown as SourceManifest;
    const tier = source.maxTier;
    if (tier !== 'public_distribution' && tier !== 'private_local' && tier !== 'dev_fixture') {
      fail('PROVENANCE_FAILED', `${file.path}.maxTier is invalid.`);
    }
    requireText(source.id, `${file.path}.id`, 'PROVENANCE_FAILED');
    requireText(source.rightsClass, `${file.path}.rightsClass`, 'PROVENANCE_FAILED');
    requireText(source.licenseRecord, `${file.path}.licenseRecord`, 'PROVENANCE_FAILED');
    if (typeof source.sha256 !== 'string' || (source.sha256 !== '' && !SHA256.test(source.sha256))) {
      fail('PROVENANCE_FAILED', `${file.path}.sha256 is invalid.`);
    }
    return source;
  });
  if (new Set(sources.map((source) => source.id)).size !== sources.length) fail('SOURCE_SNAPSHOT_MISMATCH', 'source manifest ids must be unique.');
  return { filesByPath, ontology, manifests: { sources } };
}

function provenancePolicyFingerprint(manifests: ManifestSet): string {
  const policy = manifests.sources.map((source) => ({
    id: source.id,
    contentIdentity: source.contentSha256 ?? source.sha256 ?? '',
    rightsClass: source.rightsClass,
    maxTier: source.maxTier,
    licenseAssertionSha256: sha256Bytes(source.licenseRecord),
    lineageOnly: source.lineageOnly === true,
    derivedFrom: [...(source.derivedFrom ?? [])].sort(),
  })).sort((a, b) => a.id.localeCompare(b.id));
  return sha256Bytes(stableJson(policy));
}

function verifySourcePreconditions(proposal: ProposalManifest, filesByPath: ReadonlyMap<string, ReviewedSourceFile>): void {
  for (const precondition of proposal.sourcePreconditions) {
    const file = filesByPath.get(precondition.path);
    if (file === undefined) fail('SOURCE_PRECONDITION_FAILED', `${precondition.path} is absent from the reviewed snapshot.`);
    if (file.sha256 !== precondition.sha256) {
      fail('SOURCE_PRECONDITION_FAILED', `${precondition.path} changed since proposal review.`);
    }
  }
}

function verifyReviewedDraftSources(
  proposal: ProposalManifest,
  sources: readonly ReviewedDraftSource[],
  filesByPath: ReadonlyMap<string, ReviewedSourceFile>,
): void {
  const mergeOperations = proposal.operations.filter((operation) => operation.type === 'concept-drafts-merge');
  if (mergeOperations.length === 0) return;
  if (sources.length === 0) {
    fail('SOURCE_SNAPSHOT_MISMATCH', 'concept-drafts-merge requires hash-bound reviewed draft source documents.');
  }
  const reviewedIds = new Set<string>();
  for (const source of sources) {
    const file = filesByPath.get(source.path);
    if (file === undefined || file.sha256 !== source.sha256) {
      fail('SOURCE_PRECONDITION_FAILED', `reviewed draft source ${source.path} is absent or changed.`);
    }
    let parsed: unknown;
    try { parsed = JSON.parse(file.contents) as unknown; }
    catch { fail('SOURCE_SNAPSHOT_MISMATCH', `reviewed draft source ${source.path} is invalid JSON.`); }
    const draft = parseDraft(parsed, `reviewed draft source ${source.path}`);
    const id = String(draft.id);
    if (reviewedIds.has(id)) fail('SOURCE_SNAPSHOT_MISMATCH', `reviewed draft id ${id} is duplicated.`);
    reviewedIds.add(id);
  }
  for (const operation of mergeOperations) {
    for (const id of operation.draftConceptIds as string[]) {
      if (!reviewedIds.has(id)) {
        fail('SOURCE_SNAPSHOT_MISMATCH', `merge draft id ${id} is not present in the hash-bound reviewed draft sources.`);
      }
    }
  }
}

function canonicalPhraseIdentity(value: string): string {
  return significantWords(value).join(' ');
}

function canonicalAnchorRange(locator: string): { readonly start: number; readonly end: number } | null {
  const range = parseAnchorRef(locator);
  if (range === null) return null;
  const start = parseVerseId(range.start);
  const end = parseVerseId(range.end);
  const startCount = kjvVerseCount(start.bookId, start.chapter);
  const endCount = kjvVerseCount(end.bookId, end.chapter);
  if (startCount === undefined || endCount === undefined || start.verse > startCount) return null;
  if (end.verse === 999 && !/:\d/.test(locator)) {
    return { start: range.start, end: end.bookId * 1_000_000 + end.chapter * 1_000 + endCount };
  }
  if (end.verse > endCount) return null;
  return range;
}

function canonicalAnchorIdentity(locator: string): string {
  const range = canonicalAnchorRange(locator);
  if (range === null) fail('INVALID_PROPOSAL', `anchor ${locator} is outside canonical KJV versification.`);
  return `${range.start}-${range.end}`;
}

function conceptFor(ontology: Map<string, CandidateConcept>, id: string): CandidateConcept {
  const concept = ontology.get(id);
  if (!concept) fail('INVALID_PROPOSAL', `proposal targets missing concept ${id}.`);
  return concept;
}

function draftConcept(value: Record<string, unknown>): CandidateConcept {
  return {
    id: String(value.id),
    label: String(value.label),
    lexicon: [...(value.lexicon as string[])],
    anchors: (value.anchors as { locator: string; sources: string[]; weight: number }[]).map((anchor) => ({
      ref: anchor.locator, sources: [...anchor.sources], weight: anchor.weight,
    })),
    related: [...(value.related as string[])],
    openbibleTopics: [],
  };
}

function applyProposal(base: ReadonlyMap<string, CandidateConcept>, proposal: ProposalManifest): Map<string, CandidateConcept> {
  const ontology = new Map([...base].map(([id, concept]) => [id, structuredClone(concept)]));
  for (const operation of proposal.operations) {
    if (operation.type === 'golden-fixture-upsert' || operation.type === 'fixture-corpus-chapter-add') continue;
    if (operation.type === 'concept-draft-create' || operation.type === 'concept-drafts-merge') {
      const draft = draftConcept((operation.type === 'concept-draft-create' ? operation.draft : operation.reviewedConcept) as Record<string, unknown>);
      if (ontology.has(draft.id)) fail('INVALID_PROPOSAL', `concept ${draft.id} already exists.`);
      ontology.set(draft.id, draft);
      continue;
    }
    const concept = conceptFor(ontology, String(operation.conceptId));
    if (operation.type === 'lexicon-phrase-add') {
      const phrase = String(operation.phrase);
      if (concept.lexicon.some((entry) => canonicalPhraseIdentity(entry) === canonicalPhraseIdentity(phrase))) fail('INVALID_PROPOSAL', `phrase ${phrase} already exists.`);
      concept.lexicon.push(phrase);
    } else if (operation.type === 'lexicon-phrase-remove') {
      const index = concept.lexicon.findIndex((entry) => canonicalPhraseIdentity(entry) === canonicalPhraseIdentity(String(operation.phrase)));
      if (index < 0) fail('INVALID_PROPOSAL', `phrase ${String(operation.phrase)} does not exist.`);
      concept.lexicon.splice(index, 1);
    } else if (operation.type === 'editorial-anchor-add') {
      const anchor = operation.anchor as { locator: string; weight: number };
      const identity = canonicalAnchorIdentity(anchor.locator);
      if (concept.anchors.some((entry) => canonicalAnchorIdentity(entry.ref) === identity)) fail('INVALID_PROPOSAL', `anchor ${anchor.locator} already exists.`);
      concept.anchors.push({ ref: anchor.locator, sources: ['editorial'], weight: anchor.weight });
    } else if (operation.type === 'editorial-anchor-remove') {
      const identity = canonicalAnchorIdentity(String(operation.locator));
      const index = concept.anchors.findIndex((entry) => canonicalAnchorIdentity(entry.ref) === identity);
      if (index < 0) fail('INVALID_PROPOSAL', `anchor ${String(operation.locator)} does not exist.`);
      const anchor = concept.anchors[index]!;
      if (anchor.sources.length !== 1 || anchor.sources[0] !== 'editorial') fail('PROVENANCE_FAILED', `anchor ${anchor.ref} is source-derived and cannot be removed editorially.`);
      concept.anchors.splice(index, 1);
    } else if (operation.type === 'editorial-anchor-adjust') {
      const current = operation.current as { locator: string; weight: number };
      const next = operation.next as { locator: string; weight: number };
      const currentIdentity = canonicalAnchorIdentity(current.locator);
      const nextIdentity = canonicalAnchorIdentity(next.locator);
      const anchor = concept.anchors.find((entry) => canonicalAnchorIdentity(entry.ref) === currentIdentity);
      if (!anchor) fail('INVALID_PROPOSAL', `anchor ${current.locator} does not exist.`);
      if (anchor.sources.length !== 1 || anchor.sources[0] !== 'editorial') fail('PROVENANCE_FAILED', `anchor ${current.locator} is source-derived.`);
      if ((anchor.weight ?? 1) !== current.weight) fail('SOURCE_PRECONDITION_FAILED', `anchor ${current.locator} weight changed since review.`);
      if (currentIdentity !== nextIdentity && concept.anchors.some((entry) => canonicalAnchorIdentity(entry.ref) === nextIdentity)) fail('INVALID_PROPOSAL', `anchor ${next.locator} already exists.`);
      anchor.ref = next.locator;
      anchor.weight = next.weight;
    } else {
      const relatedId = String(operation.relatedConceptId);
      const index = concept.related.indexOf(relatedId);
      if (operation.type === 'related-concept-add') {
        if (index >= 0) fail('INVALID_PROPOSAL', `related edge ${concept.id} -> ${relatedId} already exists.`);
        concept.related.push(relatedId);
      } else {
        if (index < 0) fail('INVALID_PROPOSAL', `related edge ${concept.id} -> ${relatedId} does not exist.`);
        concept.related.splice(index, 1);
      }
    }
  }
  return ontology;
}

function compileConcepts(ontology: ReadonlyMap<string, CandidateConcept>): CompiledOntology {
  const files = [...ontology.values()].map((concept) => ({ name: `${concept.id}.yaml`, contents: stableJson(concept) }));
  const compiled = compileOntology(files);
  if (compiled.errors.length > 0) fail('INVALID_PROPOSAL', `candidate ontology failed production compilation:\n${compiled.errors.join('\n')}`);
  return compiled.ontology;
}

function presentVerseIds(database: DatabaseSync): Set<number> {
  return new Set((database.prepare('SELECT DISTINCT verse_id AS verseId FROM verses').all() as { verseId: number }[]).map((row) => row.verseId));
}

function rangePresent(start: number, end: number, present: ReadonlySet<number>): boolean {
  if (present.has(start) || present.has(end)) return true;
  for (let id = start; id <= end && id - start < 400; id += 1) if (present.has(id)) return true;
  return false;
}

function compiledOwnedRows(ontology: CompiledOntology, present: ReadonlySet<number>): Record<string, Record<string, unknown>[]> {
  return {
    concepts: ontology.concepts.map((entry) => ({ id: entry.id, label: entry.label })),
    concept_lexicon: ontology.lexicon.map((entry) => ({
      concept_id: entry.conceptId, phrase: entry.phrase, normalized: entry.normalized, token_count: entry.tokenCount,
    })),
    concept_anchors: ontology.anchors
      .filter((entry) => rangePresent(entry.startVerseId, entry.endVerseId, present))
      .map((entry) => ({
        concept_id: entry.conceptId, start_verse_id: entry.startVerseId, end_verse_id: entry.endVerseId,
        source_id: entry.sourceId, weight: entry.weight, locator: entry.locator,
      })),
    concept_related: ontology.related.map((entry) => ({ concept_id: entry.conceptId, related_id: entry.relatedId })),
  };
}

function databaseOwnedRows(database: DatabaseSync): Record<string, Record<string, unknown>[]> {
  return {
    concepts: database.prepare('SELECT id, label FROM concepts').all() as Record<string, unknown>[],
    concept_lexicon: database.prepare('SELECT concept_id, phrase, normalized, token_count FROM concept_lexicon').all() as Record<string, unknown>[],
    concept_anchors: database.prepare("SELECT concept_id, start_verse_id, end_verse_id, source_id, weight, locator FROM concept_anchors WHERE source_id <> 'openbible-topics'").all() as Record<string, unknown>[],
    concept_related: database.prepare('SELECT concept_id, related_id FROM concept_related').all() as Record<string, unknown>[],
  };
}

function ownedDigest(rows: Readonly<Record<string, readonly Record<string, unknown>[]>>): string {
  return sha256Bytes(stableJson(Object.fromEntries(Object.keys(rows).sort().map((key) => [key, digestRows(rows[key] ?? [])]))));
}

function layerFingerprint(
  ontology: CompiledOntology,
  counts: Readonly<Record<string, number>>,
  pericopes: readonly CandidatePericopeRow[] | null,
  phrases: readonly CandidatePhraseRow[] | null,
): string {
  const hash = createHash('sha256');
  const feed = (parts: readonly (string | number)[]): void => {
    const record = parts.join(' ');
    hash.update(String(record.length));
    hash.update(' ');
    hash.update(record);
  };
  for (const concept of [...ontology.concepts].sort((a, b) => (a.id < b.id ? -1 : 1))) feed(['c', concept.id, concept.label]);
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
  // Schema v8 (CO-3 PR 1): pericope rows feed per-record and their count
  // widens the counts record. A pre-v8 base (pericopes === null) keeps the
  // exact pre-v8 feed, byte for byte — the mirror reproduces whichever
  // shape the artifact's own builder wrote.
  if (pericopes !== null) {
    for (const row of [...pericopes].sort((a, b) => a.startVerseId - b.startVerseId)) {
      feed(['p', row.startVerseId, row.endVerseId, row.boundaryVotes]);
    }
  }
  // Schema v9 (P6.3/B3 Phase A): TSK phrase rows feed per-record after the
  // pericopes and their count widens the counts record once more. A pre-v9
  // base (phrases === null) keeps the exact earlier feed shape, byte for
  // byte — and a pre-v8 base keeps ITS shape — the mirror reproduces
  // whichever record the artifact's own builder wrote.
  if (phrases !== null) {
    for (const row of phrases) {
      feed(['x', row.fromVerseId, row.normalizedPhrase, row.toStartVerseId, row.toEndVerseId]);
    }
  }
  const base = [counts.topicAnchors ?? 0, counts.crossReferences ?? 0, counts.verseTerms ?? 0, counts.translationTokens ?? 0];
  if (pericopes !== null) base.push(pericopes.length);
  if (phrases !== null) base.push(phrases.length);
  feed(['counts', ...base]);
  return hash.digest('hex');
}

function installOwnedLayer(database: DatabaseSync, ontology: CompiledOntology): Record<string, number> {
  const present = presentVerseIds(database);
  const rows = compiledOwnedRows(ontology, present);
  const topicAnchors = database.prepare("SELECT concept_id, start_verse_id, end_verse_id, source_id, weight, locator FROM concept_anchors WHERE source_id = 'openbible-topics'").all() as Record<string, unknown>[];
  const counts = {
    concepts: rows.concepts!.length,
    lexiconEntries: rows.concept_lexicon!.length,
    editorialAnchors: rows.concept_anchors!.length,
    topicAnchors: topicAnchors.length,
    crossReferences: countRows(database, 'cross_references'),
    verseTerms: countRows(database, 'verse_terms'),
    translationTokens: countRows(database, 'verse_translation_tokens'),
  };
  database.exec('PRAGMA foreign_keys = OFF; BEGIN IMMEDIATE');
  try {
    database.exec('DELETE FROM concept_related; DELETE FROM concept_anchors; DELETE FROM concept_lexicon; DELETE FROM concepts;');
    const insertConcept = database.prepare('INSERT INTO concepts(id, label) VALUES (?, ?)');
    const insertLexicon = database.prepare('INSERT INTO concept_lexicon(concept_id, phrase, normalized, token_count) VALUES (?, ?, ?, ?)');
    const insertAnchor = database.prepare('INSERT INTO concept_anchors(concept_id, start_verse_id, end_verse_id, source_id, weight, locator) VALUES (?, ?, ?, ?, ?, ?)');
    const insertRelated = database.prepare('INSERT INTO concept_related(concept_id, related_id) VALUES (?, ?)');
    for (const row of rows.concepts!) insertConcept.run(row.id as never, row.label as never);
    for (const row of rows.concept_lexicon!) {
      insertLexicon.run(row.concept_id as never, row.phrase as never, row.normalized as never, row.token_count as never);
    }
    for (const row of [...rows.concept_anchors!, ...topicAnchors]) {
      insertAnchor.run(
        row.concept_id as never,
        row.start_verse_id as never,
        row.end_verse_id as never,
        row.source_id as never,
        row.weight as never,
        row.locator as never,
      );
    }
    for (const row of rows.concept_related!) insertRelated.run(row.concept_id as never, row.related_id as never);
    const fingerprint = layerFingerprint(
      ontology,
      counts,
      readPericopeRows(database),
      readCrossReferencePhraseRows(database),
    );
    database.prepare('INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)').run('layer_fingerprint', fingerprint);
    database.exec('COMMIT');
    return counts;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  } finally {
    database.exec('PRAGMA foreign_keys = ON');
  }
}

function cacheKey(
  descriptor: BaseArtifactDescriptor,
  proposalDigest: string,
  policyFingerprint: string,
): string {
  return sha256Bytes(stableJson({
    databaseSha256: descriptor.databaseSha256,
    schemaVersion: descriptor.schemaVersion,
    engineVersion: descriptor.engineVersion,
    tokenizerVersion: descriptor.tokenizerVersion,
    corpusFingerprint: descriptor.corpusFingerprint,
    layerFingerprint: descriptor.layerFingerprint,
    manifestFingerprint: descriptor.manifestFingerprint,
    provenancePolicyFingerprint: policyFingerprint,
    proposalDigest,
  }));
}

function validateCandidateDescriptor(value: unknown, expected: {
  readonly cacheKey: string;
  readonly proposalDigest: string;
  readonly base: BaseArtifactDescriptor;
  readonly sourceSnapshotDigest: string;
  readonly provenancePolicyFingerprint: string;
}): CandidateArtifactDescriptor {
  const record = exactKeys(value, [
    'formatVersion', 'kind', 'cacheKey', 'proposalDigest', 'sourceSnapshotDigest', 'provenancePolicyFingerprint', 'base',
    'schemaVersion', 'engineVersion', 'tokenizerVersion', 'corpusFingerprint', 'layerFingerprint',
    'manifestFingerprint', 'databaseSha256', 'databaseBytes', 'logicalTableDigest', 'tableDigests', 'counts',
  ], [], 'candidate', 'CANDIDATE_INVALID');
  if (record.formatVersion !== 1 || record.kind !== 'scripture-search-candidate') {
    fail('CANDIDATE_INVALID', 'candidate descriptor header is invalid.');
  }
  const descriptor = record as unknown as CandidateArtifactDescriptor;
  if (descriptor.cacheKey !== expected.cacheKey || descriptor.proposalDigest !== expected.proposalDigest) {
    fail('CANDIDATE_INVALID', 'candidate descriptor cache/proposal identity is invalid.');
  }
  if (descriptor.sourceSnapshotDigest !== expected.sourceSnapshotDigest) {
    fail('CANDIDATE_INVALID', 'candidate descriptor does not identify the current reviewed source snapshot.');
  }
  if (descriptor.provenancePolicyFingerprint !== expected.provenancePolicyFingerprint) {
    fail('CANDIDATE_INVALID', 'candidate descriptor provenance policy identity is invalid.');
  }
  for (const field of ['sourceSnapshotDigest', 'provenancePolicyFingerprint', 'corpusFingerprint', 'layerFingerprint', 'manifestFingerprint', 'databaseSha256', 'logicalTableDigest'] as const) {
    requireDigest(descriptor[field], `candidate.${field}`, 'CANDIDATE_INVALID');
  }
  const descriptorBase = exactKeys(descriptor.base, [
    'databaseSha256', 'schemaVersion', 'engineVersion', 'tokenizerVersion',
    'corpusFingerprint', 'layerFingerprint', 'manifestFingerprint', 'provenancePolicyFingerprint',
  ], [], 'candidate.base', 'CANDIDATE_INVALID');
  const expectedBase = {
    databaseSha256: expected.base.databaseSha256,
    schemaVersion: expected.base.schemaVersion,
    engineVersion: expected.base.engineVersion,
    tokenizerVersion: expected.base.tokenizerVersion,
    corpusFingerprint: expected.base.corpusFingerprint,
    layerFingerprint: expected.base.layerFingerprint,
    manifestFingerprint: expected.base.manifestFingerprint,
    provenancePolicyFingerprint: expected.provenancePolicyFingerprint,
  };
  if (stableJson(descriptorBase) !== stableJson(expectedBase)) {
    fail('CANDIDATE_INVALID', 'candidate descriptor does not identify the requested base artifact.');
  }
  if (descriptor.schemaVersion !== expected.base.schemaVersion
      || descriptor.engineVersion !== expected.base.engineVersion
      || descriptor.tokenizerVersion !== expected.base.tokenizerVersion
      || descriptor.corpusFingerprint !== expected.base.corpusFingerprint
      || descriptor.manifestFingerprint !== expected.base.manifestFingerprint) {
    fail('CANDIDATE_INVALID', 'candidate identities are incompatible with the base artifact.');
  }
  if (!Number.isSafeInteger(descriptor.databaseBytes) || descriptor.databaseBytes <= 0 || !isRecord(descriptor.tableDigests) || !isRecord(descriptor.counts)) {
    fail('CANDIDATE_INVALID', 'candidate descriptor measurements are invalid.');
  }
  for (const [table, digest] of Object.entries(descriptor.tableDigests)) requireDigest(digest, `candidate.tableDigests.${table}`, 'CANDIDATE_INVALID');
  for (const [name, count] of Object.entries(descriptor.counts)) {
    if (!Number.isSafeInteger(count) || (count as number) < 0) fail('CANDIDATE_INVALID', `candidate.counts.${name} is invalid.`);
  }
  return descriptor;
}

async function verifyCandidateDirectory(candidateDirectory: string, expected: {
  readonly cacheKey: string;
  readonly proposalDigest: string;
  readonly base: BaseArtifactDescriptor;
  readonly sourceSnapshotDigest: string;
  readonly provenancePolicyFingerprint: string;
  readonly layerFingerprint: string;
  readonly ownedRowsDigest: string;
  readonly counts: Readonly<Record<string, number>>;
  readonly baseTableDigests: Readonly<Record<string, string>>;
  readonly expectedMetaRows: readonly DatabaseMetaRow[];
  readonly spellingTableDigests: Readonly<Record<string, string>> | null;
}): Promise<CandidateBuildResult> {
  const databasePath = join(candidateDirectory, CANDIDATE_DATABASE);
  const descriptorPath = join(candidateDirectory, CANDIDATE_DESCRIPTOR);
  if (!existsSync(databasePath) || !existsSync(descriptorPath)) fail('CANDIDATE_INVALID', 'cached candidate is incomplete.');
  let parsed: unknown;
  try { parsed = JSON.parse(readFileSync(descriptorPath, 'utf8')) as unknown; } catch { fail('CANDIDATE_INVALID', 'candidate descriptor is invalid JSON.'); }
  const descriptor = validateCandidateDescriptor(parsed, expected);
  if (descriptor.layerFingerprint !== expected.layerFingerprint) {
    fail('CANDIDATE_INVALID', 'cached candidate layer fingerprint does not match the proposal-derived layer.');
  }
  if (stableJson(descriptor.counts) !== stableJson(expected.counts)) {
    fail('CANDIDATE_INVALID', 'cached candidate counts do not match independently derived counts.');
  }
  if (statSync(databasePath).size !== descriptor.databaseBytes || fileSha256(databasePath) !== descriptor.databaseSha256) {
    fail('CANDIDATE_INVALID', 'cached candidate database SHA-256 or byte length changed.');
  }
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    validateDatabaseSchema(database, descriptor);
    assertExactCandidateMeta(database, expected.expectedMetaRows, 'cached candidate');
    const tables = logicalTableDigests(database);
    if (stableJson(tables) !== stableJson(descriptor.tableDigests) || combinedTableDigest(tables) !== descriptor.logicalTableDigest) {
      fail('CANDIDATE_INVALID', 'cached candidate logical table digest changed.');
    }
    if (ownedDigest(databaseOwnedRows(database)) !== expected.ownedRowsDigest) {
      fail('CANDIDATE_INVALID', 'cached candidate owned rows do not match the reviewed proposal.');
    }
    const expectedTableNames = Object.keys(expected.baseTableDigests).sort();
    if (stableJson(Object.keys(tables).sort()) !== stableJson(expectedTableNames)) {
      fail('CANDIDATE_INVALID', 'cached candidate table inventory differs from the verified base.');
    }
    for (const [table, digest] of Object.entries(expected.baseTableDigests)) {
      if (expected.spellingTableDigests && (DERIVED_SPELLING_TABLES as readonly string[]).includes(table)) continue;
      if (table !== 'meta' && !(OWNED_TABLES as readonly string[]).includes(table) && tables[table] !== digest) {
        fail('CANDIDATE_INVALID', `cached candidate changed non-owned table ${table}.`);
      }
    }
    if (expected.spellingTableDigests) {
      assertSpellingTablesMatchExpectation(database, expected.spellingTableDigests, 'cached candidate');
    }
  } finally {
    database.close();
  }
  await bindVerifiedEngine(databasePath, descriptor);
  return { status: 'CACHE_HIT', cacheKey: expected.cacheKey, candidateDirectory, databasePath, descriptorPath, descriptor };
}

function maybeFault(actual: CandidateBuildOptions['faultAt'], point: NonNullable<CandidateBuildOptions['faultAt']>): void {
  if (actual === point) fail('BUILD_INTERRUPTED', `simulated interruption at ${point}.`);
}

function readLockOwner(lockDirectory: string): CacheLockOwner | null {
  try {
    const value = JSON.parse(readFileSync(join(lockDirectory, 'owner.json'), 'utf8')) as unknown;
    if (!isRecord(value) || value.formatVersion !== 1 || typeof value.cacheKey !== 'string'
        || typeof value.operationId !== 'string' || !Number.isSafeInteger(value.pid)
        || typeof value.createdAt !== 'string' || typeof value.stagingName !== 'string') {
      return null;
    }
    return value as unknown as CacheLockOwner;
  } catch {
    return null;
  }
}

function processIsAlive(pid: number): boolean {
  if (pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

function cleanupOwnedStaging(outputDirectory: string, owner: CacheLockOwner): void {
  const expectedName = `.incomplete-${owner.operationId}`;
  if (owner.stagingName !== expectedName) return;
  const staging = join(outputDirectory, owner.stagingName);
  if (!existsSync(staging)) return;
  try {
    const marker = JSON.parse(readFileSync(join(staging, 'operation.json'), 'utf8')) as unknown;
    if (!isRecord(marker) || marker.formatVersion !== 1 || marker.cacheKey !== owner.cacheKey
        || marker.operationId !== owner.operationId) return;
    rmSync(staging, { recursive: true, force: true });
  } catch {
    // A staging directory without the exact operation marker is not ours to remove.
  }
}

function reclaimClaims(lockPath: string): string[] {
  const root = dirname(lockPath);
  const prefix = `${basename(lockPath)}.stale-claim-`;
  try {
    return readdirSync(root).filter((entry) => entry.startsWith(prefix)).map((entry) => join(root, entry));
  } catch {
    return [];
  }
}

function tryReclaimStaleLock(lockPath: string, outputDirectory: string, cacheKeyValue: string): boolean {
  let age: number;
  try {
    age = Date.now() - statSync(lockPath).mtimeMs;
  } catch {
    return true;
  }
  if (age < LOCK_STALE_MS) return false;
  const observed = readLockOwner(lockPath);
  if (observed && (observed.cacheKey !== cacheKeyValue || processIsAlive(observed.pid))) return false;
  if (observed) {
    const created = Date.parse(observed.createdAt);
    if (!Number.isFinite(created) || Date.now() - created < LOCK_STALE_MS) return false;
  }

  const claimPath = `${lockPath}.stale-claim-${randomUUID()}`;
  try {
    renameSync(lockPath, claimPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return true;
    return false;
  }
  try {
    const claimed = readLockOwner(claimPath);
    if (observed && (!claimed || claimed.operationId !== observed.operationId)) {
      // Ownership changed between observation and claim. Every acquirer honors
      // claim directories, so wait for any tentative canonical owner to yield,
      // then restore the claimed live owner without deleting its lock.
      const deadline = Date.now() + 5_000;
      while (existsSync(lockPath) && Date.now() < deadline) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25);
      }
      if (!existsSync(lockPath)) renameSync(claimPath, lockPath);
      return false;
    }
    if (claimed) cleanupOwnedStaging(outputDirectory, claimed);
    return true;
  } finally {
    const claimed = readLockOwner(claimPath);
    if (!claimed || !observed || claimed.operationId === observed.operationId) {
      if (existsSync(claimPath)) rmSync(claimPath, { recursive: true, force: true });
    }
  }
}

async function acquireCacheLock(outputDirectory: string, cacheKeyValue: string): Promise<CacheLock> {
  const lockRoot = join(outputDirectory, '.locks');
  mkdirSync(lockRoot, { recursive: true });
  const lockPath = join(lockRoot, `${cacheKeyValue}.lock`);
  const operationId = randomUUID();
  const stagingName = `.incomplete-${operationId}`;
  const started = Date.now();
  for (;;) {
    if (reclaimClaims(lockPath).length > 0) {
      if (Date.now() - started >= LOCK_WAIT_MS) fail('BUILD_INTERRUPTED', `timed out waiting for candidate cache reclaim ${cacheKeyValue}.`);
      await delay(50);
      continue;
    }
    let created = false;
    try {
      mkdirSync(lockPath);
      created = true;
      const owner: CacheLockOwner = {
        formatVersion: 1,
        cacheKey: cacheKeyValue,
        operationId,
        pid: process.pid,
        createdAt: new Date().toISOString(),
        stagingName,
      };
      writeFileSync(join(lockPath, 'owner.json'), `${JSON.stringify(owner)}\n`, { encoding: 'utf8', flag: 'wx' });
      if (reclaimClaims(lockPath).length > 0) {
        rmSync(lockPath, { recursive: true, force: true });
        await delay(50);
        continue;
      }
      return { lockPath, operationId, stagingName };
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (created) {
        rmSync(lockPath, { recursive: true, force: true });
        throw error;
      }
      if (code !== 'EEXIST') throw error;
      tryReclaimStaleLock(lockPath, outputDirectory, cacheKeyValue);
      if (Date.now() - started >= LOCK_WAIT_MS) {
        fail('BUILD_INTERRUPTED', `timed out waiting for candidate cache lock ${cacheKeyValue}.`);
      }
      await delay(50);
    }
  }
}

function releaseCacheLock(lock: CacheLock): void {
  const owner = readLockOwner(lock.lockPath);
  if (owner?.operationId === lock.operationId) {
    rmSync(lock.lockPath, { recursive: true, force: true });
  }
}

function inspectLayerExpectation(
  databasePath: string,
  descriptor: BaseArtifactDescriptor,
  baseOntology: CompiledOntology,
  candidateOntology: CompiledOntology,
): {
  readonly ownedRowsDigest: string;
  readonly layerFingerprint: string;
  readonly counts: Record<string, number>;
  readonly baseTableDigests: Record<string, string>;
  readonly expectedMetaRows: readonly DatabaseMetaRow[];
  /** null for a pre-v7 base; otherwise digestRows of the derived spelling tables. */
  readonly spellingTableDigests: Readonly<Record<string, string>> | null;
} {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const present = presentVerseIds(database);
    const actualBaseOwnedDigest = ownedDigest(databaseOwnedRows(database));
    const reviewedBaseOwnedDigest = ownedDigest(compiledOwnedRows(baseOntology, present));
    if (actualBaseOwnedDigest !== reviewedBaseOwnedDigest) {
      fail('SOURCE_SNAPSHOT_MISMATCH', 'reviewed ontology snapshot does not reproduce the base artifact owned rows.');
    }
    const layerCounts = {
      topicAnchors: Number((database.prepare("SELECT COUNT(*) AS count FROM concept_anchors WHERE source_id = 'openbible-topics'").get() as { count: number }).count),
      crossReferences: countRows(database, 'cross_references'),
      verseTerms: countRows(database, 'verse_terms'),
      translationTokens: countRows(database, 'verse_translation_tokens'),
    };
    // Schema v7 chains the spelling-vocabulary fingerprint on top of the
    // concept-layer fingerprint (buildSpellingIndex is the writer; this is
    // the independent reviewer-side recomputation). The candidate mutates the
    // lexicon, which is one of the five vocabulary sources, so both the base
    // check and the candidate expectation must reproduce the chain.
    const spellingPresent = hasSpellingIndex(database);
    const spellingSources = spellingPresent
      ? readSpellingVocabularySources(database as unknown as SqliteReadWriteDatabase)
      : null;
    // v8 pericope rows: non-owned, candidate-untouched, but part of the
    // concept-layer feed — read once and applied to BOTH sides of the check.
    const pericopeRows = readPericopeRows(database);
    const phraseRows = readCrossReferencePhraseRows(database);
    const baseConceptFingerprint = layerFingerprint(baseOntology, layerCounts, pericopeRows, phraseRows);
    // QR-6: the chain's LAST link. Alias rows are non-owned bytes a
    // candidate never touches (byte-verified by the copied-table check), but
    // they end the layer-fingerprint chain, so both the base check and the
    // candidate expectation must reproduce the same links over the same
    // rows. A rowless (or pre-v7 absent) table contributes nothing — the
    // pre-QR-6 chains are preserved exactly.
    const aliasRows = hasCuratedAliasTable(database)
      ? readCuratedAliasRows(database as unknown as SqliteReadWriteDatabase)
      : [];
    const chainAliases = (fingerprint: string): string =>
      aliasRows.length > 0 ? aliasLayerFingerprint(fingerprint, aliasRows) : fingerprint;
    const expectedBaseFingerprint = chainAliases(
      spellingSources
        ? spellingLayerFingerprint(baseConceptFingerprint, assembleSpellingVocabulary(spellingSources))
        : baseConceptFingerprint,
    );
    if (expectedBaseFingerprint !== descriptor.layerFingerprint) {
      fail('SOURCE_SNAPSHOT_MISMATCH', 'reviewed ontology snapshot does not reproduce the base layer fingerprint.');
    }
    const candidateRows = compiledOwnedRows(candidateOntology, present);
    const candidateOwnedDigest = ownedDigest(candidateRows);
    if (candidateOwnedDigest === actualBaseOwnedDigest) {
      fail('NO_MEASURABLE_EFFECT', 'proposal does not change any result-affecting candidate table.');
    }
    const baseTableDigests = logicalTableDigests(database);
    const candidateConceptFingerprint = layerFingerprint(candidateOntology, layerCounts, pericopeRows, phraseRows);
    let candidateLayerFingerprint = candidateConceptFingerprint;
    let spellingTableDigests: Readonly<Record<string, string>> | null = null;
    if (spellingSources) {
      // The candidate vocabulary: identical corpus/books/translations/
      // verse_terms sources (candidates never touch them) with the lexicon
      // replaced by the proposal-derived rows — exactly what
      // buildSpellingIndex will read back from the mutated copy.
      const candidateTerms = assembleSpellingVocabulary({
        ...spellingSources,
        lexiconNormalized: [...new Set(
          candidateRows.concept_lexicon!.map((row) => row.normalized as string),
        )],
      });
      candidateLayerFingerprint = spellingLayerFingerprint(
        candidateConceptFingerprint,
        candidateTerms,
      );
      spellingTableDigests = {
        spelling_terms: digestRows(candidateTerms.map((row) => ({
          term: row.term, document_count: row.documentCount, origins: row.origins,
        }))),
        spelling_deletes: digestRows(spellingDeleteRows(candidateTerms).map((row) => ({
          delete_key: row.deleteKey, term: row.term,
        }))),
      };
    }
    // Same alias links on the candidate side: candidates never mutate alias
    // rows, so the candidate's chain ends over the base's own verified rows.
    candidateLayerFingerprint = chainAliases(candidateLayerFingerprint);
    return {
      ownedRowsDigest: candidateOwnedDigest,
      layerFingerprint: candidateLayerFingerprint,
      counts: {
        concepts: candidateRows.concepts!.length,
        lexiconEntries: candidateRows.concept_lexicon!.length,
        editorialAnchors: candidateRows.concept_anchors!.length,
        ...layerCounts,
      },
      baseTableDigests,
      expectedMetaRows: expectedCandidateMetaRows(database, descriptor, candidateLayerFingerprint),
      spellingTableDigests,
    };
  } finally {
    database.close();
  }
}

export async function buildCandidate(
  requestInput: CandidateBuildRequest | unknown,
  options: CandidateBuildOptions = {},
): Promise<CandidateBuildResult> {
  const request = parseRequest(requestInput);
  assertSafeRequestPaths(request);
  const proposal = parseProposal(request.proposal, request.proposalDigest);
  const descriptor = validateBaseDescriptor(JSON.parse(readFileSync(request.baseDescriptorPath, 'utf8')) as unknown);
  const baseHashBefore = fileSha256(request.baseDatabasePath);
  await verifyBase(request.baseDatabasePath, descriptor);
  const snapshot = loadSnapshotInputs(request.reviewedSources, proposal);
  verifySourcePreconditions(proposal, snapshot.filesByPath);
  verifyReviewedDraftSources(proposal, request.reviewedDraftSources ?? [], snapshot.filesByPath);
  if (manifestFingerprint(snapshot.manifests) !== descriptor.manifestFingerprint) {
    fail('PROVENANCE_FAILED', 'reviewed manifest inventory does not match the base artifact manifest fingerprint.');
  }
  const baseSourceRows = descriptor.sources.map((source) => ({
    id: source.id,
    sha256: source.sha256,
    rightsClass: source.rightsClass,
    maxTier: source.maxTier,
  })).sort((a, b) => a.id.localeCompare(b.id));
  const snapshotSourceRows = snapshot.manifests.sources.filter((source) => source.sha256).map((source) => ({
    id: source.id,
    sha256: source.sha256,
    rightsClass: source.rightsClass,
    maxTier: source.maxTier,
  })).sort((a, b) => a.id.localeCompare(b.id));
  if (stableJson(baseSourceRows) !== stableJson(snapshotSourceRows)) {
    fail('PROVENANCE_FAILED', 'reviewed source manifests do not match the base descriptor source identities.');
  }

  const baseOntology = compileConcepts(snapshot.ontology);
  const candidateSources = applyProposal(snapshot.ontology, proposal);
  const candidateOntology = compileConcepts(candidateSources);
  const provenanceFailures = checkProvenance({
    manifests: snapshot.manifests,
    citedSourceIds: candidateOntology.citedSourceIds,
    tier: descriptor.distributionTier,
  });
  if (provenanceFailures.length > 0) fail('PROVENANCE_FAILED', provenanceFailures.join('; '));
  const policyFingerprint = provenancePolicyFingerprint(snapshot.manifests);
  const expectedLayer = inspectLayerExpectation(
    request.baseDatabasePath,
    descriptor,
    baseOntology,
    candidateOntology,
  );

  const key = cacheKey(descriptor, request.proposalDigest, policyFingerprint);
  const candidateDirectory = join(request.outputDirectory, key);
  mkdirSync(request.outputDirectory, { recursive: true });
  const verificationExpectation = {
    cacheKey: key,
    proposalDigest: request.proposalDigest,
    base: descriptor,
    sourceSnapshotDigest: request.reviewedSources.digest,
    provenancePolicyFingerprint: policyFingerprint,
    layerFingerprint: expectedLayer.layerFingerprint,
    ownedRowsDigest: expectedLayer.ownedRowsDigest,
    counts: expectedLayer.counts,
    baseTableDigests: expectedLayer.baseTableDigests,
    expectedMetaRows: expectedLayer.expectedMetaRows,
    spellingTableDigests: expectedLayer.spellingTableDigests,
  } as const;
  const lock = await acquireCacheLock(request.outputDirectory, key);
  try {
    if (existsSync(candidateDirectory)) {
      try {
        const hit = await verifyCandidateDirectory(candidateDirectory, verificationExpectation);
        if (fileSha256(request.baseDatabasePath) !== baseHashBefore) fail('BASE_ARTIFACT_INVALID', 'base artifact changed during cache verification.');
        return hit;
      } catch {
        const invalid = join(request.outputDirectory, `.invalid-${key}-${randomUUID()}`);
        renameSync(candidateDirectory, invalid);
      }
    }

    const staging = join(request.outputDirectory, lock.stagingName);
    const stagingDatabase = join(staging, CANDIDATE_DATABASE);
    const stagingDescriptor = join(staging, CANDIDATE_DESCRIPTOR);
    try {
    mkdirSync(staging, { recursive: false });
    writeFileSync(join(staging, 'operation.json'), `${JSON.stringify({
      formatVersion: 1,
      cacheKey: key,
      operationId: lock.operationId,
    })}\n`, { encoding: 'utf8', flag: 'wx' });
    copyFileSync(request.baseDatabasePath, stagingDatabase);
    if (fileSha256(stagingDatabase) !== descriptor.databaseSha256) fail('BASE_ARTIFACT_INVALID', 'isolated base copy failed verification.');
    maybeFault(options.faultAt, 'after-copy');

    const database = new DatabaseSync(stagingDatabase);
    let counts: Record<string, number>;
    try {
      counts = installOwnedLayer(database, candidateOntology);
      if (expectedLayer.spellingTableDigests) {
        // Rebuild the derived spelling index over the mutated lexicon via the
        // SAME builder artifact builds use, chaining the layer fingerprint on
        // top of the concept fingerprint installOwnedLayer just wrote. Runs
        // after installOwnedLayer's COMMIT — it manages its own transaction.
        buildSpellingIndex(database as unknown as SqliteReadWriteDatabase);
      }
      if (hasCuratedAliasTable(database)) {
        // Re-chain the alias links LAST (QR-6): installOwnedLayer and
        // buildSpellingIndex rewrote meta's layer_fingerprint, but the copied
        // curated_aliases rows (non-owned, byte-verified with every other
        // non-owned table) still end the chain in a real artifact. A rowless
        // table is a no-op inside chainAliasLayerFingerprint, so pre-pack v7
        // bases keep their exact pre-QR-6 identity.
        chainAliasLayerFingerprint(database as unknown as SqliteReadWriteDatabase);
      }
      if (ownedDigest(databaseOwnedRows(database)) !== expectedLayer.ownedRowsDigest) {
        fail('CANDIDATE_INVALID', 'installed candidate rows differ from the proposal-derived rows.');
      }
      database.exec('VACUUM');
      maybeFault(options.faultAt, 'after-mutation');
    } finally {
      database.close();
    }

    const readOnly = new DatabaseSync(stagingDatabase, { readOnly: true });
    let tableDigests: Record<string, string>;
    let layerIdentity: string;
    try {
      const meta = databaseMeta(readOnly);
      layerIdentity = meta.get('layer_fingerprint') ?? '';
      assertExactCandidateMeta(readOnly, expectedLayer.expectedMetaRows, 'candidate');
      if (expectedLayer.spellingTableDigests) {
        assertSpellingTablesMatchExpectation(readOnly, expectedLayer.spellingTableDigests, 'candidate');
      }
      tableDigests = logicalTableDigests(readOnly);
    } finally {
      readOnly.close();
    }
    const candidateDescriptor: CandidateArtifactDescriptor = {
      formatVersion: 1,
      kind: 'scripture-search-candidate',
      cacheKey: key,
      proposalDigest: request.proposalDigest,
      sourceSnapshotDigest: request.reviewedSources.digest,
      provenancePolicyFingerprint: policyFingerprint,
      base: {
        databaseSha256: descriptor.databaseSha256,
        schemaVersion: descriptor.schemaVersion,
        engineVersion: descriptor.engineVersion,
        tokenizerVersion: descriptor.tokenizerVersion,
        corpusFingerprint: descriptor.corpusFingerprint,
        layerFingerprint: descriptor.layerFingerprint,
        manifestFingerprint: descriptor.manifestFingerprint,
        provenancePolicyFingerprint: policyFingerprint,
      },
      schemaVersion: descriptor.schemaVersion,
      engineVersion: descriptor.engineVersion,
      tokenizerVersion: descriptor.tokenizerVersion,
      corpusFingerprint: descriptor.corpusFingerprint,
      layerFingerprint: layerIdentity,
      manifestFingerprint: descriptor.manifestFingerprint,
      databaseSha256: fileSha256(stagingDatabase),
      databaseBytes: statSync(stagingDatabase).size,
      logicalTableDigest: combinedTableDigest(tableDigests),
      tableDigests,
      counts,
    };
    if (candidateDescriptor.layerFingerprint !== expectedLayer.layerFingerprint
        || stableJson(candidateDescriptor.counts) !== stableJson(expectedLayer.counts)) {
      fail('CANDIDATE_INVALID', 'installed candidate identities or counts differ from the reviewed expectation.');
    }
    if (stableJson(Object.keys(tableDigests).sort()) !== stableJson(Object.keys(expectedLayer.baseTableDigests).sort())) {
      fail('CANDIDATE_INVALID', 'candidate table inventory differs from the verified base.');
    }
    for (const [table, digest] of Object.entries(expectedLayer.baseTableDigests)) {
      if (expectedLayer.spellingTableDigests && (DERIVED_SPELLING_TABLES as readonly string[]).includes(table)) continue;
      if (table !== 'meta' && !(OWNED_TABLES as readonly string[]).includes(table) && tableDigests[table] !== digest) {
        fail('CANDIDATE_INVALID', `candidate changed non-owned table ${table}.`);
      }
    }
    writeFileSync(stagingDescriptor, `${JSON.stringify(candidateDescriptor, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    validateCandidateDescriptor(JSON.parse(readFileSync(stagingDescriptor, 'utf8')) as unknown, {
      cacheKey: key,
      proposalDigest: request.proposalDigest,
      base: descriptor,
      sourceSnapshotDigest: request.reviewedSources.digest,
      provenancePolicyFingerprint: policyFingerprint,
    });
    const candidateDatabase = new DatabaseSync(stagingDatabase, { readOnly: true });
    try {
      validateDatabaseSchema(candidateDatabase, candidateDescriptor);
      assertExactCandidateMeta(candidateDatabase, expectedLayer.expectedMetaRows, 'candidate');
    } finally { candidateDatabase.close(); }
    await bindVerifiedEngine(stagingDatabase, candidateDescriptor);
    maybeFault(options.faultAt, 'before-publish');
    if (fileSha256(request.baseDatabasePath) !== baseHashBefore) fail('BASE_ARTIFACT_INVALID', 'base artifact changed during candidate construction.');
    rmSync(join(staging, 'operation.json'), { force: true });
    try {
      renameSync(staging, candidateDirectory);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if ((code === 'EEXIST' || code === 'EPERM' || code === 'ENOTEMPTY') && existsSync(candidateDirectory)) {
        const winner = await verifyCandidateDirectory(candidateDirectory, verificationExpectation);
        rmSync(staging, { recursive: true, force: true });
        if (fileSha256(request.baseDatabasePath) !== baseHashBefore) fail('BASE_ARTIFACT_INVALID', 'base artifact changed while verifying the publication winner.');
        return winner;
      }
      throw error;
    }
    return {
      status: 'BUILT', cacheKey: key, candidateDirectory,
      databasePath: join(candidateDirectory, CANDIDATE_DATABASE),
      descriptorPath: join(candidateDirectory, CANDIDATE_DESCRIPTOR),
      descriptor: candidateDescriptor,
    };
    } catch (error) {
      rmSync(staging, { recursive: true, force: true });
      if (existsSync(request.baseDatabasePath) && fileSha256(request.baseDatabasePath) !== baseHashBefore) {
        fail('BASE_ARTIFACT_INVALID', 'base artifact changed while handling a failed candidate build.');
      }
      throw error;
    }
  } finally {
    releaseCacheLock(lock);
  }
}

export async function buildCandidateFromRequestFile(requestPath: string): Promise<CandidateBuildResult> {
  const confinedRequestPath = requireRealConfinedPath(
    resolve(requestPath),
    REAL_STATE_ROOT,
    'candidate request path',
    true,
  );
  let value: unknown;
  try { value = JSON.parse(readFileSync(confinedRequestPath, 'utf8')) as unknown; } catch (error) {
    fail('INVALID_REQUEST', `cannot read request JSON: ${(error as Error).message}`);
  }
  return buildCandidate(value);
}

function cliArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value) fail('INVALID_REQUEST', `usage: build:candidate --request <request.json> (missing ${name}).`);
  return value;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  buildCandidateFromRequestFile(cliArgument('--request'))
    .then((result) => process.stdout.write(`${JSON.stringify(result)}\n`))
    .catch((error: unknown) => {
      const candidateError = error instanceof CandidateBuildError ? error : new CandidateBuildError('CANDIDATE_INVALID', (error as Error).message);
      process.stderr.write(`${JSON.stringify({ error: candidateError.code, message: candidateError.message })}\n`);
      process.exitCode = 1;
    });
}
