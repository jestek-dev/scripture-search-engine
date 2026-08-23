# Compatibility — engine semver × artifact schema

Consumers pin **both** halves of the identity: the engine semver and an
artifact descriptor. This document is the matrix that says which engine opens
which artifact schema, what happens at every mismatch, and which API surface
the pin actually covers. It is maintained with the code it describes: a
schema-acceptance change lands with its row here in the same train
(P7.2 / CO-5).

## The public API tier

The stable surface — the one this document's promises attach to — is the
package's root entry, `@jestek-dev/scripture-engine`:

- `createEngine(port: ContentQueryPort, opts?: EngineOptions)` — the only
  constructor, over the only I/O seam. The engine itself does no I/O; the
  consumer supplies the port (OP-SQLite on device, `node:sqlite` in tooling).
- The five methods on `ScriptureEngine`: `research`, `themes`, `passage`,
  `related`, `forSong`.
- The result types those methods return, including the additive citation
  fields: `suggestion?` (0.11.0 — cited did-you-mean on invalid-reference
  kinds), `corrections?` (0.12.0 — machine-readable spelling-correction
  citations), and `verses?`/`grouping?` (0.14.0 — explained passage-level
  grouping).
- `ENGINE_VERSION` and `TOKENIZER_VERSION`.

Everything else is published under `@jestek-dev/scripture-engine/internal`
and carries **no stability promise**: names there may move or disappear in
any version, without a major bump and without consumer notice. The internal
entry exists for this repository's own pipeline/eval/workbench (one
tokenizer, shared reviewed constants) and for white-box diagnostics. If your
app imports from `/internal`, your pin does not protect you.

The exact public surface is enforced in CI
(`eval/test/public-surface.test.ts`): the value exports are asserted exactly,
and compile-time probes fail the build if an internal symbol becomes
reachable from the root entry. Versions 0.7.x exported the internal surface
from the root entry; the split lands in 0.14.0 — upgrading from 0.7.x, any
import outside the tier above must move to `/internal` or be dropped.

## Error semantics (typed kinds, fail-closed openings)

- **Opening an artifact fails loudly, never quietly.** `createEngine` throws
  when the artifact's `schema_version` is outside the engine's supported set
  (the message names both: `artifact schema vN is not supported by engine
  X.Y.Z (supports …)`), and — by default — when the artifact was tokenized
  by a different `TOKENIZER_VERSION` (postings from another tokenizer would
  yield quietly wrong rankings; `enforceTokenizerVersion: false` exists for
  diagnostics only). Verify the descriptor's `databaseSha256` before opening;
  the engine assumes an identity you have confirmed.
- **Invalid input at query time is a typed kind, never an exception.**
  `research()`, `passage()` and `related()` return typed invalid-reference
  outcomes; consumers render them. An invalid-reference outcome MAY carry
  `suggestion? { book, reference, distance }` — a cited did-you-mean the
  engine never auto-resolves. A `research()` discovery outcome MAY carry
  `corrections? [{ typed, corrected, distance }]` — present iff an
  out-of-vocabulary token was substituted, mirrored in the visible chips.
  Absence of either field needs no handling.
- **Newer engine over an older (still-supported) schema degrades per
  feature, silently and deterministically.** Each schema-fed feature guards
  on a presence-and-rows probe of its own table: over a v6 artifact, 0.12.0+
  simply never corrects spelling; over a pre-v8 artifact (or an emptied
  `pericopes` table) the pericope grouping arm never fires; v9's
  `cross_reference_phrases` is read by no code path yet. Rebuilding without
  a feature's rows IS that feature's rollback.
- **Older engine over a newer schema refuses** via the supported-set check
  above — by design. A pinned `(engine, descriptor)` pair keeps working;
  upgrading either half is an explicit re-pin of both.

## The matrix

Published = an npm package + release tag exists. Unpublished versions exist
only in git history (the 0.8.0 precedent, extended: nothing between 0.7.1 and
the terminus was ever tagged); anyone upgrading across them crosses their
changes at once — read `engine/CHANGELOG.md` top to bottom from your pinned
version.

| Engine | Accepts artifact schemas | Published | Notes |
|---|---|---|---|
| 0.7.0 | v1–v5 | yes | First published version. |
| 0.7.1 | v1–v5 | yes | No behavior change from 0.7.0. Refuses v6+ by design. |
| 0.8.0 | v1–v5, then v1–v6 late in its window | never | Breaking ordering change (anchor-run collapse). v6 acceptance (`verse_translation_tokens`) landed while the tree said 0.8.0; 0.9.0 is the version that documents the feature. |
| 0.9.0 | v1–v6 | never | Translation-neutral search over a v6 artifact; over v1–v5 the variant index simply isn't there. |
| 0.10.0 | v1–v6 | never | Ranking overhaul; no schema change. |
| 0.11.0 | v1–v6 | never | Reference grammar + `suggestion?`; book-alias rows are corpus data, not a schema change. |
| 0.12.0 | v1–v7 | never | Schema v7 adds `spelling_terms`/`spelling_deletes` (+ empty `curated_aliases`). Over v6: never corrects, byte-identical to 0.11.0 behavior. |
| 0.13.0 | v1–v7, then v1–v8 late in its window | never | Hymn aliases fill v7's `curated_aliases` (no schema bump; rowless = 0.12.0 behavior). v8 acceptance (`pericopes`) landed mid-window with zero ordering change. |
| 0.14.0 | v1–v9 | terminus candidate | Pericope grouping consumes v8. **v9 is capability-only**: `cross_reference_phrases` (TSK-derived) is accepted and read by no code path — a v9 artifact ranks byte-identically to a v8 one; the consuming behavior is gated behind a future `ENGINE_VERSION` bump. |

The authoritative supported set is `SUPPORTED_SCHEMA_VERSIONS` in
`engine/src/createEngine.ts`; this table restates it per version and CI keeps
the current row honest (`eval/test/release-contract.test.ts`,
`eval/test/public-surface.test.ts`).

## What a schema version is

The artifact's `meta.schema_version` names the shape of the SQLite artifact
(tables + their contracts), independent of its contents. Schema bumps are
additive-table events; content changes (new corpus text, new curated layers)
move `corpusFingerprint`/`layerFingerprint` instead, and ordering-relevant
engine changes move `ENGINE_VERSION`. The determinism identity is the triple
`(engineVersion, corpusFingerprint, layerFingerprint)` — see `README.md`.
