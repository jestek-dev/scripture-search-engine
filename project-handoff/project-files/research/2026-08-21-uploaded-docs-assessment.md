# Assessment of Jesse's three uploaded research docs — 2026-08-21

## Verdicts

**Doc 1 — "Top 100 Most Popular Bible Verses" — USEFUL WITH REVIEW.** The underlying data is real (World Vision UK/Ahrefs, YouVersion, Bible Gateway, TopVerses, Lifeway all verified against primary sources, mostly verbatim), but the composite #1–100 ordering is the author's own blend — trust the tiers, not the ordinals. Its Recommendation 1 ("weight the index for ranking") is REJECTED: a popularity boost is exactly the hidden ranking weight DOCTRINAL-BASIS §1 and the covenant forbid; seasonal boosting (Rec 4/5) also breaks determinism as stated. The compliant path for popularity data is the reviewed-attributed-data pattern (plan P6.1·B1), and whether it may inform curated tie-breaks or judgment labels is a Jesse decision. 80/100 verses are already concept anchors; the ~20 unanchored refs are a useful coverage checklist. Verse texts are NOT safe to paste (several loosely shortened; Joshua 1:9 is a wrong reconstruction; our corpus reads "the LORD", never "Yahweh").

**Doc 2 — "What Christians Search For" master test set — USEFUL AS-IS as a query inventory (the most immediately usable of the three).** ~700 queries across 26 categories; 56 already exist verbatim as fixture queries, 137 near-verbatim, roughly two-thirds genuinely new. It independently confirms the plan's gap list (doctrinal terms, dying-parent, misspellings, "John 3 16" reference formats, KJV vocab). Plug-in points: appends to the P1.1·E1 84-query regression battery (not a replacement), seeds for MS-3's felt-need-map and theological glossary, and Ring-1 seed strata for the Phase 8 mega-sweep (P8.2·MS-2 / P8.5·MS-5) — it is two orders of magnitude short of Phase 8's ≥40k floor, so it does NOT replace that item. Its head-verse lists need rework before any use: Jeremiah 30:17 and Exodus 15:26 rejected as personal-healing head verses (national-covenant promises recruited as health pledges), and the Category 12 money list pairs three repo-watchlist refs (Malachi 3:10, Luke 6:38, Philippians 4:19) with "financial breakthrough" queries — it would trip our own G4 red-flag check. Category 24 culture-war queries: adopt as coverage-only queries; fixture design reserved for Jesse.

**Doc 3 — "Gold-Standard Answer Key" — USEFUL WITH REVIEW (best theological quality of the three).** All ~180 mappings reviewed against DOCTRINAL-BASIS.md: zero sense inversions, and its six self-flagged cautions (Jer 29:11, Phil 4:13, Prov 22:6, Ps 91, Mark 11:24, 2 Cor 6:14) are accurate and adequate. 90% of sampled refs are already anchors in matching concepts, so its main value is not new coverage but as a provisional seed for graded relevance judgments (P1.1 judgments.json, P1.3 nDCG labels) and independent confirmation of the P4.1–P4.10 anchor choices. Before adoption it needs: (a) ~7 added cautions, led by James 5:14-15 ("the prayer of faith WILL heal" ranked #1 for healing with no caution — inconsistent with its own Mark 11:24 caution), plus Matt 17:20, 2 Cor 9:6-8, Prov 3:9-10, Matt 6:14-15, 1 Pet 3:7; (b) its eternal-security list fixed — the prose says "traditions differ" (matching our two-tier basis) but the ranked list ranks only the security texts, which would silently adjudicate a secondary doctrine if fixtured; (c) byte-exact WEB validation of every quote — its John 3:16 reads "his one and only Son" (NIV-style / older WEB snapshot) while our pinned corpus reads "his only born Son", and its primary Lam 3:22 reading is wrong for our edition.

## Cross-cutting findings

- The docs are faithful syntheses of real data, not hallucinations: 10/12 sampled external claims fully confirmed against primary sources, 2 minor imprecisions (GotQuestions "18M visitors" vs 16M pageviews; Bible Gateway's "hundreds of billions" is relayed marketing).
- Real WEB edition split confirmed: current eBible.org text vs bible-api.com's older snapshot differ (e.g. John 3:16). Our corpus is pinned; no quoted text from any doc enters a fixture without byte-checking against it. 13 of doc 1's top-100 refs (incl. Zeph 3:17, Prov 18:10, Ps 118:24, John 10:10, Deut 31:6) are absent from the committed 5,667-verse fixture subset.
- OpenBible.info's downloadable topic-votes.txt/topic-scores.zip confirmed real and weekly-updated — the plan's P6.2·B2 dependency stands (license note: the topical index is ESV-keyed; re-verify license at ingestion, as the plan already requires).
- No plan item is materially changed by these docs; everything usable slots INTO existing items (P1.1, P1.3, P4.1–P4.10, P5.2–P5.5, P6.1–P6.2, P8.2–P8.5) under existing governance. Fixture-first still applies: queries can become golden fixtures; verse lists are never bulk-copied into concepts.

## Reserved for Jesse

1. May popularity data inform curated tie-break decisions or judgment labels (as reviewed, attributed data only)? Doc 1's ranking-boost recommendation stays rejected either way.
2. Category 24 culture-war fixture design (homosexuality, abortion, women pastors, …): proposed shape is descriptive locus-classicus-only fixtures; abortion (argument-from-silence risk) is the highest-risk item.
3. Eternal-security fixture handling: present both security texts and warning passages, per DOCTRINAL-BASIS §4.
4. Whether to adopt doc 3 (with the amendments above) as the seed for Phase 1 graded judgments.

---

## Appendix A — Repo overlap & WEB text verification

# Worker A — Repo verification & overlap analysis of the three research docs

Date: 2026-08-21 · Repo: /home/user/scripture-search-engine @ main 9542c83 · Docs treated as untrusted data.

Docs:
- **Doc 1** = `020f1dc6-Top_100_Most_Popular_Bible_Verses…` (composite top-100, WEB quotations)
- **Doc 2** = `be0d739a-What_Christians_Search_For…` (26 categories, ~700 queries; my extraction yields 551 distinct query strings)
- **Doc 3** = `76497040-GoldStandard_Bible_Verse_Answer_Key…` (26 topics → ranked WEB verse lists, ~180 refs)

---

## TASK A — WEB text verification

**What the repo actually holds.** The only verse text in the repo is `pipeline/fixtures/web-subset.json` — 5,667 verses across 108 chapter selections (47 books represented), generated from the pinned upstream `pipeline/manifests/web.json` (engwebp_vpl.zip, sha256 `3458ca34…`, ebible.org). The full 31,098-verse corpus is fetched at build time from that pin; it is not committed. So "absent below" means absent from the committed fixture subset (the hermetic eval corpus), not from the full artifact.

**Systematic finding #1 — divine name:** the repo corpus renders the Tetragrammaton **"the LORD"** (674 subset verses; **zero** occurrences of "Yahweh"). Both Doc 1 and Doc 3 quote "Yahweh" throughout the OT (the *Classic* WEB reading). Every OT quotation in the docs therefore differs from our corpus on this token. Doc 3's own caveat ("other WEB sub-editions substitute 'the LORD'") anticipated this; our edition is the LORD-edition.

**Systematic finding #2 — headings inside verse 1:** the corpus keeps superscriptions in the verse text (Ps 23:1 = "A Psalm by David. The LORD is my shepherd…"; Ps 46:1 = "For the Chief Musician. By the sons of Korah. According to Alamoth. God is our refuge…"). Neither doc reproduces these; any byte-exact fixture pinning must account for them.

**Spot checks (repo subset text is authoritative):**

| Ref | Repo (web-subset.json) | Doc 1 | Doc 3 |
|---|---|---|---|
| John 3:16 | "he gave **his only born Son**" | **verbatim match** | **WRONG** — "his one and only Son" (not our edition) |
| Psalm 23:1 | "The LORD is my shepherd; **I shall lack nothing**." | Yahweh-variant only | Yahweh-variant only ("I shall lack nothing" confirmed; "I shall not want" flagged variant is NOT ours) |
| Psalm 23:4 | verbatim | match | match |
| Lam 3:22 | "…because his **mercies don't fail**." | match (elides) | **primary reading WRONG** — "his compassion doesn't fail"; doc's flagged alternate ("mercies don't fail") is ours |
| Lam 3:23 | "They are new every morning. Great is your faithfulness." | match | match |
| Zeph 3:17 | **ABSENT from subset** (Zephaniah not selected) | n/a — doc1 "is among you… He will rejoice over you with joy" unverifiable here | n/a — doc3 "in the middle of you… calm you in his love" unverifiable; doc3 itself flags 3 edition variants |
| Isa 41:10 | "**Don't you be afraid**, for I am with you…" | minor variant — doc1 shortens to "Don't be afraid" | **verbatim match** (full 5-clause form incl. "uphold you with the right hand of my righteousness") |
| Jer 29:11 | "…says **the LORD**, 'thoughts of peace, and not of evil, to give you hope and a future.'" | Yahweh-variant only | Yahweh-variant only |
| Phil 4:6-7 | verbatim | match | match |
| Phil 4:13 | "through Christ **who** strengthens me" (no comma) | comma-only variant | comma-only variant |
| Prov 3:5-6 | verbatim mod. LORD/Yahweh | match | match |
| Rom 8:28 | "…for those who love God, **for** those who are called…" | minor — doc1 has "to those who are called" | **verbatim match** |
| Psalm 46:1 | verbatim (+ musical heading) | match | match |
| 1 Pet 5:7 | "casting all your worries on him, because he cares for you." | verbatim | verbatim (quoted as 5:6-7, joins correctly) |
| Heb 13:5 | verbatim | match | match |
| Micah 7:18-19 | verbatim | n/a (not quoted) | match (punctuation-level differences only: "under foot. You will cast" vs "under foot; and you will cast") |
| 2 Tim 1:7 | verbatim | match | match |
| Ps 34:18 | verbatim mod. LORD/Yahweh | n/a | match |
| Gal 6:9 | "**Let's** not be weary… in due season **if** we don't give up" | minor — "Let us", extra comma | comma-only variant |
| Matt 11:28 | verbatim | match | match |
| Prov 18:10 | **ABSENT from subset** | n/a — note doc1 says "The name of Yahweh is a strong tower", doc3 says "Yahweh's name is a strong tower" — the two docs disagree with each other; unverifiable against subset | see left |
| Rev 21:4 | "…nor pain any more. The first things have passed away." | minor — extra comma, drops final sentence | **verbatim match** |
| Heb 11:1 | verbatim | match | match |
| 1 John 1:9 | "…the sins **and** to cleanse…" (no comma) | comma-only variant | comma-only variant |
| Isa 26:3 | "You will keep whoever's mind is steadfast in perfect peace…" | verbatim | verbatim |
| Neh 8:10 | verbatim mod. LORD/Yahweh | n/a | match (elided) |
| Josh 1:9 | "Be strong **and courageous**. Don't be afraid. **Don't be dismayed**, for the LORD…" | **WRONG** — doc1 has ASV/KJV-style "and of good courage… neither be dismayed;" (one of doc1's self-admitted "reconstructed" renderings) | match mod. Yahweh |
| Ps 139:14, Rom 5:8, Eph 2:8, 1 Cor 13:4, Ps 46:10, Gen 1:1, Ps 42:11, Ps 56:3, Isa 43:2, Isa 53:5, Ruth 1:16, Nah 1:7, Hab 3:17, 2 Chr 7:14, Eccl 3:1 | all checked | verbatim matches (mod. LORD/Yahweh and elisions) | verbatim matches |

**Verdict counts (≈30 refs checked):** Doc 3 is the more accurate transcription of WEB *wording* apart from the systematic Yahweh/LORD mismatch — but its **John 3:16 does NOT match our corpus** ("his one and only Son" vs our "his only born Son"), and its Lam 3:22 primary reading doesn't either. Doc 1's John 3:16 matches ours exactly; Doc 1 has at least one clearly wrong reconstruction (Josh 1:9) and several loose shortenings (Isa 41:10, Rom 8:28, Rev 21:4). **Neither doc can be pasted into fixtures as expected text without re-verification against the pinned corpus** — exactly what both docs themselves recommend (though Doc 3's suggestion to verify against bible-api.com at build time conflicts with the repo's pinned-sha / no-runtime-I/O design; verification must run against the committed pin).

**Checked refs entirely absent from the committed fixture subset:** Zeph 3:17, Prov 18:10, Ps 118:24, John 10:10, Deut 31:6 (also from Doc 1's top-100: Rom 3:23, Ps 119:105, Prov 22:6, Gal 2:20, Prov 4:23, 2 Tim 3:16, Mark 10:27, 1 Cor 16:14 — see below). These would be natural additions to the P4.15 subset-expansion chapter list if their packs need hermetic assertions.

---

## TASK B — Overlap vs current curation (108 concepts, 146 active + 1 pending fixtures)

Counts verified: `ontology/concepts/` = 108 YAMLs; `eval/golden/` = 147 fixtures (146 `active`, 1 `pending`); 308 unique active query strings (query + additionalQueries); concept anchors expand to 883 verse-slots.

### B.1 Doc 2's 26 categories vs existing concepts

**Fully or substantially covered (19 of 26):**
1. Anxiety/Fear/Worry → `fear-not`, `peace-of-god`, `remembered-anxious-for-nothing`
2. Comfort/Presence → `god-of-all-comfort`, `presence-of-god`, `pastoral-near-to-the-brokenhearted`, `loneliness`
3. Hope/Future → `hope-in-god`, `pastoral-hope-in-despair`
4. Strength/Endurance → `pastoral-strength-in-weakness`, `do-not-lose-heart`, `fear-not`
5. Healing/Sickness → `pastoral-prayer-for-healing`, `pastoral-serious-illness`
6. Grief/Loss/Death → `pastoral-grief-and-loss`, `pastoral-pregnancy-and-child-loss` (+ `death-of-a-believer` fixture)
7. Depression/Loneliness → `pastoral-hope-in-despair`, `loneliness`, `pastoral-near-to-the-brokenhearted` (+ pastoral-depression-word, pastoral-suicide-word, pastoral-self-harm fixtures)
8. Love → `gods-love`, `loving-others`
9. Forgiveness → `forgiveness-of-sins`, `forgiving-others`
12. Money/Work/Provision → `contentment`, `gods-provision`, `tithing`, `generosity`, `work-and-diligence`, `remembered-work-as-for-the-lord`
13. Guidance/God's will → `guidance`, `wisdom-from-god`, `trust-in-god`
15. Prayer → `prayer`
16. Salvation/Assurance → `salvation`, `assurance-of-salvation`, `grace-not-earned`, `hell`
17. Identity/Self-worth → `identity-in-christ`, `new-creation`
18. Temptation/Sin/Addiction → `sin`, `remembered-a-way-of-escape`, `pastoral-freedom-from-bondage`, `pastoral-relapse-and-restoration`, `pastoral-sexual-purity`, `self-control`, `resisting-the-devil`
20. Suffering/Trials → `suffering-for-christ`, `pastoral-god-sees-my-suffering`, `remembered-joy-in-trials`
21. Peace/Rest → `peace-of-god`, `rest-for-the-weary`
22. Gratitude/Joy → `thanksgiving`, `joy-in-the-lord`, `praise`
23. Protection → `gods-protection`, `refuge-in-trouble`, `remembered-full-armor-of-god`

**Partial (5):**
10. Marriage/Dating → `godly-marriage`, `pastoral-marriage-divorce-teaching`, `pastoral-betrayal-and-marriage-crisis`; **no coverage** for dating/singleness/unequally-yoked registers.
11. Parenting/Family → `parenting`; no honoring-parents, wayward-child, or new-baby registers — and the plan's audit found `parenting` *wrong-fires* on the dying-parent register (below).
14. Faith/Doubt/Trust → `faith`, `trust-in-god`, `remembered-faith-*`; **no `doubt` concept** (grep: only incidental hits) — plan P4.10 confirms "doubt … no YAML and no fixture."
19. Anger/Conflict → anchors exist (`taming-the-tongue` anchors Jas 1:19, Eph 4:31; `harmony-with-others`, `forgiving-others`), but **no concept/lexicon reachable by "anger", "temper", "enemies", "gossip"-adjacent phrasing** beyond `gossip` (a fixture query) — anger itself appears in no lexicon.
26. Ministry-Use → `worship`, `praise`, `lords-supper`, `sharing-your-faith`, `gathering-together`; **no benediction, call-to-worship, fasting, Great Commission lexical route** (Matt 28:19 anchored only via `resurrection`/`loneliness`).

**Genuinely uncovered (2):**
24. Theology & Doctrine Questions — `deity-of-christ`, `resurrection`, `second-coming`, `hell`, `caught-up-together`, `the-cross`, `assurance-of-salvation` cover slices, but **no justification, propitiation, trinity, incarnation, baptism, speaking-in-tongues, end-times-term coverage, and none of the GotQuestions ethics register** (women pastors, homosexuality, tattoos, abortion, gambling, cremation — zero grep hits; several are DOCTRINAL-BASIS §4 non-criteria territory and may be deliberately out of scope).
25. Seasonal & Occasion — **no Christmas/nativity/incarnation, no wedding/funeral/graduation/new-year occasion registers** (zero grep hits for christmas, nativity, wedding, funeral, graduation, new year).

**The known gaps the coordinator asked about — all confirmed present in the docs AND already named by the plan:**
- **Doctrinal terms:** no `justification`/`propitiation`/`trinity`/`incarnation` concept or lexicon token (repo grep confirms; `justification`/`incarnation` appear only in comments). Doc 2 Cat 24 and Doc 3 §24 hit all of these. Plan items P4.1–P4.5 are exactly these packs.
- **Dying/aging parent:** doc 2 Cat 26 has "scriptures for the dying / hospice"; `pastoral-serious-illness` covers the dying *person* (lexicon "dying of cancer", "hospice") but the *caregiver-of-aging-parent* register has no concept — plan P4.6 confirms the audit's wrong-fire (child-raising verses).
- **Misspellings:** zero misspelled fixture queries anywhere (grep); plan calls the misspelling battery "a straight F" — doc 2's Stage-3 recommendation lands on P5.4.
- **KJV-variant terms:** "charity" appears in **no** concept lexicon or fixture, BUT the translation-variants layer already carries it at the token level — `pipeline/fixtures/translation-tokens.json` row `46013004` (1 Cor 13:4) includes stem `charity`, row `19023001` (Ps 23:1) includes `want`, row `50004006` (Phil 4:6) includes `careful` (KJV "be careful for nothing"). So KJV vocabulary is partially reachable via the existing cross-translation rung; "fear not" is a `fear-not` lexicon entry. No fixture asserts any of this from the query side.
- **Reference formats:** zero fixtures use "John 3 16"-style queries (grep over all `"query"` fields); plan P1.10/P5.3 confirm "John 3 16" errors today.

### B.2 Doc 3's per-topic verse lists — 8 sampled topics vs anchors

Method: each doc-3 ref counted "anchored" if any verse in its range is inside any concept's anchor ranges (anchor index = 883 verse-slots).

| Topic (doc 3 §) | Anchored / listed | Refs NOT anchored anywhere (new) |
|---|---|---|
| Anxiety (§1) | 6/8 | Ps 94:19, Ps 56:3 |
| Comfort (§2) | 6/7 | Deut 31:6 |
| Hope (§3) | 7/7 | — |
| Healing (§5) | 7/7 | — |
| Money (§12) | 8/8 | — |
| Suffering (§20) | 9/9 | — |
| Identity (§17) | 7/8 | Gen 1:27 |
| Protection (§23) | 5/7 | Prov 18:10, 2 Thess 3:3 |

**55/61 (90%) of the sampled refs are already anchors**, and almost always in the *matching* concept (e.g. Anxiety→`peace-of-god`/`fear-not`/`remembered-anxious-for-nothing`; Identity→`identity-in-christ`; Money→`contentment`/`gods-provision`/`tithing`/`generosity`; Protection→`refuge-in-trouble`). Doc 3's marginal value on these 8 topics is (a) the *ranked order* (potential graded-judgment seed), (b) six specific new anchor candidates, (c) the caution flags. Its doctrinal sections (§24) map to the P4.1–P4.5 gap packs and agree closely with the plan's own anchor choices (Trinity: Matt 28:19 lead, 2 Cor 13:14 — plan defers 2 Cor 13 to P4.15; Incarnation: John 1:14 lead, Phil 2/Luke 2 — plan notes both corpus-blocked; Benediction (§26): Num 6:24-26, Heb 13:20-21, 2 Cor 13:14, Jude 24-25, Eph 3:20-21 vs P4.9's Num 6:24-26 (1.0), Heb 13:20-21 (0.9), Rom 15:13, 1 Thess 5:23-24 with 2 Cor 13:14/Jude 24-25 deferred — near-identical).

### B.3 Doc 1's top-100 vs anchors

**80/100 are anchored in at least one concept.** The 20 not anchored anywhere: John 10:10, Ps 118:24, Zeph 3:17, Deut 31:6, Matt 6:34, Num 6:24-26, Prov 18:10, Matt 19:26, Eccl 3:1, Prov 4:23, 2 Chr 7:14, John 8:32, Col 3:2, 2 Tim 3:16, 1 Pet 3:15, Isa 40:8, Heb 13:8, Mark 10:27, Isa 55:8-9, 1 Cor 16:14. (Num 6:24-26 is already scheduled via P4.9 benediction.) Additionally 13 of the 100 are absent from the committed fixture *corpus* subset (list in Task A) — relevant for P4.15's chapter-expansion list.

### B.4 Query overlap with existing fixtures

Of 551 query strings extracted from Doc 2: **56 exist verbatim** as active fixture queries (e.g. "am i really saved", "how can i be saved", "he is risen", "what does the bible say about work", "spiritual warfare", "wealth", "burnout", "tithing", "suicide", "depression") and **137 more are substring near-matches** (e.g. doc "anxiety" ↔ fixture "cast all your anxiety on him"; doc "bible verses about depression" ↔ fixture "depression"; doc "cancer" ↔ fixture "diagnosed with cancer"; doc "armor of god" ↔ fixture "put on the full armor of god"). Roughly **⅔ of doc 2's queries are new to the fixture set**, concentrated in the "bible verses about X" / "what does the Bible say about X" phrasings, misspellings (none exist), KJV terms, and the seasonal/ministry/doctrine categories. Doc 1's example paraphrase queries ("God has plans for me", "I can do all things") do not exist as fixture queries; doc 3 carries no queries.

---

## TASK C — Mapping to the approved plan (/mnt/project-files/plans/2026-08-20-implementation-plan.md, 9 phases / 80 items)

**Phase 1 (measurement first):**
- **P1.1 · E1** ("Adopt the 84-query battery as a standing, versioned pastoral regression battery") — Doc 2 is a *complement*, not a duplicate: E1 transcribes the audit's 84 rows "verbatim (ids fn1–wl4)" and is append-only; doc 2's queries are candidate *appends* (E1: "queries append-only specimens"). The [HARD]-flagged rows with named platform provenance are the strongest candidates.
- **P1.1/P1.3 judgments** — Doc 3 is a direct seed candidate for `eval/battery/judgments.json` (P1.1: "per-query graded rows {ref, grade 0–3, basis, judgedBy, provisional?}") and for the graded-relevance labels P1.3's nDCG needs. Everything seeded from it would ship `provisional: true` until Jesse ratifies (P1.1's rule), and its verse text must be re-verified against the pinned corpus first (Task A).
- **P1.10 · QR-2** reference fixtures — doc 2's reference-format observations duplicate what QR-2 already commits ("ref-john-3-16.json", "ref-phillipians-4-13.json").

**Phase 4 (data-gap packs):** doc 2 Cat 24 + doc 3 §24/§26 land squarely on existing items — **P4.1 · DG-2** (`justification-by-faith`), **P4.3 · DG-4** (`propitiation`), **P4.4 · DG-5** (`trinity`), **P4.5 · DG-6** (`incarnation`), **P4.9 · DG-9** (`benediction`), **P4.10 · DG-10** (`baptism`, `doubt`), **P4.6 · DG-7** (`caring-for-aging-parents`). Doc 3's ranked lists provide independent confirmation of the plan's anchor choices (see B.2) — useful as review cross-checks in the J11 batches, not as new scope. New gap candidates the plan does NOT yet name, surfaced by docs 2/3: anger/conflict register, dating/singleness, Christmas/nativity + occasion registers (wedding/funeral/graduation/new-year), fasting, call-to-worship, Great Commission lexical route, and honoring-parents. These fit the P6.2 gap-report → fixture-first pipeline rather than requiring plan changes.

**Phase 5 (query robustness):** doc 2's Insight 4 (charity/love, "fear not"/"do not be afraid", "be careful for nothing", worry/anxiety synonyms, misspellings) maps to **P5.2 · QR-3** (curated book-misspelling rows), **P5.3 · QR-4** ("John 3 16" grammar — doc 2's reference-format point exactly), **P5.4 · QR-5** (deterministic cited spelling correction — the translation-tokens layer already covers much of the KJV *vocabulary* half, per B.1), **P5.5 · QR-6** (phrase/hymn alias table — the natural vehicle for doc 2's KJV phrase variants and doc 1's paraphrase pairs like "I can do all things"→Phil 4:13). Doc 2's Stage-3 benchmark ("'charity' and 'love' … return equivalent top results") is a ready-made acceptance criterion for **P5.7 · QR-8**'s battery rows.

**Phase 8 (mega-sweep):** Doc 2 is best understood as **seed material for MS-3's committed word lists** — its 26 categories ≈ the "~120 frames" of `felt-need-map.yaml` (P8.3: "each row {frame-topic, expectedConcepts[]} — pastoral judgment AS DATA"), its Cat 24 terms feed the "~150-term theological glossary", and its three-format structure (keyword/phrase/question) matches MS-3's register grammars. It does NOT replace the committed query universe: **P8.2 · MS-2** requires a *deterministic grammar-compiled* universe (≥15,000) plus **P8.5 · MS-5** frozen AI paraphrases (≥25,000) — doc 2's ~700 hand-written queries are two orders of magnitude short of the Ring-1 floor (≥40,000) and would enter as seed strata/curated lines ("curated lines verbatim incl. all fixture/battery queries" — MS-5). Doc 3 maps to **P8.7 · MS-7** Layer-1 expectations (curated-anchor agreement) and to the human/AI grading rubric's notion of consensus answers (P8.8), again as *provisional seed* judgments.

**Phase 6:** doc 2's Stage-2 recommendation to pull OpenBible `topic-votes.txt` duplicates work already planned and partially present — `pipeline/manifests/openbible-topics.json` exists, **P2.2 · RH-4** re-pins it, **P6.1 · B1** uses vote magnitudes for bucketed anchor weights + graded labels, **P6.2 · B2** builds the vote-mass gap report doc 2 is essentially hand-approximating.

**Does any doc duplicate or materially change a plan item?** No item is materially changed. Doc 2 partially duplicates P6.2 (gap census) and pre-figures MS-3 seed data; doc 3 partially duplicates the anchor research already embedded in P4.1–P4.10 and can accelerate P1.1/P1.3/P6.1 judgment seeding; doc 1 mostly duplicates the popularity background the plan already absorbed (its search-volume table appears in both docs 1 and 2). The genuinely new contributions are: (a) doc 2's category/query inventory for battery appends + felt-need-map seeding; (b) doc 3's ranked per-topic orders as provisional graded labels; (c) the handful of unanchored refs and uncovered registers in B.1–B.3.

---

## Covenant-fit notes (framing conflicts; theology review is another worker's)

- **Doc 1 Rec 1 "Weight the index for ranking… give #1–10 verses a large ranking boost"** — conflicts with the covenant as written. DOCTRINAL-BASIS §1 (quote): "**It does not touch runtime ranking.** … There is no doctrinal score, no runtime filter, and none is wanted — a 'doctrinal correctness' weight would be exactly the adjudication the covenant forbids"; and the repo's design principle (per the `editorial` manifest precedent) is that judgment must be "a *cited source* rather than a hidden weight." A popularity boost is not a theology score, but an *unattributed* boost would break covenant #5 (every result reason is part of the contract) and CLAUDE.md's "no hidden ranking signals" posture; any ordering change also carries ENGINE_VERSION discipline (covenant #2). The covenant-compliant version of doc 1's idea already exists in the plan as **P6.1 · B1** (OpenBible vote magnitudes as *reviewed, bucketed, fingerprinted anchor-weight data with a named source and chip*). If popularity weighting is ever wanted, it would have to enter the same way: a pinned manifest, reviewed bucket table, named chip — Jesse-merged. Doc 1's raw index could at most be reviewed *data input* to that; it must not become a hidden multiplier.
- **Doc 1 Rec 4 / Doc 2 Insight 5 (annual recalibration, seasonal/crisis boosting)** — seasonal boosting is a determinism violation as stated: covenant #2 requires `(engineVersion, corpusFingerprint, layerFingerprint, query)` → identical ordering; a date-dependent boost breaks that quadruple. Annual *re-pins* of reviewed data are fine (the repo has a source-drift sentinel and reviewed re-pin process, PR #25).
- **Doc 3's "contextual caution flag … engine can surface the caution"** — brushes covenant #6; the in-repo analogue is **P4.14 · DG-14** (prosperity-slogan correctives), which is explicitly *conditional on Jesse (J9)* and bound to "attribute, never adjudicate." Doc 3's eternal-security stance ("present both streams honestly rather than adjudicate silently") actually *agrees* with covenant #6 and DOCTRINAL-BASIS §4 non-criteria.
- **Doc 3's build-time verification against bible-api.com** — wrong mechanism for this repo: text identity comes from the pinned sha (`pipeline/manifests/web.json`), never a live API; and the engine does no I/O (covenant #3). Verify against the committed subset / pinned zip instead.
- **DOCTRINAL-BASIS.md structure (for reference):** §2 admission baseline = the nine-point shared core (TGC / Village Church / Lighthouse overlap); §3 named exclusion criterion (prosperity/seed-faith, enforced by the `prosperity-*` mustNotRank fixtures); §4 explicit non-criteria (denominational distinctives never adjudicated); §5 the human process. The docs' framings do not contradict the core; the only frictions are the ranking/seasonal-boost recommendations above, which are engineering-covenant conflicts, not doctrinal ones.

## Data files produced (this scratchpad)
`lookup.py`, `concepts.json`, `fixtures.json`, `active-queries.txt` (308), `anchor-index.json` (883 slots), `top100-coverage.json`, `doc2-query-overlap.json`.

---

## Appendix B — External source verification

# Worker B — Source Verification of Uploaded Research Docs

Date: 2026-08-21. Verified via WebSearch/WebFetch against primary or reputable secondary sources.
Docs checked:
- 020f1dc6 "Top 100 Most Popular Bible Verses" (composite index)
- be0d739a "What Christians Search For in the Bible" (master test set)
- 76497040 "Gold-Standard Bible Verse Answer Key" (26 topics -> WEB)

## Per-claim verdicts

### 1. World Vision UK 2022 / Ahrefs / 172 countries — CONFIRMED
Source: Independent Catholic News, https://www.indcatholicnews.com/news/45774 (the exact relay the doc cites; also worldvision.org.uk blog, Premier Christian News, Keep The Faith).
Every figure matches exactly: John 3:16 2,100,000/mo; Jeremiah 29:11 and Philippians 4:13 joint second at 82,000; John 10:10 third at 73,000; Proverbs 3:5 58,000; Matthew 28:19 50,000; Philippians 4:8 42,000; Philippians 4:6 37,000; Romans 8:28 and James 1:3 33,000. UK top five also exact: John 3:16 6,500; Jeremiah 29:11 2,000; John 14:6 1,900; Joshua 1:9 1,800; Genesis 1:1 1,600. Methodology (Ahrefs Keyword Explorer, Bible Gateway top-100 list, 172 countries) confirmed via World Vision UK / Christianity.com relays.

### 2. YouVersion Verse of the Year + search terms — CONFIRMED
Sources: youversion.com press releases and blog; PR Newswire; churchleaders.com; Deseret News.
- Isaiah 41:10 won 2018, 2020, 2022, 2023, 2025 (five wins overall since 2016; the doc's year list is correct). YouVersion's own 2025 release says verbatim: "This marks the fourth time in six years the verse has claimed the top spot" (https://www.youversion.com/news/youversion-announces-2025-verse-of-the-year) — the doc quotes YouVersion's own framing accurately.
- Philippians 4:6 won 2024 (and also 2019). Confirmed.
- 2020: "fear" was the #1 in-app search term in mid-March 2020; ~600M searches in 2020, an 80% increase over 2019 (YouVersion press release, https://www.youversion.com/press/youversion-names-verse-of-the-year-and-releases-2020s-bible-app-search-trends/). Confirmed.
- 2024: "prayer" and "peace" most-searched in-app terms (Deseret News year-in-review). Confirmed.
- 2025: "the most searched terms included love, anxiety, and peace" — verbatim in YouVersion's 2025 release. Confirmed.

### 3. Bible Gateway year-in-review — CONFIRMED
Sources: religionunplugged.com/news/2025/12/9/here-are-the-most-read-bible-verses-of-2025; semperverus.com; Deseret News (2024); Christianity Today (Dec 2024).
Psalm 23:4 was the #1 verse on Bible Gateway in both 2024 and 2025. In 2025 "Psalm 91 continued its ascent (pushing John 3:16 all the way down to number 24)". Psalms dominance confirmed (Psalms had 39 verses in the 2024 top 100; Psalms the most-read book in 2025). The doc's "Psalm 23 + Psalm 91 claim all but one of the top 23" framing is consistent with John 3:16 at #24, though I did not independently reconstruct all 23 slots.

### 4. TopVerses.com — CONFIRMED
Site exists and functions (https://www.topverses.com/, ranks 31,105 verses "by how often it is referenced across the internet"; John 3:16 #1). The "37 million online Bible references" figure and top-10 order come from press coverage (Christian Post, https://www.christianpost.com/news/most-popular-bible-verses-revealed.html): 1 John 3:16, 2 John 1:1, 3 John 14:6, 4 Matthew 28:19, 5 Romans 3:23, 6 Ephesians 2:8, 7 Genesis 1:1, 8 Acts 1:8, 9 2 Timothy 3:16, 10 Romans 10:9 — the doc's cited TopVerses ranks (#1-#10 where mentioned) match this list exactly. Note: the coverage is old (the CP article is from ~2009); the ranking is a historic citation index, not current data — which doc 1 itself acknowledges by "blending down" TopVerses.

### 5. Lifeway/Faithlife 2021 sermon data — CONFIRMED
Source: Lifeway Research, https://research.lifeway.com/2022/03/31/most-popular-sermon-passages-topics-in-2021/ (analysis of Faithlife/Logos sermon data). John 3:16 the most popular sermon verse of 2021; "of the 31,102 verses in the Bible, 29,321 were referred to in at least one sermon in 2021 (94%)." Both numbers exact.

### 6. GotQuestions.org — PARTIALLY CONFIRMED
- Top-5 FAQ order: CONFIRMED exactly against the primary source (https://www.gotquestions.org/top20.html): 1 women pastors, 2 homosexuality, 3 tattoos, 4 eternal security/once-saved-always-saved, 5 masturbation. The doc's order is verbatim correct, and the rest of its Category-24 topics all appear in the real top-20 (interracial marriage, Cain's wife, suicide, pets in heaven, tithing, tongues, dinosaurs, baptism, alcohol, gambling, Trinity, Jesus in hell, divorce/remarriage).
- Traffic: doc says "~18 million monthly visitors." GotQuestions' own about page (https://www.gotquestions.org/about.html) currently says "averaging 16,000,000 pageviews per month" (2.6B lifetime); MinistryWatch (2023) reported 13M monthly visitors. The 18M figure is directionally right but imprecise and conflates visitors with pageviews. GotQuestions has used varying figures over the years, so 18M may trace to an earlier statement, but I could not confirm it.

### 7. Christianity Today COVID-era Bible Gateway spikes — CONFIRMED
Source: Christianity Today, Dec 2020, "2020's Most-Read Bible Verse: 'Do Not Fear'" (https://www.christianitytoday.com/2020/12/most-popular-verse-youversion-app-bible-gateway-fear-covid/). Verbatim: sickness-removal verses "got around 90 times more queries than average" at the March lockdown; racism/justice/oppression queries "spike to 100 times the average in the week following George Floyd's death"; government-authority verses "up at least 50 times the average on Election Day." All three multipliers exact.

### 8. OpenBible.info downloadable data — CONFIRMED
Primary source: https://www.openbible.info/topics/ links "topical data" (topic-scores.zip) and "raw counts" (topic-votes.txt), described as "updated weekly." This matters for the approved plan item: the data files are real and currently offered. Note the underlying verse text keyed there is ESV and topics derive from user search behavior + community votes; check license terms before ingesting.

### 9. bible-api.com — CONFIRMED
Primary source: https://bible-api.com/ — "By default, we use the World English Bible (WEB)" and "This service is rate limited to 15 requests every 30 seconds (based on IP address)." Both exact.

### 10. WEB translation basics + John 3:16 wording — CONFIRMED (with a real edition split the docs correctly flag)
worldenglish.bible confirms: public domain, senior editor Michael Paul Johnson, based on the 1901 ASV (with BHS/Majority Text), published at eBible.org.
John 3:16 wording: current ebible.org text (https://ebible.org/web/JHN03.htm) reads "his only born Son" (footnote: Greek monogenes = "only born"/"only begotten"/"one and only"). But bible-api.com's WEB snapshot serves "his one and only Son" (older WEB edition). So BOTH readings are genuine WEB — they differ by edition/snapshot. Doc 1 quotes "only born Son" (matches current ebible.org); doc 3 quotes "one and only Son" (matches bible-api.com). Doc 3's TL;DR explicitly warns "A few verses have minor edition variants... validate against your chosen WEB edition at build time" — that caution is accurate and practically important for corpus fingerprinting: bible-api.com and current eBible.org WEB are NOT byte-identical.

### 11. Bible Gateway "hundreds of billions of times per year" — PARTIALLY CONFIRMED (accurately relayed; metric dubious)
Religion Unplugged's 2025 year-in-review says "Bible Gateway's creators say the site was viewed hundreds of billions of times in the past year" (https://religionunplugged.com/news/2025/12/9/here-are-the-most-read-bible-verses-of-2025). So the doc faithfully relays a published claim rather than inventing it. But as literal annual pageviews the number is implausible (that is Google-scale traffic); it almost certainly counts verse impressions or some aggregate, and Bible Gateway's older public figure was ~25B lifetime pageviews. Treat as a marketing statistic, not a measurement.

### 12. Navigators Topical Memory System = 60 verses — CONFIRMED
Navigators product pages and retailers confirm the current TMS is 60 verse cards (the original 1950s system had 105 verses across 35 topics; today's boxed set is 60). Doc's "60 core verses" matches the current product. (Lausanne not separately checked — not load-bearing in the docs.)

## Cross-checks and observations

- Doc-vs-doc discrepancy on WEB John 3:16 ("only born Son" vs "one and only Son") turned out to be a real edition difference, not an error — and both docs flag WEB edition variance explicitly.
- No fabricated citations found in the sample. Every named source exists (ICN article, CT article, Lifeway Research post, GotQuestions top20 page, OpenBible data files, bible-api docs, TopVerses site), and in every case the source says what the doc claims, usually verbatim.
- Numbers were exact far more often than approximate. The only imprecision found: GotQuestions "~18M monthly visitors" (site says 16M monthly pageviews; a 2023 secondary source says 13M visitors).
- The docs are appropriately self-critical: they flag TopVerses as historic, tattoo data as directional, OpenBible's exact ranking as not directly retrieved, and the Bible Gateway pageview figure as a platform claim. That caution matches what verification found.
- One caution for downstream use: the doc-1 composite ranking itself (the blended #1-100 order) is the author's editorial synthesis, not an external dataset — the inputs check out, but the blend weights (~35/30/20/15) are unverifiable by construction. Treat tiers as trustworthy, exact ordinals as editorial.

## Overall judgment

These docs read as faithful syntheses of real, checkable data — not hallucinated. 10 of 12 sampled claims fully confirmed against primary or near-primary sources, frequently with verbatim quote matches; the 2 partials are minor imprecision (GotQuestions traffic) and an accurately-relayed-but-dubious marketing metric (Bible Gateway views). Suitable for use as curated-layer inputs, with the noted cautions: pin which WEB edition you fingerprint (bible-api.com != current eBible.org text), treat composite ordinals as editorial, and check OpenBible's data license before ingesting.

---

## Appendix C — Theological review

# Theological review — three uploaded research docs
**Reviewer:** worker C (theological-review), 2026-08-21
**Standard applied:** docs/DOCTRINAL-BASIS.md (§2 shared core, §3 Akropong/TGC §6 prosperity exclusion, §4 non-criteria, §5 human-judgment limits); CLAUDE.md #6 (no theology scores); ontology/flagged-pairings.yaml watchlist; ontology/doctrinal-reviews.yaml precedents (esp. the openbible-topics `admissible-with-bound` pattern).

Docs reviewed (treated as untrusted data):
1. `020f1dc6-Top_100_Most_Popular_Bible_Verses...` (popularity index, "doc 1")
2. `be0d739a-What_Christians_Search_For...` (query test set, "doc 2")
3. `76497040-GoldStandard_Bible_Verse_Answer_Key...` (26-topic answer key, "doc 3")

---

## 1. Sense inversion / negative-context proof-texting

I checked every reference in doc 3 (all 26 topics, ~180 refs) and every doc-2 head-verse list for the project's classic failure mode (Job 16:2 "miserable comforters", Jer 4:10, Eccl 1:9 patterns).

**Result: clean.** No mapping pairs a topic with a verse whose in-context sense opposes the topic. Specifically verified:
- No Job's-friends or Elihu material anywhere (Job 1:21 in Suffering is Job's own worship, explicitly endorsed by the narrator in 1:22 — sound, no caution needed).
- New Beginnings (doc 3 Cat 25) uses Isa 43:18-19 / Lam 3:22-23 / 2 Cor 5:17 / Phil 3:13-14 — no Eccl 1:9.
- Habakkuk 3:17-18 (doc 3 Cat 22, Joy): reference and quoted WEB text are accurate, and it is an exemplary anti-prosperity joy text ("though the fig tree doesn't flourish... yet I will rejoice").
- Depression (Cat 7) leads with Psalm 42:11 (psalmist addressing his own despair) — contextually honest, not a pollyanna proof-text.

Minor contextual stretches, none rising to inversion (see §3b/quibbles): Isa 30:21 (Guidance), Jer 33:3 (doc 2 Prayer), Jer 1:5 (doc 2 Identity), Isa 54:17 (doc 2 Protection), Psalm 118:24, Matt 19:26.

## 2. Prosperity-gospel exposure (Akropong criterion)

This is where the real findings are. The Akropong test judges the *pairing frame*, never the verse.

### 2a. Doc 3 — Money/Provision (Cat 12): defensible but two refs under-cautioned
- The category's overall shape is **anti-prosperity**: it leads with Matt 6:31-33 (kingdom priorities), and includes 1 Tim 6:6-10, Heb 13:5, Matt 6:24 — contentment and the love-of-money warning. This is the opposite of a seed-faith list.
- **Phil 4:19** (repo watchlist) carries an adequate caution ("'need,' not every want, and spoken to generous partners"). Good — this matches the watchlist's exact concern.
- **Proverbs 3:9-10** ("barns filled with plenty") — rationale given is honoring God with firstfruits, which is honest framing, but there is NO proverb-not-transaction caution. The doc gives Prov 22:6 exactly this caution one category earlier; apply it consistently here, or the "so your barns will be filled" clause reads as a tithing ROI mechanism in a money-search context. **Caution needed.**
- **2 Cor 9:6-8** (sow sparingly/reap bountifully) — rationale ("cheerful, generous giving") is honest, but this is core seed-faith vocabulary and the context (a famine-relief collection; "reap" = grace abounding *for* generosity, v.8, not material ROI) goes unstated. **Caution needed.**

### 2b. Doc 3 — Healing (Cat 5): strong, one gap
- The list is notably sound: leads with **James 5:14-15**, includes Psalm 147:3, Jer 17:14 (a *prayer* for healing, model posture), Matt 11:28-30, and — excellently — **2 Cor 12:9 explicitly for when healing is withheld**. That last inclusion is exactly the balance Akropong's affirm/deny structure requires.
- **Isaiah 53:5 caution is adequate**: "primary reference is healing from sin (cf. 1 Peter 2:24), though it grounds all healing in the cross." That is the mainstream evangelical position stated fairly (it neither denies Matt 8:17's physical application nor lets "by his wounds we are healed" become a claimable health entitlement). No change needed.
- **Gap: James 5:14-15 itself has no caution.** "The prayer of faith WILL heal him who is sick," ranked #1 for healing queries, is at least as claimable as Mark 11:24 (which the doc DOES caution). Word-of-Faith teaching uses this verse precisely this way. It needs a caution symmetrical to Mark 11:24's: read with 1 John 5:14 and 2 Cor 12:9; the passage prescribes a practice (call the elders, pray, anoint), not a guarantee-on-demand, and "if he has committed sins" shows the healing in view is bound up with restoration, not entitlement. **Caution needed — the inconsistency (Mark 11:24 flagged, James 5:15 not) is the single clearest editorial miss in doc 3.**
- **Matthew 17:20** (Faith, Cat 14): "nothing will be impossible for you," rationale only "even small faith... is powerful," no caution. This is a positive-confession recruitment target on par with Mark 11:24. **Caution needed.**
- **Mark 11:24** (Prayer, Cat 15): caution present ("interpret alongside 1 John 5:14... not a blank check") — **adequate**, and matches the repo watchlist entry for this ref. Matt 7:7-8 sits beside it uncautioned; acceptable, but sharing the same caution would be cheap and consistent.

### 2c. Doc 2 — Healing head verses (Cat 5): the worst list in the three docs
Head verses for "will God heal me / does God heal today": **Jeremiah 30:17, Isaiah 53:5, James 5:14-15, Psalm 103:2-3, Exodus 15:26, 1 Peter 2:24, Matthew 9:35** — with Jer 30:17 listed FIRST.
- **Jeremiah 30:17** — "I will restore health to you" is Yahweh's promise of *national restoration to Zion*, whose wound is explicitly "because your sins were increased" (30:14-15). Recruiting it as the lead answer to a sick individual's "will God heal me" is precisely the §3 recruitment pattern: a covenant-restoration text repurposed as a personal health pledge. **Reject as a mustRank head verse.**
- **Exodus 15:26** — "I am Yahweh who heals you" is the Mosaic-covenant conditional ("IF you diligently listen... I will put none of these diseases on you") and is the health-wealth movement's "Jehovah Rapha" charter text. As a head verse for "does God heal today" it is technique-shaped (obedience→health mechanism). **Reject as fixture material without admitted-source framing.**
- Note the contrast: doc 3's healing list includes *neither* of these. Doc 3's curation is measurably better here.

### 2d. Doc 2 — Money head verses (Cat 12): would trip the repo's own red-flag check
Head verses include **Malachi 3:10, Luke 6:38, and Philippians 4:19 — three of the eleven refs on ontology/flagged-pairings.yaml** — and the query list includes **"bible verses for financial breakthrough"**, where "breakthrough" and "financial" are both literal entries in `materialFrameKeywords`. A concept pack built naively from this category (money/finance lexicon anchoring Mal 3:10 / Luke 6:38 / Phil 4:19) is the exact shape the G4 doctrinal-guardrail scan exists to flag.
- The watchlist itself says Mal 3:10 "ranks honestly for tithing queries" and Luke 6:38 "for giving queries" — so the fix is query splitting, not verse exclusion: tithing→Mal 3:10 fine; giving→Luke 6:38 fine; **"financial breakthrough" must be handled the way the prosperity-* golden family handles slogans (mustNotRank assertions), never with these head verses as mustRank.**

### 2e. Doc 1 — popularity as a ranking signal
- Doc 1 makes no theological claims per se; as *data* it is honest (methodology and caveats are unusually good). The theological problem is **Recommendation 1: "give #1-10 verses a large ranking boost."** The top-10 includes Jer 29:11 (#2) and Phil 4:13 (#3) — popular *because of* their misapplication. A large global popularity boost institutionalizes the misapplied sense: for "hope" or "strength" queries, the boost pushes the misread verse past contextually better answers with no counterweight. The repo already has the right precedent: the openbible-topics bound — votes/popularity are "a prior only — never a correctness label, and never treated as one by the ranker." Adopt doc 1's data under that same bound (tie-break/prior weight), reject "large boost" as stated. This is a ranking-philosophy conflict, not an Akropong violation — popularity boosting isn't adjudicating theology — but it directly fights doc 3's own stated principle ("where popularity and sound context conflict...").
- Secondary note: John 10:10 ("life... abundantly", #15, 73K/mo) is the prosperity movement's "abundant life" charter verse, and "abundance" is a materialFrameKeyword. Not a problem in doc 1 itself, but if a popularity boost meets an "abundance"-shaped concept, watch the interaction.
- Theme→verse examples in doc 1 (Rec 3: "God has plans for me"→Jer 29:11, "I can do all things"→Phil 4:13) are *remembered-phrasing* mappings — legitimate; that is the verse the searcher means. No mis-mapping found in doc 1's list itself; entries like Matt 19:26 / Mark 10:27 (context: salvation of the rich), 2 Chron 7:14 (national covenant), Rev 3:20 (addressed to a church), Psalm 37:4 (already noted in the torrey review as prosperity-adjacent) are listed as popularity facts, not topic mappings — accurate as facts; caution needed only if later theme-mapped.

## 3. Contextual honesty — audit of doc 3's cautions

### 3a. Existing cautions: all six accurate and adequate
- **Jer 29:11** — cites v.10 (70 years, Babylon), denies individual-prosperity guarantee, redirects to covenant character in Christ. Excellent; best one-paragraph treatment of this verse I'd expect in a data file. Cat 25 (Graduation) correctly back-references it.
- **Phil 4:13** — contentment-in-context (4:11-12), not achievement. Accurate.
- **Prov 22:6** — proverb as probability, not guarantee. Accurate.
- **Psalm 91** — "ultimately eschatological, not a blanket guarantee," with the Matt 4:6 Satan-misquotes-it observation. Accurate and pedagogically sharp.
- **Mark 11:24** — read with 1 John 5:14. Adequate (see 2b).
- **2 Cor 6:14** — "primary context is broader partnerships, but widely and reasonably applied to marriage." Accurate: the Corinthian context is unbelieving/idolatrous associations generally; the doc neither pretends it's a marriage verse nor forbids the standard application. Adequate.

### 3b. Cautions missing (ranked by severity)
1. **James 5:14-15** (doc 3 Cat 5 #1; doc 2 Cat 5) — see 2b. The biggest gap.
2. **Matthew 17:20** (doc 3 Cat 14) — mountain-moving without a will-of-God frame.
3. **2 Cor 9:6-8** and **Prov 3:9-10** (doc 3 Cat 12) — see 2a.
4. **Matthew 6:14-15** (doc 3 Cat 9; doc 2 Cat 9) — "if you don't forgive... neither will your Father forgive" surfaced raw for "does God forgive me" can read as forgiveness-by-works, cutting against shared-core point 5 for exactly the anxious searcher most likely to ask. Needs one line: our forgiving is evidence and fruit of being forgiven (Eph 4:32's order, which the doc itself lists first), not the purchase price; the warning targets the unforgiving heart as self-contradiction.
5. **1 Peter 3:7** (doc 3 Cat 10) — "weaker vessel" quoted with no note; in a search-result context a display caution (physical frailty/honor + "joint heirs," not ontological inferiority) is warranted.
6. **Doc 2 Cat 13** — Jer 29:11 recurs as a head verse for "God's plan for my life" (guidance), the *most* misapplied sense; the exile caution must travel with it into that category, not just Hope.
7. Milder (quibble tier, note only if these become fixtures): Isa 30:21 (post-repentance promise → generic guidance), Jer 33:3 (doc 2 Prayer — spoken to Jeremiah in prison re national restoration), Isa 54:17 (doc 2 Protection — covenant-servants promise, a popular claim-verse), Jer 1:5 (doc 2 Identity — prophetic call narrative), Psalm 118:24, Nahum 1:7 (doc 1; fine), Gal 6:9 ("reap in due season" — acceptable as-is).

## 4. Doctrinal-tier discipline (§4 non-criteria)

- **Eternal security (doc 3 Cat 24)**: the *stated* handling is exactly our standard — "a genuine intramural debate... present both streams honestly rather than adjudicate silently," and Recommendation 3 repeats it. **But the ranked list itself only ranks the security texts** (John 10:28-29, Phil 1:6, Rom 8:38-39); the Arminian warning passages (Heb 6:4-6; 10:26-29; John 15:6) live in a NOTE, unranked. If fixtures are generated from the ranked rows, the engine functionally adjudicates toward eternal security — a §4 violation by data shape despite correct intent. **Fix before adoption: rank the warning passages as peer results, or don't fixture "can you lose your salvation" at all.**
- **Col 3:18-19 / Eph 5:25 / 1 Pet 3:7 (Marriage)**: inclusion is correct — gender roles are a §4 non-criterion and these are the loci classici any tradition would return for marriage queries. The one-line rationale "Complementary responsibilities in marriage" quietly borrows one side's label; harmless in a research doc, but if that string becomes explanation text in the artifact it is light adjudication. Neutralize the wording ("Instructions to wives and husbands") if adopted; the mapping itself stands.
- **No believer's-baptism or continuationist assumptions found** in doc 3. Cat 26 Communion is memorialist-leaning only in that it's the 1 Cor 11 text itself — fine. Mark 16:15 (longer ending of Mark) is a text-critical footnote matter, not doctrinal.
- Doc 3's staged-rollout recommendation (ship Cats 1-23 first; Cat 24 only with "traditions differ" notes) matches our tiering well.

## 5. Doc 2 Category 24 — culture-war/ethics test queries

These are real, hard-data queries (GotQuestions' actual top-5: women pastors, homosexuality, tattoos, eternal security, masturbation) — as a *description of demand* they are legitimate and the engine will face them. Risk/benefit of adopting them as fixtures:
- **Benefit**: without fixtures, nobody measures whether the engine returns garbage (or nothing, or something inflammatory) for its highest-traffic doctrine queries; regressions there are reputationally expensive for all three consumers.
- **Risk**: fixture design *is* curation judgment. Choosing which verses count as the right answer for "women pastors" or "homosexuality" quietly adjudicates §4 matters (gender roles explicitly) or contested ethics; mustNotRank assertions against one tradition's texts would be worse. "Abortion" has no direct proof-text — a fixture would enshrine an inferential hermeneutic (Ps 139:13, Jer 1:5) as if it were lookup. "Do pets go to heaven"/"dinosaurs"/"Cain's wife" would force relevance where Scripture is largely silent.
- **Recommendation**: reserve the whole ethics/culture sub-list for Jesse (it belongs in docs/NEEDS-JESSE.md territory). If he wants coverage, the safe fixture shape is: (1) assert only that the engine returns the descriptive locus-classicus passages *every* tradition cites (e.g., 1 Tim 2:12 AND Rom 16:1-2 for women pastors; Rom 1 / 1 Cor 6:9-11 / Lev 18:22 for homosexuality) with source-attributed explanations and zero editorial copy; (2) never mustNotRank a passage one §4 side cites; (3) for silence topics (pets, dinosaurs), fixture the *absence* of forced relevance — an honest thin result is the correct result. Queries themselves (as tokenizer/coverage tests with no ranking assertion) are safe to adopt now.

## 6. Text-accuracy notes (not theological, but affects the "answer key" claim)

- Doc 3's John 3:16 reads "his one and only Son" (NIV wording); WEB reads "his only born Son" (doc 1 has it right). Same in Cat 16. Several doc-1 lower-tier quotes are self-admittedly "reconstructed." Both docs already recommend byte-exact validation against the WEB corpus at build time — **make that mandatory before any quote string enters a fixture**, since our own corpus is the WEB and mismatched fixture text would silently weaken exact-phrase assertions.
- Zeph 3:17 wording differs between doc 1 ("is among you") and doc 3 ("in the middle of you") — flagged by the docs themselves as edition variants; resolve against our corpus.

---

## Verdict lists

### (a) Mappings I'd reject outright
1. **Doc 2 Cat 5: Jeremiah 30:17 as head verse for personal-healing queries** ("will God heal me") — national-restoration promise recruited as individual health pledge; §3 recruitment shape.
2. **Doc 2 Cat 5: Exodus 15:26 as head verse for "does God heal today"** — conditional Mosaic covenant text; the health-wealth charter verse; technique-shaped in this pairing.
3. **Doc 2 Cat 12: wholesale adoption of the money head-verse list as mustRank fixtures** — three watchlist refs (Mal 3:10, Luke 6:38, Phil 4:19) against a query set containing "financial breakthrough" (two materialFrameKeywords) would trip our own G4 red-flag check. Split by query intent instead (tithing/giving OK; breakthrough → prosperity-* mustNotRank family).
4. **Doc 1 Recommendation 1 ("large ranking boost" for popular verses)** — as stated. Adopt popularity only under the openbible-topics bound: a prior/tie-break, never a correctness label.

(No doc-3 topic→verse mapping merits outright rejection.)

### (b) Needs a caution it doesn't have
1. James 5:14-15 (Healing — doc 3 #1 and doc 2) — the clearest gap; symmetrical to the Mark 11:24 caution.
2. Matthew 17:20 (Faith, doc 3) — mountain-moving / positive confession.
3. 2 Corinthians 9:6-8 (Money, doc 3) — sowing/reaping = seed-faith vocabulary; state the famine-collection context.
4. Proverbs 3:9-10 (Money, doc 3) — proverb-not-transaction, same caution the doc already gives Prov 22:6.
5. Matthew 6:14-15 (Forgiveness, doc 3 + doc 2) — anti-works-forgiveness line for the "does God forgive me" searcher.
6. 1 Peter 3:7 (Marriage, doc 3) — "weaker vessel" display note.
7. Jeremiah 29:11 in doc 2 Cat 13 (guidance/"God's plan for my life") — the existing exile caution must follow the verse into this category.
8. Mild/optional: Matt 7:7-8 (share Mark 11:24's caution), Isa 54:17, Jer 1:5, Jer 33:3, Isa 30:21.

### (c) Jesse-only judgment calls
1. Doc 2 Cat 24 ethics/culture queries as fixtures (esp. women pastors = §4 gender roles; abortion = inference-only) — adopt-with-shape proposal in §5 above, or defer.
2. Eternal-security fixture shape (doc 3 Cat 24): ranking the Arminian warning passages as peers vs. not fixturing the question — either keeps §4; the current ranked-list-plus-note shape does not.
3. Whether doc 3's caution flags become user-facing display text — the docs' recommendation aligns with "explanations are part of the contract," but caution copy is editorial voice: it belongs to the `editorial` source, attributed and PR-merged, per the DOCTRINAL-BASIS §1 pattern.
4. Rationale wording on §4-adjacent rows (e.g., "Complementary responsibilities") if any rationale strings are imported.
5. Magnitude of any popularity prior from doc 1, and seasonal boosting (doc 2 Insight 5) — ranking-philosophy decisions with determinism implications (ENGINE_VERSION / layer-fingerprint bumps), not admission questions.

### (d) Overall verdict per doc
- **Doc 3 (Gold-Standard Answer Key): SOUND — admit with amendments.** Broadly-evangelical consensus curation, unusually self-aware (six accurate cautions, correct §4 posture on eternal security in prose, anti-prosperity shape in the Money and Healing categories, contextually honest everywhere I checked). Required amendments: the ~6 missing cautions in (b) and the eternal-security ranked-list fix. Best-in-class among the three.
- **Doc 2 (Master Test Set): SOUND AS A QUERY INVENTORY; head-verse lists need rework before fixture-ization.** The queries are data about searchers, not theology, and are safe to adopt for coverage testing now. Two head-verse lists carry real §3 exposure (Cat 5 healing — two rejects; Cat 12 money — watchlist collision), and Cat 24 must be reserved for Jesse.
- **Doc 1 (Popularity Index): SOUND AS DATA; one recommendation rejected.** No mis-mapped theme→verse pairs found; caveats are honest. Its data is useful as a ranking prior and remembered-phrasing seed, but Recommendation 1's "large ranking boost" must be replaced by the votes-are-a-prior-only bound the repo already applies to openbible-topics.
