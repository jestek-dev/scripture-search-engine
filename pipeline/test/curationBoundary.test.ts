/**
 * P4.16 / B4 hard boundary, made executable: no file in `curation/` may be
 * imported by buildArtifact.ts, buildConceptLayer.ts, or anything under
 * `engine/`. The offline embedding-assisted curation tooling PROPOSES;
 * humans approve with rationale; the gauntlet verifies; only static
 * reviewed anchors ship — the runtime half is refused outright (covenant
 * #1: no AI at runtime).
 *
 * HOW THE SCAN WORKS (round-2 rebuild — structural, not textual; round-3
 * extensions — static execution vectors beyond the import graph). Rounds 1
 * and 2 proved that a regex over source text loses to legal specifier
 * forms the pattern never saw (bare side-effect imports; then
 * template-literal dynamic imports, comments between tokens, and directory
 * pruning). Round 3 proved that the IMPORT graph is not the only static
 * path into curation: a scanned file can shell out to `node curation/...`,
 * construct a Worker from a static curation URL, hide the invocation in a
 * package.json script, or BE a symlink into curation. This version parses
 * every scanned file with the TypeScript compiler's own parser
 * (`typescript` is already a devDependency of this workspace — no new
 * dependency) and checks, in the same shipped scan:
 *
 *   MODULE-IMPORT GRAPH —
 *   - ImportDeclaration / ExportDeclaration module specifiers,
 *   - dynamic `import(...)` arguments,
 *   - `require(...)` and `require.resolve(...)` arguments,
 *   - any use of the identifier `createRequire` (the handle it returns can
 *     be named anything, making calls through it invisible to ANY
 *     specifier scan — so the factory itself is flagged).
 *   A static specifier (string literal or no-substitution template) is
 *   matched case-insensitively for the `curation` segment in raw,
 *   path-normalized, AND percent-decoded form (round-3 LOW fix:
 *   `cur%61tion` resolves in Node ESM; a specifier that cannot be
 *   percent-decoded at all is flagged as indeterminate, never passed).
 *
 *   STATIC EXECUTION VECTORS (round-3 extensions) —
 *   - child_process calls (exec, execSync, execFile, execFileSync, spawn,
 *     spawnSync, fork), recognized by tracking the local bindings each file
 *     creates from 'child_process'/'node:child_process' — named imports
 *     (aliases included), namespace/default imports, and require()
 *     destructuring — never by bare method name, so RegExp.exec and
 *     sqlite's database.exec cannot false-positive. Static command strings
 *     and static args-array elements are checked for the curation segment
 *     (percent-decoded); a NON-static command is flagged as indeterminate;
 *     non-static args are flagged as indeterminate UNLESS the command is a
 *     static literal on the reviewed NON_RUNNER_COMMANDS list below
 *     (binaries that cannot execute JS — which is how buildArtifact.ts's
 *     idiomatic `execFileSync('unzip', ...)` is proven clean by the scan
 *     rather than exempted from it). A tracked spawn handle that escapes as
 *     a value (e.g. `promisify(execFile)`) is flagged, because what its
 *     wrapped calls execute is invisible to any static scan.
 *   - Worker construction: `new Worker(...)`/`new SharedWorker(...)` (the
 *     web-style globals, matched by constructor name) and the
 *     worker_threads Worker (binding-tracked). Static target → curation
 *     check; non-static target (a variable, a `new URL(...)`) → flagged.
 *   - vm module code loaders (Script, SourceTextModule, runInThisContext,
 *     runInNewContext, runInContext, compileFunction), binding-tracked the
 *     same way: static code/args checked for the curation segment,
 *     non-static first arguments flagged.
 *   - package.json `scripts` of every package.json in the scanned trees:
 *     a PLAIN STRING SCAN (raw + percent-decoded when decodable) of each
 *     script's text for the curation segment. It is a string scan, not a
 *     shell parser, and is claimed as nothing more.
 *   - symlinks: the tree walker lstat()s every entry; a symlink whose
 *     realpath resolves into curation is a violation, one that resolves
 *     outside its package tree (or is broken) is flagged as indeterminate,
 *     and no symlink is ever followed for scanning. (Zero symlinks exist
 *     in the scanned trees today, so this check is free.)
 *
 * FAIL-CLOSED RULE: anything in the above that the scan cannot statically
 * resolve — a dynamic import()/require() specifier, a subprocess command
 * or JS-runner argument that is not a literal, a computed Worker URL, an
 * undecodable percent-encoding, an escaped spawn handle — is FLAGGED as
 * indeterminate unless a committed allowlist entry names the file AND a
 * call-site match substring AND a written reason (so an entry can never
 * blanket-suppress future findings in the same file). The allowlist has
 * exactly one entry today (buildCandidate.test.ts's promisify(execFile),
 * reviewed below). This is the repo's gate rule applied to a scan: never
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
 * WHAT THIS PROVES, AND WHAT IT CANNOT (state it exactly): it proves the
 * module-import graph over statically-resolvable specifiers (including
 * percent-decoded forms) is curation-free in the scanned trees, plus the
 * extended static-literal vectors above — binding-tracked child_process /
 * Worker / vm targets, package.json script strings, and symlinks — with
 * everything non-static in those positions refused (flagged) rather than
 * passed. WHAT REMAINS OUT OF SCOPE even after the extensions:
 * dynamically-composed subprocess invocations beyond the flagged forms
 * (e.g. a curation path that reaches an allowlisted or non-runner
 * subprocess through a variable, an env var, or an options object at
 * runtime); code outside the scanned trees (including shell scripts a
 * subprocess might run); builds that generate or rewrite their own code;
 * and OS-level tricks (PATH shims, a binary that itself loads curation).
 * Those classes CANNOT be closed by any static scan — a Node resolve hook,
 * sometimes suggested for this, governs in-process module resolution only
 * and would not see a subprocess or an npm script, so no such "full
 * closure" is claimed. They remain gated by the covenant's named human
 * safeguards: the gauntlet, and human PR review of every diff.
 *
 * The allowed direction (curation importing the pipeline's ontology
 * compiler and the engine's tokenizer, so the tooling reasons about
 * exactly what ships) is deliberately NOT restricted here.
 */

import { lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, posix, relative, sep } from 'node:path';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = join(__dirname, '..', '..');

const SOURCE_EXTENSION = /\.(ts|tsx|mts|cts|js|mjs|cjs)$/;

/**
 * Walk a package directory for files matching `keep`. `pruneTopLevel`
 * names are skipped ONLY at depth 0 (the package's own build output and
 * dependency install); the same names nested deeper are scanned — round-2
 * bypass B3 hid a violating file in pipeline/src/dist/. Symlinks are
 * NEVER followed (round-3): they are collected separately and judged by
 * symlinkFindingsUnder below.
 */
function walkPackage(
  packageDir: string,
  pruneTopLevel: readonly string[],
  keep: (name: string) => boolean,
): { files: string[]; symlinks: string[] } {
  const files: string[] = [];
  const symlinks: string[] = [];
  const walk = (dir: string, depth: number): void => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (depth === 0 && pruneTopLevel.includes(entry) && statSync(path).isDirectory()) continue;
      if (lstatSync(path).isSymbolicLink()) {
        symlinks.push(path);
        continue; // never follow a link — judged separately
      }
      if (statSync(path).isDirectory()) {
        walk(path, depth + 1);
      } else if (keep(entry)) {
        files.push(path);
      }
    }
  };
  walk(packageDir, 0);
  files.sort();
  symlinks.sort();
  return { files, symlinks };
}

function sourceFilesUnder(packageDir: string, pruneTopLevel: readonly string[]): string[] {
  return walkPackage(packageDir, pruneTopLevel, (name) => SOURCE_EXTENSION.test(name)).files;
}

/**
 * Round-3 symlink check: a symlink inside a scanned tree whose realpath
 * lands in curation is a violation; one that escapes the package tree (or
 * is broken) cannot be judged statically, so it is flagged as
 * indeterminate. Zero symlinks exist under engine/ or pipeline/ today.
 */
function symlinkFindingsUnder(packageDir: string, pruneTopLevel: readonly string[]): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const packageReal = realpathSync(packageDir);
  for (const link of walkPackage(packageDir, pruneTopLevel, () => true).symlinks) {
    let target: string;
    try {
      target = realpathSync(link);
    } catch {
      findings.push({ kind: 'non-static-specifier', detail: `${link} (broken symlink — target cannot be judged)` });
      continue;
    }
    if (CURATION.test(target)) {
      findings.push({ kind: 'curation-import', detail: `${link} is a symlink into curation -> '${target}'` });
    } else if (relative(packageReal, target).startsWith('..')) {
      findings.push({ kind: 'non-static-specifier', detail: `${link} is a symlink out of the package tree -> '${target}'` });
    }
  }
  return findings;
}

/**
 * Explicit allowlist for indeterminate (non-static) findings — the
 * fail-closed rule above. Every entry must carry the repo-relative file
 * path, a MATCH substring that the finding's call-site snippet must
 * contain (so the entry covers exactly one reviewed site and can never
 * blanket-suppress future findings in the same file), and a written
 * reason; an empty match or reason is itself a test failure. A
 * curation-import finding can NEVER be allowlisted.
 */
const NON_STATIC_ALLOWLIST: readonly { file: string; match: string; reason: string }[] = [
  {
    file: 'pipeline/test/buildCandidate.test.ts',
    match: 'promisify(execFile)',
    reason:
      'The buildCandidate CLI test wraps execFile in promisify; the promisified handle escapes ' +
      'callee tracking, so the scan cannot judge its calls. Reviewed by hand: the one call site ' +
      '(runCandidateCli) executes process.execPath (node) on the repo-pinned tsx CLI with ' +
      'pipeline/src/buildCandidate.ts — static in-tree paths — and its only variable argument is ' +
      'the --request JSON path inside the test sandbox. No curation path is composed or executed. ' +
      'A companion test below pins this file to exactly this one finding, so any new dynamic use ' +
      'there re-flags.',
  },
];

interface ScanFinding {
  kind: 'curation-import' | 'non-static-specifier';
  detail: string;
}

const CURATION = /curation/i;

/**
 * Static-text verdict for a specifier, subprocess argument, or script
 * string: checked raw, path-normalized, and percent-decoded (round-3 LOW
 * fix — `cur%61tion` is Node-resolvable). Text that percent-decoding
 * rejects outright cannot be judged, so it is 'undecodable' (flagged as
 * indeterminate by callers), never passed.
 */
function classifyStaticText(text: string): 'curation' | 'undecodable' | 'clean' {
  const candidates = [text, posix.normalize(text)];
  let undecodable = false;
  for (const candidate of [...candidates]) {
    try {
      const decoded = decodeURIComponent(candidate);
      candidates.push(decoded, posix.normalize(decoded));
    } catch {
      undecodable = true;
    }
  }
  if (candidates.some((candidate) => CURATION.test(candidate))) return 'curation';
  return undecodable ? 'undecodable' : 'clean';
}

/**
 * Modules whose bindings load or execute code: child_process (subprocess),
 * worker_threads (Worker), vm (code compilation). Binding-tracked so
 * aliased imports and namespace/require access are recognized while
 * unrelated methods that merely SHARE a name (RegExp.prototype.exec,
 * sqlite database.exec) are not.
 */
const SPAWN_MODULES: Record<string, 'child_process' | 'worker_threads' | 'vm'> = {
  child_process: 'child_process',
  'node:child_process': 'child_process',
  worker_threads: 'worker_threads',
  'node:worker_threads': 'worker_threads',
  vm: 'vm',
  'node:vm': 'vm',
};

const CHILD_PROCESS_FUNCTIONS = new Set(['exec', 'execSync', 'execFile', 'execFileSync', 'spawn', 'spawnSync', 'fork']);
const WORKER_CONSTRUCTORS = new Set(['Worker', 'SharedWorker']);
const VM_CODE_LOADERS = new Set(['Script', 'SourceTextModule', 'runInThisContext', 'runInNewContext', 'runInContext', 'compileFunction']);

/**
 * Reviewed non-JS-runner commands: binaries that extract archives and
 * cannot execute JavaScript, so their non-static arguments (temp paths)
 * are not code-loading. This is how the build path's idiomatic
 * `execFileSync('unzip', ['-o','-q', zipPath, '-d', dir])` calls
 * (buildArtifact.ts and the fetch/delta scripts) are PROVEN clean by the
 * scan — static command, static args curation-checked — instead of being
 * exempted from it. Any command NOT on this list (node, npx, tsx, bash,
 * anything unknown) gets its non-static arguments flagged.
 */
const NON_RUNNER_COMMANDS = new Set(['unzip', 'zip']);

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
    true, // parent pointers, so escaped-handle findings can cite their call site
    scriptKindFor(fileName),
  );

  const where = (node: ts.Node): string => {
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    const snippet = contents.slice(node.getStart(sourceFile), node.end).replace(/\s+/g, ' ').slice(0, 120);
    return `${fileName}:${line + 1} \`${snippet}\``;
  };

  const flagStatic = (text: string, site: ts.Node, role: string): void => {
    const verdict = classifyStaticText(text);
    if (verdict === 'curation') {
      findings.push({ kind: 'curation-import', detail: `${where(site)} -> '${text}' (${role})` });
    } else if (verdict === 'undecodable') {
      findings.push({ kind: 'non-static-specifier', detail: `${where(site)} -> '${text}' (${role}: undecodable percent-encoding)` });
    }
  };

  const judgeSpecifier = (specifierNode: ts.Node | undefined, site: ts.Node): void => {
    const text = specifierNode === undefined ? null : staticSpecifierText(specifierNode);
    if (text === null) {
      // Not a static literal (or missing entirely): this scan cannot prove
      // what it loads. Fail closed — flag as indeterminate.
      findings.push({ kind: 'non-static-specifier', detail: where(site) });
    } else {
      flagStatic(text, site, 'module specifier');
    }
  };

  // ---- pass 1: collect code-loading bindings (child_process / worker_threads / vm)
  const trackedFunctions = new Map<string, { module: 'child_process' | 'worker_threads' | 'vm'; exported: string }>();
  const trackedNamespaces = new Map<string, 'child_process' | 'worker_threads' | 'vm'>();

  const codeLoaderNamesFor = (moduleKind: 'child_process' | 'worker_threads' | 'vm'): Set<string> => {
    if (moduleKind === 'child_process') return CHILD_PROCESS_FUNCTIONS;
    if (moduleKind === 'worker_threads') return WORKER_CONSTRUCTORS;
    return VM_CODE_LOADERS;
  };

  const collect = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      const specifier = staticSpecifierText(node.moduleSpecifier);
      const moduleKind = specifier === null ? undefined : SPAWN_MODULES[specifier];
      if (moduleKind !== undefined && node.importClause !== undefined) {
        if (node.importClause.name !== undefined) trackedNamespaces.set(node.importClause.name.text, moduleKind);
        const bindings = node.importClause.namedBindings;
        if (bindings !== undefined && ts.isNamespaceImport(bindings)) trackedNamespaces.set(bindings.name.text, moduleKind);
        if (bindings !== undefined && ts.isNamedImports(bindings)) {
          for (const element of bindings.elements) {
            const exported = (element.propertyName ?? element.name).text;
            if (codeLoaderNamesFor(moduleKind).has(exported)) {
              trackedFunctions.set(element.name.text, { module: moduleKind, exported });
            }
          }
        }
      }
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      const specifier = staticSpecifierText(node.moduleReference.expression);
      const moduleKind = specifier === null ? undefined : SPAWN_MODULES[specifier];
      if (moduleKind !== undefined) trackedNamespaces.set(node.name.text, moduleKind);
    } else if (ts.isVariableDeclaration(node) && node.initializer !== undefined && ts.isCallExpression(node.initializer)) {
      const callee = node.initializer.expression;
      const isRequireCall = ts.isIdentifier(callee) && callee.text === 'require' && node.initializer.arguments.length === 1;
      const specifier = isRequireCall ? staticSpecifierText(node.initializer.arguments[0]!) : null;
      const moduleKind = specifier === null ? undefined : SPAWN_MODULES[specifier];
      if (moduleKind !== undefined) {
        if (ts.isIdentifier(node.name)) trackedNamespaces.set(node.name.text, moduleKind);
        if (ts.isObjectBindingPattern(node.name)) {
          for (const element of node.name.elements) {
            const exported = element.propertyName !== undefined && ts.isIdentifier(element.propertyName)
              ? element.propertyName.text
              : ts.isIdentifier(element.name) ? element.name.text : null;
            if (exported !== null && codeLoaderNamesFor(moduleKind).has(exported) && ts.isIdentifier(element.name)) {
              trackedFunctions.set(element.name.text, { module: moduleKind, exported });
            }
          }
        }
      }
    }
    ts.forEachChild(node, collect);
  };
  collect(sourceFile);

  // ---- judging helpers for the round-3 execution vectors
  /** Check static strings anywhere inside options objects / nested arrays (never fail-closes). */
  const flagStaticsWithin = (node: ts.Node, site: ts.Node, role: string): void => {
    const text = staticSpecifierText(node);
    if (text !== null && classifyStaticText(text) === 'curation') flagStatic(text, site, role);
    ts.forEachChild(node, (child) => flagStaticsWithin(child, site, role));
  };

  /** An argument that may carry a path/argv the spawned code will load. */
  const judgeSpawnArg = (arg: ts.Node, site: ts.Node, role: string, failClosed: boolean): void => {
    const text = staticSpecifierText(arg);
    if (text !== null) {
      flagStatic(text, site, role);
    } else if (ts.isArrayLiteralExpression(arg)) {
      for (const element of arg.elements) judgeSpawnArg(element, site, role, failClosed);
    } else if (ts.isObjectLiteralExpression(arg)) {
      flagStaticsWithin(arg, site, `${role} options`);
    } else if (failClosed) {
      findings.push({ kind: 'non-static-specifier', detail: `${where(site)} (non-static ${role})` });
    }
  };

  const judgeChildProcessCall = (call: ts.CallExpression, exported: string): void => {
    const command = call.arguments[0];
    const commandText = command === undefined ? null : staticSpecifierText(command);
    if (commandText === null) {
      findings.push({ kind: 'non-static-specifier', detail: `${where(call)} (non-static ${exported} command)` });
    } else {
      flagStatic(commandText, call, `${exported} command`);
    }
    // exec/execSync take a whole shell line as arg0 (judged above); fork's
    // target is a JS module path (judged above). Remaining args are argv
    // and options: fail closed on non-statics unless the command is a
    // static literal on the reviewed non-runner list.
    const basename = commandText?.split(/[/\\]/).pop()?.toLowerCase() ?? '';
    const failClosed = commandText === null || !NON_RUNNER_COMMANDS.has(basename);
    for (const arg of call.arguments.slice(1)) {
      judgeSpawnArg(arg, call, `${exported} argument`, failClosed);
    }
  };

  const judgeCodeConstruction = (site: ts.CallExpression | ts.NewExpression, name: string): void => {
    const args = site.arguments ?? [];
    const target = args[0];
    const targetText = target === undefined ? null : staticSpecifierText(target);
    if (targetText === null) {
      findings.push({ kind: 'non-static-specifier', detail: `${where(site)} (non-static ${name} target)` });
    } else {
      flagStatic(targetText, site, `${name} target`);
    }
    for (const arg of args.slice(1)) flagStaticsWithin(arg, site, `${name} options`);
  };

  const judgeTrackedUse = (call: ts.CallExpression | ts.NewExpression, moduleKind: 'child_process' | 'worker_threads' | 'vm', exported: string): void => {
    if (moduleKind === 'child_process') judgeChildProcessCall(call as ts.CallExpression, exported);
    else judgeCodeConstruction(call, exported);
  };

  /** Is this identifier the declaration site of the binding it names? */
  const isDeclarationPosition = (node: ts.Identifier): boolean => {
    const parent = node.parent;
    if (ts.isImportSpecifier(parent) || ts.isImportClause(parent) || ts.isNamespaceImport(parent)) return true;
    if (ts.isBindingElement(parent)) return true;
    if (ts.isImportEqualsDeclaration(parent) && parent.name === node) return true;
    if (ts.isVariableDeclaration(parent) && parent.name === node) return true;
    return false;
  };

  // ---- pass 2: judge
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
      const direct = ts.isIdentifier(callee) ? trackedFunctions.get(callee.text) : undefined;
      if (direct !== undefined) judgeTrackedUse(node, direct.module, direct.exported);
      if (
        ts.isPropertyAccessExpression(callee) &&
        ts.isIdentifier(callee.expression) &&
        trackedNamespaces.has(callee.expression.text)
      ) {
        const moduleKind = trackedNamespaces.get(callee.expression.text)!;
        if (codeLoaderNamesFor(moduleKind).has(callee.name.text)) judgeTrackedUse(node, moduleKind, callee.name.text);
      }
    } else if (ts.isNewExpression(node)) {
      const callee = node.expression;
      if (ts.isIdentifier(callee)) {
        const tracked = trackedFunctions.get(callee.text);
        if (tracked !== undefined) {
          judgeTrackedUse(node, tracked.module, tracked.exported);
        } else if (WORKER_CONSTRUCTORS.has(callee.text)) {
          // Web-style global Worker/SharedWorker: no import to track.
          judgeCodeConstruction(node, callee.text);
        }
      } else if (
        ts.isPropertyAccessExpression(callee) &&
        ts.isIdentifier(callee.expression) &&
        trackedNamespaces.has(callee.expression.text) &&
        codeLoaderNamesFor(trackedNamespaces.get(callee.expression.text)!).has(callee.name.text)
      ) {
        judgeCodeConstruction(node, callee.name.text);
      }
    }
    if (ts.isIdentifier(node) && node.text === 'createRequire') {
      // The require handle createRequire returns can be bound to any name;
      // calls through it carry specifiers no static scan can attribute.
      // Flag the factory itself (import, alias, property access — any
      // appearance of the identifier), allowlist-exempt only.
      findings.push({ kind: 'non-static-specifier', detail: `${where(node)} (createRequire)` });
    }
    if (ts.isIdentifier(node) && trackedFunctions.has(node.text) && !isDeclarationPosition(node)) {
      const parent = node.parent;
      const isJudgedCallee =
        (ts.isCallExpression(parent) || ts.isNewExpression(parent)) && parent.expression === node;
      const isPropertyName = ts.isPropertyAccessExpression(parent) && parent.name === node;
      if (!isJudgedCallee && !isPropertyName) {
        // The spawn/Worker/vm handle escapes as a value (promisify(execFile),
        // a stored reference, a shorthand property) — calls through the
        // escaped handle are invisible to this scan. Fail closed.
        const site = ts.isCallExpression(parent) || ts.isNewExpression(parent) ? parent : node;
        findings.push({
          kind: 'non-static-specifier',
          detail: `${where(site)} (${node.text} handle escapes the scan)`,
        });
      }
    }
    if (ts.isIdentifier(node) && trackedNamespaces.has(node.text) && !isDeclarationPosition(node)) {
      const parent = node.parent;
      const grand = ts.isPropertyAccessExpression(parent) ? parent.parent : undefined;
      const isJudgedAccess =
        ts.isPropertyAccessExpression(parent) &&
        parent.expression === node &&
        (!codeLoaderNamesFor(trackedNamespaces.get(node.text)!).has(parent.name.text) ||
          (grand !== undefined && (ts.isCallExpression(grand) || ts.isNewExpression(grand)) && grand.expression === parent));
      const isPropertyName = ts.isPropertyAccessExpression(parent) && parent.name === node;
      if (!isJudgedAccess && !isPropertyName) {
        const site = ts.isCallExpression(parent) || ts.isNewExpression(parent) ? parent : node;
        findings.push({
          kind: 'non-static-specifier',
          detail: `${where(site)} (${node.text} namespace handle escapes the scan)`,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  return findings;
}

/**
 * Round-3 package.json check — a PLAIN STRING SCAN of the scripts block
 * (raw text plus its percent-decoded form when decodable), honestly
 * claimed as such: it is not a shell parser, it just refuses any script
 * whose text names the curation segment.
 */
function scanPackageJsonText(fileName: string, contents: string): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const parsed = JSON.parse(contents) as { scripts?: Record<string, unknown> };
  for (const [name, command] of Object.entries(parsed.scripts ?? {})) {
    if (typeof command !== 'string') continue;
    const candidates = [command];
    try {
      candidates.push(decodeURIComponent(command));
    } catch {
      // undecodable %-sequences are legal shell text (printf '%s'); the raw
      // form is still checked below. This is a string scan, nothing more.
    }
    if (candidates.some((candidate) => CURATION.test(candidate))) {
      findings.push({ kind: 'curation-import', detail: `${fileName} scripts.${name}: "${command}"` });
    }
  }
  return findings;
}

/** Scan a real file, honoring the site-scoped non-static allowlist. */
function boundaryFindingsIn(
  file: string,
  allowlist: readonly { file: string; match: string; reason: string }[] = NON_STATIC_ALLOWLIST,
): ScanFinding[] {
  const repoRelative = relative(REPO_ROOT, file).split(sep).join('/');
  const findings = scanSourceText(file, readFileSync(file, 'utf8'));
  return findings.filter(
    (finding) =>
      finding.kind !== 'non-static-specifier' ||
      !allowlist.some(
        (entry) =>
          entry.file === repoRelative &&
          entry.match.trim() !== '' &&
          entry.reason.trim() !== '' &&
          finding.detail.includes(entry.match),
      ),
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

  it('package.json scripts in the scanned trees never invoke curation (round-3)', () => {
    for (const packageName of ['engine', 'pipeline']) {
      const { files } = walkPackage(join(REPO_ROOT, packageName), PRUNE, (name) => name === 'package.json');
      // Witness: each package's own manifest is actually in the walked set.
      expect(files).toContain(join(REPO_ROOT, packageName, 'package.json'));
      for (const file of files) {
        expect(scanPackageJsonText(file, readFileSync(file, 'utf8')), `${file}`).toEqual([]);
      }
    }
  });

  it('no symlinks exist inside the scanned trees (round-3; a symlink into curation would be a violation)', () => {
    for (const packageName of ['engine', 'pipeline']) {
      const packageDir = join(REPO_ROOT, packageName);
      expect(symlinkFindingsUnder(packageDir, PRUNE), packageName).toEqual([]);
      // Stronger than the finding check: zero symlinks at all today, so
      // any future link — even a benign-looking one — shows up in review.
      expect(walkPackage(packageDir, PRUNE, () => true).symlinks, packageName).toEqual([]);
    }
  });

  // POSITIVE CONTROLS: the scanner must FLAG every forbidden form. Round 1
  // proved why these exist (the regex missed the bare side-effect form);
  // round 2 proved the class is open-ended for a regex (template-literal
  // dynamic import, comment between tokens), which is why the scanner now
  // reads the AST; round 3 proved the import graph is not the only static
  // path (subprocess/Worker/vm/package.json/symlink vectors, and
  // percent-encoded specifiers). Each control feeds the scan one violating
  // source and asserts a curation-import finding.
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
    [
      'percent-encoded dynamic import (round-3 LOW: Node-resolvable)',
      "const m = await import('../../cur%61tion/src/inversions.js');",
    ],
    ['percent-encoded static import', "import '../../cur%61tion/src/inversions.js';"],
    [
      'execFileSync of node on a curation path (round-3 vector)',
      "import { execFileSync } from 'node:child_process';\nexecFileSync('node', ['../../curation/src/inversions.js']);",
    ],
    [
      'execSync shell line naming curation (round-3 vector)',
      "import { execSync } from 'node:child_process';\nexecSync('node ../../curation/src/inversions.js');",
    ],
    [
      'aliased child_process import (binding-tracked)',
      "import { execFileSync as run } from 'node:child_process';\nrun('node', ['../../curation/src/inversions.js']);",
    ],
    [
      'namespace require of child_process',
      "const cp = require('node:child_process');\ncp.spawnSync('node', ['../../curation/src/inversions.js']);",
    ],
    [
      'fork of a curation module',
      "import { fork } from 'node:child_process';\nfork('../../curation/src/inversions.js');",
    ],
    [
      'web-style Worker with a static curation URL (round-3 vector)',
      "const w = new Worker('../../curation/src/inversions.js');",
    ],
    [
      'worker_threads Worker with a static curation path (round-3 vector)',
      "import { Worker } from 'node:worker_threads';\nnew Worker('../../curation/src/inversions.js');",
    ],
    [
      'vm code string naming curation',
      "import { runInThisContext } from 'node:vm';\nrunInThisContext(`require('../../curation/src/inversions.js')`);",
    ],
    [
      'percent-encoded curation path in a subprocess argument',
      "import { execFileSync } from 'node:child_process';\nexecFileSync('node', ['../../cur%61tion/src/inversions.js']);",
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

  // FAIL-CLOSED CONTROLS: a specifier, subprocess target, or Worker/vm
  // target the scan cannot statically resolve is flagged as indeterminate
  // — refused, not passed (round-2 "honest limit": the irreducibly dynamic
  // class no textual scan can judge; round-3 widened it to the execution
  // vectors).
  const nonStaticForms: readonly [string, string][] = [
    ['import(variable)', 'const m = await import(moduleName);'],
    ['import(concatenation)', "const m = await import('../../cur' + 'ation/src/inversions.js');"],
    ['import(template with substitution)', 'const m = await import(`../../${dir}/inversions.js`);'],
    ['require(variable)', 'const m = require(moduleName);'],
    ['require.resolve(variable)', 'const p = require.resolve(moduleName);'],
    ['createRequire import', "import { createRequire } from 'node:module';"],
    ['createRequire via namespace', "import * as mod from 'node:module';\nconst req = mod.createRequire(import.meta.url);"],
    [
      'fork(variable)',
      "import { fork } from 'node:child_process';\nfork(target);",
    ],
    [
      'Worker with a computed URL',
      "new Worker(new URL('./w.js', import.meta.url));",
    ],
    [
      'execSync with a concatenated command',
      "import { execSync } from 'node:child_process';\nexecSync('node ' + script);",
    ],
    [
      'spawn handle escaping through promisify',
      "import { execFile } from 'node:child_process';\nimport { promisify } from 'node:util';\nconst run = promisify(execFile);",
    ],
    [
      'non-static argument to a command outside the reviewed non-runner list',
      "import { spawnSync } from 'node:child_process';\nspawnSync('bash', [script]);",
    ],
    [
      'undecodable percent-encoding in a specifier',
      "import '../../cur%ZZtion/src/inversions.js';",
    ],
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

  it('package.json control: a script invoking curation is flagged, percent-encoded too; honest scripts are not', () => {
    const violating = JSON.stringify({ scripts: { prebuild: 'node ../curation/src/inversions.js' } });
    expect(
      scanPackageJsonText('control/package.json', violating).some((finding) => finding.kind === 'curation-import'),
    ).toBe(true);
    const encoded = JSON.stringify({ scripts: { prebuild: 'node ../cur%61tion/src/inversions.js' } });
    expect(
      scanPackageJsonText('control/package.json', encoded).some((finding) => finding.kind === 'curation-import'),
    ).toBe(true);
    const honest = JSON.stringify({ scripts: { build: 'tsc', test: 'vitest run', 'build:artifact': 'node --max-old-space-size=8192 ../node_modules/.bin/tsx src/buildArtifact.ts' } });
    expect(scanPackageJsonText('control/package.json', honest)).toEqual([]);
  });

  it('symlink control: links into curation or out of the tree are flagged; benign in-tree links are not followed (round-3)', () => {
    // NB: the temp prefix must not itself contain the curation segment, or
    // every realpath under it would match.
    const dir = mkdtempSync(join(tmpdir(), 'boundary-symlink-'));
    try {
      mkdirSync(join(dir, 'pkg', 'src'), { recursive: true });
      mkdirSync(join(dir, 'curation', 'src'), { recursive: true });
      mkdirSync(join(dir, 'elsewhere'), { recursive: true });
      writeFileSync(join(dir, 'curation', 'src', 'inversions.ts'), 'export {};\n');
      writeFileSync(join(dir, 'elsewhere', 'other.ts'), 'export {};\n');
      writeFileSync(join(dir, 'pkg', 'src', 'real.ts'), 'export {};\n');
      symlinkSync(join('..', '..', 'curation', 'src', 'inversions.ts'), join(dir, 'pkg', 'src', 'tool.ts'));
      symlinkSync(join('..', '..', 'elsewhere', 'other.ts'), join(dir, 'pkg', 'src', 'vendored.ts'));
      symlinkSync('real.ts', join(dir, 'pkg', 'src', 'alias.ts'));
      const findings = symlinkFindingsUnder(join(dir, 'pkg'), []);
      expect(
        findings.some((finding) => finding.kind === 'curation-import' && finding.detail.includes('tool.ts')),
        'the curation-target symlink must be a violation',
      ).toBe(true);
      expect(
        findings.some((finding) => finding.kind === 'non-static-specifier' && finding.detail.includes('vendored.ts')),
        'the out-of-tree symlink must be flagged as indeterminate',
      ).toBe(true);
      expect(findings.some((finding) => finding.detail.includes('alias.ts'))).toBe(false);
      // And the source walk never follows a link — the symlinked "source
      // files" are absent from the scan set, present only as symlinks.
      const files = sourceFilesUnder(join(dir, 'pkg'), []);
      expect(files).toEqual([join(dir, 'pkg', 'src', 'real.ts')]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('witness: buildArtifact.ts unzip subprocess is proven clean by the scan, not exempted from it', () => {
    const file = join(REPO_ROOT, 'pipeline', 'src', 'buildArtifact.ts');
    const contents = readFileSync(file, 'utf8');
    // The idiomatic call is really there (round-3 critique's exhibit)...
    expect(contents).toContain("execFileSync('unzip'");
    // ...and the raw scan — no allowlist involved — finds nothing to flag:
    // static non-runner command, static args curation-free.
    expect(scanSourceText(file, contents)).toEqual([]);
  });

  it('witness: buildCandidate.test.ts yields exactly the one allowlisted promisify(execFile) finding', () => {
    const file = join(REPO_ROOT, 'pipeline', 'test', 'buildCandidate.test.ts');
    const raw = scanSourceText(file, readFileSync(file, 'utf8'));
    // The raw scan sees exactly one indeterminate site — the escaped
    // handle the allowlist entry reviews. Any new dynamic use in that file
    // adds a finding and fails this pin.
    expect(raw.map((finding) => finding.kind)).toEqual(['non-static-specifier']);
    expect(raw[0]!.detail).toContain('promisify(execFile)');
    // With the allowlist applied the file is clean.
    expect(boundaryFindingsIn(file)).toEqual([]);
  });

  it('the non-static allowlist requires a written reason and a site match, and only suppresses non-static findings', () => {
    for (const entry of NON_STATIC_ALLOWLIST) {
      expect(entry.reason.trim(), `${entry.file} allowlisted without a reason`).not.toBe('');
      expect(entry.match.trim(), `${entry.file} allowlisted without a site match`).not.toBe('');
    }
    // Mechanism check with a synthetic allowlist: an allowlisted file's
    // non-static finding is suppressed only when the site matches; a
    // curation-import never is.
    const dir = mkdtempSync(join(tmpdir(), 'curation-boundary-allowlist-'));
    try {
      const dynamicFile = join(dir, 'dynamic.ts');
      writeFileSync(dynamicFile, 'const m = await import(moduleName);\n');
      const rel = relative(REPO_ROOT, dynamicFile).split(sep).join('/');
      expect(boundaryFindingsIn(dynamicFile, [])).not.toEqual([]);
      expect(
        boundaryFindingsIn(dynamicFile, [{ file: rel, match: 'import(moduleName)', reason: 'synthetic mechanism check' }]),
      ).toEqual([]);
      // A mismatched site substring must NOT suppress — entries are scoped
      // to the exact reviewed call, not to the whole file.
      expect(
        boundaryFindingsIn(dynamicFile, [{ file: rel, match: 'someOtherCall(x)', reason: 'wrong site' }]),
      ).not.toEqual([]);
      const violatingFile = join(dir, 'violating.ts');
      writeFileSync(violatingFile, "import '../../curation/src/inversions.js';\n");
      const relViolating = relative(REPO_ROOT, violatingFile).split(sep).join('/');
      expect(
        boundaryFindingsIn(violatingFile, [
          { file: relViolating, match: 'curation/src/inversions.js', reason: 'must not suppress this' },
        ]),
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

  it('positive control counterpart: honest subprocess forms are not flagged', () => {
    const allowed = [
      "import { execFileSync, fork } from 'node:child_process';",
      // The build path's idiom: static non-runner command, variable temp
      // paths — proven clean by the rule, not exempted (buildArtifact.ts).
      "execFileSync('unzip', ['-o', '-q', zipPath, '-d', dir]);",
      // A JS runner with fully static, curation-free args passes too.
      "execFileSync('node', ['./scripts/clean.js']);",
      "fork('./scripts/reindex.js');",
      // Regex and sqlite `.exec` share a NAME with child_process.exec but
      // are not its binding — they must never be flagged.
      'const match = /a(b)/.exec(line);',
      "database.exec('BEGIN');",
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
