/**
 * The engine version participates in the reproducibility contract:
 *
 *   (engineVersion, corpusFingerprint, layerFingerprint, query)
 *     -> identical ordering
 *
 * Any change that can alter ordering — weights, caps, tokenizer rules,
 * tie-breaks — MUST bump this in the same commit. Gate G2 fails a PR whose
 * ordering changed without a bump, so this is enforced, not merely asked for.
 */
// 0.9.0: query-coverage scaling, IDF-thin bare-concept cue demotion, and
// one-significant-word phrase fallback suppression. These alter ordering and reasons.
// 0.10.0: ranking fixes, staged on one branch and landed as one squash. Stage 1
// (sole-evidence floor): a result whose only evidence is translation_variant is
// capped at 6 points — below any honest text match — so a bag-of-stems hint can
// accompany but never hold #1 alone. Later 0.10.0 stages ride this same bump.
// 0.11.0 (QR-4): reference-grammar extension. Space-separated chapter/verse
// resolves ("John 3 16"); un-resolving books earn a cited did-you-mean
// suggestion (suggestion only, never auto-resolve); bare-number dead ends fall
// through to discovery; the verse-1 range-label defect is fixed ("John 3:1-5"
// no longer labeled "John 3"). Kind flips and label changes are
// results-visible, so this bumps in the same commit as the behavior.
// 0.12.0 (QR-5): deterministic cited spelling correction, with artifact
// schema v7 (spelling_terms/spelling_deletes precomputed by the pipeline;
// curated_aliases shipped empty for QR-6). research() discovery substitutes
// the unique in-policy correction for tokens in NO vocabulary — bounded
// integer Damerau under the ONE edit-policy table — and every substitution is
// cited (token chips + the additive `corrections` list). Substituted tokens
// change which verses surface and how they are explained, so this bumps in
// the same commit as the behavior and the schema.
// 0.13.0 (QR-6): curated phrase/hymn aliases (no schema bump — the
// curated_aliases table shipped EMPTY in v7 and the engine probes
// presence-and-rows). research() discovery matches the TYPED query's
// normalizedPhrase (stopwords kept) against curated_aliases by whole-string
// EQUALITY — never containment — and surfaces the target concept's own
// curated anchors (or the named verse range) under the existing
// concept_anchor family with a full attribution chip
// (`Hymn: "<title>" → Theme: <label>`). New evidence on alias-keyed queries
// is results-visible, so this bumps in the same commit as the behavior;
// non-alias queries are untouched by construction (equality matching).
// Rollback: rebuild the artifact without alias rows (the probe reverts
// behavior); an engine revert is a new version.
// 0.14.0 (CO-3 PR 2): passage-level grouping over the schema-v8 pericope
// tiling. discover() merges ungoverned results that are consecutive in rank,
// verseId-consecutive, and members of ONE derived pericope into a single
// passage row; the existing curated-anchor collapse is unchanged in its
// merge rule but both mechanisms now EXPLAIN the merge — merged rows carry
// additive `verses[]` (per-member evidence, uncollapsed) and a typed
// `grouping` naming the section span and its source (anchor sources for
// anchor runs, 'openbible-sections' + the summed boundary vote for pericope
// runs; grouping is not a Reason and contributes zero points). Authority
// order is fixed: an anchor-claimed verse never joins a pericope run.
// Merged pericope rows change which rows the default page shows, so this
// bumps in the same commit as the behavior. Rollback: rebuild the artifact
// without pericope rows (the presence-and-rows probe reverts the pericope
// path); an engine revert is a new version.
export const ENGINE_VERSION = '0.14.0';

/**
 * Bumped independently of ENGINE_VERSION when the tokenizer changes, because
 * a tokenizer change invalidates precomputed corpus term profiles: the
 * pipeline and the runtime must tokenize identically or scoring silently
 * compares mismatched vocabularies. The pipeline stamps this into the
 * artifact and the engine refuses an artifact built with a different value.
 */
export const TOKENIZER_VERSION = '1.0.0';
