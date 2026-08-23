/**
 * Assemble the full run universe (MS-6): Ring 0 (the maintained battery,
 * verbatim) + Ring 1 (committed grammar universe + frozen paraphrases when
 * they exist) + Ring 2 (derived). One sorted JSONL the harness shards.
 *
 *   --out <file>  [--k-grammar n --k-paraphrase n]  [--per-book n]
 *   [--spot-percent n]   keep only queryIds with sha256(id) mod 100 < n
 *                        (the determinism-spot sub-universe)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { sha256Hex } from '../src/canonical.js';
import { REPO_ROOT, UNIVERSE_PATH } from '../src/universe/compileFromRepo.js';
import { parseUniverse, type UniverseLine } from '../src/universe/types.js';
import { deriveRepoRing2, readPerturbK } from '../src/perturb/deriveRepoRing2.js';

function flagValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

const argv = process.argv.slice(2);
const outPath = flagValue(argv, '--out');
if (outPath === undefined) {
  console.error('usage: buildRunUniverse --out <jsonl> [--k-grammar n --k-paraphrase n] [--per-book n] [--spot-percent n]');
  process.exit(2);
}

const explicitGrammar = flagValue(argv, '--k-grammar');
const explicitParaphrase = flagValue(argv, '--k-paraphrase');
let kGrammar: number;
let kParaphrase: number;
if (explicitGrammar !== undefined && explicitParaphrase !== undefined) {
  kGrammar = Number(explicitGrammar);
  kParaphrase = Number(explicitParaphrase);
} else {
  const signed = readPerturbK();
  if (signed === null) {
    console.error('not-applicable — perturbK unset (J43); pass --k-grammar/--k-paraphrase for shakedown.');
    process.exit(2);
  }
  kGrammar = signed.grammar;
  kParaphrase = signed.paraphrase;
}

// Ring 0: the battery, verbatim.
const battery = JSON.parse(
  readFileSync(join(REPO_ROOT, 'eval', 'battery', 'queries.json'), 'utf8'),
) as { queries: { id: string; query: string; category: string; status: string }[] };
const ring0: UniverseLine[] = battery.queries
  .filter((row) => row.status === 'active')
  .map((row) => ({
    queryId: `ring0-battery:${row.id}`,
    query: row.query,
    generator: 'ring0-battery',
    category: row.category,
    expectation: { kind: 'none' as const },
  }));

// Ring 1: committed grammar universe (+ frozen paraphrases when present).
const ring1 = parseUniverse(readFileSync(UNIVERSE_PATH, 'utf8'));
const paraphrasePath = join(REPO_ROOT, 'sweep', 'universe', 'ring1-paraphrase.jsonl');
const paraphrases = existsSync(paraphrasePath)
  ? parseUniverse(readFileSync(paraphrasePath, 'utf8'))
  : [];

// Ring 2: derived.
const perBook = flagValue(argv, '--per-book');
const ring2 = deriveRepoRing2({
  kGrammar,
  kParaphrase,
  ...(perBook !== undefined ? { perBook: Number(perBook) } : {}),
});

let lines = [...ring0, ...ring1, ...paraphrases, ...ring2.lines].sort((a, b) =>
  a.queryId < b.queryId ? -1 : a.queryId > b.queryId ? 1 : 0,
);

const spotPercent = flagValue(argv, '--spot-percent');
if (spotPercent !== undefined) {
  const percent = BigInt(Number(spotPercent));
  lines = lines.filter(
    (line) => BigInt(`0x${sha256Hex(line.queryId).slice(0, 16)}`) % 100n < percent,
  );
}

const body = lines.map((line) => JSON.stringify(line)).join('\n') + '\n';
writeFileSync(outPath, body);
console.log(`run universe: ${lines.length} lines (ring0 ${ring0.length}, ring1 ${ring1.length + paraphrases.length}, ring2 ${ring2.lines.length}${spotPercent !== undefined ? `, spot ${spotPercent}%` : ''})`);
console.log(`fingerprint: ${sha256Hex(body)}`);
