import http from 'node:http';
import { readFile } from 'node:fs/promises';

import { expect, test, type Page } from '@playwright/test';

// P1 demo spec (plan D9): drives static/study.html end-to-end over mocked
// /api/** + /fonts/** routes, covering D5 (shell/theme/boot), D6 (real
// search + read-only results), D7 (quick lookup), D8 (loading/error states).

const identity = {
  engineVersion: '0.9.0',
  corpusFingerprint: 'a'.repeat(64),
  layerFingerprint: 'b'.repeat(64),
};

let server: http.Server;
let origin: string;

test.beforeAll(async () => {
  const page = await readFile(new URL('../static/study.html', import.meta.url));
  server = http.createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(page);
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (typeof address !== 'object' || address === null) throw new Error('Browser fixture server did not bind.');
  origin = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    // Deliberately-failed mock routes (a 500 passage fetch, 404 fonts) emit
    // Chromium's "Failed to load resource" network line; the page handles
    // those failures by spec. Everything else is a real error.
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      errors.push(message.text());
    }
  });
  return errors;
}

interface MockReason {
  readonly family: string;
  readonly label: string;
  readonly points: number;
  readonly provenance?: { readonly sourceId: string; readonly label: string; readonly locator: string; readonly weight: number };
}
interface MockResult {
  readonly targetId: string;
  readonly reference: string;
  readonly excerpt: string;
  readonly score: number;
  readonly reasons: readonly MockReason[];
}

function result(reference: string, excerpt: string, reasons: readonly MockReason[]): MockResult {
  return { targetId: `KJV:${reference}`, reference, excerpt, score: 987.65, reasons };
}

const filler = (n: number): MockResult => result(
  `Filler ${n}:${n}`,
  `Filler verse text number ${n} with quiet words.`,
  [{ family: 'proximity', label: 'Words near each other', points: 431 }],
);

// 14 results: top block of 10 + tail of 4.
const mercyResults: MockResult[] = [
  result('Psalm 85:10', 'mercy, and truth are met together; righteousness and peace have kissed each other.', [
    { family: 'token_overlap', label: 'Contains "mercy and truth"', points: 431 },
  ]),
  result('Psalm 23:1-4', 'The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures.', [
    { family: 'concept_anchor', label: 'Theme: shepherd care', points: 431, provenance: { sourceId: 'ontology-source', label: 'Ontology', locator: 'concepts/shepherd', weight: 1 } },
  ]),
  result('Micah 7:18', 'Who is a God like unto thee, that pardoneth iniquity.', [
    { family: 'cross_reference', label: 'Cross-referenced with Psalm 103', points: 431 },
  ]),
  filler(4), filler(5), filler(6), filler(7), filler(8), filler(9), filler(10),
  result('Hosea 6:6', 'For I desired mercy, and not sacrifice.', [{ family: 'token_overlap', label: 'Contains "desired mercy"', points: 431 }]),
  filler(12), filler(13), filler(14),
];

const passages: Record<string, { verses: { verse: number; text: string }[] }> = {
  'Psalm 85:10': { verses: [{ verse: 10, text: 'mercy, and truth are met together; righteousness and peace have kissed each other.' }] },
  'Psalm 23:1-4': {
    verses: [
      { verse: 1, text: 'The LORD is my shepherd; I shall not want.' },
      { verse: 2, text: 'He maketh me to lie down in green pastures.' },
      { verse: 3, text: 'He restoreth my soul.' },
      { verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil.' },
    ],
  },
  'Micah 7:18': { verses: [{ verse: 18, text: 'Who is a God like unto thee, that pardoneth iniquity.' }] },
  '1 John 4:7': { verses: [{ verse: 7, text: 'Beloved, let us love one another: for love is of God; and every one that loveth is born of God' }] },
};

interface RouteOptions {
  readonly cases?: unknown[];
  readonly degraded?: boolean;
  readonly searchDelayMs?: Record<string, number>;
  readonly searchFailures?: Set<string>;
  readonly failPassages?: boolean;
  readonly log?: string[];
}

async function installRoutes(page: Page, options: RouteOptions = {}): Promise<void> {
  const ok = (data: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data }) });
  const plain = (data: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  await page.route('**/fonts/**', async (route) => { await route.fulfill({ status: 404, body: '' }); });
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    options.log?.push(url.pathname + url.search);
    if (url.pathname === '/api/v2/health') {
      await route.fulfill(ok({
        status: options.degraded ? 'unavailable' : 'healthy',
        startup: { degraded: options.degraded === true, diagnostics: [], issues: [] },
      }));
      return;
    }
    if (url.pathname === '/api/meta') {
      await route.fulfill(plain({ ...identity, schemaVersion: 'test', translations: [] }));
      return;
    }
    if (url.pathname === '/api/concepts') {
      await route.fulfill(plain([{ id: 'shepherd-care', label: 'shepherd care' }]));
      return;
    }
    if (url.pathname === '/api/v2/cases') {
      await route.fulfill(ok({ cases: options.cases ?? [] }));
      return;
    }
    if (url.pathname === '/api/search') {
      const q = url.searchParams.get('q') ?? '';
      const delay = options.searchDelayMs?.[q];
      if (delay !== undefined) await new Promise((resolve) => setTimeout(resolve, delay));
      if (options.searchFailures?.has(q)) {
        options.searchFailures.delete(q);
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'boom' }) });
        return;
      }
      if (q === 'mercy' || q === 'slow mercy') {
        await route.fulfill(plain({ kind: 'discovery', query: q, results: mercyResults, ...identity }));
        return;
      }
      if (q === 'love') {
        await route.fulfill(plain({
          kind: 'discovery', query: q, ...identity,
          results: [result('1 John 4:7', 'Beloved, let us love one another: for love is of God; and every one that loveth is born of God', [
            { family: 'exact_phrase', label: 'Exact phrase', points: 431 },
          ])],
        }));
        return;
      }
      if (q === 'seven') {
        await route.fulfill(plain({ kind: 'discovery', query: q, results: mercyResults.slice(0, 7), ...identity }));
        return;
      }
      if (q === 'Psalm 46') {
        await route.fulfill(plain({
          kind: 'reference', query: q, ...identity,
          passage: { reference: 'Psalm 46', verses: [{ verse: 1, text: 'God is our refuge and strength, a very present help in trouble.' }] },
        }));
        return;
      }
      if (q === 'Hesekiah 99:99') {
        await route.fulfill(plain({ kind: 'invalid-reference', query: q, ...identity }));
        return;
      }
      // Anything else: an empty discovery.
      await route.fulfill(plain({ kind: 'discovery', query: q, results: [], ...identity }));
      return;
    }
    if (url.pathname === '/api/passage') {
      if (options.failPassages === true) {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'unavailable' }) });
        return;
      }
      const ref = url.searchParams.get('ref') ?? '';
      const passage = passages[ref];
      if (passage === undefined) {
        await route.fulfill(plain({ kind: 'invalid-reference', query: ref, ...identity }));
        return;
      }
      await route.fulfill(plain({ kind: 'passage', passage: { reference: ref, ...passage }, ...identity }));
      return;
    }
    if (url.pathname === '/api/v2/context') {
      const ref = url.searchParams.get('ref') ?? '';
      await route.fulfill(ok({
        requestedReference: ref,
        context: {
          kind: 'passage',
          passage: {
            reference: ref,
            verses: [
              { verse: 4, text: 'Context before the verse.' },
              { verse: 5, text: 'More context before.' },
              { verse: 6, text: 'For I desired mercy, and not sacrifice.' },
              { verse: 7, text: 'Context after the verse.' },
              { verse: 8, text: 'More context after.' },
            ],
          },
        },
      }));
      return;
    }
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'unmocked' }) });
  });
}

async function submit(page: Page, query: string): Promise<void> {
  await page.fill('#search-input', query);
  await page.press('#search-input', 'Enter');
}

test('D5: boot state, theme cycling, FOUC guard, and auto listener', async ({ page }) => {
  const errors = collectErrors(page);
  const log: string[] = [];
  await installRoutes(page, { log });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(origin);

  // Boot state: search bar + effect-timing contract only; no /api/search.
  await expect(page.locator('#search-input')).toBeVisible();
  await expect(page.locator('#center-body')).toContainText('Your calls are saved the moment you make them.');
  await expect(page.locator('.result-card')).toHaveCount(0);
  await page.waitForTimeout(300);
  expect(log.filter((entry) => entry.startsWith('/api/search'))).toHaveLength(0);

  // Theme cycles auto → light → dark → auto on data-theme, persisted.
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#theme-cycle')).toHaveText('◐ Auto');
  await page.click('#theme-cycle');
  await expect(page.locator('#theme-cycle')).toHaveText('☀ Light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.click('#theme-cycle');
  await expect(page.locator('#theme-cycle')).toHaveText('☾ Dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  // Dark paints html/body background from tokens (document level).
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bodyBg).toBe('rgb(19, 19, 17)');

  // Persists across reload.
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#theme-cycle')).toHaveText('☾ Dark');

  // Back to Auto; a prefers-color-scheme flip updates data-theme, no reload.
  await page.click('#theme-cycle');
  await expect(page.locator('#theme-cycle')).toHaveText('◐ Auto');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  expect(errors).toEqual([]);
});

test('D5: seeded dark theme is stamped before DOMContentLoaded; lastQuery pre-fills without fetching', async ({ page }) => {
  const errors = collectErrors(page);
  const log: string[] = [];
  await installRoutes(page, { log });
  await page.addInitScript(() => {
    localStorage.setItem('study.theme', 'dark');
    localStorage.setItem('study.ui.v1', JSON.stringify({ lastQuery: 'mercy' }));
    document.addEventListener('DOMContentLoaded', () => {
      (window as unknown as { __themeAtDcl?: string }).__themeAtDcl = document.documentElement.dataset.theme ?? '';
    });
  });
  await page.goto(origin);
  const themeAtDcl = await page.evaluate(() => (window as unknown as { __themeAtDcl?: string }).__themeAtDcl);
  expect(themeAtDcl).toBe('dark');

  // lastQuery pre-fills the input VALUE only — no auto-submit, no fetch.
  await expect(page.locator('#search-input')).toHaveValue('mercy');
  await page.waitForTimeout(300);
  expect(log.filter((entry) => entry.startsWith('/api/search'))).toHaveLength(0);
  expect(errors).toEqual([]);
});

test('D6: results render in engine order with focus handoff, J/K boundaries, tail, rail, and highlights', async ({ page }) => {
  const errors = collectErrors(page);
  const log: string[] = [];
  await installRoutes(page, { log });
  await page.goto(origin);
  await submit(page, 'mercy');

  // Cards render in exact mock order; tail collapsed behind the divider.
  const cards = page.locator('.result-card');
  await expect(cards).toHaveCount(10);
  for (let i = 0; i < 10; i += 1) {
    await expect(cards.nth(i)).toContainText(mercyResults[i]!.reference);
  }

  // Post-search handoff: DOM focus is card #1; J moves to card #2 without
  // typing into the search input.
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('j');
  await expect(page.locator('.result-card[data-stop="1"]')).toBeFocused();
  await expect(page.locator('#search-input')).toHaveValue('mercy');

  // Exactly one expanded card after pressing J twice (now on card #3).
  await page.keyboard.press('j');
  await expect(page.locator('.result-card.expanded')).toHaveCount(1);
  await expect(page.locator('.result-card.expanded')).toContainText('Micah 7:18');
  // Unfocused cards render reference + single-line excerpt.
  await expect(page.locator('.result-card[data-stop="0"] .card-excerpt')).toBeVisible();

  // The focused card fetched its verse body and shows sup verse numbers.
  await expect(page.locator('.result-card.expanded .verse-body sup')).toHaveCount(1);
  await expect(page.locator('.result-card.expanded')).toContainText('Result 3 of 14 for “mercy”');
  await expect(page.locator('.result-card.expanded .attribution')).toHaveText('King James Version');
  expect(log.some((entry) => entry.startsWith('/api/passage?ref=' + encodeURIComponent('Micah 7:18')))).toBe(true);

  // Pills: concept_anchor / token_overlap / cross_reference.
  await expect(page.locator('.result-card.expanded .reason-pill')).toHaveText('Close in meaning');
  await page.keyboard.press('k');
  await expect(page.locator('.result-card.expanded .reason-pill')).toHaveText('Matched the meaning');
  // Range card Psalm 23:1-4 renders one sup per member verse.
  await expect(page.locator('.result-card.expanded .verse-body sup')).toHaveCount(4);
  // Why rail: Named by + Matched "—" for the anchor result.
  await expect(page.locator('#why-rail')).toContainText('shepherd care');
  await expect(page.locator('#why-rail')).toContainText('—');
  await page.keyboard.press('k');
  await expect(page.locator('.result-card.expanded .reason-pill')).toHaveText('Shares key words');
  // Matched row shows the quoted fragment.
  await expect(page.locator('#why-rail')).toContainText('“mercy and truth”');

  // Punctuation-tolerant highlight: exactly one mark spanning "mercy, and truth".
  const marks = page.locator('.result-card.expanded .verse-body mark');
  await expect(marks).toHaveCount(1);
  await expect(marks.first()).toHaveText('mercy, and truth');

  // K on card #1 does nothing (no wrap).
  await page.keyboard.press('k');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  // No score/points numerals anywhere in the rendered text.
  const bodyText = await page.evaluate(() => document.body.textContent ?? '');
  expect(bodyText).not.toContain('987.65');
  expect(bodyText).not.toContain('431');

  // Tail: divider copy, J boundary, Enter expands, Context tab fronting.
  await expect(page.locator('#tail-divider')).toHaveText('Lower results (4) — most people never scroll this far. Skim them only to rescue anything that deserves the top.');
  await expect(page.locator('#tail-divider')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#tail-divider')).toHaveAttribute('aria-controls', 'tail-list');
  for (let i = 0; i < 9; i += 1) await page.keyboard.press('j');
  await expect(page.locator('.result-card[data-stop="9"]')).toBeFocused();
  await page.keyboard.press('j');
  await expect(page.locator('#tail-divider')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#tail-divider')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#tail-divider')).toBeFocused();
  await page.keyboard.press('j');
  await expect(page.locator('.tail-row[data-stop="11"]')).toBeFocused();
  await expect(page.locator('.tail-row[data-stop="11"]')).toContainText('Hosea 6:6');
  // Read-before-rescue binding: the rail fronts Context with the row's verse.
  expect(log.some((entry) => entry.startsWith('/api/v2/context?ref=' + encodeURIComponent('Hosea 6:6')))).toBe(true);
  await expect(page.locator('.rail-tab[aria-selected="true"]')).toHaveText('Context');
  await expect(page.locator('#why-rail')).toContainText('For I desired mercy, and not sacrifice.');
  await expect(page.locator('#why-rail')).toContainText('Context before the verse.');
  // K returns to the divider; K again returns to card #10.
  await page.keyboard.press('k');
  await expect(page.locator('#tail-divider')).toBeFocused();
  await page.keyboard.press('k');
  await expect(page.locator('.result-card[data-stop="9"]')).toBeFocused();
  // J from the divider's far end: last expanded tail row is a dead end.
  for (let i = 0; i < 5; i += 1) await page.keyboard.press('j');
  await expect(page.locator('.tail-row[data-stop="14"]')).toBeFocused();
  await page.keyboard.press('j');
  await expect(page.locator('.tail-row[data-stop="14"]')).toBeFocused();

  expect(errors).toEqual([]);
});

test('D6: boundary guards mark whole words only; no lexical reason means zero marks', async ({ page }) => {
  const errors = collectErrors(page);
  await installRoutes(page);
  await page.goto(origin);
  await submit(page, 'love');
  await expect(page.locator('.result-card.expanded')).toContainText('1 John 4:7');
  // "Exact phrase" contributes the query "love": exactly the two standalone
  // occurrences are marked; nothing inside "loveth" or "Beloved".
  const marks = page.locator('.result-card.expanded .verse-body mark');
  await expect(marks).toHaveCount(2);
  await expect(marks.nth(0)).toHaveText('love');
  await expect(marks.nth(1)).toHaveText('love');
  const verseHtml = await page.locator('.result-card.expanded .verse-body').innerHTML();
  expect(verseHtml).not.toContain('<mark>loveth');
  expect(verseHtml).not.toContain('Be<mark>');

  // A result with no lexical reason renders zero marks (concept anchor card).
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('j');
  await expect(page.locator('.result-card.expanded')).toContainText('Psalm 23:1-4');
  await expect(page.locator('.result-card.expanded .verse-body mark')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('D6: reference, invalid-reference, empty, blank no-op, passage failure, and race handling', async ({ page }) => {
  const errors = collectErrors(page);
  const log: string[] = [];
  await installRoutes(page, { log, searchDelayMs: { 'slow mercy': 700 } });
  await page.goto(origin);

  // Blank and whitespace-only submits are client no-ops.
  await submit(page, '');
  await submit(page, '   ');
  await page.waitForTimeout(200);
  expect(log.filter((entry) => entry.startsWith('/api/search'))).toHaveLength(0);

  // Reference kind: read-only passage + copy; focus stays in the input.
  await submit(page, 'Psalm 46');
  await expect(page.locator('#center-body')).toContainText('That’s a direct passage lookup — nothing to judge here.');
  await expect(page.locator('#center-body')).toContainText('God is our refuge and strength');
  await expect(page.locator('#search-input')).toBeFocused();

  // Invalid reference: message, no cards, query preserved.
  await submit(page, 'Hesekiah 99:99');
  await expect(page.locator('#center-body')).toContainText('“Hesekiah 99:99” looks like a verse reference, but no passage matches it — check the book name, chapter, and verse (e.g. “Psalm 46:1”).');
  await expect(page.locator('.result-card')).toHaveCount(0);
  await expect(page.locator('#search-input')).toHaveValue('Hesekiah 99:99');
  await expect(page.locator('#search-input')).toBeFocused();

  // Empty discovery: §3.1 empty state with its one action.
  await submit(page, 'unfindable words');
  await expect(page.locator('#center-body')).toContainText('No results for “unfindable words”.');
  await expect(page.locator('#center-body')).toContainText('Know a passage that should answer this? Add it.');
  await expect(page.locator('#center-body')).toContainText('Add the missing passage');
  await expect(page.locator('#search-input')).toBeFocused();

  // Race: a slower earlier search never overwrites the newer one.
  await submit(page, 'slow mercy');
  await submit(page, 'seven');
  await expect(page.locator('.result-card')).toHaveCount(7);
  await page.waitForTimeout(900); // let the slow response arrive and be dropped
  await expect(page.locator('.result-card')).toHaveCount(7);
  await expect(page.locator('#tail-divider')).toHaveCount(0);
  // J to the last card of the 7-result list: no wrap.
  for (let i = 0; i < 6; i += 1) await page.keyboard.press('j');
  await expect(page.locator('.result-card[data-stop="6"]')).toBeFocused();
  await page.keyboard.press('j');
  await expect(page.locator('.result-card[data-stop="6"]')).toBeFocused();
  expect(errors).toEqual([]);
});

test('D6: a failing passage fetch keeps the excerpt rendering with no sup markers', async ({ page }) => {
  const errors = collectErrors(page);
  await installRoutes(page, { failPassages: true });
  await page.goto(origin);
  await submit(page, 'mercy');
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();
  await page.keyboard.press('j');
  await expect(page.locator('.result-card.expanded')).toContainText('Psalm 23:1-4');
  // Range placeholder: the joined excerpt, zero sup markers, no error state.
  await expect(page.locator('.result-card.expanded .verse-body sup')).toHaveCount(0);
  await expect(page.locator('.result-card.expanded .verse-body')).toContainText('The LORD is my shepherd; I shall not want.');
  expect(errors).toEqual([]);
});

test('D7: quick lookup opens, searches live, hands off to Review, and restores focus on Esc', async ({ page }) => {
  const errors = collectErrors(page);
  const log: string[] = [];
  await installRoutes(page, { log });
  await page.goto(origin);

  // Ctrl+K opens with focus in the lookup input.
  await page.keyboard.press('Control+k');
  await expect(page.locator('#lookup-input')).toBeFocused();
  await expect(page.locator('.lookup-footer')).toContainText('Looking something up never creates a case by itself.');

  // Typing ≥3 chars fires the mocked live search.
  await page.fill('#lookup-input', 'mercy');
  await expect(page.locator('.lookup-row').first()).toContainText('Psalm 85:10');
  await expect(page.locator('.lookup-row .row-action').first()).toHaveText('Review results for this search ↵');
  expect(log.some((entry) => entry.startsWith('/api/search?q=mercy'))).toBe(true);

  // Enter on a row closes the dialog, fills the main bar, renders those
  // results, and the §3.1 handoff focuses card #1.
  await page.keyboard.press('Enter');
  await expect(page.locator('.lookup-dialog')).toHaveCount(0);
  await expect(page.locator('#search-input')).toHaveValue('mercy');
  await expect(page.locator('.result-card')).toHaveCount(10);
  await expect(page.locator('.result-card[data-stop="0"]')).toBeFocused();

  // Invalid-reference: the §3.1 message inline, no rows.
  await page.click('#lookup-open');
  await page.fill('#lookup-input', 'Hesekiah 99:99');
  await expect(page.locator('.lookup-empty')).toContainText('looks like a verse reference, but no passage matches it');
  await expect(page.locator('.lookup-row')).toHaveCount(0);

  // Esc closes and returns focus to the opener.
  await page.keyboard.press('Escape');
  await expect(page.locator('.lookup-dialog')).toHaveCount(0);
  await expect(page.locator('#lookup-open')).toBeFocused();
  expect(errors).toEqual([]);
});

test('D8: skeleton with aria-busy, polite results announcement, and search-error retry', async ({ page }) => {
  const errors = collectErrors(page);
  const failures = new Set(['broken query']);
  await installRoutes(page, { searchDelayMs: { mercy: 500 }, searchFailures: failures });
  await page.goto(origin);

  // Delayed mock: skeleton renders with aria-busy, then results replace it.
  await submit(page, 'mercy');
  await expect(page.locator('#results-skeleton')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('.result-card')).toHaveCount(10, { timeout: 5000 });
  await expect(page.locator('[aria-busy]')).toHaveCount(0);

  // The visually-hidden polite live region announced the count.
  await expect(page.locator('#results-status')).toHaveText('14 results for “mercy”');

  // Zero-result announcement carries the empty-state sentence.
  await submit(page, 'unfindable words');
  await expect(page.locator('#results-status')).toHaveText('No results for “unfindable words”.');

  // 500: the search-error sentence with a Retry that refires the request.
  await submit(page, 'broken query');
  await expect(page.locator('#center-body')).toContainText('The engine did not answer. It may be restarting — try again in a moment.');
  await page.click('#center-body >> text=Retry');
  // The mock fails only once; the retry resolves to an empty discovery.
  await expect(page.locator('#center-body')).toContainText('No results for “broken query”.');
  expect(errors).toEqual([]);
});

test('read-only degraded boot renders the status banner', async ({ page }) => {
  const errors = collectErrors(page);
  await installRoutes(page, { degraded: true });
  await page.goto(origin);
  const banner = page.locator('#banner-slot .banner');
  await expect(banner).toBeVisible();
  await expect(banner).toHaveAttribute('role', 'status');
  await expect(banner).toContainText('Read-only right now.');
  await expect(banner).toContainText('The engine is rebuilding its data. You can read everything, but calls will not save. This usually clears in a minute — then reload the page.');
  expect(errors).toEqual([]);
});
