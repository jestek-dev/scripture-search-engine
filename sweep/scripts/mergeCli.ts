/**
 * CI merge step (MS-6): purity-checked, byte-stable merge of shard
 * snapshots. `--dir <outDir> --of-shards <n>`.
 */
import { mergeShards } from '../src/harness.js';

function flagValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

const argv = process.argv.slice(2);
const dir = flagValue(argv, '--dir');
const ofShards = Number(flagValue(argv, '--of-shards') ?? '8');
if (dir === undefined) {
  console.error('usage: mergeCli --dir <outDir> --of-shards <n>');
  process.exit(2);
}
const merged = mergeShards(dir, ofShards);
console.log(`merged ${merged.lineCount} lines`);
console.log(`canonical sha256 ${merged.canonicalSnapshotSha256}`);
