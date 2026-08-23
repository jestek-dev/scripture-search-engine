/**
 * UNIVERSE-VERSION and the committed SEED (MS-2).
 *
 * UNIVERSE_VERSION marks every historic universe: any change that alters
 * compiled output — a grammar edit, a cap change, a word-list row, a PRNG
 * tweak — bumps it in the same commit, the ENGINE_VERSION discipline applied
 * to test data. The SEED is committed so any queryId is re-derivable by
 * anyone from the repo alone.
 */
export const UNIVERSE_VERSION = '1.0.0';

export const UNIVERSE_SEED = 'scripture-sweep-universe-v1';
