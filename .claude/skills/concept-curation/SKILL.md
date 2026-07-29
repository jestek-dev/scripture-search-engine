---
name: concept-curation
description: Add or strengthen theological concept coverage in the scripture search engine. Use when the user wants the engine to understand a topic it currently misses — e.g. "strengthen coverage for evangelizing to Mormons", "add concepts about lament", "the engine misses X". Also use to ingest a new public-domain exposition source or audit whether a source is still paying for itself.
---

# Concept curation

You are adding data to a deterministic search engine that many people will
trust to find Scripture. The bar is not "plausible" — it is "defensible, with
the source named".

## The one rule that matters

**Fixtures before data. Always.**

An addition that closes no measured gap is weight without value, and merging
it is how a corpus bloats past the point of diminishing returns. The
Admission Report's `NO MEASURABLE EFFECT` verdict exists to catch exactly
that, and it will catch you.

## Workflow

### 1. Understand the gap — ask, don't assume

Get from the user:
- the **queries they would actually type** (their words, not your paraphrase)
- the **passages that should surface** for each
- whether this is their **theological conviction** or **neutral consensus** —
  this determines provenance, and getting it wrong is the one genuinely
  dishonest thing you can do here

Do NOT proceed on a topic alone. "Evangelizing to Mormons" is a subject; "if
someone says works are required for salvation, what do I show them?" is a
query. The engine matches queries.

### 2. Write the fixture FIRST

Create `eval/golden/<slug>.json`:

```json
{
  "id": "evangelism-mormon",
  "query": "grace not works salvation",
  "status": "pending",
  "expectedTop": [
    { "reference": "Ephesians 2:8-9", "requiredReasonFamily": "concept_anchor" }
  ],
  "expectedWithinTop": 10,
  "mustNotRank": [{ "reference": "Genesis 5:1", "why": "no thematic relation" }]
}
```

Start `pending`. Run `npm run gauntlet` — it should show the fixture failing
(as pending, not blocking). **If it already passes, stop: the engine does not
have this gap, and you were about to add data for nothing.** Tell the user.

### 3. Check for collisions BEFORE drafting

Read every file in `ontology/concepts/`. If an existing concept covers this
ground, **extend it** rather than adding a neighbour. G4 will reject a
near-duplicate anyway, and a merge you make deliberately is better than one
the gate forces on you.

Near-duplicate concepts are the single most likely way a well-meaning
addition degrades this system: their lexicons collide, and anchors dilute
across two half-firing concepts.

### 4. Draft the concept pack

One YAML file per concept in `ontology/concepts/` (schema: `ontology/README.md`).

Requirements:
- **≥ 2 lexicon entries**, phrased the way people search, not the way
  systematic theology indexes. "saved by grace" beats "soteriological
  monergism".
- **Anchors with honest provenance.** `sources: [editorial]` means LH's own
  theological judgment and will render as "LH editorial" in the result chip.
  Use it for anything contested. Only cite `openbible-topics` via
  `openbibleTopics:`, which pulls community-voted passages — never hand-label
  your own anchors with someone else's source.
- **`related:`** edges to genuine neighbours. These become weak evidence, so
  a wrong edge is cheap but not free.

### 5. Run the gauntlet and read the verdict

```bash
npm run verify
```

- **REJECT** — fix what it names. Do not adjust thresholds in
  `eval/budgets.json` to make a rejection go away; that is disabling the
  guardrail, not satisfying it. If a threshold is genuinely wrong, say so to
  the user explicitly and change it in its own commit with reasoning.
- **G8 churn on unrelated probes** — your concept is too broad and is
  reshaping searches it has nothing to do with. Narrow the lexicon.
- **NO MEASURABLE EFFECT** — do not merge. Report it.
- **ADMIT** — flip the fixture to `"status": "active"` and re-run to confirm
  it passes as an active fixture.

If the churn is intended (new concepts SHOULD move the lists they were
written for), re-baseline with `npm run gauntlet -- --update-baseline` and
say so in the commit message, naming which probes moved and why that is
correct.

### 6. Report honestly

Tell the user:
- what now surfaces that did not before, with the actual reason chips
- what the gates said, including anything you accepted
- anything you were unsure about theologically — you are drafting, they are
  admitting

## Ingesting a new exposition source

For public-domain commentaries and sermons (alignment tier 1 — works that
state their text explicitly):

1. Verify rights per `pipeline/manifests/*.json` conventions. **Prefer
   Project Gutenberg's proofread text over Archive.org OCR** where both
   exist; 19th-century typography produces garbage that poisons every profile
   built from it. Avoid sources whose *transcription* carries a claim (CCEL's
   non-commercial terms) unless capped below `public_distribution`.
2. Write the manifest with checksum, license record, and method note.
3. Extend `pipeline/scripts/generateExpositionSubset.ts` for the new volume.
4. **Read the G9 saturation number.** If profiles barely moved, this source is
   saturated — say so and stop. More works by the same author on the same
   passages buy nothing. Reach for a different author, or a different book.

## What you must never do

- Never invent an anchor you cannot defend from the text.
- Never label your own theological judgment as a neutral source.
- Never relax a gate threshold to make your own addition pass.
- Never add a concept without a fixture.
- Never let AI-drafted content reach the artifact without the user's merge —
  the covenant is no AI at RUNTIME, and it holds only because a human admits
  every row.
