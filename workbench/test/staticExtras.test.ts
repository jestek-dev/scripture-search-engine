import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { loadSecondaryPages, writeSecondaryResponse, type SecondaryResolution } from '../src/secondaryPages.js';

// D3/D4 — the two additive static mechanisms (plan §4.2): secondary static
// pages / redirects, and the font route. Integration assertions run against
// a spawned server in degraded startup mode (missing artifact database), so
// "serves in degraded mode" is proven, not assumed.

const children: ChildProcess[] = [];
const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const child of children.splice(0)) child.kill();
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

// The route literals a single-inline page must carry (staticSnapshot.ts
// REQUIRED_INLINE_ROUTES), embedded in the synthetic fixture page.
const ROUTE_LITERALS = [
  '/api/v2/health', '/api/v2/cases', '/api/v2/inbox', '/api/v2/judgments',
  '/api/v2/compile/preview', '/api/v2/compile/apply', '/api/v2/checks',
  '/api/v2/context', '/api/v2/jobs/', '/api/v2/candidates', '/api/v2/sessions',
  '/api/v2/quality', '/api/v2/audits/preview', '/api/v2/audits/apply',
  '/api/v2/audits/close', '/complete-item', '/skip-item', '/complete-session',
  '/blind-sessions', '/missing-passages', '/passages', '/promotion/preview',
  '/promotion/apply', '/cancel',
];

function validInlinePage(marker: string): string {
  const literals = ROUTE_LITERALS.map((route) => JSON.stringify(route)).join(',');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">`
    + `<meta name="workbench-static-protocol" content="1"><title>${marker}</title></head>`
    + `<body><script>const ROUTES=[${literals}];console.log(ROUTES.length,${JSON.stringify(marker)});</script></body></html>`;
}

describe('secondary page table resolution', () => {
  it('loads valid files, drops missing/invalid ones, and always resolves redirects', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'sse-secondary-'));
    temporaryDirectories.push(root);
    writeFileSync(path.join(root, 'valid.html'), validInlinePage('valid-page'), 'utf8');
    writeFileSync(path.join(root, 'invalid.html'), '<!doctype html><html><body>no protocol marker</body></html>', 'utf8');

    const pages = await loadSecondaryPages(root, {
      '/study': 'valid.html',
      '/advanced': 'missing.html',
      '/broken': 'invalid.html',
      '/old-study': { redirect: '/' },
    });

    const study = pages.get('/study');
    expect(study?.kind).toBe('page');
    if (study?.kind === 'page') {
      expect(study.asset.body.toString('utf8')).toContain('valid-page');
      expect(study.asset.sha256).toMatch(/^[0-9a-f]{64}$/);
    }
    expect(pages.get('/advanced')).toBeUndefined();
    expect(pages.get('/broken')).toBeUndefined();
    expect(pages.get('/old-study')).toEqual({ kind: 'redirect', location: '/' });
  });

  it('answers a redirect entry with 302 and the mapped Location', () => {
    const headers: Record<string, unknown> = {};
    let status = 0;
    let ended = false;
    const response = {
      writeHead(code: number, values: Record<string, unknown>) {
        status = code;
        Object.assign(headers, values);
        return response;
      },
      end() { ended = true; },
    };
    const resolution: SecondaryResolution = { kind: 'redirect', location: '/' };
    writeSecondaryResponse(response as never, resolution);
    expect(status).toBe(302);
    expect(headers['location']).toBe('/');
    expect(ended).toBe(true);
  });
});

describe('degraded-mode static serving', () => {
  it('serves the flipped routes and fonts while startup is degraded: / = the Study, /advanced = the old console, /study = 302', async () => {
    const port = await unusedPort();
    await startDegradedServer(port);
    const origin = `http://127.0.0.1:${port}`;

    // Startup IS degraded (missing artifact database) — the routes below
    // must serve anyway — and no diagnostic mentions the secondary pages.
    const health = (await (await fetch(`${origin}/api/v2/health`)).json()) as {
      readonly data: { readonly startup: { readonly degraded: boolean; readonly diagnostics: readonly string[] } };
    };
    expect(health.data.startup.degraded).toBe(true);
    expect(health.data.startup.diagnostics.join(' ')).not.toContain('advanced');

    // D41: /study answers 302 → / (old bookmarks land on the new default).
    const study = await fetch(`${origin}/study`, { redirect: 'manual' });
    expect(study.status).toBe(302);
    expect(study.headers.get('location')).toBe('/');

    // D41: /advanced serves the preserved old console byte-identically,
    // with etag + nosniff.
    const advanced = await fetch(`${origin}/advanced`);
    expect(advanced.status).toBe(200);
    expect(advanced.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(advanced.headers.get('etag')).toMatch(/^"[0-9a-f]{64}"$/);
    expect(advanced.headers.get('x-content-type-options')).toBe('nosniff');
    const advancedBytes = Buffer.from(await advanced.arrayBuffer());
    expect(advancedBytes.equals(readFileSync(new URL('../static/advanced.html', import.meta.url)))).toBe(true);

    // D41: `/` serves the Study page (static/index.html) byte-identically.
    const defaultPage = await fetch(`${origin}/`);
    expect(defaultPage.status).toBe(200);
    const defaultBytes = Buffer.from(await defaultPage.arrayBuffer());
    expect(defaultBytes.equals(readFileSync(new URL('../static/index.html', import.meta.url)))).toBe(true);
    expect(defaultBytes.toString('utf8')).toContain('The Study');

    // D3: a known font serves with the woff2 content type, etag, nosniff.
    const font = await fetch(`${origin}/fonts/literata/Literata-Variable.woff2`);
    expect(font.status).toBe(200);
    expect(font.headers.get('content-type')).toBe('font/woff2');
    expect(font.headers.get('etag')).toMatch(/^"[0-9a-f]{64}"$/);
    expect(font.headers.get('cache-control')).toBe('no-cache');
    expect(font.headers.get('x-content-type-options')).toBe('nosniff');
    const fontBytes = Buffer.from(await font.arrayBuffer());
    expect(fontBytes.subarray(0, 4).toString('latin1')).toBe('wOF2');

    // D3: anything else under /fonts/ 404s.
    expect((await fetch(`${origin}/fonts/literata/nope.woff2`)).status).toBe(404);
    expect((await fetch(`${origin}/fonts/../etc/passwd`)).status).toBe(404);
  }, 30_000);
});

async function startDegradedServer(port: number): Promise<void> {
  const child = spawn(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
    cwd: new URL('../', import.meta.url),
    env: {
      ...process.env,
      WORKBENCH_PORT: String(port),
      WORKBENCH_DATABASE_PATH: path.join(os.tmpdir(), `sse-static-extras-missing-${process.pid}-${port}.db`),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  children.push(child);
  const deadline = Date.now() + 25_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/v2/health`);
      if (response.ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Degraded workbench server did not become ready.');
}

async function unusedPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      if (typeof address === 'object' && address !== null) {
        const { port } = address;
        probe.close(() => resolve(port));
      } else {
        probe.close(() => reject(new Error('No probe port.')));
      }
    });
  });
}
