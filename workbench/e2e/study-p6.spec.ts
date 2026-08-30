import { expect, test, type Page } from '@playwright/test';

import { FALLBACK_LOAD, UPDATES_LOAD_FAILED } from './endpointFailures';
import {
  collectErrors, derivationMock, installRoutes, makeMock, startStudyServer,
  type Call, type MockState, type StudyServer,
} from './study-shared';

// P6 demo spec (votes-to-engine plan, Phase 0 D2 → Phase 1 D7): the Updates
// screen's legacy re-confirmation card. Phase 1 replaced the Phase-0
// inbox-suggestion rendering with the DERIVED card from GET /api/v2/updates
// (§07.2: the card is now the sole surface for the three v1 votes, and
// Decline/Not now activate with the decide endpoint), so this spec covers:
// the §07.2 card copy verbatim, the two read calls and nothing else before a
// press, Approve = decide POST (cardRevision-pinned) + the fresh-look
// hand-off into Review, Decline's required one-line reason actually
// silencing the ask, the steady empty state, the degraded read-only state,
// and the D28 jargon quarantine over the rendered screen.

let server: StudyServer;
let origin: string;

test.beforeAll(async () => {
  server = await startStudyServer();
  origin = server.origin;
});

test.afterAll(async () => {
  await server.close();
});

const LEGACY_QUERY = 'Who is like the Lord?';
const LEGACY_AT = '2026-08-06T16:35:14.936Z';
const LEGACY_CARD_ID = 'a1'.repeat(32);
const LEGACY_REVISION = 'b2'.repeat(32);

// The real 3-vote checklist (workbench/judgments.jsonl:1-3), as the compile
// preview still serves it — the read-only backlog until Phase 4 retires it.
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

// The derived legacy re-confirmation card, §07.2's shape: the one card whose
// judgmentIds are 64-hex line hashes; votes ride the manifest entries.
function legacyCard(): Record<string, unknown> {
  const lineHashes = ['c3'.repeat(32), 'd4'.repeat(32), 'e5'.repeat(32)];
  return {
    cardId: LEGACY_CARD_ID,
    cardRevision: LEGACY_REVISION,
    kind: 're-confirmation',
    query: LEGACY_QUERY,
    targetKey: 'who is like the lord?',
    judgmentIds: lineHashes,
    contextJudgmentIds: [],
    votes: [
      { at: LEGACY_AT, reviewer: 'jesse', reference: 'Exodus 15:11', note: 'uses that exact wording.' },
      { at: LEGACY_AT, reviewer: 'jesse', reference: 'Deuteronomy 3:24', note: 'Fits the theme' },
      { at: LEGACY_AT, reviewer: 'jesse', reference: 'Deuteronomy 33:26', note: 'fits the theme' },
    ],
    derived: {},
    preCheck: 'identity-moved',
    identityNotes: [],
    legacy: { lineHashes },
    state: { decision: 'drafted' },
  };
}

function realVoteMock(): MockState {
  return makeMock({
    compilePlans: [realVotePlan()],
    updatesPayload: derivationMock([legacyCard()]),
  });
}

async function openUpdates(page: Page): Promise<void> {
  await page.click('.nav-item[data-nav="updates"]');
  await expect(page.locator('#screen-updates')).toBeVisible();
}

// The D28 jargon quarantine, as a binding AC: neither regex may match the
// rendered Updates screen text (the payload's digests and line hashes stay
// data-only).
async function assertNoJargon(page: Page): Promise<void> {
  const text = await page.locator('#screen-updates').innerText();
  expect(/[0-9a-f]{8}-/.test(text), `jargon id in rendered text: ${text}`).toBe(false);
  expect(/sha256/i.test(text), `sha256 in rendered text: ${text}`).toBe(false);
}

function decidePosts(mock: MockState): Call[] {
  return mock.calls.filter((call) => call.method === 'POST' && /\/api\/v2\/updates\/cards\/[^/]+\/decide$/.test(call.path));
}

test('P1: the real 3-vote log renders the derived legacy card + the checklist backlog', async ({ page }) => {
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

  // Phase 1's button set (§07.2): Approve + Decline + Not now, all live.
  await expect(card.locator('button.updates-approve')).toHaveText(/Approve/);
  await expect(card.locator('button.updates-decline')).toHaveText(/Decline/);
  await expect(card.locator('button.updates-park')).toHaveText(/Not now/);
  // The re-confirmation card keeps its dashed idiom — never the op border.
  await expect(card).not.toHaveClass(/\bop\b/);

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

  // A re-confirmation card stages nothing, so the tally row stays absent.
  await expect(page.locator('#updates-stats')).toHaveCount(0);

  await assertNoJargon(page);

  // Before any press the screen has issued exactly its two read calls —
  // GET /api/v2/updates and POST /api/v2/compile/preview — and appended
  // nothing (no decide, judgment, case, or apply POST anywhere).
  const screenCalls = mock.calls.slice(callsBefore);
  expect(screenCalls.map((call) => `${call.method} ${call.path}`).sort()).toEqual([
    'GET /api/v2/updates',
    'POST /api/v2/compile/preview',
  ]);
  expect(decidePosts(mock)).toEqual([]);

  expect(errors).toEqual([]);
});

test('P1: Approve records the pinned decide event AND opens the fresh look in Review (§07.2)', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = realVoteMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await page.click('.updates-approve');

  // The decide event, pinned by the card's cardRevision (§4.4).
  await expect(page.locator('#review-grid')).toBeVisible();
  const posts = decidePosts(mock);
  expect(posts).toHaveLength(1);
  expect(posts[0]!.path).toBe(`/api/v2/updates/cards/${LEGACY_CARD_ID}/decide`);
  expect(posts[0]!.body).toEqual({ decision: 'approve', cardRevision: LEGACY_REVISION });

  // The receipt is the opened session itself — Review on the query — with
  // no "goes into the next update" toast (§4.4's divergent row).
  await expect(page.locator('#screen-updates')).toBeHidden();
  await expect(page.locator('#search-input')).toHaveValue(LEGACY_QUERY);
  await expect(page.locator('#toast-slot .toast')).toHaveCount(0);
  expect(mock.calls.some((call) => call.method === 'GET' && call.path === '/api/search'
    && decodeURIComponent(call.search.replace(/\+/g, ' ')).includes(LEGACY_QUERY))).toBe(true);

  // Back on Updates, the approved legacy card stays in the main list with
  // the resumable status line — never an approved group or tally (§4.8).
  await openUpdates(page);
  await expect(page.locator('.updates-card')).toHaveCount(1);
  await expect(page.locator('.updates-card')).toContainText('Fresh look opened — finish your calls in Review');
  await expect(page.locator('#updates-approved-group')).toHaveCount(0);
  await expect(page.locator('#updates-stats')).toHaveCount(0);
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('P1: Decline requires its one-line why and actually silences the ask', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = realVoteMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // D opens the required-reason input; focus lands in it (§4.7).
  await page.click('.updates-decline');
  const input = page.locator('.decline-input');
  await expect(input).toBeFocused();
  await expect(page.locator('.decline-confirm')).toBeDisabled();
  expect(decidePosts(mock)).toEqual([]);

  // Esc cancels without recording anything; focus returns to the card.
  await page.keyboard.press('Escape');
  await expect(page.locator('.decline-input')).toHaveCount(0);
  expect(decidePosts(mock)).toEqual([]);

  // The reason rides the decide body; the card leaves the inbox while the
  // backlog lines stay (the checklist retires in Phase 4, not here).
  await page.click('.updates-decline');
  await page.fill('.decline-input', 'These were re-checked by hand already.');
  await page.keyboard.press('Enter');
  await expect(page.locator('#toast-slot .toast')).toContainText(
    'Declined — kept on record with your reason. Your original call still stands.',
  );
  const posts = decidePosts(mock);
  expect(posts).toHaveLength(1);
  expect(posts[0]!.body).toEqual({
    decision: 'decline',
    cardRevision: LEGACY_REVISION,
    reason: 'These were re-checked by hand already.',
  });
  await expect(page.locator('.updates-card')).toHaveCount(0);
  await expect(page.locator('#updates-same-facts')).toHaveCount(0);
  await expect(page.locator('#updates-backlog .write-line')).toHaveCount(3);
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('P1: an empty log renders the steady empty state', async ({ page }) => {
  const errors = collectErrors(page);
  // The empty-log picture (the real server reaches it through the
  // WORKBENCH_JUDGMENTS_PATH override): an empty derivation and an empty
  // compile plan.
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

test('P1: a compile-preview failure never claims the loaded cards failed — failure copy scopes per endpoint', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = realVoteMock();
  await installRoutes(page, mock);
  // The conflict-vote path: conflicting judgments 422 the compile preview
  // while GET /api/v2/updates still derives and serves the cards (the
  // deriver renders the conflict as a card; the compiler refuses).
  await page.route('**/api/v2/compile/preview', async (route) => {
    await route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, error: { code: 'conflicting_judgments', message: 'Conflicting judgments block the compile.' } }),
    });
  });
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // The cards loaded, so the §4.9 GET-updates sentence never renders — a
  // loaded card list never sits under a load-failure banner.
  await expect(page.locator('.updates-card')).toHaveCount(1);
  await expect(page.locator('#updates-cards-failed')).toHaveCount(0);
  await expect(page.locator('#screen-updates')).not.toContainText(UPDATES_LOAD_FAILED);
  // The backlog section reports its own data source's failure with
  // apiCompilePreview's D39 sentence (the one Finish up renders).
  await expect(page.locator('#updates-backlog-failed')).toHaveText(FALLBACK_LOAD);
  await expect(page.locator('#updates-backlog')).toHaveCount(0);
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('P1: degraded mode renders the read-only banner and disables every decide control', async ({ page }) => {
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
  // The card stays visible, but its decide controls are disabled (§4.8) and
  // no keystroke can post.
  await expect(page.locator('.updates-card')).toHaveCount(1);
  await expect(page.locator('.updates-approve')).toBeDisabled();
  await expect(page.locator('.updates-decline')).toBeDisabled();
  await expect(page.locator('.updates-park')).toBeDisabled();
  await page.locator('.updates-card').first().focus();
  await page.keyboard.press('n');
  expect(decidePosts(mock)).toEqual([]);
  await expect(page.locator('#updates-backlog .write-line')).toHaveCount(3);
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});
