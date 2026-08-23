/**
 * Universe freshness check (MS-2): regenerate-and-compare, the
 * ordering-snapshot discipline applied to the committed universe. Exits
 * non-zero when the committed JSONL or manifest does not byte-match a fresh
 * compile — either the committed universe is stale, or an input changed
 * without recompiling. Never a vacuous pass: a missing committed universe is
 * a FAIL with the reason named.
 */
import { existsSync, readFileSync } from 'node:fs';

import { sha256Hex } from '../canonical.js';
import {
  compileRepoUniverse,
  UNIVERSE_MANIFEST_PATH,
  UNIVERSE_PATH,
} from './compileFromRepo.js';

if (!existsSync(UNIVERSE_PATH)) {
  console.error(`FRESHNESS FAIL: committed universe missing at ${UNIVERSE_PATH}`);
  process.exit(1);
}

const committedBody = readFileSync(UNIVERSE_PATH, 'utf8');
const compiled = compileRepoUniverse();

if (sha256Hex(committedBody) !== compiled.fingerprint) {
  console.error('FRESHNESS FAIL: committed universe does not match a fresh compile.');
  console.error(`  committed sha256: ${sha256Hex(committedBody)}`);
  console.error(`  recompiled     : ${compiled.fingerprint}`);
  console.error('  Run `npm run compile-universe --workspace sweep` and commit the diff');
  console.error('  with its UNIVERSE-VERSION review.');
  process.exit(1);
}

if (!existsSync(UNIVERSE_MANIFEST_PATH)) {
  console.error(`FRESHNESS FAIL: universe manifest missing at ${UNIVERSE_MANIFEST_PATH}`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(UNIVERSE_MANIFEST_PATH, 'utf8')) as {
  fingerprint?: string;
  lineCount?: number;
};
if (manifest.fingerprint !== compiled.fingerprint || manifest.lineCount !== compiled.lines.length) {
  console.error('FRESHNESS FAIL: universe manifest does not match the committed universe.');
  process.exit(1);
}

console.log(`FRESHNESS OK: ${compiled.lines.length} lines, fingerprint ${compiled.fingerprint}`);
