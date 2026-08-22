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
export const ENGINE_VERSION = '0.11.0';

/**
 * Bumped independently of ENGINE_VERSION when the tokenizer changes, because
 * a tokenizer change invalidates precomputed corpus term profiles: the
 * pipeline and the runtime must tokenize identically or scoring silently
 * compares mismatched vocabularies. The pipeline stamps this into the
 * artifact and the engine refuses an artifact built with a different value.
 */
export const TOKENIZER_VERSION = '1.0.0';
