# Sweep ledger — Zephaniah

- **Book:** Zephaniah
- **Sweep date:** 2026-08-26
- **Repo SHA (origin/main):** e762d1c629f5b121a2aacc6da57cca6bacc3215e
- **Concept census:** 239 (ontology/concepts/ @ SHA above)
- **WEB text source:** pipeline/fixtures/web-subset.json @ 87fd68c (full-Bible expansion; pinned WEB sourceSha256 b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c — identical to main's committed fixture's pinned snapshot); fixture-witnessed-on-main chapters for this book: **none** — all of Zephaniah is expansion-only (engine candidates below are corpus-blocked until PR-beta merges; every (b) row rides PR-beta). Note the recorded rendering ruling: WEB Zeph 1:7 reads "the Lord GOD" and the divine name renders "the LORD" throughout — quotes below are glyph-exact to text/zephaniah.md.
- **Inputs read:** BRIEF.md; zephaniah.md book doc; concept-index.md + packs/; declines.md (tag-gaps-review §3 + §1 + postscript rulings); backlog-roster.md (engine-pack-backlog); tag-apply/adopted-concepts.md (§11.1 canonical list, 161 ids with engine-built markers — checked; the book doc's `gods-delight-in-his-people` tag is on that list, engine-built: no)

## Zephaniah 1

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "I will utterly sweep away everything from the surface of the earth, says the LORD." | 1:2 | Prior art; the whole-earth sweep narrowing onto Judah (1:2–6, 8–13, 14–18) |
| keep | `day-of-the-lord` | "The great day of the LORD is near. It is near and hurries greatly" | 1:14 | Prior art (2026-08-25 pass); one of the theme's core chapters — the pack itself anchors Zephaniah 1:14-18 at 0.95 |
| keep | `idolatry` | "I will cut off the remnant of Baal from this place" | 1:4 | Prior art (2026-08-25 pass); Baal, the host-of-heaven rooftop worship, and the Malcam double-oath (1:4–6) |
| keep | `complacency` | "I will punish the men who are settled on their dregs, who say in their heart, “The LORD will not do good, neither will he do evil.”" | 1:12 | Prior art (2026-08-25 pass; the row minted from this book); the pack anchors Zephaniah 1:12 at 0.85 |
| add | `money-and-possessions` | "Neither their silver nor their gold will be able to deliver them in the day of the LORD’s wrath" | 1:18 | Wealth's impotence under judgment is a recurring chapter strand — "All those who were loaded with silver are cut off." (1:11), "Their wealth will become a plunder" (1:13), 1:18 — the pack's danger-of-riches teaching register (Prov 11:4 family); ordered last as a supporting theme |

Chapter moves 4 → 5 tags (under soft cap 6). No drops. The `money-and-possessions` add is the delegated call most worth a reviewer's eye — see (f).

### (b) Anchor-extension candidates
- `money-and-possessions` — Zephaniah 1:18 — "Neither their silver nor their gold will be able to deliver them in the day of the LORD’s wrath" — proposed weight 0.60 — the wealth-cannot-deliver-in-judgment witness (twin of Prov 11:4 and Ezek 7:19, both also corpus-blocked; the curator should scope the three together). Corpus-blocked; rides PR-beta.
- `backsliding` — Zephaniah 1:6 — "those who have turned back from following the LORD, and those who haven’t sought the LORD nor inquired after him." — proposed weight 0.60 — the turned-back register in its plainest oracle form; the pack's corpus-blocked rider list (Jer 2–3, Hos 14:4, Judg 2) does not yet include Zephaniah. Corpus-blocked; rides PR-beta.

### (c) Lexicon candidates
- honest-and-empty — none. ("day of wrath" checked: it normalizes into `day-of-the-lord`'s existing "the day of the lord" family plus lexical retrieval on 1:15, and a bare wrath entry would collide with `divine-judgment`'s "gods wrath".)

### (d) New-concept candidates
- honest-and-empty — none. (Checked: astral worship (1:5) → `idolatry` (the `occult-and-divination` astrology register is divination practice, not host-of-heaven worship); syncretistic double-oath (1:5) → `idolatry`; settled-denial → `complacency`, live and minted from this verse; wealth-cannot-save → `money-and-possessions` extension above; no backlog-roster row matches Zephaniah 1.)

### (e) Decline-overturn proposals
- honest-and-empty — none. (Book-doc D10 (`self-deception` not tagged on 1:12 — false view of God, not of self, single verse) re-checked and respected; the Proverbs `complacency` decline (declines.md §3.2 item 4) concerns Prov 1:32, not this book — nothing to overturn.)

### (f) Decisions record
- `money-and-possessions` ADD is a delegated judgment call, flagged reversible: three verses (1:11, 13, 18) depict the concept's riches-cannot-save teaching, but the chapter's frame is judgment, and a reviewer could rule the strand a theme-witness-with-caveat rather than substantial presence. If Jesse drops it, the (b) anchor row stands on its own.
- `divine-judgment` anchor extension considered and declined: the pack has 11 anchors and `day-of-the-lord`'s existing Zephaniah 1:14-18 anchor (0.95) already lands this chapter's judgment queries; a second same-chapter anchor is the NO-MEASURABLE-EFFECT class.
- `seeking-god` on ch 1 considered and declined: 1:6 names the *failure* to seek ("those who haven’t sought the LORD nor inquired after him") — failure-mode class (Gen-3 worked example); the positive summons is ch 2's.
- No yields (5 tags, under soft cap). No silent drops.

### (g) Ceiling flag
- no (5 tags; chapter deliberately NOT subdivided in book doc — D2 judged 1:2–18 escalation, not divergence; nothing owed to the per-verse refinement pass).

## Zephaniah 2

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `repentance` | "Seek the LORD, all you humble of the land, who have kept his ordinances." | 2:3 | Prior art; the turn-back summons "before the fierce anger of the LORD comes on you" (2:2), corroborated by the BSB heading and D5 |
| keep | `divine-judgment` | "The LORD’s word is against you, Canaan, the land of the Philistines." | 2:5 | Prior art; judgment ringing the compass — Philistia, Moab/Ammon ("Moab will be as Sodom, and the children of Ammon as Gomorrah", 2:9), Cush, Assyria (2:12–15) |
| keep | `day-of-the-lord` | "It may be that you will be hidden in the day of the LORD’s anger." | 2:3 | Prior art (2026-08-25 pass); the summons is framed by the approaching day (2:2–3) |
| keep | `remnant` | "The coast will be for the remnant of the house of Judah." | 2:7 | Prior art (2026-08-25 pass); each oracle's hope-note (2:7, 9) |
| add | `seeking-god` | "Seek the LORD, all you humble of the land, who have kept his ordinances. Seek righteousness. Seek humility." | 2:3 | The triple "Seek" imperative is the pack's own register ("seek the lord" is its lexicon) and the chapter's hinge, carried in its own BSB section (2:1–3); applied beside `repentance` under the §11.2 both-tags ruling — turning-back and seeking are distinct registers, each clearing the bar on this verse's own words |

Chapter moves 4 → 5 tags (under soft cap 6). No drops.

### (b) Anchor-extension candidates
- `seeking-god` — Zephaniah 2:3 — "Seek the LORD, all you humble of the land, who have kept his ordinances. Seek righteousness. Seek humility. It may be that you will be hidden in the day of the LORD’s anger." — proposed weight 0.75 — the prophets' seek-before-the-day imperative; the pack's OT anchors are promise-texts (Jer 29, Isa 55, Deut 4) and Chronicles narrative — no oracle-summons witness. ONE-HOME NOTE for the curator: `repentance` is the alternative routing (the book doc's D5 ground); the verse's own verb is seek, so this row proposes `seeking-god` — one routing, not both. Corpus-blocked; rides PR-beta. Guardrail note: the verse's "It may be" contingency must survive in any gist use — seeking is never a shelter formula (book doc doctrinal note honored).
- `complacency` — Zephaniah 2:15 — "This is the joyous city that lived carelessly, that said in her heart, “I am, and there is no one besides me.”" — proposed weight 0.60 — the careless-ease register at national scale; complacency.yaml's own header names Amos 6:1 ("at ease in Zion") as the unlogged kin text for the re-pin curator — this is the same family's Nineveh witness, and the pack already anchors Zeph 1:12, so the book is pack-recognized. Corpus-blocked; rides PR-beta.

### (c) Lexicon candidates
- honest-and-empty — none. (Checked: "hidden in the day of the lord's anger" — quote-retrieval once the corpus lands; "seek righteousness" / "seek humility" normalize into `seeking-god`'s existing {seek, ...} family without new rows.)

### (d) New-concept candidates
- honest-and-empty — none. (Checked: nation-oracles → `divine-judgment` + `nations-and-peoples` per the Jeremiah oracles-against-the-nations routing (declines.md §3.5); Nineveh's self-deification ("I am, and there is no one besides me", 2:15) → depicted blasphemy judged, not a register `no-other-god` should anchor; taunting God's people (2:8, 10) → nearest homes `slander-and-false-accusation` / backlog row 14's gloating register — checked against row 14 (`gloating-over-downfall`): that row is rejoicing over a *fallen* brother (Obad 1:12-13 class), while 2:8-10 is pre-fall taunting pride, so NOT routed and no new id proposed (the material is carried by `divine-judgment` + the ch-3 `humble-exaltation` inversion); no roster row matches.)

### (e) Decline-overturn proposals
- honest-and-empty — none. (Book-doc D6 (`refuge-in-trouble` not tagged: 2:3's shelter is conditional hope from God's *own* anger, a register mismatch) re-checked against the pack and respected; D9 (`nations-and-peoples` not on ch 2 — 2:11 is a single verse inside judgment oracles) re-checked and respected.)

### (f) Decisions record
- **D7 tension flagged, not acted on:** the book doc declined `humble-exaltation` on ch 2 because the *exalting* half is absent — but the humbling half IS depicted ("This they will have for their pride, because they have reproached and magnified themselves against the people of the LORD of Armies.", 2:10; Nineveh's fall, 2:15), and the Genesis 11 / Habakkuk 2 precedent tags humbling-half-only chapters. Recorded for the reviewer as a both-readings-defensible call; this sweep respects D7 as standing prior art and does not add the tag.
- `god-relents` (§11.1 adopted id, engine-built: no; backlog roster row 7) checked against 2:3's "It may be": the row's register is God relenting from announced judgment on repentance (Jonah 3–4, Joel 2:13-14 class) — 2:3 is the human side's contingent hope, not the divine-relenting statement; no match, nothing routed.
- No yields (5 tags, under soft cap). No silent drops.

### (g) Ceiling flag
- Subdivided in book doc (sections: 2:1–3 / 2:4–7 / 2:8–11 / 2:12–15, BSB) → flag for the per-verse refinement pass. Not at ceiling (5 tags).

## Zephaniah 3

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "Woe to her who is rebellious and polluted, the oppressing city!" | 3:1 | Prior art; woe on Jerusalem's corrupted offices (3:1–4) and the gathered-kingdoms indignation ("to pour on them my indignation, even all my fierce anger", 3:8) |
| keep | `joy-in-the-lord` | "Sing, daughter of Zion! Shout, Israel! Be glad and rejoice with all your heart, daughter of Jerusalem." | 3:14 | Prior art; Zion's commanded joy in her present King (3:14–15) |
| keep | `gods-love` | "He will calm you in his love." | 3:17 | Prior art (D14 single-verse precedent); the pack itself anchors Zephaniah 3:17 at 0.8 with the delight lexicon entries |
| keep | `humble-exaltation` | "for then I will take away out from among you your proudly exulting ones, and you will no more be arrogant in my holy mountain." | 3:11 | Prior art; the full inversion — proud removed, "an afflicted and poor people" left (3:12), honor given to the shamed (3:19–20) |
| keep | `restoration` | "when I restore your fortunes before your eyes" | 3:20 | Prior art; reviewer-sustained on the pack's own national Isa 43:18-19 register (3:19–20) |
| keep | `nations-and-peoples` | "For then I will purify the lips of the peoples, that they may all call on the LORD’s name, to serve him shoulder to shoulder." | 3:9 | Prior art; the universal-worship horizon as a full movement (3:9–10, echoed at 3:20) |
| keep | `remnant` | "The remnant of Israel will not do iniquity nor speak lies" | 3:13 | Prior art (2026-08-25 pass); a whole section's subject (3:12–13); the pack anchors Zephaniah 3:12-13 |
| keep | `gods-delight-in-his-people` | "He will rejoice over you with joy." ... "He will rejoice over you with singing." | 3:17 | Prior art (adopted display id per §11.1 list, engine-built: no — minted from this book); engine side already resolved as the `gods-love` lexicon/anchor extension (gods-love.yaml, TAG-GAP batch 2), so NO engine candidate is re-proposed here |

No adds, no drops — the chapter stands at the HARD CEILING of 8 (D15), every tag independently clearing the bar. Candidates that would otherwise contend are routed to (b) or recorded in (f).

### (b) Anchor-extension candidates
- `fear-not` — Zephaniah 3:16 — "Don’t be afraid, Zion. Don’t let your hands be weak." — proposed weight 0.65 — discharges the §3.5 recorded lead ("do-not-fear → fear-not anchor-extension lead"); the chapter triple-states it ("no one will make them afraid", 3:13; "You will not be afraid of evil any more.", 3:15). Scoped to 3:16 to stay verse-disjoint from `gods-love`'s existing 3:17 anchor. Corpus-blocked; rides PR-beta.
- `presence-of-god` — Zephaniah 3:15 — "The King of Israel, the LORD, is among you. You will not be afraid of evil any more." — proposed weight 0.65 — the in-the-midst register recorded in §3.5 as a lexicon lead ("presence-in-the-midst → presence-of-god"), with "The LORD, within her, is righteous." (3:5) and "The LORD, your God, is among you" (3:17) as in-chapter corroboration; scoped to 3:15, verse-disjoint from `gods-love`'s 3:17. Corpus-blocked; rides PR-beta.
- `restoration-of-israel` — Zephaniah 3:20 — "At that time I will bring you in, and at that time I will gather you; for I will give you honor and praise among all the peoples of the earth when I restore your fortunes before your eyes, says the LORD." — proposed weight 0.70 — the regathering register ("god will gather israel") the pack owns; adds the Twelve's clearest bring-you-in promise beside its Jer/Isa/Ezek anchors. Verse-scoped to 3:20 (3:19 goes to `shame` below; the display `restoration` tag's register question stays with the recorded §1(e) tension, not prejudged). Corpus-blocked; rides PR-beta.
- `shame` — Zephaniah 3:19 — "I will give them praise and honor, whose shame has been in all the earth." — proposed weight 0.60 — the shame-LIFTED comfort register shame.yaml names as its first register (Isa 54:4 / Isa 61:7 family), with the lame-and-outcast gathered in the same verse. Corpus-blocked; rides PR-beta.
- `nations-and-peoples` — Zephaniah 3:9-10 — "For then I will purify the lips of the peoples, that they may all call on the LORD’s name, to serve him shoulder to shoulder." (3:9); "From beyond the rivers of Cush, my worshipers, even the daughter of my dispersed people, will bring my offering." (3:10) — proposed weight 0.70 — the pack's prophets'-universal-horizon register (Isa 2:2-4 / Ps 86:9 family); no Minor-Prophets anchor exists in the pack. Corpus-blocked; rides PR-beta.
- `humble-exaltation` — Zephaniah 3:11 — "for then I will take away out from among you your proudly exulting ones, and you will no more be arrogant in my holy mountain." — proposed weight 0.65 — the proud-removed / lowly-left inversion in oracle form; scoped to 3:11, verse-disjoint from `remnant`'s existing Zephaniah 3:12-13 anchor. Corpus-blocked; rides PR-beta.

### (c) Lexicon candidates
- `presence-of-god` — phrase: "the lord your god is in your midst" — realistic query phrasings: "the lord your god is in your midst"; "god is in your midst"; "the lord is in our midst" — the ESV/NIV-remembered form of 3:17 (WEB: "The LORD, your God, is among you"); no pack lexicon anywhere carries a midst-phrase (verified by grep over all 239), and `presence-of-god`'s lexicon has no among/midst entry — discharges the §3.5 recorded lexicon lead. Anchor home: the 3:15 extension above (or the pack's existing anchors until PR-beta).
- `gods-love` — phrase: "mighty to save" — realistic query phrasings: "mighty to save"; "he is mighty to save"; "quiet you with his love" — the NIV-remembered forms of 3:17 that gods-love.yaml's own Zeph 3:17 anchor comment claims "the lexicon entries carry" — but no entry in any of the 239 packs carries them (verified by grep): the delight entries ("god rejoices over you", "god sings over you") cover the singing register only. This closes the pack's own recorded intent; re-check phrasing collisions at curation ("mighty to save" shares {save} with salvation's family — the two-token pair {mighti, save} is the distinctive member).

### (d) New-concept candidates
- honest-and-empty — none. (Checked: purified-lips universal worship → `nations-and-peoples`; corrupt princes/judges/prophets/priests (3:3–4) → `justice-and-oppression` + `leadership` registers, and the display-tag question was already decided as the D15 yield — see (f); refusing correction (3:2, 7) → failure-mode class, see (f); `gentile-inclusion` (§11.1 adopted id, engine-built: no; backlog roster row 40) checked against 3:9-10: the row's register is Gentiles-welcomed-without-the-law (Acts 10–15 church question), while 3:9-10 is the prophets' universal-worship horizon — register mismatch, NOT routed, carried by `nations-and-peoples`.)

### (e) Decline-overturn proposals
- honest-and-empty — none. (The D15 `justice-and-oppression` yield on this chapter was re-examined and is NOT proposed for overturn: the chapter remains at the hard ceiling and the yield's ground — thin refs (3:1, 3:19) against 8 stronger tags — still holds; the oppressing-city material gains an engine-side path instead via the Habakkuk ledger's `justice-and-oppression` extensions and stays carried here by `divine-judgment`'s 3:1–4 justification.)

### (f) Decisions record
- **Ceiling standing:** chapter at hard ceiling 8 since D15; this sweep adds no tag and re-opens no yield. The D15 yield (`justice-and-oppression`, thin-single-verse class) and the D8 cap-drops (`fear-not`, `presence-of-god` — ground-of-kept-tags class) all remain recorded and honored; both D8 ids are served engine-side by (b) rows instead. No new yields; no silent drops.
- `receiving-correction` considered and declined (3:2 "She didn’t receive correction.", 3:7 "I said, “Just fear me. Receive correction,”"): failure-mode class (Gen-3 worked example; Nehemiah 9:29-30 decline precedent, declines.md §3.5), and receiving-correction.yaml scopes itself to receiving HUMAN rebuke — the refusal side belongs to `hardness-of-heart` (that pack's own boundary note). A `hardness-of-heart` anchor at 3:7 ("But they rose early and corrupted all their doings.") was weighed and left unproposed — national-narrative refusal, not the do-not-harden teaching register; recorded for the curator.
- `praise` considered and declined for the open... (no slot — at ceiling; also broad-duplicating-specific): 3:14's imperative is already the `joy-in-the-lord` justification's own verse; a second doxology tag adds no distinct movement.
- `god-reigns` considered and declined: "The King of Israel, the LORD, is among you." (3:15) is one title clause; kingship is not the chapter's teaching substance — possible future lexicon color only, consistent with the Zech 14:9 deferral (declines.md §3.5).
- `zion-city-of-god` considered and declined (3:14, 16): Zion here is the addressee of the joy/restoration movements, not city-of-God teaching substance; bare lexical "Zion" retrieval will serve once the corpus lands (Obadiah-ledger low-priority precedent).
- `pastoral-*` register re-checked (D11 standing): 3:14–20 remains national-scale prophetic promise; no pastoral tag applied. The personal-register comfort value of 3:17 & 3:19 is carried engine-side by `gods-love` (existing) and the `shame` / `fear-not` (b) rows.
- No yields, no silent drops (restated for the record).

### (g) Ceiling flag
- **HIT HARD CEILING 8** (standing since D15) AND subdivided in book doc (sections: 3:1–5 / 3:6–8 / 3:9–13 / 3:14–20, BSB) → per-verse refinement pass. The (b) rows above are already verse-scoped (3:9-10, 3:11, 3:15, 3:16, 3:19, 3:20) as that pass's raw input.

---

*Ledger complete: Zephaniah 1–3 swept 2026-08-26 against the 239-id engine library, the reviewed declines, the corpus-blocked roster, and the §11.1 adopted list. Totals: chapters at 5 / 5 / 8 tags; adds 2 (`money-and-possessions` ch 1 — flagged reversible; `seeking-god` ch 2), drops 0; anchor-extension candidates 10 (all corpus-blocked, ride PR-beta); lexicon candidates 2 (`presence-of-god` in-your-midst family — discharges the §3.5 lead; `gods-love` mighty-to-save family — closes the pack's own recorded intent); new concepts 0; decline overturns 0; backlog routes 0 (rows 7, 14, 40 checked — register mismatches, recorded in (d)/(f)).*
