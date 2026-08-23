/**
 * Convert a FROZEN, validated paraphrase batch into Ring-1 universe lines
 * (MS-5). Paraphrases inherit their seed's expectation at confidence
 * 'inherited' — a miss routes to AI grading, not straight to a defect —
 * and feed MS-4's perturbation at k=3, which is what carries Ring 2 to its
 * floor at zero extra grading cost via the oracle.
 */
import { sha256Hex } from '../canonical.js';
import type { UniverseLine } from '../universe/types.js';
import type { ParaphraseSeed } from './selectSeeds.js';
import type { ParaphraseLine } from './validate.js';

export function paraphrasesToUniverse(
  lines: readonly ParaphraseLine[],
  seeds: readonly ParaphraseSeed[],
  universeVersion: string,
): UniverseLine[] {
  const bySeed = new Map(seeds.map((seed) => [seed.seedId, seed]));
  const out = new Map<string, UniverseLine>();
  for (const line of lines) {
    const seed = bySeed.get(line.seedId);
    if (seed === undefined) throw new Error(`paraphrase references unknown seed ${line.seedId}`);
    const queryId = `paraphrase:${sha256Hex(line.paraphrase).slice(0, 16)}`;
    if (out.has(queryId)) continue;
    out.set(queryId, {
      queryId,
      query: line.paraphrase,
      generator: 'paraphrase',
      ...(seed.register !== undefined ? { register: seed.register } : {}),
      ...(seed.category !== undefined ? { category: seed.category } : {}),
      expectation: seed.expectation,
      ...(seed.crisisAdjacent === true ? { crisisAdjacent: true as const } : {}),
      confidence: 'inherited',
      universeVersion,
    });
  }
  return [...out.values()].sort((a, b) => (a.queryId < b.queryId ? -1 : 1));
}
