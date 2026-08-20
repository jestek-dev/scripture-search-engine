/**
 * G12: the 84-query pastoral regression battery.
 *
 * Schema tests come first and each one proves an alarm RINGS — a validator
 * that has never been watched failing is decoration. The committed battery
 * files are then validated for real, so a malformed row can never merge
 * behind a green suite.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  BATTERY_CATEGORY_FLOORS,
  batteryComparableSection,
  batteryGate,
  checkBatteryJobReport,
  validateBattery,
  type BatteryQueryOutcome,
} from '../src/gates/rankMetrics.js';
import { gateApplicability } from '../src/gates/types.js';
import { parseAnchorRef } from '../../pipeline/src/importers/ontologyImporter.js';

const EVAL_ROOT = fileURLToPath(new URL('..', import.meta.url));

function committedQueries(): unknown {
  return JSON.parse(readFileSync(join(EVAL_ROOT, 'battery', 'queries.json'), 'utf8'));
}

function committedJudgments(): unknown {
  return JSON.parse(readFileSync(join(EVAL_ROOT, 'battery', 'judgments.json'), 'utf8'));
}

/** Minimal well-formed one-query battery for targeted mutations. */
function tinyQueries(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    batteryVersion: 1,
    queries: [
      {
        id: 'fn1',
        query: "I'm anxious",
        category: 'felt-need',
        status: 'active',
        addedAt: '2026-08-20',
        origin: 'test',
        ...overrides,
      },
    ],
  };
}

function tinyJudgments(entry: Record<string, unknown>): Record<string, unknown> {
  return { batteryVersion: 1, judgments: { fn1: entry } };
}

const JUDGED_ROW = {
  ref: 'Philippians 4:6-7',
  grade: 3,
  basis: 'test',
  judgedBy: 'test',
  judgedAt: '2026-08-20',
};

function messages(queriesFile: unknown, judgmentsFile: unknown): string {
  return validateBattery(queriesFile, judgmentsFile)
    .findings.map((finding) => finding.message)
    .join('\n');
}

describe('battery schema validation', () => {
  it('accepts the minimal well-formed battery (floors intentionally unmet are the only findings)', () => {
    const validated = validateBattery(tinyQueries(), tinyJudgments({ judged: [JUDGED_ROW] }));
    // A one-query battery is below every floor; nothing else may ring.
    expect(validated.findings.every((finding) => finding.message.includes('floor'))).toBe(true);
  });

  it('rings on a grade outside 0-3', () => {
    const bad = tinyJudgments({ judged: [{ ...JUDGED_ROW, grade: 4 }] });
    expect(messages(tinyQueries(), bad)).toContain('grade');
  });

  it('rings on a non-integer grade', () => {
    const bad = tinyJudgments({ judged: [{ ...JUDGED_ROW, grade: 2.5 }] });
    expect(messages(tinyQueries(), bad)).toContain('grade');
  });

  it('rings on a non-canonical reference', () => {
    const bad = tinyJudgments({ judged: [{ ...JUDGED_ROW, ref: 'Philipians 4:99' }] });
    expect(messages(tinyQueries(), bad)).toContain('not a canonical scripture range');
  });

  it('rings on duplicate or overlapping judged ranges within one query', () => {
    const bad = tinyJudgments({
      judged: [
        JUDGED_ROW,
        { ...JUDGED_ROW, ref: 'Philippians 4:7', grade: 2 },
      ],
    });
    expect(messages(tinyQueries(), bad)).toContain('overlap');
  });

  it('rings on an unknown field in a judged row', () => {
    const bad = tinyJudgments({ judged: [{ ...JUDGED_ROW, verdict: 'E' }] });
    expect(messages(tinyQueries(), bad)).toContain('unknown field');
  });

  it('rings on an unknown field in a query row', () => {
    const validated = validateBattery(
      tinyQueries({ grade: 3 }),
      tinyJudgments({ judged: [JUDGED_ROW] }),
    );
    expect(validated.findings.map((f) => f.message).join('\n')).toContain('unknown field');
  });

  it('rings on an active query with zero judged rows and no legitimatelyEmpty record', () => {
    expect(messages(tinyQueries(), { batteryVersion: 1, judgments: {} })).toContain('fn1');
    // A harmful row alone is not a judgment of what SHOULD surface.
    const harmfulOnly = tinyJudgments({
      harmful: [{ ref: 'Jeremiah 4:10', why: 'test', judgedBy: 'test', judgedAt: '2026-08-20' }],
    });
    expect(messages(tinyQueries(), harmfulOnly)).toContain('fn1');
  });

  it('accepts legitimatelyEmpty in place of judged rows, but not beside them', () => {
    const empty = { why: 'test', judgedBy: 'test', judgedAt: '2026-08-20' };
    const ok = validateBattery(tinyQueries(), tinyJudgments({ legitimatelyEmpty: empty }));
    expect(ok.findings.every((finding) => finding.message.includes('floor'))).toBe(true);
    const contradictory = tinyJudgments({ judged: [JUDGED_ROW], legitimatelyEmpty: empty });
    expect(messages(tinyQueries(), contradictory)).toContain('legitimatelyEmpty');
  });

  it('rings on judgments for a query id the battery does not contain', () => {
    const orphan = {
      batteryVersion: 1,
      judgments: { fn1: { judged: [JUDGED_ROW] }, zz9: { judged: [JUDGED_ROW] } },
    };
    expect(messages(tinyQueries(), orphan)).toContain('zz9');
  });

  it('rings on a retired query without a retirement note', () => {
    const retired = tinyQueries({ status: 'retired', retiredAt: '2026-08-21' });
    expect(messages(retired, { batteryVersion: 1, judgments: {} })).toContain('retirementNote');
  });

  it('rings on a category floor violation, naming the category', () => {
    // The committed battery meets every floor; retiring one felt-need query
    // drops that category below its structural minimum.
    const queries = committedQueries() as { queries: Record<string, unknown>[] };
    const retired = {
      ...(committedQueries() as Record<string, unknown>),
      queries: queries.queries.map((row) =>
        row['id'] === 'fn1'
          ? { ...row, status: 'retired', retiredAt: '2026-08-21', retirementNote: 'test' }
          : row,
      ),
    };
    const text = messages(retired, committedJudgments());
    expect(text).toContain('felt-need');
    expect(text).toContain('floor');
  });

  it('validates the committed battery files cleanly: 84 active queries, every one judged', () => {
    const validated = validateBattery(committedQueries(), committedJudgments());
    expect(validated.findings).toEqual([]);
    expect(validated.activeQueries).toBe(84);
    expect(Object.values(BATTERY_CATEGORY_FLOORS).reduce((sum, floor) => sum + floor, 0)).toBe(84);
    // Every seeded judgment is provisional until Jesse ratifies (J17).
    expect(validated.provisionalRows).toBe(validated.judgedRows + validated.harmfulRows);
  });
});

describe('battery gate', () => {
  const validated = validateBattery(committedQueries(), committedJudgments());

  function outcomeFor(id: string, query: string, topRef: string): BatteryQueryOutcome {
    const range = parseAnchorRef(topRef);
    if (!range) throw new Error(`test ref does not parse: ${topRef}`);
    return {
      id,
      query,
      kind: 'discovery',
      top: [{ rank: 1, targetId: `WEB:${range.start}`, reference: topRef, score: 1, families: ['exact_phrase'] }],
    };
  }

  it('reports not-applicable with a reason on fixture-database runs, as optional advisory', () => {
    const result = batteryGate({ validated, outcomes: null, context: { explicitTarget: false } });
    expect(result.status).toBe('not-applicable');
    expect(result.applicability).toBe('optional-advisory');
    expect(result.summary).toContain('release');
  });

  it('is required on explicit-target runs', () => {
    expect(gateApplicability('G12-battery', { explicitTarget: true })).toBe('required');
    expect(gateApplicability('G12-battery', { explicitTarget: false })).toBe('optional-advisory');
    // A lost context degrades to advisory, never to a wrongly green required row.
    expect(gateApplicability('G12-battery')).toBe('optional-advisory');
  });

  it('fails in any context when the battery files are structurally invalid', () => {
    const broken = validateBattery(tinyQueries(), { batteryVersion: 1, judgments: {} });
    const fixture = batteryGate({ validated: broken, outcomes: null, context: { explicitTarget: false } });
    expect(fixture.status).toBe('fail');
    const target = batteryGate({ validated: broken, outcomes: [], context: { explicitTarget: true } });
    expect(target.status).toBe('fail');
    expect(target.applicability).toBe('required');
  });

  it('does not fail on a provisional harmful judgment at rank 1, and reports it', () => {
    // Committed ad7 harmful row (Jer 4:10) is provisional pending J17/J18.
    const outcomes = [outcomeFor('ad7', 'it is well with my soul', 'Jeremiah 4:10')];
    const result = batteryGate({ validated, outcomes, context: { explicitTarget: true } });
    expect(result.status).toBe('pass');
    expect(result.metrics?.['provisionalHarmfulAtRank1']).toBe(1);
  });

  it('fails on the same harmful judgment once it is no longer provisional', () => {
    const judgments = committedJudgments() as {
      judgments: Record<string, { harmful?: { ref: string; provisional?: boolean }[] }>;
    };
    const ratified = {
      ...(committedJudgments() as Record<string, unknown>),
      judgments: {
        ...judgments.judgments,
        ad7: {
          ...judgments.judgments['ad7'],
          harmful: judgments.judgments['ad7']!.harmful!.map(({ provisional: _dropped, ...row }) => row),
        },
      },
    };
    const ratifiedValidated = validateBattery(committedQueries(), ratified);
    expect(ratifiedValidated.findings).toEqual([]);
    const outcomes = [outcomeFor('ad7', 'it is well with my soul', 'Jeremiah 4:10')];
    const result = batteryGate({ validated: ratifiedValidated, outcomes, context: { explicitTarget: true } });
    expect(result.status).toBe('fail');
    expect(result.findings?.map((finding) => finding.message).join('\n')).toContain('Jeremiah 4:10');
  });

  it('passes a clean explicit-target run and summarizes the judged counts', () => {
    const result = batteryGate({
      validated,
      outcomes: [outcomeFor('fn1', "I'm anxious", 'Philippians 4:6')],
      context: { explicitTarget: true },
    });
    expect(result.status).toBe('pass');
    expect(result.applicability).toBe('required');
    expect(result.summary).toMatch(/84 active/);
  });
});

describe('battery full-artifact job checker', () => {
  function reportWith(g12: Record<string, unknown> | null, withBattery = true): Record<string, unknown> {
    const gates: Record<string, unknown>[] = [
      { gate: 'G8-noise-probes', status: 'fail', applicability: 'required', summary: 'baseline approval issue' },
    ];
    if (g12 !== null) gates.push(g12);
    return {
      schema: 'scripture-search-engine/gauntlet-report/v2',
      payload: {
        verdict: 'REJECT',
        gates,
        ...(withBattery
          ? {
              battery: {
                batteryVersion: 1,
                queriesSha256: 'a'.repeat(64),
                judgmentsSha256: 'b'.repeat(64),
                activeQueries: 84,
                judgedRows: 1,
                provisionalRows: 1,
                results: [],
              },
            }
          : {}),
      },
    };
  }

  const healthyG12 = {
    gate: 'G12-battery',
    status: 'pass',
    applicability: 'required',
    summary: '84 active, 1 judged row(s), 1 provisional',
  };

  it('fails on a MISSING or unparsable report (the early-abort case)', () => {
    const check = checkBatteryJobReport(undefined);
    expect(check.ok).toBe(false);
    expect(check.problems.join('\n')).toContain('no report');
  });

  it('fails on a report whose G12 row is not-applicable', () => {
    const check = checkBatteryJobReport(
      reportWith({ ...healthyG12, status: 'not-applicable', applicability: 'optional-advisory' }),
    );
    expect(check.ok).toBe(false);
    expect(check.problems.join('\n')).toContain('did not run');
  });

  it('fails on a report whose G12 row failed', () => {
    const check = checkBatteryJobReport(reportWith({ ...healthyG12, status: 'fail' }));
    expect(check.ok).toBe(false);
    expect(check.problems.join('\n')).toContain('fail');
  });

  it('fails when the G12 row is missing entirely or not marked required', () => {
    expect(checkBatteryJobReport(reportWith(null)).ok).toBe(false);
    expect(checkBatteryJobReport(reportWith({ ...healthyG12, applicability: 'optional-advisory' })).ok).toBe(false);
  });

  it('fails when the battery section is absent', () => {
    expect(checkBatteryJobReport(reportWith(healthyG12, false)).ok).toBe(false);
  });

  it('accepts a healthy report and prints the tolerated non-G12 rows as advisory', () => {
    const check = checkBatteryJobReport(reportWith(healthyG12));
    expect(check.ok).toBe(true);
    expect(check.problems).toEqual([]);
    // The tolerated REJECT stays visible: overall verdict plus every non-G12 row.
    expect(check.advisory.join('\n')).toContain('REJECT');
    expect(check.advisory.join('\n')).toContain('G8-noise-probes');
  });

  it('byte-compares the G12 and battery sections across legs', () => {
    const left = batteryComparableSection(reportWith(healthyG12));
    const right = batteryComparableSection(reportWith(healthyG12));
    expect(left).toBe(right);
    const drifted = batteryComparableSection(
      reportWith({ ...healthyG12, summary: '84 active, 2 judged row(s), 2 provisional' }),
    );
    expect(left).not.toBe(drifted);
  });
});
