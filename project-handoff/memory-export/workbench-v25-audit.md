---
name: workbench-v25-audit
description: 2026-08-11 audit of the v2.5 "refinement studio" — covenant holds in code, but unreviewed direct push, red main, broken compiler, self-approved G8 baseline
metadata:
  type: project
  modified: 2026-08-11T17:20:47.464Z
---

2026-08-11 audit of commit `12a0593` ("feat: deliver refinement studio through v2.5", 177 files, +63,660/−9,835), pushed direct to main by jestek-dev with no PR. Findings (verified in code/CI that day):

- Covenant HOLDS in code: engine has no fs imports and never reads judgments; workbench opens corpus read-only; compile-judgments writes only pending eval/golden fixtures gated by gauntlet + human-merged draft PR; publish path allowlisted (publishPreparation.ts FORBIDDEN_PATH); no per-result weight knobs.
- Process side violated: the commit rewrote eval/baselines/probes.json after G8 fired on the Aug 10 unreviewed merges (up to 100% top-10 displacement), with probes.approval.json signed "independent admission baseline reviewer" but authored on Jesse's own machine (C:/Users/Jeste paths in docs/reviews/2026-08-10-probe-baseline-review.md). Aug 10 batch also merged two branches with no PR (incl. 96-file ranking series 0.8.0/0.9.0), and main carried 0.9.0 ordering code under ENGINE_VERSION 0.8.0 for ~17.5h.
- Red main at 12a0593: CI failed both OSes; ~6-7 workbench tests fail (migration-manifest SHA mismatch vs committed judgments.jsonl in cases.ts; two deterministic lock_busy failures in applyJournal/comparisonRunner); compile-judgments completely broken by the manifest mismatch; legacy POST /api/judgment still live and any v1 append bricks the compiler's closed-log guard; npm run verify fails on fresh checkout (engine/dist missing — only prepack builds it); fetch-artifact hash-mismatches descriptor and pipeline fetch:sources fails pinned upstream checksums.
- Judgment HTTP flow itself works end-to-end (all 5 v2 actions land identity-stamped; unknown fields/stale snapshot tokens rejected loudly; PR #17 page-lock strengthened; append-only, fail-loud, no silent drops; no fsync though).
- UX regressed against [[jesse-workbench-ux-feedback]]: "Not relevant" lost v1.1's evidence-based auto-inference (back to diagnosis dropdown + hand-typed concept id; the old /api/concepts wiring sits unused server-side); missing-passage lost live verse preview/prefill; 6 of 11 tabs are engineer consoles incl. sha256-transcription confirmations; no search without creating a case. Security is strong (127.0.0.1 only, real CSRF guard, no traversal/shell, allowlisted jobs) but a browser click can push a branch + open a draft PR.

Recommendations delivered to Jesse in-thread: fix red main first, redo baseline approval honestly, return to PRs, close v1 endpoint, restore v1.1 inference + hide engineer tabs, fix artifact fetch.
