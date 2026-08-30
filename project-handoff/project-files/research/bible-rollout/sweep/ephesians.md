# Ephesians — Layer-3 tag-sweep ledger

**Book:** Ephesians (6 chapters) · **Worker:** Pauline sweep, Galatians+Ephesians assignment (Galatians ledger delivered first, same date) · **Date:** 2026-08-26
**Repo:** scripture-search-engine @ `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (HEAD = origin/main; engine 0.14.0; 239 concept packs in `ontology/concepts/`).
**Legal tag vocabulary:** the 239 engine ids at e762d1c UNION the 161 adopted display ids (303 unique; CONVENTIONS §11.1). Every id in this ledger was validated mechanically (`grep -qx`) against `engine-ids.txt` and the adopted list — cross-checked against the reconstructed `tag-apply/adopted-concepts.md` (2026-08-26), whose 161 ids match the briefing's regenerated list exactly. Pastoral ids are always written with their `pastoral-` prefix (the briefing inventory's prefix-stripped spellings are a known defect, flagged in the Galatians ledger).
**WEB provenance:** pinned ebible.org engwebp VPL, sha256-verified against `pipeline/manifests/web.json` (`b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c` — exact match; the pinned edition itself). Every quotation below is word-for-word from that text, from the chapter being tagged. All 155 Ephesians verses are additionally fixture-witnessed in `pipeline/fixtures/web-subset.json` (EPH 1–6 fully in the corpus; regenerated from the same sha256 at PR #53).
**Inputs used:** book doc `/mnt/project-files/research/bible-rollout/ephesians.md` (prior art, incl. its 2026-08-25 tag-application pass — Decisions 16); `ontology/concepts/*.yaml` pack files at e762d1c; CONVENTIONS §3/§4/§5/§6/§9/§11; tag-gaps-review §1 (resolved) + §3 (declines) + postscript; corpus-blocked roster (50 rows, all STILL GATED post-#53); coverage plan §3/§5.2; `tag-gaps.md` consulted read-only for dedupe (no rows appended by this sweep).
**Rules applied:** presence bar first, always; soft cap 6 / hard ceiling 8; §11.6 yield order; no silent drops; honest-and-empty preferred; no later-revelation read-backs; declines re-considerable only with new textual evidence, cited; corpus-blocked matches ROUTED. **Doctrinal posture (binding):** the `election-and-predestination` pack's §4-neutral gist is precedent for Eph 1 — this ledger reports what the text says and what curated sources name; it adjudicates nothing, and no theology verdict appears in any justification.
**Prior-art tag baseline (book doc as of 2026-08-26):** ch 1: `blessing`, `identity-in-christ`, `assurance-of-salvation`, `providence`, `prayer`, `election-and-predestination`, `adoption-as-gods-children` (7). ch 2: `grace-not-earned`, `salvation`, `gods-love`, `identity-in-christ`, `the-cross`, `christ-the-cornerstone`, `unity-of-the-church` (7). ch 3: `prayer`, `gods-love`, `suffering-for-christ`, `do-not-lose-heart` (4). ch 4: `harmony-with-others`, `spiritual-gifts`, `spiritual-growth`, `new-creation`, `taming-the-tongue`, `forgiving-others`, `unity-of-the-church` (7). ch 5: `godly-marriage`, `walking-in-the-light`, `loving-others`, `holiness`, `stewardship-of-days`, `worship` (6). ch 6: `remembered-full-armor-of-god`, `resisting-the-devil`, `parenting`, `remembered-work-as-for-the-lord`, `prayer`, `benediction`, `bondservants-and-masters` (7).

---

## Ephesians 1 — swept 2026-08-26

**1. Applied-tag deltas** (prior art 7 tags):
- KEEP `blessing` — "blessed us with every spiritual blessing in the heavenly places in Christ" (1:3).
- KEEP `identity-in-christ` — "predestined us for adoption as children through Jesus Christ to himself" (1:5); "In him we have our redemption" (1:7); "We were also assigned an inheritance in him" (1:11).
- KEEP `assurance-of-salvation` — "you were sealed with the promised Holy Spirit" (1:13), "who is a pledge of our inheritance" (1:14).
- KEEP `providence` — "him who does all things after the counsel of his will" (1:11); "according to the good pleasure of his desire" (1:5).
- KEEP `prayer` — "making mention of you in my prayers" (1:16), "having the eyes of your hearts enlightened" (1:18; 1:16–19).
- KEEP `election-and-predestination` (adopted id) — reported in the text's own words, per the pack's §4-neutral gist (binding precedent): "he chose us in him before the foundation of the world" (1:4), "having predestined us for adoption as children… according to the good pleasure of his desire" (1:5), "having been foreordained according to the purpose of him who does all things after the counsel of his will" (1:11). No reading between positions is asserted anywhere in this ledger.
- KEEP `adoption-as-gods-children` — "having predestined us for adoption as children through Jesus Christ to himself" (1:5). (Book doc's own thinnest-tag flag noted and left standing.)
- ADD `supremacy-of-christ` — the prayer's climax is four verses of Christ enthroned over everything: seated "far above all rule, authority, power, dominion, and every name that is named, not only in this age, but also in that which is to come" (1:21); "He put all things in subjection under his feet, and gave him to be head over all things for the assembly" (1:22; 1:20–23). Honest substantial presence (the chapter's whole power-measure section); the pack's anchors are Colossians-only today, so "is christ supreme over all" queries never reach this passage. Chapter lands at 8 tags — HARD CEILING.
- DROP: none.

**2. Anchor-extension candidates:**
- `supremacy-of-christ` — Ephesians 1:20-22, quote "made him to sit at his right hand in the heavenly places, far above all rule, authority, power, dominion, and every name that is named", proposed weight 0.8 (pack currently COL-only; pair with the display add above).
- `assurance-of-salvation` — Ephesians 1:13-14, quote "having also believed, you were sealed with the promised Holy Spirit, who is a pledge of our inheritance", proposed weight 0.85 (no Ephesians anchor in the pack; the sealing/pledge assurance text). NOTE for curation: this pack carries a guarded lexicon history (bare `assurance` deferred; hymn-alias double-chip guard) — anchor-only extension avoids that minefield.
- `providence` — Ephesians 1:11, quote "him who does all things after the counsel of his will", proposed weight 0.7 (pack has no Ephesians anchor; the counsel-of-his-will phrase is providence's own vocabulary).
- `election-and-predestination` — no action: pack already anchors Eph 1:4-5 (keystone) and Eph 1:11; the corpus-blocked file's flagged item 2 records 1 Thess 1:4 / 2 Thess 2:13-14 riding the re-pin (those books belong to another sweep worker).
- `forgiveness-of-sins` — no action: pack already anchors Eph 1:7.

**3. Lexicon candidates:**
- `assurance-of-salvation` — "sealed with the holy spirit"; "the holy spirit as a guarantee"; "pledge of our inheritance" (subject to the pack's guard notes above; pair with the 1:13-14 anchor candidate).
- `supremacy-of-christ` — "seated at the right hand of god"; "far above all rule and authority"; "christ is head over all things".
- `election-and-predestination` — none: the pack already carries "chosen before the foundation of the world" and the predestination/election family.

**4. New-concept candidates:** none. Routed instead:
- ROUTE corpus-blocked roster row 26 (`inheritance`): the chapter's threefold inheritance vocabulary — "We were also assigned an inheritance in him" (1:11), "a pledge of our inheritance" (1:14), "the riches of the glory of his inheritance in the saints" (1:18) — is exactly the row's recorded "Eph 1:11-14 … NT in-Christ register — a different design to decide at re-pin"; 1:18 added to that evidence. Not display-tagged (Decisions E1-b; consistent with the Galatians ledger's G3-d).

**5. Decline-overturn proposals:** none.

**6. Ceiling/subdivision:** 8 tags — HITS THE HARD CEILING; not subdivided in the book doc (its Decisions 14 removed ch 1's subdivision). FLAG for the per-verse refinement pass on the ceiling ground.

## Ephesians 2 — swept 2026-08-26

**1. Applied-tag deltas** (prior art 7 tags):
- KEEP `grace-not-earned` — "for by grace you have been saved through faith, and that not of yourselves; it is the gift of God, not of works, that no one would boast" (2:8–9).
- KEEP `salvation` — "even when we were dead through our trespasses, made us alive together with Christ—by grace you have been saved" (2:5; 2:1–7).
- KEEP `gods-love` — "But God, being rich in mercy, for his great love with which he loved us" (2:4).
- KEEP `identity-in-christ` — "For we are his workmanship, created in Christ Jesus for good works" (2:10); "fellow citizens with the saints and of the household of God" (2:19).
- KEEP `the-cross` — "made near in the blood of Christ" (2:13); "might reconcile them both in one body to God through the cross" (2:16).
- KEEP `christ-the-cornerstone` — "Christ Jesus himself being the chief cornerstone" (2:20; 2:19–22).
- KEEP `unity-of-the-church` (adopted id) — "broke down the middle wall of separation" (2:14), "create in himself one new man of the two, making peace" (2:15; 2:14–16).
- ADD `gentile-inclusion` (adopted id, §11.3) — the second half of the chapter is the Gentiles-brought-near teaching itself: "once you, the Gentiles in the flesh" (2:11), "you who once were far off are made near in the blood of Christ" (2:13), "So then you are no longer strangers and foreigners, but you are fellow citizens with the saints" (2:19; 2:11–19). Distinct register beside `unity-of-the-church` (who is included vs the one-body result), both independently over the bar per §11.2. `nations-and-peoples` NOT co-applied (origin-of-nations register absent). Chapter lands at 8 tags — HARD CEILING.
- DROP: none.

**2. Anchor-extension candidates:**
- `good-works` — Ephesians 2:10, quote "For we are his workmanship, created in Christ Jesus for good works, which God prepared before that we would walk in them.", proposed weight 0.75 (pack anchors are Titus-only; the grace-then-works ordering text).
- Everything else verified already anchored: `grace-not-earned` 2:8-9, `salvation` 2:8, `gods-love` 2:4-5, `identity-in-christ` 2:10, `unity-of-the-church` 2:14-16, `christ-the-cornerstone` 2:19-22, `the-house-of-god` 2:21-22, `faith-and-works` 2:8-10, `mormon-evangelism` 2:8-9. No proposals needed.

**3. Lexicon candidates:**
- `grace-not-earned` — "can i earn my way to heaven"; "earn salvation"; "saved by grace through faith" (the earn-family and the 2:8 phrase itself are absent from the pack's six entries).
- `gentile-inclusion` (adopted; for the eventual pack, corpus-blocked row 40) — "who are the gentiles"; "does god accept gentiles"; "gentiles in the bible".

**4. New-concept candidates:** none. Routed instead:
- ROUTE corpus-blocked roster row 40 (`gentile-inclusion`, DEFERRED-to-re-pin): Eph 2:11–19 is a top-strength evidence set for the eventual pack and — unlike the row's blocked Acts 10–11/15 core texts — is ENTIRELY in the fixture corpus (EPH 1–6 fully witnessed). Noted for the re-pin curator beside the row's Gal 3:28 / Acts 13:47-48 free texts; `unity-of-the-church` already anchors 2:14-16, so boundary design between the two packs is needed (inclusion register vs one-body register).

**5. Decline-overturn proposals:** none.

**6. Ceiling/subdivision:** 8 tags — HITS THE HARD CEILING; subdivided in the book doc (2:1–10 / 2:11–18 / 2:19–22). FLAG for the per-verse refinement pass on both grounds.

## Ephesians 3 — swept 2026-08-26

**1. Applied-tag deltas** (prior art 4 tags):
- KEEP `prayer` — "I bow my knees to the Father of our Lord Jesus Christ" (3:14; the petitions of 3:16–19).
- KEEP `gods-love` — "to know Christ’s love which surpasses knowledge" (3:19); "rooted and grounded in love" (3:17).
- KEEP `suffering-for-christ` — "I, Paul, am the prisoner of Christ Jesus on behalf of you Gentiles" (3:1); "my troubles for you, which are your glory" (3:13).
- KEEP `do-not-lose-heart` — "I ask that you may not lose heart at my troubles for you" (3:13). (Book doc Decisions 7's single-verse honesty note re-checked and left standing.)
- ADD `gentile-inclusion` (adopted id, §11.3) — the revealed mystery IS the Gentiles' inclusion, stated as the chapter's teaching center: "that the Gentiles are fellow heirs and fellow members of the body, and fellow partakers of his promise in Christ Jesus through the Good News" (3:6; the mystery narrative of 3:3–9); Paul's commission "to preach to the Gentiles the unsearchable riches of Christ" (3:8). Honest substantial presence across 3:1–13. Chapter lands at 5 tags.
- DROP: none.

**2. Anchor-extension candidates:**
- `prayer` — Ephesians 3:14-19, quote "I bow my knees to the Father of our Lord Jesus Christ… that Christ may dwell in your hearts through faith", proposed weight 0.7 (the pack anchors Eph 1:17-18 and 6:18 but not this prayer, one of Scripture's most-quoted intercessions).
- `do-not-lose-heart` — Ephesians 3:13, quote "Therefore I ask that you may not lose heart at my troubles for you, which are your glory.", proposed weight 0.65 (no Ephesians anchor in the pack; the concept's exact phrase).
- `gods-love` — no action: pack already anchors Eph 3:17-19.

**3. Lexicon candidates:**
- `gods-love` — "the love of christ that passes knowledge"; "rooted and grounded in love"; "how wide and long and high and deep" (the NIV-remembered dimension phrasing searchers type; WEB 3:18 reads "the width and length and height and depth").
- `prayer` — "god can do more than we ask"; "immeasurably more than we ask or imagine" (NIV-remembered phrasing of 3:20; WEB reads "exceedingly abundantly above all that we ask or think").

**4. New-concept candidates:** none. "The mystery of Christ" (3:3–9) considered as a gap and NOT proposed: its content in this chapter is precisely Gentile inclusion (3:6), routed with the ch-2 evidence to corpus-blocked roster row 40; a standalone mystery id would be a synonym row.

**5. Decline-overturn proposals:** none.

**6. Ceiling/subdivision:** 5 tags (under soft cap); subdivided in the book doc (3:1–13 / 3:14–21) — FLAG for the per-verse refinement pass.

## Ephesians 4 — swept 2026-08-26

**1. Applied-tag deltas** (prior art 7 tags):
- KEEP `harmony-with-others` — "with all lowliness and humility, with patience, bearing with one another in love" (4:2), "being eager to keep the unity of the Spirit in the bond of peace" (4:3); bitterness, wrath, and slander put away (4:31).
- KEEP `spiritual-gifts` — "to each one of us, the grace was given according to the measure of the gift of Christ" (4:7); the gifts "for the perfecting of the saints, to the work of serving" (4:11–12).
- KEEP `spiritual-growth` — "until we all attain to the unity of the faith… to a full grown man" (4:13); "grow up in all things into him who is the head" (4:15).
- KEEP `new-creation` — "put on the new man, who in the likeness of God has been created in righteousness and holiness of truth" (4:24; 4:22–24).
- KEEP `taming-the-tongue` — "Let no corrupt speech proceed out of your mouth, but only what is good for building others up" (4:29; 4:31).
- KEEP `forgiving-others` — "forgiving each other, just as God also in Christ forgave you" (4:32).
- KEEP `unity-of-the-church` (adopted id) — "one body and one Spirit" (4:4), "one Lord, one faith, one baptism" (4:5), "one God and Father of all" (4:6; 4:3–6, 13).
- ADD `honesty` — restores the book doc's own Decisions-8 cap casualty ("any can be swapped in") under the §11.6 ceiling: "Therefore, putting away falsehood, speak truth each one with his neighbor, for we are members of one another." (4:25), inside the chapter's truth thread — "speaking truth in love" (4:15), "even as truth is in Jesus" (4:21). The pack already anchors Eph 4:25, so display and engine align. Chapter lands at 8 tags — HARD CEILING.
- DROP: none.

**2. Anchor-extension candidates:**
- `new-creation` — Ephesians 4:22-24, quote "put away, as concerning your former way of life, the old man… and put on the new man, who in the likeness of God has been created in righteousness and holiness of truth", proposed weight 0.75 (pack anchors are 2CO/GAL and OT; the put-off/put-on text is unanchored).
- `holy-spirit-the-comforter` — Ephesians 4:30, quote "Don’t grieve the Holy Spirit of God, in whom you were sealed for the day of redemption.", proposed weight 0.6 (nearest home per the book doc's motif 9; pair with the lexicon candidate below).
- Verified already anchored, no proposals: `harmony-with-others` 4:2-3, `unity-of-the-church` 4:4-6, `ascension` 4:8-10, `spiritual-gifts` 4:11-12, `spiritual-growth` 4:15, `taming-the-tongue` 4:15/4:29/4:31, `hardness-of-heart` 4:18, `honesty` 4:25, `work-and-diligence` 4:28, `forgiving-others` 4:32, `kindness` 4:32.

**3. Lexicon candidates:**
- `new-creation` — "put off the old self"; "put on the new self"; "the old man and the new man" (pair with the 4:22-24 anchor candidate).
- `holy-spirit-the-comforter` — "what does it mean to grieve the holy spirit"; "grieving the holy spirit".
- `harmony-with-others` — "dont go to bed angry"; "dont let the sun go down on your anger" (4:26's household phrase; XOR with the new-concept candidate below — one home only, decided at curation).

**4. New-concept candidates:**
- `anger` (human anger; id illustrative) — refs Eph 4:26–27 ("Be angry, and don’t sin." Don’t let the sun go down on your wrath, "and don’t give place to the devil"), 4:31. Queries: "what does the bible say about anger"; "is anger a sin"; "how to control my anger". Dedupe performed: not among the 303 ids; not a recorded decline (the Proverbs decline on `slow-to-anger` concerns GOD'S patience and routed the human slow-to-anger sayings to `self-control` display tags — no lexicon serves plain anger queries today: `self-control`'s three entries and `harmony-with-others`'s seven carry no anger word); no corpus-blocked row matches; tag-gaps.md checked read-only — no human-anger row exists. Check-extension-first discipline applies: measure a `self-control` or `harmony-with-others` lexicon extension before minting (James 1:19-20 and Prov 14:29/15:18/16:32 would join from other books).

**5. Decline-overturn proposals:** none.

**6. Ceiling/subdivision:** 8 tags — HITS THE HARD CEILING; subdivided in the book doc (4:1–16 / 4:17–32). FLAG for the per-verse refinement pass on both grounds.

## Ephesians 5 — swept 2026-08-26

**1. Applied-tag deltas** (prior art 6 tags):
- KEEP `godly-marriage` — "Husbands, love your wives, even as Christ also loved the assembly and gave himself up for her" (5:25); "Wives, be subject to your own husbands, as to the Lord." (5:22); "the two will become one flesh" (5:31; 5:22–33). Reported on the book doc's Decisions-4 framing: both sides' charges stated, nothing adjudicated (DOCTRINAL-BASIS §4 non-criterion respected).
- KEEP `walking-in-the-light` — "For you were once darkness, but are now light in the Lord. Walk as children of light" (5:8; 5:8–14). The pack's ethical-conduct scoping fits this passage exactly.
- KEEP `loving-others` — "Walk in love, even as Christ also loved us and gave himself up for us" (5:2).
- KEEP `holiness` — impurity "not even be mentioned among you, as becomes saints" (5:3); Christ cleansing the assembly "that she should be holy and without defect" (5:26–27). (Book doc Decisions 15's register swap from `pastoral-sexual-purity` re-checked and left standing.)
- KEEP `stewardship-of-days` — "redeeming the time, because the days are evil" (5:16; 5:15–17).
- KEEP `worship` — "speaking to one another in psalms, hymns, and spiritual songs; singing and making melody in your heart to the Lord" (5:19).
- ADD `thanksgiving` — restores the book doc's own Decisions-8 cap casualty under the §11.6 ceiling: "giving thanks always concerning all things in the name of our Lord Jesus Christ to God, even the Father" (5:20), with thanks set against filthy talk — "but rather giving of thanks" (5:4). The pack already anchors Eph 5:20. Chapter lands at 7 tags (within ceiling).
- DROP: none.

**2. Anchor-extension candidates:**
- `holy-spirit` — Ephesians 5:18, quote "Don’t be drunken with wine, in which is dissipation, but be filled with the Spirit", proposed weight 0.8 (the pack has NO Pauline anchor, yet its own lexicon carries "filled with the spirit" and "be filled with the holy spirit" — this verse is that lexicon's text; today only `holy-spirit-the-comforter` and `drunkenness` anchor 5:18).
- `loving-others` — Ephesians 5:2, quote "Walk in love, even as Christ also loved us and gave himself up for us, an offering and a sacrifice to God", proposed weight 0.7 (pack's Ephesians coverage is nil; the walk-in-love command).
- Verified already anchored, no proposals: `walking-in-the-light` 5:8-9, `pastoral-refuge-and-justice` 5:11-13, `stewardship-of-days` 5:15-17, `guidance` 5:17, `drunkenness` 5:18, `holy-spirit-the-comforter` 5:18, `thanksgiving` 5:20, `godly-marriage` 5:22-24/5:25/5:28.

**3. Lexicon candidates:**
- `worship` — "psalms hymns and spiritual songs"; "singing in church"; "worship music in the bible" (none carried by the pack's seven entries; 1 Chr block's identical flag noted in tag-gaps §3.5 — same candidate family, one curation decision).
- `godly-marriage` — "marriage like christ and the church"; "what does submission in marriage mean"; "husbands love your wives as christ loved the church" (the pack carries "husbands love your wives" but neither the Christ-and-church pattern phrasing nor the submission question).

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**6. Ceiling/subdivision:** 7 tags (under ceiling); subdivided in the book doc (5:1–7 / 5:8–20 / 5:21–33) — FLAG for the per-verse refinement pass.

## Ephesians 6 — swept 2026-08-26

**1. Applied-tag deltas** (prior art 7 tags):
- KEEP `remembered-full-armor-of-god` — the source passage itself: "Put on the whole armor of God, that you may be able to stand against the wiles of the devil." (6:11), the pieces named (6:13–17).
- KEEP `resisting-the-devil` — "our wrestling is not against flesh and blood, but against the principalities, against the powers" (6:12); the stand "against the wiles of the devil" (6:11).
- KEEP `parenting` — "Children, obey your parents in the Lord" (6:1); fathers, "don’t provoke your children to wrath, but nurture them in the discipline and instruction of the Lord" (6:4).
- KEEP `remembered-work-as-for-the-lord` — "with good will doing service as to the Lord and not to men" (6:7); "as servants of Christ, doing the will of God from the heart" (6:6; 6:5–8). (Book doc Decisions 6's sister-epistle rationale re-checked; no read-back involved.)
- KEEP `prayer` — "with all prayer and requests, praying at all times in the Spirit" (6:18; 6:18–20).
- KEEP `benediction` — "Peace be to the brothers, and love with faith, from God the Father and the Lord Jesus Christ." (6:23; 6:23–24).
- KEEP `bondservants-and-masters` — servants obedient "in singleness of your heart, as to Christ" (6:5), masters to "do the same things to them, and give up threatening" — "there is no partiality with him" (6:9; 6:5–9). Described, never endorsed as a social order — the text's own leveling claims reported (§6 guardrail held).
- ADD `boldness-in-witness` — the chapter's own prayer-for-witness teaching, and this pack's source text: "Pray for me, that utterance may be given to me in opening my mouth, to make known with boldness the mystery of the Good News" (6:19), "for which I am an ambassador in chains; that in it I may speak boldly, as I ought to speak" (6:20). The pack anchors Eph 6:19-20 — display and engine align. Chapter lands at 8 tags — HARD CEILING.
- DROP: none.

**2. Anchor-extension candidates:**
- `resisting-the-devil` — Ephesians 6:11-13, quote "Put on the whole armor of God, that you may be able to stand against the wiles of the devil.", proposed weight 0.75 (the pack has only two anchors and no Ephesians ref; its lexicon carries bare "spiritual warfare", so this is where those queries should land — see also the row-12 route below).
- `remembered-work-as-for-the-lord` — Ephesians 6:7, quote "with good will doing service as to the Lord and not to men", proposed weight 0.7 (pack's single anchor is Col 3:23; the native Ephesians statement).
- Verified already anchored, no proposals: `remembered-full-armor-of-god` 6:11 + 6:13-17, `victory-in-christ` 6:11-12, `prayer` 6:18, `boldness-in-witness` 6:19-20, `caring-for-aging-parents` 6:2-3, `parenting` 6:4, `bondservants-and-masters` 6:5-9, `heavenly-reward` 6:8, `favoritism` 6:9.

**3. Lexicon candidates:**
- `remembered-full-armor-of-god` — "armor of god meaning"; "shield of faith"; "sword of the spirit" (the pack's three entries are whole-armor phrasings only; the piece-by-piece queries reach nothing).
- `resisting-the-devil` — "not against flesh and blood"; "our battle is not against flesh and blood".
- `parenting` — "children obey your parents"; "fathers do not provoke your children" (the pack's six entries carry neither household command).

**4. New-concept candidates:** none. Routed instead:
- ROUTE corpus-blocked roster row 12 (`spiritual-warfare`, DEFERRED): Eph 6:10–18 is in-corpus evidence for the eventual two-register design (vs `deliverance-from-demons`), alongside the row's recorded lexicon fact that `resisting-the-devil` already carries bare "spiritual warfare". NOT display-tagged here: `resisting-the-devil` + `remembered-full-armor-of-god` already carry 6:11–12 twice, and a third id on the same span is the §11.6 broad-duplicating-specific class (Decisions E6-b).

**5. Decline-overturn proposals:** none.

**6. Ceiling/subdivision:** 8 tags — HITS THE HARD CEILING; subdivided in the book doc (6:1–4 / 6:5–9 / 6:10–20 / 6:21–24). FLAG for the per-verse refinement pass on both grounds.

---

## Decisions record — Ephesians sweep (every yield/judgment call; all reversible delegated defaults)

- **E1-a. `supremacy-of-christ` ADDED to ch 1, taking the chapter to the 8-tag hard ceiling.** Each sitting tag re-verified over the bar quote-by-quote. If Jesse trims to the soft cap, this sweep's §11.6 yield-order recommendation is `adoption-as-gods-children` first (the book doc's own "chapter's thinnest tag, one verse" flag; its metaphor is co-carried by `identity-in-christ` 1:5 — thin-single-verse class), then `blessing` (broadest of the remaining). Recommendation only — no drop performed.
- **E1-b. `inheritance` (adopted) NOT display-tagged on ch 1** despite threefold vocabulary (1:11, 14, 18): the NT in-Christ inheritance design is explicitly deferred by corpus-blocked row 26, and `identity-in-christ` + `assurance-of-salvation` already carry the same verses' substance. Routed to row 26 (consistent with Galatians G3-d). Reversible.
- **E1-c. `ascension` NOT added to ch 1.** 1:20–21 is resurrection-and-session ("raised him from the dead and made him to sit at his right hand"), not the taken-up-to-heaven event the pack's register serves (its Eph anchor is rightly 4:8-10). The session language rides the `supremacy-of-christ` add instead.
- **E1-d. `forgiveness-of-sins` NOT added to ch 1** — "the forgiveness of our trespasses" (1:7) is one clause in the blessing catalog (thin single-verse class); the pack already anchors Eph 1:7, so search coverage does not depend on a display tag.
- **E1-e. `sovereignty-of-god` (adopted) NOT added to ch 1** — "who does all things after the counsel of his will" (1:11) is carried by the sitting `providence` tag (its lexicon includes "gods sovereignty"); a second id on the same clause is broad-duplicating-specific.
- **E1-f. `holy-spirit` NOT added to ch 1** — the sealing (1:13–14) is tagged via `assurance-of-salvation`, whose register the verses teach; the Spirit himself is the pledge, not the chapter's teaching subject.
- **E1-g. Doctrinal posture on ch 1 honored.** The `election-and-predestination` keep quotes the text only; the pack's §4-neutral gist ("routes, adjudicates nothing") is treated as binding precedent; no position is asserted or implied anywhere in this ledger (checked over the whole file at delivery).
- **E2-a. `gentile-inclusion` ADDED to ch 2 → 8 tags (ceiling).** Both-tags ruling applied deliberately beside `unity-of-the-church`: inclusion-of-the-Gentiles vs one-body-unity are distinct registers, each with its own verses' substance (2:11–13, 19 vs 2:14–16). If Jesse trims, yield-order recommendation: `christ-the-cornerstone` and `unity-of-the-church` remain (specific, anchored); the sweep recommends `salvation` yields first on THIS chapter only (its 2:1–7 substance is co-carried by `grace-not-earned` + `gods-love`; broad-duplicating-specific) — recommendation only, no drop performed.
- **E2-b. `the-house-of-god` NOT added to ch 2** — 2:19-22's temple/household imagery is carried by the sitting `christ-the-cornerstone` (same span); the pack already anchors Eph 2:21-22 engine-side. Broad-duplicating-specific.
- **E2-c. `mercy` NOT added to ch 2** — "rich in mercy" (2:4) is one clause inside the `gods-love` quote. Thin single-verse class.
- **E2-d. `sojourners-and-strangers` NOT added to ch 2** — 2:19 states the INVERSE of the pack's living-as-a-foreigner register ("no longer strangers and foreigners"); tagging would route foreigner-life queries to a text about their end.
- **E2-e. `good-works` (adopted+engine) NOT display-tagged on ch 2** — 2:10 is one verse; carried as the anchor-extension candidate instead.
- **E3-a. `gentile-inclusion` ADDED to ch 3** (mystery = inclusion; see chapter block). Ch 3 lands at 5 — no ceiling issue.
- **E3-b. `boldness-in-witness` NOT added to ch 3** — "In him we have boldness and access in confidence" (3:12) is access-to-God boldness, not the witness register; the witness register lands on ch 6 where its source text lives.
- **E3-c. `empowered-by-the-spirit` (adopted) NOT added to ch 3** — "strengthened with power through his Spirit in the inner person" (3:16) is inner strengthening, not the Spirit-of-the-LORD-came empowerment refrain the adopted row (corpus-blocked row 13) documents. Declined; no route (no evidence gained for that row's register).
- **E3-d. `knowing-god` (adopted+engine) NOT added to ch 3** — "to know Christ’s love which surpasses knowledge" (3:19) is the love's surpassing-ness, carried by `gods-love`; the chapter does not teach the knowing-God discipline register.
- **E4-a. `honesty` ADDED to ch 4 → 8 tags (ceiling).** Restores the book doc's Decisions-8 casualty exactly as that record invited ("any can be swapped in") now that §11.6 allows 8. If Jesse trims, the same Decisions-8 order reverses it first — it is the sweep's own first-yield candidate on this chapter.
- **E4-b. `ascension` NOT added to ch 4** — 4:8–10 genuinely states descent/ascent, but instrumentally to the giving of gifts (carried by `spiritual-gifts`), and the chapter was at ceiling with `honesty`, which Decisions 8 had already queued; the pack's Eph 4:8-10 anchor keeps search coverage whole. Reversible — if Jesse prefers `ascension` over `honesty` for the 8th slot, both calls are recorded here.
- **E4-c. `hardness-of-heart` NOT added to ch 4** — "the hardening of their hearts" (4:18) describes the former Gentile walk in one clause; pack already anchors 4:18.
- **E4-d. `kindness` NOT added to ch 4** — "be kind to one another, tender hearted" (4:32) is inside the `forgiving-others` quote and anchored engine-side; broad-duplicating-specific.
- **E4-e. `work-and-diligence` NOT added to ch 4** — 4:28 (labor to give) is a single verse; anchored engine-side already.
- **E4-f. `light-and-darkness` NOT added to ch 4 or 5** — the ethical light-walk is `walking-in-the-light`'s deliberately scoped register (tagged on ch 5); the Johannine light-of-the-world register is absent from both chapters.
- **E5-a. `thanksgiving` ADDED to ch 5 → 7 tags.** Decisions-8 casualty restored (5:4, 5:20; pack anchors 5:20). Under-ceiling; no yield note needed.
- **E5-b. `holy-spirit` NOT display-tagged on ch 5 (close call, recorded).** "be filled with the Spirit" (5:18) is the pack's own lexicon phrase and real teaching, but a single command verse whose outflow (5:19–21) is carried by `worship` + `thanksgiving`; the sweep judged it the thin-single-verse class and served it as the strong 5:18 anchor-extension candidate instead. Reversible — restoring it as an 8th tag would not breach the ceiling.
- **E5-c. `drunkenness` NOT added to ch 5** — 5:18a is the contrast clause of the Spirit-filling command, not drunkenness teaching; pack already anchors Eph 5:18.
- **E5-d. `covetousness` / `idolatry` NOT added to ch 5** — 5:3, 5:5 name them inside the purity charge carried by `holiness`; list-mention class.
- **E5-e. `pastoral-sexual-purity` not reconsidered** — book doc Decisions 15's register ruling re-checked against the pinned text and left standing (corporate warning register, not personal-crisis).
- **E6-a. `boldness-in-witness` ADDED to ch 6 → 8 tags (ceiling).** The pack's source text (6:19-20). If Jesse trims, yield-order recommendation: `benediction` first (one-verse epistolary formula — the same ground Galatians' Decisions 4 declined it there; it sits here only by the Romans-pattern ruling ratified in §11.5) — recommendation only, no drop performed.
- **E6-b. `spiritual-warfare` (adopted) NOT display-tagged on ch 6** — third id on the 6:11–12 span already carried by `resisting-the-devil` + `remembered-full-armor-of-god` (broad-duplicating-specific), and `resisting-the-devil`'s lexicon already owns bare "spiritual warfare". Routed to corpus-blocked row 12 with the in-corpus evidence note.
- **E6-c. `victory-in-christ` NOT added to ch 6** — Decisions 8 named it swappable-in, but the passage's register is the defensive stand ("that you may be able to withstand in the evil day, and having done all, to stand", 6:13), already double-carried; the pack's Eph 6:11-12 anchor keeps coverage. Third-tag-on-same-span, first-yield class — declined in favor of `boldness-in-witness`, whose verses (6:19–20) no sitting tag carried. Reversible.
- **E6-d. `caring-for-aging-parents` non-use upheld** — book doc Decisions 9 re-checked: 6:1–4 addresses children being raised, not adult children of aging parents; the pack's Eph 6:2-3 anchor stands engine-side (anchor and display legitimately diverge here).
- **E6-e. `heavenly-reward` / `favoritism` NOT added to ch 6** — 6:8 and 6:9b are single clauses inside the household code, both already anchored engine-side.
- **E6-f. `power-of-gods-word` NOT added to ch 6** — "the sword of the Spirit, which is the word of God" (6:17) is one armor piece, list-mention class.
- **Sweep-wide: no drops; zero silent changes.** Every prior-art tag re-verified word-for-word against the pinned VPL text and kept.
- **Sweep-wide: `baptism` on 4:5** — book doc Decisions 10's non-use re-checked and upheld (list item in the sevenfold oneness, not baptism teaching).

## Survival audit — Ephesians ledger (CONVENTIONS §9)

All eight appends to this file (header, chapters 1–6, this closing block) were made as atomic end-of-file appends; after each, the file was re-read and the pre-existing bytes verified unchanged (sha256 over the prior byte-length re-computed and matched) and the new block verified present exactly once. Final check at this delivery: header + 6 chapter blocks + Decisions record + this audit present exactly once each. Cross-ledger audit: the Galatians ledger (delivered earlier today by this same worker) re-verified intact at this delivery — all its blocks present, no foreign edits. No other file under /mnt/project-files was touched by this worker. Ledger complete: 6/6 chapters swept.

---

## Erratum — fresh-critic pass, 2026-08-26 (CONVENTIONS §9 append; no in-place edits)

**Source:** fresh-critic verification pass of this ledger, 2026-08-26. The critic verified quotes, ids, deltas, caps, presence bar, schema, and neutrality clean, and sustained three objections plus one minor note, all corrected here. Every cited pack file was re-read directly at e762d1c before this block was written. Nothing above this line is edited; where the text above and this block disagree, this block governs.

**E-ERR-1 (ch 1 §1 ADD + ch 1 §2 anchor candidate) — `supremacy-of-christ` anchor census corrected.** The ledger claims "the pack's anchors are Colossians-only today" (ch 1 §1) and "(pack currently COL-only; pair with the display add above)" (ch 1 §2). False. `ontology/concepts/supremacy-of-christ.yaml` @ e762d1c anchors seven refs: Colossians 1:15 (1.0), Colossians 1:16 (0.95), Colossians 1:17 (0.9), Colossians 1:18 (0.9), Hebrews 1:3 (0.85), Hebrews 1:8 (0.85), Hebrews 1:10-12 (0.85) — all `[editorial]`. Corrected census: Colossians 1 AND Hebrews 1, not Colossians only. The load-bearing point survives: the pack has NO Ephesians anchor, so Eph 1:20-23 remains unreached by it. The ch-1 ADD and the 1:20-22 anchor-extension candidate both stand, reframed as "no Ephesians anchor in the pack (COL 1 + HEB 1 only)".

**E-ERR-2 (ch 6 §3 lexicon candidate) — `parenting` claim corrected; one phrasing WITHDRAWN.** The ledger claims "the pack's six entries carry neither household command". False. `parenting.yaml`'s six lexicon entries at e762d1c are, verbatim: "parenting", "raising children", "train up a child", "prayer for my child", "prayer for my teenager", "children obey your parents" — the sixth is byte-identical to the row's first proposed phrasing. WITHDRAWN: "children obey your parents" (already in the pack; proposing it was a duplicate admission). SURVIVES: "fathers do not provoke your children" — verified genuinely absent from all six entries (the pack anchors Eph 6:4, whose text is the don't-provoke charge, but no lexicon entry carries that phrasing, so the query family reaches nothing by lexicon today). The ch-6 `parenting` row now proposes one phrasing, not two.

**E-ERR-3 (ch 5 §2 anchor candidate; Decisions E5-b) — `holy-spirit` ← Eph 5:18 RECAST as a REVERSAL PROPOSAL, not a gap-fill.** The ledger presented the 5:18 anchor candidate as if the pack's Pauline gap were an oversight, omitting the pack's own recorded contrary ruling. `holy-spirit.yaml`'s header @ e762d1c records the batch-2 move decision verbatim (comment line-breaks and `# ` prefixes elided): the entries "holy spirit", "filled with the spirit" and "be filled with the holy spirit" "MOVE from that pack to this one (their filled-scene anchors, Acts 2:4 and 4:31, live here; Eph 5:18 stays the comforter pack's anchor, reachable by its remaining lexicon)." `holy-spirit-the-comforter.yaml`'s header records the same ruling from its side: "Eph 5:18 stays anchored here, reachable via the remaining lexicon." The candidate therefore proposes to REVERSE a recorded span-discipline ruling, and is re-labeled accordingly: reversal proposal, deferred to the curator/Jesse, explicitly citing the ruling above as the decision it would reverse. Evidence recorded both ways, adjudicating nothing: (a) the ruling deliberately reserved Eph 5:18 to `holy-spirit-the-comforter`, which anchors it at 0.75 `[editorial]`; (b) the comforter's remaining lexicon after the move is six entries — "the comforter", "comforter", "counselor", "helper", "advocate", "spirit of truth" — none of which carries a filled-with-the-Spirit phrasing, so the query family "be filled with the spirit" now routes to `holy-spirit` (which anchors the Acts filled scenes, not Eph 5:18) and may no longer reach 5:18 by lexicon; whether that outcome is what "reachable by its remaining lexicon" intended is precisely the question reserved to the curator. Reversible either way; this erratum asserts no weight or preference beyond the recast.

**E-ERR-4 (MINOR; ch 4 §2 anchor candidate) — `new-creation` anchor census corrected.** The ledger describes the pack's anchors as "2CO/GAL and OT". Incomplete: `new-creation.yaml` @ e762d1c anchors 2 Corinthians 5:17 (1.0), Psalms 51:10 (0.9), Galatians 6:15 (0.8), Ezekiel 36:26 (0.75), Revelation 21:5 (0.75), and Acts 3:19 (0.7) — Revelation and Acts were omitted from the census. The load-bearing claim stands: Eph 4:22-24 is unanchored in the pack; the candidate stands with the census corrected.

**Corrected totals (Ephesians):** applied-tag deltas UNCHANGED — 6 adds / 38 keeps / 0 drops. Anchor-extension candidates UNCHANGED in number — 12 proposal rows, 12 distinct ids — but now 11 gap-fill + 1 reversal proposal (`holy-spirit` ← Eph 5:18, per E-ERR-3). Lexicon candidates: 14 rows unchanged; proposed phrasings 37 → 36 after the E-ERR-2 withdrawal (the ch-6 `parenting` row drops from 2 phrasings to 1).

**§9 audit for this erratum:** written as ONE atomic end-of-file append. Pre-append state recorded: 35,907 bytes, sha256 `30cc6bcfb00965416ae44cf2d92587df033c3b19e5f32f555997412ffcc19675`. Post-write, the file was re-read, the first 35,907 bytes re-hashed and verified identical, and this block verified present exactly once.
