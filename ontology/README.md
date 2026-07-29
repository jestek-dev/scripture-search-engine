# Ontology — the curated concept spine (Layer A)

Concepts are **data reviewed like code**. One file per concept in
`concepts/`, admitted by PR, gated by G4 (collision) and G3 (golden fixtures).

Phase 0 ships no concepts. This document fixes the schema so Phase 2's
importers and loader have a target, and so the curation skill has a contract
to generate against.

## Schema

```yaml
# concepts/obedience-to-the-word.yaml
id: obedience-to-the-word          # stable, kebab-case, never reused
label: Hearing and doing            # what a result chip displays

lexicon:                            # surface forms that resolve to this concept
  - hearing and doing               # matched on normalized tokens, so
  - hearers and doers               # inflection and archaic forms are covered
  - doers of the word               # automatically by the shared tokenizer
  - practice what you hear
  - obey the word

anchors:                            # scripture this concept names
  - ref: James 1:22-25
    sources: [nave, openbible-topics]
    weight: 1.0                     # prior only; never a correctness label
  - ref: Matthew 7:24-27
    sources: [nave, torrey]
  - ref: Luke 6:46-49
    sources: [openbible-topics]
  - ref: Ezekiel 33:31-32
    sources: [torrey]

related:                            # neighbouring concepts, not synonyms
  - obedience
  - faith-and-works
  - self-deception

sources: [nave, torrey, openbible-topics]   # every source cited above
```

## Rules the gates enforce

1. **Every `sources` id must exist in `pipeline/manifests/`** with a license
   record and checksum (G1). An unattributed anchor cannot ship.
2. **Minimum two lexicon entries** (G4). One phrasing is not a concept; it is
   a search term, and it will collide with its neighbours.
3. **No near-duplicate concepts** (G4). If a new concept's lexicon overlaps an
   existing one past the threshold in `eval/budgets.json`, the report names
   the collision and asks you to merge or differentiate.
4. **New concepts ship with golden fixtures** (G3). A pack with no fixtures is
   rejected structurally — otherwise nothing measures whether it helped.

## Provenance classes and the theology line

`sources: [editorial]` marks an entry as **LH's own theological judgment**
rather than a claim of neutral data. That label is deliberate and load-bearing.

The engine still renders no theological verdicts: it reports that a curated
source names a passage for a concept, and says which source. Contested topics
(apologetics, denominational distinctives) are admissible precisely because
their provenance is visible — the dataset author is on record, and the system
is not pretending to arbitrate.

This is what keeps the "no theology scores, ever" commitment intact while
still letting the ontology carry conviction.

## Admitted sources (Phase 2)

| Source | Role | Rights |
|---|---|---|
| `editorial` | Hand-authored concepts, lexicons and anchors | LH-owned; AI-drafted offline, human-admitted |
| `openbible-topics` | Community-voted anchors, pulled in by `openbibleTopics:` | CC BY 4.0 |
| `openbible-xrefs` | Cross-reference expansion from concept anchors | CC BY 4.0 |
| `tsk` | Lineage-only — never cited by a row | PD (declared so OpenBible can express ancestry) |

Both OpenBible downloads are **rolling URLs with no archival versioning**, so
the checksum in each manifest *is* our snapshot. Re-downloading later produces
a different file that must be re-admitted through the gauntlet as a change.

Neither download contains verse text of any translation — references and
scores only — which is what makes them usable without touching the ESV
copyright that governs the website's display.
