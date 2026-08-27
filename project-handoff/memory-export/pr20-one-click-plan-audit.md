---
name: pr20-one-click-plan-audit
description: 2026-08-12 audit of PR #20's one-click review-to-live plan — verdict "not as written": auto-merge removes the covenant's human-merge gate; release path assumptions broken
metadata:
  type: project
  modified: 2026-08-13T04:27:28.144Z
---

2026-08-12 audit of PR #20 (draft, docs-only, agent-authored branch under jestek-dev; adds docs/one-click-review-to-live-implementation-plan.md, 576 lines). Verdict delivered to Jesse: NOT as written; re-scope to "one click → ready-to-merge draft PR" (the plan's own rollout stage 2, which matches today's design).

Key findings (verified vs origin/main 83735fc):
- Plan's §2 inventory of local capabilities mostly TRUE (15/~21 claims), but "only a durable coordinator is missing" is misleading: merge/tag/release/consumer automation is absent by written design (publishPreparation.ts:1069 pledges no merge/release; v2.5 ops doc lists them as human gates).
- Covenant conflict: §5/§11/§20 stage 3+ auto-merge to main removes the human PR merge required by CLAUDE.md #1. The generated candidate (concept drafts, anchors, lexicon phrases, §9) contains decisions the judgment never settled, so the plan's own stop rule (§1/§3.3) either always fires or gets ignored. After auto-merge no human sees the diff pre-main.
- Unreliable mechanics: §12 "byte-level identity" impossible local↔CI (SQLite bytes differ per NEEDS-JESSE §1.6e) and CI↔CI is a toolchain race (nothing pinned); §12 version policy collides with tag=v${engineVersion}; phases assume the currently-broken release path (descriptor blocksRelease, descriptor≠v0.7.1 assets, fetch-artifact fails) with no repair phase; live v1 POST /api/judgment can permanently brick compileJudgments (never mentioned in plan); G8 baseline re-approval (probes.approval.json NOT on publish allowlist) is a structural dead-end for any baseline-moving batch; NO MEASURABLE EFFECT never checked; branch protection assumed but never provisioned ("both" checks undercounts the three, incl. the G2 cross-OS ordering check).
- Overbuilt: §6/§7's 10 modules + 17-state machine duplicate jobRunner/applyJournal/publishPreparation idempotence.
- Corrections delivered: cap at draft-PR stage; covenant change only as explicit CLAUDE.md amendment; repair phase first (descriptor/release + close v1 endpoint); logical-identity verification + pinned toolchain; artifact-release identity as a consumer-contract change; "materially changed" thresholds in eval/budgets.json; named stop reasons (G8 baseline moved, NO MEASURABLE EFFECT, ENGINE_VERSION bump); thin coordinator over existing machinery; drop consumer auto-merge until Phase 5 exists.

UPDATE 2026-08-13: PR #20 was MERGED AS-WRITTEN on 2026-08-12 (merge commit 5033517, now main HEAD) — the verbatim 576-line doc landed including the auto-merge stages (§5 pipeline auto-merge, §11.7 API auto-merge, §20 stage-3+ rollout). The recommended re-scope (cap at draft-PR stage) was NOT applied and no follow-up commit amends it. It remains a plan document, not implementation — but it should be amended before anyone implements it, or the covenant conflict with CLAUDE.md #1 becomes code. (The red CI on the merge commit was the unrelated stale_gauntlet test time-bomb, see [[audit-2026-08-13-full]].)

Related: [[workbench-v25-audit]], [[release-v071-hash-defect]], [[jesse-workbench-ux-feedback]], [[audit-2026-08-13-full]]
