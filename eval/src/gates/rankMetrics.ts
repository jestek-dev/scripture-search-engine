/**
 * G12, battery half: the standing 84-query pastoral regression battery.
 *
 * Golden fixtures are concept-coverage-shaped (one per concept); the battery
 * is query-realism-shaped — nine categories of how church members actually
 * type. It is the one instrument that caught every harmful #1 in the
 * 2026-08-20 audit, so it lives in the repo as reviewed, versioned data and
 * re-runs on every artifact-bearing gauntlet run.
 *
 * The gate adjudicates nothing: grades and harmful flags are attributed
 * human judgments carried in eval/battery/judgments.json; this module only
 * computes set membership at ranks. Provisional (unratified) judgments are
 * loaded and reported but excluded from every failing check and every
 * aggregate — an unratified judgment must not gate.
 */

import { createHash } from 'node:crypto';

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';

import { parseAnchorRef } from '../../../pipeline/src/importers/ontologyImporter.js';

import { APPROVAL_EVIDENCE_PATH_PATTERN } from './probes.js';
import type { CorpusFixture } from './corpusGolden.js';
import {
  fail,
  gateApplicability,
  notApplicable,
  pass,
  warn,
  DEFAULT_GATE_RUN_CONTEXT,
  type GateFinding,
  type GateResult,
  type GateRunContext,
} from './types.js';

export const BATTERY_QUERIES_PATH = 'eval/battery/queries.json';
export const BATTERY_JUDGMENTS_PATH = 'eval/battery/judgments.json';

export const BATTERY_CATEGORIES = [
  'felt-need',
  'single-word',
  'remembered-phrase',
  'theological-term',
  'reference-adjacent',
  'misspelling',
  'adversarial',
  'multi-concept',
  'worship-leader',
] as const;

export type BatteryCategory = (typeof BATTERY_CATEGORIES)[number];

/**
 * Structural minimums live in `eval/budgets.json` (`rankQuality.battery.
 * categoryFloors`) as reviewed data — known facts about the committed
 * specimen set, deliberately not guessed quality numbers, which stay null
 * there until baselined. An active-query count below any floor means the
 * battery has been hollowed out, which is a gate FAIL naming the category.
 */
export type BatteryCategoryFloors = Readonly<Record<BatteryCategory, number>>;

const QUERY_FIELDS = ['id', 'query', 'category', 'status', 'addedAt', 'origin', 'retiredAt', 'retirementNote'] as const;
const QUERIES_FILE_FIELDS = ['$schema', 'batteryVersion', 'policy', 'queries'] as const;
const JUDGED_ROW_FIELDS = ['ref', 'grade', 'basis', 'judgedBy', 'judgedAt', 'provisional'] as const;
const HARMFUL_ROW_FIELDS = ['ref', 'why', 'judgedBy', 'judgedAt', 'provisional'] as const;
const EMPTY_FIELDS = ['why', 'judgedBy', 'judgedAt'] as const;
const JUDGMENT_ENTRY_FIELDS = ['judged', 'harmful', 'legitimatelyEmpty'] as const;
const JUDGMENTS_FILE_FIELDS = [
  '$schema', 'batteryVersion', 'gradeMeanings', 'harmfulMeaning', 'provisionalPolicy', 'judgments',
] as const;

export interface BatteryJudgedRange {
  readonly ref: string;
  readonly grade: 0 | 1 | 2 | 3;
  readonly provisional: boolean;
  readonly range: { readonly start: number; readonly end: number };
}

export interface BatteryHarmfulRange {
  readonly ref: string;
  readonly why: string;
  readonly provisional: boolean;
  readonly range: { readonly start: number; readonly end: number };
}

export interface ValidatedBatteryQuery {
  readonly id: string;
  readonly query: string;
  readonly category: BatteryCategory;
  /** Provenance carried through for process criteria (tier S5's battery growth). */
  readonly addedAt: string;
  readonly origin: string;
  readonly judged: readonly BatteryJudgedRange[];
  readonly harmful: readonly BatteryHarmfulRange[];
  readonly legitimatelyEmpty: boolean;
}

export interface ValidatedBattery {
  readonly batteryVersion: number;
  /** Active queries in exact file order — the deterministic execution order. */
  readonly queries: readonly ValidatedBatteryQuery[];
  readonly activeQueries: number;
  readonly judgedRows: number;
  readonly harmfulRows: number;
  readonly provisionalRows: number;
  readonly findings: readonly GateFinding[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function category(code: string): string {
  return `sse.gauntlet.v1.finding.g12-battery.${code}`;
}

function finding(code: string, message: string, subjects?: readonly string[]): GateFinding {
  return { message, categoryCode: category(code), ...(subjects ? { subjects: [...subjects] } : {}) };
}

function unknownFields(
  record: Record<string, unknown>,
  allowed: readonly string[],
  location: string,
  findings: GateFinding[],
): void {
  for (const key of Object.keys(record)) {
    if (!allowed.includes(key)) {
      findings.push(finding('schema', `${location} has unknown field "${key}"`));
    }
  }
}

function requireString(
  record: Record<string, unknown>,
  field: string,
  location: string,
  findings: GateFinding[],
): string | null {
  const value = record[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    findings.push(finding('schema', `${location}.${field} must be a non-empty string`));
    return null;
  }
  return value;
}

function parseProvisional(
  record: Record<string, unknown>,
  location: string,
  findings: GateFinding[],
): boolean {
  if (!('provisional' in record)) return false;
  if (record['provisional'] !== true) {
    findings.push(finding('schema', `${location}.provisional may only be literally true (omit it once ratified)`));
    return false;
  }
  return true;
}

function parseRange(
  record: Record<string, unknown>,
  location: string,
  findings: GateFinding[],
): { ref: string; range: { start: number; end: number } } | null {
  const ref = requireString(record, 'ref', location, findings);
  if (ref === null) return null;
  const range = parseAnchorRef(ref);
  if (!range) {
    findings.push(finding('schema', `${location}.ref "${ref}" is not a canonical scripture range`));
    return null;
  }
  return { ref, range };
}

export function rangesOverlap(
  left: { start: number; end: number },
  right: { start: number; end: number },
): boolean {
  return left.start <= right.end && right.start <= left.end;
}

/**
 * Validates the two battery files against the reviewed-data schema. Never
 * throws on bad data — every problem becomes a finding, so a PR author sees
 * the complete list in one run.
 *
 * `floors` is the reviewed `rankQuality.battery.categoryFloors` record from
 * eval/budgets.json (via validateRankQualityBlock), or null when that block
 * is missing or malformed — which is itself a finding here: a battery whose
 * structural minimums cannot be read must not be certified structurally sound.
 */
export function validateBattery(
  queriesFile: unknown,
  judgmentsFile: unknown,
  floors: BatteryCategoryFloors | null,
): ValidatedBattery {
  const findings: GateFinding[] = [];
  const queries: ValidatedBatteryQuery[] = [];
  let judgedRows = 0;
  let harmfulRows = 0;
  let provisionalRows = 0;
  let batteryVersion = 0;

  if (!isRecord(queriesFile)) {
    findings.push(finding('schema', `${BATTERY_QUERIES_PATH} is missing or not a JSON object`));
  }
  if (!isRecord(judgmentsFile)) {
    findings.push(finding('schema', `${BATTERY_JUDGMENTS_PATH} is missing or not a JSON object`));
  }
  if (!isRecord(queriesFile) || !isRecord(judgmentsFile)) {
    return { batteryVersion, queries, activeQueries: 0, judgedRows, harmfulRows, provisionalRows, findings };
  }

  unknownFields(queriesFile, QUERIES_FILE_FIELDS, BATTERY_QUERIES_PATH, findings);
  unknownFields(judgmentsFile, JUDGMENTS_FILE_FIELDS, BATTERY_JUDGMENTS_PATH, findings);
  if (queriesFile['batteryVersion'] !== 1 || judgmentsFile['batteryVersion'] !== 1) {
    findings.push(finding('schema', 'batteryVersion must be 1 in both battery files'));
  } else {
    batteryVersion = 1;
  }

  const queryRows = queriesFile['queries'];
  const judgments = judgmentsFile['judgments'];
  if (!Array.isArray(queryRows)) {
    findings.push(finding('schema', `${BATTERY_QUERIES_PATH}.queries must be an array`));
  }
  if (!isRecord(judgments)) {
    findings.push(finding('schema', `${BATTERY_JUDGMENTS_PATH}.judgments must be an object keyed by query id`));
  }
  if (!Array.isArray(queryRows) || !isRecord(judgments)) {
    return { batteryVersion, queries, activeQueries: 0, judgedRows, harmfulRows, provisionalRows, findings };
  }

  const seenIds = new Set<string>();
  const activePerCategory = new Map<BatteryCategory, number>();

  for (const [index, row] of queryRows.entries()) {
    const location = `queries[${index}]`;
    if (!isRecord(row)) {
      findings.push(finding('schema', `${location} must be an object`));
      continue;
    }
    unknownFields(row, QUERY_FIELDS, location, findings);
    const id = requireString(row, 'id', location, findings);
    const query = requireString(row, 'query', location, findings);
    const addedAt = requireString(row, 'addedAt', location, findings);
    const origin = requireString(row, 'origin', location, findings);
    const categoryName = row['category'];
    const status = row['status'];
    if (id === null || query === null) continue;
    if (!/^[a-z]+\d+$/.test(id)) {
      findings.push(finding('schema', `${location}.id "${id}" must be a category prefix plus a number`, [id]));
      continue;
    }
    if (seenIds.has(id)) {
      findings.push(finding('schema', `duplicate query id "${id}"`, [id]));
      continue;
    }
    seenIds.add(id);
    if (typeof categoryName !== 'string' || !(BATTERY_CATEGORIES as readonly string[]).includes(categoryName)) {
      findings.push(finding('schema', `${location} (${id}) has unknown category "${String(categoryName)}"`, [id]));
      continue;
    }
    if (status !== 'active' && status !== 'retired') {
      findings.push(finding('schema', `${location} (${id}) status must be "active" or "retired"`, [id]));
      continue;
    }
    if (status === 'retired') {
      // Queries are append-only specimens: retirement is the only exit, and
      // it must carry its own review trail.
      if (typeof row['retiredAt'] !== 'string' || typeof row['retirementNote'] !== 'string'
          || row['retirementNote'].trim().length === 0) {
        findings.push(finding('retirement', `${location} (${id}) is retired without retiredAt + retirementNote`, [id]));
      }
      continue;
    }
    if (row['retiredAt'] !== undefined || row['retirementNote'] !== undefined) {
      findings.push(finding('schema', `${location} (${id}) is active but carries retirement fields`, [id]));
    }

    const cat = categoryName as BatteryCategory;
    activePerCategory.set(cat, (activePerCategory.get(cat) ?? 0) + 1);

    const entryValue = judgments[id];
    const judged: BatteryJudgedRange[] = [];
    const harmful: BatteryHarmfulRange[] = [];
    let legitimatelyEmpty = false;

    if (entryValue !== undefined) {
      if (!isRecord(entryValue)) {
        findings.push(finding('schema', `judgments.${id} must be an object`, [id]));
      } else {
        unknownFields(entryValue, JUDGMENT_ENTRY_FIELDS, `judgments.${id}`, findings);
        const judgedValue = entryValue['judged'];
        if (judgedValue !== undefined && !Array.isArray(judgedValue)) {
          findings.push(finding('schema', `judgments.${id}.judged must be an array`, [id]));
        }
        for (const [rowIndex, judgedRow] of (Array.isArray(judgedValue) ? judgedValue : []).entries()) {
          const rowLocation = `judgments.${id}.judged[${rowIndex}]`;
          if (!isRecord(judgedRow)) {
            findings.push(finding('schema', `${rowLocation} must be an object`, [id]));
            continue;
          }
          unknownFields(judgedRow, JUDGED_ROW_FIELDS, rowLocation, findings);
          requireString(judgedRow, 'basis', rowLocation, findings);
          requireString(judgedRow, 'judgedBy', rowLocation, findings);
          requireString(judgedRow, 'judgedAt', rowLocation, findings);
          const provisional = parseProvisional(judgedRow, rowLocation, findings);
          const grade = judgedRow['grade'];
          if (!Number.isInteger(grade) || (grade as number) < 0 || (grade as number) > 3) {
            findings.push(finding('schema', `${rowLocation}.grade must be an integer 0-3, got ${String(grade)}`, [id]));
            continue;
          }
          const parsed = parseRange(judgedRow, rowLocation, findings);
          if (!parsed) continue;
          const overlapping = judged.find((existing) => rangesOverlap(existing.range, parsed.range));
          if (overlapping) {
            findings.push(finding(
              'duplicate-range',
              `${rowLocation} "${parsed.ref}" overlaps the judged range "${overlapping.ref}" — ` +
                'claim-once matching needs disjoint judged ranges per query',
              [id],
            ));
            continue;
          }
          judged.push({ ref: parsed.ref, grade: grade as 0 | 1 | 2 | 3, provisional, range: parsed.range });
          judgedRows += 1;
          if (provisional) provisionalRows += 1;
        }

        const harmfulValue = entryValue['harmful'];
        if (harmfulValue !== undefined && !Array.isArray(harmfulValue)) {
          findings.push(finding('schema', `judgments.${id}.harmful must be an array`, [id]));
        }
        for (const [rowIndex, harmfulRow] of (Array.isArray(harmfulValue) ? harmfulValue : []).entries()) {
          const rowLocation = `judgments.${id}.harmful[${rowIndex}]`;
          if (!isRecord(harmfulRow)) {
            findings.push(finding('schema', `${rowLocation} must be an object`, [id]));
            continue;
          }
          unknownFields(harmfulRow, HARMFUL_ROW_FIELDS, rowLocation, findings);
          const why = requireString(harmfulRow, 'why', rowLocation, findings);
          requireString(harmfulRow, 'judgedBy', rowLocation, findings);
          requireString(harmfulRow, 'judgedAt', rowLocation, findings);
          const provisional = parseProvisional(harmfulRow, rowLocation, findings);
          const parsed = parseRange(harmfulRow, rowLocation, findings);
          if (!parsed || why === null) continue;
          const overlapping = harmful.find((existing) => rangesOverlap(existing.range, parsed.range));
          if (overlapping) {
            findings.push(finding(
              'duplicate-range',
              `${rowLocation} "${parsed.ref}" overlaps the harmful range "${overlapping.ref}"`,
              [id],
            ));
            continue;
          }
          harmful.push({ ref: parsed.ref, why, provisional, range: parsed.range });
          harmfulRows += 1;
          if (provisional) provisionalRows += 1;
        }

        const emptyValue = entryValue['legitimatelyEmpty'];
        if (emptyValue !== undefined) {
          if (!isRecord(emptyValue)) {
            findings.push(finding('schema', `judgments.${id}.legitimatelyEmpty must be an object`, [id]));
          } else {
            unknownFields(emptyValue, EMPTY_FIELDS, `judgments.${id}.legitimatelyEmpty`, findings);
            requireString(emptyValue, 'why', `judgments.${id}.legitimatelyEmpty`, findings);
            requireString(emptyValue, 'judgedBy', `judgments.${id}.legitimatelyEmpty`, findings);
            requireString(emptyValue, 'judgedAt', `judgments.${id}.legitimatelyEmpty`, findings);
            legitimatelyEmpty = true;
          }
        }
      }
    }

    if (legitimatelyEmpty && judged.length > 0) {
      findings.push(finding(
        'contradiction',
        `judgments.${id} declares legitimatelyEmpty beside ${judged.length} judged row(s) — pick one`,
        [id],
      ));
    }
    if (judged.length === 0 && !legitimatelyEmpty) {
      // The battery cannot silently accumulate unmeasured queries. A harmful
      // row alone does not count: it says what must NOT surface, never what
      // should.
      findings.push(finding(
        'unjudged-query',
        `active query ${id} ("${query}") has no judged rows and no legitimatelyEmpty record`,
        [id],
      ));
    }

    queries.push({
      id, query, category: cat, addedAt: addedAt ?? '', origin: origin ?? '', judged, harmful, legitimatelyEmpty,
    });
  }

  for (const id of Object.keys(judgments)) {
    if (!seenIds.has(id)) {
      findings.push(finding('orphan-judgment', `judgments.${id} does not match any battery query id`, [id]));
    }
  }

  if (floors === null) {
    findings.push(finding(
      'category-floors-unavailable',
      'battery category floors are unavailable — eval/budgets.json rankQuality.battery.categoryFloors ' +
        'is missing or malformed, so the battery\'s structural minimums cannot be certified',
    ));
  } else {
    for (const categoryName of BATTERY_CATEGORIES) {
      const floor = floors[categoryName];
      const active = activePerCategory.get(categoryName) ?? 0;
      if (active < floor) {
        findings.push(finding(
          'category-floor',
          `category "${categoryName}" has ${active} active quer(ies), below its structural floor of ${floor}`,
          [categoryName],
        ));
      }
    }
  }

  return {
    batteryVersion,
    queries,
    activeQueries: queries.length,
    judgedRows,
    harmfulRows,
    provisionalRows,
    findings,
  };
}

export interface BatteryResultEntry {
  readonly rank: number;
  readonly targetId: string;
  readonly reference: string;
  /** Rounded to 6 dp, the same discipline as the G2 ordering snapshot. */
  readonly score: number;
  /** Sorted unique reason families — the evidence shape behind the rank. */
  readonly families: readonly string[];
}

export interface BatteryQueryOutcome {
  readonly id: string;
  readonly query: string;
  readonly kind: 'discovery' | 'reference' | 'invalid-reference';
  readonly top: readonly BatteryResultEntry[];
  /** Only for reference outcomes: the resolved passage label. */
  readonly passageReference?: string;
}

function roundScore(value: number): number {
  return Number(value.toFixed(6));
}

/**
 * Executes every active query in file order against the engine's public API
 * and records the top-10 shape. Read-only evaluation: no judgment matching
 * happens here — the gate and (later) the rank metrics consume the outcomes.
 */
export async function runBattery(
  engine: ScriptureEngine,
  validated: ValidatedBattery,
): Promise<BatteryQueryOutcome[]> {
  const outcomes: BatteryQueryOutcome[] = [];
  for (const query of validated.queries) {
    const result = await engine.research(query.query);
    if (result.kind === 'discovery') {
      outcomes.push({
        id: query.id,
        query: query.query,
        kind: 'discovery',
        top: result.results.slice(0, 10).map((entry, index) => ({
          rank: index + 1,
          targetId: entry.targetId,
          reference: entry.reference,
          score: roundScore(entry.score),
          families: [...new Set(entry.reasons.map((reason) => reason.family))].sort(),
        })),
      });
    } else if (result.kind === 'reference') {
      outcomes.push({
        id: query.id,
        query: query.query,
        kind: 'reference',
        top: [],
        passageReference: result.passage.reference,
      });
    } else {
      outcomes.push({ id: query.id, query: query.query, kind: 'invalid-reference', top: [] });
    }
  }
  return outcomes;
}

/**
 * Verse id encoded in a target id like "WEB:59001022" — the same
 * range-overlap semantics the golden fixtures use, so battery judgments and
 * fixtures can never disagree about what "the same passage" means.
 */
function verseIdOf(targetId: string): number | null {
  const numeric = targetId.split(':')[1];
  if (!numeric) return null;
  const value = Number(numeric);
  return Number.isFinite(value) ? value : null;
}

/** 1-based rank of the first result overlapping the range, or null if none does. */
function firstRankInRange(
  outcome: BatteryQueryOutcome,
  range: { start: number; end: number },
): number | null {
  for (const entry of outcome.top) {
    const verseId = verseIdOf(entry.targetId);
    if (verseId !== null && verseId >= range.start && verseId <= range.end) return entry.rank;
  }
  return null;
}

/** Key for the harmful-guard corpus-presence map: one guard per (query, ref). */
export function harmfulPresenceKey(queryId: string, ref: string): string {
  return `${queryId}::${ref}`;
}

/**
 * Asks the corpus, through the engine's public passage API, whether each
 * harmful guard's reference resolves to any verse actually present. A guard
 * naming an absent passage can never fire — reporting that vacuity (rather
 * than letting the guard pass silently) is the F34 lesson made structural.
 */
export async function probeHarmfulRefPresence(
  engine: Pick<ScriptureEngine, 'passage'>,
  validated: ValidatedBattery,
): Promise<ReadonlyMap<string, boolean>> {
  const presence = new Map<string, boolean>();
  for (const query of validated.queries) {
    for (const harmful of query.harmful) {
      const result = await engine.passage(harmful.ref);
      presence.set(
        harmfulPresenceKey(query.id, harmful.ref),
        result.kind === 'passage' && result.passage.verses.length > 0,
      );
    }
  }
  return presence;
}

export const BATTERY_GATE_TITLE = 'Pastoral battery';

/**
 * The G12 roster row. Its own row, never merged into G3: mergeGateResults
 * returns pass when a not-applicable sub-result sits beside passing ones,
 * which would swallow an unrun battery into a green row — the exact "unrun
 * check reports pass" pattern CLAUDE.md forbids.
 */
export function batteryGate(input: {
  readonly validated: ValidatedBattery;
  /** null on fixture-database runs — the battery measures a real artifact. */
  readonly outcomes: readonly BatteryQueryOutcome[] | null;
  /**
   * Corpus presence per harmful guard (probeHarmfulRefPresence), or null
   * when nothing was probed. Required, not defaulted: a caller that loses
   * this input degrades to a visible vacuity warning, never to a silent
   * certification that every guard can fire.
   */
  readonly harmfulPresence: ReadonlyMap<string, boolean> | null;
  /**
   * File-level findings from the rank instrument's own reviewed data — a
   * malformed rankQuality block in eval/budgets.json, or a committed
   * rank-metrics baseline whose independent approval is missing, tampered,
   * or mismatched. Checked in every context, exactly like the battery's own
   * structural validation: an instrument whose configuration is broken must
   * fail on fixture runs too, not wait for an artifact run to be noticed.
   */
  readonly instrumentFindings?: readonly GateFinding[];
  readonly context: GateRunContext;
}): GateResult {
  const { validated, outcomes } = input;
  const context = input.context ?? DEFAULT_GATE_RUN_CONTEXT;

  const structuralFindings = [...validated.findings, ...(input.instrumentFindings ?? [])];
  if (structuralFindings.length > 0) {
    // Structural integrity of reviewed data is checkable in every context,
    // and a malformed battery file must never wait for an artifact run to
    // be noticed.
    return fail(
      'G12-battery',
      BATTERY_GATE_TITLE,
      `battery/rank-instrument files failed structural validation (${structuralFindings.length} finding(s))`,
      structuralFindings,
      {
        activeQueries: validated.activeQueries,
        judgedRows: validated.judgedRows,
        harmfulRows: validated.harmfulRows,
        provisionalRows: validated.provisionalRows,
      },
      context,
    );
  }

  if (outcomes === null) {
    return notApplicable(
      'G12-battery',
      BATTERY_GATE_TITLE,
      `${validated.activeQueries} active quer(ies) validated structurally; execution measures the ` +
        'release/candidate artifact and does not run against the fixture subset corpus — run with ' +
        '--release-database or --candidate-* to execute the battery',
      context,
    );
  }

  // Hard-fail surface: a non-provisional harmful judgment overlapping rank 1.
  // Evaluated first and independently of every aggregate — this check reads
  // no thresholds, no nDCG, no budgets, so nothing can be tuned to outvote
  // it. Provisional rows never gate; they are counted and reported instead.
  const failures: GateFinding[] = [];
  const vacuity: GateFinding[] = [];
  let provisionalHarmfulAtRank1 = 0;
  let harmfulInTop3 = 0;
  let harmfulInTop10 = 0;
  let vacuousHarmfulGuards = 0;
  let unprobedHarmfulGuards = 0;
  const byId = new Map(validated.queries.map((query) => [query.id, query]));
  for (const outcome of outcomes) {
    const query = byId.get(outcome.id);
    if (!query || outcome.kind !== 'discovery') continue;
    for (const harmful of query.harmful) {
      const rank = firstRankInRange(outcome, harmful.range);
      if (rank !== null && !harmful.provisional) {
        // S-tier inputs, computed and reported here, gated only at #1 for now.
        if (rank <= 3) harmfulInTop3 += 1;
        harmfulInTop10 += 1;
      }
      if (rank === 1) {
        if (harmful.provisional) {
          provisionalHarmfulAtRank1 += 1;
        } else {
          failures.push(finding(
            'harmful-at-rank-1',
            `${outcome.id} ("${outcome.query}"): #1 result ${outcome.top[0]!.reference} overlaps the ` +
              `harmful judgment ${harmful.ref} — ${harmful.why}`,
            [outcome.id],
          ));
        }
        continue;
      }
      if (rank !== null) continue; // observed in the results: presence is proven.
      // The guard never fired. Distinguish "held" from "cannot fire": a
      // reference absent from the corpus protects nothing, and saying so is
      // the difference between a guard and a decoration (F34).
      const present = input.harmfulPresence?.get(harmfulPresenceKey(outcome.id, harmful.ref));
      if (present === false) {
        vacuousHarmfulGuards += 1;
        vacuity.push(finding(
          'harmful-guard-vacuous',
          `${outcome.id} ("${outcome.query}"): harmful guard ${harmful.ref}` +
            `${harmful.provisional ? ' (provisional)' : ''} is VACUOUS — the reference resolves to ` +
            'no verse in this corpus, so the guard cannot protect anything until the corpus carries it',
          [outcome.id],
        ));
      } else if (present === undefined) {
        unprobedHarmfulGuards += 1;
      }
    }
  }
  if (unprobedHarmfulGuards > 0) {
    vacuity.push(finding(
      'harmful-guard-vacuity-unprobed',
      `${unprobedHarmfulGuards} harmful guard(s) were not probed for corpus presence — their ` +
        'vacuity cannot be certified either way; run probeHarmfulRefPresence and pass the result in',
    ));
  }

  const metrics = {
    activeQueries: validated.activeQueries,
    executedQueries: outcomes.length,
    judgedRows: validated.judgedRows,
    harmfulRows: validated.harmfulRows,
    provisionalRows: validated.provisionalRows,
    harmfulAtRank1: failures.length,
    provisionalHarmfulAtRank1,
    harmfulInTop3,
    harmfulInTop10,
    vacuousHarmfulGuards,
    unprobedHarmfulGuards,
  };
  const summary =
    `${validated.activeQueries} active, ${validated.judgedRows} judged row(s), ` +
    `${validated.provisionalRows} provisional (judged + harmful)` +
    (provisionalHarmfulAtRank1 > 0
      ? `; ${provisionalHarmfulAtRank1} provisional harmful judgment(s) at #1 (non-gating until ratified)`
      : '');

  if (failures.length > 0) {
    return fail(
      'G12-battery',
      BATTERY_GATE_TITLE,
      `${failures.length} harmful #1 result(s) against ratified judgments`,
      failures,
      metrics,
      context,
    );
  }
  if (vacuity.length > 0) {
    return warn(
      'G12-battery',
      BATTERY_GATE_TITLE,
      `${summary}; ${vacuousHarmfulGuards} vacuous harmful guard(s), ` +
        `${unprobedHarmfulGuards} unprobed`,
      vacuity,
      metrics,
      context,
    );
  }
  return pass('G12-battery', BATTERY_GATE_TITLE, summary, metrics, context);
}

/** The machine-report battery evidence: file digests plus per-query outcomes. */
export interface BatteryReportSection {
  readonly batteryVersion: number;
  readonly queriesSha256: string;
  readonly judgmentsSha256: string;
  readonly activeQueries: number;
  readonly judgedRows: number;
  readonly provisionalRows: number;
  readonly results: readonly BatteryQueryOutcome[];
}

export function buildBatterySection(input: {
  readonly queriesSha256: string;
  readonly judgmentsSha256: string;
  readonly validated: ValidatedBattery;
  readonly outcomes: readonly BatteryQueryOutcome[];
}): BatteryReportSection {
  return {
    batteryVersion: input.validated.batteryVersion,
    queriesSha256: input.queriesSha256,
    judgmentsSha256: input.judgmentsSha256,
    activeQueries: input.validated.activeQueries,
    judgedRows: input.validated.judgedRows,
    provisionalRows: input.validated.provisionalRows,
    results: input.outcomes,
  };
}

export interface BatteryJobCheck {
  readonly ok: boolean;
  readonly problems: readonly string[];
  /**
   * The tolerated non-G12 rows and the run verdict — printed by the CI job
   * so a REJECT the job tolerates stays visible, never hidden.
   */
  readonly advisory: readonly string[];
}

/**
 * The full-artifact CI job's SOLE success criterion. Fail-closed by
 * construction: no report (the early-abort case), a G12 row that did not
 * run, and a G12 row that ran and failed are all red — "battery did not
 * run" must never look like "battery passed".
 */
export function checkBatteryJobReport(parsed: unknown): BatteryJobCheck {
  const problems: string[] = [];
  const advisory: string[] = [];
  if (!isRecord(parsed)) {
    return {
      ok: false,
      problems: [
        'no report or unparsable report — an early-abort gauntlet run writes no machine report, so a ' +
          'missing file is job-red, never job-green',
      ],
      advisory,
    };
  }
  const payload = parsed['payload'];
  if (!isRecord(payload) || !Array.isArray(payload['gates'])) {
    return { ok: false, problems: ['report payload or gate list is malformed'], advisory };
  }
  advisory.push(`run verdict: ${String(payload['verdict'])}`);
  const gates = payload['gates'].filter(isRecord);
  const batteryRows = gates.filter((gate) => gate['gate'] === 'G12-battery');
  for (const gate of gates) {
    if (gate['gate'] === 'G12-battery') continue;
    advisory.push(`${String(gate['gate'])}: ${String(gate['status'])} — ${String(gate['summary'])}`);
  }
  if (batteryRows.length !== 1) {
    problems.push(`report contains ${batteryRows.length} G12-battery row(s); expected exactly 1`);
  } else {
    const row = batteryRows[0]!;
    if (row['status'] === 'not-applicable') {
      problems.push(`G12-battery did not run: ${String(row['summary'])}`);
    } else if (row['status'] === 'warn') {
      // warn is the vacuity-honesty state (guards that cannot fire on this
      // corpus). It maps to ADMIT_WITH_WARNINGS, never REJECT, so the job
      // mirrors that: tolerated, but printed where nobody can miss it.
      // S-tier is where zero-vacuity becomes a hard requirement.
      advisory.push(`G12-battery warn (tolerated, non-blocking): ${String(row['summary'])}`);
    } else if (row['status'] !== 'pass') {
      problems.push(`G12-battery status is "${String(row['status'])}": ${String(row['summary'])}`);
    }
    if (row['applicability'] !== 'required') {
      problems.push(
        `G12-battery applicability is "${String(row['applicability'])}" — an artifact-bearing run must ` +
          'report the battery as required',
      );
    }
  }
  if (!isRecord(payload['battery'])) {
    problems.push('report carries no battery evidence section');
  }
  return { ok: problems.length === 0, problems, advisory };
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

/**
 * Canonical serialization of the sections the two OS legs must byte-agree
 * on: the G12 row plus the battery, rank-metric, and no-effect evidence.
 * Deliberately excludes G11 and timestamps, which legitimately differ
 * between legs; the rank metrics are all-integer arithmetic, so their
 * agreement is a strict guarantee, not an aspiration.
 */
export function batteryComparableSection(parsed: unknown): string {
  if (!isRecord(parsed)) return 'missing-report';
  const payload = parsed['payload'];
  if (!isRecord(payload) || !Array.isArray(payload['gates'])) return 'malformed-report';
  const g12 = payload['gates'].filter((gate) => isRecord(gate) && gate['gate'] === 'G12-battery');
  return canonicalJson({
    g12,
    battery: payload['battery'] ?? null,
    rankMetrics: payload['rankMetrics'] ?? null,
    noMeasurableEffect: payload['noMeasurableEffect'] ?? null,
    tiers: payload['tiers'] ?? null,
  });
}

// ---------------------------------------------------------------------------
// Rank metrics (E3): graded gains, deterministic nDCG@10 / MRR@10 /
// goodOrBetterTop3Rate / Recall@50, and NO_MEASURABLE_EFFECT detection.
//
// Everything below is measurement, never adjudication: gains come from the
// attributed human judgments above and from golden-fixture pins, and no
// threshold is enforced here — rank-quality thresholds stay null until a
// real baseline exists (E5). Arithmetic is integer/bigint only, so both OS
// legs byte-agree by construction rather than by tolerance.
// ---------------------------------------------------------------------------

/**
 * Linear gains {0,1,2,3} (J30), chosen over exponential 2^g-1 deliberately:
 * with a four-level scale the exponential form lets one grade-3 hit (gain 7)
 * mask a top-10 otherwise full of junk. #1-primacy is enforced by harder
 * instruments (the harmful-#1 hard-fail, preferredOrder, withinTop: 1).
 * Changing this scale re-baselines and is a reviewed PR.
 */
export const RANK_GAIN_SCALE = 'linear-0-1-2-3';

/**
 * DISCOUNT_MICRO[rank-1] = floor(10^6 / log2(rank + 1)) for ranks 1..10,
 * derived once by hand and committed. Runtime code must read this table and
 * never call Math.log2: JS logarithms are implementation-varying across
 * engines and platforms, and a metric that gates admission must not depend
 * on libm. The unit test asserts each value against an independently
 * transcribed literal table.
 */
export const DISCOUNT_MICRO: readonly number[] = [
  1000000, 630929, 500000, 430676, 386852, 356207, 333333, 315464, 301029, 289064,
];

const MICRO = 1000000n;

export interface VerseRange {
  readonly start: number;
  readonly end: number;
}

/** Verse-range form of a ranked result; battery target ids are single verses. */
export function verseRangeOfTargetId(targetId: string): VerseRange | null {
  const verseId = verseIdOf(targetId);
  return verseId === null ? null : { start: verseId, end: verseId };
}

/**
 * Rounds a non-negative rational to an integer count of micro units
 * (value x 10^6), ties to even. Display-only: threshold checks go through
 * meetsThresholdMicro so rounding can never decide a gate.
 */
export function roundHalfEvenMicro(numerator: bigint, denominator: bigint): number {
  if (denominator <= 0n || numerator < 0n) {
    throw new RangeError('roundHalfEvenMicro expects a non-negative rational with a positive denominator.');
  }
  const scaled = numerator * MICRO;
  let quotient = scaled / denominator;
  const doubledRemainder = (scaled % denominator) * 2n;
  if (doubledRemainder > denominator || (doubledRemainder === denominator && quotient % 2n === 1n)) {
    quotient += 1n;
  }
  return Number(quotient);
}

/**
 * Exact threshold comparison by integer cross-multiplication:
 * num/den >= threshold/10^6. A null threshold returns null — deliberately
 * unset until a real baseline exists; it never passes and never fails.
 */
export function meetsThresholdMicro(
  numerator: bigint,
  denominator: bigint,
  thresholdMicro: number | null,
): boolean | null {
  if (thresholdMicro === null) return null;
  return numerator * MICRO >= BigInt(thresholdMicro) * denominator;
}

interface Rational {
  readonly num: bigint;
  readonly den: bigint;
}

const ZERO: Rational = { num: 0n, den: 1n };

function addRational(left: Rational, right: Rational): Rational {
  // Reduced at every step: exactness is unaffected and the accumulator's
  // digits stay bounded by the true lcm of denominators, not their product.
  return reduceRational({
    num: left.num * right.den + right.num * left.den,
    den: left.den * right.den,
  });
}

function gcd(left: bigint, right: bigint): bigint {
  let a = left < 0n ? -left : left;
  let b = right < 0n ? -right : right;
  while (b !== 0n) [a, b] = [b, a % b];
  return a === 0n ? 1n : a;
}

function reduceRational(value: Rational): Rational {
  const divisor = gcd(value.num, value.den);
  return { num: value.num / divisor, den: value.den / divisor };
}

export interface RankMetricValue {
  /** Reduced exact rational "numerator/denominator"; null with no scoreable queries. */
  readonly exact: string | null;
  /** Display value in micro units (x 10^-6), rounded half-even once. */
  readonly micro: number | null;
}

function metricValue(sum: Rational, count: number): RankMetricValue {
  if (count === 0) return { exact: null, micro: null };
  const mean = reduceRational({ num: sum.num, den: sum.den * BigInt(count) });
  return { exact: `${mean.num}/${mean.den}`, micro: roundHalfEvenMicro(mean.num, mean.den) };
}

export interface RankQueryInput {
  readonly id: string;
  readonly category: string;
  readonly judged: readonly BatteryJudgedRange[];
  /** Ranked verse ranges, best first, from the default engine page. */
  readonly top10: readonly VerseRange[];
  /** Ranked verse ranges from the dedicated limit-50 engine instance. */
  readonly top50: readonly VerseRange[];
}

export interface RankQueryMetrics {
  readonly id: string;
  readonly category: string;
  /** IDCG > 0: at least one non-provisional judged row with gain >= 1. */
  readonly scoreable: boolean;
  /** "judged results / results" over the top 10 — coverage pressure, per query. */
  readonly judgedCoverageTop10: string;
  readonly dcgMicro: number;
  readonly idcgMicro: number;
  readonly ndcgMicro: number | null;
  /** Exact reciprocal rank of the first gain >= 2, "0/1" when none. */
  readonly mrr: string;
  readonly goodOrBetterTop3: boolean;
  /** "claimed relevant / judged relevant" over the top 50; null when unscoreable. */
  readonly recallAt50: string | null;
}

export interface RankAggregate {
  readonly scoreableQueries: number;
  /** IDCG=0 queries: excluded from every mean and counted, never scored 0 or 1. */
  readonly excludedQueries: number;
  readonly ndcg10: RankMetricValue;
  readonly mrr10: RankMetricValue;
  readonly goodOrBetterTop3Rate: RankMetricValue;
  readonly recallAt50: RankMetricValue;
}

export interface RankMetricsReport {
  readonly gainScale: typeof RANK_GAIN_SCALE;
  readonly overall: RankAggregate;
  readonly perCategory: Readonly<Record<string, RankAggregate>>;
  readonly queries: readonly RankQueryMetrics[];
}

interface ClaimAssignment {
  readonly gains: readonly number[];
  readonly claimedResults: number;
}

/**
 * Claim-once judgment matching. Walking ranks best-first, a result's gain is
 * the grade of the highest-graded not-yet-claimed judged range its verse
 * range overlaps; ties between same-grade ranges break to the lowest start
 * verse id — a total, deterministic rule, and which range is consumed
 * changes later results' gains, so it must be pinned. Each judged range is
 * claimable once: a duplicate hit collects nothing.
 */
function assignClaims(top: readonly VerseRange[], judged: readonly BatteryJudgedRange[]): ClaimAssignment {
  const claimed = new Set<number>();
  let claimedResults = 0;
  const gains = top.map((entry) => {
    let best: { index: number; grade: number; start: number } | null = null;
    for (const [index, row] of judged.entries()) {
      if (claimed.has(index) || !rangesOverlap(entry, row.range)) continue;
      if (best === null || row.grade > best.grade
          || (row.grade === best.grade && row.range.start < best.start)) {
        best = { index, grade: row.grade, start: row.range.start };
      }
    }
    if (best === null) return 0;
    claimed.add(best.index);
    claimedResults += 1;
    return best.grade;
  });
  return { gains, claimedResults };
}

export function assignGains(top: readonly VerseRange[], judged: readonly BatteryJudgedRange[]): number[] {
  return [...assignClaims(top, judged).gains];
}

/**
 * The one definition of "good-or-better@3": a claimed gain of at least 2
 * (good) within the first three ranks. computeRankMetrics and the tier
 * report's independent recomputation deliberately share nothing except this
 * definition — a drifted private copy would let the two displayed
 * good-or-better numbers in one report disagree with a green suite.
 */
export function goodOrBetterAt3(gains: readonly number[]): boolean {
  return gains.slice(0, 3).some((gain) => gain >= 2);
}

function dcgMicroOf(gains: readonly number[]): number {
  let sum = 0;
  for (let index = 0; index < Math.min(gains.length, DISCOUNT_MICRO.length); index += 1) {
    sum += gains[index]! * DISCOUNT_MICRO[index]!;
  }
  return sum;
}

/**
 * Ideal DCG: all non-provisional judged gains sorted descending (ties in
 * gain broken by start verse id ascending — value-irrelevant, but specified
 * so a rendered ideal list is reproducible), first 10, same discount sum.
 */
function idcgMicroOf(judged: readonly BatteryJudgedRange[]): number {
  const ideal = [...judged]
    .sort((left, right) => right.grade - left.grade || left.range.start - right.range.start)
    .map((row) => row.grade);
  return dcgMicroOf(ideal);
}

interface AggregateBucket {
  scoreable: number;
  excluded: number;
  ndcg: Rational;
  mrr: Rational;
  goodOrBetter: number;
  recall: Rational;
}

function emptyBucket(): AggregateBucket {
  return { scoreable: 0, excluded: 0, ndcg: ZERO, mrr: ZERO, goodOrBetter: 0, recall: ZERO };
}

function finishBucket(bucket: AggregateBucket): RankAggregate {
  return {
    scoreableQueries: bucket.scoreable,
    excludedQueries: bucket.excluded,
    ndcg10: metricValue(bucket.ndcg, bucket.scoreable),
    mrr10: metricValue(bucket.mrr, bucket.scoreable),
    goodOrBetterTop3Rate: metricValue({ num: BigInt(bucket.goodOrBetter), den: 1n }, bucket.scoreable),
    recallAt50: metricValue(bucket.recall, bucket.scoreable),
  };
}

/**
 * The whole metric, per query then per category then overall, as exact
 * rationals with a single display rounding at the end. Provisional
 * judgments never enter any gain, IDCG, or aggregate — an unratified
 * judgment must not move a number a threshold will one day read.
 */
export function computeRankMetrics(inputs: readonly RankQueryInput[]): RankMetricsReport {
  const queries: RankQueryMetrics[] = [];
  const buckets = new Map<string, AggregateBucket>();
  const overall = emptyBucket();

  for (const input of inputs) {
    const judged = input.judged.filter((row) => !row.provisional);
    const top10 = input.top10.slice(0, 10);
    const { gains, claimedResults } = assignClaims(top10, judged);
    const dcgMicro = dcgMicroOf(gains);
    const idcgMicro = idcgMicroOf(judged);
    const scoreable = idcgMicro > 0;

    const firstGood = gains.findIndex((gain) => gain >= 2);
    const mrr: Rational = firstGood === -1 ? ZERO : { num: 1n, den: BigInt(firstGood + 1) };
    const goodOrBetterTop3 = goodOrBetterAt3(gains);

    const relevant = judged.filter((row) => row.grade >= 1).length;
    const gains50 = assignClaims(input.top50.slice(0, 50), judged).gains;
    const claimedRelevant = gains50.filter((gain) => gain >= 1).length;

    queries.push({
      id: input.id,
      category: input.category,
      scoreable,
      judgedCoverageTop10: `${claimedResults}/${top10.length}`,
      dcgMicro,
      idcgMicro,
      ndcgMicro: scoreable ? roundHalfEvenMicro(BigInt(dcgMicro), BigInt(idcgMicro)) : null,
      mrr: firstGood === -1 ? '0/1' : `1/${firstGood + 1}`,
      goodOrBetterTop3,
      recallAt50: scoreable ? `${claimedRelevant}/${relevant}` : null,
    });

    const bucket = buckets.get(input.category) ?? emptyBucket();
    buckets.set(input.category, bucket);
    for (const target of [bucket, overall]) {
      if (!scoreable) {
        target.excluded += 1;
        continue;
      }
      target.scoreable += 1;
      target.ndcg = addRational(target.ndcg, { num: BigInt(dcgMicro), den: BigInt(idcgMicro) });
      target.mrr = addRational(target.mrr, mrr);
      if (goodOrBetterTop3) target.goodOrBetter += 1;
      target.recall = addRational(target.recall, { num: BigInt(claimedRelevant), den: BigInt(relevant) });
    }
  }

  const perCategory: Record<string, RankAggregate> = {};
  for (const category of [...buckets.keys()].sort()) {
    perCategory[category] = finishBucket(buckets.get(category)!);
  }
  return { gainScale: RANK_GAIN_SCALE, overall: finishBucket(overall), perCategory, queries };
}

export interface GoldenRankJudgment {
  readonly id: string;
  readonly query: string;
  readonly judged: readonly BatteryJudgedRange[];
}

/**
 * Golden fixtures as graded judgments: expectedTop pins are gain 3,
 * alsoAcceptable gain 1 — human-authored, ratified-by-merge reviewed data.
 * mustNotRank is deliberately never read here: folding a ban into the gain
 * scale would be a negative theology score (covenant #6); it stays a hard
 * assertion in G3. Reference-intent and pending fixtures derive nothing.
 */
export function deriveGoldenRankJudgments(
  fixtures: readonly CorpusFixture[],
): readonly GoldenRankJudgment[] {
  const derived: GoldenRankJudgment[] = [];
  for (const fixture of fixtures) {
    if (fixture.status !== 'active' || typeof fixture.query !== 'string') continue;
    if ((fixture.referenceExpectations?.length ?? 0) > 0) continue;
    const judged: BatteryJudgedRange[] = [];
    const push = (ref: unknown, grade: 1 | 3): void => {
      if (typeof ref !== 'string') return;
      const range = parseAnchorRef(ref);
      if (!range) return;
      if (judged.some((row) => rangesOverlap(row.range, range))) return;
      judged.push({ ref, grade, provisional: false, range });
    };
    for (const expectation of fixture.expectedTop ?? []) push(expectation.ref ?? expectation.reference, 3);
    for (const acceptable of fixture.alsoAcceptable ?? []) push(acceptable, 1);
    if (judged.length > 0) derived.push({ id: fixture.id, query: fixture.query, judged });
  }
  return derived;
}

/**
 * Folds the computed rank metrics (and any no-effect skip findings) into
 * the G12 roster row. Deliberately NOT mergeGateResults: that helper
 * recomputes applicability without the run context, which would downgrade
 * the required battery row to advisory on the exact runs where it enforces.
 */
export function withRankEvidence(
  gate: GateResult,
  metrics: RankMetricsReport,
  findings: readonly GateFinding[],
  quality?: RankQualityOutcome,
  acceptance?: BatteryAcceptanceOutcome,
): GateResult {
  const overall = metrics.overall;
  const display = (value: RankMetricValue): string =>
    value.micro === null ? 'n/a' : (value.micro / 1000000).toFixed(6);
  const numbers: Record<string, number> = {
    rankScoreableQueries: overall.scoreableQueries,
    rankExcludedQueries: overall.excludedQueries,
  };
  if (overall.ndcg10.micro !== null) numbers['rankNdcg10Micro'] = overall.ndcg10.micro;
  if (overall.mrr10.micro !== null) numbers['rankMrr10Micro'] = overall.mrr10.micro;
  if (overall.goodOrBetterTop3Rate.micro !== null) {
    numbers['rankGoodOrBetterTop3RateMicro'] = overall.goodOrBetterTop3Rate.micro;
  }
  if (overall.recallAt50.micro !== null) numbers['rankRecallAt50Micro'] = overall.recallAt50.micro;

  // Threshold accounting for the row summary. A null threshold contributes
  // to "unset" and NOTHING else — reported, never passed, never failed. The
  // count-of-set/met/unmet wording keeps the summary truthful the day a
  // threshold flips, instead of hardcoding today's all-null state.
  let thresholdsSummary = 'thresholds: none evaluated (rankQuality block unavailable)';
  const qualityFailures = quality?.failures ?? [];
  if (quality !== undefined) {
    const unset = quality.evaluations.filter((entry) => entry.outcome === 'no-threshold').length;
    const set = quality.evaluations.length - unset;
    thresholdsSummary = set === 0
      ? `thresholds: none set, ${unset} null (measured and reported — ${RANK_QUALITY_NULL_MARKER})`
      : `thresholds: ${set} set (${qualityFailures.length} FAILED), ${unset} null (measured and reported)`;
  }
  // QR-8 acceptance criteria segment: a null criterion prints the exact
  // plan-stated "not-applicable — thresholds unset" words beside its
  // measured detail — reported, never counted as pass or fail.
  let acceptanceSummary = '';
  const acceptanceFailures = acceptance?.failures ?? [];
  if (acceptance !== undefined) {
    acceptanceSummary = `; acceptance: ${acceptance.evaluations
      .map((entry) => entry.outcome === 'no-threshold'
        ? `${entry.criterion} ${BATTERY_ACCEPTANCE_NULL_MARKER} (${entry.detail})`
        : `${entry.criterion} ${entry.outcome} (${entry.detail})`)
      .join('; ')}`;
  }
  const summary =
    `${gate.summary} | rank metrics: ` +
    `nDCG@10 ${display(overall.ndcg10)}, MRR@10 ${display(overall.mrr10)}, ` +
    `good-or-better@3 ${display(overall.goodOrBetterTop3Rate)}, ` +
    `recall@50 ${display(overall.recallAt50)} over ${overall.scoreableQueries} scoreable ` +
    `quer(ies) (${overall.excludedQueries} excluded, IDCG=0); ${thresholdsSummary}${acceptanceSummary}`;
  const enforcedFailures = [...qualityFailures, ...acceptanceFailures];
  const merged = {
    ...gate,
    summary,
    metrics: { ...(gate.metrics ?? {}), ...numbers },
    findings: [...(gate.findings ?? []), ...findings, ...enforcedFailures],
  };
  // An enforced (non-null) threshold that failed or could not be measured
  // fails the row; nothing here can ever upgrade a status.
  return enforcedFailures.length > 0 && gate.status !== 'fail'
    ? { ...merged, status: 'fail', summary: `${summary}; ${enforcedFailures.length} rank threshold(s) failed` }
    : merged;
}

// ---------------------------------------------------------------------------
// NO_MEASURABLE_EFFECT: the code embodiment of CLAUDE.md's "NO MEASURABLE
// EFFECT means don't merge". Detected against three NAMED COMMITTED anchors
// never regenerated by the same PR; any precondition failure is reported as
// skipped-with-finding, never silently treated as evaluated.
// ---------------------------------------------------------------------------

export const RANK_METRICS_BASELINE_PATH = 'eval/baselines/rank-metrics.json';
export const RANK_METRICS_BASELINE_SCHEMA = 'scripture-search-engine/rank-metrics-baseline/v1';

export interface RankMetricsBaseline {
  readonly schema: typeof RANK_METRICS_BASELINE_SCHEMA;
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  readonly overall: RankAggregate;
  readonly perCategory: Readonly<Record<string, RankAggregate>>;
}

/**
 * The candidate baseline `--update-rank-baseline` writes. The machine only
 * ever writes this file — the approval record beside it is hand-authored by
 * an independent reviewer under the E5 protocol; writing it IS the approval
 * act and no code path here may perform it.
 */
export function buildRankMetricsBaseline(
  engine: { readonly engineVersion: string; readonly corpusFingerprint: string; readonly layerFingerprint: string },
  metrics: RankMetricsReport,
): RankMetricsBaseline {
  return {
    schema: RANK_METRICS_BASELINE_SCHEMA,
    engineVersion: engine.engineVersion,
    corpusFingerprint: engine.corpusFingerprint,
    layerFingerprint: engine.layerFingerprint,
    overall: metrics.overall,
    perCategory: metrics.perCategory,
  };
}

export const NO_EFFECT_ANCHORS = [
  'rank-metrics-baseline',
  'prior-probe-orderings',
  'g8-probe-baseline',
] as const;

export type NoEffectAnchor = (typeof NO_EFFECT_ANCHORS)[number];

export interface NoEffectComparison {
  readonly anchor: NoEffectAnchor;
  readonly state: 'compared' | 'skipped';
  /** Present exactly when compared. */
  readonly moved: boolean | null;
  /** Present exactly when skipped. */
  readonly reason: string | null;
}

export interface NoEffectDetection {
  /** All three anchors compared AND layer motion determinable. */
  readonly evaluated: boolean;
  /** layerFingerprint moved vs the baseline anchor AND nothing else moved. */
  readonly fired: boolean;
  readonly layerMoved: boolean | null;
  readonly comparisons: readonly NoEffectComparison[];
  /** The --expect-no-effect reason token, recorded verbatim; null without it. */
  readonly expectNoEffect: string | null;
}

export interface NoEffectInput {
  readonly run: { readonly corpusFingerprint: string; readonly layerFingerprint: string };
  /** null when this run computed no rank metrics (no valid battery run). */
  readonly metrics: RankMetricsReport | null;
  /** Parsed eval/baselines/rank-metrics.json, or null when the file is absent. */
  readonly rankBaseline: unknown;
  /** Parsed ordering.snapshot.approval.json, or null when absent. */
  readonly orderingApproval: unknown;
  readonly currentProbeListsSha256: string;
  /** Committed G8 baseline identity + canonical observations digest, or null. */
  readonly probeBaseline: {
    readonly corpusFingerprint: string;
    readonly observationsSha256: string;
  } | null;
  readonly currentObservationsSha256: string;
  readonly expectNoEffect: string | null;
}

const DIGEST_PATTERN = /^[0-9a-f]{64}$/;

function compared(anchor: NoEffectAnchor, moved: boolean): NoEffectComparison {
  return { anchor, state: 'compared', moved, reason: null };
}

function skipped(anchor: NoEffectAnchor, reason: string): NoEffectComparison {
  return { anchor, state: 'skipped', moved: null, reason };
}

function validRankBaseline(value: unknown): value is RankMetricsBaseline {
  return isRecord(value)
    && value['schema'] === RANK_METRICS_BASELINE_SCHEMA
    && typeof value['engineVersion'] === 'string'
    && typeof value['corpusFingerprint'] === 'string' && DIGEST_PATTERN.test(value['corpusFingerprint'])
    && typeof value['layerFingerprint'] === 'string' && DIGEST_PATTERN.test(value['layerFingerprint'])
    && isRecord(value['overall']) && isRecord(value['perCategory']);
}

/**
 * The pinned firing predicate — no implementer judgment left: the verdict
 * fires ONLY when the run's layerFingerprint differs from the one recorded
 * in the rank-metrics baseline (the PR actually changed curated data and
 * thereby claims value) AND all three anchor comparisons show no movement.
 * A run whose fingerprints equal the anchors' (docs, refactor, eval-only
 * PRs) does not fire — CLAUDE.md's rule governs additions claiming value,
 * not no-op diffs. The measurement never changes under --expect-no-effect;
 * that flag only downgrades the verdict's exit code and is recorded here
 * verbatim for the CI diff-shape audit.
 */
export function detectNoMeasurableEffect(input: NoEffectInput): {
  readonly detection: NoEffectDetection;
  readonly findings: readonly GateFinding[];
} {
  const comparisons: NoEffectComparison[] = [];
  let layerMoved: boolean | null = null;

  // Anchor 1: the committed rank-metrics baseline.
  if (input.rankBaseline === null) {
    comparisons.push(skipped(
      'rank-metrics-baseline',
      `anchor missing: ${RANK_METRICS_BASELINE_PATH} has not been established yet ` +
        '(E5 threshold protocol; the baseline needs independent review before it exists)',
    ));
  } else if (!validRankBaseline(input.rankBaseline)) {
    comparisons.push(skipped(
      'rank-metrics-baseline',
      `anchor malformed: ${RANK_METRICS_BASELINE_PATH} does not match the v1 baseline schema`,
    ));
  } else if (input.rankBaseline.corpusFingerprint !== input.run.corpusFingerprint) {
    comparisons.push(skipped(
      'rank-metrics-baseline',
      'corpusFingerprint moved vs the rank-metrics baseline anchor — the scripture text itself ' +
        'changed, so a metric comparison would be confounded',
    ));
  } else if (input.metrics === null) {
    layerMoved = input.rankBaseline.layerFingerprint !== input.run.layerFingerprint;
    comparisons.push(skipped(
      'rank-metrics-baseline',
      'rank metrics were not computed on this run — the battery measures an explicit artifact target',
    ));
  } else {
    layerMoved = input.rankBaseline.layerFingerprint !== input.run.layerFingerprint;
    const currentDigest = canonicalJson({
      overall: input.metrics.overall,
      perCategory: input.metrics.perCategory,
    });
    const baselineDigest = canonicalJson({
      overall: input.rankBaseline.overall,
      perCategory: input.rankBaseline.perCategory,
    });
    comparisons.push(compared('rank-metrics-baseline', currentDigest !== baselineDigest));
  }

  // Anchor 2: the pre-change probe orderings, via the ordering-snapshot
  // approval's priorProvenance (an in-tree snapshot comparison would be
  // circular whenever the same PR regenerated the snapshot).
  const approval = input.orderingApproval;
  if (!isRecord(approval)) {
    comparisons.push(skipped('prior-probe-orderings', 'ordering snapshot approval is missing or malformed'));
  } else if (approval['priorProvenance'] === null || approval['priorProvenance'] === undefined) {
    comparisons.push(skipped(
      'prior-probe-orderings',
      'ordering approval priorProvenance is null (bootstrap) — the pre-change probe orderings ' +
        'are not pinned anywhere this run can reach',
    ));
  } else {
    const prior = approval['priorProvenance'];
    const priorLists = isRecord(prior) ? prior['probeListsSha256'] : undefined;
    const priorEngine = isRecord(prior) ? prior['engine'] : undefined;
    const priorCorpus = isRecord(priorEngine) ? priorEngine['corpusFingerprint'] : undefined;
    if (typeof priorLists !== 'string' || !DIGEST_PATTERN.test(priorLists)) {
      comparisons.push(skipped(
        'prior-probe-orderings',
        'ordering approval priorProvenance carries no valid probeListsSha256 digest',
      ));
    } else if (typeof priorCorpus === 'string' && priorCorpus !== input.run.corpusFingerprint) {
      comparisons.push(skipped(
        'prior-probe-orderings',
        'corpusFingerprint moved vs the prior-provenance anchor — probe orderings are not comparable',
      ));
    } else {
      comparisons.push(compared('prior-probe-orderings', input.currentProbeListsSha256 !== priorLists));
    }
  }

  // Anchor 3: the committed, independently approved G8 probe baseline.
  if (input.probeBaseline === null) {
    comparisons.push(skipped('g8-probe-baseline', 'anchor missing: eval/baselines/probes.json'));
  } else if (input.probeBaseline.corpusFingerprint !== input.run.corpusFingerprint) {
    comparisons.push(skipped(
      'g8-probe-baseline',
      'corpusFingerprint moved vs the G8 baseline anchor — observations are not comparable',
    ));
  } else {
    comparisons.push(compared(
      'g8-probe-baseline',
      input.currentObservationsSha256 !== input.probeBaseline.observationsSha256,
    ));
  }

  const evaluated = layerMoved !== null && comparisons.every((entry) => entry.state === 'compared');
  const fired = evaluated && layerMoved === true && comparisons.every((entry) => entry.moved === false);
  const findings = comparisons
    .filter((entry) => entry.state === 'skipped')
    .map((entry) => finding(
      'no-effect-skipped',
      `NO_MEASURABLE_EFFECT detection skipped for anchor "${entry.anchor}": ${entry.reason}`,
      [entry.anchor],
    ));

  return {
    detection: {
      evaluated,
      fired,
      layerMoved,
      comparisons,
      expectNoEffect: input.expectNoEffect,
    },
    findings,
  };
}

// ---------------------------------------------------------------------------
// rankQuality threshold discipline (E5): null-until-real-baseline.
//
// Thresholds are reviewed data in eval/budgets.json, micro-integers only.
// A null threshold means MEASURED AND REPORTED — the value prints with
// RANK_QUALITY_NULL_MARKER, never counted as pass, never as fail. A null
// flips to a value only via the four-step protocol in
// docs/governance/probe-baseline-review.md, and the flip is structurally
// impossible before an independently approved rank-metrics baseline exists.
// ---------------------------------------------------------------------------

/** The exact words a null threshold reports beside its measured value. */
export const RANK_QUALITY_NULL_MARKER = 'no threshold — baseline not yet established';

const THRESHOLD_MICRO_MAX = 1000000;

export interface RankQualityThresholds {
  readonly ndcg10: {
    readonly overall: number | null;
    readonly perCategory: Readonly<Record<BatteryCategory, number | null>>;
  };
  readonly mrr10: number | null;
  readonly goodOrBetterTop3Rate: number | null;
  readonly battery: { readonly categoryFloors: BatteryCategoryFloors };
  /**
   * QR-8 (P5.7): the ms/ref battery rows as budget-bound acceptance
   * criteria. Booleans, not micro-rationals — the enforced value is
   * literally `true` (rollback is null-with-tombstone, never `false`), and
   * the same E5 null-until-baselined discipline applies: null means
   * "not-applicable — thresholds unset", measured and reported, never a
   * hollow pass, and a non-null value is structurally impossible before an
   * independently approved rank-metrics baseline exists.
   */
  readonly spelling: { readonly noSilentEmpty: true | null };
  readonly references: { readonly grammarCoverage: true | null };
}

function commentKeys(record: Record<string, unknown>): string[] {
  return Object.keys(record).filter((key) => !key.startsWith('$comment'));
}

function parseThresholdMicro(
  value: unknown,
  path: string,
  deps: { readonly rankBaselineEstablished: boolean },
  findings: GateFinding[],
  prematureFindings: GateFinding[],
): number | null {
  if (value === null) return null;
  if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > THRESHOLD_MICRO_MAX) {
    findings.push(finding(
      'rank-quality-schema',
      `rankQuality.${path} must be null or a micro-integer threshold in 1..${THRESHOLD_MICRO_MAX} ` +
        `(value x 10^6), got ${String(value)}`,
    ));
    return null;
  }
  if (!deps.rankBaselineEstablished) {
    // The protocol is structural, not procedural: no number may appear here
    // before the independently approved baseline it must be derived from.
    // A value prohibition, not a shape problem — the prohibited value is
    // coerced to null so it cannot enforce, while the rest of the block
    // (the category floors above all) stays valid and truthfully reported.
    prematureFindings.push(finding(
      'rank-quality-premature-threshold',
      `rankQuality.${path} is non-null but no independently approved rank-metrics baseline exists ` +
        `(${RANK_METRICS_BASELINE_PATH} + its approval) — thresholds flip only via the four-step ` +
        'protocol in docs/governance/probe-baseline-review.md; the value is not enforced on this run',
    ));
    return null;
  }
  return value as number;
}

/**
 * QR-8 acceptance booleans: null (unset) or literally `true` (enforced).
 * `false` is deliberately invalid — disabling a flipped criterion is a
 * null-with-tombstone rollback, never a silent off-switch that reads as a
 * value. The premature-threshold discipline applies exactly as it does to
 * the micro thresholds: `true` with no independently approved rank-metrics
 * baseline rings and is coerced to null.
 */
function parseAcceptanceBoolean(
  value: unknown,
  path: string,
  deps: { readonly rankBaselineEstablished: boolean },
  findings: GateFinding[],
  prematureFindings: GateFinding[],
): true | null {
  if (value === null) return null;
  if (value !== true) {
    findings.push(finding(
      'rank-quality-schema',
      `rankQuality.${path} must be null or literally true (a budget-bound acceptance boolean; ` +
        `rollback is null-with-tombstone, never false), got ${String(value)}`,
    ));
    return null;
  }
  if (!deps.rankBaselineEstablished) {
    prematureFindings.push(finding(
      'rank-quality-premature-threshold',
      `rankQuality.${path} is non-null but no independently approved rank-metrics baseline exists ` +
        `(${RANK_METRICS_BASELINE_PATH} + its approval) — acceptance criteria flip only via the ` +
        'four-step protocol in docs/governance/probe-baseline-review.md (J42); the value is not ' +
        'enforced on this run',
    ));
    return null;
  }
  return true;
}

/**
 * Validates the reviewed `rankQuality` block of eval/budgets.json. Returns
 * null thresholds (and findings) on any structural shape problem — a gate
 * must never enforce, or skip enforcing, on the strength of a malformed
 * document. A prematurely non-null threshold is a value prohibition, not a
 * shape problem: it rings `rank-quality-premature-threshold` (failing G12)
 * and is coerced to null in the returned thresholds, so the structurally
 * valid parts of the block survive and every other finding stays true.
 */
export function validateRankQualityBlock(
  block: unknown,
  deps: { readonly rankBaselineEstablished: boolean },
): { readonly thresholds: RankQualityThresholds | null; readonly findings: readonly GateFinding[] } {
  const findings: GateFinding[] = [];
  const prematureFindings: GateFinding[] = [];
  if (!isRecord(block)) {
    return {
      thresholds: null,
      findings: [finding(
        'rank-quality-schema',
        'eval/budgets.json has no rankQuality block — rank-quality thresholds and battery ' +
          'category floors are reviewed data and must exist (all-null thresholds included)',
      )],
    };
  }
  const allowed = ['ndcg10', 'mrr10', 'goodOrBetterTop3Rate', 'battery', 'spelling', 'references'];
  for (const key of commentKeys(block)) {
    if (!allowed.includes(key)) {
      findings.push(finding('rank-quality-schema', `rankQuality has unknown field "${key}"`));
    }
  }

  const ndcg = block['ndcg10'];
  let overall: number | null = null;
  const perCategory: Partial<Record<BatteryCategory, number | null>> = {};
  if (!isRecord(ndcg) || !isRecord(ndcg['perCategory'])
      || commentKeys(ndcg).sort().join(',') !== 'overall,perCategory') {
    findings.push(finding(
      'rank-quality-schema',
      'rankQuality.ndcg10 must be { overall, perCategory: { <nine battery categories> } }',
    ));
  } else {
    overall = parseThresholdMicro(ndcg['overall'], 'ndcg10.overall', deps, findings, prematureFindings);
    const categories = ndcg['perCategory'];
    for (const key of commentKeys(categories)) {
      if (!(BATTERY_CATEGORIES as readonly string[]).includes(key)) {
        findings.push(finding('rank-quality-schema', `rankQuality.ndcg10.perCategory has unknown category "${key}"`));
      }
    }
    for (const category of BATTERY_CATEGORIES) {
      if (!(category in categories)) {
        findings.push(finding(
          'rank-quality-schema',
          `rankQuality.ndcg10.perCategory is missing category "${category}" — every battery category ` +
            'carries an explicit threshold entry, null included',
        ));
        continue;
      }
      perCategory[category] = parseThresholdMicro(
        categories[category], `ndcg10.perCategory.${category}`, deps, findings, prematureFindings,
      );
    }
  }

  const mrr10 = parseThresholdMicro(block['mrr10'], 'mrr10', deps, findings, prematureFindings);
  const goodOrBetterTop3Rate = parseThresholdMicro(
    block['goodOrBetterTop3Rate'], 'goodOrBetterTop3Rate', deps, findings, prematureFindings,
  );

  // QR-8 acceptance sub-blocks. Explicit presence is required exactly like
  // the per-category ndcg entries: the reviewed file carries every criterion
  // by name, null included — an absent key would be indistinguishable from a
  // silently dropped one.
  let noSilentEmpty: true | null = null;
  const spelling = block['spelling'];
  if (!isRecord(spelling) || commentKeys(spelling).join(',') !== 'noSilentEmpty') {
    findings.push(finding(
      'rank-quality-schema',
      'rankQuality.spelling must be { noSilentEmpty } (QR-8 acceptance criterion, null until baselined)',
    ));
  } else {
    noSilentEmpty = parseAcceptanceBoolean(
      spelling['noSilentEmpty'], 'spelling.noSilentEmpty', deps, findings, prematureFindings,
    );
  }
  let grammarCoverage: true | null = null;
  const references = block['references'];
  if (!isRecord(references) || commentKeys(references).join(',') !== 'grammarCoverage') {
    findings.push(finding(
      'rank-quality-schema',
      'rankQuality.references must be { grammarCoverage } (QR-8 acceptance criterion, null until baselined)',
    ));
  } else {
    grammarCoverage = parseAcceptanceBoolean(
      references['grammarCoverage'], 'references.grammarCoverage', deps, findings, prematureFindings,
    );
  }

  const battery = block['battery'];
  const floors: Partial<Record<BatteryCategory, number>> = {};
  if (!isRecord(battery) || !isRecord(battery['categoryFloors'])
      || commentKeys(battery).join(',') !== 'categoryFloors') {
    findings.push(finding(
      'rank-quality-schema',
      'rankQuality.battery must be { categoryFloors: { <nine battery categories> } }',
    ));
  } else {
    const categoryFloors = battery['categoryFloors'];
    for (const key of commentKeys(categoryFloors)) {
      if (!(BATTERY_CATEGORIES as readonly string[]).includes(key)) {
        findings.push(finding('rank-quality-schema', `rankQuality.battery.categoryFloors has unknown category "${key}"`));
      }
    }
    for (const category of BATTERY_CATEGORIES) {
      const floor = categoryFloors[category];
      if (!Number.isInteger(floor) || (floor as number) < 1) {
        findings.push(finding(
          'rank-quality-schema',
          `rankQuality.battery.categoryFloors.${category} must be a positive integer — floors are ` +
            'structural facts about the committed specimen set, never unset',
        ));
        continue;
      }
      floors[category] = floor as number;
    }
  }

  // Only shape problems nullify the thresholds; premature-threshold findings
  // ride along without poisoning the structurally valid parts (their values
  // are already coerced to null above).
  if (findings.length > 0) return { thresholds: null, findings: [...findings, ...prematureFindings] };
  return {
    thresholds: {
      ndcg10: { overall, perCategory: perCategory as Record<BatteryCategory, number | null> },
      mrr10,
      goodOrBetterTop3Rate,
      battery: { categoryFloors: floors as BatteryCategoryFloors },
      spelling: { noSilentEmpty },
      references: { grammarCoverage },
    },
    findings: prematureFindings,
  };
}

export interface RankThresholdEvaluation {
  readonly metric: 'ndcg10' | 'mrr10' | 'goodOrBetterTop3Rate';
  /** 'overall' or one of the nine battery categories. */
  readonly scope: string;
  /** Display value in micro units; null when the scope has no scoreable queries. */
  readonly valueMicro: number | null;
  readonly thresholdMicro: number | null;
  /**
   * 'no-threshold' is the null-honesty state: measured and reported, never
   * pass, never fail. 'unmeasurable' — a set threshold with no scoreable
   * queries — is a FAILURE: a threshold that cannot run must not pass.
   */
  readonly outcome: 'no-threshold' | 'met' | 'not-met' | 'unmeasurable';
}

export interface RankQualityOutcome {
  readonly evaluations: readonly RankThresholdEvaluation[];
  /** One finding per not-met or unmeasurable threshold; empty = no enforcement failed. */
  readonly failures: readonly GateFinding[];
}

function parseExactRational(exact: string): { num: bigint; den: bigint } {
  const [num, den] = exact.split('/');
  return { num: BigInt(num!), den: BigInt(den!) };
}

function evaluateOne(
  metric: RankThresholdEvaluation['metric'],
  scope: string,
  value: RankMetricValue | undefined,
  thresholdMicro: number | null,
  failures: GateFinding[],
): RankThresholdEvaluation {
  const valueMicro = value?.micro ?? null;
  if (thresholdMicro === null) {
    return { metric, scope, valueMicro, thresholdMicro: null, outcome: 'no-threshold' };
  }
  if (value === undefined || value.exact === null) {
    failures.push(finding(
      'rank-threshold-unmeasurable',
      `rankQuality.${metric}${scope === 'overall' ? '' : `.perCategory.${scope}`} is set to ` +
        `${thresholdMicro} micro but "${scope}" has no scoreable queries — a threshold that cannot ` +
        'be measured must not pass',
      [scope],
    ));
    return { metric, scope, valueMicro, thresholdMicro, outcome: 'unmeasurable' };
  }
  // Exact comparison on the reduced rational — the once-rounded display
  // value can never decide a gate.
  const { num, den } = parseExactRational(value.exact);
  const met = meetsThresholdMicro(num, den, thresholdMicro);
  if (met === false) {
    failures.push(finding(
      'rank-threshold-not-met',
      `rankQuality.${metric}${scope === 'overall' ? '' : `.perCategory.${scope}`}: exact ${value.exact} ` +
        `is below the reviewed threshold ${thresholdMicro} micro`,
      [scope],
    ));
  }
  return { metric, scope, valueMicro, thresholdMicro, outcome: met === true ? 'met' : 'not-met' };
}

/**
 * Applies the reviewed thresholds to a computed metrics report. Twelve
 * evaluation surfaces: nDCG@10 overall and per battery category, MRR@10, and
 * goodOrBetterTop3Rate. The golden-derived category is measured and reported
 * but carries no threshold surface — its judgments are fixture pins, not the
 * battery's graded set.
 */
export function evaluateRankQuality(
  thresholds: RankQualityThresholds,
  metrics: RankMetricsReport,
): RankQualityOutcome {
  const failures: GateFinding[] = [];
  const evaluations: RankThresholdEvaluation[] = [
    evaluateOne('ndcg10', 'overall', metrics.overall.ndcg10, thresholds.ndcg10.overall, failures),
  ];
  for (const category of BATTERY_CATEGORIES) {
    evaluations.push(evaluateOne(
      'ndcg10',
      category,
      metrics.perCategory[category]?.ndcg10,
      thresholds.ndcg10.perCategory[category],
      failures,
    ));
  }
  evaluations.push(
    evaluateOne('mrr10', 'overall', metrics.overall.mrr10, thresholds.mrr10, failures),
    evaluateOne(
      'goodOrBetterTop3Rate', 'overall',
      metrics.overall.goodOrBetterTop3Rate, thresholds.goodOrBetterTop3Rate, failures,
    ),
  );
  return { evaluations, failures };
}

// ---------------------------------------------------------------------------
// QR-8 (P5.7): the ms/ref battery rows as budget-bound acceptance criteria.
//
// Measurement, never adjudication, exactly like every metric above:
// spelling.noSilentEmpty asks whether any misspelling-category query came
// back a BARE EMPTY (a discovery outcome with zero results — the audit's
// silent-empty class, and the shape the documented E9 mutation check
// produces by disabling OOV substitution); references.grammarCoverage asks
// whether every reference-adjacent row resolved as a reference and every
// tiers.referenceGrammar pinned row resolved to exactly its expected label.
// While the reviewed threshold is null the criterion reports
// "not-applicable — thresholds unset" — measured and reported, never a
// hollow pass. When enforced (true), fail-closed: a violation fails, and a
// criterion that CANNOT be verified from this run's evidence (an
// invalid-reference outcome whose suggestion presence the battery evidence
// does not record; missing grammar pins) fails as unmeasurable rather than
// passing on a gap.
// ---------------------------------------------------------------------------

/** The exact words a null acceptance criterion reports (plan-stated). */
export const BATTERY_ACCEPTANCE_NULL_MARKER = 'not-applicable — thresholds unset';

export interface BatteryAcceptanceEvaluation {
  readonly criterion: 'spelling.noSilentEmpty' | 'references.grammarCoverage';
  readonly threshold: true | null;
  /** Measured truth of the boolean on this run; null when not determinable. */
  readonly holds: boolean | null;
  readonly outcome: 'no-threshold' | 'met' | 'not-met' | 'unmeasurable';
  readonly detail: string;
}

export interface BatteryAcceptanceOutcome {
  readonly evaluations: readonly BatteryAcceptanceEvaluation[];
  /** One finding per not-met or unmeasurable ENFORCED criterion; empty = nothing enforced failed. */
  readonly failures: readonly GateFinding[];
}

function acceptanceEvaluation(
  criterion: BatteryAcceptanceEvaluation['criterion'],
  threshold: true | null,
  holds: boolean | null,
  detail: string,
  failures: GateFinding[],
): BatteryAcceptanceEvaluation {
  if (threshold === null) {
    return { criterion, threshold, holds, outcome: 'no-threshold', detail };
  }
  if (holds === true) return { criterion, threshold, holds, outcome: 'met', detail };
  if (holds === false) {
    failures.push(finding(
      'battery-acceptance-not-met',
      `rankQuality.${criterion} is enforced (true) but does not hold: ${detail}`,
    ));
    return { criterion, threshold, holds, outcome: 'not-met', detail };
  }
  failures.push(finding(
    'battery-acceptance-unmeasurable',
    `rankQuality.${criterion} is enforced (true) but cannot be verified from this run's battery ` +
      `evidence — a criterion that cannot be measured must not pass: ${detail}`,
  ));
  return { criterion, threshold, holds, outcome: 'unmeasurable', detail };
}

/**
 * Evaluates the two QR-8 acceptance criteria over an executed battery.
 * `referenceGrammarPins` is the reviewed `tiers.referenceGrammar` row list
 * (null when the tiers block is unavailable or malformed — which makes the
 * enforced grammar criterion unmeasurable rather than half-checked).
 */
export function evaluateBatteryAcceptance(input: {
  readonly thresholds: RankQualityThresholds;
  readonly validated: ValidatedBattery;
  readonly outcomes: readonly BatteryQueryOutcome[];
  readonly referenceGrammarPins:
    readonly { readonly query: string; readonly expectedReference: string }[] | null;
}): BatteryAcceptanceOutcome {
  const failures: GateFinding[] = [];
  const byId = new Map(input.outcomes.map((outcome) => [outcome.id, outcome]));

  // spelling.noSilentEmpty — over the misspelling category rows.
  const msQueries = input.validated.queries.filter((query) => query.category === 'misspelling');
  const bareEmpty: string[] = [];
  const indeterminate: string[] = [];
  const unexecuted: string[] = [];
  for (const query of msQueries) {
    const outcome = byId.get(query.id);
    if (outcome === undefined) {
      unexecuted.push(query.id);
    } else if (outcome.kind === 'discovery' && outcome.top.length === 0) {
      // The bare empty: no results, no resolved reference, no suggestion —
      // the exact class the criterion exists to trip on.
      bareEmpty.push(query.id);
    } else if (outcome.kind === 'invalid-reference') {
      // Acceptable ONLY when suggestion-bearing, and the battery outcome
      // shape does not record suggestion presence — not determinable here.
      // (Extending the recorded outcome schema is part of the threshold-flip
      // PR, which re-baselines the battery evidence anyway. That extension
      // should record correction citations alongside suggestion presence:
      // the "cited-correction results" arm is equally uncertifiable today —
      // a non-empty discovery is accepted without verifying any citation.)
      indeterminate.push(query.id);
    }
  }
  const spellingProblems: string[] = [];
  if (bareEmpty.length > 0) spellingProblems.push(`bare-empty quer(ies): ${bareEmpty.join(', ')}`);
  if (indeterminate.length > 0) {
    spellingProblems.push(
      `invalid-reference outcome(s) whose suggestion presence the battery evidence does not record: ${indeterminate.join(', ')}`,
    );
  }
  if (unexecuted.length > 0) spellingProblems.push(`unexecuted quer(ies): ${unexecuted.join(', ')}`);
  const spellingHolds = bareEmpty.length > 0
    ? false
    : indeterminate.length > 0 || unexecuted.length > 0 || msQueries.length === 0
      ? null
      : true;
  const spellingDetail = spellingProblems.length > 0
    ? spellingProblems.join('; ')
    : msQueries.length === 0
      ? 'no misspelling quer(ies) in the battery — nothing to measure'
      : `${msQueries.length} misspelling quer(ies), 0 bare-empty`;

  // references.grammarCoverage — every reference-adjacent row resolves, and
  // every reviewed grammar pin resolves to exactly its expected label.
  const refQueries = input.validated.queries.filter((query) => query.category === 'reference-adjacent');
  const notResolving: string[] = [];
  const refUnexecuted: string[] = [];
  for (const query of refQueries) {
    const outcome = byId.get(query.id);
    if (outcome === undefined) refUnexecuted.push(query.id);
    else if (outcome.kind !== 'reference') notResolving.push(`${query.id} (${outcome.kind})`);
  }
  const pinMismatches: string[] = [];
  const pinsUnmatched: string[] = [];
  for (const pin of input.referenceGrammarPins ?? []) {
    const outcome = input.outcomes.find((entry) => entry.query === pin.query);
    if (outcome === undefined) {
      pinsUnmatched.push(pin.query);
    } else if (outcome.kind !== 'reference' || outcome.passageReference !== pin.expectedReference) {
      pinMismatches.push(
        `"${pin.query}" resolved to ` +
          `${outcome.kind === 'reference' ? `"${outcome.passageReference ?? ''}"` : outcome.kind}, ` +
          `expected "${pin.expectedReference}"`,
      );
    }
  }
  const grammarProblems: string[] = [];
  if (notResolving.length > 0) grammarProblems.push(`unresolved ref row(s): ${notResolving.join(', ')}`);
  if (pinMismatches.length > 0) grammarProblems.push(pinMismatches.join('; '));
  if (input.referenceGrammarPins === null) {
    grammarProblems.push('tiers.referenceGrammar pins unavailable (tiers block missing or malformed)');
  }
  if (pinsUnmatched.length > 0) {
    grammarProblems.push(
      `grammar pin(s) matching no battery outcome: ${pinsUnmatched.map((query) => `"${query}"`).join(', ')}`,
    );
  }
  if (refUnexecuted.length > 0) grammarProblems.push(`unexecuted ref row(s): ${refUnexecuted.join(', ')}`);
  const grammarHolds = notResolving.length > 0 || pinMismatches.length > 0
    ? false
    : input.referenceGrammarPins === null || pinsUnmatched.length > 0 || refUnexecuted.length > 0
        || refQueries.length === 0
      ? null
      : true;
  const grammarDetail = grammarProblems.length > 0
    ? grammarProblems.join('; ')
    : refQueries.length === 0
      ? 'no reference-adjacent quer(ies) in the battery — nothing to measure'
      : `${refQueries.length}/${refQueries.length} ref row(s) resolve, ` +
        `${input.referenceGrammarPins!.length}/${input.referenceGrammarPins!.length} pinned label(s) match`;

  return {
    evaluations: [
      acceptanceEvaluation(
        'spelling.noSilentEmpty', input.thresholds.spelling.noSilentEmpty,
        spellingHolds, spellingDetail, failures,
      ),
      acceptanceEvaluation(
        'references.grammarCoverage', input.thresholds.references.grammarCoverage,
        grammarHolds, grammarDetail, failures,
      ),
    ],
    failures,
  };
}

// ---------------------------------------------------------------------------
// Rank-metrics baseline approval. The machine writes only the baseline
// (`--update-rank-baseline`); the approval record beside it is hand-authored
// by an independent reviewer — writing it IS the approval act, and no code
// path in this repository performs it. This validator only checks.
// ---------------------------------------------------------------------------

export const RANK_METRICS_APPROVAL_PATH = 'eval/baselines/rank-metrics.approval.json';

/**
 * Born v2: the rank-metrics approval never had a v1 generation — it adopts
 * the accountable-record schema (named reviewer, independence attestation,
 * evidence binding, packet digest) from its first record.
 */
export const RANK_METRICS_APPROVAL_SCHEMA_V2 = 'scripture-search-engine/rank-metrics-approval/v2';

const RANK_APPROVAL_KEYS = [
  'schema',
  'baselineSha256',
  'batteryQueriesSha256',
  'batteryJudgmentsSha256',
  'engine',
  'reviewerName',
  'reviewerContact',
  'independence',
  'evidence',
  'reviewPacketSha256',
  'reviewedAt',
  'rationale',
  'priorProvenance',
] as const;

function rankApprovalFinding(code: string, message: string): GateFinding {
  return {
    categoryCode: category(code),
    message,
    subjects: ['rank-metrics-baseline-approval'],
  };
}

function isSha256Hex(value: unknown): value is string {
  return typeof value === 'string' && DIGEST_PATTERN.test(value);
}

function isReviewDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
}

function rankApprovalShapeProblems(approval: Record<string, unknown>): string[] {
  const problems: string[] = [];
  const allowed = new Set<string>([...RANK_APPROVAL_KEYS, 'bootstrap']);
  for (const key of Object.keys(approval).sort()) {
    if (!allowed.has(key)) problems.push(`unexpected field "${key}"`);
  }
  for (const key of RANK_APPROVAL_KEYS) {
    if (!(key in approval)) problems.push(`missing field "${key}"`);
  }
  const check = (field: string, valid: boolean, expected: string): void => {
    if (field in approval && !valid) problems.push(`"${field}" must be ${expected}`);
  };
  check('baselineSha256', isSha256Hex(approval['baselineSha256']), 'a 64-hex sha256');
  check('batteryQueriesSha256', isSha256Hex(approval['batteryQueriesSha256']), 'a 64-hex sha256');
  check('batteryJudgmentsSha256', isSha256Hex(approval['batteryJudgmentsSha256']), 'a 64-hex sha256');
  const engine = approval['engine'];
  check('engine', isRecord(engine)
    && Object.keys(engine).sort().join(',') === 'corpusFingerprint,engineVersion,layerFingerprint'
    && typeof engine['engineVersion'] === 'string' && engine['engineVersion'].length > 0
    && isSha256Hex(engine['corpusFingerprint']) && isSha256Hex(engine['layerFingerprint']),
  'the exact engine identity triple');
  check('reviewerName', typeof approval['reviewerName'] === 'string', 'a string');
  check('reviewerContact', typeof approval['reviewerContact'] === 'string', 'a string');
  check('independence', typeof approval['independence'] === 'string', 'a string');
  const evidence = approval['evidence'];
  check('evidence', isRecord(evidence)
    && Object.keys(evidence).sort().join(',') === 'path,sha256'
    && typeof evidence['path'] === 'string' && APPROVAL_EVIDENCE_PATH_PATTERN.test(evidence['path'])
    && isSha256Hex(evidence['sha256']),
  'a {path, sha256} record naming a docs/reviews/*.md review record');
  check('reviewPacketSha256', isSha256Hex(approval['reviewPacketSha256']),
    'the 64-hex sha256 the review-packet tool printed for the packet read');
  check('reviewedAt', isReviewDay(approval['reviewedAt']), 'a real YYYY-MM-DD date');
  check('rationale', typeof approval['rationale'] === 'string' && approval['rationale'].trim().length > 0,
    'a non-empty string');
  if ('bootstrap' in approval &&
      (typeof approval['bootstrap'] !== 'string' || approval['bootstrap'].trim().length === 0)) {
    problems.push('"bootstrap" must be a non-empty string documenting why no prior baseline exists');
  }
  if ('priorProvenance' in approval) {
    const prior = approval['priorProvenance'];
    if (prior === null) {
      if (!('bootstrap' in approval)) {
        problems.push('"priorProvenance" may be null only beside a "bootstrap" field documenting the missing prior');
      }
    } else {
      if ('bootstrap' in approval) problems.push('"bootstrap" is valid only when "priorProvenance" is null');
      const priorEngine = isRecord(prior) ? prior['engine'] : undefined;
      const valid = isRecord(prior)
        && Object.keys(prior).sort().join(',') === 'baselineGitBlobSha1,engine'
        && typeof prior['baselineGitBlobSha1'] === 'string' && /^[0-9a-f]{40}$/.test(prior['baselineGitBlobSha1'])
        && isRecord(priorEngine)
        && Object.keys(priorEngine).sort().join(',') === 'corpusFingerprint,engineVersion,layerFingerprint'
        && typeof priorEngine['engineVersion'] === 'string' && priorEngine['engineVersion'].length > 0
        && isSha256Hex(priorEngine['corpusFingerprint'])
        && (priorEngine['layerFingerprint'] === null || isSha256Hex(priorEngine['layerFingerprint']));
      if (!valid) {
        problems.push('"priorProvenance" must bind the prior baseline git blob and engine identity');
      }
    }
  }
  return problems;
}

/**
 * Validates the committed rank-metrics baseline + approval pair. All four
 * presence states are covered: absent/absent is the honest pre-protocol
 * state and yields nothing; every other gap or tamper rings a named finding.
 * Runs in every context (file-level, no engine), so an unapproved baseline
 * cannot hide behind a fixture run.
 */
export function validateRankMetricsBaselineDocuments(input: {
  /** Parsed eval/baselines/rank-metrics.json; null when absent. */
  readonly baseline: unknown;
  /** Parsed eval/baselines/rank-metrics.approval.json; null when absent. */
  readonly approval: unknown;
  /** SHA-256 of the battery files' bytes, as the machine report records them. */
  readonly batteryQueriesSha256: string;
  readonly batteryJudgmentsSha256: string;
  /** SHA-256 of the bytes at approval.evidence.path; null when unreadable. */
  readonly evidenceSha256: string | null;
}): readonly GateFinding[] {
  if (input.baseline === null && input.approval === null) return [];
  if (input.baseline === null) {
    return [rankApprovalFinding(
      'rank-baseline-approval-orphaned',
      `${RANK_METRICS_APPROVAL_PATH} exists but ${RANK_METRICS_BASELINE_PATH} does not — an orphaned ` +
        'approval approves nothing and must not linger',
    )];
  }
  const findings: GateFinding[] = [];
  if (!validRankBaseline(input.baseline)) {
    return [rankApprovalFinding(
      'rank-baseline-malformed',
      `${RANK_METRICS_BASELINE_PATH} does not match the v1 rank-metrics baseline schema`,
    )];
  }
  if (!isRecord(input.approval)) {
    return [rankApprovalFinding(
      'rank-baseline-approval-missing',
      `${RANK_METRICS_BASELINE_PATH} has no machine-readable independent approval — the reviewer ` +
        `hand-authors ${RANK_METRICS_APPROVAL_PATH} under the threshold protocol`,
    )];
  }
  const approval = input.approval;
  if (approval['schema'] !== RANK_METRICS_APPROVAL_SCHEMA_V2) {
    return [rankApprovalFinding(
      'rank-baseline-approval-malformed',
      'Rank-metrics baseline approval does not declare the supported v2 schema.',
    )];
  }
  const problems = rankApprovalShapeProblems(approval);
  if (problems.length > 0) {
    return [rankApprovalFinding(
      'rank-baseline-approval-malformed',
      `Rank-metrics baseline approval is malformed: ${problems.join('; ')}.`,
    )];
  }
  if ((approval['reviewerName'] as string).trim().length === 0
      || (approval['reviewerContact'] as string).trim().length === 0) {
    findings.push(rankApprovalFinding(
      'rank-baseline-approval-reviewer-unidentified',
      'Rank-metrics baseline approval does not name an identifiable independent reviewer.',
    ));
  }
  if ((approval['independence'] as string).trim().length === 0) {
    findings.push(rankApprovalFinding(
      'rank-baseline-approval-independence-missing',
      'Rank-metrics baseline approval carries no independence attestation naming what the reviewer did not author.',
    ));
  }
  const baselineSha256 = createHash('sha256').update(canonicalJson(input.baseline)).digest('hex');
  if (approval['baselineSha256'] !== baselineSha256) {
    findings.push(rankApprovalFinding(
      'rank-baseline-approval-baseline-mismatch',
      'Rank-metrics baseline bytes differ from the independently approved baseline digest.',
    ));
  }
  if (approval['batteryQueriesSha256'] !== input.batteryQueriesSha256) {
    findings.push(rankApprovalFinding(
      'rank-baseline-approval-battery-mismatch',
      'Battery queries file differs from the digest the rank-metrics approval bound.',
    ));
  }
  if (approval['batteryJudgmentsSha256'] !== input.batteryJudgmentsSha256) {
    findings.push(rankApprovalFinding(
      'rank-baseline-approval-battery-mismatch',
      'Battery judgments file differs from the digest the rank-metrics approval bound — the metrics ' +
        'are a function of the judgment set, so a changed set re-opens the baseline.',
    ));
  }
  const evidence = approval['evidence'] as { readonly path: string; readonly sha256: string };
  if (input.evidenceSha256 === null) {
    findings.push(rankApprovalFinding(
      'rank-baseline-approval-evidence-mismatch',
      `Rank-metrics approval evidence ${evidence.path} is missing or unreadable.`,
    ));
  } else if (input.evidenceSha256 !== evidence.sha256) {
    findings.push(rankApprovalFinding(
      'rank-baseline-approval-evidence-mismatch',
      `Rank-metrics approval evidence ${evidence.path} does not match the approved review-record digest.`,
    ));
  }
  const approvalEngine = approval['engine'] as Record<string, string>;
  for (const field of ['engineVersion', 'corpusFingerprint', 'layerFingerprint'] as const) {
    if (approvalEngine[field] !== input.baseline[field]) {
      findings.push(rankApprovalFinding(
        'rank-baseline-approval-engine-mismatch',
        `Rank-metrics baseline ${field} does not match the independently approved engine identity.`,
      ));
    }
  }
  return findings;
}

// Applicability of the battery row is context-dependent; re-export the
// shared helper so report validators and this module cannot drift apart.
export { gateApplicability };
