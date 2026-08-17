# Gauntlet machine report v1

`npm run gauntlet -- --json <path>` runs the normal gauntlet and writes a machine report with schema `scripture-search-engine/gauntlet-report/v1`. Markdown remains the stdout contract. The report is written only after every gate completes and the repository identity captured at the end still matches the identity captured at the start.

`npm run gauntlet:report` runs the exact-`ADMIT` check and refreshes the workbench report at the ignored path `eval/.runs/gauntlet-report.json`.

## Strict gate roster

The machine report contains exactly these gates, in this order:

1. `G1-provenance` - Provenance
2. `G1b-reachability` - Source reachability
3. `G2-determinism` - Determinism
4. `G3-golden` - Golden regression
5. `G4-collision` - Concept collision
6. `G5-distinctiveness` - Distinctiveness floor
7. `G6-signal-budgets` - Signal budgets
8. `G7-correlation` - Source correlation
9. `G8-noise-probes` - Noise probes
10. `G9-saturation` - Saturation
11. `G10-size` - Size budgets
12. `G11-latency` - Latency

The roster is an attestation boundary: freshness validation requires the exact count, order, gate id, title, applicability, status-derived code, and machine verdict for every row. An omitted, duplicated, reordered, or unknown gate is invalid.

All gates are `required` except `G1b-reachability`, which is `optional-advisory`. `G1b` is network opt-in and is `not-applicable` by default; that explicit N/A does not block an exact `ADMIT`. A `not-applicable` required gate makes the report `REJECT`. When `changedOutcomes` is not `false`, a gate `warn` produces `ADMIT_WITH_WARNINGS`; `--require-admit` exits successfully only for exact `ADMIT`.

## Start/end repository identity

Before gates run, the CLI captures a repository identity containing:

- `gitCommitSha`
- `dirtyTreeSha256`, hashing visible modified and untracked bytes
- the reviewed `artifacts/content-artifact.json` path and SHA-256
- the `eval/budgets.json` SHA-256
- the complete fixture-input SHA-256 over `eval/golden`, `eval/probes`, `eval/baselines`, `ontology/concepts`, `pipeline/fixtures`, and `pipeline/manifests`
- the exact parsed CLI flags and accepted `argv`

After gates finish, it captures the repository identity again. `repositoryIdentitiesMatch` compares the canonical full identity. Any mismatch is detected at the API boundary and the CLI fails closed: it writes no report, sets a nonzero exit code, and does not emit an admission report from that run. The configured machine-report path is excluded from the dirty-tree digest so an in-repository output can be overwritten; its exact path remains bound in `identity.flags.jsonPath`.

The machine identity then adds the engine identity measured from the freshly built fixture database:

- `engineVersion`
- `corpusFingerprint`
- `layerFingerprint`

## Baseline engine identity

When `eval/baselines/probes.json` exists, freshness validation requires the report's complete engine triple (`engineVersion`, `corpusFingerprint`, and `layerFingerprint`) to equal the baseline's same three fields. `layerFingerprint` is part of the contract; matching only the engine version or corpus fingerprint is insufficient. The fixture database is intentionally smaller than the release artifact, so the report retains the measured fixture corpus and layer fingerprints rather than substituting the release descriptor values.

## Timestamps and report age

`startedAt` and `finishedAt` must be canonical UTC ISO instants (`Date.toISOString()` form), with `startedAt <= finishedAt`. `finishedAt` may not be in the future. Freshness measures age from `finishedAt` to the verifier's `now` value and requires that age to be at most 24 hours by default (`DEFAULT_MACHINE_REPORT_MAX_AGE_MS`); the API can inject `now` and a different `maxAgeMs` for deterministic checks. A future, malformed, or too-old report is stale.

## Running marker

While the CLI is running, it atomically writes `eval/.runs/gauntlet-running-<pid>.json` with schema `scripture-search-engine/gauntlet-running/v1`, the process id, `startedAt`, and the start repository identity. `inspectGauntletRunMarkers` reports each matching marker as:

- `running` when its timestamp is within the age limit and its process is alive
- `stale` when it exceeds the age limit or its process is not alive
- `invalid` when its JSON, schema, integer pid, canonical timestamp, or identity object shape is malformed

Inspection is read-only. The marker is removed in the CLI's `finally` block, including failure paths; `removeGauntletRunMarker` is idempotent. Inspection accepts injected time, age, and process-liveness functions so these states can be tested without waiting or touching the real repository.

## Fail-closed validation

`verifyMachineReportFreshness(repoRoot, reportPath, parsed)` never writes and returns structured mismatches instead of trusting untrusted JSON. It rejects malformed or extra fields, bad timestamps, invalid roster rows, inconsistent verdicts, payload or report digest mismatches, a changed report path, commit, dirty tree, descriptor, budgets, fixture inputs, or baseline engine triple. Recompute errors also make the result stale with a `verification-error` mismatch. A report is fresh only when the complete validation returns `fresh: true` and no mismatches.

The payload digest is SHA-256 of canonical JSON for `payload`. The enclosing report digest is SHA-256 of canonical JSON for the complete report body excluding `reportSha256`. Finding category codes use the stable form `sse.gauntlet.v1.finding.<gate>.reported`; each finding also has a content-derived instance id and versioned compatibility metadata.

## Report root and rejected reports

The `--json` path is repository-relative and must be a `.json` file beneath the strict report root `eval/.runs`. The path is recorded in `identity.flags.jsonPath`; freshness rejects a report whose path is outside that root or does not match the path being verified. CI writes `eval/.runs/gauntlet-report.json` on both Linux and Windows and compares the resulting reports after parsing JSON, so CRLF versus LF in the report file is not a semantic difference.

The report is rejected when its shape, ordered gate roster, verdict, timestamps, digests, repository identity, reviewed artifact, fixture inputs, baseline engine triple, or baseline approval does not validate. A run that changes repository identity while gates are running fails closed and writes no report. A report that is malformed, stale, mismatched, or otherwise rejected is evidence of rejection, not an admission that can be carried forward.

The report digests are unkeyed SHA-256 integrity checks over canonical JSON. They detect accidental corruption and bind the fields within one report; they are not signatures and do not authenticate an untrusted author. Trust in provenance still comes from the reviewed repository checkout and the CI job that ran the gauntlet.

## Cross-platform comparison

The Linux and Windows CI reports are compared by canonical JSON. The comparison ignores only the report's run timestamps and enclosing/payload digests, plus `G11-latency` summary, findings, and metrics because those fields are derived from wall-clock timing. It retains the full report identity, verdict, headline, and every stable field for every other gate, as well as the latency gate's identity, code, title, status, applicability, and verdict. No ordering, result, finding, or non-latency metric is normalized.

## Probe baseline approval

`eval/baselines/probes.approval.json` is a separate, manually reviewed record. Its exact schema binds the canonical-JSON SHA-256 of both the current `eval/baselines/probes.json` and the current `eval/probes/probes.json`, the complete `engineVersion`/`corpusFingerprint`/`layerFingerprint` triple, review date, rationale, and prior baseline provenance. Canonical JSON makes those logical-document digests stable across LF and CRLF checkouts. Two schema versions exist during the current transition. The committed record is still `scripture-search-engine/probe-baseline-approval/v1` (a free-text reviewer role). Schema `v2` additionally binds the reviewer's name and contact, an independence attestation naming what the reviewer did not author, and the review record's path under `docs/reviews/` with its byte SHA-256, checked by the gauntlet reading the review record itself. Any approval that declares `v2` gets the full strict validation — a blank identity or attestation is a named finding, not a pass. The cutover commit that re-issues the committed approval as a signed `v2` record also deletes `v1` acceptance, and per `docs/governance/probe-baseline-review.md` it is held unopened until the designated reviewer signs.

The gauntlet validates the approval against the baseline, the current probe definitions, the review-record bytes (`v2`), and the freshly measured fixture identity. A missing, malformed, stale, or mismatching approval fails G8 and therefore produces `REJECT`; `--update-baseline` writes only a candidate baseline and never writes its approval. Updating a baseline requires a fresh independent review record and re-issued approval per `docs/governance/probe-baseline-review.md`.
