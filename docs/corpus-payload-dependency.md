# Corpus-expansion payload — dependency statement (DG-16 / plan P2.6)

**Status: BLOCKED as of 2026-08-21.** This record is discharged when the WEB
re-pin PR (plan P2.1 / RH-3) merges and the corpus-expansion PR (plan P4.15 /
DG-15, "PR-β") becomes schedulable. Until then, nothing enumerated below may
ship, and nothing enumerated below may be booked as a curation failure.

This is a statement of dependency, not a work item: the data side does no
work here (plan P2.6: "Files: none touched by data work — all release-side,
P2.1's"). It exists so that no one builds a concept pack against the stale
corpus by accident, and so the mega-sweep's planners can tell a
corpus-blocked row from a curation defect.

## 1. What is blocked

The corpus-expansion payload — everything blocked "on the fixture corpus,
not on soundness":

- **The blocked-association backlog**, consolidated in
  `docs/research/2026-08-18-books-harvest-corpus-backlog.md` (§1 round-1
  fixture needs, §2 corpus-blocked topics, §3 blocked refs by destination,
  §4 highest-leverage chapters). The plan and audit carry this backlog as
  "the 338-association backlog" (audit F34); the ledger itself is the
  authoritative enumeration — see §6 below for the verified count and
  counting rule. The payload is defined by the ledger's contents, not by the
  headline number.
- **Every Phase-4 item's "deferred" list** (plan P4.1–P4.14): each item
  ships its in-corpus portion and encodes its out-of-corpus refs as explicit
  deferrals riding DG-15.
- **The guard families whose reach the re-pin expands.** Three distinct
  situations — the assertion type in each is settled, and changing it is
  Jesse's call, not an implementer's:
  - **Job 16:2 (`holy-spirit-the-comforter`) and Eccl 1:9 (`new-creation`)**
    guard by `mustNotLead` + `preferredOrder` — NOT `mustNotRank` — per
    Jesse's 2026-08-15 audit ruling recorded in both fixtures: these
    sense-inversion verses are "demoted, never forbidden"; a mustNotRank
    would forbid an honest lexical result. Those *ordering* assertions
    currently pass vacuously (Job 16 and Ecclesiastes 1 are absent from the
    corpus; the Guard vacuity report names both VACUOUS by design), and the
    re-pin turns them from prose into measured guards. Do not "activate"
    them by adding mustNotRank — that contradicts the recorded ruling.
  - **The `prosperity-*` fixtures carry no vacuous assertion today.** Every
    mustNotRank ref they list (Luke 6:38, Mal 3:10, Phil 4:19, Mark 11:24,
    John 14:12, 14:13, 14:14) is deliberately IN the 211-chapter corpus —
    the fixture notes: "precisely so this assertion can fail." (Josh 1:8 is
    the family's asserted counter-example, not a forbidden ref: it is
    `prosperity-success.json`'s expectedTop — honest lexical retrieval of
    its own "good success" — because "Verses are never the problem;
    pairings are.") The classic out-of-corpus proof-texts (John 10:10,
    Job 36:11, Prov 18:16, 3 John 1:2) are intentionally excluded from the
    lists to avoid vacuous passes. Where each is recorded: Prov 18:16,
    3 John 1:2, and Job 36:11 are watchlist entries in
    `ontology/flagged-pairings.yaml`; John 10:10 is named in
    `prosperity-abundance.json`'s note ("left to a future corpus-selection
    change"); Job 36:11 is also `docs/DOCTRINAL-BASIS.md` §3's worked
    example (Prosperity→Job 36:11). All four become assertable only when
    the re-pin lands their chapters.
  - **Prov 18:16 has no guard fixture today** — only a watchlist entry in
    `ontology/flagged-pairings.yaml` plus the ledger's §0 caution that the
    PR adding Proverbs 18 should bring a prosperity-family guard with it.
  What the re-pin unblocks here is *assertion reach* — the guard families
  gain the verses they were designed to police. No assertion needs its type
  changed, and none is edited to "activate" it: the two vacuous ordering
  guards (comforter, new-creation) become measured automatically when
  their chapters land, the prosperity families have no vacuous assertion
  to flip, and any assertion-type change remains Jesse's call.
- **The unpardonable-sin trio** (Matt 12:22-32 / Mark 3:22-30 / Luke 12:10):
  the pending fixture `eval/golden/unpardonable-sin.json` and the
  blasphemy-against-the-spirit concept it gates.
- **1 Tim 2:1-2** — "the top single unblock": the naming text of the
  admitted `praying-for-leaders` pack, to become its 1.0 anchor and
  expectedTop in the corpus PR.

## 2. What it is blocked on, exactly

Three named dependencies, in order:

1. **The J52 errand (Jesse's, not a PR).** Capture the upstream snapshot
   ONCE, hash it immediately, upload it to the `source-snapshots-2026-08`
   GitHub Release BEFORE any manifest edit (`docs/source-repins.md` step 1);
   run the two documented CDX/hash archive-search commands for the old
   `3458ca34…` bytes, and sign off the loss only if that search comes back
   empty. No manifest edit may precede the upload.
2. **P2.1's WEB re-pin PR itself** ("PR-α", executed per
   `docs/source-repins.md` steps 1–8): re-pin
   `pipeline/manifests/web.json` to the archived bytes with
   `rollingSourceUrl: true` + `archiveUrl` + provenanceNote, regenerate
   `pipeline/fixtures/web-subset.json` and downstream subsets in dependency
   order, re-baseline. A checksum is never edited in place.
3. **J39 independent approvals.** The regenerated baselines need chained v2
   approval records that no agent may author, and the re-pin merges queue
   behind main's gauntlet going green with `--require-admit` (the RH-5
   external hand-off).

Verified drift state, 2026-08-21 (local `npm run check:drift`, red by
design): `web.json` pins archive sha256 `3458ca34…` (4,281,524 B) with
content fingerprint `335445ef…`; upstream now serves archive
`b6f55cc7…` (4,281,529 B) unpacking to content `944e3883…`. The archive
hash has rolled again since plan time (2026-08-20 observed `c860b546…` —
a fourth distinct upstream hash), while the upstream content fingerprint is
unchanged at `944e3883…` ≠ pinned — genuine content drift, so the fixture
corpus cannot be regenerated or expanded until the re-pin lands. The
sibling OpenBible re-pins (plan P2.2 / RH-4: `openbible-topics` pinned
`2239700d…` vs upstream `2647baf7…`; `openbible-xrefs` pinned `36d1b198…`
vs upstream `22c26dd6…`) ride the same errand and gate the OpenBible-cut
subsets, which regenerate after WEB.

## 3. The two obligations (DG-16's whole content)

**(i) Payload specification before the re-pin runs.** DG-15's payload
specification — the chapter-expansion list, the association manifest, and
the guard-fixture set — is delivered to the release side BEFORE the re-pin
executes, so that PR-α and PR-β compose in **one regeneration cycle**. The
split is by NO-MEASURABLE-EFFECT polarity and is load-bearing:

- **PR-α (P2.1, the re-pin)** is a PURE re-pin claiming no value — G8
  `NO MEASURABLE EFFECT` is the DESIRED outcome. The chapter expansion does
  not ride inside it (one PR per claim).
- **PR-β (P4.15, the expansion + associations)** MUST have measurable
  effect, fixture-first, per the unpardonable-sin precedent: concept,
  chapters, and active fixture assertion land together.

The payload rides the re-pin's regeneration cycle: because the
specification arrives before PR-α runs, the corpus is regenerated once and
PR-β follows immediately on the re-pinned corpus — not in a second
regeneration cycle, and never folded into the re-pin diff.

**(ii) Nothing ships outside the current corpus until the re-pin lands.**
No anchor or fixture assertion whose verse is outside the current fixture
corpus — `pipeline/fixtures/web-subset.json`, verified 2026-08-21 at
**211 chapters / 5,667 verses** — ships until the re-pin lands. Every
Phase-4 item's "deferred" list encodes this discipline; assertions on
absent verses ship `pending` with explicit F34 activation notes, never
silently vacuous.

## 4. For auditors and the mega-sweep

A row blocked by this statement is **corpus-blocked, not failed**. The dated
blocked/unblocked baseline is DG-1's research doc,
`docs/research/2026-08-21-audit-gap-verification.md`, which records the
drift state and per-gap verdicts at sweep time. Discharge of this statement
is tracked by P2.1's own gates (`check:drift` proven red-then-green both
ways, G1 provenance, chained approvals) — it has no gates of its own.

## 5. Covenant note

No `ENGINE_VERSION` bump anywhere in this dependency: the re-pin moves
identity through `corpusFingerprint` and the associations through
`layerFingerprint` (`docs/source-repins.md` §7). The one prohibition stands:
a checksum is never edited in place.

## 6. Verified counts (2026-08-21)

- Fixture corpus: 211 distinct chapters, 5,667 verses
  (`pipeline/fixtures/web-subset.json`).
- Backlog ledger: at the granularity "each reference entry as printed in the
  ledger's tables, a range or chapter-list entry counting once", the backlog
  doc enumerates **267 blocked reference entries across 131 table rows**
  (§1: 18 entries / 13 rows; §2: 52 / 19; §3: 197 / 99). §2's 52 excludes
  Matt 24:21, which the ledger itself marks "(in corpus)" — in-corpus
  entries are not blocked, so a naive split's 53 counts one entry too many.
  The two slash-pair rows are read by role, not by a uniform rule: §2's
  talents/minas pair (Matt 25:14-30 / Luke 19:11-27) counts as two
  passages, while §3's "Psalm 17:8 / Psalm 63:7" counts as one
  alternates-entry — splitting both would make §3 = 198, splitting neither
  would make §2 = 51, so the 267 total is counting-rule-sensitive at ±1.
  The plan's "338
  backlog associations" (F34) was counted at audit time under a finer
  association granularity; the ledger's tables are authoritative for what
  PR-β must carry, and its DoD is a zero-or-enumerated remainder in that
  doc, not a number hit.
- Pins: WEB `3458ca34…`/4,281,524 B/content `335445ef…`;
  openbible-topics `2239700d…`; openbible-xrefs `36d1b198…`;
  `eval/budgets.json` still acknowledges both OpenBible sources as
  unarchived-rolling (list empties in P2.2's PR, same commit as the
  `archiveUrl`s).

---

Companion process doc: `docs/source-repins.md` (how a re-pin executes).
Payload contents: `docs/research/2026-08-18-books-harvest-corpus-backlog.md`.
Plan items: P2.1 (re-pin), P2.6 (this statement), P4.15 (payload).
