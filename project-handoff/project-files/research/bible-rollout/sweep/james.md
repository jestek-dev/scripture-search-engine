# James — Layer-3 tag-sweep ledger (Hebrews–Revelation group)

- Book: James (5 chapters)
- Date: 2026-08-26
- Repo: origin/main @ e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Pass: round 1 editor pass (SWEEP worker, editor role)
- Text source: pinned engwebp VPL snapshot (`engwebp_vpl.txt`, book code JAM), sha256-verified against `pipeline/manifests/web.json` per sweep-kit `web-access.md` (archive sha256 b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c)
- Vocabulary: 239 engine concept ids (YAML-basename rule) + adopted display-only ids per CONVENTIONS §11.1 (digest reconstruction)
- Prior art diffed: `/mnt/project-files/research/bible-rollout/james.md` (all 5 chapters subdivided). Display-only material throughout; nothing here creates a concept pack or affects ranking, `ENGINE_VERSION`, or the determinism identities (§11.7).

**Header addendum (2026-08-26, same pass):** per coordinator instruction mid-pass, the authoritative adopted-id list is the canonical `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md` (161 ids, engine-built markers), not the digest reconstruction. Cross-checked: every adopted id used or referenced in this ledger (`confession-of-sin`, `false-teachers`, `spiritual-adultery`, `gods-surprising-choice`, `new-birth`, `stewardship`, `inheritance`) appears in the canonical file with the expected engine-built status; no id corrections were required in any block of this ledger.

## James 1

### Deltas (applied tags)

Adds: none. Drops: none. Chapter stands at 8 tags — the §11.6 hard ceiling — every one kept.

- KEEP `testing` — "knowing that the testing of your faith produces endurance." (1:3)
- KEEP `obedience-to-the-word` — "But be doers of the word, and not only hearers, deluding your own selves." (1:22)
- KEEP `wisdom-from-god` — "But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach" (1:5)
- KEEP `doubt` — "he who doubts is like a wave of the sea, driven by the wind and tossed" (1:6)
- KEEP `remembered-joy-in-trials` — "Count it all joy, my brothers, when you fall into various temptations" (1:2)
- KEEP `self-deception` — "deluding your own selves" (1:22); "but deceives his heart" (1:26)
- KEEP `temptation` — "But each one is tempted when he is drawn away by his own lust and enticed." (1:14)
- KEEP `care-for-widows` — "to visit the fatherless and widows in their affliction" (1:27)

### Anchor-extension candidates

- `testing` — James 1:2–3 — "knowing that the testing of your faith produces endurance." — proposed weight 0.85 (pack currently anchors 1 Peter 1:6–7 and Hebrews 11:17 but no James text; 1:2–3 is the letter's own testing thesis).

### Lexicon candidates

- `doubt` — proposed terms: "double-minded"; "ask in faith without doubting" — queries a user would type: "what does double minded mean in james"; "double minded man unstable in all his ways"; "doubting when I pray".
- `self-control` — proposed terms: "slow to speak"; "the anger of man" — queries: "slow to speak slow to anger verse"; "what does the bible say about my anger"; "anger of man does not produce righteousness". CAUTION recorded: the engine id `slow-to-anger` owns the phrase "slow to anger" for God's patience (the Nahum-register scoping; the Proverbs §3.2 decline routed the human virtue to `self-control`) — the proposed terms deliberately avoid the bare phrase "slow to anger" to prevent a routing collision.

### New-concept candidates

none — the chapter's themes all resolve to existing ids (human anger routed to `self-control` per the Proverbs §3.2 precedent, not minted).

### Decline-overturn proposals

none

### Decisions record

- Chapter at the hard ceiling (8); four candidates considered and NOT added, each yielding per the §11.6 order:
  1. `heavenly-reward` (1:12 "he will receive the crown of life which the Lord promised to those who love him") — yields as thin single-verse; the pack already anchors James 1:12, so search is served without the tag.
  2. `gods-unchanging-nature` (1:17 "with whom can be no variation nor turning shadow") — yields as thin single-verse; pack already anchors James 1:17.
  3. `taming-the-tongue` (1:19 "slow to speak"; 1:26 "doesn’t bridle his tongue") — yields as thin (two brief touches; the concept's teaching chapter is James 3, which carries the tag); pack already anchors James 1:19.
  4. `joy-in-the-lord` (1:2) — yields as broad-duplicating-specific: `remembered-joy-in-trials` already carries the exact 1:2–4 span; pack already anchors James 1:2.
- No existing tag dropped; all 8 independently clear the presence bar (each verified against the pinned VPL above).

### Per-verse refinement

PER-VERSE REFINEMENT: yes (both) — chapter sits at the hard ceiling of 8, and the book doc subdivides James 1 (4 sections).

## James 2

### Deltas (applied tags)

Adds: 1. Drops: none. Chapter moves 4 → 5 tags (within the soft cap).

- ADD `mercy` — "For judgment is without mercy to him who has shown no mercy. Mercy triumphs over judgment." (2:13). Honest substantial presence: 2:12–13 is direct teaching that shown mercy is required and triumphant, and `mercy.yaml` already anchors James 2:13 — the display tag catches the doc up to the pack's own claim. Applied beside `divine-judgment` per the §11.2 both-tags ruling (each clears the bar on its own half of 2:12–13).
- KEEP `faith-and-works` — "even so faith apart from works is dead." (2:26)
- KEEP `loving-others` — "You shall love your neighbor as yourself" (2:8)
- KEEP `divine-judgment` — "So speak and so do as men who are to be judged by the law of freedom." (2:12)
- KEEP `favoritism` — "haven’t you shown partiality among yourselves, and become judges with evil thoughts?" (2:4)

### Anchor-extension candidates

- `loving-others` — James 2:8 — "However, if you fulfill the royal law according to the Scripture, “You shall love your neighbor as yourself,” you do well." — proposed weight 0.8 (pack anchors 1 John and 1 Peter texts but no James; 2:8 is the royal-law statement its "love your neighbor" lexicon term would expect to reach).

### Lexicon candidates

- `faith-and-works` — proposed terms: "the demons also believe"; "dead faith without works" — queries: "demons believe and tremble meaning"; "is belief enough to be saved"; "james 2 faith without works".

### New-concept candidates

none

### Decline-overturn proposals

none

### Decisions record

- `judging-others` on 2:12–13 — considered and NOT added, standing by the book doc's recorded call (Decisions #12/#13 there): 2:12–13 concerns being judged, carried by `divine-judgment`; James 4 carries the concept's teaching.
- `justice-and-oppression` on 2:6–7 — considered and NOT added, standing by the book doc's recorded call: a two-verse diagnosis inside the favoritism argument, carried by `favoritism`; the refs already ride the tag-gaps `justice-and-oppression` append.
- `money-and-possessions` on 2:5–7 — considered and NOT added: the rich-poor material here serves the favoritism argument; the concept's own James anchor is 5:1–3 (tagged on ch 5 below). Thin here.
- ROUTED (corpus-blocked roster row 21, `gods-surprising-choice`): 2:5 "Didn’t God choose those who are poor in this world to be rich in faith and heirs of the Kingdom" matches that row's God-chooses-the-unlikely register — recorded against row 21 (which is gated on the one-design ruling with `god-looks-at-the-heart` + `humble-exaltation`), NOT logged as a new candidate and NOT tagged (single verse inside the favoritism argument).

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc) — 5 tags, ceiling not hit; James 2 subdivided (2 sections).

## James 3

### Deltas (applied tags)

Adds: none. Drops: none. Chapter stands at 4 tags.

- KEEP `taming-the-tongue` — "but nobody can tame the tongue. It is a restless evil, full of deadly poison." (3:8)
- KEEP `wisdom-from-god` — "But the wisdom that is from above is first pure, then peaceful, gentle, reasonable, full of mercy and good fruits" (3:17)
- KEEP `envy-and-jealousy` — "For where jealousy and selfish ambition are, there is confusion and every evil deed." (3:16)
- KEEP `image-of-god` — "and with it we curse men who are made in the image of God" (3:9)

### Anchor-extension candidates

- `wisdom-from-god` — James 3:17 — "But the wisdom that is from above is first pure, then peaceful, gentle, reasonable, full of mercy and good fruits, without partiality, and without hypocrisy." — proposed weight 0.9 (pack anchors James 1:5 only in this book; 3:13–18 is Scripture's two-wisdoms contrast and the natural landing for "wisdom" queries beyond asking).

### Lexicon candidates

- `wisdom-from-god` — proposed terms: "wisdom from above"; "earthly wisdom" — queries: "wisdom from above meaning"; "godly wisdom vs worldly wisdom"; "two kinds of wisdom in james".
- `taming-the-tongue` — proposed term: "the tongue is a fire" — queries: "the tongue is a fire meaning"; "james 3 tongue"; "why are words so destructive".

### New-concept candidates

none

### Decline-overturn proposals

none

### Decisions record

- `hell` on 3:6 ("set on fire by Gehenna") — considered and NOT added: one clause of imagery about the tongue's origin, not teaching about hell; presence bar fails. Noted (not proposed) that `hell`'s lexicon already carries "gehenna", so the verse is lexically reachable without any change.
- `harmony-with-others` on 3:17–18 ("sown in peace by those who make peace") — considered and NOT added: the peace material is a property of the wisdom being taught, carried by `wisdom-from-god`; thin.
- `honesty` on 3:14 ("don’t lie against the truth") — considered and NOT added: single clause, not honesty teaching.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc) — 4 tags, ceiling not hit; James 3 subdivided (2 sections).

## James 4

### Deltas (applied tags)

Adds: none. Drops: none. Chapter stands at 7 tags (above the soft cap of 6, under the ceiling; every tag independently clears the bar, per the book doc's ratified history).

- KEEP `humble-exaltation` — "God resists the proud, but gives grace to the humble." (4:6); "Humble yourselves in the sight of the Lord, and he will exalt you." (4:10)
- KEEP `resisting-the-devil` — "Resist the devil, and he will flee from you." (4:7)
- KEEP `love-not-the-world` — "friendship with the world is hostility toward God" (4:4)
- KEEP `prayer` — "You don’t have, because you don’t ask." (4:2)
- KEEP `asking-in-gods-will` — "You ask, and don’t receive, because you ask with wrong motives" (4:3); "If the Lord wills, we will both live, and do this or that." (4:15)
- KEEP `stewardship-of-days` — "For you are a vapor that appears for a little time and then vanishes away." (4:14)
- KEEP `judging-others` — "But who are you to judge another?" (4:12)

### Anchor-extension candidates

- `humble-exaltation` — James 4:6 — "But he gives more grace. Therefore it says, “God resists the proud, but gives grace to the humble.”" — proposed weight 0.9 (pack anchors James 4:10 and 1 Peter 5:6; 4:6 is the quoted Proverbs axiom itself and the lexicon's "god resists the proud" source text in this letter).
- `stewardship-of-days` — James 4:14 — "For what is your life? For you are a vapor that appears for a little time and then vanishes away." — proposed weight 0.8 (pack anchors Hebrews 6:12 only in these books; 4:13–17 is the letter's numbering-your-days text, already the tag's ground here).

### Lexicon candidates

- `asking-in-gods-will` — proposed terms: "if the lord wills"; "making plans without god" — queries: "what does if the Lord wills mean"; "should I say God willing"; "planning for the future bible".

### New-concept candidates

none

### Decline-overturn proposals

none

### Decisions record

- `presence-of-god` on 4:8 ("Draw near to God, and he will draw near to you.") — considered and NOT added: thin single-verse inside the command cascade, and the chapter is already above the soft cap; the pack already anchors James 4:8, so the famous verse is served. Yields as thin single-verse.
- `repentance` on 4:8–10 ("Cleanse your hands, you sinners. Purify your hearts, you double-minded."; "Lament, mourn, and weep.") — considered and NOT added: a genuine repentance summons, but its span is the same 4:6–10 movement `humble-exaltation` carries, and the chapter is above the soft cap. Yields as broad-duplicating-specific; flagged for the ROUND-2 critic as the chapter's closest call.
- `covetousness` on 4:2 ("You murder and covet, and can’t obtain.") — considered and NOT added: single word-match inside the quarrel diagnosis, not covetousness teaching; the pack already anchors James 4:1–2.
- `envy-and-jealousy` on 4:5 ("The Spirit who lives in us yearns jealously") — NOT added, per the Zechariah precedent recorded in §3.5: divine jealousy must not be routed to the human-vice concept.
- ROUTED (corpus-blocked roster row 2, `spiritual-adultery`): 4:4 "You adulterers and adulteresses, don’t you know that friendship with the world is hostility toward God?" — the roster row itself names Jas 4:4 as the concept's only honest in-corpus anchor. Recorded against row 2; NOT duplicated as a candidate, and the chapter's display coverage stays with `love-not-the-world`.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc) — 7 tags, ceiling not hit; James 4 subdivided (3 sections).

## James 5

### Deltas (applied tags)

Adds: 1. Drops: none. Chapter moves 7 → 8 tags — the hard ceiling; every tag independently clears the bar.

- ADD `money-and-possessions` — "Your gold and your silver are corroded, and their corrosion will be for a testimony against you and will eat your flesh like fire. You have laid up your treasure in the last days." (5:3); "You have lived in luxury on the earth, and taken your pleasure." (5:5). Honest substantial presence: 5:1–6 is the letter's woe-to-the-rich indictment — hoarded, rotting wealth as testimony — which is the concept's own register ("danger of riches", "woe to the rich"), and `money-and-possessions.yaml` already anchors James 5:1–3. Applied beside `justice-and-oppression` per §11.2: that tag carries the defrauded-wages oppression half (5:4–6), this one the hoarded-riches half (5:1–3, 5); each clears the bar on its own material. Kept strictly descriptive per the book doc's Decisions #9 (no prosperity framing, no class polemic).
- KEEP `pastoral-prayer-for-healing` — "and the prayer of faith will heal him who is sick, and the Lord will raise him up" (5:15)
- KEEP `prayer` — "The insistent prayer of a righteous person is powerfully effective." (5:16)
- KEEP `second-coming` — "Be patient therefore, brothers, until the coming of the Lord." (5:7)
- KEEP `divine-judgment` — "Behold, the judge stands at the door." (5:9)
- KEEP `do-not-lose-heart` — "You also be patient. Establish your hearts, for the coming of the Lord is at hand." (5:8); "You have heard of the perseverance of Job" (5:11)
- KEEP `justice-and-oppression` — "Behold, the wages of the laborers who mowed your fields, which you have kept back by fraud, cry out; and the cries of those who reaped have entered into the ears of the Lord of Armies." (5:4)
- KEEP `oaths-and-vows` — "but let your “yes” be “yes”, and your “no”, “no”, so that you don’t fall into hypocrisy." (5:12)

### Anchor-extension candidates

- `second-coming` — James 5:7–8 — "Be patient therefore, brothers, until the coming of the Lord."; "for the coming of the Lord is at hand." — proposed weight 0.85 (pack anchors Revelation 1:7 and 1 John 3:2–3 in these books; 5:7–8 is the NT's wait-for-the-coming patience text).
- `do-not-lose-heart` — James 5:10–11 — "Take, brothers, for an example of suffering and of perseverance, the prophets who spoke in the name of the Lord."; "You have heard of the perseverance of Job" — proposed weight 0.75 (pack anchors Hebrews 10:35; the Job example is the keep-going register's classic exemplar text).

### Lexicon candidates

- `pastoral-prayer-for-healing` — proposed terms: "anointing with oil"; "call for the elders" — queries: "anointing the sick with oil"; "elders praying over the sick"; "james 5 prayer of faith".
- `do-not-lose-heart` — proposed term: "the patience of Job" — queries: "patience of Job meaning"; "endurance of Job"; "examples of perseverance in the bible". (Fits the Hebrews-delivery endurance ruling: the keep-going query family lives on this pack and `remembered-joy-in-trials`; this is lexicon tuning on the existing home, not a new row.)

### New-concept candidates

none — a plain `patience` id was considered (James 5:7–11 teaches it sustainedly, and the Ecclesiastes §3.5 note pointed a would-be patience gap at James) and NOT proposed: the Hebrews delivery's withheld-`endurance` ruling found the query family has honest homes (`do-not-lose-heart` the keep-going register; `remembered-joy-in-trials` carrying bare "patience" and "perseverance"), and the Revelation delivery applied the same disposition for consistency. James's refs are recorded here as the lexicon candidate above instead.

### Decline-overturn proposals

none — the coordinator-ruled drop of `pastoral-relapse-and-restoration` from 5:19–20 (book doc Decisions #5: restorer-facing exhortation, not the fallen person's crisis register) stands; this pass found no new textual evidence against it.

### Decisions record

- Candidates exceeding the ceiling — yields, per the §11.6 order:
  1. `confession-of-sin` (adopted display id; 5:16 "Confess your sins to one another and pray for one another, that you may be healed.") — genuine presence but thin single-verse; yields to the ceiling behind `money-and-possessions` (three-verse indictment in the concept's own register). Its verse remains carried by `pastoral-prayer-for-healing` and `prayer` on the same span. Recorded, not silently dropped.
  2. `grumbling-and-complaining` (5:9 "Don’t grumble, brothers, against one another, so that you won’t be judged.") — thin single-verse; the pack already anchors James 5:9, so search is served without the tag.
- `mercy` on 5:11 ("the Lord is full of compassion and mercy") — considered and NOT added: single descriptive clause inside the Job example, not mercy teaching; ch 2 carries the book's mercy tag.
- `judging-others` on 5:9 — stands NOT added per the book doc's post-audit call (its Decisions #13: single verse whose judged-at-the-door substance `divine-judgment` carries on the same verse).

### Per-verse refinement

PER-VERSE REFINEMENT: yes (both) — chapter hits the hard ceiling of 8, and the book doc subdivides James 5 (4 sections).

## Book totals

- Applied-tag deltas: 2 adds (`mercy` ch 2; `money-and-possessions` ch 5), 0 drops, 30 keeps (8 + 4[+1] + 4 + 7 + 7[+1] = chapter totals 8/5/4/7/8).
- Anchor-extension candidates: 7 (`testing` 1:2–3; `loving-others` 2:8; `wisdom-from-god` 3:17; `humble-exaltation` 4:6; `stewardship-of-days` 4:14; `second-coming` 5:7–8; `do-not-lose-heart` 5:10–11).
- Lexicon candidates: 7 entries across 6 concepts (`doubt`, `self-control` ch 1; `faith-and-works` ch 2; `wisdom-from-god`, `taming-the-tongue` ch 3; `asking-in-gods-will` ch 4; `pastoral-prayer-for-healing`, `do-not-lose-heart` ch 5 — 8 concept-entries total).
- New-concept candidates: none (honest-and-empty; `patience` considered and routed to the endurance-withholding precedent, human anger routed to `self-control` per the Proverbs precedent).
- Decline-overturn proposals: none.
- Ceiling-marked chapters: James 1 (8, pre-existing), James 5 (8, after add).
- Routed items: 2 — James 2:5 → corpus-blocked roster row 21 (`gods-surprising-choice`); James 4:4 → roster row 2 (`spiritual-adultery`).
- Vocabulary check: all tag ids above resolve against the 239-id engine census or the canonical adopted-concepts.md; `confession-of-sin` (yielded, not applied) is adopted display-only (engine-built: no).

## Round 2 — corrections (2026-08-26)

Critic round 1 raised 2 objections against this ledger, both minor bookkeeping. Per CONVENTIONS §9 this section is an append-only correction: no existing bytes were rewritten, and where this section conflicts with the lines it corrects, THIS SECTION GOVERNS. Everything else in the ledger stands as written.

1. **Book totals — lexicon count corrected.** The Book totals line opening "Lexicon candidates: 7 entries across 6 concepts" is wrong; the mechanical recount is **8 entries across 8 distinct concepts** — ch 1 `doubt`, `self-control`; ch 2 `faith-and-works`; ch 3 `wisdom-from-god`, `taming-the-tongue`; ch 4 `asking-in-gods-will`; ch 5 `pastoral-prayer-for-healing`, `do-not-lose-heart` — consistent with that same line's own closing tail ("8 concept-entries total"). Read the line as: "Lexicon candidates: 8 entries across 8 concepts."

2. **Header addendum — adopted-id list restated for this ledger.** The header addendum's seven-id list ("confession-of-sin, false-teachers, spiritual-adultery, gods-surprising-choice, new-birth, stewardship, inheritance") was the cross-check set for the pass's THREE ledgers, not this file: `false-teachers`, `new-birth`, `stewardship`, and `inheritance` occur nowhere in james.md (they belong to the 1-peter.md / 2-peter.md ledgers), and the addendum omitted `god-looks-at-the-heart` (adopted, engine-built: no), which IS referenced in this ledger's James 2 Decisions record (the row-21 routing note's one-design ruling). Corrected statement: the adopted ids actually used or referenced in james.md are **`confession-of-sin`, `gods-surprising-choice`, `spiritual-adultery`, `god-looks-at-the-heart`** — each verified present in the canonical `tag-apply/adopted-concepts.md` with engine-built: no, and none applied as a tag in this ledger. The seven-id cross-check across all three ledgers also ran clean; its full accounting lives in the respective book ledgers.

No other line of this ledger is affected; all deltas, quotes, caps, routings, and decline dispositions stand.
