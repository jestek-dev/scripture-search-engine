/**
 * `npm run derive-ring2 --workspace sweep` — derive Ring 2 to a JSONL file.
 *
 * Multiplicities come from the eval/budgets.json sweep block (perturbK). While J43
 * has not signed them they are null and this tool REFUSES with a
 * not-applicable reason — it never defaults silently. Local shakedown may
 * pass --k-grammar/--k-paraphrase explicitly (an explicit flag is a
 * decision on the command line, not a silent default).
 */
import { writeFileSync } from 'node:fs';

import { sha256Hex } from '../canonical.js';
import { deriveRepoRing2, readPerturbK } from './deriveRepoRing2.js';

function flagValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  if (index === -1) return undefined;
  return argv[index + 1];
}

const argv = process.argv.slice(2);
const outPath = flagValue(argv, '--out');
if (outPath === undefined) {
  console.error('usage: derive-ring2 --out <ring2.jsonl> [--k-grammar n --k-paraphrase n] [--per-book n]');
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
    console.error(
      'not-applicable — perturbK unset in the eval/budgets.json sweep block (J43 has not signed the sweep numbers block). ' +
        'Pass --k-grammar/--k-paraphrase explicitly for local shakedown.',
    );
    process.exit(2);
  }
  kGrammar = signed.grammar;
  kParaphrase = signed.paraphrase;
}

const perBookFlag = flagValue(argv, '--per-book');
const derived = deriveRepoRing2({
  kGrammar,
  kParaphrase,
  ...(perBookFlag !== undefined ? { perBook: Number(perBookFlag) } : {}),
});
const body = derived.lines.map((line) => JSON.stringify(line)).join('\n') + '\n';
writeFileSync(outPath, body);
console.log(`ring2: ${derived.lines.length} derived lines → ${outPath}`);
console.log(`fingerprint: ${sha256Hex(body)}`);
for (const [generator, count] of Object.entries(derived.counts).sort()) {
  console.log(`  ${generator}: ${count}`);
}
