---
name: whole-bible-plan-2026-08-26
description: 2026-08-26 whole-Bible coverage plan DELIVERED (fresh-critic APPROVED round 2 zero objections) at /mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md — key reframe: shipped v0.7.1 artifact is ALREADY full-Bible word-indexed (31,098 verses/66 books, but descriptor marked stale/blocksRelease since 2026-08-08); 5,726-verse corpus = CI fixture subset only; cross-translation matching mostly built (30,817-verse/307,923-stem KJV-ESV-NIV-NLT index wired into ranking); tag sweep specified as 8 section-first book-group threads ~10–16 thread-days; 8 Jesse decisions incl. xref catch-up (#1) and expansion-first-sign-once vs mint-first ordering conflict (#2, second-approval-cycle cost); corpus expansion built + pushed (de0fa84), PR gated on Jesse's combined 33-row fixture adjudication
metadata:
  type: project
  modified: 2026-08-26T22:03:14.443Z
---

# Whole-Bible coverage master plan — 2026-08-26

Thread id `cmsg_01P3QsU2j86UJUbajEtMTYp2J5whwFvA82Yug1MNgvd55p` ("Whole-Bible coverage master plan"). Jesse's ask, 2026-08-26 16:03Z: whole Bible + verse-by-verse tag consideration + fuzzy alternate wording + every verse word-searchable. Plan delivered at `/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md` (fresh-critic APPROVED round 2, zero objections). Repo state verified against `origin/main` @ `e762d1c` (PR #53), 239 packs, engine 0.14.0.

## Three-layer framing

1. **Layer 1 — full-corpus word search** (owned by the corpus-expansion / engine-packs thread; documented, not planned, here).
2. **Layer 2 — cross-translation aliases / alternate wording, deterministically** (this plan's work).
3. **Layer 3 — verse-by-verse tag sweep** as a specified multi-thread pipeline (this plan's work).

## The artifact-vs-fixture-corpus reframe

There are two corpora and the ask conflated them. The **release artifact** (`content.db`, descriptor `artifacts/content-artifact.json`) is already the whole Bible: 31,098 verses across all 66 books, every one word-indexed — so "an untagged verse with a searched word populates" is already true in the shipped artifact. **Caveat:** the descriptor is marked `stale: { since: 2026-08-08, blocksRelease: true }`, and its `stale.reason` ("Built 2026-07-30 against an 8-concept ontology") contradicts the same file's `counts.concepts: 33` and `builtAt` 2026-07-31 — the stale marker is deliberate (blocks release until re-mint), its reason text is simply wrong. The **fixture corpus** (`pipeline/fixtures/web-subset.json`, 5,726 verses / 49 books / 215 chapters touched) is what CI and the gauntlet measure against; expansion's real deliverable is closing that measurement gap (fixtures, admissions, guards for any verse), not making verses searchable. Word-searchability with zero tags is confirmed in build + runtime code (`pipeline/src/schema.ts`, `engine/src/intents/lexical.ts`); PR #33's bare-word inventory is NOT this mechanism.

## Scope boundaries (agreed 16:08Z with the engine-packs / corpus-expansion thread)

- **They own:** full-Bible ingestion (one PR, all 66 books from pinned engwebp VPL WEB, baseline regeneration) + the 50-row corpus-blocked backlog afterwards. Status honesty: as of verification 2026-08-26 16:32Z this is a *relayed* claim — no PR exists, thread branch tip equals main's `e762d1c`, zero expansion commits observable.
- **This plan's pipeline owns:** alias mining (Layer 2), the tag sweep (Layer 3), popular-verses fixture promotion — all unowned/unstarted at delivery time.

## Layer 2 strategy

Offline PD mining, fixtures-first, no runtime AI. Already built: 30,817-verse / 307,923-stem KJV-ESV-NIV-NLT translation-token index (capped at 6 pts as sole evidence), archaic/inflection folding, deterministic SymSpell spelling policy, 15 QR-6 whole-query alias rows + 1,434 lexicon phrases / 1,599 anchors. Mining program: (1) PD translations ASV/YLT/Darby/BSB via `generateTranslationTokens.ts --reps` (drop if NO MEASURABLE EFFECT); (2) famous-phrase alias/lexicon batch seeded from popular-verses top-200, alias only where a query measurably fails, fixture first; (3) battery-driven gap mining after a fresh 84-query battery re-grade against post-expansion main. No per-caller tokenizer option, no runtime similarity, no containment aliases. End-state sizing ~100–300 alias rows.

## Layer 3 pipeline

8 book-group threads, section/chapter-first per CONVENTIONS §4 (chapter judgment unit) and §11 (presence bar; soft cap 6 / hard ceiling 8; yield order), per-verse refinement only for dense chapters. Estimate ~10–16 thread-days for the chapter sweep (blanket per-verse rejected: 16–40 thread-days for little extra). Inputs per thread: book doc, all 239 concept ids with lexicons/anchors, tag-gaps-review.md §3 declines + §1 contested calls (re-considerable only with new textual evidence), corpus-blocked roster (route, don't duplicate). Ingestion: golden fixture first → gauntlet → batched PRs of ~15–20 **TARGETING MAIN** (the #54–#59 mis-target / #60 recovery lesson is binding); NO MEASURABLE EFFECT = don't merge — expected often once full-corpus word search is live, and that's the system working. Throughput basis: 96 admissions/day measured ceiling. Full thread prompt template + curation loop in plan §5.2.

## Now vs handoff (§5)

Mergeable by end of 2026-08-27 (this plan's side): (1) popular-verses golden-fixture PR; (2) first alias/lexicon batch from measured gaps; (3) sweep pipeline spec (no merge needed). Owned elsewhere: (4) corpus-expansion PR (engine-packs thread, reported in progress, unobserved); (5) **J39 sign-off + v0.14.0 mint — EXTERNALLY GATED** on an independent third-party reviewer who did not author the change (no standing reviewer role; finding one is the slow part).

## §6 decision list (verbatim)

1. **Xref catch-up ruling (OPEN):** accept the catch-up regeneration as its own reviewed follow-up PR after expansion, reviewing the 8 moved expectations (6 fixtures + 3 eval tests) fixture-by-fixture? — *Default: yes, separate PR, soon after expansion.*
2. **Release ordering vs corpus expansion (cross-thread call, §1.3):** merge the expansion first and have the independent reviewer sign J39 once against the final identity (PR #53's own lesson), or mint v0.14.0 first and accept a second full independent-approval cycle after the expansion moves the fingerprints? — *Default: expansion-first, sign once — unless you specifically want a stable v0.14.0 release minted before the corpus identity moves. (The expansion thread stated the mint-first ordering; this plan flags the conflict rather than deciding it.)*
3. **Decline-overturn rule:** a recorded decline may be overturned only with new textual evidence, logged against the original decline? — *Default: yes.*
4. **PD alias/vocabulary sources:** approve ASV/YLT/Darby/BSB as offline mining sources (BSB's public-domain dedication to be confirmed in the PR's G1 manifest — CONVENTIONS already treats BSB headings as PD)? — *Default: yes, G1 does the verifying.*
5. **Modern-translation famous phrases:** may short remembered phrasings from ESV/NIV/NLT become alias rows under the same short-phrase posture as hymn titles (Circular 33; the J37 analog), or PD-wording only? — *Default: PD-only until you rule, mirroring the hymn pack's posture.*
6. **Sweep authority:** sweep threads may mint new-concept candidates directly through fixtures+gauntlet (per-PR decision tables, your merge as admission), no pre-review stage? — *Default: yes — it is exactly how the 161-concept rollout worked.*
7. **Standing backlog rulings that gate sweep batches** (already flagged in `engine-pack-backlog.md` §"Items flagged for Jesse's decision"): end-times vs day-of-the-lord merge; exile-and-captivity routing; election-and-predestination §4-neutral gist read; shepherd-psalm-guard activation. — *Defaults recorded per item in that file.*
8. *(Pre-existing, listed for sequencing only:)* J39 reviewer sign-off; J47/J48/J51 at the v0.14.0 mint; J54 (the expansion merge itself is this approval).

**Claude-decidable defaults (not decisions — listed so nothing looks silently assumed):** sweep granularity (section/chapter-first with per-verse refinement) is settled by CONVENTIONS §4's chapter-unit rule plus §11's caps and yield order, not by a new ruling; sweep vocabulary scope (all 239 ids + §3 declines + §1 contested calls) likewise follows from §11's adopted-vocabulary addendum and §3's own purpose; and the popular-verses fixture promotion needs no standing ruling — it is discharged by the ordinary fixtures-first PR flow, where the merge IS the ruling.

## Update 2026-08-26 16:47Z

Expansion thread reported measured numbers (relayed, not re-verified; dated addendum appended to the plan doc): fixture corpus 213→1,189 chapters / 5,726→31,098 verses; corpusFingerprint 644b241c…→6450b7d7…, layerFingerprint b24ea16d…→b2c1fc84…, NO ENGINE_VERSION bump; web-subset.json 1.37→7.68 MB, CI fixture.db 27.2→70.4 MB (9.0s build), G11 p95 40.3ms/150ms; +441 dormant anchors activate (1,158→1,599), translation tokens 53,160→307,923; xref separability PROVEN (openbible 23 rows / 1,835 edges byte-identical, xref-suppression 7/7 green). Still no PR — built state pushed to branch claude/hearth-161-concept-packs-2tf8jk as de0fa84. NEW BLOCKER: G3 fails with 28 golden-expectation moves across 16 fixtures (all displacement/reason-label, zero mustNotRank/pastoral; 3 fixtures overlap the xref catch-up's 8) → PR gated on a Jesse fixture-adjudication ruling; expansion thread proposes ONE combined 33-row ruling packet (catch-up 8 + expansion 28, overlap 3) forthcoming at /mnt/project-files/research/bible-rollout/corpus-expansion-ruling-packet.md, effectively widening decision #1 from "xref catch-up as its own PR?" to "adjudicate the combined 33-row union in one pass?" (decision #2's J39/mint ordering presented neutrally in the packet's secondary calls).

## Update 2026-08-26 22:01Z — Jesse approved

Jesse (timeline message `cmsg_01P3QsU2j86UJUbajEtMTYp253P9s1WjWcx9R7WtBzf5Xn`, 21:58Z) replied "Agree with all, Do the sweep in separate threads" — ratifying all 8 §6 decisions at their recommended defaults, notably #2 = expansion-first-then-sign-J39-once, and green-lighting the 8-thread tag sweep. The coordinator session is spawning the sweep threads from the plan doc; this thread supplied pre-spawn constraints (two-stage sweep work: analysis now, gauntlet/pack PRs only after expansion merges; batch PRs target main directly; 50-row corpus-blocked backlog stays with the expansion thread; decline overturns need new logged evidence) and recommended a separate Layer-2 thread (alias mining + popular-verses fixture promotion, PD sources approved, modern phrases PD-only) starting immediately. Plan thread RESOLVED 2026-08-26.

## Related memories

[[concept-packs-161-2026-08-26]] · [[wrapup-handoff-2026-08-25]] · [[project-wind-down-2026-08-25]] · [[tag-application-2026-08-25]] · [[popular-verses-top200-2026-08-25]]

## Update 2026-08-26 22:05Z — approved and launched

Jesse approved all 8 §6 decisions and the sweep in separate threads (21:58Z ruling above); the plan thread is RESOLVED. The Layer-3 sweep launched 22:05Z as 8 book-group threads plus a Layer-2 alias/measurement thread. Execution details — thread/session ids, sweep briefs and constraints, and what remains genuinely open with Jesse — live in [[sweep-launch-2026-08-26]].
