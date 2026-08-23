/**
 * Wire Ring-2 derivation to the repo's committed inputs (MS-4). Ring 2 is
 * derived at run time from committed inputs — never committed itself — and
 * is a fully pinned function of them: two derivations anywhere are
 * byte-identical.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parse as parseYaml } from 'yaml';

import { REPO_ROOT, UNIVERSE_PATH } from '../universe/compileFromRepo.js';
import { UNIVERSE_SEED } from '../universe/version.js';
import { parseUniverse, type UniverseLine } from '../universe/types.js';
import { loadConceptCells } from '../universe/inputs.js';
import { deriveTypoRing, type PhoneticRule } from './perturb.js';
import {
  generateReferenceVariants,
  type BookNameVariant,
  type ReferenceSpecimen,
} from './referenceVariants.js';

export const PERTURB_DIR = join(REPO_ROOT, 'sweep', 'perturb');
export const SWEEP_BUDGETS_PATH = join(REPO_ROOT, 'sweep', 'config', 'sweep-budgets.json');

export function loadPhoneticRules(path = join(PERTURB_DIR, 'misspelling-rules.yaml')): PhoneticRule[] {
  const parsed = parseYaml(readFileSync(path, 'utf8')) as { rules?: unknown };
  if (!Array.isArray(parsed.rules)) throw new Error(`${path}: missing rules[]`);
  return parsed.rules.map((rule, index) => {
    const r = rule as Record<string, unknown>;
    if (typeof r.from !== 'string' || typeof r.to !== 'string') {
      throw new Error(`${path}: rule ${index} needs from/to strings`);
    }
    return { from: r.from, to: r.to };
  });
}

export function loadBookNameVariants(
  path = join(PERTURB_DIR, 'book-name-variants.yaml'),
): BookNameVariant[] {
  const parsed = parseYaml(readFileSync(path, 'utf8')) as { variants?: unknown };
  if (!Array.isArray(parsed.variants)) throw new Error(`${path}: missing variants[]`);
  return parsed.variants.map((row) => row as BookNameVariant);
}

export function loadReferenceSpecimens(
  path = join(PERTURB_DIR, 'reference-specimens.yaml'),
): ReferenceSpecimen[] {
  const parsed = parseYaml(readFileSync(path, 'utf8')) as { rows?: unknown };
  if (!Array.isArray(parsed.rows)) throw new Error(`${path}: missing rows[]`);
  return parsed.rows.map((row) => row as ReferenceSpecimen);
}

/** Battery misspelling rows, verbatim (ms1–ms6; reference-shaped ms4 rides the specimen list). */
export function batteryMisspellingLines(): UniverseLine[] {
  const battery = JSON.parse(
    readFileSync(join(REPO_ROOT, 'eval', 'battery', 'queries.json'), 'utf8'),
  ) as { queries: { id: string; query: string; category: string; status: string }[] };
  const specimenTexts = new Set(loadReferenceSpecimens().map((row) => row.text));
  return battery.queries
    .filter((row) => row.category === 'misspelling' && !specimenTexts.has(row.query))
    .map((row) => ({
      queryId: `battery-misspelling:${row.id}`,
      query: row.query,
      generator: 'battery-misspelling',
      category: 'misspelling',
      expectation: {
        kind: 'correction-cited' as const,
        misspelled: row.query.split(' ').filter((token) => /^[a-z]{4,}$/i.test(token)),
      },
      confidence: 'generated' as const,
    }))
    .sort((a, b) => (a.queryId < b.queryId ? -1 : 1));
}

export interface RepoRing2Options {
  /** Perturbation multiplicities. Plan defaults 2/3 ride J43; callers pass
   *  them EXPLICITLY (config nulls refuse — see readPerturbK). */
  readonly kGrammar: number;
  readonly kParaphrase: number;
  /** Rows per book for the reference format matrix (~2,000 / 66 ≈ 30). */
  readonly perBook?: number;
}

/**
 * Read perturbK from sweep-budgets. Returns null when unsigned (J43) — the
 * caller must refuse with a not-applicable reason, never default silently.
 */
export function readPerturbK(): { grammar: number; paraphrase: number } | null {
  const parsed = JSON.parse(readFileSync(SWEEP_BUDGETS_PATH, 'utf8')) as {
    perturbK?: { grammar?: number | null; paraphrase?: number | null };
  };
  const grammar = parsed.perturbK?.grammar ?? null;
  const paraphrase = parsed.perturbK?.paraphrase ?? null;
  if (grammar === null || paraphrase === null) return null;
  return { grammar, paraphrase };
}

export function deriveRepoRing2(options: RepoRing2Options): {
  readonly lines: UniverseLine[];
  readonly counts: Record<string, number>;
} {
  const ring1 = parseUniverse(readFileSync(UNIVERSE_PATH, 'utf8'));
  const paraphrasePath = join(REPO_ROOT, 'sweep', 'universe', 'ring1-paraphrase.jsonl');
  const paraphrases = existsSync(paraphrasePath)
    ? parseUniverse(readFileSync(paraphrasePath, 'utf8'))
    : [];

  const typo = deriveTypoRing([...ring1, ...paraphrases], {
    seed: UNIVERSE_SEED,
    kGrammar: options.kGrammar,
    kParaphrase: options.kParaphrase,
    rules: loadPhoneticRules(),
  });
  const concepts = loadConceptCells(join(REPO_ROOT, 'ontology', 'concepts'));
  const anchors = [...new Set(concepts.flatMap((concept) => concept.anchors))].sort();
  const references = generateReferenceVariants({
    seed: UNIVERSE_SEED,
    anchors,
    bookNameVariants: loadBookNameVariants(),
    specimens: loadReferenceSpecimens(),
    perBook: options.perBook ?? 30,
  });
  const battery = batteryMisspellingLines();

  const lines = [...typo, ...references, ...battery].sort((a, b) =>
    a.queryId < b.queryId ? -1 : a.queryId > b.queryId ? 1 : 0,
  );
  const counts: Record<string, number> = {};
  for (const line of lines) counts[line.generator] = (counts[line.generator] ?? 0) + 1;
  return { lines, counts };
}
