/**
 * P4.16 / B4 hard boundary, made executable: no file in `curation/` may be
 * imported by buildArtifact.ts, buildConceptLayer.ts, or anything under
 * `engine/`. The offline embedding-assisted curation tooling PROPOSES;
 * humans approve with rationale; the gauntlet verifies; only static
 * reviewed anchors ship — the runtime half is refused outright (covenant
 * #1: no AI at runtime).
 *
 * HOW THE SCAN WORKS (round-2 rebuild — structural, not textual). Rounds 1
 * and 2 proved that a regex over source text loses to legal specifier
 * forms the pattern never saw (bare side-effect imports; then
 * template-literal dynamic imports, comments between tokens, and directory
 * pruning). This version parses every scanned file with the TypeScript
 * compiler's own parser (`typescript` is already a devDependency of this
 * workspace — no new dependency) and reads module specifiers off the AST:
 *
 *   - ImportDeclaration / ExportDeclaration module specifiers,
 *   - dynamic `import(...)` arguments,
 *   - `require(...)` and `require.resolve(...)` arguments,
 *   - any use of the identifier `createRequire` (the handle it returns can
 *     be named anything, making calls through it invisible to ANY
 *     specifier scan — so the factory itself is flagged).
 *
 * A specifier that is a string literal or a NO-substitution template
 * literal is static: the parser hands us its cooked value (escape
 * sequences like `curation` already resolved), it is matched
 * case-insensitively for the `curation` segment in both raw and
 * path-normalized (`..`/`.` resolved) form, and comments/whitespace
 * between tokens cannot hide it because tokens, not text, are matched.
 *
 * FAIL-CLOSED RULE for everything else: a dynamic import()/require()
 * whose argument is NOT a static literal — a variable, a concatenation, a
 * template with substitutions — cannot be proven safe by this scan, so it
 * is FLAGGED as indeterminate unless it appears on the explicit allowlist
 * below with a written reason. No dynamic specifier exists anywhere under
 * engine/ or pipeline/ today, so the allowlist ships EMPTY and the rule
 * costs nothing. This is the repo's gate rule applied to a scan: never
 * let a check report pass on what it did not actually prove.
 *
 * COVERAGE (file-glob rationale): the covenant says "anything under
 * `engine/`", so the walk covers the ENTIRE engine/ and pipeline/ package
 * directories — src, test, scripts, and loose config files like
 * vitest.config.ts, all of `.ts .tsx .mts .cts .js .mjs .cjs` (every
 * extension the toolchain will execute; no tsconfig enables jsx, but .tsx
 * is scanned anyway so enabling it later cannot open a hole). Test trees
 * are deliberately scanned too: the AST scan sees this file's own
 * violating-source FIXTURES as plain string data, not import statements,
 * so scanning them is free — cheaper than defending an exclusion.
 * Pruning happens ONLY at the package top level (`engine/dist` build
 * output, `node_modules`): a directory merely NAMED dist or node_modules
 * nested under src (e.g. pipeline/src/dist/evil.ts — round-2 bypass B3)
 * IS scanned, because tsc would compile it into the build graph.
 *
 * WHAT THIS PROVES, AND WHAT IT CANNOT: it proves that no statically
 * resolvable module specifier in the scanned trees names curation, and
 * that anything it cannot statically resolve is refused rather than
 * passed. It cannot see code outside the scanned trees, generated or
 * self-modifying build steps, or module loads that carry no specifier
 * (e.g. a Worker constructed from a computed URL). Full closure would be
 * a runtime module-graph check — running the builders under a resolve
 * hook that throws on any path into curation/ — which is named as future
 * hardening in the PR notes, not claimed here.
 *
 * The allowed direction (curation importing the pipeline's ontology
 * compiler and the engine's tokenizer, so the tooling reasons about
 * exactly what ships) is deliberately NOT restricted here.
 */

import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, posix, relative, sep } from 'node:path';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = join(__dirname, '..', '..');

const SOURCE_EXTENSION = /\.(ts|tsx|mts|cts|js|mjs|cjs)$/;

/**
 * Walk a package directory for source files. `pruneTopLevel` names are
 * skipped ONLY at depth 0 (the package's own build output and dependency
 * install); the same names nested deeper are scanned — round-2 bypass B3
 * hid a violating file in pipeline/src/dist/ and the old walker pruned it
 * at any depth.
 */
function sourceFilesUnder(packageDir: string, pruneTopLevel: readonly string[]): string[] {
  const out: string[] = [];
  const walk = (dir: string, depth: number): void => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        if (depth === 0 && pruneTopLevel.includes(entry)) continue;
        walk(path, depth + 1);
      } else if (SOURCE_EXTENSION.test(entry)) {
        out.push(path);
      }
    }
  };
  walk(packageDir, 0);
  return out.sort();
}

/**
 * Explicit allowlist for NON-static dynamic specifiers (fail-closed rule
 * above). Every entry must carry the repo-relative file path and a written
 * reason; an empty reason is itself a test failure. EMPTY today: nothing
 * under engine/ or pipeline/ uses a dynamic import()/require() specifier
 * or createRequire at all, so nothing needs — or gets — an exemption.
 */
const NON_STATIC_ALLOWLIST: readonly { file: string; reason: string }[] = [];

interface ScanFinding {
  kind: 'curation-import' | 'non-static-specifier';
  detail: string;
}

const CURATION = /curation/i;

function isCurationSpecifier(specifier: string): boolean {
  // Raw cooked text first (escapes already resolved by the parser), then
  // path-normalized so `curation/../curation/...` and friends still carry
  // the segment after `..`/`.` resolution. Case-insensitive: a wrong-case
  // specifier cannot resolve on the case-sensitive CI filesystem, but it
  // costs nothing to refuse it on case-insensitive dev machines too.
  return CURATION.test(specifier) || CURATION.test(posix.normalize(specifier));
}

function scriptKindFor(fileName: string): ts.ScriptKind {
  if (fileName.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (/\.(js|mjs|cjs)$/.test(fileName)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

/** Static specifier (string literal or substitution-free template) or null. */
function staticSpecifierText(node: ts.Node): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

function scanSourceText(fileName: string, contents: string): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const sourceFile = ts.createSourceFile(
    fileName,
    contents,
    ts.ScriptTarget.Latest,
    false,
    scriptKindFor(fileName),
  );

  const where = (node: ts.Node): string => {
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    const snippet = contents.slice(node.getStart(sourceFile), node.end).replace(/\s+/g, ' ').slice(0, 120);
    return `${fileName}:${line + 1} \`${snippet}\``;
  };

  const judgeSpecifier = (specifierNode: ts.Node | undefined, site: ts.Node): void => {
    const text = specifierNode === undefined ? null : staticSpecifierText(specifierNode);
    if (text === null) {
      // Not a static literal (or missing entirely): this scan cannot prove
      // what it loads. Fail closed — flag as indeterminate.
      findings.push({ kind: 'non-static-specifier', detail: where(site) });
    } else if (isCurationSpecifier(text)) {
      findings.push({ kind: 'curation-import', detail: `${where(site)} -> '${text}'` });
    }
  };

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      // ExportDeclaration without a moduleSpecifier (`export { x };`) is
      // a local export, not a module load — nothing to judge.
      if (node.moduleSpecifier !== undefined) judgeSpecifier(node.moduleSpecifier, node);
    } else if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const isDynamicImport = callee.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire = ts.isIdentifier(callee) && callee.text === 'require';
      const isRequireResolve =
        ts.isPropertyAccessExpression(callee) &&
        ts.isIdentifier(callee.expression) &&
        callee.expression.text === 'require' &&
        callee.name.text === 'resolve';
      if (isDynamicImport || isRequire || isRequireResolve) {
        judgeSpecifier(node.arguments[0], node);
      }
    }
    if (ts.isIdentifier(node) && node.text === 'createRequire') {
      // The require handle createRequire returns can be bound to any name;
      // calls through it carry specifiers no static scan can attribute.
      // Flag the factory itself (import, alias, property access — any
      // appearance of the identifier), allowlist-exempt only.
      findings.push({ kind: 'non-static-specifier', detail: `${where(node)} (createRequire)` });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  return findings;
}

/** Scan a real file, honoring the (currently empty) non-static allowlist. */
function boundaryFindingsIn(
  file: string,
  allowlist: readonly { file: string; reason: string }[] = NON_STATIC_ALLOWLIST,
): ScanFinding[] {
  const repoRelative = relative(REPO_ROOT, file).split(sep).join('/');
  const findings = scanSourceText(file, readFileSync(file, 'utf8'));
  return findings.filter(
    (finding) =>
      finding.kind !== 'non-static-specifier' ||
      !allowlist.some((entry) => entry.file === repoRelative && entry.reason.trim() !== ''),
  );
}

describe('curation/ stays outside the artifact build graph', () => {
  const PRUNE = ['node_modules', 'dist'] as const;

  it('nothing under engine/ imports from curation/ (statically or indeterminately)', () => {
    const files = sourceFilesUnder(join(REPO_ROOT, 'engine'), PRUNE);
    // Coverage witnesses: src AND test trees are both in the scanned set.
    const names = files.map((file) => file.split('/').pop());
    expect(names).toContain('createEngine.ts');
    expect(names).toContain('tokenizer.test.ts');
    for (const file of files) {
      expect(boundaryFindingsIn(file), `${file}`).toEqual([]);
    }
  });

  it('nothing under pipeline/ (buildArtifact.ts and buildConceptLayer.ts included) imports from curation/', () => {
    const files = sourceFilesUnder(join(REPO_ROOT, 'pipeline'), PRUNE);
    const names = files.map((file) => file.split('/').pop());
    // The named builders must actually be in the scanned set — a scan that
    // silently misses them would be decoration, not a guardrail. So must
    // the scripts tree, the loose config, and this very test file.
    expect(names).toContain('buildArtifact.ts');
    expect(names).toContain('buildConceptLayer.ts');
    expect(names).toContain('fetchSources.ts'); // pipeline/scripts
    expect(names).toContain('vitest.config.ts'); // package-root loose file
    expect(names).toContain('curationBoundary.test.ts'); // test tree scanned
    for (const file of files) {
      expect(boundaryFindingsIn(file), `${file}`).toEqual([]);
    }
  });

  // POSITIVE CONTROLS: the scanner must FLAG every forbidden form. Round 1
  // proved why these exist (the regex missed the bare side-effect form);
  // round 2 proved the class is open-ended for a regex (template-literal
  // dynamic import, comment between tokens), which is why the scanner now
  // reads the AST. Each control feeds the scan one violating source and
  // asserts a curation-import finding.
  const curationViolations: readonly [string, string][] = [
    ['static value import', "import { analyzeInversions } from '../../curation/src/inversions.js';"],
    ['bare side-effect import (round-1 bypass)', "import '../../curation/src/inversions.js';"],
    ['side-effect import, no whitespace', 'import"../../curation/src/inversions.js";'],
    ['dynamic import()', "const tooling = await import('../../curation/src/inversions.js');"],
    ['require()', "const tooling = require('../../curation/src/inversions.js');"],
    ['re-export', "export * from '../../curation/src/inversions.js';"],
    ['package-name specifier', "import '@jestek-dev/scripture-curation';"],
    [
      'template-literal dynamic import (round-2 bypass B1)',
      'const m = await import(`../../curation/src/inversions.js`);',
    ],
    [
      'comment between keyword and specifier (round-2 bypass B2)',
      "import/* tooling side effect */'../../curation/src/inversions.js';",
    ],
    [
      'line comment and newline between keyword and specifier',
      "import // pulled in for the build\n'../../curation/src/inversions.js';",
    ],
    ['template-literal require()', 'const tooling = require(`../../curation/src/inversions.js`);'],
    ['template-literal require.resolve()', 'const p = require.resolve(`../../curation/src/inversions.js`);'],
    [
      'path-normalization trick (curation/../curation)',
      "import '../../curation/../curation/src/inversions.js';",
    ],
    ['wrong-case specifier', "import '../../CURATION/src/inversions.js';"],
    [
      'unicode-escaped specifier',
      "import '../../\\u0063uration/src/inversions.js';", // scanner sees the cooked value
    ],
  ];
  for (const [form, source] of curationViolations) {
    it(`positive control: the scanner flags a ${form}`, () => {
      const findings = scanSourceText('control.ts', source);
      expect(findings, source).not.toEqual([]);
      expect(
        findings.some((finding) => finding.kind === 'curation-import'),
        `${source} should yield a curation-import finding`,
      ).toBe(true);
    });
  }

  // FAIL-CLOSED CONTROLS: a specifier the scan cannot statically resolve
  // is flagged as indeterminate — refused, not passed (round-2 "honest
  // limit": the irreducibly dynamic class no textual scan can judge).
  const nonStaticForms: readonly [string, string][] = [
    ['import(variable)', 'const m = await import(moduleName);'],
    ['import(concatenation)', "const m = await import('../../cur' + 'ation/src/inversions.js');"],
    ['import(template with substitution)', 'const m = await import(`../../${dir}/inversions.js`);'],
    ['require(variable)', 'const m = require(moduleName);'],
    ['require.resolve(variable)', 'const p = require.resolve(moduleName);'],
    ['createRequire import', "import { createRequire } from 'node:module';"],
    ['createRequire via namespace', "import * as mod from 'node:module';\nconst req = mod.createRequire(import.meta.url);"],
  ];
  for (const [form, source] of nonStaticForms) {
    it(`fail-closed control: ${form} is flagged as indeterminate`, () => {
      const findings = scanSourceText('control.ts', source);
      expect(
        findings.some((finding) => finding.kind === 'non-static-specifier'),
        `${source} should yield a non-static-specifier finding`,
      ).toBe(true);
    });
  }

  it('the non-static allowlist requires a written reason, and only suppresses non-static findings', () => {
    for (const entry of NON_STATIC_ALLOWLIST) {
      expect(entry.reason.trim(), `${entry.file} allowlisted without a reason`).not.toBe('');
    }
    // Mechanism check with a synthetic allowlist: an allowlisted file's
    // non-static finding is suppressed; a curation-import never is.
    const dir = mkdtempSync(join(tmpdir(), 'curation-boundary-allowlist-'));
    try {
      const dynamicFile = join(dir, 'dynamic.ts');
      writeFileSync(dynamicFile, 'const m = await import(moduleName);\n');
      const rel = relative(REPO_ROOT, dynamicFile).split(sep).join('/');
      expect(boundaryFindingsIn(dynamicFile, [])).not.toEqual([]);
      expect(boundaryFindingsIn(dynamicFile, [{ file: rel, reason: 'synthetic mechanism check' }])).toEqual([]);
      const violatingFile = join(dir, 'violating.ts');
      writeFileSync(violatingFile, "import '../../curation/src/inversions.js';\n");
      const relViolating = relative(REPO_ROOT, violatingFile).split(sep).join('/');
      expect(
        boundaryFindingsIn(violatingFile, [{ file: relViolating, reason: 'must not suppress this' }]),
      ).not.toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('walker control: top-level dist/node_modules are pruned, nested ones are scanned (round-2 bypass B3)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'curation-boundary-walk-'));
    try {
      for (const sub of ['node_modules', 'dist', join('src', 'dist'), join('src', 'node_modules')]) {
        mkdirSync(join(dir, sub), { recursive: true });
      }
      writeFileSync(join(dir, 'node_modules', 'dep.ts'), 'export {};\n');
      writeFileSync(join(dir, 'dist', 'build-output.ts'), 'export {};\n');
      writeFileSync(join(dir, 'src', 'ok.ts'), 'export {};\n');
      writeFileSync(join(dir, 'src', 'dist', 'evil.ts'), 'export {};\n');
      writeFileSync(join(dir, 'src', 'node_modules', 'hidden.ts'), 'export {};\n');
      writeFileSync(join(dir, 'notes.md'), 'not a source file\n');
      const files = sourceFilesUnder(dir, ['node_modules', 'dist']).map((file) => relative(dir, file));
      expect(files).toEqual([join('src', 'dist', 'evil.ts'), join('src', 'node_modules', 'hidden.ts'), join('src', 'ok.ts')]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('positive control counterpart: allowed imports are not flagged', () => {
    const allowed = [
      "import { readFileSync } from 'node:fs';",
      "import '../polyfills.js';",
      "const path = require('node:path');",
      "export { compileOntology } from './importers/ontologyImporter.js';",
      "const chunk = await import('./localChunk.js');", // static, non-curation dynamic import
      'const other = await import(`./templateButStatic.js`);',
    ].join('\n');
    expect(scanSourceText('control.ts', allowed)).toEqual([]);
  });

  it('curation is not an npm workspace of the build root', () => {
    const rootPackage = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as {
      workspaces: string[];
    };
    expect(rootPackage.workspaces).not.toContain('curation');
  });
});
