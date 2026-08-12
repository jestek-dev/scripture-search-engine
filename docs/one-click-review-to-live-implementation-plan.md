# One-Click Review-to-Live Implementation Plan

**Date:** 2026-08-11
**Status:** Proposed for independent review
**Target:** A reviewer records Scripture-search judgments, selects **Update Engine**, and receives either a verified live release or a precise, actionable blocker report.

## 1. Outcome

The workbench should make Jesse's human judgment the semantic authority while preserving the engine's deterministic quality and release safeguards.

The normal experience is:

1. Search and review results.
2. Save judgments quickly with **Submit review**.
3. Select **Update Engine** when ready to process the reviewed batch.
4. Let the workbench compile expectations, propose the smallest safe refinement, build and compare a candidate, run the gauntlet, publish the approved change, and verify the release.
5. Receive one of two outcomes:
   - **Live:** what changed, what version shipped, where it is available, and which consumers verified the new version.
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
prepare branch + commit + push + pull request
       |
       v
wait for required GitHub checks
       |
       +------ failure ------> needs-attention report
       |
       v
auto-merge exact reviewed commit
       |
       v
build reviewed descriptor + choose version + tag release
       |
       v
verify release hashes and package identity
       |
       v
refresh local workbench artifact
       |
       v
update and verify registered consumers
       |
       v
live receipt
```

## 6. Durable Update Job

Add a repository-owned coordinator rather than placing orchestration logic in a Codex or Claude skill.

Suggested modules:

```text
workbench/src/updateEngine/
  model.ts              job schema, stages, outcomes, blocker taxonomy
  batch.ts              eligible judgment selection and immutable batch seal
  coordinator.ts        state machine and stage transitions
  expectations.ts       judgment compilation adapter
  refinement.ts         proposal, candidate, comparison, and admission adapter
  github.ts             PR, checks, merge, tag, workflow, and release adapter
  release.ts            version and descriptor orchestration
  consumers.ts          registered consumer update/verification adapters
  recovery.ts           resume, retry, cancellation, and stale-job handling
  report.ts             plain-language result and evidence receipts
```

Persist job state under ignored local state:

```text
workbench/.state/update-engine/<job-id>/
  job.json
  events.jsonl
  logs/
  evidence/
```

Commit durable outcomes, not transient execution state:

- judgments and cases;
- generated fixtures and approved ontology changes;
- admission manifest;
- release descriptor and version changes;
- an optional compact release receipt that contains no credentials or raw logs.

Every stage must be idempotent. Restarting the workbench must resume from verified evidence rather than rerunning completed mutations or producing duplicate PRs, tags, releases, or consumer updates.

## 7. Job State Machine

Use explicit states, with one active mutation job at a time:

```text
DRAFT
  -> SEALED
  -> EXPECTATIONS_COMPILED
  -> PROPOSAL_READY
  -> CANDIDATE_BUILT
  -> COMPARISON_READY
  -> VERIFIED
  -> PR_OPEN
  -> CI_RUNNING
  -> MERGED
  -> RELEASE_RUNNING
  -> RELEASED
  -> CONSUMERS_UPDATING
  -> LIVE

Any active state may transition to:
  -> NEEDS_ATTENTION
  -> FAILED_RETRYABLE
  -> CANCELLED
```

Each transition records:

- input and output digests;
- base and current Git commit;
- artifact identities;
- command or API operation name from a fixed allowlist;
- start and finish time;
- compact redacted logs;
- retry count;
- user-visible explanation;
- exact recovery action.

## 8. Batch Selection and Judgment Rules

When **Update Engine** is selected:

1. Collect effective, completed judgments not already linked to a merged admission.
2. Exclude Helpful-only cases from mandatory refinement while retaining them in history.
3. Resolve superseded judgments before sealing.
4. Detect contradictory expectations for overlapping references and queries.
5. Re-run each query against the current reviewed artifact.
6. If an artifact identity changed but the judgment remains materially equivalent, record a machine-supported reconfirmation. If the displayed result or reason changed materially, stop for human review.
7. Write an immutable batch digest containing case IDs, judgment IDs, current artifact identities, expected outcomes, and the selected release policy.

The batch digest becomes the identity passed through proposal, candidate, admission, PR, release, and live receipt.

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
- Linux and Windows CI before merge.

Automatic continuation is allowed only when:

- every batch expectation passes;
- no existing protected expectation regresses;
- no blocking gauntlet gate rejects;
- no unresolved blind-comparison query remains;
- all observed movement is either expected or mechanically equivalent;
- the candidate and release identities remain bound to the sealed batch.

Otherwise, the job stops with grouped issues such as **conflicting review**, **unrelated regression**, **source ambiguity**, **engineering required**, **main changed**, **CI failed**, or **release verification failed**.

## 11. GitHub and Merge Automation

Extend the existing draft-publication support with a narrow GitHub adapter:

1. Create the isolated worktree and refinement branch using the current safe preparation code.
2. Commit only admitted files.
3. Push the branch and open the pull request.
4. Attach the batch, comparison, gauntlet, and admission summaries to the PR.
5. Poll or receive GitHub check updates.
6. Verify both required platform checks refer to the exact reviewed commit.
7. Enable auto-merge or merge through the GitHub API only when branch protection is green and the head commit still matches.
8. Refuse force pushes, bypasses, workflow edits, or merges with unresolved review requests.

The local workbench receives a narrowly scoped GitHub credential through environment configuration. It must never display, log, commit, or forward that credential to a subprocess unnecessarily.

## 12. Release Automation

The current tagged workflow releases the engine and database, but the one-click path needs deterministic preparation before tagging.

Add a release-preparation workflow that:

1. Starts from the exact merged commit.
2. Rebuilds the content database from pinned sources.
3. produces the descriptor in CI;
4. compares candidate identities with the admitted candidate;
5. commits the reviewed descriptor through a bot-owned, narrowly scoped follow-up PR or a protected release commit;
6. determines the version:
   - ontology/content-only change: increment the artifact release while retaining a compatible engine package version;
   - ordering code change: require an explicit engine version bump and engineering path;
7. creates an annotated `v*` tag only after the descriptor commit is on `main`;
8. runs the existing release workflow;
9. verifies the GitHub release assets, descriptor SHA-256, database SHA-256, package contents, npm version when applicable, source commit, and tag.

Do not report **Released** until all published bytes match the admitted identities.

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

For each consumer, the coordinator should create an exact pin-update PR, wait for its checks, merge according to policy, wait for deployment, and verify the production-reported engine version and database hash.

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
- intended target: verify only, prepare PR, or release live;
- registered consumers that will be updated;
- a concise statement that the process stops on new semantic decisions or regressions.

Default to **Release live** only after GitHub and release configuration pass a read-only preflight. Otherwise offer the highest safe target and explain what is missing.

### 14.3 Progress view

Show one understandable timeline:

- Preparing reviews
- Building candidate
- Checking other searches
- Publishing reviewed change
- Waiting for GitHub checks
- Releasing engine
- Updating consumers
- Verifying live version

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

Every live receipt records the previous known-good release and consumer pins.

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

- Define `UpdateEngineJob`, stages, blocker taxonomy, digests, and live receipt.
- Add read-only checks for GitHub auth, branch protection, release configuration, local artifact health, and consumer registry.
- Document exact authority granted by **Update Engine**.

**Gate:** preflight truthfully reports the highest achievable target without mutation.

### Phase 1 — Local one-click verification

- Seal review batches.
- Chain compilation, proposal routing, candidate build, comparison, and gauntlet.
- Persist progress and resume after restart.
- Produce success or needs-attention reports.

**Gate:** one real reviewed batch reaches **Candidate verified** from one click; a deliberate regression stops with a useful report.

### Phase 2 — PR and CI completion

- Reuse admission and publish-preparation modules.
- Push the branch, open the PR, wait for required checks, and merge the exact reviewed commit.
- Add stale-main and changed-head recovery.

**Gate:** one safe batch reaches `main` without repeated semantic approval; failed CI never merges.

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
- Make **Release live** the default only after repeated successful canary use.

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

Roll out authority gradually:

1. **Observe:** run the full coordinator but mutate nothing beyond local ignored state.
2. **PR-only:** automatically prepare and push draft PRs; human merges manually.
3. **Auto-merge canary:** automatically merge allowlisted, green changes for a test branch or test consumer.
4. **Engine release:** automatically tag and verify engine releases.
5. **Consumer canary:** automatically update one registered consumer.
6. **Routine one-click live:** enable the complete flow after a reviewed success threshold and rollback drill.

Keep a configuration switch that immediately returns the system to PR-only mode without changing code or weakening checks.

## 21. Definition of Complete

The feature is complete when:

- Jesse can record multiple judgments and process them with one **Update Engine** action;
- the original judgments serve as semantic approval without repeated confirmation;
- the workbench automatically compiles expectations and attempts only allowlisted refinements;
- every candidate is compared against current behavior and the complete gauntlet;
- genuine conflicts or regressions stop before publication with understandable next actions;
- safe work reaches GitHub `main`, a reproducible release, and the local workbench without another AI session;
- configured consumers update and prove the exact production identities;
- the UI distinguishes reviewed, merged, released, and consumer-live states;
- interrupted jobs resume without duplicate or partial publication;
- rollback restores the previous verified consumer pins;
- no path can weaken tests, alter workflows, expose secrets, or claim live status without evidence.

## 22. Recommended First Slice

Implement Phases 0 and 1 first: **Update Engine** should seal a real review batch, run the existing local refinement pipeline, and return a durable verified-or-blocked report. This delivers the central user experience while keeping GitHub and release mutation disabled until the coordinator proves reliable.

Then connect the already-built admission and draft-publication path in Phase 2. Release and consumer automation should follow only after the system can recover cleanly from every local and GitHub interruption.
