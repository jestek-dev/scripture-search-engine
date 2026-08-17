# Changelog — @jestek-dev/scripture-engine

Ordering-relevant changes bump `ENGINE_VERSION` in the same commit (gate G2
enforces this); the npm version ships in lockstep with it. Consumers pin
**both** the engine semver and an artifact descriptor — see the release notes
on each tag for the descriptor that goes with it.

## 0.9.0 — 2026-08-15

First published version since 0.7.1. **Includes the unpublished 0.8.0
breaking change below — read that entry before upgrading from 0.7.x.**

- **BREAKING (ordering + result shape):** bare `love` now defaults to the
  *God's love* concept, with the neighbor-love sense surfaced through the
  related-concept link rather than a second lexicon entry. Discovery results
  for `love` lead with Romans 5:8 / 8:38-39 / John 3:16.
- Concept-anchor evidence scales with query coverage: a concept matched by
  one word of a long query no longer outranks evidence matching the whole
  query.
- IDF-thin bare-concept cues are demoted and the one-significant-word phrase
  fallback is suppressed; reasons reported for these paths changed
  accordingly.
- Translation-neutral search: a verse can be found in the wording of ESV/NIV/
  NLT-style phrasing via the artifact's `verse_translation_tokens` index
  (schema 6). Requires a schema-6 artifact; the engine accepts schemas 1-6.
- Every provenance source is labeled; reason completeness is enforced in eval.

## 0.8.0 — 2026-08-08 — BREAKING, never published

- **BREAKING (ordering):** consecutive results carrying the same curated
  anchor span collapse into the one passage a human named — `communion`
  returns 1 Corinthians 11:23-26 as a single result instead of four verses at
  identical scores. Collapsed results keep the run's head `targetId`, report
  the range as their `reference`, and merge reasons by label (strongest
  kept).
- This version exists only in git history; no npm package or release tag was
  published for it. Anyone upgrading 0.7.x → 0.9.0 crosses this break.

## 0.7.1 — 2026-07-31

- First release published without a stored credential (npm trusted
  publishing via OIDC). No engine behavior change.

## 0.7.0 — 2026-07-30

- First published version: the full consumer API (`research`, `themes`,
  `passage`, `related`, `forSong`) over the whole-Bible artifact, with
  Layer B homiletical evidence.
- The initially published tarball contained no `dist/` (a pack without a
  build); the release workflow has guarded against that class ever since.
