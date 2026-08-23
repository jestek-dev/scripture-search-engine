/**
 * Offline AI paraphrase batch (MS-5). CAPABILITY ONLY until J63.
 *
 * COVENANT #1: this script writes QUERIES — test inputs. Its output is
 * frozen, fingerprinted, human-skimmed data that never reaches the
 * artifact; the model never touches results, rankings, or anything
 * shipped. The sweep harness itself never calls a model — this script
 * lives under scripts/, off the harness path, needs credentials, and runs
 * only on a human's explicit invocation.
 *
 * Guards, all mandatory:
 *   --j63-acknowledged   Jesse has confirmed AI-written test queries under
 *                        covenant #1 (Appendix A, J63). Without it: refuse.
 *   --confirm-network    the caller states they intend a network call.
 *   cost ceiling         the estimate must come in under maxUsd
 *                        (paraphrase/generation-config.json) or the script
 *                        refuses before submitting anything.
 *
 * Reproducibility posture (stated plainly, per the plan): models expose no
 * sampling seed, so determinism is achieved by FREEZING the output as
 * committed, fingerprinted data after a recorded 200-line human skim — not
 * by pretending generation is repeatable.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import Anthropic from '@anthropic-ai/sdk';

import { sha256Hex } from '../src/canonical.js';
import { REPO_ROOT } from '../src/universe/compileFromRepo.js';
import { SEEDS_PATH } from '../src/paraphrase/seedsCli.js';
import type { ParaphraseSeed } from '../src/paraphrase/selectSeeds.js';
import type { ParaphraseLine } from '../src/paraphrase/validate.js';

const PROMPT_PATH = join(REPO_ROOT, 'sweep', 'paraphrase', 'PROMPT.md');
const CONFIG_PATH = join(REPO_ROOT, 'sweep', 'paraphrase', 'generation-config.json');
const OUT_DIR = join(REPO_ROOT, 'sweep', 'paraphrase', 'batches');

interface GenerationConfig {
  readonly modelId: string;
  readonly paraphrasesPerSeed: number;
  readonly maxUsd: number;
  readonly pricingPerMTokUsd: { readonly input: number; readonly output: number };
  readonly batchDiscount: number;
}

const argv = process.argv.slice(2);
if (!argv.includes('--j63-acknowledged')) {
  console.error(
    'REFUSED: J63 (AI-generated test queries under covenant #1) has not been acknowledged on ' +
      'this invocation. This script submits nothing until Jesse has confirmed the reading of ' +
      'covenant #1 recorded in Appendix A J63, and the caller passes --j63-acknowledged.',
  );
  process.exit(2);
}
if (!argv.includes('--confirm-network')) {
  console.error('REFUSED: pass --confirm-network to state a network call is intended.');
  process.exit(2);
}

const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as GenerationConfig;
const promptTemplate = readFileSync(PROMPT_PATH, 'utf8');
const seedsBody = readFileSync(SEEDS_PATH, 'utf8');
const seeds = seedsBody
  .split('\n')
  .filter((line) => line.length > 0)
  .map((line) => JSON.parse(line) as ParaphraseSeed);

// Cost estimate BEFORE any network call: prompt tokens ≈ chars/4 per seed
// request, output ≈ 12 short lines. Conservative by 1.5x.
const promptChars = promptTemplate.length + 120;
const estimatedInputTokens = Math.ceil((promptChars / 4) * seeds.length * 1.5);
const estimatedOutputTokens = Math.ceil(seeds.length * config.paraphrasesPerSeed * 20 * 1.5);
const estimateUsd =
  ((estimatedInputTokens * config.pricingPerMTokUsd.input +
    estimatedOutputTokens * config.pricingPerMTokUsd.output) /
    1_000_000) *
  config.batchDiscount;
console.log(
  `seeds: ${seeds.length}; estimated cost ≈ $${estimateUsd.toFixed(2)} (ceiling $${config.maxUsd})`,
);
if (estimateUsd > config.maxUsd) {
  console.error(
    `REFUSED: estimate $${estimateUsd.toFixed(2)} exceeds the ceiling $${config.maxUsd} in ` +
      'paraphrase/generation-config.json. Raising the ceiling is a reviewed data change.',
  );
  process.exit(2);
}

function renderPrompt(seed: ParaphraseSeed): string {
  return promptTemplate
    .replace('{{register}}', seed.register ?? 'church-member')
    .replace('{{category}}', seed.category ?? 'general')
    .replace('{{query}}', seed.query);
}

const client = new Anthropic();
const batch = await client.messages.batches.create({
  requests: seeds.map((seed) => ({
    custom_id: seed.seedId.replace(/[^a-zA-Z0-9_-]/g, '_'),
    params: {
      model: config.modelId,
      max_tokens: 1024,
      messages: [{ role: 'user' as const, content: renderPrompt(seed) }],
    },
  })),
});
console.log(`batch submitted: ${batch.id} — polling until ended`);

let status = batch;
while (status.processing_status !== 'ended') {
  await new Promise((resolve) => setTimeout(resolve, 30_000));
  status = await client.messages.batches.retrieve(batch.id);
  console.log(`  ${status.processing_status} (${status.request_counts.succeeded} succeeded)`);
}

const idToSeed = new Map(seeds.map((seed) => [seed.seedId.replace(/[^a-zA-Z0-9_-]/g, '_'), seed]));
const lines: ParaphraseLine[] = [];
let raw = 0;
for await (const result of await client.messages.batches.results(batch.id)) {
  if (result.result.type !== 'succeeded') continue;
  const seed = idToSeed.get(result.custom_id);
  if (seed === undefined) continue;
  const text = result.result.message.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .filter((piece) => piece.length > 0)
    .join('\n');
  const numbered = text
    .split('\n')
    .map((line) => /^\s*\d+[.)]\s*(.+)$/.exec(line)?.[1]?.trim())
    .filter((line): line is string => line !== undefined && line.length > 0);
  raw += numbered.length;
  for (const [index, paraphrase] of numbered.entries()) {
    lines.push({
      seedId: seed.seedId,
      index,
      paraphrase,
      ...(seed.register !== undefined ? { register: seed.register } : {}),
      // Script-FORCED crisis propagation — never left to the model.
      ...(seed.crisisAdjacent === true ? { crisisAdjacent: true as const } : {}),
    });
  }
}

lines.sort((a, b) =>
  a.seedId === b.seedId ? a.index - b.index : a.seedId < b.seedId ? -1 : 1,
);
mkdirSync(OUT_DIR, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const outPath = join(OUT_DIR, `paraphrases-${stamp}.jsonl`);
const body = lines.map((line) => JSON.stringify(line)).join('\n') + '\n';
writeFileSync(outPath, body);
writeFileSync(
  join(OUT_DIR, `paraphrases-${stamp}.manifest.json`),
  `${JSON.stringify(
    {
      formatVersion: 1,
      schema: 'scripture-search-engine/sweep-paraphrase-manifest/v1',
      modelId: config.modelId,
      promptSha256: sha256Hex(promptTemplate),
      generatedAt: new Date().toISOString(),
      seedsFingerprint: sha256Hex(seedsBody),
      counts: { seeds: seeds.length, raw, frozen: lines.length },
      leverState: 'none',
      paraphrasesSha256: sha256Hex(body),
      // Freezing requires the recorded 200-line human skim: fill this by
      // hand in the freezing PR. validate.ts fails while it is null.
      skim: null,
    },
    null,
    2,
  )}\n`,
);
console.log(`${lines.length} paraphrases → ${outPath} (skim + freeze PR still required)`);
