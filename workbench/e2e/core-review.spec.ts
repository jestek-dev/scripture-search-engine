import http from 'node:http';
import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

const CASE_ID = '00000000-0000-4000-8000-000000000001';
const identity = {
  engineVersion: '0.9.0',
  corpusFingerprint: 'a'.repeat(64),
  layerFingerprint: 'b'.repeat(64),
};

let server: http.Server;
let origin: string;

test.beforeAll(async () => {
  const page = await readFile(new URL('../static/index.html', import.meta.url));
  server = http.createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(page);
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (typeof address !== 'object' || address === null) throw new Error('Browser fixture server did not bind.');
  origin = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('health to inbox to review, history, and exact changes preview', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  let caseState: 'new' | 'reviewing' = 'new';
  let created = false;
  const caseRecord = () => ({
    schemaVersion: 2,
    caseId: CASE_ID,
    query: 'hope while waiting',
    source: 'manual',
    state: caseState,
    reviewer: 'jesse',
    artifact: identity,
    events: [{ at: '2026-08-11T00:00:00.000Z' }],
  });
  const ok = (data: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data }) });

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === '/api/v2/health') {
      await route.fulfill(ok({
        status: 'healthy', descriptor: { alignment: 'aligned', identity, stale: null }, artifact: { identity, matchesDescriptor: true },
        golden: { active: 1, total: 1, pending: 0, generated: 0, generatedBy: {} },
        coverage: { active: 1, total: 1, pending: 0, uncovered: 0, stale: 0 },
        judgments: { effective: 0, total: 0, stale: 0 }, gauntlet: { status: 'healthy', verdict: 'ADMIT', summary: 'All gates pass.', reason: null, reportPath: 'eval/.runs/gauntlet-report.json' },
        git: { branch: 'main', state: 'main', dirty: false, aheadBy: 0, behindBy: 0 }, startup: { degraded: false, diagnostics: [], issues: [] }, signals: [],
      }));
      return;
    }
    if (url.pathname === '/api/v2/cases' && request.method() === 'GET') {
      await route.fulfill(ok({ cases: created ? [caseRecord()] : [] }));
      return;
    }
    if (url.pathname === '/api/v2/cases' && request.method() === 'POST') {
      created = true;
      await route.fulfill(ok({ case: caseRecord() }));
      return;
    }
    if (url.pathname === '/api/v2/inbox') {
      await route.fulfill(ok({ items: [] }));
      return;
    }
    if (url.pathname === '/api/v2/candidates') {
      await route.fulfill(ok({ reviews: [], readOnly: false }));
      return;
    }
    if (url.pathname === `/api/v2/cases/${CASE_ID}`) {
      await route.fulfill(ok({
        case: caseRecord(),
        review: {
          caseId: CASE_ID,
          token: 'review-token',
          freshness: 'fresh',
          context: { artifact: identity },
          result: { kind: 'discovery', results: [] },
        },
      }));
      return;
    }
    if (url.pathname === `/api/v2/cases/${CASE_ID}/state`) {
      caseState = 'reviewing';
      await route.fulfill(ok({ case: caseRecord() }));
      return;
    }
    if (url.pathname === '/api/v2/judgments') {
      await route.fulfill(ok({ judgments: [] }));
      return;
    }
    // The page loads the concept label map once at boot; the real server
    // serves this as a bare rows array, not a v2 envelope.
    if (url.pathname === '/api/concepts') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'hope', label: 'Hope' }]) });
      return;
    }
    if (url.pathname === '/api/v2/compile/preview') {
      await route.fulfill(ok({ plan: { digest: 'c'.repeat(64), operations: [], warnings: [], checklist: [], pendingFixtures: [] } }));
      return;
    }
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ ok: false, error: { code: 'not_found', message: url.pathname } }) });
  });

  await page.goto(`${origin}/?view=health`);
  await expect(page.getByRole('heading', { name: 'Health', exact: true })).toBeVisible();
  await expect(page.getByText('All gates pass.')).toBeVisible();

  await page.getByRole('tab', { name: 'Inbox' }).click();
  await expect(page.getByText('Nothing is waiting in the inbox.')).toBeVisible();

  await page.getByLabel('Query').fill('hope while waiting');
  await page.getByRole('button', { name: 'Create case' }).click();
  await expect(page.getByRole('heading', { name: 'hope while waiting' })).toBeVisible();
  await page.getByRole('button', { name: 'Start review' }).click();
  await expect(page.getByRole('button', { name: 'Mark judged' })).toBeVisible();

  await page.getByRole('tab', { name: 'History' }).click();
  await expect(page.getByRole('heading', { name: 'History', exact: true })).toBeVisible();

  await page.getByRole('tab', { name: 'Changes' }).click();
  await page.getByRole('button', { name: 'Preview fixture changes' }).click();
  await expect(page.getByText('c'.repeat(64))).toBeVisible();
  expect(browserErrors).toEqual([]);
});
