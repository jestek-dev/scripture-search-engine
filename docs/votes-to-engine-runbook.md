# Votes-to-engine runbook — one full cycle, cold start

**Plan:** `docs/plans/2026-08-27-votes-to-engine-plan.md` (2026-08-27) — this
runbook is that plan's D20 deliverable and assumes its Phases 0–4 are on the
branch you are running.
**Handoff:** linked from `project-handoff/HANDOFF.md` §Release runbook's
sibling list. A successor should read HANDOFF first for repository state,
then run a cycle from this page alone.
**Covenants that bind every step** (`CLAUDE.md`): no AI at runtime; the
engine's ordering is deterministic and sacred in the UI; stores are
append-only; nothing merges to `main` except a human. The workbench prepares
a draft PR at most — merging is Jesse's hand, always.

## 0. Cold start — from a fresh clone to a running workbench

Every command runs at the repository root. Node 22+ and git are the only
tools assumed.

```
npm install
npm run build:engine
npm run gauntlet:report
npm run serve --workspace workbench
```

- `npm run build:engine` compiles the engine package the workbench serves.
- `npm run gauntlet:report` writes `eval/.runs/gauntlet-report.json` — the
  signing surface reads it; skip only if it already exists and is fresh.
  Note: while the standing J39 baseline-approval hold is unpaid the command
  exits 1 (`--require-admit` honestly reports the hold), but the machine
  report is still written and the workbench serves normally — that red is
  the recorded governance debt, not a broken clone.
- `npm run serve --workspace workbench` starts The Study at
  `http://localhost:8787` (port: `WORKBENCH_PORT`). It serves the artifact
  the repository's descriptor names; if the local database is missing, fetch
  it first with `npm run fetch-artifact --workspace workbench`.
- **Known condition on today's tree** (HANDOFF, Known defects #1): the
  committed descriptor is the stale v0.7.1-era phantom that matches no
  published asset, so `fetch-artifact` refuses ("The release asset does not
  match the committed descriptor. Do not serve it.") and the server starts
  in **degraded read-only mode**, printing exactly why. The page still
  serves; artifact-backed endpoints answer the plain artifact-unavailable
  sentence. This clears when the next mint's descriptor PR lands (HANDOFF's
  Release runbook) — it is inherited repository state, not part of this
  loop.

Environment knobs the cycle may need (all optional):

| Variable | Meaning |
| --- | --- |
| `WORKBENCH_REVIEWER` | The reviewer name recorded on every appended event (default `jesse`). |
| `WORKBENCH_INDEPENDENT_SIGNER` | The named independent signer for DATA trains. Unset, every data train holds honestly at frozen-awaiting-signer (governance call 4 — the freeze stands until a signer is named). |
| `WORKBENCH_PORT` | HTTP port (default 8787). |

## 1. The cycle at a glance

```
Review (vote) → Updates (decide cards) → Start the update (seal)
  → checks / stages run → [data lane: Update Report → sign]
  → draft PR → HUMAN MERGE on GitHub → observed live → metrics
```

Every reviewer step is a Study screen; every implementer step is one exact
command. Nothing in the loop asks the reviewer to re-approve a meaning they
already voted.

## 2. Reviewer steps — each one a Study screen

### 2.1 Review — cast the votes

Open **Review** (the `/` search screen). Search, move with `J`/`K`, judge
with one key: `E` essential, `H` helpful, `X` not relevant (pick the plain
reason it asks for), `M` record a missing passage. Submit review. Votes
append to `workbench/judgments.jsonl` with the exact artifact identity and
displayed window pinned; cases append to `workbench/cases.jsonl`. Nothing
else happens yet — a vote never edits data by itself.

### 2.2 Updates — one decision per card

Open **Updates**. Every effective vote arrives as a derived card (the
deriver runs on each GET — cards are content-addressed, never stored):

- **Approve** stages the card for the next update. **Decline** requires the
  one-line why. **Not now** parks it.
- A **Take a fresh look** card re-opens the search in Review (legacy or
  materially-changed votes — nothing derives until the fresh call).
- A **conflict** card asks which call stands; a **needs-engineering** card
  says nothing rides the normal path and carries the write-up.
- Cards whose votes were cast under an older engine/data state carry the
  seal-time replay's note: already achieved (guarded), re-checked and
  unchanged, or back for a fresh look. This is the normal path, not an edge
  case.
- The steady-state metrics strip renders here once an update has gone live:
  cycles completed, calls still waiting on a card, and the measured
  vote→live time (median of real timestamps; when no timestamp exists the
  line honestly does not render).

Decisions append to `workbench/updates.jsonl`. The old printed checklist and
its backlog are retired (Phase 4 D18) — the cards are the only surface.

### 2.3 Start the update — seal a train

Still on **Updates**: the update panel lists what the approved cards add up
to, in plain words, with the honest-timing sentence. Confirm → **seal**. The
seal re-derives, replays staleness against the served artifact, pins the
derivation digest, and freezes the boarding cards.

- **Guard trains** (fixtures only) go straight to ready and run the checks.
- **Data trains** chain the three stages automatically (the server runs them
  as jobs after the seal). Should a stage need re-running by hand, the exact
  commands are, at the repository root, in order:

```
npm run train:build
npm run train:measure
npm run train:gauntlet
```

  Each command locates the current train from repository state itself — the
  single argv token is the stage name; there is nothing else to pass
  (control-plane rule: no free-form command crosses the HTTP boundary).

### 2.4 Data lane only — read the report, sign

The **Update Report** renders when measurement is done: every changed
search, before/after, in plain words. Signing is a deliberate act: read the
report, type the short code it shows, sign. An unnamed signer or unpaid
historic sign-off freezes the queue with its own sentence on screen —
that hold is correct behavior, not an error.

### 2.5 The draft PR and the human merge

The train prepares a branch and opens a **draft PR** (the panel shows the
link). The workbench's authority ends here, by covenant. Jesse (or the
successor with merge rights) reviews the PR and merges by hand — the merge
IS the admission event.

### 2.6 Live — and what a stop looks like

Back on **Updates**, the panel observes the merge from git history and shows
**live** with the receipt (changed searches as chips). The metrics strip
counts the cycle.

If anything stops the train, the panel shows the stop's own plain sentence
plus exactly one **Next step:** line — all 14 stop reasons carry one; none
falls through to a generic message. A stalled draft PR is re-checked on
every view: if `main` moved past the train's base, the train stops
(`main-moved` behavior) rather than waiting to merge stale; starting again
rebuilds with the approvals intact.

### 2.7 Finish up — the per-sitting answer-sheet write

Open **Finish up** to write the day's fixture plan into the working tree:
it previews the exact files, and applies only under the preview's own
digest. This is the ONLY compile write path. The old one-breath
`npm run compile-judgments` CLI is a tombstone: it refuses every invocation
and points back here.

## 3. Implementer paths — exact commands

| Purpose | Command (repository root) |
| --- | --- |
| Serve The Study | `npm run serve --workspace workbench` |
| Fetch the published artifact | `npm run fetch-artifact --workspace workbench` |
| Full verification (build + typecheck + tests + gauntlet) | `npm run verify` |
| Gauntlet with admission gate + machine report | `npm run gauntlet:report` |
| Train stages by hand (data lane, in order) | `npm run train:build` · `npm run train:measure` · `npm run train:gauntlet` |
| Workbench unit tests | `npm run test --workspace workbench` |
| Workbench browser specs | `npm run test:browser --workspace workbench` |
| Retired (refuses, exit 1) | `npm run compile-judgments --workspace workbench` |

## 4. Multi-voter readiness (D17a — named, deliberately not built)

Before any SECOND voter ever exists, land the one-line
`workbench/src/judgments.ts` tightening the plan's D17a names: supersession
validation today matches query, case, and target key but not reviewer
(`matchingSupersessionTarget`, judgments.ts:439-441). The rule to add then:
a plain correction must share the prior judgment's `reviewer`; a cross-voter
supersession is valid only as the recorded resolution of a conflict card
(plan §02.4 rule 4). Unreachable under single-reviewer operation, so it is
not built now — multi-voter identity is the successor-governance plan's
territory — but it must not be lost when that plan lands.

## 5. Copy inventory — every minted string, for one review

Everything a reviewer reads is either **plan-fixed** (the plan's own
sentence, shipped verbatim) or **minted** during Phases 2–4 and listed here
for the one copy review D20 requires. UI strings live in the `COPY` block of
`workbench/static/index.html`; server-sentenced strings have exactly one
writer in the named module and reach the page as data.

Plan-fixed (verbatim, already reviewed with the plan): the §04 Updates-card
copy, §4.6's sign/merge covenant sentence, §06.2's fourteen stop sentences
(`COPY.trainStopReasons`), FM-2's unresolvable-reference sentence
(`REPLAY_UNRESOLVED_REFERENCE_NOTE`, deriveUpdates.ts), FM-8's
unpaid-marker seal refusal (`UNPAID_MARKER_SEAL_REFUSAL`, trainRunner.ts),
and §4.3's auto-resolve receipt — "Already achieved — your call for
'{query}' is now true in search, so this update just pins it in the answer
sheet." (`replayAlreadyAchievedReceipt`, deriveUpdates.ts; the update panel
renders it verbatim as the one-line receipt for a disposition-1 card, which
never renders as a to-do).

Minted — Phase 2/3 (recorded at the time in the build log's P3-4 entry):

| String(s) | Writer |
| --- | --- |
| `trainStepBuilt`, `trainStepMeasured`, `trainBuiltLine`, `trainMeasuredLine`, `trainReadyLine`, `trainSignTitle`, `trainSignButton`, `trainSignRunning`, `trainCompareBlind`, `trainSignFailed` | `COPY`, index.html |
| `trainParkedOutcome`, `trainParkedTried` | `COPY`, index.html |
| `SIGNING_HOLD_NO_SIGNER`, `SIGNING_HOLD_DEBT_STANDS`, `TRAIN_SIGN_RATIONALE` | trainRunner.ts |
| Data Update Report section labels | dataUpdateReport.ts |

Minted — Phase 4:

| String(s) | Writer |
| --- | --- |
| The fourteen `Next step:` lines (`COPY.trainStopNextActions`) | `COPY`, index.html |
| Replay notes: `REPLAY_RECONFIRMED_NOTE`, `REPLAY_OFFENDER_GONE_NOTE`, `REPLAY_CHANGED_NOTE` (the disposition-1 receipt is plan-fixed §4.3 copy, listed above — not minted) | deriveUpdates.ts |
| Metrics strip: `updatesMetricCycles`, `updatesMetricAwaiting`, `updatesMetricMedian` + the plain-duration words (`plainDuration`) | `COPY` / index.html |
| The compile tombstone refusal (`COMPILE_JUDGMENTS_RETIRED`) | compileJudgments.ts |

Rendered-screen rule (D28): no raw enum token, digest, UUID, or `sha256`
ever renders — the browser specs assert the two jargon regexes match
nothing on the Updates screen.

## 6. Metrics — what the numbers mean

All three figures on the Updates strip derive from data the loop already
keeps — `workbench/updates.jsonl` decisions, the observed train states, and
git commit times. No telemetry is collected.

- **Cycles completed** — sealed trains observed merged on `main`.
- **Calls waiting on a card** — distinct votes whose card still awaits a
  decision.
- **Vote→live time** — median over each landed vote's own timestamp to the
  git committer time its train's content first appeared on `main`. When no
  landed vote carries a timestamp, the line does not render — measured or
  absent, never invented.

## 7. If something looks wrong

- **A stopped train**: read its sentence and its one `Next step:` line —
  that line is the recovery path; there is always exactly one.
- **A frozen data queue**: the freeze sentences mean governance, not
  breakage — name a signer (`WORKBENCH_INDEPENDENT_SIGNER`) or land the
  historic sign-off, per governance call 4.
- **`compile-judgments` refuses**: correct — see §2.7.
- **Nothing derives**: the Updates screen's failure line names which data
  source failed; the deriver refuses loudly rather than guessing
  (`updates_underivable` is always accompanied by the exact reason).
