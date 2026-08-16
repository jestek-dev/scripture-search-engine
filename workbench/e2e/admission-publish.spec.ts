import http from 'node:http';
import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

let server: http.Server;
let origin: string;

const digest = (value: string) => value.repeat(64).slice(0, 64);
const reviewId = 'review-admission-one';
const previewDigest = digest('a');
const admissionDigest = digest('b');

function admission(state: 'READY' | 'ADMITTED' = 'READY') {
  return {
    reviewId,
    proposalId: 'hope-gap',
    state,
    readOnly: false,
    blockers: [],
    recovery: ['If any source, candidate, or main binding moved, rebuild and repeat comparison review.'],
    preview: {
      digest: previewDigest,
      proposalDigest: digest('c'),
      baseCommit: '1'.repeat(40),
      candidate: { cacheKey: digest('d'), descriptorSha256: digest('e'), databaseSha256: digest('f'), engineVersion: 'test-engine', corpusFingerprint: digest('1'), layerFingerprint: digest('2') },
      diffs: [{
        path: 'ontology/concepts/hope.yaml', kind: 'yaml', operationIds: ['op-hope'], changed: true, digest: digest('3'),
        before: { sha256: digest('4'), base64: 'aWQ6IGhvcGUK', text: 'id: hope\nlexicon:\n  - hope\n' },
        after: { sha256: digest('5'), base64: 'aWQ6IGhvcGUK', text: 'id: hope\nlexicon:\n  - hope\n  - hope in God\n' },
      }],
      decisions: [{ kind: 'source-proposal', slotId: 'source-proposal', subjectDigest: digest('6'), probes: [] }, {
        kind: 'probe-baseline', slotId: 'probe-baseline', subjectDigest: digest('7'), probes: [{ probeId: 'hope-probe', beforeSha256: digest('8'), afterSha256: digest('9') }],
      }],
      measurableEffect: true,
      reviewedComparisonQueries: ['hope'],
      gauntlet: {
        verdict: 'ADMIT', blocking: false,
        gates: [{ gate: 'G1-provenance', title: 'Provenance', status: 'pass', verdict: 'pass', summary: 'Complete.', findings: [] }, { gate: 'G8-noise-probes', title: 'Noise probes', status: 'pass', verdict: 'pass', summary: 'Stable.', findings: [] }],
      },
    },
    admission: state === 'ADMITTED' ? { digest: admissionDigest, admittedAt: '2026-08-11T12:00:00.000Z', manifestId: digest('q') } : null,
  };
}

test.beforeAll(async () => {
  const page = await readFile(new URL('../static/index.html', import.meta.url));
  server = http.createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(page);
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const address = server.address();
  if (typeof address !== 'object' || address === null) throw new Error('Browser fixture server did not bind.');
  origin = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('admission and isolated publish preparation remain explicit and responsive', async ({ page }, testInfo) => {
  const browserErrors: string[] = [];
  let admitted = false;
  let admissionBody: any = null;
  let publishBody: any = null;
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  const ok = (data: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data }) });
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname === '/api/v2/health') return route.fulfill(ok({ status: 'healthy', startup: { degraded: false }, descriptor: {}, artifact: {}, golden: {}, coverage: {}, judgments: {}, gauntlet: {}, git: {}, signals: [] }));
    // The page loads the concept label map once at boot; the real server
    // serves this as a bare rows array, not a v2 envelope.
    if (pathname === '/api/concepts') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'hope', label: 'Hope' }]) });
    if (pathname === '/api/v2/cases') return route.fulfill(ok({ cases: [] }));
    if (pathname === '/api/v2/inbox') return route.fulfill(ok({ items: [] }));
    if (pathname === '/api/v2/candidates') return route.fulfill(ok({ reviews: [], readOnly: false }));
    if (pathname === '/api/v2/admissions' && request.method() === 'GET') return route.fulfill(ok({ admissions: [{ reviewId, proposalId: 'hope-gap', state: admitted ? 'ADMITTED' : 'READY', blockers: [] }], readOnly: false }));
    if (pathname === `/api/v2/admissions/${reviewId}` && request.method() === 'GET') return route.fulfill(ok({ admission: admission(admitted ? 'ADMITTED' : 'READY'), readOnly: false }));
    if (pathname === `/api/v2/admissions/${reviewId}/admit` && request.method() === 'POST') {
      admissionBody = JSON.parse(request.postData() || '{}'); admitted = true;
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { admission: admission('ADMITTED') } }) });
    }
    if (pathname === '/api/v2/publish' && request.method() === 'GET') return route.fulfill(ok({ admissions: [{ reviewId, proposalId: 'hope-gap', state: 'ADMITTED', blockers: [] }], readOnly: false }));
    if (pathname === `/api/v2/publish/${reviewId}/preflight` && request.method() === 'GET') return route.fulfill(ok({ publish: {
      reviewId, proposalId: 'hope-gap', admission: { digest: admissionDigest, admittedAt: '2026-08-11T12:00:00.000Z' },
      preflight: { reviewId, proposalId: 'hope-gap', admissionDigest, ready: true, branch: 'refinement/2026-08-11-hope-gap', expectedMainCommit: '1'.repeat(40), currentMainCommit: '1'.repeat(40), blockers: [], recovery: ['Preparation creates an isolated branch and never merges or releases.'] },
    }, readOnly: false }));
    if (pathname === `/api/v2/publish/${reviewId}/prepare` && request.method() === 'POST') {
      publishBody = JSON.parse(request.postData() || '{}');
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { publication: { status: 'DRAFT_PR_OPENED', branch: 'refinement/2026-08-11-hope-gap', commit: '2'.repeat(40), treeHash: '3'.repeat(40), draftPrUrl: 'https://example.test/pr/7', nextActions: ['Review the draft pull request through the normal repository process.'] } } }) });
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ ok: false, error: { code: 'not_found', message: pathname } }) });
  });

  await page.goto(`${origin}/?view=admission`);
  await expect(page.getByRole('heading', { name: 'Admission', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Exact approved diffs' })).toBeVisible();
  const admit = page.getByRole('button', { name: 'Admit reviewed change' });
  await expect(admit).toBeDisabled();
  await page.getByLabel('Reviewed rationale').nth(0).fill('The exact source edit has been independently reviewed.');
  await expect(admit).toBeDisabled();
  await page.getByLabel('Reviewed rationale').nth(1).fill('The baseline movement has been independently reviewed.');
  await expect(admit).toBeDisabled();
  await page.getByLabel('Probe hope-probe').fill('This probe movement is intentional and documented.');
  await expect(admit).toBeEnabled();
  await page.setViewportSize({ width: 1365, height: 900 });
  await page.screenshot({ path: testInfo.outputPath('admission-review-desktop.png'), fullPage: true });
  const admissionOverflow = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1).map((element) => ({ tag: element.tagName, className: element.className, id: element.id, right: Math.round(element.getBoundingClientRect().right) })).slice(0, 12));
  expect(admissionOverflow).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Exact approved diffs' })).toBeVisible();
  await expect(page.getByLabel('Probe hope-probe')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('admission-review-mobile.png'), fullPage: true });
  const admissionMobileOverflow = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1).map((element) => ({ tag: element.tagName, className: element.className, id: element.id, right: Math.round(element.getBoundingClientRect().right) })).slice(0, 12));
  expect(admissionMobileOverflow).toEqual([]);
  await page.setViewportSize({ width: 1365, height: 900 });
  await admit.click();
  await expect(page.getByText('Admission manifest recorded.')).toBeVisible();
  expect(admissionBody).toMatchObject({ previewDigest, decisions: [{ slotId: 'source-proposal' }, { slotId: 'probe-baseline', probeRationales: [{ probeId: 'hope-probe' }] }] });

  await page.getByRole('tab', { name: 'Publish', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Publish', exact: true })).toBeVisible();
  await expect(page.getByText('Publish preflight passed.')).toBeVisible();
  await page.getByLabel('Push the isolated branch').check();
  await page.getByLabel('Open a draft pull request').check();
  await page.getByRole('button', { name: 'Prepare branch' }).click();
  await expect(page.getByRole('heading', { name: 'Preparation evidence' })).toBeVisible();
  expect(publishBody).toEqual({ admissionDigest, push: true, openDraftPr: true });

  await page.setViewportSize({ width: 1365, height: 900 });
  await page.screenshot({ path: testInfo.outputPath('admission-publish-desktop.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('admission-publish-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(browserErrors).toEqual([]);
});
