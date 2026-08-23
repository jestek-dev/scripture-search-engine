import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
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
  readLegacyLogHealth,
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
  schema: 'scripture-search-engine/gauntlet-report/v2',
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
    // 131 = 58 founding concepts + the 20 round-1 books-harvest packs +
    // the 30 round-2 books-harvest packs (2026-08-18) + the 14 Genesis-pilot
    // packs (2026-08-22, PR #41) + asking-in-gods-will
    // (2026-08-21 prosperity-slogan adversarial coverage) + benediction +
    // justification-by-faith (2026-08-21 Phase-4 P4.9/P4.1 gap packs) +
    // trinity + incarnation (2026-08-21 Phase-4 P4.4/P4.5 doctrinal
    // locator packs) + baptism + christ-the-cornerstone + doubt
    // (2026-08-21 Phase-4 P4.10a/P4.10b/P4.10c) +
    // caring-for-aging-parents (2026-08-22 Phase-4 P4.6, the fn13 fix).
    // This mirror moves whenever a concept wave is admitted.
    expect(coverage).toHaveLength(131);
    expect(coverage.filter((entry) => entry.status === 'active')).toHaveLength(131);
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

describe('legacy judgment log health', () => {
  const realJudgmentsPath = path.join(repoRoot, 'workbench', 'judgments.jsonl');
  const realManifestPath = path.join(repoRoot, 'workbench', 'legacy', 'migration-manifest.json');

  function temporaryLog(suffix: string, content: string): string {
    const file = path.join(os.tmpdir(), `sse-legacy-log-${process.pid}-${suffix}.jsonl`);
    temporaryFiles.push(file);
    writeFileSync(file, content, 'utf8');
    return file;
  }

  it('reports the committed log as closed and canonical', async () => {
    await expect(readLegacyLogHealth(realJudgmentsPath, realManifestPath)).resolves.toEqual({
      status: 'closed-canonical',
      strayLineNumbers: [],
      message: 'Legacy judgment log is closed and canonical (3 manifested v1 lines).',
    });
  });

  it('warns on a stray legacy append with its true file line number, never throwing', async () => {
    const raw = readFileSync(realJudgmentsPath, 'utf8');
    const stray = JSON.stringify({ ...JSON.parse(raw.split('\n')[0]!) as object, note: 'stray' });
    const logPath = temporaryLog('stray', `${raw}${stray}\n`);
    const health = await readLegacyLogHealth(logPath, realManifestPath);
    expect(health).toMatchObject({ status: 'stray-lines', strayLineNumbers: [4] });
    expect(health!.message).toContain('line(s) 4');
    expect(health!.message).toContain('v2 workbench');
  });

  it('ignores v2 lines and counts stray positions in the real file', async () => {
    const raw = readFileSync(realJudgmentsPath, 'utf8');
    const v2Line = JSON.stringify({ schemaVersion: 2, anything: true });
    const stray = JSON.stringify({ ...JSON.parse(raw.split('\n')[0]!) as object, note: 'stray' });
    const logPath = temporaryLog('mixed', `${raw}${v2Line}\n${stray}\n`);
    await expect(readLegacyLogHealth(logPath, realManifestPath)).resolves.toMatchObject({
      status: 'stray-lines',
      strayLineNumbers: [5],
    });
  });

  it('flags an edited or deleted manifested line as not canonical', async () => {
    const raw = readFileSync(realJudgmentsPath, 'utf8');
    const [first, ...rest] = raw.split('\n');
    void first;
    const logPath = temporaryLog('truncated', rest.join('\n'));
    await expect(readLegacyLogHealth(logPath, realManifestPath)).resolves.toMatchObject({
      status: 'not-canonical',
      strayLineNumbers: [],
    });
  });

  it('reports an absent manifest as absent instead of failing', async () => {
    await expect(
      readLegacyLogHealth(realJudgmentsPath, path.join(os.tmpdir(), `sse-no-manifest-${process.pid}.json`)),
    ).resolves.toMatchObject({ status: 'absent' });
  });
});
