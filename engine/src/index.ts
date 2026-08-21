/**
 * Public API for @jestek-dev/scripture-engine.
 *
 * Phase 0 exports the pure core that later phases build on: the shared
 * tokenizer, the reference parser, the typed reason vocabulary, the signal
 * budgets, and the deterministic ranker. The intent ladder (Phase 1) and the
 * concept layer (Phase 2) attach to these without changing their contracts.
 */

export { ENGINE_VERSION, TOKENIZER_VERSION } from './config/engineVersion.js';

export {
  collapseAnchorRuns,
  createEngine,
  type EngineOptions,
  type ScriptureEngine,
} from './createEngine.js';

export {
  CorpusRepository,
  MAX_CANDIDATES,
  MAX_PHRASE_LENGTH,
  type CorpusMeta,
  type PhraseMatch,
  type TokenMatch,
} from './corpus/repository.js';

export {
  EXACT_PHRASE_FULL_AUTHORITY_WORDS,
  groupIdFor,
  mergeCandidates,
  phraseEvidence,
  queryIdfTotal,
  referenceLabel,
  subsumeCompletePhraseRestatements,
  targetIdFor,
  tokenEvidence,
} from './intents/lexical.js';

export { PASSAGE_TERM_PMI_HALF_SATURATION, sourceLabel } from './intents/concept.js';

export {
  normalizeToken,
  significantWords,
  tokenStream,
  TOKENIZER_ARCHAIC_FORM_COUNT,
  TOKENIZER_STOPWORD_COUNT,
} from './tokenizer/index.js';

export {
  normalizeBookAlias,
  resolveReference,
  resolveReferenceAttempt,
  type ReferenceResolutionAttempt,
  type ReferenceResolver,
  type ResolvedBook,
  type ResolvedReference,
} from './reference/reference.js';

export { makeVerseId, parseVerseId, type VerseLocation } from './reference/verseId.js';

export {
  AUTHORITATIVE_FAMILIES,
  isAuthoritative,
  type Evidence,
  type Provenance,
  type Reason,
  type SignalFamily,
} from './reasons/types.js';

export {
  applyBudgets,
  DEFAULT_BUDGETS,
  type BudgetedScore,
  type FamilyBudget,
  type SignalBudgets,
} from './ranking/budgets.js';

export {
  DEFAULT_LIMIT,
  DEFAULT_MAX_PER_GROUP,
  rank,
  type Candidate,
  type RankedResult,
  type RankOptions,
} from './ranking/rank.js';

export type {
  ConceptMatch,
  PassageResult,
  RelatedResult,
  SongInput,
  ContentQueryPort,
  ContentQueryResult,
  ContentScalar,
  DiscoveryResult,
  ResearchOutcome,
  ResearchResult,
  ResultIdentity,
  ScripturePassage,
  ScriptureVerse,
} from './types.js';
