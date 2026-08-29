// D39 — ENDPOINT_FAILURES: every function in study's api layer (§4.8 `// §api`,
// one named function per endpoint) mapped to {mockedFailure, expectedCopyOrToast}.
// A plain data module with NO @playwright/test import: study-p5.spec.ts iterates
// it in the browser loop, and workbench/test/endpointFailuresParity.test.ts
// asserts its key set equals the function names parsed from the page's §api
// section — a new fetch site cannot ship unmapped.
//
// Every expectedCopyOrToast value is one of §3.11's specified strings — a named
// state's copy or the unnamed-failure fallbacks — never copy invented here.

/** §3.11 unnamed GET failure fallback. */
export const FALLBACK_LOAD = 'That part of the workbench did not load. Reload the page to try again.';
/** §3.11 unnamed POST failure fallback. */
export const FALLBACK_POST = 'That call did not save — the engine did not answer. Try it again in a moment.';
/** §3.11 search error (also the rescue preview's resolution-failure sentence). */
export const SEARCH_ERROR = 'The engine did not answer. It may be restarting — try again in a moment.';
/** §3.11 400 validation_failed toast. */
export const VALIDATION_TOAST = 'Something about this call was rejected — nothing was saved.';
/** §3.11 read-only / 503 artifact_unavailable toast. */
export const READ_ONLY_TOAST = 'Read-only right now — this call was not saved.';
/** §3.11 nothing-renders entries. */
export const NOTHING_RENDERS = 'nothing renders';
/** Votes-to-engine plan §4.9 failure-copy parity: the Updates screen's GET. */
export const UPDATES_LOAD_FAILED = 'Couldn’t load your updates just now — reload the page to try again.';
/** Votes-to-engine plan §4.9 failure-copy parity: the decide POST. */
export const UPDATES_DECIDE_FAILED = 'That decision didn’t save — check the connection and try again. Nothing was lost.';
/** Votes-to-engine plan §4.9: the seal ("Start the update"). */
export const TRAIN_SEAL_FAILED = 'The update couldn’t start — reload and try again. Your approvals are all still here.';
/** Votes-to-engine plan §4.9: the train state/report GET. */
export const TRAIN_PROGRESS_FAILED = 'Couldn’t load the update’s progress — reload to try again. The update itself keeps running.';
/** Votes-to-engine plan §4.9: the borrowed Phase-2 admit act. */
export const TRAIN_ADMIT_FAILED = 'The approval didn’t go through — reload the report and try again. Nothing was merged.';
/** Phase-2 approve act, step 1 (the admission detail GET) — P2-14. */
export const TRAIN_DETAIL_FAILED = 'Couldn’t load the approval step — reload and try again. Nothing was approved.';
/** Phase-2 approve act, step 3 (the draft-PR preparation) — P2-14. */
export const TRAIN_PREPARE_FAILED = 'The draft change couldn’t be opened on GitHub — reload the update to see where it stands. Nothing was merged.';

export interface EndpointFailureEntry {
  /** What the spec mocks to produce the failure. */
  readonly mockedFailure: string;
  /**
   * The §3.11 string the surface must render — or, for /api/passage, both
   * call-site behaviors (the spec drives the UI to each).
   */
  readonly expectedCopyOrToast: string | { readonly focusedCard: string; readonly rescuePreview: string };
}

export const ENDPOINT_FAILURES: Readonly<Record<string, EndpointFailureEntry>> = {
  apiMeta: {
    mockedFailure: 'GET /api/meta 500 at boot',
    expectedCopyOrToast: FALLBACK_LOAD, // once, as a toast (boot fetch)
  },
  apiConcepts: {
    mockedFailure: 'GET /api/concepts 500 at boot',
    expectedCopyOrToast: FALLBACK_LOAD, // once, as a toast (boot fetch)
  },
  apiHealth: {
    mockedFailure: 'GET /api/v2/health 500 at boot',
    expectedCopyOrToast: FALLBACK_LOAD, // once, as a toast (boot fetch)
  },
  apiCases: {
    mockedFailure: 'GET /api/v2/cases 500 at boot',
    expectedCopyOrToast: FALLBACK_LOAD, // once, as a toast (boot fetch)
  },
  apiSearch: {
    mockedFailure: 'GET /api/search 500 on submit',
    expectedCopyOrToast: SEARCH_ERROR, // inline error box + Retry button
  },
  apiPassage: {
    mockedFailure: 'GET /api/passage 500 (both call sites driven)',
    expectedCopyOrToast: {
      // §3.11: the focused-card verse fetch keeps the §3.1 excerpt
      // rendering — no error state renders.
      focusedCard: NOTHING_RENDERS,
      // §3.1 resolution-timing branch: the retry sentence with Confirm
      // disabled inside the rescue preview layer.
      rescuePreview: SEARCH_ERROR,
    },
  },
  apiContext: {
    mockedFailure: 'GET /api/v2/context 500 with the rail Context tab open',
    expectedCopyOrToast: FALLBACK_LOAD, // inline, in the rail section
  },
  apiCaseCreate: {
    mockedFailure: 'POST /api/v2/cases 500 on the lazy first-vote create',
    expectedCopyOrToast: FALLBACK_POST, // unnamed POST failure toast
  },
  apiCase: {
    mockedFailure: 'GET /api/v2/cases/:uuid 500 at case open',
    expectedCopyOrToast: FALLBACK_LOAD, // once, as a toast (case-open fetch)
  },
  apiCaseState: {
    mockedFailure: 'POST /api/v2/cases/:uuid/state 500 after the first vote',
    expectedCopyOrToast: NOTHING_RENDERS, // bookkeeping — §4.3 ignores and logs
  },
  apiJudgments: {
    mockedFailure: 'GET /api/v2/judgments?caseId 500 at case open',
    expectedCopyOrToast: FALLBACK_LOAD, // once, as a toast (case-open fetch)
  },
  apiJudgmentSubmit: {
    mockedFailure: 'POST /api/v2/judgments 500 on a verdict',
    expectedCopyOrToast: FALLBACK_POST, // unnamed POST failure toast
  },
  apiInbox: {
    mockedFailure: 'GET /api/v2/inbox 500 at boot',
    expectedCopyOrToast: FALLBACK_LOAD, // inline, in the rail section
  },
  apiCandidates: {
    mockedFailure: 'GET /api/v2/candidates 500 on opening Compare',
    expectedCopyOrToast: FALLBACK_LOAD, // inline, on the Compare screen
  },
  apiBlindSessionStart: {
    mockedFailure: 'POST …/blind-sessions 500 on Start the blind review',
    expectedCopyOrToast: FALLBACK_LOAD, // the Compare screen's failed state
  },
  apiBlindPassage: {
    mockedFailure: 'GET …/passages 500 on selecting a verse',
    expectedCopyOrToast: FALLBACK_LOAD, // inline, in the shared panel
  },
  apiBlindJudgment: {
    mockedFailure: 'POST …/judgments 500 on the confirm',
    expectedCopyOrToast: FALLBACK_POST, // unnamed POST failure toast
  },
  apiCompilePreview: {
    mockedFailure: 'POST /api/v2/compile/preview 500 on opening Finish up',
    expectedCopyOrToast: FALLBACK_LOAD, // inline, on the Finish-up screen
  },
  apiCompileApply: {
    mockedFailure: 'POST /api/v2/compile/apply 500 on signing',
    expectedCopyOrToast: FALLBACK_POST, // unnamed POST failure toast
  },
  apiUpdates: {
    mockedFailure: 'GET /api/v2/updates 500 on opening Updates',
    expectedCopyOrToast: UPDATES_LOAD_FAILED, // inline, on the Updates screen (§4.9)
  },
  apiUpdatesDecide: {
    mockedFailure: 'POST /api/v2/updates/cards/:id/decide 500 on Approve',
    expectedCopyOrToast: UPDATES_DECIDE_FAILED, // toast (§4.9's decide sentence)
  },
  apiTrainSeal: {
    mockedFailure: 'POST /api/v2/updates/train 500 on Start the update',
    expectedCopyOrToast: TRAIN_SEAL_FAILED, // inline, in the update panel (§4.9)
  },
  apiTrain: {
    mockedFailure: 'GET /api/v2/updates/train/:id 500 with a sealed train',
    expectedCopyOrToast: TRAIN_PROGRESS_FAILED, // inline, in the update panel (§4.9)
  },
  apiAdmission: {
    mockedFailure: 'GET /api/v2/admissions/:id 500 on Approve this update',
    expectedCopyOrToast: TRAIN_DETAIL_FAILED, // inline, in the update panel
  },
  apiAdmissionAdmit: {
    mockedFailure: 'POST /api/v2/admissions/:id/admit 500 on the confirm',
    expectedCopyOrToast: TRAIN_ADMIT_FAILED, // inline (§4.9's admit sentence)
  },
  apiPublishPrepare: {
    mockedFailure: 'POST /api/v2/publish/:id/prepare 500 after the admit',
    expectedCopyOrToast: TRAIN_PREPARE_FAILED, // inline, in the update panel
  },
};
