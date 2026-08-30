# Engine-pack backlog — 161-concept rollout (2026-08-26)

**What this file is.** The durable record of the 161-concept engine-pack rollout
(all adopted tag-gap concepts from `tag-gaps-review.md`, dispositioned as engine
packs on 2026-08-26), and the authoritative work list for the post-PR-#53 re-pin
sweep. It is a faithful copy of the rollout's per-concept ledger (statuses and
reasons transcribed, not re-judged). Written 2026-08-26 for Jesse and any future
session.

**Where the code is.** Six stacked DRAFT PRs, #54 → #55 → #56 → #57 → #58 → #59
(merge in that order; each is stacked on the previous — retarget to `main` as
predecessors merge):

| PR | branch (head) | batch / themes | census | layerFingerprint (end) |
|---|---|---|---|---|
| #54 | `claude/hearth-161-concept-packs-2tf8jk` (head inferred c9b3f57) | Batch 1 — A (Worship, temple & ritual) + B (Prophetic, messianic & end-times) | 153 → 168 | 78adcc89… |
| #55 | `…-2tf8jk-b2` off c9b3f57 (head inferred 2d55955) | Batch 2 — C (Character of God) + D (Spirit, angels & the unseen) | 168 → 181 | 5f7df1ed3409… |
| #56 | `…-2tf8jk-b3` off 2d55955, head adc1280 | Batch 3 — E slice (Wisdom & daily life: oaths-and-vows .. leviathan-and-behemoth) | 181 → 194 | 432bd03913d5… |
| #57 | `…-2tf8jk-b4` off adc1280, head 73278bb | Batch 4 — E remainder (nine 1-book rows) + F (Death, mortality & hope beyond) + G (Justice & society) | 194 → 208 | 126107585f82… |
| #58 | `…-2tf8jk-b5` off 73278bb (head inferred c461559) | Batch 5 — H (Pastoral: suffering, grief & comfort) + I (Devotion & discipleship) | 208 → 223 | f38da39007c3… |
| #59 | `…-2tf8jk-b6` off c461559, head 25297ab | Batch 6 — J (Church life, mission & practice) + K (Salvation & christology) + L (Kingship, covenant & land) + M (Love & relationships) | 223 → 239 | c2dd8663be38… |

All six PRs' CI reds were triaged as the pre-existing J39/J52 classes, with
standing-down comments posted on all six PRs #54–#59 (#58's posted 2026-08-26
09:27 UTC: https://github.com/jestek-dev/scripture-search-engine/pull/58#issuecomment-5423305734
— all four reds matched pre-existing J39/J52, verified). Zero
`NO MEASURABLE EFFECT` packs were merged. Residual local gauntlet REJECT is solely
the pre-existing G2/G8 stale-approval-record class (approvals pin engine 0.9.0).

## Summary by batch

Statuses as recorded in the ledger: ADMITTED (incl. lexicon/anchor extensions) /
ALREADY-COVERED / DEFERRED (to later batch or re-pin) / SKIPPED-blocked / FOLDED.

| Batch | PR | Themes | Admitted | Already-covered | Deferred / blocked | Folded | Rows |
|---|---|---|---|---|---|---|---|
| 1 | #54 | A + B | 16 (1 extension) | 2 | 5 | 1 | 24 |
| 2 | #55 | C + D | 15 (2 extensions) | 4 | 8 | 1 | 28 |
| 3 | #56 | E (first slice) | 13 | 2 | 6 | 0 | 21 |
| 4 | #57 | E (nine 1-book rows) + F + G | 14 | 2 | 13 | 0 | 29 |
| 5 | #58 | H + I | 18 (3 extensions) | 0 | 7 | 0 | 25 |
| 6 | #59 | J + K + L + M | 20 (4 extensions) | 4 | 10 | 1 | 35 |
| **Total** | | | **96** (10 extensions → 86 new ids, 153 → 239) | **14** | **49** | **3** | **162** |

(162 table rows = the 161 adopted concepts + `waiting-and-timing-in-love`, which
Jesse's §11.1 adopted fold had already merged into `romantic-love-and-intimacy`;
the ledger records it as a FOLDED row for completeness.)

## Corpus-blocked deferral roster — the post-#53 re-pin work list

Every row below rides the PR #53 corpus re-pin (per `docs/corpus-payload-dependency.md`).
Status and reason are copied from the ledger. 50 rows (49 review rows + the standing
`virgin-birth` item), plus the folded `waiting-and-timing-in-love` rider noted on
row 48.

| # | id | theme | status | recorded reason |
|---|---|---|---|---|
| 1 | sacrifice-and-atonement | A | SKIPPED-blocked | corpus-blocked: every distinctive anchor (Lev 16; Lev 17:11; Exod 29-30; Num; Deut 21; Ezek 43/45; 2 Chr 29) outside the 211-chapter fixture corpus; `atonement` token owned by the-cross — pack now would be unmeasurable or lean on the-cross's territory. Revisit at re-pin/PR-beta |
| 2 | spiritual-adultery | A | DEFERRED | corpus-blocked: minting books (Hos 1-3; Ezek 16/23) entirely absent from fixture corpus; only honest in-corpus anchor (Jas 4:4) is outside the review's refs. One-concept-or-two vs idolatry stays open. Revisit at re-pin |
| 3 | craftsmanship-and-creativity | A | DEFERRED | corpus-blocked (Exod 31; 35-36 absent) AND the row's own flag (check wisdom-from-god lexicon extension first) unresolved |
| 4 | persecuted-for-gods-word | B | DEFERRED | corpus-blocked (Jer 20/26/37-38, Dan 3/6, Esther all absent) AND G4 collision risk: suffering-for-christ owns bare `persecution`/`persecuted`; boundary design needs the OT spine present |
| 5 | end-times | B | DEFERRED | corpus-blocked (Daniel absent entirely; 2 Tim 3 absent) AND the in-row merge question with day-of-the-lord is a design call better made when Daniel's refs are assertable |
| 6 | god-looks-at-the-heart | C | DEFERRED | keystone 1 Sam 16:7 corpus-blocked (and currently lives as an identity-in-christ anchor); ALL Proverbs witnesses (16:2; 17:3; 21:2; 24:12; 15:11; 20:27) blocked; the review's own flag — one design vs gods-surprising-choice/humble-exaltation "should be decided before any row is minted" — unresolved. Decide at re-pin with 1 Sam 16 assertable |
| 7 | god-relents | C | SKIPPED-blocked | corpus-blocked: Jer 18:7-10; 26:3-19, Jonah 3-4, Joel 2:13-14 all absent; conditional-prophecy gist care + keep-separate-from-immutability cross-note carried for the re-pin curator |
| 8 | gods-holy-name | C | DEFERRED | corpus-blocked: Ezek 36:20-23; 39:7, 25; 20:9-44 all absent (only Ps 23:3 in corpus — a supporting phrase, not a measurable pack); one-or-two vs the-name-of-god DECIDED as two registers (recorded both places) |
| 9 | gods-compassion-for-outsiders | C | DEFERRED | corpus-blocked: Jonah absent entirely (the theme's defining book); the gods-love extension check is unmeasurable without it |
| 10 | famine-of-hearing-gods-word | C | DEFERRED | corpus-blocked: Amos 8:11-12 absent; the word-withheld vs prayer-shut-out lexicon-routing decision (Lamentations unanswered-prayer cross-note) deferred with it, to be settled across both rows together |
| 11 | blasphemy-against-the-spirit | D | SKIPPED-blocked | all three naming passages (Matt 12:31-32; Mark 3:28-30; Luke 12:10) corpus-blocked — AND already represented by the pre-existing pending fixture unpardonable-sin (2026-08-18), which stays the measured-gap record; its anxious-searcher design note governs the eventual pack at the re-pin |
| 12 | spiritual-warfare | D | DEFERRED | corpus-blocked: Dan 10:13, 20-21; 12:1 and Rev 12:7-12 all absent; recorded lexicon fact (resisting-the-devil already carries bare phrase "spiritual warfare") weighs against a third pack until conflict texts are assertable; two-register decision with deliverance-from-demons recorded |
| 13 | empowered-by-the-spirit | D | DEFERRED | corpus-blocked: every Spirit-of-the-LORD-came refrain (Judg 3:10-15:14) absent — only Judg 16 (the departure, 16:20) is in corpus; Nehemiah's recorded decline (9:20, 30 routed to holy-spirit) noted on that pack's riders |
| 14 | gloating-over-downfall | E | DEFERRED | corpus-blocked: every direct text (Prov 24:17-18; 17:5; Obad 1:12-13; Ezek 25:3,6; 26:2) absent; lone in-corpus witness Job 31:29 too thin to measure; row self-marked BORDERLINE (fold into broader betrayal/vengeance treatment) — decide at re-pin alongside Theme G's vengeance row |
| 15 | counsel-and-advisers | E | DEFERRED | corpus-blocked signature texts (Prov 11:14; 15:22; 1 Kgs 12:6-15; 1 Chr 12/27) AND row self-marked BORDERLINE (wisdom-from-god/guidance lexicon question, check-first unresolvable without the texts); MEASURED hijack recorded for the re-pin curator: "multitude of counselors" currently routes wholesale to holy-spirit-the-comforter's Counselor anchors (John 14-16) — the human-advisers register has no honest in-corpus answer today (only 2 Sam 17, Prov 27:9, Ps 1:1) |
| 16 | stewardship | E | DEFERRED | corpus-blocked: BOTH defining parables absent (Matt 25:14-30 talents; Luke 12:41-48 faithful steward) plus Luke 16 and all 1 Chr refs; 1 Pet 4:10 owned by spiritual-gifts; the work-and-diligence extension check, stewardship-of-days id-closeness, and the money/debt scope-all-three cross-note all recorded for the re-pin curator |
| 17 | courage | E | DEFERRED | corpus-blocked: the row's entire case (Esth 4:11-16; 5:1-2; 7:6; Neh 6:9-13) and its roadmap appends (Dan 3; 6) absent; the in-corpus courage texts are fear-not's divine-comfort register (Josh 1:9, Ps 27:14) which the row itself says is precisely NOT this gap; measured: "courage in the bible" already surfaces Ps 27:14/27:1 lexically, "courage to do the right thing" unserved — for the re-pin |
| 18 | wholehearted-devotion | E | DEFERRED | corpus-blocked: EVERY requested ref absent (1 Kgs 8:61; 11:4; 15:3, 14; 1 Chr 12:33, 38; 28:9; 29:9-19); 1 Kgs 18:21 in corpus but owned by idolatry. DESIGN-RESOLVED in batch 5 (loving-god row): whole-heart vocabulary lands on loving-god + seeking-god; wholehearted-devotion resolves at re-pin as their lexicon extension, not a third id (reversible; recorded in both files) |
| 19 | vanity-of-life | E | DEFERRED | corpus-blocked: the thesis texts (Eccl 1:2-11; 2:11, 17; 12:8 and the refrain instances outside ch. 3) ALL absent — Ecclesiastes corpus is ch. 3 only; the one in-corpus refrain instance (Eccl 3:19 "all is vanity") is the mortality-register use and is anchored by batch 4's mortality pack with a cross-note; the row's own gist flag (WEB "vanity" + NIV-remembered "meaningless" both reachable, routed to the book's arc incl. 12:13-14) needs the thesis texts to honor. Revisit at re-pin |
| 20 | right-in-their-own-eyes | E | SKIPPED-blocked | corpus-blocked: Judg 17:6; 21:25 (and 18:1; 19:1) all absent — Judges corpus is ch. 16 only; nearest witnesses Prov 21:2; 12:15 also absent; the fold-into-discernment alternative stays open for the re-pin |
| 21 | gods-surprising-choice | E | DEFERRED | the standing one-design ruling (decide with god-looks-at-the-heart + humble-exaltation together) still binds and god-looks-at-the-heart remains corpus-blocked-deferred; ALL Judges refs (3:15-15:15) + 1 Sam 16:7; 9:21 absent. NEW for the re-pin curator: 1 Cor 1:26-29 verified IN CORPUS and UNCLAIMED — the design's natural NT keystone when the three-row design is decided |
| 22 | death-and-burial | F | SKIPPED-blocked | corpus-blocked: only 1 Sam 31:11-13 in corpus of the whole row (Gen 23/25/47/49/50, Josh 24, Luke 23, John 19, Deut 21/34, 1 Kgs 2/13/14 all absent); the burial-practice register unmintable |
| 23 | redeemer | F | SKIPPED-blocked | corpus-blocked: Job 19:25-27 ("my redeemer lives" — the row's whole case) and 33:24, 28 absent (Job corpus is chs 1 + 31); decide-alongside-kinsman-redeemer note carried — that row is ALSO blocked, so the one-two-or-extension design stays whole for the re-pin |
| 24 | mediator | F | SKIPPED-blocked | corpus-blocked: Job 9:32-35 (the umpire-longing, the minting register), 16:19-21, 33:23-24 and 1 Tim 2:5 all absent; in-corpus 1 John 2:1 (advocate) and Heb 12:24 (mediator of a new covenant) NOTED for the re-pin curator but the row's own register is unassertable; the Hebrews decide-alongside-priesthood merge note carried (batch 1 priesthood pack cross-noted, did not build this row) |
| 25 | cities-of-refuge | G | SKIPPED-blocked | corpus-blocked: Josh 20, Exod 21:13, Num 35, Deut 4:41-43/19 ALL absent; the standing misroute WARNING (refuge-in-trouble / pastoral-refuge-and-justice adjacent but wrong) and the lexicon-extension either/or carried for the re-pin |
| 26 | inheritance | G | SKIPPED-blocked | corpus-blocked: Joshua's dense text (chs 13-21), Num 26-36, Deut refs, Ps 105/111/119:111 all absent; in-corpus 1 Pet 1:4 / Eph 1:11-14 are the NT in-Christ register — a different design to decide at re-pin, recorded |
| 27 | kinsman-redeemer | G | SKIPPED-blocked | corpus-blocked: Ruth 2-4 absent (corpus has Ruth 1 only), Lev 25, Deut 25:5-10 absent; levirate either/or + Job redeemer-row adjacency (decide together) carried |
| 28 | restitution | G | SKIPPED-blocked | corpus-blocked: Exod 21:18-22:15, Lev 5:16; 6:1-7; 24:17-21 ALL absent |
| 29 | peace-among-nations | G | SKIPPED-blocked | corpus-blocked: BOTH twin texts (Mic 4:1-4; Isa 2:2-4) absent — the row IS those two texts |
| 30 | warfare | G | SKIPPED-blocked | corpus-blocked: Deut 20; 21:10-14; 23:9-14; 24:5; 25:17-19 ALL absent; the bare-"warfare" three-way lexicon collision warning (vs the spiritual-warfare rows) recorded for whichever mints first |
| 31 | good-news-for-the-poor | G | DEFERRED | corpus-blocked: the signature texts (Luke 4:18; 1:52-53; 7:22; 12:33) absent; lone in-corpus Luke 6:20-25 too thin to measure and adjacent to beatitude territory; the keep-distinct-from-justice reversible call recorded on both rows |
| 32 | deliverance | H | SKIPPED-blocked | corpus-blocked: EVERY requested ref absent (1 Sam 7-26, 2 Sam 22, Judg 2-15, 1 Kgs 20, Ezra 8, Esth 4:14); MEASURED misroute recorded for re-pin: "god will deliver you" returns Deut 7:23 rank 1 (destroy-the-nations register, wrong intent) |
| 33 | remembrance-and-memorials | I | SKIPPED-blocked | corpus-blocked: memorial-practice spine absent (Josh 4, 1 Sam 7:12 Ebenezer, Esth 9:26-28, Deut 8 etc.); lone in-corpus requested ref Deut 7:18 too thin to measure; BORDERLINE forgetting-in-prosperity extension flag carried for re-pin |
| 34 | running-from-god | I | DEFERRED | corpus-blocked: Jonah absent entirely (the theme's defining book — gods-compassion-for-outsiders precedent); lone in-corpus witness Ps 139:7-12 is presence-of-god's anchor; measured noise recorded ("running from god" -> Gen 3:8 token luck) |
| 35 | contending-for-the-faith | I | SKIPPED-blocked | corpus-blocked: Jude absent entirely (the row IS Jude 1:3-4, 17-23); pre-existing pending fixture apologetics-umbrella-expansion (asserting Jude 1:3) remains the measured-gap record, verified still pending-failing |
| 36 | zeal-for-god | I | SKIPPED-blocked | corpus-blocked: Num 25:7-13 (Phinehas — the row's whole case) absent; in-corpus zeal texts are the wrong register (Rom 10:2 zeal-without-knowledge caution; Titus 2:14 now good-works'); vigilante-violence gist CAUTION carried for the re-pin curator |
| 37 | circumcision-of-the-heart | I | DEFERRED | corpus-blocked: Deut 30:6; 10:16 absent; the read-together heart-design (w/ new-heart + hardness-of-heart's Jer 4:4/9:26 routing) deferred WHOLE; NEW for re-pin curator: Rom 2:28-29 verified IN CORPUS and UNCLAIMED — the NT statement, natural keystone when the design is decided |
| 38 | new-heart | I | DEFERRED | corpus-blocked: Ezek 11:19-20; 36:25-27 absent; Ezek 18:31 in corpus but inside repentance's 18:30-32 anchor; Jer 31:33 covenant's; decide one-or-two w/ circumcision-of-the-heart at re-pin (both rows' own cross-flags); measured noise recorded ("heart of stone to heart of flesh" -> Jer 17:5 token luck) |
| 39 | opposition-to-gods-work | J | SKIPPED-blocked | corpus-blocked: Ezra absent entirely; Neh corpus = ch. 8 only (2; 4; 6 absent) |
| 40 | gentile-inclusion | J | DEFERRED-to-re-pin | the CONTESTED row's REQUIRED extension check on nations-and-peoples RUN and recorded: register mismatch (origin-of-nations vs church-inclusion), measured; core texts (Acts 10-11; 15) corpus-blocked; measured misroute recorded ("law of moses" query hijacked by governing-authorities); Acts 13:47-48 + Gal 3:28 noted FREE and in-corpus for the re-pin curator |
| 41 | men-and-women-in-the-church | J | SKIPPED-blocked | corpus-blocked: 1 Tim 2:8-15 absent (1 Tim corpus = ch. 6); two-row design vs head-coverings DECIDED (recorded in head-coverings pack); fold stays open at re-pin |
| 42 | truth | K | DEFERRED-to-re-pin | John 18:37-38 (Pilate) + 17:17-19 corpus-blocked; 14:6 salvation's/only-way's, 14:17 + 16:13 comforter's (Counselor routing binds); one-treatment cross-note resolved: walking-in-truth landed as walking-in-the-light extension; what-is-truth register waits for its texts |
| 43 | legalism | K | SKIPPED-blocked | corpus-blocked: Col 2:16-23 absent (Col corpus = chs 1, 3); grace-not-earned extension route flagged for re-pin |
| 44 | davidic-covenant | L | DEFERRED-to-re-pin | corpus-blocked: 2 Sam 7 (home text) + all Kings/Chronicles stress-texts absent; lone 2 Chr 7:17-18 (free) too thin; covenant-extension check + no-messianic-read-back note carried whole |
| 45 | exile-and-captivity | L | SKIPPED-blocked + JESSE'S CALL | corpus-blocked entirely; BORDERLINE routing (fold into sojourners-and-strangers vs separate id) remains Jesse's call, cross-noted on batch 4's sojourners pack; nothing prejudged |
| 46 | the-lords-anointed | L | SKIPPED-blocked | corpus-blocked: 1 Sam 24; 26 + 2 Sam 1; 19 absent (1 Sam corpus = chs 15, 31); misapplication-guard design note carried |
| 47 | unequally-yoked | M | SKIPPED-blocked | corpus-blocked: 2 Cor 6:14-18 absent (no ch. 6) + all Ezra/Neh/2 Chr refs; holiness/love-not-the-world extension check + both register caveats carried |
| 48 | romantic-love-and-intimacy | M | SKIPPED-blocked | corpus-blocked: Song of Solomon corpus presence = 2:1 ALONE (verse-level check); every requested ref absent; non-graphic celebration-register design note carried whole. RIDER: waiting-and-timing-in-love (FOLDED per Jesse's §11.1 adopted fold) rides this row's deferral — Song 2:7 charge |
| 49 | virgin-birth | standing (pre-rollout) | standing deferral | deferred to the J52 re-pin since the apologetics display-tag pass (2026-08-25); unchanged by this rollout |
| 50 | leviathan-and-behemoth | E | SKIPPED-blocked | standing corpus-block unchanged (Job 40-41; Ps 74:13-14 absent); the pre-existing pending fixture leviathan-and-behemoth remains the measured-gap record; rides PR #53 / re-pin |

**Additional re-open notes recorded with the final roster** (not separate concepts —
registers/questions that reopen at the re-pin): eternal-life standalone-pack question
(recorded in salvation.yaml); false-teachers don't-receive/don't-sponsor register
(2 John 1:7-11 — 2 John absent entirely); shepherds-and-the-flock bad-shepherds
register (Ezek 34 / John 10 / John 21); election-and-predestination's Rom 9:6-24
(potter texts enter only with the whole argument assertable); supporting-gospel-workers'
3 John 1:5-8 claim (3 John corpus = 1:4 only; the verse stays hospitality's anchor).

## Items flagged for Jesse's decision

Recorded in the ledger as Jesse's calls or flagged for his read — copied faithfully:

1. **end-times vs day-of-the-lord merge question** (Theme B). day-of-the-lord was
   ADMITTED in batch 1 (kept separate from divine-judgment and second-coming;
   1 Thess 5:1-3 + Mal 3:1-2 in corpus). end-times was DEFERRED: corpus-blocked
   (Daniel absent entirely; 2 Tim 3 absent) AND "the in-row merge question with
   day-of-the-lord is a design call better made when Daniel's refs are assertable."
   The merge-or-two-ids question is open for the re-pin — Jesse's word wanted.

2. **election-and-predestination — ADMITTED, FLAGGED FOR JESSE** (Theme K, PR #59).
   Minted with a §4-NEUTRAL gist: "election disputes ruled out as criteria; routes,
   adjudicates nothing" — recorded for Jesse's read. Anchors: Eph 1:4-5 keystone +
   Rom 8:29-30 (span sibling w/ image-of-god's 8:29) + Eph 1:11; 2 Thess 2:13-14 +
   1 Thess 1:4 ride re-pin. Rom 9:6-24 DELIBERATELY NOT RIDDEN (potter texts enter
   only with the whole argument assertable — for the re-pin curator). Measured
   before: "predestination" returned ONE chipless result.

3. **exile-and-captivity routing — JESSE'S CALL** (Theme L, roster row 45).
   Corpus-blocked entirely; the BORDERLINE routing question (fold into
   sojourners-and-strangers vs separate id) remains Jesse's call, cross-noted on
   batch 4's sojourners-and-strangers pack (which honored the exile-register gist
   WITHOUT deciding the §1(e) routing call). Nothing prejudged.

4. **shepherd-psalm-guard pending fixture** (recorded on batch 6's
   shepherds-and-the-flock row): the pending fixture NOW PASSES as a side effect
   of the mint (Ps 32:8 hijack displaced) but was LEFT PENDING — "activation tied
   to guidance-reword decision."

## Provenance

Transcribed 2026-08-26 from the rollout session's per-concept ledger (scratchpad
`pack-ledger.md`, thread cmsg_01P3QsU2j86UJUbajEtMTYp2TTUWBKekKx8HepiCcJnJLb).
Scope source: `/mnt/project-files/research/bible-rollout/tag-gaps-review.md` §2.
Statuses and reasons are copied, not re-adjudicated.

## Post-#53 re-verification (2026-08-26, corpus-blocked sweep session) — ALL 50 ROWS STILL GATED

The sweep session dispatched after PR #53 merged (~15:22Z) re-verified every
roster row against the re-pinned tree (origin/main @ e762d1c). **Finding: the
premise "the re-pin unblocks these rows" is false — zero rows are buildable.**

**Ground truth, verified mechanically:**

- `npm run fetch:sources` is GREEN on the re-pinned tree: 18/18 sources fetch;
  `web` and `jfb` report "archive repacked upstream, content identical". The
  re-pin itself holds.
- PR #53 is PR-α, a **pure content re-pin**: the WEB delta report
  (`docs/reviews/2026-08-25-source-repin-delta-reports.md`) proves the text
  IDENTICAL over the witnessed 5,726 verses; `pipeline/fixtures/web-subset.json`
  changed only its `sourceSha256` and the textless Luke 17:36 entry. The
  fixture-corpus **chapter selection did not change** (213 chapters incl. the
  two verse-level rows; 5,726 verses). Identity: engine 0.14.0, corpusFingerprint
  `644b241c…`, layerFingerprint `b24ea16d…` — no new chapters entered the corpus.
- Every one of the 50 roster rows' decisive chapters was checked against the
  regenerated `web-subset.json`: **all 50 rows' blocking refs remain absent**
  (Daniel, Jonah, Esther, Ezra, Hosea, Joel, Amos, Obadiah, Micah 4, Isaiah 2/7,
  Judges outside 16, Ruth 2–4, Song of Solomon beyond 2:1, Jude, Matt 1/12/25,
  Mark 3, Luke 1/4/12/16/23, John 17–19, Acts 10–11/15, 2 Cor 6, Col 2,
  1 Tim 2, 2 Sam 7, Job 9/19/40–41, Eccl 1–2/12, Deut 10/30, Ezek 11/36, …).
  Row 48's Song 2 presence is the single verse 2:1 fixture row, exactly as the
  roster recorded — every requested ref still absent.
- What these rows actually ride is the **corpus-expansion PR (PR-β, plan
  P4.15 / DG-15)** per `docs/corpus-payload-dependency.md`: #53 discharges the
  re-pin dependency and makes PR-β *schedulable*, but deliberately carries no
  chapter expansion ("one PR per claim"; NO-MEASURABLE-EFFECT was PR-α's
  desired verdict, and it achieved it: 25 probes 0% churn). The
  `virgin-birth` pending fixture's own activation note says the same: concept +
  Matt 1/Luke 1 chapters + coversConcepts claim land TOGETHER in PR-β.
- Separately, PR #53's FINDING for Jesse stands: the openbible-subset /
  passage-terms-subset **catch-up regeneration was excluded** (it moves 8
  golden-fixture expectations across 6 fixtures + 3 eval tests) and awaits
  Jesse's ruling. No roster row is gated on the distillates specifically, but
  the catch-up must land (or be ruled on) before/with PR-β's regeneration cycle.

**Partition result: CLEAR = 0 rows. STILL GATED = all 50 rows**, every one on
PR-β (corpus expansion), with these rows ALSO carrying an explicit Jesse gate
that survives PR-β:

- end-times (row 5): merge-or-two-ids vs day-of-the-lord — Jesse's word wanted.
- exile-and-captivity (row 45): fold-vs-separate routing — Jesse's call.
- gods-surprising-choice (row 21) + god-looks-at-the-heart (row 6): the
  standing one-design ruling (decide with humble-exaltation together) binds.
- Adjacent flagged items (not roster rows): election-and-predestination's
  §4-neutral wording awaits Jesse's read; shepherd-psalm-guard stays pending
  (activation tied to the guidance-reword decision).

**No pack was built, no fixture flipped, no PR opened** — building any row now
would ship assertions on absent verses (vacuous guards / structurally-rejected
packs), which both the concept-curation skill and
`docs/corpus-payload-dependency.md` §3(ii) prohibit. Statuses above are
re-verified, not re-judged; the per-row reasons in the roster table stand
unchanged. Next actionable step is PR-β itself: the payload spec in
`docs/research/2026-08-18-books-harvest-corpus-backlog.md` (267 blocked
reference entries), fixture-first, on the now-re-pinned corpus.

## 2026-08-26 ~16:45Z — Full-Bible expansion BUILT; blocked on the ruling packet

The PR-β corpus expansion was built and pushed as `87fd68c` on
`claude/hearth-161-concept-packs-2tf8jk` (committed as `de0fa84`, message-only
amend at push; tree identical; no PR opened). 5,726 → 31,098 verses, all 66
books; corpusFingerprint `644b241c…` → `6450b7d7…`; openbible/distillate
subsets quarantined per #53's FINDING (held: 23 rows / 1,835 edges unchanged,
xref-suppression 7/7). It is blocked solely on Jesse's fixture-adjudication
ruling: 28 active golden expectation moves across 16 fixtures (3 fixtures
overlap the pending catch-up ruling). The combined 32-row disposition table
awaits his one pass in
`/mnt/project-files/research/bible-rollout/corpus-expansion-ruling-packet.md`.

**The 50-row roster above now additionally waits on that ruling** — PR-β is
its unblocker, and PR-β resumes the moment Jesse rules on the packet.

## 2026-08-26 ~23:20Z — Ruling EXECUTED; expansion PR OPEN as draft PR #64

Jesse approved the ruling packet as proposed (21:58Z, "Agree with all"). The
ruling was executed on the branch and the expansion PR is now open:

**https://github.com/jestek-dev/scripture-search-engine/pull/64** (draft,
base main, head `claude/hearth-161-concept-packs-2tf8jk` @ `6af9ba9` (9eafb61 + a windows-only CLI-test timeout fix);
assignee/reviewer jestek-dev). All 28 expansion disposition rows executed
(three disclosed window deltas, three fixture splits, row 20 back to pending
per its own disposition branch); rows 29-32 ride the separate catch-up PR —
quarantine held byte-identical. Final identity **0.14.0 / corpus
`6450b7d7…` / layer `fd27c55c…`** (layer moved from the investigation's
`b2c1fc84…` by the full-corpus openbible-sections subset regeneration).
G3: zero active failures; only reds are the J39 canary and the G2/G8
approval-binding class (J39 signs once, after this merges). Full-artifact
G10 over-budget (167.84 > 160 MiB) flagged in the PR as a pre-existing mint
blocker.

**Supplement for Jesse** (six release-bed-only fixture moves found in the
battery-regrade reconciliation — pre-existing on main's release bed, all
passing on PR #64's bed — plus the virgin-birth pick and the row-20
presence-with-provenance fixture shape, each with a recommended
disposition):
`/mnt/project-files/research/bible-rollout/corpus-expansion-ruling-supplement.md`

**The 50-row roster above is now unblocked pending PR #64's merge** — on
merge, roster packs build fixture-first against the full-Bible corpus.

## 2026-08-27 ~03:0xZ — ROSTER BUILT: 47 of 50 rows executed post-#64 (five waves, one PR)

PR #64 merged ~01:36Z; the roster build ran fixtures-first on the full-Bible
corpus (branch `claude/hearth-161-concept-packs-2tf8jk`, DRAFT PR to follow).
Census **239 → 283** (44 new ids + 3 lexicon extensions). Identity
**0.14.0 / corpus `6450b7d7…` / layer `e4f864bf…`** (layer-only change; no
ENGINE_VERSION bump).

**Partition: 47 buildable / 3 gated.** Gated rows (untouched, still open):

| # | id | why gated |
|---|---|---|
| 5 | end-times | the in-row merge question with day-of-the-lord is Jesse's open design call |
| 45 | exile-and-captivity | routing (fold into sojourners-and-strangers vs separate id) is expressly Jesse's call |
| 49 | virgin-birth | its venue is in the PENDING corpus-expansion-ruling-supplement — not preempted |

**Dispositions (all 47 buildable rows admitted; none NO-MEASURABLE-EFFECT;
none held for adjudication):**

- Wave 1 (Themes A–C + the one-design trio): sacrifice-and-atonement,
  spiritual-adultery, craftsmanship-and-creativity, persecuted-for-gods-word,
  god-looks-at-the-heart (lexicon entry moved from identity-in-christ, 1 Sam
  16:7 DUAL), god-relents, gods-holy-name, gods-compassion-for-outsiders,
  famine-of-hearing-gods-word, gods-surprising-choice (one-design trio ruled
  in-pack: three registers, cross-related).
- Wave 2 (Themes D–E): blasphemy-against-the-spirit (unpardonable-sin fixture
  activated), spiritual-warfare, empowered-by-the-spirit,
  gloating-over-downfall (borderline resolved: narrow mint, one-directional
  vengeance relation), counsel-and-advisers, stewardship, courage,
  wholehearted-devotion → EXTENSION of loving-god (+seeking-god note),
  vanity-of-life, right-in-their-own-eyes, leviathan-and-behemoth (pending
  fixture activated).
- Wave 3 (Themes F–G): death-and-burial, redeemer + kinsman-redeemer (two
  registers; Job 19:25-27 DUAL with resurrection-of-the-dead; levirate
  folded), mediator (1 Tim 2:5 verse-scoped sibling in jesus-the-only-way's
  2:5-6), cities-of-refuge, inheritance (one id, both registers; Eph 1:13-14
  disjoint from election's 1:11), restitution, peace-among-nations + warfare
  (query partition; three-way bare-war boundary), good-news-for-the-poor.
- Wave 4 (Themes H–I): deliverance (Deut 7:23 misroute fixed),
  remembrance-and-memorials (one id; ebenezer collapse admitted),
  running-from-god, contending-for-the-faith → EXTENSION of giving-an-answer
  (it already owned Jude 1:3 + 1:22), zeal-for-god (vigilante caution
  honored; house/bible entries rejected at G4), circumcision-of-the-heart
  (narrow mint) + new-heart → EXTENSION of new-creation (the read-together
  heart design: one new id total; 'heart of flesh' entry rejected — it
  displaced the psalm-73 guard fixture).
- Wave 5 (Themes J–M): opposition-to-gods-work, gentile-inclusion (Jesse's
  adopted contested row; extension-check condition satisfied),
  men-and-women-in-the-church (§4-neutral; two-row design vs head-coverings
  per the recorded decision), truth (John 17:17 DUAL with
  trustworthiness-of-scripture), legalism, davidic-covenant (extension route
  measured and declined: covenant buries 2 Sam 7 below seven general
  anchors; 2 Sam 7:12-16 DUAL), the-lords-anointed (misapplication guard),
  unequally-yoked (2 Chr alliance refs declined per register caveat),
  romantic-love-and-intimacy (waiting-and-timing rider folded per Jesse's
  adopted fold).

**Gauntlet at head:** G3 411 active fixtures hold (374 → 411), G4 PASS (283
concepts mutually distinct; 68 collapses all acknowledged), G8 max churn 0%.
Only reds: the pre-existing G2/G8 approval-binding class (ordering snapshot +
G8 baselines regenerated with the sanctioned flags; approvals left for
Jesse) and the J39 canary. Promotion advisory: six pre-existing pending
fixtures now pass on the full corpus (apologetics-umbrella-expansion,
first-and-last-coming-judge, honor-the-son-john5, it-is-well,
no-other-god-isaiah-44-46, trustworthiness-god-breathed) — promotion left to
its own change. Sweep universe derivations regenerated (compile-universe +
select-seeds), double-run byte-identical.

**Roster PR OPEN as draft:** https://github.com/jestek-dev/scripture-search-engine/pull/67
(assignee/reviewer jestek-dev; CI triage in progress; PR #65 baseline-regen
coordination and PR #66 promotion overlap noted in the body).

**PR #67 CI triage closed** (merged head a27e7d4 after #63 landed on main;
identity unchanged 0.14.0 / 6450b7d7… / e4f864bf…): all four red jobs are
pre-existing classes (J39 canary; windows telemetryAudit flake also on main;
stale-descriptor battery wall NEEDS-JESSE 1.9; downstream cross-leg). No
branch-introduced reds. Standing-down comment:
https://github.com/jestek-dev/scripture-search-engine/pull/67#issuecomment-5434270472

## 2026-08-27 ~13:29Z — PR #65 merged; PR #67 READY FOR REVIEW, resynced — LAST open identity mover

**~13:02Z Jesse merged PR #65 (alias batch 1) as squash `b81f17c`** (main
moved 0d12c34 → b81f17c) **and marked PR #67 ready for review** (no longer
draft). #67 went merge-conflicted against the new main and was resynced
~13:29Z: merge commit `1d00898` + regen commit `0ecc65c` = new head
**`0ecc65c`**. 8 conflicts, resolved as:

- `workbench/test/healthSources.test.ts` hand-merged — census union **288**,
  verified against 288 packs in `ontology/concepts/`.
- `probes.json` + `ordering.snapshot.json` regenerated via the sanctioned
  `npm run gauntlet -- --update-baseline --update-ordering-snapshot` — this
  was the owed second-to-merge regen (the alias thread confirmed #67 owes
  nothing further).
- Sweep universe/seeds + hand-checked-expansions regenerated (double-run
  byte-identical; universe 3e7c66a3…, seeds 645701d3…).

**Identity on the new head:** engine **0.14.0** (no bump) / corpus
**6450b7d7…** unchanged / layer
**`9a11fd56edd7511bc7139db642dee26c19e5d4ce4456ed11bdc99b8bf181b8c5`**
(union of #65's 1a3516ba… and this roster's e4f864bf…).

**Validation:** G3 **530 active fixtures** (522 + #65's 8) all holding, zero
displacement/admission flips; G1/G4–G11 pass; only local reds are the J39
canary (gauntlet-machine-report.test.ts:142) and the G2/G8 stale-approval
binding — both pre-existing classes. Sync comment 5439835531 posted; PR body
identity/fixture/census rows updated.

**With #65 merged, #67 is the LAST open identity mover.** J39 signs once,
after #67 merges; steward session_01G5isfKZtdPDLYvDzzbst1H receives the
merged identity on #67 merge.

**Still open for Jesse:** merge #67; the supplement ruling (S1–S6 +
virgin-birth venue + row-20 shape) — blocks the v0.14.0 mint; the G10 size
>160 MiB mint blocker stands. The 3 gated roster rows are unchanged
(end-times, exile-and-captivity, virgin-birth).

## 2026-08-27 13:44Z — PR #67 MERGED (squash 65b6a6f) — roster COMPLETE, J39 unblocked

**Jesse squash-merged PR #67 at 13:44:53Z** → main tip **`65b6a6f`**
("Corpus-blocked roster build: 47 of 50 rows executed post-#64 (44 packs +
3 extensions, fixtures-first) (#67)"). Merge = admission per the project's
convention. The 50-row roster work is **COMPLETE**: 47/50 rows executed
(44 new packs + 3 lexicon extensions) + 3 rows gated on Jesse
(end-times, exile-and-captivity, virgin-birth).

**Verified on main @ 65b6a6f:** 288 concept files in `ontology/concepts/`,
census test asserts 288, resynced content present; 530 active golden
fixtures all holding (pre-merge validation of the same tree).

**Final identity on main:** engine **0.14.0** / corpus **6450b7d7…** /
layer **9a11fd56edd7511bc7139db642dee26c19e5d4ce4456ed11bdc99b8bf181b8c5**.

**No open identity movers remain** (only open PR is draft #61,
workflow-only) — **J39 signing is UNBLOCKED**: signs once, binding the
identity above. Steward session_01G5isfKZtdPDLYvDzzbst1H pinged with the
merged identity; owns refreshing the walkthrough digests against 65b6a6f.
Watch trigger for #67 cancelled.

**Still open for Jesse:** J39 sign-off; the supplement ruling (S1–S6 +
virgin-birth venue + row-20 shape) — blocks the v0.14.0 mint; the G10
size 167.9 MiB > 160 budget mint blocker.
