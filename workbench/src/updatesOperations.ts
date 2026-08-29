/**
 * D6 — the Updates endpoints' I/O half (plan §03.5, §04 §4.4).
 *
 * The deriver (`deriveUpdates.ts`) is pure; this module is the one seam
 * that assembles its observed snapshot from disk and appends human decide
 * events to `workbench/updates.jsonl` through the fail-closed store.
 *
 * Two operations, matching the two phases §03.5 gives Phase 1:
 *  - derive: read-only, repeatable — mutates nothing (step 1);
 *  - decide: validates the per-card pin (`cardRevision`, never the global
 *    derivation digest) and appends exactly the human's decision (step 2).
 *    A decide on another card never invalidates a pending decide.
 *
 * The seal (step 3, `POST /api/v2/updates/train`) is Phase 2's.
 */
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import {
  deriveUpdates,
  fixtureContentDigest,
  THEME_ANSWER_NONE,
  type DeriveSourceFile,
  type DeriveUpdatesInputs,
  type MainGoldenHistoryEntry,
  type PriorTrainArtifacts,
  type ReplayIdentity,
  type UpdateCard,
  type UpdatesDerivation,
} from './deriveUpdates.js';
import { createUpdatesStore, parseUpdatesLog, type UpdatesEvent, type UpdatesStore } from './updatesStore.js';

export class UpdatesOperationsError extends Error {
  constructor(readonly code: string, message: string, readonly status = 400) {
    super(message);
    this.name = 'UpdatesOperationsError';
  }
}

export interface UpdatesOperationsOptions {
  readonly repoRoot: string;
  readonly reviewer: string;
  /** Override for tests; defaults to `<repoRoot>/workbench/updates.jsonl`. */
  readonly updatesLogPath?: string;
  /** Override for tests; defaults to `<repoRoot>/workbench/judgments.jsonl`. */
  readonly judgmentsLogPath?: string;
  /** Override for tests; defaults to `<repoRoot>/workbench/cases.jsonl`. */
  readonly casesLogPath?: string;
  /**
   * The admission evidence registry (D10) — where a sealed train's manifest is
   * located for the §03.2 join. Defaults to
   * `<repoRoot>/workbench/review-data/admission-evidence.json`.
   */
  readonly evidencePath?: string;
  readonly now?: () => Date;
  /**
   * Test seam: main's golden-fixture history for the §03.6 live observation.
   * Defaults to `readGoldenMainHistoryFromGit` (real git history).
   */
  readonly readGoldenMainHistory?: GoldenMainHistoryReader;
}

export type DecideDecision = 'approve' | 'decline' | 'park';

export interface DecideRequest {
  readonly decision: DecideDecision;
  readonly cardRevision: string;
  readonly answers?: Readonly<Record<string, string>>;
  readonly reason?: string;
}

export interface UpdatesOperations {
  /** §03.5 step 1: derive fresh from the current observed inputs. Read-only. */
  derive(replayIdentity: ReplayIdentity): Promise<UpdatesDerivation>;
  /** §03.5 step 2: validate the per-card pin, append, return the fresh card. */
  decide(cardId: string, input: unknown, replayIdentity: ReplayIdentity): Promise<UpdateCard>;
}

const SHA256_HEX = /^[0-9a-f]{64}$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseDecideRequest(input: unknown): DecideRequest {
  if (!isPlainObject(input)) {
    throw new UpdatesOperationsError('invalid_decision', 'Decide body must be a JSON object.');
  }
  const allowed = new Set(['decision', 'cardRevision', 'answers', 'reason']);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) {
      throw new UpdatesOperationsError('invalid_decision', `Decide body has unknown field "${key}".`);
    }
  }
  const { decision, cardRevision, answers, reason } = input;
  if (decision !== 'approve' && decision !== 'decline' && decision !== 'park') {
    throw new UpdatesOperationsError('invalid_decision', 'decision must be "approve", "decline", or "park".');
  }
  if (typeof cardRevision !== 'string' || !SHA256_HEX.test(cardRevision)) {
    throw new UpdatesOperationsError('invalid_decision', 'cardRevision must be the 64-hex pin the card was read with.');
  }
  if (answers !== undefined) {
    if (!isPlainObject(answers) || Object.values(answers).some((value) => typeof value !== 'string')) {
      throw new UpdatesOperationsError('invalid_decision', 'answers must map question ids to string answers.');
    }
  }
  if (reason !== undefined && typeof reason !== 'string') {
    throw new UpdatesOperationsError('invalid_decision', 'reason must be a string.');
  }
  return { decision, cardRevision, ...(answers === undefined ? {} : { answers: answers as Record<string, string> }), ...(reason === undefined ? {} : { reason }) };
}

/**
 * Kind- and question-aware validation of one decision against the card it
 * pins, before anything is appended. Everything here restates a rule the
 * plan states elsewhere: decline records a one-line reason (V5); a question
 * must be answered by the human before Approve (V3 — the machine never picks
 * a concept); a conflict is resolved by a superseding vote in Review, so the
 * card itself only accepts Not now (§02.7); the V6 identity-drift
 * re-confirmation card keeps its two-button form (§4.3 example 3 — "Look
 * again" is a pure hand-off that posts nothing), so Not now is the only
 * decide it accepts — only §07.2's day-one legacy card carries Approve (the
 * fresh-look hand-off) and Decline.
 */
function validateDecisionAgainstCard(card: UpdateCard, request: DecideRequest): void {
  if (request.decision === 'decline') {
    const reason = (request.reason ?? '').trim();
    if (reason === '' || reason.includes('\n')) {
      throw new UpdatesOperationsError('decline_reason_required', 'Declining records a one-line reason. Add a short why.');
    }
  }
  if (card.conflict !== undefined && request.decision !== 'park') {
    throw new UpdatesOperationsError(
      'conflict_requires_vote',
      'A conflict is resolved by a superseding call in Review, or set aside with Not now — never approved or declined here.',
      409,
    );
  }
  if (card.kind === 're-confirmation' && card.legacy === undefined && request.decision !== 'park') {
    throw new UpdatesOperationsError(
      'reconfirmation_requires_fresh_look',
      'A changed situation is resolved by a fresh look in Review, or set aside with Not now — never approved or declined here.',
      409,
    );
  }
  if (request.decision === 'approve' && card.question !== undefined) {
    const answer = request.answers?.[card.question.id];
    if (answer === undefined || answer.trim() === '') {
      throw new UpdatesOperationsError('answer_required', 'This card asks a question. Answer it before approving.');
    }
    const valid = answer === THEME_ANSWER_NONE || card.question.chips.some((chip) => chip.conceptId === answer);
    if (!valid) {
      throw new UpdatesOperationsError('answer_required', 'The answer must be one of the offered options.');
    }
  }
  if (request.decision !== 'approve' && request.answers !== undefined) {
    throw new UpdatesOperationsError('invalid_decision', 'answers ride only on an approval.');
  }
}

/** The resolved file locations one derive snapshot reads (shared with D8's train runner). */
export interface UpdatesInputPaths {
  readonly repoRoot: string;
  readonly updatesLogPath: string;
  readonly judgmentsLogPath: string;
  readonly casesLogPath: string;
  readonly evidencePath: string;
}

export function resolveUpdatesInputPaths(options: {
  readonly repoRoot: string;
  readonly updatesLogPath?: string;
  readonly judgmentsLogPath?: string;
  readonly casesLogPath?: string;
  readonly evidencePath?: string;
}): UpdatesInputPaths {
  const repoRoot = options.repoRoot;
  return {
    repoRoot,
    updatesLogPath: options.updatesLogPath ?? path.join(repoRoot, 'workbench', 'updates.jsonl'),
    judgmentsLogPath: options.judgmentsLogPath ?? path.join(repoRoot, 'workbench', 'judgments.jsonl'),
    casesLogPath: options.casesLogPath ?? path.join(repoRoot, 'workbench', 'cases.jsonl'),
    evidencePath: options.evidencePath ?? path.join(repoRoot, 'workbench', 'review-data', 'admission-evidence.json'),
  };
}

async function readOptional(filePath: string): Promise<string | null> {
  return existsSync(filePath) ? readFile(filePath, 'utf8') : null;
}

async function readDirFiles(dirPath: string, repoRelativeDir: string, keep: (name: string) => boolean): Promise<DeriveSourceFile[]> {
  if (!existsSync(dirPath)) return [];
  const names = (await readdir(dirPath)).filter(keep).sort();
  return Promise.all(names.map(async (name) => ({
    path: `${repoRelativeDir}/${name}`,
    contents: await readFile(path.join(dirPath, name), 'utf8'),
  })));
}

/**
 * Phase 2 (§03.2's join, D8/D10): locate each sealed train's outcome
 * artifacts — the sealed manifest from the D10 evidence registry entry keyed
 * `reviewId = <trainId>`, and the verified report at
 * `eval/.runs/<trainId>.json` when one exists. The deriver re-verifies both
 * against the stored seal digest and stop pin; anything that fails the join
 * is honestly listed in `unverifiablePriorTrains` (fail-closed), so this
 * loader never needs to trust what it reads.
 */
async function loadPriorTrainArtifacts(paths: UpdatesInputPaths, updatesLog: string): Promise<PriorTrainArtifacts[]> {
  let trainIds: string[];
  try {
    trainIds = [...new Set(parseUpdatesLog(updatesLog)
      .filter((event) => event.kind === 'train-sealed')
      .map((event) => (event as { trainId: string }).trainId))];
  } catch {
    // An unparseable log fails the derive itself with its own message.
    return [];
  }
  if (trainIds.length === 0) return [];
  const registryText = await readOptional(paths.evidencePath);
  const manifestsByTrain = new Map<string, string>();
  const baseCommitsByTrain = new Map<string, string>();
  if (registryText !== null) {
    try {
      const registry = JSON.parse(registryText) as { admissions?: readonly { reviewId?: unknown; proposal?: unknown; admittedBaseCommit?: unknown }[] };
      for (const entry of registry.admissions ?? []) {
        if (typeof entry.reviewId === 'string' && entry.proposal !== undefined) {
          manifestsByTrain.set(entry.reviewId, JSON.stringify(entry.proposal));
          // The train's base at seal — it scopes the §03.6 live window to
          // history the train could actually have produced. A missing or
          // malformed base yields no window (fail-closed to riding).
          if (typeof entry.admittedBaseCommit === 'string' && COMMIT_HEX.test(entry.admittedBaseCommit)) {
            baseCommitsByTrain.set(entry.reviewId, entry.admittedBaseCommit);
          }
        }
      }
    } catch {
      // A malformed registry locates nothing; the join reports it unverifiable.
    }
  }
  return Promise.all(trainIds.sort().map(async (trainId) => {
    const sealedManifestJson = manifestsByTrain.get(trainId);
    const admittedBaseCommit = baseCommitsByTrain.get(trainId);
    const reportPath = path.join(paths.repoRoot, 'eval', '.runs', `${trainId}.json`);
    const verifiedReportJson = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trainId) ? await readOptional(reportPath) : null;
    return {
      trainId,
      ...(sealedManifestJson === undefined ? {} : { sealedManifestJson }),
      ...(verifiedReportJson === null ? {} : { verifiedReportJson }),
      ...(admittedBaseCommit === undefined ? {} : { admittedBaseCommit }),
    };
  }));
}

/**
 * One sealed train's §03.6 history window request: the golden paths its
 * manifest upserts, and the base its window starts AFTER (`admittedBaseCommit`
 * from the D10 registry entry, recorded at seal). `baseCommit` null means the
 * registry records no usable base — the reader must observe nothing for that
 * train (fail-closed to riding), never fall back to unscoped history.
 */
export interface TrainGoldenHistoryWindow {
  readonly trainId: string;
  readonly baseCommit: string | null;
  readonly goldenPaths: readonly string[];
}

/** The §03.6 live-observation source: per-train post-base golden history. */
export type GoldenMainHistoryReader = (repoRoot: string, windows: readonly TrainGoldenHistoryWindow[]) => Promise<readonly MainGoldenHistoryEntry[]>;

const GOLDEN_FIXTURE_ID = /^[a-z0-9][a-z0-9-]{0,127}$/;
const COMMIT_HEX = /^[0-9a-f]{40}$/;

/**
 * The per-train history windows the live observation needs: for each sealed
 * train, exactly the files its manifest upserts, bounded below by its own
 * `admittedBaseCommit`. Parsed loosely — a manifest that does not parse
 * contributes no window and the §03.2 join reports it unverifiable.
 */
function sealedGoldenWindowsOf(priorTrainArtifacts: readonly PriorTrainArtifacts[]): TrainGoldenHistoryWindow[] {
  const windows: TrainGoldenHistoryWindow[] = [];
  for (const artifact of [...priorTrainArtifacts].sort((a, b) => a.trainId.localeCompare(b.trainId))) {
    if (artifact.sealedManifestJson === undefined) continue;
    const goldenPaths = new Set<string>();
    try {
      const manifest = JSON.parse(artifact.sealedManifestJson) as { operations?: readonly { type?: unknown; goldenFixtureId?: unknown }[] };
      for (const operation of Array.isArray(manifest.operations) ? manifest.operations : []) {
        if (operation.type === 'golden-fixture-upsert' && typeof operation.goldenFixtureId === 'string' && GOLDEN_FIXTURE_ID.test(operation.goldenFixtureId)) {
          goldenPaths.add(`eval/golden/${operation.goldenFixtureId}.json`);
        }
      }
    } catch {
      // The join reports the unparseable manifest; no window to observe.
    }
    if (goldenPaths.size === 0) continue;
    windows.push({
      trainId: artifact.trainId,
      baseCommit: artifact.admittedBaseCommit !== undefined && COMMIT_HEX.test(artifact.admittedBaseCommit)
        ? artifact.admittedBaseCommit
        : null,
      goldenPaths: [...goldenPaths].sort(),
    });
  }
  return windows;
}

/**
 * The default `GoldenMainHistoryReader`: for each train's window, every
 * content version of each named golden path at commits reachable from main
 * but NOT from the train's own base (`git rev-list <main> ^<base> -- <path>`)
 * — history the train could actually have produced. Main is the local
 * `refs/heads/main` and, when present, `refs/remotes/origin/main` (a squash
 * merge lands on origin/main first; the primary checkout's main may lag).
 * §03.6/§5.2 anchor the `live` observation here because the base is fixed at
 * seal and git history only grows: each window is monotonic, so a train
 * whose sealed fixtures all appear in its window stays live no matter how
 * the working tree moves later — while a version merged BEFORE the train's
 * base (a reversal chain re-deriving byte-identical ancestor content) never
 * marks it live. Not a git repository, no main ref, no usable base for a
 * train, an unreadable or unparseable version: observed as absent, never an
 * error — the observation fails closed to "riding".
 */
export async function readGoldenMainHistoryFromGit(repoRoot: string, windows: readonly TrainGoldenHistoryWindow[]): Promise<MainGoldenHistoryEntry[]> {
  if (windows.length === 0) return [];
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execFileAsync = promisify(execFile);
  const capture = async (args: readonly string[]): Promise<string | null> => {
    try {
      const result = await execFileAsync('git', [...args], { cwd: repoRoot, windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
      return result.stdout;
    } catch {
      return null;
    }
  };
  const tips: string[] = [];
  for (const ref of ['refs/heads/main', 'refs/remotes/origin/main']) {
    const resolved = (await capture(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]))?.trim();
    if (resolved !== undefined && COMMIT_HEX.test(resolved) && !tips.includes(resolved)) tips.push(resolved);
  }
  if (tips.length === 0) return [];
  // Shared across trains: sealed windows overlap ((base, path) pairs repeat
  // when same-search trains chain), and version contents repeat across
  // commits; read each only once.
  const digestsByWindowKey = new Map<string, readonly string[]>();
  const digestByCommitPath = new Map<string, string | null>();
  const readWindowDigests = async (baseCommit: string, goldenPath: string): Promise<readonly string[]> => {
    const windowKey = `${baseCommit} ${goldenPath}`;
    const memoized = digestsByWindowKey.get(windowKey);
    if (memoized !== undefined) return memoized;
    const versionDigests = new Set<string>();
    const seenCommits = new Set<string>();
    for (const tip of tips) {
      const listed = await capture(['rev-list', tip, `^${baseCommit}`, '--', goldenPath]);
      if (listed === null) continue;
      for (const line of listed.split('\n')) {
        const commit = line.trim();
        if (!COMMIT_HEX.test(commit) || seenCommits.has(commit)) continue;
        seenCommits.add(commit);
        const contentKey = `${commit} ${goldenPath}`;
        let versionDigest = digestByCommitPath.get(contentKey);
        if (versionDigest === undefined) {
          const contents = await capture(['show', `${commit}:${goldenPath}`]);
          versionDigest = null;
          if (contents !== null) {
            try {
              versionDigest = fixtureContentDigest(JSON.parse(contents));
            } catch {
              // An unparseable historical version proves nothing.
            }
          }
          digestByCommitPath.set(contentKey, versionDigest);
        }
        if (versionDigest !== null) versionDigests.add(versionDigest);
      }
    }
    const digests = [...versionDigests].sort();
    digestsByWindowKey.set(windowKey, digests);
    return digests;
  };
  const entries: MainGoldenHistoryEntry[] = [];
  for (const window of [...windows].sort((a, b) => a.trainId.localeCompare(b.trainId))) {
    // No usable base = no window: fall back to NOTHING, never to unscoped
    // history — unscoped history is exactly the reversal-chain false 'live'.
    if (window.baseCommit === null || !COMMIT_HEX.test(window.baseCommit)) continue;
    const base = (await capture(['rev-parse', '--verify', '--quiet', `${window.baseCommit}^{commit}`]))?.trim();
    if (base !== window.baseCommit) continue;
    for (const goldenPath of [...window.goldenPaths].sort()) {
      if (!goldenPath.startsWith('eval/golden/')) continue;
      entries.push({
        trainId: window.trainId,
        path: goldenPath,
        fixtureDigests: await readWindowDigests(window.baseCommit, goldenPath),
      });
    }
  }
  return entries;
}

/** Reads one complete observed-input snapshot for the deriver (§03.2's table). */
export async function assembleUpdatesInputs(
  paths: UpdatesInputPaths,
  replayIdentity: ReplayIdentity,
  readGoldenMainHistory: GoldenMainHistoryReader = readGoldenMainHistoryFromGit,
): Promise<DeriveUpdatesInputs> {
  const manifestPath = path.join(paths.repoRoot, 'workbench', 'legacy', 'migration-manifest.json');
  const [judgmentsLog, casesLog, migrationManifestJson, updatesLog, ontologyFiles, goldenFixtureFiles, webSubsetJson] = await Promise.all([
    readOptional(paths.judgmentsLogPath).then((text) => text ?? ''),
    readOptional(paths.casesLogPath),
    readOptional(manifestPath),
    readOptional(paths.updatesLogPath).then((text) => text ?? ''),
    readDirFiles(path.join(paths.repoRoot, 'ontology', 'concepts'), 'ontology/concepts', (name) => name.endsWith('.yaml')),
    readDirFiles(path.join(paths.repoRoot, 'eval', 'golden'), 'eval/golden', (name) => name.endsWith('.json')),
    readFile(path.join(paths.repoRoot, 'pipeline', 'fixtures', 'web-subset.json'), 'utf8'),
  ]);
  const priorTrainArtifacts = await loadPriorTrainArtifacts(paths, updatesLog);
  const sealedGoldenWindows = sealedGoldenWindowsOf(priorTrainArtifacts);
  const mainGoldenHistory = sealedGoldenWindows.length === 0 ? [] : await readGoldenMainHistory(paths.repoRoot, sealedGoldenWindows);
  return {
    judgmentsLog,
    casesLog,
    migrationManifestJson,
    updatesLog,
    replayIdentity,
    ontologyFiles,
    goldenFixtureFiles,
    webSubsetJson,
    ...(priorTrainArtifacts.length === 0 ? {} : { priorTrainArtifacts }),
    ...(mainGoldenHistory.length === 0 ? {} : { mainGoldenHistory }),
  };
}

export function createUpdatesOperations(options: UpdatesOperationsOptions): UpdatesOperations {
  const paths = resolveUpdatesInputPaths(options);
  const store: UpdatesStore = createUpdatesStore({ logPath: paths.updatesLogPath });
  const now = options.now ?? ((): Date => new Date());

  async function assembleInputs(replayIdentity: ReplayIdentity): Promise<DeriveUpdatesInputs> {
    return assembleUpdatesInputs(paths, replayIdentity, options.readGoldenMainHistory);
  }

  function deriveFrom(inputs: DeriveUpdatesInputs): UpdatesDerivation {
    try {
      return deriveUpdates(inputs);
    } catch (error) {
      throw new UpdatesOperationsError(
        'updates_underivable',
        error instanceof Error ? error.message : 'Updates could not be derived from the current logs.',
        500,
      );
    }
  }

  // Decides serialize through one in-process chain so two keystrokes cannot
  // interleave their read-validate-append cycles (the store already
  // serializes appends; this extends the discipline to the derive+append
  // pair so the lazily-written card-drafted line is never duplicated).
  let decideChain: Promise<unknown> = Promise.resolve();

  return {
    async derive(replayIdentity: ReplayIdentity): Promise<UpdatesDerivation> {
      return deriveFrom(await assembleInputs(replayIdentity));
    },

    async decide(cardId: string, input: unknown, replayIdentity: ReplayIdentity): Promise<UpdateCard> {
      const run = decideChain.then(async () => {
        const request = parseDecideRequest(input);
        const inputs = await assembleInputs(replayIdentity);
        const derivation = deriveFrom(inputs);
        const card = derivation.cards.find((candidate) => candidate.cardId === cardId);
        if (card === undefined) {
          // FM-13's arm: the id no longer derives — a contributing judgment
          // was superseded, and the replacement card is a different card.
          throw new UpdatesOperationsError(
            'card_not_derived',
            'You changed your call on this since the card was written. Reload your updates for the fresh card.',
            409,
          );
        }
        if (card.cardRevision !== request.cardRevision) {
          // FM-11's arm: an input snapshot moved under the card's content.
          throw new UpdatesOperationsError(
            'stale_card_revision',
            'The picture changed since you read this — reload your updates and decide against the fresh card.',
            409,
          );
        }
        if (card.state.sealedInTrain !== undefined) {
          // §02.6's fold freezes a sealed card's decision until its train
          // reaches a terminal state — a decide here would append a line the
          // fold ignores, a control that appears to succeed and changes
          // nothing. Refuse honestly instead; the freeze lifts if the train
          // stops (the fold clears it) and the next decide counts again. A
          // FINISHED update never releases the freeze (§03.6's consumed
          // rule), so its refusal says what is actually true: the line
          // already shipped.
          throw new UpdatesOperationsError(
            'card_sealed',
            card.state.sealedTrainLive === true
              ? 'This call rode an update that finished — its line is on the answer sheet now. A new call on this search in Review starts a fresh card.'
              : 'This call is riding the current update — it is locked in until that update finishes or stops.',
            409,
          );
        }
        validateDecisionAgainstCard(card, request);

        const at = now().toISOString();
        const events: UpdatesEvent[] = [];
        const fold = await store.read();
        if (!fold.drafted.has(cardId)) {
          // Cards are derived, never stored (V5): the drafted line is
          // appended lazily at first decide so decides always reference a
          // drafted card without persisting every derivation.
          events.push({
            schemaVersion: 1,
            eventId: randomUUID(),
            at,
            reviewer: options.reviewer,
            kind: 'card-drafted',
            cardId,
            judgmentIds: card.judgmentIds,
          });
        }
        if (request.decision === 'approve') {
          events.push({
            schemaVersion: 1,
            eventId: randomUUID(),
            at,
            reviewer: options.reviewer,
            kind: 'card-approved',
            cardId,
            ...(request.answers === undefined ? {} : { answers: request.answers }),
          });
        } else if (request.decision === 'decline') {
          events.push({
            schemaVersion: 1,
            eventId: randomUUID(),
            at,
            reviewer: options.reviewer,
            kind: 'card-declined',
            cardId,
            reason: request.reason!.trim(),
          });
        } else {
          events.push({
            schemaVersion: 1,
            eventId: randomUUID(),
            at,
            reviewer: options.reviewer,
            kind: 'card-parked',
            cardId,
          });
        }
        await store.append(events);

        // Return the re-rendered card state (§4.4): decision state is
        // excluded from cardRevision by construction, so only `state` (and a
        // lifted parked-by-default) can differ from what the client holds.
        const after = deriveFrom({ ...inputs, updatesLog: `${inputs.updatesLog}${events.map((event) => `${JSON.stringify(event)}\n`).join('')}` });
        const refreshed = after.cards.find((candidate) => candidate.cardId === cardId);
        if (refreshed === undefined) {
          throw new UpdatesOperationsError('card_not_derived', 'The card no longer derives after this decision. Reload your updates.', 409);
        }
        return refreshed;
      });
      decideChain = run.catch(() => undefined);
      return run;
    },
  };
}
