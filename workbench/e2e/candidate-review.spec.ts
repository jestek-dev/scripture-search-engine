import http from 'node:http';
import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

type Choice = 'a-wins' | 'b-wins' | 'tie' | 'both-wrong';

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

function blindResult(reference: string, rank: number, score: number) {
  return {
    passageId: `p-${reference.toLowerCase().replaceAll(/[^a-z0-9]/g, '')}`,
    reference,
    rank,
    score,
    reasons: [{
      family: 'concept_anchor', label: 'Theme anchor', points: score,
      uncappedPoints: score + 2, capped: true,
      provenance: { sourceId: 'ontology-source', label: 'Ontology', locator: 'concepts/hope', weight: 1 },
    }],
  };
}

test('blind comparison stays anonymous, resumes, reveals immutably, and remains polished', async ({ page }, testInfo) => {
  const browserErrors: string[] = [];
  const preRevealBodies: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });

  const queries = ['hope', 'refuge', 'peace', 'grace'].map((query, index) => ({
    queryId: `q-${String(index + 1).repeat(24)}`,
    query,
    verdict: index === 0 ? 'ambiguous' : 'unchanged',
    changed: index === 0,
    sides: {
      a: [blindResult('Psalm 46:1', 1, 10), blindResult('John 3:16', 2, 8)],
      b: [blindResult('John 3:16', 1, 11), blindResult('Psalm 46:1', 2, 9)],
    },
    movement: {
      onlyA: [], onlyB: [],
      rankMoved: [{ passageId: 'p-psalm461', aRank: 1, bRank: 2, distance: 1 }],
      reasonChanged: ['p-psalm461'], provenanceChanged: ['p-psalm461'], scoreChanged: ['p-psalm461'], capChanged: ['p-psalm461'],
    },
    missingPassages: [] as { reference: string; note: string | null; recordedAt: string }[],
    judgment: null as null | { choice: Choice; recordedAt: string },
  }));
  let revision = 0;
  let stateDigest = '1'.repeat(64);
  const sessionId = `blind-${'2'.repeat(32)}`;
  const session = () => ({
    schemaVersion: 1,
    phase: queries.every((query) => query.judgment !== null) ? 'revealed' : 'blind',
    reviewId: 'review-browser-one',
    sessionId,
    revision,
    stateDigest,
    progress: { reviewed: queries.filter((query) => query.judgment !== null).length, total: queries.length, complete: queries.every((query) => query.judgment !== null) },
    queries: queries.map((query) => query.judgment === null ? query : ({
      ...query,
      reveal: {
        sideA: 'Candidate', sideB: 'Current',
        preference: query.judgment.choice === 'a-wins' ? 'candidate-wins' : query.judgment.choice === 'b-wins' ? 'current-wins' : query.judgment.choice,
        identities: {
          current: { engineVersion: 'engine-test', corpusFingerprint: '3'.repeat(64), layerFingerprint: '4'.repeat(64) },
          candidate: { engineVersion: 'engine-test', corpusFingerprint: '3'.repeat(64), layerFingerprint: '5'.repeat(64) },
        },
        exact: { movement: query.movement, current: { top10: query.sides.b }, candidate: { top10: query.sides.a } },
      },
    })),
    gateGroups: {
      blocking: [{ findingId: 'g-blocking', message: 'A required safety gate rejected this comparison.' }],
      'review-required': [{ findingId: 'g-review', message: 'Top results changed and require a human decision.' }],
      passing: [{ findingId: 'g-passing', message: 'The result sets are stable.' }],
      'not-applicable': [{ findingId: 'g-na', message: 'No explicit expected passage is declared.' }],
    },
    admission: {
      enabled: false,
      blockers: [
        ...(queries.some((query) => query.judgment === null) ? [`${queries.filter((query) => query.judgment === null).length} comparison queries are unreviewed.`] : []),
        '1 blocking gate finding rejects admission.',
      ],
    },
  });
  const ok = (data: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data }) });

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === '/api/v2/candidates' && request.method() === 'GET') {
      const response = ok({ reviews: [{
        reviewId: 'review-browser-one', label: 'Comparison 1', queryCount: 4,
        reviewedCount: queries.filter((query) => query.judgment !== null).length,
        status: queries.some((query) => query.judgment !== null) ? 'in-progress' : 'not-started',
        verdictCounts: { improved: 0, unchanged: 3, 'expected-change': 0, ambiguous: 1, regressed: 0 },
        gateCounts: { blocking: 1, reviewRequired: 1, passing: 1, notApplicable: 1 },
      }], readOnly: false });
      if (queries.every((query) => query.judgment === null)) preRevealBodies.push(response.body);
      await route.fulfill(response);
      return;
    }
    if (url.pathname === '/api/v2/candidates/review-browser-one/blind-sessions' && request.method() === 'POST') {
      const body = JSON.stringify({ ok: true, data: { session: session() } });
      if (queries.every((query) => query.judgment === null)) preRevealBodies.push(body);
      await route.fulfill({ status: 201, contentType: 'application/json', body });
      return;
    }
    if (url.pathname === `/api/v2/candidates/review-browser-one/blind-sessions/${sessionId}` && request.method() === 'GET') {
      await route.fulfill(ok({ session: session() }));
      return;
    }
    if (url.pathname === `/api/v2/candidates/review-browser-one/blind-sessions/${sessionId}/passages` && request.method() === 'GET') {
      const body = JSON.stringify({ ok: true, data: {
        passageId: url.searchParams.get('passageId'),
        reference: 'Psalm 46:1',
        contextReference: 'Psalm 46:1-3',
        verses: [
          { translationCode: 'WEB', bookName: 'Psalm', chapter: 46, verse: 1, text: 'God is our refuge and strength.' },
          { translationCode: 'WEB', bookName: 'Psalm', chapter: 46, verse: 2, text: 'Therefore we will not be afraid.' },
        ],
      } });
      if (queries.every((query) => query.judgment === null)) preRevealBodies.push(body);
      await route.fulfill({ status: 200, contentType: 'application/json', body });
      return;
    }
    const judgmentMatch = url.pathname.endsWith('/judgments');
    if (judgmentMatch && request.method() === 'POST') {
      const input = JSON.parse(request.postData() || '{}') as { queryId: string; choice: Choice; revision: number; stateDigest: string };
      const query = queries.find((entry) => entry.queryId === input.queryId);
      if (!query || query.judgment || input.revision !== revision || input.stateDigest !== stateDigest) {
        await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ ok: false, error: { code: 'stale_session', message: 'Stale.' } }) });
        return;
      }
      query.judgment = { choice: input.choice, recordedAt: '2026-08-11T12:00:00.000Z' };
      revision += 1;
      stateDigest = String(revision + 1).repeat(64);
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { session: session() } }) });
      return;
    }
    const missingMatch = url.pathname.endsWith('/missing-passages');
    if (missingMatch && request.method() === 'POST') {
      const input = JSON.parse(request.postData() || '{}') as { queryId: string; reference: string; note?: string };
      const query = queries.find((entry) => entry.queryId === input.queryId)!;
      query.missingPassages.push({ reference: input.reference, note: input.note ?? null, recordedAt: '2026-08-11T12:00:00.000Z' });
      revision += 1;
      stateDigest = String(revision + 1).repeat(64);
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { session: session() } }) });
      return;
    }
    if (url.pathname === '/api/v2/health') {
      await route.fulfill(ok({ status: 'healthy', startup: { degraded: false }, descriptor: {}, artifact: {}, golden: {}, coverage: {}, judgments: {}, gauntlet: {}, git: {}, signals: [] }));
      return;
    }
    if (url.pathname === '/api/v2/cases' && request.method() === 'GET') { await route.fulfill(ok({ cases: [] })); return; }
    if (url.pathname === '/api/v2/inbox') { await route.fulfill(ok({ items: [] })); return; }
    // The page loads the concept label map once at boot; the real server
    // serves this as a bare rows array, not a v2 envelope.
    if (url.pathname === '/api/concepts') { await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'hope', label: 'Hope' }]) }); return; }
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ ok: false, error: { code: 'not_found', message: url.pathname } }) });
  });

  await page.goto(`${origin}/?view=compare`);
  await expect(page.getByRole('heading', { name: 'Candidate', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start blind review' }).click();
  await expect(page.getByRole('heading', { name: 'hope', exact: true })).toBeVisible();

  const bodyText = (await page.locator('body').innerText()).toLowerCase();
  expect(bodyText).not.toContain('layer-one');
  expect(bodyText).not.toContain('layer-two');
  expect(bodyText).not.toContain('cachekey');
  expect(await page.evaluate(() => Object.fromEntries(Object.entries(sessionStorage)))).toEqual({});
  const attributeLeak = await page.locator('body *').evaluateAll((elements) => elements.flatMap((element) =>
    [...element.attributes].filter((attribute) => /current|candidateidentity|cachekey|layerfingerprint|assignment|originalorder/i.test(attribute.value)).map((attribute) => `${element.tagName}:${attribute.name}=${attribute.value}`),
  ));
  expect(attributeLeak).toEqual([]);
  expect(preRevealBodies.length).toBeGreaterThan(0);
  preRevealBodies.forEach((body) => expect(body).not.toMatch(/current|candidate|cacheKey|layerFingerprint|seed|assignment|originalOrder/i));

  await page.getByRole('button', { name: 'Select Psalm 46:1 in side A' }).click();
  await expect(page.getByRole('button', { name: 'Select Psalm 46:1 in side A' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Select Psalm 46:1 in side B' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('God is our refuge and strength.')).toHaveCount(2);
  await expect(page.getByText('Provenance: Ontology')).toHaveCount(2);
  await expect(page.getByText('Cap changed')).toBeVisible();

  const queryOrder = await page.locator('.query-step').allTextContents();
  await page.reload();
  await page.getByRole('button', { name: 'Start blind review' }).click();
  // Web-first assertion: the resumed session renders after an async POST, so a
  // one-shot allTextContents() snapshot races the render on slow runners.
  // toHaveText demands the exact same texts in the same order, with retries.
  await expect(page.locator('.query-step')).toHaveText(queryOrder);

  await page.getByRole('button', { name: 'Record missing passage' }).click();
  await page.getByLabel('Missing passage reference').fill('Romans 8:28');
  await page.getByLabel('Note').fill('Expected in this context');
  await page.getByRole('button', { name: 'Save missing passage' }).click();
  await expect(page.getByText('Missing: Romans 8:28 | Expected in this context')).toBeVisible();
  await expect(page.getByText('0 of 4 reviewed')).toBeVisible();

  const decisions: readonly [string, string][] = [
    ['hope', 'A wins'], ['refuge', 'B wins'], ['peace', 'Tie'], ['grace', 'Both wrong'],
  ];
  for (const [query, choice] of decisions) {
    await page.getByRole('button', { name: new RegExp(`\\d+\\. ${query}`) }).click();
    await page.getByRole('button', { name: choice, exact: true }).click();
    await expect(page.getByText(/Saved: .* This judgment is immutable\./)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Identity reveal' })).toBeVisible();
  }
  await expect(page.getByText('4 of 4 reviewed')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Admission blocked' })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Blocking (1)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Review required (1)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Passing (1)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Not applicable (1)' })).toBeVisible();
  await page.getByText('Technical details').click();
  await expect(page.getByText('layerFingerprint')).toBeVisible();
  await expect(page.getByRole('button', { name: /A wins|B wins|Tie|Both wrong/, exact: true })).toHaveCount(0);

  await page.setViewportSize({ width: 1365, height: 900 });
  await page.screenshot({ path: testInfo.outputPath('candidate-desktop.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('candidate-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(browserErrors).toEqual([]);
});
