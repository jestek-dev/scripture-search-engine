import type { ProposalOperationType } from './proposals.js';

export const ENGINEERING_AREAS = ['tokenizer', 'ranking', 'budget', 'schema', 'engine-code', 'normalization'] as const;
export type EngineeringArea = (typeof ENGINEERING_AREAS)[number];

export interface DiagnosticEvidence {
  readonly kind: string;
  readonly detail: string;
  readonly subjectIds: readonly string[];
}

export interface DiagnosticCase {
  readonly caseId: string;
  readonly fixtureId: string;
  readonly query: string;
  readonly judgment: 'missing' | 'irrelevant';
  readonly diagnosis?: 'wrong-anchor' | 'concept-misfire' | 'lexical-noise';
  readonly matchedConceptIds: readonly string[];
  readonly targetAnchoredConceptIds: readonly string[];
  readonly neighboringConceptIds: readonly string[];
  readonly triggeredPhrases: readonly { readonly conceptId: string; readonly phrase: string }[];
  readonly reasonFamilies: readonly string[];
  readonly engineArea?: EngineeringArea;
  readonly normalizationOwner?: { readonly path: string; readonly entry: string };
  readonly evidence: readonly DiagnosticEvidence[];
}

export type DiagnosticConfidence = 'low' | 'medium';

export interface OntologySuggestion {
  readonly kind: 'ontology-suggestion';
  readonly caseId: string;
  readonly fixtureId: string;
  readonly operationFamilies: readonly ProposalOperationType[];
  readonly inspectConceptIds: readonly string[];
  readonly evidence: readonly DiagnosticEvidence[];
  readonly confidence: DiagnosticConfidence;
  readonly confidenceLanguage: string;
  readonly ambiguityLanguage: string;
  readonly rationale: string;
}

export interface EngineeringBrief {
  readonly kind: 'engineering-brief';
  readonly area: EngineeringArea;
  readonly caseIds: readonly string[];
  readonly fixtureIds: readonly string[];
  readonly queries: readonly string[];
  readonly evidence: readonly DiagnosticEvidence[];
  readonly confidence: DiagnosticConfidence;
  readonly confidenceLanguage: string;
  readonly ambiguityLanguage: string;
  readonly summary: string;
  readonly reproducingFixtures: readonly { readonly fixtureId: string; readonly caseId: string; readonly query: string }[];
}

export type DiagnosticRoute = OntologySuggestion | EngineeringBrief;

export class DiagnosticValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiagnosticValidationError';
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DIAGNOSTIC_FIELDS = new Set([
  'caseId', 'fixtureId', 'query', 'judgment', 'diagnosis', 'matchedConceptIds', 'targetAnchoredConceptIds',
  'neighboringConceptIds', 'triggeredPhrases', 'reasonFamilies', 'engineArea', 'normalizationOwner', 'evidence',
]);
const REQUIRED_DIAGNOSTIC_FIELDS = [
  'caseId', 'fixtureId', 'query', 'judgment', 'matchedConceptIds', 'targetAnchoredConceptIds',
  'neighboringConceptIds', 'triggeredPhrases', 'reasonFamilies', 'evidence',
] as const;

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function normalizeEvidence(values: readonly DiagnosticEvidence[]): DiagnosticEvidence[] {
  return values
    .map((entry) => ({ ...entry, subjectIds: sortedUnique(entry.subjectIds) }))
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.detail.localeCompare(b.detail) || a.subjectIds.join('|').localeCompare(b.subjectIds.join('|')));
}

function requireCanonicalText(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() !== value || value.length === 0) {
    throw new DiagnosticValidationError(`${path} must be canonical non-empty text.`);
  }
}

function validateCase(input: DiagnosticCase): DiagnosticCase {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new DiagnosticValidationError('diagnostic case must be an object.');
  }
  for (const key of Object.keys(input).sort()) {
    if (!DIAGNOSTIC_FIELDS.has(key)) throw new DiagnosticValidationError(`diagnostic case has unknown field "${key}".`);
  }
  for (const key of REQUIRED_DIAGNOSTIC_FIELDS) {
    if (!Object.hasOwn(input, key)) throw new DiagnosticValidationError(`diagnostic case is missing required field "${key}".`);
  }
  for (const [path, value] of [
    ['matchedConceptIds', input.matchedConceptIds],
    ['targetAnchoredConceptIds', input.targetAnchoredConceptIds],
    ['neighboringConceptIds', input.neighboringConceptIds],
    ['triggeredPhrases', input.triggeredPhrases],
    ['reasonFamilies', input.reasonFamilies],
    ['evidence', input.evidence],
  ] as const) {
    if (!Array.isArray(value)) throw new DiagnosticValidationError(`${path} must be an array.`);
  }
  if (!UUID_PATTERN.test(input.caseId)) throw new DiagnosticValidationError('caseId must be a UUID.');
  if (!ID_PATTERN.test(input.fixtureId)) throw new DiagnosticValidationError('fixtureId must be a lowercase kebab-case id.');
  requireCanonicalText(input.query, 'query');
  if (input.judgment !== 'missing' && input.judgment !== 'irrelevant') {
    throw new DiagnosticValidationError('judgment must be missing or irrelevant.');
  }
  if (input.judgment === 'irrelevant' && !['wrong-anchor', 'concept-misfire', 'lexical-noise'].includes(String(input.diagnosis))) {
    throw new DiagnosticValidationError('irrelevant diagnostics require a diagnosis from the supported set.');
  }
  if (input.judgment === 'missing' && input.diagnosis !== undefined) {
    throw new DiagnosticValidationError('diagnosis belongs to irrelevant diagnostics only.');
  }
  if (input.engineArea !== undefined && !(ENGINEERING_AREAS as readonly string[]).includes(input.engineArea)) {
    throw new DiagnosticValidationError('engineArea is unsupported.');
  }
  if (input.normalizationOwner !== undefined) {
    if (typeof input.normalizationOwner !== 'object' || input.normalizationOwner === null || Array.isArray(input.normalizationOwner)) {
      throw new DiagnosticValidationError('normalizationOwner must be an object.');
    }
    if (!Object.hasOwn(input.normalizationOwner, 'path') || !Object.hasOwn(input.normalizationOwner, 'entry')) {
      throw new DiagnosticValidationError('normalizationOwner requires path and entry.');
    }
    for (const key of Object.keys(input.normalizationOwner).sort()) {
      if (key !== 'path' && key !== 'entry') throw new DiagnosticValidationError(`normalizationOwner has unknown field "${key}".`);
    }
    requireCanonicalText(input.normalizationOwner.path, 'normalizationOwner.path');
    requireCanonicalText(input.normalizationOwner.entry, 'normalizationOwner.entry');
  }
  if (!Array.isArray(input.evidence) || input.evidence.length === 0) {
    throw new DiagnosticValidationError('evidence must be a non-empty array.');
  }
  for (const [index, evidence] of input.evidence.entries()) {
    if (typeof evidence !== 'object' || evidence === null || Array.isArray(evidence)) {
      throw new DiagnosticValidationError(`evidence[${index}] must be an object.`);
    }
    for (const key of Object.keys(evidence).sort()) {
      if (key !== 'kind' && key !== 'detail' && key !== 'subjectIds') {
        throw new DiagnosticValidationError(`evidence[${index}] has unknown field "${key}".`);
      }
    }
    if (!Object.hasOwn(evidence, 'kind') || !Object.hasOwn(evidence, 'detail') || !Object.hasOwn(evidence, 'subjectIds')) {
      throw new DiagnosticValidationError(`evidence[${index}] requires kind, detail, and subjectIds.`);
    }
    requireCanonicalText(evidence.kind, `evidence[${index}].kind`);
    requireCanonicalText(evidence.detail, `evidence[${index}].detail`);
    if (!Array.isArray(evidence.subjectIds) || evidence.subjectIds.some((entry: unknown) => typeof entry !== 'string' || entry.length === 0)) {
      throw new DiagnosticValidationError(`evidence[${index}].subjectIds must be an array of non-empty strings.`);
    }
  }
  for (const [path, values] of [
    ['matchedConceptIds', input.matchedConceptIds],
    ['targetAnchoredConceptIds', input.targetAnchoredConceptIds],
    ['neighboringConceptIds', input.neighboringConceptIds],
  ] as const) {
    for (const value of values) {
      if (typeof value !== 'string' || !ID_PATTERN.test(value)) throw new DiagnosticValidationError(`${path} contains an invalid concept id.`);
    }
  }
  for (const [index, entry] of input.triggeredPhrases.entries()) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new DiagnosticValidationError(`triggeredPhrases[${index}] must be an object.`);
    }
    for (const key of Object.keys(entry).sort()) {
      if (key !== 'conceptId' && key !== 'phrase') throw new DiagnosticValidationError(`triggeredPhrases[${index}] has unknown field "${key}".`);
    }
    if (!Object.hasOwn(entry, 'conceptId') || !Object.hasOwn(entry, 'phrase')) {
      throw new DiagnosticValidationError(`triggeredPhrases[${index}] requires conceptId and phrase.`);
    }
    if (typeof entry.conceptId !== 'string' || !ID_PATTERN.test(entry.conceptId)) throw new DiagnosticValidationError(`triggeredPhrases[${index}].conceptId is invalid.`);
    requireCanonicalText(entry.phrase, `triggeredPhrases[${index}].phrase`);
  }
  input.reasonFamilies.forEach((family, index) => requireCanonicalText(family, `reasonFamilies[${index}]`));
  return {
    ...input,
    caseId: input.caseId.toLowerCase(),
    matchedConceptIds: sortedUnique(input.matchedConceptIds),
    targetAnchoredConceptIds: sortedUnique(input.targetAnchoredConceptIds),
    neighboringConceptIds: sortedUnique(input.neighboringConceptIds),
    triggeredPhrases: [...input.triggeredPhrases].sort((a, b) => a.conceptId.localeCompare(b.conceptId) || a.phrase.localeCompare(b.phrase)),
    reasonFamilies: sortedUnique(input.reasonFamilies),
    evidence: normalizeEvidence(input.evidence),
  };
}

function confidenceLanguage(confidence: DiagnosticConfidence): string {
  return confidence === 'medium'
    ? 'Moderate diagnostic confidence: the evidence identifies a source area to inspect, but it does not prove the proposed operation will fix ranking.'
    : 'Low diagnostic confidence: this is a review starting point, not a claimed fix.';
}

const ONTOLOGY_AMBIGUITY = 'Ambiguity remains until a reviewer checks competing concepts, source ownership, textual fit, and candidate regressions.';
const ENGINEERING_AMBIGUITY = 'The reproducing fixture localizes the symptom, but tokenizer, normalization, budgets, and ranking can interact; implementation must be established by engineering tests.';

function suggestion(
  input: DiagnosticCase,
  operationFamilies: readonly ProposalOperationType[],
  conceptIds: readonly string[],
  confidence: DiagnosticConfidence,
  rationale: string,
): OntologySuggestion {
  return {
    kind: 'ontology-suggestion',
    caseId: input.caseId,
    fixtureId: input.fixtureId,
    operationFamilies: [...operationFamilies],
    inspectConceptIds: sortedUnique(conceptIds),
    evidence: normalizeEvidence(input.evidence),
    confidence,
    confidenceLanguage: confidenceLanguage(confidence),
    ambiguityLanguage: ONTOLOGY_AMBIGUITY,
    rationale,
  };
}

function inferredEngineeringArea(input: DiagnosticCase): EngineeringArea | undefined {
  if (input.engineArea !== undefined) return input.engineArea;
  if (input.judgment === 'irrelevant' && input.diagnosis === 'lexical-noise') {
    return input.normalizationOwner === undefined ? 'tokenizer' : 'normalization';
  }
  return undefined;
}

function briefFor(area: EngineeringArea, cases: readonly DiagnosticCase[]): EngineeringBrief {
  const ordered = [...cases].sort((a, b) => a.fixtureId.localeCompare(b.fixtureId) || a.caseId.localeCompare(b.caseId));
  const ownerEvidence: DiagnosticEvidence[] = ordered.flatMap((entry) => entry.normalizationOwner === undefined ? [] : [{
    kind: 'normalization-owner',
    detail: `Existing normalization entry "${entry.normalizationOwner.entry}" is owned by ${entry.normalizationOwner.path}.`,
    subjectIds: [entry.normalizationOwner.path],
  }]);
  return {
    kind: 'engineering-brief',
    area,
    caseIds: ordered.map((entry) => entry.caseId),
    fixtureIds: sortedUnique(ordered.map((entry) => entry.fixtureId)),
    queries: sortedUnique(ordered.map((entry) => entry.query)),
    evidence: normalizeEvidence([...ordered.flatMap((entry) => entry.evidence), ...ownerEvidence]),
    confidence: 'low',
    confidenceLanguage: confidenceLanguage('low'),
    ambiguityLanguage: ENGINEERING_AMBIGUITY,
    summary: `Needs engineering in ${area}; no ontology mutation is suggested because the observed behavior is engine-owned.`,
    reproducingFixtures: ordered.map((entry) => ({ fixtureId: entry.fixtureId, caseId: entry.caseId, query: entry.query })),
  };
}

function ontologyRoute(input: DiagnosticCase): OntologySuggestion {
  if (input.judgment === 'missing') {
    if (input.matchedConceptIds.length > 0) {
      return suggestion(
        input,
        ['editorial-anchor-add', 'editorial-anchor-adjust'],
        input.matchedConceptIds,
        'medium',
        'The query already matched a concept, so inspect that concept\'s anchors and provenance before considering an editorial anchor change.',
      );
    }
    if (input.targetAnchoredConceptIds.length > 0) {
      return suggestion(
        input,
        ['lexicon-phrase-add'],
        input.targetAnchoredConceptIds,
        'medium',
        'The expected passage is already anchored, so inspect whether an editorial phrase can truthfully connect this wording to the existing concept.',
      );
    }
    if (input.neighboringConceptIds.length > 0) {
      return suggestion(
        input,
        ['lexicon-phrase-add', 'editorial-anchor-add', 'concept-draft-create'],
        input.neighboringConceptIds,
        'low',
        'Neither an existing match nor anchor explains the gap; review neighboring concepts and collisions before extending one or drafting a concept.',
      );
    }
    return suggestion(
      input,
      ['concept-draft-create'],
      [],
      'low',
      'No existing concept or anchor explains the expected passage, so a collision-reviewed concept draft is the only ontology starting point.',
    );
  }

  if (input.diagnosis === 'wrong-anchor') {
    return suggestion(
      input,
      ['editorial-anchor-remove', 'editorial-anchor-adjust'],
      sortedUnique([...input.matchedConceptIds, ...input.targetAnchoredConceptIds]),
      'medium',
      'The concept does not fit the verse; inspect the exact anchor locator, range, weight, and ownership before changing an editorial anchor.',
    );
  }
  return suggestion(
    input,
    ['lexicon-phrase-remove'],
    sortedUnique([...input.matchedConceptIds, ...input.triggeredPhrases.map((entry) => entry.conceptId)]),
    'medium',
    'The query should not trigger the concept; inspect the matched phrase and competing concepts before narrowing editorial lexicon coverage.',
  );
}

/** Routes fixed evidence deterministically, grouping engine-owned failures into briefs. */
export function routeDiagnostics(inputs: readonly DiagnosticCase[]): readonly DiagnosticRoute[] {
  const cases = inputs.map(validateCase).sort((a, b) => a.caseId.localeCompare(b.caseId));
  const seen = new Set<string>();
  for (const input of cases) {
    if (seen.has(input.caseId)) throw new DiagnosticValidationError(`duplicate caseId ${input.caseId}.`);
    seen.add(input.caseId);
  }
  const engineering = new Map<EngineeringArea, DiagnosticCase[]>();
  const suggestions: OntologySuggestion[] = [];
  for (const input of cases) {
    const area = inferredEngineeringArea(input);
    if (area !== undefined) engineering.set(area, [...(engineering.get(area) ?? []), input]);
    else suggestions.push(ontologyRoute(input));
  }
  const briefs = [...engineering.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([area, grouped]) => briefFor(area, grouped));
  return [...suggestions, ...briefs].sort((a, b) => {
    const aKey = a.kind === 'ontology-suggestion' ? `0|${a.caseId}` : `1|${a.area}`;
    const bKey = b.kind === 'ontology-suggestion' ? `0|${b.caseId}` : `1|${b.area}`;
    return aKey.localeCompare(bKey);
  });
}
