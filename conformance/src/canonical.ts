/**
 * Canonical serialization for conformance comparison (plan P7.5 / CO-8).
 *
 * Byte-comparison is only meaningful if both sides serialize identically, so
 * the rules are pinned here and shared by the generator (Node) and the
 * runner (Hermes/JSC):
 *
 * - Object keys sorted lexicographically, recursively — insertion order (an
 *   implementation detail) can never leak into the bytes.
 * - Numbers serialized by `JSON.stringify` — the ECMAScript number-to-string
 *   algorithm is spec-pinned (shortest round-trip), so conforming runtimes
 *   (V8, Hermes, JSC) produce identical bytes for identical doubles. A
 *   runtime that computed a DIFFERENT double diverges visibly, which is the
 *   kit's whole point.
 * - Verse TEXT is excluded (keys named `excerpt`): the kit's claim is
 *   "identical ORDERINGS and REASONS"; the text bytes are attested by
 *   `corpusFingerprint`, and excluding them keeps slices reviewable.
 *
 * Zero imports — portable by construction.
 */

const EXCLUDED_KEYS = new Set(['excerpt']);

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'number' || typeof value === 'boolean') {
    return JSON.stringify(value);
  }
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record)
      .filter((key) => !EXCLUDED_KEYS.has(key) && record[key] !== undefined)
      .sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
  }
  throw new Error(`canonicalJson: unsupported value of type ${typeof value}`);
}
