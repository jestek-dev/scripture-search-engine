---
name: concordance-assessment
description: Torrey/Miller topical admission MERGED via PR #13 (2026-08-06); provenance finding, what landed, open follow-ups
metadata:
  type: project
  modified: 2026-08-06T14:37:05.648Z
---

Jesse's 1977 "The Topical Bible Concordance" (Miller ed., committed as PDF under `Concordance/` on main) was proven a verbatim 313-topic subset of Torrey's New Topical Textbook (PD 1897) — 7 topics/~300 points compared verbatim across three witnesses. So its content is citable public-domain data, not just desk reference. TRUST and TRINITY entries are Miller-only/unverified and excluded. The other two PDFs (Baker's 1974, QuickNotes ©2002) remain desk-reference only (redundant word indexes; QuickNotes in-copyright).

Shipped 2026-08-06 on branch `claude/hearth-thread-nuemln` (9 commits, verified ADMIT, 92/92 tests, engine untouched at 0.7.1): `pipeline/manifests/torrey.json` (pinned MIT transcription from j86schroeder/topical-bible-search@7eac7eb) + lineage-only `nave.json`; curator dataset (311 topics, 21,002 validated refs) + research doc in `docs/research/torrey-topical/`; 24 new fixture-first concepts (worship/devotional core) + torrey anchors on 7 existing concepts; fixture corpus 1,077→4,256 verses; G8 re-baselined.

Non-obvious facts learned:
- Torrey admission is pure data: manifests are directory-scanned, `sources:` ids are unvalidated strings checked only against manifests by G1; fetchSources auto-discovers manifests with sha256+sourceUrl.
- The session proxy blocks all non-GitHub hosts (ebible.org, ccel.org, archive.org unreachable); WEB text fidelity-checkable via github.com/jogomu/webc (canonical USFM, matches engwebp char-for-char). Two other WEB mirrors are OLDER revisions and fail fidelity (BibleNLP/ebible, vendored VPLs).
- `generateFixture.ts` had a silent bug (duplicate-book SELECTION entries overwrote; Isaiah 40/43 missing from CI corpus since 2026-07-30) — fixed on the branch.
- Single-word queries ("worship") get no concept evidence by design: lexicons are multi-token phrases.

Merged to main 2026-08-06 as PR #13 (also removed the Topical PDF + .DS_Store files, gitignored .DS_Store). Open: ~240 remaining topics tiered in the research doc (Holy Spirit family next); 24 review-queue refs + 11 witness discrepancies need human resolution; Baker's and QuickNotes PDFs (both in-copyright) were STILL on origin/main at merge time — Jesse believed he'd removed them but the push never landed; flagged in-thread. Related: [[workbench-proposal-audit]]
