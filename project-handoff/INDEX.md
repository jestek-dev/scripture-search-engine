# Project Handoff — master catalog

This folder preserves, inside the git repo, everything significant the
scripture-search-engine Claude project produced outside it — built
2026-08-27 on the premise that the Claude project (its chat threads, the
`/mnt/project-files` share, and the team memory) is about to be deleted.
Requested by Jesse as a "Project Handoff" folder; named `project-handoff/`
in kebab-case per this repo's naming convention.

**Start here:**

| Doc | What it is |
|---|---|
| [HANDOFF.md](HANDOFF.md) | The single entry point to project state — the 2026-08-25 HANDOFF refreshed 2026-08-27 to main @ `65b6a6f`. **This repo copy is now canonical**; the share copy carries a superseded banner. |
| [HISTORY.md](HISTORY.md) | Dated narrative of the whole project, 2026-08-05 → 2026-08-27. |
| [OUTSTANDING.md](OUTSTANDING.md) | Checklist of everything open: "Needs Jesse" vs "Needs future work". |
| [INDEX.md](INDEX.md) | This catalog. |

Accounting: every file found in the Step-1 inventory sweep (the repo's
tracked docs, all 248 files under `/mnt/project-files`, and all 55
team-memory files) is either linked, copied, reconstructed, or listed under
"Intentionally excluded" below.

---

## 1. `memory-export/` — Claude's team memory (55 files + README)

Verbatim export of `/tmp/claude/memory/team/silo/` — the project's dated
working ledger, 2026-08-05 → 2026-08-27. `memory-export/MEMORY.md` is the
index (one line per memory, newest first); see
[memory-export/README.md](memory-export/README.md) for how to read them.
Verified: no secrets or credentials.

## 2. `project-files/` — verbatim copies from `/mnt/project-files`

Everything below is copied **verbatim** (no rewriting), preserving its
subpath under `/mnt/project-files/`. 247 files (186 text/data files, plus
the 61 screenshot PNGs added at verification — see the screenshots table
below). The one exception to
verbatim handling is `HANDOFF.md`, which was **refreshed** into
[HANDOFF.md](HANDOFF.md) (its 2026-08-25/26 body kept intact; only dated
2026-08-27 additions) rather than duplicated.

### Plans (`project-files/plans/`, 6 files)

| Doc | Description |
|---|---|
| [2026-08-20-implementation-plan.md](project-files/plans/2026-08-20-implementation-plan.md) | **The 9-phase post-audit S-tier master plan carrying the J1–J70 approval registry (Appendix A, lines 849–941) — the single most important file here; the registry exists nowhere else.** Copied from /mnt/project-files/plans/. |
| [2026-08-21-workbench-design-prompt.md](project-files/plans/2026-08-21-workbench-design-prompt.md) | The design brief ("The Study" direction) that produced Jesse's prototypes and the dashboard. Copied from /mnt/project-files/plans/. |
| [2026-08-22-dashboard-implementation-plan.md](project-files/plans/2026-08-22-dashboard-implementation-plan.md) | The Study's 42-D-item implementation plan (P1–P5 + flip). The repo also tracks a copy at `docs/plans/`. Copied from /mnt/project-files/plans/. |
| [2026-08-26-whole-bible-coverage-plan.md](project-files/plans/2026-08-26-whole-bible-coverage-plan.md) | Whole-Bible coverage plan: 3-layer framing, artifact-vs-fixture-corpus reframe, the 8 decisions Jesse ratified 21:58Z. Copied from /mnt/project-files/plans/. |
| [2026-08-27-sweep-adjudication-plan.md](project-files/plans/2026-08-27-sweep-adjudication-plan.md) | How the ~3,600 sweep candidates become admitted engine data (~15–25 reviewed PRs; index-first; P1–P4 priorities). Copied from /mnt/project-files/plans/. |
| [2026-08-27-votes-to-engine-plan.md](project-files/plans/2026-08-27-votes-to-engine-plan.md) | The Study votes → reviewed engine updates loop (deriver as sibling module; Updates inbox; update trains; 5 phases). Copied from /mnt/project-files/plans/. |

### Rulings (`project-files/rulings/`, 1 file)

| Doc | Description |
|---|---|
| [2026-08-27-theology-rulings-ledger.md](project-files/rulings/2026-08-27-theology-rulings-ledger.md) | The consolidated 44-call theology-rulings ledger (rows 1–4 gate v0.14.0) + G1–G17 governance pointers + already-ruled appendix. Awaiting Jesse's reply-by-number. Copied from /mnt/project-files/rulings/. |

### Top-level reports (`project-files/`, 4 files)

| Doc | Description |
|---|---|
| [search-quality-report-2026-08-20.md](project-files/search-quality-report-2026-08-20.md) | The 84-query battery baseline (main C- → B- with PRs #31/#32) that drove the 0.10.0+ fix train; carries the FLAG-FOR-JESSE calls behind J1–J7. Copied from /mnt/project-files/. |
| [theological-guardrail-recommendation-2026-08-15.md](project-files/theological-guardrail-recommendation-2026-08-15.md) | The doctrinal-guardrail research and recommendation that became DOCTRINAL-BASIS.md (PR #22). Copied from /mnt/project-files/. |
| [guardrail-audit-2026-08-15.md](project-files/guardrail-audit-2026-08-15.md) | The system audit against the doctrinal basis (curated layer clean; live-probe findings). Copied from /mnt/project-files/. |
| [new-books-assessment-2026-08-15.md](project-files/new-books-assessment-2026-08-15.md) | Assessment of Jesse's 5 in-copyright book PDFs (all blocked for ingestion; feeds J55/J56/J60/J61). Copied from /mnt/project-files/. |

### Bible rollout (`project-files/research/bible-rollout/`, 138 files)

| Doc / group | Description |
|---|---|
| [CONVENTIONS.md](project-files/research/bible-rollout/CONVENTIONS.md) | The binding rollout conventions — voice, WEB accuracy, tags, doctrinal guardrails; **§11 records Jesse's 2026-08-25 adoption of the 161-concept vocabulary and tag rulings.** Copied from /mnt/project-files/research/bible-rollout/. |
| 65 per-book summary docs (`<book>.md`) | The full-Bible chapter summaries + display tags, all critic-approved to zero objections (Genesis's material lives in the pilot doc below — there is deliberately no `genesis.md` here). Copied from /mnt/project-files/research/bible-rollout/. |
| 66 sweep ledgers ([sweep/](project-files/research/bible-rollout/sweep/)`<book>.md`) | The 2026-08-26 whole-Bible Layer-3 tag-sweep ledgers (1,189 chapters @ `e762d1c`; ~400 adds, ~2,137 anchor + ~1,101 lexicon candidates, 0 decline overturns). The sweep-adjudication plan's raw input. Copied from /mnt/project-files/research/bible-rollout/sweep/. |
| [tag-gaps.md](project-files/research/bible-rollout/tag-gaps.md) | The append-only shared tag-gap log (raw, 2,797+ lines). Copied from /mnt/project-files/research/bible-rollout/. |
| [tag-gaps-review.md](project-files/research/bible-rollout/tag-gaps-review.md) | The consolidated 162-concept review Jesse ruled on ("agree with all additions" → 161 adopted). Copied from /mnt/project-files/research/bible-rollout/. |
| [tag-apply/adopted-concepts.md](project-files/research/bible-rollout/tag-apply/adopted-concepts.md) | The canonical CONVENTIONS §11.1 adopted-concepts list (161 ids, engine-built markers). Copied from /mnt/project-files/research/bible-rollout/tag-apply/. |
| [engine-pack-backlog.md](project-files/research/bible-rollout/engine-pack-backlog.md) | The 161-concept rollout's durable ledger: per-PR batch/census/fingerprint table, the 50-row corpus-blocked roster, items flagged for Jesse. Copied from /mnt/project-files/research/bible-rollout/. |
| [corpus-expansion-ruling-packet.md](project-files/research/bible-rollout/corpus-expansion-ruling-packet.md) | The 32-row combined expansion + xref ruling packet Jesse approved 2026-08-26 21:58Z (executed by PR #64). Copied from /mnt/project-files/research/bible-rollout/. |
| [corpus-expansion-ruling-supplement.md](project-files/research/bible-rollout/corpus-expansion-ruling-supplement.md) | **The OPEN supplement ruling S1–S6 (+ virgin-birth venue) — blocks the v0.14.0 mint.** Copied from /mnt/project-files/research/bible-rollout/. |

### Other research (`project-files/research/`)

| Doc / group | Description |
|---|---|
| [2026-08-22-genesis-pilot-summaries.md](project-files/research/2026-08-22-genesis-pilot-summaries.md) | The Genesis pilot (book summary + 50 chapters + tags), approved by Jesse — the rollout's template. Copied from /mnt/project-files/research/. |
| [2026-08-21-uploaded-docs-assessment.md](project-files/research/2026-08-21-uploaded-docs-assessment.md) | Review of Jesse's 3 uploaded research docs; ranking/seasonal boosts rejected. Copied from /mnt/project-files/research/. |
| [2026-08-22-chapter-summaries-assessment.md](project-files/research/2026-08-22-chapter-summaries-assessment.md) | The chapter-summaries GO assessment (sources, licenses, build path). Copied from /mnt/project-files/research/. |
| [2026-08-22-keller-tagging-and-chapter-tags-assessment.md](project-files/research/2026-08-22-keller-tagging-and-chapter-tags-assessment.md) | The "Keller brain" question + measured ruling that chapter tags stay display-only. Copied from /mnt/project-files/research/. |
| [battery-regrade-2026-08-26.md](project-files/research/battery-regrade-2026-08-26.md) / [.json](project-files/research/battery-regrade-2026-08-26.json) | The post-re-pin battery re-grade (A-, 0 harmful) that surfaced the G10 size flag; 16-row alias-mining seed table. Copied from /mnt/project-files/research/. |
| [apologetics-tags/apologetics-concept-map.md](project-files/research/apologetics-tags/apologetics-concept-map.md) / [.json](project-files/research/apologetics-tags/apologetics-concept-map.json) | The Mormon/JW apologetics concept map (29 concepts / 216 WEB-verified anchors) behind PR #51. Copied from /mnt/project-files/research/apologetics-tags/. |
| [popular-verses/](project-files/research/popular-verses/) (21 files) | The top-200 popular-verses dataset with full provenance: `top-200-verses.{json,md}`, `dedupe-log.md`, deterministic `build_ranking.py`, 5 source JSONs, and `held-fixture-drafts/` (11 files — drafts promoted via PR #63). Copied from /mnt/project-files/research/popular-verses/. |

### Screenshot evidence (`project-files/research/`, 61 PNGs, ~5.6 MB total)

Copied verbatim at the 2026-08-27 verification pass (originally excluded as
binaries; added because they are the only project-file content that would
otherwise die with the project — the reviewer may drop them from the PR if
unwanted). The findings they evidence are preserved in text in
`reconstructed/2026-08-21-22-prototype-audit-verdicts.md`, the dashboard
plan, and the memory export.

| Directory | Contents |
|---|---|
| [research/2026-08-21-prototype-audit/](project-files/research/2026-08-21-prototype-audit/) (16 PNGs) | Jesse's workbench prototype v1 screens + the old workbench against the real server. |
| [research/2026-08-22-prototype-v2/](project-files/research/2026-08-22-prototype-v2/) (7 PNGs) | Prototype v2 — the search-driven flow that became The Study's spec. |
| [research/2026-08-22-study-p1/](project-files/research/2026-08-22-study-p1/) (5 PNGs) | The Study Phase 1: shell, themes, read-only search. |
| [research/2026-08-23-study-p2/](project-files/research/2026-08-23-study-p2/) (8 PNGs) | Phase 2: voting, interview, tail rescue, undo. |
| [research/2026-08-23-study-p3/](project-files/research/2026-08-23-study-p3/) (8 PNGs) | Phase 3: suggestion flow and receipts. |
| [research/2026-08-23-study-p4/](project-files/research/2026-08-23-study-p4/) (8 PNGs) | Phase 4: queue, blind Compare, History, Finish-up signing. |
| [research/2026-08-23-study-p5/](project-files/research/2026-08-23-study-p5/) (9 PNGs) | Phase 5: onboarding, shortcut sheet, polish — the flip. |

### Reference data and uploads

| Doc / group | Description |
|---|---|
| [book-reference-tables/](project-files/book-reference-tables/) (3 JSON files) | Bare-reference tables harvested from the J61 books (growing-by-heart, phillips-topics, scriptural-prayers). Copied from /mnt/project-files/book-reference-tables/. |
| [uploads/hearth/](project-files/uploads/hearth/) (5 uuid-named text files) | Jesse's raw uploaded source docs, verbatim: `020f1dc6…` = "Top 100 Most Popular Bible Verses"; `76497040…` = "Gold-Standard Answer Key: 26 Felt-Need Topics"; `be0d739a…` = "What Christians Search For in the Bible"; `7b509c8c…` = the Mormonism conversation doc; `df49f69b…` = the Jehovah's Witnesses conversation doc. Copied from /mnt/project-files/uploads/hearth/. |

## 3. `reconstructed/` — deliverables that existed only in threads

Each is marked **RECONSTRUCTED from project memory/threads on 2026-08-27,
not the original** in its header.

| Doc | Description |
|---|---|
| [2026-08-27-plan-ideas-survey.md](reconstructed/2026-08-27-plan-ideas-survey.md) | The 11-item plan-ideas survey (Jesse picked #3/#4/#5; #1 and #2 remain unpicked). Original was a thread reply only. |
| [2026-08-21-22-prototype-audit-verdicts.md](reconstructed/2026-08-21-22-prototype-audit-verdicts.md) | The audits of Jesse's workbench prototypes v1 and v2 (port-don't-ship; ready-as-spec). Originals were in-thread; screenshots remain on the share. |
| [2026-08-13-full-audit-summary.md](reconstructed/2026-08-13-full-audit-summary.md) | The five-worker full audit (stale_gauntlet time-bomb; Phase 0 PRs #21–#28). Original was a published web artifact only. |

## 4. Docs already tracked in the repo (indexed, not duplicated)

Links are relative to this folder.

### Governing docs

| Doc | Description |
|---|---|
| [README.md](../README.md) | Project overview and consumer quickstart. |
| [CLAUDE.md](../CLAUDE.md) | **The covenant** — no AI at runtime, determinism, no-I/O engine, one tokenizer, explanations contractual, no theology scores; data-admission and gate discipline. |
| [docs/DOCTRINAL-BASIS.md](../docs/DOCTRINAL-BASIS.md) | The written admission basis (nine-point shared core; prosperity exclusion; explicit non-criteria) — PR #22. |
| [docs/NEEDS-JESSE.md](../docs/NEEDS-JESSE.md) | The older (pre-2026-08) decision register; the operative J1–J70 registry is in the 2026-08-20 plan above. |
| [docs/architecture.md](../docs/architecture.md) | "The deterministic theologian" — system architecture. |
| [docs/implementation-plan.md](../docs/implementation-plan.md) | The repo's standing implementation plan; **§5 is the canonical consumer contract** (Maskil / LH Worship Setlist / Versed). |
| [docs/CONSUMERS.md](../docs/CONSUMERS.md) | Consumer pinning discipline (engine semver + artifact descriptor). |
| [docs/COMPATIBILITY.md](../docs/COMPATIBILITY.md) | Engine semver × artifact schema matrix. |
| [docs/ATTRIBUTIONS.md](../docs/ATTRIBUTIONS.md) | Source acknowledgements. |
| [docs/governance/probe-baseline-review.md](../docs/governance/probe-baseline-review.md) | The J39 independent baseline-review process and v2 approval schema. |
| [engine/CHANGELOG.md](../engine/CHANGELOG.md) / [engine/README.md](../engine/README.md) | Engine version history (0.7.1 → 0.14.0) and package docs. |
| [.claude/skills/concept-curation/SKILL.md](../.claude/skills/concept-curation/SKILL.md) | The concept-curation skill — the codified fixtures-first admission workflow. |

### Plans and process docs

| Doc | Description |
|---|---|
| [docs/plans/2026-08-14-implementation-plan.md](../docs/plans/2026-08-14-implementation-plan.md) | The 11-item plan from the 2026-08-13 audit (Phase 0 = PRs #21–#28). |
| [docs/plans/2026-08-22-dashboard-implementation-plan.md](../docs/plans/2026-08-22-dashboard-implementation-plan.md) | Repo copy of The Study plan (share copy also preserved above). |
| [docs/2026-08-08-audit-hardening-plan.md](../docs/2026-08-08-audit-hardening-plan.md) | The early audit-hardening plan. |
| [docs/one-click-review-to-live-implementation-plan.md](../docs/one-click-review-to-live-implementation-plan.md) | The PR #20 plan, later capped at draft-PR stage (PR #28). |
| [docs/workbench-implementation-plan.md](../docs/workbench-implementation-plan.md), [docs/workbench-refinement-studio-plan.md](../docs/workbench-refinement-studio-plan.md), [docs/workbench-recovery.md](../docs/workbench-recovery.md), [docs/workbench-v2.5-operations.md](../docs/workbench-v2.5-operations.md) | The workbench v1 → v2.5 plan/ops lineage. |
| [docs/telemetry-and-gap-mining.md](../docs/telemetry-and-gap-mining.md) | The gap-mining loop design ("learning without a learning system"). |
| [docs/descriptor-pr-template.md](../docs/descriptor-pr-template.md) | Descriptor-PR template (§2.1 values stale — see HANDOFF release runbook). |
| [docs/release-verification-rehearsal.md](../docs/release-verification-rehearsal.md) | Release-verification rehearsal runbook (queues behind J39). |
| [docs/source-repins.md](../docs/source-repins.md), [docs/source-snapshots-errand.md](../docs/source-snapshots-errand.md), [docs/web-repin-staged.md](../docs/web-repin-staged.md), [docs/openbible-repin-staged.md](../docs/openbible-repin-staged.md), [docs/corpus-payload-dependency.md](../docs/corpus-payload-dependency.md) | The source re-pin discipline and the J52 errand/method record (executed via PR #53). |

### Research (repo-side)

| Doc | Description |
|---|---|
| [docs/research/2026-07-29-nave-torrey-topical-sources.md](../docs/research/2026-07-29-nave-torrey-topical-sources.md), [2026-07-29-whole-bible-exposition-sources.md](../docs/research/2026-07-29-whole-bible-exposition-sources.md), [2026-07-30-lh-sermon-corpus-assessment.md](../docs/research/2026-07-30-lh-sermon-corpus-assessment.md), [2026-07-31-search-telemetry-mining.md](../docs/research/2026-07-31-search-telemetry-mining.md) | The July source-survey research (Torrey/Nave, exposition sources, sermon-corpus do-not-ingest, telemetry mining). |
| [docs/research/2026-08-06-torrey-miller-topical-concordance.md](../docs/research/2026-08-06-torrey-miller-topical-concordance.md) | The Torrey/Miller PD verification behind PR #13. |
| [docs/research/2026-08-08-remembered-phrasings.md](../docs/research/2026-08-08-remembered-phrasings.md), [2026-08-08-single-token-lexicon-audit.md](../docs/research/2026-08-08-single-token-lexicon-audit.md) | The remembered-phrasings and bare-word-reachability measurements. |
| [docs/research/2026-08-18-books-harvest-corpus-backlog.md](../docs/research/2026-08-18-books-harvest-corpus-backlog.md) | The books-harvest corpus-blocked backlog (PR #31 companion). |
| [docs/research/2026-08-21-audit-gap-verification.md](../docs/research/2026-08-21-audit-gap-verification.md) | Measured re-verification of audit gaps before packs. |

### Reviews and decision records (repo-side)

| Doc | Description |
|---|---|
| [docs/reviews/2026-08-10-probe-baseline-review.md](../docs/reviews/2026-08-10-probe-baseline-review.md), [2026-08-15-probe-baseline-re-review.md](../docs/reviews/2026-08-15-probe-baseline-re-review.md) | The baseline review records (the 08-10 one is the self-approved record the J39 governance replaced). |
| [docs/reviews/2026-08-20-branch-inventory.md](../docs/reviews/2026-08-20-branch-inventory.md) | The branch census — evidence for J61/J62 dispositions. |
| [docs/reviews/2026-08-21-ship-forward-v090.md](../docs/reviews/2026-08-21-ship-forward-v090.md) | The ship-forward / never-republish-0.7.1 decision (its "v0.9.0" number is stale; the tag is v0.14.0). |
| [docs/reviews/2026-08-25-source-repin-delta-reports.md](../docs/reviews/2026-08-25-source-repin-delta-reports.md) | The J52 re-pin delta reports (PR #53's review evidence). |
| [docs/reviews/sweep/README.md](../docs/reviews/sweep/README.md), [approvals/2026-08-23-batch-000-audit-seed.md](../docs/reviews/sweep/approvals/2026-08-23-batch-000-audit-seed.md) | The mega-sweep review home + seed approval batch. |

### Infrastructure docs

| Doc | Description |
|---|---|
| [eval/GAUNTLET_MACHINE_REPORT.md](../eval/GAUNTLET_MACHINE_REPORT.md) | The gauntlet machine-report v2 format. |
| [ontology/README.md](../ontology/README.md), [ontology/aliases/README.md](../ontology/aliases/README.md) | The concept spine (Layer A) and curated alias docs. |
| [sweep/README.md](../sweep/README.md), [sweep/TRIAGE-RULES.md](../sweep/TRIAGE-RULES.md), [sweep/grading/rubric-v1.md](../sweep/grading/rubric-v1.md), [sweep/paraphrase/PROMPT.md](../sweep/paraphrase/PROMPT.md), [sweep/runs/README.md](../sweep/runs/README.md) | Mega-sweep infrastructure (advisory until J43/J63–J70). |
| [conformance/README.md](../conformance/README.md), [conformance/expected/README.md](../conformance/expected/README.md) | The consumer-runtime conformance kit. |
| [curation/README.md](../curation/README.md) | Offline embedding-assisted curation tooling (P4.16). |
| [workbench/DESIGN.md](../workbench/DESIGN.md), [workbench/static/fonts/README.md](../workbench/static/fonts/README.md) | The Study design system + font provenance. |
| [workbench/prototype/Project approval needed/DESIGN.md](<../workbench/prototype/Project approval needed/DESIGN.md>) + `github.md`, [prototype/Scripture Workbench/DESIGN.md](<../prototype/Scripture Workbench/DESIGN.md>) + `github.md` | Jesse's committed prototype v1/v2 exports (the audited mockups; see the reconstructed audit verdicts). |
| [eval/test/fixtures/baseline-review-packet.golden.md](../eval/test/fixtures/baseline-review-packet.golden.md) | Golden test fixture for the review-packet format (test data, listed for completeness). |

## 5. Intentionally excluded

| What | Where it stays | Reason |
|---|---|---|
| `/mnt/project-files/HANDOFF.md` (as a verbatim duplicate) | Refreshed into [HANDOFF.md](HANDOFF.md) | Handled specially per the handoff brief: the repo copy is the canonical refresh (original body preserved intact inside it); the share copy now carries a superseded banner. |

(The 61 screenshot PNGs, originally excluded here as binaries, were copied
in at the 2026-08-27 verification pass — see the screenshots table in §2.)

Nothing under `/mnt/project-files` is excluded: 248 files total =
247 copied (186 text/data + 61 PNGs) + 1 refreshed (HANDOFF.md).
