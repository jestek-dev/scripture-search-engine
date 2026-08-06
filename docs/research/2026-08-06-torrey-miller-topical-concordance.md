# The Torrey/Miller Topical Concordance — verification, dataset, and curation policy

Research date: 2026-08-06
Purpose: Establish the provenance of Jesse's Miller (1977) topical concordance
PDF, pin a machine-readable canonical source for its underlying work (Torrey's
*New Topical Textbook*, 1897), and record the reference dataset curators draw
Torrey-sourced anchors from. This is the research record behind
`pipeline/manifests/torrey.json` and `pipeline/manifests/nave.json`.

---

## 1. What the Miller PDF actually is

Jesse's PDF — Madeline S. Miller & J. Lane Miller (eds.), *Topical Bible
Concordance* (1977 reissue) — is **not an original work**. Its preface states
the material was compiled "over one hundred years ago" and reissued; the body
is a 313-topic selection taken **verbatim** from R. A. Torrey's *The New
Topical Textbook* (1897), which is public domain by age.

Verification method (three witnesses):

1. **Miller PDF** (OCR text of Jesse's copy),
2. **CCEL's full text** of Torrey's *New Topical Textbook*
   (https://ccel.org/ccel/torrey/ttt — 628 entries), and
3. **the machine-readable JSONL witness** (§2).

Seven topics totalling ~300 outline points were compared point-by-point across
all three witnesses: headings, outline point wording, and reference lists
matched verbatim (up to OCR-level typography). Every Miller heading was then
matched against the canonical Torrey topic list: **311 of 313 headings match
a Torrey topic exactly**.

The two exceptions — **TRUST** and **TRINITY, THE** — appear in Miller but
have no corresponding Torrey heading. They could not be verified against any
witness of the public-domain source, so they are **excluded from the dataset
entirely**. Nothing from those two topics may be cited as `torrey`; if either
theme is wanted, it must be curated as `editorial` from scratch.

## 2. The pinned canonical source

Because Miller is a verbatim subset of Torrey, the admitted source is Torrey
itself, via the audited machine-readable transcription:

- **Dataset**: `dist/torrey/topics.jsonl` from
  github.com/j86schroeder/topical-bible-search, MIT License, pinned to commit
  `7eac7ebd6ce28030090cf7279aed90068e6114f5` (2026-08-05).
- **Checksum**: sha256
  `9c2b6177b24f6fc9df5aeca2985ee8ff8fb941c27d9032347af6f9da53dd4692`,
  148,324 bytes — recorded in `pipeline/manifests/torrey.json`.
- **Rights**: the 1897 text is public domain by age; the transcription layer
  is MIT (redistribution including commercial use, license notice preserved),
  hence `rightsClass: pd_text_claimed_transcription` with
  `maxTier: public_distribution`.
- **Known caveats**: the transcription's source PDF is reproducible-by-recipe
  rather than pinned upstream, so our checksum *is* the snapshot we admitted.
  The witness carries 620 topics vs CCEL's 628 — unreconciled, merged/split
  headings suspected. Three swallowed headings and two duplicated headings in
  the witness were reconciled during dataset construction (documented in
  `torrey-topical/build_dataset.py`), each verified by content, alphabetical
  position, and Miller's own printed headings.

G7 lineage: Torrey's reference lists overlap Nave's Topical Bible (both are
1897-era topical indexes with heavily shared scholarship), so `torrey.json`
declares `derivedFrom: ["nave"]` against the lineage-only `nave.json` —
modeled on `tsk.json` — and both map to the `concept_anchor` signal family in
the gauntlet. Evidence from Torrey and any future Nave-derived source shares
one correlation budget and is never counted twice as independent.

## 3. The reference dataset (`docs/research/torrey-topical/`)

Data used by **curators**, not by the build. Nothing in `pipeline/` reads it.

| File | Contents |
|---|---|
| `torrey-miller-topics.json` | 311 topics (Miller's 1977 selection of Torrey), 12,628 outline points, 21,002 KJV-validated references. Each topic: `millerHeading`, ordered `points` with outline `text`, parent chain, and verse-bounded `refs`. |
| `stats.json` | Build statistics (topic/point/ref counts, review-queue and discrepancy tallies). |
| `review-queue.json` | 24 references (27 items) that could not be validated mechanically: chapter-scope citations, cross-chapter ranges the schema cannot represent, and witness errata (e.g. "Ob 3:2" in a one-chapter book) with the proposed correction *recorded, not applied silently*. |
| `discrepancies.json` | 11 disagreements between the JSONL witness and the CCEL full text, recorded verbatim. |
| `build_dataset.py` | The deterministic build script (references scratchpad paths from the build session; kept as the method record, not as runnable pipeline code). |

**Policy: nothing guessed, nothing silently corrected.** A reference the
validator could not place exactly went to the review queue; a disagreement
between witnesses went to the discrepancy log; neither was resolved by
editorial fiat inside the dataset. Curators citing a ref that appears in the
review queue or a discrepancy record must resolve it by reading the passage,
and the resolution is an editorial act (cite `editorial`, not `torrey`).

## 4. How curators use this dataset

1. **Fixture first.** Per the concept-curation skill: write the golden fixture
   for the query you would type, run the gauntlet, confirm the gap is real.
2. **Topic outlines → anchor candidates.** Find the Torrey topic(s) that map
   to the concept (the batch mapping lives in the curation plan; see also §5).
   Read the outline point *text* — an anchor is admissible as
   `sources: [torrey]` only when the point's own wording plainly supports the
   concept **and** the passage is genuinely on-theme when you read it. Torrey
   names the passage; you still verify it. When unsure, leave it out.
3. **Provenance is literal.** `sources: [torrey]` means "Torrey's outline
   names this passage for this topic" — the result chip will say so. A passage
   you chose yourself, or a Torrey ref you corrected or reinterpreted, is
   `editorial`. Never launder judgment through a neutral-looking source id.
4. **Lexicons are always modern editorial phrasing.** Torrey headings
   ("FORGIVENESS OF INJURIES", "CARE, OVERMUCH") are provenance, not query
   language. Lexicon entries are what someone would actually type ("forgive
   others", "do not be anxious") — and must be run through `significantWords`
   before committing, since a phrase of pure stopwords can never match.
5. **Weights**: Torrey-sourced supporting anchors sit below the editorial
   classics — 0.6–0.8 vs 0.9–1.0 — because Torrey lists dozens of refs per
   topic and a prior, not a ranking, is what the weight expresses.

## 5. First admission wave (2026-08-06)

Shipped with this research record: torrey-sourced supporting anchors on the
existing concepts where Miller/Torrey topics map onto them, and a first batch
of new concepts (worship set, gospel set, Christian-life set, Christ-events
set) drawn from the curation plan, each fixture-first. Roughly 240 of the 311
topics remain unconsumed; the curation plan tiers them (Tier A next-wave
candidates such as the Holy Spirit family, new-birth, God's mercy/power/glory,
faith, humility, temptation; Tier B doctrine/study; Tier C character/vice
catalogue; Tier D low-value or sensitive topics that must not be curated
without explicit editorial review).

Deferred by design in this wave: `holy-spirit` and `new-birth` (kept out to
hold the batch's collision surface small), God's-attribute concepts that share
vocabulary with batch concepts (`holiness-of-god` vs `holiness`), and the two
unverifiable Miller-only topics. On those two: the *theme* of trust still
ships as the `trust-in-god` concept, but its classics are `editorial` and its
Torrey support comes from the verified WAITING UPON GOD outline — nothing from
Miller's unverified TRUST pages is cited as `torrey`. TRINITY, THE likewise
has no Torrey counterpart and waits for editorial curation.
