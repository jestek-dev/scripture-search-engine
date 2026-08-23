// Inversion-flag core (P4.16 / B4, inversion-flag mode).
//
// A SENSE INVERSION is the failure shape this project keeps re-measuring
// by hand: a passage that shares surface tokens with a register's query
// but does not carry the register's meaning — sometimes the opposite of
// it — so a lexical rung surfaces it confidently for exactly the searcher
// it will wound or mislead. The three canonical measured cases, which the
// acceptance test (test/inversions.test.ts) requires this module to
// rediscover:
//   - "comforter" -> Job 16:2 ("Miserable comforters are you all!")
//   - "new beginnings" -> Ecclesiastes 1:9 ("no new thing under the sun")
//   - fn13: "caring for a dying parent" -> Colossians 3:20-21
//     (child-raising served to someone losing a parent)
//
// Two flags, matching the two measured failure taxonomies (calibration
// runs 2026-08-22, all-MiniLM-L6-v2 per model.lock.json — no single
// embedding signal separates all three, and the calibration numbers are
// recorded in the acceptance test):
//
// 1. BELOW-REGISTER-FLOOR (the stance/sense rider: Job 16:2, Eccl 1:9).
//    The candidate rides the query's tokens, but its similarity to the
//    register centroid falls below every one of the register's own floor
//    texts (its approved anchor passages). Measured: Job 0.3109 vs floor
//    0.5210; Eccl 0.4001 vs floor 0.4716.
// 2. CROSS-CONCEPT-CLAIM (the wrong-concept fire: fn13). The candidate's
//    affinity for a DIFFERENT concept's register exceeds its affinity for
//    this one by a margin. Measured: Colossians 3:20-21 scores 0.7919 on
//    parenting vs 0.5105 on caring-for-aging-parents (gap 0.2814) — the
//    flag names the claiming concept, which IS fn13's diagnosis. Default
//    margin 0.10: measured true-inversion gaps are 0.19-0.28, while the
//    largest token-sharing honest-anchor gap measured is 0.057.
//
// Both flags require the candidate to share at least one significant
// token with the query under the ENGINE'S OWN tokenizer (one tokenizer —
// covenant #4): the tool hunts lexical-rung accidents, and the gate is
// what keeps deliberately-shared anchors (e.g. 2 Cor 1:3-4 across the
// comfort packs) and merely-adjacent anchors (e.g. Acts 3:19, nearer to
// repentance than to new-creation) from being flagged for belonging to
// more than one register.
//
// A flag is a PROMPT FOR A HUMAN to read the passage, never a verdict,
// and nothing here writes to any file the pipeline or engine reads
// (covenant #1: no AI at runtime).
import { significantWords } from '../../engine/src/tokenizer/index.js';

import { cosine, meanVector, type Embedder } from './embedder.js';

export interface RegisterDefinition {
  /** Concept id (or any stable name) this register belongs to. */
  readonly id: string;
  /** Everything that describes the register: label, lexicon phrases, and its approved anchor passage texts. */
  readonly texts: readonly string[];
  /**
   * The register's trusted passage texts (its approved anchors). Their
   * centroid similarities define the register floor for flag 1. May be
   * empty, in which case flag 1 never fires.
   */
  readonly floorTexts: readonly string[];
}

export interface InversionCandidate {
  readonly reference: string;
  readonly text: string;
}

export interface InversionFinding {
  readonly reference: string;
  readonly text: string;
  readonly sharedTokens: readonly string[];
  readonly similarityToRegister: number;
  readonly similarityToQuery: number;
  readonly registerFloor: number | null;
  readonly bestCompetitor: { readonly id: string; readonly similarity: number } | null;
  readonly crossClaimGap: number | null;
  readonly flagged: boolean;
  readonly flagReasons: readonly ('below-register-floor' | 'cross-concept-claim')[];
}

export interface InversionReport {
  readonly query: string;
  readonly registerId: string;
  readonly registerFloor: number | null;
  readonly crossClaimMargin: number;
  readonly findings: readonly InversionFinding[];
}

/** See the calibration record above: true gaps 0.19-0.28, honest-anchor gaps <= 0.057. */
export const DEFAULT_CROSS_CLAIM_MARGIN = 0.1;

const round = (value: number): number => Math.round(value * 10_000) / 10_000;

export async function analyzeInversions(
  embedder: Embedder,
  options: {
    readonly query: string;
    readonly register: RegisterDefinition;
    readonly candidates: readonly InversionCandidate[];
    /** Other registers that might claim a candidate (flag 2). Optional. */
    readonly competingRegisters?: readonly RegisterDefinition[];
    readonly crossClaimMargin?: number;
  },
): Promise<InversionReport> {
  const { query, register, candidates } = options;
  const crossClaimMargin = options.crossClaimMargin ?? DEFAULT_CROSS_CLAIM_MARGIN;
  const competitors = options.competingRegisters ?? [];

  const registerCentroid = meanVector(await embedder.embed(register.texts));
  const floorSims =
    register.floorTexts.length > 0
      ? (await embedder.embed(register.floorTexts)).map((vector) => cosine(registerCentroid, vector))
      : [];
  const registerFloor = floorSims.length > 0 ? round(Math.min(...floorSims)) : null;

  const competitorCentroids = new Map<string, number[]>();
  for (const competitor of competitors) {
    if (competitor.id === register.id) continue;
    competitorCentroids.set(competitor.id, meanVector(await embedder.embed(competitor.texts)));
  }

  const queryTokens = new Set(significantWords(query));
  const queryVector = (await embedder.embed([query]))[0] as number[];
  const candidateVectors = candidates.length > 0 ? await embedder.embed(candidates.map((c) => c.text)) : [];

  const findings = candidates.map((candidate, index) => {
    const vector = candidateVectors[index] as number[];
    const sharedTokens = [
      ...new Set(significantWords(candidate.text).filter((token) => queryTokens.has(token))),
    ].sort();
    const similarityToRegister = round(cosine(registerCentroid, vector));
    const similarityToQuery = round(cosine(queryVector, vector));

    let bestCompetitor: { id: string; similarity: number } | null = null;
    for (const [id, centroid] of competitorCentroids) {
      const similarity = round(cosine(centroid, vector));
      if (!bestCompetitor || similarity > bestCompetitor.similarity) bestCompetitor = { id, similarity };
    }
    const crossClaimGap = bestCompetitor ? round(bestCompetitor.similarity - similarityToRegister) : null;

    const flagReasons: ('below-register-floor' | 'cross-concept-claim')[] = [];
    if (sharedTokens.length > 0) {
      if (registerFloor !== null && similarityToRegister < registerFloor) {
        flagReasons.push('below-register-floor');
      }
      if (crossClaimGap !== null && crossClaimGap >= crossClaimMargin) {
        flagReasons.push('cross-concept-claim');
      }
    }
    return {
      reference: candidate.reference,
      text: candidate.text,
      sharedTokens,
      similarityToRegister,
      similarityToQuery,
      registerFloor,
      bestCompetitor,
      crossClaimGap,
      flagged: flagReasons.length > 0,
      flagReasons,
    };
  });

  return { query, registerId: register.id, registerFloor, crossClaimMargin, findings };
}
