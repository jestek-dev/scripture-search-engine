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

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';

import { parseAnchorRef } from '../../../pipeline/src/importers/ontologyImporter.js';
import {
  fail,
  gateApplicability,
  notApplicable,
  pass,
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
 * Structural minimums, not quality thresholds: the nine seed counts of the
 * transcribed battery. An active-query count below any floor means the
 * battery has been hollowed out, which is a gate FAIL naming the category.
 * (Known facts about the committed specimen set — deliberately not guessed
 * quality numbers, which live null in eval/budgets.json until baselined.)
 */
export const BATTERY_CATEGORY_FLOORS: Readonly<Record<BatteryCategory, number>> = {
  'felt-need': 14,
  'single-word': 12,
  'remembered-phrase': 12,
  'theological-term': 8,
  'reference-adjacent': 8,
  'misspelling': 6,
  'adversarial': 14,
  'multi-concept': 6,
  'worship-leader': 4,
};

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

function rangesOverlap(
  left: { start: number; end: number },
  right: { start: number; end: number },
): boolean {
  return left.start <= right.end && right.start <= left.end;
}

/**
 * Validates the two battery files against the reviewed-data schema. Never
 * throws on bad data — every problem becomes a finding, so a PR author sees
 * the complete list in one run.
 */
export function validateBattery(queriesFile: unknown, judgmentsFile: unknown): ValidatedBattery {
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
    requireString(row, 'addedAt', location, findings);
    requireString(row, 'origin', location, findings);
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

    queries.push({ id, query, category: cat, judged, harmful, legitimatelyEmpty });
  }

  for (const id of Object.keys(judgments)) {
    if (!seenIds.has(id)) {
      findings.push(finding('orphan-judgment', `judgments.${id} does not match any battery query id`, [id]));
    }
  }

  for (const categoryName of BATTERY_CATEGORIES) {
    const floor = BATTERY_CATEGORY_FLOORS[categoryName];
    const active = activePerCategory.get(categoryName) ?? 0;
    if (active < floor) {
      findings.push(finding(
        'category-floor',
        `category "${categoryName}" has ${active} active quer(ies), below its structural floor of ${floor}`,
        [categoryName],
      ));
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

function rank1InRange(outcome: BatteryQueryOutcome, range: { start: number; end: number }): boolean {
  const first = outcome.top[0];
  if (!first) return false;
  const verseId = verseIdOf(first.targetId);
  return verseId !== null && verseId >= range.start && verseId <= range.end;
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
  readonly context: GateRunContext;
}): GateResult {
  const { validated, outcomes } = input;
  const context = input.context ?? DEFAULT_GATE_RUN_CONTEXT;

  if (validated.findings.length > 0) {
    // Structural integrity of reviewed data is checkable in every context,
    // and a malformed battery file must never wait for an artifact run to
    // be noticed.
    return fail(
      'G12-battery',
      BATTERY_GATE_TITLE,
      `battery files failed structural validation (${validated.findings.length} finding(s))`,
      validated.findings,
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
  // Provisional rows never gate; they are counted and reported instead.
  const failures: GateFinding[] = [];
  let provisionalHarmfulAtRank1 = 0;
  const byId = new Map(validated.queries.map((query) => [query.id, query]));
  for (const outcome of outcomes) {
    const query = byId.get(outcome.id);
    if (!query || outcome.kind !== 'discovery') continue;
    for (const harmful of query.harmful) {
      if (!rank1InRange(outcome, harmful.range)) continue;
      if (harmful.provisional) {
        provisionalHarmfulAtRank1 += 1;
        continue;
      }
      failures.push(finding(
        'harmful-at-rank-1',
        `${outcome.id} ("${outcome.query}"): #1 result ${outcome.top[0]!.reference} overlaps the ` +
          `harmful judgment ${harmful.ref} — ${harmful.why}`,
        [outcome.id],
      ));
    }
  }

  const metrics = {
    activeQueries: validated.activeQueries,
    executedQueries: outcomes.length,
    judgedRows: validated.judgedRows,
    harmfulRows: validated.harmfulRows,
    provisionalRows: validated.provisionalRows,
    harmfulAtRank1: failures.length,
    provisionalHarmfulAtRank1,
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
 * on: the G12 row plus the battery evidence. Deliberately excludes G11 and
 * timestamps, which legitimately differ between legs.
 */
export function batteryComparableSection(parsed: unknown): string {
  if (!isRecord(parsed)) return 'missing-report';
  const payload = parsed['payload'];
  if (!isRecord(payload) || !Array.isArray(payload['gates'])) return 'malformed-report';
  const g12 = payload['gates'].filter((gate) => isRecord(gate) && gate['gate'] === 'G12-battery');
  return canonicalJson({ g12, battery: payload['battery'] ?? null });
}

// Applicability of the battery row is context-dependent; re-export the
// shared helper so report validators and this module cannot drift apart.
export { gateApplicability };
