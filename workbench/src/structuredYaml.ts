import { createHash } from 'node:crypto';

import { Document, isAlias, isMap, isSeq, parseDocument, visit, type YAMLMap, type YAMLSeq } from 'yaml';

import {
  canonicalAnchorIdentity,
  canonicalPhraseIdentity,
  ProposalValidationError,
  type ConceptDraft,
  type ConceptDraftCreate,
  type ConceptDraftsMerge,
  type EditorialAnchorAdd,
  type EditorialAnchorAdjust,
  type EditorialAnchorRemove,
  type LexiconPhraseAdd,
  type LexiconPhraseRemove,
  type ProposalOperation,
  type RelatedConceptAdd,
  type RelatedConceptRemove,
} from './proposals.js';

export type StructuredConceptOperation =
  | LexiconPhraseAdd
  | LexiconPhraseRemove
  | EditorialAnchorAdd
  | EditorialAnchorRemove
  | EditorialAnchorAdjust
  | RelatedConceptAdd
  | RelatedConceptRemove
  | ConceptDraftCreate
  | ConceptDraftsMerge;

export interface FullFileSnapshot {
  readonly text: string;
  readonly sha256: string;
}

export interface StructuredYamlDiff {
  readonly schemaVersion: 1;
  readonly path: string;
  readonly sourceSha256: string;
  readonly operationId: string;
  readonly changed: boolean;
  readonly before: FullFileSnapshot;
  readonly after: FullFileSnapshot;
}

export class StructuredYamlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StructuredYamlError';
  }
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeDocument(document: Document): string {
  return document.toString({ lineWidth: 0 });
}

function parseSource(sourceText: string): Document.Parsed {
  const document = parseDocument(sourceText, { keepSourceTokens: true, prettyErrors: true });
  if (document.errors.length > 0) {
    throw new StructuredYamlError(`YAML is invalid: ${document.errors.map((error) => error.message).join('; ')}`);
  }
  if (document.warnings.length > 0) {
    throw new StructuredYamlError(`YAML warnings are not accepted: ${document.warnings.map((warning) => warning.message).join('; ')}`);
  }
  visit(document, (_key, node) => {
    if (isAlias(node)) throw new StructuredYamlError('YAML aliases are not accepted in candidate source.');
    if (typeof node === 'object' && node !== null && 'tag' in node && typeof node.tag === 'string') {
      throw new StructuredYamlError(`Explicit YAML tag ${node.tag} is not accepted in candidate source.`);
    }
  });
  return document;
}

function conceptId(document: Document.Parsed): string {
  const value = document.get('id');
  if (typeof value !== 'string' || value.length === 0) throw new StructuredYamlError('concept YAML needs a non-empty id.');
  return value;
}

function requireTargetConcept(document: Document.Parsed, expected: string): void {
  const actual = conceptId(document);
  if (actual !== expected) throw new StructuredYamlError(`operation targets concept "${expected}", but this file contains "${actual}".`);
}

function sequence(document: Document.Parsed, key: string, create: boolean): YAMLSeq {
  let node = document.get(key, true);
  if (node === undefined && create) {
    document.set(key, []);
    node = document.get(key, true);
  }
  if (!isSeq(node)) throw new StructuredYamlError(`${key} must be a YAML sequence.`);
  return node;
}

function scalarString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function sequenceStrings(node: YAMLSeq, key: string): string[] {
  return node.items.map((entry, index) => {
    const value = scalarString((entry as { toJSON?: () => unknown } | null)?.toJSON?.());
    if (value === undefined) throw new StructuredYamlError(`${key}[${index}] must be text.`);
    return value;
  });
}

function mapValue(map: YAMLMap, key: string): unknown {
  return map.get(key);
}

function anchorMap(node: YAMLSeq, locator: string): { readonly map: YAMLMap; readonly index: number } | undefined {
  const expectedIdentity = canonicalAnchorIdentity(locator);
  if (expectedIdentity === null) throw new StructuredYamlError(`anchor "${locator}" is not a resolvable canonical verse range.`);
  for (const [index, item] of node.items.entries()) {
    if (!isMap(item)) throw new StructuredYamlError(`anchors[${index}] must be a map.`);
    const actualLocator = mapValue(item, 'ref');
    if (typeof actualLocator !== 'string') throw new StructuredYamlError(`anchors[${index}].ref must be text.`);
    if (canonicalAnchorIdentity(actualLocator) === expectedIdentity) return { map: item, index };
  }
  return undefined;
}

function actualSources(map: YAMLMap): string[] {
  const node = map.get('sources', true);
  if (!isSeq(node)) throw new StructuredYamlError('anchor sources must be a sequence.');
  return sequenceStrings(node, 'anchor.sources');
}

function requireEditorialAnchor(map: YAMLMap, locator: string): void {
  const sources = actualSources(map);
  if (sources.length !== 1 || sources[0] !== 'editorial') {
    throw new StructuredYamlError(`anchor "${locator}" is source-derived (${sources.join(', ')}) and cannot be altered editorially.`);
  }
}

function addLexicon(document: Document.Parsed, operation: LexiconPhraseAdd): void {
  requireTargetConcept(document, operation.conceptId);
  const lexicon = sequence(document, 'lexicon', true);
  if (sequenceStrings(lexicon, 'lexicon').some((phrase) => canonicalPhraseIdentity(phrase) === canonicalPhraseIdentity(operation.phrase))) {
    throw new StructuredYamlError(`lexicon phrase "${operation.phrase}" already exists.`);
  }
  lexicon.add(operation.phrase);
}

function removeLexicon(document: Document.Parsed, operation: LexiconPhraseRemove): void {
  requireTargetConcept(document, operation.conceptId);
  if (operation.currentOwner !== 'editorial') {
    throw new StructuredYamlError(`${operation.currentOwner} lexicon rows must be changed at their source owner.`);
  }
  const lexicon = sequence(document, 'lexicon', false);
  const index = sequenceStrings(lexicon, 'lexicon').findIndex((phrase) => canonicalPhraseIdentity(phrase) === canonicalPhraseIdentity(operation.phrase));
  if (index < 0) throw new StructuredYamlError(`lexicon phrase "${operation.phrase}" does not exist.`);
  lexicon.items.splice(index, 1);
}

function addAnchor(document: Document.Parsed, operation: EditorialAnchorAdd): void {
  requireTargetConcept(document, operation.conceptId);
  const anchors = sequence(document, 'anchors', true);
  if (anchorMap(anchors, operation.anchor.locator) !== undefined) {
    throw new StructuredYamlError(`anchor "${operation.anchor.locator}" already exists.`);
  }
  anchors.add(document.createNode({ ref: operation.anchor.locator, sources: ['editorial'], weight: operation.anchor.weight }));
}

function removeAnchor(document: Document.Parsed, operation: EditorialAnchorRemove): void {
  requireTargetConcept(document, operation.conceptId);
  const anchors = sequence(document, 'anchors', false);
  const found = anchorMap(anchors, operation.locator);
  if (found === undefined) throw new StructuredYamlError(`anchor "${operation.locator}" does not exist.`);
  requireEditorialAnchor(found.map, operation.locator);
  anchors.items.splice(found.index, 1);
}

function adjustAnchor(document: Document.Parsed, operation: EditorialAnchorAdjust): void {
  requireTargetConcept(document, operation.conceptId);
  const anchors = sequence(document, 'anchors', false);
  const found = anchorMap(anchors, operation.current.locator);
  if (found === undefined) throw new StructuredYamlError(`anchor "${operation.current.locator}" does not exist.`);
  requireEditorialAnchor(found.map, operation.current.locator);
  const declaredWeight = mapValue(found.map, 'weight');
  const weight = declaredWeight === undefined ? 1 : declaredWeight;
  if (weight !== operation.current.weight) {
    throw new StructuredYamlError(`anchor "${operation.current.locator}" weight changed from the reviewed precondition.`);
  }
  if (canonicalAnchorIdentity(operation.next.locator) !== canonicalAnchorIdentity(operation.current.locator)
      && anchorMap(anchors, operation.next.locator) !== undefined) {
    throw new StructuredYamlError(`anchor "${operation.next.locator}" already exists.`);
  }
  found.map.set('ref', operation.next.locator);
  found.map.set('weight', operation.next.weight);
}

function relatedEdit(document: Document.Parsed, operation: RelatedConceptAdd | RelatedConceptRemove): void {
  requireTargetConcept(document, operation.conceptId);
  if (operation.conceptId === operation.relatedConceptId) throw new StructuredYamlError('a concept cannot be related to itself.');
  const related = sequence(document, 'related', operation.type === 'related-concept-add');
  const values = sequenceStrings(related, 'related');
  const index = values.indexOf(operation.relatedConceptId);
  if (operation.type === 'related-concept-add') {
    if (index >= 0) throw new StructuredYamlError(`related edge to "${operation.relatedConceptId}" already exists.`);
    related.add(operation.relatedConceptId);
  } else {
    if (index < 0) throw new StructuredYamlError(`related edge to "${operation.relatedConceptId}" does not exist.`);
    related.items.splice(index, 1);
  }
}

function draftDocument(draft: ConceptDraft): Document {
  const document = new Document();
  document.contents = document.createNode({
    id: draft.id,
    label: draft.label,
    lexicon: [...draft.lexicon],
    anchors: draft.anchors.map((anchor) => ({ ref: anchor.locator, sources: ['editorial'], weight: anchor.weight })),
    ...(draft.related.length === 0 ? {} : { related: [...draft.related] }),
  });
  return document;
}

function applyExistingOperation(document: Document.Parsed, operation: StructuredConceptOperation): void {
  switch (operation.type) {
    case 'lexicon-phrase-add': return addLexicon(document, operation);
    case 'lexicon-phrase-remove': return removeLexicon(document, operation);
    case 'editorial-anchor-add': return addAnchor(document, operation);
    case 'editorial-anchor-remove': return removeAnchor(document, operation);
    case 'editorial-anchor-adjust': return adjustAnchor(document, operation);
    case 'related-concept-add':
    case 'related-concept-remove': return relatedEdit(document, operation);
    case 'concept-draft-create':
    case 'concept-drafts-merge': throw new StructuredYamlError('draft operations create a complete concept file and do not mutate an existing document.');
  }
}

export function isStructuredConceptOperation(operation: ProposalOperation): operation is StructuredConceptOperation {
  return operation.type !== 'golden-fixture-upsert' && operation.type !== 'fixture-corpus-chapter-add';
}

/**
 * Produces a hash-bound, normalized full-file preview. It never writes. Existing
 * files are edited through YAML Document nodes so untouched comments and fields survive.
 */
export function previewStructuredYamlEdit(
  sourcePath: string,
  sourceText: string,
  expectedSourceSha256: string,
  operation: StructuredConceptOperation,
): StructuredYamlDiff {
  const sourceSha256 = sha256(sourceText);
  if (sourceSha256 !== expectedSourceSha256) {
    throw new StructuredYamlError(`source precondition failed for ${sourcePath}: expected ${expectedSourceSha256}, found ${sourceSha256}.`);
  }
  let beforeText = '';
  let afterDocument: Document;
  if (operation.type === 'concept-draft-create' || operation.type === 'concept-drafts-merge') {
    if (sourceText !== '') throw new StructuredYamlError('a concept draft target must not already contain source text.');
    const draft = operation.type === 'concept-draft-create' ? operation.draft : operation.reviewedConcept;
    afterDocument = draftDocument(draft);
  } else {
    const parsed = parseSource(sourceText);
    beforeText = normalizeDocument(parsed);
    applyExistingOperation(parsed, operation);
    afterDocument = parsed;
  }
  const afterText = normalizeDocument(afterDocument);
  return {
    schemaVersion: 1,
    path: sourcePath,
    sourceSha256,
    operationId: operation.operationId,
    changed: beforeText !== afterText,
    before: { text: beforeText, sha256: sha256(beforeText) },
    after: { text: afterText, sha256: sha256(afterText) },
  };
}

/** Defensive helper for callers handling the full proposal union. */
export function requireStructuredConceptOperation(operation: ProposalOperation): StructuredConceptOperation {
  if (!isStructuredConceptOperation(operation)) {
    throw new ProposalValidationError([{
      code: 'schema',
      path: 'operation.type',
      message: `${operation.type} is JSON-owned and cannot be applied by the YAML editor.`,
    }]);
  }
  return operation;
}
