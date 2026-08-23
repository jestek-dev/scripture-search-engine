/**
 * G8 — noise probes, and G11 — latency.
 *
 * G8 is the mush detector. Every other gate asks "is this row allowed?"; this
 * one asks "did the result LISTS get worse?" It runs a fixed question set
 * against the new artifact and diffs it against the committed baseline.
 *
 * Three measurements, each aimed at a specific way growth degrades quality:
 *
 *  - **top-10 churn** — how much each list changed. A little churn is the
 *    point of adding data. Massive churn on a broad query means the new data
 *    displaced established results wholesale, which is rarely an improvement
 *    and always worth a human look.
 *  - **weak-reason share** — what fraction of the score came from weak
 *    families. Signal budgets bound this per result; this measures it across
 *    the whole list. Climbing share means thematic hints are crowding out
 *    direct evidence — precision erosion, visible before anyone complains.
 *  - **adversarial silence** — queries that must return NOTHING. As weak
 *    signals accumulate, the first thing to break is the engine's ability to
 *    say "I have nothing for you", and a system that always answers is a
 *    system that has stopped discriminating.
 */

import { createHash } from 'node:crypto';

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';
import { isAuthoritative } from '@jestek-dev/scripture-engine';

import { fail, notApplicable, pass, type GateFinding, type GateResult } from './types.js';
import type { ProbeOrderedResults } from './orderingSnapshot.js';

export interface Probe {
  readonly id: string;
  readonly query: string;
  readonly kind: string;
  readonly expectNoResults?: boolean;
  readonly why?: string;
}

export interface ProbeObservation {
  readonly id: string;
  readonly top: readonly string[];
  readonly resultCount: number;
  readonly weakReasonShare: number;
  readonly meanTopScore: number;
}

export interface ProbeBaseline {
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  readonly engineVersion: string;
  readonly observations: readonly ProbeObservation[];
}

export const PROBE_BASELINE_APPROVAL_SCHEMA = 'scripture-search-engine/probe-baseline-approval/v1';

/**
 * v2 strengthens the approval from a free-text role into an accountable
 * record: a named reviewer with contact, an explicit independence attestation
 * (what the reviewer did NOT author), a byte digest binding the review record
 * itself, and the digest of the review packet the decision was read from.
 * The already-committed v1 records stay valid — grandfathered by their exact
 * fingerprint identity, with none of their original checks loosened — but a
 * v1 approval for any other identity, or dated after the sunset, fails with a
 * named finding: every new approval is authored in v2
 * (docs/governance/probe-baseline-review.md).
 */
export const PROBE_BASELINE_APPROVAL_SCHEMA_V2 = 'scripture-search-engine/probe-baseline-approval/v2';

/**
 * Review-record evidence must live in the repository's review directory —
 * never an absolute path, never outside docs/reviews. Shared with the
 * gauntlet's byte-check so the path it reads is the path the schema allows.
 */
export const APPROVAL_EVIDENCE_PATH_PATTERN = /^docs\/reviews\/[A-Za-z0-9][A-Za-z0-9._-]*\.md$/;

export interface ProbeEngineIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

/**
 * Schema v1 is closed to new records: an approval whose `reviewedAt`
 * postdates this day must be authored in v2. Shared by the probe-baseline
 * and ordering-snapshot validators.
 */
export const APPROVAL_V1_SUNSET_DATE = '2026-08-20';

/**
 * The only identities a v1 approval may still bind — the ones the committed
 * records bound when v2 landed (probes.approval.json, 2026-08-10, and
 * ordering.snapshot.approval.json, 2026-08-17, share this triple). Pinning
 * the identity keeps the sunset unbackdatable: a back-dated v1 record for a
 * new baseline would have to claim an identity outside this list.
 */
export const GRANDFATHERED_V1_APPROVAL_IDENTITIES: readonly ProbeEngineIdentity[] = [
  {
    engineVersion: '0.9.0',
    corpusFingerprint: '60b7f88879866bdd50f5560c2bbd5334c869358383fba5179183a9737b7c27ed',
    layerFingerprint: 'b3ac103348f7f6fe43977bae9c010c51ef0162a755c7644b34e7405c6416e51a',
  },
];

interface ProbeBaselinePriorProvenance {
  readonly baselineGitBlobSha1: string;
  readonly engine: {
    readonly engineVersion: string;
    readonly corpusFingerprint: string;
    readonly layerFingerprint: string | null;
  };
}

/** A separate review record: baseline generation never writes this file. */
export interface ProbeBaselineApproval {
  readonly schema: typeof PROBE_BASELINE_APPROVAL_SCHEMA;
  readonly baselineSha256: string;
  readonly probesSha256: string;
  readonly engine: ProbeEngineIdentity;
  readonly reviewer: string;
  readonly reviewedAt: string;
  readonly rationale: string;
  readonly priorProvenance: ProbeBaselinePriorProvenance;
}

/** The v2 review record: identity, attestation, and evidence are explicit. */
export interface ProbeBaselineApprovalV2 {
  readonly schema: typeof PROBE_BASELINE_APPROVAL_SCHEMA_V2;
  readonly baselineSha256: string;
  readonly probesSha256: string;
  readonly engine: ProbeEngineIdentity;
  readonly reviewerName: string;
  readonly reviewerContact: string;
  readonly independence: string;
  readonly evidence: { readonly path: string; readonly sha256: string };
  /** SHA-256 of the review-packet file the decision was read from. */
  readonly reviewPacketSha256: string;
  readonly reviewedAt: string;
  readonly rationale: string;
  /** Null only beside `bootstrap`, which documents why no prior exists. */
  readonly priorProvenance: ProbeBaselinePriorProvenance | null;
  readonly bootstrap?: string;
}

function canonicalJson(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value !== 'object') {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new TypeError('Canonical JSON does not support undefined values.');
    return serialized;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

/** JSON documents are EOL-stable before their review digest is calculated. */
export function canonicalJsonSha256(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(record: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(record).sort();
  return actual.length === keys.length && actual.every((key, index) => key === [...keys].sort()[index]);
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
}

function isEngineIdentity(value: unknown): value is ProbeEngineIdentity {
  return isRecord(value) && exactKeys(value, ['engineVersion', 'corpusFingerprint', 'layerFingerprint']) &&
    typeof value['engineVersion'] === 'string' && value['engineVersion'].length > 0 &&
    isSha256(value['corpusFingerprint']) && isSha256(value['layerFingerprint']);
}

function isReviewDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
}

function approvalFinding(category: string, message: string): GateFinding {
  return {
    categoryCode: `sse.gauntlet.v1.finding.g8-noise-probes.${category}`,
    message,
    subjects: ['probe-baseline-approval'],
  };
}

function validPriorProvenance(approval: Record<string, unknown>): boolean {
  const prior = approval['priorProvenance'];
  const priorEngine = isRecord(prior) ? prior['engine'] : undefined;
  return isRecord(prior) && exactKeys(prior, ['baselineGitBlobSha1', 'engine']) &&
    typeof prior['baselineGitBlobSha1'] === 'string' && /^[0-9a-f]{40}$/.test(prior['baselineGitBlobSha1']) &&
    isRecord(priorEngine) && exactKeys(priorEngine, ['engineVersion', 'corpusFingerprint', 'layerFingerprint']) &&
    typeof priorEngine['engineVersion'] === 'string' && priorEngine['engineVersion'].length > 0 &&
    isSha256(priorEngine['corpusFingerprint']) &&
    (priorEngine['layerFingerprint'] === null || isSha256(priorEngine['layerFingerprint']));
}

/** v1 shape, verbatim from the original single-schema validator. */
function validV1Shape(approval: Record<string, unknown>): boolean {
  return exactKeys(approval, [
    'schema',
    'baselineSha256',
    'probesSha256',
    'engine',
    'reviewer',
    'reviewedAt',
    'rationale',
    'priorProvenance',
  ]) && isSha256(approval['baselineSha256']) &&
    isSha256(approval['probesSha256']) && isEngineIdentity(approval['engine']) &&
    typeof approval['reviewer'] === 'string' && approval['reviewer'].trim().length > 0 &&
    isReviewDate(approval['reviewedAt']) && typeof approval['rationale'] === 'string' &&
    approval['rationale'].trim().length > 0 && validPriorProvenance(approval);
}

function sameEngineIdentity(left: ProbeEngineIdentity, right: ProbeEngineIdentity): boolean {
  return left.engineVersion === right.engineVersion &&
    left.corpusFingerprint === right.corpusFingerprint &&
    left.layerFingerprint === right.layerFingerprint;
}

const V2_KEYS = [
  'schema',
  'baselineSha256',
  'probesSha256',
  'engine',
  'reviewerName',
  'reviewerContact',
  'independence',
  'evidence',
  'reviewPacketSha256',
  'reviewedAt',
  'rationale',
  'priorProvenance',
] as const;

/**
 * Field-level v2 shape problems, each naming the offending field: a reviewer
 * fixing a malformed approval should not have to bisect the document.
 */
function v2ShapeProblems(approval: Record<string, unknown>): string[] {
  const problems: string[] = [];
  const allowed = new Set<string>([...V2_KEYS, 'bootstrap']);
  for (const key of Object.keys(approval).sort()) {
    if (!allowed.has(key)) problems.push(`unexpected field "${key}"`);
  }
  for (const key of V2_KEYS) {
    if (!(key in approval)) problems.push(`missing field "${key}"`);
  }
  const check = (field: string, valid: boolean, expected: string): void => {
    if (field in approval && !valid) problems.push(`"${field}" must be ${expected}`);
  };
  check('baselineSha256', isSha256(approval['baselineSha256']), 'a 64-hex sha256');
  check('probesSha256', isSha256(approval['probesSha256']), 'a 64-hex sha256');
  check('engine', isEngineIdentity(approval['engine']), 'the exact engine identity triple');
  check('reviewerName', typeof approval['reviewerName'] === 'string', 'a string');
  check('reviewerContact', typeof approval['reviewerContact'] === 'string', 'a string');
  check('independence', typeof approval['independence'] === 'string', 'a string');
  const evidence = approval['evidence'];
  check('evidence', isRecord(evidence) && exactKeys(evidence, ['path', 'sha256']) &&
    typeof evidence['path'] === 'string' && APPROVAL_EVIDENCE_PATH_PATTERN.test(evidence['path']) &&
    isSha256(evidence['sha256']),
  'a {path, sha256} record naming a docs/reviews/*.md review record');
  check('reviewPacketSha256', isSha256(approval['reviewPacketSha256']),
    'the 64-hex sha256 the review-packet tool printed for the packet read');
  check('reviewedAt', isReviewDate(approval['reviewedAt']), 'a real YYYY-MM-DD date');
  check('rationale', typeof approval['rationale'] === 'string' && approval['rationale'].trim().length > 0,
    'a non-empty string');
  if ('bootstrap' in approval &&
      (typeof approval['bootstrap'] !== 'string' || approval['bootstrap'].trim().length === 0)) {
    problems.push('"bootstrap" must be a non-empty string documenting why no prior baseline exists');
  }
  if ('priorProvenance' in approval) {
    if (approval['priorProvenance'] === null) {
      if (!('bootstrap' in approval)) {
        problems.push('"priorProvenance" may be null only beside a "bootstrap" field documenting the missing prior');
      }
    } else {
      if ('bootstrap' in approval) problems.push('"bootstrap" is valid only when "priorProvenance" is null');
      if (!validPriorProvenance(approval)) {
        problems.push('"priorProvenance" must bind the prior baseline git blob and engine identity');
      }
    }
  }
  return problems;
}

/**
 * Checks the independent approval for a committed G8 baseline. Its hashes
 * bind the exact logical JSON documents, so a checkout's CRLF/LF policy does
 * not change what a reviewer approved.
 *
 * `evidenceSha256` is the SHA-256 of the bytes at `approval.evidence.path`,
 * computed by the caller (eval does the I/O; this validator stays pure), or
 * null when the file is missing or unreadable. v1 approvals bind no evidence
 * record, so the value is ignored on that branch.
 */
export function validateProbeBaselineApproval(input: {
  readonly baseline: ProbeBaseline;
  readonly approval: unknown;
  readonly baselineSha256: string;
  readonly probesSha256: string;
  readonly engine: ProbeEngineIdentity;
  readonly evidenceSha256: string | null;
}): readonly GateFinding[] {
  if (!isRecord(input.approval)) {
    return [approvalFinding('baseline-approval-missing', 'Probe baseline has no machine-readable independent approval.')];
  }

  const approval = input.approval;
  const findings: GateFinding[] = [];
  if (approval['schema'] === PROBE_BASELINE_APPROVAL_SCHEMA) {
    if (!validV1Shape(approval)) {
      return [approvalFinding('baseline-approval-malformed', 'Probe baseline approval is malformed or incomplete.')];
    }
    // v1 is closed to new records: only the identities the committed records
    // bound stay accepted, and only at their pre-sunset dates.
    if (!GRANDFATHERED_V1_APPROVAL_IDENTITIES.some((identity) =>
      sameEngineIdentity(identity, approval['engine'] as ProbeEngineIdentity))) {
      findings.push(approvalFinding('baseline-approval-v1-not-grandfathered',
        'Probe baseline approval declares retired schema v1 for an engine identity outside the ' +
        'grandfathered committed records; author it as a v2 approval instead.'));
    }
    if ((approval['reviewedAt'] as string) > APPROVAL_V1_SUNSET_DATE) {
      findings.push(approvalFinding('baseline-approval-v1-retired',
        `Probe baseline approval is schema v1 but its reviewedAt ${approval['reviewedAt'] as string} ` +
        `postdates the v1 sunset ${APPROVAL_V1_SUNSET_DATE}; new approvals must be authored in schema v2.`));
    }
  } else if (approval['schema'] === PROBE_BASELINE_APPROVAL_SCHEMA_V2) {
    const problems = v2ShapeProblems(approval);
    if (problems.length > 0) {
      return [approvalFinding('baseline-approval-malformed',
        `Probe baseline approval (v2) is malformed: ${problems.join('; ')}.`)];
    }
    // Blank identity or attestation fields are named findings rather than
    // generic malformation: they are how a rubber stamp becomes visible.
    if ((approval['reviewerName'] as string).trim().length === 0 || (approval['reviewerContact'] as string).trim().length === 0) {
      findings.push(approvalFinding('baseline-approval-reviewer-unidentified', 'Probe baseline approval does not name an identifiable independent reviewer.'));
    }
    if ((approval['independence'] as string).trim().length === 0) {
      findings.push(approvalFinding('baseline-approval-independence-missing', 'Probe baseline approval carries no independence attestation naming what the reviewer did not author.'));
    }
    const evidence = approval['evidence'] as { readonly path: string; readonly sha256: string };
    if (input.evidenceSha256 === null) {
      findings.push(approvalFinding('baseline-approval-evidence-mismatch', `Probe baseline approval evidence ${evidence.path} is missing or unreadable.`));
    } else if (input.evidenceSha256 !== evidence.sha256) {
      findings.push(approvalFinding('baseline-approval-evidence-mismatch', `Probe baseline approval evidence ${evidence.path} does not match the approved review-record digest.`));
    }
  } else {
    return [approvalFinding('baseline-approval-malformed', 'Probe baseline approval does not declare a supported approval schema.')];
  }

  if (approval['baselineSha256'] !== input.baselineSha256) {
    findings.push(approvalFinding('baseline-approval-baseline-mismatch', 'Probe baseline bytes differ from the independently approved baseline digest.'));
  }
  if (approval['probesSha256'] !== input.probesSha256) {
    findings.push(approvalFinding('baseline-approval-probes-mismatch', 'Probe definitions differ from the independently approved probe digest.'));
  }
  const approvalEngine = approval['engine'] as ProbeEngineIdentity;
  const triples: readonly [keyof ProbeEngineIdentity, string, string][] = [
    ['engineVersion', approvalEngine.engineVersion, input.engine.engineVersion],
    ['corpusFingerprint', approvalEngine.corpusFingerprint, input.engine.corpusFingerprint],
    ['layerFingerprint', approvalEngine.layerFingerprint, input.engine.layerFingerprint],
  ];
  for (const [field, approved, observed] of triples) {
    if (approved !== observed || (input.baseline as ProbeEngineIdentity)[field] !== observed) {
      findings.push(approvalFinding('baseline-approval-engine-mismatch', `Probe baseline ${field} does not match the independently approved engine identity.`));
    }
  }
  return findings;
}

export interface NoiseThresholds {
  readonly maxTop10ChurnRatio: number;
  readonly maxWeakReasonShareIncrease: number;
}

const TOP_N = 10;

function round(value: number): number {
  // Rounded so a baseline file does not churn on floating-point noise, while
  // staying precise enough that a real shift is still visible.
  return Number(value.toFixed(6));
}

export async function observeProbes(
  engine: ScriptureEngine,
  probes: readonly Probe[],
): Promise<{
  observations: ProbeObservation[];
  /**
   * Every probe's FULL default page (25) in exact rank order, scores rounded
   * to 6 dp, for the G2 ordering snapshot. Recorded alongside rather than
   * inside `ProbeObservation` so the G8 baseline digests stay byte-identical.
   */
  orderedResults: ProbeOrderedResults[];
  latenciesMs: number[];
}> {
  const observations: ProbeObservation[] = [];
  const orderedResults: ProbeOrderedResults[] = [];
  const latenciesMs: number[] = [];

  // Warm-up pass, discarded. The first query of a process pays for module
  // initialization, the first database page reads, and SQLite compiling each
  // statement's query plan. Including that in a p95 measures cold start, not
  // query cost — which is why this gate was failing on a slow CI runner while
  // passing locally, and would have kept failing at random.
  for (const probe of probes) {
    await engine.research(probe.query);
  }

  for (const probe of probes) {
    const started = performance.now();
    const result = await engine.research(probe.query);
    latenciesMs.push(performance.now() - started);

    const results = result.kind === 'discovery' ? result.results : [];
    const top = results.slice(0, TOP_N);

    let weakPoints = 0;
    let totalPoints = 0;
    for (const entry of top) {
      for (const reason of entry.reasons) {
        totalPoints += reason.points;
        if (!isAuthoritative(reason.family)) weakPoints += reason.points;
      }
    }

    observations.push({
      id: probe.id,
      top: top.map((entry) => entry.targetId),
      resultCount: results.length,
      weakReasonShare: totalPoints > 0 ? round(weakPoints / totalPoints) : 0,
      meanTopScore: top.length > 0
        ? round(top.reduce((sum, entry) => sum + entry.score, 0) / top.length)
        : 0,
    });
    orderedResults.push({
      id: probe.id,
      results: results.map((entry) => ({ targetId: entry.targetId, score: round(entry.score) })),
    });
  }
  return { observations, orderedResults, latenciesMs };
}

/** Fraction of the previous top-10 no longer present in the new top-10. */
function churn(previous: readonly string[], current: readonly string[]): number {
  if (previous.length === 0) return current.length > 0 ? 1 : 0;
  const now = new Set(current);
  const dropped = previous.filter((id) => !now.has(id)).length;
  return dropped / previous.length;
}

export function noiseGate(options: {
  readonly probes: readonly Probe[];
  readonly observations: readonly ProbeObservation[];
  readonly baseline: ProbeBaseline | null;
  readonly thresholds: NoiseThresholds;
}): GateResult {
  const findings: GateFinding[] = [];
  const byId = new Map(options.observations.map((observation) => [observation.id, observation]));

  // Adversarial silence is checked with or without a baseline: it is an
  // absolute property, not a comparison.
  for (const probe of options.probes) {
    const observation = byId.get(probe.id);
    if (!observation) continue;
    if (probe.expectNoResults && observation.resultCount > 0) {
      findings.push({
        categoryCode: 'sse.gauntlet.v1.finding.g8-noise-probes.adversarial-results',
        message:
          `${probe.id} ("${probe.query}") returned ${observation.resultCount} result(s) but must ` +
          `return none. ${probe.why ?? ''}`.trim(),
        subjects: [probe.id],
      });
    }
  }

  if (!options.baseline) {
    if (findings.length > 0) {
      return fail('G8-noise-probes', 'Noise probes', 'absolute probe checks failed', findings);
    }
    return pass(
      'G8-noise-probes',
      'Noise probes',
      `${options.observations.length} probe(s) recorded; no committed baseline yet, so churn ` +
        'is not measured this run',
      { probes: options.observations.length },
    );
  }

  const previous = new Map(options.baseline.observations.map((entry) => [entry.id, entry]));
  let maxChurn = 0;
  for (const observation of options.observations) {
    const before = previous.get(observation.id);
    if (!before) continue;
    const ratio = churn(before.top, observation.top);
    maxChurn = Math.max(maxChurn, ratio);

    // Precision erosion: weak signals taking over a list they did not
    // previously dominate. Measured as a rise, because the absolute level is
    // a property of what evidence the query can even have.
    const weakRise = observation.weakReasonShare - before.weakReasonShare;
    if (weakRise > options.thresholds.maxWeakReasonShareIncrease) {
      findings.push({
        categoryCode: 'sse.gauntlet.v1.finding.g8-noise-probes.weak-signal-rise',
        message:
          `${observation.id}: weak-signal share of the top-${TOP_N} rose from ` +
          `${(before.weakReasonShare * 100).toFixed(0)}% to ` +
          `${(observation.weakReasonShare * 100).toFixed(0)}% ` +
          `(+${(weakRise * 100).toFixed(0)} points, limit ` +
          `+${(options.thresholds.maxWeakReasonShareIncrease * 100).toFixed(0)}). ` +
          'Thematic hints are crowding out direct evidence.',
        subjects: [observation.id],
      });
    }
    if (ratio > options.thresholds.maxTop10ChurnRatio) {
      const now = new Set(observation.top);
      findings.push({
        categoryCode: 'sse.gauntlet.v1.finding.g8-noise-probes.top-results-churn',
        message:
          `${observation.id}: ${(ratio * 100).toFixed(0)}% of the top-${TOP_N} was displaced ` +
          `(limit ${(options.thresholds.maxTop10ChurnRatio * 100).toFixed(0)}%). Dropped: ` +
          `${before.top.filter((id) => !now.has(id)).join(', ')}`,
        subjects: [observation.id],
      });
    }
  }

  if (findings.length > 0) {
    // Count PROBES, not findings: one probe can trip several checks, and a
    // summary that says "4 probes" for 3 reads as protection it is not.
    const degradedProbes = new Set(findings.flatMap((finding) => finding.subjects ?? [])).size;
    return fail(
      'G8-noise-probes',
      'Noise probes',
      `${degradedProbes} probe(s) degraded versus baseline (${findings.length} finding(s))`,
      findings,
    );
  }
  return pass(
    'G8-noise-probes',
    'Noise probes',
    `${options.observations.length} probe(s) stable versus baseline (max churn ` +
      `${(maxChurn * 100).toFixed(0)}%)`,
    { probes: options.observations.length, maxChurnRatio: round(maxChurn) },
  );
}

export function latencyGate(latenciesMs: readonly number[], budgetMs: number): GateResult {
  if (latenciesMs.length === 0) {
    // Previously this branch reported `pass` — a gate that never ran wearing
    // a green checkmark, which is how a guardrail becomes decoration. G11 is
    // a required gate, so not-applicable makes the run REJECT: emptying the
    // probe file now fails closed instead of shipping unmeasured.
    return notApplicable(
      'G11-latency',
      'Latency',
      'no probes were timed — the probe file supplied no queries, so p95 cannot be measured',
    );
  }
  const sorted = [...latenciesMs].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1);
  const p95 = sorted[Math.max(0, index)]!;
  if (p95 > budgetMs) {
    return fail('G11-latency', 'Latency', `p95 ${p95.toFixed(1)}ms exceeds ${budgetMs}ms`, [
      {
        message:
          `Probe p95 is ${p95.toFixed(1)}ms against a ${budgetMs}ms budget, measured after a ` +
          'warm-up pass. This runs on a shared CI runner against the fixture corpus, so it ' +
          'catches ALGORITHMIC regressions (an accidental full scan, an unindexed join), not ' +
          'device performance. Target-hardware numbers must come from a consumer.',
      },
    ]);
  }
  return pass('G11-latency', 'Latency', `p95 ${p95.toFixed(1)}ms within ${budgetMs}ms`, {
    p95Ms: round(p95),
    maxMs: round(sorted[sorted.length - 1]!),
  });
}
