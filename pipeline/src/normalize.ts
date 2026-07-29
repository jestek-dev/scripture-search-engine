// Matches a leading "I"/"II"/"III" token that is a whole word (followed by
// whitespace or end-of-string), so it only fires on a genuine roman-numeral
// book prefix ("I Chron", "II Chron 7:14") and never mid-word ("Isaiah",
// "Iii" isn't a thing, but the lookahead guards it anyway).
const ROMAN_PREFIX_RE = /^(iii|ii|i)(?=\s|$)/;
const ROMAN_TO_ARABIC: Readonly<Record<string, string>> = { i: "1", ii: "2", iii: "3" };

/**
 * Rewrites a leading roman-numeral book prefix ("I ", "II ", "III ") to its
 * arabic equivalent ("1 ", "2 ", "3 ") before punctuation-stripping runs, so
 * "I Chron" and "1 Chron" converge on the same normalized key even though
 * "Chron" (without "I"/"1") isn't itself a registered alias for anything.
 * Must run on an already-lowercased string — the regex is case-sensitive
 * on purpose so it can't accidentally match inside a longer lowercase word.
 */
function romanPrefixToArabic(lowercased: string): string {
  return lowercased.replace(ROMAN_PREFIX_RE, (m) => ROMAN_TO_ARABIC[m]!);
}

/**
 * Shared normalisation used by both the book alias table (construction) and
 * book lookup (matching), so aliases can never drift from the matcher.
 *
 * Lowercases, rewrites a leading roman-numeral prefix (I/II/III) to its
 * arabic digit, then strips everything except letters and digits. This
 * means punctuation, spaces, and periods are all removed, and "1 Cor.",
 * "1Cor", "1 cor", and "I Cor" all collapse to the same key.
 */
export function normalizeBookKey(input: string): string {
  // Trim before the roman-numeral check: ROMAN_PREFIX_RE is anchored to the
  // start of the string, so leading whitespace ("  I Chron") would
  // otherwise hide the prefix from it.
  return romanPrefixToArabic(input.trim().toLowerCase()).replace(/[^a-z0-9]/g, "");
}
