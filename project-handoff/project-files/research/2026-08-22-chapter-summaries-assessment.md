# Chapter & section summaries with category tags — assessment

**Date:** 2026-08-22 · **For:** Jesse · **Status:** research assessment, no code changed, no build started

## The question

> "I am considering having every single chapter or subsection of the Bible briefly summarized with category tags associated. Psalms chapter by chapter; Gospels/Epistles subdivided where Bibles put a heading. The dashboard mockup had a context tab, but that has to be built out accurately. Do we already have this? Can we make it? Does it already exist that we can either copy or learn from?"

## Direct answers

1. **Do we already have this? No.** Nothing on main stores chapter summaries, section headings, or tags. Our pinned WEB corpus contains *no* section headings at all (verified against the upstream USFM — the translation simply doesn't have them, so nothing was "stripped" that we could recover). The prototype's Context tab is entirely hardcoded sample prose. The implementation plan has two *relatives* — a 0.14.0 "pericopes" item that ships section *boundaries* only (vote counts, no titles or summaries), and a 20-section theme-label pilot (P6.6/J59) — but no plan item produces summaries or backs the context tab.
2. **Does it already exist to copy or learn from? Partly, and the usable parts are license-verified.** The Berean Standard Bible's section headings (3,096 headings covering all 66 books) are public domain and are the best division-and-title source. Two public-domain works — Keith Brooks' *Summarized Bible* (1919, chapter-by-chapter) and *Matthew Henry's Concise Commentary* (chapter outlines + section notes) — give raw material for summaries. Chris Juby's biblesummary.info (1,189 tweet-length chapter summaries) is **not** openly licensed — usable only with his written permission. ESV/NIV/study-Bible headings and outlines are in-copyright and **off the table for ingestion**, full stop. No source anywhere ships modern-language summaries *plus* category tags ready to ingest — that final layer has to be authored.
3. **Can we make it? Yes, within the covenant.** The path: public-domain section boundaries and titles → offline drafting of summaries from the PD sources (AI may assist offline; nothing lands without human review) → tags drawn from our existing concept vocabulary → row-by-row review in the curation workbench → gauntlet + human PR merge. Honest scale: ~1,189 chapters + ~3,100 sections ≈ **4,300 rows**; reviewing every row at 30–60 seconds each is roughly **40–70 hours of Jesse-time** spread over batches. Phasing (chapters first, or high-traffic books first) keeps it tractable and lets the context tab ship usefully early.

---

## 1. Do we already have this? (repo audit, origin/main @ 9542c83)

**What exists today, and its granularity.** The curated layer is concepts → lexicon phrases → anchors, where anchors are single verses or small verse ranges (`concept_anchors` with `start_verse_id`/`end_verse_id`/`source_id`/`weight` — `pipeline/src/schema.ts`, SCHEMA_VERSION 6). There is no table for sections, pericopes, headings, chapter summaries, or tags-per-chapter. A per-pericope keying for the expositor layer was **built and deliberately discarded** earlier in the project (`docs/implementation-plan.md` §3.1; `docs/NEEDS-JESSE.md`: "No hand-curated pericope table is needed, now or later") — that ruling was about *retrieval keying*, not about display context, but it's context for why nothing exists.

**The WEB corpus cannot supply headings.** The pinned source is eBible.org's verse-per-line export (`pipeline/manifests/web.json`), a format that can't carry headings — but the deeper finding is that the WEB translation itself has essentially none: a live download of the upstream USFM found zero `\s` section headings across the whole protestant canon (only Psalm superscriptions, Psalter book divisions, and Song of Songs speaker labels). Psalm superscriptions do survive in our corpus, folded into verse 1. So summaries/headings must be a **new dataset**; they cannot be recovered from our translation.

**The prototype's Context tab is a promise, not a feature.** In Jesse's mockup (commit 63bfeec, `workbench/prototype/.../Curation Workbench.dc.html`), the "Context" tab renders one hardcoded prose string per mock result — e.g. for Micah 7:18: *"Micah closes with a song of confident hope: God pardons… (7:18–20). A frequent reading at services of assurance."* That is exactly the shape of data Jesse is describing (section orientation prose + usage note), and none of it exists. The design prompt had specified the tab as "full passage context" (surrounding verses — backable today via the workbench's existing `GET /api/v2/context`, which returns ±2 raw verses); the mockup silently upgraded it to summaries. So Jesse's instinct is right: to build that tab *accurately*, this dataset is the missing ingredient.

**How this aligns with the implementation plan.** Plan item **P5.6 · CO-3** (ENGINE_VERSION 0.14.0, "pericopes") ships OpenBible's section-boundary *vote counts* (~20 translations, counts only, no heading text) as a `pericopes` table used to merge adjacent verse hits into passage-level results. It gives canonical *boundaries*, not summaries. **P6.6 · B7** plans 1–3 curated theme labels per high-traffic pericope mined from admitted PD expositors — a 20-pericope pilot gated on P5.6, with Jesse approving every label (question **J59**). Jesse's idea is a natural *extension* of these two items to full coverage plus summary prose: same section spine, more per-section content. It does not conflict with the plan; it extends it, and should reuse P5.6's section identifiers so the engine's passage merging and the context tab agree on what "a section" is.

## 2. Does it already exist to copy or learn from? (license-verified survey)

Every license below was verified against the source's own license statement (quotes and URLs in Appendix B). Verdicts: **INGESTABLE** = license-clean, could become curated data after human review; **LEARN-FROM** = study the approach, ingest nothing; **REJECT** = unusable.

| Source | What it has | License (verified) | Verdict |
|---|---|---|---|
| **Berean Standard Bible (BSB)** | 3,096 section headings, all 66 books (Psalms all 150), + parallel-passage refs, in the official USFM | Public domain ("officially placed into the public domain as of April 30, 2023") | **INGESTABLE — best boundary + title source** |
| WEB (our corpus) | 9,254 paragraph breaks, Psalm superscriptions; no headings | Public domain | Ingestable but contributes only paragraph boundaries |
| **Brooks, *Summarized Bible* (1919)** | Chapter-by-chapter Contents / Characters / Key Verse / lesson for all 1,189 chapters | Public domain (pre-1930; archive.org NOT_IN_COPYRIGHT) | **INGESTABLE — best PD chapter-summary base** (needs extraction from scans/retype; 1919 voice; typology fields need curation) |
| **Matthew Henry Concise** | Per-chapter outlines + verse-range section notes | Public domain; a CC0 structured digital source exists (lyteword/mhenry-concise) | **INGESTABLE — second witness + boundary cross-check** (Puritan idiom — rewrite, don't quote) |
| Chris Juby, biblesummary.info | 1,189 modern tweet-length chapter summaries | **Not open** — individual quotes ok with attribution; bulk use requires negotiated permission (author says he's open to small non-profit scripture-engagement projects) | **LEARN-FROM as-is; possible with a written grant** |
| Nave's / Torrey's (already ingested) | Topic→verse lists | PD | Nothing chapter-summary-shaped; reuse as tag vocabulary input |
| STEPBible-Data | No sections/pericope dataset exists (verified); TIPNR names/entities, TVTMS versification mapping | CC BY 4.0 | Ingestable for entity tags + versification mapping only |
| OpenBible.info | Section-boundary vote counts (already planned as P5.6); topic votes | CC BY (attribution-only) | Ingestable as boundary/tag *signal*; crowd-sourced, doctrinally unvetted |
| sil-ai/pericopes (GitHub) | Pericope list scraped from a third-party site | **No license** | REJECT |
| Aland Synopsis pericopes; RCL lectionary table | Standard scholarly/liturgical divisions | In-copyright (German Bible Society / Consultation on Common Texts) | REJECT for ingestion |
| ISBE 1915 book articles | Book-level outlines | Public domain | Ingestable for book intros, dated scholarship — review per article |
| Scofield 1917 notes | Book outlines, chapter analyses | PD (1917 ed. only) | LEARN-FROM in practice — hard dispensationalism is narrower than our shared-core doctrinal basis |
| ESV / NIV / study-Bible headings & outlines; BibleProject etc. | The polished modern versions of exactly this | In-copyright | **REJECT for ingestion — explicitly off the table.** Learn from structure only. |

**The gap no source fills:** modern-language summary prose in a consistent voice, and category tags per chapter/section. Those must be authored offline, sourced from the PD material above.

## 3. Can we make it? — the covenant-compliant path

Constraints honored throughout (CLAUDE.md): no AI at runtime; AI assists offline only, and nothing AI-touched reaches the artifact without gauntlet + human PR merge; determinism (new curated layer → layerFingerprint; schema change → SCHEMA_VERSION bump; ENGINE_VERSION bump only if result ordering can change); no theology scores — tags are descriptive and sourced, never adjudicating; fixture/validation-first; theological soundness is the highest priority.

**Step 1 — Section spine (boundaries + titles).** Ingest BSB's 3,096 headings as the pericope spine, mapped onto WEB versification (STEPBible's TVTMS, CC BY, is the check tool; BSB↔WEB verse alignment must be verified programmatically). Cross-check boundaries against WEB paragraph breaks and OpenBible's boundary vote counts (the P5.6 dataset) — where they disagree, flag for human call. Chapters are their own 1,189-row tier, no boundary question. Titles come in as *sourced data* ("BSB heading"), same provenance discipline as every other source. Recommended: reuse the exact section IDs P5.6 will use, so ranking's passage-merge and the context tab share one spine — and BSB headings can strengthen P5.6 itself (it currently plans counts-only boundaries with no titles).

**Step 2 — Summary authoring (offline, sourced, human-approved).** For each chapter (first) and section (later): draft a 1–3 sentence modern-voice summary derived from Brooks 1919 + Matthew Henry Concise, with the PD source(s) recorded per row. AI assistance is allowed *in drafting the modernization offline*; every row then goes through human review before merge — the same discipline as every data pack. The summary states what the passage says and covers; it never ranks, recommends, or adjudicates (that keeps CLAUDE.md #6 intact — a Context tab describing a passage is not a theology score). Doctrinal filters: strip Brooks' speculative typology and premillennial glosses; rewrite MHCC's Puritan idiom; everything reviewed against DOCTRINAL-BASIS.md.

**Step 3 — Category tags (controlled vocabulary, no new taxonomy).** Do **not** invent a new tag set. Reuse the existing concept vocabulary (~110 curated concepts on main) as the tag space: a chapter/section is tagged with concept IDs, each tag carrying its source (a PD outline names the theme, or an existing concept anchor already lands in that section). This keeps tags reviewable, descriptive, and automatically wired to search (tap a tag → run that concept query). Gaps in the vocabulary become ordinary new-concept proposals through the existing process. Tags are presence-only facts with sources — never weights.

**Step 4 — Review in the workbench.** Extend the curation workbench with a summaries review queue reusing the already-designed J/K batch-review pattern: show the passage (WEB text), the PD source excerpt(s), the drafted summary, and the proposed tags; Jesse approves / edits / rejects per row; judgments append-only. Batches of 25–50.

**Step 5 — Admission and determinism.** New tables (`sections`, `section_summaries`, `section_tags`) → SCHEMA_VERSION bump, pinned manifests, G10 size-budget rows (~4,300 short summaries ≈ ~1 MB — comfortably small), layerFingerprint coverage. Validation-first, the display-data analog of fixture-first: structural gates (every section within chapter bounds; boundaries tile each chapter completely with no overlaps; every tag in the controlled vocabulary; every row carries a source; versification valid against the pinned corpus) plus golden spot-check fixtures for known passages. **If the data is display-only, result ordering never changes and no ENGINE_VERSION bump is needed**; the moment sections feed ranking (P5.6 passage merging), that item's own 0.14.0 bump governs. Consumers (Maskil, LH Worship Setlist, Versed) get the context data through the artifact under the existing pinning contract — a schema addition they can ignore until they adopt it.

### Scale and review burden — honest numbers

| Tier | Rows | Review load (30–60 s/row) |
|---|---|---|
| Chapters only | 1,189 | ~10–20 hours |
| + all BSB sections | ~3,100 more (≈4,300 total) | ~40–70 hours total |
| High-traffic first (Psalms, Gospels, major epistles, ~600 rows) | 600 | ~5–10 hours |

Keeping it tractable: (a) PD-derived first drafts make review verification, not authoring; (b) chapters-first — the context tab is useful with chapter summaries alone, and the existing ±2-verse context is the graceful fallback where no summary exists yet; (c) BSB titles can be admitted wholesale as a sourced PD dataset with sampling review (they're quoted, not authored), reserving row-by-row effort for summaries and tags; (d) batched workbench review; (e) optionally a second theological reader for flagged rows, per the guardrail recommendation.

## Recommendation

Build it, phased: **(1)** land P5.6 boundaries per plan, extended with BSB headings as the titled spine; **(2)** chapter-summary pack (1,189 rows, Brooks+MHCC-derived, workbench-reviewed in batches), shipping the context tab on chapters with verse-context fallback; **(3)** section summaries for high-traffic books; **(4)** full canon as review time allows. This subsumes the planned 20-pericope label pilot (P6.6/J59) — that pilot becomes phase 2's first batch. Nothing here starts until Jesse says go; sequencing belongs after the current Phase 5 work per the standing plan order.

## Decisions reserved for Jesse

1. **Go / no-go**, and scope tier: chapters-only first (recommended) vs straight to full sections.
2. **Summary voice:** modernized editorial rewrite with per-row PD source attribution (recommended) vs quoting PD text verbatim (dated language).
3. **Tags:** reuse concept vocabulary (recommended) vs a separate small tag list.
4. **Optional outreach:** a one-line provenance confirmation to the BSB publisher (low-risk belt-and-braces), and/or asking Chris Juby for a written grant to use his modern summaries as an additional drafting source.
5. **Review cadence:** batch size, and whether flagged rows get a second reader.
6. **Sequencing:** where this slots relative to Phases 5–7 (it is data-heavy, engine-light, so it can run as a mostly parallel curation track once P5.6 defines the spine).

---

## Appendix A — Repo audit detail (worker findings, 2026-08-22)

# Repo audit: chapter summaries / pericope data — "Do we already have this?"

Date: 2026-08-22. Inspected: origin/main @ 9542c83 (fetched), prototype branch claude/hearth-thread-wrhubh-p3 @ 63bfeec, /mnt/project-files. Read-only; no repo files modified.

**Short answer: No — nothing on main (or anywhere in the pipeline sources) contains chapter summaries, section headings, pericope boundaries, or category tags per chapter. The prototype's Context tab is 100% hardcoded prose with no backing data. The planned 0.14.0 "pericopes" item ships only section BOUNDARY VOTES (counts), explicitly no heading text and no summaries. The WEB translation itself has essentially no section headings to recover — only Psalm superscriptions, which DO survive in our corpus (folded into verse 1 text).**

---

## A. What exists on main relevant to this idea

### Curated layer structure and granularity

- Schema: `pipeline/src/schema.ts`, `SCHEMA_VERSION = '6'` (line 22). Full table roster (line numbers in that file): `meta` (32), `translations` (37), `books` (47), `book_aliases` (54), `verses` (61), `verses_fts`, `verse_tokens` (105), `token_stats` (121), `concepts` (136), `concept_lexicon` (148), `concept_anchors` (162), `concept_related` (174), `cross_references` (185), `verse_terms` (207), `verse_translation_tokens` (236). **No pericopes/sections/headings/summaries table exists.**
- **Layer A (curated concepts)**: authored as YAML in `ontology/concepts/*.yaml` (~110 files), compiled by `pipeline/src/importers/ontologyImporter.ts` + `pipeline/src/buildConceptLayer.ts`. Shape (e.g. `ontology/concepts/fear-not.yaml`): `id`, `label`, `lexicon` (phrases), `anchors` (each `ref` + `sources` + `weight` + comments), `openbibleTopics`, `related`. **Granularity: verse ranges** — `concept_anchors(concept_id, start_verse_id, end_verse_id, source_id, weight, locator)` (schema.ts:162). Anchors are typically single verses or small ranges (e.g. "Isaiah 43:1-3"); ranges are range-native so a whole chapter is *possible* but not the practice. No concept has "category tags" per chapter; concepts are topic-first, not passage-first.
- **Layer B (homiletical)**: `verse_terms` — per-VERSE distilled distinctive vocabulary from PD expositors (Matthew Henry, Barnes, Clarke, JFB, K&D, Maclaren, Treasury of David — see `pipeline/manifests/*.json`). Source prose is NEVER stored (schema.ts comment at ~line 196). Verse-keyed by explicit design decision: the pericope table was built, measured, and DISCARDED — see `docs/implementation-plan.md` §3.1 (lines 109–137): "No canonical pericope table, no hand-drawn chunk boundaries." And `docs/NEEDS-JESSE.md` §2.2 (line 474): "**No hand-curated pericope table is needed, now or later** — that burden is gone." (Note: that verdict was about Layer-B term-profile keying, not about display/context data.)
- Cross-references: `cross_references` verse→range edges (TSK, OpenBible xrefs).
- The word "pericope" on main appears only in comments/docs: `engine/src/corpus/repository.ts:581` ("Verses whose pericope profile contains query terms"), `engine/src/ranking/rank.ts:20` (groupId "Pericope or passage grouping key, used for diversification" — in practice the chapter is the group key), `engine/src/reasons/types.ts:30`.

### Chapter-summary / heading / outline data: NOT FOUND

- Grep for pericope/heading/summary/outline/section across `pipeline/`, `engine/`, `ontology/`, manifests: hits are only (a) YAML comments citing Torrey's topical *outlines* (provenance notes, e.g. `ontology/concepts/creation.yaml:4`), (b) the docs cited above, (c) `docs/plans/2026-08-14-implementation-plan.md` planning items (not landed). `docs/research/torrey-topical/torrey-miller-topics.json` is a topic→refs outline dataset (topical, not chapter-by-chapter, no summaries).
- Workbench today: `workbench/static/index.html` has a "Passage context" disclosure (`renderPassageContextDisclosure`, line 1978) backed by `GET /api/v2/context` (`workbench/src/server.ts:693-722`), which returns the resolved passage expanded by **±2 verses** in the same chapter — raw verse text only. No summary, heading, tags, or book intro anywhere.

### ENGINE_VERSION and fingerprints

- `ENGINE_VERSION = '0.9.0'`, `TOKENIZER_VERSION = '1.0.0'` — `engine/src/config/engineVersion.ts` (lines 13, 22).
- Corpus fingerprint: `computeCorpusFingerprint` in `pipeline/src/buildCorpus.ts` (~line 69; stored as meta `corpus_fingerprint` line 184). Layer fingerprint: computed in `pipeline/src/buildConceptLayer.ts` (~line 285; stored as meta `layer_fingerprint` line 290) — per-record hash over compiled layer rows (concept rows, anchors, xrefs, translation tokens). Engine reads both from meta (`engine/src/corpus/repository.ts:130,133`). Any new context/summary table that affects results must feed the layer fingerprint per-record (the 2026-08-14 plan's pericope PR 1 step 8-9 says exactly this).

### Gauntlet/fixtures, one paragraph

Golden fixtures live in `eval/golden/*.json` (~150): each has `id`, `query`, `status` (active/pending), `coversConcepts`, `expectedTop` entries with `reference` + `requiredReasonFamily` + `requiredReasonLabel` (explanations are part of the contract), `expectedWithinTop`, `alsoAcceptable`, plus rank-sensitive fields (`preferredOrder`, `mustNotRank`) and `note` history. The gauntlet (`eval/src/gauntlet.ts`, gates in `eval/src/gates/`, thresholds in `eval/budgets.json`) runs gates G1–G11 (structural coverage, ordering snapshot G2, golden G3, collision G4, layer-B, probes G8, size budgets G10, etc.) and emits an Admission Report; a data pack with no fixture is rejected structurally, `NO MEASURABLE EFFECT` means don't merge, and unrunnable gates must report not-applicable-with-reason. Any new data table needs: a manifest in `pipeline/manifests/` (pinned sha256, rights class), a size-budget row in `eval/budgets.json`, importer + fingerprint wiring, and fixtures written FIRST.

## B. Do WEB section headings survive in our corpus snapshot?

**The question dissolves: headings were not stripped at ingestion — the WEB has (almost) none to strip.** Evidence:

1. Pinned source is eBible's **verse-per-line (VPL)** export: `pipeline/manifests/web.json` — `sourceUrl: https://ebible.org/Scriptures/engwebp_vpl.zip`, sha256 3458ca34…, re-admitted 2026-07-29. VPL format is `GEN 1:1 <text>` — one verse per line, structurally incapable of carrying `\s` headings (`pipeline/src/importers/vplImporter.ts` header comment, LINE regex).
2. I downloaded the upstream **USFM** edition (engwebp_usfm.zip from ebible.org, verified live 2026-08-22) and grepped all 66+ books: **zero `\s`/`\s1` section-heading lines in the entire translation.** The only structural markers beyond chapters/verses: `\d` Psalm superscriptions (138 lines — canonical Hebrew titles), `\ms1 BOOK 1..5` (the five Psalter book divisions), and `\sp` speaker labels in Song of Songs (33 lines: "Beloved", "Lover", "Friends"). The WEB editorially omits section headings. So "upstream WEB USFM still has them" is FALSE — there is no WEB heading set to ingest.
3. Psalm superscriptions DO survive in our snapshot, folded into verse 1 text: `pipeline/fixtures/web-subset.json` Ps 9:1 = "For the Chief Musician. Set to 'The Death of the Son.' A Psalm by David. I will give thanks…" (fixture line 6765). Independently noted in `/mnt/project-files/research/2026-08-21-uploaded-docs-assessment.md` line 46 ("Systematic finding #2 — headings inside verse 1").

**Implication for Jesse's idea:** chapter summaries + tags cannot be sourced from the pinned translation. They would have to be a NEW curated dataset (in-house editorial, or a licensed/PD headings source — e.g. the planned openbible-sections data is counts-only by license posture and deliberately excludes heading text).

## C. Prototype context tab: promised vs backed

Branch `claude/hearth-thread-wrhubh-p3`, commit 63bfeec ("added protoype", author jestek-dev, 2026-08-21). Files under `workbench/prototype/Project approval needed/`: `Curation Workbench.dc.html` (878 lines), `support.js` (dc-runtime), `DESIGN.md`, `github.md`.

- **UI**: right-hand aside ("Why this ranked" rail) is a two-tab tablist — "Why this ranked" and "**Context**" (dc.html lines 174–196). The Context tab body is a single prose block: `<div style="padding:16px;…max-width:40ch;">{{curContext}}</div>` (line 193), fed by `curContext: cur ? cur.ctx : ''` (line 771).
- **Pretend data**: every one of the 7 mock review items (dc.html lines 472–478) carries a hardcoded `ctx` string — 1–2 sentences of chapter/passage orientation plus a liturgical-use note. All seven, verbatim:
  - m1 Micah 7:18: "Micah closes with a song of confident hope: God pardons, has compassion, and casts sin into the depths of the sea (7:18–20). A frequent reading at services of assurance."
  - m2 Psalm 103:8: "Psalm 103 is David's call to bless the LORD for forgiveness, healing, and steadfast love; verse 8 echoes God's self-description to Moses."
  - m3 Exodus 34:6: "God proclaims his own name to Moses on Sinai — the self-description echoed across the Old Testament (Psalm 86, Joel 2, Jonah 4)."
  - m4 Genesis 43:14: "Jacob sends his sons back to Egypt with Benjamin, praying for favor before the ruler they do not yet know is Joseph."
  - r1 Psalm 46:1: "Psalm 46 — 'God is our refuge and strength' — the psalm behind 'A Mighty Fortress Is Our God.'"
  - r2 Psalm 91:2: "Psalm 91 is a sustained picture of shelter: wings, fortress, shield. Often read in seasons of fear."
  - r3 Nahum 1:7: "A line of comfort inside an oracle of judgment against Nineveh: the LORD knows those who take refuge in him."
- **What real data would back this**: a per-passage (chapter and/or pericope) **summary blurb** — narrative setting, what the surrounding unit is about, cross-echo pointers, and usage notes ("frequent reading at services of assurance") — i.e., exactly Jesse's "chapter/pericope summary with category tags" idea. NOTHING on main provides it: the real `/api/v2/context` returns ±2 raw verses; verse_terms are stemmed tokens, not prose; concepts label topics, not passages. Note the divergence: `/mnt/project-files/plans/2026-08-21-workbench-design-prompt.md` (line 48) asked for the rail "tabbed with **full passage context**" (i.e., verses — the backable thing), but the prototype rendered a prose summary instead — the prototype over-promises relative to both the design prompt and the data.
- Also unfaithful to the corpus: the mock `raw` verse texts are KJV wording ("pardoneth", "plenteous in mercy"), not WEB. Prototype `DESIGN.md` and `github.md` don't mention the Context tab's data source at all.

## D. Implementation plan (2026-08-20) — 0.14.0 "pericopes" item

`/mnt/project-files/plans/2026-08-20-implementation-plan.md`, Phase 5, item **P5.6 · CO-3** (lines 563–569), quoted in full:

> **P5.6 · CO-3 — Pericope grouping: PR 1 schema capability + PR 2 grouping behavior (prior-plan 1.10/1.11; re-sequenced; ENGINE_VERSION 0.14.0 + schema v8) [ENGINE_VERSION]**
> 1. *Intent:* the two remaining prior-plan pericope items, unclaimed by any converged section (B7 depends on them; the engine/QR sections flagged the slot as the version czar's call) — carried here so they cannot drop. Re-sequenced AFTER spelling/aliases because no measured audit failure names pericope grouping while misspelling is a battery F; §2.2 records the schema-slot reassignment (pericope now v8).
> 2. *Files:* per the prior plan's own §7.9 design: `pipeline/manifests/openbible-sections.json` (CC BY, counts-only — no heading text), schema.ts v8 (sections table), importer, engine grouping behavior + `requiredGroupingSourceId` fixture support, engineVersion → 0.14.0.
> 3. *Approach:* copy the capability-then-behavior discipline exactly (PR 1: table only, bit-identical ordering, G2 snapshot unchanged by construction; PR 2: grouping behavior + bump + regenerated snapshot with chained v2 approval). Full mechanics per `docs/plans/2026-08-14-implementation-plan.md` §7.9, updated to the reassigned slots.
> 4. *Verification:* PR 1 byte-identical snapshot proof; PR 2 fixture-first grouping fixtures; G10 size budget row for the new table; multi-verse-passage probes per the prior plan.
> 5. *Covenant/rollback:* PR 1 bump **no** (capability); PR 2 **ENGINE_VERSION bump: yes (0.14.0) + schema v8**. Rollback per-PR.
> 6. *DoD:* sections data pinned + archived; grouping behavior fixture-pinned; B7 unblocked; terminus version becomes 0.14.0 (CO-7 retargets accordingly).
> 7. *Needs-Jesse:* standard PR review + merge (no new judgment beyond the prior plan's own).

**Intent**: NOT summaries. It ships OpenBible.info's *bible-section-counts* dataset — for each candidate section span, how many of ~20 surveyed translations start a section there (**counts only, explicitly "no heading text"**, CC BY). A `pericopes(start_verse_id, end_verse_id, boundary_votes, source_id)` table (v8) is derived with a boundary-vote threshold (≥10), used at 0.14.0 solely to MERGE adjacent verse hits into one passage-level result (e.g., Psalm 136:1-26) with a countable grouping explanation. Full mechanics: `docs/plans/2026-08-14-implementation-plan.md` §7.9 (on main; there it was slotted v7/0.11.0 — NOT LANDED: main is still schema 6 / 0.9.0, no openbible-sections manifest exists).

**Directly adjacent item — the closest thing to Jesse's idea in any plan**: **P6.6 · B7 — "Pericope-level anchors + in-house PD preaching-themes pack (F29; DEFER until P5.6) [NEEDS JESSE]"** (lines 630–636): offline miner proposes 1–3 **theme labels per high-traffic pericope** grounded in ≥2 admitted PD expositors' distilled terms; human-curated packs, anchors take the pericope's exact range, no new schema (`concept_anchors` is range-native), pilot of 20 pericopes. That is pericope→tags (searchable themes), still not display summaries.

**J-questions**: **J59** (line 925): "Approve the 20-pericope pilot list and every theme label before fixtures are written (theme selection is interpretive judgment); and decide the provenance presentation once — derived manifest naming the mined expositors, or plain `editorial` with mining evidence in comments?" P5.6 itself carries no new J-number (standard review). Related tracker rows: F29→P6.6, prior-plan 1.10/1.11→P5.6 (lines 985, 1005–1006). Nothing in the plan mentions chapter summaries, a workbench context tab, or context display, except the consumer-contract note (line 671, P7.x CONSUMERS.md): crisis-display MUST "passage context not bare verses" — again meaning surrounding verses.

## E. Anything else relevant

- `/mnt/project-files/plans/2026-08-21-workbench-design-prompt.md` — the design brief the prototype was built from; line 48 specifies the right rail "tabbed with full passage context" (verses, backable today via /api/v2/context). One-line relevance: the Context tab was *specified* as passage text; the prototype upgraded it to prose summaries without a data plan.
- `/mnt/project-files/research/2026-08-21-uploaded-docs-assessment.md` — assessment of three uploaded docs (popularity data, topical mappings, "Gold-Standard Answer Key"); line 46 documents superscriptions living inside verse 1 in our corpus. The docs contain topic→verse mappings with rationales, not chapter summaries. Relevance: closest uploaded material to "curated prose about passages," and it flags exactly the superscription quirk any chapter-boundary/heading work must handle.
- `/mnt/project-files/research/2026-08-21-prototype-audit/` — screenshots only (16 PNGs of the prototype + old workbench); no ctx-tab-specific analysis file.
- `docs/plans/2026-08-14-implementation-plan.md` §7.9 (on main) — the full engineering design for pericope grouping, incl. verified upstream data facts: `https://a.openbible.info/data/bible-section-counts.txt`, sha256 5e9e838d…, 398,925 B, 12,649 rows; worked example James 1 tiling 1:1 / 1:2-18 / 1:19-27 at threshold ≥10; Psalm 136 = single pericope (12 votes).
- Constraint to carry into any proposal: CLAUDE.md #1 (no AI at runtime; AI-assisted offline datasets must pass gauntlet + human merge — chapter summaries drafted by AI would need the B7-style corroboration/human-curation pattern), #5 (explanations are contract), #6 (no theology scores — summaries/tags must describe, never adjudicate), and "never add data because it exists" (fixture-first; though a display-only context table that never affects ordering may sit outside G3's reach — that's a design question: display-layer data vs. ranking-layer data).
- Cleanup note: I downloaded engwebp_usfm.zip to the scratchpad for the heading check (evidence in §B); removed after use. No repo files touched; no checkouts; branches untouched.

---

## Appendix B — Source survey detail (worker findings, 2026-08-22)

# License-Verified Survey: Chapter-Summary / Section-Heading / Pericope Datasets

Date: 2026-08-22. Method: licenses verified by fetching each source's own license
page/statement; WEB and BSB claims additionally verified by downloading the actual
USFM distributions and grepping the markers. Verdicts use the project's covenant:
INGESTABLE = license-clean, could become curated data after human review;
LEARN-FROM-ONLY = may inform offline authoring, never ingested; REJECT = do not touch.

---

## A. World English Bible (WEB) — eBible.org USFM distribution

- **Covers:** The pinned corpus text itself. Downloaded `https://ebible.org/Scriptures/eng-web_usfm.zip`
  (3.2 MB, 66 canonical + apocrypha + front/glossary files, dated 2024-01-15) and grepped markers:
  - `\s1` section headings: **5 total in the whole distribution, all in the Apocrypha**
    (Letter of Jeremy in Baruch; the Greek additions to Daniel — Song of the Three,
    Susanna, Bel and the Dragon). **Zero genuine pericope titles in the 66 canonical books.**
  - `\r` parallel-passage references: 0.
  - `\p` paragraph markers: 9,254 — real translator-decided paragraph boundaries, usable
    as raw sub-chapter segmentation input (boundaries only, no titles).
  - `\d` descriptive titles: 139 (psalm superscriptions — these are canonical text, not headings).
  - `\ms1`: the five Psalter book divisions (BOOK 1–5).
- **License (verified):** worldenglish.bible: "The World English Bible (WEB) is a Public
  Domain (no copyright) Modern English translation of the Holy Bible." ebible.org/web/copyright.htm:
  "The World English Bible is in the Public Domain. That means that it is not copyrighted."
  Caveats: the name "World English Bible" is a trademark of eBible.org; modified texts must
  not be called the WEB. URLs: https://worldenglish.bible/ , https://ebible.org/web/copyright.htm
- **Quality/format:** Clean USFM with Strong's tagging (`\w ...|strong="H####"\w*`), machine-readable.
- **Verdict:** Text and `\p` paragraph boundaries **INGESTABLE** (already the pinned corpus).
  As a headings/summary source: **contributes nothing** — the WEB deliberately ships without
  section headings. Any heading layer must come from elsewhere or be authored.
- **Theological caveats:** None; headings absent by design.

## B. Chris Juby's @biblesummary (biblesummary.info)

- **Covers:** Exactly 1,189 chapter summaries, each ≤140 characters. Precisely the
  chapter-summary shape the project wants.
- **License (verified):** NOT open. biblesummary.info/licensing/ gives custom terms:
  individual summaries may be quoted with attribution ("@BibleSummary, Chris Juby,
  www.biblesummary.info"), but for "larger sections or the complete project" permission
  must be negotiated with the author. He states he is "very open to conversations" and
  will likely grant royalty-free permission to projects that are "Small, Offline,
  Non-profit, Helping people to engage with Scripture, Not pushing a narrow theological
  agenda," with a link-back requirement. URL: https://www.biblesummary.info/licensing/
- **Quality/format:** Highly structured (one tweet per chapter), trivially extractable.
- **Verdict:** **LEARN-FROM-ONLY as-is.** No open license; bulk ingestion without written
  permission violates the covenant. Note: this project plausibly matches his stated
  permission criteria — a direct ask is a live option, but until a written grant exists
  it is not ingestable. Even with permission, "royalty-free permission with link-back"
  is a bespoke grant, not an open license — provenance record would need to carry it.
- **Theological caveats:** Summaries are descriptive/neutral; author is a UK church
  worship director. Low risk, but each summary compresses aggressively — human review
  needed anyway.

## C. "The Summarized Bible" — Keith L. Brooks (1919)

- **Covers:** Every chapter of the Bible: Contents (one-line chapter title/outline),
  Characters, Conclusion/lesson, Key Word, Strong Verses, Striking Facts. This is the
  best PD match for "brief chapter summary + a key-word tag" per chapter.
- **License (verified):** Published 1919 by Bible Institute of Los Angeles → pre-1930 US
  publication → **public domain in the US**. Internet Archive marks both volumes
  NOT_IN_COPYRIGHT:
  - OT: https://archive.org/details/summarizedbible00broorich
  - NT: https://archive.org/details/summarizedbible01broogoog and /summarizedbiblec00broorich
- **Quality/format:** Archive.org copies are page scans + OCR (OCR quality mediocre;
  structured fields make cleanup tractable). A retyped PDF circulates at
  https://www.hopefaithprayer.com/books/The_Summarized_Bible_by_%20Keith_L_Brooks_1919.pdf ;
  e-Sword/MySword module text also circulates. All need extraction into structured
  per-chapter records — prose-with-consistent-field-labels, not data.
  (Note: "The Bible Summarized Handbook" is a later in-copyright repackaging — use only
  the 1919 text.)
- **Verdict:** **INGESTABLE** (PD). Best available chapter-summary base layer; requires
  an extraction pass + human review per chapter.
- **Theological caveats:** Conservative evangelical (BIOLA, 1919), premillennial leanings
  in places, dated phrasing, "Christ seen in every chapter" typology in the "Striking
  Facts" field can over-read Christ into OT passages — fine for a broadly evangelical
  frame but each entry needs review; the typological field should probably be dropped
  or heavily curated.

## D. Matthew Henry's Concise Commentary

- **Covers:** Whole Bible, per chapter: a short chapter outline (verse-range headings)
  followed by devotional exposition per verse-range section. The per-chapter outline
  lines are chapter-summary-shaped; the verse-range sections give implicit sub-chapter
  divisions with one-phrase titles.
- **License (verified):** Matthew Henry died 1714; the Concise abridgment is 19th-century.
  PD by age everywhere — not seriously contestable. CCEL hosts it
  (https://www.ccel.org/ccel/henry/mhcc.titlepage.html; CCEL page itself shows no explicit
  rights line, but PD-by-age is dispositive for the underlying text). A clean structured
  digital source exists: **github.com/lyteword/mhenry-concise** — markdown edition,
  organized per book, repo tagged **CC0-1.0**. Also github.com/Jackboby/MHCC-JSON
  ("full extractable JSON ... (Public Domain)"). e-Sword/MySword MHCC modules also circulate.
- **Quality/format:** Semi-structured — verse-range sections are consistent; outline
  phrases extractable with modest effort from the markdown/JSON repos.
- **Verdict:** **INGESTABLE** (PD; CC0 digital editions available). Second chapter-summary
  source and a cross-check on Brooks; its verse-range sectioning is also a useful
  cross-check on BSB pericope boundaries.
- **Theological caveats:** Puritan/Reformed devotional voice, 18th-century idiom; some
  applications dated. Doctrinally comfortably inside an NAE-style core; wording would be
  rewritten, not quoted, for summaries.

## E. Nave's Topical Bible & Torrey's New Topical Textbook (already ingested)

- Confirmed present in the project (pipeline/src/importers/ontologyImporter.ts etc.).
- Both are topic → verse-reference lists. **Nothing chapter-summary- or pericope-shaped**:
  no chapter units, no boundaries, no summaries. Their contribution to this goal is only
  as an existing **tag vocabulary** (topic names) that chapter/section tags should reuse
  rather than inventing a parallel vocabulary.

## F. STEPBible open data (github.com/STEPBible/STEPBible-Data)

- **Covers:** TAHOT/TAGNT (tagged Hebrew/Greek texts), TBESH/TBESG/TFLSJ (lexicons),
  TIPNR (proper names with genealogies), TVTMS (versification mappings), TEHMC/TEGMC
  (morphology codes). **No section-heading, pericope, outline, or chapter-summary
  dataset exists in the repo** (verified against the README's dataset list).
- **License (verified):** CC BY 4.0. README: allows you to "Include any part of
  STEPBible-Data in any software or publications without requesting permission,"
  requiring credit "to 'STEP Bible' linked to www.STEPBible.org."
  URL: https://github.com/STEPBible/STEPBible-Data
- **Verdict:** **INGESTABLE license, but not relevant to this goal.** TIPNR (proper
  names/people/places, CC BY) could feed entity tags for sections; TVTMS matters if
  pericope data from other versification traditions is ever mapped onto the WEB.
- **Theological caveats:** None (Tyndale House scholarship, translation-neutral).

## G. OpenBible.info

- **Covers:** Topic → verse votes (crowd data, downloadable, updated weekly), cross
  references, geocoding. **No pericope or outline dataset.**
- **License (verified):** "Unless otherwise indicated, all content is licensed under a
  Creative Commons Attribution License" — linking to **CC BY 4.0** (verified on
  https://www.openbible.info/labs/cross-references/ ; same statement governs the topics
  data on https://www.openbible.info/topics/ ). **Attribution-only — no SA clause**, so
  no copyleft contamination problem.
- **Quality/format:** Structured downloadable files (topic votes + raw vote counts).
- **Verdict:** **INGESTABLE** (CC BY 4.0, attribution required) — but as tag/topic signal,
  not as summaries. Crowd-vote provenance means per-topic human review is essential
  (votes reflect popularity, not exegesis; some verses win votes on wording, not meaning).
- **Theological caveats:** Crowd-sourced relevance, doctrinally unvetted; treat votes as
  a ranking hint, never as a curated claim.

## H. Berean Standard Bible (BSB) — **the standout find**

- **Covers:** Downloaded `https://bereanbible.com/bsb_usfm.zip` and grepped: the BSB USFM
  carries **3,096 `\s1` section headings covering all 66 books (zero books without
  headings; Psalms = 150, one per psalm)** plus `\r` parallel-passage references (e.g.
  `\r (Genesis 5:1–32; ...)` under 1 Chronicles genealogies). Heading positions between
  verses give machine-derivable pericope boundaries. 3,096 is squarely in the project's
  2–4k target. Sample titles: "From Adam to Abraham", "The Kings of Edom", "Deliverance
  from the Furnace" — genuine pericope titles, modern English. Also distributed: USX, USJ
  (JSON), tables (tsv/xlsx), and a "Bible book outlines" PDF.
- **License (verified):** berean.bible/licensing.htm: "The Berean Bible and Majority
  Bible texts are officially placed into the public domain as of April 30, 2023."
  berean.bible/terms.htm: "The Berean Bible and Majority Bible texts are officially
  dedicated to the public domain as of April 30, 2023. All uses are freely permitted."
  Courtesy request only: derivative works that vary from the official text should not
  use the Berean name.
  - Scope question (headings PD too?): the dedication covers "the Berean Bible ...
    texts" and the terms say "all uses are freely permitted" without carving out
    headings; the headings ship inside the officially distributed USFM/USX of that text.
    Reasonable reading: headings are part of the dedicated work. **Residual risk: low,
    but the dedication does not name section headings explicitly** — worth a one-line
    confirmation email to the Berean project for the provenance record.
- **Quality/format:** Clean USFM/USX/USJ; boundaries + titles extractable deterministically.
- **Verdict:** **INGESTABLE — best pericope-boundary AND pericope-title source available.**
  One structural note: BSB headings sit on BSB versification/paragraphing; mapping onto
  WEB verse spans is mostly 1:1 but needs a verification pass (TVTMS can help at the edges).
- **Theological caveats:** Broadly evangelical, interdenominational translation team;
  headings are conventional evangelical pericope titles. Low risk; normal human review.

## I. Pericope-division datasets (machine-readable boundaries)

Investigated candidates, best-to-worst:

1. **BSB `\s1` + `\r` (see H)** — PD, complete, 3,096 units, machine-readable. Winner.
2. **WEB `\p` paragraphs (see A)** — PD, 9,254 boundaries in the corpus's own
   versification; useful as sub-pericope segmentation and to sanity-check BSB boundary
   mapping. No titles.
3. **Open Scriptures Hebrew Bible (openscriptures/morphhb)** — text PD, added data
   CC BY 4.0 ("Lemma and morphology data are licensed under a Creative Commons
   Attribution 4.0 International license"). Carries WLC text from which Masoretic
   petuchah/setumah paragraphing is derivable — a traditional OT division witness
   (verify marker presence at ingestion time; README doesn't advertise it).
4. **Open English Bible** — CC0 ("it is in the public domain ... completely without
   restrictions", openenglishbible.org), has modern section headings, but coverage is
   incomplete (NT + Psalms + a few OT books). Secondary witness only.
- **sil-ai/pericopes (github)** — pericopes.csv scraped from biblestudystart.com/outlines/;
  **no LICENSE file, scraped from a site with no open license → REJECT** (provenance fails
  the covenant even though the repo is public).
- **Sefaria parashot/aliyot** — Sefaria-Export licensing is per-text (LICENSE.md defers
  to individual text licenses); parashah boundaries themselves are ancient tradition
  (facts), but the practical need is OT-only and Jewish liturgical units don't match
  evangelical pericope expectations. Marginal; skip.
- **Lectionary tables (RCL)** — the Revised Common Lectionary table is © Consultation on
  Common Texts (freely reproduced with permission notices, not open-licensed); covers
  only lectionary readings, not the whole Bible. REJECT for ingestion.
- **Aland, Synopsis Quattuor Evangeliorum pericope list** — German Bible Society editions
  (1963–1997), firmly in copyright. **REJECT for ingestion**; at most learn-from for
  Gospels-parallel awareness (and BSB's `\r` already provides parallel refs, PD).

## J. Book-level outlines from PD reference works

- **ISBE — International Standard Bible Encyclopedia (1915, rev. 1929-precursor eds.):**
  1915 publication → PD in the US by age. Book articles contain scholarly outlines and
  content summaries per Bible book. Digital: CCEL, BibleHub, StudyLight; e-Sword modules;
  prose HTML needing extraction. **INGESTABLE** for book-level outlines/tags. Caveat:
  century-old scholarship (dated critical positions in places, though ISBE 1915 is
  conservative overall); review per article.
- **Scofield Reference Notes (1917 edition):** 1909/1917 US publication → PD by age
  (the 1967 New Scofield is NOT PD — must use the 1917 text; e-Sword/StudyLight/
  sacred-texts host the 1917 notes). Contains book introductions/outlines and section
  notes. **INGESTABLE license-wise, but significant theological caveat:** hard
  dispensationalism (rigid dispensations, Israel/church separation, law/grace framing)
  is narrower than an NAE-style core and colors even his outlines. Recommend
  LEARN-FROM-ONLY in practice, or ingest only structural outlines with per-item review;
  never his interpretive notes.

## Modern tools (LEARN-FROM-ONLY — structure, never content)

ESV/NIV/Logos section headings are in-copyright (Crossway/Biblica/Zondervan; Logos's
pericope lists and passage guides are proprietary) — observe only their *conventions*:
short noun-phrase titles, boundaries at speaker/scene shifts, parallel-passage refs
attached to headings. BibleProject book overviews (copyrighted, free-to-view) model
book-level literary-structure outlines worth imitating in shape. Nothing from any of
these may be ingested.

---

## Ranked shortlist

**Best ingestable pericope-boundary (and title) source:**
1. **BSB USFM `\s1` headings + `\r` parallel refs** — PD dedication (2023-04-30), 3,096
   sections, all 66 books, machine-readable, right granularity. Action items: map onto
   WEB versification with a verification pass; optionally get one-line email confirmation
   that the dedication covers headings.
2. Cross-checks: WEB `\p` paragraphs (PD, in-corpus), MHCC verse-range sections (PD),
   OEB headings where they exist (CC0).

**Best ingestable chapter-summary sources:**
1. **Brooks, The Summarized Bible (1919, PD)** — purpose-built per-chapter summary +
   key word + key verses; needs OCR cleanup/extraction + per-chapter theological review.
2. **Matthew Henry's Concise (PD; CC0 markdown/JSON on GitHub)** — chapter outlines and
   verse-range section phrases as a second witness.
3. (If written permission is obtained: Juby's biblesummary — best modern phrasing, 1,189
   ready-made; without a grant it stays LEARN-FROM-ONLY.)

**Best tag-vocabulary starting point:**
- The project's existing **Nave's + Torrey's topic vocabulary** (reuse, don't fork), with
  **OpenBible.info topic-votes (CC BY 4.0)** as frequency/aliasing signal and STEPBible
  **TIPNR (CC BY 4.0)** for people/place entity tags on sections.

**No clean source — must be authored offline (then gauntlet + human PR per covenant):**
- Modern-English **chapter summaries in the project's own voice** (Brooks/MHCC are PD
  raw material but 1719–1919 idiom; final summary text is effectively authored).
- **Category tags per chapter/section** — no source ships them; must be assigned
  offline against the existing topic vocabulary.
- **Pericope titles harmonized to WEB versification** where BSB boundaries need
  adjustment, and headings for any WEB-only material (e.g. if apocryphal books are ever
  in scope beyond BSB's 66).
- Any **book-level theological-theme metadata** beyond what ISBE outlines yield.
