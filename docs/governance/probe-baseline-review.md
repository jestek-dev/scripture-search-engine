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

The packet tool is read-only. It never writes the approval, and the
gauntlet's update flags (`--update-baseline`, `--update-ordering-snapshot`,
`--update-rank-baseline`) write only their baseline or snapshot — no code
path in this repository authors an approval. The workbench only validates and
carries an approval file the reviewer authored.

## Where the artifacts live

| Artifact | Path |
|---|---|
| Probe definitions | `eval/probes/probes.json` |
| Baseline | `eval/baselines/probes.json` |
| Approval | `eval/baselines/probes.approval.json` |
| Rank-metrics baseline | `eval/baselines/rank-metrics.json` |
| Rank-metrics approval | `eval/baselines/rank-metrics.approval.json` |
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
   independence attestation, the review record's path and SHA-256, and the
   packet's own SHA-256 (printed on stderr at generation time).
4. The baseline diff and the approval diff land **in the same batch**; the
   publish path fails closed (`probe_approval_missing` /
   `probe_approval_orphaned` / `probe_approval_mismatch`) when either travels
   alone or the bindings disagree.
5. The gauntlet re-validates the approval on every run; G8 fails on any
   missing, malformed, or mismatching approval.
6. Jesse merges the PR by hand. A rejection by the reviewer reopens the
   baseline as an explicit Jesse decision — never an automatic revert.

## Approval schema v2 and the v1 grandfather

Schema v2 — `…/probe-baseline-approval/v2` and its mirror
`…/ordering-snapshot-approval/v2` — makes the approval an accountable record.
Beyond v1's digest and identity bindings it requires:

- `reviewerName` / `reviewerContact` — a stable, named reviewer handle, not a
  free-text role;
- `independence` — the attestation naming the reviewed change and what the
  reviewer did **not** author;
- `evidence` — the `docs/reviews/` review record's repository-relative path
  and the SHA-256 of its bytes;
- `reviewPacketSha256` (probe-baseline approvals only) — the SHA-256 of the
  review packet file the decision was read from; the packet tool prints it on
  stderr, and `sha256sum` on the saved packet reproduces it. The
  ordering-snapshot approval binds no packet digest: no packet renders
  ordering movement, so its rendered evidence is the review record itself;
- `priorProvenance` — required non-null, except beside an explicit
  `bootstrap` field documenting why no prior record exists to chain.

Enforcement, proven by unit tests (`eval/test/probe-approval.test.ts`,
`eval/test/ordering-snapshot.test.ts`): the already-committed v1 records stay
valid — grandfathered by their exact fingerprint identity, with none of their
original checks loosened. A v1 approval binding any other identity, or one
whose `reviewedAt` postdates the v1 sunset (2026-08-20), fails the gauntlet
with a named finding: every new approval is authored in v2. The schema change
edited no committed approval file; the v1 records (including the pending
re-review noted in `docs/reviews/2026-08-15-probe-baseline-re-review.md`)
retire naturally when their identities are next re-baselined.

## Rank-metrics baselines and the null-threshold protocol

The rank-quality thresholds in `eval/budgets.json` (`rankQuality`: nDCG@10
overall and per battery category, MRR@10, goodOrBetterTop3Rate — micro-integer
units, value × 10⁶) are born **null**. A null threshold means measured and
reported: the Admission Report prints the value with `(no threshold — baseline
not yet established)` and it is never counted as a pass and never as a fail —
"a guessed threshold that never fires is worse than an absent one" (CLAUDE.md).
The one non-null sub-block at introduction is `battery.categoryFloors`: the
nine seed counts of the transcribed battery, which are structural facts about
the committed specimen set, not guessed quality numbers.

### The only path from null to a number

1. **≥ 3 ADMIT runs on main** establish a measured history for the metric
   being armed.
2. The change author runs the gauntlet with `--update-rank-baseline` against
   an explicit artifact target. This writes `eval/baselines/rank-metrics.json`
   **only** — the machine never writes an approval, the same discipline as
   `--update-baseline` and `--update-ordering-snapshot`.
3. An **independent reviewer** — same qualification rules as "Who can sign"
   above, designated by Jesse per review — reads the review packet (generated
   with `--rank-before <prior> --rank-after eval/baselines/rank-metrics.json`;
   the packet renders per-category metric deltas and prints every digest the
   approval must bind) and hand-authors
   `eval/baselines/rank-metrics.approval.json`. There is no v1 generation for
   this record: it is born under the accountable-record schema
   (`…/rank-metrics-approval/v2` — named reviewer, contact, independence
   attestation, `docs/reviews/` evidence binding, `reviewPacketSha256`,
   `priorProvenance` chained to the prior baseline's git blob, or null beside
   an explicit `bootstrap` field for the first record). Beyond the probe
   approval's bindings it also binds `batteryQueriesSha256` and
   `batteryJudgmentsSha256`: the metrics are a function of the judgment set,
   so a changed set re-opens the baseline.
4. **The same PR** flips the chosen nulls in `eval/budgets.json` to values,
   quoting the run history from step 1. Jesse's merge is the sign-off on each
   flip.

The gauntlet enforces this ordering structurally, on every run including the
fixture CI legs: a non-null `rankQuality` threshold with no approved baseline
pair on disk fails G12 with a named finding, as does a committed
`rank-metrics.json` whose approval is missing, malformed, tampered, or bound
to different digests. Steps 1–4 cannot begin while main's standing G2/G8
approval debt is open — a rank baseline minted now would chain from an
unratified identity — so the first execution of this protocol is, by
definition, a later PR after that debt clears.

### Rolling a threshold back

Reverting a flipped threshold is a reviewed data change like the flip itself:
set it back to `null` and leave a dated `$comment` tombstone beside it saying
why (the `noise.$comment_minMeanDistinctiveness` pattern in
`eval/budgets.json`). Never delete the key silently — a threshold that
vanishes reads as never having existed.

### Open decisions — Jesse (J40)

- The reviewer-identity scheme — who counts as a named, accountable handle in
  `reviewerName` / `reviewerContact` — is Jesse's call, per "Who can sign".
- The in-flight external re-approvals for main's current identity (the
  outstanding G2/G8 candidates) are **offered** direct-v2 authoring: a v1
  record dated after 2026-08-20 will fail the gauntlet, so authoring in v2 is
  one review instead of review-then-migrate. Jesse may instead adjust the
  sunset at PR review; nothing here decides for him.
- Schema v2 **replaces** v1's free-text `reviewer` field with `reviewerName` /
  `reviewerContact` / `independence` rather than adding `reviewerName`
  alongside it, as the plan's wording ("adds") could be read. Rationale: the
  schema is exact-keys, and keeping the disputed free-text role field beside
  its replacement would preserve exactly the ambiguity v2 exists to remove.
  If he wants `reviewer` retained, the change is confined to the v2 shapes in
  `eval/src/gates/probes.ts` / `eval/src/gates/orderingSnapshot.ts` and their
  tests.

---

# Explanation-faithfulness audit (E7) — PROTOCOL DRAFT, pending J45

**Status: DRAFT. Nothing below is in force until Jesse approves the protocol
and the sample size, and names the auditor (himself or a designee) — that is
J45's whole content. The sampler tool exists and is tested; no audit has been
executed, and none may be executed under this draft.**

Covenant #5 makes the explanation part of the contract; fixtures pin specific
labels, but between fixtures nothing measured whether the chips a release
shows say what the underlying data says. E7 closes that with a per-release
human audit over a deterministic sample.

## The sample (mechanical, not discretionary)

`eval/src/faithfulnessSample.ts` builds the audit packet; the construction is
fully specified so the same identity triple yields byte-identical packets on
any machine (tested in `eval/test/faithfulness-sample.test.ts`):

- seed = sha256 of the newline-joined identity triple
  `(engineVersion, corpusFingerprint, layerFingerprint)`;
- a sha256-counter uint32 stream (`sha256(seed:counter)`, 8 big-endian words
  per digest);
- candidate pool = every actually-existing `(query, rank)` pair over the
  ACTIVE battery queries in file order (zero-result and non-discovery
  outcomes contribute no pairs);
- unbiased rejection sampling without replacement down to the sample size;
  a pool smaller than the request is taken whole with the **shortfall
  recorded, never padded**.

Sample size **defaults to 50** (the plan's number) and is a CLI parameter
(`--sample-size`) because the number is Jesse's to adjust — the tool does not
decide it. Generate a packet with:

    npm run faithfulness-sample --workspace eval -- \
      --database <release-candidate content.db> \
      --out docs/reviews/<YYYY-MM-DD>-faithfulness-<engineVersion>.json

## The audit (human, J45-gated)

1. The auditor (Jesse or his named designee) opens the packet. Every chip
   carries its rendered label, points, provenance, and the underlying
   evidence rows fetched through the same `ContentQueryPort` (anchor rows,
   cross-reference edges, verse-term profiles, translation-token stems; for
   the lexical families the verse text itself is the evidence).
2. For EACH chip the auditor replaces `verdict: null` with `"FAITHFUL"` or
   `"MISSTATED"`. The tool never pre-fills a verdict; a packet with any
   remaining `null` is an unfinished audit, not a passing one.
3. The marked packet is committed under `docs/reviews/` in a reviewed PR,
   with the auditor named in the PR description.
4. **Any MISSTATED chip is a G3-class defect**: it is fixed WITH a
   label-pinning fixture in the fixing PR (right rank + wrong reason = G3
   failure, covenant #5), and the audit is re-run for the fixed identity.
5. E6's S3 criterion reads the record: S3 is MET only when a committed audit
   for the CURRENT release identity exists with zero misstated (or all
   misstatements fixed and re-audited). No record → NOT EVALUABLE, which
   never satisfies.

## Open decisions — Jesse (J45)

- Approve or amend this protocol and the sample size (50 is the plan
  default, deliberately parameterized).
- Name the auditor: you, or a designee (the designee must be able to read a
  chip and its evidence rows; independence rules from the baseline review
  above do NOT automatically apply here — that is your call too).
- First execution target: the plan's DoD is one full audit on the terminus
  release candidate (P7.6) — sequencing is yours.
