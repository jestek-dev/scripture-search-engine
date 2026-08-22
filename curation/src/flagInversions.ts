// Inversion-flag mode (P4.16 / B4): scan the lexical surface of a register
// query for SENSE INVERSIONS — passages that share tokens with the query
// but do not carry the register's meaning (see src/inversions.ts for the
// two-flag mechanism and its calibration record). Output is a review
// report; a flag is a prompt for a human to read the passage and, where
// warranted, write a guard fixture or rephrase a lexicon entry —
// fixture-first, as always.
//
// Usage:
//   npm run flag-inversions -- --concept <id> --query "caring for a dying parent"
//     [--pool 60] [--cross-claim-margin 0.1] [--no-competitors]
//     [--candidates <file.json>]   (array of {reference, text})
//     [--out <path>]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { significantWords } from '../../engine/src/tokenizer/index.js';

import { CURATION_ROOT } from './modelLock.js';
import { createEmbedder } from './embedder.js';
import { analyzeInversions, DEFAULT_CROSS_CLAIM_MARGIN, type InversionCandidate } from './inversions.js';
import { buildAllRegisters, buildRegister } from './registers.js';
import { loadCorpus, loadOntology, REPO_ROOT } from './repo.js';

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const conceptId = argValue('--concept');
const query = argValue('--query');
if (!conceptId || !query) {
  throw new Error(
    'usage: npm run flag-inversions -- --concept <id> --query "<register query>" [--pool 60] [--cross-claim-margin 0.1] [--no-competitors] [--candidates <file.json>] [--out <path>]',
  );
}
const crossClaimMargin = Number(argValue('--cross-claim-margin') ?? DEFAULT_CROSS_CLAIM_MARGIN);
const pool = Number(argValue('--pool') ?? 60);
const candidatesFile = argValue('--candidates');
const withCompetitors = !process.argv.includes('--no-competitors');

const ontology = loadOntology();
const corpus = loadCorpus();
const register = buildRegister(ontology, corpus, conceptId);

let candidates: InversionCandidate[];
if (candidatesFile) {
  candidates = JSON.parse(readFileSync(candidatesFile, 'utf8')) as InversionCandidate[];
} else {
  // Default pool: the query's lexical surface over the committed fixture
  // corpus — verses sharing at least one significant token under the
  // engine's own tokenizer, widest shared-token count first. These are
  // the verses a lexical rung could actually surface.
  const queryTokens = new Set(significantWords(query));
  candidates = corpus
    .map((verse) => ({
      verse,
      shared: new Set(significantWords(verse.text).filter((token) => queryTokens.has(token))).size,
    }))
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => b.shared - a.shared || a.verse.verseId - b.verse.verseId)
    .slice(0, pool)
    .map((entry) => ({ reference: entry.verse.reference, text: entry.verse.text }));
}

const embedder = await createEmbedder();
const competingRegisters = withCompetitors ? buildAllRegisters(ontology, corpus) : [];
console.log(
  `analyzing ${candidates.length} candidates against register "${conceptId}"` +
    (withCompetitors ? ` and ${competingRegisters.length - 1} competing registers` : ''),
);
const analysis = await analyzeInversions(embedder, {
  query,
  register,
  candidates,
  competingRegisters,
  crossClaimMargin,
});
const flagged = analysis.findings.filter((finding) => finding.flagged);

const report = {
  $schema: 'curation-inversion-report/1',
  mode: 'inversion-flag',
  query,
  conceptId,
  registerFloor: analysis.registerFloor,
  crossClaimMargin,
  model: {
    repo: embedder.lock.pinned.repo,
    revision: embedder.lock.pinned.revision,
    upstream: embedder.lock.upstream.model,
    license: embedder.lock.pinned.license,
  },
  reviewRule: [
    'FLAGS ARE PROMPTS, NOT VERDICTS. A flagged passage is one a lexical',
    'rung could surface for this register while the pinned model reads it',
    "as outside the register's meaning (below the register floor, or",
    'claimed harder by another concept). A human reads each flagged',
    'passage in context and decides; any resulting guard or rephrase is',
    'fixture-first and gauntlet-verified. The engine and pipeline never',
    'read this file (covenant #1: no AI at runtime).',
  ],
  flaggedCount: flagged.length,
  findings: analysis.findings,
};

const outPath =
  argValue('--out') ??
  join(CURATION_ROOT, 'reports', `inversions-${conceptId}-${new Date().toISOString().slice(0, 10)}.json`);
mkdirSync(join(outPath, '..'), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`wrote ${outPath}`);
console.log(`${flagged.length} of ${analysis.findings.length} candidates flagged (register floor ${analysis.registerFloor}, cross-claim margin ${crossClaimMargin}):`);
for (const finding of flagged.slice(0, 15)) {
  const competitor = finding.bestCompetitor ? ` bestOther=${finding.bestCompetitor.id}@${finding.bestCompetitor.similarity}` : '';
  console.log(
    `  FLAG ${finding.reference} [${finding.flagReasons.join('+')}] simReg=${finding.similarityToRegister}${competitor} shared=[${finding.sharedTokens.join(', ')}]`,
  );
}
console.log('');
console.log('Mandatory PR process line for any curation change made from this run:');
console.log(
  `  AI-assisted: inversion-flag report ${outPath.replace(`${REPO_ROOT}/`, '')} (model per curation/model.lock.json; every change human-decided, fixture-first, gauntlet-verified)`,
);
