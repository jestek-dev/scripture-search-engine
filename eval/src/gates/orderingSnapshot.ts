/**
 * G2 (companion) — the ordered per-probe snapshot and its approval-bound
 * tripwire.
 *
 * G8 asks "did the result LISTS get worse?" and tolerates reviewed movement.
 * This check asks a stricter question G8 cannot: "did ANY ordering move at
 * all without the engine identity moving with it?" The committed snapshot
 * pins every probe's full default page (25 results, scores rounded to 6 dp);
 * the gauntlet replays the probes and compares byte-for-byte. Determinism is
 * the product, so a reordering with an unchanged
 * (engineVersion, corpusFingerprint, layerFingerprint) triple is a defect by
 * definition — CLAUDE.md #2 — and this gate makes it mechanically fail
 * instead of relying on a reviewer to notice.
 *
 * Decision table (each rule names its finding category):
 *
 *  1. no committed snapshot                     → fail  ordering-snapshot-missing
 *  2. approval missing or malformed             → fail  ordering-approval-missing / -malformed
 *  3. approval does not bind the committed
 *     snapshot (digest or engine identity)      → fail  ordering-approval-*-mismatch
 *  4. observed identity triple differs from the
 *     snapshot's (stale snapshot)               → fail  ordering-snapshot-stale-identity
 *  5. orderings changed while the identity
 *     triple did not                            → fail  ordering-changed-without-version-bump
 *  6. tripwire: the approval's probeListsSha256
 *     moved while its engine deep-equals
 *     priorProvenance.engine                    → fail  ordering-approval-tripwire
 *  7. everything consistent                     → pass
 *
 * Rule 6 closes the regenerate-without-bump hole: without it, regenerating
 * the snapshot AND rewriting the approval in one commit would satisfy rules
 * 1-5 even though nothing bumped. The residual bypass is deliberately
 * forging `priorProvenance` — a visible edit to a `*.approval.json` file,
 * the same trust boundary the G8 approval already accepts, and caught
 * post-merge by the CI merge-base leg that compares `priorProvenance`
 * against the actual merge-base blob.
 */

import { fail, pass, type GateFinding, type GateResult } from './types.js';
import {
  APPROVAL_EVIDENCE_PATH_PATTERN,
  APPROVAL_V1_SUNSET_DATE,
  GRANDFATHERED_V1_APPROVAL_IDENTITIES,
  canonicalJsonSha256,
} from './probes.js';

/** One ranked result as the snapshot records it: identity and rounded score. */
export interface OrderedProbeResult {
  readonly targetId: string;
  readonly score: number;
}

/** A probe's full default page (25), in exact rank order. */
export interface ProbeOrderedResults {
  readonly id: string;
  readonly results: readonly OrderedProbeResult[];
}

export interface OrderingEngineIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

export interface OrderingSnapshot {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  readonly probes: readonly ProbeOrderedResults[];
}

export const ORDERING_SNAPSHOT_APPROVAL_SCHEMA =
  'scripture-search-engine/ordering-snapshot-approval/v1';

/**
 * v2 mirrors the probe-baseline approval's accountable record: named reviewer
 * with contact, independence attestation, and a byte digest binding the
 * review record under docs/reviews/. It binds no review-packet digest — the
 * packet renders G8 baseline movement only; the rendered evidence for an
 * ordering review is the review record itself. v1 stays valid solely for the
 * grandfathered committed record (same identity pin and sunset as G8's).
 */
export const ORDERING_SNAPSHOT_APPROVAL_SCHEMA_V2 =
  'scripture-search-engine/ordering-snapshot-approval/v2';

interface OrderingSnapshotPriorProvenance {
  readonly snapshotGitBlobSha1: string;
  readonly probeListsSha256: string;
  readonly engine: OrderingEngineIdentity;
}

/**
 * A separate review record: snapshot generation never writes this file.
 * Writing it IS the approval act. `priorProvenance` is null only for the
 * bootstrap approval, before any prior snapshot existed to name.
 */
export interface OrderingSnapshotApproval {
  readonly schema: typeof ORDERING_SNAPSHOT_APPROVAL_SCHEMA;
  readonly snapshotSha256: string;
  readonly probeListsSha256: string;
  readonly engine: OrderingEngineIdentity;
  readonly reviewer: string;
  readonly reviewedAt: string;
  readonly rationale: string;
  readonly priorProvenance: OrderingSnapshotPriorProvenance | null;
}

/** The v2 review record: identity, attestation, and evidence are explicit. */
export interface OrderingSnapshotApprovalV2 {
  readonly schema: typeof ORDERING_SNAPSHOT_APPROVAL_SCHEMA_V2;
  readonly snapshotSha256: string;
  readonly probeListsSha256: string;
  readonly engine: OrderingEngineIdentity;
  readonly reviewerName: string;
  readonly reviewerContact: string;
  readonly independence: string;
  readonly evidence: { readonly path: string; readonly sha256: string };
  readonly reviewedAt: string;
  readonly rationale: string;
  /** Null only beside `bootstrap`, which documents why no prior exists. */
  readonly priorProvenance: OrderingSnapshotPriorProvenance | null;
  readonly bootstrap?: string;
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

function isEngineIdentity(value: unknown): value is OrderingEngineIdentity {
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
    categoryCode: `sse.gauntlet.v1.finding.g2-determinism.${category}`,
    message,
    subjects: ['ordering-snapshot-approval'],
  };
}

function validPriorProvenance(approval: Record<string, unknown>): boolean {
  const prior = approval['priorProvenance'];
  if (prior === null) return true;
  const priorEngine = isRecord(prior) ? prior['engine'] : undefined;
  return isRecord(prior) && exactKeys(prior, ['snapshotGitBlobSha1', 'probeListsSha256', 'engine']) &&
    typeof prior['snapshotGitBlobSha1'] === 'string' && /^[0-9a-f]{40}$/.test(prior['snapshotGitBlobSha1']) &&
    isSha256(prior['probeListsSha256']) && isEngineIdentity(priorEngine);
}

function validShape(approval: Record<string, unknown>): boolean {
  return exactKeys(approval, [
    'schema',
    'snapshotSha256',
    'probeListsSha256',
    'engine',
    'reviewer',
    'reviewedAt',
    'rationale',
    'priorProvenance',
  ]) && isSha256(approval['snapshotSha256']) &&
    isSha256(approval['probeListsSha256']) && isEngineIdentity(approval['engine']) &&
    typeof approval['reviewer'] === 'string' && approval['reviewer'].trim().length > 0 &&
    isReviewDate(approval['reviewedAt']) && typeof approval['rationale'] === 'string' &&
    approval['rationale'].trim().length > 0 && validPriorProvenance(approval);
}

const V2_KEYS = [
  'schema',
  'snapshotSha256',
  'probeListsSha256',
  'engine',
  'reviewerName',
  'reviewerContact',
  'independence',
  'evidence',
  'reviewedAt',
  'rationale',
  'priorProvenance',
] as const;

/**
 * Field-level v2 shape problems, each naming the offending field — same
 * discipline as the G8 approval validator's.
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
  check('snapshotSha256', isSha256(approval['snapshotSha256']), 'a 64-hex sha256');
  check('probeListsSha256', isSha256(approval['probeListsSha256']), 'a 64-hex sha256');
  check('engine', isEngineIdentity(approval['engine']), 'the exact engine identity triple');
  check('reviewerName', typeof approval['reviewerName'] === 'string', 'a string');
  check('reviewerContact', typeof approval['reviewerContact'] === 'string', 'a string');
  check('independence', typeof approval['independence'] === 'string', 'a string');
  const evidence = approval['evidence'];
  check('evidence', isRecord(evidence) && exactKeys(evidence, ['path', 'sha256']) &&
    typeof evidence['path'] === 'string' && APPROVAL_EVIDENCE_PATH_PATTERN.test(evidence['path']) &&
    isSha256(evidence['sha256']),
  'a {path, sha256} record naming a docs/reviews/*.md review record');
  check('reviewedAt', isReviewDate(approval['reviewedAt']), 'a real YYYY-MM-DD date');
  check('rationale', typeof approval['rationale'] === 'string' && approval['rationale'].trim().length > 0,
    'a non-empty string');
  if ('bootstrap' in approval &&
      (typeof approval['bootstrap'] !== 'string' || approval['bootstrap'].trim().length === 0)) {
    problems.push('"bootstrap" must be a non-empty string documenting why no prior snapshot exists');
  }
  if ('priorProvenance' in approval) {
    if (approval['priorProvenance'] === null) {
      if (!('bootstrap' in approval)) {
        problems.push('"priorProvenance" may be null only beside a "bootstrap" field documenting the missing prior');
      }
    } else {
      if ('bootstrap' in approval) problems.push('"bootstrap" is valid only when "priorProvenance" is null');
      if (!validPriorProvenance(approval)) {
        problems.push('"priorProvenance" must bind the prior snapshot git blob, probe-lists digest, and engine identity');
      }
    }
  }
  return problems;
}

/** True for a document well-formed under either approval schema. */
function wellFormedApproval(approval: unknown): approval is Record<string, unknown> {
  if (!isRecord(approval)) return false;
  if (approval['schema'] === ORDERING_SNAPSHOT_APPROVAL_SCHEMA) return validShape(approval);
  if (approval['schema'] === ORDERING_SNAPSHOT_APPROVAL_SCHEMA_V2) return v2ShapeProblems(approval).length === 0;
  return false;
}

/**
 * Checks the approval for a committed ordering snapshot. Modeled line-for-line
 * on the G8 probe-baseline approval validator: hashes bind the exact logical
 * JSON documents, so a checkout's CRLF/LF policy does not change what a
 * reviewer approved.
 *
 * `evidenceSha256` is the SHA-256 of the bytes at `approval.evidence.path`,
 * computed by the caller (eval does the I/O; this validator stays pure), or
 * null when the file is missing or unreadable. The grandfathered v1 record
 * binds no evidence, so the value is ignored on that branch.
 */
export function validateOrderingSnapshotApproval(input: {
  readonly snapshot: OrderingSnapshot;
  readonly approval: unknown;
  readonly snapshotSha256: string;
  readonly probeListsSha256: string;
  readonly engine: OrderingEngineIdentity;
  readonly evidenceSha256: string | null;
}): readonly GateFinding[] {
  if (!isRecord(input.approval)) {
    return [approvalFinding('ordering-approval-missing', 'Ordering snapshot has no machine-readable approval.')];
  }

  const approval = input.approval;
  const findings: GateFinding[] = [];
  if (approval['schema'] === ORDERING_SNAPSHOT_APPROVAL_SCHEMA) {
    if (!validShape(approval)) {
      return [approvalFinding('ordering-approval-malformed', 'Ordering snapshot approval is malformed or incomplete.')];
    }
    // v1 is closed to new records: only the identity the committed record
    // bound stays accepted, and only at its pre-sunset date.
    if (!GRANDFATHERED_V1_APPROVAL_IDENTITIES.some((identity) =>
      sameIdentity(identity, approval['engine'] as OrderingEngineIdentity))) {
      findings.push(approvalFinding('ordering-approval-v1-not-grandfathered',
        'Ordering snapshot approval declares retired schema v1 for an engine identity outside the ' +
        'grandfathered committed records; author it as a v2 approval instead.'));
    }
    if ((approval['reviewedAt'] as string) > APPROVAL_V1_SUNSET_DATE) {
      findings.push(approvalFinding('ordering-approval-v1-retired',
        `Ordering snapshot approval is schema v1 but its reviewedAt ${approval['reviewedAt'] as string} ` +
        `postdates the v1 sunset ${APPROVAL_V1_SUNSET_DATE}; new approvals must be authored in schema v2.`));
    }
  } else if (approval['schema'] === ORDERING_SNAPSHOT_APPROVAL_SCHEMA_V2) {
    const problems = v2ShapeProblems(approval);
    if (problems.length > 0) {
      return [approvalFinding('ordering-approval-malformed',
        `Ordering snapshot approval (v2) is malformed: ${problems.join('; ')}.`)];
    }
    // Blank identity or attestation fields are named findings rather than
    // generic malformation: they are how a rubber stamp becomes visible.
    if ((approval['reviewerName'] as string).trim().length === 0 ||
        (approval['reviewerContact'] as string).trim().length === 0) {
      findings.push(approvalFinding('ordering-approval-reviewer-unidentified',
        'Ordering snapshot approval does not name an identifiable independent reviewer.'));
    }
    if ((approval['independence'] as string).trim().length === 0) {
      findings.push(approvalFinding('ordering-approval-independence-missing',
        'Ordering snapshot approval carries no independence attestation naming what the reviewer did not author.'));
    }
    const evidence = approval['evidence'] as { readonly path: string; readonly sha256: string };
    if (input.evidenceSha256 === null) {
      findings.push(approvalFinding('ordering-approval-evidence-mismatch',
        `Ordering snapshot approval evidence ${evidence.path} is missing or unreadable.`));
    } else if (input.evidenceSha256 !== evidence.sha256) {
      findings.push(approvalFinding('ordering-approval-evidence-mismatch',
        `Ordering snapshot approval evidence ${evidence.path} does not match the approved review-record digest.`));
    }
  } else {
    return [approvalFinding('ordering-approval-malformed', 'Ordering snapshot approval does not declare a supported approval schema.')];
  }

  if (approval['snapshotSha256'] !== input.snapshotSha256) {
    findings.push(approvalFinding('ordering-approval-snapshot-mismatch', 'Ordering snapshot bytes differ from the approved snapshot digest.'));
  }
  if (approval['probeListsSha256'] !== input.probeListsSha256) {
    findings.push(approvalFinding('ordering-approval-probe-lists-mismatch', 'Ordering snapshot probe lists differ from the approved probe-lists digest.'));
  }
  const approvalEngine = approval['engine'] as OrderingEngineIdentity;
  const triples: readonly [keyof OrderingEngineIdentity, string, string][] = [
    ['engineVersion', approvalEngine.engineVersion, input.engine.engineVersion],
    ['corpusFingerprint', approvalEngine.corpusFingerprint, input.engine.corpusFingerprint],
    ['layerFingerprint', approvalEngine.layerFingerprint, input.engine.layerFingerprint],
  ];
  for (const [field, approved, observed] of triples) {
    if (approved !== observed || input.snapshot[field] !== observed) {
      findings.push(approvalFinding('ordering-approval-engine-mismatch', `Ordering snapshot ${field} does not match the approved engine identity.`));
    }
  }
  return findings;
}

/** Digest of just the ordered lists, used by the approval and the tripwire. */
export function probeListsSha256(probes: readonly ProbeOrderedResults[]): string {
  return canonicalJsonSha256(probes);
}

const TOP_PREVIEW = 5;

function topPreview(results: readonly OrderedProbeResult[]): string {
  if (results.length === 0) return '(no results)';
  return results
    .slice(0, TOP_PREVIEW)
    .map((entry) => `${entry.targetId}@${entry.score}`)
    .join(', ');
}

function sameIdentity(left: OrderingEngineIdentity, right: OrderingEngineIdentity): boolean {
  return left.engineVersion === right.engineVersion &&
    left.corpusFingerprint === right.corpusFingerprint &&
    left.layerFingerprint === right.layerFingerprint;
}

export function orderingSnapshotGate(options: {
  readonly snapshot: OrderingSnapshot | null;
  readonly approval: unknown;
  /**
   * SHA-256 of the bytes at the approval's evidence path, computed by the
   * caller, or null when absent. Ignored for the grandfathered v1 record.
   */
  readonly evidenceSha256: string | null;
  /**
   * The identity and ordered lists this run actually observed, or null when
   * an explicit candidate/release target was evaluated — those artifacts
   * intentionally differ from the fixture identity the snapshot pins, so
   * rules 4-5 cannot apply and only the document integrity rules run.
   */
  readonly observed: {
    readonly identity: OrderingEngineIdentity;
    readonly probes: readonly ProbeOrderedResults[];
  } | null;
}): GateResult {
  // Rule 1. The snapshot is committed reviewed data from the moment it first
  // landed; its absence means the guard was deleted, not that it never ran.
  if (options.snapshot === null) {
    return fail('G2-determinism', 'Determinism', 'ordering snapshot missing', [
      {
        categoryCode: 'sse.gauntlet.v1.finding.g2-determinism.ordering-snapshot-missing',
        message:
          'eval/baselines/ordering.snapshot.json is missing. It is committed reviewed data: ' +
          'regenerate it with `npm run gauntlet -- --update-ordering-snapshot` and have the ' +
          'approval rewritten by its reviewer.',
        subjects: ['ordering-snapshot'],
      },
    ]);
  }

  const snapshot = options.snapshot;
  const snapshotIdentity: OrderingEngineIdentity = {
    engineVersion: snapshot.engineVersion,
    corpusFingerprint: snapshot.corpusFingerprint,
    layerFingerprint: snapshot.layerFingerprint,
  };

  // Rules 2-3, shared with the approval validator.
  const findings: GateFinding[] = [
    ...validateOrderingSnapshotApproval({
      snapshot,
      approval: options.approval,
      snapshotSha256: canonicalJsonSha256(snapshot),
      probeListsSha256: probeListsSha256(snapshot.probes),
      engine: snapshotIdentity,
      evidenceSha256: options.evidenceSha256,
    }),
  ];

  // Rule 6 — the tripwire. A regenerated snapshot means a new probeListsSha256
  // in the rewritten approval; if the approval's engine identity did not move
  // with it, the ordering changed without a version bump and the re-approval
  // itself is the evidence. Checked whenever the approval is well-formed
  // enough to carry both fields — under either schema — independent of what
  // this run observed.
  if (wellFormedApproval(options.approval)) {
    const approval = options.approval as unknown as OrderingSnapshotApproval | OrderingSnapshotApprovalV2;
    const prior = approval.priorProvenance;
    if (prior !== null && approval.probeListsSha256 !== prior.probeListsSha256 &&
        sameIdentity(approval.engine, prior.engine)) {
      findings.push({
        categoryCode: 'sse.gauntlet.v1.finding.g2-determinism.ordering-approval-tripwire',
        message:
          'Ordering snapshot approval records new probe lists ' +
          `(probeListsSha256 ${approval.probeListsSha256.slice(0, 12)}… was ` +
          `${prior.probeListsSha256.slice(0, 12)}…) while its engine identity deep-equals ` +
          'priorProvenance.engine. Orderings changed without an identity bump: bump ' +
          'ENGINE_VERSION (or account for the moved fingerprint) in this same commit.',
        subjects: ['ordering-snapshot-approval'],
      });
    }
  }

  let changedProbes = 0;
  if (options.observed !== null) {
    // Rule 4. The snapshot no longer describes the engine identity under
    // evaluation, so its orderings are stale by definition.
    if (!sameIdentity(options.observed.identity, snapshotIdentity)) {
      findings.push({
        categoryCode: 'sse.gauntlet.v1.finding.g2-determinism.ordering-snapshot-stale-identity',
        message:
          'Engine identity moved (snapshot pins ' +
          `${snapshotIdentity.engineVersion}/${snapshotIdentity.corpusFingerprint.slice(0, 12)}…/` +
          `${snapshotIdentity.layerFingerprint.slice(0, 12)}…, this run is ` +
          `${options.observed.identity.engineVersion}/${options.observed.identity.corpusFingerprint.slice(0, 12)}…/` +
          `${options.observed.identity.layerFingerprint.slice(0, 12)}…) but the committed ordering ` +
          'snapshot was not regenerated. Run `npm run gauntlet -- --update-ordering-snapshot` and ' +
          'have the approval rewritten in this same commit.',
        subjects: ['ordering-snapshot'],
      });
    } else {
      // Rule 5. Identity held still, so every list must match byte-for-byte.
      const before = new Map(snapshot.probes.map((probe) => [probe.id, probe.results]));
      const after = new Map(options.observed.probes.map((probe) => [probe.id, probe.results]));
      for (const id of new Set([...before.keys(), ...after.keys()])) {
        const previous = before.get(id);
        const current = after.get(id);
        if (previous !== undefined && current !== undefined &&
            JSON.stringify(previous) === JSON.stringify(current)) continue;
        changedProbes += 1;
        findings.push({
          categoryCode: 'sse.gauntlet.v1.finding.g2-determinism.ordering-changed-without-version-bump',
          message:
            `${id}: ordering changed while the engine identity triple did not. ` +
            `Before top-${TOP_PREVIEW}: [${previous === undefined ? 'probe absent from snapshot' : topPreview(previous)}]. ` +
            `After top-${TOP_PREVIEW}: [${current === undefined ? 'probe absent from this run' : topPreview(current)}]. ` +
            'Bump ENGINE_VERSION (or the moved fingerprint) and regenerate snapshot + approval ' +
            'in this same commit.',
          subjects: [id],
        });
      }
    }
  }

  if (findings.length > 0) {
    const summary = changedProbes > 0
      ? `${changedProbes} probe ordering(s) changed with an unmoved identity triple`
      : 'ordering snapshot or its approval is not consistent with this run';
    return fail('G2-determinism', 'Determinism', summary, findings, {
      snapshotProbes: snapshot.probes.length,
      changedProbeOrderings: changedProbes,
    });
  }

  const scope = options.observed === null
    ? 'approval binding verified (explicit target run; ordered lists are compared on fixture runs)'
    : `${snapshot.probes.length} probe ordering(s) byte-identical to the approved snapshot`;
  return pass('G2-determinism', 'Determinism', `ordering snapshot: ${scope}`, {
    snapshotProbes: snapshot.probes.length,
    changedProbeOrderings: 0,
  });
}
