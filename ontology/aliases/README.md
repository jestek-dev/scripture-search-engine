# Curated phrase/hymn aliases (QR-6)

Reviewed data, compiled into the artifact's `curated_aliases` table by
`pipeline/src/importers/aliasImporter.ts` + `pipeline/src/buildAliasLayer.ts`.

## What an alias is — and is not

An alias maps a **whole typed query** to a curated target: exactly one of a
curated concept (`concept:`) or an explicit verse range (`range:`), never
both, never neither (the schema enforces the XOR). Matching is **equality**
on `normalizedPhrase` (lowercase, punctuation folded, stopwords KEPT, no
stemming) — never containment. That equality line is what keeps this table
from becoming a hidden second ranking system: an alias can only answer the
exact line it names, and brittleness to extra words is accepted by design.

An alias is **not** a lexicon entry. Lexicon phrases are token sets and feed
ordinary concept matching; aliases exist precisely for the stopword-heavy
lines tokens cannot carry ("it is well with my soul" → `well soul`). Adding
an alias adds **no** tokens to any lexicon and cannot blur G4 distinctness.

An alias is **not** a fixture. Fixtures are the measurement; aliases are the
data. Every alias family ships with a golden fixture written FIRST
(`eval/golden/hymn-*.json`) pinning the full chip label, and a row with no
measured gap is not added (see the measured-out list in `hymn-lines.yaml`).

## Admission rules (enforced by the importer)

- `title`, `author`, `year`, `provenance` required per hymn — the
  public-domain evidence is per-row data, not folklore.
- Target concept must exist in `ontology/concepts`; ranges must parse.
- Phrases must normalize to **at least two raw words** — an alias may never
  become a bare-word trigger (the F5 class).
- `normalized_raw` must be unique across the whole pack set.
- Weights in (0, 1]: the editorial prior that the typed phrase names the
  hymn and the hymn names the target.

## Copyright posture (J37)

Starter pack is **PD-only**: pre-1930 US publication, provenance recorded
per hymn. Titles/short phrases are not copyrightable (Circular 33), but no
in-copyright hymn ships until Jesse rules J37 (title-only vs PD-only).
Hymnary.org's index is not openly licensed and is not used (J38).

Every row feeds the layer fingerprint per-record; changing any row moves the
artifact's layer identity (covenant 2).
