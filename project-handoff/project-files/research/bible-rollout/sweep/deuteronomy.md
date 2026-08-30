# Deuteronomy sweep ledger — Layer-3 tag sweep (Torah thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/
- Book: Deuteronomy (34 chapters)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/deuteronomy.md
  - Concept index: /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/concept-index.md
  - Declines & contested calls: /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/declines-and-contested.md
  - Corpus-blocked roster (route, don't duplicate): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/corpus-blocked-roster.md
  - WEB chapter text (verse-numbered, from the pinned-source full-Bible fixture, sourceSha256
    b6f55cc7…, commit 87fd68c): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/web-text/deuteronomy/<chapter>.txt
  - Worker instructions (entry format + verbatim rules): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/sweep-worker-instructions.md
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file.
- Legend — each chapter entry carries these sections, in order:
  1. "## Deuteronomy <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")


## Deuteronomy 1 (subdivided: 1:1–8, 1:9–18, 1:19–46)
Existing tags (book doc): fear-not, doubt, sin, divine-judgment, justice-and-oppression, leadership
### Applied-tag deltas
- KEEP fear-not — the border charge is repeated and substantial: "Don’t be afraid, neither be dismayed" (1:21); "Don’t be terrified. Don’t be afraid of them" (1:29–30).
- KEEP doubt — unbelief named explicitly as the rebellion's root: "Yet in this thing you didn’t believe the LORD your God" (1:32; PR #43 id, ratified 2026-08-25).
- KEEP sin — rebellion, confession, and repeated presumption: "We have sinned against the LORD" (1:41, with 1:26, 43).
- KEEP divine-judgment — the sworn sentence and its enforcement: "not one of these men of this evil generation shall see the good land" (1:35, with 1:44–45).
- KEEP justice-and-oppression — the founding judicial charge: "You shall not show partiality in judgment; you shall hear the small and the great alike" (1:16–17).
- KEEP leadership — wise, respected men made heads and judges over the people (1:9–18).
### Anchor-extension candidates
- grumbling-and-complaining | 1:27 | "You murmured in your tents" | low-medium (pack anchors Num 14:2–4; this is the canonical retelling of the same murmuring)
- fear-not | 1:21, 1:29–30 | "Don’t be afraid, neither be dismayed." | medium (no Deut 1 anchor in pack)
- favoritism | 1:17 | "You shall not show partiality in judgment; you shall hear the small and the great alike." | medium (pack anchors Lev 19:15 but not this founding judicial charge)
### Lexicon candidates
- adoption-as-gods-children | carried as a man carries his son | realistic query phrasings: "God carries us like a father", "God as a father in the Old Testament" (1:31; OT Israel-as-children register the pack already anchors at Deut 14:1)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6; book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None. (grumbling-and-complaining on 1:27 remains a presence-bar skip per the book doc's 2026-08-25 pass — single verse carried by `doubt`/`sin`; unchanged, logged above as an anchor-extension candidate instead.)

## Deuteronomy 2
Existing tags (book doc): gods-provision, nations-and-peoples, divine-judgment, hardness-of-heart
### Applied-tag deltas
- KEEP gods-provision — the wilderness verdict in the chapter's own words: "These forty years, the LORD your God has been with you. You have lacked nothing" (2:7).
- KEEP nations-and-peoples — lands deeded by God to other peoples: "I have given Mount Seir to Esau for a possession" (2:5, with 2:9, 12, 19–23).
- KEEP divine-judgment — the Kadesh sentence executed: "the LORD’s hand was against them, to destroy them from the middle of the camp, until they were consumed" (2:14–16).
- KEEP hardness-of-heart — "the LORD your God hardened his spirit and made his heart obstinate" (2:30).
### Anchor-extension candidates
- gods-provision | 2:7 | "These forty years, the LORD your God has been with you. You have lacked nothing." | medium-high (pack has no OT wilderness anchor)
- nations-and-peoples | 2:5, 2:9 | "I have given Mount Seir to Esau for a possession" | medium (pack's Genesis anchors lack this God-assigns-other-nations-their-lands witness)
- hardness-of-heart | 2:30 | "the LORD your God hardened his spirit and made his heart obstinate" | medium (adds a second God-side narrative beside the pack's Exod 7:13–14 / 14:4 anchors)
### Lexicon candidates
- nations-and-peoples | God gives nations their lands | realistic query phrasings: "does God care about other nations", "God and the nations in the Old Testament"
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None. (`providence` stays withheld per book doc Decisions #25 — no new evidence beyond what that ruling weighed.)

## Deuteronomy 3 (subdivided: 3:1–11, 3:12–22, 3:23–29)
Existing tags (book doc): fear-not, gods-protection, prayer
### Applied-tag deltas
- ADD unanswered-prayer — WEB quote: "But the LORD was angry with me because of you, and didn’t listen to me. The LORD said to me, 'That is enough! Speak no more to me of this matter.'" (3:26) — the chapter depicts a genuine plea (3:23–25) honestly refused, the pack's when-God-doesn't-answer substance; applied beside `prayer` per the §11.2 both-tags ruling (the prayer vs the no), and the book doc's own motif line already names the "unanswered prayer in the Bible" query.
- KEEP fear-not — "Don’t fear him; for I have delivered him, with all his people and his land, into your hand" (3:2, with 3:22).
- KEEP gods-protection — victory credited to God alone and promised for the kingdoms ahead (3:3, 21).
- KEEP prayer — "I begged GOD at that time" — a real prayer, honestly answered with a no, a view, and a task (3:23–28).
### Anchor-extension candidates
- unanswered-prayer | 3:23–27 | "I begged GOD at that time … But the LORD was angry with me because of you, and didn’t listen to me." | medium (pack's anchors are 2 Cor 12:8–9 / Lamentations / Psalms; this is the OT narrative keystone)
### Lexicon candidates
- unanswered-prayer | when God says no | realistic query phrasings: "when God says no", "God said no to my prayer", "why did God say no"
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Deuteronomy 4 (subdivided: 4:1–40, 4:41–43, 4:44–49)
Existing tags (book doc): obedience-to-the-word, presence-of-god, repentance, gods-faithfulness, divine-judgment, idolatry, cities-of-refuge, no-other-god
### Applied-tag deltas
- KEEP obedience-to-the-word — the sermon's frame: "listen to the statutes and to the ordinances which I teach you, to do them, that you may live" (4:1, with 4:2, 5–6, 40).
- KEEP presence-of-god — "For what great nation is there that has a god so near to them as the LORD our God is whenever we call on him?" (4:7).
- KEEP repentance — "you shall seek the LORD your God, and you will find him when you search after him with all your heart and with all your soul" (4:29–30).
- KEEP gods-faithfulness — "For the LORD your God is a merciful God. He will not fail you nor destroy you, nor forget the covenant of your fathers" (4:31).
- KEEP divine-judgment — heaven and earth witness: "you will soon utterly perish from off the land … The LORD will scatter you among the peoples" (4:26–28).
- KEEP idolatry — the Horeb no-form argument against images, sun, moon, and stars (4:15–28).
- KEEP cities-of-refuge — the institution's founding act east of the Jordan: Bezer, Ramoth, and Golan set apart (4:41–43; corpus-blocked roster row 25 id, display tag only).
- KEEP no-other-god — "the LORD himself is God in heaven above and on the earth beneath. There is no one else" (4:39, with 4:35).
### Anchor-extension candidates
- presence-of-god | 4:7 | "For what great nation is there that has a god so near to them as the LORD our God is whenever we call on him?" | medium (pack has no Deut anchor)
- idolatry | 4:15–19 | "lest you corrupt yourselves, and make yourself a carved image in the form of any figure" | medium (the no-form rationale; pack's Deut anchor is 7:25–26 only)
- gods-faithfulness | 4:31 | "For the LORD your God is a merciful God. He will not fail you nor destroy you, nor forget the covenant of your fathers which he swore to them." | medium (pack anchors Deut 7:9 but not this merciful-God witness)
### Lexicon candidates
- idolatry | worship without images | realistic query phrasings: "why did God forbid images", "worship without images", "does God have a form" (4:12, 15–16 "you saw no form")
### New-concept candidates
None.
### Decline-overturn proposals
None. (4:24 "the LORD your God is a devouring fire, a jealous God" was checked against the Zechariah-block decline of God's-jealousy as a searched register; the decline's ground is register-not-searched, which a further occurrence does not overturn — no proposal.)
### Ceiling / refinement flags
- hit hard ceiling 8 — marked for per-verse refinement; book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- seeking-god candidate (4:29 — the pack itself already anchors Deut 4:29) yielded at the ceiling under §11.6 as broad-duplicating-specific: `repentance` carries 4:29–30 here; the pack's existing anchor keeps the search need served engine-side.
- covenant candidate (4:13, 23, 31) yielded at the ceiling under §11.6 as broad-duplicating-specific: 4:31 is already carried inside `gods-faithfulness`'s justification, and the covenant tags ride chs 5 and 7 where the word is the passage's own subject.

## Deuteronomy 5 (subdivided: 5:1–4, 5:5–21, 5:22–33)
Existing tags (book doc): the-ten-commandments, covenant, sabbath-rest, caring-for-aging-parents, obedience-to-the-word, idolatry
### Applied-tag deltas
- ADD mediator — WEB quote: "I stood between the LORD and you at that time, to show you the LORD’s word" (5:5); "Go near, and hear all that the LORD our God shall say, and tell us all that the LORD our God tells you; and we will hear it, and do it." (5:27) — the asked-for go-between is a full narrative movement (5:5, 23–31) that the LORD himself approves (5:28); the book doc's own motif line already names the "why did Israel need a mediator" / "go-between with God" queries. Corpus-blocked roster row 24 id — display tag only; engine finding ROUTED to that row (see New-concept section).
- KEEP the-ten-commandments — the Decalogue repeated in full to the living generation (5:6–21).
- KEEP covenant — "The LORD our God made a covenant with us in Horeb," claimed for the living (5:2–3).
- KEEP sabbath-rest — the command with its rest extended to household, livestock, and stranger (5:12–15; pack already anchors Deut 5:12–15).
- KEEP caring-for-aging-parents — "Honor your father and your mother, as the LORD your God commanded you" (5:16; PR #43 id, ratified 2026-08-25).
- KEEP obedience-to-the-word — "You shall walk in all the way which the LORD your God has commanded you" (5:33, with 5:29, 32).
- KEEP idolatry — the first table renewed: no other gods, no carved image, no bowing down (5:7–9).
### Anchor-extension candidates
- the-ten-commandments | 5:6–21 | "You shall have no other gods before me." | high (pack anchors Exod 20:1–17 ONLY; this is the whole Decalogue parallel — a searcher landing on either should find both)
- caring-for-aging-parents | 5:16 | "Honor your father and your mother, as the LORD your God commanded you, that your days may be long" | medium (pack anchors Exod 20:12 / Eph 6:2–3 but not the Deut parallel)
- covenant | 5:2–3 | "The LORD our God made a covenant with us in Horeb." | medium (pack's Deut anchor is 7:9 only)
- covetousness | 5:21 | "You shall not covet your neighbor’s wife." | low (parallel to the pack's Exod 20:17 anchor)
- fear-of-the-lord | 5:29 | "Oh that there were such a heart in them that they would fear me and keep all my commandments always" | low-medium (God's own wish, a distinctive witness)
### Lexicon candidates
None.
### New-concept candidates
None. (The mediator theme matches corpus-blocked roster row 24 `mediator` — ROUTED, not duplicated: Deut 5:5, 23–31 noted as candidate refs for that row's eventual pack, a narrative complement to its Job umpire-longing register; tagged above as adopted display vocabulary only.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- at 7 tags — soft cap 6 exceeded under §11.6 (every tag independently clears the presence bar; below the hard ceiling); book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None. (covetousness and fear-of-the-lord considered as tags and not added on the presence bar — each a single verse inside material carried by `the-ten-commandments` and `obedience-to-the-word` respectively; both logged above as anchor-extension candidates.)

## Deuteronomy 6
Existing tags (book doc): delight-in-the-word, parenting, obedience-to-the-word, loving-god, no-other-god
### Applied-tag deltas
- ADD fear-of-the-lord — WEB quote: "You shall fear the LORD your God; and you shall serve him, and shall swear by his name." (6:13) — reverent fear is the law's stated aim three times across the chapter: "that you might fear the LORD your God, to keep all his statutes and his commandments" (6:2) and "to fear the LORD our God, for our good always" (6:24); not a single-verse touch but the chapter's recurring frame.
- KEEP delight-in-the-word — "These words, which I command you today, shall be on your heart," talked of, bound, and written on the doorposts (6:6–9).
- KEEP parenting — "you shall teach them diligently to your children," plus the scripted answer to a son's question (6:7, 20–25; pack already anchors Deut 6:6–7).
- KEEP obedience-to-the-word — "You shall diligently keep the commandments of the LORD your God" (6:17, with 6:3, 24).
- KEEP loving-god — the Shema's command: "You shall love the LORD your God with all your heart, with all your soul, and with all your might" (6:4–5; pack already anchors Deut 6:5).
- KEEP no-other-god — the oneness confession: "Hear, Israel: The LORD is our God. The LORD is one." (6:4; pack already anchors Deut 6:4).
### Anchor-extension candidates
- delight-in-the-word | 6:6–9 | "These words, which I command you today, shall be on your heart" | medium-high (pack anchors Ps 1:2 / Josh 1:8 / Col 3:16 only; this is the Word-saturation keystone)
- fear-of-the-lord | 6:2, 6:13, 6:24 | "You shall fear the LORD your God; and you shall serve him" | medium (pack has no Deut anchor; 6:13 is the verse Jesus later quotes)
### Lexicon candidates
- no-other-god | shema | realistic query phrasings: "shema meaning", "the shema", "hear o israel the lord is one" (neither `no-other-god` nor `loving-god` carries the term "shema"; heavy real-user query for 6:4)
### New-concept candidates
- testing-god | putting-God-to-the-test has no vocabulary home: `testing` is the God-tests-us register, `temptation` the being-tempted register; not in the index, the declines, or the corpus-blocked roster | anchor: Deut 6:16 — "You shall not tempt the LORD your God, as you tempted him in Massah." (single verse here — Exod 17:1–7, Ps 95:8–9, Matt 4:7 would complete a pack); realistic queries: "putting God to the test", "what does it mean to test God"
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6 (after the ADD)
### Decisions record
None. (6:10–12's forgetting-in-prosperity warning matches corpus-blocked roster row 33's recorded BORDERLINE forgetting-in-prosperity extension flag — ROUTED as a note to that row, not proposed fresh. `idolatry` on 6:14–15 stays skipped per the book doc's 2026-08-25 pass.)

## Deuteronomy 7
Existing tags (book doc): gods-love, gods-faithfulness, covenant, holiness, fear-not, blessing, idolatry
### Applied-tag deltas
- KEEP gods-love — election explained from inside God's heart: "The LORD didn’t set his love on you nor choose you, because you were more in number … but because the LORD loves you" (7:7–8).
- KEEP gods-faithfulness — "the faithful God, who keeps covenant and loving kindness to a thousand generations" (7:9; pack already anchors Deut 7:9).
- KEEP covenant — "the LORD your God will keep with you the covenant and the loving kindness which he swore to your fathers" (7:12, with 7:8–9; pack already anchors Deut 7:9).
- KEEP holiness — "For you are a holy people to the LORD your God" (7:6).
- KEEP fear-not — "you shall not be afraid of them. You shall remember well what the LORD your God did to Pharaoh" (7:18, with 7:17, 21).
- KEEP blessing — the covenant's own terms to Israel: "He will love you, bless you, and multiply you" (7:13, with 7:12–15; prosperity guardrail per book doc #44 stands).
- KEEP idolatry — altars, pillars, Asherah poles, and engraved images destroyed; the devoted thing utterly detested (7:5, 25–26; pack already anchors Deut 7:25–26).
### Anchor-extension candidates
- gods-love | 7:7–8 | "The LORD didn’t set his love on you nor choose you, because you were more in number than any people … but because the LORD loves you" | medium (pack has no Deut anchor; the because-he-loves-you election witness)
- holiness | 7:6 | "For you are a holy people to the LORD your God. The LORD your God has chosen you to be a people for his own possession" | medium (pack's set-apart register with no OT-Israel anchor)
### Lexicon candidates
- gods-love | the LORD set his love on you | realistic query phrasings: "why did God choose Israel", "God chose the fewest of all peoples" (7:7)
### New-concept candidates
None. (Two corpus-blocked routings, noted not duplicated: 7:7 "for you were the fewest of all peoples" matches roster row 21 `gods-surprising-choice` — candidate ref for that row's standing one-design decision; the conquest commands 7:1–5, 16, 22–26 sit adjacent to roster row 30 `warfare` — noted as possible refs if that row's war-law scope is widened to the conquest charge, that row's curator's call.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- at 7 tags — soft cap 6 exceeded under §11.6 (every tag independently clears the presence bar; below the hard ceiling)
### Decisions record
None. (`election-and-predestination` considered for 7:6–8 and withheld: the pack's register is NT soteriological election — "does god choose who is saved" — and tagging national election with it would read that category across; the search need is served by `gods-love` and its anchor-extension above.)

## Deuteronomy 8
Existing tags (book doc): gods-provision, testing, the-lords-discipline, thanksgiving, remembrance-and-memorials
### Applied-tag deltas
- KEEP gods-provision — manna, water "out of the rock of flint," clothing that didn't grow old, forty sustained years (8:3–4, 15–16).
- KEEP testing — "that he might humble you, to test you, to know what was in your heart" (8:2, with 8:16; pack already anchors Deut 8:2–3).
- KEEP the-lords-discipline — "as a man disciplines his son, so the LORD your God disciplines you" (8:5).
- KEEP thanksgiving — "You shall eat and be full, and you shall bless the LORD your God for the good land which he has given you" (8:10).
- KEEP remembrance-and-memorials — remember all the way, and in fullness "beware lest you forget the LORD your God" (8:2, 11–18; corpus-blocked roster row 33 id, display tag only — ch 8 is already in that row's recorded spine).
### Anchor-extension candidates
- the-lords-discipline | 8:5 | "as a man disciplines his son, so the LORD your God disciplines you" | high (pack anchors Heb 12:7–11 / Rev 3:19 only; this is the OT source of the Hebrews figure)
- gods-provision | 8:3–4 | "He humbled you, allowed you to be hungry, and fed you with manna … Your clothing didn’t grow old on you, neither did your foot swell, these forty years." | medium (no wilderness-provision anchor in pack)
- thanksgiving | 8:10 | "You shall eat and be full, and you shall bless the LORD your God for the good land which he has given you." | medium (the thanks-for-food witness; no OT-meal anchor in pack)
- humble-exaltation | 8:14, 8:17 | "then your heart might be lifted up, and you forget the LORD your God" … "My power and the might of my hand has gotten me this wealth." | low-medium (the pride-in-prosperity failure mode; plain-"pride" queries already route to this pack per the PR #41 ruling)
### Lexicon candidates
- testing | man does not live by bread only | realistic query phrasings: "man shall not live by bread alone meaning", "living by every word from God" (8:3; the pack already anchors Deut 8:2–3, so the query would land on its own anchor text)
- thanksgiving | bless the LORD for your food | realistic query phrasings: "thanking God for food", "prayer before meals in the bible" (8:10)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None. (Roster row 33's BORDERLINE forgetting-in-prosperity extension flag is anchored by this chapter (8:11–18) — noted for that row, not proposed fresh. `humble-exaltation` considered as a tag and withheld on the presence bar: the humbling here is the testing register and the lifted heart the forgetting register, both already carried; logged above as an anchor-extension candidate.)

## Deuteronomy 9 (subdivided: 9:1–6, 9:7–29)
Existing tags (book doc): grace-not-earned, sin, prayer
### Applied-tag deltas
- ADD idolatry — WEB quote: "You had made yourselves a molded calf. You had quickly turned away from the way which the LORD had commanded you." (9:16) — the golden calf is retold at narrative length (9:12–21), the pack's own lexicon owns "golden calf," and the chapter's center is the idolatry episode; beside `sin` per the §11.2 both-tags ruling (the specific idolatry vs the whole rebellion ledger). Not considered in the book doc's 2026-08-25 pass (ch 9 absent from both its add and skip lists) — an honest gap, not an overturn.
- ADD fasting — WEB quote: "I stayed on the mountain forty days and forty nights. I neither ate bread nor drank water." (9:9, repeated at 9:18) — Moses' two forty-day fasts, the second explicitly penitential and bound to intercession ("because of all your sin which you sinned," 9:18); unlike the 1 Chronicles funerary-custom decline, this is fasting joined to prayer before the LORD, the same register as the pack's Dan 9:3 / Ezra 8:21–23 anchors, and "Moses fasted 40 days" is a real search intent.
- KEEP grace-not-earned — the chapter's thesis: "Not for your righteousness or for the uprightness of your heart do you go in to possess their land" (9:5, with 9:4, 6; book doc Decisions #17's judgment-call rationale stands — the text's own words, not a read-back).
- KEEP sin — "You have been rebellious against the LORD from the day that I knew you" (9:24, with 9:7–23).
- KEEP prayer — "I prayed to the LORD" — forty days of intercession for the people and for Aaron (9:18–20, 25–29).
### Anchor-extension candidates
- grace-not-earned | 9:4–6 | "Not for your righteousness or for the uprightness of your heart do you go in to possess their land" | medium (pack's anchors are all NT; this is the OT unearned-gift witness the book doc's motif line already queries as "unmerited favor in the Old Testament")
- fasting | 9:9, 9:18 | "I stayed on the mountain forty days and forty nights. I neither ate bread nor drank water." | medium (pack has no Torah anchor; the forty-day fast Matt 4:2 echoes)
### Lexicon candidates
- hardness-of-heart | stiff-necked | realistic query phrasings: "stiff-necked people meaning", "what does stiff-necked mean in the bible" (9:6, 13, 27 — no pack lexicon carries the term)
### New-concept candidates
None.
### Decline-overturn proposals
None. (Intercession stays routed to `prayer` per the Genesis thread's ruling — honored, already tagged.)
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None. (`hardness-of-heart` considered for the stiff-necked epithet (9:6, 13, 27) and withheld on the presence bar — a descriptive epithet carried inside `grace-not-earned`'s thesis quote, not the pack's hardened-heart teaching substance; logged above as a lexicon candidate instead.)

## Deuteronomy 10
Existing tags (book doc): repentance, obedience-to-the-word, gods-love, circumcision-of-the-heart, loving-god, justice-and-oppression, sojourners-and-strangers
### Applied-tag deltas
- ADD fear-of-the-lord — WEB quote: "Now, Israel, what does the LORD your God require of you, but to fear the LORD your God, to walk in all his ways, to love him" (10:12); "You shall fear the LORD your God. You shall serve him. You shall cling to him, and you shall swear by his name." (10:20) — the require-list's leading demand plus a direct command; not a single clause but the chapter's summary frame. Beside `loving-god` per the §11.2 both-tags ruling (fear vs love — the same pairing this sweep added on ch 6, where the register recurs at 6:2, 13, 24).
- KEEP repentance — the turning demand in the chapter's own figure: "Circumcise therefore the foreskin of your heart, and be no more stiff-necked" (10:16).
- KEEP obedience-to-the-word — "to keep the LORD’s commandments and statutes, which I command you today for your good" (10:12–13).
- KEEP gods-love — "the LORD had a delight in your fathers to love them, and he chose their offspring after them," and the God who "loves the foreigner in giving him food and clothing" (10:15, 18).
- KEEP circumcision-of-the-heart — the figure's first command: "Circumcise therefore the foreskin of your heart" (10:16; corpus-blocked roster row 37 id, display tag only).
- KEEP loving-god — "to walk in all his ways, to love him, and to serve the LORD your God with all your heart and with all your soul" (10:12; pack already anchors Deut 10:12).
- KEEP justice-and-oppression — "who doesn’t respect persons or take bribes. He executes justice for the fatherless and widow" (10:17–18).
- KEEP sojourners-and-strangers — "Therefore love the foreigner, for you were foreigners in the land of Egypt" (10:19).
### Anchor-extension candidates
- justice-and-oppression | 10:17–18 | "the great God, the mighty, and the awesome, who doesn’t respect persons or take bribes. He executes justice for the fatherless and widow" | medium (pack's Deut anchor is 16:18–20 — the courtroom statute; this is the God-side warrant behind it)
- fear-of-the-lord | 10:12, 10:20 | "what does the LORD your God require of you, but to fear the LORD your God, to walk in all his ways" | medium (pack has no Torah anchor)
- sojourners-and-strangers | 10:18–19 | "Therefore love the foreigner, for you were foreigners in the land of Egypt." | medium (pack has no Deut anchor; the command itself — `hospitality`'s Lev 19:33–34 anchor is the parallel; one route only, curation's pick)
- favoritism | 10:17 | "who doesn’t respect persons or take bribes" | low-medium (the OT statement of the pack's god-shows-no-partiality register beside its Acts 10:34–35 anchor)
- priesthood | 10:8–9 | "the LORD set apart the tribe of Levi to bear the ark of the LORD’s covenant, to stand before the LORD to minister to him, and to bless in his name" | low-medium (pack's Deut anchor is 33:8–11; this is the setting-apart narrative — serves the search need the display-tag yield left untagged here)
### Lexicon candidates
- obedience-to-the-word | what does the Lord require | realistic query phrasings: "what does God require of me", "what does the Lord require of you" (10:12 — the Deuteronomy parallel of the Micah 6:8 phrasing)
- god-reigns | God of gods and Lord of lords | realistic query phrasings: "God of gods and Lord of lords", "the great and awesome God" (10:17)
### New-concept candidates
None. (The heart-circumcision engine finding matches corpus-blocked roster row 37 `circumcision-of-the-heart` — ROUTED, not duplicated: Deut 10:16 is already among that row's recorded blocking refs; nothing new to add.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit hard ceiling 8 — marked for per-verse refinement (after the ADD)
### Decisions record
- At the ceiling, the book-doc 2026-08-25 pass's ch-10 yields stand and none is displaced by the ADD: `priesthood` (10:8–9 two-verse parenthesis), `inheritance` (10:9), and the `oaths-and-vows`/`the-name-of-god` 10:20 single clauses remain yielded per the §11.6 order (thin single-verse / single-passage candidates); `fear-of-the-lord` (10:12 + 10:20) enters as a chapter frame, not by displacing any existing tag. The yielded needs stay served engine-side (priesthood's Deut 33:8–11 anchors plus the 10:8–9 anchor-extension candidate above).

## Deuteronomy 11
Existing tags (book doc): obedience-to-the-word, blessing, parenting, loving-god, remembrance-and-memorials
### Applied-tag deltas
- KEEP obedience-to-the-word — "you shall love the LORD your God, and keep his instructions, his statutes, his ordinances, and his commandments, always" (11:1, with 11:8, 13, 22, 32).
- KEEP blessing — "Behold, I set before you today a blessing and a curse" (11:26–28; prosperity guardrail per book doc #44 stands — the covenant's own terms to Israel in its land, not a general formula).
- KEEP parenting — "You shall teach them to your children, talking of them when you sit in your house, when you walk by the way, when you lie down, and when you rise up." (11:19, with 11:18–21).
- KEEP loving-god — "to love the LORD your God, and to serve him with all your heart and with all your soul" (11:13, with 11:1, 22).
- KEEP remembrance-and-memorials — obedience argued from eyewitness memory: "your eyes have seen all of the LORD’s great work which he did" (11:7, with 11:2–6; corpus-blocked roster row 33 id, display tag only — ch 11 is already among that row's recorded refs).
### Anchor-extension candidates
- blessing | 11:26–28 | "Behold, I set before you today a blessing and a curse" | medium (pack has no Deut anchor; the covenant-alternative locus — any extension must keep the book doc's #44 covenant-terms framing, no prosperity-formula register)
- parenting | 11:19 | "You shall teach them to your children, talking of them when you sit in your house, when you walk by the way, when you lie down, and when you rise up." | low-medium (second witness beside the pack's existing Deut 6:6–7 anchor)
### Lexicon candidates
- gods-provision | early rain and latter rain | realistic query phrasings: "early and latter rain meaning", "former and latter rain in the bible" (11:14 — covenant-conditional register; prosperity guardrail applies to any gist wording)
- blessing | Gerizim and Ebal | realistic query phrasings: "mount gerizim and mount ebal", "blessings and curses in deuteronomy" (11:26–29)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- Not yields (presence-bar declines, recorded for transparency): `idolatry` (11:16, 28 — two warning clauses inside the rain conditional, not the chapter's teaching substance; consistent with the book-doc pass's ch-6 skip on the same ground); `gods-provision` as a tag (11:14–15 — stays routed through `blessing` per book doc #44, no stacking of prosperity-adjacent tags on conditional material; logged above as a lexicon candidate only).

## Deuteronomy 12
Existing tags (book doc): worship, joy-in-the-lord, obedience-to-the-word, idolatry, the-name-of-god
### Applied-tag deltas
- KEEP worship — "Be careful that you don’t offer your burnt offerings in every place that you see; but in the place which the LORD chooses in one of your tribes, there you shall offer your burnt offerings" (12:13–14, with 12:5–7, 26–27).
- KEEP joy-in-the-lord — "You shall rejoice before the LORD your God" — households, servants, and the Levite together (12:12, with 12:7, 18).
- KEEP obedience-to-the-word — "every man whatever is right in his own eyes" ruled out, and the closing seal: "Whatever thing I command you, that you shall observe to do. You shall not add to it, nor take away from it." (12:8, 28, 32).
- KEEP idolatry — "You shall surely destroy all the places in which the nations that you shall dispossess served their gods" (12:2–3, with 12:29–31 — worship that runs even to burning sons and daughters in the fire).
- KEEP the-name-of-god — "to the place which the LORD your God shall choose out of all your tribes, to put his name there" (12:5, with 12:11, 21).
### Anchor-extension candidates
- the-name-of-god | 12:5, 12:11 | "to the place which the LORD your God shall choose out of all your tribes, to put his name there" | medium (pack's Deut anchor is 6:13 — the swearing register; this is the name-dwells register)
- joy-in-the-lord | 12:7, 12:12, 12:18 | "You shall rejoice before the LORD your God" | medium (no commanded-rejoicing OT anchor in pack)
- no-other-gospel | 12:32 | "Whatever thing I command you, that you shall observe to do. You shall not add to it, nor take away from it." | medium (pack already anchors the Deut 4:2 parallel; 12:32 is the law code's own closing seal — same add-nothing register, not a read-back)
### Lexicon candidates
- the-name-of-god | the place where God puts his name | realistic query phrasings: "where God's name dwells", "why one place of worship" (12:5, 11, 21)
- clean-and-unclean | the blood is the life | realistic query phrasings: "why is eating blood forbidden in the bible", "the blood is the life meaning" (12:23)
### New-concept candidates
None. (12:8 "every man whatever is right in his own eyes" matches corpus-blocked roster row 20 `right-in-their-own-eyes` — ROUTED, not duplicated: Deut 12:8 noted as a candidate ref beside that row's Judges refs; a single verse here, so no display tag either.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- Not yields (presence-bar declines): `tithing` and `oaths-and-vows` (12:6, 11, 17, 26 — tithes and vows as offering-list items, per the book-doc pass's identical ch-12 skip); `right-in-their-own-eyes` (12:8 single verse — routed to roster row 20 above).

## Deuteronomy 13
Existing tags (book doc): testing, obedience-to-the-word, false-prophets, idolatry
### Applied-tag deltas
- KEEP testing — "for the LORD your God is testing you, to know whether you love the LORD your God with all your heart and with all your soul" (13:3).
- KEEP obedience-to-the-word — "You shall walk after the LORD your God, fear him, keep his commandments, and obey his voice. You shall serve him, and cling to him." (13:4).
- KEEP false-prophets — the sign that comes to pass does not authenticate: "you shall not listen to the words of that prophet, or to that dreamer of dreams" (13:1–5; pack already anchors Deut 13:1–3).
- KEEP idolatry — all three loyalty tests are enticement to "go after other gods" (13:2) / "go and serve other gods" (13:6, 13) — prophet, closest kin, or a whole city — treated as rebellion against the God of the exodus (13:5, 10).
### Anchor-extension candidates
- testing | 13:3 | "for the LORD your God is testing you, to know whether you love the LORD your God with all your heart and with all your soul." | medium (pack's Deut anchor is 8:2–3 — the wilderness humbling; this adds the loyalty-tested-through-a-deceiver register)
- idolatry | 13:6–8 | "If your brother, the son of your mother, or your son, or your daughter, or the wife of your bosom, or your friend who is as your own soul, entices you secretly" | low-medium (the intimate-enticement statute; pack's Deut anchor is 7:25–26)
### Lexicon candidates
- false-prophets | signs that come to pass | realistic query phrasings: "can false prophets perform miracles", "are miracles proof from God" (13:1–3 — the pack's lexicon has "how to recognize a false prophet" but not the successful-sign question this chapter answers)
- putting-god-first | God before family | realistic query phrasings: "loving God more than family", "putting God before family" (13:6–8 — curation note: Deut 13 is the negative statute; the query family should anchor on the pack's own texts, with 13:6–8 as an OT witness at most, never routing personal-priority queries to a stoning statute alone)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- Not yields: `loving-god` (13:3 quoted verbatim inside `testing` — the book-doc pass's skip stands); `dreams-and-visions` stays withheld per book doc Decisions #21 (the "dreamer of dreams" is a false dreamer being legislated against — tagging would route seekers of God-given dreams to a warning text); `occult-and-divination` checked and not added (the chapter's figure is a sign-giving prophet, not the ch-18 divination list).

## Deuteronomy 14 (subdivided: 14:1–21, 14:22–29)
Existing tags (book doc): holiness, tithing, generosity, adoption-as-gods-children, clean-and-unclean
### Applied-tag deltas
- KEEP holiness — the frame around both mourning rites and food: "For you are a holy people to the LORD your God, and the LORD has chosen you to be a people for his own possession" (14:2, with 14:21).
- KEEP tithing — "You shall surely tithe all the increase of your seed" (14:22, with 14:23–29).
- KEEP generosity — the third-year tithe stored so that "the foreigner living among you, the fatherless, and the widow who are within your gates shall come, and shall eat and be satisfied" (14:28–29).
- KEEP adoption-as-gods-children — "You are the children of the LORD your God" (14:1; pack already anchors Deut 14:1; OT Israel-as-children register per book doc #22/#60 — no Pauline framing).
- KEEP clean-and-unclean — hoof and cud, fins and scales, clean birds, and the off-menu list (14:3–21; pack already anchors Deut 14:3–21).
### Anchor-extension candidates
- tithing | 14:22–23 | "You shall surely tithe all the increase of your seed … that you may learn to fear the LORD your God always." | medium-high (pack has no Deut anchor; the eaten-tithe-as-training register, distinct from Malachi's storehouse register)
- generosity | 14:28–29 | "the foreigner living among you, the fatherless, and the widow who are within your gates shall come, and shall eat and be satisfied" | low-medium (pack lacks a Torah provision-law witness)
- fear-of-the-lord | 14:23 | "that you may learn to fear the LORD your God always" | low (reverence learned through worship practice — single clause, anchor lead only)
### Lexicon candidates
- clean-and-unclean | a young goat in its mother's milk | realistic query phrasings: "why not boil a goat in its mother's milk", "meat and dairy in the bible" (14:21)
- tithing | eat the tithe before the LORD | realistic query phrasings: "eating the tithe before the LORD", "tithing as celebration" (14:23, 26)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- Not yields (presence-bar declines): `fear-of-the-lord` as a tag (14:23 single purpose clause; logged above as an anchor lead); `sojourners-and-strangers` (14:21, 29 — the book-doc pass's skip stands: 14:29 is carried verbatim inside `generosity`). (Fixture note: Deut 14 is one of the five Deuteronomy chapters in the engine fixture corpus, so this chapter's anchor-extension candidates are assertable in-corpus today, unlike most of this book's.)

## Deuteronomy 15 (subdivided: 15:1–18, 15:19–23)
Existing tags (book doc): generosity, blessing, hardness-of-heart, justice-and-oppression
### Applied-tag deltas
- ADD bondservants-and-masters — WEB quote: "If your brother, a Hebrew man, or a Hebrew woman, is sold to you and serves you six years, then in the seventh year you shall let him go free from you." (15:12); "You shall furnish him liberally out of your flock, out of your threshing floor, and out of your wine press." (15:14) — a seven-verse release statute (15:12–18) with the pierced-ear bondservant choice (15:16–17); the pack's own Jer 34:8–17 anchor is the later prosecution of this very release law, so the register match is the pack's own; described as the text describes it, no adjudication. Not considered in the book doc's 2026-08-25 pass (absent from its add and skip lists) — an honest gap, not an overturn.
- KEEP generosity — "you shall surely open your hand to him, and shall surely lend him sufficient for his need" (15:8, with 15:10–11, 13–14).
- KEEP blessing — "For the LORD your God will bless you, as he promised you" (15:6, with 15:4–5, 10, 18; prosperity guardrail per book doc #44 stands — the covenant's own terms).
- KEEP hardness-of-heart — "you shall not harden your heart, nor shut your hand from your poor brother" (15:7).
- KEEP justice-and-oppression — "every creditor shall release that which he has lent to his neighbor … because the LORD’s release has been proclaimed" (15:1–2), with even calculated stinginess as year seven nears named sin: "and he cry to the LORD against you, and it be sin to you" (15:9).
### Anchor-extension candidates
- generosity | 15:7–11 | "you shall surely open your hand to him, and shall surely lend him sufficient for his need, which he lacks." | medium-high (pack has no Torah anchor; the open-hand law, with 15:10's ungrudging heart matching the pack's cheerful-giver register)
- hardness-of-heart | 15:7 | "you shall not harden your heart, nor shut your hand from your poor brother" | medium (adds the self-chosen social hardening beside the pack's Pharaoh / Ps 95 anchors; the tag-gaps Deuteronomy append already names 15:7 for this row)
- bondservants-and-masters | 15:12–18 | "You shall remember that you were a slave in the land of Egypt, and the LORD your God redeemed you." | medium (the release statute the pack's Jer 34:8–17 anchor presupposes)
### Lexicon candidates
- generosity | open your hand to the poor | realistic query phrasings: "helping the poor in the bible", "lending to the needy" (15:8, 11)
- bondservants-and-masters | pierced ear servant | realistic query phrasings: "bondservant meaning", "pierced ear servant in the bible" (15:16–17)
### New-concept candidates
- year-of-release-and-jubilee | the sabbatical-release institution has no vocabulary home: "year of jubilee meaning", "sabbath year in the bible", "debt forgiveness in the bible" are real queries; `justice-and-oppression`'s tag-gaps row carries the Deut 15 refs and `contentment` owns bare "debt", but no concept names the release/jubilee institution itself; not in the concept index, the declines, or the roster (roster row 27's Lev 25 note is the kinsman-redeemer register, not this) | anchor: Deut 15:1–2 — "At the end of every seven years, you shall cancel debts." … "because the LORD’s release has been proclaimed." (Lev 25, the jubilee locus, is outside the fixture corpus — any pack rides PR-β.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- Not yields: `pastoral-freedom-from-bondage` stays withheld per book doc #16 (legislation about an institution, not personal-crisis ministry — pastoral-* ids are personal-crisis register only); `forgiving-others` stays withheld per #23 (release of loans, not forgiveness of wrongs); `tithing` stays withheld on 15:19–23 per #23 (firstborn dedication is a distinct institution from tithes); `remembrance-and-memorials` (15:15 single motive clause — the book-doc pass's skip stands).

## Deuteronomy 16 (subdivided: 16:1–17, 16:18–22)
Existing tags (book doc): worship, joy-in-the-lord, passover, appointed-feasts, justice-and-oppression
### Applied-tag deltas
- KEEP worship — "Three times in a year all of your males shall appear before the LORD your God in the place which he chooses … They shall not appear before the LORD empty." (16:16, with 16:2, 10–11).
- KEEP joy-in-the-lord — rejoicing commanded across the feasts and the whole household: "You shall rejoice in your feast" and "you shall be altogether joyful" (16:14–15, with 16:11).
- KEEP passover — "Observe the month of Abib, and keep the Passover to the LORD your God" (16:1, with 16:2–8; pack already anchors Deut 16:1–8).
- KEEP appointed-feasts — the pilgrim calendar entire: unleavened bread, weeks, and booths, three times a year (16:1–17; pack already anchors Deut 16:16–17).
- KEEP justice-and-oppression — "You shall not pervert justice. You shall not show partiality. You shall not take a bribe, for a bribe blinds the eyes of the wise and perverts the words of the righteous." (16:19, with 16:18, 20; pack already anchors Deut 16:18–20).
### Anchor-extension candidates
- joy-in-the-lord | 16:14–15 | "You shall rejoice in your feast … and you shall be altogether joyful." | low-medium (commanded festival joy; complements the pack's Neh 8:10 anchor)
- worship | 16:16–17 | "Three times in a year all of your males shall appear before the LORD your God in the place which he chooses" | low-medium (pilgrimage-worship witness; no OT pilgrim anchor in pack)
- generosity | 16:17 | "Every man shall give as he is able, according to the LORD your God’s blessing which he has given you." | low-medium (the give-as-able principle)
### Lexicon candidates
- appointed-feasts | feast of weeks | realistic query phrasings: "feast of weeks meaning", "pentecost in the old testament" (16:9–10 — the pack's lexicon carries tabernacles/booths terms but not weeks)
- justice-and-oppression | bribes | realistic query phrasings: "what does the bible say about bribes", "a bribe blinds the eyes" (16:19)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- Not yields (presence-bar declines, consistent with the book-doc pass's recorded ch-16 skips): `idolatry` (16:21–22 — two closing verses); `sojourners-and-strangers` (16:11, 14 — list-item inclusions in the feast rosters); `remembrance-and-memorials` (16:3, 12 — the exodus-memory substance is carried inside `passover`, and the tag-gaps row already carries 16:3, 12); `leadership` (16:18–20 — appointing vs judging, the justice register primary per the pass); `generosity` as a tag (16:17 single verse — anchor lead above).

## Deuteronomy 17 (subdivided: 17:1–7, 17:8–13, 17:14–20)
Existing tags (book doc): studying-the-word, idolatry, justice-and-oppression, priesthood, leadership
### Applied-tag deltas
- KEEP studying-the-word — the king's standing order: "he shall write himself a copy of this law in a book" and "he shall read from it all the days of his life, that he may learn to fear the LORD his God" (17:18–19).
- KEEP idolatry — one who "has gone and served other gods and worshiped them, or the sun, or the moon, or any of the stars of the sky," a capital covenant breach established only after diligent inquiry (17:2–7).
- KEEP justice-and-oppression — due process at the law's core: "At the mouth of two witnesses, or three witnesses, he who is to die shall be put to death. At the mouth of one witness he shall not be put to death." (17:6).
- KEEP priesthood — "You shall come to the priests who are Levites and to the judge who shall be in those days" — the binding court at the chosen place (17:9–12).
- KEEP leadership — the fenced king: "He shall not multiply wives to himself, that his heart not turn away. He shall not greatly multiply to himself silver and gold." (17:17, with 17:15–20).
### Anchor-extension candidates
- leadership | 17:14–20 | "that his heart not be lifted up above his brothers, and that he not turn away from the commandment to the right hand, or to the left" | medium-high (pack anchors Exod 18:13–26 and the NT elder texts; the king-under-the-law charter is Scripture's limited-accountable-rule locus, the book doc's own "power with humility" query)
- studying-the-word | 17:18–19 | "he shall write himself a copy of this law in a book … and he shall read from it all the days of his life" | medium (pack has no OT daily-reading anchor)
### Lexicon candidates
- justice-and-oppression | two or three witnesses | realistic query phrasings: "two or three witnesses in the bible", "old testament due process" (17:6)
- leadership | the king under the law | realistic query phrasings: "what does the bible say about kings", "power with humility" (17:14–20)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- Not yields: `humble-exaltation` stays withheld per book doc #24 (17:20 one purpose clause, not the chapter's substance); `fear-of-the-lord` (17:19 — single clause inside `studying-the-word`'s own quote; presence bar); `divine-judgment` stays withheld per #24 (human courts enforcing covenant law, not God's own judgment act).

## Deuteronomy 18 (subdivided: 18:1–8, 18:9–14, 18:15–22)
Existing tags (book doc): obedience-to-the-word, tithing, holiness, priesthood, occult-and-divination, false-prophets
### Applied-tag deltas
- KEEP obedience-to-the-word — listening to God's word through his appointed prophet is the chapter's turn: "You shall listen to him" (18:15) and "whoever will not listen to my words which he shall speak in my name, I will require it of him" (18:19).
- KEEP tithing — the concept's firstfruits side: "the first fruits of your grain, of your new wine, and of your oil, and the first of the fleece of your sheep" as the priests' due (18:3–5).
- KEEP holiness — Israel's calling over against the nations' abominations: "You shall be blameless with the LORD your God." (18:13).
- KEEP priesthood — the landless tribe and its support: "The LORD is their inheritance, as he has spoken to them" (18:1–2, with 18:5–8).
- KEEP occult-and-divination — the Bible's fullest occult ban list: "one who uses divination, one who tells fortunes, or an enchanter, or a sorcerer" through necromancer, with the verdict "whoever does these things is an abomination to the LORD" (18:10–12; pack already anchors Deut 18:9–14).
- KEEP false-prophets — the presumptuous-prophet test answered in the text's own words: "if the thing doesn’t follow, nor happen, that is the thing which the LORD has not spoken" (18:21–22; pack already anchors Deut 18:21–22).
### Anchor-extension candidates
- obedience-to-the-word | 18:15, 18:19 | "You shall listen to him." | medium (pack has no Deut anchor; the listen-to-the-prophet register behind the pack's hear-and-obey lexicon)
- priesthood | 18:1–2 | "They shall have no inheritance among their brothers. The LORD is their inheritance, as he has spoken to them." | medium (pack's Deut anchor is 33:8–11; this is the support-and-portion statute the tag-gaps priesthood append already names)
- tithing | 18:4 | "You shall give him the first fruits of your grain, of your new wine, and of your oil" | medium (pack's lexicon carries "firstfruits" but has no Deut anchor; the firstfruits-as-support register beside Malachi's storehouse register)
### Lexicon candidates
- occult-and-divination | pass through the fire | realistic query phrasings: "child sacrifice in the bible", "passing through the fire meaning" (18:10 — the pack's lexicon carries mediums/psychics terms but not the child-sacrifice ban this list opens with)
- false-prophets | the prophet's test | realistic query phrasings: "how to know if a prophet is from God", "prophecy that didn't come true" (18:21–22 — the pack's lexicon has "how to recognize a false prophet" but not the failed-prediction question the chapter itself poses: "How shall we know the word which the LORD has not spoken?")
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6; book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- Not yields (presence-bar and read-back declines, recorded for transparency): `messianic-prophecy` on 18:15–19 NOT tagged — the prophet-like-Moses promise is signposted-only in prior art (book doc #48: NT signpost confined to the motif line), and tagging it would read the later identification back through Acts; forward-pointing note to curation ONLY — the `messianic-prophecy` pack's curator may weigh Deut 18:15–19 alongside the pack's own NT-quoted anchors at pack time, with no display tag and no lexicon row routed through the NT reading here. `fear-not` (18:22 "You shall not be afraid of him" — single closing clause, not the pack's comfort register). `the-name-of-god` (18:5, 19–22 — in-the-name phrasing is instrumental throughout, not the pack's teaching substance).

## Deuteronomy 19
Existing tags (book doc): pastoral-refuge-and-justice, honesty, cities-of-refuge
### Applied-tag deltas
- ADD slander-and-false-accusation — WEB quote: "If an unrighteous witness rises up against any man to testify against him of wrongdoing" (19:16); "if the witness is a false witness, and has testified falsely against his brother, then you shall do to him as he had thought to do to his brother" (19:18–19) — the Torah's core false-witness statute, a full judicial unit (19:15–21): one witness can never convict ("At the mouth of two witnesses, or at the mouth of three witnesses, shall a matter be established," 19:15), and the lying witness receives the penalty he schemed. Beside `honesty` per the §11.2 both-tags ruling — truthfulness commanded vs the falsely accused protected, the pack's own "false witnesses against me" register. Not considered in the book doc's 2026-08-25 pass (ch 19 absent from its add and skip lists) — an honest gap, not an overturn.
- KEEP pastoral-refuge-and-justice — the personal-protection register per book doc Decisions #26: refuge for the man who "kills his neighbor unintentionally, and didn’t hate him in time past" from "the avenger of blood" in his hot anger, and a court that shields the accused from lone and lying witnesses (19:4–6, 15–19).
- KEEP honesty — false testimony punished in kind: "then you shall do to him as he had thought to do to his brother" (19:18–19; book doc #36 stands).
- KEEP cities-of-refuge — the statute in full: three cities with the way prepared "that every man slayer may flee there," three more if the border is enlarged, and no shelter for the man who "hates his neighbor, lies in wait for him" (19:1–13; corpus-blocked roster row 25 id, display tag only).
### Anchor-extension candidates
- slander-and-false-accusation | 19:16–19 | "if the witness is a false witness, and has testified falsely against his brother, then you shall do to him as he had thought to do to his brother" | medium-high (pack's anchors are all Psalms/NT personal-register texts; this is Scripture's false-witness prosecution statute)
- honesty | 19:18–19 | "the judges shall make diligent inquisition; and behold, if the witness is a false witness…" | low-medium (pack's anchors are all NT; a Torah truth-in-court witness)
### Lexicon candidates
- vengeance | eye for eye | realistic query phrasings: "eye for an eye meaning", "is eye for an eye about revenge" (19:21 — curation note: here it is judicial penalty for a false witness, not personal revenge; the pack already anchors Matt 5:38–39, so the query family should land on the pack's own texts with 19:21 as the statute witness)
- justice-and-oppression | ancient landmark | realistic query phrasings: "do not move boundary stones", "moving landmarks in the bible" (19:14 — "You shall not remove your neighbor’s landmark, which they of old time have set"; no pack lexicon carries the phrase)
### New-concept candidates
None. (Two roster routings, noted not duplicated: the cities-of-refuge institution is roster row 25 — Deut 19:1–13 is already among that row's recorded blocking refs, nothing new to add; 19:21's "life for life, eye for eye, tooth for tooth, hand for hand, foot for foot" matches roster row 28 `restitution`'s recorded Lev 24:17–21 lex-talionis territory — Deut 19:16–21 noted as candidate refs for that row's curator.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- Not yields (presence-bar declines): `vengeance` (the avenger of blood is a named legal institution the statute constrains, not the pack's personal-revenge or vengeance-is-God's register; logged above as a lexicon candidate for 19:21 only); `justice-and-oppression` as a tag (the chapter's due-process substance is carried by `pastoral-refuge-and-justice` and `honesty`, and the pack's oppression-of-the-poor register is not ch 19's material — its Deut 16:18–20 anchor serves courtroom queries engine-side; adding it here would be broad-duplicating-specific).

## Deuteronomy 20
Existing tags (book doc): fear-not, gods-protection, warfare
### Applied-tag deltas
- KEEP fear-not — the priest's battle liturgy piles four charges against fear: "Don’t let your heart faint! Don’t be afraid, nor tremble, neither be scared of them" (20:3, with 20:1, 8).
- KEEP gods-protection — the ground of the courage: "for the LORD your God is he who goes with you, to fight for you against your enemies, to save you." (20:4).
- KEEP warfare — the war-law institution on its own terms: exemptions sending men home, "When you draw near to a city to fight against it, then proclaim peace to it" (20:10), the cities of these peoples utterly destroyed — "you shall save alive nothing that breathes" for the stated reason "that they not teach you to follow all their abominations" (20:16, 18) — and fruit trees spared: "for is the tree of the field man, that it should be besieged by you?" (20:19). (Corpus-blocked roster row 30 id, display tag only; register care per book doc #46/#60 stands — described without softening and without endorsement.)
### Anchor-extension candidates
- fear-not | 20:1–4 | "Don’t let your heart faint! Don’t be afraid, nor tremble, neither be scared of them" | medium (pack has no battle-liturgy anchor; the fear-before-battle register with God's presence as its ground)
- victory-in-christ | 20:4 | "for the LORD your God is he who goes with you, to fight for you against your enemies, to save you." | medium (the pack's own god-fights-for-us register — its Exod 14:13–14 anchor is the same battle-belongs-to-the-LORD witness; this is the standing statute form)
### Lexicon candidates
- fear-not | courage before battle | realistic query phrasings: "God is with you in battle", "courage before a battle" (20:1–4)
### New-concept candidates
None. (The war-law institution matches corpus-blocked roster row 30 `warfare` — ROUTED, not duplicated: Deut 20:1–20 is already that row's leading blocking ref; nothing new to add.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- Not yields (presence-bar declines): `trusting-in-man` (20:1's "horses, chariots, and a people more numerous than you" are the enemy's strength feared, not Israel's misplaced trust — the pack's trusting-in-horses-and-chariots register runs the other way); `presence-of-god` (20:1, 4 — the with-you clauses are the ground carried inside `gods-protection`'s justification, not a separate presence teaching).

## Deuteronomy 21 (subdivided: 21:1–9, 21:10–14, 21:15–17, 21:18–21, 21:22–23)
Existing tags (book doc): forgiveness-of-sins, sacrifice-and-atonement, warfare, inheritance, death-and-burial
### Applied-tag deltas
- KEEP forgiveness-of-sins — the rite ends in God's own answer to the elders' plea: "Forgive, LORD, your people Israel, whom you have redeemed, and don’t allow innocent blood among your people Israel" — "The blood shall be forgiven them." (21:8; book doc Decisions #31's substance rationale stands — forgiveness explicitly granted in answer to prayer).
- KEEP sacrifice-and-atonement — the unsolved-murder rite entire: the heifer's neck broken in the valley, hands washed over it, innocent blood put away (21:1–9; corpus-blocked roster row 1 id, display tag only; OT-rite register per book doc #60 stands).
- KEEP warfare — the captive-wife law stated as the text states it: she shall "bewail her father and her mother a full month" before marriage, and if rejected, freed outright — "You shall not deal with her as a slave, because you have humbled her." (21:10–14; corpus-blocked roster row 30 id, display tag only; descriptive register per book doc #60 stands).
- KEEP inheritance — the firstborn's double portion protected against favoritism: "The right of the firstborn is his." (21:17, with 21:15–16; corpus-blocked roster row 26 id, display tag only).
- KEEP death-and-burial — same-day burial commanded even for the executed: "you shall surely bury him the same day; for he who is hanged is accursed of God" (21:22–23; corpus-blocked roster row 22 id, display tag only).
### Anchor-extension candidates
- favoritism | 21:15–17 | "he may not give the son of the beloved the rights of the firstborn before the son of the hated, who is the firstborn" | low-medium (the pack's partiality register curbed in family law; pack anchors Lev 19:15 / Jas 2:1–9 but no household-favoritism statute)
- forgiveness-of-sins | 21:8 | "Forgive, LORD, your people Israel, whom you have redeemed… The blood shall be forgiven them." | low (a corporate-absolution witness; caution for curation — the pack's register is personal pardon, so this anchor should supplement, never lead, lest confession queries route to a civic rite)
### Lexicon candidates
- the-cross | cursed is everyone who hangs on a tree | realistic query phrasings: "cursed is everyone who hangs on a tree", "why was Jesus hung on a tree" (curation note: the extension rides the pack's OWN Galatians 3:13 anchor — which quotes this statute — so the query family lands on the pack's NT texts; Deut 21:22–23 itself stays signposted-only per the book doc #48 ruling, no tag and no Deut-anchored row)
### New-concept candidates
None. (Four roster routings, noted not duplicated: 21:1–9 is already among roster row 1 `sacrifice-and-atonement`'s recorded blocking refs; 21:10–14 among row 30 `warfare`'s; 21:15–17 rides row 26 `inheritance`'s Deut refs via the tag-gaps append; 21:22–23 among row 22 `death-and-burial`'s. Nothing new to add to any of the four.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- Not yields (presence-bar and read-back declines): `parenting` stays withheld per book doc #29 (the rebellious-son procedure is a judicial statute for a failed extreme case, not raising-children teaching); `favoritism` as a tag (21:15–17 — one three-verse case law of five, carried by `inheritance`; logged above as an anchor-extension candidate); `the-cross` on 21:22–23 NOT tagged — later-revelation read-back (the chapter's law is burial and defilement; the Galatians application is signposted-only per #48), served instead by the forward-pointing lexicon note above.

## Deuteronomy 22
Existing tags (book doc): loving-others
### Applied-tag deltas
- ADD slander-and-false-accusation — WEB quote: "accuses her of shameful things, gives her a bad name" (22:14); "They shall fine him one hundred shekels of silver, and give them to the father of the young lady, because he has given a bad name to a virgin of Israel." (22:19) — a full seven-verse case law (22:13–19) in which a false accuser is prosecuted, chastised, and fined, and the slandered bride vindicated and protected ("He may not put her away all his days," 22:19); the pack's false-accusation substance in statute form, the same register this sweep added on ch 19. Not considered in the book doc's 2026-08-25 pass (its ch-22 note records "no candidates there" from the worklist — this engine-built id was not on that worklist for ch 22) — an honest gap, not an overturn.
- KEEP loving-others — neighbor-love in statute form: the straying ox brought back, the lost thing kept safe, "You shall surely help him to lift them up again." with the thrice-repeated charge not to hide yourself (22:1, 3, 4; book doc #35's borderline-kept rationale stands).
### Anchor-extension candidates
- loving-others | 22:1–4 | "You shall surely bring them again to your brother." | medium (pack's anchors are all NT one-another texts; this is neighbor-love legislated in ordinary life)
- slander-and-false-accusation | 22:13–19 | "he has given a bad name to a virgin of Israel" | medium (the false-accuser-punished statute; pack has no Torah anchor)
### Lexicon candidates
- loving-others | lost property returned | realistic query phrasings: "returning lost property in the bible", "helping your neighbor's animal" (22:1–4)
### New-concept candidates
None. (Checked, not proposed: 22:5's clothing statute ("A woman shall not wear men’s clothing, neither shall a man put on women’s clothing") is a single verse — below pack scale under the wine-and-health precedent (a real modern query family, but one verse with no second anchor anywhere in the vocabulary's corpus view; recorded here for curation rather than minted, and any eventual treatment must describe the statute without adjudicating beyond it). One roster routing: 22:1–3's restore-it-to-him duty ("you shall restore it to him") is adjacent to roster row 28 `restitution`'s Exodus property-law territory — Deut 22:1–3 noted as candidate refs for that row's curator if its scope covers lost-property restoration.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- Not yields (presence-bar declines): `pastoral-sexual-purity` stays withheld per book doc #30 (communal judicial statutes, not the pack's personal-crisis register — tagging would route personal-struggle queries to stoning penalties); `godly-marriage` (the marriage material is violation case law, not the pack's husbands-and-wives teaching substance); `honesty` (the false-accusation material's truth-substance is carried by the ADD above at its proper register — the protection of the accused — rather than doubling `honesty` onto a second chapter for the same verses).

## Deuteronomy 23
Existing tags (book doc): presence-of-god, holiness, gods-love, justice-and-oppression, oaths-and-vows, warfare
### Applied-tag deltas
- KEEP presence-of-god — the camp rules rest on one reality: "for the LORD your God walks in the middle of your camp, to deliver you, and to give up your enemies before you" (23:14).
- KEEP holiness — the conclusion drawn from that presence: "Therefore your camp shall be holy, that he may not see an unclean thing in you, and turn away from you." (23:14).
- KEEP gods-love — why Balaam's hired curse failed: "the LORD your God turned the curse into a blessing to you, because the LORD your God loved you" (23:5).
- KEEP justice-and-oppression — the escaped servant sheltered, not returned: "You shall not deliver to his master a servant who has escaped from his master to you." … "You shall not oppress him." (23:15–16).
- KEEP oaths-and-vows — "When you vow a vow to the LORD your God, you shall not be slack to pay it," while "if you refrain from making a vow, it shall be no sin in you" (23:21–22).
- KEEP warfare — the war camp's discipline: washing and sanitation required because God walks in the camp (23:9–14; corpus-blocked roster row 30 id, display tag only).
### Anchor-extension candidates
- presence-of-god | 23:14 | "for the LORD your God walks in the middle of your camp, to deliver you, and to give up your enemies before you" | medium (pack has no God-in-the-camp anchor; the presence-with-consequences register)
- oaths-and-vows | 23:21–23 | "When you vow a vow to the LORD your God, you shall not be slack to pay it" | medium (the Torah statute behind the pack's Eccl 5:4–5 anchor; pack's Torah anchors are Num 6:1–8 / Num 30:2)
- bondservants-and-masters | 23:15–16 | "You shall not deliver to his master a servant who has escaped from his master to you." | medium (the asylum law — a distinctive witness beside the pack's Jer 34:8–17 release-law anchor)
- gods-love | 23:5 | "the LORD your God turned the curse into a blessing to you, because the LORD your God loved you" | low-medium (a because-he-loved-you narrative witness; pack has no Deut anchor beyond the ch-7 candidate already logged)
### Lexicon candidates
- justice-and-oppression | lending on interest | realistic query phrasings: "usury in the bible", "charging interest in the bible" (23:19–20 — `contentment` owns bare "debt"; no lexicon carries the usury/interest phrasing)
- blessing | curse turned into a blessing | realistic query phrasings: "God turned the curse into a blessing", "Balaam's curse became a blessing" (23:5)
### New-concept candidates
None. (Roster routing, noted not duplicated: the camp-purity law 23:9–14 is already among roster row 30 `warfare`'s recorded blocking refs; nothing new to add.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
- Not yields (presence-bar declines at the soft cap, consistent with the book-doc pass's recorded ch-23 skip): `sojourners-and-strangers` (23:7 "You shall not abhor an Egyptian, because you lived as a foreigner in his land" — single verse, yielded at cap per the 2026-08-25 pass; the tag-gaps row already carries 23:7); `bondservants-and-masters` as a tag (23:15–16 — a two-verse statute inside a miscellany chapter, carried by `justice-and-oppression`; logged above as an anchor-extension candidate — contrast ch 15's seven-verse release statute, which this sweep did tag).

## Deuteronomy 24 (subdivided: 24:1–5, 24:6–22)
Existing tags (book doc): pastoral-marriage-divorce-teaching, pastoral-refuge-and-justice, generosity, justice-and-oppression, sojourners-and-strangers
### Applied-tag deltas
- ADD individual-responsibility — WEB quote: "The fathers shall not be put to death for the children, neither shall the children be put to death for the fathers. Every man shall be put to death for his own sin." (24:16) — a freestanding statute stating the pack's whole principle in the chapter's own words, and the pack itself already anchors Deuteronomy 24:16 — the engine already names this passage for the concept, so the display tag matches the engine's own witness (the ch-8 `the-lords-discipline` precedent: one verse can carry a tag when the verse IS the teaching locus and the pack's own anchor). Not considered in the book doc's 2026-08-25 pass (ch 24 absent from its add and skip lists for this id) — an honest gap, not an overturn.
- KEEP pastoral-marriage-divorce-teaching — the certificate-of-divorce case law itself: written certificate, sent from the house, no return after remarriage (24:1–4; book doc Decisions #28 stands — inherently the personal register the pack names).
- KEEP pastoral-refuge-and-justice — statute after statute shields the vulnerable individual: "You shall surely restore to him the pledge when the sun goes down, that he may sleep in his garment and bless you," wages before sunset, the widow's clothing untouchable (24:10–15, 17; book doc #27 stands — the personal-protection register).
- KEEP generosity — the harvest deliberately left: "It shall be for the foreigner, for the fatherless, and for the widow, that the LORD your God may bless you in all the work of your hands." (24:19, with 24:20–21).
- KEEP justice-and-oppression — the national frame of the same statutes: no millstone in pledge "for he takes a life in pledge" (24:6), wages the same day "lest he cry against you to the LORD, and it be sin to you" (24:15), and "You shall not deprive the foreigner or the fatherless of justice" (24:17).
- KEEP sojourners-and-strangers — the foreigner written into wage, court, and harvest law, twice grounded in memory: "You shall remember that you were a slave in the land of Egypt." (24:22, with 24:14, 17–21).
### Anchor-extension candidates
- justice-and-oppression | 24:14–15 | "In his day you shall give him his wages, neither shall the sun go down on it, for he is poor and sets his heart on it, lest he cry against you to the LORD" | medium (the wage-justice statute behind the pack's Jas 5:4–6 anchor; pack's Deut anchor is 16:18–20 only)
- generosity | 24:19–21 | "It shall be for the foreigner, for the fatherless, and for the widow, that the LORD your God may bless you in all the work of your hands." | medium (the gleaning provision-law; pack has no Torah anchor — pairs with the ch-14 and ch-15 candidates already logged)
### Lexicon candidates
- marriage-divorce-teaching (display id pastoral-marriage-divorce-teaching) | certificate of divorce | realistic query phrasings: "certificate of divorce meaning", "writ of divorce in the bible" (24:1–3 — the pack's lexicon carries the is-divorce-a-sin family but not the certificate phrasing this passage owns)
- generosity | gleaning | realistic query phrasings: "gleaning in the bible", "leaving part of the harvest for the poor" (24:19–21)
### New-concept candidates
None. (Roster routing, noted not duplicated: the newlywed's war exemption 24:5 is already among roster row 30 `warfare`'s recorded blocking refs — the 2026-08-25 pass's skip of a ch-24 `warfare` tag on it stands; nothing new to add.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6 (after the ADD); book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- Not yields (presence-bar declines): `warfare` (24:5 single exemption verse — the pass's skip stands, routed to roster row 30 above); `care-for-widows` (the widow appears in pledge and gleaning clauses (24:17, 19–21) carried by `justice-and-oppression`/`generosity`/the pastoral tag — list-member presence, not the pack's widow-care teaching substance); `bondservants-and-masters` (24:7's man-stealing statute is kidnapping law, one verse, not the pack's servant-master relations register).

## Deuteronomy 25
Existing tags (book doc): honesty, kinsman-redeemer, warfare
### Applied-tag deltas
- ADD justice-and-oppression — WEB quote: "then they shall justify the righteous and condemn the wicked" (25:1); "You shall have a perfect and just weight. You shall have a perfect and just measure, that your days may be long in the land which the LORD your God gives you." (25:15) — the chapter opens in the courtroom (righteous judgment, the flogging capped "lest… your brother will be degraded in your sight," 25:3) and closes commerce under the same rule, with the double standard named "an abomination to the LORD your God" (25:16); dishonest weights are the pack's own register — its Micah 6:10–12 anchor is this very theme. Beside `honesty` per the §11.2 both-tags ruling (truthfulness virtue vs justice-in-court-and-market register). Not considered in the book doc's 2026-08-25 pass (ch 25 absent from its add and skip lists for this id) — an honest gap, not an overturn.
- KEEP honesty — just weights as covenant integrity: "You shall have a perfect and just weight. You shall have a perfect and just measure" (25:13–16; book doc #36 stands).
- KEEP kinsman-redeemer — the levirate duty in its own scope: "perform the duty of a husband’s brother to her" so that the dead man's name "not be blotted out of Israel" (25:5–10; corpus-blocked roster row 27 id, display tag only; the levirate either/or flag stands — if curation scopes the row to property/person redemption, these refs become a separate levirate-marriage candidate, NOT a double-mint).
- KEEP warfare — the standing charge against Amalek, who "struck the rearmost of you, all who were feeble behind you, when you were faint and weary; and he didn’t fear God": when God gives rest, "you shall blot out the memory of Amalek from under the sky. You shall not forget." (25:17–19; corpus-blocked roster row 30 id, display tag only; descriptive register per book doc #60 stands).
### Anchor-extension candidates
- justice-and-oppression | 25:13–16 | "You shall have a perfect and just weight. You shall have a perfect and just measure" | medium (the Torah statute behind the pack's Micah 6:10–12 dishonest-measures anchor)
- honesty | 25:15–16 | "For all who do such things, all who do unrighteously, are an abomination to the LORD your God." | low-medium (pack's anchors are all NT; the commercial-honesty witness)
### Lexicon candidates
- honesty | just weights and measures | realistic query phrasings: "honest scales in the bible", "cheating in business in the bible" (25:13–16)
- supporting-gospel-workers | do not muzzle the ox | realistic query phrasings: "do not muzzle the ox meaning", "should pastors be paid" (curation note: the extension rides the pack's OWN 1 Corinthians 9:11–14 anchor — Paul's citation of this statute; Deut 25:4 itself stays on its own terms per the book doc #48 signpost ruling, no tag and no Deut-anchored row)
### New-concept candidates
None. (Two roster routings, noted not duplicated: 25:5–10 is already roster row 27 `kinsman-redeemer`'s recorded Deut ref, with the either/or flag carried whole; 25:17–19 is already among row 30 `warfare`'s blocking refs. Nothing new to add to either.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- Not yields (presence-bar and read-back declines): `supporting-gospel-workers` on 25:4 NOT tagged — later-revelation read-back (the statute on its own terms is the working animal unmuzzled; the ministry application is Paul's), served by the forward-pointing lexicon note above; `image-of-god` (25:3's degraded-brother clause is a dignity limit inside the flogging statute — single clause, and tagging would read the doctrine across); `vengeance` (the Amalek charge is a covenant judgment command carried by `warfare`, not the pack's personal-revenge or vengeance-is-God's teaching register).

## Deuteronomy 26
Existing tags (book doc): tithing, thanksgiving, worship, covenant
### Applied-tag deltas
- ADD remembrance-and-memorials — WEB quote: "My father was a Syrian ready to perish." (26:5); "The LORD brought us out of Egypt with a mighty hand, with an outstretched arm, with great terror, with signs, and with wonders" (26:8) — the firstfruits liturgy scripts the remembering-and-retelling practice itself: every worshiper, basket in hand, must recite the nation's story from Aramean wanderer to the land, year after year — the row's remember-and-retell register in commanded liturgical form (26:1–10). Corpus-blocked roster row 33 id, display tag only; engine finding ROUTED to that row (see New-concept section). Not considered in the book doc's 2026-08-25 pass (its recorded ch-26 skip is `sojourners-and-strangers` only) — an honest gap, not an overturn.
- KEEP tithing — the firstfruits basket brought to the chosen place, and "the year of tithing" given so the Levite, foreigner, fatherless, and widow "may eat within your gates and be filled" (26:1–4, 10, 12).
- KEEP thanksgiving — the recitation ends in grateful acknowledgment and joy: "Now, behold, I have brought the first of the fruit of the ground, which you, the LORD, have given me." (26:10, with 26:11).
- KEEP worship — the rite is worship by name: "You shall set it down before the LORD your God, and worship before the LORD your God." (26:10).
- KEEP covenant — the closing exchange of declarations: "You have declared today that the LORD is your God" and "The LORD has declared today that you are a people for his own possession" (26:17–18).
### Anchor-extension candidates
- thanksgiving | 26:10–11 | "Now, behold, I have brought the first of the fruit of the ground, which you, the LORD, have given me." | medium (a commanded gratitude liturgy; pack has no OT firstfruits anchor)
- covenant | 26:17–18 | "You have declared today that the LORD is your God… The LORD has declared today that you are a people for his own possession" | medium (the mutual-declaration witness; pack's Deut anchor is 7:9 only)
- tithing | 26:12 | "When you have finished tithing all the tithe of your increase in the third year, which is the year of tithing" | medium (the third-year charity tithe; pack has no Deut anchor — pairs with the ch-14 candidate already logged)
- joy-in-the-lord | 26:11 | "You shall rejoice in all the good which the LORD your God has given to you" | low (single verse; completes the commanded-rejoicing set already logged on chs 12 and 16)
### Lexicon candidates
- thanksgiving | wandering Aramean | realistic query phrasings: "my father was a wandering aramean", "the little creed in deuteronomy" (26:5 — the WEB reads "a Syrian ready to perish," so the familiar phrasing can only reach this text through a lexicon row)
- covenant | a people for his own possession | realistic query phrasings: "a people for his own possession", "God's treasured possession" (26:18)
### New-concept candidates
None. (Roster routing, noted not duplicated: the firstfruits creed 26:1–11 matches roster row 33 `remembrance-and-memorials`' remembering-and-retelling register — Deut 26:5–10 noted as candidate refs for that row's curator, a liturgical complement to its stones-that-prompt-a-question Joshua spine; tagged above as display vocabulary only.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- Not yields (presence-bar declines): `holiness` (26:19 "a holy people to the LORD your God" — single closing verse, not the chapter's substance); `gods-provision` (the given land and fruit are acknowledged inside `thanksgiving`/`tithing`'s material — adding it would be broad-duplicating-specific); `joy-in-the-lord` as a tag (26:11 single verse — logged above as an anchor-extension candidate); `sojourners-and-strangers` (26:11–13 list-item inclusions — the 2026-08-25 pass's skip stands; the tag-gaps row already carries 26:11–13).

## Deuteronomy 27 (subdivided: 27:1–10, 27:11–26)
Existing tags (book doc): covenant, obedience-to-the-word, worship
### Applied-tag deltas
- KEEP covenant — the ceremony enacts covenant identity: "Be silent and listen, Israel! Today you have become the people of the LORD your God." (27:9, with the law written on plastered stones, 27:2–8).
- KEEP obedience-to-the-word — "You shall therefore obey the LORD your God’s voice" (27:10), sealed by the widest curse: "Cursed is he who doesn’t uphold the words of this law by doing them." (27:26).
- KEEP worship — the altar of uncut stones with its offerings: "You shall sacrifice peace offerings, and shall eat there. You shall rejoice before the LORD your God." (27:5–7).
### Anchor-extension candidates
- obedience-to-the-word | 27:26 | "Cursed is he who doesn’t uphold the words of this law by doing them." | medium (pack has no Deut anchor; the whole-law-or-curse clause — its later NT citation is a curation note only, the anchor stays in Deuteronomy's own frame)
- covenant | 27:9 | "Today you have become the people of the LORD your God." | medium (the becoming-God's-people declaration; pack's Deut anchor is 7:9 only)
- joy-in-the-lord | 27:7 | "You shall rejoice before the LORD your God." | low (completes the commanded-rejoicing set logged on chs 12, 16, 26)
### Lexicon candidates
- worship | altar of uncut stones | realistic query phrasings: "altar of uncut stones meaning", "why no iron tool on the altar" (27:5–6)
### New-concept candidates
- amen | the people's twelve-fold sworn assent — "All the people shall answer and say, ‘Amen.’" (27:15) — is the practice behind heavy real queries ("what does amen mean", "why do we say amen", "amen in the bible") with no home in the concept index, the adopted list, or the roster | anchor: Deut 27:15–26 (Neh 8:6, 1 Cor 14:16, Rev 22:20 would complete a pack)
- secret-sin | the curse list singles out sins done beyond any court's sight — "and sets it up in secret" (27:15), "Cursed is he who secretly kills his neighbor." (27:24) — and "does God see secret sin" / "hidden sin in the bible" queries have no home (`pastoral-god-sees-my-suffering` is the sufferer's register, not the sinner's; `forgiveness-of-sins` owns confession, not the seen-in-secret claim) | anchors: Deut 27:15, 24 (Ps 90:8, Eccl 12:14, Luke 12:2 would complete a pack)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- Not yields (presence-bar declines, consistent with the book-doc 2026-08-25 pass's recorded ch-27 skips): `idolatry` (27:15 single curse-list item — the pass's skip stands); `justice-and-oppression` and `sojourners-and-strangers` (27:19 single curse-list item — the pass's skips stand; the tag-gaps rows already carry 27:19); `divine-judgment` stays withheld per book doc #42 (the twelve curses are sworn self-imprecations awaiting breach, not enacted judgment — ch 28 carries the tag; no new ground); `blessing` (27:12 assigns six tribes "to bless the people" but the chapter records no blessing content — the curses only).

## Deuteronomy 28 (subdivided: 28:1–14, 28:15–68)
Existing tags (book doc): blessing, obedience-to-the-word, divine-judgment
### Applied-tag deltas
- ADD exile-and-captivity — WEB quote: "The LORD will bring you, and your king whom you will set over yourselves, to a nation that you have not known" (28:36); "The LORD will scatter you among all peoples, from one end of the earth to the other end of the earth." (28:64) — exile is the curse section's sustained climax, not a passing clause: sons and daughters "will go into captivity" (28:41), the siege ends in scattering (28:63–68), and life among the nations is described at length ("a trembling heart, failing of eyes, and pining of soul," 28:65). Adopted §11.1 id (engine-built: no) — display tag only; engine work routes to corpus-blocked roster row 45, whose fold-vs-separate routing remains Jesse's call (this tag prejudges nothing). Not on the 2026-08-25 tag-apply worklist for Deuteronomy at all — an honest gap, not an overturn. Framed strictly as the covenant's own terms to Israel per book doc #45; beside `divine-judgment` per the §11.2 both-tags ruling (the exile theme vs the judgment acts).
- KEEP blessing — "All these blessings will come upon you, and overtake you, if you listen to the LORD your God’s voice." (28:2, with 28:3–14; prosperity guardrail per book doc #45 stands — the covenant's own terms to Israel at Moab, no prosperity-formula register).
- KEEP obedience-to-the-word — the chapter's single hinge: "if you shall listen diligently to the LORD your God’s voice" (28:1) and "because you didn’t listen to the LORD your God’s voice" (28:45, with 28:15).
- KEEP divine-judgment — the curses as God's own acts: "The LORD will send on you cursing, confusion, and rebuke in all that you put your hand to do, until you are destroyed" (28:20, with 28:21–25, 63–64) — the hard texts, including the siege distress of 28:53–57, described honestly and without relish.
### Anchor-extension candidates
- blessing | 28:1–6 | "All these blessings will come upon you, and overtake you, if you listen to the LORD your God’s voice." | medium (pack has no Deut 28 anchor; any extension must carry the #45 covenant-terms framing — no prosperity-gospel register in gist or lexicon)
- divine-judgment | 28:15, 28:20 | "all these curses will come on you and overtake you" | medium (pack has no covenant-curse anchor; the judicial-sanctions register)
- the-name-of-god | 28:58 | "that you may fear this glorious and fearful name, THE LORD your God" | low-medium (the fear-the-name witness; the 2026-08-25 pass's tag skip on this single verse stands — anchor lead only)
### Lexicon candidates
- blessing | the head and not the tail | realistic query phrasings: "head and not the tail meaning", "I am the head and not the tail" (28:13, 44 — curation caution: a heavy prosperity-register query family; any row must land searchers on the covenant-conditional frame per book doc #45, never a promise formula)
- joy-in-the-lord | serving God with gladness | realistic query phrasings: "serving God with joy", "joyless obedience" (28:47 — "Because you didn’t serve the LORD your God with joyfulness and with gladness of heart"; the failure named in the curse's own reason clause)
### New-concept candidates
None. (Roster routing, noted not duplicated: the exile texts 28:36–37, 41, 49–68 are candidate refs for corpus-blocked roster row 45 `exile-and-captivity`, whose Jesse-call routing flag — fold into `sojourners-and-strangers` vs separate id — travels intact; tagged above as adopted display vocabulary only.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- Not yields (presence-bar declines): `the-name-of-god` (28:58 — the pass's skip stands; logged above as an anchor lead); `idolatry` (28:36, 64 "you will serve other gods" — exile-consequence clauses inside the curse, not the chapter's idolatry teaching); `joy-in-the-lord` (28:47 single reason clause — logged above as a lexicon candidate); `gods-provision` (the blessing side's rain and abundance stay routed through `blessing` per the book doc #44 no-stacking precedent); `justice-and-oppression` (28:29, 33 "oppressed and robbed" describe Israel's suffering under the curse, not the pack's justice teaching).

## Deuteronomy 29
Existing tags (book doc): covenant, self-deception, gods-provision, hardness-of-heart, idolatry
### Applied-tag deltas
- ADD divine-judgment — WEB quote: "The LORD will not pardon him, but then the LORD’s anger and his jealousy will smoke against that man, and all the curse that is written in this book will fall on him" (29:20); "like the overthrow of Sodom, Gomorrah, Admah, and Zeboiim, which the LORD overthrew in his anger, and in his wrath" (29:23) — a nine-verse judgment movement (29:20–28) of God's own declared acts, ending "The LORD rooted them out of their land in anger, in wrath, and in great indignation" (29:28); the pack's lexicon owns "sodom and gomorrah," and the register is God's-own-act-declared — the same ground on which ch 28 carries the tag (book doc #42's ch-27 withholding distinguished sworn self-imprecations, a different case). Not considered for ch 29 in the book doc or its 2026-08-25 pass (absent from its add and skip lists) — an honest gap, not an overturn.
- KEEP covenant — the Moab covenant with every rank present and generations absent: "that you may enter into the covenant of the LORD your God, and into his oath" (29:12, with 29:10–15).
- KEEP self-deception — "I shall have peace, though I walk in the stubbornness of my heart" (29:19).
- KEEP gods-provision — "Your clothes have not grown old on you, and your sandals have not grown old on your feet." (29:5, with 29:6).
- KEEP hardness-of-heart — both sides in the chapter's own words: "the LORD has not given you a heart to know, eyes to see, and ears to hear, to this day" (29:4) and the self-chosen stubbornness of heart (29:19).
- KEEP idolatry — the named breach: "a root that produces bitter poison" (29:18) turning to serve other gods, and the nations' verdict, "Because they abandoned the covenant of the LORD, the God of their fathers" (29:25, with 29:17, 26).
### Anchor-extension candidates
- self-deception | 29:19 | "I shall have peace, though I walk in the stubbornness of my heart" | medium-high (pack's anchors are all NT; this is the OT keystone of its deceiving-yourself register)
- gods-provision | 29:5–6 | "Your clothes have not grown old on you, and your sandals have not grown old on your feet." | medium (pairs with the ch-8 wilderness candidate; the forty-year preservation witness)
- hardness-of-heart | 29:4 | "the LORD has not given you a heart to know, eyes to see, and ears to hear, to this day." | medium (the tag-gaps Deuteronomy append already names 29:4, 19 for this row; the unopened-heart register beside the pack's Pharaoh anchors)
- covenant | 29:15 | "but with those who stand here with us today before the LORD our God, and also with those who are not here with us today" | low-medium (the with-future-generations witness; pack's Deut anchor is 7:9 only)
### Lexicon candidates
- backsliding | root of bitterness | realistic query phrasings: "root of bitterness meaning", "bitter root in the bible" (29:18 — "a root that produces bitter poison"; the pack already anchors Heb 12:15, the verse that takes this figure up, so the row lands the query family on the pack's own texts)
- self-deception | false peace | realistic query phrasings: "false sense of peace with God", "telling yourself you are safe in sin" (29:19)
### New-concept candidates
- secret-things-and-revealed-things | "The secret things belong to the LORD our God; but the things that are revealed belong to us and to our children forever, that we may do all the words of this law." (29:29) is a heavily searched boundary verse ("the secret things belong to the Lord meaning", "what has God not revealed", "Deuteronomy 29:29 meaning") with no vocabulary home — `wisdom-from-god` is asking for wisdom, `trustworthiness-of-scripture` a different claim; not in the index, the adopted list, the declines, or the roster | anchor: Deut 29:29 (single verse here — Rom 11:33–34 and Ps 131:1 would complete a pack; decide lexicon-extension-vs-mint at curation)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6 (after the ADD)
### Decisions record
- Not yields (presence-bar declines): `sojourners-and-strangers` (29:11 in-scene list item — the 2026-08-25 pass's skip stands); `sovereignty-of-god` (adopted §11.1 id considered for 29:29 and declined — a single verse whose substance is the revelation boundary, not the pack-scale sovereignty register; logged as the new-concept candidate above instead); `gods-faithfulness` (29:13 "as he swore to your fathers" — single clause inside the covenant material, carried by `covenant`).

## Deuteronomy 30 (subdivided: 30:1–10, 30:11–20)
Existing tags (book doc): repentance, obedience-to-the-word, restoration-of-israel, circumcision-of-the-heart, loving-god
### Applied-tag deltas
- KEEP repentance — the pivot repeated as condition and act: "return to the LORD your God and obey his voice according to all that I command you today, you and your children, with all your heart and with all your soul" (30:2, with 30:8, 10).
- KEEP obedience-to-the-word — the commandment within reach: "But the word is very near to you, in your mouth and in your heart, that you may do it." (30:14, with 30:11–13 — kept in Deuteronomy's own terms per the no-read-back rule).
- KEEP restoration-of-israel — "the LORD your God will release you from captivity, have compassion on you, and will return and gather you from all the peoples" (30:3, with 30:4–5; pack already anchors Deut 30:1–5).
- KEEP circumcision-of-the-heart — the figure as God's own gift: "The LORD your God will circumcise your heart, and the heart of your offspring, to love the LORD your God with all your heart and with all your soul, that you may live." (30:6; corpus-blocked roster row 37 id, display tag only — Deut 30:6 is already among that row's recorded blocking refs).
- KEEP loving-god — the choice of life defined: "to love the LORD your God, to obey his voice, and to cling to him; for he is your life, and the length of your days" (30:20, with 30:16).
### Anchor-extension candidates
- repentance | 30:1–3, 30:10 | "return to the LORD your God and obey his voice … with all your heart and with all your soul" | medium-high (pack anchors Ezek 18:30–32 and NT texts; this is the Torah's return-to-the-LORD keystone)
- obedience-to-the-word | 30:11–14 | "But the word is very near to you, in your mouth and in your heart, that you may do it." | medium-high (pack has no Deut anchor; the not-too-hard-for-you witness — the anchor stays in Deuteronomy's own frame, its later NT use a curation note only)
- loving-god | 30:6, 30:20 | "to love the LORD your God, to obey his voice, and to cling to him; for he is your life" | medium (pack anchors Deut 6:5 and 10:12 but nothing from ch 30; the tag-gaps loving-god append already names 30:6, 16, 20)
### Lexicon candidates
- obedience-to-the-word | the word is near | realistic query phrasings: "the word is very near you", "is God's command too hard" (30:11–14)
- loving-god | cling to God | realistic query phrasings: "clinging to God", "hold fast to the Lord" (30:20)
### New-concept candidates
- choosing-life | "choose life bible verse" / "Deuteronomy 30:19 meaning" / "life and death set before you" are heavy real queries anchored exactly at the book's great either-or, with no vocabulary home: `salvation` was withheld as a read-back (book doc #34), `obedience-to-the-word` does not carry the either-or register, and no id in the index, adopted list, or roster names it | anchor: Deut 30:19 — "I have set before you life and death, the blessing and the curse. Therefore choose life, that you may live, you and your descendants" (gist caution for curation: describe the covenant choice as the text frames it; the phrase's modern extra-biblical uses adjudicate nothing here)
- gods-delight-in-his-people | adopted §11.1 id (engine-built: no, no roster row) — an engine-side vocabulary-addition anchor candidate, not a tag: "for the LORD will again rejoice over you for good, as he rejoiced over your fathers" (30:9) is that id's rejoicing-over register inside the restoration promise (single verse here, so no display tag; noted for the id's eventual pack)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- Not yields (presence-bar and routing declines): `salvation` stays withheld per book doc #34 ("choose life" is covenant life, not the gospel-register id — no new ground); `restoration` stays withheld per #32 (personal renewal-prayer register; the national promise rides `restoration-of-israel`); `blessing`/`gods-provision` on 30:9's prosperity clause (single conditional verse under the #45 guardrail, which governs 30:9 by name — carried inside `restoration-of-israel`); `mercy` (30:3 "have compassion on you" — single clause inside the regathering promise); `gods-delight-in-his-people` as a tag (30:9 single verse — logged above as an engine-side anchor candidate instead).

## Deuteronomy 31 (subdivided: 31:1–8, 31:9–13, 31:14–23, 31:24–29, 31:30)
Existing tags (book doc): fear-not, presence-of-god, studying-the-word, leadership, idolatry
### Applied-tag deltas
- ADD backsliding — WEB quote: "This people will rise up and play the prostitute after the strange gods of the land where they go to be among them, and will forsake me and break my covenant which I have made with them." (31:16); "after my death you will utterly corrupt yourselves, and turn away from the way which I have commanded you" (31:29) — the falling-away foretold is a sustained movement (31:16–21, 27–29), and the witness song is commissioned against that very apostasy (31:19–21); the pack's own register is "apostasy, falling away," and its Judg 2:11–19 anchor is the history this foretelling becomes. Beside `idolatry` per the §11.2 both-tags ruling (forsaking the LORD vs the strange gods turned to). Not on the 2026-08-25 tag-apply worklist for Deuteronomy at all (same worklist blind-spot pattern as `slander-and-false-accusation` and `exile-and-captivity`) — an honest gap, not an overturn.
- KEEP fear-not — the double charge: "Be strong and courageous. Don’t be afraid or scared of them" (31:6) and to Joshua, "Don’t be afraid. Don’t be discouraged." (31:8).
- KEEP presence-of-god — the courage's ground: "the LORD your God himself is who goes with you. He will not fail you nor forsake you." (31:6, with 31:8, 23).
- KEEP studying-the-word — the septennial public reading: "you shall read this law before all Israel in their hearing," that all "may hear, learn, fear the LORD your God, and observe to do all the words of this law" (31:11–12; book doc #38 stands).
- KEEP leadership — succession charged publicly and commissioned by the LORD himself: "Be strong and courageous; for you shall bring the children of Israel into the land which I swore to them. I will be with you." (31:23, with 31:1–8, 14).
- KEEP idolatry — the apostasy's object: "they will turn to other gods, and serve them, and despise me, and break my covenant" (31:20, with 31:16, 18).
### Anchor-extension candidates
- fear-not | 31:6, 31:8 | "Be strong and courageous. Don’t be afraid or scared of them, for the LORD your God himself is who goes with you." | medium-high (pack anchors Josh 1:9 but not its Deut 31 source; witnesses the Joshua-block "be strong and courageous" lexicon-extension flag rather than re-proposing it)
- studying-the-word | 31:11–13 | "you shall read this law before all Israel in their hearing" | medium (the public-reading register; honors the recorded Deuteronomy decline note — check a `studying-the-word` lexicon extension before minting anything)
- backsliding | 31:16, 31:29 | "will forsake me and break my covenant" | medium (pack anchors Judg 2:11–19; this is the foretelling of that history)
- leadership | 31:7–8, 31:23 | "you shall go with this people into the land which the LORD has sworn to their fathers to give them; and you shall cause them to inherit it" | low-medium (the tag-gaps leadership append already names 31:1–8, 23; a succession witness beside the pack's Exod 18 anchor)
### Lexicon candidates
- fear-not | be strong and courageous | realistic query phrasings: "be strong and courageous verse", "be strong and courageous meaning" (31:6–7, 23 — witnesses the Joshua-block flag, cited above, rather than re-proposing it)
- studying-the-word | public reading of Scripture | realistic query phrasings: "public reading of Scripture", "reading the bible aloud in church" (31:11–13 — the route the recorded decline note directs)
### New-concept candidates
None. (Roster check, noted not routed: 31:6–8, 23's "be strong and courageous" charges are the divine-comfort register that roster row 17 `courage`'s own recorded reason says is precisely NOT its gap — courage-to-do-right; the texts stay with `fear-not` and nothing is added to that row.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6 (after the ADD); book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- Not yields (presence-bar and register declines): `loneliness` (the pack already anchors Deut 31:8 engine-side, but the chapter is a national succession scene, not the pack's personal-register teaching — tagging would stretch presence, and there is nothing to add engine-side either); `witness-testimony` (31:19–21, 26's song and book "for a witness against you" are covenant-lawsuit witnesses, not the pack's testimony-about-Jesus register); `sojourners-and-strangers` (31:12 — the pass's skip stands; the tag-gaps row already carries 31:12); `gods-faithfulness` (31:6, 8 "He will not fail you nor forsake you" — carried inside `presence-of-god` and `fear-not`; adding it would be broad-duplicating-specific); `appointed-feasts` (31:10 names the feast of booths as the reading's calendar setting only).

## Deuteronomy 32 (subdivided: 32:1–47, 32:48–52)
Existing tags (book doc): gods-faithfulness, gods-protection, divine-judgment, idolatry, vengeance
### Applied-tag deltas
- ADD no-other-god — WEB quote: "See now that I myself am he. There is no god with me. I kill and I make alive. I wound and I heal. There is no one who can deliver out of my hand." (32:39) — the song's resolution is the no-god-besides-me confession the pack owns, and the theme runs the song's whole length: "The LORD alone led him. There was no foreign god with him." (32:12), "For their rock is not as our Rock" (32:31), and the taunt over the gods that cannot save (32:37–38). Beside `idolatry` per the §11.2 both-tags ruling (the confession vs the breach). The apologetics pass applied this id on chs 4 and 6 only — 32:39 was not on its map; an honest gap, not an overturn.
- KEEP gods-faithfulness — the opening ascription: "The Rock: his work is perfect, for all his ways are just. A God of faithfulness who does no wrong, just and right is he." (32:4).
- KEEP gods-protection — "He kept him as the apple of his eye," borne on eagle's wings (32:10–12).
- KEEP divine-judgment — fire, arrows, and the settled day: "Vengeance is mine, and recompense, at the time when their foot slides" (32:35, with 32:19–25), joined to compassion: "For the LORD will judge his people, and have compassion on his servants" (32:36).
- KEEP idolatry — "They sacrificed to demons, not God, to gods that they didn’t know" (32:17, with 32:15–16, 21).
- KEEP vengeance — vengeance located in God's hand alone: "Vengeance is mine, and recompense" (32:35, with 32:41–43; pack already anchors Deut 32:35; never warrant for private revenge, per book doc #60's register care).
### Anchor-extension candidates
- gods-faithfulness | 32:4 | "The Rock: his work is perfect … A God of faithfulness who does no wrong, just and right is he." | medium-high (pack anchors Deut 7:9; this is Scripture's named "God of faithfulness" ascription)
- no-other-god | 32:39 | "See now that I myself am he. There is no god with me." | medium-high (pack anchors Deut 4:35 and 6:4 but not the song's oath — the I-kill-and-I-make-alive monotheism witness)
- nations-and-peoples | 32:8 | "When the Most High gave to the nations their inheritance, when he separated the children of men, he set the bounds of the peoples" | medium (the pack's own Acts 17:26–27 anchor echoes this verse; single verse here, so anchor lead, not a tag)
- gods-protection | 32:10–11 | "He surrounded him. He cared for him. He kept him as the apple of his eye." | medium (pack has no OT-narrative anchor; the apple-of-the-eye and eagle's-wings witness)
- obedience-to-the-word | 32:46–47 | "Set your heart to all the words which I testify to you today … For it is no vain thing for you, because it is your life" | low (the song's closing exhortation; anchor lead only)
### Lexicon candidates
- gods-protection | apple of his eye | realistic query phrasings: "apple of God's eye meaning", "kept as the apple of his eye" (32:10)
- refuge-in-trouble | God the Rock | realistic query phrasings: "God is my rock meaning", "the Lord is my rock" (32:4, 15, 18, 30–31 — curation note: the song's name for God; Ps 18:2's my-rock-and-fortress texts are the natural pack anchors, with Deut 32 as the OT source register — one route only, decide beside `gods-faithfulness`, whose ch-32 tag already carries "The Rock")
- idolatry | sacrificed to demons | realistic query phrasings: "are idols demons in the bible", "sacrificing to demons" (32:17 — the row stays on Deuteronomy's own terms; the later NT citation is a curation note only)
### New-concept candidates
None. (Roster routing, noted not duplicated: 32:43's closing clause "will make atonement for his land and for his people" is roster row 1 `sacrifice-and-atonement` territory, and the 2026-08-25 pass's recorded skip — single clause at the song's end — stands; nothing new to add.)
### Decline-overturn proposals
None. (32:16, 21's provoked-to-jealousy lines were checked against the Zechariah-block decline of God's-jealousy as a searched register — same ground, no new-evidence case; `envy-and-jealousy` must not receive these refs, per that decline's own warning.)
### Ceiling / refinement flags
- hit soft cap 6 (after the ADD); book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- Not yields (presence-bar declines): `nations-and-peoples` (32:8 single verse — logged above as an anchor-extension candidate); `remembrance-and-memorials` (32:7 "Remember the days of old" — single verse; roster row 33's spine already carries this book's remember-discipline refs); `mercy` (32:36's compassion clause — carried inside `divine-judgment`'s justification); `mortality` (32:48–52 is the command to die on the mountain, not the pack's life-is-short teaching); `obedience-to-the-word` as a tag (32:46–47 two-verse closing exhortation — logged above as an anchor lead).

## Deuteronomy 33
Existing tags (book doc): blessing, refuge-in-trouble, gods-protection, priesthood
### Applied-tag deltas
- KEEP blessing — the chapter is the deathbed blessing itself: "This is the blessing with which Moses the man of God blessed the children of Israel before his death." (33:1, tribe by tribe through 33:6–25).
- KEEP refuge-in-trouble — "The eternal God is your dwelling place. Underneath are the everlasting arms." (33:27; pack already anchors Deut 33:27).
- KEEP gods-protection — "The beloved of the LORD will dwell in safety by him. He covers him all day long." (33:12), summed at the close: "the shield of your help" (33:29).
- KEEP priesthood — Levi's blessing: "Your Thummim and your Urim are with your godly one" and "They shall teach Jacob your ordinances, and Israel your law." (33:8, 10; pack already anchors Deut 33:8–11).
### Anchor-extension candidates
- gods-protection | 33:12, 33:29 | "The beloved of the LORD will dwell in safety by him. He covers him all day long." | medium (pack anchors Ps 91 / Isa 54:17 only; a blessing-register safety witness)
- blessing | 33:1 | "This is the blessing with which Moses the man of God blessed the children of Israel before his death." | low-medium (the deathbed-blessing register beside the pack's Gen 48:15–16 fathers-blessing anchor)
- gods-love | 33:3 | "Yes, he loves the people. All his saints are in your hand." | low-medium (the prologue's love ascription, with 33:12's "beloved of the LORD"; single-verse witnesses — anchor lead only)
- no-other-god | 33:26 | "There is no one like God, Jeshurun, who rides on the heavens for your help" | low (the incomparability register adjacent to the pack's no-god-besides-me core; anchor lead only)
### Lexicon candidates
- refuge-in-trouble | the everlasting arms | realistic query phrasings: "underneath are the everlasting arms", "the everlasting arms of God" (33:27 — the pack anchors the verse but its lexicon does not carry the phrase)
- blessing | the blessing of Moses | realistic query phrasings: "Moses blesses the tribes", "deathbed blessings in the Bible" (33:1–25)
### New-concept candidates
None. (Engine-side note, nothing to route: `pastoral-strength-in-weakness` (engine-side yaml id strength-in-weakness) already anchors Deut 33:25 and its lexicon carries "as your days so your strength will be" — the chapter's heaviest personal-register query family is fully served engine-side without a display tag; see Decisions.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- Not yields (register and presence-bar declines): `pastoral-strength-in-weakness` NOT tagged — pastoral-* ids are personal-crisis register only (group ruling), and ch 33 is a national tribal blessing, not that register; the pack already anchors 33:25 and carries its phrase in the lexicon, so the search need is served engine-side with nothing to add; `salvation` on 33:29 stays withheld per book doc #34 ("a people saved by the LORD" is national deliverance — no new ground); `joy-in-the-lord` (33:29 "You are happy, Israel!" — single closing verse); `worship` (33:10's incense and burnt offering sit inside Levi's blessing, carried by `priesthood`). (Fixture note: Deut 33 is one of the five Deuteronomy chapters in the engine fixture corpus, so this chapter's anchor-extension candidates are assertable in-corpus today. The ch 33 blessings stay in their own terms per the no-read-back group ruling — no messianic or later-revelation framing anywhere above.)

## Deuteronomy 34
Existing tags (book doc): gods-faithfulness, wisdom-from-god, death-and-burial
### Applied-tag deltas
- KEEP gods-faithfulness — the last sight is the promise standing: "This is the land which I swore to Abraham, to Isaac, and to Jacob, saying, ‘I will give it to your offspring.’" (34:4).
- KEEP wisdom-from-god — "Joshua the son of Nun was full of the spirit of wisdom, for Moses had laid his hands on him." (34:9; book doc #39 stands).
- KEEP death-and-burial — "So Moses the servant of the LORD died there in the land of Moab, according to the LORD’s word," buried where "no man knows where his tomb is to this day," wept for thirty days (34:5–8; corpus-blocked roster row 22 id, display tag only — Deut 34 is already among that row's recorded refs).
### Anchor-extension candidates
- gods-faithfulness | 34:4 | "This is the land which I swore to Abraham, to Isaac, and to Jacob" | low-medium (the promise-kept-in-sight witness at the book's close)
- wisdom-from-god | 34:9 | "Joshua the son of Nun was full of the spirit of wisdom, for Moses had laid his hands on him." | low-medium (pack's anchors are Proverbs/James petitions; an imparted-wisdom narrative witness)
- signs-and-wonders | 34:11–12 | "in all the signs and the wonders which the LORD sent him to do in the land of Egypt" | low (epitaph summary, two verses — anchor lead only; pack's anchors are all NT)
### Lexicon candidates
- knowing-god | face to face | realistic query phrasings: "Moses talked with God face to face", "knowing God face to face" (34:10 — "whom the LORD knew face to face"; curation note: the verse's direction is the LORD knowing Moses — the row should land on the pack's own texts, with 34:10 as the narrative witness)
### New-concept candidates
None. (Roster routing, noted not duplicated: "how did Moses die" / "where is Moses buried" queries are the death-and-burial register — roster row 22 already records Deut 34 among its refs; nothing new to add.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- Not yields (register and presence-bar declines): `pastoral-grief-and-loss` stays withheld per book doc #40 (thirty days of weeping is national mourning for a public leader, not the pack's personal-crisis register — no new ground); `leadership` (34:9 — the pass's skip stands: quoted verbatim inside `wisdom-from-god`); `knowing-god` (34:10 single verse, direction reversed — logged above as a lexicon candidate); `mortality` (Moses dies at full strength — "His eye was not dim, nor his strength gone." (34:7) — not the pack's frailty-and-brevity teaching); `signs-and-wonders` as a tag (34:11–12 epitaph clauses — logged above as an anchor lead).


## Corrigenda — chapters 1–9 vs the 15 late-arriving adopted ids (2026-08-26)

Why: chapters 1–9 were swept before the canonical §11.1 adopted list existed at
`tag-apply/adopted-concepts.md`, under the interim two-list universe (239 engine ids +
the 50 roster ids — roster ids WERE in that universe, e.g. the standing `mediator` and
`cities-of-refuge` tags above). The canonical list adds 15 legal adopted ids in neither
file (`confession-of-sin`, `death-of-a-believer`, `eternal-life`, `false-teachers`,
`freedom-in-christ`, `gentleness-of-christ`, `gods-delight-in-his-people`,
`living-for-gods-glory`, `new-birth`, `outpouring-of-the-spirit`, `sovereignty-of-god`,
`sowing-and-reaping`, `speaking-in-tongues`, `the-branch`, `walking-in-truth`). This
block re-evaluates ONLY those 15 ids against chapters 1–9, presence bar first; the
original entries above stand unedited (append-only).

### Corrigendum ADD

- Deuteronomy 2: ADD sovereignty-of-god — WEB quote: "But Sihon king of Heshbon would
  not let us pass by him, for the LORD your God hardened his spirit and made his heart
  obstinate, that he might deliver him into your hand, as it is today." (2:30), with
  "I have given Mount Seir to Esau for a possession" (2:5), "I have given Ar to the
  children of Lot for a possession" (2:9), "the LORD destroyed them from before them,
  and they succeeded them, and lived in their place" (2:21), and "Today I will begin to
  put the dread of you and the fear of you on the peoples who are under the whole sky"
  (2:25) — the chapter's own running teaching that the LORD assigns, removes, and
  dispossesses nations at will (including nations other than Israel, 2:5, 9, 12,
  19–23) and disposes of a foreign king's heart for his stated purpose. Register
  checked against the id's tag-gaps row (Isa 45 Cyrus raised for God's purpose; Dan
  2:21 removing and setting up kings; Jer 27:5–7): this is that rule-over-nations-and-
  kings register taught in-chapter, multi-verse and explicit — it clears the
  honest-substantial-presence bar, the same reasoning as the Exodus ledger's
  corrigendum ADD on Exod 9:16 (God raising and disposing of Pharaoh). Distinct query
  register from the chapter's standing tags per the §11.2 both-tags ruling:
  `nations-and-peoples` carries the lands-deeded material in its origin-of-nations
  register, `hardness-of-heart` the 2:30 heart clause, `divine-judgment` the Kadesh
  sentence; none serves "God is in control" / "God's sovereignty" queries. Ch 2 now
  stands at 5 tags — under the soft cap 6; no §11.6 yield required.

### Per-chapter outcomes (the 15 delta ids only)

- Deuteronomy 1 — no change. Close call recorded: `confession-of-sin` on "We have
  sinned against the LORD" (1:41) — words attached in the same breath to the
  presumption the chapter condemns ("you rebelled against the commandment of the LORD,
  and were presumptuous," 1:43); the depicted-failure logic of §5's Genesis-3 worked
  example, the same disposition as Exod 9:27 and Num 14:40 in the sibling corrigenda.
- Deuteronomy 2 — corrigendum ADD sovereignty-of-god (above; now 5 tags). No other
  delta id meets the presence bar.
- Deuteronomy 3 — no change. `sovereignty-of-god` on the Og conquest (3:2–3, 21) —
  delivered-into-your-hand conquest narrative carried by the standing `gods-protection`
  tag; the taught assign-and-dispossess doctrine lives in ch 2, where it is now tagged.
- Deuteronomy 4 — no change (AT the hard ceiling 8; not stretched). Close call
  recorded: `sovereignty-of-god` on 4:34–39 ("has God tried to go and take a nation
  for himself from among another nation…") — the mighty-acts argument here is the
  chapter's monotheism case, whose conclusion the standing `no-other-god` tag carries
  in the chapter's own words ("the LORD himself is God in heaven above and on the
  earth beneath. There is no one else," 4:39, with 4:35 — both verses are that pack's
  own anchors); a second tag on the same material would be broad-duplicating-specific,
  not an independently-clearing register, so it fails the §11.2 each-tag-clears test
  on register grounds — the decline does not rest on the cap. Had it cleared, an ADD
  at the ceiling would additionally have required a §11.6 yield no standing tag
  warrants.
- Deuteronomy 5 — no change (7 tags stand). None of the 15 present; the Decalogue and
  mediator material is carried by the standing tags.
- Deuteronomy 6 — no change. None of the 15 meet the presence bar.
- Deuteronomy 7 — no change (7 tags stand). Two close calls recorded:
  `gods-delight-in-his-people` on "The LORD didn't set his love on you nor choose you,
  because you were more in number than any people … but because the LORD loves you"
  (7:7–8) — set-his-love election wording, not the id's delight-rejoicing register
  (the Zeph 3:17 / Ps 147:11 family its tag-gaps row names); the substance is the
  standing `gods-love` tag's own justification quote, and that pack's lexicon already
  carries "god delights in you." Cross-references only (outside this block's range,
  both swept under the full universe): 10:15's "the LORD delighted in your fathers to
  love them" is the register's nearest Deuteronomy wording, and the ch 30 entry
  already logs 30:9's rejoice-over-you clause as an engine-side anchor candidate for
  the id's eventual pack. `sovereignty-of-god` on "Know therefore that the LORD your
  God himself is God, the faithful God" (7:9) — the faithfulness confession, the
  standing `gods-faithfulness` tag's own anchor verse (Deut 7:9), not the
  rule-over-kings register; below the bar. `sowing-and-reaping` on the 7:12–15
  obedience-blessing terms — covenant-conditional promise, not the id's
  cross-testament moral-harvest principle-teaching register (the 2 Cor 9:6 precedent
  tags the principle stated as teaching, which no verse here does).
- Deuteronomy 8 — no change. None of the 15 meet the presence bar (8:17–18's
  wealth-warning is the forgetting-in-prosperity register already carried and routed
  in the standing entry, not `sowing-and-reaping`'s moral-harvest teaching).
- Deuteronomy 9 — no change. Close calls recorded: `sovereignty-of-god` on 9:3–5 (the
  LORD drives out nations "because of the wickedness of these nations … and that he
  may establish the word which the LORD swore to your fathers," 9:4–5) — the
  why-of-the-conquest argument, whose substance is the standing `grace-not-earned`
  tag's own thesis quote; not an in-chapter rule-over-kings declaration, below the bar
  on its own. `confession-of-sin` — no confession statute or genuine confession scene:
  Moses' forty-day penitence (9:18) is intercessory fasting, carried by the standing
  `fasting` and `prayer` tags.

Not present in any of chapters 1–9, no candidate verse to weigh: `death-of-a-believer`
(3:27 and 4:21–22 are Moses' announced-death notices, not the id's dying-in-faith
register), `eternal-life`, `false-teachers` (the book's false-prophet material sits in
chs 13 and 18, outside this range and swept under the full universe),
`freedom-in-christ` (the out-of-the-house-of-bondage clauses, 5:6; 6:12; 7:8, are the
national-deliverance narrative — roster row 32 territory, and a read-back as this NT
id), `gentleness-of-christ`, `living-for-gods-glory`, `new-birth`,
`outpouring-of-the-spirit` (the only "spirit" in Deut 1–9 is Sihon's hardened spirit,
2:30), `speaking-in-tongues`, `the-branch`, `walking-in-truth`.

### Decisions record (corrigenda)

- Deuteronomy 2: the corrigendum ADD makes 5 tags — under the soft cap 6; no §11.6
  yield triggered, no existing tag dropped.
- The at- and over-cap chapters are unchanged: ch 4 stays at the hard ceiling 8 (the
  one candidate declined on register, not squeezed out — see its outcome line above);
  chs 5 and 7 stay at 7. No stretching, no silent drops; all standing declines,
  routings, and candidates in the chapter 1–9 entries remain in force.

Closing note: chapters 10–34 were swept under the full canonical universe
(adopted-concepts.md ∪ concept-index.md ∪ roster) and need no re-check.
