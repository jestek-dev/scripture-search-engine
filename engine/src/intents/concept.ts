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

import type {
  ConceptAnchorRow,
  CrossReferenceRow,
  CuratedAliasRow,
} from '../corpus/repository.js';
import { significantWords } from '../tokenizer/index.js';
import type { Evidence } from '../reasons/types.js';
import type { ScriptureVerse } from '../types.js';

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
  // Full-query parity (0.10.0 stage 3): when the concept's normalized phrase
  // accounts for EVERY significant token of the query — count equality
  // implies set equality, because matchConcepts only matches phrases whose
  // normalized tokens all occur among the query tokens — and is at least two
  // tokens wide, specificity is 1. The query IS the phrase; docking it for
  // being stored as a two-token entry made a weight-1.0 anchor worth 28 of
  // its 40 points and let a tapered verbatim rebuke outrank the instituting
  // passage a human curated. One- and zero-token matches keep the graded
  // specificity: parity for a bare word would undo the thin-cue design.
  // Deliberate, measured consequence: a stopword-heavy query that collapses
  // to the same significant tokens as a remembered-phrasing lexicon entry
  // gets parity — there is one tokenizer, and a query whose meaning collapses
  // to two tokens IS a two-token query.
  const parity = matchedTokenCount >= 2 && matchedTokenCount === queryTokenCount;
  return (
    Math.max(0, Math.min(1, anchorWeight)) *
    (parity ? 1 : conceptSpecificity(matchedTokenCount)) *
    conceptCoverage(matchedTokenCount, queryTokenCount)
  );
}

// A bare-word cue that explains less than this share of the query's meaning
// is too thin to activate a concept's full anchor set authoritatively.
export const MIN_AUTHORITATIVE_BARE_CUE_IDF_SHARE = 0.2;

/**
 * One verse, one concept, ONE scored contribution (0.10.0 stage 6).
 *
 * The importer emits one anchor row per (entry × source), and overlapping
 * ranges within a concept emit one row per range — so the same verse could
 * reach the ranker several times for the SAME concept and be summed as if
 * the entries were independent evidence. They are not: two sources naming
 * one verse for one theme is agreement about a single fact, and G7 files
 * agreement as one budget, not two. This is how a duplicated 1 Peter 5:7
 * outscored peace-of-god's own weight-1.0 anchor.
 *
 * Groups by (conceptId, translationCode, verseId); the carrier is chosen
 * deterministically (weight desc → sourceId asc → locator asc → anchor start
 * asc) and provenance is NOT dropped: the surviving row's sourceId becomes
 * the '+'-joined ascending union of the group's sources — the same
 * convention passage_terms already uses — so one chip honestly names every
 * agreeing source (covenant: explanations are contract; sources are named,
 * never adjudicated). Cross-CONCEPT stacking is deliberately untouched: two
 * different matched concepts naming one verse are two different claims.
 * Groups keep first-occurrence order, so unmerged inputs pass through
 * byte-identical and the output is a pure, deterministic function of the
 * input order (the repository's ORDER BY makes that order stable).
 */
export function dedupeConceptAnchors(
  anchors: readonly ConceptAnchorRow[],
): readonly ConceptAnchorRow[] {
  const groups = new Map<string, ConceptAnchorRow[]>();
  const order: string[] = [];
  for (const anchor of anchors) {
    // U+0000 as the WRITTEN escape (never the raw byte, which turns a source
    // file git-binary): no id component can contain it, so the joined key
    // cannot collide across components.
    const key = `${anchor.conceptId}\u0000${anchor.translationCode}\u0000${anchor.verseId}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(anchor);
    else {
      groups.set(key, [anchor]);
      order.push(key);
    }
  }
  return order.map((key) => {
    const group = groups.get(key)!;
    if (group.length === 1) return group[0]!;
    const sorted = [...group].sort(
      (a, b) =>
        b.weight - a.weight ||
        (a.sourceId < b.sourceId ? -1 : a.sourceId > b.sourceId ? 1 : 0) ||
        ((a.locator ?? '') < (b.locator ?? '')
          ? -1
          : (a.locator ?? '') > (b.locator ?? '')
            ? 1
            : 0) ||
        a.anchorStartVerseId - b.anchorStartVerseId,
    );
    const carrier = sorted[0]!;
    const sourceIds = [...new Set(group.map((row) => row.sourceId))].sort();
    return sourceIds.length === 1 ? carrier : { ...carrier, sourceId: sourceIds.join('+') };
  });
}

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
      // Rendered through joinedSourceLabel so a stage-6 merged row ('a+b')
      // names every agreeing source; single ids render byte-identically.
      label: joinedSourceLabel(anchor.sourceId),
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
      label: joinedSourceLabel(anchor.sourceId),
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
 * Curated phrase/hymn alias evidence, concept-target arm (0.13.0/QR-6).
 *
 * Files under the EXISTING concept_anchor family — no new SignalFamily, so
 * the reviewed budgets roster is untouched and the alias claim competes
 * under exactly the authority a curated concept naming already has. Strength
 * is the alias row's weight (the editorial prior that this whole query
 * names this hymn and this hymn names this theme) times the anchor's own
 * curated weight — the anchors keep their reviewed ordering among
 * themselves. No specificity or coverage discount applies because whole-
 * query EQUALITY matching is full-query parity by construction: the query
 * IS the phrase.
 *
 * The label carries the full attribution chain — hymn title, then the theme
 * — because the explanation is the contract (covenant 5) and the chip must
 * say on whose word the connection stands (covenant 6: a curated source
 * names it; the engine adjudicates nothing).
 */
export function aliasConceptEvidence(alias: CuratedAliasRow, anchor: ConceptAnchorRow): Evidence {
  return {
    family: 'concept_anchor',
    label: `Hymn: "${alias.title}" → Theme: ${anchor.conceptLabel}`,
    strength:
      Math.max(0, Math.min(1, alias.weight)) * Math.max(0, Math.min(1, anchor.weight)),
    provenance: {
      sourceId: alias.sourceId,
      label: sourceLabel(alias.sourceId),
      ...(alias.locator ? { locator: alias.locator } : {}),
      weight: alias.weight,
    },
  };
}

/**
 * Alias evidence, verse-range arm: the alias names an explicit passage
 * rather than a concept (the schema XOR's other side — for a hymn whose
 * scriptural basis is one passage no curated concept represents). Same
 * family, same authority reasoning; the passage label itself is the result
 * row's reference, so the chip carries only the hymn attribution.
 */
export function aliasPassageEvidence(alias: CuratedAliasRow, _verse: ScriptureVerse): Evidence {
  return {
    family: 'concept_anchor',
    label: `Hymn: "${alias.title}"`,
    strength: Math.max(0, Math.min(1, alias.weight)),
    provenance: {
      sourceId: alias.sourceId,
      label: sourceLabel(alias.sourceId),
      ...(alias.locator ? { locator: alias.locator } : {}),
      weight: alias.weight,
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
      label: joinedSourceLabel(anchor.sourceId),
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

/**
 * Half-saturation constant for the passage_terms PMI factor (0.10.0 stage 5).
 *
 * A match whose mean per-term PMI equals this value scores factor 0.5. The
 * value is calibrated against reviewed data: the G5 admission floor
 * (`eval/budgets.json` distinctiveness.minPmi = 2.0) scores 0.25 — a term
 * that barely cleared admission speaks at quarter volume — and the measured
 * corpus-mean PMI 6.37 scores ≈0.52. Mirrored into `eval/budgets.json`
 * signalBudgets for the G6 reviewed-constants check; value pending J21
 * sign-off, which rides the normal approval flow.
 */
export const PASSAGE_TERM_PMI_HALF_SATURATION = 6.0;

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
  // Distinctiveness (0.10.0 stage 5): the pipeline computed a PMI for every
  // admitted term under G5, and until this factor existed scoring threw that
  // statistic away — every same-count, same-span match tied exactly and
  // canonical book order decided ("propitiation" returned a flat 2.85 pile
  // led by whichever book comes first). Asymptotic on purpose: the earlier
  // `min(1, pmiSum / (terms × 6))` form saturates at 1 for any per-term PMI
  // ≥ 6, and distinctive vocabulary lives ABOVE that line (measured corpus
  // range 2.02–18.54, every stored `propitiation` row 8.52–11.21), so the
  // ties it existed to break survived it byte-identical. This form is
  // strictly monotone in pmiSum — distinct pmiSums never tie, at any
  // magnitude — and bounded below 1. No new adjudication: the statistic was
  // already reviewed data; this only stops discarding it. Zero/absent pmiSum
  // degrades to factor 0 rather than NaN or a negative.
  const pmiSum = Math.max(0, match.pmiSum);
  const halfSaturationMass =
    Math.max(1, match.matchedTerms.length) * PASSAGE_TERM_PMI_HALF_SATURATION;
  const pmiFactor = pmiSum / (pmiSum + halfSaturationMass);
  return {
    family: 'passage_terms',
    label:
      match.matchedTerms.length === 1
        ? `Preached vocabulary: ${match.matchedTerms[0]}`
        : `Preached vocabulary: ${match.matchedTerms.slice(0, 3).join(', ')}`,
    strength: Math.max(0, Math.min(1, saturating * specificity * pmiFactor)),
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
    case 'hymn-aliases':
      // The QR-6 curated hymn/phrase alias pack: hand-authored rows over
      // public-domain hymns, reviewed like any concept pack (J13). The label
      // says both halves — whose judgment (ours) and what class of source
      // (a public-domain hymn index) — so a reader can weigh it.
      return 'LH editorial (public-domain hymn index)';
    case 'openbible-topics':
      return 'OpenBible topical votes (CC BY)';
    case 'openbible-xrefs':
      return 'OpenBible cross-references (CC BY)';
    case 'openbible-sections':
      // P5.6 (CO-3): pericope grouping provenance. Unreachable until the
      // PR 2 behavior emits grouped results; labeled from day one so the
      // capability PR ships a complete display mapping.
      return 'OpenBible section boundaries (CC BY)';
    case 'tsk':
      return 'Treasury of Scripture Knowledge (public domain)';
    case 'tsk-text':
      // P6.3 (B3): the phrase-keyed TSK module admission. Unreachable in
      // Phase A — no tsk-text row enters cross_references and nothing reads
      // the phrase table at query time — but labeled from day one so the
      // capability ships a complete display mapping (the openbible-sections
      // precedent). Phase B's named-phrase chip composes its own wording;
      // this is the bare provenance label.
      return 'Treasury of Scripture Knowledge (public domain)';
    case 'stepbible-tvtms':
      // P6.4 (B5) S1: the TVTMS versification witness. ZERO SHIPPED BYTES —
      // nothing from it enters the artifact, so no chip can ever cite it;
      // labeled anyway because the completeness contract is "every manifest
      // id renders as prose", with no reachability carve-outs to reason
      // about. CC BY attribution: credit "STEP Bible" (www.STEPBible.org).
      return 'STEP Bible versification data (CC BY)';
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
