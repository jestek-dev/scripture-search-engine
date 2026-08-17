# Probe baseline re-review - TEMPLATE (approval schema v2 cutover)

> STATUS: NOT YET PERFORMED. This file is the template the independent
> reviewer Jesse designates fills in. Until it is completed, the committed
> approval remains the 2026-08-10 v1 record (whose independence the
> 2026-08-14 audit disputes), and the v2 cutover commit — the one that
> re-issues the approval in v2 form and removes v1 acceptance from the
> gauntlet — stays unopened. Holding the cutover with the signature is what
> keeps the repository green without ever weakening a check: the schema flip
> and the real signature land together, or not at all.

## Why this re-review exists

The 2026-08-10 review record's independence is disputed by the 2026-08-14
audit (see the dated note appended to `docs/reviews/2026-08-10-probe-baseline-review.md`).
Approval schema v2 (already enforced by the gauntlet for any approval that
declares it) rejects blank identities, blank attestations, and unbound
evidence. This review re-issues the approval in v2 form for the unchanged,
then-current baseline — same digests, genuinely independent eyes. The cutover
commit deletes v1 acceptance in the same change, so the disputed record
cannot outlive the re-review.

## Reviewer instructions

1. Confirm designation by Jesse for this specific review.
2. Generate the packet for the exact baseline under review, using the
   repository's gitignored scratch directory (review records carry
   repository-relative paths only — see
   `docs/governance/probe-baseline-review.md`):

   ```
   mkdir -p eval/.runs
   git show 1fc76aa59d987877849a96642604981b0d858145 > eval/.runs/probes-before.json
   npm run review-packet --workspace eval -- --before eval/.runs/probes-before.json --after eval/baselines/probes.json
   ```

3. Read every changed probe's before/after table and metric deltas.
4. Record the verdict below, then author the approval: copy the digest
   footer values into `eval/baselines/probes.approval.json`, fill
   `reviewerName`, `reviewerContact`, and `independence` in your own words,
   and set `evidence.sha256` to this file's SHA-256 once it is final.

## Review record

- Reviewer name: TODO
- Reviewer contact: TODO
- Review date: TODO
- Independence attestation: TODO — name what you did not author.
- Baseline reviewed: `eval/baselines/probes.json` at canonical-JSON SHA-256
  `6f3c6c0c5ef11daad7d88ead586160db151eb017ee23ee60f314137794d36fda`
- Probe definitions: `eval/probes/probes.json` at canonical-JSON SHA-256
  `3d437b030362d5e717a048cf2b163129b7a530a49fc0f2921c0de37e8aaf8d50`

## Verdict

TODO — accepted or rejected, with the per-probe reasoning the packet
supports. A rejection reopens the baseline as an explicit Jesse decision,
never an automatic revert.
