import http from 'node:http';
import { readFile } from 'node:fs/promises';

import { expect, type Page } from '@playwright/test';

// Shared harness for the Study demo specs (study-p1..p5): a static fixture
// server for the Study page (static/index.html since the flip, D41) plus
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
  // The Study page lives at static/index.html since the flip (D41).
  const page = await readFile(new URL('../static/index.html', import.meta.url));
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
  'Jeremiah 4:10': { verses: [{ verse: 10, text: 'Ah, Lord GOD! surely thou hast greatly deceived this people, saying, Ye shall have peace; whereas the sword reacheth unto the soul.' }] },
  'Exodus 15:11': { verses: [{ verse: 11, text: 'Who is like unto thee, O LORD, among the gods? who is like thee, glorious in holiness, fearful in praises, doing wonders?' }] },
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
  /** GET /api/v2/inbox items (default: empty — the section is omitted). */
  inboxItems: unknown[];
  /** Whether GET /api/v2/inbox 500s (the §3.11 failed-rail-fetch branch). */
  inboxFails: boolean;
  /** GET /api/v2/candidates payload. */
  candidates: { reviews: unknown[]; readOnly: boolean };
  /** Blind-session state; the mock folds judgments into the session view. */
  blind: {
    session: Record<string, unknown> | null;
    startRequestIds: string[];
    judgmentBodies: Record<string, unknown>[];
  };
  /** POST /api/v2/compile/preview plans, consumed in order (last repeats). */
  compilePlans: unknown[];
  compilePreviewCount: number;
  /** Custom apply responder; return null for a plain success. */
  applyResponder?: (body: Record<string, unknown>, n: number) => JudgmentResponse | null;
  applyCount: number;
  /** null-review case ids: GET /api/v2/cases/:uuid returns review:null. */
  nullReviewCases: Set<string>;
  /** GET /api/v2/updates payload (default: the empty derivation). */
  updatesPayload: Record<string, unknown> | null;
  /** Whether GET /api/v2/updates 500s. */
  updatesFails: boolean;
  /** Custom decide POST responses; return null to fall through. */
  decideResponder?: (cardId: string, body: Record<string, unknown>, n: number) => JudgmentResponse | null;
  decideCount: number;
  /** Extra discovery result sets by query (checked before the built-ins). */
  extraSearches: Record<string, MockResult[]>;
  /** GET /api/v2/updates/train/:id payload (`data.train`); null → 404. */
  trainView: Record<string, unknown> | null;
  /** Custom seal responder; return null for the default (201 + trainView). */
  trainSealResponder?: (body: Record<string, unknown> | null, n: number) => JudgmentResponse | null;
  trainSealCount: number;
  /** Custom train-state responder; return null for the default. */
  trainViewResponder?: (trainId: string, n: number) => JudgmentResponse | null;
  trainViewCount: number;
  /** GET /api/v2/admissions/:id payload (`data.admission`); null → 404. */
  admissionDetail: Record<string, unknown> | null;
  admitResponder?: (reviewId: string, body: Record<string, unknown> | null, n: number) => JudgmentResponse | null;
  admitCount: number;
  prepareResponder?: (reviewId: string, body: Record<string, unknown> | null, n: number) => JudgmentResponse | null;
  prepareCount: number;
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
    inboxItems: [],
    inboxFails: false,
    candidates: { reviews: [], readOnly: false },
    blind: { session: null, startRequestIds: [], judgmentBodies: [] },
    compilePlans: [],
    compilePreviewCount: 0,
    applyCount: 0,
    nullReviewCases: new Set(),
    updatesPayload: null,
    updatesFails: false,
    decideCount: 0,
    extraSearches: {},
    trainView: null,
    trainSealCount: 0,
    trainViewCount: 0,
    admissionDetail: null,
    admitCount: 0,
    prepareCount: 0,
    ...options,
  };
}

/**
 * A GET /api/v2/updates payload for the given derived cards, with the tally
 * computed under the deriver's rule (op-bearing, un-routed cards only). The
 * digest fields are 64-hex like the real server's — the D28 assertion must
 * prove they never render.
 */
export function derivationMock(cards: readonly Record<string, unknown>[], trains: readonly Record<string, unknown>[] = []): Record<string, unknown> {
  const stateOf = (card: Record<string, unknown>): string => {
    const state = card.state as Record<string, unknown> | undefined;
    return state !== undefined && typeof state.decision === 'string' ? state.decision : 'drafted';
  };
  const opBearing = cards.filter((card) =>
    card.kind !== 're-confirmation' && card.kind !== 'conflict' && card.kind !== 'needs-engineering'
    && (card.routed === undefined || card.routed === null));
  const shipped = (card: Record<string, unknown>): boolean => {
    const state = card.state as Record<string, unknown> | undefined;
    return state !== undefined && state.sealedTrainLive === true;
  };
  return {
    cards,
    derivationDigest: 'c'.repeat(64),
    replayIdentity: identity,
    trains,
    unverifiablePriorTrains: [],
    tally: {
      drafted: opBearing.filter((card) => stateOf(card) === 'drafted').length,
      approved: opBearing.filter((card) => stateOf(card) === 'approved' && card.parkedByDefault !== true && !shipped(card)).length,
      declined: opBearing.filter((card) => stateOf(card) === 'declined').length,
      parked: opBearing.filter((card) => stateOf(card) === 'parked' || card.parkedByDefault === true).length,
    },
    readOnly: false,
  };
}

/**
 * §4.6's guard Update Report lead — trainRunner.ts is its single writer;
 * this constant exists so specs can assert the page renders it VERBATIM
 * from the payload (the page itself must not mint the sentence).
 */
export const GUARD_REPORT_LEAD_TEXT = 'This update only writes lines on the answer sheet — no search result can move, so there is nothing to compare. The checks confirmed every line holds.';

/** A stored sealed-train snapshot as GET /api/v2/updates payloads carry it. */
export function sealedTrainSnapshot(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    trainId: 'train-0001',
    flavor: 'guard',
    openedAt: '2026-08-28T12:00:00.000Z',
    state: 'sealed',
    sealed: {
      schemaVersion: 1,
      eventId: '0a1b2c3d-6666-4777-8888-999900001111',
      at: '2026-08-28T12:00:00.000Z',
      reviewer: 'jesse',
      kind: 'train-sealed',
      trainId: 'train-0001',
      sealDigest: 'a1'.repeat(32),
      cardIds: ['11'.repeat(32)],
      judgmentIds: ['0a1b2c3d-1111-4222-8333-944445555666'],
      replayIdentity: identity,
    },
    ...overrides,
  };
}

/** An observed TrainView as GET /api/v2/updates/train/:id serves it. */
export function guardTrainView(state: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    trainId: 'train-0001',
    flavor: 'guard',
    state,
    openedAt: '2026-08-28T12:00:00.000Z',
    sealDigest: 'a1'.repeat(32),
    cardIds: ['11'.repeat(32)],
    stopped: null,
    report: {
      schemaVersion: 1,
      kind: 'guard-update-report',
      trainId: 'train-0001',
      lead: GUARD_REPORT_LEAD_TEXT,
      lines: ['For "it is well with my soul", Jeremiah 4:10 must not rank. Why: matched words, not meaning; judged not a fit for this query'],
      digest: 'ab'.repeat(32),
    },
    draftPrUrl: null,
    checksDurationMs: null,
    ...overrides,
  };
}

/** A READY AdmissionView detail for `GET /api/v2/admissions/train-0001`. */
export function readyAdmissionDetail(): Record<string, unknown> {
  return {
    reviewId: 'train-0001',
    proposalId: 'train-0001',
    state: 'READY',
    readOnly: false,
    blockers: [],
    recovery: [],
    preview: {
      digest: 'd1'.repeat(32),
      proposalDigest: 'd2'.repeat(32),
      baseCommit: 'f'.repeat(40),
      candidate: null,
      diffs: [],
      decisions: [{ slotId: 'fixture:it-is-well-with-my-soul', kind: 'fixture-decision', prompt: 'Confirm the fixture change.', probes: [] }],
      measurableEffect: false,
      effectExemption: { kind: 'fixture-class-effect', lane: 'fixture-lane', operationTypes: ['golden-fixture-upsert'], rationale: 'fixtures are the measuring instrument' },
      reviewedComparisonQueries: [],
      gauntlet: null,
    },
    admission: null,
  };
}

export function liveTop10(query: string): MockResult[] {
  if (query === 'mercy') return mercyResults.slice(0, 10);
  if (query === 'shelter') return shelterResults.slice(0, 10);
  return [];
}

export interface InstallOptions {
  /**
   * D32 onboarding shows on first visit (no `study.onboarded` flag). The
   * pre-P5 specs exercise flows behind it, so the harness seeds the flag by
   * default; the study-p5 onboarding tests opt out with `onboarded: false`.
   */
  readonly onboarded?: boolean;
}

export async function installRoutes(page: Page, mock: MockState, options: InstallOptions = {}): Promise<void> {
  if (options.onboarded !== false) {
    await page.addInitScript(() => {
      localStorage.setItem('study.onboarded', '1');
    });
  }
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
    const results = mock.snapshotResults !== undefined
      ? mock.snapshotResults(query)
      : mock.extraSearches[query] !== undefined ? mock.extraSearches[query].slice(0, 10) : liveTop10(query);
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
      if (mock.nullReviewCases.has(record.caseId as string)) {
        await route.fulfill(ok({ case: record, review: null }));
        return;
      }
      await route.fulfill(ok({ case: record, review: review(record.caseId as string, record.query as string) }));
      return;
    }
    if (url.pathname === '/api/v2/inbox') {
      if (mock.inboxFails) {
        await route.fulfill(err(500, 'inbox_unavailable', 'Inbox could not be built.'));
        return;
      }
      await route.fulfill(ok({ items: mock.inboxItems }));
      return;
    }
    if (url.pathname === '/api/v2/candidates' && request.method() === 'GET') {
      await route.fulfill(ok(mock.candidates));
      return;
    }
    const blindStart = /^\/api\/v2\/candidates\/([^/]+)\/blind-sessions$/.exec(url.pathname);
    if (blindStart !== null && request.method() === 'POST') {
      if (body !== null && typeof body.requestId === 'string') mock.blind.startRequestIds.push(body.requestId);
      await route.fulfill(created({ session: mock.blind.session }));
      return;
    }
    const blindPassages = /^\/api\/v2\/candidates\/([^/]+)\/blind-sessions\/([^/]+)\/passages$/.exec(url.pathname);
    if (blindPassages !== null) {
      const ref = url.searchParams.get('passageId') ?? '';
      // The fixture maps passageId → a small context payload.
      await route.fulfill(ok({
        passageId: ref,
        reference: 'Psalm 85:10',
        contextReference: 'Psalm 85:8-12',
        verses: [
          { verse: 9, text: 'Surely his salvation is nigh them that fear him.' },
          { verse: 10, text: 'mercy, and truth are met together; righteousness and peace have kissed each other.' },
          { verse: 11, text: 'Truth shall spring out of the earth.' },
        ],
      }));
      return;
    }
    const blindJudge = /^\/api\/v2\/candidates\/([^/]+)\/blind-sessions\/([^/]+)\/judgments$/.exec(url.pathname);
    if (blindJudge !== null && request.method() === 'POST') {
      if (body !== null) mock.blind.judgmentBodies.push(body);
      const session = mock.blind.session;
      if (session !== null && body !== null) {
        const queries = session.queries as Record<string, unknown>[];
        const target = queries.find((entry) => entry.queryId === body.queryId);
        if (target !== undefined) {
          target.judgment = { choice: body.choice, recordedAt: '2026-08-23T00:00:00.000Z' };
          target.reveal = { sideA: 'Current', sideB: 'Candidate', preference: 'current-wins' };
        }
        session.revision = (session.revision as number) + 1;
        session.stateDigest = 'sd-' + String(session.revision);
      }
      await route.fulfill(created({ session }));
      return;
    }
    if (url.pathname === '/api/v2/compile/preview' && request.method() === 'POST') {
      mock.compilePreviewCount += 1;
      const plan = mock.compilePlans.length === 0
        ? { schemaVersion: 1, operations: [], fixturesWritten: [], fixturesRemoved: [], proposedSelections: [], checklist: [], warnings: [], report: '', inputs: [], digest: 'f'.repeat(64) }
        : mock.compilePlans[Math.min(mock.compilePreviewCount, mock.compilePlans.length) - 1];
      await route.fulfill(ok({ plan }));
      return;
    }
    if (url.pathname === '/api/v2/compile/apply' && request.method() === 'POST') {
      mock.applyCount += 1;
      if (mock.applyResponder !== undefined && body !== null) {
        const custom = mock.applyResponder(body, mock.applyCount);
        if (custom !== null) {
          await route.fulfill({ status: custom.status, contentType: 'application/json', body: JSON.stringify(custom.payload) });
          return;
        }
      }
      await route.fulfill(ok({ digest: body?.digest ?? '', outcome: { fixturesWritten: [], fixturesRemoved: [] } }));
      return;
    }
    if (url.pathname === '/api/v2/updates' && request.method() === 'GET') {
      if (mock.updatesFails) {
        await route.fulfill(err(500, 'updates_unavailable', 'Updates could not be derived. Reload and retry.'));
        return;
      }
      await route.fulfill(ok(mock.updatesPayload ?? derivationMock([])));
      return;
    }
    const decideMatch = /^\/api\/v2\/updates\/cards\/([^/]+)\/decide$/.exec(url.pathname);
    if (decideMatch !== null && request.method() === 'POST') {
      mock.decideCount += 1;
      if (mock.decideResponder !== undefined && body !== null) {
        const custom = mock.decideResponder(decideMatch[1]!, body, mock.decideCount);
        if (custom !== null) {
          await route.fulfill({ status: custom.status, contentType: 'application/json', body: JSON.stringify(custom.payload) });
          return;
        }
      }
      // Default: validate the per-card pin and fold the decision onto the
      // stored payload, so a refetch sees the decided state (the real
      // store's latest-decide-wins fold).
      const payload = mock.updatesPayload;
      const cards = payload !== null && Array.isArray(payload.cards) ? payload.cards as Record<string, unknown>[] : [];
      const index = cards.findIndex((card) => card.cardId === decideMatch[1]);
      if (index === -1 || body === null) {
        await route.fulfill(err(409, 'card_not_derived', 'You changed your call on this since the card was written. Reload your updates for the fresh card.'));
        return;
      }
      const card = cards[index]!;
      if (card.cardRevision !== body.cardRevision) {
        await route.fulfill(err(409, 'stale_card_revision', 'The picture changed since you read this — reload your updates and decide against the fresh card.'));
        return;
      }
      const decision = body.decision === 'approve' ? 'approved' : body.decision === 'decline' ? 'declined' : 'parked';
      const cardState: Record<string, unknown> = { decision, decidedAt: '2026-08-28T00:00:00.000Z' };
      if (body.answers !== undefined) cardState.answers = body.answers;
      if (body.reason !== undefined) cardState.declineReason = body.reason;
      const fresh = { ...card, state: cardState };
      cards[index] = fresh;
      await route.fulfill(created({ card: fresh }));
      return;
    }
    if (url.pathname === '/api/v2/updates/train' && request.method() === 'POST') {
      mock.trainSealCount += 1;
      if (mock.trainSealResponder !== undefined) {
        const custom = mock.trainSealResponder(body, mock.trainSealCount);
        if (custom !== null) {
          await route.fulfill({ status: custom.status, contentType: 'application/json', body: JSON.stringify(custom.payload) });
          return;
        }
      }
      if (mock.trainView === null) {
        await route.fulfill(err(500, 'train_unavailable', 'The update could not be started or read. Reload and retry.'));
        return;
      }
      // Mirror the real seal: the next derivation carries the sealed train
      // and every approved card rides it (the fold's sealedInTrain freeze).
      const sealedPayload = mock.updatesPayload;
      if (sealedPayload !== null) {
        const trainId = typeof mock.trainView.trainId === 'string' ? mock.trainView.trainId : 'train-0001';
        const priorTrains = Array.isArray(sealedPayload.trains) ? sealedPayload.trains as Record<string, unknown>[] : [];
        sealedPayload.trains = [...priorTrains, sealedTrainSnapshot({ trainId })];
        if (Array.isArray(sealedPayload.cards)) {
          sealedPayload.cards = (sealedPayload.cards as Record<string, unknown>[]).map((card) => {
            const cardState = card.state as Record<string, unknown> | undefined;
            return cardState !== undefined && cardState.decision === 'approved'
              ? { ...card, state: { ...cardState, sealedInTrain: trainId } }
              : card;
          });
        }
      }
      await route.fulfill(created({ train: mock.trainView }));
      return;
    }
    const trainStateMatch = /^\/api\/v2\/updates\/train\/([^/]+)$/.exec(url.pathname);
    if (trainStateMatch !== null && request.method() === 'GET') {
      mock.trainViewCount += 1;
      if (mock.trainViewResponder !== undefined) {
        const custom = mock.trainViewResponder(trainStateMatch[1]!, mock.trainViewCount);
        if (custom !== null) {
          await route.fulfill({ status: custom.status, contentType: 'application/json', body: JSON.stringify(custom.payload) });
          return;
        }
      }
      if (mock.trainView === null) {
        await route.fulfill(err(404, 'train_not_found', 'No update with this name exists yet.'));
        return;
      }
      await route.fulfill(ok({ train: mock.trainView, readOnly: false }));
      return;
    }
    const admissionDetailMatch = /^\/api\/v2\/admissions\/([^/]+)$/.exec(url.pathname);
    if (admissionDetailMatch !== null && request.method() === 'GET') {
      if (mock.admissionDetail === null) {
        await route.fulfill(err(404, 'admission_not_found', 'Unknown admission.'));
        return;
      }
      await route.fulfill(ok({ admission: mock.admissionDetail, readOnly: false }));
      return;
    }
    const admitMatch = /^\/api\/v2\/admissions\/([^/]+)\/admit$/.exec(url.pathname);
    if (admitMatch !== null && request.method() === 'POST') {
      mock.admitCount += 1;
      if (mock.admitResponder !== undefined) {
        const custom = mock.admitResponder(admitMatch[1]!, body, mock.admitCount);
        if (custom !== null) {
          await route.fulfill({ status: custom.status, contentType: 'application/json', body: JSON.stringify(custom.payload) });
          return;
        }
      }
      const detail = mock.admissionDetail ?? { reviewId: admitMatch[1], proposalId: admitMatch[1] };
      const admittedView = {
        ...detail,
        state: 'ADMITTED',
        admission: { digest: 'ad'.repeat(32), admittedAt: '2026-08-28T13:00:00.000Z', manifestId: 'ad'.repeat(32) },
      };
      mock.admissionDetail = admittedView;
      await route.fulfill(created({ admission: admittedView }));
      return;
    }
    const prepareMatch = /^\/api\/v2\/publish\/([^/]+)\/prepare$/.exec(url.pathname);
    if (prepareMatch !== null && request.method() === 'POST') {
      mock.prepareCount += 1;
      if (mock.prepareResponder !== undefined) {
        const custom = mock.prepareResponder(prepareMatch[1]!, body, mock.prepareCount);
        if (custom !== null) {
          await route.fulfill({ status: custom.status, contentType: 'application/json', body: JSON.stringify(custom.payload) });
          return;
        }
      }
      // The default draft-PR success flips the served train view to pr-open,
      // like the real observed-state derivation would.
      const prUrl = 'https://github.com/example/scripture-search-engine/pull/999';
      if (mock.trainView !== null) mock.trainView = { ...mock.trainView, state: 'pr-open', draftPrUrl: prUrl };
      await route.fulfill(created({ publication: { status: 'prepared', branch: 'refinement/2026-08-28-train-0001', draftPrUrl: prUrl } }));
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
      if (mock.extraSearches[q] !== undefined) {
        await route.fulfill(plain({ kind: 'discovery', query: q, results: mock.extraSearches[q], ...identity }));
        return;
      }
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
