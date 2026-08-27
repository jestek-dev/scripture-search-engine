# System Audit Against the Doctrinal Guardrail — 2026-08-15

Requested by Jesse: run the whole system against DOCTRINAL-BASIS.md (PR #22) and report deviations.

**Verdict: the curated layer passes the guardrail cleanly — zero prosperity-criterion violations across all 19 sources and all 58 concept packs, read in full.** Live probing of 49 doctrine-sensitive queries (same engine path the gates use, 5,667-verse fixture corpus) found no prosperity proof-texting, no theology-adjudicating explanation text, and every existing prosperity `mustNotRank` protection held. It did find three sense-inversions ("provision" → Romans 13:14 at #1, "promotion" → Proverbs 3:35 as sole ironic result, "lord's supper" → 1 Cor 11:20 outranking the institution passages), one borderline prosperity pairing ("name it and claim it" surfacing John 14:13–14), three minor non-doctrinal data defects, and a set of noise/coverage gaps. Caveat: the full 31,098-verse artifact could not be probed in this environment; six classic proof-texts (Job 16:2, Mark 11:24, John 10:10, Job 36:11, Prov 18:16, 3 John 1:2) are absent from the fixture corpus, so their protections currently pass vacuously — making them real requires the corpus-selection follow-up with an independent baseline re-approval.

Part 1 is the curated-data audit; Part 2 is the live query probe.

---

# Part 1 — Curated data vs. the basis

# Doctrinal-basis audit — curated data vs. `docs/DOCTRINAL-BASIS.md`

**Standard applied:** nine-point shared core (§2), Akropong/TGC §6 prosperity–seed-faith exclusion (§3), non-criteria list (§4: baptism mode, election, gifts, gender roles, millennium, polity — not flagged on).

**Coverage statement:** all 19 manifests read in full; all 58 concept YAMLs read in full (no sampling was necessary — total is ~2,345 lines); prosperity golden fixtures read for context. Line numbers below are from this branch's HEAD (`claude/hearth-thread-t9k25z`).

## A. Source-manifest verdicts (19)

| Manifest | Source (author / tradition / era) | Verdict vs. basis |
|---|---|---|
| `barnes.json` | Albert Barnes, American New School Presbyterian, NT notes 1832–51 | **Compatible.** Mainstream expository; no prosperity vector. Manifest prose is licensing/coverage only. |
| `clarke.json` | Adam Clarke, British Methodist (Arminian), 1810–26 | **Compatible.** Arminianism is an explicit non-criterion (§4). Honesty note for Jesse's backfill record: Clarke held an idiosyncratic view on the *eternal* Sonship of Christ; he robustly affirmed Christ's full deity, so his passage-framing does not contradict core point 2/3 — no flag, but worth a line in the planned per-source review record (§5 follow-up). |
| `editorial.json` | LH's own voice, AI-assisted offline, human-admitted | **Compatible by construction; §5 applies.** This is the source the basis says needs Jesse's sign-off per pairing — full inventory in section C. Manifest prose ("the engine renders no verdicts… where that source is us, the reader can see it") is exactly the attribution pattern §1 blesses. |
| `jfb.json` | Jamieson, Fausset & Brown, Scottish Presbyterian/Anglican evangelical, 1871 | **Compatible.** No prosperity vector. |
| `kd.json` | Keil & Delitzsch, confessional Lutheran, 1864+ | **Compatible.** OT critical-grammatical commentary; no prosperity vector. |
| `maclaren-psalms.json` | Alexander Maclaren, English Baptist, 1900s | **Compatible.** Expository sermons on Psalms; no vector. |
| `mhc.json` | Matthew Henry, Presbyterian nonconformist, 1706–21 | **Compatible.** Paedobaptist — §4 explicitly names him as the reason baptism mode is a non-criterion. |
| `nave.json` | Nave's Topical Bible, 1897 (Methodist chaplain) | **N/A — lineage-only.** Zero rows cite it; exists for G7 correlation budgeting. If ever imported as data it must be re-admitted (manifest says so itself). |
| `openbible-topics.json` | OpenBible.info community votes, CC-BY | **Admissible with the stated bound — the bound does real work.** This is the one source whose *pairings are crowd-authored*, so prosperity readings genuinely could enter through it (a topic like "money" or "favor" with Mal 3:10 / Jer 29:11 voted up would be exactly a §3 pairing). Three containments observed at HEAD: (1) the manifest's own prose — votes are "a useful prior for what people find relevant, never a correctness label, and never treated as one by the ranker"; (2) concept packs must *opt in* via `openbibleTopics:`, and only five do, all on non-prosperity topics: `faith-and-works` ("faith and works"), `fear-not` ("fear"), `grace-not-earned` ("grace"), `obedience-to-the-word` ("obedience"), `refuge-in-trouble` ("refuge"); (3) the `prosperity-*` fixture family polices output for the money-shaped queries. Residual risk is future opt-ins to money/blessing/favor topics — a plausible checklist item for the §5 per-source review record. |
| `openbible-xrefs.json` | OpenBible.info cross-references, TSK-derived | **Compatible / no vector.** Verse↔verse links carry no topical framing at all; correctly budgeted with TSK. |
| `torrey.json` | R. A. Torrey, *The New Topical Textbook*, 1897 | **Compatible.** All Torrey outlines actually cited by packs (PARDON, HOPE, PRAISE, ATONEMENT, WARFARE OF SAINTS, DELIGHTING IN GOD, etc.) are classic devotional headings; none frames verses as material return. See B-2 for the one Torrey anchor worth a sentence (Ps 37:4). |
| `translation-variants.json` | KJV/ESV/NIV/NLT stem index | **N/A doctrinally.** Unordered vocabulary stems cannot carry a framing. |
| `treasury-of-david-01/02/03/04/06.json` (5) | C. H. Spurgeon, Baptist Calvinist, 1869–85 | **Compatible** (×5). Spurgeon is about as anti-prosperity as the 19th century gets; manifest prose is OCR/licensing only. |
| `tsk.json` | Treasury of Scripture Knowledge, 1830s | **N/A — lineage-only.** No rows. |
| `web.json` | World English Bible text | **N/A.** The Scripture corpus itself; the basis judges framings of it, not it. |

No manifest contains prose that frames verses at all — they are licensing/provenance records — so no manifest trips §3 on its own evidence.

## B. Concept-pack findings (58 files)

### Findings

1. **`ontology/concepts/peace-of-god.yaml:33-35` and `:44-46` — 1 Peter 5:7 double-listed. CONFIRMED still present at HEAD.** Once as `[torrey]` weight 0.75 (line 33), once as `[editorial]` weight 0.85 (line 44, remembered-phrasing anchor "cast all your anxiety on him"). Structural, not doctrinal — but it means one verse gets two anchor entries for one concept, which the pack's own anti-dilution reasoning elsewhere argues against. The prior audit's flag stands unresolved.

2. **`ontology/concepts/joy-in-the-lord.yaml:42-44` — Psalms 37:4, `[torrey]`, 0.65.** "Delight yourself in the LORD, and he will give you the desires of your heart" is a stock prosperity proof-text *when paired with desire-fulfilment topics*. Here the pairing frame is the verse's first clause — Torrey's outline DELIGHTING IN GOD, concept "Joy in the Lord" — which is the honest sense. **Does not trip §3; prosperity-adjacent verse under a non-prosperity frame.** Worth one line in Jesse's review record because it is the closest any Torrey anchor comes.

3. **`ontology/concepts/hope-in-god.yaml:19-21` (lexicon "plans to prosper you") + `:27-29` (Jeremiah 29:11, `[editorial]`, weight 1.0).** The single most prosperity-adjacent pairing in the layer: the NIV wording literally contains "prosper," and the verse is a prosperity-preaching staple. Verdict: **fine — deliberate and already adjudicated.** The frame is *Hope* (label "Hope," related: gods-faithfulness, second-coming), the lexicon entry is a remembered-phrasing route to the verse, not a promise claim, and `eval/golden/prosperity-word.json` records the ruling explicitly: "Jeremiah 29:11 is deliberately NOT forbidden here: it is positively fixtured under Theme: Hope… the frame there is hope, not prosperity." This is the basis working as designed.

4. **`ontology/concepts/the-cross.yaml:10` — lexicon "by his wounds we are healed" → Isaiah 53:5 (editorial, 1.0), 1 Peter 2:24 (editorial, 0.95).** The phrase is the health-entitlement movement's favorite slogan, but the pairing here routes it to the atonement passages that *are* its source text, under concept "The cross and atonement." That is retrieval, not entitlement framing. **Fine.**

5. **`ontology/concepts/pastoral-prayer-for-healing.yaml` — healing concept, all editorial.** The §3 health-entitlement question applies squarely and the pack answers it in its own prose (lines 15-18): "Nothing here may be presented as a guarantee of physical healing in this life… Psalm 103 praises the healer without scheduling the cure." Anchors are James 5:13-16 (instruction), Jer 17:14 (petition), Ps 103:2-3 (praise), Mark 1:40-42 (narrative — note the leper's "if you are willing"). **Clean; arguably the exemplary §3-compliant treatment of healing.** Companion `pastoral-serious-illness.yaml` (lines 15-18: "do not force a serious illness into a healing narrative") is the Akropong denial — illness ≠ weak faith — expressed as curation.

6. **`ontology/concepts/pastoral-relapse-and-restoration.yaml:33-35` vs `pastoral-freedom-from-bondage.yaml:17-19` — comment/data mismatch on Micah 7:8.** The freedom pack's comment says "Romans 7 and Micah 7:8 enter low per review… Micah's context is broader adversity — weights say so," but Micah 7:8 appears in *neither* of freedom's anchors and *leads relapse-and-restoration at weight 1.0*. Either the review's demotion was overridden without updating the comment, or the comment describes a state that moved. **Theologically clumsy/documentation drift, not a §3 issue** — Micah 7:8 for "rising after a fall" is a recontextualization the pack seems aware of elsewhere.

7. **`ontology/concepts/pastoral-pregnancy-and-child-loss.yaml:45-47` — Matthew 19:14 ("let the little children come to me"), 0.6.** Mild recontextualization (the verse is about living children being brought to Jesus). Pastorally conventional, weight-demoted, and sits next to the pack's own model of caution (2 Sam 12:22-23 at 0.5 with an explicit "not a doctrinal proof about the eternal state of every infant" comment, lines 15-19). **Clumsy-adjacent, fine.**

8. **`ontology/concepts/pastoral-betrayal-and-marriage-crisis.yaml`** — the recontextualizations are self-documented: Ps 55 "not about adultery specifically" (line 15-17), Isa 54 "covenant imagery about Zion, used pastorally — not a promise that God replaces a spouse" (17-19), Hosea deliberately excluded with reasoning (19-21). James 1:5 at 0.75 (line 53) is a generic ask-for-wisdom verse in a wound pack — defensible, minor. **Fine.**

9. **Sense-inversion sweep — no inverted anchors found.** Specifically checked every candidate: Rev 3:17 and Luke 18:11 under `self-deception` (both verses are *about* self-deception — correct sense); Ezek 33:31-32 under `obedience-to-the-word` (the negative example of hearing-without-doing — correct sense); Psalm 88 in `hope-in-despair` at 0.35 with the inversion risk explicitly managed in comments (lines 20-22); Job 1:21 under `surrender-to-god` (Job's own faithful speech, not a false-comforter line); Job 31:1 under `sexual-purity` (Job's own oath). No lament or false-comforter verse is anchored to a comfort concept anywhere. The one §3-worked-example landmine, Job 36:11 (Elihu), is anchored **nowhere** in the layer.

10. **Adjudication sweep — no label/note violates the covenant, and no non-criterion is gated.** Labels are confessional only within the nine points ("Grace, not earned" = point 5; "He is risen" = point 3; "Jesus is coming back" = point 9 with no millennial position; `lords-supper` = point 8 with no mode). There is no baptism concept at all, nothing on election, gifts, gender roles, millennium, or polity. Curation-side judgments in comments (Hosea excluded, Prov 24:16 rejected twice, Ps 116:15 "globally gated," Malachi 2 demoted to 0.6 over a translation dispute — `pastoral-marriage-divorce-teaching.yaml:18-20`) are attributed human admission decisions, which §1 explicitly distinguishes from runtime adjudication. Not violations.

11. **Trivial:** `hope-in-god.yaml:48-51` — duplicated comment block ("Remembered-phrasing anchor…" pasted twice). Cosmetic.

### Clean files (read in full, nothing to flag)

`abiding-in-christ`, `building-on-the-rock`, `creation`, `faith-and-works`, `fear-not`, `forgiveness-of-sins`, `forgiving-others`, `gathering-together`, `gods-faithfulness`, `gods-love`, `grace-not-earned`, `holiness`, `lords-supper`, `loving-others`, `obedience-to-the-word`, `praise`, `prayer` (ask-and-receive verses under *Prayer* is honest retrieval, not claim-it framing), `presence-of-god`, `refuge-in-trouble`, `repentance`, `resurrection`, `salvation`, `second-coming`, `self-deception`, `surrender-to-god`, `thanksgiving`, `trust-in-god`, `victory-in-christ` (frame is Torrey's WARFARE OF SAINTS — spiritual conflict, no material-success reading), `walking-in-the-light`, `worship`; all 11 `remembered-*` packs (single-anchor, phrase→its own verse — no framing surface); pastoral packs `freedom-from-bondage` (grace-not-willpower framing is affirmatively §3-aligned), `god-sees-my-suffering`, `grief-and-loss`, `hope-in-despair`, `marriage-divorce-teaching`, `near-to-the-brokenhearted`, `refuge-and-justice` ("seeking safety is not a failure of faith" — the exact opposite of the victim-blaming Akropong condemns), `sexual-purity`, `strength-in-weakness`.

Notable absence: **no money/giving/tithing/generosity concept exists at all** — the layer's only exposure to wealth queries is the fixture family, and the positive half (`prosperity-contentment.json`, a pending fixture awaiting a contentment/stewardship pack anchored on 1 Tim 6:6-10) is written fixtures-first per the covenant.

## C. Editorial-anchor inventory (everything §5 says needs Jesse's sign-off)

All 58 packs carry editorial anchors; the 14 `pastoral-*` and 11 `remembered-*` packs are 100% editorial. **Total: 148 editorial anchors.**

**Core topical packs (mixed editorial+torrey; editorial refs listed):**
- abiding-in-christ: John 15:4 (1.0), 15:5, 15:7
- building-on-the-rock: Mt 7:24-27 (1.0), Lk 6:46-49, 1 Cor 3:10-15
- creation: Gen 1:1 (1.0), Ps 19:1, Ps 139:13-14, Col 1:16, Jn 1:3
- faith-and-works: Jas 2:14-26 (1.0), Eph 2:8-10, Gal 5:6
- fear-not: Isa 43:1-3 (1.0), Josh 1:9, 1 Jn 4:18
- forgiveness-of-sins: Ps 103:12 (1.0), Isa 1:18, 1 Jn 1:9
- forgiving-others: Mt 18:21-22 (1.0), Eph 4:32, Mt 6:14-15
- gathering-together: Heb 10:24-25 (1.0), Mt 18:20, Acts 2:42
- gods-faithfulness: Lam 3:22-23 (1.0), Dt 7:9, 2 Tim 2:13
- gods-love: Jn 3:16 (1.0), Rom 8:38-39, Rom 5:8
- grace-not-earned: Eph 2:8-9 (1.0), Rom 3:23-24, Titus 3:5
- holiness: 1 Pet 1:15-16 (1.0), Heb 12:14, Ps 24:3-4
- hope-in-god: **Jer 29:11 (1.0)**, Heb 6:19, Heb 11:1
- joy-in-the-lord: Neh 8:10 (1.0), Phil 4:4, Jas 1:2
- lords-supper: 1 Cor 11:23-26 (1.0), Lk 22:19-20, Mt 26:26-28
- loving-others: Jn 13:34-35 (1.0), 1 Cor 13:4-8, Mt 7:12
- obedience-to-the-word: Jas 1:22-25 (1.0), Mt 7:24-27, Lk 6:46-49, Ezek 33:31-32, Rom 2:13, Jn 13:17
- peace-of-god: Phil 4:6-7 (1.0), Jn 14:27, Isa 26:3, **1 Pet 5:7 (dup — see B-1)**
- praise: Ps 150:1-6 (1.0), Ps 100:1-2
- prayer: Mt 6:9-13 (1.0), 1 Th 5:16-18
- presence-of-god: Ps 139:7-10 (1.0), Jas 4:8, Heb 13:5
- refuge-in-trouble: Ps 46:1-3 (1.0), Ps 91:1-2, Isa 25:4, Ps 121:1-8
- repentance: Acts 3:19 (1.0), 1 Jn 1:9
- resurrection: Lk 24:5-6 (1.0), Mt 28:5-6
- salvation: Acts 16:30-31 (1.0), Rom 10:9, Acts 4:12, Jn 3:3
- second-coming: Acts 1:11 (1.0), 1 Th 4:16-17
- self-deception: Jas 1:22-24 (1.0), Gal 6:3, 1 Jn 1:8
- surrender-to-god: Rom 12:1 (1.0), Lk 9:23, Lk 22:42
- thanksgiving: Ps 100:4 (1.0), 1 Th 5:18
- the-cross: Isa 53:5 (1.0), 1 Pet 2:24, Rom 5:8, 1 Cor 15:3
- trust-in-god: Prov 3:5-6 (1.0), Ps 37:5
- victory-in-christ: Rom 8:37 (1.0), 1 Cor 15:57, 1 Jn 5:4, Ex 14:13-14
- walking-in-the-light: 1 Jn 1:5-7 (1.0), 1 Jn 2:6, Eph 5:8
- worship: Ps 95:6 (1.0), Jn 4:23-24

**Pastoral packs (all-editorial; already carry "approved by Jesse 2026-07-31 after two external reviews" headers — the closest thing to §5 sign-off that exists pre-basis):** betrayal-and-marriage-crisis (Ps 55:12-14, 55:20-22, 34:18, Isa 54:5-6, 54:10, Jas 1:5, 1 Cor 7:15, Ps 147:3); freedom-from-bondage (1 Cor 6:12, Jn 8:36, Rom 6:17-18, Gal 5:1, Heb 4:15-16, Titus 2:11-12, 1 Cor 10:13, Rom 7:24-25); god-sees-my-suffering (Gen 16:13, Ex 3:7, Ps 56:8, 27:10); grief-and-loss (Jn 11:25-26, 1 Th 4:13-14, Rev 21:3-4, Ps 34:18, 1 Cor 15:54-57, Jn 11:33-36, Isa 25:8, Rom 12:15); hope-in-despair (2 Cor 1:8-10, 1 Ki 19:4-7, Mt 11:28-29, Ps 42:5, Lam 3:21-23, Ps 40:1-3, Rom 8:38-39, Ps 13:5-6, 139:13-14, 88:1-2); marriage-divorce-teaching (Mt 19:3-9, 1 Cor 7:10-16, Gen 2:24, Mal 2:13-16); near-to-the-brokenhearted (Ps 34:18, 147:3, Isa 61:1-3, Mt 5:4); prayer-for-healing (Jas 5:13-16, Jer 17:14, Ps 103:2-3, Mk 1:40-42); pregnancy-and-child-loss (Ps 34:18, Rom 8:26, Jn 11:35, Ps 139:13-14, Rev 21:4, Mt 19:14, 2 Sam 12:22-23); refuge-and-justice (Ps 82:3-4, 10:17-18, 11:5, Prov 27:12, Ps 10:14, 9:9-10, Eph 5:11-13, Ps 27:10, Isa 1:17, Ps 34:18); relapse-and-restoration (Mic 7:8, 1 Jn 1:9, Ps 51:10-12, Gal 6:1-2, Phil 1:6, Jas 5:16); serious-illness-and-dying (Ps 23:4, 2 Cor 4:16-18, 12:9-10, Jn 14:1-3, Rom 8:18, 8:26-27, 14:8, Ps 73:26); sexual-purity (1 Th 4:3-5, 2 Tim 2:22, Job 31:1, Ps 101:3, 1 Cor 6:18-20, Mt 5:27-28); strength-in-weakness (2 Cor 12:9-10, Isa 40:29-31, Ps 73:26).

**Remembered packs (all-editorial, one anchor each):** a-way-of-escape→1 Cor 10:13; anxious-for-nothing→Phil 4:6-7; faith-as-assurance→Heb 11:1; faith-like-a-mustard-seed→Mt 17:20; fruit-of-the-spirit→Gal 5:22-23; full-armor-of-god→Eph 6:11; joy-in-trials→Jas 1:2; looking-to-jesus→Heb 12:2; transformed-not-conformed→Rom 12:2; work-as-for-the-lord→Col 3:23.

## D. Bottom line

The curated layer contains **nothing that violates the prosperity/seed-faith criterion**: no anchor frames a verse as material return, seed-faith transaction, or health entitlement; the layer has no money/giving concept at all; the two verses the basis's own worked example names (John 14:12, Job 36:11) are anchored nowhere; and the prosperity-adjacent pairings that do exist (Jer 29:11 under Hope at weight 1.0, Ps 37:4 under Joy via Torrey, "by his wounds we are healed" routed to the atonement passages, the healing packs) are all framed on the right side of the Akropong line — in two cases with the deliberation written down in the fixture or pack comments themselves. In the "theologically clumsy" tier there are exactly three items, none doctrinal: the confirmed 1 Peter 5:7 double-listing in `peace-of-god.yaml` (torrey :33 + editorial :44, still present at HEAD), the Micah 7:8 comment/data mismatch between the freedom-from-bondage and relapse packs, and a duplicated comment block in `hope-in-god.yaml`. Nothing was flagged on the §4 non-criteria, and no source manifest carries a framing that could trip §3 — the one structurally open vector is OpenBible crowd votes, which today is bounded by the prior-not-label rule, the opt-in `openbibleTopics` mechanism (five packs, all benign topics), and the prosperity fixture family; the honest caveat, which the basis itself makes in §5, is that this audit checks framings a reader can see, and the per-source review record §5 plans (rows for who reviewed, when, and under which criterion) is the piece that would make today's clean verdict durable rather than re-derived.

**Summary:** Audited all 19 manifests and all 58 concept packs against DOCTRINAL-BASIS.md — zero prosperity-criterion violations; three minor non-doctrinal defects (1 Pet 5:7 still double-listed in peace-of-god.yaml, a Micah 7:8 comment/data mismatch across two pastoral packs, one duplicated comment); 148 editorial anchors inventoried for Jesse's §5 sign-off.

# Part 2 — Live engine probe

## Probe setup (how and against what)

- **Method:** scratch script (`/tmp/claude-0/.../scratchpad/probe.mts`) replicating exactly the gauntlet's engine construction in `eval/src/gauntlet.ts` → `buildFixtureDatabase()` (`pipeline/src/buildFixtureDb.ts`, built from `pipeline/fixtures/web-subset.json`) → `openCorpus()` (`eval/src/nodeSqlitePort.ts`, read-only) → `createEngine()` → `engine.research(query)`, i.e. the same path `corpusGoldenGate` uses. No tracked files touched; DB built in scratchpad.
- **Corpus probed: the fixture subset, NOT the full artifact.** The build reported **verseCount 5,667** (the subset has grown past the 1,077 mentioned in the task). The full 31,098-verse artifact (137 MB per `artifacts/content-artifact.json`) is not present in this clone — only its descriptor — so it could not be probed. **Caveat: absence of a bad result here does not prove the full artifact is clean**; notably, several classic proof-texts (Mark 11:24, John 10:10, Job 36:11, Prov 18:16, 3 John 1:2, Job 16:2) are outside the subset, so their pairings were untestable.
- **Engine identity:** engineVersion 0.9.0, corpusFingerprint `60b7f888…`, layerFingerprint `b3ac1033…` (dist build, gitignored, newer than src — the same code the gauntlet would run).
- Basis read first: `docs/DOCTRINAL-BASIS.md` (branch `claude/hearth-thread-t9k25z`, commit 749fad1). Cross-checked against the `eval/golden/prosperity-*.json` family.

## Results per query (top 3–5; reason in brackets)

### Prosperity family (28 queries)

- **prosperity** — 1. Ps 73:3 "envious… prosperity of the wicked" [token]; 2. Lam 3:17 "I forgot prosperity" [token]; 3. Ps 30:6; 4. Num 6:24; 5. Deut 6:1 [passage_terms, commentaries cited]. Mal 3:10/Mark 11:24/Luke 6:38/Phil 4:19 all absent from top 10. **CLEAN** (top results are, if anything, anti-prosperity).
- **wealth** — 1. Job 31:25 "if I rejoiced because my wealth was great"; 2. Prov 28:8 (excessive interest); 4. Jer 17:11 (riches not by right); 7. Matt 6:19 (don't lay up treasures); 10. Luke 6:24 (woe to the rich). **CLEAN** — the corpus answers a wealth query with warnings; both mustNotRank verses held.
- **success** — 1. Josh 1:8 [passage_terms + token] (fixture-affirmed); 2. Ps 10:3; 3. Prov 3:4; 4. Jer 17:9 "heart is deceitful" [passage_terms]; 5. John 14:28 [passage_terms — NOISE]. **CLEAN** (John 14:12 and Mark 11:24 absent).
- **money** — 1. Job 31:39; 2. Mark 6:8 (take no money); 4. Luke 22:5 (Judas's payment); 5. Judges 16:18 (Delilah's bribe — NOISE). **CLEAN**.
- **riches** — 1. Luke 6:24 (woe to rich); 2. Jas 5:2 (riches corrupted); 3. Prov 27:24; 4. Eph 2:4 (rich in mercy); **8. Phil 4:19 "according to his riches in glory"** [token "rich" + passage_terms]. **CLEAN, borderline noted:** the fixture family forbids Phil 4:19 for wealth/prosperity/abundance/financial-blessing but not "riches"; here it matches the verse's own word ("his riches"), which is honest lexical retrieval by the basis's own worked-example logic — but "riches" is a query the family may want to add.
- **financial blessing** — 1. Num 6:24; 2. Matt 5:4; 6. Matt 5:3 (blessed are the poor in spirit) [all "bless" token/passage_terms; "financial" contributes nothing]. Mal 3:10, Luke 6:38, Phil 4:19 all absent — the fixture's sharpest query holds live. **CLEAN**.
- **sow a seed** — 1. Lev 19:19; 2. Deut 22:9 (agricultural laws); 3/5/7. 1 Cor 15:36-38 (resurrection sowing); 8. Micah 6:15 ("sow but won't reap"). Exactly the "agricultural and resurrection passages" the fixture note calls the honest answer; no giving-as-investment verse. **CLEAN**.
- **seed faith** — 1. Matt 17:20; 2. Luke 17:6 (mustard-seed faith); 5-8. Jas 2 + Eph 2:8; 9. Gen 3:20 [passage_terms — NOISE]. The engine reads seed-faith vocabulary as mustard-seed faith, not giving-for-return. **CLEAN**.
- **tithe / tithing** — Deut 14:22-29 tithe laws, Mal 3:7-10, Luke 11:42 (woe Pharisees), Luke 18:12 (Pharisee's boast). Mal 3:10 ranking here is explicitly what the fixtures call honest ("ranks honestly for tithing queries"). **CLEAN** ×2.
- **breakthrough** — 0 results. **EMPTY (honest gap)**, exactly as `prosperity-breakthrough.json` predicts.
- **abundance** — 1. Ps 73:10 [token — NOISE, wicked-prosperity context]; 2. Ps 37:11; 3. Ps 37:16 "better is a little"; 8-9. Ps 23. Luke 6:38/Mal 3:10/Phil 4:19 absent. **CLEAN**.
- **favor** — 1. Prov 3:4; 3. Eph 1:6; 4. Exod 3:21; 6. Matt 5:31 (divorce certificate) [passage_terms — NOISE]. **CLEAN**.
- **increase** — 1. John 3:30 "He must increase, but I must decrease" [token]; 3. Prov 3:9; 8. Luke 17:5 "increase our faith". **CLEAN**.
- **harvest** — 1. Lev 19:9 (gleaning); 6-7. 1 Cor 15:20-21 (firstfruits); 8-10. Gal 6:7-9 (sow to the Spirit). **CLEAN**.
- **hundredfold** — single result: Matt 19:29 "will receive one hundred times" [passage_terms, Barnes/Clarke/Henry cited]. The verse is about renouncing for Christ's sake and contains the word; frame is not giving-obligates-return. **CLEAN, borderline noted** — on the full artifact, watch whether Mark 10:29-30 pairings appear for this seed-faith vocabulary query.
- **give and it will be given** — 1. Luke 6:38 [exact_phrase 60] — fixture-affirmed as honest ("the exact-phrase search of its own words"); rest is "give" token noise. **CLEAN**.
- **name it and claim it** — 1. Num 6:27; 2. Mark 5:9 (Legion — NOISE); **4. John 14:14 "ask anything in my name, I will do it"** and **7. John 14:13** [token "name" + passage_terms]; 8. Exod 20:7 (don't misuse the name — NOISE). **BORDERLINE PROSPERITY-DEVIATION**: the stated reason is honestly lexical ("Shared word: name"), but a searcher typing the word-of-faith slogan gets its ask-in-my-name proof-text at #4/#7 of the measured window. This is exactly the pairing shape a `prosperity-name-it` mustNotRank fixture would pin, and none exists for this query.
- **speak it into existence** — 1. John 8:58 "before Abraham came into existence, I AM" [token "existence" — NOISE]; rest "speak" token noise. No Rom 4:17/Prov 18:21-style pairing. **NOISE** (no deviation).
- **declare and decree** — "declare" testimony verses (1 Jn 1:2-3, 1 Cor 15:1); 9-10. Ruth 1:4-5 [passage_terms "decree" — pure NOISE]. No decree-a-thing proof-text. **NOISE** (no deviation).
- **health and wealth** — 1. Prov 3:8; 2. Job 31:25; 3-4. Ps 42:5,11 (despair psalms); 6. Isa 1:6 (wounds). **CLEAN** — the Akropong-named slogan gets warnings and laments.
- **healing** — 1. Matt 19:2; 2. Ps 147:3; 4. Jer 17:14; 7. Isa 53:5; 8. Jas 5:15; 9. 1 Pet 2:24. Basis affirms "God heals"; no right-to-health framing. **CLEAN**.
- **health** — 1. Prov 3:8; 2. Jer 33:6; 3-4. Ps 42:5,11; 7. Matt 18:35 [passage_terms — NOISE]. **CLEAN**.
- **miracle** — 1. Acts 4:22; 2-3. 1 Kgs 18 (Carmel); Mark miracle narratives. **CLEAN**.
- **victory** — 1. 1 Cor 15:57; 2. Rom 8:37; 3. 1 Jn 5:4; 4. Eph 6:11-12 [concept_anchor "Theme: Victory in Christ", LH editorial + Torrey, attributed]. Spiritual victory, never material. **CLEAN**.
- **promotion** — single result: Prov 3:35 "shame will be the promotion of fools" [token]. The only hit uses "promotion" ironically — the fools' promotion is disgrace. Same shape as the Job 16:2 comforter example. **SENSE-INVERSION (mild; sole result)**.
- **blessing** — Num 6:24, beatitudes (Matt 5:3-6), Rom 12:14 "bless those who persecute you". **CLEAN**.
- **provision** — **1. Rom 13:14 "make NO provision for the flesh, for its lusts"** [token + passage_terms]; then Matt 6:11 (daily bread), Deut 14:26, Joshua 1:11. The #1 result uses "provision" in the exactly opposite frame from the seeker's intent (God's provision vs. provisioning sin). **SENSE-INVERSION** at rank 1.
- **debt** — 1. Matt 6:12; 2-3. Matt 18:27,32 (forgiven debt); Isa 43:25, Isa 53 via sin-as-debt vocabulary. **CLEAN**.

### Sense-inversion candidates (12 queries)

- **comforter** — 1-2. John 14:16-17 (the Counselor) [passage_terms "comforter" — the cross-vocabulary layer correctly bridges WEB's "Counselor" to the query]; 4. 2 Cor 1:4; 5. 1 Jn 2:1. Job 16:2 not in subset (untestable). **CLEAN** — this is the layer working as designed.
- **comfort** — Matt 5:4, Isa 40:1, 2 Cor 1:3-5, 1 Thess 4:18. **CLEAN**.
- **it is well with my soul** — 1. Ps 139:14; 3. Phil 4:14 [token "well"]; 6. Deut 22:7 (bird's nest law — NOISE); 7. John 8:48 "you are a Samaritan and have a demon" [token "well" — ugly NOISE]; 8. 1 Cor 7:38 (NOISE). Hymn intent entirely missed; no concept covers it. **NOISE** (coverage gap, not deviation).
- **new beginnings** — John 13:34, Col 3:10, Gal 6:15 (new creation), Rev 21:1,5; 7. Judges 16:11 "new ropes" (NOISE). **CLEAN** with noise.
- **fresh start** — 1. Ps 139:18; 2. Isa 1:6 (festering sores, via "fresh" wounds vocabulary — NOISE); 3. Isa 40:31; 6. Rom 6:5. **NOISE** (no deviation).
- **lord's supper** — **1. 1 Cor 11:20 "it is NOT the Lord's supper that you eat"** [exact_phrase 60] ranks above 4. 1 Cor 11:23-26 (the institution, LH anchor 28.0), 5. Luke 22:19-20, 6. Matt 26:26-28. Within-topic (it is the Lord's Supper pericope), so not a doctrinal error, but the negated occurrence outranking the curated institution passages is a mild inversion: exact_phrase's flat 60 beats every concept anchor. **SENSE-INVERSION (mild / ordering)**.
- **peace** — 1 Pet 5:7, Phil 4:6-7, John 14:27, Isa 26:3 [Theme: Peace of God]. **CLEAN**.
- **anxiety** — 1. Phil 4:6-7 [Theme: Anxious for nothing]; Matt 6:25-34; John 14:1. **CLEAN**.
- **worry** — only 2 results: 1. 1 Pet 5:7 (excellent); 2. Matt 28:14 "we will… make you free of worry" — the guards'-bribe conspiracy [token — NOISE]. **CLEAN #1, NOISE #2** (thin coverage).
- **grief** — Ps 34:18, John 11:35 ("Jesus wept"), Rev 21:4, 1 Thess 4:13-14, Rom 12:15 [Theme: Grief and loss, LH editorial]. Laments and resurrection hope — appropriate, not inverted. **CLEAN**.
- **hope** — Jer 29:11 [Theme: Hope — deliberately fixtured under hope, not prosperity], Heb 6:19, Heb 11:1, Rom 15:13. **CLEAN**.
- **doubt** — Matt 28:17, Jas 1:6, Luke 24:38, Rom 14:23; 6. Exod 20:12 and 8-9. 2 Sam 17:16-17 [passage_terms — NOISE]. **CLEAN** with noise.

### Shared-core (10 queries)

- **gospel** — Mark 1:4,14,15 (preaching the Good News), John 1:17, Rom 2:16 — all passage_terms; **no concept anchor exists for "gospel"** (coverage gap worth noting given TGC §6 is the basis's positive test). Results doctrinally fine. **CLEAN**.
- **salvation** — Eph 2:8, Acts 4:12, Acts 16:30-31, Rom 10:9, John 3:16 [Theme: Salvation]. **CLEAN**.
- **saved by works** — 1. Eph 2:8-9 [Theme: Grace, not earned, 28.0]; 2. Titus 3:5; 3. 2 Tim 1:9; 4. Rom 11:6; 10. Jas 2:25 [Related theme: Faith and works]. The works-salvation query is answered with grace-not-works plus the James balance — point 5 of the shared core, exemplary. **CLEAN**.
- **earn salvation** — same anchor set, Eph 2:8 #1. **CLEAN**.
- **faith** — 1-2. Jas 2:17,22 (faith-works); 5. Eph 2:8; 8. Heb 11:1. **CLEAN**.
- **grace** — Eph 2:8-9, Rom 11:6, Titus 3:5 [Grace, not earned]; Rom 6:1,14-15. **CLEAN**.
- **repentance** — 1 Jn 1:9, Acts 3:19, 2 Cor 7:10, Luke 15:7 [Theme: Repentance]. **CLEAN**.
- **holy spirit** — exact-phrase verses (Heb 10:15, 1 Cor 6:19, Acts 1:5, John 14:26). **CLEAN**.
- **baptism** — Eph 4:5, Mark 1:4, Rom 6:4, 1 Pet 3:21 — no mode/subject adjudication (per §4 non-criteria). **CLEAN**.
- **born again** — 1 Pet 1:23, 1 Pet 1:3 [exact_phrase]; John 3:3, Salvation anchors. **CLEAN**.

## Adjudication check (CLAUDE.md #6)

**Zero findings.** Every explanation in all 49 result sets is one of: "Shared word(s): X", "Exact phrase", "Matched words appear close together", "Theme: X [named source]", "Related theme: X [named source]", "Preached vocabulary: X [named public-domain commentaries + locator]", "Cross-referenced from X [OpenBible]", "Worded this way in another translation". No reason renders a theological verdict; every curated claim is source-attributed (LH editorial, Torrey, OpenBible, or commentary set with locator).

## Totals

| Category | Count | 
|---|---|
| CLEAN | 40 queries |
| SENSE-INVERSION | 3 (1 at rank-1, 2 mild) |
| PROSPERITY-DEVIATION | 0 firm; 1 borderline |
| ADJUDICATION | 0 |
| NOISE (dominant character of the result set) | 5 queries (plus scattered noise rows inside clean sets) |
| EMPTY (honest gap) | 1 ("breakthrough") |

**All non-CLEAN findings, compactly:**

1. `provision` → Romans 13:14 at #1 → SENSE-INVERSION → "make NO provision for the flesh" answers a seeker of God's provision with the word in its opposite frame.
2. `promotion` → Proverbs 3:35 (sole result) → SENSE-INVERSION (mild) → "shame will be the promotion of fools" — ironic use of the query word, Job-16:2-shaped.
3. `lord's supper` → 1 Cor 11:20 at #1 → SENSE-INVERSION (mild/ordering) → "it is NOT the Lord's supper that you eat" (exact_phrase 60) outranks the curated institution passages (1 Cor 11:23-26, Luke 22:19-20, Matt 26:26-28) at #4-6.
4. `name it and claim it` → John 14:13-14 at #4/#7 → BORDERLINE PROSPERITY-DEVIATION → honest "Shared word: name" mechanism, but the word-of-faith slogan surfaces its own ask-in-my-name proof-text inside the top-10 window; no `prosperity-*` fixture pins this query.
5. NOISE-dominant sets (no doctrinal harm): `it is well with my soul` (John 8:48 "have a demon" at #7), `fresh start` (Isa 1:6 sores at #2), `speak it into existence` (John 8:58 at #1), `declare and decree` (Ruth 1:4-5 for "decree"), `worry` (Matt 28:14 guards'-bribe at #2 of 2).
6. Watch items for the full artifact (untestable here): Phil 4:19 ranks #8 for `riches` (a query the fixture family doesn't cover); `hundredfold` → Matt 19:29 is clean here but is seed-faith vocabulary whose classic pairings (Mark 10:30) are outside the subset; Mark 11:24, John 10:10, Job 36:11, Prov 18:16, 3 John 1:2, Job 16:2 are all absent from the subset so their forbidden pairings pass vacuously — exactly the vacuous-pass risk the fixture notes themselves flag.

Positive structural observation worth relaying: every active `prosperity-*` mustNotRank held under live probing (Mal 3:10, Luke 6:38, Phil 4:19, all in-corpus, never ranked for the forbidden queries), and the curated layer actively steers doctrine-sensitive queries well (`saved by works` → "Grace, not earned" at #1 is the standout).

**Summary:** Probed all 49 doctrine-sensitive queries against the 5,667-verse fixture-subset engine (the same build/path the gauntlet uses; full 31k artifact not available locally): 0 adjudications, 0 firm prosperity deviations (1 borderline: "name it and claim it" → John 14:13-14), 3 sense-inversions (worst: "provision" → Rom 13:14 at #1), all existing prosperity mustNotRank pairings held, remainder clean or honest noise/gaps.
