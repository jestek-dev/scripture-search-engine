/**
 * `npm run sweep --workspace sweep --` — run one shard (and optionally merge).
 *
 *   --artifact <content.db>  --descriptor <descriptor.json>
 *   --universe <universe.jsonl>  --out <dir>
 *   [--shard <i> --of-shards <n>]  [--merge]
 */
import { mergeShards, runSweep } from './harness.js';

function requireValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  if (value === undefined) throw new Error(`missing value for ${flag}`);
  return value;
}

const argv = process.argv.slice(2);
const artifactPath = requireValue(argv, '--artifact');
const universePath = requireValue(argv, '--universe');
const outDir = requireValue(argv, '--out');
const descriptorPath = requireValue(argv, '--descriptor');
const shard = Number(requireValue(argv, '--shard') ?? '0');
const ofShards = Number(requireValue(argv, '--of-shards') ?? '1');
const merge = argv.includes('--merge');

if (!artifactPath || !universePath || !outDir) {
  console.error(
    'usage: sweep --artifact <db> --universe <jsonl> --out <dir> [--descriptor <json>] [--shard i --of-shards n] [--merge]',
  );
  process.exit(2);
}

const result = await runSweep({
  artifactPath,
  universePath,
  outDir,
  shard,
  ofShards,
  ...(descriptorPath !== undefined ? { descriptorPath } : {}),
});
console.log(
  `sweep shard ${shard}/${ofShards}: ${result.lineCount} queries → ${result.snapshotPath}`,
);
console.log(`identity ${result.identity.engineVersion} ${result.identity.corpusFingerprint.slice(0, 12)}… ${result.identity.layerFingerprint.slice(0, 12)}…`);
console.log(`canonical sha256 ${result.canonicalSnapshotSha256}`);

if (merge) {
  const merged = mergeShards(outDir, ofShards);
  console.log(`merged ${merged.lineCount} lines → ${merged.mergedPath}`);
  console.log(`merged canonical sha256 ${merged.canonicalSnapshotSha256}`);
}
