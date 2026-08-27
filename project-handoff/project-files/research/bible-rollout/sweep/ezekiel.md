# Ezekiel sweep ledger — Layer-3 tag sweep (Isaiah–Daniel thread)

- Book: Ezekiel; chapters 1–48 (complete).
- Sweep thread: Isaiah–Daniel group (Major Prophets), Layer 3 of the whole-Bible coverage plan.
- Repo: scripture-search-engine @ origin/main `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (pinned; verified at assembly).
- Date: 2026-08-26. Assembled from two self-verified chunk drafts (chapters 1–24 and 25–48), independently re-verified mechanically at assembly (statement below).
- Sources: engine concept inventory — 239 ids in `ontology/concepts/*.yaml` at the pinned SHA (scratchpad concept-inventory.md); adopted display vocabulary — canonical list /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md (161 ids, engine-built flags; CONVENTIONS §11.1). Every adopted-only id used in this ledger was re-verified against the canonical list at assembly: `end-times`, `gloating-over-downfall`, `gods-holy-name`, `new-heart`, `outpouring-of-the-spirit`, `sacrifice-and-atonement`, `spiritual-adultery` (all used as tags) and `circumcision-of-the-heart` (referenced in ch 36's Decisions record) — all present, all marked engine-built: no, consistent with their corpus-blocked routings.
- Pastoral-id note (coordinator correction, 2026-08-26): the pastoral-* concept packs carry yaml `id:` fields WITHOUT the pastoral- prefix; for ledgers the prefixed FILENAME form is canonical (CONVENTIONS §5 — never strip the prefix). `pastoral-grief-and-loss` (ch 24) is that canonical filename form and resolves against `ontology/concepts/pastoral-grief-and-loss.yaml` at the pinned SHA.
- Standing framings preserved throughout: the Gog oracles (chs 38–39), the temple vision (chs 40–48), the prince, and 21:27 ("until he comes whose right it is") are all handled fulfillment-neutral/signposted, asserting no identification; Ezek 28:12–19 is deliberately NOT proposed for `satan` (contested-call ruling honored, no new evidence); Sheol/pit material routes to `mortality`, never `hell` (recorded decline followed).
- Fixture caveat (carried from the chunk-1 header, applies book-wide): of Ezekiel's 48 chapters only chapter 18 is inside the 213-chapter fixture corpus (pipeline/fixtures/web-subset.json), so only the ch-18 candidate (`justice-and-oppression` | 18:7-8) is measurable now; every other candidate row in this ledger is raw feed for the PR-β corpus expansion, not a buildable-now row.
- Quote conventions differ by chunk and are preserved verbatim: in chapters 1–24, WEB quotes are straight-double-quoted ("…") and query phrasings single-quoted; in chapters 25–48, WEB quotes are curly-double-quoted (“…”) and lexicon terms/query phrasings straight-quoted. Chapter entries are preserved byte-for-byte from the verified chunk drafts; chapters 1–24 use the numbered legend style, 25–48 the bolded legend style — the same Torah-ledger field order in both.
- Assembly verification statement (mechanical, scripted; chunk self-reports not trusted): all 48 chapter entries present and in order across the two chunks. 186 WEB-attributed quote spans byte-compared against the pinned WEB chapter files (scratchpad web-text/ezekiel/<N>.txt): 0 failures — including every Ezekiel 34 quote (the highest-stakes check after a prior pass caught a composed quote there); all 81 remaining straight-quoted spans in chapters 25–48 triaged as query phrasings, lexicon terms, or record/motif quotes, none scripture-attributed. 79 distinct backticked ids: every one resolves to the engine inventory (yaml ids plus pack filenames, per the pastoral-prefix rule), or to the canonical adopted list, or is explicitly labeled — the single labeled case is `god-our-shepherd` (ch 34), named as the historical staged-row converted at critic Round 3; preserved, not normalized. All candidate/delta counts recomputed mechanically; one count correction recorded in the Book totals (chunk-1 routing count). Every ADD carries an in-chapter WEB justification quote; all three §11.6 yields carry Decisions-record lines; considered-not-added calls preserved in each chapter's deltas/Decisions record.

---

## Ezekiel 1
2. Existing tags (book doc): `dreams-and-visions`, `presence-of-god`, `angels`, `glory-of-god`, `sojourners-and-strangers` (5).
3. Applied-tag deltas: No changes — all five stand at the honest-substantial bar against the full 239-id library ("the heavens were opened, and I saw visions of God" 1:1; "This was the appearance of the likeness of the LORD’s glory" 1:28); the engine `glory-of-god` pack itself anchors Ezekiel 1:28 (w=0.9), confirming the tag. No further concept in the library is genuinely present.
4. Anchor-extension candidates: `dreams-and-visions` | Ezekiel 1:1 | "the heavens were opened, and I saw visions of God" | w=0.6 — the pack carries 12 anchors but none from Ezekiel, the OT's densest vision book; 1:1 carries the phrase "visions of God" itself.
5. Lexicon candidates: None. (The wheels motif — 'Ezekiel's wheel meaning', 'wheel within a wheel' — is already recorded in ezekiel.md's motif list; lexical search serves the phrase.)
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: none (5 tags; not subdivided — book doc Decisions #1 argues the single-vision call).
9. Decisions record: None.

## Ezekiel 2
2. Existing tags (book doc): `fear-not`, `obedience-to-the-word`, `hardness-of-heart` (3).
3. Applied-tag deltas: No changes — the three stand ("don’t be afraid of them, neither be afraid of their words" 2:6). `boldness-in-witness` was considered for the commission-under-fear substance and passed over: its register is NT evangelism (Acts-anchored), and the prophetic-commission substance here is honestly carried by `fear-not`.
4. Anchor-extension candidates: None — `fear-not`'s pack is dense (10 anchors) and Ezekiel 2:6 adds no distinct query family; considered and passed.
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: none.
9. Decisions record: None.

## Ezekiel 3 (subdivided: 3:1–15 / 3:16–27)
2. Existing tags (book doc): `delight-in-the-word`, `gods-protection`, `fear-not`, `watchman-and-warning`, `hardness-of-heart` (5).
3. Applied-tag deltas: No changes — all five stand; the engine `watchman-and-warning` pack anchors Ezekiel 3:16-21 (w=0.9) itself ("I have made you a watchman to the house of Israel" 3:17), confirming the 2026-08-25 tag against the merged library. The borderline `delight-in-the-word` call (book doc Decisions #26) stands.
4. Anchor-extension candidates: `delight-in-the-word` | Ezekiel 3:1-3 | "It was as sweet as honey in my mouth" | w=0.6 — the pack's three anchors (Ps 1:2; Josh 1:8; Col 3:16) carry no sweetness-of-the-word text; 3:3 is the eaten-scroll anchor 'sweet as honey' queries look for.
5. Lexicon candidates: `delight-in-the-word` | term: 'sweet as honey' | queries: 'God's word sweet as honey', 'eating the scroll meaning', 'sweeter than honey bible verse'.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
9. Decisions record: None.

## Ezekiel 4 (subdivided: 4:1–8 / 4:9–17)
2. Existing tags (book doc): `divine-judgment`, `sin` (2).
3. Applied-tag deltas: No changes — the sign-act chapter honestly carries only these two. The famine rations (4:9-17) stay routed to the `gods-provision` PR #41 lexicon extension per the recorded decline (declines §3.5, Ezekiel item) — famine as judgment imagery, not provision teaching; no tag.
4. Anchor-extension candidates: None.
5. Lexicon candidates: None. (Sign-act motif — 'why did Ezekiel lie on his side' — already in ezekiel.md's motif list.)
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
9. Decisions record: None.

## Ezekiel 5
2. Existing tags (book doc): `divine-judgment`, `sin` (2).
3. Applied-tag deltas: No changes — no further concept genuinely present; the nations-in-sight language (5:8) is scenery, not nations-theme teaching (the ch-27/32 precedent in book doc Decisions #42).
4. Anchor-extension candidates: None.
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: none (not subdivided — Decisions #2).
9. Decisions record: None.

## Ezekiel 6
2. Existing tags (book doc): `divine-judgment`, `repentance`, `idolatry`, `remnant` (4).
3. Applied-tag deltas: No changes — all four stand (borderline `repentance` call, book doc Decisions #27, stands). The recognition-refrain instances (6:7, 10, 13-14) do not individually clear the bar for `knowing-god` per the book doc's global call (Decisions #59, judgment call (a)).
4. Anchor-extension candidates: `remnant` | Ezekiel 6:8-10 | "Yet I will leave a remnant, in that you will have some that escape the sword among the nations" | w=0.7 — the engine pack's seven anchors carry no Ezekiel text; 6:8 is the book's remnant charter.
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: none.
9. Decisions record: Routed, not duplicated: 6:9's lewd-heart unfaithfulness ("play the prostitute after their idols") belongs to `spiritual-adultery` — already on corpus-blocked roster, row 2 (the book doc's tag-gap append lists 6:9 there); routed to the expansion thread's queue.

## Ezekiel 7
2. Existing tags (book doc): `divine-judgment`, `sin`, `day-of-the-lord` (3).
3. Applied-tag deltas: No changes — the three stand. `money-and-possessions` was considered for the worthless-wealth verse (7:19) and passed: one verse of judgment imagery, below the substantial-presence bar.
4. Anchor-extension candidates: `day-of-the-lord` | Ezekiel 7:19 | "Their silver and their gold won’t be able to deliver them in the day of the LORD’s wrath" | w=0.7 — the pack's eight anchors carry no Ezekiel text; 7:19 carries the phrase itself, and 7:7, 10 ("Behold, the day! Behold, it comes!") corroborate the day-oracle register in-chapter. (Contrast the recorded Habakkuk decline, which turned exactly on the phrase's absence — here it is present.)
5. Lexicon candidates: None (pack lexicon already carries the phrase family).
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: none (not subdivided — Decisions #4).
9. Decisions record: None.

## Ezekiel 8
2. Existing tags (book doc): `sin`, `self-deception`, `divine-judgment`, `dreams-and-visions`, `idolatry` (5).
3. Applied-tag deltas: No changes — all five stand; nothing further in the library is genuinely present.
4. Anchor-extension candidates: None — the engine `idolatry` pack is dense (11 anchors, incl. Ezekiel 14:3-7) and the chapter-8 refs already sit on the live tag-gaps `idolatry` row (Micah row append) for curation to weigh; duplicating them here adds nothing.
5. Lexicon candidates: None. ('Weeping for Tammuz' / 'image of jealousy' are curiosity queries lexical search serves; recorded as motif material in the book doc.)
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: none.
9. Decisions record: None.

## Ezekiel 9
2. Existing tags (book doc): `divine-judgment`, `gods-protection`, `remnant` (3).
3. Applied-tag deltas: No changes — the three stand. Ezekiel's plea (9:8) is intercession, which stays routed to `prayer` per the Genesis thread's ruling (declines §3.1); a single in-scene cry, no tag.
4. Anchor-extension candidates: None — the mark-on-forehead material (9:4-6) is already recorded as a motif in ezekiel.md ('mark on the forehead in the Bible'), and `gods-protection`'s Psalm-91 pack is a different register (promise to the trusting, not marking amid judgment); considered and passed.
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: none.
9. Decisions record: None.

## Ezekiel 10
2. Existing tags (book doc): `presence-of-god`, `divine-judgment`, `angels`, `glory-of-god` (4).
3. Applied-tag deltas: No changes — all four stand; the cherubim stay in the throne-bearing register per the book doc's judgment call (Decisions #59 (d)).
4. Anchor-extension candidates: `glory-of-god` | Ezekiel 10:4 | "The LORD’s glory mounted up from the cherub, and stood over the threshold of the house" | w=0.7; `glory-of-god` | Ezekiel 10:18-19 | "The LORD’s glory went out from over the threshold of the house and stood over the cherubim" | w=0.65 — the engine pack anchors the vision's arrival (1:28) and return (43:1-5) but not the departure-by-stages, the passage 'God's glory leaving the temple' queries seek.
5. Lexicon candidates: `glory-of-god` | term: 'the glory departed' | queries: 'God's glory leaving the temple', 'the glory has departed', 'ichabod meaning'.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: none.
9. Decisions record: None.

## Ezekiel 11 (subdivided: 11:1–12 / 11:13–21 / 11:22–25)
2. Existing tags (book doc): `divine-judgment`, `restoration`, `presence-of-god`, `dreams-and-visions`, `new-heart`, `glory-of-god`, `sojourners-and-strangers` (7). `new-heart` is an adopted-list id (source: tag-gaps-review §2 via ezekiel.md New-concept proposals #2; applied on this chapter in the 2026-08-25 pass), not an engine id.
3. Applied-tag deltas: No changes — all seven stand, each with in-chapter substance; the `hardness-of-heart` skip (same-verse duplicate of `new-heart` at 11:19, book doc Decisions #59 skip list) stands.
4. Anchor-extension candidates: `glory-of-god` | Ezekiel 11:22-23 | "The LORD’s glory went up from the middle of the city, and stood on the mountain which is on the east side of the city" | w=0.65 — completes the departure arc with ch-10's candidates above. (The engine `hardness-of-heart` pack already anchors Ezekiel 11:19 at w=0.8 — no extension needed.)
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: subdivided in book doc; 7 tags (above soft cap 6, within ceiling — all standing prior art) — mark for per-verse refinement pass.
9. Decisions record: Routed, not duplicated: the stony-heart/heart-of-flesh promise ("I will take the stony heart out of their flesh, and will give them a heart of flesh" 11:19) is `new-heart` engine material — already on corpus-blocked roster, row 38 (which names Ezek 11:19-20 as blocked); routed to the expansion thread's queue. The display tag stays; no engine candidate is filed here.

## Ezekiel 12 (subdivided: 12:1–20 / 12:21–28)
2. Existing tags (book doc): `divine-judgment`, `self-deception`, `sojourners-and-strangers`, `power-of-gods-word` (4).
3. Applied-tag deltas: No changes — all four stand.
4. Anchor-extension candidates: `power-of-gods-word` | Ezekiel 12:25 | "I will speak, and the word that I speak will be performed. It will be no more deferred" | w=0.65 — the pack's eight anchors carry no performed-without-delay text; this is the anti-"every vision fails" register.
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
9. Decisions record: None.

## Ezekiel 13
2. Existing tags (book doc): `divine-judgment`, `self-deception`, `gods-protection`, `false-prophets`, `occult-and-divination` (5).
3. Applied-tag deltas: No changes — all five stand (borderline `self-deception` call, book doc Decisions #28, stands).
4. Anchor-extension candidates: `false-prophets` | Ezekiel 13:1-16 | "Woe to the foolish prophets, who follow their own spirit, and have seen nothing!" | w=0.8 — the engine pack's nine anchors include Deuteronomy's tests but no Ezekiel text; ch 13 is the OT's fullest false-prophecy indictment (whitewashed wall, peace where there is no peace). `occult-and-divination` | Ezekiel 13:17-23 | "sew magic bands on all elbows and make veils for the head of persons of every stature to hunt souls" | w=0.55 — the practice-for-hire register beside the pack's command-law and narrative anchors.
5. Lexicon candidates: `false-prophets` | term: 'peace when there is no peace' | queries: 'prophets who promise peace', 'peace peace when there is no peace meaning', 'whitewashed wall in the bible' — anchored in-chapter: "who see visions of peace for her, and there is no peace" (13:16; the phrase family is also Jer 6:14; 8:11 territory, one row either way).
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: none (not subdivided — Decisions #5).
9. Decisions record: None.

## Ezekiel 14 (subdivided: 14:1–11 / 14:12–23)
2. Existing tags (book doc): `repentance`, `sin`, `divine-judgment`, `idolatry`, `individual-responsibility`, `remnant` (6).
3. Applied-tag deltas: ADD `unanswered-prayer` — the chapter's first section (14:1-11) is teaching substance on why God refuses to answer: elders come to inquire and God declines because of cherished idols — "these men have taken their idols into their heart" ... "Should I be inquired of at all by them?" (14:3) — the pack's own sin-blocks-answer register (its Prov 21:13 and Lam 3:8, 44 anchors), not the anguished-petition register alone. All six existing tags KEEP.
4. Anchor-extension candidates: `unanswered-prayer` | Ezekiel 14:1-8 | "Should I be inquired of at all by them?" | w=0.5 — serves 'why doesn't God answer my prayers' with the heart-idols answer. `individual-responsibility` | Ezekiel 14:14-20 | "though these three men, Noah, Daniel, and Job, were in it, they would deliver only their own souls by their righteousness" | w=0.6 — the pack's five anchors are all Ezek 18/33 + Jer/Deut statements; this is the narrative argument of the same charter.
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass. Now 7 tags (above soft cap 6, within ceiling 8).
9. Decisions record: The ADD takes the chapter from 6 to 7 tags; recorded deliberately — each of the seven independently clears the presence bar, and the refused-inquiry section is a main movement of the chapter (11 verses), not a thin touch. Register caveat carried for curation: 14:3 is God refusing corrupt inquiry, one biblical answer to the unanswered-prayer question, not a promise-side text. (Cross-ref: the book doc rejected `asking-in-gods-will` on these same verses, Decisions #17, as the depicted failure mode of that concept — this add is a different concept whose gist is the failure case itself; no conflict with that standing rejection.)

## Ezekiel 15
2. Existing tags (book doc): `divine-judgment` (1, with the single-tag note).
3. Applied-tag deltas: No changes — honest-and-single stands against the full library; the vine-wood parable belongs to no other concept without a read-back (`abiding-in-christ`'s vine is John 15 substance; tagging it here would be a later-revelation read-back).
4. Anchor-extension candidates: None.
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: none.
9. Decisions record: None.

## Ezekiel 16 (subdivided: 16:1–34 / 16:35–58 / 16:59–63)
2. Existing tags (book doc): `covenant`, `divine-judgment`, `sin`, `gods-faithfulness`, `forgiveness-of-sins`, `spiritual-adultery`, `shame`, `idolatry` (8 — at the hard ceiling). `spiritual-adultery` is an adopted-list id (source: live Hosea tag-gaps row, cited in ezekiel.md's append list; applied 2026-08-25), not an engine id.
3. Applied-tag deltas: No changes — all eight stand; the chapter is at the ceiling and no candidate displaces any of them (the engine `shame` pack itself anchors 16:61-63 at w=0.65, confirming that tag).
4. Anchor-extension candidates: `covenant` | Ezekiel 16:59-63 | "Nevertheless I will remember my covenant with you in the days of your youth, and I will establish an everlasting covenant with you" | w=0.7 — the engine pack's eleven anchors carry no Ezekiel text and no 'everlasting covenant' phrase; 16:60 is the covenant-remembered-and-remade keystone of the book's harshest allegory.
5. Lexicon candidates: `covenant` | term: 'everlasting covenant' | queries: 'everlasting covenant in the bible', 'what is the everlasting covenant', 'God remembers his covenant'.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: HARD CEILING (8 tags) and subdivided in book doc — mark for per-verse refinement pass (the three BSB sections give the ranges: the ceiling pressure sits in 16:1–34 vs 16:59–63).
9. Decisions record: Standing yields reaffirmed, not re-litigated: `restoration` trimmed at assembly (book doc Decisions #46) and `justice-and-oppression` 16:49 skipped at the ceiling with its ref kept on the log row (Decisions #59 skip list). This sweep adds no candidate that would force a new yield. Routed, not duplicated: the allegory's register ("Adulterous wife, who takes strangers instead of her husband!" 16:32) is `spiritual-adultery` engine material — already on corpus-blocked roster, row 2 (which names Ezek 16 as a minting book); routed to the expansion thread's queue.

## Ezekiel 17 (subdivided: 17:1–10 / 17:11–24)
2. Existing tags (book doc): `covenant`, `divine-judgment`, `humble-exaltation`, `oaths-and-vows`, `messianic-prophecy` (5).
3. Applied-tag deltas: No changes — all five stand (borderline `humble-exaltation` single-verse call, book doc Decisions #30, stands; the `messianic-prophecy` tag keeps the book doc's signpost-only, no-identification framing).
4. Anchor-extension candidates: `messianic-prophecy` | Ezekiel 17:22-24 | "I will crop off from the topmost of its young twigs a tender one, and I will plant it on a high and lofty mountain" | w=0.6 — the pack's eleven anchors carry no Ezekiel text; the planted-sprig promise belongs to the same query family as its Isa 11:1 branch anchors (gist must stay on the text's own terms, per the book doc's standing neutral framing). `humble-exaltation` | Ezekiel 17:24 | "I, the LORD, have brought down the high tree, have exalted the low tree" | w=0.6 — a verbatim concept statement absent from the pack. `oaths-and-vows` | Ezekiel 17:16-19 | "I will surely bring on his own head my oath that he has despised and my covenant that he has broken" | w=0.55 — the vassal-oath-as-God's-own register beside the pack's teaching anchors. `trusting-in-man` | Ezekiel 17:15, 17 | "Pharaoh with his mighty army and great company won’t help him in the war" | w=0.5 — the Egypt-for-horses reliance ("sending his ambassadors into Egypt, that they might give him horses and many people" 17:15) is the pack's own broken-reed register (its Ezek 29:6-7 anchor); below the tag bar in-chapter (subordinate to the oath charge) but a fit anchor.
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
9. Decisions record: `trusting-in-man` considered as a tag ADD and passed — the Egypt-reliance is real but subordinate (two verses inside the oath-breaking indictment); anchor candidate filed instead, no yield involved.

## Ezekiel 18
2. Existing tags (book doc): `sin`, `repentance`, `forgiveness-of-sins`, `divine-judgment`, `individual-responsibility`, `justice-and-oppression`, `new-heart` (7). `new-heart` is an adopted-list id (source: tag-gaps-review §2 via ezekiel.md New-concept proposals #2; applied 2026-08-25), not an engine id.
3. Applied-tag deltas: No changes — all seven stand; the engine `individual-responsibility` pack anchors 18:19-20 (w=1.0) and 18:1-4 (w=0.95), and `repentance` anchors 18:30-32 (w=0.65), confirming the set.
4. Anchor-extension candidates: `justice-and-oppression` | Ezekiel 18:7-8 | "has restored to the debtor his pledge, has taken nothing by robbery, has given his bread to the hungry" | w=0.5 — the righteous-man ledger defines righteousness as justice to the vulnerable ("has executed true justice between man and man" 18:8); the pack's ten anchors carry no Ezekiel text. NOTE: Ezekiel 18 IS in the fixture corpus — this candidate is measurable now, unlike every other row in this chunk.
5. Lexicon candidates: `repentance` | term: 'no pleasure in the death of the wicked' | queries: 'does God take pleasure in punishing the wicked', 'God doesn't want anyone to perish', 'turn and live bible verse' — anchored in-chapter: "Have I any pleasure in the death of the wicked?" (18:23) and "Therefore turn yourselves, and live!" (18:32). (This carries forward the book doc's own checked-covered note routing 18:23, 32; 33:11 to a `repentance` lexicon extension — filed here as the formal candidate.)
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: 7 tags (above soft cap 6, within ceiling — all standing prior art); not subdivided in book doc, so no subdivision flag.
9. Decisions record: Routed, not duplicated: "make yourself a new heart and a new spirit" (18:31) is `new-heart` engine material — already on corpus-blocked roster, row 38 (whose reason itself records that Ezek 18:31 sits inside `repentance`'s 18:30-32 anchor); routed to the expansion thread's queue. The display tag stays.

## Ezekiel 19
2. Existing tags (book doc): `lament` (1).
3. Applied-tag deltas: No changes — the single `lament` tag stands: a commanded dirge from first line to last ("take up a lamentation for the princes of Israel" 19:1; "This is a lamentation, and shall be for a lamentation" 19:14), squarely the composed-lament practice the concept documents (the 2 Sam 1:17-27 register already in its pack), not the personal-grief register the §1(c) declines guard. The book doc's Decisions #39 zero-tag history and its 2026-08-25 supersession both honored.
4. Anchor-extension candidates: `lament` | Ezekiel 19:1-14 | "This is a lamentation, and shall be for a lamentation" | w=0.5 — a complete commanded dirge; the pack's nine anchors include one composed-dirge text (2 Sam 1:17-27, w=0.6) and nothing from Ezekiel.
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: none.
9. Decisions record: None.

## Ezekiel 20 (subdivided: 20:1–9 / 20:10–26 / 20:27–32 / 20:33–44 / 20:45–49)
2. Existing tags (book doc): `sin`, `gods-faithfulness`, `sabbath-rest`, `divine-judgment`, `restoration`, `gods-holy-name`, `idolatry`, `knowing-god` (8 — at the hard ceiling). `gods-holy-name` is an adopted-list id (source: tag-gaps-review §2 via ezekiel.md New-concept proposals #5; applied 2026-08-25), not an engine id.
3. Applied-tag deltas: No changes — all eight stand (borderline `gods-faithfulness` call, book doc Decisions #29, stands; `knowing-god` is applied here under the book doc's global call because the recognition theme is the oracle's developed point, not a refrain instance).
4. Anchor-extension candidates: `sabbath-rest` | Ezekiel 20:12 | "I gave them my Sabbaths, to be a sign between me and them, that they might know that I am the LORD who sanctifies them" | w=0.6 — the covenant-sign register; the pack's eight anchors carry the Exod 31:13-17 sign text at only w=0.6 and nothing from the prophets.
5. Lexicon candidates: None ('for my name's sake' phrasings belong to the corpus-blocked `gods-holy-name` row — routed below, not filed here).
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: HARD CEILING (8 tags) and subdivided in book doc (five BSB sections) — mark for per-verse refinement pass.
9. Decisions record: (a) Routed, not duplicated: the name's-sake engine of the chapter ("I worked for my name’s sake" 20:9, 14, 22; verdict at 20:44) is `gods-holy-name` material — already on corpus-blocked roster, row 8 (which names Ezek 20:9-44 among the blocked refs); routed to the expansion thread's queue. The display tag stays. (b) `unanswered-prayer` considered for the refused inquiry ("I will not be inquired of by you" 20:3, 31) and passed — here it is the oracle's frame (three verses), not developed teaching, and the chapter stands at the ceiling; the substance is carried by the chapter-14 add, where the refusal is argued at length. Not a yield (did not clear the bar here).

## Ezekiel 21
2. Existing tags (book doc): `divine-judgment`, `humble-exaltation`, `occult-and-divination`, `messianic-prophecy` (4).
3. Applied-tag deltas: No changes — all four stand; the `occult-and-divination` tag keeps its described-never-taught framing, and the `messianic-prophecy` tag keeps the fulfillment-neutral framing the book doc standardized (21:27 is contested territory; the justification asserts no identification).
4. Anchor-extension candidates: `messianic-prophecy` | Ezekiel 21:26-27 | "I will overturn, overturn, overturn it. This also will be no more, until he comes whose right it is; and I will give it" | w=0.5 — the suspended-crown text; gist must stay on the text's own terms (fulfillment-neutral), per the standing framing.
5. Lexicon candidates: `messianic-prophecy` | term: 'until he comes whose right it is' | queries: 'until he comes whose right it is meaning', 'Ezekiel 21:27 meaning', 'overturn overturn overturn' — a phrase-locator row in the pack's existing 'the branch prophecy' pattern.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: none (single BSB anchor; movements noted in book doc Decisions #7).
9. Decisions record: None.

## Ezekiel 22 (subdivided: 22:1–16 / 22:17–22 / 22:23–31)
2. Existing tags (book doc): `sin`, `divine-judgment`, `justice-and-oppression`, `false-prophets` (4).
3. Applied-tag deltas: No changes — all four stand. Considered and passed: `sabbath-rest` (22:8, a sin-list item, thin), `taming-the-tongue` (22:9 slander in a national charge sheet, not speech teaching).
4. Anchor-extension candidates: `justice-and-oppression` | Ezekiel 22:29 | "they have troubled the poor and needy, and have oppressed the foreigner wrongfully" | w=0.55 — the charge-sheet register (22:7, 12 corroborate in-chapter). `prayer` | Ezekiel 22:30 | "I sought for a man among them who would build up the wall and stand in the gap before me for the land, that I would not destroy it; but I found no one" | w=0.5 — anchor for the lexicon row below, honoring the intercession→`prayer` routing.
5. Lexicon candidates: `prayer` | term: 'standing in the gap' | queries: 'standing in the gap in prayer', 'stand in the gap bible verse', 'God looked for a man to stand in the gap' — per the recorded decline (declines §3.5, Ezekiel item: intercession routes to `prayer` per the Genesis thread's ruling, with 'standing in the gap' flagged as a heavy query phrase for a `prayer` — or `praying-for-leaders` — lexicon extension). This is that flagged extension filed formally, not a decline overturn.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
9. Decisions record: None.

## Ezekiel 23 (subdivided: 23:1–21 / 23:22–35 / 23:36–49)
2. Existing tags (book doc): `sin`, `divine-judgment`, `spiritual-adultery`, `idolatry` (4). `spiritual-adultery` is an adopted-list id (source: live Hosea tag-gaps row, cited in ezekiel.md's append list; applied 2026-08-25), not an engine id.
3. Applied-tag deltas: No changes — all four stand. Considered and passed: `drunkenness` for the cup of 23:33 — judgment imagery, not the practice, matching the recorded Jeremiah 13:13 decline ground (declines §3.5); no tag and no overturn proposed.
4. Anchor-extension candidates: None new — the chapter's engine-side material is the routed row below.
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
9. Decisions record: Routed, not duplicated: the two-sisters allegory ("Because you have forgotten me and cast me behind your back" 23:35) is `spiritual-adultery` engine material — already on corpus-blocked roster, row 2 (which names Ezek 23 as a minting book); routed to the expansion thread's queue.

## Ezekiel 24 (subdivided: 24:1–14 / 24:15–27)
2. Existing tags (book doc): `divine-judgment`, `pastoral-grief-and-loss`, `sin` (3).
3. Applied-tag deltas: No changes — all three stand. `pastoral-grief-and-loss` is the book's one pastoral-register tag, argued individually in book doc Decisions #24 (a real personal bereavement: "I will take away from you the desire of your eyes with one stroke" 24:16) — kept as the standing call. `lament` considered and passed: the chapter's grief is commanded silence, not the composed-lament practice — the same personal-grief/lament-practice boundary the §1(c) three-book decline pattern records; no tag and no overturn proposed.
4. Anchor-extension candidates: None — pastoral-pack anchors are curated under the pastoral-care review discipline, not via sweep rows; the 'desire of your eyes' material is already in ezekiel.md's motif list.
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
9. Decisions record: None.

## Ezekiel 25 (subdivided: 25:1–7 / 25:8–11 / 25:12–14 / 25:15–17)

**Existing tags (book doc):** `divine-judgment`; `nations-and-peoples`; `vengeance`; `gloating-over-downfall`

**Applied-tag deltas:** No changes — all four stand. KEEP `divine-judgment` — four "because … therefore" sentences executed on Ammon, Moab, Edom, Philistia (25:4–7, 9–11, 13–14, 16–17). KEEP `nations-and-peoples` — four named neighbor peoples addressed in turn (25:2–3, 8, 12, 15). KEEP `vengeance` — Edom judged for “taking vengeance” (25:12) and God claims the recompense: “I will lay my vengeance on Edom by the hand of my people Israel.” (25:14). KEEP `gloating-over-downfall` (adopted id, adopted-concepts-canonical.md, engine-built: no) — the “Aha!” of 25:3 and the clapping and stamping “with all the contempt of your soul” (25:6). No untagged 239/adopted concept shows honest substantial presence.

**Anchor-extension candidates:** None — the chapter's candidate refs are lexically self-serving ("vengeance" is verbatim in 25:12–17), and the gloating refs are already on the corpus-blocked roster (see Decisions).

**Lexicon candidates:** None.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** book-doc subdivision (4 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `gloating-over-downfall` engine-side findings (25:3, 6) ROUTED: already on corpus-blocked roster, row 14 (the row's recorded reason itself cites Ezek 25:3, 6) — no duplicate candidate emitted.
- `vengeance` anchor extension considered for 25:12–17 and not emitted: "vengeance" appears verbatim five times in the span; bare lexical retrieval already serves it (expected NO MEASURABLE EFFECT).

## Ezekiel 26

**Existing tags (book doc):** `divine-judgment`; `gloating-over-downfall`

**Applied-tag deltas:** No changes — both stand. KEEP `divine-judgment` — “Behold, I am against you, Tyre” (26:3), the Nebuchadnezzar siege (26:7–12), and “You will be built no more” (26:14). KEEP `gloating-over-downfall` (adopted id, adopted-concepts-canonical.md, engine-built: no) — Tyre's “Aha! She is broken! She who was the gateway of the peoples has been returned to me.” (26:2) is the stated ground of the sentence. No untagged concept clears the bar.

**Anchor-extension candidates:** None.

**Lexicon candidates:** None.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** none (not subdivided; 2 tags).

**Decisions record:**
- `gloating-over-downfall` engine-side finding (26:2) ROUTED: already on corpus-blocked roster, row 14 (26:2 is cited in the row's reason).
- `lament` considered for the princes' dirge — “They will take up a lamentation over you” (26:17) — and NOT added: one quoted dirge inside a judgment oracle, thin single-scene; the commanded-lament practice's home in this block is ch. 27 (whole-chapter dirge).
- `mortality` considered for 26:20's descent “with those who go down to the pit” and NOT added: single verse; the Sheol material's chapter-level home is chs. 31–32, per the book doc's mortality routing.

## Ezekiel 27

**Existing tags (book doc):** none — the book doc's honest-and-empty zero-tag chapter ("no concept in the current vocabulary is genuinely present").

**Applied-tag deltas:**
- ADD `lament` (engine id, concept-inventory.md) — the chapter IS a commanded lamentation, start to finish: “take up a lamentation over Tyre” (27:2), performed and taught to the mourners — “In their wailing they will take up a lamentation for you, and lament over you” (27:32). This is the composed/commanded-dirge register the `lament` pack itself anchors (2 Samuel 1:17–27), not the raw personal grief the §1(c) boundary excludes; the book doc's own tag-gap append already routed 27:1–36 to the live `lament` row. The zero-tag call was honest against the 131-id vocabulary of 2026-08-23; `lament` entered the engine library since. (Only one honest tag from the current vocabulary.)

**Anchor-extension candidates:** None — "lamentation"/"lament" are verbatim in 27:2, 32, so lexical retrieval already lands the chapter.

**Lexicon candidates:** None.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** none (not subdivided; 1 tag after delta).

**Decisions record:**
- `money-and-possessions` considered for the wealth catalog and its collapse — “You have come to a terrible end, and you will be no more.” (27:36) — and NOT added: the chapter depicts riches perishing but carries no money teaching; the book doc's covered-note routing (wealth-collapse as a Tyre-oracle motif, lexicon color for `love-not-the-world` / `humble-exaltation` at most) stands.

## Ezekiel 28 (subdivided: 28:1–10 / 28:11–19 / 28:20–24 / 28:25–26)

**Existing tags (book doc):** `humble-exaltation`; `divine-judgment`; `restoration`; `restoration-of-israel`; `mortality`

**Applied-tag deltas:** No changes — all five stand. KEEP `humble-exaltation` — “Because your heart is lifted up, and you have said, ‘I am a god” (28:2) answered by “Your heart was lifted up because of your beauty.” (28:17) and the casting down. KEEP `divine-judgment` — strangers drawn against the prince (28:7–8), the king turned to ashes (28:18), judgments in Sidon (28:22–23). KEEP `restoration` and KEEP `restoration-of-israel` — “When I have gathered the house of Israel from the peoples among whom they are scattered” (28:25), dwelling securely, building and planting (28:26); both registers per the both-tags ruling. KEEP `mortality` — “yet you are man, and no god” (28:2), pressed to death “by the hand of strangers” (28:10).

**Anchor-extension candidates:**
- `humble-exaltation` | Ezekiel 28:2, 17 | “Because your heart is lifted up, and you have said, ‘I am a god” … “Your heart was lifted up because of your beauty.” | w=0.6 — the pack has no Ezekiel anchor; Ezek 28 is a classic pride-and-fall passage, and the recorded declines already route Ezekiel's pride refs to `humble-exaltation` (PR #41 lexicon extension) — this is that route's anchor-side completion, not a new claim.

**Lexicon candidates:** None.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** book-doc subdivision (4 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- Ezekiel 28:12–19 and the `satan` pack: deliberately NOT proposed, following the recorded contested-call ruling (§1(e)) — appending the king-of-Tyre-in-Eden lament to `satan` would adjudicate an identification the text does not make. No new textual evidence; the standing rule holds.
- `lament` considered for the commanded dirge section (“take up a lamentation over the king of Tyre”, 28:12) and NOT added: the dirge frames one of four sections, and its substance (pride, fall, death) is already carried by `humble-exaltation`, `divine-judgment`, and `mortality` — adding the genre tag here would be broad-duplicating-specific.

## Ezekiel 29 (subdivided: 29:1–7 / 29:8–16 / 29:17–21)

**Existing tags (book doc):** `divine-judgment`; `providence`; `trusting-in-man`

**Applied-tag deltas:** No changes — all three stand. KEEP `divine-judgment` — “Behold, I am against you, Pharaoh king of Egypt” (29:3), hooks, sword, and forty years' desolation (29:4–12). KEEP `providence` — God pays history's wages: “I have given him the land of Egypt as his payment for which he served, because they worked for me” (29:20). KEEP `trusting-in-man` — the charge is what Egypt was to Israel's trust: “they have been a staff of reed to the house of Israel” (29:6), and restored Egypt will no longer be “the confidence of the house of Israel” (29:16); the pack itself anchors 29:6–7.

**Anchor-extension candidates:**
- `providence` | Ezekiel 29:19–20 | “I have given him the land of Egypt as his payment for which he served, because they worked for me” | w=0.55 — concept-vocabulary case: "does God use evil rulers" / "God is in control of governments" queries share no words with this passage; the book doc's motif list already flags 29:18–20 as a `providence` lexicon-anchor candidate.

**Lexicon candidates:**
- `trusting-in-man` | "staff of reed" / "broken reed" | queries: "staff of reed meaning"; "leaning on a broken reed"; "trusting in egypt in the bible". (The pack anchors 29:6–7 but its lexicon lacks the reed image, which is how users cite this text — Isa 36:6 shares it.)

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:** None.

## Ezekiel 30 (subdivided: 30:1–19 / 30:20–26)

**Existing tags (book doc):** `divine-judgment`; `providence`; `day-of-the-lord`

**Applied-tag deltas:** No changes — all three stand. KEEP `divine-judgment` — “Thus I will execute judgments on Egypt. Then they will know that I am the LORD.” (30:19). KEEP `providence` — “I will strengthen the arms of the king of Babylon, and put my sword in his hand; but I will break the arms of Pharaoh” (30:24). KEEP `day-of-the-lord` — the named day opens the oracle: “For the day is near, even the LORD’s day is near. It will be a day of clouds, a time of the nations.” (30:3).

**Anchor-extension candidates:**
- `day-of-the-lord` | Ezekiel 30:2–3 | “For the day is near, even the LORD’s day is near. It will be a day of clouds, a time of the nations.” | w=0.6 — the pack has no Ezekiel anchor, and there is ordering value: the WEB here reads “the LORD’s day”, not the pack's lexicon phrase "the day of the lord", so concept anchoring (not just lexical luck on {day, lord}) is what ranks this passage for the query family.

**Lexicon candidates:** None.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** book-doc subdivision (2 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `idolatry` considered for “I will also destroy the idols” (30:13) and NOT added: single verse inside a city-by-city judgment list, not idolatry teaching; the book doc's tag-gap `idolatry` append already carries 30:13 as a ref, which suffices.

## Ezekiel 31

**Existing tags (book doc):** `humble-exaltation`; `divine-judgment`; `mortality`

**Applied-tag deltas:** No changes — all three stand. KEEP `humble-exaltation` — “his heart is lifted up in his height” (31:10) and the stated moral of the fall: “to the end that none of all the trees by the waters exalt themselves in their stature” (31:14). KEEP `divine-judgment` — “I have driven him out for his wickedness.” (31:11), the cedar cut off by foreigners (31:12). KEEP `mortality` — the great tree “went down to Sheol” (31:15) and greatness ends “in the middle of the uncircumcised, with those who are slain by the sword.” (31:18).

**Anchor-extension candidates:**
- `humble-exaltation` | Ezekiel 31:10–14 | “to the end that none of all the trees by the waters exalt themselves in their stature” | w=0.6 — concept-vocabulary case: the cedar parable teaches pride-and-fall without using "pride" or "humble", so lexical search cannot serve "pride comes before a fall"-family queries here; pairs with the ch. 28 candidate (one curation decision).

**Lexicon candidates:** None.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** none (not subdivided; 3 tags).

**Decisions record:**
- Sheol refs (31:15–18) deliberately NOT proposed for `hell`, per the recorded Ezekiel decline ("deliberately NOT `hell` (a read-back), routed via the `mortality` append") — followed, not re-litigated; the mortality anchor candidate sits on ch. 32 where the Sheol material is densest.

## Ezekiel 32 (subdivided: 32:1–16 / 32:17–32)

**Existing tags (book doc):** `divine-judgment`; `mortality`

**Applied-tag deltas:**
- ADD `lament` (engine id, concept-inventory.md) — both halves of the chapter are commanded lament: “take up a lamentation over Pharaoh king of Egypt” (32:2), with the dirge then prescribed for performance — “This is the lamentation with which they will lament.” (32:16) — and the second oracle commanded as a wail over the multitude (32:18). Commanded/taught dirge register, matching the pack's 2 Samuel 1:17–27 anchor and the book doc's own tag-gap append of 32:1–16 to the `lament` row.
- KEEP `divine-judgment` — “I will spread out my net on you with a company of many peoples.” (32:3), the sky darkened (32:7–8), nation after nation laid in the pit (32:18–32). KEEP `mortality` — the Sheol roll call: Egypt wailed down “to the lower parts of the earth, with those who go down into the pit” (32:18), where the nations lie “all of them uncircumcised, slain by the sword” (32:25).

**Anchor-extension candidates:**
- `mortality` | Ezekiel 32:18–32 | “to the lower parts of the earth, with those who go down into the pit” | w=0.45 — the pack has no Ezekiel anchor; this is the OT's densest descent-to-the-grave text and the recorded decline routes Sheol/pit queries here rather than to `hell`. Low weight: register is death-as-leveler-of-nations, adjacent to but not identical with the pack's life-is-short core.

**Lexicon candidates:**
- `mortality` | "sheol" / "the pit" | queries: "what is sheol"; "the pit in the bible"; "where do the dead go in the old testament". (Serves the decline's routing — these queries must not land on `hell`.)

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** book-doc subdivision (2 sections) — mark for the per-verse refinement pass.

**Decisions record:** None.

## Ezekiel 33 (subdivided: 33:1–9 / 33:10–20 / 33:21–33)

**Existing tags (book doc):** `repentance`; `divine-judgment`; `obedience-to-the-word`; `watchman-and-warning`; `individual-responsibility`; `empty-worship`

**Applied-tag deltas:** No changes — all six stand (soft cap exactly). KEEP `repentance` — “Turn, turn from your evil ways! For why will you die, house of Israel?” (33:11) and the turning wicked who “will surely live” (33:14–16). KEEP `divine-judgment` — sword, animals, and pestilence on the presuming survivors (33:27–29). KEEP `obedience-to-the-word` — “they hear your words, but don’t do them” (33:31–32); the pack itself anchors 33:31–32. KEEP `watchman-and-warning` — the recommission (33:1–9); the pack's keystone anchor is 33:1–9. KEEP `individual-responsibility` — “House of Israel, I will judge every one of you after his ways.” (33:20); pack anchors 33:20. KEEP `empty-worship` — the “very lovely song” hearers (33:32); pack anchors 33:30–32.

**Anchor-extension candidates:**
- `repentance` | Ezekiel 33:11 | “I have no pleasure in the death of the wicked, but that the wicked turn from his way and live. Turn, turn from your evil ways! For why will you die, house of Israel?” | w=0.7 — the pack anchors 18:30–32 but not this restatement under oath, which is the verse users quote; executes the recorded decline's own routing ("God desires none to perish … lexicon-extension candidate for `repentance`, not a gap").

**Lexicon candidates:**
- `repentance` | "no pleasure in the death of the wicked" / "turn and live" | queries: "does god want to punish people"; "god doesn't want anyone to perish"; "why will you die turn and live". (Same decline-aligned routing; cited to §3.5's Ezekiel note.)

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** soft cap 6 hit (exactly 6, each clearing the bar); book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- Intercession-adjacent material: none in this chapter, but noting for the record that the sweep follows the standing intercession→`prayer` ruling wherever it surfaces in Ezekiel (the 22:30 "stand in the gap" flag belongs to the 13–24 chunk).

## Ezekiel 34 (subdivided: 34:1–10 / 34:11–24 / 34:25–31)

**Existing tags (book doc):** `divine-judgment`; `restoration`; `gods-provision`; `covenant`; `blessing`; `shepherds-and-the-flock`; `justice-and-oppression`; `restoration-of-israel`

**Applied-tag deltas:** No changes — all eight stand at the hard ceiling, each independently clearing the bar. KEEP `divine-judgment` — “Behold, I am against the shepherds. I will require my sheep at their hand” (34:10). KEEP `restoration` — the flock delivered and brought back (34:12–13). KEEP `gods-provision` — “I will feed them with good pasture” (34:14). KEEP `covenant` — “I will make with them a covenant of peace” (34:25). KEEP `blessing` — “There will be showers of blessing.” (34:26). KEEP `shepherds-and-the-flock` — the controlling figure (34:2–31); the pack anchors 34:11–16. KEEP `justice-and-oppression` — shepherds who “ruled over them with force and with rigor” (34:4) answered by “I will feed them in justice.” (34:16) and judgment between fat and lean sheep (34:20–22). KEEP `restoration-of-israel` — the flock is scattered Israel gathered home (34:12–13, 23–24).

**Anchor-extension candidates:**
- `messianic-prophecy` | Ezekiel 34:23–24 | “I will set up one shepherd over them, and he will feed them, even my servant David.” | w=0.6 — the pack has no Ezekiel anchor; carried strictly on the text's own terms (the promised Davidic shepherd-prince), no identification asserted — the same fulfillment-neutral handling the book doc's entry and the recorded shepherd routing history use (Davidic-shepherd refs were routed to the messianic row at critic Round 3, not to a shepherd row).

**Lexicon candidates:**
- `blessing` | "showers of blessing" | queries: "showers of blessing verse"; "there shall be showers of blessing"; "what are showers of blessing". (Hymn-driven phrase, verbatim at 34:26; the pack lexicon lacks it. Curation note from the book doc's motif list stands: covenant gift, never prosperity formula.)

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** hard ceiling 8 hit; book-doc subdivision (3 sections) — mark for the per-verse refinement pass (the yielded tag below survives there as an exact verse range).

**Decisions record:**
- Cross-thread shepherd routing history checked before proposing anything (per the standing instruction): the staged `god-our-shepherd` row was converted at critic Round 3 to a ref-append on the live Zechariah `shepherds-and-the-flock` row; the bad-shepherds register of Ezek 34 is named in the corpus-blocked roster's "Additional re-open notes" (with John 10 / John 21) — so the bad-shepherds engine-side finding (34:2–10) is ROUTED to the expansion thread's queue under that re-open note, not emitted as a candidate here.
- §11.6 yield: `messianic-prophecy` arguably clears the bar at 34:23–24 (“even my servant David”), but the chapter stands at the ceiling of 8; it yields as thin single-scene against the eight standing tags (its theme's chapter home is ch. 37, where it is tagged). Not a silent drop — recorded here, served by the anchor-extension candidate above and the per-verse refinement flag.

## Ezekiel 35

**Existing tags (book doc):** `divine-judgment`; `envy-and-jealousy`; `vengeance`

**Applied-tag deltas:**
- ADD `gloating-over-downfall` (adopted id, adopted-concepts-canonical.md, engine-built: no) — Edom's rejoicing over Israel's fall is the chapter's named charge and measure of its sentence: the insults “They have been laid desolate. They have been given to us to devour.” (35:12) and the sentence in kind, “As you rejoiced over the inheritance of the house of Israel because it was desolate, so I will do to you.” (35:15). Same substance for which chs. 25–26 carry the tag; the book doc's own tag-gap append lists 35:15 among the gloating refs. Chapter moves to 4 tags.
- KEEP `divine-judgment` — “I will make you a perpetual desolation, and your cities will not be inhabited.” (35:9). KEEP `envy-and-jealousy` — “I will do according to your anger, and according to your envy which you have shown out of your hatred against them” (35:11). KEEP `vengeance` — the “perpetual hostility” that gave Israel to the sword (35:5), answered by God in Edom's own measure (35:11).

**Anchor-extension candidates:** None (the gloating refs route to the roster — see Decisions).

**Lexicon candidates:** None.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** none (not subdivided; 4 tags after delta).

**Decisions record:**
- `gloating-over-downfall` engine-side findings (35:12, 15) ROUTED: already on corpus-blocked roster, row 14 — 35:15 extends the row's Ezekiel refs (25:3, 6; 26:2), noted for the expansion queue, no duplicate candidate.

## Ezekiel 36 (subdivided: 36:1–15 / 36:16–38)

**Existing tags (book doc):** `restoration`; `forgiveness-of-sins`; `covenant`; `new-heart`; `gods-holy-name`; `restoration-of-israel`; `outpouring-of-the-spirit`; `shame`

**Applied-tag deltas:** No changes — all eight stand at the hard ceiling. KEEP `restoration` — waste cities rebuilt, the land “like the garden of Eden” (36:35), renewal reaching the heart (36:26). KEEP `forgiveness-of-sins` — “I will sprinkle clean water on you, and you will be clean. I will cleanse you from all your filthiness and from all your idols.” (36:25). KEEP `covenant` — “You will be my people, and I will be your God.” (36:28). KEEP `new-heart` (adopted id, adopted-concepts-canonical.md, engine-built: no) — “I will also give you a new heart, and I will put a new spirit within you.” (36:26). KEEP `gods-holy-name` (adopted id, adopted-concepts-canonical.md, engine-built: no) — “I don’t do this for your sake, house of Israel, but for my holy name” (36:22). KEEP `restoration-of-israel` — mountains tilled and sown for returning Israel (36:8–11, 24); the pack anchors 36:24–28. KEEP `outpouring-of-the-spirit` (adopted id, adopted-concepts-canonical.md, engine-built: no) — “I will put my Spirit within you, and cause you to walk in my statutes.” (36:27). KEEP `shame` — self-loathing remembrance as a step inside restoration (36:31–32); the pack anchors 36:31–32.

**Anchor-extension candidates:**
- `forgiveness-of-sins` | Ezekiel 36:25 | “I will sprinkle clean water on you, and you will be clean. I will cleanse you from all your filthiness and from all your idols.” | w=0.6 — the pack has no Ezekiel anchor; its lexicon already carries "washed clean", which shares no surface words with this passage's "sprinkle/cleanse" vocabulary — a concept-vocabulary ordering case.

**Lexicon candidates:** None (the "heart of stone" query family belongs to the corpus-blocked `new-heart` row — routed below, not duplicated here).

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** hard ceiling 8 hit; book-doc subdivision (2 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `new-heart` engine-side findings (36:25–27) ROUTED: already on corpus-blocked roster, row 38 (the row cites Ezek 36:25–27 as blocked refs; the one-or-two design with `circumcision-of-the-heart` is reserved to the re-pin curator).
- `gods-holy-name` engine-side findings (36:20–23) ROUTED: already on corpus-blocked roster, row 8 (the row cites Ezek 36:20–23).
- `outpouring-of-the-spirit` is adopted display vocabulary with no engine pack and no roster row; curation material noted for its eventual pack: 36:27 (with 37:14; 39:29). Display tag stands; nothing engine-side emitted.
- §11.6 yield: `holy-spirit` (engine id; its pack anchors 36:26–27) clears the bar on the same verses but the chapter is at the ceiling; it yields as broad-duplicating-specific — `outpouring-of-the-spirit` and `new-heart` carry the identical in-chapter substance. Recorded, not silent; the engine pack already owns the 36:26–27 anchor, so no candidate is lost.

## Ezekiel 37 (subdivided: 37:1–14 / 37:15–28)

**Existing tags (book doc):** `restoration`; `dreams-and-visions`; `hope-in-god`; `covenant`; `presence-of-god`; `restoration-of-israel`; `resurrection-of-the-dead`; `messianic-prophecy`

**Applied-tag deltas:** No changes — all eight stand at the hard ceiling. KEEP `restoration` — graves opened, the nation brought home (37:12), two kingdoms made one (37:22). KEEP `dreams-and-visions` — the Spirit-carried vision God himself interprets (37:1–2, 11). KEEP `hope-in-god` — “Our bones are dried up, and our hope is lost.” (37:11) answered by “I will put my Spirit in you, and you will live.” (37:14). KEEP `covenant` — “Moreover I will make a covenant of peace with them. It will be an everlasting covenant with them.” (37:26). KEEP `presence-of-god` — “My tent also will be with them. I will be their God, and they will be my people.” (37:27). KEEP `restoration-of-israel` — “these bones are the whole house of Israel” (37:11); the pack's keystone anchor is 37:11–14. KEEP `resurrection-of-the-dead` — carried exactly as the book doc's signposted, non-adjudicating entry states. KEEP `messianic-prophecy` — “My servant David will be king over them. They all will have one shepherd.” (37:24), on the text's own terms.

**Anchor-extension candidates:**
- `resurrection-of-the-dead` | Ezekiel 37:1–14 | “Son of man, can these bones live?” | w=0.5 — the pack has no Ezekiel anchor, and "dry bones"/"can these bones live" searchers land in this query family; carried with the book doc's standing caveat verbatim in spirit: the text's own referent is national restoration (37:11), and the anchor asserts nothing beyond the historic secondary hearing the entry already signposts.
- `covenant` | Ezekiel 37:26 | “Moreover I will make a covenant of peace with them. It will be an everlasting covenant with them.” | w=0.6 — the pack has no Ezekiel anchor; "covenant of peace" (also 34:25) is a queried phrase with no anchor home.
- `messianic-prophecy` | Ezekiel 37:24–25 | “My servant David will be king over them. They all will have one shepherd.” | w=0.6 — companion of the ch. 34 candidate (one curation decision for both), fulfillment-neutral.

**Lexicon candidates:**
- `restoration-of-israel` | "dry bones" / "valley of dry bones" | queries: "valley of dry bones meaning"; "can these bones live"; "dry bones come to life". Target chosen because the pack already anchors 37:11–14 at w=0.9 and the text's own referent is national (37:11); cross-note for the curator: if the `resurrection-of-the-dead` anchor candidate above is admitted, decide the XOR target for this phrase family across the two packs — one target, not both.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** hard ceiling 8 hit; book-doc subdivision (2 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- §11.6 yield: `holy-spirit` clears the bar arguably at 37:14 (“I will put my Spirit in you, and you will live.”) but the chapter is at the ceiling; yields as thin single-verse and broad-duplicating-specific (the Spirit material is quoted inside the standing `hope-in-god` justification). Recorded, not silent.

## Ezekiel 38

**Existing tags (book doc):** `divine-judgment`; `gods-protection`; `nations-and-peoples`; `knowing-god`

**Applied-tag deltas:**
- ADD `end-times` (adopted id, adopted-concepts-canonical.md, engine-built: no) — the text's own vocabulary places the whole Gog oracle in the appointed final horizon: “In the latter years you will come into the land that is brought back from the sword” (38:8) and “It will happen in the latter days that I will bring you against my land” (38:16). This follows the Daniel book doc's precedent exactly (tag applied only where "the time of the end"/"latter days" is the vision's own stated horizon, skipped where it is one incidental phrase — here it frames both halves of the oracle, 38:8 and 38:16). Fulfillment-neutral by construction: the tag quotes the text's own dating and asserts no scheme or identification, preserving the book doc's standing Gog framing. Chapter moves to 5 tags.
- KEEP `divine-judgment` — “I will enter into judgment with him with pestilence and with blood.” (38:22). KEEP `gods-protection` — against a people “dwelling without walls, and having neither bars nor gates” (38:11), God's wrath rises in defense (38:18–19). KEEP `nations-and-peoples` — the named coalition (38:2–6) and God sanctified “before their eyes” (38:16). KEEP `knowing-god` — “I will magnify myself and sanctify myself, and I will make myself known in the eyes of many nations.” (38:23), with the book doc's register caveat standing (acknowledgment forced by God's acts, distinct from devotional knowing).

**Anchor-extension candidates:** None emitted here — see routing in Decisions.

**Lexicon candidates:** None emitted here — "who are gog and magog" phrasings are recorded with the routed item below (they belong to the blocked row's eventual pack, not to any live pack).

**New-concept candidates:** None — the Gog/latter-days material's home is the adopted `end-times` id; no gap remains that would justify a mint, and the book doc's motif list already holds "Gog and Magog" with its identification-neutral caution.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** none (not subdivided; 5 tags after delta).

**Decisions record:**
- `end-times` engine-side findings ROUTED: already on corpus-blocked roster, row 5 (the row is the Daniel-minted `end-times` theme; its merge-or-two-ids question with `day-of-the-lord` is explicitly Jesse's call and survives PR-β). Noted for the expansion queue: Ezek 38:8 (“In the latter years”) and 38:16 (“in the latter days”) as OT refs beyond Daniel, plus query phrasings "who are gog and magog"; "gog and magog in the bible"; "ezekiel 38 latter days" — all identification-neutral per the motif list's caution.
- `knowing-god` engine-side anchor extension considered (38:23) and NOT emitted: the book doc records the register mismatch (the recognition refrain is a different register from the pack's devotional knowing, per the Hosea-row caveat, with the drafters leaning motif) — followed.

## Ezekiel 39 (subdivided: 39:1–20 / 39:21–29)

**Existing tags (book doc):** `divine-judgment`; `restoration`; `gods-protection`; `nations-and-peoples`; `restoration-of-israel`; `outpouring-of-the-spirit`; `knowing-god`

**Applied-tag deltas:** No changes — all seven stand. KEEP `divine-judgment` — Gog's hordes given “to the ravenous birds of every sort and to the animals of the field to be devoured” (39:4). KEEP `restoration` — “Now I will reverse the captivity of Jacob and have mercy on the whole house of Israel.” (39:25). KEEP `gods-protection` — the bow struck from Gog's hand (39:3) and “No one will make them afraid” (39:26). KEEP `nations-and-peoples` — “I will set my glory among the nations.” (39:21). KEEP `restoration-of-israel` — gathered from their enemies' lands, none left captive (39:27–28). KEEP `outpouring-of-the-spirit` (adopted id, adopted-concepts-canonical.md, engine-built: no) — “for I have poured out my Spirit on the house of Israel” (39:29). KEEP `knowing-god` — recognition on both sides: “The nations will know that the house of Israel went into captivity for their iniquity” (39:23), register caveat standing.

**Anchor-extension candidates:** None.

**Lexicon candidates:** None.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** soft cap 6 exceeded (7 tags, each clearing the bar, within the ceiling); book-doc subdivision (2 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `end-times` considered for this chapter (the Gog defeat continues) and NOT added: the latter-years/latter-days vocabulary is confined to ch. 38 (39:8's “This is the day about which I have spoken” names the day of the defeat, not the appointed final period), and CONVENTIONS §5 requires the justifying quote to be in-chapter. The ch. 38 tag and roster routing carry the theme.
- `gods-holy-name` engine-side findings (39:7 — “I will make my holy name known among my people Israel.”; 39:25 — “I will be jealous for my holy name.”) ROUTED: already on corpus-blocked roster, row 8 (the row cites Ezek 39:7, 25).
- `outpouring-of-the-spirit` curation material noted (39:29), as on ch. 36; nothing engine-side emitted.

## Ezekiel 40

**Existing tags (book doc):** `dreams-and-visions`; `the-house-of-god`

**Applied-tag deltas:** No changes — both stand. KEEP `dreams-and-visions` — “In the visions of God he brought me into the land of Israel, and set me down on a very high mountain” (40:2), the bronze-like man with the measuring reed (40:3), and the charge to declare it (40:4). KEEP `the-house-of-god` (engine id) — the measured house is the chapter's entire substance (40:5–49). No untagged concept clears the bar.

**Anchor-extension candidates:**
- `the-house-of-god` | Ezekiel 40:2–4 | “see with your eyes, and hear with your ears, and set your heart on all that I will show you” | w=0.5 — the pack's only Ezekiel anchor is 43:4–7 (the glory's return); "Ezekiel's temple" / measuring-vision queries have no anchor into the vision's opening, and the passage shares no vocabulary with the pack's lexicon ("the temple in the bible", "gods dwelling place").

**Lexicon candidates:**
- `the-house-of-god` | "ezekiels temple" / "the man with a measuring reed" | queries: "ezekiel temple vision meaning"; "man with measuring rod in ezekiel"; "ezekiel 40 temple". (Motif-list material — "The measured temple / God's pattern" — promoted to a concrete lexicon candidate now that `the-house-of-god` is engine-built.)

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** none (not subdivided — the book doc argues chapters 40–42 stay whole; 2 tags).

**Decisions record:**
- `priesthood` considered for 40:45–46 (“These are the sons of Zadok, who from among the sons of Levi come near to the LORD to minister to him.”) and NOT added: two verses of room-assignment inside a measuring tour; the theme's chapter home is ch. 44, where the pack's anchor candidate sits and 40:45–46 rides as a companion ref (as the book doc's priesthood append already staged it).

## Ezekiel 41

**Existing tags (book doc):** `the-house-of-god` (single-tag chapter)

**Applied-tag deltas:** No changes — the single tag stands. KEEP `the-house-of-god` — the nave, the innermost room (“This is the most holy place.”, 41:4), cherubim-and-palm-tree walls (41:18–19), and “This is the table that is before the LORD.” (41:22). The book doc's Decisions #40 reasoning against `holiness` here stands; no untagged concept clears the bar. (Only one honest tag from the current vocabulary.)

**Anchor-extension candidates:** None.

**Lexicon candidates:** None.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** none (not subdivided; 1 tag).

**Decisions record:** None.

## Ezekiel 42

**Existing tags (book doc):** `the-house-of-god` (single-tag chapter)

**Applied-tag deltas:** No changes — the single tag stands. KEEP `the-house-of-god` — the holy rooms where the priests “shall eat the most holy things” (42:13), garments laid aside “for they are holy” (42:14), and the compound measured “to make a separation between that which was holy and that which was common” (42:20). Decisions #40's reasoning against a `holiness` display tag here stands (the chapter regulates the house's economy rather than teaching be-holy substance); no untagged concept clears the bar. (Only one honest tag from the current vocabulary.)

**Anchor-extension candidates:** None (the holy-and-common material's anchor candidate sits on ch. 44, where the teaching charge is explicit).

**Lexicon candidates:**
- `holiness` | "holy and common" | queries: "difference between holy and common"; "what does holy mean in the bible"; "separation between holy and common". (Anchor texts 42:20 and 44:23; motif-list material promoted to a concrete candidate. Lexicon only — the display-tag decline above stands.)

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** none (not subdivided; 1 tag).

**Decisions record:** None.

## Ezekiel 43 (subdivided: 43:1–12 / 43:13–27)

**Existing tags (book doc):** `presence-of-god`; `holiness`; `repentance`; `glory-of-god`; `the-house-of-god`; `sacrifice-and-atonement`; `shame`

**Applied-tag deltas:** No changes — all seven stand. KEEP `presence-of-god` — “this is the place of my throne and the place of the soles of my feet, where I will dwell among the children of Israel forever.” (43:7). KEEP `holiness` — “On the top of the mountain the whole limit around it shall be most holy. Behold, this is the law of the house.” (43:12). KEEP `repentance` — “Now let them put away their prostitution, and the dead bodies of their kings far from me.” (43:9). KEEP `glory-of-god` — “the glory of the God of Israel came from the way of the east” (43:2), “the LORD’s glory filled the house” (43:5); the engine pack anchors 43:1–5. KEEP `the-house-of-god` — the law of the house (43:12); the pack anchors 43:4–7. KEEP `sacrifice-and-atonement` (adopted id, adopted-concepts-canonical.md, engine-built: no) — “Seven days shall they make atonement for the altar and purify it.” (43:26), OT ritual on its own terms. KEEP `shame` — “that they may be ashamed of their iniquities” (43:10); the engine pack anchors 43:10–11.

**Anchor-extension candidates:** None — the chapter's three natural anchors (43:1–5 glory, 43:4–7 house, 43:10–11 shame) already exist in their packs.

**Lexicon candidates:** None.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** soft cap 6 exceeded (7 tags, within the ceiling); book-doc subdivision (2 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `sacrifice-and-atonement` engine-side findings (43:18–27) ROUTED: already on corpus-blocked roster, row 1 (the row's reason names Ezek 43/45 among the blocked anchors). Display tag stands; nothing duplicated.

## Ezekiel 44 (subdivided: 44:1–5 / 44:6–14 / 44:15–31)

**Existing tags (book doc):** `holiness`; `presence-of-god`; `priesthood`

**Applied-tag deltas:** No changes — all three stand. KEEP `holiness` — “They shall teach my people the difference between the holy and the common, and cause them to discern between the unclean and the clean.” (44:23). KEEP `presence-of-god` — “behold, the LORD’s glory filled the LORD’s house; so I fell on my face.” (44:4) and the shut east gate “for the LORD, the God of Israel, has entered in by it.” (44:2). KEEP `priesthood` — the chapter's substance is who may come near: straying Levites barred from priestly nearness (44:10–14), the sons of Zadok brought near (44:15–16), their life regulated (44:17–27), “I am their inheritance” (44:28).

**Anchor-extension candidates:**
- `priesthood` | Ezekiel 44:15–16, 23, 28 | “the sons of Zadok, who performed the duty of my sanctuary when the children of Israel went astray from me, shall come near to me to minister to me.” | w=0.7 — the pack has no Ezekiel anchor; the book doc's priesthood append (44:10–31, converted at critic Round 2 from an exact-id collision) staged precisely this temple-vision regulation register for the pack — this executes it now that `priesthood` is engine-built.
- `holiness` | Ezekiel 44:23 | “They shall teach my people the difference between the holy and the common, and cause them to discern between the unclean and the clean.” | w=0.6 — concept-vocabulary case: "set apart"/holy-common queries share no surface words with the pack's NT anchors, and 44:23 states the teaching charge itself.

**Lexicon candidates:**
- `priesthood` | "sons of zadok" | queries: "who are the sons of zadok"; "sons of zadok in ezekiel"; "zadok priests meaning".
- `presence-of-god` | "I am their inheritance" ("God is my portion" family) | queries: "god is my portion"; "the lord is my inheritance"; "god is my portion meaning". (Executes the book doc's covered-note: "real query … a lexicon-extension candidate for `presence-of-god` or `contentment`" — target left as the curator's either/or, one target only.)

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- The shut-east-gate motif (44:1–3) left as motif material per the book doc ("heavily searched; any future gist must be scrupulously non-adjudicating — traditions differ") — no candidate emitted; no adjudication.

## Ezekiel 45 (subdivided: 45:1–6 / 45:7–9 / 45:10–12 / 45:13–25)

**Existing tags (book doc):** `worship`; `honesty`; `sacrifice-and-atonement`

**Applied-tag deltas:** No changes — all three stand. KEEP `worship` — the prince's offerings “in the feasts, and on the new moons, and on the Sabbaths, in all the appointed feasts of the house of Israel.” (45:17), the seven-day Passover (45:21–25). KEEP `honesty` — “You shall have just balances, a just ephah, and a just bath.” (45:10), every measure keyed to one standard (45:11–12). KEEP `sacrifice-and-atonement` (adopted id, adopted-concepts-canonical.md, engine-built: no) — offerings “to make atonement for the house of Israel.” (45:17) and the yearly cleansing, “So you shall make atonement for the house.” (45:20).

**Anchor-extension candidates:**
- `justice-and-oppression` | Ezekiel 45:8–9 | “Enough, you princes of Israel! Remove violence and plunder, and execute justice and righteousness!” | w=0.6 — the pack's "corrupt leaders" lexicon term has no anchor with this directness in the temple-vision's civic charge; executes the book doc's covered-note routing of the national ruler-justice texts to the justice row (with 46:18 as companion ref).
- `honesty` | Ezekiel 45:10 | “You shall have just balances, a just ephah, and a just bath.” | w=0.5 — the pack has no just-weights anchor and its lexicon ("telling the truth", "lying") shares no words with commercial-honesty queries.

**Lexicon candidates:**
- `honesty` | "just balances" / "honest scales" | queries: "honest scales in the bible"; "just weights and measures in the bible"; "what does the bible say about cheating in business".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** book-doc subdivision (4 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `justice-and-oppression` display tag considered for 45:8–9 (“My princes shall no more oppress my people”) and NOT added: two verses in a chapter of land allotment and offering ordinances — thin against the presence bar, and the 2026-08-25 application pass had the id available and left it off; the anchor-extension candidate above serves the search intent without a display change.
- `sacrifice-and-atonement` engine-side findings (45:15–20) ROUTED: already on corpus-blocked roster, row 1 (the row names Ezek 45 among blocked anchors).

## Ezekiel 46 (subdivided: 46:1–18 / 46:19–24)

**Existing tags (book doc):** `worship`; `sabbath-rest`

**Applied-tag deltas:** No changes — both stand. KEEP `worship` — “he shall worship at the threshold of the gate” (46:2) and “The people of the land shall worship at the door of that gate before the LORD on the Sabbaths and on the new moons.” (46:3), the daily lamb “morning by morning, for a continual burnt offering.” (46:15). KEEP `sabbath-rest` — the east gate “shall be shut the six working days; but on the Sabbath day it shall be opened” (46:1), with the Sabbath's own offerings (46:4–5, 12). No untagged concept clears the bar.

**Anchor-extension candidates:** None.

**Lexicon candidates:** None.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** book-doc subdivision (2 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `sacrifice-and-atonement` considered for the offering calendar (46:2–15) and NOT added: the chapter has no atonement language — its offerings are the worship calendar, carried by `worship`; the atonement-purpose statements live in chs. 43 and 45, where the tag stands.
- `justice-and-oppression` considered for 46:18 (“the prince shall not take of the people’s inheritance, to thrust them out of their possession.”) and NOT added: single verse; recorded as companion ref on the ch. 45 anchor-extension candidate instead.

## Ezekiel 47 (subdivided: 47:1–12 / 47:13–23)

**Existing tags (book doc):** `restoration`; `gods-faithfulness`; `living-water`; `sojourners-and-strangers`

**Applied-tag deltas:** No changes — all four stand. KEEP `restoration` — “the waters of the sea will be healed, and everything will live wherever the river comes.” (47:9), fruit for food and “its leaf for healing.” (47:12). KEEP `gods-faithfulness` — the land divided “for I swore to give it to your fathers. This land will fall to you for inheritance.” (47:14). KEEP `living-water` — the image's home ground; the engine pack's keystone anchor is 47:1–12 (“waters to swim in”, 47:5). KEEP `sojourners-and-strangers` — resident aliens inherit: “Then they shall be to you as the native-born among the children of Israel.” (47:22).

**Anchor-extension candidates:**
- `sojourners-and-strangers` | Ezekiel 47:22–23 | “Then they shall be to you as the native-born among the children of Israel.” | w=0.6 — the pack has no Ezekiel anchor and its existing anchors are the pilgrim/far-from-home register; this is the welcome-the-foreigner legal provision ("immigrants in the bible" family), which the pack's "living as a foreigner" lexicon term reaches but no anchor grounds.

**Lexicon candidates:** None (`living-water`'s lexicon already carries "river of life", "water of life", "streams of living water").

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** book-doc subdivision (2 sections) — mark for the per-verse refinement pass.

**Decisions record:** None.

## Ezekiel 48 (subdivided: 48:1–7 / 48:8–14 / 48:15–20 / 48:21–22 / 48:23–29 / 48:30–35)

**Existing tags (book doc):** `presence-of-god`; `the-house-of-god`

**Applied-tag deltas:** No changes — both stand. KEEP `presence-of-god` — the sanctuary “in the middle of it” (48:8, 10) and the book's closing word: “and the name of the city from that day shall be, ‘The LORD is there.’” (48:35). KEEP `the-house-of-god` — the whole allotment ordered around the sanctuary, the twelve-gated city (48:31–35). No untagged concept clears the bar (the tribal-allotment lists are administrative, not teaching substance for any pack).

**Anchor-extension candidates:**
- `presence-of-god` | Ezekiel 48:35 | “and the name of the city from that day shall be, ‘The LORD is there.’” | w=0.6 — the pack has no OT city-of-God's-presence anchor; the book doc's motif list itself suggests "The LORD is there" as a `presence-of-god` anchor phrase.

**Lexicon candidates:**
- `presence-of-god` | "the lord is there" | queries: "the lord is there meaning"; "jehovah shammah"; "city called the lord is there". (Note: "Jehovah Shammah" is post-biblical/translation vocabulary — lexicon phrasing only, never display wording, mirroring the book doc's "Shekinah" note.)

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** book-doc subdivision (6 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- Firstfruits at 48:14 (“nor shall the first fruits of the land be alienated, for it is holy to the LORD.”): follows the recorded covered-routing (firstfruits → `tithing`); single verse, no display tag, no candidate — the routing note suffices.

---

# Book totals (Ezekiel 1–48; recomputed mechanically at assembly)

- Chapters swept: 48 of 48, in order; every chapter has a full-legend entry; honest-and-empty and single-tag outcomes preserved where prior art holds.
- Applied-tag deltas: **5 ADD, 194 KEEP, 0 DROP.** ADDs: `unanswered-prayer` (ch 14); `lament` (chs 27, 32); `gloating-over-downfall` (ch 35); `end-times` (ch 38). KEEPs: 103 in chs 1–24 + 91 in chs 25–48 (every existing book-doc tag stands; per-chapter stated counts all re-verified).
- Anchor-extension candidates: **41 rows across 32 chapters** — `dreams-and-visions` (1:1); `delight-in-the-word` (3:1-3); `remnant` (6:8-10); `day-of-the-lord` (7:19; 30:2-3); `glory-of-god` (10:4; 10:18-19; 11:22-23); `power-of-gods-word` (12:25); `false-prophets` (13:1-16); `occult-and-divination` (13:17-23); `unanswered-prayer` (14:1-8); `individual-responsibility` (14:14-20); `covenant` (16:59-63; 37:26); `messianic-prophecy` (17:22-24; 21:26-27; 34:23-24; 37:24-25 — all fulfillment-neutral); `humble-exaltation` (17:24; 28:2, 17; 31:10-14 — chs 28/31 are one curation decision); `oaths-and-vows` (17:16-19); `trusting-in-man` (17:15, 17); `justice-and-oppression` (18:7-8 — in fixture corpus, measurable now; 22:29; 45:8-9); `lament` (19:1-14); `sabbath-rest` (20:12); `prayer` (22:30); `providence` (29:19-20); `mortality` (32:18-32); `repentance` (33:11); `forgiveness-of-sins` (36:25); `resurrection-of-the-dead` (37:1-14 — signposted, non-adjudicating); `the-house-of-god` (40:2-4); `priesthood` (44:15-16, 23, 28); `holiness` (44:23); `honesty` (45:10); `sojourners-and-strangers` (47:22-23); `presence-of-god` (48:35).
- Lexicon candidates: **18 rows** — `delight-in-the-word` 'sweet as honey' (ch 3); `glory-of-god` 'the glory departed' (ch 10); `false-prophets` 'peace when there is no peace' (ch 13); `covenant` 'everlasting covenant' (ch 16); `repentance` 'no pleasure in the death of the wicked' (ch 18) and "no pleasure in the death of the wicked" / "turn and live" (ch 33) — same phrase family filed independently by both chunks, one curation decision; `messianic-prophecy` 'until he comes whose right it is' (ch 21); `prayer` 'standing in the gap' (ch 22); `trusting-in-man` "staff of reed" / "broken reed" (ch 29); `mortality` "sheol" / "the pit" (ch 32); `blessing` "showers of blessing" (ch 34); `restoration-of-israel` "dry bones" / "valley of dry bones" (ch 37, with the XOR cross-note vs `resurrection-of-the-dead`); `the-house-of-god` "ezekiels temple" / "the man with a measuring reed" (ch 40); `holiness` "holy and common" (ch 42, lexicon-only); `priesthood` "sons of zadok" (ch 44); `presence-of-god` "I am their inheritance" (ch 44, curator's either/or vs `contentment`) and "the lord is there" (ch 48); `honesty` "just balances" / "honest scales" (ch 45).
- New-concept candidates: **0.** Decline-overturn proposals: **0** — all relevant recorded declines honored (intercession→`prayer`; famine→`gods-provision`; grief-vs-lament §1(c); drunkenness-as-judgment-imagery; Sheol→`mortality`, not `hell`; Ezek 28 not appended to `satan`; firstfruits→`tithing`).
- Corpus-blocked routings, merged by roster row (16 routing decisions across both chunks — 6 in chs 1–24, 10 in chs 25–48 counting the re-open-note item):
  - Row 1 `sacrifice-and-atonement` — chs 43 (43:18-27), 45 (45:15-20).
  - Row 2 `spiritual-adultery` — chs 6 (6:9), 16 (allegory register, 16:32), 23 (two-sisters allegory, 23:35).
  - Row 5 `end-times` — ch 38 (38:8, 16 as OT refs beyond Daniel, plus identification-neutral Gog/Magog query phrasings).
  - Row 8 `gods-holy-name` — chs 20 (20:9, 14, 22, 44), 36 (36:20-23), 39 (39:7, 25).
  - Row 14 `gloating-over-downfall` — chs 25 (25:3, 6), 26 (26:2), 35 (35:12, 15).
  - Row 38 `new-heart` — chs 11 (11:19-20), 18 (18:31), 36 (36:25-27).
  - Roster "Additional re-open notes" — ch 34 bad-shepherds register (34:2-10), routed under the shepherds re-open note (with John 10 / John 21).
  - Count correction (assembly): the chunk-1 summary stated "Corpus-blocked routings: 5"; mechanical count of chunk-1 Decisions-record routing entries is **6** (its ch-6 `spiritual-adultery` routing is a full routing decision, not a note). Book-wide: 16 routing decisions over 6 roster rows plus the re-open note. No routing was lost; this corrects the count only.
- Adopted-only ids used as tags (all verified on the canonical list, all engine-built: no): `end-times`, `gloating-over-downfall`, `gods-holy-name`, `new-heart`, `outpouring-of-the-spirit`, `sacrifice-and-atonement`, `spiritual-adultery`; plus `circumcision-of-the-heart` referenced (not applied) in ch 36's Decisions record. `outpouring-of-the-spirit` has no engine pack and no roster row; its curation material (36:27; 37:14; 39:29) is noted in chs 36 and 39.
- Ceiling and refinement flags:
  - Hard ceiling (8 tags): chs 16, 20, 34, 36, 37.
  - Above soft cap (7 tags, within ceiling): chs 11, 14 (after this sweep's ADD), 18, 39, 43. At soft cap (6): ch 33.
  - Per-verse refinement pass (subdivided in book doc): chs 3, 4, 11, 12, 14, 16, 17, 20, 22, 23, 24, 25, 28, 29, 30, 32, 33, 34, 36, 37, 39, 43, 44, 45, 46, 47, 48 — 27 chapters, matching the sweep brief's Ezekiel subdivision list exactly.
- §11.6 yields (each with its own Decisions-record line, none silent): `messianic-prophecy` at the ch-34 ceiling (survives as the 34:23-24 anchor candidate + refinement flag); `holy-spirit` at the ch-36 ceiling (broad-duplicating-specific; its pack already anchors 36:26-27) and at the ch-37 ceiling (thin single-verse / broad-duplicating-specific).
