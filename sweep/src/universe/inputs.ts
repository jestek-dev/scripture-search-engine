/**
 * Disk loaders for the universe compiler's committed inputs (MS-2):
 * ontology concept packs, the felt-need map, word lists, and golden
 * fixtures. All fail closed — a malformed input stops the compile rather
 * than silently thinning the universe.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { parse as parseYaml } from 'yaml';

import type { ConceptCell, FeltNeedFrame, GoldenCell, ListRow } from './compile.js';

export class InputSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InputSchemaError';
  }
}

/** Read ontology/concepts/*.yaml down to what expansion needs. */
export function loadConceptCells(ontologyConceptsDir: string): ConceptCell[] {
  const files = readdirSync(ontologyConceptsDir)
    .filter((name) => name.endsWith('.yaml'))
    .sort();
  return files.map((name) => {
    const path = join(ontologyConceptsDir, name);
    const parsed = parseYaml(readFileSync(path, 'utf8')) as Record<string, unknown>;
    if (typeof parsed.id !== 'string' || typeof parsed.label !== 'string') {
      throw new InputSchemaError(`${path}: concept pack missing id/label`);
    }
    const lexicon = Array.isArray(parsed.lexicon)
      ? parsed.lexicon.filter((entry): entry is string => typeof entry === 'string')
      : [];
    const anchors = Array.isArray(parsed.anchors)
      ? parsed.anchors
          .map((anchor) =>
            anchor !== null && typeof anchor === 'object'
              ? (anchor as Record<string, unknown>).ref
              : undefined,
          )
          .filter((ref): ref is string => typeof ref === 'string')
      : [];
    return { id: parsed.id, label: parsed.label, lexicon, anchors };
  });
}

/** Read the felt-need map (pastoral judgment as data; J65 skims it). */
export function loadFeltNeedMap(path: string): FeltNeedFrame[] {
  const parsed = parseYaml(readFileSync(path, 'utf8')) as Record<string, unknown>;
  if (!Array.isArray(parsed.frames)) throw new InputSchemaError(`${path}: missing frames[]`);
  return parsed.frames.map((frame, index) => {
    if (frame === null || typeof frame !== 'object') {
      throw new InputSchemaError(`${path}: frame ${index} not a mapping`);
    }
    const f = frame as Record<string, unknown>;
    if (typeof f.topic !== 'string' || f.topic.length === 0) {
      throw new InputSchemaError(`${path}: frame ${index} missing topic`);
    }
    if (
      !Array.isArray(f.expectedConcepts) ||
      f.expectedConcepts.length === 0 ||
      f.expectedConcepts.some((id) => typeof id !== 'string')
    ) {
      throw new InputSchemaError(`${path}: frame "${f.topic}" missing expectedConcepts[]`);
    }
    return {
      topic: f.topic,
      expectedConcepts: f.expectedConcepts as string[],
      ...(f.crisisAdjacent === true ? { crisisAdjacent: true } : {}),
    };
  });
}

/** Read one committed word list (rows of {text, conceptId?, mustNotLead?, crisisAdjacent?}). */
export function loadWordList(path: string): ListRow[] {
  const parsed = parseYaml(readFileSync(path, 'utf8')) as Record<string, unknown>;
  if (!Array.isArray(parsed.rows)) throw new InputSchemaError(`${path}: missing rows[]`);
  return parsed.rows.map((row, index) => {
    if (row === null || typeof row !== 'object') {
      throw new InputSchemaError(`${path}: row ${index} not a mapping`);
    }
    const r = row as Record<string, unknown>;
    if (typeof r.text !== 'string' || r.text.length === 0) {
      throw new InputSchemaError(`${path}: row ${index} missing text`);
    }
    if (r.mustNotLead !== undefined && !Array.isArray(r.mustNotLead)) {
      throw new InputSchemaError(`${path}: row "${r.text}" mustNotLead must be a list`);
    }
    return {
      text: r.text,
      ...(typeof r.conceptId === 'string' ? { conceptId: r.conceptId } : {}),
      ...(r.crisisAdjacent === true ? { crisisAdjacent: true } : {}),
      ...(Array.isArray(r.mustNotLead)
        ? { mustNotLead: (r.mustNotLead as unknown[]).filter((x): x is string => typeof x === 'string') }
        : {}),
    };
  });
}

/** Read every word list in a directory, keyed by file basename (no .yaml). */
export function loadWordLists(directory: string, exclude: readonly string[] = []): Record<string, ListRow[]> {
  const lists: Record<string, ListRow[]> = {};
  for (const name of readdirSync(directory)
    .filter((file) => file.endsWith('.yaml'))
    .filter((file) => !exclude.includes(file))
    .sort()) {
    lists[name.replace(/\.yaml$/, '')] = loadWordList(join(directory, name));
  }
  return lists;
}

/** Read eval/golden/*.json down to verbatim queries + expected anchors. */
export function loadGoldenCells(goldenDir: string): GoldenCell[] {
  const files = readdirSync(goldenDir)
    .filter((name) => name.endsWith('.json'))
    .sort();
  return files.map((name) => {
    const path = join(goldenDir, name);
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    if (typeof parsed.id !== 'string' || typeof parsed.query !== 'string') {
      throw new InputSchemaError(`${path}: fixture missing id/query`);
    }
    const additional = Array.isArray(parsed.additionalQueries)
      ? parsed.additionalQueries.filter((q): q is string => typeof q === 'string')
      : [];
    const anchors = Array.isArray(parsed.expectedTop)
      ? parsed.expectedTop
          .map((entry) =>
            entry !== null && typeof entry === 'object'
              ? (entry as Record<string, unknown>).reference
              : undefined,
          )
          .filter((ref): ref is string => typeof ref === 'string')
      : [];
    const covers = Array.isArray(parsed.coversConcepts)
      ? parsed.coversConcepts.filter((c): c is string => typeof c === 'string')
      : [];
    const alsoAcceptable = Array.isArray(parsed.alsoAcceptable)
      ? parsed.alsoAcceptable.filter((r): r is string => typeof r === 'string')
      : [];
    return {
      id: parsed.id,
      queries: [parsed.query, ...additional],
      ...(covers.length > 0 ? { conceptId: covers[0] } : {}),
      anchors,
      ...(alsoAcceptable.length > 0 ? { alsoAcceptable } : {}),
    };
  });
}
