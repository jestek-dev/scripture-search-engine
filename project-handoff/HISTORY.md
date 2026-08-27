# Project history — scripture-search-engine (2026-08-05 → 2026-08-27)

A dated narrative of the project's Claude-collaboration phase, distilled from
the team-memory ledger (`memory-export/`, primary record), `git log` on main,
and the merged-PR record (#13–#67). Where a date or PR number is stated it
was taken from those sources, not from recollection. Prefixed context: the
repo predates this window — v0.7.0/v0.7.1 (the only npm releases, engine
0.7.1, schema 5) were cut 2026-07-31, and the July research docs live in
`docs/research/`.

---

## 2026-08-05 — Jesse's workbench proposal, audited

Jesse proposed a curation workbench (local dev UI; judgments → JSONL →
compiled fixtures/ontology edits). The audit verdict: **solid with
amendments**, surfacing repo gotchas (G8 baseline mechanics, fixture-corpus
coupling, stale README claims). This began the pattern that held all month:
Jesse proposes, an audit grounds it in verified repo fact, then a plan and
fixtures-first PRs follow. (Memory: `workbench-proposal-audit.md`.)

## 2026-08-06 — Torrey/Miller concordance admission (PR #13) and the v0.7.1 hash defect

- Jesse's 1977 *Topical Bible Concordance* (Miller ed.) was proven a verbatim
  313-topic subset of Torrey's *New Topical Textbook* (public domain, 1897) —
  making its content citable PD data. **PR #13 merged 2026-08-06**: pinned
  Torrey transcription manifest, 311-topic/21,002-ref curator dataset, 24 new
  fixture-first concepts, fixture corpus 1,077 → 4,256 verses. The other two
  concordance PDFs stayed desk-reference only; scan PDFs were removed (#13/#14).
- Same day, the workbench's fetch-artifact verification found the **v0.7.1
  release defect**: the published `content.db` did not hash to the committed
  descriptor — `release.yml`'s check compared the CI build against a
  descriptor the build had just overwritten (vacuous by construction). Jesse
  chose the re-review path (PR #15). This defect's descendants (promote-only
  releases, CI-minted descriptors, the "never rebuild at tag time" rule)
  shaped the whole release architecture.
  (Memories: `concordance-assessment.md`, `release-v071-hash-defect.md`.)

## 2026-08-06–11 — Workbench v1/v1.1, the v2.5 direct push, red main

- Workbench v1 (PR #15) and v1.1 (PR #16) landed; v1.1 encoded Jesse's
  UX law — plain language, no jargon pickers, auto-infer from evidence,
  ask humans only what only humans know (memory:
  `jesse-workbench-ux-feedback.md`).
- 2026-08-11: Jesse pushed **v2.5 "refinement studio" direct to main**
  (commit `12a0593`, 177 files, no PR). The audit found the covenant holds
  in code but process violated (self-approved G8 baseline, unreviewed
  merges, red main, broken compiler, UX regressions). PRs #18/#19 fixed the
  main-breakers (including the windows-latest 8.3-short-tmpdir gotcha).
  (Memories: `workbench-v25-audit.md`, `windows-ci-tmpdir-gotcha.md`.)

## 2026-08-12 — PR #20's one-click plan, audited "not as written", merged anyway

The one-click review-to-live plan's auto-merge stages conflicted with the
covenant's human-merge gate. Verdict delivered: cap at draft-PR stage. Jesse
merged the doc as written anyway; the recommended cap later landed as PR #28.
(Memory: `pr20-one-click-plan-audit.md`.)

## 2026-08-13–17 — The five-worker full audit and Phase 0 (PRs #21–#28)

The **2026-08-13 five-worker audit** (see
`reconstructed/2026-08-13-full-audit-summary.md`) found red main's sole cause
was the **stale_gauntlet clock time-bomb** (admission tests hard-coded
timestamps against a real 24h freshness window — failing forever since
2026-08-12), verified gauntlet ADMIT, and produced the engine/quality/
consumption/research headlines that seeded everything after. Its 11-item
plan (`docs/plans/2026-08-14-implementation-plan.md`) delivered **Phase 0 on
main by 2026-08-17 via PRs #21–#28**: clock fix (#21), v1 endpoint retired
(#23), evidence-based not-relevant flow (#24), source-drift sentinel (#25),
release repair — CI-minted descriptors, promote-only (#26), independent
baseline-review governance — the J39 machinery (#27), one-click plan capped
at draft-PR (#28). (Memory: `audit-2026-08-13-full.md`.)

## 2026-08-15–16 — Doctrinal guardrail research → DOCTRINAL-BASIS.md (PR #22)

Jesse asked whether a doctrinal guardrail was worth building. Research found
a nine-point shared core across TGC/The Village Church/Lighthouse (≈ the NAE
statement) and the Lausanne Akropong statement as the citable prosperity-
gospel criterion. Shipped and **merged as PR #22 (2026-08-16)**:
`docs/DOCTRINAL-BASIS.md` (two tiers: shared-core admission baseline + named
exclusion criteria + explicit NON-criteria), per-source doctrinal review
records (presence-checked, never scored — covenant #6 intact), prosperity
mustNotRank fixtures, G1/G4 red-flag checks that warn but never flip a
verdict. Companion audit: curated layer clean (0 violations across 19
manifests + 58 packs). The same window assessed Jesse's 5 in-copyright book
PDFs (all blocked for ingestion; value = gap checklist + fixture-query
ideas; Murdock excluded on prosperity grounds).
(Memories: `theological-guardrail-research.md`, `books-2026-08-15-assessment.md`;
project files: `theological-guardrail-recommendation-2026-08-15.md`,
`guardrail-audit-2026-08-15.md`, `new-books-assessment-2026-08-15.md`.)

## 2026-08-18–20 — Books harvest (PR #31), eval toughening, the 84-query grade

- The four usable books were harvested (non-copying: gap confirmations,
  felt-need queries, alias ideas) into **PR #31 — 108 concepts on the
  branch, 145 active fixtures** across two rounds. Jesse squash-merged it
  2026-08-20 16:30Z as `491f23b` — **without independent baseline sign-off**,
  making main's gauntlet red on the G2/G8 approval class from 2026-08-20
  onward (the debt that became J39's standing red). PR #32 (duplicate-anchor
  compile guard) followed the same day. Eval-toughening PRs #29/#30 (ordered
  per-probe snapshot, rank-sensitive fixtures) landed just before.
- The **84-query search-quality battery** graded main (`2363a3a`, 58
  concepts) **C-** — concept-covered queries excellent but three harmful
  sense-inverted #1s — and main+PR31+PR32 (108 concepts) **B-**. Failure
  patterns were attributed engine-vs-data with evidence; A-tier and S-tier
  were given measurable definitions. Report:
  `project-files/search-quality-report-2026-08-20.md`.
- That night Jesse gave the go for the **post-audit S-tier implementation
  plan**: 9 phases, 80 items, the **J1–J70 approval registry** (Appendix A —
  every decision reserved for Jesse), engine target 0.14.0. The plan file —
  `project-files/plans/2026-08-20-implementation-plan.md` — became the
  project's constitution; it exists nowhere else.
  (Memories: `books-harvest-pr31.md`, `search-quality-grade-2026-08-20.md`,
  `implementation-plan-2026-08-20.md`.)

## 2026-08-21–23 — Phases 0–8 to main; engine 0.10.0 → 0.14.0

The S-tier plan's buildable phases all reached main: #33/#34 directly;
Phases 2–6 via the consolidation **PR #43** (`031e9fc`, carrying the
#35/#36/#37/#39/#40/#42 stack — the 0.10.0–0.14.0 engine train, including
ranking fixes that closed the last harmful battery #1s, spelling/corrections
at 0.12.0/schema v7, pericopes at schema v8, TSK phrase capability at schema
v9); Phase 7 via #44; Phase 8 (mega-sweep infrastructure) via the #47
re-land. Engine has been **0.14.0** since. Mega-sweep certification
(MS-12..14) was deliberately left unimplemented pending J43/J63–J70 — per
Jesse, strictly last.

## 2026-08-21–22 — Jesse's prototypes and their audits; the uploaded-docs review

- The workbench redesign **design prompt ("The Study")** was authored for
  Jesse (`project-files/plans/2026-08-21-workbench-design-prompt.md`). He ran
  it through a design tool and committed **prototype v1** (2026-08-21,
  audited: static mockup, port-don't-ship) and **prototype v2** (2026-08-22,
  audited: search-driven flow mocked end-to-end — ready as the
  implementation spec, not as the app). See
  `reconstructed/2026-08-21-22-prototype-audit-verdicts.md`; screenshot
  evidence under `/mnt/project-files/research/2026-08-2*-prototype*/`.
- Jesse's 3 uploaded research docs (top-100 verses, "What Christians Search
  For" query inventory, gold-standard answer key) were assessed: all useful
  with caveats; popularity ranking-boosts and seasonal boosts **rejected**
  (hidden weights / determinism). Report:
  `project-files/research/2026-08-21-uploaded-docs-assessment.md`.

## 2026-08-22–23 — The Study built: P1–P5 (PRs #38/#45/#48/#49/#50)

Jesse commissioned and pre-approved the dashboard plan (2,176 lines, 42
D-items, 5 phases; every section through harsh-critic loops —
`docs/plans/2026-08-22-dashboard-implementation-plan.md`). Delivery, each
phase its own reviewed PR, all merged by Jesse within ~36 hours:
**#38** (P1 shell + themes + real read-only search, merged 2026-08-23
~03:43Z), **#45** (P2 voting end-to-end, ~15:24Z), **#48** (P3 suggestions,
~17:13Z), **#49** (P4 queue/Compare/History/Finish-up signing, ~20:35Z),
**#50** (P5 polish/onboarding/a11y + the flip, ~21:55Z). **The Study became
the default page at `/`; the old console preserved byte-identical at
`/advanced`.** Key locked decisions: engine order sacred (votes change
chips, never positions); undo = append-only supersede; honest effect-timing
copy. (Memory: `dashboard-plan-2026-08-22.md`.)

## 2026-08-22–23 — Genesis pilot → full-Bible summaries rollout (all 66 books)

- The chapter-summaries idea was assessed (GO with locked decisions: WEB
  sole text authority, BSB PD headings for boundaries, Brooks 1919/MHCC as
  PD bases, biblesummary.info/BibleProject steering-only never copied) and
  the **Genesis pilot** delivered same day: book summary + all 50 chapters
  (14 subdivided), display-only tags from the approved vocabulary,
  adversarial-reviewed. Jesse approved the tags 2026-08-22 19:19Z and the
  prose 2026-08-23 03:40Z ("Genesis looks good").
- The **14 Genesis-pilot concepts** shipped as engine packs — **PR #41
  merged 2026-08-22 ~22:56Z** (138 anchors, all ADMIT, 33 fixtures); its
  32-row decision table stayed open. Inventory PR #33 merged 2026-08-23.
- The same-day "Keller brain" question (Tim Keller's Gospel in Life archive)
  was answered with measured evidence: chapter tags should NOT feed ranking;
  **tags stay display-only**, engine untouched (ruling recorded).
- On Jesse's GO, the **full-Bible summaries rollout** ran as 8 parallel
  book-group threads under binding conventions
  (`project-files/research/bible-rollout/CONVENTIONS.md`), each book
  fresh-critic-looped to zero objections, all appending the shared tag-gap
  log. **Complete 2026-08-23 09:05Z — all 66 books** at
  `project-files/research/bible-rollout/<book>.md`. The tag-gap log was
  consolidated the same day into `tag-gaps-review.md`: **162 proposed
  concepts** across 13 themes, decision-ready for Jesse.
  (Memories: `chapter-summaries-assessment-2026-08-22.md`,
  `genesis-pilot-2026-08-22.md`, `concept-packs-14-2026-08-22.md`,
  `keller-tagging-chapter-tags-2026-08-22.md`, `bible-rollout-2026-08-23.md`,
  `tag-gaps-consolidation-2026-08-23.md`.)

## 2026-08-25 — Tag adoption + display-tag pass; apologetics packs (PR #51); top-200 verses; the wind-down

- Jesse ruled on the tag-gap review ("I agree with all additions"): **161
  concepts adopted** (162 minus one fold) into the display vocabulary,
  contested calls a–d settled, rulings recorded as binding CONVENTIONS §11.
  The **display-tag application pass** then ran across all 66 book docs:
  **1,428 tags applied / 709 reasoned skips**, every batch fresh-critic
  audited. (Memory: `tag-application-2026-08-25.md`.)
- **Mormon/JW apologetics research** (from Jesse's two uploaded conversation
  docs): a 29-concept/216-anchor concept map, 42 display tags, and **PR #51
  — 29 concepts via 20 packs/extensions, all ADMIT — merged by Jesse ~18:07Z**
  (`caf9fe3`), including his D13 master tags (`mormon-evangelism`,
  `jehovahs-witness-evangelism`) and his same-day scoping correction (bare
  "apologetics" = general defense only, enforced with 4 mustNotRank guards).
  Census reached 153. (Memory: `apologetics-tags-2026-08-25.md`.)
- The **top-200 popular verses** dataset was delivered
  (`project-files/research/popular-verses/`, 60 source lists, deterministic
  class-weighted scoring, 200/200 WEB-verified).
- **18:08Z: Jesse announced the wind-down — "only a couple more days left".**
  Triage split the remainder: Jesse's unblockers (J39 sign-off, J52 re-pin
  review, PR #41 rulings) vs Claude deliverables (display tags for the new
  mints, the J52 draft PR, **HANDOFF.md + release runbook**); deliberately
  deferred: the 161-concept engine packs (un-deferred the next day), the tag
  sweep, certification. (Memory: `project-wind-down-2026-08-25.md`.)
- The wrap-up thread delivered **/mnt/project-files/HANDOFF.md** (six
  fresh-critic rounds; the refreshed copy in this folder is now canonical)
  plus the release-machinery findings: the next tag must be **v0.14.0** (the
  changelog guard forbids anything else), **defect #5** — `gauntlet.yml`'s
  battery rebuild drops `--release-tag` so the descriptor gate stays red
  even after a mint (fix later drafted as PR #61), and the
  **merge-first-sign-once** J39 ordering adopted from PR #53's
  recommendation. Draft PR #52 (compileJudgments crash fix) was opened the
  same night. (Memory: `wrapup-handoff-2026-08-25.md`.)

## 2026-08-26 — J52 re-pin lands; 161 concepts land; the whole-Bible plan; the sweep launches

- **PR #52 merged 01:22Z** (`031ed69`). Jesse asked to un-defer the
  161-concept engine work; it ran overnight as six stacked draft PRs
  **#54 → #59** (census 153 → 239, zero NO-MEASURABLE-EFFECT packs).
- Afternoon: Jesse published the `source-snapshots-2026-08` release (14:47Z,
  digests verified), merged #54 (`8c8b78d`) — but #55–#59 merged
  **un-retargeted** onto each other's branches; recovery **PR #60**
  (14:53Z, `6367855`) carried batches 2–6 to main. Then **PR #53 — the J52
  re-pin of all three drifted sources — merged 15:22Z as `e762d1c`. J52
  done.** (Memory: `concept-packs-161-2026-08-26.md`.)
- Jesse's 16:03Z ask (whole Bible, verse-by-verse tags, fuzzy wording,
  every verse searchable) produced the **whole-Bible coverage plan**
  (`project-files/plans/2026-08-26-whole-bible-coverage-plan.md`): the
  three-layer framing (full-corpus word search / deterministic aliases /
  tag sweep), the artifact-vs-fixture-corpus reframe, and 8 decisions.
  **21:58Z Jesse ruled "Agree with all, Do the sweep in separate threads"**
  — notably expansion-first-then-sign-J39-once.
- **22:05Z the Layer-3 tag sweep launched**: 8 book-group threads + a
  Layer-2 alias/measurement thread. **By 23:59Z all 8 book-group sweeps were
  COMPLETE** — the whole Bible, 1,189 chapters read at `e762d1c`: ~400
  display-tag adds, ~2,137 anchor-extension + ~1,101 lexicon candidate rows,
  44 distinct new-concept proposals, 12 drops, **0 decline overturns**
  project-wide. Ledgers: `project-files/research/bible-rollout/sweep/<book>.md`
  (66 files). (Memories: `whole-bible-plan-2026-08-26.md`,
  `sweep-launch-2026-08-26.md`, the eight `*-sweep-2026-08-26.md` files.)
- The Layer-2 track re-graded the battery: main @ `e762d1c` scores **A-**
  (0 harmful results; was B-) — and surfaced the **G10 size flag** (full
  artifact 167.84 MiB > 160 MiB budget), a mint blocker. Report:
  `project-files/research/battery-regrade-2026-08-26.md`.

## 2026-08-27 — Corpus expansion, roster completion, the three plan deliverables, J39 unblocked

- **PR #64 merged 01:36Z** (`9099890`): the full-Bible fixture corpus
  expansion, **5,726 → 31,098 verses / 1,189 chapters** (executing the
  32-row combined ruling Jesse approved); corpus fingerprint → `6450b7d7…`.
  Fixture-promotion PRs **#62** (01:37Z) and **#66** (03:30Z — closing the
  last harmful audit result) followed; **PR #63** (03:28Z) promoted the
  popular-verses Tiers 1–3 as **103 golden guard fixtures, all measured**.
- **Jesse's plan-ideas survey** (02:49Z ask; 11 ideas — see
  `reconstructed/2026-08-27-plan-ideas-survey.md`). He picked #3/#4/#5;
  all three delivered the same day:
  the **theology-rulings ledger** — 44 numbered calls awaiting
  reply-by-number, rows 1–4 gating v0.14.0
  (`project-files/rulings/2026-08-27-theology-rulings-ledger.md`);
  the **sweep-adjudication plan** — ~3,600 candidates → an honest 15–25
  reviewed PRs (`project-files/plans/2026-08-27-sweep-adjudication-plan.md`);
  the **votes-to-engine plan** — deriver as sibling module, Updates inbox in
  The Study, merge-first-sign-once update trains, 5 phases; Jesse accepted
  all defaults 13:25Z (`project-files/plans/2026-08-27-votes-to-engine-plan.md`).
- **PR #65 merged ~13:02Z** (`b81f17c`): alias/lexicon mining batch 1 — 5 PD
  remembered-phrasing packs + 1 extension, all misses → #1.
- **PR #67 merged 13:44Z** (`65b6a6f`, **main tip**): the corpus-blocked
  roster build — **47 of 50 rows executed (44 new packs + 3 lexicon
  extensions), the last identity mover**. Verified on main: **census 288
  concepts, 530 active golden fixtures holding**. 3 rows stay gated on
  rulings (end-times, exile-and-captivity, virgin-birth).
- **Final identity on main: engine 0.14.0 / corpus `6450b7d7…` / layer
  `9a11fd56…` — no open identity movers. J39 signing is FULLY UNBLOCKED**:
  the refreshed signing walkthrough was posted ~14:00Z (digests recomputed
  against `65b6a6f`; reviewPacketSha256 `879e1db9…`; dry-run verdict ADMIT
  WITH WARNINGS). Remaining path: J39 sign once → branch cleanup → v0.14.0
  mint (blockers: the supplement ruling S1–S6, the G10 size call, and the
  defect-#5 `--release-tag` fix in draft PR #61). The complete outstanding
  list is `OUTSTANDING.md`; the current-state entry point is `HANDOFF.md`.

---

*Sources: `memory-export/MEMORY.md` and its topic files; `git log` on
`origin/main` (82 commits, tip `65b6a6f`); PR titles as recorded in main's
squash-merge subjects; the delivered plan/ruling/report files copied under
`project-files/`. Claims not verifiable from those sources were left out.*
