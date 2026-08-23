import { createHash } from 'node:crypto';

import { expect, test, type Page } from '@playwright/test';

import {
  ENDPOINT_FAILURES, FALLBACK_LOAD, FALLBACK_POST, NOTHING_RENDERS,
  READ_ONLY_TOAST, SEARCH_ERROR, VALIDATION_TOAST,
} from './endpointFailures';
import {
  caseMock, casePosts, collectErrors, installRoutes, judgmentMock, judgmentPosts,
  makeMock, startStudyServer, submit,
  type MockState, type StudyServer,
} from './study-shared';

// P5 demo spec (plan D40 — same phase-exit role as D9/D19/D23/D31): covers
// D32 onboarding, D33 the `?` sheet + single-key toggle, D34 the keyboard/
// focus audit (the §3.12 table re-walked), D35's ARIA/role Playwright
// checks, D36 motion, D37 the responsive floor, D38 the build-change
// notice, and the D39 ENDPOINT_FAILURES loop — zero console/page errors.

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
const CONTRACT = 'Your calls are saved the moment you make them. They change search results only in the next reviewed update — never while you work.';

// ---------------------------------------------------------------------------
// D32 — onboarding
// ---------------------------------------------------------------------------

test('D32: fresh storage shows card 1; only J advances; the contract sentence rides the tour; ? sets the flag and reload skips', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock, { onboarded: false });
  await page.goto(origin);

  const dialog = page.locator('#onboard-dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#onboard-title')).toHaveText('Move through the queue');
  // The tour carries the contract sentence once (§3.9).
  await expect(dialog).toContainText(CONTRACT);
  // The layer focus contract: dialog semantics + a trapped Tab.
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog).toHaveAttribute('aria-labelledby', 'onboard-title');

  // Card 1 really requires its key: E does not advance (and posts nothing).
  await page.keyboard.press('e');
  await expect(page.locator('#onboard-title')).toHaveText('Move through the queue');
  await page.keyboard.press('j');
  await expect(page.locator('#onboard-title')).toHaveText('Judge with one letter');
  await expect(dialog).toContainText('E marks a passage essential. H is helpful, X is not relevant, M records a missing passage.');

  // Card 2 requires E; J does not advance.
  await page.keyboard.press('j');
  await expect(page.locator('#onboard-title')).toHaveText('Judge with one letter');
  await page.keyboard.press('e');
  await expect(page.locator('#onboard-title')).toHaveText('Help is always one key away');
  await expect(dialog).toContainText('Press the key to continue — that is the whole lesson.');

  // Card 3 requires ?; completing sets the flag.
  await page.keyboard.press('?');
  await expect(page.locator('#onboard-dialog')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('study.onboarded'))).toBe('1');
  // No key in the tour posted anything.
  expect(judgmentPosts(mock)).toHaveLength(0);
  expect(casePosts(mock)).toHaveLength(0);

  // Reload skips the tour.
  await page.reload();
  await expect(page.locator('#search-input')).toBeVisible();
  await expect(page.locator('#onboard-dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('D32: Skip the tour works by mouse', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock, { onboarded: false });
  await page.goto(origin);
  await expect(page.locator('#onboard-dialog')).toBeVisible();
  await page.click('#onboard-skip');
  await expect(page.locator('#onboard-dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D33 — the `?` sheet and the single-key toggle
// ---------------------------------------------------------------------------

test('D33: ? opens the sheet with the four groups and Esc closes; the rail-footer button opens the same sheet', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  await page.keyboard.press('?');
  const dialog = page.locator('#sheet-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  for (const group of ['Move', 'Judge', 'Compare', 'Everywhere']) {
    await expect(dialog.locator('.sheet-group h3', { hasText: group })).toHaveCount(1);
  }
  await expect(dialog).toContainText('Esc to close');
  await page.keyboard.press('Escape');
  await expect(page.locator('#sheet-dialog')).toHaveCount(0);

  // The footer button opens the same sheet.
  await page.click('#all-shortcuts');
  await expect(page.locator('#sheet-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(errors).toEqual([]);
});

test('D33: shortcuts Off makes E a no-op (no POST) while the toolbar button still commits; the setting survives reload', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  await page.click('#all-shortcuts');
  await expect(page.locator('#shortcuts-toggle')).toHaveAttribute('aria-checked', 'true');
  await page.click('#shortcuts-toggle');
  await expect(page.locator('#shortcuts-toggle')).toHaveAttribute('aria-checked', 'false');
  await page.keyboard.press('Escape');
  await expect(page.locator('#sheet-dialog')).toHaveCount(0);

  // E on the focused row is a no-op: no case create, no judgment POST.
  await page.locator('.result-card[data-stop="0"]').focus();
  await page.keyboard.press('e');
  expect(judgmentPosts(mock)).toHaveLength(0);
  expect(casePosts(mock)).toHaveLength(0);
  // J is off too; the arrow keys remain.
  await page.keyboard.press('j');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.result-card[data-stop="1"]')).toBeFocused();
  await page.keyboard.press('ArrowUp');

  // The toolbar button still commits — every action keeps its button.
  await page.click('#verdict-essential');
  await expect(page.locator('#toast-slot .toast')).toContainText('Marked Psalm 85:10 Essential (top 3)');
  expect(judgmentPosts(mock)).toHaveLength(1);

  // The setting survives reload.
  await page.reload();
  await expect(page.locator('#search-input')).toHaveValue('mercy');
  expect(await page.evaluate(() => localStorage.getItem('study.shortcuts'))).toBe('0');
  await submit(page, 'shelter');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  const before = judgmentPosts(mock).length;
  await page.keyboard.press('e');
  expect(judgmentPosts(mock)).toHaveLength(before);
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D34 — keyboard/focus audit: the §3.12 table re-walked
// ---------------------------------------------------------------------------

test('D34: post-search handoff, J/K + arrows, tail boundary, tail Enter no-op, tail hints, rescue preview focus, Space bulk', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');

  // Post-search focus handoff: DOM focus is card #1, the input keeps its value.
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await expect(page.locator('#search-input')).toHaveValue('mercy');

  // K on card #1 does nothing — no wrap.
  await page.keyboard.press('k');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  // J and the arrows move.
  await page.keyboard.press('j');
  await expect(page.locator('.result-card[data-stop="1"]')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  // The top-N picker is a radiogroup: the arrow alone changes the selection.
  await page.locator('.topn-seg[aria-checked="true"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.topn-seg[data-topn="5"]')).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.topn-seg[data-topn="3"]')).toHaveAttribute('aria-checked', 'true');

  // J to the last top-block card, then the divider; Enter expands it.
  await page.locator('.result-card[data-stop="9"]').focus();
  await page.keyboard.press('j');
  await expect(page.locator('#tail-divider')).toBeFocused();
  await expect(page.locator('#tail-divider')).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Enter');
  await expect(page.locator('#tail-divider')).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#tail-divider').focus();
  await page.keyboard.press('j');
  await expect(page.locator('.tail-row[data-stop="11"]')).toBeFocused();
  await page.keyboard.press('k');
  await expect(page.locator('#tail-divider')).toBeFocused();
  await page.keyboard.press('k');
  await expect(page.locator('.result-card[data-stop="9"]')).toBeFocused();

  // Tail-row Enter is a no-op: no POST, no layer.
  await page.keyboard.press('j');
  await page.keyboard.press('j');
  await expect(page.locator('.tail-row[data-stop="11"]')).toBeFocused();
  await page.keyboard.press('Enter');
  expect(judgmentPosts(mock)).toHaveLength(0);
  await expect(page.locator('#rescue-dialog')).toHaveCount(0);
  // J on the last expanded tail row does nothing.
  await page.locator('.tail-row[data-stop="14"]').focus();
  await page.keyboard.press('j');
  await expect(page.locator('.tail-row[data-stop="14"]')).toBeFocused();

  // H/X/M on a tail row: the one-action hint toast, nothing posts.
  await page.locator('.tail-row[data-stop="11"]').focus();
  for (const key of ['h', 'x', 'm']) {
    await page.keyboard.press(key);
    await expect(page.locator('#toast-slot .toast')).toContainText('Lower results take one action — “Should be near the top”.');
    expect(judgmentPosts(mock)).toHaveLength(0);
  }

  // E on a single-verse tail row opens the rescue preview with initial
  // focus on Cancel (the §3.12 exception class), no POST; Esc closes.
  await page.keyboard.press('e');
  await expect(page.locator('#rescue-dialog')).toBeVisible();
  await expect(page.locator('#rescue-cancel')).toBeFocused();
  expect(judgmentPosts(mock)).toHaveLength(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#rescue-dialog')).toHaveCount(0);
  expect(judgmentPosts(mock)).toHaveLength(0);

  // E on a range tail row (Psalm 46:1-3) opens pick-chip mode with the
  // run's first verse pre-selected and focused.
  await page.locator('.tail-row[data-stop="12"]').focus();
  await page.keyboard.press('e');
  await expect(page.locator('#rescue-dialog')).toBeVisible();
  const pressedChip = page.locator('#rescue-dialog .pick-chip[aria-pressed="true"]');
  await expect(pressedChip).toHaveCount(1);
  await expect(pressedChip).toBeFocused();
  await page.keyboard.press('Escape');

  // Space toggles the bulk checkbox on the focused top-block row; Esc
  // clears the bulk selection (the last Esc slot).
  await page.locator('.result-card[data-stop="3"]').focus();
  await page.keyboard.press(' ');
  await expect(page.locator('#bulk-bar')).toContainText('1 selected');
  await page.keyboard.press('Escape');
  await expect(page.locator('#bulk-bar')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('D34: the M gate — inert pre-search and on a reference view (hint toast, no form, no POST); live with discovery results; missing-form Enter gating and focus contract', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);

  // M before any search: inert, hint toast, no form, no POST.
  await page.locator('body').click();
  await page.keyboard.press('m');
  await expect(page.locator('#toast-slot .toast')).toContainText('Search words or phrases first — a suggestion attaches to the search that misses it.');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  expect(judgmentPosts(mock)).toHaveLength(0);
  expect(casePosts(mock)).toHaveLength(0);

  // M on a mocked reference-kind view: same inert branch.
  await submit(page, 'Psalm 46');
  await expect(page.locator('#center-body')).toContainText('nothing to judge here');
  await page.keyboard.press('m');
  await expect(page.locator('#toast-slot .toast')).toContainText('Search words or phrases first');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  expect(judgmentPosts(mock)).toHaveLength(0);

  // M with discovery results opens the form; focus lands on the reference
  // input (§3.12 layer focus contract).
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('m');
  await expect(page.locator('#missing-form-dialog')).toBeVisible();
  await expect(page.locator('#missing-ref-input')).toBeFocused();
  await expect(page.locator('#missing-form-dialog')).toHaveAttribute('aria-modal', 'true');

  // Enter with Submit disabled fires no POST; Enter with a resolved single
  // verse posts (same assertions as D20's, re-walked).
  await page.keyboard.press('Enter');
  expect(judgmentPosts(mock)).toHaveLength(0);
  await page.fill('#missing-ref-input', 'Lamentations 3:22');
  await expect(page.locator('#missing-submit')).toBeEnabled();
  await page.locator('#missing-ref-input').press('Enter');
  await expect(page.locator('.receipt-card')).toContainText('Your suggestion');
  expect(judgmentPosts(mock)).toHaveLength(1);

  // Re-open and close: focus returns to the opener.
  await page.locator('.result-card[data-stop="0"]').focus();
  await page.keyboard.press('m');
  await expect(page.locator('#missing-ref-input')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  expect(errors).toEqual([]);
});

test('D34: interview modality — Tab never leaves the dialog, J/K inert, Esc returns focus to the card; Esc order with two layers open', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  await page.keyboard.press('x');
  await expect(page.locator('#interview-dialog')).toBeVisible();
  // Tab pressed repeatedly never leaves the dialog.
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => {
      const active = document.activeElement;
      return active !== null && active.closest('#interview-dialog') !== null;
    });
    expect(inside, `Tab press ${i + 1} stays inside the interview`).toBe(true);
  }
  // J/K navigation is inert while the interview is open (§3.13.2).
  await page.keyboard.press('j');
  await expect(page.locator('#interview-dialog')).toBeVisible();
  // Esc closes without committing and returns focus to the card (§3.13.1).
  await page.keyboard.press('Escape');
  await expect(page.locator('#interview-dialog')).toHaveCount(0);
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  expect(judgmentPosts(mock)).toHaveLength(0);

  // Esc order with two layers open: the lookup over the missing form —
  // the topmost layer closes first, the form survives, then closes.
  await page.keyboard.press('m');
  await expect(page.locator('#missing-form-dialog')).toBeVisible();
  await page.keyboard.press('Control+k');
  await expect(page.locator('.lookup-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.lookup-dialog')).toHaveCount(0);
  await expect(page.locator('#missing-form-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#missing-form-dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('D34: A/B/T/W open the one-confirm layer (no POST until Confirm, initial focus on Cancel) — re-walked from D27', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({
    candidates: {
      reviews: [{
        reviewId: 'rev-1', label: 'Comparison 1', queryCount: 1, reviewedCount: 0,
        status: 'not-started', verdictCounts: {}, gateCounts: { blocking: 0, reviewRequired: 0, passing: 0, notApplicable: 0 },
      }],
      readOnly: false,
    },
    blind: { session: blindSessionMock(), startRequestIds: [], judgmentBodies: [] },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await page.click('.nav-item[data-nav="compare"]');
  await page.click('button:has-text("Start the blind review")');
  await expect(page.locator('.compare-lists')).toBeVisible();

  for (const [key, label] of [['a', 'A wins'], ['b', 'B wins'], ['t', 'Tie'], ['w', 'Both wrong']] as const) {
    await page.keyboard.press(key);
    await expect(page.locator('#compare-confirm-dialog')).toBeVisible();
    await expect(page.locator('#compare-confirm-title')).toHaveText(`You’re calling it: ${label}.`);
    await expect(page.locator('#compare-confirm-cancel')).toBeFocused();
    expect(mock.blind.judgmentBodies).toHaveLength(0);
    await page.keyboard.press('Escape');
    await expect(page.locator('#compare-confirm-dialog')).toHaveCount(0);
  }
  expect(mock.blind.judgmentBodies).toHaveLength(0);
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D35 — ARIA / role checks
// ---------------------------------------------------------------------------

test('D35: roles, labels, live region, disclosure attributes, dialog semantics, and the 36px row floor', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ cases: [caseMock('case-1', 'shelter', 'reviewing')] });
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  // The §3.11 results live region exists and receives its count text.
  const status = page.locator('#results-status');
  await expect(status).toHaveAttribute('role', 'status');
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await expect(status).toHaveText('14 results for “mercy”');

  // Toolbar + radiogroup roles; per-button labels name the focused ref.
  await expect(page.locator('#verdict-bar')).toHaveAttribute('role', 'toolbar');
  await expect(page.locator('#topn-picker')).toHaveAttribute('role', 'radiogroup');
  await expect(page.locator('.topn-seg').first()).toHaveAttribute('role', 'radio');
  await expect(page.locator('#verdict-essential')).toHaveAttribute('aria-label', 'Mark Psalm 85:10 essential');
  await expect(page.locator('#verdict-helpful')).toHaveAttribute('aria-label', 'Mark Psalm 85:10 helpful');
  await expect(page.locator('#verdict-notrel')).toHaveAttribute('aria-label', 'Mark Psalm 85:10 not relevant');

  // Rail tablist.
  await expect(page.locator('.rail-tabs')).toHaveAttribute('role', 'tablist');
  await expect(page.locator('.rail-tab').first()).toHaveAttribute('role', 'tab');

  // Toast aria-live=polite.
  await page.keyboard.press('e');
  await expect(page.locator('#toast-slot .toast')).toHaveAttribute('aria-live', 'polite');

  // The tail divider is a disclosure: aria-expanded + aria-controls.
  const divider = page.locator('#tail-divider');
  await expect(divider).toHaveAttribute('aria-expanded', 'false');
  await expect(divider).toHaveAttribute('aria-controls', 'tail-list');
  await divider.click();
  await expect(divider).toHaveAttribute('aria-expanded', 'true');

  // 36px minimum row height: queue rows and tail rows.
  const queueBox = await page.locator('.queue-row').first().boundingBox();
  expect(queueBox!.height).toBeGreaterThanOrEqual(36);
  const tailBox = await page.locator('.tail-row').first().boundingBox();
  expect(tailBox!.height).toBeGreaterThanOrEqual(36);

  // Every layer's dialog carries aria-modal + aria-labelledby → its title.
  const assertDialog = async (selector: string) => {
    const dialog = page.locator(selector);
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    const labelledBy = await dialog.getAttribute('aria-labelledby');
    expect(labelledBy, `${selector} names its title`).toBeTruthy();
    await expect(page.locator(`#${labelledBy}`)).toHaveCount(1);
  };
  await page.locator('.result-card[data-stop="1"]').focus();
  await page.keyboard.press('m');
  await assertDialog('#missing-form-dialog');
  await page.keyboard.press('Escape');
  await page.keyboard.press('x');
  await assertDialog('#interview-dialog');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+k');
  await assertDialog('.lookup-dialog');
  await page.keyboard.press('Escape');
  await page.keyboard.press('?');
  await assertDialog('#sheet-dialog');
  await page.keyboard.press('Escape');
  expect(errors).toEqual([]);
});

test('D35: the read-only banner carries role=status over the missing wash', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  mock.degraded.value = true;
  await installRoutes(page, mock);
  await page.goto(origin);
  const banner = page.locator('#banner-slot .banner');
  await expect(banner).toBeVisible();
  await expect(banner).toHaveAttribute('role', 'status');
  await expect(banner).toContainText('Read-only right now.');
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D36 — motion
// ---------------------------------------------------------------------------

test('D36: only the toast animates (200ms, the exact bezier); reduced motion kills everything', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('e');
  await expect(page.locator('#toast-slot .toast')).toBeVisible();

  // Without reduced motion: the toast rises 200ms on the exact bezier, and
  // nothing else animates or transitions.
  const toastMotion = await page.evaluate(() => {
    const toast = document.querySelector('#toast-slot .toast')!;
    const style = getComputedStyle(toast);
    return { duration: style.animationDuration, easing: style.animationTimingFunction };
  });
  expect(toastMotion.duration).toBe('0.2s');
  expect(toastMotion.easing).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
  const otherMotion = await page.evaluate(() => {
    const offenders: string[] = [];
    for (const element of document.querySelectorAll('*')) {
      if (element.closest('#toast-slot') !== null) continue;
      const style = getComputedStyle(element);
      if ((style.animationName !== 'none' && style.animationDuration !== '0s')
        || style.transitionDuration.split(',').some((duration) => duration.trim() !== '0s')) {
        offenders.push(element.tagName + '.' + element.className);
      }
    }
    return offenders;
  });
  expect(otherMotion).toEqual([]);

  // With prefers-reduced-motion: computed animation durations are inert
  // everywhere — the toast included.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.press('h');
  await expect(page.locator('#toast-slot .toast')).toBeVisible();
  const reduced = await page.evaluate(() => {
    const offenders: string[] = [];
    for (const element of document.querySelectorAll('*')) {
      const style = getComputedStyle(element);
      if (style.animationName !== 'none'
        || style.transitionDuration.split(',').some((duration) => duration.trim() !== '0s')) {
        offenders.push(element.tagName + '.' + element.className);
      }
    }
    return offenders;
  });
  expect(reduced).toEqual([]);
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D37 — responsive floor
// ---------------------------------------------------------------------------

test('D37: usable at 1024×768 — no horizontal scroll; the Essential button and the search input are operable', async ({ page }) => {
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 1024, height: 768 });
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  // The verse measure rule holds (≤68ch).
  expect(await page.content()).toContain('max-width:68ch');

  for (const selector of ['#verdict-essential', '#search-input'] as const) {
    const box = await page.locator(selector).boundingBox();
    expect(box, `${selector} has a box`).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(1024);
    expect(box!.y + box!.height).toBeLessThanOrEqual(768);
    await page.locator(selector).click();
    expect(await page.evaluate(() => document.scrollingElement!.scrollLeft)).toBe(0);
  }
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D38 — build-change notice + re-search links
// ---------------------------------------------------------------------------

const JARGON_PATTERNS = [/[0-9a-f]{8}-/, /sha256/i];

test('D38: version-change branch — verbatim copy, judged-query links, reload-without-dismiss persistence, dismiss suppresses', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({
    cases: [
      caseMock('case-1', 'mercy', 'reviewing', '2026-08-23T10:00:00.000Z'),
      caseMock('case-2', 'shelter', 'reviewing', '2026-08-22T10:00:00.000Z'),
    ],
  });
  await installRoutes(page, mock);
  // Seed an older seen trio (fingerprints matching the mock identity, so
  // only the version differs) and mock the new version. The init script runs
  // on every navigation, so it seeds only a virgin store — the app's own
  // writes (lastQuery merges, the dismiss) must survive reloads.
  await page.addInitScript(() => {
    if (localStorage.getItem('study.ui.v1') !== null) return;
    localStorage.setItem('study.ui.v1', JSON.stringify({
      lastSeenMeta: {
        engineVersion: '0.3.0',
        corpusFingerprint: 'a'.repeat(64),
        layerFingerprint: 'b'.repeat(64),
      },
    }));
  });
  await page.route('**/api/meta', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        engineVersion: '0.4.0',
        corpusFingerprint: 'a'.repeat(64),
        layerFingerprint: 'b'.repeat(64),
        schemaVersion: 'test', translations: [],
      }),
    });
  });
  await page.goto(origin);

  const notice = page.locator('#update-notice');
  await expect(notice).toHaveCount(1);
  await expect(notice).toContainText('The engine was updated since your last visit (0.3.0 → 0.4.0). Searches you reviewed may rank differently now.');
  const noticeText = await notice.innerText();
  for (const pattern of JARGON_PATTERNS) {
    expect(pattern.test(noticeText), `jargon ${pattern} absent from the notice`).toBe(false);
  }
  await expect(notice).toContainText('See how your reviewed searches rank now');
  await expect(notice.locator('.update-link')).toHaveCount(2);

  // Clicking a link submits that query.
  await notice.locator('.update-link', { hasText: 'shelter' }).click();
  await expect(page.locator('#search-input')).toHaveValue('shelter');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  // Reloading WITHOUT dismissing shows the card again — the trio is stored
  // only when the card is dismissed.
  await page.reload();
  await expect(page.locator('#update-notice')).toHaveCount(1);

  // Only dismiss + reload suppresses it.
  await page.click('#notice-dismiss');
  await expect(page.locator('#update-notice')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#search-input')).toBeVisible();
  await expect(page.locator('#update-notice')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('D38: fingerprint-only branch — the no-codes sentence, zero jargon matches', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock({ cases: [caseMock('case-1', 'mercy', 'reviewing')] });
  await installRoutes(page, mock);
  await page.addInitScript(() => {
    if (localStorage.getItem('study.ui.v1') !== null) return;
    localStorage.setItem('study.ui.v1', JSON.stringify({
      lastSeenMeta: {
        engineVersion: '0.9.0',
        corpusFingerprint: 'c'.repeat(64),
        layerFingerprint: 'b'.repeat(64),
      },
    }));
  });
  await page.goto(origin);

  const notice = page.locator('#update-notice');
  await expect(notice).toHaveCount(1);
  await expect(notice).toContainText('The engine’s data was updated since your last visit. Searches you reviewed may rank differently now.');
  const noticeText = await notice.innerText();
  expect(noticeText).not.toContain('0.9.0');
  for (const pattern of JARGON_PATTERNS) {
    expect(pattern.test(noticeText), `jargon ${pattern} absent from the notice`).toBe(false);
  }
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D39 — error-state hardening: the ENDPOINT_FAILURES loop
// ---------------------------------------------------------------------------

function blindSessionMock(): Record<string, unknown> {
  const reasonsA = [{ family: 'token_overlap', label: 'Contains "mercy"', points: 431, uncappedPoints: 431, capped: false, provenance: { label: 'Scripture text' } }];
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
        b: [],
      },
      movement: { onlyA: [], onlyB: [], rankMoved: [], reasonChanged: [], provenanceChanged: [], scoreChanged: [], capChanged: [] },
      missingPassages: [],
      judgment: null,
    }],
    gateGroups: { blocking: [], 'review-required': [], passing: [], 'not-applicable': [] },
    admission: { enabled: false, blockers: [] },
  };
}

const candidatesOne = () => ({
  reviews: [{
    reviewId: 'rev-1', label: 'Comparison 1', queryCount: 1, reviewedCount: 0,
    status: 'not-started', verdictCounts: {}, gateCounts: { blocking: 0, reviewRequired: 0, passing: 0, notApplicable: 0 },
  }],
  readOnly: false,
});

/** Register a 500 for one path (optionally one method); others fall through. */
async function fail(page: Page, glob: string, method?: string): Promise<void> {
  await page.route(glob, async (route) => {
    if (method !== undefined && route.request().method() !== method) {
      await route.fallback();
      return;
    }
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false, error: { code: 'internal_error', message: 'boom' } }) });
  });
}

const expectToast = async (page: Page, text: string) => {
  await expect(page.locator('#toast-slot .toast')).toContainText(text);
};

// One driver per api-layer function: mocks the entry's failure, drives the
// UI to the fetch site, and asserts the mapped §3.11 copy renders.
const FAILURE_DRIVERS: Record<string, (page: Page) => Promise<void>> = {
  apiMeta: async (page) => {
    await installRoutes(page, makeMock());
    await fail(page, '**/api/meta');
    await page.goto(origin);
    await expectToast(page, FALLBACK_LOAD);
  },
  apiConcepts: async (page) => {
    await installRoutes(page, makeMock());
    await fail(page, '**/api/concepts');
    await page.goto(origin);
    await expectToast(page, FALLBACK_LOAD);
  },
  apiHealth: async (page) => {
    await installRoutes(page, makeMock());
    await fail(page, '**/api/v2/health');
    await page.goto(origin);
    await expectToast(page, FALLBACK_LOAD);
  },
  apiCases: async (page) => {
    await installRoutes(page, makeMock());
    await fail(page, '**/api/v2/cases', 'GET');
    await page.goto(origin);
    await expectToast(page, FALLBACK_LOAD);
  },
  apiSearch: async (page) => {
    await installRoutes(page, makeMock());
    await fail(page, '**/api/search**');
    await page.goto(origin);
    await submit(page, 'mercy');
    await expect(page.locator('.error-box')).toContainText(SEARCH_ERROR);
    await expect(page.locator('.error-box button', { hasText: 'Retry' })).toBeVisible();
  },
  apiPassage: async (page) => {
    // Both call sites (§3.11): the focused card keeps its excerpt rendering
    // with no error state; the rescue preview shows the retry sentence with
    // Confirm disabled.
    await installRoutes(page, makeMock());
    await fail(page, '**/api/passage**');
    await page.goto(origin);
    await submit(page, 'mercy');
    await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
    await expect(page.locator('.result-card.expanded .verse-body')).toContainText('mercy, and truth are met together');
    await expect(page.locator('.result-card.expanded .error-box')).toHaveCount(0);
    await expect(page.locator('#toast-slot .toast')).toHaveCount(0);
    // Rescue-preview site:
    await page.click('#tail-divider');
    await page.locator('.tail-row[data-stop="11"]').click();
    await page.keyboard.press('e');
    await expect(page.locator('#rescue-dialog')).toContainText(SEARCH_ERROR);
    await expect(page.locator('#rescue-confirm')).toBeDisabled();
    await expect(page.locator('#rescue-retry')).toBeVisible();
  },
  apiContext: async (page) => {
    await installRoutes(page, makeMock());
    await fail(page, '**/api/v2/context**');
    await page.goto(origin);
    await submit(page, 'mercy');
    await page.locator('.rail-tab', { hasText: 'Context' }).click();
    await expect(page.locator('#why-rail')).toContainText(FALLBACK_LOAD);
  },
  apiCaseCreate: async (page) => {
    await installRoutes(page, makeMock());
    await fail(page, '**/api/v2/cases', 'POST');
    await page.goto(origin);
    await submit(page, 'mercy');
    await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
    await page.keyboard.press('e');
    await expectToast(page, FALLBACK_POST);
  },
  apiCase: async (page) => {
    await installRoutes(page, makeMock({ cases: [caseMock('case-1', 'mercy', 'reviewing')] }));
    await fail(page, '**/api/v2/cases/case-1');
    await page.goto(origin);
    await expectToast(page, FALLBACK_LOAD);
  },
  apiCaseState: async (page) => {
    // Bookkeeping: a failed state POST shows nothing — the verdict's own
    // receipt renders and no failure toast joins it.
    await installRoutes(page, makeMock());
    await fail(page, '**/api/v2/cases/*/state');
    await page.goto(origin);
    await submit(page, 'mercy');
    await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
    await page.keyboard.press('e');
    await expectToast(page, 'Marked Psalm 85:10 Essential (top 3)');
    await expect(page.locator('#toast-slot .toast')).not.toContainText(FALLBACK_POST);
  },
  apiJudgments: async (page) => {
    await installRoutes(page, makeMock({ cases: [caseMock('case-1', 'mercy', 'reviewing')] }));
    await fail(page, '**/api/v2/judgments**', 'GET');
    await page.goto(origin);
    await expectToast(page, FALLBACK_LOAD);
  },
  apiJudgmentSubmit: async (page) => {
    await installRoutes(page, makeMock());
    await fail(page, '**/api/v2/judgments', 'POST');
    await page.goto(origin);
    await submit(page, 'mercy');
    await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
    await page.keyboard.press('e');
    await expectToast(page, FALLBACK_POST);
  },
  apiInbox: async (page) => {
    await installRoutes(page, makeMock({ inboxFails: true }));
    await page.goto(origin);
    const section = page.locator('.queue-section-title', { hasText: 'Worth a look next' });
    await expect(section).toHaveCount(1);
    await expect(page.locator('#queue-body')).toContainText(FALLBACK_LOAD);
  },
  apiCandidates: async (page) => {
    await installRoutes(page, makeMock());
    await fail(page, '**/api/v2/candidates');
    await page.goto(origin);
    await page.click('.nav-item[data-nav="compare"]');
    await expect(page.locator('#screen-compare')).toContainText(FALLBACK_LOAD);
  },
  apiBlindSessionStart: async (page) => {
    await installRoutes(page, makeMock({ candidates: candidatesOne() }));
    await fail(page, '**/blind-sessions', 'POST');
    await page.goto(origin);
    await page.click('.nav-item[data-nav="compare"]');
    await page.click('button:has-text("Start the blind review")');
    await expect(page.locator('#screen-compare')).toContainText(FALLBACK_LOAD);
  },
  apiBlindPassage: async (page) => {
    await installRoutes(page, makeMock({
      candidates: candidatesOne(),
      blind: { session: blindSessionMock(), startRequestIds: [], judgmentBodies: [] },
    }));
    await fail(page, '**/passages**');
    await page.goto(origin);
    await page.click('.nav-item[data-nav="compare"]');
    await page.click('button:has-text("Start the blind review")');
    await page.locator('.compare-row', { hasText: 'Psalm 85:10' }).click();
    await expect(page.locator('#compare-panel')).toContainText(FALLBACK_LOAD);
  },
  apiBlindJudgment: async (page) => {
    await installRoutes(page, makeMock({
      candidates: candidatesOne(),
      blind: { session: blindSessionMock(), startRequestIds: [], judgmentBodies: [] },
    }));
    await fail(page, '**/blind-sessions/*/judgments', 'POST');
    await page.goto(origin);
    await page.click('.nav-item[data-nav="compare"]');
    await page.click('button:has-text("Start the blind review")');
    await expect(page.locator('.compare-lists')).toBeVisible();
    await page.keyboard.press('a');
    await page.click('#compare-confirm-commit');
    await expectToast(page, FALLBACK_POST);
  },
  apiCompilePreview: async (page) => {
    await installRoutes(page, makeMock());
    await fail(page, '**/api/v2/compile/preview');
    await page.goto(origin);
    await page.click('.nav-item[data-nav="finish"]');
    await expect(page.locator('#screen-finish')).toContainText(FALLBACK_LOAD);
  },
  apiCompileApply: async (page) => {
    const fixtureText = JSON.stringify({
      id: 'workbench-mercy', generatedBy: 'workbench', status: 'pending', query: 'mercy',
      expectedTop: [{ ref: 'Psalm 85:10', withinTop: 3 }], mustNotRank: [],
    });
    const plan = {
      schemaVersion: 1, inputs: [],
      operations: [{ path: 'eval/golden/mercy.json', beforeSha256: null, afterText: fixtureText }],
      fixturesWritten: [{ path: 'eval/golden/mercy.json', fixture: JSON.parse(fixtureText) }],
      fixturesRemoved: [], proposedSelections: [], checklist: [], warnings: [], report: '',
      digest: 'abc123def456' + '0'.repeat(52),
    };
    await installRoutes(page, makeMock({ compilePlans: [plan] }));
    await fail(page, '**/api/v2/compile/apply');
    await page.goto(origin);
    await page.click('.nav-item[data-nav="finish"]');
    await page.fill('#sign-input', 'abc123def456');
    await expect(page.locator('#sign-write')).toBeEnabled();
    await page.click('#sign-write');
    await expectToast(page, FALLBACK_POST);
  },
};

for (const [name, entry] of Object.entries(ENDPOINT_FAILURES)) {
  test(`D39 ${name}: ${entry.mockedFailure}`, async ({ page }) => {
    const errors = collectErrors(page);
    const driver = FAILURE_DRIVERS[name];
    expect(driver, `a D39 driver exists for ${name}`).toBeDefined();
    // The apiPassage entry names both call-site behaviors; the driver
    // exercises each. Every other entry maps one §3.11 string.
    if (name === 'apiPassage') {
      expect(typeof entry.expectedCopyOrToast).toBe('object');
      const both = entry.expectedCopyOrToast as { focusedCard: string; rescuePreview: string };
      expect(both.focusedCard).toBe(NOTHING_RENDERS);
      expect(both.rescuePreview).toBe(SEARCH_ERROR);
    } else {
      expect(typeof entry.expectedCopyOrToast).toBe('string');
    }
    await driver!(page);
    // Zero pageerrors / unhandled rejections on every branch.
    expect(errors).toEqual([]);
  });
}

test('D39: a /fonts/** failure renders nothing — the fallback stacks carry the page', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock); // installRoutes 404s /fonts/** already
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await expect(page.locator('#toast-slot .toast')).toHaveCount(0);
  await expect(page.locator('.error-box')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('D39: the validation_failed and artifact_unavailable toasts', async ({ page }) => {
  const errors = collectErrors(page);
  let mode: 'validation' | 'artifact' = 'validation';
  const mock = makeMock({
    judgmentResponder: () => mode === 'validation'
      ? { status: 400, payload: { ok: false, error: { code: 'validation_failed', message: 'A field was wrong.' } } }
      : { status: 503, payload: { ok: false, error: { code: 'artifact_unavailable', message: 'No artifact.' } } },
  });
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  await page.keyboard.press('e');
  await expectToast(page, VALIDATION_TOAST);

  mode = 'artifact';
  await page.locator('.result-card[data-stop="1"]').click();
  await page.keyboard.press('e');
  await expectToast(page, READ_ONLY_TOAST);
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// D41 — flip smoke: the preserved old console at static/advanced.html
// ---------------------------------------------------------------------------

test('D41: the old console (static/advanced.html) renders its 11 tabs and still fetches /api/... under mocks', async ({ page }) => {
  const errors = collectErrors(page);
  // Serve the moved file exactly as the old-console specs serve it.
  const { readFile } = await import('node:fs/promises');
  const http = await import('node:http');
  const consolePage = await readFile(new URL('../static/advanced.html', import.meta.url));
  const consoleServer = http.createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(consolePage);
  });
  await new Promise<void>((resolve, reject) => {
    consoleServer.once('error', reject);
    consoleServer.listen(0, '127.0.0.1', resolve);
  });
  const address = consoleServer.address();
  if (typeof address !== 'object' || address === null) throw new Error('Console fixture server did not bind.');
  const consoleOrigin = `http://127.0.0.1:${address.port}`;
  try {
    const apiPaths: string[] = [];
    const ok = (data: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data }) });
    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url());
      apiPaths.push(url.pathname);
      if (url.pathname === '/api/v2/health') {
        await route.fulfill(ok({
          status: 'healthy',
          descriptor: { alignment: 'aligned', identity: { engineVersion: '0.9.0', corpusFingerprint: 'a'.repeat(64), layerFingerprint: 'b'.repeat(64) }, stale: null },
          artifact: { identity: { engineVersion: '0.9.0', corpusFingerprint: 'a'.repeat(64), layerFingerprint: 'b'.repeat(64) }, matchesDescriptor: true },
          golden: { active: 1, total: 1, pending: 0, generated: 0, generatedBy: {} },
          coverage: { active: 1, total: 1, pending: 0, uncovered: 0, stale: 0 },
          judgments: { effective: 0, total: 0, stale: 0 },
          gauntlet: { status: 'healthy', verdict: 'ADMIT', summary: 'All gates pass.', reason: null, reportPath: 'eval/.runs/gauntlet-report.json' },
          git: { branch: 'main', state: 'main', dirty: false, aheadBy: 0, behindBy: 0 },
          startup: { degraded: false, diagnostics: [], issues: [] }, signals: [],
        }));
        return;
      }
      if (url.pathname === '/api/v2/cases') { await route.fulfill(ok({ cases: [] })); return; }
      if (url.pathname === '/api/v2/inbox') { await route.fulfill(ok({ items: [] })); return; }
      if (url.pathname === '/api/v2/candidates') { await route.fulfill(ok({ reviews: [], readOnly: false })); return; }
      if (url.pathname === '/api/concepts') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        return;
      }
      await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ ok: false, error: { code: 'not_found', message: url.pathname } }) });
    });
    await page.goto(`${consoleOrigin}/?view=health`);
    // The 11 tabs render.
    await expect(page.getByRole('tab')).toHaveCount(11);
    for (const label of ['Health', 'Inbox', 'Review', 'History', 'Candidate', 'Admission', 'Changes', 'Publish', 'Sessions', 'Quality', 'Audits']) {
      await expect(page.getByRole('tab', { name: label })).toBeVisible();
    }
    // Its fetches still hit same-origin absolute /api/... paths.
    await expect(page.getByText('All gates pass.')).toBeVisible();
    expect(apiPaths).toContain('/api/v2/health');
  } finally {
    await new Promise<void>((resolve, reject) => consoleServer.close((error) => error ? reject(error) : resolve()));
  }
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------
// Covenant regression (every phase spec): order fidelity + no-score scrub
// ---------------------------------------------------------------------------

test('P5 covenant: DOM order equals engine order after votes; score numerals never render', async ({ page }) => {
  const errors = collectErrors(page);
  const mock = makeMock();
  await installRoutes(page, mock);
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  const refsBefore = await page.locator('#results-list .result-card .card-ref, #results-list .result-card .verse-ref').allInnerTexts();
  await page.keyboard.press('e');
  await expect(page.locator('.judged-chip')).toHaveCount(1);
  await page.keyboard.press('h');
  await expect(page.locator('.judged-chip')).toHaveCount(2);
  await page.keyboard.press('h');
  await expect(page.locator('.judged-chip')).toHaveCount(3);
  const refsAfter = await page.locator('#results-list .result-card .card-ref, #results-list .result-card .verse-ref').allInnerTexts();
  expect(refsAfter).toEqual(refsBefore);
  await expect(page.locator('#results-list .result-card')).toHaveCount(10);

  const text = await page.locator('body').innerText();
  expect(text).not.toContain('987.65');
  expect(text).not.toContain('431');
  expect(errors).toEqual([]);
});

void sha256;
