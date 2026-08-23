/**
 * E7 — deterministic explanation-faithfulness sample (plan P7.4).
 *
 * Covenant #5 as a measurement: between fixture assertions, nothing measured
 * whether the reason chips a result carries state what the underlying data
 * actually says. This module builds the AUDIT PACKET — a deterministic
 * sample of (query, rank) pairs over the battery, each chip rendered
 * alongside the underlying evidence rows fetched through the same
 * ContentQueryPort the engine used — for a HUMAN (Jesse or a named designee,
 * J45) to mark each chip FAITHFUL or MISSTATED. Any MISSTATED is a G3-class
 * defect fixed WITH a label-pinning fixture.
 *
 * The sampling construction is fully specified so the same identity triple
 * yields the same packet, byte for byte, on any machine (auditability — a
 * sample nobody can reproduce proves nothing):
 *
 *   seed         = sha256(engineVersion + "\n" + corpusFingerprint + "\n"
 *                         + layerFingerprint)                       [hex]
 *   uint32 chain = sha256(seed + ":" + counter), counter = 0,1,2,…;
 *                  each digest yields 8 big-endian uint32s, in order
 *   pool         = every actually-existing (query, rank) pair over the
 *                  ACTIVE battery queries in file order (rank over the
 *                  default result page; zero-result and non-discovery
 *                  outcomes contribute no pairs)
 *   selection    = unbiased rejection sampling WITHOUT replacement:
 *                  draw u; reject u >= 2^32 - (2^32 mod poolSize);
 *                  index = u mod poolSize; duplicate indexes are skipped
 *                  (drawn again); stop at sampleSize distinct pairs.
 *                  poolSize <= sampleSize takes the whole pool with the
 *                  SHORTFALL RECORDED in the packet — never padded.
 *
 * The packet contains no timestamps and no environment data by design:
 * identical `(identity, battery, sampleSize)` in, identical bytes out —
 * pinned by eval/test/faithfulness-sample.test.ts.
 *
 * The sample size DEFAULT is 50 (the plan's number). It is a parameter, not
 * a constant, because J45 reserves the number to Jesse — the tool does not
 * decide it, and neither did this implementation.
 *
 * THIS MODULE ONLY BUILDS THE PACKET. Executing the audit — protocol
 * approval, designee, the marking itself, the record in docs/reviews/ — is
 * J-gated (J45) and deliberately not implemented as automation anywhere.
 */

import type {
  ContentQueryPort,
  ContentScalar,
  DiscoveryResult,
  Reason,
  ResultIdentity,
  ScriptureEngine,
} from '@jestek-dev/scripture-engine';

import { canonicalJson, sha256 } from './gauntletMachineReport.js';

export const DEFAULT_FAITHFULNESS_SAMPLE_SIZE = 50;

export interface BatteryQueryRow {
  readonly id: string;
  readonly query: string;
  readonly status: string;
}

export interface FaithfulnessIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

/** One (query, rank) candidate — the unit the sampler draws. */
export interface FaithfulnessPair {
  readonly queryId: string;
  readonly query: string;
  readonly rank: number;
}

export interface ChipEvidence {
  /** Which fetcher produced the rows (names the table). */
  readonly source: string;
  readonly rows: readonly Readonly<Record<string, ContentScalar>>[];
  /** Present when the row set was capped for packet size. */
  readonly truncatedTo?: number;
}

export interface AuditedChip {
  readonly family: Reason['family'];
  readonly label: string;
  readonly points: number;
  readonly uncappedPoints?: number;
  readonly provenance?: Reason['provenance'];
  /**
   * Underlying rows fetched through the SAME port, per family. For the
   * lexical families the verse text itself (the entry's `excerpt`) is the
   * evidence and no separate fetch applies.
   */
  readonly evidence?: ChipEvidence;
  /**
   * The auditor's verdict — always emitted as null by the tool. A human
   * writes FAITHFUL or MISSTATED here; the tool NEVER pre-fills it.
   */
  readonly verdict: null;
}

export interface FaithfulnessSampleEntry {
  readonly queryId: string;
  readonly query: string;
  readonly rank: number;
  readonly targetId: string;
  readonly reference: string;
  readonly excerpt: string;
  readonly score: number;
  readonly grouping?: DiscoveryResult['grouping'];
  readonly chips: readonly AuditedChip[];
}

export interface FaithfulnessSample {
  readonly formatVersion: 1;
  readonly kind: 'explanation-faithfulness-sample';
  readonly identity: FaithfulnessIdentity;
  readonly seed: string;
  readonly sampleSizeRequested: number;
  readonly poolSize: number;
  /** poolSize < sampleSizeRequested leaves this > 0 — recorded, never padded. */
  readonly shortfall: number;
  readonly entries: readonly FaithfulnessSampleEntry[];
  /** sha256(canonicalJson of everything above) — the packet's own integrity seal. */
  readonly packetSha256: string;
}

export function identitySeed(identity: FaithfulnessIdentity): string {
  return sha256(
    `${identity.engineVersion}\n${identity.corpusFingerprint}\n${identity.layerFingerprint}`,
  );
}

/** The sha256-counter uint32 stream, exactly as specified in the header. */
export function* uint32Stream(seed: string): Generator<number, never, void> {
  for (let counter = 0; ; counter += 1) {
    const digest = sha256(`${seed}:${counter}`);
    for (let word = 0; word < 8; word += 1) {
      yield Number.parseInt(digest.slice(word * 8, word * 8 + 8), 16) >>> 0;
    }
  }
}

/**
 * Unbiased rejection sampling without replacement. Returns DISTINCT pool
 * indexes in draw order; takes the whole pool when it is not larger than
 * `count` (the caller records the shortfall).
 */
export function sampleDistinctIndexes(
  poolSize: number,
  count: number,
  stream: Generator<number, never, void>,
): number[] {
  if (poolSize <= 0) return [];
  if (poolSize <= count) return Array.from({ length: poolSize }, (_, index) => index);
  const limit = 0x1_0000_0000 - (0x1_0000_0000 % poolSize);
  const chosen = new Set<number>();
  const order: number[] = [];
  while (order.length < count) {
    const draw = stream.next().value;
    if (draw >= limit) continue; // rejection: keeps the modulo unbiased
    const index = draw % poolSize;
    if (chosen.has(index)) continue; // distinctness: redraw
    chosen.add(index);
    order.push(index);
  }
  return order;
}

const EVIDENCE_ROW_CAP = 50;

function verseIdOf(targetId: string): number {
  const raw = targetId.slice(targetId.indexOf(':') + 1);
  return Number.parseInt(raw, 10);
}

async function fetchEvidence(
  port: ContentQueryPort,
  family: Reason['family'],
  verseId: number,
): Promise<ChipEvidence | undefined> {
  const capped = async (source: string, sql: string, params: readonly ContentScalar[]) => {
    const { rows } = await port.execute(sql, params);
    return {
      source,
      rows: rows.slice(0, EVIDENCE_ROW_CAP),
      ...(rows.length > EVIDENCE_ROW_CAP ? { truncatedTo: EVIDENCE_ROW_CAP } : {}),
    };
  };
  switch (family) {
    case 'concept_anchor':
      // Anchor rows covering the verse (curated alias evidence rides this
      // family too — its chip label names the hymn, the anchors here are
      // what the alias pointed at).
      return capped(
        'concept_anchors ⋈ concepts (span covers verse)',
        `SELECT a.concept_id, c.label AS concept_label, a.start_verse_id, a.end_verse_id,
                a.source_id, a.weight, a.locator
           FROM concept_anchors a JOIN concepts c ON c.id = a.concept_id
          WHERE a.start_verse_id <= ? AND a.end_verse_id >= ?
          ORDER BY a.concept_id, a.source_id, a.start_verse_id, a.end_verse_id, a.locator`,
        [verseId, verseId],
      );
    case 'concept_lexicon':
      return capped(
        'concept_anchors ⋈ concepts (span covers verse; lexicon chips cite a concept whose anchors are the trail)',
        `SELECT a.concept_id, c.label AS concept_label, a.start_verse_id, a.end_verse_id,
                a.source_id, a.weight, a.locator
           FROM concept_anchors a JOIN concepts c ON c.id = a.concept_id
          WHERE a.start_verse_id <= ? AND a.end_verse_id >= ?
          ORDER BY a.concept_id, a.source_id, a.start_verse_id, a.end_verse_id, a.locator`,
        [verseId, verseId],
      );
    case 'cross_reference':
    case 'co_citation':
      return capped(
        'cross_references (edges into this verse)',
        `SELECT from_verse_id, to_start_verse_id, to_end_verse_id, source_id, votes
           FROM cross_references
          WHERE to_start_verse_id <= ? AND to_end_verse_id >= ?
          ORDER BY from_verse_id, source_id, votes`,
        [verseId, verseId],
      );
    case 'passage_terms':
      return capped(
        'verse_terms (homiletical profile for this verse)',
        `SELECT term, pmi, count, source_ids, author_count, min_span_verses, locator
           FROM verse_terms WHERE verse_id = ?
          ORDER BY term, locator`,
        [verseId],
      );
    case 'translation_variant':
      return capped(
        'verse_translation_tokens (stems for this verse)',
        `SELECT token FROM verse_translation_tokens WHERE verse_id = ? ORDER BY token`,
        [verseId],
      );
    default:
      // reference / exact_phrase / token_overlap / proximity: the verse text
      // (the entry's excerpt) IS the evidence — nothing further to fetch.
      return undefined;
  }
}

export interface BuildFaithfulnessSampleOptions {
  /** The plan default is 50; the number is Jesse's to adjust (J45). */
  readonly sampleSize?: number;
}

/**
 * Build the deterministic audit packet. `port` must be the same artifact the
 * engine is open over — the whole point is that chips and evidence come
 * through one seam.
 */
export async function buildFaithfulnessSample(
  engine: Pick<ScriptureEngine, 'research'>,
  port: ContentQueryPort,
  batteryQueries: readonly BatteryQueryRow[],
  options: BuildFaithfulnessSampleOptions = {},
): Promise<FaithfulnessSample> {
  const sampleSize = options.sampleSize ?? DEFAULT_FAITHFULNESS_SAMPLE_SIZE;
  if (!Number.isSafeInteger(sampleSize) || sampleSize <= 0) {
    throw new Error(`sampleSize must be a positive integer, got ${String(sampleSize)}`);
  }

  const active = batteryQueries.filter((row) => row.status === 'active');
  if (active.length === 0) throw new Error('battery contains no active queries');

  // Pool construction: file order, then rank — the enumeration order is part
  // of the pinned construction (index i must mean the same pair everywhere).
  const pool: FaithfulnessPair[] = [];
  const pageByQuery = new Map<string, readonly DiscoveryResult[]>();
  let identity: (ResultIdentity & FaithfulnessIdentity) | undefined;
  for (const row of active) {
    const outcome = await engine.research(row.query);
    identity ??= {
      engineVersion: outcome.engineVersion,
      corpusFingerprint: outcome.corpusFingerprint,
      layerFingerprint: outcome.layerFingerprint,
    };
    if (outcome.kind !== 'discovery') continue;
    pageByQuery.set(row.id, outcome.results);
    for (let rank = 0; rank < outcome.results.length; rank += 1) {
      pool.push({ queryId: row.id, query: row.query, rank });
    }
  }
  if (identity === undefined) throw new Error('no query produced a result identity');

  const seed = identitySeed(identity);
  const indexes = sampleDistinctIndexes(pool.length, sampleSize, uint32Stream(seed));
  const shortfall = Math.max(0, sampleSize - indexes.length);

  // Reviewer-facing order: battery order then rank (selection stays a pure
  // function of the identity; presentation order is pinned separately).
  const byPoolIndex = [...indexes].sort((left, right) => left - right);

  const entries: FaithfulnessSampleEntry[] = [];
  for (const poolIndex of byPoolIndex) {
    const pair = pool[poolIndex]!;
    const result = pageByQuery.get(pair.queryId)![pair.rank]!;
    const verseId = verseIdOf(result.targetId);
    const chips: AuditedChip[] = [];
    for (const reason of result.reasons) {
      const evidence = await fetchEvidence(port, reason.family, verseId);
      chips.push({
        family: reason.family,
        label: reason.label,
        points: reason.points,
        ...(reason.uncappedPoints === undefined ? {} : { uncappedPoints: reason.uncappedPoints }),
        ...(reason.provenance === undefined ? {} : { provenance: reason.provenance }),
        ...(evidence === undefined ? {} : { evidence }),
        verdict: null,
      });
    }
    entries.push({
      queryId: pair.queryId,
      query: pair.query,
      rank: pair.rank,
      targetId: result.targetId,
      reference: result.reference,
      excerpt: result.excerpt,
      score: result.score,
      ...(result.grouping === undefined ? {} : { grouping: result.grouping }),
      chips,
    });
  }

  const unsealed = {
    formatVersion: 1 as const,
    kind: 'explanation-faithfulness-sample' as const,
    identity: {
      engineVersion: identity.engineVersion,
      corpusFingerprint: identity.corpusFingerprint,
      layerFingerprint: identity.layerFingerprint,
    },
    seed,
    sampleSizeRequested: sampleSize,
    poolSize: pool.length,
    shortfall,
    entries,
  };
  return { ...unsealed, packetSha256: sha256(canonicalJson(unsealed)) };
}

/** The byte-exact file content for a packet (stable serialization). */
export function renderFaithfulnessSample(sample: FaithfulnessSample): string {
  return `${JSON.stringify(sample, null, 2)}\n`;
}
