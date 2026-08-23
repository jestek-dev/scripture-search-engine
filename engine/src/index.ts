/**
 * PUBLIC API for @jestek-dev/scripture-engine — the stable tier consumers
 * pin (plan P7.2 / CO-5; docs/COMPATIBILITY.md is the compatibility matrix).
 *
 * This entry is deliberately small: `createEngine` over a `ContentQueryPort`,
 * the five methods on `ScriptureEngine` (`research`, `themes`, `passage`,
 * `related`, `forSong`), the result types they return — including the
 * additive `suggestion` (0.11.0) and `corrections` (0.12.0) citation fields
 * and the `verses`/`grouping` fields (0.14.0) — and the version constants.
 * Invalid input is a typed kind, never an exception (§5 of
 * docs/implementation-plan.md, restated in docs/COMPATIBILITY.md).
 *
 * Everything else — the tokenizer, the ranker, repository internals, the
 * reviewed constants eval mirrors — lives behind
 * `@jestek-dev/scripture-engine/internal` and carries no stability promise.
 * The exact public surface is pinned by eval/test/public-surface.test.ts;
 * widening it is a §5 consumer-contract change, not a convenience edit.
 */

export { ENGINE_VERSION, TOKENIZER_VERSION } from './config/engineVersion.js';

export { createEngine, type EngineOptions, type ScriptureEngine } from './createEngine.js';

// Types reachable from the five methods' signatures and results. `Reason` is
// the chip every result carries; `ReferenceSuggestion` is the shape of the
// `suggestion` field; `RankOptions`/`SignalBudgets`/`FamilyBudget` close the
// `EngineOptions` type. Type-only: none of these add runtime surface.
export type { Evidence, Provenance, Reason, SignalFamily } from './reasons/types.js';
export type { ReferenceSuggestion } from './reference/reference.js';
export type { FamilyBudget, SignalBudgets } from './ranking/budgets.js';
export type { RankOptions } from './ranking/rank.js';

export type {
  ConceptMatch,
  ContentQueryPort,
  ContentQueryResult,
  ContentScalar,
  DiscoveryResult,
  GroupedVerse,
  PassageResult,
  RelatedResult,
  ResearchOutcome,
  ResearchResult,
  ResultGrouping,
  ResultIdentity,
  ScripturePassage,
  ScriptureVerse,
  SongInput,
  SpellingCorrection,
} from './types.js';
