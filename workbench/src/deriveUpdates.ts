/**
 * D4 — the deriver: votes to cards, approved cards to a proposal manifest
 * (votes-to-engine plan §03; mapping table V3, conflicts V10, refusals V15).
 *
 * A PURE function over an observed-input snapshot: the server assembles the
 * snapshot (file bytes, the served artifact identity, any prior-train outcome
 * artifacts) and the deriver never reaches around it — no file reads, no
 * network, no model call, no clock, no randomness. Same inputs produce
 * byte-identical cards and an identical manifest digest on every platform,
 * every run (§03.3; enforced by tests and by the curation boundary scan,
 * pipeline/test/curationBoundary.test.ts).
 *
 * The philosophy is V3's: expectations first, data second, interpretation
 * never. Every vote deterministically yields its fixture assertion; a data
 * operation is derived only when the vote itself deterministically names the
 * data row; anything interpretive — which theme carries a passage, whether a
 * new theme should exist — is a question on the card with deterministic
 * candidate chips, answered by the human, never by the machine.
 *
 * Cards are never stored, only re-derived (V5): `cardId` is a content
 * address over {kind, query, targetKey, judgmentIds}, so decisions recorded
 * in workbench/updates.jsonl re-attach across restarts and re-derivations,
 * and a superseded judgment simply stops deriving its card.
 */

import { createHash } from 'node:crypto';

import { parseDocument } from 'yaml';
import { significantWords } from '@jestek-dev/scripture-engine/internal';

import { BOOKS, findBook } from '../../pipeline/src/books.js';
import { parseVerseId } from '../../pipeline/src/verseId.js';

import {
  activeV2Judgments,
  anchorRangeOf,
  canonicalReferenceOf,
  isV2Judgment,
  parseJudgmentLog,
  referenceOfTargetId,
  slugOf,
  v2SupersessionKey,
  validateCasesForJudgments,
} from './effectiveJudgments.js';
import { validateLegacyMigrationManifest } from './cases.js';
import {
  ANCHOR_AFFECTING_CAUSES,
  type JudgmentRecordV2,
  type WithinTop,
} from './judgments.js';
import {
  normalizeProposalManifest,
  parseProposalManifest,
  proposalManifestDigest,
  type OntologyConceptIndex,
  type ProposalManifest,
  type ProposalOperation,
  type RowOwner,
} from './proposals.js';
import { foldUpdatesLog, type TrainSnapshot, type UpdatesLogFold } from './updatesStore.js';

export const UPDATE_CARD_KINDS = [
  'expectation',
  'guard',
  'guard-and-anchor',
  'missing-passage',
  'conflict',
  're-confirmation',
  'needs-engineering',
] as const;
export type UpdateCardKind = (typeof UPDATE_CARD_KINDS)[number];

export interface ReplayIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

export interface DeriveSourceFile {
  /** Repo-root-relative POSIX path. */
  readonly path: string;
  readonly contents: string;
}

export interface PriorTrainArtifacts {
  readonly trainId: string;
  /** JSON text of the sealed ProposalManifest located by the §03.2 join rule. */
  readonly sealedManifestJson?: string;
  /** UTF-8 text of the verified report (eval/.runs/<trainId>.json). */
  readonly verifiedReportJson?: string;
}

/** The observed-input snapshot (§03.2's table, assembled by the caller). */
export interface DeriveUpdatesInputs {
  /** Raw workbench/judgments.jsonl; '' when the file is absent. */
  readonly judgmentsLog: string;
  /** Raw workbench/cases.jsonl; null when the file is absent. */
  readonly casesLog: string | null;
  /** Raw workbench/legacy/migration-manifest.json; null when absent. */
  readonly migrationManifestJson: string | null;
  /** Raw workbench/updates.jsonl; '' when the file is absent. */
  readonly updatesLog: string;
  /** The identity the workbench is SERVING — never the committed descriptor. */
  readonly replayIdentity: ReplayIdentity;
  /** ontology/concepts/*.yaml, any order (sorted internally). */
  readonly ontologyFiles: readonly DeriveSourceFile[];
  /** eval/golden/*.json, any order (sorted internally). */
  readonly goldenFixtureFiles: readonly DeriveSourceFile[];
  /** Raw pipeline/fixtures/web-subset.json. */
  readonly webSubsetJson: string;
  /** Outcome artifacts for trains the updates log references, when located. */
  readonly priorTrainArtifacts?: readonly PriorTrainArtifacts[];
}

export interface IdentityNote {
  readonly dimension: keyof ReplayIdentity;
  readonly recorded: string;
  readonly current: string;
}

export interface CardVote {
  readonly judgmentId?: string;
  readonly caseId?: string;
  readonly at: string;
  readonly reviewer: string;
  readonly action?: JudgmentRecordV2['action'];
  readonly reference?: string;
  readonly withinTop?: WithinTop;
  readonly observedRank?: number | null;
  readonly observedWindow?: number;
  readonly diagnosis?: JudgmentRecordV2['diagnosis'];
  readonly diagnosisInferred?: true;
  readonly conceptId?: string;
  readonly note?: string;
  readonly excerpt?: string;
  readonly preferredReference?: string;
  readonly otherReference?: string;
  readonly resultSetDigest?: string;
  readonly displayedWindowDigest?: string;
  readonly reasonDigest?: string;
}

export interface ThemeChip {
  readonly conceptId: string;
  readonly label: string;
  readonly matchCount: number;
  readonly alreadyAnchored: boolean;
}

export interface CardQuestion {
  readonly id: 'theme';
  readonly prompt: 'Which theme should carry this passage?';
  readonly chips: readonly ThemeChip[];
}

export interface DerivedCardConsequences {
  readonly expectation?: { readonly ref: string; readonly withinTop: WithinTop };
  readonly guard?: { readonly ref: string; readonly why: string };
  readonly preferredOrder?: { readonly above: string; readonly below: string; readonly withinTop: number };
  readonly chapterAdd?: { readonly book: string; readonly chapter: number };
  /** Present when an answered theme question will add an editorial anchor. */
  readonly anchorAddOnAnswer?: { readonly weight: 1 };
  /** Row-4 data arm: the editorially-owned row the vote names. */
  readonly anchorRemove?: { readonly conceptId: string; readonly locator: string };
  /** Row-4 explanation arm: the row is source-owned and stays on record. */
  readonly sourceOwnedAnchor?: { readonly conceptId: string; readonly locator: string; readonly sources: readonly RowOwner[] };
}

export interface ConflictSide {
  readonly judgmentIds: readonly string[];
  readonly summary: string;
  readonly votes: readonly CardVote[];
}

export interface CardEngineeringEvidence {
  readonly trainId: string;
  readonly stopReason: string;
  readonly reportDigest?: string;
  readonly finding: string;
}

export type CardDecisionState = 'drafted' | 'approved' | 'declined' | 'parked';

export interface CardState {
  readonly decision: CardDecisionState;
  readonly decidedAt?: string;
  readonly answers?: Readonly<Record<string, string>>;
  readonly declineReason?: string;
  readonly sealedInTrain?: string;
  /**
   * Set when the sealing train's manifest is observed LANDED — every fixture
   * the seal wrote is present, byte-for-content, in the observed golden
   * files (the merge happened). The card is consumed (§03.6): it rests as
   * already achieved, never re-boards, never re-counts as "approved and
   * waiting". Derived from the §03.2 artifact join, fail-closed: an
   * unlocatable or unverifiable manifest leaves the card merely riding.
   */
  readonly sealedTrainLive?: true;
}

export interface UpdateCard {
  readonly cardId: string;
  /**
   * sha256 over the card's canonical derived content — operations, question
   * and chips, the pre-check verdict, the evidence bundle — NEVER its
   * decision state (§03.2's per-card decide pin). A decide on another card
   * cannot change this value.
   */
  readonly cardRevision: string;
  readonly kind: UpdateCardKind;
  readonly query: string;
  readonly targetKey: string;
  readonly judgmentIds: readonly string[];
  /** Helpful leaves on the same (query, target key): context, never address. */
  readonly contextJudgmentIds: readonly string[];
  readonly votes: readonly CardVote[];
  readonly derived: DerivedCardConsequences;
  readonly question?: CardQuestion;
  /** Frozen derive-time pre-check verdict (§03.5) — never flips mid-review. */
  readonly preCheck: 'current' | 'identity-moved';
  readonly identityNotes: readonly IdentityNote[];
  /** Ownership/canonicalization refusals route instead of deriving (V15). */
  readonly routed?: { readonly to: 'concept-curation'; readonly reason: string };
  readonly conflict?: { readonly sides: readonly [ConflictSide, ConflictSide] };
  /** The one legacy re-confirmation card (§07.2). */
  readonly legacy?: { readonly lineHashes: readonly string[] };
  readonly engineering?: CardEngineeringEvidence;
  /** True when everything the card would do is already true in the world. */
  readonly alreadyInPlace?: boolean;
  /** FM-5 derived default after a no-measurable-effect stop — never stored. */
  readonly parkedByDefault?: boolean;
  readonly state: CardState;
}

export interface UnverifiablePriorTrain {
  readonly trainId: string;
  readonly reason: string;
}

export interface UpdatesDerivation {
  readonly cards: readonly UpdateCard[];
  /** sha256 over every observed input pin — the seal's pin (§03.2). */
  readonly derivationDigest: string;
  readonly replayIdentity: ReplayIdentity;
  readonly trains: readonly TrainSnapshot[];
  /** Prior-train artifacts that failed the §03.2 join — fail-closed notes. */
  readonly unverifiablePriorTrains: readonly UnverifiablePriorTrain[];
  readonly tally: {
    readonly drafted: number;
    readonly approved: number;
    readonly declined: number;
    readonly parked: number;
  };
}

const EMPTY_SHA256 = createHash('sha256').update('').digest('hex');
const NUL = String.fromCharCode(0);

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Stable JSON: object keys sorted, so a hash never depends on insertion order. */
function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Derived content contains a non-finite number.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
  }
  throw new Error('Derived content must be JSON data.');
}

/** The inbox's query identity, reused for the legacy card's targetKey. */
export function queryKey(query: string): string {
  return query.trim().toLowerCase();
}

/** The V8 seal digest: judgmentIds + cardIds + operations + replay identity. */
export function computeSealDigest(input: {
  readonly judgmentIds: readonly string[];
  readonly cardIds: readonly string[];
  readonly operations: readonly ProposalOperation[];
  readonly replayIdentity: ReplayIdentity;
}): string {
  return sha256(canonicalJson({
    judgmentIds: [...input.judgmentIds].sort(),
    cardIds: [...input.cardIds].sort(),
    operations: input.operations,
    replayIdentity: input.replayIdentity,
  }));
}

/** The §02.6 content address: same votes → same key → the same card. */
export function computeCardId(kind: UpdateCardKind, query: string, targetKey: string, judgmentIds: readonly string[]): string {
  return sha256(canonicalJson({ kind, query, targetKey, judgmentIds: [...judgmentIds].sort() }));
}

interface OntologyConcept {
  readonly path: string;
  readonly sha256: string;
  readonly id: string;
  readonly label: string;
  readonly lexicon: readonly string[];
  readonly anchors: readonly { readonly locator: string; readonly sources: readonly RowOwner[]; readonly weight: number }[];
  readonly related: readonly string[];
}

const OWNER_VALUES: ReadonlySet<string> = new Set(['editorial', 'openbible', 'torrey', 'translation-variant', 'cross-reference', 'exposition']);

function parseOntologyFile(file: DeriveSourceFile): OntologyConcept {
  const document = parseDocument(file.contents, { prettyErrors: true, uniqueKeys: true });
  if (document.errors.length > 0 || document.warnings.length > 0) {
    throw new Error(`Ontology file ${file.path} is invalid YAML.`);
  }
  const value = document.toJS({ maxAliasCount: 0 }) as unknown;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Ontology file ${file.path} must contain a concept object.`);
  }
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || record.id.length === 0) throw new Error(`Ontology file ${file.path} has no concept id.`);
  const textArray = (input: unknown, label: string): string[] => {
    if (input === undefined) return [];
    if (!Array.isArray(input) || input.some((entry) => typeof entry !== 'string')) {
      throw new Error(`Ontology file ${file.path} ${label} must be a text array.`);
    }
    return input as string[];
  };
  const anchors = record.anchors === undefined ? [] : (() => {
    if (!Array.isArray(record.anchors)) throw new Error(`Ontology file ${file.path} anchors must be an array.`);
    return record.anchors.map((entry, index) => {
      if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
        throw new Error(`Ontology file ${file.path} anchors[${index}] must be an object.`);
      }
      const anchor = entry as Record<string, unknown>;
      const sources = textArray(anchor.sources, `anchors[${index}].sources`);
      if (typeof anchor.ref !== 'string' || sources.some((source) => !OWNER_VALUES.has(source))) {
        throw new Error(`Ontology file ${file.path} anchors[${index}] has invalid ref or sources.`);
      }
      if (anchor.weight !== undefined && (typeof anchor.weight !== 'number' || !Number.isFinite(anchor.weight))) {
        throw new Error(`Ontology file ${file.path} anchors[${index}].weight must be finite.`);
      }
      return { locator: anchor.ref, sources: sources as RowOwner[], weight: (anchor.weight as number | undefined) ?? 1 };
    });
  })();
  return {
    path: file.path,
    sha256: sha256(file.contents),
    id: record.id,
    label: typeof record.label === 'string' && record.label.length > 0 ? record.label : record.id,
    lexicon: textArray(record.lexicon, 'lexicon'),
    anchors,
    related: textArray(record.related, 'related'),
  };
}

interface WebSubsetShape {
  selection: { book: string; chapters?: number[]; verses?: string[]; why: string }[];
  [key: string]: unknown;
}

function chapterMembership(subset: WebSubsetShape): Map<number, Set<number>> {
  const memberChapters = new Map<number, Set<number>>();
  for (const selection of subset.selection) {
    const book = findBook(selection.book);
    if (!book) continue;
    const set = memberChapters.get(book.id) ?? new Set<number>();
    // Verse-level selections grant no chapter membership (compile parity).
    for (const chapter of selection.chapters ?? []) set.add(chapter);
    memberChapters.set(book.id, set);
  }
  return memberChapters;
}

interface GoldenFixtureFile {
  readonly path: string;
  readonly sha256: string;
  readonly value: Record<string, unknown>;
}

function verseIdOfTarget(targetId: string): number {
  return Number(targetId.split(':')[1]);
}

function identityNotesFor(record: JudgmentRecordV2, replay: ReplayIdentity): IdentityNote[] {
  const notes: IdentityNote[] = [];
  for (const dimension of ['engineVersion', 'corpusFingerprint', 'layerFingerprint'] as const) {
    if (record[dimension] !== replay[dimension]) {
      notes.push({ dimension, recorded: record[dimension], current: replay[dimension] });
    }
  }
  return notes;
}

function voteOf(record: JudgmentRecordV2): CardVote {
  return {
    judgmentId: record.judgmentId,
    caseId: record.caseId,
    at: record.at,
    reviewer: record.reviewer,
    action: record.action,
    ...(record.action === 'missing'
      ? { reference: record.reference! }
      : record.action === 'prefer'
        ? {
            preferredReference: referenceOfTargetId(record.preferredTargetId!),
            otherReference: referenceOfTargetId(record.otherTargetId!),
          }
        : { reference: referenceOfTargetId(record.targetId!) }),
    ...(record.withinTop === undefined ? {} : { withinTop: record.withinTop }),
    ...(record.observedRank === undefined ? {} : { observedRank: record.observedRank }),
    observedWindow: record.observedWindow,
    ...(record.diagnosis === undefined ? {} : { diagnosis: record.diagnosis }),
    ...(record.diagnosisInferred === undefined ? {} : { diagnosisInferred: record.diagnosisInferred }),
    ...(record.conceptId === undefined ? {} : { conceptId: record.conceptId }),
    ...(record.note === undefined ? {} : { note: record.note }),
    ...(record.excerpt === undefined ? {} : { excerpt: record.excerpt }),
    resultSetDigest: record.resultSetDigest,
    displayedWindowDigest: record.displayedWindowDigest,
    ...(record.reasonDigest === undefined ? {} : { reasonDigest: record.reasonDigest }),
  };
}

/** Deterministic theme chips (§03.3): lookups under the engine's tokenizer. */
function themeChipsFor(query: string, canonicalRef: string, concepts: readonly OntologyConcept[]): ThemeChip[] {
  const queryTokens = new Set(significantWords(query));
  const refRange = anchorRangeOf(canonicalRef, `theme chips for "${query}"`);
  const refStart = parseVerseId(refRange.start);
  const chips: ThemeChip[] = [];
  for (const concept of concepts) {
    const conceptTokens = new Set(concept.lexicon.flatMap((phrase) => significantWords(phrase)));
    let matchCount = 0;
    for (const token of queryTokens) {
      if (conceptTokens.has(token)) matchCount += 1;
    }
    const alreadyAnchored = concept.anchors.some((anchor) => {
      const range = (() => {
        try {
          return anchorRangeOf(anchor.locator, concept.id);
        } catch {
          return null;
        }
      })();
      if (range === null) return false;
      if (range.start <= refRange.end && refRange.start <= range.end) return true;
      // …or the anchor covers the reference's containing chapter.
      const start = parseVerseId(range.start);
      const end = parseVerseId(range.end);
      return start.bookId === refStart.bookId && start.chapter <= refStart.chapter && refStart.chapter <= end.chapter;
    });
    if (matchCount > 0 || alreadyAnchored) {
      chips.push({ conceptId: concept.id, label: concept.label, matchCount, alreadyAnchored });
    }
  }
  return chips.sort((left, right) => right.matchCount - left.matchCount || left.conceptId.localeCompare(right.conceptId));
}

/** The routed exit answer value for the theme question ("None of these"). */
export const THEME_ANSWER_NONE = 'needs-new-theme';

interface LeafAssertion {
  readonly leaf: JudgmentRecordV2;
  readonly kind: 'expectation' | 'guard' | 'preferred';
  /** Canonical range key, for conflict detection. */
  readonly rangeKey?: string;
  readonly range?: { start: number; end: number };
  readonly ref?: string;
  readonly withinTop?: WithinTop;
  readonly why?: string;
  readonly pair?: { above: string; below: string; withinTop: number; pairKey: string; reverseKey: string };
}

const LEXICAL_NOISE_FALLBACK = 'matched words, not meaning; judged not a fit for this query';

interface StopConversionSource {
  readonly train: TrainSnapshot;
  readonly manifest: ProposalManifest;
  readonly reportFindings: readonly { readonly message: string; readonly subjects: readonly string[]; readonly gate: string; readonly blocking: boolean }[];
  readonly stopEventIndex: number;
}

function reportFindingsOf(report: unknown): { message: string; subjects: string[]; gate: string; blocking: boolean }[] {
  if (typeof report !== 'object' || report === null) return [];
  const payload = (report as Record<string, unknown>).payload;
  if (typeof payload !== 'object' || payload === null) return [];
  const gates = (payload as Record<string, unknown>).gates;
  if (!Array.isArray(gates)) return [];
  const findings: { message: string; subjects: string[]; gate: string; blocking: boolean }[] = [];
  for (const gate of gates) {
    if (typeof gate !== 'object' || gate === null) continue;
    const gateRecord = gate as Record<string, unknown>;
    const gateId = typeof gateRecord.gate === 'string' ? gateRecord.gate : 'unknown-gate';
    const blocking = gateRecord.status === 'fail' || gateRecord.verdict === 'fail';
    if (!Array.isArray(gateRecord.findings)) continue;
    for (const finding of gateRecord.findings) {
      if (typeof finding !== 'object' || finding === null) continue;
      const findingRecord = finding as Record<string, unknown>;
      findings.push({
        message: typeof findingRecord.message === 'string' ? findingRecord.message : '',
        subjects: Array.isArray(findingRecord.subjects) ? findingRecord.subjects.map(String) : [],
        gate: gateId,
        blocking,
      });
    }
  }
  return findings;
}

/** The main entry: derive the full card set from one observed snapshot. */
export function deriveUpdates(inputs: DeriveUpdatesInputs): UpdatesDerivation {
  // ---- 0. Parse and pin every observed input (order-independent).
  const ontologyFiles = [...inputs.ontologyFiles].sort((a, b) => a.path.localeCompare(b.path));
  const goldenFiles = [...inputs.goldenFixtureFiles].sort((a, b) => a.path.localeCompare(b.path));
  const priorArtifacts = [...(inputs.priorTrainArtifacts ?? [])].sort((a, b) => a.trainId.localeCompare(b.trainId));

  const derivationDigest = sha256(canonicalJson({
    judgmentsLog: sha256(inputs.judgmentsLog),
    casesLog: inputs.casesLog === null ? null : sha256(inputs.casesLog),
    migrationManifest: inputs.migrationManifestJson === null ? null : sha256(inputs.migrationManifestJson),
    updatesLog: sha256(inputs.updatesLog),
    webSubset: sha256(inputs.webSubsetJson),
    ontology: ontologyFiles.map((file) => ({ path: file.path, sha256: sha256(file.contents) })),
    golden: goldenFiles.map((file) => ({ path: file.path, sha256: sha256(file.contents) })),
    replayIdentity: inputs.replayIdentity,
    priorTrains: priorArtifacts.map((entry) => ({
      trainId: entry.trainId,
      manifest: entry.sealedManifestJson === undefined ? null : sha256(entry.sealedManifestJson),
      report: entry.verifiedReportJson === undefined ? null : sha256(entry.verifiedReportJson),
    })),
  }));

  const records = inputs.judgmentsLog === '' ? [] : parseJudgmentLog(inputs.judgmentsLog);
  validateCasesForJudgments(records, {
    rawJudgmentsLog: inputs.judgmentsLog,
    casesJsonl: inputs.casesLog,
    migrationManifestJson: inputs.migrationManifestJson,
  });
  const v2Records = records.filter(isV2Judgment);
  const v2Leaves = activeV2Judgments(v2Records);
  const concepts = ontologyFiles.map(parseOntologyFile);
  const conceptsById = new Map(concepts.map((concept) => [concept.id, concept]));
  const subset = JSON.parse(inputs.webSubsetJson) as WebSubsetShape;
  const memberChapters = chapterMembership(subset);
  const golden: GoldenFixtureFile[] = goldenFiles.map((file) => ({
    path: file.path,
    sha256: sha256(file.contents),
    value: JSON.parse(file.contents) as Record<string, unknown>,
  }));
  const goldenBySlug = new Map(golden.map((file) => {
    const name = file.path.split('/').at(-1)!;
    return [name.endsWith('.json') ? name.slice(0, -'.json'.length) : name, file] as const;
  }));
  const fold = foldUpdatesLog(inputs.updatesLog);

  const sameReplayIdentity = (record: JudgmentRecordV2): boolean =>
    record.engineVersion === inputs.replayIdentity.engineVersion &&
    record.corpusFingerprint === inputs.replayIdentity.corpusFingerprint &&
    record.layerFingerprint === inputs.replayIdentity.layerFingerprint;

  const cards: Omit<UpdateCard, 'cardRevision' | 'state' | 'parkedByDefault'>[] = [];

  // ---- 1. The single legacy re-confirmation card (§07.2, V2 rule 2).
  // Derives if and only if zero v2 judgments EXIST on the query — existence,
  // not effectiveness: even a superseded v2 vote proves the fresh look
  // happened. The v1 lines are byte-frozen input to this one card and
  // nothing else; no code path below reads a v1 line as an operation source.
  if (inputs.migrationManifestJson !== null) {
    const manifest = validateLegacyMigrationManifest(JSON.parse(inputs.migrationManifestJson));
    for (const legacyCase of manifest.cases) {
      const query = String(legacyCase.entries[0]?.judgment.query ?? '');
      if (query === '') continue;
      if (v2Records.some((record) => record.query === query)) continue;
      const lineHashes = legacyCase.entries.map((entry) => entry.lineSha256).sort();
      cards.push({
        cardId: computeCardId('re-confirmation', query, queryKey(query), lineHashes),
        kind: 're-confirmation',
        query,
        targetKey: queryKey(query),
        judgmentIds: lineHashes,
        contextJudgmentIds: [],
        votes: legacyCase.entries.map((entry) => ({
          at: String(entry.judgment.at ?? ''),
          reviewer: String(entry.judgment.reviewer ?? ''),
          reference: typeof entry.judgment.reference === 'string' ? entry.judgment.reference : undefined,
          note: typeof entry.judgment.note === 'string' ? entry.judgment.note : undefined,
        })),
        derived: {},
        preCheck: 'identity-moved',
        identityNotes: [],
        legacy: { lineHashes },
      });
    }
  }

  // ---- 2. Group v2 leaves per query; helpful leaves become context only.
  const leavesByQuery = new Map<string, JudgmentRecordV2[]>();
  for (const leaf of v2Leaves) {
    const group = leavesByQuery.get(leaf.query) ?? [];
    group.push(leaf);
    leavesByQuery.set(leaf.query, group);
  }

  for (const query of [...leavesByQuery.keys()].sort()) {
    const leaves = leavesByQuery.get(query)!;
    const slug = slugOf(query);
    const helpfulLeaves = leaves.filter((leaf) => leaf.action === 'helpful');
    const deriving = leaves.filter((leaf) => leaf.action !== 'helpful');
    const ownedFixture = goldenBySlug.get(slug);
    const handWritten = ownedFixture !== undefined && ownedFixture.value.generatedBy !== 'workbench';

    // 2a. Per-leaf assertions (the V3 mapping table, expectation half).
    const assertions: LeafAssertion[] = [];
    const routedLeaves = new Map<string, string>();
    for (const leaf of deriving) {
      if (leaf.action === 'essential') {
        const ref = referenceOfTargetId(leaf.targetId!);
        const range = anchorRangeOf(ref, `judgment ${leaf.judgmentId}`);
        assertions.push({ leaf, kind: 'expectation', ref, range, rangeKey: `${range.start}:${range.end}`, withinTop: leaf.withinTop! });
      } else if (leaf.action === 'missing') {
        let ref: string;
        try {
          ref = canonicalReferenceOf(leaf.reference!, `judgment ${leaf.judgmentId}`);
        } catch {
          // Refusals are routed, never dropped (§02.3(c)): a reference that
          // cannot canonicalize to a single-chapter range goes to curation.
          routedLeaves.set(
            leaf.judgmentId,
            'The suggested passage spans more than one chapter, so it needs hand curation before the answer sheet can carry it.',
          );
          continue;
        }
        const range = anchorRangeOf(ref, `judgment ${leaf.judgmentId}`);
        assertions.push({ leaf, kind: 'expectation', ref, range, rangeKey: `${range.start}:${range.end}`, withinTop: leaf.withinTop! });
      } else if (leaf.action === 'irrelevant') {
        const ref = referenceOfTargetId(leaf.targetId!);
        const range = anchorRangeOf(ref, `judgment ${leaf.judgmentId}`);
        const why = leaf.note ?? (leaf.diagnosis === 'lexical-noise' ? LEXICAL_NOISE_FALLBACK : leaf.diagnosis!);
        assertions.push({ leaf, kind: 'guard', ref, range, rangeKey: `${range.start}:${range.end}`, why });
      } else if (leaf.action === 'prefer') {
        const above = referenceOfTargetId(leaf.preferredTargetId!);
        const below = referenceOfTargetId(leaf.otherTargetId!);
        const aboveRange = anchorRangeOf(above, `judgment ${leaf.judgmentId}`);
        const belowRange = anchorRangeOf(below, `judgment ${leaf.judgmentId}`);
        const aboveKey = `${aboveRange.start}:${aboveRange.end}`;
        const belowKey = `${belowRange.start}:${belowRange.end}`;
        assertions.push({
          leaf,
          kind: 'preferred',
          pair: {
            above,
            below,
            withinTop: leaf.observedWindow,
            pairKey: `${aboveKey}${NUL}${belowKey}`,
            reverseKey: `${belowKey}${NUL}${aboveKey}`,
          },
        });
      }
    }

    // 2b. Conflict detection (V10): the classes compile hard-errors on become
    // conflict cards — presented, never resolved mechanically, never dropped.
    const conflictPairs: [LeafAssertion, LeafAssertion, string][] = [];
    for (let left = 0; left < assertions.length; left += 1) {
      for (let right = left + 1; right < assertions.length; right += 1) {
        const a = assertions[left]!;
        const b = assertions[right]!;
        if (a.leaf.judgmentId === b.leaf.judgmentId) continue;
        if (a.kind === 'expectation' && b.kind === 'expectation') {
          if (a.rangeKey === b.rangeKey && a.withinTop !== b.withinTop) {
            conflictPairs.push([a, b, 'conflicting rank windows']);
          } else if (a.rangeKey !== b.rangeKey && a.range!.start <= b.range!.end && b.range!.start <= a.range!.end) {
            conflictPairs.push([a, b, 'overlapping expected passages']);
          }
        } else if (a.kind === 'guard' && b.kind === 'guard') {
          if (a.rangeKey === b.rangeKey && a.why !== b.why) {
            conflictPairs.push([a, b, 'conflicting must-not-rank explanations']);
          } else if (a.rangeKey !== b.rangeKey && a.range!.start <= b.range!.end && b.range!.start <= a.range!.end) {
            conflictPairs.push([a, b, 'overlapping excluded passages']);
          }
        } else if ((a.kind === 'expectation' && b.kind === 'guard') || (a.kind === 'guard' && b.kind === 'expectation')) {
          if (a.range!.start <= b.range!.end && b.range!.start <= a.range!.end) {
            conflictPairs.push([a, b, 'a passage both expected and excluded']);
          }
        } else if (a.kind === 'preferred' && b.kind === 'preferred') {
          if (a.pair!.pairKey === b.pair!.reverseKey) {
            conflictPairs.push([a, b, 'contradictory orderings of the same pair']);
          } else if (a.pair!.pairKey === b.pair!.pairKey && a.pair!.withinTop !== b.pair!.withinTop) {
            conflictPairs.push([a, b, 'conflicting ordering windows']);
          }
        }
      }
    }
    const conflicted = new Set<string>();
    for (const [a, b] of conflictPairs) {
      conflicted.add(a.leaf.judgmentId);
      conflicted.add(b.leaf.judgmentId);
    }

    const helpfulFor = (targetKeys: readonly string[]): string[] =>
      helpfulLeaves
        .filter((leaf) => targetKeys.includes(v2SupersessionKey(leaf)) || targetKeys.includes(`target:${leaf.targetId ?? ''}`))
        .map((leaf) => leaf.judgmentId)
        .sort();

    const sideSummary = (assertion: LeafAssertion): string => {
      if (assertion.kind === 'expectation') {
        return `${assertion.ref} expected in the top ${assertion.withinTop}`;
      }
      if (assertion.kind === 'guard') return `${assertion.ref} kept out of results`;
      return `${assertion.pair!.above} preferred above ${assertion.pair!.below}`;
    };

    for (const [a, b, why] of conflictPairs) {
      const ids = [a.leaf.judgmentId, b.leaf.judgmentId].sort();
      const targetKey = [v2SupersessionKey(a.leaf), v2SupersessionKey(b.leaf)].sort().join(NUL);
      cards.push({
        cardId: computeCardId('conflict', query, targetKey, ids),
        kind: 'conflict',
        query,
        targetKey,
        judgmentIds: ids,
        contextJudgmentIds: helpfulFor([v2SupersessionKey(a.leaf), v2SupersessionKey(b.leaf)]),
        votes: [voteOf(a.leaf), voteOf(b.leaf)],
        derived: {},
        preCheck: 'current',
        identityNotes: [],
        conflict: {
          sides: [
            { judgmentIds: [a.leaf.judgmentId], summary: sideSummary(a), votes: [voteOf(a.leaf)] },
            { judgmentIds: [b.leaf.judgmentId], summary: sideSummary(b), votes: [voteOf(b.leaf)] },
          ],
        },
        ...(handWritten
          ? { routed: { to: 'concept-curation' as const, reason: 'This search has a hand-curated answer sheet; changes route to curation.' } }
          : {}),
      });
    }

    // 2c. Ordinary cards for non-conflicting leaves, merged per (kind, key).
    interface CardSeed {
      kind: UpdateCardKind;
      targetKey: string;
      leaves: JudgmentRecordV2[];
      derived: DerivedCardConsequences;
      question?: CardQuestion;
      routedReason?: string;
      alreadyInPlace?: boolean;
    }
    const seeds = new Map<string, CardSeed>();
    const addSeed = (seed: CardSeed): void => {
      const key = `${seed.kind}${NUL}${seed.targetKey}`;
      const existing = seeds.get(key);
      if (existing === undefined) {
        seeds.set(key, seed);
      } else {
        existing.leaves.push(...seed.leaves);
      }
    };

    const fixtureHasExpectation = (rangeKey: string, withinTop: number): boolean => {
      if (ownedFixture === undefined || handWritten) return false;
      const expectedTop = ownedFixture.value.expectedTop;
      if (!Array.isArray(expectedTop)) return false;
      return expectedTop.some((entry) => {
        if (typeof entry !== 'object' || entry === null) return false;
        const reference = (entry as Record<string, unknown>).ref ?? (entry as Record<string, unknown>).reference;
        if (typeof reference !== 'string') return false;
        try {
          const range = anchorRangeOf(reference, 'owned fixture');
          return `${range.start}:${range.end}` === rangeKey &&
            (((entry as Record<string, unknown>).withinTop ?? 10) === withinTop);
        } catch {
          return false;
        }
      });
    };
    const fixtureHasGuard = (rangeKey: string): boolean => {
      if (ownedFixture === undefined || handWritten) return false;
      const mustNotRank = ownedFixture.value.mustNotRank;
      if (!Array.isArray(mustNotRank)) return false;
      return mustNotRank.some((entry) => {
        if (typeof entry !== 'object' || entry === null) return false;
        const reference = (entry as Record<string, unknown>).ref ?? (entry as Record<string, unknown>).reference;
        if (typeof reference !== 'string') return false;
        try {
          const range = anchorRangeOf(reference, 'owned fixture');
          return `${range.start}:${range.end}` === rangeKey;
        } catch {
          return false;
        }
      });
    };

    for (const assertion of assertions) {
      const leaf = assertion.leaf;
      if (conflicted.has(leaf.judgmentId)) continue;
      const identityMoved = !sameReplayIdentity(leaf);
      const targetKey = v2SupersessionKey(leaf);

      if (assertion.kind === 'expectation') {
        // Intent classes (missing, essential) survive an identity move: the
        // card derives normally at derive time — whether the expectation is
        // already achieved is a ranking question only the seal replay can
        // answer (02.5 disposition 1). The per-dimension notes attach below.
        void identityMoved;
        // The canonical reference is single-chapter by construction, so the
        // membership lookup is one (book, chapter) pair (compile parity).
        const start = parseVerseId(assertion.range!.start);
        const book = BOOKS[start.bookId - 1];
        const chapterOutsideSubset = !(memberChapters.get(start.bookId)?.has(start.chapter) ?? false);
        const isMissing = leaf.action === 'missing';
        addSeed({
          kind: isMissing ? 'missing-passage' : 'expectation',
          targetKey,
          leaves: [leaf],
          derived: {
            expectation: { ref: assertion.ref!, withinTop: assertion.withinTop! },
            ...(chapterOutsideSubset && book !== undefined
              ? { chapterAdd: { book: book.name, chapter: start.chapter } }
              : {}),
            ...(isMissing && !handWritten ? { anchorAddOnAnswer: { weight: 1 as const } } : {}),
          },
          ...(isMissing && !handWritten
            ? { question: { id: 'theme' as const, prompt: 'Which theme should carry this passage?' as const, chips: themeChipsFor(query, assertion.ref!, concepts) } }
            : {}),
          ...(handWritten ? { routedReason: 'hand-written fixture' } : {}),
          ...(fixtureHasExpectation(assertion.rangeKey!, assertion.withinTop!) ? { alreadyInPlace: true } : {}),
        });
      } else if (assertion.kind === 'guard') {
        // Row 3/4: the mustNotRank guard ALWAYS derives — a demotion guard is
        // regression protection whether or not the offender still ranks
        // (02.5 disposition 3; the pre-check never withholds it, §03.5).
        const diagnosis = leaf.diagnosis!;
        const anchorAffecting = ANCHOR_AFFECTING_CAUSES.includes(diagnosis);
        let derived: DerivedCardConsequences = { guard: { ref: assertion.ref!, why: assertion.why! } };
        let kind: UpdateCardKind = 'guard';
        if (anchorAffecting && !handWritten) {
          const concept = conceptsById.get(leaf.conceptId!);
          const verse = verseIdOfTarget(leaf.targetId!);
          const namedAnchor = concept?.anchors.find((anchor) => {
            try {
              const range = anchorRangeOf(anchor.locator, concept.id);
              return range.start <= verse && verse <= range.end;
            } catch {
              return false;
            }
          });
          if (namedAnchor !== undefined) {
            const editorialOnly = namedAnchor.sources.length === 1 && namedAnchor.sources[0] === 'editorial';
            if (editorialOnly && !identityMoved) {
              // The vote itself names the data row; ownership permits the edit.
              kind = 'guard-and-anchor';
              derived = { ...derived, anchorRemove: { conceptId: concept!.id, locator: namedAnchor.locator } };
            } else if (editorialOnly && identityMoved) {
              // §03.5: the anchor arm rests on a current observation — it
              // routes to a separate re-confirmation card; the guard stays.
              cards.push({
                cardId: computeCardId('re-confirmation', query, targetKey, [leaf.judgmentId]),
                kind: 're-confirmation',
                query,
                targetKey,
                judgmentIds: [leaf.judgmentId],
                contextJudgmentIds: helpfulFor([targetKey]),
                votes: [voteOf(leaf)],
                derived: {},
                preCheck: 'identity-moved',
                identityNotes: identityNotesFor(leaf, inputs.replayIdentity),
              });
            } else {
              // Source-owned: the fixture guard does the demotion; the row
              // stays on record with its owner (covenant #6 / A5).
              derived = {
                ...derived,
                sourceOwnedAnchor: { conceptId: concept!.id, locator: namedAnchor.locator, sources: namedAnchor.sources },
              };
            }
          }
        }
        addSeed({
          kind,
          targetKey,
          leaves: [leaf],
          derived,
          ...(handWritten ? { routedReason: 'hand-written fixture' } : {}),
          ...(fixtureHasGuard(assertion.rangeKey!) ? { alreadyInPlace: true } : {}),
        });
      } else {
        // prefer: bound to a displayed pair — an identity move routes the
        // whole ordering entry to re-confirmation (§03.5); otherwise it is a
        // pure expectation.
        if (identityMoved) {
          cards.push({
            cardId: computeCardId('re-confirmation', query, targetKey, [leaf.judgmentId]),
            kind: 're-confirmation',
            query,
            targetKey,
            judgmentIds: [leaf.judgmentId],
            contextJudgmentIds: helpfulFor([targetKey]),
            votes: [voteOf(leaf)],
            derived: {},
            preCheck: 'identity-moved',
            identityNotes: identityNotesFor(leaf, inputs.replayIdentity),
          });
        } else {
          addSeed({
            kind: 'expectation',
            targetKey,
            leaves: [leaf],
            derived: {
              preferredOrder: { above: assertion.pair!.above, below: assertion.pair!.below, withinTop: assertion.pair!.withinTop },
            },
            ...(handWritten ? { routedReason: 'hand-written fixture' } : {}),
          });
        }
      }
    }

    // Routed missing leaves (uncanonicalizable): a card with no operations.
    for (const [judgmentId, reason] of routedLeaves) {
      const leaf = deriving.find((entry) => entry.judgmentId === judgmentId)!;
      const targetKey = v2SupersessionKey(leaf);
      cards.push({
        cardId: computeCardId('missing-passage', query, targetKey, [judgmentId]),
        kind: 'missing-passage',
        query,
        targetKey,
        judgmentIds: [judgmentId],
        contextJudgmentIds: helpfulFor([targetKey]),
        votes: [voteOf(leaf)],
        derived: {},
        preCheck: sameReplayIdentity(leaf) ? 'current' : 'identity-moved',
        identityNotes: identityNotesFor(leaf, inputs.replayIdentity),
        routed: { to: 'concept-curation', reason },
      });
    }

    for (const seed of seeds.values()) {
      const sortedLeaves = [...seed.leaves].sort((a, b) => a.judgmentId.localeCompare(b.judgmentId));
      const judgmentIds = sortedLeaves.map((leaf) => leaf.judgmentId);
      const identityNotes = sortedLeaves.flatMap((leaf) => identityNotesFor(leaf, inputs.replayIdentity));
      const dedupedNotes = [...new Map(identityNotes.map((note) => [`${note.dimension}${NUL}${note.recorded}`, note])).values()]
        .sort((a, b) => a.dimension.localeCompare(b.dimension) || a.recorded.localeCompare(b.recorded));
      cards.push({
        cardId: computeCardId(seed.kind, query, seed.targetKey, judgmentIds),
        kind: seed.kind,
        query,
        targetKey: seed.targetKey,
        judgmentIds,
        contextJudgmentIds: helpfulFor([seed.targetKey]),
        votes: sortedLeaves.map(voteOf),
        derived: seed.derived,
        ...(seed.question === undefined ? {} : { question: seed.question }),
        preCheck: dedupedNotes.length > 0 ? 'identity-moved' : 'current',
        identityNotes: dedupedNotes,
        ...(seed.routedReason === undefined
          ? {}
          : {
              routed: {
                to: 'concept-curation' as const,
                reason: 'This search has a hand-curated answer sheet, so changes to it route to curation instead of deriving here.',
              },
            }),
        ...(seed.alreadyInPlace === true ? { alreadyInPlace: true } : {}),
      });
    }
  }

  // ---- 3. Stop conversion (§03.8): a prior train's recorded finding becomes
  // a needs-engineering card at the NEXT derivation — file reads over pinned
  // artifacts, cross-checked, never trusted blind. Fail-closed: a pin that
  // does not verify converts nothing and is reported unverifiable.
  const unverifiable: UnverifiablePriorTrain[] = [];
  const conversionSources: StopConversionSource[] = [];
  const artifactsByTrain = new Map(priorArtifacts.map((entry) => [entry.trainId, entry]));
  for (const train of fold.trains) {
    if (train.state !== 'stopped' || train.sealed === undefined) continue;
    const stop = train.stopped!;
    const relevant = ['engineering-required', 'outside-allowlist', 'verify-failed', 'no-measurable-effect'].includes(stop.reason);
    if (!relevant) continue;
    const artifacts = artifactsByTrain.get(train.trainId);
    if (artifacts?.sealedManifestJson === undefined) {
      unverifiable.push({ trainId: train.trainId, reason: 'sealed manifest not located' });
      continue;
    }
    let manifest: ProposalManifest;
    try {
      manifest = normalizeProposalManifest(parseProposalManifest(JSON.parse(artifacts.sealedManifestJson)));
    } catch {
      unverifiable.push({ trainId: train.trainId, reason: 'sealed manifest does not parse' });
      continue;
    }
    const recomputedSeal = computeSealDigest({
      judgmentIds: train.sealed.judgmentIds,
      cardIds: train.sealed.cardIds,
      operations: manifest.operations,
      replayIdentity: train.sealed.replayIdentity,
    });
    if (recomputedSeal !== train.sealed.sealDigest) {
      unverifiable.push({ trainId: train.trainId, reason: 'seal digest does not recompute over the located manifest' });
      continue;
    }
    if (stop.reason === 'engineering-required' || stop.reason === 'outside-allowlist') {
      // Arm (a): cross-check the refused operations by re-running the checks
      // that refused them. A manifest that parses under the strict parser has
      // no off-allowlist operation, so a confirmation here is unreachable for
      // deriver-built manifests — defense-in-depth stays fail-closed.
      unverifiable.push({
        trainId: train.trainId,
        reason: 'refused operations could not be re-confirmed against the located manifest',
      });
      continue;
    }
    if (stop.reportDigest === undefined) {
      unverifiable.push({ trainId: train.trainId, reason: 'stop event pins no verified report' });
      continue;
    }
    if (artifacts.verifiedReportJson === undefined || sha256(artifacts.verifiedReportJson) !== stop.reportDigest) {
      unverifiable.push({ trainId: train.trainId, reason: 'verified report missing or does not match its pinned digest' });
      continue;
    }
    let report: unknown;
    try {
      report = JSON.parse(artifacts.verifiedReportJson);
    } catch {
      unverifiable.push({ trainId: train.trainId, reason: 'verified report is not valid JSON' });
      continue;
    }
    const stopEventIndex = fold.events.findIndex((event) => event.kind === 'train-stopped' && event.trainId === train.trainId);
    conversionSources.push({ train, manifest, reportFindings: reportFindingsOf(report), stopEventIndex });
  }

  // Arm (b): a pinned verified report showing a card's own fixture assertion
  // still failing, while the card's mapping row derives no further data
  // operation (guard cards — row 3 by construction, row 4's source-owned arm).
  const converted: Omit<UpdateCard, 'cardRevision' | 'state' | 'parkedByDefault'>[] = [];
  for (const source of conversionSources) {
    for (const card of cards) {
      if (card.kind !== 'guard') continue;
      if (card.derived.anchorRemove !== undefined) continue;
      const slug = slugOf(card.query);
      const failing = source.reportFindings.find((finding) =>
        finding.blocking && (finding.subjects.includes(slug) || finding.message.includes(slug) || finding.message.includes(`"${card.query}"`)),
      );
      if (failing === undefined) continue;
      converted.push({
        cardId: computeCardId('needs-engineering', card.query, card.targetKey, card.judgmentIds),
        kind: 'needs-engineering',
        query: card.query,
        targetKey: card.targetKey,
        judgmentIds: card.judgmentIds,
        contextJudgmentIds: card.contextJudgmentIds,
        votes: card.votes,
        derived: {},
        preCheck: card.preCheck,
        identityNotes: card.identityNotes,
        engineering: {
          trainId: source.train.trainId,
          stopReason: source.train.stopped!.reason,
          reportDigest: source.train.stopped!.reportDigest,
          finding: failing.message !== '' ? failing.message : `${failing.gate} reported this check still failing.`,
        },
      });
    }
  }
  cards.push(...converted);

  // ---- 3c. Live observation (§03.6): a sealed (unstopped) guard train whose
  // manifest LANDED — every fixture the seal wrote is present,
  // byte-for-content, in the observed golden files — finished; its cards are
  // consumed and rest as achieved. Same §03.2 join discipline as the stop
  // conversion (locate, recompute the seal digest, compare), fail-closed:
  // anything that does not verify leaves the train merely riding. Pure over
  // the snapshot — the golden files are already inputs.
  const goldenByPath = new Map(inputs.goldenFixtureFiles.map((file) => [file.path, file.contents]));
  const landedTrains = new Set<string>();
  for (const train of fold.trains) {
    if (train.state !== 'sealed' || train.flavor !== 'guard' || train.sealed === undefined) continue;
    const artifacts = artifactsByTrain.get(train.trainId);
    if (artifacts?.sealedManifestJson === undefined) continue;
    let manifest: ProposalManifest;
    try {
      manifest = normalizeProposalManifest(parseProposalManifest(JSON.parse(artifacts.sealedManifestJson)));
    } catch {
      continue;
    }
    const recomputedSeal = computeSealDigest({
      judgmentIds: train.sealed.judgmentIds,
      cardIds: train.sealed.cardIds,
      operations: manifest.operations,
      replayIdentity: train.sealed.replayIdentity,
    });
    if (recomputedSeal !== train.sealed.sealDigest) continue;
    if (manifest.operations.length === 0) continue;
    const landed = manifest.operations.every((operation) => {
      if (operation.type !== 'golden-fixture-upsert') return false;
      const contents = goldenByPath.get(`eval/golden/${operation.goldenFixtureId}.json`);
      if (contents === undefined) return false;
      try {
        return canonicalJson(JSON.parse(contents)) === canonicalJson(operation.fixture);
      } catch {
        return false;
      }
    });
    if (landed) landedTrains.add(train.trainId);
  }

  // ---- 4. Fold decisions and derived defaults onto the cards.
  const finished: UpdateCard[] = cards.map((card) => {
    const decision = fold.decisions.get(card.cardId);
    const state: CardState = decision === undefined
      ? { decision: 'drafted' }
      : {
          decision: decision.decision,
          decidedAt: decision.decidedAt,
          ...(decision.answers === undefined ? {} : { answers: decision.answers }),
          ...(decision.reason === undefined ? {} : { declineReason: decision.reason }),
          ...(decision.sealedInTrain === undefined ? {} : { sealedInTrain: decision.sealedInTrain }),
          ...(decision.sealedInTrain !== undefined && landedTrains.has(decision.sealedInTrain) ? { sealedTrainLive: true as const } : {}),
        };
    // FM-5 parked-by-default: after a no-measurable-effect stop, a card that
    // was sealed in the stopped attempt, re-derived unchanged at the same
    // replay identity, boards no seal until a decide event postdating the
    // stop (a derived state — the log still folds to its decisions; no
    // machine-written decide event exists).
    let parkedByDefault = false;
    for (const source of conversionSources) {
      const stop = source.train.stopped!;
      if (stop.reason !== 'no-measurable-effect') continue;
      if (!source.train.sealed!.cardIds.includes(card.cardId)) continue;
      const identityUnchanged = canonicalJson(source.train.sealed!.replayIdentity) === canonicalJson(inputs.replayIdentity);
      if (!identityUnchanged) continue;
      const lastDecideIndex = fold.events.reduce(
        (latest, event, index) =>
          (event.kind === 'card-approved' || event.kind === 'card-declined' || event.kind === 'card-parked') && event.cardId === card.cardId
            ? index
            : latest,
        -1,
      );
      if (lastDecideIndex > source.stopEventIndex) continue;
      parkedByDefault = true;
    }
    const revisionSource = {
      kind: card.kind,
      query: card.query,
      targetKey: card.targetKey,
      judgmentIds: card.judgmentIds,
      contextJudgmentIds: card.contextJudgmentIds,
      votes: card.votes,
      derived: card.derived,
      question: card.question ?? null,
      preCheck: card.preCheck,
      identityNotes: card.identityNotes,
      routed: card.routed ?? null,
      conflict: card.conflict ?? null,
      legacy: card.legacy ?? null,
      engineering: card.engineering ?? null,
      alreadyInPlace: card.alreadyInPlace ?? false,
    };
    return {
      ...card,
      cardRevision: sha256(canonicalJson(revisionSource)),
      ...(parkedByDefault ? { parkedByDefault: true } : {}),
      state,
    };
  });

  const kindOrder = new Map(UPDATE_CARD_KINDS.map((kind, index) => [kind, index]));
  finished.sort((left, right) =>
    slugOf(left.query).localeCompare(slugOf(right.query)) ||
    kindOrder.get(left.kind)! - kindOrder.get(right.kind)! ||
    left.targetKey.localeCompare(right.targetKey) ||
    left.cardId.localeCompare(right.cardId));

  // The tally counts op-bearing cards only: re-confirmation and conflict
  // cards queue no change, and the legacy card's "approved" is a transient
  // fresh-look state (§07.2), so none of them belong in "approved and
  // waiting" (§04 §4.2 owns the rendering).
  const opBearing = finished.filter((card) =>
    card.kind !== 're-confirmation' && card.kind !== 'conflict' && card.kind !== 'needs-engineering' && card.routed === undefined);
  const tally = {
    drafted: opBearing.filter((card) => card.state.decision === 'drafted').length,
    // A card whose sealing train landed is achieved, not "approved and
    // waiting" — it never re-counts (§03.6's consumed rule).
    approved: opBearing.filter((card) => card.state.decision === 'approved' && card.parkedByDefault !== true && card.state.sealedTrainLive !== true).length,
    declined: opBearing.filter((card) => card.state.decision === 'declined').length,
    parked: opBearing.filter((card) => card.state.decision === 'parked' || card.parkedByDefault === true).length,
  };

  return {
    cards: finished,
    derivationDigest,
    replayIdentity: inputs.replayIdentity,
    trains: fold.trains,
    unverifiablePriorTrains: unverifiable.sort((a, b) => a.trainId.localeCompare(b.trainId)),
    tally,
  };
}

// ---------------------------------------------------------------------------
// Manifest emission: approved cards → one schema-v1 ProposalManifest.
// CLI/API only in Phase 1 — the seal endpoint arrives with Phase 2 (D8) and
// will call exactly this function after its re-derive-and-compare.
// ---------------------------------------------------------------------------

export class UpdatesManifestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpdatesManifestError';
  }
}

function evidenceOf(votes: readonly CardVote[], answerNote?: string): string {
  const parts = votes
    .filter((vote) => vote.judgmentId !== undefined)
    .map((vote) => {
      const pieces = [
        `judgment ${vote.judgmentId}`,
        `${vote.action}${vote.diagnosis === undefined ? '' : ` (${vote.diagnosis})`}`,
        vote.reference !== undefined
          ? `on ${vote.reference}`
          : `preferring ${vote.preferredReference} over ${vote.otherReference}`,
        vote.observedRank === null || vote.observedRank === undefined
          ? `not in the displayed top ${vote.observedWindow}`
          : `observed at rank ${vote.observedRank} of ${vote.observedWindow}`,
        vote.note !== undefined ? `note: "${vote.note}"` : vote.excerpt !== undefined ? `text: "${vote.excerpt}"` : '',
        `display ${vote.resultSetDigest}/${vote.displayedWindowDigest}${vote.reasonDigest === undefined ? '' : `/${vote.reasonDigest}`}`,
      ].filter((piece) => piece !== '');
      return pieces.join('; ');
    });
  return `${parts.join(' | ')}${answerNote === undefined ? '' : ` | ${answerNote}`}`;
}

export interface BuildManifestOptions {
  readonly trainId: string;
}

export interface UpdatesManifestResult {
  readonly manifest: ProposalManifest;
  readonly digest: string;
  readonly cardIds: readonly string[];
  readonly judgmentIds: readonly string[];
}

/**
 * Builds the train's ProposalManifest from the derivation's APPROVED
 * op-bearing cards. With the 02.7 per-operation fixture-targeting amendment
 * (D8a) in place, a multi-query approval set ships as ONE manifest — one
 * `golden-fixture-upsert` per touched query, the top-level fixtureId set to
 * the lexicographically first touched fixture id (a label, per 02.7).
 */
export function buildUpdatesManifest(
  derivation: UpdatesDerivation,
  inputs: DeriveUpdatesInputs,
  options: BuildManifestOptions,
): UpdatesManifestResult {
  const boarding = derivation.cards.filter((card) =>
    card.state.decision === 'approved' &&
    // §03.6's consumed rule: a judgment is consumed exactly when it appears
    // in a sealed train's seal event. A card frozen by a live seal —
    // whether that train is still running or already merged — NEVER
    // re-boards; the fold clears the freeze only when the train stops. Its
    // shipped rows survive through the file-level row merge below without
    // the card riding again.
    card.state.sealedInTrain === undefined &&
    card.parkedByDefault !== true &&
    card.routed === undefined &&
    (card.kind === 'expectation' || card.kind === 'guard' || card.kind === 'guard-and-anchor' || card.kind === 'missing-passage'));
  if (boarding.length === 0) {
    throw new UpdatesManifestError('No approved cards carry a change to seal.');
  }
  const queries = [...new Set(boarding.map((card) => card.query))].sort((a, b) => slugOf(a).localeCompare(slugOf(b)));

  const goldenFiles = [...inputs.goldenFixtureFiles].sort((a, b) => a.path.localeCompare(b.path));
  const concepts = [...inputs.ontologyFiles].sort((a, b) => a.path.localeCompare(b.path)).map(parseOntologyFile);
  const conceptsById = new Map(concepts.map((concept) => [concept.id, concept]));

  const reviewer = boarding[0]!.votes.find((vote) => vote.judgmentId !== undefined)?.reviewer ?? 'jesse';
  const operations: Record<string, unknown>[] = [];
  const preconditions = new Map<string, string>();
  const caseIds = new Set<string>();

  const targetDigest = (targetKey: string): string => sha256(targetKey).slice(0, 8);

  for (const query of queries) {
    const slug = slugOf(query);
    const queryCards = boarding.filter((card) => card.query === query);
    // Conflicts block the query, not the train (§03.7): a conflict card exists
    // exactly as long as the contradictory leaves do, and it is resolved only
    // by a recorded pick (a superseding vote) — never by a decide here.
    const conflicts = derivation.cards.filter((card) => card.kind === 'conflict' && card.query === query);
    if (conflicts.length > 0) {
      throw new UpdatesManifestError('Two calls on this search still disagree; the conflict card must be decided first.');
    }
    const ownedFixturePath = `eval/golden/${slug}.json`;
    const existing = goldenFiles.find((file) => file.path === ownedFixturePath);
    const existingValue = existing === undefined ? undefined : JSON.parse(existing.contents) as Record<string, unknown>;
    if (existingValue !== undefined && existingValue.generatedBy !== 'workbench') {
      throw new UpdatesManifestError('This search has a hand-curated answer sheet; it routes to curation.');
    }
    const expectedTop: Record<string, unknown>[] = [];
    const mustNotRank: Record<string, unknown>[] = [];
    const preferredOrder: Record<string, unknown>[] = [];

    for (const card of queryCards) {
      for (const vote of card.votes) {
        if (vote.caseId !== undefined) caseIds.add(vote.caseId);
      }
      if (card.derived.expectation !== undefined) {
        const answers = card.state.answers;
        const themeAnswer = answers?.theme;
        if (card.question !== undefined && (themeAnswer === undefined || themeAnswer === '')) {
          throw new UpdatesManifestError('An approved card with an open question must carry its answer.');
        }
        const chosenConcept = themeAnswer !== undefined && themeAnswer !== THEME_ANSWER_NONE
          ? conceptsById.get(themeAnswer)
          : undefined;
        if (themeAnswer !== undefined && themeAnswer !== THEME_ANSWER_NONE && chosenConcept === undefined) {
          throw new UpdatesManifestError('The answered theme does not exist in the reviewed ontology snapshot.');
        }
        expectedTop.push({
          ref: card.derived.expectation.ref,
          withinTop: card.derived.expectation.withinTop,
          // A6: an answered theme upgrades the expectation to assert the
          // REASON, not just the presence — the right passage for the wrong
          // reason is still a failure.
          ...(chosenConcept === undefined
            ? {}
            : { requiredReasonFamily: 'concept_anchor', requiredReasonLabel: `Theme: ${chosenConcept.label}` }),
        });
        if (chosenConcept !== undefined) {
          const alreadyAnchored = chosenConcept.anchors.some((anchor) => {
            try {
              const range = anchorRangeOf(anchor.locator, chosenConcept.id);
              const target = anchorRangeOf(card.derived.expectation!.ref, chosenConcept.id);
              return range.start <= target.end && target.start <= range.end;
            } catch {
              return false;
            }
          });
          // State-aware derivation (§03.6): an anchor already present derives
          // no op — re-running is idempotent against merged history.
          if (!alreadyAnchored) {
            const conceptPath = chosenConcept.path;
            preconditions.set(conceptPath, chosenConcept.sha256);
            operations.push({
              operationId: `editorial-anchor-add-${slug}-${targetDigest(card.targetKey)}`,
              type: 'editorial-anchor-add',
              conceptId: chosenConcept.id,
              anchor: { locator: card.derived.expectation.ref, weight: 1, sources: ['editorial'] },
              sourcePaths: [conceptPath],
              provenance: {
                source: 'editorial',
                confirmed: true,
                reviewer,
                evidence: evidenceOf(card.votes, `answer: theme ${chosenConcept.id} ("Theme: ${chosenConcept.label}")`),
              },
              reason: `Lists ${card.derived.expectation.ref} under the theme "${chosenConcept.label}", as the reviewer chose.`,
            });
          }
        }
        if (card.derived.chapterAdd !== undefined) {
          preconditions.set('pipeline/fixtures/web-subset.json', sha256(inputs.webSubsetJson));
          operations.push({
            operationId: `fixture-corpus-chapter-add-${slug}-${targetDigest(card.targetKey)}`,
            type: 'fixture-corpus-chapter-add',
            book: card.derived.chapterAdd.book,
            chapter: card.derived.chapterAdd.chapter,
            why: `workbench judgment: ${query}`,
            sourcePaths: ['pipeline/fixtures/web-subset.json'],
            provenance: {
              source: 'editorial',
              confirmed: true,
              reviewer,
              evidence: evidenceOf(card.votes),
            },
            reason: `Brings ${card.derived.chapterAdd.book} ${card.derived.chapterAdd.chapter} into the fixture corpus so the answer sheet can measure it.`,
          });
        }
      }
      if (card.derived.guard !== undefined) {
        mustNotRank.push({ ref: card.derived.guard.ref, why: card.derived.guard.why });
      }
      if (card.derived.preferredOrder !== undefined) {
        preferredOrder.push({ ...card.derived.preferredOrder });
      }
      if (card.derived.anchorRemove !== undefined) {
        const concept = conceptsById.get(card.derived.anchorRemove.conceptId);
        if (concept === undefined) {
          throw new UpdatesManifestError('The named theme no longer exists in the reviewed ontology snapshot.');
        }
        preconditions.set(concept.path, concept.sha256);
        operations.push({
          operationId: `editorial-anchor-remove-${slug}-${targetDigest(card.targetKey)}`,
          type: 'editorial-anchor-remove',
          conceptId: concept.id,
          locator: card.derived.anchorRemove.locator,
          currentSources: ['editorial'],
          sourcePaths: [concept.path],
          provenance: {
            source: 'editorial',
            confirmed: true,
            reviewer,
            evidence: evidenceOf(card.votes),
          },
          reason: `Removes this passage from the theme "${concept.label}" — the reviewer judged its listing wrong for this search.`,
        });
      }
    }

    // §03.6 rule 2 (state-aware derivation) + §5.1's two-writer coexistence:
    // the upsert REWRITES the whole owned fixture file, so it must carry the
    // existing workbench-owned rows forward — a shipped guard line whose card
    // merely sits undecided this cycle is never silently deleted. An existing
    // row is dropped only when a boarding card derives a CONTRADICTING
    // assertion on an overlapping range — the product of a superseding vote
    // (§02.3's reversibility rule: the guard is removed by the same pipeline
    // that added it); a same-range row of the same kind is replaced by the
    // boarding card's fresher call.
    const rangeOf = (ref: unknown): { start: number; end: number } | null => {
      if (typeof ref !== 'string') return null;
      try {
        return anchorRangeOf(ref, 'owned fixture row');
      } catch {
        return null;
      }
    };
    const overlaps = (a: { start: number; end: number }, b: { start: number; end: number }): boolean =>
      a.start <= b.end && b.start <= a.end;
    const sameRange = (a: { start: number; end: number }, b: { start: number; end: number }): boolean =>
      a.start === b.start && a.end === b.end;
    const rowsOf = (value: unknown): Record<string, unknown>[] =>
      Array.isArray(value) ? value.filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null && !Array.isArray(entry)) : [];
    if (existingValue !== undefined) {
      const derivedExpectedRanges = expectedTop.map((row) => rangeOf(row.ref)).filter((range): range is { start: number; end: number } => range !== null);
      const derivedGuardRanges = mustNotRank.map((row) => rangeOf(row.ref)).filter((range): range is { start: number; end: number } => range !== null);
      const keptExpected = rowsOf(existingValue.expectedTop).filter((row) => {
        const range = rangeOf(row.ref ?? row.reference);
        if (range === null) return true; // the strict parser rules on it honestly below
        if (derivedExpectedRanges.some((derived) => sameRange(derived, range))) return false; // replaced by the boarding call
        return !derivedGuardRanges.some((derived) => overlaps(derived, range)); // dropped only by a superseding guard
      });
      const keptGuards = rowsOf(existingValue.mustNotRank).filter((row) => {
        const range = rangeOf(row.ref ?? row.reference);
        if (range === null) return true;
        if (derivedGuardRanges.some((derived) => sameRange(derived, range))) return false;
        return !derivedExpectedRanges.some((derived) => overlaps(derived, range));
      });
      const pairKeyOf = (above: unknown, below: unknown): string | null => {
        const aboveRange = rangeOf(above);
        const belowRange = rangeOf(below);
        if (aboveRange === null || belowRange === null) return null;
        return `${aboveRange.start}:${aboveRange.end}${NUL}${belowRange.start}:${belowRange.end}`;
      };
      const derivedPairKeys = new Set(preferredOrder
        .flatMap((row) => {
          const forward = pairKeyOf(row.above, row.below);
          const reverse = pairKeyOf(row.below, row.above);
          return forward === null || reverse === null ? [] : [forward, reverse];
        }));
      const keptOrder = rowsOf(existingValue.preferredOrder).filter((row) => {
        const key = pairKeyOf(row.above, row.below);
        return key === null || !derivedPairKeys.has(key);
      });
      expectedTop.unshift(...keptExpected);
      mustNotRank.unshift(...keptGuards);
      preferredOrder.unshift(...keptOrder);
    }

    const byRef = (left: Record<string, unknown>, right: Record<string, unknown>): number => {
      const a = anchorRangeOf(String(left.ref ?? left.above), 'manifest fixture');
      const b = anchorRangeOf(String(right.ref ?? right.above), 'manifest fixture');
      return a.start - b.start || a.end - b.end;
    };
    const fixture: Record<string, unknown> = {
      id: slug,
      generatedBy: 'workbench',
      status: 'pending',
      query,
      expectedTop: [...expectedTop].sort(byRef),
      mustNotRank: [...mustNotRank].sort(byRef),
      ...(preferredOrder.length > 0 ? { preferredOrder: [...preferredOrder].sort(byRef) } : {}),
    };
    preconditions.set(ownedFixturePath, existing === undefined ? EMPTY_SHA256 : sha256(existing.contents));
    // V4, structural: every layer-affecting operation travels with the
    // golden-fixture-upsert measuring it — paired per fixture under 02.7's
    // per-operation targeting amendment (D8a) — in the same manifest.
    operations.push({
      operationId: `golden-fixture-upsert-${slug}`,
      type: 'golden-fixture-upsert',
      goldenFixtureId: slug,
      fixture,
      sourcePaths: [ownedFixturePath],
      provenance: {
        source: 'editorial',
        confirmed: true,
        reviewer,
        evidence: evidenceOf(queryCards.flatMap((card) => card.votes)),
      },
      reason: `Adds the answer-sheet lines the approved calls asked for on "${query}".`,
    });
  }

  const manifestInput = {
    schemaVersion: 1,
    proposalId: options.trainId,
    // 02.7 (D8a): the top-level fixtureId is a deterministic label — the
    // lexicographically first touched fixture id — no longer a constraint.
    fixtureId: queries.map(slugOf).sort()[0]!,
    caseIds: [...caseIds].sort(),
    sourcePreconditions: [...preconditions.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, digest]) => ({ path, sha256: digest })),
    operations,
  };
  const ontologyContext = {
    concepts: concepts.map((concept): OntologyConceptIndex => ({
      id: concept.id,
      phrases: concept.lexicon,
      phraseOwners: Object.fromEntries(concept.lexicon.map((phrase) => [phrase, 'editorial' as const])),
      anchors: concept.anchors,
      related: concept.related,
    })),
  };
  // The pipeline's own strict parser and validator are the deriver's output
  // contract: the manifest identity threaded downstream is the pipeline's.
  const manifest = normalizeProposalManifest(parseProposalManifest(manifestInput, ontologyContext));
  return {
    manifest,
    digest: proposalManifestDigest(manifest),
    cardIds: boarding.map((card) => card.cardId).sort(),
    judgmentIds: [...new Set([
      ...boarding.flatMap((card) => card.judgmentIds),
      // §02.6's union rule: every effective helpful leaf on a sealed card's
      // target rides the seal set as context evidence.
      ...boarding.flatMap((card) => card.contextJudgmentIds),
    ])].sort(),
  };
}

// ---------------------------------------------------------------------------
// Seal-time train classification and the V4 fixtures-travel-with-data
// invariant (§05 §5.2/§5.3; enforcement locus fixed by §03 §03.5 step 3 —
// the deriver's seal-time validator, deliberately NOT parseProposalManifest,
// which is shared with hand-authored manifests).
// ---------------------------------------------------------------------------

/** V7: classification is derived from the manifest, never chosen by a caller. */
export function deriveTrainFlavor(manifest: ProposalManifest): 'guard' | 'data' {
  return manifest.operations.every((operation) => operation.type === 'golden-fixture-upsert') ? 'guard' : 'data';
}

interface FixtureAssertionRange {
  readonly start: number;
  readonly end: number;
}

function fixtureAssertionRanges(fixture: Record<string, unknown>): FixtureAssertionRange[] {
  const ranges: FixtureAssertionRange[] = [];
  for (const key of ['expectedTop', 'mustNotRank'] as const) {
    const entries = fixture[key];
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (typeof entry !== 'object' || entry === null) continue;
      const reference = (entry as Record<string, unknown>).ref ?? (entry as Record<string, unknown>).reference;
      if (typeof reference !== 'string') continue;
      try {
        ranges.push(anchorRangeOf(reference, 'seal-time fixture assertion'));
      } catch {
        // An unparseable reference measures nothing; the gauntlet's own
        // validator refuses it at parse time (proposals.ts).
      }
    }
  }
  return ranges;
}

/**
 * The V4 invariant, enforced at seal (§05 §5.3): a manifest containing any
 * layer-affecting operation MUST also contain, in the same manifest, the
 * `golden-fixture-upsert` operation(s) measuring IT — pairing per operation
 * and fixture (02.7's per-operation targeting). Anchor and chapter operations
 * pair by reference overlap with a fixture assertion; the remaining
 * layer-affecting types (which the deriver never emits) pair only against the
 * conservative manifest-level floor — at least one fixture upsert present.
 * Returns the unmeasured operations; the seal refuses when any exist.
 */
export function unmeasuredLayerAffectingOperations(manifest: ProposalManifest): readonly ProposalOperation[] {
  const upserts = manifest.operations.filter((operation) => operation.type === 'golden-fixture-upsert');
  const assertionRanges = upserts.flatMap((operation) =>
    operation.type === 'golden-fixture-upsert' ? fixtureAssertionRanges(operation.fixture as Record<string, unknown>) : []);
  const unmeasured: ProposalOperation[] = [];
  for (const operation of manifest.operations) {
    if (operation.type === 'golden-fixture-upsert') continue;
    if (operation.type === 'fixture-corpus-chapter-add') {
      const book = findBook(operation.book);
      const measured = book !== undefined && assertionRanges.some((range) => {
        const start = parseVerseId(range.start);
        const end = parseVerseId(range.end);
        return start.bookId === book.id && start.chapter <= operation.chapter && operation.chapter <= end.chapter;
      });
      if (!measured) unmeasured.push(operation);
      continue;
    }
    const locator = operation.type === 'editorial-anchor-add'
      ? operation.anchor.locator
      : operation.type === 'editorial-anchor-remove'
        ? operation.locator
        : operation.type === 'editorial-anchor-adjust'
          ? operation.current.locator
          : null;
    if (locator !== null) {
      let range: FixtureAssertionRange | null = null;
      try {
        range = anchorRangeOf(locator, `operation ${operation.operationId}`);
      } catch {
        range = null;
      }
      const measured = range !== null && assertionRanges.some((assertion) =>
        assertion.start <= range!.end && range!.start <= assertion.end);
      if (!measured) unmeasured.push(operation);
      continue;
    }
    // Lexicon/related/concept operations: no reference to pair on — the
    // conservative floor requires at least one measuring fixture upsert.
    if (upserts.length === 0) unmeasured.push(operation);
  }
  return unmeasured;
}
