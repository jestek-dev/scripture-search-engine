import { createHash } from 'node:crypto';

import { expect, test, type Page } from '@playwright/test';

import {
  caseMock, casePosts, collectErrors, installRoutes, judgmentMock, liveTop10,
  makeMock, mercyResults, startStudyServer,
  type MockState, type StudyServer,
} from './study-shared';

// P4 demo spec (plan D31): the waiting queue and counts row (D24), per-query
// done state + next-search chaining (D25), "Worth a look next" (D26), the
// blind Compare screen (D27), the humanized History screen (D28), the
// Finish-up screen with typed-digest signing (D29), and the Advanced summary
// screen (D30).

let server: StudyServer;
let origin: string;

test.beforeAll(async () => {
  server = await startStudyServer();
  origin = server.origin;
});

test.afterAll(async () => {
  await server.close();
});

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

function pairCalls(mock: MockState, caseId: string): { judgments: number; caseGets: number } {
  return {
    judgments: mock.calls.filter((call) => call.method === 'GET'
      && call.path === '/api/v2/judgments' && call.search === `?caseId=${caseId}`).length,
    caseGets: mock.calls.filter((call) => call.method === 'GET'
      && call.path === `/api/v2/cases/${caseId}`).length,
  };
}

function fillerTarget(n: number): string {
  return `KJV:0100${String(n).padStart(4, '0')}`;
}

async function rescueHosea(page: Page): Promise<void> {
  // The D18 tail-rescue flow on "mercy": expand the divider, focus the first
  // tail row (Hosea 6:6, rank #11), E opens the preview, confirm commits.
  await page.click('#tail-divider');
  await page.locator('.tail-row[data-stop="11"]').click();
  await page.keyboard.press('e');
  await expect(page.locator('#rescue-confirm')).toBeEnabled();
  await page.click('#rescue-confirm');
  await expect(page.locator('#toast-slot .toast')).toContainText('should rank near the top');
}

test('D24: counts row per open case, client-sorted boot + queue, merged excluded, judged m/m, null-review j judged, switching', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({
    cases: [
      // caseId lexicographic order is the REVERSE of latest-events[].at
      // order: the server response lists case-a first, but case-d (mercy)
      // holds the newest touch and must load on boot.
      caseMock('case-a', 'shelter', 'reviewing', '2026-08-20T10:00:00.000Z'),
      caseMock('case-b', 'nullq', 'reviewing', '2026-08-21T10:00:00.000Z'),
      caseMock('case-c', 'judgedq', 'judged', '2026-08-22T10:00:00.000Z'),
      caseMock('case-d', 'mercy', 'reviewing', '2026-08-23T10:00:00.000Z'),
      caseMock('case-e', 'merged gone', 'merged', '2026-08-23T11:00:00.000Z'),
    ],
    judgments: {
      // A superseded record must not inflate j: helpful superseded by
      // essential resolves to ONE active call.
      'case-a': [
        judgmentMock('case-a', 'jid-a1', { action: 'helpful', targetId: fillerTarget(4) }),
        judgmentMock('case-a', 'jid-a2', { action: 'essential', targetId: fillerTarget(4), withinTop: 3, supersedes: 'jid-a1' }),
      ],
      'case-b': [judgmentMock('case-b', 'jid-b1', { action: 'helpful', targetId: fillerTarget(4) })],
      'case-c': mercyResults.slice(0, 10).map((result, index) =>
        judgmentMock('case-c', `jid-c${index + 1}`, { action: 'essential', targetId: result.targetId, withinTop: 10 })),
      'case-d': [judgmentMock('case-d', 'jid-d1', { action: 'essential', targetId: 'KJV:19085010', withinTop: 3 })],
    },
    nullReviewCases: new Set(['case-b']),
    // 'judgedq' is never searched live; give its snapshot a real top-10 so
    // m = 10. Every other query keeps its live top-10 as the snapshot.
    snapshotResults: (query) => (query === 'judgedq' ? mercyResults.slice(0, 10) : liveTop10(query)),
  });
  await installRoutes(page, mock);
  await page.goto(origin);

  // §3.1 open-case boot: the newest-touched case loads as if its queue row
  // were clicked — NOT the first case in the server's caseId-ordered list.
  await expect(page.locator('#search-input')).toHaveValue('mercy');
  await expect(page.locator('.rail-label .label-text')).toContainText('Results for “mercy”');
  expect(mock.calls.some((call) => call.path === '/api/search' && call.search === '?q=mercy')).toBe(true);
  await expect(page.locator('#tail-divider')).toHaveCount(1);

  // The §4.3 counts row: exactly one GET pair per open case; the merged case
  // triggers neither fetch and renders no queue entry.
  await expect(page.locator('.waiting-row')).toHaveCount(3);
  for (const caseId of ['case-a', 'case-b', 'case-c', 'case-d']) {
    expect(pairCalls(mock, caseId)).toEqual({ judgments: 1, caseGets: 1 });
  }
  expect(pairCalls(mock, 'case-e')).toEqual({ judgments: 0, caseGets: 0 });
  await expect(page.locator('.waiting-row', { hasText: 'merged gone' })).toHaveCount(0);

  // Waiting rows render in the client-sorted order (newest touch first),
  // with "{j}/{m}" counts; judged renders "{m}/{m}"; null review "{j} judged".
  const rows = page.locator('.waiting-row');
  await expect(rows.nth(0)).toContainText('“judgedq”');
  await expect(rows.nth(0)).toContainText('10/10');
  await expect(rows.nth(1)).toContainText('“nullq”');
  await expect(rows.nth(1)).toContainText('1 judged');
  await expect(rows.nth(2)).toContainText('“shelter”');
  await expect(rows.nth(2)).toContainText('1/10');

  // Empty inbox: the "Worth a look next" section (header included) is absent.
  await expect(page.locator('.queue-section-title', { hasText: 'Worth a look next' })).toHaveCount(0);

  // Counts live-update after a judgment: judge one more mercy row, then
  // switch — mercy's waiting entry shows the updated count.
  await expect(page.locator('.result-card[data-stop="1"]')).toBeFocused();
  await page.keyboard.press('h');
  await expect(page.locator('#toast-slot .toast')).toContainText('Helpful');

  // Clicking the waiting entry flips the rail header, syncs the search
  // input, fires GET /api/search for that query, focuses the first unjudged
  // row, and renders its tail divider.
  await page.locator('.waiting-row', { hasText: 'shelter' }).click();
  await expect(page.locator('#search-input')).toHaveValue('shelter');
  await expect(page.locator('.rail-label .label-text')).toContainText('Results for “shelter”');
  expect(mock.calls.some((call) => call.path === '/api/search' && call.search === '?q=shelter')).toBe(true);
  await expect(page.locator('.result-card[data-stop="1"]')).toBeFocused();
  await expect(page.locator('#tail-divider')).toHaveCount(1);
  await expect(page.locator('.waiting-row', { hasText: 'mercy' })).toContainText('2/10');
  expect(errors).toEqual([]);
});

test('D24/D27/D28/D30: zero-case boot, Compare empty state, History empty state, Advanced summary', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);

  // Zero open cases: the queue empty invitation, and no /api/search on boot.
  await expect(page.locator('.rail-empty')).toContainText('Nothing waiting — search for something you would actually type.');
  await page.waitForTimeout(150);
  expect(mock.calls.filter((call) => call.path === '/api/search')).toHaveLength(0);

  // Compare empty state (§3.5).
  await page.click('.nav-item[data-nav="compare"]');
  await expect(page.locator('#screen-compare')).toContainText('Nothing to compare right now — comparisons appear when a candidate engine is ready.');

  // History zero-calls empty state; its one action navigates to Review.
  await page.click('.nav-item[data-nav="history"]');
  await expect(page.locator('#screen-history')).toContainText('Nothing on record yet. Your first call on any search result will appear here.');
  await page.click('#history-go-review');
  await expect(page.locator('#review-grid')).toBeVisible();

  // Advanced (§3.8/D30): the identity trio in mono, only on this screen; the
  // console link href is exactly '/'.
  await expect(page.locator('body')).not.toContainText('a'.repeat(64));
  await page.click('#advanced-open');
  await expect(page.locator('#screen-advanced')).toContainText('Engineering surfaces. Nothing here interrupts the review flow.');
  await expect(page.locator('#advanced-health .mono', { hasText: '0.9.0' })).toBeVisible();
  await expect(page.locator('#advanced-health .mono', { hasText: 'a'.repeat(64) })).toBeVisible();
  await expect(page.locator('#advanced-health .mono', { hasText: 'b'.repeat(64) })).toBeVisible();
  expect(await page.locator('#advanced-console').getAttribute('href')).toBe('/');
  await page.click('#advanced-back');
  await expect(page.locator('#review-grid')).toBeVisible();
  expect(errors).toEqual([]);
});

test('D25: all-judged state with next-search chaining, then the accent Review button when everything is judged', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({
    cases: [
      caseMock('case-1', 'mercy', 'reviewing', '2026-08-23T10:00:00.000Z'),
      caseMock('case-2', 'shelter', 'reviewing', '2026-08-22T10:00:00.000Z'),
    ],
    judgments: {
      'case-1': mercyResults.slice(0, 9).map((result, index) =>
        judgmentMock('case-1', `jid-${index + 1}`, { action: 'helpful', targetId: result.targetId })),
    },
  });
  await installRoutes(page, mock);
  await page.goto(origin);

  // Boot lands on mercy's one unjudged row; judging it completes the block.
  await expect(page.locator('.result-card[data-stop="9"]')).toBeFocused();
  await page.keyboard.press('h');
  await expect(page.locator('#done-panel')).toContainText('All 10 judged.');
  await expect(page.locator('#done-panel')).toContainText('Every result for “mercy” has your call on it. Well done.');
  // Another open case has unjudged items → the accent next-search button.
  const next = page.locator('#next-search');
  await expect(next).toHaveText('Next search: “shelter” →');
  await expect(next).toHaveClass(/btn-primary/);
  await expect(page.locator('#review-decided')).toHaveClass(/btn-quiet/);

  // Clicking switches to that search.
  await next.click();
  await expect(page.locator('#search-input')).toHaveValue('shelter');
  await expect(page.locator('.rail-label .label-text')).toContainText('Results for “shelter”');

  // Judge everything in shelter; with nothing left anywhere, the next-search
  // button is absent and "Review what you decided →" is accent-styled.
  for (let i = 0; i < 10; i += 1) {
    await page.keyboard.press('h');
    await expect(page.locator('.queue-dot.affirm')).toHaveCount(i + 1);
  }
  await expect(page.locator('#done-panel')).toContainText('All 10 judged.');
  await expect(page.locator('#next-search')).toHaveCount(0);
  await expect(page.locator('#review-decided')).toHaveClass(/btn-primary/);
  await page.click('#review-decided');
  await expect(page.locator('#screen-history')).toBeVisible();
  expect(errors).toEqual([]);
});

test('D26: Worth a look next renders at most 5 renamed entries, excludes open cases, and a click runs the search', async ({ page }) => {
  const errors = collectErrors(page);
  const inboxEntry = (query: string, source: string) => ({
    kind: 'suggestion',
    suggestion: { id: `s-${query}`, query, source },
    reason: 'internal jargon reason',
    resultCount: 3,
    score: 1,
    meta: { source, state: 'new', sensitivity: 'standard', reviewer: null, artifact: {}, ageDays: 1 },
  });
  const mock = makeMock({
    cases: [caseMock('case-1', 'mercy', 'reviewing', '2026-08-23T10:00:00.000Z')],
    inboxItems: [
      // Matches an open case → excluded.
      { kind: 'case', case: caseMock('case-1', 'mercy', 'reviewing'), reason: 'x', meta: { source: 'gauntlet' } },
      inboxEntry('lament for the dead', 'gauntlet'),
      inboxEntry('walking in the light', 'coverage'),
      inboxEntry('bread of life', 'stale-judgment'),
      inboxEntry('living water', 'telemetry'),
      inboxEntry('cities of refuge', 'calibration'),
      inboxEntry('sixth entry over the cap', 'regression'),
    ],
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('.queue-section-title', { hasText: 'Worth a look next' })).toHaveCount(1);
  const rows = page.locator('.inbox-row');
  await expect(rows).toHaveCount(5);
  await expect(rows.nth(0)).toContainText('“lament for the dead”');
  await expect(rows.nth(0)).toContainText('From a routine check');
  await expect(rows.nth(1)).toContainText('New topic to cover');
  await expect(rows.nth(2)).toContainText('Needs a fresh look');
  await expect(rows.nth(3)).toContainText('From real searches');
  await expect(rows.nth(4)).toContainText('Spot check');
  await expect(page.locator('.inbox-row', { hasText: 'mercy' })).toHaveCount(0);
  await expect(page.locator('.inbox-row', { hasText: 'sixth entry over the cap' })).toHaveCount(0);

  // Clicking runs the search; no case is created by the click (decision 6).
  const before = casePosts(mock).length;
  await rows.nth(0).click();
  await expect(page.locator('#search-input')).toHaveValue('lament for the dead');
  expect(mock.calls.some((call) => call.path === '/api/search' && call.search === '?q=' + encodeURIComponent('lament for the dead'))).toBe(true);
  expect(casePosts(mock).length).toBe(before);
  expect(errors).toEqual([]);
});

function blindSessionMock(): Record<string, unknown> {
  const reasonsA = [{ family: 'token_overlap', label: 'Contains "mercy"', points: 431, uncappedPoints: 431, capped: false, provenance: { label: 'Scripture text' } }];
  const reasonsB = [{ family: 'concept_anchor', label: 'Theme: mercy', points: 400, uncappedPoints: 400, capped: false, provenance: { label: 'Theme files' } }];
  return {
    schemaVersion: 1,
    phase: 'blind',
    reviewId: 'rev-1',
    sessionId: 'blind-1',
    revision: 1,
    stateDigest: 'sd-1',
    progress: { reviewed: 0, total: 1, complete: false },
    queries: [{
      queryId: 'q-1',
      query: 'mercy',
      verdict: 'improved',
      changed: true,
      sides: {
        a: [{ passageId: 'p-1', reference: 'Psalm 85:10', rank: 1, score: 900, reasons: reasonsA }],
        b: [{ passageId: 'p-2', reference: 'Hosea 6:6', rank: 1, score: 880, reasons: reasonsB }],
      },
      movement: { onlyA: [], onlyB: [], rankMoved: [], reasonChanged: [], provenanceChanged: [], scoreChanged: [], capChanged: [] },
      missingPassages: [],
      judgment: null,
    }],
    gateGroups: { blocking: [], 'review-required': [], passing: [], 'not-applicable': [] },
    admission: { enabled: false, blockers: [] },
  };
}

const candidatesMock = (readOnly: boolean) => ({
  reviews: [{
    reviewId: 'rev-1', label: 'Comparison 1', queryCount: 1, reviewedCount: 0,
    status: 'not-started', verdictCounts: {}, gateCounts: { blocking: 0, reviewRequired: 0, passing: 0, notApplicable: 0 },
  }],
  readOnly,
});

test('D27: blind session start/resume with a persisted requestId, passage params, the one-confirm layer, and the reveal', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ candidates: candidatesMock(false), blind: { session: blindSessionMock(), startRequestIds: [], judgmentBodies: [] } });
  await installRoutes(page, mock);
  await page.goto(origin);

  await page.click('.nav-item[data-nav="compare"]');
  await page.click('button:has-text("Start the blind review")');
  await expect(page.locator('#screen-compare')).toContainText('Which set answers “mercy” better?');
  await expect(page.locator('#screen-compare')).toContainText('You are not told which engine is which. This call is final.');
  expect(mock.blind.startRequestIds).toHaveLength(1);
  const firstRequestId = mock.blind.startRequestIds[0]!;
  expect(firstRequestId).toMatch(/^[0-9a-f-]{36}$/);
  // The start body is exactly {requestId}.
  const startCall = mock.calls.find((call) => call.method === 'POST' && call.path.endsWith('/blind-sessions'))!;
  expect(Object.keys(startCall.body ?? {})).toEqual(['requestId']);

  // Reused after reload (persisted per reviewId in study.ui.v1).
  await page.reload();
  await page.click('.nav-item[data-nav="compare"]');
  await page.click('button:has-text("Start the blind review")');
  await expect(page.locator('#screen-compare')).toContainText('Which set answers “mercy” better?');
  expect(mock.blind.startRequestIds).toHaveLength(2);
  expect(mock.blind.startRequestIds[1]).toBe(firstRequestId);

  // Clicking a verse fetches passages with exactly queryId + passageId.
  await page.locator('.compare-row', { hasText: 'Psalm 85:10' }).click();
  await expect(page.locator('#compare-panel')).toContainText('mercy, and truth are met together');
  const passageCall = mock.calls.find((call) => call.path.endsWith('/passages'))!;
  expect(passageCall.search).toBe('?queryId=q-1&passageId=p-1');
  // The shared panel explains per side.
  await expect(page.locator('#compare-panel')).toContainText('Set A says');
  await expect(page.locator('#compare-panel')).toContainText('Set B says');
  await expect(page.locator('#compare-panel')).toContainText('Not in this set’s list.');

  // Pressing A alone fires no POST and opens the one-confirm layer with
  // initial focus on Cancel (§3.12 exception).
  await page.keyboard.press('a');
  await expect(page.locator('#compare-confirm-dialog')).toBeVisible();
  await expect(page.locator('#compare-confirm-title')).toHaveText('You’re calling it: A wins.');
  await expect(page.locator('#compare-confirm-dialog')).toContainText('This call is final — it cannot be edited, only outweighed by future comparisons.');
  expect(mock.blind.judgmentBodies).toHaveLength(0);
  await expect(page.locator('#compare-confirm-cancel')).toBeFocused();

  // The A-then-Enter slip is absorbed: Enter activates Cancel, nothing posts.
  await page.keyboard.press('Enter');
  await expect(page.locator('#compare-confirm-dialog')).toHaveCount(0);
  expect(mock.blind.judgmentBodies).toHaveLength(0);

  // Esc closes with zero POSTs and focus returns to the opening button.
  await page.keyboard.press('a');
  await expect(page.locator('#compare-confirm-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#compare-confirm-dialog')).toHaveCount(0);
  expect(mock.blind.judgmentBodies).toHaveLength(0);
  await expect(page.locator('#compare-a')).toBeFocused();

  // Confirm posts the session judgment and shows the reveal.
  await page.keyboard.press('a');
  await page.click('#compare-confirm-commit');
  await expect(page.locator('#reveal-card')).toContainText('The reveal');
  await expect(page.locator('#reveal-card')).toContainText('You preferred Set A — the current engine.');
  await expect(page.locator('#reveal-card')).toContainText('Your preference is recorded exactly as you made it, blind.');
  expect(mock.blind.judgmentBodies).toHaveLength(1);
  const body = mock.blind.judgmentBodies[0]!;
  expect(Object.keys(body).sort()).toEqual(['choice', 'queryId', 'requestId', 'revision', 'stateDigest']);
  expect(body).toMatchObject({ revision: 1, stateDigest: 'sd-1', queryId: 'q-1', choice: 'a-wins' });
  await page.click('#reveal-back');
  await expect(page.locator('#review-grid')).toBeVisible();
  expect(errors).toEqual([]);
});

test('D27: read-only Compare disables the verdict buttons; A opens nothing and posts nothing', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ candidates: candidatesMock(true), blind: { session: blindSessionMock(), startRequestIds: [], judgmentBodies: [] } });
  mock.degraded.value = true;
  await installRoutes(page, mock);
  await page.goto(origin);
  await page.click('.nav-item[data-nav="compare"]');
  await page.click('button:has-text("Start the blind review")');
  await expect(page.locator('#compare-a')).toBeDisabled();
  await expect(page.locator('#compare-b')).toBeDisabled();
  await expect(page.locator('#compare-t')).toBeDisabled();
  await expect(page.locator('#compare-w')).toBeDisabled();
  await page.keyboard.press('a');
  await expect(page.locator('#compare-confirm-dialog')).toHaveCount(0);
  await expect(page.locator('#toast-slot .toast')).toHaveText('Read-only right now — this call was not saved.');
  expect(mock.blind.judgmentBodies).toHaveLength(0);
  expect(errors).toEqual([]);
});

test('D28: humanized History — superseded strikethrough, in-session rescue vs prior-session missing, client sort, no jargon', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({
    cases: [
      caseMock('case-0', 'mercy', 'reviewing', '2026-08-23T12:00:00.000Z'),
      // caseId order (1,2,3) reverses the latest-event order (3 newest).
      caseMock('case-1', 'alpha query', 'merged', '2026-08-21T09:00:00.000Z'),
      caseMock('case-2', 'beta query', 'merged', '2026-08-22T09:00:00.000Z'),
      caseMock('case-3', 'gamma query', 'merged', '2026-08-23T09:00:00.000Z'),
    ],
    judgments: {
      'case-1': [judgmentMock('case-1', 'jid-11', { action: 'irrelevant', targetId: 'KJV:01001001', diagnosis: 'lexical-noise', diagnosisInferred: true, query: 'alpha query' })],
      'case-2': [judgmentMock('case-2', 'jid-21', { action: 'missing', reference: 'Lamentations 3:22', withinTop: 3, query: 'beta query' })],
      'case-3': [
        judgmentMock('case-3', 'jid-31', { action: 'essential', targetId: 'KJV:19085010', withinTop: 3, query: 'gamma query', at: '2026-08-22T01:00:00.000Z' }),
        judgmentMock('case-3', 'jid-32', { action: 'helpful', targetId: 'KJV:19085010', supersedes: 'jid-31', query: 'gamma query', at: '2026-08-22T02:00:00.000Z' }),
      ],
    },
  });
  await installRoutes(page, mock);
  await page.goto(origin);

  // A rescue performed in-session (the D18 flow) …
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await rescueHosea(page);

  await page.click('.nav-item[data-nav="history"]');
  await expect(page.locator('#screen-history')).toContainText('What you have decided');
  await expect(page.locator('#screen-history')).toContainText('Every call stays on record. An undo does not erase a call — a newer one replaces it.');
  await expect(page.locator('#screen-history')).toContainText('5 calls on record.');

  // Groups render newest-touched first — the §3.6 client sort, not the
  // mocked response order.
  const groupHeads = page.locator('.history-group h2');
  await expect(groupHeads).toHaveCount(4);
  await expect(groupHeads.nth(0)).toHaveText('“mercy”');
  await expect(groupHeads.nth(1)).toHaveText('“gamma query”');
  await expect(groupHeads.nth(2)).toHaveText('“beta query”');
  await expect(groupHeads.nth(3)).toHaveText('“alpha query”');

  // The in-session rescue phrasing vs the prior-session missing template.
  await expect(page.locator('#screen-history')).toContainText('Rescued Hosea 6:6 from the lower results (top 10) for “mercy”');
  await expect(page.locator('#screen-history')).toContainText('Added Lamentations 3:22 as a missing passage (top 3) for “beta query”');

  // The superseded chain: A struck with the sub-line, B normal.
  const struck = page.locator('.history-row.struck');
  await expect(struck).toHaveCount(1);
  await expect(struck).toContainText('Marked Psalms 85:10 essential (top 3) for “gamma query”');
  await expect(struck).toContainText('Replaced by a newer call.');
  const helpfulRow = page.locator('.history-row', { hasText: 'Marked Psalms 85:10 helpful for “gamma query”' });
  await expect(helpfulRow).toHaveCount(1);
  await expect(helpfulRow).not.toHaveClass(/struck/);

  // Humanized not-relevant phrasing, and zero jargon on the whole screen.
  await expect(page.locator('#screen-history')).toContainText('Marked Genesis 1:1 not relevant — matched words, not meaning, for “alpha query”');
  const text = await page.locator('#screen-history').innerText();
  expect(/[0-9a-f]{8}-/.test(text)).toBe(false);
  expect(/sha256/i.test(text)).toBe(false);
  expect(errors).toEqual([]);
});

const FULL_DIGEST_1 = 'abc123def456' + '0'.repeat(52);

function mercyFixtureOp(): { op: Record<string, unknown>; written: Record<string, unknown> } {
  const fixture = {
    id: 'workbench-mercy',
    generatedBy: 'workbench',
    status: 'pending',
    query: 'mercy',
    expectedTop: [
      { ref: 'Psalm 85:10', withinTop: 3 },
      { ref: 'Lamentations 3:22', withinTop: 3 },
      { ref: 'Hosea 6:6', withinTop: 10 },
    ],
    mustNotRank: [
      { ref: 'Micah 7:18', why: 'wrong-anchor' },
      { ref: 'Filler 5:5', why: 'concept-misfire' },
      { ref: 'Filler 6:6', why: 'matched the words only — my own note' },
    ],
  };
  const afterText = JSON.stringify(fixture, null, 2);
  return {
    op: { path: 'eval/golden/mercy.json', beforeSha256: null, afterText },
    written: { path: 'eval/golden/mercy.json', fixture },
  };
}

test('D29: tiles + pending banner from the counts row, the honest changed set with suffixes, and the sign gate', async ({ page }) => {
  const errors = collectErrors(page);
  const mercy = mercyFixtureOp();
  const shelterText = JSON.stringify({ query: 'shelter' });
  const plan1 = {
    schemaVersion: 1,
    inputs: [],
    operations: [
      mercy.op,
      // Byte-identical restatement: hashes equal → renders nothing, excluded
      // from the Write count.
      { path: 'eval/golden/shelter.json', beforeSha256: sha256(shelterText), afterText: shelterText },
      // A deletion.
      { path: 'eval/golden/old-request.json', beforeSha256: 'e'.repeat(64), afterText: null },
      // The web-subset file, changed → renders the proposedSelections lines.
      { path: 'pipeline/fixtures/web-subset.json', beforeSha256: null, afterText: '{"entries":[]}' },
    ],
    fixturesWritten: [
      mercy.written,
      { path: 'eval/golden/shelter.json', fixture: { query: 'shelter', expectedTop: [{ ref: 'Filler 9:9', withinTop: 3 }], mustNotRank: [] } },
    ],
    fixturesRemoved: [],
    proposedSelections: [{ book: 'Hosea', chapters: [6], why: 'needed for checks' }],
    checklist: [],
    warnings: [],
    report: '',
    digest: FULL_DIGEST_1,
  };
  const mock = makeMock({
    cases: [
      // A case auto-transitioned to judged must not vanish from the tiles.
      caseMock('case-1', 'mercy', 'judged', '2026-08-23T10:00:00.000Z'),
      caseMock('case-2', 'shelter', 'reviewing', '2026-08-22T10:00:00.000Z'),
      caseMock('case-3', 'merged gone', 'merged', '2026-08-21T10:00:00.000Z'),
    ],
    judgments: {
      'case-1': [
        judgmentMock('case-1', 'jid-1', { action: 'essential', targetId: 'KJV:19085010', withinTop: 3 }),
        judgmentMock('case-1', 'jid-2', { action: 'helpful', targetId: 'KJV:19023001' }),
        judgmentMock('case-1', 'jid-3', { action: 'irrelevant', targetId: 'KJV:33007018', diagnosis: 'lexical-noise', diagnosisInferred: true }),
        judgmentMock('case-1', 'jid-4', { action: 'missing', reference: 'Lamentations 3:22', withinTop: 3 }),
      ],
      'case-2': [judgmentMock('case-2', 'jid-s1', { action: 'essential', targetId: fillerTarget(4), withinTop: 3 })],
      // A merged case's judgments contribute nothing.
      'case-3': [judgmentMock('case-3', 'jid-m1', { action: 'essential', targetId: fillerTarget(5), withinTop: 3 })],
    },
    compilePlans: [plan1],
  });
  await installRoutes(page, mock);
  await page.goto(origin);

  // In-session: a tail rescue (so the rescued suffix is knowable) and a
  // reopened call (so the reopened suffix + banner count are live).
  await expect(page.locator('#search-input')).toHaveValue('mercy');
  await rescueHosea(page);
  await page.locator('.result-card[data-stop="0"]').click();
  await page.locator('.result-card[data-stop="0"] .chip-undo').click();
  await expect(page.locator('.judged-chip.reopened')).toHaveCount(1);

  await page.click('.nav-item[data-nav="finish"]');
  await expect(page.locator('#screen-finish')).toContainText('Your reviewed calls leave the workbench here and become part of the search’s answer sheet.');
  await expect(page.locator('#screen-finish')).toContainText('The answer sheet is the reviewed record of what the right results should be; the engineering checks hold every update to it.');

  // Tiles across ALL open cases (judged included; merged contributes 0).
  const tiles = page.locator('#finish-tiles .tile .tile-n');
  await expect(tiles.nth(0)).toHaveText('2'); // essential: mercy 1 + shelter 1
  await expect(tiles.nth(1)).toHaveText('1'); // helpful
  await expect(tiles.nth(2)).toHaveText('1'); // not relevant
  await expect(tiles.nth(3)).toHaveText('2'); // missing: Lamentations + rescued Hosea

  // Pending banner with the reopened variant; reopened rows never in {n}.
  await expect(page.locator('#pending-banner')).toContainText('16 of 20 passages are still waiting for a call · 1 reopened calls unresolved. Finish them first →');

  // What will be written — only the changed set, grouped under the query.
  const list = page.locator('#write-list');
  await expect(list).toContainText('“mercy”');
  await expect(list).toContainText('Must rank: Psalm 85:10 in the top 3 (reopened — this earlier call stands unless you change it)');
  await expect(list).toContainText('Must rank: Lamentations 3:22 in the top 3 (added by you — not shown in the engine’s top 10)');
  await expect(list).toContainText('Must rank: Hosea 6:6 in the top 10 (rescued by you from the lower results)');
  await expect(list).toContainText('Must not rank: Micah 7:18 — listed under a theme it does not speak about');
  await expect(list).toContainText('Must not rank: Filler 5:5 — speaks about the theme, but is not an answer for this query');
  await expect(list).toContainText('Must not rank: Filler 6:6 — matched the words only — my own note');
  await expect(list).toContainText('Withdrawn: “old request” — no calls remain to write.');
  await expect(list).toContainText('Add Hosea 6 to the test corpus so these answers can be checked.');
  // The unchanged restatement renders nothing; jargon tokens and the false
  // phrase appear nowhere.
  const listText = await list.innerText();
  expect(listText.includes('Filler 9:9')).toBe(false);
  expect(listText.includes('wrong-anchor')).toBe(false);
  expect(listText.includes('concept-misfire')).toBe(false);
  const screenText = await page.locator('#screen-finish').innerText();
  expect(screenText.includes('not in the engine')).toBe(false);

  // The Write count = Must-rank + Must-not-rank lines from the changed set.
  const write = page.locator('#sign-write');
  await expect(write).toHaveText('Write 6 calls to the answer sheet');
  await expect(write).toBeDisabled();
  await expect(page.locator('#sign-code')).toHaveText('abc1 23de f456');

  // Enter before the code matches fires no apply POST.
  await page.fill('#sign-input', 'wrong code');
  await expect(write).toBeDisabled();
  await page.press('#sign-input', 'Enter');
  expect(mock.applyCount).toBe(0);

  // Case-insensitive exact match enables; Enter posts the FULL digest.
  await page.fill('#sign-input', 'ABC1 23DE F456');
  await expect(write).toBeEnabled();
  await page.press('#sign-input', 'Enter');
  await expect(page.locator('#written-card')).toContainText('Written.');
  await expect(page.locator('#written-card')).toContainText('6 calls are now on the answer sheet. The engineering checks will pick them up on the next run.');
  const applyCall = mock.calls.find((call) => call.method === 'POST' && call.path === '/api/v2/compile/apply')!;
  expect(applyCall.body).toEqual({ digest: FULL_DIGEST_1 });
  // The post-apply re-preview fired exactly once.
  await expect.poll(() => mock.compilePreviewCount).toBe(2);
  expect(errors).toEqual([]);
});

test('D29: stale re-preview, the post-apply drop (judged-only), busy outcome, and single-call pluralization', async ({ page }) => {
  const errors = collectErrors(page);
  const shelterFixture = { query: 'shelter', expectedTop: [{ ref: 'Filler 4:4', withinTop: 3 }], mustNotRank: [] };
  const shelterText = JSON.stringify(shelterFixture);
  const mercyFixture = { query: 'mercy', expectedTop: [{ ref: 'Psalm 85:10', withinTop: 3 }], mustNotRank: [] };
  const mercyText = JSON.stringify(mercyFixture);
  const basePlan = (digest: string, mercyChanged: boolean) => ({
    schemaVersion: 1,
    inputs: [],
    operations: [
      { path: 'eval/golden/shelter.json', beforeSha256: null, afterText: shelterText },
      { path: 'eval/golden/mercy.json', beforeSha256: mercyChanged ? null : sha256(mercyText), afterText: mercyText },
    ],
    fixturesWritten: [
      { path: 'eval/golden/shelter.json', fixture: shelterFixture },
      { path: 'eval/golden/mercy.json', fixture: mercyFixture },
    ],
    fixturesRemoved: [],
    proposedSelections: [],
    checklist: [],
    warnings: [],
    report: '',
    digest,
  });
  const digest1 = '111122223333' + 'a'.repeat(52);
  const digest2 = '444455556666' + 'b'.repeat(52);
  const digest3 = '777788889999' + 'c'.repeat(52);
  const mock = makeMock({
    cases: [
      caseMock('case-s', 'shelter', 'judged', '2026-08-23T10:00:00.000Z'),
      caseMock('case-m', 'mercy', 'judged', '2026-08-22T10:00:00.000Z'),
    ],
    judgments: {
      'case-s': [4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((n, index) =>
        judgmentMock('case-s', `jid-s${index + 1}`, { action: 'essential', targetId: fillerTarget(n), withinTop: 10 })),
      'case-m': [judgmentMock('case-m', 'jid-m1', { action: 'essential', targetId: 'KJV:19085010', withinTop: 3 })],
    },
    compilePlans: [
      basePlan(digest1, true),
      basePlan(digest2, true),
      // Post-apply: mercy restates byte-identically → its judged case drops;
      // shelter still carries a changed operation → stays.
      basePlan(digest3, false),
    ],
    applyResponder: (_body, n) => {
      if (n === 1) return { status: 409, payload: { ok: false, error: { code: 'stale_preview', message: 'The repository changed.' } } };
      if (n === 3) return { status: 409, payload: { ok: false, error: { code: 'mutation_running', message: 'Another repository operation is already running.' } } };
      return null;
    },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toHaveValue('shelter');
  await expect(page.locator('.waiting-row', { hasText: 'mercy' })).toContainText('1/10');

  await page.click('.nav-item[data-nav="finish"]');
  await expect(page.locator('#sign-code')).toHaveText('1111 2222 3333');
  await page.fill('#sign-input', '111122223333');
  await page.press('#sign-input', 'Enter');
  // 409 stale_preview: the §3.7 line, then an automatic re-preview with a
  // NEW code and a cleared input.
  await expect(page.locator('#screen-finish')).toContainText('The picture changed since this preview — reloading it now.');
  await expect(page.locator('#sign-code')).toHaveText('4444 5555 6666');
  await expect(page.locator('#sign-input')).toHaveValue('');
  expect(mock.calls.filter((call) => call.path === '/api/v2/compile/apply')[0]!.body).toEqual({ digest: digest1 });

  // Success on the fresh code; the post-apply re-preview drops the judged
  // case whose query no longer contributes a changed operation.
  await page.fill('#sign-input', '4444 5555 6666');
  await page.click('#sign-write');
  await expect(page.locator('#written-card')).toContainText('Written.');
  expect(mock.calls.filter((call) => call.path === '/api/v2/compile/apply')[1]!.body).toEqual({ digest: digest2 });
  await expect.poll(() => mock.compilePreviewCount).toBe(3);
  // Real pluralization on the re-rendered button (one remaining line).
  await expect(page.locator('#sign-write')).toHaveText('Write 1 call to the answer sheet');
  // mercy dropped from the tiles (10 essential from shelter remain)…
  await expect(page.locator('#finish-tiles .tile .tile-n').nth(0)).toHaveText('10');
  // …and from the waiting queue; shelter (changed op remaining) stays open.
  await page.click('.nav-item[data-nav="review"]');
  await expect(page.locator('.waiting-row')).toHaveCount(0);
  await expect(page.locator('.rail-empty')).toContainText('Nothing waiting');
  await expect(page.locator('.rail-label .label-text')).toContainText('Results for “shelter”');

  // 409 mutation_running: the busy line.
  await page.click('.nav-item[data-nav="finish"]');
  await expect(page.locator('#sign-code')).toHaveText('7777 8888 9999');
  await page.fill('#sign-input', '777788889999');
  await page.click('#sign-write');
  await expect(page.locator('#screen-finish')).toContainText('Another change is being written right now — try again in a moment.');
  expect(errors).toEqual([]);
});

test('D29: read-only disables the Sign input and Write button; no apply can fire', async ({ page }) => {
  const errors = collectErrors(page);
  const fixture = { query: 'mercy', expectedTop: [{ ref: 'Psalm 85:10', withinTop: 3 }], mustNotRank: [] };
  const mock = makeMock({
    cases: [caseMock('case-1', 'mercy', 'judged', '2026-08-23T10:00:00.000Z')],
    judgments: { 'case-1': [judgmentMock('case-1', 'jid-1', { action: 'essential', targetId: 'KJV:19085010', withinTop: 3 })] },
    compilePlans: [{
      schemaVersion: 1,
      inputs: [],
      operations: [{ path: 'eval/golden/mercy.json', beforeSha256: null, afterText: JSON.stringify(fixture) }],
      fixturesWritten: [{ path: 'eval/golden/mercy.json', fixture }],
      fixturesRemoved: [],
      proposedSelections: [],
      checklist: [],
      warnings: [],
      report: '',
      digest: 'f0f0f0f0f0f0' + 'd'.repeat(52),
    }],
  });
  mock.degraded.value = true;
  await installRoutes(page, mock);
  await page.goto(origin);
  await page.click('.nav-item[data-nav="finish"]');
  await expect(page.locator('#sign-write')).toHaveText('Write 1 call to the answer sheet');
  await expect(page.locator('#sign-input')).toBeDisabled();
  await expect(page.locator('#sign-write')).toBeDisabled();
  expect(mock.applyCount).toBe(0);
  expect(errors).toEqual([]);
});

test('D29: an all-unchanged plan renders the empty-changed-set copy and the Helpful footnote', async ({ page }) => {
  const errors = collectErrors(page);
  const fixture = { query: 'mercy', expectedTop: [{ ref: 'Psalm 85:10', withinTop: 3 }], mustNotRank: [] };
  const text = JSON.stringify(fixture);
  const mock = makeMock({
    cases: [caseMock('case-1', 'mercy', 'judged', '2026-08-23T10:00:00.000Z')],
    judgments: { 'case-1': [judgmentMock('case-1', 'jid-1', { action: 'essential', targetId: 'KJV:19085010', withinTop: 3 })] },
    compilePlans: [{
      schemaVersion: 1,
      inputs: [],
      operations: [{ path: 'eval/golden/mercy.json', beforeSha256: sha256(text), afterText: text }],
      fixturesWritten: [{ path: 'eval/golden/mercy.json', fixture }],
      fixturesRemoved: [],
      proposedSelections: [],
      checklist: [],
      warnings: [],
      report: '',
      digest: 'e'.repeat(64),
    }],
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await page.click('.nav-item[data-nav="finish"]');
  // operations.length is NOT the gate — only the changed-bytes delta is.
  await expect(page.locator('#screen-finish')).toContainText('Nothing waiting to be written — every call you’ve made is already on the answer sheet.');
  await expect(page.locator('#screen-finish')).toContainText('Helpful calls stay on record and inform review; they do not write answer-sheet lines by themselves.');
  await expect(page.locator('#sign-panel')).toHaveCount(0);
  expect(errors).toEqual([]);
});
