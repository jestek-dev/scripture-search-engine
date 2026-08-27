# Sweep ledger — Joel

- **Book:** Joel
- **Sweep date:** 2026-08-26
- **Repo SHA (origin/main):** e762d1c629f5b121a2aacc6da57cca6bacc3215e
- **Concept census:** 239 (ontology/concepts/ @ SHA above)
- **WEB text source:** pipeline/fixtures/web-subset.json @ 87fd68c (full-Bible expansion; pinned WEB sourceSha256 b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c — identical to main's committed fixture's pinned snapshot); fixture-witnessed-on-main chapters for this book: **none** — Joel 1–3 are all expansion-only (engine candidates on them are corpus-blocked until PR-beta merges; every (b)/(c) row below rides PR-beta)
- **Inputs read:** BRIEF.md; joel.md book doc; concept-index.md + packs/; declines.md (tag-gaps-review §3 + §1 + postscript rulings); backlog-roster.md (engine-pack-backlog)

## Joel 1

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "the day of the LORD is at hand, and it will come as destruction from the Almighty" | 1:15 | Book-doc prior art; the ruined land named the front edge of God's arriving day (1:4–12, 16–20) |
| keep | `repentance` | "Sanctify a fast. Call a solemn assembly. Gather the elders and all the inhabitants of the land to the house of the LORD, your God, and cry to the LORD." | 1:14 | Prior art; mourning turned toward God (1:13–14) |
| keep | `prayer` | "LORD, I cry to you, for the fire has devoured the pastures of the wilderness" | 1:19 | Prior art; the prophet models the commanded cry (1:14, 19) |
| keep | `day-of-the-lord` | "Alas for the day! For the day of the LORD is at hand" | 1:15 | Prior art (2026-08-25 application pass); the book's organizing phrase, first sounded here |
| keep | `fasting` | "Sanctify a fast. Call a solemn assembly." | 1:14 | Prior art; the commanded corporate fast |
| keep | `lament` | "Mourn like a virgin dressed in sackcloth for the husband of her youth!" | 1:8 | Prior art; commanded communal lament over calamity (1:5, 8–14) |

No adds, no drops. Chapter stays at 6 tags (soft cap). Candidates considered and not added: `gods-provision` (the chapter depicts loss of provision, not the concept's God-provides teaching substance — topic contact only); `drunkenness` (1:5 addresses drunkards to mourn the cut-off wine — occasion imagery, not teaching on the practice; same ground as the Jeremiah 13:13 decline, declines.md §3.5); `grief-and-loss` (national-calamity mourning is the `lament` practice already tagged, per the §1(c) grief/lament boundary).

### (b) Anchor-extension candidates
- `lament` — Joel 1:8–14 — "Mourn like a virgin dressed in sackcloth for the husband of her youth!" (1:8); "Put on sackcloth and mourn, you priests! Wail, you ministers of the altar." (1:13) — proposed weight 0.70 — formalizes the pack's OWN recorded corpus-blocked rider ("Joel 1:8-14" is listed verbatim in lament.yaml's rider comment); commanded, corporate, brought-to-God lament ("cry to the LORD," 1:14) — the composed/communal register the pack owns, not the §1(c) personal-grief register.
- `day-of-the-lord` — Joel 1:15 — "Alas for the day! For the day of the LORD is at hand, and it will come as destruction from the Almighty." — proposed weight 0.75 — the phrase's first Joel occurrence. PACK-COMMENT MISMATCH FLAG for the curator: day-of-the-lord.yaml's existing `Joel 2:1-11` anchor carries the comment quote "Alas for the day! For the day of the LORD is at hand" — that quote is 1:15's text, outside the 2:1–11 ref. Either add 1:15 or re-scope the existing anchor/comment pair.

### (c) Lexicon candidates
- honest-and-empty — none. ("Sanctify a fast" / "solemn assembly" were weighed and judged below realistic search-scale; `fasting` and `gathering-together` lexicons already carry the live query families.)

### (d) New-concept candidates
- honest-and-empty — none. (Locust-plague-as-event checked against `divine-judgment`, `restoration` (ch 2 lexicon candidate below), and `gods-provision` famine entries — covered; no vocabulary gap.)

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- No yields (6 tags, under ceiling). `drunkenness` non-tag recorded above on the Jeremiah-13:13-decline ground (judgment/occasion imagery, not the practice) — delegated call, reversible.
- `gods-provision` non-tag on ch 1: its famine-situation lexicon entries ("famine in the land") make ch 1 a *retrieval* fit post-expansion, but a display tag requires the concept's teaching substance (God provides), which ch 1 does not depict. Situation-query service is left to lexical retrieval and to the ch 2 anchors.

### (g) Ceiling flag
- no (6 tags; not subdivided in book doc — Decisions #1 keeps Joel 1 whole).

## Joel 2

honest note at top: existing book-doc tags reviewed and kept; chapter is AT the hard ceiling of 8 — all new value below is routed engine-side ((b)/(c)) or to the backlog roster.

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "for the day of the LORD is great and very awesome, and who can endure it?" | 2:11 | Prior art; the advancing army under the LORD's own command (2:1–11) |
| keep | `repentance` | "turn to me with all your heart, and with fasting, and with weeping, and with mourning." | 2:12 | Prior art; "Tear your heart and not your garments" (2:13) |
| keep | `restoration` | "I will restore to you the years that the swarming locust has eaten" | 2:25 | Prior art; kept per book-doc Decisions #7 (register question deferred to curation, see (b)) |
| keep | `gods-provision` | "Behold, I will send you grain, new wine, and oil, and you will be satisfied with them" | 2:19 | Prior art; rain in just measure, full threshing floors (2:23–26) |
| keep | `salvation` | "It will happen that whoever will call on the LORD’s name shall be saved" | 2:32 | Prior art; the concept's own lexicon phrase ("call on the name of the lord") |
| keep | `dreams-and-visions` | "Your old men will dream dreams. Your young men will see visions." | 2:28 | Prior art; pack anchors Joel 2:28 at 0.95 (reviewer-verified) |
| keep | `day-of-the-lord` | "before the great and terrible day of the LORD comes" | 2:31 | Prior art (2026-08-25 pass); hinge question 2:11 |
| keep | `outpouring-of-the-spirit` | "I will pour out my Spirit on all flesh" | 2:28 | Prior art (adopted display id, 2026-08-25 pass); engine home note: holy-spirit.yaml records "FOLD DECIDED: outpouring-of-the-spirit folds HERE" and already anchors Joel 2:28-29 at 0.9 |

No adds, no drops (ceiling; see (f)).

### (b) Anchor-extension candidates
- `slow-to-anger` — Joel 2:13 — "for he is gracious and merciful, slow to anger, and abundant in loving kindness, and relents from sending calamity" — proposed weight 0.85 — the Exodus 34:6 formula verbatim in a corpus-blocked book the pack does not yet anchor; also discharges the Joel book doc's old `gods-love` capture-file lexicon lead (reviewer pass item (b)): `slow-to-anger` was minted after that doc and is the creed's designed home. Boundary note: the "relents" clause is backlog row 7's territory — see routed item below; this candidate claims the formula, not the relenting doctrine.
- `repentance` — Joel 2:12-13 — "turn to me with all your heart" ... "Tear your heart and not your garments, and turn to the LORD, your God" — proposed weight 0.85 — the OT's most-quoted return-to-the-LORD call; pack lexicon already carries "return to the lord" with no OT anchor of this register.
- `restoration` — Joel 2:25 — "I will restore to you the years that the swarming locust has eaten, the great locust, the grasshopper, and the caterpillar, my great army, which I sent among you." — proposed weight 0.85 — among the most-searched restoration texts; currently NO pack anchors it. Curator notes: (i) this feeds the recorded `restoration`-register TENSION (declines.md §1(e), Isaiah block) — personal-renewal vs national register to be resolved with both in view, not pre-decided here; (ii) prosperity guardrail per joel.md Decisions #6 — the verse is covenant mercy to a returning people, never formula; any gist/fixture should keep that frame.
- `gods-provision` — Joel 2:23-26 — "he gives you the early rain in just measure" (2:23); "You will have plenty to eat and be satisfied" (2:26) — proposed weight 0.70 — the answered-famine text behind the pack's famine-situation lexicon entries; watchlist discipline unchanged (no material-frame vocabulary proposed).
- `salvation` — Joel 2:32 — "It will happen that whoever will call on the LORD’s name shall be saved" — proposed weight 0.80 — the OT source text of the pack's Romans 10:13 anchor and "call on the name of the lord" lexicon entry.
- `remnant` — Joel 2:32 — "and among the remnant, those whom the LORD calls" — proposed weight 0.65 — the word itself; verse-scoped sibling with the `salvation` candidate above (distinct clauses of one verse; record in both files if adopted).
- `day-of-the-lord` — Joel 2:30-31 — "The sun will be turned into darkness, and the moon into blood, before the great and terrible day of the LORD comes." — proposed weight 0.85 — the verse behind the pack's own "great and terrible day of the lord" lexicon entry (its comment cites 2:31, but the existing Joel anchor stops at 2:1–11); the wonders-before-the-day text searchers quote.
- `no-other-god` — Joel 2:27 — "You will know that I am among Israel, and that I am the LORD, your God, and there is no one else" — proposed weight 0.65 — the exclusivity formula outside Isaiah; supporting-grade.

### (c) Lexicon candidates
- `repentance` — phrase: "rend your heart and not your garments" — realistic query phrasings: "rend your heart not your garments"; "tear your heart and not your garments"; "rend your hearts meaning" — remembered KJV/NIV phrasing ("rend") of WEB 2:13's "Tear your heart"; the remembered-phrasings precedent (salvation's "you must be born again") applies; pairs with the 2:12-13 anchor candidate.
- `restoration` — phrase: "restore the years the locusts have eaten" — realistic query phrasings: "god will restore the years the locusts have eaten"; "restore the years the locust has eaten"; "restore the wasted years" — heavy comfort-query family with no current lexicon home; lands on the 2:25 anchor candidate. Tokenizer note: {restor, year, locust} ≥2 significant tokens.
- (Checked, not proposed: `day-of-the-lord` already carries "great and terrible day of the lord"; `holy-spirit` already carries "pour out my spirit" / "outpouring of the holy spirit" — both query families are served.)

### (d) New-concept candidates
- honest-and-empty — none. (Checked: the relenting-God theme → backlog row 7; the outpoured-Spirit theme → engine `holy-spirit` (fold decided) + `dreams-and-visions`; the Exod-34:6 creed → engine `slow-to-anger`; the remnant clause → engine `remnant`.)

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- **Recorded ceiling state (KNOWN TENSION — recorded, not re-opened):** per joel.md Decisions #14, in the 2026-08-25 application pass Joel 2 hit the hard ceiling of 8; `fasting` on ch 2 (real but thin two-verse witness, 2:12, 15) was yielded, and the cross-ref-class candidate `day-of-the-lord` did NOT yield first despite §11.6's recommended order, because its Joel presence is plain (verbatim at 2:11, 2:31) and its application directed — judgment call already flagged for Jesse in the book doc. This sweep records that state and does not reverse or re-argue it.
- **Also recorded there, standing:** `lament` skipped on ch 2 (single verse 2:17, below the presence bar; the communal practice lives in ch 1); `day-of-the-lord` attribution anomaly (Joel refs sit in the Obadiah-minted row's Where column; applied anyway — presence plain).
- **`slow-to-anger` considered as a tag add and NOT added:** genuinely present (2:13, the formula verbatim) but the chapter is at the hard ceiling and this sweep will not force a yield against the recorded, Jesse-flagged ceiling state above; the concept's value here is engine-side and is carried by the (b) anchor candidate. No existing tag dropped — no silent drops.
- **`gods-love` drop (book-doc Decisions #5, reviewer-upheld) stands.** New fact for the curator recorded with the (b) `slow-to-anger` candidate: the creed's designed engine home now exists (`slow-to-anger`, minted 2026-08-26), which resolves the old capture-file lexicon-extension lead without touching `gods-love`.
- **Acts 2 remains a prose signpost only** (book-doc Decisions #3): no NT-register tag, and no candidate above cites Pentecost as rationale — Joel 2:28-32's candidates stand on Joel's own text.

### (g) Ceiling flag
- **HIT HARD CEILING 8** (recorded 2026-08-25, unchanged) AND **subdivided in book doc** (sections: 2:1–11; 2:12–17; 2:18–27; 2:28–32) → per-verse refinement pass. The (b) candidates above already give the dropped-at-chapter-level material exact verse ranges (2:12-13; 2:25; 2:30-31; 2:32).

## Joel 3

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "I will gather all nations, and will bring them down into the valley of Jehoshaphat; and I will execute judgment on them there" | 3:2 | Prior art; "there I will sit to judge all the surrounding nations" (3:12) |
| keep | `refuge-in-trouble` | "but the LORD will be a refuge to his people, and a stronghold to the children of Israel" | 3:16 | Prior art; the same roar that judges shelters |
| keep | `restoration` | "when I restore the fortunes of Judah and Jerusalem" | 3:1 | Prior art; kept per book-doc Decisions #7 (register question deferred; see add below and (f)) |
| keep | `presence-of-god` | "I am the LORD, your God, dwelling in Zion, my holy mountain" | 3:17 | Prior art; "for the LORD dwells in Zion" (3:21) |
| keep | `day-of-the-lord` | "For the day of the LORD is near in the valley of decision." | 3:14 | Prior art (2026-08-25 pass); the day completed from the judgment side |
| add | `zion-city-of-god` | "The LORD will roar from Zion" (3:16); "I am the LORD, your God, dwelling in Zion, my holy mountain. Then Jerusalem will be holy" (3:17); "for the LORD dwells in Zion" (3:21) | 3:16-17, 21 | The chapter resolves ON Zion as the city God dwells in and defends — the pack's own register; concept minted 2026-08-26, after the book doc, so this is a gap-close, not a reversal. Both-tags ruling (§11.2) with `presence-of-god`: dwelling-communion register there, the city-of-God register here — each clears the bar independently. |
| add | `restoration-of-israel` | "in that time, when I restore the fortunes of Judah and Jerusalem" (3:1); "But Judah will be inhabited forever, and Jerusalem from generation to generation." (3:20) | 3:1, 18-20 | National restoration after scattering (3:2 "whom they have scattered among the nations") — exactly this pack's register; minted after the book doc. Mirrors obadiah.md Decisions #10 (the national id now carries what `restoration`'s register cannot). |

Chapter moves 5 → 7 tags, within the ceiling, every tag independently clearing the bar. No drops: `restoration` is kept (its reviewer KEEP ruling is prior art; see (f)).

### (b) Anchor-extension candidates
- `refuge-in-trouble` — Joel 3:16 — "but the LORD will be a refuge to his people, and a stronghold to the children of Israel" — proposed weight 0.75 — "god is our refuge" / "stronghold in distress" register verbatim; the pack's only prophets anchor is Nahum 1:7.
- `zion-city-of-god` — Joel 3:16-17 — "The LORD will roar from Zion" ... "dwelling in Zion, my holy mountain. Then Jerusalem will be holy" — proposed weight 0.70 — the pack's anchors are currently all-Psalms; this is the prophets' Zion-as-God's-dwelling text.
- `divine-judgment` — Joel 3:12-14 — "for there I will sit to judge all the surrounding nations." (3:12); "Multitudes, multitudes in the valley of decision!" (3:14) — proposed weight 0.70 — the judgment-of-the-nations scene; pairs with the (c) "valley of decision" lexicon candidate below (whichever pack the curator routes that phrase to should own this span — XOR, not both).
- `day-of-the-lord` — Joel 3:14 — "For the day of the LORD is near in the valley of decision." — proposed weight 0.70 — the phrase's third Joel occurrence; alternative home for the "valley of decision" query family (see (c); decide one home).
- `restoration-of-israel` — Joel 3:1 — "when I restore the fortunes of Judah and Jerusalem" — proposed weight 0.65 — restore-the-fortunes formula in the prophets; supporting-grade beside the pack's Jer 29/31 keystones.
- `living-water` — Joel 3:18 — "and a fountain will flow out from the LORD’s house, and will water the valley of Shittim" — proposed weight 0.65 — the temple-fountain image family the pack already collects (Ezek 47:1-12 is its corpus-blocked minting passage; Zech 14:8 a noted ref); Joel 3:18 is the third member.

### (c) Lexicon candidates
- `day-of-the-lord` — phrase: "valley of decision" — realistic query phrasings: "valley of decision"; "multitudes in the valley of decision"; "what is the valley of decision in the bible" — famous phrase with no lexicon home anywhere in the vocabulary ({valley, decision} = 2 significant tokens). Routing note: `divine-judgment` is the alternative home; XOR — one pack takes phrase + Joel 3:12-14 span, per the (b) notes.
- `justice-and-oppression` — phrase: "human trafficking" — realistic query phrasings: "human trafficking in the bible"; "what does the bible say about human trafficking"; "bible verses about human trafficking" — live query family with no home; Joel 3:3 is Scripture's starkest text: "and have cast lots for my people, and have given a boy for a prostitute, and sold a girl for wine, that they may drink." Evidence span for a paired anchor: Joel 3:3-6 (child-trafficking named, 3:3; "sold the children of Judah... to the sons of the Greeks," 3:6). Register check for the curator, stated honestly: the pack's register is civic/economic oppression; Joel 3's traffickers are foreign nations under judgment — if that register stretch fails curation, the Amos-thread material (Amos 2:6) is the fallback home for the query family. Display-tag note: `justice-and-oppression` NOT proposed as a Joel 3 tag — the chapter's teaching substance about these deeds is retributive judgment, already carried by `divine-judgment` (same ground as the recorded `nations-and-peoples` drop, joel.md Decisions #13).

### (d) New-concept candidates
- honest-and-empty — none. (Checked: Zion → `zion-city-of-god`; judgment-of-nations → `divine-judgment` + `day-of-the-lord`; end-times framing → backlog row 5 (`end-times`, merge question with day-of-the-lord open — nothing new to add to it from Joel); trafficking → (c) above rather than a mint.)

### (e) Decline-overturn proposals
- honest-and-empty — none. (`nations-and-peoples` on Joel 3 was a book-doc drop (Decisions #13), re-checked against the pack: Joel 3's nations remain objects of judgment, not the pack's origin-and-blessing substance — no new textual evidence; the drop stands.)

### (f) Decisions record
- **ROUTED to backlog row 29 (`peace-among-nations`):** Joel 3:10 "Beat your plowshares into swords, and your pruning hooks into spears." — the verbatim INVERSE of that row's twin texts (Mic 4:3 / Isa 2:4). Recorded for the row's curator as guard material, not as an anchor: a "beat swords into plowshares" query will token-match Joel 3:10 once the corpus lands, and the eventual pack's fixture should assert Joel 3:10 as mustNotRank-or-below for peace-intent queries. Not duplicated as a candidate here.
- `restoration` + `restoration-of-israel` now co-tag ch 3 (and `restoration` alone tags ch 2). Deliberate under the both-tags ruling; the curator resolving the §1(e) register TENSION may re-home ch 3's `restoration` tag onto the national id alone — book-doc Decisions #7 already marks it reversible. Not dropped here: reversing a reviewer-KEPT prior-art tag is beyond this sweep's warrant.
- `zion-city-of-god` NOT back-filled onto Joel 2 (Zion at 2:1, 15, 23, 32 is the alarm/assembly's location, not the city-of-God teaching substance; ch 2 is at ceiling regardless).
- `pastoral-refuge-and-justice` non-tag stands (book-doc Decisions #8): personal-abuse-crisis register, wrong for a national-eschatological scene — re-affirmed against the pack boundary comment in justice-and-oppression.yaml.
- No yields (7 tags, under ceiling).

### (g) Ceiling flag
- no ceiling hit (7 tags) — but **subdivided in book doc** (sections: 3:1–16; 3:17–21) → eligible for the per-verse refinement pass; (b) spans above are already verse-scoped.

## Erratum — pastoral-* id normalization (2026-08-26)

Vocabulary-consistency check (Minor Prophets thread, 2026-08-26): the 14
`pastoral-*` packs' YAML `id:` fields omit the `pastoral-` prefix; per
CONVENTIONS §5 the canonical id for ledger use is the prefixed FILENAME form
(never strip the prefix). One mention in this ledger used the unprefixed
YAML-id form as a concept id. Original lines are left untouched per
CONVENTIONS §9; read them with the correction below.

- Joel 1, §(a) Applied-tag deltas — candidates-considered note ("No adds, no
  drops. Chapter stays at 6 tags (soft cap). Candidates considered and not
  added: ..."): the declined candidate written `grief-and-loss` is the
  pastoral pack; read as canonical `pastoral-grief-and-loss` (pack file
  `ontology/concepts/pastoral-grief-and-loss.yaml`, YAML `id: grief-and-loss`).
