/**
 * Lexical intents — steps 2, 3 and 4 of the ladder (exact phrase, distinctive
 * tokens with proximity, conservative normalization).
 *
 * Each intent's job is to turn corpus rows into typed Evidence. It never
 * decides ordering; the ranker does, under the signal budgets. That split is
 * what keeps "add a new intent" from being able to destabilize ranking.
 */

import type { Candidate } from '../ranking/rank.js';
import type { Evidence } from '../reasons/types.js';
import { significantWords } from '../tokenizer/index.js';
import type { TokenMatch } from '../corpus/repository.js';
import type { ScriptureVerse } from '../types.js';

/**
 * Canonical, sortable target id: zero-padded so lexicographic order IS
 * scripture order. The ranker uses targetId as its final tie-break, so this
 * padding is what makes equal-scoring results present in Genesis-to-
 * Revelation order rather than string-sorted nonsense ("10" before "9").
 */
export function targetIdFor(verse: ScriptureVerse): string {
  return `${verse.translationCode}:${String(verse.verseId).padStart(8, '0')}`;
}

/** Chapter-level grouping — the unit diversification thins by. */
export function groupIdFor(verse: ScriptureVerse): string {
  return `${verse.translationCode}:${verse.bookId}:${verse.chapter}`;
}

export function referenceLabel(verse: ScriptureVerse): string {
  return `${verse.bookName} ${verse.chapter}:${verse.verse}`;
}

/**
 * Significant-word count at which a verbatim phrase carries FULL exact-phrase
 * authority (0.10.0 stage 3 taper). Below two significant words a "phrase" is
 * one unit of meaning wearing a 60-point badge and files as token_overlap; at
 * two it earns 2/3 authority (40 points, exactly the concept_anchor ceiling);
 * at three or more it is a real quotation and earns the full 60.
 *
 * This constant is FIXED reviewed data, not a tuning knob: raising it to 4
 * would push 2-word phrases to 30 points, colliding with weakAggregateCap 30
 * and endangering correct remembered-phrase verbatim #1s. It is mirrored into
 * eval/budgets.json `signalBudgets` for the G6 reviewed-constants check;
 * changing it changes ordering, so covenant #2 requires an ENGINE_VERSION
 * bump in the same commit.
 */
export const EXACT_PHRASE_FULL_AUTHORITY_WORDS = 3;

/**
 * Exact phrase evidence.
 *
 * Strength carries no per-verse confidence gradient: a verse either contains
 * the phrase or it does not, and every verse containing the same phrase gets
 * the same strength. What strength DOES encode is how much the phrase itself
 * means — coverage of the query times the significant-width taper below.
 * bm25 is used upstream to choose WHICH matches survive the candidate cap
 * when there are more than the limit, but it never modulates strength — so
 * equal-strength matches fall through to the canonical-order tie-break,
 * which is what a reader expects from a concordance-style result.
 */
export function phraseEvidence(
  fragment: string,
  fragmentWords: number,
  queryWords: number,
): Evidence {
  const complete = fragmentWords >= queryWords;
  const coverage = Math.max(0, Math.min(1, fragmentWords / Math.max(1, queryWords)));
  // Taper, part 1 (0.10.0 stage 3): a verbatim match of fewer than two
  // significant words is one unit of meaning, not a quotation — "the cross"
  // occurring verbatim says no more than the token `cross` matching, and the
  // 60-point badge it used to wear is how crucifixion-mockery verses outranked
  // the curated atonement anchors. It files under token_overlap at full
  // strength (10 points), keeping its truthful label: the phrase genuinely
  // occurs; the points now say how much that means.
  if (fragmentWords < 2) {
    return {
      family: 'token_overlap',
      label: complete ? 'Exact phrase' : `Contains "${fragment}"`,
      strength: complete ? 1 : coverage,
    };
  }
  // Taper, part 2: authority grows with significant width up to
  // EXACT_PHRASE_FULL_AUTHORITY_WORDS. Two significant words earn 2/3 of the
  // family budget (40 points — level with the concept_anchor ceiling, above
  // weakAggregateCap 30); three or more earn the full 60.
  const authority = Math.min(1, fragmentWords / EXACT_PHRASE_FULL_AUTHORITY_WORDS);
  return {
    // Authoritative only while the verbatim text covers the MAJORITY of the
    // query. G6's definition of the exact_phrase family is "the query text
    // occurs verbatim in the verse" — half a query occurring verbatim is not
    // that, it is partial lexical overlap, which is precisely what the weak
    // tier exists to hold. Filed under token_overlap, a minority fragment
    // keeps its honest label but competes under weak-family caps instead of
    // outranking curated anchors.
    family: complete || coverage >= 0.5 ? 'exact_phrase' : 'token_overlap',
    label: complete ? 'Exact phrase' : `Contains "${fragment}"`,
    // Coverage is proportional to how much of the question this verbatim text
    // answers. A whole-query match earns full coverage; a four-word fragment
    // of an eight-word paraphrase earns half. This is what lets a paraphrase
    // like "be doers of the word not hearers only" still resolve decisively to
    // James 1:22, without pretending a fragment is the whole quotation.
    //
    // Since 0.8.0 the caller passes SIGNIFICANT word counts, not raw ones.
    // Raw counts let a verbatim run of function words wear authority it had
    // not earned: "God is close to the brokenhearted" contains the fragment
    // "is close to" — one significant word — which under raw counting scored
    // 3/6 of full phrase authority and put Zechariah 13:7 ("the man who is
    // close to me": strike the shepherd) above Psalm 34:18 for a grieving
    // searcher. Coverage of MEANING, not of words, is what this signal
    // claims to measure.
    strength: coverage * authority,
  };
}

/**
 * Complete-match subsumption (0.10.0 stage 3).
 *
 * When a candidate's evidence includes a COMPLETE whole-query exact_phrase
 * match, its token_overlap and proximity evidence restates a fact the verbatim
 * match already fully asserts: both are computed from the same query tokens
 * the phrase accounts for in their entirety. Counting the restatement let a
 * verbatim rebuke carry 11 extra points of "corroboration" that was really one
 * fact shown three times. This is the correlation principle the budgets
 * already commit to (G7: correlated families share one budget; identical
 * edges collapse rather than sum), applied across the exact_phrase/
 * token_overlap boundary — and covenant #5 improves with it, because the
 * result no longer shows three chips asserting one fact.
 *
 * Fragment matches do NOT subsume: a partial quotation leaves room for the
 * rest of the query to earn honest token credit. The caller marks only the
 * targets whose whole-query match was emitted as exact_phrase; this function
 * is pure and deterministic, and with an empty mark set it is the identity.
 */
export function subsumeCompletePhraseRestatements(
  candidates: readonly Candidate[],
  completePhraseTargets: ReadonlySet<string>,
): readonly Candidate[] {
  if (completePhraseTargets.size === 0) return candidates;
  return candidates.map((candidate) =>
    completePhraseTargets.has(candidate.targetId)
      ? {
          ...candidate,
          evidence: candidate.evidence.filter(
            (item) => item.family !== 'token_overlap' && item.family !== 'proximity',
          ),
        }
      : candidate,
  );
}

/** A fallback phrase must carry at least two meaningful words. */
export function isMeaningfulPhraseFragment(fragment: string, query: string): boolean {
  const querySignificant = significantWords(query);
  if (querySignificant.length === 0) {
    return fragment.trim().split(/\s+/).filter(Boolean).length >= 2;
  }
  return significantWords(fragment).length >= 2;
}

const PROXIMITY_WINDOW = 20;

/**
 * Additive smoothing for the precision term. Keeps a very short verse from
 * scoring high precision on one incidental shared word.
 */
const PRECISION_SMOOTHING = 2;

/**
 * Token-overlap and proximity evidence.
 *
 * Coverage is IDF-weighted rather than a raw count: matching "refuge" and
 * "strength" is worth far more than matching "do" and "one", and weighting
 * by inverse document frequency expresses that without anyone having to
 * hand-maintain a list of which words are important.
 */
export function tokenEvidence(match: TokenMatch, queryIdfTotal: number): Evidence[] {
  const evidence: Evidence[] = [];
  const coverage = queryIdfTotal > 0 ? Math.min(1, match.idfSum / queryIdfTotal) : 0;
  if (coverage <= 0) return evidence;

  // Coverage alone is RECALL — "did the verse contain what I asked for?" —
  // and it saturates at 1.0 for every verse containing all the query's
  // terms. That is how Luke 6:47 tied with (and then beat) James 1:22 for
  // "be doers of the word not hearers only": both contain hear + do + word,
  // so both scored a perfect 1.0.
  //
  // Precision is the missing half: what fraction of the VERSE is what you
  // asked about? James 1:22 is five significant words, three of them yours;
  // Luke 6:47 is seven, three of them yours. The first is more ABOUT the
  // query even though both contain it.
  //
  // Smoothed by PRECISION_SMOOTHING so that very short verses do not win by
  // arithmetic accident — without it a two-word verse sharing one word would
  // score 0.5 precision on almost no evidence.
  const precision =
    (match.matchedTokens.length + PRECISION_SMOOTHING) /
    (Math.max(match.matchedTokens.length, match.distinctTokenCount) + PRECISION_SMOOTHING);

  evidence.push({
    family: 'token_overlap',
    label:
      match.matchedTokens.length === 1
        ? `Shared word: ${match.matchedTokens[0]}`
        : `Shared words: ${match.matchedTokens.join(', ')}`,
    strength: coverage * precision,
  });

  // Proximity only means something with two or more matched tokens. The
  // ideal span for n tokens is n-1 (adjacent words); anything wider decays
  // linearly to zero at PROXIMITY_WINDOW words apart.
  if (match.minSpan !== null && match.matchedTokens.length > 1) {
    const ideal = match.matchedTokens.length - 1;
    const excess = Math.max(0, match.minSpan - ideal);
    const strength = Math.max(0, 1 - excess / PROXIMITY_WINDOW);
    if (strength > 0) {
      evidence.push({
        family: 'proximity',
        label: 'Matched words appear close together',
        strength,
      });
    }
  }
  return evidence;
}

/** Total IDF of the query's tokens — the denominator for coverage. */
export function queryIdfTotal(
  tokens: readonly string[],
  documentFrequencies: ReadonlyMap<string, number>,
  documentCount: number,
): number {
  return [...new Set(tokens)].reduce((sum, token) => {
    const df = documentFrequencies.get(token) ?? 0;
    return sum + Math.log(1 + documentCount / Math.max(1, df));
  }, 0);
}

/** Merge per-verse evidence from every lexical intent into ranked candidates. */
export function mergeCandidates(
  contributions: readonly { verse: ScriptureVerse; evidence: readonly Evidence[] }[],
): Candidate[] {
  const byTarget = new Map<string, { verse: ScriptureVerse; evidence: Evidence[] }>();
  for (const contribution of contributions) {
    const key = targetIdFor(contribution.verse);
    const existing = byTarget.get(key);
    if (existing) existing.evidence.push(...contribution.evidence);
    else byTarget.set(key, { verse: contribution.verse, evidence: [...contribution.evidence] });
  }
  // Sorted by key so candidate construction order is deterministic regardless
  // of which intent happened to see a verse first.
  return [...byTarget.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([targetId, entry]) => ({
      targetId,
      groupId: groupIdFor(entry.verse),
      evidence: entry.evidence,
    }));
}

export { significantWords };
