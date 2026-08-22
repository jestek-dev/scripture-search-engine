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
  isMeaningfulPhraseFragment,
  phraseEvidence,
  queryIdfTotal,
  referenceLabel,
  significantWords,
  subsumeCompletePhraseRestatements,
  targetIdFor,
  tokenEvidence,
} from './intents/lexical.js';
import {
  conceptAnchorEvidence,
  conceptCueEvidence,
  crossReferenceEvidence,
  dedupeConceptAnchors,
  isThinBareWordConceptCue,
  passageTermEvidence,
  relatedConceptEvidence,
  translationVariantEvidence,
} from './intents/concept.js';
import {
  deleteVariants,
  pickCorrection,
  spellingEditBudget,
} from './intents/spelling.js';
import { significantWordsWithSurface } from './tokenizer/index.js';
import { DEFAULT_LIMIT, rank, type RankOptions } from './ranking/rank.js';
import { polishChipsForDisplay } from './reasons/display.js';

/**
 * Extra candidates ranked beyond the caller's limit so that collapsing a run
 * of anchor verses does not shrink the page. Bounded rather than unlimited:
 * ranking is cheap but not free, and a curated anchor spanning more than this
 * many verses is a passage, not a page of results.
 */
const COLLAPSE_HEADROOM = 25;
import type { Reason } from './reasons/types.js';
import type {
  ConceptMatch,
  ContentQueryPort,
  DiscoveryResult,
  PassageResult,
  RelatedResult,
  ResearchResult,
  ScriptureVerse,
  SongInput,
  SpellingCorrection,
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

const SUPPORTED_SCHEMA_VERSIONS = new Set(['1', '2', '3', '4', '5', '6', '7']);

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
  // Presence-probed like the other optional layers: a v6 artifact has no
  // spelling tables and the engine gracefully does not correct (0.12.0/QR-5).
  const hasSpellingIndex = await repository.hasSpellingIndex();
  const documentCount = await repository.documentCount();
  const identity = {
    engineVersion: ENGINE_VERSION,
    corpusFingerprint: meta.corpusFingerprint,
    layerFingerprint: meta.layerFingerprint,
  };

  /**
   * The discovery ladder. `correctSpelling` is true ONLY on the `research()`
   * path (0.12.0/QR-5): themes() stays exact-curated, forSong() lyrics are
   * never corrected, and reference-shaped inputs never get here at all (the
   * reference short-circuit runs first). Corrections are returned alongside
   * the results so the outcome can carry the machine-readable citation.
   */
  async function discover(
    query: string,
    correctSpelling = false,
  ): Promise<{
    readonly results: readonly DiscoveryResult[];
    readonly corrections: readonly SpellingCorrection[];
  }> {
    const verses = new Map<string, ScriptureVerse>();
    // targetId -> the curated anchor spans that produced it.
    const anchorSpans = new Map<string, Set<string>>();
    // Targets whose evidence carries a COMPLETE whole-query exact_phrase
    // match, marked for the complete-match subsumption at candidate merge
    // (0.10.0 stage 3): their token_overlap/proximity evidence restates what
    // the verbatim match already fully asserts. Fragments never mark.
    const completePhraseTargets = new Set<string>();
    const contributions: { verse: ScriptureVerse; evidence: ReturnType<typeof tokenEvidence> }[] =
      [];

    // Step 2 — verbatim text. Tries the whole query first and falls back to
    // its longest matching fragment, so a paraphrase still gets credit for
    // the part the user quoted exactly. Only for multi-word queries: a single
    // word "matching a phrase" is the token intent wearing an authoritative
    // badge it has not earned.
    if (query.trim().includes(' ')) {
      const whole = await repository.searchPhrase(query);
      if (whole.length > 0) {
        // Whole-match authority is measured in SIGNIFICANT words (0.10.0
        // stage 3), mirroring what the fragment branch has done since 0.8.0:
        // "the cross" is two raw words but one unit of meaning, and granting
        // it full 60-point authority let verbatim occurrences in negative
        // context outrank the curated anchors. Deliberately NO raw-count
        // fallback here (unlike the fragment branch, which needs one to
        // avoid dividing by zero): an all-stopword verbatim match is the
        // token intent wearing an authoritative badge, exactly what the
        // taper demotes — phraseEvidence files anything under two
        // significant words as token_overlap.
        const querySignificant = significantWords(query).length;
        for (const match of whole) {
          const evidence = phraseEvidence(query.trim(), querySignificant, querySignificant);
          verses.set(targetIdFor(match), match);
          if (evidence.family === 'exact_phrase') {
            completePhraseTargets.add(targetIdFor(match));
          }
          contributions.push({ verse: match, evidence: [evidence] });
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
          // A fallback containing only one significant word is token overlap,
          // not phrase evidence. Adding both would count the same thin match
          // twice and can lift an irrelevant stopword-heavy fragment into the
          // ranked window ("is close to" was the motivating case).
          const fragmentIsPhrase = isMeaningfulPhraseFragment(fragment.fragment, query);
          if (fragmentIsPhrase) {
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
    }

    // Steps 3-4 — tokens with proximity. Normalization is inherent: the
    // shared tokenizer folds inflection and archaic forms on both sides.
    //
    // Cited spelling correction (0.12.0/QR-5) runs FIRST, before any token
    // step, and only on the research() path: a typed token with corpus df 0
    // that exists in NO vocabulary (corpus tokens, book aliases, lexicon
    // tokens, translation tokens, Layer B verse terms — the OOV gate)
    // substitutes the unique
    // in-policy winner of the precomputed SymSpell lookup, verified by the
    // bounded integer Damerau DP under the ONE edit-policy table. Corrected
    // tokens then flow through every step below unchanged, and every
    // substitution is CITED — on the token chips (typed surface form, never
    // the stem) and in the returned corrections list. A word in ANY
    // vocabulary is never rewritten. The whole-query FTS phrase step above
    // stays uncorrected (documented v1 cut).
    let tokens = significantWords(query);
    const corrections: SpellingCorrection[] = [];
    const correctionCitations = new Map<string, string>();
    let precomputedFrequencies: ReadonlyMap<string, number> | null = null;
    if (correctSpelling && hasSpellingIndex && tokens.length > 0) {
      const typedFrequencies = await repository.tokenDocumentCounts(tokens);
      const zeroDf = tokens.filter((token) => (typedFrequencies.get(token) ?? 0) === 0);
      if (zeroDf.length === 0) {
        precomputedFrequencies = typedFrequencies;
      } else {
        const inVocabulary = await repository.spellingTermsPresent(zeroDf);
        const substitutions = new Map<string, string>();
        for (const pair of significantWordsWithSurface(query)) {
          if ((typedFrequencies.get(pair.token) ?? 0) > 0) continue;
          if (inVocabulary.has(pair.token)) continue;
          const bound = spellingEditBudget(pair.token.length);
          if (bound === 0) continue;
          const candidates = await repository.spellingCandidates(
            deleteVariants(pair.token, bound),
          );
          const winner = pickCorrection(pair.token, candidates, bound);
          if (!winner) continue;
          substitutions.set(pair.token, winner.term);
          if (!correctionCitations.has(winner.term)) {
            correctionCitations.set(winner.term, pair.surface);
          }
          corrections.push({
            typed: pair.surface,
            corrected: winner.term,
            distance: winner.distance,
          });
        }
        if (substitutions.size > 0) {
          // Substitute in place, then re-deduplicate preserving first
          // occurrence: a correction may land on a term the query already
          // contains, and one term must contribute once.
          const seen = new Set<string>();
          tokens = tokens
            .map((token) => substitutions.get(token) ?? token)
            .filter((token) => (seen.has(token) ? false : (seen.add(token), true)));
        } else {
          precomputedFrequencies = typedFrequencies;
        }
      }
    }
    let tokenFrequencies: ReadonlyMap<string, number> = new Map();
    let tokenIdfTotal = 0;
    if (tokens.length > 0) {
      tokenFrequencies = precomputedFrequencies ?? (await repository.tokenDocumentCounts(tokens));
      tokenIdfTotal = queryIdfTotal(tokens, tokenFrequencies, documentCount);
      for (const match of await repository.searchTokens(tokens, documentCount)) {
        verses.set(targetIdFor(match), match);
        contributions.push({
          verse: match,
          evidence: tokenEvidence(match, tokenIdfTotal, correctionCitations),
        });
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
        const bareCueIdfShare = (phrase: string): number => {
          if (tokenIdfTotal <= 0) return 1;
          const phraseToken = significantWords(phrase)[0];
          if (!phraseToken) return 1;
          const df = tokenFrequencies.get(phraseToken) ?? 0;
          return Math.log(1 + documentCount / Math.max(1, df)) / tokenIdfTotal;
        };
        const matchedByConcept = new Map(matched.map((match) => [match.conceptId, match]));
        const authoritativeConceptIds = matched
          .filter(
            (match) =>
              !isThinBareWordConceptCue(
                match.matchedPhrase,
                tokens.length,
                bareCueIdfShare(match.matchedPhrase),
              ),
          )
          .map((match) => match.conceptId);
        const authoritativeConceptSet = new Set(authoritativeConceptIds);
        // Anchor dedupe (0.10.0 stage 6): one verse, one concept, one scored
        // contribution — the surviving row's chip names every agreeing source.
        // See dedupeConceptAnchors.
        const anchors = dedupeConceptAnchors(
          await concepts.anchorVerses(matched.map((match) => match.conceptId)),
        );
        for (const anchor of anchors) {
          const match = matchedByConcept.get(anchor.conceptId);
          const matchedTokenCount = match?.matchedTokenCount ?? 1;
          const weakCue =
            match !== undefined &&
            isThinBareWordConceptCue(
              match.matchedPhrase,
              tokens.length,
              bareCueIdfShare(match.matchedPhrase),
            );
          verses.set(targetIdFor(anchor), anchor);
          // Remember which curated span this verse came from, so contiguous
          // verses of ONE anchor can be presented as the passage a human named.
          const spans = anchorSpans.get(targetIdFor(anchor)) ?? new Set<string>();
          spans.add(
            `${anchor.conceptId}:${anchor.anchorStartVerseId}-${anchor.anchorEndVerseId}`,
          );
          anchorSpans.set(targetIdFor(anchor), spans);
          contributions.push({
            verse: anchor,
            evidence: [
              weakCue
                ? conceptCueEvidence(anchor, matchedTokenCount, tokens.length)
                : conceptAnchorEvidence(anchor, matchedTokenCount, tokens.length),
            ],
          });
        }

        if (authoritativeConceptIds.length > 0) {
          // One hop through the curated graph, filed as weak evidence.
          const relatedIds = await concepts.relatedConcepts(authoritativeConceptIds);
          for (const anchor of dedupeConceptAnchors(await concepts.anchorVerses(relatedIds))) {
            verses.set(targetIdFor(anchor), anchor);
            contributions.push({ verse: anchor, evidence: [relatedConceptEvidence(anchor)] });
          }

          // Cross-reference expansion seeded ONLY from authoritative concept
          // anchors, never from arbitrary lexical hits or bare-word theme cues.
          // Seeding from weak matches is how a curated graph turns into a
          // random walk.
          const authoritativeAnchors = anchors.filter((anchor) =>
            authoritativeConceptSet.has(anchor.conceptId),
          );
          const seeds = [...new Set(authoritativeAnchors.map((anchor) => anchor.verseId))].sort(
            (a, b) => a - b,
          );
          const seedLabels = new Map(
            authoritativeAnchors.map((anchor) => [anchor.verseId, referenceLabel(anchor)]),
          );
          // Same-concept cross-reference suppression (0.10.0 stage 4). Within
          // one concept's anchor set, an edge between two members restates the
          // curated consensus each member's concept_anchor chip already
          // carries — the same humans naming the same theme, walked one hop
          // and counted again as if independent. That stacking is how a
          // co-anchor's ≤6 "corroboration" points closed a deliberate
          // curated-weight gap and displaced the verse being quoted (ph2,
          // Jer 29:11 vs Rom 15:13). Suppressed, not discounted: a ×0.5 keeps
          // a tunable fraction of double-counting with no principled value
          // (G7 — correlated evidence shares one budget; identical facts
          // collapse rather than sum — applied across the anchor/xref
          // boundary). The map is built only from AUTHORITATIVE anchors of
          // matched concepts, so edges from outside the set, edges whose
          // target is not a co-anchor of the seeding concept, and edges
          // between anchors of two DIFFERENT matched concepts are all
          // untouched, and membership lookup is order-independent by
          // construction. related() is deliberately untouched: there the
          // passage is the input and its edges are exactly what was asked
          // for — no concept consensus is being restated.
          const anchorConceptsByVerse = new Map<number, Set<string>>();
          for (const anchor of authoritativeAnchors) {
            const bucket = anchorConceptsByVerse.get(anchor.verseId);
            if (bucket) bucket.add(anchor.conceptId);
            else anchorConceptsByVerse.set(anchor.verseId, new Set([anchor.conceptId]));
          }
          const sharesMatchedConcept = (fromVerseId: number, toVerseId: number): boolean => {
            const from = anchorConceptsByVerse.get(fromVerseId);
            const to = anchorConceptsByVerse.get(toVerseId);
            if (!from || !to) return false;
            for (const conceptId of from) if (to.has(conceptId)) return true;
            return false;
          };
          const maxVotes = await concepts.maxCrossReferenceVotes();
          for (const edge of await concepts.expandCrossReferences(seeds)) {
            // The suppressed target stays in the candidate set through its own
            // anchor evidence (it IS an anchor of the matched concept — that
            // is why the edge is redundant); only the restated edge evidence
            // is dropped, so no result ever disappears from this.
            if (sharesMatchedConcept(edge.fromVerseId, edge.verseId)) continue;
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
    }

    // Rank with headroom, collapse, THEN cut to the limit. Collapsing after the
    // cut would hand back fewer results than asked for: a four-verse anchor run
    // inside the top 25 becomes one row, and the three freed slots stay empty
    // while genuinely different passages sit just outside the window.
    const limit = options.rankOptions?.limit ?? DEFAULT_LIMIT;
    const ranked = rank(
      // Complete-match subsumption (0.10.0 stage 3): a complete whole-query
      // exact_phrase match drops its same-token token_overlap/proximity
      // restatement before ranking. See subsumeCompletePhraseRestatements.
      subsumeCompletePhraseRestatements(mergeCandidates(contributions), completePhraseTargets),
      {
        ...options.rankOptions,
        limit: limit + COLLAPSE_HEADROOM,
      },
    );
    const results = (
      collapseAnchorRuns(
        ranked.map((result) => {
          const verse = verses.get(result.targetId)!;
          return {
            targetId: result.targetId,
            reference: referenceLabel(verse),
            excerpt: verse.text,
            score: result.score,
            reasons: result.reasons,
          };
        }),
        verses,
        anchorSpans,
      )
        .slice(0, limit)
        // Chip display polish (0.10.0 CO-2/F22), applied LAST — after
        // ranking, collapsing and the cut — so it is display-only by
        // construction: scores, order and the page are already decided.
        // Withheld chips' points still count (a result's score may exceed
        // the sum of its displayed chips). related() is deliberately
        // untouched: its only chip family (cross_reference, votes >= 1
        // against the corpus maximum) cannot produce a chip below the
        // display minimum, and passage_terms never appears there.
        .map((result) => {
          const polished = polishChipsForDisplay(result.reasons);
          return polished === result.reasons ? result : { ...result, reasons: polished };
        })
    );
    return { results, corrections };
  }

  async function relatedFor(reference: string): Promise<RelatedResult> {
      const trimmed = reference.trim();
      const attempt = await repository.resolveReference(trimmed);
      if (attempt.kind !== 'resolved') {
        // Same posture as passage(): lookups never fall through, and the
        // did-you-mean citation travels when one validated.
        return attempt.kind === 'invalid-reference' && attempt.suggestion
          ? { kind: 'invalid-reference', query: trimmed, suggestion: attempt.suggestion, ...identity }
          : { kind: 'invalid-reference', query: trimmed, ...identity };
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
        // Bare-number shapes with no resolving book and no citable
        // suggestion fall through to discovery (0.11.0/QR-4, J36):
        // "plans 29 11" is a Jeremiah 29:11 memory query, and dead-ending it
        // served nobody. Explicit-separator queries state reference intent
        // and stay typed invalid, carrying the did-you-mean when one
        // validated (suggestion only — never a silently opened guess, J35).
        if (attempt.fallthroughToDiscovery) {
          const discovered = await discover(trimmed, true);
          return {
            kind: 'discovery',
            query: trimmed,
            results: discovered.results,
            ...(discovered.corrections.length > 0
              ? { corrections: discovered.corrections }
              : {}),
            ...identity,
          };
        }
        return attempt.suggestion
          ? { kind: 'invalid-reference', query: trimmed, suggestion: attempt.suggestion, ...identity }
          : { kind: 'invalid-reference', query: trimmed, ...identity };
      }

      const discovered = await discover(trimmed, true);
      return {
        kind: 'discovery',
        query: trimmed,
        results: discovered.results,
        ...(discovered.corrections.length > 0 ? { corrections: discovered.corrections } : {}),
        ...identity,
      };
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
      // A lookup has nothing to fall through to, so every non-resolution is
      // typed invalid here — but the did-you-mean citation still travels.
      return attempt.kind === 'invalid-reference' && attempt.suggestion
        ? { kind: 'invalid-reference', query: trimmed, suggestion: attempt.suggestion, ...identity }
        : { kind: 'invalid-reference', query: trimmed, ...identity };
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

      // forSong() never corrects (0.12.0/QR-5): lyrics are quoted text, not a
      // fallible typed query, and a silent rewrite inside a song's own words
      // is exactly the failure mode the correction feature forbids.
      const results = query === '' ? [] : (await discover(query)).results;

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

/**
 * Collapse the surfaced verses of ONE curated anchor span into the single
 * passage that anchor names (0.10.0 stage 7: span MEMBERSHIP, not rank
 * adjacency).
 *
 * Why this exists: a ranged anchor emits one candidate per verse, and results
 * carrying authoritative evidence are deliberately exempt from group
 * diversification — a genuine multi-verse hit must never be thinned for the
 * sake of variety. Correct for exact-phrase matches; wrong for a curated span,
 * where the results ARE one passage. `communion` returned 1 Corinthians
 * 11:23, :24, :25 and :26 at identical scores, spending the whole top of the
 * list on a passage a human had already grouped.
 *
 * Until 0.10.0 this required RANK adjacency, which made the collapse depend
 * on what happened to rank in between: `praise` filled five slots with
 * individual verses of Psalm 150 because they ranked non-adjacently, and one
 * differently-scored verse of a span broke the whole merge. The span is the
 * unit because a person chose it — whether its verses rank consecutively is
 * an accident of the other evidence. Now every surfaced member of a span
 * merges into one row at the position of its best-ranked member; the members
 * below drop and the results shift up. That is the point: the passage
 * occupies one slot, not N.
 *
 * Determinism: pass 1 assigns each result a governing span — the span, among
 * the spans it belongs to, covering the most surfaced results (ties broken by
 * span key ascending) — and pass 2 emits in rank order, so the output is a
 * pure function of the ranker's total order and data already in the artifact.
 * Nothing is inferred, and equal inputs collapse identically on every
 * platform.
 *
 * The merged row is honest about what surfaced: its reference spans the
 * surfaced members (canonical min..max), the excerpt is their texts in
 * canonical verse order, the score is the best member's (existing policy),
 * and reasons merge strongest-per-label so the chips explain the passage
 * rather than an arbitrary one of its verses.
 */
export function collapseAnchorRuns(
  results: readonly DiscoveryResult[],
  verses: ReadonlyMap<string, ScriptureVerse>,
  anchorSpans: ReadonlyMap<string, ReadonlySet<string>>,
): readonly DiscoveryResult[] {
  // Pass 1a — how many surfaced results does each span cover? Counted over
  // the results actually present, so a span mostly outside the ranked window
  // does not outvote one that is really here.
  const spanCounts = new Map<string, number>();
  for (const result of results) {
    const spans = anchorSpans.get(result.targetId);
    if (!spans) continue;
    for (const span of spans) {
      spanCounts.set(span, (spanCounts.get(span) ?? 0) + 1);
    }
  }

  // Pass 1b — each result's governing span: most surfaced members first,
  // then span key ascending. A verse inside two overlapping curated spans
  // joins the one that gathers more of this result page (deterministic, and
  // the larger passage is the one the page is actually showing).
  const governing = new Map<string, string>();
  const members = new Map<string, DiscoveryResult[]>();
  for (const result of results) {
    const spans = anchorSpans.get(result.targetId);
    if (!spans || spans.size === 0 || !verses.has(result.targetId)) continue;
    let chosen: string | null = null;
    for (const span of spans) {
      if (
        chosen === null ||
        (spanCounts.get(span) ?? 0) > (spanCounts.get(chosen) ?? 0) ||
        ((spanCounts.get(span) ?? 0) === (spanCounts.get(chosen) ?? 0) && span < chosen)
      ) {
        chosen = span;
      }
    }
    governing.set(result.targetId, chosen!);
    const bucket = members.get(chosen!);
    if (bucket) bucket.push(result);
    else members.set(chosen!, [result]);
  }

  // Pass 2 — emit in rank order. The first-encountered member of a span
  // becomes the merged passage row; later members drop and everything below
  // shifts up.
  const emitted = new Set<string>();
  const output: DiscoveryResult[] = [];
  for (const result of results) {
    const span = governing.get(result.targetId);
    if (span === undefined) {
      output.push(result);
      continue;
    }
    if (emitted.has(span)) continue;
    emitted.add(span);

    const group = members.get(span)!;
    if (group.length === 1) {
      output.push(result);
      continue;
    }

    // Canonical verse order for the label and the excerpt; rank order decides
    // WHERE the row sits (here, at the best member) and the targetId (the
    // best member's, so consumers can still address the passage and fixture
    // range-matching keeps working unchanged).
    const canonical = [...group].sort(
      (a, b) => verses.get(a.targetId)!.verseId - verses.get(b.targetId)!.verseId,
    );
    const first = verses.get(canonical[0]!.targetId)!;
    const final = verses.get(canonical[canonical.length - 1]!.targetId)!;

    // Reasons merged by label, strongest kept, so the chip still explains the
    // passage rather than an arbitrary one of its verses.
    const byLabel = new Map<string, Reason>();
    for (const item of group) {
      for (const reason of item.reasons) {
        const existing = byLabel.get(reason.label);
        if (!existing || reason.points > existing.points) byLabel.set(reason.label, reason);
      }
    }
    const reasons = [...byLabel.values()].sort((a, b) =>
      b.points !== a.points ? b.points - a.points : a.label < b.label ? -1 : 1,
    );

    output.push({
      targetId: result.targetId,
      reference:
        first.verseId === final.verseId
          ? canonical[0]!.reference
          : first.chapter === final.chapter
            ? `${referenceLabel(first)}-${final.verse}`
            : // Reachable only for a span crossing a chapter boundary. Written
              // correctly regardless of the bbcccvvv id encoding: that is not
              // this function's invariant to rely on, and "Psalms 22:31-1" is
              // the kind of wrong that survives review because nobody can
              // produce it on demand.
              `${referenceLabel(first)}-${final.chapter}:${final.verse}`,
      excerpt: canonical.map((item) => item.excerpt).join(' '),
      score: Math.max(...group.map((item) => item.score)),
      reasons,
    });
  }

  return output;
}
