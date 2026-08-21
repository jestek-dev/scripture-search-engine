# Release-verification rehearsal runbook (RH-2 / plan P2.3)

Status: **prepared 2026-08-21, not yet executed.** This runbook turns the
RH-2 hardening (committed-descriptor smoke cross-check, `--signer-workflow`
attestation pin, promote-idempotence guard, release-integrity sentinel) from
asserted into evidenced — *before* v0.9.0 depends on any of it. Nothing here
touches v0.7.0/v0.7.1 or any real release tag.

Steps marked **[JESSE]** need repo-settings or repo-permission acts only he
can perform (J51 is the immutable-releases settings click; approval item A4).
Everything else is dispatchable by anyone with Actions write access.

Record every step's outcome (run URL + verdict) in a dated note under
`docs/reviews/` when the rehearsal is executed.

## Preconditions

1. The RH-2 workflow/script changes are merged (or the rehearsal is run from
   the branch carrying them, dispatching workflows at that ref).
2. Main's gauntlet is green with `--require-admit` (the J39 external
   hand-off). Both `mint-artifact.yml` and `release.yml` run the admission
   gauntlet first, so **no step below can complete while main is red** — the
   rehearsal queues behind J39. (A tagless `release.yml` dispatch before then
   proves only YAML validity and the pre-gauntlet gates.)
3. `fetch:sources` must pass for the mint (RH-3/RH-4 re-pins landed), because
   the accept-path rehearsal needs a **real** mint attestation.

## Step 0 — Tagless dispatch (no tag, no Jesse)

`workflow_dispatch` `release.yml` on the target ref. Expected: the tagless
path runs the stale-descriptor refusal, admission gauntlet, and pack guard,
and promotes/publishes nothing (all promote steps are `if: startsWith(...,
'refs/tags/v')`). Green = the workflow edits parse and the gates that can run
without a tag stay green.

> Executed 2026-08-21 against the RH-2 branch (run 32457527716): checkout /
> npm ci green, then the FIRST gate — "Refuse to release against a stale
> descriptor" — correctly failed the run, because the committed descriptor
> still carries `stale.blocksRelease: true` (the v0.7.1 phantom, NEEDS-JESSE
> §1.9; cured only by RH-1's minted descriptor). That is the gate working,
> not a defect: re-run this step for a green result after the RH-1
> descriptor PR lands.

## Step 1 — Throwaway-tag rehearsal: signer-pin ACCEPT path

The `--signer-workflow` flag is regex-matched against the signing
certificate's SAN (cli/cli#9507), and GitHub's docs frame it around reusable
workflows — so the accept path is *expected* to work for
`actions/attest-build-provenance@v3` running directly in `mint-artifact.yml`,
but that is an assertion until this step evidences it.

1. Dispatch `mint-artifact.yml` with `release_tag: v0.0.0-releasetest2`.
   This produces a **draft** release (invisible to consumers) with a real,
   mint-signed `content.db` attestation.
2. Download the draft asset (token required) and run, from any checkout:

   ```bash
   gh release download v0.0.0-releasetest2 --pattern content.db --dir /tmp/rehearsal
   gh attestation verify /tmp/rehearsal/content.db \
     --repo jestek-dev/scripture-search-engine \
     --signer-workflow "jestek-dev/scripture-search-engine/.github/workflows/mint-artifact.yml"
   ```

   **Expected: PASS.** This is the evidence the pinned verify step in
   `release.yml` will accept a genuine mint.
3. **If it fails:** read the real SAN from the attestation —

   ```bash
   gh attestation verify /tmp/rehearsal/content.db \
     --repo jestek-dev/scripture-search-engine --format json \
     | jq '.[0].verificationResult.signature.certificate.subjectAlternativeName'
   ```

   — and switch `release.yml`'s verify step to `--cert-identity` with that
   full SAN string (same guarantee, no regex), then re-run this step to prove
   the fallback. Do not ship v0.9.0 on an unproven accept path.

## Step 2 — Throwaway-tag rehearsal: signer-pin REJECT path

1. On a throwaway branch, add a minimal `attest-test.yml` workflow with
   `attestations: write` + `id-token: write` that runs
   `actions/attest-build-provenance@v3` over the **same** downloaded
   `content.db` bytes. Dispatch it; delete the branch/workflow afterwards.
2. Verify the same bytes with the same pinned flags as Step 1.

   **Expected: FAIL.** The newest attestation over those bytes now comes from
   `attest-test.yml`; the pin must refuse it. (This is exactly the threat the
   pin closes: any branch-pushed workflow with `attestations: write` could
   attest arbitrary bytes that a bare `--repo` check accepts.) For
   completeness, confirm `gh attestation verify --repo` *without* the
   `--signer-workflow` flag accepts it — demonstrating the hole existed.

## Step 3 — [JESSE] Enable immutable releases (J51 / A4)

Settings → General → Releases → *(check)* **Immutable releases** (GA since
October 2025). Consequences to accept knowingly:

- Every release published **after** the toggle freezes its tag and assets at
  publish; fixes become roll-forward-only (v0.9.1, never a v0.9.0 asset
  swap). This is deliberate — swapping a published asset is the v0.7.1
  defect class the promote-only design exists to prevent.
- Drafts stay editable, so the mint's upload-to-draft flow and release.yml's
  upload-before-`--draft=false` sequence are unaffected.
- Already-published releases (v0.7.0, v0.7.1) stay **mutable** — deliberately
  left untouched (ship-forward, RH-1); the `release-integrity.yml` sentinel
  is their tamper alarm.

## Step 4 — Immutability + idempotence proof (needs Step 3)

1. Publish the throwaway release (`gh release edit v0.0.0-releasetest2
   --draft=false --prerelease`; keep `--latest` OFF so consumers never see it
   as latest).
2. `gh api repos/jestek-dev/scripture-search-engine/releases/tags/v0.0.0-releasetest2
   --jq .immutable` → **must be `true`.**
3. Attempt a mutation:

   ```bash
   gh release upload v0.0.0-releasetest2 /tmp/rehearsal/content.db --clobber
   ```

   **Expected: the API refuses.** Proof the guardrail exists, not decoration
   (CLAUDE.md gate discipline).
4. Re-run `release.yml` against the published throwaway tag (re-push the tag
   or dispatch at the tag ref): the promote step must log
   "already published — skipping asset upload and release edit" and the run
   must end **green** — the re-run-is-a-green-no-op property v0.9.0's DoD
   requires.
5. Dispatch `release-integrity.yml`: green. Then temporarily doctor a copy of
   an expectation ONLY in a scratch branch run if a live red-proof is wanted —
   the committed unit test (`eval/test/release-integrity-sentinel.test.ts`)
   already proves the red path; never edit the real pinned list to force red.

## Step 5 — Cleanup

Delete the throwaway release **and tag** (immutable releases block asset
edits, not deletion-by-admin — if deletion is blocked, leave it as a
prerelease named `v0.0.0-releasetest2`; it is harmless and documents the
rehearsal). Delete `attest-test.yml` and its branch. Record outcomes (run
URLs, accept/reject verdicts, the `immutable: true` API response, the
`--clobber` refusal text) in `docs/reviews/`.

## Exit criteria (mirrors RH-2's DoD)

- [ ] Accept path proven: pinned verify passes against a real mint
      attestation (or the `--cert-identity` fallback landed and proven).
- [ ] Reject path proven: an other-workflow attestation over the same bytes
      fails under the pinned flags.
- [ ] `immutable: true` observed via the API on a post-toggle release.
- [ ] `--clobber` against a published immutable release refused.
- [ ] Re-running release.yml on a published tag is a green no-op.
- [ ] Sentinel dispatch green; red path proven by the committed unit test.
