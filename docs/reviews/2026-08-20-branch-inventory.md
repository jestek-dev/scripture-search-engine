# Remote branch inventory — housekeeping sweep, read-only pass (RH-9)

> STATUS: INVENTORY ONLY. No ref was created, deleted, or moved by this
> pass. Deletion is gated on Jesse's batch approval of the candidate list
> below (approval item A10 / question J62); the `claude/hearth-thread-vvwdi2*`
> family is excluded from this sweep entirely — its fate is a separate,
> reserved decision (RH-7 / J61). Deletion only, never force-push; tags are
> untouched.

Captured 2026-08-20 against `origin` at main `9542c83` (PR #32 merge).
`git ls-remote --heads origin` reported **34 heads**; every one appears in
exactly one section below. Raw per-ref evidence (unique-blob listings with
sizes and paths) is archived with the sweep's working notes and can be
regenerated from the commands in the Method section.

## Method

- **Tip / date / subject:** `git for-each-ref` + `git log -1` per ref.
- **Merged status**, three grades:
  - `ancestor` — tip is reachable from main (`git merge-base --is-ancestor`);
    nothing on the branch is absent from main.
  - `squash-merged` — tip is *not* an ancestor, but the tip's tree object is
    byte-identical to the tree of a commit on main (the squash-merge
    signature). The branch's final state is fully on main; only intermediate
    iterations are unique to it.
  - `superseded` / `unmerged` — neither of the above; judged individually.
- **Unique blobs:** `git rev-list --objects main..<ref>` filtered to blobs —
  file contents reachable from the ref and NOT reachable from main. Counts
  and byte totals are per ref; every ref with a nonzero count is flagged
  individually below (never batch-marked), per the sweep's own rule that a
  ref holding unique blobs gets an explicit keep/archive/delete call.
- **Workflow scan:** every unique blob under `.github/workflows/` was opened
  and grepped for `attestations: write` — the stale-branch attack surface
  RH-2's signer pin closes.

## 1. Keep — default branch

| ref | tip | note |
|---|---|---|
| `main` | `9542c83` | default branch |

## 2. Excluded from this sweep — `vvwdi2` family (12 refs, RH-7 / J61 owns)

Standing do-not-delete instruction honored; no disposition is proposed here
for any of these. Listed only so the 34-head census is complete.

| ref | tip | merged status | unique blobs |
|---|---|---|---|
| `claude/hearth-thread-vvwdi2` | `c3ff4ba` | unmerged | 6 blobs / 23,666,594 B — the five in-copyright `Books/` PDF scans (~23.5 MB) plus a plan-doc copy; the RH-7 subject matter |
| `claude/hearth-thread-vvwdi2-pr1` | `e394407` | squash-merged (PR #21) | 4 / 260,273 B (intermediate iterations) |
| `claude/hearth-thread-vvwdi2-pr2` | `1c076e4` | squash-merged (PR #23) | 17 / 640,415 B (intermediate) |
| `claude/hearth-thread-vvwdi2-pr3` | `a072787` | squash-merged (PR #24) | 7 / 301,082 B (intermediate) |
| `claude/hearth-thread-vvwdi2-pr4` | `f8dcdc1` | squash-merged (PR #25) | 7 / 44,545 B (intermediate; includes a superseded `sources.yml`) |
| `claude/hearth-thread-vvwdi2-pr5` | `78a98be` | squash-merged (PR #26) | 10 / 99,766 B — includes a superseded `mint-artifact.yml` carrying `attestations: write` (see Security notes) |
| `claude/hearth-thread-vvwdi2-pr6` | `6229d8f` | squash-merged (PR #27) | 18 / 398,412 B (intermediate) |
| `claude/hearth-thread-vvwdi2-pr7` | `6a6ec80` | squash-merged (PR #28) | 2 / 32,502 B (intermediate) |
| `claude/hearth-thread-vvwdi2-pr8` | `39f9786` | squash-merged (PR #29) | 9 / 212,666 B (intermediate; includes a superseded `gauntlet.yml`, no attestations permission) |
| `claude/hearth-thread-vvwdi2-pr9` | `980208e` | squash-merged (PR #30) | 20 / 105,935 B (intermediate) |
| `claude/hearth-thread-vvwdi2-pr10` | `7ed9df0` | unmerged (main merged into it 2026-08-20) | 9 / 78,247 B |
| `claude/hearth-thread-vvwdi2-pr11` | `45e5e4b` | **ACTIVE — open draft PR #33** | 13 / 163,733 B (the PR's own content) |

PR-number attributions for pr1–pr9 are by tip-subject match against main's
squash-merge commits (pr4→#25, pr5→#26, pr6→#27, pr7→#28, pr9→#30 verified
verbatim; pr1/pr2/pr3/pr8 by the same method against #21/#23/#24/#29).

## 3. Deletion candidates — merged, tip an ancestor of main (5 refs, zero unique blobs)

Nothing reachable from these refs is absent from main. Safest possible
class.

| ref | tip | landed as | unique blobs |
|---|---|---|---|
| `claude/hearth-thread-mo9yf7` | `c5eeb21` | direct commit on main (2026-08-10, workbench static-page snapshot) | 0 |
| `claude/implementation-docs-0bff61` | `5c870b4` | history under PR #1 | 0 |
| `claude/project-orientation-readiness-3b0b5f` | `9177e90` | direct commit on main (fourteen pastoral-care packs) | 0 |
| `claude/system-audit-feedback-uzqymz` | `54f952a` | direct commit on main (NEEDS-JESSE renumbering) | 0 |
| `feat/translation-neutral` | `c469ef1` | direct commit on main (translation-neutral search) | 0 |

## 4. Deletion candidates — squash-merged, tip tree byte-identical to a main commit (15 refs)

Each ref's final tree is on main; the flagged unique blobs are **pre-merge
intermediate iterations** whose final versions landed with the named PR.
Per-ref flags follow — none is batch-marked; strike any row to keep it.

| ref | tip | last commit | landed as | unique blobs (count / bytes) | blob characterization |
|---|---|---|---|---|---|
| `agent/one-click-review-to-live-plan` | `5837999` | 2026-08-11 | PR #20 | 1 / 24,478 | one intermediate plan-doc revision |
| `chore/mit-license` | `c4e3f68` | 2026-07-31 | PR #10 | 3 / 11,856 | intermediate LICENSE/readme states |
| `chore/release-followups` | `22dadb8` | 2026-07-31 | PR #9 | 4 / 67,850 | intermediate docs + a superseded `sources.yml` (no attestations permission) |
| `ci/npm-publish` | `02940fe` | 2026-07-30 | PR #5 | 2 / 35,620 | superseded `release.yml` iteration (no attestations permission) |
| `ci/trusted-publishing` | `f0cda1e` | 2026-07-30 | PR #6 | 2 / 35,677 | superseded `release.yml` iteration (no attestations permission) |
| `claude/hearth-thread-228c45` | `03b616a` | 2026-08-06 | PR #16 | 7 / 106,984 | intermediate workbench iterations |
| `claude/hearth-thread-gbhhh1` | `7b293bc` | 2026-08-11 | PR #18 | 4 / 84,624 | intermediate fixes + a superseded `gauntlet.yml` (no attestations permission) |
| `claude/hearth-thread-nuemln` | `226cc28` | 2026-08-06 | PR #14 (concordance-PDF removal) | 0 / 0 | none |
| `claude/hearth-thread-vdj22q` | `88ee5a8` | 2026-08-20 | PR #31 (books-harvest curation; tip tree = `491f23b`'s tree exactly) | 288 / 670,462 | intermediate ontology/golden/baseline states of the harvest rounds — final versions all on main via #31 |
| `claude/win-tmpdir-canonicalize` | `6bb75df` | 2026-08-11 | PR #19 | 4 / 136,590 | intermediate test iterations |
| `fix/pack-includes-dist` | `84f92cb` | 2026-07-30 | PR #3 | 2 / 6,000 | superseded `release.yml` iteration (no attestations permission) |
| `fix/package-provenance-metadata` | `210eb32` | 2026-07-31 | PR #8 | 2 / 6,487 | intermediate package.json states |
| `fix/source-filename-case` | `832f341` | 2026-07-30 | PR #2 | 2 / 11,978 | intermediate pipeline states |
| `fix/test-timeout` | `879f9c7` | 2026-07-30 | PR #4 | 2 / 2,020 | intermediate test-config states |
| `release/v0.7.1` | `3b0e7e2` | 2026-07-31 | PR #7 (the v0.7.1 release PR; the tag, not the branch, is release history) | 3 / 6,000 | intermediate release-prep states |

## 5. Individual call required — superseded but tip tree NOT on main (1 ref)

| ref | tip | last commit | status |
|---|---|---|---|
| `claude/hearth-thread-t9k25z` | `f6edcdc` | 2026-08-15 | doctrinal-guardrail branch; its work landed on main via PR #22 (`f41259a`) — 15 of the 19 files it changed are byte-identical between its tip and current main, and the remaining 4 (`eval/src/gauntlet.ts`, three goldens) differ only where main has since advanced past it. 23 unique blobs / 126,576 B, all intermediate iterations of files whose current versions are on main. Recommended disposition: delete with the batch — but because its tip tree is not literally on main, this row is called out for Jesse's explicit strike-or-confirm rather than folded silently into §4. |

## Security notes (RH-2 context)

- Exactly **one** unique workflow blob anywhere on the remote carries
  `attestations: write`: the superseded `mint-artifact.yml` iteration on
  `claude/hearth-thread-vvwdi2-pr5` — inside the excluded family, so it
  outlives this sweep either way. It is a live example of RH-2 Hole 2's
  stale-branch surface; the `--signer-workflow` pin (RH-2) is what actually
  closes that class, since deleting branches cannot retire already-issued
  attestations.
- All other unique workflow blobs (on `chore/release-followups`, `ci/*`,
  `claude/hearth-thread-gbhhh1`, `fix/pack-includes-dist`) are superseded
  `release.yml`/`gauntlet.yml`/`sources.yml` iterations with no
  attestations permission.
- No unique blob outside the vvwdi2 family exceeds 1 MB, and no PDF or
  scan-like path exists outside `claude/hearth-thread-vvwdi2` — the
  deletion-candidate list carries no copyright surprise.

## Post-approval target state

On approval of the full candidate list (§3 + §4 + §5 = **21 refs**), remote
heads become exactly: `main`, whatever branch is actively in review at that
time, and the 12-ref `vvwdi2` family pending the RH-7 decision — the
sweep's definition of done. Execution is `git push origin --delete <ref>`
per approved row, followed by a fresh `git ls-remote --heads origin`
compared line-by-line against the approved list. Any row Jesse strikes
simply stays.
