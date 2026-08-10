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
  translationVariantEvidence,
} from './intents/concept.js';
import { rank, type RankOptions } from './ranking/rank.js';
import type {
  ConceptMatch,
  ContentQueryPort,
  DiscoveryResult,
  PassageResult,
  RelatedResult,
  ResearchResult,
  ScriptureVerse,
  SongInput,
} from './types.js';

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
  /** The full ladder with auto-detected intent: reference, phrase, tokens, concepts. */
  research(query: string): Promise<ResearchResult>;

  /**
   * Concept resolution only — "what themes does this text name?" — with no
   * ranking and no verse retrieval.
   *
   * Separate from research() because consumers need the concepts themselves,
   * not passages: Versed builds memorization packs per theme, Setlist shows
   * which themes a sermon note resolved to before any song is scored.
   */
  themes(query: string): Promise<readonly ConceptMatch[]>;

  /** Parse and fetch a passage. Invalid references are typed, never thrown. */
  passage(reference: string): Promise<PassageResult>;

  /**
   * What curated sources connect to a passage: cross-reference edges, and the
   * concepts whose anchors include it. Not similarity — every entry exists
   * because a human recorded the link.
   */
  related(reference: string): Promise<RelatedResult>;

  /**
   * Multi-field discovery for song and sermon workflows.
   *
   * Setlist matches a sermon theme to songs; Maskil starts from a song being
   * written. Both have several fields of differing evidential weight, and
   * neither should have to flatten them into one string and lose that.
   */
  forSong(input: SongInput): Promise<ResearchResult>;

  close(): Promise<void>;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  readonly engineVersion: string;
}

const SUPPORTED_SCHEMA_VERSIONS = new Set(['1', '2', '3', '4', '5', '6']);

/**
 * Lyric tokens admitted to forSong(). A full lyric sheet is hundreds of
 * mostly-common words; past this point they add candidates without adding
 * evidence, and drown the themes the writer actually stated.
 */
const MAX_LYRIC_TOKENS = 40;

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
  const hasTranslationTokens = await conceptRepository.hasTranslationTokens();
  const documentCount = await repository.documentCount();
  const identity = {
    engineVersion: ENGINE_VERSION,
    corpusFingerprint: meta.corpusFingerprint,
    layerFingerprint: meta.layerFingerprint,
  };

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
          // Fragment authority is measured in SIGNIFICANT words (0.8.0).
          // "is close to" is three raw words but one unit of meaning, and
          // scoring it 3/6 of a full match let stopword runs outrank curated
          // anchors. A query of nothing but function words falls back to raw
          // counts rather than dividing by zero.
          const querySignificant = significantWords(query).length;
          const fragmentSignificant = significantWords(fragment.fragment).length;
          const useSignificant = querySignificant > 0;
          for (const match of fragment.matches) {
            verses.set(targetIdFor(match), match);
            contributions.push({
              verse: match,
              evidence: [
                phraseEvidence(
                  fragment.fragment,
                  useSignificant ? fragmentSignificant : fragment.fragmentWords,
                  useSignificant ? querySignificant : fragment.queryWords,
                ),
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

    // Step 4b — cross-translation vocabulary. Placed AFTER the shipped text
    // has had its chance: if the query matches what this artifact actually
    // says, that is the better evidence and this only adds to it. What this
    // catches is the reader who learned the verse elsewhere.
    if (hasTranslationTokens && tokens.length > 1) {
      const variantFrequencies = await conceptRepository.translationTokenDocumentCounts(tokens);
      const variantIdfTotal = queryIdfTotal(tokens, variantFrequencies, documentCount);
      for (const match of await conceptRepository.searchTranslationTokens(tokens)) {
        const evidence = translationVariantEvidence(
          match,
          variantIdfTotal,
          variantFrequencies,
          documentCount,
        );
        if (!evidence) continue;
        verses.set(targetIdFor(match), match);
        contributions.push({ verse: match, evidence: [evidence] });
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

  async function relatedFor(reference: string): Promise<RelatedResult> {
      const trimmed = reference.trim();
      const attempt = await repository.resolveReference(trimmed);
      if (attempt.kind !== 'resolved') {
        return { kind: 'invalid-reference', query: trimmed, ...identity };
      }
      const resolved = attempt.reference;

      if (!concepts) {
        return { kind: 'related', reference: resolved.label, concepts: [], results: [], ...identity };
      }

      const anchoring = await concepts.conceptsAnchoring(resolved.startId, resolved.endId);

      // Populate each concept's full anchor list, exactly as themes() does.
      // A consumer showing "this passage belongs to Refuge in trouble" wants
      // the rest of that concept's passages as the obvious next click, and an
      // empty array here reads as "this concept anchors nothing" rather than
      // as data we declined to fetch.
      const anchorsByConcept = new Map<string, string[]>();
      for (const anchor of await concepts.anchorVerses(
        anchoring.map((concept) => concept.conceptId),
      )) {
        const bucket = anchorsByConcept.get(anchor.conceptId);
        const label = referenceLabel(anchor);
        if (bucket) {
          if (!bucket.includes(label)) bucket.push(label);
        } else {
          anchorsByConcept.set(anchor.conceptId, [label]);
        }
      }

      // Seed cross-reference expansion from the verses the user actually
      // named. Unlike discovery, there is no query to be wrong about: the
      // passage IS the input, so its edges are exactly what was asked for.
      const seeds: number[] = [];
      for (let verseId = resolved.startId; verseId <= resolved.endId; verseId += 1) {
        seeds.push(verseId);
      }
      const maxVotes = await concepts.maxCrossReferenceVotes();
      const verses = new Map<string, ScriptureVerse>();
      const contributions: { verse: ScriptureVerse; evidence: ReturnType<typeof tokenEvidence> }[] =
        [];
      for (const edge of await concepts.expandCrossReferences(seeds)) {
        // A passage is not related to itself.
        if (edge.verseId >= resolved.startId && edge.verseId <= resolved.endId) continue;
        verses.set(targetIdFor(edge), edge);
        contributions.push({
          verse: edge,
          evidence: [crossReferenceEvidence(edge, maxVotes, resolved.label)],
        });
      }

      const ranked = rank(mergeCandidates(contributions), options.rankOptions);
      return {
        kind: 'related',
        reference: resolved.label,
        concepts: anchoring.map((concept) => ({
          conceptId: concept.conceptId,
          label: concept.label,
          matchedOn: resolved.label,
          anchors: anchorsByConcept.get(concept.conceptId) ?? [],
        })),
        results: ranked.map((result) => {
          const verse = verses.get(result.targetId)!;
          return {
            targetId: result.targetId,
            reference: referenceLabel(verse),
            excerpt: verse.text,
            score: result.score,
            reasons: result.reasons,
          };
        }),
        ...identity,
      };
    }

  return {
    engineVersion: ENGINE_VERSION,
    corpusFingerprint: meta.corpusFingerprint,
    layerFingerprint: meta.layerFingerprint,

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

    async themes(query: string): Promise<readonly ConceptMatch[]> {
      if (!concepts) return [];
      const tokens = significantWords(query);
      if (tokens.length === 0) return [];

      const matched = await concepts.matchConcepts(tokens);
      if (matched.length === 0) return [];

      // One anchor query for all matched concepts rather than one per concept:
      // the cost is the same and the ordering is stable.
      const anchors = await concepts.anchorVerses(matched.map((match) => match.conceptId));
      const byConcept = new Map<string, string[]>();
      for (const anchor of anchors) {
        const bucket = byConcept.get(anchor.conceptId);
        const label = referenceLabel(anchor);
        if (bucket) {
          if (!bucket.includes(label)) bucket.push(label);
        } else {
          byConcept.set(anchor.conceptId, [label]);
        }
      }

      // Most specific first — a three-word lexicon hit says more about intent
      // than a one-word one — then by id, so ties never depend on row order.
      return [...matched]
        .sort((a, b) =>
          b.matchedTokenCount !== a.matchedTokenCount
            ? b.matchedTokenCount - a.matchedTokenCount
            : a.conceptId < b.conceptId
              ? -1
              : 1,
        )
        .map((match) => ({
          conceptId: match.conceptId,
          label: match.label,
          matchedOn: match.matchedPhrase,
          anchors: byConcept.get(match.conceptId) ?? [],
        }));
    },

    async passage(reference: string): Promise<PassageResult> {
      const trimmed = reference.trim();
      const attempt = await repository.resolveReference(trimmed);
      if (attempt.kind === 'resolved') {
        return {
          kind: 'passage',
          passage: await repository.loadPassage(attempt.reference),
          ...identity,
        };
      }
      return { kind: 'invalid-reference', query: trimmed, ...identity };
    },

    related: relatedFor,

    async forSong(input: SongInput): Promise<ResearchResult> {
      // Fields are concatenated in a FIXED order, most-intentional first, and
      // lyrics are truncated. Both choices are about determinism and noise
      // rather than taste: field order must not depend on object key order,
      // and a full lyric sheet contributes hundreds of low-IDF tokens that
      // would swamp a stated theme without adding evidence.
      const parts: string[] = [];
      if (input.themes?.length) parts.push(input.themes.join(' '));
      if (input.title) parts.push(input.title);
      if (input.lyrics) parts.push(significantWords(input.lyrics).slice(0, MAX_LYRIC_TOKENS).join(' '));
      const query = parts.join(' ').trim();

      const results = query === '' ? [] : await discover(query);

      // A foundational reference is a claim the writer made about the song, so
      // its curated edges are admitted alongside discovery — but never as the
      // only input, and never seeded from lyrics, which are not a claim.
      if (input.foundationalRef && concepts) {
        const attempt = await repository.resolveReference(input.foundationalRef);
        if (attempt.kind === 'resolved') {
          const related = await relatedFor(input.foundationalRef);
          if (related.kind === 'related') {
            const seen = new Set(results.map((result) => result.targetId));
            const merged = [...results];
            for (const extra of related.results) {
              if (!seen.has(extra.targetId)) merged.push(extra);
            }
            merged.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.targetId < b.targetId ? -1 : 1));
            return { kind: 'discovery', query, results: merged, ...identity };
          }
        }
      }

      return { kind: 'discovery', query, results, ...identity };
    },

    async close(): Promise<void> {
      await repository.close();
    },
  };
}
