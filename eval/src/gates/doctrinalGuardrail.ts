/**
 * Doctrinal-guardrail red-flag checks (docs/DOCTRINAL-BASIS.md §5).
 *
 * Two sub-checks, both pure data lookups — no scoring, no theology
 * adjudication (CLAUDE.md #6):
 *
 *  1. Review records — every source manifest has a human doctrinal review
 *     row in `ontology/doctrinal-reviews.yaml`, and every row names a real
 *     manifest. Merged into G1-provenance: the record IS provenance, for the
 *     human admission decision. Same presence-check shape G1 already applies
 *     to checksums and archives.
 *  2. Pairing watchlist — no curated concept that speaks material-frame
 *     vocabulary anchors a §3 proof-text from
 *     `ontology/flagged-pairings.yaml`. Merged into G4-collision, the gate
 *     that already grades the compiled ontology's shape.
 *
 * Both RAISE FLAGS and never flip the verdict: like G1b-reachability, a
 * finding here warns — loud lines in the Admission Report for the human
 * merge to read — and never blocks. The one thing the checks refuse to do is
 * report `pass` without having run: missing or unparseable data files warn
 * with the reason (gate discipline: an unrun check must never look like a
 * passing one, and inside a merged gate a not-applicable would be swallowed
 * by a passing sibling).
 */

import {
  parseDoctrinalReviews,
  parseFlaggedPairings,
} from '../../../pipeline/src/importers/doctrinalReviews.js';
import type { CompiledAnchor } from '../../../pipeline/src/importers/ontologyImporter.js';
import { notApplicable, pass, warn, type GateFinding, type GateResult } from './types.js';

export const DOCTRINAL_REVIEWS_PATH = 'ontology/doctrinal-reviews.yaml';
export const FLAGGED_PAIRINGS_PATH = 'ontology/flagged-pairings.yaml';

const REVIEW_TITLE = 'Doctrinal review records';
const PAIRING_TITLE = 'Doctrinal pairing watchlist';

function unavailable(
  gate: 'G1-provenance' | 'G4-collision',
  title: string,
  path: string,
  categoryCode: string,
  problems: readonly string[],
): GateResult {
  return warn(
    gate,
    title,
    `DOCTRINAL GUARDRAIL did not run: ${path} is missing or unreadable`,
    problems.map((problem) => ({
      message:
        `DOCTRINAL RED FLAG: the guardrail check could not run — ${path}: ${problem}. ` +
        'A guardrail that cannot read its own data must say so loudly, never report pass ' +
        '(CLAUDE.md gate discipline). Restore or fix the reviewed data file.',
      subjects: [path],
      categoryCode,
    })),
  );
}

/**
 * Sub-check 1, merged into G1-provenance: presence and cross-reference of
 * the per-source doctrinal review records. Presence only — the verdict text
 * is human data this check never grades.
 */
export function doctrinalReviewRecordsCheck(
  manifestIds: readonly string[],
  reviewsFileContents: string | null,
): GateResult {
  if (manifestIds.length === 0) {
    return notApplicable(
      'G1-provenance',
      REVIEW_TITLE,
      'no source manifests admitted yet; the review-record check runs from the first admission',
    );
  }
  if (reviewsFileContents === null) {
    return unavailable(
      'G1-provenance',
      REVIEW_TITLE,
      DOCTRINAL_REVIEWS_PATH,
      'sse.gauntlet.v1.finding.g1-provenance.doctrinal-reviews-unavailable',
      ['file is missing'],
    );
  }
  const { reviews, errors } = parseDoctrinalReviews(reviewsFileContents);
  if (errors.length > 0) {
    return unavailable(
      'G1-provenance',
      REVIEW_TITLE,
      DOCTRINAL_REVIEWS_PATH,
      'sse.gauntlet.v1.finding.g1-provenance.doctrinal-reviews-unavailable',
      errors,
    );
  }

  const reviewed = new Set(reviews.map((review) => review.source));
  const manifestSet = new Set(manifestIds);
  const findings: GateFinding[] = [];

  for (const id of [...manifestIds].sort()) {
    if (reviewed.has(id)) continue;
    findings.push({
      message:
        `DOCTRINAL RED FLAG: source "${id}" has no doctrinal review record in ` +
        `${DOCTRINAL_REVIEWS_PATH}. Every admitted source needs a human review row ` +
        '(docs/DOCTRINAL-BASIS.md §5); merging the PR that adds the row is the review act. ' +
        'This flag is information for the human merge — it does not block.',
      subjects: [id],
      categoryCode: 'sse.gauntlet.v1.finding.g1-provenance.doctrinal-review-missing',
      params: { source: id },
    });
  }
  for (const review of [...reviews].sort((left, right) => left.source.localeCompare(right.source))) {
    if (manifestSet.has(review.source)) continue;
    findings.push({
      message:
        `DOCTRINAL RED FLAG: review record for "${review.source}" names no manifest in ` +
        'pipeline/manifests/. The source was renamed or removed and the record is orphaned — ' +
        'a review row that reviews nothing reads as protection while providing none.',
      subjects: [review.source],
      categoryCode: 'sse.gauntlet.v1.finding.g1-provenance.doctrinal-review-orphaned',
      params: { source: review.source },
    });
  }

  const metrics = {
    doctrinalReviewRecords: reviews.length,
    doctrinalReviewFlags: findings.length,
  };
  if (findings.length > 0) {
    return {
      ...warn(
        'G1-provenance',
        REVIEW_TITLE,
        `DOCTRINAL GUARDRAIL: ${findings.length} review-record flag(s) — see findings`,
        findings,
      ),
      metrics,
    };
  }
  return pass(
    'G1-provenance',
    REVIEW_TITLE,
    `doctrinal review record present for all ${manifestIds.length} source(s), no orphans (0 flags)`,
    metrics,
  );
}

export interface GuardrailConcept {
  readonly id: string;
  readonly label: string;
  readonly lexicon: readonly string[];
}

function words(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 0));
}

/** The material-frame keywords a concept speaks in its id, label, or lexicon. */
function materialVocabulary(
  concept: GuardrailConcept,
  keywords: readonly string[],
): readonly string[] {
  const spoken = words(concept.id);
  for (const word of words(concept.label)) spoken.add(word);
  for (const phrase of concept.lexicon) for (const word of words(phrase)) spoken.add(word);
  return keywords.filter((keyword) => spoken.has(keyword));
}

function overlaps(
  left: { readonly start: number; readonly end: number },
  right: { readonly start: number; readonly end: number },
): boolean {
  return left.start <= right.end && right.start <= left.end;
}

/**
 * Sub-check 2, merged into G4-collision: no material-framed concept anchors
 * a watchlist proof-text. Fires zero times at the time of wiring (the
 * 2026-08-15 audit confirmed no such pairing exists); it protects future
 * additions.
 */
export function flaggedPairingsCheck(input: {
  readonly concepts: readonly GuardrailConcept[];
  readonly anchors: readonly CompiledAnchor[];
  /** False when compileOntology reported errors; anchors are then untrustworthy. */
  readonly ontologyCompiled: boolean;
  readonly watchlistFileContents: string | null;
}): GateResult {
  if (!input.ontologyCompiled) {
    return notApplicable(
      'G4-collision',
      PAIRING_TITLE,
      'ontology failed to compile, so there are no trustworthy anchors to scan; ' +
        'fix the compile errors and the pairing scan runs again',
    );
  }
  if (input.watchlistFileContents === null) {
    return unavailable(
      'G4-collision',
      PAIRING_TITLE,
      FLAGGED_PAIRINGS_PATH,
      'sse.gauntlet.v1.finding.g4-collision.doctrinal-watchlist-unavailable',
      ['file is missing'],
    );
  }
  const { pairings, errors } = parseFlaggedPairings(input.watchlistFileContents);
  if (pairings === null || errors.length > 0) {
    return unavailable(
      'G4-collision',
      PAIRING_TITLE,
      FLAGGED_PAIRINGS_PATH,
      'sse.gauntlet.v1.finding.g4-collision.doctrinal-watchlist-unavailable',
      errors.length > 0 ? errors : ['file did not yield a watchlist'],
    );
  }

  const conceptsById = new Map(input.concepts.map((concept) => [concept.id, concept]));
  const findings: GateFinding[] = [];
  for (const anchor of input.anchors) {
    const concept = conceptsById.get(anchor.conceptId);
    if (!concept) continue;
    const vocabulary = materialVocabulary(concept, pairings.materialFrameKeywords);
    if (vocabulary.length === 0) continue;
    for (const entry of pairings.watchlist) {
      if (!overlaps(entry.range, { start: anchor.startVerseId, end: anchor.endVerseId })) continue;
      findings.push({
        message:
          `DOCTRINAL RED FLAG: concept "${concept.id}" (label "${concept.label}") speaks ` +
          `material-frame vocabulary (${vocabulary.join(', ')}) and anchors watchlist ` +
          `reference ${entry.ref} via source "${anchor.sourceId}". Watchlist concern: ` +
          `${entry.concern} Criterion: docs/DOCTRINAL-BASIS.md §3 — the verse is not the ` +
          'problem; pairing it with a material-return frame is. This flag is information ' +
          'for the human merge — it does not block.',
        subjects: [concept.id, entry.ref],
        categoryCode: 'sse.gauntlet.v1.finding.g4-collision.doctrinal-pairing-flag',
        params: {
          conceptId: concept.id,
          ref: entry.ref,
          sourceId: anchor.sourceId,
          keywords: vocabulary,
        },
      });
    }
  }

  const metrics = {
    doctrinalPairingFlags: findings.length,
    doctrinalWatchlistReferences: pairings.watchlist.length,
    doctrinalScannedAnchors: input.anchors.length,
  };
  if (findings.length > 0) {
    return {
      ...warn(
        'G4-collision',
        PAIRING_TITLE,
        `DOCTRINAL GUARDRAIL: ${findings.length} flagged pairing(s) — see findings`,
        findings,
      ),
      metrics,
    };
  }
  return pass(
    'G4-collision',
    PAIRING_TITLE,
    `doctrinal pairing watchlist: 0 flags — scanned ${input.anchors.length} anchor(s) ` +
      `against ${pairings.watchlist.length} watchlist reference(s) and ` +
      `${pairings.materialFrameKeywords.length} material-frame keyword(s)`,
    metrics,
  );
}
