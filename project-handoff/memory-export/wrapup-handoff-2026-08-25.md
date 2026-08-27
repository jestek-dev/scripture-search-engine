---
name: wrapup-handoff-2026-08-25
description: 2026-08-25 wrap-up thread DELIVERED /mnt/project-files/HANDOFF.md (6 fresh-critic rounds to zero objections) + draft PR #52 fixing the compileJudgments verse-level crash; key release findings — next tag must be v0.14.0 (changelog-guard), gauntlet.yml battery rebuild omits --release-tag so the descriptor gate stays red post-mint (documented defect #5, fix proposed not implemented), and PR #53's merge-re-pin-first-then-sign-J39-once ordering adopted in the first-hour checklist; PR #52 MERGED 2026-08-26; PR #53 awaits Jesse
metadata:
  type: project
  modified: 2026-08-26T01:25:09.478Z
---

# Wrap-up handoff — 2026-08-25 (thread cmsg_01P3QsU2j86UJUbajEtMTYp2AfCGGbyNAeJ24sVxAG6F12)

Jesse had ~2 days left; this thread produced the durable handoff.

**HANDOFF.md** at /mnt/project-files/HANDOFF.md — single entry point to project state, written for a no-context reader. Six fresh-critic rounds (2H+4S / 4S / 3H+3S / 3H+2S / 1S / 1S nit) to zero objections; every claim primary-source verified. Covers: main @ caf9fe3 (engine 0.14.0, 153 concepts, PR #51 merged by Jesse 2026-08-25 18:07Z, The Study at /), why CI is red (J39 stale 0.9.0 approvals failing the gauntlet-machine-report canary; J52 drift — openbible checksums + web fingerprint), all 70 J-items with locations (registry only in /mnt/project-files/plans/2026-08-20-implementation-plan.md Appendix A), deliverables map, deferred roadmap, consumer pinning, and the v0.14.0 release runbook.

**Release-machinery discoveries (critic rounds 4–5, all verified):**
- changelog-guard.mjs forbids any tag ≠ engine/package.json version → next mint/tag must be **v0.14.0**, not v0.9.0; docs/descriptor-pr-template.md §2.1 hardcodes stale 0.9.0/schema-6.
- gauntlet.yml battery rebuild passes --built-at but never --release-tag; buildArtifact.ts emits release:{tag} only with that flag → descriptor gate stays deterministically red even after a mint's descriptor PR. Documented as HANDOFF defect #5 with exact proposed fix (extract RELEASE_TAG from committed descriptor, append --release-tag at gauntlet.yml ~:427–437). NOT implemented — needs a reviewed PR.
- Dependency order (per PR #53's recommendation, adopted): merge re-pin PR #53 first → single J39 sign-off against post-re-pin identity → mint v0.14.0 + descriptor PR → gauntlet.yml fix → main fully green. PR #53's own CI run 32889151337 empirically shows the post-re-pin shape (fetch green, descriptor gate red, only the J39 canary failing).
- sources.yml drift alarm is transient-green: upstream rolls weekly, each roll a new J52-class decision.

**PR #52 — MERGED 2026-08-26 (~01:22 UTC) by jestek-dev, squash merge commit 031ed69b5c4be84bdf4bd3b03e9b589891ad82bf (main's new HEAD).** https://github.com/jestek-dev/scripture-search-engine/pull/52 (branch claude/hearth-wrapup-handoff-27it4g, commit 21f4c7e) — fixes pre-existing compileJudgments crash (workbench/src/compileJudgments.ts:759 iterated selection.chapters unconditionally; verse-level web-subset.json entries carry verses with no chapters; stale local interface hid it). +1 regression test (22→23), workbench green both OSes; all its CI red was pre-existing J39/J52 (two standing-down comments on the PR). Merging unblocked nothing CI-wise (post-merge gauntlet run 32918755741 expected to show the same J39/J52 reds; in_progress at observation) but fixes the workbench crash. HANDOFF.md updated with dated merge notes the same day. Related: [[implementation-plan-2026-08-20]], [[apologetics-tags-2026-08-25]], [[release-v071-hash-defect]].
