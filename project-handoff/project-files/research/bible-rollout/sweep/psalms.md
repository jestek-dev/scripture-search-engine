# Psalms sweep ledger — Layer-3 tag sweep (plan §5.2)

**Book:** Psalms · **Date:** 2026-08-26 · **Repo:** scripture-search-engine @ origin/main `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (239 engine concept packs; 1,434 lexicon phrases; 1,599 anchors)
**Adopted display vocabulary:** the 239 engine ids + the 161 §11.1 adopted ids per the canonical `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md` (cross-checked mechanically against the sweep kit's regenerated rules.md §D.1 list — identical, 161 = 162 minus the recorded `waiting-and-timing-in-love` fold; no discrepancies).
**Chapter range this file will accumulate:** Psalms 1–150; this first block covers **Psalms 1–30** (later chunks append below, per CONVENTIONS §9).
**Inputs:** sweep kit 2026-08-26 (rules.md with verbatim plan §5.2 + CONVENTIONS §5/§9/§11; concepts.md; concept-ids.txt; declines.md; corpus-blocked.md; books.md; output-spec.md); prior art `/mnt/project-files/research/bible-rollout/psalms.md` (FINAL 2026-08-23 assembly + 2026-08-25 tag-application and apologetics passes — its three Decisions records, the consolidated tag-gap plan, and both pass records bind this sweep; not edited).
**WEB text provenance:** every quote word-for-word WEB from the staged verse-per-line extraction of the full-Bible fixture at commit `87fd68c` (`generatedFrom.sourceSha256` = the same `b6f55cc7…` pin as e762d1c's `pipeline/manifests/web.json`; 0 mismatches against the committed e762d1c fixture over its 5,726 witnessed verses). Within 1–30, Psalms 1, 9, 10, 11, 13, 16, 19, 23, 24, 27, 30 are additionally pinned-fixture witnessed at e762d1c; the rest are verified against the 87fd68c full fixture only. Straight apostrophes used per the book docs' recorded typography practice (words unaltered).
**Entry format** (per KIT/output-spec.md; sections in this order, "None." where empty):
1. Existing tags (book doc) · 2. Applied-tag deltas (ADD/KEEP/DROP; no silent drops) · 3. Anchor-extension candidates (`id` | ref | "WEB quote" | w=) · 4. Lexicon candidates (`id` | phrase | queries) · 5. New-concept candidates · 6. Decline-overturn proposals · 7. Ceiling / refinement flags · 8. Decisions record (§11.6 yields).
Corpus-blocked findings are ROUTED ("ROUTED to corpus-blocked roster row N"), never re-proposed.
**Standing Psalms rules applied throughout:** superscription-limited attribution (headings are Scripture, used exactly as far as they state; untitled psalms stay anonymous even where the NT attributes them); imprecatory language described, never endorsed (the wronged handing judgment to God); NT quotations signposted, never asserted as the psalm's own claim — `messianic-prophecy` only with an attributed NT citation; no later-revelation read-backs (no `resurrection` on Ps 16 etc.); pastoral-* packs personal-crisis register only; `god-reigns` stays the OT enthronement register, separate from `kingdom-of-heaven` (consolidated plan §C); divine name "the LORD" throughout. The 2026-08-25 tag-application pass's recorded skips are treated as prior art with reasons — none is reversed below without the text supporting it.

---

## This block: Psalms 1–30 (sweep worker, 2026-08-26)

## Psalms 1
1. Existing tags (book doc): `delight-in-the-word`, `blessing`, `divine-judgment` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (the two-ways psalm carries no further honest concept; `wisdom-from-god` considered and NOT added — no giving of wisdom by God appears in the chapter).
3. Anchor-extension candidates: `divine-judgment` | Psalms 1:4-6 | "Therefore the wicked shall not stand in the judgment" … "but the way of the wicked shall perish." | w=0.5 — the pack has no Psalm 1 anchor; low weight (the psalm's judgment note is its close, not its center).
4. Lexicon candidates: None (the famous phrases here — "tree planted by the streams of water", "blessed is the man" — appear verbatim in the WEB text, so full-corpus word search already serves them; per the alias-mining rule, no row for a query that already lands).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 2
1. Existing tags (book doc): `divine-judgment`, `god-reigns`, `messianic-prophecy` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar. Standing declines re-checked against the text and left standing: `refuge-in-trouble` (batch-1 Decisions #9 — 2:12's one clause), `zion-city-of-god` (2026-08-25 pass skip — "the King, not the hill, is the psalm's substance"); `nations-and-peoples` considered and NOT added (the raging nations here are rebels under judgment, not the concept's origin-of-nations / all-nations-worship register).
3. Anchor-extension candidates: `messianic-prophecy` | Psalms 2:6-9 | "You are my son. Today I have become your father." | w=0.85 — the engine pack anchors Ps 16:10, 22:1-18, 40:6-8, 110:1-4 but NOT Psalm 2, the decree the NT quotes repeatedly (Acts 4:25-26; 13:33 — attributed citations per the standing rule). `god-reigns` | Psalms 2:4-6 | "He who sits in the heavens will laugh." … "Yet I have set my King on my holy hill of Zion." | w=0.7 — no Psalm 2 anchor in the pack; the enthroned-over-the-nations register is the pack's own.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 46: `the-lords-anointed` — Psalms 2:2 "The kings of the earth take a stand, and the rulers take counsel together, against the LORD, and against his Anointed" is an in-corpus "his Anointed" witness for that row's curator; supporting ref only — the row's minting register is the 1 Samuel touch-not narrative, and batch 1's withdrawal of the id as a Psalms alternative stands.)

## Psalms 3
1. Existing tags (book doc): `gods-protection`, `trust-in-god`, `prayer` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar. `fear-not` considered and NOT added: the fearlessness statement (3:6) is the same verse the sitting `trust-in-god` justification quotes — duplicate register on the same verse (the 2026-08-25 pass's recorded both-tags limit); routed engine-side instead (below).
3. Anchor-extension candidates: `fear-not` | Psalms 3:5-6 | "I laid myself down and slept. I awakened, for the LORD sustains me. I will not be afraid of tens of thousands of people who have set themselves against me on every side." | w=0.7 — the pack's testimony-register anchors (Ps 27:1, 3; 56:11) have no Psalm 3 companion. `peace-of-god` | Psalms 3:5 | "I laid myself down and slept. I awakened, for the LORD sustains me." | w=0.6 — the sleep-in-danger register (batch-1 motif item 5's lexicon-extension lead, formalized here; pairs with Ps 4:8 below).
4. Lexicon candidates: None here (sleep lexicon carried on the Psalm 4 entry).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 4
1. Existing tags (book doc): `peace-of-god`, `prayer`, `trust-in-god`, `joy-in-the-lord` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar.
3. Anchor-extension candidates: `peace-of-god` | Psalms 4:8 | "In peace I will both lay myself down and sleep, for you alone, LORD, make me live in safety." | w=0.8 — the pack has no sleep anchor; this is Scripture's calmest sleep verse and the display tag already rests on it.
4. Lexicon candidates: `peace-of-god` | sleep | queries: "bible verse for sleep", "can't sleep anxiety bible verse", "psalm to sleep in peace" (rides the proposed Ps 4:8 / Ps 3:5 anchors; "sleep" appears in the verses but the anxiety-intent phrasings do not).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 5
1. Existing tags (book doc): `prayer`, `guidance`, `refuge-in-trouble` — 3.
2. Applied-tag deltas: ADD `divine-judgment` — the psalm grounds its morning plea in God's settled opposition to evil: "For you are not a God who has pleasure in wickedness. Evil can't live with you. The arrogant will not stand in your sight. You hate all workers of iniquity." (5:4-5), "You will destroy those who speak lies" (5:6), and the petition "Hold them guilty, God. Let them fall by their own counsels" (5:10) — four verses of twelve, the psalm's who-God-is core (imprecatory petition described, not endorsed, per the standing rule). KEEP the other 3.
3. Anchor-extension candidates: `prayer` | Psalms 5:1-3 | "LORD, in the morning you will hear my voice. In the morning I will lay my requests before you, and will watch expectantly." | w=0.7 — the pack has no morning-prayer anchor.
4. Lexicon candidates: `prayer` | morning prayer | queries: "morning prayer in the bible", "psalm to pray in the morning", "starting the day with prayer" ("morning" appears at 5:3 but never beside "prayer" — lexical search misses the intent).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 6
1. Existing tags (book doc): `the-lords-discipline`, `pastoral-prayer-for-healing`, `pastoral-god-sees-my-suffering`, `lament` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. Considered and NOT added: `repentance` (the psalm pleads under rebuke but never names or confesses sin — Pss 32/51 are the confession texts); `pastoral-serious-illness` (6:5's death-fear rides the healing plea; duplicate register on the same verses); `mortality` (6:5 is one verse).
3. Anchor-extension candidates: `the-lords-discipline` | Psalms 6:1 | "LORD, don't rebuke me in your anger, neither discipline me in your wrath." | w=0.7 — the pack's only anchors are Heb 12:7-11 and Rev 3:19; this is the OT prayer under discipline. `lament` | Psalms 6:6-7 | "Every night I flood my bed. I drench my couch with my tears." | w=0.7 — the pack has no Psalm 6 anchor; the consolidated tag-gap plan's §A.1 append already names these refs.
4. Lexicon candidates: `the-lords-discipline` | is god punishing me | queries: "is god punishing me", "is god angry with me", "is my suffering god's punishment" (a real anxious-searcher family with no lexical match; the pack's "why is god disciplining me" is adjacent but not this phrasing — curator should fixture the distinction from `divine-judgment`).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 7
1. Existing tags (book doc): `refuge-in-trouble`, `divine-judgment`, `pastoral-refuge-and-justice`, `sin`, `slander-and-false-accusation` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. `sowing-and-reaping` (adopted id) considered and NOT added: the boomerang verses (7:15-16) are exactly the span the sitting `sin` tag quotes as "sin's recoil" — duplicate register on the same verses; the engine `sin` pack already carries "reap what you sow" (Gal 6:7-8 anchor). `integrity` considered and NOT added: 7:8's "according to … my integrity that is in me" is one clause inside the vindication appeal (developed homes: Pss 15, 26 below).
3. Anchor-extension candidates: None (the slander pack's design fits 7:1, 3-5 but Psalm 27:12/35:11 already carry that register at weight; no gap).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 6: `god-looks-at-the-heart` — Psalms 7:9 "their minds and hearts are searched by the righteous God." is an in-corpus heart-searching witness for that row's deferred design; see also the Pss 11, 17, 26 routings below.)

## Psalms 8
1. Existing tags (book doc): `creation`, `image-of-god`, `praise`, `creation-testifies` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar (the creation/creation-testifies same-span pairing is the map's deliberate register split, recorded in the tag line itself). Considered and NOT added: `angels` (8:5's "a little lower than the angels" is one comparative clause — the pass's list-item skip pattern); `the-name-of-god` and `glory-of-god` (the refrain praises the name's majesty; doxological use, not the concepts' revelation/manifestation teaching substance — routed engine-side below).
3. Anchor-extension candidates: `the-name-of-god` | Psalms 8:1, 9 | "LORD, our Lord, how majestic is your name in all the earth!" | w=0.6 — the pack's anchors are all revelation texts (Exod 3 etc.); the majesty-of-the-name doxology is a distinct query surface. `praise` | Psalms 8:2 | "From the lips of babes and infants you have established strength, because of your adversaries, that you might silence the enemy and the avenger." | w=0.5 — carries the "out of the mouth of babes" query family (Matt 21:16's application is the NT signpost).
4. Lexicon candidates: `praise` | out of the mouth of babes | queries: "out of the mouth of babes bible verse", "out of the mouths of babes meaning" — the remembered KJV phrase has NO lexical match in the WEB ("From the lips of babes and infants"), a genuine translation-gap row.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 9
1. Existing tags (book doc): `thanksgiving`, `divine-judgment`, `pastoral-refuge-and-justice`, `trust-in-god`, `god-reigns`, `justice-and-oppression` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar. Considered and NOT added: `praise` (9:1-2, 11, 14 — broad-duplicating-specific beside the sitting `thanksgiving` on the same spans); `zion-city-of-god` (pass skip stands — two passing mentions, 9:11, 14); `mortality` (9:20 one clause).
3. Anchor-extension candidates: None (engine coverage already present: `divine-judgment` anchors 9:7-8, `justice-and-oppression` 9:18, `refuge-in-trouble` 9:9, `god-reigns` — the pack's lead anchor family sits on 10:16/93/96).
4. Lexicon candidates: `refuge-in-trouble` | high tower | queries: "god is my high tower", "the lord is a high tower for the oppressed" (rides the pack's existing Ps 9:9 anchor: "The LORD will also be a high tower for the oppressed; a high tower in times of trouble." — "high tower" appears in no pack lexicon).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit; no subdivision).
8. Decisions record: None.

## Psalms 10
1. Existing tags (book doc): `pastoral-god-sees-my-suffering`, `pastoral-refuge-and-justice`, `sin`, `god-reigns` — 4.
2. Applied-tag deltas: ADD `justice-and-oppression` — the psalm's long portrait is societal predation on a class, exactly the register the pastoral pack does NOT carry under the register ruling: "In arrogance, the wicked hunt down the weak." (10:2), "He lies in wait to catch the helpless." (10:9), answered by God arising "to judge the fatherless and the oppressed, that man who is of the earth may terrify no more." (10:18). Consistent with the consolidated plan's routing of Pss 9 and 12 to this id; Ps 10's refs simply never made the §A.2 append list. KEEP the other 4 (`pastoral-refuge-and-justice` stays beside it on its own personal-crisis anchor ground, 10:14, 17-18 — the pack's anchors). The pass's `lament` skip (10:1 single-verse complaint) stands — no new evidence; 10:1 is still one verse.
3. Anchor-extension candidates: `prosperity-of-the-wicked` | Psalms 10:5-6, 13 | "His ways are prosperous at all times." … "He says in his heart, 'I shall not be shaken. For generations I shall have no trouble.'" … "God won't call me into account" | w=0.6 — the wicked's untroubled prosperity plus God's apparent non-accounting is the pack's register from the observer's side; display tag withheld (the psalm describes the wicked's security rather than praying the believer's struggle over it).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 11
1. Existing tags (book doc): `refuge-in-trouble`, `divine-judgment` — 2.
2. Applied-tag deltas: No changes — both clear the bar; nothing else in the vocabulary is substantially present (`god-reigns` considered and NOT added — 11:4's throne is one verse, the pass's single-verse skip pattern; `testing` considered and NOT added — 11:4-5's examining is God's scrutiny of all people, not the invited-trial register tagged at 26:2).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 6: `god-looks-at-the-heart` — Psalms 11:4-5 "His eyes observe. His eyes examine the children of men. The LORD examines the righteous" — the strongest in-corpus Psalter witness this sweep found for that row's register; the row's Proverbs witnesses are all corpus-blocked, so these free refs matter for the re-pin design.)

## Psalms 12
1. Existing tags (book doc): `honesty`, `pastoral-refuge-and-justice`, `justice-and-oppression`, `trustworthiness-of-scripture` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. Standing decline re-checked and left standing: `taming-the-tongue` (batch-1 Decisions #11 — the psalm depicts the wicked's tongues, not the discipline of one's own). `slander-and-false-accusation` considered and NOT added: society-wide lying about everyone, not the accused-individual register (12:5's "those who malign him" is one clause).
3. Anchor-extension candidates: None (`trustworthiness-of-scripture` already anchors Ps 12:6 w=0.8).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 13
1. Existing tags (book doc): `pastoral-hope-in-despair`, `trust-in-god`, `prayer`, `lament` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. `wrestling-with-god` considered and NOT added: the engine pack already anchors Ps 13:1-2 (w=0.9) and its lexicon carries "how long o lord", but the display line already holds two tags on those same two verses (`lament`, `pastoral-hope-in-despair`) — a third on the identical span is the duplicate-register limit, and search is already served.
3. Anchor-extension candidates: None (pack coverage complete: `wrestling-with-god` 13:1-2, `pastoral-hope-in-despair` 13:5-6).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 14
1. Existing tags (book doc): `sin` — 1. ("Only one honest tag" note stands in the doc.)
2. Applied-tag deltas: No changes — `sin` carries the universal audit; nothing else in the current vocabulary is present (`restoration-of-israel` considered and NOT added — 14:7 is one closing verse of longing).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: `atheism-and-unbelief` (proposed id) | rationale: "The fool has said in his heart, 'There is no God.'" (14:1; doubled verbatim at 53:1) is the Bible's named atheism text, and the query family — "what does the bible say about atheism", "the fool says there is no god meaning", "bible verses about unbelief in god" — has no vocabulary home: `doubt` is the believer's wavering, `creation-testifies`/`those-who-never-heard` are the evidence side, the evangelism packs (mormon/jw) show the apologetics register exists but no entry point covers the atheist interlocutor. Anchors: Ps 14:1-3 ("They have all gone aside. They have together become corrupt. There is no one who does good, no, not one.", w=1.0), Ps 53:1 (w=0.9); Rom 3:10-12 is the attributed NT use (signposted in the book doc). Checked against declines.md (no prior decline or fold touches it) and concept-ids.txt (no collision).
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 15
1. Existing tags (book doc): `holiness`, `honesty` — 2.
2. Applied-tag deltas: ADD `integrity` — the whole five-verse psalm is the blameless-character portrait the concept names ("walk in integrity" is the pack's own lexicon): "He who walks blamelessly and does what is right, and speaks truth in his heart" (15:2), "he who keeps an oath even when it hurts, and doesn't change" (15:4), "nor take a bribe against the innocent. He who does these things shall never be shaken." (15:5). Distinct register beside the sitting pair: `honesty` = truth-telling, `holiness` = fitness for God's hill, `integrity` = the whole undivided character. KEEP both others. The pass's `oaths-and-vows` skip (15:4 list-item) stands — the engine pack already anchors Ps 15:4 w=0.7, so search is served.
3. Anchor-extension candidates: `integrity` | Psalms 15:1-5 | "He who walks blamelessly and does what is right, and speaks truth in his heart" | w=0.8 — the pack has no Psalm 15 anchor (its Psalter anchor is 101:2); this is the character-portrait psalm a "man of integrity" query wants.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 16
1. Existing tags (book doc): `joy-in-the-lord`, `presence-of-god`, `contentment`, `trust-in-god`, `messianic-prophecy` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. Standing decline re-checked and left standing: `resurrection` (batch-1 Decisions #4 — read-back; Acts 2 is signposted, exactly as the messianic tag's attributed-citation rule requires). Considered and NOT added: `idolatry` (16:4 is one refusal verse); `guidance` (two verses — routed engine-side below).
3. Anchor-extension candidates: `guidance` | Psalms 16:7, 11 | "I will bless the LORD, who has given me counsel." … "You will show me the path of life." | w=0.6 — the counsel/path-of-life register; the pack has no Psalm 16 anchor.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 17
1. Existing tags (book doc): `prayer`, `gods-protection`, `hope-in-god` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar. Considered and NOT added: `integrity`/`testing` (17:3-5's proved-and-found-nothing is the clear-conscience protest register, one unit inside the plea; the invited-audit home is 26); `slander-and-false-accusation` (no false accusers appear — enemies here are violent pursuers); `resurrection-of-the-dead` on 17:15 (read-back risk; the sitting `hope-in-god` carries the awakening-satisfaction line as the psalm's own hope).
3. Anchor-extension candidates: `gods-protection` | Psalms 17:8 | "Keep me as the apple of your eye. Hide me under the shadow of your wings," | w=0.8 — the pack's anchors are all Psalm 91; this is the other famous protection text and the display tag already rests on it.
4. Lexicon candidates: None ("apple of your eye" / "shadow of your wings" appear verbatim in the WEB — lexical search lands them; the anchor extension is the ordering fix).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 6: `god-looks-at-the-heart` — Psalms 17:3 "You have proved my heart. You have visited me in the night. You have tried me, and found nothing." — a completed-heart-search witness for the row's curator.)

## Psalms 18
1. Existing tags (book doc): `refuge-in-trouble`, `gods-protection`, `praise`, `thanksgiving`, `gods-faithfulness` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. The pass's skips stand on re-read: `vengeance` (18:47 one clause inside a thanksgiving narrative), `trustworthiness-of-scripture` (18:30's "The LORD's word is tried." is one clause — quote now verified against the staged text, but the thin-presence judgment holds). `victory-in-christ` considered and NOT added (read-back — the id's register is in-Christ). Battle-empowerment material (18:29-42) stays untagged: described narrative, no honest concept home.
3. Anchor-extension candidates: `refuge-in-trouble` | Psalms 18:1-2 | "The LORD is my rock, my fortress, and my deliverer; my God, my rock, in whom I take refuge; my shield, and the horn of my salvation, my high tower." | w=0.85 — the pack lacks the Psalter's densest refuge-name cascade. `loving-god` | Psalms 18:1 | "I love you, LORD, my strength." | w=0.7 — the declaration register (the pack's Ps 116:1 companion); display tag withheld as one clause, per the pass's own Ps 145 precedent.
4. Lexicon candidates: `refuge-in-trouble` | my rock and my fortress | queries: "the lord is my rock", "god is my fortress", "my rock and my fortress meaning" (words land lexically at 18:2 — the row's value is routing the concept intent above raw word hits; curator should check against the alias-mining already-lands rule before adding).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 32: `deliverance` — Psalm 18 IS the rescue narrative that row's register wants (superscription "in the day that the LORD delivered him from the hand of all his enemies, and from the hand of Saul"; "He sent from on high. He took me. He drew me out of many waters." 18:16; "He delivered me, because he delighted in me." 18:19; "He rescues me from my enemies." 18:48) — and the row's own requested refs include 2 Sam 22, this psalm's double. ROUTED to corpus-blocked roster row 44: `davidic-covenant` — Psalms 18:50 "He gives great deliverance to his king, and shows loving kindness to his anointed, to David and to his offspring, forever more." — an in-corpus everlasting-offspring witness while 2 Sam 7 stays blocked. ROUTED to corpus-blocked roster row 46: `the-lords-anointed` — same verse, supporting ref.)

## Psalms 19
1. Existing tags (book doc): `creation`, `delight-in-the-word`, `obedience-to-the-word`, `trustworthiness-of-scripture`, `creation-testifies` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar (the creation/creation-testifies split is the map's deliberate pairing). Considered and NOT added: `forgiveness-of-sins` (19:12's petition is one verse); `fear-of-the-lord` (19:9 is one catalog clause); `design-in-creation` (the sun's ordered circuit, 19:4-6, stays with `creation-testifies` — same-span duplicate register); `thought-life` (19:14 is one verse — and the pack already anchors it, w=0.8, so search is served).
3. Anchor-extension candidates: None (pack coverage dense: creation-testifies 19:1-3 [namesake], creation 19:1, studying-the-word 19:7-11, trustworthiness-of-scripture 19:7-9, thought-life 19:14).
4. Lexicon candidates: None ("sweeter than honey", "the heavens declare" land lexically or sit in pack lexicons already).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 20
1. Existing tags (book doc): `praying-for-leaders`, `trust-in-god`, `prayer` — 3.
2. Applied-tag deltas: ADD `trusting-in-man` — the psalm's famous center states the misplaced-trust contrast that concept owns (its lexicon already carries "trusting in horses and chariots"): "Some trust in chariots, and some in horses, but we trust in the name of the LORD our God. They are bowed down and fallen, but we rise up, and stand upright." (20:7-8). Both-tags beside the sitting `trust-in-god` on the same span, registers genuinely distinct (reliance on God / the failure of reliance on human power) — the Psalm 8/19 creation-pair precedent in this same doc. KEEP the other 3.
3. Anchor-extension candidates: `trusting-in-man` | Psalms 20:7-8 | "Some trust in chariots, and some in horses, but we trust in the name of the LORD our God." | w=0.9 — the pack anchors Ps 33:16-17 and 146:3-4 but NOT the verse its own lexicon phrase points at; a "trusting in horses and chariots" query should surface Ps 20:7.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 46: `the-lords-anointed` — Psalms 20:6 "Now I know that the LORD saves his anointed." — supporting in-corpus ref.)

## Psalms 21
1. Existing tags (book doc): `praise`, `blessing`, `trust-in-god` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (`trust-in-god` rests on the psalm's hinge verse 21:7; kept as the batch's reviewed call). `divine-judgment` considered and NOT added: 21:8-12's consumed enemies are the royal-victory register, not a judgment scene.
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 22
1. Existing tags (book doc): `pastoral-hope-in-despair`, `pastoral-god-sees-my-suffering`, `praise`, `worship`, `lament`, `messianic-prophecy` — 6 (soft cap).
2. Applied-tag deltas: ADD `nations-and-peoples` — the psalm's climax is the world-sized turn the concept's all-nations register names, beyond the act-of-worship the sitting `worship` tag carries: "All the ends of the earth shall remember and turn to the LORD. All the relatives of the nations shall worship before you. For the kingdom is the LORD's. He is the ruler over the nations." (22:27-28), widening to "Posterity shall serve him. Future generations shall be told about the Lord." (22:30). Both-tags call, registers distinct (scope of the turning vs the worship act); lands the psalm at 7 — every sitting tag independently re-checked against the text and clears the bar. KEEP the other 6. The pass's `oaths-and-vows` skip stands (22:25 "I will pay my vows before those who fear him." — quote now verified against the staged text, but still one verse; thin). `god-reigns` considered and NOT added (22:28 is one verse — the pass's single-verse skip pattern).
3. Anchor-extension candidates: `nations-and-peoples` | Psalms 22:27-31 | "All the ends of the earth shall remember and turn to the LORD. All the relatives of the nations shall worship before you." | w=0.7 — the pack's Psalter anchors (67:2-5; 86:9) lack this text.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: lands at 7 (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter (the lament movement 22:1-21 and praise movement 22:22-31 are natural sections, though the book doc records no BSB subdivision).
8. Decisions record: None (no yield — 7 < ceiling).

## Psalms 23
1. Existing tags (book doc): `gods-provision`, `restoration`, `guidance`, `pastoral-serious-illness`, `presence-of-god`, `fear-not` — 6 (soft cap).
2. Applied-tag deltas: ADD `shepherds-and-the-flock` — the concept's namesake text ("The Shepherd and his flock"; its lead anchor IS Ps 23:1 w=1.0 and its lexicon opens "the lord is my shepherd"), and the whole psalm is the shepherd metaphor: "The LORD is my shepherd; I shall lack nothing." (23:1), "He makes me lie down in green pastures. He leads me beside still waters." (23:2), rod and staff (23:4). The id post-dates the 2026-08-23 batch vocabulary (131 ids) and sat on no 2026-08-25 worklist row with Psalms refs, so Psalm 23 was never swept against it — a coverage seam, not a reversed decision. Lands the psalm at 7; every sitting tag independently re-checked and clears the bar. KEEP the other 6.
3. Anchor-extension candidates: None (pack coverage of Psalm 23 complete across shepherds-and-the-flock 23:1, gods-provision 23:1, restoration 23:3, pastoral-serious-illness 23:4, god-of-all-comfort 23:4).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: lands at 7 (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter. Engine-side note for the curator: the shepherd-psalm-guard pending fixture (backlog flagged item 4, activation tied to the guidance-reword decision) governs this psalm's ranking neighborhood — display tagging here changes nothing engine-side.
8. Decisions record: None (no yield — 7 < ceiling).

## Psalms 24
1. Existing tags (book doc): `creation`, `holiness`, `worship`, `god-reigns` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. Considered and NOT added: `seeking-god` (24:6 is one verse); `glory-of-god` ("King of glory" is the processional's kingship acclamation — the sitting `god-reigns`/`worship` pair carries it; same-span duplicate register).
3. Anchor-extension candidates: None (pack coverage present: holiness 24:3-4, god-reigns 24:7-10).
4. Lexicon candidates: None ("the king of glory" already in the `god-reigns` lexicon).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 25
1. Existing tags (book doc): `guidance`, `forgiveness-of-sins`, `trust-in-god`, `covenant`, `loneliness` — 5.
2. Applied-tag deltas: ADD `fear-of-the-lord` — a compact teaching unit on the fear of the LORD as the doorway to instruction and intimacy: "What man is he who fears the LORD? He shall instruct him in the way that he shall choose." (25:12) and "The friendship of the LORD is with those who fear him. He will show them his covenant." (25:14) — three consecutive verses (12-14), a register (reverent intimacy) distinct from the sitting `guidance` and `covenant` tags. Consistent with the pass's own line: applied where a teaching unit stands (111, 112, 128, 147), skipped where a list-item (115, 118). Lands at 6 (soft cap). KEEP the other 5 (`loneliness` on 25:16 is single-verse but is the pack's honest pastoral register — reviewed batch call kept).
3. Anchor-extension candidates: `trust-in-god` | Psalms 25:3-5, 21 | "Yes, no one who waits for you will be shamed." … "I wait for you all day long." … "Let integrity and uprightness preserve me, for I wait for you." | w=0.6 — the waiting-on-God register (batch-1 motif item 2), which the pack's lexicon does not carry. `shame` | Psalms 25:2-3, 20 | "My God, I have trusted in you. Don't let me be shamed." | w=0.5 — the not-put-to-shame register beside the pack's own Ps 34:5 anchor; display tag withheld (vindication-before-enemies, not the pack's shame-recovery register).
4. Lexicon candidates: `trust-in-god` | waiting on god | queries: "waiting on god", "wait on the lord meaning", "bible verses about waiting on god's timing" ("wait" appears at 25:5, 21 and 27:14, but the intent phrasings don't land as such — curator to check the already-lands rule).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None.

## Psalms 26
1. Existing tags (book doc): `honesty`, `worship`, `testing` — 3.
2. Applied-tag deltas: ADD `integrity` — the pack's lexicon phrase is the psalm's own framing word, twice: "Judge me, LORD, for I have walked in my integrity." (26:1) and "But as for me, I will walk in my integrity." (26:11), with the invited audit between ("Examine me, LORD, and prove me. Try my heart and my mind." 26:2). Distinct register beside `honesty` (truth vs whole blameless walk) and `testing` (the audit act). KEEP the other 3.
3. Anchor-extension candidates: `integrity` | Psalms 26:1-3, 11 | "Judge me, LORD, for I have walked in my integrity." | w=0.85 — the pack's Psalter anchor is 101:2 only; this is the walk-in-integrity psalm its lexicon names. `the-house-of-god` | Psalms 26:8 | "LORD, I love the habitation of your house, the place where your glory dwells." | w=0.6 — the loving-God's-house register beside the pack's Ps 27:4 anchor; display tag withheld (one verse).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 6: `god-looks-at-the-heart` — Psalms 26:2 "Examine me, LORD, and prove me. Try my heart and my mind." — the invited heart-examination witness for that row's curator.)

## Psalms 27
1. Existing tags (book doc): `fear-not`, `trust-in-god`, `hunger-for-god`, `loneliness`, `gods-protection`, `hope-in-god` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar. The pass's `slander-and-false-accusation` skip stands (27:12 is one verse, even though it is the engine pack's w=1.0 anchor — the recorded anchors-serve-queries / display-follows-substance split, the Ps 33 `praying-for-leaders` precedent). Considered and NOT added: `seeking-god` (27:8 is the pack's own anchor but the sitting `hunger-for-god` holds the same span — duplicate register); `the-house-of-god` (27:4's longing is carried by `hunger-for-god`; the pack anchors 27:4 already); `worship` (27:6 one verse). Corpus-blocked row 17 (`courage`) needs no routing: the row itself already records Ps 27:14 as fear-not's divine-comfort register, "precisely NOT this gap".
3. Anchor-extension candidates: None (engine coverage dense: fear-not 27:1, 27:3; trust-in-god 27:14; seeking-god 27:8; the-house-of-god 27:4; slander 27:12; loneliness 27:10).
4. Lexicon candidates: `fear-not` | the lord is my light | queries: "the lord is my light and my salvation meaning", "whom shall i fear", "psalm 27 meaning" (rides the pack's existing Ps 27:1 anchor).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None.

## Psalms 28
1. Existing tags (book doc): `prayer`, `trust-in-god`, `gods-protection` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar. Standing declines re-checked and left standing: `benediction` on 28:9 (batch-1 Decisions #6 — an intercession addressed to God, not a blessing pronounced over people; the text supports the decline); the pass's `vengeance` skip (28:4 one petition verse — described, not endorsed, in the summary prose). `unanswered-prayer` considered and NOT added: 28:1 fears silence but the psalm's hinge is prayer heard (28:6).
3. Anchor-extension candidates: `shepherds-and-the-flock` | Psalms 28:9 | "Save your people, and bless your inheritance. Be their shepherd also, and bear them up forever." | w=0.55 — the God-as-shepherd-of-the-people register; the pack's Psalter anchors are 23:1 and 100:3.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 46: `the-lords-anointed` — Psalms 28:8 "He is a stronghold of salvation to his anointed." — supporting in-corpus ref.)

## Psalms 29
1. Existing tags (book doc): `worship`, `praise`, `god-reigns` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar. Considered and NOT added: `power-of-gods-word` (the sevenfold storm-voice is theophany, not the pack's scripture-permanence register — a category error the boundary notes warn about); `angels` (29:1's "you sons of the mighty" is one summons verse of debated identity); `creation` (the storm rides over creation; no making); `peace-of-god` (29:11 one closing clause).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Psalms 30
1. Existing tags (book doc): `thanksgiving`, `pastoral-prayer-for-healing`, `joy-in-the-lord`, `restoration`, `praise` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. Considered and NOT added: `pastoral-grief-and-loss` (30:11's mourning is the psalmist's own crisis reversed, not bereavement — register fail; the pack's "sorrow into joy" lexicon phrase must NOT gain a Ps 30 anchor for the same reason); `mortality` (30:9 one verse); `pastoral-serious-illness` (the recovery testimony rides the sitting healing tag — duplicate register).
3. Anchor-extension candidates: `restoration` | Psalms 30:11 | "You have turned my mourning into dancing for me. You have removed my sackcloth, and clothed me with gladness," | w=0.75 — the reversal text; the pack anchors 23:3 and 103:4-5 only.
4. Lexicon candidates: `restoration` | mourning into dancing | queries: "god turns sorrow into joy", "god turned my mourning into dancing", "joy after sorrow bible" (the first and third phrasings have no lexical match; curator note — keep these routed to `restoration`, not `pastoral-grief-and-loss`, per the register-fail above).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

---

### Block survival audit (CONVENTIONS §9) — Psalms 1–30 block, 2026-08-26

Written as one atomic end-of-file append; post-write the file was re-read, pre-existing bytes verified unchanged (this block created the file — header + this block are the whole content), and this block verified present exactly once. Block tallies: **8 ADDs** (Ps 5 `divine-judgment`; Ps 10 `justice-and-oppression`; Ps 15 `integrity`; Ps 20 `trusting-in-man`; Ps 22 `nations-and-peoples`; Ps 23 `shepherds-and-the-flock`; Ps 25 `fear-of-the-lord`; Ps 26 `integrity`) · **0 DROPs** · 117 KEEPs (all baseline tags re-checked against the WEB text) · **20 anchor-extension candidates** · **8 lexicon candidates** · **1 new-concept candidate** (`atheism-and-unbelief`, Ps 14) · **0 decline overturns** · **9 corpus-blocked routings** across roster rows 6 (Pss 7, 11, 17, 26), 32 (Ps 18), 44 (Ps 18), 46 (Pss 2, 18, 20, 28) · ceiling flags: none at 8; Pss 22 and 23 land at 7 (flagged for per-verse refinement); no psalm in 1–30 is subdivided in the book doc.

---

## This block: Psalms 31–60 (sweep worker chunk 2 of 5, 2026-08-26)

Same inputs, rules, and entry format as the Psalms 1–30 block above (repo e762d1c; canonical `tag-apply/adopted-concepts.md` 161-id list; WEB quotes word-for-word from the staged verse-per-line 87fd68c extraction, straight-apostrophe typography, words unaltered). Within 31–60, Psalms 32, 33, 34, 37, 39, 40, 42, 46, 51, 55, 56 are additionally pinned-fixture witnessed at e762d1c (batch-1/batch-2 header lists); the rest are verified against the 87fd68c full fixture only. **Systematic seam check applied per psalm** (new, from chunk 1's Ps 23 finding): every engine anchor falling in Pss 31–60 was checked against the psalm's baseline tags; the result is recorded per psalm ("seam check: clean" or the finding). Chunk 1's entries are prior art: no candidate it carries is re-proposed; added refs cross-reference the earlier entry instead.

## Psalms 31
1. Existing tags (book doc): `refuge-in-trouble`, `trust-in-god`, `surrender-to-god`, `pastoral-god-sees-my-suffering`, `hope-in-god` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. The pass's `slander-and-false-accusation` skip stands (31:13, 18 — two verses in a long psalm; no new evidence). Corpus-blocked row 17 (`courage`) needs no routing for 31:24 "Be strong, and let your heart take courage" — the row itself records this divine-comfort formula (Ps 27:14's twin) as fear-not's register, "precisely NOT this gap" (the Ps 27 precedent in chunk 1).
3. Anchor-extension candidates: `surrender-to-god` | Psalms 31:5 | "Into your hand I commend my spirit. You redeem me, LORD, God of truth." | w=0.75 — the pack has no Psalm 31 anchor and no OT commit-my-spirit text; the display tag already rests on this verse, and Luke 23:46's use is the signposted NT application.
4. Lexicon candidates: `surrender-to-god` | into your hands I commit my spirit | queries: "into your hands I commit my spirit", "father into your hands I commit my spirit meaning", "commit your spirit to god" — the remembered KJV/Luke phrasing ("commit") has no lexical match in the WEB psalm ("Into your hand I commend my spirit"), a genuine translation-gap row riding the proposed 31:5 anchor.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: one finding — `seasons-of-life` anchors Psalms 31:15 (w=0.7) with no corresponding display tag; ADD declined on the presence bar ("My times are in your hand" is one clause inside the trust declaration the sitting `trust-in-god` tag already quotes; the psalm depicts trust under persecution, not the concept's seasons teaching). (ROUTED to corpus-blocked roster row 8: `gods-holy-name` — Psalms 31:3 "for your name's sake lead me and guide me" is a second in-corpus supporting phrase beside the row's recorded Ps 23:3; supporting ref only, the row's minting register remains Ezekiel's for-my-name's-sake acting.)

## Psalms 32
1. Existing tags (book doc): `forgiveness-of-sins`, `repentance`, `the-lords-discipline`, `guidance`, `joy-in-the-lord` — 5.
2. Applied-tag deltas: ADD `confession-of-sin` (adopted §11.1 id) — the psalm's hinge is the confession act itself, named three ways in one verse: "I acknowledged my sin to you. I didn't hide my iniquity. I said, I will confess my transgressions to the LORD, and you forgave the iniquity of my sin." (32:5), with the cost of withheld confession depicted at length ("When I kept silence, my bones wasted away", 32:3). Precedent: the 2026-08-25 pass applied `confession-of-sin` to Ps 51 beside sitting `repentance`/`forgiveness-of-sins` — Ps 32 is the vocabulary's other canonical confession text (Rom 4:6-8 quotes it; signposted), but the log row's refs were 51:3-4 only, so Ps 32 was never swept against the adopted id. Lands at 6 (soft cap). KEEP the other 5. This ADD also supplies Ps 32:3-5 as refs for the `confession-of-sin` row (consolidated plan §A.16) — the id is not engine-built, so no anchor is proposable; refs ride the row.
3. Anchor-extension candidates: None (engine coverage present: `forgiveness-of-sins` 32:1-2, 32:5; `guidance` 32:8; `refuge-in-trouble` 32:7; `joy-in-the-lord` 32:11).
4. Lexicon candidates: None ("you are my hiding place" already in the `refuge-in-trouble` lexicon as "hiding place" and anchored at 32:7).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 post-delta (no ceiling hit).
8. Decisions record: None. Seam check: one finding — `refuge-in-trouble` anchors Psalms 32:7 (w=0.8) with no display tag; ADD declined on the presence bar (one verse in a penitential psalm; search already served by the anchor — the recorded anchors-serve-queries / display-follows-substance split).

## Psalms 33
1. Existing tags (book doc): `praise`, `creation`, `providence`, `hope-in-god`, `gods-protection`, `trustworthiness-of-scripture` — 6 (soft cap).
2. Applied-tag deltas: ADD `trusting-in-man` — the psalm's pivot is the concept's own vanity-of-human-power statement, and the engine pack already anchors exactly these verses (33:16-17, w=0.9): "There is no king saved by the multitude of an army. A mighty man is not delivered by great strength. A horse is a vain thing for safety, neither does he deliver any by his great power." (33:16-17), answered by "Behold, the LORD's eye is on those who fear him" (33:18). The id post-dates the 2026-08-23 batch vocabulary (131 ids) and sat on no 2026-08-25 worklist row, so Ps 33 was never swept against it — the same coverage seam as chunk 1's Ps 23 / Ps 20 findings (the Ps 20 entry above proposed the pack's missing 20:7 anchor; this is its already-anchored display twin). Registers distinct beside `gods-protection`/`hope-in-god` (the failure of human strength vs the LORD's watching care). Lands at 7; every sitting tag independently re-checked and clears the bar. KEEP the other 6. Standing decline re-checked and left standing: `praying-for-leaders` (batch-1 Decisions #8 — the pack's 33:12 anchor serves search; the chapter depicts no praying).
3. Anchor-extension candidates: None (`trusting-in-man` already anchors 33:16-17; `providence` 33:10-11; `fear-of-the-lord` 33:8; `praise` 33:1; `trustworthiness-of-scripture` — the display tag's 33:4 ground is adjacent to the pack's Ps 12:6/19:7-9 anchors, no gap measured).
4. Lexicon candidates: `praise` | sing a new song | queries: "sing unto the lord a new song", "sing a new song to the lord meaning", "what is the new song in the bible" — the KJV-remembered "sing unto the LORD" phrasing misses the WEB's "Sing to him a new song" (33:3); rides the pack's existing Ps 33:1 anchor (the new-song texts 33:3; 40:3; 96:1; 98:1; 144:9; 149:1 span the Psalter).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: lands at 7 (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter.
8. Decisions record: None (no yield — 7 < ceiling). Seam check: two findings — `trusting-in-man` 33:16-17 (ADD above); `fear-of-the-lord` anchors 33:8 (w=0.9) with no display tag — ADD declined on the presence bar (33:8 is a summons verse and 33:18's "those who fear him" is already the sitting `gods-protection` justification's span; the teaching-unit home in this range is Ps 34 below). (ROUTED to corpus-blocked roster row 6: `god-looks-at-the-heart` — Psalms 33:13-15 "The LORD looks from heaven. He sees all the sons of men." … "he who fashions all of their hearts; and he considers all of their works." — the heart-fashioner-as-heart-reader witness for that row's curator; joins chunk 1's Pss 7, 11, 17, 26 routings.)

## Psalms 34
1. Existing tags (book doc): `praise`, `pastoral-near-to-the-brokenhearted`, `gods-protection`, `taming-the-tongue`, `gods-provision`, `hunger-for-god`, `angels`, `suffering-of-the-righteous` — 8 (hard ceiling).
2. Applied-tag deltas: ADD `fear-of-the-lord` — the psalm announces it as its own teaching topic: "Come, you children, listen to me. I will teach you the fear of the LORD." (34:11), with the theme developed across the psalm ("Oh fear the LORD, you his saints, for there is no lack with those who fear him.", 34:9; "The LORD's angel encamps around those who fear him", 34:7) — and Ps 34:11 is the engine pack's own w=1.0 LEAD anchor. Seam-check catch of exactly the class chunk 1 found at Ps 23: the id post-dates the 131-id drafting vocabulary, and the 2026-08-25 worklist row (log §A.18) carried only Pss 111/112/115/118/128/147 refs, so Ps 34 — the pack's namesake teaching text — was never swept against it. DROP `angels` — §11.6 ceiling yield, recorded below. Psalm stays at 8. KEEP the other 7 (each independently re-checked against the text and clears the bar).
3. Anchor-extension candidates: `angels` | Psalms 34:7 | "The LORD's angel encamps around those who fear him, and delivers them." | w=0.6 — the pack has NO Psalm 34 anchor (its Psalter anchor is 103:20-21), so the display drop above costs search nothing only if this anchor lands; the encamping-angel text is a first-rank "guardian angel" query target. (The recorded anchors-serve-queries / display-follows-substance split, applied in both directions.)
4. Lexicon candidates: None ("taste and see" is already in the `hunger-for-god` lexicon; "the angel of the lord" already in the `angels` lexicon).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD-CEILING-8 (post-delta) — mark for the per-verse refinement pass (the psalm's testimony movement vv. 1-10 and teaching movement vv. 11-22 are natural sections; no BSB subdivision recorded).
8. Decisions record: §11.6 ceiling yield — `angels` DROPPED from Psalm 34 (not silently: recorded here). At the ceiling with a candidate that outranks it under main-themes-first (fear-of-the-lord is the psalm's own announced topic and the pack's lead anchor), the yield order reaches `angels` first as the weakest sitting tag: thin single-verse (34:7 only) AND broad-duplicating-specific on its span (34:7 is already quoted inside the sitting `gods-protection` justification). Its search value is preserved by the §3 anchor-extension candidate. Reversible; if the curator prefers no drop, `fear-of-the-lord` becomes the recorded ceiling-yield follow-up candidate instead (the Ps 102 `gods-unchanging-nature` pattern). Seam check: three further findings, all declined on presence/duplication — `blessing` anchors 34:8 (span sits with `hunger-for-god`), `shame` anchors 34:5 (one verse), `refuge-in-trouble` anchors 34:7, 34:19 (spans carried by `gods-protection` and `suffering-of-the-righteous`). (ROUTED to corpus-blocked roster row 32: `deliverance` — Psalm 34 is a rescue-testimony witness: "I sought the LORD, and he answered me, and delivered me from all my fears." (34:4), "This poor man cried, and the LORD heard him, and saved him out of all his troubles." (34:6), "The righteous cry, and the LORD hears, and delivers them out of all their troubles." (34:17); joins chunk 1's Ps 18 routing.)

## Psalms 35
1. Existing tags (book doc): `pastoral-refuge-and-justice`, `prayer`, `thanksgiving`, `honesty`, `slander-and-false-accusation`, `vengeance` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar (imprecatory petitions described, never endorsed, per the standing rule the sitting `vengeance` justification already keeps). The pass's skips stand on re-read: `lament` (35:17 alone), `angels` (35:5-6 — the quotes are now mechanically verifiable against the staged text, but the thin-presence judgment holds: two in-scene clauses inside the imprecations, not the concept's teaching substance).
3. Anchor-extension candidates: None (`slander-and-false-accusation` already anchors 35:11 w=0.7).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None. Seam check: clean. (ROUTED to corpus-blocked roster row 14: `gloating-over-downfall` — Psalm 35 is the victim's-side witness of that row's register, richer than the row's lone recorded Job 31:29: "But in my adversity, they rejoiced, and gathered themselves together." (35:15), "Don't let those who are my enemies wrongfully rejoice over me" (35:19), "Vindicate me, LORD my God, according to your righteousness. Don't let them gloat over me." (35:24), "Let them be disappointed and confounded together who rejoice at my calamity." (35:26) — in-corpus refs for the row's fold-or-mint decision at the re-pin.)

## Psalms 36
1. Existing tags (book doc): `sin`, `gods-love`, `refuge-in-trouble`, `gods-provision` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. `living-water` considered and NOT added: the river-of-pleasures/spring-of-life image (36:8-9) is two verses inside the loving-kindness hymn — routed engine-side instead (below).
3. Anchor-extension candidates: `living-water` | Psalms 36:8-9 | "You will make them drink of the river of your pleasures. For with you is the spring of life. In your light we will see light." | w=0.6 — the pack anchors Jer 2:13/17:13 and John 4 but has no Psalter text; this is the Psalter's fountain-of-life verse.
4. Lexicon candidates: `living-water` | fountain of life | queries: "the fountain of life in the bible", "fountain of living waters", "god is the fountain of life" — the KJV-remembered "fountain" phrasing has NO lexical match in the WEB (36:9 reads "the spring of life"; Jer 2:13 reads "the spring of living waters"), a genuine translation-gap row riding the proposed 36:8-9 anchor.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 37
1. Existing tags (book doc): `trust-in-god`, `peace-of-god`, `envy-and-jealousy`, `contentment`, `guidance`, `gods-provision`, `prosperity-of-the-wicked` — 7.
2. Applied-tag deltas: No changes — all 7 independently clear the bar (the apologetics pass's `prosperity-of-the-wicked` addition included). `generosity` considered and NOT re-added: batch-1 motif item 6 records it was "dropped from Psalm 37's tag line only by the six-tag cap" under the old cap-6 rule, but on re-read the presence is two scattered single verses (37:21, 26) in a 40-verse psalm — under §11 the presence bar comes first and the psalm already sits at 7; the engine pack anchors 37:21 (w=0.7), so search is served. `humble-exaltation` considered and NOT added (the humble-inherit refrain is a recurring strand, 37:9, 11, 22, 29, 34, but its intent home is the anchor+lexicon extension below, not a display tag competing at 7).
3. Anchor-extension candidates: `humble-exaltation` | Psalms 37:11 | "But the humble shall inherit the land, and shall delight themselves in the abundance of peace." | w=0.65 — the OT source of the third beatitude; the pack has no Psalm 37 anchor and its "god exalts the humble" register is exactly the psalm's humble-inherit promise (Matt 5:5's use is the NT signpost, not asserted).
4. Lexicon candidates: `humble-exaltation` | the meek shall inherit the earth | queries: "the meek shall inherit the earth meaning", "who are the meek in the bible", "blessed are the meek old testament" — the remembered KJV/Matthew phrasing ("meek… earth") has NO lexical match in the WEB psalm ("the humble shall inherit the land", 37:11), the chunk-1 "out of the mouth of babes" pattern exactly.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter (40 verses, the Psalter's longest acrostic-style wisdom psalm in this range; no BSB subdivision recorded).
8. Decisions record: None. Seam check: clean (`envy-and-jealousy` 37:1, `trust-in-god` 37:5, `peace-of-god` 37:7/37:1, `guidance` 37:23, `prosperity-of-the-wicked` 37:35-36, `generosity` 37:21 — every in-range anchor's concept is either tagged or recorded above).

## Psalms 38
1. Existing tags (book doc): `the-lords-discipline`, `sin`, `repentance`, `pastoral-serious-illness`, `hope-in-god`, `loneliness` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar.
3. Anchor-extension candidates: `the-lords-discipline` | Psalms 38:1-2 | "LORD, don't rebuke me in your wrath, neither chasten me in your hot displeasure. For your arrows have pierced me, your hand presses hard on me." | w=0.65 — companion to chunk 1's proposed Ps 6:1 anchor (the pack's only anchors are Heb 12:7-11 and Rev 3:19); the two penitential don't-rebuke openings are the OT prayers under discipline. `loneliness` | Psalms 38:11 | "My lovers and my friends stand aloof from my plague. My kinsmen stand far away." | w=0.6 — the abandoned-in-illness register; the pack's Psalter anchors are 27:10 and 68:6.
4. Lexicon candidates: None (chunk 1's Ps 6 "is god punishing me" family covers this psalm's query surface; no separate row needed).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None. Seam check: clean.

## Psalms 39
1. Existing tags (book doc): `taming-the-tongue`, `hope-in-god`, `the-lords-discipline`, `mortality`, `sojourners-and-strangers` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. Standing decline re-checked and left standing: `stewardship-of-days` (batch-1 Decisions #12 — 39:4 is mortality-awareness, not redeeming-the-time).
3. Anchor-extension candidates: None (engine coverage present: `mortality` 39:4-5, `hope-in-god` 39:7, `taming-the-tongue` 39:1, `sojourners-and-strangers` 39:12).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean. (ROUTED to corpus-blocked roster row 19: `vanity-of-life` — Psalms 39:5-6, 11 is the Psalter's in-corpus witness of the row's hevel register while the Ecclesiastes thesis texts stay blocked: "Surely every man stands as a breath." (39:5), "Surely every man walks like a shadow. Surely they busy themselves in vain. He heaps up, and doesn't know who shall gather." (39:6), "Surely every man is but a breath." (39:11) — for the row's curator at the re-pin.)

## Psalms 40
1. Existing tags (book doc): `trust-in-god`, `praise`, `obedience-to-the-word`, `sharing-your-faith`, `messianic-prophecy` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar (`messianic-prophecy` keeps its attributed Heb 10:5-7 citation per the standing rule; the pack already anchors 40:6-8 w=0.85).
3. Anchor-extension candidates: None (`pastoral-hope-in-despair` already anchors 40:1-3 w=0.8 — the pit-rescue text is engine-covered).
4. Lexicon candidates: None ("out of the miry clay" and "a horrible pit" appear verbatim in the WEB, so lexical search lands them; per the alias-mining rule, no row for a query that already lands).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean. (ROUTED to corpus-blocked roster row 32: `deliverance` — Psalm 40:1-3 is the row's rescue-narrative register in miniature: "He brought me up also out of a horrible pit, out of the miry clay. He set my feet on a rock, and gave me a firm place to stand." (40:2), with the testimony turn "He has put a new song in my mouth" (40:3) and the closing "You are my help and my deliverer." (40:17); joins the Pss 18, 34 routings.)

## Psalms 41
1. Existing tags (book doc): `generosity`, `pastoral-prayer-for-healing`, `pastoral-betrayal-and-marriage-crisis`, `slander-and-false-accusation`, `messianic-prophecy` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. `betrayal` considered and NOT added: 41:9 is one verse already carrying two display tags (`pastoral-betrayal-and-marriage-crisis`, `messianic-prophecy` via John 13:18) — a third on the identical verse is the duplicate-register limit (chunk 1's Ps 13 precedent); the engine pack already anchors 41:9 (w=0.9), so search is served, and the concept's developed display home in this range is Ps 55 (below).
3. Anchor-extension candidates: `generosity` | Psalms 41:1 | "Blessed is he who considers the poor. The LORD will deliver him in the day of evil." | w=0.6 — the considers-the-poor beatitude; the pack's only Psalter anchor is 37:21.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: one finding — `betrayal` anchors 41:9 (w=0.9) with no display tag; declined as above (recorded, not silent).

## Psalms 42
1. Existing tags (book doc): `hunger-for-god`, `pastoral-hope-in-despair`, `hope-in-god`, `lament` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. `wrestling-with-god` considered and NOT added: 42:9's "Why have you forgotten me?" is the span the sitting `lament` tag quotes — duplicate register on the same verses (the chunk-1 Ps 13 precedent, where the same pack's anchor also sits).
3. Anchor-extension candidates: None (engine coverage dense: `hunger-for-god` 42:1-2 lead, `pastoral-hope-in-despair` 42:5, `do-not-lose-heart` 42:5, `lament` 42:9-10).
4. Lexicon candidates: `do-not-lose-heart` | why are you cast down my soul | queries: "why so downcast o my soul", "why are you cast down o my soul", "hope thou in god" — the remembered KJV/ESV/NIV refrain wordings ("cast down", "downcast") have NO lexical match in the WEB ("Why are you in despair, my soul?", 42:5, 11); rides the pack's existing Ps 42:5 anchor (`pastoral-hope-in-despair` and `hope-in-god` are alternative homes — curator's routing call; the anxious-searcher register suggests the pastoral pack).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: one finding — `do-not-lose-heart` anchors 42:5 (w=0.9) with no display tag; ADD declined (the identical two-verse refrain already carries `pastoral-hope-in-despair` and `hope-in-god` — duplicate-register limit; recorded, not silent).

## Psalms 43
1. Existing tags (book doc): `guidance`, `hope-in-god`, `worship`, `lament` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar (the untitled psalm continues Ps 42's situation and refrain — cross-reference, not re-derivation, per the book doc).
3. Anchor-extension candidates: `guidance` | Psalms 43:3 | "Oh, send out your light and your truth. Let them lead me. Let them bring me to your holy hill, to your tents." | w=0.6 — the light-and-truth-as-guides prayer; the pack has no Psalm 43 anchor.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 44
1. Existing tags (book doc): `prayer`, `covenant`, `lament`, `suffering-of-the-righteous` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar (the no-pastoral-tag call on this national-scale corporate lament is batch-1 Decisions #17, re-checked and standing; `doubt` decline #10 likewise stands — the psalm argues with God from covenant fidelity, never doubting him).
3. Anchor-extension candidates: None (`suffering-of-the-righteous` already anchors 44:22 w=0.7).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean. (ROUTED to corpus-blocked roster row 6: `god-looks-at-the-heart` — Psalms 44:20-21 "If we have forgotten the name of our God, or spread out our hands to a strange god, won't God search this out? For he knows the secrets of the heart." — the corporate secrets-of-the-heart witness for that row's curator; joins the Pss 7, 11, 17, 26 (chunk 1) and 33 routings.)

## Psalms 45
1. Existing tags (book doc): `blessing`, `messianic-prophecy` — 2.
2. Applied-tag deltas: No changes — both clear the bar. Standing decline re-checked and left standing: `godly-marriage` (batch-1 Decisions #7 — a royal wedding ode teaches nothing about marriage as such; the text still supports the decline).
3. Anchor-extension candidates: `messianic-prophecy` | Psalms 45:6-7 | "Your throne, God, is forever and ever. A scepter of equity is the scepter of your kingdom." | w=0.8 — the pack anchors Pss 16, 22, 40, 110 but NOT Psalm 45, the throne address Hebrews 1:8-9 quotes (attributed citation per the standing rule; the display tag already rests on these verses).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean. (ROUTED to corpus-blocked roster row 48: `romantic-love-and-intimacy` — Psalms 45:10-15 (the bride led "to the king in embroidered work… With gladness and rejoicing", 45:14-15) is the Psalter's one wedding-celebration text, a supporting in-corpus witness while the row's Song of Solomon corpus presence stays 2:1 alone; supporting refs only — the row's minting register and its non-graphic design note are the Song's, and the folded waiting-and-timing rider is untouched.)

## Psalms 46
1. Existing tags (book doc): `refuge-in-trouble`, `fear-not`, `presence-of-god`, `peace-of-god`, `zion-city-of-god` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar.
3. Anchor-extension candidates: `fear-not` | Psalms 46:2-3 | "Therefore we won't be afraid, though the earth changes, though the mountains are shaken into the heart of the seas;" | w=0.6 — the corporate we-won't-fear confession; the pack's Psalter anchors (27:1, 3; 56:11) are all individual-register, and the display tag already rests on these verses.
4. Lexicon candidates: None ("be still and know" is already in the `refuge-in-trouble` lexicon with the 46:10 anchor; "god is our refuge", "a very present help in trouble" land lexically).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`refuge-in-trouble` 46:1-3 lead + 46:10, `zion-city-of-god` 46:4-5 lead — both tagged).

## Psalms 47
1. Existing tags (book doc): `praise`, `worship`, `god-reigns` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar. `nations-and-peoples` considered and NOT added: the nations here are summoned spectators and subdued peoples (47:1, 3) with one gathered-princes verse (47:9) — the psalm's substance is the King's enthronement, which the sitting `god-reigns` carries; single-verse presence for the all-nations-worship register.
3. Anchor-extension candidates: `god-reigns` | Psalms 47:7-8 | "For God is the King of all the earth. Sing praises with understanding. God reigns over the nations. God sits on his holy throne." | w=0.75 — the pack's enthronement anchors (10:16; 24:7-10; 93; 96) lack the Psalter's most explicit "God reigns" sentence.
4. Lexicon candidates: None ("clap your hands" lands lexically at 47:1).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 48
1. Existing tags (book doc): `praise`, `worship`, `gods-protection`, `zion-city-of-god` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar.
3. Anchor-extension candidates: None (`zion-city-of-god` already anchors 48:1-2 w=0.8).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 49
1. Existing tags (book doc): `contentment`, `hope-in-god`, `mortality` — 3.
2. Applied-tag deltas: ADD `money-and-possessions` — the psalm's riddle is the concept's danger-of-riches register, sustained across both halves: "Those who trust in their wealth, and boast in the multitude of their riches— none of them can by any means redeem his brother" (49:6-7), "Don't be afraid when a man is made rich, when the glory of his house is increased; for when he dies he will carry nothing away." (49:16-17), closing "A man who has riches without understanding, is like the animals that perish." (49:20). Both-tags beside the sitting `contentment` — registers genuinely distinct (contentment's better-is-a-little posture vs the powerlessness and peril of wealth itself, the pack's "danger of riches"/"deceitfulness of riches" register). The engine pack has no Psalter anchor and the id sat on no 2026-08-25 worklist row, so Ps 49 was never swept against it. Lands at 4. KEEP the other 3.
3. Anchor-extension candidates: `money-and-possessions` | Psalms 49:16-17 | "Don't be afraid when a man is made rich, when the glory of his house is increased; for when he dies he will carry nothing away." | w=0.7 — the pack's OT anchors are Eccl 5:10 and Prov 23:4-5; this is the Psalter's wealth-and-death text. `mortality` | Psalms 49:12 | "But man, despite his riches, doesn't endure. He is like the animals that perish." | w=0.7 — the pack anchors Pss 39, 90, 103 but not 49, the like-the-animals verdict its display tag rests on.
4. Lexicon candidates: None ("you can't take it with you" was checked: a real query family, but its natural home is the proposed 49:16-17 anchor riding the pack's existing "danger of riches" lexicon — curator may add the phrase there if fixtures show a miss; not asserted as a row here).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean. (ROUTED to corpus-blocked roster row 23: `redeemer` — Psalms 49:7-8, 15 is an in-corpus redemption-vocabulary witness while Job 19:25-27 stays blocked: "none of them can by any means redeem his brother, nor give God a ransom for him. For the redemption of their life is costly, no payment is ever enough" (49:7-8), answered by "But God will redeem my soul from the power of Sheol, for he will receive me." (49:15) — the God-alone-redeems turn, supporting refs for that row's curator (the row's minting register remains Job's my-redeemer-lives.))

## Psalms 50
1. Existing tags (book doc): `divine-judgment`, `thanksgiving`, `worship`, `prayer`, `covenant`, `sin` — 6 (soft cap).
2. Applied-tag deltas: ADD `empty-worship` — the psalm's second oracle is the concept's exact register, worship-words without obedience: "But to the wicked God says, 'What right do you have to declare my statutes, that you have taken my covenant on your lips, since you hate instruction, and throw my words behind you?'" (50:16-17), grounded by the first oracle's not-your-bulls corrective ("I have no need for a bull from your stall", 50:9; "Will I eat the meat of bulls, or drink the blood of goats?", 50:13) — the same family as the pack's Isa 1:11-17 and Amos 5:21-24 anchors. Registers distinct beside the sitting `worship` (what God wants) and `sin` (the deed-list): this is the hypocrisy indictment itself. Lands at 7; every sitting tag independently re-checked and clears the bar. KEEP the other 6. The pass's `oaths-and-vows` skip stands (50:14 one clause — no new evidence).
3. Anchor-extension candidates: `empty-worship` | Psalms 50:16-17 | "What right do you have to declare my statutes, that you have taken my covenant on your lips, since you hate instruction, and throw my words behind you?" | w=0.7 — the pack has no Psalter anchor; this is the OT's covenant-on-your-lips indictment. `thanksgiving` | Psalms 50:14, 23 | "Offer to God the sacrifice of thanksgiving. Pay your vows to the Most High." | w=0.7 — the sacrifice-of-thanksgiving teaching; the pack's Psalter anchors are 100:4 and 92:1. `prayer` | Psalms 50:15 | "Call on me in the day of trouble. I will deliver you, and you will honor me." | w=0.6 — the call-on-me invitation; no pack has it.
4. Lexicon candidates: `empty-worship` | cattle on a thousand hills | queries: "god owns the cattle on a thousand hills", "cattle on a thousand hills meaning", "he owns the cattle on a thousand hills verse" — the remembered KJV "cattle" phrasing has NO lexical match in the WEB ("the livestock on a thousand hills", 50:10); rides the proposed Ps 50 anchors. Routing note for the curator: the popular devotional use of the phrase is God's-abundant-resources (a `gods-provision` reading); the verse's own teaching is God's self-sufficiency inside the not-your-bulls oracle — the row is offered on `empty-worship` with `gods-provision` recorded as the alternative home; fixture the routing, don't adjudicate it here.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: lands at 7 (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter (the two oracles vv. 7-15 / 16-21 are natural sections; no BSB subdivision recorded).
8. Decisions record: None (no yield — 7 < ceiling). Seam check: clean.

## Psalms 51
1. Existing tags (book doc): `repentance`, `forgiveness-of-sins`, `sin`, `restoration`, `sharing-your-faith`, `confession-of-sin` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar. Standing declines re-checked and left standing: `trinity`/`holy-spirit-the-comforter` on 51:11 (batch-2 Decisions #7 — read-back). `mercy` considered and NOT added (51:1's plea is the same span the sitting `forgiveness-of-sins` justification quotes — duplicate register on the same verse; the engine `mercy` pack's Psalter anchors are 103 and 86).
3. Anchor-extension candidates: `repentance` | Psalms 51:3-4, 17 | "For I know my transgressions. My sin is constantly before me. Against you, and you only, I have sinned" … "The sacrifices of God are a broken spirit. O God, you will not despise a broken and contrite heart." | w=0.9 — the pack's anchors (Acts 3:19; 1 John 1:9; Prov 28:13; Ezek 18:30-32 …) include NO Psalm 51 text: the Psalter's canonical repentance psalm is absent from the repentance pack, a first-order coverage gap for "psalm of repentance" ordering.
4. Lexicon candidates: None ("create in me a clean heart", "whiter than snow", "a broken and contrite heart" all land lexically or sit in pack lexicons already; `new-creation` anchors 51:10 w=0.9).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None. Seam check: two findings, both declined on the duplicate-register limit (recorded, not silent) — `new-creation` anchors 51:10 (w=0.9) and `pastoral-relapse-and-restoration` anchors 51:10-12 (w=0.9), but the sitting `restoration` tag already carries exactly that span ("Create in me a clean heart… Restore to me the joy of your salvation"), and a personal-register relapse reading is not the psalm's own frame (a grave fall confessed, not the pack's relapse-pattern register).

## Psalms 52
1. Existing tags (book doc): `honesty`, `trust-in-god`, `divine-judgment`, `thanksgiving`, `slander-and-false-accusation` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. `trusting-in-man` considered and NOT added: 52:7's "trusted in the abundance of his riches" is one verse whose contrast the sitting `trust-in-god` justification already carries (duplicate register on the same span); `money-and-possessions` likewise NOT added (same single verse; the developed home in this range is Ps 49).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 53
1. Existing tags (book doc): `sin` — 1. ("Only one honest tag" note stands in the doc.)
2. Applied-tag deltas: No changes — `sin` carries the universal audit: "They are corrupt, and have done abominable iniquity. There is no one who does good." (53:1), "There is no one who does good, no, not one." (53:3). Nothing else in the vocabulary is substantially present (`restoration-of-israel` considered and NOT added — 53:6 is one closing verse of longing, the Ps 14:7 pattern chunk 1 recorded).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: CROSS-REF, not a new proposal — chunk 1's `atheism-and-unbelief` candidate (Psalms 14 entry above) already names Ps 53:1 as its doublet anchor (proposed w=0.9): "The fool has said in his heart, 'There is no God.'" (53:1) is verified word-for-word in this psalm's staged text, and the Elohistic variant's distinct middle (God scattering the besiegers' bones, 53:5) adds no separate concept. Nothing re-minted.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean. (Doublet note: 53 ≈ 14, per the book doc — cross-referenced, not re-derived.)

## Psalms 54
1. Existing tags (book doc): `prayer`, `gods-protection`, `thanksgiving` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar. `slander-and-false-accusation` considered and NOT added: the Ziphite betrayal sits in the superscription; the psalm's enemies are violent pursuers, not false accusers — "For strangers have risen up against me. Violent men have sought after my soul." (54:3) — the same text-over-worklist judgment the pass recorded at Ps 86.
3. Anchor-extension candidates: None ("Behold, God is my helper." (54:4) lands lexically for helper queries).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean. (ROUTED to corpus-blocked roster row 32: `deliverance` — Psalms 54:7 "For he has delivered me out of all trouble. My eye has seen triumph over my enemies." — the completed-rescue testimony, a compact in-corpus witness; joins the Pss 18, 34, 40 routings.)

## Psalms 55
1. Existing tags (book doc): `pastoral-betrayal-and-marriage-crisis`, `prayer`, `trust-in-god`, `lament` — 4.
2. Applied-tag deltas: ADD `betrayal` — the psalm is the engine pack's own w=1.0 LEAD anchor (55:12-14) and the fullest betrayed-by-a-friend text in Scripture: "For it was not an enemy who insulted me, then I could have endured it." (55:12), "But it was you, a man like me, my companion, and my familiar friend. We took sweet fellowship together." (55:13-14), "He raises his hands against his friends. He has violated his covenant." (55:20). Seam-check catch of the chunk-1 Ps 23 class: the id post-dates the 131-id drafting vocabulary, and the 2026-08-25 worklist row (Obadiah append) carried only Ps 109:4-5, so Ps 55 — the pack's lead anchor — was never swept against it. Both-tags beside the sitting `pastoral-betrayal-and-marriage-crisis`, registers genuinely distinct: the pastoral pack is the marriage-crisis personal register (its lexicon is spousal throughout), while the psalm's own betrayer is a companion and familiar friend — the general friend-betrayal register `betrayal` owns ("betrayed by a friend" is its lexicon). Lands at 5. KEEP the other 3. The pass's `slander-and-false-accusation` skip stands (55:3 one verse).
3. Anchor-extension candidates: None (`betrayal` 55:12-14 w=1.0 and `pastoral-betrayal-and-marriage-crisis` 55:12-14, 20-22 already anchored; `rest-for-the-weary` 55:22 w=0.8 anchored; `lament` 55:1-2 w=0.95 anchored).
4. Lexicon candidates: None ("cast your burden on the lord" is verbatim WEB at 55:22 — lexical search lands it).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: two findings — `betrayal` 55:12-14 lead anchor untagged (ADD above); `rest-for-the-weary` anchors 55:22 with no display tag — ADD declined (one verse; the span sits inside the sitting `trust-in-god` justification; recorded, not silent).

## Psalms 56
1. Existing tags (book doc): `trust-in-god`, `fear-not`, `pastoral-god-sees-my-suffering`, `thanksgiving`, `slander-and-false-accusation` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. The pass's `oaths-and-vows` skip stands (56:12 one verse, carried by `thanksgiving` — no new evidence).
3. Anchor-extension candidates: None (`fear-not` 56:11 w=0.85, `slander-and-false-accusation` 56:5 w=0.95, `pastoral-god-sees-my-suffering` 56:8 w=0.9, `oaths-and-vows` 56:12 w=0.8 all anchored).
4. Lexicon candidates: `pastoral-god-sees-my-suffering` | tears in a bottle | queries: "god keeps my tears in a bottle", "tears in a bottle bible verse", "you have collected all my tears" — the remembered KJV/NLT phrasings ("bottle", "collected") have NO lexical match in the WEB ("You put my tears into your container. Aren't they in your book?", 56:8); a genuine translation-gap row riding the pack's existing 56:8 anchor.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean. (ROUTED to corpus-blocked roster row 32: `deliverance` — Psalms 56:13 "For you have delivered my soul from death, and prevented my feet from falling, that I may walk before God in the light of the living." — supporting in-corpus ref; joins the Pss 18, 34, 40, 54 routings.)

## Psalms 57
1. Existing tags (book doc): `refuge-in-trouble`, `praise`, `gods-love` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar. The pass's `slander-and-false-accusation` skip stands (57:4 single-verse metaphor). `trust-in-god` considered and NOT added ("My heart is steadfast" (57:7) is resolve-to-praise, carried by the sitting `praise`).
3. Anchor-extension candidates: None ("in the shadow of your wings, I will take refuge" (57:1) is served by `refuge-in-trouble`'s existing wings anchor at Ps 91:4 and lands lexically).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 58
1. Existing tags (book doc): `divine-judgment`, `sin`, `vengeance` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (imprecations described, never endorsed: the curses of 58:6-8 are prayers for the unmaking of the violent, asked of God rather than carried out by hand, aimed at the public verdict "Most certainly there is a God who judges the earth." (58:11) — the sitting tags' frame, kept). `justice-and-oppression` considered and NOT added: the unjust-rulers cross-examination (58:1-2) is two verses whose substance the sitting `divine-judgment`/`sin` pair carries; no oppressed-party material beyond it.
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 59
1. Existing tags (book doc): `gods-protection`, `prayer`, `praise`, `vengeance` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar (the `vengeance` justification keeps the judgment-handed-to-God frame with its stated reason, "or my people may forget" (59:11) — described, never endorsed). The pass's skips stand: `god-reigns` (59:13 — the clause "God rules in Jacob" is now mechanically verifiable against the staged text, but the single-verse judgment holds), `slander-and-false-accusation` (59:12 one verse).
3. Anchor-extension candidates: None. Cross-ref: Psalms 59:9 "God is my high tower." and 59:16 "For you have been my high tower, a refuge in the day of my distress." supply two further high-tower refs for chunk 1's `refuge-in-trouble` | high tower lexicon candidate (Psalms 9 entry above) — appended to that earlier entry, not re-proposed.
4. Lexicon candidates: None beyond the cross-ref above.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 60
1. Existing tags (book doc): `prayer`, `restoration`, `trust-in-god`, `lament` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar (the national-lament register carries no pastoral-* tag, per the standing ruling). `trusting-in-man` considered and NOT added: "the help of man is vain" (60:11) is one clause the sitting `trust-in-god` justification already quotes — duplicate register on the same verse.
3. Anchor-extension candidates: None (`restoration`'s personal-renewal register fits 60:1-2's corporate "Restore us, again." only loosely — the display tag is the batch's reviewed call, kept; no engine anchor proposed on a register boundary the curator hasn't ruled).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean. (Double note for chunk 5: 60:5-12 = 108:6-13 per the book doc — the Psalm 108 worker should cross-reference this entry rather than re-derive.)

---

### Block survival audit (CONVENTIONS §9) — Psalms 31–60 block, 2026-08-26

Written as one atomic end-of-file append; post-write the file was re-read, pre-existing bytes (header + the Psalms 1–30 block) verified unchanged, and this block verified present exactly once. Block tallies: **6 ADDs** (Ps 32 `confession-of-sin`; Ps 33 `trusting-in-man`; Ps 34 `fear-of-the-lord`; Ps 49 `money-and-possessions`; Ps 50 `empty-worship`; Ps 55 `betrayal`) · **1 DROP** (Ps 34 `angels` — §11.6 ceiling yield, recorded in that entry with its anchor-extension offset; reversible) · 134 KEEPs (all other baseline tags re-checked against the WEB text) · **17 anchor-extension candidates** (Pss 31, 34, 36, 37, 38 ×2, 41, 43, 45, 46, 47, 49 ×2, 50 ×3, 51) · **7 lexicon candidates** (Pss 31, 33, 36, 37, 42, 50, 56 — five are KJV-remembered phrasings with no WEB lexical match: "commit my spirit", "fountain of life", "meek shall inherit the earth", "cast down o my soul", "tears in a bottle", plus "cattle on a thousand hills") · **0 new-concept candidates** (1 cross-ref: Ps 53 → chunk 1's `atheism-and-unbelief`, doublet anchor verified) · **0 decline overturns** · **11 corpus-blocked routings** across roster rows 6 (Pss 33, 44), 8 (Ps 31), 14 (Ps 35), 19 (Ps 39), 23 (Ps 49), 32 (Pss 34, 40, 54, 56), 48 (Ps 45) · **Seam-check catches:** 3 untagged namesake/lead-anchor seams became ADDs (Ps 34 `fear-of-the-lord` w=1.0 lead; Ps 55 `betrayal` w=1.0 lead; Ps 33 `trusting-in-man` w=0.9), 8 further anchor-without-tag findings recorded and declined per-psalm (31, 32, 33, 34 ×3, 41, 42, 51 ×2, 55) — none silent · ceiling flags: Ps 34 at 8 (hard ceiling, per-verse refinement); Pss 33, 37, 50 land at 7 (flagged as dense); no psalm in 31–60 is subdivided in the book doc · cross-refs to chunk 1: Ps 53 (atheism doublet), Ps 59 (high-tower lexicon refs → Ps 9 entry), Ps 38 (Ps 6 discipline anchor companion), Ps 41/55 (betrayal home split).

---

## This block: Psalms 61–90 (sweep worker chunk 3 of 5, 2026-08-26)

Same inputs, rules, and entry format as the Psalms 1–30 and 31–60 blocks above (repo e762d1c; canonical `tag-apply/adopted-concepts.md` 161-id list; WEB quotes word-for-word from the staged verse-per-line 87fd68c extraction, straight-apostrophe typography, words unaltered). Within 61–90, Psalms 62, 65, 73, 82, 86, 88 are additionally pinned-fixture witnessed at e762d1c (batch-2 header list); the rest are verified against the 87fd68c full fixture only. **Systematic seam check applied per psalm**: every engine anchor falling in Pss 61–90 was checked against the psalm's baseline tags; the result is recorded per psalm ("seam check: clean" or the finding). Chunks 1–2's entries are prior art: no candidate they carry is re-proposed; added refs cross-reference the earlier entry instead.

## Psalms 61
1. Existing tags (book doc): `refuge-in-trouble`, `prayer`, `oaths-and-vows` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar. Considered and NOT added: `gods-protection` (61:3-4's tower and wings are the sitting `refuge-in-trouble` justification's own span — duplicate register); `praying-for-leaders` (61:6-7's prayer for the king's life is two verses inside a personal refuge psalm — thin; the developed home in this range is Ps 72 below).
3. Anchor-extension candidates: `refuge-in-trouble` | Psalms 61:2-4 | "From the end of the earth, I will call to you when my heart is overwhelmed. Lead me to the rock that is higher than I." | w=0.75 — the pack has no Psalm 61 anchor; the rock-higher-than-I text with the strong-tower cascade ("For you have been a refuge for me, a strong tower from the enemy.", 61:3). `oaths-and-vows` | Psalms 61:5, 8 | "For you, God, have heard my vows." | w=0.6 — the vows-heard-and-kept frame the display tag rests on; the pack's Psalter anchors are 56:12, 116:14, 15:4.
4. Lexicon candidates: None ("the rock that is higher than I" is verbatim WEB — lexical search lands it; per the alias-mining rule, no row for a query that already lands).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 62
1. Existing tags (book doc): `trust-in-god`, `refuge-in-trouble`, `hope-in-god`, `contentment` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. `trusting-in-man` considered and NOT added: 62:9-10's don't-trust clauses target oppression, robbery, and riches — the span the sitting `contentment` justification quotes — not the pack's princes/horses register (the developed homes are Pss 20, 33 in chunks 1–2).
3. Anchor-extension candidates: `hope-in-god` | Psalms 62:5-6 | "My soul, wait in silence for God alone, for my expectation is from him." | w=0.7 — the display tag rests on this refrain but the pack's Psalter anchors are 39:7 and 146:5 only.
4. Lexicon candidates: None ("my soul rests in God alone" — "rest"/"soul"/"alone" land lexically and `rest-for-the-weary` already anchors 62:1-2).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: two findings, both declined (recorded, not silent) — `rest-for-the-weary` anchors 62:1-2 (w=0.9) with no display tag: the psalm's rest is quiet confidence under assault, already carried by the sitting `hope-in-god` on the same refrain (62:1, 5) — duplicate register; the pack's weariness register (Matt 11:28) is not the psalm's frame. `lament` anchors 62:8 (w=0.85) with no display tag: "Pour out your heart before him." is a one-clause invitation inside a confidence psalm, not the lament practice the concept teaches; the span sits inside the sitting `trust-in-god` justification (62:8). (ROUTED to corpus-blocked roster row 19: `vanity-of-life` — Psalms 62:9 "Surely men of low degree are just a breath" … "They are together lighter than a breath." — the hevel-scales register; joins chunk 2's Ps 39 refs.)

## Psalms 63
1. Existing tags (book doc): `hunger-for-god`, `gods-love`, `joy-in-the-lord`, `praise` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar.
3. Anchor-extension candidates: `hunger-for-god` | Psalms 63:1 | "My soul thirsts for you. My flesh longs for you, in a dry and weary land, where there is no water." | w=0.95 — first-order coverage gap: the pack's own lexicon phrase "my soul thirsts for god" names this text, yet its only Psalter anchor is 42:1-2; a "thirsting for God" query should surface Psalm 63 beside Psalm 42. `gods-love` | Psalms 63:3 | "Because your loving kindness is better than life, my lips shall praise you." | w=0.7 — the better-than-life verdict; the pack's only Psalter anchor is 147:11.
4. Lexicon candidates: None ("better than life", "my soul thirsts" are verbatim WEB — lexical search lands them).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 64
1. Existing tags (book doc): `gods-protection`, `divine-judgment`, `slander-and-false-accusation` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (batch-2 Decisions #13's `taming-the-tongue` decline re-checked and standing: the psalm depicts the wicked's tongues, not the discipline of one's own).
3. Anchor-extension candidates: `slander-and-false-accusation` | Psalms 64:3-4 | "who sharpen their tongue like a sword, and aim their arrows, deadly words, to shoot innocent men from ambushes." | w=0.75 — the pack's Psalter anchors (27:12; 56:5; 101:5; 35:11) lack the Psalter's fullest word-as-weapon portrait, the display tag's own ground.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 65
1. Existing tags (book doc): `gods-provision`, `prayer`, `forgiveness-of-sins`, `praise`, `creation` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. Considered and NOT added: `nations-and-peoples` (65:5's "hope of all the ends of the earth" is one verse — the pass's single-verse skip pattern).
3. Anchor-extension candidates: `gods-provision` | Psalms 65:9-13 | "You visit the earth, and water it. You greatly enrich it." … "You crown the year with your bounty. Your carts overflow with abundance." | w=0.8 — the pack has no Psalm 65 anchor; this is Scripture's fullest harvest-blessing text and the display tag already rests on it.
4. Lexicon candidates: `gods-provision` | harvest | queries: "bible verses about harvest", "thanksgiving harvest bible verse", "god blesses the harvest" — the word "harvest" appears nowhere in WEB Psalm 65 (crop, grain, bounty), so the intent family has no lexical route to the Psalter's harvest psalm; rides the proposed 65:9-13 anchor.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: two findings, both declined (recorded, not silent) — `worship` anchors 65:4 (w=0.65) with no display tag: one blessed-is-the-chosen verse (the pass's list-item skip pattern; the anchor serves search). `zion-city-of-god` anchors 65:1 (w=0.85) with no display tag: the 2026-08-25 pass's recorded skip ("two passing mentions", 65:1, 4) stands — the recorded anchors-serve-queries / display-follows-substance split. (ROUTED to corpus-blocked roster row 1: `sacrifice-and-atonement` — Psalms 65:3 "Sins overwhelmed me, but you atoned for our transgressions." is an in-corpus atonement-vocabulary witness (God himself atoning, non-ritual register) for that row's curator while the Leviticus spine stays blocked; supporting ref only — the recorded owner rule (bare "atonement" token owned by the-cross) is untouched.)

## Psalms 66
1. Existing tags (book doc): `praise`, `testing`, `prayer`, `sharing-your-faith`, `worship`, `oaths-and-vows` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar. The pass's `god-reigns` skip stands (66:7 — the "He rules by his might forever." clause is now mechanically verifiable against the staged text, but the single-verse judgment holds).
3. Anchor-extension candidates: `sharing-your-faith` | Psalms 66:16 | "Come and hear, all you who fear God. I will declare what he has done for my soul." | w=0.7 — the pack has no OT anchor at all; this is the OT's clearest personal-testimony summons and the display tag's own ground. `prayer` | Psalms 66:18-19 | "If I cherished sin in my heart, the Lord wouldn't have listened. But most certainly, God has listened." | w=0.6 — the heard-prayer condition; no pack carries it.
4. Lexicon candidates: `prayer` | does god hear my prayers | queries: "does god hear my prayers when i sin", "sin blocking my prayers", "why doesn't god listen to my prayers" — the anxious intent family has no lexical match ("cherished sin" is the WEB's phrase, but no query phrasing lands on it); rides the proposed 66:18-19 anchor. Routing note for the curator: `unanswered-prayer` is the adjacent home (its register is prayer unanswered despite faithfulness — Pss 88, 80 anchors); 66:18's own teaching is the sin-hindrance, so the row is offered on `prayer` — fixture the distinction, don't adjudicate it here.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None. Seam check: clean (`testing` 66:10 w=0.8 — tagged).

## Psalms 67
1. Existing tags (book doc): `blessing`, `nations-and-peoples`, `praise` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar. Standing decline re-checked and left standing: `sharing-your-faith` (batch-2 Decisions #17 — the psalm prays that God's way be known; it depicts no one proclaiming; the text still supports the decline).
3. Anchor-extension candidates: `blessing` | Psalms 67:1-2 | "May God be merciful to us, bless us, and cause his face to shine on us." … "That your way may be known on earth, and your salvation among all nations," | w=0.7 — the Aaronic-echo blessing turned mission-ward; the pack has no Psalm 67 anchor.
4. Lexicon candidates: None — checked and NOT proposed: "make his face shine upon you" ("face" and "shine" land lexically at Num 6:25 and Ps 67:1; per the alias-mining rule, no row for a query that already lands).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`nations-and-peoples` 67:2-5 w=0.8 — tagged).

## Psalms 68
1. Existing tags (book doc): `praise`, `loneliness`, `gods-provision`, `worship`, `justice-and-oppression`, `zion-city-of-god`, `messianic-prophecy` — 7.
2. Applied-tag deltas: No changes — at 7, every sitting tag independently re-checked and clears the bar. `ascension` (adopted id, engine-built) considered and NOT added: the concept's register is Jesus taken up (its anchors include Eph 4:8-10, which already carries 68:18's application); tagging the psalm itself would read the later-revelation category back — the sitting `messianic-prophecy` signposts Eph 4:8 exactly as the standing rule requires.
3. Anchor-extension candidates: `gods-provision` | Psalms 68:9-10, 19 | "You, God, sent a plentiful rain." … "Blessed be the Lord, who daily bears our burdens" | w=0.6 — the rain-on-a-weary-inheritance and daily-burden-bearing register; the pack has no Psalm 68 anchor and the display tag rests on these spans.
4. Lexicon candidates: None ("who daily bears our burdens" is verbatim WEB — lexical search lands it).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter (procession movements; no BSB subdivision recorded).
8. Decisions record: None (no yield — 7 < ceiling). Seam check: one finding, declined (recorded, not silent) — `care-for-widows` anchors 68:5 (w=0.9) with no display tag: "A father of the fatherless, and a defender of the widows, is God in his holy habitation." is a single list-clause inside the sitting `justice-and-oppression` justification's span (68:5-6) — the pass's own Ps 146 precedent (same pack, same reason); the anchor serves widow queries. (ROUTED to corpus-blocked roster row 32: `deliverance` — Psalms 68:19-20 "God is to us a God of deliverance. To GOD, the Lord, belongs escape from death." — the declarative deliverance-name witness; joins the Pss 18, 34, 40, 54, 56 routings from chunks 1–2.)

## Psalms 69
1. Existing tags (book doc): `pastoral-hope-in-despair`, `prayer`, `pastoral-god-sees-my-suffering`, `thanksgiving`, `lament`, `vengeance`, `messianic-prophecy` — 7.
2. Applied-tag deltas: No changes — at 7, every sitting tag independently re-checked and clears the bar (imprecatory petitions described, never endorsed — the sitting `vengeance` justification's judgment-handed-to-God frame kept). The pass's `slander-and-false-accusation` skip stands (69:4, 12 — two verses, yielded under the pass's 9-planned cap projection; no new evidence changes the arithmetic at 7). `justice-and-oppression` skip stands (69:33 alone).
3. Anchor-extension candidates: `lament` | Psalms 69:1-3 | "Save me, God, for the waters have come up to my neck! I sink in deep mire, where there is no foothold." | w=0.8 — the pack has no Psalm 69 anchor; one of the Psalter's deepest laments is absent from the lament pack. `messianic-prophecy` | Psalms 69:9, 21 | "For the zeal of your house consumes me." … "In my thirst, they gave me vinegar to drink." | w=0.85 — the pack anchors Pss 16, 22, 40, 110 but NOT Psalm 69, among the NT's most-quoted psalms (John 2:17; 15:25; Matt 27:34, 48; Acts 1:20 — attributed citations per the standing rule; the display tag already rests on these verses). Same coverage class as chunk 2's Ps 45:6-7 proposal.
4. Lexicon candidates: None ("zeal of your house", "gave me vinegar" land lexically).
5. New-concept candidates: None. Cross-ref, not a proposal: declines.md §6 (Daniel block) records book-of-life material as motif-candidate-only with the note "Ps 69:28 would join if ever judged concept-worthy" — Psalms 69:28 "Let them be blotted out of the book of life, and not be written with the righteous." is verified word-for-word here and recorded as that anticipated join; nothing minted.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter (lament movement 69:1-29 and praise-vow movement 69:30-36; no BSB subdivision recorded).
8. Decisions record: None (no yield — 7 < ceiling). Seam check: clean — notable in the other direction: NO engine pack anchors Psalm 69 at all (the §3 lament and messianic proposals close the two widest gaps). (ROUTED to corpus-blocked roster row 36: `zeal-for-god` — Psalms 69:9 "For the zeal of your house consumes me." is an in-corpus consumed-for-God's-house zeal witness, a register distinct from the row's Phinehas minting case; supporting ref only — the row's vigilante-violence gist caution stands untouched.)

## Psalms 70
1. Existing tags (book doc): `prayer`, `joy-in-the-lord` — 2.
2. Applied-tag deltas: No changes — both clear the bar (the psalm is nearly identical to 40:13-17 per the book doc — cross-reference, not re-derivation; chunk 2's Ps 40 entry carries the engine-side notes for the shared text).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean. (ROUTED to corpus-blocked roster row 14: `gloating-over-downfall` — Psalms 70:2-3 "Let them be turned because of their shame who say, "Aha! Aha!"" — the Aha-mockers formula, the victim's-side gloating register; joins chunk 2's Ps 35 refs (35:21's twin, doubled from Ps 40:15).)

## Psalms 71
1. Existing tags (book doc): `hope-in-god`, `refuge-in-trouble`, `praise`, `gods-faithfulness`, `sharing-your-faith`, `aging-and-old-age`, `slander-and-false-accusation` — 7.
2. Applied-tag deltas: No changes — at 7, every sitting tag independently re-checked and clears the bar.
3. Anchor-extension candidates: `hope-in-god` | Psalms 71:5 | "For you are my hope, Lord GOD, my confidence from my youth." | w=0.75 — the lifetime-hope declaration; the pack has no Psalm 71 anchor and the display tag rests on it. `sharing-your-faith` | Psalms 71:17-18 | "until I have declared your strength to the next generation, your might to everyone who is to come." | w=0.7 — the older believer's testimony assignment; pairs with the proposed 66:16 anchor (the pack has no OT anchor).
4. Lexicon candidates: None ("old and gray-haired" is verbatim WEB and "growing old"/"strength in old age" already sit in the `aging-and-old-age` lexicon with the 71:9, 17-18 anchors).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter.
8. Decisions record: None (no yield — 7 < ceiling). Seam check: clean (`aging-and-old-age` 71:9 w=0.9 and 71:17-18 w=0.85 — both tagged).

## Psalms 72
1. Existing tags (book doc): `praise`, `blessing`, `nations-and-peoples`, `justice-and-oppression`, `messianic-prophecy` — 5.
2. Applied-tag deltas: ADD `praying-for-leaders` — the psalm is Scripture's fullest sustained prayer for a ruler, the concept's exact intent ("pray for our leaders" is its lexicon): "God, give the king your justice; your righteousness to the royal son." (72:1), sustained through the petitions for his reign, with praying-for-the-king named in so many words: "Men will pray for him continually. They will bless him all day long." (72:15). Distinct from batch-1's Ps 33 decline (Decisions #8 — that chapter depicts no praying; this psalm IS the praying). Registers distinct beside the sitting `justice-and-oppression` (what is asked for the poor) and `blessing`. The id sat on no 2026-08-25 worklist row, so Ps 72 was never swept against it. Lands at 6 (soft cap). KEEP the other 5 (`messianic-prophecy` keeps its traditional-reading-only signpost, carried by the log row per the standing rule).
3. Anchor-extension candidates: `praying-for-leaders` | Psalms 72:1, 15 | "God, give the king your justice; your righteousness to the royal son." | w=0.8 — the pack's only Psalter anchor is 33:12 (w=0.6); this is the prayer itself. `nations-and-peoples` | Psalms 72:11, 17 | "Yes, all kings shall fall down before him. All nations shall serve him." | w=0.65 — the all-nations scope the display tag rests on; the pack's Psalter anchors are 67:2-5 and 86:9.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 post-delta (no ceiling hit).
8. Decisions record: None. Seam check: clean.

## Psalms 73
1. Existing tags (book doc): `envy-and-jealousy`, `presence-of-god`, `hunger-for-god`, `divine-judgment`, `guidance`, `prosperity-of-the-wicked` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar. Standing decline re-checked and left standing: `doubt` (batch-2 Decisions #6 — the psalm names its own crisis as envy and senselessness, argued inside faith; the text still supports the decline).
3. Anchor-extension candidates: None (pack coverage dense: `prosperity-of-the-wicked` 73:3, 73:12, 73:16-17, 73:26; `envy-and-jealousy` 73:2-3; `wrestling-with-god` 73:16-17; `comforting-others`-class comfort anchors on 73:26).
4. Lexicon candidates: None ("god is the strength of my heart", "my portion forever", "whom do I have in heaven" all land lexically).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None. Seam check: four findings, all declined (recorded, not silent) — `caring-for-aging-parents` anchors 73:26 (w=0.9): a comfort anchor serving that pack's caregiver queries; the psalm contains no parent-care material — register fail, anchor serves queries. `pastoral-serious-illness` anchors 73:26 (w=0.75) and `pastoral-strength-in-weakness` anchors 73:26 (w=0.8): the same single verse; the psalm's frame is theodicy, not the packs' personal-crisis registers, and the span is already the sitting `hunger-for-god` justification's quote (73:25-26). `wrestling-with-god` anchors 73:16-17 (w=0.85): the sanctuary turn already carries the sitting `divine-judgment` and `prosperity-of-the-wicked` justifications on the same span — duplicate-register limit.

## Psalms 74
1. Existing tags (book doc): `prayer`, `covenant`, `creation`, `lament`, `leviathan-and-behemoth` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. `the-house-of-god` considered and NOT added: the burned sanctuary (74:3-8) is the lament's object — destruction mourned, not the pack's loving-God's-house devotion register (the sitting `lament` carries it).
3. Anchor-extension candidates: `lament` | Psalms 74:1 | "God, why have you rejected us forever? Why does your anger smolder against the sheep of your pasture?" | w=0.65 — the pack's Psalter anchors are all individual laments (55, 42, 10, 62, 77); this is the communal register's opening cry (Pss 79 and 80 are companions — one anchor proposed for the class; the log §A.1 row already pools all three psalms' refs). `creation` | Psalms 74:16-17 | "The day is yours, the night is also yours. You have prepared the light and the sun. You have set all the boundaries of the earth. You have made summer and winter." | w=0.6 — the boundaries-and-seasons register recited against the ruin; the display tag rests on it.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean. (Corpus-blocked roster row 50, `leviathan-and-behemoth`, needs no routing: the row already carries Ps 74:13-14 as its own recorded ref, and the display tag sits per the 2026-08-25 pass.)

## Psalms 75
1. Existing tags (book doc): `divine-judgment`, `humble-exaltation`, `thanksgiving` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar. The pass's skips stand on re-read: `god-reigns` 75 and `leadership` 75 (both would restate `humble-exaltation`'s 75:6-7 anchor — the recorded duplicate-register limit).
3. Anchor-extension candidates: None (`humble-exaltation` already anchors 75:6-7 w=0.95).
4. Lexicon candidates: None — checked and NOT proposed: "promotion comes from god" (the KJV-remembered phrasing of "For neither from the east, nor from the west, nor yet from the south, comes exaltation.", 75:6) — the `humble-exaltation` lexicon already carries bare "promotion" with the 75:6-7 anchor, so the query family already lands (alias-mining rule).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`humble-exaltation` 75:6-7 w=0.95 — tagged).

## Psalms 76
1. Existing tags (book doc): `divine-judgment`, `gods-protection`, `zion-city-of-god`, `oaths-and-vows` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar.
3. Anchor-extension candidates: `oaths-and-vows` | Psalms 76:11 | "Make vows to the LORD your God, and fulfill them!" | w=0.75 — the Psalter's direct vow imperative, the display tag's own ground; the pack's Psalter anchors are 56:12, 116:14, 15:4.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 77
1. Existing tags (book doc): `prayer`, `pastoral-hope-in-despair`, `gods-faithfulness`, `lament` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. `remembrance-and-memorials` (adopted id) considered and NOT added: 77:11-12's deliberate remembering is the despair-answer motif the sitting `gods-faithfulness`/`pastoral-hope-in-despair` pair carries (batch-2 motif item 3 records it "covered"); the adopted id's register is memorial practice (stones, feasts), not the inner discipline of recall.
3. Anchor-extension candidates: `gods-faithfulness` | Psalms 77:11-12 | "I will remember the LORD's deeds; for I will remember your wonders of old." | w=0.7 — remembering-as-the-turn; the pack has no Psalter anchor at all (the Ps 89 proposal below is its confession-register companion).
4. Lexicon candidates: None ("remember the LORD's deeds", "wonders of old" land lexically; the "when you can't feel God" intent is carried by `pastoral-hope-in-despair`'s existing lexicon).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`lament` 77:1-9 w=0.65 — tagged).

## Psalms 78
1. Existing tags (book doc): `parenting`, `covenant`, `sin`, `gods-provision`, `gods-faithfulness`, `divine-judgment`, `leadership`, `messianic-prophecy` — 8 (hard ceiling).
2. Applied-tag deltas: No changes — at the hard ceiling; the 2026-08-25 pass's cap plan (item 4: `angels`, `idolatry`, `mortality`, `zion-city-of-god` each failed the presence bar at one-to-two verses of 72) re-checked against the text and standing; every sitting tag independently clears the bar. `hardness-of-heart` considered and NOT added: the stubborn-generation material (78:8, 17-20, 32, 40-42) is the sitting `sin` tag's own span — duplicate register (and cap-full besides); the concept's display homes are Pss 81, 95 per the pass.
3. Anchor-extension candidates: `parenting` | Psalms 78:4-7 | "telling to the generation to come the praises of the LORD" … "that they might set their hope in God, and not forget God's deeds, but keep his commandments," | w=0.8 — the pack's tell-the-children anchors are Deut 6:6-7 and Prov 22:6; this is the Psalter's charter text and the display tag's own ground. `gods-provision` | Psalms 78:23-25 | "He rained down manna on them to eat, and gave them food from the sky. Man ate the bread of angels." | w=0.65 — the manna narrative retold; the pack has no wilderness-provision anchor.
4. Lexicon candidates: None ("bread of angels", "can God prepare a table in the wilderness" are verbatim WEB — lexical search lands them).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD-CEILING-8 — mark for the per-verse refinement pass (72 verses; natural movements: the charge 78:1-8, wilderness 78:9-39, plagues-and-exodus 78:40-55, Canaan apostasy 78:56-64, David 78:65-72; no BSB subdivision recorded).
8. Decisions record: None (the ceiling was reached by the pass's recorded plan, not a new yield). Seam check: clean (`leadership` 78:70-72 w=0.75 — tagged). (ROUTED to corpus-blocked roster row 19: `vanity-of-life` — Psalms 78:33 "Therefore he consumed their days in vanity, and their years in terror." — the judgment-register vanity use; joins the row's Psalter refs. ROUTED to corpus-blocked roster row 23: `redeemer` — Psalms 78:35 "They remembered that God was their rock, the Most High God, their redeemer." — an in-corpus "their redeemer" title witness while Job 19:25-27 stays blocked; joins chunk 2's Ps 49 refs.)

## Psalms 79
1. Existing tags (book doc): `prayer`, `forgiveness-of-sins`, `thanksgiving`, `lament`, `vengeance` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar (the pay-back petitions described per the batch's imprecatory policy; the sitting `vengeance` justification keeps that frame).
3. Anchor-extension candidates: None (the communal-lament class anchor is proposed at Ps 74 above; the log §A.1 row already pools 79:1-5).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean. (ROUTED to corpus-blocked roster row 8: `gods-holy-name` — Psalms 79:9 "Deliver us, and forgive our sins, for your name's sake." — the strongest in-corpus for-your-name's-sake petition this sweep has found (a full act-for-the-name's-honor plea, not a supporting phrase); joins chunk 2's Ps 31:3 and the row's recorded Ps 23:3 — the row's minting register remains Ezekiel's for-my-name's-sake acting.)

## Psalms 80
1. Existing tags (book doc): `restoration`, `prayer`, `lament`, `unanswered-prayer` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. `shepherds-and-the-flock` considered and NOT added: 80:1's "Shepherd of Israel" is one invocation verse; the psalm's body is the vine parable — routed engine-side instead (below).
3. Anchor-extension candidates: `shepherds-and-the-flock` | Psalms 80:1 | "Hear us, Shepherd of Israel, you who lead Joseph like a flock, you who sit above the cherubim, shine out." | w=0.6 — the corporate Shepherd invocation (batch-2 motif item 1's corporate-shepherd note); joins chunk 1's proposed 28:9 anchor beside the pack's 23:1 and 100:3. `revival-and-reformation` | Psalms 80:18-19 | "Revive us, and we will call on your name. Turn us again, LORD God of Armies. Cause your face to shine, and we will be saved." | w=0.6 — the corporate revive-us refrain beside the pack's lone Psalter anchor (85:6).
4. Lexicon candidates: None ("revive us" is verbatim WEB and "revival" already sits in the `revival-and-reformation` lexicon — the query family lands).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`unanswered-prayer` 80:4 w=0.7 — tagged).

## Psalms 81
1. Existing tags (book doc): `worship`, `obedience-to-the-word`, `gods-provision`, `idolatry`, `hardness-of-heart` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. `appointed-feasts` (adopted id, engine-built) considered and NOT added: the feast-statute frame (81:3-5) is the sitting `worship` justification's own span ("worship kept as an appointed statute") — duplicate register; routed engine-side instead (below). `testing` considered and NOT added (81:7's "I tested you at the waters of Meribah." is one in-recital clause).
3. Anchor-extension candidates: `appointed-feasts` | Psalms 81:3-4 | "Blow the trumpet at the New Moon, at the full moon, on our feast day. For it is a statute for Israel, an ordinance of the God of Jacob." | w=0.6 — the pack has no Psalter anchor; the feast-statute liturgy text. `gods-provision` | Psalms 81:10, 16 | "Open your mouth wide, and I will fill it." | w=0.7 — the open-mouth promise with the finest-of-wheat close; the display tag rests on it and no pack carries it. `hardness-of-heart` | Psalms 81:11-12 | "But my people didn't listen to my voice. Israel desired none of me. So I let them go after the stubbornness of their hearts, that they might walk in their own counsels." | w=0.75 — the given-over-to-stubbornness text, the display tag's own ground; the pack's Psalter anchor is 95:8 only.
4. Lexicon candidates: None ("open your mouth wide and I will fill it", "honey out of the rock" are verbatim WEB).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 82
1. Existing tags (book doc): `divine-judgment`, `justice-and-oppression`, `messianic-prophecy` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (batch-2 Decisions #15's described-not-adjudicated handling of the "gods" kept; `messianic-prophecy` keeps its John 10:34 attribution).
3. Anchor-extension candidates: None (`pastoral-refuge-and-justice` already anchors 82:3-4 at w=1.0 — see the seam record; `justice-and-oppression`'s own coverage of the bench charge is served by the display tag plus that anchor).
4. Lexicon candidates: None ("defend the weak", "you are gods" land lexically).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: one finding, declined (recorded, not silent) — `pastoral-refuge-and-justice` anchors Psalms 82:3-4 at w=1.0 (its LEAD anchor: "Defend the weak, the poor, and the fatherless." … "Rescue the weak and needy. Deliver them out of the hand of the wicked.") with no display tag. NOT a coverage seam of the Ps 23/34/55 class: batch-2 Decisions #3 deliberately withheld the pastoral tag from 82:3-4's national-scale bench material under the project-wide pastoral-register ruling — search anchors serve the pack's abuse-crisis queries; the display register is societal and is carried by the sitting `justice-and-oppression`. The standing call is re-checked against the text and kept.

## Psalms 83
1. Existing tags (book doc): `prayer`, `divine-judgment`, `vengeance` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (imprecations described, never endorsed; batch-2 Decisions #16's kept-visible repentance clause "Fill their faces with confusion, that they may seek your name, LORD." (83:16) re-checked and standing in the tag line's frame). `the-name-of-god` considered and NOT added: 83:16, 18 are two goal-clauses inside the imprecations; the sitting `divine-judgment` justification already carries 83:18's "that they may know that you alone, whose name is the LORD, are the Most High over all the earth."
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 84
1. Existing tags (book doc): `hunger-for-god`, `worship`, `blessing`, `trust-in-god`, `gods-protection`, `zion-city-of-god` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar. `the-house-of-god` considered and NOT added: the courts/house longing is already carried three ways on the same spans (`hunger-for-god` 84:2, `worship` 84:4, 10, `zion-city-of-god` 84:1-2, 7) — a fourth tag on identical spans is the duplicate-register limit; routed engine-side instead (below), where the pack's coverage gap is real.
3. Anchor-extension candidates: `the-house-of-god` | Psalms 84:1-2, 10 | "How lovely are your dwellings, LORD of Armies!" … "I would rather be a doorkeeper in the house of my God, than to dwell in the tents of wickedness." | w=0.85 — the pack's Psalter anchor is 27:4 only; this is the house-of-God psalm its lexicon ("house of the lord") names. `zion-city-of-god` | Psalms 84:1-2, 7 | "My soul longs, and even faints for the courts of the LORD." … "Every one of them appears before God in Zion." | w=0.8 — the display tag rests here but the pack (46; 9; 65; 147; 48; 87; 122) lacks the pilgrimage psalm. `hunger-for-god` | Psalms 84:2 | "My heart and my flesh cry out for the living God." | w=0.8 — the pack's only Psalter anchor is 42:1-2; joins the proposed 63:1.
4. Lexicon candidates: `zion-city-of-god` | valley of baca | queries: "valley of baca meaning", "valley of baca in the bible", "psalm 84 valley of weeping" — the KJV/NIV-remembered proper noun "Baca" has NO lexical match in the WEB ("Passing through the valley of Weeping, they make it a place of springs.", 84:6); a genuine translation-gap row riding the proposed 84 anchor. Routing note: if the curator reads the query family as strength-through-sorrow intent rather than place-name lookup, `pastoral-hope-in-despair` is the alternative home — fixture the routing.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None. Seam check: clean. (ROUTED to corpus-blocked roster row 46: `the-lords-anointed` — Psalms 84:9 "Behold, God our shield, look at the face of your anointed." — supporting in-corpus ref; joins chunk 1's Pss 2, 18, 20, 28 routings.)

## Psalms 85
1. Existing tags (book doc): `restoration`, `forgiveness-of-sins`, `peace-of-god`, `gods-love` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. `mercy` considered and NOT added: 85:10's "Mercy and truth meet together." is one verse whose span the sitting `gods-love` justification already carries — duplicate register (chunk 2's Ps 51 precedent for the same pack).
3. Anchor-extension candidates: `peace-of-god` | Psalms 85:8, 10 | "he will speak peace to his people" … "Mercy and truth meet together. Righteousness and peace have kissed each other." | w=0.6 — the spoken-peace register; the pack's Psalter anchors are 37:7 and 37:1, and the display tag rests on these verses.
4. Lexicon candidates: None ("righteousness and peace have kissed", "mercy and truth meet together" are verbatim WEB — lexical search lands them).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: one finding, declined (recorded, not silent) — `revival-and-reformation` anchors 85:6 (w=0.65) with no display tag: "Won't you revive us again, that your people may rejoice in you?" is a single verse whose span is the sitting `restoration` justification's own quote — duplicate register; the anchor serves revival queries (the recorded anchors-serve-queries / display-follows-substance split).

## Psalms 86
1. Existing tags (book doc): `prayer`, `gods-love`, `guidance`, `praise`, `trust-in-god` — 5.
2. Applied-tag deltas: ADD `slow-to-anger` — seam-check catch of exactly the chunk-1/2 Ps 23/34/55 class: Psalms 86:15 is the engine pack's own w=1.0 LEAD anchor, and the psalm states the Sinai self-description the concept owns, twice: "But you, Lord, are a merciful and gracious God, slow to anger, and abundant in loving kindness and truth." (86:15), prepared by "For you, Lord, are good, and ready to forgive, abundant in loving kindness to all those who call on you." (86:5). The 2026-08-25 worklist row (Nahum) carried only Pss 103/145 refs, so Ps 86 — the pack's lead anchor — was never swept against the id. Both-tags beside the sitting `gods-love`, registers genuinely distinct (God's patience under provocation — the Exod 34:6 formula the declines record assigns to this row — vs his loving kindness); the pass's own Ps 103 placement carries both side by side. Consistent with declines.md §3.2 item 1: this is the divine-patience register, not the routed human virtue. Lands at 6 (soft cap). KEEP the other 5.
3. Anchor-extension candidates: `guidance` | Psalms 86:11 | "Teach me your way, LORD. I will walk in your truth. Make my heart undivided to fear your name." | w=0.75 — the teach-me-your-way prayer the display tag rests on; the pack has no Psalm 86 anchor.
4. Lexicon candidates: None ("undivided heart" — "undivided" is verbatim WEB at 86:11, so the query family lands lexically).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 post-delta (no ceiling hit).
8. Decisions record: None. Seam check: four findings — `slow-to-anger` 86:15 w=1.0 lead anchor untagged (ADD above); three further findings declined (recorded, not silent): `forgiveness-of-sins` anchors 86:5 (w=0.75) — one verse, the sitting `gods-love` justification's own span; `worship` anchors 86:9 (w=0.7) and `nations-and-peoples` anchors 86:9 (w=0.75) — the same single future-worship verse ("All nations you have made will come and worship before you, Lord.") — the pass's single-verse skip pattern, twice over on one verse. (ROUTED to corpus-blocked roster row 18: `wholehearted-devotion` — Psalms 86:11-12 "Make my heart undivided to fear your name. I will praise you, Lord my God, with my whole heart." — an in-corpus whole-heart witness for that row's design-resolved route (loving-god/seeking-god lexicon extension at the re-pin); supporting refs only.)

## Psalms 87
1. Existing tags (book doc): `nations-and-peoples`, `zion-city-of-god` — 2.
2. Applied-tag deltas: No changes — both clear the bar; nothing else in the vocabulary is genuinely present. `gentile-inclusion` (adopted §11.3 id) considered and NOT added: the id's adopted register is the NT church-inclusion question (Acts 10–15 — its review row, §11.3 ruling context, and corpus-blocked row 40 all frame it so); tagging the psalm would read the later-revelation category back. The psalm's own claim — enemy nations written into Zion's birth register — is carried honestly by the sitting pair.
3. Anchor-extension candidates: `nations-and-peoples` | Psalms 87:4-6 | "I will record Rahab and Babylon among those who acknowledge me." … "The LORD will count, when he writes up the peoples, "This one was born there."" | w=0.7 — the birth-register text the display tag rests on; the pack's Psalter anchors are 67:2-5 and 86:9.
4. Lexicon candidates: None ("glorious things are spoken about you, city of god" — "city of god" already in the `zion-city-of-god` lexicon with the pack's 87:1-3 anchor).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`zion-city-of-god` 87:1-3 w=0.75 — tagged). (ROUTED to corpus-blocked roster row 40: `gentile-inclusion` — Psalms 87:4-6 (outsider nations recorded as native-born in Zion) is an in-corpus OT supporting witness for that row's curator; supporting refs only — the row's core texts remain Acts 10-11; 15, and the register decision recorded on the row is untouched.)

## Psalms 88
1. Existing tags (book doc): `prayer`, `pastoral-hope-in-despair`, `loneliness`, `pastoral-serious-illness`, `lament`, `unanswered-prayer` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar (batch-2 Decisions #10's care-worded `pastoral-hope-in-despair` call — the psalm's only light is that every dark line is still addressed to "the God of my salvation" — re-checked and kept).
3. Anchor-extension candidates: `lament` | Psalms 88:1, 18 | "LORD, the God of my salvation, I have cried day and night before you." … "You have put lover and friend far from me, and my friends into darkness." | w=0.8 — the Psalter's darkest lament is absent from the lament pack; a "psalms of lament" query should surface Psalm 88. `loneliness` | Psalms 88:8, 18 | "You have taken my friends from me. You have made me an abomination to them." | w=0.7 — the abandoned-in-affliction register; the pack's Psalter anchors are 27:10 and 68:6 (companion to chunk 2's proposed 38:11).
4. Lexicon candidates: `lament` | darkness is my closest friend | queries: "darkness is my closest friend bible verse", "psalm where darkness is my only friend", "the darkest psalm in the bible" — the NIV-remembered rendering of 88:18 has NO lexical match in the WEB ("and my friends into darkness"); a genuine translation-gap row riding the proposed 88 anchor (the chunk-2 "tears in a bottle" pattern exactly).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None. Seam check: one finding, declined (recorded, not silent) — `wrestling-with-god` anchors 88:13-14 (w=0.6) with no display tag: the identical span already carries the sitting `prayer` and `unanswered-prayer` justifications ("In the morning, my prayer comes before you. LORD, why do you reject my soul?") — duplicate-register limit; the pack's lexicon ("when god is silent") already serves the query surface through its anchor.

## Psalms 89
1. Existing tags (book doc): `covenant`, `gods-faithfulness`, `praise`, `blessing`, `lament`, `messianic-prophecy` — 6 (soft cap).
2. Applied-tag deltas: ADD `davidic-covenant` (adopted §11.1 id) — the psalm is Scripture's fullest statement of the covenant with David, sung and then protested: "I have made a covenant with my chosen one, I have sworn to David, my servant, 'I will establish your offspring forever, and build up your throne to all generations.'" (89:3-4), the oath quoted at length ("My covenant will stand firm with him.", 89:28; "I will not break my covenant, nor alter what my lips have uttered.", 89:34), and the crisis stated in covenant terms: "You have renounced the covenant of your servant." (89:39). Both-tags beside the sitting `covenant`: the broad concept vs the named Davidic promise a "davidic covenant" searcher wants — §11.6's broad-duplicating-specific class governs only a future ceiling yield, not this ADD (7 < ceiling 8). The id sat on no 2026-08-25 worklist row (adopted from the review's Theme L with 2 Sam 7 as home text), so Ps 89 — the Psalter's Davidic-covenant psalm — was never swept against it. No messianic read-back rides the tag: the justification stays inside the psalm's own text, and the NT announcement (Acts 13:22-23) remains the sitting `messianic-prophecy` tag's signposted application. Lands at 7; every sitting tag independently re-checked and clears the bar. KEEP the other 5.
3. Anchor-extension candidates: `covenant` | Psalms 89:3-4, 34 | "I have made a covenant with my chosen one, I have sworn to David, my servant," | w=0.8 — the pack's Davidic anchor is 2 Sam 7:12-16 only; the Psalter's covenant psalm is absent (`davidic-covenant` itself is not engine-built — its refs ride roster row 44 below). `gods-faithfulness` | Psalms 89:1-2, 33-34 | "With my mouth, I will make known your faithfulness to all generations." | w=0.85 — the pack has NO Psalter anchor at all, and this is Scripture's densest faithfulness text (the word recurs through the psalm, held into the dark at 89:49).
4. Lexicon candidates: None ("I will sing of the loving kindness of the LORD forever" lands lexically; "great is your faithfulness" is Lamentations' and already in the pack's lexicon).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: lands at 7 (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter (hymn 89:1-18, oracle 89:19-37, lament 89:38-51, doxology 89:52; no BSB subdivision recorded).
8. Decisions record: None (no yield — 7 < ceiling). Seam check: clean. (ROUTED to corpus-blocked roster row 44: `davidic-covenant` — Psalms 89:3-4, 19-37, 49 is the Psalter home text for that row while 2 Sam 7 stays blocked ("I have sworn to David, my servant, 'I will establish your offspring forever, and build up your throne to all generations.'"); joins chunk 1's Ps 18:50 routing. ROUTED to corpus-blocked roster row 46: `the-lords-anointed` — Psalms 89:38 "You have been angry with your anointed." and 89:51 "they have mocked the footsteps of your anointed one." — supporting refs; joins the Pss 2, 18, 20, 28, 84 routings. ROUTED to corpus-blocked roster row 19: `vanity-of-life` — Psalms 89:47 "Remember how short my time is, for what vanity you have created all the children of men!" — an explicit "vanity" verdict verse; joins the row's Psalter refs (39; 62:9; 78:33).)

## Psalms 90
1. Existing tags (book doc): `stewardship-of-days`, `sin`, `prayer`, `mortality`, `creation`, `gods-unchanging-nature` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar (the apologetics pass's deliberate dual 90:2 anchor — `creation` and `gods-unchanging-nature` as two registers of one verse under the both-tags ruling — re-checked and kept). `aging-and-old-age` considered and NOT added: 90:10's seventy-or-eighty accounting is the sitting `mortality` justification's own span — the life-span arithmetic, not the aging believer's petition register (whose home is Ps 71).
3. Anchor-extension candidates: `stewardship-of-days` | Psalms 90:12 | "So teach us to count our days, that we may gain a heart of wisdom." | w=0.9 — the display tag's own ground, yet the pack has NO OT anchor (Eph 5:15-17; Rom 12:11; Heb 6:12 only); the count-our-days prayer is the concept's canonical OT text. Routing note: the KJV-remembered phrasing "number our days" already sits in `mortality`'s lexicon (with its 90:3-12 anchor), so no lexicon row is proposed — the anchor is the ordering fix on the stewardship side; the curator should fixture the mortality/stewardship routing rather than adjudicate it here.
4. Lexicon candidates: None beyond the routing note above ("teach us to count our days", "from everlasting to everlasting" are verbatim WEB).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None. Seam check: clean (`creation` 90:2 w=0.8, `gods-unchanging-nature` 90:2 w=0.95, `mortality` 90:3-12 w=0.9 — all tagged).

---

### Block survival audit (CONVENTIONS §9) — Psalms 61–90 block, 2026-08-26

Written as one atomic end-of-file append; post-write the file was re-read, pre-existing bytes (header + the Psalms 1–30 and 31–60 blocks) verified unchanged, and this block verified present exactly once. Block tallies: **3 ADDs** (Ps 72 `praying-for-leaders`; Ps 86 `slow-to-anger`; Ps 89 `davidic-covenant`) · **0 DROPs** · 141 KEEPs (all baseline tags re-checked against the WEB text) · **39 anchor-extension candidates** (Pss 61 ×2, 62, 63 ×2, 64, 65, 66 ×2, 67, 68, 69 ×2, 71 ×2, 72 ×2, 74 ×2, 76, 77, 78 ×2, 80 ×2, 81 ×3, 84 ×3, 85, 86, 87, 88 ×2, 89 ×2, 90) · **4 lexicon candidates** (Ps 65 "harvest"; Ps 66 "does god hear my prayers"; Ps 84 "valley of baca"; Ps 88 "darkness is my closest friend" — the last two are remembered-translation phrasings with no WEB lexical match, the chunk-2 pattern; three further candidates checked and NOT proposed under the already-lands rule: Ps 67 face-shine, Ps 75 "promotion comes from god", Ps 90 "number our days" already in `mortality`'s lexicon) · **0 new-concept candidates** (1 cross-ref: Ps 69:28 recorded as the anticipated join to the declines-roster book-of-life motif note — nothing minted) · **0 decline overturns** · **13 corpus-blocked routings** across roster rows 1 (Ps 65), 8 (Ps 79), 14 (Ps 70), 18 (Ps 86), 19 (Pss 62, 78, 89), 23 (Ps 78), 32 (Ps 68), 36 (Ps 69), 40 (Ps 87), 44 (Ps 89), 46 (Pss 84, 89) — rows 8, 14, 19, 23, 32, 44, 46 join refs from chunks 1–2; rows 1, 18, 36, 40 are first fed by this chunk · **Seam-check catches:** 1 untagged lead-anchor seam became an ADD (Ps 86 `slow-to-anger` w=1.0 lead — the Ps 34/55 class); 13 further anchor-without-tag findings recorded and declined per-psalm (62 ×2, 65 ×2, 68, 73 ×4, 82, 85, 86 ×3 [one became the ADD], 88) — none silent, including the Ps 82 w=1.0 `pastoral-refuge-and-justice` lead anchor, which is the standing batch-2 Decisions #3 register ruling applied deliberately, not a coverage seam · **Notable inverse seam:** Psalm 69 has NO engine anchor at all (closed by the §3 lament + messianic proposals) · ceiling flags: Ps 78 at HARD-CEILING-8 (marked for per-verse refinement; ceiling reached by the 2026-08-25 pass's recorded cap plan, no new yield); Pss 68, 69, 71 (baseline) and 89 (post-delta) at 7 (flagged as dense); Pss 66, 73, 84, 88, 90 at soft cap 6, joined post-delta by 72 and 86; no psalm in 61–90 is subdivided in the book doc · cross-refs to earlier chunks: Ps 70 → chunk 2's Ps 40 (doublet; row-14 routing joins Ps 35), Ps 80 `shepherds-and-the-flock` anchor joins chunk 1's Ps 28:9 proposal, Ps 88 `loneliness` anchor companions chunk 2's Ps 38:11, Ps 89 routing joins chunk 1's Ps 18:50 (row 44), Ps 84/89 routing joins chunk 1's Pss 2/18/20/28 (row 46), Ps 62/78/89 routing joins chunk 2's Ps 39 (row 19), Ps 78 routing joins chunk 2's Ps 49 (row 23), Ps 68 routing joins chunks 1–2's Pss 18/34/40/54/56 (row 32), Ps 79 routing joins chunk 2's Ps 31:3 (row 8), Ps 69 messianic anchor proposal is the chunk-2 Ps 45 class.

---

## This block: Psalms 91–120 (sweep worker chunk 4 of 5, 2026-08-26)

Same inputs, rules, and entry format as the Psalms 1–30, 31–60, and 61–90 blocks above (repo e762d1c; canonical `tag-apply/adopted-concepts.md` 161-id list, re-read and confirmed identical to the kit's rules.md §D.1 regeneration; WEB quotes word-for-word from the staged verse-per-line 87fd68c extraction, straight-apostrophe typography, words unaltered). Within 91–120, Psalms 91, 92, 95, 100, 101, 103, 116 are additionally pinned-fixture witnessed at e762d1c (batch-2/batch-3 header lists); the rest are verified against the 87fd68c full fixture only. **Systematic seam check applied per psalm**: every engine anchor falling in Pss 91–120 was checked against the psalm's baseline tags; the result is recorded per psalm ("seam check: clean" or the finding), and the inverse seam (a psalm carrying no engine anchor at all) is recorded where notable. Chunks 1–3's entries are prior art: no candidate they carry is re-proposed; added refs cross-reference the earlier entry instead. Psalm 119 follows the book doc's 22-stanza subdivision (candidates recorded per stanza where they differ).

## Psalms 91
1. Existing tags (book doc): `refuge-in-trouble`, `gods-protection`, `fear-not`, `trust-in-god`, `presence-of-god`, `angels` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar (batch-2 Decisions #14's doctrinal-guardrail frame kept: the psalm's promises presented as the confidence of the one who dwells in the shelter, never a formula; the sitting `angels` tag keeps the Matt 4:6-7 caution). The pass's `messianic-prophecy` skip stands — the only NT use of 91:11-12 is the devil's temptation quotation, presented as a caution, not a messianic identification; no new evidence.
3. Anchor-extension candidates: `fear-not` | Psalms 91:5-6 | "You shall not be afraid of the terror by night, nor of the arrow that flies by day," | w=0.7 — the display tag rests on 91:5-7 but the pack's Psalter anchors (27:1, 3; 56:11) lack the psalm; joins chunk 1's 3:5-6 and chunk 3's 46:2-3 proposals.
4. Lexicon candidates: None — checked and NOT proposed: "the secret place of the Most High" and "dwells in the shelter of the most high" already sit in the `refuge-in-trouble` lexicon; "angels charge over you" already in the `gods-protection` lexicon; "a thousand may fall at your side" lands lexically (alias-mining already-lands rule, three times over).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None. Seam check: clean — the psalm is the `gods-protection` pack's entire anchor set (91:9-12 lead, 91:5-7, 91:14-16) and carries `refuge-in-trouble`'s 91:1-2/91:4; all tagged. (ROUTED to corpus-blocked roster row 32: `deliverance` — Psalms 91:3 "For he will deliver you from the snare of the fowler, and from the deadly pestilence." and God's own pledge "therefore I will deliver him" … "I will be with him in trouble. I will deliver him, and honor him." (91:14-15) — the promised-rescue register; joins the Pss 18, 34, 40, 54, 56, 68 routings from chunks 1–3.)

## Psalms 92
1. Existing tags (book doc): `thanksgiving`, `praise`, `joy-in-the-lord`, `divine-judgment`, `aging-and-old-age` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. Standing declines re-checked and left standing: `sabbath-rest` (batch-2 Decisions #11 — heading-only presence; the psalm's content is thanksgiving and praise); the pass's `prosperity-of-the-wicked` skip (92:7 one verse, same span as the sitting `divine-judgment`; the developed home is Ps 73).
3. Anchor-extension candidates: None (engine coverage present: `aging-and-old-age` 92:12-14 is the pack's w=1.0 LEAD anchor and is tagged; `thanksgiving` anchors 92:1).
4. Lexicon candidates: None ("fruit in old age" intent is served by "strength in old age", already in the `aging-and-old-age` lexicon riding the 92:12-14 anchor).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 93
1. Existing tags (book doc): `praise`, `god-reigns`, `trustworthiness-of-scripture` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (the enthronement acclamation is carried by `god-reigns` per the consolidated plan's §C register call, re-checked and kept).
3. Anchor-extension candidates: `god-reigns` | Psalms 93:3-4 | "Above the voices of many waters, the mighty breakers of the sea, the LORD on high is mighty." | w=0.6 — extends the pack's own 93:1-2 anchor into the flood contest, the mightier-than-the-storm register a storm-anxiety searcher wants. `trustworthiness-of-scripture` | Psalms 93:5 | "Your statutes stand firm." | w=0.55 — the throne room's word export; the display tag rests on it and the consolidated plan's §B row names 93:5 among its refs.
4. Lexicon candidates: `god-reigns` | mightier than the waves | queries: "god is mightier than the waves", "mightier than the waves of the sea verse", "god is greater than the storm" — the NIV-remembered "mightier than the breakers/waves of the sea" phrasing has NO WEB lexical match ("the mighty breakers of the sea, the LORD on high is mighty", 93:4); rides the proposed 93:3-4 anchor.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`god-reigns` 93:1-2 — tagged).

## Psalms 94
1. Existing tags (book doc): `divine-judgment`, `the-lords-discipline`, `peace-of-god`, `refuge-in-trouble`, `gods-faithfulness`, `vengeance`, `justice-and-oppression` — 7.
2. Applied-tag deltas: No changes — at 7, every sitting tag independently re-checked and clears the bar (the sitting `vengeance` justification keeps the vengeance-located-in-God-and-left-there frame). The pass's `prosperity-of-the-wicked` skip stands (94:3 single-verse question; home Ps 73).
3. Anchor-extension candidates: `the-lords-discipline` | Psalms 94:12-13 | "Blessed is the man whom you discipline, LORD, and teach out of your law, that you may give him rest from the days of adversity" | w=0.75 — the blessed-under-discipline teaching; the pack's only anchors are Heb 12:7-11 and Rev 3:19 (chunks 1–2's Ps 6:1/38:1-2 proposals are the plea-under-discipline register; this is the blessing register). `peace-of-god` | Psalms 94:19 | "In the multitude of my thoughts within me, your comforts delight my soul." | w=0.7 — the anxious-thoughts comfort verse the display tag rests on. `justice-and-oppression` | Psalms 94:5-6 | "They break your people in pieces, LORD, and afflict your heritage. They kill the widow and the alien, and murder the fatherless." | w=0.7 — the widow-alien-fatherless indictment beside the pack's 103:6/146:7 anchors. `vengeance` | Psalms 94:1-2 | "LORD, you God to whom vengeance belongs" … "Rise up, you judge of the earth. Pay back the proud what they deserve." | w=0.6 — the pack's anchors are all vengeance-is-mine teaching texts (Rom 12:19-21; Deut 32:35); this is the OT prayer that locates vengeance in God — exactly the routing the pack exists to serve.
4. Lexicon candidates: `peace-of-god` | when anxiety was great within me | queries: "when anxiety was great within me", "when my anxious thoughts multiply", "bible verse for racing thoughts" — the NIV/NASB-remembered renderings of 94:19 have NO WEB lexical match ("In the multitude of my thoughts within me"); rides the proposed 94:19 anchor.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter.
8. Decisions record: None (no yield — 7 < ceiling). Seam check: clean — notable inverse seam: NO engine pack anchors Psalm 94 at all (the §3 proposals close the four widest gaps). (ROUTED to corpus-blocked roster row 6: `god-looks-at-the-heart` — Psalms 94:9-11 "He who implanted the ear, won't he hear? He who formed the eye, won't he see?" … "The LORD knows the thoughts of man, that they are futile." — the Maker-as-knower-of-thoughts witness; joins the Pss 7, 11, 17, 26 (chunk 1), 33, 44 (chunk 2) routings.)

## Psalms 95
1. Existing tags (book doc): `worship`, `thanksgiving`, `obedience-to-the-word`, `creation`, `god-reigns`, `hardness-of-heart`, `messianic-prophecy` — 7.
2. Applied-tag deltas: No changes — at 7, every sitting tag independently re-checked and clears the bar (`messianic-prophecy` keeps its Heb 3-4 signposted-application form; the psalm stays anonymous per the superscription rule — Heb 4:7's "through David" is application only). Standing decline re-checked and left standing: `sabbath-rest` on 95:11 (batch-2 Decisions #12 — the psalm's own "rest" is the land-rest forfeited at Meribah; Hebrews' frame not read back).
3. Anchor-extension candidates: `shepherds-and-the-flock` | Psalms 95:7 | "We are the people of his pasture, and the sheep in his care." | w=0.6 — the corporate-shepherd confession; joins chunk 1's 28:9 and chunk 3's 80:1 proposals beside the pack's 23:1/100:3 anchors.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter (summons 95:1-7a, oracle 95:7b-11; no BSB subdivision recorded).
8. Decisions record: None (no yield — 7 < ceiling). Seam check: one finding — `praise` anchors Psalms 95:1 (w=0.75) with no display tag; ADD declined (95:1-2 is the identical span the sitting `worship` and `thanksgiving` justifications quote — duplicate register at 7; the anchor serves search — the recorded anchors-serve-queries / display-follows-substance split). `god-reigns` 95:3, `worship` 95:6 (lead), and `hardness-of-heart` 95:8 (lead) all tagged.

## Psalms 96
1. Existing tags (book doc): `praise`, `nations-and-peoples`, `worship`, `sharing-your-faith`, `divine-judgment`, `god-reigns`, `idolatry`, `no-other-god` — 8 (hard ceiling).
2. Applied-tag deltas: No changes — at the hard ceiling; every sitting tag independently re-checked and clears the bar, including the apologetics pass's deliberate `no-other-god` beside `idolatry` both-tags pair on 96:5 (the rivals' emptiness vs the Maker's uniqueness).
3. Anchor-extension candidates: `sharing-your-faith` | Psalms 96:2-3 | "Proclaim his salvation from day to day! Declare his glory among the nations, his marvelous works among all the peoples." | w=0.7 — the pack has no OT anchor; joins chunk 3's 66:16 and 71:17-18 proposals. `nations-and-peoples` | Psalms 96:7-10 | "Ascribe to the LORD, you families of nations" … "Say among the nations, "The LORD reigns."" | w=0.7 — the families-of-nations summons the display tag rests on; the pack's Psalter anchors are 67:2-5 and 86:9. `divine-judgment` | Psalms 96:13 | "he comes to judge the earth. He will judge the world with righteousness, the peoples with his truth." | w=0.6 — the comes-to-judge refrain (98:9 is its near-twin; one anchor proposed for the pair); the pack's only Psalter anchor is 9:7-8.
4. Lexicon candidates: None — 96:1's "Sing to the LORD a new song!" joins chunk 2's `praise` | sing a new song lexicon row (Psalm 33 entry) as a further ref; cross-referenced, not re-proposed.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD-CEILING-8 (baseline) — mark for the per-verse refinement pass.
8. Decisions record: None (the ceiling was reached by the 2026-08-25 passes' recorded additions; no new yield). Seam check: clean (`no-other-god` 96:5 and `god-reigns` 96:10 — both tagged).

## Psalms 97
1. Existing tags (book doc): `divine-judgment`, `joy-in-the-lord`, `gods-protection`, `holiness`, `god-reigns` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. The pass's skips stand on re-read: `idolatry` (97:7 one verse; homes 96, 115, 135), `messianic-prophecy` (only a tentative "cf. Heb 1:6" in the batch notes — no signposted citation; the attribution rule holds).
3. Anchor-extension candidates: `joy-in-the-lord` | Psalms 97:11-12 | "Light is sown for the righteous, and gladness for the upright in heart. Be glad in the LORD, you righteous people!" | w=0.6 — the light-sown gladness promise; the pack's Psalter anchors (16:11; 30:5; 32:11; 37:4) lack it. `god-reigns` 97:1 checked and NOT proposed — the acclamation class is already pack-anchored at 93:1-2, 95:3, 96:10 (and 99:1 proposed below); no measured gap.
4. Lexicon candidates: None ("light is sown for the righteous" is verbatim WEB — lands lexically).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (no engine anchor on Ps 97; the acclamation-class note above covers the only candidate gap).

## Psalms 98
1. Existing tags (book doc): `praise`, `salvation`, `gods-faithfulness`, `divine-judgment` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar.
3. Anchor-extension candidates: `salvation` | Psalms 98:2-3 | "The LORD has made known his salvation. He has openly shown his righteousness in the sight of the nations." … "All the ends of the earth have seen the salvation of our God." | w=0.6 — the pack's anchors are all NT how-can-I-be-saved texts; this is the OT salvation-made-known proclamation the display tag rests on.
4. Lexicon candidates: None — checked and NOT proposed: "make a joyful noise" (98:4, 6) is already a `praise` lexicon phrase (already-lands rule).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 98 (the §3 proposal closes the widest gap).

## Psalms 99
1. Existing tags (book doc): `holiness`, `worship`, `prayer`, `forgiveness-of-sins`, `god-reigns` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. `priesthood` considered and NOT added: "Moses and Aaron were among his priests" (99:6) is one recital verse — the psalm depicts intercessors called and answered, which the sitting `prayer` carries.
3. Anchor-extension candidates: `holiness` | Psalms 99:3, 5, 9 | "He is Holy!" … "for the LORD, our God, is holy!" | w=0.7 — the Psalter's triple-refrain holiness text; the pack's only Psalter anchor is 24:3-4 (the worshiper's fitness side — this is God's own holiness acclaimed). `god-reigns` | Psalms 99:1 | "The LORD reigns! Let the peoples tremble. He sits enthroned among the cherubim." | w=0.65 — completes the pack's coverage of the enthronement acclamations (93, 95, 96 anchored; 97 recorded above). `worship` | Psalms 99:5 | "Exalt the LORD our God. Worship at his footstool." | w=0.6 — the repeated exalt-and-worship command the display tag rests on; the pack's Psalter anchors are 95:6, 86:9, 65:4.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 99.

## Psalms 100
1. Existing tags (book doc): `thanksgiving`, `praise`, `worship`, `joy-in-the-lord`, `gods-faithfulness` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar.
3. Anchor-extension candidates: `gods-faithfulness` | Psalms 100:5 | "For the LORD is good. His loving kindness endures forever, his faithfulness to all generations." | w=0.6 — the doorway hymn's everlasting reason, the display tag's own ground; the pack has NO Psalter anchor (chunk 3's 77:11-12 and 89:1-2 proposals are its companions).
4. Lexicon candidates: None — checked and NOT proposed: "make a joyful noise unto the lord" (the KJV rendering of 100:1; WEB reads "Shout for joy to the LORD, all you lands!") — BOTH "make a joyful noise" and "shout for joy" already sit in the `praise` lexicon, so the remembered phrasing lands (already-lands rule).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: one finding — `shepherds-and-the-flock` anchors Psalms 100:3 (w=0.9) with no display tag; ADD declined on the presence bar: "We are his people, and the sheep of his pasture." is one clause of a five-verse hymn whose substance is the sitting thanksgiving/praise/worship trio (the recorded anchors-serve-queries / display-follows-substance split; the corporate-shepherd engine family is completed by the 95:7 proposal above). Recorded, not silent. `praise` 100:1-2 and `thanksgiving` 100:4 (lead) — both tagged.

## Psalms 101
1. Existing tags (book doc): `holiness`, `honesty`, `leadership` — 3.
2. Applied-tag deltas: ADD `integrity` — seam-check catch: Psalms 101:2 is the engine pack's own Psalter anchor (w=0.85), and the ruler's vow is the concept's exact register: "I will be careful to live a blameless life. When will you come to me? I will walk within my house with a blameless heart." (101:2), held against the counter-portrait "He who practices deceit won't dwell within my house. He who speaks falsehood won't be established before my eyes." (101:7). Chunk 1's Ps 15/26 register split applies unchanged: `honesty` = the truth-telling ban on deceit, `holiness` = the blameless-life pursuit before God, `integrity` = the whole undivided character, at home and on the throne. Lands at 4. KEEP the other 3.
3. Anchor-extension candidates: `honesty` | Psalms 101:7 | "He who practices deceit won't dwell within my house. He who speaks falsehood won't be established before my eyes." | w=0.6 — the pack has NO OT anchor at all and the display tag rests here. `leadership` | Psalms 101:6 | "My eyes will be on the faithful of the land, that they may dwell with me. He who walks in a perfect way, he will serve me." | w=0.65 — the ruler's-court staffing charter; the pack's Psalter anchor is 78:70-72 (the shepherd-king calling; this is the governing-in-integrity register the display tag names).
4. Lexicon candidates: `pastoral-sexual-purity` | set no wicked thing before my eyes | queries: "I will set no wicked thing before mine eyes", "guard your eyes bible verse", "bible verse about what you watch" — the KJV-remembered "no wicked thing … mine eyes" phrasing misses the WEB's "I will set no vile thing before my eyes." (101:3); rides the pack's existing 101:3 anchor (w=0.8).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: three findings — `integrity` 101:2 anchor untagged (ADD above); two declined (recorded, not silent): `pastoral-sexual-purity` anchors 101:3 (w=0.8) — the psalm is a ruler's vow, not the pack's personal purity-crisis register (the pastoral-register ruling; the anchor serves its guard-my-eyes queries); `slander-and-false-accusation` anchors 101:5 (w=0.9) — 101:5 depicts the king silencing slanderers, not the being-slandered register the display tag collects (and one verse besides).

## Psalms 102
1. Existing tags (book doc): `prayer`, `loneliness`, `pastoral-hope-in-despair`, `gods-faithfulness`, `lament`, `mortality`, `restoration-of-israel`, `messianic-prophecy` — 8 (hard ceiling).
2. Applied-tag deltas: No changes — at the hard ceiling; the 2026-08-25 pass's cap plan (`justice-and-oppression` thin at 102:17, 20; `zion-city-of-god` duplicating `restoration-of-israel` on the same verses) re-checked against the text and standing; the apologetics pass's recorded `gods-unchanging-nature` yield (cap-full; does not outrank the sitting tags under main-themes-first) likewise stands — no new evidence changes the arithmetic at 8.
3. Anchor-extension candidates: `loneliness` | Psalms 102:6-7 | "I am like a pelican of the wilderness. I have become as an owl of the waste places." … "like a sparrow that is alone on the housetop." | w=0.7 — Scripture's most vivid alone-images, the display tag's own ground; the pack's Psalter anchors are 27:10/68:6 (joins chunks 2–3's 38:11 and 88:8 proposals). `prayer` | Psalms 102:17 | "He has responded to the prayer of the destitute, and has not despised their prayer." | w=0.6 — the prayer-of-the-destitute assurance; no pack carries it. `messianic-prophecy` | Psalms 102:25-27 | "They will perish, but you will endure." … "But you are the same. Your years will have no end." | w=0.7 — Heb 1:10-12's attributed citation (signposted in the doc); the pack lacks the psalm; joins the chunk 1–3 class (2:6-9; 45:6-7; 69:9, 21).
4. Lexicon candidates: None ("like a sparrow that is alone on the housetop" is verbatim WEB — lands lexically).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD-CEILING-8 — mark for the per-verse refinement pass (lament 102:1-11, Zion's set time 102:12-22, frail flesh vs the unchanging God 102:23-28 are natural movements; no BSB subdivision recorded).
8. Decisions record: the standing recorded yield (`gods-unchanging-nature`, apologetics pass 2026-08-25) is re-affirmed, not new. Seam check: one finding — `gods-unchanging-nature` anchors Psalms 102:25-27 (w=0.85) with no display tag: exactly that standing ceiling yield; search is served by the anchor; recorded, not silent.

## Psalms 103
1. Existing tags (book doc): `praise`, `gods-love`, `forgiveness-of-sins`, `grace-not-earned`, `pastoral-prayer-for-healing`, `restoration`, `slow-to-anger`, `mortality` — 8 (hard ceiling).
2. Applied-tag deltas: No changes — at the hard ceiling; the 2026-08-25 pass's cap plan (`angels`, `god-reigns`, `justice-and-oppression` fail the bar at one-clause presences; `slow-to-anger` and `mortality` pass) re-checked against the text and standing; batch-3 Decisions #7 (`providence` off — 103:19 one clause) standing.
3. Anchor-extension candidates: `gods-love` | Psalms 103:11, 13, 17 | "For as the heavens are high above the earth, so great is his loving kindness toward those who fear him." … "Like a father has compassion on his children, so the LORD has compassion on those who fear him." | w=0.8 — the display tag's own ground, yet the pack's only Psalter anchor is 147:11 (joins chunk 3's 63:3 proposal); the heavens-high measure and the father's compassion are first-rank "God's love" query targets.
4. Lexicon candidates: None ("as far as the east is from the west" is already a `forgiveness-of-sins` lexicon phrase with the pack's 103:12 lead anchor).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD-CEILING-8 — mark for the per-verse refinement pass.
8. Decisions record: None new. Seam check: four findings, all declined (recorded, not silent) — three of them w=1.0 LEAD anchors sitting untagged on this one psalm, each a standing recorded call re-checked against the text: `mercy` anchors 103:10-11 (lead) — cap-full at 8 AND duplicate register (the sitting `grace-not-earned` justification IS 103:10, and `gods-love` holds 103:8-17); under §11.6 it does not outrank a sitting tag; recorded as the ceiling-yield follow-up candidate if the curator re-opens the psalm (the Ps 102 pattern). `justice-and-oppression` anchors 103:6 (lead) — the pass's skip (103:6 alone) stands. `angels` anchors 103:20-21 (lead) — the pass's skip (closing praise-summons list) stands; chunk 2's Ps 34 entry already preserves the pack's query surface. `providence` anchors 103:19 — batch-3 Decisions #7 stands.

## Psalms 104
1. Existing tags (book doc): `creation`, `gods-provision`, `providence`, `praise`, `design-in-creation` — 5.
2. Applied-tag deltas: ADD `leviathan-and-behemoth` (adopted §11.1 id) — discharging the apologetics pass's own recorded follow-up: the pass skipped this id at Ps 104 solely for want of a verified quote ("a follow-up candidate if a verified quote is staged"), and the staged text now verifies it mechanically: "There the ships go, and leviathan, whom you formed to play there." (104:26). Same named-figure-lookup register as the sitting Ps 74 tag (74:13-14); single-verse presence is the nature of a named-figure locator (the Ps 74 precedent). Lands at 6 (soft cap). KEEP the other 5.
3. Anchor-extension candidates: `creation` | Psalms 104:5-9, 24 | "He laid the foundations of the earth, that it should not be moved forever." … "LORD, how many are your works! In wisdom, you have made them all." | w=0.75 — the Psalter's full-length creation hymn is absent from the creation pack (its Psalter anchors are 19:1; 90:2; 139:13-14). `gods-provision` | Psalms 104:14-15, 27-28 | "He causes the grass to grow for the livestock, and plants for man to cultivate" … "You open your hand; they are satisfied with good." | w=0.7 — the all-creatures-fed register the display tag rests on; joins chunk 3's 65:9-13/81:10 proposals.
4. Lexicon candidates: None ("wine that makes the heart of man glad" is verbatim WEB — lands lexically).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 post-delta (no ceiling hit).
8. Decisions record: None. Seam check: clean (`design-in-creation` 104:24 — tagged). (ROUTED to corpus-blocked roster row 50: `leviathan-and-behemoth` — Psalms 104:26, quoted above, is a staged-text-verified third named-figure witness beside the row's recorded Job 40-41 and Ps 74:13-14 refs, for the row's curator at the re-pin; the pending `leviathan-and-behemoth` fixture remains the measured-gap record.)

## Psalms 105
1. Existing tags (book doc): `covenant`, `gods-faithfulness`, `providence`, `thanksgiving`, `remembrance-and-memorials` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. The pass's `inheritance` skip stands (105:11 one verse, carried by `covenant`). `seeking-god` considered and NOT added: 105:3-4 is a two-verse summons preface to a 45-verse recital — thin for display; routed engine-side instead (below).
3. Anchor-extension candidates: `covenant` | Psalms 105:8-9 | "He has remembered his covenant forever, the word which he commanded to a thousand generations, the covenant which he made with Abraham, his oath to Isaac," | w=0.7 — the pack's Abrahamic anchors are all Genesis texts; this is the Psalter's covenant-remembered recital (chunk 3's 89:3-4 proposal is the Davidic companion). `providence` | Psalms 105:16-17 | "He called for a famine on the land. He destroyed the food supplies. He sent a man before them. Joseph was sold for a slave." | w=0.7 — the Joseph-sent-ahead history in the psalm's own words, beside the pack's Gen 50:20/45:5-7 leads. `seeking-god` | Psalms 105:3-4 | "Let the heart of those who seek the LORD rejoice. Seek the LORD and his strength. Seek his face forever more." | w=0.7 — the pack anchors the 1 Chr 16:10-11 doublet of exactly these verses but not the psalm itself.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 105. (ROUTED to corpus-blocked roster row 46: `the-lords-anointed` — Psalms 105:15 ""Don't touch my anointed ones! Do my prophets no harm!"" — the touch-not imperative itself, the row's own minting register in Psalter form (the patriarchs as the LORD's anointed ones); the strongest Psalter witness this sweep has found for that row; joins the Pss 2, 18, 20, 28 (chunk 1), 84, 89 (chunk 3) routings.)

## Psalms 106
1. Existing tags (book doc): `sin`, `repentance`, `gods-faithfulness`, `covenant`, `divine-judgment`, `prayer`, `restoration-of-israel` — 7.
2. Applied-tag deltas: ADD `idolatry` — the confession catalog's dominant named sin, sustained across three episodes: the calf ("They made a calf in Horeb, and worshiped a molten image. Thus they exchanged their glory for an image of a bull that eats grass.", 106:19-20), Baal Peor ("They joined themselves also to Baal Peor", 106:28), and the idols of Canaan with their child sacrifice ("They served their idols, which became a snare to them. Yes, they sacrificed their sons and their daughters to demons.", 106:36-37). The 2026-08-25 worklist row carried only Pss 78:58; 81:9; 96:5; 97:7; 115:3-8; 135:15-18 — Ps 106, the Psalter's fullest idolatry narrative, was never swept against the id (the coverage-seam class, worklist-side rather than anchor-side). Registers distinct beside the sitting `sin` (the general we-have-sinned confession) per the both-tags ruling. Lands at 8 — the hard ceiling; every sitting tag independently re-checked and clears the bar, so no yield. KEEP the other 7. `confession-of-sin` considered and NOT added: "We have sinned with our fathers. We have committed iniquity. We have done wickedly." (106:6) is the sitting `sin` justification's own span, and `repentance` already carries the owning-it-before-God act — a third tag on the identical frame is the duplicate-register limit; 106:6 is instead recorded as a ref for the consolidated plan's §A.16 `confession-of-sin` row (the chunk-2 Ps 32 rider pattern; the id is not engine-built).
3. Anchor-extension candidates: `gods-faithfulness` | Psalms 106:8, 44 | "Nevertheless he saved them for his name's sake, that he might make his mighty power known." … "Nevertheless he regarded their distress, when he heard their cry." | w=0.7 — the twice-"Nevertheless" faithfulness-past-rebellion register; the pack has no Psalter anchor (joins chunk 3's 77/89 proposals and the 100:5 proposal above). `grumbling-and-complaining` | Psalms 106:25 | "but murmured in their tents, and didn't listen to the LORD's voice." | w=0.6 — the Psalter's own retelling of the wilderness murmuring the pack's 1 Cor 10:10 and Num 14:2-4 anchors preach against.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD-CEILING-8 post-delta — mark for the per-verse refinement pass (the catalog's episodes — sea, craving, Dathan, calf, spies, Baal Peor, Meribah, Canaan — are natural sections; no BSB subdivision recorded).
8. Decisions record: None (the ADD lands the psalm at the ceiling with no displacement; recorded here). Seam check: clean — notable inverse seam: NO engine pack anchors Psalm 106 at all (a 48-verse history psalm; the §3 proposals begin closing it). (ROUTED to corpus-blocked roster row 7: `god-relents` — Psalms 106:45 "He remembered for them his covenant, and repented according to the multitude of his loving kindnesses." — a staged-text-verified God-repenting witness while Jer 18, Jonah 3-4, and Joel 2 stay blocked; first Psalms feed to this row. Cross-note for the same curator: Ps 110:4's "The LORD has sworn, and will not change his mind" is the immutability-side counterpoint — it belongs with the row's recorded keep-separate-from-immutability note (the `gods-unchanging-nature` side, anchor proposed at Ps 110 below), not with god-relents. ROUTED to corpus-blocked roster row 8: `gods-holy-name` — Psalms 106:8, quoted above, is the acted-for-his-name's-sake witness — exactly the row's Ezekiel minting register in Psalter form; joins the row's recorded Ps 23:3 and the Pss 31:3 (chunk 2), 79:9 (chunk 3) routings. ROUTED to corpus-blocked roster row 36: `zeal-for-god` — Psalms 106:30-31 "Then Phinehas stood up and executed judgment, so the plague was stopped. That was credited to him for righteousness, for all generations to come." — the Psalter's retelling of the row's whole minting case (Num 25:7-13, corpus-blocked); the row's vigilante-violence gist caution applies with full force; joins chunk 3's Ps 69:9.)

## Psalms 107
1. Existing tags (book doc): `thanksgiving`, `prayer`, `gods-provision`, `providence` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. The pass's `justice-and-oppression` skip stands (107:41 one verse, carried by `providence`). `pastoral-freedom-from-bondage` considered and NOT added: the prisoners scene (107:10-16) is literal captivity for rebellion against God's words, not the pack's personal-bondage register (batch-3 motif item 4's recorded routing).
3. Anchor-extension candidates: `thanksgiving` | Psalms 107:1-2, 8 | "Give thanks to the LORD, for he is good, for his loving kindness endures forever." … "Let them praise the LORD for his loving kindness, for his wonderful deeds to the children of men!" | w=0.7 — the fourfold-refrain thanksgiving liturgy; the pack's Psalter anchors are 100:4 and 92:1. `peace-of-god` | Psalms 107:28-30 | "He makes the storm a calm, so that its waves are still. Then they are glad because it is calm, so he brings them to their desired haven." | w=0.65 — the stilled-storm text the pack lacks (Mark 4:39's echo is the NT signpost, not asserted). `power-of-gods-word` | Psalms 107:20 | "He sends his word, and heals them, and delivers them from their graves." | w=0.6 — the sent-word efficacy register, the pack's own Isa 55:10-11 family. `gods-provision` | Psalms 107:9 | "For he satisfies the longing soul. He fills the hungry soul with good." | w=0.65 — the display tag's ground.
4. Lexicon candidates: `peace-of-god` | he stilled the storm | queries: "he stilled the storm to a whisper", "god calms the storm bible verse", "bible verse about god calming storms" — the NIV-remembered "stilled the storm to a whisper" has NO WEB lexical match ("He makes the storm a calm", 107:29); rides the proposed 107:28-30 anchor. ("at their wits' end" is verbatim WEB — lands lexically; no row.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — notable inverse seam: NO engine pack anchors Psalm 107 at all — the Psalter's four-scene rescue liturgy, the widest single-psalm engine-coverage gap this chunk found (the §3 proposals close part of it). (ROUTED to corpus-blocked roster row 32: `deliverance` — Psalm 107 IS the row's rescue-narrative register four times over on one refrain: "Then they cried to the LORD in their trouble, and he delivered them out of their distresses." (107:6, with the variants at 13, 19, 28) — desert, chains, sickbed, storm; the strongest Psalter witness this sweep has found for that row; joins the Pss 18, 34, 40, 54, 56, 68, 91, 116 routings. ROUTED to corpus-blocked roster row 23: `redeemer` — Psalms 107:2 "Let the redeemed by the LORD say so, whom he has redeemed from the hand of the adversary," — the redeemed-say-so summons; joins the Pss 49 (chunk 2), 78:35 (chunk 3), 111:9 (below) refs.)

## Psalms 108
1. Existing tags (book doc): `praise`, `prayer`, `trust-in-god` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (the doubles rule: 108:1-5 reprises 57:7-11 and 108:6-13 = 60:5-12 per the book doc — cross-reference, not re-derivation; chunk 2's Ps 60 entry anticipated exactly this cross-ref, and chunk 2's Pss 57/60 entries carry the shared-text notes).
3. Anchor-extension candidates: None (the shared spans' engine-side notes live with the source psalms' entries, per the doubles rule).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean.

## Psalms 109
1. Existing tags (book doc): `prayer`, `divine-judgment`, `pastoral-refuge-and-justice`, `thanksgiving`, `slander-and-false-accusation`, `betrayal`, `vengeance` — 7.
2. Applied-tag deltas: No changes — at 7, every sitting tag independently re-checked and clears the bar; the standing imprecatory frame holds throughout — the Psalter's severest curse-list is described, never endorsed: asked of the Judge rather than taken ("This is the reward of my adversaries from the LORD", 109:20), prayed by one who is himself "poor and needy"; Acts 1:20's use of 109:8 stays the signposted application.
3. Anchor-extension candidates: `slander-and-false-accusation` | Psalms 109:2-3 | "for they have opened the mouth of the wicked and the mouth of deceit against me. They have spoken to me with a lying tongue. They have also surrounded me with words of hatred, and fought against me without a cause." | w=0.65 — the verbal-assault opening the display tag rests on; the pack's Psalter anchors (27:12; 56:5; 101:5; 35:11) lack it. Deliberately NOT proposed: any anchor on the curse-list itself (109:6-20) for `vengeance` — the pack's design is the vengeance-is-mine teaching register (Rom 12:19-21; Deut 32:35), and routing "revenge" queries into an imprecation would misserve the searcher; the display tag with its described-not-endorsed frame carries the psalm, and Ps 94:1-2 (above) is the teaching-register OT anchor offered instead.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter (accusation 109:1-5, imprecation 109:6-20, plea 109:21-29, vow of thanks 109:30-31; no BSB subdivision recorded).
8. Decisions record: None (no yield — 7 < ceiling). Seam check: clean (`betrayal` 109:4-5 anchored and tagged — chunk 2's Ps 55 register split holds). (ROUTED to corpus-blocked roster row 8: `gods-holy-name` — Psalms 109:21 "But deal with me, GOD the Lord, for your name's sake, because your loving kindness is good, deliver me;" — a for-your-name's-sake petition; joins the Pss 31:3, 79:9, 106:8 refs.)

## Psalms 110
1. Existing tags (book doc): `divine-judgment`, `messianic-prophecy` — 2.
2. Applied-tag deltas: No changes — both clear the bar (superscription "A Psalm by David" used exactly as stated; the standing rule holds: the psalm's own text speaks of David's Lord, enthroned and priest forever — the NT identifications (Matt 22:41-45; Heb 5-7; Acts 2:34-35) remain the sitting `messianic-prophecy` tag's signposted citations, per batch-3 Decisions #8 as amended by the 2026-08-25 pass). `priesthood` considered and NOT added: 110:4 is one verse, and the priest-oath's teaching development is Hebrews' — routed engine-side instead (below). `god-reigns` considered and NOT added: the enthroned figure is David's Lord, not the LORD's own enthronement acclamation — register mismatch; the enthronement register stays logged on the god-reigns row per Decisions #8.
3. Anchor-extension candidates: `priesthood` | Psalms 110:4 | "The LORD has sworn, and will not change his mind: "You are a priest forever in the order of Melchizedek."" | w=0.8 — the oath Hebrews 5-7 builds on; the pack's OT anchors are Exod 28:1 and Deut 33:8-11 — the Melchizedek text itself is missing ("who is melchizedek" queries land lexically on the name; the anchor is the ordering fix). `gods-unchanging-nature` | Psalms 110:4 | "The LORD has sworn, and will not change his mind:" | w=0.6 — the sworn-and-unchanging register beside the pack's Num 23:19 and Mal 3:6 anchors (cross-note to roster row 7 recorded at Ps 106 above).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`messianic-prophecy` 110:1-4 anchored and tagged).

## Psalms 111
1. Existing tags (book doc): `praise`, `thanksgiving`, `covenant`, `wisdom-from-god`, `fear-of-the-lord`, `trustworthiness-of-scripture` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar. The pass's skips stand: `inheritance` (111:6 one clause), `remembrance-and-memorials` (111:4 one clause — the practiced-remembering home is Ps 105).
3. Anchor-extension candidates: `wisdom-from-god` | Psalms 111:10 | "The fear of the LORD is the beginning of wisdom. All those who do his work have a good understanding." | w=0.7 — the pack's beginning-of-wisdom anchors are Prov 2:6/9:10; the Psalter's own statement is missing (it is also `fear-of-the-lord`'s existing 111:10 anchor — two registers of one verse, the both-tags pattern engine-side). `trustworthiness-of-scripture` | Psalms 111:7-8 | "All his precepts are sure. They are established forever and ever. They are done in truth and uprightness." | w=0.6 — the precepts-sure text the display tag rests on.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None. Seam check: clean (`fear-of-the-lord` 111:10 anchored and tagged). (ROUTED to corpus-blocked roster row 18: `wholehearted-devotion` — Psalms 111:1 "I will give thanks to the LORD with my whole heart, in the council of the upright, and in the congregation." — joins chunk 3's Ps 86:11-12 whole-heart witnesses for the row's design-resolved route (loving-god/seeking-god lexicon extension at the re-pin). ROUTED to corpus-blocked roster row 23: `redeemer` — Psalms 111:9 "He has sent redemption to his people. He has ordained his covenant forever." — a sent-redemption witness; joins the Pss 49, 78:35, 107:2 refs.)

## Psalms 112
1. Existing tags (book doc): `blessing`, `generosity`, `trust-in-god`, `fear-not`, `fear-of-the-lord` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar (batch-3 Decisions #11's prosperity guardrail kept: the portrait is "the shape of a life under God's favor, not a formula owed to anyone").
3. Anchor-extension candidates: `fear-not` | Psalms 112:7-8 | "He will not be afraid of evil news. His heart is steadfast, trusting in the LORD. His heart is established. He will not be afraid in the end" | w=0.75 — the not-afraid-of-bad-news text, a first-rank anxiety query target the display tag rests on; joins the 91:5-6 and 118:6 proposals in this chunk. `fear-of-the-lord` | Psalms 112:1 | "Blessed is the man who fears the LORD, who delights greatly in his commandments." | w=0.7 — the blessed-portrait companion to the pack's 111:10 and 34:11 anchors. `generosity` | Psalms 112:5, 9 | "It is well with the man who deals graciously and lends." … "He has dispersed, he has given to the poor." | w=0.7 — the pack's Psalter anchor is 37:21; 2 Cor 9:9's quotation of 112:9 is the signposted NT use.
4. Lexicon candidates: `fear-not` | afraid of bad news | queries: "he shall not be afraid of evil tidings", "not afraid of bad news bible verse", "bible verse for fear of bad news" — the KJV-remembered "evil tidings" has NO WEB lexical match ("evil news", 112:7); rides the proposed 112:7-8 anchor.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 112 (the §3 proposals close the three widest gaps).

## Psalms 113
1. Existing tags (book doc): `praise`, `humble-exaltation`, `waiting-for-a-child`, `god-reigns` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar (the pass's `justice-and-oppression` skip — same verses and quote as `humble-exaltation` — stands).
3. Anchor-extension candidates: `humble-exaltation` | Psalms 113:7-8 | "He raises up the poor out of the dust, and lifts up the needy from the ash heap, that he may set him with princes," | w=0.8 — the display tag's ground; the pack's Psalter anchor is 75:6-7 (1 Sam 2:8, this text's Hannah-song twin, is likewise unanchored — noted for the curator).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`waiting-for-a-child` 113:9 — the pack's own w=0.95 anchor, tagged).

## Psalms 114
1. Existing tags (book doc): `presence-of-god` — 1. ("Only one honest tag" note stands in the doc.)
2. Applied-tag deltas: No changes — nothing else in the current vocabulary is genuinely present. Considered and NOT added: `signs-and-wonders` (the Exodus wonders are recited scenery, and the pack's register is attesting miracles in ministry); `creation` (sea and mountains react; nothing is made). Honest-and-thin is the psalm's own shape; kept.
3. Anchor-extension candidates: None — considered and NOT proposed: `presence-of-god` | 114:7 ("Tremble, you earth, at the presence of the Lord") — the pack's register is nearness-comfort (139:7-10; Jas 4:8; Heb 13:5); the trembling-theophany register is a boundary call for the curator, not an extension to assert here.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (no engine anchor; the display tag's single-verse ground is the psalm's own climax).

## Psalms 115
1. Existing tags (book doc): `trust-in-god`, `worship`, `blessing`, `praise`, `idolatry` — 5.
2. Applied-tag deltas: ADD `no-other-god` — the apologetics map's own Ps 96 both-tags precedent applied to the Psalter's fullest form of the same comparison: "Why should the nations say, "Where is their God, now?" But our God is in the heavens. He does whatever he pleases. Their idols are silver and gold, the work of men's hands." (115:2-4), closed by "Those who make them will be like them; yes, everyone who trusts in them." (115:8). Beside the sitting `idolatry` per the both-tags ruling, registers exactly as recorded at Ps 96: the rivals' emptiness (`idolatry`) vs the living God's uniqueness (`no-other-god`). The apologetics map carried only Ps 96, so Ps 115 was never swept against the id. Lands at 6 (soft cap). KEEP the other 5. The pass's `fear-of-the-lord` skip stands (115:11, 13 — summons verses inside the sitting `trust-in-god`/`blessing` spans).
3. Anchor-extension candidates: `idolatry` | Psalms 115:4-8 | "They have mouths, but they don't speak. They have eyes, but they don't see." … "Those who make them will be like them; yes, everyone who trusts in them." | w=0.8 — the engine pack has NO Psalter anchor, and this is the Psalter's fullest idol polemic (135:15-18, its twin, falls in chunk 5's range). `trust-in-god` | Psalms 115:9-11 | "Israel, trust in the LORD! He is their help and their shield." | w=0.65 — the triple trust summons the display tag rests on; the pack lacks it.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 post-delta (no ceiling hit).
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 115 (the §3 idolatry proposal closes the widest gap).

## Psalms 116
1. Existing tags (book doc): `thanksgiving`, `prayer`, `pastoral-serious-illness`, `rest-for-the-weary`, `loving-god`, `oaths-and-vows` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar.
3. Anchor-extension candidates: `rest-for-the-weary` | Psalms 116:7 | "Return to your rest, my soul, for the LORD has dealt bountifully with you." | w=0.7 — the display tag's ground; the pack's Psalter anchors are 62:1-2, 55:22, 127:2. `prayer` | Psalms 116:1-2 | "I love the LORD, because he listens to my voice, and my cries for mercy. Because he has turned his ear to me, therefore I will call on him as long as I live." | w=0.6 — the heard-prayer testimony; the pack's only Psalter anchor is 86:5-7 (the span also carries `loving-god`'s existing 116:1 anchor — two registers of one text, engine-side).
4. Lexicon candidates: None — checked and NOT proposed: a "when a believer dies" / funeral-intent row — the `pastoral-serious-illness` lexicon ALREADY carries "when a believer dies" and "what happens when we die" with the pack's 116:15 anchor, so the query family lands (already-lands rule). Vocabulary-evidence note for the adopted `death-of-a-believer` row's curator (§11.1 id, engine-built: no): Psalms 116:15 "Precious in the LORD's sight is the death of his saints." is the OT witness, and the serious-illness lexicon fact above is exactly the extension-vs-mint evidence that row's design check needs — recorded here, nothing minted.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None. Seam check: clean (`loving-god` 116:1, `oaths-and-vows` 116:14, `pastoral-serious-illness` 116:15 — all anchored and tagged). (ROUTED to corpus-blocked roster row 32: `deliverance` — Psalms 116:8 "For you have delivered my soul from death, my eyes from tears, and my feet from falling." — the completed-rescue testimony; joins the Pss 18, 34, 40, 54, 56, 68, 91, 107 refs.)

## Psalms 117
1. Existing tags (book doc): `praise`, `nations-and-peoples`, `gods-faithfulness` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (the Psalter's shortest psalm; Rom 15:11 stays the signposted application per the standing rule).
3. Anchor-extension candidates: `nations-and-peoples` | Psalms 117:1 | "Praise the LORD, all you nations! Extol him, all you peoples!" | w=0.6 — the whole-world summons in two verses; the pack's Psalter anchors are 67:2-5 and 86:9 (joins the chunk 1–3 class).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — no engine anchor on Ps 117 (the §3 proposal is the psalm's one honest candidate). (ROUTED to corpus-blocked roster row 40: `gentile-inclusion` — Psalms 117:1, quoted above, is the verse Rom 15:11 cites as Scripture's own summons of the Gentiles to glorify God; a supporting OT witness for the row's curator beside chunk 3's Ps 87:4-6 — the row's core texts remain Acts 10-11; 15, and its recorded register decision is untouched.)

## Psalms 118
1. Existing tags (book doc): `thanksgiving`, `refuge-in-trouble`, `fear-not`, `joy-in-the-lord`, `christ-the-cornerstone`, `messianic-prophecy` — 6 (soft cap).
2. Applied-tag deltas: ADD `trusting-in-man` — seam-check catch of the chunk-1/2 Ps 20/33 class: Psalms 118:8-9 is the engine pack's own anchor (w=0.85), and the id (adopted vocabulary post-dating the 131-id batch drafting, on no 2026-08-25 worklist row) was never swept against the psalm: "It is better to take refuge in the LORD, than to put confidence in man. It is better to take refuge in the LORD, than to put confidence in princes." (118:8-9). Both-tags on the same span beside the sitting `refuge-in-trouble`, registers genuinely distinct — where refuge is found vs where confidence fails (the pack's own "do not put your trust in princes" register) — chunk 1's Ps 20 same-span precedent exactly. Lands at 7; every sitting tag independently re-checked and clears the bar. KEEP the other 6. The pass's `fear-of-the-lord` skip stands (118:4 litany list-item).
3. Anchor-extension candidates: `christ-the-cornerstone` | Psalms 118:22-23 | "The stone which the builders rejected has become the cornerstone. This is the LORD's doing. It is marvelous in our eyes." | w=0.85 — the saying's own source text; the pack's live anchors are all NT (1 Pet 2:4-7; Eph 2:19-22; Acts 4:11), its lexicon already carries "the stone the builders rejected", and the book doc records Ps 118:22 among the pack's corpus-deferred source anchors — this proposal is that deferred anchor's restoration case for the re-pin curator. `fear-not` | Psalms 118:6 | "The LORD is on my side. I will not be afraid. What can man do to me?" | w=0.8 — Heb 13:6 quotes it (signposted); the display tag rests on it. `joy-in-the-lord` | Psalms 118:24 | "This is the day that the LORD has made. We will rejoice and be glad in it!" | w=0.85 — a first-rank famous verse; the pack's Psalter anchors (16:11; 30:5; 32:11; 37:4) lack it. `messianic-prophecy` | Psalms 118:22-26 | "The stone which the builders rejected has become the cornerstone." … "Blessed is he who comes in the LORD's name!" | w=0.85 — the Palm Sunday lines with attributed citations (Matt 21:9, 42; Acts 4:11; 1 Pet 2:7 — signposted in the doc); the pack lacks the psalm; joins the 2/45/69/102 class.
4. Lexicon candidates: `thanksgiving` | his mercy endures forever | queries: "his mercy endures forever", "give thanks to the lord for his mercy endures forever", "his mercy endureth forever" — the KJV/NKJV-remembered refrain misses the WEB's "his loving kindness endures forever" (118:1-4, 29; Ps 136's twenty-six-fold refrain falls in chunk 5's range and should join). Curator caveat: bare "mercy" sits in the `mercy` pack's lexicon and "endures forever" lands lexically at 118:1-4 — check the already-lands rule before adding; `gods-love` ("steadfast love of the lord") is the alternative home; fixture the routing, don't adjudicate it here.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: lands at 7 post-delta (above soft cap 6, under ceiling 8) — flag for the per-verse refinement pass as a dense chapter (refrain frame 118:1-4/29, rescue testimony 118:5-18, gates-and-cornerstone procession 118:19-28; no BSB subdivision recorded).
8. Decisions record: None (no yield — 7 < ceiling). Seam check: one finding — `trusting-in-man` 118:8-9 anchor untagged (the ADD above; recorded, not silent).

## Psalms 119 (subdivided: 22 acrostic stanzas, Aleph–Taw, per the book doc)
1. Existing tags (book doc): `delight-in-the-word`, `studying-the-word`, `obedience-to-the-word`, `guidance`, `hope-in-god`, `prayer`, `trustworthiness-of-scripture`, `slander-and-false-accusation` — 8 (hard ceiling).
2. Applied-tag deltas: No changes at psalm level — at the hard ceiling; the 2026-08-25 pass's cap plan (`inheritance`, `oaths-and-vows`, `sojourners-and-strangers` are single verses of 176 and fail the bar; `trustworthiness-of-scripture` and `slander-and-false-accusation` pass) re-checked against the text and standing; the apologetics pass's recorded `power-of-gods-word` yield (119:89, 160 — cap-full; does not outrank the sitting tags) likewise stands. The stanza review below found no stanza whose candidates displace a sitting psalm-level tag; per-stanza display tagging awaits the per-verse refinement pass this psalm is already marked for — the stanza-scoped §3 anchors are this sweep's down-payment on it.
3. Anchor-extension candidates (by stanza; stanzas not listed were checked and yielded none):
   - **Beth (119:9-16):** `obedience-to-the-word` | Psalms 119:9-11 | "How can a young man keep his way pure? By living according to your word." … "I have hidden your word in my heart, that I might not sin against you." | w=0.85 — the purity-by-the-word and word-hidden-in-the-heart texts; the pack has no Psalm 119 anchor.
   - **Gimel (119:17-24):** `sojourners-and-strangers` | Psalms 119:19 | "I am a stranger on the earth. Don't hide your commandments from me." | w=0.55 — the pass's display skip stands (one verse of 176); the anchor serves the stranger-on-earth query surface (the anchors-serve-queries split).
   - **He (119:33-40):** `pastoral-sexual-purity` | Psalms 119:37 | "Turn my eyes away from looking at worthless things. Revive me in your ways." | w=0.6 — the turn-my-eyes prayer beside the pack's Job 31:1 and Ps 101:3 guard-my-eyes anchors.
   - **Waw (119:41-48):** `boldness-in-witness` | Psalms 119:46 | "I will also speak of your statutes before kings, and will not be disappointed." | w=0.55 — the pack's anchors are all Acts/Ephesians; the OT before-kings witness text.
   - **Teth (119:65-72, with Yodh's 119:75):** `the-lords-discipline` | Psalms 119:67, 71 | "Before I was afflicted, I went astray; but now I observe your word." … "It is good for me that I have been afflicted, that I may learn your statutes." | w=0.7 — affliction-as-schooling ("in faithfulness you have afflicted me", 119:75, is the Yodh companion); joins the 94:12-13 proposal above.
   - **Kaph (119:81-88), with Samekh's 119:114:** `hope-in-god` | Psalms 119:81, 114 | "My soul faints for your salvation. I hope in your word." … "You are my hiding place and my shield. I hope in your word." | w=0.6 — the hope-in-your-word refrain the display tag rests on; the pack's Psalter anchors are 39:7 and 146:5.
   - **Mem (119:97-104):** `delight-in-the-word` | Psalms 119:97, 103 | "How I love your law! It is my meditation all day." … "How sweet are your promises to my taste, more than honey to my mouth!" | w=0.9 — first-order gap: the pack's namesake register, whose only Psalter anchor is 1:2; a "meditate on God's word" query should surface Psalm 119.
   - **Pe (119:129-136):** `guidance` | Psalms 119:133 | "Establish my footsteps in your word. Don't let any iniquity have dominion over me." | w=0.65 — the ordered-steps prayer beside the pack's existing 119:105 anchor.
   - **Sin and Shin (119:161-168):** `peace-of-god` | Psalms 119:165 | "Those who love your law have great peace. Nothing causes them to stumble." | w=0.7 — the great-peace promise; the pack's Psalter anchors are 37:1, 7.
   - **Taw (119:169-176):** `shepherds-and-the-flock` | Psalms 119:176 | "I have gone astray like a lost sheep. Seek your servant, for I don't forget your commandments." | w=0.55 — the lost-sheep plea beside the pack's Ezek 34:11-16 seek-the-lost anchor.
4. Lexicon candidates (by stanza):
   - **Beth:** `studying-the-word` | hide god's word in your heart | queries: "hiding god's word in my heart", "bible verses about memorizing scripture", "scripture memory verses" — the memorization intent has no lexical route ("memorize" appears nowhere in the WEB psalm); rides the proposed 119:9-11 anchor (`delight-in-the-word`'s "meditate on the word" family is the adjacent home — curator routes).
   - **Pe:** `guidance` | order my steps | queries: "order my steps bible verse", "lord order my steps", "order my steps in your word" — the KJV-remembered "Order my steps in thy word" has NO WEB lexical match ("Establish my footsteps in your word", 119:133); rides the proposed 119:133 anchor.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD-CEILING-8 (baseline) AND book-doc subdivision (22 acrostic stanzas) — doubly marked for the per-verse refinement pass.
8. Decisions record: the standing recorded yield (`power-of-gods-word`, apologetics pass 2026-08-25) re-affirmed, not new. Seam check: one finding — `power-of-gods-word` anchors Psalms 119:89 (w=0.8) with no display tag: exactly that standing ceiling yield; search served by the anchor; recorded, not silent (`guidance` 119:105 and `trustworthiness-of-scripture` 119:160 are anchored and tagged). (ROUTED to corpus-blocked roster row 4: `persecuted-for-gods-word` — Psalms 119:161 "Princes have persecuted me without a cause, but my heart stands in awe of your words." and 119:23 "Though princes sit and slander me, your servant will meditate on your statutes." — persecution FOR loyalty to God's word, the row's register, while its Jer 20/26/37-38, Dan 3/6, Esther spine stays blocked; first Psalms feed to this row. ROUTED to corpus-blocked roster row 18: `wholehearted-devotion` — the psalm's whole-heart refrain: "who seek him with their whole heart" (119:2), "With my whole heart I have sought you" (119:10), "I have called with my whole heart" (119:145; also 34, 58, 69) — joins the Pss 86:11-12, 111:1 witnesses for the row's design-resolved lexicon-extension route.)

## Psalms 120
1. Existing tags (book doc): `prayer`, `honesty`, `lament`, `slander-and-false-accusation`, `sojourners-and-strangers` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar (the first Song of Ascents; the collection-as-such question stays settled — declines.md §4's recorded check: the Songs of Ascents need "no concept home needed beyond the psalm-by-psalm tags", re-checked and standing).
3. Anchor-extension candidates: `slander-and-false-accusation` | Psalms 120:2 | "Deliver my soul, LORD, from lying lips, from a deceitful tongue." | w=0.6 — the deliver-me-from-lies prayer register the display tag rests on; joins the 109:2-3 proposal. `sojourners-and-strangers` | Psalms 120:5-6 | "Woe is me, that I live in Meshech, that I dwell among the tents of Kedar!" | w=0.6 — the far-from-home lament beside the pack's 39:12 and 137:4 anchors.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 120. Corpus-blocked roster row 29 (`peace-among-nations`) needs no routing: 120:7 "I am for peace, but when I speak, they are for war." is the lone peace-seeker among haters, not the row's swords-to-plowshares register (the row IS Mic 4:1-4 / Isa 2:2-4).

---

### Block survival audit (CONVENTIONS §9) — Psalms 91–120 block, 2026-08-26

Written as one atomic end-of-file append; post-write the file was re-read, pre-existing bytes (header + the Psalms 1–30, 31–60, and 61–90 blocks) verified unchanged, and this block verified present exactly once. Block tallies: **5 ADDs** (Ps 101 `integrity`; Ps 104 `leviathan-and-behemoth`; Ps 106 `idolatry`; Ps 115 `no-other-god`; Ps 118 `trusting-in-man`) · **0 DROPs** · 156 KEEPs (all baseline tags re-checked against the WEB text) · **64 anchor-extension candidates** (count mechanically verified against the §3 proposal markers) (Pss 91, 93 ×2, 94 ×4, 95, 96 ×3, 97, 98, 99 ×3, 100, 101 ×2, 102 ×3, 103, 104 ×2, 105 ×3, 106 ×2, 107 ×4, 109, 110 ×2, 111 ×2, 112 ×3, 113, 115 ×2, 116 ×2, 117, 118 ×4, 119 ×10 [stanza-scoped], 120 ×2) · **8 lexicon candidates** (Ps 93 "mightier than the waves"; Ps 94 "when anxiety was great within me"; Ps 101 "set no wicked thing before my eyes"; Ps 107 "he stilled the storm"; Ps 112 "afraid of bad news"/"evil tidings"; Ps 118 "his mercy endures forever" [with already-lands caveat]; Ps 119 Beth "hide god's word in your heart"; Ps 119 Pe "order my steps" — six are KJV/NIV/NASB-remembered phrasings with no WEB lexical match, the chunks 2–3 pattern; six further candidates checked and NOT proposed under the already-lands rule: Ps 91 secret-place/wings/angels-charge, Pss 98/100 "make a joyful noise", Ps 103 east-from-west, Ps 107 "wits' end", Ps 110 "melchizedek", Ps 116 "when a believer dies") · **0 new-concept candidates** · **0 decline overturns** · **16 corpus-blocked routings** across roster rows 4 (Ps 119), 6 (Ps 94), 7 (Ps 106), 8 (Pss 106, 109), 18 (Pss 111, 119), 23 (Pss 107, 111), 32 (Pss 91, 107, 116), 36 (Ps 106), 40 (Ps 117), 46 (Ps 105), 50 (Ps 104) — rows 6, 8, 18, 23, 32, 36, 40, 46 join refs from chunks 1–3; rows 4, 7, 50 are first fed by this chunk (row 29 checked at Ps 120 and deliberately NOT routed — register mismatch recorded there) · **Seam-check catches:** 2 untagged engine-anchor seams became ADDs (Ps 101 `integrity` — the pack's own 101:2 Psalter anchor; Ps 118 `trusting-in-man` — the pack's own 118:8-9 anchor, the Ps 20/33 class); the Ps 106 `idolatry` ADD is a worklist-side coverage seam (the id's worklist row never carried Ps 106), the Ps 104 ADD discharges the apologetics pass's recorded staged-quote follow-up, and the Ps 115 ADD applies the pass's own Ps 96 both-tags precedent; 10 further anchor-without-tag findings recorded and declined per-psalm (95 `praise`; 100 `shepherds-and-the-flock`; 101 `pastoral-sexual-purity`, `slander-and-false-accusation`; 102 `gods-unchanging-nature` [standing apologetics yield]; 103 `mercy`, `justice-and-oppression`, `angels`, `providence` [three w=1.0 lead anchors on one psalm, all standing recorded calls]; 119 `power-of-gods-word` [standing apologetics yield]) — none silent · **Notable inverse seams:** thirteen psalms in this range carry NO engine anchor at all (94, 97, 98, 99, 105, 106, 107, 108, 112, 114, 115, 117, 120) — most notably Ps 107 (the four-scene rescue liturgy, the widest single-psalm gap this chunk found), Pss 105–106 (both history psalms), and Ps 115 (the Psalter's fullest idol polemic); the §3 proposals begin closing them · ceiling flags: Pss 96, 102, 103, 119 at HARD-CEILING-8 (baseline; 119 additionally subdivided into its 22 stanzas — doubly marked), joined post-delta by Ps 106 at 8; Pss 94, 95, 109 (baseline) and 118 (post-delta) at 7, flagged as dense; Pss 91, 111, 116 at soft cap 6, joined post-delta by 104 and 115 · cross-refs to earlier chunks: Ps 96 new-song refs → chunk 2's Ps 33 lexicon row; Ps 91/95 `fear-not`/`shepherds-and-the-flock` anchors join chunks 1–3's 3:5-6/46:2-3 and 28:9/80:1 proposals; Ps 100/106 `gods-faithfulness` anchors join chunk 3's 77/89 proposals; Ps 102 `loneliness` anchor joins chunks 2–3's 38:11/88:8; Ps 102/118 `messianic-prophecy` anchors join the chunks 1–3 class (2, 45, 69); Ps 94 `the-lords-discipline` anchor complements chunks 1–2's 6:1/38:1-2 (blessing vs plea registers); Ps 108 → chunk 2's Pss 57/60 (doubles); Ps 106 routing joins chunk 3's Pss 79:9 (row 8) and 69:9 (row 36); Ps 105 routing joins chunks 1/3's row-46 refs; Pss 91/107/116 routings join chunks 1–3's row-32 refs; Pss 107/111 routings join chunks 2–3's row-23 refs; Pss 111/119 routings join chunk 3's row-18 refs; Ps 117 routing joins chunk 3's Ps 87 (row 40); Ps 106 `confession-of-sin` refs ride the §A.16 row per chunk 2's Ps 32 rider pattern.

---

## This block: Psalms 121–150 (sweep worker chunk 5 of 5, 2026-08-26) — completes the book

Same inputs, rules, and entry format as the Psalms 1–30, 31–60, 61–90, and 91–120 blocks above (repo e762d1c; canonical `tag-apply/adopted-concepts.md` 161-id list, re-read and confirmed identical to the kit's rules.md §D.1 regeneration; WEB quotes word-for-word from the staged verse-per-line 87fd68c extraction, straight-apostrophe typography, words unaltered). Within 121–150, Psalms 121, 136, 139, 146, 147, 150 are additionally pinned-fixture witnessed at e762d1c (batch-3 header list); the rest are verified against the 87fd68c full fixture only. **Systematic seam check applied per psalm**: every engine anchor falling in Pss 121–150 was checked against the psalm's baseline tags; the result is recorded per psalm ("seam check: clean" or the finding), and the inverse seam (a psalm carrying no engine anchor at all) is recorded per psalm. Chunks 1–4's entries are prior art: no candidate they carry is re-proposed; added refs cross-reference the earlier entry instead. Standing Psalms rules held throughout, in particular: imprecatory content described, never endorsed (Pss 137:7-9, 139:19-22, 149:6-9); superscription-limited attribution; pastoral-* personal-crisis register only. This block ends with the book roll-up (whole-Psalter totals across chunks 1–5).

## Psalms 121
1. Existing tags (book doc): `gods-protection`, `refuge-in-trouble`, `trust-in-god` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (the keeper psalm; the collection-as-such question stays settled per declines.md §4, re-checked at Ps 120 in chunk 4).
3. Anchor-extension candidates: `gods-protection` | Psalms 121:3-8 | "He will not allow your foot to be moved. He who keeps you will not slumber." … "The LORD will keep you from all evil. He will keep your soul." | w=0.9 — first-order coverage gap: the pack's only anchors are Psalms 91:9-12, 91:5-7, 91:14-16 and Isaiah 54:17, yet its own lexicon carries "keep me safe", "prayer for protection", and "safe travel" — Psalm 121 (six keep/keeper statements, "your going out and your coming in") is the concept's other canonical psalm and the batch-3 motif item 2 already named its keeper language as pack feed.
4. Lexicon candidates: `gods-protection` | he who watches over you | queries: "he who watches over you will not slumber", "he who watches over israel neither slumbers nor sleeps", "god watches over you bible verse" — the NIV-remembered "watches over" phrasing has NO lexical match in the WEB psalm ("He who keeps you will not slumber"), a genuine translation-gap row riding the proposed 121:3-8 anchor. (Checked and NOT proposed: "safe travel"/"traveling mercies" already sit in the pack's lexicon; "the LORD is your keeper" is verbatim WEB at 121:5 and lands lexically.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`refuge-in-trouble` 121:1-8 w=0.7 — tagged).

## Psalms 122
1. Existing tags (book doc): `worship`, `gathering-together`, `prayer`, `zion-city-of-god` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar (batch-3 Decisions #12's presence-based `gathering-together` call re-checked and kept). `the-house-of-god` (adopted id, engine-built) considered and NOT added: "Let's go to the LORD's house!" (122:1) and "For the sake of the house of the LORD our God" (122:9) are the psalm's frame verses — the substance between them is the city, the tribes, and the peace prayer, already carried by `zion-city-of-god` and `worship`; adding the house id would be broad-duplicating-specific. Routed engine-side instead (below).
3. Anchor-extension candidates: `gathering-together` | Psalms 122:1-4 | "I was glad when they said to me, "Let's go to the LORD's house!"" … "where the tribes go up, even the LORD's tribes, according to an ordinance for Israel, to give thanks to the LORD's name." | w=0.6 — the pack's anchors are all NT assembly texts (Heb 10:24-25; Matt 18:20; Acts 2:42; 1 Thess 5:11); the display tag rests on this psalm and batch-3 Decisions #12 flagged exactly this presence-without-anchor state. `the-house-of-god` | Psalms 122:1, 9 | "I was glad when they said to me, "Let's go to the LORD's house!"" | w=0.65 — the pack's own lexicon phrase "house of the lord" names this text; its only Psalter anchor is 27:4.
4. Lexicon candidates: None ("pray for the peace of Jerusalem" is verbatim WEB at 122:6 — lands lexically; alias-mining already-lands rule).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`zion-city-of-god` 122:1-9 w=0.7 — tagged).

## Psalms 123
1. Existing tags (book doc): `prayer`, `hope-in-god`, `lament` — 3.
2. Applied-tag deltas: ADD `mercy` — the four-verse psalm is a single sustained mercy plea: eyes lifted "as the eyes of servants look to the hand of their master … so our eyes look to the LORD, our God, until he has mercy on us." (123:2), doubled into the petition "Have mercy on us, LORD, have mercy on us, for we have endured much contempt." (123:3). Waiting-for-mercy is the psalm's whole action, the pack's plea register (its Luke 18:13 anchor is the same posture). KEEP the other 3. `servanthood` considered and NOT added: the servants' eyes are a simile for dependence, not servanthood teaching.
3. Anchor-extension candidates: `mercy` | Psalms 123:2-3 | "Have mercy on us, LORD, have mercy on us, for we have endured much contempt." | w=0.7 — the pack's only Psalter anchor is 103:10-11 (mercy declared); this is the mercy plea under contempt, a distinct query surface ("have mercy on me God").
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 123.

## Psalms 124
1. Existing tags (book doc): `gods-protection`, `praise` — 2.
2. Applied-tag deltas: No changes — both clear the bar; nothing else in the vocabulary is substantially present (an honest 2-tag psalm).
3. Anchor-extension candidates: `gods-protection` | Psalms 124:6-8 | "Blessed be the LORD, who has not given us as a prey to their teeth. Our soul has escaped like a bird out of the fowler's snare. The snare is broken, and we have escaped." | w=0.7 — the escaped-the-snare deliverance testimony; the pack lacks any escape-narrative anchor (see the Ps 121 note on its thin anchor set).
4. Lexicon candidates: None ("If it had not been the LORD who was on our side" and the fowler's-snare image are verbatim WEB — land lexically).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 124. (ROUTED to corpus-blocked roster row 32: `deliverance` — Psalms 124:7 "Our soul has escaped like a bird out of the fowler's snare. The snare is broken, and we have escaped." — the escape-testimony witness; joins the Pss 18, 34, 40, 54, 56, 68, 91, 107, 116 routings from chunks 1–4.)

## Psalms 125
1. Existing tags (book doc): `trust-in-god`, `gods-protection` — 2.
2. Applied-tag deltas: No changes — both clear the bar. The 2026-08-25 pass's `zion-city-of-god` skip stands (Zion as simile — "the substance is trust and protection"; no new evidence). `peace-of-god` considered and NOT added: "Peace be on Israel" (125:5) is the closing formula, one clause.
3. Anchor-extension candidates: `trust-in-god` | Psalms 125:1 | "Those who trust in the LORD are as Mount Zion, which can't be moved, but remains forever." | w=0.8 — the unmovable-trust image; the pack's Psalter anchors (37:5; 27:14; 62:5) lack it. `gods-protection` | Psalms 125:2 | "As the mountains surround Jerusalem, so the LORD surrounds his people from this time forward and forever more." | w=0.7 — the surrounded-by-God picture, a "God surrounds his people" query surface the pack lacks.
4. Lexicon candidates: None ("the LORD surrounds his people" is verbatim WEB — lands lexically).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 125.

## Psalms 126
1. Existing tags (book doc): `restoration`, `joy-in-the-lord`, `restoration-of-israel` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (the personal-renewal/national-register split between `restoration` and `restoration-of-israel` is the 2026-08-25 pass's own deliberate pairing, re-checked). The pass's `zion-city-of-god` skip stands (one mention, 126:1; no new evidence). `sowing-and-reaping` (adopted id) considered and NOT added: "Those who sow in tears will reap in joy." (126:5) is the sorrow-to-joy reversal promise, not the moral act-consequence register that id collects — register mismatch.
3. Anchor-extension candidates: `restoration-of-israel` | Psalms 126:1-4 | "When the LORD brought back those who returned to Zion, we were like those who dream." … "Restore our fortunes again, LORD, like the streams in the Negev." | w=0.8 — the pack's only Psalter anchor is 147:2; this is the Psalter's fullest return-from-captivity memory-and-prayer, and the consolidated plan's §A.23 row already carries 126:1-4 as display-log refs. `joy-in-the-lord` | Psalms 126:5-6 | "Those who sow in tears will reap in joy." | w=0.7 — the joy-after-sorrow promise beside the pack's 30:5 anchor; a "joy comes after weeping" query surface.
4. Lexicon candidates: None ("sow in tears … reap in joy" is verbatim WEB — lands lexically; "restore the years the locust has eaten" is Joel 2:25's remembered phrase, that book's row, not this psalm's).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 126.

## Psalms 127
1. Existing tags (book doc): `providence`, `rest-for-the-weary`, `parenting`, `blessing` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. `work-and-diligence` considered and NOT added: the psalm's verdict on toil is that it is vain WITHOUT the LORD (127:1-2) — the opposite register of that id's diligence teaching.
3. Anchor-extension candidates: `providence` | Psalms 127:1 | "Unless the LORD builds the house, they who build it labor in vain. Unless the LORD watches over the city, the watchman guards it in vain." | w=0.75 — the every-enterprise-depends-on-God text; the pack's Psalter anchors (33:10-11; 103:19; 139:16) lack it and its own lexicon phrase "god is in control" names this register.
4. Lexicon candidates: `parenting` | children are a gift from god | queries: "children are a gift from god verse", "kids are a blessing from the lord", "bible verse children are a blessing" — neither "gift" nor "blessing" appears anywhere in the WEB psalm ("children are a heritage of the LORD. The fruit of the womb is his reward", 127:3) — a genuine remembered-phrasing gap riding the pack's existing 127:3 anchor.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`parenting` 127:3 w=0.85, `rest-for-the-weary` 127:2 w=0.6 — both tagged).

## Psalms 128
1. Existing tags (book doc): `blessing`, `benediction`, `fear-of-the-lord` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (`benediction` a ratified PR #43 use, §11.5; the batch-3 prosperity guardrail wording — "a covenant picture, not a bargain" — re-checked and kept). Batch-3 Decisions #13 stands: no `godly-marriage` (the fruitful-vine wife is a household blessing picture, no marriage instruction); `parenting` considered and NOT added on the same ground (olive-shoot children are the blessing's picture, not parenting teaching).
3. Anchor-extension candidates: `fear-of-the-lord` | Psalms 128:1-4 | "Blessed is everyone who fears the LORD, who walks in his ways." … "Behold, this is how the man who fears the LORD is blessed." | w=0.7 — the blessed-life beatitude register; the pack's Psalter anchors (34:11; 33:8; 111:10) lack it. `benediction` | Psalms 128:5-6 | "May the LORD bless you out of Zion, and may you see the good of Jerusalem all the days of your life." | w=0.6 — the pack has NO OT benediction beyond Numbers 6:24-26; the display tag rests on this spoken blessing (pairs with the 134:3 proposal below).
4. Lexicon candidates: None ("blessed is everyone who fears the LORD" is verbatim WEB — lands lexically).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 128.

## Psalms 129
1. Existing tags (book doc): `gods-protection`, `justice-and-oppression` — 2.
2. Applied-tag deltas: No changes — both clear the bar (the national affliction-survived register; no pastoral-* tag per the standing register ruling, batch-3 Decisions #5). `vengeance` considered and NOT added: the prayer against Zion's haters (129:5-8) asks that they wither and miss the harvest blessing — shame and failure, not the repayment-handed-to-God register the vengeance additions carry (109, 137, 149); the sitting `justice-and-oppression` frame holds it.
3. Anchor-extension candidates: `justice-and-oppression` | Psalms 129:1-4 | "many times they have afflicted me from my youth up, yet they have not prevailed against me." … "The LORD is righteous. He has cut apart the cords of the wicked." | w=0.6 — the afflicted-people-survived witness under a righteous Judge; the display tag rests on it and the pack has no Psalm 129 anchor.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 129.

## Psalms 130
1. Existing tags (book doc): `forgiveness-of-sins`, `hope-in-god`, `prayer`, `salvation`, `lament` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar. `confession-of-sin` (adopted id) considered and NOT added: the psalm concedes universal guilt ("If you, LORD, kept a record of sins, Lord, who could stand?", 130:3) but performs no confession of named sin — the confession texts are Pss 32/51 (chunk 2's Ps 32 ADD); the forgiveness side is already tagged. `mercy` considered and NOT added: 130:7's "loving kindness" is one clause inside the hope charge.
3. Anchor-extension candidates: `forgiveness-of-sins` | Psalms 130:3-4 | "If you, LORD, kept a record of sins, Lord, who could stand? But there is forgiveness with you, therefore you are feared." | w=0.9 — first-order coverage gap: the Psalter's De Profundis forgiveness pivot is absent from the pack (its Psalter anchors are 103:12; 32:1-5; 51:3-4; 86:5), and the display tag rests on exactly these verses. `hope-in-god` | Psalms 130:5-6 | "I wait for the LORD. My soul waits. I hope in his word." | w=0.8 — the waiting-hope refrain; the pack's only Psalter anchors are 39:7 and 146:5 (joins chunk 3's 62:5-6 proposal). `lament` | Psalms 130:1-2 | "Out of the depths I have cried to you, LORD." | w=0.7 — the depths-cry opening; the pack has no Psalm 130 anchor and the consolidated plan's §A.1 row already names 130:1-2.
4. Lexicon candidates: None — checked and NOT proposed: "out of the depths" and "kept a record of sins" are verbatim WEB (already-lands rule); "waiting on the LORD" phrasings share tokens with 130:5's "I wait for the LORD" (already-lands rule again).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — NOTABLE inverse seam: no engine anchor at all on Ps 130 (the De Profundis — the widest single-psalm gap this chunk found; the §3 proposals begin closing it). (ROUTED to corpus-blocked roster row 23: `redeemer` — Psalms 130:7-8 "Abundant redemption is with him. He will redeem Israel from all their sins." — the abundant-redemption witness; joins the Pss 49, 78, 107, 111 routings from chunks 2–4.)

## Psalms 131
1. Existing tags (book doc): `contentment`, `peace-of-god`, `hope-in-god` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar. `humble-exaltation` considered and NOT added: the psalm depicts practiced humility ("my heart isn't arrogant, nor my eyes lofty", 131:1) but carries no exaltation reversal — half the concept's substance is absent.
3. Anchor-extension candidates: `contentment` | Psalms 131:1-2 | "Surely I have stilled and quieted my soul, like a weaned child with his mother" | w=0.8 — the pack has NO OT anchor at all (1 Tim 6; Phil 4:11-13; Heb 13:5; Matt 6; Prov 22:7, 30:8; 2 Cor 10:12); the weaned-child stillness is Scripture's quietest contentment picture and the display tag rests on it.
4. Lexicon candidates: None — checked and NOT proposed: "like a weaned child" and "quieted my soul" are verbatim WEB (already-lands rule).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 131.

## Psalms 132
1. Existing tags (book doc): `covenant`, `worship`, `gods-faithfulness`, `oaths-and-vows`, `zion-city-of-god`, `messianic-prophecy` — 6 (soft cap).
2. Applied-tag deltas: No changes — all 6 independently clear the bar (`messianic-prophecy` on the attributed Acts 2:30 citation per the standing rule, batch-3 Decisions #15). `the-house-of-god` (adopted id) considered and NOT added: the dwelling-place vow and the LORD's chosen resting place (132:2-8, 13-14) are genuinely present, but the sitting `worship` and `zion-city-of-god` justifications already quote those spans — duplicate register on the same verses at the soft cap; routed engine-side instead (below).
3. Anchor-extension candidates: `covenant` | Psalms 132:11-12 | "The LORD has sworn to David in truth. He will not turn from it: "I will set the fruit of your body on your throne." | w=0.75 — the pack anchors 2 Samuel 7:12-16 but not the Psalter's fullest restatement of the Davidic oath with its two-sided condition. `messianic-prophecy` | Psalms 132:11, 17 | "I will make the horn of David to bud there. I have ordained a lamp for my anointed." | w=0.7 — Peter cites the throne oath as fulfilled in the resurrection of Christ (Acts 2:30 — attributed citation per the standing rule); the pack's Psalter anchors (16:10; 22:1-18; 40:6-8; 110:1-4) lack Ps 132; joins the chunks 1–4 class (Pss 2, 45, 69, 102, 118). `the-house-of-god` | Psalms 132:4-5, 13-14 | "until I find out a place for the LORD, a dwelling for the Mighty One of Jacob." … "For the LORD has chosen Zion. He has desired it for his habitation." | w=0.7 — the pack's own lexicon phrase "gods dwelling place" names this text; no Psalter anchor beyond 27:4.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 (no ceiling hit).
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 132 (the Davidic-covenant psalm — notable; the §3 proposals begin closing it). (ROUTED to corpus-blocked roster row 44: `davidic-covenant` — Psalms 132:11-12 "The LORD has sworn to David in truth. He will not turn from it: "I will set the fruit of your body on your throne." — the Psalter's fullest Davidic-oath restatement with the sons' condition (132:12); joins the Ps 18:50 (chunk 1) and Ps 89 (chunk 3) routings.) (ROUTED to corpus-blocked roster row 46: `the-lords-anointed` — Psalms 132:10, 17 "don't turn away the face of your anointed one." / "I have ordained a lamp for my anointed." — supporting "his anointed" witnesses only, per the chunk-1 Ps 2 precedent (the row's minting register stays the 1 Samuel touch-not narrative); joins the Pss 2, 18, 20, 28, 84, 89, 105 routings.)

## Psalms 133
1. Existing tags (book doc): `harmony-with-others`, `blessing` — 2.
2. Applied-tag deltas: No changes — both clear the bar. The pass's `zion-city-of-god` skip stands (one mention, 133:3; no new evidence).
3. Anchor-extension candidates: `harmony-with-others` | Psalms 133:1 | "See how good and how pleasant it is for brothers to live together in unity!" | w=0.8 — the display tag's own ground, yet the pack has NO OT anchor (Rom 12:18; Eph 4:2-3; Rom 14:19; 2 Tim 2:24); Scripture's unity psalm belongs in it. Cross-note for the curator: `unity-of-the-church` already anchors 133:1 (w=0.65) — two packs may hold the verse (distinct registers: everyday peace-with-others vs church unity), but the curator should fixture the routing rather than let the church pack own the only copy.
4. Lexicon candidates: `harmony-with-others` | dwell together in unity | queries: "how good and pleasant it is for brethren to dwell together in unity", "brothers dwell in unity", "god's people live together in unity" — the KJV-remembered "brethren"/"dwell" phrasing has NO lexical match in the WEB psalm ("for brothers to live together in unity"), a genuine translation-gap row riding the proposed 133:1 anchor.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: one finding, declined (recorded, not silent) — `unity-of-the-church` anchors 133:1 (w=0.65) with no display tag: the id names the church, a later-revelation category the no-read-back rule keeps off an OT psalm (the Ps 139 `identity-in-christ` class); `harmony-with-others` carries the display register and the anchor serves church-unity queries.

## Psalms 134
1. Existing tags (book doc): `worship`, `praise`, `benediction` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (`benediction` a ratified PR #43 use, §11.5).
3. Anchor-extension candidates: `benediction` | Psalms 134:3 | "May the LORD bless you from Zion, even he who made heaven and earth." | w=0.5 — the collection-closing spoken blessing; pairs with the 128:5-6 proposal (the pack's OT side is Numbers 6:24-26 alone).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 134.

## Psalms 135
1. Existing tags (book doc): `praise`, `providence`, `worship`, `idolatry` — 4.
2. Applied-tag deltas: ADD `no-other-god` — the psalm argues the LORD's sole supremacy positively ("For I know that the LORD is great, that our Lord is above all gods.", 135:5; "Whatever the LORD pleased, that he has done", 135:6) and negatively in the idol polemic ("The idols of the nations are silver and gold, the work of men's hands." … "Those who make them will be like them, yes, everyone who trusts in them.", 135:15-18) — the same rivals'-emptiness-plus-sole-reality pairing behind the pass's Ps 96 both-tags call and chunk 4's Ps 115 ADD; applied beside `idolatry` per that precedent. KEEP the other 4.
3. Anchor-extension candidates: `idolatry` | Psalms 135:15-18 | "The idols of the nations are silver and gold, the work of men's hands." | w=0.75 — the second of the Psalter's two fullest idol polemics; the pack has no Psalter anchor at all (joins chunk 4's Ps 115:3-8 proposal). `providence` | Psalms 135:6-7 | "Whatever the LORD pleased, that he has done, in heaven and in earth, in the seas and in all deeps." | w=0.7 — the whatever-he-pleases sovereignty statement; the display tag rests on it and the pack lacks it. `no-other-god` | Psalms 135:5 | "For I know that the LORD is great, that our Lord is above all gods." | w=0.6 — beside the pack's existing 96:5 anchor.
4. Lexicon candidates: None ("they have mouths, but they can't speak" is near-verbatim across 115/135 and lands lexically).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (5 post-delta).
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 135. (ROUTED to corpus-blocked roster row 26: `inheritance` — Psalms 135:12 "and gave their land for a heritage, a heritage to Israel, his people." — an in-corpus land-inheritance witness for that row's deferred design (first feed of row 26 by this sweep; the display-side refs already ride the consolidated plan's §A.20 appends); Ps 136:21-22 joins from the next entry.)

## Psalms 136
1. Existing tags (book doc): `thanksgiving`, `gods-love`, `creation`, `gods-faithfulness`, `gods-provision` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar (the twenty-six-fold refrain psalm). The pass's `inheritance` skip stands (two refrain verses inside the recital; no new evidence).
3. Anchor-extension candidates: `gods-love` | Psalms 136:1-26 | "for his loving kindness endures forever" | w=0.75 — the refrain itself, twenty-six times; the pack's only Psalter anchor is 147:11, and its own lexicon phrase "steadfast love of the lord" is this refrain's remembered form. `thanksgiving` | Psalms 136:1-3, 26 | "Give thanks to the LORD, for he is good, for his loving kindness endures forever." | w=0.7 — the Great Hallel's give-thanks frame; the pack's Psalter anchors are 100:4 and 92:1 only.
4. Lexicon candidates: None new — cross-ref: chunk 4's Ps 118 `thanksgiving` lexicon row ("his mercy endures forever", KJV/NKJV-remembered vs WEB "loving kindness") anticipated this psalm by name; Ps 136:1-26 joins that row's refs as its densest witness (twenty-six refrain instances), with the same curator caveat carried.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — NOTABLE inverse seam: no engine anchor at all on Ps 136 (the Great Hallel; the §3 proposals begin closing it). (ROUTED to corpus-blocked roster row 32: `deliverance` — Psalms 136:23-24 "who remembered us in our low estate" … "and has delivered us from our adversaries" — the delivered-from-adversaries refrain witness; joins the chunks 1–4 routings and this chunk's Ps 124.) (Row 26 join: Psalms 136:21-22 "and gave their land as an inheritance" … "even a heritage to Israel his servant" — joins the Ps 135:12 routing above.)

## Psalms 137
1. Existing tags (book doc): `divine-judgment`, `lament`, `sojourners-and-strangers`, `zion-city-of-god`, `vengeance` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar, each inside the standing imprecatory frame (137:7-9 described, never endorsed — the violated handing repayment to the Judge, "as you have done to us", exactly as batch-3 Decisions #9 records; the pastoral-grief register stays excluded per the register ruling, which names this psalm).
3. Anchor-extension candidates: `lament` | Psalms 137:1-4 | "By the rivers of Babylon, there we sat down. Yes, we wept, when we remembered Zion." | w=0.75 — the Psalter's defining communal exile lament; the pack has no Psalm 137 anchor (its communal texts stop at 2 Sam 1:17-27) and the §A.1 row already names 137:1-4.
4. Lexicon candidates: `sojourners-and-strangers` | strange land | queries: "how can we sing the lord's song in a strange land", "singing the lord's song in a strange land", "psalm about being in a strange land" — the KJV-remembered "strange land" has NO lexical match in the WEB psalm ("How can we sing the LORD's song in a foreign land?", 137:4, the pack's own anchor), a genuine translation-gap row.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`sojourners-and-strangers` 137:4 w=0.75 — tagged). (ROUTED to corpus-blocked roster row 45: `exile-and-captivity` — Psalms 137:1-4 "By the rivers of Babylon, there we sat down. Yes, we wept, when we remembered Zion." … "How can we sing the LORD's song in a foreign land?" — the Psalter's defining exile text, FIRST feed of row 45 by this sweep; the row's fold-vs-separate routing stays Jesse's call, nothing prejudged.) (ROUTED to corpus-blocked roster row 14: `gloating-over-downfall` — Psalms 137:7 "Remember, LORD, against the children of Edom in the day of Jerusalem, who said, "Raze it! Raze it even to its foundation!"" — Edom's gloat over Jerusalem's fall, the Obadiah 1:12 register's in-Psalter witness; supporting ref joining the Pss 35, 70 routings from chunks 2–3.)

## Psalms 138
1. Existing tags (book doc): `thanksgiving`, `prayer`, `gods-faithfulness`, `humble-exaltation` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar. The pass's `trustworthiness-of-scripture` skip stands (one clause, 138:2; no new evidence).
3. Anchor-extension candidates: `humble-exaltation` | Psalms 138:6 | "For though the LORD is high, yet he looks after the lowly; but he knows the proud from afar." | w=0.75 — the high-God-regards-the-lowly statement; the pack's only Psalter anchor is 75:6-7. `gods-faithfulness` | Psalms 138:8 | "The LORD will fulfill that which concerns me. Your loving kindness, LORD, endures forever. Don't forsake the works of your own hands." | w=0.7 — the pack has NO Psalter anchor at all; the display tag rests on this verse (joins chunk 3's Pss 77/89 and chunk 4's Pss 100/106 proposals).
4. Lexicon candidates: `gods-faithfulness` | perfect that which concerns me | queries: "the lord will perfect that which concerns me", "god will fulfill his purpose for me", "god won't abandon the work of his hands" — the KJV-remembered "perfect" and ESV-remembered "purpose" phrasings have NO lexical match in the WEB psalm ("The LORD will fulfill that which concerns me", 138:8), a genuine translation-gap row riding the proposed 138:8 anchor.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 138. (ROUTED to corpus-blocked roster row 18: `wholehearted-devotion` — Psalms 138:1 "I will give you thanks with my whole heart." — a whole-heart witness for that row's recorded loving-god/seeking-god lexicon-extension resolution; joins the Ps 86 (chunk 3) and Pss 111, 119 (chunk 4) routings.) (ROUTED to corpus-blocked roster row 40: `gentile-inclusion` — Psalms 138:4-5 "All the kings of the earth will give you thanks, LORD, for they have heard the words of your mouth." — an all-kings-worship witness of the class the row's curator holds; joins the Ps 87 (chunk 3) and Ps 117 (chunk 4) routings; supporting refs only, the row's core texts remain Acts 10-11; 15.)

## Psalms 139
1. Existing tags (book doc): `presence-of-god`, `creation`, `providence`, `pastoral-pregnancy-and-child-loss`, `testing`, `guidance`, `running-from-god`, `design-in-creation` — 8 (HARD CEILING; baseline).
2. Applied-tag deltas: No changes — every sitting tag was re-checked and independently clears the bar (the tag-pass and PR #51 records both already audited this psalm at 8 with no yield needed; 139:19-22's fierce turn stays described, never endorsed — hatred laid out before the searcher of hearts rather than acted out, per the standing imprecatory rule).
3. Anchor-extension candidates: `testing` | Psalms 139:23-24 | "Search me, God, and know my heart. Try me, and know my thoughts." | w=0.85 — first-order coverage gap: the invited-examination prayer is the display tag's own ground and the concept's canonical volunteer text, yet the pack's Psalter anchor is 66:10 only ("search me o god" queries currently have no Ps 139 concept path).
4. Lexicon candidates: None — checked and NOT proposed: "fearfully and wonderfully made", "search me, God, and know my heart", "hem me in" are all verbatim WEB (already-lands rule).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD-CEILING-8 (baseline) — marked for the per-verse refinement pass (the psalm's four movements — searched/known 1-6, inescapable presence 7-12, formed in the womb 13-18, the fierce turn and re-invited search 19-24 — give the refinement pass natural verse ranges).
8. Decisions record: Cap-full seam yield (recorded, not silent) — `thought-life` anchors 139:23-24 (w=0.85) with no display tag: the chapter stands at the hard ceiling and the candidate would duplicate the sitting `testing` justification's own span (invited examination of thoughts) — same-verse duplicate register, and it does not outrank any sitting tag under main-themes-first; it yields (the chunk-4 Ps 102/119 cap-full class; the anchor serves thought-life queries). Two further seam findings, declined (recorded, not silent): `identity-in-christ` anchors 139:13-14 (w=1.0) — a later-revelation category the no-read-back rule keeps off an OT psalm (the standing project-wide class); `pastoral-hope-in-despair` anchors 139:13-14 (w=0.6) — the psalm is a meditation on being known, not a despair crisis; register fail (the harm-gated pack's anchor serves its fixtures; display follows register). Seam check otherwise clean (`presence-of-god` 139:7-10 w=1.0, `creation` 139:13-14 w=0.9, `design-in-creation` 139:13-14 w=0.75, `pastoral-pregnancy-and-child-loss` 139:13-14 w=0.88, `providence` 139:16 w=0.7 — all tagged). (ROUTED to corpus-blocked roster row 6: `god-looks-at-the-heart` — Psalms 139:1, 23-24 "LORD, you have searched me, and you know me." / "Search me, God, and know my heart. Try me, and know my thoughts." — the Psalter's fullest heart-searching witness for that row's deferred design; joins the Pss 7, 11, 17, 26 (chunk 1), 33, 44 (chunk 2), 94 (chunk 4) routings.) (Corpus-blocked roster row 34 (`running-from-god`) needs NO routing: the row already records Ps 139:7-12 as its lone in-corpus witness — nothing new to supply; the display tag stands on the adopted id.)

## Psalms 140
1. Existing tags (book doc): `gods-protection`, `prayer`, `pastoral-refuge-and-justice` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar (an individual hunted-man lament — the pastoral register ruling's kept class, batch-3 Decisions #5). The pass's `slander-and-false-accusation` skip stands (two mentions in a violence psalm; no new evidence). `vengeance` considered and NOT added: the boomerang petitions (140:9-11 — "let the mischief of their own lips cover them") are three verses subordinate to the rescue plea, thinner than the id's homes (109, 137, 149); described, not endorsed, either way.
3. Anchor-extension candidates: `pastoral-refuge-and-justice` | Psalms 140:12 | "I know that the LORD will maintain the cause of the afflicted, and justice for the needy." | w=0.7 — the hunted man's settled certainty; the display tag rests on it and the pack's Psalter anchors (82:3-4; 10:14, 17-18; 11:5; 9:9-10; 27:10; 34:18) lack Psalm 140.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 140.

## Psalms 141
1. Existing tags (book doc): `prayer`, `taming-the-tongue`, `refuge-in-trouble` — 3.
2. Applied-tag deltas: No changes — all 3 clear the bar.
3. Anchor-extension candidates: `prayer` | Psalms 141:2 | "Let my prayer be set before you like incense; the lifting up of my hands like the evening sacrifice." | w=0.7 — the prayer-as-incense image (the register Revelation 5:8/8:3-4 later picks up); the pack's only Psalter anchor is 86:5-7 and it has no evening-prayer text (companions the chunk-1 morning-prayer proposal at 5:1-3).
4. Lexicon candidates: `prayer` | let my prayer rise like incense | queries: "let my prayer rise before you as incense", "prayer like incense bible verse", "evening prayer psalm" — the liturgy-remembered "rise" phrasing has NO lexical match in the WEB psalm ("Let my prayer be set before you like incense", 141:2), a genuine remembered-phrasing row riding the proposed anchor.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: one finding, declined (recorded, not silent) — `receiving-correction` anchors 141:5 (w=0.7) with no display tag: "Let the righteous strike me, it is kindness; let him reprove me, it is like oil on the head" is one verse inside an evening-prayer psalm — thin single-verse presence; the anchor serves correction queries (`taming-the-tongue` 141:3 w=1.0 is tagged — otherwise clean).

## Psalms 142
1. Existing tags (book doc): `prayer`, `loneliness`, `refuge-in-trouble`, `lament` — 4.
2. Applied-tag deltas: No changes — all 4 clear the bar (cave-superscription used exactly as far as it states, per the standing attribution rule).
3. Anchor-extension candidates: `loneliness` | Psalms 142:4 | "there is no one who is concerned for me. Refuge has fled from me. No one cares for my soul." | w=0.9 — Scripture's starkest no-one-cares verse; the display tag rests on it and the pack's Psalter anchors (27:10; 68:6) lack it (joins the chunks 2–4 chain: 38:11, 88:8, 102:6-7). `lament` | Psalms 142:1-4 | "I pour out my complaint before him. I tell him my troubles." | w=0.7 — the pack's own lexicon phrase "pour out your heart to god" names this register (its 62:8 anchor's twin); the §A.1 row already carries 142:1-4.
4. Lexicon candidates: None — checked and NOT proposed: "no one cares for my soul" is verbatim WEB (already-lands rule).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 142.

## Psalms 143
1. Existing tags (book doc): `prayer`, `guidance`, `hunger-for-god`, `pastoral-hope-in-despair`, `trust-in-god` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar (an individual overwhelmed-spirit prayer — the pastoral register's kept class, batch-3 Decisions #5). The pass's skips stand: `lament` 143 (the despair register is carried by `pastoral-hope-in-despair`) and `remembrance-and-memorials` 143:5 (one verse; home Ps 105) — no new evidence for either. The NT's use of 143:2 (Rom 3:20) stays signposted only, per Decisions #15.
3. Anchor-extension candidates: `guidance` | Psalms 143:8, 10 | "Cause me to know the way in which I should walk, for I lift up my soul to you." … "Teach me to do your will, for you are my God. Your Spirit is good. Lead me in the land of uprightness." | w=0.8 — the Psalter's fullest teach-me-your-way prayer; the pack's Psalter anchors (32:8; 25:4-5; 37:23; 119:105) lack it and its own lexicon phrase "show me the way to go" names 143:8's register. `hunger-for-god` | Psalms 143:6 | "My soul thirsts for you, like a parched land." | w=0.75 — the parched-land thirst; the pack's only Psalter anchor is 42:1-2 (joins chunk 3's 63:1 proposal).
4. Lexicon candidates: None — checked and NOT proposed: "show me the way to go" and "teach me to do your will" phrasings — the first already sits in the `guidance` lexicon, the second is verbatim WEB (already-lands rule, twice).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 143. (ROUTED to corpus-blocked roster row 8: `gods-holy-name` — Psalms 143:11 "Revive me, LORD, for your name's sake." — a for-his-name's-sake witness; joins the Ps 31 (chunk 2), Ps 79 (chunk 3), Pss 106, 109 (chunk 4) routings.)

## Psalms 144
1. Existing tags (book doc): `refuge-in-trouble`, `gods-protection`, `praise`, `blessing`, `mortality` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar (the 144:12-15 flourishing stays inside the batch-3 Decisions #11 prosperity guardrail — a covenant picture prayed for, "not a formula owed to anyone"). Corpus-blocked roster row 30 (`warfare`) checked and deliberately NOT routed: 144:1's "who trains my hands to war" is the God-equips-the-king register, not the row's Deuteronomy war-regulation register — register mismatch, recorded (the row's own bare-"warfare" collision warning weighs the same way).
3. Anchor-extension candidates: `refuge-in-trouble` | Psalms 144:1-2 | "my loving kindness, my fortress, my high tower, my deliverer, my shield, and he in whom I take refuge" | w=0.7 — the refuge-name cascade, Psalm 18:1-2's doublet register (joins chunk 1's 18:1-2 proposal; the pack lacks both).
4. Lexicon candidates: None new — cross-ref: 144:9 "I will sing a new song to you, God" is already listed in chunk 2's Ps 33 `praise` sing-a-new-song lexicon row (its ref list names 144:9); nothing to add.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 144. (ROUTED to corpus-blocked roster row 19: `vanity-of-life` — Psalms 144:4 "Man is like a breath. His days are like a shadow that passes away." — the breath-and-shadow vanity witness; joins the Pss 39, 62, 78, 89 routings from chunks 2–3.)

## Psalms 145
1. Existing tags (book doc): `praise`, `gods-love`, `gods-provision`, `gods-faithfulness`, `prayer`, `god-reigns`, `slow-to-anger` — 7.
2. Applied-tag deltas: No changes — all 7 independently clear the bar (the Psalter's last acrostic; `slow-to-anger` and `god-reigns` are the 2026-08-25 pass's own additions, re-checked). The pass's `loving-god` skip stands (145:20 one clause; the declaration register's home is Ps 116; no new evidence).
3. Anchor-extension candidates: `god-reigns` | Psalms 145:11-13 | "Your kingdom is an everlasting kingdom. Your dominion endures throughout all generations." | w=0.75 — the everlasting-kingdom acclamation; the pack's Psalter anchors (10:16; 24:7-10; 93:1-2; 95:3; 96:10; 146:10) lack it, and the display tag rests on it (OT enthronement register kept per the consolidated plan §C). `gods-provision` | Psalms 145:15-16 | "The eyes of all wait for you. You give them their food in due season. You open your hand, and satisfy the desire of every living thing." | w=0.8 — the open-hand provision text; the pack's Psalter anchors are 23:1 and 34:10 only. `prayer` | Psalms 145:18-19 | "The LORD is near to all those who call on him, to all who call on him in truth." | w=0.7 — the near-to-all-who-call promise the display tag rests on; the pack's only Psalter anchor is 86:5-7.
4. Lexicon candidates: None — checked and NOT proposed: "the LORD is near to all those who call on him", "slow to anger", "you open your hand" are all verbatim WEB (already-lands rule).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: AT 7 (dense — flagged; no ceiling hit).
8. Decisions record: None. Seam check: clean (`slow-to-anger` 145:8 w=0.85 — tagged).

## Psalms 146
1. Existing tags (book doc): `praise`, `hope-in-god`, `trust-in-god`, `justice-and-oppression`, `god-reigns` — 5.
2. Applied-tag deltas: ADD `trusting-in-man` — seam catch: the pack's own anchor is this psalm (146:3-4, w=0.95) and its own lexicon phrase "do not put your trust in princes" is this verse: "Don't put your trust in princes, in a son of man in whom there is no help. His spirit departs, and he returns to the earth. In that very day, his thoughts perish." (146:3-4) — the warning register (misplaced trust exposed), distinct from the sitting `trust-in-god`'s positive redirect on the following verses (146:5-6), per the both-tags ruling; the Pss 20/33/118 class (chunks 1, 2, 4). KEEP the other 5. The pass's `mortality` skip stands (146:4 one verse inside the princes warning; no new evidence) and its `zion-city-of-god` skip stands (vocative mention, 146:10).
3. Anchor-extension candidates: None — the ADD rides the pack's existing 146:3-4 anchor; engine coverage of the psalm is already dense (146:5, 7, 9, 10 anchored across four more packs).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT-CAP-6 post-delta (no ceiling hit).
8. Decisions record: None. Seam check: one catch (the `trusting-in-man` ADD above) and one finding, declined (recorded, not silent) — `care-for-widows` anchors 146:9 (w=1.0 lead) with no display tag: "He upholds the fatherless and widow" is a single list-clause inside the sitting `justice-and-oppression` justification's 146:7-9 span — the 2026-08-25 pass's own recorded skip (duplicate register), re-checked and standing (the chunk-3 Ps 68:5 precedent; the anchor serves widow queries). Otherwise clean (`hope-in-god` 146:5 w=0.65, `justice-and-oppression` 146:7 w=0.95, `god-reigns` 146:10 w=0.9 — all tagged).

## Psalms 147
1. Existing tags (book doc): `praise`, `gods-provision`, `humble-exaltation`, `providence`, `zion-city-of-god`, `restoration-of-israel`, `fear-of-the-lord` — 7.
2. Applied-tag deltas: No changes — all 7 independently clear the bar (`restoration-of-israel` and `fear-of-the-lord` are the 2026-08-25 passes' own additions, re-checked). `power-of-gods-word` considered and NOT added: 147:15-18's running, melting word is genuinely the pack's efficacy register (the log's own cross-note assigns 147:15 there), but the sitting `providence` justification already quotes the same weather-by-his-word span — duplicate register on the same verses at 7 tags; routed engine-side instead (below).
3. Anchor-extension candidates: `power-of-gods-word` | Psalms 147:15, 18 | "He sends out his commandment to the earth. His word runs very swiftly." … "He sends out his word, and melts them." | w=0.7 — the word's speed and efficacy in creation; the pack's only Psalter anchor is 119:89, and the tag-gaps cross-note routes exactly these verses to this pack (not `trustworthiness-of-scripture`, whose 147 skip stands).
4. Lexicon candidates: None — checked and NOT proposed: "he counts the number of the stars" and "heals the broken in heart" are verbatim WEB (already-lands rule; the brokenhearted phrasing family already sits in `pastoral-near-to-the-brokenhearted`'s lexicon with its 147:3 anchor).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: AT 7 (dense — flagged; no ceiling hit).
8. Decisions record: Three seam findings, declined (recorded, not silent) — `gods-love` anchors 147:11 (w=0.75) with no display tag: "The LORD takes pleasure in those who fear him, in those who hope in his loving kindness." is the sitting `fear-of-the-lord` justification's own 147:10-11 span — same-verse duplicate register at 7 tags, and it does not outrank a sitting tag under main-themes-first (the anchor serves "god delights in you" queries). `pastoral-near-to-the-brokenhearted` (147:3, w=0.9) and `pastoral-betrayal-and-marriage-crisis` (147:3, w=0.7) both anchor a communal Zion hymn with no display tag — the standing register ruling, which names Psalm 147 explicitly (batch-3 Decisions #5): search anchors serve queries; display tags follow the register. Otherwise clean (`praise` 147:1 w=0.7, `restoration-of-israel` 147:2 w=0.8, `zion-city-of-god` 147:12-14 w=0.8 — all tagged).

## Psalms 148
1. Existing tags (book doc): `praise`, `creation` — 2.
2. Applied-tag deltas: No changes — both clear the bar. The pass's `angels` skip stands (148:2 a praise-catalog list item; no new evidence). `creation-testifies` considered and NOT added: the psalm SUMMONS creation to praise, it does not present creation as testimony to the observer — register mismatch with that pack's Ps 19 design.
3. Anchor-extension candidates: `creation` | Psalms 148:5-6 | "Let them praise the LORD's name, for he commanded, and they were created. He has also established them forever and ever." | w=0.7 — the commanded-into-being ground of the whole summons; the pack's Psalter anchors (19:1; 90:2; 139:13-14) lack it. `praise` | Psalms 148:1-13 | "Praise the LORD from the heavens!" … "Praise the LORD from the earth" | w=0.7 — the top-to-bottom cosmic summons; the pack anchors 150:1-6 and 147:1 but not the catalog psalm between them.
4. Lexicon candidates: None ("praise him, sun and moon" is verbatim WEB — lands lexically).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 148.

## Psalms 149
1. Existing tags (book doc): `praise`, `joy-in-the-lord`, `humble-exaltation`, `divine-judgment`, `vengeance` — 5.
2. Applied-tag deltas: No changes — all 5 clear the bar (`vengeance` a 2026-08-25 pass addition inside the batch's imprecatory-policy frame; 149:6-9's two-edged-sword commission stays described as the psalm's own assignment under its King, executing "the written judgment", without generalizing the warrant beyond the text — batch-3 Decisions #14, re-checked).
3. Anchor-extension candidates: `humble-exaltation` | Psalms 149:4 | "For the LORD takes pleasure in his people. He crowns the humble with salvation." | w=0.7 — the crowned-humble reversal the display tag rests on; the pack's only Psalter anchor is 75:6-7 (companions the 138:6 proposal above).
4. Lexicon candidates: None new — cross-ref: 149:1 "Sing to the LORD a new song" is already listed in chunk 2's Ps 33 `praise` sing-a-new-song lexicon row (its ref list names 149:1); nothing to add.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean — inverse seam noted: no engine anchor on Ps 149.

## Psalms 150
1. Existing tags (book doc): `praise`, `worship` — 2.
2. Applied-tag deltas: No changes — both clear the bar; nothing else in the vocabulary is substantially present in six verses of pure summons (an honest 2-tag close to the Psalter).
3. Anchor-extension candidates: None — the `praise` pack's lead anchor IS 150:1-6 (w=1.0) and `worship`'s instrument register is served by its own anchors; no gap.
4. Lexicon candidates: None — checked and NOT proposed: "let everything that has breath praise the LORD" already sits in the `praise` lexicon ("let everything that has breath praise him") and the verse is verbatim WEB (already-lands rule, twice over).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. Seam check: clean (`praise` 150:1-6 w=1.0 — tagged, the pack's lead anchor).

---

### Block survival audit (CONVENTIONS §9) — Psalms 121–150 block, 2026-08-26

Written as one atomic end-of-file append; post-write the file was re-read, pre-existing bytes (header + the Psalms 1–30, 31–60, 61–90, and 91–120 blocks) verified unchanged, and this block verified present exactly once. Block tallies: **3 ADDs** (Ps 123 `mercy`; Ps 135 `no-other-god`; Ps 146 `trusting-in-man`) · **0 DROPs** · 119 KEEPs (all baseline tags re-checked against the WEB text) · **45 anchor-extension candidates** (Pss 121, 122 ×2, 123, 124, 125 ×2, 126 ×2, 127, 128 ×2, 129, 130 ×3, 131, 132 ×3, 133, 134, 135 ×3, 136 ×2, 137, 138 ×2, 139, 140, 141, 142 ×2, 143 ×2, 144, 145 ×3, 147, 148 ×2, 149) · **6 lexicon candidates** (Ps 121 "he who watches over you"; Ps 127 "children are a gift from god"; Ps 133 "dwell together in unity"; Ps 137 "strange land"; Ps 138 "perfect that which concerns me"; Ps 141 "let my prayer rise like incense" — all six are KJV/NIV/liturgy-remembered phrasings mechanically verified ABSENT from the WEB text; the further candidates checked and NOT proposed under the already-lands rule are recorded per psalm) · **0 new-concept candidates** · **0 decline overturns** · **13 corpus-blocked routings** across roster rows 6 (Ps 139), 8 (Ps 143), 14 (Ps 137), 18 (Ps 138), 19 (Ps 144), 23 (Ps 130), 26 (Pss 135–136 — FIRST feed of row 26), 32 (Pss 124, 136), 40 (Ps 138), 44 (Ps 132), 45 (Ps 137 — FIRST feed of row 45), 46 (Ps 132) — rows 6, 8, 14, 18, 19, 23, 32, 40, 44, 46 join refs from chunks 1–4; two rows deliberately NOT routed with reasons recorded in-entry: row 30 at Ps 144:1 (register mismatch) and row 34 at Ps 139 (row already records 139:7-12; nothing new) · **Seam-check catches:** 1 untagged engine-anchor seam became an ADD (Ps 146 `trusting-in-man` — the pack's own 146:3-4 anchor and lexicon phrase, the Pss 20/33/118 class); 9 further anchor-without-tag findings recorded and declined per-psalm (133 `unity-of-the-church` [read-back]; 139 `thought-life` [cap-full yield, recorded], `identity-in-christ` [read-back], `pastoral-hope-in-despair` [register]; 141 `receiving-correction` [thin]; 146 `care-for-widows` [standing pass skip]; 147 `gods-love` [same-span duplicate], `pastoral-near-to-the-brokenhearted` + `pastoral-betrayal-and-marriage-crisis` [standing register ruling]) — none silent · **Inverse seams:** NINETEEN psalms in this range carry NO engine anchor at all (123, 124, 125, 126, 128, 129, 130, 131, 132, 134, 135, 136, 138, 140, 142, 143, 144, 148, 149) — most notably Ps 130 (the De Profundis), Ps 132 (the Davidic-covenant psalm), and Ps 136 (the Great Hallel); the §3 proposals begin closing them · ceiling flags: Ps 139 at HARD-CEILING-8 (baseline; marked for per-verse refinement with suggested movement ranges); Pss 145 and 147 at 7 (flagged as dense); Ps 132 at soft cap 6, joined post-delta by Ps 146; no psalm in 121–150 is subdivided in the book doc · cross-refs to earlier chunks: Ps 130 `hope-in-god` proposal joins chunk 3's 62:5-6; Ps 132 `messianic-prophecy` proposal joins the chunks 1–4 class (2, 45, 69, 102, 118); Ps 135 `idolatry` proposal joins chunk 4's Ps 115; Ps 136 refrain joins chunk 4's Ps 118 `thanksgiving` lexicon row (named there in advance); Ps 138 `gods-faithfulness` proposal joins chunks 3–4's 77/89/100/106; Ps 142 `loneliness` proposal joins chunks 2–4's 38:11/88:8/102:6-7; Ps 143 `hunger-for-god` proposal joins chunk 3's 63:1; Ps 144 `refuge-in-trouble` proposal joins chunk 1's 18:1-2 (doublet register); Pss 144:9/149:1 new-song refs already ride chunk 2's Ps 33 lexicon row; Ps 141 `prayer` proposal companions chunk 1's 5:1-3 (evening/morning pair); Ps 108 in chunk 4 already cross-references chunk 2's Pss 57/60 doubles (the 60:5-12 = 108:6-13 note in chunk 2's Ps 60 entry is discharged there — recorded here because chunk 2 addressed the note to "the Psalm 108 worker," and this block confirms nothing in 121–150 re-opens it).

---

### BOOK ROLL-UP — Psalms, whole-Psalter totals across chunks 1–5 (sweep complete, 2026-08-26)

Summed from the five blocks' own recorded tallies (chunk 1: Pss 1–30; chunk 2: 31–60; chunk 3: 61–90; chunk 4: 91–120; chunk 5: 121–150).

**Totals by candidate class:**
- Applied-tag ADDs: **25** (8 + 6 + 3 + 5 + 3) — chunk 1: Ps 5 `divine-judgment`, Ps 10 `justice-and-oppression`, Ps 15 `integrity`, Ps 20 `trusting-in-man`, Ps 22 `nations-and-peoples`, Ps 23 `shepherds-and-the-flock`, Ps 25 `fear-of-the-lord`, Ps 26 `integrity`; chunk 2: Ps 32 `confession-of-sin`, Ps 33 `trusting-in-man`, Ps 34 `fear-of-the-lord`, Ps 49 `money-and-possessions`, Ps 50 `empty-worship`, Ps 55 `betrayal`; chunk 3: Ps 72 `praying-for-leaders`, Ps 86 `slow-to-anger`, Ps 89 `davidic-covenant`; chunk 4: Ps 101 `integrity`, Ps 104 `leviathan-and-behemoth`, Ps 106 `idolatry`, Ps 115 `no-other-god`, Ps 118 `trusting-in-man`; chunk 5: Ps 123 `mercy`, Ps 135 `no-other-god`, Ps 146 `trusting-in-man`.
- DROPs: **1** (Ps 34 `angels` — chunk 2's recorded §11.6 ceiling yield, with anchor-extension offset; reversible). KEEPs: **667** (117 + 134 + 141 + 156 + 119; 667 + 1 drop = the book doc's 668 baseline tags, all re-checked).
- Anchor-extension candidates: **185** (20 + 17 + 39 + 64 + 45).
- Lexicon candidates: **33** (8 + 7 + 4 + 8 + 6) — the dominant pattern across chunks 2–5 being KJV/NIV/liturgy-remembered phrasings mechanically verified absent from the WEB text.
- New-concept candidates: **1** (`atheism-and-unbelief`, chunk 1 at Ps 14; chunk 2's Ps 53 recorded as the doublet cross-ref, no second mint).
- Decline-overturn proposals: **0** across all five chunks.
- Corpus-blocked routings: **62** (9 + 11 + 13 + 16 + 13).

**Corpus-blocked rows fed by this sweep (18 rows), with feeding chunks:** row 1 `sacrifice-and-atonement` (c3); row 4 `persecuted-for-gods-word` (c4); row 6 `god-looks-at-the-heart` (c1, c2, c4, c5); row 7 `god-relents` (c4); row 8 `gods-holy-name` (c2, c3, c4, c5); row 14 `gloating-over-downfall` (c1*, c2, c3, c5 — *c1 named in the fed-rows handoff; refs at Pss 35/70/137); row 18 `wholehearted-devotion` (c3, c4, c5); row 19 `vanity-of-life` (c2, c3, c4, c5); row 23 `redeemer` (c2, c3, c4, c5); row 26 `inheritance` (c5 only); row 32 `deliverance` (c1, c2, c3, c4, c5 — the most-fed row, 12 psalms); row 36 `zeal-for-god` (c3, c4); row 40 `gentile-inclusion` (c3, c4, c5); row 44 `davidic-covenant` (c1, c3, c5); row 45 `exile-and-captivity` (c5 only); row 46 `the-lords-anointed` (c1, c3, c4, c5); row 48 `romantic-love-and-intimacy` (c2); row 50 `leviathan-and-behemoth` (c4). Two deliberate non-routings recorded with reasons: row 29 `peace-among-nations` at Ps 120:7 (c4 — register mismatch) and row 30 `warfare` at Ps 144:1 (c5 — register mismatch); row 34 `running-from-god` needed no feed (its lone in-corpus witness Ps 139:7-12 was already on the roster).

**Full ceiling-flag list (post-delta), all marked for the per-verse refinement pass:** at HARD-CEILING-8 — Pss 34, 78, 96, 102, 103, 106, 119, 139 (Ps 119 additionally subdivided into its 22 acrostic stanzas — doubly marked; Ps 106 reached 8 post-delta in chunk 4; the rest baseline). At 7 (dense, flagged): Pss 22, 23, 33, 37, 50, 68, 69, 71, 89, 94, 95, 109, 118, 145, 147. Recorded ceiling yields on cap-full psalms (standing, from the passes and this sweep): `gods-unchanging-nature` on 102, `power-of-gods-word` on 119, `angels` on 34 (the sweep's one DROP), `thought-life` on 139 (chunk 5, seam-yield).

**Inverse-seam (anchorless-psalm) list, as recorded:** chunks 1–2 predate the systematic inverse-seam recording (chunk 1 had no systematic seam check; chunk 2 recorded anchor-without-tag seams only), so Pss 1–60 have no recorded inverse-seam roster; chunk 3 recorded Ps 69 as its notable inverse seam; chunk 4 recorded thirteen (94, 97, 98, 99, 105, 106, 107, 108, 112, 114, 115, 117, 120); chunk 5 recorded nineteen (123, 124, 125, 126, 128, 129, 130, 131, 132, 134, 135, 136, 138, 140, 142, 143, 144, 148, 149) — 33 recorded anchorless psalms in Pss 61–150, concentrated in Books IV–V, headlined by Pss 107 (chunk 4's call), 130, 132, and 136. A follow-up sweep of Pss 1–60 for inverse seams is the one known gap in this book's seam coverage.

**Sweep-complete note:** all 150 psalms are now swept (chunks 1–5, this file, in order); every quote in this block was mechanically verified against the staged 87fd68c WEB extraction (same source pin `b6f55cc7…` as e762d1c's manifest), with the Pss 121, 136, 139, 146, 147, 150 quotes additionally falling in pinned-fixture-witnessed chapters. Display/research layer only throughout: no engine changes, no repo changes, no PRs; engine ingestion of every candidate above remains the fixtures-first gauntlet path (plan §3.3/§5.2), where `NO MEASURABLE EFFECT` still means don't merge.

---

### Pss 1–60 inverse-seam addendum — close-out pass (2026-08-26)

Closes the roll-up's one flagged gap ("A follow-up sweep of Pss 1–60 for inverse seams is the one known gap in this book's seam coverage"). Method: mechanical grep of the kit's concept-library inventory (`concepts.md`, repo e762d1c, 239 packs / 1,599 anchors) for every Psalms reference on `anchors:` lines. Format verified uniform: every Psalms anchor cites `Psalms N:V` (or `N:V-V` range); zero whole-chapter citations, zero occurrences of alternate forms (`Ps N`, `Psalm N`, `Pss`), and zero Psalms references appear anywhere outside `anchors:` lines — so the anchors-line grep is exhaustive.

**Anchorless psalms in Pss 1–60 (28):** 2, 3, 4, 5, 6, 7, 14, 17, 18, 20, 21, 26, 28, 29, 36, 38, 43, 45, 47, 49, 50, 52, 53, 54, 57, 58, 59, 60.

**Anchored psalms in Pss 1–60 (32):** 1, 8, 9, 10, 11, 12, 13, 15, 16, 19, 22, 23, 24, 25, 27, 30, 31, 32, 33, 34, 35, 37, 39, 40, 41, 42, 44, 46, 48, 51, 55, 56.

**Sanity checks (positives):** Ps 1 anchored (`blessing` 1:1-3; `delighting-in-gods-word` 1:2 w=1.0 lead); Ps 22 anchored (`messianic-prophecy` 22:1-18 w=0.9); Ps 23 anchored (7 packs incl. `shepherds-and-the-flock` 23:1 w=1.0 lead); Ps 51 anchored — see verdict below. One expected positive FAILED: **Ps 2 is anchorless** — no pack anchors any verse of Ps 2 (verified across anchors and lexicons; no alternate citation form). This is consistent with, and gives urgency to, the sweep's standing `messianic-prophecy` anchor-extension class (chunks 1–4 proposed the class at Pss 2, 45, 69, 102, 118; chunk 5 added 132): the "Why do the nations rage" psalm currently contributes nothing to engine ranking. Ps 2 joins Pss 107/130/132/136 among the headline anchorless findings.

**Ps 51 verdict:** NOT anchorless. Four packs anchor it: `forgiveness-of-sins` (51:3-4 w=0.8), `new-creation` (51:10 w=0.9), `pastoral-relapse-and-restoration` (51:10-12 w=0.9), `praise` (51:15 w=0.7). Chunk 2's finding therefore stands in its precise form — the `repentance` pack specifically lacks the Psalter's chief penitential psalm (a namesake/lead-anchor seam, the Ps 23 `shepherds-and-the-flock` class) — but Ps 51 does NOT join the anchorless roster.

**Whole-Psalter roster completion.** Cross-checking the recorded 61–150 rosters against the same grep: chunk 4's thirteen (94, 97, 98, 99, 105, 106, 107, 108, 112, 114, 115, 117, 120) and chunk 5's nineteen (123, 124, 125, 126, 128, 129, 130, 131, 132, 134, 135, 136, 138, 140, 142, 143, 144, 148, 149) match the mechanical result EXACTLY. Chunk 3 recorded only Ps 69 as its "notable" inverse seam; the full anchorless set in 61–90 is THIRTEEN: 61, 63, 64, 69, 70, 72, 74, 76, 79, 81, 83, 84, 89 (the twelve beyond Ps 69 were unrecorded — notably Ps 72 [the royal/Solomon psalm], Ps 84 ["How lovely are your dwellings"], and Ps 89 [the Davidic-covenant lament, companion to chunk 3's `davidic-covenant` ADD and corpus-blocked row 44]). **Complete whole-Psalter anchorless roster: 73 psalms (28 + 13 + 13 + 19); 77 psalms carry at least one engine anchor.** 73 + 77 = 150, checked.

Display/research layer only: no engine changes, no repo changes; every closure of these seams remains the fixtures-first gauntlet path.

*(§9 audit: this addendum was written as one atomic end-of-file append; post-write the file was re-read, the pre-append prefix verified byte-identical — sha256 `050bb3b0…` over the first 267,225 bytes — and this block verified present exactly once.)*
