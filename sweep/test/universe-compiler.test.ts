/**
 * MS-2 verification, per the plan's own list: byte-identical recompiles;
 * fingerprint iff content; stability-under-extension property test;
 * expectation schema validation; felt-need map fail-closed against concept
 * ids — plus frozen PRNG golden values so an accidental algorithm change can
 * never repartition history silently.
 */
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import { decisionStream } from '../src/prng.js';
import {
  compileUniverse,
  CompileError,
  type CompileInput,
  type ConceptCell,
} from '../src/universe/compile.js';
import { validateGrammar, GrammarSchemaError, type GrammarSpec } from '../src/universe/grammar.js';
import { parseUniverse, validateUniverseLine } from '../src/universe/types.js';

const CONCEPTS: ConceptCell[] = [
  {
    id: 'faith',
    label: 'Faith',
    lexicon: ['faith', 'what is faith', 'grow in faith'],
    anchors: ['Hebrews 11:6', 'Romans 10:17'],
  },
  {
    id: 'grief',
    label: 'Grief',
    lexicon: ['grief', 'mourning'],
    anchors: ['Psalms 34:18'],
  },
];

const GRAMMAR_A: GrammarSpec = {
  id: 'concept-register',
  category: 'felt-need',
  source: 'concepts',
  perTemplateCap: 2,
  templates: [
    { text: 'what does the bible say about {lexicon}', register: 'church-member' },
    { text: 'sermon text on {label}', register: 'pastor' },
  ],
};

const GRAMMAR_B: GrammarSpec = {
  id: 'worship-planning',
  category: 'worship-leader',
  source: 'concepts',
  perTemplateCap: 1,
  templates: [{ text: 'songs about {label}', register: 'worship-leader' }],
};

function baseInput(overrides: Partial<CompileInput> = {}): CompileInput {
  return {
    seed: 'test-seed',
    universeVersion: '1.0.0-test',
    grammars: [GRAMMAR_A],
    concepts: CONCEPTS,
    frames: [],
    lists: {},
    golden: [],
    tokenize: (text) => text.toLowerCase().split(/\s+/).filter((t) => t.length > 2),
    ...overrides,
  };
}

describe('counter-based PRNG', () => {
  it('reproduces frozen golden values (algorithm pinned)', () => {
    const stream = decisionStream('scripture-sweep-universe-v1', 'g1', 'c1', 'slot', 0);
    expect(stream.next()).toBe(2182550400048279037n);
    expect(stream.next()).toBe(12336839124546526670n);
  });

  it('same decision site → same stream; different site → independent stream', () => {
    const a1 = decisionStream('s', 'g', 'c', 'slot', 0).next();
    const a2 = decisionStream('s', 'g', 'c', 'slot', 0).next();
    const b = decisionStream('s', 'g', 'c', 'slot', 1).next();
    expect(a1).toBe(a2);
    expect(a1).not.toBe(b);
  });

  it('pick and sample are float-free and in-range (property)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1, maxLength: 20 }),
        fc.nat({ max: 1000 }),
        (items, counter) => {
          const stream = decisionStream('s', 'prop', counter);
          const picked = stream.pick(items);
          expect(items).toContain(picked);
          const sampled = decisionStream('s', 'prop2', counter).sample(items, 3);
          expect(sampled.length).toBeLessThanOrEqual(3);
          for (const item of sampled) expect(items).toContain(item);
        },
      ),
    );
  });
});

describe('universe compiler', () => {
  it('recompiles byte-identically (fingerprint iff content)', () => {
    const first = compileUniverse(baseInput());
    const second = compileUniverse(baseInput());
    expect(second.body).toBe(first.body);
    expect(second.fingerprint).toBe(first.fingerprint);
    // Content change → fingerprint change.
    const changed = compileUniverse(
      baseInput({ grammars: [{ ...GRAMMAR_A, perTemplateCap: 3 }] }),
    );
    expect(changed.fingerprint).not.toBe(first.fingerprint);
  });

  it('is STABLE UNDER EXTENSION: adding a grammar never shifts existing lines', () => {
    const before = compileUniverse(baseInput());
    const after = compileUniverse(baseInput({ grammars: [GRAMMAR_A, GRAMMAR_B] }));
    const beforeById = new Map(before.lines.map((line) => [line.queryId, JSON.stringify(line)]));
    for (const [queryId, serialized] of beforeById) {
      const kept = after.lines.find((line) => line.queryId === queryId);
      expect(kept, `line ${queryId} vanished`).toBeDefined();
      expect(JSON.stringify(kept)).toBe(serialized);
    }
    expect(after.lines.length).toBeGreaterThan(before.lines.length);
  });

  it('is STABLE UNDER EXTENSION: adding a concept never shifts existing lines', () => {
    const before = compileUniverse(baseInput());
    const extended: ConceptCell = {
      id: 'hope',
      label: 'Hope',
      lexicon: ['hope', 'living hope'],
      anchors: ['1 Peter 1:3'],
    };
    const after = compileUniverse(baseInput({ concepts: [...CONCEPTS, extended] }));
    for (const line of before.lines) {
      const kept = after.lines.find((candidate) => candidate.queryId === line.queryId);
      expect(kept, `line ${line.queryId} vanished`).toBeDefined();
      expect(JSON.stringify(kept)).toBe(JSON.stringify(line));
    }
  });

  it('every compiled line is schema-valid, sorted, and carries an expectation', () => {
    const compiled = compileUniverse(
      baseInput({
        grammars: [GRAMMAR_A, GRAMMAR_B],
        golden: [
          {
            id: 'faith',
            queries: ['faith', 'what is faith'],
            conceptId: 'faith',
            anchors: ['Hebrews 11:6'],
          },
        ],
      }),
    );
    const parsed = parseUniverse(compiled.body); // throws on schema/sort violation
    expect(parsed.length).toBe(compiled.lines.length);
    for (const line of parsed) {
      expect(() => validateUniverseLine(line, 0)).not.toThrow();
      expect(line.expectation.kind).toBeDefined();
    }
    const conceptLine = parsed.find((line) => line.generator === 'concept-register');
    expect(conceptLine?.expectation.kind).toBe('concept-anchors');
    const goldenLine = parsed.find((line) => line.generator === 'golden-verbatim');
    expect(goldenLine).toBeDefined();
    expect(goldenLine?.expectation).toEqual({
      kind: 'concept-anchors',
      conceptId: 'faith',
      anchors: ['Hebrews 11:6'],
    });
  });

  it('felt-need frames are validated against concept ids at compile time, fail-closed', () => {
    const grammar: GrammarSpec = {
      id: 'felt-need',
      category: 'felt-need',
      source: 'felt-need-map',
      perTemplateCap: 1,
      templates: [{ text: '{label}', register: 'church-member' }],
    };
    const good = compileUniverse(
      baseInput({
        grammars: [grammar],
        frames: [{ topic: 'i am grieving', expectedConcepts: ['grief'] }],
      }),
    );
    expect(good.lines.length).toBe(1);
    expect(good.lines[0]!.expectation).toEqual({
      kind: 'concept-anchors',
      conceptId: 'grief',
      anchors: ['Psalms 34:18'],
    });
    expect(() =>
      compileUniverse(
        baseInput({
          grammars: [grammar],
          frames: [{ topic: 'bad frame', expectedConcepts: ['no-such-concept'] }],
        }),
      ),
    ).toThrow(CompileError);
  });

  it('rejects an unknown slot (typed slots only)', () => {
    const grammar: GrammarSpec = {
      id: 'bad-slot',
      category: 'x',
      source: 'concepts',
      perTemplateCap: 1,
      templates: [{ text: 'verse about {mystery}', register: 'pastor' }],
    };
    expect(() => compileUniverse(baseInput({ grammars: [grammar] }))).toThrow(/unknown slot/);
  });

  it('lexicon-token cells ride THE injected tokenizer and record collapse owners', () => {
    const grammar: GrammarSpec = {
      id: 'bare-word',
      category: 'single-word',
      source: 'lexicon-tokens',
      perTemplateCap: 1,
      templates: [{ text: '{label}', register: 'church-member' }],
    };
    const compiled = compileUniverse(baseInput({ grammars: [grammar] }));
    const queries = compiled.lines.map((line) => line.query).sort();
    expect(queries).toContain('faith');
    expect(queries).toContain('grief');
    // "faith" appears in several lexicon entries of one concept — one cell.
    expect(queries.filter((q) => q === 'faith').length).toBe(1);
  });

  it('crisis-adjacent list rows are tagged and carry mustNotLead through', () => {
    const grammar: GrammarSpec = {
      id: 'adversarial',
      category: 'adversarial',
      source: 'list',
      listRef: 'slogans',
      perTemplateCap: 1,
      templates: [{ text: '{label}', register: 'church-member' }],
    };
    const compiled = compileUniverse(
      baseInput({
        grammars: [grammar],
        lists: {
          slogans: [
            { text: 'god wants me rich', mustNotLead: ['Malachi 1:9'], crisisAdjacent: true },
          ],
        },
      }),
    );
    expect(compiled.lines.length).toBe(1);
    expect(compiled.lines[0]!.crisisAdjacent).toBe(true);
    expect(compiled.lines[0]!.mustNotLead).toEqual(['Malachi 1:9']);
    expect(compiled.lines[0]!.expectation.kind).toBe('none');
  });
});

describe('grammar schema', () => {
  it('rejects a grammar without templates or with a bad register', () => {
    expect(() =>
      validateGrammar({ id: 'x', category: 'c', source: 'concepts', perTemplateCap: 1 }, 't'),
    ).toThrow(GrammarSchemaError);
    expect(() =>
      validateGrammar(
        {
          id: 'x',
          category: 'c',
          source: 'concepts',
          perTemplateCap: 1,
          templates: [{ text: 'q', register: 'astronaut' }],
        },
        't',
      ),
    ).toThrow(/register/);
  });
});
