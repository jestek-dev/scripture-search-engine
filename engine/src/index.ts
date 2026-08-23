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
  collapseRuns,
  createEngine,
  type EngineOptions,
  type GroupingSpanInfo,
  type ScriptureEngine,
} from './createEngine.js';

export {
  CorpusRepository,
  MAX_CANDIDATES,
  MAX_PHRASE_LENGTH,
  type CorpusMeta,
  type CrossReferencePhraseRow,
  type CuratedAliasRow,
  type PericopeRow,
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

export {
  aliasConceptEvidence,
  aliasPassageEvidence,
  dedupeConceptAnchors,
  PASSAGE_TERM_PMI_HALF_SATURATION,
  sourceLabel,
} from './intents/concept.js';

export {
  deleteVariants,
  dictionaryDeleteDepth,
  pickCorrection,
  SPELLING_EDIT1_MAX_TOKEN_LENGTH,
  SPELLING_MIN_TOKEN_LENGTH,
  spellingEditBudget,
  type PickedCorrection,
  type SpellingCandidate,
} from './intents/spelling.js';

export {
  normalizedPhrase,
  normalizeToken,
  significantWords,
  significantWordsWithSurface,
  tokenStream,
  TOKENIZER_ARCHAIC_FORM_COUNT,
  TOKENIZER_STOPWORD_COUNT,
} from './tokenizer/index.js';

export {
  damerauLevenshtein,
  editDistanceBudget,
  normalizeBookAlias,
  resolveReference,
  resolveReferenceAttempt,
  SUGGESTION_EDIT1_MAX_KEY_LENGTH,
  SUGGESTION_MIN_KEY_LENGTH,
  type BookAliasEntry,
  type ReferenceResolutionAttempt,
  type ReferenceResolver,
  type ReferenceSuggestion,
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
  CHIP_DISPLAY_MIN_POINTS,
  PASSAGE_TERM_CHIP_DISPLAY_FLOOR,
  correctionCitation,
  pinCorrectionCitations,
  polishChipsForDisplay,
} from './reasons/display.js';

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
  GroupedVerse,
  ResearchOutcome,
  ResearchResult,
  ResultGrouping,
  ResultIdentity,
  ScripturePassage,
  ScriptureVerse,
  SpellingCorrection,
} from './types.js';
