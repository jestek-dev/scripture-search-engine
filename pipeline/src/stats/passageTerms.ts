/**
 * Layer B statistics — distinctive term profiles per pericope.
 *
 * This is the answer to "how do sermons help without being read at query
 * time": a work about James 1:22 uses words at frequencies the rest of the
 * corpus does not, and those frequencies are computable once, offline.
 *
 * The measure is pointwise mutual information (PMI) between a term and a
 * pericope, against the background of every other pericope's prose:
 *
 *     pmi(t, p) = log2( P(t | p) / P(t) )
 *
 * PMI rather than raw frequency because raw frequency yields "god", "lord",
 * "man" for every passage in the canon. PMI asks a better question: is this
 * word MORE common here than it is everywhere? That is what makes "hearers",
 * "doers" and "mirror" surface for James 1 while "god" never does — which is
 * guardrail G5 expressed as arithmetic rather than as a blocklist somebody
 * has to maintain.
 */

import { significantWords, tokenStream } from '@lh/scripture-engine';

export interface ExpositionDocument {
  /** Pericope key: the passage this document expounds. */
  readonly startVerseId: number;
  readonly endVerseId: number;
  readonly sourceId: string;
  readonly locator: string;
  readonly body: string;
}

export interface PassageTerm {
  readonly startVerseId: number;
  readonly endVerseId: number;
  readonly term: string;
  readonly pmi: number;
  /** Times the term occurs in this pericope's prose. */
  readonly count: number;
  readonly sourceId: string;
  readonly locator: string;
}

export interface TermProfileOptions {
  /** G5: terms below this PMI never enter a profile. */
  readonly minPmi: number;
  /** G5: hard cap on profile size, so one verbose work cannot dominate. */
  readonly maxTermsPerPericope: number;
  /**
   * A term must occur at least this many times in a pericope to be admitted.
   * PMI is unstable for singletons: a word appearing once in one short
   * document can score enormous PMI on no real evidence.
   */
  readonly minCount: number;
}

export interface ProfileResult {
  readonly terms: readonly PassageTerm[];
  readonly documentsProcessed: number;
  readonly termsConsidered: number;
  readonly termsAdmitted: number;
}

/**
 * Builds term profiles for a set of exposition documents.
 *
 * Documents covering the same pericope are MERGED before scoring: two works
 * on Psalm 23 are more evidence about Psalm 23, not two competing profiles.
 * This is also what makes the saturation check meaningful — it can ask
 * whether the second work changed the merged profile at all.
 */
export function buildTermProfiles(
  documents: readonly ExpositionDocument[],
  options: TermProfileOptions,
): ProfileResult {
  if (documents.length === 0) {
    return { terms: [], documentsProcessed: 0, termsConsidered: 0, termsAdmitted: 0 };
  }

  // Merge by pericope key.
  const byPericope = new Map<
    string,
    { startVerseId: number; endVerseId: number; sourceIds: Set<string>; locators: Set<string>; counts: Map<string, number>; total: number }
  >();
  const backgroundCounts = new Map<string, number>();
  let backgroundTotal = 0;

  for (const document of documents) {
    const key = `${document.startVerseId}-${document.endVerseId}`;
    let entry = byPericope.get(key);
    if (!entry) {
      entry = {
        startVerseId: document.startVerseId,
        endVerseId: document.endVerseId,
        sourceIds: new Set(),
        locators: new Set(),
        counts: new Map(),
        total: 0,
      };
      byPericope.set(key, entry);
    }
    entry.sourceIds.add(document.sourceId);
    entry.locators.add(document.locator);

    for (const { token } of tokenStream(document.body)) {
      entry.counts.set(token, (entry.counts.get(token) ?? 0) + 1);
      entry.total += 1;
      backgroundCounts.set(token, (backgroundCounts.get(token) ?? 0) + 1);
      backgroundTotal += 1;
    }
  }

  const terms: PassageTerm[] = [];
  let considered = 0;

  // Sorted keys so the output row order is identical on every machine.
  for (const key of [...byPericope.keys()].sort()) {
    const entry = byPericope.get(key)!;
    if (entry.total === 0) continue;

    const scored: PassageTerm[] = [];
    for (const [term, count] of entry.counts) {
      considered += 1;
      if (count < options.minCount) continue;
      const pTermGivenPericope = count / entry.total;
      const pTerm = (backgroundCounts.get(term) ?? 0) / backgroundTotal;
      if (pTerm <= 0) continue;
      const pmi = Math.log2(pTermGivenPericope / pTerm);
      if (pmi < options.minPmi) continue;
      scored.push({
        startVerseId: entry.startVerseId,
        endVerseId: entry.endVerseId,
        term,
        pmi: Number(pmi.toFixed(6)),
        count,
        sourceId: [...entry.sourceIds].sort().join('+'),
        locator: [...entry.locators].sort().join('; '),
      });
    }

    // Strongest first, then alphabetical: a total order, so the cap always
    // keeps the same terms rather than an arbitrary subset of tied ones.
    scored.sort((a, b) => (b.pmi !== a.pmi ? b.pmi - a.pmi : a.term < b.term ? -1 : 1));
    terms.push(...scored.slice(0, options.maxTermsPerPericope));
  }

  return {
    terms,
    documentsProcessed: documents.length,
    termsConsidered: considered,
    termsAdmitted: terms.length,
  };
}

/**
 * Saturation check (G9).
 *
 * Answers the diminishing-returns question with a number instead of a
 * feeling: given a pericope already covered by K works, does adding this one
 * change its profile? Cosine distance between the before and after term
 * vectors; below `minProfileDelta` the work is recorded as saturated and its
 * prose is not ingested for that pericope.
 *
 * This is what makes "sermon #40 on Psalm 23" visibly worthless rather than
 * silently harmless.
 */
export function profileDelta(
  before: readonly PassageTerm[],
  after: readonly PassageTerm[],
): number {
  const vectorBefore = new Map(before.map((term) => [term.term, term.pmi]));
  const vectorAfter = new Map(after.map((term) => [term.term, term.pmi]));
  const keys = new Set([...vectorBefore.keys(), ...vectorAfter.keys()]);
  if (keys.size === 0) return 0;

  let dot = 0;
  let normBefore = 0;
  let normAfter = 0;
  for (const key of keys) {
    const a = vectorBefore.get(key) ?? 0;
    const b = vectorAfter.get(key) ?? 0;
    dot += a * b;
    normBefore += a * a;
    normAfter += b * b;
  }
  if (normBefore === 0 || normAfter === 0) return 1;
  const cosine = dot / (Math.sqrt(normBefore) * Math.sqrt(normAfter));
  return Math.max(0, Math.min(1, 1 - cosine));
}

export { significantWords };
