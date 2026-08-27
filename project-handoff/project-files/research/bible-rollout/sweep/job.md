# Job sweep ledger — Layer-3 tag sweep (plan §5.2)

**Book:** Job · **Date:** 2026-08-26 · **Repo:** scripture-search-engine @ origin/main `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (239 engine concept packs; 1,434 lexicon phrases; 1,599 anchors)
**Adopted display vocabulary:** the 239 engine ids + the 161 §11.1 adopted ids per the canonical `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md` (cross-checked against the sweep kit's regenerated list — no discrepancies on any id used below).
**Inputs:** sweep kit 2026-08-26 (rules.md with verbatim plan §5.2 + CONVENTIONS §5/§9/§11; concepts.md; concept-ids.txt; declines.md; corpus-blocked.md; books.md; output-spec.md); prior art `/mnt/project-files/research/bible-rollout/job.md` (FINAL, 2026-08-23 + 2026-08-25 passes — its Decisions record binds this sweep; not edited).
**WEB text provenance:** all quotes word-for-word WEB from the staged verse-per-line extraction of the full-Bible fixture at commit `87fd68c` (`generatedFrom.sourceSha256` = the same `b6f55cc7…` pin as e762d1c's `pipeline/manifests/web.json`; 0 mismatches against the committed e762d1c fixture over its 5,726 witnessed verses). Job 1 is additionally pinned-fixture witnessed at e762d1c; Job 2–21 are verified against the 87fd68c full fixture only. Straight apostrophes used per the proverbs.md #16 precedent (words unaltered).
**Entry format** (per KIT/output-spec.md; sections in this order, "None." where empty):
1. Existing tags (book doc) · 2. Applied-tag deltas (ADD/KEEP/DROP; no silent drops) · 3. Anchor-extension candidates (`id` | ref | "WEB quote" | w=) · 4. Lexicon candidates (`id` | phrase | queries) · 5. New-concept candidates · 6. Decline-overturn proposals · 7. Ceiling / refinement flags · 8. Decisions record (§11.6 yields).
Corpus-blocked findings are ROUTED ("ROUTED to corpus-blocked roster row N"), never re-proposed.
**Standing Job rules applied throughout:** no tags from the three friends' condemned counsel (chs. 4–5, 8, 11, 15, 18, 20 in this range; 42:7; book doc Decisions #2 — sole exception `dreams-and-visions` on ch. 4, attributed); pastoral-* packs personal-crisis register only (#9/#14); no `pastoral-hope-in-despair` on 3/6–7/10/17 (#4); Job 9:22–24 carries no tag (#13); Job 19 hope-beyond-death carried with the translation-honesty caveat, never read back (#5/#17); divine name "the LORD" (#15).

---

## This block: chapters 1–21 (sweep worker, 2026-08-26)

## Job 1 (subdivided: 1:1–5 / 1:6–12 / 1:13–22)
1. Existing tags (book doc): `testing`, `worship`, `surrender-to-god`, `pastoral-grief-and-loss`, `satan`, `angels`, `fear-of-the-lord`, `suffering-of-the-righteous` — 8 (hard ceiling).
2. Applied-tag deltas: No changes — all 8 sitting tags independently clear the presence bar (re-checked against the WEB text); chapter is at the hard ceiling, and the one live candidate (`why-god-allows-suffering`, 1:21) already carries a recorded §11.6 yield + follow-up-candidate entry (book doc Decisions #18) — nothing here outranks the sitting tags under main-themes-first, so that record stands unchanged. `gods-protection` and `resisting-the-devil` remain excluded per Decisions #7 (the hedge is breached; Job never confronts Satan) — no new evidence.
3. Anchor-extension candidates: `worship` | Job 1:20-21 | "Then Job arose, and tore his robe, and shaved his head, and fell down on the ground, and worshiped." | w=0.5 — worship-in-loss register ("worshiping god in hard times"); NOTE for curator: `surrender-to-god` already anchors Job 1:21 (w=0.6) — check the two don't double-serve the same queries before adding. (Engine coverage otherwise good: `testing` anchors 1:8-12, `satan` 1:6-7, `suffering-of-the-righteous` 1:8, `why-god-allows-suffering` 1:21 already.)
4. Lexicon candidates: `surrender-to-god` | "the lord gave and the lord has taken away" | queries: "the lord gives and takes away", "blessed be the name of the lord", "losing everything and still trusting god" (rides the existing Job 1:21 anchor). `gods-protection` | "hedge of protection" | queries: "hedge of protection prayer", "hedge of protection bible verse", "what is a hedge of protection" — phrase originates at Job 1:10 ("Haven't you made a hedge around him"), but the lexicon row would route to the pack's Psalm 91 anchors, NOT to Job 1 (Decisions #7's misroute concern is about tagging/anchoring the breach chapter, which this proposal does not do).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD-CEILING-8 hit + book-doc subdivision (3 sections) → mark for the per-verse refinement pass (the yielded `why-god-allows-suffering` 1:21 is the natural per-verse survivor; its engine anchor already exists).
8. Decisions record: None new (the standing #18 yield of `why-god-allows-suffering` re-confirmed, not re-decided).

## Job 2 (subdivided: 2:1–10 / 2:11–13)
1. Existing tags (book doc): `testing`, `trust-in-god`, `pastoral-serious-illness`, `friendship`, `pastoral-grief-and-loss`, `satan`, `comforting-others`, `suffering-of-the-righteous` — 8 (hard ceiling).
2. Applied-tag deltas: No changes — all 8 clear the bar; the chapter's recorded cap plan (Decisions #16: `angels` and `integrity` yielded to land at 8) stands, and this sweep found no candidate that outranks the sitting tags (2:1 repeats 1:6's scene-setting; 2:3/2:9 "integrity" mentions remain in-scene, developed homes chs. 27/31).
3. Anchor-extension candidates: None — engine coverage already present (`satan` anchors 2:1-7, `suffering-of-the-righteous` 2:3 and 2:10, `comforting-others` 2:11-13, `integrity` 2:3). The pastoral-* packs deliberately anchor comfort texts, not affliction narratives, so no Job 2 anchor is proposed for `pastoral-serious-illness`/`pastoral-grief-and-loss` (harm-gate design respected).
4. Lexicon candidates: `comforting-others` | "sitting with someone in grief" | queries: "how to sit with someone who is suffering", "ministry of presence", "what to do when words fail a grieving friend" — the model verses are the pack's existing Job 2:11-13 anchor ("they made an appointment together to come to sympathize with him and to comfort him"; "no one spoke a word to him, for they saw that his grief was very great").
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD-CEILING-8 hit + book-doc subdivision (2 sections) → mark for the per-verse refinement pass (yielded `angels` 2:1 / `integrity` 2:3, 2:9 are the per-verse candidates of record).
8. Decisions record: None new (standing #16 yields re-confirmed).

## Job 3
1. Existing tags (book doc): `lament` — 1.
2. Applied-tag deltas: No changes — `lament` carries the chapter (sustained birth-curse and death-longing, uncensored). Considered and NOT added: `mortality` (3:13-19 pictures the grave as rest and leveler — "The small and the great are there. The servant is free from his master." — but from the death-wish register, not the concept's life-is-short teaching substance; developed homes are chs. 7/10/14/17); `pastoral-hope-in-despair` stays off per Decisions #4 (despair without the concept's hope substance) — no new evidence.
3. Anchor-extension candidates: `lament` | Job 3:20-26 | "Why is light given to him who is in misery, life to the bitter in soul, who long for death, but it doesn't come" … "I am not at ease, neither am I quiet, neither do I have rest; but trouble comes." | w=0.65 — the lament pack has no Job anchor; Job 3 is Scripture's paradigm personal lament (the tag-gaps append flagged these refs; the landed pack never picked them up). Engine-side caution carried from Decisions #4: `pastoral-hope-in-despair`'s fixtures assert despair narratives never rank for its crisis queries — the curator must fixture-check that a Job 3 lament anchor does not leak into those guarded queries.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 50: `leviathan-and-behemoth` — Job 3:8 "who are ready to rouse up leviathan" is a single passing allusion, already a recorded display skip in book-doc pass #16; noted for the row's curator as a minor cross-ref only, not an anchor case.)

## Job 4
1. Existing tags (book doc): `dreams-and-visions` — 1 (attributed vision narrative; the friends'-counsel exception of record).
2. Applied-tag deltas: No changes — friends'-counsel chapter (Eliphaz, condemned at 42:7; Decisions #2); the single attributed tag stands; nothing else is taggable from this speech.
3. Anchor-extension candidates: `dreams-and-visions` | Job 4:12-17 | "In thoughts from the visions of the night, when deep sleep falls on men … Then a spirit passed before my face. The hair of my flesh stood up." | w=0.5 — the pack has no Job anchor and this is the Bible's most vivid night-vision narrative outside Daniel; CAVEAT for curator (carried from the display tag): it is Eliphaz's vision, whose application 42:7 condemns — the anchor marks the vision narrative, not an endorsement; weight kept low.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None (the NT's approving citation of Job 5:13 — the recorded reversal case in Decisions #2 — touches ch. 5, and is already recorded there; no new evidence).
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 5
1. Existing tags (book doc): none — friends'-counsel chapter.
2. Applied-tag deltas: No changes — honest-and-empty stands per Decisions #2 (Eliphaz's counsel, condemned 42:7); the considered-and-dropped list (`the-lords-discipline` 5:17-18, `humble-exaltation` 5:11) is already recorded there. 1 Cor 3:19's approving use of Job 5:13 remains the recorded reversal case; conservative default unchanged, no new textual evidence offered.
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 6
1. Existing tags (book doc): `friendship`, `lament` — 2.
2. Applied-tag deltas: No changes — both clear the bar. Considered and NOT added: `kindness` (6:14 "kindness should be shown from his friend" is a single clause whose substance the sitting `friendship` tag already quotes — broad-duplicating-specific); `honesty` (6:28-30 "surely I will not lie to your face" — thin single-verse protest, developed homes chs. 13/27/31).
3. Anchor-extension candidates: `friendship` | Job 6:14-15 | "To him who is ready to faint, kindness should be shown from his friend; even to him who forsakes the fear of the Almighty. My brothers have dealt deceitfully as a brook" | w=0.55 — the book's plainest statement of what a friend owes, plus the failed-brook image; serves failed-friendship queries the pack's positive anchors (John 15:13, Prov 17:17) don't.
4. Lexicon candidates: `friendship` | "friends who fail you" | queries: "when friends let you down", "abandoned by my friends", "fair weather friends in the bible" (rides the proposed 6:14-15 anchor; adjacent `comforting-others` anti-model anchor Job 16:2-5 already exists — curator should split the intents deliberately).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 7
1. Existing tags (book doc): `wrestling-with-god`, `lament`, `mortality` — 3.
2. Applied-tag deltas: No changes — all three clear the bar (complaint carried to God 7:11-21; raw grief-register 7:3-6; Sheol's no-return 7:6-10). `pastoral-hope-in-despair` stays off per Decisions #4 (7:15-16 "my soul chooses strangling … I loathe my life" is the despair the concept's fixtures guard against, not its hope substance); `pastoral-serious-illness` stays confined to ch. 2 per Decisions #10 (7:5 is lament, not the God-in-the-valley register).
3. Anchor-extension candidates: `mortality` | Job 7:6-10 | "My days are swifter than a weaver's shuttle, and are spent without hope." … "so he who goes down to Sheol will come up no more." | w=0.7 — the mortality pack has no Job anchor though the row's own rationale calls Job Scripture's densest mortality meditation; serves "life is short" / "days are a breath" queries (7:7 "my life is a breath").
4. Lexicon candidates: `lament` | "complaining to god" | queries: "is it ok to complain to god", "can i be honest with god about my pain", "praying angry" — Job 7:11 "I will complain in the bitterness of my soul" is the warrant; routes to the pack's existing lament anchors (pour-out-your-heart register), with `wrestling-with-god` ("arguing with god") the adjacent owner — curator to place the phrase on exactly one pack (XOR rule).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 8
1. Existing tags (book doc): none — friends'-counsel chapter.
2. Applied-tag deltas: No changes — honest-and-empty stands per Decisions #2 (Bildad's system, condemned 42:7; the memorable spider's-web and papyrus images are inside the condemned argument).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 9
1. Existing tags (book doc): `creation`, `mediator` — 2.
2. Applied-tag deltas: No changes — both stand (Decisions #13 holds: no tag rests on 9:22-24, Job's anguished overreach). Considered and NOT added: `providence` / adopted `sovereignty-of-god` (9:5-12 is uncontestable power in a courtroom frame — "Who can hinder him? Who will ask him, 'What are you doing?'" — argued to show God can't be summoned, not the concepts' God-governs-for-purpose teaching substance; `providence`'s developed Job home is ch. 12); `unanswered-prayer` (9:16 is disbelief that God would listen, not the unheard-cry substance — see ch. 19 for the anchor-level candidate).
3. Anchor-extension candidates: `creation` | Job 9:8-9 | "He alone stretches out the heavens, and treads on the waves of the sea. He makes the Bear, Orion, and the Pleiades, and the rooms of the south." | w=0.6 — named-constellation text users actually search; the pack has no Job anchor (Job 26:7 sits in the other worker's range as the companion text).
4. Lexicon candidates: `creation` | "constellations in the bible" | queries: "pleiades and orion in the bible", "who made the stars bible verse", "constellations bible" (rides the proposed 9:8-9 anchor; Job 38:31 — outside this range — is the other natural target).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 24: `mediator` — Job 9:32-35, "For he is not a man, as I am, that I should answer him … There is no umpire between us, that might lay his hand on us both." — the row's own minting register; this sweep confirms the display tag sits here with the umpire-longing quote and adds no new design material; refs already in the roster's reasons.)

## Job 10
1. Existing tags (book doc): `wrestling-with-god`, `creation`, `lament`, `mortality` — 4.
2. Applied-tag deltas: No changes — all four clear the bar; `pastoral-hope-in-despair` stays off per Decisions #4 (10:1, 10:18-22 despair register).
3. Anchor-extension candidates: `creation` | Job 10:8-12 | "Your hands have framed me and fashioned me altogether … You have clothed me with skin and flesh, and knit me together with bones and sinews. You have granted me life and loving kindness" | w=0.6 — the intimate-craftsmanship register (the pack's Ps 139:13-14 "fearfully and wonderfully made" territory) argued back to the Maker; serves "God formed me in the womb" / "knit together" queries with an OT witness beyond Ps 139.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 11
1. Existing tags (book doc): none — friends'-counsel chapter.
2. Applied-tag deltas: No changes — honest-and-empty stands per Decisions #2 (Zophar, condemned 42:7; his "Can you fathom the mystery of God?" is honored by the book, his application is the condemned bargain — no tag rides it).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 12
1. Existing tags (book doc): `providence`, `creation`, `creation-testifies` — 3.
2. Applied-tag deltas: No changes — all three clear the bar (`creation-testifies` carries its recorded not-a-nature-hymn caveat; both-tags beside `creation` per §11.2). `prosperity-of-the-wicked` on 12:6 remains the recorded pass-#16 skip (single verse; ch. 21 is the home) — re-confirmed, no new evidence. Considered and NOT added: `wisdom-from-god` (12:13 "With God is wisdom and might" describes God's own wisdom in governance, not the concept's ask-and-receive register).
3. Anchor-extension candidates: `providence` | Job 12:13-25 | "With God is wisdom and might. He has counsel and understanding." … "He increases the nations, and he destroys them." | w=0.6 — matches the pack's own "god rules over the nations" lexicon with no current Job anchor. `the-breath-of-life` | Job 12:10 | "in whose hand is the life of every living thing, and the breath of all mankind?" | w=0.5 — companion to the pack's existing Job 32:8 anchor (soul/breath register).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 13
1. Existing tags (book doc): `wrestling-with-god`, `honesty` — 2.
2. Applied-tag deltas: No changes — both clear the bar (13:3, 13:13-22 the demanded hearing; 13:4, 13:7-10 the rebuke of pious lying). Considered and NOT added: `trust-in-god` on 13:15 — the WEB reads "Behold, he will kill me. I have no hope. Nevertheless, I will maintain my ways before him.", which does not carry the familiar "yet will I trust in him" substance; a display tag on the WEB text would rest on a rendering the corpus doesn't print (same translation-honesty discipline as Decisions #5/#11).
3. Anchor-extension candidates: `honesty` | Job 13:7-10 | "Will you speak unrighteously for God, and talk deceitfully for him? … He will surely reprove you if you secretly show partiality." | w=0.5 — the distinctive lying-in-God's-defense register; no current OT narrative anchor in the pack.
4. Lexicon candidates: `trust-in-god` | "though he slay me yet will i trust in him" | queries: "though he slay me", "trusting god when he lets you suffer", "job 13:15 meaning" — heavily-searched KJV phrase; CAVEAT (decisive for the curator): the pinned WEB renders 13:15 without the trust clause (text quoted in §2 above), so honoring the query means either anchoring Job 13:15 with a translation note or serving it from the pack's existing anchors; recorded here as a measured-phrase candidate, not a recommendation to anchor the WEB verse as a trust text.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 14
1. Existing tags (book doc): `providence`, `mortality` — 2.
2. Applied-tag deltas: No changes — both clear the bar (14:5 bounds appointed; 14:1-12 the mortality meditation). Considered and NOT added: `hope-in-god` (14:7's "hope for a tree" is the hope man lacks — 14:19 "you destroy the hope of man"); `resurrection-of-the-dead` as a display tag (14:14 "If a man dies, will he live again?" poses the question inside a wish, without ch. 19's confession — a tag would read the answer back into the question).
3. Anchor-extension candidates: `mortality` | Job 14:1-2 | "Man, who is born of a woman, is of few days, and full of trouble. He grows up like a flower, and is cut down. He also flees like a shadow, and doesn't continue." | w=0.8 — the classic funeral text; highest-value missing Job anchor in the mortality pack. `mortality` | Job 14:10-14 | "But man dies, and is laid low. Yes, man gives up the spirit, and where is he? … If a man dies, will he live again?" | w=0.65.
4. Lexicon candidates: `resurrection-of-the-dead` | "if a man dies will he live again" | queries: "if a man dies shall he live again", "job 14:14 meaning", "does the old testament talk about life after death" — CAVEAT: the chapter poses the question and sinks back to grief; the pack's answer-anchors (Dan 12:2; 1 Cor 15; Job 19:25-27 w=0.4) are where the query should land — the phrase is the searcher's entry point, not a Job 14 anchor proposal.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 15
1. Existing tags (book doc): none — friends'-counsel chapter.
2. Applied-tag deltas: No changes — honest-and-empty stands per Decisions #2 (Eliphaz's second speech, condemned 42:7; the wicked-man's-fate set piece is the condemned system aimed at Job).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 16
1. Existing tags (book doc): `hope-in-god`, `friendship`, `comforting-others`, `lament`, `mediator` — 5.
2. Applied-tag deltas: No changes — all five clear the bar (16:19-21 heaven-ward hope and advocate; 16:2-5 miserable comforters, anti-model and model; 16:6-17 grief under God's hand). Considered and NOT added: `slander-and-false-accusation` (16:10's mouth-gaping and cheek-striking is mockery inside the lament, not the concept's falsely-accused-and-vindicated substance — theme touch, not teaching substance); `pastoral-god-sees-my-suffering` (16:19's witness-on-high is the advocate register `mediator` already carries, not the seen-by-God comfort register).
3. Anchor-extension candidates: None — `comforting-others` already anchors Job 16:2-5 (w=0.6); 16:19-21 belongs to the corpus-blocked mediator row (routed below), and adding it to `hope-in-god` instead would poach that row's design territory.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (5 tags, under the soft cap).
8. Decisions record: None. (ROUTED to corpus-blocked roster row 24: `mediator` — Job 16:19-21, "Even now, behold, my witness is in heaven. He who vouches for me is on high. … that he would maintain the right of a man with God, of a son of man with his neighbor!" — second witness text for the row, already listed in its reasons; no new design material.)

## Job 17
1. Existing tags (book doc): `mortality` — 1.
2. Applied-tag deltas: No changes — `mortality` carries the chapter (17:1 "My spirit is consumed. My days are extinct and the grave is ready for me."; 17:13-16 the family plot in the dust). Considered and NOT added: `hope-in-god` (17:15 "where then is my hope?" is the despair question, not the concept's hope substance); the 17:9 perseverance flash stays a motif candidate per the book doc (single verse).
3. Anchor-extension candidates: None (Job 7:6-10 and 14:1-14 proposed above are the stronger mortality anchors; 17:13-16 adds no distinct query intent).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 18
1. Existing tags (book doc): none — friends'-counsel chapter.
2. Applied-tag deltas: No changes — honest-and-empty stands per Decisions #2 (Bildad's doom catalog, condemned 42:7, pointed at a bereaved man).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 19
1. Existing tags (book doc): `hope-in-god`, `loneliness`, `redeemer`, `resurrection-of-the-dead` — 4.
2. Applied-tag deltas: No changes — all four clear the bar (`resurrection-of-the-dead` carries its recorded translation-honesty caveat per Decisions #5/#17; `redeemer` stays within the no-read-back guard, Job's own words). Considered and NOT added: `slander-and-false-accusation` (19:2-5, 19:22, 19:28-29 voice torment-by-words and warn the accusers, but the chapter's teaching substance is abandonment and the Redeemer confession — theme-witness-with-caveat, declined); `justice-and-oppression` (19:7 "there is no justice" is personal outcry, not the societal register that id carries in Job per Decisions #9/#14); `unanswered-prayer` as a display tag (19:7 is a single verse — anchor-level candidate below instead, per plan §3.1's dropped-tag-survives-as-anchor pattern).
3. Anchor-extension candidates: `loneliness` | Job 19:13-19 | "My relatives have gone away. My familiar friends have forgotten me. … All my familiar friends abhor me. They whom I loved have turned against me." | w=0.6 — Scripture's most complete abandonment inventory; the pack has no Job anchor; serves "abandoned by everyone" / "family turned against me" queries. `unanswered-prayer` | Job 19:7 | "Behold, I cry out of wrong, but I am not heard. I cry for help, but there is no justice." | w=0.6 — exact-match witness for the pack's when-God-doesn't-answer intent (its current OT anchors are Lam 3:8, 3:44).
4. Lexicon candidates: None here — "i know that my redeemer lives" query evidence is ROUTED with the redeemer row below, not proposed on another pack.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (4 tags).
8. Decisions record: None. (ROUTED to corpus-blocked roster row 23: `redeemer` — Job 19:25-27, "But as for me, I know that my Redeemer lives. In the end, he will stand upon the earth. After my skin is destroyed, then I will see God in my flesh" — the row's whole case, confirmed present with the display tag; query evidence for the row's curator: "i know that my redeemer lives", "my redeemer lives meaning", "who is my redeemer in job" — record with the row, do not mint or extend elsewhere. The `resurrection-of-the-dead` pack's existing Job 19:25-27 w=0.4 anchor already serves the hope-beyond-death slice.)

## Job 20
1. Existing tags (book doc): none — friends'-counsel chapter.
2. Applied-tag deltas: No changes — honest-and-empty stands per Decisions #2 (Zophar's second speech, condemned 42:7). Note kept explicit: 20:19's oppression line ("he has oppressed and forsaken the poor") sits inside the condemned counsel — `justice-and-oppression` does not ride it.
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 21
1. Existing tags (book doc): `prosperity-of-the-wicked` — 1.
2. Applied-tag deltas: No changes — the single tag carries the chapter (the question put with evidence, 21:7-34). Recorded pass-#16 skips re-confirmed with no new evidence: `comforting-others` (21:34 single closing line; homes are chs. 2/16), `suffering-of-the-righteous` (would restate on the same verses what the sitting tag carries). Considered and NOT added: `mortality` (21:23-26 death-as-leveler serves the prosperity argument, not a mortality meditation — broad-duplicating-specific).
3. Anchor-extension candidates: `prosperity-of-the-wicked` | Job 21:7-15 | "Why do the wicked live, become old, yes, and grow mighty in power? … They tell God, 'Depart from us, for we don't want to know about your ways." | w=0.75 — widen the pack's existing single-verse Job 21:7 anchor (same weight) to the full evidence paragraph including the wicked's dismissal of God; serves "why do the wicked prosper" with the passage, not one line.
4. Lexicon candidates: None (the pack's lexicon already carries "why do the wicked prosper" and "evil people succeed").
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

---

### Chapters 1–21 block summary and §9 survival audit (2026-08-26)

- **Applied-tag deltas: 0 ADDs, 0 DROPs; all 37 existing tag applications across chs. 1–21 KEPT** (re-verified against the WEB text). The zero-delta result is the expected one: this book doc already absorbed the 2026-08-25 tag-application, apologetics, and new-mint passes; every honest candidate this sweep surfaced either duplicates a sitting tag, fails the presence bar, sits under a recorded decline/skip with no new evidence, or belongs at anchor level.
- **Anchor-extension candidates: 15 rows across 12 concept ids** (`worship` 1:20-21; `lament` 3:20-26; `dreams-and-visions` 4:12-17; `friendship` 6:14-15; `mortality` 7:6-10, 14:1-2, 14:10-14; `creation` 9:8-9, 10:8-12; `providence` 12:13-25; `the-breath-of-life` 12:10; `honesty` 13:7-10; `loneliness` 19:13-19; `unanswered-prayer` 19:7; `prosperity-of-the-wicked` 21:7-15 widen).
- **Lexicon candidates: 8** (surrender-to-god; gods-protection; comforting-others; friendship; lament; creation; trust-in-god caveat-carried; resurrection-of-the-dead caveat-carried).
- **New-concept candidates: 0. Decline-overturn proposals: 0.**
- **Corpus-blocked routings: 4** — row 24 `mediator` (chs. 9, 16), row 23 `redeemer` (ch. 19), row 50 `leviathan-and-behemoth` (ch. 3 minor note).
- **Ceiling/refinement flags: chs. 1 and 2** (hard ceiling 8 + book-doc subdivisions) marked for the per-verse refinement pass.
- **§9 survival audit (this write):** this block was appended as one atomic end-of-file block; after writing, the file was re-read and verified — pre-existing bytes unchanged (this was the file-creating write; header + block as written) and this block present exactly once. Grep keys used: "Job 21", "row 24", "chapters 1–21 block summary". Chapters 22–42 belong to the sibling worker; final-delivery re-audit responsibility for this block transfers with the file per CONVENTIONS §9(3).

---

## This block: chapters 22–42 (sweep worker 2, 2026-08-26)

**Range provenance:** all quotes word-for-word WEB from the staged 87fd68c full-fixture extraction (same `b6f55cc7…` pin as e762d1c's manifest; see the file header). Job 31 is additionally pinned-fixture witnessed at e762d1c; Job 22–30 and 32–42 are verified against the 87fd68c full fixture only. Straight apostrophes per the proverbs.md #16 precedent (words unaltered).
**Prior art within this file:** the chapters 1–21 block above is prior art — its anchor-extension and lexicon rows are not re-proposed; where this range supplies companion refs for the same idea, the entry carries a cross-ref line to the 1–21 row instead.
**Speaker discipline applied throughout this range:** Eliphaz (22) and Bildad (25) yield NO tags from their condemned counsel (42:7; book doc Decisions #2; Zophar takes no third turn); Elihu (32–37) taggable only with "(Elihu speaking)" attribution (Decisions #3); the LORD's speeches (38–41) and the narrative frame (42) fully taggable; Job's own credited speech taggable per the book doc's practice, with `divine-judgment` on 27 standing per Decisions #12. All pastoral-* ids below are the prefixed filename basenames (CONVENTIONS §5 — never the packs' unprefixed inner ids).

## Job 22
1. Existing tags (book doc): none — friends'-counsel chapter.
2. Applied-tag deltas: No changes — honest-and-empty stands per Decisions #2 (Eliphaz's third speech invents charges — "Isn't your wickedness great?" — and 42:7 condemns the counsel; the recorded considered-and-dropped list already covers this chapter: `humble-exaltation` 22:29, `repentance`/`prayer` 22:21-27). Re-confirmed with no new evidence. Note kept explicit: the famous invitation "Acquaint yourself with him now, and be at peace." (22:21) sits inside the condemned counsel aimed at an innocent man — no tag, no anchor rides it, same policy as chs. 5/8/11/15/18/20.
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 23
1. Existing tags (book doc): `testing`, `wrestling-with-god`, `obedience-to-the-word`, `delight-in-the-word` — 4.
2. Applied-tag deltas: No changes — all four clear the bar (23:10 tried-as-gold; 23:3-7 the demanded hearing; 23:11-12 the kept way; 23:12 the treasured words). Considered and NOT added: `seeking-god` (23:3, 23:8-9 "Oh that I knew where I might find him!" is the search for a legal hearing the sitting `wrestling-with-god` already carries, not the concept's devotional seek-the-LORD register); `presence-of-god` (23:15 "I am terrified at his presence" is the terror register, not the concept's communion substance).
3. Anchor-extension candidates: `obedience-to-the-word` | Job 23:11-12 | "My foot has held fast to his steps. I have kept his way, and not turned away. I haven't gone back from the commandment of his lips." | w=0.55 — obedience held under suffering, with no bargain attached; the pack has no Job anchor. `delight-in-the-word` | Job 23:12 | "I have treasured up the words of his mouth more than my necessary food." | w=0.6 — the pack (Ps 1:2; Josh 1:8; Col 3:16) has no more-than-food witness; a distinct query intent from the obedience slice of the same verse — curator to check the two rows don't double-serve.
4. Lexicon candidates: `testing` | "come out like gold" | queries: "when he has tried me i shall come forth as gold", "come forth as gold bible verse", "god refining me like gold" (rides the pack's existing Job 23:10 anchor, w=0.65). `delight-in-the-word` | "more than my necessary food" | queries: "treasuring gods word more than food", "job 23:12 meaning", "loving the bible more than food" (rides the proposed 23:12 anchor).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (4 tags).
8. Decisions record: None.

## Job 24
1. Existing tags (book doc): `justice-and-oppression`, `prosperity-of-the-wicked` — 2.
2. Applied-tag deltas: No changes — both clear the bar (24:2-12 the oppression catalog; 24:1, 24:22-24 the missing court days). Considered and NOT added: `care-for-widows` (24:3, 24:21 depict widows victimized inside the catalog — the concept's care-teaching substance is absent; `justice-and-oppression` carries the material); `mortality` (24:19-20 Sheol-consumes serves the argument about the wicked, not a mortality meditation — broad-duplicating-specific).
3. Anchor-extension candidates: `justice-and-oppression` | Job 24:2-12 | "There are people who remove the landmarks. They violently take away flocks, and feed them." … "From out of the populous city, men groan. The soul of the wounded cries out, yet God doesn't regard the folly." | w=0.6 — the engine pack has no Job anchor though the book doc's tag-gaps append designated Job 24:2-12 for exactly this row; the catalog serves "oppression of the poor" queries with the OT's most concrete inventory. Caveat for the curator carried from the book doc: the chapter laments heaven's apparent silence — the anchor marks the oppression witness, not a vindication teaching.
4. Lexicon candidates: None (the pack's lexicon already carries "oppression of the poor", "exploiting the poor").
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 25
1. Existing tags (book doc): none — friends'-counsel chapter.
2. Applied-tag deltas: No changes — honest-and-empty stands per Decisions #2 (Bildad's six-verse last word, condemned 42:7; "How then can man be just with God?" repeats the question of 9:2 from inside the condemned system, and "man, who is a worm" is its crushing application to Job).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 26
1. Existing tags (book doc): `creation` — 1.
2. Applied-tag deltas: No changes — the single tag carries the chapter (the doxology 26:5-14). Considered and NOT added: `glory-of-god` (26:14 "these are but the outskirts of his ways" voices majesty without the concept's glory vocabulary or revelation scene — the sitting `creation` tag carries the substance); `mortality` (26:5-6 Sheol-naked is two verses of scene-setting for the doxology).
3. Anchor-extension candidates: `creation` | Job 26:7-10 | "He stretches out the north over empty space, and hangs the earth on nothing." | w=0.65 — the companion text the 1–21 block's Job 9 entry named (9:8-9 proposed there); 26:7 is a heavily-searched curiosity verse the pack cannot currently serve.
4. Lexicon candidates: `creation` | "hangs the earth on nothing" | queries: "earth hangs on nothing", "job 26:7 science", "what holds up the earth bible" (rides the proposed 26:7-10 anchor; distinct phrase from the 1–21 block's "constellations in the bible" row — no overlap).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 50: `leviathan-and-behemoth` — Job 26:12-13, "he strikes through Rahab" and "His hand has pierced the swift serpent", are adjacent sea-monster imagery for that row's curator, minor cross-ref only (same class as the 1–21 block's Job 3:8 note); not an anchor case — the named-pair texts are chs. 40–41.)

## Job 27 (subdivided: 27:1–6 / 27:7–23)
1. Existing tags (book doc): `honesty`, `divine-judgment`, `integrity` — 3.
2. Applied-tag deltas: No changes — all three clear the bar; `divine-judgment` stands per Decisions #12 (Job's own vindicated voice; the recorded counter-case rides with it, no new evidence either way). Considered and NOT added: `oaths-and-vows` (27:2 "As God lives" is an oath formula in use, not the concept's vow-keeping teaching — thin single-verse); `prosperity-of-the-wicked` (27:13-23 teaches the wicked's portion — the opposite pole of that concept's question; ch. 21 is the home).
3. Anchor-extension candidates: `integrity` | Job 27:5-6 | "Until I die I will not put away my integrity from me. I hold fast to my righteousness, and will not let it go." | w=0.8 — the book's strongest integrity confession; the pack anchors Job 2:3 and 31:5-6 but not this, the verse integrity searches most want.
4. Lexicon candidates: `integrity` | "hold fast to my integrity" | queries: "holding on to integrity when suffering", "keep your integrity bible", "job held fast his integrity" (rides the proposed 27:5-6 anchor).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: book-doc subdivision (2 sections) → mark for the per-verse refinement pass.
8. Decisions record: None.

## Job 28
1. Existing tags (book doc): `wisdom-from-god`, `fear-of-the-lord` — 2.
2. Applied-tag deltas: No changes — both clear the bar (the wisdom poem and its assigned conclusion). Considered and NOT added: `work-and-diligence` (28:1-11 admires mining prowess as a foil for wisdom's unminability — not the concept's work-ethic teaching substance).
3. Anchor-extension candidates: `wisdom-from-god` | Job 28:12-28 | "But where will wisdom be found? Where is the place of understanding?" … "God understands its way, and he knows its place." | w=0.7 — the OT's set-piece poem on wisdom's source; the pack (James 1:5; Prov 2:6; 9:10; 2:11) has no Job anchor. `fear-of-the-lord` | Job 28:28 | "Behold, the fear of the Lord, that is wisdom. To depart from evil is understanding." | w=0.7 — the wisdom-equation text the book doc's tag-gaps append flagged; the pack has no Job anchor. Curator note: the two proposals share v. 28 — place the verse's weight on one row deliberately.
4. Lexicon candidates: `wisdom-from-god` | "where can wisdom be found" | queries: "where does wisdom come from", "where can wisdom be found in the bible", "the price of wisdom is above rubies" (rides the proposed 28:12-28 anchor).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 29
1. Existing tags (book doc): `presence-of-god`, `blessing`, `justice-and-oppression` — 3.
2. Applied-tag deltas: No changes — all three clear the bar. Considered and NOT added: `leadership` (29:7-10, 29:21-25 portray honored leadership at the gate — "I chose out their way, and sat as chief" — but as remembered loss inside Job's defense, not the concept's leadership teaching; the just-rule substance is carried by the sitting `justice-and-oppression`); `comforting-others` (29:25 "as one who comforts the mourners" is a single closing clause; chs. 2/16 are the homes, per the recorded pass-#16 pattern).
3. Anchor-extension candidates: `justice-and-oppression` | Job 29:12-17 | "because I delivered the poor who cried, and the fatherless also, who had no one to help him" … "I was eyes to the blind, and feet to the lame." | w=0.55 — the righteous-ruler register (the row's Job refs of record); complements the 24:2-12 oppression-catalog proposal above; curator to pick the subset that serves distinct intents.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 30
1. Existing tags (book doc): `lament` — 1.
2. Applied-tag deltas: No changes — `lament` carries the whole "but now" chapter (mockery 30:1-15, God's hand 30:16-31). `pastoral-hope-in-despair` stays off per Decisions #4 (ch. 30 is on its recorded list) — no new evidence. Considered and NOT added: `mortality` (30:23 "you will bring me to death, to the house appointed for all living" is a thin single verse; the developed Job homes are chs. 7/14/17 in the 1–21 block); `unanswered-prayer` as a display tag (30:20 is a single verse inside the lament — anchor-level candidate below instead).
3. Anchor-extension candidates: `lament` | Job 30:16-31 | "Now my soul is poured out within me. Days of affliction have taken hold of me." … "Therefore my harp has turned to mourning, and my pipe into the voice of those who weep." | w=0.55 — extends the 1–21 block's finding (Job 3 entry: the lament pack has NO Job anchor) into this range; the harp-turned-to-mourning close serves grief-language queries the Psalms anchors don't. Same engine-side caution carried: fixture-check against `pastoral-hope-in-despair`'s guarded crisis queries. `unanswered-prayer` | Job 30:20 | "I cry to you, and you do not answer me. I stand up, and you gaze at me." | w=0.5 — companion to the 1–21 block's Job 19 row (19:7); the two verses together are Job's unheard-cry witness.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none. (Book doc Decisions #6 records ch. 30 deliberately kept whole despite two BSB headings — one continuous lament, not a subdivision case.)
8. Decisions record: None.

## Job 31
1. Existing tags (book doc): `pastoral-sexual-purity`, `honesty`, `generosity`, `hospitality`, `image-of-god`, `integrity`, `justice-and-oppression` — 7.
2. Applied-tag deltas: No changes — all seven independently clear the bar (the oath of clearance walks each register in turn; every tag's justification is a sworn oath item, main themes first). Considered and NOT added: `money-and-possessions` (31:24-25 gold-as-hope is two verses inside the oath catalog and the chapter sits above the soft cap — anchor-level candidate below instead, per the dropped-tag-survives-as-anchor pattern); `idolatry` (31:26-28 secret sun-and-moon worship renounced — same treatment, anchor-level below); `covetousness` (31:1, 31:9 guard desire but not the concept's coveting-what-belongs-to-others substance).
3. Anchor-extension candidates: `image-of-god` | Job 31:13-15 | "Didn't he who made me in the womb make him? Didn't one fashion us in the womb?" | w=0.55 — equal dignity of master and servant grounded in one Maker; the pack has no Job anchor; serves "human dignity in the bible" / "how to treat employees" queries (the book doc's motif row). `money-and-possessions` | Job 31:24-25 | "If I have made gold my hope, and have said to the fine gold, 'You are my confidence;'" | w=0.5 — the trust-in-wealth register sworn off on oath; the pack's OT anchors (Eccl 5:10; Prov 23:4-5) lack this confession form. `idolatry` | Job 31:26-28 | "if I have seen the sun when it shined, or the moon moving in splendor, and my heart has been secretly enticed, and my hand threw a kiss from my mouth; this also would be an iniquity to be punished by the judges, for I would have denied the God who is above." | w=0.45 — the Bible's plainest astral-worship renunciation; distinctive "worshiping the sun and moon" witness the pack lacks. `justice-and-oppression` | Job 31:16-22 | "If I have withheld the poor from their desire, or have caused the eyes of the widow to fail" | w=0.5 — personal-obligation register; third Job proposal for this pack (with 24:2-12 and 29:12-17 above) — curator to admit the best-differentiated subset, not all three by default.
4. Lexicon candidates: None (`pastoral-sexual-purity` already carries "covenant with my eyes" on its existing Job 31:1 anchor).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: 7 tags — soft cap 6 exceeded (recorded state since pass #16; every tag independently clears the bar); not at the hard ceiling and not subdivided, so not marked for the per-verse refinement pass. Note: ch. 31 is pinned-fixture verified at e762d1c.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 14: `gloating-over-downfall` — Job 31:29, "If I have rejoiced at the destruction of him who hated me, or lifted up myself when evil found him" — the row's lone in-corpus witness, confirmed present; with 31:30's disclaimer ("I have certainly not allowed my mouth to sin by asking his life with a curse") as the row's register color. No new design material; refs already in the roster's reasons.)

## Job 32
1. Existing tags (book doc): `wisdom-from-god`, `pleasing-god-not-people`, `the-breath-of-life` — 3 (all Elihu-attributed per Decisions #3).
2. Applied-tag deltas: No changes — all three clear the bar with attribution (32:8-9 understanding as the Almighty's gift; 32:21-22 no flattering titles; 32:8 the God-given spirit).
3. Anchor-extension candidates: `pleasing-god-not-people` | Job 32:21-22 | "Please don't let me respect any man's person, neither will I give flattering titles to any man. For I don't know how to give flattering titles, or else my Maker would soon take me away." | w=0.5 — the no-flattery-before-God register; the pack has no OT narrative anchor beyond Prov 29:25; Elihu speaking (attribution caveat carried to the anchor note).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 33
1. Existing tags (book doc): `dreams-and-visions`, `the-lords-discipline`, `repentance`, `restoration`, `mediator`, `redeemer` — 6 (all Elihu-attributed per Decisions #3). At soft cap.
2. Applied-tag deltas: No changes — all six clear the bar with attribution; no candidate outranks the sitting tags (the recorded pass-#16 skip of `angels` on 33:23 — carried by `mediator` — re-confirmed, no new evidence).
3. Anchor-extension candidates: `dreams-and-visions` | Job 33:14-18 | "In a dream, in a vision of the night, when deep sleep falls on men, in slumbering on the bed, then he opens the ears of men, and seals their instruction" | w=0.55 — the doctrine-of-night-speech companion to the 1–21 block's Job 4 row (4:12-17); Elihu speaking (attributed). `the-lords-discipline` | Job 33:19-30 | "He is chastened also with pain on his bed, with continual strife in his bones" … "to bring back his soul from the pit, that he may be enlightened with the light of the living." | w=0.6 — pain as rescuing instruction; the pack holds only Heb 12:7-11 and Rev 3:19 and lacks any OT witness; Elihu speaking (attributed; 42:7 does not condemn him — caveat for the curator carried from Decisions #3).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: soft-cap-6 hit (every tag clears the bar; not at the hard ceiling, not subdivided — not marked for per-verse refinement).
8. Decisions record: None. (ROUTED to corpus-blocked roster row 24: `mediator` — Job 33:23-24, "an angel, an interpreter, one among a thousand" and "Deliver him from going down to the pit, I have found a ransom." — the row's third witness text, already in its reasons; no new design material. ROUTED to corpus-blocked roster row 23: `redeemer` — Job 33:24, 33:28, "I have found a ransom." / "He has redeemed my soul from going into the pit. My life will see the light." — the row's ransom-and-redeem vocabulary refs, already in its reasons; both Elihu speaking, attribution noted for the row's curator.)

## Job 34
1. Existing tags (book doc): `providence` — 1 (Elihu-attributed).
2. Applied-tag deltas: No changes — the single tag carries the chapter (God's just, unpartial government, 34:12-30). Considered and NOT added: `divine-judgment` (34:11, 34:20-30 argue God-cannot-govern-unjustly as theodicy — the sitting `providence` carries that substance; a judgment-scene tag would broad-duplicate it); `justice-and-oppression` (34:28 "the cry of the poor" is a single clause inside the argument); `favoritism` as a display tag (34:19 is a single verse — anchor-level candidate below instead).
3. Anchor-extension candidates: `favoritism` | Job 34:19 | "He doesn't respect the persons of princes, nor respect the rich more than the poor, for they all are the work of his hands." | w=0.5 — exact-match witness for the pack's "god shows no partiality" lexicon, whose current God-shows-no-partiality anchor is NT-only (Acts 10:34-35; the pack's OT anchors are command-to-humans texts) — this adds the OT God-ward witness; Elihu speaking (attributed). `the-breath-of-life` | Job 34:14-15 | "If he set his heart on himself, if he gathered to himself his spirit and his breath, all flesh would perish together, and man would turn again to dust." | w=0.5 — the all-flesh-sustained register; companion to the pack's existing Job 32:8 anchor; Elihu speaking (attributed).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 35
1. Existing tags (book doc): none ("songs in the night," 35:10, is the recorded motif candidate).
2. Applied-tag deltas: **ADD `unanswered-prayer` (Elihu speaking)** — the chapter's second half is a sustained teaching on why cries go unanswered: "There they cry, but no one answers, because of the pride of evil men. Surely God will not hear an empty cry, neither will the Almighty regard it." (35:12-13), because "no one says, 'Where is God my Maker, who gives songs in the night" (35:10) — relief sought without the Giver (35:9-16, half the chapter). This is the concept's when-God-doesn't-answer substance from the diagnostic side; the id is engine vocabulary (and §11.1-adopted). Attribution and register caveats carried in the justification: Elihu speaking per Decisions #3 (an uncorrected but human voice — his closing application of the principle to Job, "multiplies words without knowledge," is part of the speech); the tag was never considered by the 2026-08-25 passes (which applied only Job's logged gap-row concepts), so this is a new-candidate proposal, not a skip reversal. The chapter moves from honest-and-empty to 1 tag; the book doc's "(Elihu speaking)" attribution list (Decisions #3) would extend by this entry at application time.
3. Anchor-extension candidates: `unanswered-prayer` | Job 35:12-13 | "There they cry, but no one answers, because of the pride of evil men. Surely God will not hear an empty cry, neither will the Almighty regard it." | w=0.5 — the pack's anchors (2 Cor 12:8-9; Lam 3:8, 3:44; Ps 80:4; Prov 21:13) carry the sufferer's side and one warning (Prov 21:13); this adds the Bible's diagnostic register (crying for relief without seeking God); Elihu speaking — the curator should weigh whether Elihu's voice should serve this pastoral-adjacent intent, and fixture-guard accordingly.
4. Lexicon candidates: None (the pack's lexicon already carries the natural phrasings; "empty cry" is not a phrase users type).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (1 tag).
8. Decisions record: None.

## Job 36
1. Existing tags (book doc): `the-lords-discipline`, `creation` — 2 (Elihu-attributed).
2. Applied-tag deltas: No changes — both clear the bar with attribution (36:8-15 the opened classroom; 36:26-33 the rain cycle). Considered and NOT added: `gods-provision` (36:31 "He gives food in abundance" is a single clause inside the storm description); `humble-exaltation` (36:5-7 exalting the righteous lacks the concept's humbling-the-proud pairing here).
3. Anchor-extension candidates: `the-lords-discipline` | Job 36:8-15 | "He also opens their ears to instruction, and commands that they return from iniquity." … "He delivers the afflicted by their affliction, and opens their ear in oppression." | w=0.6 — the hinge statement of Elihu's whole argument and the pack's strongest missing OT text (companion to the 33:19-30 proposal above; curator to admit one or both deliberately); Elihu speaking (attributed).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 37
1. Existing tags (book doc): `creation`, `providence` — 2 (Elihu-attributed).
2. Applied-tag deltas: No changes — both clear the bar with attribution (37:5-13 weather as craftsmanship; 37:12-13 the storm steered to purpose). Considered and NOT added: `fear-of-the-lord` (37:24 "Therefore men revere him." — the recorded pass-#16 skip: a single closing clause in other words; re-confirmed, no new evidence).
3. Anchor-extension candidates: `providence` | Job 37:12-13 | "It is turned around by his guidance, that they may do whatever he commands them on the surface of the habitable world, whether it is for correction, or for his land, or for loving kindness, that he causes it to come." | w=0.5 — weather steered to threefold purpose; companion to the 1–21 block's Job 12 row (12:13-25); Elihu speaking (attributed).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 38
1. Existing tags (book doc): `creation`, `gods-provision`, `design-in-creation` — 3.
2. Applied-tag deltas: No changes — all three clear the bar (the whirlwind tour; the raven fed; the audited architecture). The recorded pass-#16 skip of `angels` (38:7 a single clause inside the creation catalog) re-confirmed, no new evidence. Considered and NOT added: `wisdom-from-god` (38:36-37 "Who has put wisdom in the inward parts?" is two rhetorical questions inside the catalog, not the concept's ask-and-receive substance).
3. Anchor-extension candidates: `creation` | Job 38:4-11 | "Where were you when I laid the foundations of the earth? Declare, if you have understanding." … "You may come here, but no further. Your proud waves shall be stopped here" | w=0.75 — the Creator's own first-person tour; the creation pack has NO Job anchor at all (only `design-in-creation` carries 38:4 and 38:33) — highest-value missing creation anchor in the book; ch. 39's creature portraits (39:1-30) ride this row as secondary refs rather than a separate proposal. `gods-provision` | Job 38:39-41 | "Who provides for the raven his prey, when his young ones cry to God, and wander for lack of food?" | w=0.5 — the OT root of the pack's Matt 6:26 birds anchor; serves "god feeds the ravens" / "does god care for animals" queries (the book doc's motif row).
4. Lexicon candidates: None new — the constellation phrase is already proposed in the 1–21 block's Job 9 entry ("constellations in the bible", which names Job 38:31 as the other natural target: "Can you bind the cluster of the Pleiades, or loosen the cords of Orion?"); cross-ref, not re-proposed.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 39
1. Existing tags (book doc): `creation` — 1.
2. Applied-tag deltas: No changes — the single tag carries the chapter (the wild-creature exhibit, 39:1-30). Considered and NOT added: `gods-provision` (the chapter shows wildness governed and provided for, but the provision teaching sits in 38:39-41 where the tag already stands — broad-duplicating-specific across the chapter seam is not proposed).
3. Anchor-extension candidates: None as a separate row — Job 39:1-30 rides the ch. 38 `creation` proposal above as secondary refs (the war-horse 39:19-25 and eagle 39:26-30 portraits add color, not a distinct query intent).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Job 40 (subdivided: 40:1–5 / 40:6–24)
1. Existing tags (book doc): `humble-exaltation`, `creation`, `leviathan-and-behemoth` — 3.
2. Applied-tag deltas: No changes — all three clear the bar (the hand on the mouth and the challenge to govern the proud; behemoth the exhibit). Considered and NOT added: `surrender-to-god` (40:4-5 "I lay my hand on my mouth" is the humbling the sitting `humble-exaltation` carries, not the concept's living-sacrifice register); `repentance` (Job's retraction completes at 42:6 — the home is ch. 42).
3. Anchor-extension candidates: `humble-exaltation` | Job 40:9-14 | "Look at everyone who is proud, and humble him. Crush the wicked in their place." … "Then I will also admit to you that your own right hand can save you." | w=0.55 — only God abases the proud, put as a challenge no man can meet; the pack has no Job anchor; distinct from its exalt-the-humble anchors (1 Pet 5:6; Ps 75:6-7).
4. Lexicon candidates: None (behemoth queries belong to roster row 50, routed below).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: book-doc subdivision (2 sections) → mark for the per-verse refinement pass.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 50: `leviathan-and-behemoth` — Job 40:15-24, "See now behemoth, which I made as well as you." with "He is the chief of the ways of God." — the named pair's first text, confirmed present with the display tag; the pre-existing pending fixture remains the measured-gap record; no new design material.)

## Job 41
1. Existing tags (book doc): `creation`, `providence`, `leviathan-and-behemoth` — 3.
2. Applied-tag deltas: No changes — all three clear the bar (Leviathan limb by limb; the everything-is-mine claim; the named creature).
3. Anchor-extension candidates: `providence` | Job 41:10-11 | "Who then is he who can stand before me? Who has first given to me, that I should repay him? Everything under the heavens is mine." | w=0.55 — the ownership claim the creature proves; matches the pack's "gods sovereignty" / "sovereign over all" lexicon with no current Job anchor. Curator note (signpost only, not asserted as the chapter's claim): Paul quotes 41:11 in Romans 11:35.
4. Lexicon candidates: None (leviathan queries belong to roster row 50, routed below).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None. (ROUTED to corpus-blocked roster row 50: `leviathan-and-behemoth` — Job 41:1-34, "Can you draw out Leviathan with a fish hook" … "On earth there is not his equal, that is made without fear." — the row's whole-chapter case, confirmed present with the display tag; query evidence for the row's curator: "leviathan in the bible", "what is leviathan in job", "behemoth and leviathan meaning" — record with the row, do not mint or extend elsewhere.)

## Job 42 (subdivided: 42:1–6 / 42:7–9 / 42:10–17)
1. Existing tags (book doc): `repentance`, `prayer`, `restoration`, `humble-exaltation`, `blessing`, `presence-of-god`, `suffering-of-the-righteous`, `why-god-allows-suffering` — 8 (hard ceiling).
2. Applied-tag deltas: No changes — all 8 independently clear the bar (re-checked against the WEB text; pass #18 landed the chapter at the ceiling with every sitting tag re-verified). Cap-full candidates considered and NOT added, each failing the bar on its own before the cap is even reached: `forgiving-others` (Job's intercession for his tormentors is depicted, but the chapter never teaches or names forgiveness — the sitting `prayer` carries 42:8-10's substance); `comforting-others` (42:11 — the recorded pass-#16 skip, one narrative verse; re-confirmed, no new evidence); `oaths-and-vows` (the friends' commanded sacrifice is obedience, not vow-teaching).
3. Anchor-extension candidates: `restoration` | Job 42:10-12 | "The LORD restored Job's prosperity when he prayed for his friends. The LORD gave Job twice as much as he had before." | w=0.6 — the Bible's premier restoration narrative; the pack (Ps 23:3; 103:4-5; Isa 43:18-19) has no narrative anchor. Doctrinal guardrail carried into the row (CONVENTIONS §6): the restoration is God's free kindness after the test — the gist must never read as a payout formula, which is the one thing 42:7-8 explicitly condemns. `prayer` | Job 42:8-10 | "my servant Job shall pray for you, for I will accept him" | w=0.5 — intercession as the hinge of the book's resolution; the pack's lexicon carries "intercession" with no OT narrative anchor.
4. Lexicon candidates: `restoration` | "the lord restored job" | queries: "god restored job double", "the lord turned the captivity of job", "restoration of job meaning" — rides the proposed 42:10-12 anchor; same §6 guardrail note (serve the narrative, never a double-for-your-trouble promise).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD-CEILING-8 hit + book-doc subdivision (3 sections) → mark for the per-verse refinement pass (natural per-verse survivors: `repentance` 42:1-6; `suffering-of-the-righteous` + `prayer` 42:7-9; `restoration` + `blessing` 42:10-17).
8. Decisions record: None new (no sitting tag yielded; the cap-full declines above each carry their own reason). (ROUTED to corpus-blocked roster row 26: `inheritance` — Job 42:15, "Their father gave them an inheritance among their brothers." — minor cross-ref only for that row's curator: a distinctive daughters-inherit witness (the "did daughters inherit in the bible" curiosity, cf. the row's Num 27 territory), not an anchor case; the row's registers are promised-land and NT-in-Christ inheritance.)

---

### Chapters 22–42 block summary and §9 survival audit (2026-08-26)

- **Applied-tag deltas: 1 ADD, 0 DROPs; all 55 existing tag applications across chs. 22–42 KEPT** (re-verified against the WEB text). The one ADD: `unanswered-prayer` on Job 35 (Elihu speaking, attributed) — the only concept in the merged vocabulary genuinely present in a chapter the 2026-08-25 passes left empty, because those passes applied only Job's logged gap-row concepts and never evaluated this id there.
- **Anchor-extension candidates: 26 rows across 18 concept ids** (`obedience-to-the-word` 23:11-12; `delight-in-the-word` 23:12; `justice-and-oppression` 24:2-12, 29:12-17, 31:16-22 — best-subset note; `creation` 26:7-10, 38:4-11 (+39 secondary); `integrity` 27:5-6; `wisdom-from-god` 28:12-28; `fear-of-the-lord` 28:28; `lament` 30:16-31 (extends the 1–21 no-Job-anchor finding); `unanswered-prayer` 30:20, 35:12-13; `image-of-god` 31:13-15; `money-and-possessions` 31:24-25; `idolatry` 31:26-28; `pleasing-god-not-people` 32:21-22; `dreams-and-visions` 33:14-18; `the-lords-discipline` 33:19-30, 36:8-15; `favoritism` 34:19; `the-breath-of-life` 34:14-15; `providence` 37:12-13, 41:10-11; `gods-provision` 38:39-41; `humble-exaltation` 40:9-14; `restoration` 42:10-12; `prayer` 42:8-10).
- **Lexicon candidates: 6** (testing "come out like gold"; delight-in-the-word "more than my necessary food"; creation "hangs the earth on nothing"; integrity "hold fast to my integrity"; wisdom-from-god "where can wisdom be found"; restoration "the lord restored job" — §6-guarded).
- **New-concept candidates: 0. Decline-overturn proposals: 0.**
- **Corpus-blocked routings: 7** — row 50 `leviathan-and-behemoth` (chs. 26 minor, 40, 41), row 14 `gloating-over-downfall` (ch. 31), row 23 `redeemer` (ch. 33), row 24 `mediator` (ch. 33), row 26 `inheritance` (ch. 42 minor).
- **Cross-refs to 1–21 block rows (no re-proposals): 6** — creation 26:7-10 ↔ Job 9 row; constellations lexicon at 38:31 ↔ Job 9 row; lament 30:16-31 ↔ Job 3 row; unanswered-prayer 30:20 ↔ Job 19 row; dreams-and-visions 33:14-18 ↔ Job 4 row; providence 37:12-13 ↔ Job 12 row; mortality's Job case stays in the 1–21 rows (7/14/17 — nothing in 22–42 adds a distinct intent; 30:23 judged thin).
- **Ceiling/refinement flags: chs. 27, 40, 42 (book-doc subdivisions; 42 also at the hard ceiling 8) marked for the per-verse refinement pass; chs. 31 (7 tags) and 33 (soft cap 6) noted, not marked.**
- **§9 survival audit (this write, whole file):** this block was appended as one atomic end-of-file block; after writing, the file was re-read and verified — all pre-existing bytes (header + the chapters 1–21 block, including its own block summary and audit) unchanged, and this block present exactly once. Grep keys used: "chapters 1–21 block summary" (survives), "Job 21" (survives), "row 24" (survives in both blocks), "Job 42", "chapters 22–42 block summary" (present once). Both chunks of the Job ledger are now delivered; this is the book's final write of this sweep, and the whole-file audit above discharges §9(3) for it.
