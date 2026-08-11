# Workbench Refinement Studio v1.5-v2.5 - implementation plan

**Date:** 2026-08-11  
**Status:** Proposed implementation plan  
**Supersedes:** Nothing. `docs/workbench-implementation-plan.md` remains the
historical and behavioral contract for v1.  
**Scope:** Close the loop from human observation to a reviewed, measured,
mergeable improvement without introducing runtime AI, hidden learning, or an
alternate ranking system.

---

## 0. Outcome

The finished Refinement Studio should let a reviewer answer questions about
meaning in plain language while the system handles the repository mechanics:

1. Bring forward searches that deserve attention.
2. Record what is essential, helpful, irrelevant, or missing.
3. Convert those judgments into pending regression expectations.
4. Propose the smallest defensible ontology adjustment.
5. Build an isolated candidate and compare it with the reviewed artifact.
6. Show every measured improvement and regression.
7. Prepare a reviewable branch and draft PR after explicit approval.
8. Feed post-release outcomes back into the next review cycle.

The human judges meaning and provenance. The system performs deterministic
translation, validation, comparison, and repository preparation.

```text
manual search / failed gate / telemetry gap
                    |
                    v
              review inbox
                    |
                    v
        essential / helpful / irrelevant / missing
                    |
                    v
       pending fixture + proposed minimal adjustment
                    |
                    v
         isolated candidate artifact and comparison
                    |
                    v
             gauntlet + human approval
                    |
                    v
               branch + draft PR
                    |
                    v
           merge / release / future audit
```

This is not an online learning system. Nothing observed in usage changes a
score, concept, artifact, release, or consumer until a human admits a source
diff through the existing gauntlet and PR process.

## 1. Current state and measured starting point

Workbench v1 already provides four strong foundations:

- It serves only the full artifact whose sha256 matches the committed release
  descriptor.
- It exposes the engine's real result order, reasons, provenance, caps, and
  three identities.
- It records append-only judgments stamped by the server with the artifact
  identity being judged.
- It compiles selected judgments into pending G3 fixtures and proposes missing
  fixture-corpus chapters.

The loop currently stops before adjustment. `compileJudgments.ts` prints a
manual ontology checklist, and the reviewer must leave the workbench to edit
YAML, rebuild data, compare results, interpret the gauntlet, and prepare a PR.
There is no inbox, judgment history view, candidate artifact, before/after
comparison, or integrated health report.

Record this baseline at the beginning of implementation rather than copying
counts into code. As of this plan's date, the repository has:

- 59 concept YAML files;
- 68 active corpus golden fixture files;
- 3 judgment records, all for `Who is like the Lord?`;
- 0 fixtures marked `generatedBy: "workbench"`;
- a merged `main` whose unit tests pass but whose admission gauntlet reports
  corpus expectations, concept coverage, collision, and noise-probe failures.

The first milestone is therefore health visibility and baseline repair. A UI
that can create more proposals while the current artifact is already rejected
would make the queue larger without making the system more trustworthy.

## 2. Non-negotiables

All rules in `CLAUDE.md` and the v1 workbench plan continue to apply. The
following refinements make their consequences explicit for v1.5-v2.5.

### 2.1 Runtime and determinism

- No AI runs in the shipped engine or consumer applications.
- AI may draft a proposal offline, but an AI-authored proposal is visibly
  marked, carries no special authority, and cannot bypass human approval.
- The same artifact identities and query must always produce the same order.
- Any accepted code change that can alter ordering requires an
  `ENGINE_VERSION` bump. Ontology-only candidates change the layer fingerprint.
- The workbench never becomes a second scoring layer. It may create fixtures
  and source proposals, but it may not store per-query boosts or suppressions
  that the fingerprinted engine does not own.

### 2.2 Human authority

- Human labels are evidence, not immediate mutations.
- A new fixture starts pending. A human promotes it only after it passes.
- A theological anchor, concept relationship, or editorial phrase requires a
  named provenance and a text-grounded reason.
- Baseline changes require a separate explicit approval. They are never an
  incidental side effect of applying a proposal.
- The studio may prepare a branch and draft PR. It never merges a PR, publishes
  a package, creates a release, or updates consumer pins automatically.

### 2.3 Repository and artifact safety

- The reviewed artifact remains read-only.
- Candidate work lives under ignored `workbench/.state/` directories or an
  isolated git worktree, never in the reviewed artifact directory.
- The server must still start in a degraded read-only mode when the reviewed
  artifact is missing, the descriptor hash mismatches, or the static snapshot
  is stale. In that state it may expose health and static diagnostics, but it
  may not accept review or apply operations.
- Every endpoint that can write has a preview operation and an explicit apply
  operation. A GET request never mutates state.
- Server commands come from a fixed allowlist. No endpoint accepts a shell
  command or arbitrary path from the browser.
- Candidate source paths are resolved and verified to remain within their
  candidate root before any write.
- Existing user changes in the primary worktree are never overwritten. PR
  preparation uses an isolated worktree and refuses ambiguous repository state.

### 2.4 Privacy

- v2.5 accepts only schema-valid privacy distillates, never raw search logs.
- Sensitive-category filtering and k-threshold suppression happen before a
  query can enter the review inbox.
- Audit imports are temporary and are deleted when the audit closes. Only the
  already-approved master analyzed record and resulting review cases persist.
- Device identifiers, sessions, raw event chains, and below-threshold queries
  never appear in workbench state, logs, screenshots, fixtures, or PRs.

## 3. Product model

The UI should expose five concepts and hide internal engine vocabulary unless
the reviewer deliberately opens technical details.

### 3.1 Review case

A review case is one question the system is trying to resolve. It contains a
query, source, artifact identity, supporting evidence, judgments, and current
state.

Case states:

```text
new -> reviewing -> judged -> proposed -> candidate-ready
    -> admitted -> pr-prepared -> merged -> monitored
                         \-> rejected
                         \-> needs-engineering
```

`rejected` means the proposed adjustment was measured and should not ship.
`needs-engineering` means the evidence points to tokenizer, ranking, or engine
behavior rather than a safe ontology edit. Neither is a failure of the loop.

Sources:

- `manual`: typed directly into the workbench;
- `gauntlet`: generated from a current gate finding;
- `coverage`: concept missing adequate human measurement;
- `stale-judgment`: prior judgment made under changed layers or corpus;
- `telemetry`: above-threshold gap from the privacy-safe miner;
- `calibration`: stable human benchmark session;
- `regression`: query changed in a candidate comparison.

### 3.2 Plain-language judgment

The primary actions are:

| UI action | Meaning | Fixture effect |
|---|---|---|
| **Essential** | This passage belongs near the top for this query. | `expectedTop`, with a reviewed top-k expectation. |
| **Helpful** | This is a good result; exact rank is not important. | Log-only evidence by default. |
| **Not relevant** | This passage should not be near the top for this query. | `mustNotRank`, after the existing guided diagnosis. |
| **Missing passage** | An important passage did not surface. | Pending `expectedTop`. |
| **Prefer A** | A is more useful than B for this query. | Pairwise expectation after G3 supports it. |

Each Essential or Missing judgment carries its own rank window. The interface
defaults those actions to `withinTop: 5`, and reviewers may choose 1, 3, 5, or
10 from a compact control when the distinction matters. The compiled fixture
model must therefore support mixed windows inside one query, such as one
reference expected within top 1 and another expected within top 10. The
control is described as desired placement, not as a search-engine metric.

The existing v1 actions remain backward compatible:

- `fits` with `pin: true` maps to Essential within top 10;
- plain `fits` maps to Helpful;
- `doesnt-fit` maps to Not relevant;
- `missing` maps to Missing passage.

### 3.3 Proposal

A proposal is a deterministic, reviewable set of constrained source
operations connected to one or more cases. Initial operation types are:

- add a lexicon phrase to an existing concept;
- remove a lexicon phrase from an existing concept;
- add an editorial anchor with weight and locator;
- remove an editorial anchor;
- adjust an editorial anchor's range or weight;
- add or remove a related-concept edge;
- create a concept draft;
- merge two concept drafts into one reviewed concept;
- add or update a golden fixture;
- add a chapter to the fixture corpus selection.

OpenBible, Torrey, translation-variant, cross-reference, and exposition-derived
rows are not edited as if they were editorial rows. Their proposals must route
to the source importer or source snapshot that owns them.

Tokenizer, ranking, budget, schema, and engine-code changes are deliberately
outside automatic proposal application. Cases that point there are grouped as
`needs-engineering` and become an engineering brief with reproducing fixtures.

### 3.4 Candidate

A candidate is an immutable build record containing:

- proposal id and exact proposal digest;
- base engine, corpus, and layer identities;
- source snapshot digest and base commit;
- candidate layer fingerprint;
- paths to the isolated candidate database and descriptor;
- build timestamps and command outcomes;
- current-versus-candidate query comparison;
- gauntlet report and machine-readable gate results;
- explicit baseline-diff state;
- reviewer admission decision.

Changing a proposal creates a new candidate id. Existing candidate results are
never silently refreshed under the same id.

### 3.5 Review session

A session is a bounded set of cases selected for one purpose:

- weekly inbox triage;
- candidate regression review;
- monthly calibration;
- blind current-versus-candidate comparison;
- stale-judgment reconfirmation.

Sessions are resumable. Their ordering and sampling seed are recorded so the
same session can be reproduced.

## 4. Storage and schemas

### 4.1 Append-only judgment evolution

Keep `workbench/judgments.jsonl` as the canonical human judgment history. Add
v2 fields without rewriting v1 lines:

```ts
interface JudgmentRecordV2 extends JudgmentIdentity {
  schemaVersion: 2;
  judgmentId: string;
  caseId: string;
  at: string;
  reviewer: string;
  query: string;
  action: 'essential' | 'helpful' | 'irrelevant' | 'missing' | 'prefer';
  targetId?: string;
  reference?: string;
  withinTop?: 1 | 3 | 5 | 10;
  observedRank?: number | null;
  observedWindow: number;
  resultSetDigest: string;
  reasonDigest?: string;
  displayedWindowDigest: string;
  preferredTargetId?: string;
  otherTargetId?: string;
  diagnosis?: 'wrong-anchor' | 'concept-misfire' | 'lexical-noise';
  diagnosisInferred?: true;
  conceptId?: string;
  note?: string;
  excerpt?: string;
  source: ReviewCaseSource;
  supersedes?: string;
}
```

Use `crypto.randomUUID()` for ids. The compiler parses both schemas into one
internal model. A correction appends a v2 line whose `supersedes` names the
prior judgment. It never edits or deletes history.

The server validates that:

- the superseded id exists and belongs to the same query/case target;
- no active judgment already supersedes that id;
- pairwise targets are distinct and came from the judged result set;
- `withinTop` is present only for Essential and Missing;
- `observedRank`, `resultSetDigest`, `displayedWindowDigest`, and any
  `reasonDigest` describe exactly what the reviewer saw when the judgment was
  submitted;
- diagnosis and text-grounded-note rules remain equivalent to v1;
- all identities are stamped by the server.

When judgments compile into fixtures, each expected reference keeps its own
window:

```json
{
  "expectedTop": [
    { "ref": "Jeremiah 29:11", "withinTop": 1 },
    { "ref": "Romans 15:13", "withinTop": 10 }
  ]
}
```

### 4.2 Case event log

Add `workbench/cases.jsonl`, also append-only and committed. Events include:

```ts
type CaseEvent =
  | CaseCreated
  | CaseAssignedToSession
  | CaseStateChanged
  | ProposalLinked
  | CandidateLinked
  | AdmissionRecorded
  | PullRequestLinked;
```

Every event has `eventId`, `caseId`, `at`, `reviewer`, and a schema version.
For new v2 events, `eventId` is immutable and `parentEventId` plus a
monotonic `sequence` make the causal order explicit. Case state is derived by
folding the validated parent/sequence chain, not by trusting raw file order.
Invalid transitions or broken parentage fail validation rather than being
ignored.

Legacy v1 judgments and their derived case/events are mapped through a checked
in deterministic migration manifest, for example
`workbench/legacy/migration-manifest.json`, that records the stable derived
case id, event ids, and parent ordering for each legacy record. New machines
must derive the same ids from that manifest rather than from line-number-only
heuristics.

Queries imported from the telemetry master record store only the approved
aggregate evidence: device count, outcome class, converted-rank summary, audit
id, and master-record key. They do not copy the audit dump.

### 4.3 Proposals and candidates

Store editable proposal manifests under ignored local state until admitted:

```text
workbench/.state/
  proposals/<proposal-id>/proposal.json
  candidates/<candidate-id>/
    content.db
    descriptor.json
    comparison.json
    gauntlet.json
    report.md
  jobs/<job-id>.json
  journals/<operation-id>.json
  imports/<audit-id>/
  worktrees/<proposal-id>/
```

An admitted proposal writes a deterministic decision manifest to
`workbench/admissions/<yyyy-mm-dd>-<slug>.json`. It records the case ids,
judgment ids, accepted operations, candidate identities, gate verdicts,
baseline decision, reviewer, and base commit. Later case events may link the
prepared branch, commit, and PR without creating an impossible commit that
contains its own hash. The manifest does not duplicate the complete artifact
or query results.

The machine-readable gauntlet report is versioned and identity-bound. At
minimum it records: schema version, start and end timestamps, base commit,
dirty-tree digest, descriptor hash, the engine/corpus/layer identity triple,
budgets digest, fixture-input digest, invoked flags, normalized findings, and
the final report digest. Health fails closed if any of those identities are
missing or do not match the current repository/artifact state.

Add `workbench/.state/` to `.gitignore`. Keep the existing
`workbench/.artifact/` location for the reviewed base artifact.

### 4.4 Human benchmark sets

Add:

```text
eval/human/
  calibration.json
  holdout.json
```

Each entry contains query, expected essential/helpful/irrelevant references,
provenance of the human decision, sensitivity category, and last review
identity. Calibration entries may guide proposal creation. Holdout entries are
excluded from proposal generation and are used only in comparison/admission.

Do not collapse the benchmark into one quality score. Report the individual
rates and distributions in section 12.

## 5. Server and UI architecture

Keep the workbench local-only and private. Continue using Node's built-in HTTP
server. The single HTML file has reached the point where further behavior
would be risky, so v1.5 splits static assets without adding a bundler:

```text
workbench/static/
  index.html
  styles.css
  app.js
  api.js
  views/
    health.js
    inbox.js
    review.js
    history.js
    candidate.js
    admission.js
```

Use native ES modules and browser APIs. Keep all interpolated content in
`textContent`; do not introduce HTML-string rendering for query or verse text.
Serve those assets through a safe snapshot resolver that reads from a committed
static manifest rooted at `workbench/static/`, refuses path traversal, and
fails health when the HTML-to-module snapshot is incomplete or mismatched.

The primary views are:

1. **Health:** current identities, release alignment, gate status, coverage,
   pending/stale counts, and blocked work.
2. **Inbox:** filterable review cases ordered by transparent priority.
3. **Review:** query results, passage context, four plain-language actions,
   missing-passage picker, and optional pairwise comparison.
4. **History:** effective and superseded judgments with reconfirm/correct
   actions.
5. **Candidate:** current and candidate results, changed reasons, affected
   queries, and blind comparison mode.
6. **Admission:** proposal diff, provenance, checks, baseline decision, and
   branch/PR preparation.

The default first screen is Health when the repository is rejected or stale,
otherwise Inbox. The search box remains globally available; the studio should
still be useful for spontaneous exploration.

### 5.1 API shape

Only `/api/v2/*` responses use a small envelope:

```ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };
```

Keep `/api/search` and `/api/passage` backward compatible through v1.5.
Add versioned routes where behavior is new:

```text
GET  /api/v2/health
GET  /api/v2/cases
POST /api/v2/cases
GET  /api/v2/cases/:id
POST /api/v2/judgments
GET  /api/v2/judgments?caseId=
POST /api/v2/compile/preview
POST /api/v2/compile/apply
POST /api/v2/checks
GET  /api/v2/jobs/:id
GET  /api/v2/jobs/:id/events

POST /api/v2/proposals
GET  /api/v2/proposals/:id
POST /api/v2/proposals/:id/validate
POST /api/v2/candidates
GET  /api/v2/candidates/:id
GET  /api/v2/candidates/:id/compare
POST /api/v2/candidates/:id/admission

POST /api/v2/imports/telemetry/preview
POST /api/v2/imports/telemetry/apply
POST /api/v2/sessions
GET  /api/v2/sessions/:id
POST /api/v2/publish/preview
POST /api/v2/publish/prepare
```

Long-running builds and checks return a job id immediately. Progress is
delivered by server-sent events, with polling as a fallback. Only one mutating
job may run at a time; read-only searches and comparisons remain available.
`GET /api/v2/health` remains GET-only and read-only in every server mode,
including degraded startup.

### 5.2 Preview/apply contract

Every mutating operation follows the same contract:

1. Preview validates inputs and returns the exact planned files or records.
2. The client displays the plan and receives a short-lived digest.
3. Apply sends that digest.
4. The server recomputes the plan and rejects if the digest has changed.
5. The operation writes through a journal with intent, file preconditions,
   staged outputs, commit marker, and recovery marker.
6. The operation commits atomically, then returns paths and resulting hashes.
7. On restart, recovery either completes the journaled operation idempotently
   or rolls it back to the precondition-verified state.

This prevents a stale browser from approving a plan that changed on disk.

### 5.3 Roadmap at a glance

| Version | Milestones | Depends on | Shippable outcome |
|---|---|---|---|
| v1.5 | 1-5 | Workbench v1 and a healthy main | Review cases, human-friendly judgments, fixture preview/apply, and visible checks |
| v2.0 | 6-10 | v1.5 | Constrained ontology proposals, isolated candidates, blast-radius comparison, and local admission |
| v2.5 | 11-15 | v2.0 plus consumer telemetry exports for the telemetry path | Privacy-safe gap intake, recurring calibration, and verified draft-PR preparation |

Milestones are ordered dependencies. Each must merge with its own passing
acceptance checks before work that relies on it begins. Telemetry-independent
parts of v2.5 may be developed with synthetic distillates, but the v2.5 release
gate requires one real privacy-safe audit.

## 6. Workbench v1.5 - visible and usable refinement

v1.5 closes the existing judgment-to-fixture workflow and makes repository
health visible. It does not generate or apply ontology changes.

### Milestone 1 - establish and repair the health baseline

**Implementation**

- Add a machine-readable gauntlet output mode, `--json <path>`, while
  preserving the existing human report.
- Add `--require-admit`, which exits non-zero unless the final verdict is
  exactly ADMIT. Zero exit from a warning or degraded run is not sufficient for
  release or health green.
- Give every gate finding a stable code, gate id, title, message, subjects,
  verdict, metrics object, and compatibility policy. Codes are namespaced, for
  example `G8.query-churn`, with immutable meaning and additive parameters
  until a major schema bump.
- Add a read-only health aggregator in `workbench/src/health.ts` that inspects:
  descriptor/release identity, current artifact identity, golden status,
  concept coverage, judgment staleness, latest gauntlet output, and git branch
  state.
- Bind the server even when the reviewed artifact is unavailable. In degraded
  read-only mode, expose health plus startup diagnostics instead of exiting
  before the port opens.
- Make the gauntlet JSON identity-bound with schema version, base commit,
  dirty-tree digest, descriptor hash, engine/corpus/layer identities, budgets
  digest, fixture-input digest, flags, timestamps, normalized findings, and a
  final report digest. Health must fail closed when the report is stale,
  partial, or mismatched.
- Resolve the current merged-main gauntlet failures as a separate, reviewable
  prerequisite change. Do not weaken budgets to make the dashboard green.
- Record a checked-in health snapshot fixture for workbench tests, not a live
  generated report from the developer's machine.

**Acceptance**

- `npm run verify -- --require-admit` returns ADMIT before feature work
  proceeds beyond this milestone.
- `GET /api/v2/health` distinguishes healthy, rejected, stale, running, and
  unavailable states and works in degraded read-only startup.
- An unavailable gate is shown as unavailable with its reason, never as pass.
- Health aggregation is deterministic for fixed inputs, covered by tests, and
  validated on Windows and Linux.

### Milestone 2 - introduce cases and v2 judgments

**Implementation**

- Implement the v2 judgment schema and mixed v1/v2 parser.
- Add case event validation and deterministic event folding.
- Treat the existing three v1 judgments as one derived legacy case without
  rewriting their lines.
- Add Essential, Helpful, Not relevant, Missing passage, and Prefer A actions.
- Add explicit correction/reconfirmation through `supersedes`.
- Store `observedRank`, `observedWindow`, `resultSetDigest`,
  `displayedWindowDigest`, and `reasonDigest` so each judgment can prove the
  exact result set, rank, reasons, and visible window the reviewer saw.
- Compile Essential and Missing judgments into per-expectation windows rather
  than one fixture-level `expectedWithinTop`.
- Extend G3 fixture support with optional pairwise expectations:

  ```json
  {
    "preferredOrder": [
      { "above": "Romans 5:3-5", "below": "Jeremiah 29:11" }
    ]
  }
  ```

- Validate pairwise ranges with the same canonical reference parser used by
  corpus fixtures.

**Acceptance**

- Existing v1 logs compile byte-identically to their current output.
- Every v2 action has positive, malformed, and supersession tests.
- A superseded judgment remains visible but no longer affects fixtures.
- Mixed-window fixtures, such as top-1 plus top-10 expectations for the same
  query, compile and verify deterministically.
- Pairwise fixtures fail only when both references are present in the measured
  window and their order is wrong; absence is reported separately by
  `expectedTop` when required.

### Milestone 3 - build the review inbox and history experience

**Implementation**

- Build Health, Inbox, Review, and History views.
- Generate cases from manual searches, current gate findings, uncovered
  concepts, stale judgments, and candidate regressions when those exist later.
- Rank the inbox with a visible deterministic formula. Initial ordering:
  blocking gate finding, sensitive-case review, missing/zero result, stale
  judgment, uncovered concept, then age. Never infer theological importance
  from popularity.
- Add filters for source, state, sensitivity, age, reviewer, and artifact
  identity.
- Show passage context around each result, not only one verse, while retaining
  the exact judged target id.
- Preserve keyboard and screen-reader usability for the repeated review flow.

**Acceptance**

- A reviewer can complete and correct a case without editing JSON.
- Refreshing or restarting the server preserves the effective queue and
  session position.
- Every diagnosis question remains phrased in ordinary language.
- Technical reason details are available but not required to submit a sound
  judgment.
- Mobile and desktop layouts contain no overlapping controls or clipped verse
  text.

### Milestone 4 - integrate fixture preview, apply, and checks

**Implementation**

- Refactor `compileJudgments` into a pure planning phase and an atomic apply
  phase. The CLI uses the same functions as the API.
- Preview fixture files, fixture-corpus additions, stale warnings, and the
  ontology checklist before writing.
- Add an allowlisted job runner for typecheck, unit tests, gauntlet, and full
  verify. Capture structured status and bounded log output.
- Harden the job runner with fixed command specs, explicit cwd, explicit env
  allowlist, timeout caps, process-tree cancellation, output truncation, job
  origin metadata, and credential/capability boundaries suitable for a local
  admin tool.
- Write multi-file apply operations through a journal so interrupted fixture
  writes can recover idempotently on restart.
- Surface pending fixtures that now pass and provide an explicit promotion
  action with a previewed diff.
- Refuse baseline updates from the general check action. Expose baseline review
  only in Candidate/Admission beginning in v2.0.

**Acceptance**

- CLI and API previews are byte-equivalent for the same log and repository.
- Apply rejects a stale preview digest.
- Hand-written fixtures are never overwritten.
- Failed checks leave a readable report and do not leave a running-job lock.
- Crash/restart tests prove journal recovery for partially written multi-file
  applies.
- Promotion changes only the named fixture status and is included in the next
  check run.

### Milestone 5 - v1.5 stabilization

**Implementation**

- Add endpoint contract tests and browser tests for the core review path.
- Add a startup preflight with actionable states for missing artifact, hash
  mismatch, stale static assets, unsupported log schema, and occupied port.
- Back the split static UI with a safe snapshot resolver test matrix so stale
  HTML/module combinations fail closed instead of partially rendering.
- Update the root README with one command sequence for fetch, serve, review,
  compile, and verify.
- Document recovery for interrupted apply operations and malformed local logs.
- Run one real end-to-end case from manual query through active fixture.

**v1.5 release gate**

- The repository is on an ADMIT gauntlet verdict.
- One real judgment becomes an active, passing fixture through the UI.
- No ontology file, budget, engine source, commit, or remote state can be
  changed from the v1.5 UI.
- All workbench tests pass on Windows and Linux in CI.

## 7. Workbench v2.0 - candidate adjustment and comparison

v2.0 adds constrained ontology proposals, isolated candidate builds, blast
radius analysis, blind comparison, and human admission. It does not yet ingest
real telemetry or prepare remote PRs.

### Milestone 6 - proposal schema and diagnostic router

**Implementation**

- Define a versioned proposal schema using the operation types in section 3.3.
- Add a diagnostic router that uses judgment evidence to suggest likely
  operation families:
  - Missing + concept already matched -> inspect/add anchor.
  - Missing + target already anchored -> inspect/add lexicon phrase.
  - Missing + neither exists -> extend a neighboring concept or draft a new
    one after collision review.
  - Not relevant + concept does not fit verse -> inspect/remove anchor.
  - Not relevant + query should not trigger concept -> inspect/narrow lexicon.
  - Not relevant + lexical reasons only -> `needs-engineering` unless an
    existing normalization entry clearly owns the behavior.
- Require the reviewer to select or confirm provenance for every authored
  operation.
- Load and write YAML through the `yaml` package, declared directly by the
  workbench if used there. Preserve unrelated fields and comments where the
  parser supports it; otherwise show the normalized full-file diff before
  acceptance.
- Run collision and source-ownership validation before a proposal can become a
  candidate.

**Acceptance**

- The same cases and source tree produce the same proposal suggestions and
  ordering.
- No proposal is presented as a certain fix; evidence and ambiguity are shown.
- Source-derived rows cannot be modified through an editorial operation.
- A proposal cannot validate without a fixture, case link, provenance, and
  text-grounded reason.
- Engine-level diagnoses produce an engineering brief, not a guessed ontology
  patch.

### Milestone 7 - isolated candidate layer builder

**Implementation**

- Add a supported pipeline command, `build:candidate`, rather than importing
  private pipeline internals from the workbench.
- Inputs: verified base artifact, proposal manifest, candidate output
  directory, and the complete reviewed source snapshot or source-apply patch
  set.
- Prefer a full candidate artifact build from complete candidate inputs and the
  supported pipeline boundary. If optimization is required, the only allowed
  shortcut is explicit transactional replacement of the owned ontology layer
  using complete source inputs, precomputed replacement digests, and post-build
  table/identity verification.
- Never modify `workbench/.artifact/content.db` or
  `artifacts/content-artifact.json`.
- Bind a second engine instance to the candidate database only after its
  descriptor and schema validate.
- Cache by base identities plus proposal digest. A cache hit must still verify
  candidate sha256 before use.

**Acceptance**

- Building the same candidate twice produces byte-identical logical tables,
  identical identities, and identical query ordering. SQLite file-level bytes
  need not be identical if SQLite metadata differs; the content fingerprint
  and exported table digest must be.
- An interrupted build leaves the reviewed artifact untouched and removes or
  clearly marks the incomplete candidate.
- A no-op proposal is rejected as NO MEASURABLE EFFECT before admission.
- Candidate schema and provenance checks equal the production artifact build's
  checks.

### Milestone 8 - deterministic comparison and blast radius

**Implementation**

- Define the comparison universe as:
  - all queries from linked cases;
  - all active and pending corpus fixture queries, including additional
    queries;
  - all G8 probes;
  - calibration and holdout queries;
  - queries from any affected concept's existing cases.
- Run every query against current and candidate engines in a stable order.
- Record result movement, additions/removals, score and reason changes, cap
  changes, expected-reference outcomes, and query latency.
- Classify each query as improved, unchanged, expected change, ambiguous, or
  regressed. Deterministic assertions may classify automatically; semantic
  ambiguity enters human review.
- Store complete machine-readable comparison data locally and a concise report
  suitable for the admission manifest and PR body.
- Every report and UI claim must be scoped to the declared comparison universe,
  never to every possible query.

**Acceptance**

- Comparison output is deterministic after excluding measured wall-clock
  latency fields from its digest.
- Every changed top-10 list is visible or counted; there is no sampling in the
  declared fixture/probe/case universe.
- The report distinguishes rank movement from reason/provenance movement.
- A right passage with the wrong required reason remains a regression.
- New changes outside linked cases are automatically added to the candidate
  regression review session.

### Milestone 9 - candidate and blind-comparison UI

**Implementation**

- Build the Candidate view with current/candidate columns, synchronized
  passage context, reason changes, and query-level verdicts.
- Add blind mode. Label sides A and B using a recorded random seed and conceal
  which side is current until the judgment is submitted.
- Support candidate wins, current wins, ties, and "both are wrong," with a
  missing-passage action available in the same flow.
- Keep blind judgments distinct from golden expectations. They measure
  preference first; the reviewer explicitly promotes useful outcomes into
  cases/fixtures.
- Display gate findings grouped as blocking, review required, passing, and not
  applicable.

**Acceptance**

- The A/B assignment cannot be recovered from DOM labels, route names, or
  obvious identity text before reveal.
- A session can be resumed with the same assignment and item order.
- The reviewer can inspect technical reasons after submitting without changing
  the recorded blind judgment.
- Candidate admission is disabled while any comparison-required query remains
  unreviewed or any blocking gate rejects.

### Milestone 10 - controlled source application and admission

**Implementation**

- Add proposal apply preview showing exact YAML, fixture, and selection diffs.
- Apply through structured edits with per-file precondition hashes. Reject if a
  source file changed after candidate creation.
- Perform final source apply and full verification in an isolated admission
  worktree created from the admitted base commit. The primary worktree remains
  untouched except for committed human records such as judgments, cases, and
  admissions.
- Require separate decisions for:
  - source proposal admission;
  - pending fixture promotion;
  - intentional probe baseline movement.
- For baseline movement, show every changed probe before enabling approval and
  store the reason in the admission manifest.
- Rebuild from the applied working tree and rerun full verify. Candidate-cache
  results do not substitute for this final run.
- Write the admission manifest only after the final run completes.

**v2.0 release gate**

- One real gap is judged, proposed, built, compared, admitted, applied, and
  verified entirely through the local studio except for git/PR actions.
- The accepted change improves its linked fixture and introduces no unreviewed
  top-10 changes.
- A deliberately harmful test proposal is rejected by comparison or gauntlet.
- A deliberately no-op proposal reports NO MEASURABLE EFFECT.
- The base artifact, primary worktree, and unrelated user changes remain
  untouched throughout.

## 8. Workbench v2.5 - telemetry, calibration, and PR preparation

v2.5 makes the refinement loop sustainable. It adds privacy-safe telemetry
intake, deliberate sampling, quality trend reporting, and isolated branch/PR
preparation. Human merge and release authority remain outside the workbench.

### Milestone 11 - telemetry audit import

**Implementation**

- Reuse `pipeline/src/telemetry/validate.ts`, `distill.ts`, and `mine.ts`
  through a supported pipeline CLI/API boundary.
- Accept a directory or browser-selected set of distillate files into a
  temporary import directory.
- Preview validation, schema versions, distinct audit tokens, suppressed row
  counts, sensitive-category exclusions, and the cases that would be created.
- Apply by running the miner, updating the master analyzed record, creating
  telemetry cases, and writing an audit receipt.
- Reject unreplayable telemetry rows, including rank mismatches and records
  that cannot be tied back to the approved aggregate contract. They may appear
  in the receipt as excluded counts, but they never create cases.
- Close an audit by deleting its temporary distillates and proving they no
  longer exist before marking the receipt complete.
- Never provide a "show suppressed queries" path; suppression means the data
  is not available to the reviewer.

**Acceptance**

- Mixed schema versions, malformed rows, rank mismatches, and raw-event files
  fail closed with clear reasons.
- Unreplayable rows are counted as excluded audit evidence only and never
  become review cases.
- Below-threshold and sensitive queries cannot be found in cases, reports,
  admissions, logs, or retained files after import.
- Re-importing the same audit is idempotent.
- Closing an audit removes its dump while preserving only approved aggregate
  records and case links.

### Milestone 12 - deterministic prioritization and review sessions

**Implementation**

- Add weekly triage, stale-reconfirmation, candidate-regression, calibration,
  and holdout session builders.
- Publish the priority formula in the UI. Initial telemetry priorities use
  outcome class, device count band, converted-rank band, recurrence across
  audits, and age. They never treat popularity as theological importance.
- Support a configurable but reviewed weekly session size, initially 20 cases.
- Include a small deterministic exploration sample so quiet failures are not
  permanently hidden behind frequent queries.
- Record selection seed, source counts, skipped cases, completion, and reviewer.

**Acceptance**

- The same repository state and seed produce the same session.
- No query can monopolize a session through repeated near-identical forms;
  tokenizer-based clustering is applied first.
- Sensitive pastoral cases can be routed to an explicitly qualified reviewer
  without exposing suppressed telemetry.
- Skipping a case records a reason and returns it to a future queue when
  appropriate.

### Milestone 13 - quality dashboard and calibration

**Implementation**

- Report these metrics by artifact identity and review cycle:
  - Essential success within top 1, 3, 5, and 10.
  - Irrelevant result rate within top 3 and top 10.
  - Pairwise candidate/current win, tie, and loss counts.
  - Zero-result and weak-conversion rates from approved telemetry aggregates.
  - Converted-rank distribution.
  - Active, pending, uncovered, and stale concept/fixture counts.
  - Cases opened, admitted, rejected, no-effect, and unresolved.
  - Changed probes and accepted regressions per admission.
- Keep calibration and holdout results separate.
- Show denominators and confidence context; do not imply significance from a
  tiny sample.
- Add artifact-to-artifact trends, but never combine the metrics into a single
  quality score that can hide a serious regression.

**Acceptance**

- Every metric links back to the cases or aggregate records that produced it.
- Holdout queries are not available to proposal generation.
- A candidate cannot claim improvement solely from calibration queries while
  degrading the holdout set.
- Sparse samples are visibly labeled and never rendered as precise trends.

### Milestone 14 - isolated branch and draft PR preparation

**Implementation**

- Add a publish preflight that checks remote configuration, current main,
  proposal admission, final verify result, admission manifest, and conflicting
  existing branch names.
- Create an isolated git worktree from current `origin/main` under
  `workbench/.state/worktrees/<proposal-id>`.
- Reapply the exact admitted patch using file hashes, run full verify in the
  worktree, and confirm the resulting source and fixture digests match the
  admission.
- Create a branch named `refinement/<date>-<slug>`, commit only the admitted
  files, push it, and open a draft PR when GitHub CLI/authentication is
  available.
- Generate a PR body containing linked cases, before/after outcomes,
  provenance, all gate verdicts, reviewed baseline movement, artifact identity,
  and rollback guidance.
- If push or PR creation is unavailable, leave the verified branch locally and
  print exact next actions. Never weaken TLS or authentication checks.

**Acceptance**

- Primary-worktree user changes are neither staged nor copied into the branch.
- PR preparation refuses an admission whose base main has moved until the
  candidate is rebuilt and re-reviewed.
- The generated commit contains no `.state`, artifact database, telemetry dump,
  or unapproved baseline changes.
- The workbench cannot merge the PR or trigger a release.

### Milestone 15 - post-merge monitoring and v2.5 stabilization

**Implementation**

- Detect when a prepared PR's commit reaches main and move linked cases to
  `merged` without mutating GitHub.
- After a reviewed descriptor/release exists, fetch and verify it through the
  normal artifact path, then mark cases `monitored`.
- In the next telemetry audit, compare the affected query clusters with their
  pre-change zero-result and converted-rank outcomes.
- Add recovery tests for interrupted import, candidate build, apply, worktree,
  push, and server restart.
- Run a full monthly calibration session and one telemetry-sourced refinement
  through draft PR.

**v2.5 release gate**

- One privacy-safe audit produces an above-threshold case and deletes its audit
  dump after closure.
- One telemetry-sourced case reaches a verified draft PR through the studio.
- Calibration and holdout reports are attached to admission and remain
  separately visible.
- A moved `origin/main` forces rebuild/review instead of silently rebasing an
  approved candidate.
- Merge, release, and consumer updates still require their existing human or
  workflow approvals.

## 9. Candidate adjustment rules

The proposal engine should prefer the smallest source-owned operation that can
explain the judgment. This table is a routing aid, not permission to apply.

| Observation | First inspection | Safe proposal class | Escalate when |
|---|---|---|---|
| Correct concept, missing passage | Concept anchors and provenance | Add or adjust editorial anchor | Passage is contested or source-derived ownership applies |
| Expected passage already anchored | Triggered concepts and lexicon | Add/narrow an editorial lexicon phrase | Query is too broad or collides with another concept |
| Wrong concept on a relevant verse | Query-to-concept evidence | Remove/narrow lexicon phrase | Several concepts or normalization rules contribute |
| Concept does not fit the verse | Anchor provenance and locator | Remove/adjust editorial anchor | Anchor is source-derived or affects a deliberate range |
| Two concepts answer the same language | G4 overlap and anchors | Merge or differentiate concepts | Their theological distinction is meaningful but phrasing is shared |
| Lexical-only noise | Token, phrase, proximity reasons | Engineering brief + fixture | Fix requires stopword, tokenizer, weight, cap, or ranker change |
| Many unrelated regressions | Comparison report | Reject or narrow proposal | Reviewer believes baseline movement is intentional |
| No measured result change | Candidate comparison | Reject as NO MEASURABLE EFFECT | Never; adding inert data is not refinement |

No UI control directly edits a score. Weights remain reviewed source data and
may be proposed only as an explicit anchor operation with before/after evidence.

## 10. Testing strategy

### 10.1 Unit tests

- Mixed schema parsing and supersession graphs.
- Per-expectation rank windows and mixed-window fixture compilation.
- Judgment capture of observed rank and result/reason/window digests.
- Case event transitions and deterministic folding.
- Legacy migration manifest determinism and immutable parent ordering.
- Priority calculation and session sampling.
- Proposal validation and source ownership.
- Structured YAML operations and precondition hashes.
- Preview/apply digests, journals, crash recovery, and atomic writes.
- Current/candidate comparison classification.
- Metric denominators and sparse-sample handling.
- Telemetry import idempotency and privacy suppression.

### 10.2 Contract and integration tests

- `/api/v2/*` error envelopes and status codes, while legacy `/api/search` and
  `/api/passage` remain byte-compatible.
- CLI/API compile equivalence.
- Base/candidate dual-engine identity isolation.
- Production and candidate ontology importer equivalence.
- Job cancellation, restart recovery, bounded logs, env/cwd restrictions, and
  process-tree cleanup.
- Health fail-closed behavior for stale or mismatched identity-bound gauntlet
  reports.
- Worktree patch isolation, changed-main refusal, and isolated admission
  verification.
- Legacy v1 judgment behavior.

### 10.3 Browser tests

- Health -> Inbox -> Review -> History.
- Missing-passage lookup and Essential/Helpful/Not relevant judgments.
- Supersede and reconfirm flows.
- Compile preview/apply and pending fixture promotion.
- Candidate side-by-side and blind comparison.
- Admission with a blocking gate and with an accepted baseline change.
- Desktop and mobile viewport checks, keyboard navigation, focus restoration,
  and no overlapping dynamic content.

### 10.4 End-to-end fixtures

Maintain synthetic repositories for:

- a missing passage repaired by an anchor;
- a concept misfire repaired by narrowing a lexicon;
- a proposal that causes an unrelated G8 regression;
- a no-op proposal;
- a stale base fingerprint;
- a degraded read-only startup with missing artifact or stale static snapshot;
- an interrupted candidate build;
- an interrupted multi-file apply recovered from journal;
- a privacy-safe telemetry audit and a rejected raw-log import;
- a clean isolated draft-PR preparation without network push.

## 11. Delivery and migration

Each milestone lands as its own PR and leaves the workbench usable. Do not keep
an unfinished version behind a long-lived feature branch.

Recommended PR sequence:

1. Current gauntlet health repair and JSON report.
2. Case/v2 judgment schemas and compatibility.
3. Health, Inbox, Review, and History UI.
4. Compile/check integration and v1.5 stabilization.
5. Proposal schema and diagnostic router.
6. Candidate builder.
7. Comparison engine and blind review.
8. Controlled apply/admission and v2.0 stabilization.
9. Telemetry import.
10. Sessions and quality dashboard.
11. Branch/draft-PR preparation.
12. Post-merge monitoring and v2.5 stabilization.

Migration rules:

- Never rewrite the existing judgment log merely to add ids. Record stable
  derived case/event ids for legacy v1 material in a deterministic migration
  manifest and treat those ids as immutable thereafter.
- Existing hand-written fixtures remain hand-owned.
- Existing workbench-generated fixtures, once they exist, retain active status
  across recompilation.
- New routes are additive until the v2 UI no longer calls v1 endpoints. Remove
  old routes only in a separately documented major change.
- Local `.state` is disposable cache except for an in-progress operation. The
  canonical record remains committed judgments, cases, admissions, fixtures,
  ontology, and telemetry master data.

## 12. Quality measures and operating rhythm

The studio supports three recurring human practices.

### Weekly: inbox triage

- Target 20 cases or 20 minutes, whichever comes first.
- Prefer blocking regressions and real misses over speculative expansion.
- Mark uncertain cases for another reviewer instead of forcing a verdict.
- End by compiling judgments; ontology adjustment may happen in a later
  focused session.

### Per candidate: admission review

- Confirm the fixture states the intended behavior.
- Inspect the exact source/provenance diff.
- Review all changed top-10 queries and all gates in the declared comparison
  universe.
- Complete a blind comparison for ambiguous semantic movement.
- Reject no-effect and unexplained-regression candidates.

### Monthly: calibration and maintenance

- Run the stable calibration and holdout sets.
- Reconfirm stale high-impact judgments.
- Review uncovered concepts and pending fixtures.
- Review accepted baseline movement from the month.
- Once consumer telemetry exists, close one audit and compare outcome trends.

The dashboard reports each metric separately. The project does not optimize a
single aggregate score because a high average can conceal one severe pastoral
or theological failure.

## 13. Risks and controls

| Risk | Control |
|---|---|
| Review fatigue creates shallow clicks | Small resumable sessions, plain labels, context, and no required note for ordinary Helpful judgments |
| Frequent queries crowd out important quiet cases | Source-balanced queue plus deterministic exploration sample |
| The system overfits its fixtures | Separate calibration/holdout sets and complete probe blast-radius review |
| Candidate editing corrupts reviewed data | Isolated database, transactional import, path checks, precondition hashes |
| AI proposal is mistaken for authority | Visible authorship, provenance requirement, human admission, full diff and gauntlet |
| Baselines absorb regressions | Separate baseline approval with every changed probe shown |
| Stale judgments drive new edits | Identity warnings become inbox cases; stale approval digest is rejected |
| Two reviewers disagree | Preserve both judgments, require explicit resolution event, never last-write-win across reviewers silently |
| Telemetry reveals private searches | Distillates only, k-threshold, category exclusion, temporary dump deletion |
| Git automation captures user work | Isolated worktree from verified `origin/main`, admitted-file allowlist |
| Main moves after review | Refuse publication until rebuild, comparison, and admission against new main |
| Workbench becomes a production server | Bind localhost, private workspace, no auth assumptions, never ship to consumers |

## 14. Explicit non-goals through v2.5

- Runtime AI, embeddings, hosted inference, or adaptive per-user ranking.
- Automatic learning from clicks, conversions, or judgment counts.
- A public or remotely accessible workbench service.
- Automatic merge, npm publish, GitHub Release creation, or consumer upgrade.
- Direct editing of generated source rows under editorial provenance.
- An arbitrary YAML/code editor in the browser.
- Automatic tokenizer, ranker, cap, or budget tuning.
- A single quality score or leaderboard for reviewers.
- Multi-user authentication and role administration. Reviewer identity remains
  local configuration; disagreement is represented in data.
- Replacing the gauntlet. The studio explains and orchestrates it; the gates
  remain the admission authority.

## 15. Definition of complete

The v1.5-v2.5 program is complete when a reviewer can begin with a real,
privacy-safe search gap and, without manually editing JSON/YAML or running git
commands:

1. Understand why the case is in the inbox.
2. Judge the results in ordinary language.
3. See the exact pending expectation created from that judgment.
4. Review a minimal, provenance-correct source proposal.
5. Compare the reviewed artifact with an isolated candidate.
6. See every affected fixture, probe, holdout query, and gate.
7. Explicitly admit or reject the proposal and any baseline movement.
8. Produce a verified branch and draft PR containing only approved changes.
9. Confirm after merge/release that the shipped artifact carries the admitted
   identities.
10. Revisit the affected aggregate outcomes in a later audit.

At every step, the repository must be able to answer: who judged this, what
artifact did they see, what source changed, why was it defensible, what else
moved, which gates ran, and who admitted it.
