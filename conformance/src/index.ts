/**
 * @jestek-dev/scripture-conformance-kit — prove covenant #2 on the runtime
 * you actually ship (plan P7.5 / CO-8).
 *
 * A consumer app runs `runConformance` with its own engine (Hermes/JSC over
 * OP-SQLite) and the expected slice generated in this repository for the
 * same identity triple; the report records byte-agreement of orderings +
 * reasons, or the exact first divergence. See conformance/README.md and
 * docs/CONSUMERS.md.
 */

export { canonicalJson } from './canonical.js';
export { sha256Hex, utf8Bytes } from './sha256.js';
export {
  runConformance,
  sliceSeal,
  type ConformanceIdentity,
  type ConformanceReport,
  type ExpectedSlice,
  type ExpectedSliceEntry,
  type QueryConformance,
} from './runner.js';
