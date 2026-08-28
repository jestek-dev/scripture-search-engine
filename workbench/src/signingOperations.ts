/**
 * "Sign the baselines" (J39) — the guided workbench flow behind /sign.
 *
 * The flow replaces the terminal walkthrough in
 * docs/governance/probe-baseline-review.md steps 1–4 with a point-and-click
 * page, WITHOUT moving any authority: the machine computes digests and writes
 * files; every word of reviewer prose (name, contact, independence
 * attestation, rationale, review notes) is typed by the human, and nothing
 * here commits, pushes, or merges — Jesse's PR merge stays the final human
 * gate.
 *
 * Discipline, in order of importance:
 *
 *  1. **Same code as the gates.** Every digest is computed by importing
 *     eval's own functions (`canonicalJsonSha256`, `probeListsSha256`,
 *     `renderBaselineReviewPacket`, `reviewPacketSha256`) — never a local
 *     re-implementation that could drift. Before anything is written, the
 *     built approvals are run through eval's OWN validators
 *     (`validateProbeBaselineApproval`, `validateOrderingSnapshotApproval`);
 *     a single finding refuses the write.
 *  2. **No prose is machine-authored.** Empty or whitespace prose fields are
 *     refused, and the review record is the reviewer's text byte-for-byte
 *     (plus a single trailing newline). There are no defaults, samples, or
 *     suggestions anywhere in this module.
 *  3. **Writes are confined.** Exactly three paths are writable — the two
 *     approval files and one docs/reviews/*.md record matching the gates'
 *     own evidence-path pattern — each canonicalized through realpath before
 *     writing so a symlinked parent cannot redirect a write outside the
 *     repository.
 *  4. **Provenance is derived, never hardcoded.** The prior baseline is
 *     found by walking git history for the blob whose canonical-JSON SHA-256
 *     equals the digest the COMMITTED approval binds — so the flow keeps
 *     working on the next signing cycle without a code change.
 */

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { createEngine } from '@jestek-dev/scripture-engine';

import {
  APPROVAL_EVIDENCE_PATH_PATTERN,
  PROBE_BASELINE_APPROVAL_SCHEMA_V2,
  canonicalJsonSha256,
  validateProbeBaselineApproval,
  type Probe,
  type ProbeBaseline,
} from '../../eval/src/gates/probes.js';
import {
  ORDERING_SNAPSHOT_APPROVAL_SCHEMA_V2,
  probeListsSha256 as computeProbeListsSha256,
  validateOrderingSnapshotApproval,
  type OrderingSnapshot,
} from '../../eval/src/gates/orderingSnapshot.js';
import {
  renderBaselineReviewPacket,
  reviewPacketSha256 as computeReviewPacketSha256,
} from '../../eval/src/baselineReviewPacket.js';
import { openCorpus } from './nodeSqlitePort.js';

const execFileAsync = promisify(execFile);

export const PROBES_BASELINE_PATH = 'eval/baselines/probes.json';
export const PROBES_APPROVAL_PATH = 'eval/baselines/probes.approval.json';
export const ORDERING_SNAPSHOT_PATH = 'eval/baselines/ordering.snapshot.json';
export const ORDERING_APPROVAL_PATH = 'eval/baselines/ordering.snapshot.approval.json';
export const PROBE_DEFINITIONS_PATH = 'eval/probes/probes.json';
export const BUDGETS_PATH = 'eval/budgets.json';
/** Scratch home for the extracted prior baseline and the rendered packet — gitignored. */
export const SIGNING_RUNS_DIRECTORY = 'eval/.runs';

export class SigningOperationsError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 422,
  ) {
    super(message);
    this.name = 'SigningOperationsError';
  }
}

function fail(code: string, message: string, status = 422): never {
  throw new SigningOperationsError(code, message, status);
}

export interface SigningIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

/**
 * The reviewer's own words. Every field is REQUIRED non-empty; nothing is
 * defaulted or suggested by the server. `reviewedAt` is the one non-prose
 * field, and the page may default it to today — a date is a fact, not prose.
 */
export interface SigningForm {
  readonly reviewerName: string;
  readonly reviewerContact: string;
  readonly independence: string;
  readonly rationaleProbes: string;
  readonly rationaleOrdering: string;
  readonly reviewNotes: string;
  readonly reviewedAt: string;
}

interface PriorDocument {
  readonly blobSha1: string;
  readonly document: unknown;
}

export interface OrderingDiffProbe {
  readonly id: string;
  readonly changed: boolean;
  readonly beforeTop: readonly string[];
  readonly afterTop: readonly string[];
}

export interface SigningStatus {
  readonly derived: SigningIdentity | null;
  readonly derivationError: string | null;
  readonly baselineIdentity: SigningIdentity | null;
  readonly approvalIdentity: SigningIdentity | null;
  readonly approvalSchemas: { readonly probes: string | null; readonly ordering: string | null };
  readonly verdict: 'current' | 'stale' | 'baselines-behind' | 'unavailable';
  readonly verdictLine: string;
  readonly git: {
    readonly branch: string | null;
    readonly head: string | null;
    readonly dirty: boolean;
    readonly dirtyPaths: readonly string[];
  } | null;
}

export interface ReviewPacketResult {
  readonly packetMarkdown: string;
  readonly packetSha256: string;
  readonly packetPath: string;
  readonly beforePath: string;
  readonly prior: {
    readonly probes: { readonly blobSha1: string; readonly engine: unknown };
    readonly ordering: {
      readonly blobSha1: string;
      readonly probeListsSha256: string;
      readonly engine: unknown;
    };
  };
  readonly orderingDiff: {
    readonly identityBefore: SigningIdentity;
    readonly identityAfter: SigningIdentity;
    readonly probes: readonly OrderingDiffProbe[];
  };
}

export interface SigningPreview {
  readonly files: readonly { readonly path: string; readonly contents: string }[];
  readonly digests: {
    readonly baselineSha256: string;
    readonly probesSha256: string;
    readonly snapshotSha256: string;
    readonly probeListsSha256: string;
    readonly reviewPacketSha256: string;
    readonly evidenceSha256: string;
  };
  readonly confirmDigest: string;
}

export interface SigningWriteResult {
  readonly written: readonly string[];
  readonly evidencePath: string;
  readonly nextSteps: readonly string[];
}

/**
 * The docs-governance patterns (workbench/test/docsGovernanceGuard.test.ts):
 * a review record carrying an absolute local path is evidence the review
 * happened on one specific machine, and the committed guard test would fail
 * the record after the fact — so the same patterns refuse it BEFORE writing,
 * with an error the reviewer can act on.
 */
const ABSOLUTE_LOCAL_PATH_PATTERNS: readonly RegExp[] = [
  /(?:^|[\s("'`[/])[A-Za-z]:[\\/][^\s)"'`\]]+/m,
  /\/(?:home|Users)\/[^\s)"'`\]]+/,
  /\/(?:tmp|var|private)\/[^\s)"'`\]]+/,
  /file:\/\//i,
];

export function absoluteLocalPathFindings(markdown: string): readonly string[] {
  const findings: string[] = [];
  for (const [index, line] of markdown.split('\n').entries()) {
    for (const pattern of ABSOLUTE_LOCAL_PATH_PATTERNS) {
      const match = pattern.exec(line);
      if (match !== null) {
        findings.push(`line ${index + 1}: ${match[0].trim()}`);
        break;
      }
    }
  }
  return findings;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isReviewDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
}

function identityOf(document: unknown): SigningIdentity | null {
  if (!isRecord(document)) return null;
  const { engineVersion, corpusFingerprint, layerFingerprint } = document as Record<string, unknown>;
  if (typeof engineVersion !== 'string' || typeof corpusFingerprint !== 'string' || typeof layerFingerprint !== 'string') return null;
  return { engineVersion, corpusFingerprint, layerFingerprint };
}

function engineOfApproval(approval: unknown): SigningIdentity | null {
  return isRecord(approval) ? identityOf(approval['engine']) : null;
}

function sameIdentity(left: SigningIdentity | null, right: SigningIdentity | null): boolean {
  return left !== null && right !== null &&
    left.engineVersion === right.engineVersion &&
    left.corpusFingerprint === right.corpusFingerprint &&
    left.layerFingerprint === right.layerFingerprint;
}

const TOP_PREVIEW = 5;

function topPreview(results: readonly { readonly targetId: string; readonly score: number }[]): string[] {
  return results.slice(0, TOP_PREVIEW).map((entry) => `${entry.targetId}@${entry.score}`);
}

/** The three prose-field size caps; the HTTP body cap bounds the total. */
const MAX_SHORT_FIELD = 300;
const MAX_LONG_FIELD = 4000;
const MAX_REVIEW_NOTES = 48 * 1024;

function requiredProse(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string') fail('form_invalid', `"${field}" must be a string typed by the reviewer.`, 400);
  if (value.trim().length === 0) {
    fail('form_invalid', `"${field}" is empty. The reviewer must write it — the workbench never fills prose in.`, 400);
  }
  if (value.length > maxLength) {
    fail('form_invalid', `"${field}" is longer than ${maxLength} characters.`, 400);
  }
  return value;
}

export function parseSigningForm(input: unknown): SigningForm {
  if (!isRecord(input)) fail('form_invalid', 'Signing form must be a JSON object.', 400);
  const allowed = new Set([
    'reviewerName', 'reviewerContact', 'independence',
    'rationaleProbes', 'rationaleOrdering', 'reviewNotes', 'reviewedAt',
  ]);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key) && key !== 'confirmDigest') {
      fail('form_invalid', `Signing form contains an unsupported field: ${key}.`, 400);
    }
  }
  const form: SigningForm = {
    reviewerName: requiredProse(input['reviewerName'], 'reviewerName', MAX_SHORT_FIELD).trim(),
    reviewerContact: requiredProse(input['reviewerContact'], 'reviewerContact', MAX_SHORT_FIELD).trim(),
    independence: requiredProse(input['independence'], 'independence', MAX_LONG_FIELD).trim(),
    rationaleProbes: requiredProse(input['rationaleProbes'], 'rationaleProbes', MAX_LONG_FIELD).trim(),
    rationaleOrdering: requiredProse(input['rationaleOrdering'], 'rationaleOrdering', MAX_LONG_FIELD).trim(),
    reviewNotes: requiredProse(input['reviewNotes'], 'reviewNotes', MAX_REVIEW_NOTES),
    reviewedAt: typeof input['reviewedAt'] === 'string' ? input['reviewedAt'] : '',
  };
  if (!isReviewDate(form.reviewedAt)) {
    fail('form_invalid', '"reviewedAt" must be a real YYYY-MM-DD date.', 400);
  }
  const pathFindings = absoluteLocalPathFindings(form.reviewNotes);
  if (pathFindings.length > 0) {
    fail(
      'review_record_machine_local',
      'The review notes contain absolute local paths, which the docs-governance guard rejects ' +
        '(review records must be reproducible, repository-relative evidence). Remove: ' +
        pathFindings.join('; '),
      400,
    );
  }
  return form;
}

/**
 * Resolves one of the three permitted relative paths to a real, contained
 * absolute path — the ONLY paths a signing write may touch. The parent is
 * realpath-canonicalized before the containment check (so symlinked parents
 * refuse, and macOS /var→/private/var or Windows short-name tmpdirs compare
 * equal instead of false-failing), and the target itself must not be a
 * symlink.
 */
export async function guardedRepositoryWriteTarget(repoRoot: string, relativePath: string): Promise<string> {
  const allowed =
    relativePath === PROBES_APPROVAL_PATH ||
    relativePath === ORDERING_APPROVAL_PATH ||
    APPROVAL_EVIDENCE_PATH_PATTERN.test(relativePath);
  if (!allowed) {
    fail('unsafe_path', `Refusing to write outside the two approval files and docs/reviews/: ${relativePath}`, 400);
  }
  const root = await realpath(repoRoot).catch(() =>
    fail('repository_unavailable', 'Workbench repository root cannot be resolved.', 503));
  const target = path.resolve(root, ...relativePath.split('/'));
  const parent = path.dirname(target);
  if (relativePath.startsWith('docs/reviews/')) {
    await mkdir(path.join(root, 'docs', 'reviews'), { recursive: true });
  }
  const realParent = await realpath(parent).catch(() =>
    fail('unsafe_path', `Parent directory of ${relativePath} cannot be resolved.`, 409));
  const contained = path.relative(root, realParent);
  if (contained.split(path.sep).includes('..') || path.isAbsolute(contained)) {
    fail('unsafe_path', `Refusing to write through a parent that escapes the repository: ${relativePath}`, 400);
  }
  const finalTarget = path.join(realParent, path.basename(target));
  const existing = await lstat(finalTarget).catch(() => null);
  if (existing !== null && existing.isSymbolicLink()) {
    fail('unsafe_path', `Refusing to write through a symlink: ${relativePath}`, 400);
  }
  return finalTarget;
}

export interface SigningOperationsOptions {
  readonly repoRoot: string;
  /** Test seam: replaces the fixture-database identity derivation. */
  readonly deriveIdentity?: () => Promise<SigningIdentity>;
}

export class SigningOperations {
  private readonly repoRoot: string;
  private readonly deriveIdentityOverride: (() => Promise<SigningIdentity>) | undefined;
  private derivedIdentity: Promise<SigningIdentity> | null = null;

  constructor(options: SigningOperationsOptions) {
    this.repoRoot = path.resolve(options.repoRoot);
    this.deriveIdentityOverride = options.deriveIdentity;
  }

  private async git(args: readonly string[]): Promise<string> {
    const { stdout } = await execFileAsync('git', [...args], {
      cwd: this.repoRoot,
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
    });
    return stdout.replace(/\r?\n$/, '');
  }

  private repoPath(relativePath: string): string {
    return path.join(this.repoRoot, ...relativePath.split('/'));
  }

  private async readRepoJson(relativePath: string): Promise<unknown> {
    let raw: string;
    try {
      raw = await readFile(this.repoPath(relativePath), 'utf8');
    } catch {
      fail('file_unavailable', `${relativePath} is missing or unreadable in this checkout.`, 409);
    }
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      fail('file_unavailable', `${relativePath} is not valid JSON.`, 409);
    }
  }

  /**
   * The identity the gauntlet observes: build the fixture database exactly as
   * `runProbeGates` does, open the engine over it, and read the triple. The
   * result is cached for the process — the identity moves only when code or
   * data change, which requires a restart to pick up anyway.
   */
  async deriveIdentity(): Promise<SigningIdentity> {
    if (this.derivedIdentity === null) {
      const derive = this.deriveIdentityOverride ?? (async (): Promise<SigningIdentity> => {
        const directory = await mkdtemp(path.join(os.tmpdir(), 'sse-signing-'));
        try {
          const { buildFixtureDatabase } = await import('../../pipeline/src/buildFixtureDb.js');
          const databasePath = buildFixtureDatabase(path.join(directory, `fixture-${process.pid}.db`)).path;
          const engine = await createEngine(openCorpus(databasePath));
          try {
            return {
              engineVersion: engine.engineVersion,
              corpusFingerprint: engine.corpusFingerprint,
              layerFingerprint: engine.layerFingerprint,
            };
          } finally {
            await engine.close();
          }
        } finally {
          await rm(directory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
        }
      });
      this.derivedIdentity = derive().catch((error: unknown) => {
        this.derivedIdentity = null;
        throw error;
      });
    }
    return this.derivedIdentity;
  }

  async status(): Promise<SigningStatus> {
    let derived: SigningIdentity | null = null;
    let derivationError: string | null = null;
    try {
      derived = await this.deriveIdentity();
    } catch (error) {
      derivationError = `Could not derive the current identity from the fixture build: ${
        error instanceof Error ? error.message : 'unknown error'}`;
    }

    let baseline: unknown = null;
    let snapshot: unknown = null;
    let probesApproval: unknown = null;
    let orderingApproval: unknown = null;
    try { baseline = await this.readRepoJson(PROBES_BASELINE_PATH); } catch { /* reported below */ }
    try { snapshot = await this.readRepoJson(ORDERING_SNAPSHOT_PATH); } catch { /* reported below */ }
    try { probesApproval = await this.readRepoJson(PROBES_APPROVAL_PATH); } catch { /* reported below */ }
    try { orderingApproval = await this.readRepoJson(ORDERING_APPROVAL_PATH); } catch { /* reported below */ }

    const baselineIdentity = identityOf(baseline);
    const snapshotIdentity = identityOf(snapshot);
    const probesApprovalEngine = engineOfApproval(probesApproval);
    const orderingApprovalEngine = engineOfApproval(orderingApproval);

    let git: SigningStatus['git'] = null;
    try {
      const [branch, head, porcelain] = await Promise.all([
        this.git(['branch', '--show-current']),
        this.git(['rev-parse', '--short', 'HEAD']),
        this.git(['status', '--porcelain=v1']),
      ]);
      const dirtyPaths = porcelain === '' ? [] : porcelain.split('\n').map((line) => line.slice(3));
      git = { branch: branch === '' ? null : branch, head, dirty: dirtyPaths.length > 0, dirtyPaths };
    } catch {
      git = null;
    }

    const probesBound = isRecord(probesApproval) && baseline !== null &&
      probesApproval['baselineSha256'] === canonicalJsonSha256(baseline) &&
      sameIdentity(probesApprovalEngine, baselineIdentity);
    const orderingBound = isRecord(orderingApproval) && snapshot !== null &&
      orderingApproval['snapshotSha256'] === canonicalJsonSha256(snapshot) &&
      sameIdentity(orderingApprovalEngine, snapshotIdentity);

    let verdict: SigningStatus['verdict'];
    let verdictLine: string;
    if (baselineIdentity === null || snapshotIdentity === null || probesApproval === null || orderingApproval === null) {
      verdict = 'unavailable';
      verdictLine = 'The committed baselines or approvals could not be read; fix the checkout before signing.';
    } else if (!sameIdentity(baselineIdentity, snapshotIdentity)) {
      verdict = 'unavailable';
      verdictLine = 'The committed probe baseline and ordering snapshot disagree about the engine identity; regenerate both before signing.';
    } else if (derived !== null && !sameIdentity(baselineIdentity, derived)) {
      verdict = 'baselines-behind';
      verdictLine =
        `The committed baselines describe engine ${baselineIdentity.engineVersion} but this checkout is ` +
        `${derived.engineVersion} — regenerate them first ` +
        '(npm run gauntlet -- --update-baseline --update-ordering-snapshot), then sign.';
    } else if (probesBound && orderingBound) {
      verdict = 'current';
      verdictLine = `Approvals are current — they already bind engine ${baselineIdentity.engineVersion}. There is nothing to sign.`;
    } else {
      verdict = 'stale';
      const bound = probesApprovalEngine?.engineVersion ?? orderingApprovalEngine?.engineVersion ?? 'an unknown version';
      verdictLine = `Approvals are stale — they bind engine ${bound}; signing will bind ${baselineIdentity.engineVersion}.`;
    }

    return {
      derived,
      derivationError,
      baselineIdentity,
      approvalIdentity: probesApprovalEngine,
      approvalSchemas: {
        probes: isRecord(probesApproval) && typeof probesApproval['schema'] === 'string' ? probesApproval['schema'] : null,
        ordering: isRecord(orderingApproval) && typeof orderingApproval['schema'] === 'string' ? orderingApproval['schema'] : null,
      },
      verdict,
      verdictLine,
      git,
    };
  }

  /**
   * Finds the historical blob of `relativePath` whose PARSED canonical-JSON
   * SHA-256 equals `wantCanonicalSha256` — the digest the committed approval
   * binds. Derived from git every time; commit shas are never hardcoded, so
   * the flow survives the next signing cycle unchanged.
   */
  private async findPriorByCanonicalSha(
    relativePath: string,
    wantCanonicalSha256: string,
  ): Promise<PriorDocument> {
    let commits: string[];
    try {
      const log = await this.git(['log', '--format=%H', '--', relativePath]);
      commits = log === '' ? [] : log.split('\n');
    } catch {
      fail('git_unavailable', 'git history is unavailable in this checkout, so the prior baseline cannot be derived.', 409);
    }
    const seenBlobs = new Set<string>();
    for (const commit of commits) {
      let blobSha1: string;
      try {
        blobSha1 = await this.git(['rev-parse', `${commit}:${relativePath}`]);
      } catch {
        continue;
      }
      if (seenBlobs.has(blobSha1)) continue;
      seenBlobs.add(blobSha1);
      let document: unknown;
      try {
        document = JSON.parse(await this.git(['cat-file', 'blob', blobSha1])) as unknown;
      } catch {
        continue;
      }
      if (canonicalJsonSha256(document) === wantCanonicalSha256) {
        return { blobSha1, document };
      }
    }
    fail(
      'prior_not_found',
      `No historical version of ${relativePath} matches the digest the committed approval binds ` +
        `(${wantCanonicalSha256.slice(0, 12)}…). The approval's provenance cannot be chained mechanically — stop and ask Claude.`,
      409,
    );
  }

  private async loadSigningInputs(): Promise<{
    readonly baseline: ProbeBaseline;
    readonly snapshot: OrderingSnapshot;
    readonly probeFile: { readonly probes: readonly Probe[] };
    readonly noise: { readonly maxTop10ChurnRatio: number; readonly maxWeakReasonShareIncrease: number };
    readonly committedProbesApproval: Record<string, unknown>;
    readonly committedOrderingApproval: Record<string, unknown>;
  }> {
    const baseline = await this.readRepoJson(PROBES_BASELINE_PATH) as ProbeBaseline;
    const snapshot = await this.readRepoJson(ORDERING_SNAPSHOT_PATH) as OrderingSnapshot;
    const probeFile = await this.readRepoJson(PROBE_DEFINITIONS_PATH) as { probes: Probe[] };
    const budgets = await this.readRepoJson(BUDGETS_PATH) as {
      noise?: { maxTop10ChurnRatio?: number; maxWeakReasonShareIncrease?: number };
    };
    if (typeof budgets.noise?.maxTop10ChurnRatio !== 'number' || typeof budgets.noise.maxWeakReasonShareIncrease !== 'number') {
      fail('file_unavailable', `${BUDGETS_PATH} carries no reviewed noise budgets.`, 409);
    }
    const committedProbesApproval = await this.readRepoJson(PROBES_APPROVAL_PATH);
    const committedOrderingApproval = await this.readRepoJson(ORDERING_APPROVAL_PATH);
    if (!isRecord(committedProbesApproval) || typeof committedProbesApproval['baselineSha256'] !== 'string') {
      fail('file_unavailable', `${PROBES_APPROVAL_PATH} does not bind a baseline digest.`, 409);
    }
    if (!isRecord(committedOrderingApproval) ||
        typeof committedOrderingApproval['snapshotSha256'] !== 'string' ||
        typeof committedOrderingApproval['probeListsSha256'] !== 'string') {
      fail('file_unavailable', `${ORDERING_APPROVAL_PATH} does not bind snapshot digests.`, 409);
    }
    return {
      baseline,
      snapshot,
      probeFile,
      noise: {
        maxTop10ChurnRatio: budgets.noise.maxTop10ChurnRatio,
        maxWeakReasonShareIncrease: budgets.noise.maxWeakReasonShareIncrease,
      },
      committedProbesApproval,
      committedOrderingApproval,
    };
  }

  private async refuseUnlessSignable(): Promise<void> {
    const status = await this.status();
    if (status.verdict === 'current') {
      fail('approvals_current', status.verdictLine, 409);
    }
    if (status.verdict !== 'stale') {
      fail('not_signable', status.verdictLine, 409);
    }
  }

  /**
   * Generates the review packet with the SAME renderer the review-packet
   * script runs (`eval/src/baselineReviewPacket.ts`), the `--before` input
   * extracted from git via the committed approval's own digest binding. The
   * extracted prior and the rendered packet land in the gitignored
   * eval/.runs/ so the record's quoted paths stay repository-relative.
   */
  async reviewPacket(): Promise<ReviewPacketResult> {
    await this.refuseUnlessSignable();
    const inputs = await this.loadSigningInputs();
    const priorProbes = await this.findPriorByCanonicalSha(
      PROBES_BASELINE_PATH,
      inputs.committedProbesApproval['baselineSha256'] as string,
    );
    const priorOrdering = await this.findPriorByCanonicalSha(
      ORDERING_SNAPSHOT_PATH,
      inputs.committedOrderingApproval['snapshotSha256'] as string,
    );
    const priorSnapshot = priorOrdering.document as OrderingSnapshot;
    const priorLists = computeProbeListsSha256(priorSnapshot.probes);
    if (priorLists !== inputs.committedOrderingApproval['probeListsSha256']) {
      fail(
        'prior_not_found',
        'The derived prior ordering snapshot does not reproduce the probe-lists digest the committed approval binds — stop and ask Claude.',
        409,
      );
    }

    const packet = renderBaselineReviewPacket({
      before: priorProbes.document as ProbeBaseline,
      after: inputs.baseline,
      probeFile: inputs.probeFile,
      noise: inputs.noise,
    });
    const packetSha256 = computeReviewPacketSha256(packet);

    const runsDirectory = this.repoPath(SIGNING_RUNS_DIRECTORY);
    await mkdir(runsDirectory, { recursive: true });
    const beforePath = `${SIGNING_RUNS_DIRECTORY}/signing-before-probes.json`;
    const packetPath = `${SIGNING_RUNS_DIRECTORY}/signing-review-packet.md`;
    await writeFile(this.repoPath(beforePath), `${JSON.stringify(priorProbes.document, null, 2)}\n`, 'utf8');
    await writeFile(this.repoPath(packetPath), `${packet}\n`, 'utf8');

    const before = new Map(priorSnapshot.probes.map((probe) => [probe.id, probe.results]));
    const after = new Map(inputs.snapshot.probes.map((probe) => [probe.id, probe.results]));
    const orderingProbes: OrderingDiffProbe[] = [...new Set([...before.keys(), ...after.keys()])]
      .sort()
      .map((id) => {
        const previous = before.get(id) ?? [];
        const current = after.get(id) ?? [];
        return {
          id,
          changed: JSON.stringify(previous) !== JSON.stringify(current),
          beforeTop: topPreview(previous),
          afterTop: topPreview(current),
        };
      });

    return {
      packetMarkdown: packet,
      packetSha256,
      packetPath,
      beforePath,
      prior: {
        probes: { blobSha1: priorProbes.blobSha1, engine: (inputs.committedProbesApproval['engine'] ?? null) },
        ordering: {
          blobSha1: priorOrdering.blobSha1,
          probeListsSha256: priorLists,
          engine: (inputs.committedOrderingApproval['engine'] ?? null),
        },
      },
      orderingDiff: {
        identityBefore: identityOf(priorSnapshot) ?? fail('prior_not_found', 'Prior ordering snapshot carries no identity.', 409),
        identityAfter: identityOf(inputs.snapshot) ?? fail('file_unavailable', 'Committed ordering snapshot carries no identity.', 409),
        probes: orderingProbes,
      },
    };
  }

  /**
   * Builds the exact bytes a write would produce — review record and both v2
   * approvals — and validates the approvals with eval's own gate validators
   * before showing them. The returned confirmDigest must accompany the write.
   */
  async preview(form: SigningForm): Promise<SigningPreview> {
    await this.refuseUnlessSignable();
    const inputs = await this.loadSigningInputs();
    const derived = await this.deriveIdentity().catch((error: unknown) => {
      fail('identity_unavailable', `Could not derive the identity to sign: ${
        error instanceof Error ? error.message : 'unknown error'}`, 409);
    });
    const baselineIdentity = identityOf(inputs.baseline);
    if (!sameIdentity(baselineIdentity, derived)) {
      fail('not_signable', 'The committed baselines do not describe this checkout\'s identity; regenerate them before signing.', 409);
    }

    const priorProbes = await this.findPriorByCanonicalSha(
      PROBES_BASELINE_PATH,
      inputs.committedProbesApproval['baselineSha256'] as string,
    );
    const priorOrdering = await this.findPriorByCanonicalSha(
      ORDERING_SNAPSHOT_PATH,
      inputs.committedOrderingApproval['snapshotSha256'] as string,
    );
    const priorProbesEngine = engineOfApproval(inputs.committedProbesApproval);
    const priorOrderingEngine = engineOfApproval(inputs.committedOrderingApproval);
    if (priorProbesEngine === null || priorOrderingEngine === null) {
      fail('prior_not_found', 'The committed approvals carry no engine identity to chain priorProvenance from.', 409);
    }

    const packet = renderBaselineReviewPacket({
      before: priorProbes.document as ProbeBaseline,
      after: inputs.baseline,
      probeFile: inputs.probeFile,
      noise: inputs.noise,
    });
    const packetSha256 = computeReviewPacketSha256(packet);

    const evidencePath = `docs/reviews/${form.reviewedAt}-j39-baseline-signing.md`;
    if (!APPROVAL_EVIDENCE_PATH_PATTERN.test(evidencePath)) {
      fail('form_invalid', `Review record path ${evidencePath} does not match the gates' evidence-path pattern.`, 400);
    }
    // The record is the reviewer's text byte-for-byte, plus one trailing
    // newline; the workbench adds nothing else to it.
    const recordContents = form.reviewNotes.endsWith('\n') ? form.reviewNotes : `${form.reviewNotes}\n`;
    const evidenceSha256 = createHash('sha256').update(recordContents, 'utf8').digest('hex');

    const engine = {
      engineVersion: inputs.baseline.engineVersion,
      corpusFingerprint: inputs.baseline.corpusFingerprint,
      layerFingerprint: inputs.baseline.layerFingerprint,
    };
    const baselineSha256 = canonicalJsonSha256(inputs.baseline);
    const probesSha256 = canonicalJsonSha256(inputs.probeFile);
    const snapshotSha256 = canonicalJsonSha256(inputs.snapshot);
    const listsSha256 = computeProbeListsSha256(inputs.snapshot.probes);

    const probesApproval = {
      schema: PROBE_BASELINE_APPROVAL_SCHEMA_V2,
      baselineSha256,
      probesSha256,
      engine,
      reviewerName: form.reviewerName,
      reviewerContact: form.reviewerContact,
      independence: form.independence,
      evidence: { path: evidencePath, sha256: evidenceSha256 },
      reviewPacketSha256: packetSha256,
      reviewedAt: form.reviewedAt,
      rationale: form.rationaleProbes,
      priorProvenance: {
        baselineGitBlobSha1: priorProbes.blobSha1,
        engine: priorProbesEngine,
      },
    };
    // The ordering-snapshot v2 schema is exact-keys and binds NO
    // reviewPacketSha256 (no packet renders ordering movement; the record is
    // the rendered evidence) — eval's validator below proves the shape.
    const orderingApproval = {
      schema: ORDERING_SNAPSHOT_APPROVAL_SCHEMA_V2,
      snapshotSha256,
      probeListsSha256: listsSha256,
      engine,
      reviewerName: form.reviewerName,
      reviewerContact: form.reviewerContact,
      independence: form.independence,
      evidence: { path: evidencePath, sha256: evidenceSha256 },
      reviewedAt: form.reviewedAt,
      rationale: form.rationaleOrdering,
      priorProvenance: {
        snapshotGitBlobSha1: priorOrdering.blobSha1,
        probeListsSha256: inputs.committedOrderingApproval['probeListsSha256'] as string,
        engine: priorOrderingEngine,
      },
    };

    // Self-check with the gates' OWN validators: a document these find fault
    // with must never be written, let alone committed.
    const probeFindings = validateProbeBaselineApproval({
      baseline: inputs.baseline,
      approval: probesApproval,
      baselineSha256,
      probesSha256,
      engine,
      evidenceSha256,
    });
    const orderingFindings = validateOrderingSnapshotApproval({
      snapshot: inputs.snapshot,
      approval: orderingApproval,
      snapshotSha256,
      probeListsSha256: listsSha256,
      engine,
      evidenceSha256,
    });
    const findings = [...probeFindings, ...orderingFindings];
    if (findings.length > 0) {
      fail(
        'approval_invalid',
        `The built approvals fail the gauntlet's own validators; nothing was written. ${
          findings.map((finding) => finding.message).join(' ')}`,
        422,
      );
    }

    const files = [
      { path: evidencePath, contents: recordContents },
      { path: PROBES_APPROVAL_PATH, contents: `${JSON.stringify(probesApproval, null, 2)}\n` },
      { path: ORDERING_APPROVAL_PATH, contents: `${JSON.stringify(orderingApproval, null, 2)}\n` },
    ];
    return {
      files,
      digests: {
        baselineSha256,
        probesSha256,
        snapshotSha256,
        probeListsSha256: listsSha256,
        reviewPacketSha256: packetSha256,
        evidenceSha256,
      },
      confirmDigest: canonicalJsonSha256(files),
    };
  }

  /**
   * Recomputes the preview, requires the caller's confirmDigest to match it
   * exactly (the repository moved otherwise), and only then writes the three
   * files. Never commits; the returned next steps are for the human.
   */
  async write(form: SigningForm, confirmDigest: string): Promise<SigningWriteResult> {
    if (typeof confirmDigest !== 'string' || !/^[0-9a-f]{64}$/.test(confirmDigest)) {
      fail('form_invalid', 'A write needs the confirmDigest from the preview it is confirming.', 400);
    }
    const preview = await this.preview(form);
    if (preview.confirmDigest !== confirmDigest) {
      fail('stale_preview', 'The repository changed since this preview was made. Re-preview and read the new diff before confirming.', 409);
    }
    const targets: { readonly absolute: string; readonly file: SigningPreview['files'][number] }[] = [];
    for (const file of preview.files) {
      targets.push({ absolute: await guardedRepositoryWriteTarget(this.repoRoot, file.path), file });
    }
    for (const { absolute, file } of targets) {
      await writeFile(absolute, file.contents, 'utf8');
    }
    const evidencePath = preview.files[0]!.path;
    return {
      written: preview.files.map((file) => file.path),
      evidencePath,
      nextSteps: [
        'git checkout -b sign-baselines',
        `git add ${evidencePath} ${PROBES_APPROVAL_PATH} ${ORDERING_APPROVAL_PATH}`,
        'git commit -m "Sign the probe baseline and ordering snapshot (J39)"',
        'git push -u origin sign-baselines',
      ],
    };
  }
}
