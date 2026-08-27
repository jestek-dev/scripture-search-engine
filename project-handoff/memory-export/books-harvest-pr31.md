---
name: books-harvest-pr31
description: 2026-08-18 books-harvest curation PR #31, rounds 1+2 — 108 concepts / 145 fixtures; SQUASH-MERGED to main 2026-08-20 16:30Z as 491f23b WITHOUT independent baseline sign-off (main gauntlet red expected until independent approval PR); open — independent baseline approvals on MAIN, books-branch disposition (Jesse 2026-08-20: do NOT delete — may bring Books files onto main, decision pending), corpus re-pin backlog, 1 Pet 5:7 weight call
metadata:
  type: project
  modified: 2026-08-20T16:51:50.760Z
---

# Books-harvest curation — PR #31 (2026-08-18)

## Round 1

PR #31 (branch `claude/hearth-thread-vdj22q`): 20 new concepts across three clusters (comfort/god-of-all-comfort, holy-spirit-the-comforter, new-creation, loneliness; rest-for-the-weary, guidance, wisdom-from-god, assurance-of-salvation, do-not-lose-heart, identity-in-christ, pleasing-god-not-people, merged contentment; friendship, generosity, tithing, gods-provision, humble-exaltation, parenting, taming-the-tongue, caught-up-together) + patches (worry/stress aliases on peace-of-god after minimal 1 Pet 5:7 dedup commit 341eaca; bereavement on grief-and-loss; guilt on forgiveness-of-sins; bare temptation on remembered-a-way-of-escape; be-still on refuge-in-trouble; work aliases). Prosperity-contentment + both sense-inversion pending fixtures closed.

## Round 2 (same day, 2026-08-18)

PR #31 head is now **bece58a** (16 commits total). Totals across both rounds: **108 concepts** on the branch (58 → 78 round 1 → 108 round 2; round 2 added 30 new concepts and extended 41 existing, +194 anchors), **145 active fixtures all passing** (40 added round 2; unpardonable-sin still the 1 pending), doctrinal scan **0 flags across 624 anchors**.

Round-2 notes:
- Sweep worked from a **252-topic / 1,127-ref cross-reference matrix** (470 refs already anchored, 319 admitted-in-corpus, 338 corpus-blocked → committed backlog doc `docs/research/2026-08-18-books-harvest-corpus-backlog.md`).
- Notable rejects with reasons: Signs of the Times / Tribulation Period / Kingdom Age = eschatological system categories; National Patriotism / Time of War = civic frames scripture doesn't teach; Gal 5:16 fitness = category error; 2 Chr 7:14 guarded via mustNotRank against "Our Nation" misuse; Favor stays rejected.
- Conflict resolutions: one merged faith pack; godly-marriage; Rom 8:28 → remembered-all-things-for-good; study/delight split; James 4:7 → resisting-the-devil.
- G8-evidence lexicon narrowings: humble-exaltation walk-humbly entries, loving-others "walk in love" — each displaced 80% of ot-prophets-justly, limit 40%.
- Mark 11:24 (0.65) + John 14:13-14 (0.6) survive on prayer with slogan-query guards verified.

## Status: SQUASH-MERGED to main 2026-08-20 — approval debt moved to MAIN, not discharged

PR #31 was **squash-merged to main by jestek-dev on 2026-08-20 16:30Z as commit 491f23b** ("Books-harvest curation, rounds 1–2: 50 concepts, 145 active fixtures — the complete four-book harvest (#31)"). It was merged **AS-IS with the baseline approval files still stale** (blobs e8071d6 / 12e6106) — **no independent sign-off ever happened**. The merge mooted the PR-blocking status only: main now carries **unbound candidate baselines**, and its Admission gauntlet is **expected red on the single gauntlet-machine-report test (G2/G8 approval-binding)** until an independent reviewer — **NOT this thread; this thread is the change author and may not sign** — authors the two approval files in a follow-up PR. That approval's priorProvenance must name merge-base blob 93d0e25's successor — actually on main post-merge, before = 2363a3a's approved probes.json. Candidate baselines on main: probes **f1fc7b9**, ordering.snapshot **f9088d5**.

Pre-merge conflict resolution (2026-08-20): merge conflict with PR #30 (2363a3a) was resolved — 5 notes-only fixture conflicts plus one real collision: PR-B's John 3:16 top-5 pin on gods-love was widened to top-10, with documentation.

Ripple effects:
- PR #32 (other thread's 1 Pet 5:7 dedup) is now conflicting/"dirty" — should reduce to its duplicate-anchor compile guard.
- Branches `claude/hearth-thread-vvwdi2` (Books scans — per Jesse, project chat 2026-08-20 ~12:31Z relayed by the coordinator: do NOT delete; he may want the Books files brought onto main, decision pending with him) and `claude/hearth-thread-vdj22q` (merged PR head) both still exist.

Historical detail (pre-merge): gauntlet REJECT was solely on G2/G8 approval-binding (candidate baselines need independent Jesse-designated reviewer per docs/governance/probe-baseline-review.md — change author may not sign). On the branch the candidate digests were: probes baselineSha256 cdf4f2fc…, layerFingerprint de60b905…; ordering-snapshot approval was to carry priorProvenance naming merge-base blob 93d0e25 (merge-base ba34273 unchanged).

## Blocked / remaining

Upstream WEB source drift (check:drift shows pinned 3458ca34→upstream 8b1f7bf0) prevents corpus expansion → unpardonable-sin concept deferred (pending fixture is the gap record), Job 16:2/Eccl 1:9 ordering guards vacuous until a reviewed re-pin PR adds Job 16, Eccl 1, Matt 12, Mark 3, Prov 18 (watch Prov 18:16 watchlist) etc. — round-2 corpus-blocked refs live in the committed backlog doc above. PR #31 itself is merged (2026-08-20) — nothing blocks it anymore. Still open post-merge: (a) **independent baseline approvals on MAIN** (see Status — main gauntlet red until a non-author reviewer lands the follow-up approval PR); (b) Jesse's weight call on the surviving 1 Peter 5:7 entry; (c) PR #32 fallout: RESOLVED — #32 was rebased down to just its duplicate-anchor compile guard after the peace-of-god overlap and Jesse merged it 2026-08-20 ~16:44Z; (d) **books-branch disposition**: `claude/hearth-thread-vvwdi2` still exists — per Jesse (project chat, 2026-08-20 ~12:31Z, relayed by the coordinator), do NOT delete it; he may want the Books files brought onto main, decision pending with him. Copyright caveat stands: in-copyright scans on main = redistribution risk, flagged to him 2026-08-20 (see [[books-2026-08-15-assessment]]); (e) corpus re-pin backlog above.

Books provenance: pairings inspired by Phillips/Rich/White Stone volumes (Murdock excluded per DOCTRINAL-BASIS §3), all anchors labeled editorial/torrey only. Reference tables for all three books (bare refs only) secured at `/mnt/project-files/book-reference-tables/`.

See [[books-2026-08-15-assessment]], [[theological-guardrail-research]], [[audit-2026-08-13-full]].
