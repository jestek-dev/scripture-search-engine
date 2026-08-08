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
import type { Evidence } from '../reasons/types.js';

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
  const specificity = Math.min(1, 0.55 + 0.15 * Math.max(0, matchedTokenCount - 1));
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
  const coverage =
    queryTokenCount > 0 ? Math.sqrt(Math.min(1, matchedTokenCount / queryTokenCount)) : 1;
  return {
    family: 'concept_anchor',
    label: `Theme: ${anchor.conceptLabel}`,
    strength: Math.max(0, Math.min(1, anchor.weight)) * specificity * coverage,
    provenance: {
      sourceId: anchor.sourceId,
      label: sourceLabel(anchor.sourceId),
      ...(anchor.locator ? { locator: anchor.locator } : {}),
      weight: anchor.weight,
    },
  };
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
