# 84-Query Battery Re-grade — main @ e762d1c (2026-08-26)

Fresh graded run of the versioned 84-query pastoral battery (`eval/battery/queries.json`, batteryVersion 1) against current `origin/main`, per the whole-Bible coverage plan §4.1. Same queries, same rubric, same verdict scale as the 2026-08-20 report (`/mnt/project-files/search-quality-report-2026-08-20.md`), so grades are directly comparable. Machine-readable companion with per-query top-5 evidence: `battery-regrade-2026-08-26.json` (this directory). Raw run data: session scratchpad `battery-results-main-2026-08-26.json` and the gauntlet machine report (G12 pass).

---

## 1. Identity measured against

| Field | Value |
|---|---|
| Git commit | `e762d1c629f5b121a2aacc6da57cca6bacc3215e` — origin/main tip (PR #53 re-pin merge), fetched 2026-08-26 |
| ENGINE_VERSION | **0.14.0** |
| corpusFingerprint | **`6450b7d79c8c7e6254384c628efd63b3baed91fe49f351049f336ac2e782db33`** |
| layerFingerprint | **`f2eae3d18bd7d0178e669db1822a56c297f898ad75f7c73ed6eefc20f71ff23d`** |
| Artifact | Full release-shaped build from pinned sources (`fetch:sources` — all 18 files checksum-verified, incl. two "repacked upstream, content identical" — then `build:artifact`): 31,098 WEB verses / 66 books, 239 concepts, 1,599 editorial anchors, 15 curated aliases, 307,923-stem translation-token table. sha256 `fb570762…`, **167.84 MiB** |
| Descriptor state | The committed descriptor (`artifacts/content-artifact.json`) on main is the stale 2026-07-31 one (`stale: { blocksRelease: true }`). The build regenerated it locally for measurement; it was **restored to the committed version afterward** — this task changed nothing in the repo. |

**Identity notes for cross-run comparison.**
- This is the **full-corpus identity**, not the committed fixture-corpus baselines identity `(0.14.0, 644b241c…, b24ea16d…)`. The corpusFingerprint `6450b7d7…` equals the corpus-expansion thread's reported post-expansion fixture fingerprint — same full WEB corpus, so this regrade **is** effectively the "post-expansion re-grade" of plan §4.1 on the corpus axis, measured before the expansion PR exists. If the expansion lands as reported, corpus identity should not move again from what is measured here (layer identity may).
- The 2026-08-20 run was graded on the v0.7.1 release corpus (same 31,098 WEB verses, engine 0.9.0, 58/108 concepts). Corpus text identical in substance; engine and layers massively moved.
- Determinism spot-check: my `engine.research()` runner and the gauntlet's G12 battery run produced **byte-identical orderings on all 84 queries** against the same artifact.

## 2. Methodology

- All 84 active queries run through `engine.research()` over the full artifact via the eval harness's own `ContentQueryPort` pattern; full top-10 with typed reasons, provenance labels, cited spelling corrections, and reference outcomes captured.
- Gauntlet also run with `--release-database` (the CI battery job's exact invocation): **G12-battery pass, battery checker green** (its sole success criterion). p95 latency 52.9 ms of 150 ms budget on the full bed.
- Grading: the 2026-08-20 rubric verbatim — **E** excellent · **G** good · **W** weak · **X** wrong/empty · **H** harmful (sense-inverted / negative-context #1 for a pastoral query). Where a query carried a FLAG-FOR-JESSE judgment call in the prior report and the ruling is still open (fn3, fn6, fn14, ph4, ad8, ad12), the prior grader's posture was kept so the delta is attributable to the engine/data, not to grader drift.

## 3. Executive summary

| Run | E | G | W | X | H | good-or-better | Grade |
|---|---|---|---|---|---|---|---|
| 2026-08-20 main (0.9.0, 58 concepts) | 28 | 13 | 20 | 20 | 3 | 41/84 (49%) | **C-** |
| 2026-08-20 main + #31/#32 (108 concepts) | 42 | 12 | 19 | 10 | 1 | 54/84 (64%) | **B-** |
| **2026-08-26 main (0.14.0, 239 concepts)** | **65** | **9** | **8** | **2** | **0** | **74/84 (88.1%)** | **A-** |

**Overall: A-.** The 0.10.0–0.14.0 fix train plus the concept rollout to 239 packs closed nearly everything the 2026-08-20 report named: **zero harmful #1s** (all three 2026-08-20 inversions stay fixed, and ad7 "it is well with my soul" — the last harmful #1 — now routes through the reviewed hymn alias), the **entire misspelling category** went F → functional (every misspelling carries a cited correction; "Phillipians 4:13" and "John 3 16" now parse), **all 8 reference queries** resolve, remembered-phrase flips ph2/ph11 to the quoted verse, and the doctrinal-term category (justification, propitiation, trinity, incarnation) went from flat book-order ties to curated concept answers. What holds it below a clean A: the **adversarial category (C+)** — prosperity-slogan queries still return scatter with no corrective (editorial stance J9 undecided), two exact-phrase negative-context #1s persist behind open rulings (ad8, ad12) — plus two pastoral-order/routing weaknesses (fn3, fn14) and three misspelling-revealed concept gaps. Note the proposed A-tier bar itself (90% good-or-better) is missed by two queries, and the machine tier-report says A-tier NOT attained — but almost entirely on process criteria (all battery judgments still provisional pending J17 ratification; rank-metric baselines unestablished; flagship pins unauthored), not on result quality.

### Per-category subgrades

| Category | 2026-08-20 A | 2026-08-20 B | Now | Tally now | Movement |
|---|---|---|---|---|---|
| felt-need (14) | D+ | B+ | **A-** | 11E 1G 2W | fn12/fn13 fixed (aging-parent + do-not-lose-heart packs); fn3/fn14 still routing/order issues |
| single-word (12) | B- | A- | **A** | 12E | baptism + healing concepts landed |
| remembered-phrase (12) | C+ | A- | **A-** | 10E 2G | ph2 fixed; ph4/ph12 quoted-verse-not-first remain |
| theological-term (8) | C | C | **A** | 7E 1G | doctrinal packs landed; th2 misses Rom 3:25 |
| reference-adjacent (8) | B | B | **A** | 8E | space-separated grammar + book aliases landed |
| misspelling (6) | F | F | **B** | 3E 1G 2W | correction rung works on all 6; 3 reveal concept gaps |
| adversarial (14) | D | C+ | **C+** | 5E 3G 4W 2X | inversions fixed; prosperity correctives still ungated on J9 |
| multi-concept (6) | B | A | **A** | 5E 1G | |
| worship-leader (4) | B- | B- | **A** | 4E | benediction concept landed |

## 4. Per-query grades

Verdicts: **E** excellent · **G** good · **W** weak · **X** wrong/empty · **H** harmful. Columns: 2026-08-20 config A / config B / now.

| id | query | A | B | now | note |
|---|---|---|---|---|---|
| fn1 | I'm anxious | E | E | E | Phil 4:6-7 / Matt 6:25-27 / Jn 14:27 |
| fn2 | grief | E | E | E | Ps 34:18 / Rev 21:3-4 / Jn 11:33-36 |
| fn3 | does God forgive me | W | W | W | #1 Isa 55:7 now right-direction, but #2–8 all Forgiving-others; 1 Jn 1:9 absent from top-10 (J1 open) |
| fn4 | I feel alone | X | E | E | Ps 27:10 / Deut 31:8 / Jn 14:18 |
| fn5 | worried about money | X | E | E | Phil 4:6-7 / Matt 6:25-27 / 1 Tim 6:6-10 |
| fn6 | my marriage is struggling | X | G | G | Heb 13:4 lead; #3 is separation/divorce; emphasis question J6 open |
| fn7 | burnout | X | E | E | Isa 40:31 / Matt 11:28-30 / Ps 62 |
| fn8 | fear of death | E | E | E | Heb 2:15 / Ps 23:4 |
| fn9 | I feel hopeless | E | E | E | 2 Cor 1:8-10 / Ps 42:5 / 1 Kgs 19:4-7 |
| fn10 | depression | E | E | E | |
| fn11 | guilt and shame | X | E | E | Isa 54:4 / Ps 34:5 / Isa 61:7 |
| fn12 | tempted to give up | X | W | **E** | do-not-lose-heart pack: Ps 42:5 / Gal 6:9 / 2 Cor 4 |
| fn13 | caring for a dying parent | X | X | **E** | aging-parents pack landed with exactly the 2026-08-20 prescribed verses |
| fn14 | I keep falling into the same sin | X | W | W | Rom 6:23/5:12 lead, 1 Jn 1:9 #4; no habitual-sin concept (J2 open) |
| sw1 | worship | E | E | E | |
| sw2 | baptism | W | W | **E** | baptism concept: Rom 6:3-4 / Acts 2:38 / Matt 28:19 |
| sw3 | grace | E | E | E | |
| sw4 | hope | E | E | E | |
| sw5 | temptation | W | E | E | |
| sw6 | healing | W | W | **E** | prayer-for-healing concept: Jas 5:13-16 / Jer 17:14 / Ps 103:2-3 |
| sw7 | communion | E | E | E | |
| sw8 | love | E | E | E | |
| sw9 | forgiveness | E | E | E | |
| sw10 | peace | G | E | E | |
| sw11 | joy | E | E | E | |
| sw12 | tithing | W | E | E | Mal 3:8/3:10 lead (Pharisee's boast gone) |
| ph1 | be still and know | G | E | E | Ps 46:10 #1 |
| ph2 | for I know the plans I have for you | W | W | **E** | Jer 29:11 now #1 (xref-stack flip fixed) |
| ph3 | I can do all things | E | E | E | Phil 4:13 #1 but token_overlap(10) only, junk tail — fragile; unpinned flagship |
| ph4 | cast all your anxiety on him | E | G | G | quoted verse 1 Pet 5:7 at #5 (J4 open) — top PD-alias candidate |
| ph5 | all things work together for good | E | E | E | |
| ph6 | the Lord is my shepherd | G | G | **E** | Ps 23:1 #1 |
| ph7 | wonderful counselor | G | E | E | |
| ph8 | do not be anxious about anything | E | E | E | |
| ph9 | God so loved the world | E | E | E | |
| ph10 | trust in the Lord with all your heart | E | E | E | |
| ph11 | come to me all who are weary | X | E | E | |
| ph12 | no weapon formed against me shall prosper | X | G | G | Isa 54:17 #2 by 0.4; "prosper" is KJV/ASV register (WEB "prevail") — PD-alias candidate |
| th1 | justification | W | W | **E** | Rom 8:1 / Titus 3:5-7 / Rom 5:1 |
| th2 | propitiation | W | W | **G** | 1 Jn 4:10 / 1 Jn 2:2 present; Rom 3:25 absent from top-10 |
| th3 | sanctification | G | G | E | |
| th4 | atonement | E | E | E | |
| th5 | trinity | W | W | **E** | Matt 28:19 / Jn 1:1-3 / Jn 14:16-17 |
| th6 | incarnation | W | W | **E** | Jn 1:1 / Jn 1:14 / Col 1:15-19 |
| th7 | predestination | G | G | E | |
| th8 | repentance | E | E | E | |
| ref1 | John 3 16 | X | X | **E** | space-separated grammar landed |
| ref2 | psalm 23 | E | E | E | |
| ref3 | 1cor13 | E | E | E | |
| ref4 | Jn 3:16 | E | E | E | |
| ref5 | Phil 4:6-7 | E | E | E | |
| ref6 | psalms 91 | E | E | E | |
| ref7 | 1 corinthians 13 4 | X | X | **E** | |
| ref8 | Songs of Solomon 2:1 | W | W | **E** | book-alias coverage |
| ms1 | forgivness | X | X | **E** | cited correction → forgiveness concept |
| ms2 | annointing | X | X | **G** | corrected; #1 1 Jn 2:20 on-point, rest scatter — no anointing concept |
| ms3 | rightousness | X | X | **W** | corrected but scatter; #1 Isa 57:12 negative context — no righteousness concept |
| ms4 | Phillipians 4:13 | X | X | **E** | resolves as reference |
| ms5 | stregnth | X | X | **W** | corrected but scatter; no God's-strength concept |
| ms6 | salvasion | X | X | **E** | cited correction → salvation concept |
| ad1 | name it and claim it | W | W | **E** | Asking-in-God's-will corrective: 1 Jn 5:14-15 / Jas 4:3 / Matt 26:39 |
| ad2 | God wants me rich | W | W | W | scatter; 1 Tim 6:6-10 absent (J9 undecided) |
| ad3 | seed faith offering | W | W | W | mustard-seed lexicon collision; corrective absent (J9) |
| ad4 | prosperity | G | G | G | mixed-context token scatter, unchanged |
| ad5 | new beginnings | H | E | E | stays fixed |
| ad6 | comforter | H | E | E | stays fixed |
| ad7 | it is well with my soul | H | H | **G** | **last harmful #1 fixed** — hymn alias → Theme: Hope, honestly labeled; alias target is generic (Ps 42:11/62/103 absent) |
| ad8 | lord's supper | W | W | W | 1 Cor 11:20 #1 by 0.7 over concept anchors (was ~33 pts); J3 ruling open |
| ad9 | doubt | W | W | **E** | doubt concept: Mark 9:23-24 / Jas 1:5-6 |
| ad10 | God helps those who help themselves | X | X | X | scatter; corrective needs editorial ruling (extra-biblical slogan) |
| ad11 | speak things into existence | W | W | X | junk; Rom 4:17 (the verse people mean) never surfaces |
| ad12 | favor of God | W | W | W | Mal 1:9 rebuke-context #1; Ps 90:17 #3 (J5 open; favor concept pending) |
| ad13 | rapture | X | E | E | |
| ad14 | once saved always saved | G | G | G | generic salvation; assurance/eternal-security absent (assurance-bare pending) |
| mc1 | faith and works | E | E | E | |
| mc2 | suffering and hope | W | E | E | 1 Pet 4:12-16 #1, Rom 8:17 #5 |
| mc3 | grace and truth | E | E | E | |
| mc4 | fear and trust | G | G | **E** | Ps 56:11 #3 is the exact join |
| mc5 | love your enemies forgiveness | G | E | E | |
| mc6 | death and resurrection | G | G | G | Rom 6:5 #1 good; #2-4 drift to death-comfort; 1 Cor 15 absent top-5 |
| wl1 | songs about God's faithfulness | G | G | **E** | Lam 3:22-23 #1 |
| wl2 | verses for communion service | E | E | E | |
| wl3 | call to worship psalm | G | G | **E** | Ps 95:6 #1; Ps 100/95:1/150 in top-10 |
| wl4 | benediction | W | W | **E** | Num 6:24-26 #1 by concept anchor, not luck |

## 5. Failure analysis → alias/lexicon mining seed (plan §2.3 / §4.3)

**Failure taxonomy of the 19 non-E queries:**

| Category | Queries | Count |
|---|---|---|
| Missing corrective concept (J9 editorial-stance-gated) | ad2, ad3, ad10, ad11, (ad4) | 4–5 |
| Exact-phrase negative-context #1 (open rulings J3/J5) | ad8, ad12 | 2 |
| Concept gap revealed by fixed spelling rung | ms2, ms3, ms5 | 3 |
| Concept-routing / pastoral-order (open rulings J1/J2) | fn3, fn14 | 2 |
| Quoted-verse-not-first (anchor outranks source verse) | ph4, ph12, (ph3 fragile) | 2–3 |
| Concept/anchor gap, ordinary | ad14, th2, mc6, fn6 | 4 |
| Alias-target breadth | ad7 | 1 |

**Prioritized mining list** (P1 = highest; PD-wording feasibility per decision #4/#5 defaults — ASV/YLT/Darby/BSB/KJV wording only, no ESV/NIV/NLT):

| P | Query (id) | Fix class | Proposal | PD wording? |
|---|---|---|---|---|
| 1 | cast all your anxiety on him (ph4) | QR-6 alias | → 1 Peter 5:7. ASV: "casting all your anxiety upon him" — the remembered wording IS the PD wording. Needs J4 posture (quoted verse leads). | **Yes (ASV)** |
| 2 | no weapon formed against me shall prosper (ph12) | QR-6 alias | → Isaiah 54:17. KJV/ASV: "no weapon that is formed against thee shall prosper" (WEB reads "prevail"). | **Yes (KJV/ASV)** |
| 3 | I can do all things (ph3) | QR-6 alias + flagship pin | → Philippians 4:13; WEB's own verbatim words, suppressed only by the stopword-heavy exact-phrase taper. Also author the ph3 preferredOrder pin the tier report names. | **Yes (WEB itself)** |
| 4 | God helps those who help themselves (ad10) | corrective alias, ruling first | Extra-biblical slogan (Franklin). After a J9-class ruling: → grace-and-dependence anchors (Eph 2:8-9, Ps 46:1, Prov 3:5-6). | n/a (not scripture wording) |
| 5 | speak things into existence (ad11) | lexicon/alias + concept | Rom 4:17 KJV "calleth those things which be not as though they were" is PD; corrective framing J9-gated. | **Yes (KJV)** |
| 6 | God wants me rich (ad2) | corrective concept | contentment/true-riches pack (1 Tim 6:6-10, Heb 13:5, Luke 12:15-21) — concept work, J9-gated. | Yes |
| 7 | seed faith offering (ad3) | concept + guard | cheerful-giver concept (2 Cor 9:7) + guard fixture so mustard-seed doesn't swallow the query. | Yes |
| 8 | favor of God (ad12) | concept (pending) | favor-of-god sits in the pending/corpus-blocked set already (Ps 90:17, Prov 3:3-4, Luke 2:52, Ps 84:11); also J5 phrase-context ruling. | Yes |
| 9 | does God forgive me (fn3) | lexicon routing | strengthen gods-forgiveness routing for question-shaped queries; pending fixture assurance-forgiveness-query exists; J1. | Yes |
| 10 | I keep falling into the same sin (fn14) | new concept | habitual-sin/relapse pack (Rom 7:15-25, Prov 24:16, Rom 8:1, Gal 5:16-17); J2. | Yes |
| 11 | righteousness (ms3) | new concept | Matt 6:33, Rom 3:21-22, 2 Cor 5:21, Phil 3:9. | Yes |
| 12 | strength (ms5) | new concept | Isa 40:29-31, Eph 6:10, Phil 4:13, 2 Cor 12:9. | Yes |
| 13 | anointing (ms2) | new concept | 1 Jn 2:20,27; Isa 61:1; Ps 23:5 (senses kept distinct per G4). | Yes |
| 14 | propitiation (th2) | anchor extension | Rom 3:25 (+Heb 2:17) onto the atonement concept. | Yes |
| 15 | it is well with my soul (ad7) | alias retarget | Existing reviewed hymn-alias row targets Theme: Hope; consider supplementing/retargeting toward Ps 42:11 / Ps 62:1-2 / Ps 103:1-5 — an edit to reviewed data, Jesse's call. | Yes |
| 16 | once saved always saved (ad14) | concept (pending) | assurance-of-salvation (Jn 10:28-29, Rom 8:38-39, Phil 1:6, 1 Jn 5:13); assurance-bare pending fixture exists. | Yes |

Also worth noting, **not** mining targets: ad8 (needs the J3 ruling, not data), fn6 (J6 emphasis ruling), mc6 (1 Cor 15 anchor visibility — ordinary anchor-extension candidate), ad4 (acceptable-as-graded).

**Rule of engagement (per plan §5.2):** every row above enters only through the alias-mining loop — candidate phrasing → run against live engine → *measured miss* → fixture → row → gauntlet → PR. Several are gated on named open rulings (J1–J6, J9) and must not be quietly decided by a data row.

## 6. Known-issue annotations (worked around, not treated as new failures)

- **Non-G12 gate fails on the release identity — expected and tolerated** (the CI battery job's own advisory posture): G2-determinism and G8 probe-baseline-approval fail because the committed baselines/approvals bind the *fixture-corpus* identity `(0.14.0, 644b241c…, b24ea16d…)` and the J39 independent sign-off is outstanding (the known gauntlet-canary state). G3 reports 36 corpus-fixture expectation moves under the full-corpus identity — the same displacement class the corpus-expansion thread reported (28 moves) and that awaits Jesse's combined adjudication ruling; not re-adjudicated here. 28 pending fixtures awaiting later phases are listed by the report, unchanged.
- **Descriptor staleness**: committed descriptor is stale-blocked (`blocksRelease: true`); the local build refreshed it for measurement and it was restored afterward.
- **NEW OBSERVATION (flag, not fixed): the full artifact now exceeds G10** — 167.84 MiB vs the 160 MiB budget (`spelling_deletes` 15.7 vs 12 MiB and `spelling_terms` 1.1 vs 1 MiB also over). Main's per-PR CI measures the fixture artifact and cannot see this; the full-artifact battery job can. Whoever mints v0.14.0 hits this first — it needs either pruning or a reviewed budget change *before* the mint. This did not affect the regrade.
- **Tier-report shape lag**: A3 reports "citedCorrection field absent from every misspelling outcome" even though `research()` demonstrably returns cited corrections (observed on all six ms queries) — the battery outcome serializer doesn't carry the typed field yet. Process finding for the eval workstream, not a runtime gap.
- All battery judgments remain **provisional** (J17 unratified), so the machine tier report scores 0 scoreable queries and cannot certify A-tier regardless of quality; this report's grades are the same human-rubric instrument as 2026-08-20, applied consistently.

## 7. Bottom line

Main went **B- → A-** in six days of merged work, exactly along the lines the 2026-08-20 report prescribed: the ranking train (0.10.0–0.14.0) removed every harmful #1 and every empty misspelling, the concept rollout to 239 packs converted 20+ junk/weak queries to catered answers, and the reference grammar closed its category. The remaining 19 non-E queries decompose almost entirely into (a) **open editorial rulings** (J1–J6, J9 — eight queries wait on them), (b) **five missing/pending concepts** (righteousness, strength, anointing, favor-of-god, assurance), and (c) **three PD-feasible famous-phrase aliases** (ph4, ph12, ph3) — which is precisely the seed list plan §2.3 item 2 wants. Runtime engine changes required for any of this: none identified — every remaining fix is data, rulings, or eval process.
