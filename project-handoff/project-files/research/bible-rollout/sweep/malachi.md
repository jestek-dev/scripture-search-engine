# Sweep ledger — Malachi

- **Book:** Malachi
- **Sweep date:** 2026-08-26
- **Repo SHA (origin/main):** e762d1c629f5b121a2aacc6da57cca6bacc3215e
- **Concept census:** 239 (ontology/concepts/ @ SHA above)
- **WEB text source:** pipeline/fixtures/web-subset.json @ 87fd68c (full-Bible expansion; pinned WEB sourceSha256 b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c, identical to main's committed fixture snapshot);
  fixture-witnessed-on-main chapters for this book: Malachi 2 and Malachi 3 (main-witnessed — engine candidates on them are assertable NOW); Malachi 1 and Malachi 4 are expansion-only (87fd68c) — their engine candidates are corpus-blocked until PR-beta merges
- **Inputs read:** BRIEF.md; malachi.md book doc; concept-index.md + packs/;
  declines.md (tag-gaps-review §3 + §1); backlog-roster.md (engine-pack-backlog);
  tag-apply/adopted-concepts.md (canonical §11.1 list, 161 ids with engine-built markers — the engine-built=no subset was checked per chapter; none is honestly present in Malachi, so every applied tag below is also an engine id in the 239 census)

## Malachi 1

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `gods-love` | "I have loved you," says the LORD | 1:2 | The book's opening dispute is the LORD's love itself, argued from "Yet I loved Jacob" (1:2); prior art upheld |
| keep | `worship` | "If I am a father, then where is my honor?" | 1:6 | The honor due God in worship — the positive register the chapter argues from, with the promised "a pure offering" (1:11); prior art upheld, kept beside the new `empty-worship` under the both-tags ruling |
| keep | `fear-of-the-lord` | "for I am a great King" | 1:14 | Reverence withheld is the charge, pressed by the LORD's own standing — "my name is awesome among the nations" (1:14); prior art upheld |
| add | `empty-worship` | "Oh that there were one among you who would shut the doors, that you might not kindle fire on my altar in vain! I have no pleasure in you" | 1:10 | Worship kept up and hollowed out is the chapter's indictment — defective offerings (1:8, 13), "The LORD’s table is contemptible" (1:7), "what a weariness it is!" (1:13); the exact-register id (rollout batch 1) did not exist in the book doc's 131-id vocabulary, whose own measurement note records the worship pack out-ranking 'empty worship' queries before this pack existed |
| add | `the-name-of-god` | "For from the rising of the sun even to its going down, my name is great among the nations" | 1:11 | The name honored/despised is the chapter's own vocabulary — "you priests who despise my name" (1:6), "my name is great among the nations" twice (1:11), "my name is awesome among the nations" (1:14); exact-register id (rollout batch 2), unavailable at book-doc time |

Net: 3 tags → 5 tags. No drops.

### (b) Anchor-extension candidates
- `empty-worship` — Malachi 1:6-14 — "When you offer the blind for sacrifice, isn’t that evil? And when you offer the lame and sick, isn’t that evil? Present it now to your governor! Will he be pleased with you?" (1:8) — proposed weight 0.85 — the prophets' cost-nothing-worship indictment; the pack anchors Isa 1, Amos 5, Isa 29 riders but has no Malachi witness. CORPUS-BLOCKED rider (Mal 1 expansion-only).
- `the-name-of-god` — Malachi 1:11 — "For from the rising of the sun even to its going down, my name is great among the nations, and in every place incense will be offered to my name, and a pure offering; for my name is great among the nations" — proposed weight 0.80 — the name's greatness among the nations, a register (name honored beyond Israel) none of the pack's Exodus/Leviticus anchors carries. CORPUS-BLOCKED rider.
- `gods-love` — Malachi 1:2-3 — "I have loved you," says the LORD. Yet you say, "How have you loved us?" "Wasn’t Esau Jacob’s brother?" says the LORD, "Yet I loved Jacob" — proposed weight 0.65 — God's love asserted against his people's doubt of it, a dispute register the pack lacks. CORPUS-BLOCKED rider. SPAN NOTE: deliberate dual with the election candidate below — two honest registers of one text (love argued / choice made); record in both files if both are taken.
- `election-and-predestination` — Malachi 1:2-3 — "Yet I loved Jacob; but Esau I hated" (1:2-3) — proposed weight 0.70 — the OT source text of Rom 9:13 (which is itself deliberately not yet anchored: the pack's header defers Rom 9:6-24 until the whole argument is assertable); the pack is §4-NEUTRAL and this claim must stay routing-only, adjudicating nothing. CORPUS-BLOCKED rider; flag for the curator alongside the pack's standing Jesse-review flag (backlog "Items flagged" #2).
- `priesthood` — Malachi 2:5-7 (logged here for visibility, detailed under Malachi 2 (b)).

### (c) Lexicon candidates
- honest-and-empty — none proposed. Considered and skipped, with grounds: "my name will be great among the nations" (NIV-remembered form of 1:11) — post-expansion the tokens {name, great, among, nations} retrieve 1:11 lexically; "I have loved you says the lord" — same exact-phrase-retrievable situation at 1:2. Per the alias-mining rule, no row for a query that will already land; ordering gaps, if any, must be measured at curation.

### (d) New-concept candidates
- honest-and-empty — none. Checked: polluted-offerings material → `empty-worship` (add above); honor-of-the-name → `the-name-of-god` (add above); Jacob/Esau choice → `election-and-predestination` anchor candidate (b); no residual theme without a home. Backlog row 1 (sacrifice-and-atonement) checked: Mal 1's defective offerings are the rejected-worship register, not the atonement ritual system — no route.

### (e) Decline-overturn proposals
- honest-and-empty — none. Malachi's recorded declines (declines.md §3.5: `lament`, `false-prophets`, `fasting`) touch chapters 2–3 or the whole book; nothing in chapter 1 supplies new evidence against any of them.

### (f) Decisions record
1. No yields — 5 tags, under the soft cap.
2. `worship` kept beside `empty-worship` (both-tags ruling, §11.2): the chapter both argues from worship's true honor (1:6, 1:11's pure offering) and indicts its hollow practice; each clears the bar independently. The empty-worship pack's tokenizer note (bare "worship" never fires it) keeps the two display registers distinct.
3. `oaths-and-vows` considered for 1:14 ("the deceiver is cursed who has in his flock a male, and vows and sacrifices to the Lord a defective thing") and NOT added: thin single-verse — vow-breaking is instanced, not taught.
4. `nations-and-peoples` considered for 1:11/1:14 and NOT added: the register is the name's greatness, carried by `the-name-of-god`; the pack's origin-of-nations/all-nations-mission registers are not depicted.
5. `divine-judgment` NOT re-opened for 1:3-4 (Edom): book-doc Decisions #10 (the Edom oracle serves the love argument; judgment reserved for chs 3–4) stands.
6. `mercy` considered for 1:9 ("entreat the favor of God, that he may be gracious to us") and NOT added: an ironic challenge inside the indictment, not mercy teaching.
7. §11.1 adopted-list check (canonical tag-apply/adopted-concepts.md): no engine-built=no adopted id is honestly present in this chapter (the chapter's registers — love disputed, worship hollowed, name despised — all have engine-built homes applied above).

### (g) Ceiling flag
- no ceiling hit (5 tags); **subdivided in book doc** (sections: 1:1–5; 1:6–14) → eligible for the per-verse refinement pass.

## Malachi 2

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `covenant` | "My covenant was with him of life and peace" | 2:5 | The chapter turns on covenants kept and profaned — Levi's (2:4-5, 8), the fathers' (2:10), marriage as covenant, "the wife of your covenant" (2:14); prior art upheld |
| keep | `pastoral-marriage-divorce-teaching` | "One who hates and divorces", says the LORD, the God of Israel, "covers his garment with violence!" | 2:16 | Direct divorce teaching in the prophet's own voice (2:14-16); the pack's own anchor set names Mal 2:13-16; pastoral-* register ruling upheld for this chapter per book-doc Decisions #4 (teaching register genuinely matches) |
| keep | `fear-of-the-lord` | "he was reverent toward me, and stood in awe of my name" | 2:5 | Levi's covenant sets the reverence standard the priests abandoned; prior art upheld |
| add | `priesthood` | "For the priest’s lips should keep knowledge, and they should seek the law at his mouth; for he is the messenger of the LORD of Armies" | 2:7 | Nine verses on the priestly office — its charge ("this commandment is for you," 2:1), its covenant standard (2:4-7), its corruption (2:8-9): the OT-institution register of the `priesthood` pack (rollout batch 1), unavailable in the book doc's 131-id vocabulary |

Net: 3 tags → 4 tags. No drops.

### (b) Anchor-extension candidates
- `priesthood` — Malachi 2:5-7 — "For the priest’s lips should keep knowledge, and they should seek the law at his mouth; for he is the messenger of the LORD of Armies" (2:7) — proposed weight 0.80 — the OT institution's teaching-office charge stated as doctrine; the pack's only OT-institution anchors are Deut 33:8-11 and the Exod 28:1 rider. **MAIN-WITNESSED (Malachi 2 is in main's committed fixture corpus — assertable now, no PR-beta dependency.)** Span-disjoint from `pastoral-marriage-divorce-teaching`'s Mal 2:13-16 anchor.

### (c) Lexicon candidates
- `priesthood` — phrase: "the priest's lips should keep knowledge" — realistic query phrasings: "the priests lips should keep knowledge"; "what does malachi say about priests"; "duties of a priest in the bible" — the pack's lexicon has no OT-teaching-office phrasing; the proposed anchor above is the landing text and is main-witnessed. CAVEAT: the exact WEB phrase is lexically retrievable from 2:7 today; the row's value is the paraphrase queries — requires a measured miss at curation.

### (d) New-concept candidates
- honest-and-empty — none. Checked: marriage-treachery → existing `pastoral-marriage-divorce-teaching` + `covenant`; corrupt-clergy → `priesthood` (add above) + the declines' recorded ruling that Malachi indicts corrupt priests, not false prophets; no theme lacks a home; no backlog row matches.

### (e) Decline-overturn proposals
- honest-and-empty — none. Two Malachi declines touch this chapter and both stand on re-read: `lament` (2:13's weeping is rejected weeping over unaccepted offerings — the text itself gives the reason, "because he doesn’t regard the offering any more", 2:13 — not the lament practice); `false-prophets` ("Malachi indicts corrupt priests, not false prophets" — confirmed: the indicted are "you priests", 2:1).

### (f) Decisions record
1. No yields — 4 tags, under the soft cap.
2. `godly-marriage` NOT re-opened: book-doc Decisions #5 (indictment register; positive substance already carried by the divorce-teaching id anchored on this very passage) stands.
3. `pastoral-betrayal-and-marriage-crisis` NOT re-opened: book-doc Decisions #6 (the chapter addresses the betrayer, not the betrayed) stands.
4. `idolatry` NOT re-opened for 2:11 ("has married the daughter of a foreign god"): the application-pass skip (tag-gaps row marks Mal 2:11 LOW-CONFIDENCE — alliance-by-intermarriage, not depicted idol-worship) stands; no new evidence.
5. `justice-and-oppression` NOT re-opened for 2:17 (single verse, the people's cynical question): application-pass skip stands; the verse's substance feeds chapter 3's answer and is carried there.
6. `favoritism` considered for 2:9 ("have had respect for persons in the law") and NOT added: thin single-clause instance of priestly partiality, below the presence bar.
7. `covenant` anchor extension for 2:4-5 (covenant with Levi) considered and NOT proposed: the engine value of the span is carried by the `priesthood` candidate (b); a second claim on the same verses would be span overlap without a distinct query register ("covenant with levi" searchers are served by the priesthood landing).
8. `honesty` / `taming-the-tongue` considered for 2:6 ("The law of truth was in his mouth") and NOT added: descriptive of Levi's faithfulness, not the packs' teaching registers.
9. §11.1 adopted-list check (canonical tag-apply/adopted-concepts.md): `spiritual-adultery` (adopted, engine-built: no; ALSO backlog roster row 2) considered for 2:11 ("has married the daughter of a foreign god") — NOT added and NOT routed: the verse depicts literal intermarriage as covenant profanation, not the Hosea/Ezekiel harlotry metaphor that id and roster row name; no match, no new evidence for the row. No other engine-built=no adopted id is honestly present.

### (g) Ceiling flag
- no ceiling hit (4 tags); **subdivided in book doc** (sections: 2:1–9; 2:10–17) → eligible for the per-verse refinement pass.

## Malachi 3

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `tithing` | "Bring the whole tithe into the storehouse, that there may be food in my house" | 3:10 | The pack's own source text (tithing.yaml anchors 3:10 at 1.0, 3:8 at 0.85); covenant-historical guardrail framing per book-doc Decisions #2 upheld |
| keep | `divine-judgment` | "I will come near to you to judgment. I will be a swift witness" | 3:5 | The day of his coming as judgment (3:2, 3:5); prior art upheld |
| keep | `repentance` | "Return to me, and I will return to you" | 3:7 | The LORD's open return-call, answered concretely (3:7-10); prior art upheld |
| keep | `gods-faithfulness` | "For I, the LORD, don’t change; therefore you, sons of Jacob, are not consumed" | 3:6 | Unbroken commitment despite generations of turning away (3:6-7); prior art upheld beside `gods-unchanging-nature` under the both-tags ruling |
| keep | `gods-unchanging-nature` | "For I, the LORD, don’t change" | 3:6 | The immutability attribute itself — the verse the pack was minted from (gods-unchanging-nature.yaml anchors 3:6); prior art upheld |
| keep | `fear-of-the-lord` | "Then those who feared the LORD spoke one with another; and the LORD listened and heard" | 3:16 | The community the closing dispute vindicates (3:16-18); pack anchors Mal 3:16; prior art upheld |
| keep | `justice-and-oppression` | "against those who oppress the hireling in his wages, the widow, and the fatherless" | 3:5 | The swift-witness list is a catalog of oppression condemned; prior art upheld |
| add | `prosperity-of-the-wicked` | "Now we call the proud happy; yes, those who work wickedness are built up; yes, they tempt God, and escape." | 3:15 | The closing dispute (3:13-18) is the grievance itself — "It is vain to serve God" (3:14) — answered by the restored distinction, "between the righteous and the wicked" (3:18); the exact-register id (apologetics wave, batch 4) did not exist in the book doc's 131-id vocabulary |

Net: 7 tags → 8 tags (hard ceiling). No drops.

### (b) Anchor-extension candidates
All four candidates below are **MAIN-WITNESSED** (Malachi 3 is in main's committed fixture corpus — assertable now, no PR-beta dependency):
- `prosperity-of-the-wicked` — Malachi 3:14-15 — "You have said, ‘It is vain to serve God,’ and ‘What profit is it that we have followed his instructions... Now we call the proud happy; yes, those who work wickedness are built up; yes, they tempt God, and escape.’" — proposed weight 0.80 — the grievance in the prophets' own community, with the canon's answer-by-vindication (3:16-18) adjacent; complements the pack's Ps 73 spine.
- `justice-and-oppression` — Malachi 3:5 — "I will be a swift witness against the sorcerers, against the adulterers, against the perjurers, and against those who oppress the hireling in his wages, the widow, and the fatherless, and who deprive the foreigner of justice" — proposed weight 0.85 — withheld-wages/widow/orphan/foreigner catalog, the pack's exact civic-economic register; the pack currently has no Malachi anchor despite the book doc's pinned-fixture-verified tag on this verse.
- `repentance` — Malachi 3:7 — "Return to me, and I will return to you," says the LORD of Armies — proposed weight 0.75 — the pack's lexicon carries "return to the lord" but its anchors are NT-weighted (Acts, 1 John, 2 Cor); this is the OT return-call in its most-quoted mutual form (the Zechariah-block routing "return to me" → `repentance` in declines.md §3.5 lands here too, and Zech 1:3 is corpus-blocked while Mal 3:7 is not).
- `messianic-prophecy` — Malachi 3:1 — "Behold, I send my messenger, and he will prepare the way before me! The Lord, whom you seek, will suddenly come to his temple." — proposed weight 0.80 — fits the pack's LOCATOR DESIGN exactly (a passage the NT itself cites of Christ, attributed fact: Matt 11:10, Mark 1:2, Luke 7:27 quote it). CAVEATS, both binding on the curator: (i) this is an engine-layer locator candidate ONLY — the display tag is NOT applied, per the book doc's Decisions #9 and the sweep brief's rule that Mal 3:1/4:5 John-the-Baptist connections are prose signposts, never tag rationales; (ii) DELIBERATE DUAL if taken: `day-of-the-lord` already anchors Malachi 3:1-2 (0.9, in corpus) for the day-as-refining register — record in both files.

### (c) Lexicon candidates
- honest-and-empty — none proposed. Considered and skipped, with grounds: "will a man rob god" / "robbing god" (3:8) and "windows of heaven" / "test me in this" (3:10) are exact-phrase or full-token retrievable from the main corpus TODAY (Mal 3 is witnessed) — per the alias-mining rule, no row for a query that already lands; "refiner's fire" is already served by `testing`'s in-corpus Mal 3:2-3 anchor and its "the refiners fire" lexicon entry.

### (d) New-concept candidates
- Book-of-remembrance motif (NOT a mint proposal — a motif-candidate note joining a recorded sibling): "a book of memory was written before him for those who feared the LORD" (3:16). The Daniel block (declines.md §3.5) left "book of life" (Dan 7:10; 12:1) "as a motif candidate, not a gap row; Rev 20:12 and Ps 69:28 would join if a future thread judges it concept-worthy." Mal 3:16 belongs to that same future decision. Realistic query phrasings if ever minted: "book of remembrance in the bible"; "does god keep a record of our deeds"; "book of life in the bible". Checked: no existing id (`fear-of-the-lord` carries the verse's tag substance; `heavenly-reward` is a different register) and no backlog roster row covers it. Deliberately NOT logged as a tag-gaps row — the Daniel disposition (motif, not gap) governs; this note simply adds Malachi's ref to that motif's eventual file.

### (e) Decline-overturn proposals
- honest-and-empty — none. `fasting` ("never appears in the book") re-confirmed — 3:14's "walked mournfully" is not fasting language; no new evidence against any recorded decline.

### (f) Decisions record
1. **Yield at the ceiling:** with `prosperity-of-the-wicked` added the chapter stands at exactly 8. Two further candidates cleared consideration and were NOT added, each with its §11.6 class:
   - `testing` (3:2-3, "he is like a refiner’s fire... and he will sit as a refiner and purifier of silver") — yielded as theme-witness-with-caveat: the refining here is the coming Lord's purification of Levi within the judgment oracle, a register shift from the pack's God-tests-his-people teaching; the engine side needs nothing — testing.yaml already anchors Mal 3:2-3 (in corpus, Torrey "In purifying us"), so a display tag would add no routing the pack doesn't have, and the quoted verses are already carried under `divine-judgment` (3:2).
   - `day-of-the-lord` (3:2 "the day of his coming"; 3:17 "in the day that I make") — the application-pass skip (book-doc Decisions #14-equivalent, recorded in its item 14: theme witness, phrase absent, 3:2 already quoted under `divine-judgment`) is a recorded decision and STANDS; noted honestly: day-of-the-lord.yaml itself anchors Mal 3:1-2 in corpus, so the engine already routes phrase queries here — which is exactly why the display tag adds nothing. Class: theme-witness-with-caveat (and duplicative of `divine-judgment`'s quoted span).
   Order note: both yields precede any thin-single-verse or broad-duplicating drops; no existing tag was dropped.
2. `blessing` considered for 3:10-12 ("pour you out a blessing... All nations shall call you blessed") and NOT added: the blessing here is the tithe-passage's own promise, fully carried by `tithing` with its guardrail framing; adding `blessing` would be broad-duplicating-specific and hand the canonical prosperity proof-text a second, less-guarded label (book-doc Decisions #2's concern).
3. `mercy` / `slow-to-anger` considered for 3:6, 3:17 ("I will spare them, as a man spares his own son") and NOT added: sparing is instanced inside the vindication oracle, not the packs' teaching registers.
4. `remnant` NOT re-opened for 3:16-18: the application-pass skip stands, and remnant.yaml's own header carries the Malachi caveat ("Mal 3:16-18 is a theme witness, not a phrase witness") on its deferred-anchor note — the pack decision is already recorded engine-side; nothing to add.
5. Backlog-roster check: no chapter-3 candidate matches a roster row (row 5 end-times checked — its refs are Daniel/2 Tim; Malachi's day material lives in the admitted `day-of-the-lord` pack).
6. §11.1 adopted-list check (canonical tag-apply/adopted-concepts.md): no engine-built=no adopted id is honestly present in this chapter.

### (g) Ceiling flag
- **HIT HARD CEILING 8** (after the `prosperity-of-the-wicked` add, every tag independently clearing the bar) AND **subdivided in book doc** (sections: 3:1–5; 3:6–12; 3:13–18) → mark for the per-verse refinement pass.

## Malachi 4

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "For behold, the day comes, burning like a furnace, when all the proud and all who work wickedness will be stubble." | 4:1 | The day itself as judgment, "neither root nor branch" (4:1), ashes underfoot (4:3); prior art upheld |
| keep | `family-reconciliation` | "He will turn the hearts of the fathers to the children and the hearts of the children to their fathers" | 4:6 | The canon's closing promise; the pack's own anchor is Mal 4:5-6 (0.7); prior art upheld per book-doc Decisions #8's reviewer restoration |
| keep | `day-of-the-lord` | "before the great and terrible day of the LORD comes" | 4:5 | The phrase's Malachi home; day-of-the-lord.yaml anchors Mal 4:1-5 as a rider; prior art upheld |
| keep | `fear-of-the-lord` | "But to you who fear my name shall the sun of righteousness arise with healing in its wings." | 4:2 | The day divides on exactly this (4:1-3); prior art upheld |

honest-and-empty at the delta level beyond keeps: no new engine id is genuinely present in this six-verse chapter; existing book-doc tags reviewed and kept.

### (b) Anchor-extension candidates
- honest-and-empty — none. Verified: `day-of-the-lord` already anchors Mal 4:1-5 (0.85 rider) and `family-reconciliation` already anchors Mal 4:5-6 (0.7 rider) — the chapter's two engine-worthy spans are claimed; `messianic-prophecy` on 4:5-6 (Elijah, cited Matt 11:14; 17:10-13) was considered and NOT proposed — the sweep brief's prose-signpost rule covers 4:5 explicitly, and unlike 3:1 the span is already engine-reachable through two rider anchors; left to the curator's Mal 3:1 decision (see Malachi 3 (b)) rather than multiplied. (Mal 4 is expansion-only; any future candidate here is corpus-blocked.)

### (c) Lexicon candidates
- honest-and-empty — none proposed. Considered and skipped, with grounds: "sun of righteousness" / "healing in his wings" (NIV-remembered form of 4:2's "healing in its wings") — the landing verse is corpus-blocked (Mal 4 expansion-only) and post-expansion the tokens {sun, righteousness} / {healing, wings} retrieve 4:2 lexically; also a register hazard — routing these comfort queries to `pastoral-prayer-for-healing` would recreate the exact mismatch book-doc Decisions #3 declined (eschatological vindication imagery, not prayer-for-the-sick teaching). "Elijah must come first" queries land on 4:5 lexically post-expansion (token {elijah} is rare).

### (d) New-concept candidates
- honest-and-empty — none. Checked: the day material → `day-of-the-lord` (admitted); the Elijah-forerunner material is barred from tag rationales (prose signpost) and engine-served via the day-of-the-lord rider; "remember the law of Moses" (4:4) → book-doc Decisions #8's recorded drop of `obedience-to-the-word` stands (single closing verse, register mismatch); no backlog row matches (row 5 end-times re-checked: no route — see Malachi 3 (f) 5).

### (e) Decline-overturn proposals
- honest-and-empty — none. No recorded decline touches this chapter with new evidence available; the pastoral-prayer-for-healing withholding on 4:2 (book-doc Decisions #3, a decline-class record) was re-examined and upheld — see (c).

### (f) Decisions record
1. No yields — 4 tags, under the soft cap.
2. `humble-exaltation` considered for 4:1 ("all the proud... will be stubble") and NOT added: the proud appear as judgment objects inside the day oracle; the pack's pride/humility teaching register is not depicted (thin, duplicative of `divine-judgment`).
3. `parenting` considered for 4:6 and NOT added: turned hearts of fathers and children is reconciliation substance (carried by `family-reconciliation`, whose pack anchors the verse), not child-raising teaching.
4. `second-coming` NOT added to 4:5 — later-revelation read-back on an OT text, per the day-of-the-lord pack's own rationale note and book-doc Decisions #9.
5. `obedience-to-the-word` NOT re-opened for 4:4: book-doc Decisions #8's tested-and-dropped record stands; no new evidence.
6. §11.1 adopted-list check (canonical tag-apply/adopted-concepts.md): `end-times` (adopted, engine-built: no; backlog roster row 5) considered for the coming-day material and NOT added — the chapter's substance is the day-of-the-LORD phrase family, carried by the engine-built `day-of-the-lord` (whose merge-or-two-ids question with end-times is Jesse's open call; nothing prejudged here). No other engine-built=no adopted id is honestly present.

### (g) Ceiling flag
- no ceiling hit (4 tags); **not subdivided in book doc** (single BSB heading, one continuous theme) → no per-verse refinement flag.

---
*Ledger complete: Malachi 1–4 swept 2026-08-26 against the 239-id library, declines.md, and backlog-roster.md. All quotes word-for-word WEB from the 87fd68c expansion fixture (glyphs preserved; Mal 2–3 additionally main-witnessed, byte-identical per prep verification). No engine changes, no repo writes; display-layer and research output only.*
