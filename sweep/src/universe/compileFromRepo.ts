/**
 * Wire the compiler to the repo's committed inputs (MS-2): grammars under
 * sweep/grammars/, word lists under sweep/grammars/words/, concepts under
 * ontology/concepts/, golden fixtures under eval/golden/ — and THE tokenizer
 * by import (covenant #4: pipeline, runtime, and sweep tokenize identically,
 * or bare-word probes would probe a vocabulary the engine does not have).
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { significantWords } from '@jestek-dev/scripture-engine/internal';

import { compileUniverse, type CompiledUniverse } from './compile.js';
import { loadGrammars } from './grammar.js';
import { loadConceptCells, loadFeltNeedMap, loadGoldenCells, loadWordLists } from './inputs.js';
import { UNIVERSE_SEED, UNIVERSE_VERSION } from './version.js';

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(HERE, '..', '..', '..');
export const GRAMMARS_DIR = join(REPO_ROOT, 'sweep', 'grammars');
export const WORDS_DIR = join(GRAMMARS_DIR, 'words');
export const FELT_NEED_MAP = join(WORDS_DIR, 'felt-need-map.yaml');
export const UNIVERSE_PATH = join(REPO_ROOT, 'sweep', 'universe', 'ring1-grammar.jsonl');
export const UNIVERSE_MANIFEST_PATH = join(REPO_ROOT, 'sweep', 'universe', 'ring1-grammar.manifest.json');

export function compileRepoUniverse(): CompiledUniverse {
  return compileUniverse({
    seed: UNIVERSE_SEED,
    universeVersion: UNIVERSE_VERSION,
    grammars: existsSync(GRAMMARS_DIR) ? loadGrammars(GRAMMARS_DIR) : [],
    concepts: loadConceptCells(join(REPO_ROOT, 'ontology', 'concepts')),
    frames: existsSync(FELT_NEED_MAP) ? loadFeltNeedMap(FELT_NEED_MAP) : [],
    lists: existsSync(WORDS_DIR) ? loadWordLists(WORDS_DIR, ['felt-need-map.yaml']) : {},
    golden: loadGoldenCells(join(REPO_ROOT, 'eval', 'golden')),
    tokenize: significantWords,
  });
}
