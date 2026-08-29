import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  previewAdmission,
  runAdmission,
  signAdmissionDecision,
  type AdmissionCandidateBinding,
  type AdmissionDecisionKind,
  type AdmissionManifest,
  type AdmissionPreview,
  type AdmissionPreviewInput,
  type DeferredSigningMarker,
  type EngineIdentity,
  type ProbeDecisionRationale,
} from './admission.js';
import type { ComparisonReport } from './comparison.js';
import type { ComparisonCandidateBinding } from './comparisonRunner.js';
import { prepareDraftPublication, type PublishPreparationResult } from './publishPreparation.js';
import { parseProposalManifest, proposalManifestDigest, type ProposalManifest } from './proposals.js';
import { provisionDetachedWorktree } from './worktreeProvision.js';

const execFileAsync = promisify(execFile);
const SHA256 = /^[0-9a-f]{64}$/;
const COMMIT = /^[0-9a-f]{40,64}$/;
const REVIEW_ID = /^[a-z0-9][a-z0-9-]{7,79}$/;
const ADMISSION_DIRECTORY = 'workbench/admissions';

export class AdmissionPublishOperationsError extends Error {
  constructor(readonly code: string, message: string, readonly status = 400) {
    super(message);
    this.name = 'AdmissionPublishOperationsError';
  }
}

export interface AdmissionEvidenceEntry {
  readonly reviewId: string;
  readonly admittedBaseCommit: string;
  readonly expectedMainCommit: string;
  /**
   * The seal-time tip of `refs/remotes/origin/main` (`null` records that the
   * ref did not exist at seal). Together with `admittedBaseCommit` it bounds
   * the train's §03.6 live window: a squash merge lands on origin/main first,
   * so at seal the fetched origin tip can be AHEAD of the lagging local main
   * — history the train could not have produced, which the live observation
   * must exclude. Absent only on entries sealed before it was recorded.
   */
  readonly admittedOriginBaseCommit?: string | null;
  readonly proposal: unknown;
  /**
   * Fixture-lane (all-golden-fixture-upsert) entries record no candidate
   * artifact — the four evidence fields are null together and `baseIdentity`
   * pins the identity the rebuild must reproduce (identity-neutrality proof).
   */
  readonly candidate: AdmissionCandidateBinding | null;
  readonly comparison: ComparisonReport | null;
  readonly comparisonBinding: ComparisonCandidateBinding | null;
  readonly gauntlet: { readonly reportPath: string } | null;
  readonly baseIdentity?: EngineIdentity | null;
  readonly deferredSigningMarker?: DeferredSigningMarker | null;
  readonly reviewedComparisonQueries: readonly string[];
  readonly fixturePromotions?: AdmissionPreviewInput['fixturePromotions'];
  readonly probeBaseline?: AdmissionPreviewInput['probeBaseline'];
  readonly probeApproval?: AdmissionPreviewInput['probeApproval'];
  readonly provenance: readonly string[];
}

interface AdmissionEvidenceRegistry {
  readonly schemaVersion: 1;
  readonly admissions: readonly AdmissionEvidenceEntry[];
}

export interface AdmissionPublishOperationsOptions {
  readonly repoRoot: string;
  readonly evidencePath: string;
  readonly reviewer: string;
  readonly signingKey?: string;
  /**
   * §5.5 gap 3 (guard half): executes the base-commit control run when a
   * guard-train release verdict is red. Without it, a red release verdict
   * refuses exactly as today.
   */
  readonly controlRun?: NonNullable<Parameters<typeof runAdmission>[0]['dependencies']>['controlRun'];
  readonly now?: () => Date;
  readonly operations?: {
    readonly previewAdmission?: typeof previewAdmission;
    readonly runAdmission?: typeof runAdmission;
    readonly prepareDraftPublication?: typeof prepareDraftPublication;
    readonly currentMain?: (repoRoot: string) => Promise<string | null>;
  };
}

interface PublicDecisionSlot {
  readonly kind: AdmissionDecisionKind;
  readonly slotId: string;
  readonly subjectDigest: string;
  readonly probes: readonly { readonly probeId: string; readonly beforeSha256: string | null; readonly afterSha256: string | null }[];
}

export interface AdmissionView {
  readonly reviewId: string;
  readonly proposalId: string;
  readonly state: 'READY' | 'ADMITTED' | 'BLOCKED';
  readonly readOnly: boolean;
  readonly blockers: readonly string[];
  readonly recovery: readonly string[];
  readonly preview: {
    readonly digest: string;
    readonly proposalDigest: string;
    readonly baseCommit: string;
    readonly candidate: {
      readonly cacheKey: string;
      readonly descriptorSha256: string;
      readonly databaseSha256: string;
      readonly engineVersion: string;
      readonly corpusFingerprint: string;
      readonly layerFingerprint: string;
    } | null;
    readonly diffs: AdmissionPreview['diffs'];
    readonly decisions: readonly PublicDecisionSlot[];
    readonly measurableEffect: boolean;
    readonly effectExemption: AdmissionPreview['effectExemption'];
    readonly reviewedComparisonQueries: readonly string[];
    readonly gauntlet: {
      readonly verdict: string;
      readonly blocking: boolean;
      readonly gates: readonly { readonly gate: string; readonly title: string; readonly status: string; readonly verdict: string; readonly summary: string; readonly findings: readonly { readonly message: string; readonly subjects: readonly string[] }[] }[];
    } | null;
  } | null;
  readonly admission: {
    readonly digest: string;
    readonly admittedAt: string;
    readonly manifestId: string;
  } | null;
}

export interface PublishPreflightView {
  readonly reviewId: string;
  readonly proposalId: string;
  readonly admissionDigest: string;
  readonly ready: boolean;
  readonly branch: string;
  readonly expectedMainCommit: string;
  readonly currentMainCommit: string | null;
  readonly blockers: readonly string[];
  readonly recovery: readonly string[];
}

export interface PublishView {
  readonly reviewId: string;
  readonly proposalId: string;
  readonly admission: { readonly digest: string; readonly admittedAt: string } | null;
  readonly preflight: PublishPreflightView | null;
}

function fail(code: string, message: string, status = 400): never {
  throw new AdmissionPublishOperationsError(code, message, status);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, allowed: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const expected = [...allowed].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail('invalid_request', `${label} has an unsupported shape.`);
}

function requireReviewId(value: string): string {
  if (!REVIEW_ID.test(value)) fail('invalid_route', 'Admission identifier is invalid.');
  return value;
}

function normalizePath(value: string): string {
  return process.platform === 'win32' ? path.resolve(value).toLocaleLowerCase('en-US') : path.resolve(value);
}

function within(root: string, target: string): boolean {
  const relative = path.relative(normalizePath(root), normalizePath(target));
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function realParentForMissing(target: string): Promise<string> {
  let current = path.dirname(target);
  while (true) {
    try { return await realpath(current); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      const parent = path.dirname(current);
      if (parent === current) throw error;
      current = parent;
    }
  }
}

async function readTrustedRegistry(repoRoot: string, evidencePath: string): Promise<AdmissionEvidenceRegistry> {
  const root = await realpath(repoRoot).catch(() => fail('repository_unavailable', 'Workbench repository is unavailable.', 503));
  const resolved = path.resolve(evidencePath);
  if (!resolved.endsWith('.json')) fail('unsafe_evidence', 'Admission evidence registry must be a trusted JSON file.', 500);
  const stats = await lstat(resolved).catch((error: NodeJS.ErrnoException) => error.code === 'ENOENT' ? null : Promise.reject(error));
  if (stats === null) {
    const parent = await realParentForMissing(resolved).catch(() => fail('unsafe_evidence', 'Admission evidence registry parent cannot be resolved safely.', 500));
    if (!within(root, parent)) fail('unsafe_evidence', 'Admission evidence registry resolves outside the trusted repository namespace.', 500);
    return { schemaVersion: 1, admissions: [] };
  }
  if (!stats.isFile() || stats.isSymbolicLink()) fail('unsafe_evidence', 'Admission evidence registry must be a regular JSON file.', 500);
  const actual = await realpath(resolved).catch(() => fail('unsafe_evidence', 'Admission evidence registry cannot be resolved safely.', 500));
  if (!within(root, actual)) fail('unsafe_evidence', 'Admission evidence registry resolves outside the trusted repository namespace.', 500);
  let raw: unknown;
  try { raw = JSON.parse(await readFile(resolved, 'utf8')) as unknown; }
  catch { fail('invalid_evidence', 'Admission evidence registry is not valid JSON.', 500); }
  if (!isRecord(raw) || raw['schemaVersion'] !== 1 || !Array.isArray(raw['admissions'])) {
    fail('invalid_evidence', 'Admission evidence registry has an unsupported schema.', 500);
  }
  const entries = raw['admissions'].map((entry, index) => {
    if (!isRecord(entry)) fail('invalid_evidence', `Admission evidence ${index + 1} is invalid.`, 500);
    const keys = ['reviewId', 'admittedBaseCommit', 'admittedOriginBaseCommit', 'expectedMainCommit', 'proposal', 'candidate', 'comparison', 'comparisonBinding', 'gauntlet', 'baseIdentity', 'deferredSigningMarker', 'reviewedComparisonQueries', 'provenance', 'fixturePromotions', 'probeBaseline', 'probeApproval'];
    const actual = Object.keys(entry);
    if (actual.some((key) => !keys.includes(key))) fail('invalid_evidence', `Admission evidence ${index + 1} has unsupported fields.`, 500);
    if (typeof entry['reviewId'] !== 'string' || !REVIEW_ID.test(entry['reviewId'])) fail('invalid_evidence', `Admission evidence ${index + 1} has an invalid review id.`, 500);
    if (typeof entry['admittedBaseCommit'] !== 'string' || !COMMIT.test(entry['admittedBaseCommit'])
      || typeof entry['expectedMainCommit'] !== 'string' || !COMMIT.test(entry['expectedMainCommit'])
      || !Array.isArray(entry['reviewedComparisonQueries']) || !Array.isArray(entry['provenance'])) {
      fail('invalid_evidence', `Admission evidence ${index + 1} has invalid immutable bindings.`, 500);
    }
    if (entry['admittedOriginBaseCommit'] !== undefined && entry['admittedOriginBaseCommit'] !== null
      && (typeof entry['admittedOriginBaseCommit'] !== 'string' || !COMMIT.test(entry['admittedOriginBaseCommit']))) {
      fail('invalid_evidence', `Admission evidence ${index + 1} has invalid immutable bindings.`, 500);
    }
    return entry as unknown as AdmissionEvidenceEntry;
  });
  if (new Set(entries.map((entry) => entry.reviewId)).size !== entries.length) fail('invalid_evidence', 'Admission evidence has duplicate review ids.', 500);
  return { schemaVersion: 1, admissions: entries };
}

function projectPreview(preview: AdmissionPreview): AdmissionView['preview'] {
  return {
    digest: preview.digest,
    proposalDigest: preview.proposalDigest,
    // Deliberate (votes-to-engine plan, D1): this view field carries the main
    // binding (`expectedMainCommit`), not `admittedBaseCommit`. The one UI
    // consumer (advanced.html) labels it "Admitted main", and publish
    // preflight refuses any admission whose baseCommit differs from its
    // expectedMainCommit (#preflight below), so the two commits must be equal
    // in every state that can ship. Any future Updates/train view reusing
    // this projection inherits that meaning: baseCommit here = the main
    // commit the admission was reviewed against.
    baseCommit: preview.expectedMainCommit,
    candidate: preview.candidate === null ? null : {
      cacheKey: preview.candidate.cacheKey,
      descriptorSha256: preview.candidate.descriptorSha256,
      databaseSha256: preview.candidate.databaseSha256,
      engineVersion: preview.candidate.engineVersion,
      corpusFingerprint: preview.candidate.corpusFingerprint,
      layerFingerprint: preview.candidate.layerFingerprint,
    },
    diffs: preview.diffs,
    decisions: preview.decisionSlots.map((slot) => ({
      ...slot,
      probes: slot.kind === 'probe-baseline' ? preview.probeMovements : [],
    })),
    measurableEffect: preview.measurableEffect,
    effectExemption: preview.effectExemption,
    reviewedComparisonQueries: preview.reviewedComparisonQueries,
    gauntlet: preview.gauntlet === null ? null : {
      verdict: preview.gauntlet.verdict,
      blocking: preview.gauntlet.blocking,
      gates: preview.gauntlet.gates.map((gate) => ({
        gate: gate.gate,
        title: gate.title,
        status: gate.status,
        verdict: gate.verdict,
        summary: gate.summary,
        findings: gate.findings.map((finding) => ({ message: finding.message, subjects: finding.subjects })),
      })),
    },
  };
}

function branchFor(proposal: ProposalManifest, admittedAt: string): string {
  return `refinement/${admittedAt.slice(0, 10)}-${proposal.proposalId}`;
}

function manifestId(manifest: AdmissionManifest): string {
  return manifest.admissionKey;
}

function parseManifest(value: unknown): AdmissionManifest | null {
  if (!isRecord(value) || value['schemaVersion'] !== 1 || value['kind'] !== 'scripture-search-admission'
    || typeof value['digest'] !== 'string' || !SHA256.test(value['digest']) || typeof value['previewDigest'] !== 'string'
    || !SHA256.test(value['previewDigest']) || typeof value['proposalDigest'] !== 'string' || !SHA256.test(value['proposalDigest'])
    || typeof value['admissionKey'] !== 'string' || typeof value['admittedAt'] !== 'string') return null;
  return value as unknown as AdmissionManifest;
}

async function manifests(repoRoot: string): Promise<readonly AdmissionManifest[]> {
  const directory = path.join(repoRoot, ...ADMISSION_DIRECTORY.split('/'));
  const names = await readdir(directory).catch((error: NodeJS.ErrnoException) => error.code === 'ENOENT' ? [] : Promise.reject(error));
  const results: AdmissionManifest[] = [];
  for (const name of names.sort()) {
    if (!/^[0-9a-f]{64}\.json$/.test(name)) continue;
    const file = path.join(directory, name);
    const stats = await lstat(file).catch(() => null);
    if (stats === null || !stats.isFile() || stats.isSymbolicLink()) continue;
    try {
      const parsed = parseManifest(JSON.parse(await readFile(file, 'utf8')) as unknown);
      if (parsed !== null) results.push(parsed);
    } catch {
      // A malformed historical record is handled by the backend during preparation.
    }
  }
  return results;
}

function parseDecisionInput(value: unknown, preview: AdmissionPreview): readonly { readonly slotId: string; readonly rationale: string; readonly probeRationales?: readonly ProbeDecisionRationale[] }[] {
  if (!isRecord(value)) fail('invalid_request', 'Admission request must be a JSON object.');
  exactKeys(value, ['previewDigest', 'decisions'], 'Admission request');
  if (value['previewDigest'] !== preview.digest || !Array.isArray(value['decisions'])) fail('stale_preview', 'Admission preview changed. Refresh and review it again.', 409);
  const expected = new Map(preview.decisionSlots.map((slot) => [slot.slotId, slot]));
  const decisions = value['decisions'].map((entry, index) => {
    if (!isRecord(entry)) fail('invalid_request', `Decision ${index + 1} is invalid.`);
    const hasProbes = Object.prototype.hasOwnProperty.call(entry, 'probeRationales');
    exactKeys(entry, hasProbes ? ['slotId', 'rationale', 'probeRationales'] : ['slotId', 'rationale'], `Decision ${index + 1}`);
    if (typeof entry['slotId'] !== 'string' || !expected.has(entry['slotId']) || typeof entry['rationale'] !== 'string' || entry['rationale'].trim().length < 8 || entry['rationale'].length > 2_000) {
      fail('invalid_request', `Decision ${index + 1} is incomplete.`);
    }
    const slot = expected.get(entry['slotId'])!;
    let probeRationales: readonly ProbeDecisionRationale[] | undefined;
    if (slot.kind === 'probe-baseline') {
      if (!Array.isArray(entry['probeRationales'])) fail('invalid_request', 'Every changed probe needs its own rationale.');
      const movements = new Map(preview.probeMovements.map((movement) => [movement.probeId, movement]));
      probeRationales = entry['probeRationales'].map((probe, probeIndex) => {
        if (!isRecord(probe)) fail('invalid_request', `Probe rationale ${probeIndex + 1} is invalid.`);
        exactKeys(probe, ['probeId', 'rationale'], `Probe rationale ${probeIndex + 1}`);
        const movement = typeof probe['probeId'] === 'string' ? movements.get(probe['probeId']) : undefined;
        if (movement === undefined || typeof probe['rationale'] !== 'string' || probe['rationale'].trim().length < 8 || probe['rationale'].length > 2_000) {
          fail('invalid_request', `Probe rationale ${probeIndex + 1} is incomplete.`);
        }
        return { ...movement, rationale: probe['rationale'].trim() };
      });
      if (new Set(probeRationales.map((entry) => entry.probeId)).size !== movements.size || probeRationales.length !== movements.size) {
        fail('invalid_request', 'Every changed probe needs exactly one rationale.');
      }
    } else if (hasProbes) {
      fail('invalid_request', 'Only a probe-baseline decision may include probe rationales.');
    }
    return { slotId: slot.slotId, rationale: entry['rationale'].trim(), ...(probeRationales === undefined ? {} : { probeRationales }) };
  });
  if (decisions.length !== expected.size || new Set(decisions.map((entry) => entry.slotId)).size !== expected.size) {
    fail('missing_decision', 'Every source, fixture, and baseline decision must be independently recorded.');
  }
  return decisions;
}

function parsePublishInput(value: unknown, admissionDigest: string): { readonly push: boolean; readonly openDraftPr: boolean } {
  if (!isRecord(value)) fail('invalid_request', 'Publish request must be a JSON object.');
  exactKeys(value, ['admissionDigest', 'push', 'openDraftPr'], 'Publish request');
  if (value['admissionDigest'] !== admissionDigest || typeof value['push'] !== 'boolean' || typeof value['openDraftPr'] !== 'boolean') {
    fail('invalid_request', 'Publish confirmation does not match the reviewed admission.');
  }
  if (value['openDraftPr'] === true && value['push'] !== true) fail('invalid_request', 'A draft pull request requires an explicit branch push.');
  return { push: value['push'], openDraftPr: value['openDraftPr'] };
}

async function gitMain(repoRoot: string): Promise<string | null> {
  try {
    const result = await execFileAsync('git', ['-C', repoRoot, 'rev-parse', 'origin/main^{commit}'], { windowsHide: true, maxBuffer: 64 * 1024 });
    return COMMIT.test(result.stdout.trim()) ? result.stdout.trim() : null;
  } catch { return null; }
}

function projectPublishResult(result: PublishPreparationResult): {
  readonly status: string;
  readonly branch: string;
  readonly commit: string;
  readonly treeHash: string;
  readonly draftPrUrl: string | null;
  readonly nextActions: readonly string[];
} {
  const nextActions = result.status === 'DRAFT_PR_OPENED' || result.status === 'ALREADY_PREPARED'
    ? ['Review the draft pull request through the normal repository process.']
    : result.status === 'PUSHED'
      ? ['Open a draft pull request when the remote branch evidence is reviewed.']
      : ['Review the isolated local branch before choosing a push.'];
  return { status: result.status, branch: result.branch, commit: result.commit, treeHash: result.treeHash, draftPrUrl: result.draftPrUrl, nextActions };
}

/**
 * Server-side control plane for the final two human-reviewed stages. The
 * browser receives only safe ids and reviewed evidence; it never supplies a
 * command, filesystem location, candidate identity, or mutable source bytes.
 */
export class AdmissionPublishOperations {
  readonly #options: AdmissionPublishOperationsOptions;

  constructor(options: AdmissionPublishOperationsOptions) {
    this.#options = { ...options, repoRoot: path.resolve(options.repoRoot), evidencePath: path.resolve(options.evidencePath) };
  }

  #preview(input: AdmissionPreviewInput): Promise<AdmissionPreview> {
    return (this.#options.operations?.previewAdmission ?? previewAdmission)(input);
  }

  async list(readOnly: boolean): Promise<readonly { readonly reviewId: string; readonly proposalId: string; readonly state: 'READY' | 'ADMITTED' | 'BLOCKED'; readonly blockers: readonly string[] }[]> {
    const registry = await readTrustedRegistry(this.#options.repoRoot, this.#options.evidencePath);
    const existing = await manifests(this.#options.repoRoot);
    return Promise.all(registry.admissions.map(async (entry) => {
      let proposalId = entry.reviewId;
      let proposalDigest: string | null = null;
      let blockers: string[] = [];
      try {
        const proposal = parseProposalManifest(entry.proposal);
        proposalId = proposal.proposalId;
        proposalDigest = proposalManifestDigest(proposal);
      }
      catch { blockers = ['The trusted admission evidence is invalid. Rebuild the candidate evidence bundle.']; }
      const admitted = proposalDigest !== null && existing.some((manifest) => manifest.proposalDigest === proposalDigest);
      return { reviewId: entry.reviewId, proposalId, state: blockers.length > 0 ? 'BLOCKED' : admitted ? 'ADMITTED' : 'READY', blockers };
    }));
  }

  async admission(reviewIdValue: string, readOnly: boolean): Promise<AdmissionView> {
    const entry = await this.#entry(reviewIdValue);
    let proposal: ProposalManifest;
    try { proposal = parseProposalManifest(entry.proposal); }
    catch (error) { return this.#blockedView(entry.reviewId, entry.reviewId, error instanceof Error ? error.message : 'Admission evidence is invalid.', readOnly); }
    let preview: AdmissionPreview;
    try { preview = await this.#preview(this.#previewInput(entry)); }
    catch (error) { return this.#blockedView(entry.reviewId, proposal.proposalId, error instanceof Error ? error.message : 'Admission preview is unavailable.', readOnly); }
    const existing = (await manifests(this.#options.repoRoot)).find((manifest) => manifest.previewDigest === preview.digest);
    return {
      reviewId: entry.reviewId,
      proposalId: proposal.proposalId,
      state: existing === undefined ? 'READY' : 'ADMITTED',
      readOnly,
      blockers: preview.measurableEffect || preview.effectExemption !== null ? [] : ['The approved comparison has no measurable effect; admission is refused.'],
      recovery: existing === undefined
        ? ['If any source, candidate, or main binding moved, rebuild and repeat comparison review.']
        : ['Admission is recorded. Continue through isolated publish preparation.'],
      preview: projectPreview(preview),
      admission: existing === undefined ? null : { digest: existing.digest, admittedAt: existing.admittedAt, manifestId: manifestId(existing) },
    };
  }

  async admit(reviewIdValue: string, value: unknown): Promise<AdmissionView> {
    const signingKey = this.#options.signingKey;
    if (signingKey === undefined || signingKey.length < 32) fail('admission_unavailable', 'Admission signing is not configured on this localhost workbench.', 503);
    const entry = await this.#entry(reviewIdValue);
    const preview = await this.#preview(this.#previewInput(entry));
    const requested = parseDecisionInput(value, preview);
    const decisions = requested.map((decision) => {
      const slot = preview.decisionSlots.find((entry) => entry.slotId === decision.slotId)!;
      return signAdmissionDecision({
        kind: slot.kind,
        subjectDigest: slot.subjectDigest,
        previewDigest: preview.digest,
        reviewer: this.#options.reviewer,
        rationale: decision.rationale,
        decidedAt: (this.#options.now ?? (() => new Date()))().toISOString(),
        ...(decision.probeRationales === undefined ? {} : { probeRationales: decision.probeRationales }),
      }, signingKey);
    });
    await (this.#options.operations?.runAdmission ?? runAdmission)({
      ...this.#previewInput(entry),
      expectedPreviewDigest: preview.digest,
      decisions,
      linkedCaseIds: parseProposalManifest(entry.proposal).caseIds,
      provenance: entry.provenance,
      dependencies: {
        ...(this.#options.controlRun === undefined ? {} : { controlRun: this.#options.controlRun }),
        // §8.4 (a D11 shakedown finding): the detached admission worktree
        // holds only tracked files, so the fixed rebuild/verify commands need
        // the primary root's installed dependencies and fetched sources
        // shared in first (worktreeProvision.ts owns the rationale).
        onPhase: async (phase, context): Promise<void> => {
          if (phase === 'worktree-created' && context.worktree !== undefined) {
            await provisionDetachedWorktree(this.#options.repoRoot, context.worktree);
          }
        },
      },
    });
    return this.admission(entry.reviewId, false);
  }

  async publish(reviewIdValue: string): Promise<PublishView> {
    const entry = await this.#entry(reviewIdValue);
    const proposal = parseProposalManifest(entry.proposal);
    const admission = await this.#admissionManifest(entry, proposal);
    return { reviewId: entry.reviewId, proposalId: proposal.proposalId, admission: admission === null ? null : { digest: admission.digest, admittedAt: admission.admittedAt }, preflight: admission === null ? null : await this.#preflight(entry, proposal, admission) };
  }

  async prepare(reviewIdValue: string, value: unknown): Promise<ReturnType<typeof projectPublishResult>> {
    const signingKey = this.#options.signingKey;
    if (signingKey === undefined || signingKey.length < 32) fail('publish_unavailable', 'Publish preparation signing is not configured on this localhost workbench.', 503);
    const entry = await this.#entry(reviewIdValue);
    const proposal = parseProposalManifest(entry.proposal);
    const admission = await this.#admissionManifest(entry, proposal);
    if (admission === null) fail('admission_required', 'Complete admission before preparing an isolated branch.', 409);
    const choice = parsePublishInput(value, admission.digest);
    const preflight = await this.#preflight(entry, proposal, admission);
    if (!preflight.ready) fail('main_moved', 'main moved after admission. Rebuild, compare, and admit against the new main.', 409);
    const result = await (this.#options.operations?.prepareDraftPublication ?? prepareDraftPublication)({
      repoRoot: this.#options.repoRoot,
      admissionManifestPath: `${ADMISSION_DIRECTORY}/${admission.admissionKey}.json`,
      expectedAdmissionDigest: admission.digest,
      proposal: entry.proposal,
      admissionSigningKey: signingKey,
      evidence: { admissionPreview: await this.#preview(this.#previewInput(entry)), comparisonReport: entry.comparison },
      push: choice.push,
      openDraftPr: choice.openDraftPr,
      dependencies: {
        // Same D11 finding as the admit path: the publish worktree runs the
        // fixed full verification, which needs the shared gitignored inputs.
        onPhase: async (phase, context): Promise<void> => {
          if (phase === 'worktree-created') {
            await provisionDetachedWorktree(this.#options.repoRoot, context.worktree);
          }
        },
      },
    });
    return projectPublishResult(result);
  }

  async #entry(reviewIdValue: string): Promise<AdmissionEvidenceEntry> {
    const reviewId = requireReviewId(reviewIdValue);
    const registry = await readTrustedRegistry(this.#options.repoRoot, this.#options.evidencePath);
    const entry = registry.admissions.find((candidate) => candidate.reviewId === reviewId);
    if (entry === undefined) fail('admission_not_found', 'No trusted admission evidence exists for this candidate.', 404);
    return entry;
  }

  #previewInput(entry: AdmissionEvidenceEntry): AdmissionPreviewInput {
    return {
      repoRoot: this.#options.repoRoot,
      admittedBaseCommit: entry.admittedBaseCommit,
      expectedMainCommit: entry.expectedMainCommit,
      proposal: entry.proposal,
      candidate: entry.candidate,
      comparison: entry.comparison,
      comparisonBinding: entry.comparisonBinding,
      gauntlet: entry.gauntlet,
      reviewedComparisonQueries: entry.reviewedComparisonQueries,
      ...(entry.baseIdentity === undefined ? {} : { baseIdentity: entry.baseIdentity }),
      ...(entry.deferredSigningMarker === undefined ? {} : { deferredSigningMarker: entry.deferredSigningMarker }),
      ...(entry.fixturePromotions === undefined ? {} : { fixturePromotions: entry.fixturePromotions }),
      ...(entry.probeBaseline === undefined ? {} : { probeBaseline: entry.probeBaseline }),
      ...(entry.probeApproval === undefined ? {} : { probeApproval: entry.probeApproval }),
    };
  }

  async #admissionManifest(entry: AdmissionEvidenceEntry, proposal: ProposalManifest): Promise<AdmissionManifest | null> {
    const proposalDigest = proposalManifestDigest(proposal);
    return (await manifests(this.#options.repoRoot)).find((manifest) => (
      manifest.proposalDigest === proposalDigest
      && (entry.candidate === null
        // Fixture-lane admissions have no candidate artifact: the proposal
        // digest is the binding, and the manifest must record the same lane.
        ? manifest.candidate === null
        : manifest.candidate !== null
          && manifest.candidate.cacheKey === entry.candidate.cacheKey
          && manifest.candidate.descriptorSha256 === entry.candidate.descriptorSha256
          && manifest.candidate.databaseSha256 === entry.candidate.databaseSha256)
    )) ?? null;
  }

  async #preflight(entry: AdmissionEvidenceEntry, proposal: ProposalManifest, admission: AdmissionManifest): Promise<PublishPreflightView> {
    const currentMainCommit = await (this.#options.operations?.currentMain ?? gitMain)(this.#options.repoRoot);
    const blockers: string[] = [];
    if (currentMainCommit === null) blockers.push('Remote-tracking main is unavailable. Refresh the trusted remote state before preparation.');
    else if (currentMainCommit !== admission.expectedMainCommit) blockers.push('main moved after admission; this candidate must be rebuilt and reviewed again.');
    if (admission.baseCommit !== admission.expectedMainCommit) blockers.push('Admission base does not match the admitted main binding.');
    return {
      reviewId: entry.reviewId,
      proposalId: proposal.proposalId,
      admissionDigest: admission.digest,
      ready: blockers.length === 0,
      branch: branchFor(proposal, admission.admittedAt),
      expectedMainCommit: admission.expectedMainCommit,
      currentMainCommit,
      blockers,
      recovery: blockers.length === 0
        ? ['Preparation creates an isolated branch and never merges or releases.']
        : ['Refresh main, rebuild the candidate, repeat comparison review, and record a new admission.'],
    };
  }

  #blockedView(reviewId: string, proposalId: string, blocker: string, readOnly: boolean): AdmissionView {
    return {
      reviewId,
      proposalId,
      state: 'BLOCKED',
      readOnly,
      blockers: [blocker],
      recovery: ['Rebuild the trusted candidate evidence bundle and repeat the review.'],
      preview: null,
      admission: null,
    };
  }
}
