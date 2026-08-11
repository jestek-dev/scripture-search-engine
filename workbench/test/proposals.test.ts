import { describe, expect, it } from 'vitest';

import {
  PROPOSAL_OPERATION_TYPES,
  ProposalValidationError,
  normalizeProposalManifest,
  parseProposalManifest,
  proposalManifestDigest,
  type ProposalManifest,
  type ProposalValidationContext,
} from '../src/proposals.js';

const CASE_A = '00000000-0000-4000-8000-000000000001';
const CASE_B = '00000000-0000-4000-8000-000000000002';
const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);
const HASH_C = 'c'.repeat(64);
const ONTOLOGY_PATH = 'ontology/concepts/hope-in-god.yaml';
const PATIENT_PATH = 'ontology/concepts/patient-hope.yaml';
const WAITING_PATH = 'ontology/concepts/waiting-in-hope.yaml';
const FIXTURE_PATH = 'eval/golden/hope-in-god.json';
const CORPUS_PATH = 'pipeline/fixtures/web-subset.json';

const provenance = {
  source: 'editorial',
  confirmed: true,
  reviewer: 'Jesse',
  evidence: 'The cited passage directly names the reviewed theme.',
} as const;

const common = (operationId: string, sourcePaths: readonly string[] = [ONTOLOGY_PATH]) => ({
  operationId,
  sourcePaths,
  provenance,
  reason: 'The reviewed text and captured result evidence support this constrained change.',
});

function exhaustiveManifest(): unknown {
  return {
    schemaVersion: 1,
    proposalId: 'hope-review-proposal',
    fixtureId: 'hope-in-god',
    caseIds: [CASE_B, CASE_A],
    sourcePreconditions: [
      { path: CORPUS_PATH, sha256: HASH_C },
      { path: ONTOLOGY_PATH, sha256: HASH_A },
      { path: FIXTURE_PATH, sha256: HASH_B },
      { path: PATIENT_PATH, sha256: HASH_B },
      { path: WAITING_PATH, sha256: HASH_C },
    ],
    operations: [
      { ...common('op-related-remove'), type: 'related-concept-remove', conceptId: 'hope-in-god', relatedConceptId: 'second-coming' },
      { ...common('op-lexicon-add'), type: 'lexicon-phrase-add', conceptId: 'hope-in-god', phrase: 'steadfast hope' },
      { ...common('op-anchor-add'), type: 'editorial-anchor-add', conceptId: 'hope-in-god', anchor: { locator: 'Romans 8:24-25', sources: ['editorial'], weight: 0.8 } },
      { ...common('op-anchor-adjust'), type: 'editorial-anchor-adjust', conceptId: 'hope-in-god', current: { locator: 'Hebrews 6:19', sources: ['editorial'], weight: 0.95 }, next: { locator: 'Hebrews 6:18-19', weight: 0.9 } },
      { ...common('op-anchor-remove'), type: 'editorial-anchor-remove', conceptId: 'hope-in-god', locator: 'Jeremiah 29:11', currentSources: ['editorial'] },
      { ...common('op-related-add'), type: 'related-concept-add', conceptId: 'hope-in-god', relatedConceptId: 'refuge-in-trouble' },
      { ...common('op-lexicon-remove'), type: 'lexicon-phrase-remove', conceptId: 'hope-in-god', phrase: 'a future and a hope', currentOwner: 'editorial' },
      {
        ...common('op-draft-create', [PATIENT_PATH]),
        type: 'concept-draft-create',
        draft: {
          id: 'patient-hope', label: 'Patient hope', lexicon: ['waiting with hope'],
          anchors: [{ locator: 'Romans 8:25', sources: ['editorial'], weight: 1 }], related: ['hope-in-god'],
        },
      },
      {
        ...common('op-drafts-merge', [WAITING_PATH]),
        type: 'concept-drafts-merge',
        draftConceptIds: ['waiting-hope-draft', 'patient-hope-draft'],
        reviewedConcept: {
          id: 'waiting-in-hope', label: 'Waiting in hope', lexicon: ['wait for it with patience'],
          anchors: [{ locator: 'Romans 8:25', sources: ['editorial'], weight: 1 }], related: ['hope-in-god'],
        },
      },
      {
        ...common('op-golden-upsert', [FIXTURE_PATH]), type: 'golden-fixture-upsert', goldenFixtureId: 'hope-in-god',
        fixture: { id: 'hope-in-god', query: 'hope', status: 'pending', expectedTop: [{ reference: 'Romans 8:24-25' }] },
      },
      { ...common('op-corpus-chapter', [CORPUS_PATH]), type: 'fixture-corpus-chapter-add', book: 'Romans', chapter: 8, why: 'Required by the linked golden fixture expectation.' },
    ],
  };
}

const context: ProposalValidationContext = {
  concepts: [
    {
      id: 'hope-in-god',
      phrases: ['hope in god', 'a future and a hope'],
      phraseOwners: { 'hope in god': 'editorial', 'a future and a hope': 'editorial' },
      anchors: [
        { locator: 'Jeremiah 29:11', sources: ['editorial'], weight: 1 },
        { locator: 'Hebrews 6:19', sources: ['editorial'], weight: 0.95 },
        { locator: 'Romans 15:13', sources: ['torrey'], weight: 0.8 },
      ],
      related: ['second-coming'],
    },
    { id: 'refuge-in-trouble', phrases: ['refuge in trouble'], anchors: [], related: [] },
    { id: 'second-coming', phrases: ['second coming'], anchors: [], related: [] },
  ],
  draftConceptIds: ['patient-hope-draft', 'waiting-hope-draft'],
};

describe('proposal manifest', () => {
  it('strictly parses every planned operation type and canonicalizes deterministic arrays', () => {
    const parsed = parseProposalManifest(exhaustiveManifest());
    expect(parsed.operations.map((operation) => operation.type).sort()).toEqual([...PROPOSAL_OPERATION_TYPES].sort());
    expect(parsed.caseIds).toEqual([CASE_A, CASE_B]);
    expect(parsed.sourcePreconditions.map((entry) => entry.path)).toEqual([FIXTURE_PATH, ONTOLOGY_PATH, CORPUS_PATH, PATIENT_PATH, WAITING_PATH].sort());
    expect(parsed.operations.map((entry) => entry.operationId)).toEqual([...parsed.operations.map((entry) => entry.operationId)].sort());
  });

  it('produces the same normalized manifest and digest for equivalent input orderings', () => {
    const first = parseProposalManifest(exhaustiveManifest());
    const reversedInput = exhaustiveManifest() as { caseIds: unknown[]; sourcePreconditions: unknown[]; operations: unknown[] };
    reversedInput.caseIds.reverse();
    reversedInput.sourcePreconditions.reverse();
    reversedInput.operations.reverse();
    const second = parseProposalManifest(reversedInput);
    expect(normalizeProposalManifest(second)).toEqual(first);
    expect(proposalManifestDigest(second)).toBe(proposalManifestDigest(first));
  });

  it.each([
    ['fixture id', (value: Record<string, unknown>) => { delete value.fixtureId; }],
    ['linked case', (value: Record<string, unknown>) => { value.caseIds = []; }],
    ['source hash', (value: Record<string, unknown>) => { value.sourcePreconditions = []; }],
    ['confirmed provenance', (value: Record<string, unknown>) => {
      const operation = (value.operations as Record<string, unknown>[])[0]!;
      operation.provenance = { ...operation.provenance as object, confirmed: false };
    }],
    ['text-grounded reason', (value: Record<string, unknown>) => {
      const operation = (value.operations as Record<string, unknown>[])[0]!;
      operation.reason = 'too short';
    }],
  ])('rejects a proposal without its required %s', (_label, mutate) => {
    const input = exhaustiveManifest() as Record<string, unknown>;
    mutate(input);
    expect(() => parseProposalManifest(input)).toThrow(ProposalValidationError);
  });

  it('rejects unknown manifest and operation fields', () => {
    const input = exhaustiveManifest() as Record<string, unknown>;
    input.surprise = true;
    ((input.operations as Record<string, unknown>[])[0]!).scoreBoost = 100;
    expect(() => parseProposalManifest(input)).toThrow(/not an allowed field/);
  });

  it('uses the authoritative fixture schema for fixture upserts', () => {
    const input = exhaustiveManifest() as { operations: Record<string, unknown>[] };
    const upsert = input.operations.find((entry) => entry.type === 'golden-fixture-upsert')!;
    upsert.fixture = { id: 'hope-in-god', status: 'pending', query: 'hope', unexpected: true };
    expect(() => parseProposalManifest(input)).toThrow(/fixture has unknown field/);
  });

  it.each(['openbible', 'torrey', 'translation-variant', 'cross-reference', 'exposition'])
    ('refuses editorial removal of %s-owned rows', (owner) => {
      const input = exhaustiveManifest() as { operations: Record<string, unknown>[] };
      const removal = input.operations.find((entry) => entry.type === 'lexicon-phrase-remove')!;
      removal.currentOwner = owner;
      expect(() => parseProposalManifest(input)).toThrow(/must be changed at their owning importer or source snapshot/);
    });

  it('refuses editorial removal of an anchor with mixed editorial and importer ownership', () => {
    const input = exhaustiveManifest() as { operations: Record<string, unknown>[] };
    const removal = input.operations.find((entry) => entry.type === 'editorial-anchor-remove')!;
    removal.currentSources = ['editorial', 'torrey'];
    expect(() => parseProposalManifest(input)).toThrow(/sole current source is editorial/);
  });

  it('requires an operation source path to have an exact precondition hash', () => {
    const input = exhaustiveManifest() as { operations: Record<string, unknown>[] };
    input.operations[0]!.sourcePaths = ['ontology/concepts/unhashed.yaml'];
    expect(() => parseProposalManifest(input)).toThrow(/no matching sourcePreconditions hash/);
  });

  it.each(['.git/config', './ontology/concepts/hope-in-god.yaml', 'ontology//concepts/hope-in-god.yaml', 'ontology/concepts/hope-in-god.yaml/'])
    ('rejects noncanonical or non-owned source path %s', (sourcePath) => {
      const input = exhaustiveManifest() as { sourcePreconditions: Record<string, unknown>[]; operations: Record<string, unknown>[] };
      input.sourcePreconditions[0]!.path = sourcePath;
      for (const operation of input.operations) {
        if (Array.isArray(operation.sourcePaths) && operation.sourcePaths.includes(ONTOLOGY_PATH)) {
          operation.sourcePaths = (operation.sourcePaths as string[]).map((entry) => entry === ONTOLOGY_PATH ? sourcePath : entry);
        }
      }
      expect(() => parseProposalManifest(input)).toThrow(ProposalValidationError);
    });
});

describe('proposal collision review', () => {
  function oneOperation(operation: Record<string, unknown>): unknown {
    return {
      schemaVersion: 1, proposalId: 'collision-review', fixtureId: 'hope-in-god', caseIds: [CASE_A],
      sourcePreconditions: [{ path: ONTOLOGY_PATH, sha256: HASH_A }], operations: [operation],
    };
  }

  it.each([
    ['concept-id-collision', { ...common('op-id'), type: 'concept-draft-create', draft: { id: 'hope-in-god', label: 'Duplicate', lexicon: ['new phrase'], anchors: [{ locator: 'Romans 8:25', sources: ['editorial'], weight: 1 }], related: [] } }],
    ['phrase-collision', { ...common('op-phrase'), type: 'lexicon-phrase-add', conceptId: 'hope-in-god', phrase: 'HOPE   IN GOD' }],
    ['anchor-collision', { ...common('op-anchor'), type: 'editorial-anchor-add', conceptId: 'hope-in-god', anchor: { locator: 'Jeremiah 29:11', sources: ['editorial'], weight: 0.5 } }],
    ['edge-collision', { ...common('op-edge'), type: 'related-concept-add', conceptId: 'hope-in-god', relatedConceptId: 'second-coming' }],
  ])('rejects %s', (code, operation) => {
    try {
      parseProposalManifest(oneOperation(operation), context);
      throw new Error('expected validation failure');
    } catch (error) {
      expect(error).toBeInstanceOf(ProposalValidationError);
      expect((error as ProposalValidationError).issues.some((entry) => entry.code === code)).toBe(true);
    }
  });

  it('accepts a collision-free editorial operation against the source snapshot', () => {
    const parsed = parseProposalManifest(oneOperation({
      ...common('op-new-anchor'), type: 'editorial-anchor-add', conceptId: 'hope-in-god',
      anchor: { locator: 'Romans 8:24-25', sources: ['editorial'], weight: 0.8 },
    }), context);
    expect(parsed.operations).toHaveLength(1);
  });

  it('uses canonical verse ranges for snapshot, pending, and draft anchor collisions', () => {
    const johnContext: ProposalValidationContext = {
      concepts: [{ id: 'hope-in-god', phrases: [], anchors: [{ locator: 'John 1:1', sources: ['editorial'] }], related: [] }],
    };
    const aliasAdd = oneOperation({
      ...common('op-john-alias'), type: 'editorial-anchor-add', conceptId: 'hope-in-god',
      anchor: { locator: 'john 01:001', sources: ['editorial'], weight: 1 },
    });
    expect(() => parseProposalManifest(aliasAdd, johnContext)).toThrow(/anchor already exists/);

    const duplicateAdds = {
      schemaVersion: 1, proposalId: 'anchor-alias-operations', fixtureId: 'hope-in-god', caseIds: [CASE_A],
      sourcePreconditions: [{ path: ONTOLOGY_PATH, sha256: HASH_A }],
      operations: [
        { ...common('op-john-normal'), type: 'editorial-anchor-add', conceptId: 'hope-in-god', anchor: { locator: 'John 1:1', sources: ['editorial'], weight: 1 } },
        { ...common('op-john-padded'), type: 'editorial-anchor-add', conceptId: 'hope-in-god', anchor: { locator: 'john 01:001', sources: ['editorial'], weight: 0.9 } },
      ],
    };
    expect(() => parseProposalManifest(duplicateAdds)).toThrow(/anchor already exists/);

    const draftPath = 'ontology/concepts/new-concept.yaml';
    const duplicateDraftAnchors = {
      schemaVersion: 1, proposalId: 'anchor-alias-draft', fixtureId: 'hope-in-god', caseIds: [CASE_A],
      sourcePreconditions: [{ path: draftPath, sha256: HASH_A }],
      operations: [{
        ...common('op-anchor-alias-draft', [draftPath]), type: 'concept-draft-create',
        draft: {
          id: 'new-concept', label: 'New concept', lexicon: ['new phrase'], related: [],
          anchors: [
            { locator: 'John 1:1', sources: ['editorial'], weight: 1 },
            { locator: 'john 01:001', sources: ['editorial'], weight: 0.9 },
          ],
        },
      }],
    };
    expect(() => parseProposalManifest(duplicateDraftAnchors)).toThrow(/duplicated/);
  });

  it.each(['add-first', 'adjust-first'] as const)('rejects add/adjust alias collisions in %s order', (order) => {
    const add = { ...common('op-add-john'), type: 'editorial-anchor-add', conceptId: 'hope-in-god', anchor: { locator: 'John 1:1', sources: ['editorial'], weight: 1 } };
    const adjust = {
      ...common('op-adjust-john'), type: 'editorial-anchor-adjust', conceptId: 'hope-in-god',
      current: { locator: 'john 01:001', sources: ['editorial'], weight: 0.8 }, next: { locator: 'Jn 1:1', weight: 0.9 },
    };
    const manifest = {
      schemaVersion: 1, proposalId: `add-adjust-${order}`, fixtureId: 'hope-in-god', caseIds: [CASE_A],
      sourcePreconditions: [{ path: ONTOLOGY_PATH, sha256: HASH_A }],
      operations: order === 'add-first' ? [add, adjust] : [adjust, add],
    };
    expect(() => parseProposalManifest(manifest)).toThrow(/anchor/);
  });

  it.each(['draft-first', 'add-first'] as const)('makes draft anchors participate in global intent identity in %s order', (order) => {
    const draftPath = 'ontology/concepts/new-concept.yaml';
    const draft = {
      ...common('op-new-concept', [draftPath]), type: 'concept-draft-create',
      draft: { id: 'new-concept', label: 'New concept', lexicon: ['new phrase'], related: [], anchors: [{ locator: 'John 1:1', sources: ['editorial'], weight: 1 }] },
    };
    const add = { ...common('op-add-draft-anchor', [draftPath]), type: 'editorial-anchor-add', conceptId: 'new-concept', anchor: { locator: 'john 01:001', sources: ['editorial'], weight: 0.9 } };
    const manifest = {
      schemaVersion: 1, proposalId: `draft-anchor-${order}`, fixtureId: 'hope-in-god', caseIds: [CASE_A],
      sourcePreconditions: [{ path: draftPath, sha256: HASH_A }],
      operations: order === 'draft-first' ? [draft, add] : [add, draft],
    };
    expect(() => parseProposalManifest(manifest)).toThrow(/anchor/);
  });

  it('rejects anchors outside canonical versification', () => {
    const impossible = oneOperation({
      ...common('op-impossible-anchor'), type: 'editorial-anchor-add', conceptId: 'hope-in-god',
      anchor: { locator: 'John 999:999', sources: ['editorial'], weight: 1 },
    });
    expect(() => parseProposalManifest(impossible)).toThrow(/canonical KJV versification/);
  });

  it('uses source-snapshot ownership instead of a proposal claim and rejects dangling draft edges', () => {
    const spoofed = oneOperation({
      ...common('op-spoof'), type: 'editorial-anchor-remove', conceptId: 'hope-in-god',
      locator: 'Romans 15:13', currentSources: ['editorial'],
    });
    expect(() => parseProposalManifest(spoofed, context)).toThrow(/reviewed anchor is source-derived|does not match/);

    const dangling = oneOperation({
      ...common('op-dangling'), type: 'concept-draft-create',
      draft: { id: 'new-concept', label: 'New concept', lexicon: ['new phrase'], anchors: [], related: ['does-not-exist'] },
    });
    expect(() => parseProposalManifest(dangling, context)).toThrow(/does not exist/);
  });

  it('rejects stale anchor weights before structured YAML application', () => {
    const staleWeight = oneOperation({
      ...common('op-stale-anchor-weight'), type: 'editorial-anchor-adjust', conceptId: 'hope-in-god',
      current: { locator: 'Hebrews 6:19', sources: ['editorial'], weight: 0.5 },
      next: { locator: 'Hebrews 6:19', weight: 0.8 },
    });
    expect(() => parseProposalManifest(staleWeight, context)).toThrow(/weight does not match/);
  });

  it('requires the exact directed related row for removal', () => {
    const sourcePath = 'ontology/concepts/second-coming.yaml';
    const manifest = {
      schemaVersion: 1, proposalId: 'directed-edge-removal', fixtureId: 'hope-in-god', caseIds: [CASE_A],
      sourcePreconditions: [{ path: sourcePath, sha256: HASH_A }],
      operations: [{
        ...common('op-reverse-edge-remove', [sourcePath]), type: 'related-concept-remove',
        conceptId: 'second-coming', relatedConceptId: 'hope-in-god',
      }],
    };
    expect(() => parseProposalManifest(manifest, context)).toThrow(/does not exist/);
  });

  it('treats related-concept edges as directed across existing and pending operations', () => {
    const secondComingPath = 'ontology/concepts/second-coming.yaml';
    const refugePath = 'ontology/concepts/refuge-in-trouble.yaml';
    const reverseOfExisting = {
      schemaVersion: 1, proposalId: 'reverse-existing-edge', fixtureId: 'hope-in-god', caseIds: [CASE_A],
      sourcePreconditions: [{ path: secondComingPath, sha256: HASH_A }],
      operations: [{
        ...common('op-add-reverse-existing', [secondComingPath]), type: 'related-concept-add',
        conceptId: 'second-coming', relatedConceptId: 'hope-in-god',
      }],
    };
    expect(parseProposalManifest(reverseOfExisting, context).operations).toHaveLength(1);

    const bothDirections = {
      schemaVersion: 1, proposalId: 'both-edge-directions', fixtureId: 'hope-in-god', caseIds: [CASE_A],
      sourcePreconditions: [
        { path: ONTOLOGY_PATH, sha256: HASH_A },
        { path: refugePath, sha256: HASH_B },
      ],
      operations: [
        { ...common('op-add-hope-refuge'), type: 'related-concept-add', conceptId: 'hope-in-god', relatedConceptId: 'refuge-in-trouble' },
        { ...common('op-add-refuge-hope', [refugePath]), type: 'related-concept-add', conceptId: 'refuge-in-trouble', relatedConceptId: 'hope-in-god' },
      ],
    };
    expect(parseProposalManifest(bothDirections, context).operations).toHaveLength(2);

    const duplicateDirection = {
      ...bothDirections,
      proposalId: 'duplicate-directed-edge',
      operations: [
        bothDirections.operations[0],
        { ...common('op-add-hope-refuge-again'), type: 'related-concept-add', conceptId: 'hope-in-god', relatedConceptId: 'refuge-in-trouble' },
      ],
    };
    expect(() => parseProposalManifest(duplicateDirection, context)).toThrow(/directed related-concept edge already exists|already changed/);
  });

  it('uses production default weight one for an omitted reviewed anchor weight', () => {
    const omittedWeightContext: ProposalValidationContext = {
      concepts: [{
        id: 'hope-in-god', phrases: [], related: [],
        anchors: [{ locator: 'John 1:1', sources: ['editorial'] }],
      }],
    };
    const adjustment = oneOperation({
      ...common('op-omitted-weight-adjust'), type: 'editorial-anchor-adjust', conceptId: 'hope-in-god',
      current: { locator: 'John 1:1', sources: ['editorial'], weight: 1 }, next: { locator: 'John 1:1', weight: 0.9 },
    });
    expect(parseProposalManifest(adjustment, omittedWeightContext).operations).toHaveLength(1);
    const stale = structuredClone(adjustment) as { operations: { current: { weight: number } }[] };
    stale.operations[0]!.current.weight = 0.8;
    expect(() => parseProposalManifest(stale, omittedWeightContext)).toThrow(/weight does not match/);
  });

  it('rejects duplicate draft ids even when their content is otherwise distinct', () => {
    const draftPath = 'ontology/concepts/new-concept.yaml';
    const manifest = {
      schemaVersion: 1,
      proposalId: 'duplicate-draft-review',
      fixtureId: 'hope-in-god',
      caseIds: [CASE_A],
      sourcePreconditions: [{ path: draftPath, sha256: HASH_A }],
      operations: [
        {
          ...common('op-first-draft', [draftPath]),
          type: 'concept-draft-create',
          draft: { id: 'new-concept', label: 'First concept', lexicon: ['first unique phrase'], anchors: [], related: [] },
        },
        {
          ...common('op-second-draft', [draftPath]),
          type: 'concept-draft-create',
          draft: { id: 'new-concept', label: 'Second concept', lexicon: ['second unique phrase'], anchors: [], related: [] },
        },
      ],
    };

    try {
      parseProposalManifest(manifest, context);
      throw new Error('expected validation failure');
    } catch (error) {
      expect(error).toBeInstanceOf(ProposalValidationError);
      expect((error as ProposalValidationError).issues).toContainEqual(expect.objectContaining({ code: 'concept-id-collision' }));
    }
  });

  it('rejects a new concept id already occupied by a source-snapshot draft', () => {
    const draftPath = 'ontology/concepts/patient-hope-draft.yaml';
    const manifest = {
      schemaVersion: 1,
      proposalId: 'existing-draft-id-review',
      fixtureId: 'hope-in-god',
      caseIds: [CASE_A],
      sourcePreconditions: [{ path: draftPath, sha256: HASH_A }],
      operations: [{
        ...common('op-existing-draft-id', [draftPath]),
        type: 'concept-draft-create',
        draft: { id: 'patient-hope-draft', label: 'Occupied draft', lexicon: ['new phrase'], anchors: [], related: [] },
      }],
    };

    expect(() => parseProposalManifest(manifest, context)).toThrow(/already exists/);
  });

  it('rejects a non-array draft related field instead of discarding it', () => {
    const draftPath = 'ontology/concepts/new-concept.yaml';
    const manifest = {
      schemaVersion: 1,
      proposalId: 'malformed-related-review',
      fixtureId: 'hope-in-god',
      caseIds: [CASE_A],
      sourcePreconditions: [{ path: draftPath, sha256: HASH_A }],
      operations: [{
        ...common('op-malformed-related', [draftPath]),
        type: 'concept-draft-create',
        draft: {
          id: 'new-concept', label: 'New concept', lexicon: ['unique phrase'],
          anchors: [{ locator: 'John 2:1', weight: 1, sources: ['editorial'] }], related: 'hope-in-god',
        },
      }],
    };

    expect(() => parseProposalManifest(manifest)).toThrow(/related.*must be an array/);
    expect(() => parseProposalManifest(manifest, context)).toThrow(/related.*must be an array/);
  });

  it.each([
    ['duplicate phrase removals', [
      { ...common('op-remove-phrase-a'), type: 'lexicon-phrase-remove', conceptId: 'hope-in-god', phrase: 'a future and a hope', currentOwner: 'editorial' },
      { ...common('op-remove-phrase-b'), type: 'lexicon-phrase-remove', conceptId: 'hope-in-god', phrase: 'a future and a hope', currentOwner: 'editorial' },
    ], 'phrase-collision'],
    ['duplicate anchor removals', [
      { ...common('op-remove-anchor-a'), type: 'editorial-anchor-remove', conceptId: 'hope-in-god', locator: 'Jeremiah 29:11', currentSources: ['editorial'] },
      { ...common('op-remove-anchor-b'), type: 'editorial-anchor-remove', conceptId: 'hope-in-god', locator: 'Jeremiah 29:11', currentSources: ['editorial'] },
    ], 'anchor-collision'],
    ['competing anchor adjustments', [
      { ...common('op-adjust-anchor-a'), type: 'editorial-anchor-adjust', conceptId: 'hope-in-god', current: { locator: 'Hebrews 6:19', sources: ['editorial'], weight: 0.95 }, next: { locator: 'Hebrews 6:18-19', weight: 0.9 } },
      { ...common('op-adjust-anchor-b'), type: 'editorial-anchor-adjust', conceptId: 'hope-in-god', current: { locator: 'Hebrews 6:19', sources: ['editorial'], weight: 0.95 }, next: { locator: 'Hebrews 6:19-20', weight: 0.9 } },
    ], 'anchor-collision'],
    ['an adjustment into an existing anchor', [
      { ...common('op-adjust-into-existing'), type: 'editorial-anchor-adjust', conceptId: 'hope-in-god', current: { locator: 'Hebrews 6:19', sources: ['editorial'], weight: 0.95 }, next: { locator: 'Jeremiah 29:11', weight: 0.9 } },
    ], 'anchor-collision'],
    ['duplicate edge removals', [
      { ...common('op-remove-edge-a'), type: 'related-concept-remove', conceptId: 'hope-in-god', relatedConceptId: 'second-coming' },
      { ...common('op-remove-edge-b'), type: 'related-concept-remove', conceptId: 'hope-in-god', relatedConceptId: 'second-coming' },
    ], 'edge-collision'],
  ] as const)('rejects %s within one proposal', (name, operations, code) => {
    const manifest = {
      schemaVersion: 1,
      proposalId: 'conflicting-operation-review',
      fixtureId: 'hope-in-god',
      caseIds: [CASE_A],
      sourcePreconditions: [{ path: ONTOLOGY_PATH, sha256: HASH_A }],
      operations,
    };

    try {
      parseProposalManifest(manifest, context);
      throw new Error('expected validation failure');
    } catch (error) {
      expect(error).toBeInstanceOf(ProposalValidationError);
      expect((error as ProposalValidationError).issues).toContainEqual(expect.objectContaining({ code }));
    }
    if (name !== 'an adjustment into an existing anchor') {
      expect(() => parseProposalManifest(manifest)).toThrow(ProposalValidationError);
    }
  });

  it.each(['add-first', 'remove-first'] as const)('rejects opposite phrase mutations context-free in %s order', (order) => {
    const add = { ...common('op-add-future-hope'), type: 'lexicon-phrase-add', conceptId: 'hope-in-god', phrase: 'future hope' };
    const remove = { ...common('op-remove-future-hope'), type: 'lexicon-phrase-remove', conceptId: 'hope-in-god', phrase: 'future hope', currentOwner: 'editorial' };
    const manifest = {
      schemaVersion: 1,
      proposalId: `opposite-phrase-${order}`,
      fixtureId: 'hope-in-god',
      caseIds: [CASE_A],
      sourcePreconditions: [{ path: ONTOLOGY_PATH, sha256: HASH_A }],
      operations: order === 'add-first' ? [add, remove] : [remove, add],
    };

    expect(() => parseProposalManifest(manifest)).toThrow(ProposalValidationError);
  });

  it('uses engine-normalized significant tokens for phrase collision identity', () => {
    const manifest = {
      schemaVersion: 1, proposalId: 'significant-phrase-collision', fixtureId: 'hope-in-god', caseIds: [CASE_A],
      sourcePreconditions: [{ path: ONTOLOGY_PATH, sha256: HASH_A }, { path: 'ontology/concepts/refuge-in-trouble.yaml', sha256: HASH_B }],
      operations: [
        { ...common('op-hope-phrase'), type: 'lexicon-phrase-add', conceptId: 'hope-in-god', phrase: 'hope in god' },
        { ...common('op-refuge-phrase', ['ontology/concepts/refuge-in-trouble.yaml']), type: 'lexicon-phrase-add', conceptId: 'refuge-in-trouble', phrase: 'HOPE-IN-GOD' },
      ],
    };
    expect(() => parseProposalManifest(manifest)).toThrow(/phrase already belongs/);
  });

  it.each([
    ['create', {
      ...common('op-draft-with-removed-phrase', [PATIENT_PATH]),
      type: 'concept-draft-create',
      draft: {
        id: 'patient-hope', label: 'Patient hope', lexicon: ['FUTURE   HOPE'],
        anchors: [{ locator: 'Romans 8:25', sources: ['editorial'], weight: 1 }], related: [],
      },
    }, PATIENT_PATH],
    ['merge', {
      ...common('op-merge-with-removed-phrase', [WAITING_PATH]),
      type: 'concept-drafts-merge', draftConceptIds: ['first-draft', 'second-draft'],
      reviewedConcept: {
        id: 'waiting-in-hope', label: 'Waiting in hope', lexicon: ['FUTURE   HOPE'],
        anchors: [{ locator: 'Romans 8:25', sources: ['editorial'], weight: 1 }], related: [],
      },
    }, WAITING_PATH],
  ] as const)('rejects phrase removal combined with draft %s in either order', (_kind, draftOperation, draftPath) => {
    const removal = { ...common('op-remove-before-draft'), type: 'lexicon-phrase-remove', conceptId: 'hope-in-god', phrase: 'future hope', currentOwner: 'editorial' };
    for (const operations of [[removal, draftOperation], [draftOperation, removal]]) {
      const manifest = {
        schemaVersion: 1,
        proposalId: 'draft-phrase-transfer',
        fixtureId: 'hope-in-god',
        caseIds: [CASE_A],
        sourcePreconditions: [{ path: ONTOLOGY_PATH, sha256: HASH_A }, { path: draftPath, sha256: HASH_B }],
        operations,
      };
      expect(() => parseProposalManifest(manifest)).toThrow(ProposalValidationError);
    }
  });

  it.each([
    ['golden fixture writes', FIXTURE_PATH, [
      {
        ...common('op-golden-first', [FIXTURE_PATH]), type: 'golden-fixture-upsert', goldenFixtureId: 'hope-in-god',
        fixture: { id: 'hope-in-god', query: 'first query', status: 'pending', expectedTop: [{ reference: 'Romans 8:24-25' }] },
      },
      {
        ...common('op-golden-second', [FIXTURE_PATH]), type: 'golden-fixture-upsert', goldenFixtureId: 'hope-in-god',
        fixture: { id: 'hope-in-god', query: 'second query', status: 'pending', expectedTop: [{ reference: 'Hebrews 6:19' }] },
      },
    ]],
    ['corpus chapter additions', CORPUS_PATH, [
      { ...common('op-corpus-first', [CORPUS_PATH]), type: 'fixture-corpus-chapter-add', book: 'John', chapter: 1, why: 'First reviewed fixture requires this chapter.' },
      { ...common('op-corpus-second', [CORPUS_PATH]), type: 'fixture-corpus-chapter-add', book: 'john', chapter: 1, why: 'Second reviewed fixture requires this chapter.' },
    ]],
  ] as const)('rejects duplicate %s context-free', (_name, sourcePath, operations) => {
    const manifest = {
      schemaVersion: 1,
      proposalId: 'duplicate-json-intent',
      fixtureId: 'hope-in-god',
      caseIds: [CASE_A],
      sourcePreconditions: [{ path: sourcePath, sha256: HASH_A }],
      operations,
    };

    expect(() => parseProposalManifest(manifest)).toThrow(ProposalValidationError);
  });
});
