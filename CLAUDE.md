# scripture-search-engine — working agreements

Read `README.md` first, then `docs/implementation-plan.md` for the phase you
are working in.

## Non-negotiables

1. **No AI at runtime.** AI may assist in building datasets offline; nothing
   AI-generated reaches the artifact without passing the gauntlet and a human
   PR merge. The runtime is statistics and lookups. No exceptions, no "just
   for this one intent".
2. **Determinism is the product.** `(engineVersion, corpusFingerprint,
   layerFingerprint, query)` must yield identical ordering on every platform.
   Three identities, because results change for three independent reasons:
   engine code, scripture text, and the curated layers. If you change anything
   that can alter ordering — weights, caps, tokenizer rules, tie-breaks —
   bump `ENGINE_VERSION` in the same commit. Gate G2 will catch you.
3. **The engine package does no I/O.** `ContentQueryPort` is the only seam.
   If you find yourself importing `node:fs` into `engine/`, the design has
   drifted.
4. **One tokenizer.** Pipeline and runtime must tokenize identically or
   precomputed term profiles compare mismatched vocabularies. Never add a
   per-caller tokenizer option.
5. **Explanations are part of the contract.** A result that ranks correctly
   but carries the wrong reason is a G3 failure, not a cosmetic bug.
6. **No theology scores.** The engine reports that a curated source names a
   passage for a concept, and says which source. It never adjudicates.

## Adding data

Never add data because it exists. Add it to close a *measured* gap:

1. Write the golden fixture first — the query you'd type and what should
   surface. A pack with no fixtures is rejected structurally.
2. Run the gauntlet. Read the Admission Report.
3. `NO MEASURABLE EFFECT` means don't merge. It is not a soft pass; it means
   the addition is weight without value.

## Gate discipline

A gate that cannot run reports `not-applicable` **with a reason**. Never let
an unrun check report `pass` — that is how a guardrail becomes decoration.

Thresholds live in `eval/budgets.json` as reviewed data. A threshold set to
`null` is deliberately unset until a real baseline exists; a guessed threshold
that never fires is worse than an absent one, because it reads as protection.

## Consumers

Maskil, LH Worship Setlist, and Versed pin `(engine semver, artifact
descriptor)`. Changes here ripple to three apps — check the consumer contract
in `docs/implementation-plan.md` §5 before changing a public type.
