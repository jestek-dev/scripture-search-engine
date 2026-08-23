/**
 * Canonical JSON for sweep snapshots (MS-1).
 *
 * Every snapshot line is serialized with recursively sorted object keys so
 * that byte comparison — the sweep's determinism instrument — never trips on
 * property insertion order. `elapsedMs` is the single sanctioned
 * non-deterministic field: it stays in the written file (the latency envelope
 * needs it) but is stripped before every canonical hash and byte comparison
 * (plan MS-1/MS-14: "post-elapsedMs strip").
 */
import { createHash } from 'node:crypto';

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

/** Recursively sort object keys (code-point order). Arrays keep their order. */
export function canonicalize(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map((entry) => canonicalize(entry));
  if (value !== null && typeof value === 'object') {
    const sorted: { [key: string]: JsonValue } = {};
    for (const key of Object.keys(value).sort()) {
      const entry = value[key];
      // undefined never appears in JsonValue, but guard the index signature.
      if (entry !== undefined) sorted[key] = canonicalize(entry);
    }
    return sorted;
  }
  return value;
}

/** Canonical single-line JSON: sorted keys, no whitespace. */
export function canonicalJson(value: JsonValue): string {
  return JSON.stringify(canonicalize(value));
}

/** Remove `elapsedMs` (top level only — it is only ever written there). */
export function stripElapsed(value: JsonValue): JsonValue {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return value;
  const { elapsedMs: _elapsed, ...rest } = value as { [key: string]: JsonValue };
  return rest;
}

/** sha256 hex of a UTF-8 string. */
export function sha256Hex(text: string | Buffer): string {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * The canonical hash of one snapshot line: elapsedMs stripped, keys sorted.
 */
export function canonicalLineHash(record: JsonValue): string {
  return sha256Hex(canonicalJson(stripElapsed(record)));
}

/**
 * Strip elapsedMs from every line of a snapshot JSONL body and re-serialize
 * canonically — the comparison form for run-to-run byte identity.
 */
export function stripSnapshotBody(body: string): string {
  const lines = body.split('\n').filter((line) => line.length > 0);
  return lines.map((line) => canonicalJson(stripElapsed(JSON.parse(line) as JsonValue))).join('\n') + '\n';
}
