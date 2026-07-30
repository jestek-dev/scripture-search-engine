# Getting Layer B off Psalms — source survey

**Date:** 2026-07-29
**Question:** Layer B has 2,583 corroborated terms, essentially all in the
Psalter, because both admitted commentators only wrote on Psalms. Sixty-five
books have no homiletical evidence. What public-domain sources close that, and
what do they cost?
**Status:** Availability and parseability verified by download; rights read but
two sources need Jesse's call.

---

## 1. The constraint that decides everything

Since corroboration became an admission rule, **coverage is measured in authors
per verse, not works ingested**. One commentator on a new book buys almost
nothing: a single-author profile is that author's idiolect, which is precisely
what `minSources: 2` exists to reject.

So the target is not "more sources". It is **≥2 independent expositors on the
same verse**, everywhere.

## 2. The find: SWORD modules are verse-keyed by construction

CrossWire distributes public-domain commentaries as SWORD `zcom` modules. This
matters more than it sounds, because it removes the two expensive, error-prone
steps that Treasury of David cost us:

| | Internet Archive OCR (what we did) | SWORD module |
|---|---|---|
| Text quality | OCR noise survives corroboration (`kite`, `phantom`) | Clean transcription |
| Alignment | Parse printed headings; corrupt roman numerals must be rejected | **Verse-keyed already** — no inference |
| Per-source work | A new parser per volume's typographic conventions | One parser, all modules |
| Failure mode | Commentary silently attached to the wrong psalm | Index mismatch is structural |

Format is a fixed-width index plus zlib blocks — parseable in pure Node with
`node:zlib`, no toolchain, consistent with the `node:sqlite` decision.

**Verified by actually parsing it.** Adam Clarke's NT module: 8,246 index
entries, 7,041 carrying commentary. Entry 100 decompresses to Clarke on
Matthew 5:3 — "Blessed are the poor in spirit … μακαριοι" — clean text, correct
verse, no OCR artifacts.

## 3. What is available

All confirmed downloadable from
`https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/<Module>.zip`,
all declaring `DistributionLicense=Public Domain`. The `TextSource` field is
where they differ, and it is the field that matters to us.

| Module | Coverage | Size | TextSource | Rights read |
|---|---|---|---|---|
| **Clarke** | Whole Bible | 8.6 MB | Wikisource | ✅ Clean |
| **KD** (Keil & Delitzsch) | Old Testament | 11.2 MB | Wikisource | ✅ Clean |
| **Barnes** | New Testament | 5.8 MB | *unstated* | ⚠️ Ask CrossWire |
| **Wesley** | Whole Bible | 3.0 MB | Kelley/Brown e-text | ⚠️ Terse; check |
| **JFB** | Whole Bible | 5.7 MB | **ccel.org** | ⛔ Policy conflict |
| **MHC** (Matthew Henry) | Whole Bible | 15.2 MB | **ccel.org** | ⛔ Policy conflict |
| MHCC (Henry, concise) | Whole Bible | 1.8 MB | ? | unchecked |
| CalvinCommentaries | Most of Bible | 20.9 MB | ? | unchecked |
| Geneva notes | ? | 1.7 MB | ? | unchecked |

Not present in CrossWire's main repository: Gill, Pulpit Commentary.

### The CCEL problem, again

MHC and JFB are the two richest whole-Bible options, and both derive from CCEL.
CrossWire labels them Public Domain — the underlying *works* certainly are — but
this repo already ruled, when admitting Treasury of David, that CCEL's
hand-corrected transcriptions ask permission for commercial republication of
**their files**, which makes them unusable as a redistribution source even
though the text beneath is free.

Nothing about that reasoning changes because a third party relabelled the file.
`rightsClass: pd_text_claimed_transcription` exists for exactly this shape.

Note this only binds because we *redistribute* a distillate. If the distillate
is judged not to be republication of the transcription — it is term statistics,
not prose — the calculus differs. That is a rights judgment, not a technical
one. **Jesse's call.**

## 4. Coverage math

Non-CCEL sources only:

| Testament | Sources | Corroboration |
|---|---|---|
| Old Testament | Clarke + KD (+ Wesley) | ✅ 2–3 authors |
| New Testament | Clarke + Barnes (+ Wesley) | ✅ 2–3 authors, if Barnes' source checks out |

So **whole-Bible 2-author corroboration is reachable without touching CCEL** —
provided Barnes' unstated TextSource is clean. If it is not, the NT falls back
to Clarke + Wesley, and Wesley's *Notes* are terse enough that they may not
carry much distinctive vocabulary.

## 5. Spurgeon's sermons across the Bible

Available: Metropolitan Tabernacle Pulpit volumes on Internet Archive with
`_djvu.txt` full text (~3 MB/volume, 63 volumes). Note the file name does not
match the item id — `SpurgeonMetropolitanPt07` contains
`Spurgeon-Metropolitan-pt07_djvu.txt`.

**Recommended against as the next step**, despite being the obvious ask:

- They are *sermons*, not verse-keyed commentary. Alignment means parsing a
  printed text header per sermon, or joining against an external scripture
  index — the expensive path we just proved is avoidable.
- OCR noise is real and survives corroboration, as Treasury demonstrated.
- Coverage is uneven by construction. Spurgeon preached what he preached;
  63 volumes of sermons do not cover the canon, they cover the passages a
  Victorian Baptist preached on. Layer B's gap is *books nobody has covered*,
  and sermons are the least even way to fill it.
- Spurgeon already speaks in the corpus, on Psalms, via Treasury of David.

Worth revisiting once verse-keyed coverage exists everywhere and the question
changes from "any evidence at all" to "richer evidence on high-traffic
passages". Sermons are depth, not breadth.

## 6. Cost to implement

The one genuinely new piece: **the index-to-verse mapping**. A SWORD module's
entries follow KJV versification, so entry *n* → book/chapter/verse requires a
KJV verses-per-chapter table. The repo has `chapterCount` per book but not
verse counts, so that table has to be added and checked. Getting it wrong
shifts every subsequent comment by one verse — silent, and exactly the class of
error the Treasury parser was written to refuse.

Mitigation: the mapping is self-checking. Clarke's entries carry "Verse 17"
style prefixes in their own text, so the parser can assert that the derived
verse number matches what the commentator says and fail on any disagreement.
That turns a silent offset into a build error.

Estimated: one importer (~150 lines), one versification table, one verification
pass. Roughly the size of the Treasury work, but paid once for all modules
instead of once per volume.

## 7. Recommendation

1. Write the `zcom` importer with the self-checking verse assertion.
2. Admit **Clarke** first — whole Bible, clean source, single author. It will
   produce no corroborated terms on its own, and that is the correct and
   informative result.
3. Admit **KD** (OT) and **Barnes** (NT). This is the step that should light up
   ~66 books, and the first real test of G9 saturation on new ground.
4. Decide the CCEL question. MHC and JFB would add a third and fourth voice
   across the whole Bible, which is where corroboration quality gets good.
5. Revisit Spurgeon's sermons only after that.

## Sources

- [CrossWire SWORD commentary modules](https://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Commentaries)
- [Clarke module copyright record](https://www.crosswire.org/sword/copyright/ModInfoCopyright.jsp?modName=Clarke)
- [MHC module copyright record](https://www.crosswire.org/sword/copyright/ModInfoCopyright.jsp?modName=MHC)
- [Barnes module copyright record](https://www.crosswire.org/sword/copyright/ModInfoCopyright.jsp?modName=Barnes)
- [Spurgeon MTP vol. 7, Internet Archive](https://archive.org/details/SpurgeonMetropolitanPt07)
- [Matthew Henry commentary vol. 1, Internet Archive](https://archive.org/details/matthewhenryscom01matt)
- [HistoricalChristianFaith/Commentaries-Database](https://github.com/HistoricalChristianFaith/Commentaries-Database) — verse-keyed TOML, church fathers; license not stated on the repo page, unresolved
