# scripture-search-engine

A deterministic, concept-aware Scripture search engine shared by **Maskil**,
**LH Worship Setlist**, and **Versed**.

It answers theme queries the way a well-read person would — "hearing and
doing" should surface James 1:22–25 and Matthew 7:24–27 — using nothing but
curated data, statistics, and lookups. **No AI runs at query time, ever.**
AI may assist in *building* the datasets offline; every entry is
human-admitted, and the runtime is arithmetic over reviewed tables.

## Why it exists

Lexical search finds words. It cannot deduce that "hearing and doing" means
"hearing the word, then acting on it", so it misses the passages that matter
most. The fix is not a model at runtime — it is giving each passage a richer
vocabulary and concept signature at build time, distilled from centuries of
public-domain preaching and community topical data.

## Architecture

| Layer | What it is | Ships? |
|---|---|---|
| **A — Concept ontology** | Curated concepts: modern labels, lexicons, scripture anchors, provenance. Seeded from Nave, Torrey, OpenBible topics. | Yes, ~MBs |
| **B — Homiletical evidence** | Per-**verse** distinctive term profiles, distilled offline from PD commentaries. A term is admitted only when 2+ independent expositors covering that verse used it — corroboration is what separates theology from one author's habits. | Distillate only — **source prose never ships and is never read at query time** |
| **C — Runtime** | Intent ladder → candidates → deterministic ranking → typed reasons. Pure TS, zero I/O. | Yes, the published package |

Full rationale: [docs/architecture.md](docs/architecture.md).
Phased build: [docs/implementation-plan.md](docs/implementation-plan.md).

## Coverage

| | verses carrying homiletical evidence |
|---|---|
| **Whole Bible** | 30,777 / 31,098 = **99.0%** |
| Old Testament | 99.6% |
| New Testament | 97.3% |

Evidence is admitted only where **two or more independent expositors** used the
same distinctive term about the same verse. That rule is what separates
theology from one writer's habits — with a single author, the highest-scoring
terms for a passage are that author's stylistic tics, not its subject.

## The reproducibility contract

```
(engineVersion, corpusFingerprint, layerFingerprint, query)
  → identical ordering, on every platform
```

Three identities, because results can change for three independent reasons:
engine code, scripture text, and the curated layers. Before
`layerFingerprint` existed, editing one concept altered rankings while every
published identity stayed the same — which made the contract quietly false.

CI enforces this on two operating systems. Any code change that alters
ordering must bump `ENGINE_VERSION` in the same commit, or gate G2 fails.

## The admission gauntlet

Every change that can affect results — a new source, a concept pack, a weight
change — is a PR. CI runs eleven gates and posts one **Admission Report**:

> **ADMIT** · **ADMIT WITH WARNINGS** · **REJECT** (named gate, named rows) ·
> **NO MEASURABLE EFFECT**

You read a verdict, not a dataset. That last verdict matters as much as the
others: an addition that changes no fixture outcome and moves no metric is
weight without value, and merging it is how a corpus bloats past the point of
diminishing returns.

| Gate | Protects against |
|---|---|
| G1 provenance | Unattributed or wrongly-licensed rows (fails closed) |
| G2 determinism | Ordering that drifts between runs or platforms |
| G3 golden regression | Lost ordering **or** a right answer for the wrong reason |
| G4 collision | Near-duplicate concepts diluting each other's anchors |
| G5 distinctiveness | Generic vocabulary **and single-author idiolect** accumulating into false evidence |
| G6 signal budgets | Any dataset outshouting exact matches — **bounded by construction** |
| G7 correlation | Counting overlapping sources as independent evidence |
| G8 noise probes | Precision erosion; the "everything returns everything" failure |
| G9 saturation | Ingesting redundancy; makes diminishing returns a visible number |
| G10 size | Artifact growth past what a device can ship |
| G11 latency | Query-time regressions |

G6 is the deepest: because caps are enforced *inside* the scoring core, the
worst case of a bad admission is bounded. New data changes **which** candidates
appear; it can never change **how loud** a signal class is allowed to be.

## Layout

```
engine/     pure TS runtime — tokenizer, references, budgets, ranking (published)
pipeline/   build-time only — manifests, importers, alignment, statistics
ontology/   Layer A concept packs, reviewed like code
eval/       the gauntlet: gates, golden fixtures, probes, budgets, report
artifacts/  reviewed release descriptors (the .db itself is a Release asset)
docs/       architecture + implementation plan + open decisions
```

## Development

```bash
npm ci
npm run verify      # typecheck + unit tests + gauntlet
```

Individual steps: `npm run typecheck`, `npm test`, `npm run gauntlet`.

## Status

**Phases 0–4 complete. All eleven gates live, verdict ADMIT.** Phase 5 (wiring
Maskil, Setlist and Versed) is deliberately not started.

| Layer | State |
|---|---|
| Lexical ladder | reference, verbatim phrase + longest-fragment fallback, IDF tokens with proximity, archaic/inflection folding |
| Concept spine | 8 curated concepts, OpenBible topical votes, cross-reference expansion. Nave/Torrey researched, not yet imported |
| Homiletical | Maclaren's *Expositions* + Spurgeon's *Treasury of David* (4 of 6 vols, 5,525 expositions) → verse-level corroborated term profiles. **15 verses have profiles** — the mechanism is proven, the coverage is small |
| Curation | `.claude/skills/concept-curation` — fixtures-first enrichment workflow, not yet run on a real gap |
| Runtime API | `research()` only. `themes()` / `forSong()` are typed but unbuilt |

**Golden fixture #1 is active and passing.** "hearing and doing" returns
James 1:22, Matthew 7:24 and Luke 6:47 carrying `concept_anchor` evidence
attributed to LH editorial — the right passages *for the right reason*, which
is what the fixture actually asserts.

**The full artifact builds**: 31,098 verses, **117.60 MiB** against a 160 MiB
budget, 341k cross-references, 877k corroborated terms, queries under 10 ms.

```bash
npm run build:artifact --workspace pipeline
```

CI still gates against an 828-verse fixture, deliberately — a per-PR check must
be hermetic and fast. The two builds answer different questions: the fixture
says whether the code is correct, the artifact says what you would ship.

Open decisions and known limits: **[docs/NEEDS-JESSE.md](docs/NEEDS-JESSE.md)**.

## Distribution

Two versioned deliverables, both free to host:

1. `@jestek-dev/scripture-engine` — the pure TS package (semver).
2. `content.db` + reviewed descriptor — a GitHub Release asset.

Consumers pin both and verify the descriptor before opening the database.
There is no server component; nothing runs anywhere but the user's device.

## Sources

Every expositor, dataset and translation the engine draws on is named in
**[docs/ATTRIBUTIONS.md](docs/ATTRIBUTIONS.md)**, generated from the manifests
so it cannot drift from what the artifact actually contains. It also records
what is deliberately absent, and why.

## Provenance and rights

Every shipped row traces to a manifest entry with a checksum, license record,
and rights class. Sources whose *digitization* carries a claim (e.g. CCEL's
non-commercial terms) are capped below public distribution — "the text is
public domain" is not the same as "this file is free to ship", and G1 makes
the distinction structural rather than remembered.
