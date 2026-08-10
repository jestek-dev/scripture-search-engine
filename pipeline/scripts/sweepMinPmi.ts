/**
 * Sweep the G5 distinctiveness floor and report what each value would admit.
 *
 * `distinctiveness.minPmi: 2.0` was chosen before any data existed and has
 * never been compared against an alternative. NEEDS-JESSE §2.3 records it as
 * "still a guess"; its observed selectivity has already drifted from 99.5% to
 * 84.9% of candidates rejected as the corpus grew, which is exactly the kind
 * of number that quietly stops meaning what it meant.
 *
 * This does not change the threshold. It produces the comparison a reviewer
 * needs to change it deliberately — or to record that 2.0 is right and stop
 * wondering.
 *
 * REQUIRES THE SOURCE CORPORA. The distiller needs the exposition texts, which
 * are gitignored downloads, so this cannot run in an environment that cannot
 * reach the source hosts. It fails loudly with that reason rather than
 * producing a plausible-looking number from the committed subset — the subset
 * is already filtered at PMI 2.0, so sweeping it would "measure" the threshold
 * using data the threshold already shaped, and every value would look fine.
 *
 * Usage:
 *   npm run fetch:sources --workspace pipeline
 *   npx tsx scripts/sweepMinPmi.ts [--values 1.5,2,2.5]
 */

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { EXPOSITION_SOURCES } from '../src/expositionSources.js';
import { loadExposition } from '../src/loadExpositions.js';
import { buildTermProfiles, type VerseTerm } from '../src/stats/passageTerms.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCES = join(HERE, '..', 'sources');

function parseValues(): number[] {
  const flag = process.argv.indexOf('--values');
  if (flag === -1) return [1.5, 2.0, 2.5];
  return (process.argv[flag + 1] ?? '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));
}

/** Terms that survive at `floor` but not at the next-higher floor, sampled. */
function sample(terms: readonly VerseTerm[], count: number): string[] {
  return [...terms]
    .sort((a, b) => (a.pmi !== b.pmi ? a.pmi - b.pmi : a.term < b.term ? -1 : 1))
    .slice(0, count)
    .map((term) => `${term.term}@${term.verseId}(${term.pmi.toFixed(2)})`);
}

async function main(): Promise<void> {
  if (!existsSync(SOURCES)) {
    process.stderr.write(
      'pipeline/sources/ does not exist, so there is nothing to sweep.\n\n' +
        'Run `npm run fetch:sources --workspace pipeline` first. This script\n' +
        'deliberately refuses to fall back to the committed distillate: that\n' +
        'subset was already filtered at minPmi 2.0, so sweeping it would grade\n' +
        'the threshold with data the threshold created, and every candidate\n' +
        'value would look equally fine.\n',
    );
    process.exitCode = 2;
    return;
  }

  const documents = EXPOSITION_SOURCES.flatMap(
    (spec) => loadExposition(spec, SOURCES)?.documents ?? [],
  );
  if (documents.length === 0) {
    process.stderr.write('No exposition documents loaded — sources present but unreadable.\n');
    process.exitCode = 2;
    return;
  }
  process.stdout.write(`${documents.length} exposition documents\n\n`);
  process.stdout.write(
    `${'minPmi'.padStart(7)}${'admitted'.padStart(11)}${'verses'.padStart(9)}` +
      `${'terms/verse'.padStart(13)}  weakest admitted\n`,
  );

  for (const floor of parseValues().sort((a, b) => a - b)) {
    const result = buildTermProfiles(documents, {
      minPmi: floor,
      maxTermsPerVerse: 40,
      minCount: 2,
      minSources: 2,
    });
    const verses = new Set(result.terms.map((term) => term.verseId)).size;
    process.stdout.write(
      String(floor).padStart(7) +
        String(result.termsAdmitted).padStart(11) +
        String(verses).padStart(9) +
        (result.termsAdmitted / Math.max(1, verses)).toFixed(2).padStart(13) +
        `  ${sample(result.terms, 6).join(' ')}\n`,
    );
  }

  process.stdout.write(
    '\nRead the WEAKEST ADMITTED column, not the counts: the question is whether\n' +
      'the terms a lower floor lets in are theology or noise. Counts alone cannot\n' +
      'answer that, which is why this prints examples rather than a verdict.\n',
  );
}

await main();
