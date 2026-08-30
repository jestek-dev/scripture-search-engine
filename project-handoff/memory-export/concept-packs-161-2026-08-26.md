---
name: concept-packs-161-2026-08-26
description: 2026-08-26 all 161 adopted tag-gap concepts LANDED ON MAIN (census 153→239; batches #54–#59, recovery PR #60 squash 6367855; #53 re-pin e762d1c); Jesse's 21:58Z "Agree with all" executed → full-Bible corpus PR #64 (31,098 verses, identity 0.14.0/6450b7d7…/fd27c55c…) MERGED by Jesse 2026-08-27 ~01:36Z; supplement ruling + G10 size = mint blockers; continuation (50-row roster → draft PR #67) in [[concept-packs-50-roster-pr67-2026-08-27]]
metadata:
  type: project
  modified: 2026-08-27T04:15:07.295Z
---

# 161-concept engine-pack rollout — 2026-08-26

- All 161 adopted tag-gap concepts ([[tag-application-2026-08-25]],
  tag-gaps-review.md §2) dispositioned as engine packs in six theme batches,
  stacked PRs #54–#59. Census 153→239 (+86 new ids; 96 admissions incl. 10
  lexicon/anchor extensions). Zero NO-MEASURABLE-EFFECT merged.
- Stacked PRs mis-targeted: only #54 hit main. Recovery **PR #60** carried
  batches 2–6 — **MERGED ~14:53Z as squash `6367855`**; census 239 verified
  on main. CI reds all pre-existing J39/J52 (comment 5427140189). Pack
  branches deletable.
- **PR #53** corpus re-pin **MERGED ~15:22Z (`e762d1c`)** — pure re-pin, 5,726
  verses. Post-#53 sweep: all 50 corpus-blocked roster rows STILL GATED;
  roster + Jesse-decision items in
  `/mnt/project-files/research/bible-rollout/engine-pack-backlog.md`.
- Release `source-snapshots-2026-08` verified 3/3 checksums; staging deletable.
- **Full-Bible expansion** (Jesse's 16:03Z go): 5,726→31,098 verses / 1,189
  chapters, corpus `644b241c…`→`6450b7d7…`, no ENGINE_VERSION bump; subset
  quarantine held. G3 stopped on 28 fixture moves → 32-row combined ruling
  packet
  (`/mnt/project-files/research/bible-rollout/corpus-expansion-ruling-packet.md`).
- Jesse ruled **"Agree with all" 21:58Z**; all 32 rows executed → draft
  **PR #64** (final identity 0.14.0 / 6450b7d7… / fd27c55c…, G3 green;
  virgin-birth not executed, row 20 returned to pending). CI triaged
  pre-existing-only (comment 5432710970). Battery reconciliation found **6
  NEW release-bed-only rows** → SUPPLEMENT delivered
  (`…/bible-rollout/corpus-expansion-ruling-supplement.md`, S1–S6 +
  virgin-birth option (ii) + row-20 presenceOnly; **ruling PENDING**) — mint
  blocker alongside **G10 size 167.84 MiB > 160**.
- Cross-PR: alias PR #65 conflicts on `eval/baselines/probes.json` +
  `ordering.snapshot.json`; second-to-merge owes the regen; **J39 signs once,
  after the LAST identity-moving merge**.
- **PR #64 MERGED by Jesse 2026-08-27 ~01:36Z (squash 9099890).** Continuation
  — 50-row roster built, draft PR #67 — in
  [[concept-packs-50-roster-pr67-2026-08-27]].

Related: [[project-wind-down-2026-08-25]], [[concept-packs-14-2026-08-22]],
[[apologetics-tags-2026-08-25]].
