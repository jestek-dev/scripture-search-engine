import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  STATIC_SNAPSHOT_SCHEMA,
  StaticSnapshotError,
  resolveStaticSnapshot,
} from '../src/staticSnapshot.js';

const directories: string[] = [];
const routes = [
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
];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function fixtureDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'sse-static-snapshot-'));
  directories.push(directory);
  return directory;
}

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function inlineHtml(script = routes.map((route) => JSON.stringify(route)).join(';')): string {
  return `<!doctype html><html><head><meta name="workbench-static-protocol" content="1"></head><body><script>${script}</script></body></html>`;
}

function manifestHtml(
  modules: readonly { readonly path: string; readonly sha256: string }[],
  sources: readonly string[] = modules.map((module) => `/${module.path}`),
  overrides: Readonly<Record<string, unknown>> = {},
): string {
  const manifest = {
    schema: STATIC_SNAPSHOT_SCHEMA,
    protocolVersion: 1,
    snapshotId: 'test-snapshot',
    modules,
    ...overrides,
  };
  return `<!doctype html><html><body><!-- workbench-static-snapshot:${JSON.stringify(manifest)} -->${sources.map((source) => `<script type="module" src="${source}"></script>`).join('')}</body></html>`;
}

async function expectCode(pagePath: string, code: StaticSnapshotError['code']): Promise<void> {
  await expect(resolveStaticSnapshot(pagePath)).rejects.toMatchObject({ code });
}

describe('safe static snapshot resolver', () => {
  it('accepts the current single-file shape as a versioned immutable snapshot', async () => {
    const directory = await fixtureDirectory();
    const pagePath = path.join(directory, 'index.html');
    await writeFile(pagePath, inlineHtml());

    const snapshot = await resolveStaticSnapshot(pagePath);

    expect(snapshot).toMatchObject({ schema: STATIC_SNAPSHOT_SCHEMA, protocolVersion: 1, mode: 'single-inline' });
    expect(snapshot.snapshotId).toMatch(/^inline-v1-[a-f0-9]{16}$/);
    expect(snapshot.assets.get('/')?.body.toString()).toBe(inlineHtml());
    expect(snapshot.assets.size).toBe(1);
  });

  it.each([
    ['missing page', 'missing.html', 'static_snapshot_missing'],
    ['incomplete HTML', 'index.html', 'static_snapshot_incompatible'],
  ] as const)('rejects a %s', async (_label, file, code) => {
    const directory = await fixtureDirectory();
    const pagePath = path.join(directory, file);
    if (file === 'index.html') await writeFile(pagePath, '<html>truncated');
    await expectCode(pagePath, code);
  });

  it('rejects stale legacy pages and unversioned external scripts', async () => {
    const directory = await fixtureDirectory();
    const stale = path.join(directory, 'stale.html');
    const split = path.join(directory, 'split.html');
    await writeFile(stale, inlineHtml(JSON.stringify('/api/v2/health')));
    await writeFile(split, '<!doctype html><html><body><script src="/app.js"></script></body></html>');

    await expectCode(stale, 'static_snapshot_stale');
    await expectCode(split, 'static_snapshot_incompatible');
  });

  it('rejects protocol-route strings hidden in comments instead of executable inline code', async () => {
    const directory = await fixtureDirectory();
    const page = path.join(directory, 'comment-spoof.html');
    await writeFile(
      page,
      `<!doctype html><html><body><!-- <meta name="workbench-static-protocol" content="1"><script>${routes.join(';')}</script> --><script>void 0</script></body></html>`,
    );

    await expectCode(page, 'static_snapshot_stale');
  });

  it('rejects required routes present only in JavaScript comments', async () => {
    const directory = await fixtureDirectory();
    const page = path.join(directory, 'javascript-comment-spoof.html');
    await writeFile(page, inlineHtml(`/* ${routes.join(';')} */ const harmless = 'ready';`));

    await expectCode(page, 'static_snapshot_stale');
  });

  it('loads a hash-pinned split snapshot completely and serves exact bytes', async () => {
    const directory = await fixtureDirectory();
    const app = 'export const app = true;\n';
    const helper = 'export const helper = 1;\n';
    const modules = [
      { path: 'assets/app.js', sha256: digest(app) },
      { path: 'assets/helper.js', sha256: digest(helper) },
    ];
    await writeFile(path.join(directory, 'index.html'), manifestHtml(modules));
    await mkdir(path.join(directory, 'assets'));
    await writeFile(path.join(directory, 'assets', 'app.js'), app);
    await writeFile(path.join(directory, 'assets', 'helper.js'), helper);

    const snapshot = await resolveStaticSnapshot(path.join(directory, 'index.html'));

    expect(snapshot).toMatchObject({ snapshotId: 'test-snapshot', mode: 'manifest' });
    expect(snapshot.assets.get('/assets/app.js')?.body.toString()).toBe(app);
    expect(snapshot.assets.get('/assets/helper.js')?.sha256).toBe(digest(helper));
    expect(snapshot.assets.size).toBe(3);
  });

  it('rejects hash-valid modules whose static or dynamic dependency is absent from the manifest', async () => {
    const directory = await fixtureDirectory();
    const app = `export async function load() { return import('./missing.js'); }\n`;
    await writeFile(path.join(directory, 'index.html'), manifestHtml([{ path: 'app.js', sha256: digest(app) }]));
    await writeFile(path.join(directory, 'app.js'), app);

    await expectCode(path.join(directory, 'index.html'), 'static_snapshot_incompatible');
  });

  it.each(['</script ignored>', '</script/>'] as const)('does not let browser-tolerated %s hide an undeclared script', async (closingTag) => {
    const directory = await fixtureDirectory();
    const app = 'globalThis.__staticSnapshotExecuted = true;\n';
    const validPage = manifestHtml([{ path: 'app.js', sha256: digest(app) }]);
    const page = validPage.replace(
      '<script type="module" src="/app.js"></script>',
      `<script type="module" src="/app.js">${closingTag}<script>globalThis.__extra = true;</script>`,
    );
    await writeFile(path.join(directory, 'index.html'), page);
    await writeFile(path.join(directory, 'app.js'), app);

    await expectCode(path.join(directory, 'index.html'), 'static_snapshot_incompatible');
  });

  it.each(['attribute-space', 'raw-close'] as const)('uses HTML ASCII whitespace rules for NBSP in %s markup', async (scenario) => {
    const directory = await fixtureDirectory();
    const app = 'globalThis.__staticSnapshotExecuted = true;\n';
    const validPage = manifestHtml([{ path: 'app.js', sha256: digest(app) }]);
    const script = '<script type="module" src="/app.js"></script>';
    const replacement = scenario === 'attribute-space'
      ? '<script type="module"\u00a0src="/app.js"></script>'
      : `<style></style\u00a0>${script}</style>`;
    await writeFile(path.join(directory, 'index.html'), validPage.replace(script, replacement));
    await writeFile(path.join(directory, 'app.js'), app);

    await expectCode(path.join(directory, 'index.html'), 'static_snapshot_incompatible');
  });

  it.each(['end-bang', 'abrupt-empty'] as const)('does not let browser-tolerated %s comments hide an undeclared script', async (scenario) => {
    const directory = await fixtureDirectory();
    const app = 'globalThis.__staticSnapshotExecuted = true;\n';
    const validPage = manifestHtml([{ path: 'app.js', sha256: digest(app) }]);
    const hidden = scenario === 'end-bang'
      ? '<!-- hidden --!><script>globalThis.__extra = true;</script>-->'
      : '<!--><script>globalThis.__extra = true;</script>-->';
    await writeFile(path.join(directory, 'index.html'), validPage.replace('<body>', `<body>${hidden}`));
    await writeFile(path.join(directory, 'app.js'), app);

    await expectCode(path.join(directory, 'index.html'), 'static_snapshot_incompatible');
  });

  it('does not let a slash before src hide an executable external script', async () => {
    const directory = await fixtureDirectory();
    const page = path.join(directory, 'slash-before-src.html');
    const routeLiterals = routes.map((route) => JSON.stringify(route)).join(';');
    await writeFile(
      page,
      `<!doctype html><html><head><meta name="workbench-static-protocol" content="1"></head><body><script/ src="data:text/javascript,window.__staticBypass%3D1">${routeLiterals}</script></body></html>`,
    );

    await expectCode(page, 'static_snapshot_incompatible');
  });

  it('fails closed on executable inline SVG scripts', async () => {
    const directory = await fixtureDirectory();
    const page = path.join(directory, 'svg-script.html');
    const routeLiterals = routes.map((route) => JSON.stringify(route)).join(';');
    await writeFile(
      page,
      `<!doctype html><html><head><meta name="workbench-static-protocol" content="1"></head><body><svg><script>globalThis.__svgExecuted=1</script></svg><script>${routeLiterals}</script></body></html>`,
    );

    await expectCode(page, 'static_snapshot_incompatible');
  });

  it.each([
    '<iframe srcdoc="&lt;script>parent.__iframeBypass=1&lt;/script>"></iframe>',
    '<img src="missing" onerror="globalThis.__eventBypass=1">',
    '<a href="java\nscript:globalThis.__urlBypass=1">run</a>',
    '<a href="java&#x0a;script:globalThis.__entityUrlBypass=1">run</a>',
    '<object data="data:text/html,&lt;script>parent.__objectBypass=1&lt;/script>"></object>',
    '<meta http-equiv="refresh" content="0;url=https://example.invalid/">',
    '<meta http-equiv="ref&#x72;esh" content="0;url=/meta-target">',
    '<link rel="import" href="data:text/html,&lt;script>globalThis.__importBypass=1&lt;/script>">',
  ])('fails closed on unmanifested active HTML content', async (activeMarkup) => {
    const directory = await fixtureDirectory();
    const page = path.join(directory, 'active-content.html');
    const routeLiterals = routes.map((route) => JSON.stringify(route)).join(';');
    await writeFile(
      page,
      `<!doctype html><html><head><meta name="workbench-static-protocol" content="1"></head><body>${activeMarkup}<script>${routeLiterals}</script></body></html>`,
    );

    await expectCode(page, 'static_snapshot_incompatible');
  });

  it.each([
    '<svg><foreignObject><script src="data:text/javascript,window.__foreignBypass%3D1"></script></foreignObject></svg>',
    '<math><annotation-xml encoding="text/html"><script src="data:text/javascript,window.__foreignBypass%3D1"></script></annotation-xml></math>',
  ])('fails closed on executable foreign integration point markup', async (foreignMarkup) => {
    const directory = await fixtureDirectory();
    const page = path.join(directory, 'foreign-integration.html');
    const routeLiterals = routes.map((route) => JSON.stringify(route)).join(';');
    await writeFile(
      page,
      `<!doctype html><html><head><meta name="workbench-static-protocol" content="1"></head><body>${foreignMarkup}<script>${routeLiterals}</script></body></html>`,
    );

    await expectCode(page, 'static_snapshot_incompatible');
  });

  it.each(['xmp', 'textarea', 'style', 'noembed', 'noframes', 'noscript']) (
    'fails closed when foreign <%s> contains an executable nested script',
    async (element) => {
      const directory = await fixtureDirectory();
      const page = path.join(directory, 'foreign-raw-text.html');
      const routeLiterals = routes.map((route) => JSON.stringify(route)).join(';');
      await writeFile(
        page,
        `<!doctype html><html><head><meta name="workbench-static-protocol" content="1"></head><body><svg><${element}><script>globalThis.__svgRawBypass=1</script></${element}></svg><script>${routeLiterals}</script></body></html>`,
      );

      await expectCode(page, 'static_snapshot_incompatible');
    },
  );

  it('rejects a remote static import without confusing URL slashes for a comment', async () => {
    const directory = await fixtureDirectory();
    const app = `import "https://example.invalid/remote.js";\nexport const localUrl = "https://example.invalid/value";\n`;
    await writeFile(path.join(directory, 'index.html'), manifestHtml([{ path: 'app.js', sha256: digest(app) }]));
    await writeFile(path.join(directory, 'app.js'), app);

    await expectCode(path.join(directory, 'index.html'), 'static_snapshot_incompatible');
  });

  it.each(['commented-out', 'data-src'] as const)('rejects a manifest module referenced by a %s script tag', async (scenario) => {
    const directory = await fixtureDirectory();
    const app = 'export const app = true;\n';
    const validPage = manifestHtml([{ path: 'app.js', sha256: digest(app) }]);
    const page = scenario === 'commented-out'
      ? validPage.replace('<script type="module" src="/app.js"></script>', '<!-- <script type="module" src="/app.js"></script> -->')
      : validPage.replace(' src="/app.js"', ' data-src="/app.js"');
    await writeFile(path.join(directory, 'index.html'), page);
    await writeFile(path.join(directory, 'app.js'), app);

    await expectCode(path.join(directory, 'index.html'), 'static_snapshot_incompatible');
  });

  it.each(['style', 'textarea', 'template'] as const)('rejects a manifest script hidden in inert <%s> context', async (element) => {
    const directory = await fixtureDirectory();
    const app = 'globalThis.__staticSnapshotExecuted = true;\n';
    const validPage = manifestHtml([{ path: 'app.js', sha256: digest(app) }]);
    const script = '<script type="module" src="/app.js"></script>';
    await writeFile(path.join(directory, 'index.html'), validPage.replace(script, `<${element}>${script}</${element}>`));
    await writeFile(path.join(directory, 'app.js'), app);

    await expectCode(path.join(directory, 'index.html'), 'static_snapshot_incompatible');
  });

  it.each(['plaintext', 'svg', 'math'] as const)('rejects a manifest script hidden in non-HTML <%s> execution context', async (element) => {
    const directory = await fixtureDirectory();
    const app = 'globalThis.__staticSnapshotExecuted = true;\n';
    const validPage = manifestHtml([{ path: 'app.js', sha256: digest(app) }]);
    const script = '<script type="module" src="/app.js"></script>';
    const wrapped = element === 'plaintext' ? `<plaintext>${script}` : `<${element}>${script}</${element}>`;
    await writeFile(path.join(directory, 'index.html'), validPage.replace(script, wrapped));
    await writeFile(path.join(directory, 'app.js'), app);

    await expectCode(path.join(directory, 'index.html'), 'static_snapshot_incompatible');
  });

  it.each([
    ['svg', 'math'],
    ['math', 'svg'],
  ] as const)('fails closed on mismatched <%s></%s> foreign namespace markup', async (opening, wrongClosing) => {
    const directory = await fixtureDirectory();
    const app = 'globalThis.__staticSnapshotExecuted = true;\n';
    const validPage = manifestHtml([{ path: 'app.js', sha256: digest(app) }]);
    const script = '<script type="module" src="/app.js"></script>';
    await writeFile(
      path.join(directory, 'index.html'),
      validPage.replace(script, `<${opening}></${wrongClosing}>${script}</${opening}>`),
    );
    await writeFile(path.join(directory, 'app.js'), app);

    await expectCode(path.join(directory, 'index.html'), 'static_snapshot_incompatible');
  });

  it('rejects a hash-valid module reached through a symlink outside the snapshot', async () => {
    const directory = await fixtureDirectory();
    const outside = await fixtureDirectory();
    const app = 'export const outside = true;\n';
    await writeFile(path.join(outside, 'app.js'), app);
    await symlink(outside, path.join(directory, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
    await writeFile(path.join(directory, 'index.html'), manifestHtml([{ path: 'linked/app.js', sha256: digest(app) }]));

    await expectCode(path.join(directory, 'index.html'), 'static_snapshot_incompatible');
  });

  it.each([
    ['missing module', 'static_snapshot_missing'],
    ['tampered module', 'static_snapshot_stale'],
    ['HTML/manifest disagreement', 'static_snapshot_incompatible'],
    ['protocol mismatch', 'static_snapshot_incompatible'],
    ['traversal path', 'static_snapshot_incompatible'],
    ['reserved API path', 'static_snapshot_incompatible'],
    ['duplicate module path', 'static_snapshot_incompatible'],
    ['extra inline script', 'static_snapshot_incompatible'],
  ] as const)('rejects %s without returning a partial snapshot', async (scenario, expectedCode) => {
    const directory = await fixtureDirectory();
    const app = 'export {};\n';
    let modules = [{ path: 'app.js', sha256: digest(app) }];
    let sources: readonly string[] | undefined;
    let overrides: Readonly<Record<string, unknown>> = {};
    if (scenario === 'tampered module') await writeFile(path.join(directory, 'app.js'), `${app}// changed`);
    if (scenario !== 'missing module' && scenario !== 'tampered module') await writeFile(path.join(directory, 'app.js'), app);
    if (scenario === 'HTML/manifest disagreement') sources = ['/other.js'];
    if (scenario === 'protocol mismatch') overrides = { protocolVersion: 2 };
    if (scenario === 'traversal path') modules = [{ path: '../app.js', sha256: digest(app) }];
    if (scenario === 'reserved API path') modules = [{ path: 'api/app.js', sha256: digest(app) }];
    if (scenario === 'duplicate module path') modules = [...modules, modules[0]!];
    const page = manifestHtml(modules, sources, overrides);
    await writeFile(
      path.join(directory, 'index.html'),
      scenario === 'extra inline script' ? page.replace('</body>', '<script>unsafe()</script></body>') : page,
    );

    await expectCode(path.join(directory, 'index.html'), expectedCode);
  });
});
