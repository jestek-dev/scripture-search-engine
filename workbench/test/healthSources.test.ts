import { unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  captureRepositoryIdentity,
  parseGauntletOptions,
} from '../../eval/src/gauntletMachineReport.js';
import {
  displayReportPath,
  gauntletHealthFromParsed,
  readActiveGauntletRun,
  readGoldenAndCoverage,
} from '../src/healthSources.js';
import { repoRoot } from '../src/descriptor.js';

const temporaryFiles: string[] = [];

function runningMarker(startedAt: string): object {
  const flags = parseGauntletOptions(['--require-admit']);
  return {
    schema: 'scripture-search-engine/gauntlet-running/v1',
    pid: process.pid,
    startedAt,
    identity: captureRepositoryIdentity(repoRoot, flags),
  };
}

afterEach(() => {
  for (const file of temporaryFiles.splice(0)) {
    try {
      unlinkSync(file);
    } catch {
      // A test may already have removed its temporary marker.
    }
  }
});

const REPORT = {
  schema: 'scripture-search-engine/gauntlet-report/v1',
  payload: {
    verdict: 'ADMIT',
    headline: 'Admissible. All applicable gates passed.',
  },
};

describe('gauntlet health adapter', () => {
  it('accepts exact ADMIT only after report freshness verifies', () => {
    expect(gauntletHealthFromParsed(REPORT, { fresh: true, mismatches: [] }, 'report.json')).toMatchObject({
      status: 'healthy',
      verdict: 'ADMIT',
      fresh: true,
    });
  });

  it('fails closed when report identity is stale', () => {
    expect(
      gauntletHealthFromParsed(
        REPORT,
        { fresh: false, mismatches: [{ code: 'sse.gauntlet.v1.freshness.dirty-tree-mismatch', message: 'dirty tree changed' }] },
        'report.json',
      ),
    ).toMatchObject({
      status: 'stale',
      fresh: false,
      mismatchReasons: ['dirty tree changed'],
    });
  });

  it('keeps digest-tampered reports rejected', () => {
    expect(
      gauntletHealthFromParsed(
        REPORT,
        {
          fresh: false,
          mismatches: [{ code: 'sse.gauntlet.v1.freshness.report-digest-mismatch', message: 'digest changed' }],
        },
        'report.json',
      ),
    ).toMatchObject({ status: 'rejected', fresh: false });
  });

  it('rejects warning verdicts even when the report is current', () => {
    const warning = { ...REPORT, payload: { ...REPORT.payload, verdict: 'ADMIT_WITH_WARNINGS' } };
    expect(gauntletHealthFromParsed(warning, { fresh: true, mismatches: [] }, 'report.json')).toMatchObject({
      status: 'rejected',
      verdict: 'ADMIT_WITH_WARNINGS',
      fresh: true,
    });
  });
});

describe('health source semantics', () => {
  it('mirrors G3 active fixture coverage, including implicit fixture-id coverage', async () => {
    const { golden, coverage } = await readGoldenAndCoverage();
    expect(golden.filter((fixture) => fixture.status === 'active').length).toBeGreaterThan(0);
    expect(coverage).toHaveLength(58);
    expect(coverage.filter((entry) => entry.status === 'active')).toHaveLength(58);
    expect(coverage.filter((entry) => entry.status === 'uncovered')).toEqual([]);
    expect(coverage).toContainEqual({ id: 'creation', status: 'active' });
  });

  it('recognizes only a fresh, live gauntlet marker as running', async () => {
    const marker = path.join(os.tmpdir(), `gauntlet-running-${process.pid}.json`);
    temporaryFiles.push(marker);
    writeFileSync(marker, JSON.stringify(runningMarker(new Date().toISOString())), 'utf8');
    await expect(readActiveGauntletRun(marker)).resolves.toMatchObject({ status: 'running' });

    writeFileSync(marker, JSON.stringify(runningMarker('2000-01-01T00:00:00.000Z')), 'utf8');
    await expect(readActiveGauntletRun(marker)).resolves.toBeNull();

    writeFileSync(marker, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }), 'utf8');
    await expect(readActiveGauntletRun(marker)).resolves.toBeNull();
  });

  it('labels external reports explicitly instead of displaying relative traversal', () => {
    const external = path.join(os.tmpdir(), 'sse-external-gauntlet-report.json');
    expect(displayReportPath(external)).toBe(`external:${path.resolve(external).replaceAll('\\', '/')}`);
  });
});
