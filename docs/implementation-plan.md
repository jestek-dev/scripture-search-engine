# Shared deterministic Scripture engine — implementation plan

**Date:** 2026-07-29 · **Last reconciled against the code:** 2026-07-30
**Status:** Phases 0–4 complete. Layer B covers **99.0% of the Bible** from seven
expositors. The full artifact builds and is descriptor-pinned. All five consumer
API methods ship at ENGINE_VERSION 0.7.1, published to npm with SLSA
provenance. Phase 5 is unblocked but not started.
**Consumers:** Maskil, LH Worship Setlist, Versed (and future LH projects)
**Companion:** `docs/architecture.md` (rationale) · `docs/NEEDS-JESSE.md` (open calls)

> **Reading note.** Sections marked *as built* describe what exists and has been
> measured. Where the build departed from the original design, the departure and
> its reason are stated rather than edited out — the reasons are the useful part.

**Decisions already made (Jesse, 2026-07-29):**
- AI may assist *building* datasets (offline, human-admitted). No onboard/runtime AI, ever.
- The engine lives in its own repository that the apps pull from.
- Zero paid infrastructure: GitHub repo + Actions + Releases. No server component exists.
- The system must carry **pre-baked guardrails**: automated admission gates that
  decide whether a data addition helps, does nothing, or harms — so no one has
  to judge that from outside.

---

## 1. What each project contributes (synthesis inventory)

| From | Take | Why it wins |
|---|---|---|
| **Maskil** `content-pipeline/` | Manifest-pinned sources w/ SHA-256 + license record; schema-versioned SQLite artifact; triple identity (database SHA-256, manifest fingerprint, corpus fingerprint); fail-closed distribution tiers; runtime admission checks; FTS5 external-content index; canonical `BBCCCVVV` verse IDs; DB-owned book aliases | The strongest supply-chain discipline of the three — becomes the engine's foundation as-is |
| **Maskil** `app/src/scripture/` | Reference parser (ranges, dashes, single-chapter books, typed invalid errors); `ContentQueryPort` seam; exact-phrase FTS with quoting/caps; repository shape | Pure, tested, portable today |
| **Maskil plans** (2026-07-20/25) | Intent ladder (reference → phrase → tokens/proximity → normalization → curated expansion → fallback); ranking rules (weak-signal caps, votes-as-prior, stable-ID tie-break, diversify-after-protecting-exact); dataset admission policy; golden-corpus gates on *ordering and explanations* | The design contract the engine implements |
| **Setlist** `src/lib/reco/engine.ts` | Pure scoring core with injected pre-extracted inputs (no DB/bible imports → fully unit-testable); typed `RecoReason { kind, label, tone, points }` exposing *score components*, not just labels; caption synthesis | The runtime shape: engine core is pure, orchestrator does I/O |
| **Setlist** `src/lib/bible/keywords.ts` | Significant-word extraction: KJV-ism stopword list, light suffix stemming with stem-length floor, dedupe-preserving-order | Seed for the engine's shared tokenizer (one tokenizer for corpus and queries — required for determinism) |
| **Setlist** `src/lib/enrichment/` | Proposal-token pattern: enrichment is *proposed*, then explicitly admitted | Generalizes into the concept-pack PR flow |
| **Versed heritage** (desktop-era engine plan) | Multi-intent ranked search with match reasons and context view; the theme/topic ambition | The north star this plan finally builds |
| **Versed (app)** | Consumer needing passage lookup + topical discovery ("verses about ___" → memorization packs) | Proves the engine API isn't Maskil-shaped |

New in this plan: the concept ontology, the homiletical evidence graph, and the
**admission gauntlet** (guardrails).

## 2. Repository — *as built*

Repo name: **`scripture-search-engine`** (private). Package: `@jestek-dev/scripture-engine`.
Both are still open questions — see `NEEDS-JESSE.md` §1.2.

```
scripture-search-engine/
├── ontology/concepts/        # Layer A: 8 concept packs (YAML), PR-reviewed like code
├── pipeline/                 # build-time only; never ships
│   ├── manifests/            # 10 pinned sources: URL, SHA-256, license, lineage
│   ├── importers/            # openbible, verse arrays, ontology, expositions
│   ├── stats/passageTerms.ts # PMI profiles + corroboration (see §3)
│   ├── importers/swordZcomImporter.ts  # verse-keyed commentary modules
│   ├── versification/kjv.ts  # GENERATED table the module mapping depends on
│   ├── expositionSources.ts  # declarative commentator registry — adding one is a data change
│   ├── schema.ts             # artifact schema (v4) + fingerprints
│   └── fixtures/             # committed subsets that make CI hermetic
├── engine/src/               # Layer C: pure TS, zero I/O, published package
│   ├── tokenizer/            # ONE shared tokenizer, separately versioned
│   ├── intents/              # lexical.ts, concept.ts
│   ├── ranking/              # rank.ts + budgets.ts (caps enforced here)
│   ├── reasons/              # typed reason objects w/ points + provenance
│   └── config/               # ENGINE_VERSION + TOKENIZER_VERSION
├── artifacts/                # reviewed release descriptor (content-artifact.json)
├── eval/                     # the guardrail suite (see §4)
│   ├── src/gates/            # collision, golden, corpusGolden, probes, layerB
│   ├── src/gauntlet.ts       # runs all eleven; src/report.ts renders the verdict
│   ├── golden/ · probes/ · baselines/
│   └── budgets.json          # reviewed thresholds (data, not code)
└── .claude/skills/concept-curation/
```

**Not yet built, and named here so their absence is visible:**
- `ontology/lexicon-normalization/` — archaic-form folding lives inside the
  tokenizer instead. Fine for now; revisit if the table outgrows code.
- `pipeline/align/` — alignment never needed its own tier system. Both admitted
  commentators are passage-keyed, so alignment is a lookup. Citation-mining
  tiers stay unbuilt until a source requires them.

**Deliverables per release, both free:**
1. `@jestek-dev/scripture-engine` — pure TS package (npm or git tag), semver.
2. `content.db` + descriptor — GitHub Release asset. **Measured: 117.60 MiB**
   against a 160 MiB budget, with per-table budgets enforced inside it.

Reproducibility contract: `(engineVersion, corpusFingerprint, layerFingerprint,
query) → identical ordering` on every platform, in every consuming app. This is
a CI-enforced gate, not a promise. See §3.3 for why there are three identities.

## 3. Engine architecture — *as built*

- **Layer B sources — seven expositors.** Adam Clarke, Matthew Henry, Keil &
  Delitzsch (OT), Albert Barnes (NT) and JFB come from SWORD `zcom` modules,
  which are *verse-keyed by construction* — no OCR, no alignment inference.
  Spurgeon's *Treasury of David* and Maclaren remain on Psalms from OCR. Adding
  a commentator is a manifest plus a registry line.
- **Layer A — concept ontology:** concepts with modern labels, lexicons, scripture
  anchors, related-concept edges; every entry provenance-tagged (`editorial`,
  `openbible`, `source:<id>`); human-admitted via PR. **8 concepts today**, all
  reviewed and approved by Jesse. Nave and Torrey are researched but *not yet
  imported* — the current spine is editorial plus OpenBible topical votes.
- **Layer B — homiletical evidence:** build-time distillation of PD commentaries
  into `verse_terms` and full per-term provenance. Source prose never ships.
- **Layer C — runtime:** intent ladder over SQLite; pure scoring core; typed
  reasons carrying score components and provenance; deterministic ordering.
- **AI-at-build policy:** unchanged and holding. AI may draft ontology entries and
  normalization tables; nothing AI-drafted reaches the artifact without passing
  the gauntlet *and* human PR merge. The runtime is statistics + lookups only.

### 3.1 Granularity: verse-level corroboration replaced the pericope table

**The original design** gave Layer B a reviewed pericope table and keyed term
profiles to passage ranges. **That design was built, measured, and discarded.**

It failed on contact with a second author. Maclaren treats Psalm 23:1–6 as one
essay; Spurgeon's *Treasury of David* goes verse by verse. With exact-range keys
the two most famous expositors of that psalm *never agreed about anything*, and
Psalm 23 — the single most-preached passage in the Psalter — got no profile at all.
Choosing canonical boundaries by hand for the whole Bible would have been a large,
permanent, and constantly-contested curation burden to fix a problem that didn't
need to exist.

**What replaced it** (Jesse's direction: *verse-specific unless a group of verses
is deliberately attached to a thought*) is three levels, each doing one job:

1. **Authors keep their natural spans.** No canonical pericope table, no hand-drawn
   chunk boundaries. An author's own span *is* their claim about scope.
2. **Agreement resolves at the verse.** Every span projects onto the verses it
   covers; a term is admitted for verse *v* only when enough independent sources
   covering *v* used it. This is the mechanism the exact-span keys blocked.
3. **Deliberate thought-units are Layer A's job.** A chunk genuinely attached to a
   thought (the Sermon on the Mount's anger section) is curated on purpose with
   provenance — never inferred from statistics.

Specificity is **scored, not assumed**: each admitted term records its narrowest
attesting span (`min_span_verses`), and evidence strength discounts diffuse
commentary. A word from a one-verse note outweighs the same word inherited from a
whole-psalm essay, without the essay being thrown away.

Schema v4: `verse_terms` replaces `passage_terms`. `ENGINE_VERSION` 0.6.0.

### 3.2 Corroboration is what separates theology from idiolect

The more important discovery, and it is not in the original plan at all.

A PMI floor against corpus background — the plan's entire G5 — is **not sufficient**.
With one author, the highest-PMI terms for a passage were `gorg`, `mellow`,
`friction`, `polish`, `troth`, `dawson`: Maclaren's Victorian rhetorical habits.
That is not a tuning failure. It is what PMI *should* do with a single-author
corpus, because those words genuinely are distinctive of that author's prose.

Requiring **`minSources: 2`** — corroboration across independent expositors — is
now a build-time admission rule, and it changes profiles in kind, not degree:

| | Psalm 91:4 profile |
|---|---|
| Maclaren alone | gorg, mellow, friction, polish, troth, dawson |
| 2+ authors required | feather, wing, protection, buckler, shield, refuge |

The second row is what Psalm 91:4 actually says. Cost: 1,106 terms instead of
36,922 — the right trade.

A bug found on the way is worth recording, because it was invisible and would have
silently invalidated the metric: per-term attribution was recording the sources of
the *pericope*, not of the *term*, so a word used by one author on a passage two
authors covered looked co-attested. The hypothesis rested entirely on that count.
Per-term source sets are now tracked properly.

### 3.3 The reproducibility contract has three identities, not two

```
(engineVersion, corpusFingerprint, layerFingerprint, query) → identical ordering
```

`layerFingerprint` was added because results can change for three independent
reasons — engine code, scripture text, and the curated layers — and before it
existed, editing one concept altered rankings while every published identity
stayed the same. The contract was quietly false. `TOKENIZER_VERSION` is versioned
separately again, because a tokenizer change invalidates precomputed term profiles:
the artifact stamps it and the engine refuses a mismatch.

## 4. The admission gauntlet — pre-baked guardrails

Every change that can affect results — new source, concept pack, weight change,
pruning-threshold change — is a PR. CI rebuilds the artifact and runs eleven
gates, then posts one **Admission Report** with a verdict:

> **ADMIT** · **ADMIT WITH WARNINGS** · **REJECT (named gate, named rows)** ·
> **NO MEASURABLE EFFECT** (nothing failed, nothing improved — don't merge noise)

The report is the answer to "I wouldn't know from the outside if something I'm
adding is harmful." You read a verdict, not a dataset.

### Gates that protect correctness

**G1 · Provenance (fail-closed).** Every row in the artifact must trace to a
manifest entry with checksum + license + retrieval record. Unknown provenance
is a build error, not a warning. (Maskil's model, now mandatory for every table.)

*Strengthened 2026-07-29.* The gate originally checked only that a manifest
existed carrying a checksum — and passed a manifest whose `sourceUrl` was a
landing page, so its checksum identified a file nobody could retrieve. A
corpus you cannot re-fetch is a corpus you cannot verify, and a checksum with
nothing on the other end of it reads as provenance while providing none. G1 now
requires every pinned checksum to name a retrievable file. **G1b** additionally
verifies that those URLs still resolve; it is opt-in (`--check-sources`) and
warns rather than blocks, because a third party being down is not a reason to
fail someone's PR.

**G2 · Determinism.** The full eval suite runs twice, and on two OS runners;
orderings must be byte-identical. Any intentional ordering change requires an
engine or artifact version bump in the same PR, or the gate fails.

**G3 · Golden regression.** No existing fixture may lose its expected ordering
or its expected *reason* (a result that stays top-3 but for the wrong reason is
a failure — explanations are part of the contract). New concept packs must ship
new fixtures; a pack with no fixtures is rejected structurally.

### Gates that answer "is this too much?"

**G4 · Collision.** A new concept's lexicon is checked for overlap against every
existing concept's lexicon (shared phrases, shared stemmed tokens above a
threshold). Overlap ⇒ REJECT with a merge/differentiate suggestion naming the
colliding concept. This is the near-duplicate-concept protection — the single
most likely way a well-meaning addition degrades the system.

**G5 · Distinctiveness floor + corroboration.** `verse_terms` admits a term only if
it clears a PMI threshold vs. the whole-corpus background **and** is attested by
≥2 independent sources covering that verse (§3.2), hard-capped at N terms per
*verse*. Generic vocabulary ("god", "lord", "love" as bare tokens) can never enter
a profile no matter how many works repeat it; single-author idiolect can't either.
Currently rejecting 99.5% of candidate terms. Thresholds live in
`eval/budgets.json` and are themselves change-gated.

**G6 · Signal budget (structural, not advisory).** The ranking config assigns
every signal family a hard per-result contribution cap and an aggregate
weak-signal cap (per the 2026-07-20 rules). Because caps are enforced in the
scoring core, an admitted dataset *cannot* dominate ranking even if it is huge.
Adding data changes which candidates appear — never how loud a signal class is
allowed to be. This is the deepest guardrail: harm from over-addition is bounded
by construction, and the gauntlet only has to catch precision erosion within
those bounds.

**G7 · Correlation.** Manifests declare derivation lineage (OpenBible ← TSK;
sermon co-citations overlap both; Torrey overlaps Nave). Correlated families
share one budget; identical edges collapse to the strongest with merged
provenance — never summed as independent evidence.

**G8 · Noise probes (the mush detector).** A fixed probe set — broad queries
("love", "grace", "worship"), medium ("refuge in trouble"), narrow ("hearing
and doing"), and adversarial near-misses — is scored on every build and compared
to the previous artifact:
- top-10 churn per probe (how much the list changed);
- mean distinctiveness of top-10 (are results still *specifically* relevant?);
- reason-mix entropy (did weak signals crowd out exact/anchor evidence?).
Thresholds in `budgets.json`; exceeding them fails the build with the offending
probes named. This catches the "everything returns everything" failure mode
before any human sees it.

**G9 · Saturation (the diminishing-returns detector).** During ingestion, if a
pericope already has ≥ K aligned works and a new work changes its term profile
by < ε, the work is recorded as *saturated for that passage* and skipped — the
pipeline literally refuses to ingest redundancy. The Admission Report shows
marginal gain per source ("sermon batch: 41 passages improved, 210 saturated"),
so you can *see* returns diminishing and stop feeding a vein that's mined out.

### Gates that protect the product

**G10 · Size budgets.** Per-table byte budgets + total artifact budget. Exceeding
one fails CI and names the pruning knob to tighten. (Base corpus is already
~122 MiB; Layers A+B budget ~30 MiB initially.)

**G11 · Latency.** p95 over the probe set on the CI runner must stay under
budget (initial: 50 ms desktop-class; mobile numbers recorded once a consumer
measures on target hardware, then promoted to a gate).

### Why this is enough

Two structural facts make the gauntlet trustworthy rather than theatrical:
determinism means every effect of a change is *fully observable* in one rebuild
(no training noise, no drift), and signal budgets mean the worst case of a bad
admission is bounded (it can waste space and add mediocre candidates, but it
cannot shout down exact matches or concept anchors). The gates therefore don't
need to be clairvoyant — they need to measure, and everything here is measurable.

## 5. Runtime API (consumer contract)

**All five methods are implemented** as of ENGINE_VERSION 0.7.1. The ladder
auto-detects intent, so `research()` covers reference, verbatim phrase, concept
and lexical queries without the caller choosing:

```ts
createEngine(port: ContentQueryPort, opts?: EngineOptions): ScriptureEngine

engine.research(query: string): Promise<ResearchResult>
engine.close(): Promise<void>

// every result carries:
{ …ResearchOutcome,
  reasons: [{ family, label, points, provenance }], // Setlist's shape, with `kind` renamed `family`
  engineVersion, corpusFingerprint, layerFingerprint }
```

```ts
engine.themes(query): Promise<readonly ConceptMatch[]>   // concept resolution only
engine.passage(ref): Promise<PassageResult>              // parse + fetch, typed invalid
engine.related(ref): Promise<RelatedResult>              // CURATED links, not similarity
engine.forSong({ title?, themes?, lyrics?, foundationalRef? }): Promise<ResearchResult>
```

Three design commitments a consumer can rely on:

- **Invalid input is a typed kind, never an exception.** Consumers render the
  invalid-reference case; throwing would make every caller wrap a try/catch
  around something the type system already expresses.
- **`related()` is not similarity.** Every entry exists because a human
  recorded the link — a cross-reference edge, or a concept whose curated
  anchors include the passage. Similarity is what `research()` does, and
  conflating them is how a curated graph becomes a random walk.
- **`forSong()` is order-independent.** Fields are combined in a fixed order
  decided by the engine, not by how a caller built the object, and lyrics are
  capped at 40 tokens. Otherwise two consumers passing identical data get
  different rankings and the reproducibility contract is false.

Per-consumer adapters stay per-app: Maskil's Yjs selection bridge and panel;
Setlist's musical-compatibility scoring (key/BPM/flow stays in Setlist — it is
not Scripture evidence); Versed's memorization-pack builder. Each app pins
`(engine semver, artifact descriptor)` and verifies the descriptor exactly as
Maskil does today.

## 6. The concept-curation skill (ongoing enrichment)

Lives in the engine repo; invocable from any project session.

Flow for "strengthen coverage for evangelizing to Mormons":
1. **Fixtures first** — drafts golden fixtures for the queries Jesse would type
   and the passages that should surface; Jesse confirms *these* (the only
   judgment call a human must make, and it's a product judgment, not a data one).
2. Drafts the concept pack: concepts, lexicons, anchors, related edges — each
   entry provenance-tagged (`editorial` where it's LH's theological voice —
   labeled, per the no-theology-scores rule the *engine* still follows).
3. Runs G4 collision check *before* drafting further (redirects to merging with
   existing concepts when overlap is found).
4. Optionally proposes new sources (PD apologetics works) as manifest entries —
   acquisition, checksum, license capture.
5. Opens a PR; the gauntlet posts the Admission Report; Jesse merges on ADMIT.

The same skill handles bulk sermon ingestion ("add Spurgeon volumes 20–40"):
it runs the pipeline, reads the saturation report, and tells you what the batch
actually bought before you commit to it.

## 7. Phases — *status as of 2026-07-29, after Layer B*

| Phase | State | Note |
|---|---|---|
| 0 · Bootstrap | ✅ complete | G1/G2/G3/G4/G10 live from the first commit |
| 1 · Lexical ladder | ✅ complete | probe baselines recorded; G8/G11 live |
| 2 · Concept layer | ⚠️ complete *with a caveat* | fixture #1 green. But `themes()`/`forSong()` were listed in this phase's gate and **were not built** (§5). Nave/Torrey **not imported** — the spine is 8 editorial concepts + OpenBible votes |
| 3 · Evidence graph | ✅ **complete, and far past the pilot** | Seven expositors: Clarke, Matthew Henry, Keil & Delitzsch, Barnes, JFB (whole-Bible or testament-wide) plus Spurgeon and Maclaren on Psalms. **99.0% of verses carry corroborated evidence**; 877,300 terms |
| 3½ · Full-corpus build | ✅ **complete** | 31,098 verses, **40.91 MiB** (budget 160 MiB), 341k cross-references, 2.6–42 ms queries. First reviewed descriptor in `artifacts/`. `npm run build:artifact --workspace pipeline` |
| 4 · Curation skill | ✅ complete | skill ships; **not yet run end-to-end on a real gap**, so its own gate is unmet |
| 5 · Consumer adoption | ⏳ **unblocked, not started** | The API blocker is gone: all five methods ship at 0.7.1 on npm, with contract tests. What remains is per-app work in each consumer's repo, plus Jesse's sequencing call — see `NEEDS-JESSE.md` §1.3 |

**Measured Layer B outcome on the fixture corpus:** corroborated coverage went from
6 pericopes to 15 verses, 122 → 423 admitted terms. Psalm 23 went from *no profile*
to six verse-precise ones (23:1 sheep/pasture/shepherd, 23:4 valley/staff,
23:5 anointest/cup). "shepherd" ranks Psalm 23:1 first at 7.8 with 23:2–3 present
but subordinate at 2.8 — the thought continues past verse 1 and the ranking says so.
G8 churn stayed within threshold: the layer sharpened without reshaping searches it
had no business touching.

**Honest read:** the mechanism is proven and the coverage is tiny. 15 verses have
profiles. Layer B is demonstrated, not deployed.

### Original phase definitions (kept for the gates they specify)

**Phase 0 — Bootstrap (the repo exists and refuses bad data before it does
anything useful).** Create repo; extract Maskil's `content-pipeline/` + pure
`app/src/scripture/` modules (Maskil keeps consuming its current artifact
unchanged — no app risk); port Setlist's tokenizer into `engine/tokenizer`; CI
skeleton with G1/G2/G10 live and the Admission Report posting on every PR; seed
golden corpus with Maskil's existing reference/phrase gates plus fixture #1
("hearing and doing", initially failing).
*Gate: a PR touching data without provenance fails; two-runner determinism passes.*

**Phase 1 — Ladder completion (lexical).** Intents 3–4: bm25-ranked
distinctive-token/proximity search and conservative normalization (stemming +
archaic forms), through the pure scoring core with signal budgets (G6) enforced
and reasons carrying points. G8 probes + G11 latency live.
*Gate: lexical goldens pass with correct ordering AND reasons; probe baselines recorded.*

**Phase 2 — Concept layer ("hearing and doing" turns green).** Ontology schema +
loader; admit Nave, Torrey, OpenBible topics + cross-references through the full
gauntlet (G7 lineage declared: Torrey↔Nave, OpenBible←TSK); theme intent wired;
G4 collision gate live; `themes()`/`forSong()` APIs.
*Gate: fixture #1 passes via Layer A alone; broad probes show no precision erosion.*

**Phase 3 — Evidence graph pilot (one book, then earn the canon).** Pericope
table; alignment tiers; ingest James + Psalms only (Maclaren, Treasury of David,
indexed Spurgeon via existing scripture indexes); build `passage_terms` +
`co_citations`; G5/G9 live and proven on real data.
*Gate: measured golden improvement over Phase 2 on themed queries; saturation
report demonstrates the detector works. Scale book-by-book only on ADMIT verdicts.*

**Phase 4 — Curation skill + enrichment loop.** Ship
`.claude/skills/concept-curation`; run one real enrichment end-to-end (the
Mormon-evangelism pack is a good first test — it exercises `editorial`
provenance and G4).
*Gate: a full pack goes brief → fixtures → PR → Admission Report → merge with
Jesse touching only the fixtures and the merge button.*

**Phase 5 — Consumer adoption.** Maskil: swap the Scripture panel's repository
calls to the engine behind the existing UI (respecting Maskil's pilot-first
sequencing — this lands when Maskil's gate opens, and the panel contract barely
changes). Setlist: replace `keywords.ts` overlap scoring with `forSong()` while
keeping musical scoring local; its recommendations inherit concept matching
("sermon on hearing and doing" now matches obedience songs). Versed: passage
lookup + `themes()` for memorization packs.
*Gate: all three apps pin the same release and reproduce identical orderings for
identical queries.*

Phases 0–2 are pure software + already-vetted datasets — no OCR, no sermon
cleanup — and deliver the theme breakthrough. Phase 3 is where corpus labor
starts, sized deliberately small.

## 8. Risks

| Risk | Answer |
|---|---|
| **Single-author corpora yield idiolect, not theology** *(realized in Phase 3; not anticipated by this plan)* | Corroboration across ≥2 independent sources is now a build-time admission rule (§3.2). The residual risk is uneven coverage: any book with one commentator is back in the failure mode, and Psalms 58–87 / 111–119 are there today |
| **A metric can be silently meaningless** *(realized)* | Per-term attribution was recording pericope sources, not term sources — the corroboration count looked right and measured nothing. Caught only because a second author made the numbers inspectable. Argues for testing metrics against a case where you know the answer, not just for gating on them |
| Guardrail thresholds themselves are wrong at first | They're versioned data in `budgets.json`, change-gated like everything else; Phase 1 records baselines before any gate tightens |
| Gauntlet CI time grows with corpus | Full rebuild is batch and cache-friendly; Actions free tier is sufficient through Phase 3; artifact build is the only slow step and caches on manifest fingerprints |
| Ontology curation stalls (human bottleneck) | AI-drafted, fixture-first flow reduces Jesse's role to product judgment + merge; Nave/Torrey/OpenBible give ~2k concepts mechanically before any hand-curation |
| Transcription-layer rights (Spurgeon sites, CCEL) | G1 forces the question per source; prefer Gutenberg/re-OCR when a site claims rights |
| Web delivery of a growing artifact (Maskil B6) | Unchanged by this plan (budgeted growth ~30 MiB); a hosted query adapter over the same engine remains possible later without redesign |
| Maskil pilot destabilization | Phase 5 ordering: Maskil adopts last, behind its own gate; extraction in Phase 0 changes no Maskil runtime code |
