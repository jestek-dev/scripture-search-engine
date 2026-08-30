import { expect, test, type Page } from '@playwright/test';

import {
  collectErrors, derivationMock, GUARD_REPORT_LEAD_TEXT, guardTrainView, installRoutes, makeMock,
  sealedTrainSnapshot, startStudyServer,
  type Call, type MockState, type StudyServer,
} from './study-shared';

// P8 demo spec (votes-to-engine plan, Phase 2 "Guard trains" — §8.4's UI
// acceptance criteria, §4.5/§4.6/§4.8): the train summary restates exactly
// the approved cards; Start sits behind the one-confirm layer and triggers
// exactly the one seal POST; unattended progress renders from the observed
// train-state endpoint (the Phase-2 server runs the checks inside the admit
// request and mints no job, so there is no SSE stream to subscribe to yet —
// the jobs/SSE wiring is Phase 3's D12); the fixture-lane Update Report
// renders the server's verbatim lead and plain-language lines; the Phase-2
// approve act (admit → draft-PR preparation) round-trips with its exact
// bodies; a stopped train renders its §06.2 plain-language reason; the §4.8
// parked outcome carries §5.4's copy; single-flight refuses a second Start
// with the verbatim line; degraded mode disables initiation. D28's jargon
// regex holds at zero matches over the whole rendered screen throughout.

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

function approvedGuardCard(): Record<string, unknown> {
  return {
    cardId: '11'.repeat(32),
    cardRevision: '22'.repeat(32),
    kind: 'guard',
    query: WELL_QUERY,
    targetKey: 'kjv:24004010',
    judgmentIds: ['0a1b2c3d-1111-4222-8333-944445555666'],
    contextJudgmentIds: [],
    votes: [{
      judgmentId: '0a1b2c3d-1111-4222-8333-944445555666',
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
    state: { decision: 'approved', decidedAt: '2026-08-27T13:00:00.000Z' },
  };
}

function approvedExpectCard(): Record<string, unknown> {
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
      observedRank: null,
      observedWindow: 10,
      ...DIGESTS,
    }],
    derived: { expectation: { ref: 'Exodus 15:11', withinTop: 10 } },
    preCheck: 'current',
    identityNotes: [],
    state: { decision: 'approved', decidedAt: '2026-08-20T10:00:00.000Z' },
  };
}

// A data-flavored approval: the answered theme question stages an anchor
// add, and the chapter rides into the test corpus.
function approvedDataCard(): Record<string, unknown> {
  return {
    ...approvedExpectCard(),
    derived: {
      expectation: { ref: 'Exodus 15:11', withinTop: 10 },
      anchorAddOnAnswer: { weight: 1 },
      chapterAdd: { book: 'Exodus', chapter: 15 },
    },
    question: {
      id: 'theme',
      prompt: 'Which theme should carry this passage?',
      chips: [{ conceptId: 'gods-incomparability', label: 'God’s incomparability', matchCount: 2, alreadyAnchored: false }],
    },
    state: {
      decision: 'approved',
      decidedAt: '2026-08-20T10:00:00.000Z',
      answers: { theme: 'gods-incomparability' },
    },
  };
}

function stoppedTrainSnapshot(reason: string, at = '2026-08-27T18:00:00.000Z'): Record<string, unknown> {
  return sealedTrainSnapshot({
    state: 'stopped',
    stopped: {
      schemaVersion: 1,
      eventId: '0a1b2c3d-7777-4888-9999-000011112222',
      at,
      reviewer: 'jesse',
      kind: 'train-stopped',
      trainId: 'train-0001',
      reason,
    },
  });
}

async function openUpdates(page: Page): Promise<void> {
  await page.click('.nav-item[data-nav="updates"]');
  await expect(page.locator('#screen-updates')).toBeVisible();
}

// The D28 jargon quarantine, as a binding AC (§4.9): zero matches over the
// whole rendered Updates screen — the update panel and report included.
async function assertNoJargon(page: Page): Promise<void> {
  const text = await page.locator('#screen-updates').innerText();
  expect(/[0-9a-f]{8}-/.test(text), `jargon id in rendered text: ${text}`).toBe(false);
  expect(/sha256/i.test(text), `sha256 in rendered text: ${text}`).toBe(false);
}

function sealPosts(mock: MockState): Call[] {
  return mock.calls.filter((call) => call.method === 'POST' && call.path === '/api/v2/updates/train');
}
function signPosts(mock: MockState): Call[] {
  return mock.calls.filter((call) => call.method === 'POST' && /\/api\/v2\/updates\/train\/[^/]+\/sign$/.test(call.path));
}

// ---------------------------------------------------------------------------
// §4.5 — the train summary restates exactly what has been approved
// ---------------------------------------------------------------------------

test('D8: the guard train summary matches the approved cards, with the verbatim machine-time sentence', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([approvedGuardCard(), approvedExpectCard()]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // §4.8 "Empty (all approved)": nothing waits, the queue is stated.
  await expect(page.locator('#updates-all-approved')).toHaveText(
    'All caught up — 2 changes approved and waiting. Start the update below when you’re ready.',
  );
  const summary = page.locator('#updates-train-summary');
  await expect(summary.locator('h2')).toHaveText('Start the update');
  await expect(summary).toContainText('This update will contain:');
  // Counts of approved intents — Jesse's own words played back; never a
  // predicted reordering.
  await expect(summary.locator('.train-contains li')).toHaveCount(1);
  await expect(summary.locator('.train-contains li').first()).toHaveText(
    '2 answer-sheet lines across 2 searches (1 must-rank, 1 must-not-rank)',
  );
  // The guard machine-time sentence, verbatim (§4.5) — this update only
  // writes answer-sheet lines, so the lane derives guard.
  await expect(summary).toContainText(
    'This update only writes lines on the answer sheet, so the checks are quicker — usually inside '
    + 'three quarters of an hour, about double that until a one-time independent sign-off clears two '
    + 'standing checks. The screen shows how long each run actually takes.',
  );
  await expect(summary.locator('#train-start')).toBeEnabled();
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('D8: a theme change or corpus addition makes the summary data-flavored with its own sentence', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([approvedDataCard()]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  const items = page.locator('#updates-train-summary .train-contains li');
  await expect(items).toHaveCount(3);
  await expect(items.nth(0)).toHaveText('1 answer-sheet line across 1 search (1 must-rank)');
  await expect(items.nth(1)).toHaveText('1 theme change (add Exodus 15:11 under “God’s incomparability”)');
  await expect(items.nth(2)).toHaveText('1 addition to the test corpus so a new answer can be checked');
  await expect(page.locator('#updates-train-summary')).toContainText(
    'The checks run next — they usually take between half an hour and an hour and a half. You don’t '
    + 'need to stay. When they finish, the report shows exactly what changed in which searches, and '
    + 'nothing goes live until you’ve read it, signed it, and merged it.',
  );
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// §4.5 — Start: one confirm, exactly one seal POST
// ---------------------------------------------------------------------------

test('D8: Start opens the one-confirm layer and confirming posts exactly the seal call', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([approvedGuardCard()]) });
  mock.trainView = guardTrainView('ready');
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // The one-confirm layer (§4.5, verbatim): initial focus on Cancel, Esc
  // closes, and nothing posts until the layer's own button is pressed.
  await page.click('#train-start');
  const dialog = page.locator('#train-confirm-dialog');
  await expect(dialog.locator('.layer-title')).toHaveText('You’re starting the update.');
  await expect(dialog).toContainText(
    'Once it starts, these approved changes travel together — new calls you make will go into the next update instead.',
  );
  await expect(dialog.locator('#train-confirm-cancel')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#train-confirm-dialog')).toHaveCount(0);
  expect(sealPosts(mock)).toEqual([]);

  // Confirming seals: exactly one POST, carrying the derivation digest the
  // panel rendered from — and nothing else mutates.
  await page.click('#train-start');
  await page.click('#train-confirm-commit');
  await expect(page.locator('#train-status')).toHaveText('The report is ready — read it and sign below.');
  const posts = sealPosts(mock);
  expect(posts).toHaveLength(1);
  expect(posts[0]!.body).toEqual({ derivationDigest: 'c'.repeat(64) });
  expect(signPosts(mock)).toEqual([]);
  // The strip reaches "Ready for your review"; the sealed cards left the
  // summary position (no second Start renders).
  await expect(page.locator('.train-step.current')).toHaveText('Ready for your review');
  await expect(page.locator('#train-start')).toHaveCount(0);
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// §4.6 — unattended progress renders from the observed train state
// ---------------------------------------------------------------------------

test('D8: progress renders unattended from the observed train state (poll)', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([], [sealedTrainSnapshot()]) });
  // First observation: admitted; the next: the draft PR is open. The panel
  // must move between them with no interaction.
  mock.trainViewResponder = (trainId, n) => ({
    status: 200,
    payload: {
      ok: true,
      data: {
        train: n === 1
          ? guardTrainView('admitted')
          : guardTrainView('pr-open', { draftPrUrl: 'https://github.com/example/scripture-search-engine/pull/999' }),
        readOnly: false,
      },
    },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await expect(page.locator('#train-status')).toHaveText('Approved. Preparing the change for review on GitHub…');
  await expect(page.locator('.train-step.current')).toHaveText('Approved');
  // The poll (4s) observes the moved state without any click.
  await expect(page.locator('#train-status')).toHaveText(
    'Waiting for the final merge. One click on GitHub makes it live.',
    { timeout: 15_000 },
  );
  await expect(page.locator('.train-step.current')).toHaveText('Waiting for merge');
  await expect(page.locator('#train-pr-link')).toHaveAttribute(
    'href', 'https://github.com/example/scripture-search-engine/pull/999',
  );
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// §4.6 — the fixture-lane Update Report + the Phase-2 approve act
// ---------------------------------------------------------------------------

test('D8: the guard Update Report renders the verbatim lead and plain-language lines', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([], [sealedTrainSnapshot()]) });
  mock.trainView = guardTrainView('ready');
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  const report = page.locator('#updates-report');
  await expect(report.locator('h3')).toHaveText('Update Report');
  // The lead ships verbatim FROM THE PAYLOAD — the server's report module is
  // its single writer; the page mints no rival sentence (E4).
  await expect(report).toContainText(GUARD_REPORT_LEAD_TEXT);
  await expect(report.locator('.train-report-lines li')).toHaveCount(1);
  await expect(report.locator('.train-report-lines li').first()).toHaveText(
    'For "it is well with my soul", Jeremiah 4:10 must not rank. Why: matched words, not meaning; judged not a fit for this query',
  );
  // The strip renders the guard path only — never a trial-build or
  // comparison step (§4.6's fixture-lane rule).
  const stepText = await page.locator('.train-strip').innerText();
  expect(stepText).not.toContain('Building the trial run');
  expect(stepText).not.toContain('Measuring what changes');
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('D14: signing round-trips — the typed code enables the button, one POST carries the FULL digest, the draft opens', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([], [sealedTrainSnapshot()]) });
  mock.trainView = guardTrainView('ready');
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // The sign panel (§4.6): the Finish-up mechanics reused — the shared
  // explanation sentence, the 12-hex chip grouped 4-4-4, and the covenant
  // line that the merge remains the approval that counts.
  const panel = page.locator('#train-sign-panel');
  await expect(panel).toContainText(
    'This step changes reviewed files, so it asks for a signature: type the code below exactly. '
    + 'That is deliberate friction — it means nothing is written by a stray click.',
  );
  await expect(panel).toContainText(
    'After you sign, this becomes a draft change on GitHub. It goes live only when a human merges it '
    + '— that final click is the approval that counts.',
  );
  await expect(page.locator('#train-sign-code')).toHaveText('abab abab abab');
  // The button stays disabled until the code matches (case-insensitive,
  // spaces ignored); a wrong code posts nothing.
  await expect(page.locator('#train-sign')).toBeDisabled();
  await page.fill('#train-sign-input', 'ffff ffff ffff');
  await expect(page.locator('#train-sign')).toBeDisabled();
  expect(signPosts(mock)).toEqual([]);
  await page.fill('#train-sign-input', 'ABAB abab ab ab');
  await expect(page.locator('#train-sign')).toBeEnabled();
  await page.click('#train-sign');

  // One POST, carrying the FULL report digest; the server runs the admit +
  // publish tail behind the same act and returns the pr-open view.
  await expect(page.locator('#train-status')).toHaveText(
    'Waiting for the final merge. One click on GitHub makes it live.',
  );
  const signs = signPosts(mock);
  expect(signs).toHaveLength(1);
  expect(signs[0]!.path).toBe('/api/v2/updates/train/train-0001/sign');
  expect(signs[0]!.body).toEqual({ digest: 'ab'.repeat(32) });
  // The draft-PR hand-off: the one act left is the merge, on GitHub.
  await expect(page.locator('#train-pr-link')).toHaveText('Open the draft on GitHub');
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('D14: a refused sign act renders the verbatim §4.9 sentence and the panel stays', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([], [sealedTrainSnapshot()]) });
  mock.trainView = guardTrainView('ready');
  mock.trainSignResponder = () => ({
    status: 500,
    payload: { ok: false, error: { code: 'admission_failed', message: 'boom' } },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await page.fill('#train-sign-input', 'abab abab abab');
  await page.click('#train-sign');
  await expect(page.locator('#updates-train-error')).toHaveText(
    'The signature didn’t go through — the code may have changed. Reloading the report now.',
  );
  expect(signPosts(mock)).toHaveLength(1);
  // The act stays available — the train is still ready.
  await expect(page.locator('#train-sign')).toBeVisible();
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// §4.8 — the stopped train and the parked no-effect outcome
// ---------------------------------------------------------------------------

test('D8: a stopped train renders its plain-language reason; the enum token never renders', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([approvedGuardCard()], [stoppedTrainSnapshot('verify-failed')]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await expect(page.locator('.train-step.current')).toHaveText('Stopped');
  await expect(page.locator('#train-stop-card')).toContainText(
    'The checks failed. Nothing was written. The report names which check and shows why in plain words.',
  );
  // D17: the stop also names its one next action (study-p10 covers all 14).
  await expect(page.locator('#train-stop-next-action')).toContainText('Next step:');
  const text = await page.locator('#screen-updates').innerText();
  expect(text).not.toContain('verify-failed');
  // The cards came back to the inbox (approved again) — the §4.5 position
  // renders below the stop card, ready for the next attempt.
  await expect(page.locator('#updates-train-summary')).toBeVisible();
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('D8: the §4.8 parked outcome — §5.4 copy plus the tried-on line, in the Not now group', async ({ page }) => {
  const errors = collectErrors(page);
  const parkedCard = { ...approvedGuardCard(), parkedByDefault: true };
  const mock = makeMock({
    updatesPayload: derivationMock([parkedCard], [stoppedTrainSnapshot('no-measurable-effect')]),
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // The whole-train no-effect stop: a stop, not a success (V12) — both
  // sentences ship verbatim.
  await expect(page.locator('#train-stop-card')).toContainText(
    'The checks found this change wouldn’t alter any result — it wasn’t merged; here’s what that usually means.',
  );
  await expect(page.locator('#train-stop-card')).toContainText(
    'Usually the problem was already fixed by an earlier update, or the change is real but too small to move anything yet. Your calls are still on record.',
  );
  // The card renders parked by default, in "Not now (1)", carrying §5.4's
  // outcome copy and FM-5's dated line; no Start renders (nothing to seal
  // that would change anything).
  await expect(page.locator('#updates-parked-group summary')).toHaveText('Not now (1)');
  await page.click('#updates-parked-group summary');
  const parked = page.locator('#updates-parked-group .updates-card');
  await expect(parked.locator('.parked-outcome')).toHaveText(
    'The checks found this change wouldn’t alter any search result yet, so it wasn’t included in this '
    + 'update. Your call is now written on the answer sheet as a goal — when a future update reaches '
    + 'it, the checks will announce it and hold it there. You can leave it parked, or decline it.',
  );
  await expect(parked.locator('.parked-tried')).toHaveText(
    'This was tried on Aug 27 and would not have changed any result.',
  );
  await expect(page.locator('#updates-train-summary')).toHaveCount(0);
  // Re-approval stays an explicit human act: the way back is the same
  // "Change this decision" door every decided card carries.
  await expect(parked.locator('.updates-links button').first()).toHaveText('Change this decision');
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// §8.4 — honest timing: the screen shows how long each run actually takes
// ---------------------------------------------------------------------------

test('D8: the running panel shows the elapsed time and the measured check-run number', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([], [sealedTrainSnapshot()]) });
  // §8.4's measured number is the WHOLE verified admit leg — the sign act
  // (decisions[].decidedAt) to admittedAt: provisioning + rebuild + verify +
  // release gauntlet + control run — never the gauntlet subprocess alone.
  // 26m26s is the leg the D11 tip ride actually measured (train-0010).
  mock.trainView = guardTrainView('pr-open', {
    draftPrUrl: 'https://github.com/example/scripture-search-engine/pull/999',
    checksDurationMs: 26 * 60_000 + 26_000,
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // The elapsed line renders from the train's own openedAt — a fact, not an
  // estimate — and the measured number is the recorded admit leg's wall
  // time, in plain words at minute granularity.
  await expect(page.locator('#train-elapsed')).toContainText(/^This update started .+ ago\.$/);
  await expect(page.locator('#train-checks-took')).toHaveText('The checks took 26 minutes.');
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('D8: after a measured run, the §4.5 summary prints the measured number beside the estimate', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([approvedGuardCard()], [sealedTrainSnapshot()]) });
  // The previous update finished (live) with a measured check run — §8.4:
  // "print the measured number in the train view thereafter". The number is
  // the whole verified admit leg (sign act → admitted), the same quantity
  // the estimate beside it describes ("inside three quarters of an hour,
  // about double that" with the control run).
  mock.trainView = guardTrainView('live', { checksDurationMs: 69 * 60_000 });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  const summary = page.locator('#updates-train-summary');
  await expect(summary).toContainText('The screen shows how long each run actually takes.');
  await expect(summary.locator('#train-last-checks-took')).toHaveText('Last update’s checks took 1 hour 9 minutes.');
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// §4.5 — single-flight: one update at a time
// ---------------------------------------------------------------------------

test('D8: with a train on its way, the Start position is replaced by the one-at-a-time line', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([approvedGuardCard()], [sealedTrainSnapshot()]) });
  mock.trainView = guardTrainView('ready');
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // The running train's status renders; the button is replaced by the line.
  await expect(page.locator('#train-status')).toHaveText('The report is ready — read it and sign below.');
  await expect(page.locator('#updates-train-one-at-a-time')).toHaveText(
    'One update at a time — approve cards now and they’ll ride the next one.',
  );
  await expect(page.locator('#train-start')).toHaveCount(0);
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('D8: a second Start refused by the server renders the same verbatim line', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([approvedGuardCard()]) });
  mock.trainSealResponder = () => ({
    status: 409,
    payload: {
      ok: false,
      error: {
        code: 'train_running',
        message: 'An update is already on its way. One update travels at a time — it finishes or stops before the next one starts.',
      },
    },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await page.click('#train-start');
  await page.click('#train-confirm-commit');
  await expect(page.locator('#updates-train-one-at-a-time')).toHaveText(
    'One update at a time — approve cards now and they’ll ride the next one.',
  );
  expect(sealPosts(mock)).toHaveLength(1);
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('D8/FM-8 case g: a data seal refused for an unpaid sign-off renders the server’s plain-language sentence; approvals stay', async ({ page }) => {
  const errors = collectErrors(page);
  // §06 FM-8 (case g): the previous data train merged but its independent
  // sign-off has not landed — the next data seal refuses with this verbatim
  // sentence (Phase 3: the 'data trains wait for the machinery' refusal is
  // gone; the unpaid-marker rule is the one remaining data-seal 409).
  const dataWaiting = "The last update's independent sign-off hasn't happened yet. New data updates wait until it does.";
  const mock = makeMock({ updatesPayload: derivationMock([approvedDataCard()]) });
  mock.trainSealResponder = () => ({
    status: 409,
    payload: { ok: false, error: { code: 'signing_debt', message: dataWaiting } },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await page.click('#train-start');
  await page.click('#train-confirm-commit');
  await expect(page.locator('#updates-train-error')).toHaveText(dataWaiting);
  // The approvals are untouched: the summary still stands for the next try.
  await expect(page.locator('#updates-train-summary')).toBeVisible();
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('D8: a stale seal is refused 409 — the reload line renders and nothing seals', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([approvedGuardCard()]) });
  // §03.5 step 3: the server re-derives and compares — a moved derivation
  // refuses the seal with stale_preview; the panel renders the reload line.
  mock.trainSealResponder = () => ({
    status: 409,
    payload: {
      ok: false,
      error: {
        code: 'stale_preview',
        message: 'The picture changed since this summary was rendered — reload your updates and review the fresh summary. Nothing was sealed.',
      },
    },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await page.click('#train-start');
  await page.click('#train-confirm-commit');
  await expect(page.locator('#updates-train-error')).toHaveText(
    'The picture changed since this preview — reloading it now.',
  );
  // Exactly one attempt went out, carrying the digest the panel rendered
  // from; the refusal recorded nothing — the summary stands for a fresh try.
  const posts = sealPosts(mock);
  expect(posts).toHaveLength(1);
  expect(posts[0]!.body).toEqual({ derivationDigest: 'c'.repeat(64) });
  await expect(page.locator('#updates-train-summary')).toBeVisible();
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// §4.8 — cards riding a sealed train: honest status, no live decision door
// ---------------------------------------------------------------------------

test('D8: a sealed-aboard card says it is riding the update and loses the decision door', async ({ page }) => {
  const errors = collectErrors(page);
  const ridingCard = {
    ...approvedGuardCard(),
    state: { decision: 'approved', decidedAt: '2026-08-27T13:00:00.000Z', sealedInTrain: 'train-0001' },
  };
  const mock = makeMock({ updatesPayload: derivationMock([ridingCard], [sealedTrainSnapshot()]) });
  mock.trainView = guardTrainView('ready');
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // The card renders in its own group with the honest status — it is not
  // "waiting for the next update"; it is aboard this one.
  await expect(page.locator('#updates-sealed-group summary')).toHaveText('Riding the current update (1)');
  await page.click('#updates-sealed-group summary');
  const riding = page.locator('#updates-sealed-group .updates-card');
  await expect(riding).toContainText('Riding the current update — locked in until it finishes or stops.');
  // No live no-op: the "Change this decision" door is gone while the card
  // rides (the fold would refuse the write anyway — the UI never offers it).
  await expect(riding.locator('.updates-links button')).toHaveCount(0);
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

test('D8: a card whose update went live rests on the answer sheet — no riding copy, no approved count', async ({ page }) => {
  const errors = collectErrors(page);
  const shippedCard = {
    ...approvedGuardCard(),
    state: { decision: 'approved', decidedAt: '2026-08-27T13:00:00.000Z', sealedInTrain: 'train-0001', sealedTrainLive: true },
  };
  const mock = makeMock({ updatesPayload: derivationMock([shippedCard], [sealedTrainSnapshot()]) });
  mock.trainView = guardTrainView('live');
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // The achieved resting group — never the (now false) riding copy, and the
  // shipped card no longer counts as "approved for the next update".
  await expect(page.locator('#updates-shipped-group summary')).toHaveText('On the answer sheet (1)');
  await expect(page.locator('#updates-sealed-group')).toHaveCount(0);
  await expect(page.locator('#updates-stats')).toHaveCount(0);
  await page.click('#updates-shipped-group summary');
  const shipped = page.locator('#updates-shipped-group .updates-card');
  await expect(shipped).toContainText('Live — this line is on the answer sheet now.');
  await expect(shipped).not.toContainText('Riding the current update');
  // Consumed forever: no decision door — the way to a change is a fresh
  // call in Review, which derives a fresh card.
  await expect(shipped.locator('.updates-links button')).toHaveCount(0);
  // The live receipt itself still renders above.
  await expect(page.locator('#train-status')).toHaveText('Live. These searches now answer the way you called them.');
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// §4.8 — the live receipt
// ---------------------------------------------------------------------------

test('D8: a live train renders the receipt with query chips, and Dismiss clears it', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([], [sealedTrainSnapshot()]) });
  mock.trainView = guardTrainView('live');
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await expect(page.locator('#train-status')).toHaveText('Live. These searches now answer the way you called them.');
  await expect(page.locator('.train-step.current')).toHaveText('Live');
  const chip = page.locator('#updates-train-panel .query-chip');
  await expect(chip).toHaveText('“it is well with my soul”');
  await assertNoJargon(page);

  // Dismissing the receipt empties the panel (nothing else queued).
  await page.click('#updates-train-panel .updates-links button');
  await expect(page.locator('#updates-train-panel')).toHaveCount(0);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// §4.8 — degraded mode disables initiation
// ---------------------------------------------------------------------------

test('D8/D14: degraded mode disables the sign act', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([approvedGuardCard()], [sealedTrainSnapshot()]) });
  mock.trainView = guardTrainView('ready');
  mock.degraded.value = true;
  await installRoutes(page, mock);
  await page.goto(origin);
  await openUpdates(page);

  // The read-only banner stands; the train's one write-act is disabled —
  // both the input and the button, like every POST-issuing control.
  await expect(page.locator('#train-sign-input')).toBeDisabled();
  await expect(page.locator('#train-sign')).toBeDisabled();
  expect(errors).toEqual([]);
});

test('D8: degraded mode disables the Start button itself', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([approvedGuardCard()]) });
  mock.degraded.value = true;
  await installRoutes(page, mock);
  await page.goto(origin);
  await openUpdates(page);

  await expect(page.locator('#train-start')).toBeDisabled();
  expect(errors).toEqual([]);
});
