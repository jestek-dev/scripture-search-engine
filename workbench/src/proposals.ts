import { createHash } from 'node:crypto';
import nodePath from 'node:path';

import { significantWords } from '@jestek-dev/scripture-engine/internal';
import { validateCorpusFixture } from '../../eval/src/gates/corpusGolden.js';
import { findBook } from '../../pipeline/src/books.js';
import { parseAnchorRef } from '../../pipeline/src/importers/ontologyImporter.js';
import { kjvVerseCount } from '../../pipeline/src/versification/kjv.js';
import { parseVerseId } from '../../pipeline/src/verseId.js';

export const PROPOSAL_SCHEMA_VERSION = 1 as const;
export const PROPOSAL_OPERATION_TYPES = [
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

export type ProposalOperationType = (typeof PROPOSAL_OPERATION_TYPES)[number];

export const SOURCE_DERIVED_OWNERS = [
  'openbible',
  'torrey',
  'translation-variant',
  'cross-reference',
  'exposition',
] as const;
export type SourceDerivedOwner = (typeof SOURCE_DERIVED_OWNERS)[number];
export type RowOwner = 'editorial' | SourceDerivedOwner;

export interface ReviewerConfirmedProvenance {
  readonly source: 'editorial';
  readonly confirmed: true;
  readonly reviewer: string;
  readonly evidence: string;
}

export interface SourcePrecondition {
  readonly path: string;
  readonly sha256: string;
}

interface OperationBase {
  readonly operationId: string;
  readonly type: ProposalOperationType;
  readonly sourcePaths: readonly string[];
  readonly provenance: ReviewerConfirmedProvenance;
  readonly reason: string;
}

export interface LexiconPhraseAdd extends OperationBase {
  readonly type: 'lexicon-phrase-add';
  readonly conceptId: string;
  readonly phrase: string;
}

export interface LexiconPhraseRemove extends OperationBase {
  readonly type: 'lexicon-phrase-remove';
  readonly conceptId: string;
  readonly phrase: string;
  readonly currentOwner: RowOwner;
}

export interface EditorialAnchor {
  readonly locator: string;
  readonly weight: number;
  readonly sources: readonly ['editorial'];
}

export interface EditorialAnchorAdd extends OperationBase {
  readonly type: 'editorial-anchor-add';
  readonly conceptId: string;
  readonly anchor: EditorialAnchor;
}

export interface EditorialAnchorRemove extends OperationBase {
  readonly type: 'editorial-anchor-remove';
  readonly conceptId: string;
  readonly locator: string;
  readonly currentSources: readonly RowOwner[];
}

export interface EditorialAnchorAdjust extends OperationBase {
  readonly type: 'editorial-anchor-adjust';
  readonly conceptId: string;
  readonly current: EditorialAnchor;
  readonly next: Pick<EditorialAnchor, 'locator' | 'weight'>;
}

export interface RelatedConceptAdd extends OperationBase {
  readonly type: 'related-concept-add';
  readonly conceptId: string;
  readonly relatedConceptId: string;
}

export interface RelatedConceptRemove extends OperationBase {
  readonly type: 'related-concept-remove';
  readonly conceptId: string;
  readonly relatedConceptId: string;
}

export interface ConceptDraft {
  readonly id: string;
  readonly label: string;
  readonly lexicon: readonly string[];
  readonly anchors: readonly EditorialAnchor[];
  readonly related: readonly string[];
}

export interface ConceptDraftCreate extends OperationBase {
  readonly type: 'concept-draft-create';
  readonly draft: ConceptDraft;
}

export interface ConceptDraftsMerge extends OperationBase {
  readonly type: 'concept-drafts-merge';
  readonly draftConceptIds: readonly [string, string];
  readonly reviewedConcept: ConceptDraft;
}

export type JsonValue = null | boolean | number | string | JsonValue[] | { readonly [key: string]: JsonValue };

export interface GoldenFixtureUpsert extends OperationBase {
  readonly type: 'golden-fixture-upsert';
  readonly goldenFixtureId: string;
  readonly fixture: { readonly [key: string]: JsonValue };
}

export interface FixtureCorpusChapterAdd extends OperationBase {
  readonly type: 'fixture-corpus-chapter-add';
  readonly book: string;
  readonly chapter: number;
  readonly why: string;
}

export type ProposalOperation =
  | LexiconPhraseAdd
  | LexiconPhraseRemove
  | EditorialAnchorAdd
  | EditorialAnchorRemove
  | EditorialAnchorAdjust
  | RelatedConceptAdd
  | RelatedConceptRemove
  | ConceptDraftCreate
  | ConceptDraftsMerge
  | GoldenFixtureUpsert
  | FixtureCorpusChapterAdd;

export interface ProposalManifest {
  readonly schemaVersion: typeof PROPOSAL_SCHEMA_VERSION;
  readonly proposalId: string;
  readonly fixtureId: string;
  readonly caseIds: readonly string[];
  readonly sourcePreconditions: readonly SourcePrecondition[];
  readonly operations: readonly ProposalOperation[];
}

export interface OntologyConceptIndex {
  readonly id: string;
  readonly phrases: readonly string[];
  readonly phraseOwners?: Readonly<Record<string, RowOwner>>;
  readonly anchors: readonly { readonly locator: string; readonly sources: readonly RowOwner[]; readonly weight?: number }[];
  readonly related: readonly string[];
}

export interface ProposalValidationContext {
  readonly concepts: readonly OntologyConceptIndex[];
  readonly draftConceptIds?: readonly string[];
}

export type ProposalIssueCode =
  | 'schema'
  | 'source-precondition'
  | 'source-ownership'
  | 'concept-id-collision'
  | 'phrase-collision'
  | 'anchor-collision'
  | 'edge-collision'
  | 'fixture-collision';

export interface ProposalValidationIssue {
  readonly code: ProposalIssueCode;
  readonly path: string;
  readonly message: string;
}

export class ProposalValidationError extends Error {
  constructor(readonly issues: readonly ProposalValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'));
    this.name = 'ProposalValidationError';
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const SAFE_PATH_PATTERN = /^(?![a-zA-Z]:)(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9._/-]+$/;
const GOLDEN_FIXTURE_FIELDS = new Set([
  'id', 'status', 'query', 'expectedTop', 'expectedWithinTop', 'preferredOrder', 'additionalQueries',
  'mustNotRank', 'coversConcepts', 'note', 'alsoAcceptable', 'generatedBy',
]);

function issue(code: ProposalIssueCode, path: string, message: string): ProposalValidationIssue {
  return { code, path, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactObject(
  value: unknown,
  required: readonly string[],
  optional: readonly string[],
  path: string,
  issues: ProposalValidationIssue[],
): Record<string, unknown> | undefined {
  if (!isRecord(value)) {
    issues.push(issue('schema', path, 'must be an object.'));
    return undefined;
  }
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value).sort()) {
    if (!allowed.has(key)) issues.push(issue('schema', `${path}.${key}`, 'is not an allowed field.'));
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) issues.push(issue('schema', `${path}.${key}`, 'is required.'));
  }
  return value;
}

function textValue(value: unknown, path: string, issues: ProposalValidationIssue[], minimum = 1): string {
  if (typeof value !== 'string' || value.trim() !== value || value.length < minimum) {
    issues.push(issue('schema', path, `must be canonical non-empty text${minimum > 1 ? ` of at least ${minimum} characters` : ''}.`));
    return '';
  }
  return value;
}

function phraseValue(value: unknown, path: string, issues: ProposalValidationIssue[]): string {
  const phrase = textValue(value, path, issues);
  if (phrase !== '' && significantWords(phrase).length === 0) {
    issues.push(issue('schema', path, 'must retain at least one significant token after engine normalization.'));
  }
  return phrase;
}

function idValue(value: unknown, path: string, issues: ProposalValidationIssue[]): string {
  const result = textValue(value, path, issues);
  if (result !== '' && !ID_PATTERN.test(result)) issues.push(issue('schema', path, 'must be a lowercase kebab-case id.'));
  return result;
}

function uuidValue(value: unknown, path: string, issues: ProposalValidationIssue[]): string {
  const result = textValue(value, path, issues);
  if (result !== '' && !UUID_PATTERN.test(result)) issues.push(issue('schema', path, 'must be a UUID.'));
  return result.toLowerCase();
}

function pathValue(value: unknown, path: string, issues: ProposalValidationIssue[]): string {
  const result = textValue(value, path, issues);
  if (
    result !== ''
    && (
      !SAFE_PATH_PATTERN.test(result)
      || result.includes('\\')
      || result.startsWith('/')
      || nodePath.posix.normalize(result) !== result
      || result.split('/').some((segment) => segment.length === 0)
      || result.endsWith('/')
    )
  ) {
    issues.push(issue('schema', path, 'must be a repository-relative POSIX path without traversal.'));
  }
  return result;
}

function stringArray(
  value: unknown,
  path: string,
  issues: ProposalValidationIssue[],
  parser: (entry: unknown, path: string, issues: ProposalValidationIssue[]) => string = textValue,
): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    issues.push(issue('schema', path, 'must be a non-empty array.'));
    return [];
  }
  const parsed = value.map((entry, index) => parser(entry, `${path}[${index}]`, issues));
  if (new Set(parsed).size !== parsed.length) issues.push(issue('schema', path, 'must not contain duplicates.'));
  return parsed;
}

function weightValue(value: unknown, path: string, issues: ProposalValidationIssue[]): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 1) {
    issues.push(issue('schema', path, 'must be a finite number greater than 0 and no greater than 1.'));
    return 0;
  }
  return value;
}

function anchorLocatorValue(value: unknown, path: string, issues: ProposalValidationIssue[]): string {
  const locator = textValue(value, path, issues);
  if (locator !== '' && canonicalAnchorRange(locator) === null) issues.push(issue('schema', path, 'must be a resolvable verse range inside canonical KJV versification.'));
  return locator;
}

function parseProvenance(value: unknown, path: string, issues: ProposalValidationIssue[]): ReviewerConfirmedProvenance {
  const record = exactObject(value, ['source', 'confirmed', 'reviewer', 'evidence'], [], path, issues) ?? {};
  if (record.source !== 'editorial') issues.push(issue('source-ownership', `${path}.source`, 'automatic proposals may author editorial provenance only.'));
  if (record.confirmed !== true) issues.push(issue('schema', `${path}.confirmed`, 'must be true after explicit reviewer confirmation.'));
  return {
    source: 'editorial',
    confirmed: true,
    reviewer: textValue(record.reviewer, `${path}.reviewer`, issues),
    evidence: textValue(record.evidence, `${path}.evidence`, issues, 8),
  };
}

function parseAnchor(value: unknown, path: string, issues: ProposalValidationIssue[]): EditorialAnchor {
  const record = exactObject(value, ['locator', 'weight', 'sources'], [], path, issues) ?? {};
  if (!Array.isArray(record.sources) || record.sources.length !== 1 || record.sources[0] !== 'editorial') {
    issues.push(issue('source-ownership', `${path}.sources`, 'must be exactly ["editorial"].'));
  }
  return {
    locator: anchorLocatorValue(record.locator, `${path}.locator`, issues),
    weight: weightValue(record.weight, `${path}.weight`, issues),
    sources: ['editorial'],
  };
}

function parseOwner(value: unknown, path: string, issues: ProposalValidationIssue[]): RowOwner {
  const owners: readonly string[] = ['editorial', ...SOURCE_DERIVED_OWNERS];
  if (typeof value !== 'string' || !owners.includes(value)) {
    issues.push(issue('schema', path, `must be one of ${owners.join(', ')}.`));
    return 'editorial';
  }
  return value as RowOwner;
}

function parseCurrentSources(value: unknown, path: string, issues: ProposalValidationIssue[]): RowOwner[] {
  if (!Array.isArray(value) || value.length === 0) {
    issues.push(issue('schema', path, 'must be a non-empty array of current source owners.'));
    return [];
  }
  const result = value.map((entry, index) => parseOwner(entry, `${path}[${index}]`, issues));
  if (new Set(result).size !== result.length) issues.push(issue('schema', path, 'must not contain duplicates.'));
  return result;
}

function parseDraft(value: unknown, path: string, issues: ProposalValidationIssue[]): ConceptDraft {
  const record = exactObject(value, ['id', 'label', 'lexicon', 'anchors', 'related'], [], path, issues) ?? {};
  const anchors = Array.isArray(record.anchors)
    ? record.anchors.map((entry, index) => parseAnchor(entry, `${path}.anchors[${index}]`, issues))
    : [];
  if (!Array.isArray(record.anchors) || record.anchors.length === 0) {
    issues.push(issue('schema', `${path}.anchors`, 'must be a non-empty array.'));
  }
  const related = Array.isArray(record.related)
    ? record.related.map((entry, index) => idValue(entry, `${path}.related[${index}]`, issues))
    : [];
  if (!Array.isArray(record.related)) issues.push(issue('schema', `${path}.related`, 'must be an array.'));
  if (new Set(related).size !== related.length) issues.push(issue('schema', `${path}.related`, 'must not contain duplicates.'));
  return {
    id: idValue(record.id, `${path}.id`, issues),
    label: textValue(record.label, `${path}.label`, issues),
    lexicon: stringArray(record.lexicon, `${path}.lexicon`, issues, phraseValue),
    anchors,
    related,
  };
}

function parseJson(value: unknown, path: string, issues: ProposalValidationIssue[]): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map((entry, index) => parseJson(entry, `${path}[${index}]`, issues));
  if (isRecord(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, parseJson(value[key], `${path}.${key}`, issues)]));
  }
  issues.push(issue('schema', path, 'must contain JSON-safe values only.'));
  return null;
}

const COMMON_FIELDS = ['operationId', 'type', 'sourcePaths', 'provenance', 'reason'] as const;

function parseOperation(value: unknown, index: number, issues: ProposalValidationIssue[]): ProposalOperation | undefined {
  const path = `operations[${index}]`;
  if (!isRecord(value)) {
    issues.push(issue('schema', path, 'must be an object.'));
    return undefined;
  }
  if (typeof value.type !== 'string' || !(PROPOSAL_OPERATION_TYPES as readonly string[]).includes(value.type)) {
    issues.push(issue('schema', `${path}.type`, 'must be a supported proposal operation type.'));
    return undefined;
  }
  const type = value.type as ProposalOperationType;
  const operationFields: Record<ProposalOperationType, readonly string[]> = {
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
  const record = exactObject(value, [...COMMON_FIELDS, ...operationFields[type]], [], path, issues) ?? value;
  const base = {
    operationId: idValue(record.operationId, `${path}.operationId`, issues),
    type,
    sourcePaths: stringArray(record.sourcePaths, `${path}.sourcePaths`, issues, pathValue),
    provenance: parseProvenance(record.provenance, `${path}.provenance`, issues),
    reason: textValue(record.reason, `${path}.reason`, issues, 12),
  };

  switch (type) {
    case 'lexicon-phrase-add':
      return { ...base, type, conceptId: idValue(record.conceptId, `${path}.conceptId`, issues), phrase: phraseValue(record.phrase, `${path}.phrase`, issues) };
    case 'lexicon-phrase-remove':
      return {
        ...base,
        type,
        conceptId: idValue(record.conceptId, `${path}.conceptId`, issues),
        phrase: phraseValue(record.phrase, `${path}.phrase`, issues),
        currentOwner: parseOwner(record.currentOwner, `${path}.currentOwner`, issues),
      };
    case 'editorial-anchor-add':
      return { ...base, type, conceptId: idValue(record.conceptId, `${path}.conceptId`, issues), anchor: parseAnchor(record.anchor, `${path}.anchor`, issues) };
    case 'editorial-anchor-remove':
      return {
        ...base,
        type,
        conceptId: idValue(record.conceptId, `${path}.conceptId`, issues),
        locator: anchorLocatorValue(record.locator, `${path}.locator`, issues),
        currentSources: parseCurrentSources(record.currentSources, `${path}.currentSources`, issues),
      };
    case 'editorial-anchor-adjust': {
      const next = exactObject(record.next, ['locator', 'weight'], [], `${path}.next`, issues) ?? {};
      return {
        ...base,
        type,
        conceptId: idValue(record.conceptId, `${path}.conceptId`, issues),
        current: parseAnchor(record.current, `${path}.current`, issues),
        next: {
          locator: anchorLocatorValue(next.locator, `${path}.next.locator`, issues),
          weight: weightValue(next.weight, `${path}.next.weight`, issues),
        },
      };
    }
    case 'related-concept-add':
    case 'related-concept-remove':
      return {
        ...base,
        type,
        conceptId: idValue(record.conceptId, `${path}.conceptId`, issues),
        relatedConceptId: idValue(record.relatedConceptId, `${path}.relatedConceptId`, issues),
      };
    case 'concept-draft-create':
      return { ...base, type, draft: parseDraft(record.draft, `${path}.draft`, issues) };
    case 'concept-drafts-merge': {
      const ids = stringArray(record.draftConceptIds, `${path}.draftConceptIds`, issues, idValue);
      if (ids.length !== 2) issues.push(issue('schema', `${path}.draftConceptIds`, 'must contain exactly two distinct draft ids.'));
      return {
        ...base,
        type,
        draftConceptIds: [ids[0] ?? '', ids[1] ?? ''],
        reviewedConcept: parseDraft(record.reviewedConcept, `${path}.reviewedConcept`, issues),
      };
    }
    case 'golden-fixture-upsert': {
      const fixture = parseJson(record.fixture, `${path}.fixture`, issues);
      if (!isRecord(fixture)) issues.push(issue('schema', `${path}.fixture`, 'must be a JSON object.'));
      const goldenFixtureId = idValue(record.goldenFixtureId, `${path}.goldenFixtureId`, issues);
      if (isRecord(fixture) && fixture.id !== goldenFixtureId) {
        issues.push(issue('schema', `${path}.fixture.id`, 'must equal goldenFixtureId.'));
      }
      if (isRecord(fixture)) {
        for (const key of Object.keys(fixture).sort()) {
          if (!GOLDEN_FIXTURE_FIELDS.has(key)) issues.push(issue('schema', `${path}.fixture.${key}`, 'is not an allowed golden fixture field.'));
        }
        for (const finding of validateCorpusFixture(fixture)) {
          issues.push(issue('schema', `${path}.fixture`, `${finding.categoryCode ?? 'G3_FIXTURE_INVALID'}: ${finding.message}`));
        }
      }
      return { ...base, type, goldenFixtureId, fixture: isRecord(fixture) ? fixture as { readonly [key: string]: JsonValue } : {} };
    }
    case 'fixture-corpus-chapter-add': {
      const bookText = textValue(record.book, `${path}.book`, issues);
      const book = findBook(bookText);
      if (bookText !== '' && book === undefined) issues.push(issue('schema', `${path}.book`, 'must resolve to a canonical Bible book.'));
      const chapter = typeof record.chapter === 'number' ? record.chapter : 0;
      if (!Number.isSafeInteger(record.chapter) || chapter < 1 || (book !== undefined && chapter > book.chapterCount)) {
        issues.push(issue('schema', `${path}.chapter`, `must be an integer inside ${book?.name ?? 'the selected book'}.`));
      }
      return {
        ...base,
        type,
        book: book?.name ?? bookText,
        chapter,
        why: textValue(record.why, `${path}.why`, issues, 8),
      };
    }
  }
}

function operationOwnershipIssues(operation: ProposalOperation, path: string): ProposalValidationIssue[] {
  if (operation.type === 'lexicon-phrase-remove' && operation.currentOwner !== 'editorial') {
    return [issue('source-ownership', `${path}.currentOwner`, `${operation.currentOwner} rows must be changed at their owning importer or source snapshot.`)];
  }
  if (operation.type === 'editorial-anchor-remove' &&
      (operation.currentSources.length !== 1 || operation.currentSources[0] !== 'editorial')) {
    return [issue('source-ownership', `${path}.currentSources`, 'an anchor can be removed editorially only when its sole current source is editorial.')];
  }
  return [];
}

function operationPathIssues(operation: ProposalOperation, path: string): ProposalValidationIssue[] {
  const expectedPath = operation.type === 'golden-fixture-upsert'
    ? `eval/golden/${operation.goldenFixtureId}.json`
    : operation.type === 'fixture-corpus-chapter-add'
      ? 'pipeline/fixtures/web-subset.json'
      : operation.type === 'concept-draft-create'
        ? `ontology/concepts/${operation.draft.id}.yaml`
        : operation.type === 'concept-drafts-merge'
          ? `ontology/concepts/${operation.reviewedConcept.id}.yaml`
          : `ontology/concepts/${operation.conceptId}.yaml`;
  return operation.sourcePaths
    .filter((sourcePath) => sourcePath !== expectedPath)
    .map((sourcePath) => issue('source-precondition', `${path}.sourcePaths`, `path "${sourcePath}" is outside the owned source surface for ${operation.type}.`));
}

export function canonicalPhraseIdentity(value: string): string {
  return significantWords(value).join(' ');
}

function directedEdgeKey(left: string, right: string): string {
  return `${left}|${right}`;
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

export function canonicalAnchorIdentity(locator: string): string | null {
  const range = canonicalAnchorRange(locator);
  return range === null ? null : `${range.start}-${range.end}`;
}

function anchorKey(conceptId: string, locator: string): string {
  const identity = canonicalAnchorIdentity(locator);
  return identity === null ? `${conceptId}|invalid:${locator}` : `${conceptId}|${identity}`;
}

/** Validates source ownership and concept/phrase/anchor/edge collisions against one source snapshot. */
export function validateProposalCollisions(
  manifest: ProposalManifest,
  context?: ProposalValidationContext,
): readonly ProposalValidationIssue[] {
  const issues: ProposalValidationIssue[] = [];
  const hasSourceSnapshot = context !== undefined;
  const sourceConcepts = context?.concepts ?? [];
  const concepts = new Map(sourceConcepts.map((concept) => [concept.id, concept]));
  const conceptIds = new Set(concepts.keys());
  const draftIds = new Set(context?.draftConceptIds ?? []);
  const phrases = new Map<string, string[]>();
  const anchors = new Set<string>();
  const edges = new Set<string>();

  for (const concept of [...sourceConcepts].sort((a, b) => a.id.localeCompare(b.id))) {
    for (const phrase of concept.phrases) {
      const key = canonicalPhraseIdentity(phrase);
      phrases.set(key, [...(phrases.get(key) ?? []), concept.id].sort());
    }
    for (const anchor of concept.anchors) anchors.add(anchorKey(concept.id, anchor.locator));
    for (const related of concept.related) {
      edges.add(directedEdgeKey(concept.id, related));
    }
  }

  const declaredDraftIds = new Set<string>();
  for (const operation of manifest.operations) {
    if (operation.type === 'concept-draft-create') declaredDraftIds.add(operation.draft.id);
    if (operation.type === 'concept-drafts-merge') declaredDraftIds.add(operation.reviewedConcept.id);
  }
  const pendingConceptIds = new Set<string>();
  const pendingPhrases = new Set<string>();
  const pendingPhraseRemovals = new Set<string>();
  const removedPhrases = new Set<string>();
  const pendingAnchors = new Set<string>();
  const consumedAnchors = new Set<string>();
  const pendingEdges = new Set<string>();
  const touchedEdges = new Set<string>();
  const touchedGoldenFixtures = new Set<string>();
  const touchedCorpusChapters = new Set<string>();
  manifest.operations.forEach((operation, index) => {
    const path = `operations[${index}]`;
    issues.push(...operationOwnershipIssues(operation, path));
    issues.push(...operationPathIssues(operation, path));
    if (operation.type === 'lexicon-phrase-remove') {
      const concept = concepts.get(operation.conceptId);
      const operationPhrase = canonicalPhraseIdentity(operation.phrase);
      const actualOwner = Object.entries(concept?.phraseOwners ?? {})
        .find(([phrase]) => canonicalPhraseIdentity(phrase) === operationPhrase)?.[1];
      if (hasSourceSnapshot && (actualOwner === undefined || actualOwner !== operation.currentOwner)) {
        issues.push(issue('source-ownership', `${path}.currentOwner`, 'declared lexicon ownership does not match the reviewed ontology snapshot.'));
      }
      const key = `${operation.conceptId}|${operationPhrase}`;
      const phraseKey = operationPhrase;
      if (pendingPhraseRemovals.has(key) || pendingPhrases.has(phraseKey)) {
        issues.push(issue('phrase-collision', `${path}.phrase`, 'this proposal already changes the same lexicon phrase.'));
      }
      pendingPhraseRemovals.add(key);
      removedPhrases.add(phraseKey);
    }
    if (operation.type === 'editorial-anchor-remove') {
      const actual = concepts.get(operation.conceptId)?.anchors.find((anchor) => anchorKey(operation.conceptId, anchor.locator) === anchorKey(operation.conceptId, operation.locator))?.sources;
      if (hasSourceSnapshot && (actual === undefined || [...actual].sort().join('|') !== [...operation.currentSources].sort().join('|'))) {
        issues.push(issue('source-ownership', `${path}.currentSources`, 'declared anchor ownership does not match the reviewed ontology snapshot.'));
      }
      if (actual !== undefined && (actual.length !== 1 || actual[0] !== 'editorial')) {
        issues.push(issue('source-ownership', `${path}.currentSources`, 'the reviewed anchor is source-derived and cannot be removed editorially.'));
      }
      const key = anchorKey(operation.conceptId, operation.locator);
      if (consumedAnchors.has(key) || pendingAnchors.has(key)) {
        issues.push(issue('anchor-collision', `${path}.locator`, 'this anchor is already changed elsewhere in the proposal.'));
      }
      consumedAnchors.add(key);
    }
    if (operation.type === 'editorial-anchor-adjust') {
      const actual = concepts.get(operation.conceptId)?.anchors.find((anchor) => anchorKey(operation.conceptId, anchor.locator) === anchorKey(operation.conceptId, operation.current.locator));
      if (hasSourceSnapshot && (actual === undefined || [...actual.sources].sort().join('|') !== [...operation.current.sources].sort().join('|'))) {
        issues.push(issue('source-ownership', `${path}.current.sources`, 'declared anchor ownership does not match the reviewed ontology snapshot.'));
      }
      if (actual !== undefined && (actual.sources.length !== 1 || actual.sources[0] !== 'editorial')) {
        issues.push(issue('source-ownership', `${path}.current.sources`, 'the reviewed anchor is source-derived and cannot be adjusted editorially.'));
      }
      if (hasSourceSnapshot && actual !== undefined && (actual.weight ?? 1) !== operation.current.weight) {
        issues.push(issue('source-precondition', `${path}.current.weight`, 'declared anchor weight does not match the reviewed ontology snapshot.'));
      }
      const currentKey = anchorKey(operation.conceptId, operation.current.locator);
      const nextKey = anchorKey(operation.conceptId, operation.next.locator);
      if (consumedAnchors.has(currentKey) || pendingAnchors.has(currentKey)) {
        issues.push(issue('anchor-collision', `${path}.current.locator`, 'this anchor is already changed elsewhere in the proposal.'));
      }
      if (nextKey !== currentKey && (anchors.has(nextKey) || pendingAnchors.has(nextKey) || consumedAnchors.has(nextKey))) {
        issues.push(issue('anchor-collision', `${path}.next.locator`, 'the adjusted anchor destination already exists or is changed elsewhere in the proposal.'));
      }
      consumedAnchors.add(currentKey);
      pendingAnchors.add(nextKey);
    }
    if (operation.type === 'concept-draft-create' || operation.type === 'concept-drafts-merge') {
      const draft = operation.type === 'concept-draft-create' ? operation.draft : operation.reviewedConcept;
      if ((hasSourceSnapshot && (conceptIds.has(draft.id) || draftIds.has(draft.id))) || pendingConceptIds.has(draft.id)) {
        issues.push(issue('concept-id-collision', `${path}.${operation.type === 'concept-draft-create' ? 'draft' : 'reviewedConcept'}.id`, `concept id "${draft.id}" already exists in this source snapshot or proposal.`));
      }
      pendingConceptIds.add(draft.id);
      for (const phrase of draft.lexicon) {
        const key = canonicalPhraseIdentity(phrase);
        const owners = phrases.get(key);
        if (owners !== undefined || pendingPhrases.has(key) || removedPhrases.has(key)) {
          issues.push(issue('phrase-collision', path, `lexicon phrase "${phrase}" already belongs to ${owners?.join(', ') ?? 'another operation'}.`));
        }
        pendingPhrases.add(key);
      }
      const localAnchors = new Set<string>();
      for (const anchor of draft.anchors) {
        const key = anchorKey(draft.id, anchor.locator);
        if (localAnchors.has(key) || pendingAnchors.has(key) || consumedAnchors.has(key) || anchors.has(key)) {
          issues.push(issue('anchor-collision', path, `anchor "${anchor.locator}" is duplicated or changed elsewhere in concept "${draft.id}".`));
        }
        localAnchors.add(key);
        pendingAnchors.add(key);
      }
      for (const related of draft.related) {
        const key = directedEdgeKey(draft.id, related);
        if (draft.id === related || pendingEdges.has(key)) issues.push(issue('edge-collision', path, `related edge ${draft.id} -> ${related} is self-referential or duplicated.`));
        if (hasSourceSnapshot && !conceptIds.has(related) && !declaredDraftIds.has(related)) {
          issues.push(issue('concept-id-collision', path, `related concept "${related}" does not exist in the source snapshot or proposal.`));
        }
        pendingEdges.add(key);
      }
      if (operation.type === 'concept-drafts-merge') {
        for (const [draftIndex, draftId] of operation.draftConceptIds.entries()) {
          if (hasSourceSnapshot && !draftIds.has(draftId)) issues.push(issue('concept-id-collision', `${path}.draftConceptIds[${draftIndex}]`, `"${draftId}" is not a known draft concept.`));
        }
      }
    } else if (hasSourceSnapshot && 'conceptId' in operation && !conceptIds.has(operation.conceptId)) {
      issues.push(issue('concept-id-collision', `${path}.conceptId`, `concept "${operation.conceptId}" does not exist.`));
    }

    if (operation.type === 'lexicon-phrase-add') {
      const key = canonicalPhraseIdentity(operation.phrase);
      const owners = phrases.get(key);
      if (owners !== undefined || pendingPhrases.has(key) || removedPhrases.has(key)) {
        issues.push(issue('phrase-collision', `${path}.phrase`, `phrase already belongs to ${owners?.join(', ') ?? 'another operation'}.`));
      }
      pendingPhrases.add(key);
    }
    if (operation.type === 'editorial-anchor-add') {
      const key = anchorKey(operation.conceptId, operation.anchor.locator);
      if (anchors.has(key) || pendingAnchors.has(key) || consumedAnchors.has(key)) issues.push(issue('anchor-collision', `${path}.anchor.locator`, 'anchor already exists or is changed elsewhere on this concept.'));
      pendingAnchors.add(key);
    }
    if (operation.type === 'related-concept-add' || operation.type === 'related-concept-remove') {
      if (hasSourceSnapshot && !conceptIds.has(operation.relatedConceptId)) {
        issues.push(issue('concept-id-collision', `${path}.relatedConceptId`, `related concept "${operation.relatedConceptId}" does not exist.`));
      }
      const directedKey = directedEdgeKey(operation.conceptId, operation.relatedConceptId);
      if (operation.conceptId === operation.relatedConceptId) {
        issues.push(issue('edge-collision', `${path}.relatedConceptId`, 'a concept cannot be related to itself.'));
      } else if (touchedEdges.has(directedKey)) {
        issues.push(issue('edge-collision', `${path}.relatedConceptId`, 'this related-concept edge is already changed elsewhere in the proposal.'));
      } else if (operation.type === 'related-concept-add' && (edges.has(directedKey) || pendingEdges.has(directedKey))) {
        issues.push(issue('edge-collision', `${path}.relatedConceptId`, 'this directed related-concept edge already exists.'));
      } else if (operation.type === 'related-concept-remove' && hasSourceSnapshot && !edges.has(directedKey)) {
        issues.push(issue('edge-collision', `${path}.relatedConceptId`, 'this related-concept edge does not exist.'));
      }
      touchedEdges.add(directedKey);
      pendingEdges.add(directedKey);
    }
    if (operation.type === 'golden-fixture-upsert') {
      if (touchedGoldenFixtures.has(operation.goldenFixtureId)) {
        issues.push(issue('fixture-collision', `${path}.goldenFixtureId`, 'this golden fixture is already written elsewhere in the proposal.'));
      }
      touchedGoldenFixtures.add(operation.goldenFixtureId);
    }
    if (operation.type === 'fixture-corpus-chapter-add') {
      const key = `${findBook(operation.book)?.id ?? operation.book}|${operation.chapter}`;
      if (touchedCorpusChapters.has(key)) {
        issues.push(issue('fixture-collision', path, 'this corpus chapter is already added elsewhere in the proposal.'));
      }
      touchedCorpusChapters.add(key);
    }
  });
  return issues.sort((a, b) => a.path.localeCompare(b.path) || a.code.localeCompare(b.code) || a.message.localeCompare(b.message));
}

/** Strictly parses the closed v1 schema and optionally validates it against an ontology snapshot. */
export function parseProposalManifest(value: unknown, context?: ProposalValidationContext): ProposalManifest {
  const issues: ProposalValidationIssue[] = [];
  const record = exactObject(value, ['schemaVersion', 'proposalId', 'fixtureId', 'caseIds', 'sourcePreconditions', 'operations'], [], 'proposal', issues) ?? {};
  if (record.schemaVersion !== PROPOSAL_SCHEMA_VERSION) {
    issues.push(issue('schema', 'proposal.schemaVersion', `must be ${PROPOSAL_SCHEMA_VERSION}.`));
  }
  const preconditions: SourcePrecondition[] = [];
  if (!Array.isArray(record.sourcePreconditions) || record.sourcePreconditions.length === 0) {
    issues.push(issue('schema', 'proposal.sourcePreconditions', 'must be a non-empty array.'));
  } else {
    record.sourcePreconditions.forEach((entry, index) => {
      const path = `proposal.sourcePreconditions[${index}]`;
      const item = exactObject(entry, ['path', 'sha256'], [], path, issues) ?? {};
      const sourcePath = pathValue(item.path, `${path}.path`, issues);
      const sha256 = textValue(item.sha256, `${path}.sha256`, issues);
      if (sha256 !== '' && !SHA256_PATTERN.test(sha256)) issues.push(issue('schema', `${path}.sha256`, 'must be a lowercase SHA-256 digest.'));
      preconditions.push({ path: sourcePath, sha256 });
    });
  }
  if (new Set(preconditions.map((entry) => entry.path)).size !== preconditions.length) {
    issues.push(issue('schema', 'proposal.sourcePreconditions', 'must contain each source path once.'));
  }
  const operations = Array.isArray(record.operations)
    ? record.operations.map((entry, index) => parseOperation(entry, index, issues)).filter((entry): entry is ProposalOperation => entry !== undefined)
    : [];
  if (!Array.isArray(record.operations) || record.operations.length === 0) issues.push(issue('schema', 'proposal.operations', 'must be a non-empty array.'));
  if (new Set(operations.map((entry) => entry.operationId)).size !== operations.length) {
    issues.push(issue('schema', 'proposal.operations', 'must contain unique operationId values.'));
  }
  const preconditionPaths = new Set(preconditions.map((entry) => entry.path));
  operations.forEach((operation, index) => {
    operation.sourcePaths.forEach((sourcePath, sourceIndex) => {
      if (!preconditionPaths.has(sourcePath)) {
        issues.push(issue('source-precondition', `operations[${index}].sourcePaths[${sourceIndex}]`, `has no matching sourcePreconditions hash for "${sourcePath}".`));
      }
    });
    issues.push(...operationOwnershipIssues(operation, `operations[${index}]`));
    issues.push(...operationPathIssues(operation, `operations[${index}]`));
  });
  const usedSourcePaths = new Set(operations.flatMap((operation) => operation.sourcePaths));
  preconditions.forEach((precondition, index) => {
    if (!usedSourcePaths.has(precondition.path)) {
      issues.push(issue('source-precondition', `proposal.sourcePreconditions[${index}].path`, `unused source precondition "${precondition.path}" is not allowed.`));
    }
  });

  const manifest: ProposalManifest = {
    schemaVersion: PROPOSAL_SCHEMA_VERSION,
    proposalId: idValue(record.proposalId, 'proposal.proposalId', issues),
    fixtureId: idValue(record.fixtureId, 'proposal.fixtureId', issues),
    caseIds: stringArray(record.caseIds, 'proposal.caseIds', issues, uuidValue),
    sourcePreconditions: preconditions,
    operations,
  };
  operations.forEach((operation, index) => {
    if (operation.type === 'golden-fixture-upsert' && operation.goldenFixtureId !== manifest.fixtureId) {
      issues.push(issue('schema', `operations[${index}].goldenFixtureId`, 'must equal the proposal fixtureId.'));
    }
  });
  issues.push(...validateProposalCollisions(manifest, context));
  if (issues.length > 0) {
    const deduplicated = [...new Map(issues.map((entry) => [`${entry.code}|${entry.path}|${entry.message}`, entry])).values()]
      .sort((a, b) => a.path.localeCompare(b.path) || a.code.localeCompare(b.code) || a.message.localeCompare(b.message));
    throw new ProposalValidationError(deduplicated);
  }
  return normalizeProposalManifest(manifest);
}

function sortDraft(draft: ConceptDraft): ConceptDraft {
  return {
    ...draft,
    lexicon: [...draft.lexicon].sort((a, b) => canonicalPhraseIdentity(a).localeCompare(canonicalPhraseIdentity(b))),
    anchors: [...draft.anchors].sort((a, b) => a.locator.localeCompare(b.locator) || a.weight - b.weight),
    related: [...draft.related].sort(),
  };
}

function normalizeOperation(operation: ProposalOperation): ProposalOperation {
  const sourcePaths = [...operation.sourcePaths].sort();
  if (operation.type === 'concept-draft-create') return { ...operation, sourcePaths, draft: sortDraft(operation.draft) };
  if (operation.type === 'concept-drafts-merge') {
    return {
      ...operation,
      sourcePaths,
      draftConceptIds: [...operation.draftConceptIds].sort() as [string, string],
      reviewedConcept: sortDraft(operation.reviewedConcept),
    };
  }
  if (operation.type === 'editorial-anchor-remove') {
    return { ...operation, sourcePaths, currentSources: [...operation.currentSources].sort() };
  }
  return { ...operation, sourcePaths };
}

export function normalizeProposalManifest(manifest: ProposalManifest): ProposalManifest {
  return {
    schemaVersion: PROPOSAL_SCHEMA_VERSION,
    proposalId: manifest.proposalId,
    fixtureId: manifest.fixtureId,
    caseIds: [...manifest.caseIds].sort(),
    sourcePreconditions: [...manifest.sourcePreconditions].sort((a, b) => a.path.localeCompare(b.path)),
    operations: [...manifest.operations].map(normalizeOperation).sort((a, b) => a.operationId.localeCompare(b.operationId) || a.type.localeCompare(b.type)),
  };
}

function stableJson(value: JsonValue | ProposalManifest): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableJson(entry)).join(',')}]`;
  const record = value as unknown as Record<string, JsonValue>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key] ?? null)}`).join(',')}}`;
}

export function proposalManifestDigest(manifest: ProposalManifest): string {
  return createHash('sha256').update(stableJson(normalizeProposalManifest(manifest))).digest('hex');
}
