/**
 * G12: the 84-query pastoral regression battery.
 *
 * Schema tests come first and each one proves an alarm RINGS — a validator
 * that has never been watched failing is decoration. The committed battery
 * files are then validated for real, so a malformed row can never merge
 * behind a green suite.
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  batteryComparableSection,
  batteryGate,
  checkBatteryJobReport,
  harmfulPresenceKey,
  probeHarmfulRefPresence,
  validateBattery as validateBatteryWithFloors,
  type BatteryCategoryFloors,
  type BatteryQueryOutcome,
  type ValidatedBattery,
} from '../src/gates/rankMetrics.js';
import { mergeGateResults } from '../src/gates/merge.js';
import { decideVerdict } from '../src/report.js';
import { gateApplicability, notApplicable, pass, type GateResult } from '../src/gates/types.js';
import { parseAnchorRef } from '../../pipeline/src/importers/ontologyImporter.js';

const EVAL_ROOT = fileURLToPath(new URL('..', import.meta.url));

/** The reviewed structural floors, from budgets.json — the single source. */
const FLOORS = (JSON.parse(readFileSync(join(EVAL_ROOT, 'budgets.json'), 'utf8')) as {
  rankQuality: { battery: { categoryFloors: BatteryCategoryFloors } };
}).rankQuality.battery.categoryFloors;

function validateBattery(queriesFile: unknown, judgmentsFile: unknown): ValidatedBattery {
  return validateBatteryWithFloors(queriesFile, judgmentsFile, FLOORS);
}

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
    // "Philipians" stopped being a valid drill input when P5.2/QR-3 admitted
    // it as a curated misspelling alias (it now resolves to Philippians, as
    // designed) — the drill needs a spelling NO reviewed row will ever
    // cover, so it keeps proving the alarm rings on an unresolvable book.
    const bad = tinyJudgments({ judged: [{ ...JUDGED_ROW, ref: 'Philippianz 4:99' }] });
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
    expect(Object.values(FLOORS).reduce((sum, floor) => sum + floor, 0)).toBe(84);
    // Every seeded judgment is provisional until Jesse ratifies (J17).
    expect(validated.provisionalRows).toBe(validated.judgedRows + validated.harmfulRows);
  });
});

/** Marks every harmful guard present in the corpus: the non-vacuous default. */
function fullPresence(validated: ValidatedBattery): ReadonlyMap<string, boolean> {
  const map = new Map<string, boolean>();
  for (const query of validated.queries) {
    for (const harmful of query.harmful) {
      map.set(harmfulPresenceKey(query.id, harmful.ref), true);
    }
  }
  return map;
}

function outcomeAt(id: string, query: string, topRefs: readonly string[]): BatteryQueryOutcome {
  return {
    id,
    query,
    kind: 'discovery',
    top: topRefs.map((topRef, index) => {
      const range = parseAnchorRef(topRef);
      if (!range) throw new Error(`test ref does not parse: ${topRef}`);
      return {
        rank: index + 1,
        targetId: `WEB:${range.start}`,
        reference: topRef,
        score: 1,
        families: ['exact_phrase'],
      };
    }),
  };
}

describe('battery gate', () => {
  const validated = validateBattery(committedQueries(), committedJudgments());

  function outcomeFor(id: string, query: string, topRef: string): BatteryQueryOutcome {
    return outcomeAt(id, query, [topRef]);
  }

  it('reports not-applicable with a reason on fixture-database runs, as optional advisory', () => {
    const result = batteryGate({
      validated,
      outcomes: null,
      harmfulPresence: null,
      context: { explicitTarget: false },
    });
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
    const fixture = batteryGate({
      validated: broken,
      outcomes: null,
      harmfulPresence: null,
      context: { explicitTarget: false },
    });
    expect(fixture.status).toBe('fail');
    const target = batteryGate({
      validated: broken,
      outcomes: [],
      harmfulPresence: fullPresence(broken),
      context: { explicitTarget: true },
    });
    expect(target.status).toBe('fail');
    expect(target.applicability).toBe('required');
  });

  it('does not fail on a provisional harmful judgment at rank 1, and reports it', () => {
    // Committed ad7 harmful row (Jer 4:10) is provisional pending J17/J18.
    const outcomes = [outcomeFor('ad7', 'it is well with my soul', 'Jeremiah 4:10')];
    const result = batteryGate({
      validated,
      outcomes,
      harmfulPresence: fullPresence(validated),
      context: { explicitTarget: true },
    });
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
    const result = batteryGate({
      validated: ratifiedValidated,
      outcomes,
      harmfulPresence: fullPresence(ratifiedValidated),
      context: { explicitTarget: true },
    });
    expect(result.status).toBe('fail');
    expect(result.findings?.map((finding) => finding.message).join('\n')).toContain('Jeremiah 4:10');
  });

  it('passes a clean explicit-target run and summarizes the judged counts', () => {
    const result = batteryGate({
      validated,
      outcomes: [outcomeFor('fn1', "I'm anxious", 'Philippians 4:6')],
      harmfulPresence: fullPresence(validated),
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
    summary: '84 active, 1 judged row(s), 1 provisional (judged + harmful)',
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
      reportWith({ ...healthyG12, summary: '84 active, 2 judged row(s), 2 provisional (judged + harmful)' }),
    );
    expect(left).not.toBe(drifted);
  });
});

describe('battery checker CLI in the workflow invocation form', () => {
  // `npm run battery:check --workspace eval` runs `tsx src/batteryJobCheck.ts`
  // with cwd = <repo>/eval, while the workflow passes repository-root-relative
  // report paths (`eval/.runs/...`). These tests reproduce that exact cwd +
  // argument shape, so a regression to cwd-relative resolution fails here
  // instead of surfacing as an unsatisfiable CI job.
  const TSX_CLI = fileURLToPath(new URL('../../node_modules/tsx/dist/cli.mjs', import.meta.url));
  const RUNS_DIR = join(EVAL_ROOT, '.runs');

  function healthyReport(summary = '84 active, 1 judged row(s), 1 provisional (judged + harmful)') {
    return {
      schema: 'scripture-search-engine/gauntlet-report/v2',
      payload: {
        verdict: 'REJECT',
        gates: [
          { gate: 'G8-noise-probes', status: 'fail', applicability: 'required', summary: 'baseline approval issue' },
          { gate: 'G12-battery', status: 'pass', applicability: 'required', summary },
        ],
        battery: {
          batteryVersion: 1,
          queriesSha256: 'a'.repeat(64),
          judgmentsSha256: 'b'.repeat(64),
          activeQueries: 84,
          judgedRows: 1,
          provisionalRows: 1,
          results: [],
        },
      },
    };
  }

  function runCli(args: readonly string[]) {
    return spawnSync(process.execPath, [TSX_CLI, 'src/batteryJobCheck.ts', ...args], {
      cwd: EVAL_ROOT,
      encoding: 'utf8',
      timeout: 60_000,
    });
  }

  it('greens a healthy report addressed by its repository-root-relative path', () => {
    const relative = `eval/.runs/battery-cli-check-${process.pid}.json`;
    const absolute = join(RUNS_DIR, `battery-cli-check-${process.pid}.json`);
    mkdirSync(RUNS_DIR, { recursive: true });
    writeFileSync(absolute, JSON.stringify(healthyReport()));
    try {
      const run = runCli(['check', relative]);
      expect(run.error).toBeUndefined();
      expect(run.stdout).toContain('checker green');
      expect(run.status).toBe(0);
    } finally {
      rmSync(absolute, { force: true });
    }
  });

  it('reds a missing report and names the resolved absolute path it read', () => {
    const relative = `eval/.runs/battery-cli-missing-${process.pid}.json`;
    const run = runCli(['check', relative]);
    expect(run.error).toBeUndefined();
    expect(run.status).toBe(1);
    expect(run.stdout).toContain('no report');
    expect(run.stdout).toContain(join(RUNS_DIR, `battery-cli-missing-${process.pid}.json`));
  });

  it('compares legs addressed by repository-root-relative paths, naming resolved paths on failure', () => {
    const leftRelative = `eval/.runs/battery-cli-left-${process.pid}.json`;
    const rightRelative = `eval/.runs/battery-cli-right-${process.pid}.json`;
    const leftAbsolute = join(RUNS_DIR, `battery-cli-left-${process.pid}.json`);
    const rightAbsolute = join(RUNS_DIR, `battery-cli-right-${process.pid}.json`);
    mkdirSync(RUNS_DIR, { recursive: true });
    writeFileSync(leftAbsolute, JSON.stringify(healthyReport()));
    writeFileSync(rightAbsolute, JSON.stringify(healthyReport()));
    try {
      const identical = runCli(['compare', leftRelative, rightRelative]);
      expect(identical.status).toBe(0);
      expect(identical.stdout).toContain('byte-identical');

      writeFileSync(rightAbsolute, JSON.stringify(healthyReport('84 active, 2 judged row(s), 2 provisional (judged + harmful)')));
      const drifted = runCli(['compare', leftRelative, rightRelative]);
      expect(drifted.status).toBe(1);
      expect(drifted.stdout).toContain('FAILED');
      expect(drifted.stdout).toContain(leftAbsolute);
      expect(drifted.stdout).toContain(rightAbsolute);
    } finally {
      rmSync(leftAbsolute, { force: true });
      rmSync(rightAbsolute, { force: true });
    }
  });
});

/** Committed judgments with the ad7 harmful row (Jer 4:10) ratified IN MEMORY.
 * The committed file stays provisional (J18): ratification is Jesse's act;
 * these tests only demonstrate what his ratification will do. */
function ratifiedAd7(): ValidatedBattery {
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
  const validated = validateBattery(committedQueries(), ratified);
  if (validated.findings.length > 0) throw new Error('ratified test battery must validate cleanly');
  return validated;
}

describe('harmful-#1 hard-fail: no aggregate can outvote it (E2)', () => {
  const OTHER_GATES = [
    'G1-provenance',
    'G1b-reachability',
    'G2-determinism',
    'G3-golden',
    'G4-collision',
    'G5-distinctiveness',
    'G6-signal-budgets',
    'G7-correlation',
    'G8-noise-probes',
    'G9-saturation',
    'G10-size',
    'G11-latency',
  ] as const;

  it('REJECTs on a harmful #1 even when every other gate row is perfect', () => {
    const validated = ratifiedAd7();
    const g12 = batteryGate({
      validated,
      outcomes: [outcomeAt('ad7', 'it is well with my soul', ['Jeremiah 4:10'])],
      harmfulPresence: fullPresence(validated),
      context: { explicitTarget: true },
    });
    const perfectOthers = OTHER_GATES.map((gate) => pass(gate, gate, 'perfect'));

    expect(g12.status).toBe('fail');
    expect(decideVerdict({ gates: [...perfectOthers, g12] })).toBe('REJECT');
    // And the finding names the query, the ref, and the human basis.
    const message = g12.findings?.map((finding) => finding.message).join('\n') ?? '';
    expect(message).toContain('ad7');
    expect(message).toContain('Jeremiah 4:10');
  });

  it('computes and reports harmfulInTop3/harmfulInTop10 without failing on them', () => {
    const validated = ratifiedAd7();
    const result = batteryGate({
      validated,
      outcomes: [outcomeAt('ad7', 'it is well with my soul', ['Psalms 42:11', 'Jeremiah 4:10'])],
      harmfulPresence: fullPresence(validated),
      context: { explicitTarget: true },
    });

    expect(result.status).toBe('pass');
    expect(result.metrics?.['harmfulAtRank1']).toBe(0);
    expect(result.metrics?.['harmfulInTop3']).toBe(1);
    expect(result.metrics?.['harmfulInTop10']).toBe(1);
  });

  it('reports a corpus-absent harmful guard as VACUOUS (warn), naming query and ref', () => {
    const validated = validateBattery(committedQueries(), committedJudgments());
    const presence = new Map(fullPresence(validated));
    presence.set(harmfulPresenceKey('ad7', 'Jeremiah 4:10'), false);
    const result = batteryGate({
      validated,
      outcomes: [outcomeAt('ad7', 'it is well with my soul', ['Psalms 42:11'])],
      harmfulPresence: presence,
      context: { explicitTarget: true },
    });

    expect(result.status).toBe('warn');
    const vacuous = (result.findings ?? []).filter((finding) =>
      finding.categoryCode?.endsWith('harmful-guard-vacuous'),
    );
    expect(vacuous).toHaveLength(1);
    expect(vacuous[0]?.message).toContain('ad7');
    expect(vacuous[0]?.message).toContain('Jeremiah 4:10');
    expect(vacuous[0]?.message).toContain('VACUOUS');
    expect(result.metrics?.['vacuousHarmfulGuards']).toBe(1);
  });

  it('warns rather than staying silent when harmful-guard presence was never probed', () => {
    const validated = validateBattery(committedQueries(), committedJudgments());
    const unprobed = batteryGate({
      validated,
      outcomes: [outcomeAt('ad7', 'it is well with my soul', ['Psalms 42:11'])],
      harmfulPresence: null,
      context: { explicitTarget: true },
    });
    // A map that is silently missing a guard is the same hole.
    const partial = batteryGate({
      validated,
      outcomes: [outcomeAt('ad7', 'it is well with my soul', ['Psalms 42:11'])],
      harmfulPresence: new Map<string, boolean>(),
      context: { explicitTarget: true },
    });

    expect(unprobed.status).toBe('warn');
    expect(unprobed.findings?.some((finding) => finding.message.includes('vacuity'))).toBe(true);
    expect(partial.status).toBe('warn');
  });

  it('a harmful violation still fails even when the presence map claims the ref absent', () => {
    // The results prove the corpus carries the ref; the probe must not
    // launder a live harmful #1 into a vacuity warn.
    const validated = ratifiedAd7();
    const presence = new Map(fullPresence(validated));
    presence.set(harmfulPresenceKey('ad7', 'Jeremiah 4:10'), false);
    const result = batteryGate({
      validated,
      outcomes: [outcomeAt('ad7', 'it is well with my soul', ['Jeremiah 4:10'])],
      harmfulPresence: presence,
      context: { explicitTarget: true },
    });

    expect(result.status).toBe('fail');
  });

  it('probes presence through the public passage() API', async () => {
    const validated = validateBattery(committedQueries(), committedJudgments());
    const engine = {
      passage: async (reference: string) =>
        reference === 'Jeremiah 4:10'
          ? { kind: 'invalid-reference' as const, query: reference }
          : {
              kind: 'passage' as const,
              passage: { reference, verses: [{ verseId: 1 }] },
            },
    };
    const presence = await probeHarmfulRefPresence(
      engine as Parameters<typeof probeHarmfulRefPresence>[0],
      validated,
    );

    expect(presence.get(harmfulPresenceKey('ad7', 'Jeremiah 4:10'))).toBe(false);
    expect(presence.get(harmfulPresenceKey('ad6', 'Job 16:2'))).toBe(true);
    expect(presence.get(harmfulPresenceKey('ad5', 'Ecclesiastes 1:9'))).toBe(true);
  });
});

describe('G12 applicability matrix and the anti-swallow proof', () => {
  const validated = validateBattery(committedQueries(), committedJudgments());
  const passingOthers = [pass('G1-provenance', 'Provenance', 'ok'), pass('G3-golden', 'Golden', 'ok')];

  it('fixture-db context: N/A with reason, optional advisory, verdict unaffected', () => {
    const g12 = batteryGate({
      validated,
      outcomes: null,
      harmfulPresence: null,
      context: { explicitTarget: false },
    });

    expect(g12.status).toBe('not-applicable');
    expect(g12.applicability).toBe('optional-advisory');
    expect(g12.summary.length).toBeGreaterThan(0);
    expect(decideVerdict({ gates: [...passingOthers, g12] })).toBe('ADMIT');
  });

  it('explicit-target context: an unrun battery is required + N/A, so the verdict is REJECT', () => {
    const g12 = batteryGate({
      validated,
      outcomes: null,
      harmfulPresence: null,
      context: { explicitTarget: true },
    });

    expect(g12.status).toBe('not-applicable');
    expect(g12.applicability).toBe('required');
    expect(decideVerdict({ gates: [...passingOthers, g12] })).toBe('REJECT');
  });

  it('anti-swallow: mergeGateResults turns an N/A beside passes into a green row', () => {
    // This is a proof about the MERGER, asserted directly: had G12 been merged
    // into G3 the way sub-results are, an unrun battery beside passing
    // sub-results would collapse into a green row — the exact "unrun check
    // reports pass" CLAUDE.md forbids. The own-row roster design exists
    // because of this behavior; if this assertion ever changes, the roster
    // decision should be revisited, not silently kept.
    const merged = mergeGateResults('Golden regression', [
      pass('G3-golden', 'Golden regression (corpus)', 'all hold'),
      notApplicable('G3-golden', 'Pastoral battery (hypothetically merged)', 'battery did not run'),
    ]);

    expect(merged.status).toBe('pass');
  });
});

describe('the Jeremiah 4:10 arc, end to end (E2 DoD)', () => {
  function payloadFor(g12: GateResult, verdict: string): Record<string, unknown> {
    return {
      schema: 'scripture-search-engine/gauntlet-report/v2',
      payload: {
        verdict,
        gates: [
          { gate: 'G8-noise-probes', status: 'fail', applicability: 'required', summary: 'approval debt' },
          { gate: g12.gate, status: g12.status, applicability: g12.applicability, summary: g12.summary },
        ],
        battery: { batteryVersion: 1, results: [] },
      },
    };
  }

  it('provisional row: the live harmful #1 is annotated, gate green, job green', () => {
    const validated = validateBattery(committedQueries(), committedJudgments());
    const g12 = batteryGate({
      validated,
      outcomes: [outcomeAt('ad7', 'it is well with my soul', ['Jeremiah 4:10'])],
      harmfulPresence: fullPresence(validated),
      context: { explicitTarget: true },
    });

    expect(g12.status).toBe('pass');
    expect(g12.summary).toContain('non-gating until ratified');
    const check = checkBatteryJobReport(payloadFor(g12, 'REJECT'));
    expect(check.ok).toBe(true);
  });

  it('ratified row: the same #1 fails the gate and the job checker goes red', () => {
    const validated = ratifiedAd7();
    const g12 = batteryGate({
      validated,
      outcomes: [outcomeAt('ad7', 'it is well with my soul', ['Jeremiah 4:10'])],
      harmfulPresence: fullPresence(validated),
      context: { explicitTarget: true },
    });

    expect(g12.status).toBe('fail');
    const check = checkBatteryJobReport(payloadFor(g12, 'REJECT'));
    expect(check.ok).toBe(false);
    expect(check.problems.join('\n')).toContain('fail');
  });

  it('ranking fix: Jer 4:10 demoted below the pastoral answer greens gate and job', () => {
    const validated = ratifiedAd7();
    const g12 = batteryGate({
      validated,
      outcomes: [outcomeAt('ad7', 'it is well with my soul', ['Psalms 42:11', 'Jeremiah 4:10'])],
      harmfulPresence: fullPresence(validated),
      context: { explicitTarget: true },
    });

    expect(g12.status).toBe('pass');
    const check = checkBatteryJobReport(payloadFor(g12, 'REJECT'));
    expect(check.ok).toBe(true);
  });
});

describe('job checker warn tolerance (vacuity is loud, not blocking)', () => {
  it('tolerates a warn G12 row but prints it as advisory; fail and N/A stay red', () => {
    const base = {
      schema: 'scripture-search-engine/gauntlet-report/v2',
      payload: {
        verdict: 'REJECT',
        gates: [] as Record<string, unknown>[],
        battery: { batteryVersion: 1, results: [] },
      },
    };
    const withRow = (status: string) => ({
      ...base,
      payload: {
        ...base.payload,
        gates: [{ gate: 'G12-battery', status, applicability: 'required', summary: 'guards vacuous' }],
      },
    });

    const warned = checkBatteryJobReport(withRow('warn'));
    expect(warned.ok).toBe(true);
    expect(warned.advisory.join('\n')).toContain('warn');
    expect(checkBatteryJobReport(withRow('fail')).ok).toBe(false);
    expect(checkBatteryJobReport(withRow('not-applicable')).ok).toBe(false);
  });
});
