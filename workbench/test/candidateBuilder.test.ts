import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  CandidateBuilderError,
  ontologyValidationContext,
  parseCandidateCliResult,
  prepareCandidateBuildRequest,
  type CandidateCliDescriptor,
} from '../src/candidateBuilder.js';
import { proposalManifestDigest } from '../src/proposals.js';

const REPOSITORY_ROOT = resolve(import.meta.dirname, '..', '..');
const ONTOLOGY_PATH = 'ontology/concepts/hope-in-god.yaml';
const CASE_ID = '123e4567-e89b-42d3-a456-426614174000';
const temporary: string[] = [];

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`;
}

function makeOutput(prefix: string): string {
  const output = join(REPOSITORY_ROOT, 'workbench', '.state', `${prefix}-${randomUUID()}`);
  mkdirSync(output, { recursive: true });
  temporary.push(output);
  writeFileSync(join(output, 'base.db'), 'test-only-placeholder');
  writeFileSync(join(output, 'base.json'), '{}');
  return output;
}

function policyFingerprint(files: readonly { path: string; contents: string }[]): string {
  const policy = files.filter((file) => file.path.startsWith('pipeline/manifests/')).map((file) => {
    const source = JSON.parse(file.contents) as Record<string, unknown>;
    return {
      id: source.id,
      contentIdentity: source.contentSha256 ?? source.sha256 ?? '',
      rightsClass: source.rightsClass,
      maxTier: source.maxTier,
      licenseAssertionSha256: sha256(String(source.licenseRecord ?? '')),
      lineageOnly: source.lineageOnly === true,
      derivedFrom: [...((source.derivedFrom as string[] | undefined) ?? [])].sort(),
    };
  }).sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return sha256(stableJson(policy));
}

function proposal(sourceSha256: string): unknown {
  return {
    schemaVersion: 1,
    proposalId: 'candidate-adapter-test',
    fixtureId: 'hope-in-god',
    caseIds: [CASE_ID],
    sourcePreconditions: [{ path: ONTOLOGY_PATH, sha256: sourceSha256 }],
    operations: [{
      operationId: 'add-adapter-phrase',
      type: 'lexicon-phrase-add',
      sourcePaths: [ONTOLOGY_PATH],
      provenance: {
        source: 'editorial', confirmed: true, reviewer: 'adapter-test',
        evidence: 'Reviewed source evidence for the adapter request.',
      },
      reason: 'Exercises the supported candidate CLI request boundary.',
      conceptId: 'hope-in-god',
      phrase: 'adapter candidate phrase',
    }],
  };
}

function mergeProposal(): unknown {
  const targetPath = 'ontology/concepts/reviewed-merged-hope.yaml';
  return {
    schemaVersion: 1,
    proposalId: 'candidate-draft-merge-test',
    fixtureId: 'hope-in-god',
    caseIds: [CASE_ID],
    sourcePreconditions: [{ path: targetPath, sha256: sha256('') }],
    operations: [{
      operationId: 'merge-reviewed-drafts',
      type: 'concept-drafts-merge',
      sourcePaths: [targetPath],
      provenance: {
        source: 'editorial', confirmed: true, reviewer: 'adapter-test',
        evidence: 'Reviewed both persisted draft documents before merge.',
      },
      reason: 'Merges two independently reviewed concept drafts into one candidate concept.',
      draftConceptIds: ['patient-hope-draft', 'waiting-hope-draft'],
      reviewedConcept: {
        id: 'reviewed-merged-hope',
        label: 'Reviewed merged hope',
        lexicon: ['reviewed merged hope phrase'],
        anchors: [{ locator: 'Romans 8:25', sources: ['editorial'], weight: 1 }],
        related: ['hope-in-god'],
      },
    }],
  };
}

afterEach(() => {
  for (const directory of temporary.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('workbench candidate builder', () => {
  it('normalizes omitted reviewed ontology anchor weights to the production default', () => {
    const context = ontologyValidationContext([{
      path: 'ontology/concepts/omitted-weight.yaml', sha256: sha256('omitted-weight'),
      contents: 'id: omitted-weight\nlabel: Omitted weight\nlexicon: []\nanchors:\n  - ref: John 1:1\n    sources: [editorial]\n',
    }], []);
    expect(context.concepts[0]!.anchors).toEqual([{ locator: 'John 1:1', sources: ['editorial'], weight: 1 }]);
  });

  it('creates a deterministic complete source snapshot bound to the normalized proposal', async () => {
    const output = makeOutput('candidate-adapter');
    const source = readFileSync(join(REPOSITORY_ROOT, ...ONTOLOGY_PATH.split('/')), 'utf8');
    const options = {
      repositoryRoot: REPOSITORY_ROOT,
      baseDatabasePath: join(output, 'base.db'),
      baseDescriptorPath: join(output, 'base.json'),
      outputDirectory: join(output, 'candidates'),
      proposal: proposal(sha256(source)),
    };
    const first = await prepareCandidateBuildRequest(options);
    const second = await prepareCandidateBuildRequest(options);

    expect(first).toEqual(second);
    expect(first.proposalDigest).toBe(proposalManifestDigest(first.proposal));
    expect(first.reviewedSources.files.some((file) => file.path === ONTOLOGY_PATH)).toBe(true);
    expect(first.reviewedSources.files.filter((file) => file.path.startsWith('ontology/concepts/')).length).toBeGreaterThan(40);
    expect(first.reviewedSources.files.filter((file) => file.path.startsWith('pipeline/manifests/')).length).toBeGreaterThan(10);
    expect(first.reviewedSources.digest).toMatch(/^[0-9a-f]{64}$/);
  });

  it('fails before invoking the pipeline when a reviewed source precondition is stale', async () => {
    const output = makeOutput('candidate-adapter-stale');
    await expect(prepareCandidateBuildRequest({
      repositoryRoot: REPOSITORY_ROOT,
      baseDatabasePath: join(output, 'base.db'),
      baseDescriptorPath: join(output, 'base.json'),
      outputDirectory: join(output, 'candidates'),
      proposal: proposal('f'.repeat(64)),
    })).rejects.toBeInstanceOf(CandidateBuilderError);
  });

  it('validates proposals against the complete reviewed ontology before candidate creation', async () => {
    const output = makeOutput('candidate-adapter-collision');
    const targetPath = 'ontology/concepts/refuge-in-trouble.yaml';
    const targetSource = readFileSync(join(REPOSITORY_ROOT, ...targetPath.split('/')), 'utf8');
    const conflicting = proposal(sha256(targetSource)) as {
      sourcePreconditions: { path: string; sha256: string }[];
      operations: { sourcePaths: string[]; conceptId: string; phrase: string }[];
    };
    conflicting.sourcePreconditions[0]!.path = targetPath;
    conflicting.operations[0]!.sourcePaths = [targetPath];
    conflicting.operations[0]!.conceptId = 'refuge-in-trouble';
    conflicting.operations[0]!.phrase = 'HOPE-IN-GOD';

    await expect(prepareCandidateBuildRequest({
      repositoryRoot: REPOSITORY_ROOT,
      baseDatabasePath: join(output, 'base.db'),
      baseDescriptorPath: join(output, 'base.json'),
      outputDirectory: join(output, 'candidates'),
      proposal: conflicting,
      })).rejects.toThrow(/phrase already belongs/);
  });

  it('derives merge ids from hash-bound reviewed draft documents', async () => {
    const output = makeOutput('candidate-reviewed-drafts');
    const draftDirectory = join(REPOSITORY_ROOT, 'workbench', '.state', 'reviewed-drafts', randomUUID());
    mkdirSync(draftDirectory, { recursive: true });
    temporary.push(draftDirectory);
    const draftDocuments = [
      {
        id: 'patient-hope-draft', label: 'Patient hope draft', lexicon: ['patient draft phrase'],
        anchors: [{ locator: 'Romans 8:25', sources: ['editorial'], weight: 1 }], related: ['hope-in-god'],
      },
      {
        id: 'waiting-hope-draft', label: 'Waiting hope draft', lexicon: ['waiting draft phrase'],
        anchors: [{ locator: 'Romans 8:24', sources: ['editorial'], weight: 1 }], related: ['hope-in-god'],
      },
    ];
    const reviewedDraftSources = draftDocuments.map((draft) => {
      const absolute = join(draftDirectory, `${draft.id}.json`);
      const contents = `${JSON.stringify(draft)}\n`;
      writeFileSync(absolute, contents);
      return {
        path: absolute.slice(REPOSITORY_ROOT.length + 1).replaceAll('\\', '/'),
        sha256: sha256(contents),
      };
    });
    const options = {
      repositoryRoot: REPOSITORY_ROOT,
      baseDatabasePath: join(output, 'base.db'),
      baseDescriptorPath: join(output, 'base.json'),
      outputDirectory: join(output, 'candidates'),
      proposal: mergeProposal(),
    };

    await expect(prepareCandidateBuildRequest(options)).rejects.toThrow(/hash-bound reviewedDraftSources/);
    const request = await prepareCandidateBuildRequest({ ...options, reviewedDraftSources });
    expect(request.reviewedDraftSources).toEqual([...reviewedDraftSources].sort((a, b) => a.path.localeCompare(b.path)));
    expect(request.reviewedSources.files.filter((file) => reviewedDraftSources.some((source) => source.path === file.path)))
      .toHaveLength(2);

    await expect(prepareCandidateBuildRequest({
      ...options,
      reviewedDraftSources: [reviewedDraftSources[0]!, { ...reviewedDraftSources[1]!, sha256: 'f'.repeat(64) }],
    })).rejects.toThrow(/Source precondition failed/);
  });

  it('exact-parses the CLI response and independently validates all binding digests and paths', async () => {
    const output = makeOutput('candidate-cli-parse');
    const source = readFileSync(join(REPOSITORY_ROOT, ...ONTOLOGY_PATH.split('/')), 'utf8');
    const request = await prepareCandidateBuildRequest({
      repositoryRoot: REPOSITORY_ROOT,
      baseDatabasePath: join(output, 'base.db'),
      baseDescriptorPath: join(output, 'base.json'),
      outputDirectory: join(output, 'candidates'),
      proposal: proposal(sha256(source)),
    });
    mkdirSync(request.outputDirectory, { recursive: true });
    const policy = policyFingerprint(request.reviewedSources.files);
    const base = {
      databaseSha256: sha256('test-only-placeholder'),
      schemaVersion: '6',
      engineVersion: '0.9.0',
      tokenizerVersion: '1.0.0',
      corpusFingerprint: 'c'.repeat(64),
      layerFingerprint: 'd'.repeat(64),
      manifestFingerprint: 'e'.repeat(64),
      provenancePolicyFingerprint: policy,
    };
    writeFileSync(request.baseDescriptorPath, JSON.stringify(base));
    const cacheKey = sha256(stableJson({ ...base, proposalDigest: request.proposalDigest }));
    const candidateDirectory = join(request.outputDirectory, cacheKey);
    mkdirSync(candidateDirectory);
    const databasePath = join(candidateDirectory, 'content.db');
    const descriptorPath = join(candidateDirectory, 'candidate-artifact.json');
    const databaseBytes = 'verified candidate bytes';
    writeFileSync(databasePath, databaseBytes);
    const descriptor: CandidateCliDescriptor = {
      formatVersion: 1,
      kind: 'scripture-search-candidate',
      cacheKey,
      proposalDigest: request.proposalDigest,
      sourceSnapshotDigest: request.reviewedSources.digest,
      provenancePolicyFingerprint: policy,
      base,
      schemaVersion: base.schemaVersion,
      engineVersion: base.engineVersion,
      tokenizerVersion: base.tokenizerVersion,
      corpusFingerprint: base.corpusFingerprint,
      layerFingerprint: 'f'.repeat(64),
      manifestFingerprint: base.manifestFingerprint,
      databaseSha256: sha256(databaseBytes),
      databaseBytes: Buffer.byteLength(databaseBytes),
      logicalTableDigest: '1'.repeat(64),
      tableDigests: { meta: '2'.repeat(64) },
      counts: {
        concepts: 1, lexiconEntries: 2, editorialAnchors: 3, topicAnchors: 4,
        crossReferences: 5, verseTerms: 6, translationTokens: 7,
      },
    };
    writeFileSync(descriptorPath, `${JSON.stringify(descriptor)}\n`);
    const result = {
      status: 'BUILT', cacheKey, candidateDirectory, databasePath, descriptorPath, descriptor,
    };
    await expect(parseCandidateCliResult(result, request)).resolves.toMatchObject({ cacheKey, descriptor });

    await expect(parseCandidateCliResult({ ...result, surprise: true }, request))
      .rejects.toThrow(/exact supported schema/);
    await expect(parseCandidateCliResult({ ...result, cacheKey: '0'.repeat(64) }, request))
      .rejects.toThrow(/cache keys differ/);
    await expect(parseCandidateCliResult({ ...result, descriptor: { ...descriptor, proposalDigest: '0'.repeat(64) } }, request))
      .rejects.toThrow(/not bound/);
    await expect(parseCandidateCliResult({ ...result, descriptor: { ...descriptor, extra: true } }, request))
      .rejects.toThrow(/exact supported schema/);
    writeFileSync(databasePath, 'tampered candidate bytes');
    await expect(parseCandidateCliResult(result, request)).rejects.toThrow(/database bytes/);
  });

  it('rejects caller root confusion, external base/output paths, and junction escapes before writing', async () => {
    const output = makeOutput('candidate-path-guard');
    const source = readFileSync(join(REPOSITORY_ROOT, ...ONTOLOGY_PATH.split('/')), 'utf8');
    const baseOptions = {
      repositoryRoot: REPOSITORY_ROOT,
      baseDatabasePath: join(output, 'base.db'),
      baseDescriptorPath: join(output, 'base.json'),
      outputDirectory: join(output, 'candidates'),
      proposal: proposal(sha256(source)),
    };
    await expect(prepareCandidateBuildRequest({ ...baseOptions, repositoryRoot: output }))
      .rejects.toThrow(/configured workbench repository/);

    const external = mkdtempSync(join(tmpdir(), 'm7-workbench-escape-'));
    try {
      writeFileSync(join(external, 'base.db'), 'external');
      await expect(prepareCandidateBuildRequest({ ...baseOptions, baseDatabasePath: join(external, 'base.db') }))
        .rejects.toThrow(/outside/);
      await expect(prepareCandidateBuildRequest({ ...baseOptions, outputDirectory: join(external, 'candidate') }))
        .rejects.toThrow(/outside/);
      const junction = join(output, 'escape-junction');
      symlinkSync(external, junction, process.platform === 'win32' ? 'junction' : 'dir');
      await expect(prepareCandidateBuildRequest({ ...baseOptions, outputDirectory: join(junction, 'candidate') }))
        .rejects.toThrow(/escapes/);
    } finally {
      rmSync(external, { recursive: true, force: true });
    }
  });
});
