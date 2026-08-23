import http from 'node:http';
import { readFile } from 'node:fs/promises';

import { expect, type Page } from '@playwright/test';

// Shared harness for the /study demo specs (plan D19 study-p2.spec.ts and
// D23 study-p3.spec.ts): a static fixture server for static/study.html plus
// the stateful /api/** mock and the shared result/passage fixtures.

export const identity = {
  engineVersion: '0.9.0',
  corpusFingerprint: 'a'.repeat(64),
  layerFingerprint: 'b'.repeat(64),
};

export interface StudyServer {
  readonly origin: string;
  close(): Promise<void>;
}

export async function startStudyServer(): Promise<StudyServer> {
  const page = await readFile(new URL('../static/study.html', import.meta.url));
  const server = http.createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(page);
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (typeof address !== 'object' || address === null) throw new Error('Browser fixture server did not bind.');
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')
      && !message.text().includes('Judgment rejected')) {
      errors.push(message.text());
    }
  });
  return errors;
}

export interface MockReason {
  readonly family: string;
  readonly label: string;
  readonly points: number;
}
export interface MockResult {
  readonly targetId: string;
  readonly reference: string;
  readonly excerpt: string;
  readonly score: number;
  readonly reasons: readonly MockReason[];
}

export function result(targetId: string, reference: string, excerpt: string, reasons: readonly MockReason[]): MockResult {
  return { targetId, reference, excerpt, score: 987.65, reasons };
}
export const filler = (n: number): MockResult => result(
  `KJV:0100${String(n).padStart(4, '0')}`,
  `Filler ${n}:${n}`,
  `Filler verse text number ${n} with quiet words.`,
  [{ family: 'proximity', label: 'Words near each other', points: 431 }],
);

// 14 results: top block of 10 + tail of 4 (one range tail row).
export const mercyResults: MockResult[] = [
  result('KJV:19085010', 'Psalm 85:10', 'mercy, and truth are met together; righteousness and peace have kissed each other.', [
    { family: 'token_overlap', label: 'Contains "mercy and truth"', points: 431 },
  ]),
  result('KJV:19023001', 'Psalm 23:1-4', 'The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures.', [
    { family: 'concept_anchor', label: 'Theme: shepherd care', points: 431 },
  ]),
  result('KJV:33007018', 'Micah 7:18', 'Who is a God like unto thee, that pardoneth iniquity.', [
    { family: 'concept_anchor', label: 'Theme: uncharted theme', points: 431 },
  ]),
  filler(4), filler(5), filler(6), filler(7), filler(8), filler(9), filler(10),
  result('KJV:28006006', 'Hosea 6:6', 'For I desired mercy, and not sacrifice.', [
    { family: 'token_overlap', label: 'Contains "desired mercy"', points: 431 },
  ]),
  result('KJV:19046001', 'Psalm 46:1-3', 'God is our refuge and strength, a very present help in trouble. Therefore will not we fear.', [
    { family: 'concept_anchor', label: 'Theme: refuge', points: 431 },
  ]),
  filler(13), filler(14),
];

// 11 results for "shelter": top block of 10 fillers + one range tail row
// whose targetId addresses the run's SECOND verse (the engine keeps the
// best-ranked member's targetId on a merged run — WEB:19091002 = verse 2).
export const shelterResults: MockResult[] = [
  filler(4), filler(5), filler(6), filler(7), filler(8), filler(9), filler(10), filler(11), filler(12), filler(13),
  result('WEB:19091002', 'Psalms 91:1-2', 'He who dwells in the secret place of the Most High will rest in the shadow of the Almighty.', [
    { family: 'concept_anchor', label: 'Theme: shelter', points: 431 },
  ]),
];

export const passages: Record<string, { reference?: string; verses: { verse: number; text: string }[] }> = {
  'Psalm 85:10': { verses: [{ verse: 10, text: 'mercy, and truth are met together; righteousness and peace have kissed each other.' }] },
  'Psalm 23:1-4': {
    verses: [
      { verse: 1, text: 'The LORD is my shepherd; I shall not want.' },
      { verse: 2, text: 'He maketh me to lie down in green pastures.' },
      { verse: 3, text: 'He restoreth my soul.' },
      { verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil.' },
    ],
  },
  'Psalm 23:2': { verses: [{ verse: 2, text: 'He maketh me to lie down in green pastures.' }] },
  'Micah 7:18': { verses: [{ verse: 18, text: 'Who is a God like unto thee, that pardoneth iniquity.' }] },
  'Hosea 6:6': { verses: [{ verse: 6, text: 'For I desired mercy, and not sacrifice.' }] },
  'Psalm 46:1-3': {
    verses: [
      { verse: 1, text: 'God is our refuge and strength, a very present help in trouble.' },
      { verse: 2, text: 'Therefore will not we fear, though the earth be removed.' },
      { verse: 3, text: 'Though the waters thereof roar and be troubled.' },
    ],
  },
  'Psalm 46:1': { verses: [{ verse: 1, text: 'God is our refuge and strength, a very present help in trouble.' }] },
  'Psalm 46:2': { verses: [{ verse: 2, text: 'Therefore will not we fear, though the earth be removed.' }] },
  'Psalms 91:1-2': {
    verses: [
      { verse: 1, text: 'He who dwells in the secret place of the Most High will rest in the shadow of the Almighty.' },
      { verse: 2, text: 'I will say of Yahweh, “He is my refuge and my fortress; my God, in whom I trust.”' },
    ],
  },
  'Psalms 91:2': { verses: [{ verse: 2, text: 'I will say of Yahweh, “He is my refuge and my fortress; my God, in whom I trust.”' }] },
  'Lamentations 3:22': { verses: [{ verse: 22, text: 'It is of the LORD’s mercies that we are not consumed, because his compassions fail not.' }] },
  'Lamentations 3:22-23': {
    verses: [
      { verse: 22, text: 'It is of the LORD’s mercies that we are not consumed, because his compassions fail not.' },
      { verse: 23, text: 'They are new every morning: great is thy faithfulness.' },
    ],
  },
};
for (let n = 4; n <= 14; n += 1) {
  passages[`Filler ${n}:${n}`] = { verses: [{ verse: n, text: `Filler verse text number ${n} with quiet words.` }] };
}

export interface Call {
  readonly method: string;
  readonly path: string;
  readonly search: string;
  readonly body: Record<string, unknown> | null;
}

export interface JudgmentResponse { status: number; payload: unknown }

export interface MockState {
  calls: Call[];
  cases: Record<string, unknown>[];
  degraded: { value: boolean };
  tokenCounter: number;
  lastToken: string;
  judgmentCounter: number;
  judgments: Record<string, unknown[]>;
  /** Per-case snapshot top-10 override; default = live top-10 for the query. */
  snapshotResults?: (query: string) => MockResult[];
  /** Custom judgment POST responses; return null to fall through. */
  judgmentResponder?: (body: Record<string, unknown>, n: number) => JudgmentResponse | null;
  failPassageRefs: Set<string>;
}

export function caseMock(caseId: string, query: string, state = 'reviewing', at = '2026-08-20T00:00:00.000Z'): Record<string, unknown> {
  return { caseId, query, source: 'manual', state, events: [{ at }] };
}

export function judgmentMock(caseId: string, judgmentId: string, fields: Record<string, unknown>): Record<string, unknown> {
  return {
    schemaVersion: 2,
    judgmentId,
    caseId,
    at: '2026-08-20T00:00:00.000Z',
    reviewer: 'jesse',
    query: 'mercy',
    observedWindow: 10,
    observedRank: null,
    resultSetDigest: 'd'.repeat(64),
    displayedWindowDigest: 'e'.repeat(64),
    source: 'manual',
    ...identity,
    ...fields,
  };
}

export function makeMock(options: Partial<MockState> = {}): MockState {
  return {
    calls: [],
    cases: [],
    degraded: { value: false },
    tokenCounter: 0,
    lastToken: '',
    judgmentCounter: 0,
    judgments: {},
    failPassageRefs: new Set(),
    ...options,
  };
}

export function liveTop10(query: string): MockResult[] {
  if (query === 'mercy') return mercyResults.slice(0, 10);
  if (query === 'shelter') return shelterResults.slice(0, 10);
  return [];
}

export async function installRoutes(page: Page, mock: MockState): Promise<void> {
  const ok = (data: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data }) });
  const created = (data: unknown) => ({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, data }) });
  const err = (status: number, code: string, message: string) => ({
    status, contentType: 'application/json',
    body: JSON.stringify({ ok: false, error: { code, message } }),
  });
  const plain = (data: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  const review = (caseId: string, query: string) => {
    mock.tokenCounter += 1;
    mock.lastToken = `token-${mock.tokenCounter}`;
    const results = mock.snapshotResults !== undefined ? mock.snapshotResults(query) : liveTop10(query);
    return {
      freshness: 'fresh',
      token: mock.lastToken,
      caseId,
      query,
      source: 'manual',
      observedWindow: 10,
      resultSetDigest: 'd'.repeat(64),
      displayedWindowDigest: 'e'.repeat(64),
      result: { kind: 'discovery', query, results, ...identity },
    };
  };

  await page.route('**/fonts/**', async (route) => { await route.fulfill({ status: 404, body: '' }); });
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const body = request.method() === 'POST' ? (request.postDataJSON() as Record<string, unknown> | null) : null;
    mock.calls.push({ method: request.method(), path: url.pathname, search: url.search, body });

    if (url.pathname === '/api/v2/health') {
      await route.fulfill(ok({
        status: mock.degraded.value ? 'unavailable' : 'healthy',
        startup: { degraded: mock.degraded.value, diagnostics: [], issues: [] },
      }));
      return;
    }
    if (url.pathname === '/api/meta') {
      await route.fulfill(plain({ ...identity, schemaVersion: 'test', translations: [] }));
      return;
    }
    if (url.pathname === '/api/concepts') {
      await route.fulfill(plain([{ id: 'shepherd-care', label: 'shepherd care' }, { id: 'refuge', label: 'refuge' }]));
      return;
    }
    if (url.pathname === '/api/v2/cases' && request.method() === 'GET') {
      await route.fulfill(ok({ cases: mock.cases }));
      return;
    }
    if (url.pathname === '/api/v2/cases' && request.method() === 'POST') {
      const query = body !== null && typeof body.query === 'string' ? body.query : '';
      const caseId = `case-${mock.cases.length + 1}`;
      const record = caseMock(caseId, query, 'new', new Date().toISOString());
      mock.cases.push(record);
      await route.fulfill(created({ case: record, event: {}, review: review(caseId, query) }));
      return;
    }
    const stateMatch = /^\/api\/v2\/cases\/([^/]+)\/state$/.exec(url.pathname);
    if (stateMatch !== null) {
      const record = mock.cases.find((entry) => entry.caseId === stateMatch[1]);
      if (record !== undefined && body !== null) record.state = body.state;
      await route.fulfill(ok({ event: {}, case: record ?? null }));
      return;
    }
    const caseMatch = /^\/api\/v2\/cases\/([^/]+)$/.exec(url.pathname);
    if (caseMatch !== null) {
      const record = mock.cases.find((entry) => entry.caseId === caseMatch[1]);
      if (record === undefined) {
        await route.fulfill(err(404, 'case_not_found', 'Unknown review case.'));
        return;
      }
      await route.fulfill(ok({ case: record, review: review(record.caseId as string, record.query as string) }));
      return;
    }
    if (url.pathname === '/api/v2/judgments' && request.method() === 'GET') {
      const caseId = url.searchParams.get('caseId') ?? '';
      await route.fulfill(ok({ caseId, judgments: mock.judgments[caseId] ?? [] }));
      return;
    }
    if (url.pathname === '/api/v2/judgments' && request.method() === 'POST') {
      mock.judgmentCounter += 1;
      if (mock.judgmentResponder !== undefined && body !== null) {
        const custom = mock.judgmentResponder(body, mock.judgmentCounter);
        if (custom !== null) {
          await route.fulfill({ status: custom.status, contentType: 'application/json', body: JSON.stringify(custom.payload) });
          return;
        }
      }
      const record = {
        schemaVersion: 2,
        judgmentId: `jid-${mock.judgmentCounter}`,
        caseId: body?.caseId ?? '',
        at: new Date().toISOString(),
        reviewer: 'jesse',
        query: 'mercy',
        observedWindow: 10,
        observedRank: body?.action === 'missing' ? null : 1,
        resultSetDigest: 'd'.repeat(64),
        displayedWindowDigest: 'e'.repeat(64),
        source: 'manual',
        ...identity,
        ...(body ?? {}),
      };
      delete (record as Record<string, unknown>).snapshotToken;
      const caseId = String(body?.caseId ?? '');
      mock.judgments[caseId] = (mock.judgments[caseId] ?? []).concat([record]);
      await route.fulfill(created({ judgment: record }));
      return;
    }
    if (url.pathname === '/api/search') {
      const q = url.searchParams.get('q') ?? '';
      if (q === 'mercy') {
        await route.fulfill(plain({ kind: 'discovery', query: q, results: mercyResults, ...identity }));
        return;
      }
      if (q === 'shelter') {
        await route.fulfill(plain({ kind: 'discovery', query: q, results: shelterResults, ...identity }));
        return;
      }
      if (q === 'Psalm 46') {
        await route.fulfill(plain({
          kind: 'reference', query: q, ...identity,
          passage: { reference: 'Psalm 46', verses: [{ verse: 1, text: 'God is our refuge and strength.' }] },
        }));
        return;
      }
      await route.fulfill(plain({ kind: 'discovery', query: q, results: [], ...identity }));
      return;
    }
    if (url.pathname === '/api/passage') {
      const ref = url.searchParams.get('ref') ?? '';
      if (mock.failPassageRefs.has(ref)) {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'unavailable' }) });
        return;
      }
      const passage = passages[ref];
      if (passage === undefined) {
        await route.fulfill(plain({ kind: 'invalid-reference', query: ref, ...identity }));
        return;
      }
      await route.fulfill(plain({ kind: 'passage', passage: { reference: passage.reference ?? ref, verses: passage.verses }, ...identity }));
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
              { verse: 5, text: 'Context before the verse.' },
              { verse: 6, text: 'The verse under review.' },
              { verse: 7, text: 'Context after the verse.' },
            ],
          },
        },
      }));
      return;
    }
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'unmocked' }) });
  });
}

export async function submit(page: Page, query: string): Promise<void> {
  await page.fill('#search-input', query);
  await page.press('#search-input', 'Enter');
}

export function judgmentPosts(mock: MockState): Call[] {
  return mock.calls.filter((call) => call.method === 'POST' && call.path === '/api/v2/judgments');
}
export function casePosts(mock: MockState): Call[] {
  return mock.calls.filter((call) => call.method === 'POST' && call.path === '/api/v2/cases');
}

export const ALLOWED_BODY_KEYS = new Set([
  'caseId', 'snapshotToken', 'action', 'targetId', 'reference', 'withinTop',
  'diagnosis', 'diagnosisInferred', 'conceptId', 'note', 'preferredTargetId',
  'otherTargetId', 'supersedes',
]);
export function assertPayloadAllowlist(mock: MockState): void {
  for (const call of judgmentPosts(mock)) {
    for (const key of Object.keys(call.body ?? {})) {
      expect(ALLOWED_BODY_KEYS.has(key), `unexpected judgment body key "${key}"`).toBe(true);
    }
  }
}
