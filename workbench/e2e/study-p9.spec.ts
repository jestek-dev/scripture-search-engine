import { expect, test, type Page } from '@playwright/test';

import {
  collectErrors, derivationMock, installRoutes, makeMock, sealedTrainSnapshot, startStudyServer,
  type Call, type MockState, type StudyServer,
} from './study-shared';

// P9 demo spec (votes-to-engine plan, Phase 3 "Data trains" — §8.5 D12/D14's
// UI acceptance criteria, §4.6/§4.8, §5.1/§5.2): the data train's strip
// carries the full lane (built and measured, §5.1's verbatim status
// sentences); the data Update Report renders every changed query before →
// after in plain language with its attribution and blind Compare one click
// away; the typed-digest sign panel reuses the Finish-up mechanics — the
// code chip is the ONLY hex surface (D28 at zero matches over the report
// body); a sign-code mismatch posts nothing; a 409 stale re-previews with
// the reload line; the frozen-awaiting-signer hold renders the server's
// sentence verbatim in place of the sign panel (A1 frozen queue, open call
// 4 — honest, no fake progress); an unreviewed changed query blocks with
// the server's own blocker copy rendered in place.

let server: StudyServer;
let origin: string;

test.beforeAll(async () => {
  server = await startStudyServer();
  origin = server.origin;
});

test.afterAll(async () => {
  await server.close();
});

// The frozen-queue hold sentences — trainRunner.ts is the single writer;
// these constants exist so the specs can assert the page renders them
// VERBATIM from the payload (the page itself must not mint the sentences).
const HOLD_NO_SIGNER = 'This update is checked and its report is complete. It waits here for one thing: the independent sign-off role has not been assigned yet. Nothing more happens until a signer is named — your approvals and this report stay saved.';
const SIGNING_LINE = 'After this update is merged, an independent person signs the new reference measurements — merge first, sign once. Until that sign-off lands, two checks will show as failing — that is the designed order, not a defect.';
const STANDING_RED_LINE = 'Two standing checks read as failing across the whole project until a one-time independent sign-off clears them. This update cannot be approved until that sign-off lands.';

function dataReport(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schemaVersion: 1,
    kind: 'data-update-report',
    trainId: 'train-0001',
    lead: "This update changes results for 2 searches. Here's each one, before and after.",
    changedQueries: ['love your enemies', 'mercy'],
    blocks: [
      {
        query: 'love your enemies',
        movementLines: ['New in the top 10: Matthew 5:44 (now 1st).'],
        attributionLine: 'You asked for this: your call on this search is riding this update.',
        compareAvailable: true,
      },
      {
        query: 'mercy',
        movementLines: ['Moved down: Psalm 85:10 (was 2nd, now 3rd).'],
        attributionLine: 'Side effect — worth a look.',
        compareAvailable: true,
      },
    ],
    checksLine: 'The checks passed — every answer-sheet line holds.',
    regenLine: 'The reference measurements were regenerated for this update — each regeneration was run twice and the two runs matched exactly.',
    signingLine: SIGNING_LINE,
    standingRedLine: null,
    lines: ['For "love your enemies", Matthew 5:44 should appear in the top 10.'],
    digest: 'cd'.repeat(32),
  ...overrides,
  };
}

function dataTrainView(state: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    trainId: 'train-0001',
    flavor: 'data',
    state,
    openedAt: '2026-08-28T12:00:00.000Z',
    sealDigest: 'a1'.repeat(32),
    cardIds: ['11'.repeat(32)],
    stopped: null,
    report: null,
    draftPrUrl: null,
    checksDurationMs: null,
    signingHold: null,
    ...overrides,
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

function signPosts(mock: MockState): Call[] {
  return mock.calls.filter((call) => call.method === 'POST' && /\/api\/v2\/updates\/train\/[^/]+\/sign$/.test(call.path));
}

// ---------------------------------------------------------------------------
// §5.1 — the data strip carries the full lane with the verbatim sentences
// ---------------------------------------------------------------------------

test('D12: a data train renders built and measured with §5.1 verbatim sentences, moving unattended', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([], [sealedTrainSnapshot({ flavor: 'data' })]) });
  mock.trainViewResponder = (trainId, n) => ({
    status: 200,
    payload: {
      ok: true,
      data: { train: n === 1 ? dataTrainView('built') : dataTrainView('measured'), readOnly: false },
    },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await expect(page.locator('#train-status')).toHaveText('Building a test copy of the search with your changes…');
  await expect(page.locator('.train-step.current')).toHaveText('Building the trial run');
  // The full data lane renders — built and measured are real waypoints here,
  // unlike the guard strip (§4.6's fixture-lane rule).
  const stepText = await page.locator('.train-strip').innerText();
  expect(stepText).toContain('Building the trial run');
  expect(stepText).toContain('Measuring what changes');
  // The poll observes measured with no interaction.
  await expect(page.locator('#train-status')).toHaveText('Comparing results before and after…', { timeout: 15_000 });
  await expect(page.locator('.train-step.current')).toHaveText('Measuring what changes');
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// §4.6 — the data Update Report + the typed-digest sign act
// ---------------------------------------------------------------------------

test('D14: the data Update Report renders every changed query before→after with attribution and Compare blind; signing posts the FULL digest', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([], [sealedTrainSnapshot({ flavor: 'data' })]) });
  mock.trainView = dataTrainView('ready', { report: dataReport() });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  const report = page.locator('#updates-report');
  await expect(report.locator('h3')).toHaveText('Update Report');
  // Every sentence renders verbatim FROM THE PAYLOAD — the server's report
  // module is the single writer (E4); the page mints no rival.
  await expect(report).toContainText("This update changes results for 2 searches. Here's each one, before and after.");
  await expect(report.locator('.train-report-query')).toHaveCount(2);
  await expect(report.locator('.train-report-query h4').first()).toHaveText('“love your enemies”');
  await expect(report).toContainText('New in the top 10: Matthew 5:44 (now 1st).');
  await expect(report).toContainText('You asked for this: your call on this search is riding this update.');
  // Movement no vote asked for is labeled honestly (§4.6 anatomy item 2).
  await expect(report).toContainText('Side effect — worth a look.');
  await expect(report).toContainText('The checks passed — every answer-sheet line holds.');
  await expect(report).toContainText(SIGNING_LINE);
  // Spot-check one click away (anatomy item 4): each block carries Compare
  // blind, routing to the existing blind-comparison machinery.
  await expect(report.locator('.train-compare-blind')).toHaveCount(2);

  // D28 as a binding AC: zero jargon matches over the report body — the
  // sign chip is the SOLE sanctioned hex surface, outside the report block.
  const reportText = await report.innerText();
  expect(/[0-9a-f]{8}-/.test(reportText)).toBe(false);
  expect(/sha256/i.test(reportText)).toBe(false);
  await assertNoJargon(page);

  // The sign panel: 12-hex chip grouped 4-4-4; matching is exact,
  // case-insensitive, spaces ignored; the POST carries the FULL digest.
  await expect(page.locator('#train-sign-code')).toHaveText('cdcd cdcd cdcd');
  await expect(page.locator('#train-sign')).toBeDisabled();
  await page.fill('#train-sign-input', 'CD CD cdcd cdcd');
  await expect(page.locator('#train-sign')).toBeEnabled();
  await page.click('#train-sign');
  await expect(page.locator('#train-status')).toHaveText('Waiting for the final merge. One click on GitHub makes it live.');
  const posts = signPosts(mock);
  expect(posts).toHaveLength(1);
  expect(posts[0]!.path).toBe('/api/v2/updates/train/train-0001/sign');
  expect(posts[0]!.body).toEqual({ digest: 'cd'.repeat(32) });

  expect(errors).toEqual([]);
});

test('D14: a sign-code mismatch keeps the button disabled and posts nothing', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([], [sealedTrainSnapshot({ flavor: 'data' })]) });
  mock.trainView = dataTrainView('ready', { report: dataReport() });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await page.fill('#train-sign-input', 'ffff ffff ffff');
  await expect(page.locator('#train-sign')).toBeDisabled();
  await page.keyboard.press('Enter');
  expect(signPosts(mock)).toEqual([]);

  expect(errors).toEqual([]);
});

test('D14: a 409 stale sign renders the reload line with a fresh code and re-previews', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([], [sealedTrainSnapshot({ flavor: 'data' })]) });
  mock.trainView = dataTrainView('ready', { report: dataReport() });
  mock.trainSignResponder = () => ({
    status: 409,
    payload: {
      ok: false,
      error: { code: 'stale_preview', message: 'The picture changed since this preview — reload the report and sign the fresh code. Nothing was approved.' },
    },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // The report moved server-side: the fresh view carries a NEW digest.
  mock.trainView = dataTrainView('ready', { report: dataReport({ digest: 'ef'.repeat(32) }) });
  await page.fill('#train-sign-input', 'cdcd cdcd cdcd');
  await page.click('#train-sign');
  await expect(page.locator('#updates-train-error')).toHaveText('The picture changed since this preview — reloading it now.');
  expect(signPosts(mock)).toHaveLength(1);
  // The re-previewed report shows the fresh code; the stale input is gone.
  await expect(page.locator('#train-sign-code')).toHaveText('efef efef efef');
  await expect(page.locator('#train-sign-input')).toHaveValue('');
  await expect(page.locator('#train-sign')).toBeDisabled();

  expect(errors).toEqual([]);
});

test('D14: an unreviewed changed query blocks with the server’s own sentence rendered in place', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([], [sealedTrainSnapshot({ flavor: 'data' })]) });
  mock.trainView = dataTrainView('ready', { report: dataReport() });
  const blocker = 'Every query whose top-10 changed must be reviewed before admission: 1 changed queries are unreviewed.';
  mock.trainSignResponder = () => ({
    status: 409,
    payload: { ok: false, error: { code: 'unreviewed_comparison', message: blocker } },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await page.fill('#train-sign-input', 'cdcd cdcd cdcd');
  await page.click('#train-sign');
  await expect(page.locator('#updates-train-error')).toHaveText(blocker);
  expect(signPosts(mock)).toHaveLength(1);

  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// §4.8/§09 — the frozen-awaiting-signer state (A1 frozen queue, open call 4)
// ---------------------------------------------------------------------------

test('Call 4: a ready data train with no named signer renders the hold sentence verbatim in place of the sign panel — no fake progress', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([], [sealedTrainSnapshot({ flavor: 'data' })]) });
  mock.trainView = dataTrainView('ready', {
    report: dataReport({ standingRedLine: STANDING_RED_LINE }),
    signingHold: HOLD_NO_SIGNER,
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // The report still renders — the state is honest, not hidden — with the
  // standing-red note carried verbatim while it stands.
  await expect(page.locator('#updates-report')).toBeVisible();
  await expect(page.locator('#train-standing-red')).toHaveText(STANDING_RED_LINE);
  // The hold sentence renders VERBATIM from the payload; the sign panel
  // does not exist, so no act can even be attempted (frozen, honestly).
  await expect(page.locator('#train-signing-hold')).toHaveText(HOLD_NO_SIGNER);
  await expect(page.locator('#train-sign-panel')).toHaveCount(0);
  await expect(page.locator('#train-sign')).toHaveCount(0);
  expect(signPosts(mock)).toEqual([]);
  await assertNoJargon(page);

  expect(errors).toEqual([]);
});
