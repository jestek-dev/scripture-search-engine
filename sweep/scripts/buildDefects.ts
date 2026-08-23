/**
 * Build a run's defect database + clustered digest (MS-10).
 *
 * Writes:
 *   <out>/defects.jsonl.gz   — every sweep-defect/v1 record (verbatim
 *                              queries; stays run-local, not in docs/)
 *   <out>/digest.md          — the clustered digest for committed review at
 *                              docs/reviews/sweep/ (crisis rows redacted
 *                              per J69)
 *
 * usage: buildDefects --run-id <id> --layer1 <layer1-grades.jsonl>
 *          --snapshot <snapshot-merged.jsonl> --universe <run-universe.jsonl>
 *          --artifact <content.db> --descriptor <descriptor.json> --out <dir>
 *          [--layer2 <layer2-grades.jsonl>]
 */
import { gzipSync } from 'node:zlib';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { readDescriptorIdentity } from '../src/identity.js';
import type { Layer1Verdict } from '../src/grade/layer1.js';
import type { Layer2Grade } from '../src/grade/layer2.js';
import type { SnapshotRecord } from '../src/snapshot.js';
import { parseUniverse } from '../src/universe/types.js';
import { buildDefectRecords } from '../src/defect/build.js';
import { clusterDefects } from '../src/defect/cluster.js';
import { buildTally, renderDigest } from '../src/defect/digest.js';
import { defectLine, validateDefectRecord } from '../src/defect/schema.js';

function flagValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

const argv = process.argv.slice(2);
const runId = flagValue(argv, '--run-id');
const layer1Path = flagValue(argv, '--layer1');
const snapshotPath = flagValue(argv, '--snapshot');
const universePath = flagValue(argv, '--universe');
const artifactPath = flagValue(argv, '--artifact');
const descriptorPath = flagValue(argv, '--descriptor');
const outDir = flagValue(argv, '--out');
const layer2Path = flagValue(argv, '--layer2');
if (!runId || !layer1Path || !snapshotPath || !universePath || !artifactPath || !descriptorPath || !outDir) {
  console.error(
    'usage: buildDefects --run-id <id> --layer1 <jsonl> --snapshot <jsonl> --universe <jsonl> --artifact <db> --descriptor <json> --out <dir> [--layer2 <jsonl>]',
  );
  process.exit(2);
}

const identity = readDescriptorIdentity(descriptorPath);
const verdicts = readFileSync(layer1Path, 'utf8')
  .split('\n')
  .filter((line) => line.length > 0)
  .map((line) => JSON.parse(line) as Layer1Verdict);
const universe = new Map(parseUniverse(readFileSync(universePath, 'utf8')).map((line) => [line.queryId, line]));
const snapshots = new Map<string, SnapshotRecord>(
  readFileSync(snapshotPath, 'utf8')
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as SnapshotRecord)
    .map((record) => [record.queryId, record]),
);
const layer2 = new Map<string, Layer2Grade>(
  layer2Path === undefined
    ? []
    : readFileSync(layer2Path, 'utf8')
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line) as Layer2Grade)
        .map((grade) => [grade.queryId, grade]),
);

const records = buildDefectRecords(verdicts, universe, snapshots, {
  runId,
  identity: {
    engineVersion: identity.engineVersion,
    corpusFingerprint: identity.corpusFingerprint,
    layerFingerprint: identity.layerFingerprint,
  },
  snapshotRef: snapshotPath,
  replay: { artifactPath, descriptorPath, universePath, snapshotPath },
});
for (const record of records) validateDefectRecord(JSON.parse(defectLine(record)));

mkdirSync(outDir, { recursive: true });
const body = records.map((record) => defectLine(record)).join('\n') + (records.length > 0 ? '\n' : '');
writeFileSync(join(outDir, 'defects.jsonl.gz'), gzipSync(Buffer.from(body, 'utf8')));

const clusters = clusterDefects(records);
const tallyRows = [...universe.values()].map((line) => ({
  category: line.category ?? 'unknown',
  aiGrade: layer2.get(line.queryId)?.grade,
}));
const digest = renderDigest(clusters, buildTally(tallyRows), {
  runId,
  identity,
  totalQueries: universe.size,
  totalDefects: records.length,
});
writeFileSync(join(outDir, 'digest.md'), `${digest}\n`);
console.log(
  `defects: ${records.length} records in ${clusters.length} clusters → ${outDir}/defects.jsonl.gz + digest.md`,
);
