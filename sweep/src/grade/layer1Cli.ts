/**
 * `npm run grade-l1 --workspace sweep -- --universe <jsonl> --snapshot
 * <jsonl> --out <dir>` — run Layer-1 deterministic grading over a merged
 * snapshot and emit grades, the needs-ai-grade queue (with counts), and
 * the auto-escalation list. Deterministic outputs: same inputs, same
 * bytes.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { canonicalJson, sha256Hex, type JsonValue } from '../canonical.js';
import { loadConceptCells } from '../universe/inputs.js';
import { REPO_ROOT } from '../universe/compileFromRepo.js';
import { parseUniverse } from '../universe/types.js';
import type { SnapshotRecord } from '../snapshot.js';
import { gradeLayer1 } from './layer1.js';
import { loadWatchlist } from './watchlist.js';

function flagValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

const argv = process.argv.slice(2);
const universePath = flagValue(argv, '--universe');
const snapshotPath = flagValue(argv, '--snapshot');
const outDir = flagValue(argv, '--out');
if (!universePath || !snapshotPath || !outDir) {
  console.error('usage: grade-l1 --universe <jsonl> --snapshot <jsonl> --out <dir>');
  process.exit(2);
}

const lines = parseUniverse(readFileSync(universePath, 'utf8'));
const records = new Map<string, SnapshotRecord>();
for (const raw of readFileSync(snapshotPath, 'utf8').split('\n')) {
  if (raw.length === 0) continue;
  const record = JSON.parse(raw) as SnapshotRecord;
  records.set(record.queryId, record);
}

const concepts = loadConceptCells(join(REPO_ROOT, 'ontology', 'concepts'));
const summary = gradeLayer1(lines, records, {
  watchlist: loadWatchlist(),
  conceptLabels: new Set(concepts.map((concept) => concept.label)),
  baseSnapshots: records,
});

mkdirSync(outDir, { recursive: true });
const gradesBody =
  summary.verdicts.map((verdict) => canonicalJson(verdict as unknown as JsonValue)).join('\n') + '\n';
writeFileSync(join(outDir, 'layer1-grades.jsonl'), gradesBody);
const byId = new Map(lines.map((line) => [line.queryId, line]));
const queueBody =
  summary.queue
    .map((queryId) => canonicalJson({ queryId, line: byId.get(queryId) as unknown as JsonValue }))
    .join('\n') + '\n';
writeFileSync(join(outDir, 'needs-ai-grade.jsonl'), queueBody);
writeFileSync(
  join(outDir, 'layer1-summary.json'),
  `${JSON.stringify(
    {
      formatVersion: 1,
      counts: summary.counts,
      queueSize: summary.queue.length,
      autoEscalated: summary.autoEscalated,
      gradesSha256: sha256Hex(gradesBody),
      queueSha256: sha256Hex(queueBody),
    },
    null,
    2,
  )}\n`,
);
console.log(
  `layer1: ${summary.counts.pass} pass / ${summary.counts.defect} defect / ${summary.counts.needsAiGrade} needs-ai-grade`,
);
console.log(`auto-escalated (Jesse's list): ${summary.autoEscalated.length}`);
