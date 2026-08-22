/**
 * THE shared tokenizer. Ported from LH Worship Setlist's
 * `src/lib/bible/keywords.ts`, which already solved the hard part: a stopword
 * list that covers KJV-era pronouns and verb forms, so modern lyric/query
 * vocabulary matches archaic scripture text without every `thou`/`hath`
 * polluting the result.
 *
 * "THE" is load-bearing. The build pipeline and the runtime MUST tokenize
 * identically — corpus term profiles are precomputed at build time, and a
 * runtime that stems differently would compare mismatched vocabularies and
 * silently return wrong rankings. That is why TOKENIZER_VERSION is stamped
 * into the artifact and verified on open, and why this module has no options
 * parameter: a per-caller tokenizer setting is exactly the bug it prevents.
 */

// Common English function words plus KJV-era pronouns/verb forms.
const STOPWORDS = new Set([
  // articles / conjunctions / prepositions
  'the', 'a', 'an', 'and', 'or', 'but', 'nor', 'for', 'so', 'yet',
  'of', 'in', 'on', 'at', 'to', 'by', 'with', 'from', 'up', 'down',
  'into', 'onto', 'over', 'under', 'after', 'before', 'between', 'through',
  'about', 'above', 'below', 'again', 'further', 'then', 'once', 'than',
  'as', 'if', 'because', 'while', 'until', 'unless', 'though', 'although',
  'out', 'off', 'not', 'no', 'too', 'very', 'just', 'also', 'only',
  'own', 'same', 'such',
  // pronouns
  'i', 'me', 'my', 'mine', 'myself',
  'we', 'us', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself',
  'they', 'them', 'their', 'theirs', 'themselves',
  'who', 'whom', 'whose', 'which', 'what', 'this', 'that', 'these', 'those',
  // verbs (be/have + modals)
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having',
  'will', 'would', 'can', 'could', 'may', 'might', 'must', 'shall', 'should',
  // NOTE: the do-family (do/does/did/doing/done) is deliberately ABSENT.
  // Setlist's list dropped it as auxiliary noise, which is correct for bare
  // overlap counting but wrong here: "doers of the word", "hearing and
  // doing", and "he who hears and does" are the exact theological vocabulary
  // this engine exists to match. Keeping it costs little, because unlike
  // Setlist we weight tokens statistically — a token this common earns a
  // near-zero IDF contribution and can never clear the G5 distinctiveness
  // floor to enter a passage term profile. Frequency is handled by
  // statistics; the stopword list is too blunt an instrument to decide which
  // verbs carry doctrine.
  // misc high-frequency function words
  'there', 'here', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'any', 'one', 'upon',
  'let', 'lest', 'yes',
  // KJV-isms
  'thee', 'thou', 'thy', 'thine', 'ye',
  'hath', 'hast', 'doth', 'dost', 'art', 'wilt', 'wouldst', 'shalt', 'shouldst',
  'unto', 'verily', 'behold', 'saith', 'whence', 'whither', 'hither', 'thither',
  'wherefore', 'forasmuch', 'peradventure', 'howbeit', 'thereof', 'thereto',
  'herein', 'wherein', 'whereof', 'thereby', 'hereby', 'hereof', 'whosoever',
]);

/**
 * Archaic verb forms folded to their modern stem BEFORE stemming, so a query
 * typed as "hearing and doing" can reach text that reads "he that heareth
 * these sayings of mine, and doeth them". Suffix stripping alone cannot do
 * this: `doeth` -> `doeth` under any -s/-ed/-ing rule.
 *
 * Deliberately a short, reviewed table of high-frequency forms rather than a
 * generative rule — `-eth`/`-est` stripping produces false merges (`death`,
 * `breath`, `harvest`) that would quietly corrupt term profiles. Growth of
 * this table is a reviewed change like any other data addition.
 */
const ARCHAIC_FORMS: ReadonlyMap<string, string> = new Map([
  ['doeth', 'do'], ['doest', 'do'],
  ['heareth', 'hear'], ['hearest', 'hear'],
  ['keepeth', 'keep'], ['keepest', 'keep'],
  ['believeth', 'believe'], ['believest', 'believe'],
  ['walketh', 'walk'], ['walkest', 'walk'],
  ['speaketh', 'speak'], ['speakest', 'speak'],
  ['loveth', 'love'], ['lovest', 'love'],
  ['giveth', 'give'], ['givest', 'give'],
  ['knoweth', 'know'], ['knowest', 'know'],
  ['maketh', 'make'], ['makest', 'make'],
  ['cometh', 'come'], ['comest', 'come'],
  ['seeketh', 'seek'], ['seekest', 'seek'],
  ['calleth', 'call'], ['callest', 'call'],
  ['dwelleth', 'dwell'], ['dwellest', 'dwell'],
  ['abideth', 'abide'], ['abidest', 'abide'],
  ['trusteth', 'trust'], ['trustest', 'trust'],
  ['worketh', 'work'], ['workest', 'work'],
  ['receiveth', 'receive'], ['sendeth', 'send'],
  ['buildeth', 'build'], ['heareth', 'hear'],
  ['obeyeth', 'obey'], ['forgiveth', 'forgive'],
]);

/**
 * Irregular and short-word lemmas that suffix stemming provably cannot reach.
 *
 * The stemmer refuses to cut below a 4-character stem — a necessary rule that
 * prevents `ties`->`t`, but one that silently strands the shortest and most
 * common verbs: `doing` (5-3 < 4), `does`, `done`, `heard`. Those are exactly
 * the words in "hearing and doing", so without this table the engine's
 * motivating query cannot match the text it is meant to find.
 *
 * Agent nouns fold to their verb (`doer` -> `do`) because "doers of the word"
 * and "he who does the word" are the same claim, and a search for one must
 * find the other.
 *
 * Reviewed table, not a generative rule: every entry is a deliberate merge,
 * because a wrong merge is invisible at query time and corrupts every term
 * profile built from it.
 */
const IRREGULAR_LEMMAS: ReadonlyMap<string, string> = new Map([
  // do-family: the concept "hearing and doing" lives or dies here
  ['does', 'do'], ['doing', 'do'], ['done', 'do'], ['did', 'do'],
  ['doer', 'do'], ['doers', 'do'],
  // hear-family: short forms and agent nouns
  ['heard', 'hear'], ['hearer', 'hear'], ['hearers', 'hear'],
  ['hears', 'hear'], ['hearken', 'hear'], ['hearkened', 'hear'],
  // other high-frequency irregulars whose stems fall below the 4-char floor
  ['said', 'say'], ['says', 'say'], ['saith', 'say'], ['sayings', 'say'],
  ['saying', 'say'], ['spoken', 'speak'], ['spoke', 'speak'],
  ['kept', 'keep'], ['keeps', 'keep'],
  ['gave', 'give'], ['given', 'give'], ['gives', 'give'],
  ['knew', 'know'], ['known', 'know'], ['knows', 'know'],
  ['built', 'build'], ['builds', 'build'],
  ['sought', 'seek'], ['seeks', 'seek'],
  ['stood', 'stand'], ['stands', 'stand'],
  ['fell', 'fall'], ['fallen', 'fall'], ['falls', 'fall'],
  ['obeys', 'obey'], ['obeyed', 'obey'],
]);

/** Light suffix stemming: -ing, -ies, -ed, -es, -s. Stem must stay >= 4 chars. */
function stem(word: string): string {
  if (word.endsWith('ing') && word.length - 3 >= 4) return word.slice(0, -3);
  if (word.endsWith('ies') && word.length - 3 >= 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith('ed') && word.length - 2 >= 4) return word.slice(0, -2);
  if (word.endsWith('es') && word.length - 2 >= 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length - 1 >= 4) {
    return word.slice(0, -1);
  }
  return word;
}

/** Split into lowercase word forms with punctuation and apostrophes removed. */
function rawWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['‘’‛ʼ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Normalize one surface form to its index token: archaic fold, then stem.
 * Words shorter than 3 characters and stopwords return null.
 */
export function normalizeToken(raw: string): string | null {
  // Length floor applies to the surface form, but AFTER lemma lookup, so
  // two-letter results of a deliberate merge (none today) stay reachable.
  if (STOPWORDS.has(raw)) return null;
  const modern = ARCHAIC_FORMS.get(raw) ?? raw;
  const lemma = IRREGULAR_LEMMAS.get(modern);
  if (lemma !== undefined) return STOPWORDS.has(lemma) ? null : lemma;
  if (raw.length < 3) return null;
  const stemmed = stem(modern);
  if (STOPWORDS.has(stemmed)) return null;
  return stemmed;
}

/**
 * Significant tokens in order of first occurrence, deduplicated. This is the
 * set form used for overlap scoring and concept-lexicon matching.
 */
export function significantWords(text: string): string[] {
  return significantWordsWithSurface(text).map((entry) => entry.token);
}

/**
 * The same significant-token set, each token paired with the SURFACE form it
 * was normalized from — the first raw word (lowercased, punctuation-stripped)
 * that produced it. Added for the spelling-correction citation (0.12.0/QR-5):
 * a correction chip must cite what the user actually typed ("beleived"),
 * never the stem the tokenizer made of it ("beleiv").
 *
 * This is a PAIRING, not a second tokenizer: `significantWords` delegates
 * here, the token stream is byte-identical to what it always was (invariance-
 * tested), and there is still no options parameter. TOKENIZER_VERSION stays
 * 1.0.0.
 */
export function significantWordsWithSurface(
  text: string,
): { token: string; surface: string }[] {
  const seen = new Set<string>();
  const result: { token: string; surface: string }[] = [];
  for (const raw of rawWords(text)) {
    const token = normalizeToken(raw);
    if (token === null || seen.has(token)) continue;
    seen.add(token);
    result.push({ token, surface: raw });
  }
  return result;
}

/**
 * Positional token stream: every significant occurrence, with the word index
 * it came from. Proximity scoring (intent 3) needs positions, which the
 * deduplicated form above deliberately discards. Positions are indices into
 * the raw word sequence, so distance survives dropped stopwords rather than
 * being compressed by them.
 */
export function tokenStream(text: string): readonly { token: string; position: number }[] {
  const stream: { token: string; position: number }[] = [];
  rawWords(text).forEach((raw, position) => {
    const token = normalizeToken(raw);
    if (token !== null) stream.push({ token, position });
  });
  return stream;
}

/** Exposed for gate tooling and tests; never mutate. */
export const TOKENIZER_STOPWORD_COUNT = STOPWORDS.size;
export const TOKENIZER_ARCHAIC_FORM_COUNT = ARCHAIC_FORMS.size;
export const TOKENIZER_LEMMA_COUNT = IRREGULAR_LEMMAS.size;
