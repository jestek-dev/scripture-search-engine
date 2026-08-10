# Remembered phrasings — measuring the gap before filling it

**Date:** 2026-08-08
**Status:** Implemented, small. **The headline is that the gap is far narrower
than `NEEDS-JESSE` §1.6a assumed** — 8 real misses out of 60 phrasings tested,
not the ~50-entry pack the audit plan proposed. This note is the measurement
and the reasoning; the pack itself is 6 lexicon entries on existing concepts
plus 2 new concepts.

---

## 1. What §1.6a established, and what it missed

The prior finding was correct as far as it went: the wordings people remember
are NIV and ESV, those are copyrighted, and **no public-domain translation will
ever close that gap** — adding KJV was measured and fixed nothing. Layer A is
the right mechanism.

What was not measured was **how many remembered phrasings actually fail**. The
earlier check sampled ten. That is enough to prove the gap is real; it is not
enough to size a pack. So before writing anything, all 60 candidate phrasings
were run against the engine and scored on whether the target verse appeared in
the top 10.

## 2. Result: 52 of 60 already work

The lexical ladder is doing far more than expected. Archaic folding, stemming,
IDF weighting and proximity between them recover most remembered wordings even
when the WEB's phrasing differs, because the *content* words usually survive
translation:

| Remembered wording | WEB wording | Result |
|---|---|---|
| "lean not on your own understanding" | "don't lean on your own understanding" | rank 1 |
| "soar on wings like eagles" | "mount up with wings as eagles" | rank 1 |
| "his mercies are new every morning" | "they are new every morning" | rank 1 |
| "though your sins are like scarlet" | "though your sins be as scarlet" | rank 1 |
| "go and make disciples of all nations" | "make disciples of all nations" | rank 1 |
| "put on the full armor of God" | "put on the whole armor of God" | rank 1 |

That is the same mechanism §1.6a's own table showed working for 5 of 10 — it
just holds much more widely than the sample suggested.

## 3. The 8 real gaps

| Remembered wording | Target | Before | Why it missed |
|---|---|---|---|
| "plans to prosper you" | Jeremiah 29:11 | absent | WEB: "thoughts of peace, and not of evil" — no shared content word |
| "confidence in what we hope for" | Hebrews 11:1 | rank 23 | WEB: "assurance of things hoped for" |
| "cast all your anxiety on him" | 1 Peter 5:7 | rank 21 | WEB: "casting all your worries on him" |
| "you must be born again" | John 3:3 | absent | WEB: "born anew" |
| "abide in me" | John 15:4 | absent | WEB: "Remain in me" |
| "let us not give up meeting together" | Hebrews 10:25 | absent | WEB: "not forsaking our own assembling together" |
| "consider it pure joy" | James 1:2 | rank 23 | WEB: "Count it all joy" |
| "do to others as you would have them do to you" | Matthew 7:12 | absent | **see §5 — unfixable** |

The pattern is consistent: a miss happens when the modern rendering replaces
the *content* words, not just the function words. "prosper" vs "peace",
"anxiety" vs "worries", "abide" vs "remain".

## 4. What was built

Six lexicon entries were added to concepts that already own the theme, each
with the anchor the remembered wording renders, tagged `editorial`:

| Concept | Phrasing | Anchor |
|---|---|---|
| `hope-in-god` | plans to prosper you | Jeremiah 29:11 |
| `hope-in-god` | confidence in what we hope for | Hebrews 11:1 |
| `peace-of-god` | cast all your anxiety on him | 1 Peter 5:7 |
| `salvation` | you must be born again | John 3:3 |
| `joy-in-the-lord` | consider it pure joy | James 1:2 |
| `loving-others` | the golden rule / treat others the way you want to be treated | Matthew 7:12 |

Two phrasings had no honest home and became concepts of their own:

- **`abiding-in-christ`** (John 15:4, 15:5, 15:7). Not folded into
  `presence-of-god`, which is about God drawing near to us, nor into
  `walking-in-the-light`, which Jesse scoped to ethical conduct on 2026-07-29.
  Abiding is a third thing, and blurring it would undo a decision already made.
- **`gathering-together`** (Hebrews 10:24-25, Matthew 18:20, Acts 2:42).
  `walking-in-the-light` carries "fellowship with one another" but is likewise
  scoped to conduct. The assembling of believers is also directly useful to
  three apps that plan gatherings.

**On provenance:** every entry is `sources: [editorial]`. Saying "this remembered
wording means this verse" is mostly a translation-identity fact, but it is *our*
assertion, and the result chip will say so rather than laundering it through a
neutral-looking source id.

## 5. One gap that cannot be closed, and should not be pretended away

**"do to others as you would have them do to you" is entirely stopwords.**
Every word — do, to, others, as, you, would, have, them — is on the stopword
list, so the query normalizes to nothing and returns nothing, exactly like the
`adversarial-common-only` probe. No lexicon entry can fix it, because there is
no token to match on.

The ontology compiler caught this at build time when the phrase was first
committed as a lexicon entry, which is the check working as intended. The
matchable phrasings "the golden rule" and "treat others the way you want to be
treated" were used instead, and both reach Matthew 7:12.

The underlying limit stands and is worth knowing: **any query made entirely of
function words is unreachable by design.** The Golden Rule is the most-quoted
example in Scripture.

## 6. Measured effect

- **G3:** 34 corpus fixtures hold. Each remembered phrasing is asserted as an
  `additionalQuery` on its host concept's fixture, so a regression surfaces as
  a failed fixture rather than as a quiet return to zero results.
- **G4 collision:** 34 concepts remain mutually distinct — the two new ones do
  not collide with `presence-of-god`, `walking-in-the-light` or `worship`.
- **G8 noise:** **0% churn.** The pack adds reach without displacing anything,
  which is what a well-scoped concept addition should look like.
- **G5/G9/G10/G11:** unaffected (no Layer B or corpus change).

## 7. Recommendation to Jesse

The §1.6a proposal was "a pack covering the top ~50 most-searched verses". **Do
not build that.** Fifty-two of sixty tested phrasings already work, so most of
that pack would be `NO MEASURABLE EFFECT` — weight without value, by this
repo's own rule. What is here is the measured remainder.

If you want to extend it, the productive method is the one used here: test
candidate phrasings against the engine first, and write entries only for the
ones that actually miss. The failing pattern to look for is a modern rendering
that swaps the *content* words, not merely the grammar.

Two things need your review rather than mine:

1. **The two new concepts** (`abiding-in-christ`, `gathering-together`) — their
   anchors are claims about meaning, which is your call.
2. **`joy-in-the-lord` now anchors James 1:2** ("consider it pure joy" —
   joy *in trials*). That is a real nuance inside a concept otherwise about joy
   in God's presence. Defensible, but you may prefer it split out.
