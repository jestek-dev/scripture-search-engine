# 1 Peter — Layer-3 tag-sweep ledger (Hebrews–Revelation group)

- Book: 1 Peter (5 chapters)
- Date: 2026-08-26
- Repo: origin/main @ e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Pass: round 1 editor pass (SWEEP worker, editor role)
- Text source: pinned engwebp VPL snapshot (`engwebp_vpl.txt`, book code 1PE), sha256-verified against `pipeline/manifests/web.json` per sweep-kit `web-access.md` (archive sha256 b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c)
- Vocabulary: 239 engine concept ids (YAML-basename rule) + adopted display-only ids per the canonical `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md` (161 ids; coordinator instruction 2026-08-26)
- Prior art diffed: `/mnt/project-files/research/bible-rollout/1-peter.md` (all 5 chapters subdivided). Display-only material throughout; nothing here creates a concept pack or affects ranking, `ENGINE_VERSION`, or the determinism identities (§11.7).

## 1 Peter 1

### Deltas (applied tags)

Adds: 1. Drops: none. Chapter moves 7 → 8 tags — the hard ceiling; every tag independently clears the bar.

- ADD `joy-in-the-lord` — "In this you greatly rejoice, though now for a little while, if need be, you have been grieved in various trials" (1:6); "yet believing, you rejoice greatly with joy that is unspeakable and full of glory" (1:8). Honest substantial presence: rejoicing amid grief in the unseen Christ is one of the chapter's movements, `joy-in-the-lord.yaml` already anchors 1 Peter 1:8, and its lexicon carries "joy unspeakable". This restores the tag the book doc's Decisions #12 removed purely for density under the superseded 6-tag cap (it swapped in `salvation`); under §11.6's 8-ceiling both fit, and the removal ground no longer exists.
- KEEP `hope-in-god` — "caused us to be born again to a living hope through the resurrection of Jesus Christ from the dead" (1:3)
- KEEP `holiness` — "but just as he who called you is holy, you yourselves also be holy in all of your behavior" (1:15)
- KEEP `testing` — "that the proof of your faith, which is more precious than gold that perishes, even though it is tested by fire, may be found to result in praise, glory, and honor at the revelation of Jesus Christ" (1:7)
- KEEP `the-cross` — "but with precious blood, as of a lamb without blemish or spot, the blood of Christ" (1:19)
- KEEP `resurrection` — "who raised him from the dead and gave him glory, so that your faith and hope might be in God" (1:21)
- KEEP `salvation` — "receiving the result of your faith, the salvation of your souls" (1:9)
- KEEP `power-of-gods-word` — "but the Lord’s word endures forever." (1:25)

### Anchor-extension candidates

- `salvation` — 1 Peter 1:8–9 — "receiving the result of your faith, the salvation of your souls." — proposed weight 0.8; and 1 Peter 1:3, 23 ("caused us to be born again to a living hope"; "having been born again, not of corruptible seed, but of incorruptible, through the word of God") — proposed weight 0.8. The 1:3, 23 halves are exactly the anchor/lexicon-extension candidates the §3.4 withheld `born-again` staging recorded for this pack ("at most 1 Peter 1:3, 23 are anchor/lexicon-extension candidates"); logged here as that record instructs, since salvation.yaml owns the born-again phrasing.
- `resurrection` — 1 Peter 1:3 — "born again to a living hope through the resurrection of Jesus Christ from the dead" — proposed weight 0.85 (pack's only sweep-book anchor is 1 John 1:1-2; 1:3 is the NT's resurrection-grounds-hope statement).
- `election-and-predestination` — 1 Peter 1:1–2 — "to the chosen ones" (1:1); "according to the foreknowledge of God the Father" (1:2) — proposed weight 0.75 (the pack's roster note already reserves 1 Thess 1:4 for the re-pin; 1 Pet 1:2 is the same chosen-by-foreknowledge register).

### Lexicon candidates

- `testing` — proposed term: "faith more precious than gold" — queries: "faith tested by fire verse"; "trials refine faith like gold"; "why is God testing my faith".

### New-concept candidates

none

### Decline-overturn proposals

none

### Decisions record

- Candidates exceeding the ceiling — yields, per the §11.6 order:
  1. `sojourners-and-strangers` (1:1 "who are living as foreigners in the Dispersion"; 1:17 "pass the time of your living as foreigners here in reverent fear") — genuine framing of the whole letter, but two brief touches in this chapter; yields as thin. The pack already anchors 1 Peter 1:17, so search is served; the book doc's staged tag-gaps append (1:1, 17; 2:11) already carries the refs.
  2. `election-and-predestination` (1:2) — greeting-formula register, thin; yields as thin single-verse. Recorded as the anchor-extension candidate above instead.
  3. `trinity` (1:2 Father / Spirit / Jesus Christ triad) — thin single-verse; the pack already anchors 1 Peter 1:2.
  4. `new-birth` (adopted display-only id; 1:3, 23 "born again") — NOT applied: the §3.4 withheld-staging record stands (salvation.yaml owns the born-again phrasing; new-creation.yaml's header leaves the phrase to `salvation`), the sitting `salvation` and `hope-in-god` tags carry both verses, and the chapter is at ceiling. Recorded, not silently dropped.
- `mercy` on 1:3 ("according to his great mercy") — considered and NOT added: single prepositional clause, not mercy teaching.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (both) — chapter hits the hard ceiling of 8, and the book doc subdivides 1 Peter 1 (4 sections).

## 1 Peter 2

### Deltas (applied tags)

Adds: 1. Drops: none. Chapter moves 6 → 7 tags (above the soft cap, under the ceiling; every tag independently clears the bar).

- ADD `priesthood` — "You also as living stones are built up as a spiritual house, to be a holy priesthood, to offer up spiritual sacrifices, acceptable to God through Jesus Christ." (2:5); "But you are a chosen race, a royal priesthood, a holy nation" (2:9). Honest substantial presence: the priesthood-of-believers teaching is stated twice as the chapter's identity architecture, `priesthood.yaml` already anchors BOTH 1 Peter 2:5 and 2:9, and its lexicon carries "royal priesthood". Applied beside `identity-in-christ` per §11.2 — that tag carries the chosen-people identity broadly; this one the priestly-office register the pack claims by anchor.
- KEEP `christ-the-cornerstone` — "Behold, I lay in Zion a chief cornerstone, chosen and precious. He who believes in him will not be disappointed." (2:6)
- KEEP `identity-in-christ` — "But you are a chosen race, a royal priesthood, a holy nation, a people for God’s own possession" (2:9)
- KEEP `suffering-for-christ` — "But if when you do well, you patiently endure suffering, this is commendable with God." (2:20)
- KEEP `the-cross` — "He himself bore our sins in his body on the tree, that we, having died to sins, might live to righteousness. You were healed by his wounds." (2:24)
- KEEP `spiritual-growth` — "as newborn babies, long for the pure spiritual milk, that with it you may grow" (2:2)
- KEEP `praying-for-leaders` — "Therefore subject yourselves to every ordinance of man for the Lord’s sake" (2:13); "Honor all men. Love the brotherhood. Fear God. Honor the king." (2:17) (kept with the book doc's Decisions #13 caveat: the pack claims this passage's submit/honor teaching by design; the chapter contains no prayer-for-rulers command)
- KEEP (implicit, per book-doc history) — no other sitting tags.

### Anchor-extension candidates

- `sojourners-and-strangers` — 1 Peter 2:11 — "Beloved, I beg you as foreigners and pilgrims to abstain from fleshly lusts which war against the soul" — proposed weight 0.8 (the pack's lexicon carries "strangers and pilgrims"; its 1 Peter anchor is 1:17 only — 2:11 is the letter's direct address in exactly that register).
- `shepherds-and-the-flock` — 1 Peter 2:25 — "For you were going astray like sheep; but now you have returned to the Shepherd and Overseer of your souls." — proposed weight 0.7 (the God-as-shepherd register; pack anchors 1 Peter 5:2–3 only in this book).

### Lexicon candidates

- `identity-in-christ` — proposed terms: "a people for god’s own possession"; "called out of darkness into his marvelous light" — queries: "chosen race royal priesthood meaning"; "called out of darkness verse"; "who am I in Christ 1 peter 2:9".

### New-concept candidates

none

### Decline-overturn proposals

none

### Decisions record

- `sojourners-and-strangers` as a ch 2 tag (2:11) — considered and NOT added: thin single-verse of address in this chapter; recorded as the anchor-extension candidate above instead (chapter already above the soft cap).
- `slander-and-false-accusation` (2:12 "they speak against you as evildoers"; 2:23 "When he was cursed, he didn’t curse back.") — considered and NOT added: the slandered-believer material is carried by `suffering-for-christ` and the pack already anchors 1 Peter 2:23; adding would push the chapter to the ceiling on a register its anchors already serve. Yields as theme-witness-with-caveat.
- `bondservants-and-masters` (2:18 "Servants, be in subjection to your masters with all respect, not only to the good and gentle, but also to the wicked.") — considered and NOT added: genuine single-verse instruction whose endure-unjust-suffering substance (2:19–20) the sitting `suffering-for-christ` tag carries; the concept's household-code teaching chapters are the Pauline tables. Flagged for the round-2 critic as this chapter's closest call.
- `envy-and-jealousy` (2:1 "envies" in the put-away list) — NOT added: catalog mention; the pack's existing 1 Peter 2:1–2 anchor already serves it.
- `honesty` (2:12 good behavior among the nations) — NOT added: conduct-witness register, not honesty teaching; pack already anchors 1 Peter 2:11–12.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc) — 7 tags, ceiling not hit; 1 Peter 2 subdivided (3 sections).

## 1 Peter 3

### Deltas (applied tags)

Adds: none. Drops: none. Chapter stands at 7 tags (above the soft cap, under the ceiling; every tag independently clears the bar).

- KEEP `godly-marriage` — "In the same way, wives, be in subjection to your own husbands" (3:1); "You husbands, in the same way, live with your wives according to knowledge, giving honor to the woman as to the weaker vessel, as also being joint heirs of the grace of life" (3:7)
- KEEP `suffering-for-christ` — "But even if you should suffer for righteousness’ sake, you are blessed." (3:14)
- KEEP `sharing-your-faith` — "Always be ready to give an answer to everyone who asks you a reason concerning the hope that is in you" (3:15)
- KEEP `harmony-with-others` — "Finally, all of you be like-minded, compassionate, loving as brothers, tenderhearted, courteous" (3:8)
- KEEP `the-cross` — "Because Christ also suffered for sins once, the righteous for the unrighteous, that he might bring you to God" (3:18)
- KEEP `baptism` — "This is a symbol of baptism, which now saves you—not the putting away of the filth of the flesh, but the answer of a good conscience toward God—through the resurrection of Jesus Christ" (3:21)
- KEEP `giving-an-answer` — "Always be ready to give an answer to everyone who asks you a reason concerning the hope that is in you, with humility and fear" (3:15)

### Anchor-extension candidates

- `harmony-with-others` — 1 Peter 3:8–9 — "Finally, all of you be like-minded, compassionate, loving as brothers, tenderhearted, courteous, not rendering evil for evil or insult for insult; but instead blessing" — proposed weight 0.85 (the pack currently records no anchor in these books; 3:8–9 is a direct like-mindedness/non-retaliation command matching its "live at peace with everyone" lexicon).
- `the-cross` — 1 Peter 3:18 — "Because Christ also suffered for sins once, the righteous for the unrighteous, that he might bring you to God" — proposed weight 0.85 (pack anchors 1 Peter 1:18–19 and 2:24; 3:18 is the letter's third substitution statement and a classic "christ died for us" landing).
- `fear-not` — 1 Peter 3:14 — "“Don’t fear what they fear, neither be troubled.”" — proposed weight 0.7 (the do-not-fear charge to slandered believers; pack anchors 1 John 4:18 and Hebrews 13:6 in these books).

### Lexicon candidates

- `godly-marriage` — proposed terms: "gentle and quiet spirit"; "unbelieving husband" — queries: "gentle and quiet spirit meaning"; "married to an unbeliever bible"; "won without a word 1 peter 3".

### New-concept candidates

none — the disputed 3:19–21 spirits-in-prison crux was checked and deliberately NOT proposed as a concept: any gist would have to adjudicate between readings the text leaves open (the book doc's Decisions #2 handles it descriptively), and covenant #6 bars the engine from adjudicating; the passage's search traffic ("who are the spirits in prison") is a curiosity register already reachable via `baptism`'s 3:21 anchor.

### Decline-overturn proposals

none

### Decisions record

- `slander-and-false-accusation` (3:16 "while you are spoken against as evildoers, they may be disappointed who curse your good way of life in Christ") — considered and NOT added: the pack already anchors 1 Peter 3:16 itself; single-verse presence carried by `suffering-for-christ` + `giving-an-answer` on the same span. Yields as thin single-verse.
- `blessing` (3:9 "that you may inherit a blessing") — stands NOT added per the book doc's Decisions #10 (brief; prosperity guardrail).
- `resurrection` (3:21 "through the resurrection of Jesus Christ"; 3:18 "made alive in the Spirit") — considered and NOT added: subordinate clauses inside the baptism/suffering teaching, carried by `baptism` and `the-cross`.
- `taming-the-tongue` (3:10 "let him keep his tongue from evil") — NOT added: quoted-psalm clause, not the chapter's teaching substance.
- Both `sharing-your-faith` and `giving-an-answer` remain on the same 3:15 span per the §11.2 both-tags ruling and the book doc's recorded register split (evangelism charge vs the apologia manner); no consolidation proposed.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc) — 7 tags, ceiling not hit; 1 Peter 3 subdivided (3 sections).

## 1 Peter 4

### Deltas (applied tags)

Adds: 1. Drops: none. Chapter moves 6 → 7 tags (above the soft cap, under the ceiling; every tag independently clears the bar). (Note: the sweep-kit book-doc inventory lists `suffering-for-christ` twice for this chapter; the book doc's Tags line carries it once — treated as 6 sitting tags.)

- ADD `glory-of-god` — "that in all things God may be glorified through Jesus Christ, to whom belong the glory and the dominion forever and ever" (4:11); "but let him glorify God in this matter" (4:16). Honest substantial presence: glorifying God in all things is the chapter's stated aim for both service (4:11) and suffering (4:16), matching the pack's "glorify god in everything / living for gods glory" lexicon register; its only current anchor in these books is Revelation 21:23.
- KEEP `suffering-for-christ` — "But if one of you suffers for being a Christian, let him not be ashamed" (4:16); "But because you are partakers of Christ’s sufferings, rejoice" (4:13)
- KEEP `loving-others` — "And above all things be earnest in your love among yourselves, for love covers a multitude of sins." (4:8)
- KEEP `spiritual-gifts` — "As each has received a gift, employ it in serving one another, as good managers of the grace of God in its various forms." (4:10)
- KEEP `hospitality` — "Be hospitable to one another without grumbling." (4:9)
- KEEP `divine-judgment` — "For the time has come for judgment to begin with the household of God." (4:17)
- KEEP `why-god-allows-suffering` — "Therefore let them also who suffer according to the will of God in doing good entrust their souls to him, as to a faithful Creator." (4:19)

### Anchor-extension candidates

- `glory-of-god` — 1 Peter 4:11 — "that in all things God may be glorified through Jesus Christ, to whom belong the glory and the dominion forever and ever." — proposed weight 0.8 (see the add above).
- `divine-judgment` — 1 Peter 4:17 — "For the time has come for judgment to begin with the household of God." — proposed weight 0.75 (a distinct judgment-begins-at-home register no current anchor in these books carries; heavy query phrase "judgment begins with the house of God").

### Lexicon candidates

- `loving-others` — proposed term: "love covers a multitude of sins" — queries: "love covers a multitude of sins meaning"; "love covers sins verse"; "overlooking an offense bible". (The pack anchors 1 Peter 4:8 already but its lexicon does not carry the phrase.)

### New-concept candidates

none — the disputed 4:6 ("the Good News was preached even to the dead") was checked and NOT proposed, on the same ground as 3:19–21 (any gist would adjudicate a reading the text leaves open; covenant #6).

### Decline-overturn proposals

none

### Decisions record

- `drunkenness` (4:3 "drunken binges") — considered and NOT added: catalog mention inside the former-life list, not drunkenness teaching; the pack already anchors 1 Peter 4:3, so search is served. Yields as thin.
- `prayer` / `self-control` (4:7 "be of sound mind, self-controlled, and sober in prayer") — considered and NOT added: single verse carrying both words in passing; neither concept's teaching substance.
- `second-coming` (4:7 "the end of all things is near"; 4:13 "at the revelation of his glory") — considered and NOT added: brief eschatological frame, not coming-teaching; the letter's revelation language is carried contextually by `suffering-for-christ`'s joy-at-revelation span.
- ROUTED (corpus-blocked roster row 16, `stewardship`): 4:10 "as good managers of the grace of God" is the row's own noted 1 Peter text, and the row records "1 Pet 4:10 owned by spiritual-gifts" — recorded against row 16, NOT duplicated as a candidate; the sitting `spiritual-gifts` tag carries the verse, honoring the row's ownership note.
- ROUTED (corpus-blocked roster row 26, `inheritance`): 1 Peter 1:4's "incorruptible and undefiled inheritance" (ch 1 territory, noted here with ch 4's routing ledger for the book) is the row's own recorded NT in-Christ register witness — recorded against row 26 at its ch 1 locus, NOT proposed as a tag or candidate. (Cross-reference: row 26's reason field already names 1 Pet 1:4.)

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc) — 7 tags, ceiling not hit; 1 Peter 4 subdivided (2 sections).

## 1 Peter 5

### Deltas (applied tags)

Adds: 2. Drops: none. Chapter moves 5 → 7 tags (above the soft cap, under the ceiling; every tag independently clears the bar).

- ADD `shepherds-and-the-flock` — "shepherd the flock of God which is among you, exercising the oversight, not under compulsion, but voluntarily; not for dishonest gain, but willingly" (5:2); "When the chief Shepherd is revealed" (5:4). Honest substantial presence: 5:1–4 is the NT's shepherd-the-flock charge, the pack's own anchor (`shepherds-and-the-flock.yaml` anchors 1 Peter 5:2–3), and its lexicon carries "shepherd the flock" — a shepherd-leadership search that missed this chapter would be poorly served.
- ADD `leadership` — "Therefore I exhort the elders among you, as a fellow elder and a witness of the sufferings of Christ" (5:1); "not as lording it over those entrusted to you, but making yourselves examples to the flock" (5:3). Honest substantial presence: 5:1–4 is direct eldership teaching (motive, manner, model), matching the pack's "qualifications of an elder / servant leadership" register; the book doc's own tag-gaps append already staged 1 Peter 5:1–4 for the leadership row. Applied beside `shepherds-and-the-flock` per §11.2 — the shepherd metaphor and the elder office each clear the bar in the same span.
- KEEP `humble-exaltation` — "Humble yourselves therefore under the mighty hand of God, that he may exalt you in due time" (5:6); "for “God resists the proud, but gives grace to the humble.”" (5:5)
- KEEP `resisting-the-devil` — "Your adversary, the devil, walks around like a roaring lion, seeking whom he may devour." (5:8)
- KEEP `suffering-for-christ` — "knowing that your brothers who are in the world are undergoing the same sufferings" (5:9); "after you have suffered a little while" (5:10)
- KEEP `heavenly-reward` — "When the chief Shepherd is revealed, you will receive the crown of glory that doesn’t fade away." (5:4)
- KEEP `benediction` — "But may the God of all grace, who called you to his eternal glory by Christ Jesus, after you have suffered a little while, perfect, establish, strengthen, and settle you." (5:10)

### Anchor-extension candidates

- `leadership` — 1 Peter 5:1–4 — "shepherd the flock of God which is among you, exercising the oversight, not under compulsion, but voluntarily; not for dishonest gain, but willingly; not as lording it over those entrusted to you, but making yourselves examples to the flock." — proposed weight 0.85 (pack anchors Hebrews 13:7, 17 only in these books; this is the staged tag-gaps append made concrete).
- `benediction` — 1 Peter 5:10–11 — "But may the God of all grace, who called you to his eternal glory by Christ Jesus, after you have suffered a little while, perfect, establish, strengthen, and settle you. To him be the glory and the power forever and ever. Amen." — proposed weight 0.8 (pack anchors Hebrews 13:20–21 only in these books).

### Lexicon candidates

- `shepherds-and-the-flock` — proposed terms: "chief shepherd"; "shepherd the flock of god" — queries: "who is the chief shepherd"; "shepherd the flock of God meaning"; "what does the bible say pastors should be like".
- `resisting-the-devil` — proposed term: "roaring lion" — queries: "the devil prowls like a roaring lion"; "devil roaring lion verse"; "why is satan compared to a lion".

### New-concept candidates

none

### Decline-overturn proposals

none

### Decisions record

- `peace-of-god` (5:7 "casting all your worries on him, because he cares for you.") — considered and NOT added as a tag: single verse; `peace-of-god.yaml` already anchors 1 Peter 5:7 and its lexicon carries "cast all your anxiety on him", so the famous verse is served without a tag. REFERENCED, NOT RE-PROPOSED: 1 Peter 5:7 carries a known open weight call in project history — this ledger records the touch and defers entirely to that open call rather than proposing any weight change (per sweep instructions).
- `remembered-anxious-for-nothing` (5:7) — stands NOT added per the book doc's Decisions #5 (Philippians-verse-keyed memory concept; different classic anxiety verse).
- `servanthood` (5:5 mutual subjection) — considered and NOT added: humility material carried by `humble-exaltation`; not servanthood teaching substance.
- Duplication note: 5:4's "chief Shepherd" clause now grounds both `heavenly-reward` (the crown) and `shepherds-and-the-flock` (the Shepherd) — both-tags per §11.2, each on its own half of the verse.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc) — 7 tags, ceiling not hit; 1 Peter 5 subdivided (3 sections).

## Book totals

- Applied-tag deltas: 5 adds (`joy-in-the-lord` ch 1; `priesthood` ch 2; `glory-of-god` ch 4; `shepherds-and-the-flock`, `leadership` ch 5), 0 drops, 31 keeps (chapter totals after deltas: 8/7/7/7/7).
- Anchor-extension candidates: 12 (`salvation` 1:8–9 and 1:3, 23; `resurrection` 1:3; `election-and-predestination` 1:1–2; `sojourners-and-strangers` 2:11; `shepherds-and-the-flock` 2:25; `harmony-with-others` 3:8–9; `the-cross` 3:18; `fear-not` 3:14; `glory-of-god` 4:11; `divine-judgment` 4:17; `leadership` 5:1–4; `benediction` 5:10–11 — 13 entries counting the two `salvation` spans separately).
- Lexicon candidates: 6 entries (`testing` ch 1; `identity-in-christ` ch 2; `godly-marriage` ch 3; `loving-others` ch 4; `shepherds-and-the-flock`, `resisting-the-devil` ch 5).
- New-concept candidates: none (honest-and-empty; the 3:19–21 and 4:6 disputed texts deliberately not minted — covenant #6).
- Decline-overturn proposals: none.
- Ceiling-marked chapters: 1 Peter 1 (8, after add).
- Routed items: 2 roster routings — 1 Peter 4:10 → corpus-blocked roster row 16 (`stewardship`); 1 Peter 1:4 → roster row 26 (`inheritance`) — plus 1 referenced open call: 1 Peter 5:7 casting-anxiety weight call (referenced, not re-proposed).
- Erratum (append-only correction per §9): the ch 2 Deltas list above ends with a stray line "KEEP (implicit, per book-doc history) — no other sitting tags." — it is filler with no tag content; ch 2's delta set is exactly the 1 add + 6 keeps listed above it (7 tags).
- Vocabulary check: all applied ids resolve against the 239-id engine census; adopted-only ids referenced (`new-birth`, `stewardship`, `inheritance`) verified against the canonical adopted-concepts.md (engine-built: no) and none were applied as tags.
