/**
 * The deterministic query-universe compiler (MS-2).
 *
 * Pure function of committed inputs: grammars + concept packs + felt-need
 * frames + word lists + golden fixtures + SEED. Every slot decision draws
 * from its own counter-seeded stream (prng.ts), so the compiled universe is
 * STABLE UNDER EXTENSION — adding a grammar, concept, frame, or list row
 * never changes any existing line. Output is sorted by queryId,
 * fingerprinted, and committed; every line carries its expectation block at
 * generation time.
 */
import { sha256Hex } from '../canonical.js';
import { decisionStream } from '../prng.js';
import type { GrammarSpec } from './grammar.js';
import type { Expectation, Register, UniverseLine } from './types.js';

/** One ontology concept, reduced to what expansion needs. */
export interface ConceptCell {
  readonly id: string;
  readonly label: string;
  readonly lexicon: readonly string[];
  /** Curated anchor references (already resolved labels, e.g. "Hebrews 11:6"). */
  readonly anchors: readonly string[];
}

/** One felt-need frame: pastoral judgment AS DATA (reviewed via J65, never ships). */
export interface FeltNeedFrame {
  readonly topic: string;
  readonly expectedConcepts: readonly string[];
  readonly crisisAdjacent?: boolean;
}

/** One row of a committed word list (glossary, adversarial slogans, …). */
export interface ListRow {
  readonly text: string;
  /** Expectation: a concept whose anchors should surface… */
  readonly conceptId?: string;
  /** …or none (e.g. glossary residue = the measured-gap feed). */
  readonly crisisAdjacent?: boolean;
  /** Adversarial: refs that must NOT lead (checked against MS-7's watchlist). */
  readonly mustNotLead?: readonly string[];
}

/** One golden fixture, reduced: its queries are curated lines verbatim. */
export interface GoldenCell {
  readonly id: string;
  readonly queries: readonly string[];
  readonly conceptId?: string;
  readonly anchors: readonly string[];
  readonly alsoAcceptable?: readonly string[];
}

export interface CompileInput {
  readonly seed: string;
  readonly universeVersion: string;
  readonly grammars: readonly GrammarSpec[];
  readonly concepts: readonly ConceptCell[];
  readonly frames: readonly FeltNeedFrame[];
  /** Word lists keyed by listRef. */
  readonly lists: Readonly<Record<string, readonly ListRow[]>>;
  readonly golden: readonly GoldenCell[];
  /** THE tokenizer, injected by import site (one tokenizer, covenant #4). */
  readonly tokenize: (text: string) => readonly string[];
}

export interface CompiledUniverse {
  readonly lines: readonly UniverseLine[];
  /** The exact committed JSONL body. */
  readonly body: string;
  /** sha256 of body — changes iff content changes. */
  readonly fingerprint: string;
  /** Line counts per generator, for the manifest. */
  readonly countsByGenerator: Readonly<Record<string, number>>;
}

interface Cell {
  readonly cellId: string;
  readonly label: string;
  readonly lexicon: readonly string[];
  readonly expectation: Expectation;
  readonly crisisAdjacent: boolean;
  readonly mustNotLead?: readonly string[];
}

export class CompileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompileError';
  }
}

function conceptById(concepts: readonly ConceptCell[]): Map<string, ConceptCell> {
  return new Map(concepts.map((concept) => [concept.id, concept]));
}

/** Fail-closed: every frame's expectedConcepts must name live concept ids. */
export function validateFeltNeedFrames(
  frames: readonly FeltNeedFrame[],
  concepts: readonly ConceptCell[],
): void {
  const known = conceptById(concepts);
  for (const frame of frames) {
    if (frame.expectedConcepts.length === 0) {
      throw new CompileError(`felt-need frame "${frame.topic}" names no expected concepts`);
    }
    for (const id of frame.expectedConcepts) {
      if (!known.has(id)) {
        throw new CompileError(
          `felt-need frame "${frame.topic}" names unknown concept "${id}" — the map is validated against concept ids at compile time, fail-closed`,
        );
      }
    }
  }
}

function conceptExpectation(concept: ConceptCell): Expectation {
  return { kind: 'concept-anchors', conceptId: concept.id, anchors: concept.anchors };
}

function frameExpectation(frame: FeltNeedFrame, known: Map<string, ConceptCell>): Expectation {
  const primary = known.get(frame.expectedConcepts[0]!)!;
  const anchors = frame.expectedConcepts.flatMap((id) => known.get(id)!.anchors);
  const rest = frame.expectedConcepts.slice(1);
  return {
    kind: 'concept-anchors',
    conceptId: primary.id,
    anchors: [...new Set(anchors)],
    ...(rest.length > 0 ? { alsoAcceptable: rest } : {}),
  };
}

function cellsFor(grammar: GrammarSpec, input: CompileInput): Cell[] {
  const known = conceptById(input.concepts);
  switch (grammar.source) {
    case 'concepts':
      return [...input.concepts]
        .sort((a, b) => (a.id < b.id ? -1 : 1))
        .map((concept) => ({
          cellId: concept.id,
          label: concept.label.toLowerCase(),
          lexicon: concept.lexicon,
          expectation: conceptExpectation(concept),
          crisisAdjacent: grammar.crisisAdjacent === true,
        }));
    case 'felt-need-map': {
      validateFeltNeedFrames(input.frames, input.concepts);
      return [...input.frames]
        .sort((a, b) => (a.topic < b.topic ? -1 : 1))
        .map((frame) => ({
          cellId: frame.topic,
          label: frame.topic,
          lexicon: [frame.topic],
          expectation: frameExpectation(frame, known),
          crisisAdjacent: frame.crisisAdjacent === true || grammar.crisisAdjacent === true,
        }));
    }
    case 'lexicon-tokens': {
      // Every lexicon token, derived by THE tokenizer — the same collapse
      // set the runtime resolves, so bare-word probes hit real vocabulary.
      const owners = new Map<string, string[]>();
      for (const concept of [...input.concepts].sort((a, b) => (a.id < b.id ? -1 : 1))) {
        for (const entry of concept.lexicon) {
          for (const token of input.tokenize(entry)) {
            const list = owners.get(token) ?? [];
            if (!list.includes(concept.id)) list.push(concept.id);
            owners.set(token, list);
          }
        }
      }
      return [...owners.entries()]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([token, conceptIds]) => {
          const primary = known.get(conceptIds[0]!)!;
          const rest = conceptIds.slice(1);
          return {
            cellId: token,
            label: token,
            lexicon: [token],
            expectation: {
              kind: 'concept-anchors',
              conceptId: primary.id,
              anchors: primary.anchors,
              ...(rest.length > 0 ? { alsoAcceptable: rest } : {}),
            } as Expectation,
            crisisAdjacent: grammar.crisisAdjacent === true,
          };
        });
    }
    case 'list': {
      const rows = input.lists[grammar.listRef!];
      if (rows === undefined) {
        throw new CompileError(`grammar ${grammar.id}: listRef "${grammar.listRef}" not provided`);
      }
      return rows.map((row) => {
        let expectation: Expectation = { kind: 'none' };
        if (row.conceptId !== undefined) {
          const concept = known.get(row.conceptId);
          if (concept === undefined) {
            throw new CompileError(
              `list ${grammar.listRef} row "${row.text}" names unknown concept "${row.conceptId}"`,
            );
          }
          expectation = conceptExpectation(concept);
        }
        return {
          cellId: row.text,
          label: row.text,
          lexicon: [row.text],
          expectation,
          crisisAdjacent: row.crisisAdjacent === true || grammar.crisisAdjacent === true,
          ...(row.mustNotLead !== undefined ? { mustNotLead: row.mustNotLead } : {}),
        };
      });
    }
  }
}

const PLACEHOLDER = /\{([a-z][a-z0-9-]*)\}/g;

function expandTemplate(
  templateText: string,
  cell: Cell,
  seed: string,
  grammarId: string,
  templateIndex: number,
  counter: number,
): string {
  return templateText.replace(PLACEHOLDER, (_match, slot: string) => {
    if (slot === 'label') return cell.label;
    if (slot === 'lexicon') {
      const stream = decisionStream(seed, grammarId, cell.cellId, `t${templateIndex}`, slot, counter);
      return stream.pick(cell.lexicon);
    }
    throw new CompileError(
      `grammar ${grammarId} template ${templateIndex}: unknown slot {${slot}} (typed slots are {label} and {lexicon})`,
    );
  });
}

function queryIdFor(generator: string, query: string): string {
  return `${generator}:${sha256Hex(query).slice(0, 16)}`;
}

export function compileUniverse(input: CompileInput): CompiledUniverse {
  const lines: UniverseLine[] = [];
  const countsByGenerator: Record<string, number> = {};

  for (const grammar of [...input.grammars].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    const produced = new Map<string, UniverseLine>();
    for (const cell of cellsFor(grammar, input)) {
      for (const [templateIndex, template] of grammar.templates.entries()) {
        for (let counter = 0; counter < grammar.perTemplateCap; counter += 1) {
          const query = expandTemplate(
            template.text,
            cell,
            input.seed,
            grammar.id,
            templateIndex,
            counter,
          );
          const queryId = queryIdFor(grammar.id, query);
          if (produced.has(queryId)) continue; // slotless templates collapse
          produced.set(queryId, {
            queryId,
            query,
            generator: grammar.id,
            register: template.register,
            category: grammar.category,
            expectation: cell.expectation,
            ...(cell.crisisAdjacent ? { crisisAdjacent: true as const } : {}),
            ...(cell.mustNotLead !== undefined ? { mustNotLead: cell.mustNotLead } : {}),
            confidence: 'generated',
            universeVersion: input.universeVersion,
          } as UniverseLine);
        }
      }
    }
    countsByGenerator[grammar.id] = produced.size;
    lines.push(...produced.values());
  }

  // Golden fixtures: curated lines verbatim, a built-in generator.
  const goldenGenerator = 'golden-verbatim';
  const goldenProduced = new Map<string, UniverseLine>();
  for (const fixture of [...input.golden].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    for (const query of fixture.queries) {
      const queryId = queryIdFor(goldenGenerator, query);
      if (goldenProduced.has(queryId)) continue;
      const expectation: Expectation =
        fixture.anchors.length > 0
          ? {
              kind: 'concept-anchors',
              conceptId: fixture.conceptId ?? fixture.id,
              anchors: fixture.anchors,
              ...(fixture.alsoAcceptable !== undefined && fixture.alsoAcceptable.length > 0
                ? { alsoAcceptable: fixture.alsoAcceptable }
                : {}),
            }
          : { kind: 'none' };
      goldenProduced.set(queryId, {
        queryId,
        query,
        generator: goldenGenerator,
        category: 'golden',
        expectation,
        confidence: 'generated',
        universeVersion: input.universeVersion,
      });
    }
  }
  if (goldenProduced.size > 0) {
    countsByGenerator[goldenGenerator] = goldenProduced.size;
    lines.push(...goldenProduced.values());
  }

  lines.sort((a, b) => (a.queryId < b.queryId ? -1 : a.queryId > b.queryId ? 1 : 0));
  const body = lines.length > 0 ? lines.map((line) => JSON.stringify(line)).join('\n') + '\n' : '';
  return { lines, body, fingerprint: sha256Hex(body), countsByGenerator };
}
