# The 2026-08-13 five-worker full audit — summary (report existed only as a published artifact)

> **RECONSTRUCTED from project memory/threads on 2026-08-27, not the original.**
> The full report was published as a web artifact ("Scripture Search Engine —
> Full Audit & Strengthening Plan (2026-08-13)") and never committed as a
> file. This summary is rebuilt from the team-memory record
> (`memory-export/audit-2026-08-13-full.md`). The plan it produced IS in the
> repo: `docs/plans/2026-08-14-implementation-plan.md`.

Five parallel workers audited `origin/main` @ `5033517` (the PR #20 merge),
read-only.

## Headline findings

- **Red main's sole cause was a test time-bomb**, not product breakage:
  `workbench/src/admission.ts` rejects gauntlet reports older than 24h
  against the *real* clock, while `admission.test.ts` hard-coded
  `2026-08-11T10:00:00Z` fixture timestamps and the fake clock was not
  injected into `previewAdmission` — so 15 tests failed on both OSes on
  every run since 2026-08-12, forever, regardless of commit content. Fix was
  ~2 lines (inject the test clock; do not widen the freshness window).
- **Gauntlet at HEAD: verdict ADMIT, all 11 gates pass** (G3 70 fixtures /
  58 concepts, G8 0% churn, G10 131 MiB / 160, G11 p95 8.9 ms).
- **Quality probe:** concept-covered queries excellent, zero explanation
  misattributions; but sense-inverted #1s wherever coverage is absent
  ("new beginnings" → Eccl 1:9 "no new thing"; "comforter" → Job 16:2
  "miserable comforters"; "it is well with my soul" → Jer 4:10;
  "lord's supper" → 1 Cor 11:20). ~70% of weakness was data, ~30% engine
  (exact_phrase +60 drowning concept anchors; translation_variant as sole
  evidence promoting junk; flat passage_terms ties; anchor collapse).
- **Engine audit:** all covenants hold in code, but G6 was a hardcoded
  `pass(...)` (the only gate reporting pass without running anything); the
  eval system asserted presence-in-windows, never rank (a #1→#8 regression
  passed everything); ENGINE_VERSION bump discipline was social, not
  mechanical; CI ran V8/Node only while consumers are Hermes/JSC.
- **Consumption:** the committed descriptor matched NO published asset
  (schema 6/0.7.1 phantom vs the published schema-5 pair); repair = CI-minted
  descriptors, promote-only releases, post-release smoke.
- **Sources:** all three rolling upstream sources had drifted from their
  pins, breaking `fetch:sources` — the first observation of what later
  became the J52 re-pin.
- **Research ranked by value:** OpenBible pericopes, STEPBible
  TVTMS/TIPNR, BSB tables, Robertson's Harmony, Hymnary.org (permission
  needed); skip Thompson chains, MH Concise, Strong's glosses.

## What it produced

- 2026-08-14: an 11-item implementation plan built from the audit, each item
  critic-approved — committed as `docs/plans/2026-08-14-implementation-plan.md`.
- 2026-08-17: **Phase 0 fully landed via PRs #21–#28**: #21 admission-test
  clock fix, #23 v1 judgment endpoint retired (compiler unbrickable), #24
  evidence-based not-relevant flow, #25 source-drift sentinel + re-pin
  process, #26 release repair (CI-minted descriptors via
  `mint-artifact.yml`, no tag-time rebuilds, release-smoke test), #27
  independent baseline-review governance (the J39 machinery), #28 one-click
  plan capped at draft-PR with a guard test. (#22, the doctrinal guardrail,
  merged 2026-08-16 from the parallel guardrail thread.)
- The audit's findings also seeded the 2026-08-20 84-query battery and the
  9-phase S-tier plan (`project-files/plans/2026-08-20-implementation-plan.md`).
