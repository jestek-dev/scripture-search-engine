/**
 * Deterministic misspelling/typo perturbation (MS-4). Pure raw-string
 * transforms pre-engine — the tokenizer is never touched (covenant #4).
 *
 * Ring 2 is a derived, uncommitted but FULLY PINNED function of Ring 1:
 * every edit draws from the counter-based PRNG (no floats, no global RNG),
 * so re-derivation is byte-identical anywhere. Each derived line carries
 * the base-query-oracle expectation: its expected results are its BASE
 * query's own snapshot from the same run, with any correction CITED, never
 * silent — the economy that makes ~85% of Ring 2 free to grade.
 */
import { decisionStream, type DecisionStream } from '../prng.js';
import type { UniverseLine } from '../universe/types.js';
import { QWERTY_ADJACENT } from './qwerty.js';

export interface PhoneticRule {
  readonly from: string;
  readonly to: string;
}

export type EditKind = 'transposition' | 'qwerty-adjacent' | 'doubling' | 'phonetic';

const EDIT_KINDS: readonly EditKind[] = ['transposition', 'qwerty-adjacent', 'doubling', 'phonetic'];

/** Tokens worth perturbing: alphabetic, long enough to be correctable. */
const ELIGIBLE_TOKEN = /^[a-z]{4,}$/i;

function applyEdit(
  token: string,
  kind: EditKind,
  rules: readonly PhoneticRule[],
  stream: DecisionStream,
): string | null {
  switch (kind) {
    case 'transposition': {
      if (token.length < 4) return null;
      // Interior positions only — first/last-letter swaps read as different words.
      const index = 1 + stream.nextBelow(token.length - 3);
      return (
        token.slice(0, index) + token[index + 1]! + token[index]! + token.slice(index + 2)
      );
    }
    case 'qwerty-adjacent': {
      const positions = [...token]
        .map((ch, index) => ({ ch: ch.toLowerCase(), index }))
        .filter(({ ch }) => QWERTY_ADJACENT[ch] !== undefined);
      if (positions.length === 0) return null;
      const { ch, index } = positions[stream.nextBelow(positions.length)]!;
      const neighbors = QWERTY_ADJACENT[ch]!;
      const substitute = neighbors[stream.nextBelow(neighbors.length)]!;
      return token.slice(0, index) + substitute + token.slice(index + 1);
    }
    case 'doubling': {
      const index = stream.nextBelow(token.length);
      return token.slice(0, index + 1) + token[index]! + token.slice(index + 1);
    }
    case 'phonetic': {
      const applicable = rules.filter((rule) => token.toLowerCase().includes(rule.from));
      if (applicable.length === 0) return null;
      const rule = applicable[stream.nextBelow(applicable.length)]!;
      const at = token.toLowerCase().indexOf(rule.from);
      return token.slice(0, at) + rule.to + token.slice(at + rule.from.length);
    }
  }
}

/**
 * Derive up to `k` distinct perturbed variants of one query. Returns fewer
 * (possibly zero) when the query has no eligible token or edits collide —
 * never a filler line, never a duplicate of the base.
 */
export function perturbQuery(
  seed: string,
  baseQueryId: string,
  query: string,
  k: number,
  rules: readonly PhoneticRule[],
): { readonly query: string; readonly editedToken: string; readonly perturbedToken: string }[] {
  const words = query.split(' ');
  const eligible = words
    .map((word, index) => ({ word, index }))
    .filter(({ word }) => ELIGIBLE_TOKEN.test(word));
  if (eligible.length === 0) return [];
  const variants: { query: string; editedToken: string; perturbedToken: string }[] = [];
  const seen = new Set<string>([query]);
  for (let counter = 0; variants.length < k && counter < k * 8; counter += 1) {
    const stream = decisionStream(seed, 'perturb', baseQueryId, counter);
    const target = eligible[stream.nextBelow(eligible.length)]!;
    const kind = EDIT_KINDS[stream.nextBelow(EDIT_KINDS.length)]!;
    const edited = applyEdit(target.word, kind, rules, stream);
    if (edited === null || edited === target.word) continue;
    const perturbed = [...words.slice(0, target.index), edited, ...words.slice(target.index + 1)].join(
      ' ',
    );
    if (seen.has(perturbed)) continue;
    seen.add(perturbed);
    variants.push({ query: perturbed, editedToken: target.word, perturbedToken: edited });
  }
  return variants;
}

export interface DeriveRing2Options {
  readonly seed: string;
  /** Variants per grammar-generated Ring-1 line (plan default 2; J43 signs). */
  readonly kGrammar: number;
  /** Variants per paraphrase (confidence 'inherited') line (plan default 3; J43 signs). */
  readonly kParaphrase: number;
  readonly rules: readonly PhoneticRule[];
}

/**
 * Derive the typo half of Ring 2 from Ring-1 lines. 100% coverage: every
 * base line with an eligible token yields variants; each derived line rides
 * its base row's crisis ruling and carries the base-query-oracle
 * expectation (correction must be cited; corrected results ≡ base results).
 */
export function deriveTypoRing(
  lines: readonly UniverseLine[],
  options: DeriveRing2Options,
): UniverseLine[] {
  const derived: UniverseLine[] = [];
  for (const line of lines) {
    const k = line.confidence === 'inherited' ? options.kParaphrase : options.kGrammar;
    const variants = perturbQuery(options.seed, line.queryId, line.query, k, options.rules);
    for (const [index, variant] of variants.entries()) {
      derived.push({
        queryId: `perturb:${line.queryId}~${index}`,
        query: variant.query,
        generator: 'perturb',
        ...(line.register !== undefined ? { register: line.register } : {}),
        category: 'misspelling',
        expectation: {
          kind: 'base-query-oracle',
          baseQueryId: line.queryId,
          requireCitedCorrection: true,
        },
        ...(line.crisisAdjacent === true ? { crisisAdjacent: true as const } : {}),
        confidence: 'generated',
        ...(line.universeVersion !== undefined ? { universeVersion: line.universeVersion } : {}),
      });
    }
  }
  derived.sort((a, b) => (a.queryId < b.queryId ? -1 : a.queryId > b.queryId ? 1 : 0));
  return derived;
}
