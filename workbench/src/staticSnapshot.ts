import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

export const STATIC_PROTOCOL_VERSION = 1 as const;
export const STATIC_SNAPSHOT_SCHEMA = 'scripture-workbench/static-snapshot/v1' as const;

const MANIFEST_PREFIX = 'workbench-static-snapshot:';
const REQUIRED_INLINE_ROUTES = [
  '/api/v2/health',
  '/api/v2/cases',
  '/api/v2/inbox',
  '/api/v2/judgments',
  '/api/v2/compile/preview',
  '/api/v2/compile/apply',
  '/api/v2/checks',
  '/api/v2/context',
  '/api/v2/jobs/',
  '/api/v2/candidates',
  '/api/v2/sessions',
  '/api/v2/quality',
  '/api/v2/audits/preview',
  '/api/v2/audits/apply',
  '/api/v2/audits/close',
  '/complete-item',
  '/skip-item',
  '/complete-session',
  '/blind-sessions',
  '/missing-passages',
  '/passages',
  '/promotion/preview',
  '/promotion/apply',
  '/cancel',
  '/api/v2/updates',
  '/api/v2/updates/cards/',
  '/decide',
  '/api/v2/updates/train',
  '/api/v2/admissions/',
  '/admit',
  '/api/v2/publish/',
  '/prepare',
] as const;

export type StaticSnapshotIssueCode =
  | 'static_snapshot_missing'
  | 'static_snapshot_incompatible'
  | 'static_snapshot_stale';

export class StaticSnapshotError extends Error {
  constructor(
    readonly code: StaticSnapshotIssueCode,
    message: string,
    readonly details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = 'StaticSnapshotError';
  }
}

interface StaticModuleManifest {
  readonly path: string;
  readonly sha256: string;
}

interface HtmlElementToken {
  readonly name: string;
  readonly attributes: ReadonlyMap<string, string | null>;
  readonly content: string;
}

interface HtmlSnapshotTokens {
  readonly comments: readonly string[];
  readonly scripts: readonly HtmlElementToken[];
  readonly metas: readonly HtmlElementToken[];
}

interface StaticSnapshotManifest {
  readonly schema: typeof STATIC_SNAPSHOT_SCHEMA;
  readonly protocolVersion: typeof STATIC_PROTOCOL_VERSION;
  readonly snapshotId: string;
  readonly modules: readonly StaticModuleManifest[];
}

export interface StaticAsset {
  readonly body: Buffer;
  readonly contentType: string;
  readonly sha256: string;
}

export interface StaticSnapshot {
  readonly schema: typeof STATIC_SNAPSHOT_SCHEMA;
  readonly protocolVersion: typeof STATIC_PROTOCOL_VERSION;
  readonly snapshotId: string;
  readonly mode: 'single-inline' | 'manifest';
  readonly assets: ReadonlyMap<string, StaticAsset>;
}

function sha256(input: Buffer | string): string {
  return createHash('sha256').update(input).digest('hex');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalModulePath(value: unknown): string | null {
  if (typeof value !== 'string' || value === '' || value.includes('\\') || value.includes('?') || value.includes('#')) {
    return null;
  }
  if (value.startsWith('/') || path.posix.normalize(value) !== value || value.split('/').includes('..')) return null;
  if (value.startsWith('api/') || (!value.endsWith('.js') && !value.endsWith('.mjs'))) return null;
  return value;
}

function parseManifest(raw: string): StaticSnapshotManifest {
  let value: unknown;
  try {
    value = JSON.parse(raw.trim()) as unknown;
  } catch {
    throw new StaticSnapshotError('static_snapshot_incompatible', 'Static snapshot manifest is not valid JSON.');
  }
  if (!isRecord(value)) {
    throw new StaticSnapshotError('static_snapshot_incompatible', 'Static snapshot manifest must be an object.');
  }
  const allowed = new Set(['schema', 'protocolVersion', 'snapshotId', 'modules']);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new StaticSnapshotError('static_snapshot_incompatible', 'Static snapshot manifest has unknown fields.');
  }
  if (value.schema !== STATIC_SNAPSHOT_SCHEMA || value.protocolVersion !== STATIC_PROTOCOL_VERSION) {
    throw new StaticSnapshotError(
      'static_snapshot_incompatible',
      `Static snapshot protocol is incompatible; expected ${STATIC_SNAPSHOT_SCHEMA} protocol ${STATIC_PROTOCOL_VERSION}.`,
      { foundSchema: value.schema ?? null, foundProtocolVersion: value.protocolVersion ?? null },
    );
  }
  if (typeof value.snapshotId !== 'string' || !/^[a-z0-9][a-z0-9._-]{0,127}$/.test(value.snapshotId)) {
    throw new StaticSnapshotError('static_snapshot_incompatible', 'Static snapshotId is invalid.');
  }
  if (!Array.isArray(value.modules)) {
    throw new StaticSnapshotError('static_snapshot_incompatible', 'Static snapshot modules must be an array.');
  }
  const seen = new Set<string>();
  const modules = value.modules.map((candidate, index) => {
    if (!isRecord(candidate) || Object.keys(candidate).some((key) => key !== 'path' && key !== 'sha256')) {
      throw new StaticSnapshotError('static_snapshot_incompatible', `Static module ${index + 1} is malformed.`);
    }
    const modulePath = canonicalModulePath(candidate.path);
    if (modulePath === null || !/^[a-f0-9]{64}$/.test(String(candidate.sha256))) {
      throw new StaticSnapshotError('static_snapshot_incompatible', `Static module ${index + 1} has an invalid path or digest.`);
    }
    if (seen.has(modulePath)) {
      throw new StaticSnapshotError('static_snapshot_incompatible', `Static module path "${modulePath}" is duplicated.`);
    }
    seen.add(modulePath);
    return { path: modulePath, sha256: String(candidate.sha256) };
  });
  return { schema: STATIC_SNAPSHOT_SCHEMA, protocolVersion: STATIC_PROTOCOL_VERSION, snapshotId: value.snapshotId, modules };
}

function htmlFailure(message: string): never {
  throw new StaticSnapshotError('static_snapshot_incompatible', message);
}

function isHtmlWhitespace(value: string | undefined): boolean {
  return value !== undefined && (value === '\t' || value === '\n' || value === '\f' || value === '\r' || value === ' ');
}

function tagEnd(html: string, start: number): number {
  let quote: '"' | "'" | null = null;
  for (let index = start; index < html.length; index += 1) {
    const character = html[index]!;
    if (quote !== null) {
      if (character === quote) quote = null;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '>') {
      return index;
    }
  }
  return htmlFailure('Static HTML contains an unterminated tag.');
}

function parseTag(tag: string): { readonly name: string; readonly attributes: ReadonlyMap<string, string | null> } {
  let index = 0;
  while (isHtmlWhitespace(tag[index])) index += 1;
  const nameMatch = /^[A-Za-z][A-Za-z0-9:-]*/.exec(tag.slice(index));
  if (nameMatch === null) return htmlFailure('Static HTML contains a malformed tag name.');
  const name = nameMatch[0].toLowerCase();
  index += nameMatch[0].length;
  const attributes = new Map<string, string | null>();
  while (index < tag.length) {
    while (isHtmlWhitespace(tag[index])) index += 1;
    if (index >= tag.length) break;
    if (tag[index] === '/') {
      index += 1;
      continue;
    }
    const attributeMatch = /^[^\t\n\f\r =/>]+/.exec(tag.slice(index));
    if (attributeMatch === null) return htmlFailure(`Static <${name}> contains malformed attributes.`);
    const attributeName = attributeMatch[0].toLowerCase();
    if (attributes.has(attributeName)) return htmlFailure(`Static <${name}> duplicates attribute ${attributeName}.`);
    index += attributeMatch[0].length;
    while (isHtmlWhitespace(tag[index])) index += 1;
    let value: string | null = null;
    if (tag[index] === '=') {
      index += 1;
      while (isHtmlWhitespace(tag[index])) index += 1;
      const quote = tag[index];
      if (quote === '"' || quote === "'") {
        const end = tag.indexOf(quote, index + 1);
        if (end < 0) return htmlFailure(`Static <${name}> contains an unterminated quoted attribute.`);
        value = tag.slice(index + 1, end);
        index = end + 1;
      } else {
        const valueMatch = /^[^\t\n\f\r />]+/.exec(tag.slice(index));
        if (valueMatch === null) return htmlFailure(`Static <${name}> contains an empty attribute value.`);
        value = valueMatch[0];
        index += valueMatch[0].length;
      }
    }
    attributes.set(attributeName, value);
  }
  return { name, attributes };
}

function rawClosingTag(html: string, name: string, start: number): { readonly index: number; readonly end: number } | null {
  const lower = html.toLowerCase();
  const prefix = `</${name.toLowerCase()}`;
  let cursor = start;
  while (true) {
    const index = lower.indexOf(prefix, cursor);
    if (index < 0) return null;
    const delimiter = html[index + prefix.length];
    if (delimiter === undefined || delimiter === '>' || delimiter === '/' || isHtmlWhitespace(delimiter)) {
      return { index, end: tagEnd(html, index + prefix.length) + 1 };
    }
    cursor = index + prefix.length;
  }
}

function tokenizeSnapshotHtml(html: string): HtmlSnapshotTokens {
  const comments: string[] = [];
  const scripts: HtmlElementToken[] = [];
  const metas: HtmlElementToken[] = [];
  const rawTextElements = new Set(['style', 'textarea', 'title', 'xmp', 'noembed', 'noframes', 'noscript']);
  const activeDocumentElements = new Set([
    'applet', 'base', 'embed', 'fencedframe', 'frame', 'frameset', 'iframe', 'object', 'portal',
  ]);
  const securitySensitiveAttributes = new Set([
    'action', 'archive', 'background', 'cite', 'code', 'codebase', 'data', 'formaction', 'href',
    'http-equiv', 'icon', 'longdesc', 'manifest', 'ping', 'poster', 'profile', 'rel', 'src',
    'srcset', 'usemap', 'xlink:href',
  ]);
  const foreignIntegrationPoints = new Set(['foreignobject', 'desc', 'title', 'annotation-xml', 'mi', 'mo', 'mn', 'ms', 'mtext']);
  let templateDepth = 0;
  const foreignElements: string[] = [];
  let index = 0;
  while (index < html.length) {
    const opening = html.indexOf('<', index);
    if (opening < 0) break;
    if (html.startsWith('<!--', opening)) {
      if (html.startsWith('<!-->', opening) || html.startsWith('<!--->', opening)) {
        comments.push('');
        index = opening + (html.startsWith('<!--->', opening) ? 6 : 5);
        continue;
      }
      const canonicalEnd = html.indexOf('-->', opening + 4);
      const bangEnd = html.indexOf('--!>', opening + 4);
      const end = canonicalEnd < 0 ? bangEnd : bangEnd < 0 ? canonicalEnd : Math.min(canonicalEnd, bangEnd);
      if (end < 0) return htmlFailure('Static HTML contains an unterminated comment.');
      comments.push(html.slice(opening + 4, end));
      index = end + (html.startsWith('--!>', end) ? 4 : 3);
      continue;
    }
    if (html.startsWith('</', opening)) {
      const end = tagEnd(html, opening + 2);
      const closingName = /^[\t\n\f\r ]*([A-Za-z][A-Za-z0-9:-]*)/.exec(html.slice(opening + 2, end))?.[1]?.toLowerCase();
      if (closingName === 'template' && templateDepth > 0) templateDepth -= 1;
      if (closingName === 'svg' || closingName === 'math') {
        if (foreignElements.at(-1) !== closingName) return htmlFailure(`Static HTML mismatches foreign closing element </${closingName}>.`);
        foreignElements.pop();
      }
      index = end + 1;
      continue;
    }
    if (html.startsWith('<!', opening) || html.startsWith('<?', opening)) {
      index = tagEnd(html, opening + 2) + 1;
      continue;
    }
    const end = tagEnd(html, opening + 1);
    const parsed = parseTag(html.slice(opening + 1, end));
    if (activeDocumentElements.has(parsed.name)) {
      return htmlFailure(`Static HTML active document element <${parsed.name}> is not supported.`);
    }
    for (const [attribute, value] of parsed.attributes) {
      if (attribute.startsWith('on') || attribute === 'srcdoc') {
        return htmlFailure(`Static HTML executable attribute ${attribute} is not supported.`);
      }
      if (value?.includes('&') && securitySensitiveAttributes.has(attribute)) {
        return htmlFailure(`Static HTML character references in security-sensitive attribute ${attribute} are not supported.`);
      }
      const compactValue = (value ?? '').replace(/[\u0000-\u0020]/g, '').toLowerCase();
      if (compactValue.startsWith('javascript:')) {
        return htmlFailure(`Static HTML javascript URL in ${attribute} is not supported.`);
      }
    }
    if (parsed.name === 'meta' && parsed.attributes.get('http-equiv')?.trim().toLowerCase() === 'refresh') {
      return htmlFailure('Static HTML refresh directives are not supported.');
    }
    if (parsed.name === 'link' && parsed.attributes.get('rel')?.split(/[\t\n\f\r ]+/).some((value) => value.toLowerCase() === 'import')) {
      return htmlFailure('Static HTML imports are not supported.');
    }
    if (foreignElements.length > 0 && foreignIntegrationPoints.has(parsed.name)) {
      return htmlFailure(`Static HTML foreign integration point <${parsed.name}> is not supported.`);
    }
    if (foreignElements.length > 0 && rawTextElements.has(parsed.name)) {
      return htmlFailure(`Static HTML raw-text-like element <${parsed.name}> inside SVG or MathML is not supported.`);
    }
    if (parsed.name === 'template') {
      templateDepth += 1;
      index = end + 1;
      continue;
    }
    if (parsed.name === 'plaintext') {
      index = html.length;
      continue;
    }
    if (parsed.name === 'svg' || parsed.name === 'math') {
      foreignElements.push(parsed.name);
      index = end + 1;
      continue;
    }
    if (parsed.name === 'script') {
      if (foreignElements.length > 0) return htmlFailure('Static HTML scripts in SVG or MathML are not supported.');
      const closing = rawClosingTag(html, 'script', end + 1);
      if (closing === null) return htmlFailure('Static HTML contains an unterminated script element.');
      if (templateDepth === 0) scripts.push({ ...parsed, content: html.slice(end + 1, closing.index) });
      index = closing.end;
      continue;
    }
    if (rawTextElements.has(parsed.name)) {
      const closing = rawClosingTag(html, parsed.name, end + 1);
      if (closing === null) return htmlFailure(`Static HTML contains an unterminated ${parsed.name} element.`);
      index = closing.end;
      continue;
    }
    if (parsed.name === 'meta' && templateDepth === 0 && foreignElements.length === 0) metas.push({ ...parsed, content: '' });
    index = end + 1;
  }
  if (foreignElements.length > 0) return htmlFailure(`Static HTML leaves foreign element <${foreignElements.at(-1)}> unclosed.`);
  return { comments, scripts, metas };
}

function parseJavaScript(source: string, label: string): ts.SourceFile {
  const sourceFile = ts.createSourceFile(label, source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS);
  const diagnostics = (sourceFile as ts.SourceFile & { readonly parseDiagnostics?: readonly ts.Diagnostic[] }).parseDiagnostics ?? [];
  if (diagnostics.length > 0) {
    throw new StaticSnapshotError(
      'static_snapshot_incompatible',
      `${label} contains invalid JavaScript: ${ts.flattenDiagnosticMessageText(diagnostics[0]!.messageText, ' ')}`,
    );
  }
  return sourceFile;
}

function moduleDependencies(source: string): readonly string[] {
  const sourceFile = parseJavaScript(source, 'Static module');
  const dependencies: string[] = [];
  const visit = (node: ts.Node): void => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier !== undefined) {
      if (!ts.isStringLiteral(node.moduleSpecifier)) {
        throw new StaticSnapshotError('static_snapshot_incompatible', 'Static module dependencies must be string literals.');
      }
      dependencies.push(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const argument = node.arguments[0];
      if (node.arguments.length !== 1 || argument === undefined || (!ts.isStringLiteral(argument) && !ts.isNoSubstitutionTemplateLiteral(argument))) {
        throw new StaticSnapshotError(
          'static_snapshot_incompatible',
          'Static modules may use only literal dynamic imports declared by the snapshot.',
        );
      }
      dependencies.push(argument.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return dependencies;
}

function scriptLiteralFragments(source: string): readonly string[] {
  const sourceFile = parseJavaScript(source, 'Legacy inline script');
  const fragments: string[] = [];
  const literalKinds = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.StringLiteral,
    ts.SyntaxKind.NoSubstitutionTemplateLiteral,
    ts.SyntaxKind.TemplateHead,
    ts.SyntaxKind.TemplateMiddle,
    ts.SyntaxKind.TemplateTail,
  ]);
  const visit = (node: ts.Node): void => {
    if (literalKinds.has(node.kind) && 'text' in node && typeof node.text === 'string') fragments.push(node.text);
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return fragments;
}

function resolveModuleDependency(owner: string, dependency: string): string | null {
  if (dependency.startsWith('/')) return canonicalModulePath(dependency.slice(1));
  if (!dependency.startsWith('.')) return null;
  return canonicalModulePath(path.posix.normalize(path.posix.join(path.posix.dirname(owner), dependency)));
}

function contentTypeFor(modulePath: string): string {
  if (modulePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (modulePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'text/javascript; charset=utf-8';
}

function readFailure(error: unknown, targetPath: string): StaticSnapshotError {
  const code = (error as NodeJS.ErrnoException).code;
  if (code === 'ENOENT') {
    return new StaticSnapshotError(
      'static_snapshot_missing',
      `Workbench static asset is missing: ${targetPath}.`,
      { path: targetPath },
    );
  }
  return new StaticSnapshotError(
    'static_snapshot_stale',
    `Workbench static asset could not be read: ${targetPath}.`,
    { path: targetPath, cause: error instanceof Error ? error.message : 'unknown error' },
  );
}

/** Reads every asset before returning, so requests can never observe a mixed checkout. */
export async function resolveStaticSnapshot(pagePath: string): Promise<StaticSnapshot> {
  let page: Buffer;
  try {
    page = await readFile(pagePath);
  } catch (error) {
    throw readFailure(error, pagePath);
  }
  const html = page.toString('utf8');
  if (!/^<!doctype html>/i.test(html.trimStart()) || !/<html\b/i.test(html) || !/<\/html>/i.test(html)) {
    throw new StaticSnapshotError('static_snapshot_incompatible', 'Workbench static page is not a complete HTML document.');
  }

  const tokens = tokenizeSnapshotHtml(html);
  const manifestComments = tokens.comments
    .map((comment) => comment.trim())
    .filter((comment) => comment.startsWith(MANIFEST_PREFIX));
  if (manifestComments.length > 1) {
    throw new StaticSnapshotError('static_snapshot_incompatible', 'Static HTML contains more than one snapshot manifest.');
  }
  const manifestPayload = manifestComments[0]?.slice(MANIFEST_PREFIX.length);
  const externalScripts = tokens.scripts.filter((script) => script.attributes.has('src'));
  const sources = externalScripts.map((script) => {
    const source = script.attributes.get('src');
    if (source === null || source === undefined) return htmlFailure('Static script src must have a value.');
    return source;
  });
  if (manifestPayload === undefined) {
    if (externalScripts.length > 0) {
      throw new StaticSnapshotError(
        'static_snapshot_incompatible',
        'An unversioned static page may contain inline scripts only.',
        { scriptSources: sources },
      );
    }
    const inlineSource = tokens.scripts.map((script) => script.content).join('\n');
    const literalFragments = scriptLiteralFragments(inlineSource);
    const missingRoutes = REQUIRED_INLINE_ROUTES.filter((route) => !literalFragments.some((fragment) => fragment.includes(route)));
    const protocolMarker = tokens.metas.some((meta) =>
      meta.attributes.size === 2
      && meta.attributes.get('name') === 'workbench-static-protocol'
      && meta.attributes.get('content') === String(STATIC_PROTOCOL_VERSION),
    );
    if (!protocolMarker || inlineSource.trim() === '' || missingRoutes.length > 0) {
      throw new StaticSnapshotError(
        'static_snapshot_stale',
        'Legacy inline static page does not match the current server protocol.',
        { missingRoutes },
      );
    }
    const digest = sha256(page);
    return {
      schema: STATIC_SNAPSHOT_SCHEMA,
      protocolVersion: STATIC_PROTOCOL_VERSION,
      snapshotId: `inline-v1-${digest.slice(0, 16)}`,
      mode: 'single-inline',
      assets: new Map([['/', { body: page, contentType: 'text/html; charset=utf-8', sha256: digest }]]),
    };
  }

  const manifest = parseManifest(manifestPayload);
  const expectedSources = manifest.modules.map((module) => `/${module.path}`);
  const scriptTagCount = tokens.scripts.length;
  if (
    scriptTagCount !== sources.length ||
    sources.length !== expectedSources.length ||
    sources.some((source, index) => source !== expectedSources[index]) ||
    externalScripts.some((script) => script.attributes.get('type') !== 'module')
  ) {
    throw new StaticSnapshotError(
      'static_snapshot_incompatible',
      'HTML scripts do not exactly match the static snapshot manifest.',
      { expectedSources, foundSources: sources, scriptTagCount },
    );
  }

  const assets = new Map<string, StaticAsset>();
  assets.set('/', { body: page, contentType: 'text/html; charset=utf-8', sha256: sha256(page) });
  let snapshotRoot: string;
  try {
    snapshotRoot = path.dirname(await realpath(pagePath));
  } catch (error) {
    throw readFailure(error, pagePath);
  }
  for (const module of manifest.modules) {
    const modulePath = path.join(path.dirname(pagePath), ...module.path.split('/'));
    let body: Buffer;
    try {
      const resolvedModulePath = await realpath(modulePath);
      const relativePath = path.relative(snapshotRoot, resolvedModulePath);
      if (relativePath.startsWith(`..${path.sep}`) || relativePath === '..' || path.isAbsolute(relativePath)) {
        throw new StaticSnapshotError(
          'static_snapshot_incompatible',
          `Static module escapes the snapshot directory: ${module.path}.`,
          { path: module.path },
        );
      }
      body = await readFile(modulePath);
    } catch (error) {
      if (error instanceof StaticSnapshotError) throw error;
      throw readFailure(error, modulePath);
    }
    const actual = sha256(body);
    if (actual !== module.sha256) {
      throw new StaticSnapshotError(
        'static_snapshot_stale',
        `Static module digest mismatch for ${module.path}.`,
        { path: module.path, expectedSha256: module.sha256, actualSha256: actual },
      );
    }
    assets.set(`/${module.path}`, { body, contentType: contentTypeFor(module.path), sha256: actual });
  }
  const declared = new Set(manifest.modules.map((module) => module.path));
  for (const module of manifest.modules) {
    const source = assets.get(`/${module.path}`)!.body.toString('utf8');
    for (const dependency of moduleDependencies(source)) {
      const resolved = resolveModuleDependency(module.path, dependency);
      if (resolved === null || !declared.has(resolved)) {
        throw new StaticSnapshotError(
          'static_snapshot_incompatible',
          `Static module ${module.path} imports an undeclared or nonlocal asset ${resolved ?? dependency}.`,
          { owner: module.path, dependency, resolved },
        );
      }
    }
  }
  return { ...manifest, mode: 'manifest', assets };
}
