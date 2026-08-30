import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { createEngine } from '@jestek-dev/scripture-engine';
import { buildFixtureDatabase } from '../../pipeline/src/buildFixtureDb.js';

import {
  GAUNTLET_MACHINE_REPORT_SCHEMA,
  GAUNTLET_GATE_ROSTER,
  buildMachineReport,
  canonicalJson,
  captureRunIdentity,
  dirtyTreeSha256,
  fixtureInputSha256,
  gauntletExitCode,
  parseGauntletOptions,
  resolveMachineReportPath,
  resolveGauntletTarget,
  sha256,
  verifyMachineReportFreshness,
  writeMachineReportAtomically,
  type GauntletMachineReport,
  type GauntletRunIdentity,
} from '../src/gauntletMachineReport.js';
import { buildReport } from '../src/report.js';
import { DOCTRINAL_REVIEWS_PATH, FLAGGED_PAIRINGS_PATH } from '../src/gates/doctrinalGuardrail.js';
import { fail, pass } from '../src/gates/types.js';
import { openCorpus } from '../src/nodeSqlitePort.js';

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const TSX_CLI = fileURLToPath(new URL('../../node_modules/tsx/dist/cli.mjs', import.meta.url));

const identity: GauntletRunIdentity = {
  gitCommitSha: 'a'.repeat(40),
  dirtyTreeSha256: 'b'.repeat(64),
  descriptor: { path: 'artifacts/content-artifact.json', sha256: 'c'.repeat(64) },
  engine: {
    engineVersion: '0.9.0',
    corpusFingerprint: 'd'.repeat(64),
    layerFingerprint: 'e'.repeat(64),
  },
  budgetsSha256: 'f'.repeat(64),
  fixtureInputSha256: '0'.repeat(64),
  flags: {
    checkSources: false,
    updateBaseline: false,
    requireAdmit: false,
    jsonPath: 'eval/.runs/report.json',
    argv: ['--json', 'eval/.runs/report.json'],
  },
};

function completeAdmissionReport() {
  return buildReport({
    gates: GAUNTLET_GATE_ROSTER.map((gate) => pass(gate.id, gate.title, 'ok')),
  });
}

describe('gauntlet machine report', () => {
  it('resolves report paths from the repository root, not the process cwd', () => {
    expect(resolveMachineReportPath(REPO_ROOT, 'eval/.runs/gauntlet-report.json')).toBe(
      join(REPO_ROOT, 'eval', '.runs', 'gauntlet-report.json'),
    );
    expect(() => resolveMachineReportPath(REPO_ROOT, 'eval/gauntlet-report.json')).toThrow('eval/.runs');
    expect(() => resolveMachineReportPath(REPO_ROOT, 'eval/.runs/../../report.json')).toThrow('eval/.runs');
  });

  it('rejects malformed and unknown CLI combinations before any gate runs', () => {
    expect(() => parseGauntletOptions(['--json'])).toThrow('--json requires a path');
    expect(() => parseGauntletOptions(['--check-sources', '--check-sources'])).toThrow(
      'Duplicate --check-sources',
    );
    expect(() => parseGauntletOptions(['--not-a-real-flag'])).toThrow(
      'Unknown gauntlet argument',
    );
    expect(() => parseGauntletOptions(['--candidate-descriptor', 'candidate.json'])).toThrow(
      'requires both',
    );
    expect(() => parseGauntletOptions([
      '--candidate-descriptor', 'candidate.json', '--candidate-database', 'candidate.db',
      '--release-database', 'release.db',
    ])).toThrow('mutually exclusive');
  });

  it('generates and verifies a real candidate-target report from exact descriptor and SQLite bytes', async () => {
    const cacheKey = '7'.repeat(64);
    const candidateDirectory = join(REPO_ROOT, 'workbench', '.state', 'candidates', cacheKey);
    const descriptorRelative = `workbench/.state/candidates/${cacheKey}/candidate-artifact.json`;
    const databaseRelative = `workbench/.state/candidates/${cacheKey}/content.db`;
    const reportRelative = `eval/.runs/candidate-target-${process.pid}.json`;
    const reportPath = join(REPO_ROOT, ...reportRelative.split('/'));
    mkdirSync(candidateDirectory, { recursive: true });
    const built = buildFixtureDatabase(join(candidateDirectory, 'content.db'));
    const engine = await createEngine(openCorpus(built.path));
    let engineOpen = true;
    const databaseSha256 = sha256(readFileSync(built.path));
    const descriptor = {
      formatVersion: 1,
      kind: 'scripture-search-candidate',
      cacheKey,
      proposalDigest: '8'.repeat(64),
      sourceSnapshotDigest: '9'.repeat(64),
      provenancePolicyFingerprint: 'a'.repeat(64),
      base: {
        databaseSha256: 'b'.repeat(64), schemaVersion: '6', engineVersion: engine.engineVersion,
        tokenizerVersion: '1.0.0', corpusFingerprint: engine.corpusFingerprint,
        layerFingerprint: engine.layerFingerprint, manifestFingerprint: 'c'.repeat(64),
        provenancePolicyFingerprint: 'a'.repeat(64),
      },
      schemaVersion: '6', engineVersion: engine.engineVersion, tokenizerVersion: '1.0.0',
      corpusFingerprint: engine.corpusFingerprint, layerFingerprint: engine.layerFingerprint,
      manifestFingerprint: 'c'.repeat(64), databaseSha256, databaseBytes: statSync(built.path).size,
      logicalTableDigest: 'd'.repeat(64), tableDigests: {}, counts: {},
    };
    writeFileSync(join(candidateDirectory, 'candidate-artifact.json'), `${JSON.stringify(descriptor, null, 2)}\n`);
    const options = parseGauntletOptions([
      '--require-admit', '--json', reportRelative,
      '--candidate-descriptor', descriptorRelative,
      '--candidate-database', databaseRelative,
    ]);
    try {
      const target = resolveGauntletTarget(REPO_ROOT, options);
      expect(target?.identity).toMatchObject({
        kind: 'candidate', cacheKey, proposalDigest: descriptor.proposalDigest,
        sourceSnapshotDigest: descriptor.sourceSnapshotDigest,
        descriptor: { kind: 'scripture-search-candidate', path: descriptorRelative },
        database: { path: databaseRelative, sha256: databaseSha256 },
      });
      await engine.close();
      engineOpen = false;
      const run = spawnSync(process.execPath, [TSX_CLI, 'eval/src/gauntlet.ts', ...options.argv], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        timeout: 60_000,
      });
      expect(run.error).toBeUndefined();
      expect(run.status).toBe(0);
      expect(run.stdout).toContain('# Admission Report');
      expect(run.stderr).not.toContain('Error:');
      const parsed = JSON.parse(readFileSync(reportPath, 'utf8')) as GauntletMachineReport;
      const now = new Date();
      expect(parsed.identity.target?.kind).toBe('candidate');
      const { reportSha256, ...unsigned } = parsed;
      expect(reportSha256).toBe(sha256(canonicalJson(unsigned)));

      const wrongKind = { ...parsed, identity: { ...parsed.identity, target: { ...parsed.identity.target, kind: 'release' } } };
      expect(verifyMachineReportFreshness(REPO_ROOT, reportPath, wrongKind, { now }).fresh).toBe(false);
      const wrongDescriptor = {
        ...parsed,
        identity: { ...parsed.identity, target: { ...parsed.identity.target!, descriptor: { ...parsed.identity.target!.descriptor, sha256: '0'.repeat(64) } } },
      };
      expect(verifyMachineReportFreshness(REPO_ROOT, reportPath, wrongDescriptor, { now }).fresh).toBe(false);
      const wrongDatabase = {
        ...parsed,
        identity: { ...parsed.identity, target: { ...parsed.identity.target!, database: { ...parsed.identity.target!.database, sha256: '0'.repeat(64) } } },
      };
      expect(verifyMachineReportFreshness(REPO_ROOT, reportPath, wrongDatabase, { now }).fresh).toBe(false);
      const wrongEngine = {
        ...parsed,
        identity: { ...parsed.identity, engine: { ...parsed.identity.engine, layerFingerprint: '0'.repeat(64) } },
      };
      expect(verifyMachineReportFreshness(REPO_ROOT, reportPath, wrongEngine, { now }).fresh).toBe(false);
    } finally {
      if (engineOpen) await engine.close();
      rmSync(reportPath, { force: true });
      rmSync(candidateDirectory, { recursive: true, force: true });
    }
  });

  it('builds a deterministic REJECT payload with versioned stable finding codes', () => {
    const report = buildReport({
      gates: [fail('G4-collision', 'Collision', 'overlap', [{ message: 'merge these', subjects: ['a', 'b'] }])],
    });
    const first = buildMachineReport({
      startedAt: '2026-08-10T12:00:00.000Z',
      finishedAt: '2026-08-10T12:00:01.000Z',
      identity,
      report,
    });
    const second = buildMachineReport({
      startedAt: '2026-08-10T12:00:00.000Z',
      finishedAt: '2026-08-10T12:00:01.000Z',
      identity: { ...identity, flags: { ...identity.flags } },
      report,
    });

    expect(first).toEqual(second);
    expect(first.schema).toBe(GAUNTLET_MACHINE_REPORT_SCHEMA);
    expect(first.payload.verdict).toBe('REJECT');
    expect(first.payload.gates[0]?.code).toBe('sse.gauntlet.v1.g4-collision.fail');
    expect(first.payload.gates[0]?.findings[0]?.categoryCode).toBe(
      'sse.gauntlet.v1.finding.g4-collision.reported',
    );
    expect(first.payload.gates[0]?.findings[0]?.instanceId).toMatch(
      /^sse\.gauntlet\.v1\.finding-instance\.[0-9a-f]{16}$/,
    );
    expect(first.payloadSha256).toBe(sha256(canonicalJson(first.payload)));
    const { reportSha256, ...unsigned } = first;
    expect(reportSha256).toBe(sha256(canonicalJson(unsigned)));
  });

  it('maps legacy G3 fixture-failure codes to semantic categories instead of crashing', () => {
    // An ACTIVE fixture's preferredOrder failure reaches the machine report
    // carrying corpusGolden's legacy code. Before the legacy-G3 mapping this
    // threw "Invalid semantic category for G3-golden: G3_PREFERRED_ORDER"
    // and the run produced no report at all — a failing guard must yield a
    // machine finding, never a crash.
    const report = buildReport({
      gates: [fail('G3-golden', 'Golden regression', '2 corpus fixture expectation(s) failed', [
        {
          message: 'some-fixture: preferredOrder violated: "Matthew 7:24-27" ranks below "Luke 6:46-49"',
          subjects: ['some-fixture'],
          categoryCode: 'G3_PREFERRED_ORDER',
        },
        {
          message: 'other-fixture: mustNotRank "John 14:14" found at rank 2',
          subjects: ['other-fixture'],
          categoryCode: 'G3_MUST_NOT_RANK',
          params: { ref: 'John 14:14' },
        },
      ])],
    });
    const machine = buildMachineReport({
      startedAt: '2026-08-10T12:00:00.000Z',
      finishedAt: '2026-08-10T12:00:01.000Z',
      identity,
      report,
    });
    expect(machine.payload.verdict).toBe('REJECT');
    expect(machine.payload.gates[0]?.findings.map((finding) => finding.categoryCode)).toEqual([
      'sse.gauntlet.v1.finding.g3-golden.preferred-order',
      'sse.gauntlet.v1.finding.g3-golden.must-not-rank',
    ]);
    // A code outside G3's legacy family still fails loudly — the mapping
    // must not weaken the semantic-category guard for anything else.
    expect(() =>
      buildMachineReport({
        startedAt: '2026-08-10T12:00:00.000Z',
        finishedAt: '2026-08-10T12:00:01.000Z',
        identity,
        report: buildReport({
          gates: [fail('G4-collision', 'Collision', 'bad', [
            { message: 'x', categoryCode: 'G3_PREFERRED_ORDER' },
          ])],
        }),
      }),
    ).toThrow(/Invalid semantic category for G4-collision/);
  });

  it('binds sorted structured fixture-promotion candidates into report digests', () => {
    const report = buildReport({
      gates: [{
        ...pass('G3-golden', 'Golden regression', 'pending fixtures evaluated'),
        promotionCandidates: ['second-fixture', 'first-fixture'],
      }],
    });
    const machine = buildMachineReport({
      startedAt: '2026-08-10T12:00:00.000Z',
      finishedAt: '2026-08-10T12:00:01.000Z',
      identity,
      report,
    });
    expect(machine.payload.gates[0]?.promotionCandidates).toEqual(['first-fixture', 'second-fixture']);
    expect(machine.payloadSha256).toBe(sha256(canonicalJson(machine.payload)));
  });

  it('atomically replaces an existing report and does not leave partial files on failure', () => {
    const directory = mkdtempSync(join(tmpdir(), 'gauntlet-machine-report-'));
    const destination = join(directory, 'report.json');
    writeFileSync(destination, '{"previous":true}\n', 'utf8');
    const report = buildMachineReport({
      startedAt: '2026-08-10T12:00:00.000Z',
      finishedAt: '2026-08-10T12:00:01.000Z',
      identity,
      report: completeAdmissionReport(),
    });
    writeMachineReportAtomically(destination, report);
    expect(JSON.parse(readFileSync(destination, 'utf8')).reportSha256).toBe(report.reportSha256);
    expect(readdirSync(directory).filter((name) => name.endsWith('.tmp'))).toEqual([]);

    const blocker = join(directory, 'not-a-directory');
    writeFileSync(blocker, 'blocker', 'utf8');
    const target = join(blocker, 'report.json');

    expect(() => writeMachineReportAtomically(target, report)).toThrow();
    expect(existsSync(target)).toBe(false);
    expect(existsSync(blocker)).toBe(true);
    expect(readFileSync(destination, 'utf8')).toContain(report.reportSha256);
  });

  it('fails closed on malformed or changed reports and accepts a real fixture-engine report', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'gauntlet-freshness-'));
    const destination = join(REPO_ROOT, 'eval', '.runs', `gauntlet-freshness-${process.pid}.json`);
    const options = parseGauntletOptions(['--json', destination]);
    const built = buildFixtureDatabase(join(directory, 'fixture.db'));
    const engine = await createEngine(openCorpus(built.path));
    const freshReport = buildMachineReport({
      startedAt: '2026-08-10T12:00:00.000Z',
      finishedAt: '2026-08-10T12:00:01.000Z',
      identity: captureRunIdentity(REPO_ROOT, options, engine),
      report: completeAdmissionReport(),
    });
    await engine.close();
    writeMachineReportAtomically(destination, freshReport);

    expect(verifyMachineReportFreshness(
      REPO_ROOT,
      destination,
      JSON.parse(readFileSync(destination, 'utf8')),
      { now: new Date('2026-08-10T12:01:00.000Z') },
    )).toEqual({
      fresh: true,
      mismatches: [],
    });
    expect(verifyMachineReportFreshness(REPO_ROOT, destination, { schema: 'wrong' }).fresh).toBe(false);
    expect(
      verifyMachineReportFreshness(REPO_ROOT, destination, {
        ...freshReport,
        payloadSha256: '0'.repeat(64),
      }, { now: new Date('2026-08-10T12:01:00.000Z') }).mismatches.map((mismatch) => mismatch.code),
    ).toContain('sse.gauntlet.v1.freshness.payload-digest-mismatch');
    rmSync(destination, { force: true });
  });

  it('keeps a configured ignored report path out of the next run identity', () => {
    const path = join(REPO_ROOT, 'eval', '.runs', `gauntlet-dirty-test-${process.pid}.json`);
    const descriptor = JSON.parse(
      readFileSync(join(REPO_ROOT, 'artifacts', 'content-artifact.json'), 'utf8'),
    ) as { engineVersion: string; corpusFingerprint: string; layerFingerprint: string };
    const options = parseGauntletOptions(['--json', path]);
    const engine = {
      engineVersion: descriptor.engineVersion,
      corpusFingerprint: descriptor.corpusFingerprint,
      layerFingerprint: descriptor.layerFingerprint,
    };
    const before = captureRunIdentity(REPO_ROOT, options, engine);
    writeFileSync(path, '{"generated":true}\n', 'utf8');
    try {
      const rerun = captureRunIdentity(REPO_ROOT, options, engine);
      expect(rerun.dirtyTreeSha256).toBe(before.dirtyTreeSha256);
      expect(dirtyTreeSha256(REPO_ROOT)).toBe(before.dirtyTreeSha256);
    } finally {
      rmSync(path, { force: true });
    }
  });

  it('keeps the admission manifest directory out of the dirty-tree identity', () => {
    // The admit act writes workbench/admissions/<digest>.json between the
    // candidate report and its post-admit re-verification; hashing it in
    // would make every completed admission stale by construction.
    const directory = join(REPO_ROOT, 'workbench', 'admissions');
    const created = !existsSync(directory);
    const manifestPath = join(directory, `dirty-tree-test-${process.pid}.json`);
    const before = dirtyTreeSha256(REPO_ROOT);
    mkdirSync(directory, { recursive: true });
    writeFileSync(manifestPath, '{"admitted":true}\n', 'utf8');
    try {
      expect(dirtyTreeSha256(REPO_ROOT)).toBe(before);
    } finally {
      rmSync(manifestPath, { force: true });
      if (created) rmSync(directory, { recursive: true, force: true });
    }
  });

  it('requires the exact ADMIT verdict only when requested', () => {
    expect(gauntletExitCode('ADMIT', true)).toBe(0);
    expect(gauntletExitCode('ADMIT_WITH_WARNINGS', true)).toBe(1);
    expect(gauntletExitCode('REJECT', false)).toBe(1);
    expect(gauntletExitCode('ADMIT_WITH_WARNINGS', false)).toBe(0);
  });
});

describe.sequential('gauntlet CLI process', () => {
  // 600s test / 180s per spawn, not the 60s defaults: this test runs the FULL
  // gauntlet CLI three times, and each run rebuilds the fixture database over
  // the full-Bible corpus (web-subset 1.37 MB -> 7.68 MB, 2026-08-26
  // expansion). A Windows runner exceeded 60s while Linux passed — the exact
  // cross-platform timing class the config comment above warns about.
  it('keeps Markdown on stdout and writes complete reports for an in-repo rerun', () => {
    const jsonPath = join(REPO_ROOT, 'eval', '.runs', `gauntlet-report-test-${process.pid}.json`);
    const run = (args: string[]) =>
      spawnSync(process.execPath, [TSX_CLI, 'eval/src/gauntlet.ts', ...args], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        timeout: 180_000,
      });

    try {
      const defaultRun = run([]);
      const jsonRun = run(['--json', jsonPath]);
      expect(jsonRun.error).toBeUndefined();
      expect(jsonRun.stderr).not.toContain('Error:');
      expect(existsSync(jsonPath)).toBe(true);
      const firstJson = JSON.parse(readFileSync(jsonPath, 'utf8')) as {
        schema: string;
        identity: GauntletRunIdentity;
        payload: { verdict: string };
        payloadSha256: string;
        reportSha256: string;
      };
      const rerun = run(['--json', jsonPath]);
      const secondJson = JSON.parse(readFileSync(jsonPath, 'utf8')) as typeof firstJson;
      const verdictLine = defaultRun.stdout.match(/\*\*Verdict: ([A-Z ]+)\*\*/)?.[1];
      const liveVerdict = verdictLine?.replaceAll(' ', '_');
      const normalExit = liveVerdict === 'REJECT' ? 1 : 0;

      expect(defaultRun.error).toBeUndefined();
      expect(liveVerdict).toMatch(/^(ADMIT|ADMIT_WITH_WARNINGS|REJECT)$/);
      expect(defaultRun.status).toBe(normalExit);
      expect(jsonRun.status).toBe(normalExit);
      expect(rerun.status).toBe(normalExit);
      expect(jsonRun.stdout).toContain('# Admission Report');
      expect(jsonRun.stdout).not.toContain('"schema"');
      expect(rerun.stdout).toContain('# Admission Report');

      expect(firstJson.schema).toBe(GAUNTLET_MACHINE_REPORT_SCHEMA);
      expect(firstJson.payload.verdict).toBe(liveVerdict);
      expect(firstJson.identity.gitCommitSha).toMatch(/^[0-9a-f]{40}$/);
      expect(firstJson.identity.dirtyTreeSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(firstJson.identity.fixtureInputSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(firstJson.payloadSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(firstJson.reportSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(secondJson.identity.dirtyTreeSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(secondJson.reportSha256).toMatch(/^[0-9a-f]{64}$/);
    } finally {
      rmSync(jsonPath, { force: true });
    }
  }, 600_000);

  it('names the doctrinal-guardrail data files in fixtureInputSha256 (edit moves the hash, revert restores it)', () => {
    const scratch = mkdtempSync(join(tmpdir(), 'fixture-input-sha-'));
    try {
      // A scratch repo containing only the guardrail files: absent roots hash
      // as empty, so any hash movement below is attributable to these files.
      // Paths come from the gate's own constants, so roster and gate cannot
      // drift apart on a move/rename.
      const guardrailFiles = [DOCTRINAL_REVIEWS_PATH, FLAGGED_PAIRINGS_PATH].map((path) =>
        join(scratch, path),
      );
      for (const file of guardrailFiles) mkdirSync(dirname(file), { recursive: true });
      writeFileSync(guardrailFiles[0]!, 'reviews: []\n');
      writeFileSync(guardrailFiles[1]!, 'pairings: []\n');
      const baseline = fixtureInputSha256(scratch);

      for (const file of guardrailFiles) {
        const original = readFileSync(file, 'utf8');

        writeFileSync(file, `${original}# reviewed-data edit\n`);
        expect(fixtureInputSha256(scratch)).not.toBe(baseline);

        rmSync(file);
        expect(fixtureInputSha256(scratch)).not.toBe(baseline);

        writeFileSync(file, original);
        expect(fixtureInputSha256(scratch)).toBe(baseline);
      }

      // Files outside the enumerated roster must not move the hash; widening
      // the roster is a deliberate change that updates this expectation.
      writeFileSync(join(dirname(guardrailFiles[0]!), 'README.md'), 'stray\n');
      expect(fixtureInputSha256(scratch)).toBe(baseline);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });

  it('rejects unknown arguments as a CLI usage error without starting the gauntlet', () => {
    const result = spawnSync(process.execPath, [TSX_CLI, 'eval/src/gauntlet.ts', '--unknown'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      timeout: 10_000,
    });
    expect(result.status).toBe(2);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('Unknown gauntlet argument');
  });
});
