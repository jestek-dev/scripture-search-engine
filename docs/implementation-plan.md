# Shared deterministic Scripture engine — implementation plan

**Date:** 2026-07-29
**Status:** Approved direction; supersedes the "someday" portions of the Phase 5
research scope by moving them to a shared repository
**Consumers:** Maskil, LH Worship Setlist, Versed (and future LH projects)
**Companion:** `docs/design/2026-07-29-theological-concept-engine.md` (architecture rationale)

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

## 2. Repository

Working name: **`scripture-engine`** (rename at Jesse's pleasure; "Versed" stays
an app identity, not the engine's).

```
scripture-engine/
├── ontology/                 # Layer A: concept packs (YAML), PR-reviewed like code
│   ├── concepts/…            # one file per concept; provenance-tagged entries
│   └── lexicon-normalization/# archaic forms (doeth→does), spelling variants
├── pipeline/                 # build-time only; never ships
│   ├── manifests/            # pinned sources: URL, SHA-256, license, derivation lineage
│   ├── importers/            # bible, nave/torrey, openbible, gutenberg, sermon indexes
│   ├── align/                # tiered passage alignment (keyed → header → citation-mined)
│   ├── stats/                # PMI/TF-IDF term profiles, co-citation graph, pruning
│   └── build/                # schema, artifact assembly, fingerprints (from Maskil)
├── engine/                   # Layer C: pure TS, zero I/O, published package
│   ├── tokenizer/            # ONE shared tokenizer (Setlist stopwords/stemming, grown)
│   ├── intents/              # reference | exact-phrase | tokens | normalized | theme
│   ├── ranking/              # scoring core (Setlist pattern), caps, tie-breaks, diversify
│   ├── reasons/              # typed reason objects w/ points + provenance handles
│   └── config/               # SIGNAL BUDGETS + engine version (reviewed, versioned)
├── eval/                     # the guardrail suite (see §4)
│   ├── golden/               # fixtures: query → expected ordering + expected reasons
│   ├── probes/               # fixed broad/narrow probe queries for noise metrics
│   ├── budgets.json          # size, latency, signal, churn thresholds (reviewed)
│   └── report/               # admission-report generator (posts to PR)
├── artifacts/                # reviewed release descriptors (Maskil's model, generalized)
└── .claude/skills/
    └── concept-curation/     # the enrichment skill (see §6)
```

**Deliverables per release, both free:**
1. `@lh/scripture-engine` — pure TS package (npm or git tag), semver.
2. `content.db` + descriptor — GitHub Release asset (≤2 GB free limit; we're ~150 MB).

Reproducibility contract: `(engineVersion, corpusFingerprint, query) → identical
ordering` on every platform, in every consuming app. This is a CI-enforced gate,
not a promise.

## 3. Engine architecture (condensed; rationale in companion doc)

- **Layer A — concept ontology:** concepts with modern labels, lexicons, scripture
  anchors, related-concept edges; seeded from Nave + Torrey + OpenBible topic
  votes (CC BY); every entry provenance-tagged (`nave`, `openbible`,
  `editorial`, `source:<id>`); human-admitted via PR.
- **Layer B — homiletical evidence graph:** build-time distillation of PD
  sermons/commentaries into `passage_terms` (top-N distinctive terms per
  pericope), `co_citations`, and full per-edge provenance. Sermons never ship.
- **Layer C — runtime:** intent ladder over SQLite; pure scoring core; typed
  reasons carrying score components and provenance; deterministic ordering.
- **Pericope model:** Layer B keys on passage ranges, not single verses; the
  artifact carries a reviewed pericope table (seeded from translation paragraph
  breaks + commentary section boundaries, human-adjustable).
- **AI-at-build policy:** AI may draft ontology entries, alignment guesses, and
  normalization tables. Nothing AI-drafted reaches the artifact without passing
  the gauntlet *and* human PR merge. The runtime is statistics + lookups only.

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

**G5 · Distinctiveness floor.** `passage_terms` only admits terms above a PMI
threshold vs. the whole-corpus background, hard-capped at N terms per pericope.
Generic vocabulary ("god", "lord", "love" as bare tokens) can never enter a
profile no matter how many sermons repeat it. The thresholds live in
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

```ts
createEngine(db: ContentQueryPort, config?: EngineConfig): ScriptureEngine

engine.research(query: string, opts?): ResearchResult
  // full ladder: reference | exact-phrase | theme | lexical — auto-detected intent
engine.themes(query: string): ConceptMatch[]        // concept resolution only
engine.passage(ref: string): Passage | InvalidRef    // parse + fetch + context
engine.related(ref: string): RelatedResult           // cross-refs/co-citations for a passage
engine.forSong(input: { title?, themes?, lyrics?, foundationalRef? }): ResearchResult
  // multi-field: Setlist sermon-matching and Maskil song-creation both call this

// every result:
{ targetId, pericope, excerpt, score,
  reasons: [{ kind, label, points, provenance }],   // Setlist's shape, kept
  engineVersion, corpusFingerprint }                 // Maskil's identities, kept
```

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

## 7. Phases

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
| Guardrail thresholds themselves are wrong at first | They're versioned data in `budgets.json`, change-gated like everything else; Phase 1 records baselines before any gate tightens |
| Gauntlet CI time grows with corpus | Full rebuild is batch and cache-friendly; Actions free tier is sufficient through Phase 3; artifact build is the only slow step and caches on manifest fingerprints |
| Ontology curation stalls (human bottleneck) | AI-drafted, fixture-first flow reduces Jesse's role to product judgment + merge; Nave/Torrey/OpenBible give ~2k concepts mechanically before any hand-curation |
| Transcription-layer rights (Spurgeon sites, CCEL) | G1 forces the question per source; prefer Gutenberg/re-OCR when a site claims rights |
| Web delivery of a growing artifact (Maskil B6) | Unchanged by this plan (budgeted growth ~30 MiB); a hosted query adapter over the same engine remains possible later without redesign |
| Maskil pilot destabilization | Phase 5 ordering: Maskil adopts last, behind its own gate; extraction in Phase 0 changes no Maskil runtime code |
