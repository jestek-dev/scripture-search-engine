/**
 * `npm run select-seeds --workspace sweep` — regenerate the committed
 * paraphrase seed list from committed inputs (deterministic; the same
 * regenerate-and-compare discipline as the grammar universe).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { sha256Hex } from '../canonical.js';
import { REPO_ROOT, UNIVERSE_PATH } from '../universe/compileFromRepo.js';
import { UNIVERSE_SEED, UNIVERSE_VERSION } from '../universe/version.js';
import { loadConceptCells, loadFeltNeedMap, loadGoldenCells } from '../universe/inputs.js';
import { parseUniverse } from '../universe/types.js';
import { selectSeeds, serializeSeeds } from './selectSeeds.js';

export const SEEDS_PATH = join(REPO_ROOT, 'sweep', 'universe', 'paraphrase-seeds.jsonl');
export const SEEDS_MANIFEST_PATH = join(
  REPO_ROOT,
  'sweep',
  'universe',
  'paraphrase-seeds.manifest.json',
);

export function selectRepoSeeds(): ReturnType<typeof selectSeeds> {
  const battery = JSON.parse(
    readFileSync(join(REPO_ROOT, 'eval', 'battery', 'queries.json'), 'utf8'),
  ) as { queries: { id: string; query: string; category: string }[] };
  return selectSeeds({
    seed: UNIVERSE_SEED,
    ring1Lines: parseUniverse(readFileSync(UNIVERSE_PATH, 'utf8')),
    frames: loadFeltNeedMap(join(REPO_ROOT, 'sweep', 'grammars', 'words', 'felt-need-map.yaml')),
    concepts: loadConceptCells(join(REPO_ROOT, 'ontology', 'concepts')),
    batteryQueries: battery.queries,
    golden: loadGoldenCells(join(REPO_ROOT, 'eval', 'golden')),
  });
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (invokedDirectly) {
  const seeds = selectRepoSeeds();
  const body = serializeSeeds(seeds);
  writeFileSync(SEEDS_PATH, body);
  const counts: Record<string, number> = {};
  for (const seed of seeds) counts[seed.stratum] = (counts[seed.stratum] ?? 0) + 1;
  writeFileSync(
    SEEDS_MANIFEST_PATH,
    `${JSON.stringify(
      {
        formatVersion: 1,
        schema: 'scripture-search-engine/sweep-paraphrase-seeds-manifest/v1',
        universeVersion: UNIVERSE_VERSION,
        seed: UNIVERSE_SEED,
        fingerprint: sha256Hex(body),
        seedCount: seeds.length,
        countsByStratum: counts,
        crisisAdjacentCount: seeds.filter((row) => row.crisisAdjacent === true).length,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`seeds: ${seeds.length}`);
  console.log(`fingerprint: ${sha256Hex(body)}`);
  for (const [stratum, count] of Object.entries(counts).sort()) console.log(`  ${stratum}: ${count}`);
}
