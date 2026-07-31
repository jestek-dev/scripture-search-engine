# The deterministic theologian — concept-aware Scripture discovery

**Date:** 2026-07-29
**Status:** Original design rationale, approved. **Two sections have been
superseded by what the build measured** — §2 Layer B (granularity and
corroboration) and §3 (the covenant question, now decided). Both are annotated
inline. Current state: `docs/implementation-plan.md`; open calls:
`docs/NEEDS-JESSE.md`.
**Problem instance:** searching the theme "hearing and doing" finds verses containing
those literal words, but cannot deduce that the theme means "hearing the word, then
acting on the word" and should surface James 1:22–25, Matthew 7:24–27, Luke 6:46–49,
Ezekiel 33:31–32. Lexical search has no theological framework.

---

## 1. The core insight

We do not need runtime AI to close this gap. We need each passage to carry a
**richer deterministic vocabulary and concept signature than its own verse text** —
and centuries of public-domain preaching plus modern community topical data can
supply exactly that, distilled offline into a compact, reviewed, fingerprinted
artifact.

Three observations make this work:

1. **Sermons are passage-labeled theology.** A Spurgeon sermon prints its text
   ("James 1:22") at the top. Everything the sermon says is human theological
   elaboration *of that passage* — including the modern-ish phrase space around it
   ("hearers and doers", "practice what you hear", "obedience to the word").
   Spurgeon's scripture indexes (archive.spurgeon.org, Kingdom Collective) already
   map all ~3,500 sermons to their texts, so alignment is a solved lookup, not an
   extraction problem.
2. **Verse-keyed commentaries are even better than sermons** for coverage: Matthew
   Henry, Maclaren's *Expositions of Holy Scripture* (passage-keyed, proofread, on
   Project Gutenberg), Spurgeon's *Treasury of David* (Psalms, verse-keyed), JFB,
   Barnes. They give the **whole Bible** a vocabulary halo with zero alignment
   inference. Sermons then add depth on the passages that get preached.
3. **OpenBible.info's Topical Bible is the modern-register bridge.** ~1,800 topics
   phrased the way people actually search today, each with community-voted verse
   lists, data downloadable under CC BY. Victorian corpora pull vocabulary toward
   1870; OpenBible topics pull it back to how a worship leader types.

## 2. Architecture — three layers

### Layer A — Curated concept ontology (the spine)

A reviewed, versioned graph of theological concepts:

```yaml
concept: obedience-to-the-word
label: "Hearing and doing"
lexicon:            # surface forms that should resolve to this concept
  - hearing and doing
  - hearers and doers
  - doers of the word
  - practice what you hear
  - obey the word
anchors:            # scripture anchors with typed provenance
  - ref: James 1:22-25       # Nave: "Obedience"; Torrey; OpenBible topic votes
  - ref: Matthew 7:24-27
  - ref: Luke 6:46-49
  - ref: Ezekiel 33:31-32
related: [obedience, faith-and-works, self-deception]
sources: [nave, torrey, openbible-topics, editorial]
```

Seeded mechanically from **Nave's Topical Bible** and **Torrey's New Topical
Textbook** (both public domain per CrossWire) merged with **OpenBible topic votes**
(CC BY, attributed), then **human-reviewed** — labels modernized, historic
editorial theology filtered, every merged concept inspectable. This is the
"deterministic theologian's" doctrinal spine: small (a few MB), fully reviewable,
and the layer where LH's own theological voice can eventually be encoded
deliberately rather than statistically.

### Layer B — Homiletical evidence graph (the flesh)

Built offline from PD sermons and commentaries. The sermons themselves **never
ship and are never read at query time**. The pipeline distills them into three
compact tables:

- **`passage_terms`** — per pericope, the top-N *distinctive* terms/bigrams from
  everything preached/written on it, scored by PMI/TF-IDF against the whole-corpus
  background and pruned hard. This is what makes "hearing and doing" hit James 1
  even before the ontology matures: sermons on James 1:22 use those words at
  frequencies the background corpus doesn't.

  > **⚠️ Superseded.** Built, measured, replaced. Two problems this design did not
  > foresee: (a) keying on pericopes meant authors who chunk a passage differently
  > never corroborate each other — Psalm 23 got no profile at all; (b) a PMI floor
  > alone yields *authorial idiolect*, not theology (`mellow`, `friction`, `troth`).
  > Now `verse_terms`: agreement resolves at the verse, and a term needs 2+
  > independent attesting sources. See implementation plan §3.1–3.2.
- **`co_citations`** — verses cited together inside sermon bodies, a
  cross-reference graph with homiletical (not editorial) provenance; merges with
  the OpenBible cross-reference plan (CC BY, ~340k relations) as a *separate,
  capped signal* — never double-counted as independent evidence.
- **`provenance`** — every edge and term profile keeps its source (author, work,
  sermon/section ID, source checksum) so any result can show *why*.

Alignment tiers, cheapest first:
1. verse/passage-keyed commentaries (alignment is free);
2. sermons with explicit text headers + existing scripture indexes (lookup);
3. citation mining inside sermon bodies (parser, KJV-style refs — we already own a
   reference parser).

Normalization handles the Victorian register: archaic-form table (`doeth→does`,
`heareth→hears`), long-s/OCR cleanup (prefer Gutenberg's proofread text over raw
Archive.org OCR), KJV-only citation style folded into canonical verse IDs.

### Layer C — Runtime deterministic retrieval

The theme intent slots into the already-planned intent ladder (reference → exact
phrase → tokens/proximity → normalization → curated expansion → fallback):

```text
"hearing and doing"
  → concept lexicon match (Layer A)  → anchors, strongly weighted
  → passage_terms postings (Layer B) → candidates, per-signal capped
  → co-citation expansion from high-confidence hits → capped, diversified
  → deterministic ranking → typed reason objects → stable ordering
```

Every rule from the 2026-07-20 plan still binds: weak signals capped per-signal
and in aggregate, votes are a prior not a correctness label, stable ID as final
tie-break, same engine version + corpus fingerprint + input ⇒ same ordering, and
**no result claims the app interpreted the lyric**. Reasons are now the star:

> **Psalm 46:1–3** · *Theme: hearing and doing → refuge under trial* ·
> anchored by Nave "Obedience"; preached by Spurgeon, MTP #1467 "Hearers and
> Doers"; 214 community votes (OpenBible, CC BY)

That provenance chip is what makes the system *feel* AI-accurate while being the
opposite of generative: every edge a human wrote, every weight reproducible.

## 3. The no-AI covenant question — ✅ DECIDED

> **Resolved 2026-07-29: Path 2**, with the boundary stated precisely as "no AI at
> runtime, ever" rather than "no AI ever". AI may assist in building datasets
> offline; nothing AI-drafted reaches the artifact without passing the gauntlet and
> a human PR merge. This is now non-negotiable #1 in `CLAUDE.md`, and the
> `editorial` manifest records the asterisk in the shipped provenance rather than
> hiding it. Original framing kept below.

The published boundary is "no generative AI, ever — deterministic analysis only."
Two build paths:

- **Path 1 (recommended): fully deterministic build.** Statistics (PMI/TF-IDF,
  co-citation counts) + mechanical seed merges + human review. The covenant stays
  perfectly clean at every layer, including the pipeline. Slower ontology
  curation; the statistics carry more weight early.
- **Path 2: LLM-assisted *offline* curation** (draft concept lexicons/merges, human
  reviews every entry, runtime untouched). Faster curation, but "no AI ever" fans
  will test the claim, and "AI helped build the dataset" is a real asterisk.

This is a covenant-scope decision, not a technical one. Path 1 is viable — Nave,
Torrey, and OpenBible were all built by humans and cover thousands of concepts.

## 4. A separate shared repository — yes

The engine is now consumed by **Maskil, the Setlist project, and Versed**, and it
must produce byte-identical rankings across all three or the "deterministic"
claim quietly dies. Extract it:

```
scripture-engine/            (working name; Versed is a candidate identity)
├── ontology/                # Layer A, curated YAML, PR-reviewed like code
├── pipeline/                # importers, alignment, statistics, normalization
│   └── manifests/           # pinned source artifacts + checksums + licenses
├── engine/                  # pure-TS discovery: intent → candidates →
│                            #   deterministic ranking → reason objects
│                            # no I/O; ContentQueryPort stays the seam
├── artifacts/               # reviewed release descriptors (like Maskil's
│                            #   content-artifact.json — this model generalizes)
└── eval/                    # golden corpus + ordering/explanation gates in CI
```

- **Two versioned deliverables:** the engine package (semver; npm/git-tag) and the
  content artifact (descriptor with database SHA-256, manifest fingerprint, corpus
  fingerprint). Consumers pin both; a result is reproducible from
  `(engineVersion, corpusFingerprint, query)` anywhere.
- Maskil's `content-pipeline/` + the pure parts of `app/src/scripture/`
  (reference parsing, repository, types) are the extraction seed — the admission
  model, fingerprinting, and fail-closed distribution tiers move as-is.
- Per-app needs stay per-app: Maskil's Yjs selection bridge and panel UI, Setlist's
  service-planning surface, Versed's whatever — only intent + corpus + ranking are
  shared.
- The dataset admission policy travels with the repo, so a source admitted for one
  app cannot silently leak into another at a different rights tier.

## 5. Source shortlist and rights posture

| Source | Role | Rights posture |
|---|---|---|
| Project Gutenberg — Maclaren *Expositions* (many volumes), Wesley, Edwards, *World's Great Sermons* | Tier-1 passage-keyed corpus | PD, proofread, no restrictions; bulk via Gutenberg mirror |
| Spurgeon MTP/NPSP via Internet Archive scans + archive.spurgeon.org / Kingdom Collective scripture indexes | Tier-2 depth corpus + alignment | Text PD; **check transcription-layer terms per site** before ingesting their files vs. re-OCR |
| *Treasury of David*, Matthew Henry, JFB, Barnes | Tier-1 verse-keyed commentary | PD; prefer Gutenberg/Wikisource editions |
| Nave's Topical, Torrey's Textbook | Ontology seed | PD per CrossWire module records |
| OpenBible Topical Bible votes | Modern-register concept bridge | CC BY, downloadable; attribute; votes are a prior, not truth |
| OpenBible cross-references | Co-citation complement | CC BY (already in plan; Phase 0 item 3 still open) |
| CCEL files | Avoid | Non-commercial claim on their transcriptions |
| LH sermon manuscripts (future) | Voice/contemporary register | Owned outright; ingest when available — the pipeline is source-agnostic by design |

Modern third-party sermon transcripts stay out: posted-publicly ≠ licensed.

## 6. Honest constraints

- **Artifact size.** content.db is already 122 MiB with B6 (web delivery) an open
  hold. The distilled layers are small (ontology ~MBs; pruned `passage_terms`
  ~tens of MBs; sermons never ship) — but pruning thresholds are a real design
  gate, and web delivery pressure increases.
- **Register drift.** A PD-only corpus pulls toward 1870. Mitigations, in order:
  OpenBible's modern topic phrasing, the curated lexicon, archaic-form
  normalization, and eventually LH manuscripts.
- **Evaluation first.** "Hearing and doing" becomes golden fixture #1. The
  existing gates (ordering + explanations, not mere presence) apply before any
  weight tuning. No dataset is admitted without a measured improvement on the
  golden corpus — the 2026-07-20 admission policy already requires this.
- **Sequencing.** The 2026-07-25 audit deliberately deferred the broad engine
  until after the collaboration pilot. A shared-repo extraction is the one shape
  that softens this conflict: the engine can grow in its own repo on its own
  cadence (serving Setlist/Versed immediately) without destabilizing Maskil's
  pilot, and Maskil admits the upgraded artifact when its gate opens.

## 7. Proposed first four steps

1. **Decide** covenant scope (Path 1 vs 2, §3) and the shared-repo extraction.
2. **Bootstrap the repo** from `content-pipeline/` + pure `app/src/scripture/`
   modules; move the golden-corpus harness in; CI runs ordering gates.
3. **Admit OpenBible topics + cross-references** (CC BY, checksummed, attributed)
   and seed the ontology from Nave/Torrey — this alone likely fixes "hearing and
   doing" via Layer A before any sermon is ingested.
4. **Pilot Layer B on one book** (James or Psalms): Maclaren + Treasury of David +
   indexed Spurgeon sermons → `passage_terms` → measure against the golden corpus.
   Scale to the canon only on measured wins.

## Sources

- [OpenBible Topical Bible](https://www.openbible.info/topics/) · [technical notes](https://www.openbible.info/blog/2007/07/topical-bible-technical-notes/) · [cross-references](https://www.openbible.info/labs/cross-references/)
- [Maclaren, *Expositions of Holy Scripture* — Psalms](https://www.gutenberg.org/ebooks/7925), [St. Matthew](https://www.gutenberg.org/ebooks/7351), [St. Mark](https://www.gutenberg.org/ebooks/8071), [St. Luke](https://www.gutenberg.org/ebooks/8200), [St. John](https://www.gutenberg.org/ebooks/8070), [Acts](https://www.gutenberg.org/ebooks/8397), [Genesis–Numbers](https://www.gutenberg.org/ebooks/7069), [Isaiah & Jeremiah](https://www.gutenberg.org/ebooks/8069), [Ephesians/Peter/John](https://www.gutenberg.org/ebooks/24674)
- [Spurgeon scripture index (archive.spurgeon.org)](https://archive.spurgeon.org/index/rindex.php) · [Kingdom Collective sermon list](https://www.thekingdomcollective.com/spurgeon/list/) · [Spurgeon Gems 63-volume set](https://www.spurgeongems.org/spurgeon-sermons/)
- [CrossWire — Nave](https://www.crosswire.org/sword/copyright/ModInfoCopyright.jsp?modName=Nave) · [Torrey](https://www.crosswire.org/sword/copyright/ModInfoCopyright.jsp?modName=Torrey)
- Prior internal decisions: `docs/2026-07-20-plan-review-and-solidification.md`,
  `docs/2026-07-24-feature-ladder.md`, `docs/2026-07-25-full-plan-audit.md`
