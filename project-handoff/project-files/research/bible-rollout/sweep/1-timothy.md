# 1 Timothy — Layer-3 tag-sweep ledger

- **Book:** 1 Timothy (6 chapters, 113 verses; VPL code `1TI`)
- **Repo:** scripture-search-engine @ origin/main `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (engine 0.14.0; 239 concept packs). Read-only sweep — no repo changes.
- **Date:** 2026-08-26 · Pauline-epistles sweep worker (1 Timothy + 2 Timothy assignment)
- **Inputs used:** book doc `/mnt/project-files/research/bible-rollout/1-timothy.md` (prior art — existing tags re-verified, not re-derived); full 303-id legal vocabulary (239 engine ids at e762d1c ∪ 161 adopted display ids; every id below validated mechanically against `engine-ids.txt`/`adopted-161.txt`); pack files in `ontology/concepts/` read directly for every extension decision; CONVENTIONS §3/§4/§5/§6/§9/§11 (verbatim extract); tag-gaps-review §1 (resolved) + §3 (recorded declines — none overturned); corpus-blocked roster (`engine-pack-backlog.md`, 50 rows — matches routed, not duplicated).
- **WEB provenance:** pinned ebible.org engwebp VPL edition, sha256-verified against `pipeline/manifests/web.json` (`b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c`) — this IS the pinned snapshot, not a current-edition fetch. Every quotation below is word-for-word from that text (curly punctuation preserved). Chapter 6 is additionally witnessed verse-for-verse in `pipeline/fixtures/web-subset.json` (regenerated from the same sha256 at PR #53; agreement by construction).
- **Rules applied:** presence bar first (§5, §11.6); soft cap 6 / hard ceiling 8; §11.6 yield order; both-tags ruling (§11.2); no later-revelation read-backs; honest-and-empty preferred; no silent drops — every yield/judgment call is in the closing Decisions record; §4-neutral doctrinal posture (election-and-predestination pack precedent) on all contested passages; no theology adjudicated anywhere below.
- **Weights:** proposed anchor weights use the packs' 0.0–1.0 scale, calibrated against each pack's existing anchors (read in file).

---

## 1 Timothy 1

**Prior-art tags (6):** `salvation`, `grace-not-earned`, `sin`, `praise`, `false-teachers`, `backsliding`

### 1. Applied-tag deltas
- **KEEP** all six — each re-verified against the pinned text; the book doc's justifications hold (1:15 "The saying is faithful and worthy of all acceptance, that Christ Jesus came into the world to save sinners, of whom I am chief"; 1:17 doxology; 1:9–10 law-for-the-lawless catalog; 1:3–7 the founding charge; 1:19 "made a shipwreck concerning the faith").
- **ADD `mercy`** (engine id) — the chapter's testimony section is built on mercy received, named twice with a stated purpose: "However, I obtained mercy because I did it ignorantly in unbelief" (1:13) and "However, for this cause I obtained mercy, that in me first, Jesus Christ might display all his patience for an example of those who were going to believe in him for eternal life" (1:16). Substance, not passing mention — the chief of sinners presented as mercy's display case. Applied beside `grace-not-earned` on the same verses under the §11.2 both-tags ruling: distinct registers (compassion received vs. not-according-to-works; the mercy pack's own header places it between gods-love and the pardon register). Chapter moves to 7 tags — above the soft cap, under the ceiling; every tag independently clears the bar.
- **DROP** none.

### 2. Anchor-extension candidates
| id | ref | WEB quote | weight |
|---|---|---|---|
| `salvation` | 1 Timothy 1:15 | "Christ Jesus came into the world to save sinners, of whom I am chief." | 0.8 (pack has no 1–2 Tim anchor; a keystone how-saved text) |
| `mercy` | 1 Timothy 1:13-16 | "However, I obtained mercy because I did it ignorantly in unbelief." … "for this cause I obtained mercy, that in me first, Jesus Christ might display all his patience" | 0.65 |
| `slow-to-anger` | 1 Timothy 1:16 | "that in me first, Jesus Christ might display all his patience for an example of those who were going to believe in him" | 0.6 — NT witness to the DIVINE-patience register the pack documents (its Rom 2:4 precedent); NOT the human virtue, which the pack's own boundary sends to self-control |
| `grace-not-earned` | 1 Timothy 1:14 | "The grace of our Lord abounded exceedingly with faith and love which is in Christ Jesus." | 0.55 |

### 3. Lexicon candidates
- `salvation`: "christ jesus came to save sinners"; "chief of sinners"; "worst of sinners"
- `backsliding`: "shipwreck of faith"; "shipwrecked their faith" (1:19's image — pack lexicon has no shipwreck form)
- `praise`: "king eternal immortal invisible"; "immortal invisible god only wise" (hymn-remembered phrasing of 1:17)

### 4. New-concept candidates
None. "Wage the good warfare" / "fight the good fight" (1:18) has homes (`victory-in-christ` anchors 1 Tim 6:12; `suffering-for-christ`); the faithful-saying formula (1:15) is a locator motif already recorded in the book doc with homes — no measured gap.

### 5. Decline-overturn proposals
None.

### 6. Ceiling/subdivision markers
7 tags (under ceiling). Subdivided in the book doc (1:1–2 / 3–11 / 12–20) → flagged for the per-verse refinement pass.

**Considered, not added (see Decisions record):** `conscience` (1:5, 19 "a good conscience" — the engine pack's register is the law written on hearts, Rom 2; register mismatch); `legalism` (1:7–11 is the law's lawful use against would-be law-teachers, not the rule-keeping-piety register of corpus-blocked roster row 43 — observation noted for that row's curator, no proposal); `satan` (1:20 single verse, no teaching about Satan); `eternal-life` (1:16 single phrase; the register's home question is recorded in salvation.yaml per the roster's additional notes).

---

## 1 Timothy 2

**Prior-art tags (6):** `praying-for-leaders`, `prayer`, `salvation`, `the-cross`, `men-and-women-in-the-church`, `jesus-the-only-way`

### 1. Applied-tag deltas
- **KEEP** all six. `men-and-women-in-the-church` kept exactly as written — its justification is descriptive and §4-neutral (the election-and-predestination pack's §4-neutral wording is the binding precedent; gender roles are an explicit non-criterion per DOCTRINAL-BASIS §4); the tag reports what the text says and adjudicates nothing. The id is corpus-blocked roster **row 41** — engine-side material ROUTES there (see §2), the display tag stands as prior art.
- **ADD `mediator`** (adopted display id) — the chapter states the concept's namesake text, load-bearing to its argument: "For there is one God and one mediator between God and men, the man Christ Jesus, who gave himself as a ransom for all, the testimony at the proper time" (2:5–6) — prayer for all men (2:1) grounded in the God who "desires all people to be saved" (2:4) through the one go-between. Applied beside `jesus-the-only-way` under §11.2 (that tag carries the exclusivity register; this one the mediator/go-between register that roster row 24 documents — 1 Tim 2:5 is that row's own named NT ref). Display-only until the row unblocks. Chapter moves to 7 tags.
- **DROP** none.

### 2. Anchor-extension candidates
| id | ref | WEB quote | weight |
|---|---|---|---|
| `praying-for-leaders` | 1 Timothy 2:1-2 | "I exhort therefore, first of all, that petitions, prayers, intercessions, and givings of thanks be made for all men, for kings and all who are in high places, that we may lead a tranquil and quiet life in all godliness and reverence." | **0.95** — the concept's SOURCE TEXT (book doc: "this concept's source text; tagged on ch. 2"), yet the pack anchors only Jer 29:7 / Rom 13:1-7 / 1 Pet 2:13-17 / Ps 33:12. Strongest single anchor find of this book's sweep. |
| `the-cross` | 1 Timothy 2:5-6 | "who gave himself as a ransom for all" | 0.6 — the ransom register; DUAL with jesus-the-only-way's existing 1 Tim 2:5-6 anchor (0.9, exclusivity register) — record in both files if taken (deliberate cross-concept anchoring precedent) |
| `salvation` | 1 Timothy 2:3-4 | "who desires all people to be saved and come to full knowledge of the truth" | 0.6 — reported as the text states it; no extent-of-atonement adjudication in any gist |
| `prayer` | 1 Timothy 2:8 | "I desire therefore that the men in every place pray, lifting up holy hands without anger and doubting." | 0.5 |

**Routing (corpus-blocked — route, don't duplicate):**
- `men-and-women-in-the-church` → **roster row 41** (1 Tim 2:8–15 is the row's own blocked text; two-row design vs head-coverings already DECIDED, recorded in the head-coverings pack; fold stays open at re-pin). No new proposal here.
- `mediator` → **roster row 24** (1 Tim 2:5 already among the row's refs; the Job 9:32-35 minting register unassertable until PR-β). Nothing to add to the row.

### 3. Lexicon candidates
- `praying-for-leaders`: "pray for kings"; "prayers for those in authority"; "pray for those in authority over us"
- `prayer`: "lifting up holy hands"
- `salvation`: "god desires all to be saved"

### 4. New-concept candidates
None. Modesty in dress (2:9–10) stays with the men-and-women row per the recorded 1 Timothy decline ("no separate row; rides the `men-and-women-in-the-church` row's passage") — decline stands.

### 5. Decline-overturn proposals
None.

### 6. Ceiling/subdivision markers
7 tags (under ceiling). Subdivided in the book doc (2:1–8 / 9–15) → flagged for the per-verse refinement pass — and specifically: if roster row 41 unblocks, the 2:8–15 paragraph should be verse-scoped there rather than chapter-tagged.

---

## 1 Timothy 3

**Prior-art tags (2):** `incarnation`, `leadership`

### 1. Applied-tag deltas
- **KEEP** both — `incarnation` on the hymn ("Without controversy, the mystery of godliness is great: God was revealed in the flesh", 3:16; PR #43 use ratified 2026-08-25) and `leadership` on the office lists (3:1–13, 3:5 "for how could someone who doesn’t know how to rule his own house take care of God’s assembly?").
- **ADD** none — swept against the full 303-id vocabulary; nothing further clears the honest-substantial-presence bar. (Two honest tags only; honest-and-empty preferred over padding.)
- **DROP** none.

### 2. Anchor-extension candidates
| id | ref | WEB quote | weight |
|---|---|---|---|
| `the-house-of-god` | 1 Timothy 3:14-15 | "that you may know how men ought to behave themselves in God’s house, which is the assembly of the living God, the pillar and ground of the truth" | 0.65 — the NT church-as-God's-dwelling register the pack's Eph 2:21-22 anchor already carries; new candidate (pack has no 1 Tim ref) |

**Already recorded, confirm at re-pin (no new proposal):** `incarnation` → 1 Tim 3:16 is already queued in the pack's own header as corpus-deferred to the re-pin payload (P4.15); `leadership` → 1 Tim 3:1-7 already anchored (0.9, corpus-blocked rider).

### 3. Lexicon candidates
- `the-house-of-god`: "pillar and ground of the truth"; "the church is the pillar of truth"
- `leadership`: "qualifications for deacons" (pack has "qualifications of an elder" but no deacon form; 3:8–13); "husband of one wife" (3:2, 12 — heavily searched qualification phrase; XOR note: must route to the office-qualification texts, never to godly-marriage's register)

### 4. New-concept candidates
None.

### 5. Decline-overturn proposals
None. (`deity-of-christ` on 3:16 stays a recorded non-use — book doc Decision 3; no new textual evidence.)

### 6. Ceiling/subdivision markers
2 tags. Subdivided in the book doc (3:1–7 / 8–13 / 14–16) → flagged for the per-verse refinement pass.

**Considered, not added:** `the-house-of-god` (3:15 is the letter's thesis sentence but a single verse — thin-single-verse class; served as the anchor-extension candidate above); `godly-marriage` / `hospitality` (book doc Decision 11 non-uses stand — single qualification-list items, not teaching on those topics); `integrity` (blameless-character substance is the office lists' own and is carried by `leadership`).

---

## 1 Timothy 4

**Prior-art tags (7):** `thanksgiving`, `spiritual-gifts`, `spiritual-growth`, `studying-the-word`, `false-teachers`, `backsliding`, `discipleship`

### 1. Applied-tag deltas
- **KEEP** all seven — re-verified (4:1 "the Spirit says expressly that in later times some will fall away from the faith"; 4:3–5 thanksgiving ground; 4:7 "Exercise yourself toward godliness"; 4:13 "pay attention to reading, to exhortation, and to teaching"; 4:14 the gift by laying on of hands; 4:11–16 the personal training charge). The `false-teachers`/`backsliding` both-tags pairing on 4:1–3 stands per §11.2 (the falling-away and its agents are distinct registers, per the log rows).
- **ADD** none. `enjoying-gods-gifts` was weighed (4:3–5 IS genuinely the received-gift register) and yielded: at 8 tags it would sit beside `thanksgiving` on the same three verses — broad-duplicating-specific class — so it is served as an anchor-extension candidate instead (Decisions record).
- **DROP** none.

### 2. Anchor-extension candidates
| id | ref | WEB quote | weight |
|---|---|---|---|
| `spiritual-growth` | 1 Timothy 4:7-8 | "Exercise yourself toward godliness. For bodily exercise has some value, but godliness has value in all things, having the promise of the life which is now and of that which is to come." | 0.7 — the pack has only TWO anchors (1 Pet 2:2, Eph 4:15); this is its most-searched training text |
| `spiritual-gifts` | 1 Timothy 4:14 | "Don’t neglect the gift that is in you, which was given to you by prophecy with the laying on of the hands of the elders." | 0.6 (pack has no 1–2 Tim anchor; pairs with the 2 Tim 1:6 candidate in the sibling ledger) |
| `enjoying-gods-gifts` | 1 Timothy 4:4-5 | "For every creature of God is good, and nothing is to be rejected if it is received with thanksgiving. For it is sanctified through the word of God and prayer." | 0.6 — received-gift register, inside the pack's own guardrail (gift, never entitlement). **EITHER/OR** with the `thanksgiving` row below — curator decides one home (or a recorded dual), not a blind double-mint. |
| `thanksgiving` | 1 Timothy 4:4-5 | (same span as above — "received with thanksgiving" stated three times across 4:3–5) | 0.55 — the same-span alternative; see either/or note |
| `false-prophets` | 1 Timothy 4:1-2 | "paying attention to seducing spirits and doctrines of demons, through the hypocrisy of men who speak lies, branded in their own conscience as with a hot iron" | 0.55 — the church-age false-teachers half of that pack's Decision-6 merge |

**Already recorded, confirm at re-pin:** `backsliding` → 1 Tim 4:1-3 is already listed in that pack's header as a corpus-blocked rider (with 1 Tim 1:19-20).

### 3. Lexicon candidates
- `spiritual-growth`: "train yourself for godliness" (NIV-remembered form of 4:7); "bodily exercise profits little"; "let no one despise your youth" (4:12)
- `spiritual-gifts`: "don’t neglect your gift"; "neglect not the gift that is in you"
- `false-prophets`: "doctrines of demons"; "seducing spirits"

### 4. New-concept candidates
None.

### 5. Decline-overturn proposals
None. (`resisting-the-devil` and `creation` non-uses — book doc Decision 11 — stand; no new evidence.)

### 6. Ceiling/subdivision markers
7 tags (under ceiling). Subdivided in the book doc (4:1–5 / 6–16) → flagged for the per-verse refinement pass.

**Considered, not added:** `enjoying-gods-gifts` (yield recorded above); `holy-spirit` (4:1 "the Spirit says expressly" is an attribution formula, not Spirit teaching); `eternal-life` (4:8 "the promise of the life which is now and of that which is to come" — single phrase).

---

## 1 Timothy 5

**Prior-art tags (5):** `caring-for-aging-parents`, `care-for-widows`, `leadership`, `church-discipline`, `supporting-gospel-workers`

### 1. Applied-tag deltas
- **KEEP** all five — re-verified (5:4 "let them learn first to show piety toward their own family and to repay their parents"; 5:8 "But if anyone doesn’t provide for his own, and especially his own household, he has denied the faith"; 5:3 "Honor widows who are widows indeed"; 5:17 "Let the elders who rule well be counted worthy of double honor"; 5:19 two-or-three-witnesses rule; 5:18 "The laborer is worthy of his wages."). The `caring-for-aging-parents`/`care-for-widows` register split (children's duty vs. the assembly's care) stands per the log row; the PR #43 id use is ratified.
- **ADD** none — swept; nothing else clears the bar.
- **DROP** none.

### 2. Anchor-extension candidates
| id | ref | WEB quote | weight |
|---|---|---|---|
| `church-discipline` | 1 Timothy 5:19-21 | "Don’t receive an accusation against an elder except at the word of two or three witnesses. Those who sin, reprove in the sight of all, that the rest also may be in fear." | 0.6 — the pack's header names 1 Tim 5:19-21 as a corpus-blocked rider but carries NO anchors-list entry for it; this row proposes formalizing the rider as an anchor at re-pin |

**Already anchored / already recorded — no new proposals:** `care-for-widows` → 1 Tim 5:3-8 anchored (0.85 rider; the refinement pass may widen to 5:3-16 — enrollment standards — when assertable); `caring-for-aging-parents` → 1 Tim 5:4 + 5:8 already named in that pack's header as corpus-deferred re-pin candidates; `supporting-gospel-workers` → 1 Tim 5:17-18 anchored (0.75); `leadership`'s honoring-leaders register carried by its 1 Thess 5:12-13 anchor.

### 3. Lexicon candidates
- `supporting-gospel-workers`: "the laborer is worthy of his wages"; "double honor"; "should pastors be paid"
- `church-discipline`: "accusation against an elder"; "two or three witnesses"
- `care-for-widows`: "widows in the church"; "what does the bible say about widows"

### 4. New-concept candidates
None.

### 5. Decline-overturn proposals
None. The recorded 1 Timothy declines touching this chapter all stand: wine and health (5:23, "a curiosity verse"); `prayer` on 5:5 (description of the true widow, not prayer teaching — Decision 11); `taming-the-tongue` on 5:13 (passing characterization — Decision 11).

### 6. Ceiling/subdivision markers
5 tags (under soft cap). Subdivided in the book doc (5:1–2 / 3–16 / 17–20 / 21–25) → flagged for the per-verse refinement pass.

**Considered, not added:** `aging-and-old-age` (5:1–2 teaches HOW to exhort older people — family-shaped correction — not the aging-with-faith register); `slander-and-false-accusation` (5:19 is due-process protection, single verse, carried by `church-discipline`); `pastoral-sexual-purity` (5:2 "in all purity", 5:22 "Keep yourself pure" — passing exhortations, not that pack's lust-crisis register; id given verbatim per the pastoral-prefix rule — the inventory's prefix-stripped spelling is not a legal tag); `drunkenness` (5:23 is the opposite register — medicinal wine — and the curiosity-verse decline stands); `good-works` (5:10, 25 mention good works as evidence/criteria, not teaching on them).

---

## 1 Timothy 6

**Prior-art tags (8 — HARD CEILING):** `contentment`, `generosity`, `gods-provision`, `second-coming`, `praise`, `false-teachers`, `bondservants-and-masters`, `backsliding`

### 1. Applied-tag deltas
- **KEEP** all eight — each independently re-verified against the pinned text (this chapter is also fixture-witnessed): 6:6 "But godliness with contentment is great gain."; 6:18 "that they be rich in good works, that they be ready to distribute, willing to share"; 6:17 "the living God, who richly provides us with everything to enjoy"; 6:14 "until the appearing of our Lord Jesus Christ"; 6:15–16 doxology; 6:3–5 the gain-seeking profile; 6:1–2 bondservants; 6:10, 21 the two wander-notes.
- **ADD** none — the chapter stands at the hard ceiling; candidates below were weighed and yielded per §11.6 (each with a Decisions-record entry).
- **DROP** none.

### 2. Anchor-extension candidates
| id | ref | WEB quote | weight |
|---|---|---|---|
| `generosity` | 1 Timothy 6:17-19 | "that they do good, that they be rich in good works, that they be ready to distribute, willing to share; laying up in store for themselves a good foundation against the time to come" | 0.6 — giver's-heart register; guardrail satisfied: hope set "on the living God" not riches, no return-arithmetic. VERSE OVERLAP: 6:17 is contentment's [torrey] 0.7 anchor — record in both files if taken (Rom 13:1-7 dual precedent). |
| `second-coming` | 1 Timothy 6:14-15 | "that you keep the commandment without spot, blameless until the appearing of our Lord Jesus Christ, which at the right time he will show" | 0.55 — the pack has no 1–2 Tim anchor; the "appearing" register (pairs with the 2 Tim 4:8 candidate) |
| `backsliding` | 1 Timothy 6:20-21 | "the empty chatter and oppositions of what is falsely called knowledge, which some profess, and thus have wandered from the faith" | 0.5 — the 6:21 wander-note is free (the 6:10 one stays inside contentment's 6:6-10 span per that pack's own cross-note) |

**Already anchored — no new proposals:** `contentment` → 1 Tim 6:6-10 (1.0) and 6:17 (0.7); `bondservants-and-masters` → 1 Tim 6:1-2 (0.9); `god-reigns` → 1 Tim 6:15 (0.8); `victory-in-christ` → 1 Tim 6:12 (0.65).

### 3. Lexicon candidates
- `contentment`: "money is the root of all evil"; "the love of money is the root of all evil" — the remembered misquote family: the pack's "love of money" ({love, money}) can never fire on the love-less form people actually type
- `generosity`: "rich in good works"
- **Open lexicon-routing question for the curator (not a new concept):** "guard the good deposit" / "guard what has been entrusted to you" (NIV-remembered forms of 6:20, WEB "guard that which is committed to you"; anchor texts 1 Tim 6:20 + 2 Tim 1:13-14) — real query family, no pack owns the phrase; nearest homes `studying-the-word` (sound-words register) or the corpus-blocked `contending-for-the-faith` row 35 (Jude register — do NOT duplicate; noted for that row's curator).

### 4. New-concept candidates
None.

### 5. Decline-overturn proposals
None. The recorded declines stand: contentment/love-of-money (6:6–10) covered by `contentment`; `temptation` on 6:9 stays the prior pass's recorded yield (thin-single-verse at ceiling) — no new evidence.

### 6. Ceiling/subdivision markers
**CEILING-MARKED: 8 tags.** Subdivided in the book doc (6:1–2 / 3–10 / 11–16 / 17–19 / 20–21) → priority chapter for the per-verse refinement pass (dropped-at-chapter-level material survives there as verse-ranged anchors).

**Considered, not added (yields at ceiling — Decisions record):** `money-and-possessions` (6:9-10, 17-19 is danger-of-riches-adjacent, but that pack's own recorded boundary keeps 1 Tim 6 with `contentment` — "1 Tim 6:6-10 and 6:17 stay contentment's"; adding the tag would also be broad-duplicating-specific at ceiling; NO anchor proposal either — it would violate the pack's recorded span discipline); `god-reigns` (6:15 — engine side already served by its existing anchor; display tag would duplicate `praise`'s doxology justification at ceiling); `victory-in-christ` (6:12 — already anchored; at ceiling); `eternal-life` (6:12, 19 — exhortational clauses; the standalone-pack question is recorded in salvation.yaml per the roster's additional notes; route, don't duplicate); `good-works` (6:18 — carried inside `generosity`'s justification).

---

## Decisions record — 1 Timothy sweep (2026-08-26)

Every yield and judgment call of this sweep, each a reversible default Jesse can overturn. No existing tag was dropped anywhere in this book; no recorded decline was overturned.

1. **`mercy` ADDED to ch. 1** — both-tags beside `grace-not-earned` on 1:13–16 (§11.2): distinct registers (compassion received vs. not-according-to-works), each independently clearing the presence bar; mercy is named twice with a stated display purpose. Chapter to 7 (above soft cap, under ceiling).
2. **`mediator` ADDED to ch. 2** — adopted display id; 2:5–6 is the concept's namesake text and load-bearing to the chapter's argument. Both-tags beside `jesus-the-only-way` (exclusivity vs. go-between registers). Engine side routes to corpus-blocked roster row 24 — display-only until PR-β.
3. **Ch. 3 and ch. 5 left without additions** after a full-vocabulary sweep — honest-and-empty over padding. Ch. 3 stays at 2 tags.
4. **`enjoying-gods-gifts` NOT tagged on ch. 4** (would be broad-duplicating-specific beside `thanksgiving` on the same 4:3–5 span at 8 tags); converted to an anchor-extension candidate with an EITHER/OR note against the same-span `thanksgiving` candidate — curator decides one home or a recorded dual.
5. **Ch. 6 yields at ceiling** (no adds, chapter at 8): `money-and-possessions` (that pack's own recorded boundary keeps 1 Tim 6 with `contentment` — no tag AND no anchor proposal); `god-reigns` and `victory-in-christ` (engine side already served by existing 1 Tim 6:15 / 6:12 anchors; display would duplicate `praise` / carried substance); `eternal-life` (exhortational clauses; standalone-pack question already recorded in salvation.yaml); `good-works` (carried inside `generosity`'s justification). The prior pass's `temptation` yield (6:9) stands.
6. **Considered-not-added, other chapters:** ch. 1 — `conscience` (register mismatch: pack is law-written-on-hearts), `legalism` (observation noted for roster row 43, not routed as a find), `satan`, `eternal-life`; ch. 4 — `holy-spirit`, `eternal-life`; ch. 5 — `aging-and-old-age`, `slander-and-false-accusation`, `pastoral-sexual-purity`, `drunkenness`, `good-works`. All prior-art recorded non-uses (book doc Decisions 3, 11, 15) re-checked and left standing — no new evidence.
7. **Anchor-proposal discipline:** no candidate re-anchors a span another pack's file claims by recorded boundary (checked in-file for contentment/money-and-possessions/enjoying-gods-gifts/backsliding); the two deliberate verse overlaps (the-cross↔jesus-the-only-way on 2:5-6; generosity↔contentment on 6:17) are flagged as record-in-both-files duals. Already-recorded riders/deferrals (incarnation 3:16; leadership 3:1-7; care-for-widows 5:3-8; caring-for-aging-parents 5:4+5:8; supporting-gospel-workers 5:17-18; backsliding 1:19-20+4:1-3) are confirmations, not new proposals.
8. **Corpus-blocked routing:** row 41 (`men-and-women-in-the-church`, 1 Tim 2:8–15) and row 24 (`mediator`, 1 Tim 2:5) — routed; row 35 (`contending-for-the-faith`) noted as a possible eventual home for the guard-the-deposit query family — noted for that row's curator, nothing duplicated; row 43 (`legalism`) — observation only.
9. **Doctrinal posture:** the ch. 2 paragraph (2:8–15) and 2:3–6 handled §4-neutral throughout (election-and-predestination precedent); ch. 6 money material framed by the text's own warning, no prosperity framing anywhere (DOCTRINAL-BASIS §3).
10. **Id spelling:** every id in this ledger validated verbatim against `engine-ids.txt` ∪ `adopted-161.txt` at write time; the pastoral-* prefix-stripping hazard in the scratchpad inventory was flagged mid-sweep by the coordinator — this ledger's one pastoral reference is written verbatim (`pastoral-sexual-purity`), and no stripped form appears.

## Survival audit — 1 Timothy ledger

Per CONVENTIONS §9: every block above was written as an atomic end-of-file append; after each append the file was re-read and verified — pre-existing bytes unchanged (sha256 prefix check), appended block present exactly once. Final audit at this Decisions-record append: all seven prior blocks (header + chapters 1–6) verified present and intact in the live file. No other file under /mnt/project-files was touched by this worker for this book.

---

## Erratum — 1 Timothy ledger (2026-08-26, fresh-critic pass)

Appended per CONVENTIONS §9 as one atomic end-of-file block; nothing above this line was altered. A fresh critic re-ran every mechanical check (quotes, ids, deltas, caps, schema, neutrality, roster routing — all pass) and sustained the items below, all in the anchor-candidate/citation layer. No applied-tag delta changes; every cited source was re-read in file for this erratum and is quoted byte-exactly.

1. **Ch. 2 §2 `praying-for-leaders` row RECLASSIFIED: new-find → confirmation.** The row proposed 1 Tim 2:1-2 at 0.95, framed it against the pack's anchor list ("yet the pack anchors only Jer 29:7 / Rom 13:1-7 / 1 Pet 2:13-17 / Ps 33:12"), and called it the "Strongest single anchor find of this book's sweep." The pack already knows this ref. `ontology/concepts/praying-for-leaders.yaml`'s own header records, byte-exact:
   ```
   # THE NAMING TEXT IS CORPUS-BLOCKED: 1 Tim 2:1-2 ("supplications … for kings
   # and all who are in high places" — Torrey KINGS: "Prayed for") is not in
   # pipeline/fixtures/web-subset.json. It is this concept's missing 1.0 anchor;
   # add it first when the corpus grows (backlog.md), likewise Prov 21:1.
   ```
   Corrections: (a) the row is a CONFIRMATION of an already-recorded pending anchor — the same confirm-at-re-pin class this ledger's own Decisions item 7 applies to incarnation 3:16, leadership 3:1-7, care-for-widows 5:3-8, etc. — not a new find, and the superlative is withdrawn; (b) 1 Tim 2 is outside the fixture corpus (this ledger's header witnesses only ch. 6 in `web-subset.json`), so the candidate is corpus-blocked queue-only, exactly as the pack header stages it via backlog.md; (c) weight ALIGNED to the pack's recorded intent: the pack names 1 Tim 2:1-2 as "this concept's missing 1.0 anchor," so the pack's own 1.0 figure governs at re-pin — the sweep's 0.95 was proposed without knowledge of the header note and is superseded.

2. **Ch. 6 "Considered, not added" and Decisions item 5 put quotation marks around a paraphrase.** Both render `money-and-possessions.yaml`'s recorded boundary as "1 Tim 6:6-10 and 6:17 stay contentment's" — the file contains no such string. The pack's actual wording, byte-exact (header comment):
   ```
   # The row's own rationale correction, honored as the design: contentment
   # DELIBERATELY owns the bare money tokens ("wealth", "money",
   # "finances", "debt") and the 1 Tim 6 / Matt 6 / Heb 13:5 anchors, so
   # the unserved register is the DANGER-OF-RICHES teaching — "can a rich
   # person be saved", the rich ruler, woe-to-the-rich. This pack is that
   # register, narrowly: multi-token danger phrasings only, ZERO shared
   # tokens with contentment's money vocabulary, and none of contentment's
   # anchors re-anchored (1 Tim 6:9's temptation-and-snare sits inside its
   # 6:6-10 span and stays there; cross-related).
   ```
   Restated unquoted: the pack's recorded design keeps the 1 Tim 6 anchors (contentment's 6:6-10 and 6:17) with `contentment` and re-anchors none of them — that sentence is this ledger's paraphrase, not the file's wording. The substance of the ch. 6 yield stands unchanged: no `money-and-possessions` tag on 1 Tim 6, and no anchor proposal.

3. **Ch. 2 §2 composite quote spliced two sources.** The row's parenthetical — (book doc: "this concept's source text; tagged on ch. 2") — attributes to the book doc a sentence that appears in neither source; it splices two separate records. Each source's actual wording, verbatim:
   - Book doc `/mnt/project-files/research/bible-rollout/1-timothy.md`, ch. 2 **Tags:** line (note the curly apostrophe in "concept’s"; the line continues with the chapter's other five tags):
     ```
     **Tags:** `praying-for-leaders` — this concept’s source text: prayers "for kings and all who are in high places, that we may lead a tranquil and quiet life" (2:1–2);
     ```
   - Tag-gaps decline record (`tag-gaps-review.md` §3, 1 Timothy row — identical in the sweep scratchpad's `declines-and-contested.md` extract; the file wraps after "tagged on"):
     ```
       → covered: `praying-for-leaders` ("this is its source text; tagged on
       ch. 2");
     ```
   Neither source contains the spliced form. The substance both records carry — 2:1-2 is the concept's source text, tagged on ch. 2 — is unchanged.

4. **Minor correction — ch. 1 §4 motif pairing.** That note pairs "wage the good warfare" / "fight the good fight" jointly with (1:18). In the pinned WEB (VPL `1TI` lines, re-verified byte-exact):
   ```
   1TI 1:18 I commit this instruction to you, my child Timothy, according to the prophecies which were given to you before, that by them you may wage the good warfare,
   1TI 6:12 Fight the good fight of faith. Take hold of the eternal life to which you were called, and you confessed the good confession in the sight of many witnesses.
   ```
   Corrected pairing: 1:18 reads "wage the good warfare"; "Fight the good fight of faith" is 6:12's wording — which is exactly why `victory-in-christ`'s existing anchor sits at 1 Tim 6:12. §4's conclusion (the motif has homes; no new concept) is unchanged.

5. **Caveat recorded, no change required — ch. 6 §3 misquote-family rationale is overstated.** The rationale claims the pack's "love of money" entry ({love, money}) "can never fire on the love-less form people actually type." True of that entry alone, but `contentment.yaml` also carries a deliberate single-token money entry, byte-exact (lexicon comment and entries):
   ```
     # prosperity family does not protect; "money" only reaches Matt 6:24 and
     # 1 Tim 6:10 through curation (the WEB says "Mammon").
     - wealth
     - money
     - finances
     - debt
   ```
   So the love-less misquote "money is the root of all evil" already reaches `contentment` through the single-token `money` entry; the proposed phrase aliases may still earn a place as full-phrase matches, but the "can never fire" claim is withdrawn. Recorded as a caveat for the alias-mining pass to measure, not assert.

**Corrected totals (1 Timothy):** tag deltas unchanged — 2 adds (`mercy`, `mediator`), 34 keeps, 0 drops. Anchor layer: 1 anchor row reclassified new-find → confirmation (`praying-for-leaders` 1 Tim 2:1-2), its weight aligned from the sweep's 0.95 to the pack's recorded 1.0 intent (the pack's own figure governs at re-pin); all other anchor rows stand as written. Lexicon counts unchanged (the item-5 caveat records no addition or removal).
