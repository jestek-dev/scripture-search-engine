/**
 * MS-3 verification: hand-checked expansions per grammar committed as
 * byte-equal fixtures; coverage assertions over the committed universe
 * (every concept reachable, every curated anchor reachable, all three
 * registers present); felt-need map validated fail-closed; and the
 * regenerate-and-compare freshness check riding the test suite.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vitest';

import { sha256Hex } from '../src/canonical.js';
import { compileRepoUniverse, UNIVERSE_PATH, REPO_ROOT } from '../src/universe/compileFromRepo.js';
import { loadConceptCells, loadFeltNeedMap } from '../src/universe/inputs.js';
import { parseUniverse, REGISTERS, type UniverseLine } from '../src/universe/types.js';

const HERE = dirname(fileURLToPath(import.meta.url));

let committed: UniverseLine[];
let committedBody: string;

beforeAll(() => {
  committedBody = readFileSync(UNIVERSE_PATH, 'utf8');
  committed = parseUniverse(committedBody); // throws on any schema violation
});

describe('committed grammar universe (MS-3)', () => {
  it('is fresh: recompiling from committed inputs reproduces it byte-identically', () => {
    const compiled = compileRepoUniverse();
    expect(sha256Hex(committedBody)).toBe(compiled.fingerprint);
    expect(compiled.body).toBe(committedBody);
  });

  it('matches the hand-checked expansion fixtures byte-for-byte', () => {
    const fixture = JSON.parse(
      readFileSync(join(HERE, 'fixtures', 'hand-checked-expansions.json'), 'utf8'),
    ) as Record<
      string,
      {
        queryId: string;
        query: string;
        register?: string;
        expectationKind: string;
        conceptId?: string;
      }[]
    >;
    const generators = Object.keys(fixture);
    expect(generators.length).toBeGreaterThanOrEqual(9); // one per battery class + golden
    for (const generator of generators) {
      const actual = committed.filter((line) => line.generator === generator).slice(0, 10);
      const expected = fixture[generator]!;
      expect(actual.length, `generator ${generator} produced too few lines`).toBe(expected.length);
      for (const [index, row] of expected.entries()) {
        const line = actual[index]!;
        expect(line.queryId).toBe(row.queryId);
        expect(line.query).toBe(row.query);
        expect(line.register ?? undefined).toBe(row.register ?? undefined);
        expect(line.expectation.kind).toBe(row.expectationKind);
        if (row.conceptId !== undefined) {
          expect(
            line.expectation.kind === 'concept-anchors' ? line.expectation.conceptId : undefined,
          ).toBe(row.conceptId);
        }
      }
    }
  });

  it('covers 100% of ontology concepts, each in at least two registers', () => {
    const concepts = loadConceptCells(join(REPO_ROOT, 'ontology', 'concepts'));
    const registersByConcept = new Map<string, Set<string>>();
    for (const line of committed) {
      if (line.expectation.kind !== 'concept-anchors' || line.register === undefined) continue;
      const ids = [
        line.expectation.conceptId,
        ...(line.expectation.alsoAcceptable ?? []),
      ];
      for (const id of ids) {
        const set = registersByConcept.get(id) ?? new Set<string>();
        set.add(line.register);
        registersByConcept.set(id, set);
      }
    }
    const uncovered = concepts.filter((concept) => !registersByConcept.has(concept.id));
    expect(uncovered.map((c) => c.id), 'concepts with no universe line').toEqual([]);
    const singleRegister = concepts.filter(
      (concept) => (registersByConcept.get(concept.id)?.size ?? 0) < 2,
    );
    expect(singleRegister.map((c) => c.id), 'concepts reached by fewer than 2 registers').toEqual([]);
  });

  it('reaches 100% of curated anchors through expectation blocks', () => {
    const concepts = loadConceptCells(join(REPO_ROOT, 'ontology', 'concepts'));
    const reachable = new Set<string>();
    for (const line of committed) {
      if (line.expectation.kind !== 'concept-anchors') continue;
      for (const anchor of line.expectation.anchors) reachable.add(anchor);
    }
    const missing: string[] = [];
    for (const concept of concepts) {
      for (const anchor of concept.anchors) {
        if (!reachable.has(anchor)) missing.push(`${concept.id} → ${anchor}`);
      }
    }
    expect(missing, 'curated anchors unreachable from the universe').toEqual([]);
  });

  it('exercises all three registers', () => {
    const seen = new Set(committed.map((line) => line.register).filter(Boolean));
    for (const register of REGISTERS) expect(seen.has(register), register).toBe(true);
  });

  it('includes crisis-register frames, tagged for the tiered human policy', () => {
    const crisis = committed.filter((line) => line.crisisAdjacent === true);
    expect(crisis.length).toBeGreaterThan(0);
    // Every crisis line still carries a real expectation — inclusion is the
    // point (harmful #1s cost most there), not exemption from grading.
    for (const line of crisis) expect(line.expectation.kind).toBeDefined();
  });

  it('theological-term residue (expectation none) exists — the measured-gap feed', () => {
    const residue = committed.filter(
      (line) => line.generator === 'theological-term' && line.expectation.kind === 'none',
    );
    expect(residue.length).toBeGreaterThan(0);
  });

  it('adversarial rows carry mustNotLead references where a watchlist sense applies', () => {
    const flagged = committed.filter(
      (line) => line.generator === 'adversarial' && (line.mustNotLead?.length ?? 0) > 0,
    );
    expect(flagged.length).toBeGreaterThan(0);
  });
});

describe('felt-need map (J65 data)', () => {
  it('loads, validates, and marks crisis frames', () => {
    const frames = loadFeltNeedMap(
      join(REPO_ROOT, 'sweep', 'grammars', 'words', 'felt-need-map.yaml'),
    );
    expect(frames.length).toBeGreaterThanOrEqual(50);
    expect(frames.some((frame) => frame.crisisAdjacent === true)).toBe(true);
    for (const frame of frames) expect(frame.expectedConcepts.length).toBeGreaterThan(0);
  });
});
