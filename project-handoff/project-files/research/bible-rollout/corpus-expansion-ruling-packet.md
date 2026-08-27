# Corpus-expansion ruling packet — for Jesse

**Date:** 2026-08-26 · **Prepared for:** Jesse · **Reading time:** ~15 minutes

## What happened, in four sentences

Per your 16:03Z go, the full-Bible fixture-corpus expansion (PR-β's corpus half) was built and proven deterministic: 5,726 → 31,098 verses, all 66 books, both before/after states rebuilt and fingerprint-verified, with the OpenBible/distillate subsets quarantined exactly as PR #53's FINDING requires (their 23 topic rows / 1,835 edges are byte-identical before and after, and the xref-suppression tests pass 7/7). Nothing broke as harm: no mustNotRank or pastoral-guard assertion failed anywhere. The expansion is blocked on exactly one thing: it activates 441 dormant curated anchors plus full-Bible lexical competition, which moves **28 active golden-fixture expectations across 16 fixtures** — and 3 of those fixtures are the same ones your pending catch-up ruling (PR #53's FINDING, 8 moves / 6 fixtures) already covers. One ruling from you over the combined disposition table below unblocks both the expansion and the catch-up at once.

**What we need from you:** one pass over the disposition table. Reply **"approved as proposed"** or give line edits on the rows you'd decide differently. Every "recommended disposition" is Claude's proposal for your review — none is executed until you rule.

---

## Corpus identity, before → after

| | before (origin/main `e762d1c`) | after (branch `87fd68c`) |
|---|---|---|
| chapters with fixture verses | 215 (213 full + 2 verse-level) | 1,189 (all 66 books) |
| verses | 5,726 | 31,098 (full WEB VPL; textless refs omitted by the importer) |
| corpusFingerprint | `644b241cdec3…` | `6450b7d79c8c…` |
| layerFingerprint | `b24ea16d304e…` | `b2c1fc849e65…` |
| engineVersion | 0.14.0 | 0.14.0 — **no bump**, per covenant (no engine code changed) |
| committed `web-subset.json` | 1.37 MB | 7.68 MB |
| in-corpus editorial anchors | 1,158 | 1,599 (**+441 dormant anchors activate**) |
| OpenBible topic rows / xref edges | 23 / 1,835 | 23 / 1,835 (**quarantine held**) |
| translation tokens | 53,160 | 307,923 |

Source is the exact pinned bytes (`b6f55cc7…`, sha256-verified against the `source-snapshots-2026-08` release asset). Gauntlet on the expanded bed: G1, G4–G7, G9–G11 PASS (p95 latency 40.3 ms of 150 on 31k verses; saturation 0.2833 — still paying for itself). G2/G8 red only on the withheld baseline/approval regeneration (determinism itself replays identically). **G3 is the one real blocker — the 28 moves below.**

---

## THE DISPOSITION TABLE — 32 rows (union of the expansion's 28 moves and the catch-up's 8; 3 fixtures overlap)

Classes: **(a)** a recorded design in the fixture's own note, executable verbatim · **(b)** a recorded direction whose target was left unspecified · **(c)** pure adjudication, nothing recorded · **(d)** catch-up-ruling move (PR #53 FINDING). Rows marked **(c)+(d)** or **(b)+(d)** sit in both rulings — deciding them here settles them for the catch-up too.

Recommendation principles used: class (a) executes the recorded design verbatim; class (b) proposes a specific target grounded in the measured results; class (c) prefers the theologically-correct verse for the concept over weight distortion; explanation-contract rows get the minimal fix that preserves the contract. **No recommendation weakens any guard's harm-class assertion** — every mustNotRank / mustNotLead stays exactly as written (all held under measurement).

| # | Fixture | Query | Current expectation | Measured on the expanded corpus | Class | RECOMMENDED disposition (Claude's proposal — your call) |
|---|---|---|---|---|---|---|
| 1 | providence-meant-for-good | "god meant it for good" | Phil 1:12 within top 10 | **Gen 50:20 is #1** (Exact phrase + Theme chips) | (a) | Execute the note verbatim: expectedTop → Genesis 50:20; Phil 1:12 → alsoAcceptable. |
| 2 | providence-meant-for-good | "you meant evil against me" | Phil 1:12 within top 10 | Gen 50:20 leads (its own verbatim phrase) | (a) | Same as row 1 — the note says "in the same PR as the corpus change". |
| 3 | providence-meant-for-good | "god used it for good" | Phil 1:12 within top 10 | Gen 50:20 leads | (a) | Same as row 1. |
| 4 | covenant-abrahamic | "abrahamic covenant" | Gal 3:15-18 within top 5 | Gal 3:15-18 out of top 5; Genesis 15/17 now in corpus | (a) | Execute the note: expectedTop → Genesis 15:7-18; Gal 3:15-18 → alsoAcceptable. The note conditions this on "the corpus-extension request is approved" — we read your full-Bible go as that approval; confirm. |
| 5 | covenant-abrahamic | "covenant with abraham" | Gal 3:15-18 within top 5 | as row 4 | (a) | Same as row 4. |
| 6 | waiting-for-a-child | "struggling to conceive" | Gen 16:1-2 within top 3 | Newly-activated narrative anchors lead: 1 Sam 1:9-20, Ps 113:9, Gen 25:21, Gen 21:1-7, Luke 1:13; Gen 16:1-2 at #6 | (b) | The pack was designed for exactly this ("narrative anchors lead once the corpus extension lands") but names no new #1. Propose: expectedTop → **1 Samuel 1:9-20** (Hannah — the concept's fullest narrative and the measured leader) within top 3; Gen 16:1-2 and Isa 54:1 → alsoAcceptable. Mark 11:24 pastoral mustNotRank untouched (it did not breach). |
| 7 | waiting-for-a-child | "waiting for a baby" | Gen 16:1-2 within top 3 | as row 6 | (b) | Same as row 6. |
| 8 | waiting-for-a-child | "infertility" | Gen 16:1-2 within top 3 | as row 6 | (b) | Same as row 6. |
| 9 | waiting-for-a-child | "praying for a baby" | Gen 16:1-2 within top 3 | as row 6; Mark 11:24 guard still holds on the pray-token query | (b) | Same as row 6. |
| 10 | waiting-for-a-child-barren | "barren" | Isa 54:1 within top 3 | Isa 54:1 at #5 behind the narrative anchors (its 0.65 weight was set deliberately low for this moment) | (b) | Propose the minimal move: widen Isa 54:1 to withinTop 5 — the fixture's own note says it "asserts presence in the top, not the pack's #1". |
| 11 | waiting-for-a-child-barren | "childless" | Isa 54:1 within top 3 | as row 10 | (b) | Same as row 10. |
| 12 | resurrection-power | "resurrection power" | Rom 8:11 within top 5 | Top 5 is all he-is-risen event anchors; Phil 3:10 (the note's recorded target, now in corpus) does **not** surface | (b)+(d) | The note's recorded flip ("assert Phil 3:10 in the PR that adds Philippians 3") cannot execute without anchor work — Phil 3:10 has no anchor. Propose: small association follow-up adding Phil 3:10 as a resurrection anchor (its lexicon entry "resurrection power" already exists), then execute the recorded flip; interim, widen Rom 8:11's window rather than asserting an event anchor as the believer-facing top. **Also a catch-up fixture — one decision covers both.** |
| 13 | testing | "god is testing me" | 1 Pet 1:6-7 within top 3 | Displaced by the pack's own newly-activated namesake anchors: Gen 22:1-14, Deut 8:2-3, Heb 11:17 (the very texts its corpus-needs note requested) | (b) | Propose: expectedTop → **Genesis 22:1-14** (the concept's namesake text) within top 3; 1 Pet 1:6-7 → alsoAcceptable (Heb 11:17 already is). |
| 14 | first-shall-be-last-guard | "the last will be first" | Matt 19:30 at #1 (token evidence) | **#1 is now Mark 10:31 — the verbatim synoptic parallel**; Luke 13:30 #3, Matt 20:16 #5. The guarded harm class (Rev 1:17-18 leading) does NOT occur | (c)+(d) | Accept the parallel rather than distort weights: expectedTop → any of {Matt 19:30, Mark 10:31} at #1 (or Mark 10:31 with Matt 19:30 / Matt 20:16 / Luke 13:30 alsoAcceptable). **Rev 1:17-18 mustNotLead stays exactly as written** — it held. **Also a catch-up fixture.** |
| 15 | first-shall-be-last-guard | "the first shall be last" | Matt 19:30 at #1 | as row 14 | (c)+(d) | Same as row 14. |
| 16 | spelling-rightousness | "rightousness" | Rom 6:20 within top 3, cited-correction chip | Correction machinery fully intact (unique winner "righteousness", distance 1, cited on the chip); Rom 6:20 displaced by full-corpus righteousness verses | (c)+(d) | The fixture pins the correction machinery, not a verse. Propose: re-point the verse assertion to the measured top corrected result on the expanded bed, keeping the requiredReasonLabel `Shared word: righteousness (corrected from "rightousness")` byte-identical. **Also a catch-up fixture.** |
| 17 | spelling-rightousness | "rightousness" | Matt 5:6 within top 10 | as row 16 | (c)+(d) | Same principle: re-point or drop the secondary verse; the cited-correction contract is the assertion that matters. |
| 18 | spelling-sheol-guard | "sheol" | Ps 139:8 within top 3, undecorated "Shared word: sheol" chip | No-correction mechanism intact (undecorated chips everywhere); Ps 139:8 falls behind the OT's ~60 real sheol verses | (c) | Minimal fix preserving the tripwire: keep the undecorated-chip assertion but carry it on the measured top sheol verse (or widen Ps 139:8's window if it sits within 10). The guard's point — the OOV gate never "fixes" a real scripture word — is untouched. |
| 19 | spelling-archaic-guard | "loveth" | Rom 5:8 within top 3 with undecorated "Shared word: love" chip | Rom 5:8 **still ranks**, but its displayed reasons are now concept chips (Theme: The love of God; Related theme: The cross and atonement) — the shared-word chip is no longer among them | (c) | Explanation-contract row. Propose the minimal fix that preserves the contract: re-target the tripwire to what it actually guards — Rom 5:8 ranks for "loveth" AND **no chip anywhere claims a spelling correction happened** (archaic forms fold in the tokenizer, never the corrector). Alternative: keep the shared-word-chip requirement but carry it on a result where token evidence leads. We recommend the first (asserts the real invariant; survives future anchor changes). |
| 20 | pericope-grouping-loving-kindness | "his loving kindness endures forever" | Ps 136:1-26 as one grouped row within top 5 | Out of top 5 — the refrain's other verbatim instances now present (1 Chr 16:34/41, 2 Chr 5:13, 7:3/6, 20:21…) tie and precede canonically. The fixture's own RELEASE-BED DISCLOSURE predicted exactly this (rank ~13 on the whole Bible) | (c) | Its own note says the real assertion is "the grouped row and its provenance, not a rank contest". Propose: keep the grouped-row + `requiredGroupingSourceId` (openbible-sections) assertion; move the rank window to what the expanded bed measures (top 10 if it lands there; otherwise restructure to presence-with-provenance without a rank window — a fixture-shape amendment we'd bring back to you). |
| 21 | apologetics-umbrella | "apologetics" | 2 Tim 2:24-26 within top 10 | Out of top 10 — displaced by dormant giving-an-answer anchors from **your own 19-passage D13 list** now activating (2 Pet 1:16, Luke 1:1-4, …) | (c) | Accept the activation: the displacers are the passages you supplied on 2026-08-25. Propose re-pointing/widening the assertions to the measured top members of your list, and keeping (re-verifying) the scoping guard — no movement-specific content in bare "apologetics" top 10. |
| 22 | dreams-and-visions-visions | "visions" | Acts 16:9 within top 5 (Acts 2:17 top-3 assertion HELD) | Acts 16:9 out of top 5 amid full-corpus vision texts (Daniel, Ezekiel, etc. now present) | (c) | Propose: Acts 16:9 → alsoAcceptable (or widen to top 10 if measured there). Acts 2:17 assertion and the Zech 13:4 sense-inversion preferredOrder stay untouched. |
| 23 | dreams-and-visions-visions | "dreams and visions" | Acts 16:9 within top 5 | as row 22 | (c) | Same as row 22. |
| 24 | envy-and-jealousy | "jealous of others" | Prov 27:4 within top 3 (holds for bare "jealousy"/"envy") | Out of top 3 for the phrase queries — the narrative exemplars the pack's corpus-needs note named (Gen 4, Gen 37, 1 Sam 18) are now in corpus | (c) | Propose: widen Prov 27:4 to top 5 for the phrase queries, adding the measured narrative leaders to alsoAcceptable. Exodus 20:5 preferredOrder demotion (sense-inversion ruling) untouched. |
| 25 | envy-and-jealousy | "struggling with envy" | Prov 27:4 within top 3 | as row 24 | (c) | Same as row 24. |
| 26 | nations-and-peoples-all-nations | "every tribe and tongue" | Matt 28:19 within top 5 (holds for "all nations") | Out of top 5 — the query's own verbatim texts (Rev 5:9 / 7:9 register) and full-corpus nations verses compete | (c) | Propose: for this query accept the lexically-direct every-tribe-and-tongue verses as expectedTop/alsoAcceptable and widen Matt 28:19 to top 10; the Ps 9:17 sense-inversion preferredOrder untouched. |
| 27 | nations-and-peoples-all-nations | "nations in the bible" | Matt 28:19 within top 5 | Out of top 5 amid honest full-corpus competition | (c) | Propose: widen Matt 28:19 to top 10 with measured leaders alsoAcceptable. |
| 28 | testing-refining | "the refiners fire" | Zech 13:9 within top 5 (other three queries hold) | Out of top 5 — the pack's own anchors (Mal 3:2-3, 1 Pet 1:6-7) plus new refining texts lead | (c) | Propose: widen to top 10 for this one query — the fixture's own note already declines to over-constrain ordering among the pack's anchors, and Mal 3:2-3 is the refiner's fire itself. |
| 29 | hope-in-god | "a future and a hope" (+ asserted variants) | Jer 29:11 within top 3 with Theme: Hope | Moves under the **catch-up distillate regeneration** (PR #53 FINDING; itemized in the catch-up branch's G3 run — richer passage-term votes reorder honestly) | (d) | Propose ruling the principle here: honest displacement by the regenerated distillate is accepted; the catch-up PR re-points via **window widening only**, keeping every concept_anchor reason requirement intact, and brings the exact re-points back under this same table's classes. |
| 30 | trust-in-god | "trust in the lord" (+ "trust") | Prov 3:5-6 at #1 with Theme: Trusting God | as row 29 (catch-up move 1 of 2) | (d) | Same principle as row 29. Note: Prov 3:5-6 at #1 is a strong pastoral default — if the catch-up displaces it, we recommend you see the measured leader before approving that specific row. |
| 31 | trust-in-god | preferredOrder Prov 3:5-6 above Ps 37:5 | ordering pair within top 5 | as row 29 (catch-up move 2 of 2) | (d) | Same principle as row 29. |
| 32 | victory-in-christ | "more than conquerors" (+ "victory") | 1 Cor 15:57 and Rom 8:37 within top 3 | as row 29 | (d) | Same principle as row 29. |

**Accounting:** rows 1–28 are the expansion's 28 moves; rows 12, 14–17 (5 moves on 3 fixtures) are also inside your catch-up ruling; rows 29–32 are the catch-up's remaining 4 moves. 28 + 8 − 4 shared = 32 rows. Ruling on this table once settles both changes.

---

## Secondary calls (short answers welcome)

**1. Does virgin-birth's pack ride PR-β?** Its recorded activation design requires the concept pack + the Matt 1 / Luke 1 chapters + the `coversConcepts` claim to land **together** — which collides with PR-β's corpus-only scope. Options: (i) let this one pack ride PR-β as a disclosed scope exception, honoring its recorded design; (ii) keep PR-β corpus-only and land virgin-birth in an immediate follow-up (its fixture stays pending across the gap). Say which.

**2. J39 / v0.14.0 sequencing** — presented neutrally, your decision list already carries it:
- **Expansion-first, sign once:** merge PR-β (and the catch-up) first, then sign the J39 approvals against the final identity (0.14.0 / `6450b7d7…` / final layer). One signing ceremony; the mint waits behind this ruling.
- **Mint-first, then re-sign:** sign J39 and mint v0.14.0 on today's main identity (`644b241c…` / `b24ea16d…`) now; PR-β then moves both fingerprints and **invalidates the G2/G8 approval bindings**, requiring a second signing (and re-baseline) when it lands. Cost: the approval/baseline rebinding is repeated once; benefit: a shipped v0.14.0 artifact exists sooner.

---

## State of the work

- The built expansion is **pushed** to `origin/claude/hearth-161-concept-packs-2tf8jk` as commit **`87fd68c`** ("Full-Bible fixture corpus expansion (PR-beta investigation state; pending fixture-adjudication ruling)"; originally committed as `de0fa84` — the amend changed only the commit message, the tree is byte-identical), parent `e762d1c` = origin/main. No PR is open. It is resumable the moment you rule.
- **Baselines and approvals regeneration was deliberately withheld** — the sanctioned `--update-ordering-snapshot --update-baseline` steps and the approval rewrite belong to the PR that executes your ruling, not to an investigation branch. Determinism itself was proven (both identities rebuilt and replayed identically this session).
- The 50-row corpus-blocked concept roster (engine-pack-backlog.md) additionally waits on this same ruling: PR-β is its unblocker, and PR-β is blocked here.
