# Machine-Readable Sources for Nave's Topical Bible and Torrey's New Topical Textbook

Research date: 2026-07-29
Purpose: Source survey for Maskil data importers (topical/thematic scripture indexes).

---

## 1. Nave's Topical Bible (Orville J. Nave, 1905/1st ed. 1897)

### (a) Where to obtain machine-readable versions

- **CrossWire SWORD module "Nave"** — module info page: https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=Nave
  Module version 3.0 (2008-11-29), module type is a topical/dictionary-style module (SWORD calls this class "zLD" — compressed "Local Dictionary/Devotional/Daily" keyed-entry format, used for topical works where each "key" is a topic string rather than a Bible reference). Distribution license field reported as **"Public Domain."** Module list page (raw zip download links, module search): https://www.crosswire.org/sword/modules/ModDisp.jsp
- **Christian Classics Ethereal Library (CCEL)** — work page: https://www.ccel.org/ccel/nave/bible.html ; full text/cached formats (HTML, PDF, ePub, Word, XML, UTF‑8 text): https://www.ccel.org/ccel/nave/bible/cache/bible.pdf . CCEL's general copyright/licensing policy page (linked from the work page) returned **HTTP 404** when fetched directly (https://www.ccel.org/about/copyright.html) — UNVERIFIED: could not confirm CCEL's exact digitization-license wording; the work page itself displayed no explicit license text in the fetched content, only navigational links to "Copyright" and "Privacy" pages.
- **Internet Archive** — two scanned/OCR'd copies:
  - https://archive.org/details/navestopicalbibl00nave (1903 printing; formats: PDF ~175MB, EPUB ~9.3MB, plain "FULL TEXT" download ~10MB, DjVu, DAISY, ABBYY/HOCR XML). Archive.org lists copyright status as **"NOT_IN_COPYRIGHT."** OCR engine: ABBYY FineReader 8.0, reported page-confidence ~95%.
  - https://archive.org/details/NavesTopicalBible_201607 (separate scan, not independently inspected).
- **Project Gutenberg** — searched catalog directly (`https://www.gutenberg.org/ebooks/search/?query=nave%27s+topical`); **no matching ebook titles were returned.** Conclusion: Nave's Topical Bible does **not** currently have a Project Gutenberg edition.
- **GitHub**:
  - https://github.com/BradyStephenson/bible-data — contains a file `NavesTopicalDictionary.csv` as part of a broader Bible-data CSV collection. Repo license: **CC BY 4.0** ("Creative Commons Attribution 4.0 International"). The repo README states "All files are provided as CSV format for broad compatibility." UNVERIFIED: the exact column/field structure of `NavesTopicalDictionary.csv` was not visible in the fetched README content — would need to fetch the raw CSV file directly to confirm schema (topic name column, reference column, delimiter used for multiple references).
  - https://github.com/elcafe7/naves-cli — "Terminal-first CLI for searching and browsing Nave's Topical Bible" (found via GitHub API repo search, `total_count: 3` for query "nave topical bible"). Not inspected further; worth a direct look by the engineer for its underlying data file format since it is a purpose-built Nave's browser.
- **BibleStudyTools** (web only, no evident API/download): https://www.biblestudytools.com/concordances/naves-topical-bible/
- **BibleHub topical index**: https://biblehub.com/topical/ — presents Nave's ("20,000+ topics... 100,000 scripture references"), Torrey's, and a third "Contemporary Topical Bible Verses" set (from OpenBible.info, explicitly CC-BY licensed per that page). No API or bulk-download offered; no explicit copyright statement shown for the Nave's/Torrey's content specifically on that page — UNVERIFIED whether BibleHub claims any rights over its formatting/markup of the public-domain text.
- **naves-topical-bible.com** (https://www.naves-topical-bible.com/) — dedicated site with an explicit SWORD-related page (https://www.naves-topical-bible.com/SWORD.html); not deeply inspected, listed for completeness.

### (b) Format and structure

- **SWORD module (zLD/topical dictionary format)**: keys are topic strings (not verse references); each key's "entry" is a text blob containing subtopic headers and reference lists as unstructured text (this is the standard SWORD "Dictionary/Devotional" layout used for topical works — same generic container as e.g. Easton's Bible Dictionary). To extract programmatically:
  - **pysword** (Python, native reader): https://github.com/tgc-dk/pysword and https://tgc-dk.gitlab.io/pysword/module-format.html — supports rawtext, rawtext4, ztext, ztext4 formats; dictionary/topical modules are read via its dictionary-module reader class, returning entry text per key. A worked example project extracting SWORD module text with pysword: https://github.com/tonyjurg/Sword_Module_Text_Extraction
  - **diatheke** (CLI bundled with SWORD/Xiphos) and **mod2imp** (SWORD utility converting a module to the plain-text "imp" import format, one key + text block per record) are the standard CLI extraction tools; UNVERIFIED against a primary CrossWire tools doc in this session (not fetched directly), but this is well-established SWORD-ecosystem knowledge and consistent with the pysword module-format docs above.
  - After extraction, the raw text still requires a downstream parser to split each topic entry into subtopic headings and individual scripture references, since the SWORD container does not model that hierarchy structurally — it is just formatted text per topic key.
- **CCEL text/XML/PDF**: CCEL publishes Nave's as OSIS-like XML plus rendered HTML/PDF/ePub; the underlying structure (per CCEL's general practice for reference works) uses nested divisions per topic with reference lists as inline text — UNVERIFIED at the level of exact tag names since the XML source itself was not fetched in this session (only the work-info page).
- **Internet Archive OCR text**: flat plain-text dump from OCR, line-oriented, topic headers distinguished only by capitalization/whitespace conventions from the printed page — no structural markup at all; heaviest cleanup burden of any source.
- **BradyStephenson/bible-data CSV**: flat CSV, columns not confirmed (see above) — likely topic, reference-list-as-string, given the "CSV for broad compatibility" design note.

### (c) Copyright/license status

- **Original text**: Nave died 1917; first published 1897, this edition 1905/1903. Under US law, works published before 1929 are public domain. Archive.org explicitly tags the 1903 scan **"NOT_IN_COPYRIGHT"** (https://archive.org/details/navestopicalbibl00nave). Confirmed public domain.
- **Digitizations**:
  - SWORD "Nave" module: distribution license listed as **"Public Domain"** on the CrossWire module info page (https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=Nave). No additional restriction noted.
  - CCEL: no explicit license text was retrievable in this session (copyright page 404'd); UNVERIFIED — flag for the engineer to check CCEL's terms-of-use page directly before redistributing CCEL's specific XML/HTML markup, since CCEL historically has asserted rights over its own markup/formatting layer even for public-domain source texts (this is a general CCEL practice, not confirmed here — **UNVERIFIED**).
  - BradyStephenson/bible-data: repo explicitly **CC BY 4.0**, which is a restriction added on top of the public-domain source text (attribution required for the compiled CSV).
  - Internet Archive scans: no extra license asserted beyond "not in copyright"; OCR text is a straight transcription.

### (d) Scripture reference formatting

Not independently confirmed at the raw-file level in this session for any single source (no raw module/CSV file body was fetched, only descriptions/READMEs). Nave's is historically printed with heavy abbreviation (e.g. "Gen. 1:1", "1 Cor. 6:9,10", semicolon-separated multi-reference lists within a topic, comma-separated verse lists within a chapter). Verse ranges are typically represented with a hyphen ("Gen 1:1-3") and distinguished from a same-chapter verse list by comma ("Gen 1:1,3,5"). **UNVERIFIED** — this is based on general familiarity with the printed source and was not confirmed against an actual fetched machine-readable record in this session; the engineer should pull one real record from the SWORD module or the BradyStephenson CSV to confirm exact formatting/delimiters before writing a parser.

### (e) Known data-quality issues

- OCR-based sources (Internet Archive plain text) will contain classic 19th/early-20th-century OCR errors: misread ligatures, broken hyphenation across line breaks, misrecognized italic cross-reference markers, and page-header/footer text bleeding into body text. ABBYY FineReader 8.0 confidence was reported at ~95% page-level, which still implies meaningful per-character error rates across a 1,630-page work.
- Archaic/non-standard book abbreviations (e.g. "Cant." for Song of Solomon, "Rev." vs "Apoc.", "1 Chron." vs "1 Chr.") are common across all reprint editions and will need a normalization table mapping to a modern canonical abbreviation scheme.
- Topic names reflect 1897-era editorial/theological framing and word choices (e.g. archaic KJV-era vocabulary, period moral categories) that a modern app may want to flag, rename, or provide alongside a modern-language alias rather than silently altering.
- Multiple digitizations (SWORD vs CCEL vs Archive.org vs GitHub CSV) are independent transcriptions of the same public-domain source and are **not guaranteed to agree** on topic segmentation or reference lists — cross-checking against at least two sources is advisable before treating any one as ground truth.

---

## 2. Torrey's New Topical Textbook (R. A. Torrey, 1897)

### (a) Where to obtain machine-readable versions

- **CrossWire SWORD module "Torrey"** — module info page: https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=Torrey . Version 1.3 (released 2001-12-15), module type Dictionary, English, install size 1.63MB, minimum SWORD version 1.5.1a. Distribution license reported as **"Public Domain."** The module info explicitly states: *"No copyright notice appears on the book, and it is a reprint of the original edition which is out of copyright."* Contact for source files given as "the Bible Foundation." Module list: https://www.crosswire.org/sword/modules/ModDisp.jsp
- **CCEL** — work page: https://ccel.org/ccel/torrey/ttt ; cached PDF: https://ccel.org/ccel/t/torrey/ttt/cache/ttt.pdf . Formats offered per the work page: HTML, ePub, PDF, Word, XML, UTF-8 text. Publication year listed as 1897; "628 entries with over 20,000 scripture references." As with Nave's, the CCEL copyright-policy page could not be retrieved in this session (404) — **UNVERIFIED** license wording for the CCEL digitization specifically.
- **Project Gutenberg** — catalog search for "torrey" returned **no matching Torrey's Topical Textbook title** (only pagination/navigation links, no book results). Conclusion: not available via Project Gutenberg.
- **GitHub**:
  - https://github.com/birchamp/Torrey-Topical-Browser — found via GitHub API repo search (query "torrey topical", `total_count: 1`). No description text was returned by the API for this repo; needs direct inspection by the engineer for data format/license before relying on it.
  - No other GitHub repos with a structured (JSON/SQL) Torrey dataset were found via search in this session.
- **BibleStudyTools**: https://www.biblestudytools.com/concordances/torreys-topical-textbook/ (web browsing only, no evident bulk export).
- **bible-topics.com** (https://www.bible-topics.com/) — described in search results as "Verses by subject from Torrey's Topical Textbook"; not independently fetched/verified in this session — **UNVERIFIED** as to format or license.
- **ntslibrary.com PDF**: http://www.ntslibrary.com/PDF%20Books/Torrey's%20New%20Topical%20Textbook.pdf — a plain PDF scan/reprint, not structured data; listed only as a possible source-of-last-resort for cross-checking text, not for programmatic ingestion.
- **Wikipedia** overview/history: https://en.wikipedia.org/wiki/Torrey%27s_Topical_Textbook

### (b) Format and structure

- Same SWORD Dictionary-module container as Nave's (topic-keyed entries with reference lists as text within the entry) — extract via the same tooling (pysword / diatheke / mod2imp) described in section 1(b).
- CCEL offers the same multi-format bundle (HTML/XML/ePub/PDF/plain text) as its Nave's edition; internal XML structure not independently confirmed in this session (only the work-info page was fetched, not the XML source itself) — **UNVERIFIED** exact tag/field names.
- No confirmed JSON/CSV/SQL structured dataset was located for Torrey's specifically (unlike Nave's, which has the BradyStephenson CSV). This is a meaningful gap relative to Nave's — the engineer will likely need to parse the SWORD module or CCEL text directly rather than relying on a pre-structured community dataset.

### (c) Copyright/license status

- **Original text**: Torrey (1856–1928); Textbook first published 1897 (some sources say 1897, republished by Sword of the Lord Publishers). Public domain under US law (pre-1929 publication). The CrossWire module page states directly: *"No copyright notice appears on the book, and it is a reprint of the original edition which is out of copyright."* (https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=Torrey)
- **Digitizations**:
  - SWORD "Torrey" module: distribution license explicitly **"Public Domain"** per the CrossWire module info page.
  - CCEL: license wording not retrievable in this session (page 404) — **UNVERIFIED**.
  - GitHub repos found (Torrey-Topical-Browser) — license not confirmed; **UNVERIFIED**, needs direct repo inspection (LICENSE file check) before use.

### (d) Scripture reference formatting

Not confirmed against a raw fetched record in this session — **UNVERIFIED**. Based on general knowledge of the printed source, Torrey's uses similarly abbreviated, semicolon/comma-delimited reference lists to Nave's, with the source text itself (per BibleStudyTools' description) citing "over 20,000 topics and over 50,000 Scripture references" (note: this figure differs from the CCEL-stated "628 entries... over 20,000 scripture references" and from the ~30,000-reference figure quoted elsewhere in early search results — the exact reference count is inconsistently reported across secondary sources and should not be trusted as precise; **UNVERIFIED**, treat all quoted totals as approximate marketing/summary figures, not verified counts).

### (e) Known data-quality issues

- Same category of issues as Nave's: 19th-century abbreviation conventions, OCR risk in scanned/reprint editions (e.g. the ntslibrary.com PDF, which is explicitly a reprint scan), and inconsistent secondary-source metadata (conflicting topic/reference counts noted above — a warning sign that different digitizations may have measurably different topic/entry counts, not just formatting differences).
- Smaller total reference count than Nave's (an order of magnitude fewer topics/entries per most descriptions — "628 entries" per CCEL vs Nave's "20,000+ topics") — engineer should not assume the two sources are structurally comparable in granularity; Torrey's is a shorter, coarser topical index than Nave's despite superficially similar historical billing.

---

## 3. Other modern, cleanly-licensed open-source topical/thematic scripture datasets

- **OpenBible.info Cross References dataset** — ~340,000 cross-references compiled primarily from the (public-domain) Treasury of Scripture Knowledge, plus other public-domain sources. Licensed **CC-BY** (Creative Commons Attribution) per OpenBible.info's own labs page (https://www.openbible.info/labs/cross-references/, referenced via https://github.com/scrollmapper/bible_databases README). This is a cross-reference graph (verse → verse links with a relevance/vote weight), **not** a topic-name-keyed index like Nave's/Torrey's — different data shape, complementary rather than a substitute.
  - Repackaged in **scrollmapper/bible_databases**: https://github.com/scrollmapper/bible_databases — **MIT licensed**, contains 140 Bible translations plus the OpenBible.info cross-reference table, in multiple formats (SQL/SQLite/MySQL, CSV, JSON, YAML, Parquet, plain text/Markdown). This is a well-maintained, actively structured, MIT-licensed dataset and is a strong candidate as either a complement to or partial substitute for a raw-cross-reference need (though it does not have named topics — only verse-to-verse links).
  - Also repackaged in **shandran/openbible**: https://github.com/shandran/openbible (contains `cross_references_expanded.csv`, derived/parsed from the original OpenBible.info table) — license not independently confirmed in this session, **UNVERIFIED**.
- **OpenBible.info "Contemporary Topical Bible"** (the ~3,600-topic modern-language topic set referenced on BibleHub's topical page, https://biblehub.com/topical/, credited to "the Biblos Team" / OpenBible.info) — explicitly labeled **CC-BY** on that page. This is the closest modern, actively-licensed analog to Nave's/Torrey's in shape (named topics → scripture lists) and worth strong consideration as either a primary dataset or a normalization/cross-check target against the older public-domain indexes, since it uses modern topic naming without 19th-century theological framing.
- **openbibleinfo/Bible-Passage-Reference-Parser**: https://github.com/openbibleinfo/Bible-Passage-Reference-Parser — TypeScript library to parse free-text strings like "John 3:16" into structured references. Highly relevant as a *tool* (not a dataset) for normalizing the inconsistent reference formatting expected from Nave's/Torrey's raw text. License not independently confirmed in this session — **UNVERIFIED**, check repo LICENSE file directly.
- **theonize/KJV-bible-database-with-metadata-MetaV**: https://github.com/theonize/KJV-bible-database-with-metadata-MetaV- — word-level KJV metadata ("who, where, when"), pulls from public domain/CC/other open sources per its own description. Broader scope than topical indexing; worth a look if Maskil wants entity/person/place tagging alongside topical search, but not a topical-index substitute. License mix — **UNVERIFIED**, described as "Public Domain, Creative Commons, or other open use license" per its own README summary, meaning per-source licenses vary and would need per-file checking.
- **BradyStephenson/bible-data**: https://github.com/BradyStephenson/bible-data — CC BY 4.0, already noted above under Nave's as the one GitHub source with a Nave's-derived CSV; also contains broader structured Bible reference data (books/chapters/verses, persons, places, commandments, Strong's) that could be useful as supporting reference tables regardless of the topical-index decision.

---

## Summary recommendation for the engineer

1. **Primary extraction path for both works**: pull the CrossWire SWORD modules ("Nave" and "Torrey," both explicitly licensed "Public Domain" by CrossWire) and extract with **pysword** (https://github.com/tgc-dk/pysword) or **diatheke/mod2imp** CLI tools, then write a custom parser to split each topic entry's text blob into subtopics and individual references — since the SWORD dictionary container does not itself model that structure.
2. **Cross-check against BradyStephenson/bible-data's `NavesTopicalDictionary.csv`** (CC BY 4.0) as a second, already-structured source for Nave's specifically to validate the parser's output — but note the CC-BY attribution obligation this adds versus the public-domain SWORD module.
3. **No equivalent pre-structured CSV/JSON was found for Torrey's** — expect more parsing work there, and treat the total-entry/reference counts reported across sources (628 vs 20,000 vs 30,000+) as unreliable until the raw module is actually parsed and counted.
4. Do **not** rely on Project Gutenberg for either work — confirmed absent from its catalog in this session.
5. Treat CCEL's specific digitization license as **unresolved** (page fetch failed) — check https://ccel.org's terms of use manually before using CCEL's XML/HTML as a source, even though the underlying text is public domain.
6. Consider OpenBible.info's CC-BY "Contemporary Topical Bible" (surfaced via https://biblehub.com/topical/) and the MIT-licensed **scrollmapper/bible_databases** cross-reference set as modern complements — the former for less archaic topic naming, the latter for a permissively-licensed verse-to-verse cross-reference graph.
7. Build reference-string normalization using either a custom abbreviation map or an existing tool like **openbibleinfo/Bible-Passage-Reference-Parser**, given the confirmed presence of archaic/non-standard abbreviations and the likelihood of OCR-derived errors in any Internet-Archive-sourced fallback text.
