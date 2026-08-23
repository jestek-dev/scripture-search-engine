import { expect, test } from '@playwright/test';

import {
  assertPayloadAllowlist, caseMock, casePosts, collectErrors, installRoutes,
  judgmentMock, judgmentPosts, makeMock, startStudyServer, submit,
  type StudyServer,
} from './study-shared';

// P3 demo spec (plan D23): the §3.3 suggestion flow end-to-end — D20 (the
// missing-passage form: entry points, live preview, single-verse rule,
// canonical posting, already-displayed redirects, the M gate), D21 (the
// empty-results suggestion path with lazy case creation), and D22 (the
// "Your suggestion" receipt card, session and prior-session).

let server: StudyServer;
let origin: string;

test.beforeAll(async () => {
  server = await startStudyServer();
  origin = server.origin;
});

test.afterAll(async () => {
  await server.close();
});

/** Direct children of #results-list by primary class, for order assertions. */
async function resultsListOrder(page: import('@playwright/test').Page): Promise<string[]> {
  return page.evaluate(() => Array.from(document.querySelectorAll('#results-list > *'))
    .map((el) => (el.className || el.tagName.toLowerCase()).split(' ')[0]!));
}

test('D20: M gate, live preview, permanence before commit, Enter posting the canonical body, receipt card after rank #10', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);

  // The M gate (§3.2): before any search, M opens no form and fires no POST
  // — the hint toast shows and the verdict toolbar is absent from the DOM.
  await page.locator('body').click();
  await page.keyboard.press('m');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  await expect(page.locator('#toast-slot .toast')).toHaveText('Search words or phrases first — a suggestion attaches to the search that misses it.');
  await expect(page.locator('#verdict-bar')).toHaveCount(0);
  // Same on a reference-kind view.
  await submit(page, 'Psalm 46');
  await page.locator('body').click();
  await page.keyboard.press('m');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  await expect(page.locator('#toast-slot .toast')).toHaveText('Search words or phrases first — a suggestion attaches to the search that misses it.');
  await expect(page.locator('#verdict-bar')).toHaveCount(0);
  expect(judgmentPosts(mock)).toHaveLength(0);

  // On discovery results, M opens the form with focus in the reference
  // input; title, prompt, placeholders, and the permanence line are the §3.3
  // copy, visible before any POST.
  await submit(page, 'mercy');
  await page.locator('.result-card[data-stop="0"]').focus();
  await page.keyboard.press('m');
  await expect(page.locator('#missing-form-dialog')).toBeVisible();
  await expect(page.locator('#missing-form-title')).toHaveText('Add a passage that should be here');
  await expect(page.locator('#missing-form-dialog')).toContainText('Which passage is missing for “mercy”?');
  await expect(page.locator('#missing-ref-input')).toBeFocused();
  await expect(page.locator('#missing-ref-input')).toHaveAttribute('placeholder', 'e.g. Lamentations 3:22');
  // The phrases-people-might-type note capture (§3.3), placeholder verbatim.
  await expect(page.locator('#missing-note')).toHaveAttribute('placeholder', 'Optional — e.g. other phrases people might type to find this.');
  await expect(page.locator('#missing-permanence')).toHaveText('A suggestion can’t be taken back here — you’ll see it again in Finish up before anything is written, and a human reviews every change before it ships.');
  expect(judgmentPosts(mock)).toHaveLength(0);
  await expect(page.locator('#missing-preview')).toContainText('The passage appears here as you type, so you can check it is the right one.');
  await expect(page.locator('#missing-submit')).toBeDisabled();

  // Enter while Submit is disabled is a no-op (§3.12 missing-form row).
  await page.keyboard.press('Enter');
  expect(judgmentPosts(mock)).toHaveLength(0);

  // A non-resolving input shows the recovery line after the 1.5s settle
  // delay; Submit stays disabled.
  await page.fill('#missing-ref-input', 'Hesekiah 1:1');
  await expect(page.locator('#missing-preview')).toContainText('“Hesekiah 1:1” doesn’t match a passage yet — check the book name, chapter, and verse (e.g. “Psalm 46:1”). Abbreviations like “Ps 46:1” work too.', { timeout: 4000 });
  await expect(page.locator('#missing-submit')).toBeDisabled();

  // A single-verse reference previews its verse and enables Submit; Enter
  // posts the exact §4.4 body — canonical reference, picker value, typed
  // note — after the case is lazily created (decision 6).
  await page.fill('#missing-ref-input', 'Lamentations 3:22');
  await expect(page.locator('#missing-preview')).toContainText('It is of the LORD’s mercies that we are not consumed');
  await expect(page.locator('#missing-submit')).toBeEnabled();
  await page.fill('#missing-note', 'people also type steadfast love');
  await page.locator('#missing-ref-input').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  const creates = casePosts(mock);
  expect(creates).toHaveLength(1);
  const posts = judgmentPosts(mock);
  expect(posts).toHaveLength(1);
  expect(posts[0]!.body).toEqual({
    caseId: 'case-1',
    snapshotToken: mock.lastToken,
    action: 'missing',
    reference: 'Lamentations 3:22',
    withinTop: 3,
    note: 'people also type steadfast love',
  });
  expect(mock.calls.indexOf(creates[0]!)).toBeLessThan(mock.calls.indexOf(posts[0]!));

  // D22: the "Your suggestion" receipt card — reference, excerpt, both
  // lines — renders after rank #10 and outside the rank-badged list.
  const receipt = page.locator('.receipt-card');
  await expect(receipt).toHaveCount(1);
  await expect(receipt).toContainText('Your suggestion');
  await expect(receipt).toContainText('Lamentations 3:22');
  await expect(receipt).toContainText('It is of the LORD’s mercies that we are not consumed');
  await expect(receipt).toContainText('Saved to your calls. It goes in for review with the next reviewed update.');
  await expect(receipt).toContainText('A suggestion can’t be taken back here');
  await expect(receipt.locator('.rank-badge')).toHaveCount(0);
  const order = await resultsListOrder(page);
  expect(order.filter((name) => name === 'result-card')).toHaveLength(10);
  expect(order.indexOf('receipt-card')).toBeGreaterThan(order.lastIndexOf('result-card'));

  // The persistent "Missing a passage?" entry point is pinned after the top
  // block and reopens the form; Esc closes it and returns focus there.
  await expect(page.locator('#missing-link')).toHaveText('Missing a passage?');
  await page.click('#missing-link');
  await expect(page.locator('#missing-form-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  await expect(page.locator('#missing-link')).toBeFocused();
  expect(judgmentPosts(mock)).toHaveLength(1);

  // U while the suggestion is the toast target posts nothing; permanence.
  await page.keyboard.press('u');
  await expect(page.locator('#toast-slot .toast')).toContainText('A suggestion can’t be taken back here');
  expect(judgmentPosts(mock)).toHaveLength(1);
  assertPayloadAllowlist(mock);
  expect(errors).toEqual([]);
});

test('D20: multi-verse pick chips and the already-displayed pre-checks (exact card, top-10 range members, tail)', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('m');

  // A 2-verse reference renders both verses as pick chips, keeps Submit
  // disabled, shows the one-verse copy; Enter fires no POST.
  await page.fill('#missing-ref-input', 'Lamentations 3:22-23');
  await expect(page.locator('#missing-preview .pick-chip')).toHaveCount(2);
  await expect(page.locator('#missing-preview')).toContainText('Pick the one verse that should rank — suggestions are recorded one verse at a time.');
  await expect(page.locator('#missing-submit')).toBeDisabled();
  await page.locator('#missing-ref-input').focus();
  await page.keyboard.press('Enter');
  expect(judgmentPosts(mock)).toHaveLength(0);
  // Picking a chip re-resolves that verse; the posted reference is the
  // canonical single-verse label, not the typed range.
  await page.click('#missing-preview .pick-chip[data-verse="22"]');
  await expect(page.locator('#missing-submit')).toBeEnabled();
  await page.click('#missing-submit');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  await expect(page.locator('#toast-slot .toast')).toContainText('Added Lamentations 3:22 as missing');
  expect(judgmentPosts(mock)[0]!.body).toMatchObject({ action: 'missing', reference: 'Lamentations 3:22' });
  const postsBefore = judgmentPosts(mock).length;

  // Exact-reference pre-check: a typed ref matching a displayed single-verse
  // card focuses that card and toasts the §3.3 copy — no POST.
  await page.locator('.result-card[data-stop="0"]').focus();
  await page.keyboard.press('m');
  await page.fill('#missing-ref-input', 'Micah 7:18');
  await expect(page.locator('#missing-submit')).toBeEnabled();
  await page.click('#missing-submit');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  await expect(page.locator('#toast-slot .toast')).toHaveText('That passage is already in the results — judge it there instead.');
  await expect(page.locator('.result-card[data-stop="2"]')).toBeFocused();
  expect(judgmentPosts(mock)).toHaveLength(postsBefore);

  // Range-membership pre-check: "Psalm 23:2" is a member verse of the
  // displayed range card "Psalm 23:1-4" — toast + focus, zero POSTs. The
  // member-verse comparison, not the string compare.
  await page.locator('.result-card[data-stop="0"]').focus();
  await page.keyboard.press('m');
  await page.fill('#missing-ref-input', 'Psalm 23:2');
  await expect(page.locator('#missing-submit')).toBeEnabled();
  await page.click('#missing-submit');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  await expect(page.locator('#toast-slot .toast')).toHaveText('That passage is already in the results — judge it there instead.');
  await expect(page.locator('.result-card[data-stop="1"]')).toBeFocused();
  expect(judgmentPosts(mock)).toHaveLength(postsBefore);

  // Tail pre-check: a typed ref matching a tail row expands the tail,
  // focuses that row, and shows the rescue-instead toast — no POST.
  await page.locator('.result-card[data-stop="1"]').focus();
  await page.keyboard.press('m');
  await page.fill('#missing-ref-input', 'Hosea 6:6');
  await expect(page.locator('#missing-submit')).toBeEnabled();
  await page.click('#missing-submit');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  await expect(page.locator('#toast-slot .toast')).toHaveText('That passage is already in the lower results — rescue it there instead.');
  await expect(page.locator('#tail-divider')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.tail-row[data-stop="11"]')).toBeFocused();
  expect(judgmentPosts(mock)).toHaveLength(postsBefore);
  expect(errors).toEqual([]);
});

test('D20: the server-side already-present 400 gets the specific toast; read-only disables Submit and Enter posts nothing', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  mock.judgmentResponder = (body) => body.action === 'missing'
    ? {
        status: 400,
        payload: { ok: false, error: { code: 'validation_failed', message: '"Lamentations 3:22" was already present in the judged result set.' } },
      }
    : null;
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('m');
  await page.fill('#missing-ref-input', 'Lamentations 3:22');
  await expect(page.locator('#missing-submit')).toBeEnabled();
  await page.click('#missing-submit');
  await expect(page.locator('#toast-slot .toast')).toHaveText('That passage is already in the results — judge it there instead.');
  const postsAfterServerCheck = judgmentPosts(mock).length;
  expect(postsAfterServerCheck).toBe(1);

  // Read-only: the form opens but its Submit is disabled; Enter in the
  // reference input fires no POST (§3.11's control list).
  mock.degraded.value = true;
  await page.evaluate(() => { window.dispatchEvent(new Event('focus')); });
  await page.locator('body').click();
  await page.keyboard.press('m');
  await expect(page.locator('#missing-form-dialog')).toBeVisible();
  await page.fill('#missing-ref-input', 'Lamentations 3:22');
  await expect(page.locator('#missing-preview')).toContainText('It is of the LORD’s mercies');
  await expect(page.locator('#missing-submit')).toBeDisabled();
  await page.locator('#missing-ref-input').focus();
  await page.keyboard.press('Enter');
  expect(judgmentPosts(mock)).toHaveLength(postsAfterServerCheck);
  expect(errors).toEqual([]);
});

test('D20: the server-message fallback catches a pre-check miss and still scrolls to the matching card', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  // The displayed range card "Psalm 23:1-4" refuses to resolve during the
  // client pre-check, so the member-verse comparison cannot prove the match
  // and the POST fires; the server answers with the already-present 400 (the
  // §3.3 "the server-message fallback still catches any miss" sentence). The
  // recovery pass re-runs the comparison — resolution now succeeds — and
  // focuses the matching card with the specific toast, not the generic one.
  mock.failPassageRefs.add('Psalm 23:1-4');
  mock.judgmentResponder = (body) => {
    if (body.action !== 'missing') return null;
    mock.failPassageRefs.delete('Psalm 23:1-4');
    return {
      status: 400,
      payload: { ok: false, error: { code: 'validation_failed', message: '"Psalm 23:2" was already present in the judged result set.' } },
    };
  };
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('m');
  await page.fill('#missing-ref-input', 'Psalm 23:2');
  await expect(page.locator('#missing-submit')).toBeEnabled();
  await page.click('#missing-submit');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  await expect(page.locator('#toast-slot .toast')).toHaveText('That passage is already in the results — judge it there instead.');
  await expect(page.locator('.result-card[data-stop="1"]')).toBeFocused();
  expect(judgmentPosts(mock)).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('D20: the form’s top-N picker moves with the arrows and the picked value rides the POST; a repeat suggestion supersedes', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('m');
  await page.fill('#missing-ref-input', 'Lamentations 3:22');
  await expect(page.locator('#missing-submit')).toBeEnabled();

  // Selection follows focus (the WAI-ARIA radiogroup pattern): the arrow
  // alone changes the value the Submit commits.
  await page.locator('#missing-topn .topn-seg[aria-checked="true"]').focus();
  await expect(page.locator('#missing-topn .topn-seg[aria-checked="true"]')).toHaveText('3');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#missing-topn .topn-seg[aria-checked="true"]')).toHaveText('5');
  await expect(page.locator('#missing-topn .topn-seg[aria-checked="true"]')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#missing-topn .topn-seg[aria-checked="true"]')).toHaveText('10');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#missing-topn .topn-seg[aria-checked="true"]')).toHaveText('5');
  await page.click('#missing-submit');
  await expect(page.locator('#toast-slot .toast')).toContainText('Added Lamentations 3:22 as missing (top 5)');
  const first = judgmentPosts(mock)[0]!;
  expect(first.body).toEqual({
    caseId: 'case-1',
    snapshotToken: mock.lastToken,
    action: 'missing',
    reference: 'Lamentations 3:22',
    withinTop: 5,
  });

  // Clicking Submit and pressing Enter build the same body (§3.12): the
  // repeat suggestion posts the identical fields plus the §4.5 supersede of
  // the earlier missing record for the same reference.
  await page.locator('.result-card[data-stop="0"]').focus();
  await page.keyboard.press('m');
  await page.fill('#missing-ref-input', 'Lamentations 3:22');
  await expect(page.locator('#missing-submit')).toBeEnabled();
  await page.locator('#missing-topn .topn-seg[aria-checked="true"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#missing-topn .topn-seg[aria-checked="true"]')).toHaveText('5');
  await page.locator('#missing-ref-input').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  const posts = judgmentPosts(mock);
  expect(posts).toHaveLength(2);
  const { supersedes, ...rest } = posts[1]!.body as Record<string, unknown>;
  expect(supersedes).toBe('jid-1');
  expect(rest).toEqual(first.body);
  assertPayloadAllowlist(mock);
  expect(errors).toEqual([]);
});

test('D21: the empty-results state opens the pre-linked form and lazily creates the case on submit', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'unfindable words');
  await expect(page.locator('#center-body')).toContainText('No results for “unfindable words”.');
  await expect(page.locator('#center-body')).toContainText('Know a passage that should answer this? Add it.');
  await expect(page.locator('#empty-add-missing')).toHaveText('Add the missing passage');
  await page.click('#empty-add-missing');
  await expect(page.locator('#missing-form-dialog')).toContainText('Which passage is missing for “unfindable words”?');
  await page.fill('#missing-ref-input', 'Lamentations 3:22');
  await expect(page.locator('#missing-submit')).toBeEnabled();
  await page.click('#missing-submit');
  await expect(page.locator('#toast-slot .toast')).toContainText('Added Lamentations 3:22 as missing');
  const creates = casePosts(mock);
  const posts = judgmentPosts(mock);
  expect(creates).toHaveLength(1);
  expect(creates[0]!.body).toEqual({ query: 'unfindable words', source: 'manual' });
  expect(posts).toHaveLength(1);
  expect(posts[0]!.body).toMatchObject({ action: 'missing', reference: 'Lamentations 3:22' });
  expect(mock.calls.indexOf(creates[0]!)).toBeLessThan(mock.calls.indexOf(posts[0]!));
  expect(errors).toEqual([]);
});

test('D22: a prior-session missing judgment renders its receipt card on boot, supersede-resolved, with the lazily fetched verse', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ cases: [caseMock('case-open', 'mercy')] });
  // Two prior-session missing records for the same reference: the older one
  // is superseded (§4.5 — the only supersede a missing judgment accepts) and
  // must not produce a second card.
  mock.judgments['case-open'] = [
    judgmentMock('case-open', 'jid-old', { action: 'missing', reference: 'Lamentations 3:22', withinTop: 3 }),
    judgmentMock('case-open', 'jid-new', { action: 'missing', reference: 'Lamentations 3:22', withinTop: 5, supersedes: 'jid-old' }),
  ];
  await installRoutes(page, mock);
  await page.goto(origin);

  // Boot auto-loads the open case; the receipt card renders after rank #10
  // with both §3.3 lines and the verse text resolved via GET /api/passage.
  const receipt = page.locator('.receipt-card');
  await expect(receipt).toHaveCount(1);
  await expect(receipt).toContainText('Your suggestion');
  await expect(receipt).toContainText('Lamentations 3:22');
  await expect(receipt).toContainText('It is of the LORD’s mercies that we are not consumed');
  await expect(receipt).toContainText('Saved to your calls. It goes in for review with the next reviewed update.');
  await expect(receipt).toContainText('A suggestion can’t be taken back here');
  await expect(receipt.locator('.rank-badge')).toHaveCount(0);
  const order = await resultsListOrder(page);
  expect(order.filter((name) => name === 'result-card')).toHaveLength(10);
  expect(order.indexOf('receipt-card')).toBeGreaterThan(order.lastIndexOf('result-card'));
  const passageFetches = mock.calls.filter((call) => call.path === '/api/passage' && call.search.includes('Lamentations'));
  expect(passageFetches.length).toBeGreaterThan(0);
  expect(judgmentPosts(mock)).toHaveLength(0);
  expect(errors).toEqual([]);
});
