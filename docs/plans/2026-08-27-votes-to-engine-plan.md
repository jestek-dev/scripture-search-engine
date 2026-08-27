# Votes-to-engine updates — implementation plan

**Date:** 2026-08-27 · **Status:** delivered for Jesse's review — commissioned in the plan-ideas thread · **For:** Jesse (jestek-dev) and his successor · **Repo state verified against:** `origin/main` @ `0d12c34` (engine 0.14.0, corpus `6450b7d7…`, layer `fd27c55c…`)

**How to read this plan.** "The short version" below is written for Jesse and is enough to understand the system and make the open calls; nothing in it requires reading further. The decision index maps the sixteen locked design decisions (V1–V16) to the section that owns each. Sections 01, 04, and 07 — and every string in quotation marks anywhere — are written in plain language for the reviewer; sections 02, 03, 05, 06, and 08 are the engineering specification, citation-dense by design; section 09 is governance. Quoted UI copy ships verbatim. A successor should read 01, then 08, then whichever section owns the work at hand; section 09 states what a successor may do before governance names them.

**Contents**

- [The short version (for Jesse)](#the-short-version-for-jesse)
- [Decision index — V1–V16](#decision-index--v1v16)
- 01\. Vision & the per-cycle loop
- 02\. Data model — what a vote becomes
- 03\. The deriver — votes to proposals
- 04\. Review UX — the Updates inbox
- 05\. Cadence, gauntlet & baseline choreography
- 06\. Failure modes & safeguards
- 07\. Migration — votes already collected
- 08\. Implementation phasing
- 09\. Governance & swappable assumptions
- Appendix A — shared terminology
- Appendix B — how this plan was produced

---

## The short version (for Jesse)

**What this is.** Today, every call you make in The Study — Essential, Helpful, Not relevant, Missing passage — is saved permanently, and then nothing happens: the only thing downstream is a printed to-do list meant for an engineer with a terminal. This plan builds the missing half. A deterministic piece of machinery (no AI anywhere in it) reads your calls and turns them into **cards**: short, plain-language suggestions in a new **Updates** screen in The Study. You read each card, and Approve, Decline, or set aside for later. When you press "Start the update," the machine bundles your approved cards into one update, runs every safety check the project already trusts, and writes you a one-page plain-language report of exactly which searches will change and how. You sign it, and the machine opens a proposed change on GitHub that only a person can merge. One click of Merge, and your calls are live in the next reviewed update. Nothing ever changes search results until that merge — exactly what the screen already promises you.

**What one cycle feels like from your chair.** Voting stays exactly as it is — whenever you want, no obligation. Then, on whatever rhythm suits you (weekly is a good default), one sitting: open Updates, read a short stack of cards — each one says what will change, because of which of your calls, quoting your own note — and click through them (about 10 minutes). Occasionally a card asks one question, always with the answers offered as choices. Press "Start the update" and walk away; the machine works alone for 30–90 minutes and is honest about that. Come back to the one-page report, read it, type the short confirmation code (about 4 minutes), then click Merge on GitHub (1 minute). **Total: about 15 minutes of your time per cycle** — that budget is a design rule, not a hope.

**The bar it is built to meet.** The old "it is well with my soul" → Jeremiah 4:10 disaster took two expert audit rounds and about seven days to kill by hand. In this system, one Not-relevant click from you becomes the top card in your next sitting, and one cycle later the block is merged and guarded against ever coming back — and when the real fix needs an engineer, the same cycle produces the written hand-off with your evidence attached instead of a silent wait.

**The phases** (each ends in something you can see and use):

- **Phase 0 — See the backlog.** A read-only Updates screen showing what your existing calls already imply. Ships in days.
- **Phase 1 — Derive and decide.** Real cards, and Approve / Decline / Not now that stick.
- **Phase 2 — Guard trains.** Updates that only write lines on the answer sheet run end-to-end to a proposed change on GitHub.
- **Phase 3 — Data trains.** Updates that actually change search data run the full checks, the report, and your signature.
- **Phase 4 — Steady state and retirement.** The re-check automation, the last polish, and retiring the old printed checklist.

**Your genuinely open calls** (each has a safe default that stands indefinitely if you never rule — nothing merges, weakens, or retires on its own; the full wording is in section 09.9):

1. **Answer-sheet-only updates skipping the "must move a result" rule.** These updates only write test lines — they can't move a result by design, so the rule would block them forever. *Default: yes* — the answer sheet is the measuring instrument, and the change lands as its own reviewed PR whose merge is the ratification.
2. **The "sign after merge" amendment.** A data update refreshes the frozen expected-results files the checks compare against, and an independent person signs off on that refresh *after* the merge (the standing rule you already set). The checks as written still demand the signature *before* — this amendment records the deferral honestly instead of blocking forever. *Default: yes.*
3. **The frozen queue after you step back.** Updates keep validating and wait as proposed changes; nothing merges until a successor plan names the merging human. *Default: yes* — same assumption the sweep plan already made.
4. **Who designates the independent signer after you step back.** *Default: nobody is invented* — answer-sheet updates keep flowing; data updates wait for a named signer, and the plan says so plainly rather than improvising one.
5. **A size cap per update.** *Default: ships off* — the proposed number (24 changes) is a guess, and a guessed threshold that never fires reads as protection.
6. **Retiring the old printed checklist** once the cards have proven they carry the same facts. *Default: yes*, tombstoned the same careful way the old voting endpoint was.

---

## Decision index — V1–V16

The sixteen locked design decisions, one line each, with the section that owns the full statement. LOCKED items were locked by Jesse or the orchestrator; the rest were decided by the design spine. Binding for the implementer; deviations need a plan revision.

| # | Decision (one line) | Owner |
|---|---|---|
| V1 | The deriver is a new pure module `workbench/src/deriveUpdates.ts`, sibling to `compileJudgments.ts`, both importing one shared selection core (`workbench/src/effectiveJudgments.ts`); it subsumes all three compile outputs as proposal operations | §03 |
| V2 (locked direction) | Input is the non-superseded v2 judgment leaves only; the 3 legacy v1 votes are byte-frozen and enter only through one re-confirmation card | §02 (selection) · §07 (legacy) |
| V3 | Mechanical consequences derive deterministically; interpretive consequences become questions on cards, never derived operations — the fixed mapping table, one row per (action, diagnosis) | §03 |
| V4 (locked) | Fixtures-first is structural: every layer-affecting operation travels, in the same manifest, with the `golden-fixture-upsert`(s) measuring *it* (per-operation scoping), enforced by the deriver's seal-time validator | §03 (validator) · §05 (invariant) |
| V5 | One append-only event log, `workbench/updates.jsonl`, records only human decisions and train membership; card states `drafted → approved \| declined \| parked`, train states `open → … → live` or `stopped(<reason>)`, everything downstream derived, never duplicated | §02 (cards, store) · §05 (trains) |
| V6 | Votes are intent, not observations: mechanical replay at seal time, per-dimension dispositions, the "materially equivalent" rule | §02 (policy) · §03 (derive-time pre-check) |
| V7 | Two train flavors — guard trains (fixture-only, identity-neutral) and data trains (layer-moving, full choreography) — classification derived from the manifest; single-flight always | §05 |
| V8 (locked direction) | One cycle = inbox → seal → unattended run → one Update Report → one signature → one draft PR → one human merge; merge-first-sign-once; until the first J39-class signing, guard trains proceed over provably inherited reds and data trains are hard-blocked at `runAdmission` | §05 |
| V9 | The inbox is a fifth "Updates" screen in The Study; the card grammar (headline · because-line · what-will-change · at most one question · Approve/Decline/Not now) is fixed | §04 |
| V10 | Conflicts are detected at derive time, presented as a choice, and resolved only by a superseding vote or an explicit card decision; hand-written fixtures are never overwritten | §03 |
| V11 | The provenance chain judgment → card → operation → proposal → admission → PR is traversable in both directions | §02 |
| V12 (locked) | Measurable effect is required for data trains, exempt for guard trains, and NO MEASURABLE EFFECT is always a stop with a plain-language explanation | §05 (exemption spec) · §06 (policy surface) |
| V13 (locked ceiling) | No automation merges to main — the terminus is a draft PR; within that ceiling, the steady state is zero-terminal through The Study | §09 (ceiling) · §01/§04 (steady state) |
| V14 (locked pattern) | Governance is three named assumptions — A1 (who merges), A2 (who approves cards / who signs baselines), A3 (who rules on theology) — each stated once and swappable | §09 |
| V15 | What stays manual, permanently and by design: the merge, baseline signings, concept minting, budgets, the NOT-allowlist, releases, doctrinal rulings, guardrail retirement | §09 |
| V16 | Coexistence with the sweep-adjudication pipeline: shared single-flight identity discipline and governance pattern, disjoint intake and batching | §09 |

---

## 01. Vision & the per-cycle loop

**This system turns the votes Jesse casts in The Study into reviewed engine updates — through a plain-language inbox he can clear in one sitting, with every safeguard the repo already trusts standing between his vote and the shipped search results.** It is the machinery behind a promise the UI already makes verbatim, on three surfaces (`workbench/static/index.html:429`):

> "Your calls are saved the moment you make them. They change search results only in the next reviewed update — never while you work."

Today the first half of that sentence is true and the second half is aspiration. This plan builds the "next reviewed update."

### 1.1 The gap this closes

**Votes currently flow into a pipe that ends at a printed to-do list.** Every call Jesse makes is durably saved as a v2 judgment in `workbench/judgments.jsonl`, stamped with the exact engine identity he was looking at (`workbench/src/judgments.ts:86-112`). But the only consumer of that log is the fixture compiler, whose own header states its limit: "it never commits, never touches `eval/budgets.json`, and writes no YAML — ontology work is printed as a manual checklist instead" (`workbench/src/compileJudgments.ts:11-13`). The checklist prints lines like `[ ] missing: "<query>" should surface <ref> — <why>` under the banner "carry out by hand with the concept-curation skill" (`compileJudgments.ts:822-850, 897-901`), and its report signs off with "review with `git diff`, run `npm run verify`, and commit/PR by hand" (`compileJudgments.ts:902-906`). That is terminal work, git work, and curation-skill work — none of which a non-engineer reviewer can do, and none of which anyone has ever actually done from a vote: the judgment log holds exactly 3 legacy lines from one query on 2026-08-06, and no compiled output was ever committed (`workbench/judgments.jsonl`; r7). Jesse described The Study as "a place to see the current results and strengthen them by having a human layer of voting and suggestions" (team memory: dashboard-plan-2026-08-22.md:9). The voting half exists and is excellent. The strengthening half is this plan.

**The replacement is a deterministic deriver plus a review inbox plus a train — all riding machinery that already exists.** A pure function (the **deriver**, `workbench/src/deriveUpdates.ts` — section 03, V1) reads the non-superseded votes and turns them into **cards**: self-contained, plain-language review units in a new **Updates** screen in The Study (section 04, V9). Approved cards batch into a **train** — one branch, one run of the checks, one plain-language **Update Report**, one signature, one draft PR, one human merge (section 05, V7/V8). The train's cargo is expressed entirely in the existing proposal vocabulary (`workbench/src/proposals.ts:12-24`) and travels the existing candidates → admission → publish pipeline; nothing new is invented between the card and the artifact. The printed checklist is retired once the cards fully replace it (Phase 4, section 08). No new judgment semantics, no new verdicts, no new ranking signals — the four calls Jesse already makes are the entire input.

### 1.2 The loop from Jesse's chair

**Voting stays exactly as it is: whenever he wants, with no obligation attached.** Jesse searches something he would actually type, makes his calls — Essential, Helpful, Not relevant, Missing passage — and walks away. Nothing about this plan adds a single step to voting. The calls accumulate.

Then, whenever he chooses — a suggested weekly rhythm, entirely on-demand — one **cycle**:

1. **Open the Updates screen** in The Study (a fifth nav item beside Review · Compare · History · Finish up). It shows a short stack of cards, newest reasons first.
2. **Read each card.** Every card is one proposed change in his own vocabulary: what will change ("Make Exodus 15:11 rank in the top 10 for 'Who is like the Lord?'"), because of which of his calls, quoting his own note or the verse's own words. No card ever requires looking anything up elsewhere to decide (section 04 owns the full card grammar).
3. **Decide: Approve, Decline, or Not now.** Most cards need only a click. At most one card in a while asks one question — always in plain words, always with answers offered as choices (for example, which theme should carry a passage he suggested). Declined cards record a one-line reason; "Not now" cards return next cycle.
4. **Press "Start the update."** That is the end of his active work for a while. The machine takes over, unattended, and tells him when it is done — honestly, that takes it 30–90 minutes, not seconds.
5. **Read the Update Report and sign.** One plain-language page: every search whose results will change, before and after, in words. If it looks right, he types the short code shown on screen — the same deliberate-friction signature Finish up already uses — and the system opens a draft pull request. **One click of Merge on GitHub** (the one and only step outside The Study) and the update is live in the next reviewed update. Next time he opens The Study, the existing "the engine was updated" notice greets him with one-click links back to his reviewed queries — his voted queries among them — so he sees his own vote land.

**The time budget is a hard design constraint, not a hope: ≤ 15 minutes of active human time per cycle** — about 10 minutes in the inbox, about 4 minutes on the Update Report and signature, about 1 minute to merge. Any card, screen, or report design that cannot be handled inside that budget is rejected in review the way a contrast failure is rejected: the budget is an acceptance criterion (sections 04, 05, 08 carry it as ACs), because Jesse's order was twofold — refine the engine "the best possible way **and easiest way for me**" (team memory: r6 §2, Jesse's message of 2026-08-27 03:49Z, quoted verbatim there). Machine time between his sittings is real and is never hidden from him: candidate build plus two full check runs plus an isolated rebuild take 30–90 minutes unattended, and the UI says so rather than promising "instant."

### 1.3 What happens behind the scenes (one honest paragraph)

When Jesse presses "Start the update," the approved cards are **sealed** into a train: a digest binds the exact votes, cards, operations, and the artifact identity the workbench is currently serving, so the train can never silently change under him (V8). The deriver has already re-checked every contributing query against that artifact, so a vote the engine has since satisfied auto-resolves as "already achieved — guarded" instead of wasting his time (V6, section 03). A fixture-only **guard train** applies its operations in an isolated worktree, runs `npm run verify`, and opens a draft PR. A layer-touching **data train** runs the full choreography: candidate build, before/after comparison, the gauntlet run with the exact admission arguments, sanctioned baseline regeneration in-branch (run twice, byte-identical, per the determinism covenant — every data train moves the layer fingerprint and therefore owes one post-merge re-approval by an independent person, the merge-first-sign-once rule, V8/A2), then the signed admission and the draft PR. Every step runs as a workbench job with live status through the existing jobs/SSE mechanism (`POST /api/v2/checks` + event stream, `workbench/src/server.ts:1244-1348`) — no terminal anywhere (V13). The Update Report satisfies the admission rule that every changed top-10 query must be individually reviewed (`workbench/src/admission.ts:819-832`): approving the report records that review per query. A train that proves nothing would change stops with `no-measurable-effect` and says so in plain words — **NO MEASURABLE EFFECT means don't merge**, never a soft pass (V12). The standing precondition every cycle inherits until it is cleared: the J39 baseline approvals are still unsigned — guard trains proceed over reds a control run proves they inherited, and **no data train can pass the checks until the first independent J39-class signing lands** (section 05 §5.5 states the full identity facts and mechanism once for the plan; failure modes in 06 FM-8; sequencing in 08). One train at a time, always — single-flight (V7).

### 1.4 The loop as a line

```
vote ──▶ card ──▶ approved ──▶ train (sealed) ──▶ checks ──▶ Update Report ──▶ sign ──▶ draft PR ──▶ merge ──▶ live
 [H1]             [H2a]                                                        [H2b]                  [H3]
```

Each arrow has a named mechanism, no magic: **vote → card** is the deriver (`workbench/src/deriveUpdates.ts`, pure function — section 03); **card → approved** is the Updates screen (`GET /api/v2/updates`, `POST /api/v2/updates/cards/:id/decide` — section 04); **approved → sealed** is `POST /api/v2/updates/train` (V8); **sealed → checks** is the candidate builder, comparison, and gauntlet running as workbench jobs (section 05); **checks → report → sign** is `GET /api/v2/updates/train/:id` and `POST /api/v2/updates/train/:id/sign`, reusing Finish-up's typed-digest pattern; **sign → draft PR** is the existing publish preparation on branch `refinement/<YYYY-MM-DD>-<trainId>`; **PR → merge** is a human on GitHub; **merge → live** is the next reviewed update, plus post-merge baseline signing by the independent reviewer (A2). The human touchpoints are exactly three: **casting votes** ([H1], whenever), **the inbox sitting plus the signature** ([H2a]+[H2b] — two marks, one touchpoint per cycle, split only by the unattended machine run), and **the merge** ([H3], one click). Everything between them is deterministic machinery — statistics and lookups, no model calls anywhere in the path (covenant #1; section 03 carries the byte-identical determinism AC).

### 1.5 The motivating bar: "it is well with my soul"

**The quality bar this system is built to meet, stated once and quoted again in section 06:** a harmful result like the old "it is well with my soul" → Jer 4:10 dies from **one vote → one cycle**: Not relevant vote → derived mustNotRank guard + (if editorial-owned) anchor fix → guard/data train → merged. The manual path took ~7 days and two grading cycles.

Here is what actually happened, and the replay. On 2026-08-20 an expert audit battery found the engine answering the beloved hymn line "it is well with my soul" with Jeremiah 4:10 — Jeremiah's accusation "you have greatly deceived this people," the precise sense-inversion of the hymn — at #1, graded harmful (team memory: search-quality-grade-2026-08-20.md:11). It survived a full round of fixes: the next grading cycle noted every prior inversion repaired "except 'it is well with my soul' → Jer 4:10 (still harmful in both)" (same file, line 11). It finally died via PR #36 about a week after first detection (same file, line 23), and the win was only pinned against regression on 2026-08-27 by PR #66 (team memory: implementation-plan-2026-08-20.md:19). Two audit cycles and roughly seven days of expert pipeline work — for a result Jesse would have flagged in three seconds, because for the person this engine serves, a mocking verse under a funeral hymn is the worst possible answer.

Replayed through this system: Jesse searches "it is well with my soul," sees Jeremiah 4:10 at #1, clicks **Not relevant** — the interview auto-infers what it can and keeps his reason in his own words (the shipped behavior). Next cycle, the top card in his Updates inbox is section 04's example card, quoted here as it ships in section 04: **Keep Jeremiah 4:10 out of the top results for "it is well with my soul"** … "This will add a line to the answer sheet: Jeremiah 4:10 must not rank for this search. The checks will hold every future update to it." Per-query, never a deletion of scripture (the standing UX law, team memory: jesse-workbench-ux-feedback.md:13) — and the card states an intent the checks will enforce, not a live demotion: the guard line is consumed only by the checks (G3, `eval/src/gates/corpusGolden.ts:65`), and only the post-run Update Report shows measured before→after, because by then it is a measurement, not a promise (04 owns this grammar). He clicks Approve, starts the update, signs the report, merges the draft PR. What that one cycle kills depends on what caused the bad result, and the loop says which, honestly:

- **Data cause — the result itself dies in one cycle.** When the offender ranks because of an editorially-owned theme row, the same vote also derives the anchor fix (V3's ownership rule): guard and fix merge together, and the next reviewed update no longer shows Jeremiah 4:10 for that search. One vote, one cycle, dead.
- **Engine cause — which is what the historical case actually was.** The real culprit was engine scoring code — `translation_variant` as sole evidence, fixed by engine PR #36 (0.10.0) (r6 §5) — territory votes must never touch (V15). The same one cycle then merges the guard as a pending answer-sheet line (it cannot pass while the offender still ranks; the existing pending-now-passing trigger promotes it at the next reviewed update after the fix lands — V4) and produces the "needs engineering" hand-off with his calls attached (V15). Jeremiah 4:10 keeps ranking until an engineer ships that fix — the card says so plainly rather than promising a kill it cannot deliver.

Either way the seven-day, two-grading-cycle manual path is beaten where it matters: within one cycle of one vote, the harm is on record, guarded against return, and — when the fix needs an engineer — already written up with the evidence attached, instead of waiting for the next expert audit battery to notice. The vote is never wasted; the loop is never dishonest about what it changed.

### 1.6 What "excellent" means, measurably

Jesse's order — "an excellent system to refine the engine the best possible way and easiest way for me" — is operationalized as five checkable properties, not adjectives:

1. **The cycle fits the budget.** ≤ 15 minutes active per cycle (inbox ~10, report + sign ~4, merge ~1), machine work 30–90 minutes unattended and visibly in progress. The inbox segment is checkable from `workbench/updates.jsonl` timestamps (first card decision → seal) and the merge from the PR timeline; the report-and-sign segment has no logged start — the store records decisions, not page-opens (V5) — so it is attested by a timed walkthrough unless sections 03/05 add a report-opened event.
2. **Zero terminal, steady state.** From vote to merged PR, the reviewer opens no terminal, runs no CLI, edits no file, and reads no raw digest anywhere except the short sign code — the same boundary Finish up already draws (V13). Checkable by walking one full train using only The Study plus one GitHub merge click. (Implementer phases before steady state may use terminals; that is implementer work, labeled as such in section 08.)
3. **Every card is self-contained.** A card can be decided with only what is printed on it; quoted UI copy contains no fingerprints, digests, or internal jargon — the same mechanical jargon check The Study's History screen already passes is an acceptance criterion for the Updates screen (section 04).
4. **Every vote is accounted for.** Each vote either becomes a card, is folded into one, or is visibly routed (needs a new theme → curation; needs engine code → engineering) — never silently dropped; and each merged change traces back to the exact vote and the exact result page the voter saw, both directions (V11, section 02).
5. **Every stop is honest.** A train that cannot proceed stops with a named reason from the closed list and plain-language recovery copy — including `no-measurable-effect`, which is a stop, never a merge (V12, section 06).

### 1.7 What this system will never do (non-goals, each resting on a covenant)

- **No live reordering.** Votes change chips and annotations, never positions — engine order is sacred in the UI (locked Study decision; the contract sentence above is quoted verbatim wherever effect timing is discussed, and no surface previews a would-be reordering). Rests on the shipped honesty contract (`index.html:429`) and the locked dashboard decisions.
- **No auto-merge, ever.** The pipeline's terminus is a **draft PR**; a human merge is the admission event. This ceiling already has a live guard test (r2 §8), and exceeding it would require a reviewed CLAUDE.md amendment that only the owner can make (V13). Rests on CLAUDE.md non-negotiable #1 and the PR #20 lesson (section 06).
- **No theology scores.** No derived structure grades doctrine; a vote can at most add a per-query guard line to the answer sheet that the checks enforce — it can never gate a source, delete a concept, or override a doctrinal-basis non-criterion. Cards attribute ("you marked this Not relevant") and never adjudicate. Interpretive and doctrinal questions route to a human (A3, section 09). Rests on CLAUDE.md non-negotiable #6.
- **No AI at runtime, no AI in the deriver.** The deriver is deterministic statistics and lookups — same votes in, byte-identical cards out (section 03's testable AC). Offline AI assistance (e.g. drafting a new concept via the curation skill) reaches the artifact only through the checks and a human PR merge, like everything else. Rests on CLAUDE.md non-negotiable #1.
- **No per-vote weight knobs, no new verdict vocabulary.** The four calls are the whole input; a hidden second ranking system is forbidden (team memory: jesse-workbench-ux-feedback.md:13).
- **Not this plan's territory:** bulk sweep-adjudication batching (owned by the sweep-adjudication plan; coexistence rules in V16/section 09), release minting and consumer re-pins (HANDOFF runbook), and multi-reviewer support (explicitly out of scope for The Study, unchanged here).

### 1.8 Success metrics a successor can check

| Metric | Target | How to check |
|---|---|---|
| Kill speed for a harmful result | One vote → its guard (and any editorial-owned fix) merged in the very next train the reviewer runs; an engine-caused offender additionally gets its needs-engineering write-up in the same cycle (1.5) | Trace any Not-relevant vote's judgmentId through card → train → PR (V11 provenance chain, section 02) |
| Active human time per cycle | ≤ 15 min (10 / 4 / 1 decomposition) | Inbox: `workbench/updates.jsonl` timestamps, first card decision → seal. Merge: the PR timeline. Report + sign: timed walkthrough — the V5 store logs no report-opened event (03/05 may add one if the full decomposition must be log-auditable) |
| Terminal steps in steady state | 0 | Walk one train end to end using only The Study + one GitHub merge click |
| Cards decidable in isolation | 100%; zero jargon-regex matches on the Updates screen | Section 04's Playwright AC (the D28-style regex check) |
| Votes accounted for | 100% — every non-superseded vote is on a card, folded into one, or visibly routed | Deriver output audit: same log in → byte-identical cards out (section 03 AC), no orphan judgments |
| Merges without a human | 0, structurally | The draft-PR ceiling guard test stays green (r2 §8); no automation credential can merge |
| Stops explained | Every stopped train shows a closed-enum reason + recovery copy | Section 06's stop-reason table; `stopped(<reason>)` visible on the train's screen |
| The shipped promise kept | Results change only at a merged train, and the update notice shows the voter their change landed | Compare result order before/after a merge; the existing update-notice card (`index.html:1361-1414`) offers one-click re-search links for his reviewed queries (`index.html:1372-1382`), which include every query his votes touched |

A successor who can verify this table has verified the system — no tacit knowledge required beyond this document and HANDOFF.md (section 09 carries the executability statement).

---

## 02. Data model — what a vote becomes

**Every call Jesse makes in The Study is a small, permanent piece of testimony: this passage belongs here, this one doesn't, this one is missing.** Nothing in this system ever averages that testimony, scores it, or quietly discards it. A vote is written down once, exactly as it was made, and everything the machine later does with it is a deterministic, traceable consequence — a line on the answer sheet, a passage added under a theme, a guard that keeps a bad result from coming back. This section is the ledger's rulebook: what a vote records, what each vote class is allowed to become, what happens when votes disagree or grow stale, and how any live change traces back — in both directions — to the vote that caused it.

Register note: this section is a mechanism section. The plain-language surfaces built on this data model live in section 04; the deriver that executes these rules lives in section 03; the train choreography lives in section 05.

---

### 02.1 The vote record: the v2 judgment and what each field is worth downstream

**The unit of input is one v2 judgment line in `workbench/judgments.jsonl`** — append-only JSONL, committed to git, "corrections are new lines; editing or deleting lines is off-limits" (`workbench/src/judgments.ts:1-14`). The schema (`judgments.ts:86-112`) already carries everything the derivation pipeline needs; **no schema change is required in any phase**. What each field contributes downstream:

| Field(s) | Stamped by | What it buys the pipeline |
|---|---|---|
| `judgmentId` (UUID) | server | The atom of provenance. Rides on every derived operation's `evidence` (02.8) and in every train's seal digest (V8). |
| `caseId` (UUID) | server | Links the vote to its review case in `workbench/cases.jsonl`. Becomes the manifest's `caseIds`; admission refuses a mismatch (`workbench/src/admission.ts:1443-1444`). |
| `action` ∈ `essential\|helpful\|irrelevant\|missing\|prefer` (`judgments.ts:25`) | client | Selects the mapping row (02.3). |
| `withinTop` ∈ {1,3,5,10} (`judgments.ts:28`) | client | The expectation window for `essential`/`missing` → the fixture's `expectedTop[].withinTop`. |
| `targetId` (`WEB:BBCCCVVV`) | client, validated in-result-set (`judgments.ts:499` via r1 §2) | Resolves to the canonical reference for expectation and guard entries. |
| `reference` + server-attached `excerpt` (missing only, cap 280 chars) | client + server | The suggested passage and its own words — the defend-it-from-the-text evidence (`judgments.ts:73-77, 519-524` per r1 §5). |
| `diagnosis` ∈ `wrong-anchor\|concept-misfire\|lexical-noise` + `conceptId` + `note` | client | Splits `irrelevant` into its three derivation sub-classes (02.3). `wrong-anchor`/`concept-misfire` require `conceptId` **and** `note` — "implies ontology work, so it needs a note defending it from the text" (`judgments.ts:554-561`); `lexical-noise` forbids `conceptId` (`judgments.ts:561-563`) and may be machine-inferred (`diagnosisInferred: true`). |
| `preferredTargetId` / `otherTargetId` | client | The `prefer` pair → `preferredOrder` entry. |
| `observedRank`, `observedWindow`, `resultSetDigest`, `reasonDigest`, `displayedWindowDigest` | server | The pinned observation: exactly what the voter saw, digest-bound. This is what makes staleness *decidable* (02.5) and the backward provenance trace *exact* (02.8). |
| `engineVersion`, `corpusFingerprint`, `layerFingerprint` | server, from the running engine (`judgments.ts:45-50, 196-198` per r1 §2.1) | The vote's identity stamp — the raw material of the per-dimension staleness policy (02.5). |
| `reviewer` | server (`WORKBENCH_REVIEWER`, default `"jesse"` — `workbench/src/server.ts:97` per r1 §2.4) | Per-line voter identity. Already multi-voter-shaped (02.4). |
| `supersedes` (UUID) | client | The correction chain (02.2). |
| `source` ∈ the seven `REVIEW_CASE_SOURCES` incl. `stale-judgment` (`judgments.ts:31-39`) | server | Distinguishes fresh review from re-confirmation; the staleness policy routes through the existing `stale-judgment` source rather than inventing a parallel one. |

Two facts about this record shape the whole design. First, **the observation fields are server-stamped and digest-pinned** — a client can never claim to have seen something it didn't (`judgments.ts:174-191` per r1 §2.4). Second, **the identity stamp is complete on every line** — all three fingerprints, not just the layer — which is what lets this plan fix the compile-time asymmetry described in 02.5.

One naming boundary, delimited once (F6): `workbench/judgments.jsonl` and `eval/battery/judgments.json` are disjoint stores sharing a word. The former is the vote log — the only judgment store this plan reads or writes. The latter is the rank-metrics battery's graded-query file, owned by the battery/rank-metrics work; vote-derived battery rows are out of this plan's scope, and if ever proposed they would follow that store's existing fail-closed vote-source provenance pattern (`voteSnapshotSha256` matching a sha-pinned `VOTE_SOURCE_MANIFESTS` entry, `eval/src/gates/judgmentProvenance.ts:19-27, 46-48`) — a future proposal to that plan, not a path in this one.

---

### 02.2 Which votes count: non-superseded v2 leaves only (V2)

**The deriver consumes exactly the non-superseded v2 judgment leaves — nothing else, ever.** This is V2, and it decomposes into three rules:

1. **Supersession selects leaves.** A correction is a new line carrying `supersedes: <judgmentId>`; the server validates that it names an existing v2 judgment on the same query, case, and target key, that the prior is not already superseded by an active correction, and that the new record's timestamp is strictly later (`judgments.ts:421-453`). The target key is per-class: `reference:` for missing, sorted `pair:` for prefer, `target:` otherwise (`judgments.ts:387-394`). Selection of leaves reuses the compiler's validated core — `activeV2Judgments` fully validates the supersession graph (duplicate ids, forward references, timestamp ordering, single active superseder) and keeps only non-superseded leaves (`workbench/src/compileJudgments.ts:196-233`). Per V1, that core is extracted into `workbench/src/effectiveJudgments.ts` so the compiler and the deriver select judgments identically — the one-tokenizer discipline applied to judgment selection. A superseded judgment derives nothing, warns about nothing, and appears in no card; it remains in the log purely as history.

2. **The v1 legacy lines never derive.** The 3 existing records — all v1 `missing`, one query, one voter, 100% stale-identity (r7 §1) — are byte-frozen under the sha256-pinned migration manifest that compile enforces fail-closed (`compileJudgments.ts:350-405` per r1 §8 step 2; `workbench/legacy/migration-manifest.json`, r7 §2). They surface as exactly one re-confirmation card (per-query granularity, matching the existing inbox dedupe key `${source}:${query}` — `workbench/src/inboxSources.ts:204-208`). Re-confirming through The Study creates fresh v2 judgments, which then derive normally. Rationale and the full walkthrough are section 07's; the data-model consequence stated here is absolute: **no code path in the deriver reads a v1 line as an operation source. The v1 log is input to one card's existence, and nothing else.**

3. **A vote cast mid-train joins the next train.** A sealed train is immutable (the seal digest binds its `judgmentIds` — V8); judgments appended after seal are simply leaves the *next* derivation run picks up. There is no partial membership and no mutation of a sealed train (failure semantics in section 06).

---

### 02.3 The mapping: what each judgment class becomes

**Every judgment class has exactly one derivation outcome, fixed by V3's table; this subsection states the field-level contract each row rests on.** The outcome columns — which operations and which card question each class yields — live **only** in section 03's table (V3 verbatim; E4, one writer per fact). The table below carries what 02 alone owns, keyed to V3's rows so the two views cannot drift — 02 has no outcome column *to* drift: per row, the v2 fields consumed, the compile-parity citation the deriver must reproduce (it subsumes `compileJudgments`' routing, V1), and whether the row is evidence-only. The derivation philosophy is V3's: **expectations first, data second, interpretation never** — every vote deterministically yields its fixture assertion; a data operation is derived only when the vote itself deterministically names the data row; anything interpretive becomes a question on the card, answered by the human, never by the machine.

| # | Judgment class | V3 row | v2 fields consumed | Field-level contract: compile parity + schema constraints | Evidence-only? |
|---|---|---|---|---|---|
| 1 | `essential` (withinTop 1/3/5/10) | 1 | `targetId`, `withinTop` | `expectedTop` entry parity: `compileJudgments.ts:495-500` | no |
| 2 | `missing` (reference + note/excerpt) | 2 | `reference`, `withinTop`, `note`/`excerpt` | canonicalized-reference `expectedTop` parity: `compileJudgments.ts:501-506`; out-of-subset parity subsumes compile's `ProposedSelectionEntry` path (`compileJudgments.ts:756-820` per r1 §8 step 8) — routing ruling in refinement (e); section shapes in (d) | no |
| 3 | `irrelevant` + `lexical-noise` (incl. `diagnosisInferred`) | 3 | `targetId`, `diagnosis`, `note?` | `mustNotRank` entry parity (`{ref, why: note ?? plain-words fallback}`): `compileJudgments.ts:507-515`; `lexical-noise` forbids `conceptId` by schema rule (`judgments.ts:561-563`), so no data row is ever nameable | no |
| 4 | `irrelevant` + `wrong-anchor` | 4 | `targetId`, `conceptId`, `note` (both required, `judgments.ts:554-561`) | same `mustNotRank` parity as row 3; anchor ownership rule `workbench/src/proposals.ts:515-524` (sole-source-`editorial` only) governs whether V3's anchor operation is even derivable | no |
| 5 | `irrelevant` + `concept-misfire` | 4 | same as row 4 | mechanically identical to row 4 (`ANCHOR_AFFECTING_CAUSES = ['wrong-anchor','concept-misfire']`, `judgments.ts:43`); the semantic difference (anchor names the wrong passage vs. the concept fired wrongly for this query) is preserved verbatim in the operation's `evidence` and card explanation, never in the operation type | no |
| 6 | `helpful` | 5 | — | "Helpful remains evidence for the history and review UI only" (`compileJudgments.ts:523-524`), carried forward unchanged (V3) | **yes — derives nothing.** Its ids reach a seal only through 02.6's mechanical union rule (they ride any sealed card on the same target); a target with no sealed card leaves the helpful line reachable in the log and review history only. |
| 7 | `prefer` (pairwise) | 6 | `preferredTargetId`, `otherTargetId`, `observedWindow` | `preferredOrder` entry parity (`{above, below, withinTop: observedWindow}`): `compileJudgments.ts:516-522`; `observedWindow` fixed at 10 today (`workbench/src/reviewCases.ts:25` per r1 §11) | no |
| 8 | v1 legacy (`fits`/`doesnt-fit`/`missing`) | — (V2, outside V3's table) | — | never operations directly (V2); byte-frozen (02.2 rule 2) | **yes** — evidence for exactly one re-confirmation card (02.2 rule 2, section 07) |

This table is exhaustive over the closed sets: five v2 actions (`judgments.ts:25`) × three diagnoses for `irrelevant` (`judgments.ts:23` per verified `CAUSES`), plus the closed v1 verdict set. There are no other judgment classes, and V13 keeps it that way: "no new judgment semantics" — the four verdicts and their meanings do not change.

Five contract refinements the deriver must honor, each closing an honesty gap:

**(a) The `mustNotLead` question — resolved: derive `mustNotRank` only.** The proposal vocabulary's allowed golden-fixture fields (`proposals.ts:205-208`, `GOLDEN_FIXTURE_FIELDS`) omit `mustNotLead`, which the gauntlet fixture schema itself supports (`eval/src/gates/corpusGolden.ts:119, 195`) — r3 open Q4. This plan resolves it by **not extending the proposal field set**, for three reasons. First, compile parity: `irrelevant` already compiles to `mustNotRank` (`compileJudgments.ts:507-515`), and the deriver subsumes compile's outputs (V1) — same vote, same assertion. Second, semantic honesty: a "Not relevant" vote asserts non-relevance, which `mustNotRank` expresses; `mustNotLead` expresses "acceptable but must not lead" ("mustNotLead measures leadership, not presence", `corpusGolden.ts:23`) — **no vote action carries that meaning**, and inventing one would be a new judgment semantic, which V13 rules out. Third, reversibility without schema surgery: if a banned passage should return, a superseding `essential`/`helpful` vote replaces the `irrelevant` leaf and the next derivation drops the `mustNotRank` entry from the derived fixture — the guard is removed by the same pipeline that added it, with full provenance. `mustNotLead` remains what it is today: a hand-curation instrument on hand-written fixtures (PR #54 precedent, r3 §6), which V10's ownership rule keeps derived cards away from anyway. This is a Claude-decidable default, not an owner decision — it changes no behavior Jesse sees and forecloses nothing (a future reviewed workbench change can extend `GOLDEN_FIXTURE_FIELDS` if a real need emerges).

**(b) Reason assertions ride with answered theme questions (A6).** Mechanical derivation with no open question emits bare `{ref, withinTop}` entries — exactly what compile emits today (`compileJudgments.ts:495-506`; the `reviewer` field is tracked in planning but stripped from emitted entries, `compileJudgments.ts:737` per r1 §8 step 7). But when a `missing` card's theme question is answered and an `editorial-anchor-add` is derived under the chosen concept, the paired `expectedTop` entry **gains** `requiredReasonFamily: "concept_anchor"` and `requiredReasonLabel: "Theme: <chosen concept's label>"`. Otherwise the fixture could pass by lexical accident while the anchor it travels with (V4: every data operation travels with its measuring fixture) goes unmeasured — and "the right passage for the wrong reason is still a failure" is exactly what G3 enforces (`corpusGolden.ts` reason-family/label checks and the concept-coverage rule requiring the exact `Theme:` label, r3 §2.2–2.3). This is a refinement of V3's bare-entry row, justified by A6/V4; section 03's deriver spec adopts it.

**(c) Refusals are routed, never dropped.** A `missing` reference that cannot canonicalize to a single-chapter range is a hard error in compile ("cannot be emitted as a canonical single-chapter range", `compileJudgments.ts:285-295` per r1 §11). In the deriver, every such refusal — uncanonicalizable reference, hand-written-fixture ownership collision (02.4), source-owned anchor (row 4/5) — becomes a routed card in the vocabulary of V15's manual list, never a silent drop and never a derivation crash. Section 03 owns the refusal routing table.

**(d) Section-shaped `missing` votes (pericopes) follow canonicalization, not a new class.** A reference that canonicalizes to a single-chapter range — `canonicalReferenceOf` accepts any same-book, same-chapter verse span (`compileJudgments.ts:285-295`) — derives normally: V3 row 2's expectation entry, and, on an answered theme question, an anchor-add under an **existing** concept, like any other missing vote. A cross-chapter range refuses per (c) and routes to concept-curation. Neither path mints a theme label or a new pericope concept: theme selection is interpretive judgment reserved to Jesse under J59 (r5 §J59), a dependency section 09's J-registry lines carry.

**(e) Out-of-subset references take the chapter-add, not the DG-16 note.** The rival route exists and is named: PR #54's DG-16 practice leaves an out-of-corpus reference as a re-check-at-re-pin note with **no** fixture assertion (r3 open Q6). A vote takes V3 row 2's `fixture-corpus-chapter-add` + expectation instead, because a vote is a standing expectation that must be runnable *now* — a deferred note would make "Missing passage" the one verdict whose fixture the pipeline declines to write — and the subset expansion is human-reviewed on the same card, so corpus growth is never silent. DG-16 remains the curation-side practice for mined anchors that carry no judgment line; the boundary between the two routes is exactly the presence of a vote.

---

### 02.4 Conflicts, and readiness for more than one voter

**Within one voter, the log already resolves conflicts: the latest non-superseded judgment per (query, case, target key) is the voter's standing word.** Supersession is the *only* way a voter's earlier call stops counting (02.2), and the server forces the correction's timestamp strictly after the prior's (`judgments.ts:449-452`), so "latest-non-superseded wins" is not a policy the deriver imposes — it is a structural property of the log.

**What supersession cannot resolve, the deriver detects and a human decides.** Two *effective leaves* can still contradict each other — different windows for the same ref, a ref both expected and forbidden, contradictory prefer pairs. These are the exact classes `compileJudgments` hard-errors on today (`compileJudgments.ts:573-669`). Under this plan they stop being compile crashes and become **conflict cards** (V10, mechanics owned by section 03): both sides shown with their votes quoted, the human picks, and the pick is recorded as a superseding judgment through the ordinary append-only mechanism — so the resolution itself is a vote with full provenance, and re-derivation from the corrected log is automatically conflict-free. Likewise the ownership guard: a query whose `eval/golden/<slug>.json` lacks `"generatedBy": "workbench"` is a hand-written fixture the pipeline must never overwrite (`compileJudgments.ts:689-708`); the card routes to curation instead (V10).

**Across voters, the policy is fixed now, even though only one voter exists:**

1. **Effective selection is per voter.** The deriver groups leaves by `reviewer` (already on every line, server-stamped — 02.1). One voter's supersession chain never silences another voter's judgment.
2. **Cross-voter disagreement on the same (query, target key) is a flagged conflict card — never a silent average, never a majority tally.** Both voters' words are shown; resolution is an explicit card decision recorded as a superseding judgment by the deciding reviewer, exactly as in the single-voter case. No arithmetic over votes exists anywhere in the data model — averaging verdicts would be a theology score by another name (covenant #6).
3. **No vote quotas.** A single vote is sufficient to derive; requiring N concurring votes would fake a consensus this project does not have and does not want — the review gates (card approval, Update Report, PR merge) are where confidence is added, by humans, per A2 (section 09).
4. **One tightening is noted for the day a second voter arrives:** supersession validation today matches query, case, and target key but not reviewer (`judgments.ts:439-441` — `matchingSupersessionTarget` takes no reviewer), so voter B could technically supersede voter A's judgment. Under single-reviewer operation this is unreachable (`WORKBENCH_REVIEWER` is one static string, `server.ts:97`). When multi-voter arrives, the rule becomes: a plain correction must share the prior's `reviewer`; a *cross-voter* supersession is valid only as the recorded resolution of a conflict card (rule 2). This is a one-line server validation change, listed as a Phase-4 readiness note in section 08 — **not** built now, because multi-user auth and voter identity are the successor-governance plan's territory (survey item #1; delimited per F6), and building auth ahead of that plan would prejudge it.

---

### 02.5 Identity staleness: the per-dimension policy

**Every vote is stamped `{engineVersion, corpusFingerprint, layerFingerprint}` from the running engine (02.1), and the plan's rule is V6's: votes are *intent*, not observations.** "Exodus 15:11 should surface for this query" survives a fingerprint move; "this displayed result is irrelevant" is bound to what was displayed (which the record pins by `resultSetDigest`/`observedRank`). Staleness is the *normal* path, not an edge case — the layerFingerprint moved 4 times in ~11.5 hours during active curation (r4 §6) — so the policy must be mechanical, not a warning a human is supposed to remember.

**The asymmetry this fixes:** today, compile warns only when `layerFingerprint` differs from the committed descriptor's — "the layers have changed since; re-confirm rather than trust it" (`compileJudgments.ts:426-438`, verified: the loop compares `record.layerFingerprint !== descriptor.layerFingerprint` and nothing else) — while an `engineVersion` or `corpusFingerprint` mismatch compiles **silently** (r1 open Q1). The inbox, meanwhile, flags on any of the three (`sameIdentity` requires all three fields equal, `inboxSources.ts:59-63`). And the comparison baseline is itself wrong: the committed descriptor is the stale v0.7.1 phantom (`artifacts/content-artifact.json` carries `stale.blocksRelease: true`, r7 §4), while current main `0d12c34` runs engine 0.14.0, corpus `6450b7d7…`, layer `fd27c55c…` (identity facts, Part 3). The plan supersedes both halves of the asymmetry with V6's full-triple mechanical replay:

**At seal time, the deriver re-runs every contributing query against the artifact the workbench is currently serving** — the **replay identity**, recorded in the seal; never the committed descriptor (r7 open Q2, resolved this way by V6). The replay is a pure engine query, no AI, no heuristics; its outcome sorts each card into one of three dispositions. Per dimension, what drift *means* and how the replay handles it:

| Dimension moved | What it means | How the replay treats it |
|---|---|---|
| `engineVersion` | Ordering code changed — the observed ranking may already be different, possibly already fixed | The auto-resolve check does the work: an expectation now achieved is detected before any operation is proposed. Recorded per-card as a per-dimension note. |
| `corpusFingerprint` | The scripture text itself changed | Every reference is re-resolved through `engine.passage()` (the same resolution submit uses, `server.ts:590-593` per r1 §5) before replay. A reference that no longer resolves ⇒ **evidence-only**: no operation derives; the card routes to re-confirmation with the resolution failure named. |
| `layerFingerprint` | Curated data changed — routine | The replay verdict governs; no special handling beyond the note. |

The three replay outcomes and their dispositions (V6 verbatim, restated here because this section owns the policy; section 05 owns the seal-time choreography that executes it; section 06 owns the recovery copy):

1. **Expectation already achieved** — a `missing`/`essential` target now ranks within its window: the data operation is **dropped**; the fixture guard is **kept** (pin the win); the card auto-resolves as "already achieved — guarded". This is *derive fresh*, minus the now-redundant data op.
2. **Materially equivalent** — the judged target still ranks/fails the same way, reasons unchanged in family: **derive fresh**, recording a machine-supported reconfirmation on the card. The human sees that the machine re-checked; nothing further is asked of them.
3. **Materially changed** — the displayed result or its reason changed in kind; an `irrelevant` target no longer ranks; a `prefer` pair no longer both rank: the card gains the derived **`stale`** flag and routes to a `stale-judgment` re-confirmation case — reusing the existing first-class source (`judgments.ts:31-39`), not a new mechanism. This is *derive-with-reconfirm-card*. One deliberate exception: the `mustNotRank` guard for an `irrelevant` vote **is still derived** even when the offender fell out of the ranking — a demotion guard is regression protection, and G3 reports its vacuity honestly if the ref later leaves the corpus (guard-vacuity reporting, `corpusGolden.ts:893-936` per r3 §2.2), so pinning it costs nothing and prevents the harm from returning.

Intent-vs-observation, per class: `missing` and `essential` are claims about the *text* (identity-robust; replay re-checks the window). `irrelevant` and `prefer` are bound to a *displayed* result set (`resultSetDigest`); drift is more likely to flip them into disposition 3, which is exactly why the replay compares against the pinned observation fields rather than trusting memory. `helpful` derives nothing, so staleness costs it nothing.

This policy also settles migration: since 100% of existing votes are stale-identity (r7 §4), the day-one behavior of the Updates screen is this policy applied to the legacy card — section 07 walks it.

---

### 02.6 The card, and the `updates.jsonl` event log

**A card is a derived, self-contained review unit — and "derived" is load-bearing: cards are never stored, only re-derived; the store records only what humans decided.** This is V5's store half (this section owns the record shapes; section 03 owns when the deriver emits cards; section 05 owns when train events are written; section 04 owns everything the card *looks* like — its plain-language grammar and copy).

**Card identity is a content address.** `cardId = sha256(canonical-JSON({kind, query, targetKey, judgmentIds: sorted}))` — the card's derivation key, nothing else. Re-deriving from the same log therefore reproduces the same `cardId`, so decisions recorded in `updates.jsonl` re-attach across server restarts and re-derivations without any stored card state. When a contributing judgment is superseded, the derivation key changes, the old `cardId` no longer derives, and any decision on it is moot by construction — the new card (new leaves, new id) starts `drafted`. This is also what makes the `stale` flag safe to compute rather than store: a card whose underlying judgments changed *is a different card*. Stated for E2 hygiene: content addressing realizes V5's superseded-judgment stale trigger as card **replacement** — that branch never fires as a flag because the old card ceases to exist — so the computed `stale` flag carries only V6's seal-time-replay meaning (02.5 disposition 3).

One sanctioned extension for exactly one card: the single legacy re-confirmation card (07 §07.2), whose v1 lines carry no `judgmentId`, fills the formula's `judgmentIds` slot with the migration manifest's sorted per-line `lineSha256` values, with `targetKey` the query key — the address shape itself is unchanged. Its `card-drafted` event likewise lists those 64-hex line hashes in its `judgmentIds` field instead of v2 UUIDs — a single-card exception to the event shapes below, sanctioned here so the address scheme keeps one writer.

**Card kinds** (closed set, one per derivation source): `expectation` (rows 1, 7 of 02.3), `guard` (row 3), `guard-and-anchor` (rows 4–5), `missing-passage` (row 2), `conflict` (02.4), `re-confirmation` (02.2 rule 2, 02.5 disposition 3), `needs-engineering` (V15 routing — diagnoses whose remedy is off the one-click allowlist). No other kinds; a new kind is a plan revision.

**Card states (closed set, V5): `drafted → approved | declined | parked`**, plus the derived `stale` flag (02.5). A declined card records a one-line reason; a parked card returns next cycle. State is computed by folding `updates.jsonl` events over the derived card set — there is no state field on any stored card, because there are no stored cards.

**The fold rule, exactly — latest decide wins pre-seal.** Events fold in log order. For a given `cardId`, the **latest** decide event (`card-approved` / `card-declined` / `card-parked`) written before the `train-sealed` event that binds the card is the effective decision; earlier decide events stay in the log as history, per the append-only covenant — a changed mind is a new line, never an edit or delete. The seal binds the effective decision: the `answers` that ride into an operation's `evidence` (02.8) are the latest `card-approved` event's `answers` at seal time. This is the V5 correction-as-new-line discipline applied to decisions, and it is what legalizes the Study's bare-keystroke Approve/Decline/Not now (section 04): every keystroke appends; nothing is destroyed and nothing needs undo machinery. After seal, the train is immutable (V8); a post-seal regret is expressed as a superseding vote, which yields a new card in the next derivation (02.2 rule 3).

**The store: `workbench/updates.jsonl`** — append-only JSONL, committed to git, same discipline as the judgment log ("corrections are new lines; editing or deleting lines is off-limits", the `judgments.ts:1-14` covenant applied verbatim). It records **only human decisions and train membership** (V5). Event record shapes, schema v1:

```jsonc
// Card events — the four card event types (V5), one line each:
{"schemaVersion":1,"eventId":"<uuid>","at":"<iso>","reviewer":"jesse",
 "kind":"card-drafted","cardId":"<sha256>","judgmentIds":["<uuid>", "..."]}
{"schemaVersion":1,"eventId":"<uuid>","at":"<iso>","reviewer":"jesse",
 "kind":"card-approved","cardId":"<sha256>","answers":{"<questionId>":"<chosen option>"}}
{"schemaVersion":1,"eventId":"<uuid>","at":"<iso>","reviewer":"jesse",
 "kind":"card-declined","cardId":"<sha256>","reason":"<one line, required>"}
{"schemaVersion":1,"eventId":"<uuid>","at":"<iso>","reviewer":"jesse",
 "kind":"card-parked","cardId":"<sha256>"}

// Train events — the three train event types (V5):
{"schemaVersion":1,"eventId":"<uuid>","at":"<iso>","reviewer":"jesse",
 "kind":"train-opened","trainId":"<id>","flavor":"guard"|"data"}
{"schemaVersion":1,"eventId":"<uuid>","at":"<iso>","reviewer":"jesse",
 "kind":"train-sealed","trainId":"<id>","sealDigest":"<sha256>",
 "cardIds":["..."],"judgmentIds":["..."],
 "replayIdentity":{"engineVersion":"...","corpusFingerprint":"...","layerFingerprint":"..."}}
{"schemaVersion":1,"eventId":"<uuid>","at":"<iso>","reviewer":"jesse",
 "kind":"train-stopped","trainId":"<id>","reason":"<one of the closed stop-reason enum, V5>",
 "reportDigest":"<sha256 — OPTIONAL>","refusedOperationIds":["<operationId>","… — OPTIONAL"]}
```

`card-drafted` is recorded (not just decisions) so that decline/park events always reference a card the log has seen, and so "new since your last visit" is answerable without derived state. `train-stopped` carries two OPTIONAL evidence pins, recorded at stop time by the train-event writer (05 §5.2): `reportDigest` — the sha256 of the verified report a report-bearing stop rests on (`verify-failed`, `no-measurable-effect`) — and `refusedOperationIds` — the operation ids an `outside-allowlist`/`engineering-required` stop refused; both are read by the deriver's prior-train join and stop conversion (03 §03.2, §03.8). `card-approved.answers` records the human's answer to the card's at-most-one question (V3/V9); the answer text is what becomes the derived operation's `evidence` alongside the judgment quotes (02.8). The `train-sealed` event is the seal: its digest binds `judgmentIds`, `cardIds`, operations, and the **replay identity** (V8) — the workbench-served identity of 02.5, not the committed descriptor.

**`train-sealed.judgmentIds` is defined by one mechanical union rule:** for every sealed card, its contributing `judgmentIds` (the content-address set) **plus every effective `helpful` leaf on the same (query, target key) at seal time**. `helpful` derives no card of its own (02.3 row 6), but wherever a sealed card exists on its target — including the surviving card after a helpful supersession resolves a conflict (02.4), and any re-confirmation card — the helpful leaf rides that card's seal set as context evidence, without perturbing any `cardId` (the content address stays over contributing ids only, so a late helpful vote never moots a decision). Stated honestly: a helpful leaf whose target carries no sealed card reaches no seal — correctly, because it caused no operation — and remains reachable in `workbench/judgments.jsonl` and the review history (02.8). Section 05's seal-digest spec states this identical union rule.

**Everything downstream of these events is derived from artifacts that already exist** — candidate directory ⇒ `built`; comparison publication ⇒ `measured`; admission manifest ⇒ `admitted`; publish journal phase ⇒ `pr-open`; merged commit on main ⇒ `live` (V5) — precisely to avoid re-building PR #20's overbuilt 17-state coordinator (the state machine that was designed and never implemented, r2 §8). The train state vocabulary and its choreography are section 05's; the store defined here never records a derived state.

Decisions enter the store through the Updates screen's endpoints — `POST /api/v2/updates/cards/:id/decide` (approve/decline/park + answers) and `POST /api/v2/updates/train` (seal) — named here for contract completeness (Part 3); their wiring, allowlists, and failure copy are section 04's.

---

### 02.7 The terminal shape: the existing `ProposalManifest`, with one reviewed amendment

**Approved cards seal into a train whose payload is a schema-v1 `ProposalManifest` — the existing shape and strict parser, feeding the existing candidates→admission→publish machinery — with exactly one reviewed amendment: per-operation fixture targeting.** No new operation type, no parallel pipeline, no schema-version bump. The manifest shape (`proposals.ts:156-163` per r2 §1.2): `{schemaVersion: 1, proposalId, fixtureId, caseIds, sourcePreconditions, operations}`. But schema v1 today also forces every `golden-fixture-upsert` to target the manifest's single top-level `fixtureId` ("must equal the proposal fixtureId.", `proposals.ts:813-817`) — one manifest, one query's fixture — and a normal train touches several queries. This section owns the manifest-shape ruling (03 states the deriver's requirement; 05/08 align): **amend, don't multiply.**

The amendment, precisely: delete the operations-`forEach` equality check (`proposals.ts:813-817`) so each `golden-fixture-upsert`'s `goldenFixtureId` names its own target fixture. Everything else already validates per operation: the owned-path rule derives each op's sole allowed path from its *own* id (`eval/golden/<goldenFixtureId>.json`, `operationPathIssues`, `proposals.ts:526-539`), the in-manifest collision check already keys on per-op ids ("this golden fixture is already written elsewhere in the proposal.", `proposals.ts:743`), and admission's fixture decision slots are already plural (`fixtureDecisionSubjects: {fixtureId, digest}[]`, `admission.ts:202`). The top-level `fixtureId` field stays (the strict `exactObject` key list is untouched, `proposals.ts:761`; `normalizeProposalManifest` passes it through, `proposals.ts:853-857`) and is set deterministically to the lexicographically first touched fixture id — a label, no longer a constraint. This is a workbench-side parser change: it touches no engine code and can alter no result ordering, so it needs **no ENGINE_VERSION bump** (covenant #2 binds engine ordering; this is validation of a review artifact). Under the amendment, V4's same-manifest invariant is scoped **per fixture**: every layer-affecting operation must be accompanied in the same manifest by the `golden-fixture-upsert`(s) measuring *it* — pairing per operation-and-fixture, not one manifest-global fixture (02.7 property 4 below reads accordingly). The honest fallback, stated so its cost is visible: without the amendment, a multi-query train means one manifest per touched fixture — N candidate builds and N admission runs per seal, `caseIds` and `sourcePreconditions` partitioned per fixture, and V8's one-report-one-signing-per-train shape broken — which is why multiplication is the fallback, not the ruling. Until the amendment merges (a small reviewed PR sequenced by section 08), trains are single-query; Phase 2's first guard trains are single-query anyway and are unaffected.

Why the existing operation vocabulary suffices, row by row against V3's mapping (section 03): the derivation emits only `golden-fixture-upsert`, `fixture-corpus-chapter-add`, `editorial-anchor-add`, `editorial-anchor-remove`, and `editorial-anchor-adjust` — five of the eleven existing operation types (`proposals.ts:11-24`, verified). The remaining six (`lexicon-phrase-*`, `related-concept-*`, `concept-draft-*`) stay available to the concept-curation route that `missing-passage` cards can hand off to (V3), but the deriver itself never emits them — no vote deterministically names a lexicon phrase or a concept edge. The one candidate gap in the vocabulary (`mustNotLead`) is resolved in 02.3(a) without extending anything.

Four properties of the existing machinery the data model leans on, none of which this plan re-implements (D2):

1. **Provenance is structurally human.** Every operation's `provenance` must be exactly `{source:'editorial', confirmed:true, reviewer, evidence}`; the parser rejects anything else — "automatic proposals may author editorial provenance only." (`proposals.ts:38-43, 314-324`, verified). Approving a card in the Updates inbox is the `confirmed: true` act (V9); a derived proposal is impossible to emit without it.
2. **`caseIds` are the votes' review cases.** The manifest's `caseIds` are exactly the review-case UUIDs the contributing judgments carry; `runAdmission` refuses admission unless the linked cases equal them exactly ("Linked cases must exactly match the reviewed proposal cases.", `admission.ts:1443-1444`, verified).
3. **`sourcePreconditions` hash-pin every touched file** — and per V1's coexistence rule, fixtures that Finish-up wrote are treated as hash-pinned `sourcePreconditions`, so the two writers never race; drift is caught as `source_drift` at admission preview (r2 §3.1), not discovered at merge.
4. **Fixture payloads are validated by the gauntlet's own validator at parse time** (`validateCorpusFixture` imported from `eval/src/gates/corpusGolden.js` at `proposals.ts:5` per r3 §2.1) — fixtures-first (V4) is a property of the manifest, not a process step: every layer-affecting operation in a train's manifest MUST be accompanied, in the same manifest, by the `golden-fixture-upsert` operation(s) that measure *it*, emitted from the same votes and paired per fixture under this section's targeting amendment, enforced as a manifest invariant.

---

### 02.8 The provenance chain (V11): traversable both directions

**The chain is: judgment → card → operation → manifest → admission → PR — and every link is a recorded identifier, so traversal is mechanical in both directions.** This is the mechanism that makes the shipped promise auditable: *"Your calls are saved the moment you make them. They change search results only in the next reviewed update — never while you work."* (`workbench/static/index.html:429`, quoted verbatim per Part 3).

| Link | Carried where | Enforced by |
|---|---|---|
| judgment → card | `cardId` is content-addressed over sorted `judgmentIds` (02.6); the `card-drafted` event lists them | deriver determinism (03's AC: same log ⇒ byte-identical cards) |
| card → decision | `card-approved`/`card-declined` events in `workbench/updates.jsonl` keyed by `cardId`, with `answers` and `reason` | append-only store (02.6) |
| card → operation | each derived operation's `provenance.evidence` names the contributing `judgmentIds` and quotes the vote's own words — the `note` or server-attached `excerpt` — plus the card's recorded answer when a question was asked; `provenance.reviewer` is the voter | `ReviewerConfirmedProvenance`, parser-enforced (`proposals.ts:314-324`) |
| operation → manifest | `operationId` unique per manifest; manifest `caseIds` = the judgments' review cases | strict parse (`proposals.ts:785-787, 809` per r2 §1.2) |
| manifest → train | the `train-sealed` event's `sealDigest` binds judgmentIds + cardIds + operations + replay identity (V8) | seal record (02.6) |
| manifest → admission | admission manifest binds proposalDigest, linked cases, signed decisions, and per-file rollback bytes | `runAdmission` (`admission.ts:1443-1444`; manifest contents r2 §3.3) |
| admission → PR | the PR body carries the existing identity/gauntlet tables (`workbench/src/publishPreparation.ts:1049-1093` per r2 §4) **plus** a new table mapping each operation to its judgments and quoted evidence (V11) | publish preparation |

**Backward traversal, concretely:** from a merged PR, the body's operation table names the `judgmentIds`; each id locates one line in `workbench/judgments.jsonl`; that line's `caseId` locates the case in `workbench/cases.jsonl`, and its `resultSetDigest`/`displayedWindowDigest`/`observedRank` pin the exact digest-bound result page the voter was looking at when they voted (02.1). Nothing in the chain is a prose description; every hop is an identifier equality.

**Restarts cost this trace nothing — the LRU question, answered.** The live review snapshot store is process-local and capped (`REVIEW_SNAPSHOT_LIMIT = 128`, `workbench/src/reviewCases.ts:26`), so after a server restart the snapshot object itself is gone and only the judgment line's digests remain. That suffices, because the digests are *identity* and determinism supplies the *content* (covenant #2): re-running the recorded `(engineVersion, corpusFingerprint, layerFingerprint, query)` against an artifact at that identity reproduces the identical result set, verifiable by recomputing `resultSetDigest` against the recorded value — and even when no artifact at that identity is at hand, the digest still decides identity-equality against any candidate reconstruction. The pinned page is reconstructable by replay, not stored; the staleness policy (02.5) reads only the server-stamped fields on the line, never the LRU. No additional snapshot persistence is required, and none is added.

**Forward traversal, concretely:** a card that reaches `live` shows its PR link in the Updates screen, and the queries it touched feed the existing build-change notice, so the voter sees their vote land (V11; surface owned by section 04). `helpful` votes and declined cards remain reachable through the same stores — evidence is never orphaned by not deriving.

---

### 02.9 What NOT to do (and the covenant each prohibition rests on)

- **Never average, weight, tally, or score votes.** No arithmetic over verdicts exists in this data model; disagreement is a card, resolution is a superseding vote (02.4). — Covenant #6 (no theology scores); the engine reports what a curated source names, it never adjudicates.
- **Never edit or delete a judgment or updates line.** Corrections are new lines; the v1 lines are byte-frozen and any transform of them is a bricking hazard (`compileJudgments.ts:350-405` fail-closed validation; r7 §6). — The append-only covenant (`judgments.ts:1-14`).
- **Never derive from a superseded judgment or a v1 line.** Leaves only; legacy enters via re-confirmation (02.2). — V2; "re-confirm rather than trust" (`compileJudgments.ts:433-436`).
- **Never store derived state.** `updates.jsonl` records human decisions and train membership only; card/train states downstream are computed from artifacts that already exist (02.6). — V5; the PR #20 lesson (r2 §8).
- **Never mint a new operation type, judgment action, or fixture field.** The existing vocabulary covers every row of 02.3; the one gap (`mustNotLead`) is deliberately not taken (02.3a). — V13 ("no new judgment semantics"); determinism covenant #2 (a new ordering-relevant field class would be an ENGINE_VERSION conversation this pipeline never has — its diagnoses become `needs-engineering` cards instead, V15).
- **Never let a vote reach data it doesn't own.** Source-owned anchors are demoted by fixture guard, not edited (`proposals.ts:515-524`); hand-written fixtures are routed to curation, not overwritten (`compileJudgments.ts:689-708`); and no vote can gate a source, delete a concept, or override a DOCTRINAL-BASIS §4 non-criterion — a "Not relevant" vote on a secondary-point framing derives a per-query fixture guard at most (A3, stated once in section 09). — Covenant #6 and the J66 boundary.
- **Never attach an operation to a card without its measuring fixture in the same manifest.** — V4; CLAUDE.md "write the golden fixture first", made structural in 02.7(4).

---

## 03. The deriver — votes to proposals

**This section specifies the machine that turns saved votes into reviewable cards and, once
cards are approved, into a proposal manifest the existing pipeline can carry to a draft PR.**
In plain terms: today, after Jesse votes, the compiler writes answer-sheet lines and then
*prints a to-do list* for a human to carry out by hand ("Manual ontology checklist (carry out
by hand with the concept-curation skill):", `workbench/src/compileJudgments.ts:899`; design
stance at `compileJudgments.ts:11-13` — "writes no YAML — ontology work is printed as a manual
checklist instead"). The deriver replaces that printed list with derived cards in the Updates
screen (section 04) and with operations in the pipeline's own vocabulary, so that a vote's
consequences are carried by machinery instead of memory. Nothing like it exists yet, and the
plan says so plainly: `workbench/src/proposals.ts`, `candidateBuilder.ts`, and `admission.ts`
contain **zero** occurrences of "judgment" (r1 §10) — the operation vocabulary is ready and
unfed. The deriver is the feeder.

The deriver is deterministic statistics and lookups from end to end — no model call, no
embedding, no learned ranking of anything, per covenant #1. Where a vote's consequence
requires interpretation, the deriver does not interpret: it asks (V3). Its determinism is a
testable property, stated in §03.3 and bound as an acceptance criterion in Phase 1
(section 08).

### 03.1 Placement: a sibling module sharing the selection core (V1)

**Decision (V1, restated): the deriver is a new pure module, `workbench/src/deriveUpdates.ts`,
not an extension of `compileJudgments.ts`; the judgment-selection core both need moves to a
shared module, `workbench/src/effectiveJudgments.ts`.**

Why not extend the compiler. `compileJudgments.ts` opens with a contract: "The compiler's job
ends at the working tree: it never commits, never touches `eval/budgets.json`, and writes no
YAML" (`compileJudgments.ts:11-13`). Its product is direct file writes into `eval/golden/`
plus a printed report, and its apply path is wired to the Finish-up flow. The deriver's
product is a different medium entirely: a validated schema-v1 `ProposalManifest`
(`proposals.ts:11-24`) plus review cards — a JSON value handed to the existing
candidates→admission→publish machinery (section 05), never a direct file write. Grafting
manifest emission onto a module whose header promises the opposite would break a stated
contract; two modules with one shared core keep both contracts honest.

**What is extracted into `effectiveJudgments.ts`** — the logic that must never fork
(one-tokenizer-style discipline applied to judgment selection):

- **Supersession resolution**: `activeV2Judgments` — duplicate-id detection, forward-reference
  and timestamp ordering checks, same-query/case/target-key enforcement, single-active-superseder
  rule, and the leaf filter (`compileJudgments.ts:196-233`), plus the mixed-history
  `effectiveJudgments` combinator (v1 legacy leaves + v2 leaves, `compileJudgments.ts:236-240`).
- **Case cross-validation**: every v2 judgment's `caseId` must exist in
  `workbench/cases.jsonl` with a matching query, and the byte-pinned legacy migration manifest
  must validate (`validateCasesBeforeCompilation`, `compileJudgments.ts:350-405`).
- **Canonical reference handling**: `referenceOfTargetId` / `canonicalReferenceOf` through the
  pipeline's own parser, which guarantees "every reference this compiler writes parses under
  G3 exactly as it parsed here" (`compileJudgments.ts:15-20`); the multi-chapter-reference
  hard error rides along (`compileJudgments.ts:285-295`).

**What each caller keeps.** `compileJudgments.ts` keeps fixture-file emission, web-subset
writes, and the printed checklist — unchanged — until Phase 4 retires the checklist and
tombstones the compiler's direct path the way the v1 judgment endpoint was tombstoned
(`server.ts:1704-1714`). `deriveUpdates.ts` owns card construction, the mapping table
(§03.4), conflict detection presentation (§03.7), and manifest emission. **Coexistence rule
(Phases 0–2):** Finish-up continues to write fixtures via the compiler; the deriver treats
any fixture the compiler has already written as a hash-pinned `sourcePrecondition` in its
manifests (`proposals.ts:788-803` requires every touched path pinned anyway), so the two
writers never race — if Finish-up rewrites a fixture after a derivation, the pinned sha no
longer matches and the derivation is re-planned, never blindly applied. If a Finish-up write
lands *after* a seal instead, the pinned sha fails at admission as the `source-drift` stop
(`admission.ts:856`); recovery is a re-seal — section 06's stop table carries the row.
Section 05's choreography enforces the same pins mechanically: the candidate build verifies
every `sourcePreconditions` sha byte-for-byte before applying anything
(`candidateBuilder.ts:292-313`); 05 §5.1 states this coexistence rule identically as its
third sealing rule, and 06's stray-double-writer row mirrors it.

**Subsumption.** The deriver subsumes all three of the compiler's outputs as proposal
operations: fixture writes become `golden-fixture-upsert` ops, web-subset chapter additions
become `fixture-corpus-chapter-add` ops (the compiler already computes these as its own
`ProposedSelectionEntry` shape, `compileJudgments.ts:800-806` — the deriver emits the
pipeline's operation instead), and every printed checklist line becomes a derived card. The
compiler's G8 reminder ("a G8 `npm run gauntlet -- --update-baseline` refresh will be
needed" when the subset changes, `compileJudgments.ts:886-891`) becomes a
train-choreography fact section 05 owns, not a printed warning.

### 03.2 Inputs and outputs

**The deriver is a pure function over an observed-input snapshot; the server assembles the
snapshot, the deriver never reaches around it.** This mirrors the compiler exactly: compile
sha-pins its five observed inputs into the plan digest and aborts if any changed between
planning and apply (`compileJudgments.ts:327-342`, re-observation at `:909-912, 956-973`).
The deriver's observed-input set is a superset:

| Input | Role | Pin |
|---|---|---|
| `workbench/judgments.jsonl` | the votes (v2 leaves only, per V2) | sha256 |
| `workbench/cases.jsonl` | case cross-validation; `caseIds` for the manifest | sha256 |
| `workbench/legacy/migration-manifest.json` | byte-frozen v1 validation (V2; section 07) | sha256 |
| `workbench/updates.jsonl` | prior card decisions and train events (V5; jointly owned with section 02) | sha256 |
| the artifact descriptor **the workbench is serving** | the replay identity (V6) — not the committed descriptor, which is stale (Part 3 identity facts) | identity triple recorded |
| `ontology/concepts/*.yaml` snapshot | ownership checks, anchor existence, deterministic theme chips | per-file sha256 (same snapshot discipline as `candidateBuilder.ts:369-416`) |
| `eval/golden/*.json` (touched slugs only) | ownership rule (§03.7), already-present-assertion detection (§03.6) | per-file sha256 |
| `pipeline/fixtures/web-subset.json` | chapter-membership computation | sha256 |
| a prior train's outcome artifacts, when its events reference one — the sealed manifest and the verified report, located and pinned by the join rule below this table | the `needs-engineering` stop conversion (§03.8): the recorded finding is the converted card's evidence. Also 06 FM-5's parked-by-default computation (§03.6): the stopped attempt's sealed operations are the unchanged-operations half of the comparison (its replay identity is read from the `train-sealed` event itself, 02.6) | per-file sha256 |

**Locating a prior train's outcome artifacts — a concrete join, not a state lookup.** The
`trainId` on a train event resolves both artifacts by the pipeline's own path formulas
(05 §5.2), never by scanning. The **sealed manifest** is the manifest half of the train's
evidence entry in `workbench/review-data/admission-evidence.json`, keyed by
`proposalId = <trainId>` (05 §5.2's registry; the seal step persists the manifest half of that
entry when it emits it — the timing 05 §5.2 step 1 states, with the admission-preview
assembly completing the entry later — so the artifact exists for every
post-seal stop), and is verified by recomputing
the seal digest over the located manifest's operations plus the seal event's `judgmentIds`,
`cardIds`, and `replayIdentity` — V8 binds exactly those four, so a tampered or mislocated
manifest fails the recompute. The **verified report** is `eval/.runs/<trainId>.json` — the
path 05 §5.2 step 4's fixed admission argv writes, inside the confined-path discipline
admission itself enforces (`admission.ts:555-560`) — checked byte-for-byte against the
`reportDigest` the `train-stopped` event records (02.6's optional stop-event field, which
05 §5.2 records at stop time),
or, for a train that reached `admitted`/`live`, against the report bindings in its committed
admission manifest (`workbench/admissions/<admissionKey>.json` records both verified
gauntlets, r2 §3.3; located by matching its `proposalDigest` to the sealed manifest's own
`proposalManifestDigest`). A pin that fails to verify derives no conversion and no
parked-by-default: the derivation reports the artifact unverifiable — fail-closed, never a
guess. (Both halves of this join are stated by their owners: 02.6 defines the two optional
`train-stopped` fields — `reportDigest` and `refusedOperationIds` — and 05 §5.2 records
them at stop time and persists the sealed manifest at seal time.)

All input digests fold into a **derivation digest** — the analogue of the compile plan digest
— stamped on every derive response and pinning exactly one mutation: the **seal**, whose
intended semantics are re-derive-and-compare (§03.5 step 3). Decide requests are pinned **per
card** instead: by `cardId` (the content address section 02.6 owns) plus **`cardRevision`** —
a sha256 over the card's canonical derived content (operations, question and chips, the
pre-check verdict (§03.5), evidence bundle; never its decision state), the pin 06's
decide-409 names (06 FM-11; the 409's other arm — a `cardId` that no longer derives — is
FM-13's). This paragraph and §03.5 step 2 are the decide pin's one writer; 04 §4.4 owns
the rendering around the request, never the pin. The distinction is load-bearing: every decide appends a line to
`workbench/updates.jsonl`, itself an observed input, so pinning decides to the global digest
would make each approval invalidate every other pending one. Pinned per card, it cannot: a
decide event changes no other card's `cardId` (content-addressed over its own judgmentIds)
and no card's `cardRevision` (decision state is excluded by construction) — an inbox of N
cards is one derive and N decides, with no re-derive between keystrokes (§03.5 step 2).

**Outputs.**

1. **Cards** — one per derived consequence, in the shape section 04 renders (headline,
   because-line, what-will-change, at most one question; V9 owns the grammar). Each card
   carries its `cardId` (the derivation key, §03.6), its `cardRevision` (the content pin,
   §03.2), its contributing `judgmentId`s, and its full evidence bundle.
2. **One `ProposalManifest` per sealed train** — schema v1, in the existing vocabulary
   (`proposals.ts:11-24`): the eleven operation types already cover everything a vote can
   mechanically imply; **the deriver introduces no new operation type.** The manifest is
   normalized and digested by the pipeline's own `normalizeProposalManifest` /
   `proposalManifestDigest` (`proposals.ts:853-873`), so the identity threaded through
   candidate, gauntlet, admission, and PR is the pipeline's identity, not a parallel one.
3. **The fixtures compile already emits**, now as operations: every train's manifest carries
   the `golden-fixture-upsert` ops derived from the same votes as its data ops — V4's
   fixtures-first invariant is thereby automatic, and the deriver's seal-time validator
   refuses to seal any manifest containing a layer-affecting operation without a
   same-manifest `golden-fixture-upsert` measuring it — a structural check, not a process
   step. The enforcement locus is fixed here, once, for every section: **the deriver's
   seal-time validator** (§03.5 step 3), deliberately not `parseProposalManifest`, which
   is shared with hand-authored manifests; 05 §5.3 names this same locus verbatim — "the
   deriver's seal-time validator … (03's placement, §03.5 step 3)" (05 §5.3). Binding
   AC, stated here and carried by 08's Phase-2 AC block (quoted-phrase anchor: "The V4
   invariant AC §03 §03.2 delegates here"): a seal attempt on such a manifest is refused with the
   unmeasured operation named. New fixtures emit `status: 'pending'`; promotion rides the
   existing pending-now-passing trigger (`eval/src/gates/corpusGolden.ts:1215-1300`) and the
   admission's `fixture-promotion` decision slots (V4).

**The evidence bundle.** Every derived operation's `provenance` is exactly what the parser
demands — `{source: 'editorial', confirmed: true, reviewer, evidence}`; anything else is
rejected with "automatic proposals may author editorial provenance only."
(`proposals.ts:38-43, 314-324`). The deriver fills it deterministically:

- `reviewer` — the voter (`judgment.reviewer`; single-reviewer today per A2, section 09).
- `confirmed: true` — set only by the card-approval act (V9): the deriver structurally cannot
  emit a manifest containing an operation whose card was not approved, because manifest
  emission happens at seal and seal only admits approved cards.
- `evidence` — a fixed deterministic template quoting the record: the contributing
  `judgmentId`s, the query, the action, the voter's note or the server-attached passage
  excerpt (`judgments.ts:73-77` — for `missing`, the excerpt satisfies the
  defend-it-from-the-text rule when no note was typed), the observed rank and window
  (`observedRank` / `observedWindow`), and the pinned display digests (`resultSetDigest`,
  `reasonDigest`, `displayedWindowDigest`, `judgments.ts:86-112`) so a future reader can
  reconstruct exactly what the voter saw. This is the manifest — a technical, PR-reviewed
  surface — so full identifiers belong here; the card shows the plain-language half
  (section 04), and the full chain both directions is section 02's V11 table.
- `reason` — the plain-language sentence from the card's what-will-change line (min 12
  chars, enforced at `proposals.ts:422` — `textValue(record.reason, …, 12)`; the field is
  declared at `proposals.ts:50-56`).
- Manifest `caseIds` — exactly the review-case UUIDs the contributing votes came from;
  `runAdmission` refuses admission unless `linkedCaseIds` equals them ("Linked cases must
  exactly match the reviewed proposal cases.", `admission.ts:1443-1444`).

**Two honest gaps in the terminal shape, named — both ruled in section 02.** First, the
proposal fixture field set omits `mustNotLead` (allowed keys at `proposals.ts:205-208`);
02.3(a) rules it — derive `mustNotRank` only, no field-set extension — and the mapping table
below inherits that ruling without change to its rows. Second, schema v1 requires every
`golden-fixture-upsert` in a manifest to target the manifest's single `fixtureId` ("must
equal the proposal fixtureId.", `proposals.ts:813-817`) — so a train batching votes across
several queries cannot ship in one manifest today. The deriver requires multi-fixture
manifests; 02.7 owns the ruling and specifies the amendment ("amend, don't multiply":
per-operation fixture targeting, leaning on the per-op validation that already exists,
`proposals.ts:526-539`), along with the honest fallback — one manifest per touched fixture,
which breaks V8's one-report-one-signing-per-train shape and is therefore the fallback, not
the ruling. Until the amendment merges, trains are single-query; Phase 2's first guard
trains are single-query anyway and unaffected.

### 03.3 Determinism: same inputs, byte-identical outputs (covenant #1, A1)

**The deriver is a pure function of §03.2's observed-input snapshot — (judgment log, cases
log, byte-frozen migration manifest, updates log, ontology and fixture snapshot, web-subset,
replay identity, and any prior-train outcome artifacts the updates log references). Same
inputs produce byte-identical cards and an identical manifest digest — on every platform,
every run.** Concretely:

- **No clock.** The deriver stamps nothing from wall time. Every timestamp in a card or
  evidence string is copied from an input record (`judgment.at`, or the seal event's recorded
  time in `updates.jsonl` — a logged human decision, not a derivation-time reading).
- **No randomness.** `proposalId` is derived from the train id recorded in `updates.jsonl`
  at open (kebab-case per `ID_PATTERN`, `proposals.ts:202`); `operationId`s are derived keys
  — `<type>-<query-slug>-<target-key digest prefix>` — unique per manifest as the parser
  requires (`proposals.ts:785-787`) and stable across re-runs. Card ordering, chip ordering,
  and operation ordering are all defined sorts (operations additionally re-sorted by the
  pipeline's own normalizer, `proposals.ts:853-862`).
- **Deterministic chips.** The one place a card offers candidate options — "Which theme
  should carry this passage?" — the options are computed by lookups, not models: the union of
  (a) concepts whose compiled lexicon shares at least one significant token with the query
  under the engine's own tokenizer (the same `significantWords` identity the proposal
  validator uses for phrase collision, `proposals.ts:541-543` — one tokenizer, covenant #4),
  and (b) concepts already anchoring the voted reference or its containing chapter in the
  ontology snapshot. Ordered by match count, then concept id — a defined tie-break. The last
  chip is always the routed exit: "None of these — needs a new theme" (the chip's rendered
  sentence-casing is 04 §4.3's, the copy writer; §03.8).
- **AC (binding, restated in section 08):** a unit test runs the deriver twice on the same
  fixture inputs and asserts byte-identical card JSON and equal `proposalManifestDigest`; a
  second test permutes input-file read order and asserts the same.

This is what makes the honest-timing contract auditable rather than aspirational: the same
votes always propose the same update, so what Jesse approved is what the train carries.

### 03.4 The mapping table: what each vote derives (V3)

**Philosophy: expectations first, data second, interpretation never.** Every vote
deterministically yields its fixture assertion (the expectation — the answer-sheet line). A
data operation is derived only when the vote itself deterministically names the data row
(concept and target already present in the judgment). Anything requiring judgment — which
theme carries a new passage, whether a new theme should exist, any weight choice — is a
plain-language question on the card with deterministic candidate options, decided by the
human, recorded as the operation's `evidence`. This satisfies J66's boundary (anything
interpretive, pastoral, or doctrinal comes to the human) and covenant #1.

The table (fixed; one row per action and diagnosis — this is the plan's single authoritative
copy, per the one-writer rule):

| Judgment | Derived operations (mechanical) | Card question (interpretive, human answers) |
|---|---|---|
| `essential` (withinTop n) | `golden-fixture-upsert`: expectedTop entry {ref, withinTop} | none |
| `missing` (ref, note/excerpt) | `golden-fixture-upsert`: expectedTop entry; `fixture-corpus-chapter-add` when the chapter is outside the subset | "Which theme should carry this passage?" → `editorial-anchor-add` under the chosen concept, or route to concept-curation when no theme fits |
| `irrelevant` + `lexical-noise` | `golden-fixture-upsert`: mustNotRank entry {ref, why} | none |
| `irrelevant` + `wrong-anchor` / `concept-misfire` (conceptId + note present) | mustNotRank entry; `editorial-anchor-remove`/`editorial-anchor-adjust` ONLY when the named anchor's sole source is `editorial` (ownership rule, proposals.ts:515-524) | when the anchor is source-owned: fixture guard does the demotion; card explains why the anchor row itself stays |
| `helpful` | nothing (evidence for history/review only — compileJudgments.ts:523-524; carried forward unchanged) | none |
| `prefer` | `golden-fixture-upsert`: preferredOrder entry | none |

Each row derives a card of one of 02.6's closed kinds, tokens verbatim: rows 1 and 6 →
`expectation`, row 2 → `missing-passage`, row 3 → `guard`, row 4 → `guard-and-anchor`;
row 5 derives no card. (Under §03.5's pre-check split, an identity-moved row-4 vote derives
kind `guard` — the anchor arm having routed — beside a `re-confirmation` card. The
remaining kinds — `conflict`, `re-confirmation`, `needs-engineering` — arise from §03.7,
from §03.5's pre-check / 02.5 disposition 3 / section 07's legacy card, and from §03.8's
stop conversion respectively — never from a fresh vote through this table.)

Per-row rationale and mechanism:

- **`essential`** is pure expectation: the passage already ranks; the vote pins it. The
  entry mirrors compile's routing exactly (`compileJudgments.ts:495-500`); `withinTop` comes
  from the vote (`WITHIN_TOP_VALUES = [1,3,5,10]`, `judgments.ts:28`). No data op — nothing
  in the layers is named by the vote.
- **`missing`** is expectation plus, usually, data. The expectation is mechanical
  (`compileJudgments.ts:501-506`, reference canonicalized through the shared core). Whether
  the passage's chapter is inside `pipeline/fixtures/web-subset.json` is a lookup — outside
  means a `fixture-corpus-chapter-add` op (chapter-granular, conservative, exactly the
  compiler's current computation, `compileJudgments.ts:756-820`). But *which theme should
  carry the passage* is interpretation: today that judgment call is a printed checklist line
  (`compileJudgments.ts:826-832`); under the deriver it is the card's one question, with
  deterministic chips (§03.3). The chosen answer becomes an `editorial-anchor-add` under the
  chosen concept, `weight: 1.0` — the existing editorial convention, stated on the card;
  there is no per-vote weight knob (forbidden; jesse-workbench-ux-feedback law). When the
  human answers "None of these — needs a new theme" (the chip, 04's casing), the card
  routes to concept-curation
  (§03.8) — the anchor op is *not* derived.
- **`irrelevant` + `lexical-noise`** is pure expectation: the result matched words, not
  meaning. The `mustNotRank.why` is the voter's note, or the exact plain-words fallback
  compile uses today — "matched words, not meaning; judged not a fit for this query"
  (`compileJudgments.ts:507-515`). No data op and no card question: lexical noise names no
  concept row, so there is nothing to edit — the answer sheet is the fix. This is precisely
  the routing compile encodes today: `lexical-noise` never reaches the checklist; only
  `ANCHOR_AFFECTING_CAUSES = ['wrong-anchor', 'concept-misfire']` do (`judgments.ts:43`;
  checklist branch `compileJudgments.ts:833-841`). The deriver preserves that line exactly.
- **`irrelevant` + `wrong-anchor` / `concept-misfire`** is expectation plus, conditionally,
  data. The server already guarantees these diagnoses arrive with `conceptId` + `note`
  (`judgments.ts:546-568`), so the data row *is* named by the vote — mechanical derivation is
  legitimate. The ownership rule gates it: `editorial-anchor-remove` is valid only when the
  anchor's sole current source is `editorial` ("an anchor can be removed editorially only
  when its sole current source is editorial.", `proposals.ts:515-524`). When the anchor is
  source-owned (openbible, torrey, …), the deriver derives the `mustNotRank` guard only —
  the demotion the voter asked for — and the card explains in plain words that the source's
  own row stays because it belongs to that source, not to us. No vote gates a source,
  deletes a concept, or overrides a DOCTRINAL-BASIS §4 non-criterion (A5; A3 in section 09):
  the derived structure records that *the reviewer judged this result not a fit for this
  query* — it attributes, never adjudicates.
- **`helpful`** derives nothing, exactly as compile treats it ("Helpful remains evidence for
  the history and review UI only.", `compileJudgments.ts:523-524`). It surfaces in card
  because-lines and the Update Report as supporting context, never as an operation.
- **`prefer`** is pure expectation: a preferredOrder entry with the observed window
  (`compileJudgments.ts:516-522`).

**Reason assertions (A6).** When a card's answered question binds a passage to a theme — the
`editorial-anchor-add` case — the paired fixture expectation is upgraded to assert the
reason, not just the presence: `requiredReasonFamily: "concept_anchor"` and the exact label
`"Theme: <concept label>"`, which is also what makes the fixture count as concept coverage
under G3 (`eval/src/gates/corpusGolden.ts:792-801`). A bare `essential` or `missing` vote
with no theme answer emits a presence-only expectation — asserting a reason the human never
judged would fabricate intent. Either way, the plan's standing rule applies: **a result that
ranks correctly for the wrong reason is a G3 failure the train's gauntlet catches** ("The
right passage for the wrong reason is still a failure", G3 semantics, r3 §2.2) — explanations
are part of the contract, and the deriver's fixtures are written so the gauntlet can enforce
it.

**Demotion guards stay honest.** An `irrelevant`-derived guard is kept even when the
seal-time replay finds the offender no longer ranks — the guard is still derived per 02.5
disposition 3, which owns that policy, including G3's honest vacuity reporting if the ref
ever leaves the corpus. The derive-time pre-check honors the same rule for pre-existing
drift (§03.5): an identity move routes only the observation-bound remainder to
re-confirmation; it never suppresses the guard.

### 03.5 Two-phase, digest-pinned: derive, decide, seal

**The deriver reuses the compiler's plan/apply discipline — preview carries a digest; every
mutation names the pin it reviewed (per-card for decides, the derivation digest for the
seal, §03.2); a changed pin means 409, never a silent re-plan.** Compile's pattern: `POST /api/v2/compile/preview` returns `{plan}` with a digest
over the observed inputs; `POST /api/v2/compile/apply {digest}` re-plans and refuses on
inequality — 409 `stale_preview`, "The repository changed. Create and review a fresh
preview." (`server.ts:1365-1440`). The deriver's phases, on the Part-3 endpoint names
(wiring — allowlists, read-only degradation, failure copy — is section 04's budgeted work
item, V9):

1. **Derive (read-only, repeatable):** `GET /api/v2/updates` derives cards fresh from the
   current observed inputs and returns them with the derivation digest. Deriving mutates
   nothing — no updates.jsonl write, no file write. Refresh-safe, restart-safe.
2. **Decide (human, logged):** `POST /api/v2/updates/cards/:id/decide` records
   approve/decline/park plus the question's answer, carrying `{decision, answers?,
   cardRevision}` against the `cardId` in the path — this step is the request shape's
   single authoritative statement, which 04 §4.4 renders (reload copy, replaced-card
   render) but never redefines; the pin is **per card** (§03.2), never the global
   derivation digest. 409 fires
   exactly when *this card* changed: its id no longer derives (a contributing judgment was
   superseded — new leaves are a new content address, 02.6; this arm is 06 FM-13's) or it
   derives with a different
   `cardRevision` (an input snapshot moved under its content; 06 FM-11's arm); the client
   re-derives and the
   card re-renders — with the reload copy 04 §4.4 owns, or as a `re-confirmation` card
   where the pre-check below says so. Decide and park events on *other* cards never invalidate a
   pending decide (§03.2) — approving down an inbox is N appends against one derive. A
   decision is one appended line in `workbench/updates.jsonl` — same append-only discipline
   as the judgment log (`judgments.ts:1-14`) — and decide events on the same `cardId` fold
   **latest-event-wins** until the seal freezes them (02.6's fold rule, which is also what
   legalizes 04 §4.4's pre-seal reversibility).
3. **Seal (the apply-analogue):** `POST /api/v2/updates/train` carries the derivation digest
   the update panel rendered from, re-derives from scratch, and refuses on inequality —
   verifying every approved card re-derives identically (else 409 with the differing cards
   listed). It then runs the V6 staleness replay against the replay identity (dispositions
   per 02.5; replay automation lands in Phase 4, D16 — Phases 2–3 seals substitute D1's
   full-triple compile warning, the derive-time pre-check below, and human review, per
   section 08), validates the V4 fixtures-travel-with-data invariant, emits the manifest,
   and appends the seal event — digest over judgmentIds, cardIds, operations, and the replay
   identity (V8). From the seal onward, section 05 owns the choreography; a vote cast after
   seal joins the next train, never a sealed one.

**Derive-time staleness: what the pre-check computes, what it derives, and the
ordering rule against the seal replay.** The derive phase performs exactly one staleness
computation, and it is a pure comparison over inputs already in §03.2's table — no engine
query: each contributing judgment's recorded identity triple against the replay identity,
the same all-three-fields rule the inbox applies today (`sameIdentity`,
`inboxSources.ts:59-63`; the inbox already seeds `stale-judgment` cases from exactly this
comparison, `inboxSources.ts:165-183`). Per V6, intent classes (`missing`, `essential`)
survive an identity move: their cards render normally, because whether the expectation is
already achieved is a ranking question only the replay can answer (02.5 disposition 1, at
seal). For observation-bound classes the pre-check **splits by what the vote derives**. An
`irrelevant` vote's `mustNotRank` guard **still derives** — 02.5 disposition 3 owns that
rule and its rationale (a demotion guard is regression protection whether or not the
offender still ranks), and a pure fixture assertion needs no replay to be derived safely —
so the guard renders on an ordinary approvable card of kind `guard`, carrying the
per-dimension identity note. What routes to re-confirmation is only the observation-bound
remainder: row 4's anchor arm (an editorial anchor edit should rest on a current
observation) and a `prefer` vote's ordering entry (bound to a displayed pair; 02.5's guard
exception names `irrelevant` alone) derive as 04's "Look again" card — kind
`re-confirmation`, 02.6's token: the question and Approve are suppressed and no operation
derives *on that card* — via the existing `stale-judgment` re-confirmation case; a fresh
vote is a new leaf set, hence new `cardId`s. An identity-moved
`wrong-anchor`/`concept-misfire` vote therefore derives **two cards** over one leaf set —
the guard card and the re-confirmation card, distinct kinds hence distinct `cardId`s (kind
is a `cardId` input, 02.6 — the same address-space separation §03.8's arm (a) uses); an
identity-moved `lexical-noise` or source-owned row-4 vote, whose whole derivable product is
the guard, derives the guard card alone. One vote thus stays one cycle for the guard even
on the drifted path — only the anchor edit and the prefer pair wait on a fresh look.
Deliberately, **the pre-check sets no `stale` flag**: that token is V5's derived
flag, and it carries only the seal-time replay's disposition-3 meaning (02.5; restated at
02.6 and 06 FM-13) — the pre-check's whole product is the card *kind*, itself a distinct
content address (kind is a `cardId` input, 02.6), so V5's closed trigger vocabulary is not
extended. The ordering rule: **the pre-check fires first, and its verdict is frozen into
the card's `cardRevision`** — a card cannot flip kind mid-review; a world change that
would alter the verdict surfaces only as the decide 409 or at the seal re-derive. The
seal-time replay (02.5's three dispositions) is then the authoritative sort over the
sealed set — it alone sets `stale` (disposition 3), it alone auto-resolves
(disposition 1), and it keeps the demotion guard of an approved `irrelevant` card that
went materially changed *mid-review* — the same guard rule the pre-check applies to
pre-existing drift. The pre-check is deliberately its conservative, Phase-1-cheap subset —
identity comparison, never replay: it may route an observation half to re-confirmation
that the replay would have sorted into disposition 2 (materially equivalent), which costs
one extra human look on that half and nothing else — never a forfeited guard, which
derives either way — and it is the staleness coverage Phases 2–3 run on before D16
automates the replay. (The split rule is mirrored where it renders and phases: 04 §4.3
example 3 states the per-arm two-card shape; 06's `stale-artifact-identity` row and FM-2
scope the never-boards rule to the re-confirmation card; 08's D1/D8 parentheticals say
the same — the split-off guard card boards normally.)

### 03.6 Idempotence and the lifecycle that retires the checklist

**Re-deriving never duplicates anything, because cards have stable derivation keys and
"done" is observed in the world, not remembered in a marker file.** The compiler's honest
limitation is the design problem this section solves: "there is no applied-state tracking,
so re-running is always safe" (`compileJudgments.ts:8-9`) — safe for fixtures, but the
printed checklist consequently re-prints already-completed items forever, and the only
"done" signal is a human remembering (r1 open question 2). The deriver replaces that with
three mechanisms:

1. **Stable derivation keys.** A card's key is its `cardId`, exactly as 02.6 defines it —
   `cardId = sha256(canonical-JSON({kind, query, targetKey, judgmentIds: sorted}))`, raw
   query, with `targetKey` the same `v2TargetKey` identity the supersession machinery uses
   (`judgments.ts:387-394`); 02.6 owns the formula, this section only executes it. Same
   votes → same key → the same card, every run. A superseding vote changes the leaf set,
   hence the key: the old card's decision does not silently carry to materially different
   content — the new card arrives `drafted`, and the old key's decision remains in the log
   as history.
2. **State-aware derivation.** Before emitting an operation, the deriver checks the observed
   snapshot: an anchor already present in the ontology, an assertion already present in the
   owned fixture, a chapter already in the subset — each derives **no op**. If everything a
   card would do is already true in the world, the card renders as already achieved (and,
   where the seal-time replay confirms the ranking outcome, auto-resolves per 02.5
   disposition 1). This is what makes re-running idempotent against merged history with no
   consumed-markers to maintain — mirroring how the candidate builder re-parses every
   proposal against the real snapshot rather than trusting claims
   (`candidateBuilder.ts:391-394`).
3. **Derived downstream states, never duplicated state (V5).** `workbench/updates.jsonl`
   records only human decisions and train membership — card
   `drafted → approved | declined | parked` events and train
   `opened/sealed/stopped` events; V5's derived `stale` flag is computed at the seal
   replay (02.5 disposition 3), never stored. Pre-seal, decide events on the same `cardId` fold
   **latest-event-wins** — the effective decision is the latest decide line written before
   the sealing event, per 02.6's fold rule — so the deriver's seal-only-admits-approved
   check reads one well-defined decision per card, never a pair of conflicting lines.
   Everything downstream is derived from artifacts that already exist, so every state is
   observable by pointing at a file:

   | Train state | Observed from |
   |---|---|
   | `open` / `sealed` / `stopped(<reason>)` | `workbench/updates.jsonl` train events |
   | `built` | candidate directory `workbench/.state/candidates/<cacheKey>/` (`candidateBuilder.ts:547-549`) |
   | `measured` | the comparison publication in the candidate directory (r2 §6) |
   | `ready` | verified candidate gauntlet report under `eval/.runs/` (`admission.ts:555-560`) + Update Report assembled |
   | `admitted` | admission manifest `workbench/admissions/<admissionKey>.json` (`admission.ts:45, 1447-1450`) |
   | `pr-open` | publish journal phase `draft-pr-opened` (`publishPreparation.ts:37-43`) |
   | `live` | the train's commit merged on `main` |

   No 17-state coordinator object exists to drift from reality — the PR #20 defect this
   design explicitly avoids (V5). A judgment is "consumed" exactly when it appears in a
   sealed train's seal event; the deriver reads that from the log and shows the card in its
   train's state instead of re-drafting it. If a train stops, its seal releases: the cards
   return to the inbox re-derived against the now-current world, carrying their logged
   effective decisions (02.6's fold — the release writes no decide event), with the stop
   reason's recovery copy (section 06) — with two exceptions. **First**, a card the stop's
   recorded finding names re-derives under §03.8's conversion topology: the hand-off card
   is new kind, new `cardId`, arriving `drafted`; whether an ordinary card still derives
   beside it is §03.8's per-arm rule. **Second**, a `no-measurable-effect` stop follows
   06 FM-5's parked-by-default anti-loop rule, which that section owns; the mechanism,
   stated once here because this section owns the lifecycle: the derivation computes
   FM-5's default from observed inputs already in §03.2's table — the stop event in
   `updates.jsonl`, the stopped attempt's replay identity from its own `train-sealed`
   event (02.6), and its sealed operations from the located manifest (§03.2's join
   rule) — and a card whose operations are unchanged and
   whose replay identity equals the stopped attempt's renders **parked-by-default**: a
   *derived* state, never a machine-written decide event (V5's store records only human
   decisions; the log still folds to `approved`), boarding no seal until a decide event
   postdating the stop (FM-5's explicit human re-approve) or an identity move restores
   it. FM-5's all-parked seal refusal and recovery copy ride on this derived default
   unchanged.

**Lifecycle summary, end to end** (the checklist replacement, in the plan's fixed
vocabulary): vote → card `drafted` → human `approved | declined | parked` → sealed into a
train → train `built → measured → ready → admitted → pr-open → live` (or
`stopped(<reason>)`) — each transition either a logged human act or an observable artifact,
never a reprinted line.

### 03.7 Conflicts and ownership (V10)

**Contradictory votes are presented, never resolved mechanically — and never silently
dropped.** The conflict classes are exactly the ones compile hard-errors on today:
conflicting reason families, conflicting rank windows, conflicting mustNotRank explanations,
overlapping expected+forbidden ranges, contradictory prefer pairs
(`compileJudgments.ts:573-669`). Where the compiler throws and halts the whole run, the
deriver produces a **conflict card**: both sides shown with their evidence bundles (each
vote's date, note, and what was displayed), the human picks, and the pick is recorded as a
**superseding judgment** through the existing append-only supersede mechanism
(`judgments.ts:421-453` validates it; nothing is edited or deleted). The next derivation
then sees one leaf and derives normally. Declining to pick parks the conflict card; the
affected query contributes nothing to any train until it is resolved — conflicts block the
query, not the train.

**Ownership rules, both kinds, enforced before anything is proposed:**

- **Hand-written fixtures.** A derivation targeting `eval/golden/<slug>.json` without the
  `"generatedBy": "workbench"` marker never overwrites it — the compiler's refusal stands
  verbatim ("it is a hand-written fixture and not workbench property",
  `compileJudgments.ts:689-708`). The card says, in plain words, that this query has a
  hand-curated answer sheet, and routes to curation instead of deriving.
- **Source-owned anchors.** Covered in §03.4's fourth row: removal/adjustment derives only
  for editorially-owned rows (`proposals.ts:515-524`); otherwise the fixture guard demotes
  and the card explains. The proposal validator re-checks ownership against the real
  ontology snapshot at parse time (`proposals.ts:619-670`), so even a deriver bug cannot
  smuggle a source-owned edit past the pipeline.

**Cross-train conflicts cannot occur** — single-flight (V7) permits one non-terminal train
at a time, and every seal re-derives from the current log (§03.5), so there is never a
second in-flight manifest to collide with.

### 03.8 What the deriver refuses to derive — and how a refusal becomes a card

**A refusal is always a routed card with the evidence attached, never a dropped vote and
never a printed line.** The full stays-manual list is V15's, owned by section 09; the
deriver's touchpoints:

- **Concept minting.** "None of these — needs a new theme" is a routed **answer on the
  `missing-passage` card**, not a card kind of its own (02.6's kind set is closed): the
  approved card ships the answer-sheet line alone, and its record carries the routed
  hand-off — the query, the votes, the passage excerpts, and a pre-filled draft skeleton
  (id/label suggestion from the query's significant tokens, the voted passages as candidate
  anchors) — everything the human needs, queued with evidence instead of printed. The human
  finishes it with the concept-curation skill; the deriver never emits
  `concept-draft-create` mechanically, because a concept's label, lexicon, and boundaries
  are interpretive work (J66 boundary; A3). The finished pack rides a train like any other
  reviewed data, or its own curation PR — either way through the checks and a human merge.
- **Weights and budgets.** No derived operation ever adjusts a weight beyond the stated 1.0
  default on a new editorial anchor, and nothing touches `eval/budgets.json` — threshold
  changes are reviewed PRs by covenant.
- **Engineering consequences — the stop-conversion rule.** The trigger is mechanical, and
  it is not a fresh-vote classification: **the derive-time `needs-engineering` set from
  fresh votes is empty by construction.** Every operation the mapping table can emit
  targets an allowlisted path by its own type (`operationPathIssues` derives each op's
  sole legal path from its type and its named target fields — `goldenFixtureId`,
  `draft.id`, `reviewedConcept.id`, or `conceptId` — `proposals.ts:526-539`, all inside
  `publishPreparation.ts:28-35` — ranking/tokenizer code, schema, manifests, workflows are
  simply not writable by this pipeline), and the v2 diagnosis enum (`CAUSES =
  ['wrong-anchor', 'concept-misfire', 'lexical-noise']`, `judgments.ts:22`) carries no "needs a code change"
  diagnosis a vote could assert — nor may the deriver invent one, which would be
  interpretation (§03.3, A1). A **`needs-engineering` card** (kind token per 02.6) arises
  in exactly one way: **as a conversion from a prior train's recorded finding.** When a
  sealed train's outcome names a card — (a) a stop with reason `engineering-required` or
  `outside-allowlist` (unreachable for deriver-built manifests by the construction above;
  kept as defense-in-depth for the shared enum), whose refused operations the derivation
  reads from the stop event's `refusedOperationIds` (the optional field 02.6 defines and
  05 §5.2 records at stop time) and cross-checks — never trusts blind — by recomputing the
  same checks that refused them over the located sealed manifest (`operationPathIssues`
  plus the publish allowlist, `proposals.ts:526-539`, `publishPreparation.ts:28-35`), or
  (b) a pinned verified report (a `verify-failed` or `no-measurable-effect` stop's,
  pinned by the stop event's `reportDigest`, or a `live` train's, pinned in its committed
  admission manifest — §03.2's join rule) showing the card's own fixture
  assertion still failing while the card's mapping row derives no further data operation
  (row 3's guards by construction; row 4's source-owned arm) — the **next derivation**
  reads the train events (`updates.jsonl`) plus the train's outcome artifacts (located
  and verified per §03.2's join rule) and re-derives that card as kind `needs-engineering`: new kind ⇒ new
  `cardId` (02.6), state `drafted`, with the recorded finding — reason, named gate or
  refused operation, report digest — as its evidence bundle. Both arms are file reads over
  pinned artifacts, never judgments, so the conversion is inside §03.3's pure function.
  **Topology, fixed per arm (mirrored by §03.6's release rule).** The converted card
  carries the hand-off alone: approving it records the engineering hand-off 04 renders
  and 06's recovery copy promises, and stages no operation — the conversion never carries
  a derivable operation and never strips one. Whether an ordinary card coexists follows
  §03.6 item 2's state-aware check over the same leaves, resolved per arm. Under **arm
  (a)** the stop merged nothing, so the leaves' remaining derivable operations — the
  fixture guard — still derive: the ordinary card derives alongside the converted card,
  **two cards**, distinct kinds hence distinct `cardId`s over the same leaf set (kind is
  a `cardId` input, 02.6, so the address space separates them by construction), and
  approving the ordinary card stages the guard for the next train exactly as any guard
  card. Under **arm (b)** it depends on whether the assertion already stands in the owned
  fixture: after a `live` train, or a prune that shipped it `status: 'pending'`
  (05 §5.4), it does — the state-aware check derives no guard op, **no ordinary card
  exists**, and the converted card's what-will-change says so in 04's grammar ("the
  answer-sheet line is already in place; this adds nothing to it"); after a whole-train
  `verify-failed` or `no-measurable-effect` stop that merged nothing, the assertion is
  absent, the guard still derives, and arm (a)'s two-card shape applies (after a
  `no-measurable-effect` stop that ordinary card also carries §03.6's FM-5
  parked-by-default, being operations-unchanged at the same identity; the hand-off card,
  carrying no operations, arrives `drafted` and cannot re-arm the loop).
  The conversion lapses by the same state-aware rule as everything else (§03.6 item 2):
  when a later snapshot or report shows the finding resolved — the engineering fix merged,
  the expectation achieved — the ordinary card (or the auto-resolve receipt) derives
  again. Token convention, fixed once: `engineering-required` and its sibling stops name
  *train events* in V5's closed enum — the discovery; `needs-engineering` names the *card
  kind* the next derivation converts the discovery into — the routed follow-up; the two
  map one-to-one through the conversion. This is also what keeps 01's "votes accounted
  for: 100%" metric true: no refusal class ends in a dropped vote — a fresh vote always
  derives a card (§03.4), and an engineering discovery converts a card one derivation
  later, evidence attached. The pipeline never proposes an ordering-affecting code change, so no train
  ever owes an ENGINE_VERSION bump — the candidate builder refuses any candidate whose
  `schemaVersion`, `engineVersion`, or `tokenizerVersion` differs from its base
  (`candidateBuilder.ts:460-464`). Which *fingerprints* a train moves is 05 §5.2's
  classification, referenced not restated: an ontology-only data train moves
  `layerFingerprint` alone, while a train carrying `fixture-corpus-chapter-add` — this
  section's own mapping row 2 — moves `corpusFingerprint` as well (PR #64 evidence, r4 §5)
  and pays the full baseline choreography, including 05 §5.5 gap 4's reviewed amendment to
  the candidate builder's corpus-identity refusal (`candidateBuilder.ts:465-468`).
- **Doctrinal questions.** Anything doctrinal routes per A3 (section 09) to the
  theology-rulings ledger; the deriver's output attributes votes and proposes data rows —
  it contains no structure that grades doctrine (A5).

(The conversion's mirrors are in place at their owners: 04's needs-engineering example is
grounded in arm (b) and states the per-arm rule with the empty-by-construction trigger;
06's `outside-allowlist` / `engineering-required` / `verify-failed` rows cite this
section's stop-conversion by name; 08 D4's determinism fixtures include a prior-train
outcome set exercising it.)

### 03.9 Where AI may help, and where it is banned

**Banned: anywhere in the deriver, and anywhere between a judgment and the artifact.** No
model call, no embedding, no LLM-drafted card copy, no learned ordering of cards or chips —
card text is template-generated from the records, chips are lookups (§03.3). This is
covenant #1 as code, and the repo already has the enforcement pattern: the `curation/`
embedding assist is excluded from the artifact build graph by an executable boundary test
(`pipeline/test/curationBoundary.test.ts` — import-graph, child_process, and scripts scan,
fail-closed), and its own README fixes the stance: "Similarity scores are review aids; they
are never copied into anchor weights" (`curation/README.md:12-13`). Phase 1 extends that
boundary test's scan — import graph, `child_process`, and package scripts, fail-closed —
to cover `deriveUpdates.ts` and `effectiveJudgments.ts`; this scan extension is the
mechanism behind section 08 D4's no-model/no-network AC, which binds to it by name
(quoted-phrase anchor: "the exact mechanism §03 §03.9 specifies").

**Allowed: offline suggestion text only, clearly labeled, never required, never load-bearing.**
Concretely: when a human takes up a routed needs-a-new-theme hand-off (§03.8), they may use the existing
`curation/` assist or the concept-curation skill's AI support to draft a label, lexicon
candidates, or anchor suggestions — offline, at a human's initiative, outside the deriver.
Whatever that produces becomes ordinary reviewed YAML that still faces the full gauntlet and
a human PR merge before anything reaches the artifact — the same road every AI-assisted
concept pack has always traveled. Nothing AI-touched enters `updates.jsonl`, a card, a
manifest, or an evidence string; the deriver would reproduce byte-identical output on a
machine with no model access at all, and the determinism AC (§03.3) proves it on every run.

---

**What NOT to do (this section's covenant lines):** do not add an operation type, a
model-assisted step, or a per-vote weight knob to the deriver (covenants #1 and #2; V3); do
not let the deriver write files — its product is cards and a manifest, and the only writers
remain the existing journaled apply paths (covenant-adjacent to #3's one-seam discipline);
do not resolve a conflict, pick a theme, or grade doctrine mechanically (J66, A5); do not
add applied-state marker files — observed state and the append-only log are the only memory
(V5).

---

## 04. Review UX — the Updates inbox

This section owns V9 (inbox placement and the card grammar) and the entire surface Jesse
touches between casting a vote and merging a PR. It references V5 for state names, V6 for
the re-confirmation variant, V10 for the conflict card's surface (detection logic is section 03's),
and V13 for the zero-terminal steady state. The deriver that produces these cards is
section 03; the machinery that runs after "Start the update" is section 05; every stop
reason's recovery copy is section 06. Copy in quotes ships verbatim.

---

### 4.1 Where it lives: a fifth screen in The Study, not /advanced

**Recommendation (V9, decided): the inbox is a new nav item "Updates" in The Study,
rendered exactly like the four existing screens.** The Study's header nav is currently
`Review · Compare · History · Finish up` plus a quiet right-aligned Advanced link
(workbench/static/index.html:351-365). Screens are hidden `<section class="screen">`
containers flipped by `setScreen()`/`renderScreenChrome()` (index.html:3106-3127), with
one `render*()` branch per screen in `renderAll()` (index.html:3130-3136). Updates adds
one more `<section class="screen" id="screen-updates">`, one nav button, one
`renderUpdates()` branch — no new page, no new serving mode, no build step
(the page is a single hand-authored HTML file served from memory, workbench/src/server.ts:626-633).

Why The Study and not the /advanced console, from the locked dashboard decisions:

1. **Jesse cannot use jargon tooling — this is settled law, violated once and re-fixed.**
   The v1 diagnosis picker was "unanswerable jargon" and the required free-text why
   produced rote noise (r6 §1, jesse-workbench-ux-feedback.md:9). The /advanced Admission
   tab is built of exactly the material that law forbids on his surfaces: digest identity
   tables, per-slot rationale textareas, gate rosters (advanced.html:3548-3604 per r8 §7).
   Putting the vote-review loop there would re-create the v2.5 regression at larger scale.
2. **The reviewed jargon quarantine puts digests and fingerprints on Advanced and the
   signing chip only** ("Digests, fingerprints, sha, raw IDs, telemetry, holdout: Advanced
   and the signing step only", workbench/DESIGN.md:138 per r8 §8; the identity trio renders
   in mono only behind the Advanced door, index.html:4009-4031). An inbox Jesse reads
   weekly belongs on the plain-language side of that line.
3. **The shipped permanence copy already promises this surface exists.** When Jesse files
   a suggestion, the UI tells him: "A suggestion can't be taken back here — you'll see it
   again in Finish up before anything is written, and a human reviews every change before
   it ships." (COPY.permanence, index.html:492). The Updates inbox is where "a human
   reviews every change" stops being a promise and becomes a screen.
4. **The votes originate in The Study.** The loop reads: cast calls in Review → see what
   they add up to in Updates → sign → merge. Sending Jesse to a different console mid-loop
   breaks the one-sitting cycle the ≤15-minute budget depends on.

This non-engineer calibration is also the successor answer, dispatched here once (the
04+09 flag): because every surface below is built for a reviewer who cannot read digests
or jargon, it serves either successor profile — non-engineer or technical operator — from
day one, with /advanced as the technical floor (§4.12). No card, panel, or confirm step
depends on Jesse personally: the reviewer is whoever A2 designates, and the two hand-off
points that need a human ruling — theme minting via "None of these" (V15) and doctrinal
questions (A3) — queue for that designated human rather than block the screen. Who merges
remains A1's assumption, stated in section 09, not here.

**Why not fold it into Finish up:** Finish up answers "write my calls to the answer sheet"
— per-sitting, fast, already shipped (V9). Updates answers "turn accumulated calls into an
engine update" — per-cycle, train cadence. Different tempo, different mental model, two
screens that link to each other (§4.11).

---

### 4.2 Screen anatomy

The Updates screen has three vertical zones inside its `screen-inner` container, following
the Finish-up layout idiom (intro copy → stat row → work area → sign area,
index.html:3629-4007 per r8 §5):

1. **Intro + tally.** One sentence of orientation and a small stat row: cards waiting,
   cards approved for the next update, and — when a train is running or open as a PR — a
   one-line status. `re-confirmation` cards never count in the approved tally or render in
   the "Approved for the next update" group: their Approve opens a review session and
   stages no change (§4.3's blessed variant; 07 §07.2's exclusion, owned by this surface).
   Intro copy (ships verbatim):

   > "Your calls add up here. Each card below is one change your calls suggest — approve
   > the ones that say what you meant, and they go into the next reviewed update."

2. **The card list.** One column of self-contained cards (grammar in §4.3), most recent
   contributing vote first, with the same roving-focus list behavior as the Review results
   column (§4.7). Parked cards collapse into a "Not now (n)" section at the bottom;
   declined cards leave the inbox (they remain in History — section 02's event log).
   **Phase 0 only** (08 D2): the legacy card renders first, followed by the three
   read-only backlog lines — the compile `plan.checklist` output rendered in plain
   language — headed by one note that ships verbatim here and is quoted identically by
   sections 07 and 08 (both render this same card-then-lines order): "These lines
   describe the same old suggestions as the card above — the card is the way to act on
   them." Same facts twice, one way to act; the lines retire with the checklist (V1,
   Phase 4).

3. **The update panel.** Before a train exists: the "Start the update" summary and button
   (§4.5). While a train runs: the progress strip (§4.6). When the Update Report is ready:
   the report and the sign panel (§4.6). After signing: the PR link and the "waiting for
   merge" state. At most one train exists in a non-terminal state (single-flight, V7), so
   this panel never shows more than one thing.

(The pre-plan design canvas `workbench/prototype/Project approval needed/Curation
Workbench.dc.html` was examined before fixing this anatomy: it prototypes only the four
shipped screens — no approval-inbox surface exists in it to adopt or reject — and the one
idiom it offers this screen is its queue-tally-plus-done-state register, "Every result
this week has your call on it. Well done.", which zone 1's stat row and §4.8's
caught-up state adopt.)

The screen uses the existing slots for everything transient: `#banner-slot` for read-only
and data-changed banners, `#toast-slot` for receipts, `#dialog-slot` for the one-confirm
layer (index.html:366, 389-391 region; verified `#actionbar-slot`/`#toast-slot`/
`#dialog-slot` at index.html:389-391). The verdict toolbar stays Review-only
(index.html:3125-3126) — Updates has no floating action bar; every action lives on a card
or the update panel.

---

### 4.3 The card: grammar, then three fully-written examples

**The card grammar is fixed by V9 — five parts, every card self-contained, zero jargon:**

1. **Headline** — the outcome in Jesse's vocabulary.
2. **Because-line** — the vote(s) behind it, quoting his own note or the verse excerpt.
3. **What-will-change line** — the operations in plain words ("adds a line to the answer
   sheet" / "adds this passage under the theme …" / "removes this passage from the theme
   files").
4. **At most one question** when V3 requires human input, with deterministic candidate
   chips (section 03 derives the chip set) and a "None of these — needs a new theme" route
   to concept curation. (The rendered chip is sentence-case, as here — this section is the
   copy writer; 03's and V9's lowercase in-prose mentions are references to this chip,
   which renders in this casing.)
5. **Buttons: Approve / Decline / Not now.** Approving a card with an open question
   requires answering it first. No irreversible action on a bare keystroke (locked Study
   decision, r8 §9).

Behind the grammar sits section 02's closed set of **seven card kinds** (02.6, used
verbatim, never shown on screen): `expectation`, `guard`, `guard-and-anchor`,
`missing-passage`, `conflict`, `re-confirmation`, `needs-engineering`. The kind selects
which grammar parts render; it mints no new user-facing vocabulary. The written-out
examples below cover the set: example 1 is a `guard` card (a `guard-and-anchor` when the
vote also names an editorially-owned theme row); example 2 a `missing-passage` card
(`expectation` cards are its question-free shape — an Essential or prefer vote's headline
and answer-sheet line, nothing else); example 3 and section 07's day-one legacy card are
`re-confirmation` cards; the last two examples are the `conflict` and `needs-engineering`
cards.

A card never adjudicates — it attributes. "You marked this Not relevant", never "this
verse is wrong" (covenant #6; the why-rail's own footer already models this register:
"This explains the engine's reasoning. Your call decides whether it was right.",
index.html — COPY per r8 §8). Diagnosis tokens never appear; their reviewed plain-language
renderings do (COPY.plainWhy, index.html:577-581: `lexical-noise` → "matched words, not
meaning"; `wrong-anchor` → "listed under a theme it does not speak about";
`concept-misfire` → "speaks about the theme, but is not an answer for this query").

Every card also carries two quiet links: **"See it in search"** (re-runs the query in
Review, the update-notice chip pattern, index.html:1365-1414) and **"Change your call"**
(opens the query in Review focused on the judged passage so a superseding vote can be
cast — the next derivation then **replaces** the card: new leaves, new card, the old one
ceases to derive (02.6's content addressing); this is the only way to change what a card
asserts, per V10's rule that votes are corrected by superseding votes, never by editing
derived output).

#### Example card 1 — the motivating case (a "Not relevant" vote; no question)

What Jesse literally reads, top to bottom (all copy ships verbatim):

> **Keep Jeremiah 4:10 out of the top results for "it is well with my soul"**
>
> Because you marked it Not relevant on Aug 27 — matched words, not meaning.
>
> This will add a line to the answer sheet: Jeremiah 4:10 must not rank for this search.
> The checks will hold every future update to it.
>
> [ See it in search ]  [ Change your call ]
>
> **[A] Approve**   **[D] Decline**   **[N] Not now**

That is the whole card. One glance, one keystroke. (Sections 01 and 06 own the full
walkthrough of this example through the loop; the card is what the walkthrough's second
step looks like. When the same vote's diagnosis names an editorially-owned theme row, the
what-will-change line gains a second sentence — "and removes this passage from the theme
'…' in the theme files" — per V3's ownership rule; when the row is source-owned, the card
instead explains: "The theme listing comes from a published source, so it stays on record —
the answer-sheet line keeps the passage out of results for this search.")

#### Example card 2 — a Missing passage with the one question

> **Make Exodus 15:11 rank in the top 10 for "Who is like the Lord?"**
>
> Because you suggested it as a Missing passage — "uses that exact wording."
>
> This will add a line to the answer sheet saying Exodus 15:11 belongs in the top 10.
> To help it rank, the passage can also be listed under a theme:
>
> **Which theme should carry this passage?**
> ( God's incomparability )  ( Praise for God's character )  ( None of these — needs a new theme )
>
> [ See it in search ]  [ Change your call ]
>
> **[A] Approve**   **[D] Decline**   **[N] Not now**

The chips are deterministic candidates the deriver computed (section 03, V3); picking one
records the choice as the operation's evidence and enables Approve. Picking "None of
these — needs a new theme" approves the answer-sheet line alone and routes the theme work
to concept curation as a "needs a new theme" note on the card's record — the card tells
him so: "Saved — the answer-sheet line goes in this update. Drafting the new theme is a
separate, human-reviewed step." (V15: concept minting stays manual by design.)

#### Example card 3 — the re-confirmation variant (V6: the situation changed since the vote)

When the judged situation has **materially changed** — the displayed result or its reason
changed in kind — a `re-confirmation` card renders: Approve suppressed, no operation
derived *on it*, dashed border (the reopened chip's idiom, index.html CSS :213 per r8 §3).
Its producers are fixed by 03.5, and there are two. **From Phase 1, the deriver's own
derive-time pre-check** — the same `sameIdentity` all-three-fields comparison the Review
inbox uses (workbench/src/inboxSources.ts:59-63), run at derive over §03.2's observed
inputs — routes here **only the observation-bound remainder** of an identity-moved vote:
a `prefer` vote's ordering entry and the anchor arm of a `wrong-anchor`/`concept-misfire`
vote. It never withholds a guard: an identity-moved `irrelevant` vote's must-not-rank
guard still derives on an ordinary approvable `guard` card carrying the per-dimension
identity note — so an identity-moved `wrong-anchor`/`concept-misfire` vote yields **two
cards** over one leaf set (that guard card plus this one — distinct kinds, hence distinct
`cardId`s, 02.6), a `lexical-noise` or source-owned vote yields the guard card alone, and
one vote stays one cycle for the guard even on the drifted path (03 §03.5). Intent
classes (`missing`, `essential`) render normally at derive — whether the expectation is
already achieved is a ranking question only the replay can answer. The pre-check's
verdict is **frozen into the card's `cardRevision`** (03.5's ordering rule) — so a card
can never flip kind mid-review on screen: a world change surfaces only as the decide 409
(§4.4) or at the seal's re-derive, each re-rendering before anything is recorded — and
its product carries **no `stale` flag** (03 §03.5; 06 FM-13): that token is the seal
replay's alone. **From Phase 4 (D16), the V6 seal-time replay adds its materially-changed
disposition** — the second producer, and the only one that can send an intent-class card
here: a card that fails replay at seal gains the `stale` flag, drops out of the train,
and returns to the inbox in this same form (§4.5). The Review-screen stale-judgment
*suggestion* source (inboxSources.ts:165-183 per r1 §7) is a different surface, not this
card's producer — 07 §07.2 even adds a Phase-1 filter retiring it for the legacy lines
precisely because the card, not the suggestion, is the way to act. The example below is
the replay's return path — an Essential vote the replay found materially changed:

> **Look again: "comfort in suffering" has changed since your call**
>
> You marked 2 Corinthians 1:4 Essential on Aug 20, but the results for this search have
> changed since then. Your call was about what you saw that day — take one fresh look
> before this goes into an update.
>
> **[ Look again ]**   **[N] Not now**

"Look again" opens the query in Review as a `stale-judgment` case — the existing
first-class review-case source (workbench/src/judgments.ts:31-39). A fresh call supersedes
the old one and the next derivation replaces the card. Nothing is dropped, nothing
auto-approves.

**The re-confirmation button set is a blessed grammar variant, not a violation.** On any
`re-confirmation` card the what-will-change line truthfully says nothing changes yet, and
the primary button opens a review session instead of queueing a change — labeled "Look
again" on this V6 card (from either producer), "Approve" on section 07's day-one legacy card, which
follows this same variant and diverges from the five-part grammar in exactly this
sanctioned way. The day-one legacy card additionally carries **Decline, with its required
one-line reason, as the explicit permanent-dismissal third button** migration needs
(07 §07.2); the V6 identity-drift card keeps its two-button form. Pressing the primary
button records no operation; the fresh v2 votes it produces derive
normally in the next cycle. (The auto-resolved happy
case — "expectation already achieved" — never renders as a to-do at all; it appears as a
one-line receipt in the update panel: "Already achieved — your call for '{query}' is now
true in search, so this update just pins it in the answer sheet.")

#### The conflict card (V10 — surface only; detection is section 03's)

Contradictory effective votes render as one card showing both sides with their dates and
notes, and the buttons become the two choices plus Not now:

> **Two of your calls disagree about Psalm 46:1 for "refuge in trouble"**
>
> On Aug 12 you marked it Essential (top 3). On Aug 24 you marked it Not relevant —
> "speaks about the theme, but is not an answer for this query."
>
> Keep one: **[ Essential, top 3 ]**  **[ Not relevant ]**   **[N] Not now**

The pick is recorded as a superseding vote through the existing append-only supersede
mechanism (V10) — the conflict resolves in the judgment log, where truth lives, and the
card re-derives from the survivor.

#### The needs-engineering card (V15 — the remedy is off the allowlist; arrives only by conversion)

A `needs-engineering` card arises in exactly one way: as the next derivation's conversion
of a prior train's recorded finding — a stop event (`engineering-required` /
`outside-allowlist`) or a pinned verified report showing the card's answer-sheet line
still failing with nothing further to derive (03 §03.8; section 06's rows carry the stop
copy). It never derives fresh from a vote: every mapping-table operation targets an
allowlisted path by its own type, and no v2 diagnosis names a code change — so the
derive-time set from fresh votes is empty by construction (03 §03.8); a lexical-noise
vote derives a plain guard card, nothing else. The converted card carries only the
hand-off; whether an ordinary guard card coexists follows 03 §03.6's state-aware check,
per arm (03 §03.8): after a stop that merged nothing, the guard still derives and rides
its own ordinary card beside this one — two cards; when the line already stands — as in
the example below, after a live train or a pending-shipped prune — no ordinary card
exists, because the merged line itself is the guard. The card:

> **This one needs engineering: "peace like a river" keeps matching the wrong wording**
>
> Because you marked Isaiah 66:12 Not relevant on Aug 25 — and the last update's checks
> found the answer-sheet line alone doesn't fix it.
>
> This adds nothing to the answer sheet — your line keeping Isaiah 66:12 out stands
> already. Approving sends the write-up to engineering with your call attached; nothing
> else changes until an engineer takes it up.
>
> [ See it in search ]  [ Change your call ]
>
> **[A] Approve**   **[D] Decline**   **[N] Not now**

Approve records exactly what the card says, nothing more: the hand-off of the write-up —
headline, because-line, quoted votes, and the recorded finding that triggered the
conversion — as the engineering item 06's recovery copy promises ("It was written up for
engineering with your calls attached"). It stages no guard: in this example the
line is already merged, so the hand-off card stands alone; where the guard still derives,
it rides its own ordinary card beside this one (03 §03.8's per-arm rule). The card
then moves to a quiet **"With engineering (n)"** group beside "Not now (n)"; when the
engineering fix later merges and re-derivation observes the finding resolved, the
ordinary card (or the auto-resolve receipt) derives again and this one lapses (03 §03.8's
lapse rule, via 03.6's state-aware derivation).

---

### 4.4 Actions: what each button does mechanically

Every decision is one POST to `POST /api/v2/updates/cards/:id/decide` (endpoint set fixed
in Part 3 of the spine). The `:id` is the card's `cardId` — the content address over the
card's derivation key (02.6). The body is `{decision, answers?, cardRevision}` — the
decision, the question's answer when one was asked, and the card's **`cardRevision`**
(03 §03.2: a sha256 over the card's canonical derived content — operations, question and
chips, the pre-check verdict (03 §03.5), evidence bundle — never its decision state; the
"per-card content pin" 06's FM-11 names). The pin is **per card, "never the global derivation digest"** (03.5
step 2, quoted), and the distinction is what the keystroke story rides on: every decide
appends a line to `workbench/updates.jsonl`, itself an observed derivation input, so a
global-digest pin would make each approval invalidate the next — approving down a 20-card
inbox would be decide→409→refetch per keystroke. Pinned per card, decides on *other*
cards never invalidate a pending decide: an inbox of N cards is **one derive and N
decides**, no re-derive between keystrokes (§03.2). The derivation digest pins exactly
one mutation — the **seal** (03.5 step 3; §4.5). The server appends one event line to `workbench/updates.jsonl`
(V5's append-only store — same discipline as judgments.jsonl: corrections are new lines,
never edits) and returns the re-rendered card state. Nothing else happens: **no file in `eval/` or `ontology/` changes, no build runs,
no result moves.** The card decisions are pure staging.

| Action | Mechanically | What Jesse sees |
|---|---|---|
| **Approve** | Appends `approved` (+ the question's answer, which becomes the operation's recorded evidence — the `confirmed: true` human act ReviewerConfirmedProvenance requires, workbench/src/proposals.ts:38-43; derived proposals are structurally impossible to emit without it, V9) | Card moves to the "Approved for the next update" group; toast: "Approved — this goes into the next update. Nothing changes in search until that update is reviewed and goes live." |
| **Decline** | Opens a one-line "why" input (required — V5: a declined card records a one-line reason), then appends `declined` with the reason | Card leaves the inbox; toast: "Declined — kept on record with your reason. Your original call still stands." |
| **Not now** | Appends `parked` | Card collapses into the "Not now" section; it returns at the top of the next cycle (V5) |

**One row diverges by design: the `re-confirmation` card.** Its primary button (§4.3's
blessed variant — "Look again" on the identity-drift card, "Approve" on 07's legacy card)
opens a review session and records no operation, so the table's Approve mechanics do not
apply: **no move to the "Approved for the next update" group, no "goes into the next
update" toast** — both would be false, since nothing is staged. On the legacy card,
`approved` means "fresh look opened" (07 §07.2); the receipt is the opened session itself,
and the card renders thereafter per §4.8's approved-legacy row until the first fresh v2
vote retires it.

**Reversibility before the seal — 02.6's fold rule, rendered.** The store's **card**
event kinds are the closed four (`card-drafted` / `card-approved` / `card-declined` /
`card-parked`); train events (opened / sealed / stopped) are its only other entries
(02.6). There is no undo event and none is needed: events fold in log order, and **the
latest decide event before seal is the effective decision** (02.6's fold rule — the V5
correction-as-new-line discipline applied to decisions). A changed mind is another A/D/N
keystroke appending another line, never an edit; a card cannot return to `drafted`, and
"not in this update at all" is exactly what Not now records. This is why bare-keystroke
Approve is allowed under the "no irreversible action on a bare keystroke" rule: approval
before seal is exactly as reversible as an E vote with its Undo (index.html:1707-1708).
The **seal** is the irreversible act, and it gets the one-confirm layer (§4.5). After
seal, the sealed decisions are frozen into that train; changing your mind is a superseding
vote that yields a new card for the next train (02.2 rule 3) — never a mutation of a
sealed one.

**Honest timing, extended not weakened (A3/B6).** The shipped contract sentence governs
this screen as it governs Review — quoted verbatim, it is the sentence this whole plan
makes true: "Your calls are saved the moment you make them. They change search results
only in the next reviewed update — never while you work." (index.html:429). Approval copy
therefore always says "the next update", never "applied", never "shipped", and no surface
on this screen previews a would-be reordering — the card states the intent ("must not
rank"), and only the post-run Update Report shows measured before→after, because by then
it is a measurement, not a promise.

**Decision-time staleness (F3 hook, mechanics here, recovery copy in 06).** The 409 fires
exactly when **this card** changed (03.5 step 2), and only then — never because another
card was decided: **Refreshed card:** the `cardId` still derives but with a different
`cardRevision` — an input moved under its content, e.g. a Finish-up compile wrote a
fixture between derive and decide (V1's coexistence friction). The client refetches
`GET /api/v2/updates` — the same stale-snapshot semantics the vote flow already uses (409
`review_snapshot_required`, workbench/src/server.ts:575-578 per r1 §4) and Finish up uses
for previews (409 `stale_preview`, COPY.staleLine, index.html:572) — the refresh line
shows in place — "The picture changed since you read this — reloading your updates
now." — and the same decision is one keystroke away. **Replaced card:** a contributing
judgment was superseded, so the old `cardId` simply no longer derives — a re-derived card
is *a different card* (02.6), so there is no "newer version" of this one; the replacement
card (state `drafted`) renders where the old one stood with section 06's FM-13 sentence:
"You changed your call on this since the card was written. Here is the fresh card."
Nothing is applied against a picture the reviewer is not currently seeing; nothing the
reviewer did is lost — and an approval streak down the rest of the inbox never pauses for
either render, because no decide moves any other card's pin (§03.2).

---

### 4.5 Batch flow: cards → train summary → one confirm

When at least one card is approved, the update panel shows the train summary — a
plain-language restatement of exactly what has been approved, honest about what is intent
versus measurement:

> **Start the update**
>
> This update will contain:
> - 9 answer-sheet lines across 6 searches (3 must-rank, 5 must-not-rank, 1 preferred order)
> - 2 theme changes (add Exodus 15:11 under "God's incomparability"; remove Jeremiah 4:10
>   from "peace of mind")
> - 1 addition to the test corpus so a new answer can be checked
>
> The checks run next — they usually take between half an hour and an hour and a half.
> You don't need to stay. When they finish, the report shows exactly what changed in
> which searches, and nothing goes live until you've read it, signed it, and merged it.
>
> **[ Start the update ]**

**The machine-time sentence is lane-aware**, because the train flavor is derived from the
operations before anything runs (05 §5.2). The summary above is a data train (it contains
a theme change and a corpus addition), so it carries the half-hour-to-ninety-minutes
sentence. A guard train — only answer-sheet lines — says instead (ships verbatim): "This
update only writes lines on the answer sheet, so the checks are quicker — usually inside
three quarters of an hour, about double that until a one-time independent sign-off clears
two standing checks. The screen shows how long each run actually takes." (It skips the
trial build and comparison but still pays the full-check rebuild — 05 §5.10's cost
table — **plus**, until 08 D12a's first signing clears the standing G2/G8 red, the
comparable base-commit control run that roughly doubles the figure for every train, 08
§8.4 — which is the entire window in which this sentence first ships, so the doubling is
in the shipped copy, not a footnote. The "one-time independent sign-off" is D12a in plain
words; the elapsed/measured time renders per 08 D8's rule — measure in the shakedown,
print the measured number in the train view thereafter.) Both times are estimates until
the shakedown measures real runs (08 D11); neither ever says "instant".

Clicking it opens the one-confirm layer — the Compare pattern reused exactly: title,
finality sentence, initial focus on Cancel (COPY.compareConfirmTitle/compareFinality,
index.html:526-527; the pattern is the locked slip-guard for anything that cannot be
taken back, r8 §6 item 7):

> **You're starting the update.**
> Once it starts, these approved changes travel together — new calls you make will go
> into the next update instead.
> [ Cancel ]  [ Start the update ]

Confirming posts `POST /api/v2/updates/train` (Part 3) carrying the derivation digest the
panel rendered from — the one mutation that digest pins (03.5 step 3; decides are pinned
per card, §4.4) — which **seals** the train: the
seal digest binds judgmentIds, cardIds, operations, and the replay identity (V8), the
seal-time staleness replay runs (V6 — automated from Phase 4's D16; Phases 2–3 seal
without it, covered by D1's full-triple compile warning, the derive-time pre-check
(§4.3 example 3 — a re-confirmation card never boards a seal; the split-off guard card
boards normally), and human review — the same triad
03.5 and 06's FM-2 name, per 08's phasing. When it runs, any card that comes back materially
changed drops out of the train, gains the `stale` flag, and returns to the inbox as the
§4.3 re-confirmation variant with a banner: "1 card needed another look and was set
aside — the rest went ahead."), and the machine takes over (section 05's choreography).
One phasing note (08 D8/D14, stated as 05 §5.2's phase bridge states it): the seal's
one-confirm layer above is permanent — it fronts "Start the update" in every phase. What
Phase 2 lacks is the typed-digest sign endpoint, so its guard trains carry a **second**
confirm at `ready`: the fixture-lane Update Report renders with an "Approve this update"
button fronted by this same one-confirm layer in place of the §4.6 sign panel, posting to
the **existing** admit surface `POST /api/v2/admissions/:id/admit` (already server-side
allowlisted, `requiresTrustedJson`, server.ts:223) — the `ready → admitted` decision, 08
D8's mechanism, rendered in §4.6 with its confirm copy and wired in §4.9. From Phase 3's
D14 on, the typed-digest sign panel fronts that decision for both train flavors and this
button retires. The summary screen
deliberately does **not** show predicted result movement — that would be the reordering
preview decision 4 forbids (r8 §4: "never a preview of a would-be reordering"); it shows
counts of approved intents, which are Jesse's own words played back.

If the panel cannot start a train — another train is non-terminal, or a data train must
defer to an open identity-moving PR (single-flight, V7) — the button is replaced by the
status line of the running train plus: "One update at a time — approve cards now and
they'll ride the next one." One further refusal is transient: until 08 D8a's
per-operation fixture-targeting amendment merges, manifests are single-query (03 §03.2;
02.7), so the runner refuses to seal a train whose approved cards span more than one
search — never a silent split (08 D8a's AC) — and the panel says (ships verbatim): "For
now, one update covers one search at a time — start this one, and the other calls ride
the next update." The string and the refusal retire when D8a merges.

---

### 4.6 The train panel: progress, the Update Report, and the sign panel

**Progress.** A sealed train runs as workbench jobs surfaced through the existing
jobs/SSE pattern (`POST /api/v2/checks` allowlisted jobs + `GET /api/v2/jobs/:id/events`
+ cancel, workbench/src/server.ts:1244-1348 per r8 §6 item 10; V13's zero-terminal steady
state). The panel renders one progress strip with a short step label per state and one
plain status sentence beneath — status copy, not new vocabulary (V5: surface names come
from the reviewed rename table). **This table is the single writer of the
reviewer-visible train-state strings (E4):** the step labels are §5.1's reviewer-visible
labels, adopted verbatim into this COPY block; 05 states "04 owns the full copy block and
its D28 jargon check", and §5.1's label column is a reference to this table, so no rival
set exists.

| Train state (technical, V5) | Step label (strip) | Status sentence (ships verbatim) | Next action |
|---|---|---|---|
| `open` | "Collecting approvals" | the §4.5 summary + "Start the update" | approve/decline cards; start |
| `sealed` | "Update started" | "Your approved changes are locked in — the checks are starting." | none — leave it running |
| `built` *(data trains only)* | "Building the trial run" | "Building a test copy of the search with your changes…" | none |
| `measured` *(data trains only)* | "Measuring what changes" | "Comparing results before and after…" | none |
| `ready` | "Ready for your review" | "The report is ready — read it and sign below." *(Phase 2, before the sign panel exists: "The report is ready — read it and approve below.")* | read report, sign (below); Phase 2: the one-confirm "Approve this update" (guard-train report, below) |
| `admitted` | "Approved" | "Approved. Preparing the change for review on GitHub…" | none |
| `pr-open` | "Waiting for merge" | "Waiting for the final merge. One click on GitHub makes it live." + PR link | merge on GitHub (A1 governs who) |
| `live` | "Live" | "Live. These searches now answer the way you called them." + query chips | optional: re-run a query chip |
| `stopped(<reason>)` | "Stopped" | the stop card — plain-language reason + recovery copy | per-reason; section 06 owns every reason's copy and recovery path |

**The fixture-lane strip (guard trains).** A guard train's state path is
`open → sealed → ready → admitted → pr-open → live` (05 §5.2) — `built` and `measured`
are waypoints it legitimately has no artifact for — so its strip renders three machine
steps, never five, and the trial-build and comparison sentences never appear. Between
"Update started" and "Ready for your review" it shows (ships verbatim): "Checking your
answer-sheet lines — no trial build needed, nothing can move in search."

The `live` row feeds the existing build-change notice so Jesse sees his vote land (V11);
the query chips reuse the update-notice chip pattern (index.html:1365-1414). The live
receipt is a display, not a resting state: it persists until the reviewer dismisses it or
the next derivation produces at least one approvable card, at which point the panel
reverts to the §4.5 position for the next cycle. A stopped
train's card always names its stop reason from the closed enum (V5) in plain words —
`no-measurable-effect` renders the V12 copy: "The checks found this change wouldn't alter
any result — it wasn't merged; here's what that usually means." — and returns its cards
to the inbox. **NO MEASURABLE EFFECT is a stop, not a success** (V12). One derived
rendering sits outside the closed state set without extending it: a train whose merged
commit later leaves `main` renders as **"Reverted"** — computed from the commit no longer
being reachable, per 06 FM-16's revert path — with the panel copy "This update was taken
back out of search. Your calls are still on record." (behavior in §4.8).

**The Update Report** (per-train, plain language — distinct from the gauntlet's Admission
Report, Part 2 terminology). It is the one document that satisfies the admission blocker
"every query whose top-10 changed must appear in `reviewedComparisonQueries`, exactly, no
extras" (workbench/src/admission.ts:819-832 per r2 §3.1) — by listing **every** changed
query with before→after in plain language and making approval of the report the recorded
per-query review (V8). Anatomy:

1. Lead: "This update changes results for 6 searches. Here's each one, before and after."
2. One block per changed query: the query, what moved in the top 10 (references and plain
   reason renderings only — no digests), and which of Jesse's calls asked for it
   ("You asked for this: your Missing passage call on Aug 6."). Movement no vote asked
   for is labeled honestly: "Side effect — worth a look."
3. A one-line checks summary in the established plain term: "The checks passed — every
   answer-sheet line holds." (Gate-by-gate tables stay on /advanced, §4.12.)
4. **Spot-check, one click away:** each block carries "Compare blind" — the train's
   comparison publication appears as a Compare review through the existing blind-comparison
   machinery (`GET /api/v2/candidates` lists comparison publications;
   blind sessions at server.ts:1108-1240 per r2 §5), so Jesse can double-check any query
   without being told which side is which.

Approving the report records every listed query as reviewed, per-query, in the train's
record — that exact list becomes `reviewedComparisonQueries` (sections 03/05 wire it;
admission refuses on any mismatch, which is the safety net if this screen ever
under-lists).

**The guard-train Update Report** is the fixture-lane variant of the anatomy above: no
changed queries, no comparison publication, no blind Compare — nothing ran that could
move a result (05 §5.2: guard trains never enter `built`/`measured`). Its report is one
block whose lead sentence **this section's COPY block writes — the same single-writer
rule (E4) as the state strings above**; 05 §5.2's report sentence is a reference to this
block, so no rival rendering exists, and
"fixture lane" itself stays 05 §5.3's internal classification term, never shipped (D28). The lead ships verbatim: "This update only writes lines on
the answer sheet — no search result can move, so there is nothing to compare. The checks
confirmed every line holds." — followed by the answer-sheet lines listed in the cards'
own words. Approving it records the review of exactly those lines; the
`reviewedComparisonQueries` coverage rule does not arise, because no comparison exists
(05 §5.3).

**Phase 2's approve control** (the §4.5 phasing note, rendered — the interaction that
gets a guard train past `ready` before D14's sign panel exists). Beneath the report block
sits one button, **"Approve this update"**, fronted by the one-confirm layer (initial
focus on Cancel, the Compare pattern, r8 §6 item 7):

> **You're approving this update.**
> This records your review of the answer-sheet lines above and opens the change as a
> draft on GitHub. Nothing goes live until a human merges it — that final click is the
> approval that counts.
> [ Cancel ]  [ Approve this update ]

Confirming posts to the existing `POST /api/v2/admissions/:id/admit` — already wired
server-side (`requiresTrustedJson`, server.ts:223; the server signs the admission
decisions with its key, server.ts:499, per 08 D8) — moving the train `ready → admitted`
and recording the review of exactly the listed lines. Its failure sentence and page
wiring are in §4.9. From Phase 3's D14 the typed-digest sign panel below fronts this
decision for both train flavors and this button retires.

**The sign panel** (from Phase 3's D14; Phase 2 renders the approve control above
instead) reuses the Finish-up typed-digest mechanics exactly (V8; r8 §5): the
explanation sentence is the shipped one — "This step changes reviewed files, so it asks
for a signature: type the code below exactly. That is deliberate friction — it means
nothing is written by a stray click." (COPY.signBody, index.html:565) — the code chip
shows the first 12 hex of the report digest grouped 4-4-4 (`signCode`,
index.html:3783-3787), matching is exact, case-insensitive, spaces ignored
(index.html:3788-3793), the panel is not a native `<form>` so no raw submit can fire
(r8 §5 item 5), and the button posts the FULL digest to
`POST /api/v2/updates/train/:id/sign` (Part 3). 409 semantics mirror Finish up: a changed
report → "The picture changed since this preview — reloading it now." (COPY.staleLine,
index.html:572) with a fresh code; a concurrent mutation → "Another change is being
written right now — try again in a moment." (COPY.busyLine, index.html:573). This is the
one surface outside /advanced where anything hex-shaped appears — the reviewed quarantine
line already carves out exactly this exception (DESIGN.md:138 per r8 §8).

Signing is Jesse's approval act inside the workbench; the **merge on GitHub remains the
admission event** (covenant; A1 governs who merges). The panel says so: "After you sign,
this becomes a draft change on GitHub. It goes live only when a human merges it — that
final click is the approval that counts."

---

### 4.7 Keyboard and accessibility

Consistent with the Study's existing idiom — both input methods first-class, keycap chips
on every button (locked decision 9, r8 §9):

- **J / K** (and ↓ / ↑) move focus through the card list — the exact keys and
  arrow-fallback the Review results list uses (index.html:4555-4564).
- **A / D / N** on the focused card: Approve / Decline / Not now. All three are
  reversible until seal (§4.4), so bare keystrokes are legal; Decline opens its
  required-reason input (focus lands in it, Esc cancels), mirroring how X opens the
  interview today (index.html:4602-4607 — the `h`/`x` handler).
- **Enter** on a question chip selects it; **Enter never doubles as an uncorrectable
  commit** (the Review screen's own rule for tail rows, index.html:4568-4576, applied
  here to the seal and sign controls: they are mouse-or-focused-button only, inside the
  confirm layer / sign panel).
- **U** on a just-decided card re-opens its buttons so a correcting decision can be
  pressed — under 02.6's fold rule the correction is simply another decide event from the
  closed set (latest wins pre-seal); U itself appends nothing and no undo event exists.
  Matches the Review undo key's feel (index.html:4615-4618) without new store vocabulary.
- The seal confirm layer takes initial focus on **Cancel** (the Compare confirm pattern,
  r8 §6 item 7); Esc closes.
- A11y: the card list is a labeled region with roving `tabindex`; each card is one
  focusable article whose accessible name is the headline; decisions announce via the
  existing toast + `aria-live` slot; the progress strip is `role="status"`; keycap chips
  are `aria-hidden` with the key named in each button's `aria-label` (the per-button
  labeled-verdict pattern, r8 §3). New UI colors enter `workbench/test/pairs.json` so the
  contrast audit covers them (r8 §2, workbench/test/contrast.audit.test.ts).

---

### 4.8 States: the complete set

| State | Surface | Copy (ships verbatim) / behavior |
|---|---|---|
| **Empty (steady)** | card list | "Nothing to review — your calls in Review will show up here as suggested changes." + a "Go to Review" button. (Day-one first render — the one legacy re-confirmation card — is section 07's walkthrough.) |
| **Empty (all approved)** | card list | "All caught up — 9 changes approved and waiting. Start the update below when you're ready." |
| **Loading** | whole screen | "Gathering your calls…" skeleton; never a blank pane. |
| **Fetch error** | any zone | The inbox-section rule: a failed fetch shows its fallback sentence inline, never silence (index.html:1331-1336 per r8 §6 item 2): "Couldn't load your updates just now — reload the page to try again." Each endpoint gets its own failure sentence (§4.9, failure-copy parity). |
| **Read-only / degraded** | banner + all controls | The existing read-only banner verbatim — "Read-only right now." + " The engine is rebuilding its data…" (COPY.readOnlyStrong/readOnlyRest, index.html:438-439); every decide/seal/sign control disabled, same as every POST-issuing control today (r8 §6 item 9; degraded startup disables mutations with `startup_degraded_read_only`, server.ts:648-661 per r8 §1). |
| **Re-confirmation card (V6)** | card | §4.3 example 3 — dashed border, Approve suppressed, "Look again" routes to a stale-judgment review case. Two producers: the derive-time pre-check (observation-bound remainder only — an identity-moved `irrelevant` vote's guard rides its own ordinary card, 03 §03.5) and, from Phase 4, the seal replay's `stale` return (§4.5). |
| **Conflict card (V10)** | card | §4.3 conflict example — resolved only by the recorded pick (a superseding vote) or Not now. |
| **Needs-engineering card (V15)** | card + "With engineering (n)" group | §4.3 example — arrives only as a post-train conversion (03 §03.8); Approve records the engineering hand-off only (an ordinary guard card coexists only where the guard op still derives — 03 §03.8's per-arm rule); the card waits in the group until re-derivation observes the finding resolved (03 §03.8, via 03.6). |
| **Approved legacy card (transient, 07 §07.2)** | main card list | An approved legacy `re-confirmation` card with no fresh v2 vote yet stays in the main list with the quiet status line "Fresh look opened — finish your calls in Review"; its primary button re-opens the same `stale-reconfirmation` session, so an abandoned sitting is always resumable. Excluded from the approved tally and group (§4.2); the first fresh v2 vote retires it. |
| **Pruned card (no-effect prune, 05 §5.4)** | "Not now (n)" group | A card pruned from a train for no measurable effect renders `parked` — a *derived* default computed from the stop event plus the stopped attempt's sealed operations and replay identity (03 §03.6): no machine-written decide event, the log still folds to `approved`, and the default lifts on a post-stop human approve or an identity move — while its answer-sheet line ships as a pending goal; it renders collapsed in "Not now (n)" carrying 05 §5.4's outcome copy verbatim and — re-derived unchanged at the same identity — 06 FM-5's line "This was tried on ⟨date⟩ and would not have changed any result." Re-approval is an explicit human act (FM-5); it never re-boards a train silently. |
| **Decide 409** | card | Fires only when this card's pin is stale (§4.4): a changed `cardRevision` → "The picture changed since you read this — reloading your updates now."; a `cardId` that no longer derives → 06's FM-13 sentence, rendered in place. Decides on other cards never trigger it. |
| **Mid-seal / mid-sign 409s** | update panel | COPY.staleLine / COPY.busyLine reused (§4.6). |
| **Multi-query seal refusal (transient, pre-D8a)** | update panel | §4.5's verbatim note — "For now, one update covers one search at a time — start this one, and the other calls ride the next update." Retires when 08 D8a merges. |
| **Stopped train** | update panel | Stop card; per-reason copy and recovery owned by section 06. Cards return to the inbox. |
| **pr-open with main moved** | update panel | Status line gains "The project changed underneath this update — it will be re-checked before anyone merges it." (mechanics: section 05's `main-moved` handling; copy here, recovery in 06). |
| **Reverted train** | update panel + card list | "This update was taken back out of search. Your calls are still on record." (§4.6). On the next derivation the affected cards return to the inbox carrying the revert notice: "This change went live and was later taken back — take another look before it goes in again." (mechanics: 06 FM-16's rollback/revert path and its `trainRunner.revert.test.ts` contract). |

---

### 4.9 Endpoints and the three-allowlist wiring work item (F4)

The five endpoints, exactly as fixed in Part 3 — 03 derives what they serve, 05 runs what
they trigger, 04 owns their UI and failure copy — plus the one existing route this page
borrows during Phase 2 (§4.6):

| Endpoint | UI use | Failure copy (parity rule: one sentence per api function, D39-style) |
|---|---|---|
| `GET /api/v2/updates` | render the card list + tally | "Couldn't load your updates just now — reload the page to try again." |
| `POST /api/v2/updates/cards/:id/decide` | Approve/Decline/Not now/answers | "That decision didn't save — check the connection and try again. Nothing was lost." |
| `POST /api/v2/updates/train` | the seal ("Start the update") | "The update couldn't start — reload and try again. Your approvals are all still here." |
| `GET /api/v2/updates/train/:id` | progress strip + Update Report | "Couldn't load the update's progress — reload to try again. The update itself keeps running." |
| `POST /api/v2/updates/train/:id/sign` | typed-digest sign | "The signature didn't go through — the code may have changed. Reloading the report now." |
| `POST /api/v2/admissions/:id/admit` *(existing route; Phase 2 only on this page)* | the one-confirm "Approve this update" (§4.6) | "The approval didn't go through — reload the report and try again. Nothing was merged." |

**The wiring cost is real and budgeted as its own work item (V9), because the serving
layer fail-closes on it.** Every route literal the page calls must appear in three
places, and the page is rejected as stale if the first is missing:

1. `REQUIRED_INLINE_ROUTES` (workbench/src/staticSnapshot.ts:10-35) — a
   literal-per-route allowlist: exact strings for plain routes, including three separate
   audit literals `'/api/v2/audits/preview'`, `'/api/v2/audits/apply'`,
   `'/api/v2/audits/close'` (staticSnapshot.ts:23-25), and split prefix + suffix literals
   for parameterized routes (`'/api/v2/jobs/'` … `'/cancel'`, staticSnapshot.ts:19, 34).
   The five new literals, in that same style: `'/api/v2/updates'`,
   `'/api/v2/updates/cards/'`, `'/api/v2/updates/train'`, `'/decide'`, `'/sign'`. The
   server refuses to serve a page that lacks any listed literal, so these strings and the
   page that uses them must land **in the same commit**;
2. the page's own `ROUTES` mirror (index.html:396-425);
3. `requiresTrustedJson` for the three POSTs (workbench/src/server.ts:207-226) — the
   same-origin localhost JSON trust check (`trustedMutationRequest`, server.ts:183-205
   per r1 §4) and the 64 KiB body cap (`MAX_BODY_BYTES = 64 * 1024`, server.ts:110).

The Phase-2 admit call is part of this same work item: `POST /api/v2/admissions/:id/admit`
is **already** in `requiresTrustedJson` (the regex at server.ts:223 — nothing to add
there), but this page has never called it, so Phase 2 adds its `ROUTES`-mirror entry, the
split inline-route literals `'/api/v2/admissions/'` … `'/admit'` in `REQUIRED_INLINE_ROUTES`'
prefix/suffix style (today that list carries no admissions literal, staticSnapshot.ts:10-35
— verified), and the failure sentence in the table above. When D14's sign panel replaces
the button, the entry retires with it.

Plus, per the same work item: read-only degradation on every new control (§4.8), the
failure-copy table above kept in parity with the api functions, and the new copy strings
living in the one reviewed `COPY` block like every other user-visible string
(index.html:428-601 — the register is enforced structurally by keeping all copy in one
place, r8 §2). One honesty note on "ships verbatim": every string this section mints
ships from this plan without Jesse having reviewed it, and all of them are on the
inventory Phase 4's D20 copy review revisits ("every string this plan minted go through
one copy review and land in the COPY block", 08 D20).

**Jargon quarantine, as a binding AC:** the D28 jargon regex — `[0-9a-f]{8}-` and
`sha256` — run over the rendered Updates screen and Update Report must find **zero
matches** (the History screen already carries this exact AC, r8 §5 D28); the single
exception is the sign chip's 12-hex code, which is excluded the same way the Finish-up
chip is. Established plain terms are mandatory: "answer sheet" (never "fixture"), "the
checks" (never "gauntlet"), "reviewed update" (never "deploy"/"release") — Part 2.

---

### 4.10 Time budget: per card and per cycle

Contract numbers (Part 3, stated identically everywhere): **≤ 15 minutes active per cycle
— inbox ~10 min, Update Report + sign ~4 min, merge ~1 min; machine time in between
30–90 minutes unattended.** How the inbox ~10 minutes decomposes — estimates, not
measurements (no cycle has run yet; Phase 1 should measure real per-card times and revise):

| Card kind | Est. seconds/card | Basis (estimate) |
|---|---|---|
| No-question card (examples 1) | 10–20 s | read headline + because-line, one keystroke; comparable to an E/X vote with its interview already done |
| One-question card (example 2) | 30–60 s | read + pick one chip; the chips are precomputed, no typing |
| Re-confirmation ("Look again") card | 60–90 s | one re-search in Review + one fresh vote |
| Conflict card | 30–60 s | both sides are quoted in place; one pick |
| Train summary + confirm | ~60 s | counts only; no per-item re-reading — the cards were the reading |

A typical weekly cycle of 15–25 cards (mostly no-question) lands at 5–10 minutes of
inbox time; the Update Report at ~6 changed queries × ~20 s + one blind spot-check ≈
3 min, sign ≈ 30 s. Within budget with room to spare; a heavy cycle (many question
cards) is the signal to run two smaller trains, not to rush — single-flight makes them
sequential, and the copy says so ("One update at a time — approve cards now and they'll
ride the next one", §4.5). Machine time is honestly disclosed in the summary copy,
lane-aware (§4.5): data trains "usually between half an hour and an hour and a half";
guard trains "usually inside three quarters of an hour, about double that until a
one-time independent sign-off clears two standing checks" (§4.5's sentence; 05 §5.10 — no
candidate build, comparison, or regen, but the full-check rebuild remains, and until 08
D12a lands every train also pays the comparable base-commit control run, 08 §8.4;
estimates until D11 measures) — never "instant".

---

### 4.11 Relationship to Finish up

Both screens exist; they answer different questions and link to each other (V9):

- **Finish up** = "write my calls to the answer sheet" — per-sitting, fast, shipped. It
  keeps its compileJudgments-powered preview/sign/apply unchanged by this plan (V1's
  coexistence rule: Finish-up writes fixtures; the deriver treats those written fixtures
  as hash-pinned `sourcePreconditions`, so the two writers never race).
- **Updates** = "turn accumulated calls into an engine update" — per-cycle, train cadence,
  and the only surface where theme changes and corpus additions become reviewable (the
  work compileJudgments today prints as a checklist the UI ignores,
  workbench/src/compileJudgments.ts:11-13 and the `checklist` plan field that already
  rides `POST /api/v2/compile/preview`, compileJudgments.ts:87 per r8 §7 — Phase 0 simply
  renders it here, read-only, under §4.2's shared "the card is the way to act" note).

Cross-links: the Finish-up success card ("Written.", index.html:568) gains one line —
"See what your calls add up to → Updates"; the Updates empty state links back to Review.
The Phase 4 retirement of the checklist and the compile direct CLI path is section 08's
schedule and V1's decision. **After that retirement, the division is this section's
ruling (08 D18 defers it here): Finish up keeps its per-sitting answer-sheet write, and
the deriver keeps pinning those written fixtures as hash-pinned `sourcePreconditions` —
D18's minimal reading, adopted.** Phase 4 removes the printed checklist and the compile
direct CLI path, nothing else; before and after, nothing on the Updates screen duplicates
a write Finish up performs — Updates stages and trains, Finish up writes working-tree
fixtures.

---

### 4.12 What /advanced keeps for power use

The Updates screen is the paved road; `/advanced` (the preserved 11-tab console,
advanced.html:1146-1158 per r8 §7) remains the diagnostic floor beneath it — engineering
surfaces, per its own intro: "Engineering surfaces. Nothing here interrupts the review
flow." (COPY.advancedIntro, index.html:574). It keeps, deliberately un-redesigned:

- **Admission tab**: the raw preview identity table (admission digest, proposal digest,
  candidate sha256s), the gate-by-gate table, per-slot and per-probe rationale forms —
  the full-fidelity view behind the Update Report's plain-language summary, for the
  implementer or a technical successor diagnosing a stop.
- **Publish tab**: preflight blockers and prepare options for a train whose publish step
  needs manual inspection (e.g. `gh` unavailable — the exact fallback command surfaces
  there as `safeNextActions`, workbench/src/publishPreparation.ts:1281-1307 per r2 §4).
- **Candidate tab**: raw comparison publications and blind-session administration.
- **Changes tab**: the full-digest compile preview/apply (the Finish-up ancestor) for
  forensic re-runs.
- **Sessions / Quality / Audits**: unchanged.

In the steady state Jesse never needs it (V13: the only off-Study action is the Merge
click on GitHub); it exists so that when section 06's stop cards say "with engineering",
engineering has somewhere with full instrumentation to stand. The Advanced door's identity
trio (mono, index.html:4009-4031) stays the only place fingerprints render.

---

### What NOT to do on this surface

- **Do not preview reorderings or promise shipping** — no "applied", no live movement, no
  predicted result lists on the summary screen (covenant: determinism + the locked
  decision 4; the contract sentence at index.html:429 is quoted, extended, never
  weakened).
- **Do not put digests, fingerprints, or gate names on any Updates surface except the
  sign chip** (jargon quarantine, DESIGN.md:138; D28 regex AC in §4.9).
- **Do not let a card edit derived operations directly** — a changed mind is a superseding
  vote or a card question's answer; anything else creates a second source of truth beside
  the judgment log (append-only covenant, V10).
- **Do not add per-card weight or scoring knobs** — forbidden by the jesse-workbench-ux
  law (r6 §1) and V3 (anchor weight defaults to 1.0, stated on the card, no knob).
- **Do not auto-approve anything** — every Approve is a human act; it is the
  `confirmed: true` in ReviewerConfirmedProvenance (proposals.ts:38-43), and the machine
  cannot forge it.

**Section 04 acceptance criteria** — AC: the Updates screen renders as a fifth
`<section class="screen">` with nav parity and passes the existing Playwright screen
pattern (a study-p5-style spec per D31 precedent); AC: the D28 jargon regex over the
rendered Updates screen and Update Report yields zero matches outside the sign chip; AC:
every endpoint in §4.9 appears in all three allowlists and every POST control disables
under read-only; AC: each card in a seeded test inbox is approvable/declinable/parkable
by keyboard alone and by mouse alone; AC: the seal confirm layer takes initial focus on
Cancel; AC: a decide POST with a stale `cardRevision` renders the §4.4 refresh copy, one
whose `cardId` no longer derives renders the FM-13 replacement, and N sequential decides
against one derive produce zero 409s (the per-card pin, §03.2);
AC: a seeded guard train renders the three-step fixture-lane strip (no trial-build or
comparison sentences) and the fixture-lane Update Report block; AC (Phase 2): a seeded
guard train at `ready` renders the "Approve this update" button, its one-confirm layer
takes initial focus on Cancel, and confirming posts `POST /api/v2/admissions/:id/admit`
and renders `admitted` — with no sign panel present before D14; AC: a reverted train
renders the §4.8 "Reverted" state and its returning cards carry the revert notice
(the 06 `trainRunner.revert.test.ts` contract, exercised through this screen).

---

## 05. Cadence, gauntlet & baseline choreography

**This section owns V7 (train flavors and single-flight) and V8 (cycle choreography and
merge-first-sign-once), and it is where the plan pays determinism's bill in full.** Every
data change moves `layerFingerprint`, every fingerprint move invalidates the signed
baselines, and every invalidation demands an independent human re-approval — so the unit of
change here is not "a vote's edit" but a **train**: one sealed batch of approved cards, one
branch, one PR, one Admission Report, one baseline regeneration, one post-merge signing
event. Batching is not a convenience; it is what makes "sign once" arithmetically possible
(§5.5). The card mapping that fills a train is section 03's; the inbox where cards are
approved is section 04's; the per-stop-reason recovery paths are section 06's. This section
defines what happens between "Start the update" and "Live".

Register note: this is a mechanism section. The handful of quoted copy strings ship on
Jesse-facing surfaces and stay in plain language; everything else here is written for the
implementer and the successor's operator, with exact commands and citations.

---

### 5.1 The cycle, end to end

One **cycle** = review the inbox → approve cards → "Start the update" seals a train →
machine runs unattended → one plain-language **Update Report** → one signature → one draft
PR → one human merge → post-merge signing of baseline approvals (V8). The human budget is
the Part-3 contract: **≤ 15 minutes active per cycle (inbox ~10 min, Update Report + sign
~4 min, merge ~1 min); machine time between is 30–90 minutes unattended** — candidate build
+ two gauntlet runs + admission worktree rebuild + verify are heavy, and the plan never
promises "instant". Guard trains (§5.2) skip the candidate build, comparison, and baseline
regeneration; they usually finish inside three quarters of an hour — roughly doubled while
every train still pays the pre-D12a base-commit control run (§5.5 gap 3; 08 §8.4) —
matching 04 §4.5's shipped copy, never described as faster.

Train states are the closed set from V5 — `open → sealed → built → measured → ready →
admitted → pr-open → live`, or `stopped(<reason>)` at any point after `sealed` — and each
state is **derived from an artifact that already exists**, never stored as a duplicate
status field (V5):

| State | Derived from (the proving artifact) | Machine step that produces the next state | Next action (labels: 04 §4.6's COPY table) |
|---|---|---|---|
| `open` | approved cards exist in `workbench/updates.jsonl` with no sealed train containing them | reviewer presses "Start the update" (`POST /api/v2/updates/train`) | approve/decline cards in the Updates inbox (04) |
| `sealed` | the seal event in `workbench/updates.jsonl`: digest over judgmentIds + cardIds + operations + replay identity (V8); the V6 staleness replay runs here once automated (Phase 4, D16 — the Phase 2–3 substitute is named in §5.2 step 1) | manifest emitted; candidate build starts (data train) or diff replay starts (guard train) | nothing to do; watch progress |
| `built` | candidate directory `workbench/.state/candidates/<cacheKey>/` with `content.db` + `candidate-artifact.json` (candidateBuilder.ts:547-549) | comparison run | wait |
| `measured` | comparison publication under the candidate directory (comparisonRunner.ts) | per-card effect attribution + prune (§5.4); candidate gauntlet; baseline regen | wait |
| `ready` | Update Report assembled; plus, data trains only, the candidate gauntlet report fresh in `eval/.runs/` (a guard train runs no candidate gauntlet — its `ready` derives from the assembled answer-sheet-only report plus the completed diff-replay preview, §5.2; its only gauntlet is admission's release run) | reviewer reads the Update Report and signs (`POST /api/v2/updates/train/:id/sign`, typed digest — from Phase 3/D14; Phase 2 guard trains use the existing one-confirm layer, §5.2) | read the Update Report, sign |
| `admitted` | admission manifest at `workbench/admissions/<admissionKey>.json` (admission.ts:45, 1448) | publish preparation | wait |
| `pr-open` | publish journal phase `draft-pr-opened` (publishPreparation.ts:37-43) | human merges on GitHub | click Merge (the one off-Study action, V13) |
| `live` | the train's squash commit reachable from `origin/main` | post-merge signing scheduled (§5.5, data trains only) | done; queries touched feed the build-change notice (V11) |
| `stopped(<reason>)` | stop event in `workbench/updates.jsonl` with a reason from the closed enum (V5) | per-reason recovery (section 06) | plain-language reason + recovery action (06 owns the copy) |

Three rules stated here once: a vote cast after seal **joins the next train, never
mutates a sealed one** (the seal digest is immutable — V8); sealing pulls exactly the
approved, non-`stale` cards at seal time, re-derived fresh from the judgment log (V10), so
a card approved seconds after "Start the update" simply waits for the next cycle; and the
Phases 0–2 **two-writer coexistence rule**, stated identically to 03 §03.1: Finish-up
remains the only fixture writer, the deriver treats compiler-written fixtures as
hash-pinned `sourcePreconditions`, and a Finish-up write landing after a seal fails at
admission as the `source-drift` stop (admission.ts:856) — recovery is a re-seal (06's
row). The reviewer-visible label for each state lives only in 04 §4.6's COPY table — the
declared single writer of train-state strings, which adopts this table's steps
one-for-one — so this table prints no rival label set; 04 owns the full copy block and
its D28 jargon check.

One schema prerequisite bounds what a train can contain: schema v1 requires every
`golden-fixture-upsert` in a manifest to target the manifest's single `fixtureId` ("must
equal the proposal fixtureId.", proposals.ts:813-817), so a train batching votes across
several queries cannot ship in one manifest until 02.7's per-operation fixture-targeting
amendment lands (02 owns that ruling; 03 requires it). Until it lands, trains are
single-query — Phase 2's first guard trains are, matching 03 — and every choreography step
below is identical either way.

---

### 5.2 Two train flavors (V7)

**Classification is derived from the manifest, deterministically — never chosen by a
caller.** Matching the two PR classes observed on main (r4 §5: #62/#63/#66 fixture-only and
identity-neutral, vs #64/#65 identity movers):

- A **guard train** is a train whose every operation is `golden-fixture-upsert`. It touches
  only `eval/golden/*.json`, moves no fingerprint, and regenerates no baseline — verified
  precedent: none of the #62/#63/#66 commits touches `eval/baselines/`, and PR #66's body
  states it outright: "Identity-neutral: no baselines, fingerprints, or J39 digests
  affected — safe to merge before or after signing." (r4 §5).
- A **data train** is any train containing at least one operation that can move a
  fingerprint: every ontology-touching operation type, **and `fixture-corpus-chapter-add`**.
  The subset file is a fingerprint input — PR #64, a fixture-corpus expansion, moved
  corpus `644b241c…` → `6450b7d7…` and layer `b24ea16d…` → `fd27c55c…` and owed the full
  sanctioned regen (r4 §5, §6) — so the "G8 fixture-input refresh" V7 names for
  subset-changing trains is, concretely, the full baseline-regeneration choreography of
  §5.5, and a subset-changing train pays it — which requires amending the candidate
  builder's corpus-identity refusal, §5.5 gap 4. (The measurable-effect *exemption* scope
  in §5.3 is unchanged — fixture-class operations only, per V7/V12 — but exemption from the
  effect requirement and exemption from baseline choreography are independent properties,
  and `fixture-corpus-chapter-add` has only the first: it is `effectExemption`-eligible but
  never `fixtureLane`, in §5.3's terms.) In practice this costs little:
  section 03's mapping derives `fixture-corpus-chapter-add` from Missing-passage votes
  whose chapter is outside the subset, and those votes almost always also derive an
  `editorial-anchor-add` — the operations travel together on a data train anyway.

**Single-flight (the serialization rule, stated in full in §5.6):** at most one train
exists in a non-terminal state, and a data train will not seal while another
identity-moving PR — from any pipeline, including sweep adjudication — is open.

#### Guard-train choreography (fixture lane)

Seal → apply operations in an isolated worktree → `npm run verify` → draft PR (V7).
Concretely, as workbench jobs (V13):

1. **Seal** (`POST /api/v2/updates/train`): re-derive cards from the judgment log, run the
   V6 staleness replay against the replay identity — automated in Phase 4 (D16); Phase 2–3
   seals record the replay identity but substitute FM-2's triad — D1's full-triple compile
   warning, the derive-time pre-check, and human review — for the automated replay —
   compute the seal
   digest, append the sealed event to `workbench/updates.jsonl`, emit the ProposalManifest
   with `proposalId = <trainId>`, and persist that manifest at once as the manifest half of
   the train's trainId-keyed admission-evidence entry (the registry below; D10's writer) —
   so a train stopped anywhere after seal, admission preview never reached, still has a
   locatable, digest-verifiable manifest (03 §03.2's join rule reads it). The digest's `judgmentIds` are 02.6's mechanical union,
   stated identically here: every sealed card's contributing judgmentIds **plus every
   effective `helpful` leaf on the same (query, target key) at seal time** — a helpful vote
   derives no card and no operation (V3), but its evidence rides the seal for provenance
   completeness (02's rule).
2. **Diff replay + admission preview**: no candidate is built. The file diffs are computed
   exactly as admission computes them today — by replaying the proposal operations against
   the hash-pinned sources (`previewStructuredYamlEdit` / canonical fixture JSON / corpus
   selection merge, admission.ts:842-883) — which requires no candidate database. The
   preview runs in the fixture lane (§5.3).
3. **Signed admission** (`runAdmission`): detached worktree at the admitted base commit
   (admission.ts:1455-1473), journaled mutation apply with between-phase audits
   (admission.ts:1286-1326), full artifact rebuild whose descriptor must reproduce the
   base identity byte-for-byte — the built-in proof of identity-neutrality
   (admission.ts:1343-1363) — then `npm run verify` plus the fixed release gauntlet
   `npm run gauntlet --workspace eval -- --require-admit --json
   eval/.runs/admission-release-report.json --release-database
   workbench/.artifact/content.db` (admission.ts:1220-1240). This release gauntlet is where
   G3 validates every new guard against the real engine — a guard train skips the
   *comparison*, never the *checks*. On today's main this run REJECTs on the standing G2/G8
   red; §5.5 gap 3's inherited-red expectation — an amendment to `runAdmission`'s verdict
   acceptance, not a runner decision — is what lets `runAdmission` ADMIT a guard train,
   writing the admission manifest publish consumes, over reds it provably inherited, and
   only those.
4. **Publish**: branch, commit, verify twice, push, draft PR (§5.7's shared tail).

State path: `open → sealed → ready → admitted → pr-open → live` — `built` and `measured`
are waypoints a guard train legitimately has no artifact for, so it never enters them; the
Update Report opens with the guard-report lead 04 §4.6's COPY block writes — that block is
the single writer of the sentence — saying in plain words that only answer-sheet lines are
written and no search result can move ("fixture lane" is the internal classification term,
§5.3 — it never ships, per the D28 jargon rule). No baseline files change; the train is safe to merge before or after any pending
signing (PR #66 precedent, r4 §5).

Phase bridge (08's D8/D14): in Phase 2 the `ready → admitted` decision is fronted by the
Study's existing one-confirm layer posting to the **existing** admit surface
`POST /api/v2/admissions/:id/admit` (already in `requiresTrustedJson`, server.ts:223; the
server signs the decisions with `WORKBENCH_ADMISSION_SIGNING_KEY`, server.ts:499 — 08 D8;
page wiring budgeted in 04 §4.9) — the typed-digest sign endpoint does not exist yet. It
ships with D14 in Phase 3 and fronts both train flavors from then on.

#### Data-train choreography (full lane)

Step 1 as above, then:

2. **Candidate build**: `runCandidateBuild` (candidateBuilder.ts:589-614) prepares the
   hash-bound source snapshot, verifies every `sourcePreconditions` sha byte-for-byte
   (candidateBuilder.ts:292-313), and invokes the only supported CLI:
   `npm run build:candidate --workspace pipeline -- --request <requestPath>`
   (candidateBuilder.ts:598-604). The builder enforces that a data proposal may move
   **only** the layerFingerprint — candidate schemaVersion/engineVersion/tokenizerVersion/
   corpusFingerprint/manifestFingerprint must equal the base's (candidateBuilder.ts:460-489)
   — which is why a chapter-add train's corpus movement needs §5.5 gap 4's narrowly scoped
   amendment before it can build.
   Output: `workbench/.state/candidates/<cacheKey>/{content.db, candidate-artifact.json}`.
3. **Comparison**: `publishComparison` (comparisonRunner.ts) runs every anchored query
   current-vs-candidate and publishes the ComparisonReport → state `measured`. Per-card
   effect attribution and pruning happen here (§5.4).
4. **Candidate gauntlet**: the exact admission argv, no variation permitted —
   `npm run gauntlet --workspace eval -- --require-admit --json eval/.runs/<trainId>.json
   --candidate-descriptor <candidatePath> --candidate-database <dbPath>` — because
   admission re-verifies the report was produced in the fixed admission mode with exactly
   these flags (admission.ts:603-616) and refuses a report older than 24 hours
   (admission.ts:627-630). If review stretches past 24 h, the machine re-runs this step;
   it is idempotent.
5. **Sanctioned baseline regen, in-branch** (§5.5): two separate runs —
   `npm run gauntlet -- --update-baseline` and
   `npm run gauntlet -- --update-ordering-snapshot` — each executed **twice and
   byte-compared** (the double-run determinism proof PRs #64/#65 established, r4 §5), with
   probe churn reported in the Update Report. Separate runs because the CLI refuses to
   combine update flags with `--require-admit`/`--json` ("review the new baseline
   separately") and refuses them against an explicit candidate/release target
   (gauntletMachineReport.ts:322-340) — the regen runs on the fixture bed in the train's
   worktree after operations are applied, so a run can never attest to the baseline it just
   generated.
6. **Update Report + sign**: the report satisfies admission's blocker that "every changed
   top-10 query must be reviewed, exactly, no extras" (admission.ts:819-832) — it lists
   every changed query with before→after in plain language; approving the report records
   per-query review coverage, with blind Compare one click away (V8). Signing reuses the
   Finish-up typed-digest pattern (V8; surface owned by 04).
7. **Signed admission**: as guard-train step 3, plus the probe-baseline / ordering-snapshot
   diffs and the deferred-signing marker with its gauntlet-expectation half (§5.5 gaps
   2–3 — the in-branch regen makes this train's own G2/G8 red a *predicted, verified*
   finding set at admission, never a waved-through failure). The regenerated baselines land
   in the PR;
   **the independent approval records are deliberately NOT written by the machine — writing
   them is the human approval act** (r4 §3; PR #64 body).
8. **Publish** (§5.7's shared tail).

State path: the full `open → sealed → built → measured → ready → admitted → pr-open →
live`.

**How admission gets its input — the evidence medium, resolving 08 D10's pointer (both
flavors):** the train runner assembles `AdmissionPreviewInput` (admission.ts:153-170) from
the sealed manifest, the comparison publication (`comparison: null` in the fixture lane,
§5.3), the candidate descriptor path (`candidate: null` likewise), and the per-query
report-approval coverage — and persists it as a train-scoped entry in the existing
admission-evidence registry, `workbench/review-data/admission-evidence.json`
(`ADMISSION_EVIDENCE_PATH`, server.ts:106), keyed by `proposalId = <trainId>`. Today
nothing in `workbench/src` writes that file — only tests author it by hand (r2 §5.1) — so
this is the registry's first-ever writer, and it writes in two moments: the **seal step
persists the manifest half** of the entry when it emits the manifest (step 1), and the
admission-preview assembly here completes the entry — so a pre-admission stop still
leaves the manifest locatable. Writing it breaks no covenant: the entry is a
machine-assembled cache of facts derivable from the sealed artifacts, never a decision
record — the signed decisions and baseline approvals remain human-only.

**Stop-time evidence pins.** At stop time the train-event writer records two OPTIONAL
fields on the `train-stopped` event (02.6's schema-v1 shape): `reportDigest` — the sha256
of the verified report a report-bearing stop rests on (`verify-failed`,
`no-measurable-effect`) — and `refusedOperationIds` — the operation ids an
`outside-allowlist`/`engineering-required` stop refused. 03 §03.2's prior-train join
verifies the located report byte-for-byte against the first, and 03 §03.8's stop
conversion reads and recompute-checks the second — recorded here at stop time so neither
ever depends on a rerun.

---

### 5.3 The fixture-lane measurable-effect exemption — exact spec

**The rule (V12, locked): measurable effect is required for data trains and exempt for
guard trains, and NO MEASURABLE EFFECT is always a stop, never a merge.** The exemption's
rationale is the PR #63 precedent, quoted because it is the ruling this spec encodes:
"'NO MEASURABLE EFFECT' does not apply: fixtures are the measuring instrument, not the data
being measured … the merge IS the ruling" (PR #63 body, r4 §5).

**Both no-effect predicates, named, and which governs where (V12):**

- The **workbench comparison predicate** governs train admission:
  `measurableEffect(report) = some query's top-10 changed OR a previously failing reference
  expectation now passes` (admission.ts:834-840), enforced by `runAdmission`'s refusal
  **before any mutation**: `if (!preview.measurableEffect) return { status:
  'NO_MEASURABLE_EFFECT', … }` (admission.ts:1441).
- The **gauntlet's three-anchor detection** governs the PR in CI as it does today: it fires
  only when the run's layerFingerprint differs from the committed rank-metrics baseline AND
  all three committed anchors show no movement (rankMetrics.ts:1389-1399). Note it
  therefore **cannot fire on a guard train at all** — a fixture-only diff leaves
  layerFingerprint unchanged — so the exemption below is needed only at the workbench
  layer, and no gauntlet change is required. (Today the rank-metrics anchor is additionally
  always "skipped — anchor missing" because `eval/baselines/rank-metrics.json` does not yet
  exist, r3 §4.4/open Q2; the plan depends on the workbench predicate, not on that baseline
  landing.)

**The named code change** (a reviewed workbench change, built and shaken down in Phase 2 —
section 08 owns the phasing):

1. `previewAdmission` computes **two derived values from the manifest itself, never from a
   caller flag** — derived, so unforgeable and deterministic:
   - `effectExemption`: non-null exactly when every operation's `type` is in the
     fixture-class set — `golden-fixture-upsert` or `fixture-corpus-chapter-add` (V7/V12).
     It governs the measurable-effect refusal (item 3) and nothing else.
   - `fixtureLane`: non-null exactly when every operation's `type` is
     `golden-fixture-upsert` **only** — the identity-neutral lane. A chapter-add manifest
     is effect-exempt but never fixture-lane: it moves the corpus fingerprint (PR #64, r4
     §5) and runs §5.2's full data-train lane.
2. For `fixtureLane` manifests only, `AdmissionPreviewInput` (admission.ts:153-170) accepts
   `candidate: null` and `comparison: null` — the diffs are already computed by replaying
   operations against pinned sources (admission.ts:842-883), the candidate adds nothing on
   an identity-neutral change, and the worktree rebuild + release gauntlet remain mandatory
   (admission.ts:1220-1240), so nothing merges unchecked. An identity-moving manifest can
   never take `candidate: null`: its `fixtureLane` is null by construction.
3. `runAdmission`'s refusal becomes
   `if (!preview.measurableEffect && preview.effectExemption === null) return
   NO_MEASURABLE_EFFECT` (amending admission.ts:1441).
4. **The admission manifest records the exemption**: `{ kind: 'fixture-class-effect',
   lane: 'fixture-lane' | 'full-lane', operationTypes: […], rationale: "fixtures are the
   measuring instrument, not the data being measured — the merge IS the ruling (PR #63)" }`
   — every exempt manifest carries its own justification and which lane it ran, auditable
   forever.

The manifest invariant travels with it (V4, restated as this lane's precondition): a
manifest containing any layer-affecting operation MUST also contain the
`golden-fixture-upsert` operations that measure it — the deriver emits them from the same
votes and **the deriver's seal-time validator** enforces it (03's placement, §03.5 step 3
— deliberately not `parseProposalManifest`, which is shared with hand-authored manifests)
— so no data operation can slip into the
exempt lane by omission: the presence of a layer-affecting op makes the manifest a data
train by definition. Section 06 owns this lane's failure modes.

---

### 5.4 Per-card measurable effect: prune the card, never block the train

**A single no-effect card must not sink a train that otherwise moves results.** The
whole-train stop (V12) is for the degenerate case; the normal case is partial, and the
choreography handles it at `measured`:

1. **Attribution is deterministic.** Every card names the queries its judgments came from
   (V11 provenance), and the ComparisonReport is per-query (`top10Changed`,
   expected-reference outcomes — admission.ts:834-840). A card **shows effect** when any of
   its queries' top-10 changed or its own expectation newly passes; otherwise it is a
   no-effect card. No model, no heuristic — a set intersection.
2. **Prune and re-seal.** If some-but-not-all cards show effect, the machine drops the
   no-effect cards' layer-affecting operations, **keeps each dropped card's fixture
   assertion in the train as `status: 'pending'`** (a pending fixture cannot fail the build
   and does not count as coverage — corpusGolden.ts semantics, r3 §2.2 — so it ships as an
   honest recorded goal, exactly the fixtures-first practice of committing the fixture
   pending-and-failing before the data exists, r3 §2.3), and re-seals. A re-seal is a
   **new seal event on the same train** — same `trainId` (hence the same `proposalId` and
   `refinement/<date>-<trainId>` branch), one more appended `train-sealed` line recording
   `resealOf: <prior seal digest>`, a fresh candidate build under a new cacheKey, a fresh
   comparison; every derived state is computed from the latest seal's artifacts, and the
   prior seal's candidate directory is superseded, never deleted. This coexists with V8's
   immutability because no sealed digest is ever edited — each re-seal is one more
   appended event, the correction-as-new-line discipline of the log it lives in.
   **Decision, stated (Claude-decidable): no hard round cap.** Each round provably removes
   at least one card, so the loop is bounded by card count; each round's cost — one
   candidate build plus comparison — is reported per-round in the train's event log and
   Update Report, keeping the cost visible rather than capped, and a one-round cap would
   convert every second prune into a whole-train stop for no bound the card count doesn't
   already give. In practice one round suffices.
3. **The pruned card's outcome, in the voter's language.** The card returns to the inbox
   `parked` — the same *derived* default 06 FM-5 specifies, computed by the deriver from
   the logged events plus the attempt's sealed operations and replay identity (03 §03.6):
   no machine-written decide event exists, the log still folds to `approved`, and the
   default lifts on a post-stop human approve or an identity move — with this outcome copy
   (ships verbatim; D28-clean):

   > "The checks found this change wouldn't alter any search result yet, so it wasn't
   > included in this update. Your call is now written on the answer sheet as a goal —
   > when a future update reaches it, the checks will announce it and hold it there. You
   > can leave it parked, or decline it."

   That promise is mechanical, not aspirational: pending fixtures run on every gauntlet
   execution, and one that starts passing is announced "PENDING FIXTURES NOW PASSING,
   promote to active" (corpusGolden.ts:1215-1300, message at corpusGolden.ts:1261); the
   promotion rides a later train's `fixture-promotion` decision slots (V4), and the card
   auto-resolves then.
4. **The whole-train stop.** If **no** card shows effect, the train stops with
   `no-measurable-effect` — a stop, not a success (V5) — and every card returns to the
   inbox with the honest explanation (V12, ships verbatim): "the checks found this change
   wouldn't alter any result — it wasn't merged; here's what that usually means". **NO
   MEASURABLE EFFECT means don't merge** — never soft-passed, never waved through
   (CLAUDE.md "Adding data"; the refusal is code at admission.ts:1441). Recovery copy and
   the routing of chronic no-effect cards (usually: the change needs a stronger concept —
   route to concept-curation) are section 06's.

---

### 5.5 Baseline choreography and merge-first-sign-once (V8)

**Every data train moves `layerFingerprint`, and any move of a bound identity invalidates
the signed baseline approvals** — G2's rules fail on
`ordering-approval-*-mismatch` / `ordering-snapshot-stale-identity` (orderingSnapshot.ts
decision table, r4 §3). So each data train owes, in-branch: the sanctioned regen
(`--update-baseline`, `--update-ordering-snapshot`), each double-run byte-identical, churn
reported (§5.2 step 5) — and owes, **after merge**, exactly one signing event.

**The ruling, cited:** merge-first-sign-once is the standing J39 ordering, stated twice in
the record — HANDOFF's first-hour plan ("approvals signed against today's main would be
invalidated the day PR #53 lands … Signing **once**, against the post-re-pin identity, is
less process and less rubber-stamp risk", HANDOFF.md:10) and PR #64's approved sequencing
call ("**Expansion-first, sign once.** The J39 approvals are signed only **after this PR
merges**, against the final identity … the approval records were deliberately **not**
rewritten — writing them is the human approval act", PR #64 body; both per r4 §4).

**Post-merge signing, one event per data train** (the governance procedure — r4 §3's six
steps, condensed to the four that remain for a train: the regen half was already paid
in-branch (§5.2 step 5), and same-batch pairing is superseded by the deferred-signing
marker (gap 2)):

1. The train merges; the identity settles on main.
2. The independent reviewer is designated **per review** (A2 — never the change author,
   never the card approver acting alone; the one recorded independence lapse is why this is
   restated, r6 §9).
3. The machine generates the read-only packet: `npm run review-packet --workspace eval --
   --before <old-baseline.json> --after eval/baselines/probes.json` (eval/package.json:13)
   — before/after top-10 per changed probe, metric deltas, the exact digests the approval
   must bind.
4. The reviewer writes a dated review record under `docs/reviews/YYYY-MM-DD-*.md` and
   **hand-authors** both v2 approval records (schema v2 is mandatory — any v1 approval
   dated after 2026-08-20 fails the gauntlet with a named finding, r4 §3), chained via
   `priorProvenance`, as a small hand-authored PR the A1 merging human merges. This PR is
   authored outside the workbench pipeline on purpose: no code path in the repo authors an
   approval, and none will be added (r4 §3).

**The honest consequence, stated plainly (V8):** a continuous stream of data trains would
keep the approval window open forever — the sign-once target moved four times in ~11.5
hours during active curation (r4 §6). Single-flight plus train batching is precisely what
makes "sign once per train" real rather than "sign never". Between a data train's merge and
its signing, the branch-side and main-side gauntlets read G2/G8 red on
approval-identity mismatch **by design** — before merge, at admission, that designed red is
gap 3's verified expectation; after merge it is CI triage on the required checks. The
Update Report carries the triage exactly as PRs #63–#66 did ("verified byte-identical on
clean origin/main", r4 §5 item 8), and the merging human sees in plain words: "Two checks
will show as failing until the independent sign-off happens after this update goes live —
that is the designed order, not a defect."

**Standing precondition (the Part-3 identity facts, acknowledged here once per V8):** main
is `0d12c34`, engine 0.14.0, corpus `6450b7d7…`, layer `fd27c55c…`; the committed
descriptor is still the stale v0.7.1 phantom; and the J39 approvals are **still unsigned —
v1 records pinning engine 0.9.0** (r4 §3). The debt predates this plan, and for this
pipeline its effect is a **hard block, not a tax**: the standing red makes the in-worktree
release gauntlet REJECT, and runAdmission's report parser "admits only ADMIT /
ADMIT_WITH_WARNINGS" (comment verbatim, admission.ts:580-584) — so **no data train can
pass `runAdmission` at all until the first J39-class signing lands** (06 FM-8 states the
same block; the recent hand PRs could pay the red as mere triage only because they never
went through runAdmission). That first signing is therefore a **Phase 3 prerequisite**,
sequenced before the first data train's admission (08 sequences Phase 3 accordingly): one
hand-authored governance PR, the numbered procedure above run against settled main,
clearing the historic debt. It rides no train and clears no train's own regen. From the
first data train onward, each train's own designed red is handled by the deferred-signing
marker's gauntlet-expectation half (gaps 2–3), and each merged data train owes exactly one
post-merge signing as stated above. Guard trains proceed meanwhile: identity-neutral, they
inherit the standing red rather than cause it, and gap 3's inherited-red expectation is
what lets their admissions pass — manifest written, draft PR opened — over provably
inherited reds, exactly how #62/#63/#66 merged.

**Four named gaps in existing machinery this choreography requires closing** (reviewed
changes — gap 3's guard-train half, the inherited class, lands in Phase 2 with D8/D9; the
rest in Phase 3 —
named honestly because the paved road does not exist yet; the admission pipeline has never
run end-to-end in anger and Phase 2/3 include its shakedown, r2 open Q2):

1. **The publish allowlist omits the ordering snapshot and its approval.** Allowed paths
   today are `ontology/concepts/*.ya?ml`, `eval/golden/*.json`,
   `eval/baselines/probes.json`, `eval/baselines/probes.approval.json`,
   `pipeline/fixtures/web-subset.json` (publishPreparation.ts:28-34) — a data train's
   regenerated `eval/baselines/ordering.snapshot.json` could not be published. Fix: add
   `eval/baselines/ordering.snapshot.json` **and**
   `eval/baselines/ordering.snapshot.approval.json`, only as a pair (08 D12b's
   paired-travel AC), mirroring the probes pair already on the list. The approval path is
   ruled on explicitly: **no train ever publishes it** — a train admission carries the
   deferred-signing marker (gap 2), and approvals ride only the hand-authored post-merge
   governance PR (the machine never writes one — What NOT to do). It enters the allowlist
   for the one path that legitimately publishes an approval, which already exists for
   probes and stays symmetric: an admission *not* carrying the marker, where the pairing
   refusal (gap 2) stands in full force and a hand-authored approval travels as admission
   *input* — exactly how `probes.approval.json` travels today through the `probe-approval`
   diff kind, path-locked to its single owned file (`appendProbeApprovalDiff`,
   admission.ts:935-948). Admission gains the two matching diff kinds: `ordering-snapshot`
   beside `probe-baseline` (`appendProbeDiff`, admission.ts:919-933) and
   `ordering-snapshot-approval` beside `probe-approval` (admission.ts:935-948) — the
   anchors 08 D12b adopts.
2. **Admission's paired-approval refusal contradicts merge-first-sign-once.** Today "a
   moved probe baseline requires its re-issued independent approval in the same batch"
   (`probe_approval_missing`, admission.ts:979-999) — written for a sign-before-merge world
   the J39 ruling superseded. Fix: for train admissions, a moved baseline may travel
   without a fresh approval when the admission manifest records a **deferred-signing
   marker** — two named identity fields, the train's **pre-regen (base) identity** that the
   standing schema-v2 approvals bind and the **expected post-merge identity** the signing
   will settle on, plus the A2 designation requirement and the
   merge-first-sign-once citation — so the deferral is a recorded decision, not a silent
   skip. The refusal stays fully in force for any admission *not* carrying the marker.
   This amends only the pairing refusal; the marker's second half — the gauntlet-verdict
   expectation — is gap 3.
3. **Admission's gauntlet-verdict requirement contradicts both the standing red and
   merge-first-sign-once's designed red.** Two reconciliations, both amendments to
   `runAdmission`'s report acceptance — "admits only ADMIT / ADMIT_WITH_WARNINGS"
   (admission.ts:580-584, enforced at admission.ts:675-698) — and both, with §5.3's
   fixture-lane exemption, members of the plan's **three** reviewed relaxations, all one
   kind of change: *which admission verdict applies*, in admission code, recorded in the
   manifest. This classification is declared here as the contract: 06.1 rule 2's taxonomy
   counts three admission-code changes and quotes §5.2 step 3's "an amendment to
   `runAdmission`'s verdict acceptance, not a runner decision" as the guard mechanism's
   characterization; 06 FM-8 carries the same framing; and 09 §09.2's guard-lane wording
   follows it ("what lets `runAdmission` admit guard trains — manifest written, draft PR
   opened", never "a runner decision about opening a draft PR" — that earlier §5.5
   framing is superseded, because only an admission-code acceptance change can write the
   manifest §5.7's publish consumes). The gates keep reporting red; what changes is that
   a red becomes a *classified* or *predicted* finding instead of an unexplained failure.
   - **Guard trains — control-run inherited-red expectation** (specified here; 06 FM-8
     owns its failure modes. Phase 2, riding D8/D9 — without it no guard train can admit
     on today's red main; 06 FM-8's blanket Phase-3 placement is amended to this split,
     which 06/08 adopt): for a guard-train admission, the accepted release-gauntlet
     outcome becomes ADMIT / ADMIT_WITH_WARNINGS **or REJECT whose every finding — same
     `(gateId, categoryCode, subjects)`, the fields report verification already checks
     (admission.ts:686-691) — is reproduced by a verified control run at the train's base
     commit**. The control run is mechanical: a second detached worktree at the base
     commit with no train operations applied, the same artifact rebuild admission already
     performs (admission.ts:1455-1473, 1343-1363), then the identical fixed release
     argv writing `eval/.runs/<trainId>-control.json`; the control report passes the same
     verification as every admission report — confined `eval/.runs/` path
     (admission.ts:555-560), schema-exact, freshness-bounded (admission.ts:627-630) —
     before its findings are compared. When every red is inherited, `runAdmission` ADMITs
     and writes the admission manifest recording **both finding sets and the control
     report's digest** — exactly the manifest §5.7's publish consumes; the draft PR
     carries the triage note in its body (matching how #62/#63/#66 merged). Any
     non-inherited red refuses exactly as today and the train stops `verify-failed`.
     This mechanizes the "verified byte-identical on clean origin/main" practice every
     recent PR performed by hand (r4 §5 item 8) — never a runner-side reinterpretation.
   - **Data trains — the marker's gauntlet-expectation half** (Phase 3, the same reviewed
     change as gap 2): a data train's in-branch regen moves the baselines while its
     approvals wait for post-merge signing, so its own admission-time G2/G8 red is
     *structural*, not historical. For a train admission carrying the deferred-signing
     marker, the release-gauntlet expectation on G2/G8 is therefore not "green" but "red
     with exactly the approval-identity-mismatch finding set the marker predicts" —
     verified finding-for-finding against the marker's recorded **pre-regen (base)
     identity** field (the first of gap 2's two identity fields), never
     waived. Any other finding on those gates, any red on any other gate, and any
     admission not carrying the marker refuse exactly as today. The historic v1 @ 0.9.0
     debt deliberately does *not* match any marker's prediction (the pre-regen field
     predicts a schema-v2 approval at the train's own base identity), so the marker cannot
     smuggle the standing debt past the hard block above — the first signing must land
     first.
   Section 06 owns both mechanisms' failure modes; section 09 lists their ratification
   alongside gap 2's.
4. **The candidate builder refuses the corpus-fingerprint movement a chapter-add train
   performs.** The builder requires a candidate to move only the layerFingerprint —
   "Candidate corpus or manifest identity differs from its base identity."
   (candidateBuilder.ts:460-489, the throw verified in-repo) — but a
   `fixture-corpus-chapter-add` train moves the corpus fingerprint by definition (PR #64:
   corpus `644b241c…` → `6450b7d7…`, r4 §5). Fix, scoped as narrowly as §5.3's exemption:
   permit `corpusFingerprint` (and the consequent layer) movement **exactly when the
   proposal contains a `fixture-corpus-chapter-add` operation**, with the subset file
   (`pipeline/fixtures/web-subset.json`) hash-pinned as a verified `sourcePrecondition`
   and every other identity dimension still base-equal. This lands with Phase 3's
   data-train work — chapter-add trains are data trains (§5.2) and cannot exist earlier.

---

### 5.6 Serialization: the identity-mover queue

**The rule (V7, stated once, in full): at most one train exists in a non-terminal state,
and a data train will not seal while another identity-moving PR — from any pipeline,
including sweep adjudication — is open against main.** One identity mover is invisible to
the open-PR test and counts anyway: a merged data train whose deferred-signing marker is
unpaid — no merged approval PR yet for its declared identity — holds the seal predicate
exactly like an open identity-moving PR, so the next data train's seal refuses until the
signing PR merges (06 FM-8's unpaid-marker rule, adopted here as the third seal
precondition; it is what keeps gap 3's tolerance from compounding). Guard trains, being
identity-neutral, may seal behind an open identity mover or an unpaid marker (the PR #66
precedent: "safe to merge before or after signing", r4 §5) but still respect
one-train-at-a-time.

**Why serialization, not racing:** when two identity movers race, the second to merge owes
another mechanical baseline regen on the merged tree — the conflict is *guaranteed*,
because the baselines embed the identity triple and full probe pages. This is not
hypothetical: PR #65 hit generated-file conflicts after #64 merged, regenerated, went
`dirty` again after #63/#66 merged, and now owes a **third** regen (r4 §5); team memory
records the standing rule ("If both merge, second-lander needs one more mechanical baseline
regen"). The plan chooses serialization over racing, and says so: one queue for identity
movers, trains and sweep batches alike (V16), each deferring to whatever is already in
flight. The slot's arbiter is the A1 merging human's queue order — this plan invents no
scheduler — with 09 §09.6's stated default: a sealed data train takes the next slot ahead
of the next sweep batch. Sweep batching itself is owned by the sweep-adjudication plan
(`/mnt/project-files/plans/2026-08-27-sweep-adjudication-plan.md`); this plan only
serializes against it — shared discipline, disjoint intake (V16).

**Enforcement points, all existing:** publish preflight requires
`origin/main == expectedMainCommit == admission.baseCommit` (publishPreparation.ts:1130-1132),
so a train whose base moves after admission cannot publish stale — it goes
`stopped(main-moved)`, and re-derivation happens against the new main (the seal is
re-derived from the log, V10; never rebased by hand). A train waiting at `pr-open` under
the A1 frozen queue revalidates on main movement the same way: it **stops on `main-moved`
rather than merging stale** — a stopped train with a named reason, never silent rot
(recovery path owned by 06). Mutations are already single-flight server-side (409
`mutation_running`, r2 §5). Under the A1 frozen-queue default the practical shape is: at
most one validated train waits at `pr-open` — and while any signing debt stands, that
occupant is in practice a **guard train**, because a pre-signing data train has no
admissible path and freezes upstream at admission awaiting a signer (09 §09.1) — while
approved cards accumulate in the inbox —
a validated frozen queue of depth one plus a growing, fully-reviewable inbox, which is
exactly what prevents the pile of mutually-conflicting open PRs the #64/#65/#66 window
produced.

---

### 5.7 The shared publish tail, and what the PR carries

Both flavors end identically. Branch formula (Part 3): **`refinement/<YYYY-MM-DD>-<trainId>`**
— the existing publishPreparation formula reused verbatim, because the train's manifest
sets `proposalId = <trainId>` and the code already derives
`refinement/${date}-${proposal.proposalId}` (publishPreparation.ts:1136). Isolated worktree
under `workbench/.state/worktrees/<trainId>`, staged tree must equal the admission's
`worktreeTreeHash` before verify, after verify, and after commit (`tree_mismatch`,
publishPreparation.ts:1200-1227), verification runs twice, then push and
`gh pr create --draft` (publishPreparation.ts:1281-1307), journaled and crash-recoverable
(phases `worktree-created → … → draft-pr-opened`, publishPreparation.ts:37-43).

The PR carries, via the existing generated body (publishPreparation.ts:1049-1093): linked
cases, comparison digest and summary, probe movements, provenance and signed decisions,
gauntlet digests, the identity table (current vs candidate engine/corpus/layer), per-file
sha256 before→after, rollback bytes reference, and the sentence "This draft preparation
does not merge, release, publish an artifact, or dispatch a workflow." The train extends
that body with two attachments (Phase 3 work, section 08): the release gauntlet's
**Admission Report** — the human-readable 13-gate verdict document (report.ts) — pasted in
full, and the V11 provenance table mapping each operation to its judgments and quoted
evidence. The merging human reads one PR and sees everything: verdict, movement, provenance,
identity, rollback.

**The ceiling holds (V13, A7):** the pipeline's terminus is a draft PR. Nothing here
merges, tags, releases, or dispatches a workflow; exceeding that ceiling requires a
reviewed CLAUDE.md amendment, the owner's decision alone. Human merge is the admission
event (CLAUDE.md #1).

---

### 5.8 ENGINE_VERSION policy

**Data-only trains never bump ENGINE_VERSION — and this pipeline only ever produces
data-only changes.** The bump rule, verbatim from the source: "Any change that can alter
ordering — weights, caps, tokenizer rules, tie-breaks — MUST bump this in the same commit.
Gate G2 fails a PR whose ordering changed without a bump, so this is enforced, not merely
asked for" (engine/src/config/engineVersion.ts:7-9; the constant at engineVersion.ts:57).
The data-side corollary, verbatim from the re-pin doctrine: "**No `ENGINE_VERSION` bump.**
Ordering may only change because the data changed, and that identity moves through
`corpusFingerprint` / `layerFingerprint` — exactly what the three-identity contract is
for" (docs/source-repins.md §7, r4 §1). Every train's PR body states this explicitly, as
PR #65's did ("No engine code, no weights, no tokenizer rules, no ENGINE_VERSION bump —
layer-data change only", r4 §1).

Structurally, a train **cannot** produce an ordering-affecting code change: its writable
universe is the publish allowlist (§5.5 gap 1 included) — concept YAML, golden fixtures,
the two baseline files, the subset file; the allowlist's approval paths are never
train-written (gap 1's ruling) — and everything ordering-affecting (ranking or
tokenizer code, `eval/budgets.json` signal constants whose change *is* an ordering change
requiring a bump, schema, workflows) sits on the one-click NOT-allowlist and stays manual
forever (V15). A vote whose diagnosis needs engine code becomes an `engineering-required`
card routed to a human, never a derived operation (V15 via section 03). The backstop if
anything slips anyway is mechanical: G2's decision rule "orderings changed while the
identity triple did not → fail `ordering-changed-without-version-bump`", plus the
approval tripwire on a regenerated snapshot with an unchanged engine
(orderingSnapshot.ts:15-36, r4 §1).

One adjacent honesty note (A6): the train's gauntlet runs are also where the explanations
contract is enforced — derived expectations carry the reason assertions section 03
specifies, and G3 fails a result that ranks right for the wrong reason
("The right passage for the wrong reason is still a failure",
`G3_EXPECTED_TOP_REASON_FAMILY` / exact `Theme:` label semantics, corpusGolden.ts, r3
§2.2). Such a failure stops the train (`verify-failed`) with the gate named; recovery is
section 06's.

---

### 5.9 Release and mint interplay

**A merged train changes main; it does not ship an artifact.** Two different distances,
stated with the shipped contract sentence that governs both — "Your calls are saved the
moment you make them. They change search results only in the next reviewed update — never
while you work." (index.html:429):

- **For the voter in The Study**, "the next reviewed update" is the merged train: the
  workbench's serving artifact is rebuilt from merged main by the existing build path, and
  the queries the train touched feed the build-change notice so Jesse sees his vote land
  (V11). No copy anywhere promises anything faster (A3/B6).
- **For the three consumer apps**, nothing changes until a mint and a deliberate re-pin:
  "A new release therefore changes nothing for any consumer until that consumer
  deliberately re-pins" (HANDOFF, r5 §4). The steady-state vehicle for accumulated merged
  trains is the data-only release — an `artifact/<date>` tag with no engine bump
  (docs/implementation-plan.md:406-415; docs/plans/2026-08-14-implementation-plan.md:674).

Everything on the road from merged trains to a shipped artifact is **manual and outside
this pipeline** (V15): the first J39 signing, the G10 size-budget ruling (167.84 MiB vs the
160 MiB budget, r4 §8), the PR #61 `--release-tag` workflow fix, the mint workflow, the
reviewed descriptor PR, and the tag push that *is* the release decision. This plan's only
interaction with release cadence is the pre-mint train recommendation in §5.10 — run a
cycle before a planned mint so approved cards ship in it — and one scope boundary: trains
never touch `eval/battery/`, so the future rank-metrics baseline (which binds
`batteryJudgmentsSha256` and reopens on any battery-judgment change, r4 §3) is **not**
reopened by vote cadence; Study judgments live in `workbench/judgments.jsonl`, a different
substrate entirely. Release minting and its runbook are owned by HANDOFF, not this plan
(F6).

---

### 5.10 Recommended cadence

**On-demand, via the "Start the update" button, with a suggested weekly rhythm** (the
Part-3 contract). No cron, no schedule that can rot: the button is the trigger, and the
Updates screen *suggests* pressing it — a banner appears when **8 or more approved cards**
are waiting, when **7 days** have passed since the last `live` train with any approved card
waiting, or when a mint is planned (the pre-mint train). The 8 and 7 are stated defaults in
this plan, Claude-decidable and revisable in section 09's decision list — they are UI
nudges, not gates, and deliberately not `eval/budgets.json` thresholds (a threshold that
never fires reads as protection — CLAUDE.md gate discipline; these fire visibly or not at
all).

**Why this cadence, against the people who will actually run it:**

- *Jesse's availability*: he merges within hours when present (five Study PRs across ~2
  days, r6 §1) but announced "only a couple more days left" on 2026-08-25 (r6 §4). A fixed
  schedule assumes presence; a button plus a nudge assumes nothing. When he has ten
  minutes, the inbox is reviewable in ten minutes; when he has none, votes and approvals
  accumulate losslessly.
- *The successor reality*: under A1's default, a train runs to `pr-open` and freezes as a
  validated draft PR — checks run, Update Report complete, provenance bound — until the
  successor-governance plan designates the merging human (A1). On-demand cadence means the
  frozen state is a deliberate parking position, not a backlog of failed schedules.
- *The economics of batching*: each data train costs 30–90 unattended machine minutes and
  exactly one post-merge signing event (§5.5). Weekly batching caps the signing ask at
  roughly one per week; per-vote trains would multiply signings and reopen the r4 §4
  spiral where the sign-once target never stops moving. Batching also gives the
  measurable-effect predicate a fair chance: several small operations that individually
  might move nothing jointly move something — and whatever still moves nothing is pruned
  per-card (§5.4), not merged.

**What each cycle costs whom** (house cost table; contract numbers from Part 3, everything
else an estimate until Phase 3's shakedown measures it):

| Step | Who pays | Time | Basis |
|---|---|---|---|
| Inbox review (approve/decline/answer cards) | reviewer (A2) | ~10 min | Part-3 contract; estimate — cards are self-contained by grammar (V9), no lookups |
| Update Report read + typed-digest sign | reviewer (A2) | ~4 min | Part-3 contract; estimate mirroring the shipped Finish-up signing flow (V8) |
| Merge the draft PR on GitHub | merging human (A1) | ~1 min | Part-3 contract; the one off-Study action (V13) |
| **Total active human, per cycle** | | **≤ 15 min** | **Part-3 contract** |
| Seal + staleness replay | machine (workbench job) | ~1–5 min | estimate; replays contributing queries against the serving artifact (V6) |
| Candidate build + comparison (data trains) | machine | ~10–30 min | estimate; full candidate DB build (`--max-old-space-size=8192` pipeline CLI) + per-query comparison |
| Candidate gauntlet + baseline regen ×2 double-runs | machine | ~10–30 min | estimate; 1 admission-mode run + 4 fixture-bed runs (2 flags × 2 byte-compare runs, §5.2 step 5) |
| Admission worktree rebuild + `npm run verify` + release gauntlet | machine | ~15–40 min | estimate; the heaviest step (full artifact rebuild + full suite, admission.ts:1191-1240) |
| **Total machine, per data train** | | **30–90 min unattended** | **Part-3 contract** — the governing band, which Phase 3's shakedown must confirm; the four machine-step ranges above are independent worst cases whose 36–105 sum deliberately over-covers it, not addends of it (guard trains: no candidate, no comparison, no regen — usually inside three quarters of an hour, roughly **doubled** by the base-commit control run every train pays until D12a's first signing clears the standing red; 08 §8.4, and 04 §4.5's shipped copy states the same) |
| Post-merge baseline signing (data trains only) | independent reviewer (A2 — a *different* person) | ~20–40 min | estimate; the §5.5 four-step signing procedure (condensed from r4 §3's six-step original): packet read, review record, two hand-authored v2 approvals |
| Stop-reason triage when a train stops | implementer / successor operator | ~5–30 min | estimate; per-reason recovery paths in section 06 |

**The per-train operation cap, proposed from this table's review-minutes math** (06 FM-6
owns the enforcement shape: a seal-time refusal, never a silent trim; a refused seal
offers "start with the first ⟨N⟩" and cards past the cap stay `approved` for the next
train). The binding constraints are the ~10 inbox minutes at roughly 45 seconds per
self-contained card (≈13 cards) and the ~4 report minutes at roughly 15 seconds per
changed query honestly compared (≈16 changed queries). Proposed arming number: **24
operations per train** — about 12 cards at the typical 1–2 operations per card (fixture
assertion plus the anchor op that travels with it, §5.2). **Shipped state — stated
identically in 06 FM-6 and in 09 §09.9's cap entry: the cap ships deliberately unset with
the refusal off, and unattended it stays unarmed — the seal never
refuses on count until an arming PR merges.** 24 is a proposal, never a default in force:
the review-minutes math above is a derivation, not a measured basis, and per CLAUDE.md's
threshold rule a guessed threshold that never fires reads as protection. Until it is
armed, the seal preview shows the operation and changed-query counts, and FM-6's interim
backstops hold (single-flight; the unreviewed-movement refusal, admission.ts:830).
**Arming the cap — at 24, or at whatever number D11/D15's measured shakedown supports —
is the reviewed change carried on section 09's decision list.** Unlike the 8/7 nudges
above, the cap is a reviewed number in the
budgets-are-data spirit, because it gates a seal rather than suggesting one.

The asymmetry is the point: the reviewer's fifteen minutes buy 30–90 machine minutes of
evidence, and the only recurring second-human cost — the signing — is exactly one event per
data train, which is the entire argument for trains.

---

### What NOT to do (each prohibition names its covenant rule)

- **Never merge on NO MEASURABLE EFFECT, and never reclassify a data train to dodge the
  predicate.** "NO MEASURABLE EFFECT means don't merge. It is not a soft pass" (CLAUDE.md
  "Adding data"); the refusal is code (admission.ts:1441) and the fixture-lane exemption is
  derived from operation types, never asserted.
- **Never combine baseline-update flags with `--require-admit`/`--json`, and never point
  them at a candidate.** The CLI refuses ("review the new baseline separately",
  gauntletMachineReport.ts:322-340) — a run must not attest to the baseline it generated.
  Determinism covenant (CLAUDE.md #2).
- **Never let the machine write an approval record.** Writing it IS the human approval act
  (r4 §3); a machine-written approval is a guardrail turned decoration (CLAUDE.md gate
  discipline) — and the one recorded independence lapse (r6 §9) is why A2 keeps the signer
  distinct.
- **Never hand-edit `eval/baselines/*` in a train branch.** Only the sanctioned regen
  flags produce them, double-run byte-identical; hand edits break the priorProvenance
  chain G2's tripwire audits (orderingSnapshot.ts:25-36).
- **Never bump — or fail to bump — ENGINE_VERSION from this pipeline.** Data-only trains
  don't bump (docs/source-repins.md §7); ordering-affecting changes are on the
  NOT-allowlist and become `engineering-required` cards (V15). CLAUDE.md #2.
- **Never seal a second train, or a data train behind an open identity mover.**
  Single-flight (V7) is the countermeasure to the PR #65 regen spiral (r4 §5), not luck.
- **Never merge, tag, release, or dispatch beyond the draft PR.** The ceiling (V13) is
  guarded in code and doc-test (r2 §8); exceeding it is a CLAUDE.md amendment, the owner's
  decision alone. CLAUDE.md #1: human merge is the admission event.

---

## 06. Failure modes & safeguards

**This section exists so that the system that lets one vote kill a harmful result can never let one bad vote — or one crash, or one absent human — harm anything.** The bar the whole plan is built to (stated in §01, restated here because every safeguard is measured against it): a harmful result like the old "it is well with my soul" → Jer 4:10 dies from **one vote → one cycle**: Not relevant vote → derived mustNotRank guard + (if editorial-owned) anchor fix → guard/data train → merged. The manual path took ~7 days and two grading cycles. One honest asymmetry, exactly as §1.5 states it: when the cause is engine scoring code — the real it-is-well cause, fixed by engine PR #36 — that same one cycle merges the guard and routes the fix to engineering (the `engineering-required` row below); the kill itself waits on the engine fix, and the card says so plainly. A pipeline fast enough to do that in one cycle is also fast enough to do damage in one cycle unless every failure path fails closed, loudly, and recoverably. This section enumerates the failure modes, and for each one: how it is detected, which safeguard stops it, how the reviewer recovers, and the test that proves the safeguard is real. It owns V12's no-effect policy surface and the per-stop-reason recovery copy; the per-dimension staleness policy is owned by §02.5 (§05 owns its seal-time choreography; this section owns only the recovery copy), train flavors and single-flight are V7 (§05), conflict policy is V10 (§03).

### 06.1 The stance: three rules every safeguard follows

1. **Every failure is a named stop, never a guess.** A train that cannot proceed enters `stopped(<reason>)` with a reason drawn from the closed enum in V5 — verbatim the one-click plan's set (`conflicting-judgments`, `stale-artifact-identity`, `protected-expectation-regressed`, `unreviewed-top10-movement`, `outside-allowlist`, `provenance-ambiguity`, `engineering-required`, `g8-baseline-moved-needs-independent-approval`, `no-measurable-effect`, `main-moved`, `source-drift`, `verify-failed`, `required-check-failed`, `github-unavailable`). No new reasons are minted; a situation that fits no reason is a design bug, not a new enum entry. The enum token appears in logs, the machine record, and the Advanced door only; what the reviewer sees on the Updates screen is the plain-language sentence in the table below, which ships verbatim.
2. **Gates fail closed, and "cannot run" is never "pass".** CLAUDE.md's gate discipline is already code: a required gate reporting `not-applicable` makes the verdict REJECT (`eval/src/report.ts:52-64` — required not-applicable and any fail both force REJECT, and REJECT outranks NO_MEASURABLE_EFFECT outranks warnings). The train runner adds nothing on top of the gates and removes nothing: it reads verdicts, it never reinterprets them. The **three** reviewed relaxations in this plan are each specified in §05, ratified as an owner decision in §09's list, and all three are the same kind of change: **admission-code amendments to *which admission verdict applies***, rationale recorded in the admission manifest, none a runner-side override — the gates themselves are untouched and keep reporting red. They are: the fixture-lane measurable-effect exemption (V7/V12, §05 §5.3); the deferred-signing marker amending the approval-pairing refusal together with its gauntlet-expectation half (§05 §5.5 gaps 2–3); and the guard-train control-run inherited-red classification — an amendment to `runAdmission`'s report acceptance (§05 §5.5 gap 3): the accepted release-gauntlet outcome becomes ADMIT / ADMIT_WITH_WARNINGS, **or REJECT whose every finding — same `(gateId, categoryCode, subjects)` — is reproduced by a verified control run at the train's base commit**, in which case `runAdmission` ADMITs and writes the admission manifest recording both finding sets and the control report's digest. In §05's words, adopted verbatim: "an amendment to `runAdmission`'s verdict acceptance, not a runner decision — is what lets `runAdmission` ADMIT a guard train, writing the admission manifest publish consumes, over reds it provably inherited, and only those" (§05 §5.2 step 3). Each has its own failure modes covered in FM-8.
3. **Nothing is destroyed by a failure.** Votes are append-only (`workbench/src/judgments.ts:849-878` — `submit()` "Validates, stamps, and appends exactly one line. Never rewrites."; a failed append never strands later submissions behind a rejected tail). Card and train decisions are append-only in `workbench/updates.jsonl` (V5, same discipline). Repository mutations go through the crash-recoverable mutation journal (`workbench/src/applyJournal.ts`, schema v2, with built-in crash-injection hooks — `applyJournal.ts:69,130,767`). Every admitted change carries per-file rollback bytes in its admission manifest (`workbench/src/admission.ts:287, 1525`). A failure can cost time; it cannot cost a vote, a decision, or a recoverable repository.

### 06.2 Stop reasons: what the reviewer sees, what recovers each

This table is the single owner of per-reason recovery copy (quoted copy ships verbatim; it contains no fingerprints, digests, or gate names, per the D28 jargon rule). Section 04 owns where these sentences render; §05 owns the choreography that raises them.

| Stop reason (internal token) | What the reviewer sees (ships verbatim) | What recovers it | Enforcing mechanism |
|---|---|---|---|
| `conflicting-judgments` | "Two of your calls disagree about the same passage for this search. Nothing was chosen for you — open the conflict card and pick which call stands." | Decide the conflict card (V10); the pick is recorded as a superseding vote, then re-seal. | The shared selection core hard-errors on conflicting assertions (conflicting windows, overlapping expected+forbidden, contradictory prefer pairs — `workbench/src/compileJudgments.ts:573-669`); the deriver surfaces the error as a conflict card instead of failing the run (V10). Reachability, stated honestly: conflicts block the *query*, not the train (§03.7) — a conflicting pair never boards, and the seal's fresh re-derivation from the log (V10) catches a conflicting vote landing between derive and seal, so this train-level stop is defense-in-depth, in practice unreachable like `provenance-ambiguity` below. |
| `stale-artifact-identity` | "The search data changed while this update was being prepared. Each affected call was re-checked; the ones that need a fresh look are back in your inbox." | Re-confirm the flagged calls; re-confirmation is a fresh vote and derives normally next cycle. | Seal-time replay per V6 — automated only from Phase 4 (D16); in Phases 2–3 the enforcing mechanism is the derive-time identity pre-check (`sameIdentity`, `inboxSources.ts:59-63` — it sets no `stale` flag: the observation-bound remainder derives as a `re-confirmation` card, which never boards a seal, while an identity-moved `irrelevant` vote's guard still derives on an ordinary approvable card, §03 §03.5) plus D1's full-triple compile warning and human review at seal (§03/§08; see FM-2's phase note). Materially-changed cards route to the existing `stale-judgment` review source (`workbench/src/inboxSources.ts:165-182`; a first-class case source, `workbench/src/judgments.ts:31-39`). |
| `protected-expectation-regressed` | "This change would break an answer the answer sheet already protects. It was stopped before anything shipped — the report shows which answer." | Decline or park the offending card; if the protected answer itself is wrong, that is a curation decision, never an automatic edit. | Admission comparison blockers fail on any regressed query verdict or inherited expectation failure (`workbench/src/admission.ts:819-832`); G3 holds the fixture side. |
| `unreviewed-top10-movement` | "This change moves results nobody has reviewed yet. Open the Update Report to look at each one, then continue." | Review every changed query in the Update Report (V8); approval is recorded per query. | "Changed top-10 comparisons require exact review coverage" — reviewed set must equal changed set, no extras (`admission.ts:830`). |
| `outside-allowlist` | "Part of this change touches files this system is not allowed to edit on its own. That part was set aside as a job for engineering, with your calls attached." | The card converts to a `needs-engineering` card at the next derivation — §03 §03.8's stop-conversion, reading the stop event's `refusedOperationIds` plus the located sealed manifest, recompute-verified (V15); an engineer handles it as an ordinary reviewed PR outside this pipeline. | Publish path allowlist + forbidden-path regex (`workbench/src/publishPreparation.ts:28-35`); the deriver refuses to emit such operations in the first place (§03). |
| `provenance-ambiguity` | "The system could not tell which of your calls asked for part of this change, so it stopped rather than guess." | Re-derive after the linkage is repaired; in practice unreachable, because an operation without confirmed provenance cannot be constructed. | The proposal parser rejects any provenance except `{source:'editorial', confirmed:true, reviewer, evidence}` (`workbench/src/proposals.ts:314-324`); admission refuses unless linked cases exactly equal the proposal's `caseIds` (`admission.ts:1444`). |
| `engineering-required` | "This needs a code change, not a data change. It was written up for engineering with your calls attached." | The card converts to `needs-engineering` at the next derivation per §03 §03.8's stop-conversion (the stop event plus its pinned outcome artifacts); an engineer picks up the card's write-up; the vote stays on record and its fixture guard still derives where applicable (§03.8's per-arm rule). | V15's not-allowlist; the deriver's refusal-to-derive path (§03) routes instead of dropping. |
| `g8-baseline-moved-needs-independent-approval` | "This update moved the reference measurements the checks compare against. An independent person has to approve the new ones — the update waits as a draft until they do." | The A2-designated independent reviewer authors the approval records after merge (merge-first-sign-once, V8). Approvals are never machine-written. | The machine writes only candidate baselines, never approvals (`eval/src/gauntlet.ts:806-819` per r4 §3); G2/G8 fail without a valid independent approval; the paired baseline/approval rule is enforced at preview time (`admission.ts:979-999`). |
| `no-measurable-effect` | "The checks found this change wouldn't alter any result — it wasn't merged; here's what that usually means." Followed by: "Usually the problem was already fixed by an earlier update, or the change is real but too small to move anything yet. Your calls are still on record." | Cards return to the inbox carrying the stop; see FM-5 for the anti-loop rule. **NO MEASURABLE EFFECT means don't merge** — it is a stop, not a success. | Two independent predicates, and the plan states which governs where (V12): the workbench comparison predicate (`admission.ts:834-840` — some query's top-10 changed or a failing expectation now passes) gates train admission and returns before any mutation (`admission.ts:1441`); the gauntlet's three-anchor detection (`eval/src/gates/rankMetrics.ts:1389-1400`) gates the PR in CI, exactly as today. Guard trains are exempt per V7 ("fixtures are the measuring instrument, not the data being measured … the merge IS the ruling" — PR #63, r4 §5). |
| `main-moved` | "Other work was merged while this update was running. It will be rebuilt against the newest version before it continues — nothing was lost." | The train stops and **the seal is re-derived from the log against the new main** (§05 §5.6, V10 — never rebased by hand); decisions are preserved in `updates.jsonl` and re-attach by `cardId`. The re-run choreography then includes the mechanical baseline regen for a data train only (the second-lander cost, r4 §5); a guard train has no regen and simply revalidates. | `runAdmission` fails when `refs/heads/main` no longer equals `expectedMainCommit` (`admission.ts:1408` — `'main moved after admission review.'`); publish preflight has the same stale-main refusal (`publishPreparation.ts:1130-1132` per r2 §4). Single-flight (V7) makes this rare rather than constant. |
| `source-drift` | "A file this update was built from changed underneath it. The update stopped and will be rebuilt from the current files." | Automatic: re-derive and rebuild from the current bytes. | Every touched file is hash-pinned in `sourcePreconditions` and byte-verified before build (`workbench/src/candidateBuilder.ts:292-313`); admission re-detects drift when replaying operations (`admission.ts:856`). |
| `verify-failed` | "The checks failed. Nothing was written. The report names which check and shows why in plain words." | Read the Update Report's gate table; typically decline/park the offending card, or the card converts to `needs-engineering` at the next derivation (§03 §03.8's stop-conversion, keyed to the stop event's `reportDigest`-pinned verified report). See FM-8 for the standing-red distinction. | `npm run verify` + release gauntlet run inside the isolated admission worktree (`admission.ts:1220-1240` per r2 §3.3); publish runs verification twice more (`publishPreparation.ts:1210, 1228` per r2 §4). |
| `required-check-failed` | "The final checks on the draft did not pass. The update waits as a draft — nothing merges until they do." | Triage against the known standing red classes (V8's J39 precondition) or fix the real failure; the merge decision stays human either way. | GitHub required checks `verify (ubuntu-latest)`, `verify (windows-latest)`, `cross-platform ordering (G2)` (one-click doc:296-298, r5 §3); the train reports them read-only. |
| `github-unavailable` | "GitHub could not be reached. Everything is saved locally, and the exact next step is written on the update's card — nothing was lost." | Retry when connectivity returns; the publish journal resumes from its recorded phase. | When `gh` is unavailable the exact command is returned as a `safeNextActions` string instead of failing silently (`publishPreparation.ts:1281-1307` per r2 §4); journal phases `worktree-created → … → draft-pr-opened` resume idempotently (`publishPreparation.ts:37-43`). |

Every non-terminal train state has a defined next action on the Updates screen (state → surface mapping is §04's; the recovery sentences above are the copy those surfaces ship). Token convention, carried identically here, in §03 §03.8, and in §09: `engineering-required` and its sibling reasons name *stop events* in V5's closed enum — the discovery; `needs-engineering` names the *card kind* the next derivation converts the discovery into — the routed follow-up; the two map one-to-one through the conversion.

### 06.3 Failure modes, enumerated

Each failure mode names its detection, safeguard, recovery, and the test that proves it. Test files are Phase-1–3 deliverables (§08 owns phase placement); tests marked *(exists)* are already in the repo.

#### FM-1 — Vote gaming, bad faith, and accidental vote floods

- **Today's exposure is deliberately small.** The workbench accepts votes from exactly one trusted curator: mutation POSTs must be same-origin localhost JSON (`workbench/src/server.ts:183-205`), the reviewer is the static `WORKBENCH_REVIEWER` env, default `"jesse"` (`server.ts:97`), and every vote must target a passage actually present in a digest-pinned review snapshot — a vote cannot name a result the reviewer never saw (`judgments.ts:499, 509-518`; snapshot required or 409 `review_snapshot_required`, `server.ts:577`). There is no remote surface to game.
- **Detection (accidental flood):** the derive step counts contributing judgments and cards per seal; the seal preview always shows the counts, and a derivation whose card count exceeds the seal cap — once §09's reviewed decision arms it; the cap ships unset (FM-6) — refuses to seal and says so in plain words. A burst of same-target votes collapses to one leaf anyway: supersession keeps only the active call per target (`compileJudgments.ts:196-233`).
- **Safeguard (future vote import):** if any future source of votes beyond the workbench reviewer is ever admitted (a second curator, an external vote corpus), it enters through the provenance-gate pattern that already exists for vote-seeded battery rows: a registered source id mapped to a pinned manifest, every derived row carrying the snapshot sha, fail-closed both directions — unrecognized source, missing/mismatched sha, or a non-vote row carrying the field are all findings ("vote-seeded grades must be re-derived (and re-reviewed) on a re-pin, never carried across one" — `eval/src/gates/judgmentProvenance.ts:46-48, 158-170`). The deriver enforces the same rule at its mouth: a judgment whose `reviewer` is not the configured workbench reviewer and whose `source` is not a registered vote source derives nothing and surfaces as a refused-input warning, never silently.
- **Structural backstop:** even a flood that fills the inbox touches nothing. Every derived operation requires the card's human Approve (the `confirmed: true` act, V9), every train requires the typed-digest signature (V8), and nothing merges without a human (V13, A1). The blast radius of unreviewed votes is reviewer attention, not the artifact.
- **Test:** `workbench/test/deriveUpdates.provenance.test.ts` — (a) judgment with an unregistered reviewer/source pair → zero operations, one named refusal; (b) registered-source fixture with a mismatched snapshot sha → refusal quoting the judgmentProvenance rule; (c) 500 synthetic votes on one query → cards collapse per active leaf and, with a test-armed cap (FM-6), the seal refuses.

#### FM-2 — Stale votes after corpus/layer churn

- **This is the normal path, not an edge case:** the layerFingerprint moved 4 times in ~11.5 hours during active curation (r4 §6), and 100% of the votes that exist today are stale-identity (r7 §4). A pipeline that treated staleness as exceptional would stop constantly or, worse, trust blindly.
- **Detection:** every vote carries the full identity triple, server-stamped (`judgments.ts:45-50, 197-198`), plus the digest-pinned result page the voter saw. At seal time the deriver replays every contributing query against the replay identity (V6); between cycles, the existing inbox already seeds a `stale-judgment` re-confirmation case for any effective judgment whose stored identity differs from the current artifact — "The prior judgment was made under a different engine, corpus, or layer identity." (`inboxSources.ts:165-182`), deduplicated per source+query (`inboxSources.ts:204-209`).
- **Safeguard:** §02.5's three numbered dispositions — 1 *already-achieved*, 2 *materially-equivalent*, 3 *materially-changed* — apply exactly as 02.5 defines them (02.5 is the single writer of that policy; this section adds only recovery copy). The full-triple policy supersedes the compiler's current layer-only warn-only asymmetry (`compileJudgments.ts:426-438`).
- **Phase honesty (the replay automation is D16, a Phase-4 PR — §08):** Phases 2–3 seal **without** the automated replay. Coverage in that window is exactly what §03/§08 specify: D1's full-triple compile warning, the derive-time pre-check (`sameIdentity`, `inboxSources.ts:59-63` — it sets no `stale` flag: only the observation-bound remainder derives as kind `re-confirmation`, Approve suppressed, never boarding a seal, while the split-off guard still derives on an ordinary approvable card, §03 §03.5), and human review at seal. What the window forfeits is only disposition 1's convenience: an already-achieved expectation's data op rides the train and is caught by the comparison as a no-effect card — pruned and parked per §05 §5.4 with FM-5's copy — a blunter stop in the same fail-closed direction. Nothing in Phases 2–3 derives an operation on a changed picture.
- **The unresolvable reference (02.5's `corpusFingerprint` row):** when the corpus moved, every judged reference is re-resolved through `engine.passage()` before replay (02.5); a reference that fails re-resolution derives **nothing** — evidence-only — and its card routes to re-confirmation naming the failure. The reviewer sees (ships verbatim): "The scripture text behind this call changed, and the passage couldn't be found again in the new text. Nothing was changed — your call is kept on record, and this is back in your inbox to check against the current text." Recovery: re-confirm against the current text (a fresh vote) or decline.
- **The replay identity is the workbench's *served* artifact — never the committed descriptor.** The committed descriptor is the stale v0.7.1 phantom (Part-3 identity facts); replaying against it would judge a world nobody is looking at. The guard is the existing startup rule: "The workbench judges the reviewed artifact or nothing." (`server.ts:16-17`) — startup preflights the artifact and any `artifact_hash_mismatch` / `artifact_identity_mismatch` puts the server in degraded read-only mode (`startupPreflight.ts:9-21, 37-42`) with every mutation disabled (`startup_degraded_read_only`, `server.ts:648-661` per r8 §1): no vote, no decide, no seal. Identities are stamped from the running engine, never from a client or a stored file (`server.ts:472-484`). So a fixture database or an unverified artifact structurally cannot seal a train — a seal exists only in a process serving a verified artifact, and the identity it records is that artifact's.
- **Recovery:** re-confirmation is just voting again — a fresh v2 judgment superseding nothing or superseding the stale call, deriving normally next cycle.
- **Test:** `workbench/test/deriveUpdates.staleness.test.ts` — a fixed log replayed against three synthetic identities exercising each 02.5 disposition; asserts the already-achieved case still emits its fixture guard, the materially-changed case emits a card with the `stale` flag and no data operation, and a synthetic corpus move that drops a judged reference yields zero operations plus a re-confirmation card naming the resolution failure; a degraded-read-only server refuses the seal endpoint.

#### FM-3 — Votes contradicting doctrinal guards or deny-lists

- **The rule, stated plainly: the engine never adjudicates, and neither does this pipeline.** DOCTRINAL-BASIS governs source admission, not runtime ranking, and its §4 non-criteria (baptism mode, election, gifts, gender roles, millennial views, polity — `docs/DOCTRINAL-BASIS.md:141-150`) may never be overridden by a vote: no vote can gate a source, delete a concept, or turn a "Not relevant" on a secondary-point framing into a denominational filter (A3).
- **Detection:** at derive time, any operation or vote touching a concept/anchor that intersects the flagged-pairings watchlist or a `prosperity-*` deny-list guard is detected the same way the gauntlet detects it — the deterministic DOCTRINAL RED FLAG sub-check riding G1/G4 ("a flag never flips the verdict … information for the human merge", `DOCTRINAL-BASIS.md:196-211` per r5 §7).
- **Safeguard:** such a vote becomes a **flagged human-ruling card**, never an auto-change and never auto-dropped. The card carries the evidence — the vote quoted in the voter's own words, the watchlist or guard row it touches, and what the mechanical consequence would be — and routes per A3: doctrinal framing questions go to the theology-rulings ledger; the card waits for the ruling. The most a "Not relevant" vote yields mechanically is its per-query fixture guard (`mustNotRank` for that query alone) — demotion in one search, never suppression, never a source gate (V3, A3). Card copy attributes, never adjudicates: "you marked this Not relevant", never "this verse is wrong".
- **Recovery:** the recorded ruling answers the card's question; the human decision becomes the operation's `evidence`, and only then does anything derive.
- **Test:** `workbench/test/deriveUpdates.doctrine.test.ts` — an `irrelevant` vote on a watchlisted pairing derives exactly one `mustNotRank` fixture entry plus one flagged ruling card with zero anchor/lexicon/source operations; a synthetic vote proposing removal of a deny-list guard derives nothing and routes; a copy lint asserts card text contains "you marked" attribution phrasing and no verdict language.

#### FM-4 — Collisions with hand-written fixtures

- **Detection & safeguard (exists):** the ownership rule is already enforced fail-closed — a target `eval/golden/<slug>.json` without the `"generatedBy": "workbench"` marker "is a hand-written fixture and not workbench property … Rename the query or fold the judgments in by hand." (`compileJudgments.ts:695-705`). The deriver inherits this through the shared core and detects it at derive time, not apply time: the card states the query already has a hand-curated answer sheet and routes to curation (V10) instead of emitting a `golden-fixture-upsert` against it.
- **Recovery:** a human folds the vote's assertion into the hand-written fixture by ordinary reviewed edit (the concept-curation path); the vote stays on record as the evidence line for that edit.
- **Test:** `workbench/test/deriveUpdates.ownership.test.ts` — a log targeting a query whose fixture lacks the marker → zero upsert operations against that path, one routed card; also asserts the deriver never deletes or renames any fixture it does not own.

#### FM-5 — NO MEASURABLE EFFECT loops (the same proposal re-derived forever)

- **The failure:** the deriver is pure, so an unchanged log re-derives identical operations every cycle; without memory, a train stopped `no-measurable-effect` would be rebuilt, re-measured, and re-stopped indefinitely — churning 30–90 minutes of machine time per attempt and eroding trust in the stop.
- **Safeguard:** lifecycle state prevents the loop. The stop event is recorded in `workbench/updates.jsonl` (V5) against the sealed set's digest. On the next derivation, a card whose operations are unchanged **and** whose replay identity equals the stopped attempt's defaults to `parked` — a *derived* state the deriver computes from the stop event plus the stopped attempt's sealed operations and replay identity (§03 §03.6): no machine-written decide event exists, `updates.jsonl` still folds to `approved`, and the default lifts on a post-stop human re-approve or an identity move — with the inbox showing "This was tried on ⟨date⟩ and would not have changed any result." Re-approving a parked card of this kind is an explicit human choice, and a seal containing *only* such cards at the *same* identity refuses: "Nothing here would change any result — nothing new to try yet." When the identity has moved since the stop, retry is legitimate (the world changed) and the default flips back to actionable. Rebuild waste is separately capped by the candidate cache: an identical proposal on the same base is a `CACHE_HIT`, not a rebuild (`candidateBuilder.ts:63-70` per r2 §2).
- **Recovery:** either the reviewer supersedes/declines the underlying calls, converts the stopped train's cards to a guard train (pin the expectation as a pending fixture — the honest "this is what right looks like, not yet achieved" record, promoted later by the existing pending-now-passing trigger, `eval/src/gates/corpusGolden.ts:1215-1300` per r3 §2.2), or waits for the identity to move.
- **Test:** `workbench/test/updatesLifecycle.test.ts` — seal → synthetic `no-measurable-effect` stop → re-derive at the same identity: cards default parked and an all-parked seal refuses with the named reason; re-derive at a moved identity: cards return to actionable.

#### FM-6 — Proposal storms and cap discipline

- **The failure:** bulk marking exists in The Study; one enthusiastic sitting can produce dozens of cards, and a naive seal would build one enormous train whose Update Report nobody can honestly review in the ≤15-minute budget — turning "reviewing the report IS reviewing the changed queries" (V8) into a rubber stamp.
- **Safeguard:** a per-train operation cap, enforced at seal time as a refusal, never a silent trim. This section owns only that enforcement shape (§05 §5.10 assigns it here); the number and its disposition are §05's and §09's. **Shipped state, stated identically in §05 §5.10: the cap ships deliberately unset with the refusal off.** §05's review-minutes math (~10 inbox min at ~45 s/card ≈ 13 cards; ~4 report min at ~15 s/query ≈ 16 changed queries) derives a **proposed arming number of 24 operations per train**, but a derivation is not a measured basis, and per CLAUDE.md's threshold rule a guessed cap that never fires reads as protection. **Arming the cap — at 24, or at whatever number D11/D15's measured shakedown supports — is the reviewed change carried on §09's decision list.** In the shipped (unset) state, storm control is: the seal preview's visible operation and changed-query counts, single-flight (V7 — a storm can queue cards but never queue trains), and the hard backstop that an unreviewed changed query blocks admission outright (`admission.ts:830`) — an over-large train fails loudly at `unreviewed-top10-movement`, never silently. Those backstops persist once the cap is armed.
- **Detection & recovery:** the seal preview shows the operation and changed-query counts before anything runs, at either disposition; once armed, a refused seal names the cap and offers "start with the first ⟨N⟩" — the reviewer splits across cycles. Cards left behind by a full seal stay `approved` and board the next train — approval is never lost to the cap.
- **Test:** `workbench/test/updatesLifecycle.test.ts` (cap case) — in the shipped unset state, the seal refuses nothing on count and the preview still shows both counts; with a test-armed cap, cap+1 approved cards → seal refuses, zero writes, all cards still `approved`, and a follow-up seal at the cap succeeds with the remainder intact.

#### FM-7 — Crash mid-apply, mid-admission, or mid-publish

- **Safeguard (exists, reused — nothing new invented here):** every repository write travels the crash-recoverable mutation journal (`applyJournal.ts`, schema v2), which the compile path already uses (`compileJudgments.ts:928-987` per r1 §8) and which carries deliberate crash-injection hooks for testing (`applyJournal.ts:69, 130, 767`). Admission is idempotent by construction: `admissionKey` short-circuits to `ALREADY_ADMITTED`, the worktree is always removed or quarantined (`admission.ts:1328-1341` per r2 §3.3), and the worktree is audited between every phase to contain exactly the approved mutations. Publish keeps a durable journal with resumable phases and independent proof of an existing commit on resume (`publishPreparation.ts:37-43, 1165-1190` per r2 §4). The deriver itself is a pure function — it holds no state that can be corrupted; `updates.jsonl` appends are single lines with the same discipline as the judgment log.
- **Detection & recovery:** on restart, the train's derived state is recomputed from artifacts (V5 — candidate directory, comparison publication, admission manifest, publish journal phase, merged commit); the runner resumes the earliest incomplete phase or replays idempotently. No human action is required beyond re-pressing the same button.
- **Test:** `workbench/test/trainRunner.crash.test.ts` — crash injection at each journal phase via the existing `crashAt` hook → resume completes and the final tree is byte-identical to an uninterrupted run; a killed admission resumed → `ALREADY_ADMITTED`, no second manifest.

#### FM-8 — A train's gauntlet failing

- **New red — the gates did their job.** Detection: the candidate gauntlet (`--require-admit --json`, exact admission argv, `admission.ts:603-616` per r2 §3.1) or the in-worktree release gauntlet returns REJECT. Safeguard: the train stops `verify-failed` with the failing gate rendered in plain words on the Update Report's gate table; cards return intact. Recovery: decline/park the offending card, or convert to needs-engineering. G3's reason assertions are part of this: a result that ranks right for the wrong reason is a failure the train's gauntlet catches, by covenant #5 — never waved through.
- **Standing red — the debt the train did not cause, handled per lane, never by one blanket tolerance.** The code as it stands fails closed on *any* red: the admission parser "admits only ADMIT / ADMIT_WITH_WARNINGS" (`admission.ts:580-584`) and rejects on any failed or required-unrun gate (`admission.ts:694-697`). Verbatim unchanged, that makes both lanes unrunnable: the committed G2/G8 approvals are v1 @ engine 0.9.0 against baselines at 0.14.0, so the release gauntlet reads REJECT on clean main today (the triage tax every recent PR paid, r4 §5 item 8 — those PRs could pay it as mere triage only because they never went through `runAdmission`) — and worse, merge-first-sign-once (V8) *guarantees* that every data train's in-worktree release gauntlet sees baselines it just regenerated whose independent approvals do not yet exist, so a data train would REJECT **forever**, not just until the first signing. §05 §5.5 gap 3 specifies the two lane-specific reconciliations (guard half built in Phase 2 with D8/D9, data half in Phase 3 as D12b, per §08; ratified in §09's decision list); this section owns their failure modes:
  - **Guard trains — the control-run inherited-red classification** (an amendment to `runAdmission`'s report acceptance — the third admission-code change of 06.1 rule 2; guard trains only): the accepted release-gauntlet outcome becomes ADMIT / ADMIT_WITH_WARNINGS, **or REJECT whose every finding is *inherited*** — reproduced, with the same `(gateId, categoryCode, subjects)` (the finding fields the parser already verifies, `admission.ts:686-691`), by a **control run**: the identical gauntlet invocation at the train's base commit with no train operations applied, its report passing the same verification as every admission report (§05 §5.5 gap 3). When every red is inherited, `runAdmission` ADMITs and writes the admission manifest — exactly the manifest publish consumes — recording **both finding sets and the control report's digest**. This mechanizes, inside admission code, the "verified byte-identical on clean origin/main" triage #62/#63/#66 performed by hand (r4 §5 item 8) — in §05's words, adopted verbatim: "an amendment to `runAdmission`'s verdict acceptance, not a runner decision" (§05 §5.2 step 3).
  - **Data trains — the deferred-signing marker's predicted red** (an admission-code change to *which verdict applies*, 06.1 rule 2): for a train admission carrying the marker, the release-gauntlet expectation on G2/G8 is not "green" but "red with exactly the approval-identity-mismatch finding set the marker predicts" — subjects exactly the train's own regenerated baselines, identity equal to the marker's pre-regen (base) identity field — verified finding-for-finding, never waived (§05 §5.5 gaps 2–3). This class is **structural and permanent by design**: under merge-first-sign-once every data train admits ahead of its own signing, forever — a recorded, per-train price of the J39 ruling, not a transitional debt.
  - Any red outside these two recorded classes REJECTs exactly as today. The gates are untouched and still report red; both mechanisms record their rationale in the admission manifest, and neither is a runner-side reinterpretation of a gate.
- **The hard block, per lane, honestly (the same block §05 §5.5, §08 D15, and §09.2 state).** A **data train is hard-blocked at `runAdmission` until the first J39-class signing — §08's Phase-3 entry deliverable D12a — lands.** The inherited class does not extend to the data lane, and the historic v1 @ 0.9.0 debt deliberately matches no marker's prediction (a marker predicts a schema-v2 approval-identity mismatch at the train's own pre-regen identity — §05 built it that way precisely so the standing debt cannot be smuggled past the block), so pre-signing the data lane has no admissible path at all: D15's real train is sequenced after D12a, and until then §08's exit evidence is a train honestly held at `measured`, never a claimed draft PR. From D12a onward, a data train admits with exactly the marker-predicted finding set and nothing else. A **guard train** changes no baselines, so only the inherited class can ever apply to it: it proceeds to its draft PR over provably inherited reds, carrying the triage note verbatim in the PR body (matching how #62/#63/#66 merged), and its tolerance is **transitional** — once D12a clears the historic debt, clean main is green and the inherited set is empty (D12a's own AC).
- **The unpaid-marker failure path (the deferred weakening's own failure mode).** If the deferred signing never happens, the obligation does not evaporate — it is recorded in the merged train's admission manifest and enforced at the next seal: a merged data train whose marker has no subsequent merged approval PR for its declared identity counts as an **open identity mover**, and the runner **refuses to seal the next data train** — plain words (ships verbatim): "The last update's independent sign-off hasn't happened yet. New data updates wait until it does." Guard trains still travel (identity-neutral, the PR #66 precedent). This is what keeps the tolerance from compounding: unsigned debt honestly blocks the pipeline's own throughput (06.5) instead of accumulating as ever-fresh "inherited" reds. A forged or wrong marker buys nothing: at preview time the marker's identity must equal the regenerated baselines' identity, or the existing `probe_approval_missing` pairing refusal stands in full force (`admission.ts:979-999`).
- **The fixture-lane misclassification failure mode.** The exempt lane cannot be requested — both derived values, `effectExemption` (the fixture-class set; governs the measurable-effect waiver) and `fixtureLane` (`golden-fixture-upsert` only; governs `candidate: null`), are computed from the manifest's operation types, never a caller flag (§05 §5.3 item 1), and the admission manifest records `{ kind: 'fixture-class-effect', lane: 'fixture-lane' | 'full-lane', operationTypes, rationale }` — and a layer-affecting operation cannot slip in by construction: one such op makes the manifest a data train by definition, the V4 invariant validator refuses a data manifest missing its measuring fixtures, and `AdmissionPreviewInput` accepts `candidate: null` only when the derived `fixtureLane` is non-null.
- **Test:** `workbench/test/trainRunner.standingReds.test.ts` — (a) injected G3 failure absent from the control run → stop `verify-failed` naming the gate; (b) synthetic G2/G8 approval-stale reds reproducing identically in the control run → `runAdmission` ADMITs, the manifest records both finding sets and the control report's digest, and the prepared PR body carries the triage note verbatim; (c) a post-D12a data-train report whose only reds are exactly the marker-predicted class → admitted, the classification and marker recorded in the manifest; a pre-signing data train carrying the historic v1 @ 0.9.0 red → refused at `runAdmission` (no marker matches the historic debt, and the inherited class never applies to the data lane); (d) a guard-train red absent from the control run, or a data-train red outside the marker prediction → refused before any mutation; (e) a manifest containing one `editorial-anchor-add` op presented with `candidate: null` → refused the fixture lane; (f) a marker whose identity mismatches the regenerated baselines → `probe_approval_missing` stands; (g) sealing a data train while a prior train's marker is unpaid → seal refused with the plain-words copy above.

#### FM-9 — Successor error (the wrong person doing the wrong thing innocently)

- **The design premise: the successor's surface has no dangerous verbs.** Zero-terminal steady state (V13) means the reviewer's actions are Approve/Decline/Not now, one typed-digest signature, and Merge on GitHub — every destructive or ordering-affecting capability is simply absent from the surface. The typed-digest signature ("deliberate friction — nothing is written by a stray click", the Finish-up pattern r8 §5) guards the one write; no irreversible action rides a bare keystroke (locked Study decision, V9).
- **Safeguards (each mechanically enforced):** the draft-PR ceiling is protected by a live guard test asserting the sentinel "No automation merges to `main`." stays in the governing doc and auto-merge language never returns (`workbench/test/oneClickPlanGuard.test.ts`, exists — r2 §8); publish paths are allowlisted with a forbidden-path regex (`publishPreparation.ts:28-35`); ordering-affecting things (weights, caps, tokenizer, tie-breaks) are on the not-allowlist (V15) so this pipeline structurally cannot produce a change requiring an ENGINE_VERSION bump; gate discipline means a check the successor forgot to configure reports `not-applicable` with a reason and REJECTs if required (`report.ts:52-64`) — a guardrail can rot loudly, never silently.
- **Recovery:** because everything upstream of merge is a draft PR plus append-only logs, a successor's worst innocent mistake is recoverable by declining cards, closing a draft PR, or (post-merge) FM-16's rollback path.
- **Test:** `workbench/test/trainRunner.ceiling.test.ts` — an import-graph and argv scan over the train runner (the `pipeline/test/curationBoundary.test.ts` pattern, exists) asserting no code path invokes `gh pr merge`, `git push` to `main`, tag creation, or workflow dispatch; plus the existing `oneClickPlanGuard.test.ts` *(exists)* continuing to hold the ceiling sentence.

#### FM-10 — `judgments.jsonl` (or `updates.jsonl`) corruption

- **Detection (exists, layered):** the log is strictly re-validated on every read and fails closed for the whole workbench — an invalid line makes reads throw, and the server preflights the log at startup (`judgments.ts:820-823`; `server.ts:431-436` per r1 §2.5). The three legacy v1 lines are digest-pinned per line by the migration manifest (`workbench/legacy/migration-manifest.json` `lineSha256` entries; validated fail-closed before every compilation with the stray line reported "at the exact line to delete — recoverable, not a permanent brick", `compileJudgments.ts:385-405`). The health surface independently reconciles per-line digests and reports `closed-canonical` / `stray-lines` / `not-canonical` with the recovery instruction "Restore workbench/judgments.jsonl from git history" (`workbench/src/healthSources.ts:438-521` per r7 §6). The old v1 endpoint is a method-agnostic 410 tombstone precisely because "one stray v1 append could brick compile-judgments forever" (`server.ts:1704-1714`).
- **Safeguard:** the deriver adds nothing riskier than another reader — it is read-only over both logs (V2: legacy lines are never transformed) and refuses to derive from a log that fails validation, with the exact line number in the refusal. `updates.jsonl` gets the identical treatment: append-only, strict parse-on-read, fail-closed derivation, committed to git so every state is a recoverable blob.
- **Recovery:** restore the file from git history (both logs are committed; r7 §1 verified the judgment log's blob identical across all refs); delete a stray line at its reported number; re-enter any lost call through the v2 workbench.
- **Test:** `workbench/test/updatesLog.corruption.test.ts` — a byte-flipped legacy line → derivation refuses naming the line; a stray v1-shaped append → refusal citing the migration-manifest validation; a truncated `updates.jsonl` tail line → derivation refuses and the health card shows the recovery sentence.

#### FM-11 — Server restart during review, stale previews, and mutation collisions

- **Restart during review:** review snapshots are deliberately process-local (bounded LRU-128); after a restart the next vote gets 409 `review_snapshot_required` — "Open this case and submit against its current review snapshot." (`server.ts:577`) — and the UI re-opens the case. Card decisions get the same discipline: `POST /api/v2/updates/cards/:id/decide` is addressed by `cardId` (the content address, 02.6) and carries the card's `cardRevision` — the **per-card** content pin, specified by §03.5 (which owns the decide-endpoint spec: body `{decision, answers?, cardRevision}`) and rendered identically by §04 §4.4. Per-card is semantics, not naming: §03 deliberately rules out pinning decides to the global derivation digest (every decide appends to `updates.jsonl`, so a global pin would make each approval invalidate every other pending card), and the 409 fires only when *this* card's pin is stale — decides on other cards never trigger it (§04's Decide-409 row). A revision minted before a restart that no longer derives is a 409, and the screen refetches. No decision is ever applied against a picture the reviewer is not currently seeing.
- **Stale preview:** the seal and sign steps reuse the compile pattern exactly — the client holds a preview digest, the server recomputes at apply time, mismatch is 409 `stale_preview` ("The repository changed. Create and review a fresh preview.", `server.ts:1419`) and the UI auto-refreshes with a new code, exactly as Finish-up does today (r8 §5).
- **Mutation collision:** all train phases ride the existing single-mutation lock; a second mutation gets 409 `mutation_running` ("Another repository operation is already running.", `server.ts:1010`). Single-flight at the train level (V7) sits above this: the lock prevents interleaved writes; single-flight prevents interleaved *trains*.
- **Test:** `workbench/e2e/study-updates.spec.ts` (Playwright, Phase 1/2 slices) — decide-after-restart returns 409 and the card refetches; seal with a stale digest 409s and re-previews; concurrent seal attempts: exactly one proceeds.

#### FM-12 — A vote cast mid-train

- **Rule: a sealed train is immutable; a new vote joins the next cycle.** The seal digest binds the exact judgmentIds, cardIds, operations, and replay identity (V8); nothing appended to the log after the seal can alter it — the deriver reads the log only at derive/seal time, and the running train reads only its sealed manifest. The new vote sits in the log, surfaces in the next derivation, and — if it supersedes a judgment inside the running train — FM-13's decision-time check plus the next cycle's re-derivation reconcile it. Nothing mutates a sealed train, ever.
- **Test:** `workbench/test/updatesLifecycle.test.ts` (mid-train case) — append a vote after seal → sealed manifest digest unchanged, train completes; next derivation includes the new vote and, where it supersedes a shipped call, derives the correction as a new card rather than editing history.

#### FM-13 — Approving a card whose underlying judgment was just superseded

- **Detection:** `decide` re-reads the effective-judgment leaves (the shared core, V1) at decision time. If any contributing judgment has been superseded since the card was drafted, the decision is refused with a 409 — and per 02.6's content addressing, the old `cardId` simply no longer derives: the superseded card is *replaced*, not flagged (the `stale` flag carries only 02.5's seal-time-replay meaning), and the re-derived replacement card (new leaves ⇒ new `cardId`, state `drafted`) renders where the old one stood.
- **What the reviewer sees:** "You changed your call on this since the card was written. Here is the fresh card." — the replacement card renders in place (04 §4.4's replaced-card render); nothing is silently applied on outdated evidence, and nothing the reviewer did is lost.
- **Test:** `workbench/test/updatesLifecycle.test.ts` (supersede-race case) — draft card, supersede the judgment, then decide → 409, the old `cardId` no longer derives, and the replacement card is `drafted` and reflects the superseding call.

#### FM-14 — Main moves under an open train; a train stalled at `pr-open`

- **Main moves mid-run:** stop `main-moved` (table above); recovery is §05 §5.6's, adopted verbatim: **the seal is re-derived from the log against the new main** (V10 — never rebased by hand), decisions preserved in `updates.jsonl` re-attaching by `cardId`. The re-run choreography includes the mechanical baseline regen only for a data train — the same second-lander regen PR #65 performed by hand, three times to date (r4 §5); a guard train has no regen and simply re-derives and revalidates. Serialization via single-flight (V7) is this plan's countermeasure, chosen explicitly over racing, and a data train additionally will not seal while any identity-moving PR from any pipeline (sweep adjudication included, V16) is open.
- **Stalled at `pr-open` (the C3 case):** a train at `pr-open` does not rot silently. The Updates screen shows its age and its base-vs-main status; when `origin/main` has moved past the train's expected base, the train is marked `main-moved` and its card says the update needs a refresh before merging — it revalidates or stops, **never** merges stale (the publish path already refuses a stale main mechanically, `publishPreparation.ts:1130-1132`, and GitHub's required checks stand regardless). Under A1's frozen queue this is the steady state: validated draft PRs that re-announce their staleness rather than pretending freshness.
- **Test:** `workbench/test/trainRunner.mainMoved.test.ts` — advance a fixture repo's main under an open train → state shows `main-moved` with the refresh action; the prepare step against the stale base is refused; the re-derived seal against the new main carries the same decisions (re-attached by `cardId`) and validates cleanly.

#### FM-15 — `gh`/GitHub unavailable

Covered by the `github-unavailable` row above: the journal holds the completed phases, the exact next command is surfaced as `safeNextActions` (`publishPreparation.ts:1281-1307`), and retry resumes idempotently. **Test:** covered by `trainRunner.crash.test.ts` (network-failure injection at the push and PR phases → journal phase preserved, resume completes).

#### FM-16 — A merged train later proves wrong (and the general harm ladder)

Every altitude of "that was wrong" has a defined, non-destructive undo:

| What was wrong | The undo | Mechanism |
|---|---|---|
| A single vote (mis-click) | Vote again; the new call supersedes the old. Nothing is deleted. | Append-only supersession (`judgments.ts:421-453`; UI "Undo = supersede", locked Study decision) |
| A derived card (the deriver's suggestion misses the point) | Decline with a one-line reason; the vote stays on record as history. | Card lifecycle (V5); declined reason recorded in `updates.jsonl` |
| A card's answered question (wrong theme picked) | Decline the drafted card before seal; or post-seal, treat as FM-16 below. A new decision on a re-derived card supersedes in the log; history is never edited. | V5 append-only decisions |
| A merged train | Revert PR authored from the admission manifest's per-file rollback bytes (`admission.ts:287, 1525`) — or a plain `git revert` of the squash; both are ordinary human-merged PRs. The judgments REMAIN in the log (append-only), so after the revert the affected cards return to the inbox on the next derivation unless the reviewer supersedes the underlying calls — the system tells the reviewer this rather than silently re-proposing. A reverted data train's baseline regen is itself re-run mechanically on the reverted tree. | Admission manifest rollback bytes; derived train state (a train whose commit leaves main renders as "reverted" with that explanation) |

Two harm-shaped invariants hold at every rung: scripture is demoted per-query, never suppressed (`mustNotRank` is per-query; `mustNotLead` "scripture is demoted here, never suppressed" — G3 guard semantics, r3 §2.2), and no undo ever edits history — corrections are always new lines, new cards, or new PRs. **Test:** `workbench/test/trainRunner.revert.test.ts` — revert a merged fixture train in a sandboxed repo → train renders "reverted", next derivation re-surfaces the cards with the revert notice, and the rollback bytes reproduce the pre-train file contents byte-identically.

### 06.4 The classes that killed prior attempts — each with its countermeasure

The one-click ancestor (PR #20) and the live churn of the last week supply a defect catalog. Each entry names the countermeasure this plan bakes in and what enforces it.

| Prior defect | Countermeasure here | Enforced by |
|---|---|---|
| PR #20's auto-merge stages contradicted CLAUDE.md #1 and were merged as-written anyway (r6 §8) | Draft-PR-only ceiling (V13); exceeding it requires a CLAUDE.md amendment, the owner's decision alone; plus the V16 hygiene note superseding the pre-amendment stages still readable in the doc | `oneClickPlanGuard.test.ts` *(exists)* holds the sentinel sentence; FM-9's ceiling boundary test |
| Byte-identity of rebuilt SQLite across OSes is impossible; CI↔CI byte identity is a toolchain race (r2 §8) | Logical-identity verification inherited unchanged: descriptor fingerprint equality + `logicalTableDigest`, never database-byte equality across machines | `candidateBuilder.ts:72-100` descriptor invariants; the amended one-click doc's own constraint (doc:330-357, r2 §8) |
| A live v1 `POST /api/judgment` could permanently brick compileJudgments (r6 §8) | Already closed: 410 tombstone + per-line digest pinning that reports the stray line's exact number | `server.ts:1704-1714`; `compileJudgments.ts:385-405`; FM-10 tests |
| G8 approval re-issue was a structural dead-end (approval not publishable) in the PR #20 design (r6 §8) | Verified fixed for probes: the baseline and its re-issued approval travel together or not at all (`admission.ts:979-999`), and `eval/baselines/probes.approval.json` IS on the publish allowlist (`publishPreparation.ts:32`). **Verified still open for G2:** `eval/baselines/ordering.snapshot.json` and its approval are NOT on that allowlist (`publishPreparation.ts:28-35`) and admission has no ordering-snapshot diff kind — so a data train's sanctioned `--update-ordering-snapshot` regen cannot travel the existing admission/publish machinery and would stop `outside-allowlist`. §05 owns the reviewed allowlist/diff-kind extension that closes this; until it lands, data trains are unimplementable at publish exactly as they are unimplementable at admission without D12b's deferred-signing marker and D12a's first signing (FM-8's hard block) — reviewed Phase-3 work (§08), a phasing fact, not a runtime path the pipeline routes around. | `publishPreparation.ts:28-35` (verified in-repo); extension specified in §05; `workbench/test/publishAllowlist.test.ts` asserts the extended list carries baseline and approval only as a pair |
| Two writers racing over `eval/golden` (Finish-up compile vs. the deriver) could silently clobber each other | V1's coexistence rule: while both exist (Phases 0–2), Finish-up remains the only fixture writer and the deriver treats its outputs as hash-pinned `sourcePreconditions` — a Finish-up write between derive and seal is `source-drift`, a stop, never a lost write | `candidateBuilder.ts:292-313` byte-verified preconditions; `admission.ts:856`; FM-7/FM-11 tests |
| Identity churn faster than review (4 layer moves in ~11.5h; PR #65 on its third regen) | V6 seal-time replay makes staleness the normal, handled path; V7 single-flight serializes identity movers instead of racing them | FM-2, FM-14 and their tests |
| Approval-record independence lapsed once (an "independent" G8 approval authored on the owner's machine, r6 §9) | Approvals are never machine-written by this pipeline (the regen deliberately does not touch `*.approval.json`), and A2 keeps the signer a distinct, per-review designated person — restated in §09 | `gauntlet.ts:806-819` update-flags write baselines only; G2's approval tripwire (`eval/src/gates/orderingSnapshot.ts:15-37`, rule 6) catches a regenerated-and-self-rewritten approval |

### 06.5 When the reviewer is gone mid-train

**Nothing about an absent human is an emergency, because no step requires urgency.** If Jesse (or a successor) stops responding with a train in flight: an unsealed inbox simply waits (cards have no expiry; votes have no expiry); a sealed train runs to `ready`/`pr-open` and then waits as a **validated draft PR** — checks run, Update Report complete, provenance bound — under A1's frozen-queue default (§09): **nothing merges** until the successor-governance plan designates the merging human. A frozen `pr-open` train behaves exactly as FM-14 describes — it re-announces `main-moved` staleness rather than rotting silently, and revalidation is mechanical when a human returns. The signing debt behaves the same way: an unsigned post-merge approval keeps G2/G8 red on main and the merged train's deferred-signing marker unpaid, which refuses the next **data** train's seal (FM-8's unpaid-marker rule) while guard trains still travel — the system refusing to outrun its governance, by design, not by accident.

### 06.6 What NOT to do (and the covenant rule each rests on)

- **Never auto-drop, downgrade, or "expire" a vote.** Corrections are superseding lines; a stale vote is re-confirmed by its human, never garbage-collected (append-only discipline, `judgments.ts:1-14`; the codebase's stated stance "re-confirm rather than trust", `compileJudgments.ts:433-436`).
- **Never merge on NO MEASURABLE EFFECT, and never convert the stop into a retry loop.** "NO MEASURABLE EFFECT means don't merge" (CLAUDE.md, Adding data); FM-5's lifecycle rule is the anti-loop, not an override.
- **Never let the runner reinterpret a gate.** A red gate stops the train; `not-applicable` needs a reason; an unrun check never reports pass (CLAUDE.md, Gate discipline; `report.ts:52-64`). The only verdict-scope changes in this plan are 06.1 rule 2's three admission-code relaxations — each an amendment to *which admission verdict applies*, specified in §05, recorded in the manifest, ratified in §09, with the gates themselves untouched and still reporting red — and nothing anywhere is a runner-side override.
- **Never machine-write an approval record.** Writing the approval IS the human act (r4 §3); the pipeline regenerates baselines and stops.
- **Never suppress scripture from a vote.** The strongest derived consequence of "Not relevant" is a per-query guard; deny-list-shaped consequences are human rulings routed per A3 (covenant #6; DOCTRINAL-BASIS §4).
- **Never edit `workbench/judgments.jsonl`, its legacy lines, or `updates.jsonl` in place** — the pinning makes any such edit a detected brick, and recovery is git history, not cleverness (FM-10).
- **Never exceed the draft-PR ceiling in response to a failure.** No failure mode above is recovered by merging, tagging, or dispatching anything; exceeding the ceiling requires a reviewed CLAUDE.md amendment, the owner's decision alone (V13).

---

## 07. Migration — votes already collected

**The entire migration is three votes, one query, one card.** Exactly 3 human judgment
records exist in `workbench/judgments.jsonl` — all schema v1, all `missing`, all on the
query "Who is like the Lord?", all cast by reviewer `jesse` in a 75-second span on
2026-08-06 (workbench/judgments.jsonl:1-3). Zero v2 records exist; zero
essential/helpful/irrelevant/prefer votes have ever been recorded (r7 §1). Under V2
(LOCKED), these three records are byte-frozen under the legacy migration manifest and
never become operations directly: they surface as **one re-confirmation card**, and only
fresh v2 judgments created by re-confirming derive normally through section 03's deriver.
This section inventories each record, walks the card's copy, states what stays closed,
and specifies day one on the Updates screen. A migration section that overclaims is worse
than one that says "nothing to migrate but these 3 records" — so that is what this one
says, with each record accounted for.

### 07.1 The inventory, record by record

All three records carry the identical recorded identity: engine `0.7.1`, the pre-full-Bible
corpus, and the layer fingerprint of the published v0.7.1 release artifact — not today's.
Current main is `0d12c34`, engine 0.14.0, corpus `6450b7d7…`, layer `fd27c55c…` (the
Part-3 identity facts), so **3 of 3 votes (100%) fail the workbench's own `sameIdentity`
test** (all three identity fields must match — workbench/src/inboxSources.ts:59-63; r7 §4).
Seven ordering-affecting engine bumps and 161+ concept packs have landed since these votes
were cast. None of the three is superseded — supersession keys on query+reference and the
three references are distinct — so all three are effective (r7 §1).

| # | Line | Reference | Voter's note (verbatim) | Disposition |
|---|---|---|---|---|
| 1 | judgments.jsonl:1 | Exodus 15:11 | "uses that exact wording." | Re-confirm via the card. The strongest of the three — a concrete exact-wording claim. Under today's full-Bible corpus this passage may already rank for the query; if it does, the Study itself will refuse a fresh Missing vote for it (a `missing` reference already present in the judged result set is rejected server-side — workbench/src/judgments.ts:509-518) and Jesse simply marks it Essential instead. Either way the fresh v2 vote derives normally. |
| 2 | judgments.jsonl:2 | Deuteronomy 3:24 | "Fits the theme" | Re-confirm via the card. The note is the rote text Jesse himself flagged as friction that captured nothing (r7 §1) — below the defend-it-from-the-text bar, so it must not become an operation's evidence. A fresh v2 Missing vote carries the server-attached passage excerpt, which satisfies that bar even with no note — "the defend-it-from-the-text rule is satisfied by the text itself" (workbench/src/judgments.ts:73-77, 519-524; r1 §5). |
| 3 | judgments.jsonl:3 | Deuteronomy 33:26 | "fits the theme" | Same as #2 in every respect. |

**Recommendation, per record: all three re-confirm; none auto-derive.** The codebase's
stated stance is already "the layers have changed since; re-confirm rather than trust it"
(workbench/src/compileJudgments.ts:430-436), and the inbox already treats every
`sameIdentity` failure as a `stale-judgment` suggestion — "The prior judgment was made
under a different engine, corpus, or layer identity"
(workbench/src/inboxSources.ts:165-182). We adopt that stance rather than invent a
carve-out. One could argue record #1 is identity-robust (the *claim* is about text
relevance, and the corpus fingerprint the votes recorded matches the stale committed
descriptor — r7 §7), but a special "trust old strong-note v1 votes" rule would buy one
vote's worth of convenience at the price of a second code path through the deriver.
Three records do not justify a second code path. V6's staleness machinery, note, applies
to *v2* judgments at seal time; these v1 records never reach a seal, so their only door
is the card.

### 07.2 The one re-confirmation card

**Why one card and not three:** the existing inbox already dedupes suggestions per
`source:query` (workbench/src/inboxSources.ts:204-208), so the three stale votes collapse
to a single `stale-judgment` item today — `stale-judgment` is a first-class review-case
source (workbench/src/judgments.ts:31-39). The card keeps that per-query granularity (V2):
re-confirmation means *looking at the query again with today's results*, which is one
sitting regardless of how many passages were suggested.

The card follows the grammar section 04 owns, diverging only where 04 itself blesses the
divergence (§4.3's re-confirmation variant, bound below): approving this card does not
queue a change — it opens the query for a fresh look, because the old votes are too old
to act on. Its copy, shipping verbatim:

> **Take a fresh look: "Who is like the Lord?"**
>
> Because you suggested three passages for this search on Aug 6 — Exodus 15:11 ("uses
> that exact wording."), Deuteronomy 3:24, and Deuteronomy 33:26 — back before the
> engine covered the whole Bible.
>
> Nothing changes yet. The search has changed a lot since then, so your old suggestions
> need a fresh look before they can count. Approving opens this search with today's
> results so you can make your calls again; passages that already show up well may not
> need anything. Your new calls then follow the normal path into the next reviewed
> update.

**This is a `re-confirmation` card — 02.6's closed kind, rendered under 04's blessed
grammar variant, not a new convention.** Section 04 blesses exactly one divergence from the
five-part grammar for this kind: the what-will-change line truthfully says nothing changes
yet, and the primary button opens a review session instead of queueing a change — labeled
"Look again" on V6's identity-drift card, **Approve** on this day-one legacy card (04 §4.3,
the single writer of that blessing). The mechanism is 04's Look-again wiring reused: the
primary button opens the query in Review as a `stale-judgment` case — the existing
first-class review-case source (workbench/src/judgments.ts:31-39) feeding the existing
`stale-reconfirmation` session kind (workbench/src/reviewSessions.ts:20, 684; r7 §6) —
where fresh v2 votes are cast against a fresh snapshot. On day one (Phase 0, read-only)
that is the button's *entire* behavior: a hand-off into machinery that already exists —
the Updates screen itself writes nothing. From Phase 1 the same press also appends the
ordinary `card-approved` event via `POST /api/v2/updates/cards/:id/decide` (Part 3).
**Decline** — the permanent dismissal V6's drift card does not need but migration does —
records `declined` with a one-line reason (the v1 lines themselves remain untouched and
effective in the log — declining the card is a decision about *acting*, not an edit to
history); **Not now** parks it for the next cycle (V5). Both activate with Phase 1's
decide endpoint and store; in Phase 0 the card renders **Approve alone** — Decline and
Not now are absent, not disabled, because the screen writes nothing yet (08 D2's
rendering rule; they appear when Phase 1 lands).

**The card terminates; the lifecycle rule is one line: the legacy card derives if and only
if zero v2 judgments exist on the query "Who is like the Lord?"** — existence, not
effectiveness: even a later-superseded v2 vote proves the fresh look happened. The rule's
enforcer is the deriver, so it binds from Phase 1 (08 D4) — the first moment this card
*derives* at all; inside Phase 0 the card is a frontend rendering of the inbox suggestion
and the rule cannot yet fire (§07.5 scopes that window honestly). From Phase 1, the first
fresh v2 vote on the query, cast through this card's session *or through any other door*,
ends the card's derivation permanently; the fresh votes' own cards take over, and the
decide events stay in `workbench/updates.jsonl` as history. Three consequences, so no
state dangles:

- **It never joins a train.** A `re-confirmation` card carries no operations, so it is
  ineligible for any seal and excluded from 04's "approved and waiting" group and tally.
  `approved` on this card means "fresh look opened" — a transient state the first v2 vote
  retires — never a change waiting for a train. And the transient has a defined resting
  place: an approved legacy card with no v2 vote yet (fresh look opened, then abandoned)
  keeps rendering in the main card list with a quiet status line — "Fresh look opened —
  finish your calls in Review" — and its primary button re-opens the same
  `stale-reconfirmation` session, so an abandoned sitting is always resumable and the ask
  never silently vanishes. This rendering row and the tally exclusion live on 04's
  surfaces (states table §4.8; tally §4.2), which 04 owns.
- **Declined is a real resting state.** A declined card folds to `declined` under 02.6's
  ordinary rule — out of the inbox, reachable in History with its reason. Because the
  termination rule keys on judgment existence, a declined card with no v2 vote keeps
  re-deriving in `declined` state indefinitely and renders nowhere — which is exactly what
  "declined, on record" means in a store-nothing design.
- **Its identity is defined, and collision-proof.** The v1 lines carry no `judgmentId`, so
  for this one card the 02.6 content address — `{kind, query, targetKey, judgmentIds:
  sorted}`, the shape unchanged — takes the migration manifest's sorted per-line
  `lineSha256` values as the `judgmentIds`:
  `cardId = sha256(canonical-JSON({kind: "re-confirmation", query, targetKey: <query key>, judgmentIds: <sorted lineSha256 values>}))`
  (`workbench/legacy/migration-manifest.json` pins all three lines — r7 §2). Its
  `card-drafted` event likewise lists those sorted `lineSha256` values in its
  `judgmentIds` field — the one card whose ids are 64-hex line hashes rather than v2
  UUIDs (02.6's event shape, sanctioned here for this card alone). Decisions re-attach
  across re-derivations by this id, and a future V6 re-confirmation card on the same
  query cannot collide: its address carries v2 judgment UUIDs where this one carries line
  hashes — disjoint values in the same slot, distinct address. (The pre-existing inbox's
  suggestion id keys on `judgment.at` — inboxSources.ts:167-168 — a different id space
  entirely.)

**The pre-existing Study-inbox suggestion: coexists in Phase 0, retired in Phase 1.** The
Study inbox derives, at request time, a `stale-judgment` suggestion for every effective
judgment failing `sameIdentity` (inboxSources.ts:165-182) — including these v1 lines
forever, since a v2 `supersedes` must name a v2 `judgmentId` and can never silence them.
In Phase 0 the suggestion and this card coexist: two doors into the same
`stale-reconfirmation` sitting, harmless and labeled (07.5's on-screen note) — and both
persist through the whole Phase-0 window, even after a completed fresh look (§07.5's
scoping paragraph). Phase 1 adds
a one-line filter to the stale-judgment inbox source — skip any judgment line pinned in
the legacy migration manifest — making this card the sole surface for the legacy votes: a
Decline then actually silences the ask instead of leaving an immortal inbox item, and a
re-confirmation cast through the old door beforehand simply trips the termination rule
(fresh v2 votes exist; the card stops deriving). The filter is display routing, not
judgment semantics: the lines stay effective in the log.

### 07.3 What stays closed and untouched

**Migration never rewrites `judgments.jsonl` — mechanically enforced, not merely promised.**

- **The v1 log stays closed.** Any submission without a v2 `action` is rejected: "The v1
  judgment log (workbench/judgments.jsonl) is closed to new v1 records; every judgment
  needs a v2 'action' and goes through POST /api/v2/judgments"
  (workbench/src/judgments.ts:620-631). This plan adds no writer that could reopen it.
- **The 410 tombstone stays.** `POST /api/judgment` answers 410 for every method —
  "one stray v1 append could brick compile-judgments forever"
  (workbench/src/server.ts:1704-1714). It is the model for the checklist retirement
  tombstone in Phase 4 (V1), and it is not itself retired.
- **The three lines are byte-frozen, fail-closed.** `workbench/legacy/migration-manifest.json`
  pins each v1 line by its per-line hash and maps it to its migrated case event; the
  compiler validates the raw log against the manifest before every compile and fails
  closed on any stray or edited line (workbench/src/compileJudgments.ts:385-405), and
  health reconciles the same pins warn-only (workbench/src/healthSources.ts:438-521).
  The deriver inherits this exactly: it reads the log through the same shared
  effective-judgments core (V1) and is **read-only over legacy lines** — it never
  transforms, re-serializes, or "upgrades" them, because any byte change to those lines
  is a bricking hazard by design.
- **Corrections are new lines, forever.** The log's own contract — "Corrections are new
  lines; … Editing or deleting lines is off-limits — history is part of the record"
  (workbench/src/judgments.ts:1-14) — applies to migration as much as to voting. Even
  the card's Decline writes to `workbench/updates.jsonl` (V5), never to the judgment log.

### 07.4 Nothing else migrates — proven, not assumed

**There is no compiled output to migrate, anywhere.** Zero of the 494 fixtures in
`eval/golden/` carry `"generatedBy": "workbench"`; no `who-is-like-the-lord` fixture
exists in any commit across all refs; `pipeline/fixtures/web-subset.json` contains no
`"workbench judgment:"` entries (r7 §5, established by repo-wide grep and
`git log --all`). The compile→commit workflow was never used in anger — the compiler's
outputs only ever reached a working tree, if that. The new lifecycle therefore starts
from a **clean output slate**: no fixture needs adopting, re-attributing, or reconciling.

**Pending manual-checklist items: there are none, because the checklist was never
persisted.** The checklist exists only inside a compile report — CLI stdout or the
`POST /api/v2/compile/preview` response (workbench/src/server.ts:1365) — and is stored
nowhere (r7 §5). The three checklist lines a compile would print today are derived from
the same three v1 votes this section already disposes of. No double-derivation is
possible in the new lifecycle: Phase 0 surfaces `plan.checklist` strictly read-only
(section 08), and from Phase 1 on the deriver derives from the *judgment log*, never
from checklist text or previously-written fixtures — same log in, same cards out, with
the Phase 0–2 coexistence rule (V1) hash-pinning any Finish-up-written fixture as a
`sourcePrecondition` so the two writers never race.

One naming boundary, so a successor is never confused: `eval/battery/judgments.json`
(271 provisional editorial grades awaiting J17 ratification) is a **different store with
a different schema** — eval-battery relevance grades, not Study votes (r7 §3). It is not
an input to the deriver and nothing in it migrates here; its sha-pinned provenance gate
is a precedent this plan learns from, not a system it touches. Sweep-derived candidates
likewise migrate nothing here — intake is disjoint by V16, and the sweep-adjudication
plan owns its own backlog.

### 07.5 Designed for mostly-empty: cold start, day one, no backfill

**The pipeline's first real cycles happen under the successor, with few votes — the
design assumes that instead of apologizing for it.** The deriver is a pure function of
the whole v2 judgment log at every seal (V1, section 03): there is no incremental
cursor, no per-vote applied-state, no watermark that historical data would need to seed.
An empty v2 log derives an empty card set; the first real vote derives its card the next
time the inbox renders. **No backfill exists because there is nothing to backfill** —
zero v2 records, zero committed compiled outputs, and the three v1 records handled above.
Cold start is not a degraded mode; it is the specified initial state.

**Day one — what the Updates screen shows the first time it renders** (C5; Phase 0,
section 08):

1. **One card: the "Who is like the Lord?" re-confirmation card** from §07.2, in state
   `drafted`. It is the only actionable item on the Updates screen, and in this phase it
   renders Approve alone (§07.2's Phase-0 rendering rule). One coexisting path is
   stated rather than hidden: until Phase 1's filter retires it (§07.2), the pre-existing
   Study inbox still shows its own stale-judgment suggestion for the same three votes —
   both doors open the same fresh-look session.
2. **Three read-only backlog lines** — the existing compile `plan.checklist` output,
   surfaced read-only through 08 D2's plain-language mapping: verdict and diagnosis tokens
   render through the reviewed plain renderings, raw tokens never render, and 08 D2's
   jargon-regex AC covers this screen (Phase 0 does no new derivation). Above the lines,
   the note section 04 owns and 07/08 quote identically ships verbatim: "These lines
   describe the same old suggestions as the card above — the card is the way to act on
   them." (04 §4.2).
3. **The empty state beneath**, already written for the day the card is resolved: 04's
   steady-empty copy, shipped from 04's COPY block (04 §4.8 owns the string). Loading,
   error, and read-only states follow the Study's existing screen pattern (section 04
   owns their copy; r8 §2).

**Inside the Phase-0 window, a completed fresh look does not yet clear the card —
accepted transient duplication, stated so nobody mistakes it for a broken terminal
state.** The termination rule's enforcer is the deriver, which lands in Phase 1 (08 D4);
the Phase-0 card is D2's rendering of the pre-existing inbox suggestion, which derives
from the v1 lines' identity failure and therefore keeps deriving after Jesse's fresh
votes (the v1 lines stay effective and stale forever — §07.2). So if Jesse approves and
re-votes on day one, the card renders again on day two, and every day until Phase 1
lands. That is a display duplicate, not a lost or dangling state: pressing Approve again
just re-opens a fresh-look session, his day-one calls are already saved in the judgment
log, and at worst the screen re-asks for a look he already gave — a nuisance bounded by
the Phase-0 window, not data loss. Phase 1 retires the duplicate mechanically the day it
lands — no cleanup step, no data change.

Day two **from Phase 1** follows from §07.2's one-line lifecycle rule. Once fresh v2
votes exist on the query — cast through the card or any other door — the legacy card
ceases to derive, the Phase-1 inbox filter keeps the old suggestion from returning, and
the screen is the steady state: cards derived from v2 judgments only, the legacy records dormant in the log as
history. If the card is declined instead, it folds to `declined` and leaves the inbox with
its reason on record, and the three v1 lines remain effective-but-unactioned history —
surfaced nowhere once the Phase-1 filter lands, deriving nothing, costing nothing. That is
the honest measure of migration debt here: not zero records, but zero records any future
cycle must touch. Either way the log still tells the whole story. (Section 06's staleness
handling must therefore never assume every effective judgment is eventually actioned —
these three, declined, would be the standing counterexample.)

**What NOT to do** (each prohibition names its covenant rule):

- Do not transform, re-stamp, or "upgrade" the 3 v1 lines into v2 records — determinism's
  fail-closed byte-pinning makes any such transform a bricking hazard
  (workbench/src/compileJudgments.ts:385-405), and V2 forbids it.
- Do not derive operations from the v1 records directly, however strong the note — the
  evidence floor is below the defend-it-from-the-text bar, and fixtures-first means the
  fresh vote's fixture assertion must come from a judgment made against results someone
  actually saw.
- Do not build an import path, migration script, or historical-vote converter — there is
  no data for it to convert, and an unused migration tool is exactly the kind of
  guessed-protection CLAUDE.md's gate discipline warns reads as protection while
  protecting nothing.
- Do not reopen or soften the 410 tombstone or the closed-log validation to "simplify"
  migration — human merge is the admission event, and the closed log is what makes the
  judgment history trustworthy evidence for it.

---

## 08. Implementation phasing

**Recommendation: build in five phases — Phase 0 "See the backlog" through Phase 4 "Steady
state and retirement" — each landing as one or more human-merged PRs, each independently
valuable, each testable by a stranger from its "AC:" lines alone.** The phase names and
contents are fixed by this plan's design spine (Part 3) and every other section uses them;
this section owns the delivery order, the per-phase deliverables, what already exists versus
what is built new, the gate wiring, the test strategy, the rollback story, and the honest
size estimates. Design content lives where the spine assigns it: the mapping table is §03's,
the card grammar is §04's, the train choreography spec is §05's, the failure-mode table is
§06's, governance assumptions A1–A3 are §09's. This section references them by number and
never restates them.

The primary executor of this plan is a successor working from HANDOFF plus this document
(§09 owns that statement). Accordingly: every step below that involves a terminal is
**implementer work**, labeled as such; every Jesse-facing (or successor-reviewer-facing)
touchpoint is in The Study or on GitHub. From the end of Phase 3 onward the steady state is
zero-terminal for the reviewer per V13 — the only off-Study action is clicking Merge on
GitHub.

### 8.0 Ground rules binding every phase

Binding for the implementer; deviations need a plan revision.

1. **Human merge is the admission event for the pipeline's own code, not just its data.**
   Every phase ships as draft-able PRs merged by a human (CLAUDE.md "Adding data" discipline
   applied to tooling; A1 governs who that human is after wind-down — §09).
2. **This pipeline never touches ordering.** No phase changes engine code, weights, caps,
   tokenizer rules, or tie-breaks — those are on the not-allowlist (V15), and diagnoses
   requiring them become `engineering-required` stops. Consequently **no ENGINE_VERSION bump
   appears anywhere in this plan**; data trains move `layerFingerprint` only
   (candidateBuilder.ts:460-489 enforces that a candidate may move only the layerFingerprint
   against its base — with the one narrowly-scoped, reviewed exception D12b carries per
   §05 §5.5 gap 4: corpus movement for proposals containing `fixture-corpus-chapter-add`).
3. **Gate honesty per phase.** Each phase below names exactly which checks run. Any surface
   that displays check status renders "The checks haven't run yet" until a real machine
   report exists — an unrun check never reports pass (CLAUDE.md gate discipline). Phases 0–1
   run no gauntlet at all and therefore display no gate table.
4. **Append-only stores stay append-only.** No phase edits or reorders a line of
   `workbench/judgments.jsonl` (the three legacy v1 lines are byte-frozen under the
   migration manifest and fail-closed on any change — compileJudgments.ts:350-405, per §07);
   `workbench/updates.jsonl` follows the same discipline from birth (V5).
5. **Rollback is always a PR revert.** Every phase is additive: reverting its PRs restores
   the prior behavior exactly. Specific rollback notes per phase below; none of them
   requires touching data, baselines, or the judgment log.
6. **Coexistence rule (Phases 0–2).** `compileJudgments` continues to power Finish up
   unchanged; the deriver treats Finish-up-written fixtures as hash-pinned
   `sourcePreconditions`, so the two writers never race (V1). Retirement of the printed
   checklist and the compile direct path is a Phase 4 deliverable, not a side effect.

### 8.1 Phase overview

| Phase | Name | New server code? | Touches `admission.ts`? | Reviewer sees at phase end | Est. size (estimate; rate basis §8.8) |
|---|---|---|---|---|---|
| 0 | See the backlog | **No** (frontend + one pre-work fix) | No | The Updates screen, read-only, showing today's backlog | ~2 PRs, ~400 changed lines |
| 1 | Derive and decide | Yes (deriver + store + 2 endpoints) | No | Cards derived from votes; Approve / Decline / Not now work | ~4–5 PRs, ~2.5–3.5k lines |
| 2 | Guard trains | Yes (train runner + 2 endpoints) | **Yes — fixture-lane exemption (D9) + inherited-red control-run acceptance (D8/D9)** | One vote becomes a draft PR with its answer-sheet line | ~3–4 PRs, ~1.5–2.5k lines |
| 3 | Data trains | Yes (jobs wiring + report + sign endpoint) | **Yes — ordering-snapshot + ordering-snapshot-approval diff kinds + deferred-signing marker (D12b; spec §05 §5.5)** | A vote that needs a theme change becomes a checked, signed draft PR | ~3–4 PRs, ~2–3k lines |
| 4 | Steady state and retirement | Yes (replay automation) | No | Stale votes handled automatically; old checklist retired; runbook done | ~4–5 PRs, ~1–1.5k lines |

Dependency spine: 0 → 1 → 2 → 3 → 4, strictly ordered — but each phase is a complete,
useful product on its own. If work stops after Phase 1, the Study has a working review inbox
whose approved cards a human can act on by hand with the concept-curation skill; after
Phase 2, fixture guards flow vote-to-PR with no terminal; after Phase 3, the full loop runs.

---

### 8.2 Phase 0 — See the backlog

**What it is for Jesse:** a new "Updates" item in The Study's nav. Opening it shows, in
plain words, everything his saved calls are still waiting to change — today, that is the
work the old printed checklist described, plus one card asking him to re-confirm his three
2026-08-06 suggestions (§07 owns that card's copy and the day-one walkthrough). Nothing on
this screen writes anything yet.

**What exists already:** everything this phase needs. The compile plan's `checklist` field
already rides `POST /api/v2/compile/preview` to the client and the Study simply ignores it
(`checklist` is a field of `JudgmentCompilationPlan`, compileJudgments.ts:87; the route is
already in all three allowlists — staticSnapshot.ts:10-35, server.ts:207-226, and the
page's `ROUTES` mirror at index.html:396-425 — because Finish up calls it today). The
legacy re-confirmation seed already exists server-side: the inbox derives a `stale-judgment`
suggestion for identity-mismatched judgments and dedupes per query
(inboxSources.ts:204-208), which collapses the three v1 votes into exactly one item. The
screen pattern is one more `<section class="screen">` + a `setScreen` branch (r8 §2).

**Built new:** the screen itself (frontend only), plus two small pre-work fixes.

**D1. Pre-work: honesty and label fixes** (one PR, implementer work)
- Extend `compileJudgments`' staleness warning from layer-only to the full identity triple.
  Today it warns only when `layerFingerprint` moved (compileJudgments.ts:426-438);
  a judgment made under an older `engineVersion` or `corpusFingerprint` compiles silently.
  This interim fix keeps the coexistence period honest; it is superseded by V6's full-triple
  seal-time replay when Phase 4 lands (D16 — the warning then describes what the replay now
  does). Until D16, staleness at every seal is covered by FM-2's triad — this warning (D1's
  full-triple compile warning), the derive-time pre-check (`sameIdentity`,
  inboxSources.ts:59-63 — the observation-bound remainder derives as a re-confirmation
  card that never boards a seal; the split-off guard card boards normally, §03 §03.5;
  §06 FM-2), and human review — with the decide-409 backstop behind the inbox
  (§8.4/§8.5 name the same bridge, per §05 §5.2 step 1).
- Resolve the `AdmissionView.preview.baseCommit` labeling question: it is set to
  `preview.expectedMainCommit`, not `admittedBaseCommit` (admissionPublishOperations.ts:214,
  r2 open Q3). Decide deliberately (they must be equal at publish preflight anyway) and
  document or fix it **before** any Updates UI reuses that view, so the train view never
  inherits a mislabeled field.
- AC: compile preview on a log containing an engine-stale or corpus-stale judgment emits a
  warning naming the moved dimension; a unit test pins all three dimensions. The
  baseCommit decision is recorded in the code comment and covered by an assertion.

**D2. The Updates screen, read-only** (one PR, frontend + Playwright)
- New nav item "Updates" following the exact screen pattern (V9); renders three sections:
  (a) the legacy re-confirmation card (content per §07), which in this phase renders
  **Approve alone** — Decline and Not now are *absent*, not disabled, because the screen
  writes nothing yet; they arrive with Phase 1's decide endpoint (D6). Its Approve is a
  pure hand-off, no write: it opens the query in Review as a `stale-judgment` case
  (judgments.ts:31-39) feeding the existing `stale-reconfirmation` session kind
  (reviewSessions.ts:20) — §07 §07.2's mechanism, the rendering rule §07 cites as D2's;
  (b) the compile plan's checklist
  items rendered as read-only backlog lines in plain language, headed by the same-facts
  note that ships verbatim and is quoted identically by §04 §4.2 and §07: "These lines
  describe the same old suggestions as the card above — the card is the way to act on
  them." (the two sections describe the same three votes; the card is the actionable
  surface), (c) an empty state when there is nothing (the "Empty (steady)" string §04
  §4.8 owns, shipped from §04's COPY block — this section mints no copy).
- Checklist lines arrive with diagnosis tokens and concept ids in them
  (`[ ] wrong-anchor: concept X produced bad evidence…`, compileJudgments.ts:899 area);
  the screen maps diagnoses through the existing plain-language table (COPY.plainWhy,
  index.html:577-581) and concept ids to their display labels — raw tokens never render.
- Data comes from the two existing, fully-allowlisted calls (`POST /api/v2/compile/preview`,
  `GET /api/v2/inbox`); **no new endpoint, no server change, no allowlist edit** in this
  phase.
- Read-only degradation: when the server is degraded, the screen renders the standard
  read-only banner and its cards stay visible (they are already read-only).
- AC: Playwright spec `workbench/e2e/study-p6.spec.ts` (new, continuing the existing
  `study-p1..p5.spec.ts` series — all five exist in `workbench/e2e/`) covers: screen renders
  with the real 3-vote log (one legacy card + checklist preview, with the §4.2 same-facts
  note rendered verbatim above the checklist lines; the legacy card shows exactly one
  action — Approve, with no Decline or Not now element in the DOM; before Approve is
  pressed the Updates screen has issued only the two read calls and appended nothing to
  any log; pressing Approve hands off into the existing stale-reconfirmation flow —
  asserted as the Review surface opening on the query — whose own machinery's requests,
  session creation included, are outside the screen's no-write assertion, per §07's
  "the Updates screen itself writes nothing"), renders the empty state
  with an empty log (`WORKBENCH_JUDGMENTS_PATH` override, server.ts:92), renders the
  read-only banner in degraded mode. The D28 jargon regex (`[0-9a-f]{8}-`, `sha256`) finds
  zero matches over the screen's rendered text. Any new color pairs are added to
  `workbench/test/pairs.json` for the contrast audit (r8 §2).

**Gate wiring:** none. No gauntlet runs in this phase; the screen displays no check status.

**Rollback:** revert D2 (the nav item and screen vanish; nothing else changes) and/or D1
(warnings return to layer-only).

**Estimate:** ships in days — it is a rendering of data the server already sends.
~250 changed lines in index.html, ~150-line Playwright spec, ~40 lines in
compileJudgments + tests. (Estimate; rate basis §8.8.)

---

### 8.3 Phase 1 — Derive and decide

**What it is for Jesse:** the Updates screen comes alive. Each saved call now produces a
real card he can act on — Approve, Decline, or Not now — with at most one plain-language
question. Approving still changes nothing outside the workbench; the cards are decisions
queued for the next update. (The shipped sentence stays exactly true throughout: "Your
calls are saved the moment you make them. They change search results only in the next
reviewed update — never while you work." — index.html:429.)

**What exists already:** the selection/validation core to extract (`activeV2Judgments`,
case cross-validation, canonical reference parsing — compileJudgments.ts:196-233, 350-405);
the proposal vocabulary and its strict parser, including in-process fixture validation by
the real G3 validator (`validateCorpusFixture` imported at proposals.ts:5, applied at
proposals.ts:490-492) and the human-confirmation-only provenance rule (proposals.ts:38-43,
314-324); the conflict classes `compileJudgments` already hard-errors on
(compileJudgments.ts:573-669); the append-only-store discipline to copy
(judgments.ts:1-14).

**Built new:** the shared core, the deriver, the store, two endpoints, and the interactive
inbox.

**D3. Shared core extraction** (one PR)
- Extract the supersession/selection/validation core into
  `workbench/src/effectiveJudgments.ts`; `compileJudgments.ts` imports it (V1 — one
  selection logic, written once).
- AC: a golden refactor test proves compile output is unchanged — the same judgment log
  yields a byte-identical `JudgmentCompilationPlan` digest before and after the extraction.
  All existing compile tests pass untouched.

**D4. The deriver** (one PR; the heart of the plan — design owned by §03)
- `workbench/src/deriveUpdates.ts`: a pure function of (judgment log, cases log,
  byte-frozen migration manifest, updates log, ontology and fixture snapshot, web-subset,
  replay identity, and any prior-train outcome artifacts the updates log references) —
  §03 §03.3's eight inputs, restated verbatim; train id and seal time come from logged
  `updates.jsonl` events, never the clock — → cards + a schema-v1 `ProposalManifest` per
  the §03 mapping table. CLI/API only in this phase — no UI dependency, so it is testable in isolation.
- AC (the determinism proof, per §03's contract): running the deriver twice on the same
  fixture inputs — which cover the full eight-input snapshot, not just the judgment log:
  `workbench/updates.jsonl`, the cases log, the migration manifest, and one prior-train
  outcome set (sealed manifest + pinned verified report) exercising §03.8's
  needs-engineering stop-conversion, since those artifacts are observed inputs (§03 §03.2)
  — yields **byte-identical cards and an identical manifest digest**
  (`proposalManifestDigest`, proposals.ts:871-873); a second test permutes input-file read
  order and asserts the same (§03 §03.3's AC, restated here as binding). Unit tests on
  synthetic judgment sets
  cover, at minimum: supersede chains (only leaves derive); a superseded-mid-review
  judgment; each row of the §03 mapping table; conflict detection producing a conflict
  card, never a silent drop (V10); the hand-written-fixture ownership refusal (no
  `generatedBy: 'workbench'` → route-to-curation card, compileJudgments.ts:689-708); v1
  legacy lines excluded from derivation (V2); `helpful` deriving nothing
  (compileJudgments.ts:523-524); and every derived operation carrying
  `{source:'editorial', confirmed:true, reviewer, evidence}` provenance — the parser
  refuses anything else (proposals.ts:314-324), so this is asserted by round-tripping the
  manifest through `parseProposalManifest`.
- AC: no network, no model call, no randomness — enforced by extending the existing
  fail-closed boundary scan `pipeline/test/curationBoundary.test.ts` (import-graph +
  `child_process` + package-scripts scan) to cover `deriveUpdates.ts` and
  `effectiveJudgments.ts` — the exact mechanism §03 §03.9 specifies — and by review.

**D5. The lifecycle store** (same PR as D4 or its own)
- `workbench/updates.jsonl`: append-only JSONL recording only human decisions and train
  membership (card drafted/approved/declined/parked, train opened/sealed/stopped — V5).
  Downstream states are derived from existing artifacts, never duplicated (V5's
  anti-17-state-machine rule).
- AC: property test — replaying any prefix of the event log yields a consistent state;
  corrections are new lines; an edit/delete of an existing line is detected and refused on
  read (same fail-closed posture as the judgment log).

**D6. Endpoints + wiring** (one PR)
- `GET /api/v2/updates` (cards) and `POST /api/v2/updates/cards/:id/decide`
  (approve/decline/park + answers) — names fixed by Part 3.
- The full three-allowlist wiring work item, budgeted here explicitly: add both routes to
  `REQUIRED_INLINE_ROUTES` (staticSnapshot.ts:10-35), the page's `ROUTES` mirror
  (index.html:396-425), and the decide route to `requiresTrustedJson`
  (server.ts:207-226); plus read-only degradation (`startup_degraded_read_only` disables
  the POST) and failure-copy parity for every error code the endpoints can return.
- The stale-judgment inbox-source filter §07 §07.2 assigns to Phase 1 (~10 lines + test,
  counted in this phase's estimate): the inbox's `stale-judgment` source skips any
  judgment line pinned in `workbench/legacy/migration-manifest.json`, making the legacy
  re-confirmation card the sole surface for the three v1 votes — a Decline then actually
  silences the ask. Display routing only: the pinned lines stay effective in the judgment
  log and no judgment semantics change.
- AC: a test asserts the three lists agree (the static-snapshot preflight already fails a
  page missing a required route — that guard must go red if the wiring is skipped);
  Playwright covers the degraded state (decide buttons disabled, banner shown) and each
  failure copy. Filter AC: with the filter, no inbox suggestion derives from the three
  pinned v1 lines while the legacy card still renders; a declined legacy card resurfaces
  nowhere; the pinned lines remain readable and effective in the log (asserted by test).

**D7. The interactive inbox** (one PR, frontend)
- Cards render per §04's grammar; Approve / Decline / Not now post to the decide endpoint;
  approving a card with an open question requires answering it; conflict cards present both
  sides and record the pick as a superseding judgment through the existing v2 supersede
  mechanism (V10). Approval is the `confirmed: true` human act (V9).
- AC: Playwright: approve, decline (with one-line reason), park, conflict-card resolution,
  question-required-before-approve, and the D28 jargon regex at zero matches over all card
  copy. A card whose underlying judgment was superseded between render and decide is
  refused with fresh-state copy (409 semantics; §06 owns the failure table).

**Gate wiring:** no gauntlet runs. The deriver's manifest validation reuses the G3 fixture
validator in-process at parse time (proposals.ts:490-492) — that is input validation, not a
gate verdict, and no gate status is displayed anywhere in this phase.

**Scope note:** this phase is the point where the dashboard plan's out-of-scope line
("any new server-side aggregation … or judgment semantics") is superseded for derivation
server code while "no new judgment semantics" stays intact (V13): the four verdicts and
their meanings do not change in any phase.

**Rollback:** revert the PRs. Orphaned `workbench/updates.jsonl` lines are harmless — the
file is read by nothing else, and Phase 0's screen degrades back to read-only preview.

**Estimate:** ~2.5–3.5k lines across ~4–5 PRs (D3, D4, D5 — folding into D4's PR or its
own, per D5's header — D6, D7): deriver ~700–900, shared core extraction
~250 moved, store ~200, endpoints+wiring ~250 (the ~10-line stale-judgment inbox filter
included), frontend ~400–600, tests ~800–1,200.
(Estimate; rate basis §8.8.)

---

### 8.4 Phase 2 — Guard trains

**What it is for Jesse:** the first end-to-end result. He approves fixture-guard cards,
clicks "Start the update", approves the one-page answer-sheet report when the checks
finish (the one-confirm "Approve this update" act — D8's bridge, §04 §4.6), and a draft
PR appears on GitHub containing the new answer-sheet lines, with his votes quoted as the
evidence. One
"Not relevant" call can now become a permanent guard with no terminal involved.

**What exists already (dormant, tested, uncalled — reuse, do not rebuild):** the entire
downstream machinery. `runCandidateBuild` has zero production callers (its only src
reference is a type import, comparisonRunner.ts:8); `previewAdmission`/`runAdmission` and
the publish path are fully built with HTTP endpoints wired only into `/advanced`
(r2 §§3–5, 7); `prepareDraftPublication` creates the isolated worktree and branch
`refinement/<YYYY-MM-DD>-<proposalId>` (publishPreparation.ts:1136) and stops at a draft PR
(the ceiling, protected by a live guard test — oneClickPlanGuard.test.ts:25-29 asserts the
auto-merge language never returns); the jobs/SSE surface runs allowlisted repo checks from
the UI (`POST /api/v2/checks` with an exact-jobId allowlist, server.ts:1244-1276). The
train id doubles as the manifest's `proposalId`, so the existing branch formula is reused
verbatim as `refinement/<YYYY-MM-DD>-<trainId>` with no publish-path change.

**Scope, stated up front (two constraints):** (1) **Phase 2 trains contain
`golden-fixture-upsert` operations only.** A card deriving `fixture-corpus-chapter-add`
makes its train a **data train** — the subset file is a fingerprint input; PR #64 moved
both fingerprints (§05 §5.2) — and that train waits for Phase 3's machinery (D12b's
candidate-builder amendment included); §05 specifies no standalone subset refresh. D9's
*exemption* scope is unchanged by this — it spans both fixture-class ops per §05 §5.3,
because effect-exemption and lane classification are independent properties (a chapter-add
manifest is effect-exempt but never fixture-lane). (2) **Until D8a merges, trains are
single-query**: schema v1 requires every `golden-fixture-upsert` to target the manifest's
single `fixtureId` (proposals.ts:813-817; §03 §03.2). Phase 2's first guard trains are
single-query anyway.

**Built new:** the train runner (a thin coordinator over `jobRunner`/`applyJournal`/
`admission`/`publishPreparation` — exactly the "thin layer over existing modules" the
one-click doc prescribed and PR #20's overbuild ignored, r2 §8), the seal/state endpoints,
the D8a proposals amendment, the first-ever writer of admission evidence, and the two
reviewed `admission.ts` changes: D8's control-run inherited-red verdict-acceptance
amendment and D9's fixture-lane exemption.

**D8. Train runner + seal/state endpoints** (one PR)
- `POST /api/v2/updates/train` (seal) and `GET /api/v2/updates/train/:id` (state + report)
  — names fixed by Part 3. Sealing computes the seal digest over judgmentIds, cardIds,
  operations, and the replay identity (V8) and appends the `sealed` event to
  `workbench/updates.jsonl`. Until D16 (Phase 4), sealing **records** the replay identity
  but runs **no automated V6 replay**: staleness at Phase 2–3 seals is covered by FM-2's
  triad — D1's full-triple compile warning, the derive-time pre-check (`sameIdentity`,
  inboxSources.ts:59-63 — re-confirmation cards never board a seal; split-off guard cards
  board normally, §03 §03.5; §06 FM-2), and human review — with the decide-409 backstop
  behind the inbox (per §05 §5.2 step 1's bridge). Train states are the closed set `open →
  sealed → built → measured → ready → admitted → pr-open → live`, or `stopped(<reason>)`
  with reasons from the closed enum only (V5); everything after `sealed` is derived from
  existing artifacts, not stored. The report this endpoint serves in Phase 2 is the
  **fixture-lane Update Report block** (§04 §4.6's one-block guard-train variant — no
  changed queries, no comparison), which ships with D8: it is the artifact Phase 2's
  `ready` derives from (§05 §5.1) and what the one-confirm admit act fronts; D14 adds the
  data-lane report and the typed-digest sign for both flavors.
- **Control-run inherited-red acceptance** (§05 §5.5 gap 3's guard-train half, specified
  there; §06 FM-8 owns its failure modes — it rides D8/D9, not a later phase, because
  without it no train passes `runAdmission` on today's main at all: the standing G2/G8
  red makes the in-worktree release gauntlet REJECT, and the parser "admits only ADMIT /
  ADMIT_WITH_WARNINGS" (admission.ts:580-584)). The change is "an amendment to
  `runAdmission`'s verdict acceptance, not a runner decision" (§05 §5.2 step 3) —
  admission code, landing in D9's `admission.ts` PR (the §8.1 table books the two
  Phase-2 admission changes together as D8/D9) while the control-run *execution* below
  stays in this PR's runner: for a
  guard-train admission, the accepted release-gauntlet outcome becomes ADMIT /
  ADMIT_WITH_WARNINGS **or** REJECT whose every finding — same `(gateId, categoryCode,
  subjects)`, the fields report verification already checks (admission.ts:686-691) —
  reproduces in a verified **base-commit control run**. The runner *performs* that run:
  the identical fixed release argv in a second detached worktree at the train's base
  commit with no operations applied, writing `eval/.runs/<trainId>-control.json`; the
  control report passes the same confined-path, schema, and freshness verification as
  every admission report (admission.ts:555-560, 627-630) before `runAdmission` compares
  findings. When every red is inherited, `runAdmission` ADMITs and writes the admission
  manifest publish consumes (§05 §5.7), recording **both finding sets and the control
  report's digest**; the draft PR carries the triage note in its body — the mechanized
  "verified byte-identical on clean origin/main" practice of #62/#63/#66 (r4 §5 item 8).
  Any non-inherited red refuses exactly as today and the train stops `verify-failed`.
  **Merging the D8/D9 admission PR is the J17-pattern ratification of this
  inherited-red class** —
  the guard-train half of §09.9's two-class standing-red tolerance; the deferred-signing
  class is ratified by D12b's merge in Phase 3 (§8.7).
- Single-flight (V7): sealing refuses while any train is non-terminal, and — for data
  trains, from Phase 3 — while any identity-moving PR from any pipeline is open **or a
  merged data train's deferred-signing marker is unpaid** (§05 §5.6's third seal
  precondition; §06 FM-8's unpaid-marker rule, from Phase 3 with D12b). Guard
  trains are identity-neutral (PR #62/#63/#66 precedent, r4 §5) and defer only to an
  in-flight repo mutation (the existing 409 `mutation_running` discipline).
- "Start the update" sits behind the Study's one-confirm layer (no irreversible action on
  a bare keystroke — locked Study decision). **How Phase 2 admissions get their signed
  decisions** (runAdmission requires them: `validateDecisions(preview, input.decisions,
  signingKey)` runs right after the measurable-effect check, admission.ts:1442): through
  the **existing** admit surface, `POST /api/v2/admissions/:id/admit` — already wired and
  in `requiresTrustedJson` (server.ts:223), signing with `WORKBENCH_ADMISSION_SIGNING_KEY`
  (server.ts:499) — fronted by the same one-confirm layer, which is exactly §05 §5.2's
  phase bridge for the `ready → admitted` decision. No interim sign panel is built; the
  typed-digest sign endpoint arrives with D14 and fronts that decision for both train
  flavors from then on. The admit route's Phase-2 page-side wiring — the `ROUTES`-mirror
  entry, the split `'/api/v2/admissions/'` … `'/admit'` inline-route literals, and the
  failure sentence — is budgeted in §04 §4.9's work item, not re-budgeted here, and
  retires with D14.
- Three-allowlist wiring for both routes, read-only degradation, failure copy — same
  budgeted work item shape as D6.
- AC: sealing twice returns 409; a vote cast after seal joins the next train (the sealed
  train's digest is immutable — asserted by test); train state renders correctly for a
  crafted fixture of every state including two `stopped(<reason>)` cases; the allowlist
  agreement test extends to the new routes. **The V4 invariant AC §03 §03.2 delegates
  here:** a synthetic manifest containing a layer-affecting operation with no
  same-manifest `golden-fixture-upsert` measuring it is refused at seal with the
  unmeasured operation named — enforced by the deriver's seal-time validator (§03 §03.5
  step 3 — the locus §05 §5.3 names verbatim as "the deriver's seal-time
  validator"), deliberately not
  `parseProposalManifest`. The test is synthetic in Phase 2 (guard trains carry no
  layer-affecting ops) and is exactly the check Phase 3's data trains seal against. The control-run acceptance is covered by
  `workbench/test/trainRunner.standingReds.test.ts` (§06 FM-8's test contract, cases
  a–b): an injected failure absent from the control run stops the train `verify-failed`
  naming the gate; synthetic G2/G8 reds reproducing identically in the control run make
  `runAdmission` ADMIT the guard train, with both finding sets and the control report's
  digest recorded in the admission manifest and the triage note verbatim in the prepared
  PR body.

**D8a. Per-operation fixture targeting** (small PR; may land before or with D8's first
multi-card train)
- The one reviewed `proposals.ts` change 03 §03.2 requires and 02.7 rules on ("amend,
  don't multiply"): replace the manifest-level equality check — every
  `golden-fixture-upsert.goldenFixtureId` "must equal the proposal fixtureId."
  (proposals.ts:813-817) — with per-operation fixture targeting, leaning on the per-op
  path validation that already exists (proposals.ts:526-539). Without it a multi-query
  train cannot ship as one manifest, which V8's one-report-one-signing shape requires.
- AC: a manifest whose `golden-fixture-upsert` operations target two different fixtureIds
  round-trips `parseProposalManifest`; per-operation path ownership is still validated
  (each op's fixture path derives from its own goldenFixtureId); a mismatched op path
  still refuses. Until this merges, the runner refuses to seal a multi-query train with the
  plain-language note §04 mints and carries (§4.5/§4.8: "For now, one update covers one
  search at a time — start this one, and the other calls ride the next update.") — never
  a silent split.

**D9. The fixture-lane measurable-effect exemption** (its own PR — the **Phase-2**
`admission.ts` PR, carrying this exemption and D8's control-run verdict-acceptance
amendment; Phase 3's admission changes are D12b; specification owned by §05, failure
modes by §06)
- Today `runAdmission` refuses any admission without measurable effect before any mutation
  (`if (!preview.measurableEffect) return { status: 'NO_MEASURABLE_EFFECT', … }`,
  admission.ts:1441). The waiver applies **exactly and only** to manifests whose every
  operation is fixture-class (`golden-fixture-upsert`, `fixture-corpus-chapter-add` —
  two of the eleven operation types, proposals.ts:11-24), on the PR #63 rationale quoted
  in V7: "fixtures are the measuring instrument, not the data being measured … the merge
  IS the ruling". The exemption and its rationale are recorded in the admission manifest.
- AC: a manifest containing any non-fixture-class operation still refuses with
  `NO_MEASURABLE_EFFECT` when nothing moved; a fixture-class-only manifest proceeds and
  its admission manifest records the exemption; the recording is asserted byte-level in a
  test. The PR body states this is a reviewed extension of a covenant enforcement point;
  **merging it is the J71 ratification** (§8.7).
- Rollback: revert restores the unconditional refusal; no data is affected.

**D10. Admission evidence writer** (one PR)
- The train runner authors the admission evidence for the sealed train — the input
  `previewAdmission` consumes. Today that registry
  (`workbench/review-data/admission-evidence.json`, server.ts:106) is **read-only to the
  server: nothing in `workbench/src` writes it; only tests author it by hand** (r2 §5.1).
  This deliverable is the first writer it has ever had, writing the medium §05 §5.2
  fixes: a train-scoped entry in that existing registry, keyed by
  `proposalId = <trainId>` — a machine-assembled cache of facts derivable from the sealed
  artifacts, never a decision record.
- AC: after a guard train seals and its fixture-lane preview completes (guard trains
  never enter `built` — §05 §5.2), `GET /api/v2/admissions` lists the train's entry with
  state READY; the entry round-trips `previewAdmission` without hand edits.

**D11. Shakedown + end-to-end guard train** (exit criterion for the phase)
- **The proposals→admission→publish pipeline has never run end-to-end in anger**: the
  working copy has no `workbench/admissions/`, no `workbench/.state/`, no `refinement/*`
  branches in the log (r2 §6, open Q2). This phase budgets a real shakedown, not a paved
  road: expect to find and fix seams (evidence shapes, path confinement, journal recovery)
  the first time the chain runs for real.
- Implementer work, sandboxed: run one complete guard train in an isolated state root —
  `WORKBENCH_JUDGMENTS_PATH` (server.ts:92) pointed at a synthetic log, candidates and
  worktrees under the confined `workbench/.state` — through seal → apply in isolated
  worktree → `npm run verify` → draft PR against a scratch remote, then a second real run
  producing an actual draft PR from a real vote (like the Study P4 real signing run that
  wrote a fixture in 14 append-only lines).
- AC: the real draft PR exists with: the fixture diff, the provenance quoting the
  judgmentIds and the voter's own words, and the standard PR-body sentence "This draft
  preparation does not merge, release, publish an artifact, or dispatch a workflow."
  (publishPreparation.ts:1049-1093). The train reaches `pr-open`; after hand-merge it
  reads `live`. Every seam found in the shakedown is either fixed in-phase or filed with
  a named owner.

**Gate wiring:** the train's worktree runs `npm run verify` (build + typecheck + test +
gauntlet — the full 13-row roster on the fixture bed). New fixtures enter as
`status: 'pending'` and cannot fail the build; a pending fixture that starts passing is the
existing promotion trigger (corpusGolden.ts:1215-1222) and rides the admission's
`fixture-promotion` decision slots (V4). While the standing G2/G8 red persists, every
train's verify additionally pays D8's base-commit control run — budgeted in the machine
estimate below. The train view renders the gate table only from the actual machine
report; before the run it says the checks haven't run yet (ground rule 3).

**Rollback:** revert the PRs; any sealed-but-unmerged train's branch is deleted and its
cards return to `approved` (the store is append-only, so the history of the attempt
remains).

**Estimate:** ~1.5–2.5k lines across ~3–4 PRs (D8, D8a, D9, D10; D8a may fold into D8's
PR): runner ~350–550 (control-run execution included), proposals per-op targeting (D8a)
~40–80 + tests, evidence writer ~150–250, admission changes ~150–250 + tests (D9's
fixture-lane exemption plus D8's control-run verdict-acceptance amendment — the
inherited-red comparison lives in `runAdmission`, not the runner), endpoints/UI ~400,
tests ~600–700. Machine time per
guard train: roughly 15–40 minutes (worktree + full verify), **plus a comparable
base-commit control run whenever the verdict is red — roughly double for every train
until D12a's signing clears the standing G2/G8 red** (estimate — measure in the
shakedown and print the measured number in the train view thereafter). (Rate basis §8.8.)

---

### 8.5 Phase 3 — Data trains

**What it is for Jesse:** votes that need theme-file changes now complete the loop. He
approves the cards, starts the update, and comes back to one plain-language Update Report:
every query that would change, before → after, in his vocabulary. He signs with the typed
code (the same friction Finish up already taught him), a draft PR opens with everything
attached, and he merges. Active time per cycle: about ten minutes in the inbox, about four
on the report and signature, about a minute to merge — **≤ 15 minutes active**. The machine
works unattended between his two touches: **30–90 minutes** running the engineering checks
against a trial copy of the data — the report is honest that this is not instant.
(Technically: candidate build + two full gauntlet runs + the admission worktree rebuild;
the decomposition and commands are in §05.)

**Standing precondition and sequencing (per V8; §05 §5.5 states the full identity-fact
set once for the plan):** the J39 baseline approvals are unsigned (v1 @ 0.9.0) and the
committed descriptor is the stale v0.7.1 phantom. For this pipeline the debt is a **hard
block, not a triage tax**: the standing G2/G8 red makes the in-worktree release gauntlet
REJECT, and `runAdmission`'s parser "admits only ADMIT / ADMIT_WITH_WARNINGS"
(admission.ts:580-584) — the recent hand PRs could pay the red as mere triage only
because they never went through `runAdmission`. So **no data train can pass admission
until the first J39-class signing lands** (§05 §5.5; §06 FM-8 states the same block; the
deferred-signing marker deliberately cannot cover the historic debt). That signing is
therefore sequenced as this phase's entry deliverable, D12a below, and D15's full exit
criterion gates on it. The Update Report carries the standing-red note verbatim until it
clears.

**What exists already:** everything heavy. Candidate build
(`npm run build:candidate --workspace pipeline -- --request <requestPath>`,
candidateBuilder.ts:598-604, tested and uncalled); the comparison runner (`publishComparison`,
no HTTP caller); the admission preview's verification that a candidate gauntlet report was
produced in the fixed admission mode with the exact argv
`--require-admit --json <reportPath> --candidate-descriptor <path> --candidate-database <path>`
(admission.ts:603-616) and is fresh (≤24h) and identity-bound; `runAdmission`'s isolated
worktree rebuild + release gauntlet + manifest with per-file rollback bytes (r2 §3.3);
the typed-digest sign mechanics (12-hex chip, full digest to the server, 409
`stale_preview` — the Finish-up pattern, r8 §5); the jobs/SSE streaming surface.

**Built new:** job wiring for the three heavy stages, the Update Report generator, the
sign endpoint, the review-coverage capture, and the Phase-3 half of §05 §5.5's gap
closures (D12b — this phase DOES touch `admission.ts` and `publishPreparation.ts`, as
§8.1's table says). One governance event, D12a, is sequenced ahead of the first data
train's admission. As in Phase 2, sealing records the replay identity but runs no
automated V6 replay until D16 — FM-2's triad — D1's full-triple compile warning, the
derive-time pre-check, and human review — carries staleness through this phase too.

**D12a. Phase-3 entry: the first J39-class signing** (a hand-authored governance PR, not
pipeline code; sequenced before the first data train's admission)
- The historic debt is cleared once, by §05 §5.5's numbered post-merge procedure run
  against settled main: an independent signer designated per A2 (§09 — never the change
  author), the read-only review packet, a dated review record under `docs/reviews/`, and
  two hand-authored schema-v2 approval records chained via `priorProvenance`. It rides no
  train and clears no train's own regen (§05 §5.5).
- AC: on clean main, the release gauntlet's G2/G8 rows read green; D8's control run finds
  an empty inherited-red set thereafter.
- Honest fallback (A1/A2, §09): if no independent signer is available, Phase 3's exit
  evidence stops at **built and measured** — sandboxed end-to-end runs plus one real
  train held pre-admission — and never claims "validated draft PR", because an
  unsigned-debt data train cannot pass `runAdmission` at all. D12–D14 are still built and
  tested meanwhile (their tests run against synthetic identities in the sandboxed state
  root); only D15's real-train exit waits.

**D12. Pipeline stages as workbench jobs** (one PR)
- Candidate build, comparison, and the candidate gauntlet become allowlisted workbench
  jobs surfaced through the existing `POST /api/v2/checks` + SSE events pattern
  (server.ts:1244-1276) — extend the exact-match `JOB_IDS` allowlist; no free-form
  commands cross the HTTP boundary (the browser "never supplies a command" — control-plane
  rule, r2 §5). The candidate gauntlet job invokes the exact admission argv above and
  writes its report under `eval/.runs/` where admission requires it (admission.ts:555-560).
- AC: a data train seals → the three jobs run in order with live status in the train view;
  cancel works; a mid-run server restart resumes or stops cleanly with a
  `verify-failed`-class stop, never a half-written state (§06 owns the full failure
  table); the job allowlist rejects any unknown jobId.
- Machine-time honesty: the train view shows elapsed and last-measured durations, never an
  "almost done" guess.

**D12b. Admission/publish extensions for data trains** (one PR — the Phase-3 reviewed
changes to `admission.ts`, `publishPreparation.ts`, and `candidateBuilder.ts`, specified
in §05 §5.5 and ratified per §09's decision list)
- Closes §05 §5.5's remaining gaps, without which data trains are unimplementable as
  choreographed: **(gap 1)** add `eval/baselines/ordering.snapshot.json` and
  `eval/baselines/ordering.snapshot.approval.json` to publishPreparation's
  `ALLOWED_SOURCE_PATHS` (publishPreparation.ts:28-34 omits them today — a data train's
  regenerated snapshot would stop `outside-allowlist`) and add the two matching diff
  kinds: `ordering-snapshot` beside the existing `probe-baseline` kind
  (`appendProbeDiff`, admission.ts:919-933) and `ordering-snapshot-approval` beside
  `probe-approval` (`appendProbeApprovalDiff`, admission.ts:935-948);
  **(gap 2)** the deferred-signing-marker amendment to the `probe_approval_missing`
  pairing refusal (admission.ts:979-999), plus the marker's gauntlet-expectation half for
  data trains (gap 3's second half — the train's own designed G2/G8 red verified
  finding-for-finding against the marker's prediction, never waived); **(gap 4)** the
  candidate builder's narrowly-scoped corpus-movement permission for proposals containing
  `fixture-corpus-chapter-add` (candidateBuilder.ts:460-489 refuses it today).
- AC: the ordering snapshot and its approval enter the allowlist only as a pair (the
  paired-travel test mirrors the existing probes pair); on an admission **not** carrying
  the marker, a hand-authored ordering approval travels as admission *input* through the
  `ordering-snapshot-approval` kind, path-locked to its single owned file — mirroring
  `appendProbeApprovalDiff` exactly (§05 §5.5 gap 1); an admission carrying the marker
  records it in the admission manifest — the train's pre-regen base identity and the
  expected post-merge identity, the A2 designation requirement, the
  merge-first-sign-once citation; an admission **not** carrying the
  marker refuses exactly as today (`probe_approval_missing` intact, asserted by test);
  a marker whose identity mismatches the regenerated baselines buys nothing (§06 FM-8's
  test case f: the pairing refusal stands); and sealing a data train while a prior merged
  train's marker is unpaid is refused with §06 FM-8's plain-words copy (its test case g,
  `trainRunner.standingReds.test.ts` — this is what arms D8's third single-flight
  precondition, §05 §5.6).

**D13. Baseline regen in-branch + merge-first-sign-once** (same or separate PR)
- After a candidate gauntlet ADMIT, the runner performs the sanctioned regeneration in the
  train's worktree branch as **two separate runs — `npm run gauntlet -- --update-baseline`
  and `npm run gauntlet -- --update-ordering-snapshot` — each executed twice and
  byte-compared** (4 runs total; §05 §5.2 step 5's exact argv adopted verbatim, the PR #65
  double-run proof, r4 §5), churn reported in the Update Report. Separate runs because the
  CLI refuses to combine an update flag with `--require-admit`/`--json` and refuses them
  against an explicit candidate/release target ("review the new baseline separately",
  gauntletMachineReport.ts:322-340) — a run cannot attest to the baseline it just
  generated, so these are separate invocations from the gauntlet runs, by design.
- The regenerated baselines land in the PR; **the approval records are deliberately NOT
  written by the machine — writing them is the human approval act** (r4 §3; the one
  recorded independence lapse is why this is restated, A2 in §09). Signing happens
  post-merge, against the settled identity, by the per-review designated independent
  person: merge-first-sign-once (V8, the J39 ruling).
- AC: the train PR diff contains regenerated `eval/baselines/probes.json` and
  `ordering.snapshot.json` and **no** `*.approval.json` change; a test asserts the runner
  refuses to write approval files; the double-run comparison is recorded in the train
  evidence; the Update Report states in plain words that an independent person signs
  after the merge.

**D14. Update Report + typed-digest sign** (one PR)
- `POST /api/v2/updates/train/:id/sign` — the last of the five fixed endpoints, wired
  through the three allowlists like D6/D8. The Update Report lists every changed query
  before → after in plain language; approving it is recorded per-query, which is what
  satisfies the admission blocker that every changed top-10 query be reviewed, exactly,
  no extras (admission.ts:819-832) — with blind Compare one click away for spot checks
  (V8). The sign panel reuses the Finish-up mechanics exactly; digests appear only on the
  sign chip.
- From this deliverable on, the typed-digest sign fronts the `ready → admitted` report
  approval for **both** train flavors (§05 §5.1's state table), replacing Phase 2's
  interim bridge — the one-confirm layer over the existing admit endpoint (D8).
  "Start the update" keeps its one-confirm layer; sealing is recoverable and needs
  friction, not a signature.
- AC: Playwright covers report render, per-query review capture, sign-code mismatch,
  409 stale re-preview, and the D28 regex at zero matches over the report body (the chip
  is the sole digest surface). An unreviewed changed query blocks admission with the
  existing blocker copy.

**D15. Real end-to-end data train** (exit criterion; gates on D12a — a real train cannot
pass admission before the first signing lands)
- Implementer work: one full data train in the sandboxed state root (as D11), then —
  after D12a — one real train from a real vote, through candidate build → comparison →
  candidate gauntlet → regen → admission (signed decisions) → draft PR with the
  provenance table (V11) in the body alongside the identity table and gauntlet digests
  the PR-body generator already produces (publishPreparation.ts:1049-1093).
- AC: the PR body maps each operation to its judgmentIds and quoted evidence; the
  train reads `pr-open` then `live` after hand-merge; the **per-train** post-merge
  signing path is exercised once for real (independent reviewer authors the v2 approvals
  against the settled post-merge identity — the recurring obligation, distinct from
  D12a's one-time historic-debt clearing). While D12a has not landed, the phase's exit
  evidence is D12a's stated fallback — the sandboxed run complete and the real train
  held at `measured` with its Update Report generated — an honest, demonstrated
  stopping point, never described as a validated draft PR.

**Gate wiring:** the full roster runs twice per data train — the candidate gauntlet
(13 rows, explicit target, so G12 runs) verified by admission, and the release gauntlet
inside the admission worktree (admission.ts:1220-1240). Both no-effect predicates are in
force and V12 governs which gates what: the workbench comparison predicate
(admission.ts:834-840) gates train admission; the gauntlet's three-anchor detection
(rankMetrics.ts:1389-1399) gates the PR in CI. `no-measurable-effect` is a stop, and the
cards return to the inbox with the honest explanation (V12).

**Rollback:** revert the PRs; a sealed data train that never merged leaves only a branch
to delete and evidence files under confined state paths. A **merged** train's rollback is
the admission manifest's per-file rollback bytes + a revert PR (§06 owns that path).

**Estimate:** ~2–3k lines across ~3–4 PRs: jobs wiring ~300–500, admission/publish/builder
extensions (D12b) ~200–350, report generator ~300–400, sign panel + endpoint ~300,
coverage capture ~200, tests ~900–1,100. Machine time
per data train: 30–90 minutes unattended (Part 3 contract number — candidate build + two
gauntlet runs + admission worktree rebuild + verify are heavy). (Rate basis §8.8.)

---

### 8.6 Phase 4 — Steady state and retirement

**What it is for Jesse (or his successor):** the system now minds itself between cycles.
Votes cast under an older engine or data state are re-checked automatically when a train
seals — already-fixed things resolve themselves and say so; genuinely changed things come
back as one plain question instead of a stale assumption. The old printed checklist is
gone because the inbox replaced it. A successor can run the whole loop from the runbook
without asking anyone anything.

**D16. Seal-time staleness replay** (one PR)
- Implements V6 in full: at seal, re-run every contributing query against the artifact
  the workbench currently serves (that replay identity is recorded in the seal), with the
  three dispositions — expectation already achieved (drop the data op, keep the guard,
  auto-resolve the card as "already achieved — guarded"), materially equivalent (proceed,
  record the machine-supported reconfirmation), materially changed (flag `stale`, route to
  a `stale-judgment` re-confirmation case, the existing first-class source —
  judgments.ts:31-39). This supersedes both the old layer-only warning and D1's interim
  full-triple warning (compileJudgments.ts:426-438), which is retired here with a comment
  pointing at the replay.
- AC: unit tests per disposition on synthetic pairs (vote identity ≠ replay identity);
  the auto-resolved card's copy renders; an `irrelevant` guard is still derived when the
  offender fell away (regression protection; G3 reports vacuity honestly if the ref
  leaves the corpus — V6). Staleness handling is the normal path, not an edge case: the
  layerFingerprint moved 4 times in ~11.5 hours during active curation (r4 §6), and the
  tests encode that cadence.

**D17. Stop-reason surfacing + stale-reconfirm cards** (one PR)
- Every reason in the closed stop enum (V5) renders with the recovery copy and recovery
  path §06 defines; a stopped train shows what stopped it and its one next action.
  A stalled `pr-open` train revalidates and stops on `main-moved` rather than merging
  stale (the frozen-queue behavior A1 depends on — §09).
- AC: Playwright renders all 14 stop reasons from crafted states; no reason falls through
  to a generic message; D28 regex zero matches.

**D17a. Multi-voter readiness note** (no code now — the Phase-4 readiness item 02.4
promises this section carries)
- Before any second voter ever exists, land the one-line `judgments.ts` reviewer-match
  tightening: supersession validation today matches query, case, and target key but not
  reviewer (judgments.ts:439-441 — `matchingSupersessionTarget` takes no reviewer), so
  the rule becomes: a plain correction must share the prior's `reviewer`; a cross-voter
  supersession is valid only as the recorded resolution of a conflict card (02.4 rule 4).
  Unreachable under single-reviewer operation, so it is deliberately not built now —
  multi-voter identity is the successor-governance plan's territory — but it is named
  here so the item cannot be lost when that plan lands.

**D18. Checklist retirement + compile direct-path tombstone** (one PR; requires J72 —
§8.7)
- The printed manual checklist is retired: the deriver's cards have subsumed it (V1), the
  Updates screen has replaced its Phase 0 preview rendering, and the `checklist` field is
  removed or emptied with a tombstone comment, the way the v1 judgment endpoint became a
  method-agnostic 410 ("one stray v1 append could brick compile-judgments forever",
  server.ts:1704-1714 — the house tombstone pattern). The `compileJudgments` direct CLI
  write path is tombstoned likewise. Finish up remains a screen — its ownership split
  with Updates is §04's; the default carried here is that Finish up keeps its per-sitting
  answer-sheet write and the deriver continues pinning those fixtures as
  `sourcePreconditions` (ground rule 6 made permanent unless §04 says otherwise).
- AC: compile preview no longer emits checklist items; the tombstoned path answers with
  a clear refusal naming the Updates screen; a guard test (oneClickPlanGuard-style)
  asserts the checklist never returns.
- Retiring a guardrail stays a human decision by design (V15) — hence the J72 gate.

**D19. PR #20 doc supersession note** (small PR — the V16 hygiene item)
- Add a note to `docs/one-click-review-to-live-implementation-plan.md` stating which
  stages this plan supersedes, so a successor cannot implement the pre-amendment
  auto-merge stages still readable there by mistake. The existing live guard
  (oneClickPlanGuard.test.ts:25-29) already asserts "No automation merges to `main`."
  stays and auto-merge language never returns; this note rides inside that protection.
- AC: the guard test still passes; the note names this plan by path and date.

**D20. Successor runbook + copy review + metrics polish** (one PR)
- A runbook section (HANDOFF-linked) walking one full cycle with zero tacit knowledge:
  every command with exact argv for the implementer paths, every reviewer step as a Study
  screen. The invented P2/P3 copy strings Jesse never reviewed (r6 §6) plus every string
  this plan minted — §06's two Jesse-facing sentences included (FM-2's
  unresolvable-reference copy and FM-8's unpaid-marker seal-refusal copy) — go through
  one copy review and land in the COPY block.
- Lightweight metrics on the Updates screen: cycles completed, votes awaiting cards,
  median vote→live time — counts derived from `updates.jsonl` and the PR states, no new
  telemetry.
- AC: a cold-start walkthrough executed from the runbook alone by someone who did not
  build the system (the phase's exit test); copy inventory has zero unreviewed strings;
  D28 regex clean.

**Gate wiring:** no new gates; D16's replay runs engine queries in-process (statistics and
lookups only — the deriver covenant, §03).

**Rollback:** D16/D17 revert cleanly; D18's revert restores the checklist field (the
tombstone is code, not data); D19/D20 are docs/copy.

**Estimate:** ~1–1.5k lines across ~4–5 PRs (D16, D17, D18, D20, plus the small D19;
D17a is no-code). (Rate basis §8.8.)

---

### 8.7 J-registry slotting

The J-registry (J1–J70) lives in the master plan's Appendix A; its ground rule is that
nothing on it may be decided by an agent (r5 §1). This plan touches existing items and
proposes two new slots. J71's and J72's full decision text and defaults live in
§09's decision list (§09.9 — decision-text ownership is 09's); the table only fixes where
each ruling gates a phase. Proposed numbers were checked against the registry at assembly
(2026-08-27): the registry runs J1–J70 (master plan Appendix A), so J71 and J72 are free.

| Item | What it is | Gates which phase |
|---|---|---|
| **J39** (existing) | Independent baseline signing; unsigned as of 2026-08-27 | Hard-blocks data-train admission (§8.5); the debt-clearing first signing is Phase 3's entry deliverable D12a, and D15 exercises the recurring per-train post-merge signing once for real |
| **J66** (existing) | The triage boundary — "anything interpretive, pastoral, doctrinal, any new/changed anchor or weight" comes to the human | Encoded structurally in the §03 mapping (V3); no phase may relax it |
| **J17 pattern** (existing) | Merge = ratification | The mechanism by which J71/J72 below are ratified — and by which §09.9's two-class standing-red tolerance lands in halves: the D8/D9 merge ratifies the inherited-red class (Phase 2), the D12b merge the deferred-signing class (Phase 3) |
| **J59** (existing) | Pericope preaching-themes; chapter-tag ranking deferred to the P6.6·B7/J59 path | Out of scope here entirely (§8.9) |
| **J71** (proposed) | Ratify the fixture-lane measurable-effect exemption — the reviewed change to `runAdmission`'s refusal (admission.ts:1441) for fixture-class-only manifests | Phase 2 D9: **merging the D9 PR is the ratification**; until merged, guard trains cannot run |
| **J72** (proposed) | Approve retirement of the printed checklist + compile direct write path (a guardrail retirement, V15); decision text in §09.9 | Phase 4 D18: merging the D18 PR is the ratification |

J72's decision line — the retire-the-checklist question with its tombstone-the-house-way
default — is carried in §09.9's decision list (decision-text ownership is 09's); retiring
any guardrail stays a human decision by design (V15), hence the D18 gate.

No J46-style vote-mass threshold is needed anywhere in this plan: votes arrive one at a
time from a human and every vote derives its card deterministically — there is no
promotion queue to gate by volume (V3; contrast the B2 topic-gap report, which is bulk
input and keeps its J46 gate).

### 8.8 Estimate honesty — rate basis

All sizes above are **estimates**, not measurements. Rate basis: The Study itself shipped
as five phases (PRs #38/#45/#48/#49/#50), each a comparable-scope PR merged within about
two days of the prior (r6 §6); the modules being reused are large but already tested
(`admission.ts` 1,558 lines, `publishPreparation.ts` 1,332, `proposals.ts` 873,
`compileJudgments.ts` ~1,007 — r2 §§1–4), so the new code is mostly thin coordination and
UI. The two deliberately un-estimated unknowns: the Phase 2 shakedown (D11 — the pipeline
has never run in anger, so its seam-fixing cost is unknowable in advance and is budgeted
as its own deliverable rather than padded into others), and the Phase 3 signings
(D12a and D15 — both depend on an independent human's availability, A1/A2). Machine-time
numbers: 30–90 minutes per data train is the Part 3 contract figure; the ~15–40 minute
guard-train figure (doubled by the control run while the standing red persists, §8.4) is
an estimate to be replaced by the shakedown's measured number.

### 8.9 What this plan deliberately does NOT build (with the rule each rests on)

- **Multi-reviewer support or any auth system.** Single reviewer is locked
  (`WORKBENCH_REVIEWER ?? 'jesse'`, server.ts:97; "multi-reviewer anything" was explicitly
  out of scope for the Study and stays out here). Who reviews after wind-down is A1/A2 —
  a governance swap, not a feature (§09).
- **Chapter-tag ranking.** Ruled 2026-08-22: tags stay display-only; ranking integration
  is explicitly deferred to the P6.6·B7/J59 pericope path, fixtures-first,
  gauntlet-measured (the Keller ruling, r5 §2). No vote-derived card may mint a bare
  concordance word as a concept — that diagnosis routes to concept-curation.
- **Sweep-adjudication batching.** The ~100+-PR sweep backlog has its own plan
  (`/mnt/project-files/plans/2026-08-27-sweep-adjudication-plan.md`); the two pipelines
  share the single-flight identity-mover discipline and governance pattern but not intake
  or batching machinery (V16). One sentence of coordination code (the shared "one identity
  mover in flight" check) is in D8; nothing more.
- **Release minting, descriptor PRs, tags, consumer re-pins.** V15: the release vehicle
  (`artifact/<date>` data-only tags) and the consumer contract (§5 of
  `docs/implementation-plan.md`) are owned elsewhere; trains end at merged data on main.
- **Battery-judgment seeding from Study votes.** `eval/battery/judgments.json` is a
  different store with its own J17 ratification gate and sha-pinned vote-source lint
  (judgmentProvenance, r1 §9); this plan neither writes it nor borrows its name — "vote"
  here means a Study judgment only (Part 2 terminology).
- **Any weight knob, theology score, or per-result tuning surface.** Forbidden by
  covenant #6 and the jesse-workbench-ux-feedback law (V3): derived anchors default to
  weight 1.0, cards say so, and no phase adds a knob.

---

## 09. Governance & swappable assumptions

**Recommendation: state who does what as three named assumptions — A1, A2, A3 — each safe today, each with a named swap trigger and a defined meanwhile-behavior, and invent no governance system of our own.** This is deliberately the shortest section of the plan. Its job is honesty: the successor-governance plan (plan-ideas survey item #1) is unwritten (`/tmp/claude/memory/team/silo/plan-ideas-survey-2026-08-27.md:15`), so anything this plan says about who reviews, who merges, and who signs is an assumption, not a settlement. Other sections reference these assumptions by A-number; they are defined only here (V14).

One thing is not an assumption, under any flip of any assumption below: **the human merge is the admission event, and the pipeline's ceiling is a draft PR.** "No automation merges to `main`" (`docs/one-click-review-to-live-implementation-plan.md:25`), and granting anything beyond draft-PR-only — "merging, tagging, releasing, or updating a consumer without a human hand on each action — requires an explicit, separately reviewed amendment to CLAUDE.md's non-negotiables. That amendment is Jesse's decision alone" (`docs/one-click-review-to-live-implementation-plan.md:592-596`). Swapping A1–A3 changes *which human* holds a gate — never whether the gate exists (V13).

---

### 09.1 A1 — who merges trains

**The assumption.** While Jesse is present, his merge of a train's draft PR is the admission event, exactly as it is for every data PR today ("nothing merges without a human"; "each merge IS the engine-admission event" — the HANDOFF governance record as carried into `/mnt/project-files/plans/2026-08-27-sweep-adjudication-plan.md:144`). This is already ratified practice, not a new grant: the 2026-08-26 sweep-launch ruling established merge-as-admission for agent-drafted, fixtures-first data PRs with no pre-review (`/tmp/claude/memory/team/silo/sweep-launch-2026-08-26.md`, Decision #6).

**Why it is safe today — and how short "today" is.** It changes nothing while he is present: Jesse merges every PR now, usually within hours (`/tmp/claude/memory/team/silo/dashboard-plan-2026-08-22.md:19-33`); the train merely arrives as one well-evidenced PR instead of many. But the plan does not get to assume that presence: he announced "only a couple more days left on this project" on 2026-08-25, and as of this plan's date that window is essentially closed (`/tmp/claude/memory/team/silo/project-wind-down-2026-08-25.md:11`, per r6 §4). The frozen-queue default below is therefore the **expected day-one operating mode**, not a remote contingency, and the machinery is built to run that way indefinitely.

**What swaps it.** The successor-governance plan (survey item #1, unwritten) designates the merging human. This plan adopts the sibling sweep-adjudication plan's assumption verbatim in spirit rather than minting a rival one — its §5 states, of its own batches: "Admission = merge by the human the successor-governance plan (proposed but not yet written) designates. Until that plan exists, batches accumulate as **VALIDATED DRAFT PRs** … and **nothing merges**" (`/mnt/project-files/plans/2026-08-27-sweep-adjudication-plan.md:148`).

**Meanwhile (the frozen-queue default).** After wind-down, with no designated merger, the system freezes in a *validated* state, not a stalled one — and because of single-flight (one train in a non-terminal state at a time; a data train defers to any open identity-moving PR — V7), the frozen shape is precise:

- **At most one train sits at `pr-open`**: a VALIDATED DRAFT PR — checks run, Update Report complete, provenance bound. It is ready to merge the day governance is decided. **While the unsigned-J39 debt stands, that occupant is in practice a guard train**: a data train cannot pass `runAdmission` at all until the first signing lands (§09.2), so an unsigned data train freezes upstream at admission awaiting a signer — it never reaches `pr-open`.
- **Upstream, the inbox holds its shape rather than growing new judgments.** Cards Jesse approved before wind-down wait as `approved`, seal-ready the moment the queue unfreezes; anything derived after accumulates as `drafted`, because card approval is a `WORKBENCH_REVIEWER` act (A2) with no authorized holder until the successor-governance plan designates one — and the vote log is closed to new non-provisional votes for the same reason (J17, §09.8). Nothing is lost: judgments and card events are append-only (V5).
- **The `pr-open` train cannot rot silently.** If main moves under it, the train stops with `main-moved` and must be revalidated before anyone merges it — it never merges stale (section 06 owns the stop's mechanics and recovery copy). A stopped or long-idle train is visible on the Updates screen with its state and age; nothing about waiting is invisible or lossy, because every input is an append-only judgment (V5) and re-derivation at the next seal picks up exactly where the log left off.

The frozen queue works unattended: no cron, no expiry, no automated escalation — just a draft PR that stays validated or honestly stops, and an append-only inbox that loses nothing while it waits.

---

### 09.2 A2 — who approves cards, and who signs baselines

**The assumption, part one (cards).** The inbox approver is the workbench reviewer — a single-reviewer identity, `WORKBENCH_REVIEWER`, defaulting to `jesse` (`workbench/src/server.ts:97`; `workbench/src/judgments.ts:195`), locked by The Study's design. Approving a card is the first human gate (it is the `confirmed: true` act the proposal provenance structurally requires — V9); the train's PR merge (A1) is the second. The same person may hold both gates today; that is acceptable because both are *his own* judgment about *his own* votes.

**The assumption, part two (baselines).** J39-class baseline approvals are different in kind and stay different: the signer must be a **distinct, per-review designated independent person — never the change author, never the card approver acting alone**. The governance doc is explicit: the reviewer "**did not author the change** … not the data, not the code, not the proposal", "**is a distinct identity** from the repository owner acting alone on his own machine — a second pair of eyes, not a second hat", and "**is designated by Jesse, per review.** There is no standing reviewer role" (`docs/governance/probe-baseline-review.md:10-21`). This plan restates it because independence has lapsed exactly once before — a G8 baseline approval signed as independent but authored on Jesse's own machine (`/tmp/claude/memory/team/silo/workbench-v25-audit.md:12`) — and a per-train signing cadence multiplies the temptation. Per V8's merge-first-sign-once choreography, approvals are authored **after** the train's PR merges, against the settled identity ("the approval records were deliberately **not** rewritten — writing them is the human approval act" — PR #64 body, per r4 §4; the merge-first ordering itself is HANDOFF's first-hour ruling, HANDOFF.md:10), one signing event per data train.

**Why it is safe today.** Single-reviewer matches reality (one voter, one curator); the per-review signer designation is the registry's own standing rule (J39, `/mnt/project-files/plans/2026-08-20-implementation-plan.md:902`).

**What swaps it.** Two named future decisions: (a) the successor-governance plan naming the standing workbench-reviewer identity — until it does, card approval and non-provisional voting stop with Jesse (the freeze pinned in §09.1), and (b) an answer to the signer-designation question — "designated by Jesse, per review" is undefined once Jesse is gone, so **the J39 signer path after wind-down is an open Jesse call**, listed in §09.9. Neither flip changes the train machinery: cards still require a confirming human, baselines still require a non-author signer, and the merge stays the admission event.

**Meanwhile.** The standing J39 debt (approvals still v1 @ engine 0.9.0, unsigned — the V8 precondition) is a **hard block on the data lane, not a tax**: the standing red makes the in-worktree release gauntlet REJECT, and `runAdmission`'s parser "admits only ADMIT / ADMIT_WITH_WARNINGS" (`workbench/src/admission.ts:580-584`) — so **no data train can pass `runAdmission` at all until the first J39-class signing lands**. Section 05 §5.5 therefore makes that first signing a Phase 3 prerequisite (one hand-authored governance PR against settled main), 06 FM-8 carries the same block, and §08 sequences Phase 3 accordingly. Guard trains proceed meanwhile: identity-neutral, they inherit the standing red rather than cause it, and the control-run inherited-red rule (06 FM-8) — an amendment to `runAdmission`'s verdict acceptance, never a runner decision — is what lets `runAdmission` admit guard trains — manifest written, draft PR opened — over provably inherited reds. From the first signing onward, merge-first-sign-once does its work — each data train completes through merge without waiting on its own signing, then owes exactly one post-merge signing; an unpaid one refuses the next data-train seal (FM-8's unpaid-marker rule), so the debt blocks throughput honestly instead of accumulating silently.

---

### 09.3 A3 — who rules on theology

**The assumption.** No mechanism in this plan rules on doctrine, ever — that is covenant #6 ("It never adjudicates", CLAUDE.md). Interpretive and doctrinal questions raised by cards route to a human per the J66 boundary: "anything interpretive, pastoral, doctrinal, any new/changed anchor or weight, anything crisis-adjacent" always comes to the human (`/mnt/project-files/plans/2026-08-20-implementation-plan.md:935`); V3's mechanical/interpretive line is that boundary implemented. Doctrinal *framing* questions — is this passage-framing sound to carry at all — go to the theology-rulings ledger (`/mnt/project-files/rulings/2026-08-27-theology-rulings-ledger.md`, Jesse's pick #3), not to a card button.

And one hard floor: **no vote can override DOCTRINAL-BASIS §4's explicit non-criteria** — baptism mode/subjects, election, continuation/cessation of gifts, gender roles, millennial views, polity (`docs/DOCTRINAL-BASIS.md:141-149`). A "Not relevant" vote on a secondary-point framing derives a per-query fixture guard at most — the pipeline records that *you marked it* Not relevant for *that query* — never a source gate or a concept deletion. "Gating on a secondary point imports one congregation's position into every consumer's search results" (`docs/DOCTRINAL-BASIS.md:160-162`); "This list is load-bearing" (`docs/DOCTRINAL-BASIS.md:168-170`). The deriver enforces this structurally: no judgment class maps to a source-gating or concept-deleting operation (the V3 table has no such row, and the operation vocabulary is the closed set in `workbench/src/proposals.ts`).

**Why it is safe today.** It grants nothing new; it wires existing rulings together.

**What swaps it.** Two triggers: Jesse's formal ratification of DOCTRINAL-BASIS.md (its header still says it "has no authority until" he approves, `docs/DOCTRINAL-BASIS.md:3-9` — this plan treats §4 as binding on the deriver regardless, since honoring it can only *narrow* what votes may do, never widen it); and the successor-governance plan naming who holds the theology-ruling pen after wind-down.

**Meanwhile.** A card whose open question turns out doctrinal is parked ("Not now") with a pointer into the rulings ledger; it re-enters the inbox when a ruling exists. Parked is a first-class card state (V5) — nothing is dropped.

---

### 09.4 What stays manual — permanently and by design (V15)

**What NOT to automate.** Each item below stays a human act forever under this plan, and each names the rule it rests on. A future plan revision may move an item only by amending the named rule through its own reviewed process.

| Stays manual | The rule it rests on |
|---|---|
| The PR merge (every train, every phase) | CLAUDE.md #1 (human PR merge); "No automation merges to `main`" (`docs/one-click-review-to-live-implementation-plan.md:25`) |
| J39-class baseline approvals | "Writing it IS the approval act" — no code path authors an approval (`docs/governance/probe-baseline-review.md`); A2 |
| Concept minting and theme labels (cards pre-fill a draft; the concept-curation skill finishes it) | "theme selection is interpretive judgment" — J59 (`/mnt/project-files/plans/2026-08-20-implementation-plan.md:925`); J66 boundary |
| `eval/budgets.json` threshold changes | J42: each null→value flip "always from a real ≥3-run history, never a guess" (`/mnt/project-files/plans/2026-08-20-implementation-plan.md:905`); CLAUDE.md gate discipline |
| Everything on the one-click NOT-allowlist: ranking/tokenizer code, schema/migrations, provenance/licenses/manifests/checksums, gauntlet budgets, workflows/secrets/branch protection, arbitrary paths | `docs/one-click-review-to-live-implementation-plan.md:263-281`; such diagnoses become `needs-engineering` cards — the *card kind*; `engineering-required` is the *stop reason*, the train event a next-derivation conversion reads (§03 §03.8's one-to-one convention, carried identically in 06) — never train operations |
| Release mint, descriptor PR, tag push | The tag push IS the release decision (J47; HANDOFF release runbook) — a different plan's territory (§09.5) |
| Doctrinal rulings | A3; covenant #6 |
| Retirement of any guardrail | CLAUDE.md gate discipline ("Never let an unrun check report `pass`") |

The deriver never silently drops what it refuses to derive: a refusal becomes a routed card (section 03), so the manual list above is visible work, not lost work.

---

### 09.5 The consumer contract: what a train may and may not touch

Three apps — Maskil, LH Worship Setlist, Versed — pin `(engine semver, artifact descriptor)` (CLAUDE.md, Consumers), and "Upgrading either half is an explicit re-pin of both" (`docs/CONSUMERS.md:24`).

**What a train MAY change without consumer coordination: layer and fixture data, and the fingerprints they move.** A merged train changes main; it changes nothing any consumer runs, because "A new release … changes nothing for any consumer until that consumer deliberately re-pins" (`/mnt/project-files/HANDOFF.md:217`). Train output reaches a consumer only through the manual release chain (§09.4) followed by that consumer's own deliberate re-pin. The steady-state vehicle for accumulated train output is the data-only `artifact/<date>` release — "an artifact-only refresh ship[s] at its own tag … with no engine bump: the steady-state cadence once data changes outpace code changes" (`docs/implementation-plan.md:406-415`).

**What a train may NOT change: any public type or consumer-visible surface.** The deriver's vocabulary is the existing closed set of data operations (V1/V3); schema, migrations, and engine code are on the NOT-allowlist (§09.4), and CLAUDE.md's standing rule applies to anything else: "check the consumer contract in `docs/implementation-plan.md` §5 before changing a public type." A card whose fix would require an engine, schema, or API change becomes a `needs-engineering` card and exits this pipeline.

**Scope honesty (one sentence each):** release minting and the v0.14.0 path belong to the HANDOFF release runbook, not this plan; consumer re-pins belong to each consumer's own repo per `docs/CONSUMERS.md`; sweep-candidate batching belongs to the sweep-adjudication plan (§09.6).

---

### 09.6 Coexistence with the sweep-adjudication pipeline, and one hygiene item (V16)

Both pipelines end the same way — fixtures-first data PRs merged by a human — and they **share** the disciplines that must not fork: the single-flight identity-mover rule (a train defers to an open sweep batch and vice versa; one identity mover in flight, total — V7, and the observed cost of racing is real: PR #65 is on its third mechanical baseline regen, `/tmp/claude/memory/team/silo/alias-measurement-track-2026-08-26.md:19`), the theology-rulings ledger routing (A3), and merge-is-admission governance (A1). They do **not** share intake or batching: sweep candidates arrive at bulk scale from ledgers; votes arrive one at a time from a human and carry per-vote provenance the sweep lacks. Neither pipeline processes the other's intake.

**The contention story, stated rather than assumed.** The two pipelines share one identity-mover slot and one human. The sweep backlog is bulk — ~400 concept adds, ~2,100 anchor + ~1,100 lexicon + 85 new-concept candidates, batched at ~15–20 packs per fixtures-first PR ≈ 100+ PRs (`/tmp/claude/memory/team/silo/plan-ideas-survey-2026-08-27.md:11`, per r6 §10; the ~15–20-pack batching per r5 §5) — so under single-flight a data train can genuinely wait behind an open sweep batch, repeatedly and for as long as the sweep flows. The arbiter of the slot is the A1 merging human's queue order — this plan invents no scheduler — with one stated default: **a sealed data train takes the next slot ahead of the next sweep batch**, because it is the smaller, human-initiated unit whose reviewer has already spent inbox minutes on it, while sweep batches are elastic backlog. Two honest consequences follow: train cadence degrades to "when the current identity mover closes" whenever sweep batches are open (05 §5.10's weekly rhythm is a suggestion the slot contention can override — the plan says so rather than promising a cadence it cannot arbitrate), and the same single reviewer (A2) absorbs both review streams — cards by the ≤15-minute cycle plus sweep-batch merges — which is an argument for the sweep plan's batching discipline and against this plan ever adding a third stream.

**Hygiene item (deliverable in Phase 4):** the merged PR #20 one-click document still contains its pre-amendment auto-merge stages in readable history, and the plan-audit warned it "should be amended before anyone implements it" (`/tmp/claude/memory/team/silo/pr20-one-click-plan-audit.md:18`). The draft-PR-only cap amendment itself is not pending: it landed via merged PR #28 (commit `1537d7b`, "docs: cap the one-click plan at draft-PR"), so it carries merge-level ratification and now reads at `:585-601`. What remains is only readability: Phase 4 lands a short supersession note in `docs/one-click-review-to-live-implementation-plan.md` stating that this plan is the implemented successor and that the cap amendment governs — so a successor cannot implement the dead stages still readable in history by mistake.

---

### 09.7 The multi-curator future: what data supports, what governance must decide

**Already supported by the data model (section 02 owns the details; referenced, not restated):** every judgment binds its `reviewer` per record, every derived operation's provenance names the reviewer and the judgmentIds behind it, and every card binds its votes (V11). A second curator's votes would be attributable end-to-end *today* without a schema change.

**Deliberately deferred to the successor-governance plan — three decisions this plan does not make:**

1. **Trust** — who besides Jesse may author non-provisional judgments. This is J17's own open question, verbatim: "name who besides you may author non-provisional judgments" (`/mnt/project-files/plans/2026-08-20-implementation-plan.md:871`).
2. **Quorum** — whether one reviewer's card approval suffices, or N-of-M.
3. **Tie-breaks** — what happens when two *different* curators' votes conflict. (Today's conflict card, V10, resolves one reviewer's self-contradiction by a superseding vote; cross-reviewer conflict is a genuinely new policy.)

**Where the decision plugs in when it comes:** `WORKBENCH_REVIEWER` becomes a per-session identity instead of a single env default (`workbench/src/server.ts:97`), and the shared effective-judgments core (section 03) gains a reviewer-trust input to its selection rules. Card grammar, train lifecycle, and choreography do not change. Until then: single reviewer, and multi-reviewer support is explicitly out of this plan's scope.

---

### 09.8 J-registry touchpoints, one line each

- **J17** — this plan assumes the answer to "who besides you may author non-provisional judgments" is *no one yet* (single reviewer, A2); ruled differently, §09.7's plug-in point activates and nothing downstream of the deriver changes.
- **J39** — this plan assumes per-review signer designation continues and signing happens once per data train, post-merge (V8); a ruling that creates a standing reviewer role would *simplify* A2's open signer-path call, and the standing unsigned debt remains a hard block on data-train admission until the first signing lands either way (§09.2).
- **J46** (`/mnt/project-files/plans/2026-08-20-implementation-plan.md:909`) — this plan assumes the vote-mass promotion threshold governs topic-gap curation, not Study votes (cards derive from individual judgments with no accumulation threshold — one vote is enough to draft a card); ruled differently, the deriver would gate card drafting on a threshold held as reviewed data, in the same spirit as B2's "The report is an INPUT to curation, never an auto-import" (`/mnt/project-files/plans/2026-08-20-implementation-plan.md:597`).
- **J66** — this plan adopts the triage boundary verbatim as V3's mechanical/interpretive line; if Jesse moves the line, the V3 mapping table is redrawn in a plan revision — the derived-operations column never widens past J66 silently.

---

### 09.9 Decisions that are genuinely Jesse's

Because his window may close before he rules on any of these (§09.1), every default below is engineered to stand indefinitely, and each names the behavior it produces unattended.

**Decision (open):** Ratify the fixture-lane measurable-effect exemption — waiving `runAdmission`'s no-effect refusal exactly and only for manifests whose every operation is fixture-class, with the exemption recorded in the admission manifest (V7; section 05 specifies the change)? — *Default: yes, per the PR #63 precedent: "fixtures are the measuring instrument, not the data being measured … the merge IS the ruling" (PR #63 body).* His because it is a reviewed change to an admission guardrail, and guardrail changes are owner territory (CLAUDE.md gate discipline). Unattended: the change is a Phase 2 reviewed PR whose human merge is its ratification (08's D9; exact spec in 05 §5.3); until that merge, nothing is waived.

**Decision (open):** Ratify the deferred-signing amendment to admission's paired-approval refusal (`probe_approval_missing`, `workbench/src/admission.ts:979-999`) — a moved baseline may travel without a fresh approval only when the admission manifest records a **deferred-signing marker** (both identities — the train's pre-regen base identity the standing approvals bind, and the expected post-merge identity — plus the A2 designation requirement and the merge-first-sign-once citation), together with its gauntlet-expectation half, the two-class standing-red tolerance (05 §5.5 gaps 2–3; failure modes in 06 FM-8)? — *Default: yes, per the standing J39 merge-first-sign-once ruling (HANDOFF.md:10; PR #64 body): the refusal as written encodes the sign-before-merge world that ruling superseded, and the amendment records the deferral as a decision instead of skipping it silently.* His for the same reason as the fixture-lane exemption: it weakens a fail-closed admission guardrail. Unattended: the tolerance lands in halves by the J17 pattern (§08 §8.7) — the inherited-red guard-train class is **Phase 2** code whose D8/D9 merge is its ratification, while the deferred-signing class here is Phase 3 code (D12b) — and until each half's PR merges, nothing in that half is weakened; the data lane stays hard-blocked exactly as §09.2 states.

**Decision (open):** Confirm A1's frozen-queue default — after wind-down, trains validate and wait, and nothing merges until the successor-governance plan names the merging human? — *Default: yes; it mirrors the sweep-adjudication §5 assumption already delivered to him (`/mnt/project-files/plans/2026-08-27-sweep-adjudication-plan.md:148`).* His because only the owner can delegate the admission event. Unattended: the default *is* the behavior — the queue freezes in the exact shape §09.1 describes.

**Decision (open):** Name the J39 signer path after wind-down — who designates the independent baseline signer once "designated by Jesse, per review" (`docs/governance/probe-baseline-review.md:19-21`) has no Jesse? — *Default: none invented, and the plan states what that honestly costs: guard trains continue (the control-run inherited-red rule, 06 FM-8), while **data trains freeze awaiting a signer** — before the first J39-class signing, at `runAdmission`'s hard block (§09.2); after it, at FM-8's unpaid-marker seal refusal — until the successor-governance plan lands a signer path.* The frozen data lane is the price of leaving signer independence undelegated rather than improvised. His because signer independence is the one control no one may grant themself — the recorded lapse (§09.2) is the proof it needs a named path, not an improvised one. Unattended: guard trains flow, the data lane waits, and nothing pretends otherwise.

**Decision (open):** Arm the per-train operation cap — enforced as a seal-time refusal, never a silent trim (06 FM-6) — at the number 05 §5.10 proposes from its review-minutes math, **24 operations per train**, or at whatever number D11/D15's measured shakedown supports? — *Default: the cap ships deliberately unset with the refusal off — the review-minutes 24 is a derivation, not a measured basis, and per CLAUDE.md's threshold rule a guessed threshold that never fires reads as protection; 24 is a proposal, never a default in force.* His because arming it gates a seal rather than suggesting one — a reviewed number in the budgets-are-data spirit (CLAUDE.md gate discipline). Unattended: the seal never refuses on count — the cap stays unarmed until an arming PR merges (05 §5.10 and 06 FM-6 state the same shipped state); meanwhile the seal preview shows the operation and changed-query counts and FM-6's interim backstops hold.

**Decision (open):** Retire the printed manual checklist and the `compileJudgments` direct write path once the deriver's cards have subsumed them (J72; §08 D18)? — *Default: yes, tombstoned the house way — the v1 endpoint's method-agnostic 410 pattern (`workbench/src/server.ts:1704-1714`) — and only after Phases 0–3 have demonstrated that the cards carry the same facts.* His because retiring any guardrail is a human decision by design (V15). Unattended: nothing retires — the checklist keeps printing beside the cards until the D18 PR merges, and that merge is the J17-pattern ratification (§08 §8.7).

Everything else in this section is a Claude-decidable default, adopted above with its rationale in place — including the two cadence nudges 05 §5.10 points here: the "suggest an update" banner at **8 approved cards** waiting or **7 days** since the last `live` train. Those are UI nudges, not gates — deliberately kept out of `eval/budgets.json` (a threshold that never fires reads as protection — CLAUDE.md gate discipline), Claude-decidable, and revisable here without a plan revision.

---

### 09.10 Successor-executability

Every governance-touching step in this plan is runnable from `HANDOFF.md` plus this document alone: A1–A3 are stated here with their swap triggers named as documents or registry items, not people's memories; the standing preconditions (unsigned J39 approvals, stale committed descriptor, single-flight) are stated inside the plan (V8, Part-3 identity facts) rather than assumed from ambient context; and every command a phase needs appears with exact argv in sections 05 and 08. A successor who has read nothing but HANDOFF and this plan knows exactly what they may do before governance names them (read every card, report, and log; seal already-approved cards into guard trains and run them to validated draft PRs; revalidate the standing `pr-open` train when main moves), what each successor-governance designation unlocks (approving cards and authoring non-provisional votes, as the named `WORKBENCH_REVIEWER` — A2/J17; merging, as the A1 human; signing baselines, as the per-review independent designee), what no designation ever unlocks (ruling on doctrine mechanically — A3), and which single unwritten document unfreezes each gate.

---

## Appendix A — shared terminology

The exact terms every section uses; no section invents synonyms (spine Part 2, binding).

| Term | Meaning | Never called |
|---|---|---|
| **vote** | one v2 judgment (Essential / Helpful / Not relevant / Missing passage), Jesse-facing word | "judgment" on Jesse-facing surfaces |
| **judgment** | the v2 record in `workbench/judgments.jsonl` (technical sections) | "vote record" |
| **card** | one derived, self-contained review unit in the Updates inbox | "proposal item", "task", "checklist item" |
| **the deriver** | `workbench/src/deriveUpdates.ts`, the pure judgments→cards/manifest function | "compiler" (that's compileJudgments) |
| **train** | one sealed batch of approved cards → one branch, one PR, one report, one signing | "batch", "release", "run" |
| **guard train / data train** | fixture-only train / layer-moving train (V7) | — |
| **seal** | the act freezing a train (digest over judgmentIds + cards + replay identity) | "lock", "freeze" |
| **cycle** | one full loop: inbox review → train → merge → live | "sprint", "session" |
| **Updates** (screen) | the inbox surface in The Study | "Proposals", "Queue" |
| **Update Report** | the one plain-language per-train review document (changed queries, before→after, gate table) | "Admission Report" (that's the gauntlet's) |
| **Admission Report** | the gauntlet's verdict document (existing term) | — |
| **answer sheet** | golden fixtures, in Jesse-facing copy (existing shipped term) | "fixtures" on Jesse-facing surfaces |
| **the checks** | the gauntlet, in Jesse-facing copy (existing shipped term) | "gauntlet" on Jesse-facing surfaces |
| **reviewed update** | what ships after a merge (the shipped contract copy's term) | "deploy", "release" (unless the artifact release is meant) |
| Card states | `drafted`, `approved`, `declined`, `parked` (+ derived flag `stale`) | any other words |
| Train states | `open`, `sealed`, `built`, `measured`, `ready`, `admitted`, `pr-open`, `live`, `stopped(<reason>)` | any other words |
| Stop reasons | the one-click closed enum, verbatim (V5) | invented reasons |
| Governance assumptions | `A1`, `A2`, `A3` (V14) | — |
| **replay identity** | the (engineVersion, corpusFingerprint, layerFingerprint) of the artifact the workbench serves at seal time | "current identity" (ambiguous) |

Plain-language register: Jesse-facing copy quotes ship verbatim, live in one COPY-style block, and pass the D28 jargon regex (`[0-9a-f]{8}-`, `sha256`) with zero matches; digests appear only on the sign chip and Advanced surfaces.

---

## Appendix B — how this plan was produced

**Process.** This plan was assembled on 2026-08-27 through a staged workflow: (1) **research** — eight ground-truth files (r1–r8: workbench votes, proposals pipeline, engine data gauntlet, determinism and baselines, J-registry and consumers, Jesse's context and voice, the vote inventory, review-UX conventions), every file:line citation verified against `origin/main` @ `0d12c34`; (2) **spine** — a design spine fixing the sixteen V-decisions, the shared terminology (Appendix A), the cross-section contracts (time budget, phases, endpoints, identity facts), and per-section ownership, so nine authors could write without contradicting each other; (3) **per-section harsh-critic loops** — each of the nine sections drafted and then cycled through adversarial critic/revise rounds against a failable acceptance bar (hard-constraint, Jesse-excellence, successor-executability, evidence, coherence, and product checks), 68 agents in total; (4) **reconciliation** — a deduplicated cross-section worklist applied and verified so single-writer facts (the mapping table, the card grammar, the train-state copy, A1–A3) have exactly one owner and every cross-reference lands; (5) **verification and assembly** — every owed reconciliation edit re-checked as landed in the final section files, residual assembly notes resolved, and the document assembled with sections 01–09 verbatim.

**Section outcomes** (critic scores on a 10-point bar; rounds = critic/revise iterations):

| § | Section | Final score | Rounds |
|---|---|---|---|
| 01 | Vision & the per-cycle loop | 9.2 | 3 |
| 02 | Data model — what a vote becomes | 9.2 | 2 |
| 03 | The deriver — votes to proposals | 8.7 → final fixes verified | 6 |
| 04 | Review UX — the Updates inbox | 8.0 → final fixes verified | 6 |
| 05 | Cadence, gauntlet & baseline choreography | 9.2 | 5 |
| 06 | Failure modes & safeguards | 9.2 | 4 |
| 07 | Migration — votes already collected | 9.0 | 3 |
| 08 | Implementation phasing | 9.2 | 6 |
| 09 | Governance & swappable assumptions | 9.0 | 2 |

Honesty note on 03 and 04: their last critic verdicts preceded one final revise pass each; every remaining objection's fix was then verified present in the section text during reconciliation, and re-checked at assembly. The scores above are the last critic-issued numbers, reported as issued.

**Resolved at assembly** (the only edits made to the passed sections, none touching technical content): two informational "verified landed" HTML assembly-note comments removed from §03; three stale "reconcile at assembly / coherence pass reconciles" directives in §04 converted to their landed statements (the chip casing note, the §5.1 label-column reference, the §5.2 guard-report-lead reference — the 05-side edits they demanded were verified already present); §08 §8.7's "provisional until checked against the registry" note resolved by checking the J-registry (J1–J70 occupied; J71/J72 free).

*End of plan.*
