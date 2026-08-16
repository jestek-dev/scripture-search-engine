import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import { aggregateHealth, type HealthInputs, type HealthSnapshot } from '../src/health.js';

const RELEASE = {
  engineVersion: '0.8.0',
  corpusFingerprint: 'corpus-a',
  layerFingerprint: 'layer-a',
} as const;

const CURRENT = {
  engineVersion: '0.8.0',
  corpusFingerprint: 'corpus-a',
  layerFingerprint: 'layer-a',
} as const;

const HEALTHY_INPUT: HealthInputs = {
  release: RELEASE,
  artifact: CURRENT,
  golden: [
    { id: 'fixture-a', status: 'active' },
    { id: 'fixture-b', status: 'active', generatedBy: 'workbench' },
    { id: 'fixture-c', status: 'active', generatedBy: 'curated' },
  ],
  coverage: [
    { id: 'concept-a', status: 'active' },
    { id: 'concept-b', status: 'active' },
    { id: 'concept-c', status: 'active' },
    { id: 'concept-d', status: 'active' },
  ],
  judgments: [
    {
      query: 'aligned one',
      at: '2026-08-11T10:00:00.000Z',
      engineVersion: '0.8.0',
      corpusFingerprint: 'corpus-a',
      layerFingerprint: 'layer-a',
    },
    {
      query: 'aligned two',
      at: '2026-08-11T10:05:00.000Z',
      engineVersion: '0.8.0',
      corpusFingerprint: 'corpus-a',
      layerFingerprint: 'layer-a',
    },
  ],
  gauntlet: {
    status: 'healthy',
    verdict: 'ADMIT',
    summary: 'all gates passed',
    reportPath: 'eval/.runs/gauntlet-report.json',
    fresh: true,
  },
  git: {
    branch: 'main',
    state: 'main',
    dirty: false,
    aheadBy: 0,
    behindBy: 0,
  },
  legacyLog: {
    status: 'closed-canonical',
    strayLineNumbers: [],
    message: 'Legacy judgment log is closed and canonical (3 manifested v1 lines).',
  },
};

function sortById<T extends { readonly id: string }>(items: readonly T[]): readonly T[] {
  return [...items].sort((left, right) => left.id.localeCompare(right.id));
}

function sortBy<T>(items: readonly T[], select: (item: T) => string): readonly T[] {
  return [...items].sort((left, right) => select(left).localeCompare(select(right)));
}

function snapshot(input: HealthInputs): HealthSnapshot {
  return aggregateHealth(input);
}

describe('health aggregation', () => {
  it('matches the checked-in healthy API snapshot contract', () => {
    const fixture = JSON.parse(
      readFileSync(new URL('./fixtures/health-healthy.json', import.meta.url), 'utf8'),
    ) as HealthSnapshot;
    expect(snapshot(HEALTHY_INPUT)).toEqual(fixture);
  });

  it('aggregates an aligned, healthy snapshot deterministically', () => {
    const expected = snapshot(HEALTHY_INPUT);
    expect(expected).toEqual({
      schemaVersion: 1,
      status: 'healthy',
      descriptor: {
        identity: RELEASE,
        alignment: 'aligned',
        mismatchFields: [],
        stale: null,
      },
      artifact: {
        identity: CURRENT,
        matchesDescriptor: true,
      },
      golden: {
        total: 3,
        active: 3,
        pending: 0,
        generated: 2,
        generatedBy: {
          curated: 1,
          workbench: 1,
        },
      },
      coverage: {
        total: 4,
        active: 4,
        pending: 0,
        uncovered: 0,
        stale: 0,
      },
      judgments: {
        total: 2,
        effective: 2,
        stale: 0,
      },
      legacyLog: {
        status: 'closed-canonical',
        strayLineNumbers: [],
        message: 'Legacy judgment log is closed and canonical (3 manifested v1 lines).',
      },
      gauntlet: {
        status: 'healthy',
        verdict: 'ADMIT',
        summary: 'all gates passed',
        reason: null,
        reportPath: 'eval/.runs/gauntlet-report.json',
      },
      git: {
        branch: 'main',
        state: 'main',
        dirty: false,
        aheadBy: 0,
        behindBy: 0,
      },
      startup: {
        degraded: false,
        diagnostics: [],
      },
      signals: [],
    });
    expect(Object.keys(expected.golden.generatedBy)).toEqual(['curated', 'workbench']);
  });

  it('stays deterministic when the injected rows arrive in a different order', () => {
    const reordered: HealthInputs = {
      ...HEALTHY_INPUT,
      golden: sortById(HEALTHY_INPUT.golden),
      coverage: sortById(HEALTHY_INPUT.coverage),
      judgments: sortBy(HEALTHY_INPUT.judgments, (judgment) => judgment.query),
    };
    expect(snapshot(reordered)).toEqual(snapshot(HEALTHY_INPUT));
  });

  it('reports stale work when the release is stale, the gauntlet is only available, and inputs are drifting', () => {
    const stale = snapshot({
      release: {
        ...RELEASE,
        stale: {
          since: '2026-08-08',
          reason: 'descriptor is known stale',
          blocksRelease: true,
        },
      },
      artifact: CURRENT,
      golden: [
        { id: 'fixture-a', status: 'active' },
        { id: 'fixture-b', status: 'pending', generatedBy: 'workbench' },
      ],
      coverage: [
        { id: 'concept-a', status: 'active' },
        { id: 'concept-b', status: 'pending' },
        { id: 'concept-c', status: 'uncovered' },
      ],
      judgments: [
        {
          query: 'aligned one',
          at: '2026-08-11T10:00:00.000Z',
          engineVersion: '0.8.0',
          corpusFingerprint: 'corpus-a',
          layerFingerprint: 'layer-a',
        },
        {
          query: 'stale judgment',
          at: '2026-08-11T10:05:00.000Z',
          engineVersion: '0.7.1',
          corpusFingerprint: 'corpus-a',
          layerFingerprint: 'layer-old',
        },
      ],
      gauntlet: {
        status: 'available',
        summary: 'report file present, not yet classified',
        fresh: true,
      },
      git: {
        branch: 'feature/health',
        state: 'branch',
        dirty: true,
        aheadBy: 2,
        behindBy: 1,
      },
    });

    expect(stale.status).toBe('stale');
    expect(stale.descriptor.alignment).toBe('aligned');
    expect(stale.descriptor.stale?.blocksRelease).toBe(true);
    expect(stale.judgments).toEqual({ total: 2, effective: 1, stale: 1 });
    expect(stale.golden).toMatchObject({ total: 2, pending: 1, generated: 1 });
    expect(stale.coverage).toMatchObject({ pending: 1, uncovered: 1, stale: 0 });
    expect(stale.gauntlet.status).toBe('available');
    expect(stale.signals.map((signal) => signal.area)).toEqual([
      'descriptor',
      'golden',
      'coverage',
      'coverage',
      'judgment',
      'gauntlet',
    ]);
    expect(stale.signals.map((signal) => signal.message)).toContain('descriptor is known stale');
  });

  it('warns on stray legacy lines without degrading the server past stale', () => {
    const strays = snapshot({
      ...HEALTHY_INPUT,
      legacyLog: {
        status: 'stray-lines',
        strayLineNumbers: [4],
        message: 'judgments.jsonl line(s) 4 hold legacy v1 record(s) outside the closed migration manifest.',
      },
    });

    expect(strays.status).toBe('stale');
    expect(strays.legacyLog).toEqual({
      status: 'stray-lines',
      strayLineNumbers: [4],
      message: 'judgments.jsonl line(s) 4 hold legacy v1 record(s) outside the closed migration manifest.',
    });
    expect(strays.signals).toEqual([
      {
        area: 'judgment',
        severity: 'warn',
        message: 'judgments.jsonl line(s) 4 hold legacy v1 record(s) outside the closed migration manifest.',
        subjects: ['4'],
      },
    ]);
  });

  it('reports an unchecked legacy log as unavailable without any signal', () => {
    const { legacyLog: _ignored, ...rest } = HEALTHY_INPUT;
    const unchecked = snapshot(rest);
    expect(unchecked.status).toBe('healthy');
    expect(unchecked.signals).toEqual([]);
    expect(unchecked.legacyLog.status).toBe('unavailable');
  });

  it('marks a release/artifact mismatch as rejected', () => {
    const rejected = snapshot({
      ...HEALTHY_INPUT,
      artifact: {
        ...CURRENT,
        layerFingerprint: 'layer-b',
      },
      gauntlet: {
        status: 'rejected',
        verdict: 'REJECT',
        reason: 'corpus golden failures',
        fresh: true,
      },
    });

    expect(rejected.status).toBe('rejected');
    expect(rejected.descriptor.alignment).toBe('mismatch');
    expect(rejected.descriptor.mismatchFields).toEqual(['layerFingerprint']);
    expect(rejected.artifact.matchesDescriptor).toBe(false);
    expect(rejected.gauntlet.status).toBe('rejected');
    expect(rejected.signals.map((signal) => signal.area)).toEqual(['descriptor', 'judgment', 'gauntlet']);
  });

  it('reports running when the gate is still in flight', () => {
    const running = snapshot({
      ...HEALTHY_INPUT,
      gauntlet: {
        status: 'running',
        summary: 'gauntlet job is still executing',
      },
    });

    expect(running.status).toBe('running');
    expect(running.gauntlet.status).toBe('running');
    expect(running.signals).toEqual([]);
  });

  it('reports unavailable when the required inputs are missing', () => {
    const unavailable = snapshot({
      release: null,
      artifact: null,
      golden: [],
      coverage: [],
      judgments: [],
      gauntlet: null,
      git: null,
    });

    expect(unavailable.status).toBe('unavailable');
    expect(unavailable.descriptor.alignment).toBe('missing');
    expect(unavailable.gauntlet.status).toBe('unavailable');
    expect(unavailable.git.state).toBe('unavailable');
    expect(unavailable.signals.map((signal) => signal.area)).toEqual([
      'descriptor',
      'artifact',
      'git',
      'gauntlet',
    ]);
  });

  it('fails closed for an unverified report and never lets running hide unavailable inputs', () => {
    const staleReport = snapshot({
      ...HEALTHY_INPUT,
      gauntlet: { status: 'healthy', verdict: 'ADMIT', mismatchReasons: ['dirty-tree digest changed'] },
    });
    expect(staleReport.status).toBe('rejected');
    expect(staleReport.signals.some((signal) => signal.message.includes('dirty-tree digest changed'))).toBe(true);

    const unavailableWhileRunning = snapshot({
      ...HEALTHY_INPUT,
      artifact: null,
      gauntlet: { status: 'running' },
    });
    expect(unavailableWhileRunning.status).toBe('unavailable');
  });
});
