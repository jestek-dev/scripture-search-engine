# Galatians — Layer-3 tag-sweep ledger

**Book:** Galatians (6 chapters) · **Worker:** Pauline sweep, Galatians+Ephesians assignment · **Date:** 2026-08-26
**Repo:** scripture-search-engine @ `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (HEAD = origin/main; engine 0.14.0; 239 concept packs in `ontology/concepts/`).
**Legal tag vocabulary:** the 239 engine ids at e762d1c UNION the 161 adopted display ids (303 unique; CONVENTIONS §11.1). Every id in this ledger was validated mechanically against both lists (`grep -qx`).
**WEB provenance:** pinned ebible.org engwebp VPL, sha256-verified against `pipeline/manifests/web.json` (`b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c` — exact match; the pinned edition itself, not a current-edition fetch). Every quotation below is word-for-word from that text, from the chapter being tagged. Chapters GAL 1, 3, 5, 6 are additionally witnessed in `pipeline/fixtures/web-subset.json` (regenerated from the same sha256 at PR #53; agreement by construction).
**Inputs used:** book doc `/mnt/project-files/research/bible-rollout/galatians.md` (prior art, incl. its 2026-08-25 tag-application passes — Decisions 13–14); `ontology/concepts/*.yaml` pack files at e762d1c (lexicons, anchors, scope comments read directly); CONVENTIONS §3/§4/§5/§6/§9/§11 (verbatim extract); tag-gaps-review §1 (resolved) + §3 (declines) + Jesse's 2026-08-25 postscript; corpus-blocked roster (engine-pack-backlog.md, 50 rows, all re-verified STILL GATED post-#53); coverage plan §3/§5.2.
**Rules applied:** presence bar first, always; soft cap 6 / hard ceiling 8 per chapter; §11.6 yield order; no silent drops (every yield/judgment call gets a Decisions-record entry below); honest-and-empty preferred over a forced tag; no later-revelation read-backs; recorded declines re-considerable only with new textual evidence, cited; corpus-blocked matches ROUTED to the roster, not duplicated. This ledger is research/display-layer only — nothing here creates a concept pack, fixture, or engine change.

**Prior-art tag baseline (book doc as of 2026-08-26):** ch 1: `the-cross`, `pleasing-god-not-people`, `false-teachers`, `no-other-gospel` (4). ch 2: `justification-by-faith`, `grace-not-earned`, `identity-in-christ`, `the-cross`, `empty-worship` (5). ch 3: `justification-by-faith`, `faith`, `the-cross`, `covenant`, `blessing`, `identity-in-christ` (6). ch 4: `incarnation`, `identity-in-christ`, `covenant`, `adoption-as-gods-children`, `freedom-in-christ` (5). ch 5: `remembered-fruit-of-the-spirit`, `grace-not-earned`, `loving-others`, `justification-by-faith`, `freedom-in-christ`, `walking-by-the-spirit`, `false-teachers` (7). ch 6: `loving-others`, `pastoral-relapse-and-restoration`, `do-not-lose-heart`, `self-deception`, `the-cross`, `new-creation`, `sowing-and-reaping` (7).

---

## Galatians 1 — swept 2026-08-26

**1. Applied-tag deltas** (vs book doc; prior art 4 tags):
- KEEP `the-cross` — "who gave himself for our sins, that he might deliver us out of this present evil age" (1:4). Substitutionary self-giving stated in the salutation and load-bearing for the letter.
- KEEP `pleasing-god-not-people` — "For am I now seeking the favor of men, or of God? Or am I striving to please men? For if I were still pleasing men, I wouldn’t be a servant of Christ." (1:10).
- KEEP `false-teachers` (adopted id) — the letter's occasion: "there are some who trouble you and want to pervert the Good News of Christ" (1:7; occasion 1:6–9).
- KEEP `no-other-gospel` — the finality claim at its seat text: "even though we, or an angel from heaven, should preach to you any “good news” other than that which we preached to you, let him be cursed" (1:8; with 1:6–7, 1:9). Sits beside `false-teachers` per the §11.2 both-tags ruling (finality-of-message register vs deceiver register).
- ADD: none. DROP: none. (Honest-and-empty for adds — see Decisions G1-a/b/c.)

**2. Anchor-extension candidates:**
- `the-cross` — Galatians 1:4, quote "who gave himself for our sins, that he might deliver us out of this present evil age", proposed weight 0.6 (supporting; the pack's Galatians anchor 3:13 stays primary; "gave himself for our sins" is a searchable atonement phrasing not otherwise anchored in this letter's opening).

**3. Lexicon candidates:** none — `no-other-gospel` ("another gospel", "a different gospel", "even if an angel preaches") and `pleasing-god-not-people` ("people pleasing", "approval") already carry this chapter's query families.

**4. New-concept candidates:** none. (Paul's persecutor-to-preacher testimony, 1:13–24, considered and not proposed — see Decisions G1-c.)

**5. Decline-overturn proposals:** none.

**6. Ceiling/subdivision:** 4 tags; not subdivided in the book doc. No refinement flag.

## Galatians 2 — swept 2026-08-26

**1. Applied-tag deltas** (prior art 5 tags):
- KEEP `justification-by-faith` — "a man is not justified by the works of the law but through faith in Jesus Christ" (2:16).
- KEEP `grace-not-earned` — "I don’t reject the grace of God. For if righteousness is through the law, then Christ died for nothing!" (2:21; with 2:16).
- KEEP `identity-in-christ` — "I have been crucified with Christ, and it is no longer I who live, but Christ lives in me" (2:20).
- KEEP `the-cross` — "the Son of God, who loved me and gave himself up for me" (2:20; and Christ's death emptied of meaning if law could justify, 2:21).
- KEEP `empty-worship` (adopted id, hypocrisy register) — "I resisted him to his face, because he stood condemned" (2:11); "even Barnabas was carried away with their hypocrisy" (2:13). KEPT as a display tag per the book doc's 2026-08-25 application (the adopted id's broader religious-hypocrisy scope; the text's own word at 2:13 is "hypocrisy"). NOTE: the engine pack `empty-worship.yaml` carries a deliberate scope comment declining to ANCHOR Gal 2:11-14 (conduct inconsistency under peer pressure, not piety performed for show) — so no anchor extension is proposed here; display keep and engine non-anchor coexist, per that pack's own ruling.
- ADD `gentile-inclusion` (adopted id, §11.3) — the chapter's two scenes both turn on Gentile believers received without circumcision: "not even Titus, who was with me, being a Greek, was compelled to be circumcised" (2:3); Paul "entrusted with the Good News for the uncircumcised" and given "the right hand of fellowship, that we should go to the Gentiles" (2:7, 2:9); the Antioch rebuke — "why do you compel the Gentiles to live as the Jews do?" (2:14). Honest substantial presence: Gentiles-welcomed-without-the-law is the chapter's contested substance, not a passing mention. `nations-and-peoples` NOT co-applied — its origin-of-nations register is absent here (both-tags ruling checked, only one fits). Chapter lands at 6 tags (soft cap).
- DROP: none.

**2. Anchor-extension candidates:**
- `grace-not-earned` — Galatians 2:21, quote "I don’t reject the grace of God. For if righteousness is through the law, then Christ died for nothing!", proposed weight 0.75 (the pack has no Galatians anchor; this is the letter's sharpest grace-vs-works statement).
- `justification-by-faith` — Galatians 2:16 NOT proposed as new: the pack's own comment already records Gal 2:16 riding the re-pin ("Rom 3:28, Rom 4:5, Gal 2:16 … re-verified"). Noted only, so curation sees the sweep confirms it.

**3. Lexicon candidates:**
- `identity-in-christ` — "crucified with christ"; "no longer i who live but christ lives in me"; "dying to self" (2:19–20 is the source text; none of the three is in the pack's current lexicon).

**4. New-concept candidates:** none. Gentile-inclusion engine-side is corpus-blocked — ROUTE: corpus-blocked roster row 40 (`gentile-inclusion`, DEFERRED-to-re-pin; row already notes Gal 3:28 free/in-corpus). This chapter adds supporting evidence for that row's eventual pack: Gal 2:3, 2:7–9, 2:11–14 (2CO/GAL fixture corpus does not carry Gal 2 — noted for the re-pin curator).

**5. Decline-overturn proposals:** none.

**6. Ceiling/subdivision:** 6 tags (at soft cap, under ceiling). Subdivided in the book doc (2:1–10 / 2:11–21) — FLAG for the per-verse refinement pass.

## Galatians 3 — swept 2026-08-26

**1. Applied-tag deltas** (prior art 6 tags):
- KEEP `justification-by-faith` — "no man is justified by the law before God", for "The righteous will live by faith." (3:11); "the law has become our tutor to bring us to Christ, that we might be justified by faith" (3:24).
- KEEP `faith` — "Did you receive the Spirit by the works of the law, or by hearing of faith?" (3:2); Abraham "believed God, and it was counted to him for righteousness." (3:6, with 3:7–9).
- KEEP `the-cross` — "Christ redeemed us from the curse of the law, having become a curse for us" (3:13).
- KEEP `covenant` — "A covenant confirmed beforehand by God in Christ, the law, which came four hundred thirty years after, does not annul" (3:17; 3:15–18).
- KEEP `blessing` — "In you all the nations will be blessed." (3:8); "those who are of faith are blessed with the faithful Abraham" (3:9; 3:14).
- KEEP `identity-in-christ` — "you are all children of God, through faith in Christ Jesus" (3:26); "you are all one in Christ Jesus" (3:28; 3:26–29).
- ADD `gentile-inclusion` (adopted id, §11.3) — the argument's stated goal is the nations brought in by faith: "The Scripture, foreseeing that God would justify the Gentiles by faith, preached the Good News beforehand to Abraham" (3:8); "that the blessing of Abraham might come on the Gentiles through Christ Jesus" (3:14); "There is neither Jew nor Greek… for you are all one in Christ Jesus" (3:28). Honest substantial presence across the chapter's spine, distinct from `blessing`'s register (blessing received) — this is who is included and on what terms. `nations-and-peoples` NOT co-applied (origin-of-nations register absent; both-tags ruling checked). Chapter lands at 7 tags (within ceiling; each independently clears the bar).
- DROP: none.

**2. Anchor-extension candidates:**
- `identity-in-christ` — Galatians 3:26-28, quote "you are all children of God, through faith in Christ Jesus… There is neither Jew nor Greek, there is neither slave nor free man, there is neither male nor female; for you are all one in Christ Jesus.", proposed weight 0.8 (pack anchors Gal 2:20 but not the one-in-Christ declaration; "neither Jew nor Greek" queries have no anchor today).
- `faith` — Galatians 3:6-9, quote "Abraham “believed God, and it was counted to him for righteousness.”", proposed weight 0.7. CAUTION carried: the pack is deliberately leads-only with a G8 bare-"faith" churn caution in its comments; curation should weigh whether Romans 4:3 (in corpus) is the better home for the Abraham-faith family and take at most one.

**3. Lexicon candidates:**
- `identity-in-christ` — "neither jew nor greek"; "all one in christ"; "does god treat everyone the same".
- `faith` — "abraham believed god"; "counted to him for righteousness" (pair with the 3:6-9 anchor candidate above; single admission decision).

**4. New-concept candidates:** none. Routed instead:
- ROUTE corpus-blocked roster row 40 (`gentile-inclusion`): Gal 3:8, 3:14 join the row's already-noted free-and-in-corpus Gal 3:28 as the letter's in-argument evidence.
- ROUTE corpus-blocked roster row 26 (`inheritance`): "For if the inheritance is of the law, it is no more of promise" (3:18); "then you are Abraham’s offspring and heirs according to promise" (3:29) — NT in-Christ inheritance register, exactly the "different design to decide at re-pin" that row records. Not display-tagged here (see Decisions G3-d).

**5. Decline-overturn proposals:** none.

**6. Ceiling/subdivision:** 7 tags (under ceiling); not subdivided in the book doc. No refinement flag.

## Galatians 4 — swept 2026-08-26

**1. Applied-tag deltas** (prior art 5 tags):
- KEEP `incarnation` — "when the fullness of the time came, God sent out his Son, born to a woman, born under the law" (4:4).
- KEEP `identity-in-christ` — "So you are no longer a bondservant, but a son; and if a son, then an heir of God through Christ." (4:7; 4:5–7).
- KEEP `covenant` — the Hagar–Sarah allegory: "these are two covenants" (4:24; 4:21–31).
- KEEP `adoption-as-gods-children` — "that he might redeem those who were under the law, that we might receive the adoption as children" (4:5); "God sent out the Spirit of his Son into your hearts, crying, “Abba, Father!”" (4:6).
- KEEP `freedom-in-christ` (adopted id) — the allegory's verdict: "we are not children of a servant, but of the free woman" (4:31; 4:22–31).
- ADD: none. DROP: none. (Honest-and-empty for adds — see Decisions G4-a/b/c.)

**2. Anchor-extension candidates:**
- `incarnation` — Galatians 4:4-5, quote "when the fullness of the time came, God sent out his Son, born to a woman, born under the law, that he might redeem those who were under the law", proposed weight 0.85 (the pack anchors John 1:14, John 1:1, Col 1:15-19 only; this is the sending-birth-purpose statement and its Pauline keystone).

**3. Lexicon candidates:**
- `incarnation` — "in the fullness of time"; "born of a woman born under the law" (4:4's own phrasing; neither in the pack's four-entry lexicon; check the tokenizer widths at curation).

**4. New-concept candidates:** none. Routed instead:
- ROUTE corpus-blocked roster row 26 (`inheritance`): the heir-under-guardians frame (4:1–2 "so long as the heir is a child, he is no different from a bondservant"; 4:7 "an heir of God through Christ"; 4:30 "will not inherit") — further NT in-Christ register evidence for that row's re-pin design. Not display-tagged (Decisions G4-a).

**5. Decline-overturn proposals:** none.

**6. Ceiling/subdivision:** 5 tags; subdivided in the book doc (4:1–7 / 4:8–20 / 4:21–31) — FLAG for the per-verse refinement pass.

## Galatians 5 — swept 2026-08-26

**1. Applied-tag deltas** (prior art 7 tags):
- KEEP `remembered-fruit-of-the-spirit` — the source passage itself: "the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith, gentleness, and self-control" (5:22–23).
- KEEP `grace-not-earned` — "You are alienated from Christ, you who desire to be justified by the law. You have fallen away from grace." (5:4).
- KEEP `loving-others` — "through love be servants to one another" (5:13); the whole law fulfilled in "You shall love your neighbor as yourself." (5:14).
- KEEP `justification-by-faith` — against those who "desire to be justified by the law" (5:4), "we through the Spirit, by faith wait for the hope of righteousness" (5:5).
- KEEP `freedom-in-christ` (adopted id) — "Stand firm therefore in the liberty by which Christ has made us free, and don’t be entangled again with a yoke of bondage." (5:1; 5:13).
- KEEP `walking-by-the-spirit` — "walk by the Spirit, and you won’t fulfill the lust of the flesh" (5:16; 5:16–18, 5:22–25).
- KEEP `false-teachers` (adopted id) — "Who interfered with you that you should not obey the truth?" (5:7); "A little yeast grows through the whole lump." (5:9); "he who troubles you will bear his judgment, whoever he is" (5:10; 5:7–12).
- ADD `legalism` (adopted id) — the chapter's opening charge IS the anti-legalism teaching, named as such by no sitting tag: "if you receive circumcision, Christ will profit you nothing" (5:2); every man who receives circumcision "is a debtor to do the whole law" (5:3); "You are alienated from Christ, you who desire to be justified by the law" (5:4); "in Christ Jesus neither circumcision nor uncircumcision amounts to anything, but faith working through love" (5:6). Honest substantial presence: 5:1–12 is sustained law-keeping-for-righteousness teaching. Register distinction from the two sitting doctrinal tags recorded in Decisions G5-a (they name the positive doctrine; `legalism` names the searched failure mode, and "legalism" queries have no other home in the 303-id vocabulary). Chapter lands at 8 tags — HARD CEILING.
- DROP: none.

**2. Anchor-extension candidates:**
- `grace-not-earned` — Galatians 5:4, quote "You are alienated from Christ, you who desire to be justified by the law. You have fallen away from grace.", proposed weight 0.8 (no Galatians anchor in the pack; the "fallen from grace" query family has no anchor anywhere today).
- `pastoral-freedom-from-bondage` — no action: the pack already anchors Gal 5:1 and 5:13 (noted so curation does not double-add; the display-tag removal of 2026-08-23, Decisions 5 in the book doc, stands untouched — register ruling, not an anchor question).

**3. Lexicon candidates:**
- `grace-not-earned` — "fallen from grace"; "can you fall from grace"; "what does fallen from grace mean" (pair with the 5:4 anchor candidate).
- `walking-by-the-spirit` — "flesh vs spirit"; "works of the flesh"; "deeds of the flesh list" (5:16–23 contrast; the pack's five entries are all walk/led/life phrasings — the flesh-side queries reach nothing today).
- `freedom-in-christ` (adopted; display-only until a pack passes the gauntlet) — "freedom in christ"; "christian liberty"; "yoke of bondage" — carried for the eventual pack, per the book doc's motif 8.

**4. New-concept candidates:** none. Routed instead:
- ROUTE corpus-blocked roster row 43 (`legalism`, SKIPPED-blocked, Col 2:16-23 absent): Galatians 5:1–12 (esp. 5:2–4, 5:6) is the strongest Pauline evidence set for that row's eventual pack, and Gal 5 IS in the fixture corpus (GAL 5 witnessed in web-subset.json) — noted for the re-pin curator alongside the row's flagged grace-not-earned extension route. The display-tag ADD above is the §11.1 display layer only; engine-side this find rides row 43, not a new candidate.

**5. Decline-overturn proposals:** none.

**6. Ceiling/subdivision:** 8 tags — HITS THE HARD CEILING; also subdivided in the book doc (5:1–15 / 5:16–26). FLAG for the per-verse refinement pass on both grounds.

## Galatians 6 — swept 2026-08-26

**1. Applied-tag deltas** (prior art 7 tags):
- KEEP `loving-others` — "Bear one another’s burdens, and so fulfill the law of Christ." (6:2); "let’s do what is good toward all men" (6:10).
- KEEP `pastoral-relapse-and-restoration` — "if a man is caught in some fault, you who are spiritual must restore such a one in a spirit of gentleness" (6:1). (Book doc Decisions 6's register ruling stands.)
- KEEP `do-not-lose-heart` — "Let’s not be weary in doing good, for we will reap in due season if we don’t give up." (6:9).
- KEEP `self-deception` — "For if a man thinks himself to be something when he is nothing, he deceives himself." (6:3); "Don’t be deceived. God is not mocked" (6:7).
- KEEP `the-cross` — "But far be it from me to boast except in the cross of our Lord Jesus Christ" (6:14).
- KEEP `new-creation` — "neither is circumcision anything, nor uncircumcision, but a new creation" (6:15).
- KEEP `sowing-and-reaping` (adopted id) — "Don’t be deceived. God is not mocked, for whatever a man sows, that he will also reap." (6:7); flesh reaps corruption, Spirit reaps eternal life, "we will reap in due season if we don’t give up" (6:8–9). (Worded to the moral/spiritual principle; no prosperity framing — §6 guardrail held.)
- ADD: none. DROP: none. (Considered-and-declined adds in Decisions G6-a..e.)

**2. Anchor-extension candidates:**
- `the-cross` — Galatians 6:14, quote "But far be it from me to boast except in the cross of our Lord Jesus Christ, through which the world has been crucified to me, and I to the world.", proposed weight 0.7 ("boast in the cross" phrasing unanchored in the pack).
- `loving-others` — Galatians 6:2, quote "Bear one another’s burdens, and so fulfill the law of Christ.", proposed weight 0.75 (the pack anchors Gal 5:14 but not the burden-bearing command; pair with the lexicon candidate below).
- `supporting-gospel-workers` — Galatians 6:6, quote "let him who is taught in the word share all good things with him who teaches", proposed weight 0.7 (the pack's three anchors are 1CO/PHP/1TI; this is the letter's teacher-support command — too thin for a display tag, right-sized as an anchor).

**3. Lexicon candidates:**
- `loving-others` — "bear one anothers burdens"; "carry each others burdens"; "the law of christ".
- `pastoral-relapse-and-restoration` — "how to restore someone caught in sin"; "restore gently"; "helping a friend who fell back into sin" (the pack's eight entries are all first-person faller phrasings; 6:1 is addressed to the restorers and that side of the query family reaches nothing today).
- `sowing-and-reaping` (adopted; display-only until a pack passes the gauntlet) — "you reap what you sow"; "god is not mocked"; "sowing and reaping" — carried for the eventual pack.

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**6. Ceiling/subdivision:** 7 tags (under ceiling); subdivided in the book doc (6:1–10 / 6:11–18) — FLAG for the per-verse refinement pass.

---

## Decisions record — Galatians sweep (every yield/judgment call; all reversible delegated defaults)

- **G1-a. `grace-not-earned` still NOT added to ch 1.** Book doc Decisions 9's ground re-checked against the pinned text and stands: 1:6 ("called you in the grace of Christ") and 1:15 name grace without the grace-vs-works teaching substance, which lands in chs 2 and 5 (tagged there). Presence bar not met.
- **G1-b. `zeal-for-god` (adopted) NOT added to ch 1.** 1:14 ("more exceedingly zealous for the traditions of my fathers") is misdirected zeal — the same wrong-register class the corpus-blocked roster row 36 already records for Rom 10:2. Declined; nothing routed (the row's Phinehas register gains no evidence here).
- **G1-c. Persecutor-to-preacher testimony (1:13–24) not proposed as a new concept.** "He who once persecuted us now preaches the faith that he once tried to destroy." (1:23) is a real changed-life-testimony motif, but no measured gap distinct from `new-creation` / `witness-testimony` registers is demonstrable from this chapter, and the theme's defining text (Acts 9) is outside this sweep. Not logged; recorded here so the consideration is visible.
- **G1-d. `persecuted-for-gods-word` (adopted) NOT added to ch 1** — 1:13, 1:23 report persecution biographically; the chapter does not teach the being-persecuted register. Presence bar not met.
- **G2-a. `gentile-inclusion` ADDED to ch 2** (see chapter block) — §11.3 adoption applied where it genuinely applies; `nations-and-peoples` checked under the both-tags ruling and not co-applied (register absent). Engine-side routed to corpus-blocked row 40, not duplicated.
- **G2-b. `empty-worship` display keep vs engine non-anchor.** Recorded explicitly: the pack's scope comment (Gal 2:11-14 NOT anchored — conduct inconsistency, not piety-for-show) is an engine-anchor ruling; the display tag was applied 2026-08-25 under the adopted id's broader hypocrisy scope and is KEPT. No anchor extension proposed; no contradiction created.
- **G2-c. `unity-of-the-church` NOT added to ch 2.** The Antioch breach touches table-fellowship division, but the chapter's teaching substance is justification and the truth of the Good News (2:5, 2:14), not church-unity teaching. Presence bar not met.
- **G2-d. `truth` (adopted) NOT added to ch 2.** "the truth of the Good News" (2:5, 2:14) is gospel-fidelity usage, not the what-is-truth register the adopted row carries (corpus-blocked row 42). Declined.
- **G3-a. `gentile-inclusion` ADDED to ch 3** (see chapter block); ch 3 lands at 7 — the sweep judged all 7 independently over the bar; if Jesse trims to the soft cap, this sweep's yield-order recommendation is `blessing` first (its 3:8–9 substance is the most fully duplicated by `gentile-inclusion` + `covenant` together; §11.6 broad-duplicating-specific class). No drop performed.
- **G3-b. `baptism` still NOT added to ch 3.** Book doc Decisions 3 re-checked: 3:27 ("as many of you as were baptized into Christ have put on Christ") remains a thin single verse in service of the sonship argument (§11.6 first-yield class even at the new ceiling); the pack already anchors Gal 3:27, so search coverage does not depend on the display tag. Stands.
- **G3-c. `holy-spirit` NOT added to ch 3.** The Spirit's reception (3:2, 3:5, 3:14) is the argument's evidence, instrumental to justification-by-faith rather than Spirit teaching substance; `walking-by-the-spirit` carries the letter's Spirit-life teaching on ch 5. Presence bar not met.
- **G3-d. `inheritance` (adopted) NOT display-tagged on ch 3 or ch 4.** 3:18, 3:29, 4:1–7, 4:30 are the NT in-Christ inheritance register whose design corpus-blocked row 26 explicitly defers to the re-pin; display-tagging would duplicate the sonship-heirship substance `identity-in-christ` and `adoption-as-gods-children` already carry on these chapters (§11.6 broad-duplicating-specific). Refs routed to row 26 instead (chapter blocks 3.4 and 4.4).
- **G3-e. `mediator` (adopted) NOT added to ch 3.** "It was ordained through angels by the hand of a mediator." / "Now a mediator is not between one, but God is one." (3:19–20) names the law's mediator in an argument about the law's inferiority to promise — not the Christ-as-mediator / umpire-longing register the adopted row and corpus-blocked row 24 record. Declined; not routed (no evidence gained for that row's register).
- **G3-f. `legalism` NOT added to chs 2–3.** The works-of-law material there (2:16, 3:10–12) is carried by `justification-by-faith` + `grace-not-earned` in the argument's own positive terms; the failure-mode register is tagged once, at its most sustained teaching (5:1–12). Density discipline, not a presence denial.
- **G4-a. See G3-d** (`inheritance` on ch 4).
- **G4-b. `waiting-for-a-child` NOT added to ch 4.** 4:27 ("Rejoice, you barren who don’t bear") is Isaiah 54:1 quoted allegorically for the Jerusalem above — not infertility teaching; tagging it would misserve that pastoral pack's queries. Presence bar not met.
- **G4-c. `persecuted-for-gods-word` (adopted) NOT added to ch 4** — 4:29 is a single-verse typological note ("he who was born according to the flesh persecuted him who was born according to the Spirit"). Thin single-verse class.
- **G5-a. `legalism` ADDED to ch 5, taking the chapter to the 8-tag hard ceiling.** Every sitting tag independently clears the bar (verified quote-by-quote above), and "legalism" queries have no other home among the 303 ids. Overlap note for any future trim: `legalism`, `grace-not-earned`, and `justification-by-faith` all cite 5:4; if Jesse wants the chapter back under the soft cap, this sweep's yield-order recommendation is `justification-by-faith` first on THIS chapter only (its defining texts sit in chs 2–3, which keep it; §11.6 broad-duplicating-specific as applied to ch 5's material) — recorded as a recommendation, NOT performed; no drop was made.
- **G5-b. Vice-list ids NOT added to ch 5** — `idolatry`, `drunkenness`, `pastoral-sexual-purity`, `occult-and-divination` ("sorcery"), `envy-and-jealousy`, `self-control`: each appears in 5:19–23 as a list item (or in 5:26's closing charge), not as the chapter's teaching substance; the list is carried whole by `walking-by-the-spirit` + `remembered-fruit-of-the-spirit`. (`envy-and-jealousy` already anchors Gal 5:19-21 engine-side — search coverage does not depend on a display tag.)
- **G5-c. `sin` NOT added to ch 5 or ch 6.** The pack anchors Gal 6:7-8 engine-side; as a display tag it would duplicate `sowing-and-reaping`'s specific carriage of the same verses (§11.6 broad-duplicating-specific).
- **G6-a. `supporting-gospel-workers` NOT display-tagged on ch 6** — 6:6 is a thin single verse; carried as an anchor-extension candidate instead (chapter block 2), which is where its search value lives.
- **G6-b. `benediction` still NOT added to ch 6.** Book doc Decisions 4 stands: 6:18 is a genuine but one-verse epistolary formula; tagging every closing grace would make the concept noise.
- **G6-c. `eternal-life` (adopted) NOT added to ch 6** — "he who sows to the Spirit will from the Spirit reap eternal life" (6:8) is one clause inside the sowing teaching; carried by `sowing-and-reaping`. Thin single-verse class.
- **G6-d. `humble-exaltation` NOT added to ch 6** — 6:3–4 (self-examination) and 6:14 (boasting only in the cross) touch pride/boasting, but the pack's God-exalts-the-humble register is absent. Presence bar not met.
- **G6-e. `gentleness-of-christ` (adopted) NOT added to ch 6** — "a spirit of gentleness" (6:1) is the restorer's required temper, one phrase; the adopted id's register is Christ's own gentleness. Presence bar not met.
- **Sweep-wide: no drops.** Every prior-art tag re-verified against the pinned text and kept; zero silent changes.
- **Sweep-wide: id-spelling finding.** The briefing's concepts-inventory.md table lists the 14 pastoral packs WITHOUT their `pastoral-` prefix (e.g. `relapse-and-restoration`, `sexual-purity`); the actual engine ids at e762d1c carry the prefix (`pastoral-relapse-and-restoration`, `pastoral-sexual-purity` — verified in engine-ids.txt and ontology/concepts/). This ledger uses the true prefixed ids everywhere, per CONVENTIONS §5's never-strip-a-prefix rule. Flagged for the briefing maintainer.

## Survival audit — Galatians ledger (CONVENTIONS §9)

All eight appends to this file (header, chapters 1–6, this closing block) were made as atomic end-of-file appends; after each, the file was re-read and the pre-existing bytes verified unchanged (sha256 of the prior length re-computed and matched) and the new block verified present. Final check at this delivery: header + 6 chapter blocks + Decisions record all present exactly once; no other file under /mnt/project-files was touched by this worker for Galatians. Ledger complete: 6/6 chapters swept.

---

## Erratum — fresh-critic pass, 2026-08-26 (CONVENTIONS §9 append; no in-place edits)

**Source:** fresh-critic verification pass of this ledger, 2026-08-26. The critic verified quotes, ids, deltas, caps, presence bar, schema, and neutrality clean and sustained one minor note: the delivery-reported candidate totals counted inconsistently (rows vs distinct ids conflated). No content in this ledger changes; this block is a counting clarification only. Recounted directly against the chapter blocks above:

- **Lexicon candidates: 10 rows across 9 distinct ids.** Rows per chapter: ch 1: 0; ch 2: 1; ch 3: 2; ch 4: 1; ch 5: 3; ch 6: 3. `identity-in-christ` appears in both the ch-2 and ch-3 rows (the one repeated id); the other eight ids — `faith`, `incarnation`, `grace-not-earned`, `walking-by-the-spirit`, `freedom-in-christ`, `loving-others`, `pastoral-relapse-and-restoration`, `sowing-and-reaping` — appear once each.
- **Anchor-extension candidates: 9 proposal rows across 7 distinct ids.** Rows per chapter: ch 1: 1; ch 2: 1; ch 3: 2; ch 4: 1; ch 5: 1; ch 6: 3. `the-cross` (chs 1 and 6) and `grace-not-earned` (chs 2 and 5) each carry two rows; `identity-in-christ`, `faith`, `incarnation`, `loving-others`, `supporting-gospel-workers` one each. "No action" / "noted only" entries (`justification-by-faith` Gal 2:16, `pastoral-freedom-from-bondage` Gal 5:1/5:13) are not proposal rows and are not counted.

Future consumers of this ledger should quote BOTH figures — row count and distinct-id count — for each candidate class; neither substitutes for the other.

**Corrected totals (Galatians):** no content changes — every delta, candidate, route, and decision above stands as written. Lexicon candidates: 10 rows / 9 distinct ids. Anchor-extension candidates: 9 rows / 7 distinct ids. Counting clarification only.

**§9 audit for this erratum:** written as ONE atomic end-of-file append. Pre-append state recorded: 30,026 bytes, sha256 `fb191b47320a93b8f6760d36c109abeb56af3a9d414548963bc5a5115f43dbaa`. Post-write, the file was re-read, the first 30,026 bytes re-hashed and verified identical, and this block verified present exactly once.
