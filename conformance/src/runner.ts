/**
 * Consumer-runtime conformance runner (plan P7.5 / CO-8).
 *
 * Covenant #2 promises identical ordering on every platform. CI proves it
 * for Node on ubuntu+windows; the three consumer apps run Hermes/JSC over
 * OP-SQLite, where no conformance evidence existed. This runner is the
 * evidence machine: a consumer app executes the pinned query slice on ITS
 * OWN runtime, against ITS OWN artifact, and byte-compares orderings +
 * reasons with the slice generated for the same identity triple in this
 * repository.
 *
 * Portable by construction: zero runtime imports (engine types are
 * type-only), no `node:*`, synchronous pure helpers. The consumer supplies
 * the engine instance (created over its own ContentQueryPort).
 *
 * Honesty rules (gate discipline, CLAUDE.md): a run that CANNOT judge
 * conformance — corrupted slice, or an identity triple that differs from
 * the slice's — reports `not-applicable` WITH the reason, never `pass`.
 * `not-applicable` never satisfies a release checklist. Divergence is a
 * release-blocking finding, not a footnote.
 */

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';

import { canonicalJson } from './canonical.js';
import { sha256Hex } from './sha256.js';

export interface ConformanceIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

export interface ExpectedSliceEntry {
  /** Battery/probe id, e.g. 'fn1'. */
  readonly id: string;
  /** The query exactly as typed. */
  readonly query: string;
  /** Canonical serialization of the expected outcome (see canonical.ts). */
  readonly canonical: string;
  /** sha256Hex(canonical) — the packaged expected hash. */
  readonly sha256: string;
}

export interface ExpectedSlice {
  readonly formatVersion: 1;
  readonly kind: 'scripture-search-conformance-slice';
  /** The identity triple this slice was generated under. */
  readonly identity: ConformanceIdentity;
  readonly generatedAt?: string;
  readonly queries: readonly ExpectedSliceEntry[];
  /** Integrity seal over identity + per-entry (id, query, sha256). */
  readonly sliceSha256: string;
}

export interface QueryConformance {
  readonly id: string;
  readonly query: string;
  readonly status: 'agree' | 'diverged' | 'errored';
  /** On divergence: sha256 of the runtime's canonical serialization. */
  readonly observedSha256?: string;
  /** On divergence: byte offset of the first difference plus context. */
  readonly firstDifference?: {
    readonly offset: number;
    readonly expected: string;
    readonly observed: string;
  };
  /** On error: the thrown message (a throw where Node returned is itself divergence). */
  readonly error?: string;
}

export interface ConformanceReport {
  readonly status: 'conformant' | 'divergent' | 'not-applicable';
  /** Present exactly when status is 'not-applicable' — the reason it could not run. */
  readonly reason?: string;
  /** Caller-supplied runtime label, e.g. 'hermes/op-sqlite (Maskil iOS)'. */
  readonly runtime: string;
  readonly sliceIdentity: ConformanceIdentity;
  readonly observedIdentity?: ConformanceIdentity;
  readonly queries: readonly QueryConformance[];
  readonly agreed: number;
  readonly diverged: number;
}

/** Seal input: everything identity-bearing except the bulky canonical bodies. */
export function sliceSeal(slice: Pick<ExpectedSlice, 'identity' | 'queries'>): string {
  return sha256Hex(
    canonicalJson({
      identity: slice.identity,
      queries: slice.queries.map((entry) => ({
        id: entry.id,
        query: entry.query,
        sha256: entry.sha256,
      })),
    }),
  );
}

function firstDifference(expected: string, observed: string): QueryConformance['firstDifference'] {
  const limit = Math.min(expected.length, observed.length);
  let offset = 0;
  while (offset < limit && expected[offset] === observed[offset]) offset += 1;
  const context = (text: string): string => text.slice(Math.max(0, offset - 40), offset + 80);
  return { offset, expected: context(expected), observed: context(observed) };
}

function validateSlice(slice: ExpectedSlice): string | null {
  if (slice.kind !== 'scripture-search-conformance-slice' || slice.formatVersion !== 1) {
    return `unrecognized slice (kind=${String(slice.kind)}, formatVersion=${String(slice.formatVersion)})`;
  }
  if (!Array.isArray(slice.queries) || slice.queries.length === 0) {
    return 'slice contains no queries';
  }
  if (sliceSeal(slice) !== slice.sliceSha256) {
    return 'slice integrity seal mismatch — the slice file is corrupted or edited; regenerate it';
  }
  for (const entry of slice.queries) {
    if (sha256Hex(entry.canonical) !== entry.sha256) {
      return `entry ${entry.id}: canonical body does not hash to its recorded sha256 — corrupted slice`;
    }
  }
  return null;
}

/**
 * Execute the pinned slice on the caller's engine and byte-compare.
 *
 * @param engine   an OPEN ScriptureEngine over the consumer's own port
 * @param slice    the expected slice generated for the pinned identity
 * @param runtime  honest label of the runtime under test — this string goes
 *                 in the recorded evidence, so 'node' must say node and a
 *                 Hermes run must say hermes; the release checklist requires
 *                 at least one REAL consumer runtime, and mislabeling here
 *                 would fake that leg.
 */
export async function runConformance(
  engine: Pick<ScriptureEngine, 'research'>,
  slice: ExpectedSlice,
  runtime: string,
): Promise<ConformanceReport> {
  const base = { runtime, sliceIdentity: slice.identity };
  const invalid = validateSlice(slice);
  if (invalid !== null) {
    return { ...base, status: 'not-applicable', reason: invalid, queries: [], agreed: 0, diverged: 0 };
  }

  // Identity gate: the first query's result carries the runtime's identity
  // triple. A different triple means a different engine/corpus/layer — the
  // slice cannot judge it, and saying "pass" or "fail" would both be lies.
  const firstEntry = slice.queries[0]!;
  const probe = await engine.research(firstEntry.query);
  const observedIdentity: ConformanceIdentity = {
    engineVersion: probe.engineVersion,
    corpusFingerprint: probe.corpusFingerprint,
    layerFingerprint: probe.layerFingerprint,
  };
  if (
    observedIdentity.engineVersion !== slice.identity.engineVersion ||
    observedIdentity.corpusFingerprint !== slice.identity.corpusFingerprint ||
    observedIdentity.layerFingerprint !== slice.identity.layerFingerprint
  ) {
    return {
      ...base,
      status: 'not-applicable',
      reason:
        'identity triple mismatch — slice is for ' +
        `(${slice.identity.engineVersion}, ${slice.identity.corpusFingerprint.slice(0, 12)}…, ` +
        `${slice.identity.layerFingerprint.slice(0, 12)}…) but the runtime reports ` +
        `(${observedIdentity.engineVersion}, ${observedIdentity.corpusFingerprint.slice(0, 12)}…, ` +
        `${observedIdentity.layerFingerprint.slice(0, 12)}…). Generate a slice for the pinned ` +
        'identity; conformance against a different identity proves nothing.',
      observedIdentity,
      queries: [],
      agreed: 0,
      diverged: 0,
    };
  }

  const queries: QueryConformance[] = [];
  for (const entry of slice.queries) {
    try {
      const outcome = await engine.research(entry.query);
      const observed = canonicalJson(outcome);
      if (observed === entry.canonical) {
        queries.push({ id: entry.id, query: entry.query, status: 'agree' });
      } else {
        queries.push({
          id: entry.id,
          query: entry.query,
          status: 'diverged',
          observedSha256: sha256Hex(observed),
          firstDifference: firstDifference(entry.canonical, observed),
        });
      }
    } catch (error) {
      queries.push({
        id: entry.id,
        query: entry.query,
        status: 'errored',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const diverged = queries.filter((entry) => entry.status !== 'agree').length;
  return {
    ...base,
    status: diverged === 0 ? 'conformant' : 'divergent',
    observedIdentity,
    queries,
    agreed: queries.length - diverged,
    diverged,
  };
}
