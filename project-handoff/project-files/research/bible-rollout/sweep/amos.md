# Sweep ledger — Amos

- **Book:** Amos
- **Sweep date:** 2026-08-26
- **Repo SHA (origin/main):** e762d1c629f5b121a2aacc6da57cca6bacc3215e
- **Concept census:** 239 (ontology/concepts/ @ SHA above)
- **WEB text source:** pipeline/fixtures/web-subset.json @ 87fd68c (full-Bible expansion; pinned WEB sourceSha256 b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c — identical to main's committed fixture snapshot); fixture-witnessed-on-main chapters for this book: **none** — all nine chapters of Amos are expansion-only (absent from main's 5,726-verse committed fixture). Every engine-side candidate below is corpus-blocked until PR-β merges and is logged as riding PR-β.
- **Inputs read:** BRIEF.md; amos.md book doc (prior art, incl. Decisions 1–16, reviewer pass, critic rounds); concept-index.md + packs/; declines.md (tag-gaps-review §3 + §1 + Jesse's 2026-08-25 postscript rulings); backlog-roster.md (engine-pack-backlog, 50-row corpus-blocked roster); tag-apply/adopted-concepts.md (canonical §11.1 list, 161 ids with engine-built status — per coordinator notice 2026-08-26)
- **Standing prior rulings honored throughout:** `pastoral-refuge-and-justice` REMOVED from Amos 2/5/8 by group ruling (book doc Decision 3 — pastoral-* is the personal-crisis register, not national-scale prophetic material); not re-added anywhere. Justice material is unified on the single id `justice-and-oppression`. Acts 15's use of Amos 9 is a prose signpost only, never a tag rationale (book doc Decision 2).

## Amos 1

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "For three transgressions of Damascus, yes, for four, I will not turn away its punishment" | 1:3 | Five judgment oracles against the nations, fire on palaces (1:4, 7, 10, 12, 14) — announced punishment is the chapter's whole substance. (Only one honest tag from the current vocabulary.) |

### (b) Anchor-extension candidates
- honest-and-empty — none. (`divine-judgment` anchor for the 1:3–2:3 oracle cycle was considered and declined: the pack's wrath-on-nations register is already carried in-corpus by Nahum 1:2-6 and Genesis 19:24-25, the oracle formula is not a plausible query family, and the natural span crosses the chapter boundary.)

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- honest-and-empty — none. (Amos 1:11 — Edom "pursued his brother with the sword and cast off all pity" — was checked against backlog row 14 `gloating-over-downfall` (Obadiah/Edom): register mismatch — this is war cruelty indicted, not gloating over a brother's downfall; not routed, not logged.)

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- No yields (1 tag, under all caps). `nations-and-peoples` was NOT re-added: removed from Amos 1 by the book doc's reviewer ruling (Decision 5 — the chapter's substance is judgment on nations, already carried by `divine-judgment`; the Genesis-11 exemplar makes the same call); this sweep found no new textual ground to disturb that ruling.
- Chapter confirmed honest-and-empty for new candidates: existing book-doc tag reviewed and kept.

### (g) Ceiling flag
- no

## Amos 2

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "Behold, I will crush you in your place, as a cart crushes that is full of grain." | 2:13 | The oracle formula falls on Moab, Judah, and Israel (2:1, 4, 6) and closes in inescapable sentence (2:13-16). |
| keep | `sin` | "they have sold the righteous for silver, and the needy for a pair of sandals" | 2:6 | Itemized indictment of transgression (2:6-8) answered by its wages (2:13-16). |
| keep | `justice-and-oppression` | "They trample the heads of the poor into the dust of the earth and deny justice to the oppressed." | 2:7 | The Israel oracle's core charges are economic and judicial (2:6-8). |

### (b) Anchor-extension candidates
- `justice-and-oppression` — Amos 2:6-7 — "they have sold the righteous for silver, and the needy for a pair of sandals" (2:6) — proposed weight 0.80 — the book's opening economic-injustice indictment, the verse pair the ch-8 merchants oracle (8:6) deliberately echoes; the pack anchors Amos 5:24 only. (Amos NOT in main web-subset; rides PR-β.)

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- ROUTED: matches backlog row 4 (`persecuted-for-gods-word`) — new evidence: "commanded the prophets, saying, ‘Don’t prophesy!’" (2:12) — Israel silencing the LORD's prophets, the suppression-of-God's-word register that row collects; routed, not duplicated.
- Otherwise honest-and-empty — none. (`gods-faithfulness` NOT re-proposed for 2:9-11: removed by the book doc's reviewer ruling, Decision 12 — three foil verses inside an indictment; no new textual evidence. `drunkenness` checked for 2:8, 12: wine drunk in the house of their God and given to Nazirites is indictment detail, not the practice taught — the Jeremiah 13:13 decline precedent applies.)

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- No yields (3 tags). `pastoral-refuge-and-justice` deliberately NOT re-added despite the oppression material — book doc Decision 3's group ruling (personal abuse-safety register) stands; no genuine register match found.

### (g) Ceiling flag
- no

## Amos 3

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "I have chosen only you of all the families of the earth. Therefore I will punish you for all of your sins." | 3:2 | Election as grounds of stricter reckoning; the adversary pulls down strongholds (3:11) and the altars of Bethel fall (3:14-15). (Only one honest tag from the current vocabulary.) |

### (b) Anchor-extension candidates
- `dreams-and-visions` — Amos 3:7 — "Surely the Lord GOD will do nothing, unless he reveals his secret to his servants the prophets." — proposed weight 0.60 — the pack's Numbers 12:6 register (God making himself known to prophets) stated as a general principle; a heavily quoted verse no current anchor serves. (Amos NOT in main web-subset; rides PR-β.)

### (c) Lexicon candidates
- `dreams-and-visions` — phrase: "god reveals his secrets to the prophets" — realistic query phrasings: "god does nothing without revealing it to his prophets"; "does god reveal his plans to prophets"; "god reveals secrets to his servants the prophets"
- ROUTED: matches backlog row 47 (`unequally-yoked`) — new evidence: "Do two walk together, unless they have agreed?" (3:3) — the popular "can two walk together except they be agreed" query family quoted for partnership/marriage compatibility; CAVEAT for the row's curator: in context the verse is a rhetorical cause-and-effect step in the prophecy argument (3:3-8), not partnership teaching — lexicon-level evidence only, routed rather than logged.

### (d) New-concept candidates
- honest-and-empty — none. (3:7-8's prophetic-revelation theme resolved as the `dreams-and-visions` extension above — extension over mint; no other id checked closer: `watchman-and-warning` is the Ezekiel warning-responsibility charge, `false-prophets` the counterfeit register, `messianic-prophecy` the christological register.)

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- No yields (1 tag). Considered and declined as tags: `dreams-and-visions` (3:7 is a single verse — thin single-verse, below the honest-substantial-presence bar for a chapter tag; logged as anchor candidate instead); `election-and-predestination` (3:2's "I have chosen only you" is election as accountability in the prophetic-covenant register, not the pack's soteriological Eph 1 register — tagging would stretch the concept's teaching substance). `covenant` NOT re-added: removed by book doc reviewer ruling (Decision 4 — no institution register present); no new textual evidence.

### (g) Ceiling flag
- no
## Amos 4

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `the-lords-discipline` | "yet you haven’t returned to me" | 4:6 | Fivefold corrective chastening (famine, drought, blight/locusts, plagues, overthrow), each stanza closing with the same grief (4:6-11). |
| keep | `divine-judgment` | "they will take you away with hooks" | 4:2 | Sworn oath against Samaria's oppressors (4:2-3) and the final summons once lesser judgments failed (4:12). |
| keep | `empty-worship` | "Go to Bethel, and sin; to Gilgal, and sin more." | 4:4 | Ironic indictment of self-pleasing religion — sacrifices, tithes, bragged-about offerings "for this pleases you" (4:4-5). |
| keep | `justice-and-oppression` | "who oppress the poor, who crush the needy" | 4:1 | The oracle's target is the leisured oppressors of Samaria. |

### (b) Anchor-extension candidates
- `the-lords-discipline` — Amos 4:6-11 — "yet you haven’t returned to me" (4:6, refrain through 4:11) — proposed weight 0.85 — the pack has only two anchors, both NT (Heb 12:7-11; Rev 3:19); this is the OT's most sustained corrective-chastening text, discipline sent explicitly to turn a people back. (Amos NOT in main web-subset; rides PR-β.)
- `empty-worship` — Amos 4:4-5 — "Go to Bethel, and sin; to Gilgal, and sin more." (4:4) — proposed weight 0.70 — the self-pleasing-worship register ("for this pleases you, you children of Israel," 4:5), distinct from the pack's existing Amos 5:21-24 rejection-oracle anchor. (Amos NOT in main web-subset; rides PR-β.)
- `creation` — Amos 4:13 — "he who forms the mountains, creates the wind" — proposed weight 0.60 — first of the book's three doxologies (with 5:8 and 9:5-6, each logged in its chapter); the book doc's Decision 6 kept them off the chapter tag and captured them as motif candidates — this is the anchor-scoped disposition of that capture. (Amos NOT in main web-subset; rides PR-β.)

### (c) Lexicon candidates
- `divine-judgment` — phrase: "prepare to meet your god" — realistic query phrasings: "prepare to meet your god"; "prepare to meet your god meaning"; "what does prepare to meet your god mean"
- `the-lords-discipline` — phrase: "yet you have not returned to me" — realistic query phrasings: "yet you have not returned to me"; "god sends hardship to bring us back"; "why does god keep sending trouble"

### (d) New-concept candidates
- honest-and-empty — none. (The famine/drought stanzas (4:6-8) were checked against the §3.1 famine/scarcity decline — that routing (PR #41 `gods-provision` lexicon extension) covers scarcity queries; here the register is discipline, carried by the `the-lords-discipline` anchor candidate above. Nothing to mint.)

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- No yields (4 tags). `repentance` stays off per book doc Decision 7 (the refrain depicts refusal to return, not repentance teaching — the Genesis-3 counterexample rule); `tithing`, `thanksgiving`, `sabbath-rest` stay off 4:4-5 per Decision 8 (ironic indictment; tagging would invert each concept's substance). Sweep found no new ground against either ruling.

### (g) Ceiling flag
- no

## Amos 5

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `repentance` | "Seek good, and not evil, that you may live" | 5:14 | The chapter's living center is the threefold call to turn and live, with "Hate evil, love good" (5:4, 6, 14-15). |
| keep | `worship` | "I hate, I despise your feasts, and I can’t stand your solemn assemblies." | 5:21 | Landmark negative teaching on what worship God accepts (5:21-24). |
| keep | `divine-judgment` | "Therefore I will cause you to go into captivity beyond Damascus" | 5:27 | Lamentation over fallen Israel (5:1-3), darkness of the day (5:18-20), sentence of exile (5:27). |
| keep | `day-of-the-lord` | "Woe to you who desire the day of the LORD! Why do you long for the day of the LORD? It is darkness, and not light." | 5:18 | The longed-for day overturned against presumption (5:18-20). |
| keep | `empty-worship` | "Take away from me the noise of your songs! I will not listen to the music of your harps." | 5:23 | Feasts, offerings, and songs refused where justice is absent (5:21-23). |
| keep | `justice-and-oppression` | "But let justice roll on like rivers, and righteousness like a mighty stream." | 5:24 | Justice turned to wormwood, the reprover hated in the gate, the poor trampled (5:7, 10-12), and the rolling-justice demand (5:24). |
| add | `seeking-god` | "Seek me, and you will live" | 5:4 | Sustained seek-the-LORD teaching, the pack's exact register: "Seek me, and you will live" (5:4), "Seek the LORD, and you will live" (5:6), "Seek him who made the Pleiades and Orion" (5:8), "Seek good, and not evil, that you may live" (5:14) — the book's one open door, sounded four times. Both-tags ruling: distinct from `repentance` (the turn), this is the seek-him register the pack was minted for. |

### (b) Anchor-extension candidates
- `seeking-god` — Amos 5:4-6 — "Seek me, and you will live" (5:4); "Seek the LORD, and you will live" (5:6) — proposed weight 0.85 — the prophets' seek-and-live imperative; the pack's OT anchors are Jer 29:12-13 / Isa 55:6 / Chronicles — no Amos witness. (Amos NOT in main web-subset; rides PR-β.)
- `creation` — Amos 5:8 — "Seek him who made the Pleiades and Orion" — proposed weight 0.60 — second doxology; the only star-naming creation text outside Job, and the landing verse for constellation queries (see lexicon candidate). (Amos NOT in main web-subset; rides PR-β.)
- `remnant` — Amos 5:14-15 — "It may be that the LORD, the God of Armies, will be gracious to the remnant of Joseph." (5:15) — proposed weight 0.60 — the word itself in the conditional-hope register; supporting anchor beside the pack's Isa 1:9 / Rom 11:4-5 spine. (Amos NOT in main web-subset; rides PR-β.)
- `lament` — Amos 5:1-2 — "Listen to this word which I take up for a lamentation over you, O house of Israel" (5:1) — proposed weight 0.55 — a composed prophetic dirge, kin to the pack's own corpus-blocked riders Ezek 19:1-14 (commanded dirge) and 2 Sam 1:17-27 (composed, taught lament); 5:16's "those who are skillful in lamentation" names the practice. FOR THE CURATOR: this is the dirge-form register, not the complaint-to-God register the pack's in-corpus anchors carry — weight kept low accordingly. (Amos NOT in main web-subset; rides PR-β.)

### (c) Lexicon candidates
- `seeking-god` — phrase: "seek the lord and live" — realistic query phrasings: "seek the lord and live"; "seek me and live"; "seek god and live"
- `creation` — phrase: "pleiades and orion" — realistic query phrasings: "pleiades and orion in the bible"; "who made the pleiades and orion"; "constellations in the bible"

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- Chapter moves 6 → 7 tags with the `seeking-god` add — above the soft cap, under the hard ceiling of 8; density call per §11.6: the presence bar is cleared independently and the seek-and-live call is one of the chapter's main themes (the book doc's own summary calls it "the book's one open door"), so no existing tag yields. No drops, silent or otherwise.
- Considered and NOT added as tags: `lament` (theme-witness-with-caveat — the chapter is framed as a dirge (5:1-2, 16-17) but the pack's teaching substance is complaint carried to God, which this judgment-oracle frame does not depict; logged as a low-weight anchor candidate instead); `remnant` (5:15 is a thin single verse here; the doctrine's substantial Amos statement is ch 9's, where the tag is added).
- `pastoral-refuge-and-justice` deliberately NOT re-added (book doc Decision 3 group ruling stands).

### (g) Ceiling flag
- subdivided in book doc (sections: 5:1-3 lamentation / 5:4-15 call to repentance / 5:16-27 woes) AND now above the soft cap at 7 tags — flag for the per-verse refinement pass.

## Amos 6

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "I abhor the pride of Jacob, and detest his fortresses. Therefore I will deliver up the city with all that is in it." | 6:8 | The sworn oath, houses smashed (6:11), a nation raised to afflict border to border (6:14). |
| keep | `humble-exaltation` | "Haven’t we taken for ourselves horns by our own strength?" | 6:13 | The proud first among the nations are brought down first — captive "with the first who go captive" (6:1, 7-8). |
| keep | `self-deception` | "Alas for you who put far away the evil day, and cause the seat of violence to come near" | 6:3 | False security and self-credited strength (6:3, 13), the Revelation 3:17 register. |
| add | `complacency` | "Woe to those who are at ease in Zion, and to those who are secure on the mountain of Samaria" | 6:1 | The woe's whole target is settled ease unmoved by ruin — luxury detailed (6:4-6) and crowned by "but they are not grieved for the affliction of Joseph" (6:6); the complacency pack itself names Amos 6:1 as its flagged kin text for the re-pin curator. Both-tags ruling: distinct from `self-deception` (the inward mechanism) — this is the settled-ease register. |

### (b) Anchor-extension candidates
- `complacency` — Amos 6:1-6 — "Woe to those who are at ease in Zion, and to those who are secure on the mountain of Samaria" (6:1); "but they are not grieved for the affliction of Joseph" (6:6) — proposed weight 0.85 — ANSWERS THE PACK'S OWN FLAG: complacency.yaml's boundary comment names Amos 6:1 ("at ease in Zion") as the flagged kin text the Amos thread never logged, "named here for the re-pin curator, not anchored"; this is that logging. The pack has two anchors (Rev 3:15-16; Zeph 1:12 rider). (Amos NOT in main web-subset; rides PR-β.)
- `humble-exaltation` — Amos 6:8 — "I abhor the pride of Jacob, and detest his fortresses." — proposed weight 0.60 — the sworn-oath pride text; supporting OT witness (the pack's OT anchors are Ps 75:6-7, Prov 15:33, Mic 6:8). (Amos NOT in main web-subset; rides PR-β.)

### (c) Lexicon candidates
- `complacency` — phrase: "at ease in zion" — realistic query phrasings: "woe to those who are at ease in zion"; "at ease in zion meaning"; "comfortable while others suffer"

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- No yields (4 tags after the add). Considered and NOT added: `money-and-possessions` (the luxury catalog 6:4-6 touches the woe-to-the-rich topic, but the chapter's teaching substance is indifference in ease, carried by the `complacency` add — a second tag would be broad-duplicating-specific); `justice-and-oppression` (6:12 "you have turned justice into poison" is a thin single verse here beside chapters 2/4/5/8's sustained material — below the bar for this chapter).
- Note for the complacency curator: Prov 1:32's recorded decline (§3.2 item 4) is untouched by this add — Amos 6:1 is the settled-ease register that decline distinguishes, not the refusing-Wisdom register.

### (g) Ceiling flag
- no (book doc Decision 1 deliberately did NOT subdivide Amos 6 — one continuous woe)
## Amos 7

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `dreams-and-visions` | "Thus the Lord GOD showed me" | 7:1 | Three visions in the showing formula (7:1, 4, 7) with "Amos, what do you see?" (7:8). |
| keep | `prayer` | "Lord GOD, forgive, I beg you! How could Jacob stand? For he is small." | 7:2 | Twofold prophetic intercession (7:2, 5), each answered (7:3, 6) — the Genesis-thread intercession→`prayer` ruling. |
| keep | `divine-judgment` | "Behold, I will set a plumb line in the middle of my people Israel. I will not again pass by them any more." | 7:8 | The plumb-line verdict, desolate high places (7:9), and the oracle on Amaziah's house (7:16-17). |
| keep | `pleasing-god-not-people` | "but don’t prophesy again any more at Bethel; for it is the king’s sanctuary, and it is a royal house!" | 7:13 | Ordered silent by priest and crown, Amos stands on God's commission (7:14-16). |

### (b) Anchor-extension candidates
- `dreams-and-visions` — Amos 7:7-9 — "behold, the Lord stood beside a wall made by a plumb line, with a plumb line in his hand" (7:7) — proposed weight 0.65 — the plumb-line vision, the landing text for a real query family (see lexicon candidate) no anchor serves. (Amos NOT in main web-subset; rides PR-β.)
- `prayer` — Amos 7:2, 7:5 (verse-scoped) — "Lord GOD, stop, I beg you! How could Jacob stand? For he is small." (7:5) — proposed weight 0.60 — prophetic intercession that turns announced judgment; the pack's intercession register has no OT-prophet witness. CROSS-NOTE for the curator: backlog row 7 (`god-relents`) will claim 7:3 and 7:6 ("The LORD relented concerning this.") when it mints — propose the sibling verse-disjoint split (prayer takes the pleas 7:2, 7:5; god-relents the relentings 7:3, 7:6), the recorded pattern for shared spans. (Amos NOT in main web-subset; rides PR-β.)

### (c) Lexicon candidates
- `dreams-and-visions` — phrase: "plumb line" — realistic query phrasings: "plumb line in the bible"; "what is god's plumb line"; "amos plumb line meaning"

### (d) New-concept candidates
- ROUTED: matches backlog row 7 (`god-relents`) — new evidence: "The LORD relented concerning this. “It shall not be,” says the LORD." (7:3; again 7:6 "The LORD relented concerning this. “This also shall not be,” says the Lord GOD.") — the roster row lists Jer 18, Jonah 3-4, Joel 2:13-14 but NOT Amos 7; these two relentings under intercession are prime material for that row's conditional-prophecy gist. Routed, not duplicated.
- ROUTED: matches backlog row 4 (`persecuted-for-gods-word`) — new evidence: "Amos has conspired against you in the middle of the house of Israel. The land is not able to bear all his words." (7:10) with the expulsion order "but don’t prophesy again any more at Bethel" (7:13) — a prophet denounced to the crown and silenced for God's word; joins the ch-2 route (2:12).
- ROUTED: matches backlog row 21 (`gods-surprising-choice`) — new evidence: "I was no prophet, neither was I a prophet’s son, but I was a herdsman, and a farmer of sycamore figs; and the LORD took me from following the flock" (7:14-15) — God's choice of an unlikely, uncredentialed man, the row's register (its roster note already flags 1 Cor 1:26-29 as the NT keystone; Amos is its prophetic biography). Routed, not duplicated.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- No yields (4 tags). Considered and NOT added: `boldness-in-witness` (Amos's defiance is carried by `pleasing-god-not-people`; a second tag would be broad-duplicating-specific); `watchman-and-warning` (Amos is commissioned to prophesy, but the chapter does not depict the Ezekiel-register watchman charge — responsibility-to-warn with blood-guilt teaching).

### (g) Ceiling flag
- subdivided in book doc (sections: 7:1-9 visions / 7:10-17 Amaziah narrative) — flag for the per-verse refinement pass.

## Amos 8

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `dreams-and-visions` | "Thus the Lord GOD showed me: behold, a basket of summer fruit." | 8:1 | Fourth vision in the book's formula, with "Amos, what do you see?" (8:2). |
| keep | `divine-judgment` | "The end has come on my people Israel. I will not again pass by them any more." | 8:2 | The ripeness verdict, the sworn oath "Surely I will never forget any of their works." (8:7), darkened noon and mourning (8:9-10). |
| keep | `honesty` | "making the ephah small, and the shekel large, and dealing falsely with balances of deceit" | 8:5 | Fraud explicitly named and placed under God's oath (8:7) — condemnation is the teaching (book doc Decision 9). |
| keep | `day-of-the-lord` | "that I will cause the sun to go down at noon, and I will darken the earth in the clear day" | 8:9 | The reckoning in the chapter's own "in that day" images (8:9-10; the chapter says "in that day," not the phrase itself — prior-art caveat kept). |
| keep | `famine-of-hearing-gods-word` | "not a famine of bread, nor a thirst for water, but of hearing the LORD’s words" | 8:11 | The theme's primary passage (8:11-12). Display tag — adopted-concepts.md lists it engine-built: no (no pack in ontology/concepts/); engine-side this is backlog row 10 — see (d). |
| keep | `justice-and-oppression` | "you who desire to swallow up the needy, and cause the poor of the land to fail" | 8:4 | Merchants buying "the poor for silver, and the needy for a pair of sandals" (8:6). |

### (b) Anchor-extension candidates
- `justice-and-oppression` — Amos 8:4-6 — "that we may buy the poor for silver, and the needy for a pair of sandals, and sell the sweepings with the wheat?" (8:6) — proposed weight 0.85 — the merchants oracle: predatory commerce against the poor, the pack's economic register (its Micah 6:10-12 dishonest-scales anchor is this register's only current prophet witness). CROSS-NOTE: `honesty` is the tag-level home for the fraud wording on these same verses (Decision 9); at the pack level the economic-fraud register is justice-and-oppression's per its Micah boundary comment — propose the anchor HERE, with honesty as the curator's alternative, not both. (Amos NOT in main web-subset; rides PR-β.)

### (c) Lexicon candidates
- `justice-and-oppression` — phrase: "dishonest scales" — realistic query phrasings: "dishonest scales in the bible"; "false balances in the bible"; "cheating customers bible" — CROSS-NOTE: same either/or with `honesty` as the anchor candidate above; the Micah 6:11 precedent puts the register here.

### (d) New-concept candidates
- ROUTED: matches backlog row 10 (`famine-of-hearing-gods-word`) — this chapter is the row's DEFINING text, already named in the roster: "I will send a famine in the land, not a famine of bread, nor a thirst for water, but of hearing the LORD’s words. They will wander from sea to sea... they will run back and forth to seek the LORD’s word, and will not find it." (8:11-12) — routed, not duplicated; the row's word-withheld vs prayer-shut-out lexicon-routing decision (Lamentations cross-note) rides with it.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- No yields (6 tags — at the soft cap, each independently clearing the bar; prior art from the 2026-08-25 application pass, reviewed and kept unchanged). `empty-worship` stays off ch 8 per the book doc's Decision 16 skip (single resented-Sabbath verse 8:5, substance carried by `honesty` on the same verses); `sabbath-rest`/`tithing` stay off per Decision 8. Sweep found no new ground against these.
- 8:10's "like the mourning for an only son" was checked and NOT tagged or routed — reading it toward Zech 12:10's pierced-only-son register would be a later-revelation read-back.

### (g) Ceiling flag
- no (at soft cap 6, not subdivided, hard ceiling not hit)

## Amos 9

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "Though they dig into Sheol, there my hand will take them; and though they climb up to heaven, there I will bring them down." | 9:2 | The altar vision's fivefold no-escape pursuit (9:1-4) and destruction of the sinful kingdom (9:8, 10). |
| keep | `restoration` | "I will raise up the tent of David who is fallen and close up its breaches, and I will raise up its ruins" | 9:11 | Ruin rebuilt, captivity reversed, a people replanted (9:11, 14-15). Prior art kept — see (f) on the §1(e) register tension. |
| keep | `nations-and-peoples` | "Haven’t I brought up Israel out of the land of Egypt, and the Philistines from Caphtor, and the Syrians from Kir?" | 9:7 | Direct origin-and-movement-of-peoples claim (9:7) plus "all the nations who are called by my name" (9:12) — kept per book doc Decision 5's split ruling. |
| keep | `dreams-and-visions` | "I saw the Lord standing beside the altar" | 9:1 | Fifth vision of the 7–9 cycle (book doc Decision 15). |
| add | `remnant` | "I will destroy it from off the surface of the earth, except that I will not utterly destroy the house of Jacob" | 9:8 | The preserved-through-judgment doctrine taught in full: sifting "among all the nations as grain is sifted in a sieve, yet not the least kernel will fall on the earth" (9:9) — destruction with a kept remainder, the pack's exact substance. Theme witness (the word "remnant" appears at 9:12 only of Edom) — noted, and the teaching substance is carried by 9:8-9 themselves. |
| add | `restoration-of-israel` | "I will bring my people Israel back from captivity, and they will rebuild the ruined cities, and inhabit them" | 9:14 | The pack's exact national register — return, rebuilding, replanting: "I will plant them on their land, and they will no more be plucked up out of their land" (9:15). Both-tags ruling: applied alongside `restoration` without dropping it — see (f). |

### (b) Anchor-extension candidates
- `restoration-of-israel` — Amos 9:14-15 — "I will bring my people Israel back from captivity, and they will rebuild the ruined cities, and inhabit them" (9:14) — proposed weight 0.85 — a first-rank regathering promise; span deliberately kept to 14-15 so 9:11-12 stays whole for the davidic-covenant / gentile-inclusion rows routed in (d) (verse-disjoint sibling discipline). (Amos NOT in main web-subset; rides PR-β.)
- `remnant` — Amos 9:8-9 — "except that I will not utterly destroy the house of Jacob" (9:8) — proposed weight 0.75 — the sieve that loses no kernel; joins the pack's corpus-blocked prophet riders (Mic 2:12; Zeph 3:12-13; Jer 23:3-4). (Amos NOT in main web-subset; rides PR-β.)
- `creation` — Amos 9:5-6 — "It is he who builds his rooms in the heavens, and has founded his vault on the earth" (9:6) — proposed weight 0.60 — third doxology (with 4:13 and 5:8, logged in their chapters). (Amos NOT in main web-subset; rides PR-β.)

### (c) Lexicon candidates
- honest-and-empty — none. ("tent of david" / "booth of david" phrasings belong to backlog row 44's eventual design and are noted in that route below, not logged as a live-pack candidate.)

### (d) New-concept candidates
- ROUTED: matches backlog row 44 (`davidic-covenant`) — new evidence: "In that day I will raise up the tent of David who is fallen and close up its breaches... and I will build it as in the days of old" (9:11) — the fallen-and-raised house of David, prime material beside the row's blocked 2 Sam 7 home text; the row's no-messianic-read-back note is honored (see (f)). "tent of david" / "booth of david" are natural lexicon phrasings for that row's curator. Routed, not duplicated.
- ROUTED: matches backlog row 40 (`gentile-inclusion`) — new evidence: "that they may possess the remnant of Edom and all the nations who are called by my name" (9:12) — this is the passage James quotes at the Jerusalem council (Acts 15:16-17), the row's core corpus-blocked text family; CAVEAT carried: within Amos the verse is possession of nations under David's restored house — the Gentile-inclusion reading is Acts 15's, so this evidence serves the row's NT-side design, never an Amos tag (no display tag applied here for exactly that reason). Routed, not duplicated.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- No yields (6 tags after the adds — at the soft cap, each independently clearing the bar).
- `restoration` KEPT alongside the `restoration-of-israel` add, per the both-tags ruling (§11.2) and the §1(e) recorded register TENSION (Isaiah block): restoration-of-israel.yaml's own minting note resolves the packs' lexicon boundary but leaves the book-doc tag question to the curator "with both in view rather than either thread pre-deciding it" — so this sweep adds the national id where it plainly applies and does not drop the prior-art personal-register tag. Reversible at curation.
- `messianic-prophecy` considered for 9:11 and NOT added: within Amos the promise is the restoration of David's fallen house; reading it as messianic prophecy rests on Acts 15's apostolic use, which the book doc (Decision 2) and this sweep's brief both bar as a tag rationale — later-revelation read-back. The Acts 15 prose signpost in the book doc stands and suffices.
- Amos 9:2-4 was checked against backlog row 34 (`running-from-god`) and NOT routed: the row's register is fleeing God's call (Jonah defining); 9:2-4 is God's inescapability in judgment — the Ps 139:7-12 twin inverted. Recorded here so the adjacency is visible without polluting the row.
- 9:13-15 carries no prosperity framing (book-doc reviewer finding honored): the abundance is covenant restoration after judgment.

### (g) Ceiling flag
- subdivided in book doc (sections: 9:1-10 destruction / 9:11-15 restoration) — flag for the per-verse refinement pass.

---

## Book totals (sweep summary)

- Chapters swept: 9/9 against all 239 engine ids + declines + backlog roster.
- Applied-tag deltas: **4 adds** (`seeking-god` ch 5; `complacency` ch 6; `remnant`, `restoration-of-israel` ch 9), **32 keeps**, **0 drops** (no yields anywhere; no chapter hit the hard ceiling).
- Anchor-extension candidates: **13** (justice-and-oppression ×2; the-lords-discipline; empty-worship; creation ×3; seeking-god; remnant ×2; lament; complacency; humble-exaltation; dreams-and-visions ×2; prayer; restoration-of-israel — all corpus-blocked, riding PR-β). [Count note: 15 bullet entries across (b) sections; two are paired verse-scoped siblings.]
- Lexicon candidates: **8** live-pack phrases (dreams-and-visions ×2; divine-judgment; the-lords-discipline; seeking-god; creation; complacency; justice-and-oppression) + 1 routed (row 47).
- New-concept candidates: **0** — every register found either extends an existing pack or matches a backlog roster row. Routed matches: row 4 (persecuted-for-gods-word — Amos 2:12; 7:10-13), row 7 (god-relents — 7:3, 6), row 10 (famine-of-hearing-gods-word — 8:11-12, the defining text), row 21 (gods-surprising-choice — 7:14-15), row 40 (gentile-inclusion — 9:12), row 44 (davidic-covenant — 9:11), row 47 (unequally-yoked — 3:3, lexicon-level with caveat).
- Decline-overturn proposals: **0**.
- Ceiling/refinement flags: Amos 5 (subdivided + 7 tags), Amos 7 (subdivided), Amos 9 (subdivided).
- tag-gaps.md: no new rows due (zero vocabulary gaps found — all candidates route or extend); no append made.
