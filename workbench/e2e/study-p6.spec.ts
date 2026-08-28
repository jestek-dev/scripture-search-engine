import { expect, test, type Page } from '@playwright/test';

import {
  collectErrors, installRoutes, makeMock, startStudyServer, identity,
  type MockState, type StudyServer,
} from './study-shared';

// P6 demo spec (votes-to-engine plan, Phase 0 D2): the read-only Updates
// screen. Covers: the real-3-vote-log render (one legacy re-confirmation
// card + the checklist preview in plain language, the §4.2 same-facts note
// verbatim above the lines, Approve as the card's only action, the
// two-read-calls/no-write guarantee, and the Approve hand-off into Review),
// the steady empty state, the degraded read-only banner, and the D28 jargon
// quarantine over the rendered screen text.

let server: StudyServer;
let origin: string;

test.beforeAll(async () => {
  server = await startStudyServer();
  origin = server.origin;
});

test.afterAll(async () => {
  await server.close();
});

// The real 3-vote log (workbench/judgments.jsonl:1-3), mirrored exactly:
// what POST /api/v2/compile/preview's checklist and GET /api/v2/inbox's
// deduped stale-judgment suggestion derive from it today. (The real server's
// empty-log path is the WORKBENCH_JUDGMENTS_PATH override, server.ts; this
// harness models it as the empty plan + empty inbox below.)
const LEGACY_QUERY = 'Who is like the Lord?';
const LEGACY_AT = '2026-08-06T16:35:14.936Z';
const REAL_CHECKLIST = [
  '[ ] missing: "Who is like the Lord?" should surface Exodus 15:11 — uses that exact wording.',
  '[ ] missing: "Who is like the Lord?" should surface Deuteronomy 3:24 — Fits the theme',
  '[ ] missing: "Who is like the Lord?" should surface Deuteronomy 33:26 — fits the theme',
];

function realVotePlan(): unknown {
  return {
    schemaVersion: 1,
    operations: [],
    fixturesWritten: [],
    fixturesRemoved: [],
    proposedSelections: [],
    checklist: REAL_CHECKLIST,
    warnings: [],
    report: '',
    inputs: [],
    digest: 'f'.repeat(64),
  };
}

function legacyInboxItem(): unknown {
  return {
    kind: 'suggestion',
    suggestion: { id: 'suggestion:legacy-stale', query: LEGACY_QUERY, source: 'stale-judgment' },
    reason: 'The prior judgment was made under a different engine, corpus, or layer identity.',
    resultCount: 10,
    score: 1,
    meta: {
      source: 'stale-judgment',
      state: 'new',
      sensitivity: 'standard',
      reviewer: null,
      artifact: identity,
      ageDays: (Date.now() - Date.parse(LEGACY_AT)) / 86_400_000,
    },
  };
}

function realVoteMock(): MockState {
  return makeMock({
    compilePlans: [realVotePlan()],
    inboxItems: [legacyInboxItem()],
  });
}

async function openUpdates(page: Page): Promise<void> {
  await page.click('.nav-item[data-nav="updates"]');
  await expect(page.locator('#screen-updates')).toBeVisible();
}

// The D28 jargon quarantine, as a binding AC: neither regex may match the
// rendered Updates screen text.
async function assertNoJargon(page: Page): Promise<void> {
  const text = await page.locator('#screen-updates').innerText();
  expect(/[0-9a-f]{8}-/.test(text), `jargon id in rendered text: ${text}`).toBe(false);
  expect(/sha256/i.test(text), `sha256 in rendered text: ${text}`).toBe(false);
}

test('D2: the real 3-vote log renders one legacy card + the checklist preview, read-only', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = realVoteMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();

  const callsBefore = mock.calls.length;
  await openUpdates(page);

  // One legacy re-confirmation card, §07.2's copy verbatim.
  const card = page.locator('.updates-card');
  await expect(card).toHaveCount(1);
  await expect(card.locator('h2')).toHaveText('Take a fresh look: “Who is like the Lord?”');
  await expect(card).toContainText(
    'Because you suggested three passages for this search on Aug 6 — '
    + 'Exodus 15:11 (“uses that exact wording.”), Deuteronomy 3:24, and '
    + 'Deuteronomy 33:26 — back before the engine covered the whole Bible.',
  );
  await expect(card).toContainText(
    'Nothing changes yet. The search has changed a lot since then, so your old '
    + 'suggestions need a fresh look before they can count. Approving opens this '
    + 'search with today’s results so you can make your calls again; passages that '
    + 'already show up well may not need anything. Your new calls then follow the '
    + 'normal path into the next reviewed update.',
  );

  // Exactly one action — Approve. Decline and Not now are ABSENT, not
  // disabled: no such element exists anywhere on the screen.
  await expect(card.locator('button')).toHaveCount(1);
  await expect(card.locator('button')).toHaveText('Approve');
  await expect(page.locator('#screen-updates').getByText('Decline')).toHaveCount(0);
  await expect(page.locator('#screen-updates').getByText('Not now')).toHaveCount(0);

  // The §4.2 same-facts note, verbatim, rendered directly above the
  // checklist lines.
  const note = page.locator('#updates-same-facts');
  await expect(note).toHaveText(
    'These lines describe the same old suggestions as the card above — the card is the way to act on them.',
  );
  const noteIsAboveBacklog = await page.evaluate(() => {
    const noteElement = document.getElementById('updates-same-facts');
    return noteElement !== null && noteElement.nextElementSibling !== null
      && noteElement.nextElementSibling.id === 'updates-backlog';
  });
  expect(noteIsAboveBacklog).toBe(true);

  // The checklist preview renders in plain language — the raw "[ ] missing:"
  // token shapes never reach the screen.
  const lines = page.locator('#updates-backlog .write-line');
  await expect(lines).toHaveCount(3);
  await expect(lines.nth(0)).toHaveText('Exodus 15:11 should show up for “Who is like the Lord?” — uses that exact wording.');
  await expect(lines.nth(1)).toHaveText('Deuteronomy 3:24 should show up for “Who is like the Lord?” — Fits the theme');
  await expect(lines.nth(2)).toHaveText('Deuteronomy 33:26 should show up for “Who is like the Lord?” — fits the theme');
  await expect(page.locator('#screen-updates')).not.toContainText('missing:');
  await expect(page.locator('#screen-updates')).not.toContainText('[ ]');

  await assertNoJargon(page);

  // Before Approve is pressed the Updates screen has issued only the two
  // read calls — POST /api/v2/compile/preview and GET /api/v2/inbox — and
  // appended nothing to any log (no judgment, case, or apply POST anywhere).
  const screenCalls = mock.calls.slice(callsBefore);
  expect(screenCalls.map((call) => `${call.method} ${call.path}`).sort()).toEqual([
    'GET /api/v2/inbox',
    'POST /api/v2/compile/preview',
  ]);
  const writes = mock.calls.filter((call) => call.method === 'POST' && call.path !== '/api/v2/compile/preview');
  expect(writes).toEqual([]);

  // Approve is a pure hand-off into the existing stale-reconfirmation flow:
  // the Review surface opens on the query. (That machinery's own requests —
  // session creation included — are outside the screen's no-write assertion.)
  await page.click('.updates-approve');
  await expect(page.locator('#review-grid')).toBeVisible();
  await expect(page.locator('#screen-updates')).toBeHidden();
  await expect(page.locator('#search-input')).toHaveValue(LEGACY_QUERY);
  expect(mock.calls.some((call) => call.method === 'GET' && call.path === '/api/search'
    && decodeURIComponent(call.search.replace(/\+/g, ' ')).includes(LEGACY_QUERY))).toBe(true);

  expect(errors).toEqual([]);
});

test('D2: an empty log renders the steady empty state', async ({ page }) => {
  const errors = collectErrors(page);
  // The empty-log picture (the real server reaches it through the
  // WORKBENCH_JUDGMENTS_PATH override): an empty compile plan and no inbox
  // suggestions.
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();

  await openUpdates(page);
  await expect(page.locator('#updates-empty')).toHaveText(
    'Nothing to review — your calls in Review will show up here as suggested changes.',
  );
  await expect(page.locator('.updates-card')).toHaveCount(0);
  await expect(page.locator('#updates-backlog')).toHaveCount(0);
  await assertNoJargon(page);

  // The "Go to Review" button routes back to Review.
  await page.click('#updates-go-review');
  await expect(page.locator('#review-grid')).toBeVisible();

  expect(errors).toEqual([]);
});

test('D2: degraded mode renders the read-only banner and keeps the cards visible', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = realVoteMock();
  mock.degraded.value = true;
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();

  await openUpdates(page);
  const banner = page.locator('#banner-slot .banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Read-only right now.');
  // The cards are already read-only, so they stay visible and unchanged.
  await expect(page.locator('.updates-card')).toHaveCount(1);
  await expect(page.locator('.updates-card button')).toHaveText('Approve');
  await expect(page.locator('#updates-backlog .write-line')).toHaveCount(3);
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});
