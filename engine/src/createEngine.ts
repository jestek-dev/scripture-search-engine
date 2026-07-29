/**
 * The orchestrator — the only place in the engine that does I/O, and it does
 * it through `ContentQueryPort` alone.
 *
 * Intent order follows the 2026-07-20 plan exactly:
 *   1. explicit reference lookup
 *   2. exact normalized phrase
 *   3. distinctive tokens with proximity preference
 *   4. conservative normalization (inflection + archaic forms)
 * Curated expansion (concepts, cross-references) attaches at step 5 in Phase
 * 2 without changing anything above it.
 */

import {
  ConceptRepository,
  CorpusRepository,
  searchLongestFragment,
} from './corpus/repository.js';
import { ENGINE_VERSION, TOKENIZER_VERSION } from './config/engineVersion.js';
import {
  mergeCandidates,
  phraseEvidence,
  queryIdfTotal,
  referenceLabel,
  significantWords,
  targetIdFor,
  tokenEvidence,
} from './intents/lexical.js';
import {
  conceptAnchorEvidence,
  crossReferenceEvidence,
  passageTermEvidence,
  relatedConceptEvidence,
} from './intents/concept.js';
import { rank, type RankOptions } from './ranking/rank.js';
import type { ContentQueryPort, DiscoveryResult, ResearchResult, ScriptureVerse } from './types.js';

export interface EngineOptions {
  /**
   * Throw if the artifact was tokenized by a different tokenizer version.
   * Defaults true, and should stay true outside diagnostics: precomputed
   * postings from another tokenizer describe a vocabulary this runtime
   * cannot reproduce, which yields quietly wrong rankings rather than errors.
   */
  readonly enforceTokenizerVersion?: boolean;
  readonly rankOptions?: RankOptions;
}

export interface ScriptureEngine {
  research(query: string): Promise<ResearchResult>;
  close(): Promise<void>;
  readonly corpusFingerprint: string;
  readonly engineVersion: string;
}

const SUPPORTED_SCHEMA_VERSIONS = new Set(['1', '2', '3']);

export async function createEngine(
  database: ContentQueryPort,
  options: EngineOptions = {},
): Promise<ScriptureEngine> {
  const repository = new CorpusRepository(database);
  const meta = await repository.readMeta();

  if (!SUPPORTED_SCHEMA_VERSIONS.has(meta.schemaVersion)) {
    throw new Error(
      `createEngine: artifact schema v${meta.schemaVersion} is not supported by ` +
        `engine ${ENGINE_VERSION} (supports v${[...SUPPORTED_SCHEMA_VERSIONS].join(', v')})`,
    );
  }
  if ((options.enforceTokenizerVersion ?? true) && meta.tokenizerVersion !== TOKENIZER_VERSION) {
    throw new Error(
      `createEngine: artifact was tokenized by tokenizer ${meta.tokenizerVersion} but this ` +
        `engine uses ${TOKENIZER_VERSION}. Precomputed token postings would describe a ` +
        `vocabulary this runtime cannot reproduce. Rebuild the artifact.`,
    );
  }

  // The concept layer is optional: a v1 artifact has no concept tables, and
  // the engine still works as a lexical search rather than refusing to open.
  const conceptRepository = new ConceptRepository(database);
  const concepts = (await conceptRepository.hasConceptLayer()) ? conceptRepository : null;

  const hasPassageTerms = await conceptRepository.hasPassageTerms();
  const documentCount = await repository.documentCount();
  const identity = { engineVersion: ENGINE_VERSION, corpusFingerprint: meta.corpusFingerprint };

  async function discover(query: string): Promise<readonly DiscoveryResult[]> {
    const verses = new Map<string, ScriptureVerse>();
    const contributions: { verse: ScriptureVerse; evidence: ReturnType<typeof tokenEvidence> }[] =
      [];

    // Step 2 — verbatim text. Tries the whole query first and falls back to
    // its longest matching fragment, so a paraphrase still gets credit for
    // the part the user quoted exactly. Only for multi-word queries: a single
    // word "matching a phrase" is the token intent wearing an authoritative
    // badge it has not earned.
    if (query.trim().includes(' ')) {
      const whole = await repository.searchPhrase(query);
      const queryWords = query.trim().split(/\s+/).filter(Boolean).length;
      if (whole.length > 0) {
        for (const match of whole) {
          verses.set(targetIdFor(match), match);
          contributions.push({
            verse: match,
            evidence: [phraseEvidence(query.trim(), queryWords, queryWords)],
          });
        }
      } else {
        const fragment = await searchLongestFragment(repository, query);
        if (fragment) {
          for (const match of fragment.matches) {
            verses.set(targetIdFor(match), match);
            contributions.push({
              verse: match,
              evidence: [
                phraseEvidence(fragment.fragment, fragment.fragmentWords, fragment.queryWords),
              ],
            });
          }
        }
      }
    }

    // Steps 3-4 — tokens with proximity. Normalization is inherent: the
    // shared tokenizer folds inflection and archaic forms on both sides.
    const tokens = significantWords(query);
    if (tokens.length > 0) {
      const frequencies = await repository.tokenDocumentCounts(tokens);
      const idfTotal = queryIdfTotal(tokens, frequencies, documentCount);
      for (const match of await repository.searchTokens(tokens, documentCount)) {
        verses.set(targetIdFor(match), match);
        contributions.push({ verse: match, evidence: tokenEvidence(match, idfTotal) });
      }
    }

    // Step 5a — homiletical vocabulary. Weak by design and weak by budget.
    if (hasPassageTerms && tokens.length > 0) {
      for (const match of await conceptRepository.searchPassageTerms(tokens)) {
        verses.set(targetIdFor(match), match);
        contributions.push({ verse: match, evidence: [passageTermEvidence(match)] });
      }
    }

    // Step 5 — curated concept expansion. This is the step that can find a
    // passage sharing NO vocabulary with the query, because a human recorded
    // that it belongs. Everything above it is untouched by its presence.
    if (concepts && tokens.length > 0) {
      const matched = await concepts.matchConcepts(tokens);
      if (matched.length > 0) {
        const specificity = new Map(
          matched.map((match) => [match.conceptId, match.matchedTokenCount]),
        );
        const anchors = await concepts.anchorVerses(matched.map((match) => match.conceptId));
        for (const anchor of anchors) {
          verses.set(targetIdFor(anchor), anchor);
          contributions.push({
            verse: anchor,
            evidence: [
              conceptAnchorEvidence(anchor, specificity.get(anchor.conceptId) ?? 1),
            ],
          });
        }

        // One hop through the curated graph, filed as weak evidence.
        const relatedIds = await concepts.relatedConcepts(
          matched.map((match) => match.conceptId),
        );
        for (const anchor of await concepts.anchorVerses(relatedIds)) {
          verses.set(targetIdFor(anchor), anchor);
          contributions.push({ verse: anchor, evidence: [relatedConceptEvidence(anchor)] });
        }

        // Cross-reference expansion seeded ONLY from concept anchors, never
        // from arbitrary lexical hits. Seeding from weak matches is how a
        // curated graph turns into a random walk.
        const seeds = [...new Set(anchors.map((anchor) => anchor.verseId))].sort(
          (a, b) => a - b,
        );
        const seedLabels = new Map(anchors.map((anchor) => [anchor.verseId, referenceLabel(anchor)]));
        const maxVotes = await concepts.maxCrossReferenceVotes();
        for (const edge of await concepts.expandCrossReferences(seeds)) {
          verses.set(targetIdFor(edge), edge);
          contributions.push({
            verse: edge,
            evidence: [
              crossReferenceEvidence(
                edge,
                maxVotes,
                seedLabels.get(edge.fromVerseId) ?? 'a matched passage',
              ),
            ],
          });
        }
      }
    }

    const ranked = rank(mergeCandidates(contributions), options.rankOptions);
    return ranked.map((result) => {
      const verse = verses.get(result.targetId)!;
      return {
        targetId: result.targetId,
        reference: referenceLabel(verse),
        excerpt: verse.text,
        score: result.score,
        reasons: result.reasons,
      };
    });
  }

  return {
    engineVersion: ENGINE_VERSION,
    corpusFingerprint: meta.corpusFingerprint,

    async research(query: string): Promise<ResearchResult> {
      const trimmed = query.trim();

      // Step 1 — an explicit reference wins outright and short-circuits.
      // Discovery never runs for "Ps 46": the user asked for a passage, not
      // for verses that resemble the string "Ps 46".
      const attempt = await repository.resolveReference(trimmed);
      if (attempt.kind === 'resolved') {
        return {
          kind: 'reference',
          passage: await repository.loadPassage(attempt.reference),
          ...identity,
        };
      }
      if (attempt.kind === 'invalid-reference') {
        return { kind: 'invalid-reference', query: trimmed, ...identity };
      }

      return { kind: 'discovery', query: trimmed, results: await discover(trimmed), ...identity };
    },

    async close(): Promise<void> {
      await repository.close();
    },
  };
}
