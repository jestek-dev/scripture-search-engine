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
 * (what the reviewer did NOT author), and a byte digest binding the review
 * record itself. Both schemas validate today because the committed approval
 * is still the v1 record; the cutover commit that re-issues it as a signed
 * v2 record also deletes v1 acceptance, and per
 * docs/governance/probe-baseline-review.md that commit is never opened until
 * the designated reviewer has signed — the repository never carries an
 * approval its own gauntlet rejects.
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
  readonly reviewedAt: string;
  readonly rationale: string;
  readonly priorProvenance: ProbeBaselinePriorProvenance;
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

function validV2Shape(approval: Record<string, unknown>): boolean {
  const evidence = approval['evidence'];
  const validEvidence = isRecord(evidence) && exactKeys(evidence, ['path', 'sha256']) &&
    typeof evidence['path'] === 'string' && APPROVAL_EVIDENCE_PATH_PATTERN.test(evidence['path']) &&
    isSha256(evidence['sha256']);
  return exactKeys(approval, [
    'schema',
    'baselineSha256',
    'probesSha256',
    'engine',
    'reviewerName',
    'reviewerContact',
    'independence',
    'evidence',
    'reviewedAt',
    'rationale',
    'priorProvenance',
  ]) && isSha256(approval['baselineSha256']) &&
    isSha256(approval['probesSha256']) && isEngineIdentity(approval['engine']) &&
    typeof approval['reviewerName'] === 'string' && typeof approval['reviewerContact'] === 'string' &&
    typeof approval['independence'] === 'string' && validEvidence &&
    isReviewDate(approval['reviewedAt']) && typeof approval['rationale'] === 'string' &&
    approval['rationale'].trim().length > 0 && validPriorProvenance(approval);
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
  } else if (approval['schema'] === PROBE_BASELINE_APPROVAL_SCHEMA_V2) {
    if (!validV2Shape(approval)) {
      return [approvalFinding('baseline-approval-malformed', 'Probe baseline approval is malformed or incomplete.')];
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
    return fail(
      'G8-noise-probes',
      'Noise probes',
      `${findings.length} probe(s) degraded versus baseline`,
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
