import { expect, test, type Page } from '@playwright/test';

import {
  collectErrors, derivationMock, installRoutes, makeMock, sealedTrainSnapshot, startStudyServer,
  type StudyServer,
} from './study-shared';

// P10 demo spec (votes-to-engine plan, Phase 4 — §8.6's D16/D17 UI
// acceptance criteria): every reason in the closed stop enum (V5, all 14)
// renders §06.2's plain-language sentence(s) plus its ONE next action — no
// reason falls through to a generic message, the enum token itself never
// renders, and the D28 jargon regex holds at zero matches; and the V6
// staleness-replay card copy renders verbatim — the auto-resolved
// "already achieved — guarded" note (disposition 1), the machine-supported
// reconfirmation (disposition 2), and FM-2's unresolvable-reference
// sentence on a stale look-again card. D20's steady-state metrics strip
// (cycles completed, calls awaiting a card, median vote→live) rides at the
// end — computed from the served derivation, honest-timing or absent.

let server: StudyServer;
let origin: string;

test.beforeAll(async () => {
  server = await startStudyServer();
  origin = server.origin;
});

test.afterAll(async () => {
  await server.close();
});

const DIGESTS = { resultSetDigest: 'd'.repeat(64), displayedWindowDigest: 'e'.repeat(64) };

function draftedGuardCard(): Record<string, unknown> {
  return {
    cardId: '11'.repeat(32),
    cardRevision: '22'.repeat(32),
    kind: 'guard',
    query: 'it is well with my soul',
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
    state: { decision: 'drafted' },
  };
}

function stoppedTrainSnapshot(reason: string): Record<string, unknown> {
  return sealedTrainSnapshot({
    state: 'stopped',
    stopped: {
      schemaVersion: 1,
      eventId: '0a1b2c3d-7777-4888-9999-000011112222',
      at: '2026-08-27T18:00:00.000Z',
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

async function assertNoJargon(page: Page): Promise<void> {
  const text = await page.locator('#screen-updates').innerText();
  expect(/[0-9a-f]{8}-/.test(text), `jargon id in rendered text: ${text}`).toBe(false);
  expect(/sha256/i.test(text), `sha256 in rendered text: ${text}`).toBe(false);
}

// ---------------------------------------------------------------------------
// D17 — the complete closed stop enum, each reason with its §06.2 sentence(s)
// and its one next action. The table below is the test's own copy of the
// shipped strings — an edit to either side fails loudly.
// ---------------------------------------------------------------------------

const STOP_TABLE: readonly { reason: string; sentences: readonly string[]; next: string }[] = [
  {
    reason: 'conflicting-judgments',
    sentences: ['Two of your calls disagree about the same passage for this search. Nothing was chosen for you — open the conflict card and pick which call stands.'],
    next: 'Next step: open the conflict card and pick which call stands. Your pick is recorded, and the next update carries it.',
  },
  {
    reason: 'stale-artifact-identity',
    sentences: ['The search data changed while this update was being prepared. Each affected call was re-checked; the ones that need a fresh look are back in your inbox.'],
    next: 'Next step: look again at the calls back in your inbox — a fresh call rides the next update.',
  },
  {
    reason: 'protected-expectation-regressed',
    sentences: ['This change would break an answer the answer sheet already protects. It was stopped before anything shipped — the report shows which answer.'],
    next: 'Next step: open the report to see which answer, then decline or set aside the card that would break it.',
  },
  {
    reason: 'unreviewed-top10-movement',
    sentences: ['This change moves results nobody has reviewed yet. Open the Update Report to look at each one, then continue.'],
    next: 'Next step: open the Update Report and look at each changed search, then continue.',
  },
  {
    reason: 'outside-allowlist',
    sentences: ['Part of this change touches files this system is not allowed to edit on its own. That part was set aside as a job for engineering, with your calls attached.'],
    next: 'Next step: nothing for you here — the set-aside part comes back as a job for engineering on its own card; the rest can ride the next update.',
  },
  {
    reason: 'provenance-ambiguity',
    sentences: ['The system could not tell which of your calls asked for part of this change, so it stopped rather than guess.'],
    next: 'Next step: start the update again — if this comes back, it needs an engineer to look.',
  },
  {
    reason: 'engineering-required',
    sentences: ['This needs a code change, not a data change. It was written up for engineering with your calls attached.'],
    next: 'Next step: nothing for you here — the write-up comes back as a job for engineering on its own card, with your calls attached.',
  },
  {
    reason: 'g8-baseline-moved-needs-independent-approval',
    sentences: ['This update moved the reference measurements the checks compare against. An independent person has to approve the new ones — the update waits as a draft until they do.'],
    next: 'Next step: nothing for you here — the update waits as a draft until the independent sign-off lands.',
  },
  {
    reason: 'no-measurable-effect',
    sentences: [
      'The checks found this change wouldn’t alter any result — it wasn’t merged; here’s what that usually means.',
      'Usually the problem was already fixed by an earlier update, or the change is real but too small to move anything yet. Your calls are still on record.',
    ],
    next: 'Next step: leave the cards set aside, or bring one back with a fresh approval when you still want it tried.',
  },
  {
    reason: 'main-moved',
    sentences: ['Other work was merged while this update was running. It will be rebuilt against the newest version before it continues — nothing was lost.'],
    next: 'Next step: start the update again — it rebuilds against the newest version with your approvals intact.',
  },
  {
    reason: 'source-drift',
    sentences: ['A file this update was built from changed underneath it. The update stopped and will be rebuilt from the current files.'],
    next: 'Next step: start the update again — it rebuilds from the current files with your approvals intact.',
  },
  {
    reason: 'verify-failed',
    sentences: ['The checks failed. Nothing was written. The report names which check and shows why in plain words.'],
    next: 'Next step: read the report, then decline or set aside the card the failing check names.',
  },
  {
    reason: 'required-check-failed',
    sentences: ['The final checks on the draft did not pass. The update waits as a draft — nothing merges until they do.'],
    next: 'Next step: the draft stays open on GitHub — merging waits until its checks pass.',
  },
  {
    reason: 'github-unavailable',
    sentences: ['GitHub could not be reached. Everything is saved locally, and the exact next step is written on the update’s card — nothing was lost.'],
    next: 'Next step: try again once the connection is back — everything is saved.',
  },
];

test('D17: the table below covers the closed enum exactly — all 14 reasons, no extras', () => {
  expect(STOP_TABLE.map((row) => row.reason).sort()).toEqual([
    'conflicting-judgments',
    'engineering-required',
    'g8-baseline-moved-needs-independent-approval',
    'github-unavailable',
    'main-moved',
    'no-measurable-effect',
    'outside-allowlist',
    'protected-expectation-regressed',
    'provenance-ambiguity',
    'required-check-failed',
    'source-drift',
    'stale-artifact-identity',
    'unreviewed-top10-movement',
    'verify-failed',
  ]);
});

for (const row of STOP_TABLE) {
  test(`D17: a train stopped ${row.reason} renders its sentence and one next action — never the token, never a generic line`, async ({ page }) => {
    const errors = collectErrors(page);
    const mock = makeMock({ updatesPayload: derivationMock([draftedGuardCard()], [stoppedTrainSnapshot(row.reason)]) });
    await installRoutes(page, mock);
    await page.goto(origin);
    await expect(page.locator('#search-input')).toBeVisible();
    await openUpdates(page);

    await expect(page.locator('.train-step.current')).toHaveText('Stopped');
    const stopCard = page.locator('#train-stop-card');
    for (const sentence of row.sentences) await expect(stopCard).toContainText(sentence);
    await expect(page.locator('#train-stop-next-action')).toHaveText(row.next);
    // The enum token appears in logs and the machine record only (§06.1).
    const text = await page.locator('#screen-updates').innerText();
    expect(text.includes(row.reason), `enum token "${row.reason}" rendered`).toBe(false);
    await assertNoJargon(page);
    expect(errors).toEqual([]);
  });
}

// ---------------------------------------------------------------------------
// D16 — the staleness-replay card copy renders verbatim
// ---------------------------------------------------------------------------

// §4.3's PLAN-FIXED receipt sentence, verbatim with the '{query}'
// substitution — the auto-resolved happy case never renders as a to-do;
// the update panel renders this one-line receipt instead.
const ALREADY_ACHIEVED_RECEIPT =
  "Already achieved — your call for 'Who is like the Lord?' is now true in search, so this update just pins it in the answer sheet.";
const RECONFIRMED_NOTE =
  'Re-checked against the current search data: the picture still looks the way it did when you made this call.';
const UNRESOLVED_NOTE =
  "The scripture text behind this call changed, and the passage couldn't be found again in the new text. Nothing was changed — your call is kept on record, and this is back in your inbox to check against the current text.";

function autoResolvedCard(): Record<string, unknown> {
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
    // Disposition 1: the data arms dropped; only the answer-sheet line rides.
    derived: { expectation: { ref: 'Exodus 15:11', withinTop: 10 } },
    preCheck: 'identity-moved',
    identityNotes: [{ dimension: 'layerFingerprint', recorded: 'layer-old', current: 'layer-current' }],
    replay: { disposition: 'already-achieved', note: ALREADY_ACHIEVED_RECEIPT },
    autoResolved: true,
    state: { decision: 'drafted' },
  };
}

function staleLookAgainCard(): Record<string, unknown> {
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
    identityNotes: [{ dimension: 'corpusFingerprint', recorded: 'corpus-old', current: 'corpus-current' }],
    replay: { disposition: 'unresolved-reference', note: UNRESOLVED_NOTE },
    stale: true,
    state: { decision: 'drafted' },
  };
}

test('D16 disposition 1: the auto-resolved case never renders as a to-do — the §4.3 receipt renders in the update panel instead', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([autoResolvedCard()]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  // The one-line receipt, verbatim (§4.3's plan-fixed sentence), in the
  // update panel — not on a card.
  const receipt = page.locator('#updates-train-panel .train-receipt');
  await expect(receipt).toHaveText(ALREADY_ACHIEVED_RECEIPT);
  // No to-do: no card renders for it, no decision doors anywhere.
  await expect(page.locator('.updates-card')).toHaveCount(0);
  await expect(page.locator('#screen-updates button', { hasText: 'Approve' })).toHaveCount(0);
  // Not counted as "waiting for your call" — the tally row does not render.
  await expect(page.locator('#updates-stats')).toHaveCount(0);
  await expect(page.locator('#screen-updates')).not.toContainText('waiting for your call');
  // The kept fixture pin still rides: the §4.5 summary and Start are offered.
  await expect(page.locator('#updates-train-summary')).toBeVisible();
  await expect(page.locator('#train-start')).toBeVisible();
  await assertNoJargon(page);
  expect(errors).toEqual([]);
});

test('D16: the machine-supported reconfirmation note renders on a materially-equivalent card', async ({ page }) => {
  const errors = collectErrors(page);
  const card = { ...draftedGuardCard(), preCheck: 'identity-moved', identityNotes: [{ dimension: 'layerFingerprint', recorded: 'layer-old', current: 'layer-current' }], replay: { disposition: 'materially-equivalent', note: RECONFIRMED_NOTE } };
  const mock = makeMock({ updatesPayload: derivationMock([card]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await expect(page.locator('.updates-card .replay-note')).toHaveText(RECONFIRMED_NOTE);
  await assertNoJargon(page);
  expect(errors).toEqual([]);
});

test('D16/FM-2: a stale look-again card names the unresolvable reference in the exact shipped sentence', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ updatesPayload: derivationMock([staleLookAgainCard()]) });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await expect(page.locator('.updates-card .replay-note')).toHaveText(UNRESOLVED_NOTE);
  await assertNoJargon(page);
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D20 — the steady-state metrics strip: cycles completed, votes awaiting a
// card decision, and the median vote→live time, all computed from the served
// derivation (updates.jsonl decisions + observed live trains + git commit
// times) — no extra request, no new telemetry, and the D28 regexes stay at
// zero matches over the rendered strip.
// ---------------------------------------------------------------------------

function shippedGuardCard(): Record<string, unknown> {
  return {
    ...draftedGuardCard(),
    cardId: '33'.repeat(32),
    cardRevision: '44'.repeat(32),
    query: 'a very present help',
    targetKey: 'web:19046001',
    judgmentIds: ['0a1b2c3d-9999-4aaa-8bbb-9ccccdddd111'],
    votes: [{
      judgmentId: '0a1b2c3d-9999-4aaa-8bbb-9ccccdddd111',
      at: '2026-08-25T12:00:00.000Z',
      reviewer: 'jesse',
      action: 'irrelevant',
      reference: 'Genesis 5:1',
      diagnosis: 'lexical-noise',
      observedRank: 5,
      observedWindow: 10,
      ...DIGESTS,
    }],
    derived: { guard: { ref: 'Genesis 5:1', why: 'matched words, not meaning; judged not a fit for this query' } },
    state: {
      decision: 'approved',
      decidedAt: '2026-08-26T09:00:00.000Z',
      sealedInTrain: 'train-0001',
      sealedTrainLive: true,
    },
  };
}

test('D20: the metrics strip renders cycles, waiting calls, and the measured vote→live median', async ({ page }) => {
  const errors = collectErrors(page);
  // One landed cycle (vote 2026-08-25T12:00Z → landed 2026-08-27T12:00Z =
  // exactly 2 days — the strip's single median sample) plus one drafted card
  // still waiting on its call.
  const mock = makeMock({
    updatesPayload: {
      ...derivationMock([shippedGuardCard(), draftedGuardCard()]),
      liveTrainIds: ['train-0001'],
      liveTrainLandings: [{ trainId: 'train-0001', landedAt: '2026-08-27T12:00:00.000Z' }],
    },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  const strip = page.locator('#updates-metrics');
  await expect(strip).toHaveText(
    'One reviewed update has gone live. '
    + 'One of your calls is still waiting on a card above. '
    + 'From a call to live: typically about 2 days.',
  );
  await assertNoJargon(page);
  expect(errors).toEqual([]);
});

test('D20: without a landing timestamp the strip stays honest — no vote→live figure is invented', async ({ page }) => {
  const errors = collectErrors(page);
  // The landing time is unknown (e.g. an epoch-double history with no
  // commit times): the cycles line still renders, the timing line does not.
  const mock = makeMock({
    updatesPayload: {
      ...derivationMock([shippedGuardCard()]),
      liveTrainIds: ['train-0001'],
      liveTrainLandings: [{ trainId: 'train-0001', landedAt: null }],
    },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('#search-input')).toBeVisible();
  await openUpdates(page);

  await expect(page.locator('#updates-metrics')).toHaveText('One reviewed update has gone live.');
  await expect(page.locator('#screen-updates')).not.toContainText('typically about');
  await assertNoJargon(page);
  expect(errors).toEqual([]);
});
