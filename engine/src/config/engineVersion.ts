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
export const ENGINE_VERSION = '0.8.0';

/**
 * Bumped independently of ENGINE_VERSION when the tokenizer changes, because
 * a tokenizer change invalidates precomputed corpus term profiles: the
 * pipeline and the runtime must tokenize identically or scoring silently
 * compares mismatched vocabularies. The pipeline stamps this into the
 * artifact and the engine refuses an artifact built with a different value.
 */
export const TOKENIZER_VERSION = '1.0.0';
