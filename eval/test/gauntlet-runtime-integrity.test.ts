import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildReport } from '../src/report.js';
import { notApplicable, pass } from '../src/gates/types.js';
import {
  GAUNTLET_GATE_ROSTER,
  gauntletExitCode,
  inspectGauntletRunMarkers,
  removeGauntletRunMarker,
  repositoryIdentitiesMatch,
  writeGauntletRunMarker,
  type RepositoryRunIdentity,
} from '../src/gauntletMachineReport.js';

const repositoryIdentity: RepositoryRunIdentity = {
  gitCommitSha: 'a'.repeat(40),
  dirtyTreeSha256: 'b'.repeat(64),
  descriptor: { path: 'artifacts/content-artifact.json', sha256: 'c'.repeat(64) },
  budgetsSha256: 'd'.repeat(64),
  fixtureInputSha256: 'e'.repeat(64),
  flags: {
    checkSources: false,
    updateBaseline: false,
    requireAdmit: true,
    jsonPath: 'eval/.runs/report.json',
    argv: ['--require-admit', '--json', 'eval/.runs/report.json'],
  },
};

function temporaryRepository(): string {
  return mkdtempSync(join(tmpdir(), 'gauntlet-runtime-integrity-'));
}

function completePassingReport() {
  return buildReport({
    gates: GAUNTLET_GATE_ROSTER.map((gate) => pass(gate.id, gate.title, 'ok')),
  });
}

describe('gauntlet runtime integrity', () => {
  it('detects a changed start/end repository identity and leaves the run fail-closed', () => {
    const changedAtEnd = { ...repositoryIdentity, dirtyTreeSha256: 'f'.repeat(64) };

    expect(repositoryIdentitiesMatch(repositoryIdentity, repositoryIdentity)).toBe(true);
    expect(repositoryIdentitiesMatch(repositoryIdentity, changedAtEnd)).toBe(false);
    expect(gauntletExitCode('ADMIT', true)).toBe(0);
    expect(gauntletExitCode('REJECT', true)).toBe(1);
  });

  it('inspects a fresh running marker and removes it cleanly', () => {
    const repoRoot = temporaryRepository();
    const startedAt = '2026-08-10T12:00:00.000Z';
    try {
      const markerPath = writeGauntletRunMarker(repoRoot, startedAt, repositoryIdentity);

      expect(inspectGauntletRunMarkers(repoRoot, {
        now: new Date('2026-08-10T12:00:30.000Z'),
        maxAgeMs: 60_000,
        isProcessAlive: (pid) => pid === process.pid,
      })).toEqual([{
        path: markerPath,
        marker: expect.objectContaining({
          schema: 'scripture-search-engine/gauntlet-running/v1',
          pid: process.pid,
          startedAt,
          identity: repositoryIdentity,
        }),
        state: 'running',
      }]);

      removeGauntletRunMarker(markerPath);
      removeGauntletRunMarker(markerPath);
      expect(existsSync(markerPath)).toBe(false);
      expect(inspectGauntletRunMarkers(repoRoot)).toEqual([]);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });

  it('classifies old and dead-process markers as stale', () => {
    const repoRoot = temporaryRepository();
    try {
      const oldMarker = writeGauntletRunMarker(
        repoRoot,
        '2026-08-10T10:00:00.000Z',
        repositoryIdentity,
      );
      expect(inspectGauntletRunMarkers(repoRoot, {
        now: new Date('2026-08-10T12:00:00.000Z'),
        maxAgeMs: 60_000,
        isProcessAlive: () => true,
      })[0]).toMatchObject({ path: oldMarker, state: 'stale' });

      removeGauntletRunMarker(oldMarker);
      const deadMarker = writeGauntletRunMarker(
        repoRoot,
        '2026-08-10T12:00:00.000Z',
        repositoryIdentity,
      );
      expect(inspectGauntletRunMarkers(repoRoot, {
        now: new Date('2026-08-10T12:00:01.000Z'),
        maxAgeMs: 60_000,
        isProcessAlive: () => false,
      })[0]).toMatchObject({ path: deadMarker, state: 'stale' });
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });

  it('classifies malformed marker JSON as invalid without throwing', () => {
    const repoRoot = temporaryRepository();
    const markerPath = join(repoRoot, 'eval', '.runs', 'gauntlet-running-123.json');
    try {
      mkdirSync(join(repoRoot, 'eval', '.runs'), { recursive: true });
      writeFileSync(markerPath, '{not-json\n', 'utf8');

      expect(inspectGauntletRunMarkers(repoRoot)).toEqual([{
        path: markerPath,
        marker: null,
        state: 'invalid',
      }]);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });

  it('admits an optional G1b N/A gate but rejects a required N/A gate', () => {
    const optionalG1b = buildReport({
      gates: GAUNTLET_GATE_ROSTER.map((gate) =>
        gate.id === 'G1b-reachability'
          ? notApplicable(gate.id, gate.title, 'offline by default')
          : pass(gate.id, gate.title, 'ok'),
      ),
    });
    expect(optionalG1b.verdict).toBe('ADMIT');
    expect(gauntletExitCode(optionalG1b.verdict, true)).toBe(0);

    const requiredUnavailable = buildReport({
      gates: GAUNTLET_GATE_ROSTER.map((gate) =>
        gate.id === 'G2-determinism'
          ? notApplicable(gate.id, gate.title, 'fixture unavailable')
          : pass(gate.id, gate.title, 'ok'),
      ),
    });
    expect(requiredUnavailable.verdict).toBe('REJECT');
    expect(gauntletExitCode(requiredUnavailable.verdict, true)).toBe(1);
  });

  it('keeps the strict roster order and applicability visible in the report', () => {
    const report = completePassingReport();

    expect(report.gates.map((gate) => [gate.gate, gate.applicability])).toEqual(
      GAUNTLET_GATE_ROSTER.map((gate) => [gate.id, gate.applicability]),
    );
  });
});
