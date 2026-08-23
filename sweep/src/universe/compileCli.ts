/**
 * `npm run compile-universe --workspace sweep` — recompile the committed
 * Ring-1 grammar universe from committed inputs and write it plus its
 * manifest. Any diff in the committed file after running this is a REAL
 * change (grammar/word-list/concept/seed) and travels with a
 * UNIVERSE-VERSION review; the freshness check enforces the inverse.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import {
  compileRepoUniverse,
  UNIVERSE_MANIFEST_PATH,
  UNIVERSE_PATH,
} from './compileFromRepo.js';
import { UNIVERSE_SEED, UNIVERSE_VERSION } from './version.js';

const compiled = compileRepoUniverse();
mkdirSync(dirname(UNIVERSE_PATH), { recursive: true });
writeFileSync(UNIVERSE_PATH, compiled.body);
writeFileSync(
  UNIVERSE_MANIFEST_PATH,
  `${JSON.stringify(
    {
      formatVersion: 1,
      schema: 'scripture-search-engine/sweep-universe-manifest/v1',
      universeVersion: UNIVERSE_VERSION,
      seed: UNIVERSE_SEED,
      fingerprint: compiled.fingerprint,
      lineCount: compiled.lines.length,
      countsByGenerator: compiled.countsByGenerator,
    },
    null,
    2,
  )}\n`,
);
console.log(`universe: ${compiled.lines.length} lines`);
console.log(`fingerprint: ${compiled.fingerprint}`);
for (const [generator, count] of Object.entries(compiled.countsByGenerator).sort()) {
  console.log(`  ${generator}: ${count}`);
}
