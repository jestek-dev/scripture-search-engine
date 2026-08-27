# 2 Corinthians — Layer-3 tag-sweep ledger

**Book:** 2 Corinthians (13 chapters, 257 verses; VPL code `2CO`)
**Repo:** scripture-search-engine @ `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (origin/main = HEAD; engine 0.14.0; 239 concept packs in `ontology/concepts/`)
**Date:** 2026-08-26
**Sweep worker:** Pauline-epistles sweep, 2 Corinthians assignment
**Inputs used:** (1) prior art `/mnt/project-files/research/bible-rollout/2-corinthians.md` (delivered 2026-08-23, critic-approved; incl. its 2026-08-25 tag-apply and PR #51 mint-apply passes — 60 sitting tag applications); (2) full engine library at e762d1c (239 ids, packs read directly for lexicon/anchor/scope-comment detail) + the 161 adopted display ids (legal vocabulary = union, 303 ids; every id below validated mechanically against `engine-ids.txt` / `adopted-161.txt`); (3) `tag-gaps-review.md` §1 (as resolved by CONVENTIONS §11) and §3 declines — re-considerable only with new textual evidence; (4) `engine-pack-backlog.md` 50-row corpus-blocked roster (route, don't duplicate; 2 Cor-relevant row 47 `unequally-yoked`); (5) CONVENTIONS §3/§4/§5/§6/§9/§11 verbatim extracts; (6) coverage plan §3 + §5.2.
**WEB provenance:** all quotes word-for-word from the pinned ebible.org engwebp VPL edition (`pipeline/manifests/web.json`; archive sha256 `b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c`, verified at fetch by the prep worker — this IS the pinned edition, no drift caveat), 2CO lines of the sweep scratchpad's `web-pauline.vpl.txt`. Curly punctuation preserved. This upgrades the prior art's provenance: the book doc verified chs 1, 4, 5, 7, 10, 12 against pinned fixture witnesses and chs 2, 3, 6, 8, 9, 11, 13 against the then-current edition only; every quote in THIS ledger, all 13 chapters, is checked against the pinned snapshot.
**Doctrinal posture:** §4-neutral precedent (election-and-predestination pack) binding for contested passages — report what curated sources name, never adjudicate; no theology verdicts in gists or labels; DOCTRINAL-BASIS §3 prosperity exclusion carried on chs 8–9 material.
**Discipline:** presence bar first; soft cap 6 / hard ceiling 8; §11.6 yield order; no silent drops (all yields/judgment calls in the Decisions record at the end); no later-revelation read-backs; display-layer only — nothing here creates a concept, anchor, weight, or fixture.

---

## 2 Corinthians 1 — swept 2026-08-26

Prior tags 6 → after deltas 7 (1 add, 6 keeps, 0 drops; within hard ceiling, every tag independently clears the bar).

### 1. Applied-tag deltas
- KEEP `god-of-all-comfort` — "the Father of mercies and God of all comfort, who comforts us in all our affliction" (1:3–4; pack's own keystone anchor 1:3–4).
- KEEP `pastoral-hope-in-despair` — "we despaired even of life" met by "God who raises the dead, who delivered us out of so great a death, and does deliver" (1:8–10; pack anchor 1:8–10).
- KEEP `suffering-for-christ` — "For as the sufferings of Christ abound to us, even so our comfort also abounds through Christ." (1:5; pack anchor 1:5).
- KEEP `gods-faithfulness` — "But as God is faithful, our word toward you was not “Yes and no.”" and "For however many are the promises of God, in him is the “Yes.”" (1:18, 20; pack anchor 1:20).
- KEEP `trust-in-god` — "that we should not trust in ourselves, but in God who raises the dead" (1:9).
- KEEP `trinity` — "he who establishes us with you in Christ and anointed us is God, who also sealed us and gave us the down payment of the Spirit in our hearts" (1:21–22; pack anchor 1:21–22; PR #43 use ratified by Jesse 2026-08-25).
- ADD `comforting-others` (engine id) — the chapter teaches the passing-on of comfort as its opening substance, not a passing mention: "that we may be able to comfort those who are in any affliction, through the comfort with which we ourselves are comforted by God" (1:4); "But if we are afflicted, it is for your comfort and salvation." (1:6); "since you are partakers of the sufferings, so you are also of the comfort" (1:7). The pack itself anchors 2 Cor 1:4 as a verse-scoped sibling inside `god-of-all-comfort`'s 1:3–4 span ("the verse's own second clause IS this register" — pack comment). Both-tags ruling (§11.2): God-comforting and comfort-passed-on both genuinely present.
- Drops: none.

### 2. Anchor-extension candidates
- none — every tag above coincides with an existing curated anchor or needs none (`comforting-others` already anchors 2 Cor 1:4; `trust-in-god`'s 1:9 substance is carried by `pastoral-hope-in-despair`'s 1:8–10 anchor for retrieval).

### 3. Lexicon candidates
- `god-of-all-comfort` — "God comforts us so we can comfort others"; "the Father of mercies"; "comfort in trouble" (1:3–4 is the source text; pack lexicon currently stops at "comfort in affliction/hard times"). Tokenizer caution carried from `comforting-others`' pack comment: bare {comfort} is this pack's deliberate bare word — curation owns the collision check.

### 4. New-concept candidates
- none — no measured gap; chapter's themes all have honest homes.

### 5. Decline-overturn proposals
- none.

### 6. Ceiling / subdivision marker
- SUBDIVIDED in book doc (1:1–2 / 1:3–11 / 1:12–24) → flag for per-verse refinement pass. Does not hit the 8-tag ceiling (7).

## 2 Corinthians 2 — swept 2026-08-26

Prior tags 4 → after deltas 4 (0 adds, 4 keeps, 0 drops).

### 1. Applied-tag deltas
- KEEP `forgiving-others` — "you should rather forgive him and comfort him, lest by any means such a one should be swallowed up with his excessive sorrow" (2:7); "Therefore I beg you to confirm your love toward him." (2:8); Paul forgiving alongside them (2:10).
- KEEP `resisting-the-devil` — "that no advantage may be gained over us by Satan, for we are not ignorant of his schemes" (2:11).
- KEEP `victory-in-christ` — "Now thanks be to God who always leads us in triumph in Christ" (2:14).
- KEEP `church-discipline` — the restoration half of the discipline arc: "This punishment which was inflicted by the many is sufficient for such a one" (2:6), then forgive, comfort, confirm love (2:7–8); pack anchor 2:5–11.
- Drops: none.

### 2. Anchor-extension candidates
- `resisting-the-devil` — 2 Corinthians 2:11 — "that no advantage may be gained over us by Satan, for we are not ignorant of his schemes" — proposed weight 0.8. Pack currently anchors only James 4:7 and 1 Peter 5:8-9; 2:11 is the schemes-awareness register its lexicon family implies. Cross-note: the ch. 11 `satan` extension below is the disguise register — different pack, no double-claim of a span.

### 3. Lexicon candidates
- `resisting-the-devil` — "the devil's schemes"; "satan's schemes"; "outwitted by satan" (2:11 is the anchor text; pack lexicon has bare "satan"/"the devil" but not the schemes phrasing).

### 4. New-concept candidates
- none. The aroma-of-Christ motif (2:14–16 — "we are a sweet aroma of Christ to God") is real but not a plausible search-scale concept; noted as motif only, home `sharing-your-faith`/`victory-in-christ` at most.

### 5. Decline-overturn proposals
- none.

### 6. Ceiling / subdivision marker
- SUBDIVIDED in book doc (2:1–11 / 2:12–17) → flag for per-verse refinement pass. Well under ceiling (4).

## 2 Corinthians 3 — swept 2026-08-26

Prior tags 3 → after deltas 5 (2 adds, 3 keeps, 0 drops).

### 1. Applied-tag deltas
- KEEP `covenant` — "servants of a new covenant, not of the letter but of the Spirit" (3:6), set against "the reading of the old covenant" (3:14).
- KEEP `image-of-god` — "But we all, with unveiled face seeing the glory of the Lord as in a mirror, are transformed into the same image from glory to glory" (3:18; pack anchor 3:18).
- KEEP `spiritual-growth` — the ongoing transformation "from glory to glory, even as from the Lord, the Spirit" (3:18).
- ADD `holy-spirit` (engine id) — the chapter's argument is the Spirit's new-covenant ministry, stated as teaching substance throughout, not a passing mention: "written not with ink, but with the Spirit of the living God" (3:3); "For the letter kills, but the Spirit gives life." (3:6); "won’t service of the Spirit be with much more glory?" (3:8); "Now the Lord is the Spirit; and where the Spirit of the Lord is, there is liberty." (3:17); transformation "even as from the Lord, the Spirit" (3:18). Register check done against the pack: its who-is/filled-with lexicon would not reach this chapter today (see extensions/lexicon below), but the presence bar is the chapter's substance, which is squarely the Spirit's work.
- ADD `glory-of-god` (engine id) — glory is the chapter's argued contrast, not decoration: "if the service of death, written engraved on stones, came with glory... won’t service of the Spirit be with much more glory?" (3:7–8); "For if the service of condemnation has glory, the service of righteousness exceeds much more in glory." (3:9); "seeing the glory of the Lord as in a mirror" (3:18). Pack read: its own 2 Cor anchor is 4:6; ch. 3 is the surpassing-glory argument that sets it up.
- Drops: none.

### 2. Anchor-extension candidates
- `holy-spirit` — 2 Corinthians 3:6 — "who also made us sufficient as servants of a new covenant, not of the letter but of the Spirit. For the letter kills, but the Spirit gives life." — proposed weight 0.8. Would be the pack's FIRST Pauline anchor (all current anchors are Acts/Luke/John/Joel/Ezekiel). Secondary span if curation prefers: 3:17–18 (the Lord-is-the-Spirit / liberty / transformation cluster).
- `glory-of-god` — 2 Corinthians 3:7-11 — "For if the service of condemnation has glory, the service of righteousness exceeds much more in glory." (3:9) — proposed weight 0.75. Deliberately NOT 3:18, which stays `image-of-god`'s anchor (cross-note; no double-claim proposed — the transformed-into-the-image register is that pack's).

### 3. Lexicon candidates
- `holy-spirit` — "the letter kills but the spirit gives life"; "where the spirit of the lord is there is freedom"; "the spirit gives life" (3:6, 17 — heavily remembered phrasings with no current lexicon home in the pack).
- `covenant` — "old covenant vs new covenant"; "what is the new covenant"; "servants of a new covenant" (3:6, 14 — pack lexicon has "the new covenant" but not the contrastive phrasing users type).

### 4. New-concept candidates
- none. The veil-over-hearts motif (3:14–16) is served by the chapter tags; "the veil is taken away" is not an independent search-scale concept.

### 5. Decline-overturn proposals
- none.

### 6. Ceiling / subdivision marker
- Kept whole in book doc (one continuous argument; two BSB headings handled in clauses) — no marker. Under soft cap (5).

## 2 Corinthians 4 — swept 2026-08-26

Prior tags 7 → after deltas 7 (0 adds, 7 keeps, 0 drops). Two honest candidates were declined (Decisions #4) — candidates exceeded chapter capacity; flagged for refinement.

### 1. Applied-tag deltas
- KEEP `do-not-lose-heart` — the chapter's own frame: "we don’t faint" opening and closing the argument (4:1, 16; pack anchors 4:8–10, 4:16–18).
- KEEP `pastoral-strength-in-weakness` — "But we have this treasure in clay vessels, that the exceeding greatness of the power may be of God and not from ourselves." (4:7).
- KEEP `suffering-for-christ` — "We are pressed on every side, yet not crushed; perplexed, yet not to despair; pursued, yet not forsaken; struck down, yet not destroyed" (4:8–9); "always delivered to death for Jesus’ sake" (4:11).
- KEEP `resurrection` — "knowing that he who raised the Lord Jesus will raise us also through Jesus, and will present us with you" (4:14).
- KEEP `pastoral-serious-illness` — "though our outward person is decaying, yet our inward person is renewed day by day" (4:16; pack anchor 4:16–18).
- KEEP `why-god-allows-suffering` — "For our light affliction, which is for the moment, works for us more and more exceedingly an eternal weight of glory" (4:17; pack anchor 4:17–18).
- KEEP `the-breath-of-life` — the inner/outer-person distinction: 4:16 with "we don’t look at the things which are seen, but at the things which are not seen" (4:18; pack anchor 4:16; map caveat carried in book doc).
- Drops: none.

### 2. Anchor-extension candidates
- `pastoral-strength-in-weakness` — 2 Corinthians 4:7 — "But we have this treasure in clay vessels, that the exceeding greatness of the power may be of God and not from ourselves." — proposed weight 0.85. Pack anchors only 12:9-10 in this book; 4:7 is the same teaching ahead of its ch. 12 summit and is the chapter tag's ground.
- `light-and-darkness` — 2 Corinthians 4:4-6 — "seeing it is God who said, “Light will shine out of darkness,” who has shone in our hearts to give the light of the knowledge of the glory of God in the face of Jesus Christ." (4:6), against "the god of this world has blinded the minds of the unbelieving" (4:4) — proposed weight 0.75. Pack is currently all-Johannine; DUAL-anchor note required: `glory-of-god` already anchors 4:6 (its in-corpus 2 Cor keystone) — this claim is the light-vs-blindness register, that one the beheld-glory register; record in both files if adopted (Rom 12:15 / Phil 4:8 sibling precedent).

### 3. Lexicon candidates
- `pastoral-strength-in-weakness` — "treasure in jars of clay"; "clay vessels"; "jars of clay meaning" (4:7 — the NIV-remembered "jars of clay" phrasing has no home; WEB reads "clay vessels").
- `why-god-allows-suffering` — "eternal weight of glory"; "light and momentary troubles"; "what is suffering achieving" (4:17 — the first two are heavy remembered phrasings, the WEB and NIV forms respectively).

### 4. New-concept candidates
- none.

### 5. Decline-overturn proposals
- none.

### 6. Ceiling / subdivision marker
- Kept whole in book doc, but FLAG for per-verse refinement: sitting tags (7) plus honest candidates (`glory-of-god` 4:4–6, 15, 17; `light-and-darkness` 4:4–6) exceed the 8-ceiling's capacity; both candidates were yielded as theme-witness-within-another-argument (§11.6 class 2) and survive above as anchor-extension candidates with exact ranges — the refinement pass should confirm the verse-range homes.

## 2 Corinthians 5 — swept 2026-08-26

Prior tags 7 → after deltas 7 (0 adds, 7 keeps, 0 drops).

### 1. Applied-tag deltas
- KEEP `new-creation` — "Therefore if anyone is in Christ, he is a new creation. The old things have passed away. Behold, all things have become new." (5:17; pack anchor 5:17).
- KEEP `the-cross` — "one died for all, therefore all died" (5:14) and "For him who knew no sin he made to be sin on our behalf, so that in him we might become the righteousness of God." (5:21; pack anchor 5:21).
- KEEP `salvation` — "God was in Christ reconciling the world to himself, not reckoning to them their trespasses" ... "be reconciled to God" (5:19–20).
- KEEP `judgment-seat-of-christ` — "For we must all be revealed before the judgment seat of Christ that each one may receive the things in the body according to what he has done, whether good or bad." (5:10; pack anchor 5:10).
- KEEP `sharing-your-faith` — "gave to us the ministry of reconciliation" (5:18); "We are therefore ambassadors on behalf of Christ, as though God were entreating by us" (5:20; pack anchor 5:18–20).
- KEEP `faith` — "for we walk by faith, not by sight" (5:7).
- KEEP `death-of-a-believer` — "if the earthly house of our tent is dissolved, we have a building from God, a house not made with hands, eternal, in the heavens" (5:1); "willing rather to be absent from the body and to be at home with the Lord" (5:8).
- Drops: none. (`justification-by-faith` on 5:21 stays off — Decisions #6.)

### 2. Anchor-extension candidates
- `faith` — 2 Corinthians 5:7 — "for we walk by faith, not by sight" — proposed weight 0.85. Pack anchors only Heb 11:6 and Rom 10:17; 5:7 is among the most-quoted faith texts and currently unreachable by the pack's lexicon (see below).
- `mortality` — 2 Corinthians 5:1-4 — "we who are in this tent do groan, being burdened... that what is mortal may be swallowed up by life" (5:4) — proposed weight 0.8. Pack has no 2 Cor anchor; SIBLING note required: `pastoral-serious-illness` anchors 5:1 and 5:6–8 (the comfort register); this claim is the mortal-body register. Record in both files if adopted.

### 3. Lexicon candidates
- `faith` — "walk by faith not by sight"; "walking by faith"; "faith not sight" (5:7).
- `new-creation` — "old things have passed away"; "all things become new"; "new creation in christ" (5:17 — pack lexicon carries "new creation" but not the passed-away/become-new remembered halves).
- `sharing-your-faith` — "ministry of reconciliation"; "be reconciled to god"; "we are ambassadors for christ" (5:18–20 — lexicon has "ambassadors for christ" already; the reconciliation phrasings are unserved. Supporting evidence for the Philemon block's recorded decline, which anticipated exactly this: "if fixtures later show Matt 5:23–24 / 2 Cor 5:18–20 queries missing, revisit as a lexicon extension... rather than a new id" — this row is that lexicon route, on the God-ward pack where 5:18–20 already lives; NOT an overturn).

### 4. New-concept candidates
- none — the great-exchange text (5:21) is `the-cross`'s anchored territory; self-judgment/appearing texts are `judgment-seat-of-christ`'s.

### 5. Decline-overturn proposals
- none (see the `sharing-your-faith` lexicon row above: it works WITH the Philemon-block decline, not against it).

### 6. Ceiling / subdivision marker
- SUBDIVIDED in book doc (5:1–10 / 5:11–21) → flag for per-verse refinement pass. At 7 of 8 — dense; refinement should assign verse ranges (5:1–10 death/mortality cluster vs 5:11–21 reconciliation cluster).

## 2 Corinthians 6 — swept 2026-08-26

Prior tags 5 → after deltas 5 (0 adds, 5 keeps, 0 drops).

### 1. Applied-tag deltas
- KEEP `salvation` — "Behold, now is the acceptable time. Behold, now is the day of salvation." (6:2).
- KEEP `suffering-for-christ` — "commending ourselves as servants of God: in great endurance, in afflictions, in hardships, in distresses, in beatings, in imprisonments" (6:4–5).
- KEEP `holiness` — "“‘Come out from among them, and be separate,’ says the Lord. ‘Touch no unclean thing." (6:17).
- KEEP `presence-of-god` — "I will dwell in them and walk in them. I will be their God and they will be my people." (6:16).
- KEEP `unequally-yoked` (adopted display id) — "Don’t be unequally yoked with unbelievers, for what fellowship do righteousness and iniquity have?" (6:14), stated of fellowship with unbelief broadly, no marriage claim (book-doc decision 11 wording preserved).
- Drops: none.

### 2. Anchor-extension candidates
- `the-house-of-god` — 2 Corinthians 6:16 — "For you are a temple of the living God. Even as God said, “I will dwell in them and walk in them." — proposed weight 0.8. Pack's believers-as-temple register already exists (Eph 2:21-22 anchor); 6:16 is its 2 Corinthians statement. Cross-note to roster row 47 (below) — this is a distinct register from that row's separation theme.
- `suffering-for-christ` — 2 Corinthians 6:4-10 — "in beatings, in imprisonments, in riots, in labors, in watchings, in fastings" (6:5); "as dying and behold—we live" (6:9) — proposed weight 0.75. Pack's only 2 Cor anchor is 1:5; this is the first of the letter's two hardship catalogs.

### 3. Lexicon candidates
- ROUTED, not logged: "unequally yoked", "marrying an unbeliever", "dating a non-believer" belong to corpus-blocked roster row 47 (`unequally-yoked`, SKIPPED-blocked: 2 Cor 6:14-18 absent from fixture corpus; holiness/love-not-the-world extension check + both register caveats carried there). Route: corpus-blocked roster row 47 — nothing duplicated here.

### 4. New-concept candidates
- none.

### 5. Decline-overturn proposals
- none.

### 6. Ceiling / subdivision marker
- SUBDIVIDED in book doc (6:1–13 / 6:14–18) → flag for per-verse refinement pass. Under soft cap (5).

## 2 Corinthians 7 — swept 2026-08-26

Prior tags 5 → after deltas 5 (0 adds, 5 keeps, 0 drops).

### 1. Applied-tag deltas
- KEEP `repentance` — "For godly sorrow produces repentance leading to salvation, which brings no regret. But the sorrow of the world produces death." (7:10; pack anchor 7:10).
- KEEP `god-of-all-comfort` — "Nevertheless, he who comforts the lowly, God, comforted us by the coming of Titus" (7:6).
- KEEP `holiness` — "let’s cleanse ourselves from all defilement of flesh and spirit, perfecting holiness in the fear of God" (7:1; pack anchor 7:1).
- KEEP `joy-in-the-lord` — "I am filled with comfort. I overflow with joy in all our affliction." (7:4); "I rejoiced still more" (7:7); "we rejoiced the more exceedingly for the joy of Titus" (7:13).
- KEEP `church-discipline` — the severe letter's fruit: "you were grieved to repentance" (7:9); "what earnest care it worked in you. Yes, what defense, indignation, fear, longing, zeal, and vindication!" (7:11; pack anchor 7:8–12).
- Drops: none.

### 2. Anchor-extension candidates
- `god-of-all-comfort` — 2 Corinthians 7:6-7 — "he who comforts the lowly, God, comforted us by the coming of Titus, and not by his coming only, but also by the comfort with which he was comforted in you" — proposed weight 0.7. Pack's only anchor in this letter is 1:3–4; 7:6 shows the comfort arriving through a person's coming — a distinct, searched register ("God sent someone to encourage me").

### 3. Lexicon candidates
- `repentance` — "godly sorrow vs worldly sorrow"; "guilt vs conviction"; "how do I know my repentance is real" (7:8–11; pack lexicon carries bare "godly sorrow" — the comparative forms users actually type are unserved).

### 4. New-concept candidates
- none.

### 5. Decline-overturn proposals
- none.

### 6. Ceiling / subdivision marker
- Kept whole in book doc — no marker. Under soft cap (5).

## 2 Corinthians 8 — swept 2026-08-26

Prior tags 2 → after deltas 2 (0 adds, 2 keeps, 0 drops). Honest-and-low: the chapter is one sustained giving appeal plus a delegation commendation; no forced tags.

### 1. Applied-tag deltas
- KEEP `generosity` — "how in a severe ordeal of affliction, the abundance of their joy and their deep poverty abounded to the riches of their generosity" (8:2); "see that you also abound in this grace" (8:7); motive: "though he was rich, yet for your sakes he became poor, that you through his poverty might become rich" (8:9).
- KEEP `honesty` — "We are avoiding this, that any man should blame us concerning this abundance which is administered by us." (8:20); "Having regard for honorable things, not only in the sight of the Lord, but also in the sight of men." (8:21).
- Drops: none.

### 2. Anchor-extension candidates
- `generosity` — 2 Corinthians 8:1-9 — "they gave of their own accord" (8:3); "first they gave their own selves to the Lord" (8:5); "though he was rich, yet for your sakes he became poor" (8:9) — proposed weight 0.85. Pack's 2 Cor anchors are ch. 9 only (9 chapter-level + 9:7); ch. 8 carries the Macedonian model and the letter's grace-motive center. DOCTRINAL-BASIS §3 note carried: 8:9 is the motive of grace, never a mechanism of exchange for the giver's enrichment (book-doc decision 14 wording).

### 3. Lexicon candidates
- `generosity` — "what does the bible say about giving"; "giving when money is tight"; "give according to what you have" (8:2–3, 12 — "For if the readiness is there, it is acceptable according to what you have, not according to what you don’t have.").

### 4. New-concept candidates
- none. Financial transparency in ministry (8:18–21) was weighed: real theme, but "church financial accountability" is administered-trust material honestly carried by `honesty`'s tag and the 8:20–21 quote; not search-scale beyond that. Engine-side entrusted-resources register is corpus-blocked roster row 16 (`stewardship`) — route: corpus-blocked roster row 16, nothing duplicated.

### 5. Decline-overturn proposals
- none.

### 6. Ceiling / subdivision marker
- SUBDIVIDED in book doc (8:1–15 / 8:16–24) → flag for per-verse refinement pass. Far under cap (2).

## 2 Corinthians 9 — swept 2026-08-26

Prior tags 3 → after deltas 4 (1 add, 3 keeps, 0 drops).

### 1. Applied-tag deltas
- KEEP `generosity` — "Let each man give according as he has determined in his heart, not grudgingly or under compulsion, for God loves a cheerful giver." (9:7; pack anchor 9:7 + ch. 9).
- KEEP `gods-provision` — "And God is able to make all grace abound to you, that you, always having all sufficiency in everything, may abound to every good work." (9:8); "he who supplies seed to the sower and bread for food" (9:10).
- KEEP `thanksgiving` — giving "which produces thanksgiving to God through us" (9:11), "abounds also through much giving of thanks to God" (9:12), closing in "Now thanks be to God for his unspeakable gift!" (9:15).
- ADD `sowing-and-reaping` (adopted display id) — the principle stated as the chapter's own teaching: "Remember this: he who sows sparingly will also reap sparingly. He who sows bountifully will also reap bountifully." (9:6), with the seed metaphor carried through — "supply and multiply your seed for sowing, and increase the fruits of your righteousness" (9:10). Guardrail written into this justification per the row's own doctrinal flag and DOCTRINAL-BASIS §3: the harvest the passage names is grace, sufficiency for every good work, righteousness-fruits, and thanksgiving to God (9:8–12) — the moral/spiritual principle, never seed-faith return-on-giving. See Decisions #9.
- Drops: none.

### 2. Anchor-extension candidates
- `gods-provision` — 2 Corinthians 9:8-11 — "God is able to make all grace abound to you, that you, always having all sufficiency in everything, may abound to every good work" — proposed weight 0.8. Pack's only Pauline anchor is Philippians; this is the giver-sufficiency register.
- Rider note (no engine pack to extend): `sowing-and-reaping` has no pack at e762d1c (adopted display id; not among the 50 corpus-blocked roster rows — its rollout disposition sits in the batch ledger). Whenever its engine disposition resolves, 2 Cor 9:6 and 9:10 are anchor material, and the exact WEB phrase "he who sows sparingly will also reap sparingly" plus "sow generously" belong in its lexicon — with the Galatians-staging doctrinal flag carried ("never... seed-faith return-on-giving framing").

### 3. Lexicon candidates
- `generosity` — "cheerful giver verse"; "give not under compulsion"; "reluctant giver" (9:7 — pack has "god loves a cheerful giver"; the decision-of-the-heart phrasings are unserved).

### 4. New-concept candidates
- none.

### 5. Decline-overturn proposals
- none.

### 6. Ceiling / subdivision marker
- Kept whole in book doc — no marker. Under soft cap (4).

## 2 Corinthians 10 — swept 2026-08-26

Prior tags 3 → after deltas 4 (1 add, 3 keeps, 0 drops). Two candidates declined (Decisions #10–11).

### 1. Applied-tag deltas
- KEEP `victory-in-christ` — "for the weapons of our warfare are not of the flesh, but mighty before God to the throwing down of strongholds" (10:4; pack anchor 10:4–5).
- KEEP `pleasing-god-not-people` — "For it isn’t he who commends himself who is approved, but whom the Lord commends." (10:18); "But “he who boasts, let him boast in the Lord.”" (10:17).
- KEEP `giving-an-answer` — "throwing down imaginations and every high thing that is exalted against the knowledge of God" (10:5; pack anchor 10:5; the concept map's never-licenses-combativeness caveat carried, per book doc).
- ADD `thought-life` (engine id) — the pack's own keystone anchor is 2 Corinthians 10:3-5 (weight 1.0, dual with `giving-an-answer`'s 10:5 claim, recorded in both files): "bringing every thought into captivity to the obedience of Christ" (10:5). The chapter teaches the discipling of thoughts as the shape of Paul's warfare — the register the pack was minted for ("take every thought captive" is its lexicon). Both-tags ruling: three registers on 10:3–5 (triumph / apologetic / thought-discipline), each with its own pack claim already curated.
- Drops: none.

### 2. Anchor-extension candidates
- none — `thought-life` (10:3-5), `victory-in-christ` (10:4-5), `giving-an-answer` (10:5), and `contentment` (10:12, supporting-diagnosis anchor, not tag-worthy per book-doc decision 7) already hold this chapter's claims.

### 3. Lexicon candidates
- `victory-in-christ` — "spiritual strongholds"; "tear down strongholds"; "weapons of our warfare" (10:4 — pack anchors the verses but its lexicon carries none of the strongholds family).

### 4. New-concept candidates
- Feeds the `boasting-in-the-lord` candidate logged under ch. 11 (10:12–18 is the boundary-boasting argument; 10:17 the thesis).

### 5. Decline-overturn proposals
- none.

### 6. Ceiling / subdivision marker
- Kept whole in book doc — no marker. Under soft cap (4).

## 2 Corinthians 11 — swept 2026-08-26

Prior tags 4 → after deltas 4 (0 adds, 4 keeps, 0 drops).

### 1. Applied-tag deltas
- KEEP `resisting-the-devil` — "as the serpent deceived Eve in his craftiness, so your minds might be corrupted" (11:3); "for even Satan masquerades as an angel of light" (11:14).
- KEEP `suffering-for-christ` — "in labors more abundantly, in prisons more abundantly, in stripes above measure, and in deaths often" (11:23); "Three times I suffered shipwreck" (11:25); "in hunger and thirst, in fastings often, and in cold and nakedness" (11:27).
- KEEP `false-teachers` (adopted display id) — "For such men are false apostles, deceitful workers, masquerading as Christ’s apostles." (11:13), preachers of "another Jesus whom we didn’t preach" (11:4).
- KEEP `no-other-gospel` — "a different “good news” which you didn’t accept" (11:4; pack anchors 11:4, 11:13–14 — the message-finality register beside `false-teachers`' deceiver register, both-tags ruling).
- Drops: none.

### 2. Anchor-extension candidates
- `satan` — 2 Corinthians 11:14 — "And no wonder, for even Satan masquerades as an angel of light." — proposed weight 0.85. The pack (who-Satan-is register: Job 1–2, John 8:44, Rev 12:9-10) has no disguise text; 11:14 is THE angel-of-light verse users search. Cross-note: `resisting-the-devil`'s proposed 2:11 extension is the schemes register — two packs, two registers, no shared span.
- `suffering-for-christ` — 2 Corinthians 11:23-28 — "in labors more abundantly, in prisons more abundantly, in stripes above measure" (11:23), through "anxiety for all the assemblies" (11:28) — proposed weight 0.9. The letter's definitive hardship catalog; pack's only 2 Cor anchor is 1:5.

### 3. Lexicon candidates
- `satan` — "angel of light"; "satan disguises himself"; "can the devil look good" (11:14).
- `suffering-for-christ` — "Paul's sufferings"; "what did Paul suffer"; "hardships of the apostle Paul" (11:23–28).

### 4. New-concept candidates
- **`boasting-in-the-lord` (or `boasting`)** — the boasting question is the argued substance of three consecutive chapters: "But “he who boasts, let him boast in the Lord.”" (10:17); "Seeing that many boast after the flesh, I will also boast." (11:18); "If I must boast, I will boast of the things that concern my weakness." (11:30); "On behalf of such a one I will boast, but on my own behalf I will not boast, except in my weaknesses." (12:5). Realistic queries: "what does the bible say about boasting"; "boast in the Lord meaning"; "is bragging a sin". Dedupe done against all 303 ids (no boast* id anywhere; `humble-exaltation` is God's response to pride, `pleasing-god-not-people` the approval register — neither serves plain boasting queries), against the §3 declines (no boasting entry; the §3.1 "pride" routing is `humble-exaltation` lexicon-tuning, a different register), and against the 50-row corpus-blocked roster (absent). Cross-book anchor material for curation: 1 Cor 1:31; Gal 6:14; Jer 9:23-24. Engine measurement is curation's per plan §3.3 (expect possible NO MEASURABLE EFFECT once bare lexical retrieval of 10:17 is counted — the fixture decides).

### 5. Decline-overturn proposals
- none.

### 6. Ceiling / subdivision marker
- SUBDIVIDED in book doc (11:1–15 / 11:16–33) → flag for per-verse refinement pass. Under soft cap (4).

## 2 Corinthians 12 — swept 2026-08-26

Prior tags 6 → after deltas 6 (0 adds, 6 keeps, 0 drops).

### 1. Applied-tag deltas
- KEEP `pastoral-strength-in-weakness` — "He has said to me, “My grace is sufficient for you, for my power is made perfect in weakness.”" (12:9; pack keystone anchor 12:9–10).
- KEEP `prayer` — "Concerning this thing, I begged the Lord three times that it might depart from me." (12:8), answered with grace rather than removal (12:9).
- KEEP `dreams-and-visions` — "I will come to visions and revelations of the Lord" (12:1); "caught up into the third heaven" (12:2); "caught up into Paradise" (12:4).
- KEEP `suffering-for-christ` — "Therefore I take pleasure in weaknesses, in injuries, in necessities, in persecutions, and in distresses, for Christ’s sake." (12:10).
- KEEP `pastoral-serious-illness` — "a thorn in the flesh was given to me: a messenger of Satan to torment me" (12:7), met by sufficient grace (12:9; pack anchor 12:9–10).
- KEEP `unanswered-prayer` — "I begged the Lord three times that it might depart from me" and the thorn stayed while grace was given (12:8–9; pack keystone anchor 12:8–9; both-tags with `prayer` per the 2026-08-25 apply pass).
- Drops: none.

### 2. Anchor-extension candidates
- `dreams-and-visions` — 2 Corinthians 12:1-4 — "It is doubtless not profitable for me to boast, but I will come to visions and revelations of the Lord." (12:1); "caught up into Paradise" (12:4) — proposed weight 0.75. Pack has no Pauline-experience anchor (all narrative/OT/Acts); this is the NT's most-searched vision text outside Acts.
- `signs-and-wonders` — 2 Corinthians 12:12 — "Truly the signs of an apostle were worked among you in all perseverance, in signs and wonders and mighty works." — proposed weight 0.65. Pack is Acts/John only; this is the apostolic-signs register named in one verse (too thin for a tag — Decisions #12 — but honest anchor material).

### 3. Lexicon candidates
- `pastoral-strength-in-weakness` — "thorn in the flesh"; "when I am weak then I am strong"; "God's power in my weakness" (12:7–10 — the pack's lexicon carries the grace/power phrasings but NOT "thorn in the flesh", the single most-typed query for this passage).
- `dreams-and-visions` — "third heaven"; "caught up to paradise"; "did Paul go to heaven" (12:2–4).
- `unanswered-prayer` — "god said no to my prayer"; "when god says no"; "prayed and nothing changed" (12:8–9 — pack lexicon is all why-doesn't-he-answer phrasings; the God-answered-no register is this text's own).

### 4. New-concept candidates
- none beyond the ch. 11 `boasting-in-the-lord` row (12:1–10 supplies its weakness-boasting refs).

### 5. Decline-overturn proposals
- none.

### 6. Ceiling / subdivision marker
- SUBDIVIDED in book doc (12:1–10 / 12:11–21, first range adapted from BSB) → flag for per-verse refinement pass. At 6 (soft cap).

## 2 Corinthians 13 — swept 2026-08-26

Prior tags 5 → after deltas 5 (0 adds, 5 keeps, 0 drops).

### 1. Applied-tag deltas
- KEEP `assurance-of-salvation` — "Examine your own selves, whether you are in the faith. Test your own selves. Or don’t you know about your own selves, that Jesus Christ is in you?—unless indeed you are disqualified." (13:5).
- KEEP `harmony-with-others` — "Be of the same mind. Live in peace, and the God of love and peace will be with you." (13:11).
- KEEP `benediction` — "The grace of the Lord Jesus Christ, God’s love, and the fellowship of the Holy Spirit be with you all." (13:14) — one of Scripture's most-used closing blessings (PR #43 use ratified 2026-08-25).
- KEEP `trinity` — the Lord Jesus Christ, God, and the Holy Spirit named side by side in the closing blessing (13:14; the pack's header records 2 Cor 13:14 as a corpus-deferred wanted anchor; PR #43 use ratified 2026-08-25).
- KEEP `church-discipline` — formal notice for the third visit: "“At the mouth of two or three witnesses shall every word be established.”" (13:1); "if I come again, I will not spare" (13:2); "according to the authority which the Lord gave me for building up and not for tearing down" (13:10).
- Drops: none.

### 2. Anchor-extension candidates
(Corpus caveat on all four: 2 Corinthians 13 is outside the 213-chapter fixture corpus at e762d1c — these anchors become assertable/measurable only with PR-β corpus expansion; recorded for curation with that gate named.)
- `assurance-of-salvation` — 2 Corinthians 13:5 — "Examine your own selves, whether you are in the faith. Test your own selves." — proposed weight 0.85. The pack's "am i really saved" lexicon has no self-examination command text.
- `benediction` — 2 Corinthians 13:14 — "The grace of the Lord Jesus Christ, God’s love, and the fellowship of the Holy Spirit be with you all." — proposed weight 0.9. Already a recorded shared want ("shared want with the benediction pack" — trinity.yaml header); this row confirms it from the sweep side.
- `trinity` — 2 Corinthians 13:14 — same verse — proposed weight 0.85. The pack's own header defers exactly this anchor to the re-pin payload; sweep concurs.
- `church-discipline` — 2 Corinthians 13:1-2 — "if I come again, I will not spare" (13:2) with the two-or-three-witnesses rule (13:1) — proposed weight 0.65. Completes the pack's 2 Cor discipline arc (2:5–11 restoration; 7:8–12 fruit; 13:1–2 due process and warning).

### 3. Lexicon candidates
- `assurance-of-salvation` — "examine yourselves whether you are in the faith"; "test yourself faith"; "how do I know Christ is in me" (13:5).
- `benediction` — "the grace of the lord jesus christ and the love of god"; "may the grace of our lord jesus christ be with you"; "closing prayer bible verse" (13:14 — pack lexicon is Aaronic-blessing-shaped; the Pauline triple formula is unserved).

### 4. New-concept candidates
- none.

### 5. Decline-overturn proposals
- none.

### 6. Ceiling / subdivision marker
- SUBDIVIDED in book doc (13:1–10 / 13:11–14) → flag for per-verse refinement pass. Under soft cap (5).

---

# Decisions record — sweep judgment calls (every yield and judgment call; each reversible on Jesse's word)

1. **No drops anywhere.** All 60 sitting tag applications from the book doc (critic-approved 2026-08-23; tag-apply and PR #51 passes 2026-08-25) were re-checked against the pinned text and the presence bar; every one stands. Zero silent drops; zero explicit drops.
2. **`comforting-others` added to ch. 1** (→7 tags). Both-tags ruling beside `god-of-all-comfort`: the pack's own 2 Cor 1:4 verse-scoped sibling anchor and register comment ("the HUMAN practice of comforting... beside god-of-all-comfort") say the two registers are curated as siblings on this very span; 1:4, 1:6–7 carry the passing-on substance.
3. **`holy-spirit` and `glory-of-god` added to ch. 3** (→5). The Spirit is the chapter's argued minister (3:3, 6, 8, 17, 18) and the surpassing glory its argued contrast (3:7–11, 18). Register caution recorded: `holy-spirit`'s lexicon is who-is/filled-with-shaped — the tag rests on the presence bar (chapter substance), the retrieval gap on the ch. 3 lexicon/anchor candidates. 3:18 left with `image-of-god` (no dual claim proposed).
4. **`glory-of-god` and `light-and-darkness` NOT added to ch. 4** — §11.6 yield, class theme-witness-inside-another-argument: chapter sits at 7 with both candidates honest (glory: 4:4, 6, 15, 17; light: 4:4–6), which would breach the 8-ceiling's spirit of main-themes-first. Both survive as anchor-extension candidates with exact ranges; ch. 4 flagged for the per-verse refinement pass. `glory-of-god`'s existing 4:6 anchor already serves retrieval there.
5. **`death-of-a-believer` vs `mortality` on ch. 5:** the sitting adopted tag keeps the chapter; `mortality` (engine) proposed as anchor extension 5:1-4 only, sibling-noted against `pastoral-serious-illness`'s 5:1, 5:6–8 anchors — not tagged, to avoid broad-duplicating-specific at 7 tags.
6. **`justification-by-faith` on 5:21 stays off** (book-doc decision 5 upheld): single-verse imputation clause inside `the-cross`'s anchored span; chapter at 7. PR #43 id, flagged-though-unused status unchanged.
7. **`receiving-correction` NOT tagged on ch. 7** despite the model reception of correction (7:8–11): the pack's own boundary comment fences this material out — "2 Corinthians' church-discipline register... is a different register from personal teachability, per the row's adjacency note." Pack comment honored; `church-discipline` + `repentance` carry the substance.
8. **`incarnation` on 8:9 stays off** (book-doc decision 6 upheld); `stewardship` on 8:18–21 declined and ROUTED to corpus-blocked roster row 16 (entrusted-resources register, corpus-blocked; `honesty` carries the administration substance as display).
9. **`sowing-and-reaping` added to ch. 9** (→4). The adopted row's frame is the cross-testament moral-consequence principle (Hos 8:7; Gal 6:7–9; Prov 22:8) and 9:6 states it verbatim as the chapter's teaching. The row's own doctrinal flag ("never... seed-faith return-on-giving framing — the exclusion docs/DOCTRINAL-BASIS.md §3 names") is written into the tag justification: harvest defined by 9:8–12. If Jesse reads the giving context as too near the seed-faith hazard, the reversal is dropping this one tag; the ledger's rider note (ch. 9 §2) stands either way.
10. **`spiritual-warfare` NOT tagged on ch. 10.** The adopted row's register is Daniel's unseen-conflict (princes, Michael), explicitly cross-referenced with `deliverance-from-demons` under a standing "decide one concept or two before minting" flag, and `resisting-the-devil`'s lexicon already carries the bare phrase "spiritual warfare" (recorded lexicon fact). Tagging 10:3–5 would prejudge the open register decision; the verses are carried by `victory-in-christ` (anchor 10:4-5), `thought-life` (keystone 10:3-5), and `giving-an-answer` (10:5). Engine-side: route to corpus-blocked roster row 12. Book-doc decision 9 (no `resisting-the-devil` on ch. 10 — Satan unnamed) also upheld.
11. **`gentleness-of-christ` NOT tagged on 10:1.** The adopted row is the Matt 11:29 / bruised-reed comfort register; 10:1 ("I Paul, myself, entreat you by the humility and gentleness of Christ") is a single-verse appeal formula citing the attribute, not the chapter teaching it. Thin single-verse yield class.
12. **`signs-and-wonders` NOT tagged on ch. 12** (12:12 single verse, apostolic-authentication aside within the fool's-speech argument); proposed as anchor extension 0.65 instead.
13. **`envy-and-jealousy` still not tagged on 11:2** and **`testing` still not on 13:5** (book-doc decisions 10 and 12 upheld — godly jealousy is covenant protectiveness; 13:5 is self-examination, carried by `assurance-of-salvation`). Zechariah-block precedent noted for 11:2: God-ward jealousy/zeal "must NOT receive" the human-vice pack's refs.
14. **`freedom-in-christ` NOT tagged on 3:17.** Adopted display id whose register is freedom from law/bondage (Gal 5-shaped); 3:17's "there is liberty" is one clause inside the veil argument — thin single-verse. The clause is served by the proposed `holy-spirit` lexicon candidate ("where the spirit of the lord is there is freedom").
15. **`fear-of-the-lord` NOT tagged** (5:11 "Knowing therefore the fear of the Lord, we persuade men"; 7:1 "perfecting holiness in the fear of God") — two isolated motive clauses in different chapters, neither a chapter teaching the fear of the LORD. No candidate row logged (not judged anchor-grade against the pack's OT teaching anchors).
16. **`boldness-in-witness` NOT tagged on ch. 3** (3:12 "we use great boldness of speech" — single clause; the pack's register is prayed-for witness boldness).
17. **`caring-for-aging-parents` (anchor 1:3–4) and `contentment` (anchor 10:12) remain untagged** — book-doc decision 7 upheld: supporting-citation anchors, not chapter teaching substance. 12:14's parents-save-for-children aphorism likewise not tagged (passing financial figure of speech, not parenting teaching).
18. **Corpus-blocked routes taken (3):** ch. 6 `unequally-yoked` engine-side finds → roster row 47; ch. 8 stewardship register → roster row 16; ch. 10 spiritual-warfare register → roster row 12. Nothing duplicated into candidate rows.
19. **New-concept dedupe:** one candidate logged (`boasting-in-the-lord`, ch. 11), dedupe-checked against all 303 legal ids, the §3 declines, and the 50-row roster. All other motifs found homes or fell below search scale.
20. **Decline-overturns: zero.** No recorded decline was contradicted; the ch. 5 `sharing-your-faith` lexicon row explicitly implements (not overturns) the Philemon block's revisit-as-lexicon-extension instruction, cited against its wording.
21. **Ch. 13 anchor extensions carry the corpus gate by name** (2 Cor 13 outside the fixture corpus at e762d1c; assertable only with PR-β) so curation cannot mistake them for immediately-buildable rows. Same discipline: every extension row here is a candidate for the fixtures-first gauntlet path (plan §3.3), never a pack edit from this sweep.

# Summary counts

- Chapters swept: 13/13. Tag deltas: **5 adds** (`comforting-others` ch1; `holy-spirit`, `glory-of-god` ch3; `sowing-and-reaping` ch9; `thought-life` ch10), **60 keeps**, **0 drops**. Post-sweep per-chapter counts: 7/4/5/7/7/5/5/2/4/4/4/6/5 (none at the 8 ceiling).
- Anchor-extension candidates: **20** (ch2: resisting-the-devil 2:11; ch3: holy-spirit 3:6, glory-of-god 3:7-11; ch4: pastoral-strength-in-weakness 4:7, light-and-darkness 4:4-6; ch5: faith 5:7, mortality 5:1-4; ch6: the-house-of-god 6:16, suffering-for-christ 6:4-10; ch7: god-of-all-comfort 7:6-7; ch8: generosity 8:1-9; ch9: gods-provision 9:8-11; ch11: satan 11:14, suffering-for-christ 11:23-28; ch12: dreams-and-visions 12:1-4, signs-and-wonders 12:12; ch13: assurance-of-salvation 13:5, benediction 13:14, trinity 13:14, church-discipline 13:1-2) + 1 rider note (sowing-and-reaping 9:6, 9:10 — no pack to extend yet).
- Lexicon candidates: **16 rows** (ids: god-of-all-comfort, resisting-the-devil, holy-spirit, covenant, pastoral-strength-in-weakness ×2, why-god-allows-suffering, faith, new-creation, sharing-your-faith, repentance, generosity ×2, victory-in-christ, satan, suffering-for-christ, assurance-of-salvation, benediction, dreams-and-visions, unanswered-prayer — counted as rows per chapter sections).
- New-concept candidates: **1** (`boasting-in-the-lord`). Decline-overturn proposals: **0**. Corpus-blocked routes: **3** (rows 47, 16, 12).
- Refinement-pass flags: chs 1, 2, 5, 6, 8, 11, 12, 13 (subdivided in book doc) + ch 4 (candidates exceeded capacity). No chapter hits the 8-tag ceiling.

# Survival audit — 2026-08-26

Per CONVENTIONS §9: every write to this file was an atomic end-of-file append; after each append the pre-existing byte prefix was re-hashed (sha256 over the prior byte length) and verified unchanged, and the new block verified present — 9 appends, 9 PREFIX-INTACT verifications. Final audit at delivery: header + all 13 chapter sections + this Decisions record present in order, each chapter heading present exactly once ("## 2 Corinthians N — swept 2026-08-26" for N=1..13). No other file under /mnt/project-files was touched by this sweep. Every tag id in this ledger validated by exact match against engine-ids.txt (239) / adopted-161.txt (161); every quote copied word-for-word (curly punctuation included) from the sha256-verified pinned engwebp VPL text of the chapter cited.

# Addendum — id-spelling validation (2026-08-26, post-sweep, on coordinator caution)

Coordinator flagged mid-run that the scratchpad `concepts-inventory.md` table prefix-strips the 15 `pastoral-*` engine ids. Confirmed and already handled during the sweep: this ledger's pastoral-family tags were written as the verbatim engine ids `pastoral-hope-in-despair`, `pastoral-strength-in-weakness`, `pastoral-serious-illness` (validated against `engine-ids.txt` before first write). Final mechanical scan after completion: every backticked id in this ledger resolves exactly against engine-ids.txt (239) or adopted-161.txt (161) — the only non-resolving backticked tokens are the two commit/sha strings and the deliberately-new candidate name `boasting-in-the-lord` (ch. 11 §4, a NEW-concept proposal, not a tag). Zero stripped pastoral forms present. Additionally: `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md` EXISTS at audit time (the briefing's prep note recorded it missing — it has since been created); the four adopted ids used as tags in this ledger (`death-of-a-believer`, `unequally-yoked`, `false-teachers`, `sowing-and-reaping`) were cross-checked present in it.

# Erratum — 2026-08-26, fresh-critic pass (4 sustained objections; single atomic end-of-file append per CONVENTIONS §9)

A fresh critic re-verified this ledger's quotes, ids, deltas, caps, and schema clean and sustained four objections. The corrections follow; nothing above this block is rewritten, and where this block conflicts with earlier text, this block governs.

## E1 (moderate) — ch. 5 §3 `sharing-your-faith` lexicon row + Decisions #20: the Philemon-block decline was quoted with its named target elided

The ch. 5 row and Decisions #20 quoted the decline as "revisit as a lexicon extension... rather than a new id", eliding the decline's named target. Unelided, the Philemon block of declines-and-contested.md reads, of believer-to-believer reconciliation: "BORDERLINE, not its own row … a distinct `reconciliation` id would triple-route with [`forgiving-others`, `family-reconciliation`] and `restoration` — if fixtures later show Matt 5:23–24 / 2 Cor 5:18–20 queries missing, revisit as a lexicon extension of `forgiving-others` rather than a new id". (The inner "…" is the source's own punctuation; the omission this erratum corrects is the words "of `forgiving-others`".)

The decline names `forgiving-others` as the lexicon home. The ch. 5 row routes the reconciliation phrasings ("ministry of reconciliation"; "be reconciled to god") to `sharing-your-faith` instead — a different pack. The row's target diverges from the decline's named target. Accordingly, the row's claim that "this row is that lexicon route" and Decisions #20's claim that the row "explicitly implements (not overturns) the Philemon block's revisit-as-lexicon-extension instruction, cited against its wording" are WITHDRAWN as stated; ch. 5 §5's "it works WITH the Philemon-block decline, not against it" gloss is corrected to the same effect. The elided quote concealed the divergence.

Corrected standing of the row: a recorded judgment call, not an implementation of the decline. Rationale for the divergent target, recorded without adjudication: the decline's `forgiving-others` register is believer-to-believer reconciliation, while 2 Cor 5:18–20's reconciliation is God-ward ("be reconciled to God"), and `sharing-your-faith` is the pack that already anchors this span (verified in ontology/concepts/sharing-your-faith.yaml at e762d1c: anchor `2 Corinthians 5:18-20`, weight 0.95, header quote "gave to us the ministry of reconciliation... We are therefore ambassadors on behalf of Christ"). This call is explicitly REVERSIBLE and DEFERRED to the curator/Jesse, who may implement either (a) per the decline's own wording — the phrasings as a lexicon extension of `forgiving-others` — or (b) per this ledger's divergent proposal — on `sharing-your-faith`, where 5:18–20 already lives. This sweep does not adjudicate which wins.

## E2 (moderate) — ch. 12 §3 `unanswered-prayer` row: proposed a phrasing the pack itself records as REJECTED

The row proposed "when god says no". The pack's own header comment (ontology/concepts/unanswered-prayer.yaml at e762d1c) records, verbatim:

    # - "when god says no" REJECTED as a lexicon entry: it normalizes to
    #   {god, say} and would fire this pack on every "what does god say
    #   about X" query (accident class). The query is served by the
    #   concept's other entries and the fixture asserts on a safe phrasing.

Corrections:

- "when god says no" — WITHDRAWN. It is a recorded rejection inside the pack; this ledger offered no new evidence against it.
- "god said no to my prayer" — WITHDRAWN on the same accident class. Applying the rejection note's own normalization ("says" → say; "when"/"no" not significant): "said" → say; "no", "to", "my" drop; leaving {god, say, prayer}. Its distinctive surviving content is the same {god, say} pair the note rejects, and the third token is bare "prayer" — which the pack's tokenizer note deliberately declines to claim ("No bare "prayer" (prayer's own bare word; inventory skip)"). The phrasing would fire this pack on "what does god say about prayer"-shaped queries — the same accident class.
- "prayed and nothing changed" — KEPT. It normalizes to {pray, nothing, change} (only "and" drops): no {god, say} overlap, >= 2 significant tokens, no bare "prayer" entry. It sits outside the accident class the pack's note names, so the note supports keeping it.
- The row's claim that "the God-answered-no register is this text's own" is corrected: 2 Cor 12:8-9 is indeed the pack's keystone anchor for that experience, but the pack already weighed the God-answered-no register's phrasing and REJECTED it on tokenizer grounds. The register was considered and its phrasing declined; the row should not have presented it as unserved-and-unweighed.

## E3 — chs. 8–9: `generosity`'s 2 Corinthians anchor holdings overstated

Ch. 8 §2 claimed "Pack's 2 Cor anchors are ch. 9 only (9 chapter-level + 9:7)" and ch. 9 §1 cited "pack anchor 9:7 + ch. 9". Verified against ontology/concepts/generosity.yaml at e762d1c: the pack carries exactly ONE 2 Corinthians anchor — `ref: 2 Corinthians 9:7` (sources [torrey], weight 1.0). There is no chapter-level 2 Cor 9 anchor; the only other ch.-9 text in the file is a corpus comment ("2 Corinthians 9 not yet in the fixture corpus"). Both claims are corrected to the single 9:7 anchor. Framing effect on the ch. 8 anchor-extension candidate (8:1-9) and the ch. 9 rows: their content, spans, and proposed weights are unchanged; as a matter of fact the pack's 2 Cor representation is one verse-level anchor, thinner than the ledger claimed, so the extension candidates' case is not weakened by this correction. Stated as fact only — no inflation of the proposals.

## E4 (minor) — Addendum self-audit: non-resolving-token enumeration incomplete

The addendum claimed the only non-resolving backticked tokens are the two commit/sha strings and `boasting-in-the-lord`. A mechanical re-scan sustains the audit's substantive finding — every backticked token used as a tag id resolves exactly against engine-ids.txt (239) or adopted-161.txt (161); no illegal tag id exists anywhere in this ledger — but the enumeration was incomplete. The complete classes of legitimately non-resolving backticked tokens are: (1) the two commit/archive sha strings; (2) the VPL book code `2CO`; (3) file and path names, ~10 tokens (`engine-ids.txt`, `adopted-161.txt`, `ontology/concepts/`, `pipeline/manifests/web.json`, `web-pauline.vpl.txt`, `tag-gaps-review.md`, `engine-pack-backlog.md`, `concepts-inventory.md`, and the two /mnt/project-files/research/bible-rollout/... document paths); (4) the new-concept candidate names `boasting-in-the-lord` and its ch. 11 §4 alternative spelling `boasting` (proposals, not tags); (5) the id-family glob `pastoral-*` in the addendum's own prose. None of these is used as a tag, so the audit's conclusion stands; its token list is corrected as above.

## Corrected counts

- Ch. 12 `unanswered-prayer` lexicon row: 3 phrasings → **1** ("prayed and nothing changed" only; "when god says no" and "god said no to my prayer" withdrawn per E2).
- Lexicon candidate rows: **16 → 16** — unchanged. No whole row is withdrawn: the ch. 12 row survives at one phrasing, and the ch. 5 `sharing-your-faith` row survives recast per E1 as a reversible judgment call deferred to the curator.
- All other summary counts unchanged: 5 adds / 60 keeps / 0 drops; 20 anchor-extension candidates + 1 rider; 1 new-concept candidate; 0 decline-overturn proposals (E1's recast proposes an alternative lexicon target for the curator to weigh — it neither implements nor overturns the decline); 3 corpus-blocked routes.

# Erratum 2 — 2026-08-26, final verification pass (single atomic end-of-file append per CONVENTIONS §9)

The final verification pass found the Summary-counts headline "Lexicon candidates: **16 rows**" arithmetically wrong, and the first erratum's Corrected-counts line ("16 → 16 — unchanged") carried the wrong figure forward. A mechanical recount of the §3 (Lexicon candidates) blocks of all 13 chapter sections gives:

- Rows per chapter: ch 1: 1 · ch 2: 1 · ch 3: 2 · ch 4: 2 · ch 5: 3 · ch 6: 0 (routed to corpus-blocked roster row 47, not logged) · ch 7: 1 · ch 8: 1 · ch 9: 1 · ch 10: 1 · ch 11: 2 · ch 12: 3 · ch 13: 2 = **20 rows**.
- Unique ids: **18** (`pastoral-strength-in-weakness` and `generosity` each carry two rows). The Summary's own id enumeration already listed all 18 ids with both "×2" marks — the enumeration and the ledger's chapter blocks were always consistent with each other; only the headline figure was wrong.
- Phrasings: **58** as corrected (19 rows × 3 phrasings, plus the ch. 12 `unanswered-prayer` row at 1 phrasing after E2's two withdrawals; 60 as originally written).

Corrected headline: Lexicon candidates: **20 rows (18 unique ids; 58 phrasings post-E2)**. The first erratum's "Lexicon candidate rows: 16 → 16 — unchanged" line is corrected to **16 → 20** (its substantive point — that no whole row was withdrawn — stands). All underlying rows were always intact: nothing is added, withdrawn, or edited by this erratum. Bookkeeping only.
