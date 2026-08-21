/**
 * Concept intent — step 5 of the ladder, and the reason this engine exists.
 *
 * The lexical intents can only find verses that share vocabulary with the
 * query. This one finds verses that share MEANING, because a human wrote
 * down that they do and said on what authority.
 *
 * Note what it does NOT do: it renders no theological judgment. It reports
 * that a named source associates this passage with this concept, and names
 * the source. Where that source is us, the chip says "LH editorial" and the
 * reader can weigh it accordingly.
 */

import type { ConceptAnchorRow, CrossReferenceRow } from '../corpus/repository.js';
import { significantWords } from '../tokenizer/index.js';
import type { Evidence } from '../reasons/types.js';

function conceptSpecificity(matchedTokenCount: number): number {
  return Math.min(1, 0.55 + 0.15 * Math.max(0, matchedTokenCount - 1));
}

/**
 * How much of the QUERY this concept explains.
 *
 * Specificity alone asks "how much of the concept's phrase matched"; it
 * cannot tell "love" (the whole query) from "love" inside "do justly love
 * mercy walk humbly". Once bare words entered the lexicons those became very
 * different claims, and without this the second one buried Micah 6:8 under
 * God's-love passages — a concept explaining one word of six speaking as
 * loudly as one explaining all of it.
 *
 * Square-rooted rather than linear: a concept that explains half a query is
 * still saying something substantial, and a linear penalty would mute
 * legitimate multi-word matches to chase a single-word failure.
 */
function conceptCoverage(matchedTokenCount: number, queryTokenCount: number): number {
  return queryTokenCount > 0 ? Math.sqrt(Math.min(1, matchedTokenCount / queryTokenCount)) : 1;
}

function conceptMatchStrength(
  anchorWeight: number,
  matchedTokenCount: number,
  queryTokenCount: number,
): number {
  return (
    Math.max(0, Math.min(1, anchorWeight)) *
    conceptSpecificity(matchedTokenCount) *
    conceptCoverage(matchedTokenCount, queryTokenCount)
  );
}

// A bare-word cue that explains less than this share of the query's meaning
// is too thin to activate a concept's full anchor set authoritatively.
export const MIN_AUTHORITATIVE_BARE_CUE_IDF_SHARE = 0.2;

/**
 * Anchor evidence.
 *
 * Strength is the curated weight, which is a PRIOR: editorial confidence for
 * hand-authored anchors, normalized vote share for OpenBible ones. It is
 * never treated as a probability of correctness, and it enters the ranker
 * under the concept_anchor budget like any other bounded input.
 *
 * `specificity` scales strength by how much of the concept's lexicon phrase
 * the query actually matched. A one-token match ("grace") is real but thin
 * evidence that the user meant the curated concept; a four-token match
 * ("be doers of the word") is close to unambiguous.
 */
export function conceptAnchorEvidence(
  anchor: ConceptAnchorRow,
  matchedTokenCount: number,
  queryTokenCount: number = matchedTokenCount,
): Evidence {
  return {
    family: 'concept_anchor',
    label: `Theme: ${anchor.conceptLabel}`,
    strength: conceptMatchStrength(anchor.weight, matchedTokenCount, queryTokenCount),
    provenance: {
      sourceId: anchor.sourceId,
      label: sourceLabel(anchor.sourceId),
      ...(anchor.locator ? { locator: anchor.locator } : {}),
      weight: anchor.weight,
    },
  };
}

/**
 * A direct concept cue that is too thin to claim its anchors authoritatively.
 *
 * Bare single-word lexicon entries are good defaults for broad queries. Inside
 * a longer query they are only a hint, so they stay visible but spend from the
 * weak concept_lexicon budget rather than the authoritative concept_anchor one.
 */
export function conceptCueEvidence(
  anchor: ConceptAnchorRow,
  matchedTokenCount: number,
  queryTokenCount: number = matchedTokenCount,
): Evidence {
  return {
    family: 'concept_lexicon',
    label: `Theme cue: ${anchor.conceptLabel}`,
    strength: conceptMatchStrength(anchor.weight, matchedTokenCount, queryTokenCount),
    provenance: {
      sourceId: anchor.sourceId,
      label: sourceLabel(anchor.sourceId),
      ...(anchor.locator ? { locator: anchor.locator } : {}),
      weight: anchor.weight,
    },
  };
}

/**
 * One-token lexicon entries are broad-query defaults.
 *
 * They remain authoritative when the whole query is that token. Inside a
 * longer query they should act as theme cues.
 *
 * Width is measured in SIGNIFICANT tokens, not raw words. This deliberately
 * REVERSES the earlier carve-out that excluded multi-word phrasings whose
 * normalization reduces to one token ("forgive others" -> `forgive`): at
 * match time such a phrase IS its single stored token, so exempting it let a
 * stopword-heavy phrase evade the thin-cue gate a deliberate bare word must
 * face. Legitimate remembered phrasings stay protected by the two guards this
 * keeps: (i) `queryTokenCount > 1` — a query that itself collapses to the
 * same lone token ("do not be afraid" -> `afraid`) stays authoritative — and
 * (ii) the IDF-share test in isThinBareWordConceptCue, so a collapsed cue
 * that carries real query meaning survives.
 */
export function isBareWordConceptCue(matchedPhrase: string, queryTokenCount: number): boolean {
  return queryTokenCount > 1 && significantWords(matchedPhrase).length <= 1;
}

export function isThinBareWordConceptCue(
  matchedPhrase: string,
  queryTokenCount: number,
  queryIdfShare: number,
): boolean {
  return (
    isBareWordConceptCue(matchedPhrase, queryTokenCount) &&
    queryIdfShare < MIN_AUTHORITATIVE_BARE_CUE_IDF_SHARE
  );
}

/**
 * Evidence for a concept reached one hop away in the curated graph.
 *
 * Deliberately filed under the WEAK `concept_lexicon` family rather than
 * `concept_anchor`: "related to something you asked about" is a genuinely
 * weaker claim than "this is what you asked about", and the budget system
 * only protects us if evidence is filed honestly.
 */
export function relatedConceptEvidence(anchor: ConceptAnchorRow): Evidence {
  return {
    family: 'concept_lexicon',
    label: `Related theme: ${anchor.conceptLabel}`,
    strength: Math.max(0, Math.min(1, anchor.weight)) * 0.5,
    provenance: {
      sourceId: anchor.sourceId,
      label: sourceLabel(anchor.sourceId),
      ...(anchor.locator ? { locator: anchor.locator } : {}),
    },
  };
}

/**
 * Cross-reference evidence.
 *
 * Votes are normalized against the corpus maximum on a log scale: the
 * difference between 3 votes and 30 is meaningful, between 300 and 330 is
 * not, and a linear scale would let a handful of famous verse pairs
 * monopolize the signal.
 */
export function crossReferenceEvidence(
  edge: CrossReferenceRow,
  maxVotes: number,
  fromReference: string,
): Evidence {
  const normalized =
    maxVotes > 1 ? Math.log1p(Math.max(0, edge.votes)) / Math.log1p(maxVotes) : 0;
  return {
    family: 'cross_reference',
    label: `Cross-referenced from ${fromReference}`,
    strength: Math.max(0, Math.min(1, normalized)),
    provenance: {
      sourceId: edge.sourceId,
      label: sourceLabel(edge.sourceId),
      locator: fromReference,
      weight: edge.votes,
    },
  };
}

/**
 * Homiletical term-profile evidence (Layer B).
 *
 * Strength saturates: matching three distinctive terms is meaningfully more
 * than one, but twenty is not meaningfully more than ten, and a linear scale
 * would let one verbose exposition dominate. Log growth also keeps the signal
 * honest about what it is — a hint that people preaching this passage reach
 * for these words, nothing stronger.
 */
/**
 * The verse reads this way in another English translation.
 *
 * Distinct from token_overlap, which matches the SHIPPED wording, and from
 * passage_terms, which is what expositors said ABOUT a verse. This is the
 * verse itself, worded differently — the case where somebody learned Jeremiah
 * 29:11 as "plans to prosper you" and the shipped text says "thoughts of
 * peace".
 *
 * Strength saturates on how many query stems the verse accounts for. Matching
 * one stem is weak (many verses contain `plan`); matching several is a strong
 * signal that this is the verse being remembered.
 *
 * The label deliberately does not name a translation. The stored stems are
 * merged across sources, so which translation contributed a given one is not
 * recoverable — and claiming otherwise would be inventing provenance we do
 * not have.
 */
export function translationVariantEvidence(
  match: { matchedTokens: readonly string[] },
  queryIdfTotal: number,
  documentFrequencies: ReadonlyMap<string, number>,
  documentCount: number,
): Evidence | null {
  // A SINGLE stem is not evidence. Nearly every verse has some alternate
  // rendering of some common word, so one match says only "this verse exists".
  // Requiring two is what separates "somebody is quoting this verse from
  // another translation" from coincidence — and skipping the first version of
  // this check is what displaced 90% of the top ten on unrelated probes.
  if (match.matchedTokens.length < 2) return null;

  // Weighted by rarity, exactly as token_overlap is. Matching `prosper` says
  // far more than matching `help`, and an unweighted count cannot tell them
  // apart.
  const idfSum = match.matchedTokens.reduce((sum, token) => {
    const df = documentFrequencies.get(token) ?? 0;
    return sum + Math.log(1 + documentCount / Math.max(1, df));
  }, 0);
  const coverage = queryIdfTotal > 0 ? Math.min(1, idfSum / queryIdfTotal) : 0;
  if (coverage <= 0) return null;

  return {
    family: 'translation_variant',
    label: `Worded this way in another translation: ${match.matchedTokens.slice(0, 3).join(', ')}`,
    strength: Math.max(0, Math.min(1, coverage)),
    provenance: {
      sourceId: 'translation-variants',
      label: 'Cross-translation vocabulary',
    },
  };
}

export function passageTermEvidence(match: {
  matchedTerms: readonly string[];
  pmiSum: number;
  sourceIds: string;
  minSpanVerses: number;
  locator: string;
}): Evidence {
  const saturating = Math.log1p(match.matchedTerms.length) / Math.log1p(6);
  // Specificity: evidence distilled from a one-verse note is a stronger claim
  // about THIS verse than the same words inherited from a whole-psalm essay.
  // 1 verse -> 1.0, 6 verses -> ~0.61, a whole chapter -> ~0.45. Gentle on
  // purpose: diffuse commentary is discounted, never discarded.
  const span = Math.max(1, match.minSpanVerses);
  const specificity = 1 / (1 + 0.25 * Math.log2(span));
  return {
    family: 'passage_terms',
    label:
      match.matchedTerms.length === 1
        ? `Preached vocabulary: ${match.matchedTerms[0]}`
        : `Preached vocabulary: ${match.matchedTerms.slice(0, 3).join(', ')}`,
    strength: Math.max(0, Math.min(1, saturating * specificity)),
    provenance: {
      sourceId: match.sourceIds,
      label: joinedSourceLabel(match.sourceIds),
      locator: match.locator,
    },
  };
}

/** '+'-joined source ids rendered as human labels. */
function joinedSourceLabel(sourceIds: string): string {
  return sourceIds
    .split('+')
    .map((id) => sourceLabel(id))
    .join(' + ');
}

/**
 * Human-facing source names. Kept here rather than read from the artifact
 * because these strings appear in result chips, and a chip that says
 * "openbible-topics" leaks a database identifier into the product.
 */
function sourceLabel(sourceId: string): string {
  switch (sourceId) {
    case 'editorial':
      return 'LH editorial';
    case 'openbible-topics':
      return 'OpenBible topical votes (CC BY)';
    case 'openbible-xrefs':
      return 'OpenBible cross-references (CC BY)';
    case 'tsk':
      return 'Treasury of Scripture Knowledge (public domain)';
    case 'web':
      return 'World English Bible (public domain)';
    case 'torrey':
      return 'Torrey, New Topical Textbook (public domain)';
    case 'nave':
      return "Nave's Topical Bible (public domain)";
    case 'translation-variants':
      return 'Cross-translation vocabulary index';
    case 'maclaren-psalms':
    case 'maclaren-mark':
      return 'Maclaren, Expositions (public domain)';
    case 'clarke':
      return 'Adam Clarke, Commentary (public domain)';
    case 'mhc':
      return 'Matthew Henry, Commentary (public domain)';
    case 'kd':
      return 'Keil & Delitzsch, OT Commentary (public domain)';
    case 'barnes':
      return 'Barnes, Notes on the New Testament (public domain)';
    case 'jfb':
      return 'Jamieson-Fausset-Brown, Commentary (public domain)';
    case 'treasury-of-david-01':
    case 'treasury-of-david-02':
    case 'treasury-of-david-03':
    case 'treasury-of-david-04':
    case 'treasury-of-david-06':
      return 'Spurgeon, Treasury of David (public domain)';
    default:
      return sourceId;
  }
}

export { sourceLabel };
