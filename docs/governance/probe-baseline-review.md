# Independent probe-baseline review

The G8 baseline (`eval/baselines/probes.json`) is the record of what the
engine's result lists looked like when a human last said "this is acceptable."
Every later build is measured against it, so moving the baseline is the one
change that can make results quietly worse while every gate stays green. That
is why a baseline move carries its own review record — and why that record is
worth nothing if the person who signs it is the person who made the change.

## Who can sign

An approval (`eval/baselines/probes.approval.json`) is valid only when its
reviewer:

1. **did not author the change** that moved the baseline — not the data, not
   the code, not the proposal;
2. **is a distinct identity** from the repository owner acting alone on his
   own machine — a second pair of eyes, not a second hat;
3. **is designated by Jesse, per review.** There is no standing reviewer
   role: for each baseline move Jesse names who qualifies for that review,
   and his PR merge remains the final human gate regardless of who signed.

A reviewer who cannot truthfully write down what they did not author must not
sign. The approval schema makes that attestation an explicit field, so a
rubber stamp is at least a visible lie rather than a default.

## What the reviewer sees

The reviewer works from the generated review packet, not from raw diffs:

```
npm run review-packet --workspace eval -- --before <old-baseline.json> --after eval/baselines/probes.json
```

The packet renders, for every changed probe: the query and its intent, the
before/after top-10 with each verse id decoded to a human-readable reference
and marked **added** / dropped / moved, and the metric deltas (top-10 churn,
weak-reason share rise, mean top score, result count) against the reviewed
budgets in `eval/budgets.json`. Adversarial probes that must return nothing
are called out explicitly. The packet's footer prints exactly the digest and
identity values the approval must bind.

The packet tool is read-only. It never writes the approval, and
`--update-baseline` on the gauntlet writes only the baseline — no code path
in this repository authors an approval. The workbench only validates and
carries an approval file the reviewer authored.

## Where the artifacts live

| Artifact | Path |
|---|---|
| Probe definitions | `eval/probes/probes.json` |
| Baseline | `eval/baselines/probes.json` |
| Approval | `eval/baselines/probes.approval.json` |
| Review records | `docs/reviews/YYYY-MM-DD-*.md` |
| Budgets consulted | `eval/budgets.json` |

Review records use repository-relative paths only. Absolute local paths in a
review record — home directories, Windows drive paths, `file://` URLs, and
system temp directories such as `/tmp` alike — are evidence that the review
happened on one specific person's machine and are rejected by
`workbench/test/docsGovernanceGuard.test.ts`. Scratch files a review needs
(for example the prior baseline extracted for the packet's `--before` input)
belong in the gitignored `eval/.runs/` directory, so the commands a record
quotes stay repository-relative and reproducible.

## Procedure

1. The change author regenerates the baseline (`npm run gauntlet -- --update-baseline`)
   and generates the packet against the prior committed baseline.
2. Jesse designates the independent reviewer for this move.
3. The reviewer reads the packet, writes the dated review record under
   `docs/reviews/`, and authors the updated approval binding the exact
   digests the packet's footer prints — including their name, contact, the
   independence attestation, and the review record's path and SHA-256.
4. The baseline diff and the approval diff land **in the same batch**; the
   publish path fails closed (`probe_approval_missing` /
   `probe_approval_orphaned` / `probe_approval_mismatch`) when either travels
   alone or the bindings disagree.
5. The gauntlet re-validates the approval on every run; G8 fails on any
   missing, malformed, or mismatching approval.
6. Jesse merges the PR by hand. A rejection by the reviewer reopens the
   baseline as an explicit Jesse decision — never an automatic revert.

## Approval schema cutover (v1 → v2)

The committed approval is still the v1 record while its v2 re-review
(`docs/reviews/2026-08-15-probe-baseline-re-review.md`) is pending. The
gauntlet already enforces the full v2 schema for any approval that declares
it; the cutover commit — the one that re-issues the committed approval as a
signed v2 record and deletes v1 acceptance — is **held unopened until the
designated reviewer signs**. A commit that would turn the suite red is not a
deliverable, and a signature is not something this repository can produce for
itself; holding the two together is how both facts stay true.

### Open decision — Jesse

Schema v2 **replaces** v1's free-text `reviewer` field with `reviewerName` /
`reviewerContact` / `independence` rather than adding `reviewerName`
alongside it, as the plan's wording ("adds") could be read. Rationale: the
schema is exact-keys, and keeping the disputed free-text role field beside
its replacement would preserve exactly the ambiguity v2 exists to remove.
This is a deviation from the plan text and it is Jesse's call — if he wants
`reviewer` retained, the change is confined to the v2 shape in
`eval/src/gates/probes.ts` and its tests, before the cutover commit is
prepared.
