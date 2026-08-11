# Workbench v2.5 operations

This runbook covers the recurring human workflow after a refinement candidate
has been admitted and prepared as a draft pull request. The workbench remains
an evidence and orchestration tool: it does not merge, publish, create a
release, or update a consumer automatically.

## Trust boundaries

Post-merge monitoring consumes reviewed records from the earlier milestones:

- append-only review cases and sessions;
- an admitted source/tree/identity binding;
- verified local draft-PR preparation evidence;
- a closed telemetry audit receipt and deletion proof;
- calibration and holdout results kept as separate partitions;
- the identity-bound quality dashboard; and
- a reviewed release descriptor and its hash-verified database.

`postMergeMonitoring.ts` is read-only. Its Git adapter may inspect repository
identity, remote configuration, commits, trees, and ancestry. It has no
mutation method. Case transitions are returned as append-only events for a
human-approved caller to persist; the module never writes the case log.

## Operating cadence

### After draft-PR preparation

1. Review the exact source and fixture diffs, comparison report, gauntlet,
   admission decisions, prepared commit, and prepared tree.
2. Merge through the normal repository process. The workbench cannot perform
   this action.
3. Refresh the remote-tracking main ref through the normal trusted Git
   workflow and record a verified-main attestation: remote URL, ref, exact
   commit, exact tree, timestamp, and digest.
4. Run read-only merge detection. The prepared commit must resolve exactly,
   its tree must match the preparation record, and it must be reachable from
   the attested main commit.
5. Confirm the M14 record carries a digest-bound case lineage. The exact
   telemetry case UUIDs must match at audit, judgment, proposal, candidate,
   comparison, admission, and draft-PR stages.
6. Review the returned `merged` events before appending them. A matching hash
   string without proven ancestry is not a merge.

If main moved after candidate approval but before preparation or push, rebuild
the candidate and repeat comparison, review, and admission. Do not silently
rebase approved evidence.

### After release

1. Wait for the normal independent release review and publication workflow.
2. Obtain the reviewed release provenance and descriptor. `NOT_RUN` or
   `BLOCKED` is the correct state while either is unavailable.
3. Fetch the artifact through the normal artifact workflow.
4. Resolve the release commit through the injected read-only Git resolver. It
   must exist in the expected repository, have the recorded tree, descend from
   the admitted main commit, and contain the prepared commit.
5. Verify descriptor schema, descriptor hash, database size and hash, engine
   version, corpus fingerprint, layer fingerprint, admission digest, source
   digest, prepared commit, prepared tree, release commit, and release tree.
6. Review the returned `monitored` events before appending them.

A stale descriptor with `blocksRelease: true`, a missing artifact, or any
identity mismatch blocks monitoring. Never substitute a candidate artifact or
fabricate an external release result.

### Next approved telemetry audit

1. Import only schema-valid privacy distillates through the M11 audit flow.
2. Apply and close the audit; retain the signed/hashed receipt and proof that
   selected dumps no longer exist.
3. Load the digest-bound identity roster from the approved M11 receipt.
   Aggregate and approval IDs must be lowercase SHA-256 digests; generated
   telemetry case IDs must be canonical UUIDs.
4. Select affected clusters only from that receipt's approved above-threshold
   aggregate-ID allowlist.
5. Compare pre/post denominators, zero-result rate, weak-conversion rate, and
   converted-within-rank distributions.
6. Treat sparse results as directional context only. They do not demonstrate
   improvement.

Raw queries, device or session identifiers, audit tokens, and suppressed rows
are outside this interface. There is no operator override to reveal them.

### Monthly stabilization

Complete one calibration session and one holdout session. Keep their reports
separate. The stabilization report records only opaque holdout session
identity, completion, and digest; it does not expose holdout membership.
Both sessions are folded through M12's canonical integrity validator. Their
full definitions and append-only events must prove completion and bind the
verified repository state, shipped artifact state, and dashboard review cycle.

Bind the monthly report to:

- the verified merge and monitored release;
- the closed M11 receipt and dump-deletion proof;
- the completed M12 calibration and holdout sessions;
- the integrity-checked M13 dashboard;
- the M10 admission and M14 draft-PR record;
- one recovery outcome for every supported interruption class; and
- explicit merge, release, consumer-update, and real-audit gate states.

External work may remain `NOT_RUN` or `BLOCKED` with a machine reason. The
report is release-ready only when every required external gate is `PASSED` and
post-audit telemetry comparison is attached.

## Recovery matrix

Every recovery starts by re-reading current main, evidence identities, and
operation preconditions. Never continue from filenames or process IDs alone.

| Interrupted operation | Recovery action |
|---|---|
| Audit import | Recover the journal only after main, evidence, preconditions, target identity, and remote state independently revalidate. |
| Candidate build | Resume only against identical evidence and main; otherwise rebuild and repeat review. |
| Source apply/admission | Recover the journal only after every independent revalidation succeeds. |
| Worktree preparation | Reuse only an identity-verified worktree; re-prepare when main or evidence moved. |
| Push/draft PR | Never repeat after an uncertain outcome. Accept only proof that the exact remote branch commit and, when applicable, draft PR already exist; otherwise require a human. |
| Server restart | Revalidate the descriptor and artifact. Start degraded read-only when unavailable or invalid. |

Recovery outcomes never authorize an irreversible action. `ALREADY_COMPLETE`
means exact remote idempotency was proven; it is not permission to push again.
For every stage, moved main or stale evidence, preconditions, target identity,
or remote inspection returns `REBUILD_REVIEW_REQUIRED` before journal recovery
or completion evidence is considered.

## Human approvals

The following remain explicit human or existing workflow gates:

- source and fixture admission;
- accepted probe or baseline movement;
- push and draft-PR creation;
- pull-request merge;
- artifact/package release;
- consumer pin or deployment update; and
- acceptance of a real privacy-safe telemetry audit as release evidence.

Post-merge detection observes completed work. It does not grant any of these
permissions.

## Privacy checks

Before retaining a stabilization report:

1. Confirm the M11 receipt is `closed`.
2. Verify the dump-deletion proof has zero remaining selected dumps.
3. Scan retained and returned structures for known hidden canaries.
4. Confirm telemetry comparison contains only receipt-allowlisted SHA-256
   aggregate/approval IDs and aggregate counts.
5. Confirm the holdout projection contains no membership, case count, or
   membership-derived digest.
6. Confirm no key or value contains a hidden canary, raw or suppressed query,
   device/session identity, or human-readable substitute for an opaque ID.

Release readiness also requires a positive M11 `candidateCaseCount`, at least
one generated telemetry case UUID from that exact closed receipt, and the same
case set and stage digests through judgment, proposal, candidate, comparison,
admission, and M14 preparation. Unrelated cases fail closed.

Any privacy check failure invalidates the report; do not redact after the
fact and continue.

## Rollback and incident response

Source rollback uses the admission manifest's exact reviewed rollback bytes in
a new normal pull request. Do not rewrite the admission, monitoring, audit, or
case-event history. A rollback is a new reviewed change with its own candidate,
comparison, gauntlet, admission, and release provenance.

For a bad release:

1. Stop consumer updates through the existing release process.
2. Mark the release gate `BLOCKED` with a machine-readable reason.
3. Preserve the descriptor, hashes, receipts, and stabilization report as
   incident evidence.
4. Revert through a reviewed pull request or publish a corrected release.
5. Verify the replacement artifact normally before returning new `monitored`
   events.

For an uncertain push or PR creation, do not retry automatically. Inspect the
remote through a trusted read-only path and require exact commit proof or human
resolution.
