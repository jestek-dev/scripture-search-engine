/**
 * Layer-2 offline AI grading over the needs-ai-grade queue (MS-8).
 * CAPABILITY ONLY until J64 ratifies rubric-v1.
 *
 * Covenant-legal: this tooling's output reaches the artifact only as
 * human-authored fixtures through the gauntlet and Jesse's merge. It runs
 * off the harness path, needs credentials, and runs only on a human's
 * explicit invocation — AI grading is deliberately NOT in the CI workflow.
 *
 * Guards, all mandatory:
 *   --j64-acknowledged   rubric-v1 (harmful definition, mandatory
 *                        escalation, script-forced crisisReview, the
 *                        no-downgrade rule) has been ratified by Jesse.
 *   --confirm-network    a network call is intended.
 *   cost ceiling         refuse before submitting when the estimate
 *                        exceeds --max-usd (default 400 ≈ the plan's
 *                        $320/full-pass envelope with margin).
 *
 * Reproducibility: grades are frozen per GRADING-MANIFEST (model id +
 * rubric sha + date + queue sha) and never regenerated silently; a rubric
 * or model change is a new manifest and an MS-9 re-validation.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import Anthropic from '@anthropic-ai/sdk';

import { sha256Hex } from '../src/canonical.js';
import { REPO_ROOT } from '../src/universe/compileFromRepo.js';
import { GRADING_MANIFEST_SCHEMA, type Layer2Grade, GRADE_VALUES } from '../src/grade/layer2.js';
import type { SnapshotRecord } from '../src/snapshot.js';
import type { UniverseLine } from '../src/universe/types.js';

const RUBRIC_PATH = join(REPO_ROOT, 'sweep', 'grading', 'rubric-v1.md');
const MODEL_ID = 'claude-opus-5';
const PRICING = { inputPerMTok: 5.0, outputPerMTok: 25.0, batchDiscount: 0.5 };

function flagValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

const argv = process.argv.slice(2);
if (!argv.includes('--j64-acknowledged')) {
  console.error(
    'REFUSED: rubric-v1 ratification (J64) has not been acknowledged on this invocation. ' +
      'No grading batch is submitted before Jesse ratifies the rubric and the no-downgrade rule; ' +
      'pass --j64-acknowledged once he has.',
  );
  process.exit(2);
}
if (!argv.includes('--confirm-network')) {
  console.error('REFUSED: pass --confirm-network to state a network call is intended.');
  process.exit(2);
}
const queuePath = flagValue(argv, '--queue');
const snapshotPath = flagValue(argv, '--snapshot');
const outDir = flagValue(argv, '--out');
if (!queuePath || !snapshotPath || !outDir) {
  console.error('usage: gradeQueue --queue <needs-ai-grade.jsonl> --snapshot <merged.jsonl> --out <dir> [--max-usd n]');
  process.exit(2);
}
const maxUsd = Number(flagValue(argv, '--max-usd') ?? '400');

const rubric = readFileSync(RUBRIC_PATH, 'utf8');
const queueBody = readFileSync(queuePath, 'utf8');
const queue = queueBody
  .split('\n')
  .filter((line) => line.length > 0)
  .map((line) => JSON.parse(line) as { queryId: string; line: UniverseLine });
const snapshots = new Map<string, SnapshotRecord>();
for (const raw of readFileSync(snapshotPath, 'utf8').split('\n')) {
  if (raw.length === 0) continue;
  const record = JSON.parse(raw) as SnapshotRecord;
  snapshots.set(record.queryId, record);
}

// Cost estimate BEFORE any network call (rubric + top-10 text per row).
const perRowChars = rubric.length + 4000;
const estInputTokens = Math.ceil((perRowChars / 4) * queue.length * 1.2);
const estOutputTokens = Math.ceil(queue.length * 400);
const estimateUsd =
  ((estInputTokens * PRICING.inputPerMTok + estOutputTokens * PRICING.outputPerMTok) / 1_000_000) *
  PRICING.batchDiscount;
console.log(`queue: ${queue.length} rows; estimated cost ≈ $${estimateUsd.toFixed(2)} (ceiling $${maxUsd})`);
if (estimateUsd > maxUsd) {
  console.error(`REFUSED: estimate exceeds the ceiling. Split the queue or raise --max-usd deliberately.`);
  process.exit(2);
}

function rowPrompt(entry: { queryId: string; line: UniverseLine }): string {
  const record = snapshots.get(entry.queryId);
  const results =
    record?.kind === 'discovery'
      ? (record.results ?? []).map((result) => ({
          rank: result.rank,
          reference: result.reference,
          webText: result.excerpt,
          reasons: result.reasons,
        }))
      : [];
  return (
    `${rubric}\n\n---\n\nROW TO GRADE (JSON):\n` +
    JSON.stringify(
      {
        queryId: entry.queryId,
        query: entry.line.query,
        register: entry.line.register ?? 'church-member',
        category: entry.line.category ?? 'general',
        crisisAdjacent: entry.line.crisisAdjacent === true,
        outcomeKind: record?.kind ?? 'missing',
        results,
      },
      null,
      2,
    ) +
    '\n\nRespond with ONLY the JSON object the rubric defines.'
  );
}

const client = new Anthropic();
const batch = await client.messages.batches.create({
  requests: queue.map((entry) => ({
    custom_id: entry.queryId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64),
    params: {
      model: MODEL_ID,
      max_tokens: 2048,
      messages: [{ role: 'user' as const, content: rowPrompt(entry) }],
    },
  })),
});
console.log(`batch ${batch.id} submitted — polling`);
let status = batch;
while (status.processing_status !== 'ended') {
  await new Promise((resolve) => setTimeout(resolve, 60_000));
  status = await client.messages.batches.retrieve(batch.id);
  console.log(`  ${status.processing_status} (${status.request_counts.succeeded} succeeded)`);
}

const customIdToRow = new Map(
  queue.map((entry) => [entry.queryId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64), entry]),
);
const grades: Layer2Grade[] = [];
for await (const result of await client.messages.batches.results(batch.id)) {
  if (result.result.type !== 'succeeded') continue;
  const row = customIdToRow.get(result.custom_id);
  if (row === undefined) continue;
  const text = result.result.message.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('');
  const jsonMatch = /\{[\s\S]*\}/.exec(text);
  if (jsonMatch === null) continue;
  const parsed = JSON.parse(jsonMatch[0]) as Partial<Layer2Grade>;
  if (!GRADE_VALUES.includes(parsed.grade as never)) continue;
  grades.push({
    queryId: row.queryId,
    grade: parsed.grade!,
    perResult: parsed.perResult ?? [],
    ...(parsed.defectClass !== undefined ? { defectClass: parsed.defectClass } : {}),
    explanationFaithful: parsed.explanationFaithful === true,
    escalate: parsed.escalate === true,
    ...(parsed.escalateReason !== undefined ? { escalateReason: parsed.escalateReason } : {}),
    // Script-FORCED: the row's own tag decides, regardless of model output.
    crisisReview: row.line.crisisAdjacent === true,
    rationale: parsed.rationale ?? '(missing rationale)',
  });
}
grades.sort((a, b) => (a.queryId < b.queryId ? -1 : 1));

mkdirSync(outDir, { recursive: true });
const gradesBody = grades.map((grade) => JSON.stringify(grade)).join('\n') + '\n';
const stamp = new Date().toISOString().slice(0, 10);
writeFileSync(join(outDir, `layer2-grades-${stamp}.jsonl`), gradesBody);
writeFileSync(
  join(outDir, `GRADING-MANIFEST-${stamp}.json`),
  `${JSON.stringify(
    {
      formatVersion: 1,
      schema: GRADING_MANIFEST_SCHEMA,
      modelId: MODEL_ID,
      rubricSha256: sha256Hex(rubric),
      gradedAt: new Date().toISOString(),
      queueSha256: sha256Hex(queueBody),
      gradesSha256: sha256Hex(gradesBody),
      counts: { queue: queue.length, graded: grades.length },
    },
    null,
    2,
  )}\n`,
);
console.log(`${grades.length}/${queue.length} graded → ${outDir} (MS-9 trust gate before ANY grade is believed)`);
