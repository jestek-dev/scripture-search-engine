# Outstanding items — scripture-search-engine (as of 2026-08-27, main @ `65b6a6f`)

Everything known to be open, verified against the team-memory record, the
repo, and the delivered plan/ruling docs before listing. Identity on main:
engine **0.14.0** / corpus **`6450b7d7…`** / layer **`9a11fd56…`**; census
288 concepts; 530 active golden fixtures. The narrative context for these
items is `HANDOFF.md`; the theological calls are enumerated with options and
recommendations in
`project-files/rulings/2026-08-27-theology-rulings-ledger.md` (cited below
as "ledger").

## Needs Jesse

The release-critical path, in order:

- [ ] **J39 — the baseline signature (the release chokepoint).** Designate
  the independent reviewer and have them sign ONCE, via a reviewed PR,
  authoring the two v2 approval records that bind
  **0.14.0 / `6450b7d7…` / `9a11fd56…`** (no open identity movers remain).
  The refreshed walkthrough was posted ~14:00Z 2026-08-27 with digests
  recomputed against `65b6a6f` (reviewPacketSha256 `879e1db9…`; dry-run
  verdict ADMIT WITH WARNINGS). Process:
  `docs/governance/probe-baseline-review.md`. Turns both `verify` CI legs
  green.
- [ ] **Supplement ruling S1–S6** (+ virgin-birth venue pick + row-20
  presenceOnly shape) — the corpus-expansion ruling supplement at
  `project-files/research/bible-rollout/corpus-expansion-ruling-supplement.md`
  (~6 minutes of reply). **Blocks the v0.14.0 mint.** (Ledger row 1 carries
  the virgin-birth half.)
- [ ] **G10 size-budget call** — the v0.14.0 artifact measures **167.84 MiB
  vs the 160 MiB `totalArtifactBytes` budget** (`spelling_deletes` 15.7 vs
  12 MiB and `spelling_terms` 1.1 vs 1 MiB also over). Reviewed
  `eval/budgets.json` decision required before/alongside the descriptor PR:
  bump (recommended in HANDOFF defect #6 — the sub-budgets already sum to
  ~245 MiB) vs cut. Blocks the descriptor PR, not the mint run itself.
- [ ] **The 44-call theology-rulings ledger** awaits reply-by-number
  (`project-files/rulings/2026-08-27-theology-rulings-ledger.md`). **Rows
  1–4 gate v0.14.0** (virgin-birth pick; PR #65 admission ratification; the
  Rom 4:17 bare-pair question; PR #67 admission ratification — merge was the
  admission act, rows 2/4 are confirmations). Rows 5–29 gate sweep/backlog
  batches; rows 30–44 are standing calls. "Successor decides" is an explicit
  per-row option.
- [ ] **3 gated concepts, untouched by the roster build:** `end-times`
  (↔ day-of-the-lord merge — ledger rows 5/5a), `exile-and-captivity`
  (routing incl. Ps 137 — ledger row 6), `virgin-birth` (supplement ruling).
- [ ] **v0.14.0 mint → descriptor PR → tag push → release smoke checklist**
  — the Release runbook in `HANDOFF.md` (mint via `mint-artifact.yml` with
  `release_tag=v0.14.0`; descriptor PR per `docs/descriptor-pr-template.md`
  with its stale-§2.1 caveat; the tag push IS the release decision per J47).
  Attached calls: J48 (verse_translation_tokens licensing counsel —
  BLOCKING per the ledger's G8 pointer), J50 (v0.7.1 notes annotation), J51
  (immutable releases — default yes, before the tag), J49 (CC BY
  attribution passthrough into the §5 contract).
- [ ] **Draft PR #61** — the gauntlet `--release-tag` fix (defect #5;
  workflow-only, a deliberate no-op until a minted descriptor carries
  `release.tag`). Review and merge; it is what lets the battery legs — and
  therefore main — go fully green **after** the mint's descriptor PR lands.
- [ ] **Branch cleanup** — origin carries 60 branch heads. Deletable on
  recorded evidence (formal approval is the J62-class call):
  `claude/hearth-thread-wrhubh-p7`, `-p8` (trees byte-identical to main
  `388569e`), `claude/source-snapshots-2026-08-staging` (release assets
  verified 2026-08-26), `claude/hearth-thread-wrhubh-j52` (PR #53 merged),
  `claude/hearth-thread-wrhubh-fixture-promotions` and
  `-fixture-promotions-2` (promotions merged via #62/#66),
  `claude/hearth-161-concept-packs-2tf8jk` … `-b6` (content on main via
  #54/#60/#64/#67 per PR #60's body). **Do NOT delete
  `claude/hearth-thread-vvwdi2`** — it holds the 5 in-copyright book PDFs
  and its disposition is **J61, a required decision** (publicly served
  today; options in `HANDOFF.md` Branch dispositions).
- [ ] **PR #41's decision table + the deny-list residuals** — the 32-row
  table's open rows (providence label, Rev 20:11-15, Ps 113:9 / Luke 15
  weights, …) and the **8 bare-word deny-list candidates from PR #33**
  (`lord`, `job`, `greater`, `build`, `gifts`, `starting`, bare `blessing`,
  bare `sovereign`) — ledger row 24 and the already-ruled appendix track
  what is genuinely still open.
- [ ] **Bare-pair deny-list review** — the {call, thing} ∪ {cast, care}
  pairs surfaced by alias batch 1 (Rom 4:17 row, J9 slogan guard shipped);
  ledger row 3.
- [ ] **A5b — the old-WEB-bytes archive search** (`3458ca34…`) from an
  unrestricted machine; if no copy exists anywhere, accepting the loss of
  from-scratch reproducibility of the pre-August snapshot is Jesse's
  explicit call ("that call is yours alone" — nothing in PR #53 signed it
  off).
- [ ] **Standing governance registry items** not individually restated here:
  the J1–J70 registry (Appendix A of
  `project-files/plans/2026-08-20-implementation-plan.md`) and the ledger's
  G1–G17 pointer list — notably J43 (all sweep thresholds deliberately null
  until ratified), J45 (explanation-faithfulness audit protocol + auditor),
  J55/J56/J57 (TSK + STEPBible source verdicts), J59 (pericope
  preaching-themes pilot), J60 (Thompson chains), J63–J69 (sweep
  certification set), NEEDS-JESSE §0 residuals, and formal ratification of
  the coverage-plan §6 defaults currently running unruled (#3 decline
  overturns, #4 PD alias sources, #6 sweep authority).

## Needs future work (Claude/successor)

- [ ] **Sweep-adjudication execution** — turn the 66 sweep ledgers'
  candidates (~2,137 anchor-extension + ~1,101 lexicon rows + 44 mint
  proposals + ~400 display-tag adds ≈ 3,600 items) into admitted data per
  `project-files/plans/2026-08-27-sweep-adjudication-plan.md`: build the
  consolidated candidate index first, batch per-concept (~15–20 admissions
  per PR, NME-pruned, re-measured on post-#64 main), priority P1 Psalms
  anchor-gap seam → P2 concentration table → P3 mints (ruling-gated) → P4
  display-tag apply (book-doc edits, zero engine effect, can start
  immediately). Honest ballpark: **15–25 reviewed PRs**, not 100+. No
  layer-moving batch merges before the v0.14.0 mint (preparation is not
  frozen — validated draft PRs may queue).
- [ ] **Votes-to-engine build** — the 5 phases (0–4) of
  `project-files/plans/2026-08-27-votes-to-engine-plan.md`: vote deriver as
  a sibling module feeding the existing proposals → candidates → admissions
  pipeline, Updates inbox in The Study, merge-first-sign-once update trains.
  Jesse accepted all defaults 2026-08-27 13:25Z; **open call #4 — naming the
  post-wind-down J39 signer — remains open by design** (guard trains
  continue, data trains freeze until a signer is named).
- [ ] **Per-verse tag refinement** — the sweep flagged **~505
  refinement-marked entries / hard-ceiling chapters** (mixed units; a floor
  — plan §1 and Appendix A; the Gospels group undercounted). Runs after the
  chapter-level adjudication tranches calibrate real effort.
- [ ] **Anchorless-psalms follow-through** — the roster itself is COMPLETE
  (73 anchorless psalms identified, incl. Ps 2; 77 anchored — psalms sweep
  ledger close-out). What remains is the P1 batch work: Ps 51 → repentance,
  Ps 121 → gods-protection, Ps 2 → messianic-prophecy, and the headliners
  (69, 72, 84, 89, 107, 130, 132, 136) through fixtures-first PRs.
- [ ] **The two unpicked plan ideas**: **#1 successor governance plan** (who
  merges/signs after Jesse — the sweep-adjudication and votes-to-engine
  plans both explicitly depend on it and freeze merges until it exists) and
  **#2 path-to-v0.14.0 decision sheet** (partially subsumed by this
  package's refreshed `HANDOFF.md`, but never written as its own one-pager).
  See `reconstructed/2026-08-27-plan-ideas-survey.md`.
- [ ] **QR-6 / Isaiah 41:10 engine follow-up** — the QR-6 hymn-chip
  hardcode (`engine/src/intents/concept.ts:246,268`) and the Isa 41:10
  alias-label follow-up flagged by the Layer-2 track; plus the 2 Tim
  3:16-17 pericope pin question. Engine-code territory (ENGINE_VERSION
  discipline applies).
- [ ] **G3 gauntlet cosmetic defect** — the G3 summary names **17 pending
  fixtures but counts 16/16** (`lords-supper-verbatim` listed but
  uncounted). Flagged to Jesse 2026-08-27 with the final walkthrough;
  cosmetic, but a report that miscounts is a G-discipline sore spot.
- [ ] **The #64 xref catch-up follow-up PR** (packet rows 29–32 /
  `openbible-subset`/`passage-terms-subset` catch-up regenerations) — the
  ledger's G16 pointer records it as not yet opened; it returns to the
  reviewer under the disposition-table classes when it exists.
- [ ] **Remaining alias mining batches** — 11 ruling-gated seed rows from
  the battery re-grade's 16-row table (gated on ledger rulings J1/J2/J3/J5/
  J9/J10 among others); PD-only wording stands until row 36's
  modern-translation posture is ruled.
- [ ] **Consumer re-pins after v0.14.0** — Maskil, LH Worship Setlist, and
  Versed each deliberately re-pin both halves (engine semver + artifact
  descriptor); the jump is schema 5 → 9, engine 0.7.1 → 0.14.0
  (`docs/CONSUMERS.md`, `docs/implementation-plan.md` §5).
- [ ] **Pastoral-`*` id split** — display tags prefixed, engine ids not
  (+2 renames). Known behavior, not a defect; if alignment is ever wanted it
  is a reviewed engine-data PR (moves layerFingerprint). Recorded in
  `HANDOFF.md`.
- [ ] **Mega-sweep certification MS-12..14 + the J43/J63–J70 rulings —
  deferred, strictly LAST** per Jesse's standing order. Unblock order:
  J39/J52 (J52 done) → the v0.14.0 mint → J43 threshold ratification +
  J63–J70 → implement MS-12..14 and run a certified sweep. Until then the
  sweep machinery is advisory.
