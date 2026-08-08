/**
 * Layer B statistics — corroborated term profiles, resolved to the VERSE.
 *
 * This is the answer to "how do sermons help without being read at query
 * time": a work about James 1:22 uses words at frequencies the rest of the
 * corpus does not, and those frequencies are computable once, offline.
 *
 * Three design rules, each earned by a measured failure:
 *
 * 1. PMI, not raw frequency. Raw frequency yields "god", "lord", "man" for
 *    every passage in the canon. PMI asks whether a word is MORE common here
 *    than everywhere — guardrail G5 as arithmetic instead of a blocklist.
 *
 * 2. Corroboration across independent sources. One author's distinctive
 *    vocabulary is distinctive OF THAT AUTHOR — the Maclaren-only build
 *    faithfully surfaced `mellow` and `troth`. Only vocabulary that two or
 *    more expositors independently reach for is evidence about the passage.
 *
 * 3. Agreement is resolved at the VERSE, not at the author's span. Authors
 *    do not chop Scripture into the same pieces: Maclaren writes one essay
 *    on Psalm 23:1-6 while Spurgeon writes a note per verse, and requiring
 *    exact span equality meant two famous expositors "never agreed" about
 *    Psalm 23 at all. Instead, every span PROJECTS to the verses it covers,
 *    and a term is admitted for verse v when enough sources covering v used
 *    it. Nobody has to decide canonical chunk boundaries — the authors' own
 *    spans carry that information, and verse-level intersection extracts the
 *    agreement. Deliberate thought-units (a "chunk attached to a thought")
 *    are the CONCEPT layer's job, curated on purpose with provenance.
 *
 * Specificity is preserved rather than flattened: each admitted term records
 * the narrowest attesting span, so a word from a one-verse note can outscore
 * the same word inherited from a whole-psalm essay at query time.
 */

import { significantWords, tokenStream } from '@jestek-dev/scripture-engine';

import { isBlockedTerm } from './ocrBlocklist.js';

export interface ExpositionDocument {
  /** The author's OWN span — never normalized to anyone else's chunking. */
  readonly startVerseId: number;
  readonly endVerseId: number;
  /** Manifest id of the volume this came from. Provenance, not corroboration. */
  readonly sourceId: string;
  /**
   * Who WROTE it. Corroboration counts these, never sourceIds.
   *
   * A multi-volume work is many manifest ids and one author, and two editions
   * of the same work are more ids still. Counting ids would let a second
   * edition corroborate the first — the same man agreeing with himself, which
   * is the exact failure `minSources` exists to prevent. The distinction is
   * cheap here and impossible to recover downstream.
   */
  readonly authorId: string;
  readonly locator: string;
  readonly body: string;
}

export interface VerseTerm {
  readonly verseId: number;
  readonly term: string;
  /** Best (max) section-level PMI among the attesting sections. */
  readonly pmi: number;
  /** Combined occurrences across all attesting sections. */
  readonly count: number;
  /** Sources that used this term in a section covering this verse, '+'-joined. */
  readonly sourceIds: string;
  /** Distinct AUTHORS attesting this term. Volumes are in `sourceIds`. */
  readonly authorCount: number;
  /**
   * Verse-width of the NARROWEST attesting section. 1 means some author said
   * this while writing about exactly this verse; 6 means the tightest thing
   * we have is a six-verse essay. Query-time scoring uses this so tight
   * commentary beats diffuse commentary without discarding the diffuse.
   */
  readonly minSpanVerses: number;
  /** Locator of that narrowest attesting section, for provenance display. */
  readonly locator: string;
}

export interface TermProfileOptions {
  /** G5: terms below this PMI never enter a profile. */
  readonly minPmi: number;
  /** G5: hard cap per verse, so one verbose author cannot dominate. */
  readonly maxTermsPerVerse: number;
  /**
   * Minimum combined occurrences across attesting sections. PMI is unstable
   * for singletons: a word appearing once can score enormous PMI on no real
   * evidence.
   */
  readonly minCount: number;
  /**
   * Minimum distinct sources that must attest a term AT THIS VERSE. This is
   * the lever that separates theology from idiolect. 1 keeps everything
   * (correct when only one source exists); 2+ requires corroboration.
   */
  readonly minSources: number;
}

export interface ProfileResult {
  readonly terms: readonly VerseTerm[];
  readonly documentsProcessed: number;
  readonly termsConsidered: number;
  readonly termsAdmitted: number;
}

/** Longest span we will project; anything wider is a parse artifact. */
const MAX_PROJECTION_VERSES = 200;

function spanWidth(startVerseId: number, endVerseId: number): number {
  // Within one chapter, verse ids are consecutive integers, so width is exact.
  // Cross-chapter spans (rare; our parsers emit single-chapter sections) fall
  // back to the id distance, which overstates width and therefore only ever
  // UNDER-weights — the safe direction for an approximation.
  return Math.min(MAX_PROJECTION_VERSES, endVerseId - startVerseId + 1);
}

interface Accumulator {
  count: number;
  bestPmi: number;
  /** Distinct AUTHORS attesting this term — the corroboration count. */
  /**
   * Attesting authors and volumes as BITMASKS, not Sets.
   *
   * There is one accumulator per (verse, term) pair and there are millions of
   * them — Matthew Henry's section essays alone project several million. Two
   * Set objects each costs more than the rest of the accumulator combined, and
   * the build ran out of memory at 12 GB before this change. Authors and
   * volumes number in the dozens at most, so a bit each is exact, not an
   * approximation.
   */
  authorMask: number;
  sourceMask: number;
  minSpan: number;
  locator: string;
}

/** Populated count of set bits — the corroboration count. */
function popcount(mask: number): number {
  let value = mask - ((mask >> 1) & 0x55555555);
  value = (value & 0x33333333) + ((value >> 2) & 0x33333333);
  return (((value + (value >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
}

/**
 * Builds verse-level term profiles from exposition documents.
 *
 * The background distribution for PMI is the whole document set, so a term is
 * "distinctive" relative to everything these expositors wrote — not relative
 * to English at large, which we have no corpus for and do not need.
 */
export function buildTermProfiles(
  documents: readonly ExpositionDocument[],
  options: TermProfileOptions,
): ProfileResult {
  if (documents.length === 0) {
    return { terms: [], documentsProcessed: 0, termsConsidered: 0, termsAdmitted: 0 };
  }

  // Bit assignments, taken in SORTED id order so the masks — and therefore
  // every downstream tie-break — are identical on every machine and every run.
  const authorIds = [...new Set(documents.map((d) => d.authorId))].sort();
  const sourceIds = [...new Set(documents.map((d) => d.sourceId))].sort();
  if (authorIds.length > 31 || sourceIds.length > 31) {
    throw new Error(
      `buildTermProfiles: ${authorIds.length} authors / ${sourceIds.length} sources exceeds ` +
        'the 31 a bitmask can hold. Widen to BigInt before admitting more.',
    );
  }
  const authorBit = new Map(authorIds.map((id, index) => [id, 1 << index]));
  const sourceBit = new Map(sourceIds.map((id, index) => [id, 1 << index]));

  // Pass 1: background counts across every document.
  const backgroundCounts = new Map<string, number>();
  let backgroundTotal = 0;
  const documentTokens: Map<string, number>[] = [];
  for (const document of documents) {
    const counts = new Map<string, number>();
    for (const { token } of tokenStream(document.body)) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
      backgroundCounts.set(token, (backgroundCounts.get(token) ?? 0) + 1);
      backgroundTotal += 1;
    }
    documentTokens.push(counts);
  }
  if (backgroundTotal === 0) {
    return { terms: [], documentsProcessed: documents.length, termsConsidered: 0, termsAdmitted: 0 };
  }

  // Pass 2: per-section PMI, projected onto every verse the section covers.
  const byVerse = new Map<number, Map<string, Accumulator>>();
  let considered = 0;

  documents.forEach((document, index) => {
    const counts = documentTokens[index]!;
    let sectionTotal = 0;
    for (const value of counts.values()) sectionTotal += value;
    if (sectionTotal === 0) return;

    const width = spanWidth(document.startVerseId, document.endVerseId);

    for (const [term, count] of counts) {
      considered += 1;
      const pTermGivenSection = count / sectionTotal;
      const pTerm = (backgroundCounts.get(term) ?? 0) / backgroundTotal;
      if (pTerm <= 0) continue;
      const pmi = Math.log2(pTermGivenSection / pTerm);
      // Cheap pre-filter: a term that cannot clear the floor even at its best
      // section never needs projecting.
      if (pmi < options.minPmi) continue;

      for (
        let verseId = document.startVerseId;
        verseId <= document.endVerseId && verseId - document.startVerseId < MAX_PROJECTION_VERSES;
        verseId += 1
      ) {
        let verseTerms = byVerse.get(verseId);
        if (!verseTerms) {
          verseTerms = new Map();
          byVerse.set(verseId, verseTerms);
        }
        const existing = verseTerms.get(term);
        if (existing) {
          existing.count += count;
          existing.authorMask |= authorBit.get(document.authorId)!;
          existing.sourceMask |= sourceBit.get(document.sourceId)!;
          if (pmi > existing.bestPmi) existing.bestPmi = Number(pmi.toFixed(6));
          if (width < existing.minSpan) {
            existing.minSpan = width;
            existing.locator = document.locator;
          }
        } else {
          verseTerms.set(term, {
            count,
            bestPmi: Number(pmi.toFixed(6)),
            authorMask: authorBit.get(document.authorId)!,
            sourceMask: sourceBit.get(document.sourceId)!,
            minSpan: width,
            locator: document.locator,
          });
        }
      }
    }
  });

  // Pass 3: admission per verse — corroboration, count floor, cap.
  const terms: VerseTerm[] = [];
  for (const verseId of [...byVerse.keys()].sort((a, b) => a - b)) {
    const verseTerms = byVerse.get(verseId)!;
    const admitted: VerseTerm[] = [];
    for (const [term, accumulator] of verseTerms) {
      // Reviewed scanning artifacts never enter a profile. Checked here rather
      // than in the tokenizer because the tokenizer is shared with the runtime
      // and must stay byte-identical on both sides; this is an ADMISSION rule.
      if (isBlockedTerm(term)) continue;
      if (accumulator.count < options.minCount) continue;
      // Corroboration is measured in AUTHORS, not volumes or editions.
      if (popcount(accumulator.authorMask) < options.minSources) continue;
      admitted.push({
        verseId,
        term,
        pmi: accumulator.bestPmi,
        count: accumulator.count,
        sourceIds: sourceIds.filter((_, index) => accumulator.sourceMask & (1 << index)).join('+'),
        authorCount: popcount(accumulator.authorMask),
        minSpanVerses: accumulator.minSpan,
        locator: accumulator.locator,
      });
    }
    // Strongest first, then alphabetical: a total order, so the cap always
    // keeps the same terms rather than an arbitrary subset of tied ones.
    admitted.sort((a, b) => (b.pmi !== a.pmi ? b.pmi - a.pmi : a.term < b.term ? -1 : 1));
    terms.push(...admitted.slice(0, options.maxTermsPerVerse));
  }

  return {
    terms,
    documentsProcessed: documents.length,
    termsConsidered: considered,
    termsAdmitted: terms.length,
  };
}

/**
 * Saturation measure (G9): cosine distance between two profile sets, keyed by
 * (verse, term). Near zero means the added documents changed nothing — the
 * vein is mined out.
 */
export function profileDelta(
  before: readonly VerseTerm[],
  after: readonly VerseTerm[],
): number {
  const key = (term: VerseTerm): string => `${term.verseId}|${term.term}`;
  const vectorBefore = new Map(before.map((term) => [key(term), term.pmi]));
  const vectorAfter = new Map(after.map((term) => [key(term), term.pmi]));
  const keys = new Set([...vectorBefore.keys(), ...vectorAfter.keys()]);
  if (keys.size === 0) return 0;

  let dot = 0;
  let normBefore = 0;
  let normAfter = 0;
  for (const entry of keys) {
    const a = vectorBefore.get(entry) ?? 0;
    const b = vectorAfter.get(entry) ?? 0;
    dot += a * b;
    normBefore += a * a;
    normAfter += b * b;
  }
  if (normBefore === 0 || normAfter === 0) return 1;
  const cosine = dot / (Math.sqrt(normBefore) * Math.sqrt(normAfter));
  return Math.max(0, Math.min(1, 1 - cosine));
}

export { significantWords };
