/**
 * G4 sub-check — the bare-word inventory.
 *
 * `ontology/lexicon-inventory.yaml` records one reviewed decision per
 * compiled concept id: which bare single-word queries must fire the concept
 * (`admitted`) and which were deliberately kept out (`skipped`, with the
 * reason). This check enforces the table against the compiled ontology using
 * the engine's own `significantWords` — one tokenizer, so the inventory can
 * never drift from what the matcher actually does (CLAUDE.md #4).
 *
 * BLOCKING, merged into G4 the way the doctrinal pairing watchlist is:
 *   - a compiled concept with no inventory row (a future pack cannot ship
 *     without a bare-word decision — "a pack with no fixtures is rejected
 *     structurally", applied to bare words);
 *   - a row for a concept that does not exist (renamed or removed — the row
 *     now decides nothing under that name);
 *   - an `admitted` token that does not fire (the decision reads as coverage
 *     the matcher does not provide);
 *   - a `skipped` token that DOES fire (the 2026-08-08 accident class:
 *     "god" and "work" fired concepts nobody intended);
 *   - a skip with an empty reason (structurally rejected by the parser).
 *
 * Report-only, on the passing result: a firing bare token with no `admitted`
 * entry — behaviour without a recorded decision. `singleTokenCollapses`
 * keeps running on the main G4 row; this finding adds the inventory's view
 * so the missing row edit is named directly.
 *
 * "Fires" is exact: a bare query is one significant token, and containment
 * matching (ConceptRepository.matchConcepts) fires a concept iff some
 * lexicon phrase normalizes to exactly that token.
 */

import { significantWords } from '@jestek-dev/scripture-engine/internal';

import { parseBareWordInventory } from '../../../pipeline/src/importers/lexiconInventory.js';
import type { ConceptRecord } from './collision.js';
import { fail, notApplicable, pass, type GateFinding, type GateResult } from './types.js';

export const LEXICON_INVENTORY_PATH = 'ontology/lexicon-inventory.yaml';

const TITLE = 'Lexicon bare-word inventory';
const CATEGORY = 'sse.gauntlet.v1.finding.g4-collision.lexicon-inventory';

function finding(category: string, message: string, subjects: readonly string[]): GateFinding {
  return { message, subjects, categoryCode: `${CATEGORY}-${category}` };
}

/**
 * The bare tokens that actually fire a concept: normalized single-token
 * lexicon phrases, keyed by concept id.
 */
function firingTokensByConcept(concepts: readonly ConceptRecord[]): Map<string, Set<string>> {
  const firing = new Map<string, Set<string>>();
  for (const concept of concepts) {
    const tokens = new Set<string>();
    for (const phrase of concept.lexicon) {
      const normalized = significantWords(phrase);
      if (normalized.length === 1) tokens.add(normalized[0]!);
    }
    firing.set(concept.id, tokens);
  }
  return firing;
}

export function lexiconInventoryCheck(input: {
  readonly concepts: readonly ConceptRecord[];
  readonly inventoryFileContents: string | null;
}): GateResult {
  if (input.concepts.length === 0) {
    return notApplicable(
      'G4-collision',
      TITLE,
      'no concepts in ontology/concepts yet; the inventory check runs from the first concept',
    );
  }
  if (input.inventoryFileContents === null) {
    // Fail-closed, not warn: the inventory IS the mechanism that makes a
    // bare-word decision mandatory, so its absence is the exact gap it
    // exists to close.
    return fail(
      'G4-collision',
      TITLE,
      `${LEXICON_INVENTORY_PATH} is missing`,
      [
        finding(
          'missing-file',
          `${LEXICON_INVENTORY_PATH} is missing or unreadable, so no concept carries a ` +
            'reviewed bare-word decision. Restore the reviewed inventory file.',
          [LEXICON_INVENTORY_PATH],
        ),
      ],
    );
  }

  const { rows, errors } = parseBareWordInventory(input.inventoryFileContents);
  const findings: GateFinding[] = errors.map((message) =>
    finding('malformed', `${LEXICON_INVENTORY_PATH}: ${message}`, [LEXICON_INVENTORY_PATH]),
  );

  const known = new Set(input.concepts.map((concept) => concept.id));
  const firing = firingTokensByConcept(input.concepts);
  const rowsById = new Map(rows.map((row) => [row.conceptId, row]));

  for (const row of rows) {
    if (!known.has(row.conceptId)) {
      findings.push(
        finding(
          'row-orphaned',
          `no concept "${row.conceptId}" compiles from ontology/concepts, but the inventory has a ` +
            'row for it. The concept was renamed or removed and the row now decides nothing — ' +
            'rows are keyed by compiled concept id, never by filename.',
          [row.conceptId],
        ),
      );
    }
  }

  for (const concept of [...input.concepts].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    const row = rowsById.get(concept.id);
    if (!row) {
      findings.push(
        finding(
          'row-missing',
          `${concept.id}: no row in ${LEXICON_INVENTORY_PATH}. Every concept must carry an ` +
            'explicit bare-word decision — admitted tokens that fire, or skipped tokens with the ' +
            'reason. A pack with no bare-word decision is rejected structurally.',
          [concept.id],
        ),
      );
      continue;
    }
    const fires = firing.get(concept.id)!;

    for (const token of row.admitted) {
      const normalized = significantWords(token);
      if (normalized.length !== 1) {
        findings.push(
          finding(
            'token-not-significant',
            `${concept.id}: admitted "${token}" does not normalize to one significant token ` +
              `(got: ${normalized.join(', ') || 'nothing — a stopword'}). A bare-word decision ` +
              'must be about a word the tokenizer keeps.',
            [concept.id],
          ),
        );
        continue;
      }
      if (!fires.has(normalized[0]!)) {
        findings.push(
          finding(
            'admitted-does-not-fire',
            `${concept.id}: admitted "${token}" (token "${normalized[0]}") does not fire the ` +
              'concept — no lexicon phrase normalizes to that single token. Either add the ' +
              'lexicon entry (fixture first) or remove the admitted token: the inventory must ' +
              'describe behaviour, not intention.',
            [concept.id],
          ),
        );
      }
    }

    for (const skip of row.skipped) {
      const normalized = significantWords(skip.token);
      if (normalized.length !== 1) {
        findings.push(
          finding(
            'token-not-significant',
            `${concept.id}: skipped "${skip.token}" does not normalize to one significant token ` +
              `(got: ${normalized.join(', ') || 'nothing — a stopword'}). A bare-word decision ` +
              'must be about a word the tokenizer keeps.',
            [concept.id],
          ),
        );
        continue;
      }
      if (fires.has(normalized[0]!)) {
        findings.push(
          finding(
            'skipped-fires',
            `${concept.id}: skipped "${skip.token}" (token "${normalized[0]}") FIRES the concept — ` +
              `a lexicon phrase normalizes to exactly that token, against the recorded decision ` +
              `("${skip.reason}"). This is the 2026-08-08 accident class; rephrase the collapsing ` +
              'lexicon entry or change the decision.',
            [concept.id],
          ),
        );
      }
    }
  }

  const admittedCount = rows.reduce((count, row) => count + row.admitted.length, 0);
  const skippedCount = rows.reduce((count, row) => count + row.skipped.length, 0);
  const metrics = {
    inventoryRows: rows.length,
    admittedBareWords: admittedCount,
    skippedBareWords: skippedCount,
  };

  if (findings.length > 0) {
    return fail(
      'G4-collision',
      TITLE,
      `${findings.length} bare-word decision(s) missing, orphaned, or contradicted`,
      findings,
      metrics,
    );
  }

  // Report-only: firing tokens nobody has decided on. Never blocks — the
  // decision it asks for is a reviewed data change, and the loud line in the
  // Admission Report is what makes the class impossible to miss.
  const undecided: GateFinding[] = [];
  for (const concept of [...input.concepts].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    const row = rowsById.get(concept.id)!;
    const admittedTokens = new Set(
      row.admitted.map((token) => significantWords(token)[0]).filter((token) => token !== undefined),
    );
    for (const token of [...firing.get(concept.id)!].sort()) {
      if (!admittedTokens.has(token)) {
        undecided.push(
          finding(
            'firing-token-undecided',
            `${concept.id}: the bare token "${token}" fires this concept but has no admitted entry ` +
              `in ${LEXICON_INVENTORY_PATH} — behaviour without a recorded decision. Admit it or ` +
              'rephrase the collapsing lexicon entry.',
            [concept.id],
          ),
        );
      }
    }
  }

  const base = pass(
    'G4-collision',
    TITLE,
    `${rows.length} concept(s) carry an explicit bare-word decision ` +
      `(${admittedCount} admitted, ${skippedCount} skipped)`,
    metrics,
  );
  if (undecided.length === 0) return base;
  return {
    ...base,
    summary: `${base.summary}; ${undecided.length} firing bare token(s) have no recorded decision`,
    findings: undecided,
  };
}
