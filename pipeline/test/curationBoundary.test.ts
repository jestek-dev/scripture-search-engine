/**
 * P4.16 / B4 hard boundary, made executable: no file in `curation/` may be
 * imported by buildArtifact.ts, buildConceptLayer.ts, or anything under
 * `engine/`. The offline embedding-assisted curation tooling PROPOSES;
 * humans approve with rationale; the gauntlet verifies; only static
 * reviewed anchors ship — the runtime half is refused outright (covenant
 * #1: no AI at runtime).
 *
 * The scan covers ALL of engine/src and ALL of pipeline/src, not just the
 * two named builders: the builders import freely inside pipeline/src, so
 * any pipeline/src file could smuggle a curation import transitively. The
 * allowed direction (curation importing the pipeline's ontology compiler
 * and the engine's tokenizer, so the tooling reasons about exactly what
 * ships) is deliberately NOT restricted here.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const REPO_ROOT = join(__dirname, '..', '..');

function sourceFilesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      out.push(...sourceFilesUnder(path));
    } else if (/\.(ts|mts|cts|js|mjs|cjs)$/.test(entry)) {
      out.push(path);
    }
  }
  return out;
}

// Every module-specifier form the platform accepts, one alternation branch
// each — the positive-control tests below pin one violating example PER
// BRANCH, so a regex regression cannot pass silently:
//   1. `from '...'`        — static value imports AND re-exports
//   2. `import('...')`     — dynamic import
//   3. `import '...'`      — bare side-effect import (the round-1 bypass:
//                            it has no `from` and no paren, so the original
//                            pattern never saw it)
//   4. `require('...')`    — CJS require
const importPattern =
  /\b(?:from\s*['"]|import\s*\(\s*['"]|import\s*['"]|require\s*\(\s*['"])([^'"]*)['"]/g;

function curationSpecifiersInSource(contents: string): string[] {
  const hits: string[] = [];
  for (const match of contents.matchAll(importPattern)) {
    const specifier = match[1];
    if (
      specifier !== undefined &&
      (specifier.includes('curation/') ||
        specifier.endsWith('/curation') ||
        specifier.startsWith('@jestek-dev/scripture-curation'))
    ) {
      hits.push(specifier);
    }
  }
  return hits;
}

function curationImportsIn(file: string): string[] {
  return curationSpecifiersInSource(readFileSync(file, 'utf8'));
}

describe('curation/ stays outside the artifact build graph', () => {
  it('nothing under engine/ imports from curation/', () => {
    for (const file of sourceFilesUnder(join(REPO_ROOT, 'engine', 'src'))) {
      expect(curationImportsIn(file), `${file} imports curation`).toEqual([]);
    }
  });

  it('nothing under pipeline/src (buildArtifact.ts and buildConceptLayer.ts included) imports from curation/', () => {
    const files = sourceFilesUnder(join(REPO_ROOT, 'pipeline', 'src'));
    const names = files.map((file) => file.split('/').pop());
    // The named builders must actually be in the scanned set — a scan that
    // silently misses them would be decoration, not a guardrail.
    expect(names).toContain('buildArtifact.ts');
    expect(names).toContain('buildConceptLayer.ts');
    for (const file of files) {
      expect(curationImportsIn(file), `${file} imports curation`).toEqual([]);
    }
  });

  // POSITIVE CONTROLS: the scanner itself must FLAG every forbidden import
  // form. Round 1 proved why these exist: the original pattern missed the
  // bare side-effect form, and the file-tree scan (all clean files) could
  // never notice — the guard passed while a live curation import sat inside
  // buildConceptLayer.ts. A guardrail that cannot fire is decoration; these
  // fixtures make the scanner fail loudly if any branch of the pattern rots.
  const violations: readonly [string, string][] = [
    ['static value import', "import { analyzeInversions } from '../../curation/src/inversions.js';"],
    ['bare side-effect import (round-1 bypass)', "import '../../curation/src/inversions.js';"],
    ['side-effect import, no whitespace', 'import"../../curation/src/inversions.js";'],
    ['dynamic import()', "const tooling = await import('../../curation/src/inversions.js');"],
    ['require()', "const tooling = require('../../curation/src/inversions.js');"],
    ['re-export', "export * from '../../curation/src/inversions.js';"],
    ['package-name specifier', "import '@jestek-dev/scripture-curation';"],
  ];
  for (const [form, source] of violations) {
    it(`positive control: the scanner flags a ${form}`, () => {
      expect(curationSpecifiersInSource(source), source).not.toEqual([]);
    });
  }

  it('positive control counterpart: allowed imports are not flagged', () => {
    const allowed = [
      "import { readFileSync } from 'node:fs';",
      "import '../polyfills.js';",
      "const path = require('node:path');",
      "export { compileOntology } from './importers/ontologyImporter.js';",
    ].join('\n');
    expect(curationSpecifiersInSource(allowed)).toEqual([]);
  });

  it('curation is not an npm workspace of the build root', () => {
    const rootPackage = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as {
      workspaces: string[];
    };
    expect(rootPackage.workspaces).not.toContain('curation');
  });
});
