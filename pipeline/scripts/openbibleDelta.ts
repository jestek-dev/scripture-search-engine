/**
 * OpenBible re-pin vote-delta tool: vote-movement analysis between the pinned
 * payloads and candidate snapshots (plan P2.2 / RH-4; process:
 * docs/source-repins.md §2).
 *
 * For a curated layer the delta measurement is "vote-movement analysis, not
 * verse text: diff topic→verse vote sets, report adds/removes/moved
 * magnitudes, and re-confirm the CC BY license header in the new bytes — a
 * changed header is a rights stop". This script is that measurement, for both
 * OpenBible sources:
 *
 *   --kind topics  topic-scores.txt   (topic, OSIS range, quality score)
 *   --kind xrefs   cross_references.txt (from, to-range, votes)
 *
 * What "consumed" means, and why the report splits on it: the engine never
 * ingests these files wholesale. Topic rows reach the artifact ONLY through a
 * concept's `openbibleTopics` subscription (buildConceptLayer joins
 * subscribed topics to anchors with weight = scoreToWeight(score)); xref rows
 * reach the fixture build ONLY through the committed
 * `pipeline/fixtures/openbible-subset.json` evidence. So movement ON those
 * rows is movement in what the curated layers actually consume — it goes to
 * Jesse's review before the re-pin PR merges, and the report doubles as the
 * borrowables aspect's (B1) transform-design baseline. Movement elsewhere is
 * counted and sampled, not itemized in full (the full files carry ~70k/~340k
 * rows; an unreviewable list is not evidence).
 *
 * Outcome classes, pre-declared:
 *
 *   identical                  -> nothing moved (and the license is intact);
 *   (a) outside consumed scope -> proceed with the re-pin; the counts still
 *                                 appear in the PR body;
 *   (b) consumed-scope movement-> the itemized list goes to Jesse (J52/A5a)
 *                                 BEFORE the re-pin PR merges, and the report
 *                                 is handed to B1;
 *   license STOP               -> the license header changed or lost its
 *                                 CC-BY marker: a rights question, not a
 *                                 re-pin (docs/source-repins.md §2). Overrides
 *                                 every data verdict.
 *
 * License-header honesty: both observed headers embed a per-release
 * generation date ("# Generated 2026-08-17. CC-BY License: …" for topics;
 * "#www.openbible.info CC-BY 2026-08-17" for xrefs — live-verified
 * 2026-08-21). A literal changed-header STOP would therefore fire on every
 * re-pin and become decoration. The check instead strips embedded dates and
 * compares the remaining header text: the license GRANT changing is the
 * stop; the date rolling is release metadata, printed but never fatal. The
 * failure direction stays conservative — a missing marker or ANY non-date
 * header change stops, including column-title churn (human eyes, then).
 * When the old side is the subset witness (which carries no raw header),
 * the check does NOT degrade to the marker probe alone — the marker is
 * prefix-open ("CC-BY" is a substring of "CC-BY-NC"), so a present marker
 * proves nothing about the grant. Instead the PINNED full header wording
 * (PINNED_FULL_HEADERS — the wording the manifests' licenseRecord fields
 * quote, live-verified and test-anchored) stands in as the old side, and
 * the same date-stripped comparison runs; the report names which old side
 * was used, so a pass never reads as more than was checked.
 *
 * The report is deterministic (stable sort orders, both halves of every
 * shift printed) so it can be attached to the re-pin PR as evidence BEFORE
 * the manifest edit — it is that PR's "fixture". This script performs NO
 * network I/O and never edits a manifest.
 *
 * Usage:
 *   npx tsx scripts/openbibleDelta.ts --kind topics \
 *     --old fixtures/openbible-subset.json \
 *     --new /path/to/topic-scores-2026-08.zip [--out delta.md] [--check]
 *   npx tsx scripts/openbibleDelta.ts --kind xrefs \
 *     --old fixtures/openbible-subset.json \
 *     --new /path/to/cross-references-2026-08.zip [--out delta.md] [--check]
 *
 * `--old` / `--new` each accept the raw .txt, a .zip containing it, or the
 * committed `openbible-subset.json` (a WITNESS: rows cut to subscribed
 * topics / fixture-corpus verses, so adds are not measurable and the
 * license comparison runs against the pinned header wording instead of a
 * raw old header — the report states both).
 * `--concepts <dir>` / `--committed <path>` override the consumed-scope
 * inputs (defaults: `ontology/concepts`, `fixtures/openbible-subset.json`);
 * `--no-concepts` / `--no-committed` deliberately drop them, capping the
 * verdict at class (a) with a warning that (b) cannot be ruled out.
 * `--check` makes the exit code machine-readable: 0 identical, 1 any
 * movement (class a/b), 2 license STOP. Without `--check` the exit code is
 * always 0 — license STOP included — because the report is the product;
 * only `--check` runs are load-bearing for scripts and gates.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  importCrossReferences,
  importTopicScores,
  scoreToWeight,
  type CrossReferenceRow,
  type TopicAnchorRow,
} from '../src/importers/openbibleImporter.js';
import { compileOntology } from '../src/importers/ontologyImporter.js';
import { parseVerseId } from '../src/verseId.js';
import { formatRef } from './webDelta.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

export type SourceKind = 'topics' | 'xrefs';

/** How many outside-consumed-scope entries each list prints before capping. */
const OUTSIDE_LIST_CAP = 25;

export function formatRange(startVerseId: number, endVerseId: number): string {
  if (startVerseId === endVerseId) return formatRef(startVerseId);
  const start = parseVerseId(startVerseId);
  const end = parseVerseId(endVerseId);
  if (start.bookId === end.bookId && start.chapter === end.chapter) {
    return `${formatRef(startVerseId)}-${end.verse}`;
  }
  return `${formatRef(startVerseId)} - ${formatRef(endVerseId)}`;
}

// ---------------------------------------------------------------------------
// Consumed scope (what makes movement class (b))
// ---------------------------------------------------------------------------

export interface ConsumedTopics {
  /** Topic names some concept subscribes to (importer-normalized). */
  readonly topics: ReadonlySet<string>;
  /** topic -> sorted concept ids consuming it. */
  readonly conceptsByTopic: ReadonlyMap<string, readonly string[]>;
  readonly conceptFileCount: number;
}

/**
 * Reads every concept YAML's `openbibleTopics` subscriptions — the ONLY path
 * by which topic rows reach the artifact (buildConceptLayer's join). Compile
 * errors throw loudly: a silently skipped concept file is a subscription the
 * class-(b) split can no longer see.
 */
export function collectConsumedTopics(dir: string): ConsumedTopics {
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.yaml'))
    .sort()
    .map((name) => ({ name, contents: readFileSync(join(dir, name), 'utf8') }));
  const { ontology, errors } = compileOntology(files);
  if (errors.length > 0) {
    throw new Error(`collectConsumedTopics: ontology compile errors:\n${errors.join('\n')}`);
  }
  const conceptsByTopic = new Map<string, string[]>();
  for (const { conceptId, topic } of ontology.topicSubscriptions) {
    const bucket = conceptsByTopic.get(topic);
    if (bucket) bucket.push(conceptId);
    else conceptsByTopic.set(topic, [conceptId]);
  }
  for (const bucket of conceptsByTopic.values()) bucket.sort();
  return {
    topics: new Set(conceptsByTopic.keys()),
    conceptsByTopic,
    conceptFileCount: files.length,
  };
}

// ---------------------------------------------------------------------------
// License header check (the rights record)
// ---------------------------------------------------------------------------

/**
 * The license markers the pinned manifests quote (licenseRecord fields of
 * pipeline/manifests/openbible-{topics,xrefs}.json), minus the embedded
 * date. The marker probe alone is deliberately NOT trusted as a pass: the
 * xrefs marker is prefix-open ("CC-BY" is a substring of "CC-BY-NC"), so a
 * present marker proves nothing about the grant. It exists only to name the
 * clearest failure ("the CC-BY marker is MISSING") in the report; the
 * operative check is always the date-stripped full-wording comparison below.
 */
const LICENSE_MARKERS: Readonly<Record<SourceKind, string>> = {
  topics: 'CC-BY License: www.openbible.info/topics',
  xrefs: 'www.openbible.info CC-BY',
};

/**
 * The full pinned header wording per kind — the old side of the license
 * comparison whenever the old payload is the subset witness (which carries
 * no raw header). The grant portions are exactly what the pinned manifests'
 * licenseRecord fields quote ('CC-BY License: www.openbible.info/topics';
 * 'www.openbible.info CC-BY 2026-07-27'); the full lines were live-verified
 * against the served files on 2026-08-21 and are anchored by the test
 * suite's header constants. Dates are stripped before comparing, so these
 * stay valid across upstream's weekly date rolls; any GRANT rewording —
 * including a suffix extension the prefix-open marker cannot see, e.g.
 * CC-BY -> CC-BY-NC — differs from this wording and STOPs.
 */
export const PINNED_FULL_HEADERS: Readonly<Record<SourceKind, string>> = {
  topics:
    'Topic\tOSIS\tQuality Score (based on percentage of votes for the passage)\t' +
    '# Generated 2026-07-27. CC-BY License: www.openbible.info/topics',
  xrefs: 'From Verse\tTo Verse\tVotes\t#www.openbible.info CC-BY 2026-07-27',
};

const DATE_RE = /\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?/g;

function stripDates(header: string): string {
  return header.replace(DATE_RE, '<date>').replace(/\s+/g, ' ').trim();
}

function extractDate(header: string | null): string | null {
  if (header === null) return null;
  const match = /\d{4}-\d{2}-\d{2}/.exec(header);
  return match ? match[0] : null;
}

export interface LicenseCheck {
  readonly kind: SourceKind;
  readonly marker: string;
  readonly oldHeader: string | null;
  /**
   * Which old-side wording the comparison ran against: the old payload's raw
   * header when one exists, else the pinned header wording
   * (PINNED_FULL_HEADERS — the manifests' licenseRecord quote). The report
   * names this so a pass never reads as more than it was.
   */
  readonly oldWordingSource: 'old-payload' | 'pinned-record';
  readonly newHeader: string;
  readonly markerPresent: boolean;
  /**
   * Whether the header text changed beyond the embedded date, against the
   * wording oldWordingSource names. The comparison ALWAYS runs — witness
   * mode must never degrade to the prefix-open marker probe alone, or a
   * CC-BY -> CC-BY-NC restriction would pass as "identical".
   */
  readonly licenseTextChanged: boolean;
  readonly stop: boolean;
  readonly oldDate: string | null;
  readonly newDate: string | null;
}

export function checkLicenseHeader(
  kind: SourceKind,
  oldHeader: string | null,
  newHeader: string,
): LicenseCheck {
  const marker = LICENSE_MARKERS[kind];
  const markerPresent = newHeader.includes(marker);
  const oldWording = oldHeader ?? PINNED_FULL_HEADERS[kind];
  const licenseTextChanged = stripDates(oldWording) !== stripDates(newHeader);
  return {
    kind,
    marker,
    oldHeader,
    oldWordingSource: oldHeader === null ? 'pinned-record' : 'old-payload',
    newHeader,
    markerPresent,
    licenseTextChanged,
    stop: !markerPresent || licenseTextChanged,
    oldDate: extractDate(oldHeader),
    newDate: extractDate(newHeader),
  };
}

// ---------------------------------------------------------------------------
// Topic delta (topic-scores)
// ---------------------------------------------------------------------------

export interface TopicRowEntry {
  readonly topic: string;
  readonly startVerseId: number;
  readonly endVerseId: number;
  readonly ref: string;
  readonly score: number;
  /** The anchor weight this row would produce: scoreToWeight(score). */
  readonly weight: number;
  readonly consumed: boolean;
}

export interface TopicRowChange {
  readonly topic: string;
  readonly startVerseId: number;
  readonly endVerseId: number;
  readonly ref: string;
  readonly oldScore: number;
  readonly newScore: number;
  readonly oldWeight: number;
  readonly newWeight: number;
  readonly consumed: boolean;
}

export interface TopicDelta {
  /** True when comparison was restricted to the old witness's row set. */
  readonly restricted: boolean;
  /** Rows keyed identically on both sides (the compared population). */
  readonly comparedRows: number;
  readonly topicsAdded: readonly string[];
  readonly topicsRemoved: readonly string[];
  /**
   * Subscribed topics present in the old payload but absent from the
   * candidate — dangling subscriptions: the named concepts silently lose
   * every OpenBible anchor for that topic.
   */
  readonly consumedTopicsMissing: readonly { topic: string; conceptIds: readonly string[] }[];
  readonly rowsAdded: readonly TopicRowEntry[];
  readonly rowsRemoved: readonly TopicRowEntry[];
  readonly scoreShifts: readonly TopicRowChange[];
}

function topicKey(row: TopicAnchorRow): string {
  // '\t' is collision-free here: topic names come from a tab-separated file,
  // so a topic can never contain a tab (and the other components are
  // numbers). A visible escape, deliberately — never an invisible byte.
  return `${row.topic}\t${row.startVerseId}\t${row.endVerseId}`;
}

function byTopicThenRange(
  a: { topic: string; startVerseId: number; endVerseId: number },
  b: { topic: string; startVerseId: number; endVerseId: number },
): number {
  if (a.topic !== b.topic) return a.topic < b.topic ? -1 : 1;
  return a.startVerseId - b.startVerseId || a.endVerseId - b.endVerseId;
}

export function computeTopicDelta(
  oldRows: readonly TopicAnchorRow[],
  newRows: readonly TopicAnchorRow[],
  consumed: ConsumedTopics | null,
  options: { restrictToWitness?: boolean } = {},
): TopicDelta {
  const restricted = options.restrictToWitness === true;
  const isConsumed = (topic: string): boolean => consumed?.topics.has(topic) ?? false;

  const oldByKey = new Map(oldRows.map((row) => [topicKey(row), row]));
  const newByKey = new Map(newRows.map((row) => [topicKey(row), row]));
  if (oldByKey.size !== oldRows.length || newByKey.size !== newRows.length) {
    // The importer emits what the file says; a duplicate (topic, range) key
    // would double-count under the join and every number below would lie.
    throw new Error('computeTopicDelta: duplicate (topic, range) key in a payload');
  }

  const entry = (row: TopicAnchorRow): TopicRowEntry => ({
    topic: row.topic,
    startVerseId: row.startVerseId,
    endVerseId: row.endVerseId,
    ref: formatRange(row.startVerseId, row.endVerseId),
    score: row.score,
    weight: scoreToWeight(row.score),
    consumed: isConsumed(row.topic),
  });

  const rowsAdded: TopicRowEntry[] = [];
  const rowsRemoved: TopicRowEntry[] = [];
  const scoreShifts: TopicRowChange[] = [];
  let comparedRows = 0;

  for (const [key, oldRow] of oldByKey) {
    const newRow = newByKey.get(key);
    if (newRow === undefined) {
      // A removal is reportable under ANY witness: the witness carries the
      // row, the candidate does not. Hiding shrinkage is never an option.
      rowsRemoved.push(entry(oldRow));
      continue;
    }
    comparedRows += 1;
    if (newRow.score !== oldRow.score) {
      scoreShifts.push({
        topic: oldRow.topic,
        startVerseId: oldRow.startVerseId,
        endVerseId: oldRow.endVerseId,
        ref: formatRange(oldRow.startVerseId, oldRow.endVerseId),
        oldScore: oldRow.score,
        newScore: newRow.score,
        oldWeight: scoreToWeight(oldRow.score),
        newWeight: scoreToWeight(newRow.score),
        consumed: isConsumed(oldRow.topic),
      });
    }
  }
  if (!restricted) {
    // Out of a subset witness's sight there is no old row to compare, so
    // "added" would really mean "not in the witness" — out of scope.
    for (const [key, newRow] of newByKey) {
      if (!oldByKey.has(key)) rowsAdded.push(entry(newRow));
    }
  }

  const oldTopics = new Set(oldRows.map((row) => row.topic));
  const newTopics = new Set(newRows.map((row) => row.topic));
  const topicsAdded = restricted
    ? []
    : [...newTopics].filter((topic) => !oldTopics.has(topic)).sort();
  const topicsRemoved = [...oldTopics].filter((topic) => !newTopics.has(topic)).sort();
  const consumedTopicsMissing = topicsRemoved
    .filter((topic) => isConsumed(topic))
    .map((topic) => ({ topic, conceptIds: consumed?.conceptsByTopic.get(topic) ?? [] }));

  return {
    restricted,
    comparedRows,
    topicsAdded,
    topicsRemoved,
    consumedTopicsMissing,
    rowsAdded: rowsAdded.sort(byTopicThenRange),
    rowsRemoved: rowsRemoved.sort(byTopicThenRange),
    scoreShifts: scoreShifts.sort(byTopicThenRange),
  };
}

// ---------------------------------------------------------------------------
// Cross-reference delta (cross_references)
// ---------------------------------------------------------------------------

export function xrefKey(fromVerseId: number, toStartVerseId: number, toEndVerseId: number): string {
  // All components are numbers, so any non-digit separator is collision-free;
  // '\t' for symmetry with topicKey. A visible escape, never an invisible byte.
  return `${fromVerseId}\t${toStartVerseId}\t${toEndVerseId}`;
}

function xrefLabel(row: { fromVerseId: number; toStartVerseId: number; toEndVerseId: number }): string {
  return `${formatRef(row.fromVerseId)} -> ${formatRange(row.toStartVerseId, row.toEndVerseId)}`;
}

export interface XrefEntry {
  readonly fromVerseId: number;
  readonly toStartVerseId: number;
  readonly toEndVerseId: number;
  readonly ref: string;
  readonly votes: number;
  /** Whether the build would import this edge (votes >= 1). */
  readonly importable: boolean;
  readonly touchesCommitted: boolean;
}

export interface XrefChange {
  readonly fromVerseId: number;
  readonly toStartVerseId: number;
  readonly toEndVerseId: number;
  readonly ref: string;
  readonly oldVotes: number;
  readonly newVotes: number;
  readonly touchesCommitted: boolean;
  /**
   * Non-null when the shift crosses the importer's minVotes=1 threshold:
   * from the build's perspective the edge appears or disappears even though
   * the file still carries it.
   */
  readonly importability: 'enters-build' | 'leaves-build' | null;
}

export interface XrefDelta {
  readonly restricted: boolean;
  readonly comparedEdges: number;
  readonly edgesAdded: readonly XrefEntry[];
  readonly edgesRemoved: readonly XrefEntry[];
  readonly voteShifts: readonly XrefChange[];
}

const IMPORT_MIN_VOTES = 1;

function byEdgeKey(
  a: { fromVerseId: number; toStartVerseId: number; toEndVerseId: number },
  b: { fromVerseId: number; toStartVerseId: number; toEndVerseId: number },
): number {
  return (
    a.fromVerseId - b.fromVerseId ||
    a.toStartVerseId - b.toStartVerseId ||
    a.toEndVerseId - b.toEndVerseId
  );
}

export function computeXrefDelta(
  oldRows: readonly CrossReferenceRow[],
  newRows: readonly CrossReferenceRow[],
  committed: ReadonlySet<string> | null,
  options: { restrictToWitness?: boolean } = {},
): XrefDelta {
  const restricted = options.restrictToWitness === true;
  const touches = (row: { fromVerseId: number; toStartVerseId: number; toEndVerseId: number }) =>
    committed?.has(xrefKey(row.fromVerseId, row.toStartVerseId, row.toEndVerseId)) ?? false;

  const key = (row: CrossReferenceRow) => xrefKey(row.fromVerseId, row.toStartVerseId, row.toEndVerseId);
  const oldByKey = new Map(oldRows.map((row) => [key(row), row]));
  const newByKey = new Map(newRows.map((row) => [key(row), row]));
  if (oldByKey.size !== oldRows.length || newByKey.size !== newRows.length) {
    throw new Error('computeXrefDelta: duplicate edge key in a payload');
  }

  const entry = (row: CrossReferenceRow): XrefEntry => ({
    fromVerseId: row.fromVerseId,
    toStartVerseId: row.toStartVerseId,
    toEndVerseId: row.toEndVerseId,
    ref: xrefLabel(row),
    votes: row.votes,
    importable: row.votes >= IMPORT_MIN_VOTES,
    touchesCommitted: touches(row),
  });

  const edgesAdded: XrefEntry[] = [];
  const edgesRemoved: XrefEntry[] = [];
  const voteShifts: XrefChange[] = [];
  let comparedEdges = 0;

  for (const [edgeKey, oldRow] of oldByKey) {
    const newRow = newByKey.get(edgeKey);
    if (newRow === undefined) {
      edgesRemoved.push(entry(oldRow));
      continue;
    }
    comparedEdges += 1;
    if (newRow.votes !== oldRow.votes) {
      const wasImportable = oldRow.votes >= IMPORT_MIN_VOTES;
      const isImportable = newRow.votes >= IMPORT_MIN_VOTES;
      voteShifts.push({
        fromVerseId: oldRow.fromVerseId,
        toStartVerseId: oldRow.toStartVerseId,
        toEndVerseId: oldRow.toEndVerseId,
        ref: xrefLabel(oldRow),
        oldVotes: oldRow.votes,
        newVotes: newRow.votes,
        touchesCommitted: touches(oldRow),
        importability:
          wasImportable === isImportable
            ? null
            : isImportable
              ? 'enters-build'
              : 'leaves-build',
      });
    }
  }
  if (!restricted) {
    for (const [edgeKey, newRow] of newByKey) {
      if (!oldByKey.has(edgeKey)) edgesAdded.push(entry(newRow));
    }
  }

  return {
    restricted,
    comparedEdges,
    edgesAdded: edgesAdded.sort(byEdgeKey),
    edgesRemoved: edgesRemoved.sort(byEdgeKey),
    voteShifts: voteShifts.sort(byEdgeKey),
  };
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

export type OpenbibleOutcome =
  | 'identical'
  | 'a-outside-consumed-scope'
  | 'b-consumed-scope-movement'
  | 'license-stop';

export function classifyTopicDelta(
  delta: TopicDelta,
  license: LicenseCheck,
  scopeKnown: boolean,
): OpenbibleOutcome {
  if (license.stop) return 'license-stop';
  const anyMovement =
    delta.scoreShifts.length > 0 ||
    delta.rowsAdded.length > 0 ||
    delta.rowsRemoved.length > 0 ||
    delta.topicsAdded.length > 0 ||
    delta.topicsRemoved.length > 0;
  if (!anyMovement) return 'identical';
  const consumedMovement =
    scopeKnown &&
    (delta.consumedTopicsMissing.length > 0 ||
      [...delta.scoreShifts, ...delta.rowsAdded, ...delta.rowsRemoved].some(
        (item) => item.consumed,
      ));
  return consumedMovement ? 'b-consumed-scope-movement' : 'a-outside-consumed-scope';
}

export function classifyXrefDelta(
  delta: XrefDelta,
  license: LicenseCheck,
  scopeKnown: boolean,
): OpenbibleOutcome {
  if (license.stop) return 'license-stop';
  const anyMovement =
    delta.voteShifts.length > 0 || delta.edgesAdded.length > 0 || delta.edgesRemoved.length > 0;
  if (!anyMovement) return 'identical';
  const consumedMovement =
    scopeKnown &&
    [...delta.voteShifts, ...delta.edgesAdded, ...delta.edgesRemoved].some(
      (item) => item.touchesCommitted,
    );
  return consumedMovement ? 'b-consumed-scope-movement' : 'a-outside-consumed-scope';
}

// ---------------------------------------------------------------------------
// Payload loading
// ---------------------------------------------------------------------------

export interface LoadedOpenbiblePayload {
  readonly kind: 'raw-text' | 'zip' | 'openbible-subset';
  readonly source: SourceKind;
  /** Raw header line for txt/zip payloads; null for the subset witness. */
  readonly header: string | null;
  readonly topicRows?: readonly TopicAnchorRow[];
  readonly xrefRows?: readonly CrossReferenceRow[];
  readonly rejected: number;
  readonly sha256: string;
  readonly path: string;
}

interface OpenbibleSubsetFile {
  readonly $schema?: string;
  readonly topicRows?: readonly TopicAnchorRow[];
  readonly crossReferences?: readonly CrossReferenceRow[];
}

function parseRaw(
  contents: string,
  source: SourceKind,
): { header: string; topicRows?: readonly TopicAnchorRow[]; xrefRows?: readonly CrossReferenceRow[]; rejected: number } {
  const header = contents.split(/\r?\n/, 1)[0] ?? '';
  if (source === 'topics') {
    const { rows, report } = importTopicScores(contents);
    return { header, topicRows: rows, rejected: report.rejected };
  }
  // Keep downvoted edges visible: a vote drop across the importer's
  // minVotes=1 threshold must report as a SHIFT (flagged leaves-build),
  // never as a fake removal the file does not contain.
  const { rows, report } = importCrossReferences(contents, Number.NEGATIVE_INFINITY);
  return { header, xrefRows: rows, rejected: report.rejected };
}

export function loadOpenbiblePayload(path: string, source: SourceKind): LoadedOpenbiblePayload {
  const bytes = readFileSync(path);
  const sha256 = createHash('sha256').update(bytes).digest('hex');

  if (path.endsWith('.json')) {
    const parsed = JSON.parse(bytes.toString('utf8')) as OpenbibleSubsetFile;
    const rows = source === 'topics' ? parsed.topicRows : parsed.crossReferences;
    if (!Array.isArray(rows)) {
      throw new Error(
        `loadOpenbiblePayload: ${path} has no ${source === 'topics' ? 'topicRows' : 'crossReferences'} array`,
      );
    }
    return {
      kind: 'openbible-subset',
      source,
      header: null,
      ...(source === 'topics' ? { topicRows: rows as TopicAnchorRow[] } : { xrefRows: rows as CrossReferenceRow[] }),
      rejected: 0,
      sha256,
      path,
    };
  }

  if (path.endsWith('.zip')) {
    // Same single-text-entry unzip the artifact build uses; throwaway dir.
    const scratch = mkdtempSync(join(tmpdir(), 'openbible-delta-zip-'));
    try {
      execFileSync('unzip', ['-o', '-q', path, '-d', scratch]);
      const entry = readdirSync(scratch).find((name) => name.endsWith('.txt'));
      if (!entry) {
        throw new Error(
          `loadOpenbiblePayload: ${path} contains no .txt entry (found: ${readdirSync(scratch).join(', ')})`,
        );
      }
      const parsed = parseRaw(readFileSync(join(scratch, entry), 'utf8'), source);
      return { kind: 'zip', source, sha256, path, ...parsed };
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  }

  const parsed = parseRaw(bytes.toString('utf8'), source);
  return { kind: 'raw-text', source, sha256, path, ...parsed };
}

/** Keys every edge in the committed subset — the fixture build's evidence. */
export function loadCommittedXrefEvidence(path: string): ReadonlySet<string> {
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as OpenbibleSubsetFile;
  if (!Array.isArray(parsed.crossReferences)) {
    throw new Error(`loadCommittedXrefEvidence: ${path} has no crossReferences array`);
  }
  return new Set(
    parsed.crossReferences.map((row) => xrefKey(row.fromVerseId, row.toStartVerseId, row.toEndVerseId)),
  );
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const OUTCOME_LINES: Readonly<Record<OpenbibleOutcome, string>> = {
  identical:
    'IDENTICAL — the candidate carries the witness\'s exact rows, and the candidate\'s ' +
    'license header matches the old-side wording the license section names (dates aside).',
  'a-outside-consumed-scope':
    '(a) movement outside consumed scope — votes moved, but no row the curated layers ' +
    'consume changed. The re-pin may proceed (docs/source-repins.md §2); the counts ' +
    'above still go in the PR body.',
  'b-consumed-scope-movement':
    '(b) consumed-scope movement — the itemized rows below feed curated-layer anchors or ' +
    'committed evidence. The list goes to Jesse for review (J52/A5a) BEFORE the re-pin ' +
    'PR merges, and this report is handed to the borrowables aspect (B1) as its ' +
    'transform-design baseline.',
  'license-stop':
    'rights STOP — the license header changed or lost its CC-BY marker. "If it changed, ' +
    'stop: that is a rights question, not a re-pin" (docs/source-repins.md §2). No ' +
    'manifest edit until the rights question is answered.',
};

function formatWeight(weight: number): string {
  return String(Number(weight.toFixed(4)));
}

/** Sorts a copy by descending magnitude with a deterministic tie-break. */
function topMagnitude<T>(items: readonly T[], magnitude: (item: T) => number, tie: (a: T, b: T) => number): T[] {
  return [...items].sort((a, b) => magnitude(b) - magnitude(a) || tie(a, b));
}

interface ReportContext {
  readonly kind: SourceKind;
  readonly oldLabel: string;
  readonly newLabel: string;
  readonly restricted: boolean;
  readonly scopeNote: string;
  /** Extra witness-restriction caveat lines (already formatted). */
  readonly witnessNotes: readonly string[];
  /** topic -> consuming concept ids, for the itemized consumed lines (topics only). */
  readonly consumedByTopic: ReadonlyMap<string, readonly string[]> | null;
}

function licenseSection(license: LicenseCheck): string[] {
  const lines: string[] = ['', '## License header (the rights record)', ''];
  if (license.oldWordingSource === 'pinned-record') {
    lines.push(
      '- old: (witness carries no header — the PINNED header wording below, the wording ' +
        'the pinned manifest\'s licenseRecord quotes, stood in as the old side of the ' +
        'comparison)',
    );
    lines.push(`- pinned wording: \`${PINNED_FULL_HEADERS[license.kind]}\``);
  } else {
    lines.push(`- old: \`${license.oldHeader}\``);
  }
  lines.push(`- new: \`${license.newHeader}\``);
  const oldSideName =
    license.oldWordingSource === 'pinned-record'
      ? 'the pinned header wording'
      : 'the old header';
  if (license.stop) {
    const reason = !license.markerPresent
      ? `the expected CC-BY marker ("${license.marker}") is MISSING from the candidate header`
      : `the candidate header text differs from ${oldSideName} beyond the embedded generation date`;
    lines.push(`- verdict: **rights STOP** — ${reason}. Exit code 2 under --check.`);
  } else {
    const dates =
      license.oldDate && license.newDate && license.oldDate !== license.newDate
        ? `; embedded generation date moved ${license.oldDate} -> ${license.newDate} (release metadata, not a rights change)`
        : '';
    lines.push(
      `- verdict: intact — dates aside, the candidate header matches ${oldSideName} exactly` +
        `${dates}.`,
    );
  }
  return lines;
}

export function renderTopicReport(
  delta: TopicDelta,
  outcome: OpenbibleOutcome,
  license: LicenseCheck,
  context: ReportContext,
): string {
  const lines: string[] = [];
  lines.push('# OpenBible topic-scores vote-delta report', '');
  lines.push(`- old witness: ${context.oldLabel}`);
  lines.push(`- candidate: ${context.newLabel}`);
  lines.push(
    context.restricted
      ? '- comparison scope: the old witness\'s row set (subset witness — rows the witness ' +
          'does not carry are OUT OF SCOPE; adds are not measurable, removals still are)'
      : '- comparison scope: full payloads on both sides',
  );
  lines.push(context.scopeNote);
  lines.push(...context.witnessNotes);
  lines.push(...licenseSection(license));

  lines.push('', '## Verdict', '');
  lines.push(`- outcome class: ${OUTCOME_LINES[outcome]}`);
  const consumedShift = delta.scoreShifts.filter((item) => item.consumed);
  const consumedAdded = delta.rowsAdded.filter((item) => item.consumed);
  const consumedRemoved = delta.rowsRemoved.filter((item) => item.consumed);
  lines.push(
    `- rows compared: ${delta.comparedRows}; score shifts: ${delta.scoreShifts.length} ` +
      `(consumed: ${consumedShift.length}); rows added: ${delta.rowsAdded.length} ` +
      `(consumed: ${consumedAdded.length}); rows removed: ${delta.rowsRemoved.length} ` +
      `(consumed: ${consumedRemoved.length})`,
  );
  lines.push(
    `- topics added: ${delta.topicsAdded.length}; topics removed: ${delta.topicsRemoved.length}; ` +
      `dangling subscriptions: ${delta.consumedTopicsMissing.length}`,
  );

  lines.push('', '## Consumed-scope movement (listed in full)', '');
  const consumedLines: string[] = [];
  for (const missing of delta.consumedTopicsMissing) {
    consumedLines.push(
      `- DANGLING SUBSCRIPTION: topic "${missing.topic}" is missing from the candidate — ` +
        `the concept(s) ${missing.conceptIds.join(', ')} would silently lose every ` +
        'OpenBible anchor for it',
    );
  }
  for (const shift of consumedShift) {
    consumedLines.push(
      `- ${shift.topic} — ${shift.ref}: score ${shift.oldScore} -> ${shift.newScore}; ` +
        `weight ${formatWeight(shift.oldWeight)} -> ${formatWeight(shift.newWeight)} ` +
        `(consumed by ${consumedConcepts(context, shift.topic)})`,
    );
  }
  for (const row of consumedAdded) {
    consumedLines.push(
      `- added: ${row.topic} — ${row.ref}: score ${row.score}, weight ${formatWeight(row.weight)} ` +
        `(consumed by ${consumedConcepts(context, row.topic)})`,
    );
  }
  for (const row of consumedRemoved) {
    consumedLines.push(
      `- removed: ${row.topic} — ${row.ref}: score ${row.score}, weight ${formatWeight(row.weight)} ` +
        `(consumed by ${consumedConcepts(context, row.topic)})`,
    );
  }
  lines.push(...(consumedLines.length > 0 ? consumedLines : ['(none)']));

  const outsideShifts = delta.scoreShifts.filter((item) => !item.consumed);
  const outsideAdded = delta.rowsAdded.filter((item) => !item.consumed);
  const outsideRemoved = delta.rowsRemoved.filter((item) => !item.consumed);
  const cappedTitle = (title: string, total: number): string =>
    total > OUTSIDE_LIST_CAP
      ? `### ${title} (${total} total; largest ${OUTSIDE_LIST_CAP} listed)`
      : `### ${title} (${total} total)`;

  lines.push('', '## Movement outside consumed scope');
  lines.push('', cappedTitle('Score shifts', outsideShifts.length), '');
  const shiftMagnitude = (item: TopicRowChange): number => Math.abs(item.newWeight - item.oldWeight);
  const topShifts = topMagnitude(outsideShifts, shiftMagnitude, byTopicThenRange).slice(0, OUTSIDE_LIST_CAP);
  lines.push(
    ...(topShifts.length > 0
      ? topShifts.map(
          (shift) =>
            `- ${shift.topic} — ${shift.ref}: score ${shift.oldScore} -> ${shift.newScore}; ` +
            `weight ${formatWeight(shift.oldWeight)} -> ${formatWeight(shift.newWeight)}`,
        )
      : ['(none)']),
  );
  const entryLine = (row: TopicRowEntry): string =>
    `- ${row.topic} — ${row.ref}: score ${row.score}, weight ${formatWeight(row.weight)}`;
  lines.push('', cappedTitle('Rows added', outsideAdded.length), '');
  lines.push(
    ...(outsideAdded.length > 0
      ? topMagnitude(outsideAdded, (row) => row.weight, byTopicThenRange)
          .slice(0, OUTSIDE_LIST_CAP)
          .map(entryLine)
      : ['(none)']),
  );
  lines.push('', cappedTitle('Rows removed', outsideRemoved.length), '');
  lines.push(
    ...(outsideRemoved.length > 0
      ? topMagnitude(outsideRemoved, (row) => row.weight, byTopicThenRange)
          .slice(0, OUTSIDE_LIST_CAP)
          .map(entryLine)
      : ['(none)']),
  );
  if (delta.topicsAdded.length > 0 || delta.topicsRemoved.length > 0) {
    lines.push('', '### Topic-level changes', '');
    // Same cap-and-count honesty as the row lists: names are already sorted,
    // so the capped prefix is deterministic and the total is always stated.
    const capNames = (names: readonly string[]): string =>
      names.length > OUTSIDE_LIST_CAP
        ? `${names.slice(0, OUTSIDE_LIST_CAP).join('; ')}; ... (${names.length - OUTSIDE_LIST_CAP} more not listed)`
        : names.join('; ');
    if (delta.topicsAdded.length > 0) {
      lines.push(`- topics added (${delta.topicsAdded.length}): ${capNames(delta.topicsAdded)}`);
    }
    if (delta.topicsRemoved.length > 0) {
      lines.push(`- topics removed (${delta.topicsRemoved.length}): ${capNames(delta.topicsRemoved)}`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

/** Names the concepts consuming a topic, for the itemized consumed lines. */
function consumedConcepts(context: ReportContext, topic: string): string {
  return context.consumedByTopic?.get(topic)?.join(', ') ?? 'subscribed concept(s)';
}

export function renderXrefReport(
  delta: XrefDelta,
  outcome: OpenbibleOutcome,
  license: LicenseCheck,
  context: ReportContext,
): string {
  const lines: string[] = [];
  lines.push('# OpenBible cross-references vote-delta report', '');
  lines.push(`- old witness: ${context.oldLabel}`);
  lines.push(`- candidate: ${context.newLabel}`);
  lines.push(
    context.restricted
      ? '- comparison scope: the old witness\'s edge set (subset witness — edges the witness ' +
          'does not carry are OUT OF SCOPE; adds are not measurable, removals still are)'
      : '- comparison scope: full payloads on both sides',
  );
  lines.push(context.scopeNote);
  lines.push(...context.witnessNotes);
  lines.push(...licenseSection(license));

  lines.push('', '## Verdict', '');
  lines.push(`- outcome class: ${OUTCOME_LINES[outcome]}`);
  const touchingShifts = delta.voteShifts.filter((item) => item.touchesCommitted);
  const touchingAdded = delta.edgesAdded.filter((item) => item.touchesCommitted);
  const touchingRemoved = delta.edgesRemoved.filter((item) => item.touchesCommitted);
  lines.push(
    `- edges compared: ${delta.comparedEdges}; vote shifts: ${delta.voteShifts.length} ` +
      `(touching committed evidence: ${touchingShifts.length}); edges added: ` +
      `${delta.edgesAdded.length} (touching: ${touchingAdded.length}); edges removed: ` +
      `${delta.edgesRemoved.length} (touching: ${touchingRemoved.length})`,
  );

  const shiftLine = (shift: XrefChange): string =>
    `- ${shift.ref}: votes ${shift.oldVotes} -> ${shift.newVotes}` +
    (shift.importability ? ` (${shift.importability})` : '');
  const entryLine = (edge: XrefEntry): string =>
    `- ${edge.ref}: votes ${edge.votes}` + (edge.importable ? '' : ' (below import threshold)');

  lines.push('', '## Movement touching COMMITTED EVIDENCE (listed in full)', '');
  const touchingLines = [
    ...touchingShifts.map(shiftLine),
    ...touchingAdded.map((edge) => `- added: ${entryLine(edge).slice(2)}`),
    ...touchingRemoved.map((edge) => `- removed: ${entryLine(edge).slice(2)}`),
  ];
  lines.push(...(touchingLines.length > 0 ? touchingLines : ['(none)']));

  const outsideShifts = delta.voteShifts.filter((item) => !item.touchesCommitted);
  const outsideAdded = delta.edgesAdded.filter((item) => !item.touchesCommitted);
  const outsideRemoved = delta.edgesRemoved.filter((item) => !item.touchesCommitted);
  const cappedTitle = (title: string, total: number): string =>
    total > OUTSIDE_LIST_CAP
      ? `### ${title} (${total} total; largest ${OUTSIDE_LIST_CAP} listed)`
      : `### ${title} (${total} total)`;
  lines.push('', '## Movement outside committed evidence');
  lines.push('', cappedTitle('Vote shifts', outsideShifts.length), '');
  lines.push(
    ...(outsideShifts.length > 0
      ? topMagnitude(outsideShifts, (item) => Math.abs(item.newVotes - item.oldVotes), byEdgeKey)
          .slice(0, OUTSIDE_LIST_CAP)
          .map(shiftLine)
      : ['(none)']),
  );
  lines.push('', cappedTitle('Edges added', outsideAdded.length), '');
  lines.push(
    ...(outsideAdded.length > 0
      ? topMagnitude(outsideAdded, (edge) => edge.votes, byEdgeKey)
          .slice(0, OUTSIDE_LIST_CAP)
          .map(entryLine)
      : ['(none)']),
  );
  lines.push('', cappedTitle('Edges removed', outsideRemoved.length), '');
  lines.push(
    ...(outsideRemoved.length > 0
      ? topMagnitude(outsideRemoved, (edge) => edge.votes, byEdgeKey)
          .slice(0, OUTSIDE_LIST_CAP)
          .map(entryLine)
      : ['(none)']),
  );
  lines.push('');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export interface RunOptions {
  readonly kind: SourceKind;
  readonly oldPath: string;
  readonly newPath: string;
  /** Concepts dir (topics); null = deliberately none; undefined = repo default. */
  readonly conceptsDir?: string | null;
  /** Committed subset path (xrefs); null = deliberately none; undefined = repo default. */
  readonly committedPath?: string | null;
  readonly check?: boolean;
}

export interface RunResult {
  readonly report: string;
  readonly exitCode: number;
  readonly outcome: OpenbibleOutcome;
  readonly delta: TopicDelta | XrefDelta;
  readonly license: LicenseCheck;
}

export function runOpenbibleDelta(options: RunOptions): RunResult {
  const oldPayload = loadOpenbiblePayload(options.oldPath, options.kind);
  const newPayload = loadOpenbiblePayload(options.newPath, options.kind);
  if (newPayload.header === null) {
    throw new Error(
      'runOpenbibleDelta: the candidate must be a raw payload (txt/zip) — its header line ' +
        'is the license record the check re-confirms; a subset witness has none',
    );
  }
  const restricted = oldPayload.kind === 'openbible-subset';
  const license = checkLicenseHeader(options.kind, oldPayload.header, newPayload.header);

  const label = (payload: LoadedOpenbiblePayload): string => {
    const rows = (payload.topicRows ?? payload.xrefRows ?? []).length;
    const noun = options.kind === 'topics' ? 'rows' : 'edges';
    return (
      `\`${basename(payload.path)}\` — ${payload.kind}, ${rows} ${noun}` +
      (payload.rejected > 0 ? ` (${payload.rejected} rejected)` : '') +
      `, sha256 \`${payload.sha256}\``
    );
  };

  const witnessNotes: string[] = [];
  let scopeNote: string;
  let outcome: OpenbibleOutcome;
  let delta: TopicDelta | XrefDelta;
  let report: string;

  if (options.kind === 'topics') {
    const conceptsDir =
      options.conceptsDir === undefined
        ? join(ROOT, '..', 'ontology', 'concepts')
        : options.conceptsDir;
    const consumed = conceptsDir === null ? null : collectConsumedTopics(conceptsDir);
    scopeNote = consumed
      ? `- consumed scope: ${consumed.topics.size} subscribed topic(s) across ` +
        `${consumed.conceptFileCount} concept files (${conceptsDir}) — the openbibleTopics ` +
        'subscriptions buildConceptLayer joins into anchors'
      : '- consumed scope: no consumed scope supplied — class (b) cannot be ruled out by ' +
        'this report; re-run with --concepts before treating (a) as final';
    if (restricted) {
      witnessNotes.push(
        '- witness caveat: the subset witness carries only subscribed-topic rows cut to ' +
          'the fixture corpus, so movement in unsubscribed topics and outside the fixture ' +
          'verses is invisible here; only the old FULL payload can widen the comparison. ' +
          'The witness carries no header, so the PINNED header wording (the manifest\'s ' +
          'licenseRecord quote) stands in as the old side of the license comparison.',
      );
    }
    const topicDelta = computeTopicDelta(
      oldPayload.topicRows ?? [],
      newPayload.topicRows ?? [],
      consumed,
      { restrictToWitness: restricted },
    );
    outcome = classifyTopicDelta(topicDelta, license, consumed !== null);
    delta = topicDelta;
    report = renderTopicReport(topicDelta, outcome, license, {
      kind: options.kind,
      oldLabel: label(oldPayload),
      newLabel: label(newPayload),
      restricted,
      scopeNote,
      witnessNotes,
      consumedByTopic: consumed?.conceptsByTopic ?? null,
    });
  } else {
    const committedPath =
      options.committedPath === undefined
        ? join(ROOT, 'fixtures', 'openbible-subset.json')
        : options.committedPath;
    const committed = committedPath === null ? null : loadCommittedXrefEvidence(committedPath);
    scopeNote = committed
      ? `- committed evidence: ${committed.size} edge(s) from ${committedPath} — the ` +
        'cross-references the fixture build ships'
      : '- committed evidence: no consumed scope supplied — class (b) cannot be ruled out ' +
        'by this report; re-run with --committed before treating (a) as final';
    if (restricted) {
      witnessNotes.push(
        '- witness caveat: the subset witness carries only edges with votes >= 1 cut to ' +
          'the fixture corpus, so adds, downvoted edges, and movement outside the fixture ' +
          'verses are invisible here; only the old FULL payload can widen the comparison. ' +
          'The witness carries no header, so the PINNED header wording (the manifest\'s ' +
          'licenseRecord quote) stands in as the old side of the license comparison.',
      );
    }
    const xrefDelta = computeXrefDelta(oldPayload.xrefRows ?? [], newPayload.xrefRows ?? [], committed, {
      restrictToWitness: restricted,
    });
    outcome = classifyXrefDelta(xrefDelta, license, committed !== null);
    delta = xrefDelta;
    report = renderXrefReport(xrefDelta, outcome, license, {
      kind: options.kind,
      oldLabel: label(oldPayload),
      newLabel: label(newPayload),
      restricted,
      scopeNote,
      witnessNotes,
      consumedByTopic: null,
    });
  }

  let exitCode = 0;
  if (options.check === true && outcome !== 'identical') {
    exitCode = outcome === 'license-stop' ? 2 : 1;
  }
  return { report, exitCode, outcome, delta, license };
}

function parseArgs(argv: readonly string[]): RunOptions & { out?: string } {
  const get = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const kind = get('--kind');
  const oldPath = get('--old');
  const newPath = get('--new');
  if ((kind !== 'topics' && kind !== 'xrefs') || !oldPath || !newPath) {
    throw new Error(
      'Usage: npx tsx scripts/openbibleDelta.ts --kind topics|xrefs --old <witness> ' +
        '--new <candidate> [--concepts <dir>|--no-concepts] ' +
        '[--committed <path>|--no-committed] [--out <file>] [--check]',
    );
  }
  return {
    kind,
    oldPath: resolve(oldPath),
    newPath: resolve(newPath),
    conceptsDir: argv.includes('--no-concepts') ? null : get('--concepts') ?? undefined,
    committedPath: argv.includes('--no-committed') ? null : get('--committed') ?? undefined,
    check: argv.includes('--check'),
    out: get('--out'),
  };
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const result = runOpenbibleDelta(options);
  if (options.out) {
    writeFileSync(options.out, result.report);
    process.stdout.write(`report written to ${options.out}\n`);
    process.stdout.write(`outcome: ${result.outcome}\n`);
  } else {
    process.stdout.write(result.report);
  }
  process.exitCode = result.exitCode;
}

// Only run when invoked as a script; tests import the pure functions and
// importing must never read the filesystem or exit.
if (process.argv[1] && process.argv[1].endsWith('openbibleDelta.ts')) {
  main();
}
