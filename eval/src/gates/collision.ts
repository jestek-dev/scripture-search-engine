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
