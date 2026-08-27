# 1 Thessalonians — Layer-3 tag-sweep ledger

**Book:** 1 Thessalonians (5 chapters, 89 verses; VPL code `1TH`)
**Repo SHA:** `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (origin/main, engine 0.14.0, 239 concept packs)
**Date:** 2026-08-26
**Sweep worker:** Pauline-epistles group (1–2 Thessalonians assignment)
**Inputs used:** book doc `/mnt/project-files/research/bible-rollout/1-thessalonians.md` (prior art — 28 existing tag instances); full 239-id engine library (`ontology/concepts/` at the SHA above, packs read directly); 161-id adopted display list (union vocabulary 303 ids); `tag-gaps-review.md` §1 contested calls (resolved by CONVENTIONS §11) and §3 declines; corpus-blocked 50-row roster (`engine-pack-backlog.md`); CONVENTIONS §3/§4/§5/§6/§9/§11.
**WEB provenance, honestly stated:** every quotation below was checked word-for-word against the repo-pinned ebible.org engwebp VPL snapshot (sha256 `b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c`, verified against `pipeline/manifests/web.json` — the pinned edition itself, not a current-edition fetch). Chapters 4–5 are additionally witnessed in `pipeline/fixtures/web-subset.json` (regenerated from this same sha256 at PR #53, so fixture and VPL agree by construction); chapters 1–3 have no fixture witnesses and rest on the pinned VPL alone.
**Tag-id validation:** every id in this ledger was mechanically checked against `engine-ids.txt` (239) ∪ `adopted-161.txt` (161); ids marked *(adopted, display-only)* have no engine pack yet.

Existing Thessalonians anchors in the engine at this SHA (so extension candidates below are non-duplicates): 1 Th 1:4 (election-and-predestination); 2:4 (pleasing-god-not-people); 4:3, 4:7, 5:23 (holiness); 4:3-5 (pastoral-sexual-purity); 4:11-12 (work-and-diligence); 4:13-14 (pastoral-grief-and-loss, resurrection-of-the-dead, caring-for-aging-parents); 4:16-17 (caught-up-together, second-coming); 4:18 + 5:14 (comforting-others); 5:1-3 (day-of-the-lord); 5:2 (second-coming); 5:6-8 (drunkenness); 5:9-10 (pastoral-serious-illness); 5:11 (gathering-together); 5:12-13 (leadership); 5:15 (vengeance); 5:16-18 (prayer); 5:18 (thanksgiving); 5:20-21 (false-prophets); 5:23-24 (benediction); 5:24 (gods-faithfulness).

---

## 1 Thessalonians 1

**Applied-tag deltas** (book doc carries 6; all re-verified against the pinned WEB text):
- KEEP `thanksgiving` — sustained opening gratitude, not a passing formula: "We always give thanks to God for all of you, mentioning you in our prayers" (1:2), carried through 1:2–4.
- KEEP `repentance` — the conversion described as a turning: "you turned to God from idols to serve a living and true God" (1:9).
- KEEP `sharing-your-faith` — "from you the word of the Lord has been declared, not only in Macedonia and Achaia, but also in every place your faith toward God has gone out" (1:8).
- KEEP `second-coming` — the converted life waits "for his Son from heaven, whom he raised from the dead: Jesus, who delivers us from the wrath to come" (1:10).
- KEEP `discipleship` — "You became imitators of us and of the Lord" (1:6), and in turn "an example to all who believe in Macedonia and in Achaia" (1:7).
- KEEP `election-and-predestination` — "brothers loved by God, that you are chosen" (1:4), known from the Good News arriving "in power, and in the Holy Spirit and with much assurance" (1:5). The pack's own 1:4 anchor and §4-neutral gist govern; stated as the text's ground for thanks, nothing adjudicated.
- No adds, no drops. `faith` stays off per the book doc's recorded near-miss (Decisions 9 there): the chapter reports their faith but teaches no faith doctrine — re-checked, decline stands. `holy-spirit` considered (1:5, 6): two mentions in passing, not the concept's teaching substance — declined.

**Anchor-extension candidates:**
- `repentance` — 1 Thessalonians 1:9, "you turned to God from idols to serve a living and true God" — the NT's compact turn-from/turn-to conversion statement; proposed weight 0.7.
- `second-coming` — 1 Thessalonians 1:10, "to wait for his Son from heaven, whom he raised from the dead: Jesus, who delivers us from the wrath to come" — the waiting posture; proposed weight 0.5.
- `sharing-your-faith` — 1 Thessalonians 1:8, "from you the word of the Lord has been declared, not only in Macedonia and Achaia, but also in every place your faith toward God has gone out" — witness by reputation and rung-out word; proposed weight 0.5.
- `thanksgiving` — 1 Thessalonians 1:2-3, "We always give thanks to God for all of you, mentioning you in our prayers" — thanking God for people (a register the pack's 5:18 anchor does not carry); proposed weight 0.4.

**Lexicon candidates:**
- `repentance` — "turning from idols"; "turned to god from idols"; "serve the living and true god".

**New-concept candidates:** none — every honest theme has a vocabulary home (checked against the 303-id union and the declines).

**Decline-overturn proposals:** none.

**Ceiling/subdivision marker:** no — 6 tags (at the soft cap, under the ceiling); chapter not subdivided in the book doc.

---

## 1 Thessalonians 2

**Applied-tag deltas** (book doc carries 3):
- KEEP `pleasing-god-not-people` — "not as pleasing men, but God, who tests our hearts" (2:4), with flattery, covetousness, and glory-seeking expressly disclaimed (2:5–6). The pack already anchors 2:4.
- KEEP `suffering-for-christ` — both sides of the pattern: Paul "having suffered before and been shamefully treated" at Philippi preached "in much conflict" (2:2), and the Thessalonians "suffered the same things from your own countrymen" as the Judean assemblies (2:14).
- KEEP `discipleship` — the mentoring manner lived out: "we were gentle among you, like a nursing mother cherishes her own children" (2:7), exhorting "as a father does his own children" (2:11), a congregation become "imitators of the assemblies of God which are in Judea" (2:14).
- ADD `sharing-your-faith` — the chapter is a sustained portrait of how the gospel was actually shared, the passage an evangelism query honestly lands on: "we grew bold in our God to tell you the Good News of God in much conflict" (2:2); "we were well pleased to impart to you not the Good News of God only, but also our own souls" (2:8); "working night and day, that we might not burden any of you, we preached to you the Good News of God" (2:9). Substance, not mention: manner (2:3–6), affection (2:7–8), cost (2:9), aim (2:12). Chapter moves 3 → 4 tags, within the soft cap.
- No drops.

**Anchor-extension candidates:**
- `boldness-in-witness` — 1 Thessalonians 2:2, "we grew bold in our God to tell you the Good News of God in much conflict" — boldness to share the faith after mistreatment; proposed weight 0.6.
- `power-of-gods-word` — 1 Thessalonians 2:13, "you accepted it not as the word of men, but as it is in truth, God’s word, which also works in you who believe" — proposed weight 0.5, with a register note: the pack's existing anchors carry the permanence register (word stands forever / will not return void); 2:13 is the word's efficacy in believers. If curation judges the pack permanence-scoped, this ref re-homes to `studying-the-word` instead (either/or, not both).
- `suffering-for-christ` — 1 Thessalonians 2:14-16, "you also suffered the same things from your own countrymen" (2:14) — persecution of a congregation by its own people; proposed weight 0.5.
- `resisting-the-devil` — 1 Thessalonians 2:18, "but Satan hindered us" — Satan obstructing gospel work (the pack's lexicon already carries bare "satan"); proposed weight 0.4.

**Lexicon candidates:**
- `resisting-the-devil` — "satan hindered paul"; "can satan block gods plans"; "the tempter".
- `power-of-gods-word` — "gods word at work in you"; "receiving the bible as gods word" (contingent on the register note above).

**New-concept candidates:** none.

**Decline-overturn proposals:** none.

**Ceiling/subdivision marker:** no — 4 tags; not subdivided in the book doc.

---

## 1 Thessalonians 3

**Applied-tag deltas** (book doc carries 3):
- KEEP `suffering-for-christ` — affliction named as the believer's appointed path: "we are appointed to this task" (3:3); "we told you beforehand that we are to suffer affliction, even as it happened" (3:4).
- KEEP `prayer` — "night and day praying exceedingly that we may see your face" (3:10), and the chapter closes as prayer (3:11–13).
- KEEP `loving-others` — the prayer's center: "increase and abound in love toward one another and toward all men" (3:12).
- No adds, no drops. Considered and declined (Decisions record below): `comforting-others` (3:2, 7 — narrated comfort between Paul and the congregation, not the one-another comfort teaching the pack serves; the letter's teaching texts for that register are 4:18 and 5:11, 14, already tagged there); `temptation` (3:5, "for fear that by any means the tempter had tempted you" — a single narrative clause, no temptation teaching); `do-not-lose-heart` (3:3, "that no one would be moved by these afflictions" — thin single-verse beside the kept `suffering-for-christ`).

**Anchor-extension candidates:**
- `suffering-for-christ` — 1 Thessalonians 3:3-4, "we are appointed to this task" … "we told you beforehand that we are to suffer affliction, even as it happened" — the why-do-christians-suffer teaching statement; proposed weight 0.6.
- `loving-others` — 1 Thessalonians 3:12, "May the Lord make you to increase and abound in love toward one another and toward all men" — proposed weight 0.5.

**Lexicon candidates:** none — honest-and-empty; the chapter's phrasings are already served by the packs above.

**New-concept candidates:** none.

**Decline-overturn proposals:** none.

**Ceiling/subdivision marker:** no — 3 tags; not subdivided in the book doc.

---

## 1 Thessalonians 4

**Applied-tag deltas** (book doc carries 8 — the hard ceiling; every one re-verified and kept):
- KEEP `caught-up-together` — the concept's source text: "will be caught up together with them in the clouds to meet the Lord in the air" (4:17).
- KEEP `second-coming` — "the coming of the Lord" (4:15): "For the Lord himself will descend from heaven with a shout, with the voice of the archangel and with God’s trumpet" (4:16).
- KEEP `pastoral-grief-and-loss` — written into real bereavement: "so that you don’t grieve like the rest, who have no hope" (4:13); "Therefore comfort one another with these words." (4:18).
- KEEP `holiness` — "For this is the will of God: your sanctification" (4:3); "For God called us not for uncleanness, but in sanctification" (4:7).
- KEEP `pastoral-sexual-purity` — "abstain from sexual immorality" (4:3), each one knowing how to "control his own body in sanctification and honor" (4:4).
- KEEP `work-and-diligence` — "lead a quiet life, and to do your own business, and to work with your own hands" (4:11).
- KEEP `comforting-others` — the section's own charge: "Therefore comfort one another with these words." (4:18).
- KEEP `resurrection-of-the-dead` — "For if we believe that Jesus died and rose again, even so God will bring with him those who have fallen asleep in Jesus." (4:14), grief-with-hope grounded in resurrection (4:13–14; the map's cross-edge leaves vv. 15–17 to `caught-up-together`/`second-coming`).
- ADD-CANDIDATE YIELDED: `death-of-a-believer` *(adopted, display-only)* — 4:13–18 is a defining text for the register ("concerning those who have fallen asleep", 4:13; "those who have fallen asleep in Jesus", 4:14) and clears the presence bar; but the chapter stands at the 8-tag hard ceiling and the candidate's substance is already jointly carried by `pastoral-grief-and-loss` + `resurrection-of-the-dead` + `caught-up-together` (broad-duplicating-specific — first to yield under §11.6, and no existing tag is an honest yield ahead of it). Not applied; routed to the per-verse refinement pass and recorded in the Decisions record.
- No drops. Prior yields re-affirmed: `loving-others` (4:9–10) and `resurrection` (4:14, 16) remain off under the ceiling (book doc Decisions 3) — see anchor extensions for where that material survives.

**Anchor-extension candidates:**
- `loving-others` — 1 Thessalonians 4:9-10, "For you yourselves are taught by God to love one another" (4:9) — the taught-by-God brotherly-love statement (the ceiling-yielded tag surviving as an exact-range anchor); proposed weight 0.6.
- `resurrection-of-the-dead` — 1 Thessalonians 4:16, "The dead in Christ will rise first" — the resurrection-order clause itself; proposed weight 0.7, with a boundary note: `caught-up-together` and `second-coming` own 4:16-17's descent/catching-up register (existing anchors); this claims only the dead-raised clause. Curator decides whether to extend the pack's existing 4:13-14 anchor to 4:13-16 or add 4:16 alone.
- `death-of-a-believer` *(adopted, display-only — pack-mint note, not an extension)*: if this id is ever packed, 1 Thessalonians 4:13-18 is a natural keystone and IS in the fixture corpus (1 Th 4 witnessed in `web-subset.json`), so it is assertable now — unlike most adopted-id home texts. Not corpus-blocked; dedupe check run: not in the 50-row roster, no engine pack, no decline on record.

**Lexicon candidates:**
- `caught-up-together` — "meet the lord in the air"; "the dead in christ will rise first"; "what is the rapture in the bible".
- `pastoral-grief-and-loss` — "asleep in jesus"; "what happens to christians who die"; "will i see my loved one again" (note: if `death-of-a-believer` is ever packed, these three phrasings belong to it — record the routing decision once, not twice).

**New-concept candidates:** none beyond the `death-of-a-believer` pack-mint note above (already-adopted id, so not a new mint).

**Decline-overturn proposals:** none.

**Ceiling/subdivision marker:** YES — 8 tags (hard ceiling) AND subdivided in the book doc (4:1–12 / 4:13–18). Flagged for the per-verse refinement pass; the yielded `death-of-a-believer` and the 4:16 boundary question ride that pass.

---

## 1 Thessalonians 5

**Applied-tag deltas** (book doc carries 8 — the hard ceiling; every one re-verified and kept):
- KEEP `second-coming` — "the day of the Lord comes like a thief in the night" (5:2; the pack's own lexicon phrase), believers kept awake and sober for it (5:4–6).
- KEEP `walking-in-the-light` — "You are all children of light and children of the day." (5:5), with conduct to match: "let’s watch and be sober" (5:6).
- KEEP `prayer` — "Pray without ceasing." (5:17); "Brothers, pray for us." (5:25).
- KEEP `thanksgiving` — "In everything give thanks, for this is the will of God in Christ Jesus toward you." (5:18).
- KEEP `gods-faithfulness` — "He who calls you is faithful, who will also do it." (5:24).
- KEEP `benediction` — "May the God of peace himself sanctify you completely." (5:23); "The grace of our Lord Jesus Christ be with you. Amen." (5:28). (PR #43 id, ratified by Jesse 2026-08-25.)
- KEEP `leadership` — "know those who labor among you, and are over you in the Lord" (5:12), "respect and honor them in love for their work’s sake" (5:13).
- KEEP `comforting-others` — "exhort one another, and build each other up" (5:11); "encourage the faint-hearted; support the weak" (5:14).
- CONTINGENT ADD (not applied): `day-of-the-lord` — 5:1–3 is the engine pack's own weight-1.0 keystone anchor ("the day of the Lord comes like a thief in the night", 5:2, with the suddenness teaching of 5:1–3), and under the §11.2 both-tags ruling it could genuinely sit beside `second-coming`. Not applied for three stacked reasons: (a) the chapter is at the 8-tag hard ceiling and no existing tag is an honest yield ahead of it under §11.6; (b) the recorded routing (book doc Decisions 9 / tag-apply log line 1383: "The chapter's tag home remains `second-coming` — only this ref joins the row") stands as a reversible default, and the only thing new since is vocabulary state (the pack was minted 2026-08-26 with 5:1-3 as its top anchor), not new textual evidence; (c) the `end-times` ↔ `day-of-the-lord` scope/merge question is an open Jesse question (corpus-blocked roster row 5 / flagged-items list) — this add is end-times-adjacent and is flagged CONTINGENT on that ruling rather than decided here. Routed to the per-verse refinement pass + Jesse's scope ruling; Decisions record entry below.
- No drops. Prior yields and declines re-affirmed against the pinned text: `joy-in-the-lord` (5:16 "Always rejoice." — verbatim command but a two-word item in a rapid list; still the first candidate to add back if a slot opens); `vengeance` (5:15 "See that no one returns evil for evil to anyone" — single command-list verse; the pack already anchors 5:15, so nothing is lost); `drunkenness` (5:7 — night/sobriety contrast, not drunkenness teaching; the pack already anchors 5:6-8 for its watchfulness edge); `false-prophets` (5:20–21 "Test all things, and hold firmly that which is good." — the §3.5 near-covered decline stands; the pack already anchors 5:20-21); `holiness` on this chapter (5:23 is a single benediction verse here; the teaching text is ch. 4, where it is tagged; the pack already anchors 5:23).

**Anchor-extension candidates:**
- `salvation` — 1 Thessalonians 5:9-10, "For God didn’t appoint us to wrath, but to the obtaining of salvation through our Lord Jesus Christ" (5:9) — appointed-to-salvation statement; proposed weight 0.5, with a dual note: `pastoral-serious-illness` already anchors 5:9-10 in its wake-or-sleep comfort register; this claims the salvation-not-wrath register (record the dual in both packs if extended).

**Lexicon candidates:**
- `leadership` — "honor church leaders"; "respect your pastor"; "how to treat church leaders".

**New-concept candidates:** none — the chapter's remaining phrasings (test everything, quench the Spirit, abstain from every form of evil) were checked against the 303-id union and the §3.5 1-Thessalonians decline block; the testing-prophecies decline ("near-covered: wisdom-from-god carries 'discernment'… plain 'test everything' phrasing is lexicon-tuning") stands.

**Decline-overturn proposals:** none (the `day-of-the-lord` contingent add above reverses no §3 decline — the recorded skip is a book-doc reversible default, and it is left to Jesse, not overturned here).

**Ceiling/subdivision marker:** YES — 8 tags (hard ceiling) AND subdivided in the book doc (5:1–11 / 5:12–22 / 5:23–28). Flagged for the per-verse refinement pass; the contingent `day-of-the-lord` add rides that pass.

---

## Decisions record — 1 Thessalonians sweep (2026-08-26)

Every yield and judgment call in this sweep, each a reversible default Jesse can overturn. No existing tag was dropped anywhere in this book — all 28 prior tag instances were re-verified against the pinned WEB text and kept.

1. **Ch. 2 ADD `sharing-your-faith`.** The one applied delta of this sweep. Grounds: sustained gospel-sharing substance across 2:2–12 (boldness, manner, affection, self-support, aim), quoted in the chapter block. The prior doc kept ch. 2 lean at 3 tags before the density addendum; under §11.6's soft-cap-6 this add costs nothing and serves "how to share the gospel" queries honestly. Reversible.
2. **Ch. 3 declines:** `comforting-others` (narrated comfort, 3:2, 7 — not the one-another teaching register; the letter's teaching texts 4:18, 5:11, 14 are already tagged), `temptation` (3:5 — single narrative clause), `do-not-lose-heart` (3:3 — thin single-verse). Honest-and-empty preferred; ch. 3 stays at 3.
3. **Ch. 4 `death-of-a-believer` yielded under the ceiling.** Clears the presence bar (4:13–18) but the chapter is at 8 and its substance is jointly carried by three kept tags (broad-duplicating-specific — first yield class that applies; no kept tag is an honest yield ahead of it). Routed to the per-verse refinement pass, with the pack-mint note that its keystone text is in-corpus and assertable. Reversible.
4. **Ch. 4 `resurrection-of-the-dead` 4:16 boundary.** Proposed as an anchor extension only up to the "The dead in Christ will rise first" clause; vv. 16–17's descent/catching-up stays with `caught-up-together`/`second-coming` per the apologetics map's cross-edge. Curator's call on range shape.
5. **Ch. 5 `day-of-the-lord` CONTINGENT, not applied.** Three stacked grounds recorded in the chapter block: hard ceiling with no honest yield; the prior recorded routing stands (new vocabulary state ≠ new textual evidence); and the open end-times ↔ day-of-the-lord scope question is Jesse's (corpus-blocked roster row 5 / flagged item 1). Flagged end-times-adjacent and contingent, not decided.
6. **Ch. 5 re-affirmed yields/declines:** `joy-in-the-lord` (5:16, still first-to-add-back), `vengeance` (5:15), `drunkenness` (5:7), `false-prophets` (5:20–21), `holiness`-on-ch.-5 (5:23) — each re-checked against the pinned text; every one's material already lives in its pack's existing 1 Th 5 anchor, so nothing is silently lost.
7. **Ch. 1 declines re-affirmed:** `faith` (reported virtue, no faith teaching — book doc Decisions 9) and `holy-spirit` (1:5–6 passing mentions).
8. **Ch. 2 `power-of-gods-word` register caveat.** The 2:13 extension candidate carries an either/or with `studying-the-word` (efficacy vs permanence register) — flagged for the curator, not decided.
9. **Doctrinal posture.** All ch. 4–5 eschatology is reported as the text reports it (descent, shout, trumpet, resurrection, catching up, thief-like day); no rapture-timing or millennial position taken, per the election-and-predestination pack's §4-neutral precedent and DOCTRINAL-BASIS §4. The `election-and-predestination` keep on ch. 1 states election only as the text's ground for thanks.
10. **Provenance.** All five chapters verified against the pinned sha256-matched VPL edition; chs. 4–5 additionally fixture-witnessed (agreement by construction at PR #53). This upgrades the book doc's 2026-08-23 provenance for chs. 1–3, which had been current-edition-only.

**Corpus-blocked routings this book:** none (no 1 Thessalonians find matched the 50-row roster; the ch. 5 end-times adjacency is a contingency flag on roster row 5, not a new routing).

**Survival audit (CONVENTIONS §9), 2026-08-26:** after the final append, the whole ledger was re-read end-to-end: header + five chapter blocks + this Decisions record present in order, all prior bytes byte-identical at every append (verified by `cmp` against a pre-append snapshot after each of the 7 writes). All ids validated against the 239+161 union; all quotes copied from the pinned VPL text of the chapter being tagged.

---

## Erratum — 2026-08-26 (fresh-critic pass)

Two record corrections, both surfaced by the fresh-critic pass, appended per CONVENTIONS §9 (single end-of-file append; no in-place rewrites; all prior bytes unchanged). Neither correction changes any tag delta, candidate, or count anywhere in this ledger.

1. **Ch. 4 anchor-extension block, `death-of-a-believer` pack-mint note — "no decline on record" corrected.** The note's dedupe clause reads "Not corpus-blocked; dedupe check run: not in the 50-row roster, no engine pack, no decline on record." The roster and engine-pack facts stand, but the last clause is misleading: a directly on-point decline IS on record in the §3.5 1 Thessalonians decline block — "grieving with hope (4:13–18) → covered jointly by `pastoral-grief-and-loss` + `hope-in-god` + `caught-up-together`". That decline concerns the identical verse range and register (4:13–18, grief over believers who have died), even though the id string `death-of-a-believer` itself was separately adopted. Correction of record: any future pack-mint decision for `death-of-a-believer` must engage that recorded decline's covered-jointly reasoning — the same covered-jointly ground this ledger's own Decisions record item 3 used for the ceiling yield.

2. **Decisions record item 1 — ch. 2 pre-addendum tag count corrected.** The item says "The prior doc kept ch. 2 lean at 3 tags before the density addendum." Actually ch. 2 carried 2 tags before the 2026-08-25 density addendum; the third (`discipleship`) was added by the addendum-era tag-application pass — see the book doc (`/mnt/project-files/research/bible-rollout/1-thessalonians.md`) Decisions 9, the 2026-08-25 tag-application pass, which applied `discipleship` on ch. 2 ("the nursing-mother/father mentoring manner with 2:14's imitators, judged the row's mentoring substance"); the book doc's own 2026-08-23 mechanical validation likewise records per-chapter counts 4 / 2 / 3 / 6 / 6. The ledger's 3 → 4 delta count for the `sharing-your-faith` add is unaffected and stays correct; only the chronology claim was wrong.
