/**
 * Empty `verse_translation_tokens` tolerance — the J48 no-go path, proven.
 *
 * RH-8/P2.5: schema 6's `verse_translation_tokens` table derives from
 * ESV/NIV/NLT translation variants. If Jesse's counsel go/no-go (J48) comes
 * back NO-GO, the fallback is a re-mint with the table EMPTY — schema stays 6,
 * the table exists, it simply has zero rows. That fallback is only real if the
 * engine tolerates that shape today; otherwise "re-mint with the table empty"
 * is an aspiration hiding an engine PR. This suite is the mechanical proof,
 * written BEFORE the descriptor-PR checklist line that relies on it.
 *
 * What tolerance means here, precisely:
 *   1. `createEngine` opens the artifact (schema admission is unchanged by
 *      row count).
 *   2. The translation-variant step still RUNS — `hasTranslationTokens()` is
 *      table-presence, so an empty table does not short-circuit the code path;
 *      the queries themselves must come back empty without error.
 *   3. Discovery queries succeed, deterministically, with ZERO
 *      translation_variant reasons — the signal degrades to silence, never to
 *      a crash or a fabricated reason.
 *   4. Every other intent (reference, exact phrase, tokens) is untouched.
 *
 * A control assertion against the POPULATED fixture proves the probe query
 * genuinely exercises the translation-variant path — without it this suite
 * could pass vacuously on a query the table never influenced.
 *
 * This suite builds its own throwaway databases and changes no shipped
 * behavior, weights, or ordering: nothing here touches engine code.
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { DatabaseSync } from 'node:sqlite';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';

import { createEngine, type ScriptureEngine } from '@jestek-dev/scripture-engine';
import { ConceptRepository } from '../../engine/src/corpus/repository.js';
import { buildFixtureDatabase } from '../../pipeline/src/buildFixtureDb.js';

import { openCorpus } from '../src/nodeSqlitePort.js';

/**
 * Earns a translation_variant reason on the populated fixture corpus
 * (Jeremiah 29:11 — "plans to prosper you" is NIV wording; the shipped WEB
 * text says "thoughts of peace"). Verified by the control test below, so if
 * the fixture ever loses this property the suite fails loudly instead of
 * passing vacuously.
 */
const VARIANT_QUERY = 'plans to prosper you';

let directory: string;
/** Populated fixture — the control. */
let populated: ScriptureEngine;
/** Same build, then `DELETE FROM verse_translation_tokens` — the J48 no-go shape. */
let emptied: ScriptureEngine;
let emptiedRepository: ConceptRepository;

async function discover(engine: ScriptureEngine, query: string) {
  const result = await engine.research(query);
  if (result.kind !== 'discovery') throw new Error(`expected discovery, got ${result.kind}`);
  return result.results;
}

function variantReasons(results: Awaited<ReturnType<typeof discover>>) {
  return results.flatMap((result) =>
    result.reasons.filter((reason) => reason.family === 'translation_variant'),
  );
}

beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), 'scripture-empty-variant-'));

  const populatedBuild = buildFixtureDatabase(join(directory, `populated-${process.pid}.db`));
  populated = await createEngine(openCorpus(populatedBuild.path));

  const emptiedBuild = buildFixtureDatabase(join(directory, `emptied-${process.pid}.db`));
  // The no-go re-mint shape exactly: the table stays in the schema, its rows
  // are gone. Emptying rather than dropping is the point — a dropped table is
  // the already-supported "layer absent" case, an empty one is the new claim.
  const database = new DatabaseSync(emptiedBuild.path);
  try {
    database.exec('DELETE FROM verse_translation_tokens');
  } finally {
    database.close();
  }
  const port = openCorpus(emptiedBuild.path);
  emptiedRepository = new ConceptRepository(port);
  emptied = await createEngine(port);
});

afterAll(async () => {
  await populated?.close();
  await emptied?.close();
  rmSync(directory, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
});

describe('control: the probe query exercises the translation-variant path', () => {
  it('earns a translation_variant reason on the populated fixture', async () => {
    const results = await discover(populated, VARIANT_QUERY);
    const variants = variantReasons(results);
    expect(variants.length).toBeGreaterThan(0);
    // The canonical cross-translation case: NIV wording finds the WEB verse.
    const jeremiah = results.find((result) => result.reference === 'Jeremiah 29:11');
    expect(jeremiah).toBeDefined();
    expect(jeremiah!.reasons.some((reason) => reason.family === 'translation_variant')).toBe(true);
  });
});

describe('J48 no-go shape: verse_translation_tokens present but empty', () => {
  it('opens through createEngine — schema admission does not depend on row count', () => {
    // beforeAll already succeeded, so createEngine accepted the artifact; this
    // pins the claim as an assertion rather than an implicit fixture property.
    expect(emptied).toBeDefined();
  });

  it('still reports the table as present, so the variant step runs against it', async () => {
    // hasTranslationTokens() is table-presence, not row-presence. TRUE here
    // means discovery does NOT short-circuit: the empty table itself is
    // queried, which is exactly the tolerance being claimed.
    expect(await emptiedRepository.hasTranslationTokens()).toBe(true);
  });

  it('degrades the repository primitives to empty results, not errors', async () => {
    const tokens = ['plan', 'prosper', 'hope'];
    expect(await emptiedRepository.searchTranslationTokens(tokens)).toEqual([]);
    expect((await emptiedRepository.translationTokenDocumentCounts(tokens)).size).toBe(0);
  });

  it('answers the variant query with results and zero translation_variant reasons', async () => {
    const results = await discover(emptied, VARIANT_QUERY);
    // The query still gets an answer from the surviving honest signals…
    expect(results.length).toBeGreaterThan(0);
    // …and no reason anywhere claims cross-translation evidence that the
    // artifact does not carry. Explanations are part of the contract.
    expect(variantReasons(results)).toEqual([]);
  });

  it('is deterministic: repeated identical queries return identical ordering and scores', async () => {
    const first = await discover(emptied, VARIANT_QUERY);
    const second = await discover(emptied, VARIANT_QUERY);
    expect(second.map((result) => [result.targetId, result.score])).toEqual(
      first.map((result) => [result.targetId, result.score]),
    );
  });

  it('leaves the other intents untouched', async () => {
    const reference = await emptied.research('Ps 46');
    expect(reference.kind).toBe('reference');
    if (reference.kind === 'reference') {
      expect(reference.passage.verses[0]!.text).toContain('refuge');
    }

    const phrase = await discover(emptied, 'a very present help in trouble');
    expect(phrase[0]!.reference).toBe('Psalms 46:1');
    expect(phrase[0]!.reasons.some((reason) => reason.family === 'exact_phrase')).toBe(true);

    const tokensResults = await discover(emptied, 'hearing and doing');
    const references = tokensResults.map((result) => result.reference);
    expect(references.some((ref) => ref.startsWith('James 1:'))).toBe(true);
    expect(references.some((ref) => ref.startsWith('Matthew 7:'))).toBe(true);
  });
});
