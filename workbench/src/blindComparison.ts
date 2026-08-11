import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';

import {
  assertComparisonReportIntegrity,
  type ComparableResult,
  type ComparisonQueryReport,
  type ComparisonReport,
  type ComparisonVerdict,
  type EngineIdentity,
} from './comparison.js';
import {
  applyMutationPlanWithLockedValidation,
  createMutationPlan,
  validateRepoRelativePath,
  withMutationJournalReadLock,
  type ApplyPhase,
  type MutationJournalReadPhase,
  type MutationJournalReadScope,
} from './applyJournal.js';

const SHA256 = /^[a-f0-9]{64}$/;
const PUBLIC_ID = /^[a-z0-9][a-z0-9-]{7,79}$/;
const REQUEST_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const SESSION_ID = /^blind-[a-f0-9]{32}$/;
const QUERY_ID = /^q-[a-f0-9]{24}$/;
const MAX_NOTE_LENGTH = 1_000;
const MAX_REFERENCE_LENGTH = 160;
let processMutationTail: Promise<void> = Promise.resolve();

export type BlindChoice = 'a-wins' | 'b-wins' | 'tie' | 'both-wrong';
export type GateGroup = 'blocking' | 'review-required' | 'passing' | 'not-applicable';

export interface BlindGateFindingInput {
  readonly gateId: string;
  readonly group: GateGroup;
  readonly message: string;
  readonly query?: string;
}

export interface BlindPublicationFixture {
  readonly reviewId?: string;
  readonly machine: unknown;
  readonly gateFindings?: readonly BlindGateFindingInput[];
}

export interface BlindComparisonStoreOptions {
  readonly eventLogPath: string;
  readonly reviewer: string;
  readonly candidatesRoot?: string;
  readonly fixtures?: readonly BlindPublicationFixture[];
  readonly seedFactory?: () => Uint8Array;
  readonly now?: () => Date;
  readonly expectedReferenceIdentity?: EngineIdentity;
  readonly lockRoot?: string;
  /** Test-only fault hook forwarded to the durable M4 transaction. */
  readonly onJournalPhase?: (phase: ApplyPhase, operationId: string) => void | Promise<void>;
  /** Test-only fault hook for canonical reads inside the mutation lock. */
  readonly onJournalReadPhase?: (phase: MutationJournalReadPhase, relativePath: string) => void | Promise<void>;
  /** Test-only crash hook. Recovery deliberately occurs on the next locked access. */
  readonly crashAtJournalPhase?: ApplyPhase;
}

export interface BlindMutationPrecondition {
  readonly requestId: string;
  readonly revision: number;
  readonly stateDigest: string;
}

export interface BlindJudgmentInput extends BlindMutationPrecondition {
  readonly queryId: string;
  readonly choice: BlindChoice;
}

export interface BlindMissingPassageInput extends BlindMutationPrecondition {
  readonly queryId: string;
  readonly reference: string;
  readonly note?: string;
}

interface ComparisonBinding {
  readonly cacheKey: string;
  readonly proposalDigest: string;
  readonly databaseSha256: string;
  readonly descriptorSha256: string;
  readonly referenceIdentity: EngineIdentity;
  readonly candidateIdentity: EngineIdentity;
  readonly comparisonDigest: string;
}

interface ComparisonMachine {
  readonly schemaVersion: 1;
  readonly kind: 'scripture-search-comparison';
  readonly binding: ComparisonBinding;
  readonly report: ComparisonReport;
}

interface LoadedPublication {
  readonly reviewId: string;
  readonly report: ComparisonReport;
  readonly binding: ComparisonBinding;
  readonly gates: readonly BlindGateFindingInput[];
}

interface SessionCreatedEvent {
  readonly schemaVersion: 1;
  readonly kind: 'session-created';
  readonly sessionId: string;
  readonly reviewId: string;
  readonly comparisonDigest: string;
  readonly reviewer: string;
  readonly requestId: string;
  readonly seed: string;
  readonly at: string;
}

interface JudgmentEvent {
  readonly schemaVersion: 1;
  readonly kind: 'judgment-recorded';
  readonly sessionId: string;
  readonly reviewId: string;
  readonly comparisonDigest: string;
  readonly reviewer: string;
  readonly requestId: string;
  readonly revision: number;
  readonly preStateDigest: string;
  readonly queryId: string;
  readonly choice: BlindChoice;
  readonly at: string;
}

interface MissingEvent {
  readonly schemaVersion: 1;
  readonly kind: 'missing-passage-recorded';
  readonly sessionId: string;
  readonly reviewId: string;
  readonly comparisonDigest: string;
  readonly reviewer: string;
  readonly requestId: string;
  readonly revision: number;
  readonly preStateDigest: string;
  readonly queryId: string;
  readonly reference: string;
  readonly note: string | null;
  readonly at: string;
}

type BlindEvent = SessionCreatedEvent | JudgmentEvent | MissingEvent;

interface FoldedSession {
  readonly created: SessionCreatedEvent;
  readonly events: readonly (JudgmentEvent | MissingEvent)[];
  readonly requestFingerprints: ReadonlyMap<string, string>;
  readonly judgments: ReadonlyMap<string, JudgmentEvent>;
  readonly missing: ReadonlyMap<string, readonly MissingEvent[]>;
  readonly revision: number;
  readonly stateDigest: string;
}

export class BlindComparisonError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = 'BlindComparisonError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) throw new BlindComparisonError('invalid_data', 'Blind comparison data contains an unsupported value.');
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (!isRecord(value)) throw new BlindComparisonError('invalid_data', 'Blind comparison data must contain JSON values only.');
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

async function sha256File(file: string): Promise<string> {
  const hash = createHash('sha256');
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(file);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

function requireText(value: unknown, label: string, max = 300): string {
  if (typeof value !== 'string' || value.trim() === '' || value !== value.trim() || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new BlindComparisonError('validation_failed', `${label} must be canonical non-empty text no longer than ${max} characters.`);
  }
  return value;
}

function requireDigest(value: unknown, label: string): string {
  if (typeof value !== 'string' || !SHA256.test(value)) throw new BlindComparisonError('publication_invalid', `${label} must be a lowercase SHA-256 digest.`);
  return value;
}

function exactKeys(value: Record<string, unknown>, allowed: readonly string[], label: string): void {
  const expected = [...allowed].sort();
  const actual = Object.keys(value).sort();
  if (canonicalJson(expected) !== canonicalJson(actual)) {
    throw new BlindComparisonError('validation_failed', `${label} must contain exactly: ${expected.join(', ')}.`);
  }
}

function sameIdentity(left: EngineIdentity, right: EngineIdentity): boolean {
  return left.engineVersion === right.engineVersion
    && left.corpusFingerprint === right.corpusFingerprint
    && left.layerFingerprint === right.layerFingerprint;
}

function parseBinding(value: unknown): ComparisonBinding {
  if (!isRecord(value)) throw new BlindComparisonError('publication_invalid', 'Comparison binding must be an object.');
  exactKeys(value, ['cacheKey', 'proposalDigest', 'databaseSha256', 'descriptorSha256', 'referenceIdentity', 'candidateIdentity', 'comparisonDigest'], 'Comparison binding');
  const identity = (candidate: unknown, label: string): EngineIdentity => {
    if (!isRecord(candidate)) throw new BlindComparisonError('publication_invalid', `${label} must be an object.`);
    exactKeys(candidate, ['engineVersion', 'corpusFingerprint', 'layerFingerprint'], label);
    return {
      engineVersion: requireText(candidate.engineVersion, `${label}.engineVersion`),
      corpusFingerprint: requireText(candidate.corpusFingerprint, `${label}.corpusFingerprint`),
      layerFingerprint: requireText(candidate.layerFingerprint, `${label}.layerFingerprint`),
    };
  };
  return {
    cacheKey: requireDigest(value.cacheKey, 'binding.cacheKey'),
    proposalDigest: requireDigest(value.proposalDigest, 'binding.proposalDigest'),
    databaseSha256: requireDigest(value.databaseSha256, 'binding.databaseSha256'),
    descriptorSha256: requireDigest(value.descriptorSha256, 'binding.descriptorSha256'),
    referenceIdentity: identity(value.referenceIdentity, 'binding.referenceIdentity'),
    candidateIdentity: identity(value.candidateIdentity, 'binding.candidateIdentity'),
    comparisonDigest: requireDigest(value.comparisonDigest, 'binding.comparisonDigest'),
  };
}

function parseMachine(value: unknown): ComparisonMachine {
  if (!isRecord(value)) throw new BlindComparisonError('publication_invalid', 'Comparison publication must be an object.');
  exactKeys(value, ['schemaVersion', 'kind', 'binding', 'report'], 'Comparison publication');
  if (value.schemaVersion !== 1 || value.kind !== 'scripture-search-comparison') {
    throw new BlindComparisonError('publication_invalid', 'Unsupported comparison publication schema or kind.');
  }
  const binding = parseBinding(value.binding);
  const report = value.report as ComparisonReport;
  try { assertComparisonReportIntegrity(report); }
  catch (error) { throw new BlindComparisonError('publication_invalid', error instanceof Error ? error.message : 'Comparison report is invalid.'); }
  if (binding.comparisonDigest !== report.digest
      || !sameIdentity(binding.referenceIdentity, report.referenceIdentity)
      || !sameIdentity(binding.candidateIdentity, report.candidateIdentity)) {
    throw new BlindComparisonError('publication_invalid', 'Comparison publication binding does not match its report.');
  }
  return { schemaVersion: 1, kind: 'scripture-search-comparison', binding, report };
}

function parseGate(value: unknown, report: ComparisonReport, index: number): BlindGateFindingInput {
  if (!isRecord(value)) throw new BlindComparisonError('publication_invalid', `gateFindings[${index}] must be an object.`);
  const allowed = value.query === undefined ? ['gateId', 'group', 'message'] : ['gateId', 'group', 'message', 'query'];
  exactKeys(value, allowed, `gateFindings[${index}]`);
  const gateId = requireText(value.gateId, `gateFindings[${index}].gateId`, 120);
  if (!['blocking', 'review-required', 'passing', 'not-applicable'].includes(String(value.group))) {
    throw new BlindComparisonError('publication_invalid', `gateFindings[${index}].group is invalid.`);
  }
  const query = value.query === undefined ? undefined : requireText(value.query, `gateFindings[${index}].query`, 500);
  if (query !== undefined && !report.queries.some((entry) => entry.query === query)) {
    throw new BlindComparisonError('publication_invalid', `gateFindings[${index}].query is outside the comparison universe.`);
  }
  return { gateId, group: value.group as GateGroup, message: requireText(value.message, `gateFindings[${index}].message`, 500), ...(query === undefined ? {} : { query }) };
}

function deriveGates(report: ComparisonReport): readonly BlindGateFindingInput[] {
  const findings: BlindGateFindingInput[] = [];
  for (const query of report.queries) {
    const queryToken = sha256(query.query).slice(0, 16);
    if (!query.expectationStatus.referencePasses) {
      findings.push({ gateId: `inherited-${queryToken}`, group: 'blocking', query: query.query, message: 'An inherited expectation is failing for this query.' });
    }
    if (!query.expectationStatus.candidatePasses) {
      findings.push({ gateId: `expectation-${queryToken}`, group: 'blocking', query: query.query, message: 'A required comparison expectation is failing for this query.' });
    }
    if (query.verdict === 'regressed') {
      findings.push({ gateId: `regression-${queryToken}`, group: 'blocking', query: query.query, message: 'Measured quality moved backward for this query.' });
    } else if (query.top10Changed) {
      findings.push({ gateId: `movement-${queryToken}`, group: 'review-required', query: query.query, message: 'Top results changed and require a human decision.' });
    } else {
      findings.push({ gateId: `stable-${queryToken}`, group: 'passing', query: query.query, message: 'The compared result sets are stable.' });
    }
    if (query.expectedReferenceOutcomes.reference.length === 0) {
      findings.push({ gateId: `expectation-na-${queryToken}`, group: 'not-applicable', query: query.query, message: 'No explicit expected passage is declared for this query.' });
    }
  }
  return findings.sort((left, right) => left.group.localeCompare(right.group) || left.gateId.localeCompare(right.gateId));
}

function parseFixture(fixture: BlindPublicationFixture, index: number): LoadedPublication {
  if (!isRecord(fixture)) throw new BlindComparisonError('publication_invalid', `fixtures[${index}] must be an object.`);
  const fixtureKeys = fixture.reviewId === undefined
    ? (fixture.gateFindings === undefined ? ['machine'] : ['machine', 'gateFindings'])
    : (fixture.gateFindings === undefined ? ['reviewId', 'machine'] : ['reviewId', 'machine', 'gateFindings']);
  exactKeys(fixture, fixtureKeys, `fixtures[${index}]`);
  const machine = parseMachine(fixture.machine);
  const reviewId = fixture.reviewId === undefined
    ? `review-${sha256(`${machine.binding.cacheKey}:${machine.report.digest}`).slice(0, 24)}`
    : requireText(fixture.reviewId, `fixtures[${index}].reviewId`, 80);
  if (!PUBLIC_ID.test(reviewId)) throw new BlindComparisonError('publication_invalid', `fixtures[${index}].reviewId is not a safe public identifier.`);
  const supplied = fixture.gateFindings ?? [];
  if (!Array.isArray(supplied)) throw new BlindComparisonError('publication_invalid', `fixtures[${index}].gateFindings must be an array.`);
  const gates = [...deriveGates(machine.report), ...supplied.map((entry, gateIndex) => parseGate(entry, machine.report, gateIndex))];
  const gateIds = new Set<string>();
  for (const gate of gates) {
    if (gateIds.has(gate.gateId)) throw new BlindComparisonError('publication_invalid', `Duplicate gateId ${gate.gateId}.`);
    gateIds.add(gate.gateId);
  }
  return { reviewId, report: machine.report, binding: machine.binding, gates };
}

async function loadDiskFixtures(root: string): Promise<readonly BlindPublicationFixture[]> {
  const rootStats = await lstat(root).catch(() => null);
  if (rootStats === null) return [];
  if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) throw new BlindComparisonError('publication_invalid', 'Candidate root must be a real directory.');
  const rootReal = await realpath(root);
  const fixtures: BlindPublicationFixture[] = [];
  for (const name of (await readdir(root)).sort()) {
    if (!SHA256.test(name)) continue;
    const directory = path.join(root, name);
    const directoryStats = await lstat(directory);
    if (!directoryStats.isDirectory() || directoryStats.isSymbolicLink() || path.dirname(await realpath(directory)) !== rootReal) continue;
    const comparisonPath = path.join(directory, 'comparison', 'comparison.json');
    const descriptorPath = path.join(directory, 'candidate-artifact.json');
    const databasePath = path.join(directory, 'content.db');
    const files = await Promise.all([comparisonPath, descriptorPath, databasePath].map(async (file) => {
      const stats = await lstat(file).catch(() => null);
      if (stats === null || !stats.isFile() || stats.isSymbolicLink()) throw new BlindComparisonError('publication_invalid', `${file} must be a real regular file.`);
      return realpath(file);
    }));
    const directoryReal = await realpath(directory);
    if (files.some((file) => !file.startsWith(`${directoryReal}${path.sep}`))) throw new BlindComparisonError('publication_invalid', 'Candidate publication resolves outside its directory.');
    const machineText = await readFile(comparisonPath, 'utf8');
    let machineRaw: unknown;
    try { machineRaw = JSON.parse(machineText) as unknown; }
    catch { throw new BlindComparisonError('publication_invalid', `${comparisonPath} is not valid JSON.`); }
    if (`${canonicalJson(machineRaw)}\n` !== machineText) throw new BlindComparisonError('publication_invalid', `${comparisonPath} is not canonical M8 publication JSON.`);
    const machine = parseMachine(machineRaw);
    if (machine.binding.cacheKey !== name
        || machine.binding.descriptorSha256 !== await sha256File(descriptorPath)
        || machine.binding.databaseSha256 !== await sha256File(databasePath)) {
      throw new BlindComparisonError('publication_invalid', `Candidate publication ${name} no longer matches its bound files.`);
    }
    fixtures.push({ machine: machineRaw });
  }
  return fixtures;
}

function eventFingerprint(value: BlindEvent): string {
  const { at: _at, ...stable } = value;
  return sha256(canonicalJson(stable));
}

function parseEvent(value: unknown, line: number): BlindEvent {
  if (!isRecord(value) || value.schemaVersion !== 1) throw new BlindComparisonError('state_invalid', `Blind event line ${line} has an unsupported schema.`);
  const common = ['schemaVersion', 'kind', 'sessionId', 'reviewId', 'comparisonDigest', 'reviewer', 'requestId', 'at'];
  if (value.kind === 'session-created') exactKeys(value, [...common, 'seed'], `Blind event line ${line}`);
  else if (value.kind === 'judgment-recorded') exactKeys(value, [...common, 'revision', 'preStateDigest', 'queryId', 'choice'], `Blind event line ${line}`);
  else if (value.kind === 'missing-passage-recorded') exactKeys(value, [...common, 'revision', 'preStateDigest', 'queryId', 'reference', 'note'], `Blind event line ${line}`);
  else throw new BlindComparisonError('state_invalid', `Blind event line ${line} has an unknown kind.`);
  const sessionId = requireText(value.sessionId, `line ${line}.sessionId`, 80);
  const reviewId = requireText(value.reviewId, `line ${line}.reviewId`, 80);
  const comparisonDigest = requireDigest(value.comparisonDigest, `line ${line}.comparisonDigest`);
  const reviewer = requireText(value.reviewer, `line ${line}.reviewer`, 120);
  const requestId = requireText(value.requestId, `line ${line}.requestId`, 128);
  const at = requireText(value.at, `line ${line}.at`, 40);
  if (!SESSION_ID.test(sessionId) || !PUBLIC_ID.test(reviewId) || !REQUEST_ID.test(requestId) || Number.isNaN(Date.parse(at))) {
    throw new BlindComparisonError('state_invalid', `Blind event line ${line} contains invalid routing metadata.`);
  }
  if (value.kind === 'session-created') {
    if (typeof value.seed !== 'string' || !SHA256.test(value.seed)) throw new BlindComparisonError('state_invalid', `Blind event line ${line} has an invalid seed.`);
    return { schemaVersion: 1, kind: value.kind, sessionId, reviewId, comparisonDigest, reviewer, requestId, seed: value.seed, at };
  }
  if (!Number.isSafeInteger(value.revision) || (value.revision as number) < 0 || !SHA256.test(String(value.preStateDigest)) || !QUERY_ID.test(String(value.queryId))) {
    throw new BlindComparisonError('state_invalid', `Blind event line ${line} has invalid revision metadata.`);
  }
  if (value.kind === 'judgment-recorded') {
    if (!['a-wins', 'b-wins', 'tie', 'both-wrong'].includes(String(value.choice))) throw new BlindComparisonError('state_invalid', `Blind event line ${line} has an invalid choice.`);
    return { schemaVersion: 1, kind: value.kind, sessionId, reviewId, comparisonDigest, reviewer, requestId, revision: value.revision as number, preStateDigest: value.preStateDigest as string, queryId: value.queryId as string, choice: value.choice as BlindChoice, at };
  }
  if (value.note !== null && typeof value.note !== 'string') throw new BlindComparisonError('state_invalid', `Blind event line ${line} has an invalid note.`);
  return { schemaVersion: 1, kind: value.kind, sessionId, reviewId, comparisonDigest, reviewer, requestId, revision: value.revision as number, preStateDigest: value.preStateDigest as string, queryId: value.queryId as string, reference: requireText(value.reference, `line ${line}.reference`, MAX_REFERENCE_LENGTH), note: value.note as string | null, at };
}

function queryId(seed: string, digest: string, query: string): string {
  return `q-${sha256(`${seed}:query:${digest}:${query}`).slice(0, 24)}`;
}

function orderedQueries(publication: LoadedPublication, seed: string): readonly ComparisonQueryReport[] {
  return [...publication.report.queries].sort((left, right) => {
    const leftKey = sha256(`${seed}:order:${publication.report.digest}:${left.query}`);
    const rightKey = sha256(`${seed}:order:${publication.report.digest}:${right.query}`);
    return leftKey.localeCompare(rightKey) || left.query.localeCompare(right.query);
  });
}

function proposalOnA(seed: string, digest: string, query: string): boolean {
  return Number.parseInt(sha256(`${seed}:side:${digest}:${query}`).slice(0, 2), 16) % 2 === 0;
}

function initialDigest(created: SessionCreatedEvent): string {
  return sha256(canonicalJson({ session: created, revision: 0, events: [] }));
}

function foldSession(created: SessionCreatedEvent, events: readonly (JudgmentEvent | MissingEvent)[], publication: LoadedPublication): FoldedSession {
  if (created.comparisonDigest !== publication.report.digest || created.reviewId !== publication.reviewId) {
    throw new BlindComparisonError('state_invalid', 'Blind session is bound to a different comparison publication.');
  }
  const validQueries = new Set(publication.report.queries.map((entry) => queryId(created.seed, publication.report.digest, entry.query)));
  const requests = new Map<string, string>([[created.requestId, eventFingerprint(created)]]);
  const judgments = new Map<string, JudgmentEvent>();
  const missing = new Map<string, MissingEvent[]>();
  let digest = initialDigest(created);
  let revision = 0;
  for (const event of events) {
    if (event.sessionId !== created.sessionId || event.reviewId !== created.reviewId || event.comparisonDigest !== created.comparisonDigest || event.reviewer !== created.reviewer) {
      throw new BlindComparisonError('state_invalid', 'Blind event routing does not match its session.');
    }
    if (event.revision !== revision || event.preStateDigest !== digest || !validQueries.has(event.queryId)) {
      throw new BlindComparisonError('state_invalid', 'Blind event has a stale or invalid state binding.');
    }
    const fingerprint = eventFingerprint(event);
    if (requests.has(event.requestId)) throw new BlindComparisonError('state_invalid', `Blind requestId ${event.requestId} is repeated in the event log.`);
    requests.set(event.requestId, fingerprint);
    if (event.kind === 'judgment-recorded') {
      if (judgments.has(event.queryId)) throw new BlindComparisonError('state_invalid', 'A blind query has more than one immutable judgment.');
      judgments.set(event.queryId, event);
    } else {
      missing.set(event.queryId, [...(missing.get(event.queryId) ?? []), event]);
    }
    revision += 1;
    digest = sha256(canonicalJson({ previous: digest, event, revision }));
  }
  return { created, events, requestFingerprints: requests, judgments, missing, revision, stateDigest: digest };
}

function resultKey(result: ComparableResult): string {
  return `p-${sha256(result.reference).slice(0, 20)}`;
}

function blindResult(result: ComparableResult, rank: number): unknown {
  return {
    passageId: resultKey(result),
    reference: result.reference,
    rank,
    score: result.score,
    reasons: result.reasons.map((reason) => ({
      family: reason.family,
      label: reason.label,
      points: reason.points,
      uncappedPoints: reason.uncappedPoints,
      capped: reason.capped,
      provenance: reason.provenance,
    })),
  };
}

function blindMovement(report: ComparisonQueryReport, aIsProposal: boolean): unknown {
  const map = (targetId: string): string => {
    const result = [...report.reference.top10, ...report.candidate.top10].find((entry) => entry.targetId === targetId);
    return result === undefined ? `p-${sha256(targetId).slice(0, 20)}` : resultKey(result);
  };
  return {
    onlyA: (aIsProposal ? report.movement.added : report.movement.removed).map(map),
    onlyB: (aIsProposal ? report.movement.removed : report.movement.added).map(map),
    rankMoved: report.movement.rankMoved.map((entry) => ({
      passageId: map(entry.targetId),
      aRank: aIsProposal ? entry.candidateRank : entry.referenceRank,
      bRank: aIsProposal ? entry.referenceRank : entry.candidateRank,
      distance: Math.abs(entry.delta),
    })),
    reasonChanged: report.movement.reasonChanged.map(map),
    provenanceChanged: report.movement.provenanceChanged.map(map),
    scoreChanged: report.movement.scoreChanged.map(map),
    capChanged: report.movement.capChanged.map(map),
  };
}

function technicalReveal(publication: LoadedPublication, query: ComparisonQueryReport, aIsProposal: boolean, choice: BlindChoice): unknown {
  const semantic = choice === 'tie' ? 'tie' : choice === 'both-wrong' ? 'both-wrong'
    : (choice === 'a-wins') === aIsProposal ? 'candidate-wins' : 'current-wins';
  return {
    sideA: aIsProposal ? 'Candidate' : 'Current',
    sideB: aIsProposal ? 'Current' : 'Candidate',
    preference: semantic,
    identities: {
      current: publication.binding.referenceIdentity,
      candidate: publication.binding.candidateIdentity,
    },
    exact: {
      current: query.reference,
      candidate: query.candidate,
      movement: query.movement,
      memberships: query.memberships,
      expectations: query.expectedReferenceOutcomes,
    },
  };
}

function publicGates(publication: LoadedPublication): Record<GateGroup, readonly unknown[]> {
  const groups: Record<GateGroup, unknown[]> = { blocking: [], 'review-required': [], passing: [], 'not-applicable': [] };
  for (const finding of publication.gates) {
    groups[finding.group].push({
      findingId: `g-${sha256(finding.gateId).slice(0, 20)}`,
      message: finding.message,
      ...(finding.query === undefined ? {} : { queryId: `u-${sha256(finding.query).slice(0, 20)}` }),
    });
  }
  return groups;
}

function sessionView(publication: LoadedPublication, session: FoldedSession): unknown {
  const queries = orderedQueries(publication, session.created.seed).map((query) => {
    const id = queryId(session.created.seed, publication.report.digest, query.query);
    const aIsProposal = proposalOnA(session.created.seed, publication.report.digest, query.query);
    const judgment = session.judgments.get(id);
    const sideA = aIsProposal ? query.candidate.top10 : query.reference.top10;
    const sideB = aIsProposal ? query.reference.top10 : query.candidate.top10;
    return {
      queryId: id,
      query: query.query,
      verdict: query.verdict,
      changed: query.top10Changed,
      sides: {
        a: sideA.map(blindResult),
        b: sideB.map(blindResult),
      },
      movement: blindMovement(query, aIsProposal),
      missingPassages: (session.missing.get(id) ?? []).map((entry) => ({ reference: entry.reference, note: entry.note, recordedAt: entry.at })),
      judgment: judgment === undefined ? null : { choice: judgment.choice, recordedAt: judgment.at },
      ...(judgment === undefined ? {} : { reveal: technicalReveal(publication, query, aIsProposal, judgment.choice) }),
    };
  });
  const reviewedCount = session.judgments.size;
  const blockingGates = publication.gates.filter((gate) => gate.group === 'blocking');
  const inheritedFailures = publication.report.referenceExpectationFailureQueryIds.length;
  const blockers = [
    ...(reviewedCount === queries.length ? [] : [`${queries.length - reviewedCount} comparison ${queries.length - reviewedCount === 1 ? 'query is' : 'queries are'} unreviewed.`]),
    ...(inheritedFailures === 0 ? [] : [`${inheritedFailures} inherited expectation ${inheritedFailures === 1 ? 'failure blocks' : 'failures block'} admission.`]),
    ...(blockingGates.length === 0 ? [] : [`${blockingGates.length} blocking gate ${blockingGates.length === 1 ? 'finding rejects' : 'findings reject'} admission.`]),
  ];
  const view = {
    schemaVersion: 1,
    phase: reviewedCount === queries.length ? 'revealed' : 'blind',
    reviewId: publication.reviewId,
    sessionId: session.created.sessionId,
    revision: session.revision,
    stateDigest: session.stateDigest,
    progress: { reviewed: reviewedCount, total: queries.length, complete: reviewedCount === queries.length },
    queries,
    gateGroups: publicGates(publication),
    admission: { enabled: blockers.length === 0, blockers },
  };
  if (reviewedCount === 0) assertBlindPayloadSanitized(view);
  return view;
}

const FORBIDDEN_PRE_REVEAL_KEYS = /(^|[-_])(current|candidate|cachekey|layerfingerprint|seed|assignment|originalorder|referenceidentity|candidateidentity)([-_]|$)/i;
const FORBIDDEN_PRE_REVEAL_VALUES = /^(current|candidate)$|\b(current|candidate)\s+(identity|engine|artifact|side|layer|cache)\b/i;

export function assertBlindPayloadSanitized(value: unknown): void {
  const visit = (candidate: unknown, pointer: string): void => {
    if (typeof candidate === 'string') {
      if (FORBIDDEN_PRE_REVEAL_VALUES.test(candidate)) throw new BlindComparisonError('blind_leak', `Pre-reveal payload leaks an identity at ${pointer}.`, 500);
      return;
    }
    if (Array.isArray(candidate)) { candidate.forEach((entry, index) => visit(entry, `${pointer}/${index}`)); return; }
    if (!isRecord(candidate)) return;
    for (const [key, child] of Object.entries(candidate)) {
      if (FORBIDDEN_PRE_REVEAL_KEYS.test(key)) throw new BlindComparisonError('blind_leak', `Pre-reveal payload leaks field ${pointer}/${key}.`, 500);
      visit(child, `${pointer}/${key}`);
    }
  };
  visit(value, '$');
}

function parsePrecondition(value: unknown, extra: readonly string[]): BlindMutationPrecondition & Record<string, unknown> {
  if (!isRecord(value)) throw new BlindComparisonError('validation_failed', 'Mutation body must be an object.');
  exactKeys(value, ['requestId', 'revision', 'stateDigest', ...extra], 'Mutation body');
  const requestId = requireText(value.requestId, 'requestId', 128);
  if (!REQUEST_ID.test(requestId)) throw new BlindComparisonError('validation_failed', 'requestId has an invalid format.');
  if (!Number.isSafeInteger(value.revision) || (value.revision as number) < 0) throw new BlindComparisonError('validation_failed', 'revision must be a non-negative safe integer.');
  const stateDigest = requireDigest(value.stateDigest, 'stateDigest');
  return { ...value, requestId, revision: value.revision as number, stateDigest };
}

export function parseBlindJudgmentInput(value: unknown): BlindJudgmentInput {
  const parsed = parsePrecondition(value, ['queryId', 'choice']);
  if (typeof parsed.queryId !== 'string' || !QUERY_ID.test(parsed.queryId)) throw new BlindComparisonError('validation_failed', 'queryId is invalid.');
  if (!['a-wins', 'b-wins', 'tie', 'both-wrong'].includes(String(parsed.choice))) throw new BlindComparisonError('validation_failed', 'choice must be a-wins, b-wins, tie, or both-wrong.');
  return { requestId: parsed.requestId, revision: parsed.revision, stateDigest: parsed.stateDigest, queryId: parsed.queryId, choice: parsed.choice as BlindChoice };
}

export function parseMissingPassageInput(value: unknown): BlindMissingPassageInput {
  const withNote = isRecord(value) && Object.prototype.hasOwnProperty.call(value, 'note');
  const parsed = parsePrecondition(value, ['queryId', 'reference', ...(withNote ? ['note'] : [])]);
  if (typeof parsed.queryId !== 'string' || !QUERY_ID.test(parsed.queryId)) throw new BlindComparisonError('validation_failed', 'queryId is invalid.');
  const reference = requireText(parsed.reference, 'reference', MAX_REFERENCE_LENGTH);
  const note = parsed.note === undefined ? undefined : requireText(parsed.note, 'note', MAX_NOTE_LENGTH);
  return { requestId: parsed.requestId, revision: parsed.revision, stateDigest: parsed.stateDigest, queryId: parsed.queryId, reference, ...(note === undefined ? {} : { note }) };
}

interface CanonicalEventSnapshot {
  readonly text: string;
  readonly sha256: string | null;
}

interface ReturnDecision {
  readonly kind: 'return';
  readonly publication: LoadedPublication;
  readonly session: FoldedSession;
}

interface AppendDecision {
  readonly kind: 'append';
  readonly publication: LoadedPublication;
  readonly event: BlindEvent;
  readonly expectedSession: FoldedSession;
}

type TransactionDecision = ReturnDecision | AppendDecision;

class ConcurrentBlindMutationError extends Error {}

export class BlindComparisonStore {
  private readonly publications = new Map<string, LoadedPublication>();
  private readonly events = new Map<string, BlindEvent[]>();
  private readonly options: BlindComparisonStoreOptions;
  private readonly lockRoot: string;
  private readonly eventLogRelativePath: string;
  private mutationTail: Promise<void> = Promise.resolve();
  private initialized = false;

  constructor(options: BlindComparisonStoreOptions) {
    this.options = options;
    this.lockRoot = path.resolve(options.lockRoot ?? path.dirname(options.eventLogPath));
    const eventLogPath = path.resolve(options.eventLogPath);
    const relative = path.relative(this.lockRoot, eventLogPath).split(path.sep).join('/');
    try {
      this.eventLogRelativePath = validateRepoRelativePath(relative);
    } catch {
      throw new BlindComparisonError('state_invalid', 'Blind event log must be a non-reserved file inside its transaction root.');
    }
  }

  async ready(): Promise<void> {
    if (this.initialized) return;
    const fixtures = this.options.fixtures ?? (this.options.candidatesRoot === undefined ? [] : await loadDiskFixtures(path.resolve(this.options.candidatesRoot)));
    for (const [index, fixture] of fixtures.entries()) {
      const publication = parseFixture(fixture, index);
      if (this.options.expectedReferenceIdentity !== undefined
          && !sameIdentity(publication.binding.referenceIdentity, this.options.expectedReferenceIdentity)) {
        throw new BlindComparisonError('publication_invalid', `Comparison ${publication.reviewId} is bound to a different reviewed artifact.`);
      }
      if (this.publications.has(publication.reviewId)) throw new BlindComparisonError('publication_invalid', `Duplicate reviewId ${publication.reviewId}.`);
      this.publications.set(publication.reviewId, publication);
    }
    await this.readCanonicalEvents();
    this.initialized = true;
  }

  list(): readonly unknown[] {
    this.requireReady();
    const result = [...this.publications.values()].sort((left, right) => left.reviewId.localeCompare(right.reviewId)).map((publication, index) => {
      const session = this.sessionForReview(publication.reviewId);
      const reviewed = session?.judgments.size ?? 0;
      return {
        reviewId: publication.reviewId,
        label: `Comparison ${index + 1}`,
        queryCount: publication.report.queries.length,
        reviewedCount: reviewed,
        status: session === null ? 'not-started' : reviewed === publication.report.queries.length ? 'complete' : 'in-progress',
        verdictCounts: publication.report.summary.verdictCounts,
        gateCounts: {
          blocking: publication.gates.filter((gate) => gate.group === 'blocking').length,
          reviewRequired: publication.gates.filter((gate) => gate.group === 'review-required').length,
          passing: publication.gates.filter((gate) => gate.group === 'passing').length,
          notApplicable: publication.gates.filter((gate) => gate.group === 'not-applicable').length,
        },
      };
    });
    assertBlindPayloadSanitized(result);
    return result;
  }

  async start(reviewId: string, requestId: string): Promise<unknown> {
    return this.transact(() => {
      const publication = this.publication(reviewId);
      const cleanRequestId = requireText(requestId, 'requestId', 128);
      if (!REQUEST_ID.test(cleanRequestId)) throw new BlindComparisonError('validation_failed', 'requestId has an invalid format.');
      const existing = this.sessionForReview(reviewId);
      if (existing !== null) return { kind: 'return', publication, session: existing };
      const seedBytes = this.options.seedFactory?.() ?? randomBytes(32);
      if (!(seedBytes instanceof Uint8Array) || seedBytes.byteLength !== 32) throw new BlindComparisonError('seed_invalid', 'Seed factory must return exactly 32 bytes.', 500);
      const seed = Buffer.from(seedBytes).toString('hex');
      const event: SessionCreatedEvent = {
        schemaVersion: 1,
        kind: 'session-created',
        sessionId: `blind-${sha256(`${seed}:${publication.report.digest}:${this.options.reviewer}`).slice(0, 32)}`,
        reviewId,
        comparisonDigest: publication.report.digest,
        reviewer: this.options.reviewer,
        requestId: cleanRequestId,
        seed,
        at: this.now(),
      };
      return { kind: 'append', publication, event, expectedSession: foldSession(event, [], publication) };
    });
  }

  get(reviewId: string, sessionId: string): unknown {
    this.requireReady();
    const publication = this.publication(reviewId);
    return sessionView(publication, this.session(reviewId, sessionId));
  }

  passageReference(reviewId: string, sessionId: string, queryIdValue: string, passageId: string): string {
    const publication = this.publication(reviewId);
    const session = this.session(reviewId, sessionId);
    if (!QUERY_ID.test(queryIdValue) || !/^p-[a-f0-9]{20}$/.test(passageId)) {
      throw new BlindComparisonError('passage_not_found', 'Unknown blind passage.', 404);
    }
    const query = publication.report.queries.find((entry) => queryId(session.created.seed, publication.report.digest, entry.query) === queryIdValue);
    if (query === undefined) throw new BlindComparisonError('query_not_found', 'Unknown blind query.', 404);
    const matches = [...query.reference.top10, ...query.candidate.top10].filter((entry) => resultKey(entry) === passageId);
    const references = [...new Set(matches.map((entry) => entry.reference))];
    if (references.length !== 1) throw new BlindComparisonError('passage_not_found', 'Unknown or ambiguous blind passage.', 404);
    return references[0]!;
  }

  async judge(reviewId: string, sessionId: string, input: BlindJudgmentInput): Promise<unknown> {
    return this.mutate(reviewId, sessionId, input, (event) => (
      event.kind === 'judgment-recorded'
      && event.revision === input.revision
      && event.preStateDigest === input.stateDigest
      && event.queryId === input.queryId
      && event.choice === input.choice
    ), (session, publication) => {
      if (session.judgments.has(input.queryId)) throw new BlindComparisonError('judgment_immutable', 'This query already has an immutable blind judgment.', 409);
      this.requireSessionQuery(session, publication, input.queryId);
      return {
        schemaVersion: 1,
        kind: 'judgment-recorded',
        sessionId,
        reviewId,
        comparisonDigest: publication.report.digest,
        reviewer: this.options.reviewer,
        requestId: input.requestId,
        revision: session.revision,
        preStateDigest: session.stateDigest,
        queryId: input.queryId,
        choice: input.choice,
        at: this.now(),
      } satisfies JudgmentEvent;
    });
  }

  async recordMissing(reviewId: string, sessionId: string, input: BlindMissingPassageInput): Promise<unknown> {
    return this.mutate(reviewId, sessionId, input, (event) => (
      event.kind === 'missing-passage-recorded'
      && event.revision === input.revision
      && event.preStateDigest === input.stateDigest
      && event.queryId === input.queryId
      && event.reference === input.reference
      && event.note === (input.note ?? null)
    ), (session, publication) => {
      this.requireSessionQuery(session, publication, input.queryId);
      return {
        schemaVersion: 1,
        kind: 'missing-passage-recorded',
        sessionId,
        reviewId,
        comparisonDigest: publication.report.digest,
        reviewer: this.options.reviewer,
        requestId: input.requestId,
        revision: session.revision,
        preStateDigest: session.stateDigest,
        queryId: input.queryId,
        reference: input.reference,
        note: input.note ?? null,
        at: this.now(),
      } satisfies MissingEvent;
    });
  }

  private async mutate(
    reviewId: string,
    sessionId: string,
    input: BlindMutationPrecondition,
    matchesReplay: (event: JudgmentEvent | MissingEvent) => boolean,
    create: (session: FoldedSession, publication: LoadedPublication) => JudgmentEvent | MissingEvent,
  ): Promise<unknown> {
    return this.transact(() => {
      const publication = this.publication(reviewId);
      const session = this.session(reviewId, sessionId);
      const prior = session.events.find((event) => event.requestId === input.requestId);
      if (input.requestId === session.created.requestId) {
        throw new BlindComparisonError('idempotency_conflict', 'requestId was already used to create this session.', 409);
      }
      if (prior !== undefined) {
        const matches = matchesReplay(prior);
        const left = Buffer.from(matches ? '1' : '0');
        const right = Buffer.from('1');
        if (!timingSafeEqual(left, right)) {
          throw new BlindComparisonError('idempotency_conflict', 'requestId was already used for a different mutation.', 409);
        }
        return { kind: 'return', publication, session };
      }
      if (input.revision !== session.revision || input.stateDigest !== session.stateDigest) {
        throw new BlindComparisonError('stale_session', 'Blind session changed. Reload it before submitting.', 409);
      }
      const event = create(session, publication);
      return {
        kind: 'append',
        publication,
        event,
        expectedSession: foldSession(session.created, [...session.events, event], publication),
      };
    });
  }

  private requireSessionQuery(session: FoldedSession, publication: LoadedPublication, id: string): void {
    const exists = publication.report.queries.some((entry) => queryId(session.created.seed, publication.report.digest, entry.query) === id);
    if (!exists) throw new BlindComparisonError('query_not_found', 'Unknown blind query.', 404);
  }

  private publication(reviewId: string): LoadedPublication {
    this.requireReady();
    if (!PUBLIC_ID.test(reviewId)) throw new BlindComparisonError('review_not_found', 'Unknown comparison review.', 404);
    const publication = this.publications.get(reviewId);
    if (publication === undefined) throw new BlindComparisonError('review_not_found', 'Unknown comparison review.', 404);
    return publication;
  }

  private sessionForReview(reviewId: string): FoldedSession | null {
    const matching = [...this.events.entries()].filter(([, events]) => events[0]?.reviewId === reviewId);
    if (matching.length > 1) throw new BlindComparisonError('state_invalid', 'A comparison review has multiple blind sessions.');
    return matching.length === 0 ? null : this.foldStoredSession(matching[0]![0], matching[0]![1]);
  }

  private session(reviewId: string, sessionId: string): FoldedSession {
    if (!SESSION_ID.test(sessionId)) throw new BlindComparisonError('session_not_found', 'Unknown blind session.', 404);
    const events = this.events.get(sessionId);
    if (events === undefined || events[0]?.reviewId !== reviewId) throw new BlindComparisonError('session_not_found', 'Unknown blind session.', 404);
    return this.foldStoredSession(sessionId, events);
  }

  private foldStoredSession(sessionId: string, events: readonly BlindEvent[]): FoldedSession {
    const created = events[0];
    if (created?.kind !== 'session-created' || events.slice(1).some((event) => event.kind === 'session-created')) {
      throw new BlindComparisonError('state_invalid', `Blind session ${sessionId} has an invalid creation event.`);
    }
    const publication = this.publications.get(created.reviewId);
    if (publication === undefined) throw new BlindComparisonError('state_invalid', `Blind session ${sessionId} references an unavailable comparison.`);
    if (created.reviewer !== this.options.reviewer) throw new BlindComparisonError('state_invalid', `Blind session ${sessionId} belongs to a different reviewer.`);
    return foldSession(created, events.slice(1) as readonly (JudgmentEvent | MissingEvent)[], publication);
  }

  private now(): string {
    const value = (this.options.now?.() ?? new Date()).toISOString();
    if (Number.isNaN(Date.parse(value))) throw new BlindComparisonError('clock_invalid', 'Clock returned an invalid date.', 500);
    return value;
  }

  private requireReady(): void {
    if (!this.initialized) throw new BlindComparisonError('store_not_ready', 'Blind comparison store is not ready.', 500);
  }

  private loadEvents(text: string): void {
    const lines = text === '' ? [] : text.split('\n');
    if (lines.at(-1) === '') lines.pop();
    if (lines.some((line) => line.trim() === '')) throw new BlindComparisonError('state_invalid', 'Blind event log contains a blank or partial line.');
    const loaded = new Map<string, BlindEvent[]>();
    for (const [index, line] of lines.entries()) {
      let raw: unknown;
      try { raw = JSON.parse(line!) as unknown; }
      catch { throw new BlindComparisonError('state_invalid', `Blind event line ${index + 1} is invalid JSON.`); }
      const event = parseEvent(raw, index + 1);
      loaded.set(event.sessionId, [...(loaded.get(event.sessionId) ?? []), event]);
    }
    this.events.clear();
    for (const [sessionId, events] of loaded) this.events.set(sessionId, events);
    for (const [sessionId, events] of this.events) this.foldStoredSession(sessionId, events);
  }

  private async readCanonicalFromScope(
    scope: MutationJournalReadScope,
    expectedSha256?: string | null,
  ): Promise<CanonicalEventSnapshot> {
    const bytes = await scope.readFile(this.eventLogRelativePath, expectedSha256);
    const text = bytes?.toString('utf8') ?? '';
    this.loadEvents(text);
    return { text, sha256: bytes === null ? null : sha256(bytes) };
  }

  private async readCanonicalEvents(): Promise<CanonicalEventSnapshot> {
    return withMutationJournalReadLock(this.lockRoot, (scope) => this.readCanonicalFromScope(scope), {
      waitTimeoutMs: 30_000,
      onReadPhase: this.options.onJournalReadPhase,
    });
  }

  private committedSession(event: BlindEvent): FoldedSession {
    const session = this.session(event.reviewId, event.sessionId);
    const committed = event.kind === 'session-created'
      ? session.created
      : session.events.find((candidate) => candidate.requestId === event.requestId);
    if (committed === undefined || canonicalJson(committed) !== canonicalJson(event)) {
      throw new BlindComparisonError('commit_verification_failed', 'The durable blind event did not exactly match the submitted event.', 503);
    }
    return session;
  }

  private async transact(resolve: () => TransactionDecision): Promise<unknown> {
    return this.serialize(async () => {
      const deadline = Date.now() + 30_000;
      while (true) {
        const baseline = await this.readCanonicalEvents();
        const decision = resolve();
        if (decision.kind === 'return') return sessionView(decision.publication, decision.session);

        const afterText = `${baseline.text}${canonicalJson(decision.event)}\n`;
        const afterSha256 = sha256(afterText);
        const plan = await createMutationPlan(this.lockRoot, [{
          path: this.eventLogRelativePath,
          beforeSha256: baseline.sha256,
          after: afterText,
        }]);
        const verification: { value: ReturnDecision | null } = { value: null };
        try {
          const outcome = await applyMutationPlanWithLockedValidation(this.lockRoot, plan, {
            waitTimeoutMs: 30_000,
            onReadPhase: this.options.onJournalReadPhase,
            beforeApply: async (scope) => {
              const current = await this.readCanonicalFromScope(scope);
              if (current.sha256 === baseline.sha256) return 'apply';
              const replay = resolve();
              if (replay.kind === 'return') {
                verification.value = replay;
                return 'skip';
              }
              throw new ConcurrentBlindMutationError();
            },
            afterCommit: async (scope) => {
              await this.readCanonicalFromScope(scope, afterSha256);
              const session = this.committedSession(decision.event);
              if (session.revision !== decision.expectedSession.revision
                  || session.stateDigest !== decision.expectedSession.stateDigest) {
                throw new BlindComparisonError('commit_verification_failed', 'The durable blind session revision or digest did not match the transaction.', 503);
              }
              verification.value = { kind: 'return', publication: decision.publication, session };
            },
          }, {
            onPhase: this.options.onJournalPhase,
            crashAt: this.options.crashAtJournalPhase,
          });
          if (outcome.status === 'APPLIED' && verification.value === null) {
            throw new BlindComparisonError('commit_verification_failed', 'The durable blind event was not reread after commit.', 503);
          }
          if (verification.value === null) {
            throw new BlindComparisonError('commit_verification_failed', 'The replayed blind event was not verified from canonical state.', 503);
          }
          return sessionView(verification.value.publication, verification.value.session);
        } catch (error) {
          if (error instanceof ConcurrentBlindMutationError && Date.now() < deadline) continue;
          if (isRecord(error) && error.code === 'stale_plan' && Date.now() < deadline) continue;
          throw error;
        }
      }
    });
  }

  private async serialize<T>(work: () => Promise<T>): Promise<T> {
    const run = this.mutationTail.then(() => {
      const globallySerialized = processMutationTail.then(work);
      processMutationTail = globallySerialized.then(() => undefined, () => undefined);
      return globallySerialized;
    });
    this.mutationTail = run.then(() => undefined, () => undefined);
    return run;
  }
}

export function parseStartBlindSessionInput(value: unknown): { readonly requestId: string } {
  if (!isRecord(value)) throw new BlindComparisonError('validation_failed', 'Session request must be an object.');
  exactKeys(value, ['requestId'], 'Session request');
  const requestId = requireText(value.requestId, 'requestId', 128);
  if (!REQUEST_ID.test(requestId)) throw new BlindComparisonError('validation_failed', 'requestId has an invalid format.');
  return { requestId };
}

export async function readBlindFixturesFile(file: string): Promise<readonly BlindPublicationFixture[]> {
  let raw: unknown;
  try { raw = JSON.parse(await readFile(file, 'utf8')) as unknown; }
  catch { throw new BlindComparisonError('publication_invalid', 'Blind comparison fixture file is not valid JSON.'); }
  if (!isRecord(raw) || Object.keys(raw).length !== 1 || !Array.isArray(raw.publications)) {
    throw new BlindComparisonError('publication_invalid', 'Blind comparison fixture file must contain exactly a publications array.');
  }
  return raw.publications as readonly BlindPublicationFixture[];
}
