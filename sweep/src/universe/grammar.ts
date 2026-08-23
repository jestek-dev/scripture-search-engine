/**
 * Grammar files (MS-2): the committed, reviewable form of "what queries the
 * sweep asks". A grammar names its battery category, its register personas,
 * its expansion templates with typed slots, and a perTemplateCap — never an
 * ad-hoc list. Expansion is driven entirely by the counter-based PRNG, so
 * the compiled universe is re-derivable by anyone from the repo alone.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { parse as parseYaml } from 'yaml';

import { REGISTERS, type Register } from './types.js';

/** Where a grammar's expansion cells come from. */
export type GrammarSource =
  /** One cell per ontology concept (label + lexicon + anchors). */
  | 'concepts'
  /** One cell per felt-need frame (felt-need-map.yaml). */
  | 'felt-need-map'
  /** One cell per tokenizer-derived lexicon token (bare words). */
  | 'lexicon-tokens'
  /** One cell per row of a committed word list named by listRef. */
  | 'list';

export interface GrammarTemplate {
  readonly text: string;
  readonly register: Register;
}

export interface GrammarSpec {
  readonly id: string;
  readonly description?: string;
  /** Battery category the lines report under. */
  readonly category: string;
  readonly source: GrammarSource;
  /** For source 'list': which committed word list feeds the cells. */
  readonly listRef?: string;
  /** Max expansions per template per cell — raising it is a reviewed PR with a UNIVERSE-VERSION bump, never ad-hoc. */
  readonly perTemplateCap: number;
  readonly crisisAdjacent?: boolean;
  readonly templates: readonly GrammarTemplate[];
}

export class GrammarSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GrammarSchemaError';
  }
}

const SOURCES = new Set<GrammarSource>(['concepts', 'felt-need-map', 'lexicon-tokens', 'list']);

export function validateGrammar(value: unknown, origin: string): GrammarSpec {
  const fail = (why: string): never => {
    throw new GrammarSchemaError(`${origin}: ${why}`);
  };
  if (value === null || typeof value !== 'object') fail('grammar is not a mapping');
  const grammar = value as Record<string, unknown>;
  if (typeof grammar.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(grammar.id)) {
    fail('id must be a kebab-case string');
  }
  if (typeof grammar.category !== 'string' || grammar.category.length === 0) fail('missing category');
  if (typeof grammar.source !== 'string' || !SOURCES.has(grammar.source as GrammarSource)) {
    fail(`unknown source ${String(grammar.source)}`);
  }
  if (grammar.source === 'list' && (typeof grammar.listRef !== 'string' || grammar.listRef.length === 0)) {
    fail("source 'list' requires listRef");
  }
  if (!Number.isInteger(grammar.perTemplateCap) || (grammar.perTemplateCap as number) < 1) {
    fail('perTemplateCap must be a positive integer');
  }
  if (!Array.isArray(grammar.templates) || grammar.templates.length === 0) fail('missing templates');
  for (const [index, template] of (grammar.templates as unknown[]).entries()) {
    if (template === null || typeof template !== 'object') fail(`template ${index} not a mapping`);
    const t = template as Record<string, unknown>;
    if (typeof t.text !== 'string' || t.text.length === 0) fail(`template ${index} missing text`);
    if (!REGISTERS.includes(t.register as Register)) {
      fail(`template ${index} register must be one of ${REGISTERS.join(', ')}`);
    }
  }
  return grammar as unknown as GrammarSpec;
}

/** Load every committed grammar, sorted by id (compile order is data, not filesystem order). */
export function loadGrammars(directory: string): GrammarSpec[] {
  const files = readdirSync(directory)
    .filter((name) => name.endsWith('.yaml'))
    .sort();
  const grammars = files.map((name) =>
    validateGrammar(parseYaml(readFileSync(join(directory, name), 'utf8')), join(directory, name)),
  );
  const ids = new Set<string>();
  for (const grammar of grammars) {
    if (ids.has(grammar.id)) throw new GrammarSchemaError(`duplicate grammar id ${grammar.id}`);
    ids.add(grammar.id);
  }
  return grammars.sort((a, b) => (a.id < b.id ? -1 : 1));
}
