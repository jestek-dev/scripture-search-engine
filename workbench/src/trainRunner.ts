/**
 * D8 — the train runner (votes-to-engine plan §05, §8.4).
 *
 * A thin coordinator over the existing machinery: the deriver builds the
 * manifest, the updates store carries the seal, the D10 evidence registry
 * feeds `previewAdmission`, and the EXISTING admit/publish endpoints run the
 * tail (Phase 2's §4.6 bridge — the one-confirm "Approve this update" act
 * posts to `POST /api/v2/admissions/:id/admit`; the typed-digest sign
 * endpoint is Phase 3's D14). Nothing here merges, marks ready, or releases:
 * the ceiling is the draft PR, and the merge on GitHub remains the admission
 * event.
 *
 * States are the closed set `open → sealed → built → measured → ready →
 * admitted → pr-open → live` or `stopped(<reason>)` (V5). Guard trains never
 * enter `built`/`measured` (§5.2). Everything after `sealed` is DERIVED from
 * existing artifacts — the registry entry, the admission manifest, the
 * publish journal, the working tree — never stored; the store holds only the
 * three train events.
 */
import { createHash, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  DEFAULT_ADMISSION_GIT_ADAPTER,
  type AdmissionDependencies,
  type ControlRunEvidence,
} from './admission.js';
import {
  buildUpdatesManifest,
  computeSealDigest,
  deriveTrainFlavor,
  deriveUpdates,
  unmeasuredLayerAffectingOperations,
  UpdatesManifestError,
  type ReplayIdentity,
  type UpdatesDerivation,
  type DeriveUpdatesInputs,
} from './deriveUpdates.js';
import type { AdmissionEvidenceEntry } from './admissionPublishOperations.js';
import { proposalManifestDigest, type ProposalManifest } from './proposals.js';
import { assembleUpdatesInputs, readOriginMainTipFromGit, resolveUpdatesInputPaths, type GoldenMainHistoryReader, type UpdatesInputPaths } from './updatesOperations.js';
import {
  createUpdatesStore,
  TRAIN_STOP_REASONS,
  type TrainSnapshot,
  type TrainStopReason,
  type UpdatesEvent,
  type UpdatesStore,
} from './updatesStore.js';

export class TrainOperationsError extends Error {
  constructor(readonly code: string, message: string, readonly status = 400) {
    super(message);
    this.name = 'TrainOperationsError';
  }
}

function fail(code: string, message: string, status = 400): never {
  throw new TrainOperationsError(code, message, status);
}

const TRAIN_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * §4.6's guard-train Update Report lead — the single-writer COPY block ships
 * this sentence verbatim; no rival rendering may exist (E4/D28).
 */
export const GUARD_REPORT_LEAD =
  'This update only writes lines on the answer sheet — no search result can move, so there is nothing to compare. The checks confirmed every line holds.';

/** The observed train states (V5) — closed set; §5.2: guard trains skip built/measured. */
export const TRAIN_STATES = ['open', 'sealed', 'built', 'measured', 'ready', 'admitted', 'pr-open', 'live', 'stopped'] as const;
export type TrainState = (typeof TRAIN_STATES)[number];

export interface GuardUpdateReport {
  readonly schemaVersion: 1;
  readonly kind: 'guard-update-report';
  readonly trainId: string;
  /** §4.6's verbatim lead sentence. */
  readonly lead: string;
  /** The answer-sheet lines in plain language — one sentence each, no digests. */
  readonly lines: readonly string[];
  /** sha256 over the report body; its first 12 hex become D14's sign code. */
  readonly digest: string;
}

export interface TrainView {
  readonly trainId: string;
  readonly flavor: 'guard' | 'data';
  readonly state: TrainState;
  readonly openedAt: string;
  readonly sealDigest: string | null;
  readonly cardIds: readonly string[];
  readonly stopped: { readonly reason: TrainStopReason; readonly reportDigest?: string; readonly refusedOperationIds?: readonly string[] } | null;
  readonly report: GuardUpdateReport | null;
  readonly draftPrUrl: string | null;
  /**
   * §8.4's measured number: wall-clock milliseconds of this train's WHOLE
   * verified admit leg — the sign act (`decisions[].decidedAt`) to
   * `admittedAt`, read from the admission manifest that recorded both. This
   * is the per-train machine-time quantity §8.4's estimate describes
   * (provisioning + rebuild + verify + release gauntlet + control run) — a
   * MEASURED figure from the run that actually happened, never an estimate
   * and never the gauntlet subprocess alone. Null until the checks completed.
   */
  readonly checksDurationMs: number | null;
}

export interface TrainOperationsOptions {
  readonly repoRoot: string;
  readonly reviewer: string;
  readonly updatesLogPath?: string;
  readonly judgmentsLogPath?: string;
  readonly casesLogPath?: string;
  readonly evidencePath?: string;
  readonly now?: () => Date;
  /** Test seam: the trusted main reader. Defaults to the admission git adapter. */
  readonly readMain?: (repoRoot: string) => Promise<string>;
  /**
   * Test seam: the seal-time `refs/remotes/origin/main` tip (null: the ref
   * does not exist). Recorded beside `admittedBaseCommit` so the §03.6 live
   * window is bounded by BOTH refs main is read through. Defaults to
   * `readOriginMainTipFromGit`.
   */
  readonly readOriginMain?: (repoRoot: string) => Promise<string | null>;
  /**
   * Test seam: main's golden-fixture history for the §03.6 live observation.
   * Defaults to real git history (`readGoldenMainHistoryFromGit`).
   */
  readonly readGoldenMainHistory?: GoldenMainHistoryReader;
}

export interface TrainOperations {
  /**
   * §03.5 step 3 / D8: seal the approved cards into a train. The second
   * argument is the derivation digest the update panel rendered from — the
   * one mutation that digest pins (§4.5); the seal re-derives and refuses
   * 409 `stale_preview` on inequality.
   */
  seal(replayIdentity: ReplayIdentity, derivationDigest: string): Promise<TrainView>;
  /** D8: observed state + the fixture-lane Update Report. */
  train(trainId: string, replayIdentity: ReplayIdentity): Promise<TrainView>;
  /** §03.8: append a stop with its pins. Refuses on a train that cannot stop. */
  recordStop(trainId: string, reason: TrainStopReason, pins?: { readonly reportDigest?: string; readonly refusedOperationIds?: readonly string[] }): Promise<void>;
  /**
   * Maps a failure code from the admit/publish tail onto the closed stop
   * enum and appends the stop when the code maps and the train can stop.
   * Returns the recorded reason, or null when the failure is not a stop
   * (a transient refusal leaves the train sealed and retryable).
   */
  stopFromFailure(trainId: string, code: string): Promise<TrainStopReason | null>;
}

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

/**
 * §06.2's failure-to-stop mapping: only failures that end the attempt become
 * stops from the closed enum; anything unmapped leaves the train sealed so a
 * transient refusal (a lock, a busy mutation) is retryable, never terminal.
 */
export function stopReasonForFailure(code: string): TrainStopReason | null {
  const mapping: Record<string, TrainStopReason> = {
    verify_failed: 'verify-failed',
    // FM-8: a non-inherited red refuses exactly as today and the train stops
    // verify-failed ('required-check-failed' is reserved for GitHub's own
    // required checks on the opened draft PR, which the train reports
    // read-only — §06.2).
    blocking_gauntlet: 'verify-failed',
    blocked_admission: 'verify-failed',
    candidate_expectation_failure: 'protected-expectation-regressed',
    inherited_expectation_failure: 'protected-expectation-regressed',
    unreviewed_comparison: 'unreviewed-top10-movement',
    stale_main: 'main-moved',
    main_moved: 'main-moved',
    source_drift: 'source-drift',
    probe_approval_missing: 'g8-baseline-moved-needs-independent-approval',
    unapproved_path: 'outside-allowlist',
    stale_candidate: 'stale-artifact-identity',
    stale_base: 'stale-artifact-identity',
    gauntlet_identity_mismatch: 'stale-artifact-identity',
    rebuild_identity_mismatch: 'stale-artifact-identity',
    remote_unavailable: 'github-unavailable',
    pr_verification_failed: 'github-unavailable',
  };
  return mapping[code] ?? null;
}

function reportLinesOf(manifest: ProposalManifest): string[] {
  const lines: string[] = [];
  for (const operation of manifest.operations) {
    if (operation.type !== 'golden-fixture-upsert') continue;
    const fixture = operation.fixture as Record<string, unknown>;
    const query = String(fixture.query ?? operation.goldenFixtureId);
    for (const entry of Array.isArray(fixture.expectedTop) ? fixture.expectedTop : []) {
      const row = entry as Record<string, unknown>;
      lines.push(`For "${query}", ${String(row.ref)} should appear in the top ${String(row.withinTop)}.`);
    }
    for (const entry of Array.isArray(fixture.mustNotRank) ? fixture.mustNotRank : []) {
      const row = entry as Record<string, unknown>;
      lines.push(`For "${query}", ${String(row.ref)} must not rank. Why: ${String(row.why)}`);
    }
    for (const entry of Array.isArray(fixture.preferredOrder) ? fixture.preferredOrder : []) {
      const row = entry as Record<string, unknown>;
      lines.push(`For "${query}", ${String(row.above)} should rank above ${String(row.below)} in the top ${String(row.withinTop)}.`);
    }
  }
  return lines;
}

/** §4.6's one-block guard-train Update Report, digest-pinned for D14's sign code. */
export function buildGuardUpdateReport(trainId: string, manifest: ProposalManifest): GuardUpdateReport {
  const body = {
    schemaVersion: 1 as const,
    kind: 'guard-update-report' as const,
    trainId,
    lead: GUARD_REPORT_LEAD,
    lines: reportLinesOf(manifest),
  };
  return { ...body, digest: sha256(canonicalJson(body)) };
}

interface RegistryFile {
  schemaVersion: 1;
  admissions: AdmissionEvidenceEntry[];
}

async function readRegistry(evidencePath: string): Promise<RegistryFile> {
  if (!existsSync(evidencePath)) return { schemaVersion: 1, admissions: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(evidencePath, 'utf8'));
  } catch {
    fail('evidence_registry_invalid', 'The saved update evidence could not be read. Nothing was changed.', 500);
  }
  const record = parsed as { schemaVersion?: unknown; admissions?: unknown };
  if (record.schemaVersion !== 1 || !Array.isArray(record.admissions)) {
    fail('evidence_registry_invalid', 'The saved update evidence could not be read. Nothing was changed.', 500);
  }
  return { schemaVersion: 1, admissions: record.admissions as AdmissionEvidenceEntry[] };
}

export function createTrainOperations(options: TrainOperationsOptions): TrainOperations {
  const paths: UpdatesInputPaths = resolveUpdatesInputPaths(options);
  const store: UpdatesStore = createUpdatesStore({ logPath: paths.updatesLogPath });
  const now = options.now ?? ((): Date => new Date());
  const readMain = options.readMain ?? ((repoRoot: string): Promise<string> => DEFAULT_ADMISSION_GIT_ADAPTER.readMain(repoRoot));
  const readOriginMain = options.readOriginMain ?? readOriginMainTipFromGit;

  async function assemble(replayIdentity: ReplayIdentity): Promise<DeriveUpdatesInputs> {
    return assembleUpdatesInputs(paths, replayIdentity, options.readGoldenMainHistory);
  }

  function derive(inputs: DeriveUpdatesInputs): UpdatesDerivation {
    try {
      return deriveUpdates(inputs);
    } catch (error) {
      fail('updates_underivable', error instanceof Error ? error.message : 'Updates could not be derived from the current logs.', 500);
    }
  }

  async function manifestFromRegistry(trainId: string): Promise<ProposalManifest | null> {
    const registry = await readRegistry(paths.evidencePath).catch(() => null);
    const entry = registry?.admissions.find((candidate) => candidate.reviewId === trainId);
    if (entry === undefined) return null;
    try {
      return entry.proposal as ProposalManifest;
    } catch {
      return null;
    }
  }

  async function admissionManifestFor(proposalDigest: string): Promise<Record<string, unknown> | null> {
    const directory = path.join(paths.repoRoot, 'workbench', 'admissions');
    if (!existsSync(directory)) return null;
    const names = (await readdir(directory)).filter((name) => /^[0-9a-f]{64}\.json$/.test(name));
    for (const name of names) {
      try {
        const parsed = JSON.parse(await readFile(path.join(directory, name), 'utf8')) as Record<string, unknown>;
        if (parsed.proposalDigest === proposalDigest) return parsed;
      } catch {
        // An unreadable manifest proves nothing.
      }
    }
    return null;
  }

  /**
   * §8.4's measured number: the WHOLE verified admit leg's wall time — the
   * sign act (the earliest `decisions[].decidedAt` the manifest records) to
   * `admittedAt`. That is the quantity §8.4's estimate describes ("roughly
   * 15–40 minutes … plus a comparable base-commit control run"): worktree
   * provisioning, the identity-verified rebuild, `npm run verify`, the
   * release gauntlet, and the control run together — never the gauntlet
   * subprocess alone, which under-reports the leg by an order of magnitude
   * (live: a 26m26s admit leg whose gauntlet span was 74s). Both timestamps
   * are machine-recorded in the admission manifest. Never an estimate — null
   * whenever they are absent or do not read as a real interval.
   */
  function checksDurationOf(admissionRecord: Record<string, unknown> | null): number | null {
    if (admissionRecord === null) return null;
    const admitted = typeof admissionRecord.admittedAt === 'string' ? Date.parse(admissionRecord.admittedAt) : Number.NaN;
    const decisions = Array.isArray(admissionRecord.decisions) ? admissionRecord.decisions : [];
    const decided = decisions.map((entry) => {
      const decidedAt = (entry as { decidedAt?: unknown } | null)?.decidedAt;
      return typeof decidedAt === 'string' ? Date.parse(decidedAt) : Number.NaN;
    });
    if (Number.isNaN(admitted) || decided.length === 0 || decided.some(Number.isNaN)) return null;
    const started = Math.min(...decided);
    if (admitted < started) return null;
    return admitted - started;
  }

  async function publishJournal(trainId: string): Promise<{ phase?: string; draftPrUrl?: string | null } | null> {
    const journalPath = path.join(paths.repoRoot, 'workbench', '.state', 'publish-journals', `${trainId}.json`);
    if (!existsSync(journalPath)) return null;
    try {
      return JSON.parse(await readFile(journalPath, 'utf8')) as { phase?: string; draftPrUrl?: string | null };
    } catch {
      return null;
    }
  }

  // Observed liveness (§03.6/§5.2): the deriver's ONE implementation —
  // `derivation.liveTrainIds`, anchored to main's git history so the
  // observation is monotonic (a later same-search merge rewriting the golden
  // file never regresses an earlier merged train). Derived, never stored (V5).
  async function observedState(snapshot: TrainSnapshot, derivation: UpdatesDerivation): Promise<{ state: TrainState; manifest: ProposalManifest | null; draftPrUrl: string | null; checksDurationMs: number | null }> {
    if (snapshot.state === 'open') return { state: 'open', manifest: null, draftPrUrl: null, checksDurationMs: null };
    const manifest = await manifestFromRegistry(snapshot.trainId);
    let proposalDigest: string | null = null;
    if (manifest !== null) {
      try {
        proposalDigest = proposalManifestDigest(manifest);
      } catch {
        proposalDigest = null;
      }
    }
    const admissionRecord = proposalDigest === null ? null : await admissionManifestFor(proposalDigest);
    const checksDurationMs = checksDurationOf(admissionRecord);
    if (snapshot.state === 'stopped') return { state: 'stopped', manifest, draftPrUrl: null, checksDurationMs };
    if (manifest === null || proposalDigest === null) return { state: 'sealed', manifest: null, draftPrUrl: null, checksDurationMs: null };
    if (snapshot.flavor === 'guard' && derivation.liveTrainIds.includes(snapshot.trainId)) {
      const journal = await publishJournal(snapshot.trainId);
      return { state: 'live', manifest, draftPrUrl: journal?.draftPrUrl ?? null, checksDurationMs };
    }
    const journal = await publishJournal(snapshot.trainId);
    if (journal?.phase === 'draft-pr-opened') {
      return { state: 'pr-open', manifest, draftPrUrl: journal.draftPrUrl ?? null, checksDurationMs };
    }
    if (admissionRecord !== null) {
      return { state: 'admitted', manifest, draftPrUrl: null, checksDurationMs };
    }
    // Guard trains never enter built/measured (§5.2): with the registry entry
    // written and the report assembled from it, the sealed train IS ready.
    return { state: snapshot.flavor === 'guard' ? 'ready' : 'sealed', manifest, draftPrUrl: null, checksDurationMs };
  }

  async function view(snapshot: TrainSnapshot, derivation: UpdatesDerivation): Promise<TrainView> {
    const { state, manifest, draftPrUrl, checksDurationMs } = await observedState(snapshot, derivation);
    return {
      trainId: snapshot.trainId,
      flavor: snapshot.flavor,
      state,
      openedAt: snapshot.openedAt,
      sealDigest: snapshot.sealed?.sealDigest ?? null,
      cardIds: snapshot.sealed?.cardIds ?? [],
      stopped: snapshot.stopped === undefined
        ? null
        : {
          reason: snapshot.stopped.reason,
          ...(snapshot.stopped.reportDigest === undefined ? {} : { reportDigest: snapshot.stopped.reportDigest }),
          ...(snapshot.stopped.refusedOperationIds === undefined ? {} : { refusedOperationIds: snapshot.stopped.refusedOperationIds }),
        },
      report: manifest === null || snapshot.flavor !== 'guard' ? null : buildGuardUpdateReport(snapshot.trainId, manifest),
      draftPrUrl,
      checksDurationMs,
    };
  }

  function terminal(state: TrainState): boolean {
    return state === 'stopped' || state === 'live';
  }

  // Seals serialize through one in-process chain (the same discipline as
  // decides) so two clicks cannot both pass the single-flight check.
  let sealChain: Promise<unknown> = Promise.resolve();

  return {
    async seal(replayIdentity: ReplayIdentity, derivationDigest: string): Promise<TrainView> {
      const run = sealChain.then(async () => {
        const inputs = await assemble(replayIdentity);
        const derivation = derive(inputs);

        // §03.5 step 3: the seal carries the derivation digest the update
        // panel rendered from, re-derives from scratch, and refuses on
        // inequality — a panel showing stale state (another tab's decide, a
        // new vote, a moved input file) can never seal a set the reviewer
        // did not read. Checked before the single-flight and registry writes.
        if (typeof derivationDigest !== 'string' || !/^[0-9a-f]{64}$/.test(derivationDigest)) {
          fail('invalid_request', 'The seal must carry the derivation digest the update panel rendered from.', 400);
        }
        if (derivationDigest !== derivation.derivationDigest) {
          fail(
            'stale_preview',
            'The picture changed since this summary was rendered — reload your updates and review the fresh summary. Nothing was sealed.',
            409,
          );
        }

        // Single-flight (V7): at most one non-terminal train, ever.
        for (const snapshot of derivation.trains) {
          const { state } = await observedState(snapshot, derivation);
          if (!terminal(state)) {
            fail('train_running', 'An update is already on its way. One update travels at a time — it finishes or stops before the next one starts.', 409);
          }
        }

        // The minted id must satisfy the admissions surface's REVIEW_ID shape
        // (admissionPublishOperations.ts: /^[a-z0-9][a-z0-9-]{7,79}$/ —
        // minimum 8 characters, so 'train-1' at 7 would 400 the admission
        // routes and 500 the whole registry). Zero-padded to four digits the
        // id is 10 characters, sorts naturally, and keeps the kebab-case
        // shape every train reader accepts.
        const trainId = `train-${String(derivation.trains.length + 1).padStart(4, '0')}`;
        let manifest: ProposalManifest;
        let digest: string;
        let cardIds: readonly string[];
        let judgmentIds: readonly string[];
        try {
          const built = buildUpdatesManifest(derivation, inputs, { trainId });
          manifest = built.manifest;
          digest = built.digest;
          cardIds = built.cardIds;
          judgmentIds = built.judgmentIds;
        } catch (error) {
          if (error instanceof UpdatesManifestError) {
            const code = error.message.startsWith('No approved cards') ? 'nothing_to_seal' : 'seal_refused';
            fail(code, error.message, 409);
          }
          throw error;
        }

        // V4 (§03.5 step 3, the deriver's seal-time validator): a
        // layer-affecting operation with no same-manifest fixture measuring
        // it refuses the seal, naming the unmeasured operations.
        const unmeasured = unmeasuredLayerAffectingOperations(manifest);
        if (unmeasured.length > 0) {
          fail(
            'unmeasured_operations',
            `Every change must travel with the answer-sheet line that measures it. These operations have none: ${unmeasured.map((operation) => operation.operationId).join(', ')}.`,
            409,
          );
        }

        // Phase 2 scope (§8.4): a fingerprint-moving manifest is a data
        // train, and data trains wait for Phase 3's machinery. Derived from
        // operation types (V7) — never chosen by a caller.
        if (deriveTrainFlavor(manifest) === 'data') {
          fail(
            'data_train_waiting',
            'This update would change the data the engine searches, not just the answer sheet. That kind of update waits for the full update machinery — your approvals are saved and will ride it.',
            409,
          );
        }

        const admittedBaseCommit = await readMain(paths.repoRoot).catch(() => {
          fail('repository_unavailable', 'The saved history could not be read. Nothing was changed.', 503);
        });
        // The OTHER half of the base: what origin/main could already serve
        // at seal. A squash merge lands on origin/main first, so during
        // exactly the local-main lag the §03.6 live window must exclude the
        // fetched origin history too — bounded only by the lagging local
        // main, a reversal chain's ancestor-identical content sitting
        // between the two refs would observe a never-merged train live the
        // moment it seals. Null records that the ref does not exist.
        const originTip = await readOriginMain(paths.repoRoot).catch(() => null);
        const admittedOriginBaseCommit = typeof originTip === 'string' && /^[0-9a-f]{40}$/.test(originTip) ? originTip : null;

        const sealDigest = computeSealDigest({
          judgmentIds,
          cardIds,
          operations: manifest.operations,
          replayIdentity,
        });

        // D10: the first-ever writer of the admission evidence registry — a
        // machine-assembled cache of facts derivable from the sealed
        // artifacts, never a decision record. Written BEFORE the seal events
        // so a crash between the two leaves no sealed train without its
        // evidence (a dangling entry with no train is inert).
        const registry = await readRegistry(paths.evidencePath);
        // FM-7 crash recovery: a crash between the registry write below and
        // the seal-event append leaves a DANGLING entry — its trainId has no
        // train-opened event, so nothing derives state from it, but the next
        // seal recomputes the same id and would find it forever. A dangling
        // entry is therefore reclaimed (overwritten); only an entry whose id
        // actually has train events (unreachable for a count-minted id, kept
        // as defense) still refuses.
        const priorEntries = registry.admissions.filter((entry) => entry.reviewId !== trainId);
        if (priorEntries.length !== registry.admissions.length
          && derivation.trains.some((candidate) => candidate.trainId === trainId)) {
          fail('train_running', 'An update with this name already has saved evidence. Reload your updates.', 409);
        }
        const entry: AdmissionEvidenceEntry = {
          reviewId: trainId,
          admittedBaseCommit,
          admittedOriginBaseCommit,
          expectedMainCommit: admittedBaseCommit,
          proposal: manifest,
          candidate: null,
          comparison: null,
          comparisonBinding: null,
          gauntlet: null,
          baseIdentity: replayIdentity,
          reviewedComparisonQueries: [],
          provenance: [
            ...manifest.caseIds.map((caseId) => `case:${caseId}`),
            `train:${trainId}`,
            `seal:${sealDigest}`,
          ].sort(),
        };
        await mkdir(path.dirname(paths.evidencePath), { recursive: true });
        await writeFile(
          paths.evidencePath,
          `${JSON.stringify({ schemaVersion: 1, admissions: [...priorEntries, entry] }, null, 2)}\n`,
          'utf8',
        );

        const at = now().toISOString();
        const events: UpdatesEvent[] = [
          {
            schemaVersion: 1,
            eventId: randomUUID(),
            at,
            reviewer: options.reviewer,
            kind: 'train-opened',
            trainId,
            flavor: 'guard',
          },
          {
            schemaVersion: 1,
            eventId: randomUUID(),
            at,
            reviewer: options.reviewer,
            kind: 'train-sealed',
            trainId,
            sealDigest,
            cardIds: [...cardIds],
            judgmentIds: [...judgmentIds],
            replayIdentity,
          },
        ];
        const fold = await store.append(events);
        const snapshot = fold.trains.find((candidate) => candidate.trainId === trainId)!;
        // The pre-append derivation carries the live observation; the train
        // sealed a moment ago cannot be in it, which is exactly right.
        return view(snapshot, derivation);
      });
      sealChain = run.catch(() => undefined);
      return run;
    },

    async train(trainId: string, replayIdentity: ReplayIdentity): Promise<TrainView> {
      if (!TRAIN_ID.test(trainId)) fail('invalid_route', 'Train identifier is invalid.', 400);
      const inputs = await assemble(replayIdentity);
      const derivation = derive(inputs);
      const snapshot = derivation.trains.find((candidate) => candidate.trainId === trainId);
      if (snapshot === undefined) fail('train_not_found', 'No update with this name exists yet.', 404);
      return view(snapshot, derivation);
    },

    async recordStop(trainId, reason, pins = {}): Promise<void> {
      if (!TRAIN_ID.test(trainId)) fail('invalid_route', 'Train identifier is invalid.', 400);
      if (!(TRAIN_STOP_REASONS as readonly string[]).includes(reason)) {
        fail('invalid_stop_reason', 'Stops come only from the closed reason list.', 400);
      }
      const fold = await store.read();
      const snapshot = fold.trains.find((candidate) => candidate.trainId === trainId);
      if (snapshot === undefined) fail('train_not_found', 'No update with this name exists yet.', 404);
      if (snapshot.state === 'stopped') fail('train_already_stopped', 'This update already stopped.', 409);
      await store.append([{
        schemaVersion: 1,
        eventId: randomUUID(),
        at: now().toISOString(),
        reviewer: options.reviewer,
        kind: 'train-stopped',
        trainId,
        reason,
        ...(pins.reportDigest === undefined ? {} : { reportDigest: pins.reportDigest }),
        ...(pins.refusedOperationIds === undefined || pins.refusedOperationIds.length === 0 ? {} : { refusedOperationIds: pins.refusedOperationIds }),
      }]);
    },

    async stopFromFailure(trainId, code): Promise<TrainStopReason | null> {
      const reason = stopReasonForFailure(code);
      if (reason === null) return null;
      const fold = await store.read();
      const snapshot = fold.trains.find((candidate) => candidate.trainId === trainId);
      if (snapshot === undefined || snapshot.state !== 'sealed') return null;
      await this.recordStop(trainId, reason);
      return reason;
    },
  };
}

/**
 * §5.5 gap 3 (guard half): the base-commit control run the runner performs
 * when a guard train's release verdict is red — the identical fixed release
 * argv in a second detached worktree at the train's base commit with NO
 * operations applied, writing `eval/.runs/<trainId>-control.json`. The
 * returned evidence rides `runAdmission`'s classifier, which re-verifies the
 * report's schema, argv, identity, and freshness before comparing findings.
 */
export function createControlRunExecutor(repoRoot: string): NonNullable<AdmissionDependencies['controlRun']> {
  return async (preview) => {
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const { resolveNpmCliPath } = await import('./jobRunner.js');
    const execFileAsync = promisify(execFile);
    const trainId = preview.proposal.proposalId;
    const reportRelative = `eval/.runs/${trainId}-control.json`;
    const worktree = path.join(os.tmpdir(), `sse-control-${trainId}-${randomUUID()}`);
    const run = async (command: string, args: readonly string[], cwd: string): Promise<void> => {
      await execFileAsync(command, [...args], { cwd, windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
    };
    try {
      await run('git', ['worktree', 'add', '--detach', worktree, preview.admittedBaseCommit], repoRoot);
      // A detached worktree carries only tracked files; the fixed build and
      // gauntlet commands below need the primary root's node_modules and
      // fetched sources (worktreeProvision.ts owns the rationale).
      const { provisionDetachedWorktree } = await import('./worktreeProvision.js');
      await provisionDetachedWorktree(repoRoot, worktree);
      const npmCli = resolveNpmCliPath();
      const databaseRelative = 'workbench/.artifact/content.db';
      await mkdir(path.join(worktree, 'workbench', '.artifact'), { recursive: true });
      await run(process.execPath, [npmCli, 'run', 'build:artifact', '--workspace', 'pipeline', '--', '--out', path.join(worktree, ...databaseRelative.split('/'))], worktree);
      await run(process.execPath, [npmCli, 'run', 'gauntlet', '--workspace', 'eval', '--', '--require-admit', '--json', reportRelative, '--release-database', databaseRelative], worktree)
        .catch(() => undefined); // A red verdict exits non-zero; the report is still written and verified below.
      const reportBytes = await readFile(path.join(worktree, ...reportRelative.split('/')));
      const descriptorBytes = await readFile(path.join(worktree, 'artifacts', 'content-artifact.json'));
      const databaseBytes = await readFile(path.join(worktree, ...databaseRelative.split('/')));
      const descriptor = JSON.parse(descriptorBytes.toString('utf8')) as { engineVersion: string; corpusFingerprint: string; layerFingerprint: string };
      // Keep the control report where §8.4 pins it, in the primary worktree.
      await mkdir(path.join(repoRoot, 'eval', '.runs'), { recursive: true });
      await copyFile(path.join(worktree, ...reportRelative.split('/')), path.join(repoRoot, ...reportRelative.split('/')));
      const evidence: ControlRunEvidence = {
        reportPath: reportRelative,
        reportBytes,
        descriptorSha256: sha256(descriptorBytes),
        databaseSha256: sha256(databaseBytes),
        engineIdentity: {
          engineVersion: descriptor.engineVersion,
          corpusFingerprint: descriptor.corpusFingerprint,
          layerFingerprint: descriptor.layerFingerprint,
        },
      };
      return evidence;
    } finally {
      await execFileAsync('git', ['worktree', 'remove', '--force', worktree], { cwd: repoRoot, windowsHide: true }).catch(() => undefined);
      await rm(worktree, { recursive: true, force: true }).catch(() => undefined);
    }
  };
}
