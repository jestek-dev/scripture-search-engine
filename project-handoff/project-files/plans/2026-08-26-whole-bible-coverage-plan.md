# Whole-Bible Coverage Plan — word search, alternate wording, and the full-library tag sweep

**Date:** 2026-08-26 · **For:** Jesse (jestek-dev) · **Repo state verified against:** `origin/main` @ `e762d1c` (PR #53 re-pin merge), 239 concept packs on main, engine 0.14.0, baselines identity `(0.14.0, 644b241c…, b24ea16d…)` (`eval/baselines/ordering.snapshot.json:1-4`).

This plan answers Jesse's three asks: (1) the whole Bible ingested so every verse is word-searchable even with no tags; (2) matching fuzzy enough that NIV/ESV/KJV-flavored wording still finds the WEB text; (3) a systematic sweep of the whole Bible against the full tag library, including tags considered but not applied. Full-Bible corpus ingestion is **work the corpus-expansion thread has REPORTED as in progress** (its 2026-08-26 16:08Z scope message: a worker building the payload; PR not yet pushed or opened). That is a relayed claim, not an observed artifact — verified 2026-08-26 16:32Z: the thread's branch tip (`claude/hearth-161-concept-packs-2tf8jk`) equals main's HEAD `e762d1c` (`git ls-remote`), no expansion commits exist on any remote branch, and the critic-review GitHub check found zero open PRs. This plan documents that work's mechanics and implications and plans the rest; nothing below sequences on an observed PR.

---

## 0. Feasibility verdict (plain language)

**Yes — all three layers are feasible, and two of them are further along than the ask assumes.** (1) Every-verse word search is *already built and working*: the full artifact contains all 31,098 WEB verses, fully word-indexed (`artifacts/content-artifact.json` — `"verses": 31098`, 66 books; note that descriptor is marked stale/blocksRelease, §1.1); what the corpus-expansion work (reported in progress by its owning thread; no PR observed yet, §1) adds is the *measurement* side — today the test corpus that gates every change covers only 5,726 verses across 215 chapters (213 whole chapters plus two single verses), so nothing outside those verses can be asserted, admitted, or guarded. Once that work lands, any verse anywhere can carry fixtures and tags. (2) Alternate-translation wording is *mostly built*: a cross-translation index already maps KJV/ESV/NIV/NLT vocabulary onto 30,817 verses deterministically, plus deterministic spelling correction and archaic-word folding; what remains is targeted mining of famous phrasings and public-domain vocabulary, every candidate validated by a fixture — no runtime AI, no runtime fuzziness beyond what is already reviewed. (3) The verse-by-verse sweep is feasible as a specified multi-thread pipeline: section/chapter-level first (recommended), against the full 239-concept library plus the reviewed declines, feeding the engine only through the existing fixtures-first gauntlet with Jesse's merges as the only human step. **By end of 2026-08-27**, a popular-verses fixture pack and a first alias batch can realistically be on Jesse's merge queue from this plan's side; whether the expansion payload also lands depends on the owning thread delivering its PR and on the release-ordering call (§6 decision #2 — expansion-first-sign-once vs mint-first-sign-twice). The sweep and the alias-mining program hand off as fully specified pipelines (§5).

---

## 1. Layer 1 — every verse in the engine (owned by the corpus-expansion thread; reported in progress, not yet observable)

This section documents mechanics and implications. It plans no work: the corpus-expansion thread owns full-Bible ingestion (all 66 books from the pinned engwebp VPL WEB source, plus all derived baseline regeneration, intended to ship as one PR per its 16:08Z scope message), and, after it lands, the 50-row corpus-blocked backlog (`/mnt/project-files/research/bible-rollout/engine-pack-backlog.md`). **Status honesty (verified 2026-08-26 16:32Z):** this is a *relayed* claim from that thread — no expansion PR exists on GitHub, and the thread's branch tip equals main's HEAD `e762d1c`, so no expansion commits are observable anywhere yet. Everything below describes what that payload must do when it materializes, drawn from the repo's own dependency records, not from an inspected PR.

### 1.1 The finding that reframes this layer: the shipping artifact is already the whole Bible

There are **two corpora** in this project, and the ask conflates them:

- **The release artifact** (`content.db`) — the full-Bible database the pipeline builds and releases ship. The committed descriptor (`artifacts/content-artifact.json`) records **31,098 verses across all 66 books**, every one word-indexed (`rowCounts.verses: 31098`, `indexedVerses: 31098`), built 2026-07-31. **Disclosure:** that descriptor is marked `stale: { since: 2026-08-08, blocksRelease: true }` — it deliberately blocks any release until a fresh mint — and its `stale.reason` ("Built 2026-07-30 against an 8-concept ontology") contradicts the file's own `counts.concepts: 33` and `builtAt` 2026-07-31; the verse/book counts used as evidence here are the descriptor's own recorded values and are corroborated by the README and the published v0.7.1 asset (also full-Bible, per HANDOFF Known defects #1). The README states the build plainly: "The full artifact builds: 31,098 verses, 117.60 MiB against a 160 MiB budget" (`README.md:195-196`) and reports whole-Bible homiletical coverage of 99.0% (`README.md:47-53`). **On what consumers search:** the only *published* pair any consumer can pin is the full-Bible schema-5 v0.7.1 pair (npm serves nothing newer); each app's *actual* current pin lives in its own repo and "could not be verified from here" (`HANDOFF.md:201`).
- **The fixture corpus** (`pipeline/fixtures/web-subset.json`) — the hermetic per-PR corpus that CI and the gauntlet measure against ("CI still gates against a 5,667-verse fixture, deliberately — a per-PR check must be hermetic and fast", `README.md:202-203`). Verified today: **5,726 verses, 49 books, 215 distinct chapters touched** (213 whole-chapter selections plus two verse-level entries — Song of Solomon 2:1 and 3 John 1:4, per HANDOFF Known defects #2). Reconciliation: the README's "5,667-verse" and `docs/corpus-payload-dependency.md` §6's "211 chapters / 5,667 verses" are both stale pre-#53 counts; the PR #53 regeneration grew the fixture to today's verified 5,726 verses / 213 whole chapters.

So Jesse's literal ask — "if a verse that has no tag has a word in it that's searched for, that would populate" — is **already true in the shipped artifact**. What is *not* true is that such a verse can be measured, fixture-asserted, or concept-anchored: the gauntlet only sees the fixture corpus, which is why 50 concept rows sit corpus-blocked and why guard fixtures on absent chapters pass vacuously (`docs/corpus-payload-dependency.md:33-41`). The expansion payload's real deliverable is closing that measurement gap by growing the fixture corpus to every WEB chapter/verse (~1,189 chapters / ~31.1k verses — the standard WEB shape; exact counts will land in the eventual PR body).

### 1.2 Word-searchability with zero tagging — CONFIRMED, with citations

The claim "once ingested, every verse is word-searchable with no tags" is confirmed by the build and runtime code:

- **Build:** every imported verse is tokenized by the one shared tokenizer and written into `verse_tokens`; `POPULATE_FTS_SQL` inserts *every* non-empty verse into the FTS index and `POPULATE_TOKEN_STATS_SQL` derives per-token document counts from all verses (`pipeline/src/schema.ts:384-396`; `pipeline/src/buildCorpus.ts:13` imports `significantWords`/`tokenStream` from the engine's tokenizer). No concept, tag, or curated row is involved.
- **Runtime:** the lexical ladder (steps 2–4: exact phrase, distinctive tokens with proximity, conservative normalization — `engine/src/intents/lexical.ts:1-9`) retrieves candidates directly from `verses_fts` (`engine/src/corpus/repository.ts:269-275`) and `verse_tokens` with IDF from `token_stats` (`repository.ts:304-339`). Any verse containing a queried token is a candidate, tagged or not.

**One correction to the task's framing:** the "bare-word inventory" that landed via PR #33 is *not* this mechanism. PR #33's inventory (`ontology/lexicon-inventory.yaml`) is a G4-gated acknowledgment record for lexicon phrases that collapse to a single significant token — i.e. it governs when a bare word may trigger a *concept* ("forgive" firing `forgiving-others`), not whether corpus words are searchable. Corpus word search is core Phase-1 machinery and predates PR #33.

### 1.3 What full ingestion changes

- **corpusFingerprint moves; ENGINE_VERSION does not.** The fingerprint is a hash over every stored verse plus the book-alias table (`pipeline/src/buildCorpus.ts:85-110`). Corpus expansion is data: CLAUDE.md #2 requires an ENGINE_VERSION bump only for changes to "weights, caps, tokenizer rules, tie-breaks" — engine code; the corpus moves identity through its own fingerprint. This is written down explicitly: "No `ENGINE_VERSION` bump anywhere in this dependency: the re-pin moves identity through `corpusFingerprint` and the associations through `layerFingerprint`" (`docs/corpus-payload-dependency.md:145-150`), and the master plan's P4.1–P4.15 covenant block repeats it, naming corpusFingerprint for P4.15 (`/mnt/project-files/plans/2026-08-20-implementation-plan.md:368`).
- **Baselines regenerate, and the approvals must be re-signed against the new identity — and the release ordering is a genuine open call.** The G2/G8 approval records bind exact fingerprints (HANDOFF §"Why main CI is red" item (a)); moving corpusFingerprint invalidates them. Two honest orderings exist, and they trade off differently:
  - **(i) Expansion-first, sign once (recommended default).** This is PR #53's own recorded lesson (its body + HANDOFF first-hour step 2): merge the identity-moving PR *first*, then have the independent reviewer sign J39 *once*, against the identity that will actually stand. One signing cycle, least process, least rubber-stamp risk.
  - **(ii) Mint-first (the ordering the expansion thread stated): J39 sign-off + v0.14.0 mint, then the expansion merge.** This buys a stable released v0.14.0 pair before the corpus identity moves — but its real cost must be said out loud: the expansion merge then invalidates the just-signed approvals, forcing a **second full independent-approval cycle** (a third-party reviewer each time, and per HANDOFF "finding the reviewer is the slow part").
  This is a cross-thread ordering call this plan can only flag — the expansion thread stated (ii); the #53 precedent argues (i). Jesse rules: §6 decision #2. (J39 and the v0.14.0 mint remain their own workstreams either way; this plan does not execute them.)
- **Artifact size: no ×5.4 scaling.** The artifact already carries the full Bible: committed descriptor 137,412,608 bytes = 131.05 MiB (schema 6, 33 concepts, includes the 14.1 MB `verse_translation_tokens` table) against the G10 budget of 160 MiB (`eval/budgets.json:52-53`). The published v0.7.1 asset is 123,310,080 B = 117.6 MiB (schema 5, without that table — HANDOFF Known defects #1 reconciles the two byte counts exactly). Growth from 239 concepts and schema v9 will be single-digit MiB (Layer A is "~MBs", `README.md:40`); headroom is comfortable. **What does scale ×5.4 is the fixture corpus and therefore per-PR gauntlet time** — mitigated by the fact that even the *full* 31k-verse artifact builds in well under a minute in CI (PR #53's run: source fetch 19:22:15–19:22:40, build step complete before the 19:23:11 gate failure — HANDOFF, targeted follow-up verification). Expect slower but tolerable CI; the eventual expansion PR body will carry actual numbers.
- **The 50-row corpus-blocked backlog clears.** The roster (49 review rows + `virgin-birth`) was re-verified after PR #53 merged: **all 50 rows still gated** — the re-pin alone expanded nothing; they wait on the expansion payload (`engine-pack-backlog.md`, §"Post-#53 re-verification … ALL 50 ROWS STILL GATED"). Working them afterwards is owned by the expansion thread, fixtures-first through the gauntlet.
- **Consumer-contract ripple (§5).** Maskil, LH Worship Setlist, and Versed pin *both* the engine semver and the artifact descriptor; "a new release changes nothing for any consumer until that consumer deliberately re-pins" (HANDOFF §Consumers; canonical contract at `docs/implementation-plan.md:285`). The three apps re-pin on the release minted after expansion — one jump (schema 5→9+, engine 0.7.1→0.14.0, old corpus fingerprint → post-expansion). No public type changes are involved, so the §5 check is a formality, but the J48 counsel (first public shipment of the ESV/NIV/NLT-derived `verse_translation_tokens` table) and J49 (CC BY passthrough) attach to that same release.
- **The xref catch-up ruling.** PR #53 deliberately excluded the OpenBible cross-reference/passage-terms catch-up regeneration because it measurably moves **8 golden-fixture expectations across 6 fixtures plus 3 eval tests** (PR #53's FINDING; the itemized vote movements — 173 of 1,835 witnessed edges — are in `docs/reviews/2026-08-25-source-repin-delta-reports.md:124-142`). Per `docs/source-repins.md` §5 that is a finding for Jesse, never a quiet fixture edit. The ruling is still **open**; the expansion payload is (per its owning thread's scope message) structured to keep it separable. It is decision #1 in §6.

---

## 2. Layer 2 — alternate wording, deterministically (this plan's work)

### 2.1 What exists today — more than expected

Four reviewed mechanisms already carry "fuzziness" without any runtime AI:

1. **The cross-translation vocabulary index (the big one).** For each verse, the set of word *stems* appearing in KJV, ESV, NIV, or NLT but not in the shipped WEB text — "plans to prosper you" reaches Jeremiah 29:11 even though the WEB reads "thoughts of peace" (`pipeline/scripts/generateTranslationTokens.ts:1-33`). Verified live data: **30,817 verses / 307,923 stems** (`pipeline/fixtures/translation-tokens.json` — `verseCount`, `tokenCount`), i.e. essentially whole-Bible coverage *already*, shipping as the artifact's `verse_translation_tokens` table (14,102,528 B in the descriptor). Rights posture is a derived-index-only record: licensed copies were read once, locally; only unordered deduplicated stems ship (`pipeline/manifests/translation-variants.json`, `licenseRecord`). At runtime this is the `translation_variant` evidence family, deliberately capped: a result whose *only* evidence is translation-variant stems maxes at 6 points, "below any honest text match" (`engine/src/config/engineVersion.ts`, 0.10.0 note) — a bag-of-stems hint can accompany but never hold #1 alone.
2. **The tokenizer's archaic/inflection folding.** KJV-era stopwords, a reviewed archaic-forms table (`doeth→do`, `loveth→love`), irregular lemmas (`doers→do`, `hearkened→hear`), and light suffix stemming (`engine/src/tokenizer/index.ts:17-142`). This is why KJV-flavored queries largely already reach the WEB text.
3. **Deterministic spelling correction (0.12.0).** SymSpell delete-variants over the artifact's whole vocabulary — corpus tokens ∪ book aliases ∪ lexicon tokens ∪ translation tokens ∪ Layer-B terms — verified by bounded integer Damerau distance under one reviewed policy table (<5 chars: never; 5–8: edit 1; ≥9: edit 2), every substitution cited to the user (`engine/src/intents/spelling.ts:1-55`). This is the *only* runtime edit-distance behavior, and it is deterministic by construction.
4. **Curated whole-query aliases (QR-6).** Equality matches on a minimally-normalized whole query (stopwords kept, no stemming — `normalizedPhrase`, `engine/src/tokenizer/index.ts:205-225`) mapping to exactly one concept XOR verse range; never containment, never a bare word (≥2 raw words enforced) (`ontology/aliases/README.md`). Current size: **15 phrase rows**, all PD hymns (`ontology/aliases/hymn-lines.yaml`), each backed by a golden fixture. Plus **1,434 lexicon phrases and 1,599 anchors across the 239 concept packs** (counted from `ontology/concepts/*.yaml`).

**Assessment of runtime fuzzy matching:** none exists beyond the bounded spelling policy, and none is needed. Every cross-translation case decomposes into (a) content-word vocabulary → the translation-token index handles it; (b) stopword-heavy famous lines → the alias table handles it; (c) typos → spelling correction handles it. Adding runtime approximate matching would break covenant #2 for no residual case.

### 2.2 What NOT to do

- **No per-caller tokenizer option, ever.** The module has no options parameter *by design* — "a per-caller tokenizer setting is exactly the bug it prevents" (`engine/src/tokenizer/index.ts:8-13`; CLAUDE.md #4). Cross-translation reachability fixes are lexicon/alias/token-index *data*, never stemmer edits (the P4 covenant block says exactly this: "reachability fixes are lexicon entries, never stemmer edits", plan `:368`).
- **No runtime similarity or loosened edit distances.** The policy table is reviewed data (J31/J35); widening it is an ENGINE_VERSION-bump ordering change, and the suppressive direction of the current rule is deliberate.
- **No containment-matching aliases.** Equality "is the safety property: the less this folds, the less an alias can accidentally swallow" (`engine/src/tokenizer/index.ts:210-215`).

### 2.3 The offline mining program (all offline, all fixture-gated — respects "no AI at runtime")

Priority order, each step measured before merged:

1. **Extend the translation-token index with public-domain translations** — ASV, YLT, Darby, and BSB (the project already treats BSB headings as public-domain build material, `CONVENTIONS.md:56,104-105`; confirm the BSB text dedication as decision #4). Mechanism already exists: `generateTranslationTokens.ts --reps <path>` merges per-verse stems through the shared tokenizer; PD sources need no derived-index laundering but should ship in the same stem-set shape so no source is separable and the table stays one mechanism. Expected yield: modest (KJV already covers the archaic register) — run it, read the G8/G9 report, and drop it if NO MEASURABLE EFFECT. Estimated effort: one thread-day including fixtures.
2. **Famous-phrase alias/lexicon batch seeded from popular-verses.** `/mnt/project-files/research/popular-verses/top-200-verses.md` is a verified, provenance-complete ranking (60 source lists, WEB text byte-verified — 175/200 entries checked against the pinned fixture). For each top-tier entry, enumerate the 1–3 phrasings people actually type (the memorization-program and search-volume sources in `popular-verses/sources/` are exactly this data), test each against the live engine, and add an alias or lexicon row **only where the query measurably fails** — fixture written first, per the QR-6 pattern ("a row with no measured gap is not added", `ontology/aliases/README.md`). Where the remembered phrasing is a modern copyrighted translation's wording, the short-phrase posture already reasoned through for hymn titles (Circular 33; J37) needs Jesse's analogous call — decision #5.
3. **Battery-driven gap mining.** The 84-query battery (`eval/battery/queries.json`, batteryVersion 1) and the 2026-08-20 report's per-category failure patterns (`/mnt/project-files/search-quality-report-2026-08-20.md`) are the measured map of what still misses. Several 2026-08-20 failures are since fixed by the 0.10.0–0.14.0 train (misspelling category → 0.12.0 correction; the "it is well" harmful #1 → QR-6 aliases); a re-grade against post-expansion main is the honest first step before mining more (see §4.1).

**Sizing.** Now: 15 alias rows, 1,434 lexicon phrases, 307,923 translation stems. Realistic end-state after this program: **~100–300 alias rows** (each fixture-backed; hymnal + famous-phrase + liturgical lines), lexicon growth wherever sweep/battery evidence lands, translation stems +10–30% from PD sources (estimate, basis: KJV overlap with ASV/YLT vocabulary is high). Anything beyond that should be demand-driven from consumer query logs (the S-roadmap already plans this, search-quality report §4).

---

## 3. Layer 3 — the whole-Bible tag sweep (this plan's work)

### 3.1 Shape of the sweep

**Recommendation: 8 book-group threads, section/chapter granularity first, per-verse refinement only where a chapter is dense.** Justification:

- The 8-thread book-group split is *proven*: it produced the 66 book docs and the display-tag application pass without collisions (the one observed failure mode — concurrent appends clobbering `tag-gaps.md` — already has a binding survival-audit protocol, `CONVENTIONS.md:139-147`).
- The chapter is the established judgment unit (`CONVENTIONS.md:44`), the density rules are *written for chapters* (soft cap 6, hard ceiling 8, yield order: cross-ref class → theme-witness-with-caveat → thin single-verse → broad-duplicating-specific — §11.6), and engine anchors are verse *ranges* anyway (see `ontology/concepts/gods-love.yaml` — `Romans 8:38-39`, `Ephesians 3:17-19`). Blanket per-verse tagging would collide with the honest-presence bar ("the chapter must depict the concept's teaching substance, not merely touch its topic", `CONVENTIONS.md:73-76`) and CONVENTIONS' own rule to subdivide only where themes genuinely diverge (Genesis: 14 of 50 chapters).
- Per-verse *refinement* is still wanted where sections are dense: when a chapter's honest candidates exceed the ceiling of 8, the §11.6 yield order forces drops — per-verse/section anchoring inside that chapter is how the dropped-at-chapter-level tag survives as an engine anchor with an exact range instead of vanishing. Dense chapters self-identify during the sweep (any chapter that hits the ceiling, plus any chapter already subdivided in its book doc).

### 3.2 Per-pass inputs (each thread receives)

1. **The book's summary doc** (`/mnt/project-files/research/bible-rollout/<book>.md`; Genesis at `research/2026-08-22-genesis-pilot-summaries.md`) — its existing display tags with WEB-quote justifications are prior art, not conclusions to re-derive. (Count check: ~5,281 tag applications appear on `**Tags:**` lines across the 66 docs by mechanical count; the 1,428 figure supplied for this plan is the adopted-vocabulary application pass specifically and could not be independently reproduced here — both are display-only either way.)
2. **The full engine library**: the 239 ids in `ontology/concepts/` at thread start, with each pack's lexicon and anchors visible so the thread proposes *extensions* (new anchor, new lexicon phrase) rather than duplicate concepts.
3. **The "considered but not applied" set**, exactly as Jesse asked: `tag-gaps-review.md` **§3** (recorded declines, folds & not-gaps — §3.1 already-covered list, §3.2 Proverbs' eight declines + three contingencies, §3.3–3.5 withdrawn/withheld/declined rosters) and **§1** (contested calls, as resolved by the §11 rulings). Rule of engagement: a recorded decline is *re-considerable but not silently reversible* — a sweep thread may propose overturning one only with new textual evidence, logged with a pointer to the original decline (decision #3).
4. **The binding rules**: CONVENTIONS §5 (exact ids, in-chapter WEB-quote justification, honest-and-empty preferred over a forced tag) and §11 (presence bar first always; density soft cap 6 / hard ceiling 8; yield order; both-tags ruling; no later-revelation read-backs), plus `docs/DOCTRINAL-BASIS.md` and covenant #6 (no theology scores — the sweep records that a source names a passage, never adjudicates).
5. **The corpus-blocked roster** (`engine-pack-backlog.md`) so threads route findings on those 50 concepts to the expansion thread's queue instead of duplicating them.

### 3.3 How sweep output becomes engine data

The sweep's raw output is display-layer and research material. Engine ingestion follows the only admissible path (CLAUDE.md "Adding data"; `CONVENTIONS.md:182-187` — "Nothing here creates a concept pack"):

1. Each thread emits a per-book ledger: (a) anchor-extension candidates for existing packs (concept id, verse range, WEB-quote evidence, proposed weight), (b) lexicon-extension candidates, (c) new-concept candidates (with 2–3 realistic query phrasings, per `CONVENTIONS.md:85-87`), (d) decline-overturn proposals with evidence.
2. A curation pass converts ledger rows to packs/extensions **golden fixture first** — the query you'd type and what should surface, `expectedTop`/`expectedWithinTop`/`alsoAcceptable`/`mustNotRank` per the founding exemplar (`eval/golden/hearing-and-doing.json`, which carries exactly those fields), with `preferredOrder` available for ordering assertions (schema: `eval/src/gates/corpusGolden.ts:116`; exemplar: `eval/golden/caring-for-aging-parents.json`). 388 fixture files exist today.
3. Every batch runs the gauntlet and is merged only on a read Admission Report. **NO MEASURABLE EFFECT = don't merge** — and with full-corpus word search live, expect *many* sweep candidates to land exactly there, because bare lexical retrieval already serves them. That is the system working, not the sweep failing: the sweep's engine-side value concentrates in (i) queries whose words don't appear in the passage (concept vocabulary), (ii) ordering (the right passage above lexical noise), (iii) guards.
4. **Batch PRs target `main` directly.** Today's lesson is binding: the stacked #55–#59 train mis-targeted stale base branches at merge time and needed recovery PR #60 (`git log`, verbatim: "Land batches 2–6 on main: concept packs 168→239 (recovery of #55–#59) (#60)", squash `6367855`). Batches of ~15–20 packs/extensions per PR (the #54–#59 batch size that worked), each PR body carrying its per-concept decision table, each merge being the admission event.

### 3.4 Throughput math (honest, from measured baselines)

Measured baselines: **96 admissions (86 new ids + 10 extensions) across 162 reviewed rows in one working day, six batches** (`engine-pack-backlog.md` §Summary — the best single-day figure and probably near the ceiling); the 66-book summaries rollout ran 8 threads over the whole Bible; the Genesis pilot did 50 chapters of full summarizing + tagging + critic loop in roughly one thread.

| Pass | Units | Rate basis | Estimate |
|---|---|---|---|
| Chapter/section sweep, full library + declines | 1,189 chapters | Genesis pilot ≈ 50 ch/thread incl. summaries; tags-only re-sweep against a bigger library ≈ 75–125 ch/thread-day | **10–16 thread-days** (8 threads ≈ 1.5–2 days wall-clock) |
| Per-verse refinement, dense chapters only | est. 10–20% of chapters | subset of the above, verse-range anchoring | **3–6 thread-days** |
| Blanket per-verse sweep (not recommended) | ~31,100 verses | ≤2,000 honestly-judged verses/thread-day | **16–40 thread-days**, mostly re-deriving chapter conclusions |
| Engine ingestion of sweep yield | unknown until measured; assume 150–400 fixture-worthy candidates | 96 admissions/thread-day is the measured ceiling; extensions are cheaper than mints | **2–5 thread-days**, gated by Jesse's merge cadence, not by throughput |

The blanket per-verse row is why §3.1 recommends against it: it multiplies cost ~3× over chapter-first + targeted refinement while the honest-presence bar and the range-anchor data model mean it produces little the cheaper pass doesn't.

---

## 4. Strengthening recommendations (prioritized by payoff per unit of work)

1. **Re-grade the 84-query battery against post-expansion main, before mining anything new.** Cost: ~half a thread-day. The 2026-08-20 B- grade predates the 0.10.0–0.14.0 fix train (which specifically targeted its named bugs: exact-phrase drowning, sole-evidence junk #1s, spelling F-category, the "it is well" harmful #1) and 131 concepts the report never saw (it graded config B at 108 concepts; the census is now 239). Everything else in this list should be prioritized off the *fresh* failure list, not the stale one.
2. **Promote the popular-verses top-200 to golden fixtures** (Tiers 1–3 = 103 entries active; Tier 4 sampled). Cost: ~1 thread-day, one PR. Payoff: regression armor over exactly the verses users search most, and the seed set for Layer 2's famous-phrase mining. The dataset is verified and WEB-aligned already. Caveat honestly stated: most will pass immediately, so their value is *guard* value (a future weight change that demotes John 3:16 gets caught) — that is worth one PR, not more.
3. **Alias/lexicon mining from measured failures** (§2.3, items 2–3). Cost: 1–2 thread-days. Payoff: directly closes the "NIV/ESV wording misses" class that remains after the translation-token index — the highest-leverage remaining search-quality work per the battery's own analysis.
4. **The 50-row corpus-blocked backlog** — high payoff (it includes heavy-demand concepts: end-times, stewardship, courage, spiritual-warfare) but **owned by the expansion thread**; this plan only notes it must precede or ride the early sweep batches so sweep threads don't re-derive it.
5. **Section-level sweep before per-verse** (§3) — the payoff argument is §3.4's table.
6. **Xref catch-up regeneration** — do it as its own reviewed PR soon after expansion (decision #1): it is the only way the OpenBible evidence layer tracks its re-pinned source, and the 8 moved expectations are already itemized for review.
7. **De-prioritized: PD translation-token extension** (§2.3 item 1) — run once cheaply, keep only on a measurable admission report; KJV coverage makes NO MEASURABLE EFFECT the likely verdict.
8. **Rejected for now: any runtime fuzzy-matching work** — §2.1's assessment: the residual gap class is data, not matching. Also rejected: adopting the raw per-verse sweep as the default granularity (§3.4), and any display-tag→engine bulk import that skips fixtures (structurally forbidden — a pack with no fixtures is rejected, CLAUDE.md "Adding data").

---

## 5. Now vs. handoff

### 5.1 Can realistically merge by end of 2026-08-27 (Jesse's role: review + merge + named rulings)

This plan's own deliverables first (they depend on nothing external):

1. **Popular-verses golden-fixture PR** (§4.2) — this plan's work; one PR targeting main.
2. **First alias/lexicon batch from measured gaps** (§4.3, seeded from whatever the battery re-grade of §4.1 finds) — one PR targeting main; only rows with fixtures and measurable effect.
3. **The sweep pipeline spec** — is §5.2; no merge needed.

Items owned elsewhere, listed for sequencing honesty — neither is a promise this plan can make for end of 08-27:

4. **The corpus-expansion PR** — *reported* in progress by its owning thread; not yet pushed or opened as of 2026-08-26 16:32Z (§1). If it materializes in time, Jesse's inputs are the merge itself plus the xref catch-up ruling (#1 below) kept separable.
5. **J39 sign-off + v0.14.0 mint** — **EXTERNALLY GATED**: J39 requires an *independent third-party reviewer* who did not author the change (`docs/governance/probe-baseline-review.md`; no standing reviewer role exists, and HANDOFF notes finding one is the slow part). Not something Jesse alone can deliver by end of 08-27; whether it runs before or after the expansion merge is §6 decision #2 (§1.3's two orderings).

### 5.2 The handoff pipeline (executable by future threads without re-derivation)

**Thread prompt template (one per book group, 8 groups as in the summaries rollout):**

> Sweep <book group> chapter by chapter against the full engine concept library and the reviewed declines. Repo `scripture-search-engine` @ main (record your SHA). Inputs: (1) `/mnt/project-files/research/bible-rollout/<book>.md` per book — existing tags are prior art; (2) all ids in `ontology/concepts/` at your start, with lexicons and anchors; (3) `tag-gaps-review.md` §3 declines and §1 contested calls — re-considerable only with new textual evidence, cited; (4) `engine-pack-backlog.md`'s corpus-blocked roster — route, don't duplicate. Rules: CONVENTIONS §5 + §11 verbatim (presence bar first; soft cap 6 / hard ceiling 8; yield order; honest-and-empty preferred; no later-revelation read-backs; WEB quotes only). For each chapter emit: applied-tag deltas (add/keep/drop with justification), anchor-extension candidates (id, verse range, quote, weight), lexicon candidates (with 2–3 realistic query phrasings), new-concept candidates, decline-overturn proposals. Mark chapters that hit the ceiling or are subdivided in the book doc for the per-verse refinement pass. Output: one ledger file per book, atomic appends only, survival-audit per CONVENTIONS §9.

**Curation/ingestion loop (per batch of ~15–20 candidates):** write golden fixtures first (`eval/golden/`, schema per existing fixtures; every new concept must have a covering fixture or G3 fails the build) → build packs/extensions in `ontology/concepts/` → `npm run verify` locally; the gauntlet is `npm run gauntlet`, machine evidence via `npm run gauntlet:report` (`README.md:119-124,163`) → read the Admission Report; **NO MEASURABLE EFFECT = don't merge; a REJECT names its gate and rows** → PR **targeting `main`** (never a stacked base — the #55–#59/#60 lesson), body carrying the per-concept decision table and the standing-down triage for any pre-existing CI red → Jesse merges; the merge is the admission event. Baseline-moving batches follow the `--update-baseline` + independent v2 approval discipline (`docs/governance/probe-baseline-review.md`).

**Alias-mining loop:** per §2.3 — candidate phrasing → run against live engine → measured miss? → fixture → alias/lexicon row (equality, ≥2 raw words, XOR target, provenance per row) → gauntlet → PR. Never add a row for a query that already lands.

**Standing constraints for every future thread:** no engine code, no tokenizer edits, no weight changes (any of those is an ENGINE_VERSION-bump PR of a different kind); no theology adjudication in gists or labels; every number in a PR body is one the gauntlet printed.

---

## 6. Jesse's decision list (one line each, with recommended defaults)

1. **Xref catch-up ruling (OPEN):** accept the catch-up regeneration as its own reviewed follow-up PR after expansion, reviewing the 8 moved expectations (6 fixtures + 3 eval tests) fixture-by-fixture? — *Default: yes, separate PR, soon after expansion.*
2. **Release ordering vs corpus expansion (cross-thread call, §1.3):** merge the expansion first and have the independent reviewer sign J39 once against the final identity (PR #53's own lesson), or mint v0.14.0 first and accept a second full independent-approval cycle after the expansion moves the fingerprints? — *Default: expansion-first, sign once — unless you specifically want a stable v0.14.0 release minted before the corpus identity moves. (The expansion thread stated the mint-first ordering; this plan flags the conflict rather than deciding it.)*
3. **Decline-overturn rule:** a recorded decline may be overturned only with new textual evidence, logged against the original decline? — *Default: yes.*
4. **PD alias/vocabulary sources:** approve ASV/YLT/Darby/BSB as offline mining sources (BSB's public-domain dedication to be confirmed in the PR's G1 manifest — CONVENTIONS already treats BSB headings as PD)? — *Default: yes, G1 does the verifying.*
5. **Modern-translation famous phrases:** may short remembered phrasings from ESV/NIV/NLT become alias rows under the same short-phrase posture as hymn titles (Circular 33; the J37 analog), or PD-wording only? — *Default: PD-only until you rule, mirroring the hymn pack's posture.*
6. **Sweep authority:** sweep threads may mint new-concept candidates directly through fixtures+gauntlet (per-PR decision tables, your merge as admission), no pre-review stage? — *Default: yes — it is exactly how the 161-concept rollout worked.*
7. **Standing backlog rulings that gate sweep batches** (already flagged in `engine-pack-backlog.md` §"Items flagged for Jesse's decision"): end-times vs day-of-the-lord merge; exile-and-captivity routing; election-and-predestination §4-neutral gist read; shepherd-psalm-guard activation. — *Defaults recorded per item in that file.*
8. *(Pre-existing, listed for sequencing only:)* J39 reviewer sign-off; J47/J48/J51 at the v0.14.0 mint; J54 (the expansion merge itself is this approval).

**Claude-decidable defaults (not decisions — listed so nothing looks silently assumed):** sweep granularity (section/chapter-first with per-verse refinement) is settled by CONVENTIONS §4's chapter-unit rule plus §11's caps and yield order, not by a new ruling; sweep vocabulary scope (all 239 ids + §3 declines + §1 contested calls) likewise follows from §11's adopted-vocabulary addendum and §3's own purpose; and the popular-verses fixture promotion needs no standing ruling — it is discharged by the ordinary fixtures-first PR flow, where the merge IS the ruling.

---

## 7. Discrepancy log (repo vs. the numbers this plan was handed)

1. **"Whole Bible ingested" is already true of the full-build artifact** (31,098 verses, `artifacts/content-artifact.json`; `README.md:195`) — the reported expansion work is of the *fixture corpus* that gates measurement (5,726 verses, `pipeline/fixtures/web-subset.json`). The task's ×5.4 artifact-size scaling therefore does not apply to the artifact; it applies to the fixture corpus and CI time (§1.3).
1a. **No expansion PR is observable.** The supplied state described the expansion as in-flight; verified 2026-08-26 16:32Z, the thread's branch tip equals main's `e762d1c` (`git ls-remote`), no expansion commits exist on any remote branch, and the critic-review GitHub check found zero open PRs — the expansion exists only as that thread's 16:08Z scope report. The plan treats it as a relayed claim throughout (§1).
1b. **The committed descriptor is internally contradictory and stale-blocked.** `artifacts/content-artifact.json` carries `stale: { since: 2026-08-08, blocksRelease: true }`, and its `stale.reason` says "Built 2026-07-30 against an 8-concept ontology" while the same file records `counts.concepts: 33` and `builtAt` 2026-07-31. The stale marker is deliberate (it blocks release until re-mint, HANDOFF Known defects #1); its reason text is simply wrong about the concept count and date. Disclosed wherever the descriptor is used as evidence (§0, §1.1).
2. **Fixture-corpus chapters: 215 distinct chapters touched** by my count (5,726 verses, 49 books), vs. the supplied 213 — the delta is the two verse-level entries (SoS 2:1, 3 John 1:4); "213" counts whole-chapter selections. Verse count 5,726 confirmed exactly.
3. **"Bare-word inventory (PR #33)" is not the word-search mechanism** — it is the G4 acknowledgment record for single-token lexicon collapses (`ontology/lexicon-inventory.yaml`). Word search is core corpus machinery (§1.2).
4. **Display-tag count:** ~5,281 tag applications counted mechanically across the 66 book docs; the supplied 1,428 (plus 709 skips) matches no count reproducible here and is read as the adopted-vocabulary application pass specifically.
5. **P4.15/PR-β is not in the repo's `docs/implementation-plan.md`** — it lives in `/mnt/project-files/plans/2026-08-20-implementation-plan.md` and the repo's `docs/corpus-payload-dependency.md`; the repo plan's §5 is the consumer contract as stated.
6. **README staleness, minor:** `README.md` still says "33 curated concepts" / "15 verses have profiles" in its Status section and 117.60 MiB for the artifact — the tree is at 239 concepts and the committed descriptor says 131.05 MiB (the 117.6 figure matches the *published* v0.7.1 asset without `verse_translation_tokens`). Trust the descriptor and the file census.
6a. **Stale fixture-corpus counts in two docs:** `README.md:202`'s "5,667-verse fixture" and `docs/corpus-payload-dependency.md` §6's "211 distinct chapters, 5,667 verses" are both pre-#53 counts; the PR #53 regeneration grew the fixture to the verified 5,726 verses / 213 whole chapters (215 chapters touched). Reconciled in §1.1.
7. All other supplied numbers verified exactly: 239 packs, engine 0.14.0, fingerprints `644b241c…`/`b24ea16d…`, 50-row roster (all still gated post-#53), 96 admissions/162 rows/6 batches, 84-query battery, top-200 dataset, merges `6367855` (#60) and `e762d1c` (#53), the #55–#59 mis-target lesson.

---

## Addendum — 2026-08-26 16:47Z: expansion thread's measured numbers (supersede §1's estimates where they differ)

*Post-approval reported data. Everything below is relayed from the corpus-expansion thread's 16:47Z cross-session message and has not been independently re-verified by this plan's author. The §1/§5/§6 text above is unmodified from the critic-approved revision; where the measured numbers below differ from §1's estimates, the measured numbers supersede.*

As of 16:47Z, still **no PR opened** — the built state has been pushed to branch `claude/hearth-161-concept-packs-2tf8jk` as commit `de0fa84` for durability (superseding §7 item 1a's "no expansion commits observable", which was accurate at its 16:32Z verification time).

**Corpus and identity (measured):**
- Fixture corpus: **213 → 1,189 chapters / 5,726 → 31,098 verses**.
- `corpusFingerprint` `644b241c…` → `6450b7d7…`; `layerFingerprint` `b24ea16d…` → `b2c1fc84…`.
- **No ENGINE_VERSION bump** — as §1 predicted (corpus and layer identities move; engine code does not).

**Sizes and performance (measured):**
- Committed `web-subset.json`: **1.37 → 7.68 MB**.
- CI-built `fixture.db`: **27.2 → 70.4 MB** (9.0s build).
- G11 p95 latency: **40.3ms** of the 150ms budget on the full bed.

**Coverage effects (measured):**
- **+441 dormant curated anchors activate** (1,158 → 1,599).
- Translation tokens: **53,160 → 307,923**.

**Separability PROVEN:** openbible rows/edges byte-identical (23 / 1,835), xref-suppression tests 7/7 green — the xref catch-up regeneration is mechanically independent of the expansion.

**NEW BLOCKER, reshaping §6 decision #1:** G3 fails with **28 active golden-expectation moves across 16 fixtures** — all displacement/reason-label; **zero** mustNotRank or pastoral breaches; 5 of the moves sit on 3 fixtures already inside the pending xref catch-up ruling. The expansion therefore needs a **fixture-adjudication ruling from Jesse before its PR can open**. The expansion thread's proposal: **one combined adjudication session over the union** (catch-up 8 + expansion 28, fixture overlap 3), via a ruling packet with a recommended disposition per row, to land at `/mnt/project-files/research/bible-rollout/corpus-expansion-ruling-packet.md`. §6 decision #1 is thereby effectively widened from "xref catch-up as its own PR?" to "adjudicate the combined 33-row union in one pass?". The J39/mint ordering question (§6 decision #2) is presented neutrally in that packet's secondary-calls section.
