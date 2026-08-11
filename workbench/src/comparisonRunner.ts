import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';

import type { CandidateCliResult } from './candidateBuilder.js';
import {
  applyMutationPlanWithLockedValidation,
  createMutationPlan,
  type ApplyPhase,
} from './applyJournal.js';
import {
  assertComparisonReportIntegrity,
  compareEngines,
  type ComparisonReport,
  type ComparisonUniverseInput,
  type EngineIdentity,
} from './comparison.js';

const SHA256 = /^[a-f0-9]{64}$/;
const COMMIT_MARKER = 'comparison.json';

export type ComparisonPublicationPhase =
  | 'before-report-open'
  | 'before-report-write'
  | 'before-summary-json-open'
  | 'before-summary-json-write'
  | 'before-summary-markdown-open'
  | 'before-summary-markdown-write'
  | 'before-commit-data-open'
  | 'before-commit-data-write'
  | 'before-final-validation'
  | 'before-commit-link'
  | 'after-commit';

export interface ComparisonCandidateBinding {
  readonly cacheKey: string;
  readonly proposalDigest: string;
  readonly databaseSha256: string;
  readonly descriptorSha256: string;
  readonly referenceIdentity: EngineIdentity;
  readonly candidateIdentity: EngineIdentity;
  readonly comparisonDigest: string;
}

export interface ComparisonPublicationFiles {
  readonly machineJson: string;
  readonly summaryJson: string;
  readonly summaryMarkdown: string;
}

export interface PublishComparisonOptions {
  /** The candidate cache root; candidateDirectory must be its cache-key child. */
  readonly candidateRootDirectory: string;
  readonly candidate: CandidateCliResult;
  readonly descriptorPreconditionSha256: string;
  readonly report: ComparisonReport;
  /** Test-only crash injection. M4 recovery resolves the retained journal. */
  readonly crashAt?: 'after-machine-write' | 'before-publish';
  /** Deterministic filesystem fault/concurrency seam used by durability tests. */
  readonly onPhase?: (
    phase: ComparisonPublicationPhase,
    context: { readonly candidateDirectory: string; readonly targetPath?: string },
  ) => void | Promise<void>;
}

export interface ComparisonPublicationResult {
  readonly status: 'PUBLISHED' | 'ALREADY_PUBLISHED';
  readonly directory: string;
  readonly commitManifestPath: string;
  readonly machineReportPath: string;
  readonly summaryJsonPath: string;
  readonly summaryMarkdownPath: string;
  readonly binding: ComparisonCandidateBinding;
}

export interface RunCandidateComparisonOptions extends Omit<PublishComparisonOptions, 'report'> {
  readonly universe: ComparisonUniverseInput;
  readonly referenceEngine: ScriptureEngine;
  readonly candidateEngine: ScriptureEngine;
}

export interface RunCandidateComparisonResult extends ComparisonPublicationResult {
  readonly report: ComparisonReport;
}

export class ComparisonPublicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ComparisonPublicationError';
  }
}

export class InjectedComparisonPublicationCrash extends Error {
  constructor(readonly phase: 'after-machine-write' | 'before-publish') {
    super(`Injected comparison publication crash at ${phase}.`);
    this.name = 'InjectedComparisonPublicationCrash';
  }
}

interface FileIdentity {
  readonly dev: number;
  readonly ino: number;
  readonly birthtimeMs: number;
}

interface PublicationFileBinding {
  readonly name: string;
  readonly sha256: string;
}

interface ComparisonCommitManifest {
  readonly schemaVersion: 1;
  readonly kind: 'scripture-search-comparison-commit';
  readonly binding: ComparisonCandidateBinding;
  readonly commitDataName: string;
  readonly files: {
    readonly machine: PublicationFileBinding;
    readonly summaryJson: PublicationFileBinding;
    readonly summaryMarkdown: PublicationFileBinding;
  };
  readonly digest: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) throw new ComparisonPublicationError('Publication data contains an unsupported primitive.');
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (!isRecord(value)) throw new ComparisonPublicationError('Publication data must contain JSON values only.');
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

function sha256(bytes: string | Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

async function sha256File(file: string): Promise<string> {
  const hash = createHash('sha256');
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(file);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

function sameIdentity(left: EngineIdentity, right: EngineIdentity): boolean {
  return left.engineVersion === right.engineVersion
    && left.corpusFingerprint === right.corpusFingerprint
    && left.layerFingerprint === right.layerFingerprint;
}

function normalizedPath(value: string): string {
  const resolved = path.resolve(value);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function sameFileIdentity(left: FileIdentity, right: FileIdentity): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.birthtimeMs === right.birthtimeMs;
}

function statsIdentity(stats: { dev: number; ino: number; birthtimeMs: number }): FileIdentity {
  return { dev: stats.dev, ino: stats.ino, birthtimeMs: stats.birthtimeMs };
}

function requireDigest(value: string, label: string): string {
  if (!SHA256.test(value)) throw new ComparisonPublicationError(`${label} must be a lowercase SHA-256 digest.`);
  return value;
}

function maybeCrash(configured: PublishComparisonOptions['crashAt'], phase: InjectedComparisonPublicationCrash['phase']): void {
  if (configured === phase) throw new InjectedComparisonPublicationCrash(phase);
}

async function requireRealDirectory(directory: string, label: string): Promise<string> {
  const stats = await lstat(directory).catch(() => null);
  if (stats === null || !stats.isDirectory() || stats.isSymbolicLink()) throw new ComparisonPublicationError(`${label} must be a real directory.`);
  return realpath(directory);
}

async function requireExactRegularFile(file: string, expected: string, label: string): Promise<void> {
  if (normalizedPath(file) !== normalizedPath(expected)) throw new ComparisonPublicationError(`${label} is outside the content-addressed candidate layout.`);
  const stats = await lstat(file).catch(() => null);
  if (stats === null || !stats.isFile() || stats.isSymbolicLink()) throw new ComparisonPublicationError(`${label} must be a real regular file.`);
  if (normalizedPath(await realpath(file)) !== normalizedPath(expected)) throw new ComparisonPublicationError(`${label} resolves outside the candidate directory.`);
}

async function directoryIdentity(root: string, directory: string, label: string): Promise<FileIdentity> {
  const stats = await lstat(directory).catch(() => null);
  if (stats === null || stats.isSymbolicLink() || !stats.isDirectory()) throw new ComparisonPublicationError(`${label} must remain a real directory.`);
  const resolved = await realpath(directory);
  const relative = path.relative(root, resolved);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new ComparisonPublicationError(`${label} resolves outside the candidate directory.`);
  }
  return statsIdentity(stats);
}

async function assertDirectoryIdentity(root: string, directory: string, expected: FileIdentity, label: string): Promise<void> {
  const current = await directoryIdentity(root, directory, label);
  if (!sameFileIdentity(current, expected)) throw new ComparisonPublicationError(`${label} identity changed during publication.`);
}

async function readImmutableFile(candidateDirectory: string, rootIdentity: FileIdentity, file: string): Promise<string> {
  await assertDirectoryIdentity(candidateDirectory, candidateDirectory, rootIdentity, 'Candidate directory');
  const stats = await lstat(file);
  if (stats.isSymbolicLink() || !stats.isFile()) throw new ComparisonPublicationError(`${path.basename(file)} must be an immutable regular file.`);
  const identity = statsIdentity(stats);
  const contents = await readFile(file, 'utf8');
  await assertDirectoryIdentity(candidateDirectory, candidateDirectory, rootIdentity, 'Candidate directory');
  const finalStats = await lstat(file);
  if (finalStats.isSymbolicLink() || !finalStats.isFile() || !sameFileIdentity(identity, statsIdentity(finalStats))) {
    throw new ComparisonPublicationError(`${path.basename(file)} identity changed while reading.`);
  }
  return contents;
}

export function renderComparisonPublication(binding: ComparisonCandidateBinding, report: ComparisonReport): ComparisonPublicationFiles {
  assertComparisonReportIntegrity(report);
  if (binding.comparisonDigest !== report.digest) throw new ComparisonPublicationError('Publication binding and comparison report digests differ.');
  if (!sameIdentity(binding.referenceIdentity, report.referenceIdentity)
      || !sameIdentity(binding.candidateIdentity, report.candidateIdentity)) {
    throw new ComparisonPublicationError('Publication binding and report engine identities differ.');
  }
  const machine = { schemaVersion: 1, kind: 'scripture-search-comparison', binding, report } as const;
  const summary = {
    schemaVersion: 1,
    kind: 'scripture-search-comparison-summary',
    binding,
    summary: report.summary,
    referenceExpectationFailureQueryIds: report.referenceExpectationFailureQueryIds,
    candidateExpectationFailureQueryIds: report.candidateExpectationFailureQueryIds,
    regressionSessionQueryIds: report.regressionSessionQueryIds,
  } as const;
  const markdown = [
    '# Candidate comparison',
    '',
    `Candidate: \`${binding.cacheKey}\``,
    `Comparison digest: \`${binding.comparisonDigest}\``,
    `Candidate expectation failures: ${report.summary.candidateExpectationFailureQueryCount}`,
    `Changed top-10 queries: ${report.summary.changedTop10QueryCount}`,
    `Regressed queries: ${report.summary.verdictCounts.regressed}`,
    `Outside linked cases requiring review: ${report.summary.regressionSessionQueryCount}`,
    '',
    report.summary.text,
    '',
  ].join('\n');
  return {
    machineJson: `${canonicalJson(machine)}\n`,
    summaryJson: `${canonicalJson(summary)}\n`,
    summaryMarkdown: markdown,
  };
}

async function validateCandidate(options: PublishComparisonOptions): Promise<{ directory: string; binding: ComparisonCandidateBinding }> {
  assertComparisonReportIntegrity(options.report);
  requireDigest(options.descriptorPreconditionSha256, 'descriptorPreconditionSha256');
  const root = await requireRealDirectory(path.resolve(options.candidateRootDirectory), 'candidateRootDirectory');
  const cacheKey = requireDigest(options.candidate.cacheKey, 'candidate.cacheKey');
  if (options.candidate.descriptor.cacheKey !== cacheKey) throw new ComparisonPublicationError('Candidate result and descriptor cache keys differ.');
  const expectedDirectory = path.join(root, cacheKey);
  if (normalizedPath(options.candidate.candidateDirectory) !== normalizedPath(expectedDirectory)) {
    throw new ComparisonPublicationError('candidateDirectory is not the cache-key child of candidateRootDirectory.');
  }
  const directory = await requireRealDirectory(expectedDirectory, 'candidateDirectory');
  if (normalizedPath(directory) !== normalizedPath(expectedDirectory)) throw new ComparisonPublicationError('candidateDirectory resolves outside candidateRootDirectory.');
  const descriptorPath = path.join(directory, 'candidate-artifact.json');
  const databasePath = path.join(directory, 'content.db');
  await requireExactRegularFile(options.candidate.descriptorPath, descriptorPath, 'candidate.descriptorPath');
  await requireExactRegularFile(options.candidate.databasePath, databasePath, 'candidate.databasePath');
  const descriptorBytes = await readFile(descriptorPath);
  const descriptorSha256 = sha256(descriptorBytes);
  if (descriptorSha256 !== options.descriptorPreconditionSha256) throw new ComparisonPublicationError('Candidate descriptor precondition is stale.');
  let diskDescriptor: unknown;
  try { diskDescriptor = JSON.parse(descriptorBytes.toString('utf8')) as unknown; }
  catch { throw new ComparisonPublicationError('Candidate descriptor is not valid JSON.'); }
  if (canonicalJson(diskDescriptor) !== canonicalJson(options.candidate.descriptor)) throw new ComparisonPublicationError('Candidate descriptor bytes differ from the verified build result.');
  const databaseSha256 = await sha256File(databasePath);
  if (databaseSha256 !== options.candidate.descriptor.databaseSha256) throw new ComparisonPublicationError('Candidate database no longer matches its descriptor.');
  const referenceIdentity = {
    engineVersion: options.candidate.descriptor.base.engineVersion,
    corpusFingerprint: options.candidate.descriptor.base.corpusFingerprint,
    layerFingerprint: options.candidate.descriptor.base.layerFingerprint,
  };
  const candidateIdentity = {
    engineVersion: options.candidate.descriptor.engineVersion,
    corpusFingerprint: options.candidate.descriptor.corpusFingerprint,
    layerFingerprint: options.candidate.descriptor.layerFingerprint,
  };
  if (!sameIdentity(referenceIdentity, options.report.referenceIdentity)) throw new ComparisonPublicationError('Comparison reference identity does not match the candidate base identity.');
  if (!sameIdentity(candidateIdentity, options.report.candidateIdentity)) throw new ComparisonPublicationError('Comparison candidate identity does not match the built candidate identity.');
  return {
    directory,
    binding: {
      cacheKey,
      proposalDigest: requireDigest(options.candidate.descriptor.proposalDigest, 'candidate.proposalDigest'),
      databaseSha256: requireDigest(databaseSha256, 'candidate.databaseSha256'),
      descriptorSha256,
      referenceIdentity,
      candidateIdentity,
      comparisonDigest: options.report.digest,
    },
  };
}

function publicationNames(_comparisonDigest: string): {
  readonly machine: string;
  readonly summaryJson: string;
  readonly summaryMarkdown: string;
  readonly commitData: string;
} {
  return {
    machine: '.comparison-report.json',
    summaryJson: '.comparison-summary.json',
    summaryMarkdown: '.comparison-summary.md',
    commitData: '.comparison-commit.json',
  };
}

function acceptMachineReport(contents: string, binding: ComparisonCandidateBinding): void {
  let machine: unknown;
  try { machine = JSON.parse(contents) as unknown; }
  catch { throw new ComparisonPublicationError('Existing immutable machine report is invalid JSON.'); }
  if (!isRecord(machine)
      || machine.schemaVersion !== 1
      || machine.kind !== 'scripture-search-comparison'
      || canonicalJson(machine.binding) !== canonicalJson(binding)
      || !isRecord(machine.report)
      || `${canonicalJson(machine)}\n` !== contents) {
    throw new ComparisonPublicationError('Existing immutable machine report binding or canonical bytes differ.');
  }
  const storedReport = machine.report as unknown as ComparisonReport;
  try { assertComparisonReportIntegrity(storedReport); }
  catch { throw new ComparisonPublicationError('Existing immutable machine report has an invalid logical digest.'); }
  if (storedReport.digest !== binding.comparisonDigest) {
    throw new ComparisonPublicationError('Existing immutable machine report logical digest differs.');
  }
}

function createCommitManifest(
  binding: ComparisonCandidateBinding,
  names: ReturnType<typeof publicationNames>,
  files: {
    readonly machine: { readonly sha256: string };
    readonly summaryJson: { readonly sha256: string };
    readonly summaryMarkdown: { readonly sha256: string };
  },
): { readonly manifest: ComparisonCommitManifest; readonly text: string } {
  const content = {
    schemaVersion: 1 as const,
    kind: 'scripture-search-comparison-commit' as const,
    binding,
    commitDataName: names.commitData,
    files: {
      machine: { name: names.machine, sha256: files.machine.sha256 },
      summaryJson: { name: names.summaryJson, sha256: files.summaryJson.sha256 },
      summaryMarkdown: { name: names.summaryMarkdown, sha256: files.summaryMarkdown.sha256 },
    },
  };
  const manifest = { ...content, digest: sha256(canonicalJson(content)) };
  return { manifest, text: `${canonicalJson(manifest)}\n` };
}

function parseCommitManifest(text: string, binding: ComparisonCandidateBinding): ComparisonCommitManifest {
  let value: unknown;
  try { value = JSON.parse(text) as unknown; }
  catch { throw new ComparisonPublicationError('Comparison commit manifest is invalid JSON.'); }
  if (!isRecord(value)
      || value.schemaVersion !== 1
      || value.kind !== 'scripture-search-comparison-commit'
      || typeof value.digest !== 'string'
      || !isRecord(value.files)
      || !isRecord(value.files.machine)
      || !isRecord(value.files.summaryJson)
      || !isRecord(value.files.summaryMarkdown)
      || typeof value.commitDataName !== 'string'
      || canonicalJson(value.binding) !== canonicalJson(binding)
      || `${canonicalJson(value)}\n` !== text) {
    throw new ComparisonPublicationError('Comparison commit manifest shape, binding, or canonical bytes differ.');
  }
  const { digest: storedDigest, ...content } = value;
  if (!SHA256.test(storedDigest) || sha256(canonicalJson(content)) !== storedDigest) {
    throw new ComparisonPublicationError('Comparison commit manifest digest is invalid.');
  }
  return value as unknown as ComparisonCommitManifest;
}

async function verifyCommittedPublication(
  candidateDirectory: string,
  rootIdentity: FileIdentity,
  binding: ComparisonCandidateBinding,
  expectedFiles: ComparisonPublicationFiles,
): Promise<ComparisonPublicationResult> {
  const markerPath = path.join(candidateDirectory, COMMIT_MARKER);
  const markerText = await readImmutableFile(candidateDirectory, rootIdentity, markerPath);
  const manifest = parseCommitManifest(markerText, binding);
  const names = publicationNames(binding.comparisonDigest);
  if (manifest.commitDataName !== names.commitData
      || manifest.files.machine.name !== names.machine
      || manifest.files.summaryJson.name !== names.summaryJson
      || manifest.files.summaryMarkdown.name !== names.summaryMarkdown) {
    throw new ComparisonPublicationError('Comparison commit manifest references unexpected data filenames.');
  }
  const commitDataPath = path.join(candidateDirectory, names.commitData);
  const commitDataText = await readImmutableFile(candidateDirectory, rootIdentity, commitDataPath);
  if (commitDataText !== markerText) throw new ComparisonPublicationError('Commit marker and immutable commit data differ.');
  const machinePath = path.join(candidateDirectory, names.machine);
  const summaryJsonPath = path.join(candidateDirectory, names.summaryJson);
  const summaryMarkdownPath = path.join(candidateDirectory, names.summaryMarkdown);
  const machine = await readImmutableFile(candidateDirectory, rootIdentity, machinePath);
  const summaryJson = await readImmutableFile(candidateDirectory, rootIdentity, summaryJsonPath);
  const summaryMarkdown = await readImmutableFile(candidateDirectory, rootIdentity, summaryMarkdownPath);
  if (sha256(machine) !== manifest.files.machine.sha256
      || sha256(summaryJson) !== manifest.files.summaryJson.sha256
      || sha256(summaryMarkdown) !== manifest.files.summaryMarkdown.sha256) {
    throw new ComparisonPublicationError('Committed comparison data bytes do not match the manifest.');
  }
  acceptMachineReport(machine, binding);
  if (summaryJson !== expectedFiles.summaryJson || summaryMarkdown !== expectedFiles.summaryMarkdown) {
    throw new ComparisonPublicationError('Committed comparison summary bytes differ; refusing overwrite.');
  }
  return {
    status: 'ALREADY_PUBLISHED',
    directory: candidateDirectory,
    commitManifestPath: markerPath,
    machineReportPath: machinePath,
    summaryJsonPath,
    summaryMarkdownPath,
    binding,
  };
}

/** Atomically publishes one complete comparison inside its verified candidate. */
export async function publishCandidateComparison(options: PublishComparisonOptions): Promise<ComparisonPublicationResult> {
  // The outer validation only locates the candidate-root transaction namespace.
  // Authoritative candidate and publication validation happens under M4's lock.
  const initial = await validateCandidate(options);
  const directory = initial.directory;
  const binding = initial.binding;
  const files = renderComparisonPublication(binding, options.report);
  const names = publicationNames(binding.comparisonDigest);
  const commit = createCommitManifest(binding, names, {
    machine: { sha256: sha256(files.machineJson) },
    summaryJson: { sha256: sha256(files.summaryJson) },
    summaryMarkdown: { sha256: sha256(files.summaryMarkdown) },
  });
  const plan = await createMutationPlan(directory, [
    { path: names.machine, beforeSha256: null, after: files.machineJson },
    { path: names.summaryJson, beforeSha256: null, after: files.summaryJson },
    { path: names.summaryMarkdown, beforeSha256: null, after: files.summaryMarkdown },
    { path: names.commitData, beforeSha256: null, after: commit.text },
    { path: COMMIT_MARKER, beforeSha256: null, after: commit.text },
  ]);
  const commitMarkerPath = path.join(directory, COMMIT_MARKER);
  const commitDataPath = path.join(directory, names.commitData);
  let skippedPublication: ComparisonPublicationResult | undefined;
  let committedPublication: ComparisonPublicationResult | undefined;

  const onApplyPhase = async (phase: ApplyPhase): Promise<void> => {
    if (phase === 'staged') maybeCrash(options.crashAt, 'after-machine-write');
    if (phase === 'backed-up') {
      await options.onPhase?.('before-commit-link', { candidateDirectory: directory, targetPath: commitDataPath });
      maybeCrash(options.crashAt, 'before-publish');
    }
  };

  const transaction = await applyMutationPlanWithLockedValidation(directory, plan, {
    waitTimeoutMs: 10_000,
    async beforeApply() {
      const locked = await validateCandidate(options);
      if (canonicalJson(locked.binding) !== canonicalJson(binding)) {
        throw new ComparisonPublicationError('Candidate binding changed before locked publication validation.');
      }
      const rootIdentity = await directoryIdentity(directory, directory, 'Candidate directory');
      const marker = await lstat(commitMarkerPath).catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return null;
        throw error;
      });
      if (marker !== null) {
        skippedPublication = await verifyCommittedPublication(directory, rootIdentity, binding, files);
        return 'skip';
      }
      await options.onPhase?.('before-report-open', { candidateDirectory: directory, targetPath: path.join(directory, names.machine) });
      await options.onPhase?.('before-final-validation', { candidateDirectory: directory });
      const finalValidation = await validateCandidate(options);
      if (canonicalJson(finalValidation.binding) !== canonicalJson(binding)) {
        throw new ComparisonPublicationError('Candidate binding changed immediately before journal application.');
      }
      await assertDirectoryIdentity(directory, directory, rootIdentity, 'Candidate directory');
      return 'apply';
    },
    async afterCommit() {
      await options.onPhase?.('after-commit', { candidateDirectory: directory, targetPath: commitMarkerPath });
      const postValidation = await validateCandidate(options);
      if (canonicalJson(postValidation.binding) !== canonicalJson(binding)) {
        throw new ComparisonPublicationError('Candidate binding changed after comparison commit.');
      }
      const rootIdentity = await directoryIdentity(directory, directory, 'Candidate directory');
      const verified = await verifyCommittedPublication(directory, rootIdentity, binding, files);
      committedPublication = { ...verified, status: 'PUBLISHED' };
    },
  }, { onPhase: onApplyPhase });

  if (transaction.status === 'SKIPPED') {
    if (skippedPublication === undefined) throw new ComparisonPublicationError('Journal transaction skipped without a verified existing publication.');
    return skippedPublication;
  }
  if (committedPublication === undefined) throw new ComparisonPublicationError('Journal transaction committed without post-commit verification.');
  return committedPublication;
}

/** Supported post-build orchestration: compare first, then durably publish. */
export async function runAndPublishCandidateComparison(options: RunCandidateComparisonOptions): Promise<RunCandidateComparisonResult> {
  const report = await compareEngines(options.universe, options.referenceEngine, options.candidateEngine);
  const publication = await publishCandidateComparison({
    candidateRootDirectory: options.candidateRootDirectory,
    candidate: options.candidate,
    descriptorPreconditionSha256: options.descriptorPreconditionSha256,
    report,
    crashAt: options.crashAt,
    onPhase: options.onPhase,
  });
  return { ...publication, report };
}
