import { expect, test } from '@playwright/test';

import {
  assertPayloadAllowlist, caseMock, casePosts, collectErrors, identity,
  installRoutes, judgmentPosts, makeMock, mercyResults, startStudyServer,
  submit, type StudyServer,
} from './study-shared';

// P2 demo spec (plan D19): drives the Study page (static/index.html since
// the flip, D41) over mocked /api/**
// routes, covering D10 (cases store + lazy creation), D11 (snapshot
// handling), D12 (verdict toolbar), D13 (not-relevant interview), D14
// (judged chips / supersede / undo), D15 (effect-timing contract), D16
// (read-only), D17 (bulk), D18 (tail rescue). The §3.3 missing-passage form
// built alongside D18's shared preview layer is covered by the P3 demo spec
// (study-p3.spec.ts, plan D20–D23); the shared mock harness lives in
// study-shared.ts.

let server: StudyServer;
let origin: string;

test.beforeAll(async () => {
  server = await startStudyServer();
  origin = server.origin;
});

test.afterAll(async () => {
  await server.close();
});

test('D10: first vote lazily creates the case (create -> judgment -> reviewing), Add to my queue creates only, open queries reuse their case', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  // The new-search hint + quiet button render while the query has no case.
  await expect(page.locator('#queue-body')).toContainText('New search — your first call starts its case.');
  await expect(page.locator('#add-to-queue')).toHaveText('Add to my queue');

  // First E: POST /cases, then POST /judgments with the returned token, then
  // POST state {state:'reviewing'} (§4.3 sequence, bodies asserted).
  await page.keyboard.press('e');
  await expect(page.locator('.judged-chip')).toHaveCount(1);
  const creates = casePosts(mock);
  expect(creates).toHaveLength(1);
  expect(creates[0]!.body).toEqual({ query: 'mercy', source: 'manual' });
  const posts = judgmentPosts(mock);
  expect(posts).toHaveLength(1);
  expect(posts[0]!.body).toEqual({
    caseId: 'case-1',
    snapshotToken: mock.lastToken,
    action: 'essential',
    targetId: 'KJV:19085010',
    withinTop: 3,
  });
  const statePosts = mock.calls.filter((call) => call.method === 'POST' && call.path.endsWith('/state'));
  expect(statePosts.length).toBeGreaterThanOrEqual(1);
  expect(statePosts[0]!.body).toEqual({ state: 'reviewing' });
  const createIndex = mock.calls.indexOf(creates[0]!);
  const judgmentIndex = mock.calls.indexOf(posts[0]!);
  const stateIndex = mock.calls.indexOf(statePosts[0]!);
  expect(createIndex).toBeLessThan(judgmentIndex);
  expect(judgmentIndex).toBeLessThan(stateIndex);
  // The hint is gone once the case exists.
  await expect(page.locator('#add-to-queue')).toHaveCount(0);

  // Searching an already-open query issues GET /cases/:uuid, not a create.
  await submit(page, 'other words');
  await submit(page, 'mercy');
  await expect(page.locator('.result-card').first()).toBeVisible();
  expect(casePosts(mock)).toHaveLength(1);
  expect(mock.calls.some((call) => call.method === 'GET' && call.path === '/api/v2/cases/case-1')).toBe(true);
  assertPayloadAllowlist(mock);
  expect(errors).toEqual([]);
});

test('D10: "Add to my queue" issues POST /cases only', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await page.click('#add-to-queue');
  await expect(page.locator('#add-to-queue')).toHaveCount(0);
  expect(casePosts(mock)).toHaveLength(1);
  expect(judgmentPosts(mock)).toHaveLength(0);
  expect(mock.calls.filter((call) => call.method === 'POST' && call.path.endsWith('/state'))).toHaveLength(0);
  expect(errors).toEqual([]);
});

test('D11: 409 with an identical fresh snapshot retries once silently; a changed snapshot re-renders with the 409-recovery banner and no auto-post', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  mock.judgmentResponder = (_body, n) => n === 1
    ? { status: 409, payload: { ok: false, error: { code: 'review_snapshot_required', message: 'Open this case and submit against its current review snapshot.' } } }
    : null;
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('e');
  await expect(page.locator('.judged-chip')).toHaveCount(1);
  const posts = judgmentPosts(mock);
  expect(posts).toHaveLength(2);
  // Retried once with the NEW token from the recovery GET.
  expect(posts[1]!.body!.snapshotToken).toBe(mock.lastToken);
  expect(posts[0]!.body!.snapshotToken).not.toBe(posts[1]!.body!.snapshotToken);
  await expect(page.locator('.data-banner')).toHaveCount(0);

  // Changed snapshot: the fresh snapshot's order differs -> re-render from
  // it, the 409-recovery banner string, no auto-post.
  const reordered = [mercyResults[1]!, mercyResults[0]!, ...mercyResults.slice(2, 10)];
  mock.judgmentResponder = (_body, n) => n === 3
    ? { status: 409, payload: { ok: false, error: { code: 'review_snapshot_required', message: 'Open this case and submit against its current review snapshot.' } } }
    : null;
  mock.snapshotResults = () => reordered;
  await page.keyboard.press('h');
  await expect(page.locator('.data-banner')).toHaveText('The engine’s data changed since this case was opened. The results below are the current ones — earlier calls stay on record.');
  await expect(page.locator('#toast-slot .toast')).toContainText('The results just refreshed — check your call still applies.');
  expect(judgmentPosts(mock)).toHaveLength(3); // the 409'd POST, never re-sent
  // The list re-rendered from the fresh snapshot's order.
  await expect(page.locator('.result-card[data-stop="0"]')).toContainText('Psalm 23:1-4');
  expect(errors).toEqual([]);
});

test('D11: a live-tail/snapshot disagreement renders the snapshot list with the agreement-failure banner', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ cases: [caseMock('case-open', 'mercy')] });
  const reordered = [mercyResults[2]!, mercyResults[0]!, mercyResults[1]!, ...mercyResults.slice(3, 10)];
  mock.snapshotResults = () => reordered;
  await installRoutes(page, mock);
  await page.goto(origin);
  // Open-case boot (§3.1): the case loads as if its queue row were clicked.
  await expect(page.locator('.result-card').first()).toBeVisible();
  await expect(page.locator('#search-input')).toHaveValue('mercy');
  // The snapshot's list wins for judging; its banner branch says so.
  await expect(page.locator('.result-card[data-stop="0"]')).toContainText('Micah 7:18');
  await expect(page.locator('.data-banner')).toHaveText('The engine’s data changed since this case was opened. The results below are the ones this case was opened on — earlier calls stay on record.');
  // The tail still renders from the live search.
  await expect(page.locator('#tail-divider')).toContainText('Lower results (4)');
  expect(errors).toEqual([]);
});

test('D12: verdict toolbar — picker value rides the POST and its receipt, persists, and selection follows arrow focus', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);

  // §3.2 gate: no toolbar before a discovery search.
  await expect(page.locator('#verdict-bar')).toHaveCount(0);
  await submit(page, 'mercy');
  await expect(page.locator('#verdict-bar')).toBeVisible();
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  await page.keyboard.press('e');
  await expect(page.locator('#toast-slot .toast')).toContainText('Marked Psalm 85:10 Essential (top 3)');
  await expect(page.locator('#toast-slot .toast')).toContainText('Undo');
  await expect(page.locator('#toast-slot .toast')).toContainText('— your call stands until you choose a new one');
  expect(judgmentPosts(mock)[0]!.body).toMatchObject({ action: 'essential', targetId: 'KJV:19085010', withinTop: 3 });
  // Focus auto-advanced to the next unjudged row.
  await expect(page.locator('.result-card[data-stop="1"]')).toBeFocused();

  // Click segment 5: E posts withinTop 5 and the toast names the value that
  // rode the POST.
  await page.click('#topn-picker .topn-seg[data-topn="5"]');
  await page.locator('.result-card[data-stop="1"]').focus();
  await page.keyboard.press('e');
  await expect(page.locator('#toast-slot .toast')).toContainText('Marked Psalm 23:1-4 Essential (top 5)');
  expect(judgmentPosts(mock)[1]!.body).toMatchObject({ withinTop: 5 });

  // The picker value survives reload.
  await page.reload();
  await submit(page, 'mercy');
  // The reopened query has an open case with cards #1-#2 judged: the §3.1
  // handoff goes to the first unjudged card.
  await expect(page.locator('.result-card[data-stop="2"]')).toBeFocused();
  await expect(page.locator('#topn-picker .topn-seg[data-topn="5"]')).toHaveAttribute('aria-checked', 'true');

  // Radiogroup: ArrowRight moves the selection — the arrow alone changes the
  // value the next E commits (selection follows focus).
  await page.locator('#topn-picker .topn-seg[aria-checked="true"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#topn-picker .topn-seg[data-topn="10"]')).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('e');
  await expect(page.locator('#toast-slot .toast')).toContainText('Essential (top 10)');
  const lastPost = judgmentPosts(mock).at(-1)!;
  expect(lastPost.body).toMatchObject({ action: 'essential', withinTop: 10 });
  assertPayloadAllowlist(mock);
  expect(errors).toEqual([]);
});

test('D13: not-relevant interview — Esc, inert J/K, required why, exact §4.4 payloads and fallbacks', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  // Auto mode (no concept evidence): copy quotes the lexical fragment.
  await page.keyboard.press('x');
  await expect(page.locator('#interview-dialog')).toContainText('This looks like a word match without the meaning — “mercy and truth” appears, but the verse is about something else. Mark it not relevant?');
  await expect(page.locator('#interview-dialog')).toContainText('It is demoted out of the top results for this query only — the verse stays in the corpus and every other search.');

  // Esc closes it: no POST, focused item unchanged.
  await page.keyboard.press('Escape');
  await expect(page.locator('#interview-dialog')).toHaveCount(0);
  expect(judgmentPosts(mock)).toHaveLength(0);
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  // J with the interview open changes nothing (same item, still open).
  await page.keyboard.press('x');
  await expect(page.locator('#interview-dialog')).toBeVisible();
  await page.keyboard.press('j');
  await expect(page.locator('#interview-dialog')).toBeVisible();
  await expect(page.locator('.result-card.expanded')).toContainText('Psalm 85:10');

  // Auto-confirm posts lexical-noise + diagnosisInferred true.
  await page.click('#interview-confirm');
  await expect(page.locator('.judged-chip').first()).toContainText('Your call: Not relevant');
  expect(judgmentPosts(mock)[0]!.body).toEqual({
    caseId: 'case-1',
    snapshotToken: mock.lastToken,
    action: 'irrelevant',
    targetId: 'KJV:19085010',
    diagnosis: 'lexical-noise',
    diagnosisInferred: true,
  });
  await expect(page.locator('#toast-slot .toast')).toContainText('Marked Psalm 85:10 Not relevant');

  // Concept mode on the shepherd-care card: step 1 -> "No, it doesn't" ->
  // required why -> wrong-anchor with conceptId + note, NO diagnosisInferred.
  await page.locator('.result-card[data-stop="1"]').focus();
  await page.keyboard.press('x');
  await expect(page.locator('#interview-dialog')).toContainText('This verse ranked because it is listed under the theme “shepherd care.” Does Psalm 23:1-4 really speak about that?');
  await page.click('#interview-dialog >> text=No, it doesn’t');
  await expect(page.locator('#interview-dialog')).toContainText('Say why, from the text — this goes to the theme files for review.');
  await expect(page.locator('#interview-confirm')).toBeDisabled();
  await page.fill('#interview-why', 'The psalm is about provision, not the named theme.');
  await expect(page.locator('#interview-confirm')).toBeEnabled();
  await page.click('#interview-confirm');
  await expect(page.locator('.judged-chip')).toHaveCount(2);
  const wrongAnchor = judgmentPosts(mock)[1]!.body!;
  expect(wrongAnchor).toMatchObject({
    action: 'irrelevant',
    targetId: 'KJV:19023001',
    diagnosis: 'wrong-anchor',
    conceptId: 'shepherd-care',
    note: 'The psalm is about provision, not the named theme.',
  });
  expect('diagnosisInferred' in wrongAnchor).toBe(false);

  // Unresolved Named-by label: auto-mode copy + lexical-noise + the §4.4
  // fallback note; no conceptId key.
  await page.locator('.result-card[data-stop="2"]').focus();
  await page.keyboard.press('x');
  await expect(page.locator('#interview-dialog')).toContainText('This looks like a word match without the meaning');
  await page.click('#interview-confirm');
  await expect(page.locator('.judged-chip')).toHaveCount(3);
  const fallback = judgmentPosts(mock)[2]!.body!;
  expect(fallback).toMatchObject({
    diagnosis: 'lexical-noise',
    diagnosisInferred: true,
    note: 'concept label "uncharted theme" (unresolved id)',
  });
  expect('conceptId' in fallback).toBe(false);

  // No concept evidence AND no lexical fragment: the no-quote fallback copy.
  await page.locator('.result-card[data-stop="3"]').focus();
  await page.keyboard.press('x');
  await expect(page.locator('#interview-dialog')).toContainText('This looks like a word match without the meaning — the verse is about something else. Mark it not relevant?');
  await page.keyboard.press('Escape');
  assertPayloadAllowlist(mock);
  expect(errors).toEqual([]);
});

test('D13: concept step 2 — "Right — not a fit here" posts concept-misfire with the why text', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await page.locator('.result-card[data-stop="1"]').focus();
  await page.keyboard.press('x');
  await page.click('#interview-dialog >> text=Yes, it does');
  await expect(page.locator('#interview-dialog')).toContainText('Then is it just not a good answer for “mercy”?');
  await page.click('#interview-dialog >> text=Right — not a fit here');
  await page.fill('#interview-why', 'Speaks of shepherd care, but no answer for mercy.');
  await page.click('#interview-confirm');
  await expect(page.locator('.judged-chip')).toHaveCount(1);
  const body = judgmentPosts(mock)[0]!.body!;
  expect(body).toMatchObject({
    action: 'irrelevant',
    diagnosis: 'concept-misfire',
    conceptId: 'shepherd-care',
    note: 'Speaks of shepherd care, but no answer for mercy.',
  });
  expect('diagnosisInferred' in body).toBe(false);
  expect(errors).toEqual([]);
});

test('D14: prior calls, supersede chains, undo focus retarget, and the third queue-dot state', async ({ page }) => {
  const errors = collectErrors(page);
  const priorAt = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
  const mock = makeMock({ cases: [caseMock('case-open', 'mercy')] });
  mock.judgments['case-open'] = [{
    schemaVersion: 2,
    judgmentId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    caseId: 'case-open',
    at: priorAt,
    reviewer: 'jesse',
    query: 'mercy',
    action: 'helpful',
    targetId: 'KJV:19085010',
    observedRank: 1,
    observedWindow: 10,
    resultSetDigest: 'd'.repeat(64),
    displayedWindowDigest: 'e'.repeat(64),
    source: 'manual',
    ...identity,
  }];
  await installRoutes(page, mock);
  await page.goto(origin);
  await expect(page.locator('.result-card').first()).toBeVisible();

  // Prior-session chip with relative date; its Undo affordance carries the
  // nothing-is-erased qualifier.
  const chip = page.locator('.result-card[data-stop="0"] .judged-chip');
  await expect(chip).toContainText('Your call from 3 days ago: Helpful');
  const undo = chip.locator('.chip-undo');
  await expect(undo).toHaveAttribute('aria-label', 'Undo — nothing is erased: your call stands until you make a new one.');
  await expect(undo).toHaveAttribute('title', 'Undo — nothing is erased: your call stands until you make a new one.');

  // Open-case handoff went to the first unjudged card (#2, since #1 is judged).
  await expect(page.locator('.result-card[data-stop="1"]')).toBeFocused();

  // H on the judged card posts supersedes:<the prior id>.
  await page.locator('.result-card[data-stop="0"]').focus();
  await page.keyboard.press('h');
  await expect(page.locator('#toast-slot .toast')).toContainText('Replaced your earlier call — Psalm 85:10 is now Helpful.');
  expect(judgmentPosts(mock)[0]!.body).toMatchObject({
    action: 'helpful',
    targetId: 'KJV:19085010',
    supersedes: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  });

  // Commit auto-advanced focus; U moves DOM focus back to the reopened card
  // (the §3.2 undo-retargets-focus binding), and the next E posts
  // supersedes:<the newest id> with card #1's targetId — never card #2's.
  await expect(page.locator('.result-card[data-stop="1"]')).toBeFocused();
  await page.keyboard.press('u');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await expect(page.locator('.result-card[data-stop="0"] .judged-chip')).toHaveText('Reopened — your earlier call stands until you make a new one.');
  await expect(page.locator('#queue-body .queue-row').first().locator('.queue-dot')).toHaveAttribute('aria-label', 'Reopened — your earlier call stands');
  await page.keyboard.press('e');
  await expect(page.locator('.result-card[data-stop="0"] .judged-chip')).toContainText('Your call: Essential (top 3)');
  const second = judgmentPosts(mock)[1]!.body!;
  expect(second).toMatchObject({
    action: 'essential',
    targetId: 'KJV:19085010',
    supersedes: 'jid-1',
  });
  await expect(page.locator('#queue-body .queue-row').first().locator('.queue-dot')).toHaveAttribute('aria-label', 'Judged Essential (top 3)');

  // Clicking the chip's Undo link performs the same focus move.
  await page.locator('.result-card[data-stop="2"]').focus();
  await page.locator('.result-card[data-stop="0"] .judged-chip .chip-undo').click();
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  // A second re-judge supersedes the newest id, not the first.
  await page.keyboard.press('h');
  await expect(page.locator('.result-card[data-stop="0"] .judged-chip')).toContainText('Your call: Helpful');
  expect(judgmentPosts(mock)[2]!.body).toMatchObject({ supersedes: 'jid-2' });
  assertPayloadAllowlist(mock);
  expect(errors).toEqual([]);
});

test('D15 + §7: contract copy placements, engine order sacred after votes, no score numerals', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');

  const contract = 'Your calls are saved the moment you make them. They change search results only in the next reviewed update — never while you work.';
  // (a) the results-rail footer (the D33 shortcut-hint line rides above it;
  // the contract line itself is still asserted verbatim).
  await expect(page.locator('#rail-footer .footer-contract')).toHaveText(contract);

  // Vote on three items; the toast never carries the contract sentence.
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('e');
  await expect(page.locator('.judged-chip')).toHaveCount(1);
  await expect(page.locator('#toast-slot .toast')).not.toContainText('saved the moment');
  await page.keyboard.press('h');
  await expect(page.locator('.judged-chip')).toHaveCount(2);
  await page.keyboard.press('h');
  await expect(page.locator('.judged-chip')).toHaveCount(3);

  // Engine order sacred: DOM order equals mock order, no card hidden.
  const cards = page.locator('.result-card');
  await expect(cards).toHaveCount(10);
  for (let i = 0; i < 10; i += 1) {
    await expect(cards.nth(i)).toContainText(mercyResults[i]!.reference);
  }
  // No score/points numerals leak into the rendered text.
  const bodyText = await page.evaluate(() => document.body.textContent ?? '');
  expect(bodyText).not.toContain('987.65');
  expect(bodyText).not.toContain('431');

  // (b) the empty state carries the contract.
  await submit(page, 'unfindable words');
  await expect(page.locator('#center-body')).toContainText(contract);
  expect(errors).toEqual([]);
});

test('D16: read-only disables every POST-issuing control; recovery on window focus re-enables', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  mock.degraded.value = true;
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card').first()).toBeVisible();

  const banner = page.locator('#banner-slot .banner');
  await expect(banner).toContainText('Read-only right now.');
  const bannerBg = await banner.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bannerBg).toBe('rgba(128, 98, 27, 0.1)'); // --v-missing-wash

  // Verdict buttons, tail-rescue buttons, and Add to my queue all disabled.
  await expect(page.locator('#verdict-essential')).toBeDisabled();
  await expect(page.locator('#verdict-helpful')).toBeDisabled();
  await expect(page.locator('#verdict-notrel')).toBeDisabled();
  await expect(page.locator('#verdict-missing')).toBeDisabled();
  await expect(page.locator('#add-to-queue')).toBeDisabled();
  await page.click('#tail-divider');
  await expect(page.locator('.tail-action').first()).toBeDisabled();

  // E toasts the read-only sentence with no POST; the rescue E opens no
  // preview either.
  await page.locator('.result-card[data-stop="0"]').focus();
  await page.keyboard.press('e');
  await expect(page.locator('#toast-slot .toast')).toHaveText('Read-only right now — this call was not saved.');
  expect(judgmentPosts(mock)).toHaveLength(0);
  expect(casePosts(mock)).toHaveLength(0);
  await page.locator('.tail-row[data-stop="11"]').focus();
  await page.keyboard.press('e');
  await expect(page.locator('#rescue-dialog')).toHaveCount(0);
  expect(judgmentPosts(mock)).toHaveLength(0);

  // Mocked recovery on window focus re-enables.
  mock.degraded.value = false;
  await page.evaluate(() => { window.dispatchEvent(new Event('focus')); });
  await expect(page.locator('#banner-slot .banner')).toHaveCount(0);
  await expect(page.locator('#verdict-essential')).toBeEnabled();
  expect(errors).toEqual([]);
});

test('D17: bulk select — exact counts, disabled judged checkboxes, partial-batch receipt, U hint, read-only', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');

  // Judge card #1 so its checkbox is disabled with the §3.2 aria-label.
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('h');
  await expect(page.locator('.judged-chip')).toHaveCount(1);
  const judgedCheck = page.locator('#queue-body .queue-row').first().locator('.queue-check');
  await expect(judgedCheck).toBeDisabled();
  await expect(judgedCheck).toHaveAttribute('aria-label', 'Already judged — change it on its card');
  // Space on the judged row selects nothing.
  await page.locator('.result-card[data-stop="0"]').focus();
  await page.keyboard.press(' ');
  await expect(page.locator('#bulk-bar')).toHaveCount(0);

  // Select 2 unjudged rows with Space; the bar shows the exact count.
  await page.locator('.result-card[data-stop="2"]').focus();
  await page.keyboard.press(' ');
  await page.keyboard.press('j');
  await page.keyboard.press(' ');
  await expect(page.locator('#bulk-bar')).toContainText('2 selected');
  await expect(page.locator('#bulk-mark')).toHaveText('Mark all helpful');

  const before = judgmentPosts(mock).length;
  await page.click('#bulk-mark');
  await expect(page.locator('#toast-slot .toast')).toHaveText('Marked 2 passages Helpful.');
  expect(judgmentPosts(mock).length - before).toBe(2);
  for (const call of judgmentPosts(mock).slice(before)) {
    expect(call.body).toMatchObject({ action: 'helpful' });
  }
  // No inline Undo link on the bulk receipt; U posts nothing and hints.
  await expect(page.locator('#toast-slot .toast')).not.toContainText('Undo');
  const posts = judgmentPosts(mock).length;
  await page.keyboard.press('u');
  await expect(page.locator('#toast-slot .toast')).toHaveText('Change a bulk call on its card.');
  expect(judgmentPosts(mock).length).toBe(posts);
  expect(errors).toEqual([]);
});

test('D17: a mid-batch failure stops the batch with the partial receipt; read-only disables the bulk bar', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  // Select three unjudged rows.
  for (const stop of [0, 1, 2]) {
    await page.locator(`.result-card[data-stop="${stop}"]`).focus();
    await page.keyboard.press(' ');
  }
  await expect(page.locator('#bulk-bar')).toContainText('3 selected');
  // The second judgment POST fails (the first is judgment #1 after the lazy
  // case create; fail judgment POST number 2).
  mock.judgmentResponder = (_body, n) => n === 2
    ? { status: 500, payload: { ok: false, error: { code: 'internal', message: 'boom' } } }
    : null;
  await page.click('#bulk-mark');
  await expect(page.locator('#toast-slot .toast')).toHaveText('Marked 1 of 3 — the rest did not save. Try them on their cards.');
  // Exactly one row shows a judged chip; the two uncommitted rows stay
  // selected; no further POSTs after the failure.
  await expect(page.locator('.judged-chip')).toHaveCount(1);
  await expect(page.locator('#bulk-bar')).toContainText('2 selected');
  expect(judgmentPosts(mock)).toHaveLength(2);

  // Read-only: the bulk bar's button is disabled and fires zero POSTs.
  mock.degraded.value = true;
  await page.evaluate(() => { window.dispatchEvent(new Event('focus')); });
  await expect(page.locator('#bulk-mark')).toBeDisabled();
  await page.click('#bulk-mark', { force: true });
  expect(judgmentPosts(mock)).toHaveLength(2);
  expect(errors).toEqual([]);
});

test('D18: tail rescue — preview always precedes the POST; Enter is a no-op; canonical single-verse posting', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');

  // Expand the tail: the pre-commit permanence header is visible before any
  // POST, and focusing row #11 loads Context before any rescue POST.
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  for (let i = 0; i < 9; i += 1) await page.keyboard.press('j');
  await page.keyboard.press('j'); // divider
  await page.keyboard.press('Enter');
  await expect(page.locator('.tail-header')).toHaveText('A rescue is recorded like a suggestion — it can’t be taken back here.');
  expect(judgmentPosts(mock)).toHaveLength(0);
  await page.keyboard.press('j'); // row #11
  await expect(page.locator('.tail-row[data-stop="11"]')).toBeFocused();
  const contextIndex = mock.calls.findIndex((call) => call.path === '/api/v2/context' && call.search.includes(encodeURIComponent('Hosea 6:6')));
  expect(contextIndex).toBeGreaterThan(-1);

  // Enter on a focused tail row fires no POST and opens no layer.
  await page.keyboard.press('Enter');
  await expect(page.locator('#rescue-dialog')).toHaveCount(0);
  expect(judgmentPosts(mock)).toHaveLength(0);

  // H/X/M on a tail row: the one-action hint, no POST.
  await page.keyboard.press('x');
  await expect(page.locator('#toast-slot .toast')).toHaveText('Lower results take one action — “Should be near the top”.');
  expect(judgmentPosts(mock)).toHaveLength(0);

  // E opens the single-verse preview: E alone posts nothing; the §3.3
  // permanence line is inside the layer; initial focus is Cancel, so an
  // E-then-Enter double-tap cannot commit.
  await page.keyboard.press('e');
  await expect(page.locator('#rescue-dialog')).toBeVisible();
  await expect(page.locator('#rescue-dialog')).toContainText('For I desired mercy, and not sacrifice.');
  await expect(page.locator('#rescue-dialog')).toContainText('A suggestion can’t be taken back here — you’ll see it again in Finish up before anything is written, and a human reviews every change before it ships.');
  await expect(page.locator('#rescue-cancel')).toBeFocused();
  expect(judgmentPosts(mock)).toHaveLength(0);
  await page.keyboard.press('Enter'); // activates Cancel — nothing posted
  await expect(page.locator('#rescue-dialog')).toHaveCount(0);
  expect(judgmentPosts(mock)).toHaveLength(0);
  await expect(page.locator('.tail-row[data-stop="11"]')).toBeFocused();

  // Confirming posts the §4.4 body on the lazy-created case (create ->
  // judgment -> reviewing), with the canonical resolved reference.
  await page.keyboard.press('e');
  await page.click('#rescue-confirm');
  await expect(page.locator('#toast-slot .toast')).toHaveText('Noted — Hosea 6:6 should rank near the top for “mercy”. Saved to your calls for the next reviewed update.');
  expect(casePosts(mock)).toHaveLength(1);
  const posts = judgmentPosts(mock);
  expect(posts).toHaveLength(1);
  expect(posts[0]!.body).toEqual({
    caseId: 'case-1',
    snapshotToken: mock.lastToken,
    action: 'missing',
    reference: 'Hosea 6:6',
    withinTop: 10,
  });
  const statePost = mock.calls.find((call) => call.method === 'POST' && call.path.endsWith('/state'));
  expect(statePost!.body).toEqual({ state: 'reviewing' });
  expect(contextIndex).toBeLessThan(mock.calls.indexOf(posts[0]!));

  // The rescued row's receipt chip carries the permanence sentence.
  await expect(page.locator('.receipt-chip')).toContainText('A suggestion can’t be taken back here');
  // U while the rescue toast is the target posts nothing; permanence shows.
  await page.keyboard.press('u');
  await expect(page.locator('#toast-slot .toast')).toContainText('A suggestion can’t be taken back here');
  expect(judgmentPosts(mock)).toHaveLength(1);
  assertPayloadAllowlist(mock);
  expect(errors).toEqual([]);
});

test('D18: a range tail row rescues through pick chips — the range string reaches no POST body', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.click('#tail-divider');
  await page.locator('.tail-row[data-stop="12"]').focus();
  await expect(page.locator('.tail-row[data-stop="12"]')).toContainText('Psalm 46:1-3');

  // E opens the pick-chip preview: nothing posts, the run's first verse is
  // pre-selected, and initial focus is that chip — not Confirm.
  await page.keyboard.press('e');
  await expect(page.locator('#rescue-dialog .pick-chip')).toHaveCount(3);
  await expect(page.locator('#rescue-dialog')).toContainText('Pick the one verse that should rank — suggestions are recorded one verse at a time.');
  const preselected = page.locator('#rescue-dialog .pick-chip[data-verse="1"]');
  await expect(preselected).toHaveAttribute('aria-pressed', 'true');
  await expect(preselected).toBeFocused();
  expect(judgmentPosts(mock)).toHaveLength(0);
  // Enter immediately after E re-picks the chip; no judgment POST fires.
  await page.keyboard.press('Enter');
  expect(judgmentPosts(mock)).toHaveLength(0);
  await expect(page.locator('#rescue-dialog')).toBeVisible();

  // Keeping the pre-selected default and confirming posts "Psalm 46:1" —
  // the run's first verse, the verse the row's targetId addresses.
  await expect(page.locator('#rescue-confirm')).toBeEnabled();
  await expect(page.locator('#rescue-dialog')).toContainText('A suggestion can’t be taken back here');
  await page.click('#rescue-confirm');
  await expect(page.locator('#toast-slot .toast')).toContainText('Noted — Psalm 46:1 should rank near the top for “mercy”.');
  const posts = judgmentPosts(mock);
  expect(posts).toHaveLength(1);
  expect(posts[0]!.body).toMatchObject({ action: 'missing', reference: 'Psalm 46:1', withinTop: 10 });
  for (const call of mock.calls.filter((entry) => entry.body !== null)) {
    expect(JSON.stringify(call.body)).not.toContain('Psalm 46:1-3');
  }
  // The receipt chip names the picked verse, never the range.
  await expect(page.locator('.receipt-chip')).toContainText('Psalm 46:1');
  expect(errors).toEqual([]);
});

test('D18: a merged run keeping a non-first member’s targetId pre-selects THAT verse, not the range’s first', async ({ page }) => {
  // The engine keeps the best-ranked member's targetId on a collapsed run
  // (mergeGroup targetId = head.targetId), so "Psalms 91:1-2" can carry
  // WEB:19091002 — verse 2. §3.1 binds the pre-selection to "the verse the
  // row's targetId addresses", which is decoded, not parsed from the range.
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'shelter');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.click('#tail-divider');
  await page.locator('.tail-row[data-stop="11"]').focus();
  await expect(page.locator('.tail-row[data-stop="11"]')).toContainText('Psalms 91:1-2');

  await page.keyboard.press('e');
  await expect(page.locator('#rescue-dialog .pick-chip')).toHaveCount(2);
  const preselected = page.locator('#rescue-dialog .pick-chip[data-verse="2"]');
  await expect(preselected).toHaveAttribute('aria-pressed', 'true');
  await expect(preselected).toBeFocused();
  expect(judgmentPosts(mock)).toHaveLength(0);

  // Confirming the default posts the targetId-addressed verse's canonical
  // single-verse reference; the range string reaches no POST body.
  await expect(page.locator('#rescue-confirm')).toBeEnabled();
  await page.click('#rescue-confirm');
  await expect(page.locator('#toast-slot .toast')).toContainText('Noted — Psalms 91:2 should rank near the top for “shelter”.');
  const posts = judgmentPosts(mock);
  expect(posts).toHaveLength(1);
  expect(posts[0]!.body).toMatchObject({ action: 'missing', reference: 'Psalms 91:2', withinTop: 10 });
  for (const call of mock.calls.filter((entry) => entry.body !== null)) {
    expect(JSON.stringify(call.body)).not.toContain('Psalms 91:1-2');
  }
  assertPayloadAllowlist(mock);
  expect(errors).toEqual([]);
});

test('D18: picking a different chip posts that verse; a failed resolution shows the retry branch', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  mock.failPassageRefs.add('Psalm 46:1-3');
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.click('#tail-divider');
  await page.locator('.tail-row[data-stop="12"]').focus();
  await page.keyboard.press('e');

  // §3.1 resolution-timing failure branch: the search-error sentence with a
  // Retry; Confirm disabled; zero judgment POSTs.
  await expect(page.locator('#rescue-dialog')).toContainText('The engine did not answer. It may be restarting — try again in a moment.');
  await expect(page.locator('#rescue-confirm')).toBeDisabled();
  expect(judgmentPosts(mock)).toHaveLength(0);
  // Esc still closes with nothing posted... but first, Retry refires the
  // resolution and enables Confirm on success.
  mock.failPassageRefs.delete('Psalm 46:1-3');
  await page.click('#rescue-retry');
  await expect(page.locator('#rescue-dialog .pick-chip')).toHaveCount(3);
  // Pick verse 2: the confirm posts its canonical single-verse reference.
  await page.click('#rescue-dialog .pick-chip[data-verse="2"]');
  await expect(page.locator('#rescue-confirm')).toBeEnabled();
  await page.click('#rescue-confirm');
  await expect(page.locator('#toast-slot .toast')).toContainText('Noted — Psalm 46:2 should rank near the top');
  expect(judgmentPosts(mock)[0]!.body).toMatchObject({ reference: 'Psalm 46:2', withinTop: 10 });
  expect(errors).toEqual([]);
});

test('D18: a rescue confirm answered with the already-present 400 closes the layer and runs the §3.3 recovery', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  mock.judgmentResponder = (body) => body.action === 'missing'
    ? {
        status: 400,
        payload: { ok: false, error: { code: 'validation_failed', message: '"Hosea 6:6" was already present in the judged result set.' } },
      }
    : null;
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.click('#tail-divider');
  await page.locator('.tail-row[data-stop="11"]').focus();
  await page.keyboard.press('e');
  await page.click('#rescue-confirm');
  // The layer closes; the specific toast — never the generic §3.11 one.
  await expect(page.locator('#rescue-dialog')).toHaveCount(0);
  await expect(page.locator('#toast-slot .toast')).toHaveText('That passage is already in the results — judge it there instead.');
  expect(errors).toEqual([]);
});

test('D18: read-only mid-preview disables Confirm after a health refetch', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.click('#tail-divider');
  await page.locator('.tail-row[data-stop="11"]').focus();
  await page.keyboard.press('e');
  await expect(page.locator('#rescue-confirm')).toBeEnabled();
  mock.degraded.value = true;
  await page.evaluate(() => { window.dispatchEvent(new Event('focus')); });
  await expect(page.locator('#rescue-confirm')).toBeDisabled();
  await page.click('#rescue-confirm', { force: true });
  expect(judgmentPosts(mock)).toHaveLength(0);
  expect(errors).toEqual([]);
});
test('D11: the lazy-creation race guard drops the pending vote when the fresh snapshot disagrees', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  const reordered = [mercyResults[1]!, mercyResults[0]!, ...mercyResults.slice(2, 10)];
  mock.snapshotResults = () => reordered;
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('e');
  // POST /cases happened, but the judgment never fired; the list re-rendered
  // from the returned snapshot with the re-confirmation toast.
  await expect(page.locator('#toast-slot .toast')).toHaveText('The results just refreshed — check your call still applies.');
  expect(casePosts(mock)).toHaveLength(1);
  expect(judgmentPosts(mock)).toHaveLength(0);
  await expect(page.locator('.result-card[data-stop="0"]')).toContainText('Psalm 23:1-4');
  expect(errors).toEqual([]);
});
