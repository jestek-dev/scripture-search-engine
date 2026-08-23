/**
 * P5.4 / QR-5 — deterministic cited spelling correction, end to end against
 * the hermetic fixture artifact (schema v7, engine 0.12.0).
 *
 * The golden fixtures own the ranking assertions; what lives here is the
 * CONTRACT around them: the OOV gate (a word in ANY vocabulary is never
 * rewritten), the scope rules (research() discovery only), the citation
 * surfaces (chips + the corrections list), the engine–pipeline shared-policy
 * cross-check against the shipped delete table, and the schema-6 regression
 * (0.12.0 over a v6 artifact behaves exactly as the pre-spelling engine —
 * presence-probed, which is also the rollback story).
 */

import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { DatabaseSync } from 'node:sqlite';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';

import {
  createEngine,
  deleteVariants,
  dictionaryDeleteDepth,
  editDistanceBudget,
  spellingEditBudget,
  SPELLING_EDIT1_MAX_TOKEN_LENGTH,
  SPELLING_MIN_TOKEN_LENGTH,
  SUGGESTION_EDIT1_MAX_KEY_LENGTH,
  SUGGESTION_MIN_KEY_LENGTH,
  type ScriptureEngine,
} from '@jestek-dev/scripture-engine';
import { buildFixtureDatabase } from '../../pipeline/src/buildFixtureDb.js';

import { openCorpus } from '../src/nodeSqlitePort.js';

let engine: ScriptureEngine;
let fixtureDirectory: string;
let fixturePath: string;

beforeAll(async () => {
  fixtureDirectory = mkdtempSync(join(tmpdir(), 'sse-spelling-'));
  const built = buildFixtureDatabase(join(fixtureDirectory, `fixture-${process.pid}.db`));
  fixturePath = built.path;
  engine = await createEngine(openCorpus(built.path));
});

afterAll(async () => {
  await engine?.close();
  rmSync(fixtureDirectory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
});

describe('cited correction on research() discovery', () => {
  it('substitutes the unique in-policy winner and cites it — never silently', async () => {
    const result = await engine.research('forgivness');
    expect(result.kind).toBe('discovery');
    if (result.kind !== 'discovery') return;
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.corrections).toEqual([
      { typed: 'forgivness', corrected: 'forgiveness', distance: 1 },
    ]);
  });

  it('cites the TYPED surface form, never the stem (stem-divergence)', async () => {
    const result = await engine.research('beleived');
    if (result.kind !== 'discovery') throw new Error('expected discovery');
    // 'beleived' stems to 'beleiv' before correction; the citation must show
    // what the user typed.
    expect(result.corrections).toEqual([
      { typed: 'beleived', corrected: 'believ', distance: 1 },
    ]);
    const chips = result.results.flatMap((entry) => entry.reasons.map((reason) => reason.label));
    expect(chips).toContain('Shared word: believ (corrected from "beleived")');
  });

  it('every result of a corrected query VISIBLY cites every correction — whatever the evidence mix', async () => {
    // Round-2 (defect 2): the token-chip decoration only exists on results
    // whose evidence includes the corrected token's token_overlap chip; the
    // harm-class corrections surface rows through concept/passage evidence
    // instead, which used to leave the visible chips silent about the
    // rewrite. J31 says every correction is SHOWN; covenant 5 makes the
    // explanation the contract. The display-level pin decorates the
    // strongest chip of any result whose chips do not already carry the
    // citation: `Theme: X (query corrected from "<typed>")`.
    for (const query of ['forgivness', 'salvasion', 'beleived', 'gods forgivness']) {
      const result = await engine.research(query);
      if (result.kind !== 'discovery') throw new Error(`expected discovery for ${query}`);
      expect(result.results.length).toBeGreaterThan(0);
      for (const correction of result.corrections ?? []) {
        for (const entry of result.results) {
          expect(
            entry.reasons.some((reason) =>
              reason.label.includes(`corrected from "${correction.typed}"`),
            ),
            `${query}: ${entry.reference} must cite "${correction.typed}"`,
          ).toBe(true);
        }
      }
    }
    // The concrete shape on a concept-anchored row (the ms1 #1):
    const forgivness = await engine.research('forgivness');
    if (forgivness.kind !== 'discovery') throw new Error('expected discovery');
    const first = forgivness.results[0]!;
    expect(first.reasons[0]!.label).toBe(
      'Theme: God\'s forgiveness (query corrected from "forgivness")',
    );
  });

  it('requires Damerau: the gn->ng transposition corrects at distance 1', async () => {
    const result = await engine.research('stregnth');
    if (result.kind !== 'discovery') throw new Error('expected discovery');
    expect(result.corrections).toEqual([
      { typed: 'stregnth', corrected: 'strength', distance: 1 },
    ]);
  });
});

describe('the OOV gate — a word in ANY vocabulary is never rewritten', () => {
  it('corpus words are untouched even with a near neighbour one edit away', async () => {
    for (const query of ['pray', 'sing', 'sheol', 'comfort']) {
      const result = await engine.research(query);
      if (result.kind !== 'discovery') throw new Error('expected discovery');
      expect(result.corrections).toBeUndefined();
    }
  });

  it('book-alias vocabulary blocks correction of df-0 name tokens', async () => {
    // 'mathew' has corpus df 0 but is a curated book alias (P5.2/J33): IN
    // vocabulary, so it is never rewritten — an honest empty beats a guessed
    // proper-noun flip.
    const result = await engine.research('mathew');
    if (result.kind !== 'discovery') throw new Error('expected discovery');
    expect(result.corrections).toBeUndefined();
    expect(result.results).toEqual([]);
  });

  it('the <5 policy floor protects short typos (proper-noun near-misses included)', async () => {
    for (const query of ['jonh', 'pual']) {
      const result = await engine.research(query);
      if (result.kind !== 'discovery') throw new Error('expected discovery');
      expect(result.corrections).toBeUndefined();
      expect(result.results).toEqual([]);
    }
  });

  it('Layer B verse_terms vocabulary blocks correction — a preached word typed correctly is never rewritten', async () => {
    // Round-2 fix (fifth origin). Measured before verse_terms joined the
    // vocabulary: 2,598 fixture-bed words lived ONLY in verse_terms and 703
    // of them corrected away when typed correctly — adoration→adoption,
    // ahimelech→abimelech (a priest renamed to a different person),
    // abhorrence→abhorrent (results destroyed with a correction claim),
    // agitation→habitation, antiquity→iniquity. A word the engine itself can
    // answer via "Preached vocabulary" evidence is IN vocabulary.
    for (const query of ['adoration', 'ahimelech', 'abhorrence', 'agitation', 'antiquity']) {
      const result = await engine.research(query);
      if (result.kind !== 'discovery') throw new Error(`expected discovery for ${query}`);
      expect(result.corrections, query).toBeUndefined();
    }
    // And the un-corrected word still reaches its own homiletical evidence.
    const adoration = await engine.research('adoration');
    if (adoration.kind !== 'discovery') throw new Error('expected discovery');
    expect(adoration.results.length).toBeGreaterThan(0);
  });

  it('archaic forms fold in the tokenizer and never reach the correction layer', async () => {
    const result = await engine.research('loveth');
    if (result.kind !== 'discovery') throw new Error('expected discovery');
    expect(result.corrections).toBeUndefined();
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('a genuinely unknown query with no in-policy neighbour stays an honest empty', async () => {
    const result = await engine.research('quantum photosynthesis algorithm');
    if (result.kind !== 'discovery') throw new Error('expected discovery');
    expect(result.corrections).toBeUndefined();
    expect(result.results).toEqual([]);
  });
});

describe('scope — research() discovery only', () => {
  it('themes() stays exact-curated', async () => {
    expect(await engine.themes('forgivness')).toEqual([]);
  });

  it('forSong() never corrects', async () => {
    const result = await engine.forSong({ title: 'forgivness' });
    if (result.kind !== 'discovery') throw new Error('expected discovery');
    expect(result.results).toEqual([]);
    expect(
      (result as { corrections?: readonly unknown[] }).corrections,
    ).toBeUndefined();
  });

  it('reference-shaped inputs never token-correct — the short-circuit runs first', async () => {
    // 'filipians 4:13' is reference-shaped: it stays a typed invalid-reference
    // with the QR-4 book suggestion, and no token correction ever runs on it.
    const result = await engine.research('filipians 4:13');
    expect(result.kind).toBe('invalid-reference');
    if (result.kind !== 'invalid-reference') return;
    expect(result.suggestion?.book).toBe('Philippians');
  });
});

describe('engine–pipeline shared policy (the ONE table)', () => {
  it('spelling constants ARE the reference constants', () => {
    expect(SPELLING_MIN_TOKEN_LENGTH).toBe(SUGGESTION_MIN_KEY_LENGTH);
    expect(SPELLING_EDIT1_MAX_TOKEN_LENGTH).toBe(SUGGESTION_EDIT1_MAX_KEY_LENGTH);
    for (const length of [4, 5, 8, 9, 12]) {
      expect(spellingEditBudget(length)).toBe(editDistanceBudget(length));
    }
  });

  it('the shipped delete table matches a recomputation from the engine exports', () => {
    const database = new DatabaseSync(fixturePath, { readOnly: true });
    try {
      const samples = database
        .prepare(
          "SELECT term FROM spelling_terms WHERE term IN ('strength', 'forgiveness', 'pray', 'sin', 'believ') ORDER BY term",
        )
        .all() as { term: string }[];
      expect(samples.length).toBe(5);
      for (const { term } of samples) {
        const shipped = (database
          .prepare('SELECT delete_key FROM spelling_deletes WHERE term = ? ORDER BY delete_key')
          .all(term) as { delete_key: string }[]).map((row) => row.delete_key);
        const depth = dictionaryDeleteDepth(term.length);
        expect(shipped).toEqual(depth === 0 ? [] : [...deleteVariants(term, depth)]);
      }
    } finally {
      database.close();
    }
  });
});

describe('schema-6 regression — 0.12.0 over a v6 artifact behaves as the pre-spelling engine', () => {
  it('presence-probes the tables and gracefully does not correct', async () => {
    const doctoredPath = join(fixtureDirectory, `doctored-v6-${process.pid}.db`);
    copyFileSync(fixturePath, doctoredPath);
    const doctored = new DatabaseSync(doctoredPath);
    try {
      doctored.exec(
        'DROP TABLE spelling_deletes; DROP TABLE spelling_terms; DROP TABLE curated_aliases;',
      );
      doctored.prepare("UPDATE meta SET value = '6' WHERE key = 'schema_version'").run();
    } finally {
      doctored.close();
    }
    const v6engine = await createEngine(openCorpus(doctoredPath));
    try {
      // The misspelling is a silent-empty discovery again — exactly the
      // pre-spelling behavior — and nothing throws.
      const miss = await v6engine.research('forgivness');
      if (miss.kind !== 'discovery') throw new Error('expected discovery');
      expect(miss.results).toEqual([]);
      expect(miss.corrections).toBeUndefined();
      // A correctly-spelled query is untouched by the tables' absence.
      const clean = await v6engine.research('forgiveness');
      const v7clean = await engine.research('forgiveness');
      if (clean.kind !== 'discovery' || v7clean.kind !== 'discovery') {
        throw new Error('expected discovery');
      }
      expect(clean.results.map((entry) => [entry.targetId, entry.score])).toEqual(
        v7clean.results.map((entry) => [entry.targetId, entry.score]),
      );
    } finally {
      await v6engine.close();
    }
  });
});
