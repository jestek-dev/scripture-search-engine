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

const importPattern = /(?:from\s+|import\s*\(|require\s*\()\s*['"]([^'"]*)['"]/g;

function curationImportsIn(file: string): string[] {
  const contents = readFileSync(file, 'utf8');
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

  it('curation is not an npm workspace of the build root', () => {
    const rootPackage = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as {
      workspaces: string[];
    };
    expect(rootPackage.workspaces).not.toContain('curation');
  });
});
