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
  THEME_ANSWER_NONE,
  type DeriveSourceFile,
  type DeriveUpdatesInputs,
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
  if (registryText !== null) {
    try {
      const registry = JSON.parse(registryText) as { admissions?: readonly { reviewId?: unknown; proposal?: unknown }[] };
      for (const entry of registry.admissions ?? []) {
        if (typeof entry.reviewId === 'string' && entry.proposal !== undefined) {
          manifestsByTrain.set(entry.reviewId, JSON.stringify(entry.proposal));
        }
      }
    } catch {
      // A malformed registry locates nothing; the join reports it unverifiable.
    }
  }
  return Promise.all(trainIds.sort().map(async (trainId) => {
    const sealedManifestJson = manifestsByTrain.get(trainId);
    const reportPath = path.join(paths.repoRoot, 'eval', '.runs', `${trainId}.json`);
    const verifiedReportJson = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trainId) ? await readOptional(reportPath) : null;
    return {
      trainId,
      ...(sealedManifestJson === undefined ? {} : { sealedManifestJson }),
      ...(verifiedReportJson === null ? {} : { verifiedReportJson }),
    };
  }));
}

/** Reads one complete observed-input snapshot for the deriver (§03.2's table). */
export async function assembleUpdatesInputs(paths: UpdatesInputPaths, replayIdentity: ReplayIdentity): Promise<DeriveUpdatesInputs> {
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
  };
}

export function createUpdatesOperations(options: UpdatesOperationsOptions): UpdatesOperations {
  const paths = resolveUpdatesInputPaths(options);
  const store: UpdatesStore = createUpdatesStore({ logPath: paths.updatesLogPath });
  const now = options.now ?? ((): Date => new Date());

  async function assembleInputs(replayIdentity: ReplayIdentity): Promise<DeriveUpdatesInputs> {
    return assembleUpdatesInputs(paths, replayIdentity);
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
          // stops (the fold clears it) and the next decide counts again.
          throw new UpdatesOperationsError(
            'card_sealed',
            'This call is riding the current update — it is locked in until that update finishes or stops.',
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
