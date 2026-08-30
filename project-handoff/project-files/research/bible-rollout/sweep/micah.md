# Sweep ledger — Micah

- **Book:** Micah
- **Sweep date:** 2026-08-26
- **Repo SHA (origin/main):** e762d1c629f5b121a2aacc6da57cca6bacc3215e
- **Concept census:** 239 (ontology/concepts/ @ SHA above)
- **WEB text source:** pipeline/fixtures/web-subset.json @ 87fd68c (full-Bible expansion;
  pinned sourceSha256 b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c —
  identical to main's committed fixture snapshot); fixture-witnessed-on-main chapters
  for this book: Micah 6–7 (all other chapters, Micah 1–5, are expansion-only:
  engine candidates on them are corpus-blocked and ride PR-beta)
- **Inputs read:** BRIEF.md; micah.md book doc; concept-index.md + packs/;
  declines.md (tag-gaps-review §3 + §1); backlog-roster.md (engine-pack-backlog);
  tag-apply/adopted-concepts.md (canonical §11.1 list, 161 ids, per coordinator
  update 2026-08-26 — every id in this ledger checked against it and the 239
  engine census)
- **Prior rulings honored:** `justice-and-oppression` is Micah's minted id and the
  unified justice row (book doc Decisions #13); Matthew 2's use of Micah 5:2 is a
  prose signpost, never a tag rationale (book doc Decisions #2 + reviewer pass —
  no later-revelation read-backs); pastoral-* ids declined throughout for this
  book's national-scale material (book doc Decisions #9).

## Micah 1

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "For behold, the LORD comes out of his place, and will come down and tread on the high places of the earth." | 1:3 | Prior art; the judgment theophany and the sentence on Samaria (1:3–7) |
| keep | `sin` | "All this is for the disobedience of Jacob, and for the sins of the house of Israel." | 1:5 | Prior art; the stated cause of the judgment (1:5, 13) |
| keep | `idolatry` | "All her idols will be beaten to pieces, all her temple gifts will be burned with fire, and I will destroy all her images" | 1:7 | Prior art; Samaria's sentence falls on her images (1:6–7) |
| add | `lament` | "For this I will lament and wail. I will go stripped and naked. I will howl like the jackals and mourn like the ostriches." | 1:8 | The prophet practicing the composed dirge form over 1:8–16 (town-by-town dirge, mourning rites at 1:16) — the practice-of-the-form register lament.yaml itself anchors (Jer 10:19-20, "the prophet practicing the form"), not the declined personal-grief register |

### (b) Anchor-extension candidates
- `lament` — Micah 1:8 — "For this I will lament and wail. I will go stripped and naked. I will howl like the jackals and mourn like the ostriches." — proposed weight 0.60 — the prophetic dirge-over-ruin register, sibling of the pack's Jer 10:19-20 anchor (0.7); Micah 1 corpus-blocked, rides PR-beta.

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- honest-and-empty — none. Captivity note 1:16 ("for they have gone into captivity") checked against the vocabulary and roster: ROUTED as supplementary evidence to backlog row 45 (`exile-and-captivity`) — see Micah 4 (d), where the main match is logged.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `lament` add is NOT a decline overturn: the §1(c) grief-decline pattern (1 Sam / 2 Sam / 1 Chr) declines *personal-grief scenes*; Micah 1:8–16 is a composed prophetic dirge — the register the lament pack's own header keeps (its 2 Sam 1:17-27 composed-lament anchor and Jer 10:19-20 prophet-practicing-the-form anchor are the precedents). The Esther-decline ground (mourning "addressed to no one the text names") was weighed: like Jer 10:19-20 (anchored), the dirge is the prophet's practiced form over the ruin of his people, and 1:8's own verb is "lament"; recorded as a delegated judgment call, reversible.
- No yields: chapter lands at 4 tags, under the soft cap.

### (g) Ceiling flag
- no (did not hit 8; not subdivided in book doc — chapter kept whole per book doc Decisions #1)

## Micah 2

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `sin` | "Woe to those who devise iniquity and work evil on their beds!" | 2:1 | Prior art; sin planned deliberately and carried out with power (2:1–2, 8–9) |
| keep | `divine-judgment` | "Behold, I am planning against these people a disaster, from which you will not remove your necks" | 2:3 | Prior art; the measured recompense (2:3–5, 10) |
| keep | `justice-and-oppression` | "They covet fields and seize them, and houses, then take them away. They oppress a man and his house, even a man and his heritage." | 2:2 | Prior art; the land-grab indictment, this book's minted row (2:1–2, 8–9) |
| keep | `false-prophets` | "“Don’t prophesy!”—they prophesy—" | 2:6 | Prior art; the demand to silence prophecy and the liar-prophet profile (2:6–11) |
| keep | `remnant` | "I will surely assemble all of you, Jacob. I will surely gather the remnant of Israel." | 2:12 | Prior art; the abrupt hope-turn (2:12–13); remnant.yaml anchors Micah 2:12 |
| add | `covetousness` | "They covet fields and seize them, and houses, then take them away." | 2:2 | The covet-then-seize indictment (2:1–2, reinforced 2:8–9) — covetousness.yaml's own header already names Mic 2:1-2 as a corpus-blocked rider, so the vocabulary itself treats the passage as in-scope; both-tags ruling alongside `justice-and-oppression` (each clears the bar on its own register: the desire vs the civic crime) |

### (b) Anchor-extension candidates
- `covetousness` — Micah 2:1-2 — "They covet fields and seize them, and houses, then take them away." — NO NEW CANDIDATE NEEDED: covetousness.yaml's CORPUS header already records "Mic 2:1-2 and Deut 5:21 are corpus-blocked riders" — the extension is pre-logged in the pack itself and rides PR-beta. Recorded here so the curator sees the sweep confirmed it against the text.

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- honest-and-empty — none. The Breaker figure (2:13, "He who breaks open the way goes up before them") checked: no existing id fits, and it is not a plausible lay search register at pack scale; not proposed.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- Chapter lands at 6 tags — at the soft cap, no yields. `covetousness` admitted because the pack's own rider note pre-recognizes Mic 2:1-2; main themes remain first (existing order untouched).
- `shepherds-and-the-flock` considered for 2:12-13's flock imagery and declined (thin: imagery inside the remnant-gathering promise; `remnant` carries the substance and its pack already anchors 2:12 — a second tag would be broad-duplicating-specific).

### (g) Ceiling flag
- subdivided in book doc (sections: 2:1–5 Woe to Oppressors; 2:6–11 Reproof of False Prophets; 2:12–13 The Remnant of Israel) — flag for per-verse refinement pass

## Micah 3

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "Therefore Zion for your sake will be plowed like a field, and Jerusalem will become heaps of rubble" | 3:12 | Prior art; the sentence on the city built with blood (3:4, 6–7, 12) |
| keep | `self-deception` | "Isn’t the LORD among us? No disaster will come on us." | 3:11 | Prior art; false religious security exposed in the act of being condemned (3:9–11) |
| keep | `justice-and-oppression` | "Her leaders judge for bribes, and her priests teach for a price, and her prophets tell fortunes for money" | 3:11 | Prior art; the corrupt-leaders register at full strength (3:1–3, 9–11) |
| keep | `false-prophets` | "they proclaim, “Peace!” and whoever doesn’t provide for their mouths, they prepare war against him" | 3:5 | Prior art; the prophet-for-hire profile answered with night and no vision (3:5–7, 11) |

### (b) Anchor-extension candidates
- `justice-and-oppression` — Micah 3:9-11 — "who abhor justice, and pervert all equity" … "Her leaders judge for bribes, and her priests teach for a price, and her prophets tell fortunes for money" — proposed weight 0.80 — the lexicon's own "corrupt leaders" register in its densest prophetic statement; the pack's only Micah anchor is 6:10-12 (economic register), this is the corrupt-courts register. Corpus-blocked, rides PR-beta.
- `false-prophets` — Micah 3:5-7 — "concerning the prophets who lead my people astray—for those who feed their teeth, they proclaim, “Peace!”" — proposed weight 0.75 — the pack's OT anchors are Deuteronomy tests only; this is the classic prophet-for-hire profile with its sentence (no vision, no answer). Corpus-blocked, rides PR-beta.
- `unanswered-prayer` — Micah 3:4 — "Then they will cry to the LORD, but he will not answer them. Yes, he will hide his face from them at that time, because they made their deeds evil." — proposed weight 0.55 — the turned-away-ear judgment register, sibling of the pack's Prov 21:13 anchor (0.6: the shut-ear's own cause named); gist care per that pack's header (routes what Scripture says about unanswered seasons, never teaches that God does not hear). Corpus-blocked, rides PR-beta.

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- honest-and-empty — none. Micah 3:8 ("But as for me, I am full of power by the LORD’s Spirit, and of judgment, and of might") ROUTED: matches backlog row 13 (`empowered-by-the-spirit`); new evidence: "I am full of power by the LORD’s Spirit" (3:8) — a prophet-empowerment witness outside the Judges refrain the row is built on, for the row's curator at PR-beta.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `unanswered-prayer` DISPLAY TAG considered and declined (thin single-verse class: 3:4 within a judgment oracle; the searcher's register is served at anchor level, proposed in (b), not chapter level).
- `occult-and-divination` considered for 3:6-7, 11 (diviners, fortune-telling prophets) and declined: the chapter's substance is prophet corruption, carried by `false-prophets`; the divination vocabulary is descriptive of the same figures (broad-duplicating-specific).
- `leadership` considered for 3:1-3, 9-11 and declined: that pack is the positive/qualifications register; the failure material is `justice-and-oppression`'s own lexicon territory ("corrupt leaders").
- No yields: chapter stays at 4 tags.

### (g) Ceiling flag
- no (did not hit 8; not subdivided in book doc — no internal BSB heading, kept whole per book doc Decisions #1)

## Micah 4

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `nations-and-peoples` | "Many nations will go and say, “Come! Let’s go up to the mountain of the LORD, and to the house of the God of Jacob; and he will teach us of his ways, and we will walk in his paths.”" | 4:2 | Prior art; the nations' pilgrimage to be taught (4:1–3, 5) |
| keep | `divine-judgment` | "he has gathered them like the sheaves to the threshing floor" | 4:12 | Prior art; the assembled nations gathered for judgment (4:11–13) |
| keep | `peace-among-nations` | "They will beat their swords into plowshares, and their spears into pruning hooks. Nation will not lift up sword against nation, neither will they learn war any more." | 4:3 | Prior art (adopted §11.1 display id, minted from this book; adopted-concepts.md marks it engine-built: NO — valid display tag, no pack in ontology/concepts/); engine-side this chapter IS backlog row 29's defining text — routed, see (d) |
| keep | `remnant` | "I will make that which was lame a remnant, and that which was cast far off a strong nation" | 4:7 | Prior art; outcasts remade into the hope-bearing people (4:6–8) |
| add | `zion-city-of-god` | "For the law will go out of Zion, and the LORD’s word from Jerusalem" | 4:2 | Zion is the chapter's subject throughout — exalted (4:1–2), reigned over ("the LORD will reign over them on Mount Zion", 4:7), addressed ("tower of the flock, the hill of the daughter of Zion", 4:8), in labor (4:10), assailed and vindicated (4:11, 13); the id had no Micah application anywhere and the presence is chapter-wide |
| add | `restoration-of-israel` | "“In that day,” says the LORD, “I will assemble that which is lame, and I will gather that which is driven away, and that which I have afflicted" | 4:6 | The regathering register verbatim (pack lexicon: "god will gather israel"), plus return-from-Babylon redemption ("There the LORD will redeem you from the hand of your enemies", 4:10); both-tags ruling alongside `remnant` — remnant is who the regathered are, this is the national regathering promise itself |

### (b) Anchor-extension candidates
- `restoration-of-israel` — Micah 4:6-7 — "I will assemble that which is lame, and I will gather that which is driven away, and that which I have afflicted; and I will make that which was lame a remnant, and that which was cast far off a strong nation" — proposed weight 0.80 — the pack has no Micah anchor; sibling of its Jer 31:8-11 gathering register. SPAN NOTE: v7b is the god-reigns clause (next candidate) — curator to decide dual anchor (Ps 23:1 dual precedent, recorded both files) or split at v6 / v7. Corpus-blocked, rides PR-beta.
- `god-reigns` — Micah 4:7 — "the LORD will reign over them on Mount Zion from then on, even forever." — proposed weight 0.75 — verbatim the doxological-kingship register (parallel to the pack's Ps 146:10 anchor, "The LORD will reign forever; your God, O Zion"); no read-back involved — the verse's own words. Same span note as above. Corpus-blocked, rides PR-beta.
- `zion-city-of-god` — deliberately NOT proposed as an anchor despite the tag add: the chapter's strongest Zion spans (4:1-4) are backlog row 29's defining text (routed, see (d)), and 4:7 is claimed above for god-reigns; recorded so the curator can weigh a Micah 4:8 ("You, tower of the flock, the hill of the daughter of Zion") claim when row 29's span decisions are made — noted, not proposed.
- `nations-and-peoples` — deliberately NOT proposed for Micah 4:1-2 despite being the Isa 2:2-4 twin (that pack anchors Isa 2:2-4): the identical Micah span is row 29's defining text; the extension-vs-row decision belongs to the row-29 curator with both texts in view — noted, not proposed.

### (c) Lexicon candidates
- honest-and-empty — none proposed. ("swords into plowshares" / "vine and fig tree" query families belong to backlog row 29's eventual pack design — routed with (d), not logged against any live pack.)

### (d) New-concept candidates
- honest-and-empty — none new. Three ROUTED matches:
  - Micah 4:1-4 ROUTED: matches backlog row 29 (`peace-among-nations`) — the roster's own note says "the row IS those two texts (Mic 4:1-4; Isa 2:2-4)"; new evidence for the row's curator: "Nation will not lift up sword against nation, neither will they learn war any more." (4:3); "But every man will sit under his vine and under his fig tree. No one will make them afraid" (4:4).
  - Micah 4:9-10 ROUTED: matches backlog row 45 (`exile-and-captivity`, Jesse's routing call pending) — new evidence: "for now you will go out of the city, and will dwell in the field, and will come even to Babylon. There you will be rescued. There the LORD will redeem you from the hand of your enemies." (4:10); supplementary: "for they have gone into captivity from you!" (1:16).
  - Micah 4:11 ROUTED: matches backlog row 14 (`gloating-over-downfall`, BORDERLINE, decide with Theme G vengeance) — new evidence: "Now many nations have assembled against you, that say, “Let her be defiled, and let our eye gloat over Zion.”" (4:11) — a gloat text on the row's exact register from outside its Obadiah/Proverbs base.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- Chapter lands at 6 tags — at the soft cap, no yields. Both adds clear the presence bar chapter-wide (quotes above); existing order untouched, main themes first.
- `god-reigns` DISPLAY TAG considered and declined (thin single-verse class: one clause of 4:7; served at anchor level in (b) instead).
- `the-house-of-god` considered for 4:1-2 ("the mountain of the LORD’s temple") and declined: broad-duplicating-specific beside `zion-city-of-god` and row 29's territory.
- `peace-of-god` remains rightly absent per book doc Decisions #7 (inner-peace register; not re-opened).

### (g) Ceiling flag
- subdivided in book doc (sections: 4:1–5 The Mountain of the House of the LORD; 4:6–13 The Restoration of Zion) — flag for per-verse refinement pass

## Micah 5

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `gods-protection` | "He will be our peace when Assyria invades our land" … "He will deliver us from the Assyrian" | 5:5–6 | Prior art; the shepherd-ruler in the LORD's strength protecting his people (5:4–6), upheld by the book doc's reviewer pass |
| keep | `divine-judgment` | "I will execute vengeance in anger and wrath on the nations that didn’t listen." | 5:15 | Prior art; the purge of false securities and vengeance on the nations (5:10–15) |
| keep | `idolatry` | "I will cut off your engraved images and your pillars from among you; and you shall no more worship the work of your hands." | 5:13 | Prior art; the purge of what Israel trusts in place of God (5:12–14) |
| keep | `remnant` | "The remnant of Jacob will be among many peoples like dew from the LORD" | 5:7 | Prior art; a whole section on the remnant's future (5:7–9) |

### (b) Anchor-extension candidates
- `messianic-prophecy` — Micah 5:2 — "But you, Bethlehem Ephrathah, being small among the clans of Judah, out of you one will come out to me who is to be ruler in Israel; whose goings out are from of old, from ancient times." — proposed weight 0.85 — fits the pack's own LOCATOR DESIGN exactly ("passages the NT itself cites of Christ, stated as ATTRIBUTED FACT"): Matthew 2:5-6 cites this verse, and the pack currently has no Bethlehem-prophecy anchor although "prophecies about jesus" searchers plainly mean it. CONFLICT NOTE, curator's call: deity-of-christ.yaml already anchors Micah 5:2 (weight 0.6, ancient-pre-existence register, with its own WEB-reads-weaker caveat) — decide dual anchor (Ps 55:12-14 / Ps 23:1 precedent, record both files) vs single home before adding; do not double-anchor silently. DISPLAY LAYER UNAFFECTED: the book doc's Decisions #2 bar stands — no chapter tag, the Matthew citation stays a prose signpost. Corpus-blocked, rides PR-beta.
- `shepherds-and-the-flock` — Micah 5:4 — "He shall stand, and shall shepherd in the strength of the LORD, in the majesty of the name of the LORD his God." — proposed weight 0.60 — the coming-ruler-as-shepherd form of the pack's figure; verse-disjoint from deity-of-christ's 5:2. Corpus-blocked, rides PR-beta.
- `trusting-in-man` — Micah 5:10-11 — "I will cut off your horses from among you and will destroy your chariots. I will cut off the cities of your land and will tear down all your strongholds." — proposed weight 0.60 — the horses-and-chariots false-confidence register (pack lexicon: "trusting in horses and chariots"), REGISTER CAVEAT recorded: this text is God removing the trusted objects rather than a direct do-not-trust teaching (Isa 31:1 is the direct form); flagged for the curator to weigh, low weight says so. Corpus-blocked, rides PR-beta.
- `occult-and-divination` — Micah 5:12 — "I will destroy witchcraft from your hand. You shall have no soothsayers." — proposed weight 0.60 — the pack collects prohibitions and narratives; this is the purge-promise form, and the verse carries the pack's own bare lexicon token ("witchcraft") in corpus bytes. Corpus-blocked, rides PR-beta.

### (c) Lexicon candidates
- honest-and-empty — none. ("ruler from bethlehem" / "prophecy about bethlehem" phrasings belong with the messianic-prophecy anchor decision in (b) and its tokenizer discipline — left to the curator rather than logged as free-floating lexicon rows.)

### (d) New-concept candidates
- honest-and-empty — none. 5:5's "He will be our peace" checked against `peace-of-god` (inner-peace register — no) and row 29 (nations-at-peace — no; this is the ruler's person): carried by `gods-protection` prior art; no gap.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `messianic-prophecy` DISPLAY TAG deliberately NOT added, honoring the standing book-doc ruling (Decisions #2, upheld by its reviewer pass: "no NT read-back … no messianic tag") and this sweep's brief. The (b) anchor proposal is engine-curation material under the pack's attributed-fact locator design and does not touch the display layer; if the curator judges even the anchor a read-back, declining it costs nothing recorded elsewhere.
- No yields: chapter stays at 4 tags.

### (g) Ceiling flag
- subdivided in book doc (sections: 5:1–6 A Ruler from Bethlehem; 5:7–15 The Remnant of Jacob) — flag for per-verse refinement pass

## Micah 6

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `humble-exaltation` | "What does the LORD require of you, but to act justly, to love mercy, and to walk humbly with your God?" | 6:8 | Prior art; the pack itself anchors Micah 6:8 (torrey, 0.85) |
| keep | `honesty` | "Shall I tolerate dishonest scales, and a bag of deceitful weights?" … "her inhabitants speak lies" | 6:10–12 | Prior art; dishonest commerce and speech condemned by God himself |
| keep | `divine-judgment` | "Therefore I also have struck you with a grievous wound. I have made you desolate because of your sins." | 6:13 | Prior art; the court's sentence (6:13–16) |
| keep | `justice-and-oppression` | "Are there yet treasures of wickedness in the house of the wicked, and a short ephah that is accursed?" | 6:10 | Prior art; the pack anchors Micah 6:10-12 (0.85), this book's minted row |
| keep | `conscience` | "He has shown you, O man, what is good." | 6:8 | Prior art (apologetics pass); the pack anchors Micah 6:8 (0.7) with the covenant-Israel caveat carried in the book doc's tag line |

### (b) Anchor-extension candidates
- `empty-worship` — Micah 6:6-8 — "Shall I come before him with burnt offerings, with calves a year old? Will the LORD be pleased with thousands of rams? With tens of thousands of rivers of oil?" — proposed weight 0.75 — the canon's question-form statement of the pack's exact register (worship offered while justice is withheld: sibling of its Isa 1:11-17 and Amos 5:21-24 anchors), currently unanchored anywhere. SPAN NOTE: 6:8 is conscience's (0.7) and humble-exaltation's (0.85) — curator may clip to 6:6-7 to stay verse-disjoint (the offering-escalation verses are free), per the pack's Amos 5:21-24 / justice-and-oppression v24 sibling precedent. MAIN-WITNESSED (Micah 6 in committed fixture) — assertable now, no corpus gate.
- `honesty` — Micah 6:11 — "Shall I tolerate dishonest scales, and a bag of deceitful weights?" — proposed weight 0.60 — verse-scoped sibling claim inside justice-and-oppression's Micah 6:10-12 anchor span (the Amos 5:24-inside-empty-worship precedent, record both files); honesty's anchors are currently NT-only and carry no commerce text. MAIN-WITNESSED — assertable now.

### (c) Lexicon candidates
- `honesty` — phrase: "dishonest scales" — realistic query phrasings: "dishonest scales in the bible"; "what does the bible say about cheating in business"; "false weights and measures" — landing text Micah 6:11 (main-witnessed) with Prov 11:1 to follow at PR-beta; honesty's lexicon currently has no commerce phrasing at all.

### (d) New-concept candidates
- honest-and-empty — none. The covenant-lawsuit form (6:1-2, "the LORD has a case against his people") checked: no existing id fits and "God's lawsuit" is not a plausible lay search register at pack scale; described in the book doc's prose, which suffices. 6:7's firstborn-sacrifice question likewise not a search register; not proposed.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `empty-worship` DISPLAY TAG considered and declined (theme-witness-with-caveat class): 6:6-8 answers what to bring God rather than depicting performed-for-show or justice-withheld worship being rejected; the anchor proposal in (b) serves the register without forcing a chapter tag on a 5-tag chapter. Reversible.
- LEXICON deliberately NOT proposed for the 6:8 query family ("act justly love mercy walk humbly", "what does the lord require of you"): humble-exaltation.yaml records that exactly these drafted entries were DROPPED by the integrator on G8 evidence (they displaced 80% of the ot-prophets-justly probe's top-10, limit 40%) and that "Micah 6:8 keeps ranking first for that query lexically" — with Micah 6 main-witnessed, bare lexical retrieval already serves the family; re-proposing would re-litigate a measured removal. Recorded so no later thread re-logs it.
- `covenant` remains rightly absent per book doc Decisions #5 (institution register; not re-opened).
- No yields: chapter stays at 5 tags.

### (g) Ceiling flag
- subdivided in book doc (sections: 6:1–8 The Case against Israel; 6:9–16 The Punishment of Israel) — flag for per-verse refinement pass

## Micah 7

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `forgiveness-of-sins` | "Who is a God like you, who pardons iniquity, and passes over the disobedience of the remnant of his heritage?" | 7:18 | Prior art; the closing pardon doxology (7:18–19); the pack anchors Micah 7:18 (torrey, 0.75) |
| keep | `gods-love` | "He doesn’t retain his anger forever, because he delights in loving kindness." | 7:18 | Prior art; delight-in-hesed register (7:18–19) |
| keep | `trust-in-god` | "But as for me, I will look to the LORD. I will wait for the God of my salvation. My God will hear me." | 7:7 | Prior art; the lament's turning point; the pack anchors Micah 7:7 (torrey, 0.65) |
| keep | `repentance` | "I will bear the indignation of the LORD, because I have sinned against him" | 7:9 | Prior art; the penitent's confession and submission |
| keep | `gods-faithfulness` | "You will give truth to Jacob, and mercy to Abraham, as you have sworn to our fathers from the days of old." | 7:20 | Prior art; the oath kept from of old |
| add | `mercy` | "he delights in loving kindness" … "He will again have compassion on us." … "and mercy to Abraham" | 7:18–20 | The hesed-compassion register the mercy pack was minted for, in the book's climax — its lexicon's own words ("loving kindness", "mercy and compassion") are the chapter's words; both-tags ruling alongside `gods-love` and `forgiveness-of-sins` (love names the disposition, forgiveness the pardon, mercy the hesed register itself) |
| add | `betrayal` | "Don’t trust in a neighbor. Don’t put confidence in a friend." … "For the son dishonors the father, the daughter rises up against her mother, the daughter-in-law against her mother-in-law; a man’s enemies are the men of his own house." | 7:5–6 | Friend-and-kin betrayal — the general register betrayal.yaml was minted for ("betrayed by family", "betrayed by a friend") — depicted across 7:2 ("every man hunts his brother with a net") and counseled in 7:5–6; not marriage-specific, so not the pastoral crisis pack |

### (b) Anchor-extension candidates
- `forgiveness-of-sins` — widen existing Micah 7:18 anchor to Micah 7:18-19 — "He will again have compassion on us. He will tread our iniquities under foot. You will cast all their sins into the depths of the sea." — keep weight 0.75 and torrey source — this executes the pack's own recorded instruction verbatim: "if the v19 imagery should be reachable, widen the torrey entry to 7:18-19 in a reviewed change instead" (its Micah 7:19 considered-and-not-added comment). MAIN-WITNESSED — assertable now.
- `gods-faithfulness` — Micah 7:20 — "You will give truth to Jacob, and mercy to Abraham, as you have sworn to our fathers from the days of old." — proposed weight 0.70 — the pack's lexicon carries "god keeps his promises" but its anchors hold no sworn-oath OT text; verse-disjoint from 7:18 (forgiveness-of-sins') and 7:19 (per the widen above — if the widen lands, 7:20 remains free). MAIN-WITNESSED — assertable now.
- `betrayal` — Micah 7:5-6 — "Don’t trust in a neighbor. Don’t put confidence in a friend. With the woman lying in your embrace, be careful of the words of your mouth! For the son dishonors the father" — proposed weight 0.70 — the pack's only family-betrayal OT texts are corpus-blocked psalms; this is the canon's bluntest kin-betrayal counsel and is MAIN-WITNESSED — assertable now. DUAL-REGISTER NOTE: 7:5 also reads as `trusting-in-man` material ("Don’t put confidence in a friend" beside 7:7's turn to the LORD); proposed home is betrayal (the verses name kin treachery, not misplaced-trust-versus-God teaching), with the trusting-in-man alternative recorded for the curator — one home or a recorded dual, never a silent double.
- `shepherds-and-the-flock` — Micah 7:14 — "Shepherd your people with your staff, the flock of your heritage, who dwell by themselves in a forest." — proposed weight 0.65 — the prayed form of the God-as-shepherd register (sibling of the pack's Ps 100:3 / Isa 40:11 anchors). MAIN-WITNESSED — assertable now.
- `the-lords-discipline` — Micah 7:9 — "I will bear the indignation of the LORD, because I have sinned against him, until he pleads my case and executes judgment for me. He will bring me out to the light." — proposed weight 0.70 — the pack has only 2 anchors and its "why is god disciplining me" searcher is answered exactly by this verse's posture (bearing deserved discipline in hope of vindication). MAIN-WITNESSED — assertable now.

### (c) Lexicon candidates
- `forgiveness-of-sins` — phrase: "cast our sins into the depths of the sea" — realistic query phrasings: "sins cast into the depths of the sea"; "god throws our sins into the sea"; "where do our sins go when god forgives" — landing text Micah 7:19 via the widened anchor in (b); the pack's east-from-west entry shows the same remembered-imagery pattern.
- `slow-to-anger` — phrase: "he doesn’t retain his anger forever" — realistic query phrasings: "does god stay angry forever"; "will god be angry with me forever"; "god doesn’t stay angry" — anchor stays put: Micah 7:18 is forgiveness-of-sins' (its comment bars adjacent re-anchoring, honored by mercy.yaml already); the query family lands honestly on slow-to-anger's existing formula anchors (Ps 86:15, 103:8), with Micah 7:18 reachable lexically in corpus (main-witnessed).

### (d) New-concept candidates
- honest-and-empty — none. "Who is a God like you" (7:18) checked against `no-other-god` (polemic register — the chapter's question is doxological wonder at pardon, carried by `forgiveness-of-sins`) and `the-name-of-god` (lookup register — no): no gap.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- Chapter lands at 7 tags — above the soft cap 6, under the hard ceiling 8, per §11.6 (every tag independently clears the bar; main themes first — the existing five keep their order, the two adds follow). The book doc's application pass already ran this chapter as cap-watch and skipped thin candidates (`justice-and-oppression` 7:3 single verse; `remnant` 7:18 in-passing genitive — both skips honored, not re-opened); the two adds are not thin: `mercy` is the chapter's climax register (7:18–20), `betrayal` its opening section's substance (7:2, 5–6).
- `light-and-darkness` considered for 7:8 ("When I sit in darkness, the LORD will be a light to me") and declined, twice over: register mismatch (that pack is John's christological light-claims, by its own header) and span — Micah 7:8 is pastoral-relapse-and-restoration's keystone anchor (weight 1.0); the quoted-verse query is served lexically in corpus (main-witnessed).
- `hope-in-god` considered for 7:7 and declined (broad-duplicating-specific beside `trust-in-god`, whose pack anchors 7:7).
- `pastoral-hope-in-despair` remains rightly absent per book doc Decisions #9 (register rule; not re-opened).
- No drops, no yields.

### (g) Ceiling flag
- subdivided in book doc (sections: 7:1–6 Israel's Great Misery; 7:7–13 Israel's Confession and Comfort; 7:14–20 God's Compassion on Israel) — flag for per-verse refinement pass

## Book roll-up

- Chapters swept: 7/7. Tag deltas: 6 adds (`lament` ch1; `covetousness` ch2; `zion-city-of-god`, `restoration-of-israel` ch4; `mercy`, `betrayal` ch7), 30 keeps, 0 drops, 0 yields.
- Anchor-extension candidates: 17 proposed — 7 on main-witnessed Micah 6–7, assertable now (empty-worship 6:6-8; honesty 6:11; forgiveness-of-sins widen 7:18→7:18-19, the pack's own invited reviewed change; gods-faithfulness 7:20; betrayal 7:5-6; shepherds-and-the-flock 7:14; the-lords-discipline 7:9) and 10 corpus-blocked riding PR-beta (lament 1:8; justice-and-oppression 3:9-11; false-prophets 3:5-7; unanswered-prayer 3:4; restoration-of-israel 4:6-7; god-reigns 4:7; messianic-prophecy 5:2; shepherds-and-the-flock 5:4; trusting-in-man 5:10-11; occult-and-divination 5:12) — plus 2 recorded not-proposed span notes (zion-city-of-god, nations-and-peoples on Micah 4) and 1 already-recorded pack rider confirmed (covetousness Mic 2:1-2).
- Lexicon candidates: 3 (honesty "dishonest scales"; forgiveness-of-sins "cast our sins into the depths of the sea"; slow-to-anger "he doesn’t retain his anger forever"). One family deliberately not proposed with grounds (the 6:8 G8 history).
- New-concept candidates: 0. Routed to backlog: 4 (row 29 peace-among-nations ← Micah 4:1-4; row 45 exile-and-captivity ← Micah 4:9-10 + 1:16; row 14 gloating-over-downfall ← Micah 4:11; row 13 empowered-by-the-spirit ← Micah 3:8).
- Decline-overturn proposals: 0 (the ch1 `lament` add is inside the row's own composed-form precedent, not an overturn of the §1(c) grief declines — argued in ch1 (f)).
- Ceiling: no chapter hit 8. Per-verse refinement flags (subdivided in book doc): chapters 2, 4, 5, 6, 7.
