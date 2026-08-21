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

How gh actually verifies (read from cli/cli source; load-bearing for both
this step and Step 2):

- **Any-match over all attestations.** `gh attestation verify` fetches every
  attestation recorded for the artifact's digest (up to `--limit`, default
  30) and succeeds when **at least one** satisfies the policy —
  `LiveSigstoreVerifier.Verify` (verification/sigstore.go) and
  `VerifyCertExtensions` (verification/extensions.go) both fail only when
  *zero* attestations verify. There is no "newest attestation" semantics.
- **The pin is a literal prefix, not a user regex.** `validateSignerWorkflow`
  (verify/policy.go) builds `https://github.com/<value>`,
  `regexp.QuoteMeta`-escapes the whole URL (dots literal), and anchors it
  with `^`. The missing end anchor is what admits the SAN's `@<ref>` suffix
  (`…/mint-artifact.yml@refs/heads/main`).

GitHub's docs frame `--signer-workflow` around reusable workflows — the
accept path is *expected* to work for `actions/attest-build-provenance@v3`
running directly in `mint-artifact.yml`, but that is an assertion until this
step evidences it.

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

   — to see what the certificate really carries, then switch `release.yml`'s
   verify step to `--cert-identity-regex` pinned to the path prefix:

   ```
   --cert-identity-regex '^https://github\.com/jestek-dev/scripture-search-engine/\.github/workflows/mint-artifact\.yml@'
   ```

   (Do **not** use exact `--cert-identity` with the full SAN string: the SAN
   ends in `@<ref>`, so an exact pin freezes the mint's ref and breaks the
   day a mint is dispatched from any other ref. The prefix regex gives the
   same signer guarantee as `--signer-workflow`.) Re-run this step to prove
   the fallback. Do not ship v0.9.0 on an unproven accept path.

## Step 2 — Throwaway rehearsal: signer-pin REJECT path

Because verification is **any-match over all attestations for a digest**
(see Step 1), the reject path can NOT be rehearsed by re-attesting the
Step-1 `content.db` bytes with another workflow: the original mint
attestation over those bytes is permanent (transparency log + GitHub's
attestation store; gh has no delete), still satisfies the pin, and the
pinned verify would **PASS** — proving nothing. The discriminating bytes
must be bytes that have **never been minted**, so that no attestation
matching the pin exists for their digest.

1. Generate fresh throwaway bytes no mint has ever attested, e.g.
   `head -c 1024 /dev/urandom > never-minted.bin` (record their sha256).
2. On a throwaway branch, add a minimal `attest-test.yml` workflow with
   `attestations: write` + `id-token: write` that produces those bytes
   (commit them, or generate in-run and log the sha256) and runs
   `actions/attest-build-provenance@v3` over them. Dispatch it; delete the
   branch/workflow afterwards.
3. Verify the fresh bytes with the same pinned flags as Step 1:

   ```bash
   gh attestation verify never-minted.bin \
     --repo jestek-dev/scripture-search-engine \
     --signer-workflow "jestek-dev/scripture-search-engine/.github/workflows/mint-artifact.yml"
   ```

   **Expected: FAIL (non-zero exit).** The only attestation for those bytes
   comes from `attest-test.yml`; nothing matches the mint pin, so any-match
   finds zero verified attestations.
4. Re-verify the same fresh bytes with `--repo` only (drop
   `--signer-workflow`).

   **Expected: PASS.** This is exactly the hole the pin closes: any
   branch-pushed workflow with `attestations: write` can attest arbitrary
   bytes that a bare `--repo` check accepts. FAIL-with-pin plus
   PASS-without-pin on the *same* bytes together prove the pin — and only
   the pin — rejects a foreign signer.

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
      attestation (or the `--cert-identity-regex` prefix fallback landed and
      proven).
- [ ] Reject path proven: fresh never-minted bytes, attested only by another
      workflow, FAIL under the pinned flags and PASS under bare `--repo` —
      isolating the pin as the thing doing the rejecting. (Re-attesting
      already-minted bytes proves nothing: verification is any-match, and
      the permanent mint attestation would still satisfy the pin.)
- [ ] `immutable: true` observed via the API on a post-toggle release.
- [ ] `--clobber` against a published immutable release refused.
- [ ] Re-running release.yml on a published tag is a green no-op.
- [ ] Sentinel dispatch green; red path proven by the committed unit test.
