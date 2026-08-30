# Ecclesiastes — Layer-3 tag-sweep ledger

**Date:** 2026-08-26 · **Repo:** `scripture-search-engine` @ origin/main `e762d1c629f5b121a2aacc6da57cca6bacc3215e` · **Concept library:** 239 engine packs (`ontology/concepts/*.yaml`) + 161 §11.1 adopted display ids (canonical list `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md`, verified identical to the sweep kit's regenerated list) · **Book:** Ecclesiastes, chapters 1–12 · **Prior art:** `/mnt/project-files/research/bible-rollout/ecclesiastes.md` (44 tags / 12 chapters; Decisions record #1–#17 binding) · **Inputs:** sweep kit (rules.md incl. plan §5.2 + CONVENTIONS §5/§9/§11 verbatim; concepts.md; concept-ids.txt; declines.md; corpus-blocked.md; books.md; output-spec.md; web-text.md).

**WEB text provenance:** chapter 3 pinned-fixture verified (committed `pipeline/fixtures/web-subset.json` at e762d1c); chapters 1–2 and 4–12 verified against the 87fd68c full fixture (same source sha256 `b6f55cc7…` as e762d1c's manifest pin; byte-consistent with the committed fixture over all 5,726 witnessed verses). All quotes below word-for-word WEB from the staged verse-per-line text (curly typography normalized to straight apostrophes per the proverbs.md #16 precedent).

**Entry format legend (per plan §5.2 / output-spec.md):** per chapter — 1. Existing tags (prior art) · 2. Applied-tag deltas (ADD/KEEP/DROP; no silent drops) · 3. Anchor-extension candidates (`id` | ref | WEB quote | proposed w) · 4. Lexicon candidates (`id` | phrase | 2–3 realistic queries) · 5. New-concept candidates · 6. Decline-overturn proposals · 7. Ceiling/refinement flags · 8. Decisions record (§11.6 yields). Findings on corpus-blocked ids are ROUTED to the roster row, never re-proposed.

---

## Ecclesiastes 1
1. Existing tags (book doc): `vanity-of-life`.
2. Applied-tag deltas: No changes — the chapter is the vanity thesis and carries its one honest tag; `wisdom-from-god` correctly withheld (Decisions #12: 1:17–18 is wisdom's grief, not God's gift).
3. Anchor-extension candidates: ROUTED to corpus-blocked roster row 19 (`vanity-of-life`): thesis text Eccl 1:2–11 — "Vanity of vanities, all is vanity." (1:2); "there is no new thing under the sun" (1:9); "all is vanity and a chasing after wind" (1:14). Row 19 already records the thesis-text absence; these are the anchor refs for the re-pin curator.
4. Lexicon candidates: ROUTED to row 19 with the anchors: "life feels meaningless", "what is the point of life", "nothing new under the sun meaning" (row's own gist flag — WEB "vanity" + NIV-remembered "meaningless" both reachable — already recorded).
5. New-concept candidates: none — wisdom's-limits material (1:17–18) is a recorded checked-and-declined (book doc Tag gaps closing list; declines.md §6 Ecclesiastes note: routes to `wisdom-from-god` positive side / row 19 limits side).
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (1 tag; chapter kept whole per Decisions #5).
8. Decisions record: none.

## Ecclesiastes 2
1. Existing tags (book doc): `wisdom-from-god`, `vanity-of-life`, `enjoying-gods-gifts`.
2. Applied-tag deltas: No changes. Considered and not added: `money-and-possessions` (2:4–11 wealth is the experiment's inventory, not danger-of-riches teaching — verdict register is carried by `vanity-of-life`); `work-and-diligence` (2:18–23 is hatred of labor, the concept's inverse).
3. Anchor-extension candidates:
   - `wisdom-from-god` | Eccl 2:26 | "For to the man who pleases him, God gives wisdom, knowledge, and joy" | w=0.6 (pack has no Ecclesiastes anchor; this is the book's one God-gives-wisdom statement, per book Decisions #12).
   - ROUTED to row 19 (`vanity-of-life`): Eccl 2:11 "all was vanity and a chasing after wind, and there was no profit under the sun"; 2:17 "So I hated life".
4. Lexicon candidates: `enjoying-gods-gifts` | "is it wrong to enjoy life" | queries: "is it wrong to enjoy life", "does god want me to be happy", "pleasure in the bible" (pack lexicon carries "is it okay to enjoy life"; these are near-variants for the curator to dedupe against tokenizer behavior).
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (3 tags; kept whole per Decisions #5).
8. Decisions record: none.

## Ecclesiastes 3 (subdivided: 3:1–8 / 3:9–15 / 3:16–22)
1. Existing tags (book doc): `providence`, `divine-judgment`, `seasons-of-life`, `enjoying-gods-gifts`, `mortality`, `conscience` — 6, at the soft cap.
2. Applied-tag deltas: No changes. Prior recorded skip stands: `fear-of-the-lord` (3:14 purpose-clause, book Decisions #15). Considered and not added: `testing` (3:18 "God tests them, so that they may see that they themselves are like animals" — a showing-men-their-creatureliness sense, not the pack's refining-faith register; presence bar not met).
3. Anchor-extension candidates:
   - `providence` | Eccl 3:14 | "I know that whatever God does, it shall be forever. Nothing can be added to it, nor anything taken from it" | w=0.55 (pack has no Ecclesiastes anchor; the chapter is its display-tag home here).
   - (`seasons-of-life` Eccl 3:1–8 w=1.0, `enjoying-gods-gifts` 3:12–13/3:22, `mortality` 3:19–21, `conscience` 3:11, `fear-of-the-lord` 3:14 — all already in their packs; no extension needed.)
4. Lexicon candidates: none needed — `seasons-of-life`'s lexicon already carries the chapter's search phrasings ("a time for everything", "to everything there is a season", "a time to mourn and a time to dance").
5. New-concept candidates: none — "eternity in their hearts" motif recorded in book doc as not-asserted; carried by `conscience`'s 3:11 anchor.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: soft-cap-6 hit + book-doc subdivision → mark for the per-verse refinement pass (section anchors already partition cleanly: 3:1–8 seasons; 3:9–15 providence/enjoyment/fear; 3:16–22 judgment/mortality).
8. Decisions record: none (no yield needed at 6).

## Ecclesiastes 4
1. Existing tags (book doc): `friendship`, `loneliness`, `contentment`, `envy-and-jealousy`, `justice-and-oppression`.
2. Applied-tag deltas: No changes. Considered and not added: `receiving-correction` (4:13 "an old and foolish king who doesn't know how to receive admonition any more" — single clause inside a succession sketch; thin); `humble-exaltation` (4:14 rise from prison is narrated vanity, God unnamed).
3. Anchor-extension candidates:
   - `contentment` | Eccl 4:6 | "Better is a handful, with quietness, than two handfuls with labor and chasing after wind." | w=0.7 (pack has no Ecclesiastes anchor; classic enough-is-enough text).
   - `justice-and-oppression` | Eccl 4:1 | "the tears of those who were oppressed, and they had no comforter" | w=0.6 (the observer's register the tag-gaps append documented; pack has no Ecclesiastes anchor).
   - `envy-and-jealousy` | Eccl 4:4 | "all the labor and achievement that is the envy of a man's neighbor" | w=0.55 (envy as the engine of toil — a register the pack's anchors lack).
   - `loneliness` | Eccl 4:8-10 | "There is one who is alone, and he has neither son nor brother." … "woe to him who is alone when he falls" | w=0.5 — DESIGN CAUTION: pack anchors are God-with-the-lonely texts; this is the human-companionship remedy (book Decisions #8 kept the display tag on exactly this reasoning; curator decides whether the register mix is wanted in ranking).
4. Lexicon candidates: `friendship` | "two are better than one" | queries: "two are better than one meaning", "bible verse two are better than one", "why we need other people bible" (pack carries "a cord of three strands" but not the head phrase).
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (5 tags; kept whole per Decisions #5).
8. Decisions record: none.

## Ecclesiastes 5 (subdivided: 5:1–7 / 5:8–20)
1. Existing tags (book doc): `worship`, `contentment`, `taming-the-tongue`, `oaths-and-vows`, `money-and-possessions`, `enjoying-gods-gifts` — 6, at the soft cap.
2. Applied-tag deltas: No changes. Prior recorded skips stand: `fear-of-the-lord` (5:7 closing clause), `justice-and-oppression` (5:8 one verse) — both book Decisions #15. `gods-provision` correctly withheld (Decisions #10).
3. Anchor-extension candidates:
   - `worship` | Eccl 5:1-2 | "Guard your steps when you go to God's house; for to draw near to listen is better than to give the sacrifice of fools" | w=0.7 (pack has no reverence-in-approach anchor from the OT wisdom register; distinctive text for "reverence" queries).
   - `money-and-possessions` | Eccl 5:13 | "There is a grievous evil which I have seen under the sun: wealth kept by its owner to his harm." | w=0.6 (pack anchors Eccl 5:10 already; 5:13–17 extends the hoarded-wealth register — curator may prefer widening the existing 5:10 anchor to 5:10-17 instead of a second anchor).
   - (`oaths-and-vows` Eccl 5:4-5 w=0.95 and `enjoying-gods-gifts` 5:18-20 already in their packs.)
4. Lexicon candidates:
   - `taming-the-tongue` | "let your words be few" | queries: "let your words be few", "god is in heaven and you are on earth", "talking too much bible" (vertical-register caution per book Decisions #7 rides the gist, not the row).
   - `oaths-and-vows` | "better not to vow" | queries: "better not to vow than to vow and not pay", "is it a sin to break a vow", "making promises to god".
   - `money-and-possessions` | "money never satisfies" | queries: "money never satisfies bible", "he who loves money will never be satisfied", "chasing wealth bible" — OWNER CAUTION: `contentment` deliberately carries bare "money"/"wealth"/"love of money" (recorded in declines.md §5); the row must not re-claim contentment's bare tokens.
5. New-concept candidates: none — vows material folded into `oaths-and-vows` (declines.md §6 Ecclesiastes note).
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: soft-cap-6 hit + book-doc subdivision → mark for the per-verse refinement pass (5:1–7 worship/speech/vows; 5:8–20 wealth/enjoyment).
8. Decisions record: none (no yield needed at 6).

## Ecclesiastes 6
1. Existing tags (book doc): `money-and-possessions`.
2. Applied-tag deltas:
   - ADD `vanity-of-life` — the chapter is a sustained vanity meditation, not a passing refrain: the unenjoyed-wealth evil is itself the verdict "This is vanity, and it is an evil disease." (6:2); the stillborn "comes in vanity, and departs in darkness" (6:4); "This also is vanity and a chasing after wind." (6:9); and the half-book closes on the thesis question "For who knows what is good for man in life, all the days of his vain life which he spends like a shadow?" (6:12). The 2026-08-25 pass placed the tag on chs. 1–2 from the gap row's refs; ch. 6 was not on that worklist and was never individually skipped — this is a coverage delta, not a skip reversal.
3. Anchor-extension candidates:
   - `mortality` | Eccl 6:6 | "Yes, though he live a thousand years twice told, and yet fails to enjoy good, don't all go to one place?" | w=0.5 (death-as-leveler inside the unenjoyed-life argument; anchor-grade, but judged below the display-tag presence bar for this chapter — the meditation's subject is unenjoyed good, not death).
   - ROUTED to row 19 (`vanity-of-life`): Eccl 6:2, 6:9, 6:12 as above (refrain instances outside chs. 1–3, which the row records as absent from the fixture corpus).
4. Lexicon candidates: `money-and-possessions` | "wealth you can't enjoy" | queries: "god gives riches but not the power to enjoy them", "wealth you can't enjoy", "what good is money ecclesiastes".
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (2 tags after delta; kept whole per Decisions #5).
8. Decisions record: none.

## Ecclesiastes 7
1. Existing tags (book doc): `sin`, `prosperity-of-the-wicked`, `suffering-of-the-righteous`.
2. Applied-tag deltas:
   - ADD `mortality` — 7:1–4 is sustained take-death-to-heart teaching, not a topic touch: "the day of death better than the day of one's birth" (7:1); "It is better to go to the house of mourning than to go to the house of feasting; for that is the end of all men, and the living should take this to heart." (7:2); "The heart of the wise is in the house of mourning" (7:4). Consistent with book Decisions #14(a): this is wisdom counsel about mortality, not griever comfort — no pastoral-* tag rides it.
   - KEEP `sin`, `prosperity-of-the-wicked`, `suffering-of-the-righteous` (7:15 both-tags per book Decisions #16; no comment needed).
   - Prior recorded skip stands: `fear-of-the-lord` (7:18 single clause, book Decisions #15). Considered and not added: `self-control` (7:9 anger clause — one verse); `receiving-correction` (7:5 — one verse in a better-than chain; anchor-grade only, below); `pastoral-sexual-purity` (7:26 is the Preacher's bitter finding about the ensnaring woman, not the pack's lust-crisis register).
3. Anchor-extension candidates:
   - `receiving-correction` | Eccl 7:5 | "It is better to hear the rebuke of the wise than for a man to hear the song of fools." | w=0.6 (exactly the pack's open-rebuke register; pack has no Ecclesiastes anchor).
   - `sin` | Eccl 7:20 | "Surely there is not a righteous man on earth who does good and doesn't sin." | w=0.8 (classic universal-sinfulness witness; pack's four anchors are all NT).
   - `prosperity-of-the-wicked` | Eccl 7:15 | "there is a righteous man who perishes in his righteousness, and there is a wicked man who lives long in his evildoing" | w=0.7 (pack has Job/Psalms/Jeremiah anchors, no Ecclesiastes; `suffering-of-the-righteous` already anchors this verse at w=0.7 — both-registers precedent recorded in the book doc).
   - `mortality` | Eccl 7:2 | "It is better to go to the house of mourning than to go to the house of feasting; for that is the end of all men, and the living should take this to heart." | w=0.65.
4. Lexicon candidates: `mortality` | "house of mourning" | queries: "house of mourning meaning", "better to go to a funeral than a party", "why think about death bible".
5. New-concept candidates: none — patience (7:8) is a recorded checked-and-declined ("should come from a book that teaches it sustainedly, e.g. James" — declines.md §6 Ecclesiastes note).
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (4 tags after delta; kept whole per Decisions #5).
8. Decisions record: none.

## Ecclesiastes 8
1. Existing tags (book doc): `divine-judgment`, `fear-of-the-lord`, `prosperity-of-the-wicked`.
2. Applied-tag deltas:
   - ADD `governing-authorities` — 8:2–5 is sustained conduct-under-rulers teaching, the OT wisdom parallel to the pack's Rom 13 register: "I say, “Keep the king's command!” because of the oath to God." (8:2); "Don't be hasty to go out of his presence." (8:3); "for the king's word is supreme. Who can say to him, “What are you doing?”" (8:4); "Whoever keeps the commandment shall not come to harm" (8:5). The concept entered the engine after the book's 2026-08-23 drafting vocabulary (131 ids) and was on no later worklist — a genuine sweep find.
   - KEEP the three sitting tags (no comment needed).
   - Prior recorded skips stand: `justice-and-oppression` (8:9 one verse), `enjoying-gods-gifts` (8:15 one verse) — both book Decisions #15. Considered and not added: `oaths-and-vows` (8:2's "because of the oath to God" — single clause riding the king's-command teaching).
3. Anchor-extension candidates:
   - `governing-authorities` | Eccl 8:2-5 | "I say, “Keep the king's command!” because of the oath to God." … "for the king's word is supreme" | w=0.6.
   - `divine-judgment` | Eccl 8:11 | "Because sentence against an evil work is not executed speedily, therefore the heart of the sons of men is fully set in them to do evil." | w=0.6 (distinctive delayed-judgment text; pack has no Ecclesiastes anchor; serves "why do evil people get away with it" intent alongside `prosperity-of-the-wicked`).
   - `fear-of-the-lord` | Eccl 8:12-13 | "surely I know that it will be better with those who fear God, who are reverent before him" | w=0.6 (pack anchors Eccl 3:14 and 12:13 but not the book's held-ground text).
   - `prosperity-of-the-wicked` | Eccl 8:14 | "there are righteous men to whom it happens according to the work of the wicked" | w=0.65.
4. Lexicon candidates: `governing-authorities` | "keep the king's command" | queries: "obeying the government in the old testament", "submission to a king bible", "keep the king's command".
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (4 tags after delta; kept whole per Decisions #5).
8. Decisions record: none.

## Ecclesiastes 9
1. Existing tags (book doc): `work-and-diligence`, `mortality`, `enjoying-gods-gifts`.
2. Applied-tag deltas: No changes. Standing book calls hold: `godly-marriage` NOT on 9:9 (Decisions #9 — carpe-diem counsel, not marriage teaching); the under-the-sun framing of 9:5–6 preserved, no softening (Decisions #3). Considered and not added: `providence` (9:1 "in the hand of God" — one verse; the motif table's time-and-chance non-assertion at 9:11 also stands); `humble-exaltation` (9:14–16 forgotten poor wise man — wisdom-despised vanity, not God-exalts-the-humble).
3. Anchor-extension candidates:
   - `work-and-diligence` | Eccl 9:10 | "Whatever your hand finds to do, do it with your might; for there is no work, nor plan, nor knowledge, nor wisdom, in Sheol, where you are going." | w=0.85 (the pack's four anchors omit the classic text; high value for work queries).
   - `mortality` | Eccl 9:5 | "For the living know that they will die, but the dead don't know anything" | w=0.7 — GIST CAUTION for the curator: under-the-sun observation, not afterlife doctrine (book Decisions #3); any gist wording must keep the book's own vantage.
   - (`enjoying-gods-gifts` Eccl 9:7-9 already in the pack.)
4. Lexicon candidates:
   - `work-and-diligence` | "whatever your hand finds to do" | queries: "whatever your hand finds to do do it with all your might", "give it your all bible verse", "work hard while you can".
   - `mortality` | "the dead know nothing" | queries: "the dead know nothing meaning", "do the dead know anything bible", "what does ecclesiastes say about death" (same gist caution as above).
5. New-concept candidates: none — "a living dog is better than a dead lion" recorded in the book doc as phrase-origin interest, not a concept.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (3 tags; kept whole per Decisions #5).
8. Decisions record: none.

## Ecclesiastes 10
1. Existing tags (book doc): `taming-the-tongue`, `work-and-diligence`.
2. Applied-tag deltas:
   - ADD `leadership` — the chapter's political proverbs teach rule's effect on a land in the pack's Prov 28:2 register (already a `leadership` anchor): "There is an evil which I have seen under the sun, the sort of error which proceeds from the ruler." (10:5); "Folly is set in great dignity" (10:6); "Woe to you, land, when your king is a child, and your princes eat in the morning!" (10:16); "Happy are you, land, when your king is the son of nobles, and your princes eat in due season" (10:17). Theme-witness caveat noted: observation-heavy, but two teaching blocks (10:4–7, 10:16–17) plus 10:20 clear the bar together.
   - Prior recorded skip stands: `money-and-possessions` (10:19 wry one-liner, book Decisions #15). Considered and not added: `drunkenness` (10:17 "not for drunkenness" — single clause).
3. Anchor-extension candidates:
   - `leadership` | Eccl 10:16-17 | "Woe to you, land, when your king is a child" … "Happy are you, land, when your king is the son of nobles" | w=0.55.
   - `taming-the-tongue` | Eccl 10:12 | "The words of a wise man's mouth are gracious; but a fool is swallowed by his own lips." | w=0.6 (pack has Proverbs/James anchors, no Ecclesiastes).
   - `work-and-diligence` | Eccl 10:18 | "By slothfulness the roof sinks in; and through idleness of the hands the house leaks." | w=0.55.
4. Lexicon candidates: `leadership` | "when the king is a child" | queries: "woe to the land whose king is a child", "what does the bible say about bad leaders" (bare "godly leader"/"leadership" already owned by the pack).
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (3 tags after delta; kept whole per Decisions #5).
8. Decisions record: none.

## Ecclesiastes 11 (subdivided: 11:1–6 / 11:7–10)
1. Existing tags (book doc): `generosity`, `work-and-diligence`, `divine-judgment`, `enjoying-gods-gifts`.
2. Applied-tag deltas: No changes. Book guardrail holds: `generosity` on 11:1–2 worded without return-on-giving (Decisions #6). Prior recorded skip stands: `aging-and-old-age` (11:8 "days of darkness" is not yet the allegory — Decisions #15). Considered and not added: `providence` (11:5 "you don't know the work of God who does all" — the unknowability inverse of the pack's register); `sowing-and-reaping` [adopted id] (11:4–6 is literal sowing under uncertainty, not the moral sowing/reaping register).
3. Anchor-extension candidates:
   - `generosity` | Eccl 11:1-2 | "Cast your bread on the waters; for you shall find it after many days." (11:1) + "Give a portion to seven, yes, even to eight" (11:2) | w=0.6 — GUARDRAIL: gist must not read 11:1 as return-on-giving (book Decisions #6; doctrinal basis on blessing-as-technique).
   - `work-and-diligence` | Eccl 11:6 | "In the morning sow your seed, and in the evening don't withhold your hand" | w=0.6.
   - `divine-judgment` | Eccl 11:9 | "but know that for all these things God will bring you into judgment" | w=0.55.
   - `enjoying-gods-gifts` | Eccl 11:8-9 | "if a man lives many years, let him rejoice in them all" … "Rejoice, young man, in your youth" | w=0.6 (pack's Ecclesiastes anchors stop at 9:7-9).
4. Lexicon candidates: `generosity` | "cast your bread upon the waters" | queries: "cast your bread upon the waters meaning", "give to seven or eight", "giving when the future is uncertain" (searchers type the KJV-style "upon"; WEB reads "on").
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: book-doc subdivision → mark for the per-verse refinement pass (11:1–6 venture/diligence; 11:7–10 rejoicing bounded by judgment).
8. Decisions record: none.

## Ecclesiastes 12 (subdivided: 12:1–8 / 12:9–14)
1. Existing tags (book doc): `stewardship-of-days`, `obedience-to-the-word`, `divine-judgment`, `aging-and-old-age`, `mortality`, `fear-of-the-lord`, `the-breath-of-life` — 7, above the soft cap, within the hard ceiling.
2. Applied-tag deltas: No changes — every sitting tag independently clears the bar (recorded in book Decisions #17); adding anything would require a §11.6 yield from tags that all sit on first-rank texts. Prior recorded skip stands: `vanity-of-life` (12:8 single-verse refrain restatement — Decisions #15). Considered and not added: `power-of-gods-word` / `shepherds-and-the-flock` (12:11 "given from one shepherd" — reading the shepherd as God is interpretive, signpost-only territory); `studying-the-word` (12:12 is a wry caution about study's weariness, the concept's inverse).
3. Anchor-extension candidates:
   - `obedience-to-the-word` | Eccl 12:13 | "Fear God and keep his commandments; for this is the whole duty of man." | w=0.7 (pack has no Ecclesiastes anchor; `fear-of-the-lord` already anchors the verse at w=0.9 — both-registers, curator to confirm no fixture guard collides).
   - `divine-judgment` | Eccl 12:14 | "For God will bring every work into judgment, with every hidden thing, whether it is good, or whether it is evil." | w=0.7.
   - `stewardship-of-days` | Eccl 12:1 | "Remember also your Creator in the days of your youth, before the evil days come" | w=0.7 (pack anchors are NT redeeming-the-time texts only).
   - (`aging-and-old-age` Eccl 12:1-7 and `the-breath-of-life` Eccl 12:7 already in their packs.)
   - ROUTED to row 19 (`vanity-of-life`): Eccl 12:8 "Vanity of vanities," says the Preacher. "All is vanity!" (the row's own arc note routes to 12:13–14; 12:8 is the closing refrain instance).
4. Lexicon candidates:
   - `fear-of-the-lord` | "the whole duty of man" | queries: "fear god and keep his commandments", "whole duty of man meaning", "conclusion of ecclesiastes".
   - `stewardship-of-days` | "remember your creator in the days of your youth" | queries: "remember your creator", "bible verses for young people", "serving god while young".
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: 7 tags (above soft cap 6, under hard ceiling 8) + book-doc subdivision → mark for the per-verse refinement pass (12:1–8 aging/mortality/stewardship-of-days; 12:9–14 fear/obedience/judgment).
8. Decisions record: none (no yield — nothing added, ceiling not exceeded).

---

## Ecclesiastes — sweep totals

- ADD 4 (`vanity-of-life` ch 6; `mortality` ch 7; `governing-authorities` ch 8; `leadership` ch 10) · KEEP all 44 existing · DROP 0.
- Anchor-extension candidates: 24 (across 17 engine packs) + 4 ROUTED anchor sets to corpus-blocked row 19.
- Lexicon candidates: 15 rows (13 distinct packs) + routed phrasings on row 19.
- New-concept candidates: 0 (all candidate themes already logged, folded, or checked-and-declined — verified against declines.md).
- Decline-overturn proposals: 0.
- Corpus-blocked routings: 1 roster row touched (row 19, `vanity-of-life`) — routed evidence from chs 1, 2, 6, 12.
- Ceiling/refinement flags: chs 3, 5 (soft cap 6 + subdivided), 11 (subdivided), 12 (7 tags + subdivided). No chapter at hard ceiling 8.

**§9 survival audit (this block):** written as one atomic end-of-file append; after write, the file was re-read, pre-existing bytes verified unchanged, and this block verified present exactly once. [VERIFIED at append time — see ledger tail.]
