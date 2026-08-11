import http from 'node:http';
import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

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

const privateCanaries = ['below threshold browser canary', 'sensitive browser canary', 'holdout-browser-secret'];

function metric(metricKey: string, sparse = false) {
  return { metricKey, numerator: sparse ? 1 : 18, denominator: sparse ? 2 : 20, sampleSize: sparse ? 2 : 20, rate: sparse ? 0.5 : 0.9, sparse, context: sparse ? 'Sparse sample; descriptive only.' : 'Comparable descriptive evidence.' };
}

test('Sessions, Quality, and Audits are operational, private, responsive, and resumable', async ({ page }, testInfo) => {
  const browserErrors: string[] = [];
  const responseBodies: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('response', async (response) => {
    if (!response.url().includes('/api/v2/')) return;
    try { responseBodies.push(await response.text()); } catch { /* response was not retained */ }
  });

  let session: any = null;
  const queue = [
    { itemId: 'case-browser-a', query: 'hope while waiting', source: 'manual', selection: 'priority', priority: 88, state: 'queued' },
    { itemId: 'case-browser-b', query: 'refuge in trouble', source: 'coverage', selection: 'exploration', priority: 42, state: 'queued' },
  ];
  const sessionView = () => ({
    schemaVersion: 1, kind: 'weekly-triage', status: session?.status || 'open', opaqueMembership: false,
    priorityFormula: { version: 1, popularityExcluded: true }, sessionId: 'session-browser-one', digest: String((session?.revision || 0) + 1).repeat(64), revision: session?.revision || 0,
    reviewer: 'jesse', reviewedSize: 20,
    progress: { handled: queue.filter((item) => item.state !== 'queued').length, total: queue.length, remaining: queue.filter((item) => item.state === 'queued').length },
    sourceCounts: { manual: 1, coverage: 1 }, queue,
  });
  let auditStatus: 'ready' | 'applied' | 'closed' = 'ready';
  const auditView = () => ({
    schemaVersion: 1, auditDigest: 'a'.repeat(64), previewDigest: auditStatus === 'ready' ? 'b'.repeat(64) : auditStatus === 'applied' ? 'c'.repeat(64) : 'd'.repeat(64),
    status: auditStatus, revision: auditStatus === 'ready' ? 0 : auditStatus === 'applied' ? 1 : 2,
    distillateCount: 2, schemaVersions: [1], period: '2026-Q3', opaqueTokenCount: 2,
    suppression: { belowThreshold: 3, sensitiveExcluded: 2 }, excludedEvidence: { unreplayable: 1, rankMismatch: 1 },
    candidateCaseCount: 1, candidateCases: [{ candidateKey: 'candidate-safe', query: 'approved aggregate query', verdict: 'MISS', devices: 3 }],
    privacyWarnings: [
      'Below-threshold query forms are suppressed and are never shown or retained.',
      'Sensitive and unreplayable evidence is counted only; suppressed strings are never returned.',
      'Apply writes approved aggregate cases. Close deletes the temporary distillate dump.',
    ], dumpDeleted: auditStatus === 'closed',
  });
  const quality = {
    schemaVersion: 1, artifact: { artifactId: 'candidate-browser', descriptorSha256: 'e'.repeat(64), engineVersion: 'engine', corpusFingerprint: 'corpus', layerFingerprint: 'layer' }, reviewCycleId: 'cycle-browser',
    candidateImprovement: { verdict: 'blocked-required-regression', context: 'A required holdout gate regressed.', blocked: true },
    partitions: { calibration: [metric('benchmark.calibration.candidate.essential.top10')], holdout: [metric('benchmark.holdout.candidate.essential.top10', true)] },
    telemetry: { calibration: [metric('telemetry.calibration.candidate.zero-result-rate')], holdout: [metric('telemetry.holdout.candidate.zero-result-rate', true)] },
    requiredGates: { calibration: [{ metricKey: 'gates.calibration.passed', count: 2, sampleSize: 2, context: 'Required calibration gates.' }], holdout: [{ metricKey: 'gates.holdout.regressed', count: 1, sampleSize: 2, context: 'A required gate regressed.' }] },
    coverage: { concepts: { active: { metricKey: 'coverage.concepts.active', count: 12, sampleSize: 12, context: 'Active concepts.' } }, fixtures: { pending: { metricKey: 'coverage.fixtures.pending', count: 2, sampleSize: 14, context: 'Pending fixtures.' } } },
    cases: { opened: { metricKey: 'cases.opened', count: 8, sampleSize: 8, context: 'Opened cases.' } }, admissions: [],
    trends: [{ partition: 'calibration', metricKey: 'benchmark.calibration.candidate.essential.top10', points: [{ reviewCycleId: 'cycle-old', observedAt: '2026-08-01T00:00:00.000Z', numerator: 16, denominator: 20, sparse: false }, { reviewCycleId: 'cycle-browser', observedAt: '2026-08-11T00:00:00.000Z', numerator: 18, denominator: 20, sparse: false }], latestDeltaPercentagePoints: 10, precision: 'available', context: 'Artifact trend.' }],
    calibrationDrillLinks: [{ metricKey: 'benchmark.calibration.candidate.essential.top10', caseIds: ['calibration-case-1'], aggregateIds: ['aggregate-approved-1'] }],
    holdout: { membershipOpaque: true, drillLinksAvailable: false }, redactedDigest: 'f'.repeat(64),
  };
  const ok = (data: unknown, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify({ ok: true, data }) });

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === '/api/v2/health') { await route.fulfill(ok({ status: 'healthy', startup: { degraded: false }, descriptor: {}, artifact: {}, golden: {}, coverage: {}, judgments: {}, gauntlet: {}, git: {}, signals: [] })); return; }
    if (url.pathname === '/api/v2/cases' && request.method() === 'GET') { await route.fulfill(ok({ cases: [] })); return; }
    if (url.pathname === '/api/v2/inbox') { await route.fulfill(ok({ items: [] })); return; }
    if (url.pathname === '/api/v2/candidates') { await route.fulfill(ok({ reviews: [], readOnly: false })); return; }
    if (url.pathname === '/api/v2/quality') { await route.fulfill(ok({ quality, readOnly: false })); return; }
    if (url.pathname === '/api/v2/sessions' && request.method() === 'GET') { await route.fulfill(ok({ sessions: session ? [sessionView()] : [], priorityFormula: { popularityExcluded: true } })); return; }
    if (url.pathname === '/api/v2/sessions' && request.method() === 'POST') { session = { revision: 0, status: 'open' }; await route.fulfill(ok({ session: sessionView() }, 201)); return; }
    if (url.pathname.startsWith('/api/v2/sessions/session-browser-one/') && request.method() === 'POST') {
      const input = JSON.parse(request.postData() || '{}') as { itemId?: string; reason?: string; requeue?: string };
      if (url.pathname.endsWith('/skip-item')) {
        const item = queue.find((entry) => entry.itemId === input.itemId)!; item.state = 'skipped'; Object.assign(item, { skip: { reason: input.reason, requeue: input.requeue } });
      } else if (url.pathname.endsWith('/complete-item')) queue.find((entry) => entry.itemId === input.itemId)!.state = 'completed';
      else session.status = 'completed';
      session.revision += 1;
      await route.fulfill(ok({ session: sessionView() }, 201)); return;
    }
    if (url.pathname === '/api/v2/audits/preview') { auditStatus = 'ready'; await route.fulfill(ok({ audit: auditView() })); return; }
    if (url.pathname === '/api/v2/audits/apply') { auditStatus = 'applied'; await route.fulfill(ok({ audit: auditView() }, 201)); return; }
    if (url.pathname === '/api/v2/audits/close') { auditStatus = 'closed'; await route.fulfill(ok({ audit: auditView() }, 201)); return; }
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ ok: false, error: { code: 'not_found', message: url.pathname } }) });
  });

  await page.goto(`${origin}/?view=sessions`);
  await expect(page.getByRole('heading', { name: 'Review sessions' })).toBeVisible();
  await expect(page.getByText(/Priority = outcome severity/)).toBeVisible();
  await page.getByRole('button', { name: 'Start session' }).click();
  await expect(page.getByText('Review session is ready. Its order is deterministic and resumable.')).toBeVisible();
  const queueQueries = page.locator('table[aria-label="Session queue"] tbody tr td:first-child');
  await expect(queueQueries).toHaveCount(2);
  const initialOrder = await queueQueries.allTextContents();
  expect(initialOrder).toEqual(['hope while waiting', 'refuge in trouble']);
  await page.getByRole('button', { name: 'Skip' }).first().click();
  await expect(page.getByText('skipped', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Complete', exact: true }).click();
  await page.getByRole('button', { name: 'Complete session' }).click();
  await expect(page.getByRole('button', { name: 'Session complete' })).toBeDisabled();
  await expect(page.locator('#main-panel')).toBeFocused();
  await page.reload();
  await expect(page.locator('table[aria-label="Session queue"] tbody tr td:first-child')).toHaveText(initialOrder);
  await page.screenshot({ path: testInfo.outputPath('studio-sessions-desktop.png'), fullPage: true });

  await page.getByRole('tab', { name: 'Audits' }).click();
  await page.getByLabel('Distillate JSON files').setInputFiles([
    { name: 'one.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ v: 1, token: 'opaque-browser-token', query: privateCanaries[0] })) },
    { name: 'two.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ v: 1, query: privateCanaries[1] })) },
  ]);
  await page.getByRole('button', { name: 'Preview audit' }).click();
  await expect(page.getByText('approved aggregate query')).toBeVisible();
  await expect(page.getByText('3', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Apply approved cases' }).click();
  await page.getByRole('button', { name: 'Close and delete dump' }).click();
  await expect(page.getByText(/temporary distillate dump was deleted/)).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('studio-audits-desktop.png'), fullPage: true });

  await page.getByRole('tab', { name: 'Quality' }).click();
  await expect(page.getByText(/blocked required regression/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Calibration evidence' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Holdout evidence' })).toBeVisible();
  await expect(page.getByText('Sparse', { exact: true })).toHaveCount(2);
  await expect(page.getByText('calibration-case-1')).toBeVisible();

  const visibleAndStored = await page.evaluate(() => `${document.documentElement.outerHTML}\n${JSON.stringify(localStorage)}\n${JSON.stringify(sessionStorage)}`);
  for (const canary of privateCanaries) expect(visibleAndStored).not.toContain(canary);
  for (const body of responseBodies) for (const canary of privateCanaries) expect(body).not.toContain(canary);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.setViewportSize({ width: 1365, height: 900 });
  await page.screenshot({ path: testInfo.outputPath('studio-quality-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('studio-quality-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole('tab', { name: 'Sessions' }).click();
  await expect(page.getByRole('button', { name: 'Session complete' })).toBeDisabled();
  await page.screenshot({ path: testInfo.outputPath('studio-sessions-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole('tab', { name: 'Audits' }).click();
  await expect(page.getByText(/temporary distillate dump was deleted/)).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('studio-audits-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(browserErrors).toEqual([]);
});

test('degraded mode keeps evidence visible and disables every Studio mutation', async ({ page }) => {
  const success = (data: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data }) });
  const degradedSession = {
    schemaVersion: 1, kind: 'weekly-triage', status: 'open', opaqueMembership: false, priorityFormula: { version: 1, popularityExcluded: true },
    sessionId: 'session-degraded-one', digest: '1'.repeat(64), revision: 0, reviewer: 'jesse', reviewedSize: 1,
    progress: { handled: 0, total: 1, remaining: 1 }, sourceCounts: { manual: 1 },
    queue: [{ itemId: 'case-degraded-one', query: 'visible retained evidence', source: 'manual', selection: 'priority', priority: 80, state: 'queued' }],
  };
  const reviewId = 'review-degraded-one';
  const degradedPublish = {
    reviewId, proposalId: 'degraded-proposal', admission: { digest: '2'.repeat(64), admittedAt: '2026-08-11T12:00:00.000Z' },
    preflight: { reviewId, proposalId: 'degraded-proposal', admissionDigest: '2'.repeat(64), ready: true, branch: 'refinement/2026-08-11-degraded-proposal', expectedMainCommit: '3'.repeat(40), currentMainCommit: '3'.repeat(40), blockers: [], recovery: [] },
  };
  await page.route('**/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === '/api/v2/health') return route.fulfill(success({ status: 'degraded', startup: { degraded: true }, signals: [] }));
    if (pathname === '/api/v2/cases') return route.fulfill(success({ cases: [] }));
    if (pathname === '/api/v2/inbox') return route.fulfill(success({ items: [] }));
    if (pathname === '/api/v2/candidates') return route.fulfill(success({ reviews: [], readOnly: true }));
    if (pathname === '/api/v2/sessions') return route.fulfill(success({ sessions: [degradedSession], readOnly: true }));
    if (pathname === '/api/v2/quality') return route.fulfill(success({ quality: null, readOnly: true }));
    if (pathname === '/api/v2/admissions') return route.fulfill(success({ admissions: [], readOnly: true }));
    if (pathname === '/api/v2/publish') return route.fulfill(success({ admissions: [{ reviewId, proposalId: 'degraded-proposal', state: 'ADMITTED', blockers: [] }], readOnly: true }));
    if (pathname === `/api/v2/publish/${reviewId}/preflight`) return route.fulfill(success({ publish: degradedPublish, readOnly: true }));
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });
  await page.goto(`${origin}/?view=sessions`);
  await expect(page.getByText(/Read-only mode:/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start session' })).toBeDisabled();
  await expect(page.getByText('visible retained evidence')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Complete', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Skip', exact: true })).toBeDisabled();
  await expect(page.getByLabel('Skip reason for visible retained evidence')).toBeDisabled();
  await expect(page.getByLabel('Requeue outcome for visible retained evidence')).toBeDisabled();
  await page.getByRole('tab', { name: 'Audits' }).click();
  await expect(page.getByLabel('Distillate JSON files')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Preview audit' })).toBeDisabled();
  await page.getByRole('tab', { name: 'Admission' }).click();
  await expect(page.getByText(/Read-only mode:/)).toBeVisible();
  await page.getByRole('tab', { name: 'Publish' }).click();
  await expect(page.getByText(/Read-only mode:/)).toBeVisible();
  await expect(page.getByText('Publish preflight passed.')).toBeVisible();
  await expect(page.getByLabel('Push the isolated branch')).toBeDisabled();
  await expect(page.getByLabel('Open a draft pull request')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Prepare branch' })).toBeDisabled();
  await page.getByRole('tab', { name: 'Quality' }).click();
  await expect(page.getByText(/Read-only mode:/)).toBeVisible();
});
