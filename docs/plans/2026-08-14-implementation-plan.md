# Scripture Search Engine — Implementation Plan (2026-08-14)

Assembled from 11 approved item sections, all verified against origin/main HEAD
`5033517` (2026-08-14; zero commits since the 2026-08-13 audit). Ground truth:
`plan-context.md`. Every item below scored 9 and is approved (status table, §2).

---

## 1. Executive summary (for Jesse, in plain language)

**What gets fixed first (Phase 0).** Today the project's green checkmark is a lie in
both directions: every commit shows a red X because one test suite compares a frozen
calendar date against today's date, so a real regression would look identical to the
noise. The apps are cut off: npm still serves engine 0.7.1, which refuses the current
data file, so everything added since July — translation-neutral search, the 33-concept
ontology, pastoral-care coverage — is invisible to Maskil, LH Worship Setlist, and
Versed. Nobody can rebuild the search data from scratch because all three upstream
downloads changed bytes under our pins. An old write endpoint is still live and one
stray request to it would permanently break the review-to-fixture pipeline. And the
"Not relevant" button regressed back to demanding engine jargon from you. Phase 0
fixes all of that, publishes engine 0.9.0 with a release process that can never again
ship bytes that don't match their reviewed identity, and closes the governance holes:
the search-quality baseline gets a genuinely independent reviewer instead of a
self-signed stamp, and the merged automation plan is amended so nothing ever merges to
`main` but you.

**What gets stronger (Phase 1).** Typing the one word you'd actually type starts
working: "comforter" puts John 14 above Job's "miserable comforters"; "peace" puts
Philippians 4:6-7 first instead of double-counting 1 Peter 5:7; "holiness", "healing",
"temptation", "baptism", "comfort", "new creation", "cornerstone", and "doubt" all land
on curated passages with honest source chips. Five ranking defects are fixed under one
engine version bump. Search results that fall inside one section of Scripture merge
into a single passage-level result ("Psalms 136:1-26") instead of eating five slots
with fragments. A typo like "fathfulness" gets a cited correction instead of an empty
page, and hymn lines like "it is well with my soul" land on the passages a curated
alias table names. Underneath, the evaluation system stops being decorative: rank
positions are pinned, a silent reordering fails the build unless the version moved in
the same commit, the "NO MEASURABLE EFFECT" verdict finally exists in code, and every
alarm is proven to ring.

**What you'll be asked to do.** Merge PRs in the order in §4 (each one states exactly
what to check); upload a handful of source-snapshot files to a GitHub Release; run two
one-click mint workflows and push two release tags (v0.9.0, then v0.13.0); designate
an independent reviewer for the search-quality baseline; sign a series of baseline
approvals (each with a readable before/after diff); make the theology and wording
calls only you can make (anchor weights, the "love" bare-word decision, alias
targets, question phrasing, the boundary threshold); and decide on one lawyer
question (a counsel pass on the translation-variant index before commercial
shipment). The full consolidated checklist is §8.

---

## 2. Item status table

| # | Item key | Title (short) | Approved | Score | Review rounds |
|---|---|---|---|---|---|
| 1 | `ci-timebomb` | Fix the red-main admission-test time-bomb | yes | 9 | 3 |
| 2 | `release-repair` | Repair release/artifact pipeline, publish 0.9.0 | yes | 9 | 2 |
| 3 | `workbench-hardening` | Close v1 judgment endpoint; restore not-relevant flow | yes | 9 | 1 |
| 4 | `governance` | Independent probe-baseline review; amend one-click plan | yes | 9 | 3 |
| 5 | `source-drift` | Re-pin drifted upstream sources as reviewed re-admissions | yes | 9 | 1 |
| 6 | `lexicon-concepts` | Single-word lexicon pass + six missing concepts | yes | 9 | 2 |
| 7 | `ranking-fixes` | Five ranking behavior fixes (one engine bump) | yes | 9 | 3 |
| 8 | `pericope-grouping` | Passage-level results via pericope grouping | yes | 9 | 2 |
| 9 | `spelling-aliases` | Deterministic spelling correction + curated aliases | yes | 9 | 2 |
| 10 | `eval-toughening` | Rank-aware eval, real G6, ordered snapshots | yes | 9 | 2 |
| 11 | `consumable` | Contract, docs, cadence for consumer apps | yes | 9 | 2 |

---

## 3. Global working conventions (hoisted; apply to every item)

Stated once here; the per-item sections no longer repeat them.

1. **Local verify green before any PR opens.** Jesse merges within ~1-2 minutes of a
   PR opening, before CI concludes (team memory), so the pasted local
   `npm run verify` output is the evidence that matters at merge time. On a fresh
   checkout run `npm run build:engine` first — `engine/dist` does not exist after
   `npm ci`.
2. **`ci-timebomb` precedes everything.** Until it lands, `npm run verify` shows 15
   pre-existing `workbench/test/admission.test.ts` failures on every run. No other
   item's PR opens before it merges.
3. **Windows CI tmpdir gotcha** (team memory `windows-ci-tmpdir-gotcha`): any test
   passing a fresh tmpdir to a guard that compares `realpath(p)` must canonicalize at
   creation (`await realpath(await mkdtemp(...))`) — never weaken the guard.
4. **Nothing auto-merges.** Every PR lands through Jesse's human merge (CLAUDE.md #1).
   No item weakens a gate; a gate that cannot run reports `not-applicable` with a
   reason.
5. **Fixture-first for data** (CLAUDE.md "Adding data"): golden fixture before the
   data; `NO MEASURABLE EFFECT` means don't merge. Two execution variants (defined in
   `lexicon-concepts` §Changes and reused by every data item): *new concepts* author
   the fixture `pending` with the failing run as branch evidence and flip `active` in
   the same commit as the data (G3 coverage requires it — `holiness.json` precedent);
   *existing active fixtures* are strengthened in place, never demoted.
6. **Item keys** are canonical for cross-references. Aliases used in earlier drafts
   map as: `admission-clock-fix` / `main-red-test-clock` / `admission-test-clock-fix`
   / `ci-timebomb-fix` → **`ci-timebomb`**; `manifest-repin` / `source-repins` /
   `rolling-source-repins` → **`source-drift`**; `release-descriptor-remint` /
   `artifact-descriptor-repair` / `ci-minted-descriptor` → **`release-repair`**;
   `g6-real` / `eval-hardening` → **`eval-toughening`**; `concept-coverage` →
   **`lexicon-concepts`**.

---

## 4. Dependency-ordered sequence

### Phase 0 — Fix what's broken

| Step | Item / PR | Depends on |
|---|---|---|
| 0.1 | `ci-timebomb` — one PR | — |
| 0.2 | `workbench-hardening` PR A (close v1 endpoint) | ci-timebomb (soft, CI readability) |
| 0.3 | `workbench-hardening` PR B (not-relevant flow) | ci-timebomb (soft) |
| 0.4 | `source-drift` PR A (drift sentinel + cache fix) | ci-timebomb |
| 0.5 | `source-drift` errand — Jesse uploads source snapshots | — (upload-first, before 0.6) |
| 0.6 | `source-drift` PR B (WEB re-pin + re-baseline) | 0.4, 0.5, ci-timebomb |
| 0.7 | `source-drift` PR C (OpenBible re-pins + re-baseline) | 0.6 |
| 0.8 | `release-repair` PR 1 (release machinery) | ci-timebomb |
| 0.9 | `release-repair` mint run + PR 2 (descriptor) + **tag v0.9.0** | 0.7, 0.8 |
| 0.10 | `governance` PR-G1 (packet tool, policy, publish path) | ci-timebomb |
| 0.11 | `governance` PR-G2 (approval schema v2 + independent re-review) | 0.10; re-issues the then-current (post-0.7) baseline approval in v2 form |
| 0.12 | `governance` PR-G3 (amend one-click plan doc) | 0.10 (test file); cites release-repair, may merge any time after 0.10 |

**Rationale.** `ci-timebomb` blocks the credibility of every other CI signal — it is
first, unconditionally. `workbench-hardening` PR A removes a live land-mine (one
stray v1 write bricks `compileJudgments` forever) and is tiny. `source-drift` must
precede `release-repair`'s mint: `fetch:sources` fails today on all three drifted
sources and the mint must build from reviewed pins. `release-repair` then gets engine
0.9.0 and a verified artifact to the three apps — the single most consumer-visible
fix. `governance` closes Phase 0: it is placed *after* the v0.9.0 release so
designating an independent reviewer (human latency) never blocks the release, and it
costs nothing extra — PR-G2 re-issues the current baseline approval in v2 form
regardless of when it lands, and placing it before Phase 1 means **every subsequent
approval in this plan is written exactly once, in v2 form**, using PR-G1's review
packet tool. Source-drift's two Phase-0 approvals are written in today's v1 shape and
superseded by PR-G2's v2 re-issue (one planned re-issue, not a rework).

### Phase 1 — Make results stronger

| Step | Item / PR | Depends on |
|---|---|---|
| 1.1 | `eval-toughening` PR-A (ordered snapshot + approval tripwire) | ci-timebomb; after source-drift (not interleaved with a re-pin) |
| 1.2 | `eval-toughening` PR-B (rank-aware fixtures + gate honesty) | 1.1 |
| 1.3 | `lexicon-concepts` PR 1 (peace dedup + duplicate-anchor guard) | ci-timebomb, governance (v2 approvals) |
| 1.4 | `lexicon-concepts` PR 2 (bare-word inventory + 3 gap closures) | 1.3 |
| 1.5 | `ranking-fixes` PR-1 (pending fixtures) | 1.1, 1.2 (snapshot polices the bump), 1.3 (peace handled there) |
| 1.6 | `ranking-fixes` PR-2 (**ENGINE_VERSION 0.10.0**, squash-merged) | 1.5, governance |
| 1.7 | `eval-toughening` PR-C (rank metrics + NO_MEASURABLE_EFFECT) | 1.1 (priorProvenance anchor exists) |
| 1.8 | `lexicon-concepts` PR 3 (comfort pair) | 1.4 |
| 1.9 | `lexicon-concepts` PR 4 (baptism, new-creation, cornerstone, doubt) | 1.8 |
| 1.10 | `pericope-grouping` PR 1 (schema **v7** capability, zero churn) | ci-timebomb, source-drift |
| 1.11 | `pericope-grouping` PR 2 (**ENGINE_VERSION 0.11.0**) | 1.10 |
| 1.12 | `spelling-aliases` PR 1 (spelling, schema **v8**, **0.12.0**) | 1.11 (takes schema slot after v7), source-drift |
| 1.13 | `spelling-aliases` PR 2 (aliases, **0.13.0**) | 1.12, lexicon-concepts (targets exist), ranking-fixes (peace inheritance) |
| 1.14 | `eval-toughening` PR-D (real G6 property gate) | 1.6 (G6 constants check exists to merge with) |
| 1.15 | `eval-toughening` PR-E (gate mutation harness) | 1.14 |

**Rationale.** `eval-toughening` PR-A/PR-B land first so every subsequent ordering
change in this phase — four engine bumps — is mechanically policed (snapshot +
approval regenerated in the same commit or G2 fails). `lexicon-concepts` PR 1 lands
before `ranking-fixes` because the peace fix is data-side and independent, and
`ranking-fixes` then *restores* the dual-source citation on the cleaned entry (the
two items' agreed division; see §6 Harmonization #3). Data PRs (1.3, 1.4, 1.8, 1.9)
and engine PRs alternate so each G8 re-approval diff stays on-topic. Pericope and
spelling take schema slots v7 and v8 in landing order; both land before the Phase-2
mint so consumers see one schema transition (6 → 8). PR-D follows `ranking-fixes`
because by then G6 is the reviewed-constants equality check, which PR-D extends with
executed properties rather than replacing a hardcoded pass.

### Phase 2 — Make it consumable

| Step | Item / PR | Depends on |
|---|---|---|
| 2.1 | `consumable` PR 1 (CHANGELOG formalization + release guard) | release-repair (which seeds the CHANGELOG) |
| 2.2 | `consumable` PR 2 (stable API tier, error semantics, matrix) | 2.1; rides unpublished 0.13.0 — no extra bump |
| 2.3 | `consumable` PR 3 (CONSUMERS.md, artifact-client, quickstart, counsel flag) | release-repair (descriptor `release.tag` field) |
| 2.4 | Phase-1 terminus release: mint schema-8 artifact → descriptor PR → **tag v0.13.0** | all Phase-1 engine/data items; release-repair cadence |
| 2.5 | `eval-toughening` PR-F (consumer conformance kit) | 2.4 (canonical attested artifact) |
| 2.6 | `spelling-aliases` PR 3 (optional alias expansions, repeatable) | 2.4 cadence established |

**Dependency verification.** Every hard dependency declared in the item sections is
satisfied by this ordering: `ci-timebomb` precedes all (steps 0.2+); `source-drift`
precedes `release-repair`'s mint (0.7 < 0.9) and both schema-bumping artifact builds;
`release-repair` precedes `consumable` (0.9 < 2.1) and `eval-toughening` PR-F
(0.9/2.4 < 2.5); `governance` precedes every Phase-1 G8 re-approval (0.11 < 1.3);
`eval-toughening` PR-A/PR-B precede `ranking-fixes` (1.1/1.2 < 1.6) as that item
requests; `lexicon-concepts` and `ranking-fixes` precede `spelling-aliases` PR 2
(1.9/1.6 < 1.13); `pericope-grouping` PR 1 precedes `spelling-aliases` PR 1 for the
schema slot (1.10 < 1.12). No item is sequenced before any of its declared
dependencies. Soft dependencies (ordering-only) are likewise honored or explicitly
noted in the harmonized sections.

---

## 5. Consolidated ENGINE_VERSION / G8-baseline strategy

**Principle.** CLAUDE.md #2 binds per *commit*: any commit that can alter ordering
carries the bump. Bumps between npm publishes cost consumers nothing — the scarce,
expensive events are (a) *published* versions and (b) *G8 baseline re-approvals*,
each of which demands independent human review. The strategy minimizes those two
without hiding any change; nothing is batched beyond what its own item's review can
honestly absorb.

### 5.1 Version ladder

| ENGINE_VERSION | Carried by | Ordering change | Published? |
|---|---|---|---|
| 0.9.0 | current tree | — | **yes — Phase 0, tag v0.9.0** (release-repair; schema-6 artifact) |
| 0.10.0 | `ranking-fixes` PR-2 (one squashed commit) | five ranking fixes batched under one bump | no (in-repo) |
| 0.11.0 | `pericope-grouping` PR 2 | passage grouping behavior | no (in-repo) |
| 0.12.0 | `spelling-aliases` PR 1 | spelling correction (+ schema v8) | no (in-repo) |
| 0.13.0 | `spelling-aliases` PR 2 | curated alias evidence path | **yes — Phase 2, tag v0.13.0** (schema-8 artifact) |

- **Consumers see exactly two engine releases** (0.7.1 → 0.9.0 → 0.13.0) and one
  schema transition (6 → 8), because `pericope-grouping` PR 1 (schema v7) and
  `spelling-aliases` PR 1 (schema v8) both land before the Phase-2 mint, and the
  engine at 0.13.0 opens schemas 1–8.
- **Batching already maximal inside items:** `ranking-fixes` deliberately carries all
  five ordering fixes under one bump in one squashed commit. Batching *across* items
  (e.g., grouping + spelling in one commit) was considered and rejected: it would
  couple unrelated reviews and violate `spelling-aliases`' own review-isolation rule.
  Capability/behavior splits (pericope PR 1, no bump) keep each bump's diff minimal.
- **One bump deleted by harmonization:** `consumable` PR 2's proposed standalone
  0.10.0 identity-only bump is dropped; its additive export restructure rides the
  unpublished 0.13.0 window and is recorded in the CHANGELOG (§6 #6). No
  ordering-affecting change loses its bump anywhere.
- **Mechanical enforcement:** from `eval-toughening` PR-A onward, each of the four
  bumps must regenerate `eval/baselines/ordering.snapshot.json` and rewrite its
  approval **in the same commit**, or the local gauntlet fails (G2 decision-table
  rules 3–6). The bump discipline stops depending on diff-eyeballing.

### 5.2 G8 baseline re-approvals (chained, each written once, in v2 form after 0.11)

| # | Event | Form | Expected churn |
|---|---|---|---|
| a | `source-drift` PR B (WEB re-pin) | v1 (pre-cutover) | 0% — typography-only |
| b | `source-drift` PR C (OpenBible re-pins) | v1 (pre-cutover) | small; community votes moved |
| c | `governance` PR-G2 | **v2 cutover** — re-issues the then-current (post-b) approval with named independent reviewer + evidence packet; same commit as the validator | none (baseline unchanged) |
| d | `lexicon-concepts` PR 1 (peace dedup) | v2 | peace-adjacent probes only |
| e | `lexicon-concepts` PR 2 (inventory + 3 gaps) | v2 | holiness/healing/temptation |
| f | `ranking-fixes` PR-2 | v2, **authored/amended by Jesse himself** (his push or applied suggestion), inline probe diffs in PR body | peace/praise/phrase/lords-supper probes |
| g | `lexicon-concepts` PR 3 (comfort pair) | v2 | comfort-adjacent |
| h | `lexicon-concepts` PR 4 (four packs) | v2 | pack-adjacent |
| i | `pericope-grouping` PR 2 | v2 | multi-verse-passage probes (the feature) |
| — | `spelling-aliases` PRs 1–2 | none expected | 0% (OOV-only; no probe alias-matches) — re-approve only if churn appears |

**Minimization moves, stated so nothing is hidden:** (1) the v2 schema cutover is a
single planned re-issue, positioned so no approval is ever written twice thereafter;
(2) approvals chain `priorProvenance` in strict sequence, so each diff is reviewable
against exactly one predecessor and a revert restores a self-consistent state;
(3) `lexicon-concepts`' four re-approvals are deliberately **not** batched — that
item's rule ("never batched, so each diff is reviewable on its own") stands, but the
PRs are sequenced adjacently so Jesse can review d/e and g/h in single sittings;
(4) every non-ordering item (`workbench-hardening`, `consumable`, `eval-toughening`
PR-B/C/D/E) must show **zero** G8 churn — churn there means something snuck in, and
the PR is wrong, not the baseline; (5) ordering-snapshot approvals (`eval-toughening`
PR-A) never add standalone review events after bootstrap — the four regenerations
ride the four bump commits they attest.

---

## 6. Harmonization decisions (contradictions found and resolved)

All resolutions verified against code at HEAD `5033517` where a factual question was
involved (schema `'6'` at `pipeline/src/schema.ts:22`; `ENGINE_VERSION = '0.9.0'`;
`SUPPORTED_SCHEMA_VERSIONS` 1–6 at `engine/src/createEngine.ts:110`; the 1 Peter 5:7
duplicate at `ontology/concepts/peace-of-god.yaml:33,44` — all reconfirmed
2026-08-14).

1. **Schema-version collision.** `pericope-grouping` and `spelling-aliases` both
   claimed `SCHEMA_VERSION '6' → '7'`. Resolved by landing order: pericope PR 1
   takes **v7**, spelling PR 1 takes **v8** (its DDL is otherwise unchanged); engine
   support becomes 1–8. Consumers still see a single 6 → 8 transition at the Phase-2
   mint.
2. **ENGINE_VERSION collisions.** `ranking-fixes`, `pericope-grouping`,
   `spelling-aliases`, and `consumable` each claimed 0.10.0 from a 0.9.0 base.
   Resolved by the ladder in §5.1: 0.10.0 ranking-fixes, 0.11.0 pericope, 0.12.0
   spelling, 0.13.0 aliases; `consumable`'s bump is dropped (see #6).
3. **peace-of-god double-edit.** `lexicon-concepts` PR 1 (delete the duplicate
   entry, keep the torrey 0.75 entry) and `ranking-fixes` PR-2 step 3 (merge into
   one entry `sources: [torrey, editorial]`, weight 0.85) both edit the same YAML.
   Resolved per the items' own texts: **lexicon-concepts PR 1 lands first** (data
   fix + compile-time duplicate guard; "peace" is fixed for users immediately);
   **ranking-fixes** then (a) implements engine-side `dedupeConceptAnchors` making
   multi-source entries single-scoring, and (b) restores the dual citation
   `sources: [torrey, editorial]` (weight = Jesse's call, default 0.85) on the single
   surviving entry — the one chip then honestly names both sources. Consequently
   ranking-fixes PR-1's pending `ranking-fixes-peace-dedup.json` fixture is
   **dropped** (the active `peace-of-god.json` fixture, strengthened with
   `preferredOrder` in lexicon PR 1, already pins the outcome), and ranking-fixes
   PR-2's importer check is reduced to the **overlapping-range non-blocking
   reporting** only (the identical-range compile error ships in lexicon PR 1).
4. **G6 double-claim.** `ranking-fixes` replaces the hardcoded G6 pass with a
   reviewed-constants equality check; `eval-toughening` Stage 4 "replaces the
   hardcoded pass" with a property gate. Resolved: ranking-fixes lands first, so
   PR-D **merges** `signalBudgetsGate()` alongside the constants-equality check via
   `mergeGateResults` — G6 ends up checking both (constants match reviewed data AND
   properties hold), replacing nothing that runs.
5. **CHANGELOG duplication.** `release-repair` PR 1 adds an `engine/CHANGELOG.md`
   entry; `consumable` PR 1 creates the file. Resolved: **release-repair creates**
   the initial `engine/CHANGELOG.md` (0.7.0, 0.7.1, 0.8.0-BREAKING, 0.9.0 — needed
   before tagging 0.9.0 so the 0.8.0 breaking change is discoverable);
   **consumable PR 1 formalizes** it (Keep a Changelog 1.1.0 structure, `[Unreleased]`
   section, 0.10.0–0.13.0 entries) and adds the release-workflow guard.
6. **consumable's version bump.** Its PR 2 proposed a 0.10.0 lockstep bump for
   additive exports with zero ordering change. Resolved: PR 2 lands in Phase 2 while
   the tree sits at the unpublished 0.13.0; the export restructure rides that
   pending publish with no additional bump, recorded under the 0.13.0 CHANGELOG
   entry. The `release-contract.test.ts:33` lockstep is untouched. G8 must still
   report 0% churn on that PR. `docs/COMPATIBILITY.md` rows become: 0.7.0/0.7.1 →
   schemas 1–5 → v0.7.1 assets; 0.9.0 → schemas 1–6 → v0.9.0; 0.13.0 → schemas 1–8 →
   v0.13.0.
7. **New rolling source vs. empty acknowledgment list.** `source-drift` ends with
   `provenance.acknowledgedUnarchivedRollingSources` empty (its stated goal);
   `pericope-grouping` PR 1 proposed adding `openbible-sections` to that list.
   Resolved in favor of the archive-first pattern source-drift establishes: pericope
   PR 1 instead has Jesse upload the pinned `bible-section-counts.txt` to the same
   source-snapshots Release (upload-first) and sets `archiveUrl` in the new
   manifest — no new acknowledgment, G1 stays clean, and the list stays empty.
8. **Fixture-corpus extension blocker.** `ranking-fixes` deferred Jer 4:10 /
   Rom 3:25 / Ex 25:17 / Mark 15:30 fixtures because the pinned WEB bytes were
   orphaned. After `source-drift` PR B, the re-pinned bytes are on hand; the
   extension is still a follow-up (regenerating `web-subset.json` to include those
   verses is its own reviewed re-baseline) but is no longer blocked.
9. **Alias targets now exist.** `spelling-aliases` skipped comfort/cornerstone
   aliases "until lexicon-concepts lands"; in this sequence it has landed, so the
   starter pack may include them (comfort → `god-of-all-comfort`, cornerstone →
   `christ-the-cornerstone`), and `it-is-well` inherits the *fixed* peace-of-god.
10. **Descriptor `stale` flag phrasing.** Per plan-context: `blocksRelease: true` is
    nested inside the `stale` object of `artifacts/content-artifact.json`, not
    top-level. Semantics unchanged; sections below use the corrected phrasing.
11. **`versification-tvtms`** (referenced by pericope-grouping) is not an item in
    this plan; it is future research and is cited as such.

---

## 7. Per-item sections (harmonized)

Order follows the sequence in §4. Cross-references use item keys (§3.6). Global
conventions (§3) are not repeated. Line citations are to HEAD `5033517`.

---

### 7.1 `ci-timebomb` — Fix the red-main test time-bomb (admission staleness clock)

**Goal.** Nothing changes in search results — this touches only the review tooling's
tests. Today every commit to main shows a red X because `admission.test.ts` freezes
fixture timestamps at 2026-08-11 while the staleness check runs on the real clock;
all 15 failures are `stale_gauntlet`, every run since 2026-08-12T10:00Z. After the
fix, freshness is judged against a test-controlled clock, main goes green on the same
content, and a red X once again means a real problem.

**Current state (verified).**
- `workbench/src/admission.ts:553-559` — `parseGauntletBytes(..., now = new Date())`:
  the fifth parameter defaults to the **real clock**. The check at `:606-608` rejects
  future-dated or >24h-old reports (the 24h window is correct and must not change).
- `:737` — `loadVerifiedGauntlet` passes no `now`; `:914-922` — `previewAdmission`
  has a `trustedGauntletLoader` seam but **no clock seam**. `AdmissionDependencies`
  has `now?` (`:310`) but it is consumed only at `:1415` and `:1426`; the internal
  previews built at `:1340-1347` re-enter the real clock even on the injected path.
- Frozen fixtures: `workbench/test/admission.test.ts:159-160`, `:197`, decision
  `decidedAt` at `:285,289,293,499`, promotion evidence at `:481`; the fake clock at
  `:264` is injected only into `runAdmission`.
- Confirmed by running: **15 failed | 1 passed** — and the one pass is vacuous
  (asserts only `toBeInstanceOf(AdmissionError)` at `:439`, satisfied by the wrong
  error).
- `verifyMachineReportFreshness` (`eval/src/gauntletMachineReport.ts:971-987`)
  already accepts `options.now` — the pattern precedent. Its four production call
  sites are each bypassed by a different test stub or unreachable from this suite
  (`healthSources.ts:293` deliberately stays real-clock — a health endpoint should
  answer against real time).

**Changes (one PR).**
1. `admission.ts` — make `parseGauntletBytes`' fifth parameter **required**
   (`now: Date`, no default); the compiler forces every caller to choose.
2. Add optional `readonly now?: () => Date` to `AdmissionPreviewInput` (mirroring
   `trustedGauntletLoader`; production callers omit it — real clock preserved).
3. `loadVerifiedGauntlet` (`:737`): pass `input.now?.() ?? new Date()`.
4. `runAdmission`'s `previewInput` literal (`:1340-1347`): add
   `now: dependencies.now ?? input.now` so internal previews share the injected clock.
5. Normalize the `admittedAt` fallback at `:1426` to
   `(dependencies.now?.() ?? new Date()).toISOString()` — behavior-identical, exists
   so the step-7 guard needs exactly one permitted shape (the IIFE form does not
   match the guard regex — verified by execution).
6. Test file: derive **every** timestamp from one deliberately-future test clock —
   `TEST_CLOCK = 2050-06-01T12:00Z`, helpers `testNow()` / `at(offsetMs)`; replace
   all absolute literals; add `now: testNow` to `previewInput()`. Any future
   real-clock leak makes 2050-dated reports "future-dated" and fails the same day it
   lands. Tighten the vacuous assertion at `:439` to
   `{ code: 'gauntlet_identity_mismatch' }` (do **not** assert `stale_base` at
   `:377` — the all-zeros commit fails as `command_failed` first, verified by
   execution).
7. Add a clock-boundary tripwire test (inside-window passes only under the injected
   2050 clock; both 24h edges still reject) and a new
   `workbench/test/clockDiscipline.test.ts` — a lint-as-test asserting every
   `new Date()` line in `admission.ts` matches `/\?\?\s*(\(\)\s*=>\s*)?new Date\(\)/`
   (regex verified by execution against every pre/post-fix shape; the guard fires on
   the exact shape of today's bug and permits the three sanctioned fallback sites).

**Data & provenance.** Not applicable.

**Gates & versioning.** No gate affected (the gauntlet is ADMIT at HEAD; the red CI
is the unit-test step). **No ENGINE_VERSION bump**; no fingerprints move; no G8
re-approval; the G2 cross-platform job resumes running once `verify` is green —
restoring, not altering, that guardrail.

**Test plan.** Expected flip: `npx vitest run test/admission.test.ts
test/clockDiscipline.test.ts` goes from 15 failed | 1 passed to **18 passed | 0
failed**. No new Windows exposure (no new tmpdir/realpath surface). Optional
belt-and-braces: rerun under `faketime` — results must be machine-date-independent.

**What Jesse reviews.** One PR, ~8 source lines + tests. Check: the 24h window at
`:607` untouched; production paths pass no clock; the 2050 clock is deliberate; PR
body shows local verify green; one assertion deliberately *narrowed*, none widened.
Optional decision: extend the clock-discipline guard to other workbench files later.

**Risks & rollback.** Future-dated fixtures tripping other clock checks — excluded by
verification (all reachable comparisons are fixed or stubbed; residual risk of a
future test omitting the `verify` stub is loud, documented in the guard's comment).
Rollback: single `git revert`; restores the known red-main state only.

**Dependencies.** None. Everything else lists this item as prerequisite.
**Size.** S — one PR.

---

### 7.2 `workbench-hardening` — Close the v1 judgment endpoint; restore the plain-language not-relevant flow

**Goal.** Two changes, both local-workbench; search results untouched. (1) The live
v1 `POST /api/judgment` endpoint becomes a loud 410 tombstone — today one stray v1
append would make `compileJudgments` fail forever with a cryptic error. (2) The "Not
relevant" button stops demanding engine jargon: no theme evidence → one click records
"matched words, not meaning"; with theme evidence → plain yes/no questions in Jesse's
vocabulary, concept ids wired from the result's own evidence. This restores the v1.1
flow his 2026-08-06 feedback shaped and v2.5 silently regressed.

**Current state (verified).**
- `workbench/src/server.ts:1709-1728` routes `POST /api/judgment` →
  `judgments.submit` (append to `workbench/judgments.jsonl`); path allowlisted at
  `:204`; stale "only write" claims at `:11-12` and `:1731`. Second v1-append path:
  `POST /api/v2/judgments` (`:1687`) funnels into the same `validateJudgment`
  dispatcher, which routes any body without `action` to `validateV1Judgment`
  (`judgments.ts:818-821`). Brick mechanism: v1 lines count as legacy
  (`compileJudgments.ts:386-389`) and `cases.ts:773-784` requires byte-canonical
  match against the migration manifest (exactly the 3 committed v1 lines); any
  unmatched line throws with no line number and no remediation (`cases.ts:744`).
- UI regression: `workbench/static/index.html:2066-2092` gates "Not relevant" on a
  mandatory diagnosis dropdown (+ hand-typed concept id and note for two causes).
  Everything needed server-side already exists: `GET /api/concepts`
  (`server.ts:1778-1785`), `diagnosisInferred` in the v2 schema
  (`judgments.ts:179,753-755,804,995-996`), per-cause field rules matching the v1.1
  UX (`judgments.ts:756-764`), verbatim `reasons` in the snapshot
  (`reviewCases.ts:219,238,252`). The v1.1 reference implementation survives at
  commit `4cb805c`; note `Theme cue:` is a new label since v1.1 — a straight revert
  would mis-parse.

**Changes (two PRs; A then B).**
- **PR A — close the door, make strays loud.** Replace the handler with a
  method-agnostic 410 tombstone naming the v2 path; drop the path from the CSRF
  allowlist; delete the orphaned module-level v1 log (`server.ts:479`); fix the two
  stale "only write" comments. Close the **dispatcher**: bodies without `action` get
  a closed-log rejection; delete v1 *submission* validators but keep every
  *persisted*-record parser (the 3 manifested lines stay readable forever). Replace
  the bare throw at `cases.ts:744` with an error naming the stray line number(s) and
  the remediation (delete the stray, re-enter via v2 — manifested history untouched).
  Add `readLegacyLogHealth()` to the Health view (warning, never server-degrading).
  One doc line in `docs/workbench-implementation-plan.md:185`. Workbench version
  0.1.0 → 0.2.0 (an HTTP surface removed).
- **PR B — restore the evidence-based flow (UI-only + tests).** Fetch
  `/api/concepts` once into a label→id map (degrades to hand-typed fallback);
  `conceptEvidence(result)` scans reason families `concept_anchor`/`concept_lexicon`
  stripping all three current label prefixes (`Theme: `, `Theme cue: `,
  `Related theme: `); no evidence → one-click submit
  `{action:'irrelevant', diagnosis:'lexical-noise', diagnosisInferred:true}` with
  honest-demotion copy; evidence → per-concept questions ("Does “{label}” fit this
  verse?" / "Should “{query}” have brought up “{label}” at all?") mapping to
  `wrong-anchor` / `concept-misfire` note steps with the concept id wired from
  evidence; a hand-written sentence stays required only where judgments queue changes
  to reviewed theme files. Remove the mandatory-diagnosis gate, dropdown, and
  free-text concept-id field from the primary path; keep the technical disclosure
  and history chips.

**Data & provenance.** Not applicable — no data modified; the 3 manifested legacy
lines are preserved byte-for-byte.

**Gates & versioning.** No ENGINE_VERSION bump (both PRs must show zero changes under
`engine/`); no fingerprints move; G1–G11 unaffected; no G8 churn permitted; human-
merge gate preserved (compile still produces *pending* fixtures).

**Test plan.** PR A: 410 + byte-unchanged log; v1-shaped v2 body → 400 naming the
closed log; stray-line error contains line number + remediation and removal restores
validity (recoverability asserted, not just loudness); health surface tests. PR B:
static string assertions (contains `/api/concepts`, `diagnosisInferred: true`, all
three prefixes, both question templates; does not contain the removed gate copy); one
end-to-end v2 `diagnosisInferred` round-trip over HTTP; documented manual smoke.

**What Jesse reviews.** PR A: workbench looks identical; judge one result normally;
Health shows "legacy log: closed and canonical"; confirm his three original
"Who is like the Lord?" judgments untouched. PR B: click "Not relevant" on both kinds
of results; **his call:** does the question wording read naturally, and is the one
remaining required sentence acceptable friction?

**Risks & rollback.** Label-prefix drift degrades to the fallback (never wrong data;
pinned by the static test). A stray legacy line still requires a human edit — by
design, no silent repair of an append-only file. Both PRs `git revert` cleanly;
records written meanwhile remain valid v2 records.

**Dependencies.** `ci-timebomb` (soft, ordering only — satisfied by sequence).
`release-repair`: none. The missing-passage prefill regression and engineer-console
tab clutter are adjacent debts deliberately left to their own future item.
**Size.** 2 PRs, M overall (A: S-M; B: M).

---

### 7.3 `source-drift` — Handle upstream source drift: re-pins as reviewed re-admissions

**Goal.** The project is quietly frozen: all three rolling upstream downloads (WEB
text, OpenBible topics, OpenBible xrefs) changed bytes under our pins;
`fetch:sources` fails; no release can build; the pinned July bytes no longer exist
anywhere we can reach. After this work: the three sources are re-admitted through
reviewed PRs with Admission Reports (the WEB delta is one invisible spacing character
in Acts 20:35), every rolling snapshot has a durable archive, and a weekly CI job
fails loudly within days of any future drift — without ever blocking an unrelated PR.

**Current state (verified 2026-08-14, fresh downloads hashed).**

| source | manifest pin | upstream serves today |
|---|---|---|
| `web` | `3458ca34…`, 4,281,524 B; content `335445ef…` | `3073fead…`, 4,281,527 B; content `a1bd7479…`; zip entries stamped 2026-08-08 |
| `openbible-topics` | `2239700d…`, 417,866 B | `96bf2893…`, 418,097 B |
| `openbible-xrefs` | `36d1b198…`, 1,981,973 B | `78c92682…`, 1,982,196 B |

Fetch fails closed correctly (`fetchSources.ts:166-173,221-226,247-257`); build
refuses drifted bytes (`buildArtifact.ts:92-139`). The pinned bytes are gone locally
(the cache now holds the drifted bytes). One cache hole: a content-pinned cached file
of *any* bytes reports `cached` without re-fingerprinting (`fetchSources.ts:204-211`).
Early warning doesn't exist: G1b is HEAD-only, and the scheduled workflow greps for
"did not respond" — wrong bytes with HTTP 200 pass (proof: the drifted zip is stamped
2026-08-08 and "Source reachability" succeeded 2026-08-10). `web.json` is not
declared rolling despite demonstrably rolling. WEB re-pin measurement: of 4,726
comparable subset verses, exactly one differs — Acts 20:35, U+0020 → U+00A0; token
streams unchanged (`\s` matches U+00A0), but `corpusFingerprint` still moves —
identity changes even when ranking does not. Baseline coupling: regenerating
`web-subset.json` invalidates the G8 approval; the OpenBible subset generator cuts to
WEB-subset verses, so WEB regenerates first. Old-revision witness: jogomu/webc
(GitHub, frozen pre-drift). Neither eBible.org nor openbible.info offers archives.

**Changes.**
- **PR A — drift sentinel + cache fix (code only).** New
  `pipeline/scripts/checkSourceDrift.ts`: GET each pinned source, hash, compare;
  content-pinned sources also unpack and fingerprint so a repack-without-change
  reports `repacked`, not `DRIFTED`; verify `archiveUrl`s still serve pinned bytes
  (`archive-rotted`); exit non-zero on drift or rot; injectable fetcher. npm script
  `check:drift`; new `drift` job in the scheduled `sources.yml` (never on push/PR —
  the red scheduled run is the alarm, naming both hashes and "re-admit via reviewed
  re-pin PR — do NOT edit the checksum in place"). Fix the cached-content hole: verify
  the content fingerprint before reporting `cached`.
- **Jesse errand (not a PR) — durable archives, upload-first.** Upload the new
  snapshots (`3073fead…`, `96bf2893…`, `78c92682…`) as assets on a
  `source-snapshots-2026-08` GitHub Release, verifying hashes before upload; if his
  machine still holds the July zips, upload those too as `*-2026-07` assets. Upload
  precedes manifest edits so no `archiveUrl` ever points at nothing. (This Release
  also later hosts the `openbible-sections` snapshot — see `pericope-grouping`,
  harmonization §6 #7.)
- **PR B — WEB re-pin (corpus re-admission).** Evidence first: full verse-level diff
  of new text vs committed subset and vs the jogomu/webc witness (expected: NBSP
  typography only, zero token changes; committed in the PR). Edit `web.json` (new
  sha/bytes/contentSha256, add `rollingSourceUrl: true` + `archiveUrl`, re-admission
  provenance note). Regenerate `pipeline/fixtures/web-subset.json`. Re-baseline G8
  (`--update-baseline`) + new approval record chaining the `60b7f888…` baseline —
  **written in today's v1 approval shape; `governance` PR-G2 later re-issues the
  then-current approval in v2 form (planned, §5.2)**. Regenerate
  `docs/ATTRIBUTIONS.md` if output changes.
- **PR C — OpenBible re-pins (layer re-admission), after B.** Both manifests (new
  pins + `archiveUrl` + provenance; re-confirm the CC-BY header line in the new
  bytes or stop). Regenerate `openbible-subset.json` against PR B's subset. **Remove
  both ids from `eval/budgets.json`'s `acknowledgedUnarchivedRollingSources`** —
  mandatory in this PR (once `archiveUrl` exists, G1 fails on the stale
  acknowledgement). Re-baseline G8 again, approval chaining PR B's. End state: the
  acknowledgment list is empty — the budgets file's own stated goal.

Descriptor/full-artifact remint is **not** in this item — that is `release-repair`,
which these PRs unblock.

**Data & provenance.** WEB: public domain; "World English Bible"/"WEB" are eBible.org
trademarks — existing `attributionNote` survives. OpenBible topics/xrefs: CC BY 4.0
per the files' own headers, re-confirmed in the new bytes before merge; CC BY permits
redistributing snapshots as Release assets with attribution (NEEDS-JESSE §1.8's
reviewed conclusion). `derivedFrom: ["tsk"]` unchanged (G7 unaffected).
`manifestFingerprint` moves with the new identities — correct and desired.

**Gates & versioning.** G1: `web` becomes declared-rolling-with-archive; PR C
converts acknowledgements to archives. G3 is the regression net — any G3 failure
means the change was *not* typography-only: a finding for Jesse, never a fixture
edit. G8: both re-pins need reviewed re-baselines; PR B's expected churn is 0% — this
is a *re-admission*, so `NO MEASURABLE EFFECT` is the desired outcome, not a
rejection criterion (CLAUDE.md's rule governs additions claiming value).
**ENGINE_VERSION: no bump** — identity moves through
`corpusFingerprint`/`layerFingerprint`, exactly what the three-identity contract is
for.

**Test plan.** PR A: unit tests with injected fetcher (match / drift / repack /
archive-rotted / unreachable-not-drift) + cached-path fix test. PR B/C are
fixture-first by construction (the 70 golden fixtures and probe set exist before the
data changes and are the admission evidence); token-identity check for PR B (assert
identical token streams old-vs-new; escalate any difference). Workflow dry-run: after
PR A, dispatch the sources workflow — with drift live it must fail red (proving the
sentinel fires); after PR C it must go green.

**What Jesse reviews.** PR A: drift job is schedule/dispatch-only; failure output
names both hashes. Errand: verify sha256s before upload; **decision only he can
make:** whether losing from-scratch reproducibility of the July snapshot is
acceptable if the old bytes are gone. PR B — the substantive one: he is admitting a
new revision of the Scripture text; check the verse-level diff (really
typography-only?), G3 all-pass, G8 zero churn, and sign the baseline approval.
PR C: CC-BY header lines quoted, acknowledgment removal, G8 churn report (community
votes moved), second approval.

**Risks & rollback.** Old bytes may be unrecoverable (mitigation going forward is the
whole point: archive-first). Upstream rolls again mid-review (upload-first ordering +
re-run `check:drift` before merge). "Typography-only" wrong for unsampled verses
(caught by the full diff and G3; pause for review, don't merge). Sentinel
distinguishes `unreachable` (non-fatal) from `DRIFTED` (fatal). Each PR is an atomic
revertable unit; approvals chain `priorProvenance`.

**Dependencies.** `ci-timebomb` first. `release-repair` depends on **this** item.
Complements `eval-toughening` (no ordering constraint beyond "not interleaved with
PR-A", honored by sequence).
**Size.** 3 PRs + 1 upload errand; overall M.

---

### 7.4 `release-repair` — Repair the release/artifact pipeline and publish engine 0.9.0

**Goal.** Before: apps can only install engine 0.7.1, which refuses the current data
file ("schema v6 not supported"); the committed descriptor is a phantom (0.7.1-era
identity matching no published asset, nested `stale.blocksRelease: true`); even the
workbench cannot download a working data file. After: `npm i` installs 0.9.0, apps
download a `content.db` whose checksum matches the reviewed descriptor
byte-for-byte, searches run against the full 33-concept ontology — and releases can
never again ship bytes that don't match their reviewed identity, because the release
**attaches the exact CI-built, attested bytes that were reviewed; nothing is ever
rebuilt at tag time** (SQLite builds do not byte-reproduce across environments — the
defect class that produced v0.7.1).

**Current state (verified).** Descriptor says engineVersion 0.7.1 / schema 6 / sha
`35b7a6f3…` / 137,412,608 B / 33 concepts — matching no published asset (v0.7.1's
`content.db` hashes `b57d3676…` at 123,310,080 B); `stale: { …, blocksRelease: true }`
at `artifacts/content-artifact.json:146-150`. `release.yml` correctly refuses tags on
the stale flag (`:50-56`) but **rebuilds at tag time and compares** (`:64-110`) — a
CI↔CI toolchain race (setup-node pins only the Node major, so the bundled
`node:sqlite` floats) — and its header still asserts a false reproducibility claim.
Artifact identity is coupled to engineVersion
(`workbench/src/fetchArtifact.ts:24-25` derives the tag as
`v${descriptor.engineVersion}`). npm latest 0.7.1 rejects schema 6; repo engine 0.9.0
accepts schemas 1–6. Publishing machinery (OIDC + SLSA provenance, dist guard,
idempotent re-run guard) already works. Two blockers upstream of any mint:
`ci-timebomb` (verify is red) and `source-drift` (fetch fails) — both land earlier in
the sequence.

**Changes (two PRs + one tag).** All release-plumbing; **no ranking, tokenizer, or
scoring code is touched.**

**PR 1 — release machinery.**
1. **Decouple artifact identity from engineVersion.** Add optional
   `release?: { tag: string }` to the descriptor (`pipeline/src/buildArtifact.ts`
   interface + `--release-tag` CLI, validated `/^[A-Za-z0-9][A-Za-z0-9._\/-]*$/`;
   `formatVersion` stays 1 — additive optional). Extend
   `workbench/src/descriptor.ts` validation; export
   `releaseTagFor(descriptor)` with the `v{engineVersion}` fallback for old
   descriptors; `fetchArtifact.ts` uses it. Document `release.tag` in
   `docs/implementation-plan.md` §5 (the required consumer-contract check; additive,
   so Maskil/Setlist/Versed pins unaffected). Artifact-only refreshes can later use
   an `artifact/<date>` tag with no engine bump — the steady-state cadence.
2. **New `.github/workflows/mint-artifact.yml`** (`workflow_dispatch` only; input
   `release_tag`): checkout → `npm ci` → `npm run verify -- --require-admit` (a mint
   from a tree that cannot pass admission is not a mint) → `fetch:sources` (pinned
   manifests must verify — `source-drift` landed) → `build:artifact --release-tag …`
   (fresh `builtAt`; nothing ever tries to reproduce these bytes) → **attest** the
   canonical bytes (`actions/attest-build-provenance`, verifiable with
   `gh attestation verify`) → create-or-reuse a **draft** release at the tag and
   upload the bytes (no blanket `|| true` — auth failures fail loudly; drafts are
   invisible to consumers and sidestep 90-day artifact retention) → upload the
   descriptor as workflow artifact `content-artifact-descriptor` → write a
   **fingerprint diff table** (committed vs minted) to the step summary.
3. **Rewrite `release.yml`'s tag path to promote-only.** Keep: stale gate, verify
   `--require-admit`, pack + dist guard, OIDC publish. Delete: fetch, the entire
   capture/rebuild/compare/restore block, the softprops attach, and the false
   reproducibility header (replaced by a canonical-build statement). Add, between
   verify and pack: assert `descriptor.release.tag === github.ref_name`; download the
   draft's `content.db`; verify sha256 + byte count against the **committed**
   descriptor; `gh attestation verify`. After npm publish: upload descriptor +
   tarball to the release, `--draft=false --latest`, notes including the
   verify-before-open instructions and one added line stating the **OpenBible CC BY
   4.0 attribution obligation passes through to consumer apps**. Follow-on hardening
   (non-blocking, separate item): enable repo-level immutable releases — the existing
   v0.7.1 release reports `immutable: false`, so published assets can still be
   swapped; immutability would make served bytes tamper-evident at rest.
4. **Post-release smoke test** — new `smoke` job + committed
   `.github/scripts/release-smoke.mjs` (outside all workspaces; the script owns the
   SQLite port, engine no-I/O covenant untouched): plain **unauthenticated** fetch of
   `content.db` + descriptor from the public release URL; verify sha/bytes;
   `npm i @jestek-dev/scripture-engine@$VERSION` in a scratch dir (bounded retry for
   registry propagation); run `research('hearing and doing')` — James 1:22 must
   appear in the top 10 (presence-in-window; ordering is the gauntlet's job) and the
   reported identity triple must equal the descriptor's exactly. This is the check
   that would have caught v0.7.1 the day it shipped.
5. **Create `engine/CHANGELOG.md`** with 0.7.0 / 0.7.1 / 0.8.0-**BREAKING**
   (anchor-run collapsing; never published) / 0.9.0 entries — tagging 0.9.0 with the
   0.8.0 breaking change discoverable only via `git log` is a consumer trap.
   (`consumable` PR 1 later formalizes the file and adds the release guard —
   harmonization §6 #5.)

**PR 2 — the descriptor (reviewed data).** Trigger the mint with
`release_tag: v0.9.0`; download the run's descriptor artifact; commit it **verbatim**
as `artifacts/content-artifact.json` — stale block gone, `engineVersion: "0.9.0"`,
`release: { tag: "v0.9.0" }`; nothing else in the PR. PR body: the fingerprint diff
table + mint run URL. **The descriptor must never be built on a laptop** (the audit
observed exactly such an uncommitted local descriptor on 2026-08-13; it was
discarded, correctly).

**Tag.** Jesse pushes `v0.9.0` on the PR-2 merge commit; release.yml verifies,
publishes npm 0.9.0, promotes the draft, and the smoke job proves the consumer path.

**Data & provenance.** No new corpus/ontology data; the descriptor *is* the
provenance record and stays human-reviewed. Strengthened: `content.db` gains a GitHub
artifact attestation (bytes → workflow → commit), matching the npm package's SLSA
provenance. Two licensing carry-throughs: the CC BY passthrough line in the release
body, and the **first shipment of a schema-6 artifact to commercial apps** — schema 6
carries the ESV/NIV/NLT-derived `verse_translation_tokens` index (~14 MB), so the
audit's "one counsel pass" recommendation lands on Jesse as an explicit go/no-go in
PR 2 (tracked further by `consumable` PR 3's NEEDS-JESSE entry).

**Gates & versioning.** No ordering change anywhere → **no ENGINE_VERSION bump**; the
engine ships at the already-committed 0.9.0 in lockstep with package semver. The
minted `corpusFingerprint` movement, its fixture review, and G8 re-approval belong to
`source-drift` and are ADMIT-green before the mint (enforced mechanically by
`--require-admit`). The G6 hardcoded-pass defect is out of scope
(`ranking-fixes` + `eval-toughening`). npm `latest` becomes 0.9.0 (schemas 1–6);
the pinned-0.7.1 consumer path remains untouched and functional.

**Test plan.** Extend `workbench/test/descriptor.test.ts` (release-field acceptance/
rejection; `releaseTagFor` fallback). New `pipeline/test/buildArtifactCli.test.ts`
(extract and test argv parsing). The smoke script is runnable locally against a
locally built artifact + `npm pack` tarball before any release depends on it.
`mint-artifact.yml` is itself the dry run (draft + artifacts only); exercise the
draft-release mechanics once with a throwaway tag (e.g. `v0.0.0-releasetest`) before
relying on them.

**What Jesse reviews.** PR 1: the tag path contains **no build step of any kind**;
the mint is dispatch-only and cannot publish anything public; old-descriptor fallback
works; the CC BY passthrough sentence. Mint trigger: one click, only after main is
green and manifests re-pinned. PR 2 — **this review IS the release decision**: the
fingerprint diff table reads sanely (corpus fingerprint = the value `source-drift`'s
admission blessed; 33 concepts; ~137 MB; no `stale` block); the committed JSON is
byte-identical to the linked CI run's artifact. **Decisions only he can make:**
(1) push the tag — npm publish is effectively irreversible; (2) the schema-6 counsel
go/no-go; (3) accept the artifact-identity decoupling as a §5 addition. After the
tag: glance at the smoke job.

**Risks & rollback.** Draft-asset drift is closed mechanically (tag path verifies
sha/bytes/attestation against the committed descriptor — a drifted asset cannot
ship). npm rollback is never unpublish: deprecate + publish 0.9.1. Smoke-fails-after-
publish: delete release + tag, deprecate, fix, 0.9.1; the v0.7.1 path never
regresses. Descriptor rollback: revert PR 2 — the stale gate re-arms automatically.

**Dependencies.** `ci-timebomb` (hard), `source-drift` (hard, for the mint). Data
items intended for the 0.9.0 artifact must merge before the mint; anything after
rides the next mint + descriptor PR (the Phase-2 v0.13.0 release).
**Size.** M — 2 PRs + 1 tag push.

---

### 7.5 `governance` — Independent probe-baseline review and covenant-safe amendment of the one-click plan

**Goal.** The G8 "did results quietly get worse?" baseline's last sign-off
("independent admission baseline reviewer") was written on Jesse's own machine — a
rubber stamp; worse, the workbench publish pipeline structurally cannot ship an
updated approval at all, so baseline-moving batches are unpublishable by
construction. Separately, the PR #20 roadmap doc says automation may merge engine
changes to `main` — directly against CLAUDE.md #1. After: baseline shifts get a
generated per-probe before/after packet and a machine-checked approval naming who
reviewed, on what evidence, and what they did not author; the workbench can carry an
approval through to a draft PR; and the plan doc is amended so the most automation
can ever do is open a draft PR Jesse merges by hand.

**Current state (verified).** Baseline `eval/baselines/probes.json` (25 observations,
engine 0.9.0, corpus `60b7f888…`, layer `b3ac1033…`); approval v1 with free-text
reviewer, no identity/independence/evidence binding; the 2026-08-10 review doc links
evidence via `C:/Users/Jeste/...` paths (self-approved), landed by direct push. The
approval *mechanics* are already good (digest + identity binding, `probes.ts:63-195`;
`--update-baseline` writes only the baseline, never the approval). Structural
dead-end: `ALLOWED_SOURCE_PATHS` (`publishPreparation.ts:28-33`) includes
`probes.json` but not `probes.approval.json`, so a baseline-moving batch makes G8
fail `baseline-approval-baseline-mismatch` forever. The one-click doc's §5/§11/§20
include auto-merge stages; the existing publish code pledges the opposite
(`publishPreparation.ts:1069`). CI requires **three** checks, not two:
`verify (ubuntu-latest)`, `verify (windows-latest)`, `cross-platform ordering (G2)`.

**Changes (three PRs).** None touches ranking, tokenizer, schema, or engine code.

- **PR-G1 — packet tooling, review policy, publish path.**
  1. New `docs/governance/probe-baseline-review.md`: who can sign (did not author the
     change; distinct identity from the repo owner acting alone; Jesse decides who
     qualifies, per-review; his merge remains the final human gate); what they see
     (the packet); where artifacts live; the procedure.
  2. New `eval/src/baselineReviewPacket.ts` + `review-packet` script: reads
     before/after baselines, decodes `WEB:BBCCCVVV` ids via the engine's reference
     utilities, emits per-changed-probe before/after top-10 tables with
     added/dropped/moved markers, metric deltas vs budgets, and a digest footer
     printing exactly the values the approval must bind. Read-only; never writes the
     approval.
  3. `publishPreparation.ts`: add the approval path to `ALLOWED_SOURCE_PATHS`;
     pairing rules — a changed baseline diff **requires** a changed approval diff and
     vice versa, with digest/identity binding checks; named stop reasons
     `probe_approval_missing` / `probe_approval_mismatch` / `probe_approval_orphaned`.
     Deliberately **schema-version-agnostic** (checks only fields present in both v1
     and v2) so PR-G2's cutover cannot break the publish path in either direction.
  4. `admission.ts`: new diff kind `'probe-approval'` + the same binding validation
     at preview time. The workbench never *generates* approval content — it only
     validates and carries a file the reviewer authored.
  5. Fix the 2026-08-10 review doc's absolute local paths; append a dated note that
     its independence is disputed by the audit and superseded by PR-G2's re-review
     (decision table preserved verbatim — historical record).
  6. New `workbench/test/docsGovernanceGuard.test.ts`: fails on absolute local paths
     in `docs/reviews/*.md`.
- **PR-G2 — approval schema v2 + genuine independent re-review.** Schema becomes
  `…/probe-baseline-approval/v2`; adds `reviewerName`, `reviewerContact`,
  `independence` (attestation naming what the reviewer did not author), and
  `evidence: { path, sha256 }` binding the review doc (byte check runs in the
  gauntlet — eval does I/O, the engine stays I/O-free). v1 documents rejected — no
  grandfathering — because the **same commit** re-issues the approval in v2 form for
  the *unchanged, then-current* baseline (in sequence: the post-`source-drift`-PR-C
  baseline; the reviewer uses PR-G1's packet tool with `--before` at the prior blob),
  signed by the independent reviewer Jesse designates. Shipping validator and
  re-issued approval together keeps G8 green through the cutover. *(Harmonization:
  the specific digests quoted in the original section — `6f3c6c0c…`/`3d437b03…` —
  were the HEAD-5033517 values; PR-G2 binds whatever the then-current baseline's
  digests are.)*
- **PR-G3 — amend the one-click plan doc (docs-only).** One-click outcomes become
  **Draft PR ready / Needs attention**; §5 truncates after
  `draft PR → report required checks → hand to Jesse`; sentinel sentence "No
  automation merges to `main`." (test-guarded); new §5a "Repair phase first" citing
  `release-repair` and the closed v1 endpoint (`workbench-hardening`); §6/§7 replaced
  by a thin coordinator over existing jobRunner/applyJournal/publishPreparation;
  named stop-reason enum incl. `g8-baseline-moved-needs-independent-approval` and
  `no-measurable-effect`; §11 names all **three** required checks and never merges;
  §12 redefined as *logical-identity verification* (canonical descriptor-field +
  recorded-digest comparison — byte-identity of rebuilt SQLite is impossible across
  OSes) plus pinned toolchain; §20 stages 3-6 deleted, replaced by: authority beyond
  draft-PR-only requires an explicit, separately reviewed CLAUDE.md amendment —
  Jesse's decision alone. Guard test extended: sentinel present; forbidden phrases
  (`/auto-?merge/i`, `/merge through the GitHub API/i`) absent outside the changelog
  block — case-insensitively, because §20 spells "Auto-merge" capitalized.

**Data & provenance.** Not applicable — governance artifacts are repo-authored
reviewed documents; provenance carried by the approval's own digest bindings.

**Gates & versioning.** **No ENGINE_VERSION bump**; fingerprints unchanged. G8 is
affected in *validation only* — thresholds, churn math, and the baseline itself are
untouched, so measured outcomes are identical; the v2 approval must land in the same
commit as the validator (the critical sequencing rule). New admission diff kind
changes preview digests only for approval-touching batches; no §5 consumer type
moves. No gate switched to pass-without-running; new checks fail closed with named
findings.

**Test plan.** PR-G1: golden packet test (fixture baselines in, exact markdown out);
publishPreparation pairing-rule tests; admission round-trip; the docs guard must fail
on the un-fixed 2026-08-10 doc (proving it bites). PR-G2: v2 validates; v1 fails
`baseline-approval-malformed`; blank identity/attestation and evidence mismatches
fail with named findings; full local gauntlet must report G8 pass with the re-issued
approval before the PR opens. PR-G3: sentinel/forbidden-phrase assertions.

**What Jesse reviews.** PR-G1: does the policy say what he believes about who may
sign; the allowlist widening is exactly one path; every mispairing fails closed; the
golden packet is the evidence he'd want a reviewer to see. PR-G2 — **two decisions
only he can make:** designate the independent reviewer, and accept or act on that
reviewer's verdict (a rejection reopens the baseline as an explicit Jesse decision,
never an automatic revert). PR-G3: read the amended sections slowly — this PR is
where the covenant is either kept or eroded.

**Risks & rollback.** Schema-cutover red-G8 if validator and approval split commits
(mitigated: single-commit pairing; rollback: revert PR-G2). Independence remains
partly procedural — v2 makes a rubber stamp a visible lie rather than a default;
Jesse's merge is the backstop. Allowlist widening mitigated by fail-closed pairing.
Doc-guard false positives are a 1-line test edit in the same reviewed PR.

**Dependencies.** `ci-timebomb` (hard — PR-G1 extends `admission.test.ts`).
`release-repair`: content-cited by PR-G3 only (may merge before or after; in this
sequence, after). Every later item that regenerates the G8 baseline depends on this
item for the v2 approval form and (for workbench batches) the legal publish path.
**Size.** M overall, 3 PRs (G1: M; G2: S; G3: S/M).

---

### 7.6 `eval-toughening` (PR-A/PR-B) — Ordered snapshots + rank-aware fixtures
*(Stages A-B land here in Phase 1; C-E and F appear at their sequence points below
but are documented in this one section.)*

**Goal.** Today a change silently demoting James 1:22 from #1 to #8 for "hearing and
doing" ships green: eval checks presence in top-5/10 windows, never position; G6
reports pass without running; NO MEASURABLE EFFECT doesn't exist in code; the
cross-OS check compares gate summaries, not orderings. After: #1 slots are pinned;
**any reordering anywhere in the probe top-25 fails the local gauntlet unless the
engine identity moved in the same commit and the snapshot's digest-bound approval was
rewritten to say so**; a no-op pack gets the promised verdict; every gate provably
rings; and (Stage 6) the consumer apps can verify orderings on their own
Hermes/JSC + OP-SQLite runtimes. Nothing changes what queries return — it changes
what the repo can *prove* about them.

**Current state (verified).** 70 fixtures, 92 `expectedTop`, 64 `mustNotRank`, **0
`preferredOrder`**; windows all 5/10 (the machinery for `withinTop: 1/3` and
`preferredOrder` exists, parsed and evaluated, unused). G6 hardcoded pass
(`gauntlet.ts:705-709`). G11 pass-without-running edge (`probes.ts:359-361`). G8
churn is set-based — a full top-10 permutation is 0% churn. Dead threshold
`noise.minMeanDistinctiveness: null` read by no gate. No mechanical ENGINE_VERSION
tripwire (G2 replays 3 synthetic cases in-process). Cross-OS CI diffs normalized gate
summaries only — no ordered lists. `report.ts:15` has three verdicts; the workbench
has a separate set-based `measurableEffect()` for its own proposals only. No
property-based tests; `fast-check` absent.

**Changes.**
- **Stage 1 / PR-A — ordered per-probe snapshot + approval-bound tripwire.**
  `observeProbes` additionally returns `orderedResults` over the full default page
  (25; scores rounded 6 dp); `ProbeObservation` unchanged so G8 digests stay
  byte-identical. New `eval/src/gates/orderingSnapshot.ts`:
  `OrderingSnapshot { engineVersion, corpusFingerprint, layerFingerprint, probes }`,
  `validateOrderingSnapshotApproval` modeled line-for-line on the G8 approval
  validator, and `orderingSnapshotGate` with a 7-rule decision table — the crucial
  ones: (5) orderings changed while the identity triple did not → fail with named
  probes and before/after top-5s ("bump ENGINE_VERSION … regenerate snapshot +
  approval in this same commit"); (6) **tripwire**: an approval whose
  `probeListsSha256` moved while `engine` deep-equals
  `priorProvenance.engine` → fail — closing the regenerate-without-bump hole. New
  committed pair `eval/baselines/ordering.snapshot.json` (generated via
  `--update-ordering-snapshot`, mutually exclusive with `--require-admit`/`--json`,
  never writes the approval) + `ordering.snapshot.approval.json`
  (schema `…/ordering-snapshot-approval/v1`, **hand-written by the reviewer** —
  writing it *is* the approval act; bootstrap `priorProvenance` null). Wired into G2
  via `mergeGateResults` (roster stays 12 rows). CI: upload each OS leg's snapshot
  and byte-compare; plus a **merge-base leg** asserting that when the committed
  snapshot changed, the identity triple moved and `priorProvenance` matches the
  actual merge-base blob — the forgery backstop. **Precise claim:** accidental and
  drive-by ordering changes cannot pass any gauntlet run; the residual bypass is
  deliberately forging `priorProvenance` — visible in the diff (a file named
  `*.approval.json`), the same trust boundary the G8 approval already accepts, and
  machine-caught post-merge by the merge-base leg. *(Harmonized: PR-A lands after
  `source-drift`, so the bootstrap snapshot is generated at 0.9.0 + the re-pinned
  fingerprints.)*
- **Stage 2 / PR-B — rank-sensitive fixtures + honesty fixes.**
  `hearing-and-doing.json` → `withinTop: 1` + `preferredOrder` above Matt 7:24-27 /
  Luke 6:46-49; ~10-15 further fixtures tightened to top-1/top-3 with
  `preferredOrder` pairs — **always asserting observed, admitted behavior recorded
  before editing; any fixture whose desired #1 is not current behavior belongs to
  `ranking-fixes` or `lexicon-concepts` instead** (this item never smuggles ranking
  changes). Target ≥15 top-1/3 assertions + ≥15 pairs. G11 empty branch →
  `notApplicable` (an empty probe file now REJECTs — fail-closed). Delete the dead
  `minMeanDistinctiveness` key with a `$comment` (a threshold that reads as
  protection but never fires is worse than none).
- **Stage 3 / PR-C — graded qrels, rank metrics, NO_MEASURABLE_EFFECT.** Optional
  fixture field `queryClass` with prefix-derived default. New
  `eval/src/gates/rankMetrics.ts`: graded gains (expectedTop=3, alsoAcceptable=1;
  `mustNotRank` stays a hard assertion — no theology scoring), nDCG@10 / MRR /
  Recall@50 (the latter via a second engine instance at limit 50, used only for this
  metric), aggregates in G3 metrics. `budgets.json` gains an all-**null**
  `rankQuality` block — thresholds only after ≥3 admitted runs establish a real
  baseline (CLAUDE.md forbids guessed thresholds). Fourth verdict
  `NO_MEASURABLE_EFFECT`, detected against three **named committed anchors**, never
  anything the same PR regenerated: (1) new baseline
  `eval/baselines/rank-metrics.json` (own `--update-rank-baseline` flag; refreshed
  only in its own reviewed PR); (2) the **pre-change** probe orderings via the
  Stage-1 approval's `priorProvenance.probeListsSha256` (comparing against the
  in-tree snapshot would be circular); (3) the committed G8 baseline, deliberately
  NOT regenerated (identity mismatch is G8's designed comparison mode). Precondition
  (anchors exist, same corpusFingerprint, non-null priorProvenance) fails →
  detection **skipped with an explicit finding** — never silently treated as
  evaluated. Verdict is non-admit under `--require-admit`. Machine-report schema →
  `gauntlet-report/v2`; workbench surfaces the verdict through its existing
  `NO_MEASURABLE_EFFECT` admission status (it already fails closed on unknown
  verdicts — the safe direction).
- **Stage 4 / PR-D — property tests; G6 stops being decorative.** `fast-check@4.9.0`
  (MIT; sole dep `pure-rand`, MIT) as devDependency only — engine keeps zero runtime
  deps. `engine/test/properties.test.ts` (fixed committed seed): rank/applyBudgets
  permutation-invariance, caps hold for arbitrary evidence, tokenizer fuzz
  (idempotence, stopword/empty exclusion, 4-char stem floor). New
  `eval/src/gates/budgetsProperty.ts` executing the properties in-process with fixed
  seed + numRuns reported in the gate summary. *(Harmonized per §6 #4: by PR-D, G6 is
  `ranking-fixes`' reviewed-constants equality check — `signalBudgetsGate()`
  **merges alongside it** via `mergeGateResults`; G6 then checks both.)*
- **Stage 5 / PR-E — gate mutation harness** (`eval/test/gate-mutation.test.ts`,
  test-only): for each gate, a known-bad input that provably rings — including all
  snapshot decision-table branches, the top-10-permutation case (G8 passes, G2
  fails — documenting the division of labor), approval tampers, G10/G11 edges, and
  the verdict matrix (required gate `not-applicable` → REJECT; anchor-missing →
  skipped-with-finding, not silent ADMIT). Weakening a gate now fails `npm test`.
- **Stage 6 / PR-F — consumer conformance kit** (Phase 2, after the v0.13.0
  release). New private workspace `conformance/`: node-side `generate.ts` emits
  `conformance-kit.json` (identity triple + ordered probe expectations + a tokenizer
  behavioral canary hashing `significantWords`/`tokenStream` over a fixed
  multilingual sample — the ICU/Unicode hazard); RN-compatible `runner.ts` with zero
  node imports replays queries through whatever `ContentQueryPort` the app provides
  and byte-compares orderings. Pipeline addition: record `sqlite_version()` + FTS5
  detail in the descriptor. Kit generation joins the release flow; §5
  consumer-contract addition reviewed per CLAUDE.md. The only place the
  four-tuple contract is ever tested on the runtimes that serve worship leaders.

**Data & provenance.** Only Stage 2 touches reviewed data (fixtures — first-class
reviewed data already). New committed reviewed files: the two snapshot files,
`rank-metrics.json`, the null `rankQuality` block, later per-release kits.
fast-check/pure-rand are MIT, dev-only; nothing new ships in the engine or artifact.

**Gates & versioning.** G2 gains the snapshot sub-check; G3 gains rank assertions and
metrics; G6 becomes real; G8 mechanically unchanged (order-blindness now covered by
G2 and documented); G11 honest. **No ENGINE_VERSION bump in any stage.** From PR-A
on, any ordering-altering PR must bump + regenerate snapshot + rewrite approval in
the same commit or G2 rejects it — which is the point, and is exactly what
`ranking-fixes`, `pericope-grouping`, and `spelling-aliases` then do.

**Test plan.** Decision-table coverage for all 7 branches; corpus-golden v2 tests;
rank-metrics hand-computed cases incl. anchor-selection; machine-report v2
round-trip; fixed-seed property suite; the mutation matrix. Stage 1 runs the
gauntlet twice for snapshot idempotence, and the snapshot must byte-match across
ubuntu/windows in PR-A's own CI before merge.

**What Jesse reviews.** PR-A: the snapshot's identity matches the committed
descriptor/engine; approval digests match; both OS legs byte-equal; **his signature
on the approval file is the act of approving today's orderings as the reference** —
from then on his review burden shrinks to "does the approval's rationale ring true".
PR-B: every tightened assertion matches results he recognizes as right for a worship
leader — curation judgment, not code review. PR-C: the graded gains read as *his*
fixture judgments; thresholds all null; anchors are priorProvenance + committed
baselines. PR-D: gate summary states seed/numRuns; fast-check dev-only. PR-E: skim
that each alarm provably rings. PR-F: §5 addition; **his decision:** when the three
apps adopt the runner.

**Risks & rollback.** Snapshot friction on legitimate changes is the *intended* cost
(one command + one short file). Residual approval-forgery gap: machine *detection*
post-merge, eye-visible in review — same boundary as the existing G8 approval.
Over-tight fixtures can be legitimately displaced by better anchors — top-1/3 only
where a curated anchor puts it there; widen back in a reviewed data PR.
NO_MEASURABLE_EFFECT false positives: the report text says "add a golden fixture
demonstrating the gap first" — the covenant's own prescription. Everything reverts
per-PR.

**Dependencies.** `ci-timebomb` (hard). `source-drift` before PR-A (not interleaved —
honored). PR-A/PR-B **before** `ranking-fixes` (inverse dependency — its bump is what
they police). `release-repair` for Stage 6 only. Not dependent on `governance`,
`pericope-grouping`, or `workbench-hardening`.
**Size.** L overall; 6 PRs (A: M, B: M, C: M, D: M, E: M, F: L deferred).

---

### 7.7 `lexicon-concepts` — Complete the single-word lexicon pass and add six missing core concepts

**Goal.** Typing the one word you'd actually type often bypasses the curated layer or
returns the opposite of what you meant: "comforter" → Job 16:2 ("miserable
comforters"); "holiness"/"healing"/"temptation" never reach their existing packs;
"baptism", "comfort", "new creation", "cornerstone", "doubt" have no concept at all;
"peace" puts 1 Peter 5:7 over Philippians 4:6-7 because peace-of-god.yaml lists it
twice and the engine sums duplicates. After: each bare word lands on the passage a
worship leader wants with an honest source chip, and a reviewed inventory file plus a
gauntlet check guarantee every current and future concept carries an explicit
bare-word decision — this class of gap cannot silently reopen.

**Current state (verified).** Concept matching is containment
(`repository.ts:419-449`); the light stemmer (≥4-char, `-ing/-ies/-ed/-es/-s` only)
means "holiness" ≠ "holy" — no lexicon entry reduces to the bare token for holiness,
healing, or temptation. Bare single-word queries are never demoted by the thin-cue
rule, so a firing concept gets full `concept_anchor` evidence. The 2026-08-08 pass
covered 20 concepts; the recommended completeness check was only half-built
(`singleTokenCollapses` reports accidental collapses, non-blocking; nothing records
per-concept bare-word *decisions*); the "love" question is still open. peace-of-god:
duplicate 1 Pet 5:7 rows sum to 35.2 vs Phil 4:6-7's 22.0 — matching the audit; no
gate catches within-concept duplicate refs; no concept currently declares a
multi-source anchor, so the entry-level duplicate is the only live instance of the
class. Source material on hand: Torrey topics JSON (Baptism; Holy Spirit, the
Comforter; Temptation; Holiness), OpenBible topic rows (baptism 16, comfort 15,
doubt 15, new creation 14, the comforter 13, holy spirit 16 — **no cornerstone
topic**, so cornerstone takes editorial anchors), WEB wording verified for every
proposed anchor. Fixture machinery supports `additionalQueries`, `mustNotRank`,
`coversConcepts`, `preferredOrder` (unused until now). 58 concepts, 70 fixtures.

**Changes (four PRs, fixture-first per the two variants in §3.5).**

- **PR 1 — peace-of-god dedup + duplicate-anchor structural guard.**
  1. Add to the existing **active** `eval/golden/peace-of-god.json`:
     `preferredOrder: [{ above: "Philippians 4:6-7", below: "1 Peter 5:7",
     withinTop: 10 }]` — must FAIL while the duplicate stands; the failing run is the
     gap evidence in the PR body. First-ever `preferredOrder` use; this fixture
     becomes the pattern.
  2. `ontology/concepts/peace-of-god.yaml` — delete lines 42-46 (the second
     1 Peter 5:7 entry); keep the torrey entry exactly as-is (0.75), moving the
     remembered-phrasing comment onto it with a note that dual citation
     `sources: [torrey, editorial]` **is restored by `ranking-fixes`** once
     multi-source entries are single-scoring (harmonization §6 #3). Weight choice is
     Jesse's; either satisfies the fixture.
  3. `pipeline/src/importers/ontologyImporter.ts` — track seen refs per concept; a
     second anchor *entry* resolving to an identical range pushes `errors` →
     ontology fails to compile → G4 fails. Multi-source single entries stay legal
     (provenance, not duplication). *(The overlapping-but-not-identical-range
     reporting lands later in `ranking-fixes` — §6 #3.)*
  4. Unit tests; G8 re-baseline (v2 approval per `governance`) with rationale
     "1 Pet 5:7 no longer double-counts; Phil 4:6-7 leads 'peace'".
- **PR 2 — bare-word inventory: mechanism + backfill + gap closure.**
  1. New reviewed `ontology/lexicon-inventory.yaml`: one row per concept **id**
     (mandatory), `admitted:` bare tokens that must fire, `skipped:` with reasons.
     Backfill all 58 concepts from the 2026-08-08 decision table. **Keying trap:**
     ids ≠ filenames — the healing concept's id is `prayer-for-healing` (declared in
     `pastoral-prayer-for-healing.yaml:19`); backfill from compiled ids, never
     `ls ontology/concepts/`.
  2. New gate module `eval/src/gates/lexiconInventory.ts` using the engine's exported
     `significantWords` (one tokenizer, no drift). BLOCKING: concept with no row; row
     for a nonexistent concept; `admitted` token that doesn't fire; `skipped` token
     that does; empty reason. Report-only: unlisted accidental collapses
     (`singleTokenCollapses` keeps running). Wired into G4 — a future concept cannot
     ship without a bare-word decision ("a pack with no fixtures is rejected
     structurally", applied to bare words).
  3. Strengthen the three **existing active** fixtures in place (never demoted):
     `holiness.json` + `additionalQueries: ["holiness"]`; `pastoral-healing.json` +
     `["healing"]`; `remembered-a-way-of-escape.json` + `["temptation","tempted"]` —
     failing runs quoted as gap evidence.
  4. Lexicon additions: `- holiness`; `- healing` (extends the NEEDS-JESSE §1.6d
     exception to the pack's own subject noun — called out in the PR body);
     `- temptation`/`- tempted` on the way-of-escape pack (a deliberate, commented
     exception to its phrasing-only design; one narrow anchor is exactly what the
     bare word wants).
  5. Inventory rows updated; G8 re-baseline naming the moved probes.
- **PR 3 — the comfort pair** (`god-of-all-comfort` + `holy-spirit-the-comforter`,
  one PR so G4 judges the adjacent lexicons together). Fixtures first (pending → flip
  active with the data, per §3.5): `comfort` → 2 Cor 1:3-4 expectedTop with
  `requiredReasonLabel "Theme: God of all comfort"`; `comforter` → John 14:16/14:26
  with **`preferredOrder`: John 14:26 above Job 16:2** (Job legitimately
  token-matches; it must simply not lead). Comforter pack: lexicon "the comforter",
  "comforter", "counselor", "helper", "advocate", "spirit of truth", "holy spirit";
  anchors John 14:16-17 (1.0), 14:26 (0.95), 16:7 (0.85), 15:26 (0.8) `[torrey]` +
  Rom 8:26 `[editorial]`; `openbibleTopics: [the comforter]`. Comfort pack: anchors
  (editorial, WEB-verified) 2 Cor 1:3-4 (1.0), Matt 5:4 (0.95), Isa 40:1 (0.85),
  Ps 23:4 (0.8), 2 Thess 2:16-17 (0.75), Isa 61:1-2 (0.7);
  `openbibleTopics: [comfort]`. Inventory rows; G4 collision review vs the pastoral
  grief/brokenhearted packs; G8 re-baseline.
- **PR 4 — `baptism`, `new-creation`, `christ-the-cornerstone`, `doubt`.** Fixtures
  first (new-concept variant), then packs: baptism (Matt 28:19, Acts 2:38,
  Rom 6:3-4, Gal 3:27, Col 2:12, 1 Pet 3:21 — `[torrey]` where the outline lists
  them; deliberately silent on mode/timing — anchors state, never adjudicate);
  new-creation (2 Cor 5:17, Gal 6:15, Ezek 36:26, Rev 21:5 — bare "new" recorded as
  `skipped` — catastrophic trigger; no "born again", which already collapse-fires
  `salvation`); cornerstone (all editorial — no admitted source has the topic; keep
  "foundation"/"rock" OUT so G4 vs `building-on-the-rock` stays clean); doubt
  (Mark 9:23-24, Matt 14:29-31, John 20:26-29, Jas 1:5-6 — chosen pastorally: Jesus
  meets doubters, He does not scold them). Inventory rows; G8 re-baseline.

**Data & provenance.** No new external source; every citation resolves to an existing
reviewed manifest: `torrey` (public domain 1897; transcription pinned to an immutable
commit, MIT), `openbible-topics` (CC BY 4.0, re-verified 2026-08-14; the pinned
snapshot contains references and vote scores only — no verse text), `editorial`
(LH-owned, AI-drafted offline, human-admitted; every editorial anchor verified
against the WEB text before being proposed). New reviewed files: the inventory YAML,
six concept YAMLs, ~10 fixtures.

**Gates & versioning.** **ENGINE_VERSION: no bump** — nothing under `engine/src`
changes; every PR moves `layerFingerprint` only (exactly why three identities
exist). G1 passes; G3 fixture count ~70 → ~76; G4 gains the blocking inventory check
and the compile-time duplicate-anchor error; G8 — **four sequential re-approvals,
one per PR, never batched** (each in v2 form, rationale naming the moved probes);
G10 noise. Nothing here mints an artifact; the Phase-2 mint picks the data up.

**Test plan.** Per §3.5 variants, mechanically stated per PR (strengthen-active →
failing evidence → data → ADMIT → re-baseline+approval; pending → evidence → data +
flip active same commit → ADMIT → re-baseline+approval). Unit tests: importer
duplicate rejection; `inventoryFindings` block/report matrix; a `preferredOrder`
gate test guarding the previously-unused code path. A `NO MEASURABLE EFFECT` verdict
on any pack means that pack does not merge. Bare-word spot checks with actual reason
chips recorded in each PR body.

**What Jesse reviews.** PR 1 — "stop counting 1 Peter 5:7 twice": fixture, single
entry, compile error; **his call:** surviving weight and whether the chip says
Torrey or LH editorial until `ranking-fixes` lets it honestly say both. PR 2 — "every
concept now has a written bare-word decision": the inventory *is* the review — 58
rows encoding his prior rulings; **his call:** the `love` row (recommendation: bare
"love" → `gods-love`, `loving-others` stays on "love one another") — decided under
his name or explicitly deferred with a reason in the row. PR 3 — check the theology;
**his call:** whether "holy spirit" belongs on the Comforter concept until a broader
Holy Spirit concept exists. PR 4 — check per pack, especially baptism's
no-adjudication posture and doubt's tone.

**Risks & rollback.** G4 rejects a designed pair (lexicons designed token-disjoint;
if G4 still fires, differentiate or merge — never touch budgets to pass). Unintended
G8 churn (churn outside the PR's own topic = lexicon too broad; narrow before
merge). Common words as thin cues in longer queries are designed behavior — write
fixtures against what actually happens; investigate before weakening any assertion.
Rollback: revert the PR, `--update-baseline`, re-approve; the inventory gate reverts
independently of the file.

**Dependencies.** `ci-timebomb` (hard). `governance` (v2 approvals — landed).
`source-drift` landed, so the fresh-checkout/fetch risk in the original section is
resolved. `ranking-fixes`: only the dual-citation restoration waits for it;
coordinate the G8 re-baseline chain (§5.2). Not dependent on `release-repair`.
**Size.** 4 PRs, overall M (S / M / S-M / M).

---

### 7.8 `ranking-fixes` — Five ranking behavior fixes (ENGINE_VERSION 0.10.0)

**Goal.** Before: `peace` → 1 Pet 5:7 over Phil 4:6-7 (fixed data-side by
`lexicon-concepts` PR 1; the engine-side dedup here makes the whole class
impossible); `the cross` → crucifixion mockery above Isaiah 53:5; `lords supper` →
Paul's rebuke ("it is NOT the Lord's supper that you eat") at #1; `it is well with my
soul` → Jeremiah 4:10 on nothing but a cross-translation vocabulary hint;
`propitiation` → a page of identical scores decided by book order; `praise` → all
five slots filled by individual verses of Psalm 150. After: curated passages lead;
a vocabulary-hint-only match can never occupy #1 over an honest text match;
`propitiation` ranks by distinctiveness; Psalm 150 appears once as
"Psalms 150:1-6". Every result still says exactly why it ranked and names every
source — where two sources agree on the same verse for the same theme, **one chip
names both** instead of two chips double-counting. All five fixes under **one**
engine bump (0.9.0 → 0.10.0).

**Current state (verified).** (1) Duplicate anchors sum — importer emits one row per
(entry × source) with no dedupe; `applyBudgets` keeps up to 3 per family, so both
rows score (35.2 vs 22.0 for `peace`); any `sources: [a, b]` entry double-counts the
same way. *(Data-side instance removed by `lexicon-concepts` PR 1; the mechanism
remains until this item.)* (2) `translation_variant` as sole evidence (max 14)
outranks honest token matches (max 10) — Jer 4:10 #1. (3) Whole-query `exact_phrase`
gets binary full authority (60) regardless of significant-word count, drowning
full-strength anchors (22-28) — "the cross", "lords supper". (4) `passage_terms`
carries `pmiSum` but never uses it — flat ties fall to canonical targetId order.
(5) `collapseAnchorRuns` requires rank adjacency; Psalm 150's verses rank
non-adjacently, so nothing collapses. G6 is a hardcoded pass. `preferredOrder` and
windows 1/3 exist unused; **pending corpus fixtures run non-blocking but their
failures are silently discarded** (only "now passing" is surfaced), and pending
ranker fixtures are not executed at all — the measured-gap record must therefore be
out-of-band (below). Fixture corpus contains 1 Cor 11:20, Ps 150, Matt 27:40,
1 Pet 5:7, Phil 4:6, 1 John 2:2; lacks Jer 4:10, Ex 25:17, Rom 3:25, Mark 15:30
(extension is a follow-up now that `source-drift` restored pinned bytes — §6 #8).

**Changes (two PRs).**
- **PR-1 — golden fixtures first (pending, non-blocking; no code).** Pending corpus
  fixtures: `the cross` (`preferredOrder`: Rom 5:8 before Matt 27:40), `lords supper`
  (`preferredOrder`: 1 Cor 11:23-26 before 11:20; expectedTop institution passage,
  `withinTop: 3`), `praise` (expectedTop "Psalms 150:1-6" `withinTop: 1`;
  `mustNotRank` the individual verses, or the page-variety form — decide by running
  it). *(The peace fixture is dropped — already pinned by the active
  `peace-of-god.json` via `lexicon-concepts` PR 1; §6 #3.)* Pending ranker file
  `ranking-invariants-0-10.json`: (a) sole `translation_variant` 1.0 must rank below
  `token_overlap` 0.7 + `proximity` 0.5 — the genuine rank()-level measured gap
  (fails today: 14 > 10); (b) 2-word `exact_phrase` vs full-query 2-token anchor +
  corroboration — anchor wins: an invariant **lock**, not a measured gap (its
  acceptance test is the lords-supper corpus fixture). **Measured-gap record:**
  because the gauntlet discards pending failures, PR-1's description embeds a one-off
  `npx tsx` replay of the pending fixtures/cases against the fixture-corpus engine,
  its failing top-N output pasted inline and annotated per fixture — that pasted
  record IS the covenant's fixture-first evidence. Plus a sweep over
  `ontology/concepts/*.yaml` listing any remaining within-concept duplicate refs
  (blast radius in the PR description).
- **PR-2 — the engine bump (squash-merged: exactly ONE commit lands on main;
  covenant #2 binds per commit — the PR description states this up front so Jesse
  doesn't use a merge commit out of habit).**
  1. **Anchor dedupe.** New pure `dedupeConceptAnchors`: group by
     `(conceptId, translationCode, verseId)`, one row per group; carrier chosen
     deterministically (weight desc → sourceId asc → locator asc → start asc);
     provenance NOT dropped — the surviving row's sourceId becomes the '+'-joined
     ascending union (`editorial+torrey`, the convention `passage_terms` already
     uses) and evidence labels render via the existing `joinedSourceLabel`, so
     unmerged rows are byte-identical. One chip naming all agreeing sources
     satisfies covenant #6 with no information loss. Cross-concept stacking
     unchanged. Wrapped at both `anchorVerses` call sites in `discover()`.
  2. **Duplicate-ref reporting extension.** *(The identical-range compile error
     landed in `lexicon-concepts` PR 1 — §6 #3.)* This PR adds only:
     overlapping-but-not-identical ranges → non-blocking finding on a passing G4
     (span-plus-emphasis curation may be deliberate; runtime dedupe already
     neutralizes stacking).
  3. **Data.** `peace-of-god.yaml`: restore `sources: [torrey, editorial]` on the
     single 1 Peter 5:7 entry, weight 0.85 (Jesse's call; see review), keeping the
     2026-08-08 comment — now safe because the engine single-scores multi-source
     entries. Apply the same merge to any duplicates the PR-1 sweep found.
     (`layerFingerprint` moves.)
  4. **Sole-evidence variant cap.** `SignalBudgets.soleEvidenceMaxPoints`, default
     `{ translation_variant: 6 }` (below token_overlap's 10); in `applyBudgets`, if
     all reasons belong to one capped family, scale down (`capped: true`,
     `uncappedPoints` preserved; label unchanged — the chip still says what it is,
     with points that admit it is a hint).
  5. **Short-phrase authority.** Whole-match branch computes significant-word counts
     like the fragment branch: <2 significant words files as `token_overlap`
     (fixes "the cross"); taper strength = coverage × min(1, sigWords/3) with
     `EXACT_PHRASE_FULL_AUTHORITY_WORDS = 3` exported as reviewed data (2-word
     verbatim phrase → 40, 3+ → 60; `weakAggregateCap: 30` stays below the 40
     floor). Parity: `conceptSpecificity` → 1.0 when the matched lexicon phrase
     covers the ENTIRE query with ≥2 tokens ("lords supper" → institution anchors
     reach 40 + corroboration vs the rebuke's 40-point phrase; the PR-1 fixture is
     the acceptance test, the taper constant the tuning knob).
  6. **passage_terms PMI factor.** Multiply strength by
     `min(1, pmiSum / (matchedTerms × 6.0))`, `PASSAGE_TERM_PMI_SATURATION = 6.0`
     (3× the G5 floor) exported as reviewed data — de-flattens propitiation using a
     statistic the pipeline already computed; no new adjudication. (A tie-break
     change in rank.ts was considered and rejected.)
  7. **Span-membership collapse.** Rewrite `collapseAnchorRuns` from rank-adjacency
     to span membership: pass 1 chooses each result's governing span
     deterministically; pass 2 emits in rank order, first-encountered member becomes
     the merged passage row, later members drop (results shift up — that is the
     point). Merged row: targetId = best member (fixture range-matching unchanged),
     reference = canonical min..max of surfaced members, excerpt in canonical verse
     order, `score = max(members)` (existing policy), reasons merged strongest-per-
     label. `COLLAPSE_HEADROOM` and rank→collapse→cut order kept.
  8. **Version + reviewed data.** Same commit: `ENGINE_VERSION = '0.10.0'` with a
     changelog comment naming all five changes; `engine/package.json` 0.10.0; a
     `signalBudgets` section in `eval/budgets.json` mirroring `DEFAULT_BUDGETS` plus
     the three new constants; **G6's hardcoded pass replaced by a deep-equality
     check** of the engine's exported constants against that reviewed copy (the
     engine keeps its constants in code — the seam stays `ContentQueryPort`; the
     gate makes them reviewed data with a consumer). **Also in this commit:**
     regenerate `eval/baselines/ordering.snapshot.json` + rewrite its approval
     (`eval-toughening` PR-A's G2 rules require it for any ordering change).
  9. **Promote fixtures.** Fold the PR-1 pending corpus assertions into the
     canonical files; fold both ranker cases into the active
     `ranking-invariants.json` (first commit where they can be active without
     turning G3 red — the cap lands in this same squashed commit; once active they
     join G2's replay set); delete the temporary pending files.
  10. **G8 baseline.** `--update-baseline` locally, commit the new baseline; and,
      per the gate's own demand for independent review plus merge-speed reality:
      (a) the PR-2 description embeds **inline** the before/after top-10 diffs for
      the 3-4 churning probes, each annotated with its PR-1 fixture; (b) the
      approval (v2 form per `governance`; identity 0.10.0; priorProvenance = the
      replaced baseline's blob) is **authored or amended by Jesse himself** — his
      push to the branch or an applied suggested change under his account — so the
      approval is his act, not the author's record. If he merges without it, G8
      fails in CI on the missing approval: the gate working as designed.

**Data & provenance.** No new external data. The merged 1 Peter 5:7 chip's
deterministic carrier is the `editorial` row, but the torrey attribution is not
lost — the chip's provenance renders "LH editorial + Torrey, New Topical Textbook
(public domain)" via `joinedSourceLabel`. Fixtures use WEB text already committed
(public domain); new reviewed constants in `eval/budgets.json`.

**Gates & versioning.** ENGINE_VERSION 0.9.0 → **0.10.0** in the same squashed
commit as every ordering-relevant change. corpusFingerprint unchanged;
layerFingerprint changes (YAML merge). G2: the ranker cases join the replay set at
promotion; the ordering-snapshot regen + approval make the bump mechanically
enforced (no longer discipline-only). G3: promoted fixtures; first `withinTop: 1/3`
and `preferredOrder` uses alongside `lexicon-concepts` PR 1's. G4: overlap
reporting. G6: real (constants equality; `eval-toughening` PR-D extends with
properties). G8: churn on peace/praise/phrase probes is the point — baseline +
Jesse-authored approval as above. Consumers pinning
`(engine semver, artifact descriptor)` are unaffected until the Phase-2 mint.

**Test plan.** Engine unit tests: `dedupeConceptAnchors` (collapse, carrier
tie-break, cross-concept survival, provenance labels byte-identical for single
sources); specificity parity; PMI factor + saturation; sole-evidence cap
(fires/never-fires, `capped`/`uncappedPoints`); whole-match phrase demotion/taper;
`collapseAnchorRuns` properties (subset-with-merges, no invented targetIds, relative
order of non-members preserved, adjacency cases still pass as a subset). Full local
`gauntlet --require-admit` with baseline+approval committed before opening.
Deferred (fixture-corpus extension, unblocked by `source-drift` but its own reviewed
re-baseline): Jer 4:10, propitiation, Mark 15:30 fixtures.

**What Jesse reviews.** PR-1: six ordering **opinions** only he can own (institution
above rebuke; atonement above mockery; Psalm 150 as one row) — veto here is cheaper
than after the engine PR. PR-2: (a) the merged 1 Pet 5:7 weight (0.85 keeps the
editorial judgment; 0.75 defers to Torrey); (b) the three new reviewed constants —
the tuning knobs he owns; (c) the G8 approval he authors himself against the inline
probe diffs; (d) the ENGINE_VERSION changelog comment matches what changed;
(e) squash-merge, one commit.

**Risks & rollback.** Constants may need one tuning iteration — inside the same PR,
before merge, never after. Fixture corpus ≠ full corpus (known residual until the
corpus extension). The collapse rewrite is the riskiest diff — pure function,
property-tested. Merged chips and lower variant points change what users see — both
corrections toward honesty; G3 `requiredReasonLabel` assertions still pass (reason
labels unchanged; only merged rows' provenance gains the second name). Rollback: one
revert restores a consistent world (code, YAML, budgets mirror, fixtures, baseline
travel together); priorProvenance makes the prior baseline recoverable by
construction.

**Dependencies.** `ci-timebomb` (hard). `governance` (approval flow — landed;
this item is its first big exercise). `eval-toughening` PR-A/PR-B before this
(policing — honored). `lexicon-concepts` PR 1 before this (§6 #3). `source-drift`
soft (deferred fixtures only). Not dependent on `release-repair`.
**Size.** 2 PRs. PR-1: S (new JSON only). PR-2: L, squash-merged to one commit; the
one intricate diff is the collapse rewrite (~80 lines).

---

### 7.9 `pericope-grouping` — Passage-level results via pericope grouping

**Goal.** Searching "his loving kindness endures forever" — the refrain the WEB
prints in all 26 verses of Psalm 136 — spends slot after slot on fragments of one
psalm: these are `exact_phrase` hits (authoritative, deliberately exempt from
per-chapter thinning) and no curated anchor touches Psalm 136/118, so the existing
anchor collapse can never group them. After: verse hits inside one section of
Scripture — as marked by the section headings of 20 surveyed translations
(OpenBible.info data) — merge into one passage-level result ("Psalms 136:1-26"),
every verse's own evidence still visible, with a checkable grouping explanation
citing the **summed boundary vote at the section's start verse** (the exact number
the artifact stores and the engine emits — the explanation and the shipped data
cannot disagree). Freed slots go to genuinely different passages. Nothing
theological is adjudicated: the grouping cites a countable structural fact.

**Current state (verified).** Result unit is a verse; two partial grouping
mechanisms exist (chapter groupId feeds diversification only; `collapseAnchorRuns`
merges only consecutive-ranked, consecutive-verse members of curated anchor spans).
No pericope data anywhere in the artifact; schema v6 has no section table; optional
tables are feature-detected, so a new table can be optional the same way. Source
verified live 2026-08-14: `https://a.openbible.info/data/bible-section-counts.txt`,
sha256 `5e9e838d…`, 398,925 B, 12,649 lines; rows are candidate *section spans with
votes* (correction to the audit's phrasing — boundary counts must be derived as the
sum over rows sharing a start verse). Worked example (James 1): summed boundary
votes 1:1→13, 1:2→19, 1:19→**16** (the per-row vote for the exact span 1:19-27 is
13 — two numbers that must never be conflated; stored/cited is always the sum). At
threshold ≥10, James 1 tiles 1:1, 1:2-18, 1:19-27. Fixture-passage facts verified:
Psalm 136 derives as a single pericope (votes 12) and sits outside every curated
anchor — only the new path can group it; Genesis 11 tiles 11:1-9 / 11:10-26 /
11:27-32 with the phrase "became the father of Abram, Nahor, and Haran" verbatim in
BOTH 11:26 and 11:27 — the raw material for a no-overgrouping fixture that can
actually fire; "hearing and doing" already collapses at HEAD via the anchor path
(the James fixture pins authority order, not the new path).

**Changes (two PRs; PR 1 = capability with zero ordering change, PR 2 = behavior +
bump).**
- **PR 1 — "openbible-sections: data, schema v7, engine reads it (no behavior
  change)".**
  1. Three golden fixtures, `pending`: `pericope-grouping-loving-kindness.json`
     (Psalm 136; `requiredGroupingSourceId: "openbible-sections"` — only the
     pericope path can satisfy it); `anchor-grouping-explained.json` ("hearing and
     doing"; `requiredGroupingSourceId: "editorial"` — pins that the existing
     anchor collapse gains an explanation AND that pericope provenance never usurps
     anchor provenance); `pericope-no-overgrouping-terah.json` (Gen 11:26 + 11:27 as
     two distinct expectedTop entries — every merge precondition holds EXCEPT
     pericope identity, so a boundary-ignoring regression genuinely fires it).
  2. New manifest `pipeline/manifests/openbible-sections.json` (CC BY; pinned
     sha256/bytes; `rollingSourceUrl: true`; attribution note: counts only — no
     heading text, no verse text of any translation is present; re-verify the hash
     at fetch time). *(Harmonized §6 #7: Jesse uploads the pinned file to the
     source-snapshots Release first and the manifest sets `archiveUrl` — **no** new
     entry in `acknowledgedUnarchivedRollingSources`, which `source-drift` emptied.)*
  3. `eval/budgets.json`: add `"pericopes": 1048576` to `size.perTableBytes`.
  4. `fetchSources.ts` UNPACK entry (`plain` — a bare .txt).
  5. `importSectionCounts(contents)` following `importCrossReferences` (OSIS parse,
     reject-and-report).
  6. New pure `pipeline/src/buildPericopes.ts`: `boundaryVotes` (sum per start
     verse); `derivePericopes` with `BOUNDARY_VOTE_THRESHOLD = 10` (exported,
     reviewed) ∪ forced book-starts; invariants: within a book, disjoint, ordered,
     tile every present verse.
  7. `schema.ts`: `SCHEMA_VERSION '6' → '7'`; `pericopes(start_verse_id,
     end_verse_id, boundary_votes, source_id)` + range index; comment: votes are a
     countable fact, never a relevance score.
  8-9. Wire into `buildArtifact.ts` and `buildConceptLayer.ts` — pericope rows
     **feed the layer fingerprint per-record** plus the count record.
  10. Fixture schema: optional `requiredGroupingSourceId` on `expectedTop` entries.
  11. Engine capability only: add `'7'` to `SUPPORTED_SCHEMA_VERSIONS`;
     `hasPericopes()` probe + `pericopesContaining(verseIds)` batched over the
     ranked window. **No call sites in `discover()` yet — ordering bit-identical, no
     bump** (the bump lands with the commit that can change ordering).
- **PR 2 — "passage-level grouping: behavior, contract, ENGINE_VERSION 0.11.0".**
  12. `types.ts` §5 contract extension: `GroupedVerse` (per-verse evidence,
      uncollapsed) and `ResultGrouping { section, provenance }`; `DiscoveryResult`
      gains optional `verses?` and `grouping?`. The grouping's "why" is a typed
      field, NOT a `Reason` — reasons must correspond to scoring evidence and
      grouping contributes **zero points**.
  13. Generalize `collapseAnchorRuns` → `collapseRuns(results, verses, anchorSpans,
      pericopeOf)`: merge rule unchanged in conservatism — consecutive in rank AND
      verseId-consecutive AND (shares an anchor span [checked first — fixed
      authority order] OR same pericopeKey). Merged row: reference = span of the
      *hits* (never the whole pericope), `score = max(members)` (deliberately not
      max+sum — a passage must not outrank by having more mediocre verses),
      `verses[]` in verse order, `grouping` (anchor-only runs cite the concept
      anchor's source — the existing collapse becomes explained too). Grouping
      never crosses a chapter even when a pericope does — documented v1 limitation.
      Diversification input stays chapter-level (a separate later decision).
  14. **`ENGINE_VERSION '0.10.0' → '0.11.0'`** in the same commit *(renumbered per
      §5.1)*, package.json to match; regenerate ordering snapshot + rewrite its
      approval in the same commit (G2 rules).
  15. Flip the three fixtures `active` (their per-fixture provenance assertions
      match the authority-order rule); spot-run the full golden set (range-matching
      keys off the run head's targetId — preserved).
  16. G8: regenerate + independent v2 re-approval; churn on multi-verse-passage
      probes is the intended effect and must be eyeballed, not waved through.
  17. `docs/implementation-plan.md` §5: document `verses`/`grouping`; add the
      OpenBible CC BY attribution-passthrough sentence (can cover all three
      OpenBible sources in one paragraph — Jesse's call); regenerate
      `docs/ATTRIBUTIONS.md` (automatic from the manifest).

**Data & provenance.** OpenBible.info Bible section counts, CC BY (announcement post
+ site footer; same posture as the two admitted OpenBible sources). The file
contains section-placement counts across 20 translations — the copyrighted
expression (headings, verse text) is absent. Archived snapshot per §6 #7. Structural
data: no `derivedFrom`, no correlation-group change, and since grouping contributes
no points there is no scoring channel for G7 to budget. The shipped table is a
deterministic function of (source rows, threshold, present verses); threshold
changes move `layerFingerprint`.

**Gates & versioning.** G1 green via pinned manifest + archive. G2: PR 1 no bump;
PR 2 bumps 0.11.0 in-commit. G3: three new fixtures + the new assertion field; all
70 existing fixtures stay green; a grouped result carrying wrong grouping provenance
is a G3 failure — explanations are the contract. G6/G7 untouched. G8: **PR 1 must
show zero churn** (the proof the capability-only split is real); PR 2 re-approves.
G10: new 1 MiB per-table budget (actual ≪ 200 KB). G11: one bounded query over ≤ 50
rows. `schemaVersion` 6 → 7; engine keeps opening 1-6. **Measured effect
attribution:** PR 2's Admission Report must show at least one diff whose grouping is
produced by the pericope path itself (`grouping.provenance.sourceId ===
"openbible-sections"` — the Psalm 136 fixture is the guaranteed instance);
improvements attributable only to the pre-existing anchor collapse do NOT count as
the new data paying for itself. No such diff → NO MEASURABLE EFFECT → do not merge.

**Test plan.** Pipeline: import parse/reject tests with the accepted-row count
asserted (silent upstream format change fails loudly); `derivePericopes` properties
+ real-data golden slices (James 1 `[1:1, 1:2-18, 1:19-27]` with votes 13/19/16 —
the 16 being the *sum*; Psalm 136 `[136:1-26]` at 12; Genesis 11
`[11:1-9, 11:10-26, 11:27-32]` at 19/19/14); threshold-sensitivity test pins the
constant; fingerprint sensitivity. Engine: collapseRuns merge/boundary/authority/
determinism cases; schema v7 open + graceful degradation (a v6 artifact produces
byte-identical 0.9.0-shaped output). Gauntlet: PR 1 verify green with G8 churn 0;
PR 2 green with fixtures active + re-approved baseline.

**What Jesse reviews.** PR 1: license/attribution wording (counts, never heading
text); the archive upload; the threshold choice; ~20 spot-checks of derived
pericopes against his own print Bibles (James 1, Psalm 23, 1 Cor 13, Gen 1-2,
Psalm 136, Gen 11 — most print Bibles break Genesis 11 exactly at v.27, which the
14-vote boundary encodes). PR 2: fixtures active and passing; the measured-effect
attribution line; the G8 diff (grouped passages replacing verse runs — the churn IS
the feature; anything else is a bug); the explanation wording including that the
cited count is the summed vote. **Decisions only he can make:** (1) the §5
consumer-contract shape (`verses[]` + typed `grouping` vs extra chips — pinned by
three apps); (2) ratify/adjust the 10-of-20 threshold; (3) whether the attribution
paragraph covers all three OpenBible sources at once (recommended).

**Risks & rollback.** Upstream file may roll before PR 1 (re-hash while authoring;
pin what is actually reviewed; last-modified 2024-10-06 suggests stability).
Contract ripple: schema v7 artifacts rejected by every published engine — status-quo
breakage; do not ship a v7 artifact before the Phase-2 mint; engine 0.11.0 still
opens v1-6, so merging the engine first is safe. Over-grouping mitigated by hit-span
labeling, `verses[]`, and the Terah fixture. G8 churn misread mitigated by PR 2
containing ONLY the grouping change with PR 1's zero-churn control. Both PRs revert
cleanly.

**Dependencies.** `ci-timebomb` (hard). `source-drift` (soft; landed — avoids
entangling reviewed checksum changes). `release-repair` (soft, shipping only).
Independent of but complementary to future versification research
(`versification-tvtms`, out of this plan) and the attribution-passthrough docs work
(`consumable` PR 3 completes it).
**Size.** 2 PRs, M total.

---

### 7.10 `spelling-aliases` — Deterministic spelling correction and curated phrase aliases

**Goal.** Before: "fathfulness" returns an empty list with no suggestion; "how great
thou art" collapses to the token `great` (how/thou/art are stopwords); "it is well
with my soul" collapses to `well soul` and surfaces Jeremiah 4:10 — a sense-inverted
#1 for a grieving person quoting Spafford's hymn. After: "fathfulness" returns
Lam 3:22-23 with the chip *Shared word: faithfulness (corrected from
"fathfulness")* — correction fires only for words that exist nowhere in the corpus,
names, or curated vocabulary, and is always cited, never silent; hymn lines land on
the passages a curated alias table names with the chip
*Hymn: "It Is Well with My Soul" → Theme: Peace of God* (provenance alongside the
label — the engine reports that a curated source connects the line to the passage
and adjudicates nothing). Both are pure lookups over reviewed data built offline;
same query, same artifact, same version → same ordering everywhere.

**Current state (verified).** `fathfulness` stays `fathfulness` (the stemmer never
touches `-ss`), has zero document frequency, matches nothing at any step of
`discover()`; the discovery outcome has no suggestion field; no fuzzy code exists
anywhere. Stopword list includes with/my/it/is/how/thou/art; no table maps
hymn/paraphrase language to concepts — `concept_lexicon` matches by token
containment, structurally unable to represent a stopword-heavy line (it would
collapse to `great` and fire on anything containing "great"). Vocabulary and
frequency data are already in the artifact (`token_stats`, `books`/`book_aliases`,
`concept_lexicon.normalized`, `verse_translation_tokens`). Extension seams:
presence-probed optional tables; layer-fingerprint precedent — derived
`translationTokens` joins only as an aggregate count, which cannot see one token
swapped for another of equal count; **this plan deliberately exceeds that precedent
with per-record feeds** because each row individually determines which correction
wins. `requiredReasonLabel` matches by exact string equality (no prefix mode — and
none is added); `additionalQueries` share the fixture's expectation list, so
misspellings targeting different passages need separate fixtures.

**Changes (three PRs).** *(Renumbered per §5.1/§6 #1: schema slot is **v8** —
pericope took v7; versions are **0.12.0** and **0.13.0**.)*
- **PR 1 — deterministic spelling correction (schema v8, ENGINE_VERSION 0.12.0).**
  1. Fixtures first — one per misspelling: `spelling-fathfulness.json` (expectedTop
     Lam 3:22-23, `requiredReasonFamily: concept_anchor`, exact corrected-chip
     label); `spelling-forgivness.json`; `spelling-rightousness.json` (all three
     `-ness` misspellings verified untouched by the stemmer);
     `spelling-beleived.json` — the **stem-divergence** case: `beleived` tokenizes
     to `beleiv` before correction, so the fixture pins that the corrected-from half
     cites the **typed word**, never the stem
     (`Shared word: believ (corrected from "beleived")`); plus a negative fixture —
     a *known* word (`pray`) is never rewritten.
  2. Schema **v8**: `spelling_terms(term, document_count, origin)`,
     `spelling_deletes(variant, term)` + index, and `curated_aliases` (shipped empty
     in PR 1, populated in PR 2) with the concept-XOR-verse-range invariant **in the
     DDL** (CHECK constraint) and the `title` column present from day one — the
     stated, accepted risk being that a PR 2 review change to the shape would force
     a v9 bump with its own migration note (a decision, not a surprise).
  3. New `pipeline/src/buildSpellingIndex.ts`: vocabulary = corpus tokens ∪ book
     names/aliases ∪ lexicon tokens ∪ translation tokens; SymSpell delete-variant
     precompute under a reviewed edit-policy table (len <5 → never; 5-8 → ED 1;
     ≥9 → ED 2); byte-deterministic sorted output; **per-record layer-fingerprint
     feed** (stronger than the count-only precedent, same "changes RESULTS"
     reasoning); wired into both `buildArtifact` and `buildFixtureDb` so the
     gauntlet's hermetic artifact carries the tables.
  4. Engine repository: `hasSpellingIndex()` + `suggestCorrection(token)` (one
     indexed lookup; SQL only, through `ContentQueryPort`).
  5. New `engine/src/intents/spelling.ts`: shared policy constants (cross-checked
     by test — engine may not import pipeline code), bounded pure
     `damerauLevenshtein`, `pickCorrection` ordered by verified distance →
     document_count → lexicographic (total).
  6. Tokenizer surface pairing + wiring: new
     `significantWordsWithSurface(text)` carrying the raw typed word per token
     (`significantWords` delegates to it, byte-identical outputs — one-tokenizer
     rule intact, `TOKENIZER_VERSION` stays 1.0.0 with an invariance test). In
     `discover()`: for each token with df 0 AND no exact `spelling_terms` row
     (genuinely OOV — a known name or lexicon word is never rewritten), substitute
     `pickCorrection`'s winner, recording `{from: surface, to: term}`; corrected
     tokens flow through the existing steps unchanged. The whole-query FTS phrase
     step stays uncorrected in v1 (deliberate scope cut, noted under Risks).
  7. Explanations: optional `corrections?` on the discovery outcome (additive §5
     check); `tokenEvidence` renders the corrected-from chip citing the surface
     form. Concept-anchor results reached via a corrected token keep their honest
     `Theme:` label; the result-level `corrections` field carries the citation.
  8. **`ENGINE_VERSION → '0.12.0'`** in the same commit; add `'8'` to
     `SUPPORTED_SCHEMA_VERSIONS`; regenerate ordering snapshot + approval in-commit.
  9. Budgets: `spelling_terms` 1 MiB, `spelling_deletes` 12 MiB, `curated_aliases`
     1 MiB; reviewed mitigation ladder if the ED-2 table busts its budget on the
     full corpus (df ≥ 2 floor → ED-2 at len ≥ 10 → ED 1 everywhere).
- **PR 2 — curated alias mechanism + starter public-domain pack (ENGINE_VERSION
  0.13.0).**
  1. Fixtures first, one per alias family, each pinning the **full exact label**
     (`Hymn: "It Is Well with My Soul" → Theme: Peace of God`) — exact equality is
     the stronger assertion, and a wording change to a contract-bearing label
     *should* fail G3 until the fixture updates in the same PR. `alias-it-is-well`
     includes `mustNotRank: Jeremiah 4:10` (the audit's sense-inverted #1); plus
     how-great-thou-art, solid-rock, blessed-assurance, turn-your-eyes,
     what-a-friend. A pack with no fixtures is rejected structurally.
  2. New reviewed `ontology/aliases/hymn-lines.yaml` (~20-30 entries, documented in
     `ontology/README.md`): phrase, optional variants, clean `title`, concept XOR
     ref target, source, locator (author, year, PD status), weight. Targets:
     it-is-well → peace-of-god (inheriting the **fixed** entry); how-great-thou-art
     → worship; solid-rock → building-on-the-rock; blessed-assurance →
     remembered-faith-as-assurance; turn-your-eyes → remembered-looking-to-jesus;
     what-a-friend → prayer; a-mighty-fortress → refuge-in-trouble; amazing-grace →
     grace-not-earned; come-thou-fount → thanksgiving; **and, now that
     `lexicon-concepts` has landed (§6 #9), comfort- and cornerstone-targeted
     aliases** (e.g. → `god-of-all-comfort`, → `christ-the-cornerstone`).
  3. Manifest `pipeline/manifests/hymn-aliases.json` (editorial-class, pins no
     bytes — precedent accepted by G1).
  4. `aliasImporter.ts`: validation (unknown concept; both/neither target —
     mirroring the DDL CHECK; missing title; duplicate `normalized_raw`; <2 raw
     words so an alias can never become a bare-word trigger); per-record
     fingerprint feed including `title` and `locator` (they surface verbatim —
     explanations are contract).
  5. Tokenizer: export `normalizedPhrase(text)` = `rawWords` joined (stopwords
     KEPT); no change to existing outputs.
  6. Engine: `matchAliases(normalizedRaw)` — **whole-query equality, not
     containment** (what keeps a curated phrase from becoming a hidden second
     ranking system); `aliasEvidence` emits family `concept_anchor` (no new
     SignalFamily; budgets untouched), strength = alias weight × anchor weight;
     label format finalized and load-bearing for the fixtures; ref-targeted form
     `Hymn: "<title>" names this passage`; provenance
     `{sourceId: 'hymn-aliases', label: 'LH editorial (public-domain hymn index)',
     locator}`. v1 deliberately does not seed related-concept/xref expansion or
     `themes()` from aliases.
  7. **`ENGINE_VERSION → '0.13.0'`** in the same commit (no schema bump — tables
     shipped empty in PR 1; engine guards on a presence-and-rows probe so v8
     artifacts built before PR 2 behave identically); regenerate ordering snapshot +
     approval in-commit.
- **PR 3 (optional, repeatable) — alias pack expansion.** Data-only: entries +
  fixtures + admission report; no engine change, no bump; layerFingerprint moves.
  `NO MEASURABLE EFFECT` → don't merge. If Jesse's Hymnary permission email is ever
  answered yes, that data arrives in this shape with its own manifest; the plan is
  complete without it.

**Data & provenance.** Spelling tables: derived data, no new upstream source — a
deterministic function of already-admitted bytes, identified in the layer
fingerprint. Alias pack: editorial-class manifest; hymn titles and first lines are
not copyrightable in the US (Copyright Office Circular 33) and entries are
restricted to title/first-line length — never multi-line lyric quotation.
Public-domain hymns (Spafford 1873, Crosby 1873, Scriven 1855, Great Is Thy
Faithfulness pub. 1923 — US PD since 2019) are doubly safe; copyrighted hymns
("How Great Thou Art", © Stuart Hine Trust) store the **title only**. Open Hymnal
Project as a PD source list; **Hymnary.org's index is not openly licensed and is
not used** — whether to send a permission email is Jesse's call; nothing depends on
the answer. Alias reasons carry `{sourceId, label, locator}` so consumers can
render title and source per G1 discipline.

**Gates & versioning.** G2: both features alter ordering → bumps in the same
commits (0.12.0, 0.13.0), each with snapshot + approval regen. G3: new fixtures are
the acceptance criteria; existing 70 stay green — spelling fires only on OOV
tokens (a dedicated invariant test enforces this). G4: importer rejections at build
time + informational single-token-collapse listing for alias phrases. G6: no budget
numbers change (aliases reuse `concept_anchor`). G8: expected churn ≈ 0 for both
PRs; any nonzero churn requires re-approval in the same PR; **NO MEASURABLE EFFECT
on the new fixtures = do not merge**. G10: three new reviewed budgets; ~14 MiB
worst case fits 160 MiB. G11: one indexed lookup per OOV token / one equality
lookup per discovery — assert p95 holds. Fingerprints: corpus unchanged; layer
moves (per-record feeds). Schema '8' once (PR 1); engine package 0.11.0 → 0.12.0 →
0.13.0; schema-8 artifacts require engine ≥ 0.12.0; consumer shipment rides the
Phase-2 mint.

**Test plan.** Tokenizer invariance snapshots (outputs byte-identical before/after
both new exports; surface pairing round-trips). Spelling unit tests
(Damerau-Levenshtein table; tie-break totality; policy edges; **known-word
invariant**; SQL-row-order independence). Pipeline tests (byte-determinism;
policy-constant cross-check; alias rejection cases; fingerprint sensitivity).
Engine integration against the fixture db (`fathfulness` end-to-end with exact chip;
`beleived` surface-form survival; `it is well with my soul` exact alias label with
Jer 4:10 outside the window; schema-6 regression — engine 0.13.0 opens a v6 db and
behaves exactly as 0.9.0 did). Golden fixtures pin family AND full exact label — the
*reason* is asserted, not just the rank.

**What Jesse reviews.** PR 1 — mechanism: the edit-policy table (the only numbers
with taste in them), the tie-break, the never-rewrite-known-words invariant, the
three size budgets, the corrected-chip wording (typed surface form, never the
stem), the `corrections` field vs §5. PR 2 — data: **every alias row is an
editorial judgment** — read the pack line by line like a concept pack; the license
text; the title-only rule; the chip wording (reports an association, adjudicates
nothing). **Decisions only he can make:** (1) the Hymnary permission email — send
or don't; (2) comfort with title-only use of copyrighted hymn titles, or strike
those rows and ship PD-only; (3) concept-target choices where two concepts
plausibly fit.

**Risks & rollback.** Wrong correction beats no correction — mitigated by OOV-only,
conservative distance policy, always-cited corrections, pinned fixtures; artifact
rebuilt without the tables reverts behavior with no engine change. Delete-table
size — reviewed mitigation ladder. Alias equality matching is brittle **by
design** (typos in the line and extra words miss; `variants:` covers common
shortenings; misses visible in search logs for later reviewed variants). Phrase-step
correction gap — deliberate v1 cut. Version bumps compound with `ranking-fixes` and
`pericope-grouping` — sequenced so each bump's ordering diff is reviewed in
isolation (§5.1). Sense-inverted alias targets — the alias fixtures assert final
ordering, so a bad inheritance fails G3 rather than shipping (and peace-of-god is
already fixed).

**Dependencies.** `ci-timebomb` (hard). `source-drift` (hard for the full artifact —
landed). `release-repair` (hard for consumer delivery — landed; shipment rides the
Phase-2 mint). `lexicon-concepts` (targets — landed). `ranking-fixes` (peace
inheritance + bump sequencing — landed). `pericope-grouping` PR 1 (schema slot —
landed).
**Size.** PR 1: M; PR 2: M; PR 3: S each. Overall L across the item.

---

### 7.11 `consumable` — Make it consumable: contract, docs, and cadence for many apps

**Goal.** A developer building on this engine cannot tell what they may rely on: 65
exported symbols vs a 5-method contract buried in an internal doc; no CHANGELOG (the
0.8.0 breaking change is discoverable only in `git log`); no engine×schema×release
compatibility table; three apps must each reimplement the security-relevant
fetch-and-verify logic; and the legal obligations shipped apps inherit (CC BY
attribution, pastoral-crisis display) are not packaged anywhere a consuming
developer will see them. After: a declared stable API tier with per-method error
semantics; a compatibility matrix with sha256s; a guarded CHANGELOG; one audited
shared fetch-and-verify implementation; a runnable quickstart; and one CONSUMERS.md
stating every obligation. The one thing a worship leader would eventually notice —
the crisis-resource card above results in every app, and OpenBible credited in every
About screen — is what CONSUMERS.md exists to guarantee.

**Current state (verified).** Works already (do not rebuild): zero-dependency engine
package with exports map + OIDC/SLSA publishing; accurate README quickstart;
exemplary `docs/ATTRIBUTIONS.md`; `eval/test/consumer-api.test.ts` is already the
executable consumer-contract spec (typed invalid-reference, `ResultIdentity`,
`forSong` determinism, `themes` empty-on-no-match); `release-contract.test.ts:33`
already CI-enforces the package-version ↔ ENGINE_VERSION lockstep; the port-backed
test infrastructure lives in `eval/` on purpose (engine stays I/O-free). Gaps: no
CHANGELOG *(seeded by `release-repair` — §6 #5)*; no compatibility matrix (schema
support lives only in code; npm 0.7.1 supports 1–5); 65 exports with internals
unmarked; `createEngine`'s three distinct throws (unsupported schema,
tokenizer-version mismatch behind the undocumented `enforceTokenizerVersion` escape
hatch, malformed meta) documented nowhere; three apps copy-paste
`workbench/src/fetchArtifact.ts`; obligations buried; no deprecation policy; the
schema-6 `verse_translation_tokens` counsel flag unraised as a tracked item;
`v*` tags fire the release workflow, so retroactive version tags are forbidden.

**Changes (three PRs; docs/packaging/tests only — no ranking, weights, tokenizer,
or tie-break changes anywhere).**
- **PR 1 — cadence: CHANGELOG formalization + release guard.** Formalize
  `engine/CHANGELOG.md` (created by `release-repair`) into Keep a Changelog 1.1.0:
  0.7.0 (first publish; empty-tarball incident + its guard), 0.7.1 (packaging fix;
  release-identity history), 0.8.0 **BREAKING** (anchor-run collapsing; never
  published), 0.9.0 (schema 6, 33-concept era; published by `release-repair`),
  0.10.0–0.12.0 (in-repo), `[Unreleased]`/0.13.0. Add a release.yml step "Refuse to
  publish an unchangelogged version" (grep for the `## [<version>]` heading; error +
  exit 1 — mirrors the stale-descriptor guard style). Root README "Versioning &
  releases" pointer. **Do NOT mint retroactive `v0.8.0`/`v0.9.x` tags** (they match
  the `v*` trigger); if Jesse wants history markers, non-triggering names
  (`engine/0.8.0`) — his decision; default CHANGELOG-only.
- **PR 2 — contract: stable API tier, error semantics, compatibility matrix,
  contract tests.** *(No version bump — rides the unpublished 0.13.0; §6 #6. G8
  must report 0% churn — the proof the change is surface-only.)*
  1. New `engine/src/internal.ts` re-exporting the internal machinery
     (`CorpusRepository`, lexical/tokenizer/budget/rank internals,
     `collapseAnchorRuns`, `SUPPORTED_SCHEMA_VERSIONS`, …).
  2. `engine/package.json`: `"./internal"` exports entry; `"sideEffects": false`;
     `"engines": { "node": ">=22" }`.
  3. `engine/src/index.ts`: keep ALL current exports (removal is breaking; deferred
     to 1.0.0) restructured into a **Stable tier** (createEngine + options, all of
     `types.js`, the reason vocabulary — explanations are contract, so their types
     are too — and reference parsing) and an **Internal tier** whose every
     re-export carries a `@deprecated Import from
     '@jestek-dev/scripture-engine/internal'…` JSDoc so editors flag consumer call
     sites.
  4. `engine/README.md`: "API stability" section + a per-method **error-semantics
     table** verified against source: `createEngine` throws for unsupported schema
     (exact message shape), tokenizer mismatch (documenting the
     `enforceTokenizerVersion` escape hatch and its diagnostics-only warning —
     mismatched postings yield quietly wrong rankings, not errors), and malformed
     meta (required keys listed; `layer_fingerprint` absence is NOT an error —
     empty string is legal for a layerless artifact, which a consumer checking
     `layerFingerprint` needs to know); `research`/`passage`/`related` → typed
     `invalid-reference`, never a throw; `themes` → empty array; port rejections
     propagate — the port owner owns I/O errors; `forSong` order-independence +
     40-token cap.
  5. New `docs/COMPATIBILITY.md`: engine (npm) × supported schemas × published
     releases (tag → content.db sha256). Rows: 0.7.0/0.7.1 → 1–5 → v0.7.1
     `b57d3676…` (123,310,080 B); 0.9.0 → 1–6 → v0.9.0 (filled from
     `release-repair`); 0.13.0 → 1–8 → v0.13.0 (filled at the Phase-2 mint). Plus a
     plain-language mismatch paragraph and the pinning rule.
  6. Contract tests — in `eval/test/`, per the recorded placement rationale;
     existing coverage NOT re-added. Net-new: `forSong` 40/41-token boundary;
     `research()` invalid-reference typed (existing file covers `passage` only);
     new `eval/test/contract-drift.test.ts` — schema-v99 rejection (mutated copy of
     the fixture DB), **matrix drift guard** (parse COMPATIBILITY.md; schema list
     must equal the real `SUPPORTED_SCHEMA_VERSIONS` exported via internal.ts),
     **tier drift guard** (runtime assertion for stable value exports; type imports
     + tsc for type exports — the split documented so nobody mistakes the value
     list for full coverage).
- **PR 3 — consumers: obligations doc, shared fetch helper, quickstart, counsel
  flag.**
  1. New `docs/CONSUMERS.md`: pinning (`(engine semver, artifact descriptor)`;
     store the identity triple with anything cached); **attribution passthrough
     (REQUIRED)** — exact strings from the manifests' `attributionNote` fields with
     links (license verified at source 2026-08-14), now covering all three
     OpenBible sources incl. sections; **pastoral-crisis display (REQUIRED)** —
     canonical text moved verbatim from `docs/implementation-plan.md` §5 (crisis
     card from `sensitive-categories.json`; passage context, never bare verses; no
     healing-guarantee copy), with §5 reduced to a pointer — one source of truth;
     WEB naming rule; **support & deprecation policy** (schema removal is a
     BREAKING-labeled change; one published release supports old+new schema before
     a drop; published release assets are never deleted; matrix updated in the same
     PR as any schema/publish change); artifact hosting (GitHub Releases; mirrors
     MUST re-verify `databaseSha256`; no first-party CDN — explicit non-goal).
  2. New workspace `artifact-client/` publishing
     `@jestek-dev/scripture-artifact-client` (zero runtime deps):
     `parseDescriptor` (typed, never throws), **pure no-I/O**
     `verifyArtifactBytes(descriptor, {sha256Hex, byteLength})` — the layer RN apps
     use with their own downloader — and Node convenience
     `fetchAndVerifyArtifact` porting the proven workbench logic
     (stream-hash, delete-on-mismatch with the loud two-hash message, size check),
     resolving the URL from the descriptor's `release.tag`
     (`release-repair`'s field) with an explicit `url` override — **never** derived
     from `v${engineVersion}`. Refactor `workbench/src/fetchArtifact.ts` to a thin
     wrapper over the package (one implementation, exercised daily). Add the
     workspace to root `package.json` (existing `--workspaces` scripts cover it).
     Publishing extends the existing OIDC step — Jesse decision below; until then
     the package ships in-repo.
  3. New runnable `docs/examples/quickstart.mjs` (~35 lines; the audit's
     fresh-consumer test showed this works).
  4. `docs/NEEDS-JESSE.md`: new numbered section — **counsel pass on the
     translation-variant index before commercial shipment** (`verse_translation_
     tokens`, 14,102,528 B, ESV/NIV/NLT-derived; the recorded defense is well-argued
     but has never had legal review). Cross-linked from CONSUMERS.md; commercial
     schema-6+ shipment marked blocked-by-NEEDS-JESSE until the pass happens.

**Data & provenance.** No manifests change; no data enters the artifact.
CONSUMERS.md quotes attribution strings verbatim from the manifests so there is no
second drifting phrasing. The counsel-pass entry makes the one open rights question
a tracked blocking item instead of an audit paragraph. The matrix records
published-asset sha256s as reviewed data, guarded by the drift test on the engine
side.

**Gates & versioning.** Result ordering untouched everywhere. No ENGINE_VERSION
bump (§6 #6); G8 must report 0% churn on PR 2 — churn means something snuck in and
the PR is wrong, not the baseline. Fingerprints unaffected; no artifact rebuild.
The two release.yml additions only add refusals, never remove them.

**Test plan.** As listed per PR: contract tests in `eval/test/` (net-new only);
`artifact-client` pure-layer truth table + injected-fetch tests (happy path;
corrupted stream → file deleted + typed loud failure preserving the two-hash
message; short body; 404 → clear release-asset-missing error); workbench regression
(relocation only, no behavior change); the release guard verified locally against a
version absent from the CHANGELOG.

**What Jesse reviews.** PR 1: does the 0.8.0 entry describe the break the way he'd
explain it to a consumer; is the 0.7.x history honest; tags decision. PR 2: **the
stable/internal split is a promise to three apps** — specifically the middle ground
(reference parsing stable; tokenizer/ranking internals internal); the "removed at
1.0.0" deprecation promise; and the error-semantics table read as the contract it
is — a wrong row is a wrong promise to Maskil. PR 3: is the crisis-card requirement
stated as non-negotiably as §5 had it (moved, not softened); are the attribution
strings the ones he wants on About screens; **decisions only he can make:** the
policy numbers (commitments), whether to configure npm trusted publishing for the
second package now, and commissioning the counsel pass — nobody else can engage
counsel.

**Risks & rollback.** Wrong tier assignment is the main risk — nothing is removed
until 1.0.0, so a wrong call is correctable by a follow-up doc/deprecation change.
Policy over-commitment — prose reviewed by Jesse, changeable by PR with CHANGELOG
notice. artifact-client drift — structurally mitigated (workbench consumes it);
revertible per-file. Second-package supply-chain surface — same OIDC path, zero
deps, deferrable. Matrix rot — drift test + release-checklist habit + CHANGELOG
guard. Timing with `release-repair` field shape — landed first in this sequence; the
`url` override keeps the helper usable regardless.

**Dependencies.** `release-repair` (hard — landed: publishes 0.9.0, mints the
release the matrix cites, adds the descriptor location field, clears the stale
block). `ci-timebomb` (landed). Not dependent on eval, data, or workbench items.
**Size.** 3 PRs, overall M (S / M / M).

---

## 8. What Jesse does — consolidated checklist, in sequence order

Phase 0
1. **[ci-timebomb]** Merge the clock-injection PR (check: 24h window untouched;
   test clock deliberately in 2050; local verify output green in the PR body).
2. **[workbench-hardening A]** Merge "close the old judgment door"; open the
   workbench, judge one result normally, see "legacy log: closed and canonical" in
   Health; confirm the three original judgments untouched.
3. **[workbench-hardening B]** Merge "Not relevant, in your words"; click the
   button on a no-evidence and an evidence-bearing result; **decide:** is the
   question wording natural, and is the one remaining required sentence acceptable
   friction?
4. **[source-drift A]** Merge the drift sentinel (check: schedule/dispatch-only;
   failure output names both hashes).
5. **[source-drift errand]** Upload the three new source snapshots (and the July
   zips if his machine still has them) to a `source-snapshots-2026-08` Release,
   verifying sha256s first. **Decide:** is losing from-scratch July reproducibility
   acceptable if the old bytes are gone?
6. **[source-drift B]** Merge the WEB re-pin — he is admitting a new revision of
   the Scripture text: read the verse-level diff (typography-only?), check G3
   all-pass and G8 zero churn, **sign the baseline approval**.
7. **[source-drift C]** Merge the OpenBible re-pins: check CC-BY header quotes,
   the acknowledgment removal, the G8 churn report; **sign the second approval**.
8. **[release-repair 1]** Merge the release machinery (check: tag path has no
   build step; mint is dispatch-only; CC BY passthrough sentence present).
9. **[release-repair]** Trigger `mint-artifact.yml` with `release_tag: v0.9.0`.
10. **[release-repair 2]** Merge the descriptor PR — **this review IS the release
    decision**: fingerprint diff table sane; committed JSON byte-identical to the
    CI artifact. **Decide:** schema-6 counsel go/no-go for this release; ratify the
    artifact-identity decoupling.
11. **[release-repair]** Push `git tag v0.9.0` (npm publish is effectively
    irreversible); glance at the smoke job — green means a stranger's laptop can
    consume the release today.
12. **[governance G1]** Merge packet tool + policy (check: the policy says what he
    believes about who may sign; exactly one allowlist path; mispairings fail
    closed; the golden packet is the evidence he'd want a reviewer to see).
13. **[governance G2]** **Decide:** designate the independent reviewer for the
    baseline re-review; then merge (check: named identity + attestation; digests
    match; the evidence doc reads as genuine scrutiny). **Decide:** accept or act
    on the reviewer's verdict.
14. **[governance G3]** Slow-read and merge the amended one-click doc — the plan
    now ends at a draft PR he merges by hand; widening automation authority is
    recorded as his decision alone.

Phase 1
15. **[eval-toughening A]** Merge the ordered-snapshot PR; **sign the
    ordering-snapshot approval** — the act of approving today's orderings as the
    reference.
16. **[eval-toughening B]** Merge rank-aware fixtures — curation judgment: does
    every tightened #1/#3 and order pair match what a worship leader should see?
17. **[lexicon-concepts 1]** Merge the peace fix. **Decide:** the surviving anchor
    weight and interim chip attribution. **Sign the G8 approval.**
18. **[lexicon-concepts 2]** Merge the bare-word inventory — skim all 58 rows'
    skipped-reasons (they encode his prior rulings). **Decide:** the `love` row.
    **Sign the G8 approval.**
19. **[ranking-fixes 1]** Ratify (or veto) the six ordering opinions in the pending
    fixtures — cheaper to argue here than after the engine PR.
20. **[ranking-fixes 2]** Review the bump PR: merged 1 Pet 5:7 weight (**decide**
    0.85 vs 0.75), the three new reviewed constants, the changelog comment.
    **Author the G8 approval himself** (his push or applied suggestion) against the
    inline probe diffs; **squash-merge**.
21. **[eval-toughening C]** Merge rank metrics + NO_MEASURABLE_EFFECT (check:
    graded gains read as his fixture judgments; `rankQuality` all null; anchors are
    priorProvenance + committed baselines). **Approve the initial
    rank-metrics baseline**; later, the follow-up thresholds data PR.
22. **[lexicon-concepts 3]** Merge the comfort pair — check the theology.
    **Decide:** does "holy spirit" belong on the Comforter concept for now?
    **Sign the G8 approval.**
23. **[lexicon-concepts 4]** Merge baptism/new-creation/cornerstone/doubt — check
    each pack (baptism states, never adjudicates; doubt's tone matches how LH
    pastors it). **Sign the G8 approval.**
24. **[pericope-grouping 1]** Upload the pinned `bible-section-counts.txt` to the
    source-snapshots Release; merge PR 1 (check: license wording — counts, never
    heading text). **Decide:** ratify or adjust the 10-of-20 threshold; spot-check
    ~20 derived pericopes against his print Bibles.
25. **[pericope-grouping 2]** Merge PR 2. **Decide:** the §5 consumer-contract
    shape (`verses[]` + typed `grouping`) and the attribution-paragraph scope.
    Check the measured-effect attribution line and the G8 diff (the churn IS the
    feature). **Sign the G8 approval.**
26. **[spelling-aliases 1]** Merge spelling (check: edit-policy table, tie-break,
    never-rewrite-known-words invariant, chip cites the typed word, size budgets,
    `corrections` vs §5; G8 churn 0).
27. **[spelling-aliases 2]** Merge aliases — read the pack line by line.
    **Decide:** the Hymnary permission email; title-only comfort for copyrighted
    hymns (or strike to PD-only); ambiguous concept targets.
28. **[eval-toughening D]** Merge real G6 (check: gate summary states seed/numRuns;
    fast-check dev-only).
29. **[eval-toughening E]** Merge the mutation harness — skim that each alarm
    provably rings.

Phase 2
30. **[consumable 1]** Merge CHANGELOG formalization + guard (check: 0.8.0 entry
    reads as he'd explain it). **Decide:** non-triggering history tags or
    CHANGELOG-only (default).
31. **[consumable 2]** Merge the API tier. **Decide:** the stable/internal split
    (reference parsing stable; tokenizer internal) and the 1.0.0 removal promise;
    read the error-semantics table as the promise to Maskil it is.
32. **[consumable 3]** Merge CONSUMERS.md + artifact-client + quickstart (check:
    crisis-card requirement moved, not softened; attribution strings right).
    **Decide:** the deprecation-policy numbers; second-package trusted publishing
    now or later; **commission the counsel pass** on `verse_translation_tokens` —
    nobody else can engage counsel.
33. **[release cadence]** Trigger the mint for the Phase-1 terminus; merge the
    descriptor PR (fingerprint table: engine 0.13.0, schema 8, new layer
    fingerprint); push **tag v0.13.0**; glance at the smoke job.
34. **[eval-toughening F]** Merge the conformance kit (§5 addition + descriptor
    sqlite fields). **Decide:** when Maskil / LH Worship Setlist / Versed adopt the
    runner, and coordinate that rollout.
35. **[spelling-aliases 3]** (repeatable) Merge alias-pack expansions as they earn
    their fixtures — `NO MEASURABLE EFFECT` means don't merge.
