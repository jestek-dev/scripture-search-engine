/**
 * Workbench adapter for the pipeline's supported candidate-build boundary.
 *
 * This module prepares a complete, hash-bound reviewed source snapshot and
 * invokes `build:candidate`. It does not import candidate build internals.
 */

import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, existsSync, lstatSync, realpathSync, statSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from 'yaml';

import {
  normalizeProposalManifest,
  parseProposalManifest,
  proposalManifestDigest,
  type ProposalManifest,
  type ProposalValidationContext,
  type RowOwner,
} from './proposals.js';
import { repoRoot as configuredRepoRoot } from './descriptor.js';

const EMPTY_SHA256 = createHash('sha256').update('').digest('hex');

export interface CandidateRequestSourceFile {
  readonly path: string;
  readonly sha256: string;
  readonly contents: string;
}

export interface CandidateBuildRequest {
  readonly formatVersion: 1;
  readonly repositoryRoot: string;
  readonly baseDatabasePath: string;
  readonly baseDescriptorPath: string;
  readonly outputDirectory: string;
  readonly proposalDigest: string;
  readonly proposal: ProposalManifest;
  readonly reviewedDraftSources: readonly ReviewedDraftSource[];
  readonly reviewedSources: {
    readonly formatVersion: 1;
    readonly digest: string;
    readonly files: readonly CandidateRequestSourceFile[];
  };
}

export interface PrepareCandidateRequestOptions {
  readonly repositoryRoot: string;
  readonly baseDatabasePath: string;
  readonly baseDescriptorPath: string;
  readonly outputDirectory: string;
  readonly proposal: unknown;
  readonly reviewedDraftSources?: readonly ReviewedDraftSource[];
}

export interface ReviewedDraftSource {
  readonly path: string;
  readonly sha256: string;
}

export interface CandidateCliResult {
  readonly status: 'BUILT' | 'CACHE_HIT';
  readonly cacheKey: string;
  readonly candidateDirectory: string;
  readonly databasePath: string;
  readonly descriptorPath: string;
  readonly descriptor: CandidateCliDescriptor;
}

export interface CandidateCliDescriptor {
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

export class CandidateBuilderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CandidateBuilderError';
  }
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`;
}

function exactObject(value: unknown, fields: readonly string[], label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new CandidateBuilderError(`${label} must be an object.`);
  }
  const record = value as Record<string, unknown>;
  const actual = Object.keys(record).sort();
  const expected = [...fields].sort();
  if (stableJson(actual) !== stableJson(expected)) {
    throw new CandidateBuilderError(`${label} fields are not the exact supported schema.`);
  }
  return record;
}

function digest(value: unknown, label: string): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{64}$/.test(value)) {
    throw new CandidateBuilderError(`${label} must be a lowercase SHA-256 digest.`);
  }
  return value;
}

function normalizedAbsolute(value: string): string {
  const resolved = path.resolve(value);
  return process.platform === 'win32' ? resolved.toLocaleLowerCase('en-US') : resolved;
}

function isWithin(parent: string, child: string): boolean {
  const relative = path.relative(normalizedAbsolute(parent), normalizedAbsolute(child));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function projectedRealPath(target: string): string {
  const suffix: string[] = [];
  let cursor = path.resolve(target);
  while (!existsSync(cursor)) {
    const parent = path.dirname(cursor);
    if (parent === cursor) throw new CandidateBuilderError(`No existing ancestor for ${target}.`);
    suffix.unshift(path.basename(cursor));
    cursor = parent;
  }
  return path.resolve(realpathSync(cursor), ...suffix);
}

function confinedPath(target: string, root: string, label: string, mustExist: boolean): string {
  const lexical = path.resolve(target);
  const realRoot = projectedRealPath(root);
  if (!isWithin(path.resolve(root), lexical)) throw new CandidateBuilderError(`${label} is outside ${root}.`);
  if (mustExist && !existsSync(lexical)) throw new CandidateBuilderError(`${label} does not exist.`);
  const projected = projectedRealPath(lexical);
  if (!isWithin(realRoot, projected)) throw new CandidateBuilderError(`${label} escapes through a link or junction.`);
  if (existsSync(lexical) && (lstatSync(lexical).isSymbolicLink()
      || normalizedAbsolute(realpathSync(lexical)) !== normalizedAbsolute(projected))) {
    throw new CandidateBuilderError(`${label} resolves through a link or junction.`);
  }
  return projected;
}

function validateRepositoryRoot(value: string): string {
  const configured = realpathSync(configuredRepoRoot);
  let declared: string;
  try { declared = realpathSync(value); } catch { throw new CandidateBuilderError('repositoryRoot must exist.'); }
  if (normalizedAbsolute(configured) !== normalizedAbsolute(declared)) {
    throw new CandidateBuilderError('repositoryRoot does not match the configured workbench repository.');
  }
  return configured;
}

function validateBuildPaths(options: PrepareCandidateRequestOptions): string {
  const repositoryRoot = validateRepositoryRoot(options.repositoryRoot);
  const stateRoot = path.join(repositoryRoot, 'workbench', '.state');
  confinedPath(options.outputDirectory, stateRoot, 'outputDirectory', false);
  const productionDatabase = path.join(repositoryRoot, 'workbench', '.artifact', 'content.db');
  const productionDescriptor = path.join(repositoryRoot, 'artifacts', 'content-artifact.json');
  const validateBase = (target: string, production: string, label: string): void => {
    if (normalizedAbsolute(target) === normalizedAbsolute(production)) confinedPath(target, path.dirname(production), label, true);
    else confinedPath(target, stateRoot, label, true);
  };
  validateBase(options.baseDatabasePath, productionDatabase, 'baseDatabasePath');
  validateBase(options.baseDescriptorPath, productionDescriptor, 'baseDescriptorPath');
  return repositoryRoot;
}

function sha256File(file: string): Promise<string> {
  return new Promise((resolveDigest, reject) => {
    const hash = createHash('sha256');
    createReadStream(file)
      .on('data', (chunk) => hash.update(chunk))
      .on('error', reject)
      .on('end', () => resolveDigest(hash.digest('hex')));
  });
}

function snapshotDigest(files: readonly CandidateRequestSourceFile[]): string {
  const hash = createHash('sha256');
  for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
    const record = `${file.path}\n${file.sha256}\n${file.contents.length}\n${file.contents}`;
    hash.update(String(Buffer.byteLength(record)));
    hash.update(':');
    hash.update(record);
  }
  return hash.digest('hex');
}

function parseReviewedDraftReferences(value: unknown): readonly ReviewedDraftSource[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new CandidateBuilderError('reviewedDraftSources must be an array.');
  const sources = value.map((entry, index) => {
    const source = exactObject(entry, ['path', 'sha256'], `reviewedDraftSources[${index}]`);
    if (typeof source.path !== 'string' || source.path.trim() !== source.path || source.path.includes('\\')
        || path.isAbsolute(source.path) || source.path.split('/').includes('..') || source.path.length === 0) {
      throw new CandidateBuilderError(`reviewedDraftSources[${index}].path must be a canonical repository-relative path.`);
    }
    if (!source.path.startsWith('workbench/.state/reviewed-drafts/') || !source.path.endsWith('.json')) {
      throw new CandidateBuilderError(`reviewedDraftSources[${index}].path must be under workbench/.state/reviewed-drafts and end in .json.`);
    }
    return { path: source.path, sha256: digest(source.sha256, `reviewedDraftSources[${index}].sha256`) };
  }).sort((a, b) => a.path.localeCompare(b.path));
  if (new Set(sources.map((source) => source.path)).size !== sources.length) {
    throw new CandidateBuilderError('reviewedDraftSources paths must be unique.');
  }
  return sources;
}

function reviewedDraftId(file: CandidateRequestSourceFile): string {
  let parsed: unknown;
  try { parsed = JSON.parse(file.contents) as unknown; }
  catch { throw new CandidateBuilderError(`Reviewed draft ${file.path} is invalid JSON.`); }
  const draft = exactObject(parsed, ['id', 'label', 'lexicon', 'anchors', 'related'], `reviewed draft ${file.path}`);
  if (typeof draft.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.id)) {
    throw new CandidateBuilderError(`Reviewed draft ${file.path} has an invalid id.`);
  }
  if (typeof draft.label !== 'string' || !Array.isArray(draft.lexicon) || !Array.isArray(draft.anchors) || !Array.isArray(draft.related)) {
    throw new CandidateBuilderError(`Reviewed draft ${file.path} does not contain a complete concept draft.`);
  }
  return draft.id;
}

function provenancePolicyFingerprint(files: readonly CandidateRequestSourceFile[]): string {
  const policy = files
    .filter((file) => file.path.startsWith('pipeline/manifests/') && file.path.endsWith('.json'))
    .map((file) => {
      let source: Record<string, unknown>;
      try { source = JSON.parse(file.contents) as Record<string, unknown>; }
      catch { throw new CandidateBuilderError(`${file.path} is invalid JSON.`); }
      return {
        id: source.id,
        contentIdentity: source.contentSha256 ?? source.sha256 ?? '',
        rightsClass: source.rightsClass,
        maxTier: source.maxTier,
        licenseAssertionSha256: sha256(String(source.licenseRecord ?? '')),
        lineageOnly: source.lineageOnly === true,
        derivedFrom: [...((source.derivedFrom as string[] | undefined) ?? [])].sort(),
      };
    })
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return sha256(stableJson(policy));
}

async function directoryFiles(
  repositoryRoot: string,
  relativeDirectory: string,
  extension: string,
): Promise<CandidateRequestSourceFile[]> {
  const directory = path.join(repositoryRoot, ...relativeDirectory.split('/'));
  const names = (await readdir(directory)).filter((name) => name.endsWith(extension)).sort();
  return Promise.all(names.map(async (name) => {
    const filePath = path.join(directory, name);
    confinedPath(filePath, directory, `${relativeDirectory}/${name}`, true);
    const contents = await readFile(filePath, 'utf8');
    return { path: `${relativeDirectory}/${name}`, sha256: sha256(contents), contents };
  }));
}

async function preconditionFile(
  repositoryRoot: string,
  sourcePath: string,
  expectedSha256: string,
): Promise<CandidateRequestSourceFile> {
  const absolute = path.join(repositoryRoot, ...sourcePath.split('/'));
  confinedPath(absolute, repositoryRoot, sourcePath, false);
  let contents: string;
  try {
    contents = await readFile(absolute, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT' || expectedSha256 !== EMPTY_SHA256) throw error;
    contents = '';
  }
  const actual = sha256(contents);
  if (actual !== expectedSha256) {
    throw new CandidateBuilderError(
      `Source precondition failed for ${sourcePath}: expected ${expectedSha256}, found ${actual}.`,
    );
  }
  return { path: sourcePath, sha256: actual, contents };
}

export function ontologyValidationContext(
  files: readonly CandidateRequestSourceFile[],
  draftConceptIds: readonly string[],
): ProposalValidationContext {
  const ownerValues = new Set<RowOwner>(['editorial', 'openbible', 'torrey', 'translation-variant', 'cross-reference', 'exposition']);
  const concepts = files.map((file) => {
    const document = parseDocument(file.contents, { prettyErrors: true, uniqueKeys: true });
    if (document.errors.length > 0 || document.warnings.length > 0) {
      throw new CandidateBuilderError(`Reviewed ontology ${file.path} is invalid YAML: ${[...document.errors, ...document.warnings].map((entry) => entry.message).join('; ')}`);
    }
    const value = document.toJS({ maxAliasCount: 0 }) as unknown;
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new CandidateBuilderError(`Reviewed ontology ${file.path} must contain a concept object.`);
    }
    const record = value as Record<string, unknown>;
    if (typeof record.id !== 'string' || record.id.length === 0) throw new CandidateBuilderError(`Reviewed ontology ${file.path} has no concept id.`);
    const textArray = (input: unknown, label: string): string[] => {
      if (input === undefined) return [];
      if (!Array.isArray(input) || input.some((entry) => typeof entry !== 'string')) {
        throw new CandidateBuilderError(`Reviewed ontology ${file.path} ${label} must be a text array.`);
      }
      return input as string[];
    };
    const phrases = textArray(record.lexicon, 'lexicon');
    const related = textArray(record.related, 'related');
    const anchors = record.anchors === undefined ? [] : (() => {
      if (!Array.isArray(record.anchors)) throw new CandidateBuilderError(`Reviewed ontology ${file.path} anchors must be an array.`);
      return record.anchors.map((entry, index) => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
          throw new CandidateBuilderError(`Reviewed ontology ${file.path} anchors[${index}] must be an object.`);
        }
        const anchor = entry as Record<string, unknown>;
        const sources = textArray(anchor.sources, `anchors[${index}].sources`);
        if (typeof anchor.ref !== 'string' || sources.some((source) => !ownerValues.has(source as RowOwner))) {
          throw new CandidateBuilderError(`Reviewed ontology ${file.path} anchors[${index}] has invalid ref or sources.`);
        }
        if (anchor.weight !== undefined && (typeof anchor.weight !== 'number' || !Number.isFinite(anchor.weight))) {
          throw new CandidateBuilderError(`Reviewed ontology ${file.path} anchors[${index}].weight must be finite.`);
        }
        return { locator: anchor.ref, sources: sources as RowOwner[], weight: anchor.weight ?? 1 };
      });
    })();
    return {
      id: record.id,
      phrases,
      phraseOwners: Object.fromEntries(phrases.map((phrase) => [phrase, 'editorial' as const])),
      anchors,
      related,
    };
  });
  return { concepts, draftConceptIds };
}

/** Creates the exact JSON request consumed by the public pipeline CLI. */
export async function prepareCandidateBuildRequest(
  options: PrepareCandidateRequestOptions,
): Promise<CandidateBuildRequest> {
  const repositoryRoot = validateBuildPaths(options);
  const structuralProposal = normalizeProposalManifest(parseProposalManifest(options.proposal));
  const reviewedDraftSources = parseReviewedDraftReferences(options.reviewedDraftSources);
  const hasDraftMerge = structuralProposal.operations.some((operation) => operation.type === 'concept-drafts-merge');
  if (hasDraftMerge && reviewedDraftSources.length === 0) {
    throw new CandidateBuilderError('concept-drafts-merge requires hash-bound reviewedDraftSources; merge-declared ids are not accepted as their own proof.');
  }
  const [ontologyFiles, manifestFiles, preconditionFiles, reviewedDraftFiles] = await Promise.all([
    directoryFiles(repositoryRoot, 'ontology/concepts', '.yaml'),
    directoryFiles(repositoryRoot, 'pipeline/manifests', '.json'),
    Promise.all(structuralProposal.sourcePreconditions.map((entry) =>
      preconditionFile(repositoryRoot, entry.path, entry.sha256))),
    Promise.all(reviewedDraftSources.map((entry) =>
      preconditionFile(repositoryRoot, entry.path, entry.sha256))),
  ]);
  const draftConceptIds = reviewedDraftFiles.map(reviewedDraftId);
  if (new Set(draftConceptIds).size !== draftConceptIds.length) {
    throw new CandidateBuilderError('Reviewed draft source ids must be unique.');
  }
  const proposal = normalizeProposalManifest(parseProposalManifest(
    options.proposal,
    ontologyValidationContext(ontologyFiles, draftConceptIds),
  ));
  const proposalDigest = proposalManifestDigest(proposal);
  const filesByPath = new Map<string, CandidateRequestSourceFile>();
  for (const file of [...ontologyFiles, ...manifestFiles, ...preconditionFiles, ...reviewedDraftFiles]) {
    const current = filesByPath.get(file.path);
    if (current && (current.sha256 !== file.sha256 || current.contents !== file.contents)) {
      throw new CandidateBuilderError(`Snapshot path ${file.path} resolved to conflicting bytes.`);
    }
    filesByPath.set(file.path, file);
  }
  const files = [...filesByPath.values()].sort((a, b) => a.path.localeCompare(b.path));
  return {
    formatVersion: 1,
    repositoryRoot,
    baseDatabasePath: path.resolve(options.baseDatabasePath),
    baseDescriptorPath: path.resolve(options.baseDescriptorPath),
    outputDirectory: path.resolve(options.outputDirectory),
    proposalDigest,
    proposal,
    reviewedDraftSources,
    reviewedSources: { formatVersion: 1, digest: snapshotDigest(files), files },
  };
}

function parseCandidateDescriptor(value: unknown, request: CandidateBuildRequest): CandidateCliDescriptor {
  const record = exactObject(value, [
    'formatVersion', 'kind', 'cacheKey', 'proposalDigest', 'sourceSnapshotDigest',
    'provenancePolicyFingerprint', 'base', 'schemaVersion', 'engineVersion', 'tokenizerVersion',
    'corpusFingerprint', 'layerFingerprint', 'manifestFingerprint', 'databaseSha256',
    'databaseBytes', 'logicalTableDigest', 'tableDigests', 'counts',
  ], 'candidate descriptor');
  if (record.formatVersion !== 1 || record.kind !== 'scripture-search-candidate') {
    throw new CandidateBuilderError('Candidate descriptor header is invalid.');
  }
  const base = exactObject(record.base, [
    'databaseSha256', 'schemaVersion', 'engineVersion', 'tokenizerVersion',
    'corpusFingerprint', 'layerFingerprint', 'manifestFingerprint', 'provenancePolicyFingerprint',
  ], 'candidate descriptor base');
  const tableDigests = record.tableDigests;
  if (typeof tableDigests !== 'object' || tableDigests === null || Array.isArray(tableDigests)) {
    throw new CandidateBuilderError('Candidate tableDigests must be an object.');
  }
  for (const [table, valueDigest] of Object.entries(tableDigests)) digest(valueDigest, `tableDigests.${table}`);
  const counts = exactObject(record.counts, [
    'concepts', 'lexiconEntries', 'editorialAnchors', 'topicAnchors',
    'crossReferences', 'verseTerms', 'translationTokens',
  ], 'candidate descriptor counts');
  for (const [name, count] of Object.entries(counts)) {
    if (!Number.isSafeInteger(count) || (count as number) < 0) throw new CandidateBuilderError(`counts.${name} is invalid.`);
  }
  for (const [label, valueDigest] of [
    ['cacheKey', record.cacheKey],
    ['proposalDigest', record.proposalDigest],
    ['sourceSnapshotDigest', record.sourceSnapshotDigest],
    ['provenancePolicyFingerprint', record.provenancePolicyFingerprint],
    ['corpusFingerprint', record.corpusFingerprint],
    ['layerFingerprint', record.layerFingerprint],
    ['manifestFingerprint', record.manifestFingerprint],
    ['databaseSha256', record.databaseSha256],
    ['logicalTableDigest', record.logicalTableDigest],
    ['base.databaseSha256', base.databaseSha256],
    ['base.corpusFingerprint', base.corpusFingerprint],
    ['base.layerFingerprint', base.layerFingerprint],
    ['base.manifestFingerprint', base.manifestFingerprint],
    ['base.provenancePolicyFingerprint', base.provenancePolicyFingerprint],
  ] as const) digest(valueDigest, label);
  for (const field of ['schemaVersion', 'engineVersion', 'tokenizerVersion'] as const) {
    if (typeof record[field] !== 'string' || record[field] === '' || record[field] !== base[field]) {
      throw new CandidateBuilderError(`Candidate ${field} is invalid or differs from its base identity.`);
    }
  }
  // §5.5 gap 4 (D12b, narrowly scoped like §5.3's exemption): a data
  // proposal may move ONLY the layerFingerprint — except that a
  // `fixture-corpus-chapter-add` proposal moves the corpus fingerprint by
  // definition (PR #64). The permission is derived from the proposal's own
  // operations, never a caller flag, requires the subset file hash-pinned as
  // a verified sourcePrecondition, and leaves every other identity dimension
  // (schema/engine/tokenizer/manifest) base-equal as before.
  const chapterAdd = request.proposal.operations.some((operation) => operation.type === 'fixture-corpus-chapter-add');
  const subsetPinned = request.proposal.sourcePreconditions.some((entry) => entry.path === 'pipeline/fixtures/web-subset.json');
  if (record.corpusFingerprint !== base.corpusFingerprint && !(chapterAdd && subsetPinned)) {
    throw new CandidateBuilderError(chapterAdd
      ? 'Candidate corpus identity moved on a chapter-add proposal whose subset file is not hash-pinned as a sourcePrecondition.'
      : 'Candidate corpus or manifest identity differs from its base identity.');
  }
  if (record.manifestFingerprint !== base.manifestFingerprint) {
    throw new CandidateBuilderError('Candidate corpus or manifest identity differs from its base identity.');
  }
  if (!Number.isSafeInteger(record.databaseBytes) || (record.databaseBytes as number) <= 0) {
    throw new CandidateBuilderError('Candidate databaseBytes is invalid.');
  }
  if (record.proposalDigest !== request.proposalDigest
      || record.sourceSnapshotDigest !== request.reviewedSources.digest) {
    throw new CandidateBuilderError('Candidate descriptor is not bound to the submitted proposal/source snapshot.');
  }
  const expectedCacheKey = sha256(stableJson({
    databaseSha256: base.databaseSha256,
    schemaVersion: base.schemaVersion,
    engineVersion: base.engineVersion,
    tokenizerVersion: base.tokenizerVersion,
    corpusFingerprint: base.corpusFingerprint,
    layerFingerprint: base.layerFingerprint,
    manifestFingerprint: base.manifestFingerprint,
    provenancePolicyFingerprint: base.provenancePolicyFingerprint,
    proposalDigest: request.proposalDigest,
  }));
  if (record.cacheKey !== expectedCacheKey || record.provenancePolicyFingerprint !== base.provenancePolicyFingerprint) {
    throw new CandidateBuilderError('Candidate cache key or policy fingerprint is invalid.');
  }
  return record as unknown as CandidateCliDescriptor;
}

/** Exact-parses and independently verifies the machine response from the pipeline CLI. */
export async function parseCandidateCliResult(
  value: unknown,
  request: CandidateBuildRequest,
): Promise<CandidateCliResult> {
  validateBuildPaths({
    repositoryRoot: request.repositoryRoot,
    baseDatabasePath: request.baseDatabasePath,
    baseDescriptorPath: request.baseDescriptorPath,
    outputDirectory: request.outputDirectory,
    proposal: request.proposal,
  });
  const record = exactObject(value, [
    'status', 'cacheKey', 'candidateDirectory', 'databasePath', 'descriptorPath', 'descriptor',
  ], 'candidate CLI result');
  if (record.status !== 'BUILT' && record.status !== 'CACHE_HIT') {
    throw new CandidateBuilderError('Candidate CLI status is unsupported.');
  }
  const cacheKey = digest(record.cacheKey, 'result.cacheKey');
  const descriptor = parseCandidateDescriptor(record.descriptor, request);
  if (cacheKey !== descriptor.cacheKey) throw new CandidateBuilderError('Result and descriptor cache keys differ.');
  let baseDescriptorValue: unknown;
  try { baseDescriptorValue = JSON.parse(await readFile(request.baseDescriptorPath, 'utf8')) as unknown; }
  catch { throw new CandidateBuilderError('Base descriptor is invalid JSON.'); }
  if (typeof baseDescriptorValue !== 'object' || baseDescriptorValue === null || Array.isArray(baseDescriptorValue)) {
    throw new CandidateBuilderError('Base descriptor must be an object.');
  }
  const baseDescriptor = baseDescriptorValue as Record<string, unknown>;
  for (const field of ['schemaVersion', 'engineVersion', 'tokenizerVersion'] as const) {
    if (typeof baseDescriptor[field] !== 'string' || baseDescriptor[field] === '') {
      throw new CandidateBuilderError(`Base descriptor ${field} is invalid.`);
    }
  }
  const expectedBase = {
    databaseSha256: digest(baseDescriptor.databaseSha256, 'base.databaseSha256'),
    schemaVersion: baseDescriptor.schemaVersion,
    engineVersion: baseDescriptor.engineVersion,
    tokenizerVersion: baseDescriptor.tokenizerVersion,
    corpusFingerprint: digest(baseDescriptor.corpusFingerprint, 'base.corpusFingerprint'),
    layerFingerprint: digest(baseDescriptor.layerFingerprint, 'base.layerFingerprint'),
    manifestFingerprint: digest(baseDescriptor.manifestFingerprint, 'base.manifestFingerprint'),
    provenancePolicyFingerprint: provenancePolicyFingerprint(request.reviewedSources.files),
  };
  if (stableJson(descriptor.base) !== stableJson(expectedBase)
      || await sha256File(request.baseDatabasePath) !== expectedBase.databaseSha256) {
    throw new CandidateBuilderError('Candidate base identities do not match the verified request inputs.');
  }
  if (typeof record.candidateDirectory !== 'string' || typeof record.databasePath !== 'string'
      || typeof record.descriptorPath !== 'string') {
    throw new CandidateBuilderError('Candidate CLI paths must be text.');
  }
  const candidateDirectory = confinedPath(record.candidateDirectory, request.outputDirectory, 'candidateDirectory', true);
  const databasePath = confinedPath(record.databasePath, candidateDirectory, 'databasePath', true);
  const descriptorPath = confinedPath(record.descriptorPath, candidateDirectory, 'descriptorPath', true);
  if (normalizedAbsolute(candidateDirectory) !== normalizedAbsolute(path.join(request.outputDirectory, cacheKey))
      || normalizedAbsolute(databasePath) !== normalizedAbsolute(path.join(candidateDirectory, 'content.db'))
      || normalizedAbsolute(descriptorPath) !== normalizedAbsolute(path.join(candidateDirectory, 'candidate-artifact.json'))) {
    throw new CandidateBuilderError('Candidate CLI paths do not match the content-addressed layout.');
  }
  if (statSync(databasePath).size !== descriptor.databaseBytes
      || await sha256File(databasePath) !== descriptor.databaseSha256) {
    throw new CandidateBuilderError('Candidate database bytes do not match the CLI descriptor.');
  }
  let diskDescriptorValue: unknown;
  try { diskDescriptorValue = JSON.parse(await readFile(descriptorPath, 'utf8')) as unknown; }
  catch { throw new CandidateBuilderError('Candidate descriptor file is invalid JSON.'); }
  const diskDescriptor = parseCandidateDescriptor(diskDescriptorValue, request);
  if (stableJson(diskDescriptor) !== stableJson(descriptor)) {
    throw new CandidateBuilderError('CLI descriptor differs from the descriptor published on disk.');
  }
  return {
    status: record.status,
    cacheKey,
    candidateDirectory,
    databasePath,
    descriptorPath,
    descriptor,
  };
}

function runProcess(command: string, args: readonly string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new CandidateBuilderError(`Candidate CLI exited ${code ?? 'without a code'}: ${stderr.trim() || stdout.trim()}`));
    });
  });
}

/** Invokes only the supported `npm run build:candidate` pipeline command. */
export async function runCandidateBuild(
  options: PrepareCandidateRequestOptions,
): Promise<CandidateCliResult> {
  const request = await prepareCandidateBuildRequest(options);
  const requestDirectory = path.join(request.outputDirectory, `.request-${randomUUID()}`);
  const requestPath = path.join(requestDirectory, 'candidate-request.json');
  await mkdir(request.outputDirectory, { recursive: true });
  await mkdir(requestDirectory, { recursive: false });
  try {
    await writeFile(requestPath, `${JSON.stringify(request)}\n`, { encoding: 'utf8', flag: 'wx' });
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const result = await runProcess(
      npm,
      ['run', 'build:candidate', '--workspace', 'pipeline', '--', '--request', requestPath],
      request.repositoryRoot,
    );
    const lines = result.stdout.trim().split(/\r?\n/).filter((entry) => entry.trim().startsWith('{'));
    if (lines.length !== 1) throw new CandidateBuilderError('Candidate CLI must return exactly one machine-readable result.');
    let parsed: unknown;
    try { parsed = JSON.parse(lines[0]!) as unknown; }
    catch { throw new CandidateBuilderError('Candidate CLI result is invalid JSON.'); }
    return await parseCandidateCliResult(parsed, request);
  } finally {
    await rm(requestDirectory, { recursive: true, force: true });
  }
}
