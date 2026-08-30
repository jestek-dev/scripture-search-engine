# Proverbs — Layer-3 tag-sweep ledger (plan §5.2)

**Date:** 2026-08-26 · **Repo:** `scripture-search-engine` @ origin/main `e762d1c629f5b121a2aacc6da57cca6bacc3215e` · **Book:** Proverbs, chapters 1–31 · **Concept library:** 239 engine packs (`ontology/concepts/*.yaml` at this SHA) + the 161 §11.1 adopted display ids (canonical list: `tag-apply/adopted-concepts.md`, cross-checked against the sweep kit's regenerated list — no discrepancies).
**Prior art:** `/mnt/project-files/research/bible-rollout/proverbs.md` (158 tags across 31 chapters; Decisions record #1–#18 binding, incl. #4 prosperity guardrail, #5 sexual-purity register, #6 Prov 8 Christology signposted only, #8 no tags from condemned speakers, #10 no `divine-judgment` in the book, #16's 44 recorded skips). Declines honored: `tag-gaps-review.md` §3.2's eight Proverbs declines + three contingencies (all landed), per the sweep kit's declines.md.
**Inputs:** sweep-kit rules.md (CONVENTIONS §5/§9/§11 verbatim), concepts.md, concept-ids.txt, declines.md, corpus-blocked.md, books.md, output-spec.md.
**WEB text provenance:** all quotes verified word-for-word against the staged verse-per-line extraction from the full-Bible fixture at commit `87fd68c` (`generatedFrom.sourceSha256` = the `b6f55cc7…` pin that e762d1c's `pipeline/manifests/web.json` carries post-PR #53; byte-identical to the committed e762d1c fixture over all 5,726 witnessed verses). Chapters 3, 27, 28 are additionally pinned-fixture-witnessed at e762d1c; the other 28 chapters rest on the 87fd68c extraction (same pinned source sha). Apostrophes normalized to straight quotes per proverbs.md Decisions #16's recorded convention; words never altered.

**Entry format legend (per sweep output-spec):** each `## Proverbs N` block carries: 1. Existing tags (book doc, prior art) · 2. Applied-tag deltas (ADD/KEEP/DROP; KEEP is default and unlisted unless commented; no silent drops) · 3. Anchor-extension candidates (`id` | ref | WEB quote | proposed weight) · 4. Lexicon candidates (`id` | term | 2–3 realistic queries) · 5. New-concept candidates · 6. Decline-overturn proposals · 7. Ceiling/refinement flags · 8. Decisions record (§11.6 yields). Corpus-blocked findings appear as "ROUTED to corpus-blocked roster row N" lines — routed, never proposed as packs. Scope: display/research only; no engine changes, no repo changes, no PRs, no fixtures.

---

## Proverbs 1 (subdivided: 1:1–7; 1:8–19; 1:20–33)
1. Existing tags (book doc): `wisdom-from-god`, `sin`, `fear-of-the-lord`, `temptation`.
2. Applied-tag deltas: No changes — all four re-verified against the full text; no further concept clears the honest-presence bar (1:28's refused caller is personified Wisdom — the recorded `unanswered-prayer` register caveat stands; 1:32 `complacency` decline stands, see §6).
3. Anchor-extension candidates:
   - `temptation` | Prov 1:10 | "My son, if sinners entice you, don't consent." | w=0.9 — the pack carries no OT resistance-side text; this is Scripture's plainest anti-enticement imperative (echoes the tag-gaps temptation-row append; this is the engine-anchor form of it).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None — `complacency` decline (Prov 1:32 = careless ease refusing Wisdom's call, not the settled-denial register; declines.md §3.2 #4) re-checked against "The careless ease of fools will destroy them" (1:32): sound, stands.
7. Ceiling / refinement flags: book-doc subdivision (3 sections) → mark for per-verse refinement pass.
8. Decisions record: None.

## Proverbs 2
1. Existing tags (book doc): `wisdom-from-god`, `gods-protection`, `knowing-god`.
2. Applied-tag deltas: No changes — `pastoral-sexual-purity` re-checked and still correctly absent per Decisions #5 (2:16–19 is a listed benefit, not the sustained-address register).
3. Anchor-extension candidates:
   - `gods-protection` | Prov 2:7-8 | "He is a shield to those who walk in integrity, that he may guard the paths of justice, and preserve the way of his saints." | w=0.65 — the pack is currently all-Psalms/Isaiah; a wisdom-register protection text.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Proverbs 3 (subdivided: 3:1–12; 3:13–35) [pinned-fixture verified]
1. Existing tags (book doc): `trust-in-god`, `the-lords-discipline`, `wisdom-from-god`, `tithing`, `creation`, `humble-exaltation`, `design-in-creation` (7).
2. Applied-tag deltas: No changes — at 7 of 8; the remaining candidates (3:31 `envy-and-jealousy`/`prosperity-of-the-wicked` thin single imperative — recorded pass-#16 skip stands; 3:25 `fear-not` is already that pack's anchor, single verse) do not clear the bar over sitting tags.
3. Anchor-extension candidates:
   - `humble-exaltation` | Prov 3:34 | "Surely he mocks the mockers, but he gives grace to the humble." | w=0.85 — the James 4:6 / 1 Peter 5:5 source text; absent from the pack.
   - `the-lords-discipline` | Prov 3:11-12 | "My son, don't despise the LORD's discipline, neither be weary of his correction; for whom the LORD loves, he corrects, even as a father reproves the son in whom he delights." | w=0.9 — the pack anchors only Heb 12:7-11 (which quotes these verses) and Rev 3:19; the OT source text is missing.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: book-doc subdivision (2 sections); at 7 (over soft cap, within ceiling) → mark for per-verse refinement pass.
8. Decisions record: None.

## Proverbs 4
1. Existing tags (book doc): `parenting`.
2. Applied-tag deltas:
   - ADD `thought-life` — the chapter's closing charge is the pack's own anchor text: "Keep your heart with all diligence, for out of it is the wellspring of life." (4:23), extended by the guard-the-gates run 4:24–27 (mouth, eyes, feet). The concept (`thought-life` anchors Prov 4:23 w=0.85) post-dates the book doc's 131-id vocabulary; the doc's motif-list routing of 4:23 to "nearest homes self-control / wisdom-from-god; not asserted" is superseded by the pack's existence. Chapter's "(Only one honest tag)" note is now historical. No divine reference is needed for this concept (unlike the Decisions-#13 `wisdom-from-god` drop, which stands).
3. Anchor-extension candidates: None (4:23 already anchored; 4:18's dawning-light path stays a motif per the recorded `walking-in-the-light` later-revelation register call).
4. Lexicon candidates:
   - `thought-life` | guard your heart | queries: "guard your heart bible verse", "above all else guard your heart", "wellspring of life meaning" — the pack lexicon carries none of the famous Prov 4:23 phrasing.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Proverbs 5
1. Existing tags (book doc): `pastoral-sexual-purity`, `godly-marriage`, `sin`.
2. Applied-tag deltas: No changes.
3. Anchor-extension candidates:
   - `pastoral-sexual-purity` | Prov 5:8 | "Remove your way far from her. Don't come near the door of her house," | w=0.8 — the strategy-of-distance text; the pack has no Proverbs anchor despite chs 5–7 being tagged.
   - `godly-marriage` | Prov 5:18-19 | "Let your spring be blessed. Rejoice in the wife of your youth." | w=0.7 — the faithful-marriage alternative; pack is all-NT.
4. Lexicon candidates:
   - `pastoral-sexual-purity` | adultery | queries: "what does the bible say about adultery", "adultery in the bible", "warning against adultery" — no pack's lexicon carries bare "adultery"; register cross-note for the curator: pastoral-crisis register (`pastoral-betrayal-and-marriage-crisis` owns affair-victim phrasings) vs this pack's flee-temptation register vs `the-ten-commandments` — decide the owner before adding.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Proverbs 6 (subdivided: 6:1–19; 6:20–35)
1. Existing tags (book doc): `work-and-diligence`, `honesty`, `pastoral-sexual-purity`, `money-and-possessions`.
2. Applied-tag deltas: No changes — `restitution` (6:30–31) decline re-checked and stands (see §6).
3. Anchor-extension candidates:
   - `work-and-diligence` | Prov 6:6-11 | "Go to the ant, you sluggard. Consider her ways, and be wise" | w=0.9 — the pack has NO Proverbs anchors at all; the ant passage is the canonical work text lay users expect.
   - `pastoral-sexual-purity` | Prov 6:27-29 | "Can a man scoop fire into his lap, and his clothes not be burned?" | w=0.7.
4. Lexicon candidates:
   - `work-and-diligence` | laziness / sluggard | queries: "what does the bible say about laziness", "bible verses about being lazy", "the sluggard in proverbs" — the pack lexicon has only positive work vocabulary; the negative register (Proverbs' dominant form) is unreachable.
5. New-concept candidates: None.
6. Decline-overturn proposals: None — `restitution` decline (declines.md §3.2 #3) re-checked: 6:30-31 ("but if he is found, he shall restore seven times") is indeed the a-fortiori step in the adultery argument (6:32-35 is the point); sound, stands.
7. Ceiling / refinement flags: book-doc subdivision (2 sections) → mark for per-verse refinement pass.
8. Decisions record: None.

## Proverbs 7
1. Existing tags (book doc): `pastoral-sexual-purity`, `temptation`.
2. Applied-tag deltas: No changes — Decisions #8 re-verified: no tag rides the adulteress's speech (7:14–20).
3. Anchor-extension candidates:
   - `temptation` | Prov 7:21-23 | "With persuasive words, she led him astray. With the flattering of her lips, she seduced him. He followed her immediately, as an ox goes to the slaughter" | w=0.7 — the anatomized enticement narrative (teacher-voice narration, not the condemned speaker's words).
   - `pastoral-sexual-purity` | Prov 7:25-27 | "Don't let your heart turn to her ways. Don't go astray in her paths, for she has thrown down many wounded." | w=0.75.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Proverbs 8
1. Existing tags (book doc): `wisdom-from-god`, `creation`, `fear-of-the-lord`.
2. Applied-tag deltas: No changes — Decisions #6 binding: Lady Wisdom described as personification; Christological reading stays signposted-only, so no christ-ward tag is proposed.
3. Anchor-extension candidates:
   - `design-in-creation` | Prov 8:29 | "when he gave to the sea its boundary, that the waters should not violate his commandment, when he marked out the foundations of the earth," | w=0.7 — boundary-and-order language of the pack's register (its Prov 3:19-20 top anchor's sibling passage); safe: the anchor asserts creation's orderedness, not the personification's identity.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None — `craftsmanship-and-creativity` decline (declines.md §3.2 #7) re-checked against 8:30 ("then I was the craftsman by his side"): personified Wisdom, not the Bezalel artisan-skill register; sound, stands.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Proverbs 9 (subdivided: 9:1–12; 9:13–18)
1. Existing tags (book doc): `wisdom-from-god`, `fear-of-the-lord`, `receiving-correction`.
2. Applied-tag deltas: No changes — Decisions #8 re-verified (no tag from Folly's 9:17 menu).
3. Anchor-extension candidates: None (`receiving-correction` already anchors 9:8-9; `wisdom-from-god` anchors 9:10).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: book-doc subdivision (2 sections) → mark for per-verse refinement pass.
8. Decisions record: None.

## Proverbs 10
1. Existing tags (book doc): `taming-the-tongue`, `work-and-diligence`, `gods-provision`, `blessing`, `integrity`.
2. Applied-tag deltas: No changes.
3. Anchor-extension candidates:
   - `taming-the-tongue` | Prov 10:19 | "In the multitude of words there is no lack of disobedience, but he who restrains his lips does wisely." | w=0.75.
   - `work-and-diligence` | Prov 10:4 | "He becomes poor who works with a lazy hand, but the hand of the diligent brings wealth." | w=0.85 — no Proverbs anchor in the pack (see ch 6).
   - `blessing` | Prov 10:22 | "The LORD's blessing brings wealth, and he adds no trouble to it." | w=0.7 — generalization framing per Decisions #4 rides the gist, not the anchor.
   - `gods-provision` | Prov 10:3 | "The LORD will not allow the soul of the righteous to go hungry" | w=0.6.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none.
8. Decisions record: None.

## Proverbs 11
1. Existing tags (book doc): `honesty`, `generosity`, `humble-exaltation`, `mercy`, `money-and-possessions`, `sowing-and-reaping`.
2. Applied-tag deltas:
   - ADD `taming-the-tongue` — a genuine speech thread the original pass left untagged: "With his mouth the godless man destroys his neighbor" (11:9), the city "overthrown by the mouth of the wicked" (11:11), and the direct restraint teaching "One who brings gossip betrays a confidence, but one who is of a trustworthy spirit is one who keeps a secret." (11:12–13). Four verses of speech-ethics teaching; clears the bar independently (ceiling not reached: 7 of 8).
3. Anchor-extension candidates:
   - `honesty` | Prov 11:1 | "A false balance is an abomination to the LORD, but accurate weights are his delight." | w=0.9 — the pack has no Proverbs anchor; the marketplace-honesty text lay users expect.
   - `integrity` | Prov 11:3 | "The integrity of the upright shall guide them, but the perverseness of the treacherous shall destroy them." | w=0.7.
   - `humble-exaltation` | Prov 11:2 | "When pride comes, then comes shame, but with humility comes wisdom." | w=0.7.
   - ROUTED to corpus-blocked roster row 15 (`counsel-and-advisers`): Prov 11:14 — "Where there is no wise guidance, the nation falls, but in the multitude of counselors there is victory." (signature text; already named in the roster's recorded reason — confirming, not new).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None — `deliverance` decline (declines.md §3.2 #5) re-checked against 11:8 ("A righteous person is delivered out of trouble, and the wicked takes his place."): act–consequence generalization, not rescue narrative; sound, stands.
7. Ceiling / refinement flags: at 7 after ADD (over soft cap, within ceiling).
8. Decisions record: None (no yield needed; all 7 independently clear the bar).

## Proverbs 12
1. Existing tags (book doc): `honesty`, `taming-the-tongue`, `work-and-diligence`.
2. Applied-tag deltas:
   - ADD `receiving-correction` — the chapter opens with the concept's own anchor verse: "Whoever loves correction loves knowledge, but he who hates reproof is stupid." (12:1; the pack anchors Prov 12:1 w=0.8), seconded by "he who is wise listens to counsel" (12:15). Pass #16 skipped this only for "no verifiable WEB anchor available from the sanctioned sources" — the staged pinned-source text now supplies verification, so the skip reason is discharged (not overturned: it was a provenance block, not a presence ruling).
3. Anchor-extension candidates:
   - `honesty` | Prov 12:22 | "Lying lips are an abomination to the LORD, but those who do the truth are his delight." | w=0.85.
   - `taming-the-tongue` | Prov 12:18 | "There is one who speaks rashly like the piercing of a sword, but the tongue of the wise heals." | w=0.8.
   - `work-and-diligence` | Prov 12:24 | "The hands of the diligent ones shall rule, but laziness ends in slave labor." | w=0.7.
   - ROUTED to corpus-blocked roster row 20 (`right-in-their-own-eyes`): Prov 12:15 — "The way of a fool is right in his own eyes, but he who is wise listens to counsel." (named in the roster as a nearest witness — confirming). Second half also touches row 15 (`counsel-and-advisers`) — noted, not duplicated.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (4 of 8).
8. Decisions record: None.

## Proverbs 13
1. Existing tags (book doc): `parenting`, `work-and-diligence`, `friendship`, `money-and-possessions`.
2. Applied-tag deltas:
   - ADD `receiving-correction` — a sustained teachability thread: "A wise son listens to his father's instruction, but a scoffer doesn't listen to rebuke." (13:1); "Whoever despises instruction will pay for it" (13:13); "Poverty and shame come to him who refuses discipline, but he who heeds correction shall be honored." (13:18). Pass #16's skip was quote-verifiability only (as ch 12); discharged by the staged text.
3. Anchor-extension candidates:
   - `parenting` | Prov 13:24 | "One who spares the rod hates his son, but one who loves him is careful to discipline him." | w=0.8 — the famous discipline text is absent from the pack.
   - `work-and-diligence` | Prov 13:4 | "The soul of the sluggard desires, and has nothing, but the desire of the diligent shall be fully satisfied." | w=0.75.
   - `money-and-possessions` | Prov 13:11 | "Wealth gained dishonestly dwindles away, but he who gathers by hand makes it grow." | w=0.7.
   - `justice-and-oppression` | Prov 13:23 | "An abundance of food is in poor people's fields, but injustice sweeps it away." | w=0.6 (single-verse witness — anchor only, not a display tag).
   - `receiving-correction` | Prov 13:18 | "Poverty and shame come to him who refuses discipline, but he who heeds correction shall be honored." | w=0.7 — not currently in the pack (which has 12:1, 15:31-32, 9:8-9, 27:5-6, 28:23).
4. Lexicon candidates:
   - `parenting` | spare the rod | queries: "spare the rod spoil the child", "what does the bible say about disciplining a child", "rod of discipline meaning".
5. New-concept candidates: None.
6. Decline-overturn proposals: None — 13:12 ("Hope deferred makes the heart sick") stays a motif per the book doc's recorded register call (diagnosis, not the `pastoral-hope-in-despair` hope-text register); re-checked, sound.
7. Ceiling / refinement flags: none (5 of 8).
8. Decisions record: None.

## Proverbs 14
1. Existing tags (book doc): `self-deception`, `refuge-in-trouble`, `self-control`, `envy-and-jealousy`, `generosity`, `justice-and-oppression`.
2. Applied-tag deltas: No changes — `fear-of-the-lord` re-checked: pass-#16 same-verse-duplication skip (14:26–27 carried under `refuge-in-trouble`) stands.
3. Anchor-extension candidates:
   - `self-deception` | Prov 14:12 | "There is a way which seems right to a man, but in the end it leads to death." | w=0.9 — the concept's most-quoted OT text, absent from the pack (which is James/Galatians/1 John only). (Same saying repeats at 16:25.)
   - `self-control` | Prov 14:29 | "He who is slow to anger has great understanding, but he who has a quick temper displays folly." | w=0.85 — the pack has NO Proverbs anchors; per the recorded `slow-to-anger` decline, the human anger-virtue routes here.
   - `justice-and-oppression` | Prov 14:31 | "He who oppresses the poor shows contempt for his Maker, but he who is kind to the needy honors him." | w=0.8.
   - `fear-of-the-lord` | Prov 14:26-27 | "In the fear of the LORD is a secure fortress, and he will be a refuge for his children. The fear of the LORD is a fountain of life, turning people from the snares of death." | w=0.75 (engine anchor is not display duplication — the display skip stands; the pack lacks these verses).
4. Lexicon candidates:
   - `self-control` | anger | queries: "what does the bible say about anger", "controlling your anger", "hot temper bible verse" — the pack lexicon ("self control | self discipline | self controlled") carries no anger vocabulary at all, and the phrase "slow to anger" is owned by the `slow-to-anger` God's-patience pack (recorded decline §3.2 #1) — so anger-management phrasings, not that phrase, are the safe extension.
5. New-concept candidates: None.
6. Decline-overturn proposals: None — `slow-to-anger` decline (§3.2 #1) re-checked against 14:29: it is the human virtue, distinct from the Exod 34:6 divine-patience register; sound, stands (served via the `self-control` extensions above).
7. Ceiling / refinement flags: none (6 of 8).
8. Decisions record: None.

## Proverbs 15
1. Existing tags (book doc): `taming-the-tongue`, `prayer`, `contentment`, `humble-exaltation`, `empty-worship`, `god-looks-at-the-heart`.
2. Applied-tag deltas:
   - ADD `receiving-correction` — the chapter's densest in-book teachability cluster: "A fool despises his father's correction, but he who heeds reproof shows prudence." (15:5); "Whoever hates reproof shall die." (15:10); "A scoffer doesn't love to be reproved" (15:12); "The ear that listens to reproof lives, and will be at home among the wise. He who refuses correction despises his own soul, but he who listens to reproof gets understanding." (15:31–32 — the pack's own anchor). Pass #16's skip was quote-verifiability only; discharged by the staged text. Chapter lands at 7 (within ceiling; each tag independently clears the bar).
3. Anchor-extension candidates:
   - `taming-the-tongue` | Prov 15:1 | "A gentle answer turns away wrath, but a harsh word stirs up anger." | w=0.95 — the book's most-quoted speech text is absent from the pack; glaring gap.
   - `prayer` | Prov 15:29 | "The LORD is far from the wicked, but he hears the prayer of the righteous." | w=0.7.
   - `contentment` | Prov 15:16-17 | "Better is little, with the fear of the LORD, than great treasure with trouble. Better is a dinner of herbs, where love is, than a fattened calf with hatred." | w=0.75.
   - `care-for-widows` | Prov 15:25 | "The LORD will uproot the house of the proud, but he will keep the widow's borders intact." | w=0.6 (anchor only; single verse, not display-taggable).
   - `self-control` | Prov 15:18 | "A wrathful man stirs up contention, but one who is slow to anger appeases strife." | w=0.7 (anger-virtue routing per §3.2 #1 decline).
   - ROUTED to corpus-blocked roster row 15 (`counsel-and-advisers`): Prov 15:22 — "Where there is no counsel, plans fail; but in a multitude of counselors they are established." (signature text; confirming the roster's own ref).
   - ROUTED to corpus-blocked roster row 6 (`god-looks-at-the-heart`): Prov 15:3 — "The LORD's eyes are everywhere, keeping watch on the evil and the good." — NEW ref for the row (roster lists 15:11 but not 15:3; the display tag here already quotes it).
4. Lexicon candidates:
   - `taming-the-tongue` | gentle answer | queries: "a gentle answer turns away wrath", "soft answer bible verse", "how to respond to angry people".
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 after ADD (over soft cap, within ceiling).
8. Decisions record: None (no yield; all 7 clear the bar).

## Proverbs 16
1. Existing tags (book doc): `providence`, `trust-in-god`, `humble-exaltation`, `self-control`, `aging-and-old-age`, `god-looks-at-the-heart`.
2. Applied-tag deltas:
   - ADD `leadership` — the royal cluster pass #16 skipped only for quote-verifiability ("no verifiable WEB anchor"), now discharged: "Inspired judgments are on the lips of the king." (16:10); "It is an abomination for kings to do wrong, for the throne is established by righteousness." (16:12); "Righteous lips are the delight of kings. They value one who speaks the truth." (16:13, with 16:14–15) — five verses on how thrones stand, the concept's biblical-leadership register. Chapter lands at 7.
3. Anchor-extension candidates:
   - `humble-exaltation` | Prov 16:18-19 | "Pride goes before destruction, and an arrogant spirit before a fall. It is better to be of a lowly spirit with the poor, than to divide the plunder with the proud." | w=0.95 — the most-quoted pride text in Scripture is absent from the pack.
   - `providence` | Prov 16:33 | "The lot is cast into the lap, but its every decision is from the LORD." | w=0.8 (pack has 16:9 only from this chapter).
   - `trust-in-god` | Prov 16:3 | "Commit your deeds to the LORD, and your plans shall succeed." | w=0.8.
   - `self-control` | Prov 16:32 | "One who is slow to anger is better than the mighty; one who rules his spirit, than he who takes a city." | w=0.9.
   - `fear-of-the-lord` | Prov 16:6 | "By mercy and truth iniquity is atoned for. By the fear of the LORD men depart from evil." | w=0.65 (display re-add not proposed — the concept already carries five Proverbs chapters; pass-#16 skip class noted). Curator caution carried from §3.2 #6: 16:6a's non-ritual atonement vocabulary stays the curator's call, not appended to `sacrifice-and-atonement` (roster row 1).
   - `honesty` | Prov 16:11 | "Honest balances and scales are the LORD's; all the weights in the bag are his work." | w=0.65.
   - `leadership` | Prov 16:12 | "It is an abomination for kings to do wrong, for the throne is established by righteousness." | w=0.75.
   - ROUTED to corpus-blocked roster row 6 (`god-looks-at-the-heart`): Prov 16:2 — "All the ways of a man are clean in his own eyes, but the LORD weighs the motives." (confirming the roster's listed ref).
4. Lexicon candidates:
   - `humble-exaltation` | pride goes before a fall | queries: "pride goes before a fall", "pride comes before the fall bible verse", "pride goes before destruction meaning" — the pack owns bare "pride" but not the famous phrasing.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 after ADD (over soft cap, within ceiling).
8. Decisions record: None (no yield; all 7 clear the bar).

## Proverbs 17
1. Existing tags (book doc): `harmony-with-others`, `forgiving-others`, `friendship`, `testing`, `gloating-over-downfall`, `justice-and-oppression`.
2. Applied-tag deltas: No changes — `receiving-correction` at 17:10 is a thin single verse in a concept already carrying six Proverbs chapters after this sweep; served as an anchor-extension below rather than a seventh display chapter (thin-single-verse class).
3. Anchor-extension candidates:
   - `forgiving-others` | Prov 17:9 | "He who covers an offense promotes love; but he who repeats a matter separates best friends." | w=0.8 — the pack has no Proverbs anchor.
   - `harmony-with-others` | Prov 17:14 | "The beginning of strife is like breaching a dam, therefore stop contention before quarreling breaks out." | w=0.75.
   - `receiving-correction` | Prov 17:10 | "A rebuke enters deeper into one who has understanding than a hundred lashes into a fool." | w=0.7.
   - `taming-the-tongue` | Prov 17:27-28 | "He who spares his words has knowledge. He who is even tempered is a man of understanding. Even a fool, when he keeps silent, is counted wise." | w=0.7.
   - `aging-and-old-age` | Prov 17:6 | "Children's children are the crown of old men; the glory of children is their parents." | w=0.6 (pass-#16 skip was quote-verifiability; anchor-grade, not display-grade — single verse).
   - ROUTED to corpus-blocked roster row 14 (`gloating-over-downfall`): Prov 17:5 — "He who is glad at calamity shall not be unpunished." (confirming the roster's listed ref; display tag already sits here).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (6 of 8).
8. Decisions record: None.

## Proverbs 18
1. Existing tags (book doc): `refuge-in-trouble`, `taming-the-tongue`, `godly-marriage`, `friendship`, `favoritism`.
2. Applied-tag deltas: No changes — `humble-exaltation` at 18:12 is a thin single verse restating 15:33's sitting anchor; anchor-extension only.
3. Anchor-extension candidates:
   - `refuge-in-trouble` | Prov 18:10 | "The LORD's name is a strong tower: the righteous run to him, and are safe." | w=0.9 — absent from the pack; the book doc's motif list already routes "strong tower" queries here.
   - `godly-marriage` | Prov 18:22 | "Whoever finds a wife finds a good thing, and obtains favor of the LORD." | w=0.75.
   - `taming-the-tongue` | Prov 18:13 | "He who answers before he hears, that is folly and shame to him." | w=0.7.
   - `humble-exaltation` | Prov 18:12 | "Before destruction the heart of man is proud, but before honor is humility." | w=0.7.
4. Lexicon candidates:
   - `refuge-in-trouble` | strong tower | queries: "the name of the lord is a strong tower", "god is my strong tower", "strong tower bible verse".
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (5 of 8).
8. Decisions record: None.

## Proverbs 19
1. Existing tags (book doc): `honesty`, `generosity`, `providence`, `parenting`, `fear-of-the-lord`, `integrity`.
2. Applied-tag deltas: No changes — `work-and-diligence` (19:15, 19:24) is a two-verse echo in a concept already carrying nine Proverbs chapters; anchor territory, not a display tag (thin class).
3. Anchor-extension candidates:
   - `generosity` | Prov 19:17 | "He who has pity on the poor lends to the LORD; he will reward him." | w=0.85 — absent from the pack.
   - `providence` | Prov 19:21 | "There are many plans in a man's heart, but the LORD's counsel will prevail." | w=0.85.
   - `self-control` | Prov 19:11 | "The discretion of a man makes him slow to anger. It is his glory to overlook an offense." | w=0.8.
   - `parenting` | Prov 19:18 | "Discipline your son, for there is hope; don't be a willing party to his death." | w=0.7.
   - `integrity` | Prov 19:1 | "Better is the poor who walks in his integrity than he who is perverse in his lips and is a fool." | w=0.7 (pack has 28:6's parallel but not 19:1).
   - `fear-of-the-lord` | Prov 19:23 | "The fear of the LORD leads to life, then contentment; he rests and will not be touched by trouble." | w=0.7.
   - ROUTED to corpus-blocked roster row 15 (`counsel-and-advisers`): Prov 19:20 — "Listen to counsel and receive instruction, that you may be wise in your latter end." — NEW ref for the row (roster names 11:14/15:22 and the 27:9/2 Sam 17/Ps 1:1 in-corpus set; 19:20 is not listed).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (6 of 8).
8. Decisions record: None.

## Proverbs 20
1. Existing tags (book doc): `honesty`, `sin`, `trust-in-god`, `work-and-diligence`, `drunkenness`, `god-looks-at-the-heart`, `integrity`, `conscience` (8 — hard ceiling).
2. Applied-tag deltas: No changes — all eight sitting tags re-verified against the full text; each independently clears the bar (per the apologetics-pass record). Incoming candidate `leadership` (20:8, 20:26, 20:28 — pass-#16 quote-verifiability skip now discharged) is REAL presence (three king verses) but the chapter is at the hard ceiling and no sitting tag fails the bar, so the candidate yields (recorded in §8) and survives as anchor-extensions below → per-verse refinement flag.
3. Anchor-extension candidates:
   - `leadership` | Prov 20:8 | "A king who sits on the throne of judgment scatters away all evil with his eyes." | w=0.7; also Prov 20:26 | "A wise king winnows out the wicked, and drives the threshing wheel over them." | w=0.65; Prov 20:28 | "Love and faithfulness keep the king safe. His throne is sustained by love." | w=0.65.
   - `oaths-and-vows` | Prov 20:25 | "It is a snare to a man to make a rash dedication, then later to consider his vows." | w=0.75 — the book's one vows text; absent from the pack.
   - `honesty` | Prov 20:10 | "Differing weights and differing measures, both of them alike are an abomination to the LORD." | w=0.8.
   - `sin` | Prov 20:9 | "Who can say, 'I have made my heart pure. I am clean and without sin'?" | w=0.8 — universal-sinfulness witness; the pack has no OT anchor.
   - `providence` | Prov 20:24 | "A man's steps are from the LORD; how then can man understand his way?" | w=0.75.
   - `integrity` | Prov 20:7 | "A righteous man walks in integrity. Blessed are his children after him." | w=0.75 (display tag sits here; the pack lacks the verse).
   - `aging-and-old-age` | Prov 20:29 | "The glory of young men is their strength. The splendor of old men is their gray hair." | w=0.65 (pass-#16 quote-verifiability skip; anchor-grade).
   - `vengeance` | Prov 20:22 — already the pack's anchor (w=0.85); no action, noted for completeness.
   - ROUTED to corpus-blocked roster row 15 (`counsel-and-advisers`): Prov 20:18 — "Plans are established by advice; by wise guidance you wage war!" — NEW ref for the row.
   - ROUTED to corpus-blocked roster row 6 (`god-looks-at-the-heart`): Prov 20:27 — "The spirit of man is the LORD's lamp, searching all his innermost parts." (confirming the roster's listed ref).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD CEILING 8 → mark for per-verse refinement pass (the blocked `leadership` candidate and the dense anchor set above are its worklist).
8. Decisions record: Incoming candidate `leadership` yields at the ceiling (no sitting tag fails the bar; §11.6 order — the candidate is the weakest class present: a three-verse cluster against eight verse-anchored sitting tags). Not a drop of any existing tag; the candidate is preserved as anchor-extensions and in the refinement flag.

## Proverbs 21
1. Existing tags (book doc): `providence`, `worship`, `generosity`, `work-and-diligence`, `god-looks-at-the-heart`, `justice-and-oppression`, `unanswered-prayer` (7).
2. Applied-tag deltas: No changes — at 7; remaining candidates are single verses (21:23 tongue; 21:31 victory) that don't clear the bar as display tags.
3. Anchor-extension candidates:
   - `providence` | Prov 21:1 | "The king's heart is in the LORD's hand like the watercourses. He turns it wherever he desires." | w=0.9; also Prov 21:30 | "There is no wisdom nor understanding nor counsel against the LORD." | w=0.8.
   - `taming-the-tongue` | Prov 21:23 | "Whoever guards his mouth and his tongue keeps his soul from troubles." | w=0.75.
   - `empty-worship` | Prov 21:27 | "The sacrifice of the wicked is an abomination— how much more, when he brings it with a wicked mind!" | w=0.7.
   - `victory-in-christ` | Prov 21:31 | "The horse is prepared for the day of battle; but victory is with the LORD." | w=0.6 — the pack's lexicon carries "the battle belongs to the lord" / "god fights for us"; this is the OT proverb form of that intent.
   - ROUTED to corpus-blocked roster row 20 (`right-in-their-own-eyes`): Prov 21:2 — "Every way of a man is right in his own eyes, but the LORD weighs the hearts." (confirming the roster's nearest-witness ref; also row 6's listed ref — noted once, both rows named).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 (over soft cap, within ceiling).
8. Decisions record: None.

## Proverbs 22 (subdivided: 22:1–16; 22:17–29)
1. Existing tags (book doc): `parenting`, `generosity`, `trust-in-god`, `humble-exaltation`, `justice-and-oppression`, `sowing-and-reaping`.
2. Applied-tag deltas: No changes — `friendship` (22:24–25, choose-your-companions register) and `money-and-possessions` (22:26–27 debt pledge) are single sayings; anchor-extensions below, not seventh/eighth display tags.
3. Anchor-extension candidates:
   - `justice-and-oppression` | Prov 22:22-23 | "Don't exploit the poor because he is poor; and don't crush the needy in court; for the LORD will plead their case" | w=0.85.
   - `generosity` | Prov 22:9 | "He who has a generous eye will be blessed, for he shares his food with the poor." | w=0.75.
   - `friendship` | Prov 22:24-25 | "Don't befriend a hot-tempered man. Don't associate with one who harbors anger, lest you learn his ways and ensnare your soul." | w=0.7 — the choosing-friends register the pack's lexicon already names.
   - `humble-exaltation` | Prov 22:4 | "The result of humility and the fear of the LORD is wealth, honor, and life." | w=0.7 (generalization framing per Decisions #4).
   - `trust-in-god` | Prov 22:19 | "I teach you today, even you, so that your trust may be in the LORD." | w=0.65.
   - `money-and-possessions` | Prov 22:26-27 | "Don't you be one of those who strike hands, of those who are collateral for debts." | w=0.6 — rides the gap log's recorded debt-texts fold-or-split question (scope with `contentment`'s anchored 22:7).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: book-doc subdivision (2 sections; collection seam at 22:17) → mark for per-verse refinement pass.
8. Decisions record: None.

## Proverbs 23
1. Existing tags (book doc): `parenting`, `envy-and-jealousy`, `self-control`, `caring-for-aging-parents`, `drunkenness`, `justice-and-oppression`, `money-and-possessions` (7).
2. Applied-tag deltas: No changes — at 7; `pastoral-sexual-purity` (23:26–28) stays untagged per Decisions #5's sustained-address register rule (two verses inside the sayings collection, not the chs 5–7 register).
3. Anchor-extension candidates:
   - `caring-for-aging-parents` | Prov 23:22 | "Listen to your father who gave you life, and don't despise your mother when she is old." | w=0.7 — the display tag's own verse is absent from the pack (which anchors Exod 20:12 / Eph 6:2-3 for the honor register).
   - `envy-and-jealousy` | Prov 23:17 | "Don't let your heart envy sinners, but rather fear the LORD all day long." | w=0.75.
   - `parenting` | Prov 23:13-14 | "Don't withhold correction from a child. If you punish him with the rod, he will not die. Punish him with the rod, and save his soul from Sheol." | w=0.7.
   - `justice-and-oppression` | Prov 23:10-11 | "Don't move the ancient boundary stone. Don't encroach on the fields of the fatherless, for their Defender is strong. He will plead their case against you." | w=0.7.
   - `hope-in-god` | Prov 23:18 | "Indeed surely there is a future hope, and your hope will not be cut off." | w=0.55 (modest; the fear-of-the-LORD condition rides the range 23:17-18).
   - ROUTED to corpus-blocked roster row 23 (`redeemer`), cautious note: 23:11's "their Defender is strong" renders the go'el word-family in the defender-of-the-weak register — adjacent color for the row's re-pin curator, NOT proposed as a redeemer ref (the row's register is Job 19:25's personal redeemer; asserting identity would over-read).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 (over soft cap, within ceiling).
8. Decisions record: None.

## Proverbs 24 (subdivided: 24:1–22; 24:23–34)
1. Existing tags (book doc): `envy-and-jealousy`, `wisdom-from-god`, `work-and-diligence`, `favoritism`, `gloating-over-downfall`, `prosperity-of-the-wicked`, `vengeance` (7).
2. Applied-tag deltas: No changes — at 7; the rescue-the-perishing charge (24:10–12) is the corpus-blocked `courage` register (routed below), and `governing-authorities` at 24:21 is a single verse (anchor-extension only).
3. Anchor-extension candidates:
   - `prosperity-of-the-wicked` | Prov 24:19-20 | "Don't fret yourself because of evildoers, neither be envious of the wicked; for there will be no reward to the evil man. The lamp of the wicked will be snuffed out." | w=0.8 — the wisdom-answer text; pack is Job/Psalms/Jeremiah only.
   - `vengeance` | Prov 24:29 | "Don't say, 'I will do to him as he has done to me; I will repay the man according to his work.'" | w=0.75 (pack has 20:22 but not this twin).
   - `favoritism` | Prov 24:23 | "To show partiality in judgment is not good." | w=0.7 (pack has 28:21, lacks this).
   - `work-and-diligence` | Prov 24:30-34 | "I went by the field of the sluggard... a little sleep, a little slumber, a little folding of the hands to sleep, so your poverty will come as a robber" | w=0.75.
   - `governing-authorities` | Prov 24:21 | "My son, fear the LORD and the king. Don't join those who are rebellious," | w=0.6 — modest OT witness for the pack's submission-to-authority register.
   - ROUTED to corpus-blocked roster row 17 (`courage`): Prov 24:10-12 — "If you falter in the time of trouble, your strength is small. Rescue those who are being led away to death! Indeed, hold back those who are staggering to the slaughter!" — NEW refs for the row: exactly its recorded unserved register ("courage to do the right thing"), with 24:12's answer to the ignorance excuse.
   - ROUTED to corpus-blocked roster row 14 (`gloating-over-downfall`): Prov 24:17-18 — "Don't rejoice when your enemy falls. Don't let your heart be glad when he is overthrown," (confirming the roster's listed ref).
   - ROUTED to corpus-blocked roster row 15 (`counsel-and-advisers`): Prov 24:6 — "for by wise guidance you wage your war, and victory is in many advisors." — NEW ref for the row (roster names 11:14/15:22; 24:6 unlisted).
   - ROUTED to corpus-blocked roster row 6 (`god-looks-at-the-heart`): Prov 24:12 — "doesn't he who weighs the hearts consider it?" (confirming the roster's listed ref).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: book-doc subdivision (2 sections; seam at 24:23); at 7 → mark for per-verse refinement pass.
8. Decisions record: None.

## Proverbs 25
1. Existing tags (book doc): `humble-exaltation`, `taming-the-tongue`, `loving-others`, `self-control`, `leadership`, `receiving-correction`.
2. Applied-tag deltas: No changes — `slander-and-false-accusation` at 25:18 (pass-#16 quote-verifiability skip, now dischargeable) is a single verse in a chapter at the soft cap whose substance (false testimony as weapon) is anchor-grade; served below rather than as a seventh tag (thin-single-verse class). `harmony-with-others` (25:8–10 litigation counsel) likewise single-saying: anchor-extension.
3. Anchor-extension candidates:
   - `loving-others` | Prov 25:21-22 | "If your enemy is hungry, give him food to eat. If he is thirsty, give him water to drink; for you will heap coals of fire on his head, and the LORD will reward you." | w=0.8 — Paul quotes it (Rom 12:20); absent from the pack.
   - `self-control` | Prov 25:28 | "Like a city that is broken down and without walls is a man whose spirit is without restraint." | w=0.8.
   - `humble-exaltation` | Prov 25:6-7 | "Don't exalt yourself in the presence of the king... for it is better that it be said to you, 'Come up here,' than that you should be put lower" | w=0.75 — the Luke 14:8-10 source picture.
   - `receiving-correction` | Prov 25:12 | "As an earring of gold, and an ornament of fine gold, so is a wise reprover to an obedient ear." | w=0.75.
   - `taming-the-tongue` | Prov 25:11 | "A word fitly spoken is like apples of gold in settings of silver." | w=0.75; also Prov 25:15 | "By patience a ruler is persuaded. A soft tongue breaks the bone." | w=0.65.
   - `slander-and-false-accusation` | Prov 25:18 | "A man who gives false testimony against his neighbor is like a club, a sword, or a sharp arrow." | w=0.7.
   - `harmony-with-others` | Prov 25:8-9 | "Don't be hasty in bringing charges to court... Debate your case with your neighbor, and don't betray the confidence of another," | w=0.6.
   - `leadership` | Prov 25:5 | "Take away the wicked from the king's presence, and his throne will be established in righteousness." | w=0.7.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (6 of 8).
8. Decisions record: None.

## Proverbs 26
1. Existing tags (book doc): `taming-the-tongue`, `self-deception`, `honesty`.
2. Applied-tag deltas:
   - ADD `work-and-diligence` — the book's most sustained sluggard satire, four consecutive verses the original pass described but left untagged: "The sluggard says, 'There is a lion in the road!...'" (26:13); "As the door turns on its hinges, so does the sluggard on his bed." (26:14); "The sluggard buries his hand in the dish. He is too lazy to bring it back to his mouth." (26:15); "The sluggard is wiser in his own eyes than seven men who answer with discretion." (26:16). Negative-form diligence teaching, same substance as the tagged ch 6 ant passage.
3. Anchor-extension candidates:
   - `self-deception` | Prov 26:12 | "Do you see a man wise in his own eyes? There is more hope for a fool than for him." | w=0.8.
   - `taming-the-tongue` | Prov 26:20 | "For lack of wood a fire goes out. Without gossip, a quarrel dies down." | w=0.8.
   - `work-and-diligence` | Prov 26:13-16 | (quotes above) | w=0.7.
   - ROUTED to corpus-blocked roster row 20 (`right-in-their-own-eyes`): Prov 26:12 and 26:16 ("wiser in his own eyes than seven men") — NEW refs for the row (roster names 21:2/12:15 as nearest witnesses; the 26 pair is unlisted).
4. Lexicon candidates:
   - `taming-the-tongue` | flattery | queries: "what does the bible say about flattery", "flattering words bible", "beware of flatterers" — 26:28 ("a flattering mouth works ruin") with 29:5; no pack's lexicon carries the word.
5. New-concept candidates:
   - `the-fool-and-folly` | The book's densest gallery (26:1–12: honor unfitting, answering a fool 26:4–5, the returning dog 26:11) has no vocabulary home: `wisdom-from-god` is the gift register and its lexicon (bare "wisdom", "discernment") never reaches fool-queries. CHECK-FIRST note: decide lexicon-extension-of-`wisdom-from-god` vs mint before building; the dog-returns text also carries the recorded `pastoral-relapse-and-restoration` motif caution (depicts relapse, not restoration — must NOT rank for relapse-crisis queries; harm-gate adjacency). | anchors: Prov 26:4-5 "Don't answer a fool according to his folly, lest you also be like him. Answer a fool according to his folly, lest he be wise in his own eyes."; Prov 26:11 "As a dog that returns to his vomit, so is a fool who repeats his folly."; Prov 1:7 "but the foolish despise wisdom and instruction." | queries: "what does the bible say about fools", "answer a fool according to his folly meaning", "the fool in proverbs".
6. Decline-overturn proposals: None — the 26:11 `pastoral-relapse-and-restoration` motif decline re-checked: sound, stands (see harm-gate note above).
7. Ceiling / refinement flags: none (4 of 8 after ADD).
8. Decisions record: None.

## Proverbs 27 [pinned-fixture verified]
1. Existing tags (book doc): `friendship`, `humble-exaltation`, `work-and-diligence`, `receiving-correction`.
2. Applied-tag deltas: No changes — the Decisions #14 `stewardship-of-days` drop (27:1 is don't-presume-on-tomorrow, not redeeming-the-time) re-checked and stands; `envy-and-jealousy` at 27:4 is already that pack's anchor, single verse, no display tag.
3. Anchor-extension candidates:
   - `friendship` | Prov 27:17 | "Iron sharpens iron; so a man sharpens his friend's countenance." | w=0.85 — the signature friendship text is absent from the pack; also Prov 27:9 | "Perfume and incense bring joy to the heart; so does earnest counsel from a man's friend." | w=0.7 (27:9 is also the roster row 15's recorded in-corpus witness — no duplication: this is the friendship register).
   - `humble-exaltation` | Prov 27:2 | "Let another man praise you, and not your own mouth; a stranger, and not your own lips." | w=0.7.
4. Lexicon candidates:
   - `friendship` | iron sharpens iron | queries: "iron sharpens iron meaning", "friends who sharpen you", "iron sharpens iron bible verse" — the pack lexicon lacks the phrase.
5. New-concept candidates: None.
6. Decline-overturn proposals: None — `shepherds-and-the-flock` decline (§3.2 #8) re-checked against 27:23 ("Know well the state of your flocks, and pay attention to your herds,"): literal husbandry counsel; sound, stands.
7. Ceiling / refinement flags: none (4 of 8).
8. Decisions record: None.

## Proverbs 28 [pinned-fixture verified]
1. Existing tags (book doc): `repentance`, `trust-in-god`, `generosity`, `hardness-of-heart`, `justice-and-oppression`, `money-and-possessions`, `unanswered-prayer` (7).
2. Applied-tag deltas: No changes — at 7; the pass-#16 cap plan (projected 14 → 7) re-verified sound; remaining candidates (`integrity` 28:6/28:18 — already the pack's own anchors, recorded thin-echo skip; `favoritism` 28:21 — recorded thin-echo skip; boldness at 28:1 — routed below) stand as recorded.
3. Anchor-extension candidates:
   - `trust-in-god` | Prov 28:25-26 | "one who trusts in the LORD will prosper. One who trusts in himself is a fool; but one who walks in wisdom is kept safe." | w=0.8.
   - `generosity` | Prov 28:27 | "One who gives to the poor has no lack; but one who closes his eyes will have many curses." | w=0.7.
   - `money-and-possessions` | Prov 28:20 | "A faithful man is rich with blessings; but one who is eager to be rich will not go unpunished." | w=0.75.
   - ROUTED to corpus-blocked roster row 17 (`courage`): Prov 28:1 — "The wicked flee when no one pursues; but the righteous are as bold as a lion." — NEW ref for the row (righteous boldness; complements the 24:10-12 routing).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 (over soft cap, within ceiling).
8. Decisions record: None.

## Proverbs 29
1. Existing tags (book doc): `parenting`, `self-control`, `pleasing-god-not-people`, `humble-exaltation`, `obedience-to-the-word`, `justice-and-oppression`, `receiving-correction` (7).
2. Applied-tag deltas: No changes — at 7; `leadership` (29:4, 29:12, 29:14) was a recorded pass-#16 skip (29:14 carried by `justice-and-oppression`; remaining refs then-unverifiable) — now verifiable but still the same-substance overlap the skip named; anchor-extensions below, no eighth tag forced.
3. Anchor-extension candidates:
   - `receiving-correction` | Prov 29:1 | "He who is often rebuked and stiffens his neck will be destroyed suddenly, with no remedy." | w=0.85 — the hinge-warning is the display tag's own cited verse but is absent from the pack.
   - `self-control` | Prov 29:11 | "A fool vents all of his anger, but a wise man brings himself under control." | w=0.85.
   - `parenting` | Prov 29:15 | "The rod of correction gives wisdom, but a child left to himself causes shame to his mother." | w=0.8; also Prov 29:17 | "Correct your son, and he will give you peace; yes, he will bring delight to your soul." | w=0.7.
   - `humble-exaltation` | Prov 29:23 | "A man's pride brings him low, but one of lowly spirit gains honor." | w=0.8.
   - `obedience-to-the-word` | Prov 29:18 | "Where there is no revelation, the people cast off restraint; but one who keeps the law is blessed." | w=0.7.
   - `leadership` | Prov 29:4 | "The king by justice makes the land stable, but he who takes bribes tears it down." | w=0.7; also Prov 29:14 | "The king who fairly judges the poor, his throne shall be established forever." | w=0.7.
   - `taming-the-tongue` | Prov 29:5 | "A man who flatters his neighbor spreads a net for his feet." | w=0.6 (flattery lexicon companion, see ch 26).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at 7 (over soft cap, within ceiling).
8. Decisions record: None.

## Proverbs 30
1. Existing tags (book doc): `contentment`, `refuge-in-trouble`, `humble-exaltation`, `slander-and-false-accusation`, `the-name-of-god`, `trustworthiness-of-scripture`.
2. Applied-tag deltas: No changes — the recorded `no-other-gospel` yield on 30:6 (same-verse duplication under `trustworthiness-of-scripture`, Decisions #18) re-verified and stands; Agur's 30:4 son-question stays signposted-only per Decisions #6's parallel note.
3. Anchor-extension candidates:
   - `refuge-in-trouble` | Prov 30:5 | "Every word of God is flawless. He is a shield to those who take refuge in him." | w=0.7 (the shield clause; the trustworthiness clause is already that pack's anchor).
   - `the-name-of-god` | Prov 30:9 | "or lest I be poor, and steal, and so dishonor the name of my God." | w=0.6 — honoring-the-name-in-conduct register; the gap log's own firm ref.
   - `slander-and-false-accusation` | Prov 30:10 | "Don't slander a servant to his master, lest he curse you, and you be held guilty." | w=0.6.
   - ROUTED to corpus-blocked roster row 20 (`right-in-their-own-eyes`): Prov 30:12 — "There is a generation that is pure in their own eyes, yet are not washed from their filthiness." — NEW ref for the row.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (6 of 8).
8. Decisions record: None.

## Proverbs 31 (subdivided: 31:1–9; 31:10–31)
1. Existing tags (book doc): `godly-marriage`, `work-and-diligence`, `generosity`, `drunkenness`, `fear-of-the-lord`, `justice-and-oppression`, `leadership` (7).
2. Applied-tag deltas: No changes — at 7; all seven re-verified (the drunkenness/leadership/justice both-tags stack on 31:4–9 is the recorded pass-#16 ruling).
3. Anchor-extension candidates:
   - `godly-marriage` | Prov 31:10-12 | "Who can find a worthy woman? For her value is far above rubies. The heart of her husband trusts in her." | w=0.85 — the pack has no Proverbs 31 anchor despite owning the "godly wife" lexicon.
   - `fear-of-the-lord` | Prov 31:30 | "Charm is deceitful, and beauty is vain; but a woman who fears the LORD, she shall be praised." | w=0.8.
   - `justice-and-oppression` | Prov 31:8-9 | "Open your mouth for the mute, in the cause of all who are left desolate. Open your mouth, judge righteously, and serve justice to the poor and needy." | w=0.85.
   - `leadership` | Prov 31:4-5 | "It is not for kings, Lemuel, it is not for kings to drink wine... lest they drink, and forget the law, and pervert the justice due to anyone who is afflicted." | w=0.75.
   - `work-and-diligence` | Prov 31:13-27 | "She seeks wool and flax, and works eagerly with her hands." (31:13) ... "She looks well to the ways of her household, and doesn't eat the bread of idleness." (31:27) | w=0.7.
   - `generosity` | Prov 31:20 | "She opens her arms to the poor; yes, she extends her hands to the needy." | w=0.65.
4. Lexicon candidates:
   - `godly-marriage` | proverbs 31 woman | queries: "proverbs 31 woman", "virtuous woman bible", "wife of noble character" — heavy lay-query family with no lexicon home in any pack (WEB reads "worthy woman", so bare lexical search misses the familiar phrasings entirely).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: book-doc subdivision (2 sections; seam at 31:10); at 7 → mark for per-verse refinement pass.
8. Decisions record: None.

---

## Book roll-up (Proverbs sweep, 2026-08-26)

- **Applied-tag deltas:** 7 ADDs (ch 4 `thought-life`; ch 11 `taming-the-tongue`; chs 12, 13, 15 `receiving-correction`; ch 16 `leadership`; ch 26 `work-and-diligence`); 0 DROPs; all 158 prior-art tags KEEP (re-verified). Book total 158 → 165. Four of the seven ADDs discharge pass-#16 skips whose recorded reason was quote-verifiability against the sanctioned sources — the staged pinned-source text (87fd68c fixture, pin `b6f55cc7…`) now supplies verification; these are skip-discharges, not decline overturns.
- **Anchor-extension candidates:** 98 candidate rows across 29 chapters (none for chs 4 and 9; a few rows carry two refs). Headline gaps: `taming-the-tongue` lacks Prov 15:1; `humble-exaltation` lacks 16:18 and 3:34; `self-control`, `work-and-diligence`, `honesty`, `forgiving-others`, `loving-others`, `friendship` (27:17), `refuge-in-trouble` (18:10), `self-deception` (14:12), `the-lords-discipline` (3:11-12) have zero Proverbs anchors today.
- **Lexicon candidates:** 10 (work-and-diligence "laziness/sluggard"; self-control anger phrasings with the slow-to-anger collision caution; pastoral-sexual-purity "adultery" with owner-decision note; taming-the-tongue "gentle answer" and "flattery"; humble-exaltation "pride goes before a fall"; refuge-in-trouble "strong tower"; friendship "iron sharpens iron"; parenting "spare the rod"; godly-marriage "proverbs 31 woman"; thought-life "guard your heart").
- **New-concept candidates:** 1 — `the-fool-and-folly` (ch 26; check lexicon-extension of `wisdom-from-god` first; harm-gate adjacency note on 26:11 recorded).
- **Decline-overturn proposals:** 0. All eight §3.2 Proverbs declines re-checked against the full WEB text and found sound (complacency 1:32; restitution 6:30-31; craftsmanship 8:30; deliverance 11:8/12:13; slow-to-anger 14:29 etc.; stewardship; sacrifice-and-atonement 16:6 curator note carried; shepherds 27:23), as were the recorded motif declines (13:12; 26:11; 27:1; 4:18).
- **Corpus-blocked routings:** 18 routed lines across rows 6 (`god-looks-at-the-heart`: NEW 15:3; confirms 16:2, 20:27, 21:2, 24:12), 14 (`gloating-over-downfall`: confirms 17:5, 24:17-18 — nothing new), 15 (`counsel-and-advisers`: NEW 19:20, 20:18, 24:6; confirms 11:14, 15:22, 12:15b), 17 (`courage`: NEW 24:10-12, 28:1), 20 (`right-in-their-own-eyes`: NEW 26:12, 26:16, 30:12; confirms 12:15, 21:2), 23 (`redeemer`: cautious 23:11 color note). Nothing proposed as a pack for any of the 50 ids.
- **Ceiling / refinement flags:** ch 20 at HARD CEILING 8 with a blocked `leadership` candidate (the book's one candidate-yield, recorded in its §8) → per-verse refinement. Subdivided chapters flagged: 1, 3, 6, 9, 22, 24, 31. Chapters at 7 after the sweep: 3, 11, 15, 16, 21, 23, 24, 28, 29, 31.
- **Vocabulary note:** the canonical `tag-apply/adopted-concepts.md` (161 ids, alphabetized, created 2026-08-26) was cross-checked against the sweep kit's regenerated §11.1 list — no id-level discrepancies; the canonical file was used as the reference.

### §9 survival audit (this block's write)
Ledger created 2026-08-26 as `/mnt/project-files/research/bible-rollout/sweep/proverbs-sweep-ledger.md` (file did not exist before this write; naming harmonized with the Torah thread's `<book>-sweep-ledger.md` pattern per coordinator assignment). Written as a single atomic end-of-file block. Post-write verification: [recorded after append — see below].

**Post-write verification (CONVENTIONS §9), 2026-08-26:** the ledger was created by this thread as one atomic end-of-file block; immediately after the write the file was re-read and compared byte-for-byte against the scratchpad draft — identical (sha256 `c66522d6…` both sides, 490 lines), block present exactly once, no pre-existing bytes to preserve (file did not exist before this write). This audit stanza is a second, final atomic append; no earlier bytes were modified. Final-delivery survival audit: all 31 `## Proverbs N` entries and the book roll-up verified present in the live file at delivery.
