// Read-only repository access for the offline curation tooling (P4.16 / B4).
//
// Reuses the pipeline's OWN ontology compiler and the engine's OWN
// tokenizer (one tokenizer — covenant #4) so the tooling reasons about
// exactly the phrases and anchors that ship. The import direction is
// curation -> pipeline/engine, which is allowed; the reverse direction is
// forbidden and enforced by pipeline/test/curationBoundary.test.ts.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { compileOntology, type CompiledOntology } from '../../pipeline/src/importers/ontologyImporter.js';

import { CURATION_ROOT } from './modelLock.js';

export const REPO_ROOT = join(CURATION_ROOT, '..');

export function loadOntology(): CompiledOntology {
  const dir = join(REPO_ROOT, 'ontology', 'concepts');
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.yaml'))
    .sort()
    .map((name) => ({ name, contents: readFileSync(join(dir, name), 'utf8') }));
  const { ontology, errors } = compileOntology(files);
  if (errors.length > 0) throw new Error(`ontology errors:\n${errors.join('\n')}`);
  return ontology;
}

export interface CorpusVerse {
  readonly verseId: number;
  readonly reference: string;
  readonly text: string;
}

/** The committed fixture subset (pipeline/fixtures/web-subset.json). */
export function loadCorpus(): CorpusVerse[] {
  const subset = JSON.parse(
    readFileSync(join(REPO_ROOT, 'pipeline', 'fixtures', 'web-subset.json'), 'utf8'),
  ) as {
    verses: readonly { book_name: string; book: number; chapter: number; verse: number; text: string }[];
  };
  return subset.verses.map((verse) => ({
    verseId: verse.book * 1_000_000 + verse.chapter * 1_000 + verse.verse,
    reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
    text: verse.text,
  }));
}
