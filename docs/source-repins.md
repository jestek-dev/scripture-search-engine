# Re-pinning a drifted upstream source

What to do when the drift sentinel goes red — the scheduled `drift` job in
`.github/workflows/sources.yml`, or a local `npm run check:drift` — and a
pinned source reports `DRIFTED`.

## What a red run means

Upstream now serves different bytes under the same URL. The manifest's
checksum is not stale paperwork to refresh: it is the identity of the exact
snapshot that was admitted, reviewed for rights, and baked into
`corpusFingerprint` / `layerFingerprint`. New bytes are a **new revision of
the source**, and admitting a new revision is a reviewed decision — the same
decision the original admission was.

Two findings are *not* drift and need no re-pin:

- `unreachable` — the host is down or moved. A reachability finding for the
  `check` job's beat; non-fatal here.
- `repacked` — the archive checksum moved but the content fingerprint
  matches. Packaging only; the payload is byte-identical.

`archive-rotted` is drift's evil twin: an `archiveUrl` no longer serves the
pinned bytes, so the durable copy is gone. Restore the archive asset (from a
local copy of the exact pinned bytes) rather than re-pinning — the source
itself did not change.

## The one prohibition

**Never edit the checksum in place.** A checksum updated to silence the alarm
rewrites a rights record and a corpus identity without review. Every step
below exists so that the new bytes arrive the same way the old bytes did:
measured, archived, reviewed, and merged by a human (CLAUDE.md #1 — nothing
auto-merges).

## The process

Ordered; the ordering is load-bearing.

### 1. Archive first (upload errand, not a PR)

Upload the new snapshot as an asset on a `source-snapshots-<YYYY-MM>` GitHub
Release, verifying its sha256 locally before and after upload. If the
previously pinned bytes still exist anywhere, upload those too (as `*-<older
YYYY-MM>` assets) — losing from-scratch reproducibility of an old snapshot is
a decision only Jesse can sign off on, not a default.

Upload precedes every manifest edit so no `archiveUrl` ever points at
nothing.

### 2. Measure the delta (evidence in the PR)

Diff the new payload against the committed fixtures/subsets and any frozen
witness of the old revision. For a corpus source that means a full
verse-level diff plus a token-identity check (assert the old and new token
streams are identical; escalate any difference — "typography-only" is a
claim the diff proves or disproves, never an assumption). For a curated
layer, re-confirm the license header line in the new bytes — if it changed,
stop: that is a rights question, not a re-pin.

### 3. Re-pin the manifest

One reviewed PR per source (corpus before layers that are cut against it):

- new `sha256`, `bytes`, and `contentSha256` where applicable;
- `rollingSourceUrl: true` if the URL demonstrably rolls (drift is the
  demonstration);
- `archiveUrl` pointing at the step-1 asset;
- a re-admission `provenanceNote` saying what moved and how it was measured.

### 4. Regenerate downstream fixtures, in dependency order

Committed subsets regenerate from the new bytes. Order matters where one
subset is cut against another (the OpenBible subsets cut to WEB-subset
verses, so WEB regenerates first).

### 5. Re-baseline and chain the approval

Regenerating a subset invalidates the G8 probe baseline. Re-baseline with
`--update-baseline` and write a new approval record chaining the prior one
via `priorProvenance`. A re-pin claims *no* value, so `NO MEASURABLE EFFECT`
is the desired G8 outcome, not a rejection (CLAUDE.md's rule governs
additions claiming value). Any G3 failure means the change was **not** what
the evidence claimed — a finding for Jesse, never a fixture edit.

### 6. Retire the acknowledgment

Once a rolling source has an `archiveUrl`, delete its id from
`provenance.acknowledgedUnarchivedRollingSources` in `eval/budgets.json` in
the same PR — G1 fails on a stale acknowledgment, by design. The list's
stated goal is to be empty.

### 7. Versioning

**No `ENGINE_VERSION` bump.** Ordering may only change because the data
changed, and that identity moves through `corpusFingerprint` /
`layerFingerprint` — exactly what the three-identity contract is for. (If
engine *code* changed in the same breath, that is a different change and a
different PR.)

### 8. Prove the alarm, both ways

Re-run `npm run check:drift` immediately before merge (upstream can roll
again mid-review). After the final re-pin PR merges, dispatch the sources
workflow: the `drift` job must go green. While drift is live, a dispatched
run failing red is the sentinel working — leave it red rather than papering
over it.

## What the reviewer checks

- The step-2 evidence supports the claim being made (really typography-only?
  license header intact?), not just that gates are green.
- The archive asset's hash matches the manifest before the PR merges.
- The approval record chains the previous baseline.
- The acknowledgment list shrank if an `archiveUrl` was added.

Reference: `docs/plans/2026-08-14-implementation-plan.md` §7.3
(`source-drift`), which this process operationalizes.

Companion record: `docs/corpus-payload-dependency.md` — what the current WEB
drift blocks on the data side (the corpus-expansion payload), how the
expansion PR composes with the re-pin PR in one regeneration cycle, and when
that dependency is discharged.
