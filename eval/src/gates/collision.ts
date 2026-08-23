/**
 * G4 — concept collision.
 *
 * The single most likely way a well-meaning addition degrades this system:
 * someone adds "hearing and doing" while "obedience" already exists, their
 * lexicons overlap, and anchors dilute across two fuzzy concepts that each
 * half-fire. Nothing errors; results just get quietly worse.
 *
 * So the check runs BEFORE the pack is written, in the curation skill, and
 * again in CI. A rejection names the colliding concept and says which way to
 * resolve it — merge, or differentiate the lexicons — because "collision
 * detected" without a suggested move just moves the guesswork.
 */

import { significantWords } from '@jestek-dev/scripture-engine';

import {
  collapseAcknowledgmentKey,
  parseLexiconInventory,
  type LexiconCollapseAcknowledgment,
} from '../../../pipeline/src/importers/lexiconInventory.js';
import { fail, pass, type GateFinding, type GateResult } from './types.js';

export interface ConceptRecord {
  readonly id: string;
  readonly label: string;
  readonly lexicon: readonly string[];
}

export interface CollisionThresholds {
  readonly maxSharedPhraseRatio: number;
  readonly maxSharedTokenRatio: number;
  readonly minLexiconEntries: number;
}

function normalizePhrase(phrase: string): string {
  return significantWords(phrase).join(' ');
}

function tokenSet(lexicon: readonly string[]): Set<string> {
  const tokens = new Set<string>();
  for (const phrase of lexicon) {
    for (const token of significantWords(phrase)) tokens.add(token);
  }
  return tokens;
}

function ratio(sharedCount: number, smallerSize: number): number {
  return smallerSize === 0 ? 0 : sharedCount / smallerSize;
}

export function collisionGate(
  concepts: readonly ConceptRecord[],
  thresholds: CollisionThresholds,
): GateResult {
  const findings: GateFinding[] = [];

  // Structural check first: a one-entry lexicon cannot express a concept and
  // will collide with everything near it.
  for (const concept of concepts) {
    if (concept.lexicon.length < thresholds.minLexiconEntries) {
      findings.push({
        message:
          `${concept.id}: lexicon has ${concept.lexicon.length} entry/entries, ` +
          `minimum is ${thresholds.minLexiconEntries}. A concept needs enough ` +
          `surface forms to be reachable by more than one phrasing.`,
        subjects: [concept.id],
      });
    }
  }

  const prepared = concepts.map((concept) => {
    // Collisions are DETECTED on normalized phrases (so "hearing and doing"
    // and "hears and does" collide), but REPORTED with the author's original
    // wording — a finding that prints "hear do" makes the reader translate
    // back to what they actually typed.
    const original = new Map<string, string>();
    for (const phrase of concept.lexicon) {
      const normalized = normalizePhrase(phrase);
      if (normalized && !original.has(normalized)) original.set(normalized, phrase);
    }
    return {
      concept,
      phrases: new Set(original.keys()),
      original,
      tokens: tokenSet(concept.lexicon),
    };
  });

  // Sorted pairwise walk keeps findings deterministic.
  const sorted = [...prepared].sort((a, b) => (a.concept.id < b.concept.id ? -1 : 1));
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      const a = sorted[i]!;
      const b = sorted[j]!;

      const sharedPhrases = [...a.phrases].filter((phrase) => b.phrases.has(phrase)).sort();
      const phraseRatio = ratio(
        sharedPhrases.length,
        Math.min(a.phrases.size, b.phrases.size),
      );
      const sharedTokens = [...a.tokens].filter((token) => b.tokens.has(token)).sort();
      const tokenRatio = ratio(sharedTokens.length, Math.min(a.tokens.size, b.tokens.size));

      if (phraseRatio > thresholds.maxSharedPhraseRatio) {
        findings.push({
          message:
            `${a.concept.id} and ${b.concept.id} share ${sharedPhrases.length} ` +
            `lexicon phrase(s) (${(phraseRatio * 100).toFixed(0)}% of the smaller ` +
            `lexicon; limit ${(thresholds.maxSharedPhraseRatio * 100).toFixed(0)}%). ` +
            `Shared: "${sharedPhrases
              .map((phrase) => a.original.get(phrase) ?? phrase)
              .join('", "')}". ` +
            `Resolve by MERGING them, or by moving the shared phrases to whichever ` +
            `concept they define and giving the other distinct phrasing.`,
          subjects: [a.concept.id, b.concept.id],
        });
      } else if (tokenRatio > thresholds.maxSharedTokenRatio) {
        findings.push({
          message:
            `${a.concept.id} and ${b.concept.id} share ` +
            `${(tokenRatio * 100).toFixed(0)}% of their vocabulary ` +
            `(limit ${(thresholds.maxSharedTokenRatio * 100).toFixed(0)}%): ` +
            `${sharedTokens.join(', ')}. They may be one concept, or one may need ` +
            `phrasing that distinguishes it.`,
          subjects: [a.concept.id, b.concept.id],
        });
      }
    }
  }

  if (findings.length > 0) {
    return fail(
      'G4-collision',
      'Concept collision',
      `${findings.length} collision(s) among ${concepts.length} concept(s)`,
      findings,
    );
  }
  return pass(
    'G4-collision',
    'Concept collision',
    concepts.length === 0
      ? 'no concepts defined yet'
      : `${concepts.length} concept(s) are mutually distinct`,
    { concepts: concepts.length },
  );
}

/**
 * Lexicon phrases whose real width is one token.
 *
 * A phrase's matching width is its SIGNIFICANT-token count, not its word
 * count: "god with us" is four words and one token, because `with` and `us`
 * are stopwords. Such an entry behaves as a bare-word trigger for the whole
 * concept, which is a legitimate thing to want and a terrible thing to have by
 * accident — the query "god" fired `presence-of-god` for weeks because nobody
 * could see that "god with us" had collapsed.
 *
 * Most collapses are benign and several are actively useful (`risen`,
 * `anxiou`, `conqueror`). The failure this prevents is not "a collapse
 * exists" but "a collapse exists and nobody decided", so the enumeration
 * stays a visible list a curator can scan — and lexiconInventoryCheck below
 * turns it into a deny-list: every collapse must be acknowledged in
 * `ontology/lexicon-inventory.yaml` or G4 fails naming it.
 */
export function singleTokenCollapses(
  concepts: readonly ConceptRecord[],
): readonly { conceptId: string; phrase: string; token: string }[] {
  const found: { conceptId: string; phrase: string; token: string }[] = [];
  for (const concept of concepts) {
    for (const phrase of concept.lexicon) {
      const tokens = significantWords(phrase);
      // One token from several words: the width the curator sees is not the
      // width the matcher uses.
      if (tokens.length === 1 && phrase.trim().split(/\s+/).length > 1) {
        found.push({ conceptId: concept.id, phrase, token: tokens[0]! });
      }
    }
  }
  return found.sort((a, b) =>
    a.conceptId !== b.conceptId
      ? a.conceptId < b.conceptId
        ? -1
        : 1
      : a.phrase < b.phrase
        ? -1
        : 1,
  );
}

export const LEXICON_INVENTORY_PATH = 'ontology/lexicon-inventory.yaml';

/**
 * The acknowledged-or-blocked deny-list over singleTokenCollapses.
 *
 * The enumeration above was advisory for a reason — most collapses are
 * legitimate — but advisory-only meant a collapse could exist with nobody
 * having decided it. This check closes that: every current collapse must be
 * acknowledged by a matching entry in `ontology/lexicon-inventory.yaml`
 * ({ conceptId, phrase, token, intended: true, reviewedBy, date, note }),
 * and every entry must acknowledge a collapse that still exists with the
 * token it still collapses to. Unacknowledged collapses fail; stale or
 * malformed acknowledgments fail too — a record that no longer matches the
 * lexicon it describes is itself a defect (same design as G1's stale
 * acknowledgedUnarchivedRollingSources rule). Acknowledged collapses stay
 * visible as findings on the passing gate: the diagnostic never disappears,
 * it just stops being undecided.
 *
 * The gate never scores theology — it enforces that a human DECIDED, which
 * is exactly the shape covenant #6 allows.
 */
export function lexiconInventoryCheck(
  concepts: readonly ConceptRecord[],
  inventoryFileContents: string | null,
): GateResult {
  const title = 'Single-token collapse inventory';
  const collapses = singleTokenCollapses(concepts);
  // Keys join via the parser's own collapseAcknowledgmentKey — the dedupe
  // and the deny-list matching are two halves of one mechanism and must
  // never disagree on what identifies an entry.
  const collapseByKey = new Map(
    collapses.map((entry) => [collapseAcknowledgmentKey(entry.conceptId, entry.phrase), entry]),
  );

  const acknowledged: LexiconCollapseAcknowledgment[] = [];
  const findings: GateFinding[] = [];

  if (inventoryFileContents === null) {
    if (collapses.length === 0) {
      return pass(
        'G4-collision',
        title,
        'no lexicon phrase collapses to a single token; no inventory file required',
        { singleTokenCollapses: 0, acknowledgedCollapses: 0 },
      );
    }
    findings.push({
      message:
        `${LEXICON_INVENTORY_PATH} is missing but ${collapses.length} lexicon phrase(s) ` +
        'collapse to a single token — every collapse needs an explicit human decision',
      categoryCode: 'sse.gauntlet.v1.finding.g4-collision.lexicon-inventory-missing',
    });
  } else {
    const { collapses: entries, errors } = parseLexiconInventory(inventoryFileContents);
    for (const error of errors) {
      findings.push({
        message: `${LEXICON_INVENTORY_PATH}: ${error}`,
        categoryCode: 'sse.gauntlet.v1.finding.g4-collision.lexicon-inventory-malformed',
      });
    }
    for (const entry of entries) {
      const live = collapseByKey.get(collapseAcknowledgmentKey(entry.conceptId, entry.phrase));
      if (!live) {
        findings.push({
          message:
            `stale acknowledgment: ${entry.conceptId} "${entry.phrase}" is acknowledged in ` +
            `${LEXICON_INVENTORY_PATH} but no such single-token collapse exists any more ` +
            '(concept or phrase removed, rephrased, or no longer collapsing) — delete the entry',
          subjects: [entry.conceptId],
          categoryCode: 'sse.gauntlet.v1.finding.g4-collision.lexicon-inventory-stale',
        });
        continue;
      }
      if (live.token !== entry.token) {
        findings.push({
          message:
            `stale acknowledgment: ${entry.conceptId} "${entry.phrase}" now collapses to ` +
            `"${live.token}" but the inventory acknowledges "${entry.token}" — ` +
            're-review the entry against the current tokenizer output',
          subjects: [entry.conceptId],
          categoryCode: 'sse.gauntlet.v1.finding.g4-collision.lexicon-inventory-stale',
        });
        continue;
      }
      acknowledged.push(entry);
    }
  }

  const acknowledgedKeys = new Set(
    acknowledged.map((entry) => collapseAcknowledgmentKey(entry.conceptId, entry.phrase)),
  );
  for (const collapse of collapses) {
    if (acknowledgedKeys.has(collapseAcknowledgmentKey(collapse.conceptId, collapse.phrase))) {
      continue;
    }
    findings.push({
      message:
        `${collapse.conceptId}: "${collapse.phrase}" normalizes to the single token ` +
        `"${collapse.token}", so the bare query "${collapse.token}" fires this concept ` +
        'and the phrase faces the thin-cue gate inside longer queries. Acknowledge it in ' +
        `${LEXICON_INVENTORY_PATH} ({ conceptId, phrase, token, intended: true, ` +
        'reviewedBy, date, note }) or rephrase/remove the lexicon entry.',
      subjects: [collapse.conceptId],
      categoryCode: 'sse.gauntlet.v1.finding.g4-collision.lexicon-collapse-unacknowledged',
    });
  }

  const metrics = {
    singleTokenCollapses: collapses.length,
    acknowledgedCollapses: acknowledged.length,
  };
  if (findings.length > 0) {
    return fail(
      'G4-collision',
      title,
      `${findings.length} single-token-collapse finding(s): every collapse must carry ` +
        'a current human acknowledgment',
      findings,
      metrics,
    );
  }
  if (collapses.length === 0) {
    return pass('G4-collision', title, 'no single-token collapses', metrics);
  }
  // The diagnostic listing survives acknowledgment: visible, never blocking.
  return {
    ...pass(
      'G4-collision',
      title,
      `${collapses.length} single-token collapse(s), all acknowledged in ` +
        LEXICON_INVENTORY_PATH,
      metrics,
    ),
    findings: acknowledged.map((entry) => ({
      message:
        `${entry.conceptId}: "${entry.phrase}" -> "${entry.token}" — acknowledged by ` +
        `${entry.reviewedBy} (${entry.date}): ${entry.note}`,
      subjects: [entry.conceptId],
      categoryCode: 'sse.gauntlet.v1.finding.g4-collision.lexicon-collapse-acknowledged',
    })),
  };
}
