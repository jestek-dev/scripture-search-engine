# Changelog — @jestek-dev/scripture-engine

Ordering-relevant changes bump `ENGINE_VERSION` in the same commit (gate G2
enforces this); the npm version ships in lockstep with it. Consumers pin
**both** the engine semver and an artifact descriptor — see the release notes
on each tag for the descriptor that goes with it.

## Entry format

Every `ENGINE_VERSION` that has ever existed in the tree has one entry here,
newest first, written in the same commit train that made the change:

- Heading: `## <version> — <YYYY-MM-DD> — <status>`, where `<version>` is the
  bare semver (`0.14.0`, no `v` prefix), the date is the day the bump commit
  landed, and `<status>` is either free text for an unpublished version
  (`unreleased`, `never published`, …) or absent once the tag is pushed and
  the date becomes the publish date.
- Body: what changed *as it is true of the code* — ordering changes labeled
  as such, result-shape additions named field-by-field, schema-acceptance
  changes stated per version. No forward-looking claims.
- Versions that ship only as history inside a later tag (an unpublished bump
  a consumer crosses when upgrading) keep their entries permanently and are
  called out from the first published entry above them.

The release workflow refuses to publish a version that has no entry under
this format (`.github/scripts/changelog-guard.mjs`) — an unchangelogged
version cannot ship.

## 0.14.0 — 2026-08-22 — unreleased

- **Ordering + result shape: passage-level pericope grouping.** Consecutive
  discovery hits — adjacent in rank AND verse-consecutive within one chapter,
  and not governed by any curated anchor span — that fall inside a single
  derived OpenBible section merge into one passage-level result. The merge is
  explained, not silent: the merged row carries a typed `grouping` field
  naming the section and its provenance (`openbible-sections` plus the summed
  boundary vote read from the artifact row the derivation stored), and
  `verses` (per-member evidence, uncollapsed). Grouping contributes zero
  points: the merged score is the max of the members, never a sum, and the
  row's reference spans the hits, never the whole section. `verses?` and
  `grouping?` are additive result-shape fields (§5 consumer contract).
- Curated anchor-span collapse keeps its 0.10.0 span-membership semantics
  unchanged and always takes precedence: an anchor-claimed verse never joins
  a pericope run. Anchor merges now also explain themselves (the anchor's own
  ascending-joined sources).
- Grouping requires pericope rows (schema v8): over a v7-shaped artifact, or
  one whose `pericopes` table is empty, the presence-and-rows probe reads
  false and behavior reverts to the 0.13.0 anchor-only collapse — rebuilding
  without pericope rows is the rollback.
- **Schema acceptance is now v1–v9.** v8 (`pericopes`) acceptance landed
  during 0.13.0's window with zero ordering change; v9
  (`cross_reference_phrases`, TSK-derived) is capability-only — no engine
  code path reads the table yet, so a v9 artifact ranks byte-identically to
  a v8 one. The behavior that will consume the phrase keys is gated behind a
  future `ENGINE_VERSION` bump.

## 0.13.0 — 2026-08-22 — unreleased

- **Ordering: curated hymn aliases.** A typed hymn title or first line maps
  to the hymn's curated scriptural home, by whole-query equality on the
  normalized phrase (stopwords kept, no stemming — never containment).
  Evidence rides the existing concept-anchor family with attribution:
  `Hymn: "<Title>" → Theme: <Concept>` (alias weight × anchor weight; the
  alias never outranks the anchor curation) or `Hymn: "<Title>"` for the
  verse-range arm; provenance source `hymn-aliases` ("LH editorial
  (public-domain hymn index)"). Starter pack: 6 public-domain hymns, 15 rows.
- Measured battery effect: exactly one of 84 rows changed — `it is well with
  my soul` now leads with Jeremiah 29:11 under the hymn chip (previously a
  bag-of-words Psalms 139:14), and the harmful Jeremiah 4:10 lead is gone.
- Alias rows live in the v7 schema's `curated_aliases` table (shipped empty
  by 0.12.0) — no schema bump; a rowless artifact behaves exactly as 0.12.0
  (presence-and-rows probe; rollback = rebuild without rows).
- Late in this version's window the engine also began accepting schema v8
  (`pericopes` table read and wired, zero ordering change); the grouping
  behavior that consumes it is 0.14.0.

## 0.12.0 — 2026-08-22 — unreleased — schema v7

- **Ordering + result shape: deterministic cited spelling correction.** A
  typed token found in NO vocabulary (corpus tokens, book aliases, lexicon
  tokens, translation tokens, Layer B verse terms — the last is gate-only:
  a verse-terms-only word is IN vocabulary and never rewritten, but is never
  proposed AS a correction; correction targets are exactly the first four
  origins) is corrected via a precomputed delete-variant
  lookup verified by bounded Damerau-Levenshtein, under the one edit-policy
  table shared with reference did-you-mean: normalized tokens under 5
  characters never correct; 5–8 allow distance 1; 9+ allow distance 2; a
  transposition counts 1. An in-vocabulary token is never rewritten. Winner
  selection is a total order (distance asc, document count desc, term lex
  asc) — row-order independent.
- Scope: `research()` discovery only. `themes()` stays exact-curated,
  `forSong()` never corrects, and reference parsing short-circuits first.
- Every correction is visibly cited on every affected result — chips read
  `<term> (corrected from "<typed>")` with the typed surface form — and
  results carry a machine-readable `corrections` list (additive §5 field).
- **Schema v7:** `spelling_terms` + `spelling_deletes`, precomputed offline
  from bytes the artifact already ships (no new source, no AI); the
  `curated_aliases` table lands empty with its concept-XOR-verse-range CHECK.
  This engine accepts schemas 1–7; over a v6 artifact it presence-probes the
  spelling tables and simply never corrects (proven byte-identical to
  pre-spelling behavior). Engines ≤0.11.0 refuse a v7 artifact by design.

## 0.11.0 — 2026-08-22 — unreleased

- **Result-kind + label changes: reference-grammar extension.** The reference
  parser becomes an ordered candidate grammar that commits to the first
  candidate whose book resolves — the first candidate is exactly the
  pre-0.11.0 parse, so every previously-resolving input is preserved
  bit-for-bit, and the new space-separated chapter/verse forms (`John 3 16`,
  `1 corinthians 13 4`, `John 3 1-5`) fire only where yesterday was a dead
  end.
- Cited did-you-mean: when no candidate's book resolves, a unique winning
  book within the edit-policy table (under 5 characters never; 5–8 edit
  distance 1; 9+ distance 2; transposition = 1) yields an additive
  `suggestion? { book, reference, distance }` on all three invalid-reference
  kinds. Suggestion only, never auto-resolve; the suggested locator is
  validated through the exact resolution path it invites, so a suggestion
  never names a passage that cannot exist.
- Bare-number shapes with no resolvable book fall through to discovery
  (`plans 29 11` reaches search instead of erroring); explicit-separator
  queries keep their typed invalid-reference result.
- Range-label fix (explanations are contract): `John 3:1-5` and `John 3 1-5`
  both label `John 3:1-5` (previously mislabeled `John 3`), and
  single-chapter-book ranges label honestly (`Jude 1-5` → `Jude 1:1-5`);
  genuine whole-chapter parses keep the `Book C` form.

## 0.10.0 — 2026-08-21 — unreleased — ranking overhaul

Seven coordinated ranking stages plus display polish; **ordering changes
throughout** (one version bump for the whole train):

- Sole-evidence floor: a result whose every surviving reason family is named
  in the reviewed cap map has its total capped — in practice a lone
  `translation_variant` caps at 6 points, so a bag-of-stems vocabulary hint
  can accompany but never overrule an honest text match. Corroborated
  results are untouched by construction.
- Bare-cue width is measured in significant tokens: a stopword-heavy lexicon
  phrase that normalizes to one token no longer evades the thin-cue gate.
- Exact-phrase taper, complete-match subsumption, curated tie-break,
  full-query parity: whole-query verbatim authority is measured in
  significant words (under 2 files as token overlap; 2 earn 2/3 authority;
  3+ keep full authority); a COMPLETE whole-query exact-phrase match drops
  its redundant same-token token-overlap/proximity chips; at an exact score
  tie between authoritative results, the curated-anchored one orders first;
  concept specificity is 1 when the matched phrase covers every significant
  query token.
- Same-concept cross-reference suppression: cross-reference edges into
  verses that are themselves anchors of the seeding concept are suppressed —
  the same curated consensus is no longer walked one hop and stacked as
  independent corroboration.
- `passage_terms` PMI factor: the stored PMI sum (previously carried but
  never used) now scales the chip through a strictly monotone, bounded
  asymptotic factor — distinct associations no longer tie.
- Anchor dedupe + span-membership collapse: one verse, one concept, one
  scored contribution, with agreeing sources merged into one
  ascending-joined chip; the curated span is the collapse unit wherever its
  verses rank (`praise` returns Psalms 150:1-6 once instead of five verse
  rows at identical scores).
- Chip display polish (display-only by construction — runs after ranking and
  the cut, never touches points): variant chips pinned to their matched
  stems, chips that would render 0.0 suppressed, a `passage_terms` display
  floor derived from the admission floor; a result always keeps at least its
  strongest chip.

## 0.9.0 — 2026-08-08 — never published

Never published: no v0.9.0 tag or package exists, and none will — nothing
between 0.7.1 and the terminus was ever tagged (`docs/COMPATIBILITY.md`), so
anyone upgrading from 0.7.x crosses this version inside a later release.
**Includes the unpublished 0.8.0 breaking change below — read that entry
before upgrading from 0.7.x.**

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
  Engines up through 0.7.1 support schemas 1-5 only, so they refuse a
  schema-6 artifact by design — a pinned `(0.7.1, v0.7.1 descriptor)` pair
  keeps working; upgrading is an explicit re-pin of both halves.
- Every provenance source is labeled; reason completeness is enforced in eval.
- Release channel (ships with, not in, the package): this version's window
  landed the promote-only release flow — the artifact is CI-minted and
  promoted without a rebuild, and the descriptor names its own `release.tag`
  — closing the v0.7.1 asset/descriptor split forward (decision record:
  `docs/reviews/2026-08-21-ship-forward-v090.md`; v0.7.1's published assets
  stay untouched). With 0.9.0 itself never tagged, the first release
  actually published under that flow is the terminus release. The artifact embeds OpenBible.info data (CC BY 4.0);
  consumer apps surface the attribution per `docs/ATTRIBUTIONS.md`.

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
