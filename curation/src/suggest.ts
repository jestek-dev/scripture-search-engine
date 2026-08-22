// Suggest mode (P4.16 / B4): the pinned embedding model PROPOSES candidate
// anchors for one concept; a human approves each with a rationale; the
// gauntlet verifies the resulting pack; only static reviewed anchors ship.
//
// This tool writes a REPORT for a human reviewer — it never writes YAML,
// never touches ontology/, and nothing under pipeline/ or engine/ reads
// its output (enforced: pipeline/test/curationBoundary.test.ts). Every
// candidate row carries an empty approval block; the PR that lands any
// pack curated with this tool MUST carry the process line printed at the
// end of the run (Q6 shape).
//
// Usage: npm run suggest -- --concept <id> [--top 25] [--out reports/...]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

import { CURATION_ROOT } from './modelLock.js';
import { cosine, createEmbedder, meanVector } from './embedder.js';
import { loadCorpus, loadOntology, REPO_ROOT } from './repo.js';

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const conceptId = argValue('--concept');
if (!conceptId) throw new Error('usage: npm run suggest -- --concept <id> [--top 25] [--out <path>]');
const top = Number(argValue('--top') ?? 25);

const ontology = loadOntology();
const concept = ontology.concepts.find((entry) => entry.id === conceptId);
if (!concept) throw new Error(`unknown concept id "${conceptId}"`);
const registerTexts = [
  concept.label,
  ...ontology.lexicon.filter((entry) => entry.conceptId === conceptId).map((entry) => entry.phrase),
];
const anchorRanges = ontology.anchors
  .filter((anchor) => anchor.conceptId === conceptId)
  .map((anchor) => ({ start: anchor.startVerseId, end: anchor.endVerseId }));

const corpus = loadCorpus();
const embedder = await createEmbedder();

// Verse embeddings are cached per (model revision, corpus bytes) — both
// pinned, so the cache can never go stale silently.
const corpusSha = createHash('sha256')
  .update(readFileSync(join(REPO_ROOT, 'pipeline', 'fixtures', 'web-subset.json')))
  .digest('hex');
const cacheDir = join(CURATION_ROOT, '.cache');
const cachePath = join(
  cacheDir,
  `verse-embeddings-${embedder.lock.pinned.revision.slice(0, 8)}-${corpusSha.slice(0, 8)}.json`,
);
let verseVectors: number[][];
if (existsSync(cachePath)) {
  verseVectors = JSON.parse(readFileSync(cachePath, 'utf8')) as number[][];
  if (verseVectors.length !== corpus.length) throw new Error('embedding cache is inconsistent; delete curation/.cache');
  console.log(`loaded ${verseVectors.length} cached verse embeddings`);
} else {
  console.log(`embedding ${corpus.length} verses with ${embedder.lock.pinned.repo} @ ${embedder.lock.pinned.revision.slice(0, 8)}…`);
  verseVectors = await embedder.embed(corpus.map((verse) => verse.text));
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(cachePath, JSON.stringify(verseVectors));
}

const registerVector = meanVector(await embedder.embed(registerTexts));
const round = (value: number): number => Math.round(value * 10_000) / 10_000;
const scored = corpus
  .map((verse, index) => ({ verse, similarity: round(cosine(registerVector, verseVectors[index] as number[])) }))
  .sort((a, b) => b.similarity - a.similarity || a.verse.verseId - b.verse.verseId)
  .slice(0, top);

const report = {
  $schema: 'curation-suggest-report/1',
  mode: 'suggest',
  conceptId,
  conceptLabel: concept.label,
  registerTexts,
  model: {
    repo: embedder.lock.pinned.repo,
    revision: embedder.lock.pinned.revision,
    upstream: embedder.lock.upstream.model,
    license: embedder.lock.pinned.license,
  },
  corpus: { file: 'pipeline/fixtures/web-subset.json', sha256: corpusSha, verses: corpus.length },
  shippingRule: [
    'PROPOSALS ONLY. No candidate below reaches ontology/ without: (1) a',
    'human setting approved=true with their name in reviewedBy and a',
    'written rationale, (2) a golden fixture written FIRST for the gap the',
    'anchor closes, (3) the gauntlet Admission Report on the resulting',
    'pack, and (4) a human PR merge. Similarity scores are review aids and',
    'must never be copied into anchor weights. The engine and pipeline',
    'never read this file (covenant #1: no AI at runtime).',
  ],
  candidates: scored.map(({ verse, similarity }) => ({
    reference: verse.reference,
    text: verse.text,
    similarity,
    alreadyAnchored: anchorRanges.some((range) => verse.verseId >= range.start && verse.verseId <= range.end),
    approval: { approved: false, reviewedBy: null, rationale: null },
  })),
};

const outPath = argValue('--out') ?? join(CURATION_ROOT, 'reports', `suggest-${conceptId}-${new Date().toISOString().slice(0, 10)}.json`);
mkdirSync(join(outPath, '..'), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`wrote ${outPath} (${scored.length} candidates, ${report.candidates.filter((candidate) => candidate.alreadyAnchored).length} already anchored)`);
console.log('');
console.log('Mandatory PR process line for any pack curated from this run:');
console.log(`  AI-assisted: suggest-mode report ${outPath.replace(`${REPO_ROOT}/`, '')} (model per curation/model.lock.json; every shipped anchor human-approved with rationale; gauntlet-verified)`);
