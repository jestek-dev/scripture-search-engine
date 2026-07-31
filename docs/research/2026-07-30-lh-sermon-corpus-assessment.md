# Lighthouse sermon corpus — assessment

**Date:** 2026-07-30
**Corpus:** 423 sermons, 2018–2026, `LH Sermons json` (376 MB)
**Verdict:** **Do not ingest.** Measured rather than assumed — three
independent reasons below, each with numbers.
**Status:** Synthesis **PAUSED** at Jesse's direction. Nothing from this corpus
has been admitted. The repository is unchanged apart from this document and one
reusable analysis script.

---

## 1. What the corpus actually is

Not transcripts — **YouTube auto-generated captions** (`.json3`, one file per
video, ASR confidence scores per word). No punctuation, no speaker field, no
scripture metadata, real recognition errors, and roughly half of each file is
service material rather than sermon: welcome, announcements, music, prayer,
holiday anecdotes.

- 3.78 million words across 423 files
- ~44,700 characters per sermon

**Rights are not the issue.** This is Lighthouse's own material,
`rightsClass: owned`. Nothing here is a licensing objection.

## 2. What was tested

Three uses were proposed. All three were measured.

### 2a. Layer B evidence via spoken citations — FAILS

Preachers say the reference aloud, so it should be minable. It is, but not
precisely enough:

| detected across 423 sermons | count | share |
|---|---|---|
| references found | 2,194 | 5.2 per sermon |
| **verse-level** ("Jeremiah 29 **verse 11**") | **73** | **3%** |
| chapter-only ("Jeremiah 29") | 1,603 | 73% |
| ambiguous book (no "first"/"second") | 518 | 24% |

Layer B keys on verses. A chapter-only reference spreads vocabulary across ~30
verses and is discounted to near-nothing by span scoring. Only 12% of
ambiguous-book mentions carry an ordinal, so "Corinthians 13" cannot be
resolved — and the Treasury parser's rule applies: reject rather than guess,
because commentary attached to the wrong passage is a silent, unrecoverable
error.

### 2b. Recovering remembered NIV/ESV phrasings — FAILS, structurally

The hope: searching *"plans to prosper you"* returns nothing because that is
NIV wording and the corpus is WEB. Sermons contain the NIV phrasing, so mine it.

The phrasings are genuinely present — all seven tested appear, including the
five that neither WEB nor KJV contains. A miner was built: 18,751 candidate
phrase-to-verse pairs, 1,110 recurring across two or more sermons, 438 distinct
verses.

Checked against the nine verses that motivated it:

- **Found:** Proverbs 3:5, Matthew 6:33, Romans 8:28, Psalm 139:14
- **Missed:** Jeremiah 29:11, Isaiah 40:31, Hebrews 11:1, Philippians 4:13

Then the four "found" cases were checked against WEB. **All four are already in
WEB, nearly verbatim** — "Trust in the LORD with all your heart, and don't lean
on your own understanding" *is* Proverbs 3:5 as published. Those searches
already work.

**The method found 100% of the cases needing no help and 0% of the real gaps.**
That is not a threshold to tune. It is definitional: a remembered phrasing is
one whose *words differ from the corpus*, and word overlap is the only way to
find it. The method can only find quotations it does not need to find.

Precision was poor besides. In the top 40 results: `Luke 12:12` for the
baptismal formula (Matthew 28:19), `Numbers 12:7` for "well done, good and
faithful servant" (Matthew 25:21), `Job 13:1` for "eye has not seen"
(1 Corinthians 2:9). Several were not scripture at all — "lord want come right
now" is the pastor's prayer language.

### 2c. Layer B evidence via detected READINGS — WORKS, but does not pay

Jesse's proposal, and the mechanism is sound: preachers *read the passage
aloud*, and a reading tracks the verse closely even when the spoken citation
gives only the chapter. Unlike a remembered paraphrase, a reading is close to
the corpus — which is exactly what token overlap handles well.

**It works.** Detecting runs of consecutive windows tracking consecutive verses:

| | |
|---|---|
| sermons with at least one detected reading | **261 of 423 (62%)** |
| readings detected | 537 (1.3 per sermon) |
| distinct verses read | **799** |
| median reading span | **2 verses** |

Validated independently by series titles the matcher never saw: *"City on a
Hill"* to Matthew 5:15–16. *"Suit Up"* to Ephesians 6:10–11, across four
sermons in that series. *"Breastplate of Righteousness"* to Ephesians 6. *"I am
Changed"* to Luke 19 (Zacchaeus).

**And it still does not pay, for three reasons:**

**No coverage gain.** 535 of the 537 readings land on verses that already carry
evidence. Two are new. Lighthouse preaches the passages everyone preaches, and
five historical expositors already cover them.

**Corroboration would remove the modern voice.** A term is admitted only when
two or more independent authors use it. The existing profile for Matthew 11:29
is *lowly, quietness, repose, meek, subjection*; for Ephesians 6:10,
*requisite, duti, soldier, exhortation*. Modern words will not match those, so
every distinctly modern term becomes single-source and is rejected. **The rule
that makes Layer B trustworthy is precisely what would strip out the thing this
corpus was wanted for.** Two modern voices would be required, not one.

**The "modern voice" here is not theological.** Measuring which LH words the
entire historical corpus never treats as distinctive of any verse returns 122
terms: `youre`, `didnt`, `theyre`, `maybe`, `gonna`, `everybody`, `crazy`,
`weird`, plus `lighthouse`, `online`, `website`, `weekend`, `phone`. Only
`savior`, `worry` and `respond` are substantive. It is conversational register
and church logistics, not new vocabulary for old truths.

## 3. What IS worth keeping

### The reading detector

`pipeline/scripts/detectSermonReadings.ts` — committed as **analysis only**,
deliberately not wired into any build. It is the hard part and it works. Any
future sermon corpus (LH manuscripts, a second church, cleaner transcripts)
becomes verse-alignable without redoing this.

### What Lighthouse actually preaches

The 537 readings are a record of which passages this church teaches. That makes
them a **curation priority list for the ontology** — which concepts to build
next based on what the church actually teaches, rather than on what a Victorian
thought was important. 174 distinct chapters; the top 40:

| passage | times | passage | times |
|---|---|---|---|
| Matthew 7 | 19 | John 14 | 6 |
| Luke 19 | 16 | Ephesians 6 | 6 |
| Luke 1 | 15 | Matthew 19 | 6 |
| Matthew 5 | 13 | Psalms 139 | 6 |
| John 20 | 10 | Matthew 6 | 6 |
| Luke 2 | 10 | John 11 | 6 |
| John 15 | 9 | Philippians 2 | 6 |
| Matthew 11 | 9 | John 4 | 6 |
| Jonah 3 | 9 | Matthew 26 | 6 |
| John 13 | 9 | 1 Corinthians 12 | 5 |
| Galatians 5 | 9 | Psalms 23 | 5 |
| Romans 5 | 8 | Luke 17 | 5 |
| Romans 8 | 8 | Luke 15 | 5 |
| 1 Corinthians 11 | 8 | Matthew 28 | 5 |
| Genesis 3 | 8 | 1 Corinthians 15 | 5 |
| Psalms 22 | 8 | 2 Peter 1 | 5 |
| John 5 | 7 | 1 Thessalonians 5 | 5 |
| Psalms 103 | 7 | Revelation 21 | 4 |
| Colossians 1 | 7 | John 10 | 4 |
| Psalms 73 | 7 | John 8 | 4 |

## 4. Recommended next steps

**Do not ingest this corpus into Layer B.** It would add weight without value,
which is the failure the gauntlet exists to prevent.

**The modern-voice goal belongs in Layer A, not Layer B.** This is the useful
conclusion, and it generalises past this corpus. Layer B is statistical and
requires agreement between independent authors; only one modern author is
available. Layer A is curated, has no corroboration requirement *by design*,
and is the one layer where LH's own voice is explicitly permitted. Pushing
modern vocabulary into Layer B fights the architecture; putting it in Layer A
is what the architecture is for.

When this resumes:

1. **Draft concept packs from the preaching list above** — modern lexicons,
   anchored to the passages LH actually teaches, `editorial` provenance,
   golden fixtures first. Matthew 7, Luke 19, Matthew 5, Galatians 5 and
   Ephesians 6 are the obvious first five.
2. **Fold the `remembered-phrasings` work into the same packs** rather than
   running it separately. Both are the same operation: a modern phrase, a
   curated anchor, a human approval.
3. **Revisit Layer B ingestion only if a second modern voice appears.** Then
   modern terms can corroborate each other and the register problem solves
   itself. One church cannot, by construction.

## 5. What would change this verdict

- **Sermon manuscripts or teaching notes** rather than captions. They usually
  name the passage and carry far less service material.
- **Sermon-to-primary-passage metadata** from Planning Center or the website.
  That would give honest sermon-level alignment without inference.
- **A second modern expositor** with compatible rights. Life.Church Open is not
  one: its terms grant use "for your internal use and not for resale" and
  forbid exercising the granted rights "toward commercial advantage", which
  does not permit a publicly distributed artifact.
- **Speaker identification.** Treating individual LH preachers as separate
  authors would let the corpus self-corroborate. **I would advise against it**
  even if the data allowed: one church with shared series, shared preparation
  and a house style is close to the failure `authorId` was introduced to
  prevent, and it would manufacture agreement rather than find it.

## 6. Record of what was wrong

I predicted twice that this corpus would help. It does not.

The first prediction — that modern sermons would fix remembered phrasing
through Layer B — was wrong because I reasoned about whether the phrases
existed without checking whether they could be *attached to a verse*. They
cannot: the phrases occur without nearby citations, which is exactly why they
are remembered phrasings in the first place.

The second — dismissing readings as a mechanism — was wrong in the opposite
direction, and Jesse corrected it. The readings are detectable, and my first
miner had actively filtered out that signal by excluding phrases present in
WEB, which is precisely what a reading is.

Both errors were caught by measurement rather than argument, which is the point
of taking the measurements.
