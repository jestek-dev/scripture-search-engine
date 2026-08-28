import { expect, test, type Page } from '@playwright/test';

import {
  collectErrors, derivationMock, installRoutes, makeMock, result, startStudyServer, submit,
  type Call, type MockState, type StudyServer,
} from './study-shared';

// P7 demo spec (votes-to-engine plan, Phase 1 D7): the interactive Updates
// inbox. Covers §8.3's UI acceptance criteria: a derived card renders all
// five grammar parts in plain language (§4.3); the motivating it-is-well
// scenario walks end to end (vote → card → Approve records the pinned
// decide event); approve-requires-answer on the one question, with the
// deterministic chips and the "None of these" route (V3/V15); a conflict
// card resolves only by explicit choice (V10); the §4.4 409 arms refresh
// the card and never silently retry; the §4.7 keyboard path (J/K roving
// focus, A/D/N, U, Esc); and the D28 jargon regex at zero matches over
// every rendered card.

let server: StudyServer;
let origin: string;

test.beforeAll(async () => {
  server = await startStudyServer();
  origin = server.origin;
});

test.afterAll(async () => {
  await server.close();
});

const WELL_QUERY = 'it is well with my soul';
const DIGESTS = { resultSetDigest: 'd'.repeat(64), displayedWindowDigest: 'e'.repeat(64) };

// Realistic UUID judgment ids ride the payload as data — the D28 assertion
// must prove they never reach the rendered screen.
const WELL_JUDGMENT_ID = '0a1b2c3d-1111-4222-8333-944445555666';

function wellGuardCard(): Record<string, unknown> {
  return {
    cardId: '11'.repeat(32),
    cardRevision: '22'.repeat(32),
    kind: 'guard',
    query: WELL_QUERY,
    targetKey: 'kjv:24004010',
    judgmentIds: [WELL_JUDGMENT_ID],
    contextJudgmentIds: [],
    votes: [{
      judgmentId: WELL_JUDGMENT_ID,
      caseId: '9f8e7d6c-1234-4321-8888-777766665555',
      at: '2026-08-27T12:00:00.000Z',
      reviewer: 'jesse',
      action: 'irrelevant',
      reference: 'Jeremiah 4:10',
      diagnosis: 'lexical-noise',
      observedRank: 3,
      observedWindow: 10,
      ...DIGESTS,
    }],
    derived: { guard: { ref: 'Jeremiah 4:10', why: 'matched words, not meaning; judged not a fit for this query' } },
    preCheck: 'current',
    identityNotes: [],
    state: { decision: 'drafted' },
  };
}

function missingQuestionCard(): Record<string, unknown> {
  return {
    cardId: '33'.repeat(32),
    cardRevision: '44'.repeat(32),
    kind: 'missing-passage',
    query: 'Who is like the Lord?',
    targetKey: 'kjv:2015011',
    judgmentIds: ['5b6c7d8e-2222-4333-9444-000011112222'],
    contextJudgmentIds: [],
    votes: [{
      judgmentId: '5b6c7d8e-2222-4333-9444-000011112222',
      at: '2026-08-20T09:00:00.000Z',
      reviewer: 'jesse',
      action: 'missing',
      reference: 'Exodus 15:11',
      withinTop: 10,
      note: 'uses that exact wording.',
      observedRank: null,
      observedWindow: 10,
      ...DIGESTS,
    }],
    derived: { expectation: { ref: 'Exodus 15:11', withinTop: 10 }, anchorAddOnAnswer: { weight: 1 } },
    question: {
      id: 'theme',
      prompt: 'Which theme should carry this passage?',
      chips: [
        { conceptId: 'gods-incomparability', label: 'God’s incomparability', matchCount: 2, alreadyAnchored: false },
        { conceptId: 'praise-for-gods-character', label: 'praise for God’s character', matchCount: 1, alreadyAnchored: false },
      ],
    },
    preCheck: 'current',
    identityNotes: [],
    state: { decision: 'drafted' },
  };
}

function conflictCard(): Record<string, unknown> {
  const essentialVote = {
    judgmentId: '6c7d8e9f-3333-4444-a555-b66677778888',
    at: '2026-08-12T10:00:00.000Z',
    reviewer: 'jesse',
    action: 'essential',
    reference: 'Psalm 46:1',
    withinTop: 3,
    observedRank: 2,
    observedWindow: 10,
    ...DIGESTS,
  };
  const irrelevantVote = {
    judgmentId: '7d8e9fa0-4444-4555-b666-c77788889999',
    at: '2026-08-24T10:00:00.000Z',
    reviewer: 'jesse',
    action: 'irrelevant',
    reference: 'Psalm 46:1',
    diagnosis: 'concept-misfire',
    observedRank: 2,
    observedWindow: 10,
    ...DIGESTS,
  };
  return {
    cardId: '55'.repeat(32),
    cardRevision: '66'.repeat(32),
    kind: 'conflict',
    query: 'refuge in trouble',
    targetKey: 'kjv:19046001',
    judgmentIds: [essentialVote.judgmentId, irrelevantVote.judgmentId],
    contextJudgmentIds: [],
    votes: [essentialVote, irrelevantVote],
    derived: {},
    preCheck: 'current',
    identityNotes: [],
    conflict: {
      sides: [
        { judgmentIds: [essentialVote.judgmentId], summary: 'Psalm 46:1 expected in the top 3', votes: [essentialVote] },
        { judgmentIds: [irrelevantVote.judgmentId], summary: 'Psalm 46:1 kept out of results', votes: [irrelevantVote] },
      ],
    },
    state: { decision: 'drafted' },
  };
}

// The V6 identity-drift re-confirmation card (§4.3 example 3), as Phase 1's
// derive-time pre-check produces it: an identity-moved prefer vote routes
// its whole ordering entry here (the observation-bound remainder, §03.5).
// No `legacy` field — that marks §07.2's day-one card, a different variant.
function lookAgainCard(): Record<string, unknown> {
  return {
    cardId: 'aa'.repeat(32),
    cardRevision: 'bb'.repeat(32),
    kind: 're-confirmation',
    query: 'comfort in suffering',
    targetKey: 'kjv:47001004|kjv:19023004',
    judgmentIds: ['8e9fa0b1-5555-4666-a777-d88899990000'],
    contextJudgmentIds: [],
    votes: [{
      judgmentId: '8e9fa0b1-5555-4666-a777-d88899990000',
      at: '2026-08-20T09:00:00.000Z',
      reviewer: 'jesse',
      action: 'prefer',
      preferredReference: '2 Corinthians 1:4',
      otherReference: 'Psalm 23:4',
      observedRank: 4,
      observedWindow: 10,
      ...DIGESTS,
    }],
    derived: {},
    preCheck: 'identity-moved',
    identityNotes: [{ dimension: 'layerFingerprint', recorded: 'layer-old', current: 'layer-current' }],
    state: { decision: 'drafted' },
  };
}

async function openUpdates(page: Page): Promise<void> {
  await page.click('.nav-item[data-nav="updates"]');
  await expect(page.locator('#screen-updates')).toBeVisible();
}

async function assertNoJargon(page: Page): Promise<void> {
  const text = await page.locator('#screen-updates').innerText();
  expect(/[0-9a-f]{8}-/.test(text), `jargon id in rendered text: ${text}`).toBe(false);
  expect(/sha256/i.test(text), `sha256 in rendered text: ${text}`).toBe(false);
}

function decidePosts(mock: MockState): Call[] {
  return mock.calls.filter((call) => call.method === 'POST' && /\/api\/v2\/updates\/cards\/[^/]+\/decide$/.test(call.path));
}

function updatesGets(mock: MockState): Call[] {
  return mock.calls.filter((call) => call.method === 'GET' && call.path === '/api/v2/updates');
}

// ---------------------------------------------------------------------------
// D7 — the card grammar (§4.3 example 1, rendered verbatim)
// ---------------------------------------------------------------------------

test('D7: a derived guard card renders all five grammar parts in plain language', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([wellGuardCard()]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  const card = page.locator('.updates-card');
  await expect(card).toHaveCount(1);
  // 1. Headline — the outcome in Jesse's vocabulary.
  await expect(card.locator('h2')).toHaveText('Keep Jeremiah 4:10 out of the top results for “it is well with my soul”');
  // 2. Because-line — his own vote, the diagnosis through COPY.plainWhy.
  await expect(card).toContainText('Because you marked it Not relevant on Aug 27 — matched words, not meaning.');
  // 3. What-will-change — the operation in plain words.
  await expect(card).toContainText(
    'This will add a line to the answer sheet: Jeremiah 4:10 must not rank for this search. '
    + 'The checks will hold every future update to it.',
  );
  // 4. No question on this card — the grammar allows at most one.
  await expect(card.locator('.updates-chips')).toHaveCount(0);
  // 5. Buttons: Approve / Decline / Not now, with their keycaps.
  await expect(card.locator('.updates-approve')).toContainText('Approve');
  await expect(card.locator('.updates-decline')).toContainText('Decline');
  await expect(card.locator('.updates-park')).toContainText('Not now');
  // The two quiet links, and the op-card border (solid, not the dashed
  // re-confirmation idiom).
  await expect(card.locator('.updates-links button').nth(0)).toHaveText('See it in search');
  await expect(card.locator('.updates-links button').nth(1)).toHaveText('Change your call');
  await expect(card).toHaveClass(/\bop\b/);
  // The tally row counts this one waiting card.
  await expect(page.locator('#updates-stats')).toHaveText('1 waiting for your call');
  // Raw tokens never render: no diagnosis token, no UUID, no digest (D28).
  await expect(page.locator('#screen-updates')).not.toContainText('lexical-noise');
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D7 — the it-is-well walk: vote → card → Approve, end to end (§1.5/§4.3)
// ---------------------------------------------------------------------------

test('D7: the it-is-well scenario walks end to end — vote, card, pinned Approve', async ({ page }) => {
  const errors = collectErrors(page);
  const card = wellGuardCard();
  const mock = makeMock({
    updatesPayload: derivationMock([card]),
    extraSearches: {
      [WELL_QUERY]: [
        result('KJV:24004010', 'Jeremiah 4:10', 'they shall have peace; whereas the sword reacheth unto the soul.', [
          { family: 'token_overlap', label: 'Contains "it is well"', points: 431 },
        ]),
      ],
    },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();

  // 1. The vote: X on the word-match result, through the §3.13 interview.
  await submit(page, WELL_QUERY);
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('x');
  await expect(page.locator('#interview-dialog')).toContainText(
    'This looks like a word match without the meaning — “it is well” appears, but the verse is about something else.',
  );
  await page.click('#interview-confirm');
  await expect(page.locator('#interview-dialog')).toHaveCount(0);
  await expect.poll(() =>
    mock.calls.some((call) => call.method === 'POST' && call.path === '/api/v2/judgments'),
  ).toBe(true);
  const votePost = mock.calls.find((call) => call.method === 'POST' && call.path === '/api/v2/judgments');
  expect(votePost!.body).toMatchObject({ action: 'irrelevant', diagnosis: 'lexical-noise' });

  // 2. The card: the Updates screen renders the derived guard card.
  await openUpdates(page);
  await expect(page.locator('.updates-card h2')).toHaveText(
    'Keep Jeremiah 4:10 out of the top results for “it is well with my soul”',
  );

  // 3. Approve — one keystroke, pinned by the card's cardRevision (§4.4).
  await page.keyboard.press('a');
  await expect(page.locator('#toast-slot .toast')).toContainText(
    'Approved — this goes into the next update. Nothing changes in search until that update is reviewed and goes live.',
  );
  const posts = decidePosts(mock);
  expect(posts).toHaveLength(1);
  expect(posts[0]!.path).toBe(`/api/v2/updates/cards/${card.cardId as string}/decide`);
  expect(posts[0]!.body).toEqual({ decision: 'approve', cardRevision: card.cardRevision });

  // The card moves to the approved group; the tally follows; nothing in the
  // engine moved (no compile apply, no checks run — pure staging).
  await expect(page.locator('#updates-approved-group summary')).toHaveText('Approved for the next update (1)');
  await expect(page.locator('#updates-approved-group .updates-card')).toContainText('Approved — waiting for the next update.');
  await expect(page.locator('#updates-stats')).toHaveText('1 approved for the next update');
  expect(mock.calls.filter((call) => call.path === '/api/v2/compile/apply' || call.path === '/api/v2/checks')).toEqual([]);
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D7 — the one question: the human answers, the machine never picks (V3/V15)
// ---------------------------------------------------------------------------

test('D7: approving a question card requires the answer; the chip rides the decide body', async ({ page }) => {
  const errors = collectErrors(page);
  const card = missingQuestionCard();
  const mock = makeMock({ updatesPayload: derivationMock([card]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  const cardEl = page.locator('.updates-card');
  await expect(cardEl.locator('h2')).toHaveText('Make Exodus 15:11 rank in the top 10 for “Who is like the Lord?”');
  await expect(cardEl).toContainText('Because you suggested it as a Missing passage on Aug 20 — “uses that exact wording.”');
  await expect(cardEl).toContainText('This will add a line to the answer sheet saying Exodus 15:11 belongs in the top 10.');
  await expect(cardEl).toContainText('To help it rank, the passage can also be listed under a theme:');
  await expect(cardEl).toContainText('Which theme should carry this passage?');

  // The deterministic chips render sentence-case, plus the routed exit.
  const chips = cardEl.locator('.updates-chips .pick-chip');
  await expect(chips).toHaveCount(3);
  await expect(chips.nth(0)).toHaveText('God’s incomparability');
  await expect(chips.nth(1)).toHaveText('Praise for God’s character');
  await expect(chips.nth(2)).toHaveText('None of these — needs a new theme');

  // Approve is disabled until the human answers; no decide can post.
  await expect(cardEl.locator('.updates-approve')).toBeDisabled();
  await page.keyboard.press('a');
  expect(decidePosts(mock)).toEqual([]);

  // Picking a chip enables Approve; the answer rides the decide body as the
  // operation's recorded evidence.
  await chips.nth(0).click();
  await expect(chips.nth(0)).toHaveAttribute('aria-pressed', 'true');
  await expect(cardEl.locator('.updates-approve')).toBeEnabled();
  await cardEl.locator('.updates-approve').click();
  // The decide POST is async; await it in the harness log before asserting.
  await expect.poll(() => decidePosts(mock).length).toBe(1);
  const posts = decidePosts(mock);
  expect(posts[0]!.body).toEqual({
    decision: 'approve',
    cardRevision: card.cardRevision,
    answers: { theme: 'gods-incomparability' },
  });
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('D7: "None of these — needs a new theme" approves the line alone and says so', async ({ page }) => {
  const errors = collectErrors(page);
  const card = missingQuestionCard();
  const mock = makeMock({ updatesPayload: derivationMock([card]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await page.locator('.updates-chips .pick-chip', { hasText: 'None of these — needs a new theme' }).click();
  await page.locator('.updates-approve').click();
  // The decide POST is async; await it in the harness log before asserting.
  await expect.poll(() => decidePosts(mock).length).toBe(1);
  const posts = decidePosts(mock);
  expect(posts[0]!.body).toEqual({
    decision: 'approve',
    cardRevision: card.cardRevision,
    answers: { theme: 'needs-new-theme' },
  });
  // The approved card carries the V15 sentence: the theme work routes to a
  // human, never a machine mint.
  await expect(page.locator('#updates-approved-group .updates-card')).toContainText(
    'Saved — the answer-sheet line goes in this update. Drafting the new theme is a separate, human-reviewed step.',
  );
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D7 — the conflict card resolves only by explicit choice (V10)
// ---------------------------------------------------------------------------

test('D7: a conflict card shows both sides and resolves only by explicit choice', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([conflictCard()]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  const card = page.locator('.updates-card');
  await expect(card.locator('h2')).toHaveText('Two of your calls disagree about Psalm 46:1 for “refuge in trouble”');
  // Both sides, with their dates and the plain-language diagnosis.
  await expect(card).toContainText('On Aug 12 you marked it Essential (top 3).');
  await expect(card).toContainText('On Aug 24 you marked it Not relevant — speaks about the theme, but is not an answer for this query.');
  // The buttons are the two choices plus Not now — no Approve, no Decline.
  await expect(card).toContainText('Keep one:');
  const picks = card.locator('.updates-actions .btn-quiet');
  await expect(card.locator('.updates-approve')).toHaveCount(0);
  await expect(card.locator('.updates-decline')).toHaveCount(0);
  await expect(card.locator('.updates-park')).toHaveCount(1);

  // A and D keystrokes are inert on a conflict card — nothing posts, nothing
  // is silently dropped (V10).
  await card.focus();
  await page.keyboard.press('a');
  await page.keyboard.press('d');
  expect(decidePosts(mock)).toEqual([]);

  // Not now parks it — the only decide this card accepts.
  await page.keyboard.press('n');
  await expect(page.locator('#updates-parked-group summary')).toHaveText('Not now (1)');
  expect(decidePosts(mock)).toHaveLength(1);
  expect(decidePosts(mock)[0]!.body).toMatchObject({ decision: 'park' });

  expect(errors).toEqual([]);
});

test('D7: picking a conflict side hands off into Review for the superseding call', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([conflictCard()]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await expect(page.locator('.updates-card')).toContainText(
    'Picking one opens this search in Review so your pick is recorded as a fresh call.',
  );
  await page.locator('.updates-actions .btn-quiet', { hasText: 'Essential, top 3' }).click();
  // The pick opens Review on the query — the existing supersede mechanism's
  // door; the card itself records nothing (the decide endpoint refuses
  // approve/decline on conflicts).
  await expect(page.locator('#review-grid')).toBeVisible();
  await expect(page.locator('#search-input')).toHaveValue('refuge in trouble');
  expect(decidePosts(mock)).toEqual([]);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D7 — the V6 identity-drift "Look again" card (§4.3 example 3)
// ---------------------------------------------------------------------------

test('D7: the V6 identity-drift card renders the two-button "Look again" form', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([lookAgainCard()]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  const card = page.locator('.updates-card');
  await expect(card).toHaveCount(1);
  // Headline + body: the situation changed since the vote, in plain words —
  // the moved dimension is named ("the theme files"), never a fingerprint.
  await expect(card.locator('h2')).toHaveText('Look again: “comfort in suffering” has changed since your call');
  await expect(card).toContainText(
    'You said 2 Corinthians 1:4 should rank above Psalm 23:4 on Aug 20, but the theme files '
    + 'changed since then. Your call was about what you saw that day — take one fresh look '
    + 'before this goes into an update.',
  );
  // The blessed two-button form (§4.3/§4.4): "Look again" primary + Not now.
  // Approve is suppressed (the primary is the hand-off), Decline is absent —
  // this variant keeps the two-button shape the legacy card diverges from.
  const primary = card.locator('.updates-approve');
  await expect(primary).toHaveText('Look again');
  await expect(card.locator('.updates-decline')).toHaveCount(0);
  await expect(card.locator('.updates-park')).toHaveCount(1);
  // Dashed re-confirmation idiom, never the op border; no operation derives
  // on it, so no what-will-change line, no question, no quiet links, and the
  // tally row stays absent (it stages nothing).
  await expect(card).not.toHaveClass(/\bop\b/);
  await expect(card.locator('.updates-chips')).toHaveCount(0);
  await expect(card.locator('.updates-links')).toHaveCount(0);
  await expect(page.locator('#updates-stats')).toHaveCount(0);

  // A and D keystrokes are inert — its A/D never post and no decline input
  // opens (the decide endpoint refuses approve/decline on this variant).
  await card.focus();
  await page.keyboard.press('a');
  await page.keyboard.press('d');
  await expect(page.locator('.decline-input')).toHaveCount(0);
  expect(decidePosts(mock)).toEqual([]);
  await assertNoJargon(page);

  // "Look again" is a pure hand-off: it opens the query in Review as the
  // fresh-look door and records nothing — no decide POST, ever.
  await primary.click();
  await expect(page.locator('#review-grid')).toBeVisible();
  await expect(page.locator('#search-input')).toHaveValue('comfort in suffering');
  expect(decidePosts(mock)).toEqual([]);

  expect(errors).toEqual([]);
});

test('D7: Not now is the only decide a "Look again" card posts', async ({ page }) => {
  const errors = collectErrors(page);
  const card = lookAgainCard();
  const mock = makeMock({ updatesPayload: derivationMock([card]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await page.locator('.updates-card').focus();
  await page.keyboard.press('n');
  await expect(page.locator('#updates-parked-group summary')).toHaveText('Not now (1)');
  const posts = decidePosts(mock);
  expect(posts).toHaveLength(1);
  expect(posts[0]!.path).toBe(`/api/v2/updates/cards/${card.cardId as string}/decide`);
  expect(posts[0]!.body).toEqual({ decision: 'park', cardRevision: card.cardRevision });
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D7 — the §4.4 409 arms: refresh, never silently retry
// ---------------------------------------------------------------------------

test('D7: a stale cardRevision 409 shows the refresh line, re-derives, and never auto-retries', async ({ page }) => {
  const errors = collectErrors(page);
  const staleCard = wellGuardCard();
  const freshCard = { ...wellGuardCard(), cardRevision: '77'.repeat(32) };
  const mock = makeMock({ updatesPayload: derivationMock([staleCard]) });
  mock.decideResponder = (cardId, body, n) => {
    if (n === 1) {
      // An input moved under the card between derive and decide (FM-11):
      // the fresh revision is what the next derive serves.
      mock.updatesPayload = derivationMock([freshCard]);
      return {
        status: 409,
        payload: { ok: false, error: { code: 'stale_card_revision', message: 'The picture changed since you read this — reload your updates and decide against the fresh card.' } },
      };
    }
    return null;
  };
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // Slow the reload GET so the refresh copy is observable in place.
  await page.route('**/api/v2/updates', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fallback();
  });

  const getsBefore = updatesGets(mock).length;
  await page.locator('.updates-approve').click();
  await expect(page.locator('#screen-updates')).toContainText(
    'The picture changed since you read this — reloading your updates now.',
  );
  // The reload completes: the fresh card renders with the new pin, the
  // refresh line clears, and the decision was NOT retried.
  await expect(page.locator('#updates-reloading')).toHaveCount(0);
  await expect(page.locator('.refresh-line')).toHaveCount(0);
  await expect(page.locator('.updates-approve')).toBeVisible();
  expect(updatesGets(mock).length).toBe(getsBefore + 1);
  expect(decidePosts(mock)).toHaveLength(1);

  // The same decision is one keystroke away — and now carries the new pin.
  await page.locator('.updates-approve').click();
  await expect(page.locator('#toast-slot .toast')).toContainText('Approved — this goes into the next update.');
  const posts = decidePosts(mock);
  expect(posts).toHaveLength(2);
  expect(posts[1]!.body).toEqual({ decision: 'approve', cardRevision: freshCard.cardRevision });
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('D7: a superseded card 409 renders the fresh card with the FM-13 sentence', async ({ page }) => {
  const errors = collectErrors(page);
  const oldCard = wellGuardCard();
  const replacement = {
    ...wellGuardCard(),
    cardId: '88'.repeat(32),
    cardRevision: '99'.repeat(32),
  };
  const mock = makeMock({ updatesPayload: derivationMock([oldCard]) });
  mock.decideResponder = (cardId, body, n) => {
    if (n === 1) {
      // A contributing judgment was superseded: the old id no longer
      // derives; the replacement is a different card (02.6).
      mock.updatesPayload = derivationMock([replacement]);
      return {
        status: 409,
        payload: { ok: false, error: { code: 'card_not_derived', message: 'You changed your call on this since the card was written. Reload your updates for the fresh card.' } },
      };
    }
    return null;
  };
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await page.locator('.updates-approve').click();
  // The replacement card renders where the old one stood, headed by the
  // FM-13 sentence; nothing was recorded against the stale picture.
  const fresh = page.locator('.updates-card');
  await expect(fresh).toHaveCount(1);
  await expect(fresh.locator('.fm13-line')).toHaveText(
    'You changed your call on this since the card was written. Here is the fresh card.',
  );
  await expect(fresh.locator('h2')).toHaveText('Keep Jeremiah 4:10 out of the top results for “it is well with my soul”');
  expect(decidePosts(mock)).toHaveLength(1);
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D7 — the §4.7 keyboard path
// ---------------------------------------------------------------------------

test('D7: J/K rove the card list; A/D/N decide the focused card; U re-opens it', async ({ page }) => {
  const errors = collectErrors(page);
  // Two cards: the guard (newer vote, renders first) and the question card.
  const guard = wellGuardCard();
  const question = missingQuestionCard();
  const mock = makeMock({ updatesPayload: derivationMock([guard, question]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  const cards = page.locator('#updates-cards .updates-card');
  await expect(cards).toHaveCount(2);
  // Most recent contributing vote first: the Aug 27 guard, then Aug 20.
  await expect(cards.nth(0)).toHaveClass(/\bop\b/);
  await expect(cards.nth(0).locator('h2')).toContainText('Jeremiah 4:10');
  await expect(cards.nth(1).locator('h2')).toContainText('Exodus 15:11');

  // J moves focus down, K back up — the Review list's exact keys (§4.7).
  await page.keyboard.press('j');
  await expect(cards.nth(1)).toBeFocused();
  await page.keyboard.press('k');
  await expect(cards.nth(0)).toBeFocused();

  // D opens the required-reason input on the focused card; Esc cancels and
  // returns focus to the card.
  await page.keyboard.press('d');
  await expect(page.locator('.decline-input')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.decline-input')).toHaveCount(0);
  await expect(cards.nth(0)).toBeFocused();
  expect(decidePosts(mock)).toEqual([]);

  // N parks the focused card into the Not now group.
  await page.keyboard.press('n');
  await expect(page.locator('#updates-parked-group summary')).toHaveText('Not now (1)');
  expect(decidePosts(mock)).toHaveLength(1);
  expect(decidePosts(mock)[0]!.body).toEqual({ decision: 'park', cardRevision: guard.cardRevision });

  // U re-opens the just-decided card's buttons (another decide from the
  // closed set — latest wins pre-seal; U itself appends nothing).
  await page.keyboard.press('u');
  await expect(page.locator('#updates-parked-group .updates-approve')).toBeVisible();
  expect(decidePosts(mock)).toHaveLength(1);
  await page.locator('#updates-parked-group .updates-approve').click();
  // The decide POST is async; await it in the harness log before asserting.
  await expect.poll(() => decidePosts(mock).length).toBe(2);
  expect(decidePosts(mock)[1]!.body).toEqual({ decision: 'approve', cardRevision: guard.cardRevision });
  await expect(page.locator('#updates-approved-group summary')).toHaveText('Approved for the next update (1)');
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});
