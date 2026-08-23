/**
 * MS-10 verification: sweep-defect/v1 schema round-trips (with positive
 * controls that doctored records FAIL validation); clustering determinism +
 * severity-then-size ordering + 3 representatives; digest redaction of
 * crisis rows (J69) with a positive control; the battery-mirroring tally;
 * and REPLAY INTEGRITY — defect records built from a real sweep on the
 * fixture bed carry replayCmds that actually execute and reproduce the
 * snapshot line.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { mergeShards, runSweep } from '../src/harness.js';
import { gradeLayer1 } from '../src/grade/layer1.js';
import { loadWatchlist } from '../src/grade/watchlist.js';
import { loadConceptCells } from '../src/universe/inputs.js';
import { REPO_ROOT } from '../src/universe/compileFromRepo.js';
import type { SnapshotRecord } from '../src/snapshot.js';
import type { UniverseLine } from '../src/universe/types.js';
import { buildDefectRecords, replayCommand, topFive } from '../src/defect/build.js';
import { clusterDefects } from '../src/defect/cluster.js';
import { buildTally, displayQuery, renderDigest } from '../src/defect/digest.js';
import {
  anchorSignature,
  clusterKeyOf,
  defectId,
  defectLine,
  DEFECT_SCHEMA,
  parseDefects,
  validateDefectRecord,
  type DefectRecord,
} from '../src/defect/schema.js';
import { buildFixtureArtifact, type FixtureArtifact } from './helpers/fixtureArtifact.js';
import { writeFileSync } from 'node:fs';

const IDENTITY = {
  engineVersion: '0.14.0',
  corpusFingerprint: 'c'.repeat(64),
  layerFingerprint: 'l'.repeat(64),
};

function record(patch: Partial<DefectRecord> & { queryId: string }): DefectRecord {
  const top5 = patch.got?.top5 ?? [
    { rank: 1, reference: 'Psalms 34:18', score: 12, reasonFamilies: ['translation_variant'] },
  ];
  const defectClass = patch.defectClass ?? 'wrong-verse';
  const suspectedCause = patch.suspectedCause ?? 'sole-weak-evidence-at-1';
  const base: DefectRecord = {
    schema: DEFECT_SCHEMA,
    id: defectId(patch.runId ?? 'run-1', patch.queryId, defectClass),
    runId: 'run-1',
    query: 'some query',
    generator: 'grammar:test',
    category: 'felt-need',
    register: 'church-member',
    crisisAdjacent: false,
    identity: IDENTITY,
    expectation: { kind: 'none' },
    got: {
      top5,
      snapshotRef: 'runs/run-1/snapshot-merged.jsonl',
      replayCmd: 'npm run replay --workspace sweep -- … --query-id ' + patch.queryId,
    },
    defectClass,
    severity: 'wrong',
    gradedBy: 'layer1',
    suspectedCause,
    causeEvidence: 'chip signature: translation_variant only',
    clusterKey: clusterKeyOf(defectClass, suspectedCause, anchorSignature(top5)),
    status: 'open',
    ...patch,
  };
  return base;
}

describe('sweep-defect/v1 schema', () => {
  it('round-trips through canonical serialization', () => {
    const original = record({ queryId: 'q:0001', notes: ['seed'] });
    const parsed = parseDefects(defectLine(original) + '\n');
    expect(parsed.length).toBe(1);
    expect(parsed[0]).toEqual(JSON.parse(JSON.stringify(original)));
  });

  it('positive controls: doctored records FAIL validation', () => {
    const good = record({ queryId: 'q:0001' });
    // Wrong schema tag.
    expect(() => validateDefectRecord({ ...good, schema: 'v0' })).toThrow(/schema/);
    // Doctored id (breaks the derivation pin).
    expect(() => validateDefectRecord({ ...good, id: 'defect:0000000000000000' })).toThrow(/id/);
    // Doctored clusterKey.
    expect(() => validateDefectRecord({ ...good, clusterKey: 'f'.repeat(16) })).toThrow(/clusterKey/);
    // top5 longer than 5.
    const six = Array.from({ length: 6 }, (_, i) => ({
      rank: i + 1,
      reference: 'John 3:16',
      score: 1,
      reasonFamilies: ['concept_anchor'],
    }));
    expect(() => validateDefectRecord({ ...good, got: { ...good.got, top5: six } })).toThrow(/top5/);
    // replayCmd without a query id is an anecdote, not an experiment.
    expect(() =>
      validateDefectRecord({ ...good, got: { ...good.got, replayCmd: 'npm run replay' } }),
    ).toThrow(/replayCmd/);
    // Unknown severity, unknown status.
    expect(() => validateDefectRecord({ ...good, severity: 'bad' })).toThrow(/severity/);
    expect(() => validateDefectRecord({ ...good, status: 'done' })).toThrow(/status/);
    // wontfix without rationale.
    expect(() =>
      validateDefectRecord({
        ...good,
        triage: { decision: 'wontfix-with-rationale', decidedBy: 'jesse', at: '2026-08-23' },
      }),
    ).toThrow(/rationale/);
    // Missing identity leg.
    const { layerFingerprint: _dropped, ...partialIdentity } = IDENTITY;
    expect(() => validateDefectRecord({ ...good, identity: partialIdentity })).toThrow(/identity/);
  });

  it('anchorSignature groups by the #1 chip signature, audit-style', () => {
    const soleTranslationVariant = anchorSignature([
      { rank: 1, reference: 'Ecclesiastes 1:9', score: 3, reasonFamilies: ['translation_variant'] },
    ]);
    expect(soleTranslationVariant).toBe('translation_variant');
    expect(anchorSignature([])).toBe('zero-results');
    // ad7-style and fn11-style rows with the same sole-weak #1 signature and
    // cause land in the SAME cluster.
    expect(clusterKeyOf('wrong-verse', 'sole-weak', soleTranslationVariant)).toBe(
      clusterKeyOf('wrong-verse', 'sole-weak', 'translation_variant'),
    );
  });
});

describe('clustering (deterministic, severity-then-size, 3 representatives)', () => {
  const records: DefectRecord[] = [
    // 5-member 'degraded' cluster.
    ...Array.from({ length: 5 }, (_, i) =>
      record({ queryId: `deg:${String(i).padStart(4, '0')}`, severity: 'degraded', suspectedCause: 'flat-tie' }),
    ),
    // 2-member harmful cluster — must outrank the bigger degraded one.
    ...Array.from({ length: 2 }, (_, i) =>
      record({
        queryId: `harm:${String(i).padStart(4, '0')}`,
        severity: 'theologically-harmful',
        suspectedCause: 'watchlist-sense-inversion',
        crisisAdjacent: i === 0,
      }),
    ),
    // 3-member wrong cluster.
    ...Array.from({ length: 3 }, (_, i) =>
      record({ queryId: `wr:${String(i).padStart(4, '0')}`, severity: 'wrong', suspectedCause: 'missing-anchor' }),
    ),
  ];

  it('orders severity-then-size; harmful is absolute, not proportional', () => {
    const clusters = clusterDefects(records);
    expect(clusters.length).toBe(3);
    expect(clusters[0]!.severity).toBe('theologically-harmful');
    expect(clusters[0]!.size).toBe(2);
    expect(clusters[1]!.severity).toBe('wrong');
    expect(clusters[2]!.severity).toBe('degraded');
    expect(clusters[2]!.size).toBe(5);
    expect(clusters[2]!.representatives.length).toBe(3);
  });

  it('is deterministic under input shuffling', () => {
    const shuffled = [...records].reverse();
    expect(JSON.stringify(clusterDefects(shuffled))).toBe(JSON.stringify(clusterDefects(records)));
  });
});

describe('digest (J69 redaction + battery-mirroring tally)', () => {
  it('POSITIVE CONTROL: a crisis row\'s verbatim text NEVER reaches the digest', () => {
    const crisisText = 'UNIQUE-CRISIS-TEXT-i-want-to-disappear';
    const crisis = record({
      queryId: 'crisis:0001',
      query: crisisText,
      crisisAdjacent: true,
      severity: 'theologically-harmful',
      suspectedCause: 'watchlist-sense-inversion',
    });
    const normal = record({ queryId: 'norm:0001', query: 'what is grace' });
    expect(displayQuery(crisis)).not.toContain(crisisText);
    expect(displayQuery(crisis)).toContain('crisis:0001');
    expect(displayQuery(crisis)).toContain('J69');
    expect(displayQuery(normal)).toContain('what is grace');
    const digest = renderDigest(
      clusterDefects([crisis, normal]),
      buildTally([{ category: 'felt-need', aiGrade: 'harmful' }]),
      { runId: 'run-1', identity: IDENTITY, totalQueries: 2, totalDefects: 2 },
    );
    expect(digest).not.toContain(crisisText);
    expect(digest).toContain('crisis:0001');
    expect(digest).toContain('what is grace');
  });

  it('tally mirrors the battery grade axis (3/2/1/0 + harmful) per category', () => {
    const tally = buildTally([
      { category: 'felt-need', aiGrade: 'excellent' },
      { category: 'felt-need', aiGrade: 'harmful' },
      { category: 'felt-need' },
      { category: 'adversarial', aiGrade: 'good' },
    ]);
    expect(tally).toEqual([
      {
        category: 'adversarial',
        total: 1,
        counts: { excellent: 0, good: 1, acceptable: 0, poor: 0, harmful: 0 },
        ungraded: 0,
      },
      {
        category: 'felt-need',
        total: 3,
        counts: { excellent: 1, good: 0, acceptable: 0, poor: 0, harmful: 1 },
        ungraded: 1,
      },
    ]);
    const digest = renderDigest([], tally, {
      runId: 'run-1',
      identity: IDENTITY,
      totalQueries: 4,
      totalDefects: 0,
    });
    expect(digest).toContain('3 (primary)');
    expect(digest).toContain('| felt-need | 3 | 1 | 0 | 0 | 0 | 1 | 1 |');
  });
});

describe('replay integrity (real sweep on the fixture bed)', () => {
  let bed: FixtureArtifact;

  beforeAll(async () => {
    bed = await buildFixtureArtifact('sweep-defects-');
  }, 120_000);
  afterAll(() => {
    rmSync(bed.directory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
  });

  it('defect records from a real run carry replayCmds that EXECUTE and match', async () => {
    // Universe with seeded defects: an anchor that cannot surface on the
    // fixture corpus (missing-verse) and a verse-ref expectation on a
    // non-reference query (typed-kind violation).
    const lines: UniverseLine[] = [
      {
        queryId: 'd-001',
        query: "I'm anxious",
        generator: 'test-defects',
        category: 'felt-need',
        expectation: { kind: 'concept-anchors', conceptId: 'peace-over-anxiety', anchors: ['Obadiah 1:1'] },
      },
      {
        queryId: 'd-002',
        query: 'grief',
        generator: 'test-defects',
        category: 'felt-need',
        expectation: { kind: 'verse-ref', expectedReference: 'Psalms 23' },
      },
      { queryId: 'd-003', query: 'faith without works', generator: 'test-defects', expectation: { kind: 'none' } },
    ];
    const universePath = join(bed.directory, 'defect-universe.jsonl');
    writeFileSync(universePath, lines.map((line) => JSON.stringify(line)).join('\n') + '\n');
    const outDir = join(bed.directory, 'run');
    await runSweep({
      artifactPath: bed.artifactPath,
      universePath,
      outDir,
      descriptorPath: bed.descriptorPath,
    });
    const merged = mergeShards(outDir, 1);
    const snapshotPath = merged.mergedPath;
    const snapshots = new Map<string, SnapshotRecord>(
      readFileSync(snapshotPath, 'utf8')
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line) as SnapshotRecord)
        .map((snapshot) => [snapshot.queryId, snapshot]),
    );
    const concepts = loadConceptCells(join(REPO_ROOT, 'ontology', 'concepts'));
    const summary = gradeLayer1(lines, snapshots, {
      watchlist: loadWatchlist(),
      conceptLabels: new Set(concepts.map((concept) => concept.label)),
      baseSnapshots: snapshots,
    });
    const options = {
      runId: 'replay-int-1',
      identity: {
        engineVersion: bed.identity.engineVersion,
        corpusFingerprint: bed.identity.corpusFingerprint,
        layerFingerprint: bed.identity.layerFingerprint,
      },
      snapshotRef: snapshotPath,
      replay: {
        artifactPath: bed.artifactPath,
        descriptorPath: bed.descriptorPath,
        universePath,
        snapshotPath,
      },
    };
    const records = buildDefectRecords(summary.verdicts, new Map(lines.map((l) => [l.queryId, l])), snapshots, options);
    expect(records.length).toBeGreaterThan(0);
    for (const rec of records) validateDefectRecord(JSON.parse(defectLine(rec)));
    expect(topFive(snapshots.get('d-001'))).toEqual(records.find((r) => r.queryId === 'd-001')?.got.top5);

    // Execute the replay commands of up to 20 records — one CLI invocation,
    // every --query-id from the records' own commands.
    const sample = records.slice(0, 20);
    const queryIds = [...new Set(sample.map((r) => r.queryId))];
    for (const rec of sample) {
      expect(rec.got.replayCmd).toBe(replayCommand(options, rec.queryId));
    }
    const tsx = join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
    const replayScript = join(REPO_ROOT, 'sweep', 'src', 'replay.ts');
    const result = spawnSync(
      process.execPath,
      [
        tsx,
        replayScript,
        '--artifact',
        bed.artifactPath,
        '--descriptor',
        bed.descriptorPath,
        '--universe',
        universePath,
        '--snapshot',
        snapshotPath,
        ...queryIds.flatMap((queryId) => ['--query-id', queryId]),
      ],
      { encoding: 'utf8', timeout: 120_000 },
    );
    expect(result.status, result.stderr).toBe(0);
    for (const queryId of queryIds) {
      expect(result.stdout).toContain(`REPLAY OK   ${queryId}`);
    }
  }, 180_000);
});
