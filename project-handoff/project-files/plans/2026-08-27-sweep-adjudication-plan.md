# Sweep-Output Adjudication Plan — turning the 2026-08-26 whole-Bible tag-sweep ledgers into admitted engine data

**Date:** 2026-08-27 · **Author:** Claude · **Status:** DRAFT for Jesse · **Sources verified against:** `origin/main` @ `0d12c34` (PR #66 merge, 2026-08-27 03:30Z), the 66 sweep ledgers at `/mnt/project-files/research/bible-rollout/sweep/`, `engine-pack-backlog.md`, CONVENTIONS §5/§11, the coverage plan (`2026-08-26-whole-bible-coverage-plan.md` §3.3/§5.2), and the GitHub API (PRs #61, #63–#67).

Theological rulings are NOT duplicated here: every HELD theology item routes to the consolidated open-rulings ledger (companion deliverable, in progress in its own thread). This plan decides everything that is not genuinely Jesse's to decide, and says so where it is.

---

## 0. The chosen path (one screen)

The sweep produced ~30,160 ledger lines across 66 books: **400 display-tag adds, 2,137 anchor-extension candidate rows, 1,101 lexicon candidate rows, 44 distinct new-concept mint proposals, 12 drops, 505 refinement flags, 137 hard-ceiling chapters** (§1; every number re-verified, discrepancies in Appendix A). Adjudicating this by walking 66 ledgers per decision would burn Jesse's review time on bookkeeping. Instead:

1. **Build one machine-generated consolidated candidate index first** (§3) — a deterministic script walks all 66 ledgers and emits a per-concept queue at `research/bible-rollout/sweep/_index/`. The index is both the working queue and the shelving record: every candidate gets a recorded disposition, nothing silently vanishes.
2. **Batch per-concept, not per-book** (§4): ~15–20 admissions per fixtures-first PR targeting `main` (the proven #54–#59 size), each batch NME-pruned by a local gauntlet run *before* the PR is opened, and **re-measured on current main** — all ledger self-assessments predate the 31,098-verse fixture corpus (#64) and are advisory only.
3. **Prioritize by value per reviewed PR** (§2): P1 the Psalms anchor-gap seam (queries users actually type where the pack misses the passage everyone would name), P2 the top-concentration concepts, P3 the 44 mints (vocabulary rulings gate them), P4 the ~400 display-tag adds — which are **book-doc edits outside the repo entirely** (verified §2.4): zero engine effect, zero release-freeze interaction, they run as a parallel track immediately.
4. **No sweep batch that moves `layerFingerprint` merges before the v0.14.0 mint** (§6): the already-queued #65 and #67 (both layer movers) land first, J39 signs once against the settled identity, the mint cuts, then sweep batches merge. But the freeze blocks *merges*, not *preparation* — index build, fixture drafting, display-tag application, and validated draft PRs all start now. That is the efficient path: when the release train clears, a validated queue is waiting.
5. **Tranches with a calibration loop** (§7): tranche 1 (~1 thread-day) proves the whole pipeline on one P1 batch and measures the real post-#64 survival rate; every later effort estimate re-bases on it. Honest ballpark: on the order of **15–25 reviewed PRs total**, not 100+.

While Jesse is here, his merge = admission, unchanged. After he leaves, this plan takes no new governance position — one explicit, swappable assumption (§5): batches accumulate as validated draft PRs and nothing merges until the successor-governance plan designates the merging human.

---

## 1. What the sweep produced — verified inventory

Source: the 66 per-book ledgers (`sweep/<book>.md`, one per canonical book, 30,160 lines total), written 2026-08-26 against main @ `e762d1c` (239 engine packs; legal tag vocabulary = 239 engine ids ∪ 161 adopted ids). Eight ledgers (one per group) were re-tallied mechanically against the group roll-ups; group sums for History and Gospels+Acts were re-summed per-book. Grand totals below are summed arithmetic, not quoted.

| Group (chapters) | Adds | Keeps | Drops | Anchor-ext rows | Lexicon rows | New-concept | Refinement-flagged ch | Hard-ceiling ch |
|---|---|---|---|---|---|---|---|---|
| Torah, Gen–Deut (187) | 76 | 710 | 5 net | 367 | 257 | 62* | 72 | 13 |
| History, Josh–Esth (249) | 55 | 870 | 2 | 374 | 120 | 6 | 142 | 18 |
| Wisdom, Job–Song (243) | 37 (+1 Song proposal) | 972 | 1 | 351 | 73 | 2 | 26† | 9 |
| Major Prophets, Isa–Dan (183) | 41 | 793 | 1 | 251 | 107 | 6 | 97 | 15 |
| Minor Prophets, Hos–Mal (67) | 38 | 299 | 1 | 148 | 37 | 1 | 32 | 3 |
| Gospels+Acts (117) | 69 | 680 | 0 | 335 | 247 | 3 | 39‡ | 39 |
| Pauline, Rom–Phlm (87) | 46 | 471 | 2 (1 executed + 1 proposed) | 210 | 194 rows / 459 phrasings | 4 | 53 | 25 |
| General+Rev, Heb–Rev (56) | 38 | 306 | 0 | 101 | 66 | 1 (+1 HELD) | 44 | 15 |
| **TOTAL (1,189 ch)** | **400** | **5,101** | **12** | **2,137** | **1,101** | **85\* → 44 distinct ids** | **505 (mixed units)** | **137** |

\* **The 85→44 correction, stated plainly.** The per-group sum of "new-concept" figures is 85, but the Torah figure (62) counts *content-bearing lines* in the ledgers' New-concept sections — including routed-to-roster notes and annotated "None" lines — not genuine mint proposals (verified mechanically: Genesis's 24 = 4 proposals + 14 routings + 6 annotated-None lines; Leviticus's 25 = 5 distinct ids + 19 annotated-None lines). The **genuine, enumerable mint proposals are 45 entries = 44 distinct ids** — `calling-and-commission` is proposed independently by both Exodus and Jeremiah, the sweep's one cross-book dedup case. Full enumeration in §2.3; use 44, never 85, in any planning arithmetic.

† Wisdom's column merges ceiling+refinement counts. ‡ Gospels+Acts recorded only its hard-ceiling set as refinement-flagged; its ledgers also flag most book-doc-subdivided chapters (Matthew all-but-4, Acts all-but-2, Luke 23/24, Mark 15/16), so 39 undercounts that group and **505 is a floor with mixed definitions** — fine for scoping, unusable as a precise queue length. Other honest footnotes (small Torah tally variances, mixed-unit routing counts, one attribution note): Appendix A.

**Two structural facts the plan builds on:**

- **Anchorless-psalms roster: 73 psalms carry no engine anchor at all** (28 in Pss 1–60, 13 in 61–90, 13 in 91–120, 19 in 121–150; verified against the psalms ledger's close-out addendum, whose own check is 73 anchorless + 77 anchored = 150). Headliners: **Ps 2** (anchorless; joins the standing messianic-prophecy extension class Pss 2/45/69/102/118/132), Pss 69, 72, 84, 89, 107, **130** (De Profundis), **132**, **136** (Great Hallel). Ps 51 is *not* anchorless (4 packs anchor it) — its gap is precise: the `repentance` pack contains no Psalm 51 text (ledger line 532, w=0.9 candidate).
- **Concentration:** anchor candidates cluster hard. Top of the table (distinct ledgers naming the concept / candidate rows): humble-exaltation 20/42, fear-not 19/29, justice-and-oppression 18/30, gods-provision 17/30, gods-protection 16/30, forgiveness-of-sins 16/23, presence-of-god 15/28, restoration-of-israel 15/22, the-house-of-god 15/21, obedience-to-the-word 15/20, gods-faithfulness 14/26, divine-judgment 14/23, messianic-prophecy 12/31 (highest row density). Full top-26 table: Appendix A.

---

## 2. Prioritization and explicit shelvings

Ordering principle: **value per reviewed PR.** Jesse's review time is the scarcest resource in the system; batches are ordered by how much search quality each merge buys.

### 2.1 P1 — the Psalms anchor-gap seam (highest value per admission)

The sweep's single strongest engine finding: the Psalter's most-searched passages are missing from exactly the packs whose queries would name them. Verified exemplars: **Ps 51 → `repentance`** ("psalm of repentance" cannot rank the canonical repentance psalm on concept evidence; w=0.9 candidate), **Ps 121 → `gods-protection`** (the pack's only Psalms anchors are in Ps 91, while its own lexicon carries "keep me safe" and "safe travel"; w=0.9), **Ps 2 → `messianic-prophecy`** (anchorless outright, with the recorded extension class 2/45/69/102/118/132), plus the 73-psalm anchorless roster's headliners (Pss 130, 132, 136, 69, 72, 84, 89, 107). These are queries users actually type where the pack misses the passage everyone would name — the definition of first-order search-quality value.

Scope note for precision: the ledgers' *namesake seam* class (Pss 23/33/34/55/86/146 — an engine pack's own lead anchor sitting untagged in the book doc) is **display-side**, already inside the 400 adds, and rides P4; Ps 23's engine coverage is recorded complete in the ledger. P1's engine work is the *inverse* seam — psalms the packs miss.

### 2.2 P2 — per-concept anchor-extension batches, by concentration rank

Work the §1 concentration table top-down in table order: humble-exaltation, fear-not, justice-and-oppression, gods-provision, gods-protection, forgiveness-of-sins, presence-of-god, restoration-of-israel, and onward down the Appendix A table. (messianic-prophecy, 12 ledgers/31 rows, sits fourteenth by the lead metric despite the highest row density — it is not promoted into the top-8; its strongest seam, Ps 2, already rides P1.) One concept cluster per PR, all its books at once (a 20-book concept adjudicated once, not twenty times). **Lexicon-row candidates for the same concept ride in the same batch** — one concept, one PR appearance, one review.

### 2.3 P3 — the 44 new-concept mints (gated on vocabulary rulings)

The 44 distinct ids, enumerated from the ledgers (45 entries; the one cross-book duplicate marked):

- **Torah (22):** Genesis — dominion-and-creation-care, nephilim-and-the-sons-of-god, circumcision-covenant-sign, birthright · Exodus — calling-and-commission, lending-and-interest, ark-of-the-covenant, anointing · Leviticus — unauthorized-worship, child-sacrifice-and-molech, tattoos-and-cuttings, disability, devoted-to-destruction · Numbers — redemption-of-the-firstborn, bronze-serpent · Deuteronomy — testing-god, year-of-release-and-jubilee, amen, secret-sin, secret-things-and-revealed-things, choosing-life, gods-delight-in-his-people (adopted-id build candidate)
- **History (6):** asking-god-for-a-sign, evil-spirit-from-god (both Judges, with 1 Sam cross-refs), word-of-the-lord-fulfilled (1 Kings, check-first), casting-lots (1 Chronicles), rejecting-gods-messengers (2 Chronicles), in-law-loyalty (Ruth, low-confidence)
- **Wisdom (2):** atheism-and-unbelief (Ps 14, Ps 53 doublet cross-ref'd), the-fool-and-folly (Prov 26)
- **Major Prophets (6):** peaceable-kingdom (Isa 11:6-9, fold-check vs roster row 29), calling-and-commission (Jeremiah — **duplicate of the Exodus proposal; the sweep's one cross-book dedup case, deduped at index build**), gods-grief-in-judgment (Jeremiah), when-god-feels-against-you (Lamentations, check-first vs wrestling-with-god lexicon), book-of-life (Dan 12, motif promotion), sovereignty-of-god (Daniel — adopted-id build candidate, not a fresh mint)
- **Minor Prophets (1):** gods-goodness (Nah 1:7)
- **Gospels+Acts (3):** messianic-secret (Mark 1), new-wine-and-wineskins (Mark 2), son-of-man (Luke 9)
- **Pauline (4):** lawsuits-among-believers (1 Cor 6:1-8), gift-of-prophecy (1 Cor 14), boasting-in-the-lord (2 Cor 10–12), anger (Eph 4:26-27)
- **General+Rev (1):** the-anointing (1 John 2:20, 27; check-first against the holy-spirit lexicon route) — plus one deliberately-not-a-proposal HELD item, the thousand-year reign (Rev 20:1-7), which lives in §5's rulings list, not here.

Each of the 44 needs **both** a vocabulary ruling and an admission. Routing rule: **theological mints route to the consolidated rulings ledger; non-theological ones the acting reviewer rules via the existing tag-gaps-review adoption pattern** (propose → recorded ruling → then fixtures-first admission), exactly as the 161-concept adoption worked.

**Folded into P3's vocabulary queue** (adjacent queues, reconciled — verified this session):

- **15 adopted display-tag ids built nowhere**: of the 161 adopted ids, 64 are marked engine-built:no in `tag-apply/adopted-concepts.md`; 49 of those are the backlog roster's review rows (built on PR #67); the remaining **15** sit in no queue at all: confession-of-sin, death-of-a-believer, eternal-life, false-teachers, freedom-in-christ, gentleness-of-christ, gods-delight-in-his-people, living-for-gods-glory, new-birth, outpouring-of-the-spirit, sovereignty-of-god, sowing-and-reaping, speaking-in-tongues, the-branch, walking-in-truth. Note two (gods-delight-in-his-people, sovereignty-of-god) also appear among the 44 as adopted-id build candidates — the index dedups them.
- **5 battery-flagged concepts with no pack**: righteousness, strength, anointing, favor-of-god, assurance (verified: none exists in `ontology/concepts/`; "favor of God" appears verbatim in `eval/battery/queries.json`). These overlap the mint list (`anointing` is a Torah proposal; `the-anointing` is 1 John's distinct check-first case) — fold them in and dedup at index build.

### 2.4 P4 — the ~400 display-tag adds (parallel track, zero engine effect — verified)

**Verified this session:** display tags live in the book docs at `/mnt/project-files/research/bible-rollout/<book>.md` — outside the repo entirely (CONVENTIONS §1: book threads make no engine or repo changes and open no PRs; §5: tags are display-only; §11.7: none of this touches search ranking, engine vocabulary, ENGINE_VERSION, or the three-identity determinism contract). Applying them moves **no** fingerprint, needs **no** repo PR, and is fully independent of the release freeze. Also verified: the sweep's ADD/DROP decisions are **recorded in the ledgers but not yet propagated to the book docs** (spot checks: Joshua 3's `signs-and-wonders` ADD absent from `joshua.md`; Philippians 1 still carries the `thanksgiving` tag whose drop is HELD) — so P4 is a real apply pass, not a formality.

Decision: run P4 as **big cheap batches on the parallel track, starting immediately**, on the exact pattern of the 2026-08-25 adopted-vocabulary application pass across all 66 book docs (per-book worklists, editor batches, fresh-critic audit per batch, consolidated fix verification; that pass's reported 1,428-tag figure is not mechanically reproducible — the coverage plan's discrepancy item 4 records ~5,281 total `**Tags:**` applications by mechanical count and reads 1,428 as that pass's own unverified tally). Its search-quality effect is zero by construction; its product value (tags users see) is real. Two riders: (a) HELD or Jesse-flagged deltas (the Philippians `thanksgiving` drop, the Mark 12/Luke 20 divergence, the Song ch 6 proposal) are **excluded** until ruled; (b) the pastoral-* id split (display ids prefixed, engine ids not, +2 renames — HANDOFF known behavior) applies to display work only in the display direction.

### 2.5 Explicitly deferred, dropped, or already done (the shelving record)

Recorded here so no queue silently vanishes; each also gets an index disposition (§3).

**Deferred / out of scope:**
- **The ~505-chapter per-verse refinement queue** — out of scope; sequenced *after* this plan completes (the per-verse refinement pass is a separate, not-yet-written plan, and a different kind of pass). The 137 hard-ceiling chapters' capacity questions are that pass's problem, not this plan's.
- **Long-tail anchor candidates** outside the top-concentration concepts and outside P1 — deferred until a measured gap or user query motivates them. "Never add data because it exists" (CLAUDE.md); the index preserves every row, so nothing is lost by waiting.
- **Alias mining batches 2+** — owned by the alias thread (coverage plan §2.3), not this plan.

**Already done (verified via GitHub API, both merged before this plan was written):**
- **The 10 held popular-verses fixtures — DONE.** PR #63 (merged 2026-08-27 03:28Z) completed the promotion at **103/103**: the 10 out-of-corpus holds (Rom 3:23, John 10:10, 2 Tim 3:16, Gal 2:20, Ps 118:24, 2 Cor 9:7, Deut 31:6, Ps 119:11, John 5:24, 1 Chr 16:34) were measured post-#64, all observed rank #1, flipped active. Queue closed.
- **The backlog's 6 pending-fixture advisory — DONE.** PR #66 (merged 2026-08-27 03:30Z) flipped exactly the six fixtures the backlog's final section names (apologetics-umbrella-expansion, first-and-last-coming-judge, honor-the-son-john5, it-is-well, no-other-god-isaiah-44-46, trustworthiness-god-breathed) to active. Queue closed.

---

## 3. The consolidated candidate index (build this first)

**The known gap this closes:** no consolidated cross-group open-items file exists — the 2,137 + 1,101 + 44 candidates live only in 66 ledgers with three marker dialects. Every downstream step (dedup, batching, pruning, shelving) needs one queue.

**What:** a script walks the 66 ledgers (marker syntax per group is documented — heading variants, pipe-delimited vs em-dash-delimited candidate lines; full spec in Appendix B) and emits, at `/mnt/project-files/research/bible-rollout/sweep/_index/`:

- `candidates.csv` — one row per candidate: `{concept, book, ref, proposed_weight, evidence_quote_pointer, ledger_file:line, class: anchor|lexicon|new-concept|add, status}`
- `INDEX.md` — human summary: per-concept row counts, the concentration table, the disposition tally.

**The index is the working queue AND the shelving record.** `status` is the disposition field, updated as batches move: `open` → `batched-PR-#n` / `pruned-NME` (with the gauntlet-report evidence pointer) / `deferred-long-tail` / `held-for-ruling` (with the rulings-ledger pointer) / `absorbed-by-#67` / `done`. A candidate leaves the queue only by getting a disposition.

**Deterministic and re-runnable:** the extraction is mechanical (first-token concept-id match inside the recognized anchor/lexicon/new-concept sections, `ROUTED`/`None` lines excluded). Re-running it against unchanged ledgers must be byte-identical.

**Extraction verification (guards marker drift):** after each build, per-group extracted row counts must reconcile against the ledger roll-up tallies in §1's table (2,137 anchor / 1,101 lexicon / 45 new-concept entries). Known tolerance: inline-numbered books (Psalms, Ecclesiastes, Ezekiel, Job) rarely put multiple candidates on one line, so extracted counts are floors; any variance beyond the Appendix A known set is investigated before the index is trusted.

**Reconciliation against PR #67 at build time:** the ledgers were written against the 239-pack census; draft #67 takes it to 283 (44 new ids + 3 extensions) and builds the roster rows many ledger findings were routed to. At index build, every candidate is checked against **whatever census is on main when execution starts**: candidates absorbed by a #67 pack get `absorbed-by-#67`; candidates extending a #67 pack re-target it. Per-concept batches replace per-book ones from this point on.

---

## 4. Batch pipeline (fixtures-first, NME-pruned, re-measured)

**Batch shape (decided):** ~15–20 admissions per PR — the measured #54–#59 size that worked (coverage plan §3.3.4/§5.2) — composed **per-concept**: one concept cluster per PR, all its books at once, the concept's lexicon candidates riding along. Batch PRs target `main` directly, never a stacked base (the #55–#59/#60 lesson, binding).

**Per-batch loop:**

1. **Fixtures first** — `eval/golden/*.json` per the exemplar `eval/golden/hearing-and-doing.json` (`expectedTop` with `requiredReasonFamily`/`Label`, `mustNotRank`, schema at `eval/src/gates/corpusGolden.ts:116`). The query you'd type and what should surface; a pack with no fixtures is rejected structurally (G3). Explanations are contract — right verse for the wrong reason is a G3 failure.
2. **Apply candidates on a branch** — packs/extensions in `ontology/concepts/`; map display ids to engine ids through the pastoral-* strip/rename table where applicable.
3. **Local gauntlet before any PR** — `npm run verify` / `npm run gauntlet` / `npm run gauntlet:report` (machine evidence at `eval/.runs/gauntlet-report.json`). **Prune every candidate reading NO MEASURABLE EFFECT before the PR is opened** — pruned rows get `pruned-NME` in the index with the report evidence. NME pruning is cheap and needs no human; expect plenty of it now that full-corpus word search serves many queries lexically ("that is the system working, not the sweep failing" — coverage plan §3.3).
4. **PR** — body carries the per-concept decision table, gauntlet-printed numbers only, and standing-down triage for pre-existing CI reds. Baseline-moving batches follow the `--update-baseline` + independent v2 approval discipline.
5. **Index update** — every row in the batch gets its disposition the same day.

**CRITICAL measurement caveat (decided: re-measure everything):** every ledger self-assessment — "likely NME", "probable collision", "should measure" — was graded at `e762d1c`, **before** PR #64 expanded the fixture corpus 5,726 → 31,098 verses. Those assessments can flip in either direction on current main (new lexical reach makes some candidates redundant; new measurability makes others admissible). **Decision: re-measure every batch on current main; treat ledger measurement notes as advisory only. Ledger theology and evidence notes (quotes, refs, register reasoning) remain authoritative.** Corpus-blocked riders in the ledgers are obsolete — #64 merged; every candidate is measurable.

**Daniel catch-up:** Daniel was corpus-blocked during the sweep (zero fixture verses pre-expansion). Schedule a one-book catch-up sweep pass — now unblocked post-#64 — in tranche 2, feeding the same index and the same batch pipeline.

---

## 5. Review and admission

**While Jesse is here (unchanged):** his merge is the admission event, per coverage plan §5.2 and the HANDOFF governance record ("nothing merges without a human"; "each merge IS the engine-admission event").

**After he leaves — one explicit, swappable assumption, no new governance position:**

> Admission = merge by the human the successor-governance plan (proposed but not yet written) designates. Until that plan exists, batches accumulate as **VALIDATED DRAFT PRs** — fixtures green, local gauntlet reading ADMIT, index updated, PR body complete — and **nothing merges**.

That is a validated frozen queue, not a stalled pipeline: every batch is ready to merge the day governance is decided, and the assumption swaps cleanly (replace "the designated human" with whoever the governance plan names; nothing else in this document changes).

**New-concept vocabulary rulings (P3):**

- **Theological — routed to the consolidated rulings ledger** (companion deliverable; listed here by name and location only, ruling text deferred to it):
  1. Mark 12 / Luke 20 `deity-of-christ` divergence (sweep/mark.md:410; sweep/luke.md:642)
  2. Thousand-year reign, Rev 20:1-7 (sweep/revelation.md:771, 890)
  3. `end-times` ↔ `day-of-the-lord` scope/merge, roster row 5, with its parked contingent items (sweep/daniel.md:10, 208, 223; sweep/1-thessalonians.md:134, 159; sweep/2-thessalonians.md:57, 116, 125; sweep/malachi.md Mal 4 Decisions item 6)
  4. Philippians 1 `thanksgiving` drop — executed in the ledger, reversible, flagged (sweep/philippians.md:215, 219)
  5. 1 Cor 1 `harmony-with-others` drop — proposed, not executed (sweep/1-corinthians.md:528)
  6. Song ch 6 `romantic-love-and-intimacy` add-proposal (sweep/song-of-solomon.md:68)
  7. Roster row 45 `exile-and-captivity` fold-vs-separate (sweep/psalms.md:1445; sweep/2-kings.md:612; sweep/ezra.md:66, 238, 282; sweep/micah.md; sweep/1-chronicles.md:118; sweep/isaiah.md book totals)
  8. The Pauline reversal/recast set — `temptation` ← 1 Cor 10:13; `holy-spirit` ← Eph 5:18 (sweep/ephesians.md:239); `heavenly-reward` ← Col 3:24; and the `mormon-evangelism` ← 1 Cor 15:29 design change (+ "baptism for the dead" lexicon)
  9. Owner-flagged (curator/book-doc rather than strictly Jesse, listed for traceability): Job 35 `unanswered-prayer`; Malachi 1 `election-and-predestination` (alongside the pack's standing review flag)

  Candidates touching any of these carry `held-for-ruling` in the index and stay out of batches until ruled.
- **Non-theological** (e.g. the-fool-and-folly, casting-lots, amen, most of the 15 fold-ins): the acting reviewer rules via the tag-gaps-review adoption pattern — propose with evidence, record the ruling, then admit fixtures-first. This is the pattern that produced the 161-id adoption and needs no new machinery.

---

## 6. Sequencing

**(a) The release path gates merges.** No sweep batch that moves `layerFingerprint` merges before the v0.14.0 mint — the already-queued #65 and #67 (both layer movers) land first, then J39 signs once against the settled identity. Reason: **J39 is sign-ONCE against a settled identity** (PR #53's lesson; #64's body, verbatim: "**Expansion-first, sign once.** The J39 approvals are signed only **after this PR merges**, against the final identity…"), and every layer-moving merge re-moves the identity and re-invalidates unsigned approvals. Queue order, decided:

1. **PR #65** (alias batch 1) — observed 2026-08-27: `mergeable_state` **`unstable`** (mergeable; failing checks only — its conflicts were resolved in merge commit `0d9fa0f`, but the branch is still one commit behind main: it has #63, not the #66 merge `0d12c34`) and party to the shared baseline-coordination note ("whichever merges second owes a baseline regen"); it owes a final baseline regen against current main — it rebases, regenerates, and lands.
2. **PR #67** (roster build, 47/50 rows, census 239→283, layer → `e4f864bf…`) lands.
3. **J39 signs** — independent reviewer, two v2 chained approvals, once, against the now-settled identity.
4. **v0.14.0 mints.** Named mint blocker, owned elsewhere: the G10 size decision (artifact 167.84 MiB vs the 160 MiB budget — a reviewed `eval/budgets.json` decision precedes or accompanies the descriptor PR).
5. **Then sweep batches begin merging** (or begin accumulating as validated drafts, per §5's assumption).

**(b) Preparation runs in parallel, starting now.** The freeze blocks merges, not preparation. Immediately and concurrently with 1–4: the candidate index build (§3), P1/P2 fixture drafting, the P4 display-tag apply pass (verified zero identity contact, §2.4), the Daniel catch-up sweep, and validated draft-PR assembly. This is the most efficient path: release-train wall-clock time is spent building the queue that merges the moment the train clears.

**(c) Explicitly not covered by this plan:** per-verse refinement (a separate, not-yet-written plan, sequenced after — §2.5), alias batches 2+, the G10 budget decision, J39 signer designation, and consumer re-pins (Maskil / LH Worship Setlist / Versed re-pin deliberately, on their own schedule, per the consumer contract).

---

## 7. Tranches and effort

**Measured ceiling:** ~96 admissions per thread-day (86 new ids + 10 extensions across 162 reviewed rows in one day, six batches — the engine-pack-backlog build record; treat as near the ceiling, not the average).

**Survival honesty:** after dedup and NME pruning, a meaningful fraction of the 2,137 anchor + 1,101 lexicon rows will not survive to a PR — full-corpus lexical search already serves many of their queries. **The survival rate is unknown until tranche 1 measures it**; this plan deliberately fabricates no percentage. Tranche 1 exists to produce that number.

- **TRANCHE 1 — prove the pipeline (~1 thread-day).** Build and verify the index (§3, including the count reconciliation and #67 reconciliation). Then **one batch PR of ~15–20 admissions from P1: the Psalms anchor-gap batch** — Ps 51 → repentance, Ps 121 → gods-protection, Ps 2 → messianic-prophecy (with its extension class), then enough of the anchorless-psalms roster headliners (130, 132, 136, 69, 72, 84, 89, 107…) to fill the batch. Chosen because the evidence is strongest (w=0.9 rows with verified quotes), the traffic is highest (the Psalter is what people search), and it exercises index → fixtures → gauntlet → review end to end. Its measured survival rate calibrates everything after it. Exit: one validated batch (merged, or validated-draft per §5) + a written survival/effort re-estimate.
- **TRANCHE 2 (~2–3 thread-days).** Remaining P1 psalms; the top-8 concentration concepts as per-concept batches (humble-exaltation → restoration-of-israel in Appendix A table order, lexicon rows riding along); the Daniel catch-up sweep. Exit: re-estimate again.
- **TRANCHE 3+.** Remaining P2 by concentration rank until the measured-value tail flattens (stop when batches start reading mostly NME — that is the long-tail deferral line asserting itself); P3 mints admitted as their vocabulary rulings arrive from the ledger. P4 runs throughout on the parallel track.

**Ballpark, stated honestly:** on the order of **15–25 reviewed PRs total** across all tranches — not one per book, not one per concept, and not 100+ — with each tranche ending in a survival-rate and effort re-estimate that can shrink (or grow) the remainder.

---

## 8. Jesse-only calls (kept minimal, per "make the best decisions")

1. **Confirm the sequencing rule** (§6a): sweep batches merge only after #65 → #67 → J39 → mint. (Everything else in §6 follows from recorded precedent; this is the one ordering only he should bless.)
2. **Bless tranche 1's batch composition** (§7): the Psalms anchor-gap batch as the first admission set.
3. **The theology HELDs** (§5's nine-item list) — these live in the consolidated open-rulings ledger and are ruled there, not here; they are listed in this plan only so their index rows trace somewhere.

Everything else — index mechanics, batch composition, NME pruning, non-theological vocabulary adoption, the P4 apply pass, tranche pacing — is decided in this document and executable without him.

---

## Appendix A — verified count tables and discrepancy notes

**Grand-total arithmetic (summed, not quoted):** adds 76+55+37+41+38+69+46+38 = 400 · keeps 710+870+972+793+299+680+471+306 = 5,101 · drops 5+2+1+1+1+0+2+0 = 12 · anchor 367+374+351+251+148+335+210+101 = 2,137 · lexicon 257+120+73+107+37+247+194+66 = 1,101 · new-concept lines 62+6+2+6+1+3+4+1 = 85 (→ 44 distinct genuine ids, §1) · refinement 72+142+26+97+32+39+53+44 = 505 · hard-ceiling 13+18+9+15+3+39+25+15 = 137 · chapters 187+249+243+183+67+117+87+56 = 1,189.

**Discrepancies, carried honestly (none material to the plan's decisions):**

1. **Torah new-concept definition (material to counting, resolved):** the group's "62" counts content-bearing section lines, not proposals; genuine Torah mints = 22 distinct ids. This is the whole 85→44 correction (§1).
2. **Small Torah tally variances (unresolved, small):** mechanical section-line counts vs group tallies — Genesis anchor-extension 107 counted vs 109 claimed; Leviticus anchor 41 vs 44, lexicon 25 vs 28 (Exodus, Numbers, Deuteronomy, and Genesis-lexicon match exactly). Probable cause: candidates noted inside Decisions-record parentheticals that the tally counted. The index's extraction-verification step (§3) is the closure mechanism: variances of exactly this shape are expected and investigated there.
3. **Gospels+Acts refinement undercount:** the group's 39 equals its hard-ceiling set only; its subdivided-chapter refinement queue is larger. 505 is therefore a floor with mixed definitions (Wisdom's 26 merges ceiling+refinement). Affects only the deferred per-verse pass's scoping, not this plan.
4. **Routings have no single grand total:** groups recorded routings in incompatible units (notes vs rows vs mentions); note-count sum where given is 329 excluding Torah (~28 rows / 226 mentions) and Pauline (16 rows). The index supersedes these counts entirely.
5. **Wisdom attribution note (already self-disclosed):** a summary said "(rows 19,48)" on both Ecclesiastes and Song; the ledgers record Eccl → row 19 only, Song → row 48 only. Ledgers govern.

**Concentration table, top 26** (distinct ledgers naming the concept as an anchor-extension candidate / candidate rows): humble-exaltation 20/42 · fear-not 19/29 · justice-and-oppression 18/30 · gods-provision 17/30 · gods-protection 16/30 · forgiveness-of-sins 16/23 · presence-of-god 15/28 · restoration-of-israel 15/22 · the-house-of-god 15/21 · obedience-to-the-word 15/20 · gods-faithfulness 14/26 · divine-judgment 14/23 · loving-others 13/15 · messianic-prophecy 12/31 · wisdom-from-god 12/16 · the-lords-discipline 12/16 · oaths-and-vows 12/16 · slander-and-false-accusation 11/17 · trust-in-god 11/17 · fear-of-the-lord 10/20 · second-coming 10/15 · false-prophets 10/15 · hardness-of-heart 10/14 · occult-and-divination 10/12 · empty-worship 10/12 · resurrection-of-the-dead 10/11. Row counts are floors (multi-candidate single lines in inline-numbered books yield one id).

## Appendix B — extraction marker spec (for the §3 index script)

- **Section headings by group:** `### Anchor-extension candidates` (Torah, History, Gospels, General+Rev; sometimes suffixed, e.g. `(CORPUS-BLOCKED-UNTIL-EXPANSION)`); `### (b) Anchor-extension candidates` (Minor Prophets); `**2. Anchor-extension candidates:**` or `**Anchor-extension candidates:**` (Pauline, Acts, 1 Thessalonians); inline-numbered `3./4. Anchor-extension candidates: …` (Psalms, Ecclesiastes, Ezekiel, Job). Lexicon and new-concept sections follow the same per-group dialect.
- **Candidate lines:** start `- `, concept id as the FIRST field, optionally backtick-wrapped, kebab-case (`^[a-z0-9]+(-[a-z0-9]+)+$`); field delimiter ` | ` (Torah/History/Gospels/General: id | verse range | "WEB quote" | proposed weight) or ` — ` (Minor Prophets/Pauline: `id` — ref — "quote" — proposed weight).
- **Exclusions:** `ROUTED`, `None`, and `honest-and-empty` lines inside a section are not candidates. `CORPUS-BLOCKED` appears as a suffix rider on a real candidate, not a distinct format (and is obsolete post-#64 — extract the candidate, drop the rider).
- **Known limitation:** multi-candidate single lines in the inline-numbered books yield only their first id → extracted counts are floors; reconcile per §3.
- **Verification:** per-group extracted row counts reconcile against §1's table; the script and its output live together under `sweep/_index/` and re-runs must be byte-identical on unchanged ledgers.

## Appendix C — file and PR reference list (state as verified 2026-08-27)

**Repo (`jestek-dev/scripture-search-engine`, main @ `0d12c34`):**
- `CLAUDE.md` — covenants (fixtures-first, NME = don't merge, one tokenizer, no theology scores)
- `docs/implementation-plan.md` §5 — consumer contract (Maskil, LH Worship Setlist, Versed)
- `eval/golden/` (fixtures; exemplar `hearing-and-doing.json`) · `eval/src/gates/corpusGolden.ts:116` (schema) · `eval/src/report.ts` (verdicts) · `eval/budgets.json` (G10) · `ontology/concepts/` (packs) · `eval/battery/queries.json`
- Commands: `npm run verify` · `npm run gauntlet` · `npm run gauntlet:report` (report at `eval/.runs/gauntlet-report.json`)

**Project files (`/mnt/project-files/`):**
- `research/bible-rollout/sweep/` — the 66 ledgers (30,160 lines); `sweep/_index/` — to be created (§3)
- `research/bible-rollout/CONVENTIONS.md` — §5 tags display-only; §11 adopted vocabulary + rulings
- `research/bible-rollout/engine-pack-backlog.md` — throughput record; 50-row roster; final-section state
- `research/bible-rollout/tag-apply/adopted-concepts.md` — 161 ids, engine-built markers (97 yes / 64 no)
- `research/bible-rollout/tag-gaps-review.md` — §3 declines / §1 contested (the adoption-pattern venue)
- `research/bible-rollout/<book>.md` — the 66 display-layer book docs (P4's target)
- `plans/2026-08-26-whole-bible-coverage-plan.md` — §3.3/§5.2 batch loop; §2.3 alias program
- `plans/2026-08-20-implementation-plan.md` Appendix A — the J1–J70 registry (J39)
- `HANDOFF.md` — governance, J39, G10, pastoral-* id split

**PRs (GitHub API, 2026-08-27):**
- **#67** — OPEN, draft: roster build, 47/50 rows, census 239→283, layer → `e4f864bf…`; head `a27e7d4`
- **#65** — OPEN: alias batch 1; `mergeable_state` **`unstable`** (mergeable, failing checks only; observed 2026-08-27) — conflicts resolved in merge commit `0d9fa0f`, one commit behind main (lacks the #66 merge `0d12c34`); owes a final baseline regen before landing
- **#61** — OPEN, draft: `gauntlet.yml` release-tag fix (workflow-only)
- **#66** — MERGED 03:30Z: six pending fixtures → active (closes the backlog advisory, §2.5)
- **#63** — MERGED 03:28Z: popular-verses 103/103 incl. the 10 formerly-held (closes that queue, §2.5)
- **#64** — MERGED 01:36Z: fixture corpus 5,726 → 31,098 verses (the re-measure-everything trigger, §4)
- **#62** — MERGED 01:37Z: four pending-fixture promotions
- **#53** — MERGED 2026-08-26: source re-pin (J52); origin of the sign-once J39 lesson

**Open process items owned elsewhere:** J39 signing (independent reviewer), G10 budget decision (167.84 vs 160 MiB), xref catch-up PR, corpus-expansion ruling supplement (incl. virgin-birth), the v0.14.0 mint itself.
