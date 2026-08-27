# The Keller tagging system, and whether chapter tags should feed search

Date: 2026-08-22
Prepared for: Jesse
Sources: web research on "the Keller brain system of tagging" and a code-plus-live-search analysis of the engine (both files cited in the appendix)

---

## Answers first

- **"Keller brain" almost certainly means Tim Keller's Gospel in Life sermon archive** — the free, tagged collection of 2,200+ sermons at gospelinlife.com. No product or method literally called "Keller brain" exists; the other candidates (the Keller Center at TGC, a "second brain" note-taking method, Gary Keller of *The ONE Thing*) were all checked and ruled out. Please confirm this is what you meant.
- **Yes, there is real learning in it — and the good news is our design already matches it.** Keller's archive covers 34 years of preaching with just 56 flat topics, sparse tagging (about 3 topics per sermon), and precise verse-range scripture anchors. That is the shape of our ~110-concept layer. The lessons are about refinement, not redesign: invest in aliases rather than more categories, tag what a passage is *chiefly about*, and consider showing honest per-topic counts.
- **On chapter tags as a search index: no — don't feed chapter-level tags into ranking.** We ran your exact example against the real engine. For the bare word "blood," Genesis 4:10 ranks #45 out of 368 verses that contain the word — but for the phrasings a person would actually type about that motif, it already surfaces: "blood cries out from the ground" puts Genesis 4:10 at **#1** today, with a correct explanation, using machinery we already have. A chapter tag would only change the bare one-word query, where pushing all of Genesis 4 above Leviticus 17:11 or the Passover would be the *wrong* scripture winning.
- **But yes — change what the rollout captures, now, before the 1,189-chapter pass.** The Genesis pilot already writes a verse-range justification for every tag. Make that a required structured field, add a required "motif candidates" field (motif + verses + the 2-3 phrases someone would type), and align section IDs to the planned section spine. This costs minutes per chapter now and keeps the door open to search integration later without redoing the whole Bible.
- **Whether tags ever feed ranking stays an open decision for later** — and if the answer is ever yes, the engine already has a sanctioned, no-new-machinery path for it (verse-range concept anchors, added fixtures-first through the normal curation gauntlet).

---

## Part 1 — The Keller system: what it is and what it teaches us

### Identifying it

The phrase "the Keller brain system of tagging" doesn't name any single system on the web. The research checked four candidates:

- **Tim Keller's Gospel in Life sermon archive** (gospelinlife.com) — the strongest match by far. Roughly 2,200 sermons and resources from Redeemer Presbyterian (1989-2017), made free after Keller's death in May 2023, all tagged by topic and anchored to scripture. It functions as Keller's externalized "brain," and its topic-plus-scripture double indexing is exactly the design problem our engine solves. The word "brain" is most likely your own metaphor (or an echo of "second brain" note-taking language), not an official name.
- **The Keller Center for Cultural Apologetics** at The Gospel Coalition — an essay-and-podcast program with no distinctive tagging system. Ruled out.
- **A "second brain" note-taking method by someone named Keller** — searched directly; nothing exists. That space belongs to Tiago Forte. Ruled out.
- **Gary Keller** (*The ONE Thing*) — a focus book, no tagging system. Ruled out. (An academic "Brain Tagging" e-learning paper also turned up — a coincidental keyword collision.)

The rest of this report assumes the Gospel in Life interpretation. **If you meant something else — a private tool, something from a conversation — say so and we'll re-research.**

### How Gospel in Life organizes 2,200 sermons

The archive is browsed through five independent filters, each showing item counts: content type, topic, scripture, speaker, and year. Two of those matter to us.

**The topic list is small, flat, and skewed — and it works.** Just 56 topics for ~2,000 sermons. No hierarchy at all. The biggest topic (Salvation, 147 sermons) is about 37 times the smallest (Lent, 4), and no topic is empty because the list is derived from what was actually assigned. Systematic-theology terms (Atonement, Justification), practical-life terms (Anxiety, Marriage, Money), church-calendar terms (Advent, Easter), and Keller's own distinctives (Cities, Idolatry, Work & Faith) all sit side by side with no attempt to force them into one scheme. Where topics could have splintered, they use compound labels instead: "Stewardship, Generosity and Money," "The Church (Unity, Fellowship, Leadership)."

**Tagging is sparse and precise.** A sample sermon ("The Prodigal Sons," 2005) carries exactly three topics — Identity, Sin, Salvation — plus one scripture anchor. The topics mark what the sermon is *chiefly about*, not everything it mentions. That is why a topic filter click returns sermons genuinely about the topic rather than a pile of passing mentions.

**Scripture anchors are verse ranges, including discontinuous ones.** That same sermon is anchored to "Luke 15:1-2, 11-32" — the exact preached passage, not the whole chapter and not individual verses. Filtering to "Luke 15" finds it because the site checks whether anchor ranges *intersect* the filter, which is precisely how our engine's concept anchors already work.

There is also a sibling system worth knowing about: the Timothy Keller Sermon Archive inside Logos Bible Software (1,300+ transcripts), which additionally links every scripture citation *inside* each transcript, so studying any passage surfaces sermons that cite it — a two-tier model where "this sermon treats this passage" and "this sermon mentions this passage" are kept distinct.

### What transfers to our engine

1. **Flat and well-chosen beats deep hierarchy.** 34 years of preaching needed only 56 flat topics. Our ~110-concept flat vocabulary is the right shape; hierarchy would add complexity (and, for a deterministic engine, tricky inheritance questions) without adding usability.
2. **Invest in aliases, not more taxonomy.** Keller's compound labels are synonym-absorption done by hand. Our version of that trick is richer alias and phrasing lists per concept, feeding the one shared tokenizer — cheaper and more searchable than minting new concepts.
3. **Tag sparsely, for "chiefly about" precision.** Since our concept tags are presence-only (a tag either exists or it doesn't — there is no dial to turn a weak tag down), admitting weak associations directly pollutes results. Sparse tagging is a curation-review criterion, and golden test fixtures should test what should *not* surface, not just what should.
4. **Verse-range anchors with range-intersection lookup is exactly what we already do.** "Luke 15:1-2, 11-32" validates our grain. One check worth making: that our data model and admission checks comfortably permit *discontinuous* multi-range anchors, since natural preaching units are sometimes discontinuous.
5. **Keep "treats" and "mentions" as distinct link types.** If we ever ingest expositional sources with incidental cross-references, the Logos two-tier model is the pattern: an anchor and a passing citation must carry different explanations, or our explanation contract breaks even when ranking looks fine.
6. **Faceted counts are the honest interface for an unscored index.** Presence-only tags can't rank, but they can count and intersect deterministically. Showing "Salvation (147)"-style counts gives users navigation without ranking — and gives curators a live coverage report ("Lent (4)" instantly reveals a thin spot). This falls straight out of data we already have.
7. **Stable IDs survive platform churn.** That 2005 sermon still carries its cassette-era catalog number, which is what let the corpus move tapes → paid site → Logos → free site without losing cross-references. The analogue for us: stable per-assertion or per-pack IDs in the curated layer, so entries stay addressable across artifact rebuilds.

---

## Part 2 — Should chapter tags double as a search index?

### The test: your "blood" example, run against the real engine

We didn't reason about this in the abstract — we ran the searches. The engine as built today, against the published scripture database:

| Query | Where Genesis 4:10 ranks | Why |
|---|---|---|
| `blood` | **#45** of 368 matching verses (below the 25-result page) | Pure concordance behavior: no concept fires on the bare word, so it's a word-match list; Gen 4:10 scores low because it's a long verse. Top results: Psalm 78:44, Numbers 35:19, Deuteronomy 12:16… |
| `blood cries out from the ground` | **#1** (score 15.50) | Existing verse-level signals: commentary-derived "Preached vocabulary: blood, cries, ground" plus word overlap and proximity — a correct, checkable explanation |
| `abel's blood` / `blood of abel` | **#5**, behind Hebrews 12:24, Luke 11:51, Matthew 23:35 | Those NT verses are explicitly *about* Abel's blood, so they deserve to rank above the source verse; Gen 4:10's reason chip already reads "Preached vocabulary: abel, blood" |

The takeaway: **for anyone who types more than the bare word, Genesis 4:10 already surfaces — at #1 with the natural phrasing.** The only query a chapter-level "blood" tag would change is the bare word `blood`. And there, making all 26 verses of Genesis 4 outrank Leviticus 17:11 ("the life of the flesh is in the blood"), the Passover in Exodus 12, or the passion narratives would be the wrong scripture winning a query it shouldn't win. Our own working rules have a name for an addition that changes nothing a real query needs: NO MEASURABLE EFFECT — and it means don't merge.

### Why the engine's design resists chapter-level tags

Everything in the engine is built around the verse range as the unit of curated meaning. Concept anchors are stored as verse ranges; when consecutive ranked verses belong to one curated span, the display collapses them into the single passage a human chose; and every result must carry an explanation that can be checked against the exact text it points to. A whole-chapter tag has no honest explanation string — "this chapter mentions blood somewhere" is not "the right words to the proper scripture," and a wrong reason on a correctly-ranked result counts as a failure in our gates, not a cosmetic issue.

There is also a cost asymmetry:

- **If a tag deserves to feed search, it should become a verse-range concept anchor** through the existing curation path — golden fixture written first, gauntlet-measured, human-merged. The implementation plan already has a sanctioned slot for exactly this (the P6.6·B7/J59 "pericope theme labels" item: 1-3 curated labels per high-traffic passage, entering the existing anchors table with **zero new engine machinery**).
- **Chapter-level, rangeless tags would need a new signal family** — a new evidence type, budget-table changes, an ENGINE_VERSION bump, regenerated ordering snapshots, and new fixture families. High engineering cost, and the measured evidence above says the payoff would likely be nothing.

### Should "blood" become a concept? No — and the example tells us why

"Blood" the bare word is a concordance query the engine already answers honestly (368 verses, word-match list). An engine that answered "blood" with a curated theology-of-blood selection would be quietly adjudicating which blood passages matter — which our covenant forbids. "Abel's blood crying from the ground" is something different: a **motif** — a two-verse narrative image that later scripture cross-references beautifully (Hebrews 12:24, Matthew 23:35). The right future home for a motif like that is a verse-range anchor under a real concept (something like innocent blood, or witness of blood, or the pilot's proposed divine-judgment), added through normal curation *if a measured gap ever shows one is needed*. Notably, the Genesis pilot's own drafters — who read every chapter closely and proposed 14 new concepts — did not propose "blood." The motif tier sits below even the proposed-concepts tier.

### The "before we get too far" answer: change what the rollout captures

Here is the part that genuinely gates the rollout. The Genesis pilot already records a verse-range justification for every tag — for Genesis 4: `sin` → 4:7 and 4:8-12; `worship` → 4:3-4 and 4:26. Those justifications are, almost verbatim, the anchor rows the engine would need if tags ever feed search. Right now they live as prose. The fix is to make three things **required structured fields** for every rollout thread, starting immediately:

**Rollout capture checklist (required per chapter/section):**

1. **Per-tag verse-range references, as data rather than prose.** Every tag already gets one in pilot practice — formalize it as a machine-readable field: concept, verse refs, and a short evidence note. This makes every tag falsifiable in review (which we want anyway), and it means "compile tags into search anchors" later is a mechanical step, not a re-read.
2. **A motif-candidates list.** The drafters are the last people who will read every chapter this closely. Have them record salient narrow motifs *even when no concept fits* — motif name, verse refs, and the 2-3 query phrasings a person would actually type (e.g., motif: "Abel's blood cries from the ground"; refs: 4:10-11; queries: "blood cries out," "abel's blood"). This is the raw feed for future concept packs **and** for their golden fixtures — the expensive part of concept curation is finding the anchors and phrasings, and this captures both as a byproduct.
3. **Stable section IDs aligned to the BSB heading spine** the engine's future passage-grouping work will use, so the summaries' sections and the engine's sections name the same units. This is already the pilot's practice; keep it mandatory.

Cost: minutes per chapter at drafting time. The alternative — deciding later that we want this data — is a second pass over 1,189 chapters.

With these three fields, the decision stays genuinely open and cheap in both directions. Tags ship display-only now, which requires **no ENGINE_VERSION bump** and never changes result ordering (the existing schema plan already draws this line explicitly). If you later want tags to feed search, the captured refs compile mechanically into candidate anchors, the motif candidates become concept proposals with ready-made fixtures, and everything goes through the normal fixtures-first, gauntlet-measured, human-merged process.

---

## Open questions for Jesse

1. **Confirm the Keller identification.** Is "the Keller brain system" the Gospel in Life sermon archive (Tim Keller's tagged sermon collection)? If you meant something else, tell us what and we'll re-research.
2. **Approve the three required capture fields** for rollout threads: (a) per-tag verse-range refs as structured data, (b) motif candidates with verse refs and query phrasings, (c) spine-aligned section IDs. This is the only change to the rollout, and it gates starting the next books.
3. **Note that "do tags ever feed ranking?" remains open — deliberately.** Nothing in this recommendation closes it. It stays a later decision, to be made against measured gaps, through the already-planned pericope-labels path, with fixtures and version discipline. No answer is needed now.

---

## Appendix — Evidence and citations

### Source files

- Keller research: `/tmp/claude-0/-home-user-scripture-search-engine/e603bf4c-1038-58ff-9838-6cebf9bce8f1/scratchpad/keller-research.md` (web research, fetched 2026-08-22)
- Engine analysis: `/tmp/claude-0/-home-user-scripture-search-engine/e603bf4c-1038-58ff-9838-6cebf9bce8f1/scratchpad/engine-analysis.md` (read-only code analysis at repo commit 9542c83, ENGINE_VERSION 0.9.0; live searches run against the published v0.7.1 artifact and a fixture build of the current 108-concept layer)

### Keller / Gospel in Life sources (fetched or snippet-sourced 2026-08-22)

- https://gospelinlife.com/all-resources/ — facets and counts
- https://gospelinlife.com/sermons/ — the 56-topic flat taxonomy with counts; scripture book/chapter/verse filter; "2207 Results"
- https://gospelinlife.com/sermon/the-prodigal-sons/ — per-sermon metadata: scripture "Luke 15:1-2, 11-32"; topics Identity, Sin, Salvation; SKU RS 187-01
- https://www.logos.com/product/207157/timothy-keller-sermon-archive-1989-2017 and https://www.logos.com/product/49144/tim-keller-sermon-archive — Logos transcript archive (product pages; some detail from search snippets — the Logos help article returned HTTP 403 through the session proxy)
- https://sermon-transcription.com/sermon-archives/tim-keller — three-entry-modes framing
- Ruled out: https://www.thegospelcoalition.org/article/tgc-announces-keller-center/ ; https://www.christianitytoday.com/2023/02/tgc-tim-keller-center-cultural-apologetics-collin-hansen/ (Keller Center); https://en.wikipedia.org/wiki/The_One_Thing_(book) (Gary Keller); https://link.springer.com/chapter/10.1007/978-3-319-58509-3_5 (academic "Brain Tagging" — keyword coincidence)

### Engine code citations (repo: /home/user/scripture-search-engine @ 9542c83)

- Concept matching is containment-only, no fuzzing: `engine/src/corpus/repository.ts:419-450` (all-tokens-present test at line 433; anti-fuzz rationale in comment at 410-418)
- Anchors are verse-range native; one candidate per verse of the range, carrying the anchor span: `engine/src/corpus/repository.ts:453-484`, `380-392`
- Concept-anchor evidence, "Theme: {label}", specificity and coverage math: `engine/src/intents/concept.ts:17-19`, `35-37`, `68-84`
- Bare-word demotion to weak "Theme cue": `engine/src/intents/concept.ts:53`, `93-138`; orchestration `engine/src/createEngine.ts:257-306`
- Signal budgets (concept_anchor 40 authoritative; weak aggregate cap 30; exact_phrase 60): `engine/src/ranking/budgets.ts:50-73`, guardrail note at `1-18`; family tiers in `engine/src/reasons/types.ts:20-38`
- Explanation contract ("the explanation IS the product") and required provenance: `engine/src/reasons/types.ts:1-12`, `44-59`; source labels `engine/src/intents/concept.ts:292-334`
- Deterministic tie-break and default 25-result page: `engine/src/ranking/rank.ts:46`, `55-61`; diversification exemption for authoritative evidence: `rank.ts:90-100`
- Anchor-run collapse to the human-chosen span: `engine/src/createEngine.ts:594-677`
- "blood" in the concept layer: only inside multi-word phrases — `ontology/concepts/the-cross.yaml:8` ("the blood of jesus"), `ontology/concepts/lords-supper.yaml:11` ("the body and blood of christ"); 108 concepts total in `ontology/concepts/`
- ENGINE_VERSION: `engine/src/config/engineVersion.ts:13`

### Measured search results (published v0.7.1 content.db, 31,098 WEB verses)

- `blood`: 368 matching verses; zero concepts fire (confirmed on both the published artifact and a fresh fixture build of the 108-concept layer via `pipeline/src/buildFixtureDb.ts`); Genesis 4:10 at #45 (score 3.00, "Shared word: blood"); Genesis 9:4 at #21; top results Psalm 78:44, Numbers 35:19, Deuteronomy 12:16
- `blood cries out from the ground`: Genesis 4:10 at #1 (score 15.50; passage_terms "Preached vocabulary: blood, crie, ground" + token_overlap + proximity)
- `abels blood` / `blood of abel`: Genesis 4:10 at #5 behind Hebrews 12:24, Luke 11:51, Matthew 23:35; reason "Preached vocabulary: abel, blood" (Layer B verse_terms, commentary provenance)

### Project documents

- Genesis pilot (tags with verse-range justifications; 14 proposed concepts; no "blood" proposal): `/mnt/project-files/research/2026-08-22-genesis-pilot-summaries.md`
- Schema assessment (display-only tags need no ENGINE_VERSION bump — Step 5): `/mnt/project-files/research/2026-08-22-chapter-summaries-assessment.md`
- Implementation plan: P5.6·CO-3 (section spine, passage grouping at 0.14.0) and P6.6·B7/J59 (the sanctioned tags-feed-search path via existing `concept_anchors`, no new schema) — see team memory `implementation-plan-2026-08-20`
