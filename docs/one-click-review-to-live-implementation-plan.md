# One-Click Review-to-Live Implementation Plan

**Date:** 2026-08-11
**Amended:** 2026-08-15 — authority capped at draft-PR-only (see the changelog)
**Status:** Proposed for independent review
**Target:** A reviewer records Scripture-search judgments, selects **Update Engine**, and receives either a draft PR ready for Jesse's hand-merge or a precise, actionable blocker report.

> **Superseded (2026-08-30).** The votes-to-engine plan —
> `docs/plans/2026-08-27-votes-to-engine-plan.md`, dated 2026-08-27 — now
> governs the whole review-to-live loop and supersedes this document's
> pipeline design end to end: the single **Update Engine** action and its
> durable coordinator (§5–§7, §5a), the batch/refinement/comparison policies
> (§8–§10), the GitHub, release-verification, and consumer-registry stages
> (§11–§13), the UI and API surfaces (§14–§15), and the phased rollout
> (§18–§22). What shipped instead is that plan's Updates screen (derived
> cards, one decision each), refinement trains sealed from approved cards,
> and the draft-PR-only publish leg. Do not implement anything from this
> document — in particular, the pre-amendment stages still quoted in the
> changelog below were withdrawn on 2026-08-15 and remain withdrawn: nothing
> here or there grants authority past a draft PR. The covenant sentence in
> §1 ("No automation merges to `main`.") stays binding and is guarded by
> `workbench/test/oneClickPlanGuard.test.ts`.

## Amendment changelog (2026-08-15)

This is the only section permitted to quote the removed automation language;
everywhere else in this document the cap is absolute.

- Outcomes renamed to **Draft PR ready** / **Needs attention** (previously "Live" / "Needs attention").
- §5 truncated after `draft PR -> report required checks -> hand to Jesse`; the stages that auto-merged the reviewed commit, tagged releases, and updated consumers are deleted. The original §5 said automation may "auto-merge exact reviewed commit" — that directly contradicted CLAUDE.md #1 and is withdrawn.
- §5a added: the repair phase precedes any coordinator work.
- §6/§7 replaced: the coordinator is a thin layer over the existing `jobRunner`/`applyJournal`/`publishPreparation` modules, with a named stop-reason enum.
- §11 rewritten: it previously instructed "Enable auto-merge or merge through the GitHub API"; it now names all three required checks and never merges.
- §12 redefined as logical-identity verification plus a pinned toolchain; byte-identity of a rebuilt SQLite artifact across operating systems is impossible.
- §20 stages 3–6 ("Auto-merge canary" through "Routine one-click live") deleted. Authority beyond draft-PR-only requires an explicit, separately reviewed CLAUDE.md amendment — Jesse's decision alone.

## 1. Outcome

The workbench should make Jesse's human judgment the semantic authority while preserving the engine's deterministic quality and release safeguards.

No automation merges to `main`.

The normal experience is:

1. Search and review results.
2. Save judgments quickly with **Submit review**.
3. Select **Update Engine** when ready to process the reviewed batch.
4. Let the workbench compile expectations, propose the smallest safe refinement, build and compare a candidate, run the gauntlet, and prepare the reviewed change as a draft PR.
5. Receive one of two outcomes:
   - **Draft PR ready:** what changed, the complete evidence trail, the draft PR link, and the status of every required check — handed to Jesse, who merges by hand or declines.
   - **Needs attention:** what blocked, why it matters, and the smallest decision or engineering action required.

Submitting a judgment is the reviewer's approval of the desired search behavior. The system must not ask the reviewer to approve the same meaning again. It may pause only when the implementation creates a new decision that the original judgment did not settle.

## 2. What Already Exists

The current workbench already provides most of the trusted building blocks:

- append-only review cases and judgments bound to exact artifact identities;
- Essential, Helpful, Irrelevant, Missing, and pairwise preference judgments;
- compilation into pending G3 golden fixtures;
- explicit fixture preview, apply, evidence, and promotion operations;
- constrained ontology proposals with provenance and source preconditions;
- isolated candidate artifact builds;
- current-versus-candidate comparison and blast-radius measurement;
- blind comparison for semantically ambiguous movement;
- gauntlet-bound admission manifests;
- isolated branch creation, commit, push, and draft-PR preparation;
- GitHub CI on Linux and Windows;
- a reproducible tagged release workflow for the engine package and database artifact.

The missing capability is a durable coordinator that invokes these stages as one operation, remembers progress, waits for GitHub, completes release work, verifies downstream state, and reports one understandable result.

## 3. Product Decisions

### 3.1 Two primary actions

Keep review entry fast and release processing deliberate:

- **Submit review** saves one judgment or completes one review case. It does not run the gauntlet.
- **Update Engine** processes all eligible, unprocessed judgments as one immutable batch.

Running the full pipeline on every individual vote would be slow, create redundant candidates, and make multi-result reviews internally inconsistent. Batching preserves the one-click experience without making ordinary voting cumbersome.

### 3.2 One semantic approval

The saved judgment is authoritative for the expected meaning:

- Essential and Missing define required rank windows.
- Irrelevant defines a prohibited ranking.
- Prefer defines ordering.
- Helpful remains evidence and does not independently block a release.

Selecting **Update Engine** authorizes the workbench to perform routine, allowlisted repository and release operations for that exact batch. No second semantic approval is required when the generated candidate does exactly what the submitted judgments requested and passes all existing protections.

### 3.3 Legitimate reasons to stop

The pipeline pauses only for a new decision or a true operational blocker:

- contradictory effective judgments;
- a judgment made against a stale engine that materially changes under the current engine;
- an existing protected expectation or holdout regression;
- unrelated search movement requiring semantic review;
- a proposed change outside the safe ontology/fixture allowlist;
- provenance, licensing, or source-ownership ambiguity;
- a ranking, tokenizer, schema, or engine-code change requiring engineering;
- a baseline or budget change not implied by the original judgment;
- changed `main`, changed source bytes, failed CI, unavailable GitHub credentials, or failed release/deployment verification.

The gauntlet never overturns the reviewer's meaning. It determines whether the proposed implementation achieves that meaning without violating other admitted requirements.

## 4. Definition of "Live"

The UI must not use one vague success state. It should show each verified level:

1. **Reviewed:** judgments saved and batch sealed.
2. **Candidate verified:** expectations pass locally and no blocking regression remains.
3. **Merged:** the exact reviewed commit is present on GitHub `main`.
4. **Released:** a GitHub release, database artifact, descriptor, and package version were produced from that commit and independently verified.
5. **Local workbench current:** the workbench downloaded and opened the released artifact with matching hashes.
6. **Consumer live:** each registered consumer reports the expected engine version, database SHA-256, and deployed commit.

Initially, the engine repository can guarantee levels 1–5. Level 6 requires each consumer—Maskil, LH Worship Setlist, Versed, or a future app—to adopt the shared engine and expose a machine-verifiable version endpoint or release receipt. Until that integration exists, the truthful result is **Engine released; consumer update not configured**, not **Everything live**.

Under the draft-PR cap, automation produces levels 1–2 and prepares the draft PR toward level 3. Every level from **Merged** onward is reached only through Jesse's own actions; the workbench may *verify and report* those levels read-only, never perform them.

## 5. End-to-End Workflow

```text
submitted reviews
       |
       v
seal immutable update batch
       |
       v
compile expectations + detect conflicts/staleness
       |
       v
create minimal allowlisted proposal
       |
       v
build isolated candidate
       |
       v
compare current vs candidate + run gauntlet
       |
       +------ blocker ------> needs-attention report
       |
       v
record admission from submitted semantic approval
       |
       v
prepare branch + commit + push + draft PR
       |
       v
report required checks
       |
       v
hand to Jesse
```

The workflow ends there. No automation merges to `main`. Everything after
Jesse's hand-merge — tagging, releasing, artifact refresh, consumer updates —
is his action, optionally assisted by read-only verification reporting.

## 5a. Repair phase first

The coordinator is not built on the pipeline as it stood at this document's
first draft; it is built after the repair items land:

- **`release-repair`**: the release/artifact machinery must produce a
  verifiable descriptor and reproducible artifact again before any
  coordinator can truthfully report "candidate verified". A coordinator over
  broken release machinery would be an automation of wrong answers.
- **`workbench-hardening`**: the legacy v1 judgment endpoint is closed, so
  every judgment the coordinator seals arrived through the validated v2
  surface. The coordinator must never accept batches containing judgments
  recorded through a bypass.

## 6. Durable Update Job

The coordinator is a **thin layer over modules that already exist and are
already tested**: `workbench/src/jobRunner.ts` (fixed-argv command
execution), `workbench/src/applyJournal.ts` (journaled, crash-recoverable
mutations), `workbench/src/admission.ts` (M10 preview/decision/manifest), and
`workbench/src/publishPreparation.ts` (isolated worktree, verify, commit,
push, draft PR — and nothing beyond a draft PR). It adds sequencing, durable
progress, and reporting; it does not add new mutation primitives, new
command surfaces, or new repository authority.

```text
workbench/src/updateEngine/
  model.ts              job schema, stages, outcomes, stop-reason enum
  batch.ts              eligible judgment selection and immutable batch seal
  coordinator.ts        sequencing over existing jobRunner/applyJournal/
                        admission/publishPreparation modules
  report.ts             plain-language result and evidence receipts
```

Persist job state under ignored local state
(`workbench/.state/update-engine/<job-id>/`), exactly as the existing publish
journals do. Commit durable outcomes only: judgments and cases, generated
fixtures and approved ontology changes, and the admission manifest.

Every stage must be idempotent. Restarting the workbench must resume from
verified evidence rather than rerunning completed mutations or producing
duplicate draft PRs.

## 7. Job State Machine

Use explicit states, with one active mutation job at a time. The machine is
truncated at the draft PR — there are no merged/released/live states for
automation to reach:

```text
DRAFT
  -> SEALED
  -> EXPECTATIONS_COMPILED
  -> PROPOSAL_READY
  -> CANDIDATE_BUILT
  -> COMPARISON_READY
  -> VERIFIED
  -> DRAFT_PR_OPEN
  -> CHECKS_REPORTED
  -> HANDED_TO_JESSE

Any active state may transition to:
  -> NEEDS_ATTENTION (with a stop reason)
  -> FAILED_RETRYABLE
  -> CANCELLED
```

Every `NEEDS_ATTENTION` carries one named stop reason from a closed enum, so
a blocked run is classifiable, countable, and never a free-text shrug:

```text
stop reason enum (closed; additions are reviewed changes):
  conflicting-judgments
  stale-artifact-identity
  protected-expectation-regressed
  unreviewed-top10-movement
  outside-allowlist
  provenance-ambiguity
  engineering-required
  g8-baseline-moved-needs-independent-approval
  no-measurable-effect
  main-moved
  source-drift
  verify-failed
  required-check-failed
  github-unavailable
```

`g8-baseline-moved-needs-independent-approval` exists because a baseline
move is never routine: it stops the run until the independent review of
`docs/governance/probe-baseline-review.md` produces the paired approval.
`no-measurable-effect` is a stop, not a success: per CLAUDE.md, weight
without value does not merge.

Each transition records: input and output digests; base and current Git
commit; artifact identities; command name from the fixed allowlist; start
and finish time; compact redacted logs; retry count; a user-visible
explanation; and the exact recovery action.

## 8. Batch Selection and Judgment Rules

When **Update Engine** is selected:

1. Collect effective, completed judgments not already linked to a merged admission.
2. Exclude Helpful-only cases from mandatory refinement while retaining them in history.
3. Resolve superseded judgments before sealing.
4. Detect contradictory expectations for overlapping references and queries.
5. Re-run each query against the current reviewed artifact.
6. If an artifact identity changed but the judgment remains materially equivalent, record a machine-supported reconfirmation. If the displayed result or reason changed materially, stop for human review.
7. Write an immutable batch digest containing case IDs, judgment IDs, current artifact identities, expected outcomes, and the selected release policy.

The batch digest becomes the identity passed through proposal, candidate, admission, draft PR, and the **Draft PR ready** receipt.

## 9. Automatic Refinement Policy

The first release should automate only constrained operations already supported and reviewed by the workbench:

- golden fixture creation or promotion;
- concept draft creation;
- concept anchor addition or correction;
- lexicon phrase addition or correction;
- related-concept updates;
- reviewed selection/subset changes already represented by the proposal schema.

Do not automatically change:

- ranking or tokenizer code;
- schema or migration code;
- provenance rules, licenses, source manifests, or source checksums;
- gauntlet budgets or acceptance thresholds;
- workflow files, secrets, branch protection, or deployment credentials;
- arbitrary repository paths.

Unsupported diagnoses become **Needs engineering** cases with the judgment, observed results, likely subsystem, and reproduction command attached. Codex or Claude may work on those separately, but they are not part of the routine one-click authority.

## 10. Comparison and Gauntlet Policy

The coordinator runs the current deterministic checks against the exact candidate:

- all compiled judgments in the batch;
- all existing active golden fixtures;
- inherited failing expectations;
- changed top-10 queries;
- linked and overlapping concepts;
- calibration and holdout queries;
- noise, provenance, collision, reproducibility, and performance gates;
- all three required GitHub checks, reported to Jesse before his merge:
  `verify (ubuntu-latest)`, `verify (windows-latest)`, and
  `cross-platform ordering (G2)`.

Automatic continuation is allowed only when:

- every batch expectation passes;
- no existing protected expectation regresses;
- no blocking gauntlet gate rejects;
- no unresolved blind-comparison query remains;
- all observed movement is either expected or mechanically equivalent;
- the candidate and release identities remain bound to the sealed batch.

Otherwise, the job stops with grouped issues such as **conflicting review**, **unrelated regression**, **source ambiguity**, **engineering required**, **main changed**, **CI failed**, or **release verification failed**.

## 11. GitHub Automation (draft PR only — never merges)

Extend the existing draft-publication support with a narrow GitHub adapter:

1. Create the isolated worktree and refinement branch using the current safe preparation code.
2. Commit only admitted files.
3. Push the branch and open the pull request **as a draft**.
4. Attach the batch, comparison, gauntlet, and admission summaries to the PR.
5. Poll or receive GitHub check updates for all **three** required checks:
   `verify (ubuntu-latest)`, `verify (windows-latest)`, and
   `cross-platform ordering (G2)`.
6. Verify each required check refers to the exact reviewed commit, and report
   the per-check status to Jesse.
7. Stop. The adapter has no merge operation of any kind — not conditional,
   not canaried, not behind a flag. Jesse merges by hand or declines.
8. Refuse force pushes, bypasses, and workflow edits.

The local workbench receives a narrowly scoped GitHub credential through environment configuration. It must never display, log, commit, or forward that credential to a subprocess unnecessarily. The credential's scope must not include the ability to merge or administer branch protection.

## 12. Release Verification (logical identity, not byte identity)

Releases are Jesse's actions through the existing tagged workflow. What this
plan adds is **verification** that what he released is what was admitted —
and the verification contract must be honest about what is checkable.

Byte-identity of a rebuilt SQLite artifact across operating systems is
impossible: page layout, free-list ordering, and build-environment details
legitimately differ between a Linux CI runner and a Windows one. A gate that
demanded byte-equal databases would fail forever or be quietly disabled —
both worse than a truthful check. Verification is therefore defined as
**logical-identity verification**:

1. Compare every canonical descriptor field — `engineVersion`,
   `corpusFingerprint`, `layerFingerprint`, `manifestFingerprint`,
   `schemaVersion`, `tokenizerVersion`, table counts — against the admitted
   candidate's descriptor.
2. Compare the recorded digests the build itself attests —
   `databaseSha256` of the artifact actually published,
   `logicalTableDigest`, per-table digests — against the descriptor that
   shipped with it: the published bytes must match *their own* reviewed
   descriptor exactly.
3. Pin the toolchain (Node version, SQLite build, pipeline package versions)
   in the release workflow, so logical divergence cannot hide behind
   environment drift.

A verification failure is reported to Jesse with the exact mismatching
field; nothing is retried, re-tagged, or rolled back automatically.

## 13. Consumer Update Registry

Add a reviewed configuration file, for example:

```text
distribution/consumers.json
```

Each registered consumer declares:

- repository and default branch;
- how its engine package and artifact descriptor are pinned;
- whether updates are automatic or PR-only;
- required CI checks;
- deployment provider and project identity;
- read-only production verification endpoint;
- rollback command or previous known-good pin.

For each consumer, the coordinator may create an exact pin-update PR and report its checks; a human merges it. Deployment and the production-reported engine version and database hash are then verified read-only.

Consumer integration must be opt-in. A consumer without a verified adapter is reported as **Not configured**, never silently skipped or claimed live.

## 14. Workbench UI

### 14.1 Review surface

- Keep **Submit review** beside the judgment form.
- Show **Saved for next engine update** after submission.
- Display the number of eligible reviewed cases near **Update Engine**.
- Allow the reviewer to inspect and exclude a case before sealing the batch.

### 14.2 Update Engine dialog

The confirmation is operational, not a repeated semantic review. Show:

- number of cases and judgments;
- current engine and artifact identity;
- intended target: **verify only** or **prepare draft PR** — there is no higher target;
- a concise statement that the process stops on new semantic decisions or regressions, and that Jesse merges by hand.

Default to **Prepare draft PR** only after GitHub configuration passes a read-only preflight. Otherwise offer **verify only** and explain what is missing.

### 14.3 Progress view

Show one understandable timeline:

- Preparing reviews
- Building candidate
- Checking other searches
- Preparing draft PR
- Reporting required checks
- Handed to Jesse

Each stage exposes technical evidence on demand without making raw logs the primary interface. Long-running work continues if the browser closes.

### 14.4 Result view

Success includes:

- reviewed queries and accepted expectations;
- concise before/after results;
- PR, merge commit, tag, and release links;
- engine version and database SHA-256;
- local artifact verification;
- per-consumer deployment status;
- rollback target.

A blocked result includes:

- plain-language category and summary;
- affected query or system stage;
- evidence and exact diff where relevant;
- whether retry is safe;
- the smallest action Jesse or an engineering agent must take;
- **Retry**, **Return to review**, or **Export engineering brief** as appropriate.

## 15. API Surface

Add narrow endpoints; no browser-supplied command or path is accepted:

```text
GET  /api/v2/update-engine/preflight
POST /api/v2/update-engine/jobs
GET  /api/v2/update-engine/jobs/:id
POST /api/v2/update-engine/jobs/:id/retry
POST /api/v2/update-engine/jobs/:id/cancel
GET  /api/v2/update-engine/jobs/:id/report
GET  /api/v2/update-engine/jobs/:id/events
```

`POST /jobs` accepts only:

- a server-issued preflight digest;
- selected eligible case IDs;
- a fixed release target enum;
- a fixed consumer policy enum.

The server resolves all repository paths, commands, credentials, remote names, and workflow identifiers from trusted configuration.

## 16. Security and Failure Safety

- Continue binding the workbench to localhost only.
- Keep all mutating commands on fixed allowlists with explicit arguments.
- Use isolated worktrees for every repository mutation.
- Require clean or explicitly scoped source state; never overwrite unrelated local work.
- Re-hash source, candidate, descriptor, commit, tag, and release bytes at every trust boundary.
- Serialize mutation jobs with the existing journal lock pattern.
- Redact credentials and limit retained logs.
- Use least-privilege GitHub permissions and protected branches.
- Never force-push, bypass failing checks, alter workflows, or weaken gauntlet policy.
- Make cancellation stop at the next safe boundary; do not interrupt an atomic commit, merge, or release publication halfway.
- Preserve enough evidence to resume or roll back without preserving secrets.

## 17. Rollback

Every release receipt records the previous known-good release and consumer pins.

Rollback should:

1. stop unfinished consumer rollouts;
2. repin consumers to the previous verified release;
3. redeploy and verify those pins;
4. mark the engine release as superseded rather than deleting immutable tags or assets;
5. create a regression case containing the failed release evidence;
6. leave the reviewed judgment intact unless Jesse corrects or supersedes it.

A bad implementation does not erase the original human judgment.

## 18. Implementation Phases

### Phase 0 — Contract and preflight

- Define `UpdateEngineJob`, stages, the stop-reason enum, digests, and the result receipt.
- Add read-only checks for GitHub auth, branch protection, release configuration, local artifact health, and consumer registry.
- Document exact authority granted by **Update Engine**.

**Gate:** preflight truthfully reports the highest achievable target without mutation.

### Phase 1 — Local one-click verification

- Seal review batches.
- Chain compilation, proposal routing, candidate build, comparison, and gauntlet.
- Persist progress and resume after restart.
- Produce success or needs-attention reports.

**Gate:** one real reviewed batch reaches **Candidate verified** from one click; a deliberate regression stops with a useful report.

### Phase 2 — Draft PR and check reporting

- Reuse admission and publish-preparation modules.
- Push the branch, open the draft PR, and report all three required checks against the exact reviewed commit.
- Add stale-main and changed-head recovery.

**Gate:** one safe batch reaches **Draft PR ready** without repeated semantic approval; a failed required check is reported and never hidden. Jesse's hand-merge remains the only path to `main`.

Phases 3–5 below describe release and consumer automation that is
**unreachable under the draft-PR cap**: entering any of them first requires
the explicit CLAUDE.md amendment described in §20.

### Phase 3 — Reproducible release

- Add descriptor preparation and version policy.
- Tag and invoke the release workflow.
- Verify all published identities and refresh the local workbench artifact.

**Gate:** the workbench reports **Released** only after a fresh checkout can verify the published package and database.

### Phase 4 — Consumer adapters

- Add the consumer registry and one adapter at a time.
- Start with the least risky consumer or a dedicated test consumer.
- Add pin PR, CI, deployment, production identity verification, and rollback.

**Gate:** a consumer reports the exact new engine and database identities from production.

### Phase 5 — UX hardening and rollout

- Finish responsive progress and result screens.
- Add retry, cancel, export-brief, notification, and history flows.
- Run failure injection across every transition.
- Make **Prepare draft PR** the default only after repeated successful use.

**Gate:** Jesse can complete routine review-to-live work without a terminal or another AI session.

## 19. Test Plan

### Unit and contract tests

- batch selection, supersession, conflict detection, and stable digests;
- every legal and illegal state transition;
- idempotent retry and duplicate-event handling;
- blocker classification and plain-language reporting;
- fixed command, path, remote, workflow, and consumer allowlists;
- credential and log redaction;
- version selection and release identity binding.

### Integration tests

- judgments to fixture and proposal;
- candidate to comparison and admission;
- admission to branch, PR, simulated CI, and merge;
- merge to descriptor, tag, release, and local artifact refresh;
- consumer pin update, deployment receipt, and rollback;
- restart or crash after every mutation phase.

### Adversarial tests

- conflicting judgments;
- stale artifact or source bytes;
- candidate tampering;
- main or PR head changes during processing;
- malicious paths, remote names, workflow names, and log content;
- CI success for the wrong commit;
- release assets produced from the wrong commit;
- consumer endpoint reporting an old or forged identity;
- network loss during push, merge, tag, release, and deployment;
- two simultaneous update requests.

### End-to-end acceptance scenarios

1. A Missing judgment produces a safe ontology refinement and reaches a verified release.
2. An Irrelevant judgment causes unrelated regressions and stops before GitHub mutation.
3. A semantic ambiguity requests one focused human decision, then resumes the same job.
4. A server restart during CI waiting resumes without creating another PR.
5. A release succeeds but one consumer fails; the UI reports partial rollout and offers rollback without claiming universal success.

## 20. Rollout Policy

Authority stops at stage 2. There are no further stages in this document:

1. **Observe:** run the full coordinator but mutate nothing beyond local ignored state.
2. **Draft-PR-only:** automatically prepare and push draft PRs; Jesse merges by hand.

No automation merges to `main`. Granting the workflow any authority beyond
draft-PR-only — merging, tagging, releasing, or updating a consumer without
a human hand on each action — requires an explicit, separately reviewed
amendment to CLAUDE.md's non-negotiables. That amendment is Jesse's decision
alone; it cannot be introduced by this document, by a configuration switch,
by a coordinator flag, or by any future revision of this plan that has not
first changed CLAUDE.md through its own reviewed PR.

Keep a configuration switch that immediately returns the system from
draft-PR-only to observe-only without changing code or weakening checks.

## 21. Definition of Complete

The feature is complete when:

- Jesse can record multiple judgments and process them with one **Update Engine** action;
- the original judgments serve as semantic approval without repeated confirmation;
- the workbench automatically compiles expectations and attempts only allowlisted refinements;
- every candidate is compared against current behavior and the complete gauntlet;
- genuine conflicts or regressions stop before publication with understandable next actions;
- safe work reaches a draft PR with all three required checks reported, ready for Jesse's hand-merge, without another AI session;
- configured consumers update through human-merged pin PRs and prove the exact production identities;
- the UI distinguishes reviewed, merged, released, and consumer-live states;
- interrupted jobs resume without duplicate or partial publication;
- rollback restores the previous verified consumer pins;
- no path can weaken tests, alter workflows, expose secrets, or claim live status without evidence.

## 22. Recommended First Slice

Implement Phases 0 and 1 first: **Update Engine** should seal a real review batch, run the existing local refinement pipeline, and return a durable verified-or-blocked report. This delivers the central user experience while keeping GitHub and release mutation disabled until the coordinator proves reliable.

Then connect the already-built admission and draft-publication path in Phase 2, ending at the draft PR and the reported checks. Anything beyond that waits on the CLAUDE.md amendment described in §20 — and on nothing else in this document.
