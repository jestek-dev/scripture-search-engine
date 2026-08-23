/**
 * INTERNAL surface of @jestek-dev/scripture-engine (plan P7.2 / CO-5).
 *
 * Everything exported here is implementation detail: the repo's own pipeline,
 * eval harness and workbench import it (one tokenizer, shared constants, the
 * G6 reviewed-constants mirror), and it is published so those tools and
 * white-box diagnostics can reach it — but it carries NO stability promise.
 * Names here may move, change shape, or disappear in any version without a
 * major bump and without a §5 consumer-contract review. Consumers pin the
 * PUBLIC entry (`@jestek-dev/scripture-engine`): the five methods, the result
 * types, and the `corrections`/`suggestion` fields — that surface is the
 * contract (docs/COMPATIBILITY.md), this one is not.
 *
 * The internal entry is a strict superset: it re-exports the public tier too,
 * so a tool that needs one internal symbol does not need two import
 * specifiers. The public entry stays the compatibility boundary; the exact
 * public surface is pinned by eval/test/public-surface.test.ts.
 */

export * from './index.js';

export {
  collapseAnchorRuns,
  collapseRuns,
  type GroupingSpanInfo,
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
  type ResolvedBook,
  type ResolvedReference,
} from './reference/reference.js';

export { makeVerseId, parseVerseId, type VerseLocation } from './reference/verseId.js';

export { AUTHORITATIVE_FAMILIES, isAuthoritative } from './reasons/types.js';

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
} from './ranking/budgets.js';

export {
  DEFAULT_LIMIT,
  DEFAULT_MAX_PER_GROUP,
  rank,
  type Candidate,
  type RankedResult,
} from './ranking/rank.js';
