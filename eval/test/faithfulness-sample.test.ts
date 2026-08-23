/**
 * E7 sampler determinism (plan P7.4): same identity triple → byte-identical
 * packet. Also pins the sampling construction itself (seed derivation, the
 * sha256-counter uint32 stream, unbiased rejection, shortfall honesty) so it
 * cannot drift silently — a construction change would re-deal every future
 * audit sample for the same identity, which is an auditability break, not a
 * refactor.
 *
 * The tool builds the packet ONLY. No test here marks a verdict, and the
 * packet's every chip carries `verdict: null` — executing the audit is
 * Jesse's/designee's act behind J45.
 */

import { createHash } from 'node:crypto';
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createEngine, type ScriptureEngine, type ContentQueryPort } from '@jestek-dev/scripture-engine';

import { buildFixtureDatabase } from '../../pipeline/src/buildFixtureDb.js';
import { openCorpus } from '../src/nodeSqlitePort.js';
import {
  DEFAULT_FAITHFULNESS_SAMPLE_SIZE,
  buildFaithfulnessSample,
  fetchChipEvidence,
  identitySeed,
  renderFaithfulnessSample,
  sampleDistinctIndexes,
  uint32Stream,
  type BatteryQueryRow,
} from '../src/faithfulnessSample.js';

const ROOT = join(import.meta.dirname, '..', '..');

let fixtureDirectory: string;
let databasePath: string;
let engine: ScriptureEngine;
let port: ContentQueryPort;
let battery: readonly BatteryQueryRow[];

beforeAll(async () => {
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'sse-faithfulness-'));
  databasePath = join(fixtureDirectory, 'fixture.db');
  buildFixtureDatabase(databasePath);
  port = openCorpus(databasePath);
  engine = await createEngine(port);
  battery = (
    JSON.parse(readFileSync(join(ROOT, 'eval', 'battery', 'queries.json'), 'utf8')) as {
      queries: BatteryQueryRow[];
    }
  ).queries;
});

afterAll(async () => {
  await engine?.close();
  rmSync(fixtureDirectory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
});

describe('the pinned construction', () => {
  it('seed = sha256 of the newline-joined identity triple', () => {
    const identity = {
      engineVersion: '9.9.9',
      corpusFingerprint: 'a'.repeat(64),
      layerFingerprint: 'b'.repeat(64),
    };
    expect(identitySeed(identity)).toBe(
      createHash('sha256')
        .update(`9.9.9\n${'a'.repeat(64)}\n${'b'.repeat(64)}`)
        .digest('hex'),
    );
  });

  it('uint32 stream = sha256(seed:counter) digests, 8 big-endian words each', () => {
    const seed = 'f'.repeat(64);
    const stream = uint32Stream(seed);
    const words: number[] = [];
    for (let i = 0; i < 20; i += 1) words.push(stream.next().value);
    const digest0 = createHash('sha256').update(`${seed}:0`).digest();
    const digest1 = createHash('sha256').update(`${seed}:1`).digest();
    for (let w = 0; w < 8; w += 1) expect(words[w]).toBe(digest0.readUInt32BE(w * 4));
    for (let w = 0; w < 8; w += 1) expect(words[8 + w]).toBe(digest1.readUInt32BE(w * 4));
    // and a fresh stream from the same seed replays identically
    const replay = uint32Stream(seed);
    for (let i = 0; i < 20; i += 1) expect(replay.next().value).toBe(words[i]);
  });

  it('rejection sampling: distinct, in-range, deterministic per seed, unbiased threshold honored', () => {
    const first = sampleDistinctIndexes(97, 30, uint32Stream('a'.repeat(64)));
    const second = sampleDistinctIndexes(97, 30, uint32Stream('a'.repeat(64)));
    expect(second).toEqual(first);
    expect(new Set(first).size).toBe(30);
    expect(first.every((index) => index >= 0 && index < 97)).toBe(true);
    const other = sampleDistinctIndexes(97, 30, uint32Stream('b'.repeat(64)));
    expect(other).not.toEqual(first); // a different identity deals a different sample
  });

  it('shortfall: a pool no larger than the request is taken whole, never padded', () => {
    expect(sampleDistinctIndexes(5, 50, uint32Stream('c'.repeat(64)))).toEqual([0, 1, 2, 3, 4]);
    expect(sampleDistinctIndexes(0, 50, uint32Stream('c'.repeat(64)))).toEqual([]);
  });
});

describe('the packet', () => {
  it('is byte-identical across independent builds for the same identity (plan verification line)', async () => {
    const sampleA = await buildFaithfulnessSample(engine, port, battery, { sampleSize: 12 });
    // A completely fresh engine over the same artifact — a different process
    // in spirit; the bytes must not depend on instance state.
    const portB = openCorpus(databasePath);
    const engineB = await createEngine(portB);
    try {
      const sampleB = await buildFaithfulnessSample(engineB, portB, battery, { sampleSize: 12 });
      expect(renderFaithfulnessSample(sampleB)).toBe(renderFaithfulnessSample(sampleA));
    } finally {
      await engineB.close();
    }
  });

  it('records identity, seed, pool accounting, and only null verdicts', async () => {
    const sample = await buildFaithfulnessSample(engine, port, battery, { sampleSize: 12 });
    expect(sample.identity.engineVersion).toBeTruthy();
    expect(sample.seed).toBe(identitySeed(sample.identity));
    expect(sample.entries).toHaveLength(12);
    expect(sample.shortfall).toBe(0);
    expect(sample.poolSize).toBeGreaterThan(12);
    for (const entry of sample.entries) {
      expect(entry.chips.length).toBeGreaterThan(0); // every result carries ≥1 reason
      for (const chip of entry.chips) {
        expect(chip.verdict).toBeNull(); // the tool NEVER pre-marks the audit
      }
    }
    // Reviewer order: battery order then rank — deterministic presentation.
    const keys = sample.entries.map((entry) => `${entry.queryId}#${entry.rank}`);
    expect(new Set(keys).size).toBe(keys.length); // distinct pairs
  });

  it('fetches evidence rows through the same port for the row-backed families', async () => {
    const sample = await buildFaithfulnessSample(engine, port, battery, {
      sampleSize: DEFAULT_FAITHFULNESS_SAMPLE_SIZE,
    });
    const rowBacked = sample.entries
      .flatMap((entry) => entry.chips)
      .filter((chip) =>
        ['concept_anchor', 'concept_lexicon', 'cross_reference', 'passage_terms', 'translation_variant'].includes(
          chip.family,
        ),
      );
    expect(rowBacked.length).toBeGreaterThan(0);
    for (const chip of rowBacked) {
      expect(chip.evidence, `${chip.family} chip must carry fetched evidence`).toBeDefined();
      expect(chip.evidence!.source).toBeTruthy();
    }
    // At least one such chip actually has rows on the fixture bed — the
    // fetchers are not vacuously returning empty sets across the board.
    expect(rowBacked.some((chip) => chip.evidence!.rows.length > 0)).toBe(true);
  });

  it('a larger requested sample than the pool records the shortfall honestly', async () => {
    // Restrict the battery to one query so the pool is one result page.
    const one = battery.filter((row) => row.status === 'active').slice(0, 1);
    const sample = await buildFaithfulnessSample(engine, port, one, { sampleSize: 500 });
    expect(sample.poolSize).toBeLessThan(500);
    expect(sample.entries.length).toBe(sample.poolSize);
    expect(sample.shortfall).toBe(500 - sample.poolSize);
  });
});

describe('cross-reference evidence total order (round-1 critique M-1)', () => {
  // The defect class: two edges into the audited verse tying on the old SQL
  // ORDER BY prefix (from_verse_id, source_id, votes) but differing in target
  // span came back in query-plan-dependent order, and SQLite's BINARY
  // collation compares source_id as UTF-8 bytes where the packet's pinned
  // order is JS UTF-16 code units (the engine's 2dad545 comparison). Seeded
  // rows use a NONEXISTENT from-verse: the engine only walks cross_references
  // by from_verse_id of ranked seeds (plus an order-independent MAX(votes)),
  // so ranking is provably identical across the doctored copies — only the
  // evidence fetch can tell them apart.
  // 1 is below every real verse_id (book*1e6 + chapter*1e3 + verse), so the
  // seeded rows sort FIRST under the pinned order and can never fall to the
  // evidence row cap behind the fixture's genuine edges.
  const FROM_VERSE = 1;
  // U+10000 sorts BEFORE U+FF01 in UTF-16 code units (0xD800 < 0xFF01) but
  // AFTER it in UTF-8 bytes (F0 90 80 80 > EF BC 81) — the collation probe.
  const SOURCE_ASTRAL = '\u{10000}';
  const SOURCE_FF01 = '！';

  function pinnedRows(auditedVerseId: number) {
    // The pinned total order: (from, source UTF-16, votes, to_start, to_end).
    // 'seeded-tie' ('s' = 0x73) < U+10000 (leads 0xD800) < U+FF01.
    return [
      { from_verse_id: FROM_VERSE, to_start_verse_id: auditedVerseId - 1, to_end_verse_id: auditedVerseId + 1, source_id: 'seeded-tie', votes: 1 },
      { from_verse_id: FROM_VERSE, to_start_verse_id: auditedVerseId, to_end_verse_id: auditedVerseId, source_id: 'seeded-tie', votes: 1 },
      { from_verse_id: FROM_VERSE, to_start_verse_id: auditedVerseId, to_end_verse_id: auditedVerseId, source_id: SOURCE_ASTRAL, votes: 1 },
      { from_verse_id: FROM_VERSE, to_start_verse_id: auditedVerseId, to_end_verse_id: auditedVerseId, source_id: SOURCE_FF01, votes: 1 },
    ] as const;
  }

  function seedCopy(targetPath: string, auditedVerseId: number, reversed: boolean): void {
    copyFileSync(databasePath, targetPath);
    const database = new DatabaseSync(targetPath);
    try {
      const rows = reversed ? [...pinnedRows(auditedVerseId)].reverse() : pinnedRows(auditedVerseId);
      const insert = database.prepare(
        `INSERT INTO cross_references
           (from_verse_id, to_start_verse_id, to_end_verse_id, source_id, votes)
         VALUES (?, ?, ?, ?, ?)`,
      );
      for (const row of rows) {
        insert.run(row.from_verse_id, row.to_start_verse_id, row.to_end_verse_id, row.source_id, row.votes);
      }
    } finally {
      database.close();
    }
  }

  async function findCrossReferencedPair(): Promise<{ row: BatteryQueryRow; verseId: number }> {
    for (const row of battery.filter((entry) => entry.status === 'active')) {
      const outcome = await engine.research(row.query);
      if (outcome.kind !== 'discovery') continue;
      for (const result of outcome.results) {
        if (result.reasons.some((reason) => reason.family === 'cross_reference' || reason.family === 'co_citation')) {
          return { row, verseId: Number.parseInt(result.targetId.slice(result.targetId.indexOf(':') + 1), 10) };
        }
      }
    }
    throw new Error('fixture bed produced no cross_reference/co_citation chip — the ordering test needs one');
  }

  it('packets are byte-identical across opposite insertion orders, with tied rows in the pinned JS order', async () => {
    const { row, verseId } = await findCrossReferencedPair();
    const pathA = join(fixtureDirectory, 'seeded-a.db');
    const pathB = join(fixtureDirectory, 'seeded-b.db');
    seedCopy(pathA, verseId, false);
    seedCopy(pathB, verseId, true);

    const portA = openCorpus(pathA);
    const portB = openCorpus(pathB);
    const engineA = await createEngine(portA);
    const engineB = await createEngine(portB);
    try {
      // Whole-pool sample of the one query's page: the cross-referenced
      // entry is guaranteed in, whatever the seed deals.
      const sampleA = await buildFaithfulnessSample(engineA, portA, [row], { sampleSize: 10_000 });
      const sampleB = await buildFaithfulnessSample(engineB, portB, [row], { sampleSize: 10_000 });
      expect(renderFaithfulnessSample(sampleB)).toBe(renderFaithfulnessSample(sampleA));

      // The seeded ties actually reached the packet (no vacuous pass), in
      // the pinned order — direct fetch keeps the assertion independent of
      // which entry carries the chip.
      const evidence = await fetchChipEvidence(portA, 'cross_reference', verseId);
      const seeded = evidence!.rows.filter((r) => Number(r['from_verse_id']) === FROM_VERSE);
      expect(seeded).toEqual(pinnedRows(verseId).map((r) => ({ ...r })));
      const packetChip = sampleA.entries
        .flatMap((entry) => entry.chips)
        .find((chip) => chip.evidence?.rows.some((r) => Number(r['from_verse_id']) === FROM_VERSE));
      expect(packetChip, 'seeded tie rows must appear in some audited chip').toBeDefined();
    } finally {
      await engineA.close();
      await engineB.close();
    }
  });
});
