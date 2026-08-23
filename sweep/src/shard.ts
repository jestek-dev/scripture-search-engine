/**
 * Sharding (MS-1): a PURE partition of the universe by
 * `sha256(queryId) mod ofShards`.
 *
 * Pure means: every queryId lands in exactly one shard, membership depends
 * only on the id (never on position, file, or shard count of a previous
 * run), and merging the N shard snapshots sorted by queryId is byte-equal to
 * a 1-shard run. That property is what lets an 8-way CI matrix and a laptop
 * produce the same merged snapshot.
 */
import { sha256Hex } from './canonical.js';

/** Which shard (0-based) a queryId belongs to, out of `ofShards`. */
export function shardOf(queryId: string, ofShards: number): number {
  if (!Number.isInteger(ofShards) || ofShards < 1) {
    throw new Error(`ofShards must be a positive integer, got ${ofShards}`);
  }
  // First 8 bytes of the digest as an unsigned BigInt — float-free, platform
  // identical, and stable forever (a change here re-partitions every
  // historic run, so it would be a UNIVERSE-VERSION-grade event).
  const digest = sha256Hex(queryId);
  const head = BigInt(`0x${digest.slice(0, 16)}`);
  return Number(head % BigInt(ofShards));
}

/** Filter a universe's queryIds down to one shard, preserving order. */
export function filterToShard<T extends { readonly queryId: string }>(
  lines: readonly T[],
  shard: number,
  ofShards: number,
): T[] {
  if (!Number.isInteger(shard) || shard < 0 || shard >= ofShards) {
    throw new Error(`shard must be in [0, ${ofShards}), got ${shard}`);
  }
  return lines.filter((line) => shardOf(line.queryId, ofShards) === shard);
}
